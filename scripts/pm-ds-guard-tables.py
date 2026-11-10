#!/usr/bin/env python3
"""Run the gated guard tool (Method B) over every lane DS guard-table phase.

Collects every DS witness under the observation recorder, reports the lane
matrix (multi-row observations, rows without a single-row negative), then runs
the tool once per phase table, serially, behind its MemoryGate. Credit is copied
from the tool's own report rows; this driver adds none.
usage: python3 scripts/pm-ds-guard-tables.py --out <dir> [--phase P]... [--collect-only] [--no-unit-tests]
"""
import argparse
import gzip
import hashlib
import json
import sys
import time
from pathlib import Path

import pm_ds_guard_suites as suites
g = suites.g


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--phase', action='append')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--collect-only', action='store_true')
    parser.add_argument('--no-unit-tests', action='store_true')
    parser.add_argument('--only-source', action='append', help='collect only sources with this label prefix')
    parser.add_argument('--max-rss', type=int, default=6144)
    parser.add_argument('--pause-when-low', type=int, default=10)
    parser.add_argument('--resume-at', type=int, default=11)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()
    root = suites.ROOT
    sources = sorted(set(root.glob('scripts/pm_ds_*.py')) | set(root.glob('scripts/pm-ds-*.py'))
                     | {root / 'scripts' / n for n in ('pm_guard_isolation.py', 'pm_home_layout_v2_slot_receipt.py',
                        'pm_event_payload_route.py', 'pm_event_authority_ds_round2.py', 'pm_terminal_workgroup_compatibility.py',
                        'pm_browser_workspace_created.py', 'pm_browser_workspace_created_v2.py',
                        'pm_browser_workspace_reset.py', 'pm-browser-event-admission.py')})
    inputs = {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sources}
    collected, counts = suites.collect(progress=lambda label: None, include_unit_tests=not args.no_unit_tests,
                                       only=args.only_source)
    summary = dict(tool_sha256=inputs['scripts/pm_guard_isolation.py'], source_sha256=inputs,
                   collect_seconds=round(time.monotonic() - started, 1), counts=counts, suites=[])
    gate = g.MemoryGate(args.max_rss, args.pause_when_low, args.resume_at, 30, 2700)
    for phase in suites.phases():
        if args.phase and phase not in args.phase:
            continue
        slot = collected.get(phase, {'controls': {}, 'negatives': {}, 'multi': {}})
        rows = [name for name, _, _, _ in suites.table_rows(phase)]
        witnessed = sorted({e['rows'][0] for e in slot['negatives'].values()})
        entry = dict(phase=phase, rows=rows, controls=len(slot['controls']), negatives=len(slot['negatives']),
                     witnessed=witnessed, rows_without_negative=[r for r in rows if r not in witnessed],
                     row_witness_counts={r: sum(e['count'] for e in slot['negatives'].values() if e['rows'][0] == r) for r in rows},
                     row_witness_sources={e['rows'][0]: e['sources'][:4] for e in slot['negatives'].values()},
                     multi=[{'rows': e['rows'], 'count': e['count'], 'sources': e['sources'][:6]} for e in slot['multi'].values()],
                     lane_matrix=suites.lane_matrix(phase, slot))
        if not args.collect_only and slot['controls'] and slot['negatives']:
            path = root / f'scripts/{suites.T.TABLE_PREFIX}{phase}.py'
            stops = [e for e in g.prescan_sources(path) if e['kind'] in g.STATIC_STOP_KINDS]
            suite = suites.suite_for(phase, slot)
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
                  f"N={entry['tool_negatives']} C={entry['tool_controls']} {entry['seconds']}s", file=sys.stderr, flush=True)
        else:
            print(f"{phase} collected N={len(slot['negatives'])} C={len(slot['controls'])} multi={len(slot['multi'])} "
                  f"without={entry['rows_without_negative']}", file=sys.stderr, flush=True)
        summary['suites'].append(entry)
    summary['seconds'] = round(time.monotonic() - started, 1)
    summary['totals'] = dict(tables=len(summary['suites']), rows=sum(len(s['rows']) for s in summary['suites']),
                             witnessed=sum(len(s['witnessed']) for s in summary['suites']),
                             proved=sum(len(s.get('proved', [])) for s in summary['suites']),
                             multi=sum(len(s['multi']) for s in summary['suites']),
                             lane_matrix_problems=sum(len(s['lane_matrix']) for s in summary['suites']))
    (args.out / 'summary.json').write_text(json.dumps(summary, indent=1, sort_keys=True, default=str) + '\n')
    print(json.dumps(dict(counts={k: v for k, v in counts.items() if k != 'source_exceptions'},
                          source_exceptions=len(counts['source_exceptions']), totals=summary['totals'])))
    return 0 if summary['totals']['proved'] == summary['totals']['rows'] else 1


if __name__ == '__main__':
    sys.exit(main())
