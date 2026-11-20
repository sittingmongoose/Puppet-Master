#!/usr/bin/env python3
"""Replay declared Goal update and certification schema examples on pinned owner sources.

Each row declaration records a census root, a complete owner call and one
invalid example per literal rule. The installed source tree supplies the
owner, registry, exact rule walker and gated table runner.
"""
import argparse
from collections import Counter
from contextlib import ExitStack
import copy
import gzip
import hashlib
import json
import multiprocessing
from pathlib import Path
import shutil
import subprocess
import sys
import time
from unittest.mock import patch
from uuid import UUID


HERE = Path(__file__).resolve().parent
PREFIX = 'pm_goal_dg5_methodb_pilot_phase_'


def require(condition, detail):
    if not condition:
        raise ValueError(detail)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write(path, document):
    path.write_text(json.dumps(document, indent=2, sort_keys=True) + '\n')


def errors_list(errors):
    return [[list(error.absolute_path), list(error.absolute_schema_path), error.validator,
             error.message, errors_list(error.context)] for error in errors]


def edit_example(go, document, path, change):
    go.get(document, path)
    if change.get('birth_selector'):
        edit = copy.deepcopy(document['record']['birth'])
    else:
        edit = tuple(change['member']) if 'member' in change else change['value']
    return go.apply(document, path, edit)


def update_fixture(route, path):
    import pm_goal_dg_u_oracles as oracle

    if route in ('approval_request', 'approval_resolution'):
        return approval_fixture(oracle, route, path)
    w = oracle.world(path)
    if route == 'body_start':
        captured = []

        def before_start(*args):
            captured.extend(args)
            raise RootCapture

        with patch.object(w.body, 'start', before_start):
            try:
                oracle.O.birth_goal(w)
            except RootCapture:
                pass
        require(len(captured) == 5, 'birth fixture did not supply body start arguments')
        marker = UUID('696965ee-ec46-4f9b-b0ba-1651f5958cc7')
        stamp = w.now()

        def start():
            with patch.object(w, 'now', return_value=stamp), patch.object(oracle.O.uuid, 'uuid4',
                                                                         return_value=marker):
                return w.body.start(*captured)

        return w, start
    goal = oracle.O.birth_goal(w)
    if route == 'admit':
        document = oracle.O.direct_request(w, goal, 'Stage 3 request control')
        timestamp = w.now()
        marker = UUID('2a4f4713-f9d9-4324-9470-1c92785ca940')

        def admit():
            with patch.object(w, 'now', return_value=timestamp), patch.object(oracle.O.uuid, 'uuid4',
                                                                            return_value=marker):
                return w.sir.admit(document)

        return w, admit
    _, admission = oracle.run_direct(w, goal)
    progress = oracle.progress(w, goal, oracle.op_of(admission))
    request = progress['body_commit']['receipt_request']
    actor = goal['user']
    permission = goal['user_permission']
    inspect = w.inspector
    if route == 'inspect':
        event_request = inspect.request_for(goal['scope'], progress['publication']['event_id'])
        return w, lambda: inspect.inspect(event_request, actor, permission)
    if route == 'input':
        return w, oracle._input_call(w, goal, oracle.op_of(admission))
    if route == 'receipt':
        return w, lambda: w.body.read_receipt(request, actor, permission)
    if route == 'oracle_receipt':
        return w, lambda: w.body.read_receipt_private(request, 'oracle')
    raise ValueError(route)


def approval_fixture(oracle, route, path):
    world, goal, proposal, _ = oracle._proposal(path)
    if route == 'approval_request':
        action = lambda: world.approvals.capture(proposal['command_instance_id'])
    else:
        approval = world.approvals.capture(proposal['command_instance_id'])
        approver = 'actor:TEST_ONLY:person'
        permission = world.permissions.grant(approver, goal['scope'], ['approve_goal_update'])
        action = lambda: world.approvals.decide(approval['approval_id'], 'approved', permission, approver)
    timestamp = world.now()
    marker = UUID('91f0f0c8-b8ac-4d87-8d47-191db28102ae')

    def complete():
        with patch.object(world, 'now', return_value=timestamp), patch.object(oracle.O.uuid, 'uuid4',
                                                                             return_value=marker):
            return action()

    return world, complete


def certified_fixture(route, path):
    import pm_goal_dg_cf2_oracles as oracle

    run = oracle.Run(path)
    w, ctx = run.w, run.ctx
    if route == 'guard':
        request = oracle.W.guard_request(w, ctx['scope'], ctx['op'], 'original_certification',
                                         'TEST_ONLY:guard-request:method-b')
        return w, lambda: w.guard.read_guard(request)
    if route == 'arm':
        run.until('prepare')
        return w, lambda: w.coordinator.arm(ctx, run.obs['prepared'])
    if route == 'f5d':
        # The original held append prepares real Event custody and barrier inputs.
        # Stop at the EventPhase owner's entry so each trial starts before its write.
        captured = []

        def save_entry(*args):
            captured.extend(args)
            raise RootCapture

        with patch.object(w.coordinator, 'f5d', save_entry):
            try:
                run.until('append')
            except RootCapture:
                pass
        require(len(captured) == 5, 'held append did not supply the EventPhase arguments')
        stamp = w.storage.now()

        def event_phase():
            with patch.object(w.storage, 'now', return_value=stamp):
                return w.coordinator.f5d(*captured)

        return w, event_phase
    if route == 'native':
        run.until('append')
        stamp = w.storage.now()

        def commit():
            with patch.object(w.storage, 'now', return_value=stamp):
                return w.coordinator.commit_native(ctx, run.obs['appended'])

        return w, commit
    if route == 'f5a':
        run.until('arm')
        intent, control = run.obs['intent'], run.obs['control_armed']
        preappend = w.coordinator.preappend_source(ctx)
        return w, lambda: w.coordinator.f5a(ctx, intent, control, preappend)
    if route == 'recover':
        run.until('arm')
        request = oracle.W.recovery_request(w, ctx, run.stored('intent')['record'])
        return w, lambda: w.coordinator.recover_original(request)
    raise ValueError(route)


class RootCapture(BaseException):
    pass


class OwnerCheck:
    def __init__(self, row, site, bank_class, source, scratch, declare, collector, disabled_check):
        self.row = row
        self.code = row.removeprefix('dg5/').removesuffix('/schema')
        self.site = site
        self.bank_class = bank_class
        self.source = source
        self.scratch = scratch
        self.declare = declare
        self.collector = collector
        self.disabled_check = disabled_check
        self.runs = []
        self.capture = None
        self.probe_root = False

    def call(self, action, edit, *, require_exact=False):
        import pm_goal_dg5_boundaries as bridge
        import pm_goal_dg5_closure as closure
        import pm_goal_guard_tables as tables

        original = self.bank_class.validate
        errors_method = self.bank_class.errors
        record = dict(errors=[], cut=self.row in tables.CUT, observations=[])
        changed = []
        expected = self.code + '/schema/'  # extra member is rejected at the enclosing object

        def observe(bank, *args):
            if args[-1] != self.code:
                return original(bank, *args)
            frame = sys._getframe(1)
            site = [str(Path(frame.f_code.co_filename).relative_to(self.source)), frame.f_lineno]
            require(site == self.site, f'owner call source changed: {site}')
            document = args[-2]
            if edit is not None:
                require(isinstance(document, dict), 'complete-call extra-member example needs an object')
                member = edit['member'][1]
                require(member not in document, 'test document already has the extra member')
                changed.append((document, member))
                document[member] = 'gc'
            validator_args = args[:-1]
            sink = []
            saved = closure.CAPTURE[0]
            closure.CAPTURE[0] = sink
            try:
                errors = errors_method(bank, *validator_args)
            finally:
                closure.CAPTURE[0] = saved
            require(sink, 'original schema validator was not captured')
            plain = sink[0]
            actual_bank = getattr(bank, 'scoped', bank)
            registry = closure._registry_digest(plain)
            key = (type(plain).__module__ + '.' + type(plain).__qualname__,
                   json.dumps(plain.schema, sort_keys=True), registry, type(actual_bank).__qualname__)
            ident = closure.root_id(key)
            record['observations'].append(dict(root=ident, registry_sha256=registry,
                                                document=copy.deepcopy(document), errors=errors_list(errors)))
            predicate = tables.predicates(tables.rows()[self.row])[self.row]
            decision = predicate({self.row: not errors}, None)
            require(decision == (self.row if errors else None), 'row table disagrees with the owner validator')
            self.collector.observe(self.row, not errors, tuple(site))
            if not errors and edit is None:
                self.capture = plain, actual_bank, copy.deepcopy(document)
                if self.declare.get('transaction') and self.probe_root:
                    raise RootCapture
            if decision and (not record['cut'] or self.disabled_check == 'row'):
                return original(bank, *validator_args, args[-1])
            return document

        try:
            with patch.object(self.bank_class, 'validate', observe):
                result = action()
            record['result_sha256'] = self.result_digest(result)
        except Exception as error:
            if type(error).__name__ not in bridge.REFUSAL_CLASSES:
                raise
            record['refusal'] = bridge.refusal_code(error)
            record['errors'] = [self.row if record['refusal'] == expected else bridge.row(record['refusal'])]
        finally:
            for document, member in changed:
                document.pop(member)
        self.runs.append(record)
        require(len(record['observations']) == 1, 'target must run exactly once in the complete call')
        if require_exact:
            require(record.get('refusal') == (expected if edit else None),
                    f"expected original validation message {expected if edit else None!r}, "
                    f"got {record.get('refusal')!r}")
        return record

    def result_digest(self, result):
        from pm_goal_go2_closure import value_sha

        return value_sha(result)

    def call_on_copy(self, world, action, edit, require_exact):
        import pm_goal_dg5_boundaries as bridge

        copied = self.scratch.parent / ('transaction-' + str(len(self.runs)))
        shutil.copytree(self.scratch, copied)
        root_path = world.storage.root
        require(root_path.is_relative_to(self.scratch), 'unexpected backing store')
        for attr in ('goal_store', 'd01_store'):
            store = getattr(world, attr, None)
            require(store is None or store is world.storage or store.root.is_relative_to(self.scratch),
                    'unexpected auxiliary backing store')
        manifest = bridge.manifest(bridge.file_state(copied))
        context = multiprocessing.get_context('fork')
        receiver, sender = context.Pipe(duplex=False)

        def run_child():
            try:
                with ExitStack() as changes:
                    stores = [world.storage, getattr(world, 'goal_store', None), getattr(world, 'd01_store', None)]
                    for store in {id(store): store for store in stores if store is not None}.values():
                        changes.enter_context(patch.object(store, 'root', copied / store.root.relative_to(self.scratch)))
                    record = self.call(action, edit, require_exact=require_exact)
                    record['store_wrote'] = bridge.manifest(bridge.file_state(copied)) != manifest
                    if record['errors']:
                        require(not record['store_wrote'], 'refused owner call changed its copied store')
                    sender.send(record)
            except Exception as error:
                sender.send({'exception': str(error)})
            finally:
                sender.close()

        child = context.Process(target=run_child)
        child.start()
        sender.close()
        try:
            record = receiver.recv()
        finally:
            receiver.close()
            child.join()
        require(child.exitcode == 0 and 'exception' not in record, record)
        self.runs.append(record)
        for observed in record['observations']:
            self.collector.observe(self.row, not observed['errors'], tuple(self.site))
        return record

    def prove(self, world, action):
        import pm_goal_dg5_boundaries as bridge
        import pm_goal_guard_tables as tables

        initial = bridge.manifest(bridge.file_state(self.scratch))
        for change in (None, {'member': ['add', 'methodb_extra']}, None):
            value = dict(store=initial, route=self.declare['route'], edit=change, site=self.site)

            def evaluate(document):
                require(document == value, 'complete-call input changed')
                require(not tables.CUT - {self.row}, 'multiple validation rows disabled')
                require(bridge.manifest(bridge.file_state(self.scratch)) == initial, 'sealed store changed')
                exact = not self.collector.replaying
                if self.declare.get('transaction'):
                    result = self.call_on_copy(world, action, change, exact)
                else:
                    result = self.call(action, change, require_exact=exact)
                require(bridge.manifest(bridge.file_state(self.scratch)) == initial, 'passive call changed the store')
                return result

            self.collector.invoke('Method B/' + self.declare['route'], evaluate, value, change is None,
                                  target=self.row if change else None, family=self.declare['family'])
            record = self.collector.ledger[-1]
            require(not self.collector.failures, self.collector.failures)
            require(record['outcome'] == ('exact_expected' if change else 'control'), record)
            if change:
                require(record['kill'] == 'KILLED',
                        f"complete-call cut result {record['kill']}: {record.get('cut_errors')}")
                before, cut, restored = self.runs[-3:]
                require(before == restored and before['observations'] == cut['observations'] and not cut['errors'],
                        'the complete call did not restore the same document and validation message')
        require(self.runs[0] == self.runs[-1], 'the restored accepted control changed')
        if self.declare.get('transaction'):
            self.probe_root = True
            try:
                self.call(action, None)
            except RootCapture:
                pass
            finally:
                self.probe_root = False
        return self.capture


CONTROL_PHASE_FIELDS = {
    'empty': (),
    'armed': ('intent',),
    'event_durable': ('intent', 'event_phase'),
    'native_committed': ('intent', 'event_phase', 'commit', 'origin'),
    'released': ('intent', 'event_phase', 'commit', 'origin', 'release'),
}


def control_phase(document, phase):
    doc = copy.deepcopy(document)
    record = doc['record']
    for member in CONTROL_PHASE_FIELDS['released']:
        record[member] = copy.deepcopy(record['birth']) if member in CONTROL_PHASE_FIELDS[phase] else None
    record['phase'] = phase
    return doc


def control_implication(nodes, name, path, errors, locations):
    """Each allowed phase independently requires one branch of the nullable selector."""
    location = name.split('/properties/', 1)[0]
    require(location.endswith('#/$defs/Control') and path[0] == 'record' and len(path) == 2,
            'the phase implication applies only to a Control member')
    node = nodes[location]['node']
    member = path[1]
    require(member in node['required'] and 'phase' in node['required'], 'missing Control member or phase')
    require(node['properties']['phase']['enum'] == list(CONTROL_PHASE_FIELDS), 'Control phase enum changed')
    selectors = node['properties'][member]['anyOf']
    require(len(selectors) == 2 and selectors[1]['type'] == 'null' and '$ref' in selectors[0],
            'nullable Selector changed')
    require(len(node['allOf']) == len(CONTROL_PHASE_FIELDS), 'Control phase list changed')
    bindings = {}
    for index, (phase, available) in enumerate(CONTROL_PHASE_FIELDS.items()):
        conditional = node['allOf'][index]
        require(conditional['if']['properties']['phase']['const'] == phase, 'Control selector changed')
        selected = conditional['then']['properties'][member]
        alternative = selectors[0] if member in available else selectors[1]
        require({k: v for k, v in selected.items() if k != 'x-pm-oracle-id'} ==
                {k: v for k, v in alternative.items() if k != 'x-pm-oracle-id'},
                'Control phase fails to require one branch of the member rule')
        bindings[phase] = location + f'/allOf/{index}/then/properties/{member}'
    remaining = locations(errors)
    require(remaining == {('type', tuple(path), bindings['empty'] + '/type')},
            'the exact empty-phase null rule did not remain')
    return dict(source=location, premise=bindings, source_rule=name)


def approval_implication(nodes, name, path, errors, locations, validator):
    """The existing approval owner pins hashes and its UTC profile at these fields."""
    parent, relative = name.split('/properties/', 1)
    field = path[-1]
    if name.endswith(('/maxLength', '/minLength')):
        node = nodes[name.rsplit('/', 1)[0]]['node']
        pattern = parent + '/properties/' + field + '/pattern'
        require(node['pattern'] == '^[0-9a-f]{64}$' and node[name.rsplit('/', 1)[1]] == 64 and
                locations(errors) == {('pattern', tuple(path), pattern)},
                'the exact 64-character hex rule did not remain')
        return dict(source=pattern, reason='64 lower-case hexadecimal characters imply length 64')

    from pm_goal_test_owner_adapters import _owner_timestamp_properties
    from pm_goal_test_numrule import DT

    actual = validator.format_checker.checkers.get('date-time')
    require(actual and actual[0].__module__ == DT.__name__, 'approval format checker source changed')
    keyword = 'format' if 'format' in name or name.endswith('/oneOf') else 'type'
    seen = locations(errors)
    require(seen == {(keyword, tuple(path), parent + '/properties')} or
            seen == {('type', tuple(path), parent + '/properties')},
            'the original approval UTC profile did not produce the remaining message')
    root = nodes[parent]['node']
    if parent.endswith('#/$defs/ApprovalRequest'):
        require(root['properties']['schema_id']['const'] == 'pm.goal.update.approval_request.v1',
                'approval timestamp routing changed')
    else:
        require(parent.endswith('#/$defs/ApprovalResolution') and
                {'approval_id', 'request_sha256', 'decided_at_utc', 'protected_person_decision_ref'} <= set(root['required']),
                'resolution timestamp routing changed')
    value_schema = root['properties'][field]
    if field == 'expires_at_utc':
        require({key: value for key, value in value_schema['oneOf'][0].items() if key != 'x-pm-oracle-id'} ==
                {'type': 'string', 'format': 'date-time'} and value_schema['oneOf'][1]['type'] == 'null',
                'nullable approval date-time rule changed')
    else:
        require(value_schema['type'] == 'string' and value_schema['format'] == 'date-time',
                'approval date-time rule changed')
    return dict(source=parent + '/properties', owner_profile=DT.COORDINATION_UTC_Z,
                owner_check=_owner_timestamp_properties.__name__,
                reason='The same date-time parser rejects nonstrings and applies the extra UTC Z condition. '
                       'It skips None only for the nullable expiry, where the null branch applies.')


def request_implication(nodes, name, path, errors, locations):
    """The request's complete two-way conditional enforces both nullable members."""
    parent = name.split('/allOf/', 1)[0].split('/properties/', 1)[0]
    request = parent.endswith('#/$defs/GoalUpdateRequestV2')
    require(request or parent.endswith('#/$defs/revision'), 'unexpected update request or revision definition')
    node = nodes[parent]['node']
    member = path[-1]
    members = ('approval_id', 'source_message_id') if request else ('approval_id',)
    require(member in members and member in node['required'] and
            'change_source' in node['required'], 'request implication member changed')
    direct, agent = node['allOf'][0]['then']['properties'][member], node['allOf'][0]['else']['properties'][member]
    choices = node['properties'][member]['anyOf']
    fields = lambda item: {key: value for key, value in item.items() if key != 'x-pm-oracle-id'}
    require(node['allOf'][0]['if']['properties']['change_source']['const'] == 'user_direct' and
            [fields(choice) for choice in choices] == [fields(agent), fields(direct)] ==
            [{'type': 'string', 'minLength': 1}, {'type': 'null'}], 'request conditional branches changed')
    if '/else/' in name:
        peer = parent + '/properties/' + member + '/anyOf/0/minLength'
        require(('minLength', tuple(path), peer) in locations(errors), 'same length rule did not remain')
    else:
        peer = parent + '/allOf/0/then/properties/' + member + '/type'
        require(locations(errors) == {('type', tuple(path), peer)}, 'exact direct null rule did not remain')
    return dict(source=parent + '/allOf/0', independent_rule=peer,
                reason='Direct requests require null. Every other request requires a nonempty string.')


def origin_implication(nodes, name, path, errors, locations):
    """Each origin kind requires the string or null member from the main rule."""
    parent = name.split('/allOf/', 1)[0].split('/properties/', 1)[0]
    member = path[-1]
    index, kind = {'bound_plan_ref': (0, 'plan_build'), 'owning_workflow_ref': (1, 'internal_workflow')}[member]
    require(parent.endswith('#/$defs/origin') and path == ['record', member], 'unexpected origin location')
    node = nodes[parent]['node']
    conditional = node['allOf'][index]
    require({'origin_kind', member} <= set(node['required']) and
            conditional['if']['properties']['origin_kind']['const'] == kind, 'origin selector changed')
    choices = node['properties'][member]['anyOf']
    string = conditional['then']['properties'][member]
    null = conditional['else']['properties'][member]
    fields = lambda item: {key: value for key, value in item.items() if key != 'x-pm-oracle-id'}
    require([fields(choice) for choice in choices] == [fields(string), fields(null)] ==
            [{'type': 'string', 'minLength': 1}, {'type': 'null'}], 'origin nullable branches changed')
    if '/then/' in name:
        peer = parent + '/properties/' + member + '/anyOf/0/minLength'
        require(('minLength', tuple(path), peer) in locations(errors), 'origin string length check did not remain')
    else:
        peer = parent + f'/allOf/{index}/else/properties/{member}/type'
        require(locations(errors) == {('type', tuple(path), peer)}, 'origin null check did not remain')
    return dict(source=parent + f'/allOf/{index}', independent_rule=peer, nonnull_kind=kind)


def body_receipt_implication(nodes, name, path, errors, locations):
    parent = name.split('/allOf/', 1)[0].split('/properties/', 1)[0]
    field = path[-1]
    index, revision = {'before_currentness_hash': (0, 'before_revision'),
                       'accepted_revision_hash': (1, 'accepted_objective_revision')}[field]
    require(parent.endswith('#/$defs/receipt') and path == ['record', field], 'unexpected receipt field')
    node = nodes[parent]['node']
    condition = node['allOf'][index]
    require({revision, field} <= set(node['required']) and condition['if']['properties'][revision]['type'] == 'null',
            'receipt hash condition changed')
    alternatives = node['properties'][field]['anyOf']
    string = condition['else']['properties'][field]
    null = condition['then']['properties'][field]
    fields = lambda item: {key: value for key, value in item.items() if key != 'x-pm-oracle-id'}
    require([fields(value) for value in alternatives] == [fields(string), fields(null)] ==
            [{'type': 'string', 'pattern': '^[0-9a-f]{64}$'}, {'type': 'null'}],
            'receipt hash branches changed')
    remaining = locations(errors)
    if '/else/' in name:
        other = parent + '/properties/' + field + '/anyOf/0/pattern'
        require(('pattern', tuple(path), other) in remaining, 'identical receipt hash rule did not remain')
    else:
        branch = 'else' if name.endswith('/pattern') else 'then'
        word = 'pattern' if branch == 'else' else 'type'
        other = parent + f'/allOf/{index}/{branch}/properties/{field}/{word}'
        require(remaining == {(word, tuple(path), other)}, 'exact receipt hash condition did not remain')
    return dict(source=parent+f'/allOf/{index}', independent_rule=other,
                premise='The revision selects either the null branch or the same 64-character hash rule.')


def test_rules(plain, bank, document, ident, exact_ids, examples, disabled_check):
    import pm_goal_dg5_closure as closure
    import pm_goal_go_schema_closure as go

    validator = closure.closure_validator(plain, ident, bank)
    nodes, installed = closure._clause_inventory(validator)
    if disabled_check == 'inventory':
        examples = dict(list(examples.items())[1:])
    inventory = {location + '/' + closure.clause_name(info['node'], keyword): keyword
                 for location, info in nodes.items() for keyword in go.clauses_of(info['node'])}
    require(installed == exact_ids, 'installed assertion inventory differs from census')
    require(set(installed) == set(examples), 'declared test examples differ from exact inventory')
    require(not list(plain.iter_errors(document)) and not go.errors_of(validator, document),
            'original or instrumented validator refused the accepted document')
    from pm_goal_oracle_common import _SCHEMA_LOCATIONS

    def locations(errors):
        return {(error.validator, tuple(error.absolute_path),
                 _SCHEMA_LOCATIONS.get(getattr(error, 'oracle_guard', None)))
                for error in each_error(errors)}

    result, gaps = {}, {}
    for name in installed:
        example = examples[name]
        path = example['path']
        control = control_phase(document, example['phase']) if 'phase' in example else document
        if 'control' in example:
            control = edit_example(go, document, example['control']['path'], example['control'])
        for change in example.get('controls', []):
            control = edit_example(go, control, change['path'], change)
        require(not list(plain.iter_errors(control)), f'{name}: branch control refused')
        guard = closure._guard_for_location(name)
        disable = () if disabled_check == 'rule' else {guard}
        if 'selector_messages' in example:
            cut = go.errors_of(validator, control, disable)
            restored = go.errors_of(validator, control)
            require(cut and go.locations(cut) == set(example['selector_messages']) and not restored,
                    f'{name}: expected exact conditional messages {example["selector_messages"]}')
            result[name] = dict(cls='SELECTOR_OR_NEGATED', control=control, cut=errors_list(cut),
                                restored=errors_list(restored), condition=name)
            continue
        if 'request_selector' in example:
            cut = go.errors_of(validator, control, disable)
            restored = go.errors_of(validator, control)
            parent = name.split('/if/',1)[0] + '/then/properties/'
            require(cut and go.locations(cut) == {parent + field + '/type'
                                                 for field in ('approval_id', 'source_message_id')} and not restored,
                    'disabling the request selector did not activate both direct-request rules')
            result[name] = dict(cls='SELECTOR_OR_NEGATED', control=control, cut=errors_list(cut),
                                restored=errors_list(restored), condition=name)
            continue
        if 'selector' in example:
            require(not go.errors_of(validator, control), 'Control selector control refused')
            cut = go.errors_of(validator, control, disable)
            restored = go.errors_of(validator, control)
            expected = name.split('/if/', 1)[0] + '/then/'
            if name.endswith('/allOf/4/if/properties/phase/const'):
                selector_type = name.split('#', 1)[0] + '#/$defs/Selector/type'
                activated = locations(cut) == {('type', ('record', member), selector_type)
                                               for member in CONTROL_PHASE_FIELDS['released']}
            else:
                activated = bool(cut) and all(rule.startswith(expected) for rule in go.locations(cut))
            require(activated and not restored,
                    f'{name}: disabling this selector produced {sorted(go.locations(cut))}')
            result[name] = dict(cls='SELECTOR_OR_NEGATED', control=control, cut=errors_list(cut),
                                restored=errors_list(restored), condition=name)
            continue
        invalid = edit_example(go, control, path, example)
        before = go.errors_of(validator, invalid)
        actual = list(plain.iter_errors(invalid))
        require(errors_list(before) == errors_list(actual), f'{name}: original and instrumented errors differ')
        cut = go.errors_of(validator, invalid, disable)
        restore = go.errors_of(validator, invalid)
        keyword = inventory[name]
        failure = (keyword, tuple(path), name)
        require(failure in locations(before), f'{name}: example did not produce expected validation message')
        require(failure not in locations(cut) and errors_list(before) == errors_list(restore),
                f'{name}: disabling and restoring that one rule failed')
        record = dict(cls='KILLED', control=control, invalid=invalid, before=errors_list(actual),
                      cut=errors_list(cut), restored=errors_list(restore))
        if cut and example.get('control_phase_implication'):
            record.update(cls='COVERED_LATER', implication=control_implication(nodes, name, path, cut, locations))
        elif cut and 'duplicate_rule' in example:
            other = example['duplicate_rule']
            bound = name.split('/allOf/',1)[0]
            property_id = bound + '/properties/blocked_reason_ref'
            then = nodes[name.rsplit('/',1)[0]]['node']
            branches = nodes[property_id]['node']['anyOf']
            require(name == bound + '/allOf/0/then/properties/blocked_reason_ref/minLength' and
                    path == ['record','blocked_reason_ref'] and other == property_id + '/anyOf/0/minLength' and
                    then['type'] == branches[0]['type'] == 'string' and branches[1]['type'] == 'null' and
                    then['minLength'] == branches[0]['minLength'], 'blocked reason rules changed')
            require(locations(cut) == {
                ('minLength', tuple(path), other), ('anyOf', tuple(path), property_id + '/anyOf'),
                ('type', tuple(path), property_id + '/anyOf/1/type'),
            }, 'the identical length rule did not remain')
            record.update(cls='COVERED_LATER', implication=dict(source=other, same_document_path=path,
                          premise='The blocked state requires a string, so the nonempty string branch applies.'))
        elif cut and example.get('receipt_implication'):
            record.update(cls='COVERED_LATER', implication=body_receipt_implication(
                nodes, name, path, cut, locations))
        elif cut and example.get('origin_implication'):
            record.update(cls='COVERED_LATER', implication=origin_implication(nodes, name, path, cut, locations))
        elif cut and example.get('request_implication'):
            record.update(cls='COVERED_LATER', implication=request_implication(nodes, name, path, cut, locations))
        elif cut and example.get('approval_implication'):
            record.update(cls='COVERED_LATER', implication=approval_implication(
                nodes, name, path, cut, locations, validator))
        elif cut:
            gaps[name] = record
            continue
        result[name] = record
    return result, gaps


def each_error(errors):
    for error in errors:
        yield error
        yield from each_error(error.context)


def proof_output(source, output, declare, collector, clauses, root, table_path):
    import pm_goal_dg5_closure as closure
    import pm_goal_guard_sweep as sweep

    proof = output / 'proof'
    tables_dir = proof / 'tables'
    tables_dir.mkdir(parents=True)
    row, family = declare['row'], declare['family']
    table = sweep.table_id([row])
    verified = sweep.prove_table(collector, table, [row], sweep.table_records(collector), tables_dir,
                                 module_name=table_path.stem,
                                 path='scripts/' + table_path.name)
    require(verified['status'] == 'PASS' and verified['proved'] == [row], verified)
    write(tables_dir / 'summary.json', [verified])
    write(tables_dir / 'rows.json', [dict(guard=row, table=table, status='PASS', table_status='PASS')])
    write(proof / 'family-rows.json', {family: [row]})
    write(proof / 'collection.json', dict(calls=collector.calls, failures=[],
                                         rows={row: {'sites': [declare['site']]}}))
    bound = [table_path, source / declare['site'][0]]
    bound += sorted(source.glob('scripts/pm_goal_dg5_*.py'))
    bound += [source / 'scripts' / name for name in (
        'pm_goal_guard_sweep.py', 'pm_goal_guard_tables.py', 'pm_goal_go_schema_closure.py',
        'pm_goal_oracle_common.py', 'pm_guard_isolation.py')]
    write(proof / 'source-bindings.json', {'files': {str(path.relative_to(source)): sha(path) for path in bound}})
    for name, value in (('ledger', collector.ledger),
                        ('signatures', [sorted(sig) for sig in collector.signature_list])):
        with gzip.open(proof / (name + '.json.gz'), 'wt') as stream:
            json.dump(value, stream, sort_keys=True)
    entry = dict(rows=[row], families=[family], counts=dict(Counter(x['cls'] for x in clauses.values())),
                 clauses=clauses, clause_inventory=closure._clause_inventory_pin(sorted(clauses)),
                 verify=dict(passed=sum(x['cls'] in ('KILLED', 'COVERED_LATER') for x in clauses.values()),
                             failed=0, unverifiable=0))
    write(output / 'closure.json', {'roots': {root: entry}})
    inventory = dict(mode='assertion-inventory', family=family, collection_failures=[],
                     roots={root: dict(rows=[row], families=[family], clause_ids=sorted(clauses),
                                       clause_inventory=entry['clause_inventory'])})
    write(output / 'inventory.json', inventory)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--census', type=Path, required=True)
    parser.add_argument('--declaration', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--disable-check', choices=('inventory', 'rule', 'row'))
    args = parser.parse_args()
    started = time.monotonic()
    source = args.source.resolve()
    declare = json.loads(args.declaration.read_text())
    revision = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
    require(revision == declare['source'], f'wrong original source revision: {revision}')
    require(sha(args.census) == declare['census_sha256'], 'census bytes changed')
    with gzip.open(args.census, 'rt') as stream:
        census = json.load(stream)
    row, ident = declare['row'], declare['root']
    census_row, = [item for item in census['rows'] if item['row'] == row]
    root = census['roots'][ident]
    require(census_row['root_ids'] == [ident] and not root.get('inventory_variants'), 'ambiguous root inventory')
    require(declare['family'] == census['family'] and declare['site'] in census_row['sites'], 'census owner site changed')
    sys.path.insert(0, str(source / 'scripts'))
    import pm_goal_dg5_closure as closure
    import pm_goal_guard_sweep as sweep
    import pm_goal_guard_tables as tables
    from pm_goal_test_owner_adapters import RootBank

    table = sweep.table_id([row])
    tables.PHASE_PREFIX = PREFIX
    tables._ROWS = {row: dict(table=table, phase=True)}
    table_name = PREFIX + table + '.py'
    table_path = source / 'scripts' / table_name
    table_bytes = (HERE / table_name).read_bytes()
    if table_path.exists():
        require(table_path.read_bytes() == table_bytes, 'source-local test table changed')
    else:
        table_path.write_bytes(table_bytes)
    args.out.mkdir(parents=True)
    fixture = args.out / 'fixture'
    fixture.mkdir()
    if declare['family'] == 'goal.updated':
        world, action = update_fixture(declare['route'], fixture)
        bank = RootBank
    else:
        from pm_goal_dg_cf2_world import RealmBank
        world, action = certified_fixture(declare['route'], fixture)
        bank = RealmBank

    closure.patch_validator_classes(force=True)
    collector = sweep.Collector()
    check = OwnerCheck(row, declare['site'], bank, source, fixture, declare, collector, args.disable_check)
    report = dict(row=row, source=revision, census_sha256=declare['census_sha256'], root=ident,
                  status='NOT_COVERED', reason=None)
    try:
        plain, actual_bank, accepted = check.prove(world, action)
        require({(obs['root'], obs['registry_sha256']) for run in check.runs for obs in run['observations']}
                == {(ident, root['registry_sha256'])}, 'root or registry differs from the census')
        clauses, gaps = test_rules(plain, actual_bank, accepted, ident, root['clause_ids'],
                                   declare['examples'], args.disable_check)
        report.update(clauses=clauses, gaps=gaps)
        require(not gaps, f'{len(gaps)} rules still have another validation message')
        proof_output(source, args.out, declare, collector, clauses, ident, table_path)
        report['status'] = 'COVERED'
    except ValueError as error:
        report['reason'] = str(error)
    finally:
        report.update(seconds=round(time.monotonic() - started, 3), owner_calls=check.runs)
        write(args.out / 'result.json', report)
        print(json.dumps({k: report[k] for k in ('row', 'status', 'reason', 'seconds')}), flush=True)
    return int(report['status'] != 'COVERED')


if __name__ == '__main__':
    sys.exit(main())
