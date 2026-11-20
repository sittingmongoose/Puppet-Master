#!/usr/bin/env python3
"""Replay declared examples through the original Goal run cancellation checkers."""

import argparse
from collections import Counter
import copy
from contextlib import ExitStack
import gzip
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
    config = {'start': route.get('start', 'started')}
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
    if route['call'] in ('issue_physical', 'publish_pointer', 'prepare_body', 'prepare_control', 'filesafe_invocation'):
        if route['call'] == 'publish_pointer':
            from pm_goal_dg_int_world import S1D01Owner
            cls, method = S1D01Owner, 'publish_head'
        elif route['call'] in ('prepare_body', 'prepare_control'):
            from pm_goal_dg_int_world import S1NativeOwner
            cls = S1NativeOwner if edition == 'integrated_original' else legacy.NativeOwner
            method = route['call']
        elif route['call'] == 'filesafe_invocation':
            cls, method = legacy.CancelWorld, '_filesafe_invocation'
        else:
            cls, method = legacy.PhysOwner, 'issue_physical'
        family = declare['row'].removeprefix('dg5/issue/').removesuffix('/schema')
        original_issue = getattr(cls, method)
        captured = []

        def before_issue(owner, *args, **kwargs):
            if method == 'issue_physical':
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
        action = lambda: original_issue(owner, *args, **kwargs)
        if route['call'] in ('prepare_body', 'prepare_control'):
            return world, action, (args, kwargs)
        if method == 'publish_head':
            import pm_goal_dg_s_start as start
            target = start.d01_families(owner.edition)['pointer'], owner.s1.pointer_key()
        elif method == '_filesafe_invocation':
            realm, operation, _ = args
            journal = world.seeder.seed('filesafe_consumer', realm + 'JournalSelector')['family_id']
            target = journal, world.filesafe.key(journal, operation)
        else:
            target = args[0], args[3]
        return world, action, (target, args, kwargs)
    world.build()
    if route['call'] == 'read_checkpoint':
        owner = world.projector_class(world)
        owner.project()
        owner.cutover()
        key = owner.checkpoint_key(owner.request()['scope'])
        wrapper = world.storage.cell('checkpoints', key)['value']
        return world, lambda: owner.read_checkpoint(wrapper), wrapper
    if route['call'] == 'current_started':
        owner = getattr(world, 'projector_class', projector.Projector)(world)
        return world, owner.read_current_started, owner.request()
    consumer = getattr(world, 'consumer_class', reader.Consumer)(world)
    presentation = reader.Presentation(world)
    request = original.request_of(world)
    require(route['call'] == 'missing_original', f'unknown owner call {route}')
    presentation.cancellation = None
    return world, lambda: consumer.read_retained_native(request, presentation), (request, None)


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


def checkpoint_uuid_implication(plain, nodes, name, path, cut):
    from pm_goal_go_schema_closure import locations
    from pm_goal_own_c_oracles import exact_pattern, uuid_string

    source, word = name.rsplit('/', 1)
    node = nodes[source]['node']
    pattern = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
    require(path == ['storage_instance_id'] and source.endswith('/$defs/LogicalCheckpoint/properties/storage_instance_id')
            and node['pattern'] == '^' + pattern + '$' and node['format'] == 'uuid'
            and node['minLength'] == node['maxLength'] == 36
            and plain.VALIDATORS['pattern'] is exact_pattern
            and plain.format_checker.checkers['uuid'][0] is uuid_string
            and pattern in uuid_string.__code__.co_consts,
            'the checkpoint UUID predicates changed')
    remaining = {'pattern', 'format'}
    remaining.discard(word)
    require(locations(cut) == {source + '/' + keyword for keyword in remaining},
            'the exact matching UUID rules must still refuse')
    return dict(source=source, covering_rules=sorted(remaining),
                predicates=[dict(name=method.__name__, line=method.__code__.co_firstlineno,
                                 sha256=sha(Path(method.__code__.co_filename)))
                            for method in (exact_pattern, uuid_string)],
                premise='The two full matches define the same UUID grammar and require exactly 36 characters.')


def rule_path(document, path):
    if path[:2] == ['generations', 'current_generation_id']:
        return ['generations', document['current_generation_id'], *path[2:]]
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
    if disabled_check == 'inventory':
        examples = dict(list(examples.items())[1:])
    require(walked == ids, f'{ident}: installed assertions differ from the census')
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
        invalid = edit_example(go, control, path, example)
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
        self.writes = self.pointer or route['call'] in ('issue_physical', 'filesafe_invocation')

    def call(self, world, action, inputs, edit):
        import pm_goal_dg5_boundaries as bridge
        import pm_goal_dg5_closure as closure
        import pm_goal_dg_int_schema_cache as cache
        import pm_goal_guard_tables as tables
        from pm_goal_dg_r_world import Roots
        from pm_goal_dg_s_world import Bank
        from pm_goal_go2_closure import value_sha

        code = self.row.removeprefix('dg5/').removesuffix('/schema')
        result = dict(errors=[], observations=[])
        checks = self.route.get('checks', 1)

        def decide(bank, realm, ref, value, caller, enforce):
            site = [str(Path(caller.f_code.co_filename).relative_to(self.source)), caller.f_lineno]
            require(site == self.route['site'], f'owner source moved to {site}')
            plain = bank.validator(ref) if realm is None else bank.validator(realm, ref)
            ident, binding = root_binding(closure, bank, plain)
            require(ident == self.route['root'], f'owner call reached unexpected root {ident}')
            if edit and len(result['observations']) + 1 == checks:
                require(edit not in value, 'test example already has the extra member')
                value[edit] = 'example'
            errors = errors_list(list(plain.iter_errors(value)))
            result['observations'].append(dict(root=ident, binding=binding, site=site, realm=realm, ref=ref,
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

        def validate(bank, realm, ref, value, label):
            enforce = lambda: roots_validate(bank, realm, ref, value, label)
            return decide(bank, realm, ref, value, sys._getframe(1), enforce) if label == code else enforce()

        def validate_pointer(bank, ref, value, label='root'):
            enforce = lambda: adapter_validate(bank, ref, value, label)
            return decide(bank.original, None, ref, value, sys._getframe(1), enforce) if label == code else enforce()

        try:
            with ExitStack() as stack:
                if self.pointer:
                    stack.enter_context(patch.object(Bank, 'validate', validate_pointer))
                else:
                    stack.enter_context(patch.object(Roots, 'validate', validate))
                if isinstance(world.roots, cache.Roots):
                    stack.enter_context(patch.object(world.roots, 'success', {}))
                returned = action()
            if self.writes:
                stored = world.storage.cell(*inputs[0])['value']
                require(stored == result['observations'][0]['document'],
                        'retained wrapper differs from the validated document')
                returned = stored
            result['value_sha256'] = value_sha(returned)
            if edit:
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
                with patch.object(world.storage, 'root', path), patch.object(
                        uuid, 'uuid4', side_effect=lambda: UUID(int=next(ids))):
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

    def prove(self, world, action, inputs):
        import pm_goal_dg5_boundaries as bridge
        import pm_goal_guard_tables as tables

        initial = bridge.manifest(bridge.file_state(world.storage.root))
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
                require(bridge.manifest(bridge.file_state(world.storage.root)) == initial,
                        'passive call changed the original store')
                return result

            label = f"Method B/{self.route['edition']}/{self.route['call']}"
            self.collector.invoke(label, evaluate, value, edit is None, target=self.row if edit else None,
                                  family=FAMILY)
            record = self.collector.ledger[-1]
            require(not self.collector.failures, self.collector.failures)
            require(record['outcome'] == ('exact_expected' if edit else 'control'), record)
            if edit:
                require(record['kill'] == 'KILLED',
                        f"single-check trial {record['kill']}: {record.get('cut_errors')}")
                before, disabled, restored = self.trials[-3:]
                require(before == restored and before['observations'] == disabled['observations']
                        and not disabled['errors'], 'the same invalid document and message must be restored')
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
    for relative, _ in declare['sites']:
        value['files'][relative] = sha(source / relative)
    write(bindings, value)


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
    require(not census_row['roots_with_inventory_variants'], 'root inventory variants remain unresolved')

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
    reports, inventories, calls, captured = {}, {}, [], {}
    result = dict(row=row, source=revision, status='NOT_COVERED', census_sha256=declare['census_sha256'])
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
            captured.setdefault(route['root'], observation)
        for ident, (plain, bank, accepted, binding) in captured.items():
            root = census['roots'][ident]
            require(all(root[key] == value for key, value in binding.items()),
                    f'owner validator binding changed for {ident}')
            ids = root['clause_ids']
            examples = declare['examples'][ident]
            accepted = declare.get('rule_controls', {}).get(ident, accepted)
            scoped = ':sha256:' in ids[0].split('#', 1)[0]
            if scoped or any(set(example) & {'vacuous', 'intent_selector', 'intent_implication', 'nullable_enum'}
                             for example in examples.values()):
                clauses = literal_rules(plain, bank, accepted, ident, ids, examples, args.disable_check, scoped)
            else:
                clauses, gaps = test_rules(plain, bank, accepted, ident, ids, examples, args.disable_check)
                require(not gaps, f'{ident} needs checked implications for {sorted(gaps)}')
            reports[ident] = clauses
            inventories[ident] = dict(binding, rows=[row], families=[FAMILY], clause_ids=ids,
                                      clause_inventory=closure._clause_inventory_pin(ids))
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
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--disable-check', choices=('inventory', 'rule', 'row'))
    sys.exit(run(parser.parse_args()))
