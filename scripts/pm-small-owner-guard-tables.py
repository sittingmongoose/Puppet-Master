#!/usr/bin/env python3
"""Run the gated guard tool (Method B) over every DM guard-table phase suite.

One tool run per phase table, serial, behind the tool's MemoryGate. Credit is
copied from the tool's own report rows; this driver adds none.
Usage: python3 scripts/pm-small-owner-guard-tables.py --out <dir> [--phase <phase>]... [--collect-only]
"""
import argparse
import gzip
import hashlib
import json
import sys
import time
from pathlib import Path

import pm_small_owner_guard_suites as suites
g = suites.g


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--phase', action='append')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--collect-only', action='store_true')
    parser.add_argument('--negative-limit', type=int, default=4)
    parser.add_argument('--control-limit', type=int, default=6)
    parser.add_argument('--max-rss', type=int, default=6144)
    parser.add_argument('--pause-when-low', type=int, default=10)
    parser.add_argument('--resume-at', type=int, default=11)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()
    root = suites.ROOT
    sources = (sorted(root.glob('scripts/pm_small_owner*.py')) + sorted(root.glob('scripts/pm-small-owner*.py'))
               + [root / 'scripts/pm_guard_isolation.py', root / 'scripts/pm_event_numbers.py',
                  root / 'Plans/small_owner_event_fixtures.json'])
    inputs = {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(set(sources))}
    collected, counts = suites.collect(progress=lambda f: print(f'collect {f}', file=sys.stderr, flush=True))
    collect_seconds = round(time.monotonic() - started, 1)
    summary = dict(tool_sha256=inputs['scripts/pm_guard_isolation.py'], source_sha256=inputs,
                   collect_seconds=collect_seconds, counts=counts,
                   negative_limit=args.negative_limit, control_limit=args.control_limit, suites=[])
    phases = sorted(p.stem[len(suites.TABLE_PREFIX):] for p in (root / 'scripts').glob(suites.TABLE_PREFIX + '*.py'))
    gate = g.MemoryGate(args.max_rss, args.pause_when_low, args.resume_at, 30, 2700)
    for phase in phases:
        if args.phase and phase not in args.phase:
            continue
        slot = collected.get(phase, dict(controls={}, negatives={}))
        rows = [name for name, _, _ in suites.table_rows(phase)]
        controls, negatives = list(slot['controls'].values()), list(slot['negatives'].values())
        entry = dict(phase=phase, rows=rows, controls=len(controls), negatives=len(negatives),
                     targets=sorted({n['target'] for n in negatives}),
                     row_negatives={r: sum(1 for n in negatives if n['target'] == r) for r in rows},
                     lane_matrix=suites.lane_matrix(phase, controls, negatives))
        entry['rows_without_negative'] = [r for r in rows if r not in entry['targets']]
        if not args.collect_only and negatives and controls:
            path = root / f'scripts/{suites.TABLE_PREFIX}{phase}.py'
            stops = [e for e in g.prescan_sources(path) if e['kind'] in g.STATIC_STOP_KINDS]
            suite = suites.suite_for(phase, slot, args.negative_limit, args.control_limit)
            t = time.monotonic()
            report = g.run(suite, memory=gate) if suite is not None and not stops else g.prescan_report(stops)
            name = f'{phase}.json.gz'
            with gzip.open(args.out / name, 'wt') as handle:
                handle.write(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
            rows_report = report.get('rows', [])
            entry.update(tool_status=report['status'], seconds=round(time.monotonic() - t, 1),
                         evaluations=report.get('evaluations'),
                         tool_controls=len(suite.controls) if suite else 0,
                         tool_negatives=len(suite.negatives) if suite else 0,
                         proved=sorted(r['id'] for r in rows_report if r.get('proved')),
                         unproved=sorted(report.get('unproved_guards', [])),
                         failure_kinds=sorted({f['kind'] for f in report.get('failures', [])}),
                         own_flips=sum(len(r.get('flips', [])) for r in rows_report),
                         stays=sum(len(r.get('stays', [])) for r in rows_report),
                         masked=report.get('masked_negatives', []),
                         unrelated=sum(len(r.get('unrelated_changes', [])) for r in rows_report),
                         report=name, report_sha256=hashlib.sha256((args.out / name).read_bytes()).hexdigest())
            print(f"{phase} {entry['tool_status']} proved {len(entry['proved'])}/{len(rows)} "
                  f"N={entry['tool_negatives']}/{len(negatives)} C={entry['tool_controls']}/{len(controls)} "
                  f"{entry['seconds']}s", file=sys.stderr, flush=True)
        else:
            print(f"{phase} collected N={len(negatives)} C={len(controls)} "
                  f"without_negative={entry['rows_without_negative']} matrix={len(entry['lane_matrix'])}",
                  file=sys.stderr, flush=True)
        summary['suites'].append(entry)
    summary['seconds'] = round(time.monotonic() - started, 1)
    (args.out / 'summary.json').write_text(json.dumps(summary, indent=1, sort_keys=True, default=str) + '\n')
    print(json.dumps(dict(counts=counts, seconds=summary['seconds'],
                          proved=sum(len(s.get('proved', [])) for s in summary['suites']),
                          rows=sum(len(s['rows']) for s in summary['suites']))))
    return 0


if __name__ == '__main__':
    sys.exit(main())
