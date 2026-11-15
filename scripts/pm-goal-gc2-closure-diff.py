#!/usr/bin/env python3
"""PNC-019 C12-GC2: class changes between two runs of scripts/pm-goal-gc-schema-closure.py.

Compares a closure output made with GC's walk at c0482747da (reach contexts keyed by (kind, depth, index)) with one
made by the GC2 walk (contexts keyed by owner node). For every source and root it lists each clause whose class
changed (before, after, clause), each clause present in only one run, and the per-source totals (occurrences and
distinct clauses, ranked as the closure ranks them). Exit 1 when the after run leaves any clause UNCOVERED.

Usage: python3 scripts/pm-goal-gc2-closure-diff.py --before A.json [--before B.json] --after A2.json [--after B2.json] --out FILE
"""
import argparse
import collections
import json
import sys
from pathlib import Path

RANK = {'KILLED': 0, 'COVERED_LATER': 1, 'UNREACHABLE': 2, 'VACUOUS': 3, 'SELECTOR_OR_NEGATED': 4, 'UNCOVERED': 5}
WITNESSED = ('KILLED', 'COVERED_LATER')


def load(paths):
    out = {}
    for path in paths:
        out.update(json.loads(Path(path).read_text())['sources'])
    return out


def distinct(roots):
    best = {}
    for entry in roots.values():
        for clause, x in entry['clauses'].items():
            if clause not in best or RANK[x['cls']] < RANK[best[clause]]:
                best[clause] = x['cls']
    return best


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--before', action='append', required=True)
    parser.add_argument('--after', action='append', required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    before, after = load(args.before), load(args.after)
    report = dict(sources={})
    uncovered = 0
    for source in sorted(set(before) | set(after)):
        b, a = before.get(source, {}).get('roots', {}), after.get(source, {}).get('roots', {})
        changes, only = [], []
        for root in sorted(set(b) | set(a)):
            bc, ac = b.get(root, {}).get('clauses', {}), a.get(root, {}).get('clauses', {})
            for clause in sorted(set(bc) | set(ac)):
                if clause not in bc or clause not in ac:
                    only.append(dict(root=root, clause=clause, before=bc.get(clause, {}).get('cls'), after=ac.get(clause, {}).get('cls')))
                elif bc[clause]['cls'] != ac[clause]['cls']:
                    changes.append(dict(root=root, clause=clause, before=bc[clause]['cls'], after=ac[clause]['cls'],
                                        kind='witness' if bc[clause]['cls'] in WITNESSED and ac[clause]['cls'] in WITNESSED else 'static',
                                        after_entry=ac[clause]))
        db, da = distinct(b), distinct(a)
        distinct_changes = [dict(clause=c, before=db.get(c), after=da.get(c)) for c in sorted(set(db) | set(da)) if db.get(c) != da.get(c)]
        occ = lambda roots: dict(sum((collections.Counter(e['counts']) for e in roots.values()), collections.Counter()))
        reaches = lambda roots: sum(1 for e in roots.values() for x in e['clauses'].values() if 'reaches' in x)
        left = sorted(c for c, k in da.items() if k == 'UNCOVERED')
        uncovered += len(left)
        report['sources'][source] = dict(
            roots_before=len(b), roots_after=len(a), occurrences_before=occ(b), occurrences_after=occ(a),
            distinct_before=dict(collections.Counter(db.values())), distinct_after=dict(collections.Counter(da.values())),
            occurrence_changes=changes, only_in_one_run=only, distinct_changes=distinct_changes, uncovered_after=left,
            static_entries_with_reach_count=reaches(a))
        print(f'{source}: roots {len(b)}->{len(a)}; occurrence changes {len(changes)} '
              f'({sum(1 for c in changes if c["kind"] == "static")} static); only in one run {len(only)}; '
              f'distinct changes {len(distinct_changes)}; uncovered after {len(left)}')
        for c in changes:
            print(f'  {c["before"]:>20} -> {c["after"]:<20} {c["clause"]}  [{c["root"].rsplit("/", 1)[-1]}]')
    args.out.write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
    return 1 if uncovered else 0


if __name__ == '__main__':
    sys.exit(main())
