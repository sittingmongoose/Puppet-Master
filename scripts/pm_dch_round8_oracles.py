#!/usr/bin/env python3
"""Round-eight DCH size/reference and owner-domain witnesses.

Primitive checkpoint admission cases exercise the same exact-type, schema and
physical-encoding boundaries as current publication. They intentionally have no
source/join observations: an out-of-domain sequence cannot have a valid stored
source commitment. Full publication positives synchronize every source copy.
"""
import copy
import hashlib
import json
import sys
from pathlib import Path
from jsonschema import Draft202012Validator
from pm_dch_formats import FormatChecker
from pm_dch_round5_oracles import Case, checkpoint_source, reference_storage, evaluate as evaluate5
from pm_dch_round6_oracles import integer_paths, replaced

ROOT = Path(__file__).resolve().parents[1]
POSITIVE = [('2^53', 1 << 53), ('2^60', 1 << 60), ('2^64-1', (1 << 64)-1)]
NEGATIVE = [('2^64', 1 << 64), ('-1', -1), ('false', False), ('true', True),
            ('1.0', 1.0), ('string', '1')]


def checkpoint_admission(m, value, schema):
    """The production pre-join type/schema and physical pack boundaries."""
    if not m.input_types_valid(value) or not Draft202012Validator(schema, format_checker=FormatChecker()).is_valid(value):
        return False
    try:
        m.body_bytes(value)
    except ValueError:
        return False
    return True


def coherent_checkpoint(m, c, f, row, path, number):
    value, source, key = checkpoint_source(m, c, f, row, m.STORAGE_INSTANCE)
    # Include two real retained generations, then change exactly one logical fact.
    value['history'] = copy.deepcopy(c['maximum_history']['history'])
    value = replaced(value, path, number)
    if path == ('revision',):
        source['publication']['revision'] = number
    elif path == ('last_sequence_id',):
        source['event_record']['sequence_id'] = source['index_row']['sequence_id'] = number
        source['index_row']['source_value_sha256'] = hashlib.sha256(m.body_bytes(source['event_record'])).hexdigest()
    elif path[:1] == ('source_token',):
        source['publication']['source_token'] = copy.deepcopy(value['source_token'])
        node = source['checkpoint']['generations'][value['source_token']['generation_id']]
        if path == ('source_token', 'frontier_revision'):
            node['frontier_revision'] = number
        else:
            node['source_selection'] = copy.deepcopy(value['source_token']['source_selection'])
            source['current_source_selection'] = copy.deepcopy(value['source_token']['source_selection'])
    return value, source, key


def cases(m, Case=Case):
    rows = json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']
    fs = json.loads((ROOT/'Plans/dch_event_contract_fixtures.json').read_text())
    cs = json.loads((ROOT/'Plans/dch_checkpoint_fixtures.json').read_text())
    out = []
    def add(name, surface, *args, expected=False):
        out.append(Case(name, surface, tuple(copy.deepcopy(args)), expected))
    for row in rows:
        event = row['event_type']
        if m.SELECTED_FAMILY and event != m.SELECTED_FAMILY:
            continue
        fixtures = [f for f in fs if f['event_type'] == event]
        c = next(c for c in cs if c['event_type'] == event)
        schema = json.loads((ROOT/c['schema_ref'].split('#')[0]).read_text())
        for f in fixtures:
            prefix = event+'/'+f['edition']+'/round8/'
            for name, number in POSITIVE+NEGATIVE:
                valid = (name, number) in POSITIVE
                record = {**copy.deepcopy(f['record']), 'sequence_id': number}
                add(prefix+'write/sequence_id/'+name, 'write', record, row, expected=valid)
                # Only the incoming Storage sequence changes; it is excluded
                # from the semantic digest. No stale source/hash copy is supplied.
                add(prefix+'retry/sequence_id/'+name, 'retry', f['record'], record, True,
                    expected='original_result' if valid else 'invalid_input_type')
        prefix = event+'/checkpoint/round8/'
        for path, original in integer_paths(c['maximum_history']):
            field = '/'.join(map(str, path))
            for name, number in POSITIVE+NEGATIVE:
                valid = (name, number) in POSITIVE
                value = replaced(c['maximum_history'], path, number)
                # Check every current/history field independently on both write
                # and repeated-write admission. Range/type negatives do not carry
                # unrelated source equality or stale commitment defects.
                for operation in ['write', 'retry']:
                    add(prefix+operation+'/'+field+'/'+name, 'checkpoint_admission', value, schema, expected=valid)
                if valid:
                    for f in fixtures:
                        v,s,key = coherent_checkpoint(m,c,f,row,path,number)
                        add(prefix+'publication/'+f['edition']+'/'+field+'/'+name,
                            'checkpoint', v,s,row,key,schema,expected=True)
        # byte_size is a Storage observation, not a producer/JCS input. A pack
        # cannot be allocated at these sizes for a test; validate its exact field
        # boundary separately, without inventing mismatching body bytes.
        for name, number in POSITIVE+NEGATIVE:
            for operation in ['write', 'retry']:
                add(prefix+operation+'/pack/byte_size/'+name, 'types', {'byte_size': number},
                    expected=(name,number) in POSITIVE)
        # A containment control, not a guard-isolation negative: unsupported
        # physical bytes have no possible valid source commitment. The existing
        # valid original provenance must still yield a structured refusal, never
        # an encoder exception escaping before its refusal handler.
        source = copy.deepcopy(c['source'])
        source['checkpoint_access'] = {
            'storage_instance_id': source['storage_instance_id'],
            'source_value_sha256': hashlib.sha256(m.body_bytes(c['valid'])).hexdigest()}
        add(prefix+'overflow_with_provenance_is_contained', 'overflow_containment',
            c['valid'], source, row, c['key'], expected=True)
        # Exact SP-337 strings cannot violate this defensive bound. The largest
        # canonical uint64 decimal is 20 digits. Python's maximum materializable
        # bytes length (sys.maxsize) is even smaller on this runtime.
        pointer = {'payload_ref': 'payload:v1:'+'f'*64+':'+str((1<<64)-1)+':application/msgpack'}
        add(prefix+'exact_pointer_uint64_bound', 'pointer_bound', pointer, expected=True)
        add(prefix+'exact_pointer_runtime_bound', 'pointer_bound',
            {'payload_ref':'payload:v1:'+'f'*64+':'+str(sys.maxsize)+':application/msgpack'}, expected=True)
    return out


def evaluate(m,c,envelope):
    if c.surface == 'write':
        record,row = c.args
        schema = json.loads((ROOT/row['payload_schema_ref']).read_text())
        return (envelope.is_valid(record)
                and Draft202012Validator(schema,format_checker=FormatChecker()).is_valid(record['payload'])
                and m.joins(record,row['event_type']))
    if c.surface == 'checkpoint_admission':
        return checkpoint_admission(m,*c.args)
    if c.surface == 'overflow_containment':
        value, source, row, key = c.args
        referenced = reference_storage(m, value, source, row, key)
        pointer = copy.deepcopy(referenced)
        pointer['checkpoint_storage']['pointer']['payload_ref'] = 1 << 64
        packed = copy.deepcopy(referenced)
        packed['checkpoint_storage']['pack']['body']['revision'] = 1 << 64
        try:
            return (m.checkpoint_storage_valid(value, source, row, key) is True
                    and m.checkpoint_storage_valid(value, referenced, row, key) is True
                    and m.checkpoint_storage_valid({**value, 'revision': 1 << 64}, source, row, key) is False
                    and m.checkpoint_storage_valid(value, pointer, row, key) is False
                    and m.checkpoint_storage_valid(value, packed, row, key) is False)
        except (ValueError, OverflowError):
            # An escaping encoder error fails this property; it never counts
            # as a successful rejection of the candidate.
            return False
    if c.surface == 'pointer_bound':
        return len(m.body_bytes(c.args[0])) <= m.INLINE_LIMIT
    return evaluate5(m,c,envelope)
