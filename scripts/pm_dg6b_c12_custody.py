"""C12 complete retained-reader witnesses, with actual sealed-store snapshots."""
import copy
import hashlib
import pickle

import pm_dg6b_original_custody as store
from pm_event_numbers import EVENT_VALUE, storage_value_bytes

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
    foreign = copy.deepcopy(original['durable_read_token'])
    foreign['storage_instance_id'] += '-foreign-original'
    add('other_original_receipt', copy.deepcopy(base),
        lambda entry: entry.update(receipts=(storage_value_bytes(foreign, profile=EVENT_VALUE),)))
    changed = copy.deepcopy(base)
    changed['original']['durable_read_token']['frontier_revision'] += 1
    add('changed_query_receipt', changed)
    changed = copy.deepcopy(base)
    changed['original']['payload']['subject_ref'] += '-foreign-result'
    add('changed_query_result', changed)
    return cases
