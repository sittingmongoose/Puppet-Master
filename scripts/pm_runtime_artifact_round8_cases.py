"""Authenticated predecessor controls for RAP-113 (static adapters, not issuance).

Current controls are assembled before each invocation. Genuine historical
controls use the frozen old issuer's originals unchanged, never AppendModel.
The recipe belongs to the independently authenticated source adapter, alongside
its original read; it is never taken from the event, result or supplied custody.
"""
import copy


def observation_source(m, fixtures, row, previous, packs, source):
    """Test setup only: authenticate a freshly constructed current control."""
    if previous is None:
        return copy.deepcopy(source)
    receipt = copy.deepcopy(fixtures['first_append_receipts'][row['event_type']])
    receipt.update(event_id=previous['event_id'], sequence_id=previous['sequence_id'])
    custody = copy.deepcopy(fixtures['custody_template'])
    custody.update(event_id=previous['event_id'],
                   scope_partition=m.scope_partition(previous['project_id']),
                   event_type=previous['event_type'], idempotency_key=previous['idempotency_key'],
                   producer_semantic_digest=m.semantic_digest(previous),
                   first_append_receipt=receipt,
                   original_event_value_commitment=m.commitment(previous))
    original = dict(event=copy.deepcopy(previous), custody=custody,
                    result={k: copy.deepcopy(custody[k]) for k in (
                        'first_append_receipt', 'original_segment_ref', 'original_event_value_commitment')})
    payload = m.decode(row, previous, packs)
    return retained_source(m, row, original, payload, source, m.CURRENT_WRITER)


def retained_source(m, row, original, payload, source, decoder):
    proof = copy.deepcopy(source)
    proof['predecessor_result'] = copy.deepcopy(original['result'])
    proof['predecessor_custody'] = copy.deepcopy(original['custody'])
    adapter = m.history_source_for(row, payload, original)
    adapter['recorded_decoder'] = decoder
    # These live facts must not make authentic history unreadable.
    adapter['current_live_state'] = dict(owner_active=False, status='deleted')
    proof['predecessor_source'] = adapter
    return proof


def routes(m, rows, fixtures):
    """Yield the four authentic old-predecessor/current-successor routes."""
    row = next((r for r in rows if r['event_type'] == 'runtime_artifact.restore_point'), None)
    if row is None:
        return
    for frozen in fixtures['historical_numeric_originals']['cases']:
        if frozen['event_type'] != row['event_type']:
            continue
        original = copy.deepcopy(frozen['original'])
        for route in ('inline', 'packed'):
            packs = {k: dict(v, body=v['body'].encode('utf-8')) for k, v in frozen['packs'].items()}
            candidate = copy.deepcopy(fixtures['restore_successor'])
            candidate['parent_event_id'] = original['event']['event_id']
            candidate['producer_sequence_id'] = original['event']['producer_sequence_id'] + 1
            candidate['correlation_id'] = m.grouping_identity(row['event_type'], candidate['payload'])
            candidate['idempotency_key'] = m.identity(row['event_type'], candidate['payload'], candidate['producer_sequence_id'])
            point = copy.deepcopy(candidate['payload']['type_payload'])
            if route == 'packed':
                candidate['payload']['summary'] = 'x' * 17000
            candidate['payload'], candidate['payload_ref'] = m.storage_form(candidate['payload'], packs)
            proof = retained_source(m, row, original, frozen['logical_payload'], dict(
                proof_valid=True, predecessor_complete=True, snapshot_current=True,
                canonical_point=point), m.HISTORICAL_V1)
            yield frozen['route'] + '_to_' + route, row, original, candidate, packs, proof


def cases(m, rows, fixtures):
    result = []
    for route, row, original, candidate, packs, source in routes(m, rows, fixtures):
        previous = original['event']

        def observe(n, s=source, p=previous, e=candidate, r=row, packs=packs):
            return n.observation_admissible(e, p, r, packs, s)

        def add(guard, name, bad_source=None, bad_previous=None, bad_candidate=None):
            result.append((guard, row['event_type'], route + '_' + name, observe,
                           lambda n, s=bad_source if bad_source is not None else source,
                           p=bad_previous if bad_previous is not None else previous,
                           e=bad_candidate if bad_candidate is not None else candidate,
                           f=observe: f(n, s, p, e)))

        # One altered Storage-owned value; logical body, successor and all
        # independent authenticated bytes remain intact. No reissued event.
        bad = copy.deepcopy(previous)
        bad['observed_at_utc'] = '2026-07-02T00:00:02Z'
        add('O11', 'forged_original', bad_previous=bad)
        bad = copy.deepcopy(source)
        bad['predecessor_result']['first_append_receipt']['acknowledged_at_utc'] = '2026-07-02T00:00:03Z'
        bad['predecessor_custody']['first_append_receipt'] = copy.deepcopy(bad['predecessor_result']['first_append_receipt'])
        add('O11', 'forged_first_receipt', bad_source=bad)
        bad = copy.deepcopy(source)
        bad['predecessor_custody']['group_digest'] = '0' * 64
        add('O11', 'forged_custody', bad_source=bad)
        bad = copy.deepcopy(source)
        bad['predecessor_source']['withdrawn'] = True
        add('O13', 'withdrawn', bad_source=bad)
        bad = copy.deepcopy(source)
        bad['predecessor_source']['recorded_decoder'] = 'unsupported-recipe'
        add('O12', 'unsupported_recipe', bad_source=bad)

        # The current source/candidate must still use CURRENT_WRITER. Changing
        # only the candidate's Storage number must never borrow the old profile.
        bad = copy.deepcopy(candidate)
        bad['sequence_id'] = float(bad['sequence_id'])
        add('N01', 'current_candidate_stays_strict', bad_candidate=bad)
    return result
