#!/usr/bin/env python3
"""Run the gated guard tool (Method B) over every DF guard-table phase suite.

Usage: python3 scripts/pm-filesafe-guard-tables.py --out DIR [--phase P]... [--family F]...
       [--collect-only] [--save-collection F] [--load-collection F] [--no-flips]

One tool run per phase table (all families pooled; controls capped at 40 with
every family's first control). Runs are serial in this process, behind the
tool's MemoryGate. Each table module is prescanned from its text
(pm_guard_isolation.prescan_sources) before its suite runs. Credit is copied
from the tool's own report rows; this driver adds none.
"""
import argparse
import hashlib
import json
import pickle
from pathlib import Path
import sys
import time

import pm_filesafe_guard_suites as suites
g = suites.g
tables = suites.tables


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--family', action='append')
    parser.add_argument('--phase', action='append')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--collect-only', action='store_true')
    parser.add_argument('--save-collection', type=Path)
    parser.add_argument('--load-collection', type=Path)
    parser.add_argument('--no-flips', action='store_true')
    parser.add_argument('--max-rss', type=int, default=4096)
    parser.add_argument('--pause-when-low', type=int, default=10)
    parser.add_argument('--resume-at', type=int, default=11)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()
    if args.load_collection:
        collected, findings = pickle.loads(args.load_collection.read_bytes())
    else:
        collected, findings = suites.collect(set(args.family) | {'shared'} if args.family else None, flips=not args.no_flips)
        if args.save_collection:
            args.save_collection.write_bytes(pickle.dumps((collected, findings), protocol=5))
    checker_files = ('pm_filesafe_event_authority.py', 'pm_filesafe_event_contracts.py', 'pm_filesafe_schema_graph.py',
                     'pm_filesafe_retention.py', 'pm_filesafe_tables.py', 'pm_filesafe_guard_suites.py', 'pm_filesafe_p2a_cases.py')
    summary = dict(tool_sha256=hashlib.sha256((suites.ROOT / 'scripts/pm_guard_isolation.py').read_bytes()).hexdigest(),
                   checker_sha256={f: hashlib.sha256((suites.ROOT / 'scripts' / f).read_bytes()).hexdigest() for f in checker_files},
                   collect_seconds=round(time.monotonic() - started, 1), findings=findings, suites=[])
    gate = g.MemoryGate(args.max_rss, args.pause_when_low, args.resume_at, 30, 2700)
    for phase in tables.PHASES:
        if args.phase and phase not in args.phase:
            continue
        slot = collected.get(phase, dict(controls={}, negatives={}))
        rows = [name for name, _, _ in tables.rows(phase)]
        controls, negatives = list(slot['controls'].values()), list(slot['negatives'].values())
        entry = dict(phase=phase, rows=rows, controls=len(controls), negatives=len(negatives),
                     families=sorted({n['family'] for n in negatives}),
                     targets=sorted({n['target'] for n in negatives}), aliases=sum(len(n['aliases']) for n in negatives),
                     lane_matrix=suites.lane_matrix(phase, controls, negatives),
                     unprovable=suites.UNPROVABLE.get(phase))
        entry['rows_without_negative'] = [r for r in rows if r not in entry['targets']]
        flips = [f for n in negatives for f in n['flips']]
        entry['complete_boundary_flips'] = dict(accepted=flips.count('accepted'),
                                                refused_later=sorted({f for f in flips if f != 'accepted'}),
                                                refused_later_count=sum(f != 'accepted' for f in flips))
        if not args.collect_only and negatives and controls:
            path = suites.ROOT / f'scripts/pm_filesafe_table_{phase}.py'
            stops = [e for e in g.prescan_sources(path) if e['kind'] in g.STATIC_STOP_KINDS]
            suite = suites.suite_for(phase, slot)
            t = time.monotonic()
            report = g.run(suite, memory=gate) if not stops else g.prescan_report(stops)
            name = phase
            (args.out / f'{name}.json').write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
            entry.update(tool_status=report['status'], seconds=round(time.monotonic() - t, 1),
                         evaluations=report.get('evaluations'), tool_controls=len(suite.controls),
                         proved=sorted(r['id'] for r in report.get('rows', []) if r.get('proved')),
                         unproved=sorted(report.get('unproved_guards', [])),
                         failure_kinds=sorted({f['kind'] for f in report.get('failures', [])}),
                         masked=report.get('masked_negatives', []), report=name + '.json',
                         report_sha256=hashlib.sha256((args.out / f'{name}.json').read_bytes()).hexdigest())
            print(f"{phase} {entry['tool_status']} proved {len(entry['proved'])}/{len(rows)} "
                  f"N={len(negatives)} C={entry['tool_controls']} {entry['seconds']}s", file=sys.stderr, flush=True)
        summary['suites'].append(entry)
    summary['seconds'] = round(time.monotonic() - started, 1)
    (args.out / 'summary.json').write_text(json.dumps(summary, indent=1, sort_keys=True, default=str) + '\n')
    bad = [s for s in summary['suites'] if s.get('tool_status') not in (None, 'PASS') or s['lane_matrix']]
    missing = [s for s in summary['suites'] if s['rows_without_negative'] and not s['unprovable']]
    print(json.dumps(dict(suites=len(summary['suites']), bad=len(bad), rows_missing=sum(len(s['rows_without_negative']) for s in missing),
                          findings=len(findings), seconds=summary['seconds'])), file=sys.stderr)
    return 1 if findings or bad or missing else 0


if __name__ == '__main__':
    sys.exit(main())
