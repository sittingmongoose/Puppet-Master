#!/usr/bin/env python3
"""Run the gated guard tool (Method B) over every DR guard-table phase suite.

One tool run per (phase table, family). Runs are serial in this process,
behind the tool's MemoryGate. Each table module is prescanned from its text
(pm_guard_isolation.prescan_sources) before the first suite that names it.
Credit is copied from the tool's own report rows; this driver adds none.
"""
import argparse
import hashlib
import json
from pathlib import Path
import sys
import time

import pm_runtime_artifact_guard_suites as suites
g = suites.g
dr = suites.dr


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', action='append', help='event family (repeatable); shared witnesses ride with every family')
    parser.add_argument('--phase', action='append', help='phase id filter (repeatable)')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--collect-only', action='store_true')
    parser.add_argument('--max-rss', type=int, default=4096)
    parser.add_argument('--pause-when-low', type=int, default=10)
    parser.add_argument('--resume-at', type=int, default=11)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    families = None if not args.family else set(args.family) | {'shared'}
    run_shared_only = not args.family or 'shared' in args.family
    started = time.monotonic()
    collected, findings = suites.collect(families)
    summary = dict(tool_sha256=hashlib.sha256((suites.ROOT / 'scripts/pm_guard_isolation.py').read_bytes()).hexdigest(),
                   checker_sha256=hashlib.sha256((suites.ROOT / 'scripts/pm-runtime-artifact-event-drafts.py').read_bytes()).hexdigest(),
                   collect_seconds=round(time.monotonic() - started, 1), findings=findings, suites=[])
    prescanned = {}
    gate = g.MemoryGate(args.max_rss, args.pause_when_low, args.resume_at, 30, 2700)
    # Shared witnesses (toy schemas, codec and oracle helpers) ride with every
    # family suite of the same phase; a phase no family reaches runs once as shared.
    merged = {}
    for (phase, family), slot in collected.items():
        if family == 'shared':
            continue
        both = dict(controls=dict(slot['controls']), negatives=dict(slot['negatives']))
        shared = collected.get((phase, 'shared'))
        if shared:
            # An identical observation keeps the family's control id; shared
            # negatives naming that observation are pointed at it.
            remap = {}
            for k, control in shared['controls'].items():
                if k in both['controls']:
                    remap[control['id']] = both['controls'][k]['id']
                else:
                    both['controls'][k] = control
            for k, negative in shared['negatives'].items():
                if k not in both['negatives']:
                    both['negatives'][k] = dict(negative, control=remap.get(negative['control'], negative['control']))
        merged[phase, family] = both
    for (phase, family), slot in collected.items():
        if family == 'shared' and run_shared_only and not any(p == phase for p, _ in merged):
            merged[phase, family] = slot
    for (phase, family), slot in sorted(merged.items()):
        if args.phase and phase not in args.phase:
            continue
        rows = [name for name, _, _ in dr.table_rows(phase)]
        controls, negatives = list(slot['controls'].values()), list(slot['negatives'].values())
        entry = dict(phase=phase, family=family, rows=rows, controls=len(controls), negatives=len(negatives),
                     targets=sorted({n['target'] for n in negatives}), aliases=sum(len(n['aliases']) for n in negatives),
                     lane_matrix=suites.lane_matrix(phase, controls, negatives))
        entry['rows_without_negative'] = [r for r in rows if r not in entry['targets']]
        flips = [f for n in negatives for f in n['flips']]
        entry['complete_boundary_flips'] = dict(accepted=flips.count('accepted'),
                                                refused_later=sorted({f for f in flips if f != 'accepted'}),
                                                refused_later_count=sum(f != 'accepted' for f in flips))
        if not args.collect_only and negatives:
            module_name = dr.TABLE_PHASES[phase][0]
            path = suites.ROOT / f'scripts/pm_runtime_artifact_table_{module_name}.py'
            if module_name not in prescanned:
                stops = [e for e in g.prescan_sources(path) if e['kind'] in g.STATIC_STOP_KINDS]
                prescanned[module_name] = stops
            suite = suites.suite_for(phase, family, slot)
            t = time.monotonic()
            report = g.run(suite, memory=gate) if not prescanned[module_name] else g.prescan_report(prescanned[module_name])
            name = f'{phase}__{family}'.replace('/', '_')
            (args.out / f'{name}.json').write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
            entry.update(tool_status=report['status'], seconds=round(time.monotonic() - t, 1),
                         evaluations=report.get('evaluations'),
                         proved=sorted(r['id'] for r in report.get('rows', []) if r.get('proved')),
                         unproved=sorted(report.get('unproved_guards', [])),
                         failure_kinds=sorted({f['kind'] for f in report.get('failures', [])}),
                         masked=report.get('masked_negatives', []), report=name + '.json',
                         report_sha256=hashlib.sha256((args.out / f'{name}.json').read_bytes()).hexdigest())
            print(f"{phase} [{family}] {entry['tool_status']} proved {len(entry['proved'])}/{len(rows)} "
                  f"N={len(negatives)} C={len(controls)} {entry['seconds']}s", file=sys.stderr, flush=True)
        summary['suites'].append(entry)
    summary['seconds'] = round(time.monotonic() - started, 1)
    (args.out / 'summary.json').write_text(json.dumps(summary, indent=1, sort_keys=True, default=str) + '\n')
    bad = [s for s in summary['suites'] if s.get('tool_status') not in (None, 'PASS') or s['lane_matrix']]
    open_findings = [f for f in findings if f['kind'] != 'excluded_from_table_proof']
    return 1 if open_findings or bad else 0


if __name__ == '__main__':
    sys.exit(main())
