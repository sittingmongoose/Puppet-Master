#!/usr/bin/env python3
"""Run the gated guard tool (Method B) over every W3F guard table.

One tool run per table that has a negative, serial, behind the tool's MemoryGate.
Credit is copied from the tool's own report rows; this driver adds none. Tables of
entailed rows (pm_w3f_event_oracles.ENTAILED) get no negative and are reported unproved
with their written proof.
Usage: python3 scripts/pm-w3f-guard-tables.py --out <dir> [--table <table>]... [--collect-only]
Exit 0 only when every run table PASSes, the lane matrix and the collection have no
problem, and every row is proved or entailed.
"""
import argparse
import gzip
import hashlib
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pm_w3f_guard_suites as suites  # noqa: E402
g = suites.g
w3f = suites.w3f


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--table', action='append')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--collect-only', action='store_true')
    parser.add_argument('--negative-limit', type=int, default=2)
    parser.add_argument('--control-limit', type=int, default=4)
    parser.add_argument('--max-rss', type=int, default=1800)
    parser.add_argument('--pause-when-low', type=int, default=10)
    parser.add_argument('--resume-at', type=int, default=12)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()
    root = suites.ROOT
    sources = (sorted(root.glob('scripts/pm_w3f*.py')) + sorted(root.glob('scripts/pm-w3f*.py'))
               + [root / 'scripts/pm_guard_isolation.py', root / 'scripts/pm_event_numbers.py', root / 'scripts/pm_event_datetime.py',
                  root / 'Plans/w3f_event_fixtures.json', root / 'Plans/w3f_original_custody.json'])
    inputs = {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(set(sources)) if p.exists()}
    collected, counts, findings = suites.collect(progress=lambda n: print(f'collect {n}', file=sys.stderr, flush=True))
    summary = dict(tool_sha256=inputs['scripts/pm_guard_isolation.py'], source_sha256=inputs,
                   collect_seconds=round(time.monotonic() - started, 1), counts=counts, collection_findings=findings,
                   negative_limit=args.negative_limit, control_limit=args.control_limit, suites=[])
    gate = g.MemoryGate(args.max_rss, args.pause_when_low, args.resume_at, 30, 2700)
    bad = bool(findings)
    for table in w3f.TABLES:
        if args.table and table not in args.table:
            continue
        slot = collected[table]
        rows = [name for name, _, _ in suites.table_rows(table)]
        controls, negatives = list(slot['controls'].values()), list(slot['negatives'].values())
        entry = dict(table=table, rows=rows, controls=len(controls), negatives=len(negatives),
                     targets=sorted({n['target'] for n in negatives}),
                     row_negatives={r: sum(1 for n in negatives if n['target'] == r) for r in rows},
                     lane_matrix=suites.lane_matrix(table, controls, negatives),
                     entailed={r: w3f.ENTAILED[r][0] for r in rows if r in w3f.ENTAILED})
        entry['rows_without_negative'] = [r for r in rows if r not in entry['targets']]
        bad = bad or bool(entry['lane_matrix']) or any(r not in w3f.ENTAILED for r in entry['rows_without_negative'])
        suite = suites.suite_for(table, slot, args.negative_limit, args.control_limit) if negatives and controls else None
        if not args.collect_only and suite is not None:
            path = root / f'scripts/{suites.TABLE_PREFIX}{table}.py'
            stops = [e for e in g.prescan_sources(path) if e['kind'] in g.STATIC_STOP_KINDS]
            t = time.monotonic()
            report = g.run(suite, memory=gate) if not stops else g.prescan_report(stops)
            name = f'{table}.json.gz'
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
            bad = bad or report['status'] != 'PASS'
            print(f"{table} {entry['tool_status']} proved {len(entry['proved'])}/{len(rows)} "
                  f"N={entry['tool_negatives']}/{len(negatives)} C={entry['tool_controls']}/{len(controls)} "
                  f"{entry['seconds']}s", file=sys.stderr, flush=True)
        else:
            print(f"{table} collected N={len(negatives)} C={len(controls)} without_negative={len(entry['rows_without_negative'])} "
                  f"matrix={len(entry['lane_matrix'])}", file=sys.stderr, flush=True)
        summary['suites'].append(entry)
    summary['seconds'] = round(time.monotonic() - started, 1)
    (args.out / 'summary.json').write_text(json.dumps(summary, indent=1, sort_keys=True, default=str) + '\n')
    print(json.dumps(dict(counts=counts, findings=len(findings), seconds=summary['seconds'],
                          proved=sum(len(s.get('proved', [])) for s in summary['suites']),
                          rows=sum(len(s['rows']) for s in summary['suites']),
                          entailed=len(w3f.ENTAILED))))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
