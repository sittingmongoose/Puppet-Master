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
    if route in ('metadata_intent', 'reserve_pending'):
        return body_change_fixture(oracle, route, path)
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
    if route in ('inspect', 'inspect_request_recheck', 'inspect_event_recheck', 'inspect_receipt_recheck'):
        event_request = inspect.request_for(goal['scope'], progress['publication']['event_id'])
        if route == 'inspect_request_recheck':
            check_projected_request_source(w, oracle.O.CONSUMER_URI, route)
        if route == 'inspect_event_recheck':
            check_inspected_event_source(oracle.O, w, progress)
        if route == 'inspect_receipt_recheck':
            check_inspection_receipt_source(oracle.O, w)
        return w, lambda: inspect.inspect(event_request, actor, permission)
    if route in ('audit_current_request', 'audit_terminal_request'):
        check_projected_request_source(w, oracle.O.CONSUMER_URI, route)
        selection = 'current_progress' if route == 'audit_current_request' else 'terminal_members'
        return w, oracle._audit_call(w, goal, admission, selection)
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


def body_change_fixture(oracle, route, path):
    captured = []
    method = 'metadata_update' if route == 'metadata_intent' else 'reserve'
    original = getattr(oracle.O.GoalBodyOwner, method)

    def before_update(owner, *args, **kwargs):
        captured.extend((owner, args, kwargs))
        raise RootCapture

    with patch.object(oracle.O.GoalBodyOwner, method, before_update):
        try:
            if method == 'metadata_update':
                oracle.u2_paused(path)
            else:
                world = oracle.world(path)
                goal = oracle.O.birth_goal(world)
                request = oracle.O.direct_request(world, goal, 'Reserve one Goal Body change')
                world.command.run(request, stop_after='reserve')
        except RootCapture:
            pass
    owner, args, kwargs = captured
    world = owner.world
    timestamp = world.now()
    marker = UUID('acbe756a-f544-4025-8be1-87dd45fb89b6')
    if method == 'reserve':
        check_reservation_reused(oracle.O, owner)

    def update():
        with patch.object(world, 'now', return_value=timestamp), patch.object(oracle.O.uuid, 'uuid4',
                                                                             return_value=marker):
            return original(owner, *args, **kwargs)

    return world, update


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
    if route in ('retry', 'retry_evidence_recheck'):
        run.until('append')
        if route != 'retry':
            check_certified_evidence_reused(oracle.W, w, route)
        return w, lambda: w.coordinator.held_retry(ctx, run.obs['intent'], run.obs['control_armed'])
    if route == 'readback':
        run.until('commit')
        return w, lambda: w.coordinator.readback(ctx, run.obs['committed'])
    if route == 'f5c_evidence':
        run.until('arm')
        captured = []

        def before_readback(*args):
            captured.extend(args)
            raise RootCapture

        with patch.object(w.coordinator, 'f5c_readback', before_readback):
            try:
                run.step('append')
            except RootCapture:
                pass
        require(len(captured) == 3, 'append did not supply the original F5c readback documents')
        return w, lambda: w.coordinator.f5c_readback(*captured)
    if route in ('current', 'current_guard_recheck'):
        run.until('release')
        if route == 'current_guard_recheck':
            reader = inspect.getsource(w.coordinator.read_current)
            acquisition = "guard = self.check_guard(ctx, self.acquire_guard(ctx, 'current_source', stage='current'),"
            recheck = "self.check_guard(ctx, guard, ('authentic_released',), stage=stage + '_final')"
            check = inspect.getsource(w.coordinator.check_guard)
            require(acquisition in reader and recheck in reader and reader.index(acquisition) < reader.index(recheck) and
                    "w.realm.validate('coordinator', COORD + 'GuardReadResult', guard, stage + '/guard')" in check and
                    'return guard' in check, 'the current reader no longer validates the same guard twice')
        return w, lambda: w.coordinator.read_current(ctx)
    if route == 'consumer_current':
        run.until('release')
        consumer = run.consumer()
        consumer.publish_projection(ctx['scope'], ctx['op'])
        return w, lambda: consumer.read_current(ctx)
    if route == 'append_guard':
        run.until('arm')
        now = time.time_ns()

        def append():
            with patch.object(time, 'time_ns', return_value=now):
                return w.coordinator.append_held(ctx, run.obs['intent'], run.obs['control_armed'])

        return w, append
    if route in ('arm', 'arm_intent_check'):
        run.until('prepare')
        return w, lambda: w.coordinator.arm(ctx, run.obs['prepared'])
    if route in ('f5d', 'f5d_after_event_phase', 'f5d_repeated_evidence'):
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
        if route != 'f5d':
            check_certified_evidence_reused(oracle.W, w, route)
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
    if route in ('native', 'commit_evidence_recheck'):
        run.until('append')
        if route != 'native':
            check_certified_evidence_reused(oracle.W, w, route)
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


def certified_producer_fixture(path):
    from pm_goal_dg_cf1_oracles import W, run_path

    captured = []

    def before_prepare(owner, *args, **kwargs):
        captured.extend((owner, args, kwargs))
        raise RootCapture

    with patch.object(W.WholeProducer, 'prepare', before_prepare):
        try:
            run_path(path)
        except RootCapture:
            pass
    require(len(captured) == 3, 'the original certified run did not reach the producer')
    owner, args, kwargs = captured
    realm, reference = W.ROOTS[W.SUBMISSION]
    pre, _ = W.C.realm_bank()
    binding = pre.registries[realm].resolver().lookup(reference)
    schema = binding.contents
    payload = schema['properties']['payload']
    require('payload' in schema['required'] and payload == {'$ref': W.D.PAYLOAD},
            'the submission no longer requires the original certified payload')
    require(binding.resolver.lookup(W.D.PAYLOAD).contents == W.D.bank().documents[W.D.PAYLOAD],
            'the submission no longer references the original certified payload document')
    method = inspect.getsource(owner.submission)
    require("sub[key] = copy.deepcopy(event[key])" in method and
            "rvalidate(SUBMISSION, sub, 'producer/submission')" in method,
            'the original producer no longer copies the payload into submission')
    check = inspect.getsource(owner.check)
    require(all(statement in check for statement in (
        "for field in ('goal_revision', 'expected_goal_run_revision', 'goal_run_revision')",
        "NR.integer(payload[field], 'producer/payload.' + field, minimum=1)",
        "NR.event_time(event['occurred_at_utc'], 'producer/occurred_at_utc')",
        "'occurred_at_utc': native['decision']['issued_at_utc']",
        "'payload.occurred_at_utc':\n                native['decision']['issued_at_utc']",
        "A.same(actual, value)")),
        'the original producer no longer checks the payload integer and timestamp fields')
    stamp = time.time_ns()

    def prepare():
        with patch.object(time, 'time_ns', return_value=stamp):
            return owner.prepare(*args, **kwargs)

    return owner.world, prepare


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


def check_reservation_reused(module, owner):
    reserve = inspect.getsource(owner.reserve)
    require("'#/$defs/pending', pending, where + '/pending')" in reserve and
            'pending=copy.deepcopy(pending)' in reserve and
            "A.same(ctx['control']['pending'], pending)" in reserve and
            'self.row(T_CONTROL, control_key(p, g), new)' in reserve,
            'reservation no longer passes the same pending document to body control')
    uri = owner.ROOTS[module.T_CONTROL].removesuffix('#/$defs/StorageBodyControlV2')
    definitions = owner.bank.documents[uri]['$defs']
    wrapper = definitions['StorageBodyControlV2']
    control = definitions['BodyControlV2']
    require(owner.ROOTS[module.T_CONTROL] == uri + '#/$defs/StorageBodyControlV2' and
            'record' in wrapper['required'] and wrapper['properties']['record'] ==
            {'$ref': uri + '#/$defs/BodyControlV2'} and
            'pending' in control['required'] and control['properties']['pending']['anyOf'] ==
            [{'$ref': module.BODY_URI + '#/$defs/pending'}, {'type': 'null'}],
            'body control no longer checks the exact pending schema when present')


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


REQUEST_PROJECTIONS = {
    'inspect_request_recheck': ('dgu/inspect/witness', 'EventReadRequest', 'PrivateEventReadWitness'),
    'audit_current_request': ('dgu/reader/audit/result', 'AuditReadRequest', 'AuditedProgress'),
    'audit_terminal_request': ('dgu/reader/audit/result', 'AuditReadRequest', 'AuditedTerminal'),
}


def check_projected_request_source(world, uri, route):
    _, root, result_root = REQUEST_PROJECTIONS[route]
    bank = world.consumer_bank
    ref = uri + '#/$defs/'
    schema = bank.documents[uri]['$defs'][result_root]
    projected = schema['properties']['request']
    require('request' in schema['required'] and
            (projected if root == 'EventReadRequest' else projected['allOf'][0]) == {'$ref': ref + root},
            'the later schema no longer requires the identical request definition')
    if root == 'EventReadRequest':
        source = inspect.getsource(world.inspector.inspect)
        steps = ("'#/$defs/EventReadRequest', request, where + '/request')",
                 'witness = dict(request=request,', "'#/$defs/PrivateEventReadWitness', witness, where + '/witness')")
    else:
        source = inspect.getsource(world.source.read_audit)
        steps = ("'#/$defs/AuditReadRequest', request, where + '/request')",
                 'request=request, source_audit=src,', "root = 'AuditedProgress'", "root = 'AuditedTerminal'",
                 "'#/$defs/' + root, out, where + '/result')")
    require(all(step in source for step in steps) and
            [source.index(step) for step in steps] == sorted(source.index(step) for step in steps),
            'the original result no longer forwards the same request')


def check_inspected_event_source(module, world, progress):
    reader = inspect.getsource(world.inspector.inspect)
    validate = "bank.validate(CONSUMER_URI + '#/$defs/SelectedActiveEvent', event, where + '/event')"
    decode = "event = row.event"
    join = "A.same(S.producer25(event), pr['producer_input'])"
    require(all(step in reader for step in (decode, validate, join)) and
            reader.index(decode) < reader.index(validate) < reader.index(join),
            'inspection no longer validates and compares the original event')
    schema = world.consumer_bank.documents[module.CONSUMER_URI]['$defs']['SelectedActiveEvent']
    base, extra = schema['allOf']
    fields = extra['properties']
    producer = progress['producer_input']
    event = world.storage.read_event(progress['publication']['event_id'])
    producer_payload = world.source.bank.documents[module.UPDATE_URI]['$defs']['ProducerInput']['properties']['payload']
    require(base == {'$ref': EVENT_RECORD.removesuffix('#')} and
            fields == dict(event_type={'const': 'goal.updated'}, scope_kind={'const': 'project'},
                           payload_schema_id={'const': module.PAYLOAD_URI}, payload=producer_payload) and
            producer_payload['$ref'].endswith('/' + module.PAYLOAD_URI),
            'inspection schema changed')
    require(module.A.same(module.S.producer25(event), producer) and
            not {'event_type', 'scope_kind', 'payload_schema_id', 'payload'}.intersection(module.S.STORAGE_FIELDS) and
            not world.source.bank.errors(module.UPDATE_URI + '#/$defs/ProducerInput', producer) and
            not world.consumer_bank.errors(module.CONSUMER_URI + '#/$defs/SelectedActiveEvent', event),
            'the selected event no longer carries the stored complete producer and EventRecord')


def check_inspection_receipt_source(module, world):
    body = world.body.bank.documents[module.BODY_URI]['$defs']['receipt_read_request']
    references = world.consumer_bank.documents[module.CONSUMER_URI]['$defs']
    selected = references['SelectedActiveEvent']['allOf'][1]['properties']['payload']['$ref']
    observation = references['EventObservation']
    payload = world.consumer_bank.documents[selected]
    require('payload' in observation['required'] and observation['properties']['payload'] == {'$ref': selected} and
            'body_receipt_request' in payload['required'] and
            payload['properties']['body_receipt_request'] == body, 'inspection receipt schema constraints differ')
    reader = inspect.getsource(world.inspector.inspect)
    steps = ("'#/$defs/SelectedActiveEvent', event, where + '/event'", "payload = event['payload']",
             "payload['body_receipt_request'], where)", "payload=copy.deepcopy(payload)",
             "'#/$defs/EventObservation', observation, where + '/observation'")
    require(all(step in reader for step in steps) and
            [reader.index(step) for step in steps] == sorted(reader.index(step) for step in steps),
            'inspection no longer uses the same receipt request before and after the check')


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


def check_certified_evidence_reused(module, world, route):
    coordinator = world.coordinator
    require("w.realm.validate('coordinator', APPEND + 'AppendEvidence', evidence, stage + '/evidence')" in
            inspect.getsource(coordinator.check_evidence), 'evidence schema call changed')
    if route == 'commit_evidence_recheck':
        commit = inspect.getsource(coordinator.commit_native)
        early = "self.check_evidence(ctx, appended['evidence'], stage=stage)"
        final = "self.check_evidence(ctx, appended['evidence'], stage=stage + '_final')"
        require(early in commit and final in commit and commit.index(early) < commit.index(final),
                'commit no longer checks the same evidence before and after its helper')
    else:
        retry = route == 'retry_evidence_recheck'
        body = inspect.getsource(coordinator.held_retry if retry else coordinator.f5d)
        stage = 'retry' if retry else 'append_outer'
        result_stage = 'retry/result' if retry else 'append/result'
        check = f"self.check_evidence(ctx, evidence, stage='{stage}')"
        forward = "appended = dict(outcome='event_durable_held', evidence=evidence,"
        result = f"w.realm.validate('coordinator', APPEND + 'AppendedHeld', appended, '{result_stage}')"
        require(all(step in body for step in (check, forward, result)) and
                body.index(check) < body.index(forward) < body.index(result),
                'the result no longer forwards the checked evidence')
        resolver = world.realm.scoped.bank.registries['coordinator'].resolver()
        schema = resolver.lookup(module.APPEND + 'AppendedHeld').contents
        require('evidence' in schema['required'] and
                schema['properties']['evidence'] == {'$ref': module.APPEND + 'AppendEvidence'},
                'the result no longer requires the same evidence definition')
        if route == 'f5d_repeated_evidence':
            final = 'final(evidence)'
            write = "w.storage.transact_stamped(build, writer=self.owner_ref(ctx['op']))"
            require(body.count(final) == 2 and "self.check_evidence(ctx, evidence_now, stage=stage)" in body and
                    body.rindex(final) < body.index(write) < body.index(check),
                    'F5d no longer checks the same evidence twice before the EventPhase write')


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
        self.request_projection = None
        self.probe_root = False

    def call(self, action, edit, *, require_exact=False, prefix_store=None):
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
        evidence_validation = []
        projection = REQUEST_PROJECTIONS.get(self.declare['route'])
        producer_payloads = []
        repeated_evidence = self.declare['route'] == 'f5d_repeated_evidence'
        next_evidence_check = {
            'commit_evidence_recheck': 'commit_final/evidence',
            'retry_evidence_recheck': 'retry/result',
            'current_guard_recheck': 'current_final/guard',
        }.get(self.declare['route'])
        if self.row == 'dg5/append_outer/evidence/schema':
            next_evidence_check = 'append/result'
        if repeated_evidence:
            next_evidence_check = 'append_outer/evidence'

        def observe(bank, *args):
            if args[-1] != self.code:
                if args[-1] == next_evidence_check:
                    ref, document = args[1], args[-2]
                    if args[-1] in ('append/result', 'retry/result'):
                        ref, document = ref.removesuffix('AppendedHeld') + 'AppendEvidence', document['evidence']
                    require(evidence_validation and all(item[0] is bank and item[1:] == (args[0], ref, document)
                                                        for item in evidence_validation),
                            'later validation received a different document or schema')
                    record['same_later_document'] = True
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
                if projection and args[-1] == projection[0]:
                    first_bank, first_ref, first_document = request_validation[0]
                    require(first_bank is bank and args[0] == first_ref.removesuffix(projection[1]) + projection[2] and
                            first_document == args[-2]['request'],
                            'the original result used a different request or schema')
                    record['same_projected_request'] = True
                    if edit is None:
                        self.request_projection = bank, args[0], copy.deepcopy(args[-2])
                if self.declare['route'] == 'inspect_receipt_recheck' and args[-1] == 'dgu/inspect/observation':
                    require(request_validation and request_validation[0][2] == args[-2]['payload']['body_receipt_request'],
                            'the inspected observation used different receipt request data')
                    record['same_projected_request'] = True
                return original(bank, *args)
            frame = sys._getframe(1)
            site = [str(Path(frame.f_code.co_filename).relative_to(self.source)), frame.f_lineno]
            require(site == self.site, f'owner call source changed: {site}')
            if prefix_store is not None and not record['observations']:
                record['store_at_validator'] = self.result_digest(bridge.manifest(bridge.file_state(prefix_store)))
                record['realm_ref'] = list(args[:-2])
            document = args[-2]
            if edit is not None:
                require(isinstance(document, dict), 'complete-call extra-member example needs an object')
                member = edit['member'][1]
                if repeated_evidence and changed:
                    require(changed[0][0] is document and document[member] == 'gc',
                            'the repeated F5d check received a different document')
                else:
                    require(member not in document, 'test document already has the extra member')
                    changed.append((document, member))
                    document[member] = 'gc'
            if projection or self.declare['route'] in ('receipt_recheck', 'input_recheck', 'inspect_receipt_recheck'):
                request_validation.append((bank, args[0], copy.deepcopy(document)))
            if self.declare['route'] == 'producer_prepare':
                producer_payloads.append(copy.deepcopy(document))
            if next_evidence_check:
                evidence_validation.append((bank, args[0], args[1], copy.deepcopy(document)))
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
                if self.declare['route'] == 'producer_prepare':
                    import pm_goal_dg_cf1_world as world

                    validate_submission = world.rvalidate

                    def observe_submission(name, document, code):
                        if code == 'producer/submission':
                            require(name == world.SUBMISSION and producer_payloads == [document['payload']],
                                    'the original submission used a different certified payload')
                            record['same_submission_payload'] = True
                        return validate_submission(name, document, code)

                    changes.enter_context(patch.object(world, 'rvalidate', observe_submission))
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
        repetitions = 1
        if repeated_evidence and (edit is None or (record['cut'] and self.disabled_check != 'row')):
            repetitions = 2
        require(len(record['observations']) == repetitions and
                all(observation == record['observations'][0] for observation in record['observations']),
                'the complete call did not repeat the expected validation on the same document')
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
        allow_prefix = self.declare['route'] in ('f5d_after_event_phase', 'producer_prepare')
        repeat_before_prefix = self.declare['route'] == 'f5d_repeated_evidence'
        if allow_prefix:
            require(self.row in ('dg5/append/result/schema', 'dg5/append_outer/evidence/schema',
                                 'dg5/producer/payload/schema'), 'unexpected validator after a copied fixture write')
        context = multiprocessing.get_context('fork')
        receiver, sender = context.Pipe(duplex=False)

        def run_child():
            try:
                with ExitStack() as changes:
                    stores = [world.storage, getattr(world, 'goal_store', None), getattr(world, 'd01_store', None)]
                    for store in {id(store): store for store in stores if store is not None}.values():
                        changes.enter_context(patch.object(store, 'root', copied / store.root.relative_to(self.scratch)))
                    record = self.call(action, edit, require_exact=require_exact,
                                       prefix_store=copied if (allow_prefix or repeat_before_prefix) else None)
                    final_manifest = bridge.manifest(bridge.file_state(copied))
                    record['store_wrote'] = final_manifest != manifest
                    if allow_prefix:
                        require(record['store_wrote'] and
                                record['store_at_validator'] == self.result_digest(final_manifest),
                                'the copied fixture needs the original write before validation and no writes after it')
                    elif repeat_before_prefix:
                        require(record['store_at_validator'] == self.result_digest(manifest),
                                'the first F5d evidence check must precede the EventPhase write')
                        require(record['store_wrote'] == (edit is None or record.get('same_later_document', False)),
                                'the EventPhase write must happen only after the two evidence checks')
                        record['final_store'] = self.result_digest(final_manifest)
                    elif record['errors']:
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
        import pm_goal_dg5_closure as closure
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
                if self.declare['route'] in REQUEST_PROJECTIONS or self.declare['route'] == 'inspect_receipt_recheck':
                    require(cut.get('same_projected_request'), 'the later result did not get the original request')
                if self.declare['route'] in ('current_guard_recheck', 'commit_evidence_recheck',
                                             'retry_evidence_recheck') or (
                        self.row == 'dg5/append_outer/evidence/schema'):
                    require(cut.get('same_later_document'), 'later check did not use the original document')
                if self.declare['route'] == 'f5d_repeated_evidence':
                    require(cut.get('same_later_document') and cut['final_store'] == self.runs[0]['final_store'],
                            'repeated F5d checks did not validate the same evidence and leave the same EventPhase write')
                if self.declare['route'] == 'producer_prepare':
                    require(cut.get('same_submission_payload'), 'the submission did not get the original payload')
                require(before == restored and before['observations'][0] == cut['observations'][0] and
                        bool(cut['errors']) == bool(later),
                        'the complete call did not restore the same document and validation message')
        require(self.runs[0] == self.runs[-1], 'the restored accepted control changed')
        if self.declare['route'] in ('f5d_after_event_phase', 'f5d_repeated_evidence', 'producer_prepare'):
            require(len({record['store_at_validator'] for record in self.runs}) == 1,
                    'the trials changed the copied store prefix')
            control = self.runs[0]
            document = control['observations'][0]['document']
            sink = []
            saved = closure.CAPTURE[0]
            closure.CAPTURE[0] = sink
            try:
                if self.declare['route'] == 'producer_prepare':
                    from pm_goal_dg_cf1_world import D

                    bank = D.bank()
                else:
                    bank = world.realm
                errors = bank.errors(*control['realm_ref'], document)
            finally:
                closure.CAPTURE[0] = saved
            require(sink and not errors and bridge.manifest(bridge.file_state(self.scratch)) == initial,
                    'the original schema failed to accept the copied document without writing')
            return sink[0], getattr(bank, 'scoped', bank), document
        if self.declare.get('transaction'):
            self.probe_root = True
            try:
                self.call(action, None)
            except RootCapture:
                pass
            finally:
                self.probe_root = False
        return self.capture


def verify_projected_request(projection, clauses):
    bank, reference, accepted = projection
    require(not bank.errors(reference, accepted), 'the original result did not accept its request')
    for name, trial in clauses.items():
        require(trial['cls'] == 'KILLED', 'the projected request needs an independent test for every rule')
        projected = {**accepted, 'request': trial['invalid']}
        actual = bank.errors(reference, projected)
        found = {(tuple(error.absolute_path)[1:], error.validator, error.message) for error in each_error(actual)
                 if error.absolute_path and error.absolute_path[0] == 'request'}

        def messages(listing):
            for path, _, keyword, message, context in listing:
                yield tuple(path), keyword, message
                yield from messages(context)

        require(set(messages(trial['before'])) <= found, f'{name}: the exact request message was missing in the result')
        trial['also_refused_by'] = dict(schema=reference, field='request', messages=errors_list(actual))


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
    within_guard = path[:-1] == ['control', 'record']
    require(location.endswith('#/$defs/Control') and
            (path[:-1] in (['record'], ['control']) or within_guard),
            'the phase implication applies only to a Control member')
    node = nodes[location]['node']
    member = path[-1]
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
    if within_guard:
        require(location.removesuffix('Control') + 'GuardReadResult' in nodes,
                'nested Control premise needs the original GuardReadResult definition')
        remaining = {error for error in remaining if error[1] == tuple(path) and
                     isinstance(error[2], str) and error[2].startswith(location + '/')}
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
    notes = pending_branch_locations(nodes, parent, path, locations(errors))
    if '/else/' in name:
        peer = parent + '/properties/' + member + '/anyOf/0/minLength'
        require(('minLength', tuple(path), peer) in notes, 'same length rule did not remain')
    else:
        peer = parent + '/allOf/0/then/properties/' + member + '/type'
        require(notes == {('type', tuple(path), peer)}, 'exact direct null rule did not remain')
    return dict(source=parent + '/allOf/0', independent_rule=peer,
                reason='Direct requests require null. Every other request requires a nonempty string.')


def origin_implication(nodes, name, path, errors, locations):
    """Each origin kind requires the string or null member from the main rule."""
    parent = name.split('/allOf/', 1)[0].split('/properties/', 1)[0]
    member = path[-1]
    index, kind = {'bound_plan_ref': (0, 'plan_build'), 'owning_workflow_ref': (1, 'internal_workflow')}[member]
    require(parent.endswith('#/$defs/origin') and path in (
        ['record', member], ['origin', member], ['record', 'pending', 'origin', member]),
            'unexpected origin location')
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
    notes = pending_branch_locations(nodes, parent, path, locations(errors))
    if '/then/' in name:
        peer = parent + '/properties/' + member + '/anyOf/0/minLength'
        require(('minLength', tuple(path), peer) in notes, 'origin string length check did not remain')
    else:
        peer = parent + f'/allOf/{index}/else/properties/{member}/type'
        require(notes == {('type', tuple(path), peer)}, 'origin null check did not remain')
    return dict(source=parent + f'/allOf/{index}', independent_rule=peer, nonnull_kind=kind)


def pending_branch_locations(nodes, record, path, observed):
    """Keep the surviving field checks after verifying the enclosing nullable branch."""
    observed = body_pending_locations(nodes, path, observed)
    prefix = path[:2] if path[:2] == ['record', 'pending'] else []
    member = path[len(prefix)]
    if member not in ('origin', 'accepted_revision'):
        return observed
    parent = record.split('#', 1)[0] + '#/$defs/pending/properties/' + member
    choices = nodes[parent]['node']['anyOf']
    require(choices[0]['$ref'] in (record, '#' + record.split('#', 1)[1]) and choices[1]['type'] == 'null',
            'pending record no longer uses the same optional branch')
    enclosing = {('anyOf', (*prefix, member), parent + '/anyOf'), ('type', (*prefix, member), parent + '/anyOf/1/type')}
    require(enclosing <= observed, 'expected both enclosing nullable messages')
    return observed - enclosing


def body_pending_locations(nodes, path, observed):
    if path[:2] != ['record', 'pending']:
        return observed
    parent = ('https://puppetmaster.local/schemas/goal_cancel_command_custody/1.0.0/'
              'goal_cancel_command_custody.schema.json#/$defs/BodyControlV2/properties/pending')
    choices = nodes[parent]['node']['anyOf']
    require(choices[0]['$ref'] == ('https://puppetmaster.local/schemas/goal_body_custody/1.0.0/'
                                  'goal_body_custody.schema.json#/$defs/pending') and
            choices[1]['type'] == 'null', 'body control no longer uses the same pending record')
    at = tuple(path[:2])
    enclosing = {('anyOf', at, parent + '/anyOf'), ('type', at, parent + '/anyOf/1/type')}
    require(enclosing <= observed, 'expected both enclosing pending messages')
    return observed - enclosing


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


def nonempty_timestamp_implication(nodes, name, path, errors, locations, validator):
    from pm_goal_test_numrule import DT

    schema_node = name.removesuffix('/minLength')
    format_id = schema_node + '/format'
    node = nodes[schema_node]['node']
    checker, _ = validator.format_checker.checkers['date-time']
    receipt = (name.endswith('/AppendReceipt/properties/acknowledged_at_utc/minLength') and
               path[-2:] == ['first_append_receipt', 'acknowledged_at_utc'])
    event = (name == EVENT_RECORD + '/$defs/date_time_string/minLength' and
             path[-1] in ('occurred_at_utc', 'observed_at_utc', 'persisted_at_utc'))
    require((receipt or event) and node['minLength'] == 1 and node['format'] == 'date-time',
            'receipt timestamp length rule changed')
    require(checker.__module__ == DT.__name__ and DT._DATE_TIME.fullmatch('') is None and
            not validator.format_checker.conforms('', 'date-time') and
            locations(errors) == {('format', tuple(path), format_id)},
            'the remaining receipt format rule did not refuse the empty timestamp')
    return dict(source=format_id, same_document_path=path,
                implementation='scripts/pm_event_datetime.py:63',
                premise='The only string with length less than one is empty. The pinned date-time format refuses it.')


def native_afterimages_implication(nodes, name, path, control, errors, locations):
    parent, prop = name.split('/properties/', 1)
    require(parent.endswith('#/$defs/WorkflowMutationOrigin') and prop == 'afterimages/oneOf' and
            path == ['record', 'afterimages'], 'unexpected Workflow afterimages rule')
    node = nodes[parent]['node']
    require({'method', 'afterimages'} <= set(node['required']), 'Workflow mutation fields are optional')
    alternatives = [item['$ref'] for item in node['properties']['afterimages']['oneOf']]
    branches = {item['if']['properties']['method']['const']: item['then']['properties']['afterimages']['$ref']
                for item in node['allOf']}
    require(set(branches) == set(node['properties']['method']['enum']) and
            len(alternatives) == len(branches) == len(node['allOf']) == 3 and
            set(alternatives) == set(branches.values()), 'methods no longer select each afterimages definition')
    schemas = [nodes[parent.split('#', 1)[0] + ref]['node'] for ref in alternatives]
    members = set()
    for schema in schemas:
        required = frozenset(schema['required'])
        require(schema['type'] == 'object' and schema['additionalProperties'] is False and
                set(schema['properties']) == required and required not in members,
                'the afterimages alternatives could accept the same document')
        members.add(required)
    selected = parent.split('#', 1)[0] + branches[control['record']['method']] + '/required'
    require(locations(errors) == {('required', tuple(path), selected)},
            'the selected method did not retain its exact required-member message')
    return dict(source=selected, same_document_path=path, method_definitions=branches,
                premise='Every method requires one afterimages definition. Their closed member sets are disjoint.')


def native_transition_implication(nodes, name, path, control, errors, locations):
    namespace = name.split('#', 1)[0] + '#/$defs/'
    transition = namespace + 'TransitionCommitment'
    update = namespace + 'WorkflowUpdate'
    commit = nodes[transition]['node']
    record = control['record']
    observed = locations(errors)
    if name in (transition + '/properties/before/anyOf', transition + '/properties/before/anyOf/1/type'):
        condition = commit['allOf'][0]
        branches = [{'key': 'else', 'rule': '#/$defs/BodyIssuanceCommitment'},
                    {'key': 'then', 'rule': 'null'}]
        nullable = commit['properties']['before']['anyOf']
        strip = lambda node: {key: value for key, value in node.items() if key != 'x-pm-oracle-id'}
        require('before' in commit['required'] and condition['if']['properties']['rule']['const'] == 'activation_begin'
                and [strip(condition[entry['key']]['properties']['before']) for entry in branches] ==
                [strip(item) for item in nullable] == [{'$ref': branches[0]['rule']}, {'type': branches[1]['rule']}],
                'the transition branches no longer enforce one alternative on every document')
        source = namespace + 'BodyIssuanceCommitment/required'
        require(path == ['record', 'transition', 'before'] and record['transition']['rule'] != 'activation_begin' and
                observed == {('required', tuple(path), source)}, 'the original body message did not remain')
        return dict(source=source, selector=transition + '/allOf/0',
                    premise='Activation requires null. Every other transition requires the same BodyIssuanceCommitment.')
    owner = nodes[update]['node']
    causes = {}
    for index, clause in enumerate(owner['allOf']):
        selector = clause['if']
        branch = selector['properties']['transition']
        rule = branch['properties']['rule']
        require(all(set(item) - {'x-pm-oracle-id'} == {'properties'} for item in (selector, branch))
                and set(selector['properties']) == {'transition'} and set(branch['properties']) == {'rule'},
                'the cause condition no longer matches a non-object transition')
        constant = clause['then']['properties']['cause']['const']
        causes[rule['const']] = (constant, update + f'/allOf/{index}/then/properties/cause/const')
    require({'transition', 'cause'} <= set(owner['required']) and
            owner['properties']['transition']['$ref'] == '#/$defs/TransitionCommitment' and
            commit['type'] == 'object' and 'rule' in commit['required'] and
            commit['properties']['rule']['$ref'] == '#/$defs/BoundTransitionRule' and
            set(causes) == set(nodes[namespace + 'BoundTransitionRule']['node']['enum']),
            'the cause conditions no longer cover the exact transition enum')
    if name == transition + '/type':
        require(path == ['record', 'transition'] and len({value for value, _ in causes.values()}) >= 2 and
                observed == {('const', ('record', 'cause'), rule) for value, rule in causes.values()
                             if record['cause'] != value},
                'invalid transition did not activate the contradictory cause conditions')
        return dict(source=[rule for _, rule in causes.values()],
                    premise='A non-object transition activates every conditional. They require distinct cause values.')
    require(name == update + '/properties/cause/enum' and path == ['record', 'cause'] and
            {value for value, _ in causes.values()} <= set(owner['properties']['cause']['enum']),
            'an allowed transition can now imply a cause outside the enum')
    source = causes[record['transition']['rule']][1]
    require(observed == {('const', tuple(path), source)}, 'the selected transition cause message did not remain')
    return dict(source=source, same_document_path=path,
                premise='Each required transition rule constrains the cause to a value in the enum.')


EVENT_RECORD = 'https://puppetmaster.local/schemas/event_record/2.0.0/event_record.schema.json#'


def event_scope_trial(nodes, validator, go, control, path, name, disabled):
    schema = nodes[EVENT_RECORD]['node']
    require('scope_kind' in schema['required'] and all(
        branch['if']['required'] == ['scope_kind'] for branch in schema['allOf']),
        'EventRecord no longer requires the scope selector')
    selected = name.split('/if/', 1)[0]
    application, project = (EVENT_RECORD + '/allOf/' + n for n in ('0', '1'))
    require(selected in (application, project) and name[len(selected):] in ('/if/required', '/if/properties/scope_kind/const') and
            [b['if']['properties']['scope_kind']['const'] for b in schema['allOf']] == ['application', 'project'],
            'EventRecord scope condition changed')
    document = copy.deepcopy(control)
    original = set()
    if name.endswith('/if/required'):
        del go.get(document, path)['scope_kind']
        original = {EVENT_RECORD + '/required'}
    added = (application + '/then/properties/project_id/type' if selected == application
             else EVENT_RECORD + '/$defs/non_empty_string/type')
    before = go.errors_of(validator, document)
    cut = go.errors_of(validator, document, disabled)
    restored = go.errors_of(validator, document)
    require(go.locations(before) == original and go.locations(cut) == original | {added} and
            errors_list(before) == errors_list(restored), 'EventRecord selector did not produce the exact branch message')
    return dict(cls='SELECTOR_OR_NEGATED', condition=name, input=document, original=errors_list(before),
                cut=errors_list(cut), restored=errors_list(restored))


def event_string_implication(nodes, name, path, cut, locations):
    member = path[-1]
    node_id = EVENT_RECORD + '/properties/' + member
    node = nodes[node_id]['node']
    keyword = 'const' if 'const' in node else 'enum'
    allowed = [node['const']] if keyword == 'const' else node['enum']
    peer = node_id + '/' + keyword
    require(name == node_id + '/type' and node['type'] == 'string' and allowed and
            all(type(item) is str for item in allowed) and locations(cut) == {(keyword, tuple(path), peer)},
            'the EventRecord values no longer imply the same string type')
    return dict(source=peer, same_document_path=path, premise='Every allowed value is a string.')


def selected_event_scope(nodes):
    selected, = [location for location in nodes if location.endswith('#/$defs/SelectedActiveEvent')]
    base, project = nodes[selected]['node']['allOf']
    require(base['$ref'] == EVENT_RECORD.removesuffix('#') and
            project['properties']['scope_kind']['const'] == 'project' and
            'scope_kind' in nodes[EVENT_RECORD]['node']['required'],
            'the selected event scope is no longer required and pinned')
    return selected + '/allOf/1/properties/'


def certified_payload_implication(nodes, name, errors, go, expected):
    root = 'pm.goal_runtime_event.goal_run_certified.schema.v3#'
    payload = root + '/$defs/event_payload'
    output = root + '/$defs/validator_output'
    projected = root + '/allOf/1/properties/payload/properties/'
    ordinary = payload + '/properties/'
    conditional = payload + '/allOf/0/then/properties/'
    decision = 'final_certifier_decision'
    risk = 'unresolved_risk_refs'
    outputs = 'validator_outputs'
    schemas = lambda location: nodes[location]['node']
    require(go.locations(errors) == set(expected) and expected, 'the exact certified payload messages did not remain')
    require(schemas(projected + decision)['const'] == 'certified' and decision in schemas(payload)['required'] and
            schemas(ordinary + decision)['enum'] == ['certified', 'certified_with_approved_exception'],
            'the certified decision pin changed')
    guarded = schemas(projected + outputs + '/items/properties/outcome')
    require(guarded['const'] == 'passed' and 'outcome' in schemas(output)['required'] and
            schemas(payload)['allOf'][0]['if']['properties'][decision]['const'] == 'certified',
            'the certified outcome pin or decision condition changed')
    peers = {}
    risk_condition = conditional + risk
    risk_cap = projected + risk
    require(schemas(risk_condition)['maxItems'] == schemas(risk_cap)['maxItems'] == 0 and
            schemas(risk_condition)['type'] == schemas(root + '/$defs/ref_array')['type'] == 'array' and
            schemas(ordinary + risk)['$ref'] == '#/$defs/ref_array' and
            schemas(payload)['allOf'][1]['if']['properties'][decision]['const'] == 'certified_with_approved_exception' and
            schemas(payload)['allOf'][1]['then']['properties'][risk]['$ref'] == '#/$defs/non_empty_ref_array' and
            schemas(root + '/$defs/non_empty_ref_array')['minItems'] == 1 and risk in schemas(payload)['required'],
            'the certified and exception risk rules no longer imply the checked result')
    peers.update({risk_condition + '/maxItems': risk_cap + '/maxItems',
                  risk_condition + '/type': root + '/$defs/ref_array/type',
                  risk_cap + '/maxItems': risk_condition + '/maxItems',
                  projected + decision + '/const': risk_cap + '/maxItems',
                  ordinary + decision + '/enum': projected + decision + '/const',
                  ordinary + decision + '/type': projected + decision + '/const'})
    negative_branch = schemas(conditional + outputs)['not']
    require(set(negative_branch) - {'x-pm-oracle-id'} == {'contains'} and
            negative_branch['contains']['properties']['outcome']['enum'] == ['failed', 'blocked'],
            'the negated certified validator-output branch changed')
    require(schemas(output)['type'] == 'object' and
            all(set(branch) - {'x-pm-oracle-id'} == {'properties', 'required'} for branch in schemas(output)['oneOf']) and
            schemas(output + '/oneOf/0/properties/outcome')['const'] == 'passed' and
            schemas(output + '/oneOf/1/properties/outcome')['enum'] == ['failed', 'blocked', 'skipped'] and
            schemas(output + '/properties/outcome')['enum'] == ['passed', 'failed', 'blocked', 'skipped'],
            'the certified output alternative definitions changed')
    skip = schemas(ordinary + outputs + '/items')['allOf'][1]
    require(skip['if']['properties']['outcome']['const'] == 'skipped' and 'outcome' in skip['if']['required'] and
            skip['then']['required'] == ['waiver_ref'] and schemas(ordinary + outputs)['type'] == 'array',
            'the waiver and validator-output type premises changed')
    pinned_output = projected + outputs + '/items/properties/outcome/const'
    peers.update({conditional + outputs + '/not': pinned_output, output + '/oneOf/1/required': pinned_output,
                  ordinary + outputs + '/items/allOf/1/then/required': pinned_output,
                  output + '/oneOf/0/properties/outcome/const': pinned_output,
                  output + '/properties/outcome/enum': pinned_output, output + '/properties/outcome/type': pinned_output,
                  output + '/type': output + '/oneOf',
                  ordinary + outputs + '/type': conditional + outputs + '/not'})
    document = schemas(root)
    require(document['additionalProperties'] is document['unevaluatedProperties'] is False and
            'patternProperties' not in document and
            set(document['allOf'][1]['properties']) == {'payload'} and
            set(document['allOf'][0]['then']) - {'x-pm-oracle-id'} == {'required'} and
            document['allOf'][0]['if']['properties']['payload']['properties'][decision]['const'] ==
            'certified_with_approved_exception' and {'payload'} <= set(document['required']),
            'the closed payload and pinned approval condition changed')
    peers.update({root + '/additionalProperties': root + '/unevaluatedProperties',
                  root + '/unevaluatedProperties': root + '/additionalProperties',
                  root + '/allOf/0/then/required': projected + decision + '/const'})
    for prop in (root + '/$defs/execution_role', root + '/properties/event_name', root + '/properties/schema_version'):
        rule = schemas(prop)
        keyword = 'enum' if 'enum' in rule else 'const'
        values = rule['enum'] if keyword == 'enum' else [rule['const']]
        require(rule['type'] == 'string' and values and all(type(value) is str for value in values),
                'certified constant or enumeration no longer implies a string')
        peers[prop + '/type'] = prop + '/' + keyword
    require(name in peers and peers[name] in expected, 'the source counterpart did not refuse the payload')
    return dict(source=peers[name], same_document_rule=name,
                retained_messages=expected, pinned_decision='certified', pinned_outcome='passed')


def inspection_event_selector(nodes, validator, go, control, name, disabled):
    pinned = selected_event_scope(nodes) + 'scope_kind/const'
    application, project = (EVENT_RECORD + '/allOf/' + n for n in ('0', '1'))
    branch, selector = name.split('/if/', 1)
    require(branch in (application, project) and selector in ('required', 'properties/scope_kind/const'),
            'unknown selected event scope rule')
    document = copy.deepcopy(control)
    expected = set()
    if selector == 'required':
        del document['scope_kind']
        expected.add(EVENT_RECORD + '/required')
        if branch == project:
            document['project_id'] = None
    elif branch == project:
        document.update(scope_kind='application', project_id=None)
        expected.add(pinned)
    peer = (application + '/then/properties/project_id/type' if branch == application
            else EVENT_RECORD + '/$defs/non_empty_string/type')
    before = go.errors_of(validator, document)
    cut = go.errors_of(validator, document, disabled)
    restored = go.errors_of(validator, document)
    require(go.locations(before) == expected and go.locations(cut) == expected | {peer} and
            errors_list(before) == errors_list(restored), 'selected event selector did not change the expected messages')
    return dict(cls='SELECTOR_OR_NEGATED', source=branch, input=document, original=errors_list(before),
                cut=errors_list(cut), restored=errors_list(restored))


def inspection_event_implication(nodes, name, path, errors, locations, validator):
    from pm_goal_test_numrule import DT
    from pm_goal_test_owner_adapters import _owner_timestamp_properties

    selected = selected_event_scope(nodes)
    peer = {loc for _, at, loc in locations(errors) if at == tuple(path)}
    if name.startswith(EVENT_RECORD + '/$defs/date_time_string/'):
        schema = nodes[EVENT_RECORD]['node']
        field = path[-1]
        parser, _ = validator.format_checker.checkers['date-time']
        date_time = schema['properties'][field]['$ref']
        date_time = EVENT_RECORD.removesuffix('#') + date_time if date_time.startswith('#') else date_time
        date_node = nodes[date_time]['node']
        source = inspect.getsource(_owner_timestamp_properties)
        require(path == ['occurred_at_utc'] and name.rsplit('/', 1)[0] == date_time and
                schema['properties']['schema_id']['const'] == 'pm.event.v0' and
                all(node in source for node in ("event = identity == 'pm.event.v0'",
                                                "profiles['occurred_at_utc'] = NR.DT.EVENT_RECORD",
                                                'NR.DT.date_time(instance[name], profile=profile)')) and
                parser.__module__ == DT.__name__ and date_node['minLength'] == 1 and date_node['type'] == 'string' and
                date_node['format'] == 'date-time' and DT._DATE_TIME.fullmatch('') is None,
                'the selected EventRecord timestamp rule is no longer implied by the original parser')
        expected = {EVENT_RECORD + '/properties'}
        if name.endswith('/minLength'):
            expected.add(date_time + '/format')
        require(peer == expected, 'the exact timestamp profile message did not remain')
        return dict(source=sorted(expected), implementation='scripts/pm_goal_test_owner_adapters.py:199',
                    premise='The same EventRecord timestamp parser rejects nonstrings and malformed or empty strings.')
    if path == ['payload']:
        payload = nodes[selected + 'payload']['node']['$ref'] + '#'
        original = EVENT_RECORD + '/properties/payload'
        pair = {original + '/type', payload + '/type'}
        require(name in pair and peer == pair - {name} and
                nodes[original]['node']['type'] == nodes[payload]['node']['type'] == 'object',
                'the same payload object rule was not repeated in the selected event')
        return dict(source=next(iter(peer)), same_document_path=path)
    require(len(path) == 1 and path[0] in ('event_type', 'redaction_profile', 'replay_policy', 'schema_id',
                                         'schema_version', 'scope_kind'), 'unexpected selected event string rule')
    field = path[0]
    property_id = EVENT_RECORD + '/properties/' + field
    annotation = nodes[property_id]['node']
    if field in ('event_type', 'scope_kind'):
        pin_id = selected + field
        allowed = [nodes[pin_id]['node']['const']]
        source_rule = pin_id + '/const'
    elif 'const' in annotation:
        allowed, source_rule = [annotation['const']], property_id + '/const'
    else:
        allowed, source_rule = annotation['enum'], property_id + '/enum'
    require(source_rule in peer and name.startswith(property_id + '/') and allowed and
            all(type(value) is str for value in allowed), 'the exact selected event string rule did not remain')
    if name.endswith('/enum'):
        require(set(allowed) <= set(annotation['enum']), 'the constant no longer implies the enumeration')
    elif name.endswith('/pattern'):
        from pm_goal_oracle_common import ecma_pattern

        require(all(ecma_pattern(annotation['pattern']).search(value) for value in allowed),
                'the selected event type no longer satisfies the original pattern')
    else:
        require(name.endswith('/type') and annotation['type'] == 'string', 'unexpected selected event type condition')
    return dict(source=source_rule, same_document_path=path,
                premise='The allowed constant or enum satisfies the overlapping EventRecord rule.')


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


def nonterminal_outcome_implication(nodes, name, path, errors, go, expected):
    prefix = IDENTITY.removesuffix('IdentityEnvelope')
    main = prefix + 'CommandOutcomeRecord'
    original = main + '/properties/'
    refined = NORMALIZED.removesuffix('NormalizedIdentity') + 'NonterminalOutcome/allOf/1/properties/'
    schema = nodes[main]['node']
    constraints = schema['properties']
    rules = schema['allOf']
    field = path[-1] if path else None
    require(expected and go.locations(errors) == set(expected), 'the exact outcome counterparts did not refuse')
    peer = None
    explanation = ''
    if name.startswith(IDENTITY + '/'):
        field_constraints = nodes[IDENTITY]['node']['properties'][field]
        keyword = name.rsplit('/', 1)[-1]
        if field == 'command_instance_id':
            member = rules[0]['properties']['identity']
            identifier = nodes[prefix + 'Id']['node']
            require(member['required'] == [field] and member['properties'][field]['$ref'] == '#/$defs/Id' and
                    (field_constraints[keyword] == identifier[keyword] or
                     keyword == 'type' and field_constraints[keyword] == ['string', 'null'] and
                     identifier[keyword] == 'string'),
                    'command instance identifier constraints changed')
            peer = prefix + 'Id/' + keyword
        else:
            identity = nodes[IDENTITY]['node']
            app, project = identity['allOf']
            require(field in ('project_id', 'project_home_server_id') and field in identity['required'] and
                    'scope_kind' in identity['required'] and identity['properties']['scope_kind']['enum'] ==
                    ['application', 'project'] and app['if']['properties']['scope_kind']['const'] == 'application' and
                    project['if']['properties']['scope_kind']['const'] == 'project' and
                    app['then']['properties'][field]['type'] == 'null' and
                    project['then']['properties'][field]['type'] == 'string' and
                    field_constraints['type'] == ['string', 'null'],
                    'the optional project identifier constraints changed')
            base = IDENTITY + '/properties/' + field + '/' + keyword
            condition = IDENTITY + '/allOf/1/then/properties/' + field + '/' + keyword
            if keyword != 'type':
                require(project['then']['properties'][field][keyword] == field_constraints[keyword],
                        'the same identifier bound is absent in the project branch')
            peer = condition if name == base else base
        explanation = 'The identity and its selected scope enforce the same bound.'
    elif name in (original + 'outcome/enum', refined + 'outcome/enum'):
        active = set(nodes[refined + 'outcome']['node']['enum'])
        all_outcomes = set(constraints['outcome']['enum'])
        terminal = rules[1]
        require(active < all_outcomes and set(terminal['if']['properties']['outcome']['enum']) ==
                all_outcomes - active and
                terminal['then']['properties']['owner_result_ref']['$ref'] == '#/$defs/Id' and
                nodes[refined + 'owner_result_ref']['node']['type'] == 'null' and
                nodes[prefix + 'Id']['node']['type'] == 'string',
                'terminal outcomes no longer require a result identifier')
        peer = refined + 'outcome/enum' if name.startswith(original) else original + 'outcome/enum'
        explanation = 'Every other permitted outcome requires a result identifier, which the nonterminal schema requires to be null.'
    elif name.startswith(refined + 'owner_result_'):
        owner_result = rules[2]
        schema_ref = prefix + 'OwnerResultSchemaRef'
        require(owner_result['if']['properties']['owner_result_ref']['type'] == 'string' and
                owner_result['then']['properties']['owner_result_schema_ref']['$ref'] == '#/$defs/OwnerResultSchemaRef' and
                nodes[schema_ref]['node']['type'] == 'object' and
                set(owner_result['else']['properties']) == {'owner_result_schema_ref', 'owner_result_sha256'} and
                all(item['type'] == 'null' for item in owner_result['else']['properties'].values()) and
                all(nodes[refined + member]['node']['type'] == 'null' and member in schema['required'] for member in
                    ('owner_result_ref', 'owner_result_schema_ref', 'owner_result_sha256')) and
                constraints['owner_result_ref']['oneOf'][0]['$ref'] == '#/$defs/Id' and
                constraints['owner_result_ref']['oneOf'][1]['type'] == 'null',
                'the owner result alternatives no longer require the same null values')
        peer = (original + field + '/oneOf' if field == 'owner_result_ref'
                else main + '/allOf/2/else/properties/' + field + '/type')
        explanation = 'A result identifier would require a nonnull schema reference. A null identifier requires both other result fields to be null.'
    else:
        acknowledgement, same_frame = rules[4], rules[7]
        framed = acknowledgement['then']['properties']
        unframed = acknowledgement['else']['properties']
        same = same_frame['then']['properties']
        receipt = 'acknowledgement_receipt_ref'
        frame = 'acknowledgement_frame_id'
        offset = 'acknowledgement_frame_offset'
        flag = 'same_frame_acknowledged'
        identifier = nodes[prefix + 'Id']['node']
        require(acknowledgement['if']['properties'][receipt]['type'] == 'string' and
                acknowledgement['if']['required'] == [receipt] and
                framed[frame]['$ref'] == '#/$defs/Id' and
                framed[offset]['type'] == 'integer' and framed[offset]['minimum'] == 0 and
                unframed[frame]['type'] == unframed[offset]['type'] == 'null' and unframed[flag]['const'] is False and
                same_frame['if']['properties'][flag]['const'] is True and same_frame['if']['required'] == [flag] and
                set(same_frame['then']['required']) == {frame, offset, receipt} <= set(schema['required']) and
                same[offset]['const'] == 0 and constraints[offset]['minimum'] == 0 and
                constraints[offset]['type'] == ['integer', 'null'] and
                all(constraints[key]['type'] == ['string', 'null'] and
                    same[key]['type'] == identifier['type'] == 'string' and
                    all(same[key][bound] == constraints[key][bound] == identifier[bound]
                        for bound in ('minLength', 'maxLength')) for key in (frame, receipt)),
                'the same-frame and acknowledgement constraints changed')
        if '/then/required' in name:
            peer = main + '/required'
        elif name == main + '/allOf/4/else/properties/' + flag + '/const':
            peer = main + '/allOf/7/then/properties/' + receipt + '/type'
        elif field == offset:
            keyword = name.rsplit('/', 1)[-1]
            peer = (original + offset + '/' + keyword if '/allOf/4/' in name else
                    main + '/allOf/4/then/properties/' + offset + '/' + keyword)
        elif name.startswith(main + '/allOf/7/then/') and field in (frame, receipt):
            peer = (original + field + '/' + name.rsplit('/', 1)[-1] if not name.endswith('/type') else
                    main + '/allOf/4/else/properties/' + flag + '/const' if field == receipt else prefix + 'Id/type')
        else:
            keyword = name.rsplit('/', 1)[-1]
            peer = (prefix + 'Id/' + keyword if field == frame else
                    main + '/allOf/7/then/properties/' + field + '/' + keyword)
        explanation = 'The receipt and same-frame branches require the same frame identifier and offset bounds.'
    require(peer in expected, f'{name}: the source counterpart did not remain')
    return dict(source=peer, same_document_path=path, premise=explanation, remaining_rules=expected)


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
        if example.get('event_scope_selector'):
            result[name] = event_scope_trial(nodes, validator, go, control, path, name, disable)
            continue
        if example.get('inspection_event_selector'):
            result[name] = inspection_event_selector(nodes, validator, go, control, name, disable)
            continue
        selector_keys = {'dg5:9c8b338493d0a78c': 'certified_payload_selector',
                         'dg5:e38a415fe4943e1c': 'outcome_selector'}
        select = selector_keys.get(ident)
        if select in example:
            value = control
            for change in example[select]:
                value = edit_example(go, value, change['path'], change)
            before = go.errors_of(validator, value)
            cut = go.errors_of(validator, value, disable)
            restored = go.errors_of(validator, value)
            require(go.locations(before) == set(example['expected_before']) and
                    go.locations(cut) == set(example['expected_disabled']) and
                    errors_list(before) != errors_list(cut) and errors_list(before) == errors_list(restored),
                    'the selector did not change and restore the exact validation messages')
            result[name] = dict(cls='SELECTOR_OR_NEGATED', input=value, original=errors_list(before),
                                cut=errors_list(cut), restored=errors_list(restored), condition=name)
            continue
        if example.get('outcome_unreachable'):
            require(ident == 'dg5:e38a415fe4943e1c', 'unexpected nonterminal outcome rule')
            node = nodes[name.rsplit('/', 1)[0]]
            premise = go.pinned_proof(node, nodes, validator, inventory[name])
            require(premise and premise['cls'] == 'UNREACHABLE' and not go.errors_of(validator, control, disable),
                    f'{name}: original nonterminal outcome can reach the rule')
            result[name] = premise
            continue
        if example.get('inspection_unreachable_application'):
            selected_event_scope(nodes)
            require(name == EVENT_RECORD + '/allOf/0/then/properties/project_id/type',
                    'unexpected application-only EventRecord rule')
            premise = go.pinned_proof(nodes[name.removesuffix('/type')], nodes, validator, 'type')
            require(premise and premise['cls'] == 'UNREACHABLE' and not go.errors_of(validator, control, disable),
                    'the selected event can reach the application branch')
            result[name] = premise
            continue
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
        invalid = control
        if 'certified_payload_changes' in example:
            require(ident == 'dg5:9c8b338493d0a78c', 'unexpected certified payload changes')
            for change in example['certified_payload_changes']:
                invalid = edit_example(go, invalid, change['path'], change)
        else:
            invalid = edit_example(go, control, path, example)
        if example.get('inspection_application_variant'):
            require(name.endswith('#/$defs/SelectedActiveEvent/allOf/1/properties/scope_kind/const') and
                    path == ['scope_kind'] and example['value'] == 'application', 'unexpected inspection scope edit')
            invalid['project_id'] = None
        if example.get('application_identity'):
            require(name == NORMALIZED + '/properties/owner_identity/allOf/1/properties/scope_kind/const' and
                    path == ['owner_identity', 'scope_kind'] and example['value'] == 'application',
                    'unexpected application identity example')
            invalid['owner_identity'].update(project_id=None, project_home_server_id=None, named_plan_id=None)
        before = go.errors_of(validator, invalid)
        actual = list(plain.iter_errors(invalid))
        instrumented = (certified_payload_messages(before) if ident == 'dg5:9c8b338493d0a78c'
                        else errors_list(before))
        require(instrumented == errors_list(actual), f'{name}: original and instrumented errors differ')
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
            nullable = nodes[property_id]['node']['anyOf']
            require(name == bound + '/allOf/0/then/properties/blocked_reason_ref/minLength' and
                    path in (['record', 'blocked_reason_ref'], ['after_record', 'blocked_reason_ref'],
                             ['record', 'pending', 'after_record', 'blocked_reason_ref']) and
                    other == property_id + '/anyOf/0/minLength' and
                    then['type'] == nullable[0]['type'] == 'string' and nullable[1]['type'] == 'null' and
                    then['minLength'] == nullable[0]['minLength'], 'blocked reason rules changed')
            require(body_pending_locations(nodes, path, locations(cut)) == {
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
        elif cut and (example.get('receipt_timestamp_implication') or example.get('evidence_timestamp_implication')):
            record.update(cls='COVERED_LATER', implication=nonempty_timestamp_implication(
                nodes, name, path, cut, locations, validator))
        elif cut and example.get('native_afterimages_implication'):
            record.update(cls='COVERED_LATER', implication=native_afterimages_implication(
                nodes, name, path, control, cut, locations))
        elif cut and example.get('native_transition_implication'):
            record.update(cls='COVERED_LATER', implication=native_transition_implication(
                nodes, name, path, control, cut, locations))
        elif cut and example.get('evidence_type_implication'):
            record.update(cls='COVERED_LATER', implication=event_string_implication(
                nodes, name, path, cut, locations))
        elif cut and example.get('inspection_event_implication'):
            record.update(cls='COVERED_LATER', implication=inspection_event_implication(
                nodes, name, path, cut, locations, validator))
        elif cut and 'certified_payload_messages' in example:
            record.update(cls='COVERED_LATER', implication=certified_payload_implication(
                nodes, name, cut, go, example['certified_payload_messages']))
        elif cut and 'outcome_implication' in example:
            record.update(cls='COVERED_LATER', implication=nonterminal_outcome_implication(
                nodes, name, path, cut, go, example['outcome_implication']))
        elif cut and 'outcome_pin' in example:
            require(ident == 'dg5:e38a415fe4943e1c', 'unexpected pinned outcome rule')
            node = nodes[name.rsplit('/', 1)[0]]
            premise = go.pinned_proof(node, nodes, validator, keyword)
            require(premise and premise['cls'] == example['outcome_pin'], 'the declared outcome pin changed')
            record.update(cls='COVERED_LATER', implication=premise)
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


def certified_payload_messages(errors):
    """Use the schema's original wording when a message prints an annotated definition."""
    def without_test_annotations(node):
        if isinstance(node, dict):
            return {key: without_test_annotations(value) for key, value in node.items() if key != 'x-pm-oracle-id'}
        if isinstance(node, list):
            return [without_test_annotations(value) for value in node]
        return node

    result = errors_list(errors)
    for error, display in zip(errors, result):
        rendered = f'{error.instance!r} should not be valid under {error.validator_value!r}'
        if error.validator == 'not' and error.message == rendered:
            original = without_test_annotations(error.validator_value)
            display[3] = f'{error.instance!r} should not be valid under {original!r}'
        if error.validator == 'oneOf' and len(error.validator_value) == 2:
            branches = tuple(reversed(error.validator_value))
            rendering = repr(error.instance) + ' is valid under each of '
            if error.message == rendering + ', '.join(map(repr, branches)):
                display[3] = rendering + ', '.join(repr(without_test_annotations(branch)) for branch in branches)
        display[4] = certified_payload_messages(error.context)
    return result


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
    if declare.get('use_guard_result_examples'):
        shared = json.loads((args.declaration.parent / 'certified-guard-result.json').read_text())
        require(shared['row'] == 'dg5/guard/result/schema' and
                all(declare[key] == shared[key] for key in ('family', 'source', 'census_sha256', 'root')) and
                declare['row'].endswith('/guard/schema') and
                not ({'examples', 'accepted_branches'} & declare.keys()),
                'shared GuardReadResult examples require the same root, source and family')
        declare.update(examples=shared['examples'], accepted_branches=shared['accepted_branches'])
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
        ('dg5/commit/evidence/schema', 'commit_evidence_recheck'): 'commit_final/evidence/schema/',
        ('dg5/retry/evidence/schema', 'retry_evidence_recheck'): 'retry/result/schema/evidence',
        ('dg5/append_outer/evidence/schema', 'f5d_after_event_phase'): 'append/result/schema/evidence',
        ('dg5/f5d/evidence/schema', 'f5d_repeated_evidence'): 'append_outer/evidence/schema/',
        ('dg5/producer/payload/schema', 'producer_prepare'): 'producer/submission/schema/payload',
        ('dg5/current/guard/schema', 'current_guard_recheck'): 'current_final/guard/schema/',
        ('dg5/dgu/reader/receipt/receipt_request/schema', 'receipt_recheck'):
            'dgu/reader/receipt/final/receipt_request/schema/',
        ('dg5/dgu/producer/publish/publication/schema', 'publish_receipted'): 'dgu/progress/schema/',
        ('dg5/dgu/producer/freeze/producer_input/schema', 'freeze_input'): 'dgu/progress/schema/',
        ('dg5/dgu/producer/publish/producer_input/schema', 'publish_input'): 'dgu/producer/publish/final_candidate',
        ('dg5/dgu/reader/input/request/schema', 'input_recheck'): 'dgu/reader/input/result/schema/request',
        ('dg5/dgu/inspect/request/schema', 'inspect_request_recheck'): 'dgu/inspect/witness/schema/request',
        ('dg5/dgu/inspect/event/schema', 'inspect_event_recheck'): 'dgu/inspect/frozen_producer',
        ('dg5/dgu/inspect/receipt_request/schema', 'inspect_receipt_recheck'):
            'dgu/inspect/observation/schema/payload/body_receipt_request',
        ('dg5/dgu/reader/audit/request/schema', 'audit_current_request'): 'dgu/reader/audit/result/schema/request',
        ('dg5/dgu/reader/audit/request/schema', 'audit_terminal_request'): 'dgu/reader/audit/result/schema/request',
        ('dg5/dgu/body/reserve/pending/schema', 'reserve_pending'): 'dgu/body/goal_body_control/schema/record/pending',
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
    elif declare['route'] == 'producer_prepare':
        world, action = certified_producer_fixture(fixture)
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
        if declare['route'] in REQUEST_PROJECTIONS:
            require(check.request_projection is not None, 'the accepted result was not captured')
            verify_projected_request(check.request_projection, clauses)
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
