#!/usr/bin/env python3
"""Run the shared NUMRULE number corpus through the W3C complete checker (wave 3 phase 2).

Routes (each one through pm_w3c_event_oracles.evaluate on a complete coherent scenario built by
scripts/pm_w3c_cases_lib.py, except raw ingress, which is the checker's own fixture parser):
- raw ingress: '{"v": <token>}' through loads_fixture (shared loads_exact + current_integer); expected outcome = the
  shared loads_current_json outcome.
- producer_sequence_id (append, testing.capture.bookmarked/application; the owner input carries the value and the event
  copies it): an EventRecord integer slot inside the CV-317 producer projection.
- sequence_id (append, same base; Storage issued the same value to the event and the receipt): the Storage uint64 slot.
- receipt byte_offset (append, same base; Storage's issued receipt): a CV-339 uint64 slot.
- token frontier_revision (checkpoint, same family): a DurableGenericToken integer slot with an owner schema maximum.
Expected first row, composed from jsonschema's stock Draft 2020-12 type/minimum/maximum semantics and the shared helpers
alone (current_integer, storage_uint64, producer_semantic_bytes). Acceptance, refusal at a row and an untracked exception
are three separate outcomes. A 4,400-digit integer and 2**64 also run every payload route of every edition: as an
extra payload member and at a wrongly typed (string) payload field. None may raise.
"""
import copy
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3c_event_oracles as W  # noqa: E402
import pm_w3c_cases_lib as L  # noqa: E402
import pm_event_numbers as numbers  # noqa: E402
from jsonschema import Draft202012Validator  # noqa: E402

OPS = ('token', 'slot', 'parse', 'current_json', 'current_json_slot', 'uint64', 'integer')
STOCK = Draft202012Validator.TYPE_CHECKER
FAMILY, SCOPE = 'testing.capture.bookmarked', 'application'
UINT64_MAX = 2 ** 64 - 1


def manifest():
    rec = json.loads((ROOT / 'Plans/w3c_original_custody.json').read_text())['recipes']['w3c@1']
    import hashlib
    names = sorted(rec['resources'])
    return hashlib.sha256(json.dumps({n: hashlib.sha256((ROOT / n).read_bytes()).hexdigest() for n in names}, sort_keys=True,
                                     separators=(',', ':')).encode('ascii')).hexdigest()


MANIFEST = manifest()


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


def stock_int(value, maximum=None):
    return STOCK.is_type(value, 'integer') and value >= 0 and (maximum is None or value <= maximum)


def expected(route, value, event):
    if route == 'producer' and value is None:
        pass
    elif route == 'token':
        if not stock_int(value, UINT64_MAX):
            return 'ck_schema'
        return 'ck_numbers' if outcome(lambda: numbers.current_integer(value))[0] != 'accepted' else None
    elif route == 'receipt':
        if not stock_int(value):
            return 'receipt_schema'
        if outcome(lambda: numbers.current_integer(value))[0] != 'accepted':
            return 'receipt_numbers'
        return 'receipt_u64_byte_offset' if outcome(lambda: numbers.storage_uint64(value))[0] != 'accepted' else None
    elif not stock_int(value):
        return 'envelope_schema'
    elif outcome(lambda: numbers.current_integer(value))[0] != 'accepted':
        return 'envelope_numbers'
    elif route == 'sequence' and outcome(lambda: numbers.storage_uint64(value))[0] != 'accepted':
        return 'sequence_u64'
    with W.exact_digits():
        return None if outcome(lambda: numbers.producer_semantic_bytes(event))[0] == 'accepted' else 'producer_route'


def scenario(route, value, family=FAMILY, scope=SCOPE):
    if route == 'producer':
        return L.build(family, scope, 'append', 'append', [('owner', '/owner/producer_sequence_id', value)], MANIFEST)
    if route == 'sequence':
        return L.build(family, scope, 'append', 'append', [('event', '/event/sequence_id', value), ('storage', '/storage/issued/sequence_id', value),
                                                           ('storage', '/storage/issued/result/first_append_receipt/sequence_id', value)], MANIFEST)
    if route == 'receipt':
        return L.build(family, scope, 'append', 'append', [('storage', '/storage/issued/result/first_append_receipt/byte_offset', value)], MANIFEST)
    if route == 'token':
        return L.build(family, scope, 'checkpoint', 'ck-inline', [('ckrow', '/checkpoint/row/index_read_token/frontier_revision', value)], MANIFEST)
    raise ValueError(route)


def run_case(c, want):
    got = outcome(lambda: W.evaluate(c))
    if got[0] != 'accepted':
        return {'expected': want, 'actual': got[0]}
    first, rows, errors = got[1]
    actual = first[0] if first else None
    extra = [r for r in rows if r != actual and not (r in W.ENTAILED and actual in W.ENTAILED[r][0])]
    return {'expected': want, 'actual': actual, 'extra_rows': extra, 'errors': errors}


def run_route(route, value):
    built = outcome(lambda: scenario(route, value))
    if built[0] != 'accepted':
        return {'expected': None, 'actual': 'builder:' + built[0]}
    c = built[1]
    return run_case(c, expected(route, value, c.get('event')))


def main():
    sys.set_int_max_str_digits(0)
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
            for route in ('producer', 'sequence', 'receipt', 'token'):
                result = run_route(route, value)
                counts['route_runs'] += 1
                if str(result['actual']).startswith(('untracked', 'builder')) or result.get('errors'):
                    counts['untracked'] += 1
                    problems.append((case['id'], route, result))
                elif result['actual'] != result['expected'] or result.get('extra_rows'):
                    counts['disagreements'] += 1
                    problems.append((case['id'], route, result))
                else:
                    counts['accepted' if result['actual'] is None else 'refused'] += 1
    big = 10 ** 4399
    long_routes = {route: run_route(route, big) for route in ('producer', 'sequence', 'receipt', 'token')}
    payload = {}
    for fam, spec in W.FAMILIES.items():
        for scope in spec[5]:
            field = spec[7][0][0]
            for name, value in (('2**64', 2 ** 64), ('10**4399', big)):
                for site, edits in (('extra_member', [('payload', '/event/payload/extra_number', value)]),
                                    ('wrong_type_' + field, [('payload', '/event/payload/' + field, value)])):
                    built = outcome(lambda: L.build(fam, scope, 'append', 'append', edits, MANIFEST))
                    key = fam + '/' + scope + '/' + site + '/' + name
                    if built[0] != 'accepted':
                        payload[key] = {'expected': 'payload_schema', 'actual': 'builder:' + built[0]}
                        continue
                    payload[key] = run_case(built[1], 'payload_schema')
    long_routes['payload'] = payload
    long_routes['ingress'] = {'outcome': outcome(lambda: W.loads_fixture('{"v": ' + '9' * 4400 + '}'))[0]}
    route_ok = all([r.get('actual') == r.get('expected') and not r.get('extra_rows') and not r.get('errors')
                    for k, r in long_routes.items() if k not in ('ingress', 'payload')])
    payload_ok = all([r.get('actual') == r.get('expected') and not r.get('extra_rows') and not r.get('errors') for r in payload.values()])
    long_ok = route_ok and payload_ok and long_routes['ingress']['outcome'] == 'accepted'
    status = 'pass' if not problems and long_ok else 'fail'
    report = {'status': status, 'counts': counts, 'problems': problems[:50], 'problem_count': len(problems),
              'long_integer_routes': {k: v for k, v in long_routes.items() if k != 'payload'},
              'payload_long_integer_routes': len(payload), 'payload_long_integer_failures':
              {k: v for k, v in payload.items() if v.get('actual') != v.get('expected') or v.get('errors') or v.get('extra_rows')}}
    with W.exact_digits():
        print(json.dumps(report, indent=1, sort_keys=True, default=str))
    return 0 if status == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
