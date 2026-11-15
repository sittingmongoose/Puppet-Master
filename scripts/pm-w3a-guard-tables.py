#!/usr/bin/env python3
"""Run the gated guard tool (Method B, 004bdedd63) over every W3A guard table.

Step 1 (--collect FILE): run the complete W3A checker under the recorder and dump
every table's distinct controls and negatives. Step 2 (--run FILE --out DIR):
for each table, one lean worker process (imports only the engine and its tables)
runs g.run serially behind the tool's MemoryGate and writes the tool's own report.
Credit is copied from those reports; this driver adds none. --summary DIR
aggregates the per-table reports into summary.json.
Usage:
  python3 scripts/pm-w3a-guard-tables.py --collect slots.json.gz
  python3 scripts/pm-w3a-guard-tables.py --run slots.json.gz --out DIR [--batch 20] [--table T]...
  python3 scripts/pm-w3a-guard-tables.py --summary DIR
"""
import argparse
import gzip
import hashlib
import json
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
PREFIX = 'pm_w3a_forge_table_'


def all_tables():
    return sorted(p.stem[len(PREFIX):] for p in (ROOT / 'scripts').glob(PREFIX + '*.py'))


def collect(path):
    import pm_w3a_guard_suites as suites
    started = time.monotonic()
    slots, counts = suites.collect(progress=lambda f: print(f'collect {f}', file=sys.stderr, flush=True))
    suites.dump(path, slots, counts)
    print(json.dumps(dict(counts=counts, tables=len(slots), seconds=round(time.monotonic() - started, 1))))
    return 0


def worker(slots_path, out, tables, max_rss, low, resume):
    import pm_w3a_guard_lean as lean
    g = lean.g
    data = json.load(gzip.open(slots_path, 'rt'))
    gate = g.MemoryGate(max_rss, low, resume, 30, 2700)
    for table in tables:
        slot = data['slots'].get(table, dict(controls={}, negatives={}))
        rows = [name for name, _, _ in lean.table_rows(table)]
        controls, negatives = list(slot['controls'].values()), list(slot['negatives'].values())
        entry = dict(table=table, rows=rows, controls=len(controls), negatives=len(negatives),
                     targets=sorted({n['target'] for n in negatives}),
                     lane_matrix=lean.lane_matrix(table, controls, negatives))
        entry['rows_without_negative'] = [r for r in rows if r not in entry['targets']]
        t = time.monotonic()
        path = ROOT / f'scripts/{PREFIX}{table}.py'
        stops = [e for e in g.prescan_sources(path) if e['kind'] in g.STATIC_STOP_KINDS]
        suite = lean.suite_for(table, slot)
        if suite is None:
            report = dict(status='NO_CONTROLS', rows=[], unproved_guards=rows, failures=[])
        else:
            report = g.run(suite, memory=gate) if not stops else g.prescan_report(stops)
        name = f'{table}.json.gz'
        with gzip.open(out / name, 'wt') as handle:
            handle.write(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
        rows_report = report.get('rows', [])
        entry.update(tool_status=report['status'], seconds=round(time.monotonic() - t, 1),
                     evaluations=report.get('evaluations'),
                     tool_controls=len(suite.controls) if suite else 0, tool_negatives=len(suite.negatives) if suite else 0,
                     proved=sorted(r['id'] for r in rows_report if r.get('proved')),
                     unproved=sorted(report.get('unproved_guards', [])),
                     failure_kinds=sorted({f['kind'] for f in report.get('failures', [])}),
                     masked=report.get('masked_negatives', []),
                     report=name, report_sha256=hashlib.sha256((out / name).read_bytes()).hexdigest())
        (out / f'{table}.entry.json').write_text(json.dumps(entry, indent=1, sort_keys=True, default=str) + '\n')
        print(f"{table} {entry['tool_status']} proved {len(entry['proved'])}/{len(rows)} N={entry['tool_negatives']} "
              f"C={entry['tool_controls']} {entry['seconds']}s", flush=True)
    return 0


def run(slots_path, out, tables, batch, args):
    out.mkdir(parents=True, exist_ok=True)
    todo = [t for t in tables if not (out / f'{t}.entry.json').exists()]
    print(f'{len(todo)} of {len(tables)} tables to run', flush=True)
    for i in range(0, len(todo), batch):
        part = todo[i:i + batch]
        cmd = [sys.executable, '-B', str(Path(__file__).resolve()), '--worker', str(slots_path), '--out', str(out),
               '--max-rss', str(args.max_rss), '--pause-when-low', str(args.pause_when_low), '--resume-at', str(args.resume_at)]
        for t in part:
            cmd += ['--table', t]
        result = subprocess.run(cmd, cwd=ROOT)
        if result.returncode != 0:
            print(f'worker failed on batch starting {part[0]}', flush=True)
            return result.returncode
    return 0


def summary(out):
    entries = [json.loads(p.read_text()) for p in sorted(out.glob('*.entry.json'))]
    tool = (ROOT / 'scripts/pm_guard_isolation.py').read_bytes()
    total_rows = sum(len(e['rows']) for e in entries)
    proved = sum(len(e['proved']) for e in entries)
    result = dict(tool_sha256=hashlib.sha256(tool).hexdigest(), tables=len(entries), rows=total_rows, proved=proved,
                  unproved=sorted(f"{e['table']}/{r}" for e in entries for r in e['unproved']),
                  statuses={s: sum(1 for e in entries if e['tool_status'] == s) for s in sorted({e['tool_status'] for e in entries})},
                  failure_kinds=sorted({k for e in entries for k in e['failure_kinds']}),
                  lane_matrix=sum(len(e['lane_matrix']) for e in entries),
                  masked=sum(len(e['masked']) for e in entries),
                  seconds=round(sum(e['seconds'] for e in entries), 1), suites=entries)
    (out / 'summary.json').write_text(json.dumps(result, indent=1, sort_keys=True, default=str) + '\n')
    print(json.dumps({k: v for k, v in result.items() if k != 'suites'}, indent=1)[:4000])
    return 0 if result['proved'] == result['rows'] else 1


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--collect', type=Path)
    parser.add_argument('--run', type=Path)
    parser.add_argument('--worker', type=Path)
    parser.add_argument('--summary', type=Path)
    parser.add_argument('--out', type=Path)
    parser.add_argument('--table', action='append')
    parser.add_argument('--batch', type=int, default=20)
    parser.add_argument('--max-rss', type=int, default=2048)
    parser.add_argument('--pause-when-low', type=int, default=12)
    parser.add_argument('--resume-at', type=int, default=13)
    args = parser.parse_args()
    if args.collect:
        return collect(args.collect)
    if args.worker:
        return worker(args.worker, args.out, args.table, args.max_rss, args.pause_when_low, args.resume_at)
    if args.run:
        return run(args.run, args.out, args.table or all_tables(), args.batch, args)
    if args.summary:
        return summary(args.summary)
    parser.error('one of --collect, --run, --worker, --summary')


if __name__ == '__main__':
    sys.exit(main())
