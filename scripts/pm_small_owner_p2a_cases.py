"""Sweep part 2A coherent witnesses for DM guard rows with no single-row negative.

Each witness starts from a valid complete-checker input, changes one fact and
moves its observational copies (identity, key, descriptor, result payload),
then runs the complete checker boundary. The suite recorder turns the refused
phase evaluation into the row's negative. Every witness asserts its first
refusal is exactly its row.
"""
import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _fixtures():
    return json.loads((ROOT / 'Plans/small_owner_event_fixtures.json').read_text())


def run_all(dm):
    fixtures = _fixtures()
    rows = {r['event_type']: r for r in fixtures['families']}
    done = []

    def witness(label, phase, row, call):
        before = len(dm.RECORDER)
        call()
        hits = [first for p, _, first in dm.RECORDER[before:] if p == phase]
        assert hits and hits[-1] is not None and hits[-1][0] == row, (label, phase, row, hits[-1] if hits else None)
        done.append(label)

    # WR09: one witness fact changed inside an otherwise valid original.
    r0 = rows['format.applied']
    bad_original = copy.deepcopy(r0['original_operation'])
    bad_original['producer_witness'] = dict(bad_original['producer_witness'], formatter_exit_code=9)
    witness('WR09-producer-witness', 'writer', 'WR09_producer_witness',
            lambda: dm.valid_event(r0, copy.deepcopy(r0['positive_event_record']), bad_original))

    # WR10: LSP payload with no state change; result copy, identity and key move.
    lsp = rows['lsp.server.lifecycle_changed']
    event = copy.deepcopy(lsp['positive_event_record'])
    original = copy.deepcopy(lsp['original_operation'])
    event['payload'] = dict(event['payload'], state=event['payload']['previous_state'])
    original['result_payload'] = copy.deepcopy(event['payload'])
    identity = dm.digest(lsp['event_type'], original['storage_instance_id'], event['payload'])
    event['event_id'] = 'evt_' + identity
    event['idempotency_key'] = (dm.application_key(original['server_id'], original['operation_id'])
                                if event['scope_kind'] == 'application' else lsp['event_type'] + ':' + identity)
    witness('WR10-semantic', 'writer', 'WR10_semantic', lambda: dm.valid_event(lsp, event, original))

    # WR14: payload time changed; result copy, identity and key move with it.
    event14 = copy.deepcopy(r0['positive_event_record'])
    original14 = copy.deepcopy(r0['original_operation'])
    event14['payload'] = dict(event14['payload'], timestamp='2026-11-04T12:01:00Z')
    original14['result_payload'] = copy.deepcopy(event14['payload'])
    identity14 = dm.digest(r0['event_type'], original14['storage_instance_id'], event14['payload'])
    event14['event_id'] = 'evt_' + identity14
    event14['idempotency_key'] = (dm.application_key(original14['server_id'], original14['operation_id'])
                                  if event14['scope_kind'] == 'application' else r0['event_type'] + ':' + identity14)
    witness('WR14-time-payload', 'writer', 'WR14_time_payload',
            lambda: dm.valid_event(r0, event14, original14))

    # PB01/PB02: delivery flags as integers, not booleans.
    for field, row in (('receipt_delivery', 'PB01_receipt_delivery_bool'),
                       ('terminal_delivery', 'PB02_terminal_delivery_bool')):
        state = copy.deepcopy(r0['publication_positive'])
        state[field] = 1 if field == 'receipt_delivery' else 0
        witness(row, 'publication', row, lambda state=state: dm.publication(r0, state))

    # PL11/PL14 through a coherent external (SP-337) boundary state.
    ext_row = rows['model.catalog_refreshed']
    schema = json.loads((ROOT / ext_row['schema']).read_text())
    external_case = next(c for c in ext_row['payload_boundary_cases'] if c['valid'] and c['mode'] != 'inline')
    base = dm.boundary_state(ext_row, external_case)
    storage = copy.deepcopy(base['original_operation']['payload_storage'])
    big_list = ['ref:%03d:%s' % (i, 'x' * 90) for i in range(220)]
    storage['body'] = big_list
    storage['descriptor'] = dm.payload_descriptor(big_list)
    ext_event = dict(base['event'], payload_ref=dm.payload_reference(storage['descriptor']))
    witness('PL11-storage-body-type', 'payload', 'PL11_storage_body_type',
            lambda: dm.resolved_payload(ext_event, schema, storage))
    storage2 = copy.deepcopy(base['original_operation']['payload_storage'])
    storage2['descriptor'] = dict(storage2['descriptor'], byte_size=float(storage2['descriptor']['byte_size']))
    witness('PL14-descriptor-integer', 'payload', 'PL14_descriptor_integer',
            lambda: dm.resolved_payload(base['event'], schema, storage2))

    # FV03: requested full-value preimage outside the physical codec range.
    authority = copy.deepcopy(r0['receipt_authority'])
    requested = dict(copy.deepcopy(r0['positive_event_record']), sequence_id=2**70)
    witness('FV03-preimage', 'fullvalue', 'FV03_preimage_ok',
            lambda: dm.resolve_full_value(r0, requested, authority))

    # FV05: stored copy changed after commitment; requested copy unchanged.
    authority2 = copy.deepcopy(r0['receipt_authority'])
    requested2 = copy.deepcopy(authority2['stored_event'])
    authority2['stored_event'] = dict(authority2['stored_event'], observed_at_utc='2026-11-04T12:01:00Z')
    witness('FV05-commitment-stored', 'fullvalue', 'FV05_commitment_stored',
            lambda: dm.resolve_full_value(r0, requested2, authority2))

    # PL01/PL02: float leaves are outside the DM codec subset, inline and stored.
    inline_event = dict(copy.deepcopy(r0['positive_event_record']))
    inline_event['payload'] = dict(inline_event['payload'], diff_bytes=1.5) if 'diff_bytes' in inline_event['payload'] else dict(inline_event['payload'])
    _first = next(iter(inline_event['payload']))
    inline_event['payload'][_first] = 1.5
    schema0 = json.loads((ROOT / r0['schema']).read_text())
    witness('PL01-body-codec', 'payload', 'PL01_body_codec',
            lambda: dm.resolved_payload(inline_event, schema0, None))
    storage3 = copy.deepcopy(base['original_operation']['payload_storage'])
    _k = next(k for k, v in storage3['body'].items() if isinstance(v, list) and v)
    storage3['body'] = dict(storage3['body'], **{_k: [1.5] + list(storage3['body'][_k][1:])})
    witness('PL02-storage-body-codec', 'payload', 'PL02_storage_body_codec',
            lambda: dm.resolved_payload(base['event'], schema, storage3))

    # FV01: a float Storage-sequence spelling on the requested copy only.
    requested3 = dict(copy.deepcopy(r0['positive_event_record']), sequence_id=1.0)
    witness('FV01-requested-integer', 'fullvalue', 'FV01_requested_integer',
            lambda: dm.resolve_full_value(r0, requested3, copy.deepcopy(r0['receipt_authority'])))

    # CP01-CP03: float checkpoint frontier; foreign durable/selected tokens.
    rebuild = r0['rebuild_positive']
    state1 = copy.deepcopy(rebuild)
    state1['new_checkpoint'] = dict(state1['new_checkpoint'], frontier_revision=1.0)
    witness('CP01-checkpoint-integer', 'checkpoint', 'CP01_checkpoint_integer',
            lambda: dm.checkpoint_matches_original(state1))
    state2 = copy.deepcopy(rebuild)
    foreign = dict(state2['new_checkpoint']['durable_read_token'], storage_instance_id='store-foreign',
                   checkpoint_key='event_record_index_checkpoint.v1:store-foreign')
    foreign['source_selection'] = dict(foreign['source_selection'], storage_instance_id='store-foreign')
    state2['new_checkpoint'] = dict(state2['new_checkpoint'], durable_read_token=foreign)
    witness('CP02-durable-token', 'checkpoint', 'CP02_durable_token',
            lambda: dm.checkpoint_matches_original(state2))
    state3 = copy.deepcopy(rebuild)
    foreign_live = dict(state3['selected_live_token'], storage_instance_id='store-foreign',
                        checkpoint_key='event_record_index_checkpoint.v1:store-foreign')
    foreign_live['source_selection'] = dict(foreign_live['source_selection'], storage_instance_id='store-foreign')
    state3['selected_live_token'] = foreign_live
    witness('CP03-selected-token', 'checkpoint', 'CP03_selected_token',
            lambda: dm.checkpoint_matches_original(state3))

    # PB04: replay-only current append, refused before the writer phase outcome.
    state4 = copy.deepcopy(r0['publication_positive'])
    state4['event'] = dict(state4['event'], replay_policy='projector_replay_only')
    witness('PB04-append-policy', 'publication', 'PB04_append_policy',
            lambda: dm.publication(r0, state4))

    # RD01: a float leaf in the reader state (retained authority copy).
    state5 = copy.deepcopy(r0['reader_positive'])
    state5['event'] = dict(state5['event'], sequence_id=1.0)
    witness('RD01-state-integer', 'reader', 'RD01_state_integer',
            lambda: dm.reader_result(r0, state5))

    # RT04/RT08: replay-only current retry; float producer alias on retry.
    incoming_rt = dict(copy.deepcopy(r0['positive_event_record']), replay_policy='projector_replay_only')
    witness('RT04-not-replay-only', 'retry', 'RT04_not_replay_only',
            lambda: dm.current_retry(r0, incoming_rt, copy.deepcopy(r0['receipt_authority'])))
    incoming_rt8 = dict(copy.deepcopy(r0['positive_event_record']), producer_sequence_id=1.0)
    witness('RT08-producer-integer', 'retry', 'RT08_producer_integer',
            lambda: dm.current_retry(r0, incoming_rt8, copy.deepcopy(r0['receipt_authority'])))

    # RS03: float leaf in an authority observation no join reads typed-ly.
    authority3 = copy.deepcopy(r0['receipt_authority'])
    authority3['source_selection'] = dict(authority3['source_selection'], recovery_epoch=0.0)
    witness('RS03-authority-integer', 'resolve', 'RS03_authority_integer',
            lambda: dm.resolve_original(r0, copy.deepcopy(r0['positive_event_record']), authority3))

    # RS14: foreign incoming event id (outside the producer digest).
    incoming14 = dict(copy.deepcopy(r0['positive_event_record']), event_id='evt_foreign')
    witness('RS14-incoming-event', 'resolve', 'RS14_incoming_event',
            lambda: dm.resolve_original(r0, incoming14, copy.deepcopy(r0['receipt_authority'])))

    # RE01: retained event with an envelope extension key only.
    reader_pos = r0['reader_positive']
    bad_event = dict(copy.deepcopy(reader_pos['event']), unexpected='x')
    witness('RE01-envelope-schema', 'retained', 'RE01_envelope_schema',
            lambda: dm.retained_event_valid(r0, bad_event, copy.deepcopy(reader_pos['retained_authority']), reader_pos['live_token']))

    # RB01: a float leaf in the rebuild state.
    state6 = copy.deepcopy(r0['rebuild_positive'])
    state6['event'] = dict(state6['event'], sequence_id=1.0)
    witness('RB01-state-integer', 'rebuild', 'RB01_state_integer',
            lambda: dm.rebuild_publication(r0, state6))

    # RP01: wrong-type original digest.
    witness('RP01-original-digest-str', 'replay', 'RP01_original_digest_str',
            lambda: dm.replay_decision(1, 'a', 'r'))

    # RF01 / RF02 / RP02: wrong-type operands.
    witness('RF01-current-str', 'readfence', 'RF01_current_str',
            lambda: dm.read_allowed(1, 'c', True, True, False, '1.0.0'))
    witness('RF02-selected-str', 'readfence', 'RF02_selected_str',
            lambda: dm.read_allowed('c', 1, True, True, False, '1.0.0'))
    witness('RP02-retry-digest-str', 'replay', 'RP02_retry_digest_str',
            lambda: dm.replay_decision('a', 1, 'r'))

    # WR26: one Storage clock changed to an offset the event_record profile accepts.
    state_w = dm.timestamp_state(r0, '2026-11-04T12:00:00+01:00', 'observed_at_utc')
    witness('WR26-storage-clocks', 'writer', 'WR26_storage_clocks',
            lambda: dm.valid_event(r0, state_w['event'], state_w['original_operation']))

    # RS22: retained stored clock, with a request profile the resolver ignores.
    authority_s = copy.deepcopy(state_w['committed_authority'])
    authority_s['datetime_profile'] = 'event_record'
    witness('RS22-storage-clocks', 'resolve', 'RS22_storage_clocks',
            lambda: dm.resolve_original(r0, copy.deepcopy(authority_s['stored_event']), authority_s))

    # RS23 (E5-2 = A, 2026-11-13): acknowledged_at_utc takes the EventRecord profile, which RS01 already enforces
    # through custody_v2 with format_checker(EVENT_RECORD); RS23 has no single-row witness (entailed by RS01).
    # The same invalid value (hour 24; both receipt copies move together) is refused first at RS01.
    authority_a = copy.deepcopy(r0['receipt_authority'])
    authority_a['stored_custody']['first_append_receipt']['acknowledged_at_utc'] = '2026-11-04T24:00:00Z'
    authority_a['first_append_receipt']['acknowledged_at_utc'] = '2026-11-04T24:00:00Z'
    witness('RS01-ack-clock-event-record', 'resolve', 'RS01_custody_schema',
            lambda: dm.resolve_original(r0, copy.deepcopy(r0['positive_event_record']), authority_a))
    return done
