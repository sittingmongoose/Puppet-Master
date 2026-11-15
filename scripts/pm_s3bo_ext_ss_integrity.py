"""C12-SS: storage.integrity_detected complete producer, finding-codec, exact-event and passive-read boundary.

Owner clauses (SP-279 sections 2-6 and 10; CV-1100; IN-P01..05 / IN-N01..05):
the finding input relation (0 <= last_good <= detection < next_good <=
segment_length, nonempty half-open byte ranges inside the segment, unknown
remainder = [detection, segment_length) with next_good at EOF, ordered uint64
sequence ranges); canonical_uint_json.v1 finding bytes (exact re-encoding, full
uint64); input_sha256, integrity_id, event_id, idempotency_key and the
report_ref of the immutable finding; the payload and envelope projection from
the finding; exact_event only with unique UTF-8-byte-sorted refs that each join
a corroborated source frame (advisory index rows are not identity authority);
the state machine capture -> durable finding -> append pending -> verified
event/result, with identical-input retry returning the original finding and
result, a bound identity with different input refusing, a torn finding
blocking, an unsafe sink leaving the finding pending, and resumption after
each crash cut without a second append; the downstream route through the shared
qualified RFC 8785 producer digest, physical bytes and CV-339 full-value
commitment, where a payload integer that RFC 8785 cannot preserve leaves the
finding pending before any effect (no substitute digest, no rounding, no cap);
no repair, truncation, seal, rebuild, block clearing or checkpoint effect; and
the checkpoint-free history reader (SP-278 live token, nonmatches examined,
issued continuation tokens only, unavailable when the permanent report is
missing or corrupt). Native execution remains NOT_RUN.
"""
import copy

import pm_s3bo_oracles as w
import pm_s3bo_sr_common as sr
import pm_s3bo_ss_common as s

LANE = 'ss'
INT = 'storage.integrity_detected'
FAMILIES = (INT,)
FIXTURES = w.read_json('Plans/storage_integrity_finding_contract_fixtures.json')
FINDING_ROOT = sr.schema_root('Plans/storage_integrity_finding_contracts.schema.json', 'finding')
PAYLOAD_FIELDS = ('storage_root_ref', 'storage_root_hash', 'segment_generation', 'segment_name', 'segment_hash', 'segment_state',
                  'frame_version', 'failure_class', 'detection_offset', 'last_good_offset', 'next_good_offset', 'impact_precision',
                  'durable_watermark_relation', 'affected_byte_range', 'affected_sequence_range', 'affected_event_refs',
                  'expected_crc', 'observed_crc')
UINT64 = (1 << 64) - 1
U32 = (1 << 32) - 1
NUMBER_SLOTS = (('root_generation', 0, UINT64), ('precondition_manifest_generation', 0, UINT64), ('segment_generation', 0, UINT64),
                ('segment_length', 0, UINT64), ('detection_offset', 0, UINT64), ('last_good_offset', 0, UINT64),
                ('next_good_offset', 0, UINT64), ('watermark_end_offset', 0, UINT64), ('expected_crc', 0, U32), ('observed_crc', 0, U32))
FRESH = ['revalidate_source', 'finding_temp_write', 'finding_sync', 'finding_promote', 'parent_sync', 'finding_readback',
         'qualify_projection']
APPEND = ['barrier_append', 'first_receipt', 'release_result']
FORBIDDEN_EFFECTS = ('truncate', 'seal', 'manifest_change', 'exclude_range', 'repair', 'rebuild_projector', 'clear_block',
                     'checkpoint_advance')

ROWS = [
    ('ss_int_outcome', 'ss_integrity', 'equal', 'Each detection ends exactly as SP-279 decides: appended, replayed, pending, conflict, blocked or refused.'),
    ('ss_int_events', 'ss_integrity', 'equal', 'A detection appends at most one EventRecord, once; refusal, pending, replay and resumption after the append add none.'),
    ('ss_int_order', 'ss_integrity', 'equal', 'Revalidate, durable finding write/sync/promote/readback, projection qualification, barrier append, first receipt, then release.'),
    ('ss_int_effects', 'ss_integrity', 'empty', 'Detection never truncates, seals, excludes, repairs, rebuilds, clears a block or advances a checkpoint.'),
    ('ss_int_codec', 'ss_integrity', 'equal', 'The durable finding is exact canonical_uint_json.v1 bytes that decode only to their own re-encoding.'),
    ('ss_int_finding', 'ss_integrity', 'equal', 'The finding records the admitted input, the owner validator witness and the first actor and time; a retry returns the original bytes.'),
    ('ss_int_identity', 'ss_integrity', 'equal', 'input_sha256, integrity_id, event_id, idempotency_key and report_ref follow SP-279 exactly.'),
    ('ss_int_payload', 'ss_integrity', 'equal', 'The payload is exactly the finding input projection, with absent optional fields left absent.'),
    ('ss_int_envelope', 'ss_integrity_custody', 'equal', 'The envelope is the application-scope Storage coordinator projection with first actor and time and null lineage.'),
    ('ss_int_witness', 'ss_integrity_custody', 'equal', 'An exact_event finding joins sorted unique refs to corroborated source frames, never advisory index rows.'),
    ('ss_int_downstream', 'ss_integrity_custody', 'equal', 'The shared qualified RFC 8785 digest and CV-339 full-value commitment of the frozen projection are reported exactly, or the route is unavailable.'),
    ('ss_int_receipt', 'ss_integrity_custody', 'equal', 'The result and first receipt join the appended event; a retry returns the original receipt exactly.'),
    ('ss_int_read', 'ss_integrity_custody', 'equal', 'The history reader returns only verified finding-backed results under the live token, issued continuations and no effect.'),
    ('ss_int_numbers', 'ss_integrity_custody', 'error', 'Every finding-input and reader integer uses shared current_integer with its owner bounds.'),
    ('ss_int_time', 'ss_integrity_custody', 'error', 'Finding and receipt timestamps use shared date_time with the EventRecord profile (E5-2).'),
    ('ss_int_schema', 'ss_integrity_custody', 'error', 'The presented finding keeps every keyword of the closed SP-279 finding schema.'),
]


# ---------------------------------------------------------------- owner recipes
def input_sha(value):
    return w.sha(s.canonical_json(value))


def finding_path(input_digest):
    return 'storage/integrity/findings/v1/' + w.sha(w.STORE.encode()) + '/' + input_digest + '.json'


def ids_for(finding_hex):
    raw = bytes.fromhex(finding_hex)
    finding = s.decode_canonical_json(raw)
    digest = finding['input_sha256']
    return {'input_sha256': digest, 'integrity_id': 'pm.storage.integrity.v1:' + digest,
            'event_id': 'evt_storage_integrity_' + digest, 'idempotency_key': 'storage.integrity_detected:' + digest,
            'report_ref': 'pm.storage.integrity_report.v1:' + w.sha(raw)}


def relation_ok(i):
    """SP-279 section 2 relations that supplement the closed schema."""
    if not (0 <= i['last_good_offset'] <= i['detection_offset'] < i['next_good_offset'] <= i['segment_length']):
        return False
    r = i.get('affected_byte_range')
    if r is not None and not (r[0] < r[1] <= i['segment_length'] and r[0] >= i['last_good_offset']):
        return False
    if i['impact_precision'] == 'unknown_segment_remainder':
        if r != [i['detection_offset'], i['segment_length']] or i['next_good_offset'] != i['segment_length']:
            return False
    q = i.get('affected_sequence_range')
    if q is not None and q[0] > q[1]:
        return False
    return True


def corroborated(i, witness, frames):
    """exact_event: sorted unique refs, each with one witness that joins one source frame (never an index row)."""
    if i['impact_precision'] != 'exact_event':
        return True
    refs = i.get('affected_event_refs') or []
    if refs != sorted(set(refs), key=lambda r: r.encode()) or not witness.get('header_identity_verified'):
        return False
    by_ref = {}
    for wit in witness.get('event_witnesses', []):
        by_ref.setdefault(wit['event_ref'], []).append(wit)
    lo, hi = i['affected_sequence_range']; b0, b1 = i['affected_byte_range']
    for ref in refs:
        wits = by_ref.get(ref, [])
        frame = frames.get(ref)
        if len(wits) != 1 or frame is None or frame.get('authority') != 'source_frame':
            return False
        wit = wits[0]
        if (wit['sequence_id'], wit['byte_start'], wit['byte_end'], wit['header_sha256']) != \
                (frame['sequence_id'], frame['byte_start'], frame['byte_end'], frame['header_sha256']):
            return False
        if not (lo <= wit['sequence_id'] <= hi and b0 <= wit['byte_start'] < wit['byte_end'] <= b1):
            return False
    return set(by_ref) == set(refs)


def finding_value(i, witness, time, actor):
    digest = input_sha(i)
    return {'schema_id': 'pm.storage_value.storage_integrity_finding.v1', 'schema_version': '1.0.0', 'input_sha256': digest,
            'integrity_id': 'pm.storage.integrity.v1:' + digest, 'input': copy.deepcopy(i), 'witness': copy.deepcopy(witness),
            'occurred_at_utc': time, 'actor_ref': actor, 'redaction_profile': 'reject_unhandled_secrets'}


def payload_from(finding_hex):
    finding = s.decode_canonical_json(bytes.fromhex(finding_hex)); ident = ids_for(finding_hex)
    p = {'schema_version': '2.0.0', 'integrity_id': ident['integrity_id'], 'report_ref': ident['report_ref']}
    for key in PAYLOAD_FIELDS:
        if key in finding['input']:
            p[key] = copy.deepcopy(finding['input'][key])
    return p


def envelope_projection(finding_hex, capture_ref):
    finding = s.decode_canonical_json(bytes.fromhex(finding_hex)); ident = ids_for(finding_hex)
    return {'schema_id': 'pm.event.v0', 'schema_version': '2.0.0', 'scope_kind': 'application', 'project_id': None,
            'thread_id': None, 'run_id': None, 'node_id': None, 'attempt_id': None, 'requested_account_ref': None,
            'effective_account_ref': None, 'actor_ref': finding['actor_ref'], 'occurred_at_utc': finding['occurred_at_utc'],
            'producer_sequence_id': None, 'correlation_id': capture_ref, 'causation_event_id': None, 'parent_event_id': None,
            'event_type': INT, 'event_id': ident['event_id'], 'idempotency_key': ident['idempotency_key'],
            'payload_schema_id': w.FAMILY[INT]['payload_schema_id'], 'payload_ref': None,
            'replay_policy': 'dedupe_by_idempotency_key',
            'migration': {k: None for k in ('migrated_from_schema_id', 'migrated_from_schema_version', 'migration_id', 'compatibility_event_type')}}


ENVELOPE_KEYS = ('schema_id', 'schema_version', 'scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id', 'attempt_id',
                 'requested_account_ref', 'effective_account_ref', 'actor_ref', 'occurred_at_utc', 'producer_sequence_id',
                 'correlation_id', 'causation_event_id', 'parent_event_id', 'event_type', 'payload_schema_id', 'payload_ref',
                 'replay_policy', 'migration')


def make_event(case, finding_hex, capture_ref, sequence):
    event = copy.deepcopy(case['stored_event'])
    projection = envelope_projection(finding_hex, capture_ref)
    event.update(projection)
    event['payload'] = payload_from(finding_hex)
    event['sequence_id'] = sequence; event['observed_at_utc'] = w.TIME; event['persisted_at_utc'] = w.TIME
    event['redaction_profile'] = 'no_secrets'
    return event


# ---------------------------------------------------------------- owner model (checker side)
def run_numbers(run):
    slots = []
    i = run.get('input') or {}
    for key, lo, hi in NUMBER_SLOTS:
        if key in i and i[key] is not None:
            slots.append((('input', key), i[key], lo, hi))
    for key in ('affected_byte_range', 'affected_sequence_range'):
        for n, value in enumerate(i.get(key) or []):
            slots.append((('input', key, n), value, 0, UINT64))
    for wit in (run.get('validator_witness') or {}).get('event_witnesses', []):
        for key in ('sequence_id', 'byte_start', 'byte_end'):
            slots.append((('witness', key), wit[key], 0, UINT64))
    read = run.get('read') or {}
    if 'page_size' in read.get('request', {}):
        slots.append((('read', 'page_size'), read['request']['page_size'], 1, None))
    return slots


def expect(case, idx):
    """Owner model over independent run inputs (never the presented outputs)."""
    ss = case['ss']; run = ss['runs'][idx]
    if run['kind'] == 'read':
        return {'read_output': expected_read(case, run)}
    i = run['input']; before = run.get('store_before'); path = finding_path(input_sha(i))
    if before is not None:
        existing, _reason = s.decode_hex_or_reason(before)
        if existing is not None and sr.keyword_errors(FINDING_ROOT, existing):
            existing = None
        if existing is None:
            return dict(outcome='blocked', events=0, trace=['resolve_existing_finding', 'block'], finding_hex=before,
                        store_hex=before, finding=None, basis=None)
        if existing['input'] != i:
            return dict(outcome='conflict', events=0, trace=['resolve_existing_finding', 'compare_input', 'refuse_conflict'],
                        finding_hex=before, store_hex=before, finding=None, basis=None)
        out = dict(finding_hex=before, store_hex=before, basis=before,
                   finding=(existing['input'], existing['occurred_at_utc'], existing['actor_ref']))
        if run['dedupe'] == 'event_and_receipt':
            out.update(outcome='replayed', events=0, trace=['resolve_existing_finding', 'compare_input', 'dedupe_lookup', 'return_original'])
        elif run['dedupe'] == 'event_committed':
            out.update(outcome='appended', events=0,
                       trace=['resolve_existing_finding', 'compare_input', 'dedupe_lookup', 'resolve_original_receipt', 'release_result'])
        else:
            out.update(outcome='appended', events=1,
                       trace=['resolve_existing_finding', 'compare_input', 'dedupe_lookup', 'qualify_projection'] + APPEND)
        return out
    if not relation_ok(i) or not corroborated(i, run['validator_witness'], ss['source_frames']):
        return dict(outcome='refused', events=0, trace=['revalidate_source', 'refuse'], finding_hex=None,
                    store_hex=None, finding=None, basis=None)
    hexed = s.canonical_json(finding_value(i, run['validator_witness'], run['time'], run['actor'])).hex()
    # basis: the presented finding when it is canonical (its content is judged by the finding,
    # witness and schema rows); the identity/payload/envelope rows derive from that file.
    presented = run.get('finding_hex')
    canonical = presented is not None and s.decode_hex_or_reason(presented)[0] is not None
    out = dict(finding_hex=hexed, store_hex=presented, basis=presented if canonical else None, finding=(i, run['time'], run['actor']))
    event = make_event(case, hexed, run['capture_ref'], run.get('sequence', 43))
    if s.semantic_or_reason(event).startswith('unavailable:') or run['sink'] != 'available':
        out.update(outcome='pending', events=0, trace=FRESH + ['pending'])
    elif run.get('crash_at'):
        steps = FRESH + APPEND; n = steps.index(run['crash_at'])
        out.update(outcome='crashed', events=1 if n >= steps.index('barrier_append') else 0, trace=steps[:n + 1] + ['crash'])
    else:
        out.update(outcome='appended', events=1, trace=FRESH + APPEND)
    return out


def expected_read(case, run):
    read = run['read']; ss = case['ss']
    issued = {'request_id': read['request']['request_id'], 'snapshot': read['snapshot'], 'issued_by': 'storage.integrity_history_reader.v1'}
    if read.get('continuation') is not None and read['continuation'] != issued:
        return {'status': 'refused', 'reason': 'continuation_not_issued'}
    if read['token'] != dict(read['durable_token'], redb_snapshot_id=read['snapshot']):
        return {'status': 'unavailable', 'reason': 'token_not_current'}
    results = []
    for candidate in read['candidates']:
        event = candidate['event']
        if event['event_type'] != INT:
            continue
        p = event['payload']; raw = ss['store'].get(finding_path(p['integrity_id'].split(':')[-1]))
        finding = s.decode_hex_or_reason(raw)[0] if raw is not None else None
        if finding is None or 'pm.storage.integrity_report.v1:' + w.sha(bytes.fromhex(raw)) != p['report_ref'] \
                or payload_from(raw) != p or event['actor_ref'] != finding['actor_ref'] \
                or event['occurred_at_utc'] != finding['occurred_at_utc']:
            return {'status': 'unavailable', 'reason': 'report_unavailable', 'examined': len(read['candidates'])}
        results.append([event['event_id'], event['sequence_id'], p['integrity_id'], p['report_ref'], p['failure_class'],
                        p['impact_precision'], p.get('affected_byte_range'), p.get('affected_sequence_range'),
                        finding['actor_ref'], finding['occurred_at_utc']])
    return {'status': 'read_through', 'results': results[:read['request']['page_size']], 'examined': len(read['candidates']),
            'token': dict(read['token']), 'owned_durable_effects': [], 'generic_checkpoint_effects': []}


def witness_view(witness):
    return [[x.get('event_ref'), x.get('sequence_id'), x.get('byte_start'), x.get('byte_end'), x.get('header_sha256')]
            for x in (witness or {}).get('event_witnesses', [])]


def operands(case, put, common):
    ss = case.get('ss')
    if not isinstance(ss, dict) or not isinstance(ss.get('runs'), list):
        put('ss_int_outcome', ['boundary record missing'], [])
        return
    runs = ss['runs']
    put = s.typed_put(put)
    num_errors = s.number_errors([x for r in runs for x in run_numbers(r)])
    put('ss_int_numbers', num_errors)
    times = []
    for n, r in enumerate(runs):
        if r['kind'] == 'detect':
            times.append((('runs', n, 'time'), r['time']))
        if isinstance(r.get('result'), dict) and isinstance(r['result'].get('receipt'), dict):
            times.append((('runs', n, 'result', 'receipt'), r['result']['receipt'].get('acknowledged_at_utc')))
    for key, receipt in sorted(ss.get('receipts', {}).items()):
        times.append((('receipts', key), receipt.get('acknowledged_at_utc')))
    time_errors = s.time_errors(times, w.EVENT_RECORD)
    put('ss_int_time', time_errors)
    if num_errors or time_errors:
        return
    expected = [expect(case, n) for n in range(len(runs))]
    detects = [n for n, r in enumerate(runs) if r['kind'] == 'detect']
    put('ss_int_outcome', [runs[n].get('outcome') for n in detects], [expected[n]['outcome'] for n in detects])
    put('ss_int_events', [len(runs[n].get('appended', [])) for n in detects], [expected[n]['events'] for n in detects])
    put('ss_int_order', [runs[n].get('trace') for n in detects], [expected[n]['trace'] for n in detects])
    put('ss_int_effects', [e for r in runs for e in r.get('effects', [])])
    codec_l = []; codec_r = []; schema_l = []; fin_l = []; fin_r = []; wit_l = []; wit_r = []
    for n in detects:
        r = runs[n]; want = expected[n]; hexed = r.get('finding_hex')
        value = s.decode_hex_or_reason(hexed)[0] if hexed is not None else None
        path = finding_path(input_sha(r['input']))
        if want['finding'] is None:
            # blocked, conflict and refused runs: the existing file (if any) is preserved untouched.
            fin_l.append((hexed, ss['store'].get(path))); fin_r.append((want['finding_hex'], want['store_hex']))
            continue
        codec_l.append(hexed)
        codec_r.append(None if hexed is None else (s.canonical_json(value).hex() if value is not None else s.decode_hex_or_reason(hexed)[1]))
        if hexed is not None and value is None:
            continue  # a non-canonical finding is owned by ss_int_codec alone
        if value is not None:
            schema_l += [[n] + e for e in sr.keyword_errors(FINDING_ROOT, value)]
        v = value or {}
        fin_l.append((v.get('input'), v.get('occurred_at_utc'), v.get('actor_ref'), hexed if r.get('store_before') else None,
                      ss['store'].get(path)))
        fin_r.append(tuple(want['finding']) + (r.get('store_before'), want['store_hex']))
        base = r['validator_witness'] if r.get('store_before') is None else s.decode_canonical_json(bytes.fromhex(r['store_before']))['witness']
        if not v:
            continue
        wit_l.append(({k: x for k, x in v['witness'].items() if k != 'event_witnesses'}, witness_view(v['witness'])))
        refs = sorted(set(r['input'].get('affected_event_refs') or []), key=lambda q: q.encode())
        frames = ss['source_frames']
        corroboration = [[q, frames[q]['sequence_id'], frames[q]['byte_start'], frames[q]['byte_end'], frames[q]['header_sha256']]
                         for q in refs if frames.get(q, {}).get('authority') == 'source_frame']
        want_view = corroboration if r['input'].get('impact_precision') == 'exact_event' else witness_view(base)
        wit_r.append(({k: x for k, x in base.items() if k != 'event_witnesses'}, want_view))
    put('ss_int_codec', codec_l, codec_r)
    put('ss_int_schema', schema_l)
    put('ss_int_finding', fin_l, fin_r)
    put('ss_int_witness', wit_l, wit_r)
    ident_l = []; ident_r = []; pay_l = []; pay_r = []; env_l = []; env_r = []; down_l = []; down_r = []; rec_l = []; rec_r = []
    for n in detects:
        r = runs[n]; want = expected[n]; event = r.get('event'); basis = want['basis']
        if basis is None or not isinstance(event, dict):
            continue
        finding = s.decode_canonical_json(bytes.fromhex(basis)); ident = ids_for(basis); p = event.get('payload') or {}
        ident_l.append((finding.get('input_sha256'), finding.get('integrity_id'), event.get('event_id'), event.get('idempotency_key'),
                        p.get('integrity_id'), p.get('report_ref')))
        ident_r.append((input_sha(finding['input']), 'pm.storage.integrity.v1:' + input_sha(finding['input']), ident['event_id'],
                        ident['idempotency_key'], ident['integrity_id'], ident['report_ref']))
        pay_l.append({k: x for k, x in p.items() if k not in ('integrity_id', 'report_ref')})
        pay_r.append({k: x for k, x in payload_from(basis).items() if k not in ('integrity_id', 'report_ref')})
        projection = envelope_projection(basis, r['capture_ref'])
        env_l.append([event.get(k) for k in ENVELOPE_KEYS]); env_r.append([projection[k] for k in ENVELOPE_KEYS])
        down_l.append((r.get('semantic'), r.get('full_value'), r.get('physical_sha256')))
        down_r.append((s.semantic_or_reason(event), s.full_value_or_reason(event), s.physical_sha(event)))
        if want['outcome'] in ('appended', 'replayed'):
            result = r.get('result') or {}; receipt = result.get('receipt') or {}
            custody = ss['receipts'].get(event.get('event_id')) or {}
            stored = ss['events'].get(event.get('event_id')) or {}
            rec_l.append(([result.get(k) for k in ('event_id', 'sequence_id', 'byte_offset', 'segment_ref')],
                          [receipt.get(k) for k in s.RECEIPT_KEYS], [custody.get('event_id'), custody.get('sequence_id')],
                          [custody.get('durability_class'), custody.get('durability_state')], s.physical_sha(stored)))
            rec_r.append(([stored.get('event_id'), stored.get('sequence_id'), custody.get('byte_offset'), custody.get('segment_name')],
                          [custody.get(k) for k in s.RECEIPT_KEYS], [event.get('event_id'), event.get('sequence_id')],
                          ['barrier', 'synced'], s.physical_sha(event)))
    put('ss_int_identity', ident_l, ident_r)
    put('ss_int_payload', pay_l, pay_r)
    put('ss_int_envelope', env_l, env_r)
    put('ss_int_downstream', down_l, down_r)
    put('ss_int_receipt', rec_l, rec_r)
    reads = [n for n, r in enumerate(runs) if r['kind'] == 'read']
    put('ss_int_read', [runs[n].get('read_output') for n in reads], [expected[n]['read_output'] for n in reads])


# ---------------------------------------------------------------- fixture constructor (never called by the checker)
def simulate(case, spec, finding_edit=None):
    """Build the presented run from the AUTHORED outcome label, not from expect().

    finding_edit, when given, changes the finding the producer writes (a single
    source defect); every copy derived from it follows.
    """
    ss = case['ss']; run = copy.deepcopy(spec); want = run.pop('want')
    run.setdefault('effects', []); run.setdefault('appended', [])
    run['outcome'] = want
    if run['kind'] == 'read':
        run['read_output'] = spec_read(case, run, want)
        return run
    i = run['input']; before = run.get('store_before'); path = finding_path(input_sha(i))
    if before is not None:
        ss['store'].setdefault(path, before)
    if want in ('blocked', 'conflict'):
        run.update(finding_hex=before, event=None, result=None,
                   trace=['resolve_existing_finding', 'block'] if want == 'blocked' else ['resolve_existing_finding', 'compare_input', 'refuse_conflict'])
        return run
    if want == 'refused':
        run.update(finding_hex=None, event=None, result=None, trace=['revalidate_source', 'refuse'])
        return run
    if before is None:
        finding = finding_value(i, run['validator_witness'], run['time'], run['actor'])
        if finding_edit:
            finding_edit(finding)
        hexed = s.canonical_json(finding).hex(); ss['store'][path] = hexed
    else:
        hexed = before
    run['finding_hex'] = hexed
    event_id = 'evt_storage_integrity_' + input_sha(i)
    prior = ss['events'].get(event_id)
    event = copy.deepcopy(prior) if prior else make_event(case, hexed, run['capture_ref'], run.get('sequence', 43))
    run['event'] = event
    run['semantic'] = s.semantic_or_reason(event); run['full_value'] = s.full_value_or_reason(event)
    run['physical_sha256'] = s.physical_sha(event)
    if want == 'pending':
        run.update(trace=FRESH + ['pending'], result=None)
        return run
    if want == 'crashed':
        steps = FRESH + APPEND; n = steps.index(run['crash_at'])
        run['trace'] = steps[:n + 1] + ['crash']; run['result'] = None
        if n >= steps.index('barrier_append'):
            run['appended'] = [copy.deepcopy(event)]; ss['events'][event_id] = copy.deepcopy(event)
        if n >= steps.index('first_receipt'):
            ss['receipts'][event_id] = s.receipt_for(event, offset=run.get('offset', 512))
        return run
    if before is not None and run['dedupe'] == 'event_and_receipt':
        run['trace'] = ['resolve_existing_finding', 'compare_input', 'dedupe_lookup', 'return_original']
    elif before is not None and run['dedupe'] == 'event_committed':
        run['trace'] = ['resolve_existing_finding', 'compare_input', 'dedupe_lookup', 'resolve_original_receipt', 'release_result']
    else:
        run['appended'] = [copy.deepcopy(event)]; ss['events'][event_id] = copy.deepcopy(event)
        run['trace'] = (['resolve_existing_finding', 'compare_input', 'dedupe_lookup', 'qualify_projection'] if before is not None else FRESH) + APPEND
    receipt = ss['receipts'].setdefault(event_id, s.receipt_for(event, offset=run.get('offset', 512)))
    run['result'] = dict(s.append_result(receipt), receipt=copy.deepcopy(receipt))
    return run


def spec_read(case, run, want):
    read = run['read']
    if want == 'refused':
        return {'status': 'refused', 'reason': 'continuation_not_issued'}
    if want == 'stale':
        return {'status': 'unavailable', 'reason': 'token_not_current'}
    if want == 'unavailable':
        return {'status': 'unavailable', 'reason': 'report_unavailable', 'examined': len(read['candidates'])}
    results = []
    for candidate in read['candidates']:
        e = candidate['event']
        if e['event_type'] != INT:
            continue
        p = e['payload']
        results.append(copy.deepcopy([e['event_id'], e['sequence_id'], p['integrity_id'], p['report_ref'], p['failure_class'],
                                      p['impact_precision'], p.get('affected_byte_range'), p.get('affected_sequence_range'),
                                      e['actor_ref'], e['occurred_at_utc']]))
    return {'status': 'read_through', 'results': results, 'examined': len(read['candidates']), 'token': copy.deepcopy(read['token']),
            'owned_durable_effects': [], 'generic_checkpoint_effects': []}


def scenario(case, specs, frames=None, store=None, finding_edit=None):
    case['ss'] = {'family': INT, 'runs': [], 'store': dict(store or {}), 'events': {}, 'receipts': {},
                  'source_frames': copy.deepcopy(frames or {})}
    for spec in specs:
        if callable(spec):
            spec = spec(case)
        case['ss']['runs'].append(simulate(case, spec, finding_edit))
    return case


def wire(case_id):
    item = next(x for x in FIXTURES['value_shape_cases'] if x['id'] == case_id)
    return copy.deepcopy(item['value'])


def detect(finding, want, **extra):
    spec = {'kind': 'detect', 'want': want, 'input': copy.deepcopy(finding['input']), 'validator_witness': copy.deepcopy(finding['witness']),
            'time': finding['occurred_at_utc'], 'actor': finding['actor_ref'], 'capture_ref': 'storage.integrity_capture:' + finding['input_sha256'],
            'sink': 'available'}
    spec.update(extra)
    return spec


def read_spec(case, want, candidates, **extra):
    durable = copy.deepcopy(case['token'])
    spec = {'kind': 'read', 'want': want, 'read': {'request': {'consumer': 'storage.integrity_history_reader.v1', 'storage_instance_id': w.STORE,
            'scope': 'application', 'request_id': 'history-request-A', 'page_size': 50, 'filter': {'event_type': INT},
            'access_epoch': 4, 'deletion_epoch': 2}, 'snapshot': 'snapshot-A', 'durable_token': durable,
            'token': dict(durable, redb_snapshot_id='snapshot-A'), 'candidates': copy.deepcopy(candidates), 'continuation': None}}
    spec['read'].update(extra)
    return spec


NONMATCH = {'event_id': 'evt-boot-other', 'event_type': 'storage.boot_recovery', 'sequence_id': 40}


def exact_event_finding(cls='payload_integrity', refs=('evt-B', 'evt-C')):
    f = wire('wire_case_13'); i = f['input']
    i.update(failure_class=cls, impact_precision='exact_event', affected_byte_range=[0, 1859], affected_sequence_range=[10, 11],
             affected_event_refs=list(refs))
    if cls == 'sequence_integrity':
        i.pop('expected_crc', None); i.pop('observed_crc', None)
    f['witness'].update(header_identity_verified=True,
                        event_witnesses=[{'event_ref': r, 'sequence_id': 10 + n, 'byte_start': 900 * n, 'byte_end': 900 * n + 900,
                                          'header_sha256': w.sha(r.encode())} for n, r in enumerate(refs)])
    f['input_sha256'] = input_sha(i); f['integrity_id'] = 'pm.storage.integrity.v1:' + f['input_sha256']
    frames = {r: {'authority': 'source_frame', 'sequence_id': 10 + n, 'byte_start': 900 * n, 'byte_end': 900 * n + 900,
                  'header_sha256': w.sha(r.encode())} for n, r in enumerate(refs)}
    return f, frames


def high_u64(range_, length=None):
    f = wire('wire_case_37'); i = f['input']; i['affected_sequence_range'] = list(range_)
    if length:
        i.update(segment_length=length, next_good_offset=length, affected_byte_range=[0, length], watermark_end_offset=length)
    f['input_sha256'] = input_sha(i); f['integrity_id'] = 'pm.storage.integrity.v1:' + f['input_sha256']
    return f


RETRY_TIME = '2026-09-12T08:00:00.000Z'


def main_scenario(case, finding_edit=None):
    base = wire('wire_case_2')
    return scenario(case, [detect(base, 'appended'),
                           lambda c: detect(base, 'replayed', store_before=c['ss']['runs'][0]['finding_hex'], dedupe='event_and_receipt', time=RETRY_TIME),
                           lambda c: read_spec(c, 'read_through', [{'event': c['ss']['runs'][0]['event']}, {'event': NONMATCH}])],
                    finding_edit=finding_edit)


def augment(control):
    main_scenario(control)


R = lambda i, *path: ('ss', 'runs', i) + path


def edit_event(value, i, edit):
    """One presented-event defect; its appended copy and the run's reported digests follow it."""
    run = value['ss']['runs'][i]
    for event in [run['event']] + run.get('appended', []):
        edit(event)
    run['semantic'] = s.semantic_or_reason(run['event']); run['full_value'] = s.full_value_or_reason(run['event'])
    run['physical_sha256'] = s.physical_sha(run['event'])
    return value


def rebind_event(value, edit):
    """One producer-projection defect in a single-append scenario; every Storage copy follows it."""
    ss = value['ss']; run = ss['runs'][0]; old = run['event']['event_id']
    for event in [run['event']] + run['appended']:
        edit(event)
    new = run['event']
    ss['events'].pop(old, None); ss['events'][new['event_id']] = copy.deepcopy(new)
    receipt = ss['receipts'].pop(old); receipt.update(event_id=new['event_id'], sequence_id=new['sequence_id'])
    ss['receipts'][new['event_id']] = receipt
    run['result'] = dict(s.append_result(receipt), receipt=copy.deepcopy(receipt))
    run['semantic'] = s.semantic_or_reason(new); run['full_value'] = s.full_value_or_reason(new)
    run['physical_sha256'] = s.physical_sha(new)
    return value


def spaced(hexed):
    raw = bytes.fromhex(hexed)
    at = raw.index(b',') + 1
    return (raw[:at] + b' ' + raw[at:]).hex()


def cases():
    import pm_s3bo_cases as c
    controls = []; negatives = []
    main = s.control(INT, 'main', w.build(INT)); controls.append(main)
    first = main['value']['ss']['runs'][0]
    for row, path, replacement, label in [
            ('ss_int_outcome', R(0, 'outcome'), 'pending', 'appended-reported-pending'),
            ('ss_int_outcome', R(1, 'outcome'), 'appended', 'replay-reported-fresh'),
            ('ss_int_events', R(1, 'appended'), [first['event']], 'replay-appends-again'),
            ('ss_int_order', R(0, 'trace'), FRESH[:5] + ['qualify_projection', 'barrier_append', 'finding_readback'] + APPEND[1:], 'append-before-readback'),
            ('ss_int_order', R(0, 'trace'), FRESH + ['barrier_append', 'release_result', 'first_receipt'], 'release-before-receipt'),
            ('ss_int_effects', R(0, 'effects'), ['truncate'], 'detection-truncates'),
            ('ss_int_effects', R(1, 'effects'), ['clear_block'], 'replay-clears-block'),
            ('ss_int_effects', R(0, 'effects'), ['checkpoint_advance'], 'detection-advances-checkpoint'),
            ('ss_int_codec', R(0, 'finding_hex'), spaced(first['finding_hex']), 'whitespace-in-finding'),
            ('ss_int_finding', R(1, 'finding_hex'), None, 'replay-loses-finding'),
            ('ss_int_finding', R(1, 'finding_hex'), s.canonical_json(dict(s.decode_canonical_json(bytes.fromhex(first['finding_hex'])), occurred_at_utc=RETRY_TIME)).hex(), 'retry-rewrites-first-time'),
            ('ss_int_receipt', R(1, 'result', 'receipt', 'sequence_id'), 99, 'replay-other-receipt'),
            ('ss_int_receipt', R(0, 'result', 'byte_offset'), 7, 'result-offset-disagrees'),
            ('ss_int_receipt', ('ss', 'receipts', first['event']['event_id'], 'durability_class'), 'ordinary', 'receipt-not-barrier'),
            ('ss_int_downstream', R(0, 'semantic'), 'a' * 64, 'semantic-digest-substituted'),
            ('ss_int_downstream', R(0, 'full_value'), 'b' * 64, 'full-value-substituted'),
            ('ss_int_read', R(2, 'read_output', 'owned_durable_effects'), ['checkpoint'], 'read-owns-effect'),
            ('ss_int_read', R(2, 'read_output', 'examined'), 1, 'read-skips-nonmatch'),
            ('ss_int_read', R(2, 'read_output', 'token', 'redb_snapshot_id'), 'stored-snapshot', 'read-other-snapshot'),
            ('ss_int_time', R(0, 'time'), '2026-02-30T00:00:00Z', 'finding-impossible-day'),
            ('ss_int_numbers', R(2, 'read', 'request', 'page_size'), 0, 'page-size-zero'),
            ('ss_int_numbers', R(0, 'input', 'expected_crc'), 1 << 32, 'crc-above-u32'),
            ('ss_int_numbers', R(0, 'input', 'segment_length'), True, 'boolean-length')]:
        negatives.append(c.mutate(main, row, path, replacement, label))
    single = s.control(INT, 'single-append', scenario(w.build(INT), [detect(wire('wire_case_2'), 'appended')]))
    controls.append(single)
    for row, edit, label in [
            ('ss_int_identity', lambda e: e.update(event_id='evt_storage_integrity_' + 'c' * 64), 'event-id-not-input-hash'),
            ('ss_int_identity', lambda e: e.update(idempotency_key='storage.integrity_detected:' + 'c' * 64), 'key-not-input-hash'),
            ('ss_int_identity', lambda e: e['payload'].update(report_ref='pm.storage.integrity_report.v1:' + 'c' * 64), 'report-ref-not-file-hash'),
            ('ss_int_payload', lambda e: e['payload'].update(next_good_offset=1858), 'payload-offset-differs'),
            ('ss_int_payload', lambda e: e['payload'].update(expected_crc=1), 'payload-invents-crc'),
            ('ss_int_payload', lambda e: e['payload'].pop('affected_byte_range'), 'payload-drops-range'),
            ('ss_int_envelope', lambda e: e.update(project_id='project-A', scope_kind='project'), 'envelope-project-scope'),
            ('ss_int_envelope', lambda e: e.update(occurred_at_utc=RETRY_TIME), 'envelope-retry-time'),
            ('ss_int_envelope', lambda e: e.update(causation_event_id='evt-other'), 'envelope-invented-lineage'),
            ('ss_int_envelope', lambda e: e.update(producer_sequence_id=7), 'envelope-producer-sequence'),
            ('ss_int_envelope', lambda e: e.update(actor_ref='user:impersonated'), 'envelope-user-actor')]:
        negatives.append(c.negative(single, row, label, rebind_event(copy.deepcopy(single['value']), edit), {'event_copies': 'rebound'}))
    for row, edit, label in [
            ('ss_int_witness', lambda f: f['witness'].update(check_evidence_sha256='d' * 64), 'finding-other-witness'),
            ('ss_int_witness', lambda f: f['witness'].update(watermark_verified=False), 'finding-drops-watermark-proof'),
            ('ss_int_finding', lambda f: f.update(actor_ref='user:impersonated'), 'finding-other-actor')]:
        value = main_scenario(w.build(INT), finding_edit=edit)
        negatives.append(c.negative(main, row, label, value, {'finding_source': label, 'copies': 'rebound'}))
    # A schema-invalid written finding (single append; a later retry would see it as malformed and block).
    for edit, label in [(lambda f: f.update(raw_segment_text='payload-bytes'), 'finding-raw-content'),
                        (lambda f: f.update(redaction_profile='no_secrets'), 'finding-redaction-profile'),
                        (lambda f: f.update(schema_version='1.0.1'), 'finding-schema-version')]:
        value = scenario(w.build(INT), [detect(wire('wire_case_2'), 'appended')], finding_edit=edit)
        negatives.append(c.negative(single, 'ss_int_schema', label, value, {'finding_source': label, 'copies': 'rebound'}))
    for case_id in ('wire_case_0', 'wire_case_13', 'wire_case_37', 'wire_case_50', 'wire_case_54'):
        value = scenario(w.build(INT), [detect(wire(case_id), 'appended')])
        control = s.control(INT, case_id, value); controls.append(control)
        negatives.append(c.mutate(control, 'ss_int_outcome', R(0, 'outcome'), 'refused', 'valid-refused'))
    # SP-279 full uint64 through the complete downstream route (CV-1100: exact RFC 8785 or unavailable before effects).
    for label, finding, want in [('wire_case_41', wire('wire_case_41'), 'pending'), ('wire_case_42', wire('wire_case_42'), 'pending'),
                                 ('u64-2p53-plus-1', high_u64([9007199254740992, 9007199254740993]), 'pending'),
                                 ('u64-2p60', high_u64([0, 1 << 60]), 'pending'),
                                 ('u64-exact-2p53-1e18', high_u64([9007199254740992, 10 ** 18], 10 ** 18), 'appended'),
                                 ('u64-exact-1p8e19', high_u64([18 * 10 ** 18, 18 * 10 ** 18], 18 * 10 ** 18), 'appended')]:
        specs = [detect(finding, want)]
        if want == 'appended':
            specs.append(lambda c: read_spec(c, 'read_through', [{'event': c['ss']['runs'][0]['event']}]))
        value = scenario(w.build(INT), specs)
        control = s.control(INT, label, value); controls.append(control)
        if want == 'pending':
            negatives.append(c.mutate(control, 'ss_int_outcome', R(0, 'outcome'), 'appended', 'unpreservable-appended'))
            negatives.append(c.mutate(control, 'ss_int_events', R(0, 'appended'), [value['ss']['runs'][0]['event']], 'unpreservable-appends'))
            negatives.append(c.mutate(control, 'ss_int_downstream', R(0, 'semantic'), w.sha(b'substitute-string-tree'), 'substitute-digest'))
        else:
            negatives.append(c.mutate(control, 'ss_int_outcome', R(0, 'outcome'), 'pending', 'exact-u64-refused'))
            negatives.append(c.mutate(control, 'ss_int_read', R(1, 'read_output', 'results', 0, 7, 1),
                                      float(finding['input']['affected_sequence_range'][1]), 'read-rounds-u64'))
            value2 = rebind_event(copy.deepcopy(value), lambda e: e['payload']['affected_sequence_range'].__setitem__(1, e['payload']['affected_sequence_range'][1] - 1))
            value2['ss']['runs'][1]['read']['candidates'][0]['event'] = copy.deepcopy(value2['ss']['runs'][0]['event'])
            value2['ss']['runs'][1]['read_output'] = spec_read(value2, value2['ss']['runs'][1], 'unavailable')
            negatives.append(c.negative(control, 'ss_int_payload', 'payload-u64-off-by-one', value2, {'payload': 'upper bound minus one'}))
    for label, cls, refs in [('exact-event-payload', 'payload_integrity', ('evt-B', 'evt-C')),
                             ('exact-event-sequence', 'sequence_integrity', ('evt-D',))]:
        finding, frames = exact_event_finding(cls, refs)
        value = scenario(w.build(INT), [detect(finding, 'appended')], frames=frames)
        control = s.control(INT, label, value); controls.append(control)
        value2 = scenario(w.build(INT), [detect(finding, 'appended')], frames=frames,
                          finding_edit=lambda f: f['witness']['event_witnesses'][0].update(byte_start=1))
        negatives.append(c.negative(control, 'ss_int_witness', 'witness-disagrees-frame', value2, {'witness': 'byte start differs from source frame'}))
        negatives.append(c.mutate(control, 'ss_int_outcome', R(0, 'outcome'), 'refused', 'corroborated-refused'))
    for label, mutate_frames, mutate_finding in [
            ('exact-event-uncorroborated', lambda fr: fr.pop('evt-C'), None),
            ('exact-event-index-only', lambda fr: fr['evt-C'].update(authority='advisory_index_row'), None),
            ('exact-event-unsorted', None, lambda f: f['input'].update(affected_event_refs=['evt-C', 'evt-B'])),
            ('exact-event-header-unverified', None, lambda f: f['witness'].update(header_identity_verified=False)),
            ('exact-event-outside-range', None, lambda f: f['witness']['event_witnesses'][1].update(sequence_id=12))]:
        finding, frames = exact_event_finding()
        if mutate_frames:
            mutate_frames(frames)
        if mutate_finding:
            mutate_finding(finding)
            if label == 'exact-event-outside-range':
                frames['evt-C']['sequence_id'] = 12
        value = scenario(w.build(INT), [detect(finding, 'refused')], frames=frames)
        control = s.control(INT, label, value); controls.append(control)
        negatives.append(c.mutate(control, 'ss_int_outcome', R(0, 'outcome'), 'appended', 'uncorroborated-appended'))
    for label, source, change in [('last-good-after-detection', 'wire_case_0', {'last_good_offset': 1851}),
                                  ('next-good-not-after-detection', 'wire_case_2', {'next_good_offset': 0}),
                                  ('next-good-past-segment', 'wire_case_2', {'next_good_offset': 3710}),
                                  ('empty-byte-range', 'wire_case_2', {'affected_byte_range': [5, 5]}),
                                  ('byte-range-past-segment', 'wire_case_2', {'affected_byte_range': [0, 3710]}),
                                  ('remainder-not-to-eof', 'wire_case_50', {'affected_byte_range': [0, 29]}),
                                  ('sequence-range-reversed', 'wire_case_37', {'affected_sequence_range': [11, 10]})]:
        finding = wire(source); finding['input'].update(change)
        value = scenario(w.build(INT), [detect(finding, 'refused')])
        control = s.control(INT, label, value); controls.append(control)
        negatives.append(c.mutate(control, 'ss_int_outcome', R(0, 'outcome'), 'appended', 'relation-violation-appended'))
    value = scenario(w.build(INT), [detect(wire('wire_case_0'), 'pending', sink='unavailable')])
    control = s.control(INT, 'sink-unavailable', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_int_outcome', R(0, 'outcome'), 'appended', 'unsafe-sink-appended'))
    negatives.append(c.mutate(control, 'ss_int_order', R(0, 'trace'), FRESH + ['barrier_append', 'pending'], 'unsafe-sink-appends-first'))
    base = wire('wire_case_2')
    forged = finding_value(base['input'], base['witness'], base['occurred_at_utc'], base['actor_ref'])
    forged['input']['next_good_offset'] = 1858
    value = scenario(w.build(INT), [detect(base, 'conflict', store_before=s.canonical_json(forged).hex(), dedupe='absent')])
    control = s.control(INT, 'bound-identity-other-input', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_int_outcome', R(0, 'outcome'), 'replayed', 'conflict-accepted'))
    negatives.append(c.mutate(control, 'ss_int_finding', ('ss', 'store', finding_path(input_sha(base['input']))),
                              s.canonical_json(finding_value(base['input'], base['witness'], base['occurred_at_utc'], base['actor_ref'])).hex(),
                              'conflict-overwrites-finding'))
    torn = s.canonical_json(finding_value(base['input'], base['witness'], base['occurred_at_utc'], base['actor_ref'])).hex()[:-40]
    value = scenario(w.build(INT), [detect(base, 'blocked', store_before=torn, dedupe='absent')])
    control = s.control(INT, 'torn-finding', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_int_outcome', R(0, 'outcome'), 'appended', 'torn-replaced'))
    negatives.append(c.mutate(control, 'ss_int_finding', ('ss', 'store', finding_path(input_sha(base['input']))), None, 'torn-erased'))
    for at, dedupe in [('finding_readback', 'absent'), ('barrier_append', 'event_committed')]:
        value = scenario(w.build(INT), [detect(base, 'crashed', crash_at=at),
                                        lambda c, d=dedupe: detect(base, 'appended', store_before=c['ss']['runs'][0]['finding_hex'], dedupe=d)])
        control = s.control(INT, 'crash-after-' + at, value); controls.append(control)
        negatives.append(c.mutate(control, 'ss_int_events', R(1, 'appended'), [value['ss']['runs'][0]['event']] * (2 if dedupe == 'absent' else 1), 'resume-duplicate-append'))
        negatives.append(c.mutate(control, 'ss_int_outcome', R(0, 'outcome'), 'appended', 'crash-reported-success'))
    lost = single['value']['ss']['runs'][0]['event']
    for label, store in [('read-report-missing', {}),
                         ('read-report-corrupt', {finding_path(input_sha(base['input'])): spaced(single['value']['ss']['runs'][0]['finding_hex'])})]:
        value = scenario(w.build(INT), [lambda c: read_spec(c, 'unavailable', [{'event': lost}])], store=store)
        control = s.control(INT, label, value); controls.append(control)
        negatives.append(c.mutate(control, 'ss_int_read', R(0, 'read_output'), spec_read(value, value['ss']['runs'][0], 'read_through'), 'lost-report-healthy'))
    value = scenario(w.build(INT), [detect(base, 'appended'), lambda c: read_spec(c, 'refused', [], continuation={
        'request_id': 'history-request-A', 'snapshot': 'snapshot-other', 'issued_by': 'storage.integrity_history_reader.v1'})])
    control = s.control(INT, 'read-foreign-continuation', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_int_read', R(1, 'read_output', 'status'), 'read_through', 'foreign-continuation-accepted'))
    value = scenario(w.build(INT), [detect(base, 'appended'), lambda c: read_spec(c, 'stale', [{'event': c['ss']['runs'][0]['event']}], snapshot='snapshot-B')])
    control = s.control(INT, 'read-stale-token', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_int_read', R(1, 'read_output', 'status'), 'read_through', 'stale-token-accepted'))
    return controls, negatives


def corpus_slots(control):
    ss = control['value'].get('ss') or {}
    for n, r in enumerate(ss.get('runs', [])):
        if r['kind'] == 'read' and r.get('read_output', {}).get('status') == 'read_through' and len(r['read_output']['results']) <= 1:
            yield {'paths': [('ss', 'runs', n, 'read', 'request', 'page_size')], 'kind': 'integer', 'row': 'ss_int_numbers',
                   'bounds': {'minimum': 1}, 'container_row': 'ss_int_numbers'}
    paths = []
    for n, r in enumerate(ss.get('runs', [])):
        if isinstance(r.get('result'), dict) and isinstance(r['result'].get('receipt'), dict):
            paths.append(('ss', 'runs', n, 'result', 'receipt', 'acknowledged_at_utc'))
    if paths:
        ids = {r['result']['event_id'] for r in ss['runs'] if isinstance(r.get('result'), dict)}
        paths += [('ss', 'receipts', e, 'acknowledged_at_utc') for e in sorted(ids)]
        yield {'paths': paths, 'kind': 'datetime', 'row': 'ss_int_time', 'profile': w.EVENT_RECORD, 'type_rows': ['ss_int_time']}
