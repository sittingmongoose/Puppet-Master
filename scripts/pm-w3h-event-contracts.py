#!/usr/bin/env python3
"""Run the complete W3H checker over every positive and single-defect negative (ATS-1270, phase 2).

Usage: python3 scripts/pm-w3h-event-contracts.py [--json out.json] [--skip-numbers]

Each case names its boundary and expectation; a negative passes only when its FIRST refusal is the
target row (an acceptance, another row or an exception fails it). Also runs: the eager schema-reference
closure, the timestamp-field inventory, retained-read custody invariants (no receipt created, bytes
unchanged), and the shared NUMRULE corpus through the complete append/retry/retained routes at every
integer slot (scripts/pm_w3h_numbers.py). Exit 0 only when everything agrees.
"""
import argparse
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3h_events as m  # noqa: E402
import pm_w3h_cases as c  # noqa: E402
from pm_w3h_cases import all_cases, outcome  # noqa: E402


def run_cases(cases, record=None):
    failures, rows_hit, per_family = [], {}, {}
    for cid, f, boundary, value, expected in cases:
        try:
            with m.exact_integer_digits():
                got = outcome(boundary, value)
        except Exception as exc:  # an exception is never a refusal
            failures.append(dict(case=cid, expected=expected, got=('exception', type(exc).__name__, str(exc)[:200])))
            continue
        ok = (got is None) if expected == ('accept',) else (got is not None and got[:2] == expected[1:])
        if not ok:
            failures.append(dict(case=cid, expected=expected, got=got))
        elif got is not None:
            rows_hit.setdefault(got[1], set()).add(f)
        per_family.setdefault(f, [0, 0])[0 if expected == ('accept',) else 1] += 1
    return failures, rows_hit, per_family


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--json', type=Path)
    parser.add_argument('--skip-numbers', action='store_true')
    args = parser.parse_args()
    started = time.monotonic()
    refs = m.assert_schema_closure()
    clocks = m.timestamp_inventory()
    registry = json.loads((ROOT / 'Plans/storage_value_registry.json').read_text())
    cases = all_cases(registry)
    failures, rows_hit, per_family = run_cases(cases)
    all_rows = [r[0] for phase, (_c, _t, rows) in m.ROWS.items() for r in rows]
    unwitnessed = [r for r in all_rows if r not in rows_hit and r not in m.ENTAILED]
    result = dict(
        status='pass' if not failures and not unwitnessed else 'fail',
        schema_references_resolved=refs, timestamp_fields={'/'.join(k[0]): dict(profile=v[0], row=v[1]) for k, v in clocks.items()},
        cases=len(cases), positives=sum(1 for x in cases if x[4] == ('accept',)), negatives=sum(1 for x in cases if x[4] != ('accept',)),
        rows=len(all_rows), rows_witnessed=len(rows_hit), rows_entailed=sorted(m.ENTAILED), rows_unwitnessed=unwitnessed,
        row_families={r: sorted(fs) for r, fs in sorted(rows_hit.items())},
        per_family={f: dict(positives=v[0], negatives=v[1]) for f, v in sorted(per_family.items())},
        failures=failures[:200], failure_count=len(failures))
    if not args.skip_numbers:
        import pm_w3h_numbers as numbers
        result['numbers'] = numbers.run()
        if result['numbers']['status'] != 'pass':
            result['status'] = 'fail'
    result['seconds'] = round(time.monotonic() - started, 1)
    text = json.dumps(result, indent=1, sort_keys=True, default=str)
    if args.json:
        args.json.write_text(text + '\n')
    print(json.dumps({k: v for k, v in result.items() if k not in ('row_families', 'per_family', 'failures')}, indent=1, default=str))
    for f in failures[:25]:
        print('FAIL', f, file=sys.stderr)
    return 0 if result['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
