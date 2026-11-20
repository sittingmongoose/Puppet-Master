#!/usr/bin/env python3
"""DG-CB corpus runner: goal.cancelled C5 (M2-M6) and C6 (M7-M9) original-path oracles (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Every positive is a complete original path executed by the registered
TEST_ONLY owners and the StorageMigrationCoordinator on the shared adapters.
Every negative starts from a valid complete case and makes exactly one genuine
change at one boundary (or presents one substituted/transport-shaped input),
keeps every dependent copy coherent because the issuing owner recomputes it,
and must be refused with exactly its own code while leaving Storage changed only
by the injected change (DG-CA's ``Suite.negative`` discipline, reused). The
child-process crash matrix runs with the C6 group unless PM_DG_CB_SKIP_CRASH=1.

Usage: python3 scripts/pm_goal_dg_cb_oracles.py [--group C5] [--output out.json] [--guards guards.json]
"""
from __future__ import annotations

import argparse
import ast
import json
import os
from pathlib import Path
import re
import shutil
import sys
import tempfile
import time

sys.dont_write_bytecode = True

import pm_goal_dg_ca_oracles as CA
import pm_goal_dg_cb_owners as B
import pm_goal_dg_cb_migration as M

HERE = Path(__file__).resolve().parent
LANE_FILES = ('pm_goal_dg_cb_owners.py', 'pm_goal_dg_cb_migration.py', 'pm_goal_dg_cb_crash.py', 'pm_goal_dg_cb_c5_cases.py',
              'pm_goal_dg_cb_c6_cases.py')


class Suite(CA.Suite):
    def world(self, faults=None, **kw):
        self.n += 1
        return M.migration_world(self.work / ('w%05d' % self.n), **kw)


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


def site_prefix(code):
    """Literal prefix of a dynamic code expression ('M/%s/x/%s' % (...) -> 'M/'), or the literal code."""
    if not (code.startswith("'") or code.startswith('"')):
        return code, False
    literal = re.match(r"^['\"]([^'\"]*)['\"]", code).group(1)
    return literal.split('%')[0], True


def guard_inventory(cases):
    observed = {}
    for case in cases:
        if case['kind'] == 'negative' and case['status'] == 'pass':
            observed.setdefault(case['got'], []).append(case['id'])
    rows = []
    for site in guard_sites():
        code = site['code']
        prefix, dynamic = site_prefix(code)
        if dynamic:
            pattern = re.escape(re.match(r"^['\"]([^'\"]*)['\"]", code).group(1)).replace('%s', '[^/]+').replace('%d', '[0-9]+')
            hits = sorted({c for got, ids in observed.items() for c in ids if re.fullmatch(pattern, got)})
        else:
            hits = observed.get(code, [])
        rows.append(dict(site, negatives=hits[:50], negative_count=len(hits)))
    return dict(qualification='TEST_ONLY', native=B.NATIVE_LINE, lane=B.LANE, sites=rows, observed_codes={k: v for k, v in sorted(observed.items())},
                without_negative=[r for r in rows if r['negative_count'] == 0])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--group', action='append')
    parser.add_argument('--output')
    parser.add_argument('--guards')
    parser.add_argument('--filter')
    args = parser.parse_args()
    import pm_goal_dg_cb_c5_cases as C5
    import pm_goal_dg_cb_c6_cases as C6
    groups = {'C5': C5.cases, 'C6': C6.cases}
    work = Path(tempfile.mkdtemp(prefix='pm-dg-cb-', dir=os.environ.get('PM_DG_CB_WORK') or None))
    suite = Suite(work)
    started = time.time()
    try:
        for group in args.group or sorted(groups):
            groups[group](suite)
    finally:
        shutil.rmtree(work, ignore_errors=True)
    cases = [c for c in suite.cases if not args.filter or args.filter in c['id']]
    failures = [c for c in cases if c['status'] != 'pass']
    summary = {}
    for c in cases:
        row = summary.setdefault(c['group'], dict(positives=0, negatives=0, failures=0))
        row['positives' if c['kind'] == 'positive' else 'negatives'] += 1
        row['failures'] += c['status'] != 'pass'
    result = dict(qualification='TEST_ONLY', native=B.NATIVE_LINE, lane=B.LANE, family='goal.cancelled', summary=summary,
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
