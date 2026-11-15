"""Original-specific CV-339 receipt witnesses at the complete retained boundary."""
import copy
import json

import pm_dg6b_original_custody as store
from pm_dg6b_c12_custody import snapshot
from pm_event_datetime import EVENT_RECORD, date_time
from pm_event_numbers import EVENT_VALUE, Refusal, decode_storage_value, storage_uint64, storage_value_bytes

OBSERVATIONS = []


def receipt_read(m, name, case, schema, result):
    """Writer fixture supplies both source and custody copies before a read.

    A reader never constructs or seals a receipt. The saved entry is restored
    between independent fixture worlds, including when a guard is cut.
    """
    original = case['original']
    ref = 'seglog:' + original['event_record']['event_id']
    key = store.original_binding(name, original).source_commitment
    saved = copy.deepcopy(store.ORIGINAL_CUSTODY[ref].get(key))
    try:
        store.seal_original(name, original, receipt=result)
        before = snapshot()
        try:
            return m['history_contract'](name, case, schema)
        finally:
            after = snapshot()
            assert before == after, (name, 'receipt read changed store')
            OBSERVATIONS.append(dict(family=name, before=before, after=after))
    finally:
        if saved is None:
            store.ORIGINAL_CUSTODY[ref].pop(key, None)
        else:
            store.ORIGINAL_CUSTODY[ref][key] = saved


def family_cases(m, row, schema):
    name = row['event_type']
    case = copy.deepcopy(next(c for c in row['history_cases'] if 'expected_error' not in c))
    case.pop('label', None)
    original = case['original']
    base = store.receipt_result(original)
    cases = []

    def add(label, result, accepted=False, query=None, target='RC01_full_receipt', code='receipt_schema'):
        query = case if query is None else query
        cases.append(('c12/receipt/' + label, None if accepted else target,
                      None if accepted else code,
                      lambda v=result, q=query: receipt_read(m, name, q, schema, v)))

    # E5-2: every shared date-time value at acknowledged_at_utc, independently
    # from the strict-Z EventRecord Storage clocks.
    ops = {'datetime', 'datetime_direct', 'envelope_datetime', 'inventory_datetime', 'family_datetime'}
    values = {json.dumps(c['value'], sort_keys=True): c['value']
              for c in m['load_plan']('Plans/event_number_recipe_corpus.json')['cases'] if c['op'] in ops}
    for index, value in enumerate(values.values()):
        result = copy.deepcopy(base)
        result['first_append_receipt']['acknowledged_at_utc'] = value
        try:
            date_time(value, profile=EVENT_RECORD)
            valid = True
        except Refusal:
            valid = False
        add('acknowledged_at_utc/' + str(index), result, valid)
    # Complete physical uint64 domain at every actual receipt slot. Out-of-
    # codec integers are tested before issuance by the shared helper; they
    # cannot be manufactured as a retained EVENT_VALUE original.
    numbers = [0, 1, 2**53, 2**53 + 1, 2**64 - 1, -1, -2**63, True, False,
               0.0, -0.0, 1.0, 7.0, 1.5, '1', None, [], {}]
    for field_index, field in enumerate(('sequence_id', 'segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation'), 1):
        for index, value in enumerate(numbers):
            query = copy.deepcopy(case)
            try:
                storage_uint64(value)
                valid = True
            except Refusal:
                valid = False
            if valid and field == 'sequence_id':
                query['original']['event_record']['sequence_id'] = value
                query['storage_record']['event_record_bytes_hex'] = storage_value_bytes(
                    query['original']['event_record'], profile=EVENT_VALUE).hex()
            result = store.receipt_result(query['original'])
            result['first_append_receipt'][field] = value
            float_integer = type(value) is float and value.is_integer()
            add('uint64/' + field + '/' + str(index), result, valid, query=query,
                target='RN0' + str(field_index) + '_' + field if float_integer else 'RC01_full_receipt',
                code='receipt_number_domain' if float_integer else 'receipt_schema')
    # Both copies can be schema-valid and still describe another original.
    for field, value in [('event_id', 'another-original-event'), ('sequence_id', original['event_record']['sequence_id'] + 1)]:
        result = copy.deepcopy(base)
        result['first_append_receipt'][field] = value
        add('original_join/' + field, result, target='RJ01_original_receipt', code='receipt_original_join')
    result = copy.deepcopy(base)
    result['original_event_value_commitment']['sha256'] = '0' * 64
    add('original_join/full_value', result, target='RJ01_original_receipt', code='receipt_original_join')
    ref = 'seglog:' + original['event_record']['event_id']
    donor = next(entry for r, bucket in store.ORIGINAL_CUSTODY.items() for entry in bucket.values()
                 if r != ref and entry['receipts'][0] != storage_value_bytes(base, profile=EVENT_VALUE))
    add('foreign_original_both_copies', decode_storage_value(donor['receipts'][0], profile=EVENT_VALUE),
        target='RJ01_original_receipt', code='receipt_original_join')
    return cases
