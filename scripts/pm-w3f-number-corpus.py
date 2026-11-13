#!/usr/bin/env python3
"""Run the shared NUMRULE number corpus through the W3F complete checker (wave 3 phase 2).

Routes (every one through pm_w3f_event_oracles.evaluate on a complete scenario, except raw ingress, which is
the checker's own fixture parser):
- raw ingress: '{"v": <token>}' through loads_fixture (shared loads_exact + current_integer); expected outcome =
  the shared loads_current_json outcome.
- producer_sequence_id (append, discovery.invoked/application): an EventRecord integer slot inside the CV-317
  producer projection.
- sequence_id (append, same base, Storage issuing the same value): the Storage uint64 slot.
- budget_ms (append, same base, the owner observation carrying the same value): a family payload integer slot.
Expected first row, composed from jsonschema's stock Draft 2020-12 type/minimum semantics and the shared helpers
alone (current_integer, storage_uint64, producer_semantic_bytes): stock refusal -> envelope_schema/payload_schema;
stock-admitted non-integer (1.0) -> envelope_numbers/payload_numbers; uint64 refusal -> sequence_u64; producer
qualification refusal -> producer_route; otherwise accepted. Acceptance, refusal at a row and an untracked
exception are three separate outcomes. A 4,400-digit integer runs every route (no crash allowed).
"""
import copy
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3f_event_oracles as W  # noqa: E402
import pm_w3f_cases_lib as L  # noqa: E402
import pm_event_numbers as numbers  # noqa: E402
from jsonschema import Draft202012Validator  # noqa: E402

OPS = ('token', 'slot', 'parse', 'current_json', 'current_json_slot', 'uint64', 'integer')
STOCK = Draft202012Validator.TYPE_CHECKER
BASE = L.append_scenario('discovery.invoked', 'application')


def typed(value):
    if type(value) is dict and '@int' in value:
        return W.current_integer(numbers.JsonNumber(value['@int'], True))
    if type(value) is dict and '@float' in value:
        return float(value['@float'])
    return value


def outcome(fn):
    try:
        return ('accepted', fn())
    except numbers.Refusal as refusal:
        return ('refused', refusal.reason)
    except ValueError as error:
        return ('refused', type(error).__name__)
    except Exception as error:  # untracked: never a successful refusal
        return ('untracked:' + type(error).__name__, None)


def stock_nonnegative_int(value):
    return STOCK.is_type(value, 'integer') and value >= 0


def expected(route, value, event):
    schema_row = 'payload_schema' if route == 'budget_ms' else 'envelope_schema'
    numbers_row = 'payload_numbers' if route == 'budget_ms' else 'envelope_numbers'
    if route == 'producer' and value is None:
        pass                      # producer_sequence_id is nullable_non_negative_integer
    elif not stock_nonnegative_int(value):
        return schema_row
    elif outcome(lambda: numbers.current_integer(value))[0] != 'accepted':
        return numbers_row
    elif route == 'sequence' and outcome(lambda: numbers.storage_uint64(value))[0] != 'accepted':
        return 'sequence_u64'
    return None if outcome(lambda: numbers.producer_semantic_bytes(event))[0] == 'accepted' else 'producer_route'


def scenario(route, value):
    c = copy.deepcopy(BASE)
    if route == 'producer':
        c['event']['producer_sequence_id'] = value
    elif route == 'sequence':
        c['event']['sequence_id'] = value
        c['storage_issued']['sequence_id'] = value
    else:
        c['event']['payload']['budget_ms'] = value
        c['owner']['source']['budget_ms'] = value
    L.sync_custody(c)
    if route == 'sequence':
        c['publication']['custody']['receipt']['sequence_id'] = value
        c['publication']['custody']['result']['sequence_id'] = value
    return c


def run_route(route, value):
    c = scenario(route, value)
    want = expected(route, value, c['event'])
    got = outcome(lambda: W.evaluate(c))
    if got[0] != 'accepted':
        return {'expected': want, 'actual': got[0]}
    first, rows, errors = got[1]
    actual = first[0] if first else None
    extra = [r for r in rows if r != actual and not (r in W.ENTAILED and actual in W.ENTAILED[r][0])]
    return {'expected': want, 'actual': actual, 'extra_rows': extra, 'errors': errors}


def main():
    corpus = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    counts = dict(cases=0, route_runs=0, accepted=0, refused=0, disagreements=0, untracked=0)
    problems = []
    for case in corpus['cases']:
        if case.get('date_time_profile') or case.get('op') not in OPS:
            continue
        if 'raw' in case and type(case['raw']) is not str:
            continue
        counts['cases'] += 1
        values = []
        if 'raw' in case:
            raw = case['raw']
            text = raw if case['op'] in ('current_json', 'current_json_slot') else '{"v": ' + raw + '}'
            mine = outcome(lambda: W.loads_fixture(text))
            shared = outcome(lambda: numbers.loads_current_json(text))
            counts['route_runs'] += 1
            if mine[0].startswith('untracked'):
                counts['untracked'] += 1
                problems.append((case['id'], 'ingress', mine))
            elif (mine[0] == 'accepted') != (shared[0] == 'accepted'):
                counts['disagreements'] += 1
                problems.append((case['id'], 'ingress', mine, shared))
            else:
                counts['accepted' if mine[0] == 'accepted' else 'refused'] += 1
            if mine[0] == 'accepted':
                parsed = mine[1]
                if case['op'] == 'current_json_slot':
                    for key in case['path']:
                        parsed = parsed[key]
                    values.append(parsed)
                elif case['op'] in ('token', 'slot', 'parse'):
                    values.append(parsed['v'])
        elif 'value' in case:
            values.append(typed(case['value']))
        for value in values:
            if type(value) in (dict, list):
                continue
            for route in ('producer', 'sequence', 'budget_ms'):
                result = run_route(route, value)
                counts['route_runs'] += 1
                if str(result['actual']).startswith('untracked') or result.get('errors'):
                    counts['untracked'] += 1
                    problems.append((case['id'], route, result))
                elif result['actual'] != result['expected'] or result.get('extra_rows'):
                    counts['disagreements'] += 1
                    problems.append((case['id'], route, result))
                else:
                    counts['accepted' if result['actual'] is None else 'refused'] += 1
    with W.exact_digits():
        big = 10 ** 4400 - 1
    long_routes = {route: run_route(route, big) for route in ('producer', 'sequence', 'budget_ms')}
    # every family's append base: the producer and Storage uint64 slots, and each payload integer slot
    per_family = {}
    for fam in W.FAMILIES:
        base = L.append_scenario(fam, W.FAMILY_SPECS[fam][3][0])
        slots = [k for k, v in base['event']['payload'].items() if type(v) is int]
        results = {}
        for route in ['producer', 'sequence'] + ['payload:' + s for s in slots]:
            c = copy.deepcopy(base)
            if route == 'producer':
                c['event']['producer_sequence_id'] = big
                want = 'producer_route'
            elif route == 'sequence':
                c['event']['sequence_id'] = big
                want = 'sequence_u64'
            else:
                c['event']['payload'][route.split(':', 1)[1]] = big
                with W.exact_digits():   # the stock verdict (a schema maximum or const) owns it first, else the producer route
                    want = 'producer_route' if W.payload_validator(fam).is_valid(c['event']['payload']) else 'payload_schema'
            got = outcome(lambda: W.evaluate(c))
            first = got[1][0][0] if got[0] == 'accepted' and got[1][0] else None
            errors = got[1][2] if got[0] == 'accepted' else ['untracked']
            results[route] = {'expected': want, 'actual': first, 'errors': errors}
        per_family[fam] = results
    long_routes['per_family'] = per_family
    family_ok = all([r['actual'] == r['expected'] and not r['errors'] for f in per_family.values() for r in f.values()])
    long_routes['ingress'] = {'outcome': outcome(lambda: W.loads_fixture('{"v": ' + '9' * 4400 + '}'))[0]}
    long_ok = all([r.get('actual') == r.get('expected') and not r.get('extra_rows') and not r.get('errors')
                   for k, r in long_routes.items() if k not in ('ingress', 'per_family')]) and \
        long_routes['ingress']['outcome'] == 'accepted' and family_ok
    status = 'pass' if not problems and long_ok else 'fail'
    report = {'status': status, 'counts': counts, 'problems': problems[:50], 'problem_count': len(problems),
              'long_integer_4400_digits': long_routes}
    with W.exact_digits():
        print(json.dumps(report, indent=1, sort_keys=True, default=str))
    return 0 if status == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
