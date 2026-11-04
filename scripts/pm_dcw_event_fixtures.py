#!/usr/bin/env python3
"""Synthetic original-custody builders for DCW byte-boundary oracles only."""
import base64
import copy
import hashlib
import json
import msgpack

from blake3 import blake3

import pm_dcw_event_oracles as m


def replace(value, substitutions):
    if isinstance(value, dict):
        return {substitutions.get(k, k): replace(v, substitutions) for k, v in value.items()}
    if isinstance(value, list):
        return [replace(v, substitutions) for v in value]
    return substitutions.get(value, value) if isinstance(value, str) else value


def event_slots(scenario):
    source = scenario['source']
    slots = list(source['phases']) if 'phases' in source else [source]
    if 'opened_source' in scenario['authority']:
        opened = scenario['authority']['opened_source']
        if opened['prepared_event']['event_id'] not in {s['prepared_event']['event_id'] for s in slots}:
            slots.append(opened)
    return slots


def source_reference(row, scenario):
    source = scenario['source']
    raw = m.canonical_msgpack(source)
    payload_id = blake3(raw).hexdigest()
    scenario['stored_source'] = {k: source[k] for k in
                                ('schema_id', 'schema_version', 'storage_instance_id', 'recovery_epoch', 'value_revision')}
    scenario['stored_source'].update(source_key=copy.deepcopy(scenario['source_key']), source_payload_ref=dict(
        blake3=payload_id, byte_size=len(raw),
        media_type='application/vnd.puppetmaster.' + row['source_family'].replace('_', '-') + '+msgpack'))
    scenario['authority'].setdefault('payloads', {})[payload_id] = dict(
        body=copy.deepcopy(source), readable=True, durable=True, index_durable=True)


def seal_originals(scenario):
    """Issue mutually consistent synthetic originals, never repair real custody."""
    authority = scenario['authority']
    for slot in event_slots(scenario):
        event = slot['prepared_event']
        custody = authority['custody'][event['event_id']]
        custody['scope_partition'] = 'project~' + base64.urlsafe_b64encode(event['project_id'].encode()).decode().rstrip('=')
        custody['producer_semantic_digest'] = m.semantic_digest(event)
        custody['original_event_value_commitment'] = m.commitment(event)
        slot['original_event_value_commitment'] = copy.deepcopy(custody['original_event_value_commitment'])
        authority['events'][event['event_id']] = copy.deepcopy(event)
    for member in authority.get('restore_admission', {}).get('members', []):
        custody = authority['custody'][member['event_id']]
        for key in ('event_id', 'scope_partition', 'event_type', 'idempotency_key', 'producer_semantic_digest'):
            member[key] = custody[key]


def refresh_restore(scenario):
    authority = scenario['authority']
    if scenario['source']['recovery_epoch'] == scenario['control']['selected_recovery_epoch']:
        return
    stored = scenario.get('stored_source', scenario['source'])
    authority['restored_sources'] = {
        m.compact_digest(scenario['source_key']): hashlib.sha256(m.canonical_msgpack(stored)).hexdigest()}
    if 'source_payload_ref' in stored:
        ref = stored['source_payload_ref']
        authority['restored_payloads'] = {ref['blake3']: {k: ref[k] for k in ('byte_size', 'media_type')}}
    authority['restored_event_payloads'] = {}
    for slot in event_slots(scenario):
        event = slot['prepared_event']
        if event['payload_ref'] is not None:
            ref = json.loads(event['payload_ref'])
            authority['restored_event_payloads'][ref['blake3']] = {k: ref[k] for k in ('byte_size', 'media_type')}


def event_size_fixture(row, scenario, target, referenced, restored=False):
    """Create a complete valid original whose logical event body is exactly target.

    Values exercise the existing schema domain, not newly issued native IDs.
    Source overflow is handled independently; the source ref never substitutes
    for the event's own payload_ref. Every mutation is applied AFTER this builder.
    """
    if restored:
        case = next(c for c in row['cases'] if c['case_id'] == 'coherent_restore_preserves_original_bytes')
        for mutation in case['mutations']:
            m.patch(scenario, mutation)
    body = copy.deepcopy(scenario['event']['payload'])
    if row['event_type'].startswith('bundle.'):
        body['annotation_ids'] = []
        while target - len(m.canonical_msgpack(body)) > 520:
            body['annotation_ids'].append('annotation:' + str(len(body['annotation_ids'])) + ':' + 'a' * 480)
        body['annotation_ids'].append('annotation:boundary:')
        for length in range(1, 513):
            body['annotation_ids'][-1] = ('annotation:boundary:' + 'b' * 512)[:length]
            if len(m.canonical_msgpack(body)) == target:
                break
        else:
            raise AssertionError(('unreachable bundle boundary', target))
        substitutions = {}
        scenario['source']['annotation_ids'] = copy.deepcopy(body['annotation_ids'])
        scenario['source']['intent']['annotation_ids'] = copy.deepcopy(body['annotation_ids'])
        intent = scenario['source']['intent']
        scenario['authority']['intents'][intent['intent_ref']] = copy.deepcopy(intent)
        for slot in event_slots(scenario):
            slot['prepared_event']['payload']['annotation_ids'] = copy.deepcopy(body['annotation_ids'])
    else:
        substitutions = {}
        fields = ('project_id thread_id planning_run_id named_plan_id thread_group_id request_id result_ref '
                  'seed_ref seed_version project_context_snapshot_ref permission_snapshot_id').split()
        for key in fields:
            old = body[key]
            largest = key + ':' + '\U0001f9f5' * 480
            body[key] = largest
            if len(m.canonical_msgpack(body)) > target:
                for n in range(481):
                    for tail in range(4):
                        body[key] = key + ':' + '\U0001f9f5' * n + 'a' * tail
                        if len(m.canonical_msgpack(body)) == target:
                            break
                    else:
                        continue
                    break
                else:
                    raise AssertionError(('unreachable Wizard boundary', target))
            substitutions[old] = body[key]
            if len(m.canonical_msgpack(body)) == target:
                break
        rebound = replace(scenario, substitutions)
        scenario.clear()
        scenario.update(rebound)
    assert len(m.canonical_msgpack(body)) == target

    # Bind the existing logical identities to the resized original evidence.
    identities = {}
    for slot in event_slots(scenario):
        event = slot['prepared_event']
        event_id, key = m.event_identity(event['payload'])
        identities[event['event_id']] = event_id
        identities[event['idempotency_key']] = key
        if event['event_type'].startswith('wizard.'):
            family = 'wizard_open_evidence' if event['event_type'] == 'wizard.opened' else 'wizard_seed_load_evidence'
            identities[event['payload']['source_ref']] = family + ':' + key.split(':')[-1]
    rebound = replace(scenario, identities)
    scenario.clear()
    scenario.update(rebound)
    if row['event_type'].startswith('wizard.'):
        payload = scenario['source']['prepared_event']['payload']
        scenario['source_key'] = [row['source_family'] + '.v1', payload['project_id'], payload['planning_run_id'], payload['request_id']]
    for slot in event_slots(scenario):
        event = slot['prepared_event']
        logical = event['payload']
        if referenced and len(m.canonical_msgpack(logical)) > 16384:
            raw = m.canonical_msgpack(logical)
            ref = dict(blake3=blake3(raw).hexdigest(), byte_size=len(raw),
                       media_type='application/vnd.puppetmaster.event.' + event['event_type'].replace('.', '-').replace('_', '-') + '+msgpack')
            scenario['authority'].setdefault('event_payloads', {})[ref['blake3']] = dict(
                body=copy.deepcopy(logical), bytes_hex=raw.hex(), readable=True, durable=True, index_durable=True)
            event['payload'] = {}
            event['payload_ref'] = json.dumps(ref, sort_keys=True, separators=(',', ':'))
    current_slot = scenario['source']['phases'][-1] if row['event_type'].startswith('bundle.') else scenario['source']
    scenario['event'] = copy.deepcopy(current_slot['prepared_event'])
    seal_originals(scenario)
    if len(m.canonical_msgpack(scenario['source'])) > 16384:
        source_reference(row, scenario)
    refresh_restore(scenario)


def event_case_fixture(row, scenario, case):
    """Apply one defect to a fully authenticated byte-boundary positive."""
    event_size_fixture(row, scenario, case['event_bytes'], case['event_representation'] == 'payload_reference',
                       case.get('event_restored', False))
    defect = case.get('event_defect')
    if not defect:
        return
    event = scenario['event']
    ref = json.loads(event['payload_ref'])
    authority = scenario['authority']
    payload = authority['event_payloads'][ref['blake3']]
    if defect == 'missing':
        del authority['event_payloads'][ref['blake3']]
    elif defect in ('unreadable', 'unsynced', 'index_unsynced'):
        payload[dict(unreadable='readable', unsynced='durable', index_unsynced='index_durable')[defect]] = False
    elif defect == 'size':
        ref['byte_size'] += 1
    elif defect == 'digest':
        old_id = ref['blake3']
        ref['blake3'] = ('0' if old_id[0] != '0' else '1') + old_id[1:]
        authority['event_payloads'][ref['blake3']] = authority['event_payloads'].pop(old_id)
    elif defect == 'media':
        ref['media_type'] = 'application/vnd.puppetmaster.event.foreign+msgpack'
    elif defect == 'LF':
        old_id = ref['blake3']
        ref['blake3'] += '\n'
        authority['event_payloads'][ref['blake3']] = authority['event_payloads'].pop(old_id)
    elif defect in ('body_schema', 'substituted', 'encoding'):
        old_id = ref['blake3']
        if defect == 'body_schema':
            payload['body']['unregistered_field'] = True
        elif defect == 'substituted':
            key = 'safe_point_id' if row['event_type'].startswith('bundle.') else 'result_ref'
            original = payload['body'][key]
            payload['body'][key] = 'forged-original' if original is None else 'f' + original[1:]
        raw = m.canonical_msgpack(payload['body'])
        if defect == 'encoding':
            # Same decoded body and size, but an explicitly noncanonical map order.
            raw = msgpack.packb(dict(reversed(sorted(payload['body'].items()))), use_bin_type=True)
            assert raw != m.canonical_msgpack(payload['body'])
            assert msgpack.unpackb(raw, raw=False) == payload['body']
        ref.update(blake3=blake3(raw).hexdigest(), byte_size=len(raw))
        payload['bytes_hex'] = raw.hex()
        authority['event_payloads'][ref['blake3']] = authority['event_payloads'].pop(old_id)
    elif defect not in ('stub', 'reference_encoding', 'inventory'):
        raise AssertionError(('unknown event defect', defect))
    slot = scenario['source']['phases'][-1] if row['event_type'].startswith('bundle.') else scenario['source']
    slot['prepared_event']['payload_ref'] = json.dumps(ref, sort_keys=True, separators=(',', ':'))
    if defect == 'reference_encoding':
        slot['prepared_event']['payload_ref'] = json.dumps(ref, sort_keys=True)
    if defect == 'stub':
        slot['prepared_event']['payload']['unregistered_field'] = True
    scenario['event'] = copy.deepcopy(slot['prepared_event'])
    seal_originals(scenario)
    if 'stored_source' in scenario:
        source_reference(row, scenario)
    refresh_restore(scenario)
    if defect == 'inventory':
        del authority['restored_event_payloads'][ref['blake3']]
