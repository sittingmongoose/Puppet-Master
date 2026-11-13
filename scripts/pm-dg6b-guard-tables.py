#!/usr/bin/env python3
"""Run the gated guard tool (Method B) over every DG6B guard-table phase suite.

One tool run per (phase table, family), serially in this process behind the
tool's MemoryGate. Each table module is prescanned from its text
(pm_guard_isolation.prescan_sources) before the first suite that names it.
Credit is copied from the tool's own report rows; this driver adds none.
--family shared runs only the phases no family reaches (JSON text, schema
references and preparation fences); every other shared witness rides with each
family suite of the same phase.
"""
import argparse
import hashlib
import json
from pathlib import Path
import sys
import time

import pm_dg6b_guard_suites as suites
g = suites.g
dg = suites.dg


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', required=True, help="one DG6B event family, or 'shared'")
    parser.add_argument('--phase', action='append', help='phase filter (repeatable)')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--collect-only', action='store_true')
    parser.add_argument('--no-flips', action='store_true', help='skip the complete-boundary flip re-runs')
    parser.add_argument('--pool', type=Path, help='directory of <family>/negatives.json from a collect pass (declared borrowing)')
    parser.add_argument('--max-rss', type=int, default=4096)
    parser.add_argument('--pause-when-low', type=int, default=10)
    parser.add_argument('--resume-at', type=int, default=11)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    shared_mode = args.family == 'shared'
    started = time.monotonic()
    controls, negatives, findings, result = suites.collect('auth.github.authenticated' if shared_mode else args.family,
                                                          flips=not args.no_flips)
    (args.out / 'negatives.json').write_text(json.dumps(
        [{k: n[k] for k in ('family', 'label', 'phase', 'row', 'code', 'value')} for n in negatives], sort_keys=True) + '\n')
    collected = suites.suites(controls, negatives)
    merged = suites.merged(collected, None if shared_mode else args.family)
    summary = dict(family=args.family, checker_status=result['status'],
                   tool_sha256=hashlib.sha256((suites.ROOT / 'scripts/pm_guard_isolation.py').read_bytes()).hexdigest(),
                   checker_sha256=hashlib.sha256((suites.ROOT / 'scripts/pm-dg6b-event-contracts.py').read_bytes()).hexdigest(),
                   collect_seconds=round(time.monotonic() - started, 1), findings=findings, suites=[])
    pool = {}
    if args.pool:
        for path in sorted(args.pool.glob('*/negatives.json')):
            pool[path.parent.name] = json.loads(path.read_text())
    prescanned = {}
    gate = g.MemoryGate(args.max_rss, args.pause_when_low, args.resume_at, 30, 2700)
    for (phase, family), slot in sorted(merged.items()):
        if args.phase and phase not in args.phase:
            continue
        if shared_mode != (family == 'shared'):
            continue
        rows = [name for name, _, _ in dg.table_rows(phase)]
        borrowed = suites.borrow(phase, family, slot, pool) if family != 'shared' else []
        controls_, negatives_ = list(slot['controls'].values()), list(slot['negatives'].values())
        entry = dict(phase=phase, family=family, rows=rows, controls=len(controls_), negatives=len(negatives_),
                     targets=sorted({n['target'] for n in negatives_}),
                     aliases=sum(len(n['labels']) - 1 for n in negatives_),
                     lane_matrix=suites.lane_matrix(phase, controls_, negatives_))
        entry['rows_without_negative'] = [r for r in rows if r not in entry['targets']]
        entry['borrowed'] = borrowed
        flips = [f for n in negatives_ for f in n['flips'] if f is not None]
        entry['complete_boundary_flips'] = dict(accepted=flips.count('accepted'),
                                                refused_later=sorted({f for f in flips if f != 'accepted'}),
                                                refused_later_count=sum(f != 'accepted' for f in flips))
        if not args.collect_only and negatives_ and controls_:
            path = suites.ROOT / f'scripts/pm_dg6b_table_{phase}.py'
            if phase not in prescanned:
                prescanned[phase] = [e for e in g.prescan_sources(path) if e['kind'] in g.STATIC_STOP_KINDS]
            suite = suites.suite_for(phase, family, slot)
            t = time.monotonic()
            report = g.run(suite, memory=gate) if not prescanned[phase] else g.prescan_report(prescanned[phase])
            name = f'{phase}__{family}'
            (args.out / f'{name}.json').write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
            entry.update(tool_status=report['status'], seconds=round(time.monotonic() - t, 1),
                         evaluations=report.get('evaluations'),
                         proved=sorted(r['id'] for r in report.get('rows', []) if r.get('proved')),
                         unproved=sorted(report.get('unproved_guards', [])),
                         failure_kinds=sorted({f['kind'] for f in report.get('failures', [])}),
                         masked=report.get('masked_negatives', []), report=name + '.json',
                         report_sha256=hashlib.sha256((args.out / f'{name}.json').read_bytes()).hexdigest())
            print(f"{phase} [{family}] {entry['tool_status']} proved {len(entry['proved'])}/{len(rows)} "
                  f"N={len(negatives_)} C={len(controls_)} {entry['seconds']}s", file=sys.stderr, flush=True)
        summary['suites'].append(entry)
    summary['seconds'] = round(time.monotonic() - started, 1)
    (args.out / 'summary.json').write_text(json.dumps(summary, indent=1, sort_keys=True, default=str) + '\n')
    bad = [s for s in summary['suites'] if s.get('tool_status') not in (None, 'PASS') or s['lane_matrix']
           or s['rows_without_negative']]
    return 1 if findings or bad else 0


if __name__ == '__main__':
    sys.exit(main())
