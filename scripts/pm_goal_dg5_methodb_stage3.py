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
        edit = copy.deepcopy(go.get(document, change.get('control_path', ['record']) + ['birth']))
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
    if route == 'capture_input':
        request = oracle.O.direct_request(w, goal, 'Stage 3 input capture')
        admission = w.sir.admit(request)
        stamp = w.now()

        def capture():
            with patch.object(w, 'now', return_value=stamp):
                return w.source.capture(admission, lambda current, where: w.command.acceptance_evidence(
                    admission, current, where=where))

        return w, capture
    if route == 'freeze_input':
        request = oracle.O.direct_request(w, goal, 'Freeze producer input from committed body')
        admission = w.command.run(request, stop_after='commit')
        check_frozen_producer_input(w, oracle.O.UPDATE_URI, publish=False)
        return w, lambda: w.producer.freeze(goal['scope'], oracle.op_of(admission))
    if route in ('publish_receipted', 'publish_input'):
        request = oracle.O.direct_request(w, goal, 'Publication after its first receipt')
        admission = w.command.run(request, stop_after='freeze')
        op = oracle.op_of(admission)
        w.storage.faults = oracle.S.FaultPlan(cut='after_first_receipt')
        try:
            w.producer.publish(goal['scope'], op)
        except oracle.S.Crash:
            pass
        else:
            raise ValueError('the first receipt did not stop the original publication call')
        w.storage.faults = oracle.S.FaultPlan()
        require(w.storage.reservation_state('goal-update-append:' + op)['state'] == 'receipted',
                'publication example has no durable first receipt')
        if route == 'publish_receipted':
            check_publication_reused(w, oracle.O.UPDATE_URI)
        else:
            check_frozen_producer_input(w, oracle.O.UPDATE_URI, publish=True)
        return w, lambda: w.producer.publish(goal['scope'], op)
    _, admission = oracle.run_direct(w, goal)
    progress = oracle.progress(w, goal, oracle.op_of(admission))
    request = progress['body_commit']['receipt_request']
    actor = goal['user']
    permission = goal['user_permission']
    inspect = w.inspector
    if route == 'inspect':
        event_request = inspect.request_for(goal['scope'], progress['publication']['event_id'])
        return w, lambda: inspect.inspect(event_request, actor, permission)
    if route == 'input_recheck':
        check_input_request_reused(w, oracle.O.CONSUMER_URI)
    if route in ('input', 'input_recheck'):
        return w, oracle._input_call(w, goal, oracle.op_of(admission))
    if route == 'receipt_recheck':
        check_receipt_request_reused(w.body)
    if route in ('receipt', 'receipt_recheck'):
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
    if route in ('prepare_intent_check', 'arm_intent_check'):
        check_intent_reused(oracle.W, w)
    if route in ('prepare', 'prepare_intent_check'):
        return w, lambda: w.coordinator.prepare(ctx)
    if route == 'retained':
        run.until('release')
        return w, lambda: w.coordinator.retained_authority(ctx['scope'], ctx['op'])
    if route == 'retry':
        run.until('append')
        return w, lambda: w.coordinator.held_retry(ctx, run.obs['intent'], run.obs['control_armed'])
    if route == 'readback':
        run.until('commit')
        return w, lambda: w.coordinator.readback(ctx, run.obs['committed'])
    if route == 'current':
        run.until('release')
        return w, lambda: w.coordinator.read_current(ctx)
    if route == 'consumer_current':
        run.until('release')
        return w, lambda: run.consumer().read_current(ctx)
    if route in ('arm', 'arm_intent_check'):
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
    if route == 'release':
        run.until('readback')
        stamp = w.storage.now()

        def release():
            with patch.object(w.storage, 'now', return_value=stamp):
                return w.coordinator.release(ctx, run.obs['committed'], run.obs['readback'])

        return w, release
    if route == 'native':
        run.until('append')
        stamp = w.storage.now()

        def commit():
            with patch.object(w.storage, 'now', return_value=stamp):
                return w.coordinator.commit_native(ctx, run.obs['appended'])

        return w, commit
    if route in ('f5a', 'f5a_intent_check', 'f5a_control_check'):
        run.until('arm')
        intent, control = run.obs['intent'], run.obs['control_armed']
        preappend = w.coordinator.preappend_source(ctx)
        if route != 'f5a':
            check_f5a_stored_document(oracle.W, w, ctx, intent, control, route)
        return w, lambda: w.coordinator.f5a(ctx, intent, control, preappend)
    if route == 'recover':
        run.until('arm')
        request = oracle.W.recovery_request(w, ctx, run.stored('intent')['record'])
        return w, lambda: w.coordinator.recover_original(request)
    raise ValueError(route)


class RootCapture(BaseException):
    pass


def check_receipt_request_reused(body):
    reader = inspect.getsource(body.read_receipt)
    private = inspect.getsource(body.read_receipt_private)
    forwards = ('self.read_receipt_private(request, where)',
                "self.read_receipt_private(request, where + '/final')")
    require(reader.count('self.read_receipt_private(') == 2 and all(step in reader for step in forwards) and
            reader.index(forwards[0]) < reader.index(forwards[1]), 'receipt reader no longer validates the same request twice')
    require("self.bank.validate(BODY_URI + '#/$defs/receipt_read_request', request, where + '/receipt_request')"
            in private, 'receipt request definition changed')


def check_input_request_reused(world, uri):
    reader = inspect.getsource(world.source.read_input_content)
    steps = ("'#/$defs/InputReadRequest', request, where + '/request')",
             "request=request, input=inp,", "'#/$defs/InputReadResult', out, where + '/result')")
    require(all(step in reader for step in steps) and
            [reader.index(step) for step in steps] == sorted(reader.index(step) for step in steps),
            'input reader no longer forwards the checked request to the result')
    result = world.consumer_bank.documents[uri]['$defs']['InputReadResult']
    require('request' in result['required'] and
            result['properties']['request'] == {'$ref': uri + '#/$defs/InputReadRequest'},
            'input result no longer requires the same request schema')


def check_publication_reused(world, uri):
    publication = inspect.getsource(world.producer.publish)
    advance = inspect.getsource(world.source.advance)
    writes = inspect.getsource(world.source.progress_writes)
    require("phase='event_issued', publication=publication)" in publication and
            'w.source.advance(scope, op, record,' in publication and
            'self.progress_writes(scope, op, record,' in advance and
            "self.bank.validate(UPDATE_URI + '#/$defs/Progress', record, 'dgu/progress')" in writes,
            'publication forwarding to progress changed')
    require(world.producer.bank is world.source.bank, 'publication and progress use different schema banks')
    branches = world.source.bank.documents[uri]['$defs']['Progress']['oneOf']
    issued, = [branch for branch in branches if branch['properties']['phase'] == {'const': 'event_issued'}]
    require(all('const' in branch['properties']['phase'] for branch in branches) and
            'publication' in issued['required'] and
            issued['properties']['publication'] == {'$ref': uri + '#/$defs/OriginalPublication'},
            'event-issued progress no longer revalidates the same publication')


def check_frozen_producer_input(world, uri, *, publish):
    from pm_goal_dg_u_owners import T_PROGRESS

    source = world.source
    bank = source.bank
    definitions = bank.documents[uri]['$defs']
    progress = definitions['Progress']['oneOf']
    active = {'event_ready', 'event_unknown'}
    branches = {branch['properties']['phase']['const']: branch for branch in progress}
    require(world.producer.bank is bank and len(progress) == len(branches) and active <= branches.keys() and all(
        'producer_input' in branches[phase]['required'] and
        branches[phase]['properties']['producer_input'] == {'$ref': uri + '#/$defs/ProducerInput'} for phase in active),
        'progress no longer requires the exact producer input on both frozen paths')
    require(definitions['StorageProgress']['properties']['record']['oneOf'] ==
            [{'$ref': uri + '#/$defs/' + member} for member in ('Progress', 'ProgressHead')] and
            definitions['ProgressHead']['properties']['schema_id']['const'] == 'pm.goal.update.progress_head.v1',
            'stored progress no longer checks the Progress definition')
    if publish:
        reader = inspect.getsource(world.producer.publish)
        require("lambda: w.source.read_progress(scope, op, where)" in reader and
                "p['phase'] in ('event_ready', 'event_unknown')" in reader and
                "candidate = copy.deepcopy(p['producer_input'])" in reader and
                'ctx = dict(candidate=candidate)' in reader and
                "A.same(ctx['candidate'], p['producer_input'])" in reader and
                'self.unwrap_row(T_PROGRESS, skey, scell' in inspect.getsource(source.read_progress) and
                "snap['record']['schema_id'] == 'pm.goal.update.progress.v1'" in inspect.getsource(source.read_progress) and
                source.ROOTS[T_PROGRESS] == uri + '#/$defs/StorageProgress',
                'original publish no longer checks the input against the read-validated frozen value')
    else:
        freeze = inspect.getsource(world.producer.freeze)
        require("ctx = dict(producer_input=producer_input)" in freeze and
                "producer_input=ctx['producer_input'])" in freeze and
                "expected_phase=('body_committed',)" in freeze and
                'self.progress_writes(scope, op, record,' in inspect.getsource(source.advance) and
                "'#/$defs/Progress', record, 'dgu/progress')" in inspect.getsource(source.progress_writes),
                'original freeze no longer forwards the input to Progress')


def check_f5a_stored_document(module, world, context, intent, control, route):
    """Check the earlier schema and the later byte comparison for the armed document."""
    name, document, root = ('intent', intent, 'StorageIntent') if route == 'f5a_intent_check' else (
        'control', control, 'StorageControl')
    arm = inspect.getsource(world.coordinator.arm)
    f5a = inspect.getsource(world.coordinator.f5a)
    validation = "w.realm.validate('coordinator', COORD + WRAPPER_ROOT[fam], value, 'arm/' + fam)"
    require(validation in arm and module.WRAPPER_ROOT[name] == root, 'arm validates a different definition')
    steps = (
        "for fam, value in (('intent', stored_intent), ('control', stored_control)):",
        validation,
        "value=stored_" + name + ")",
        "w.storage.transact_stamped(build, writer=self.owner_ref(ctx['op']))",
    )
    require([arm.index(step) for step in steps] == sorted(arm.index(step) for step in steps),
            'arm validation and stored write order changed')
    site = f"w.realm.validate('coordinator', COORD + '{root}', {name}, stage + '/{name}')"
    cell = 'icell' if name == 'intent' else 'ccell'
    compare = f"require(stage + '/{name}_bytes', mp({cell}['value']) == mp({name}))"
    require(site in f5a and compare in f5a and f5a.index(site) < f5a.index(compare),
            'later byte comparison changed')
    _, stored = world.coordinator.compact(name, context['scope'], context['op'])
    require(stored is not None and module.A.same(stored['value'], document) and
            module.mp(stored['value']) == module.mp(document),
            'accepted input is not the stored arm document')
    require(module.A.same(module.NR.decode_event_value(module.mp(document)), document),
            'the stored arm document did not round trip with the same values and types')
    require(not world.realm.errors('coordinator', module.COORD + root, stored['value']),
            'the stored arm document failed its original schema')


def check_intent_reused(module, world):
    coordinator = world.coordinator
    derive = inspect.getsource(coordinator.derive_intent)
    prepare = inspect.getsource(coordinator.prepare)
    arm = inspect.getsource(coordinator.arm)
    require(inspect.getsource(type(coordinator)).count('self.derive_intent(') == 2 and
            "w.realm.validate('coordinator', COORD + 'Intent', intent, 'intent')" in derive and
            'return intent, candidate' in derive, 'derived Intent source sites changed')
    marker = {}
    require("prepared = dict(outcome='prepared', intent=intent," in prepare and
            "w.realm.validate('coordinator', COORD + 'Prepared', prepared, 'prepare/result')" in prepare and
            "require('arm/prepared_intent', A.same(cand, intent))" in arm and
            "stored_intent = wrap('intent', intent)" in arm and
            "for fam, value in (('intent', stored_intent), ('control', stored_control)):" in arm and
            "w.realm.validate('coordinator', COORD + WRAPPER_ROOT[fam], value, 'arm/' + fam)" in arm and
            module.WRAPPER_ROOT['intent'] == 'StorageIntent' and module.wrap('intent', marker)['record'] is marker,
            'Intent forwarding to the two later schema checks changed')
    resolver = world.realm.scoped.bank.registries['coordinator'].resolver()
    for root, member in (('Prepared', 'intent'), ('StorageIntent', 'record')):
        schema = resolver.lookup(module.COORD + root).contents
        require(member in schema['required'] and schema['properties'][member] == {'$ref': module.COORD + 'Intent'},
                'a later definition no longer checks the exact Intent')


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
        import pm_goal_test_storage as storage

        original = self.bank_class.validate
        errors_method = self.bank_class.errors
        record = dict(errors=[], cut=self.row in tables.CUT, observations=[])
        changed = []
        expected = self.code + '/schema/'  # extra member is rejected at the enclosing object
        request_validation = []

        def observe(bank, *args):
            if args[-1] != self.code:
                if self.declare['route'] == 'receipt_recheck' and args[-1] == 'dgu/reader/receipt/final/receipt_request':
                    require(request_validation == [(bank, args[0], args[-2])],
                            'final receipt validation received a different reference or request')
                    record['same_final_receipt_request'] = True
                if self.declare['route'] == 'input_recheck' and args[-1] == 'dgu/reader/input/result':
                    first_bank, first_ref, first_document = request_validation[0]
                    require(first_bank is bank and args[0] == first_ref.replace('InputReadRequest', 'InputReadResult') and
                            first_document == args[-2]['request'],
                            'input result validation received a different request')
                    record['same_input_result_request'] = True
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
            if self.declare['route'] in ('receipt_recheck', 'input_recheck'):
                request_validation.append((bank, args[0], copy.deepcopy(document)))
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

        # Storage issues transient snapshot IDs on each read. Keep the IDs
        # distinct within an action and repeat their sequence for each trial.
        snapshots = count(1)

        def preserve_ids(read):
            def stable_read(store):
                with patch.object(storage.secrets, 'token_hex',
                                  side_effect=lambda n: next(snapshots).to_bytes(n, 'big').hex()):
                    return read(store)
            return stable_read

        try:
            with ExitStack() as changes:
                changes.enter_context(patch.object(self.bank_class, 'validate', observe))
                for method in ('snapshot', 'acquire_source'):
                    current = getattr(storage.TestOwnerStorage, method)
                    changes.enter_context(patch.object(storage.TestOwnerStorage, method, preserve_ids(current)))
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
                later = self.declare.get('later_refusal')
                if later is None:
                    require(record['kill'] == 'KILLED',
                            f"complete-call cut result {record['kill']}: {record.get('cut_errors')}")
                else:
                    require(record['kill'] == 'COVERED_LATER' and self.runs[-2].get('refusal') == later,
                            f"expected later validation {later!r}, got {self.runs[-2].get('refusal')!r}")
                before, cut, restored = self.runs[-3:]
                if self.declare['route'] == 'receipt_recheck':
                    require(cut.get('same_final_receipt_request'), 'final validator did not check the original request')
                if self.declare['route'] == 'input_recheck':
                    require(cut.get('same_input_result_request'), 'input result validator did not check the original request')
                require(before == restored and before['observations'] == cut['observations'] and
                        bool(cut['errors']) == bool(later),
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


def control_phase(document, phase, field):
    doc = copy.deepcopy(document)
    record = doc[field]
    for member in CONTROL_PHASE_FIELDS['released']:
        record[member] = copy.deepcopy(record['birth']) if member in CONTROL_PHASE_FIELDS[phase] else None
    record['phase'] = phase
    return doc


def control_implication(nodes, name, path, errors, locations):
    """Each allowed phase independently requires one branch of the nullable selector."""
    location = name.split('/properties/', 1)[0]
    require(location.endswith('#/$defs/Control') and path[0] in ('record', 'control') and len(path) == 2,
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
    request = (parent.endswith('#/$defs/GoalUpdateRequestV2') or
               parent.endswith('/pm.goal_runtime_event.goal_updated.schema.v3#'))
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


def receipt_timestamp_implication(nodes, name, path, errors, locations, validator):
    from pm_goal_test_numrule import DT

    schema_node = name.removesuffix('/minLength')
    format_id = schema_node + '/format'
    node = nodes[schema_node]['node']
    checker, _ = validator.format_checker.checkers['date-time']
    require(name.endswith('/AppendReceipt/properties/acknowledged_at_utc/minLength') and
            path == ['first_append_receipt', 'acknowledged_at_utc'] and
            node['minLength'] == 1 and node['format'] == 'date-time',
            'receipt timestamp length rule changed')
    require(checker.__module__ == DT.__name__ and DT._DATE_TIME.fullmatch('') is None and
            not validator.format_checker.conforms('', 'date-time') and
            locations(errors) == {('format', tuple(path), format_id)},
            'the remaining receipt format rule did not refuse the empty timestamp')
    return dict(source=format_id, same_document_path=path,
                implementation='scripts/pm_event_datetime.py:63',
                premise='The only string with length less than one is empty. The pinned date-time format refuses it.')


def producer_rule_implication(nodes, name, path, errors, locations, validator):
    from pm_goal_test_numrule import DT
    from pm_goal_test_owner_adapters import _owner_timestamp_properties

    producer = NORMALIZED.removesuffix('NormalizedIdentity') + 'ProducerInput'
    require(len(path) == 1 and path[0] in ('redaction_profile', 'schema_id', 'schema_version', 'occurred_at_utc'),
            'unexpected producer implication field')
    field = path[0]
    if field != 'occurred_at_utc':
        value = producer + '/properties/' + field
        node = nodes[value]['node']
        keyword = 'enum' if field == 'redaction_profile' else 'const'
        allowed = node['enum'] if keyword == 'enum' else [node['const']]
        other = value + '/' + keyword
        require(name == value + '/type' and node['type'] == 'string' and
                allowed and all(type(member) is str for member in allowed) and
                locations(errors) == {(keyword, tuple(path), other)},
                'producer enumeration or constant no longer implies the string rule')
        return dict(source=other, same_document_path=path, premise='Every allowed value is a string.')

    root = nodes[producer]['node']
    date_time = root['properties'][field]['$ref']
    node = nodes[date_time]['node']
    keyword = name.rsplit('/', 1)[-1]
    installed, _ = validator.format_checker.checkers['date-time']
    require(name == date_time + '/' + keyword and keyword in ('type', 'format', 'minLength') and
            node['type'] == 'string' and node['minLength'] == 1 and node['format'] == 'date-time' and
            date_time == 'https://puppetmaster.local/schemas/event_record/2.0.0/event_record.schema.json#/$defs/date_time_string' and
            {'event_type', 'payload_schema_id', 'replay_policy', field} <= set(root['required']) and
            installed.__module__ == DT.__name__, 'producer timestamp routing or format changed')
    source = inspect.getsource(_owner_timestamp_properties)
    require("profiles['occurred_at_utc'] = NR.DT.EVENT_RECORD" in source and
            'NR.DT.date_time(instance[name], profile=profile)' in source and
            DT._DATE_TIME.fullmatch('') is None, 'producer timestamp profile no longer applies the same parser')
    profile = producer + '/properties'
    expected = {('type' if keyword == 'type' else 'format', tuple(path), profile)}
    if keyword == 'minLength':
        expected.add(('format', tuple(path), date_time + '/format'))
    require(locations(errors) == expected, 'producer timestamp did not leave the expected original profile message')
    return dict(source=profile, same_document_path=path, implementation='scripts/pm_goal_test_owner_adapters.py:199',
                premise='The EventRecord timestamp parser requires a nonempty string and checks the same format.')


IDENTITY = 'https://puppetmaster.local/schemas/full-thread-runtime-contracts.v1.json#/$defs/IdentityEnvelope'
NORMALIZED = ('https://puppetmaster.local/schemas/goal_update_command_custody/1.0.0/'
              'goal_update_command_custody.schema.json#/$defs/NormalizedIdentity')


def normalized_scope(nodes):
    identity = nodes[IDENTITY]['node']
    normalized = nodes[NORMALIZED + '/properties/owner_identity']['node']
    require(normalized['allOf'][0]['$ref'] == IDENTITY and
            normalized['allOf'][1]['properties']['scope_kind']['const'] == 'project' and
            'scope_kind' in identity['required'] and
            [branch['if']['properties']['scope_kind']['const'] for branch in identity['allOf']] ==
            ['application', 'project'] and
            all(branch['if']['required'] == ['scope_kind'] for branch in identity['allOf']),
            'normalized identity scope premise changed')


def normalized_rule_implication(nodes, name, path, errors, locations, other):
    normalized_scope(nodes)
    require(len(path) == 2 and path[0] == 'owner_identity', 'normalized identity implication path changed')
    member = path[1]
    node, keyword = name.rsplit('/', 1)
    active, active_keyword = other.rsplit('/', 1)
    generic = IDENTITY + '/properties/' + member
    if member in ('project_id', 'project_home_server_id'):
        enforced = IDENTITY + '/allOf/1/then/properties/' + member
    else:
        require(member in ('command_instance_id', 'thread_id', 'scope_kind'), 'unknown normalized identity implication')
        enforced = NORMALIZED + '/properties/owner_identity/allOf/1/properties/' + member
    a, b = nodes[node]['node'], nodes[active]['node']
    require({node, active} == {generic, enforced} and locations(errors) == {(active_keyword, tuple(path), other)},
            'the paired normalized identity message did not remain on the same field')
    if keyword == 'enum':
        require(node == generic and active_keyword == 'const' and b['const'] in a['enum'],
                'scope constant no longer implies the identity enumeration')
    else:
        require(keyword == active_keyword and (
            keyword in ('minLength', 'maxLength') and a[keyword] == b[keyword] or
            keyword == 'type' and (a[keyword] == b[keyword] or
                                   node == generic and a[keyword] == ['string', 'null'] and b[keyword] == 'string')),
            'the paired normalized identity constraints no longer imply each other on this field')
    return dict(source=other, same_document_path=path,
                premise='Both constraints apply to the same field of the required project identity.')


def normalized_selector_trial(nodes, validator, go, control, name, disabled):
    normalized_scope(nodes)
    data = copy.deepcopy(control)
    identity = data['owner_identity']
    branch = name.split('/if/', 1)[0]
    suffix = name[len(branch):]
    application = IDENTITY + '/allOf/0'
    project = IDENTITY + '/allOf/1'
    require(branch in (application, project) and suffix in ('/if/required', '/if/properties/scope_kind/const'),
            'unknown normalized identity selector')
    fields = ('project_id', 'project_home_server_id')
    if suffix == '/if/required':
        del identity['scope_kind']
        if branch == project:
            identity['project_id'] = None
            fields = ('project_id',)
        expected_original = {IDENTITY + '/required'}
    elif branch == project:
        identity.update(scope_kind='application', project_id=None, project_home_server_id=None, named_plan_id=None)
        expected_original = {NORMALIZED + '/properties/owner_identity/allOf/1/properties/scope_kind/const'}
    else:
        expected_original = set()
    expected_added = {branch + '/then/properties/' + field + '/type' for field in fields}
    before = go.errors_of(validator, data)
    cut = go.errors_of(validator, data, disabled)
    restored = go.errors_of(validator, data)
    require(go.locations(before) == expected_original and go.locations(cut) == expected_original | expected_added and
            errors_list(before) == errors_list(restored), 'disabling this identity selector did not change the exact branch messages')
    return dict(cls='SELECTOR_OR_NEGATED', input=data, original=errors_list(before),
                cut=errors_list(cut), restored=errors_list(restored),
                source=branch, premise='The outer definition requires a project scope and the identity requires scope_kind.')


def test_rules(plain, bank, document, ident, exact_ids, examples, disabled_check, branches=None):
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
        control_path = example.get('control_path', ['record'])
        base = branches[example['control_name']] if 'control_name' in example else document
        control = control_phase(base, example['phase'], control_path[0]) if 'phase' in example else base
        if 'control' in example:
            control = edit_example(go, document, example['control']['path'], example['control'])
        for change in example.get('controls', []):
            control = edit_example(go, control, change['path'], change)
        require(not list(plain.iter_errors(control)), f'{name}: branch control refused')
        guard = closure._guard_for_location(name)
        disable = () if disabled_check == 'rule' else {guard}
        if example.get('normalized_selector'):
            result[name] = normalized_selector_trial(nodes, validator, go, control, name, disable)
            continue
        if example.get('unreachable_application'):
            normalized_scope(nodes)
            node = name.rsplit('/', 1)[0]
            require(node.startswith(IDENTITY + '/allOf/0/then/properties/'), 'unexpected unreachable identity rule')
            premise = go.pinned_proof(nodes[node], nodes, validator, inventory[name])
            require(premise and premise['cls'] == 'UNREACHABLE' and not go.errors_of(validator, control, disable),
                    'application-only rule is reachable under the project pin')
            result[name] = premise
            continue
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
                activated = locations(cut) == {('type', (*control_path, member), selector_type)
                                               for member in CONTROL_PHASE_FIELDS['released']}
            else:
                activated = bool(cut) and all(rule.startswith(expected) for rule in go.locations(cut))
            require(activated and not restored,
                    f'{name}: disabling this selector produced {sorted(go.locations(cut))}')
            result[name] = dict(cls='SELECTOR_OR_NEGATED', control=control, cut=errors_list(cut),
                                restored=errors_list(restored), condition=name)
            continue
        invalid = edit_example(go, control, path, example)
        if example.get('application_identity'):
            require(name == NORMALIZED + '/properties/owner_identity/allOf/1/properties/scope_kind/const' and
                    path == ['owner_identity', 'scope_kind'] and example['value'] == 'application',
                    'unexpected application identity example')
            invalid['owner_identity'].update(project_id=None, project_home_server_id=None, named_plan_id=None)
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
        elif cut and example.get('receipt_timestamp_implication'):
            record.update(cls='COVERED_LATER', implication=receipt_timestamp_implication(
                nodes, name, path, cut, locations, validator))
        elif cut and 'normalized_paired_rule' in example:
            record.update(cls='COVERED_LATER', implication=normalized_rule_implication(
                nodes, name, path, cut, locations, example['normalized_paired_rule']))
        elif cut and example.get('producer_implication'):
            record.update(cls='COVERED_LATER', implication=producer_rule_implication(
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
    later_refusal = {
        ('dg5/f5a/intent/schema', 'f5a_intent_check'): 'f5a/intent_bytes',
        ('dg5/f5a/control/schema', 'f5a_control_check'): 'f5a/control_bytes',
        ('dg5/intent/schema', 'prepare_intent_check'): 'prepare/result/schema/intent',
        ('dg5/intent/schema', 'arm_intent_check'): 'arm/prepared_intent',
        ('dg5/dgu/reader/receipt/receipt_request/schema', 'receipt_recheck'):
            'dgu/reader/receipt/final/receipt_request/schema/',
        ('dg5/dgu/producer/publish/publication/schema', 'publish_receipted'): 'dgu/progress/schema/',
        ('dg5/dgu/producer/freeze/producer_input/schema', 'freeze_input'): 'dgu/progress/schema/',
        ('dg5/dgu/producer/publish/producer_input/schema', 'publish_input'): 'dgu/producer/publish/final_candidate',
        ('dg5/dgu/reader/input/request/schema', 'input_recheck'): 'dgu/reader/input/result/schema/request',
    }.get((row, declare['route']))
    require(declare.get('later_refusal') == later_refusal,
            'later validation requires a checked source implication and its exact message')
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
                                   declare['examples'], args.disable_check, declare.get('accepted_branches'))
        report.update(clauses=clauses, gaps=gaps)
        if 'later_refusal' in declare:
            report['checked_later_refusal'] = declare['later_refusal']
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
