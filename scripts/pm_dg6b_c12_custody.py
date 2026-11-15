"""C12 complete retained-reader witnesses, with actual sealed-store snapshots."""
import copy
import hashlib
import pickle

import pm_dg6b_original_custody as store
from pm_event_numbers import EVENT_VALUE, decode_storage_value, storage_value_bytes

OBSERVATIONS = []


def snapshot():
    return hashlib.sha256(pickle.dumps(store.ORIGINAL_CUSTODY, protocol=5)).hexdigest()


def family_cases(m, row, schema):
    name = row['event_type']
    base = copy.deepcopy(next(c for c in row['history_cases'] if 'expected_error' not in c))
    base.pop('label', None)
    original = base['original']
    ref = 'seglog:' + original['event_record']['event_id']
    commitment = store.original_binding(name, original).source_commitment
    cases = []

    def read(label, query, edit=None):
        def call():
            saved = copy.deepcopy(store.ORIGINAL_CUSTODY[ref][commitment])
            try:
                if edit is not None:
                    edit(store.ORIGINAL_CUSTODY[ref][commitment])
                before = snapshot()
                try:
                    return m['history_contract'](name, query, schema)
                finally:
                    after = snapshot()
                    assert before == after, (name, label, 'retained reader changed sealed store')
                    OBSERVATIONS.append(dict(family=name, label=label, before=before, after=after))
            finally:
                store.ORIGINAL_CUSTODY[ref][commitment] = saved
        return call

    def add(label, query, edit=None, accepted=False):
        cases.append(('c12/custody/' + label, None if accepted else 'HR01_original_custody',
                      None if accepted else 'historical_original_recipe', read(label, query, edit)))

    add('sealed_control', copy.deepcopy(base), accepted=True)
    add('missing_receipt', copy.deepcopy(base), lambda entry: entry.pop('receipts'))
    add('ambiguous_receipt', copy.deepcopy(base),
        lambda entry: entry.update(receipts=entry['receipts'] * 2))
    donor_ref, donor = next((r, entry) for r, bucket in store.ORIGINAL_CUSTODY.items() for entry in bucket.values()
                            if r != ref and entry['receipts'][0] != store.ORIGINAL_CUSTODY[ref][commitment]['receipts'][0])
    foreign = donor['receipts'][0]
    add('other_original_receipt', copy.deepcopy(base),
        lambda entry: entry.update(receipts=(foreign,)))
    add('other_original_result', copy.deepcopy(base),
        lambda entry: entry.update(result_bytes=donor['result_bytes']))
    # Every original receipt field has two independently held byte copies.
    # Mutate each copy alone; neither is reconstructed from the other on read.
    result = decode_storage_value(store.ORIGINAL_CUSTODY[ref][commitment]['receipts'][0], profile=EVENT_VALUE)
    for field, value in result['first_append_receipt'].items():
        changed = copy.deepcopy(result)
        changed['first_append_receipt'][field] = (
            value + 1 if type(value) is int else
            ('ordinary' if value == 'barrier' else 'barrier') if field == 'durability_class' else
            '2026-11-04T12:03:00+00:00' if field == 'acknowledged_at_utc' else value + '-other')
        body = storage_value_bytes(changed, profile=EVENT_VALUE)
        add('copy/custody_receipt/' + field, copy.deepcopy(base),
            lambda entry, body=body: entry.update(receipts=(body,)))
        add('copy/issued_receipt/' + field, copy.deepcopy(base),
            lambda entry, body=body: entry.update(issued_receipt_bytes=body))
    changed = copy.deepcopy(base)
    changed['original']['durable_read_token']['frontier_revision'] += 1
    add('changed_query_receipt', changed)
    changed = copy.deepcopy(base)
    changed['original']['payload']['subject_ref'] += '-foreign-result'
    add('changed_query_result', changed)
    return cases
