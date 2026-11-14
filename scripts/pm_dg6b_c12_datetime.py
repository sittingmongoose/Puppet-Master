"""The complete shared date-time value corpus through DG6B family routes."""
import copy
import json

import pm_dg6b_original_custody as store
from pm_dg6b_c12_custody import snapshot
from pm_dg6b_full_oracles import rebuild
from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time
from pm_event_numbers import EVENT_VALUE, Refusal, storage_value_bytes


def run(m, row, schema):
    name = row['event_type']
    corpus = m['load_plan']('Plans/event_number_recipe_corpus.json')['cases']
    ops = {'datetime', 'datetime_direct', 'envelope_datetime', 'inventory_datetime', 'family_datetime'}
    values = {}
    for case in corpus:
        if case['op'] in ops:
            values.setdefault(json.dumps(case['value'], sort_keys=True), case['value'])
    base = copy.deepcopy(row['append_valid'][0])
    history = copy.deepcopy(next(c for c in row['history_cases'] if 'expected_error' not in c))
    history.pop('label', None)
    results = []

    def check(label, value, profile, call, refused_phase, refused_row, refused_code, retained=False):
        try:
            date_time(value, profile=profile)
            valid = True
        except Refusal:
            valid = False
        before = snapshot() if retained else None
        try:
            if valid:
                call()
            else:
                m['expect_failure'](call, refused_code, name, label, row=refused_row)
        finally:
            after = snapshot() if retained else None
            assert before == after, (name, label, 'retained store mutated')
        results.append(dict(label=label, profile=profile, accepted=valid,
                            expected_phase=None if valid else refused_phase,
                            expected_row=None if valid else refused_row,
                            expected_code=None if valid else refused_code,
                            store_before=before, store_after=after))

    for index, value in enumerate(values.values()):
        # The two payload timestamp fields preserve the EventRecord profile.
        for field in ('ts', 'expires_at') if 'expires_at' in base['payload'] else ('ts',):
            case = copy.deepcopy(base)
            case['payload'][field] = value
            try:
                date_time(value, profile=EVENT_RECORD)
            except Refusal:
                pass  # independently invalid payload; envelope remains a valid control
            else:
                case = rebuild(m, name, case)
            check(f'payload/{field}/{index}', value, EVENT_RECORD,
                  lambda c=case: m['complete_append_contract'](name, c, schema),
                  'payload_schema', 'PS01_payload', 'payload_schema')
        for field, profile in (('occurred_at_utc', EVENT_RECORD), ('observed_at_utc', STORAGE_UTC_Z),
                               ('persisted_at_utc', STORAGE_UTC_Z)):
            case = copy.deepcopy(base)
            case['event_record'][field] = value
            if field == 'occurred_at_utc':
                case['payload']['ts'] = value
                case['source']['frozen_payload']['ts'] = value
                if case['event_record']['payload_ref'] is None:
                    case['event_record']['payload']['ts'] = value
            check(f'envelope/{field}/{index}', value, profile,
                  lambda c=case: m['complete_append_contract'](name, c, schema),
                  'event_record', 'ER01_event_record', 'event_record_schema')
            retained = copy.deepcopy(history)
            retained['original']['event_record'][field] = value
            if field == 'occurred_at_utc':
                retained['original']['payload']['ts'] = value
                retained['original']['source']['frozen_payload']['ts'] = value
                if retained['original']['event_record']['payload_ref'] is None:
                    retained['original']['event_record']['payload']['ts'] = value
            try:
                retained['storage_record']['event_record_bytes_hex'] = storage_value_bytes(
                    retained['original']['event_record'], profile=EVENT_VALUE).hex()
                store.seal_original(name, retained['original'])
            except Refusal:
                # An unencodable typed value cannot be a Storage-sealed
                # original; it remains exercised above at the current boundary.
                results.append(dict(label=f'history/{field}/{index}', status='INVALID_PHYSICAL_ORIGINAL',
                                    profile=profile, kill_credit=0))
                continue
            check(f'history/{field}/{index}', value, profile,
                  lambda c=retained: m['history_contract'](name, c, schema),
                  'event_record', 'ER01_event_record', 'event_record_schema', retained=True)
        logical = copy.deepcopy(m['make_operation'](name, base))
        logical['payload']['ts'] = value
        carrier, resolved = m['store_operation'](logical)
        check(f'operation/ts/{index}', value, EVENT_RECORD,
              lambda v=carrier, r=resolved, o=logical: m['operation_contract'](name, v, r, o, schema),
              'operation_schema', 'OP01_operation', 'operation_schema')
    return dict(values=len(values), rows=results)
