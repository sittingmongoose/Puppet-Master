#!/usr/bin/env python3
"""Run the shared NUMRULE number corpus through the DCN complete checker.

Routes (every one through pm_card2_events.evaluate on a complete scenario, except
raw ingress, which is the checker's own fixture parser):
- raw ingress: '{"v": <token>}' through loads_fixture (shared loads_exact + current_integer);
  expected outcome = the shared loads_current_json outcome.
- producer_sequence_id (append, browser.session.created/project): an EventRecord integer slot
  inside the CV-317 producer projection.
- sequence_id (append, same base): the Storage uint64 slot.
- retry original producer_sequence_id (browser.session.state_changed/project/retry).
Expected first row, composed from jsonschema's stock Draft 2020-12 type/minimum semantics and
the shared helpers alone (current_integer, storage_uint64, producer_semantic_bytes): stock
schema refusal -> *_envelope_schema; stock-admitted non-integer (1.0) -> *_envelope_numbers;
uint64 refusal -> *_sequence_u64; producer qualification refusal -> *_producer_route; otherwise
accepted. Acceptance, refusal at a row and an untracked exception are three separate outcomes.
"""
import copy
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_card2_events as dcn  # noqa: E402
import pm_card2_p2a_lib as L  # noqa: E402
import pm_event_numbers as numbers  # noqa: E402
from jsonschema import Draft202012Validator  # noqa: E402

OPS = ('token', 'slot', 'parse', 'current_json', 'current_json_slot', 'uint64', 'integer')
STOCK = Draft202012Validator.TYPE_CHECKER
BASES = {c['id']: c for c in dcn.load('card2_event_fixtures.json')['positives']}
APPEND = BASES['browser.session.created/project']
RETRY = BASES['browser.session.state_changed/project/retry']


def typed(value):
    """Corpus typed scalar -> Python value ({'@int': digits}, {'@float': repr}, or a plain JSON value)."""
    if type(value) is dict and '@int' in value:
        return dcn.current_integer(numbers.JsonNumber(value['@int'], True))
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


def expected_row(prefix, value, uint64):
    if value is None and not uint64:
        return 'producer'       # producer_sequence_id is nullable_non_negative_integer in the EventRecord schema
    stock = STOCK.is_type(value, 'integer') and value >= 0
    if not stock:
        return prefix + '_envelope_schema'
    if outcome(lambda: numbers.current_integer(value))[0] != 'accepted':
        return prefix + '_envelope_numbers'
    if uint64 and outcome(lambda: numbers.storage_uint64(value))[0] != 'accepted':
        return prefix + '_sequence_u64'
    return 'producer'


def route(scenario_fn, prefix, value, uint64):
    c = scenario_fn(value)
    want = expected_row(prefix, value, uint64)
    if want == 'producer':
        event = c['event'] if prefix == 'cand' else c['storage']['event']
        want = None if outcome(lambda: numbers.producer_semantic_bytes(event))[0] == 'accepted' else prefix + '_producer_route'
    got = outcome(lambda: dcn.evaluate(c))
    if got[0] != 'accepted':
        return {'expected': want, 'actual': got[0]}
    first, rows = got[1]
    actual = first[0] if first else None
    extra = [r for r in rows if r != actual and not (r in dcn.ENTAILED and actual in dcn.ENTAILED[r][0])]
    return {'expected': want, 'actual': actual, 'extra_rows': extra}


def producer_append(value):
    c = copy.deepcopy(APPEND); c['event']['producer_sequence_id'] = value; return c


def sequence_append(value):
    c = copy.deepcopy(APPEND); c['event']['sequence_id'] = value; return c


def producer_original(value):
    c = copy.deepcopy(RETRY); c['storage']['event']['producer_sequence_id'] = value; L.sync_original(c); return c


def main():
    corpus = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    counts = dict(cases=0, route_runs=0, accepted=0, refused=0, disagreements=0, untracked=0)
    problems = []
    for case in corpus['cases']:
        if case.get('date_time_profile') or case.get('op') not in OPS:
            continue
        counts['cases'] += 1
        values = []
        if 'raw' in case and type(case['raw']) is not str:
            counts['cases'] -= 1     # a non-text raw input is the shared helper's input-type refusal, outside this route
            continue
        if 'raw' in case:
            raw = case['raw']
            text = raw if case['op'] in ('current_json', 'current_json_slot') else '{"v": ' + raw + '}'
            mine = outcome(lambda: dcn.loads_fixture(text))
            shared = outcome(lambda: numbers.loads_current_json(text))
            counts['route_runs'] += 1
            if mine[0].startswith('untracked'):
                counts['untracked'] += 1; problems.append((case['id'], 'ingress', mine))
            elif (mine[0] == 'accepted') != (shared[0] == 'accepted'):
                counts['disagreements'] += 1; problems.append((case['id'], 'ingress', mine, shared))
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
            for name, fn, prefix, uint64 in [('producer_append', producer_append, 'cand', False),
                                             ('sequence_append', sequence_append, 'cand', True),
                                             ('producer_original', producer_original, 'orig', False)]:
                result = route(fn, prefix, value, uint64)
                counts['route_runs'] += 1
                if str(result['actual']).startswith('untracked'):
                    counts['untracked'] += 1; problems.append((case['id'], name, result))
                elif result['actual'] != result['expected'] or result.get('extra_rows'):
                    counts['disagreements'] += 1; problems.append((case['id'], name, result))
                else:
                    counts['accepted' if result['actual'] is None else 'refused'] += 1
    big = 10 ** 4400 - 1
    long_routes = {name: route(fn, prefix, big, uint64) for name, fn, prefix, uint64 in
                   [('producer_append', producer_append, 'cand', False), ('sequence_append', sequence_append, 'cand', True),
                    ('producer_original', producer_original, 'orig', False)]}
    long_routes['ingress'] = {'outcome': outcome(lambda: dcn.loads_fixture('{"v": ' + '9' * 4400 + '}'))[0]}
    long_ok = all([r.get('actual') == r.get('expected') and not r.get('extra_rows') for k, r in long_routes.items() if k != 'ingress']) \
        and long_routes['ingress']['outcome'] == 'accepted'
    status = 'pass' if counts['disagreements'] == 0 and counts['untracked'] == 0 and long_ok else 'fail'
    print(json.dumps(dict(status=status, counts=counts, problems=problems[:30], long_integer_routes=long_routes),
                     indent=1, sort_keys=True, default=str))
    return 0 if status == 'pass' else 1


if __name__ == '__main__':
    raise SystemExit(main())
