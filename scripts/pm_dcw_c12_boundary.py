#!/usr/bin/env python3
"""C12-DCW complete-boundary closure for named DCW rows; native execution stays NOT_RUN.

For each named row, a complete-boundary witness is a lane witness that the real
complete checker refuses first at exactly that row with its exact code, and
that the same complete checker ACCEPTS when only that row is disabled. That is
the closed form of the supplementary full-path diagnostic in
pm_dcw_guard_suites.collect.

A row with no such witness is classified, never credited:
- `chain`: disabling the row exposes later named refusals on the same witness;
  the chain of rows whose joint cut accepts is recorded (defense in depth);
- `exception`: disabling the row lets the complete checker raise; the deepest
  repository frame is recorded (the row is a fail-closed precondition);
- `stuck`: neither accepted nor terminated within the chain cap.

The gated Method B tool remains the authority for phase-row proof. This file
reads no gated-tool internals and swaps no table entries.
"""
import argparse
import copy
import json
import pickle
import sys
import traceback
from itertools import chain
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_dcw_event_oracles as m
import pm_dcw_guard_rows as rows
import pm_dcw_guard_suites as suites

CHAIN_CAP = 8


def all_witnesses(extra=()):
    from pm_dcw_preflight_guard_cases import cases as preflight_cases
    yield from chain(suites.witnesses(None), suites.number_witnesses(None), preflight_cases(),
                     suites.p2a_witnesses(None), suites.c12_witnesses(None), extra)


def run(w, disabled=frozenset()):
    """One complete-checker execution: (outcome, last recorded row, frame)."""
    recorded = []
    rows.RECORDER = recorded
    rows.DISABLED = frozenset(disabled)
    try:
        try:
            outcome = suites.invoke(w)
        except m.Refusal as exc:
            return dict(outcome=str(exc), row=getattr(exc, 'guard', None))
        except Exception as exc:
            frames = [f for f in traceback.extract_tb(exc.__traceback__) if str(ROOT) in f.filename]
            last = frames[-1] if frames else None
            return dict(outcome='EXCEPTION', type=type(exc).__name__, error=str(exc)[:200],
                        frame=None if last is None else dict(path=str(Path(last.filename).relative_to(ROOT)),
                                                             line=last.lineno, text=last.line))
        return dict(outcome=outcome, row=None)
    finally:
        rows.RECORDER = None
        rows.DISABLED = frozenset()


def classify(w, row):
    first = run(w)
    if first.get('row') != row:
        return dict(status='not_first', first=first)
    single = run(w, {row})
    if single['outcome'] == 'accept':
        return dict(status='complete_boundary', first=first, cut=single)
    steps, disabled, current = [], {row}, single
    while len(steps) < CHAIN_CAP:
        steps.append(current)
        if current['outcome'] in ('accept', 'EXCEPTION') or current.get('row') is None:
            break
        disabled.add(current['row'])
        current = run(w, disabled)
    else:
        steps.append(current)
    final = steps[-1]
    status = 'chain' if final['outcome'] == 'accept' else 'exception' if final['outcome'] == 'EXCEPTION' else 'stuck'
    if single['outcome'] == 'EXCEPTION':
        status = 'exception'
    return dict(status=status, first=first, cut=single, chain=steps, disabled=sorted(disabled))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--collection', required=True, type=Path)
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--rows', nargs='*', help='only these rows (default: rows without an accepting cut)')
    parser.add_argument('--extra', help='module:function yielding additional witnesses')
    args = parser.parse_args()
    collection = pickle.loads(args.collection.read_bytes())
    by_row = {}
    for cut in collection['cuts']:
        by_row.setdefault(cut['row'], []).append(cut)
    targets = set(args.rows) if args.rows else {r for r, cuts in by_row.items() if not any(c['cut'] == 'accept' for c in cuts)}
    extra = ()
    if args.extra:
        module, function = args.extra.split(':')
        extra = getattr(__import__(module), function)()
    # Every witness whose first refusal is a target row is classified, including
    # aliases the collection de-duplicated by observation before its single cut.
    results = {}
    for w in all_witnesses(extra):
        first = run(w)
        r = first.get('row')
        if r not in targets or (r, w['id']) in results:
            continue
        results[(r, w['id'])] = dict(row=r, witness=w['id'], family=w['family'], **classify(w, r))
    report = {}
    for (r, wid), item in sorted(results.items()):
        report.setdefault(r, []).append(item)
    summary = {}
    for r in sorted(targets):
        statuses = [x['status'] for x in report.get(r, [])]
        best = ('complete_boundary' if 'complete_boundary' in statuses else 'chain' if 'chain' in statuses else
                'exception' if 'exception' in statuses else 'stuck' if 'stuck' in statuses else
                'not_first' if statuses else 'no_witness')
        summary[r] = dict(best=best, witnesses=len(statuses), statuses=statuses)
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out / 'boundary-results.json').write_text(json.dumps(report, indent=1, sort_keys=True, default=repr) + '\n')
    (args.out / 'boundary-summary.json').write_text(json.dumps(summary, indent=1, sort_keys=True) + '\n')
    counts = {}
    for v in summary.values():
        counts[v['best']] = counts.get(v['best'], 0) + 1
    print(json.dumps(counts, sort_keys=True))


if __name__ == '__main__':
    main()
