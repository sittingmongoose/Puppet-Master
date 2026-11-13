#!/usr/bin/env python3
"""Run the gated guard tool (Method B) over every DCH guard-table phase.

Collects every witness call of the complete DCH checkers once
(pm_dch_guard_suites: the ordinary checker per family and the Stop checker),
checks the uncapped lane matrix (each control passes every row; each negative
is refused by exactly its own row), then runs the shared tool once per phase
table on the selected controls and negatives (at most --per-row negatives per
row, families round-robin). Runs are serial in this process, behind the tool's
MemoryGate. Each table module is prescanned from its text before use. Credit is
copied from the tool's own report rows; this driver adds none.
"""
import argparse
import gzip
import hashlib
import json
from pathlib import Path
import sys
import time

import pm_dch_guard_suites as suites
g = suites.g
dch = suites.dch


def jsonable(value):
    if isinstance(value, set):
        return sorted(value)
    raise TypeError(type(value).__name__)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', action='append', help='collect only these families (repeatable; Stop is chat.response_stop_requested)')
    parser.add_argument('--phase', action='append', help='run the tool only for these phases (repeatable)')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--collect-only', action='store_true')
    parser.add_argument('--per-row', type=int, default=5)
    parser.add_argument('--max-controls', type=int, default=4)
    parser.add_argument('--max-rss', type=int, default=4096)
    parser.add_argument('--pause-when-low', type=int, default=10)
    parser.add_argument('--resume-at', type=int, default=11)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()
    collector, findings = suites.collect(set(args.family) if args.family else None)
    phases = collector.phases
    sources = ['scripts/pm_guard_isolation.py', 'scripts/pm_dch_events.py', 'scripts/pm_dch_stop.py',
               'scripts/pm_dch_guard_suites.py', 'scripts/pm-dch-table-generate.py']
    summary = dict(sha256={s: hashlib.sha256((suites.ROOT / s).read_bytes()).hexdigest() for s in sources},
                   witness_calls=collector.calls, refused_calls=collector.refused_calls,
                   collect_seconds=round(time.monotonic() - started, 1), findings=findings, phases=[])
    print(f'collected {collector.calls} witness calls ({collector.refused_calls} refused) in '
          f'{summary["collect_seconds"]}s; findings {len(findings)}', file=sys.stderr, flush=True)
    gate = g.MemoryGate(args.max_rss, args.pause_when_low, args.resume_at, 30, 2700)
    prescanned = {}
    for phase in dch.TABLE_PHASES:
        slot = phases[phase]
        rows = [name for name, _, _ in dch.table_rows(phase)]
        controls, negatives = list(slot['controls'].values()), list(slot['negatives'].values())
        problems = suites.lane_matrix(phase, controls, negatives)
        excluded = []
        for problem in problems:
            if problem['kind'] == 'not_single_row':
                negative = next(n for n in negatives if n['id'] == problem['case'])
                reason = suites.excluded(phase, problem['rows'], negative)
                if reason:
                    excluded.append(dict(problem, reason=reason))
        excluded_ids = {e['case'] for e in excluded}
        open_problems = [p for p in problems if p['case'] not in excluded_ids]
        usable = [n for n in negatives if n['id'] not in excluded_ids and not any(
            p['case'] == n['id'] for p in open_problems)]
        per_family = {}
        for n in usable:
            for family in n['families']:
                per_family.setdefault(family, {}).setdefault(n['target'], 0)
                per_family[family][n['target']] += 1
        entry = dict(phase=phase, rows=rows, controls=len(controls), negatives=len(negatives),
                     witness_negatives=sum(len(n['witnesses']) for n in negatives),
                     rows_without_negative=[r for r in rows if not any(n['target'] == r for n in usable)],
                     negatives_per_row={r: sum(1 for n in usable if n['target'] == r) for r in rows},
                     families_per_row={r: sorted({f for n in usable if n['target'] == r for f in n['families']}) for r in rows},
                     per_family_negatives=per_family, lane_matrix=open_problems, excluded=excluded)
        if not args.collect_only and (not args.phase or phase in args.phase) and controls:
            if phase not in prescanned:
                path = suites.ROOT / f'scripts/pm_dch_table_{phase}.py'
                prescanned[phase] = [e for e in g.prescan_sources(path) if e['kind'] in g.STATIC_STOP_KINDS]
            chosen_controls, chosen = suites.select(phase, controls, usable, args.per_row, args.max_controls)
            suite = suites.suite_for(phase, chosen_controls, chosen)
            t = time.monotonic()
            report = g.run(suite, memory=gate) if not prescanned[phase] else g.prescan_report(prescanned[phase])
            name = f'{phase}.json.gz'
            data = json.dumps(report, indent=1, sort_keys=True, default=str).encode() + b'\n'
            (args.out / name).write_bytes(gzip.compress(data, mtime=0))
            entry.update(tool_status=report['status'], seconds=round(time.monotonic() - t, 1),
                         evaluations=report.get('evaluations'), tool_controls=len(chosen_controls), tool_negatives=len(chosen),
                         proved=sorted(r['id'] for r in report.get('rows', []) if r.get('proved')),
                         unproved=sorted(report.get('unproved_guards', [])),
                         failure_kinds=sorted({f['kind'] for f in report.get('failures', [])}),
                         masked=report.get('masked_negatives', []), report=name,
                         row_cuts={r['id']: dict(proved=r.get('proved'), own=len(r.get('own', [])), flips=len(r.get('flips', [])),
                                                 stays=len(r.get('stays', [])), unrelated_changes=len(r.get('unrelated_changes', [])),
                                                 masked=len(r.get('masked', []))) for r in report.get('rows', [])},
                         report_sha256=hashlib.sha256(data).hexdigest())
            print(f"{phase} {entry['tool_status']} proved {len(entry['proved'])}/{len(rows)} "
                  f"N={len(chosen)} C={len(chosen_controls)} {entry['seconds']}s", file=sys.stderr, flush=True)
        summary['phases'].append(entry)
    summary['seconds'] = round(time.monotonic() - started, 1)
    (args.out / 'summary.json').write_text(json.dumps(summary, indent=1, sort_keys=True, default=jsonable) + '\n')
    bad = [p for p in summary['phases'] if p.get('tool_status') not in (None, 'PASS') or p['lane_matrix']]
    return 1 if findings or bad else 0


if __name__ == '__main__':
    sys.exit(main())
