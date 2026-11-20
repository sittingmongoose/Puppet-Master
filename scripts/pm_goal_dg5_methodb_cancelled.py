#!/usr/bin/env python3
"""Replay declared examples through the original Goal run cancellation checkers."""

import argparse
from collections import Counter
import copy
from contextlib import ExitStack
import gzip
import inspect
from itertools import count
import json
import multiprocessing
from pathlib import Path
import shutil
import subprocess
import sys
import time
from unittest.mock import patch
from uuid import UUID

from pm_goal_dg5_methodb_stage3 import (
    each_error, edit_example, errors_list, proof_output, require, sha, test_rules, write,
)


HERE = Path(__file__).resolve().parent
FAMILY = 'goal_run.cancelled'


class BeforeIssue(BaseException):
    """Hand the test the real owner call and its pre-issuance store."""


def fixture(declare, route, directory):
    import pm_goal_dg_r_oracles as original
    import pm_goal_dg_r_projector as projector
    import pm_goal_dg_r_readers as reader
    import pm_goal_dg_r_world as legacy

    edition = route['edition']
    if edition == 'w12b':
        return stop_fixture(route)
    config = {'start': route.get('start', 'started')}
    if route.get('terminal'):
        config['terminal'] = route['terminal']
    if route.get('mutation'):
        config.update(effects='mutation', filesafe=['rollback', 'commit'])
    if route.get('pre_attempt_effect'):
        config['knobs'] = {'pre_attempt_effect': True}
    if edition == 'integrated_original':
        from pm_goal_dg_int_old import World
    elif edition == 'integrated_native':
        from pm_goal_dg_int_cancel import CancelWorld as World
    else:
        require(edition in ('original_profile', 'native_v7'), f'unknown edition {edition}')
        World = legacy.CancelWorld
        config['edition'] = edition
    world = World(config, base=directory)
    publications = ('publish_pointer', 'publish_workflow_head')
    if route['call'] in ('issue_physical', 'build_wrapper', *publications,
                         'prepare_body', 'prepare_control', 'filesafe_invocation'):
        if route['call'] in publications:
            from pm_goal_dg_int_world import S1D01Owner
            cls, method = S1D01Owner, 'publish_head'
        elif route['call'] in ('prepare_body', 'prepare_control'):
            from pm_goal_dg_int_world import S1NativeOwner
            cls = S1NativeOwner if edition == 'integrated_original' else legacy.NativeOwner
            method = route['call']
        elif route['call'] == 'filesafe_invocation':
            cls, method = legacy.CancelWorld, '_filesafe_invocation'
        else:
            cls, method = legacy.PhysOwner, route['call']
        family = declare['row'].removeprefix('dg5/issue/').removesuffix('/schema')
        original_issue = getattr(cls, method)
        captured = []

        def before_issue(owner, *args, **kwargs):
            if method in ('issue_physical', 'build_wrapper'):
                selected = args[0] == family and args[2] is not None
            elif method == '_filesafe_invocation':
                selected = args[2] == route['restore']
            else:
                selected = True
            if selected:
                captured.append((owner, args, kwargs))
                raise BeforeIssue
            return original_issue(owner, *args, **kwargs)

        with patch.object(cls, method, before_issue):
            try:
                world.build()
            except BeforeIssue:
                pass
        require(len(captured) == 1, f'original cancellation did not call {family}')
        owner, args, kwargs = captured[0]
        if family == 'workflow_cancel_result' or route.get('freeze_owner_clock'):
            stamp = world.clock.now()

            def action():
                with patch.object(world.clock, 'now', return_value=stamp):
                    return original_issue(owner, *args, **kwargs)
        else:
            action = lambda: original_issue(owner, *args, **kwargs)
        if route['call'] in ('prepare_body', 'prepare_control', 'build_wrapper'):
            return world, action, (args, kwargs)
        if method == 'publish_head':
            import pm_goal_dg_s_start as start
            families = start.d01_families(owner.edition)
            if route['call'] == 'publish_pointer':
                target = families['pointer'], owner.s1.pointer_key()
            else:
                target = families['workflow_head'], owner.s1.head_key(args[0])
        elif method == '_filesafe_invocation':
            realm, operation, _ = args
            selector = {
                'executor_filesafe_invocation_binding': 'BindingSelector',
                'executor_filesafe_journal_origin': 'OriginSelector',
            }.get(family, 'JournalSelector')
            physical_family = world.seeder.seed('filesafe_consumer', realm + selector)['family_id']
            target = physical_family, world.filesafe.key(physical_family, operation)
        else:
            target = args[0], args[3]
        return world, action, (target, args, kwargs)
    world.build()
    if route['call'] == 'project_checkpoint':
        owner = world.projector_class(world)
        scope = owner.request()['scope']
        if edition == 'integrated_native':
            check_checkpoint_repeated(owner)
        return world, owner.project, (('checkpoints', owner.checkpoint_key(scope)),)
    if route['call'] in ('read_checkpoint', 'checkpoint_wrapper'):
        owner = world.projector_class(world)
        owner.project()
        owner.cutover()
        key = owner.checkpoint_key(owner.request()['scope'])
        wrapper = world.storage.cell('checkpoints', key)['value']
        if route['call'] == 'checkpoint_wrapper':
            logical = owner.read_checkpoint(wrapper)
            return world, lambda: owner.checkpoint_wrapper(copy.deepcopy(logical)), logical
        return world, lambda: owner.read_checkpoint(wrapper), wrapper
    if route['call'] == 'current_started':
        owner = getattr(world, 'projector_class', projector.Projector)(world)
        return world, owner.read_current_started, owner.request()
    consumer = getattr(world, 'consumer_class', reader.Consumer)(world)
    presentation = reader.Presentation(world)
    request = original.request_of(world)
    if route['call'] == 'read_request':
        return world, lambda: consumer.read_retained_native(copy.deepcopy(request), presentation), request
    if route['call'] == 'read_c3_proof':
        return world, lambda: consumer.read_retained_native(request, presentation), request
    if route['call'] == 'read_preserved':
        return world, lambda: consumer.read_preserved(request, presentation), request
    require(route['call'] == 'missing_original', f'unknown owner call {route}')
    presentation.cancellation = None
    return world, lambda: consumer.read_retained_native(request, presentation), (request, None)


def stop_fixture(route):
    from pm_goal_own_c3_w12b_migration import MigrationBoundary
    from pm_goal_own_c3_w12b_roots import CANCEL, Roots
    from pm_goal_own_c_source_oracles import load_originals

    inputs, codec = load_originals()
    world = MigrationBoundary(Roots(), codec, inputs)
    original = copy.deepcopy(world.stop)
    if route['call'] == 'wrap_stop_control':
        key = 'goal_host_stop_control:TEST_ONLY'
        return world, lambda: world.wrap('StorageStopControl', original, key)[0], (key, original)

    require(route['call'] == 'issue_stop_control', 'unknown original host stop call')
    owner = world.owners['host_stop']
    key = 'TEST_ONLY:original-host-stop:methodb'
    reference = CANCEL + '#/$defs/StopControl'

    def issue():
        with patch.object(owner, 'rows', copy.deepcopy(owner.rows)), patch.object(
                owner, 'origins', copy.deepcopy(owner.origins)):
            old_rows, old_origins = set(owner.rows), set(owner.origins)
            try:
                retained = owner.issue(key, 'producer', reference, copy.deepcopy(original))
            except Exception:
                require(set(owner.rows) == old_rows and set(owner.origins) == old_origins,
                        'the refused stop control changed the original owner store')
                raise
            require(set(owner.rows) == old_rows | {key}
                    and set(owner.origins) == old_origins | {retained['origin']['physical_key']},
                    'the stop owner did not retain exactly one record and its origin')
            return codec.storage_unpack(bytes.fromhex(retained['bytes_hex']))

    return world, issue, (key, original)


def root_binding(closure, bank, plain):
    validator = type(plain).__module__ + '.' + type(plain).__qualname__
    schema = json.dumps(plain.schema, sort_keys=True)
    registry = closure._registry_digest(plain)
    ident = closure.root_id((validator, schema, registry, type(bank).__qualname__))
    return ident, dict(bank=type(bank).__module__ + '.' + type(bank).__qualname__,
                       schema=schema, registry_sha256=registry, validator_class=validator)


def scoped_validator(plain, nodes):
    """Keep the original node identities when testing a location-scoped bank.

    A copied reference node cannot use this bank's original identity map.
    Keep the bank's nodes and all its reference handlers in place and wrap the
    assertion functions on a separate validator instance.
    """
    import attrs
    import jsonschema
    import pm_goal_dg5_closure as closure
    import pm_goal_go_schema_closure as go
    import pm_goal_oracle_common as common

    locations = {id(info['node']): location for location, info in nodes.items()}
    classes = {}

    def keyword_wrapper(word, function):
        def validate(validator, expected, value, node):
            location = locations.get(id(node))
            if location is None or word not in go.clauses_of(node):
                yield from function(validator, expected, value, node)
                return
            name = closure.clause_name(node, word)
            guard = closure._guard_for_location(location + '/' + name)
            if guard not in common._SCHEMA_CONTEXT.get()[1]:
                for error in function(validator, expected, value, node):
                    error.oracle_guard = guard
                    yield error
        return validate

    def guarded(original):
        if original in classes.values():
            return original
        if original not in classes:
            keys = go.ASSERT | {'additionalProperties', 'unevaluatedProperties'}
            overrides = {word: keyword_wrapper(word, method) for word, method in original.VALIDATORS.items()
                         if word in keys}
            extended = jsonschema.validators.extend(original, overrides)

            def evolve(instance, **changes):
                prototype = original.evolve(instance, **changes)
                return instantiate(guarded(type(prototype)), prototype)

            extended.evolve = evolve
            classes[original] = extended
        return classes[original]

    def instantiate(cls, prototype):
        return cls(**{field.alias: getattr(prototype, field.name)
                      for field in attrs.fields(type(prototype)) if field.init})

    return instantiate(guarded(type(plain)), plain)


def intent_condition(nodes, rule):
    """Check the two branches that cover the general event-candidate rule."""
    root = rule.split('/$defs/Intent/', 1)[0] + '/$defs/Intent'
    owner = nodes[root]['node']
    branches = owner['properties']['event_candidate']['anyOf']
    condition, = owner['allOf']

    def members(node):
        return {name: value for name, value in node.items() if name != 'x-pm-oracle-id'}

    require(set(('kind', 'event_candidate')) <= set(owner['required'])
            and owner['properties']['kind']['enum'] == ['cancel_nonterminal', 'preserve_terminal']
            and members(condition['if']['properties']['kind']) == {'const': 'cancel_nonterminal'}
            and members(branches[0]) == members(condition['then']['properties']['event_candidate'])
            == {'$ref': '#/$defs/EventCandidateSelection'}
            and members(branches[1]) == members(condition['else']['properties']['event_candidate'])
            == {'type': 'null'}, 'the cancellation intent condition changed')
    return root


def checkpoint_branch_messages(nodes, source, inactive_index):
    branch = source.split('#', 1)[0] + '#/$defs/StorageCheckpoint/properties/content'
    variants = nodes[branch]['node']['oneOf']
    for schema, kind, member in zip(variants, ('inline', 'payload_reference'), ('checkpoint', 'reference'),
                                    strict=True):
        require(schema['type'] == 'object' and schema['additionalProperties'] is False
                and set(schema['required']) == set(schema['properties']) == {'kind', member}
                and schema['properties']['kind']['const'] == kind,
                'checkpoint wrapper branch selection changed')
    inactive = f'{branch}/oneOf/{inactive_index}'
    return {branch + '/oneOf', inactive + '/closed_members', inactive + '/required',
            inactive + '/properties/kind/const'}


def checkpoint_uuid_implication(plain, nodes, name, path, cut):
    from pm_goal_go_schema_closure import locations
    from pm_goal_own_c_oracles import exact_pattern, uuid_string

    source, word = name.rsplit('/', 1)
    node = nodes[source]['node']
    pattern = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
    nested = path == ['content', 'checkpoint', 'storage_instance_id']
    definition = source.split('#', 1)[1]
    require(((nested and definition == '/$defs/LogicalCheckpoint/properties/storage_instance_id')
             or (path == ['storage_instance_id'] and definition in (
                 '/$defs/LogicalCheckpoint/properties/storage_instance_id',
                 '/$defs/StorageCheckpoint/properties/storage_instance_id')))
            and node['pattern'] == '^' + pattern + '$' and node['format'] == 'uuid'
            and node['minLength'] == node['maxLength'] == 36
            and plain.VALIDATORS['pattern'] is exact_pattern
            and plain.format_checker.checkers['uuid'][0] is uuid_string
            and pattern in uuid_string.__code__.co_consts,
            'the checkpoint UUID predicates changed')
    remaining = {'pattern', 'format'}
    remaining.discard(word)
    expected = {source + '/' + keyword for keyword in remaining}
    if nested:
        expected |= checkpoint_branch_messages(nodes, source, inactive_index=1)
    require(locations(cut) == expected,
            'the exact matching UUID rules must still refuse')
    return dict(source=source, covering_rules=sorted(remaining),
                predicates=[dict(name=method.__name__, line=method.__code__.co_firstlineno,
                                 sha256=sha(Path(method.__code__.co_filename)))
                            for method in (exact_pattern, uuid_string)],
                premise='The two full matches define the same UUID grammar and require exactly 36 characters.')


def checkpoint_payload_width(plain, nodes, name, path, cut):
    from pm_goal_go_schema_closure import locations
    from pm_goal_own_c_oracles import exact_pattern

    source, word = name.rsplit('/', 1)
    node = nodes[source]['node']
    covering = source + '/pattern'
    require(path == ['content', 'reference', 'blake3']
            and source.endswith('#/$defs/PayloadRef/properties/blake3')
            and word in ('minLength', 'maxLength') and node['minLength'] == node['maxLength'] == 64
            and node['pattern'] == '^[0-9a-f]{64}$' and plain.VALIDATORS['pattern'] is exact_pattern
            and locations(cut) == {covering} | checkpoint_branch_messages(nodes, source, inactive_index=0),
            'the checkpoint payload width predicates changed')
    return dict(source=source, covering_rule=covering,
                predicate_sha256=sha(Path(exact_pattern.__code__.co_filename)),
                premise='The full hexadecimal match requires exactly 64 characters.')


def append_acknowledgment_nonempty(plain, nodes, name, path, cut):
    from pm_goal_go_schema_closure import locations
    from pm_goal_own_c_oracles import utc

    source, word = name.rsplit('/', 1)
    node = nodes[source]['node']
    covering = source + '/format'
    expected = {covering}
    if path[1:2] == ['append_receipt']:
        result, = [where for where in nodes if where.endswith('#/$defs/Result')]
        schema = nodes[result]['node']
        require([arm['$ref'] for arm in schema['oneOf']] ==
                ['#/$defs/CancelledResult', '#/$defs/PreservedResult'],
                'the Workflow cancel result alternatives changed')
        preserved = result.removesuffix('/Result') + '/PreservedResult'
        expected.update((result + '/oneOf', preserved + '/closed_members',
                         preserved + '/required', preserved + '/properties/kind/const'))
    require(path in (['record', 'append_receipt', 'acknowledged_at_utc'],
                     ['record', 'first_append_receipt', 'acknowledged_at_utc'],
                     ['result', 'append_receipt', 'acknowledged_at_utc'],
                     ['record', 'original_publication', 'first_append_receipt', 'acknowledged_at_utc'],
                     ['value', 'event_commitments', 0, 'original_full_value_result',
                      'first_append_receipt', 'acknowledged_at_utc'])
            and source.endswith('#/$defs/AppendReceipt/properties/acknowledged_at_utc')
            and word == 'minLength' and node[word] == 1 and node['format'] == 'date-time'
            and node['type'] == 'string' and plain.format_checker.checkers['date-time'][0] is utc
            and not utc('') and utc('2026-11-05T09:00:00Z')
            and locations(cut) == expected,
            'the original acknowledgment time must still refuse the empty string')
    return dict(source=source, covering_rule=covering, validator=utc.__name__,
                validator_line=utc.__code__.co_firstlineno, validator_sha256=sha(Path(utc.__code__.co_filename)),
                premise='The required full UTC time match always consumes at least one character.')


def process_role_or_barrier_enum(nodes, name, path, cut, covering):
    from pm_goal_go_schema_closure import locations

    pairs = {
        ('value', 'invocation', 'role'): ('DispatchInvocation', 'ProcessInvocation', 'process'),
        ('invocation', 'role'): ('DispatchInvocation', 'FileSafeInvocation', 'filesafe'),
        ('record', 'first_append_receipt', 'durability_class'): ('AppendReceipt', 'FirstBarrier', 'barrier'),
    }
    require(tuple(path) in pairs, 'unexpected enumeration path')
    base, joined, fixed = pairs[tuple(path)]
    field = path[-1]
    enum_source, keyword = name.rsplit('/', 1)
    const_source = covering.removesuffix('/const')
    require(keyword == 'enum' and enum_source.endswith(f'#/$defs/{base}/properties/{field}')
            and covering.endswith(f'#/$defs/{joined}/allOf/1/properties/{field}/const'),
            'the conjunctive enumeration rule locations changed')
    owner = const_source.split('/allOf/', 1)[0]
    inherited, narrowed = nodes[owner]['node']['allOf']
    enum_info, const_info = nodes[enum_source], nodes[const_source]
    require(inherited['$ref'].endswith(f'#/$defs/{base}')
            and narrowed['properties'][field] == const_info['node']
            and const_info['node']['const'] == fixed and fixed in enum_info['node']['enum']
            and all({(reach['ipath'], bool(reach['ctx'])) for reach in entry['reach']} ==
                    {(tuple(path), False)} for entry in (enum_info, const_info))
            and locations(cut) == {covering}, 'the same field must also satisfy its constant rule')
    return dict(source=owner + '/allOf', covering_rule=covering,
                premise='Both rules apply together on every path to this field. The fixed value belongs to the enumeration.')


def scope_proof_implication(nodes, name, path, cut):
    from pm_goal_go_schema_closure import locations

    location, word = name.rsplit('/', 1)
    resource = location.split('#', 1)[0]
    proof = resource + '#/$defs/WorkflowScopeProof'
    schema = nodes[proof]['node']
    if path == ['record', 'original_issuer', 'owner_method']:
        source = proof + '/properties/original_issuer'
        inherited, fixed = nodes[source]['node']['allOf']
        value = fixed['properties']['owner_method']['const']
        covering = source + '/allOf/1/properties/owner_method/const'
        require(location == resource + '#/$defs/Issuer/properties/owner_method'
                and word in ('type', 'minLength') and inherited['$ref'] ==
                'https://puppetmaster.local/proposals/goal_workflow_cancel_coordinator_metadata.v1.schema.json#/$defs/Issuer'
                and 'original_issuer' in schema['required']
                and 'owner_method' in nodes[resource + '#/$defs/Issuer']['node']['required']
                and nodes[location]['node']['type'] == 'string' and nodes[location]['node']['minLength'] == 1
                and type(value) is str and len(value) >= 1
                and locations(cut) == {covering}, 'the fixed scope-proof issuer rule changed')
        return dict(source=source, covering_rule=covering,
                    premise='The required issuer method is fixed to one nonempty string.')

    condition, = schema['allOf']
    field = 'preserved_terminal_status'
    union = proof + '/properties/' + field
    empty, terminal = nodes[union]['node']['oneOf']
    when = condition['if']['properties']['d06_disposition']['const']
    then = condition['then']['properties'][field]
    else_ = condition['else']['properties'][field]
    require(path == ['record', field] and name == union + '/oneOf'
            and {'d06_disposition', field} <= set(schema['required'])
            and schema['properties']['d06_disposition']['enum'] == ['cancelled_from_nonterminal', 'terminal_preserved']
            and when == 'cancelled_from_nonterminal' and empty['type'] == then['type'] == 'null'
            and terminal['enum'] == else_['enum']
            and all(type(value) is str for value in terminal['enum']),
            'the scope-proof disposition alternatives changed')
    covering = proof + '/allOf/0/then/properties/' + field + '/type'
    require(locations(cut) == {covering}, 'the original disposition condition must still refuse')
    return dict(source=proof + '/allOf/0', covering_rule=covering,
                premise='The required disposition selects one of the same two disjoint status alternatives.')


def origin_afterimages_implication(nodes, name, path, cut):
    from pm_goal_go_schema_closure import locations

    location, word = name.rsplit('/', 1)
    source = location.split('#', 1)[0] + '#/$defs/'
    owner = nodes[source + 'Origin']['node']
    method = 'owner.workflow.executor_cancel.'
    prepare = method + 'prepare_disposition.v3'
    publish = method + 'publish_disposition.v3'
    condition, = owner['allOf']
    variants = owner['properties']['afterimages']['oneOf']
    require(path in (['origin', 'afterimages'], ['record', 'afterimages']) and word == 'oneOf'
            and location == source + 'Origin/properties/afterimages'
            and {'issuer_method', 'afterimages'} <= set(owner['required'])
            and owner['properties']['issuer_method']['enum'] == [prepare, publish]
            and condition['if']['properties']['issuer_method']['const'] == prepare
            and [variant['$ref'] for variant in variants] == [
                condition[branch]['properties']['afterimages']['$ref'] for branch in ('then', 'else')]
            == ['#/$defs/PrepareAfterimages', '#/$defs/PublishAfterimages'],
            'the Workflow cancellation origin alternatives changed')
    for name_, kind in (('PrepareAfterimages', 'prepare'), ('PublishAfterimages', 'publish')):
        schema = nodes[source + name_]['node']
        require(schema['type'] == 'object' and 'kind' in schema['required']
                and schema['properties']['kind']['const'] == kind,
                'the afterimages must be disjoint by their required kind')
    covering = source + 'PublishAfterimages/type'
    require(locations(cut) == {covering}, 'the original published afterimages type must still refuse')
    return dict(source=source + 'Origin/allOf/0', covering_rule=covering,
                premise='The required issuer method selects exactly one of the two disjoint afterimage forms.')


def binding_revision_implication(nodes, name, path, cut):
    from pm_goal_go_schema_closure import locations

    owner = name.split('#', 1)[0] + '#/$defs/BindingRevision'
    schema = nodes[owner]['node']
    branch, = schema['allOf']
    require(path == ['record', 'active_run_ref']
            and {'associations', 'active_run_ref'} <= set(schema['required'])
            and schema['properties']['associations']['type'] == 'array'
            and branch['if']['properties']['associations']['maxItems'] == 0,
            'the checked binding revision branch must be selected by the required association array')

    def keywords(node):
        return {key: value for key, value in node.items() if key != 'x-pm-oracle-id'}

    path_schema = schema['properties']['active_run_ref']
    string, null = path_schema['oneOf']
    require(keywords(path_schema).keys() == {'oneOf'}
            and keywords(string) == keywords(branch['else']['properties']['active_run_ref'])
            == {'type': 'string', 'minLength': 1}
            and keywords(null) == keywords(branch['then']['properties']['active_run_ref']) == {'type': 'null'},
            'the conditional and the field must enforce the same disjoint run-reference alternatives')
    union = owner + '/properties/active_run_ref/oneOf'
    selected = owner + '/allOf/0/else/properties/active_run_ref'
    if name == union:
        covering = selected + '/type'
        require(locations(cut) == {covering}, 'the bound run reference type must still refuse')
        return dict(source=owner + '/allOf/0', covering_rule=covering,
                    premise='The required association array chooses exactly one of the same disjoint reference types.')
    checks = {
        selected + '/minLength': {union, union + '/0/minLength', union + '/1/type'},
        union + '/0/minLength': {selected + '/minLength'},
    }
    require(name in checks and locations(cut) == checks[name], 'only the duplicate run reference constraint may refuse')
    return dict(source=owner + '/allOf/0', covering_rules=sorted(checks[name]),
                premise='Both checks apply the same nonempty string constraint when an association is present.')


def binding_selection_implication(nodes, name, path, cut):
    from pm_goal_go_schema_closure import locations

    location, word = name.rsplit('/', 1)
    anchor = location.split('#', 1)[0] + '#/$defs/BindingSelection'
    owner = nodes[anchor]['node']
    conditions = owner['allOf']
    require(len(path) == 2 and path[0] == 'record' and path[1] in (
        'actual_active_run_ref', 'original_pending_binding_candidate_sha256', 'association_count'),
        'unexpected binding-selection implication field')
    field = path[1]
    direct = anchor + '/properties/' + field
    disposition = 'no_execution_association'
    require({'disposition', field, 'original_pending_binding_operation_id'} <= set(owner['required'])
            and owner['properties']['disposition']['enum'] ==
            [disposition, 'bound_plan_requires_owner_settlement', 'workflow_requires_owner_disposition']
            and conditions[0]['if']['properties']['disposition']['const'] == disposition
            and conditions[1]['if']['properties']['original_pending_binding_operation_id']['type'] == 'null',
            'the binding selection conditions changed')
    if field == 'association_count':
        fixed = [conditions[0][branch]['properties'][field]['const'] for branch in ('then', 'else')]
        covering = anchor + '/allOf/0/then/properties/association_count/const'
        require(location == direct and word in ('type', 'minimum') and fixed == [0, 1]
                and owner['properties'][field]['type'] == 'integer'
                and owner['properties'][field]['minimum'] == 0 and locations(cut) == {covering},
                'the independent association count constant must still refuse')
        return dict(source=anchor + '/allOf/0', covering_rule=covering,
                    premise='Each disposition fixes the count to a nonnegative integer.')

    index = 0 if field == 'actual_active_run_ref' else 1
    branch = conditions[index]
    non_null, null = owner['properties'][field]['oneOf']

    def keywords(node):
        return {key: value for key, value in node.items() if key != 'x-pm-oracle-id'}

    require(keywords(non_null) == keywords(branch['else']['properties'][field])
            and keywords(null) == keywords(branch['then']['properties'][field]) == {'type': 'null'}
            and non_null['type'] == 'string', 'the selected field has different schema alternatives')
    source = f'{anchor}/allOf/{index}'
    else_field = source + '/else/properties/' + field
    covering = else_field + '/type'
    if location == direct and word == 'oneOf':
        require(locations(cut) == {covering}, 'the selected string type must still refuse')
        return dict(source=source, covering_rule=covering,
                    premise='The required selector chooses one of the same two disjoint alternatives.')

    union = direct + '/oneOf'
    require(word in ('minLength', 'pattern') and word in non_null
            and location in (else_field, union + '/0'), 'unexpected duplicate rule')
    if location == else_field:
        remaining = {union, union + '/0/' + word, union + '/1/type'}
    else:
        remaining = {else_field + '/' + word}
    require(locations(cut) == remaining, 'the other copy of the selected string rule must still refuse')
    return dict(source=source, covering_rules=sorted(remaining),
                premise='The string alternative and the selected branch impose the same rule on this field.')


def filesafe_selector_implication(nodes, name, path, cut):
    from pm_goal_go_schema_closure import locations

    location, word = name.rsplit('/', 1)
    defs = location.split('#', 1)[0] + '#/$defs/'
    base = defs + 'SourceSelector'
    owner = defs + 'FileSafeJournalOrigin'
    role, field = path
    require(role in ('binding', 'prior_origin') and field in ('family_id', 'schema_id', 'schema_version')
            and location == base + '/properties/' + field and word in ('type', 'minLength'),
            'unexpected original FileSafe selector field')
    source = nodes[base]['node']
    base_field = source['properties'][field]
    require(field in source['required'] and base_field['type'] == 'string' and base_field['minLength'] == 1
            and {reach['ipath'] for reach in nodes[location]['reach']} ==
            {('binding', field), ('prior_origin', field), ('resolved_original_result', field)},
            'the original selector now has other uses')
    journal = nodes[owner]['node']['properties']
    require(journal['binding']['$ref'].endswith('#/$defs/BindingSelector')
            and all(journal[key]['anyOf'][0]['$ref'].endswith('#/$defs/OriginSelector')
                    for key in ('prior_origin', 'resolved_original_result')),
            'the journal origin selects different original selectors')
    fixed = {}
    for selected_role, selected_type in (('binding', 'BindingSelector'), ('prior_origin', 'OriginSelector')):
        inherited, narrowed = nodes[defs + selected_type]['node']['allOf']
        value = narrowed['properties'][field]['const']
        require(inherited['$ref'].endswith('#/$defs/SourceSelector') and type(value) is str and len(value) >= 1,
                'a FileSafe selector no longer fixes a nonempty identifier')
        fixed[selected_role] = f'{defs}{selected_type}/allOf/1/properties/{field}/const'
    covering = fixed[role]
    expected = {covering}
    if role == 'prior_origin':
        union = owner + '/properties/prior_origin/anyOf'
        expected.update((union, union + '/1/type'))
    require(locations(cut) == expected, 'the independent fixed FileSafe selector rule must still refuse')
    return dict(source=owner, covering_rule=covering,
                premise='Every reachable selector role fixes this field to a nonempty string.')


def safestop_settlement_selector_implication(nodes, name, path, control, cut):
    from pm_goal_go_schema_closure import locations

    source, word = name.rsplit('/', 1)
    defs = source.split('#', 1)[0] + '#/$defs/'
    field = path[-1]
    require(path == ['value', 'settlements', 0, 'original_result', field]
            and field in ('family_id', 'schema_id', 'schema_version')
            and word in ('type', 'minLength') and source == defs + 'SourceSelector/properties/' + field,
            'the FileSafe settlement selector field changed')
    base = nodes[defs+'SourceSelector']['node']
    rule = base['properties'][field]
    origin = defs + 'OriginSelector'
    inherited, fixed = nodes[origin]['node']['allOf']
    value = fixed['properties'][field]['const']
    require(field in base['required'] and rule['type'] == 'string' and rule['minLength'] == 1
            and inherited['$ref'].endswith('#/$defs/SourceSelector')
            and type(value) is str and len(value) >= rule['minLength'],
            'the FileSafe origin must already fix a nonempty identifier')

    commitment, = [where for where in nodes if where.endswith('#/$defs/SettlementCommitment')]
    entry = nodes[commitment]
    filesafe, process = (arm['properties'] for arm in entry['node']['oneOf'])
    require(filesafe['kind']['const'] == 'filesafe_original_resolution'
            and process['kind']['const'] == 'process_original_shutdown'
            and control['value']['settlements'][0]['kind'] == filesafe['kind']['const']
            and all(entry['resolver'].lookup(filesafe[role]['$ref']).contents is nodes[origin]['node']
                    for role in ('original_result', 'original_origin'))
            and {r['ipath'] for r in nodes[source]['reach']} ==
                {('value', 'settlements', '#', role, field) for role in ('original_result', 'original_origin')},
            'the source selector must appear only in the FileSafe settlement arm')
    covering = origin + '/allOf/1/properties/' + field + '/const'
    other_ref = entry['resolver'].lookup(process['original_result']['$ref']).contents
    other_selector, = [where for where, info in nodes.items() if info['node'] is other_ref]
    other_role, = [where for where in nodes if where.endswith('#/$defs/ProcessInvocation/allOf/1/properties/role')]
    require(locations(cut) == {covering, commitment + '/oneOf', commitment + '/oneOf/1/properties/kind/const',
                                other_selector + '/properties/' + field + '/' + word, other_role + '/const'},
            'the FileSafe constant and the incompatible Process branch must still refuse')
    return dict(source=commitment, covering_rule=covering,
                premise='Every reachable FileSafe settlement selector fixes this field to a nonempty string.')


def mutation_afterimages_implication(nodes, name, path, control, cut):
    from pm_goal_go_schema_closure import locations

    defs = name.split('#', 1)[0] + '#/$defs/'
    owner = defs + 'WorkflowMutationOrigin'
    schema = nodes[owner]['node']
    prefix = 'owner.executor.workflow_source.'
    methods = [prefix + suffix for suffix in ('enroll_workflow_birth.v3', 'update_workflow.v3', 'begin_coverage.v3')]
    variants = ['WorkflowBirthAfterimages', 'WorkflowUpdateAfterimages', 'CoverageAfterimages']
    refs = ['#/$defs/' + variant for variant in variants]
    conditions = schema['allOf']
    require(path == ['record', 'afterimages'] and name == owner + '/properties/afterimages/oneOf'
            and {'method', 'afterimages'} <= set(schema['required'])
            and schema['properties']['method']['enum'] == methods
            and [part['if']['properties']['method']['const'] for part in conditions] == methods
            and [part['then']['properties']['afterimages']['$ref'] for part in conditions] ==
            [part['$ref'] for part in schema['properties']['afterimages']['oneOf']] == refs,
            'the Workflow mutation method selects different afterimages')
    property_sets = set()
    for variant in variants:
        branch = nodes[defs + variant]['node']
        properties = frozenset(branch['properties'])
        require(branch['type'] == 'object' and branch['additionalProperties'] is False
                and set(branch['required']) == properties, 'the afterimages are no longer closed required shapes')
        property_sets.add(properties)
    require(len(property_sets) == len(variants), 'the afterimage shapes are no longer disjoint')
    covering = defs + variants[methods.index(control['record']['method'])] + '/type'
    require(locations(cut) == {covering}, 'the independently selected afterimage type must still refuse')
    return dict(source=owner + '/allOf', covering_rule=covering,
                premise='Each allowed method chooses one distinct closed afterimage shape with every field required.')


def workflow_transition_implication(plain, nodes, name, path, control, cut):
    from jsonschema import Draft202012Validator
    from pm_goal_go_schema_closure import locations

    defs = name.split('#', 1)[0] + '#/$defs/'
    commitment = defs + 'TransitionCommitment'
    update = defs + 'WorkflowUpdate'
    transition = nodes[commitment]['node']
    owner = nodes[update]['node']
    if path == ['record', 'transition', 'before']:
        union = commitment + '/properties/before/anyOf'
        arms = transition['properties']['before']['anyOf']
        condition = transition['allOf'][0]
        selected = condition['then']['properties']['before']
        alternative = condition['else']['properties']['before']
        covering = commitment + '/allOf/0/then/properties/before/type'
        require(name in (union, union + '/1/type') and {'before', 'rule'} <= set(transition['required'])
                and condition['if']['properties']['rule']['const'] == 'activation_begin'
                and arms[0]['$ref'] == alternative['$ref'] == '#/$defs/BodyIssuanceCommitment'
                and arms[1]['type'] == selected['type'] == 'null' and locations(cut) == {covering},
                'the activation condition selects different before commitments')
        return dict(source=commitment + '/allOf/0', covering_rule=covering,
                    premise='The required rule selects the same null or original body commitment as the alternatives.')

    def members(node):
        return set(node) - {'x-pm-oracle-id'}

    require({'transition', 'cause'} <= set(owner['required']) and 'rule' in transition['required']
            and owner['properties']['transition']['$ref'] == '#/$defs/TransitionCommitment'
            and transition['properties']['rule']['$ref'] == '#/$defs/BoundTransitionRule',
            'the Workflow update transition is bound differently')
    rules = nodes[defs + 'BoundTransitionRule']['node']['enum']
    causes = owner['properties']['cause']['enum']
    cases = {}
    for index, clause in enumerate(owner['allOf']):
        probe = clause['if']
        condition = probe['properties']['transition']
        selector = condition['properties']['rule']
        chosen = clause['then']['properties']['cause']
        require(members(clause) == {'if', 'then'} and members(probe) == members(condition) == {'properties'}
                and set(probe['properties']) == {'transition'} and set(condition['properties']) == {'rule'}
                and members(selector) == members(chosen) == {'const'}
                and selector['const'] not in cases and chosen['const'] in causes,
                'the Workflow update cause condition changed')
        cases[selector['const']] = (chosen['const'], f'{update}/allOf/{index}/then/properties/cause/const')
    require(set(cases) == set(rules), 'each transition must select its own allowed cause')
    if name == update + '/properties/cause/enum' and path == ['record', 'cause']:
        _, covering = cases[control['record']['transition']['rule']]
        require(locations(cut) == {covering}, 'the selected cause constant must still refuse')
        return dict(source=update + '/allOf', covering_rule=covering,
                    premise='Every permitted transition fixes the cause to one member of its enumeration.')

    require(name == commitment + '/type' and path == ['record', 'transition']
            and transition['type'] == 'object'
            and plain.VALIDATORS['properties'] is Draft202012Validator.VALIDATORS['properties']
            and len({value for value, _ in cases.values()}) > 1,
            'the target must be an object or activate contradictory cause rules')
    remaining = {source for value, source in cases.values() if value != control['record']['cause']}
    require(locations(cut) == remaining, 'the exact contradictory cause checks must still refuse')
    return dict(source=update + '/allOf', covering_rules=sorted(remaining),
                premise='With a nonobject transition all property-only conditions succeed, requiring incompatible causes.')


def execution_binding_implication(nodes, name, path, cut):
    from pm_goal_go_schema_closure import locations

    location, word = name.rsplit('/', 1)
    owner = location.split('#', 1)[0] + '#/$defs/ExecutionBinding'
    schema = nodes[owner]['node']
    require(len(path) == 2 and path[0] == 'original_execution_binding', 'unexpected execution binding path')
    field = path[1]
    branch, = schema['allOf']
    require({'kind', field} <= set(schema['required'])
            and schema['properties']['kind']['enum'] == ['no_bound_plan', 'bound_plan']
            and branch['if']['properties']['kind']['const'] == 'bound_plan',
            'the binding plan selector changed')
    non_null, null = schema['properties'][field]['oneOf']
    selected = branch['then']['properties'][field]

    def keywords(node):
        return {key: value for key, value in node.items() if key != 'x-pm-oracle-id'}

    require(keywords(non_null) == keywords(selected) and non_null['type'] in ('string', 'integer')
            and keywords(null) == {'type': 'null'}, 'the selected bound-plan predicate changed')
    source = owner + '/allOf/0'
    then = source + '/then/properties/' + field
    union = owner + '/properties/' + field + '/oneOf'
    if location != then:
        other = branch['else']['properties'][field]
        require(keywords(other) == keywords(null), 'the no-plan field must satisfy the same null alternative')
    if name == union:
        covering = then + '/type'
        require(locations(cut) == {covering}, 'the selected bound-plan type must still refuse')
        return dict(source=source, covering_rule=covering,
                    premise='The required kind chooses a disjoint alternative already enforced by the field schema.')

    require(word in ('minLength', 'minimum', 'pattern') and word in non_null
            and location in (then, union + '/0'), 'unexpected duplicate bound-plan assertion')
    if location == then:
        remaining = {union, union + '/0/' + word, union + '/1/type'}
    else:
        remaining = {then + '/' + word}
    require(locations(cut) == remaining, 'the other copy of the bound-plan rule must still refuse')
    return dict(source=source, covering_rules=sorted(remaining),
                premise='The bound-plan field is subject to the same assertion in both locations.')


def owner_settlement_implication(nodes, name, path, cut):
    from pm_goal_go_schema_closure import locations

    require(path[:2] == ['record', 'original_owner_settlement'], 'the settlement field path changed')
    owner = name.split('#', 1)[0] + '#/$defs/OwnerSettlement'
    binding = name.split('#', 1)[0] + '#/$defs/ExecutionBinding'
    schema = nodes[owner]['node']
    branch, = schema['allOf']
    require('kind' in schema['required'] and schema['properties']['kind']['enum'] ==
            ['none_required', 'bound_plan_settled']
            and branch['if']['properties']['kind']['const'] == 'none_required',
            'the settlement kind must select the original two branches')
    source = owner + '/allOf/0'
    if path[2:] == ['original_execution_binding', 'kind']:
        kind_rule = binding + '/properties/kind/enum'
        selected = source + '/then/properties/original_execution_binding/properties/kind/const'
        ref = schema['properties']['original_execution_binding']['$ref']
        binding_schema = nodes[owner]['resolver'].lookup(ref).contents
        require(name == kind_rule and 'original_execution_binding' in schema['required']
                and binding_schema is nodes[binding]['node'] and 'kind' in binding_schema['required']
                and nodes[binding]['node']['properties']['kind']['enum'] == ['no_bound_plan', 'bound_plan']
                and all(branch[side]['properties']['original_execution_binding']['properties']['kind']['const'] == kind
                        for side, kind in (('then', 'no_bound_plan'), ('else', 'bound_plan')))
                and locations(cut) == {selected}, 'the settlement must enforce an allowed execution binding kind')
        return dict(source=source, covering_rule=selected,
                    premise='Both settlement branches require a binding kind accepted by the enumeration.')
    if path[2:3] == ['original_execution_binding']:
        return execution_binding_implication(nodes, name, path[2:], cut)

    require(len(path) == 3, 'the settlement proof expects a single field')
    field = path[2]
    require(field in schema['required'], 'the settlement field must be required by both branches')

    def keywords(node):
        return {key: value for key, value in node.items() if key != 'x-pm-oracle-id'}

    prop = schema['properties'][field]
    present, absent = prop['oneOf']
    require(keywords(prop).keys() == {'oneOf'}
            and keywords(present) == keywords(branch['else']['properties'][field])
            and present['type'] == 'string'
            and keywords(absent) == keywords(branch['then']['properties'][field]) == {'type': 'null'},
            'the original settlement branches must apply the same disjoint field schemas')
    union = owner + '/properties/' + field + '/oneOf'
    selected = source + '/else/properties/' + field
    if name == union:
        covering = selected + '/type'
        require(locations(cut) == {covering}, 'the selected settlement field type must still refuse')
        return dict(source=source, covering_rule=covering,
                    premise='The required kind chooses one of two disjoint field schemas already enforced in the field.')
    word = name.rsplit('/', 1)[1]
    checks = {
        selected + '/' + word: {union, union + '/0/' + word, union + '/1/type'},
        union + '/0/' + word: {selected + '/' + word},
    }
    require(word in ('minLength', 'pattern') and word in present
            and name in checks and locations(cut) == checks[name],
            'the same original settlement field constraint must still refuse')
    return dict(source=source, covering_rules=sorted(checks[name]),
                premise='Both locations apply the same string constraint when the settlement field is present.')


def rule_path(document, path):
    prefix = path[:2] if path[:2] == ['content', 'checkpoint'] else []
    offset = len(prefix)
    if path[offset:offset + 2] == ['generations', 'current_generation_id']:
        logical = document['content']['checkpoint'] if prefix else document
        generation = logical['current_generation_id']
        if generation is None:
            require(len(logical['generations']) == 1, 'the staged checkpoint needs exactly one generation')
            generation, = logical['generations']
        return [*prefix, 'generations', generation, *path[offset + 2:]]
    return path


def literal_rules(plain, bank, accepted, ident, ids, examples, disabled_check, scoped):
    import pm_goal_dg5_closure as closure
    import pm_goal_go_schema_closure as go

    if scoped:
        nodes, walked = closure._scoped_census(plain, ident, bank, closure._realm_location)
        validator = scoped_validator(plain, nodes)
    else:
        validator = closure.closure_validator(plain, ident, bank)
        nodes, walked = closure._clause_inventory(validator)
        if plain.schema['$ref'].endswith(('#/$defs/FileSafeJournalOrigin', '#/$defs/TerminationResultPhysical')):
            # A not error prints its child schema. Keep the original node so
            # the message retains the exact schema text.
            locations = {id(plain._resolver.lookup(location).contents): location
                         for location in nodes if location != '#'}
            nodes, walked = closure._scoped_census(
                plain, ident, bank, lambda _bank, node: locations.get(id(node)))
            validator = scoped_validator(plain, nodes)
    if disabled_check == 'inventory':
        examples = dict(list(examples.items())[1:])
    require(walked == ids,
            f"{ident}: installed rule list {closure._clause_inventory_pin(walked)['sha256']} "
            f"differs from pinned rule list {closure._clause_inventory_pin(ids)['sha256']}")
    require(set(walked) == set(examples), 'declared test examples differ from exact inventory')
    require(not list(plain.iter_errors(accepted)) and not go.errors_of(validator, accepted),
            'original and instrumented validators must both accept the valid document')
    results = {}
    for name in ids:
        example = examples[name]
        path = rule_path(accepted, example['path'])
        control = accepted
        if 'control' in example:
            change = example['control']
            control = edit_example(go, control, rule_path(control, change['path']), change)
        for change in example.get('controls', ()):
            control = edit_example(go, control, change['path'], change)
        require(not list(plain.iter_errors(control)) and not go.errors_of(validator, control),
                f'{name}: declared branch control refused')
        guard = closure._guard_for_location(name)
        disabled = () if disabled_check == 'rule' else {guard}
        if 'selector_messages' in example:
            cut = go.errors_of(validator, control, disabled)
            restored = go.errors_of(validator, control)
            require(cut and go.locations(cut) == set(example['selector_messages']) and not restored,
                    f'{name}: expected exact conditional messages')
            results[name] = dict(cls='SELECTOR_OR_NEGATED', control=control, cut=errors_list(cut),
                                 restored=errors_list(restored), source=name)
            continue
        if example.get('intent_selector'):
            root = intent_condition(nodes, name)
            require(name == root + '/allOf/0/if/properties/kind/const'
                    and control['record']['kind'] == 'preserve_terminal' and control['record']['event_candidate'] is None,
                    'the intent selector requires the accepted terminal-preservation example')
            cut = go.errors_of(validator, control, disabled)
            restored = go.errors_of(validator, control)
            require(len(cut) == 1 and cut[0].validator == 'type'
                    and list(cut[0].absolute_path) == ['record', 'event_candidate'] and not restored,
                    'disabling the selector must activate the original event candidate requirement')
            results[name] = dict(cls='SELECTOR_OR_NEGATED', control=control, cut=errors_list(cut),
                                 restored=errors_list(restored), source=root + '/allOf/0')
            continue
        if example.get('vacuous'):
            location, word = name.rsplit('/', 1)
            node = nodes[location]['node']
            require(word == 'minItems' and node[word] == 0 and go.get(control, path) == [],
                    f'{name}: vacuous minimum premise changed')
            invalid = go.apply(control, path, False)
            before = errors_list(list(plain.iter_errors(invalid)))
            cut = errors_list(go.errors_of(validator, invalid, disabled))
            restored = errors_list(go.errors_of(validator, invalid))
            require(before and before == cut == restored,
                    f'{name}: a zero minimum must leave the array type refusal intact')
            results[name] = dict(cls='VACUOUS', source=name, control=control, wrong_type=invalid,
                                 before=before, cut=cut, restored=restored,
                                 premise='A JSON array has at least zero items. The keyword ignores other types.')
            continue
        edit_path = path
        if 'edit_path' in example:
            edit_path = example['edit_path']
            require(edit_path == ['record', 'original_owner_settlement', 'original_execution_binding']
                    and path == [*edit_path, 'kind']
                    and '/OwnerSettlement/allOf/0/' in name
                    and name.endswith('/original_execution_binding/properties/kind/const'),
                    'the settlement kind example needs the opposite complete binding')
        invalid = edit_example(go, control, edit_path, example)
        actual = errors_list(list(plain.iter_errors(invalid)))
        before = go.errors_of(validator, invalid)
        require(any(getattr(error, 'oracle_guard', None) == guard and list(error.absolute_path) == path
                    for error in each_error(before)) and actual == errors_list(before),
                f'{name}: expected exact original validation message at {path}')
        cut = go.errors_of(validator, invalid, disabled)
        restored = errors_list(go.errors_of(validator, invalid))
        require(actual == restored and all(getattr(error, 'oracle_guard', None) != guard
                                           for error in each_error(cut)),
                f'{name}: disabling and restoring that one rule failed')
        record = dict(cls='KILLED', control=control, invalid=invalid, before=actual,
                      cut=errors_list(cut), restored=restored)
        if example.get('intent_implication'):
            root = intent_condition(nodes, name)
            event_candidate = root + '/properties/event_candidate/anyOf'
            covering = root + '/allOf/0/else/properties/event_candidate/type'
            require(name in (event_candidate, event_candidate + '/1/type')
                    and path == ['record', 'event_candidate'] and control['record']['kind'] == 'preserve_terminal'
                    and len(cut) == 1 and go.locations(cut) == {covering},
                    'only the independent terminal-preservation type rule must still refuse')
            record.update(cls='COVERED_LATER', implication=dict(
                source=root + '/allOf/0', covering_rule=covering,
                premise='The required kind selects either the original event selector or null. Those are the same two alternatives.'))
        elif example.get('checkpoint_uuid'):
            record.update(cls='COVERED_LATER',
                          implication=checkpoint_uuid_implication(plain, nodes, name, path, cut))
        elif example.get('checkpoint_payload_width'):
            record.update(cls='COVERED_LATER',
                          implication=checkpoint_payload_width(plain, nodes, name, path, cut))
        elif example.get('append_acknowledgment_nonempty'):
            record.update(cls='COVERED_LATER',
                          implication=append_acknowledgment_nonempty(plain, nodes, name, path, cut))
        elif example.get('process_role_or_barrier_enum'):
            record.update(cls='COVERED_LATER', implication=process_role_or_barrier_enum(
                nodes, name, path, cut, example['process_role_or_barrier_enum']))
        elif example.get('scope_proof_implication'):
            record.update(cls='COVERED_LATER', implication=scope_proof_implication(nodes, name, path, cut))
        elif example.get('origin_afterimages_implication'):
            record.update(cls='COVERED_LATER', implication=origin_afterimages_implication(nodes, name, path, cut))
        elif example.get('binding_implication'):
            record.update(cls='COVERED_LATER', implication=binding_selection_implication(nodes, name, path, cut))
        elif example.get('binding_revision_implication'):
            record.update(cls='COVERED_LATER', implication=binding_revision_implication(nodes, name, path, cut))
        elif example.get('filesafe_selector_implication'):
            record.update(cls='COVERED_LATER', implication=filesafe_selector_implication(nodes, name, path, cut))
        elif example.get('safestop_settlement_selector'):
            record.update(cls='COVERED_LATER', implication=safestop_settlement_selector_implication(
                nodes, name, path, control, cut))
        elif example.get('mutation_afterimage_implication'):
            record.update(cls='COVERED_LATER',
                          implication=mutation_afterimages_implication(nodes, name, path, control, cut))
        elif example.get('workflow_transition_implication'):
            record.update(cls='COVERED_LATER',
                          implication=workflow_transition_implication(plain, nodes, name, path, control, cut))
        elif example.get('owner_settlement_implication'):
            record.update(cls='COVERED_LATER', implication=owner_settlement_implication(nodes, name, path, cut))
        elif example.get('execution_binding_implication'):
            record.update(cls='COVERED_LATER', implication=execution_binding_implication(nodes, name, path, cut))
        elif example.get('nullable_enum'):
            location, word = name.rsplit('/', 1)
            node = nodes[location]['node']
            covering = location + '/enum'
            require(word == 'type' and path in (['restore_outcome'], ['conflict_reason_code'])
                    and set(node[word]) == {'string', 'null'}
                    and all(item is None or type(item) is str for item in node['enum'])
                    and go.locations(cut) == {covering}, 'the FileSafe nullable enumeration changed')
            record.update(cls='COVERED_LATER', implication=dict(
                source=location, covering_rule=covering,
                premise='Every declared enumeration member is a string or null.'))
        else:
            require(not cut, f'{name}: another validation message remains')
        results[name] = record
    for case in results.values():
        if 'covering_rule' in case.get('implication', {}):
            require(results[case['implication']['covering_rule']]['cls'] == 'KILLED',
                    'the covering validation rule needs an independent example')
    return results


def check_checkpoint_repeated(owner):
    """The inline projector revalidates the whole afterimage before writing."""
    from pm_goal_dg_r_projector import Projector, ProjectorV7

    require(type(owner).checkpoint_wrapper is ProjectorV7.checkpoint_wrapper
            and type(owner).project is Projector.project, 'checkpoint validation path changed')
    project = inspect.getsource(owner.project)
    afterimage = "self.roots.validate('native_consumer', self.root('LogicalCheckpoint'), new_logical, 'checkpoint/afterimage')"
    wrapper = 'ck = self.checkpoint_wrapper(new_logical)'
    require(afterimage + '\n            ' + wrapper in project,
            'the projector no longer passes the same afterimage immediately to the wrapper')
    check = "self.roots.validate('native_consumer', self.root('LogicalCheckpoint'), logical, 'checkpoint/wrapper')"
    require(inspect.getsource(owner.checkpoint_wrapper).splitlines()[1].strip() == check,
            'the wrapper no longer validates the whole afterimage first')


class OwnerExample:
    def __init__(self, source, row, route, collector, disabled_check):
        self.source = source
        self.row = row
        self.route = route
        self.collector = collector
        self.disabled_check = disabled_check
        self.observed = None
        self.trials = []
        self.pointer = route['call'] == 'publish_pointer'
        self.stop = route['edition'] == 'w12b'
        self.checkpoint = route['call'] == 'project_checkpoint'
        self.writes = self.pointer or self.checkpoint or route['call'] in (
            'issue_physical', 'filesafe_invocation', 'publish_workflow_head')

    def call(self, world, action, inputs, edit):
        import pm_goal_dg5_boundaries as bridge
        import pm_goal_dg5_closure as closure
        import pm_goal_dg_int_schema_cache as cache
        import pm_goal_guard_tables as tables
        from pm_goal_dg_r_world import Roots
        from pm_goal_dg_s_world import Bank
        from pm_goal_own_c_roots import OriginalBank
        from pm_goal_go2_closure import value_sha

        code = self.row.removeprefix('dg5/').removesuffix('/schema')
        result = dict(errors=[], observations=[])
        checks = self.route.get('checks', 1)

        def decide(bank, realm, ref, value, caller, enforce):
            site = [str(Path(caller.f_code.co_filename).relative_to(self.source)), caller.f_lineno]
            require(site == self.route['site'], f'owner source moved to {site}')
            plain = bank.validator(ref) if realm is None else bank.validator(realm, ref)
            ident, binding = root_binding(closure, bank, plain)
            if 'realm' in self.route:
                require(realm == self.route['realm'], f'owner call reached unexpected realm {realm}')
            registry_realm = realm
            if 'registry_realm' in self.route:
                registry_realm = bank.realm_for(plain.schema['$ref'], realm)
                require(registry_realm == self.route['registry_realm'],
                        f'owner validator selected unexpected registry realm {registry_realm}')
            require(ident == self.route['root'], f'owner call reached unexpected root {ident}')
            if edit and len(result['observations']) + 1 == checks:
                require(edit not in value, 'test example already has the extra member')
                value[edit] = 'example' if not self.checkpoint or self.route['edition'] == 'integrated_native' else 'x' * 16384
            errors = errors_list(list(plain.iter_errors(value)))
            result['observations'].append(dict(root=ident, binding=binding, site=site, realm=realm, ref=ref,
                                               registry_realm=registry_realm,
                                               document=copy.deepcopy(value), messages=errors))
            predicate = tables.predicates(tables.rows()[self.row])[self.row]
            decision = predicate({self.row: not errors}, None)
            require(decision == (self.row if errors else None), 'table disagrees with the original validator')
            self.collector.observe(self.row, not errors, tuple(site))
            if not edit:
                self.observed = plain, bank, copy.deepcopy(value), binding
            if decision and self.row in tables.CUT and self.disabled_check != 'row':
                return value
            return enforce()

        roots_validate, adapter_validate = Roots.validate, Bank.validate
        original_validate = OriginalBank.validate

        def validate(bank, realm, ref, value, label):
            enforce = lambda: roots_validate(bank, realm, ref, value, label)
            if label == code:
                return decide(bank, realm, ref, value, sys._getframe(1), enforce)
            if self.checkpoint and self.route['edition'] == 'integrated_native' and label == 'checkpoint/wrapper':
                from pm_goal_test_owner_adapters import same

                earlier, = result['observations']
                plain = bank.validator(realm, ref)
                require(ref == earlier['ref'] and realm == earlier['realm']
                        and root_binding(closure, bank, plain)[1] == earlier['binding']
                        and same(value, earlier['document'])
                        and errors_list(list(plain.iter_errors(value))) == earlier['messages'],
                        'the later checkpoint validator changed the schema, document or messages')
                result['later_checkpoint_matches'] = True
            return enforce()

        def validate_pointer(bank, ref, value, label='root'):
            enforce = lambda: adapter_validate(bank, ref, value, label)
            return decide(bank.original, None, ref, value, sys._getframe(1), enforce) if label == code else enforce()

        def validate_stop(bank, ref, value):
            enforce = lambda: original_validate(bank, ref, value)
            return decide(bank, None, ref, value, sys._getframe(1), enforce) if ref == self.route['ref'] else enforce()

        try:
            with ExitStack() as stack:
                if self.pointer:
                    stack.enter_context(patch.object(Bank, 'validate', validate_pointer))
                elif self.stop:
                    stack.enter_context(patch.object(OriginalBank, 'validate', validate_stop))
                else:
                    stack.enter_context(patch.object(Roots, 'validate', validate))
                if isinstance(world.roots, cache.Roots):
                    stack.enter_context(patch.object(world.roots, 'success', {}))
                returned = action()
            if self.writes:
                stored = world.storage.cell(*inputs[0])['value']
                if self.checkpoint:
                    from pm_goal_test_owner_adapters import same

                    require(same(stored, returned['checkpoint']), 'published checkpoint changed')
                    if self.route['edition'] == 'integrated_original':
                        content = stored['content']
                        if edit:
                            require(content['kind'] == 'payload_reference', 'the edited checkpoint must be packed')
                        stored = (content['checkpoint'] if content['kind'] == 'inline' else
                                  world.projector_class(world).unpack(content['reference']))
                    require(same(stored, result['observations'][0]['document']),
                            'published checkpoint lost the validated afterimage')
                else:
                    require(stored == result['observations'][0]['document'],
                            'retained wrapper differs from the validated document')
                returned = stored
            result['value_sha256'] = value_sha(returned)
            if edit and not self.checkpoint and self.route['call'] not in ('read_c3_proof', 'read_request'):
                require(returned.get(edit) == 'example', 'the accepted call did not return the altered document')
        except Exception as error:
            if type(error).__name__ not in bridge.REFUSAL_CLASSES:
                raise
            refusal = bridge.refusal_code(error)
            result.update(refusal=refusal, detail=getattr(error, 'detail', None), errors=[bridge.row(refusal)])
        self.trials.append(result)
        require(len(result['observations']) == checks,
                f"complete call reached the expected site {len(result['observations'])} times, expected {checks}")
        return result

    def issue_on_copy(self, world, action, inputs, edit, initial):
        import pm_goal_dg5_boundaries as bridge
        from pm_goal_dg_int_schema_cache import Roots as CachedRoots
        from pm_goal_dg_r_world import uuid
        from pm_goal_test_storage import secrets

        path = world.tmp / f'methodb-store-{len(self.trials)}'
        shutil.copytree(world.storage.root, path)
        require(bridge.manifest(bridge.file_state(path)) == initial, 'test Storage copy differs from original')
        context = multiprocessing.get_context('fork')
        receiver, sender = context.Pipe(duplex=False)

        def run_child():
            try:
                target = inputs[0]
                before = copy.deepcopy(world.storage.cell(*target))
                # The fixture builder may issue ancillary provenance first.
                # Give those private writes the same distinct IDs in each copy.
                ids = count(UUID('a36fc6e5-1e3b-4e27-8200-000000000001').int)
                with ExitStack() as stack:
                    stack.enter_context(patch.object(world.storage, 'root', path))
                    stack.enter_context(patch.object(uuid, 'uuid4', side_effect=lambda: UUID(int=next(ids))))
                    if self.checkpoint:
                        require('13' * 32 not in world.storage.seeds, 'the fixture seed is already in use')
                        stack.enter_context(patch.object(secrets, 'token_hex', return_value='13' * 32))
                    result = self.call(world, action, inputs, edit)
                current = world.storage.cell(*target)
                published = current != before
                require(published != bool(result['errors']), 'target publication does not match the verdict')
                result['target_published'] = published
                result['store_changed'] = bridge.manifest(bridge.file_state(path)) != initial
                sender.send(result)
            except Exception as error:
                sender.send({'exception': f'{type(error).__name__}: {error}'})
            finally:
                sender.close()

        job = context.Process(target=run_child)
        job.start()
        sender.close()
        try:
            result = receiver.recv()
        finally:
            receiver.close()
            job.join()
        require(job.exitcode == 0 and 'exception' not in result, result)
        self.trials.append(result)
        observed, = result['observations']
        self.collector.observe(self.row, not observed['messages'], tuple(observed['site']))
        if edit is None:
            if self.pointer:
                bank = world.d01.edition.bank.original
                validator = bank.validator(observed['ref'])
            else:
                bank = world.roots.original if isinstance(world.roots, CachedRoots) else world.roots
                validator = bank.validator(observed['realm'], observed['ref'])
            self.observed = validator, bank, observed['document'], observed['binding']
        return result

    def store_state(self, world):
        import pm_goal_dg5_boundaries as bridge
        from pm_goal_go2_closure import value_sha

        if self.stop:
            return value_sha(dict(cells=world.cells, owners={
                role: dict(rows=owner.rows, origins=owner.origins) for role, owner in world.owners.items()}))
        return bridge.manifest(bridge.file_state(world.storage.root))

    def prove(self, world, action, inputs):
        import pm_goal_dg5_boundaries as bridge
        import pm_goal_guard_tables as tables

        initial = self.store_state(world)
        bound_inputs = bridge.context_value(inputs, world)
        extra = 'methodb_extra'
        for edit in (None, extra, None):
            value = dict(store=initial, route=self.route, arguments=bound_inputs, edit=edit)

            def evaluate(document):
                require(document == value, 'complete-call inputs changed')
                require(not tables.CUT - {self.row}, 'more than the selected validation rule was disabled')
                require(bridge.context_value(inputs, world) == bound_inputs, 'original owner arguments changed')
                result = (self.issue_on_copy(world, action, inputs, edit, initial) if self.writes
                          else self.call(world, action, inputs, edit))
                require(self.store_state(world) == initial,
                        'passive call changed the original store')
                return result

            label = f"Method B/{self.route['edition']}/{self.route['call']}"
            self.collector.invoke(label, evaluate, value, edit is None, target=self.row if edit else None,
                                  family=FAMILY)
            record = self.collector.ledger[-1]
            require(not self.collector.failures, self.collector.failures)
            require(record['outcome'] == ('exact_expected' if edit else 'control'), record)
            if edit:
                before, disabled, restored = self.trials[-3:]
                if self.checkpoint and self.route['edition'] == 'integrated_native':
                    require(record['kill'] == 'COVERED_LATER' and disabled['later_checkpoint_matches']
                            and disabled['refusal'] == 'checkpoint/wrapper/schema/'
                            and disabled['detail'] == before['detail'],
                            'the later checkpoint check must refuse the same invalid afterimage')
                else:
                    require(record['kill'] == 'KILLED' and not disabled['errors'],
                            f"single-check trial {record['kill']}: {record.get('cut_errors')}")
                require(before == restored and before['observations'] == disabled['observations'],
                        'the same invalid document and message must be restored')
                if self.route['call'] in ('read_c3_proof', 'read_request'):
                    require(disabled['value_sha256'] == self.trials[0]['value_sha256'],
                            'the accepted read must return the original retained value')
                require(before['refusal'] == self.route['refusal'] and before['detail'] == self.route['detail'],
                        f"unexpected validation message: {before['refusal']} {before['detail']}")
        require(self.trials[0] == self.trials[-1], 'the restored valid call changed')
        return self.observed, initial, bound_inputs


def publish(source, out, declare, collector, reports, inventories, table_path):
    first, clauses = next(iter(reports.items()))
    proof_output(source, out, {**declare, 'site': declare['sites'][0]}, collector,
                 clauses, first, table_path)
    closure = json.loads((out / 'closure.json').read_text())
    template = closure['roots'][first]
    for root, cases in reports.items():
        counts = dict(Counter(x['cls'] for x in cases.values()))
        closure['roots'][root] = dict(template, counts=counts, clauses=cases,
                                     clause_inventory=inventories[root]['clause_inventory'],
                                     verify={'passed': counts.get('KILLED', 0) + counts.get('COVERED_LATER', 0),
                                             'failed': 0, 'unverifiable': 0})
    write(out / 'closure.json', closure)
    write(out / 'inventory.json', dict(mode='assertion-inventory', family=FAMILY,
                                      collection_failures=[], roots=inventories))
    collection = out / 'proof/collection.json'
    value = json.loads(collection.read_text())
    value['rows'][declare['row']]['sites'] = declare['sites']
    write(collection, value)
    bindings = out / 'proof/source-bindings.json'
    value = json.loads(bindings.read_text())
    cited = list(declare['sites'])
    if declare['row'] == 'dg5/checkpoint/afterimage/schema':
        cited.extend(('scripts/pm_goal_dg_r_projector.py', line) for line in (399, 409, 509, 510, 792, 793))
    for relative, _ in cited:
        value['files'][relative] = sha(source / relative)
    write(bindings, value)


def fresh_root(census, reference, row, route, binding, closure):
    ident = route['root']
    if 'fresh_literal_sha256' not in route:
        return census['roots'][ident]

    matches = [variant for variant in reference['roots'][ident]
               if variant['bank'] == binding['bank']
               and variant['realm'] == route.get('registry_realm', route.get('realm'))
               and variant['registry_sha256'] == binding['registry_sha256']
               and variant['validator_class'] == binding['validator_class']
               and json.dumps(variant['selector'], sort_keys=True) == binding['schema']
               and row in variant['sizing_rows']
               and variant['clause_inventory']['sha256'] == route.get('fresh_literal_sha256')]
    require(len(matches) == 1, f'{ident}: exactly one fresh bank, realm, selector and rule list must match')
    variant, = matches
    require(closure._clause_inventory_pin(variant['clause_ids']) == variant['clause_inventory'],
            f'{ident}: fresh rule list differs from its published digest')
    return dict(binding, clause_ids=variant['clause_ids'])


def run(args):
    source = args.source.resolve()
    declare = json.loads(args.declaration.read_text())
    require(declare['family'] == FAMILY, 'wrong test family')
    revision = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
    require(revision == declare['source'] and sha(args.census) == declare['census_sha256'],
            'source revision or census bytes changed')
    with gzip.open(args.census, 'rt') as stream:
        census = json.load(stream)
    row = declare['row']
    census_row, = [item for item in census['rows'] if item['row'] == row]
    require(census['family'] == FAMILY and sorted(census_row['sites']) == sorted(declare['sites']),
            'declared sites differ from the census')
    require(set(census_row['root_ids']) == set(declare['examples']) ==
            {route['root'] for route in declare['routes']}, 'declared roots differ from the census')
    require({tuple(route['site']) for route in declare['routes']} == {tuple(site) for site in declare['sites']},
            'every census site needs an owner call')
    reference = None
    fresh_roots = {route['root'] for route in declare['routes'] if 'fresh_literal_sha256' in route}
    require(set(census_row['roots_with_inventory_variants']) <= fresh_roots,
            'conflicting roots need a published rule list')
    if fresh_roots:
        paths = args.fresh_reference
        if isinstance(paths, Path):
            paths = [paths]
        expected = declare.get('fresh_reference_sha256s', [declare.get('fresh_reference_sha256')])
        require(paths and [sha(path) for path in paths] == expected,
                'a conflicting rule list requires the pinned fresh reference')
        reference = {'roots': {}}
        for path in paths:
            with gzip.open(path, 'rt') as stream:
                published = json.load(stream)
            require(published['tools'] == revision, 'fresh references use a different closure tool')
            if 'sizing' in published:
                require(published['sizing']['sha256'] == declare['census_sha256'],
                        'fresh references use a different sizing census')
            for ident, variants in published['roots'].items():
                reference['roots'].setdefault(ident, []).extend(variants)
        require(fresh_roots <= set(reference['roots']), 'fresh references omit a conflicting root')
    else:
        require(not {'fresh_reference_sha256', 'fresh_reference_sha256s'} & declare.keys(),
                'the original census is exact for this row')

    sys.path.insert(0, str(source / 'scripts'))
    import pm_goal_dg5_closure as closure
    import pm_goal_guard_sweep as sweep
    import pm_goal_guard_tables as tables

    table = sweep.table_id([row])
    tables.PHASE_PREFIX = 'pm_goal_dg5_cancelled_phase_'
    tables._ROWS = {row: dict(table=table, phase=True)}
    name = tables.PHASE_PREFIX + table + '.py'
    table_path = source / 'scripts' / name
    expected = sweep.table_source(table, [row], {row: [tuple(site) for site in declare['sites']]})
    require((HERE / name).read_text() == expected, 'committed singleton table differs from the standard generator')
    if not table_path.exists():
        table_path.write_text(expected)
    require(table_path.read_text() == expected, 'source-local table differs from the standard generator')
    args.out.mkdir(parents=True)
    started = time.monotonic()
    collector = sweep.Collector()
    reports, inventories, calls, captured = {}, {}, [], []
    result = dict(row=row, source=revision, status='NOT_COVERED', census_sha256=declare['census_sha256'])
    if reference:
        for key in ('fresh_reference_sha256', 'fresh_reference_sha256s'):
            if key in declare:
                result[key] = declare[key]
    try:
        for index, route in enumerate(declare['routes']):
            directory = args.out / f'fixture-{index}'
            directory.mkdir()
            world, action, inputs = fixture(declare, route, directory)
            check = OwnerExample(source, row, route, collector, args.disable_check)
            log = dict(route=route, trials=check.trials)
            calls.append(log)
            # This is an authored singleton. Replay each declared source
            # edition even when the family-wide sample quota is reached.
            with patch.object(sweep, 'REPLAY_CAP', max(sweep.REPLAY_CAP, len(declare['routes']))):
                observation, log['store'], log['arguments'] = check.prove(world, action, inputs)
            if reference:
                observed = check.trials[0]['observations'][0]
                log['fresh_literal_sha256'] = route.get('fresh_literal_sha256')
                require(observed['realm'] == route.get('realm'), 'the fresh reference needs the observed realm')
            captured.append((route, observation))
        for route, (plain, bank, accepted, binding) in captured:
            ident = route['root']
            if reference is None and ident in reports:
                continue
            root = fresh_root(census, reference, row, route, binding, closure)
            require(all(root[key] == value for key, value in binding.items()),
                    f'owner validator binding changed for {ident}')
            ids = root['clause_ids']
            examples = declare['examples'][ident]
            accepted = declare.get('rule_controls', {}).get(ident, accepted)
            scoped = ':sha256:' in ids[0].split('#', 1)[0]
            if reference or scoped or any(set(example) & {'vacuous', 'intent_selector', 'intent_implication',
                                                          'nullable_enum', 'append_acknowledgment_nonempty',
                                                          'origin_afterimages_implication', 'binding_implication',
                                                          'filesafe_selector_implication',
                                                          'mutation_afterimage_implication',
                                                          'workflow_transition_implication'}
                             for example in examples.values()):
                clauses = literal_rules(plain, bank, accepted, ident, ids, examples, args.disable_check, scoped)
            else:
                clauses, gaps = test_rules(plain, bank, accepted, ident, ids, examples, args.disable_check)
                require(not gaps, f'{ident} needs checked implications for {sorted(gaps)}')
            inventory = dict(binding, rows=[row], families=[FAMILY], clause_ids=ids,
                             clause_inventory=closure._clause_inventory_pin(ids))
            if ident in inventories:
                require(inventories[ident] == inventory,
                        f'{ident}: the coverage table needs one exact binding per root ID')
            reports[ident] = clauses
            inventories[ident] = inventory
        publish(source, args.out, declare, collector, reports, inventories, table_path)
        result['status'] = 'COVERED'
    except ValueError as error:
        result['reason'] = str(error)
    finally:
        result.update(seconds=round(time.monotonic() - started, 3), calls=calls)
        write(args.out / 'result.json', result)
        print(json.dumps({k: v for k, v in result.items() if k != 'calls'}, sort_keys=True), flush=True)
    return int(result['status'] != 'COVERED')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--census', type=Path, required=True)
    parser.add_argument('--declaration', type=Path, required=True)
    parser.add_argument('--fresh-reference', type=Path, action='append')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--disable-check', choices=('inventory', 'rule', 'row'))
    sys.exit(run(parser.parse_args()))
