#!/usr/bin/env python3
"""Write scripts/pm_goal_dg5_duplicates.json from DG5 discovery runs (evidence -> declaration).

For each complete call whose declared single row was COVERED_LATER, the discovery run recorded the
cut chain (pm_goal_dg5_sweep.chain): the rows each widened cut uncovered. A chain that ends with
the complete call ACCEPTING is written as that call's declared duplicate set, with every member
row's sites and source lines. The judging run (a later, separate process) credits a set only when
its joint cut accepts and each site, with the others cut, still refuses alone; chains that end in
an exception, no progress or the depth limit are listed apart and declare nothing.

Usage: python3 scripts/pm_goal_dg5_duplicates.py RUN_DIR [RUN_DIR ...]
"""
import argparse
import gzip
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'scripts/pm_goal_dg5_duplicates.json'


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('runs', nargs='+', type=Path)
    args = parser.parse_args()
    calls, apart, sites, sources = {}, [], {}, []
    for run in args.runs:
        ledger_path = run / 'ledger.json.gz'
        sources.append(dict(run=str(run), ledger_sha256=hashlib.sha256(ledger_path.read_bytes()).hexdigest()))
        collection = json.loads((run / 'collection.json').read_text())
        for name, slot in collection['rows'].items():
            sites.setdefault(name, sorted(map(tuple, slot['sites'])))
        for record in json.load(gzip.open(ledger_path, 'rt')):
            chain = record.get('dg5_chain')
            if not chain:
                continue
            rows = sorted({row for step in chain['rows'] for row in step})
            if chain['result'] == 'accepts' and len(rows) > 1:
                calls.setdefault(record['label'], rows)
            else:
                apart.append(dict(label=record['label'], target=record['target'], chain=chain))
    lines = {}
    for rows in calls.values():
        for row in rows:
            lines[row] = [dict(path=p, line=l, source=(ROOT / p).read_text().splitlines()[l - 1].strip()[:200])
                          for p, l in sites.get(row, [])[:4]]
    OUT.write_text(json.dumps(dict(
        rule=__doc__.split('\n\n')[1], sources=sources, calls=calls, member_sites=lines, apart=apart),
        indent=1, sort_keys=True) + '\n')
    print(json.dumps(dict(declared_calls=len(calls), distinct_sets=len({tuple(v) for v in calls.values()}),
                          apart=len(apart))))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
