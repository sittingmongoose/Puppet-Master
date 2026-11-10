#!/usr/bin/env python3
"""DCH round-5 acceptance witnesses, reused by ordinary and guard checkers.

These construct independent Storage observations from accepted fixture sources.
No acceptance result is inferred from the model under test. A deliberate source
edition mutation commits to those exact bytes; a forged-source case does not.
"""
import copy
from dataclasses import dataclass
from pm_event_numbers import Refusal, loads_current_json
import hashlib
import json
from pathlib import Path
from jsonschema import Draft202012Validator
from pm_dch_formats import validator as current_validator

ROOT = Path(__file__).resolve().parents[1]

@dataclass
class Case:
    name: str
    surface: str
    args: tuple
    expected: object = False

def commitment(m, record):
    return hashlib.sha256(m.body_bytes(record)).hexdigest()

def reference_storage(m, value, source, row, key):
    result = copy.deepcopy(source)
    result['checkpoint_storage'] = {
        'pointer': {'payload_ref': m.payload_reference(value)},
        'pack': {'body': copy.deepcopy(value),
                 'key': m.payload_reference(value).rsplit(':', 2)[0],
                 'byte_size': len(m.body_bytes(value)), 'media_type': 'application/msgpack',
                 'storage_instance_id': source['storage_instance_id'], 'domain_key': key,
                 'scope_partition': value['scope_partition'], 'event_type': row['event_type'],
                 'authorized': True, 'hold_access_allowed': True, 'deleted': False,
                 'bytes_durable': True, 'index_durable': True, 'readback_verified': True}}
    return result

def checkpoint_source(m, c, f, row, store, reference=False, compatibility=False):
    value, source = copy.deepcopy(c['valid']), copy.deepcopy(c['source'])
    old_store = source['storage_instance_id']
    def remap(v):
        if type(v) is dict: return {k: remap(w) for k, w in v.items()}
        if type(v) is list: return [remap(w) for w in v]
        if type(v) is str: return v.replace(old_store, store)
        return v
    value, source = remap(value), remap(source)
    event = copy.deepcopy(f['record'])
    body = copy.deepcopy(f['valid'])
    event['event_id'] = m.identity(row['event_type'], body, store)
    event['idempotency_key'] = m.idempotency_key(row['event_type'], body, store)
    if reference:
        transport = next(o for o in f['transport_oracles'] if o['name'] == 'authorized_payload_reference')
        event['payload'] = {}
        event['payload_ref'] = transport['record']['payload_ref']
        source['payload_source'] = copy.deepcopy(transport['source'])
        source['payload_source']['storage_instance_id'] = store
    if compatibility: event['replay_policy'] = 'projector_replay_only'
    source['event_record'] = event
    source['event_access'] = {k: copy.deepcopy(v) for k, v in f['historical_source'].items()
                              if k not in ['source_value_sha256', 'storage_instance_id']}
    source['event_access']['live_state'] = {'thread_state': 'deleted', 'revision': 99, 'worktree_binding': 'later'}
    source['index_row'].update(event_id=event['event_id'], sequence_id=event['sequence_id'],
                               scope_partition=body['scope']['scope_partition'],
                               source_value_sha256=commitment(m, event))
    value.update(scope_partition=body['scope']['scope_partition'], last_event_id=event['event_id'],
                 last_sequence_id=event['sequence_id'])
    source['publication'].update(scope=body['scope'], thread_id=body['thread_id'], computer_id=body['computer_id'])
    key = row['domain_checkpoint_key'].format(storage_instance_id=store, scope_partition=value['scope_partition'])
    return value, source, key

def sized_checkpoint(m, base, size):
    value = copy.deepcopy(base)
    value['projection_refs'] = ['pmref:fixture:boundary:'+str(i)+':' for i in range(32)]
    assert len(m.body_bytes(value)) < size
    for index, prefix in enumerate(list(value['projection_refs'])):
        lo, hi = len(prefix), 512
        while lo < hi:
            mid = (lo+hi+1)//2
            value['projection_refs'][index] = prefix + 'x'*(mid-len(prefix))
            if len(m.body_bytes(value)) <= size: lo = mid
            else: hi = mid-1
        value['projection_refs'][index] = prefix + 'x'*(lo-len(prefix))
    assert len(m.body_bytes(value)) == size
    return value

def cases(m, Case=Case):
    fs = json.loads((ROOT/'Plans/dch_event_contract_fixtures.json').read_text())
    cs = json.loads((ROOT/'Plans/dch_checkpoint_fixtures.json').read_text())
    rows = json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']
    if getattr(m, 'SELECTED_FAMILY', None):
        rows = [r for r in rows if r['event_type'] == m.SELECTED_FAMILY]
    result = []
    def add(name, surface, *args, expected=False):
        result.append(Case(name, surface, tuple(copy.deepcopy(args)), expected))
    for row in rows:
        event = row['event_type']
        c = next(c for c in cs if c['event_type'] == event)
        schema = json.loads((ROOT/c['schema_ref'].split('#')[0]).read_text())
        payload_schema = json.loads((ROOT/row['payload_schema_ref']).read_text())
        for f in [f for f in fs if f['event_type'] == event]:
            prefix = event+'/'+f['edition']+'/round5/'
            for store in [m.STORAGE_INSTANCE, '00000000-0000-4000-8000-000000000002']:
                for ref in [False, True]:
                    for compatibility in [False, True]:
                        label = prefix+store[-4:]+'/'+('ref' if ref else 'inline')+'/'+('compat' if compatibility else 'ordinary')
                        value, source, key = checkpoint_source(m, c, f, row, store, ref, compatibility)
                        record = source['event_record']
                        witness = {**source['event_access'], 'storage_instance_id': store,
                                   'source_value_sha256': source['index_row']['source_value_sha256'],
                                   'payload_source': source.get('payload_source')}
                        add(label+'/checkpoint_positive', 'checkpoint', value, source, row, key, schema, expected=True)
                        add(label+'/history_positive', 'history', record, row, witness, payload_schema, expected=True)
                        foreign = copy.deepcopy(source)
                        foreign_store = m.STORAGE_INSTANCE if store != m.STORAGE_INSTANCE else '00000000-0000-4000-8000-000000000099'
                        foreign['event_record']['event_id'] = m.identity(event, f['valid'], foreign_store)
                        value2 = {**value, 'last_event_id': foreign['event_record']['event_id']}
                        foreign['index_row']['event_id'] = value2['last_event_id']
                        foreign['index_row']['source_value_sha256'] = commitment(m, foreign['event_record'])
                        add(label+'/foreign_identity', 'checkpoint', value2, foreign, row, key, schema)
                        foreign_witness = {**witness, 'source_value_sha256': foreign['index_row']['source_value_sha256']}
                        add(label+'/history_foreign_identity', 'history', foreign['event_record'], row, foreign_witness, payload_schema)
                        for field in ['schema_version', 'envelope_version', 'forged_bytes', 'event_withdrawn', 'authorized', 'retained', 'hold_access_allowed', 'deleted']:
                            bad = copy.deepcopy(source)
                            if field in ['schema_version', 'envelope_version']:
                                if field == 'envelope_version': bad['event_record']['schema_version'] = '9.0.0'
                                elif ref:
                                    bad['payload_source']['body']['schema_version'] = '9.0.0'
                                    body = bad['payload_source']['body']
                                    bad['payload_source'].update(key='payload:v1:'+m.blake3.blake3(m.body_bytes(body)).hexdigest(), byte_size=len(m.body_bytes(body)))
                                    bad['event_record']['payload_ref'] = m.payload_reference(body)
                                else: bad['event_record']['payload']['schema_version'] = '9.0.0'
                                bad['index_row']['source_value_sha256'] = commitment(m, bad['event_record'])
                            elif field == 'forged_bytes':
                                bad['event_record']['observed_at_utc'] = '2026-11-04T00:00:09Z'
                            else: bad['event_access'][field] = field in ['event_withdrawn', 'deleted']
                            add(label+'/'+field, 'checkpoint', value, bad, row, key, schema)
            # SP-1100: the physical codec preserves the float type, width and
            # sign, so 1.0 and 1e0 never share the bytes of 1. The exact integer
            # input boundary refuses every non-integer spelling (numeric_history,
            # payload_numeric_type), so no alternate spelling reaches a commitment.
            for raw in ['1', '1.0', '1e0', '-0', '0']:
                number = json.loads(raw)
                add(prefix+'numeric_bytes/'+raw, 'numeric_bytes', number, expected=type(number) is int)
                record = copy.deepcopy(f['record']); record['sequence_id'] = number
                witness = copy.deepcopy(f['historical_source'])
                witness['source_value_sha256'] = commitment(m, record)
                add(prefix+'numeric_history/'+raw, 'history', record, row, witness, payload_schema,
                    expected=type(number) is int)
            add(prefix+'invalid_lexeme_refused/01', 'invalid_lexeme_refused', '01', expected=True)
            for wrong in ['false', '0', None, [], {'nested': 'object'}, 0, 1]:
                add(prefix+'dedupe_flag_type/'+json.dumps(wrong), 'retry', f['record'], f['record'], wrong,
                    expected='invalid_input_type')
            for wrong in ['false', '0', None, [], {'nested': 'object'}]:
                tag = json.dumps(wrong, sort_keys=True)
                record = copy.deepcopy(f['record']); record['payload'] = wrong
                if type(wrong) is dict:
                    record['payload'] = {**copy.deepcopy(f['valid']), 'operation_id': wrong}
                if wrong is None:
                    # None is also the materializer's unavailable sentinel.
                    # Prove the exact type predicate directly, and separately
                    # retain the end-to-end refusal as a positive control.
                    add(prefix+'payload_type/'+tag, 'types', {'record': record})
                    add(prefix+'null_payload_unavailable', 'null_payload_unavailable', record, expected=True)
                else: add(prefix+'payload_type/'+tag, 'resolve', record, None)
            for slot in ['authorized', 'hold_access_allowed', 'deleted', 'retained', 'event_withdrawn']:
                for wrong in ['false', '0', None, [], {'nested': 'object'}]:
                    witness = copy.deepcopy(f['historical_source']); witness[slot] = wrong
                    add(prefix+'access_type/'+slot+'/'+json.dumps(wrong), 'history', f['record'], row, witness, payload_schema)
            reference = next(o for o in f['transport_oracles'] if o['name'] == 'authorized_payload_reference')
            for slot in ['authorized', 'hold_access_allowed', 'deleted', 'bytes_durable', 'index_durable', 'readback_verified']:
                for wrong in ['false', '0', None, [], {'nested': 'object'}, 0, 1]:
                    source = copy.deepcopy(reference['source']); source[slot] = wrong
                    add(prefix+'payload_pack_type/'+slot+'/'+json.dumps(wrong), 'resolve', reference['record'], source)
            if 'archive_source' in f:
                for section, slot in [('request','permission_allowed'),('request','thread_selected'),
                                      ('before','active_run'),('after','readback_available')]:
                    for wrong in ['false', '0', None, [], {'nested': 'object'}, 0, 1]:
                        source = copy.deepcopy(f['archive_source']); source[section][slot] = wrong
                        add(prefix+'archive_type/'+section+'/'+slot+'/'+json.dumps(wrong), 'archive',
                            f['valid'], source, payload_schema)
            for field, number in f['valid'].items():
                if type(number) is not int: continue
                alternative = copy.deepcopy(f['valid']); alternative[field] = float(number)
                add(prefix+'payload_numeric_bytes/'+field, 'distinct_bytes_same_identity', f['valid'], alternative, expected=True)
                add(prefix+'payload_numeric_type/'+field, 'types', alternative)
                retry = copy.deepcopy(f['record']); retry['payload'] = alternative
                add(prefix+'payload_numeric_retry/'+field, 'retry', f['record'], retry, True, expected='invalid_input_type')
            # Independent Storage numeric slots can compare equal to bool or
            # float; exact type checking must still refuse those observations.
            for wrong in ['1', '0', True, None, [], {'nested': 1}, 1.0]:
                add(prefix+'integer_type/'+json.dumps(wrong), 'types', {'revision': wrong})
        prefix = event+'/checkpoint/round5/'
        for size in [m.INLINE_LIMIT, m.INLINE_LIMIT+1]:
            value = sized_checkpoint(m, c['maximum_history'], size)
            source = copy.deepcopy(c['source']); source['publication']['projection_refs'] = value['projection_refs']
            add(prefix+'inline_size/'+str(size), 'checkpoint', value, source, row, c['key'], schema, expected=size<=m.INLINE_LIMIT)
            referenced = reference_storage(m, value, source, row, c['key'])
            add(prefix+'referenced_size/'+str(size), 'checkpoint', value, referenced, row, c['key'], schema, expected=True)
        value = copy.deepcopy(c['maximum_history'])
        for section in [value, *value['history']]:
            section['projection_refs'] = [('pmref:fixture:maximum:'+str(i)+':').ljust(512, 'x') for i in range(64)]
        source = copy.deepcopy(c['source']); source['publication']['projection_refs'] = value['projection_refs']
        add(prefix+'maximum_arrays_inline', 'checkpoint', value, source, row, c['key'], schema)
        referenced = reference_storage(m, value, source, row, c['key'])
        add(prefix+'maximum_arrays_reference', 'checkpoint', value, referenced, row, c['key'], schema, expected=True)
        for slot in ['authorized', 'hold_access_allowed', 'deleted', 'bytes_durable', 'index_durable', 'readback_verified']:
            for wrong in ['false', '0', None, [], {'nested': 'object'}, 0, 1]:
                bad = copy.deepcopy(referenced); bad['checkpoint_storage']['pack'][slot] = wrong
                add(prefix+'checkpoint_pack_type/'+slot+'/'+json.dumps(wrong), 'checkpoint', value, bad, row, c['key'], schema)
        for wrong in [True, 1.0]:
            bad = copy.deepcopy(c['source']); bad['publication']['revision'] = wrong
            add(prefix+'publication_revision_type/'+json.dumps(wrong), 'checkpoint', c['valid'], bad, row, c['key'], schema)
        for field, wrong in [('key','payload:v1:'+'c'*64), ('byte_size', len(m.body_bytes(value))+1),
                             ('media_type','application/json'), ('storage_instance_id','00000000-0000-4000-8000-000000000099'),
                             ('domain_key','other'), ('scope_partition','other'), ('event_type','chat.unrelated'),
                             ('authorized',False), ('hold_access_allowed',False), ('deleted',True),
                             ('bytes_durable',False), ('index_durable',False), ('readback_verified',False)]:
            bad = copy.deepcopy(referenced); bad['checkpoint_storage']['pack'][field] = wrong
            add(prefix+'reference/'+field, 'checkpoint', value, bad, row, c['key'], schema)
        bad = copy.deepcopy(referenced); bad['checkpoint_storage']['pack']['body']['publication_id'] = 'other'
        add(prefix+'reference/body', 'checkpoint', value, bad, row, c['key'], schema)
        bad = copy.deepcopy(referenced)
        exact = m.payload_reference(value)
        bad['checkpoint_storage']['pointer']['payload_ref'] = exact[:11] + ('0' if exact[11] != '0' else '1') + exact[12:]
        assert len(m.body_bytes(bad['checkpoint_storage']['pointer'])) <= m.INLINE_LIMIT
        add(prefix+'reference/pointer', 'checkpoint', value, bad, row, c['key'], schema)
        # An exact pointer has a fixed digest/media type and bounded decimal
        # length (round8 proves the uint64 bound). Oversize + wrong reference
        # is two defects, not a size witness and not a duplicate predicate.
        add(prefix+'reference/exact_pointer_encoded_bound', 'pointer_size',
            referenced['checkpoint_storage']['pointer'], expected=True)
    return result

def evaluate(m, c, envelope):
    a, surface = c.args, c.surface
    validator = lambda schema: current_validator(schema)
    if surface == 'history': return m.historical_read_valid(a[0], a[1], a[2], envelope, validator(a[3]))
    if surface == 'checkpoint': return validator(a[4]).is_valid(a[0]) and m.checkpoint_joins(*a[:4])
    if surface == 'resolve': return m.resolve_body(*a) is not None
    if surface == 'null_payload_unavailable': return m.resolve_body(*a) is None
    if surface == 'types': return m.input_types_valid(*a)
    if surface == 'payload': return validator(a[0]).is_valid(a[1])
    if surface == 'retry': return m.retry_outcome(*a)
    if surface == 'archive': return validator(a[2]).is_valid(a[0]) and m.archive_joins(*a[:2])
    if surface == 'invalid_lexeme_refused':
        # CV-1100 current raw-input parser.
        try: loads_current_json(a[0])
        except Refusal: return True
        return False
    if surface == 'numeric_bytes': return m.body_bytes(a[0]) == m.body_bytes(int(a[0]))
    if surface == 'distinct_bytes_same_identity':
        # SP-1100 type-preserving bytes: the float alternative has its own
        # physical bytes and reference; the identity recipe reads no number.
        return (m.body_bytes(a[0]) != m.body_bytes(a[1]) and m.payload_reference(a[0]) != m.payload_reference(a[1])
                and m.identity('fixture',a[0]) == m.identity('fixture',a[1])
                and m.idempotency_key('fixture',a[0]) == m.idempotency_key('fixture',a[1]))
    if surface == 'pointer_size': return len(m.body_bytes(a[0])) <= m.INLINE_LIMIT
    raise ValueError(surface)
