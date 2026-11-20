"""C12-SS: platform.capability_evaluated complete evaluation, decision-custody, read and run-context boundary.

Owner clauses (N2-157 and the platform catalog/evaluation contract; SP-290;
SP-2209; CAP-POS-001..010 and CAP-NEG-001..014): the capability ref resolves
only to an active entry of the frozen active catalog revision; the original
request joins its independently authenticated context and subject scope; every
supplied source fact independently satisfies its owner's subject, kind,
verification, freshness, enumeration, no-secret and observed-before-occurrence
rules, duplicates refuse, and required/preferred without valid evidence fails
closed; precedence live_runtime_discovery > provider_policy_snapshot >
static_platform_baseline selects the result while lower valid evidence remains
provenance in precedence order; not_requested yields not_evaluated/none/null
with no evidence; the event and idempotency key 'platform-evaluation:v1:' + the
restricted-JSON identity digest, the scope-qualified physical key and the
request and frozen-input digests; the envelope projection of the original
request and context; the 14-field decision row joining request, catalog
selection, minimal source facts, frozen input, Storage assignments and the
original first receipt; committed-receipt retry (exact receipt, no authority or
read-through), changed-request conflict, deleted custody never reconstructed,
and capture closure refusing fresh evaluations; the passive read (complete
current marker with the live SP-278 token of the read, closed unavailable
reasons, stale source refused); and the per-evaluation run-context consumer's
joins and unavailable aggregate use. Native execution remains NOT_RUN.
"""
import copy
import hashlib

import pm_s3bo_oracles as w
import pm_s3bo_sr_common as sr
import pm_s3bo_ss_common as s

LANE = 'ss'
PF = 'platform.capability_evaluated'
FAMILIES = (PF,)
FIXTURES = w.read_json('Plans/platform_capability_decision_contract_fixtures.json')
DECISION_ROOT = sr.schema_root('Plans/platform_capability_decision_contracts.schema.json', 'decision')
REQUEST_ROOT = sr.schema_root('Plans/platform_capability_decision_contracts.schema.json', 'evaluation_request')
READ_ROOT = dict(w.read_json('Plans/platform_capability_decision_read_output.schema.json'), **{'$ref': '#/$defs/read_output'})
PRECEDENCE = ('live_runtime_discovery', 'provider_policy_snapshot', 'static_platform_baseline')
RESULT = {('live_runtime_discovery', 'supports_available'): ('available', 'none'),
          ('live_runtime_discovery', 'supports_degraded'): ('degraded', 'runtime_partial'),
          ('live_runtime_discovery', 'supports_unavailable'): ('unavailable', 'runtime_absent'),
          ('provider_policy_snapshot', 'supports_available'): ('available', 'none'),
          ('provider_policy_snapshot', 'supports_degraded'): ('degraded', 'provider_policy_limited'),
          ('provider_policy_snapshot', 'supports_unavailable'): ('unavailable', 'provider_policy_denied'),
          ('static_platform_baseline', 'supports_available'): ('available', 'none'),
          ('static_platform_baseline', 'supports_degraded'): ('degraded', 'static_baseline_only'),
          ('static_platform_baseline', 'supports_unavailable'): ('unavailable', 'platform_unsupported')}
CONSUMER = 'platform.capability_run_context.consume.v1@1.0.0'
RETIRED_SOURCE_OWNERS = ('platform_specs',)  # CAP-NEG-011: retired platform_specs is no registered owner mapping
V1_ROOT = w.read_json('Plans/event_payload_platform_capability_evaluated.schema.json')['$defs']['platform_capability_evaluated_1_0_0_compatibility_reader']
MIGRATION = 'MIG-PLATFORM-CAPABILITY-EVALUATED-PAYLOAD-001@1.0.0'

ROWS = [
    ('ss_pf_outcome', 'ss_platform', 'equal', 'Each evaluation commits or refuses exactly as N2-157 and SP-290 decide over the authenticated original inputs.'),
    ('ss_pf_decision', 'ss_platform', 'equal', 'The decision follows source precedence, the closed state and reason products and the not_requested result exactly.'),
    ('ss_pf_ref', 'ss_platform', 'equal', 'The payload subject is the original request subject and the frozen active catalog revision and entry.'),
    ('ss_pf_identity', 'ss_platform', 'equal', 'event_id, idempotency_key, physical key and request and frozen-input digests follow SP-290 exactly.'),
    ('ss_pf_envelope', 'ss_platform', 'equal', 'The frozen producer input is the original request and context projection with Storage fields absent.'),
    ('ss_pf_row', 'ss_platform', 'equal', 'The decision row joins request, catalog selection, minimal source facts, frozen input, Storage assignments and the first receipt.'),
    ('ss_pf_retry', 'ss_platform', 'equal', 'A committed retry returns the exact original receipt without authority; a changed request conflicts; deleted custody stays unavailable.'),
    ('ss_pf_read', 'ss_platform', 'equal', 'The passive read returns the retained decision with the complete current marker and live token, or one closed unavailable reason.'),
    ('ss_pf_context', 'ss_platform_custody', 'equal', 'The run-context consumer joins every original owner fact, returns the committed decision and unchanged snapshot, and refuses aggregate use.'),
    ('ss_pf_legacy', 'ss_platform_custody', 'equal', 'A v1 payload is never converted without provable owner derivation: it quarantines with its exact reason, bytes kept, no event or checkpoint.'),
    ('ss_pf_schema', 'ss_platform_custody', 'error', 'Every decision row, request and read output keeps every keyword of its closed owner schema.'),
    ('ss_pf_time', 'ss_platform_custody', 'error', 'First-receipt acknowledgements use the EventRecord date_time profile (E5-2).'),
]


def fixture(case_id):
    return copy.deepcopy(next(x['value'] for x in FIXTURES['value_shape_cases'] if x['id'] == case_id))


def rjson_sha(value):
    return hashlib.sha256(s.canonical_json(value, signed=True)).hexdigest()


def partition_of(scope):
    return w.partition(scope['project_id'])


def ids(request):
    part = partition_of(request['context']['scope'])
    digest = rjson_sha({'domain': 'pm.platform.evaluation.identity.v1', 'storage_instance_id': request['storage_instance_id'],
                        'scope_partition': part, 'evaluation_id': request['evaluation_id']})
    return {'event_id': 'platform-evaluation:v1:' + digest, 'idempotency_key': 'platform-evaluation:v1:' + digest,
            'physical_key': 'platform_capability_decision.v1:' + request['storage_instance_id'] + ':' + part + ':'
                            + hashlib.sha256(request['evaluation_id'].encode()).hexdigest()}


def request_projection(request):
    ctx = request['context']; scope = ctx['scope']
    return {'schema_id': 'pm.event.v0', 'schema_version': '2.0.0', 'scope_kind': scope['kind'], 'event_type': PF,
            'project_id': scope['project_id'], 'thread_id': ctx['thread_id'], 'run_id': ctx['run_ref'], 'node_id': None,
            'attempt_id': None, 'actor_ref': request['actor_ref'], 'requested_account_ref': None, 'effective_account_ref': None,
            'occurred_at_utc': request['occurred_at_utc'], 'producer_sequence_id': request['producer_sequence_id'],
            'correlation_id': request['correlation_id'], 'causation_event_id': None, 'parent_event_id': None,
            'payload_schema_id': w.FAMILY[PF]['payload_schema_id'], 'payload_ref': None}


ENVELOPE = ('schema_id', 'schema_version', 'scope_kind', 'event_type', 'project_id', 'thread_id', 'run_id', 'node_id', 'attempt_id',
            'actor_ref', 'requested_account_ref', 'effective_account_ref', 'occurred_at_utc', 'producer_sequence_id', 'correlation_id',
            'causation_event_id', 'parent_event_id', 'payload_schema_id', 'payload_ref')


# ---------------------------------------------------------------- owner model (checker side)
def fact_valid(fact, request, entry):
    ev = fact['evidence']
    return (ev['source_kind'] in entry['allowed_evidence_sources'] and fact['subject'] == request['subject']
            and fact['source_owner_ref'] not in RETIRED_SOURCE_OWNERS
            and fact['checks'] == {'verified': True, 'fresh': True, 'complete_enumeration': True, 'no_secrets': True}
            and bool(ev.get('source_revision_ref')) and s.instant_le(ev['observed_at_utc'], request['occurred_at_utc']))


def evaluate(ss, run):
    """N2-157 decision over the run's independent inputs: ('committed', decision) or ('refused:<reason>', None)."""
    request = run['request']; catalog = run.get('catalog', ss['catalog']); ref = request['subject']['capability_ref']
    if not run.get('capture_open', True):
        return 'refused:capture_closed', None
    entry = catalog['entries'].get(ref.get('capability_id'))
    if catalog['state'] != 'active' or entry is None or entry['entry_state'] != 'active' or ref != {
            'ref_type': 'platform_capability_catalog_entry', 'catalog_id': 'pm.platform_capability_catalog',
            'catalog_schema_version': '1.0.0', 'catalog_revision': catalog['revision'], 'capability_id': ref.get('capability_id')} \
            or request['subject']['execution_class'] not in entry['execution_classes']:
        return 'refused:catalog_ref', None
    if request['context'] != run['authenticated_context'] or request['subject']['scope'] != request['context']['scope']:
        return 'refused:context', None
    base = {'schema_version': '2.0.0', 'platform_id': request['subject']['platform_id'], 'provider_id': request['subject']['provider_id'],
            'capability_ref': copy.deepcopy(ref), 'requested_state': request['requested_state']}
    if request['requested_state'] == 'not_requested':
        return 'committed', dict(base, effective_state='not_evaluated', degradation_reason='none', resolution_source=None,
                                 selected_evidence_ref=None, evidence_refs=[])
    facts = run['sources']
    if any(not fact_valid(f, request, entry) for f in facts):
        return 'refused:source_fact', None
    kinds = [f['evidence']['source_kind'] for f in facts]
    if len(kinds) != len(set(kinds)):
        return 'refused:duplicate_source', None
    if not facts:
        return 'refused:evidence_required', None
    ordered = sorted(facts, key=lambda f: PRECEDENCE.index(f['evidence']['source_kind']))
    chosen = ordered[0]['evidence']
    state, reason = RESULT[(chosen['source_kind'], chosen['finding'])]
    return 'committed', dict(base, effective_state=state, degradation_reason=reason, resolution_source=chosen['source_kind'],
                             selected_evidence_ref=chosen['evidence_ref'], evidence_refs=[copy.deepcopy(f['evidence']) for f in ordered])


def expected_row(ss, run, decision, receipt, stored=None):
    request = run['request']; ident = ids(request)
    frozen = dict(request_projection(request), event_id=ident['event_id'], idempotency_key=ident['idempotency_key'], payload=decision,
                  redaction_profile='no_secrets', replay_policy='dedupe_by_idempotency_key',
                  migration={k: None for k in ('migrated_from_schema_id', 'migrated_from_schema_version', 'migration_id', 'compatibility_event_type')})
    facts = sorted([f for f in run['sources'] if request['requested_state'] != 'not_requested'],
                   key=lambda f: PRECEDENCE.index(f['evidence']['source_kind']))
    return {'schema_id': 'pm.storage_value.platform_capability_decision.v1', 'schema_version': '1.0.0',
            'storage_instance_id': request['storage_instance_id'], 'physical_key': ident['physical_key'], 'state': 'committed',
            'request': copy.deepcopy(request), 'request_sha256': rjson_sha(request),
            'catalog_selection': {'catalog_id': 'pm.platform_capability_catalog', 'catalog_schema_version': '1.0.0',
                                  'catalog_revision': run.get('catalog', ss['catalog'])['revision'],
                                  'catalog_revision_sha256': run.get('catalog', ss['catalog'])['sha256'],
                                  'selected_entry': copy.deepcopy(run.get('catalog', ss['catalog'])['entries'][request['subject']['capability_ref']['capability_id']])},
            'source_decisions': [{k: copy.deepcopy(v) for k, v in f.items() if k != 'checks'} for f in facts],
            'frozen_producer_input': frozen, 'frozen_input_sha256': rjson_sha(frozen),
            # Storage's three original assignments join the stored event's own fields and the receipt's sequence.
            'original_storage_fields': {'sequence_id': receipt['sequence_id'], 'observed_at_utc': (stored or {}).get('observed_at_utc'),
                                        'persisted_at_utc': (stored or {}).get('persisted_at_utc')},
            'append_receipt': copy.deepcopy(receipt)}


def expected_read(ss, run):
    read = run['read']; req = read['request']; row = ss['store'].get(read['row_key'])
    unavailable = lambda reason: {'schema_id': 'pm.storage.platform_capability_decision.read_output.v1', 'schema_version': '1.0.0',
                                  'status': 'unavailable', 'reason': reason, 'action_authority': 'none'}
    if row is None or row['request']['evaluation_id'] != req['evaluation_id'] or row['request']['context']['scope'] != req['scope'] \
            or row['frozen_producer_input']['event_id'] != req['event_id'] or req['storage_instance_id'] != row['storage_instance_id']:
        return unavailable('decision_missing')
    source = read['source']
    for flag, reason in (('permission', 'permission_denied'), ('decision_verified', 'decision_unverified'),
                         ('event_and_full_value', 'event_unverified'), ('receipt_joined', 'receipt_unverified'),
                         ('coverage_complete', 'source_incomplete')):
        if not source[flag]:
            return unavailable(reason)
    if read['token'] != dict(read['durable_token'], redb_snapshot_id=source['snapshot']):
        return unavailable('stale_source')
    return {'schema_id': 'pm.storage.platform_capability_decision.read_output.v1', 'schema_version': '1.0.0', 'status': 'read_through',
            'decision': copy.deepcopy(row),
            'read_through_marker': {'storage_instance_id': row['storage_instance_id'], 'event_id': row['frozen_producer_input']['event_id'],
                                    'sequence_id': row['original_storage_fields']['sequence_id'],
                                    'source_cursor_sequence_id': source['cursor_sequence_id'], 'coverage_complete': True,
                                    'read_token': copy.deepcopy(read['token'])},
            'action_authority': 'none'}


def expected_context(ss, run):
    con = run['consume']; row = ss['store'].get(con['row_key']); snap = con['runtime_snapshot']
    if con.get('aggregate_coverage'):
        return {'status': 'unavailable', 'reason': 'aggregate_requirement_set_absent'}
    if row is None or row['state'] != 'committed':
        return {'status': 'refused', 'join': 'decision'}
    req = row['request']; ctx = req['context']
    joins = [('storage_instance', snap['storage_instance_id'] == req['storage_instance_id']),
             ('scope', snap['project_id'] == ctx['scope']['project_id'] and ctx['scope']['kind'] == 'project'),
             ('request_context', con['original_evaluation_request'] == req),
             ('run', snap['run_id'] == con['owner_run_ref_resolution'].get(ctx['run_ref'])),
             ('thread', snap['thread_id'] == ctx['thread_id']),
             ('subject', (snap['effective_platform'], snap['execution_class']) == (req['subject']['platform_id'], req['subject']['execution_class'])),
             ('evaluation', con['read_request']['evaluation_id'] == req['evaluation_id'] and con['read_request']['event_id'] == row['frozen_producer_input']['event_id'])]
    for name, ok in joins:
        if not ok:
            return {'status': 'refused', 'join': name}
    return {'status': 'joined', 'result': {'consumer_binding': CONSUMER, 'runtime_snapshot_ref': snap['snapshot_ref'],
                                           'decision': copy.deepcopy(row), 'action_authority': 'none', 'checkpoint_disposition': 'none_required'}}


def expected_legacy(run):
    """MIG-PLATFORM-CAPABILITY-EVALUATED-PAYLOAD-001: unprovable conversion quarantines without checkpoint advance."""
    v1 = run['legacy']['v1']; reason = None
    if w.schema_errors(V1_ROOT, v1):
        reason = 'shape'
    elif 'requested_capability' not in v1:
        reason = 'absent_requested'
    elif sum(v1['capability_key'] in e['legacy_capability_key_aliases'] for e in run['legacy']['catalog_entries'].values()) != 1:
        reason = 'unknown_alias'
    elif run['legacy'].get('typed_sidecar') is None:
        reason = 'raw_evidence_without_sidecar'
    elif v1.get('project_id') != run['legacy']['outer_project_id']:
        reason = 'identity_disagreement'
    else:
        # No owner contract defines the typed evidence sidecar, and no v1 platform payload can predate the
        # first release; the conversion is unprovable by construction.
        reason = 'no_admissible_sidecar_contract'
    return {'outcome': 'quarantined:' + reason, 'migration': MIGRATION, 'events_appended': 0, 'checkpoint_advanced': False,
            'v1_sha256_after': w.sha(s.canonical_json(v1, signed=True))}


def operands(case, put, common):
    ss = case.get('ss')
    if not isinstance(ss, dict) or not isinstance(ss.get('runs'), list):
        put('ss_pf_outcome', ['boundary record missing'], [])
        return
    put = s.typed_put(put)
    times = [(('custody', k), r.get('acknowledged_at_utc')) for k, r in sorted(ss['custody'].items())]
    for n, run in enumerate(ss['runs']):
        resp = run.get('response') or {}
        if isinstance(resp.get('append_receipt'), dict):
            times.append((('runs', n, 'response'), resp['append_receipt'].get('acknowledged_at_utc')))
    time_errors = s.time_errors(times, w.EVENT_RECORD)
    custody_times = [(('store', k, field), row.get(field)) for k, row in sorted(ss['store'].items()) for field in ('committed_at_utc',)]
    custody_times += [(('store', k, 'original_storage_fields', field), (row.get('original_storage_fields') or {}).get(field))
                      for k, row in sorted(ss['store'].items()) for field in ('observed_at_utc', 'persisted_at_utc')]
    time_errors += s.time_errors(custody_times, w.STORAGE_UTC_Z)
    put('ss_pf_time', time_errors)
    if time_errors:
        return  # shared date-time owns every timestamp before the closed schemas (their format and Z patterns) are read
    schema = [['row', k] + e for k, row in sorted(ss['store'].items()) for e in sr.keyword_errors(DECISION_ROOT, row)]
    for n, run in enumerate(ss['runs']):
        if run['kind'] == 'evaluate':
            schema += [['request', n] + e for e in sr.keyword_errors(REQUEST_ROOT, run['request'])]
        if run['kind'] == 'read' and isinstance(run.get('read_output'), dict):
            schema += [['read', n] + e for e in sr.keyword_errors(READ_ROOT, run['read_output'])]
    put('ss_pf_schema', schema)
    if time_errors or schema:
        return
    evals = [n for n, r in enumerate(ss['runs']) if r['kind'] == 'evaluate']
    outcomes = {n: evaluate(ss, ss['runs'][n]) for n in evals}
    put('ss_pf_outcome', [ss['runs'][n].get('outcome') for n in evals], [outcomes[n][0] for n in evals])
    dec_l = []; dec_r = []; ref_l = []; ref_r = []; id_l = []; id_r = []; env_l = []; env_r = []; row_l = []; row_r = []
    for n in evals:
        run = ss['runs'][n]; outcome, decision = outcomes[n]
        if outcome != 'committed' or run.get('outcome') != 'committed' or ids(run['request'])['physical_key'] in ss.get('deleted', {}):
            continue  # a lawfully deleted row (DL-048) is judged by the retry and read paths, never reconstructed
        request = run['request']; ident = ids(request); row = ss['store'].get(ident['physical_key']) or {}
        frozen = row.get('frozen_producer_input') or {}; payload = frozen.get('payload') or {}
        dec_l.append({k: payload.get(k) for k in ('requested_state', 'effective_state', 'degradation_reason', 'resolution_source',
                                                   'selected_evidence_ref', 'evidence_refs')})
        dec_r.append({k: decision[k] for k in ('requested_state', 'effective_state', 'degradation_reason', 'resolution_source',
                                                'selected_evidence_ref', 'evidence_refs')})
        ref_l.append([payload.get('schema_version'), payload.get('platform_id'), payload.get('provider_id'), payload.get('capability_ref'),
                      'project_id' in payload])
        ref_r.append(['2.0.0', decision['platform_id'], decision['provider_id'], decision['capability_ref'], False])
        id_l.append([frozen.get('event_id'), frozen.get('idempotency_key'), row.get('physical_key'), row.get('request_sha256'),
                     row.get('frozen_input_sha256')])
        id_r.append([ident['event_id'], ident['idempotency_key'], ident['physical_key'], rjson_sha(request), rjson_sha(frozen)])
        env = request_projection(request)
        env_l.append([frozen.get(k) for k in ENVELOPE] + [k in frozen for k in ('sequence_id', 'observed_at_utc', 'persisted_at_utc')])
        env_r.append([env[k] for k in ENVELOPE] + [False, False, False])
        receipt = ss['custody'].get(frozen.get('event_id'))
        want = expected_row(ss, run, payload, receipt, ss['events'].get(frozen.get('event_id'))) if receipt else None
        keep = ('state', 'request', 'catalog_selection', 'source_decisions', 'original_storage_fields', 'append_receipt',
                'storage_instance_id', 'schema_id', 'schema_version')
        row_l.append([{k: row.get(k) for k in keep}, ss['events'].get(frozen.get('event_id'))])
        assigned = ss['events'].get(frozen.get('event_id')) or {}
        stored = dict(frozen, sequence_id=receipt['sequence_id'], observed_at_utc=assigned.get('observed_at_utc'),
                      persisted_at_utc=assigned.get('persisted_at_utc')) if receipt else None
        row_r.append([{k: want[k] for k in keep} if want else None, stored])
    put('ss_pf_decision', dec_l, dec_r)
    put('ss_pf_ref', ref_l, ref_r)
    put('ss_pf_identity', id_l, id_r)
    put('ss_pf_envelope', env_l, env_r)
    put('ss_pf_row', row_l, row_r)
    retries = [n for n, r in enumerate(ss['runs']) if r['kind'] == 'retry']
    left = []; right = []
    for n in retries:
        run = ss['runs'][n]; key = ids(run['request'])['physical_key']; row = ss['store'].get(key)
        if row is None:
            want = {'status': 'unavailable', 'reason': 'decision_missing'}
        elif row['request'] != run['request']:
            want = {'status': 'refused', 'reason': 'idempotency_conflict'}
        else:
            want = {'status': 'committed_receipt', 'append_receipt': ss['custody'][row['frozen_producer_input']['event_id']],
                    'action_authority': 'none', 'read_through': None}
        left.append(run.get('response')); right.append(want)
    put('ss_pf_retry', left, right)
    reads = [n for n, r in enumerate(ss['runs']) if r['kind'] == 'read']
    put('ss_pf_read', [ss['runs'][n].get('read_output') for n in reads], [expected_read(ss, ss['runs'][n]) for n in reads])
    legacy = [n for n, r in enumerate(ss['runs']) if r['kind'] == 'legacy']
    put('ss_pf_legacy', [ss['runs'][n].get('result') for n in legacy], [expected_legacy(ss['runs'][n]) for n in legacy])
    consumes = [n for n, r in enumerate(ss['runs']) if r['kind'] == 'consume']
    put('ss_pf_context', [ss['runs'][n].get('result') for n in consumes], [expected_context(ss, ss['runs'][n]) for n in consumes])


# ---------------------------------------------------------------- fixture constructor (never called by the checker)
def catalog():
    row = fixture('project_direct_terminal_row')
    entry = row['catalog_selection']['selected_entry']
    return {'revision': 1, 'state': 'active', 'sha256': row['catalog_selection']['catalog_revision_sha256'],
            'entries': {entry['capability_id']: entry}}


CHECKS = {'verified': True, 'fresh': True, 'complete_enumeration': True, 'no_secrets': True}


def facts(row_id='project_direct_terminal_row', findings=None, kinds=PRECEDENCE):
    row = fixture(row_id); out = []
    for f in row['source_decisions']:
        if f['evidence']['source_kind'] not in kinds:
            continue
        f = copy.deepcopy(f); f['checks'] = dict(CHECKS)
        if findings and f['evidence']['source_kind'] in findings:
            f['evidence']['finding'] = findings[f['evidence']['source_kind']]
        out.append(f)
    return out


def authored(request, effective, reason, source, chosen, refs):
    return {'schema_version': '2.0.0', 'platform_id': request['subject']['platform_id'], 'provider_id': request['subject']['provider_id'],
            'capability_ref': copy.deepcopy(request['subject']['capability_ref']), 'requested_state': request['requested_state'],
            'effective_state': effective, 'degradation_reason': reason, 'resolution_source': source, 'selected_evidence_ref': chosen,
            'evidence_refs': copy.deepcopy(refs)}


def simulate(case, spec):
    """Presented runs from AUTHORED outcomes and decisions (never from evaluate())."""
    ss = case['ss']; run = copy.deepcopy(spec); want = run.pop('want', None); decision = run.pop('decision', None)
    kind = run['kind']
    if kind == 'evaluate':
        run['outcome'] = want
        if want == 'committed':
            request = run['request']; ident = ids(request); seq = run.get('sequence', 41)
            event = dict(request_projection(request), event_id=ident['event_id'], idempotency_key=ident['idempotency_key'], payload=decision,
                         redaction_profile='no_secrets', replay_policy='dedupe_by_idempotency_key',
                         migration={k: None for k in ('migrated_from_schema_id', 'migrated_from_schema_version', 'migration_id', 'compatibility_event_type')})
            stored = dict(event, sequence_id=seq, observed_at_utc='2026-09-11T22:00:0' + str(seq % 10) + 'Z',
                          persisted_at_utc='2026-09-11T22:00:0' + str(seq % 10) + 'Z')
            receipt = s.receipt_for(stored, offset=seq * 1024, time=stored['observed_at_utc'])
            ss['custody'][ident['event_id']] = receipt; ss['events'][ident['event_id']] = copy.deepcopy(stored)
            ss['store'][ident['physical_key']] = expected_row_presented(ss, run, event, receipt)
            run['appended'] = [copy.deepcopy(stored)]
        else:
            run['appended'] = []
    elif kind == 'retry':
        run['response'] = copy.deepcopy(want)
    elif kind == 'read':
        run['read_output'] = want(ss, run) if callable(want) else copy.deepcopy(want)
    elif kind in ('consume', 'legacy'):
        run['result'] = want(ss, run) if callable(want) else copy.deepcopy(want)
    ss['runs'].append(run)
    return run


def expected_row_presented(ss, run, event, receipt):
    request = run['request']; ident = ids(request)
    used = sorted([f for f in run['sources'] if request['requested_state'] != 'not_requested'],
                  key=lambda f: PRECEDENCE.index(f['evidence']['source_kind']))
    return {'schema_id': 'pm.storage_value.platform_capability_decision.v1', 'schema_version': '1.0.0',
            'storage_instance_id': request['storage_instance_id'], 'physical_key': ident['physical_key'], 'state': 'committed',
            'request': copy.deepcopy(request), 'request_sha256': rjson_sha(request),
            'catalog_selection': {'catalog_id': 'pm.platform_capability_catalog', 'catalog_schema_version': '1.0.0', 'catalog_revision': 1,
                                  'catalog_revision_sha256': ss['catalog']['sha256'],
                                  'selected_entry': copy.deepcopy(ss['catalog']['entries'][request['subject']['capability_ref']['capability_id']])},
            'source_decisions': [{k: copy.deepcopy(v) for k, v in f.items() if k != 'checks'} for f in used],
            'frozen_producer_input': copy.deepcopy(event), 'frozen_input_sha256': rjson_sha(event),
            'original_storage_fields': {'sequence_id': receipt['sequence_id'], 'observed_at_utc': receipt['acknowledged_at_utc'],
                                        'persisted_at_utc': receipt['acknowledged_at_utc']},
            'append_receipt': copy.deepcopy(receipt), 'committed_at_utc': receipt['acknowledged_at_utc']}


def request(scope='project', requested='required', evaluation='fixture:evaluation-1'):
    r = fixture('project_direct_request' if scope == 'project' else 'application_direct_request')
    r.update(requested_state=requested, evaluation_id=evaluation)
    r['context']['original_request_id'] = 'fixture:request-' + evaluation
    return r


def evaluate_spec(req, want, decision=None, sources=None, **extra):
    spec = {'kind': 'evaluate', 'want': want, 'request': req, 'authenticated_context': copy.deepcopy(req['context']),
            'sources': facts() if sources is None else sources, 'decision': decision}
    spec.update(extra)
    return spec


def read_through(ss, run):
    row = ss['store'][run['read']['row_key']]
    return {'schema_id': 'pm.storage.platform_capability_decision.read_output.v1', 'schema_version': '1.0.0', 'status': 'read_through',
            'decision': copy.deepcopy(row),
            'read_through_marker': {'storage_instance_id': row['storage_instance_id'], 'event_id': row['frozen_producer_input']['event_id'],
                                    'sequence_id': row['original_storage_fields']['sequence_id'],
                                    'source_cursor_sequence_id': run['read']['source']['cursor_sequence_id'], 'coverage_complete': True,
                                    'read_token': copy.deepcopy(run['read']['token'])}, 'action_authority': 'none'}


def unavailable(reason):
    return {'schema_id': 'pm.storage.platform_capability_decision.read_output.v1', 'schema_version': '1.0.0', 'status': 'unavailable',
            'reason': reason, 'action_authority': 'none'}


def read_spec(case, req, want, source=None, **extra):
    ident = ids(req); durable = copy.deepcopy(case['token'])
    spec = {'kind': 'read', 'want': want, 'read': {
        'request': {'storage_instance_id': w.STORE, 'scope': copy.deepcopy(req['context']['scope']), 'evaluation_id': req['evaluation_id'],
                    'event_id': ident['event_id']}, 'row_key': ident['physical_key'], 'durable_token': durable,
        'token': dict(durable, redb_snapshot_id='snapshot-read-1'),
        'source': dict({'permission': True, 'decision_verified': True, 'event_and_full_value': True, 'receipt_joined': True,
                        'coverage_complete': True, 'snapshot': 'snapshot-read-1', 'cursor_sequence_id': 57}, **(source or {}))}}
    spec['read'].update(extra)
    return spec


def joined(ss, run):
    row = ss['store'][run['consume']['row_key']]
    return {'status': 'joined', 'result': {'consumer_binding': CONSUMER, 'runtime_snapshot_ref': run['consume']['runtime_snapshot']['snapshot_ref'],
                                           'decision': copy.deepcopy(row), 'action_authority': 'none', 'checkpoint_disposition': 'none_required'}}


def consume_spec(req, want, snapshot=None, **extra):
    ident = ids(req); ctx = req['context']
    snap = dict({'storage_instance_id': w.STORE, 'project_id': ctx['scope']['project_id'], 'run_id': 'run-runtime-1', 'thread_id': ctx['thread_id'],
                 'effective_platform': req['subject']['platform_id'], 'execution_class': req['subject']['execution_class'],
                 'snapshot_ref': 'requested_effective_runtime.v1:' + w.partition(ctx['scope']['project_id']) + ':run-runtime-1:' + 'd' * 64},
                **(snapshot or {}))
    spec = {'kind': 'consume', 'want': want, 'consume': dict({
        'row_key': ident['physical_key'], 'runtime_snapshot': snap, 'original_evaluation_request': copy.deepcopy(req),
        'owner_run_ref_resolution': {ctx['run_ref']: 'run-runtime-1'},
        'read_request': {'storage_instance_id': w.STORE, 'scope': copy.deepcopy(ctx['scope']), 'evaluation_id': req['evaluation_id'],
                         'event_id': ident['event_id']}}, **extra)}
    return spec


def base(case):
    case['ss'] = {'family': PF, 'catalog': catalog(), 'runs': [], 'store': {}, 'custody': {}, 'events': {}}
    return case


def main_decision(req):
    refs = [f['evidence'] for f in facts()]
    return authored(req, 'available', 'none', 'live_runtime_discovery', 'fixture:runtime_probe_receipt', refs)


def augment(control):
    base(control); req = request()
    simulate(control, evaluate_spec(req, 'committed', main_decision(req)))
    simulate(control, {'kind': 'retry', 'request': copy.deepcopy(req), 'want': {
        'status': 'committed_receipt', 'append_receipt': copy.deepcopy(control['ss']['custody'][ids(req)['event_id']]),
        'action_authority': 'none', 'read_through': None}})
    simulate(control, read_spec(control, req, read_through))
    simulate(control, consume_spec(req, joined))


def cases():
    import pm_s3bo_cases as c
    controls = []; negatives = []
    main = s.control(PF, 'main', w.build(PF)); controls.append(main)
    req = request(); ident = ids(req); ss = main['value']['ss']
    R = lambda n, *path: ('ss', 'runs', n) + path
    ROW = ('ss', 'store', ident['physical_key'])
    for row, path, replacement, label in [
            ('ss_pf_outcome', R(0, 'outcome'), 'refused:evidence_required', 'valid-evaluation-refused'),
            ('ss_pf_retry', R(1, 'response', 'action_authority'), 'dispatch', 'retry-grants-authority'),
            ('ss_pf_retry', R(1, 'response', 'read_through'), {'coverage_complete': True}, 'retry-claims-read-through'),
            ('ss_pf_retry', R(1, 'response', 'append_receipt', 'sequence_id'), 99, 'retry-other-receipt'),
            ('ss_pf_read', R(2, 'read_output', 'read_through_marker', 'source_cursor_sequence_id'), 41, 'marker-stale-cursor'),
            ('ss_pf_read', R(2, 'read_output', 'read_through_marker', 'read_token', 'redb_snapshot_id'), 'snapshot-A', 'marker-stored-snapshot'),
            ('ss_pf_read', R(2, 'read_output', 'read_through_marker', 'event_id'), 'platform-evaluation:v1:' + 'e' * 64, 'marker-other-event'),
            ('ss_pf_context', R(3, 'result', 'result', 'runtime_snapshot_ref'), 'requested_effective_runtime.v1:project~Zml4dHVyZTpwcm9qZWN0:run-runtime-2:' + 'e' * 64, 'snapshot-substituted'),
            ('ss_pf_context', R(3, 'result', 'status'), 'refused', 'valid-context-refused'),
            ('ss_pf_schema', ROW + ('extra',), 'raw-probe-body', 'row-extra-member'),
            ('ss_pf_schema', ROW + ('state',), 'settled', 'row-unknown-state'),
            ('ss_pf_schema', R(2, 'read_output', 'action_authority'), 'dispatch', 'read-output-authority'),
            ('ss_pf_time', ('ss', 'custody', ident['event_id'], 'acknowledged_at_utc'), '2026-02-30T00:00:00Z', 'receipt-impossible-day')]:
        negatives.append(c.mutate(main, row, path, replacement, label))
    single = s.control(PF, 'single', copy.deepcopy(main['value'])); single['value']['ss']['runs'] = single['value']['ss']['runs'][:2]
    controls.append(single)
    for row, path, replacement, label in [
            ('ss_pf_row', ROW + ('original_storage_fields', 'sequence_id'), 40, 'row-other-assignment'),
            ('ss_pf_row', ROW + ('source_decisions',), [], 'row-drops-source-facts'),
            ('ss_pf_row', ROW + ('catalog_selection', 'catalog_revision_sha256'), 'f' * 64, 'row-other-catalog-hash'),
            ('ss_pf_row', ('ss', 'events', ident['event_id'], 'correlation_id'), 'fixture:other', 'stored-event-differs'),
            ('ss_pf_identity', ROW + ('request_sha256',), 'f' * 64, 'request-hash-not-rjson'),
            ('ss_pf_identity', ROW + ('frozen_input_sha256',), 'f' * 64, 'frozen-hash-not-rjson'),
            ]:
        negatives.append(c.mutate(single, row, path, replacement, label))
    # Presented-frozen-input defects: the row hash, stored event and read follow the presented input.
    for row, edit, label in [
            ('ss_pf_decision', lambda e: e['payload'].update(effective_state='degraded', degradation_reason='runtime_partial'), 'lower-precedence-wins'),
            ('ss_pf_decision', lambda e: e['payload']['evidence_refs'].reverse(), 'evidence-not-precedence-order'),
            ('ss_pf_decision', lambda e: e['payload'].update(selected_evidence_ref='fixture:provider_policy_snapshot'), 'selected-ref-other-source'),
            ('ss_pf_ref', lambda e: e['payload'].update(platform_id='fixture:other-platform'), 'payload-other-platform'),
            ('ss_pf_ref', lambda e: e['payload'].update(provider_id='fixture:provider-x'), 'payload-other-provider'),
            ('ss_pf_envelope', lambda e: e.update(run_id='fixture:other-run'), 'envelope-other-run'),
            ('ss_pf_envelope', lambda e: e.update(actor_ref='fixture:caller'), 'envelope-caller-actor'),
            ('ss_pf_identity', lambda e: e.update(event_id='platform-evaluation:v1:' + 'c' * 64, idempotency_key='platform-evaluation:v1:' + 'c' * 64), 'event-id-not-identity-hash')]:
        negatives.append(c.negative(main, row, label, rebind(copy.deepcopy(main['value']), edit), {'frozen_input': label, 'copies': 'rebound'}))
    # CAP-POS branches (authored decisions) through the complete boundary.
    for label, scope, findings, kinds, want_decision in [
            ('cap-pos-002-live-precedence', 'project', {'live_runtime_discovery': 'supports_available', 'provider_policy_snapshot': 'supports_unavailable',
                                                        'static_platform_baseline': 'supports_unavailable'}, PRECEDENCE,
             ('available', 'none', 'live_runtime_discovery', 'fixture:runtime_probe_receipt')),
            ('cap-pos-003-provider-fallback', 'project', {'provider_policy_snapshot': 'supports_degraded'}, PRECEDENCE[1:],
             ('degraded', 'provider_policy_limited', 'provider_policy_snapshot', 'fixture:provider_policy_snapshot')),
            ('cap-pos-004-static-fallback', 'project', {'static_platform_baseline': 'supports_degraded'}, PRECEDENCE[2:],
             ('degraded', 'static_baseline_only', 'static_platform_baseline', 'fixture:platform_baseline_revision')),
            ('cap-pos-005-explicit-negative', 'project', {'live_runtime_discovery': 'supports_unavailable'}, PRECEDENCE,
             ('unavailable', 'runtime_absent', 'live_runtime_discovery', 'fixture:runtime_probe_receipt')),
            ('live-degraded', 'project', {'live_runtime_discovery': 'supports_degraded'}, PRECEDENCE[:1],
             ('degraded', 'runtime_partial', 'live_runtime_discovery', 'fixture:runtime_probe_receipt')),
            ('provider-denied', 'project', {'provider_policy_snapshot': 'supports_unavailable'}, PRECEDENCE[1:2],
             ('unavailable', 'provider_policy_denied', 'provider_policy_snapshot', 'fixture:provider_policy_snapshot')),
            ('static-unsupported', 'project', {'static_platform_baseline': 'supports_unavailable'}, PRECEDENCE[2:],
             ('unavailable', 'platform_unsupported', 'static_platform_baseline', 'fixture:platform_baseline_revision')),
            ('cap-pos-010-application-scope', 'application', None, PRECEDENCE,
             ('available', 'none', 'live_runtime_discovery', 'fixture:runtime_probe_receipt'))]:
        r = request(scope)
        src = facts('project_direct_terminal_row' if scope == 'project' else 'application_direct_terminal_row', findings, kinds)
        d = authored(r, want_decision[0], want_decision[1], want_decision[2], want_decision[3], [f['evidence'] for f in src])
        value = base(w.build(PF)); simulate(value, evaluate_spec(r, 'committed', d, src))
        control = s.control(PF, label, value); controls.append(control)
        other = ('available', 'none') if want_decision[0] != 'available' else ('degraded', RESULT[(want_decision[2], 'supports_degraded')][1])
        negatives.append(c.negative(control, 'ss_pf_decision', 'misreported-state', rebind(copy.deepcopy(value), lambda e, o=other: e['payload'].update(
            effective_state=o[0], degradation_reason=o[1])), {'decision': 'schema-valid but wrong state/reason product'}))
    # CAP-POS-006 not requested: no evidence consulted, canonical null result.
    r = request(requested='not_requested', evaluation='fixture:evaluation-not-requested')
    value = base(w.build(PF)); simulate(value, evaluate_spec(r, 'committed', authored(r, 'not_evaluated', 'none', None, None, []), facts()))
    control = s.control(PF, 'cap-pos-006-not-requested', value); controls.append(control)
    negatives.append(c.negative(control, 'ss_pf_decision', 'not-requested-carries-evidence', rebind(copy.deepcopy(value), lambda e: e['payload'].update(
        evidence_refs=[f['evidence'] for f in facts()][:1])), {'decision': 'evidence on not_requested'}))
    # CAP-POS-007 deterministic bytes: two evaluations of byte-identical inputs (distinct evaluation ids) commit identical decisions.
    r1 = request(evaluation='fixture:evaluation-a'); r2 = request(evaluation='fixture:evaluation-b')
    value = base(w.build(PF)); simulate(value, evaluate_spec(r1, 'committed', main_decision(r1))); simulate(value, evaluate_spec(r2, 'committed', main_decision(r2), sequence=42))
    control = s.control(PF, 'cap-pos-007-deterministic', value); controls.append(control)
    negatives.append(c.negative(control, 'ss_pf_decision', 'nondeterministic-order', rebind(copy.deepcopy(value), lambda e: e['payload']['evidence_refs'].reverse(), key=ids(r2)['physical_key']), {'decision': 'second evaluation reorders evidence'}))
    # CAP-NEG refusals over independent inputs.
    neg = []
    r = request(); bad_ref = copy.deepcopy(r); bad_ref['subject']['capability_ref']['capability_id'] = 'platform.unknown_capability'
    neg.append(('cap-neg-001-unknown-capability', evaluate_spec(bad_ref, 'refused:catalog_ref', sources=[dict(f, subject=bad_ref['subject']) for f in facts()])))
    stale = copy.deepcopy(r); stale['subject']['capability_ref']['catalog_revision'] = 2
    neg.append(('cap-neg-002-stale-revision', evaluate_spec(stale, 'refused:catalog_ref', sources=[dict(f, subject=stale['subject']) for f in facts()])))
    neg.append(('cap-neg-006-no-evidence', evaluate_spec(request(), 'refused:evidence_required', sources=[])))
    other = facts(); other[1]['subject'] = dict(other[1]['subject'], platform_id='fixture:other-platform')
    neg.append(('cap-neg-007-wrong-subject', evaluate_spec(request(), 'refused:source_fact', sources=other)))
    dup = facts(kinds=PRECEDENCE[:1]) * 2
    neg.append(('cap-neg-010-duplicate-source', evaluate_spec(request(), 'refused:duplicate_source', sources=dup)))
    for flag in ('verified', 'fresh', 'complete_enumeration', 'no_secrets'):
        bad = facts(); bad[0]['checks'][flag] = False
        neg.append(('cap-neg-008-' + flag, evaluate_spec(request(), 'refused:source_fact', sources=bad)))
    late = facts(); late[2]['evidence']['observed_at_utc'] = '2026-09-11T22:00:01Z'
    neg.append(('cap-neg-008-observed-after-occurrence', evaluate_spec(request(), 'refused:source_fact', sources=late)))
    norev = facts(); norev[0]['evidence']['source_revision_ref'] = ''
    neg.append(('cap-neg-008-missing-revision', evaluate_spec(request(), 'refused:source_fact', sources=norev)))
    ctx = request(); spec = evaluate_spec(ctx, 'refused:context'); spec['authenticated_context']['run_ref'] = 'fixture:other-run'
    neg.append(('caller-context-not-authenticated', spec))
    scope = request(); scope['subject']['scope'] = {'kind': 'application', 'project_id': None}
    neg.append(('cap-neg-014-scope-conflict', evaluate_spec(scope, 'refused:context', sources=[dict(f, subject=scope['subject']) for f in facts()])))
    for label, spec in neg:
        value = base(w.build(PF)); simulate(value, spec)
        control = s.control(PF, label, value); controls.append(control)
        negatives.append(c.mutate(control, 'ss_pf_outcome', R(0, 'outcome'), 'committed', label + '-committed'))
    # Production catalog is empty (DL-082): every production evaluation refuses.
    value = base(w.build(PF)); value['ss']['catalog'] = {'revision': 1, 'state': 'active', 'sha256': 'a' * 64, 'entries': {}}
    simulate(value, evaluate_spec(request(), 'refused:catalog_ref'))
    control = s.control(PF, 'production-catalog-empty', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_pf_outcome', R(0, 'outcome'), 'committed', 'empty-catalog-admits'))
    # Capture closure: a fresh evaluation (even not_requested) refuses; the retained exact retry still answers.
    value = copy.deepcopy(main['value']); value['ss']['runs'] = value['ss']['runs'][:2]
    simulate(value, evaluate_spec(request(requested='not_requested', evaluation='fixture:evaluation-after-closure'), 'refused:capture_closed',
                                  sources=[], capture_open=False))
    simulate(value, {'kind': 'retry', 'request': copy.deepcopy(req), 'want': copy.deepcopy(value['ss']['runs'][1]['response'])})
    control = s.control(PF, 'capture-closed', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_pf_outcome', R(2, 'outcome'), 'committed', 'closed-capture-admits'))
    # Changed request conflict; deleted custody unavailable; read and context refusals.
    changed = copy.deepcopy(req); changed['occurred_at_utc'] = '2026-09-11T22:00:05Z'
    value = copy.deepcopy(main['value']); value['ss']['runs'] = value['ss']['runs'][:1]
    simulate(value, {'kind': 'retry', 'request': changed, 'want': {'status': 'refused', 'reason': 'idempotency_conflict'}})
    control = s.control(PF, 'retry-changed-request', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_pf_retry', R(1, 'response'), {'status': 'committed_receipt', 'append_receipt': value['ss']['custody'][ident['event_id']],
                                                                         'action_authority': 'none', 'read_through': None}, 'changed-request-replayed'))
    value = copy.deepcopy(main['value']); value['ss']['runs'] = value['ss']['runs'][:1]; value['ss']['store'] = {}
    value['ss']['deleted'] = {ident['physical_key']: 'dl048_reference_released'}
    simulate(value, {'kind': 'retry', 'request': copy.deepcopy(req), 'want': {'status': 'unavailable', 'reason': 'decision_missing'}})
    control = s.control(PF, 'retry-deleted-row', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_pf_retry', R(1, 'response'), {'status': 'committed_receipt', 'append_receipt': value['ss']['custody'][ident['event_id']],
                                                                         'action_authority': 'none', 'read_through': None}, 'deleted-row-reconstructed'))
    for label, source, reason in [('permission', {'permission': False}, 'permission_denied'),
                                  ('decision', {'decision_verified': False}, 'decision_unverified'),
                                  ('event', {'event_and_full_value': False}, 'event_unverified'),
                                  ('receipt', {'receipt_joined': False}, 'receipt_unverified'),
                                  ('coverage', {'coverage_complete': False}, 'source_incomplete'),
                                  ('stale', {'snapshot': 'snapshot-read-2'}, 'stale_source')]:
        value = copy.deepcopy(main['value']); value['ss']['runs'] = value['ss']['runs'][:1]
        simulate(value, read_spec(value, req, unavailable(reason), source))
        control = s.control(PF, 'read-' + label, value); controls.append(control)
        negatives.append(c.mutate(control, 'ss_pf_read', R(1, 'read_output'), read_through(value['ss'], value['ss']['runs'][1]), label + '-read-through'))
    value = copy.deepcopy(main['value']); value['ss']['runs'] = value['ss']['runs'][:1]
    simulate(value, read_spec(value, request(evaluation='fixture:evaluation-other'), unavailable('decision_missing')))
    control = s.control(PF, 'read-other-evaluation', value); controls.append(control)
    run = value['ss']['runs'][1]
    negatives.append(c.mutate(control, 'ss_pf_read', R(1, 'read_output'), read_through(value['ss'], dict(run, read=dict(run['read'], row_key=ident['physical_key']))),
                              'other-evaluation-read'))
    for label, snapshot, extra, join in [('run', {'run_id': 'run-runtime-2'}, {}, 'run'), ('thread', {'thread_id': 'fixture:other-thread'}, {}, 'thread'),
                                         ('subject', {'execution_class': 'cli_bridged_provider'}, {}, 'subject'),
                                         ('project', {'project_id': 'fixture:other-project'}, {}, 'scope'),
                                         ('instance', {'storage_instance_id': '22222222-2222-4222-8222-222222222222'}, {}, 'storage_instance')]:
        value = copy.deepcopy(main['value']); value['ss']['runs'] = value['ss']['runs'][:1]
        simulate(value, consume_spec(req, {'status': 'refused', 'join': join}, snapshot, **extra))
        control = s.control(PF, 'context-' + label, value); controls.append(control)
        negatives.append(c.mutate(control, 'ss_pf_context', R(1, 'result'), joined(value['ss'], value['ss']['runs'][1]), label + '-joined'))
    value = copy.deepcopy(main['value']); value['ss']['runs'] = value['ss']['runs'][:1]
    simulate(value, consume_spec(req, {'status': 'unavailable', 'reason': 'aggregate_requirement_set_absent'}, aggregate_coverage=True))
    control = s.control(PF, 'context-aggregate', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_pf_context', R(1, 'result'), joined(value['ss'], value['ss']['runs'][1]), 'aggregate-from-one-decision'))
    # CAP-POS-008: after supersession the original decision replays against its own immutable revision, never recomputed.
    value = copy.deepcopy(main['value'])
    for run in value['ss']['runs']:
        if run['kind'] == 'evaluate':
            run['catalog'] = catalog()
    newer = catalog(); newer['revision'] = 2; newer['sha256'] = 'b' * 64
    value['ss']['catalog'] = newer
    simulate(value, evaluate_spec(request(evaluation='fixture:evaluation-after-supersession'), 'refused:catalog_ref'))
    control = s.control(PF, 'cap-pos-008-historical-replay', value); controls.append(control)
    recomputed = copy.deepcopy(value['ss']['runs'][2]['read_output']); recomputed['decision']['catalog_selection']['catalog_revision'] = 2
    negatives.append(c.mutate(control, 'ss_pf_read', R(2, 'read_output'), recomputed, 'replay-recomputed-on-active-revision'))
    negatives.append(c.mutate(control, 'ss_pf_outcome', R(4, 'outcome'), 'committed', 'superseded-revision-new-write'))
    # CAP-NEG-011: evidence imported from the retired platform_specs owner.
    legacy_facts = facts(); legacy_facts[0]['source_owner_ref'] = 'platform_specs'
    value = base(w.build(PF)); simulate(value, evaluate_spec(request(), 'refused:source_fact', sources=legacy_facts))
    control = s.control(PF, 'cap-neg-011-legacy-analogy', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_pf_outcome', R(0, 'outcome'), 'committed', 'legacy-analogy-committed'))
    # CAP-NEG-012 and MIG-PLATFORM-CAPABILITY-EVALUATED-PAYLOAD-001: every v1 input quarantines with its reason.
    entries = {'platform.fixture_prospective_only': dict(catalog()['entries']['platform.fixture_prospective_only'],
                                                         legacy_capability_key_aliases=['fixture_legacy_key'])}
    v1 = {'platform_id': 'fixture:prospective-platform', 'capability_key': 'fixture_legacy_key', 'requested_capability': 'required',
          'effective_capability': 'available', 'evidence_ref': 'fixture:runtime_probe_receipt', 'project_id': 'fixture:project',
          'ts': '2026-09-11T22:00:00Z'}
    for label, change, sidecar, outer in [('shape', {'unknown_field': 'x'}, None, 'fixture:project'),
                                          ('absent-requested', {'requested_capability': None}, None, 'fixture:project'),
                                          ('unknown-alias', {'capability_key': 'unregistered_key'}, None, 'fixture:project'),
                                          ('raw-evidence', {}, None, 'fixture:project'),
                                          ('identity-disagreement', {}, {'evidence_refs': []}, 'fixture:other-project'),
                                          ('alias-without-sidecar-contract', {}, {'evidence_refs': []}, 'fixture:project')]:
        legacy_v1 = dict(v1, **{k: v for k, v in change.items() if v is not None})
        if change.get('requested_capability', 1) is None:
            legacy_v1.pop('requested_capability')
        spec = {'kind': 'legacy', 'legacy': {'v1': legacy_v1, 'catalog_entries': copy.deepcopy(entries), 'typed_sidecar': sidecar,
                                             'outer_project_id': outer}}
        spec['want'] = expected_legacy_presented(spec)
        value = base(w.build(PF)); simulate(value, spec)
        control = s.control(PF, 'cap-neg-012-' + label, value); controls.append(control)
        converted = {'outcome': 'converted', 'migration': MIGRATION, 'events_appended': 0, 'checkpoint_advanced': False,
                     'v1_sha256_after': value['ss']['runs'][0]['result']['v1_sha256_after']}
        negatives.append(c.mutate(control, 'ss_pf_legacy', R(0, 'result'), converted, label + '-converted'))
    negatives.append(c.mutate(control, 'ss_pf_legacy', R(0, 'result', 'checkpoint_advanced'), True, 'quarantine-advances-checkpoint'))
    negatives.append(c.mutate(control, 'ss_pf_legacy', R(0, 'result', 'v1_sha256_after'), 'f' * 64, 'v1-bytes-rewritten'))
    return controls, negatives


REASONS = {'shape': 'shape', 'absent-requested': 'absent_requested', 'unknown-alias': 'unknown_alias', 'raw-evidence': 'raw_evidence_without_sidecar',
           'identity-disagreement': 'identity_disagreement', 'alias-without-sidecar-contract': 'no_admissible_sidecar_contract'}


def expected_legacy_presented(spec):
    """Fixture constructor: the authored quarantine reason of each v1 case (by construction of its single defect)."""
    l = spec['legacy']; v1 = l['v1']
    if 'unknown_field' in v1:
        reason = 'shape'
    elif 'requested_capability' not in v1:
        reason = 'absent_requested'
    elif v1['capability_key'] == 'unregistered_key':
        reason = 'unknown_alias'
    elif l['typed_sidecar'] is None:
        reason = 'raw_evidence_without_sidecar'
    elif l['outer_project_id'] != v1['project_id']:
        reason = 'identity_disagreement'
    else:
        reason = 'no_admissible_sidecar_contract'
    return {'outcome': 'quarantined:' + reason, 'migration': MIGRATION, 'events_appended': 0, 'checkpoint_advanced': False,
            'v1_sha256_after': w.sha(s.canonical_json(v1, signed=True))}


def rebind(value, edit, key=None):
    """One frozen-producer-input defect; the row hash, stored event, custody and readers follow it."""
    ss = value['ss']
    key = key or next(iter(ss['store']))
    row = ss['store'][key]; old = row['frozen_producer_input']['event_id']
    edit(row['frozen_producer_input'])
    frozen = row['frozen_producer_input']; new = frozen['event_id']
    row['frozen_input_sha256'] = rjson_sha(frozen)
    receipt = ss['custody'].pop(old); receipt['event_id'] = new; ss['custody'][new] = receipt; row['append_receipt'] = copy.deepcopy(receipt)
    stored = ss['events'].pop(old)
    ss['events'][new] = dict({k: v for k, v in frozen.items() if k not in ('sequence_id', 'observed_at_utc', 'persisted_at_utc')},
                             sequence_id=stored['sequence_id'], observed_at_utc=stored['observed_at_utc'], persisted_at_utc=stored['persisted_at_utc'])
    for run in ss['runs']:
        if run['kind'] == 'evaluate' and ids(run['request'])['physical_key'] == key:
            run['appended'] = [copy.deepcopy(ss['events'][new])]
        if run['kind'] == 'retry' and run.get('response', {}).get('status') == 'committed_receipt':
            run['response']['append_receipt'] = copy.deepcopy(receipt)
        if run['kind'] == 'read' and run['read']['row_key'] == key:
            run['read']['request']['event_id'] = new
            if run['read_output']['status'] == 'read_through':
                run['read_output'] = read_through(ss, run)
        if run['kind'] == 'consume' and run['consume']['row_key'] == key:
            run['consume']['read_request']['event_id'] = new
            if run['result']['status'] == 'joined':
                run['result'] = joined(ss, run)
    return value


def corpus_slots(control):
    ss = control['value'].get('ss') or {}
    if len(ss.get('custody', {})) != 1:
        return
    (eid, _r), = ss['custody'].items()
    key = next(iter(ss['store']), None)
    paths = [('ss', 'custody', eid, 'acknowledged_at_utc')]
    if key and ss['store'][key]['frozen_producer_input']['event_id'] == eid and not any(r['kind'] in ('read', 'consume') for r in ss['runs']):
        paths.append(('ss', 'store', key, 'append_receipt', 'acknowledged_at_utc'))
        for n, run in enumerate(ss['runs']):
            if run['kind'] == 'retry' and isinstance(run.get('response', {}).get('append_receipt'), dict):
                paths.append(('ss', 'runs', n, 'response', 'append_receipt', 'acknowledged_at_utc'))
        yield {'paths': paths, 'kind': 'datetime', 'row': 'ss_pf_time', 'profile': w.EVENT_RECORD, 'type_rows': ['ss_pf_time']}
