#!/usr/bin/env python3
"""Run the gated guard tool (Method B) over every DS15 guard-table phase suite.

One tool run per phase table (all 23 families' witnesses together; the per-family witness
coverage of every row is recorded beside it). Runs are serial in this process, behind the tool's
MemoryGate. Each table module is prescanned from its text (pm_guard_isolation.prescan_sources)
before its suite runs. Credit is copied from the tool's own report rows; this driver adds none.

Usage: python3 scripts/pm-ds15-guard-tables.py --out <dir> [--phase <phase>]... [--collect-only]
       [--save-collection <file>] [--load-collection <file>] [--flips]
       [--negative-limit N] [--control-limit N]
"""
import argparse
import gzip
import hashlib
import json
import pickle
import sys
import time
from pathlib import Path

import pm_ds15_guard_suites as suites
g = suites.g


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--phase', action='append', help='phase table filter (repeatable)')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--collect-only', action='store_true')
    parser.add_argument('--flips', action='store_true', help='also re-run each refused witness with its row cut (lane evidence)')
    parser.add_argument('--negative-limit', type=int, default=10, help='tool negatives per row (the lane matrix checks all)')
    parser.add_argument('--control-limit', type=int, default=10)
    parser.add_argument('--save-collection', type=Path)
    parser.add_argument('--load-collection', type=Path)
    parser.add_argument('--max-rss', type=int, default=6144)
    parser.add_argument('--pause-when-low', type=int, default=10)
    parser.add_argument('--resume-at', type=int, default=11)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()
    root = suites.ROOT
    sources = (sorted(root.glob('scripts/pm_ds15*.py')) + sorted(root.glob('scripts/pm-ds15*.py'))
               + [root / 'scripts/pm_guard_isolation.py', root / 'scripts/pm_event_numbers.py']
               + sorted(root.glob('Plans/ds15_*.json')) + [root / 'Plans/event_number_recipe_corpus.json'])
    inputs = {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(set(sources))}
    if args.load_collection:
        saved = pickle.loads(args.load_collection.read_bytes())
        if saved['inputs'] != inputs:
            raise SystemExit('collection was made from different checker, table, fixture or tool sources')
        collected, findings, counts, collect_seconds = saved['collected'], saved['findings'], saved['counts'], saved['collect_seconds']
    else:
        collected, findings, counts = suites.collect(flips=args.flips,
                                                     progress=lambda n: print(f'collect {n}', file=sys.stderr, flush=True))
        collect_seconds = round(time.monotonic() - started, 1)
        if args.save_collection:
            args.save_collection.write_bytes(pickle.dumps(dict(inputs=inputs, collected=collected, findings=findings,
                                                               counts=counts, collect_seconds=collect_seconds), protocol=5))
    summary = dict(tool_sha256=inputs['scripts/pm_guard_isolation.py'], source_sha256=inputs, collect_seconds=collect_seconds,
                   counts=counts, findings=findings, negative_limit=args.negative_limit, control_limit=args.control_limit,
                   suites=[])
    phases = sorted(p.stem[len(suites.TABLE_PREFIX):] for p in (root / 'scripts').glob(suites.TABLE_PREFIX + '*.py'))
    gate = g.MemoryGate(args.max_rss, args.pause_when_low, args.resume_at, 30, 2700)
    for phase in phases:
        if args.phase and phase not in args.phase:
            continue
        slot = collected.get(phase, dict(controls={}, negatives={}))
        rows = [name for name, _, _ in suites.table_rows(phase)]
        controls, negatives = list(slot['controls'].values()), list(slot['negatives'].values())
        entry = dict(phase=phase, rows=rows, controls=len(controls), negatives=len(negatives),
                     targets=sorted({n['target'] for n in negatives}), aliases=sum(len(n['aliases']) for n in negatives),
                     row_families={r: sorted({f for n in negatives if n['target'] == r for f in n['families']}) for r in rows},
                     row_negatives={r: sum(1 for n in negatives if n['target'] == r) for r in rows},
                     lane_matrix=suites.lane_matrix(phase, controls, negatives))
        entry['rows_without_negative'] = [r for r in rows if r not in entry['targets']]
        flips = [f for n in negatives for f in n['flips']]
        entry['complete_boundary_flips'] = dict(accepted=flips.count('accepted'), refused_later_count=sum(f != 'accepted' for f in flips),
                                                refused_later=sorted({f for f in flips if f != 'accepted'}))
        if not args.collect_only and negatives and controls:
            path = root / f'scripts/{suites.TABLE_PREFIX}{phase}.py'
            stops = [e for e in g.prescan_sources(path) if e['kind'] in g.STATIC_STOP_KINDS]
            suite = suites.suite_for(phase, slot, args.negative_limit, args.control_limit)
            t = time.monotonic()
            report = g.run(suite, memory=gate) if not stops else g.prescan_report(stops)
            name = f'{phase}.json.gz'
            with gzip.open(args.out / name, 'wt') as handle:
                handle.write(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
            rows_report = report.get('rows', [])
            entry.update(tool_status=report['status'], seconds=round(time.monotonic() - t, 1),
                         evaluations=report.get('evaluations'), tool_controls=len(suite.controls),
                         tool_negatives=len(suite.negatives),
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
            print(f"{phase} collected N={len(negatives)} C={len(controls)} without_negative={entry['rows_without_negative']} "
                  f"matrix={len(entry['lane_matrix'])}", file=sys.stderr, flush=True)
        summary['suites'].append(entry)
    summary['seconds'] = round(time.monotonic() - started, 1)
    name = 'summary.json' if not args.phase else 'summary-' + hashlib.sha256(' '.join(args.phase).encode()).hexdigest()[:12] + '.json'
    (args.out / name).write_text(json.dumps(summary, indent=1, sort_keys=True, default=str) + '\n')
    bad = [s for s in summary['suites'] if s.get('tool_status') not in (None, 'PASS') or s['lane_matrix'] or s['rows_without_negative']]
    open_findings = [f for f in findings if f['kind'] != 'excluded_from_table_proof']
    return 1 if open_findings or bad else 0


if __name__ == '__main__':
    sys.exit(main())
