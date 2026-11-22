#!/usr/bin/env python3
"""Replay Goal started schema examples against the current callers and exact walks."""
import argparse
import ast
from collections import Counter, defaultdict
from contextlib import ExitStack
import copy
import inspect
import gzip
import hashlib
import json
import multiprocessing
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import time
from unittest.mock import patch
from urllib.parse import urljoin

from jsonschema import Draft202012Validator

import pm_goal_dg5_methodb_stage1 as stage

pilot = stage.pilot
closure, rules, world = stage.closure, stage.clauses, stage.world
ROOT, FAMILY, require, sha, write = stage.ROOT, stage.FAMILY, stage.require, stage.sha, stage.write
REFERENCE_SHA = 'cb562fa287b7987eabe3b49fc9d3c5119948a69df444ce0a3a0b2d76bdbd4cf2'
FULL_REFERENCE_SHA = 'ca913e1b9353ead76cdfae84fa7eda30606c38042c6ac45f7e86bed1cc0b3e42'
FULL_REFERENCE_OVERLAY = 'd95dfc693296a7bab5fe4e1af044ab14a4ec083c'
TABLE_PREFIX = 'pm_goal_dg5_methodb_w2_phase_'
PREFLIGHT_CUSTODY = 'https://puppetmaster.local/proposals/goal_completion_source_control_inputs/1.0.0#/$defs/'
PREFLIGHT_CHOICES = {
    'ReceiptOrigin': (0, 'original_read', 'origin', 'record'),
    'RecordSelector': (0, 'binding', 'full_source', 'source'),
}
COMPLETION_SOURCE = ('https://puppetmaster.local/proposals/activation_seven_operational_custody.v2.schema.json'
                     '#/$defs/CurrentCompletionRequirementSource')
REQUIRED_CHILDREN = ('source', 'record', 'required_children')


class Fixture(stage.Fixture):
    def prepare(self):
        if self.route == 'projection/record':
            readers = stage.original.R
            return readers.projection_record, (self.world, readers.original_started(self.world))
        if self.route in ('representation/row', 'representation/record'):
            projector, _, _ = stage.original.projected(self.world)
            _, _, _, row = projector.current_row()
            return projector.rep.decode, (row['value'], stage.original.R.original_started(self.world))
        if self.route == 'projector/result':
            projector = stage.original.R.StartedProjector(self.world.registry, world=self.world)
            projector.install()
            return projector.replay, (projector.stage(),)
        if self.route in ('read_historical/root', 'read_current/root'):
            _, reader, _ = stage.original.projected(self.world)
            return getattr(reader, self.route.split('/')[0]), (stage.original.sreq(self.world),)
        if self.route == 'issue/current_source':
            owner = self.world.owners['d01']
            owner.current_source(self.world.owners['native'].current())
            return self.issue_arguments(owner, 'current_source')
        if self.route in ('issue/CurrentGoalArgument', 'issue/OriginalGoalArgument'):
            self.bank = self.goal_bank
            owner = self.world.owners['goal']
            kind = self.route.removeprefix('issue/')
            if kind == 'CurrentGoalArgument':
                owner.current_argument()
            return self.issue_arguments(owner, kind)
        if self.route in ('publish_result', 'publish_original_append'):
            return self.world.start.commit_start, (stage.original.request(self.world), self.handles)
        if self.route.startswith(('read_append/', 'read_native/')):
            method = 'inspect_original' if self.route.startswith('read_append/') else 'read_retained_native'
            reader = stage.original.R.StartedReaders(self.world.registry, world=self.world)
            return getattr(reader, method), (stage.original.sreq(self.world),)
        if self.route == 'issue/launch_chain':
            owner = self.world.owners['launch']
            return self.issue_arguments(owner, 'launch_chain')
        if self.route.startswith('issue/seven_input:'):
            kind = self.route.removeprefix('issue/')
            return self.issue_arguments(self.world.owners['input:' + kind.split(':', 1)[1]], kind)
        if self.route.startswith('issue/activation_source:'):
            kind = self.route.removeprefix('issue/')
            owner = self.world.owners['activation:' + kind.split(':', 1)[1]]
            return self.issue_arguments(owner, kind)
        return super().prepare()

    def issue_arguments(self, owner, kind):
        self.issue_kind = kind
        reference, = owner.inventory(kind)
        entry = owner._originals[reference]
        value = world.A.CODECS[owner.custody_codec][1](entry['raw'])
        return owner.issue, (entry['root'], value)

    def variants(self, document):
        yield from super().variants(document)
        value = document['input']
        activation = self.world.edition.activation + '#/$defs/'
        if self.route.startswith('issue/seven_input:') and value == []:
            singleton = [world.skeleton(self.bank, document['schema']['$ref'] + '/items')]
            yield singleton
            if self.route == 'issue/seven_input:source_control_preflight':
                for definition, path in PREFLIGHT_CHOICES.items():
                    schema = self.bank.lookup(PREFLIGHT_CUSTODY + definition).contents
                    for alternative in schema['oneOf']:
                        variant = copy.deepcopy(singleton)
                        rule_values = {field: rule['const'] for field, rule in alternative['properties'].items()}
                        rules.get(variant, path).update(rule_values)
                        if variant != singleton:
                            yield variant
        elif self.route == 'issue/activation_source:provisioning':
            filled = copy.deepcopy(value)
            metadata = filled['source']['record']
            for field, definition in (
                ('model_resolution_receipts', 'ModelResolutionMetadata'),
                ('source_control', 'SourceControlPreflightMetadata'),
                ('test_capability_reports', 'TestCapabilityMetadata'),
            ):
                metadata[field] = [world.skeleton(self.bank, activation + definition)]
            filled['origin']['record']['source_bindings'] = [
                world.skeleton(self.bank, activation + 'OriginalSourceBinding')
            ]
            yield filled
        elif self.route == 'issue/launch_chain':
            binding = world.skeleton(self.bank, activation + 'OriginalSourceBinding')
            prepared = copy.deepcopy(value)
            prepared['current_outbox']['record'].update(
                phase='prepared', activation_receipt=copy.deepcopy(binding), staging_source=binding)
            yield prepared
        elif self.route in ('publish_retained', 'publish_result'):
            yield from self.transition_controls(value)
            if self.route == 'publish_result':
                origin_control = self.publish_origin_control(value)
                if origin_control is not None:
                    yield origin_control
        elif self.route in ('read_historical/root', 'read_current/root'):
            yield from self.transition_controls(value, ('original', 'native_start', 'original_d01_update', 'record'))

    def publish_origin_control(self, value):
        """Select the installed D06 published-origin alternative in the result schema."""
        selector = self.world.edition.d01 + '#/$defs/OriginalWriterOrigin'
        union = self.bank.lookup(selector)
        indices = [index for index, branch in enumerate(union.contents['oneOf'])
                   if branch.get('properties', {}).get('kind', {}).get('const') == 'd06_original']
        if len(indices) != 1:
            return None
        index, = indices
        branch = union.contents['oneOf'][index]
        storage = union.resolver.lookup(branch['properties']['value']['$ref'])
        schema = storage.resolver.lookup(storage.contents['properties']['record']['$ref'])
        condition, = schema.contents['allOf']
        prepare = condition['if']['properties']['issuer_method']['const']
        publish, = (method for method in schema.contents['properties']['issuer_method']['enum'] if method != prepare)
        ref = condition['else']['properties']['afterimages']['$ref']
        origin = world.skeleton(self.bank, f'{selector}/oneOf/{index}')
        origin['value']['record'].update(
            issuer_method=publish, afterimages=world.skeleton(self.bank, urljoin(schema.resolver._base_uri, ref)))
        variant = copy.deepcopy(value)
        variant['d01_lineage']['workflow']['original_writer_origins'] = [origin]
        return variant

    def transition_controls(self, value, path=None):
        """Supply the accepted transition branches of the installed D01 schema."""
        d01 = self.world.edition.d01 + '#/$defs/'
        update = self.bank.lookup(d01 + 'WorkflowUpdate').contents
        transition = self.bank.lookup(d01 + 'TransitionCommitment').contents
        methods = {rule['if']['properties']['rule']['const']:
                   rule['then']['properties']['original_writer_method']['const']
                   for rule in transition['allOf']}
        if path is None:
            path = (('original_d01_update', 'record') if self.route == 'publish_retained' else
                    ('d01_lineage', 'workflow', 'update_chain', 0))
        for rule in update['allOf']:
            name = rule['if']['properties']['transition']['properties']['rule']['const']
            variant = copy.deepcopy(value)
            record = rules.get(variant, path)
            transition_record = record['transition']
            if name == transition_record['rule']:
                continue
            prior = transition_record['before'] or transition_record['after']
            transition_record.update(rule=name, before=None if name == 'activation_begin' else copy.deepcopy(prior),
                                     original_writer_method=methods.get(name, transition_record['original_writer_method']))
            record['cause'] = rule['then']['properties']['cause']['const']
            yield variant

    def call(self, edit):
        if self.route == 'projection/record' and edit:
            skeleton = world.skeleton
            selector = self.world.edition.consumer + '#/$defs/Projection'
            _, path, change = edit

            def document(bank, reference):
                value = skeleton(bank, reference)
                return rules.apply(value, path, tuple(change)) if reference == selector else value

            with patch.object(world, 'skeleton', document):
                return self.action(*self.args)

        if self.route == 'projector/result' and edit:
            representation = stage.original.R.Representation
            validate = representation.validate
            _, path, change = edit

            def result_document(rep, name, value, code):
                if code == 'projector/result':
                    changed = rules.apply(value, path, tuple(change))
                    value.clear()
                    value.update(changed)
                return validate(rep, name, value, code)

            with patch.object(representation, 'validate', result_document):
                return self.action(*self.args)

        if self.route in ('read_historical/root', 'read_current/root') and edit:
            line = {'read_historical/root': 906, 'read_current/root': 937}[self.route]
            _, path, change = edit
            return self.call_output('body', line, 'value', path, change)

        if self.route == 'representation/record' and edit:
            _, path, change = edit
            return self.call_output('decode', 484, 'record', path, change)

        if self.route.startswith(('read_append/', 'read_native/')):
            return self.call_reader(edit)
        if self.route in ('publish_result', 'publish_original_append', 'publish_commit',
                          'publish_start_origin', 'publish_retained'):
            return self.call_start(edit)
        if not self.route.startswith('issue/'):
            return super().call(edit)
        root, value = self.args
        if edit:
            position, path, change = edit
            require(position == 1, 'issuer edit must change the document argument')
            value = rules.apply(value, path, tuple(change) if isinstance(change, list) else change)
        return self.action(root, value, kind=self.issue_kind)

    def call_output(self, function, line, local_name, path, change):
        """Edit an assembled reader document immediately before validation."""
        reader_source = stage.original.R.__file__
        seen = []

        def at_result(frame, event, _):
            if event == 'line' and frame.f_lineno == line:
                value = frame.f_locals[local_name]
                changed = rules.apply(value, path, tuple(change))
                value.clear()
                value.update(changed)
                seen.append(line)
            return at_result

        def choose_frame(frame, event, _):
            if event == 'call' and frame.f_code.co_name == function and frame.f_code.co_filename == reader_source:
                return at_result
            return None

        previous = sys.gettrace()
        sys.settrace(choose_frame)
        try:
            return self.action(*self.args)
        finally:
            sys.settrace(previous)
            require(seen == [line], 'expected one edit of the final reader document')

    def call_reader(self, edit):
        if not edit:
            return self.action(*self.args)
        route, selected_where = self.route.split('/', 1)
        _, path, change = edit
        readers = stage.original.R
        storage = self.world.storage
        change_value = lambda value: rules.apply(value, path, tuple(change))
        if route == 'read_append':
            original = readers.original_append
            fetch = storage.full_value_result

            def original_append(world, event_id, where='append'):
                with ExitStack() as stack:
                    if where == selected_where:
                        stack.enter_context(patch.object(storage, 'full_value_result',
                                                         lambda event_id: change_value(fetch(event_id))))
                    return original(world, event_id, where=where)

            with patch.object(readers, 'original_append', original_append):
                return self.action(*self.args)
        original = readers.retained_native
        fetch = storage.cell
        key = self.world.ctx.run_key('workflow_start_control_origin.v1')

        def cell(family, physical_key):
            value = fetch(family, physical_key)
            if (family, physical_key) == ('workflow_start_control_origin', key):
                return dict(value, value=change_value(value['value']))
            return value

        def retained_native(world, op=None, *, where='retained'):
            with ExitStack() as stack:
                if where == selected_where:
                    stack.enter_context(patch.object(storage, 'cell', cell))
                return original(world, op, where=where)

        with patch.object(readers, 'retained_native', retained_native):
            return self.action(*self.args)

    def call_start(self, edit):
        if not edit:
            return self.action(*self.args)
        _, path, change = edit
        apply = lambda value: rules.apply(value, path, tuple(change))
        args = list(self.args)
        if self.route == 'publish_commit':
            args[-1] = dict(args[-1], commit=apply)
        elif self.route == 'publish_retained':
            args[2] = dict(args[2])
            birth = dict(args[2]['native_birth'])
            birth['initial_control_origin'] = apply(birth['initial_control_origin'])
            args[2]['native_birth'] = birth
        elif self.route == 'publish_result':
            def union(value):
                return dict(value, d01_lineage=apply(value['d01_lineage']))

            return self.action(*args, edits={'union': union})
        elif self.route == 'publish_original_append':
            storage = self.world.storage
            original = storage.full_value_result
            with patch.object(storage, 'full_value_result', lambda event_id: apply(original(event_id))):
                return self.action(*args)
        elif self.route == 'publish_start_origin':
            skeleton = world.skeleton
            ref = self.world.edition.custody + '#/$defs/StorageOrigin'

            def origin(bank, selector):
                value = skeleton(bank, selector)
                return apply(value) if selector == ref else value

            with patch.object(world, 'skeleton', origin):
                return self.action(*args)
        return self.action(*args)


class CompleteCall(stage.Example):
    def run(self, edit=None, cut=False):
        if self.fixture.route not in ('publish_result', 'publish_original_append', 'projector/result'):
            return super().run(edit, cut)
        # These result checks run after the original call has written changes.
        # Every execution starts from an independent copy.
        original = self.fixture.path
        require(stage.store(original) == self.before, 'complete-call store preimage changed')
        replay = original.with_name(original.name + f'-late-publication-{len(self.runs)}')
        shutil.copytree(original, replay)
        require(stage.store(replay) == self.before, 'publication replay copy differs from its source')
        receiver, sender = multiprocessing.get_context('fork').Pipe(duplex=False)
        child = multiprocessing.get_context('fork').Process(target=self.in_child, args=(sender, edit, cut, replay))
        child.start()
        sender.close()
        try:
            record = receiver.recv()
        finally:
            receiver.close()
            child.join()
        require(child.exitcode == 0, 'complete-call child failed')
        require(stage.store(original) == self.before, 'complete call changed the original stored test bytes')
        record['before'] = self.before
        self.runs.append(record)
        return record


class PreviousExamples:
    """Old edits are candidate documents; current tests assign every rule ID."""
    def __init__(self):
        self.reports = {}
        self.pins = {}

    def entries(self, previous):
        root = previous['root']
        result = defaultdict(list)
        for path in previous['reports']:
            if path not in self.reports:
                source = Path(path)
                self.pins[path] = sha(source)
                self.reports[path] = json.loads(source.read_bytes())['roots']
            for rule_id, record in self.reports[path][root]['clauses'].items():
                if 'path' not in record or 'edit' not in record:
                    continue
                try:
                    edit = ast.literal_eval(record['edit'])
                except (SyntaxError, ValueError):
                    continue
                item = (record['path'], edit, path)
                if item not in result[rule_id]:
                    result[rule_id].append(item)
        return result


def error_records(errors):
    return [dict(path=list(e.absolute_path), schema_path=list(e.absolute_schema_path),
                 keyword=e.validator, message=e.message, context=error_records(e.context)) for e in errors]


def comparison_messages(records):
    """Stock oneOf prints the entire alternatives on its multiple-match refusal."""
    def owner_schema(value):
        if isinstance(value, dict):
            return {key: owner_schema(item) for key, item in value.items() if key != 'x-pm-oracle-id'}
        if isinstance(value, list):
            return [owner_schema(item) for item in value]
        return value

    result = []
    for record in records:
        message = record['message']
        if record['keyword'] == 'oneOf' and 'x-pm-oracle-id' in message:
            head, separator, alternatives = message.rpartition(' is valid under each of ')
            if separator:
                try:
                    match_schemas = ast.literal_eval('(' + alternatives + ',)')
                except (SyntaxError, ValueError):
                    match_schemas = ()
                if len(match_schemas) >= 2 and all(isinstance(item, dict) for item in match_schemas):
                    message = head + separator + ', '.join(repr(owner_schema(item)) for item in match_schemas)
        result.append(dict(record, message=message, context=comparison_messages(record['context'])))
    return result


def finite_implication(validator, nodes, info, keyword, cut, path):
    """Check a co-required finite rule against the compound schema's other rule."""
    if keyword not in ('type', 'enum', 'minimum', 'minLength', 'maxLength', 'pattern'):
        return None
    node = info['node']
    other_at_path = {name for name, seen_path in pilot.located_errors(cut) if seen_path == tuple(path)}
    options = defaultdict(list)
    for location, candidate in nodes.items():
        schema = candidate['node']
        for finite in ('const', 'enum'):
            other = location + '/' + finite
            if finite not in schema or (schema is node and finite == keyword):
                continue
            if validator.VALIDATORS[finite] is not Draft202012Validator.VALIDATORS[finite]:
                continue
            values = [schema[finite]] if finite == 'const' else schema[finite]
            if keyword == 'type':
                types = node[keyword] if isinstance(node[keyword], list) else [node[keyword]]

                def type_ok(value):
                    if value is None or type(value) in (bool, str):
                        return any(validator.is_type(value, kind) for kind in types)
                    if type(value) is int and abs(value) <= 2**53:
                        return all(any(validator.is_type(number, kind) for kind in types)
                                   for number in (value, float(value)))
                    return False

                holds = all(type_ok(value) for value in values)
            elif keyword == 'enum':
                holds = (validator.VALIDATORS['enum'] is Draft202012Validator.VALIDATORS['enum'] and
                         all(isinstance(value, str) and value in node[keyword] for value in values))
            elif keyword == 'minimum':
                holds = (inspect.unwrap(validator.VALIDATORS['minimum']) is Draft202012Validator.VALIDATORS['minimum'] and
                         all(type(value) is int and abs(value) <= 2**53 and value >= node[keyword] for value in values))
            elif keyword == 'pattern':
                holds = (validator.VALIDATORS['pattern'] is stage.exact_pattern and
                         all(isinstance(value, str) and re.fullmatch(node[keyword], value) for value in values))
            else:
                bound = node[keyword]
                holds = all(isinstance(value, str) and
                            (len(value) >= bound if keyword == 'minLength' else len(value) <= bound)
                            for value in values)
            if holds:
                options[other].extend(candidate['reach'])
    covering = set()
    for reach in info['reach']:
        scope = rules.scope_of(reach, nodes)
        applicable = [other for other, reaches in options.items()
                      if any(peer['ipath'] == reach['ipath'] and rules.applies(peer, scope) for peer in reaches)]
        if not applicable:
            return None
        covering.update(applicable)
    observed = sorted(covering & other_at_path)
    if observed:
        return dict(covering_rule=observed[0], covering_rules=sorted(covering),
                    premise='Every occurrence has a co-required finite rule whose allowed JSON values satisfy this rule.')
    return None


def conditional_union_implication(nodes, rule_id, path, cut):
    """Two exhaustive branches already restrict the value to the same union."""
    field = path[-1] if path else None
    if tuple(path[:-1]) == ('current_outbox', 'record') and field in ('activation_receipt', 'staging_source'):
        location = 'https://puppetmaster.local/proposals/workflow_activation_sources.v4.schema.json#/$defs/StartOutboxIntent'
        selector, selected = 'phase', 'reserved'
    elif tuple(path[-2:]) == ('transition', 'before') and '#/$defs/TransitionCommitment/' in rule_id:
        location = rule_id.split('#/$defs/TransitionCommitment/', 1)[0] + '#/$defs/TransitionCommitment'
        selector, selected = 'rule', 'activation_begin'
    else:
        return None
    member = f'{location}/properties/{field}'
    if rule_id not in (member + '/anyOf', member + '/anyOf/1/type'):
        return None
    node = nodes[location]['node']
    conditional = node['allOf'][0]
    condition = conditional['if']['properties'][selector]
    optional = node['properties'][field]['anyOf']
    required_null = conditional['then']['properties'][field]
    required_object = conditional['else']['properties'][field]
    if not (set(conditional['if']) <= {'properties', 'x-pm-oracle-id'} and
            list(conditional['if']['properties']) == [selector] and condition.get('const') == selected and
            set(condition) <= {'const', 'x-pm-oracle-id'} and
            selector in node['required'] and field in node['required'] and
            len(optional) == 2 and isinstance(required_object.get('$ref'), str) and
            optional[0].get('$ref') == required_object['$ref'] and
            set(optional[0]) <= {'$ref', 'x-pm-oracle-id'} and
            set(required_object) <= {'$ref', 'x-pm-oracle-id'} and
            optional[1].get('type') == required_null.get('type') == 'null' and
            set(optional[1]) <= {'type', 'x-pm-oracle-id'}):
        return None
    other = required_null['x-pm-oracle-id'] + '/type'
    if (other, tuple(path)) not in pilot.located_errors(cut):
        return None
    return dict(covering_rule=other, object_branch=required_object['$ref'], selector=selector, selected_value=selected,
                source=location, premise='The selected branch requires null. The other branch requires the same object reference as the union.')


def co_reached(candidate, target, nodes, parent=False):
    return all(any(peer['ipath'] == (reach['ipath'][:-1] if parent else reach['ipath']) and
                   rules.applies(peer, rules.scope_of(reach, nodes)) for peer in candidate['reach'])
               for reach in target['reach'])


def member_and_type_implication(plain, nodes, info, name, keyword, cut, path):
    node = info['node']
    after = {rule for rule, instance_path in pilot.located_errors(cut) if instance_path == tuple(path)}
    if keyword in ('additionalProperties', 'unevaluatedProperties'):
        both = ('additionalProperties', 'unevaluatedProperties')
        if not all(node.get(field) is False for field in both):
            return None
        allowed = {'$comment', '$defs', '$id', '$schema', 'properties', 'required', 'type', 'x-pm-oracle-id', *both}
        other = name.rsplit('/', 1)[0] + '/' + next(field for field in both if field != keyword)
        if 'properties' in node and set(node) <= allowed and other in after:
            return dict(covering_rule=other, properties=sorted(node['properties']),
                        premise='Both member checks use the same listed properties. This object has no other property applicator.')
    if keyword == 'type' and node[keyword] in ('object', 'array', 'string', 'boolean', 'null'):
        same_type = [rule for rule in after if rule != name and rule.endswith('/type')]
        for rule in sorted(same_type):
            candidate = nodes.get(rule.rsplit('/', 1)[0])
            if candidate and candidate['node'].get('type') == node[keyword] and co_reached(candidate, info, nodes):
                return dict(covering_rule=rule, required_type=node[keyword],
                            premise='The co-required type rule applies at every occurrence of the disabled rule.')
    if keyword == 'minLength' and node.get('format') == 'date-time':
        from pm_goal_own_c_roots import _owner_formats
        dt = world.NR.DT
        checker = plain.format_checker.checkers['date-time']
        expression = dt._DATE_TIME.pattern
        minimum_width = re._parser.parse(expression, 0).getwidth()[0]
        other = name.rsplit('/', 1)[0] + '/format'
        if (checker in [_owner_formats(profile).checkers['date-time'] for profile in dt.PROFILES]
                and node[keyword] <= minimum_width and other in after):
            source = Path(dt.__file__)
            return dict(covering_rule=other, regex=expression, minimum_width=minimum_width,
                        source=str(source.relative_to(ROOT)), source_sha256=sha(source),
                        premise='Each owner date-time profile first requires a full match of this grammar.')
    return None


def completion_child_implication(nodes, info, name, keyword, cut, path):
    if name != COMPLETION_SOURCE + '/allOf/1/required' or keyword != 'required':
        return None
    for rule, seen_path in pilot.located_errors(cut):
        if seen_path != tuple(path) or not rule.endswith('/CompletionRequirementSource/required'):
            continue
        candidate = nodes[rule.rsplit('/', 1)[0]]
        if set(info['node']['required']) <= set(candidate['node']['required']) and co_reached(candidate, info, nodes):
            return dict(covering_rule=rule, members=info['node']['required'],
                        premise='The two required-member rules apply to the same object in every branch.')
    return None


def empty_completion_children(nodes, info):
    name = COMPLETION_SOURCE + '/allOf/1/properties/required_children'
    candidate = nodes.get(name)
    if not candidate or candidate['node'].get('maxItems') != 0:
        return None
    for reach in info['reach']:
        path = reach['ipath']
        if path[:4] != (*REQUIRED_CHILDREN, '#') or not any(
                peer['ipath'] == REQUIRED_CHILDREN and rules.applies(peer, rules.scope_of(reach, nodes))
                for peer in candidate['reach']):
            return None
    return name + '/maxItems'


def update_implication(nodes, info, name, keyword, cut, path):
    """Check the original WorkflowUpdate discriminator and its required cause."""
    marker = '#/$defs/WorkflowUpdate'
    if keyword == 'enum' and name.endswith(marker + '/properties/cause/enum'):
        update = name.split(marker, 1)[0] + marker
    elif keyword == 'type' and name.endswith('#/$defs/TransitionCommitment/type'):
        update = name.split('#/$defs/TransitionCommitment/', 1)[0] + marker
    else:
        return None
    entry = nodes.get(update)
    if entry is None:
        return None
    schema = entry['node']
    members = schema['properties']
    if not {'cause', 'transition'} <= set(schema['required']):
        return None
    transition_ref = members['transition'].get('$ref')
    if transition_ref != '#/$defs/TransitionCommitment':
        return None
    transition = entry['resolver'].lookup(transition_ref)
    rule_ref = transition.contents['properties']['rule'].get('$ref')
    if rule_ref != '#/$defs/BoundTransitionRule' or 'rule' not in transition.contents['required']:
        return None
    allowed = transition.resolver.lookup(rule_ref).contents['enum']
    choices = {}
    def only(node, key):
        return set(node) - {'x-pm-oracle-id'} == {key}
    for term in schema['allOf']:
        condition, action = term['if'], term['then']
        if not only(condition, 'properties') or set(condition['properties']) != {'transition'}:
            return None
        condition = condition['properties']['transition']
        if not only(condition, 'properties') or set(condition['properties']) != {'rule'}:
            return None
        selector = condition['properties']['rule']
        if not only(selector, 'const'):
            return None
        required = action['properties']['cause']
        choices[selector['const']] = (required['const'], required['x-pm-oracle-id'] + '/const')
    if len(choices) != len(schema['allOf']) or set(choices) != set(allowed):
        return None
    if keyword == 'enum' and name == update + '/properties/cause/enum':
        if any(value not in members['cause']['enum'] for value, _ in choices.values()):
            return None
        after = {rule for rule, here in pilot.located_errors(cut) if here == tuple(path)}
        if not after.intersection(rule for _, rule in choices.values()):
            return None
        return dict(covering_rules=choices, source=update,
                    premise='Every allowed transition rule requires a cause from the disabled enum.')
    if keyword == 'type' and co_reached(entry, info, nodes, parent=True):
        after = {rule for rule, here in pilot.located_errors(cut) if here == tuple(path[:-1]) + ('cause',)}
        if len({value for value, rule in choices.values() if rule in after}) >= 2:
            return dict(covering_rules=choices, source=update,
                        premise='A non-object transition leaves all property-only conditions true. Two of their required causes conflict.')
    return None


def afterimages_implication(nodes, name, cut, path):
    if name.endswith('#/$defs/WorkflowMutationOrigin/properties/afterimages/oneOf'):
        location = name.removesuffix('/properties/afterimages/oneOf')
        discriminator = 'method'
    elif '/workflow_cancel_original_start_profile.' in name and name.endswith('#/$defs/Origin/properties/afterimages/oneOf'):
        location = name.removesuffix('/properties/afterimages/oneOf')
        discriminator = 'issuer_method'
    else:
        return None
    entry = nodes[location]
    node = entry['node']
    props = node['properties']
    annotation = 'x-pm-oracle-id'
    if not {discriminator, 'afterimages'} <= set(node['required']):
        return None
    options = {}
    for arm in node['allOf']:
        condition = arm['if']
        if (set(condition) - {annotation} != {'properties'} or
                set(condition['properties']) != {discriminator}):
            return None
        selector = condition['properties'][discriminator]
        if set(selector) - {annotation} != {'const'}:
            return None
        branch = arm['then']['properties']['afterimages']
        if set(branch) - {annotation} != {'$ref'} or selector['const'] in options:
            return None
        options[selector['const']] = branch['$ref']
        if 'else' in arm:
            alternatives = set(props[discriminator]['enum']) - {selector['const']}
            alternate = arm['else']['properties']['afterimages']
            if len(node['allOf']) != 1 or len(alternatives) != 1 or set(alternate) - {annotation} != {'$ref'}:
                return None
            options[next(iter(alternatives))] = alternate['$ref']
    union = props['afterimages']['oneOf']
    if (len(set(options.values())) != len(options) or set(options) != set(props[discriminator]['enum']) or
            any(set(branch) - {annotation} != {'$ref'} for branch in union) or
            sorted(branch['$ref'] for branch in union) != sorted(options.values())):
        return None
    definitions = {}
    for ref in options.values():
        branch = entry['resolver'].lookup(ref).contents
        if (branch.get('type') != 'object' or branch.get('additionalProperties') is not False or
                branch.get('patternProperties')):
            return None
        definitions[ref] = (set(branch['required']), set(branch['properties']))
    definitions_list = list(definitions.values())
    for index, (required, allowed) in enumerate(definitions_list):
        if any(not (required - other_allowed or other_required - allowed)
               for other_required, other_allowed in definitions_list[:index]):
            return None
    other = {rule for rule, instance_path in pilot.located_errors(cut)
             if instance_path[:len(path)] == tuple(path)}
    if not other:
        return None
    return dict(covering_rules=sorted(other), method_references=options, source=location,
                premise='Each allowed method requires a union branch. Their closed member sets and required members make the branches mutually exclusive.')


def event_clock_implication(plain, nodes, info, name, keyword, cut, path):
    """The bank applies the same shared time profile at the enclosing event property."""
    marker = '#/$defs/Event_date_time_string/'
    if keyword not in ('type', 'format') or marker not in name:
        return None
    if info['node'].get('type') != 'string' or info['node'].get('format') != 'date-time':
        return None
    from pm_goal_own_c_roots import _owned_properties, _timestamp_profiles
    if plain.VALIDATORS['properties'] is not _owned_properties:
        return None
    if not any(error.validator == keyword and tuple(error.absolute_path) == tuple(path) and
               error.message == 'shared timestamp profile refused' for error in world._leaves(cut)):
        return None
    location = name.split(marker, 1)[0] + '#/$defs/EventRecord'
    owner = nodes.get(location)
    if owner is None or not co_reached(owner, info, nodes, parent=True):
        return None
    verified = {}
    original = plain._resolver.lookup(location)
    clock = plain._resolver.lookup(name.rsplit('/', 1)[0]).contents
    profiles = _timestamp_profiles(original.contents)
    if profiles != _timestamp_profiles(owner['node']):
        return None
    for reach in info['reach']:
        field = reach['ipath'][-1]
        if field not in profiles or field == 'expires_at_utc':
            return None
        ref = original.contents['properties'][field].get('$ref')
        if not ref or original.resolver.lookup(ref).contents is not clock:
            return None
        verified[field] = profiles[field]
    source = Path(inspect.getsourcefile(_owned_properties))
    return dict(covering_source=location, covering_profiles=verified, evaluator=str(source.relative_to(ROOT)),
                evaluator_sha256=sha(source), evaluator_line=_owned_properties.__code__.co_firstlineno,
                premise='The enclosing property applies its selected shared date-time checker after the field schema. The same check enforces string type and the installed format profile.')


def preflight_implication(nodes, info, name, keyword, cut, path):
    after = list(pilot.located_errors(cut))
    annotation = 'x-pm-oracle-id'
    for definition in PREFLIGHT_CHOICES:
        location = PREFLIGHT_CUSTODY + definition
        entry = nodes.get(location)
        if entry is None:
            continue
        node = entry['node']
        branches = node['oneOf']
        other = location + '/oneOf'
        if len(branches) < 2 or any(set(arm) - {annotation} != {'properties'} for arm in branches):
            continue
        if keyword == 'type' and name == location + '/type' and node['type'] == 'object':
            if (other, tuple(path)) in after:
                return dict(covering_rule=other, source=location,
                            premise='Every property-only alternative matches a non-object, so oneOf refuses the multiple match.')
        if keyword == 'enum' and path and path[-1] in node['required'] and co_reached(entry, info, nodes, parent=True):
            field = path[-1]
            pins = [arm['properties'].get(field, {}) for arm in branches]
            if (all(set(pin) - {annotation} == {'const'} and pin['const'] in info['node']['enum'] for pin in pins)
                    and (other, tuple(path[:-1])) in after):
                return dict(covering_rule=other, field=field, required_values=[pin['const'] for pin in pins],
                            source=location, premise='Each alternative requires a value from the disabled enum.')
    return None


def accepted_branch_controls(plain, validator, controls, seeds, info, cache):
    """Reuse the Goal suite's branch fixture construction."""
    for reach in info['reach']:
        for seed_index, seed in enumerate(seeds):
            for variant in range(3):
                key = (seed_index, reach['ipath'], tuple(rules.ctx_key(c) for c in reach['ctx']), variant)
                if key not in cache:
                    try:
                        value, path = rules.realize(seed, reach, variant, validator)
                    except (KeyError, IndexError, TypeError, ValueError, RecursionError):
                        value, path = None, None
                    cache[key] = None
                    if path is None or value is None or value == seed:
                        continue
                    if list(plain.iter_errors(value)) or rules.errors_of(validator, value):
                        continue
                    digest = stage.sweep.digest(value)
                    index = next((i for i, control in enumerate(controls) if stage.sweep.digest(control) == digest), None)
                    if index is None:
                        index = len(controls)
                        controls.append(value)
                    cache[key] = (index, path)
                if cache[key] is not None:
                    yield cache[key]


def per_rule_candidates(plain, validator, controls, seeds, info, keyword, old, cache, siblings):
    def edits(control, path):
        node = info['node']
        value = rules.get(control, path)
        yield from rules.defects(keyword, node, value)
        if keyword == 'maxItems' and node['x-pm-oracle-id'] == COMPLETION_SOURCE + '/allOf/1/properties/required_children':
            record = rules.get(control, REQUIRED_CHILDREN[:-1])
            identity = record['identity']
            yield [dict(parent_goal_id=identity['goal_id'], parent_goal_run_id=identity['goal_run_id'],
                        child_goal_id='TEST_ONLY:child-goal', child_goal_run_id='TEST_ONLY:child-run',
                        original_child_requirement_source=record['original_requirement_authority_sources'][0])]
        if (keyword == 'oneOf' and isinstance(value, dict) and
                node['x-pm-oracle-id'] in (PREFLIGHT_CUSTODY + name for name in PREFLIGHT_CHOICES)):
            for arm in node['oneOf']:
                for field, rule in arm['properties'].items():
                    if value.get(field) != rule['const']:
                        yield dict(value, **{field: rule['const']})

    for index, control in enumerate(controls):
        for path, edit, source in old:
            try:
                yield index, stage.actual_path(control, path), edit, source
            except (KeyError, IndexError, TypeError, ValueError):
                continue
        for reach in info['reach']:
            for path in rules.concrete(control, reach['ipath']):
                for edit in edits(control, path):
                    yield index, path, edit, 'installed rule'
                outbox_field = tuple(path[:-1]) == ('current_outbox', 'record') and path[-1] in ('activation_receipt', 'staging_source')
                if outbox_field or tuple(path[-2:]) == ('transition', 'before'):
                    for candidate in controls:
                        alternate = rules.get(candidate, path)
                        if alternate is not None:
                            yield index, path, alternate, 'value from another accepted branch'
    if keyword in ('const', 'enum', 'type', 'minLength', 'minimum'):
        for reach in info['reach']:
            candidates = rules.siblings(info['node']['x-pm-oracle-id'], reach['ipath'], siblings)
            for index, control in enumerate(controls):
                for path in rules.concrete(control, reach['ipath']):
                    for edit in candidates:
                        yield index, path, edit, 'co-required schema value'
    for index, path in accepted_branch_controls(plain, validator, controls, seeds, info, cache):
        for edit in edits(controls[index], path):
            yield index, path, edit, 'accepted branch document'


def replay_rule(plain, validator, nodes, controls, seeds, rule_id, info, keyword, old, disable, cache, siblings):
    node = info['node']
    if all(any(c[0] in ('if', 'not') for c in reach['ctx']) for reach in info['reach']):
        return dict(cls='SELECTOR_OR_NEGATED', reason='all occurrences are inside an if condition or negation'), None
    if keyword in ('minItems', 'minLength', 'minProperties') and node[keyword] == 0:
        return dict(cls='VACUOUS', reason=f'{keyword}: 0 holds for every applicable value'), None
    _, guard = closure._clause_identity(node, keyword)
    result = mismatch = None
    tried = set()
    for index, path, edit, source in per_rule_candidates(plain, validator, controls, seeds, info, keyword, old, cache, siblings):
        candidate_key = (index, tuple(path), repr(edit))
        if candidate_key in tried:
            continue
        tried.add(candidate_key)
        try:
            changed = rules.apply(controls[index], path, edit)
        except (KeyError, IndexError, TypeError, ValueError):
            continue
        located = (rule_id, tuple(path))
        before = rules.errors_of(validator, changed)
        if located not in pilot.located_errors(before):
            continue
        actual = error_records(plain.iter_errors(changed))
        guarded = error_records(before)
        if guarded != actual and comparison_messages(guarded) != actual:
            if mismatch is None:
                mismatch = dict(reason='validator instrumentation changed the original messages',
                                path=list(path), edit=repr(edit), control=index, original=actual,
                                instrumented=error_records(before))
            continue
        cut = rules.errors_of(validator, changed, set() if disable == 'clause' else {guard})
        restored = rules.errors_of(validator, changed)
        require(rule_id not in rules.locations(cut) and error_records(restored) == guarded and
                (guarded == actual or error_records(plain.iter_errors(changed)) == actual),
                f'{rule_id}: individual rule disable or restoration failed')
        implication = None
        if cut:
            implication = (finite_implication(plain, nodes, info, keyword, cut, path) or
                           conditional_union_implication(nodes, rule_id, path, cut) or
                           member_and_type_implication(plain, nodes, info, rule_id, keyword, cut, path) or
                           update_implication(nodes, info, rule_id, keyword, cut, path) or
                           afterimages_implication(nodes, rule_id, cut, path) or
                           event_clock_implication(plain, nodes, info, rule_id, keyword, cut, path) or
                           preflight_implication(nodes, info, rule_id, keyword, cut, path) or
                           completion_child_implication(nodes, info, rule_id, keyword, cut, path) or
                           stage.regex_implication(plain, node, keyword, rule_id, path, cut))
        record = dict(path=list(path), edit=repr(edit), edit_source=source, control=index,
                      input_sha256=stage.sweep.digest(changed), before=actual, cut=comparison_messages(error_records(cut)),
                      restored=actual)
        if cut and implication is None:
            if result is None:
                result = record
            continue
        if implication:
            record['implication'] = implication
        record['cls'] = 'COVERED_LATER' if cut else 'KILLED'
        return record, None
    if result is None and mismatch is None:
        covering = empty_completion_children(nodes, info)
        if covering:
            return dict(cls='UNREACHABLE', covering_rule=covering,
                        premise='Every occurrence requires an item of the same array that must be empty.'), None
        proof = (rules.contradicted_branch(info, nodes) or rules.forbidden_member(info, nodes) or
                 rules.excluded_by_cases(info, nodes))
        if all(reach['empty_domain'] for reach in info['reach']):
            proof = 'Every occurrence requires an item of an array whose installed schema has maxItems: 0.'
        if proof:
            return dict(cls='UNREACHABLE', premise=proof), None
    return None, (result or mismatch or {'reason': 'no example exercised the exact rule on the accepted documents'})


def replay_root(fixture, captured, reference, examples, disable):
    bank = fixture.bank.original
    selector = captured['schema']['$ref']
    plain = bank.validator(selector)
    root = captured['root']
    bank_name = type(bank).__module__ + '.' + type(bank).__qualname__
    validator_name = type(plain).__module__ + '.' + type(plain).__qualname__
    require(bank_name == reference['bank'] and validator_name == reference['validator_class'] and
            json.loads(reference['schema']) == plain.schema == captured['schema'] and
            closure._registry_digest(plain) == reference['registry_sha256'] == captured['registry_sha256'],
            f'{root}: installed bank, schema or registry differs from the fresh walk')
    # Each DG5 reference walk used a fresh annotation cache. Shared resources
    # must receive their location from this registry's exact retrieval URIs.
    closure.PREPARED.clear()
    rules.SCOPES.clear()
    validator = closure.closure_validator(plain, root, bank)
    nodes, ids = closure._clause_inventory(validator)
    expected = reference['clause_ids']
    if disable == 'inventory':
        expected = expected[1:]
    require(ids == expected and closure._clause_inventory_pin(ids) == reference['clause_inventory'],
            f'{root}: exact rule inventory differs from the fresh walk, '
            f'only current={sorted(set(ids) - set(expected))[:3]}, '
            f'only reference={sorted(set(expected) - set(ids))[:3]}')
    controls = list(fixture.variants(captured))
    seeds = tuple(controls)
    siblings = defaultdict(list)
    for location, info in nodes.items():
        for reach in info['reach']:
            siblings[reach['ipath']].append((location, info['node'], info['resolver']))
    require(all(not error_records(plain.iter_errors(value)) and not rules.errors_of(validator, value)
                for value in controls), f'{root}: accepted schema control refused')
    results, gaps, branch_cache = {}, {}, {}
    for location, info in nodes.items():
        node = info['node']
        for keyword in rules.clauses_of(node):
            rule_id = location + '/' + closure.clause_name(node, keyword)
            record, problem = replay_rule(plain, validator, nodes, controls, seeds, rule_id, info, keyword,
                                          examples.get(rule_id, ()), disable, branch_cache, siblings)
            (gaps if problem else results)[rule_id] = problem or record
    require(set(results) | set(gaps) == set(ids), f'{root}: incomplete rule accounting')
    for name, result in results.items():
        covering = result.get('covering_rule')
        if covering:
            require(results.get(covering, {}).get('cls') == 'KILLED',
                    f'{name}: the empty array rule must have an isolated refusal')
    return dict(clauses=results, gaps=gaps, controls=controls, clause_inventory=reference['clause_inventory'],
                clause_ids=ids, bank=bank_name, registry_sha256=reference['registry_sha256'],
                schema=captured['schema'], validator_class=validator_name,
                schema_sources=bank.resource_origins)


def run_case(case, reference, prior_row, output, disable, selected=None):
    started = time.monotonic()
    name = case['row']
    mapping = reference['rows'][name]
    roots = {ident: reference['roots'][ident] for ident in mapping['roots']}
    seed = int(os.environ['PYTHONHASHSEED'])
    specs = [entry for entry in case['fixtures']
             if (entry['root'] == selected if selected is not None else entry['hash_seed'] == seed)]
    require(specs, f'{name}: no fixture is declared for the selected root or seed')
    sites = {(item['path'], item['line']) for item in mapping['current_sites']}
    require(all(sha(ROOT / item['path']) == item['sha256'] and
                (ROOT / item['path']).read_text().splitlines()[item['line'] - 1].strip() == item['line_text']
                for item in mapping['current_sites']), f'{name}: current validator source changed')
    pilot.PREFIX = TABLE_PREFIX
    pilot.SITES.clear()
    pilot.SITES[name] = min(sites)
    pilot.configure_tables()
    output.mkdir(parents=True)
    report = dict(row=name, status='NOT_COVERED', roots={}, calls={},
                  reference_sha256=reference.get('archive_sha256', REFERENCE_SHA),
                  current_sites=mapping['current_sites'], seed=seed)
    collector = stage.sweep.Collector()
    examples = PreviousExamples()
    original_roots = {item['root']: item for item in prior_row['schema_closure']['roots']}
    try:
        suite = stage.original.Suite(output / 'stores')
        require(set(roots) <= set(original_roots), f'{name}: fresh root has no historical example binding')
        for spec in specs:
            fixture = Fixture(suite, spec['route'], spec['edition'])
            experiment = CompleteCall(fixture, name, sites, spec)
            try:
                documents = experiment.prove(collector, disable)
            finally:
                report['calls'][spec['root']] = experiment.runs
            require({document['root'] for document in documents} == {spec['root']},
                    f"expected {spec['root']}, observed {[document['root'] for document in documents]}")
            ident = spec['root']
            report['roots'][ident] = replay_root(fixture, documents[0], roots[ident],
                                                examples.entries(original_roots[ident]), disable)
        require(not collector.failures, f'unexpected complete-call failures: {collector.failures}')
        target = pilot.run_gates(collector, output, [name])
        bindings = json.loads((target / 'source-bindings.json').read_bytes())
        for path in {Path(__file__), Path(stage.__file__), *(ROOT / file for file, _ in sites)}:
            bindings['files'][str(path.relative_to(ROOT))] = sha(path)
        write(target / 'source-bindings.json', bindings)
        results = {}
        inventories = {}
        for ident, root in report['roots'].items():
            keys = ('clause_ids', 'clause_inventory', 'bank', 'registry_sha256', 'schema',
                    'validator_class', 'schema_sources')
            inventories[ident] = {key: root[key] for key in keys}
            inventories[ident].update(rows=[name], families=[FAMILY])
            counts = Counter(item['cls'] for item in root['clauses'].values())
            entries = dict(root['clauses'])
            entries.update((rule, dict(cls='UNCOVERED', detail=detail)) for rule, detail in root['gaps'].items())
            counts['UNCOVERED'] = len(root['gaps'])
            results[ident] = dict(inventories[ident], clauses=entries, counts=dict(counts),
                                  verify=dict(passed=counts['KILLED'] + counts['COVERED_LATER'],
                                              failed=0, unverifiable=0))
        write(output / 'exact-inventory.json', dict(mode='assertion-inventory', roots=inventories))
        write(output / 'clause-replay.json', {'roots': results})
        require(all(not root['gaps'] for root in report['roots'].values()), 'exact rule tests incomplete')
        report['status'] = 'READY_FOR_MATRIX'
    except (ValueError, KeyError, TypeError) as error:
        report['reason'] = str(error)
    finally:
        report.update(seconds=round(time.monotonic() - started, 3), historical_example_inputs=examples.pins)
        write(output / 'result.json', report)
    return report


def load_reference(path, cases):
    digest = sha(path)
    require(digest in (REFERENCE_SHA, FULL_REFERENCE_SHA), 'fresh reference bundle changed')
    with gzip.open(path, 'rt') as stream:
        reference = json.load(stream)
    if digest == REFERENCE_SHA:
        return reference
    require(reference['source']['checker_overlay'] == FULL_REFERENCE_OVERLAY, 'unexpected checker source edition')

    # The whole-family capture can list more than one exact variant under a
    # historical root ID. Keep this runner limited to complete, unambiguous
    # rows and carry every literal rule from the selected published variant.
    rows, roots = {}, {}
    for case in cases:
        name = case['row']
        row = reference['rows'][name]
        require(not row['historical_roots_without_current_row_binding'],
                f'{name}: earlier root bindings are still unresolved')
        identifiers = []
        for item in row['current_roots']:
            ident = item['root']
            variant = reference['roots'][ident][item['variant_sha256']]
            require(ident not in identifiers and (ident not in roots or roots[ident] == variant),
                    f'{name}: multiple exact variants share {ident}')
            identifiers.append(ident)
            roots[ident] = variant
        sites = []
        for file, line in row['sites']:
            source = subprocess.check_output(['git', 'show', f'{FULL_REFERENCE_OVERLAY}:{file}'], cwd=ROOT)
            sites.append(dict(path=file, line=line, sha256=hashlib.sha256(source).hexdigest(),
                              line_text=source.decode().splitlines()[line - 1].strip()))
        rows[name] = dict(roots=identifiers, current_sites=sites)
    return dict(rows=rows, roots=roots, archive_sha256=digest)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--matrix', type=Path, required=True)
    parser.add_argument('--reference', type=Path, required=True)
    parser.add_argument('--case', type=Path, action='append', required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--disable', choices=('row', 'clause', 'inventory'))
    parser.add_argument('--root', help='replay one exact declared root and publish its proof fragment')
    args = parser.parse_args()
    cases = [json.loads(path.read_bytes()) for path in args.case]
    reference = load_reference(args.reference, cases)
    _, rows, _ = stage.matrix_inputs(args.matrix)
    world.v3_edition()
    world.v7_edition()
    okay = True
    for case in cases:
        name = case['row']
        specs = case['fixtures']
        require(sorted(row['root'] for row in specs) == sorted(reference['rows'][name]['roots']),
                f'{name}: declaration omits or repeats an exact root')
        report = run_case(case, reference, rows[name], args.out / stage.sweep.table_id([name]),
                          args.disable, args.root)
        print(name, report['status'], report['seconds'], report.get('reason', ''), flush=True)
        okay &= report['status'] == 'READY_FOR_MATRIX'
    return 0 if okay else 1


if __name__ == '__main__':
    sys.exit(main())
