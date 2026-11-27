#!/usr/bin/env python3
"""Build {family: [closed rows]} for rule 4 from an ED13 matrices directory.

Usage: closed_rows.py --matrices DIR [--x-rows GATEPATH-SCAN.json] --out closed-rows.json
A row counts as closed when its matrix status is CLOSED or CLOSED_BY_PROOF; rows the gate-path scan
lists as X (no source id) are removed again, because they are withdrawn, not closed.
"""
import argparse
import json
from pathlib import Path

STATUSES = ('CLOSED', 'CLOSED_BY_PROOF')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--matrices', type=Path, required=True)
    parser.add_argument('--x-rows', type=Path, default=None)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    closed = {}
    for path in sorted(args.matrices.glob('*.json')):
        data = json.loads(path.read_text())
        for family, block in data['families'].items():
            rows = {item['row'] for item in block['matrix'] if item['status'] in STATUSES}
            closed.setdefault(family, set()).update(rows)
    if args.x_rows:
        for item in json.loads(args.x_rows.read_text()).get('x_rows', []):
            closed.get(item['family'], set()).discard(item['row'])
    args.out.write_text(json.dumps({family: sorted(rows) for family, rows in closed.items()}, indent=1) + '\n')
    print(json.dumps({family: len(rows) for family, rows in sorted(closed.items())}, indent=1))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
