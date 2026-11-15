#!/usr/bin/env python3
"""Run the gated guard tool (Method B, 004bdedd63) over every W3H guard-table phase suite.

One tool run per phase table, serial, behind the tool's MemoryGate. Credit is copied from the tool's own
report rows; this driver adds none. A table with no reachable witness is listed under rows_without_negative
with its proof from pm_w3h_events.ENTAILED.
Usage: python3 scripts/pm-w3h-guard-tables.py --out <dir> [--phase <phase>]... [--collect-only]
"""
import argparse
import gzip
import hashlib
import json
import pickle
import sys
import time
from pathlib import Path

import pm_w3h_guard_suites as suites
g = suites.g
m = suites.m


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--phase', action='append')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--collect-only', action='store_true')
    parser.add_argument('--negative-limit', type=int, default=4)
    parser.add_argument('--control-limit', type=int, default=6)
    parser.add_argument('--max-rss', type=int, default=1900)
    parser.add_argument('--pause-when-low', type=int, default=10)
    parser.add_argument('--resume-at', type=int, default=12)
    parser.add_argument('--save-collection', type=Path)
    parser.add_argument('--load-collection', type=Path)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()
    root = suites.ROOT
    sources = (sorted(root.glob('scripts/pm_w3h*.py')) + sorted(root.glob('scripts/pm-w3h*.py'))
               + [root / 'scripts/pm_guard_isolation.py', root / 'scripts/pm_event_numbers.py', root / 'scripts/pm_event_datetime.py',
                  root / 'Plans/storage_value_registry.json'])
    inputs = {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(set(sources))}
    if args.load_collection:
        saved = pickle.loads(args.load_collection.read_bytes())
        if saved['inputs'] != inputs:
            raise SystemExit('collection was made from different checker, table, fixture or tool sources')
        collected, counts = saved['collected'], saved['counts']
    else:
        collected, counts = suites.collect(progress=lambda i: print(f'collect {i}', file=sys.stderr, flush=True))
        if args.save_collection:
            args.save_collection.write_bytes(pickle.dumps(dict(inputs=inputs, collected=collected, counts=counts), protocol=5))
    summary = dict(tool_sha256=inputs['scripts/pm_guard_isolation.py'], source_sha256=inputs,
                   collect_seconds=round(time.monotonic() - started, 1), counts=counts,
                   negative_limit=args.negative_limit, control_limit=args.control_limit, suites=[])
    gate = g.MemoryGate(args.max_rss, args.pause_when_low, args.resume_at, 30, 2700)
    for phase in m.ROWS:
        if args.phase and phase not in args.phase:
            continue
        slot = collected.get(phase, dict(controls={}, negatives={}))
        rows = [name for name, _, _ in suites.table_rows(phase)]
        controls, negatives = list(slot['controls'].values()), list(slot['negatives'].values())
        entry = dict(phase=phase, rows=rows, controls=len(controls), negatives=len(negatives),
                     targets=sorted({n['target'] for n in negatives}),
                     row_negatives={r: sum(1 for n in negatives if n['target'] == r) for r in rows},
                     row_families={r: sorted({f for n in negatives if n['target'] == r for f in n['families']}) for r in rows},
                     lane_matrix=suites.lane_matrix(phase, controls, negatives))
        entry['rows_without_negative'] = {r: m.ENTAILED.get(r, 'NO PROOF') for r in rows if r not in entry['targets']}
        suite = None if args.collect_only else suites.suite_for(phase, slot, args.negative_limit, args.control_limit)
        if suite is not None:
            path = root / f'scripts/{suites.TABLE_PREFIX}{phase}.py'
            stops = [e for e in g.prescan_sources(path) if e['kind'] in g.STATIC_STOP_KINDS]
            t = time.monotonic()
            report = g.run(suite, memory=gate) if not stops else g.prescan_report(stops)
            name = f'{phase}.json.gz'
            with gzip.open(args.out / name, 'wt') as handle:
                handle.write(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
            rows_report = report.get('rows', [])
            entry.update(tool_status=report['status'], seconds=round(time.monotonic() - t, 1), evaluations=report.get('evaluations'),
                         tool_controls=len(suite.controls), tool_negatives=len(suite.negatives),
                         proved=sorted(r['id'] for r in rows_report if r.get('proved')),
                         unproved=sorted(report.get('unproved_guards', [])),
                         failure_kinds=sorted({f['kind'] for f in report.get('failures', [])}),
                         own_flips=sum(len(r.get('flips', [])) for r in rows_report),
                         stays=sum(len(r.get('stays', [])) for r in rows_report),
                         masked=report.get('masked_negatives', []),
                         unrelated=sum(len(r.get('unrelated_changes', [])) for r in rows_report),
                         report=name, report_sha256=hashlib.sha256((args.out / name).read_bytes()).hexdigest())
            print(f"{phase} {entry['tool_status']} proved {len(entry['proved'])}/{len(rows)} N={entry['tool_negatives']}/{len(negatives)} "
                  f"C={entry['tool_controls']}/{len(controls)} {entry['seconds']}s", file=sys.stderr, flush=True)
        else:
            entry.update(tool_status='NOT_RUN' if args.collect_only else 'NO_REACHABLE_WITNESS', proved=[], unproved=rows)
            print(f"{phase} {entry['tool_status']} N={len(negatives)} C={len(controls)} matrix={len(entry['lane_matrix'])}",
                  file=sys.stderr, flush=True)
        summary['suites'].append(entry)
    summary['seconds'] = round(time.monotonic() - started, 1)
    summary['totals'] = dict(rows=sum(len(s['rows']) for s in summary['suites']),
                             proved=sum(len(s['proved']) for s in summary['suites']),
                             unproved_with_proof=sorted(r for s in summary['suites'] for r, why in s['rows_without_negative'].items() if why != 'NO PROOF'),
                             unproved_without_proof=sorted(r for s in summary['suites'] for r, why in s['rows_without_negative'].items() if why == 'NO PROOF'),
                             tool_fail=[s['phase'] for s in summary['suites'] if s['tool_status'] not in ('PASS', 'NO_REACHABLE_WITNESS', 'NOT_RUN')],
                             lane_matrix_problems=sum(len(s['lane_matrix']) for s in summary['suites']))
    name = 'summary.json' if not args.phase else 'summary-' + hashlib.sha256(' '.join(args.phase).encode()).hexdigest()[:12] + '.json'
    (args.out / name).write_text(json.dumps(summary, indent=1, sort_keys=True, default=str) + '\n')
    print(json.dumps(dict(counts=counts, seconds=summary['seconds'], totals=summary['totals']), indent=1))
    bad = summary['totals']['tool_fail'] or summary['totals']['unproved_without_proof'] or summary['totals']['lane_matrix_problems']
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
