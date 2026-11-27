#!/usr/bin/env python3
"""Moved into the patch in fix round 1 (review B1): G1 vs the lead's rulings for the newest reads (lead 1124044150 / 1124041937 / 1124042406 /
1124042812 / 1124043123 / 1124043507 / 1124050923).

Constructed by dg5-wrongfam 2026-11-24. For each row/family: the best decision over every registry
entry naming that row in that family (a credit if any entry credits), then a comparison with the
lead's ruling. Non-credit rulings are compared as "not credited" (the guard says PENDING_READ; the
edition may record GATED / OPEN / named gap).
"""
import argparse
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_goal_dg5_proof_reviews as reviews  # noqa: E402

ROWS = [
    # row, family, lead ruling (CREDIT / NOT), decision mail, note
    ('dg5/site/pm_goal_dg_u_owners.py:1925', 'goal.updated', 'CREDIT', '1124050923', 'B5 SOUND/SOUND'),
    ('dg5/site/pm_goal_test_storage.py:470', 'goal.updated', 'NOT', '1124050923', 'B5 UNSOUND/UNSOUND'),
    ('dg5/site/pm_goal_test_storage.py:1712', 'goal.cancelled', 'CREDIT', '1124042812', 'B3 SOUND/SOUND'),
    ('dg5/site/pm_goal_test_storage.py:1713', 'goal.cancelled', 'CREDIT', '1124042812', 'B3 SOUND/SOUND'),
    ('dg5/site/pm_goal_dg_ca3_route.py:807', 'goal.cancelled', 'CREDIT', '1124043123', 'P6-01 + neon'),
    ('dg5/site/pm_goal_dg_ca_owners.py:176', 'goal.cancelled', 'CREDIT', '1124043123', 'P6-02 + neon'),
    ('dg5/site/pm_goal_dg_cb_owners.py:154', 'goal.cancelled', 'CREDIT', '1124043123', 'P6-03 + neon'),
    ('dg5/site/pm_goal_test_storage.py:1564', 'goal.cancelled', 'NOT', '1124043507',
     'P6b: the :1564 proof is withdrawn in every family (LW-1564)'),
    ('dg5/site/pm_goal_test_storage.py:1564', 'goal_run.started', 'NOT', '1124043123', 'P6-05 GATED on :1426 (now X)'),
    ('dg5/site/pm_goal_test_storage.py:520', 'goal_run.started', 'NOT', '1124043123', 'P6-06 GATED on :525/:530 (now X)'),
    ('dg5/site/pm_goal_test_storage.py:520', 'goal.cancelled', 'CREDIT', '1124060154',
     'route-back ruling 3: deps :525, :528, :530 CLOSED in goal.cancelled'),
    ('dg5/site/pm_goal_test_storage.py:520', 'shared-adapter', 'NOT', '1124064831',
     'GATED on addendum 12.3; BC28 kill is the basis; LW-520 (P6b-01 + P4-29 not ruled as a pair)'),
    ('dg5/site/pm_goal_dg_ca3_route.py:78', 'goal.cancelled', 'CREDIT', '1124041937', 'CYC2B2 SOUND/SOUND; wrap supplement-only'),
    ('dg5/site/pm_goal_dg_ca3_route.py:81', 'goal.cancelled', 'CREDIT', '1124041937', 'CYC2B2 SOUND/SOUND'),
    ('dg5/site/pm_goal_dg_ca_c1.py:56', 'goal.cancelled', 'NOT', '1124041937', 'CYC2B2 UNSOUND/UNSOUND; owner work'),
    ('dg5/site/pm_goal_dg_ca_c1.py:59', 'goal.cancelled', 'NOT', '1124041937', 'CYC2B2 UNSOUND/UNSOUND; owner work'),
    ('dg5/site/pm_goal_dg_ca_assignment.py:377', 'goal.cancelled', 'NOT', '1124041937', 'CYC2B2 UNSOUND/UNSOUND'),
    ('dg5/site/pm_goal_dg_ca3_route.py:349', 'goal_run.cancelled', 'CREDIT', '1124042406', 'C16 SOUND/SOUND'),
    ('dg5/site/pm_goal_dg_ca3_route.py:351', 'goal_run.cancelled', 'CREDIT', '1124042406', 'C16 SOUND/SOUND'),
    ('dg5/site/pm_goal_dg_ca3_route.py:352', 'goal_run.cancelled', 'CREDIT', '1124042406', 'C16 SOUND/SOUND'),
    ('dg5/site/pm_goal_dg_ca_c1.py:190', 'goal.cancelled', 'CREDIT', '1124042406', 'held4 E2 SOUND/SOUND'),
    ('dg5/site/pm_goal_dg_ca3_route.py:957', 'goal.cancelled', 'CREDIT', '1124042406', ':364 CLOSED in family'),
    ('dg5/site/pm_goal_dg_ca3_route.py:969', 'goal.cancelled', 'NOT', '1124042406', 'E1 UNSOUND/UNSOUND; named gap'),
    ('dg5/site/pm_goal_dg_ca3_route.py:923', 'goal.cancelled', 'CREDIT', '1124044150', 'SPLIT-1 settlement'),
    ('dg5/site/pm_goal_dg_ca3_route.py:1140', 'goal.cancelled', 'NOT', '1124044150', 'SPLIT-1 NOT_SOUND'),
    ('dg5/site/pm_goal_dg_ca_assignment.py:600', 'goal.cancelled', 'NOT', '1124044150', 'SPLIT-1 NOT_SOUND'),
    ('dg5/site/pm_goal_test_storage.py:577', 'goal.updated', 'NOT', '1124050923', 'named gap; withdrawal'),
    ('dg5/site/pm_goal_test_storage.py:1647', 'goal_run.started', 'CREDIT', '1124073342',
     'B4-G4 SOUND/SOUND; v2r9-e1 block entry (v9 B3)'),
]


def closed_map(matrices, x_rows):
    closed = set()
    for family in ('goal.cancelled', 'goal.updated', 'goal_run.cancelled',
                   'goal_run.started', 'goal_run.certified', 'shared-adapter'):
        path = matrices / ('%s.json' % family)
        if not path.exists():
            continue
        matrix = json.loads(path.read_text())
        for item in matrix['families'][family]['matrix']:
            if item['status'] in ('CLOSED', 'CLOSED_BY_PROOF'):
                closed.add((item['row'], family))
    if x_rows and x_rows.exists():
        for item in json.loads(x_rows.read_text()).get('x_rows', []):
            closed.discard((item['row'], item['family']))
    return closed


def best(registry, row, family, closed):
    found = None
    for key in sorted(registry['entries']):
        entry = registry['entries'][key]
        if entry.get('row') != row or family not in (entry.get('families') or []):
            continue
        deps = list(entry.get('depends_on') or ())
        decision = reviews.decide(family, entry.get('readings', []), entry.get('text_sha'),
                                  reviews._settlement_for(registry, family, row, entry.get('text_sha')),
                                  reviews._withdrawal_for(registry, family, key, row), key,
                                  depends_on=deps,
                                  closed_rows={r for (r, f) in closed if f == family}, row=row,
                                  depends_on_recorded=entry.get('depends_on_recorded', True))
        record = dict(entry=key, status=decision['status'], reason=decision['reason'],
                      credit=decision['credit'])
        if decision['credit']:
            return record
        found = found or record
    return found


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--registry', type=Path, default=reviews.REGISTRY)
    parser.add_argument('--matrices', type=Path, required=True)
    parser.add_argument('--x-rows', type=Path, default=None)
    args = parser.parse_args()
    registry = reviews.load(args.registry)
    closed = closed_map(args.matrices, args.x_rows)
    table, differences = [], []
    for row, family, lead, decision, note in ROWS:
        result = best(registry, row, family, closed)
        got = 'CREDIT' if (result and result['credit']) else 'NOT'
        item = dict(row=row, family=family, lead=lead, got=got, decision=decision, note=note,
                    status=(result or {}).get('status'), reason=(result or {}).get('reason'),
                    entry=(result or {}).get('entry'))
        table.append(item)
        if got != lead:
            differences.append(item)
    print(json.dumps(dict(rows=len(table), differences=len(differences), table=table,
                          differ=differences), indent=1))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
