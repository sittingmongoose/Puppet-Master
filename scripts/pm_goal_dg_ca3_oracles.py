#!/usr/bin/env python3
"""DG-CA3 corpus runner: goal.cancelled C3 (Workflow route) and C4 private inspection (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Runs this lane's groups on DG-CA's ``Suite`` (``pm_goal_dg_ca_oracles``): every positive
is a complete original path; every negative starts from a valid complete case with
exactly one change and must refuse with exactly its own code while leaving Storage
changed only by the injected change. Unexpected acceptance, a different code or any
other exception fails the run (nonzero exit).

Usage: python3 scripts/pm_goal_dg_ca3_oracles.py [--group C3|C4I] [--output out.json] [--guards guards.json] [--filter text]
"""
from __future__ import annotations

import argparse
import ast
import json
import re
import shutil
import sys
import tempfile
import time
from pathlib import Path

sys.dont_write_bytecode = True

import pm_goal_dg_ca_owners as O
import pm_goal_dg_ca_oracles as DGO

HERE = Path(__file__).resolve().parent
LANE_FILES = ('pm_goal_dg_ca3_native.py', 'pm_goal_dg_ca3_route.py', 'pm_goal_dg_ca3_index.py', 'pm_goal_dg_ca3_inspection.py')
GROUPS = (('C3', 'pm_goal_dg_ca3_cases'), ('C4I', 'pm_goal_dg_ca3_inspection_cases'))


def guard_sites():
    sites = []
    for name in LANE_FILES:
        path = HERE / name
        if not path.exists():
            continue
        for node in ast.walk(ast.parse(path.read_text())):
            if isinstance(node, ast.Call) and getattr(node.func, 'id', getattr(node.func, 'attr', None)) == 'require' and node.args:
                arg = node.args[0]
                code = arg.value if isinstance(arg, ast.Constant) and isinstance(arg.value, str) else ast.unparse(arg)
                sites.append(dict(file='scripts/' + name, line=node.lineno, code=code))
    return sites


def guard_inventory(cases):
    observed = {}
    for case in cases:
        if case['kind'] == 'negative' and case['status'] == 'pass':
            observed.setdefault(case['got'], []).append(case['id'])
    rows = []
    for site in guard_sites():
        code = site['code']
        if re.fullmatch(r'[A-Za-z0-9_/.\-]+', code):
            hits = observed.get(code, [])
        else:
            literal = ''.join(re.findall(r"'([^']*)'", code)).split('%')[0]
            hits = sorted({c for got, ids in observed.items() for c in ids if literal and got.startswith(literal)})
        rows.append(dict(site, negatives=hits[:50], negative_count=len(hits)))
    return dict(qualification='TEST_ONLY', native=O.NATIVE_LINE, lane='DG-CA3', sites=rows, observed_codes=dict(sorted(observed.items())),
                without_negative=[r for r in rows if r['negative_count'] == 0])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--group', action='append')
    parser.add_argument('--output')
    parser.add_argument('--guards')
    parser.add_argument('--filter')
    args = parser.parse_args()
    groups = {g: m for g, m in GROUPS if (HERE / (m + '.py')).exists()}
    work = Path(tempfile.mkdtemp(prefix='pm-dg-ca3-'))
    suite = DGO.Suite(work)
    started = time.time()
    try:
        for group in args.group or list(groups):
            module = __import__(groups[group])
            if args.filter:
                pos, neg = suite.positive, suite.negative
                suite.positive = lambda g, name, fn, _p=pos: _p(g, name, fn) if args.filter in name else None
                suite.negative = lambda g, name, fn, exp, _n=neg, **kw: _n(g, name, fn, exp, **kw) if args.filter in name else None
            module.cases(suite)
    finally:
        shutil.rmtree(work, ignore_errors=True)
    cases = suite.cases
    failures = [c for c in cases if c['status'] != 'pass']
    summary = {}
    for c in cases:
        row = summary.setdefault(c['group'], dict(positives=0, negatives=0, failures=0))
        row['positives' if c['kind'] == 'positive' else 'negatives'] += 1
        row['failures'] += c['status'] != 'pass'
    result = dict(qualification='TEST_ONLY', native=O.NATIVE_LINE, lane='DG-CA3', family='goal.cancelled', summary=summary,
                  positives=sum(r['positives'] for r in summary.values()), negatives=sum(r['negatives'] for r in summary.values()),
                  failures=len(failures), status='pass' if not failures else 'fail', seconds=round(time.time() - started, 1), cases=cases)
    if args.output:
        Path(args.output).write_text(json.dumps(result, indent=1, sort_keys=True, ensure_ascii=False, default=str) + '\n')
    if args.guards:
        Path(args.guards).write_text(json.dumps(guard_inventory(cases), indent=1, sort_keys=True, ensure_ascii=False) + '\n')
    print(json.dumps(dict(status=result['status'], summary=summary, seconds=result['seconds'],
                          failures=[(f['id'], f.get('expected'), f.get('got') or f.get('error'), f.get('unexpected_changes'))
                                    for f in failures][:80]), indent=1, ensure_ascii=False, default=str))
    return 0 if not failures else 1


if __name__ == '__main__':
    sys.exit(main())
