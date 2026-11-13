#!/usr/bin/env python3
"""Run the shared NUMRULE number corpus through the W3D complete checker.

For each corpus value, routes inject it into a real integer slot of a complete world and compare the
complete checker's accept/refuse decision with the shared helpers' decision on that same world:
- producer_append: envelope.producer_sequence_id (CV-317 producer projection, nullable current integer);
- sequence_append: envelope.sequence_id + coherent Storage meta copy (Storage uint64);
- payload_integer: payload.policy_revision with the authentic source kept coherent (current integer,
  minimum 0); the payload is inside the producer projection, so producer qualification also applies;
- producer_original: a retained original read back through its sealed receipt.
A 4,400-digit integer must reach a refusal row, never raise. Acceptance, refusal and an untracked
exception are three separate outcomes; any untracked exception or accept/refuse disagreement fails.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3d_bsd_events as m  # noqa: E402
import pm_w3d_bsd_spec as spec  # noqa: E402
import pm_event_numbers as numbers  # noqa: E402

OPS = ('token', 'slot', 'parse', 'current_json', 'current_json_slot', 'uint64', 'integer')
FAM = spec.BY_SLUG['advice_emitted']


def typed(value):
    if type(value) is dict and '@int' in value:
        return numbers.current_integer(numbers.JsonNumber(value['@int'], True))
    if type(value) is dict and '@float' in value:
        return float(value['@float'])
    return value


def accepts(fn):
    try:
        fn()
        return True
    except numbers.Refusal:
        return False
    except ValueError:
        return False


def shared_accepts(route, W, value):
    if route == 'sequence_append':
        return accepts(lambda: numbers.storage_uint64(W['env']['sequence_id']))
    if route in ('producer_append', 'producer_original'):
        pseq = W['env']['producer_sequence_id']
        if pseq is not None and not accepts(lambda: numbers.current_integer(pseq, minimum=0)):
            return False
        return accepts(lambda: numbers.producer_semantic_bytes(W['env']))
    if route == 'payload_integer':
        if not accepts(lambda: numbers.current_integer(value, minimum=0)):
            return False
        return accepts(lambda: numbers.producer_semantic_bytes(W['env']))
    raise KeyError(route)


def build_route(route, value):
    if route == 'producer_append':
        return m.build(FAM, {'envelope': m.setp('producer_sequence_id', value)})
    if route == 'sequence_append':
        return m.build(FAM, {'envelope': m.setp('sequence_id', value), 'meta': m.setp('sequence_id', value)})
    if route == 'payload_integer':
        return m.build(FAM, {'payload': m.setp('policy_revision', value),
                             'native': m.setp('policy_revision', value),
                             'capture': m.setp('policy_revision', value)})
    if route == 'producer_original':
        return m.build(FAM, {'envelope': m.setp('producer_sequence_id', value)})
    raise KeyError(route)


ROUTES = ('producer_append', 'sequence_append', 'payload_integer', 'producer_original')


def main():
    corpus = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    counts = dict(cases=0, route_runs=0, accepted=0, refused=0, disagreements=0, untracked=0)
    problems = []
    with m.exact_integer_digits():
        for case in corpus['cases']:
            if case.get('date_time_profile') or case.get('op') not in OPS:
                continue
            counts['cases'] += 1
            values = []
            if 'raw' in case and type(case['raw']) is not str:
                counts['cases'] -= 1
                continue
            if 'raw' in case:
                raw = case['raw']
                text = raw if case['op'] in ('current_json', 'current_json_slot') else '{"v": ' + raw + '}'
                try:
                    parsed = numbers.loads_current_json(text)
                    counts['route_runs'] += 1
                    counts['accepted'] += 1
                except (numbers.Refusal, ValueError):
                    counts['route_runs'] += 1
                    counts['refused'] += 1
                    continue
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
                for route in ROUTES:
                    counts['route_runs'] += 1
                    try:
                        W = build_route(route, value)
                        result = m.run_path('append', W)
                        checker_accepts = result is None
                    except Exception as error:  # untracked: never a successful refusal
                        counts['untracked'] += 1
                        problems.append((case['id'], route, 'untracked:' + type(error).__name__))
                        continue
                    want = shared_accepts(route, W, value)
                    if want != checker_accepts:
                        counts['disagreements'] += 1
                        problems.append((case['id'], route, {'shared_accepts': want, 'checker_accepts': checker_accepts,
                                                             'first_row': result[0] if result else None}))
                    else:
                        counts['accepted' if checker_accepts else 'refused'] += 1
        big = 10 ** 4400 - 1
        long_routes = {}
        for route in ROUTES:
            try:
                W = build_route(route, big)
                result = m.run_path('append', W)
                long_routes[route] = {'checker_accepts': result is None, 'first_row': result[0] if result else None,
                                      'shared_accepts': shared_accepts(route, W, big)}
            except Exception as error:
                long_routes[route] = {'untracked': type(error).__name__}
    long_ok = all(('untracked' not in r) and r['checker_accepts'] == r['shared_accepts'] and not r['checker_accepts']
                  for r in long_routes.values())
    status = 'pass' if counts['disagreements'] == 0 and counts['untracked'] == 0 and long_ok else 'fail'
    print(json.dumps(dict(status=status, counts=counts, problems=problems[:30], long_integer_routes=long_routes),
                     indent=1, sort_keys=True, default=str))
    return 0 if status == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())