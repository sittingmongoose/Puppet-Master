#!/usr/bin/env python3
"""Explicit scalar corpus expectations through append, real retry, and sealed-original read.

The shared corpus's original API expectations (including returns and refusal reasons) are checked
separately. Parser/API-only outcomes never count as complete-checker routes. A committed manifest
carries each lane boundary's expected first refusal, independently transcribed from the owner domains;
no shared helper computes the expected result. This covers the five named routes, not every slot.
"""
import argparse
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3d_bsd_events as m
import pm_w3d_bsd_spec as spec
import pm_event_numbers as numbers
import pm_event_numbers_corpus as corpus_runner

OPS = ('token', 'slot', 'parse', 'current_json', 'current_json_slot', 'uint64', 'integer')
FAM = spec.BY_SLUG['advice_emitted']
ROUTES = {'producer_append': 'append', 'sequence_append': 'append', 'payload_integer': 'append',
          'producer_original': 'read', 'producer_retry': 'retry'}


def extract(case):
    if 'value' in case:
        return corpus_runner._value(case['value'])
    raw = bytes.fromhex(case['raw_hex']) if 'raw_hex' in case else case['raw']
    if type(raw) not in (str, bytes):
        raise numbers.Refusal('json_input_type')
    value = numbers.loads_current_json(raw)
    if case['op'] == 'current_json_slot':
        for key in case['path']:
            value = value[key]
    elif type(value) in (dict, list):
        raise numbers.Refusal('adapter_no_scalar_slot')
    return value


def build_route(route, value):
    if route in ('producer_append', 'producer_original', 'producer_retry'):
        return m.build(FAM, {'envelope': m.setp('producer_sequence_id', value)})
    if route == 'sequence_append':
        return m.build(FAM, {'meta': m.setp('sequence_id', value)})
    if route == 'payload_integer':
        return m.build(FAM, {'payload': m.setp('policy_revision', value),
                             'native': m.setp('policy_revision', value),
                             'capture': m.setp('policy_revision', value)})
    raise KeyError(route)


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--json')
    args = ap.parse_args([] if argv is None else argv)
    raw = (ROOT / 'Plans/event_number_recipe_corpus.json').read_bytes()
    corpus = json.loads(raw)
    manifest = json.loads((ROOT / 'scripts/pm_w3d_bsd_number_expectations.json').read_text())
    problems, results = [], []
    api = dict(cases=0, accepted=0, refused=0, mismatches=0)
    parser_only = 0
    counts = {r: dict(boundary=p, runs=0, accepted=0, refused=0, mismatches=0, untracked=0) for r, p in ROUTES.items()}
    if manifest['corpus_sha256'] != hashlib.sha256(raw).hexdigest() or manifest['routes'] != ROUTES:
        raise ValueError('stale number expectations manifest')
    selected = [c for c in corpus['cases'] if c['op'] in OPS and not c.get('date_time_profile')]
    if {c['id'] for c in selected} != set(manifest['cases']):
        raise ValueError('corpus adapter expectation inventory differs')
    with m.exact_integer_digits():
        for case in selected:
            # The unmodified corpus's explicit error/output/returns are the API oracle.
            actual, returned = corpus_runner.evaluate(numbers, case, corpus)
            api['cases'] += 1
            expected_api = ({'outcome': 'refusal', 'error': case['error']} if 'error' in case else
                            {'outcome': 'acceptance', 'output': case['output']})
            extra = corpus_runner.success_errors(returned, case) if actual['outcome'] == 'acceptance' else []
            api_good = actual == expected_api and not extra
            api['accepted' if actual['outcome'] == 'acceptance' else 'refused'] += 1
            if not api_good:
                api['mismatches'] += 1
                problems.append(dict(case=case['id'], api_actual=actual, api_expected=expected_api, extra=extra))
            expected = manifest['cases'][case['id']]['routes']
            try:
                value = extract(case)
            except numbers.Refusal as error:
                parser_only += 1
                results.append(dict(case=case['id'], coverage='parser/API-only', reason=error.reason, api=actual))
                if expected is not None:
                    problems.append(dict(case=case['id'], error='expected route input was not materialized'))
                continue
            if expected is None:
                problems.append(dict(case=case['id'], error='unexpected route input materialized'))
                continue
            for route, path in ROUTES.items():
                counter = counts[route]
                counter['runs'] += 1
                try:
                    W = build_route(route, value)
                    outcome = m.run_path(path, W)
                    actual_row = list(outcome[:3]) if outcome else None
                    good = actual_row == expected[route]
                    if path == 'read':
                        good = good and m.dispatcher_agrees(W)
                    counter['accepted' if outcome is None else 'refused'] += 1
                    counter['mismatches'] += int(not good)
                    result = dict(case=case['id'], route=route, boundary=path,
                                  expected=expected[route], actual=actual_row, matches=good)
                except Exception as error:
                    counter['untracked'] += 1
                    result = dict(case=case['id'], route=route, boundary=path, expected=expected[route],
                                  exception=type(error).__name__, matches=False)
                results.append(result)
                if not result['matches']:
                    problems.append(result)
        # Explicit extra smoke vectors: neither can be packed or qualified on these routes.
        smoke = []
        for label, value in [('2**64', 2**64), ('10**4399', 10**4399)]:
            for route, path in ROUTES.items():
                W = build_route(route, value)
                outcome = m.run_path(path, W)
                row = 'HI05_original_verifies' if path == 'read' else ('RT05_retry_digest_equal' if path == 'retry' else
                      ('EN05_sequence_uint64' if route == 'sequence_append' else 'EN07_producer_qualified'))
                good = outcome is not None and outcome[1] == row
                smoke.append(dict(case=label, route=route, boundary=path, expected_row=row,
                                  actual=list(outcome[:3]) if outcome else None, matches=good))
                if not good:
                    problems.append(smoke[-1])
    result = dict(status='fail' if problems else 'pass', corpus_api=api, parser_api_only=parser_only,
                  complete_checker_routes=counts, extra_large_integer_smoke=smoke, problems=problems, results=results)
    if args.json:
        Path(args.json).write_text(json.dumps(result, indent=1, default=str) + '\n')
    print(json.dumps({k: v for k, v in result.items() if k != 'results'}, indent=1, default=str))
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
