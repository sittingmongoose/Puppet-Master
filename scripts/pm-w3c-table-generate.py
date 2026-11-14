#!/usr/bin/env python3
"""Generate the W3C Method B guard-table modules from pm_w3c_event_oracles.ROWS.

Each module ``scripts/pm_w3c_table_<table>.py`` holds one table (at most eight rows): per row, a predicate that
compares the raw facts the checker observed for it (``pm_w3c_event_oracles.TEMPLATES``) and returns its exact
refusal code, a ``FIELDS`` tuple in table order, and ``case(value)`` building a fresh ``GuardTable`` whose check
requires every row in order. ``--check`` fails when a module is missing, stale or extra.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pm_w3c_event_oracles as W  # noqa: E402

SCRIPTS = W.ROOT / 'scripts'


def expected():
    return {SCRIPTS / (W.TABLE_PREFIX + t + '.py'): W.table_source(t) for t in W.TABLES}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args(argv)
    want = expected()
    present = set(SCRIPTS.glob(W.TABLE_PREFIX + '*.py'))
    stale = sorted([str(p.name) for p, t in want.items() if not p.exists() or p.read_text() != t])
    extra = sorted([str(p.name) for p in present - set(want)])
    summary = {'tables': len(want), 'rows': len(W.ROWS), 'entailed': len(W.ENTAILED)}
    if args.check:
        print(json.dumps(dict(summary, stale=stale, extra=extra)))
        return 1 if stale or extra else 0
    for p in present - set(want):
        p.unlink()
    for p, t in want.items():
        if not p.exists() or p.read_text() != t:
            p.write_text(t)
    print(json.dumps(dict(summary, written=len(stale), removed=extra)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
