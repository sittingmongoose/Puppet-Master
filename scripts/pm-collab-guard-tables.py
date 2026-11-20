#!/usr/bin/env python3
"""Run the gated guard tool (Method B) over every DC guard-table phase suite.

One tool run per phase table (all eighteen families' witnesses together; the per-family witness
coverage of every row is recorded beside it). Runs are serial in this process, behind the tool's
MemoryGate. Each table module is prescanned from its text (pm_guard_isolation.prescan_sources)
before its suite runs. Credit is copied from the tool's own report rows; this driver adds none.

Usage: python3 scripts/pm-collab-guard-tables.py --out <dir> [--phase <phase>]... [--collect-only]
"""
import argparse
import gzip
import pickle
import hashlib
import json
from pathlib import Path
import sys
import time

import pm_collab_guard_suites as suites
g = suites.g
dc = suites.dc


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--phase', action='append', help='phase table filter (repeatable)')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--collect-only', action='store_true')
    parser.add_argument('--no-flips', action='store_true', help='skip the complete-boundary flip re-run (lane evidence)')
    parser.add_argument('--control-limit', type=int, default=40)
    parser.add_argument('--save-collection', type=Path, help='write the collected suites (local pickle) for a later --load-collection run')
    parser.add_argument('--load-collection', type=Path, help='reuse a collection written by --save-collection at the same checker hash')
    parser.add_argument('--max-rss', type=int, default=4096)
    parser.add_argument('--pause-when-low', type=int, default=10)
    parser.add_argument('--resume-at', type=int, default=11)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()
    sources = sorted(suites.ROOT.glob('scripts/pm_collab*.py')) + [suites.ROOT / 'scripts/pm_guard_isolation.py']
    inputs = {str(p.relative_to(suites.ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sources}
    if args.load_collection:
        saved = pickle.loads(args.load_collection.read_bytes())
        if saved['inputs'] != inputs:
            raise SystemExit('collection was made from different checker, table or tool sources')
        collected, findings, collect_seconds = saved['collected'], saved['findings'], saved['collect_seconds']
    else:
        collected, findings = suites.collect(flips=not args.no_flips,
                                             progress=lambda n: print(f'collect {n}', file=sys.stderr, flush=True))
        collect_seconds = round(time.monotonic() - started, 1)
        if args.save_collection:
            args.save_collection.write_bytes(pickle.dumps(dict(inputs=inputs, collected=collected, findings=findings,
                                                               collect_seconds=collect_seconds, flips=not args.no_flips), protocol=5))
    summary = dict(tool_sha256=inputs['scripts/pm_guard_isolation.py'], checker_sha256=inputs['scripts/pm_collaboration_events.py'],
                   source_sha256=inputs, collect_seconds=collect_seconds, findings=findings, suites=[])
    phases = sorted(p.stem[len('pm_collab_table_'):] for p in (suites.ROOT / 'scripts').glob('pm_collab_table_*.py'))
    gate = g.MemoryGate(args.max_rss, args.pause_when_low, args.resume_at, 30, 2700)
    for phase in phases:
        if args.phase and phase not in args.phase:
            continue
        slot = collected.get(phase, dict(controls={}, negatives={}))
        rows = [name for name, _, _ in dc.table_rows(phase)]
        controls, negatives = list(slot['controls'].values()), list(slot['negatives'].values())
        entry = dict(phase=phase, rows=rows, controls=len(controls), negatives=len(negatives),
                     tool_controls=len(suites.tool_controls(controls, args.control_limit)),
                     targets=sorted({n['target'] for n in negatives}), aliases=sum(len(n['aliases']) for n in negatives),
                     row_families={r: sorted({f for n in negatives if n['target'] == r for f in n['families']}) for r in rows},
                     lane_matrix=suites.lane_matrix(phase, controls, negatives))
        entry['rows_without_negative'] = [r for r in rows if r not in entry['targets']]
        flips = [f for n in negatives for f in n['flips'] if f is not None]
        entry['complete_boundary_flips'] = dict(accepted=flips.count('accepted'),
                                                refused_later=sorted({f for f in flips if f != 'accepted'}),
                                                refused_later_count=sum(f != 'accepted' for f in flips))
        if not args.collect_only and negatives and controls:
            path = suites.ROOT / f'scripts/pm_collab_table_{phase}.py'
            stops = [e for e in g.prescan_sources(path) if e['kind'] in g.STATIC_STOP_KINDS]
            suite = suites.suite_for(phase, slot, args.control_limit)
            t = time.monotonic()
            report = g.run(suite, memory=gate) if not stops else g.prescan_report(stops)
            name = f'{phase}.json.gz'
            with gzip.open(args.out / name, 'wt') as handle:
                handle.write(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
            entry.update(tool_status=report['status'], seconds=round(time.monotonic() - t, 1),
                         evaluations=report.get('evaluations'),
                         proved=sorted(r['id'] for r in report.get('rows', []) if r.get('proved')),
                         unproved=sorted(report.get('unproved_guards', [])),
                         failure_kinds=sorted({f['kind'] for f in report.get('failures', [])}),
                         masked=report.get('masked_negatives', []), report=name,
                         report_sha256=hashlib.sha256((args.out / name).read_bytes()).hexdigest())
            print(f"{phase} {entry['tool_status']} proved {len(entry['proved'])}/{len(rows)} N={len(negatives)} "
                  f"C={entry['tool_controls']}/{len(controls)} {entry['seconds']}s", file=sys.stderr, flush=True)
        else:
            print(f"{phase} collected N={len(negatives)} C={len(controls)} without_negative={entry['rows_without_negative']} "
                  f"matrix={len(entry['lane_matrix'])}", file=sys.stderr, flush=True)
        summary['suites'].append(entry)
    summary['seconds'] = round(time.monotonic() - started, 1)
    (args.out / ('summary.json' if not args.phase else 'summary-' + hashlib.sha256(' '.join(args.phase).encode()).hexdigest()[:12] + '.json')).write_text(json.dumps(summary, indent=1, sort_keys=True, default=str) + '\n')
    bad = [s for s in summary['suites'] if s.get('tool_status') not in (None, 'PASS') or s['lane_matrix'] or s['rows_without_negative']]
    open_findings = [f for f in findings if f['kind'] != 'excluded_from_table_proof']
    return 1 if open_findings or bad else 0


if __name__ == '__main__':
    sys.exit(main())
