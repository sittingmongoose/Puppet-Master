"""C12-SS: storage.recovery_applied complete capsule, publication, aftermath and passive-read boundary.

Owner clauses (SP-293 "Recovery original action custody and publication" and
"Exact identities, phases and response contracts"; SP-2207 aftermath; RA-P01..06
and RA-N01..06): the MP digests of the input, prepared postcondition and
physical receipt, and recovery_id, event_id, idempotency_key, correlation_id
and durability_receipt_ref derived from them; the closed capsule phase graph
prepared -> effect_started -> effect_durable -> append_pending -> committed,
with recovery_required preserving the last proven phase, a committed capsule
never reopened, and each update advancing the revision by one; the original
input, actor, admission time, prepared postcondition, native intent, physical
receipt, frozen producer input and restore reservation immutable once captured;
the frozen producer input derived from the physical receipt and actor; one
append, at the commit step, and replay of the same eleven-field receipt after a
durable commit frame; the exact publish.v1 completion response; the aftermath
applied only after a verified first receipt and with no newer block, through the
generic projector's generation and frontier CAS (rebuild pairs publish a new
generation, resume pairs keep it, hold pairs advance nothing), repeating nothing
on restart and writing no other checkpoint; and the passive read with exact
result fields, freshness current|refreshing|stale and health healthy|degraded
from the current source contract (currentness never converts degraded to
healthy), typed unavailable on any missing proof or permission, and no effect.
Native execution remains NOT_RUN.
"""
import copy
import hashlib

import pm_s3bo_oracles as w
import pm_s3bo_sr_common as sr
import pm_s3bo_ss_common as s

LANE = 'ss'
REC = 'storage.recovery_applied'
FAMILIES = (REC,)
FIXTURES = w.read_json('Plans/storage_recovery_action_custody_contract_fixtures.json')
CAPSULE_ROOT = sr.schema_root('Plans/storage_recovery_action_custody.schema.json', 'capsule')
ACTIONS = ('adopt_valid_tail', 'seal_degraded', 'truncate_unacknowledged_tail', 'exclude_proven_range',
           'restore_verified_backup', 'block_mutation')
PHASES = ('prepared', 'effect_started', 'effect_durable', 'append_pending', 'committed')
NEXT = {'prepared': 'effect_started', 'effect_started': 'effect_durable', 'effect_durable': 'append_pending',
        'append_pending': 'committed'}
STEP_PHASE = {'capture': 'prepared', 'attach_intent': 'effect_started', 'effect_durable': 'effect_durable',
              'freeze_input': 'append_pending', 'append_commit': 'committed', 'resume_commit': 'committed'}
# Aftermath classes over the payload's closed action cross-products (schema oneOf; SP-2207; RA-P02, RA-P03).
AFTERMATH = {('advance_to_verified_survivor', 'resume_from_verified_checkpoint'): 'keep',
             ('preserve_verified_checkpoint', 'resume_from_verified_checkpoint'): 'keep',
             ('invalidate_and_rebuild', 'rebuild_from_verified_survivor'): 'rebuild',
             ('restore_verified_checkpoint', 'rebuild_from_verified_survivor'): 'rebuild',
             ('hold_without_advance', 'remain_stopped'): 'hold'}
PROJECTOR = 'projector.storage.event_record_index@1.0.0'
CHECKPOINT = 'event_record_index_checkpoint.v1:' + w.STORE
READ_FIELDS = ('operation', 'recovery_id', 'event_id', 'action', 'user_disclosure_required', 'first_actor_ref',
               'first_occurred_at_utc', 'durability_receipt_ref', 'first_append_receipt', 'projection_freshness',
               'projection_health', 'action_authority', 'owned_durable_effects', 'generic_checkpoint_effects')

ROWS = [
    ('ss_rec_identity', 'ss_recovery', 'equal', 'input, prepared and physical-receipt MP digests and every derived identity follow SP-293 exactly.'),
    ('ss_rec_projection', 'ss_recovery', 'equal', 'The frozen producer input is the application Storage projection of the physical receipt and original actor.'),
    ('ss_rec_payload', 'ss_recovery', 'equal', 'The frozen payload is the physical receipt effect payload plus its durability reference.'),
    ('ss_rec_phase', 'ss_recovery', 'equal', 'Capsule phases follow the closed graph; recovery_required keeps the last proven phase; committed never reopens; revisions advance by one.'),
    ('ss_rec_immutable', 'ss_recovery', 'equal', 'Input, actor, admission, prepared result, intent, physical receipt, frozen input and reservation never change once captured.'),
    ('ss_rec_events', 'ss_recovery', 'equal', 'Exactly one append, at the commit step; a resumed commit replays the original receipt with no append.'),
    ('ss_rec_receipt', 'ss_recovery', 'equal', 'The committed capsule, shared custody, publish.v1 response and stored event join one original first receipt.'),
    ('ss_rec_aftermath', 'ss_recovery', 'equal', 'Aftermath follows a verified receipt with no newer block, through the projector CAS by action class, and repeats nothing.'),
    ('ss_rec_read', 'ss_recovery_custody', 'equal', 'The passive read returns the exact fields, freshness and health from the current source, or typed unavailable, with no effect.'),
    ('ss_rec_schema', 'ss_recovery_custody', 'error', 'Every capsule revision keeps every keyword of the closed SP-293 capsule schema.'),
    ('ss_rec_numbers', 'ss_recovery_custody', 'error', 'Every first-receipt Storage integer copy uses shared storage_uint64.'),
    ('ss_rec_time', 'ss_recovery_custody', 'error', 'Receipt acknowledgements use EventRecord and capsule custody times use Storage UTC-Z date_time.'),
]


def mp(tag, value):
    return hashlib.sha256(w.storage_value_bytes([tag, '1.0.0', value], profile=w.EVENT_VALUE)).hexdigest()


def fixture(action, phase):
    return copy.deepcopy(next(x['value'] for x in FIXTURES['cases'] if x['case_id'] == action + '.' + phase))


def started(action):
    """The effect_started revision: the prepared capsule plus the attached original intent (null for block)."""
    capsule = fixture(action, 'prepared')
    durable = fixture(action, 'effect_durable')
    capsule.update(phase='effect_started', last_proven_phase='effect_started', revision=2,
                   original_native_intent=copy.deepcopy(durable['original_native_intent']))
    return capsule


def lifecycle(action):
    return [fixture(action, 'prepared'), started(action), fixture(action, 'effect_durable'),
            fixture(action, 'append_pending'), fixture(action, 'committed')]


def projection(capsule):
    """SP-293: the complete producer input of this writer, from the physical receipt and original actor."""
    receipt = capsule['physical_receipt']; digest = capsule['input_sha256']
    payload = dict(copy.deepcopy(receipt['effect_payload']),
                   durability_receipt_ref='pm.storage.recovery.action_receipt.v1:' + mp('pm.storage.recovery.action_receipt.v1', receipt))
    return {'schema_id': 'pm.event.v0', 'schema_version': '2.0.0', 'scope_kind': 'application', 'event_type': REC,
            'event_id': 'evt_storage_recovery_' + digest, 'idempotency_key': 'storage.recovery_applied:' + digest,
            'correlation_id': 'storage.recovery_action:' + digest, 'project_id': None, 'thread_id': None, 'run_id': None,
            'node_id': None, 'attempt_id': None, 'requested_account_ref': None, 'effective_account_ref': None,
            'actor_ref': capsule['original_actor_ref'], 'occurred_at_utc': receipt['first_effect_observed_at_utc'],
            'producer_sequence_id': None, 'causation_event_id': None, 'parent_event_id': None,
            'payload_schema_id': w.FAMILY[REC]['payload_schema_id'], 'payload': payload, 'payload_ref': None,
            'redaction_profile': 'no_secrets', 'replay_policy': 'dedupe_by_idempotency_key',
            'migration': {k: None for k in ('compatibility_event_type', 'migrated_from_schema_id', 'migrated_from_schema_version', 'migration_id')}}


ENVELOPE = ('schema_id', 'schema_version', 'scope_kind', 'event_type', 'project_id', 'thread_id', 'run_id', 'node_id', 'attempt_id',
            'requested_account_ref', 'effective_account_ref', 'actor_ref', 'occurred_at_utc', 'producer_sequence_id',
            'causation_event_id', 'parent_event_id', 'payload_schema_id', 'payload_ref', 'redaction_profile', 'replay_policy', 'migration')


def stored_event(capsule):
    event = copy.deepcopy(capsule['frozen_producer_input'])
    receipt = capsule['first_append_receipt']
    event.update(sequence_id=receipt['sequence_id'], observed_at_utc=receipt['acknowledged_at_utc'],
                 persisted_at_utc=receipt['acknowledged_at_utc'])
    return event


def response(capsule):
    receipt = capsule['first_append_receipt']
    return {'operation': 'storage.recovery_applied.publish.v1', 'status': 'verified_recovery_event', 'recovery_id': capsule['recovery_id'],
            'event_id': receipt['event_id'], 'physical_action': capsule['input']['choice']['action'],
            'first_append_receipt': copy.deepcopy(receipt), 'result': s.append_result(receipt), 'action_authority': 'none'}


# ---------------------------------------------------------------- owner model (checker side)
def expected_phase(step, before):
    kind = step['kind']
    if kind == 'capture':
        return ('prepared', 'prepared', 1)
    if kind in ('conflict', 'append_crash'):
        # A conflicting request changes nothing; a crash after the durable commit frame and before the
        # compact terminal update leaves the capsule exactly at append_pending.
        return (before['phase'], before['last_proven_phase'], before['revision'])
    if kind == 'third_state':
        if before['phase'] == 'committed':
            return ('committed', 'committed', before['revision'])
        return ('recovery_required', before['last_proven_phase'], before['revision'] + 1)
    if kind == 'resume_required':
        target = NEXT[before['last_proven_phase']]
        return (target, target, before['revision'] + 1)
    target = STEP_PHASE[kind]
    if before['phase'] != 'recovery_required' and NEXT.get(before['phase']) != target:
        return ('illegal', 'illegal', None)
    return (target, target, before['revision'] + 1)


def expected_aftermath(ss):
    a = ss['aftermath']; inputs = a['inputs']; capsule = ss['capsules'][ss['committed']]
    payload = capsule['frozen_producer_input']['payload']; seq = capsule['first_append_receipt']['sequence_id']
    cls = AFTERMATH.get((payload['checkpoint_action'], payload['projection_action']), 'forbidden')
    if not inputs['receipt_verified'] or inputs['newer_block'] or cls == 'forbidden':
        return {'status': 'not_started', 'generation_after': inputs['generation_before'], 'frontier_after': inputs['frontier_before'],
                'written_checkpoints': [], 'effects': [], 'restart_effects': []}
    if cls == 'hold':
        return {'status': 'held', 'generation_after': inputs['generation_before'], 'frontier_after': inputs['frontier_before'],
                'written_checkpoints': [], 'effects': [], 'restart_effects': []}
    generation = inputs['rebuilt_generation'] if cls == 'rebuild' else inputs['generation_before']
    return {'status': 'complete', 'generation_after': generation, 'frontier_after': max(inputs['frontier_before'], seq),
            'written_checkpoints': [CHECKPOINT], 'effects': ['projector_generation_cas' if cls == 'rebuild' else 'projector_frontier_cas'],
            'restart_effects': [], 'checkpoint_owner': PROJECTOR}


def expected_read(ss):
    read = ss['read']; capsule = ss['capsules'][ss['committed']]; proofs = read['proofs']; sel = read['selector']
    if sel != {'storage_instance_id': w.STORE, 'recovery_id': capsule['recovery_id'], 'event_id': capsule['first_append_receipt']['event_id']}:
        return {'status': 'unavailable', 'reason': 'selector_not_this_recovery'}
    for proof in ('physical_receipt', 'current_event', 'full_value_witness', 'first_receipt', 'permission'):
        if not proofs[proof]:
            return {'status': 'unavailable', 'reason': proof + '_unavailable'}
    payload = capsule['frozen_producer_input']['payload']
    result = {'operation': 'storage.recovery_applied.read.v1', 'recovery_id': capsule['recovery_id'],
              'event_id': capsule['first_append_receipt']['event_id'], 'action': payload['action'],
              'user_disclosure_required': payload['user_disclosure_required'], 'first_actor_ref': capsule['original_actor_ref'],
              'first_occurred_at_utc': capsule['physical_receipt']['first_effect_observed_at_utc'],
              'durability_receipt_ref': payload['durability_receipt_ref'],
              'first_append_receipt': copy.deepcopy(capsule['first_append_receipt']),
              'projection_freshness': {'current': 'current', 'refreshing': 'refreshing', 'behind': 'stale'}[read['source']['frontier']],
              'projection_health': 'degraded' if read['source']['state'] == 'degraded' else 'healthy',
              'action_authority': 'none', 'owned_durable_effects': [], 'generic_checkpoint_effects': []}
    return {'status': 'read', 'result': result}


IMMUTABLE_AFTER = (('prepared', ('recovery_id', 'input', 'input_sha256', 'original_actor_ref', 'admitted_at_utc', 'prepared_postcondition',
                                 'original_restore_reservation')),
                   ('effect_started', ('original_native_intent',)), ('effect_durable', ('physical_receipt',)),
                   ('append_pending', ('frozen_producer_input',)), ('committed', ('first_append_receipt',)))


def receipt_copies(ss):
    out = []
    for n, capsule in enumerate(ss['capsules']):
        if isinstance(capsule.get('first_append_receipt'), dict):
            out.append((('capsules', n, 'first_append_receipt'), capsule['first_append_receipt']))
    for key in ('custody_receipt',):
        if isinstance(ss.get(key), dict):
            out.append(((key,), ss[key]))
    if isinstance(ss.get('response'), dict) and isinstance(ss['response'].get('first_append_receipt'), dict):
        out.append((('response', 'first_append_receipt'), ss['response']['first_append_receipt']))
    result = (ss.get('read_output') or {}).get('result')
    if isinstance(result, dict) and isinstance(result.get('first_append_receipt'), dict):
        out.append((('read_output', 'result', 'first_append_receipt'), result['first_append_receipt']))
    return out


def operands(case, put, common):
    ss = case.get('ss')
    if not isinstance(ss, dict) or not isinstance(ss.get('capsules'), list):
        put('ss_rec_identity', ['boundary record missing'], [])
        return
    put = s.typed_put(put)
    copies = receipt_copies(ss)
    numbers = [(path + (k,), r.get(k)) for path, r in copies for k in s.RECEIPT_NUMBERS]
    num_errors = [(p, e) for p, v in numbers for e in [w.caught(w.storage_uint64, v)] if e]
    put('ss_rec_numbers', num_errors)
    times = [(path, r.get('acknowledged_at_utc')) for path, r in copies]
    errors = s.time_errors(times, w.EVENT_RECORD)
    custody_times = [(('capsules', n, 'admitted_at_utc'), c.get('admitted_at_utc')) for n, c in enumerate(ss['capsules'])]
    custody_times += [(('capsules', n, 'physical_receipt'), c['physical_receipt'].get('first_effect_observed_at_utc'))
                      for n, c in enumerate(ss['capsules']) if isinstance(c.get('physical_receipt'), dict)]
    errors += s.time_errors(custody_times, w.STORAGE_UTC_Z)
    put('ss_rec_time', errors)
    if num_errors or errors:
        return
    put('ss_rec_schema', [[n] + e for n, capsule in enumerate(ss['capsules']) for e in sr.keyword_errors(CAPSULE_ROOT, capsule)])
    caps = ss['capsules']
    # Phase graph over every presented step.
    left = []; right = []
    for step in ss['steps']:
        after = caps[step['after']]
        before = caps[step['before']] if 'before' in step else None
        left.append((after.get('phase'), after.get('last_proven_phase'), after.get('revision')))
        right.append(expected_phase(step, before))
    put('ss_rec_phase', left, right)
    put('ss_rec_events', [len(step.get('appended', [])) for step in ss['steps']],
        [1 if step['kind'] in ('append_commit', 'append_crash') else 0 for step in ss['steps']])
    # Immutability: once a field is captured it equals its first captured value in every later revision.
    left = []; right = []
    first = {}
    for n in [step['after'] for step in ss['steps']]:
        capsule = caps[n]
        reached = PHASES.index(capsule['last_proven_phase']) if capsule.get('last_proven_phase') in PHASES else -1
        for phase, keys in IMMUTABLE_AFTER:
            if PHASES.index(phase) > reached:
                continue
            for key in keys:
                first.setdefault(key, capsule.get(key))
                left.append([n, key, capsule.get(key)]); right.append([n, key, first[key]])
    put('ss_rec_immutable', left, right)
    committed = ss.get('committed')
    if committed is None:
        return
    capsule = caps[committed]
    receipt = capsule['physical_receipt']; frozen = capsule['frozen_producer_input']; expected_frozen = projection(capsule)
    digest = mp('pm.storage.recovery.action_input.v1', capsule['input'])
    put('ss_rec_identity',
        [capsule['input_sha256'], capsule['recovery_id'], receipt['recovery_id'], receipt['input_sha256'], receipt['prepared_postcondition_sha256'],
         frozen['payload'].get('durability_receipt_ref'), frozen.get('event_id'), frozen.get('idempotency_key'), frozen.get('correlation_id'),
         frozen['payload'].get('recovery_id')],
        [digest, 'pm.storage.recovery.v1:' + digest, 'pm.storage.recovery.v1:' + digest, digest,
         mp('pm.storage.recovery.prepared_postcondition.v1', capsule['prepared_postcondition']),
         expected_frozen['payload']['durability_receipt_ref'], 'evt_storage_recovery_' + digest, 'storage.recovery_applied:' + digest,
         'storage.recovery_action:' + digest, 'pm.storage.recovery.v1:' + digest])
    put('ss_rec_projection', [frozen.get(k) for k in ENVELOPE], [expected_frozen[k] for k in ENVELOPE])
    put('ss_rec_payload', {k: x for k, x in frozen['payload'].items() if k != 'durability_receipt_ref'},
        {k: x for k, x in expected_frozen['payload'].items() if k != 'durability_receipt_ref'})
    custody = ss.get('custody_receipt') or {}; resp = ss.get('response') or {}; event = ss.get('stored_event') or {}
    put('ss_rec_receipt',
        [capsule['first_append_receipt'], resp, [event.get(k) for k in ('event_id', 'sequence_id')],
         {k: x for k, x in event.items() if k not in ('sequence_id', 'observed_at_utc', 'persisted_at_utc')},
         [custody.get('durability_class'), custody.get('durability_state')]],
        [custody, response(capsule) if custody else None, [custody.get('event_id'), custody.get('sequence_id')], frozen, ['barrier', 'synced']])
    if isinstance(ss.get('aftermath'), dict):
        a = ss['aftermath']; want = expected_aftermath(ss)
        put('ss_rec_aftermath', {k: a.get(k) for k in want}, want)
    if isinstance(ss.get('read'), dict):
        put('ss_rec_read', ss.get('read_output'), expected_read(ss))


# ---------------------------------------------------------------- fixture constructors (never called by the checker)
def present_aftermath(ss, want):
    """Presented aftermath from the AUTHORED class label."""
    inputs = ss['aftermath']['inputs']; capsule = ss['capsules'][ss['committed']]
    seq = capsule['first_append_receipt']['sequence_id']
    base = {'inputs': inputs, 'generation_after': inputs['generation_before'], 'frontier_after': inputs['frontier_before'],
            'written_checkpoints': [], 'effects': [], 'restart_effects': []}
    if want in ('not_started', 'held'):
        base['status'] = want
        return base
    base.update(status='complete', frontier_after=max(inputs['frontier_before'], seq), written_checkpoints=[CHECKPOINT],
                checkpoint_owner=PROJECTOR)
    if want == 'rebuild':
        base.update(generation_after=inputs['rebuilt_generation'], effects=['projector_generation_cas'])
    else:
        base.update(effects=['projector_frontier_cas'])
    return base


def present_read(ss, want):
    capsule = ss['capsules'][ss['committed']]; read = ss['read']
    if want.startswith('unavailable:'):
        return {'status': 'unavailable', 'reason': want.split(':', 1)[1]}
    payload = capsule['frozen_producer_input']['payload']
    freshness, health = want.split('/')
    return {'status': 'read', 'result': {
        'operation': 'storage.recovery_applied.read.v1', 'recovery_id': capsule['recovery_id'], 'event_id': capsule['first_append_receipt']['event_id'],
        'action': payload['action'], 'user_disclosure_required': payload['user_disclosure_required'],
        'first_actor_ref': capsule['original_actor_ref'], 'first_occurred_at_utc': capsule['physical_receipt']['first_effect_observed_at_utc'],
        'durability_receipt_ref': payload['durability_receipt_ref'], 'first_append_receipt': copy.deepcopy(capsule['first_append_receipt']),
        'projection_freshness': freshness, 'projection_health': health, 'action_authority': 'none',
        'owned_durable_effects': [], 'generic_checkpoint_effects': []}}


def scenario(case, action, after_class=None, read_source=None, read_want=None, proofs=None, selector=None,
             aftermath_inputs=None, after_want=None):
    caps = lifecycle(action)
    steps = [{'kind': 'capture', 'after': 0, 'appended': []},
             {'kind': 'attach_intent', 'before': 0, 'after': 1, 'appended': []},
             {'kind': 'effect_durable', 'before': 1, 'after': 2, 'appended': []},
             {'kind': 'freeze_input', 'before': 2, 'after': 3, 'appended': []},
             {'kind': 'append_commit', 'before': 3, 'after': 4, 'appended': []}]
    ss = {'family': REC, 'action': action, 'capsules': caps, 'steps': steps, 'committed': 4}
    event = stored_event(caps[4]); steps[4]['appended'] = [copy.deepcopy(event)]
    ss['stored_event'] = event; ss['custody_receipt'] = copy.deepcopy(caps[4]['first_append_receipt'])
    ss['response'] = response(caps[4])
    inputs = dict({'receipt_verified': True, 'newer_block': False, 'generation_before': 'eig_' + '1' * 64,
                   'rebuilt_generation': 'eig_' + '2' * 64, 'frontier_before': caps[4]['first_append_receipt']['sequence_id'] - 1},
                  **(aftermath_inputs or {}))
    ss['aftermath'] = {'inputs': inputs}
    cls = AFTERMATH[(caps[4]['frozen_producer_input']['payload']['checkpoint_action'], caps[4]['frozen_producer_input']['payload']['projection_action'])]
    ss['aftermath'] = present_aftermath(dict(ss, aftermath={'inputs': inputs}), after_want or {'rebuild': 'rebuild', 'keep': 'keep', 'hold': 'held'}[cls])
    degraded = action in ('seal_degraded', 'block_mutation')
    ss['read'] = {'selector': selector or {'storage_instance_id': w.STORE, 'recovery_id': caps[4]['recovery_id'], 'event_id': event['event_id']},
                  'source': read_source or {'state': 'degraded' if degraded else 'healthy', 'frontier': 'current'},
                  'proofs': dict({'physical_receipt': True, 'current_event': True, 'full_value_witness': True, 'first_receipt': True,
                                  'permission': True}, **(proofs or {}))}
    ss['read_output'] = present_read(ss, read_want or ('current/degraded' if degraded else 'current/healthy'))
    case['ss'] = ss
    return case


def rebind_capsules(value, edit, start=0):
    """One capsule-source defect in every revision from `start`; the event, custody, response and read follow."""
    v = value['ss']
    for capsule in v['capsules'][start:]:
        edit(capsule)
    v['stored_event'] = stored_event(v['capsules'][4]); v['steps'][4]['appended'] = [copy.deepcopy(v['stored_event'])]
    v['custody_receipt'] = copy.deepcopy(v['capsules'][4]['first_append_receipt']); v['response'] = response(v['capsules'][4])
    v['read']['selector'].update(recovery_id=v['capsules'][4]['recovery_id'], event_id=v['stored_event']['event_id'])
    v['read_output'] = present_read(v, 'current/healthy')
    return value


def augment(control):
    scenario(control, 'exclude_proven_range')


def cases():
    import pm_s3bo_cases as c
    controls = []; negatives = []
    main = s.control(REC, 'main', w.build(REC)); controls.append(main)
    ss = main['value']['ss']
    for row, path, replacement, label in [
            ('ss_rec_phase', ('ss', 'steps', 3, 'after'), 2, 'freeze-leaves-effect-durable'),
            ('ss_rec_phase', ('ss', 'steps', 2, 'after'), 3, 'effect-skips-to-pending'),
            ('ss_rec_phase', ('ss', 'capsules', 2, 'revision'), 4, 'revision-skips'),
            ('ss_rec_events', ('ss', 'steps', 3, 'appended'), [ss['stored_event']], 'append-before-commit-step'),
            ('ss_rec_events', ('ss', 'steps', 4, 'appended'), [ss['stored_event']] * 2, 'second-append'),
            ('ss_rec_immutable', ('ss', 'capsules', 4, 'admitted_at_utc'), '2026-09-12T10:00:00Z', 'admission-time-rewritten'),
            ('ss_rec_immutable', ('ss', 'capsules', 3, 'original_actor_ref'), 'storage.coordinator:other', 'actor-rewritten'),
            ('ss_rec_receipt', ('ss', 'response', 'action_authority'), 'dispatch', 'response-grants-authority'),
            ('ss_rec_receipt', ('ss', 'response', 'status'), 'completed_projection_aftermath', 'response-claims-aftermath'),
            ('ss_rec_receipt', ('ss', 'custody_receipt', 'durability_class'), 'ordinary', 'custody-not-barrier'),
            ('ss_rec_receipt', ('ss', 'stored_event', 'correlation_id'), 'storage.recovery_action:other', 'stored-event-differs'),
            ('ss_rec_aftermath', ('ss', 'aftermath', 'generation_after'), 'eig_' + '1' * 64, 'rebuild-keeps-generation'),
            ('ss_rec_aftermath', ('ss', 'aftermath', 'restart_effects'), ['projector_generation_cas'], 'restart-repeats'),
            ('ss_rec_aftermath', ('ss', 'aftermath', 'written_checkpoints'), [CHECKPOINT, 'storage.recovery_applied.aftermath.cursor'], 'aftermath-own-cursor'),
            ('ss_rec_aftermath', ('ss', 'aftermath', 'frontier_after'), ss['custody_receipt']['sequence_id'] - 1, 'frontier-not-covering'),
            ('ss_rec_read', ('ss', 'read_output', 'result', 'action_authority'), 'dispatch', 'read-grants-authority'),
            ('ss_rec_read', ('ss', 'read_output', 'result', 'generic_checkpoint_effects'), [CHECKPOINT], 'read-advances-checkpoint'),
            ('ss_rec_read', ('ss', 'read_output', 'result', 'first_actor_ref'), 'storage.coordinator:current', 'read-current-actor'),
            ('ss_rec_schema', ('ss', 'capsules', 2, 'extra'), 'raw-journal', 'capsule-extra-member'),
            ('ss_rec_schema', ('ss', 'capsules', 0, 'physical_receipt'), copy.deepcopy(ss['capsules'][2]['physical_receipt']), 'prepared-with-receipt'),
            ('ss_rec_numbers', ('ss', 'custody_receipt', 'byte_offset'), True, 'boolean-offset'),
            ('ss_rec_time', ('ss', 'capsules', 1, 'admitted_at_utc'), '2026-09-12T09:00:00+00:00', 'custody-time-offset')]:
        negatives.append(c.mutate(main, row, path, replacement, label))
    # A frozen-input defect: every later copy (committed capsule, stored event, read) follows the frozen input.
    for start, edit, label in [(0, lambda k: k.update(recovery_id='pm.storage.recovery.v1:' + 'c' * 64), 'recovery-id-not-input-hash'),
                               (2, lambda k: k['physical_receipt'].update(prepared_postcondition_sha256='c' * 64), 'physical-receipt-other-prepared'),
                               (0, lambda k: k.update(input_sha256='c' * 64), 'input-hash-not-mp-digest')]:
        negatives.append(c.negative(main, 'ss_rec_identity', label, rebind_capsules(copy.deepcopy(main['value']), edit, start),
                                    {'capsule_source': label, 'copies': 'every revision rebound'}))
    for row, edit, label in [('ss_rec_projection', lambda f: f.update(occurred_at_utc='2026-09-12T09:02:02Z'), 'occurred-at-append-time'),
                             ('ss_rec_projection', lambda f: f.update(actor_ref='storage.coordinator:other'), 'frozen-other-actor'),
                             ('ss_rec_projection', lambda f: f.update(redaction_profile='redacted'), 'frozen-redaction'),
                             ('ss_rec_identity', lambda f: f.update(event_id='evt_storage_recovery_' + 'c' * 64), 'event-id-not-input-hash'),
                             ('ss_rec_payload', lambda f: f['payload'].update(post_length=1), 'payload-other-length'),
                             ('ss_rec_payload', lambda f: f['payload'].update(survivor_digest='c' * 64), 'payload-other-survivor')]:
        value = copy.deepcopy(main['value']); v = value['ss']
        for n in (3, 4):
            edit(v['capsules'][n]['frozen_producer_input'])
        if label == 'event-id-not-input-hash':
            for n in (4,):
                v['capsules'][n]['first_append_receipt']['event_id'] = v['capsules'][n]['frozen_producer_input']['event_id']
        v['stored_event'] = stored_event(v['capsules'][4]); v['steps'][4]['appended'] = [copy.deepcopy(v['stored_event'])]
        v['custody_receipt'] = copy.deepcopy(v['capsules'][4]['first_append_receipt']); v['response'] = response(v['capsules'][4])
        v['read']['selector']['event_id'] = v['stored_event']['event_id']
        v['read_output'] = present_read(v, 'current/healthy')
        negatives.append(c.negative(main, row, label, value, {'frozen_input': label, 'copies': 'rebound'}))
    # Every action through the complete boundary, with its aftermath class and read health.
    for action in ACTIONS:
        if action == 'exclude_proven_range':
            continue
        value = scenario(w.build(REC), action)
        control = s.control(REC, action, value); controls.append(control)
        cls = AFTERMATH[(value['ss']['capsules'][4]['frozen_producer_input']['payload']['checkpoint_action'],
                         value['ss']['capsules'][4]['frozen_producer_input']['payload']['projection_action'])]
        if cls == 'hold':
            negatives.append(c.mutate(control, 'ss_rec_aftermath', ('ss', 'aftermath', 'frontier_after'),
                                      value['ss']['custody_receipt']['sequence_id'], 'hold-advances-frontier'))
            negatives.append(c.mutate(control, 'ss_rec_aftermath', ('ss', 'aftermath', 'effects'), ['projector_start'], 'hold-starts-projector'))
            negatives.append(c.mutate(control, 'ss_rec_read', ('ss', 'read_output', 'result', 'projection_health'), 'healthy', 'degraded-shown-healthy'))
        elif cls == 'keep':
            negatives.append(c.mutate(control, 'ss_rec_aftermath', ('ss', 'aftermath', 'generation_after'), 'eig_' + '2' * 64, 'keep-rebuilds'))
        else:
            negatives.append(c.mutate(control, 'ss_rec_aftermath', ('ss', 'aftermath', 'generation_after'), 'eig_' + '1' * 64, 'rebuild-keeps'))
        if action != 'block_mutation':
            negatives.append(c.mutate(control, 'ss_rec_immutable', ('ss', 'capsules', 4, 'original_native_intent'),
                                      {'ref': 'fixture:other-intent', 'sha256': 'e' * 64}, 'intent-replaced'))
        else:
            negatives.append(c.mutate(control, 'ss_rec_immutable', ('ss', 'capsules', 4, 'original_native_intent'),
                                      copy.deepcopy(fixture('exclude_proven_range', 'committed')['original_native_intent']), 'block-attaches-intent'))
        if action == 'restore_verified_backup':
            negatives.append(c.mutate(control, 'ss_rec_immutable', ('ss', 'capsules', 4, 'original_restore_reservation', 'restore_occurrence_id'),
                                      'fixture-restore-occurrence-2', 'reservation-rewritten'))
    # Aftermath preconditions: no verified receipt or a newer block starts nothing.
    for label, inputs in [('aftermath-unverified-receipt', {'receipt_verified': False}), ('aftermath-newer-block', {'newer_block': True})]:
        value = scenario(w.build(REC), 'exclude_proven_range', aftermath_inputs=inputs, after_want='not_started')
        control = s.control(REC, label, value); controls.append(control)
        negatives.append(c.mutate(control, 'ss_rec_aftermath', ('ss', 'aftermath'),
                                  present_aftermath(dict(value['ss'], aftermath={'inputs': dict(value['ss']['aftermath']['inputs'])}), 'rebuild'),
                                  'aftermath-runs-anyway'))
    # Passive-read health paths and typed unavailability.
    for label, source, want in [('read-refreshing', {'state': 'healthy', 'frontier': 'refreshing'}, 'refreshing/healthy'),
                                ('read-stale', {'state': 'healthy', 'frontier': 'behind'}, 'stale/healthy'),
                                ('read-degraded-current', {'state': 'degraded', 'frontier': 'current'}, 'current/degraded'),
                                ('read-degraded-stale', {'state': 'degraded', 'frontier': 'behind'}, 'stale/degraded')]:
        value = scenario(w.build(REC), 'exclude_proven_range', read_source=source, read_want=want)
        control = s.control(REC, label, value); controls.append(control)
        negatives.append(c.mutate(control, 'ss_rec_read', ('ss', 'read_output', 'result', 'projection_freshness'), 'current' if 'current' not in want else 'stale', 'freshness-misreported'))
        if source['state'] == 'degraded':
            negatives.append(c.mutate(control, 'ss_rec_read', ('ss', 'read_output', 'result', 'projection_health'), 'healthy', 'currentness-heals-degraded'))
    for proof in ('physical_receipt', 'current_event', 'full_value_witness', 'first_receipt', 'permission'):
        value = scenario(w.build(REC), 'exclude_proven_range', proofs={proof: False}, read_want='unavailable:' + proof + '_unavailable')
        control = s.control(REC, 'read-no-' + proof, value); controls.append(control)
        negatives.append(c.mutate(control, 'ss_rec_read', ('ss', 'read_output'), present_read(value['ss'], 'current/healthy'), 'missing-proof-read'))
    value = scenario(w.build(REC), 'exclude_proven_range', selector={'storage_instance_id': w.STORE, 'recovery_id': 'pm.storage.recovery.v1:' + 'e' * 64,
                                                                     'event_id': 'evt_storage_recovery_' + 'e' * 64},
                     read_want='unavailable:selector_not_this_recovery')
    control = s.control(REC, 'read-foreign-selector', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_rec_read', ('ss', 'read_output'), present_read(value['ss'], 'current/healthy'), 'foreign-selector-read'))
    # Crash after a durable commit frame: the resumed commit replays the same receipt and appends nothing.
    value = scenario(w.build(REC), 'exclude_proven_range')
    v = value['ss']
    v['steps'][4] = {'kind': 'append_crash', 'before': 3, 'after': 3, 'appended': v['steps'][4]['appended']}
    v['steps'].append({'kind': 'resume_commit', 'before': 3, 'after': 4, 'appended': []})
    control = s.control(REC, 'crash-after-commit-frame', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_rec_events', ('ss', 'steps', 5, 'appended'), [v['stored_event']], 'resume-appends-again'))
    negatives.append(c.mutate(control, 'ss_rec_receipt', ('ss', 'custody_receipt', 'acknowledged_at_utc'), '2026-09-12T11:00:00Z', 'resume-new-acknowledgement'))
    negatives.append(c.mutate(control, 'ss_rec_phase', ('ss', 'steps', 4, 'after'), 4, 'crash-commits-capsule'))
    # Third state: recovery_required keeps the last proven phase and resumes only that phase.
    value = scenario(w.build(REC), 'exclude_proven_range')
    v = value['ss']; required = copy.deepcopy(v['capsules'][1]); required.update(phase='recovery_required', revision=3)
    durable = copy.deepcopy(v['capsules'][2]); durable['revision'] = 4
    pending = copy.deepcopy(v['capsules'][3]); pending['revision'] = 5
    committed = copy.deepcopy(v['capsules'][4]); committed['revision'] = 6
    v['capsules'] = v['capsules'][:2] + [required, durable, pending, committed]
    v['steps'] = [{'kind': 'capture', 'after': 0, 'appended': []}, {'kind': 'attach_intent', 'before': 0, 'after': 1, 'appended': []},
                  {'kind': 'third_state', 'before': 1, 'after': 2, 'appended': []},
                  {'kind': 'resume_required', 'before': 2, 'after': 3, 'appended': []},
                  {'kind': 'freeze_input', 'before': 3, 'after': 4, 'appended': []},
                  {'kind': 'append_commit', 'before': 4, 'after': 5, 'appended': [copy.deepcopy(v['stored_event'])]}]
    v['committed'] = 5
    control = s.control(REC, 'recovery-required', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_rec_phase', ('ss', 'steps', 2, 'after'), 1, 'third-state-not-recorded'))
    negatives.append(c.mutate(control, 'ss_rec_phase', ('ss', 'steps', 3, 'after'), 4, 'required-skips-effect'))
    # A committed capsule never reopens; a conflicting prepared result changes nothing.
    value = scenario(w.build(REC), 'exclude_proven_range')
    v = value['ss']; v['steps'].append({'kind': 'third_state', 'before': 4, 'after': 4, 'appended': []})
    v['steps'].append({'kind': 'conflict', 'before': 4, 'after': 4, 'appended': [], 'response': 'idempotency_conflict'})
    control = s.control(REC, 'committed-terminal', value); controls.append(control)
    reopened = copy.deepcopy(v['capsules'][4]); reopened.update(phase='recovery_required', revision=6)
    value2 = copy.deepcopy(value); value2['ss']['capsules'].append(reopened); value2['ss']['steps'][5]['after'] = 5
    negatives.append(c.negative(control, 'ss_rec_phase', 'committed-reopened', value2, {'capsule': 'committed -> recovery_required'}))
    return controls, negatives


def corpus_slots(control):
    ss = control['value'].get('ss') or {}
    copies = receipt_copies(ss)
    if not copies:
        return
    yield {'paths': [('ss',) + path + ('acknowledged_at_utc',) for path, _r in copies], 'kind': 'datetime', 'row': 'ss_rec_time',
           'profile': w.EVENT_RECORD, 'type_rows': ['ss_rec_time']}
