#!/usr/bin/env python3
"""List every registry credit whose declared dependency is not in the family's closed set.

Usage: audit_deps.py [--registry REG] --closed-rows closed-rows.json [--out FILE]
Exit 0 when the list is empty, 1 otherwise. This is the rule-4 audit that fix round 1 added.
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_goal_dg5_proof_reviews as reviews  # noqa: E402


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--registry', type=Path, default=reviews.REGISTRY)
    parser.add_argument('--closed-rows', type=Path, required=True)
    parser.add_argument('--out', type=Path, default=None)
    args = parser.parse_args()
    registry = reviews.load(args.registry)
    closed = reviews.load_closed_rows(args.closed_rows)
    falls = []
    for entry_key in sorted(registry['entries']):
        entry = registry['entries'][entry_key]
        for family in entry.get('families') or []:
            deps = list(entry.get('depends_on') or ())
            if not entry.get('depends_on_recorded', True):
                falls.append(dict(entry=entry_key, family=family, deps_not_closed=[],
                                  reason='dependency_unrecorded'))
                continue
            if not deps:
                continue
            missing = [row for row in deps if row not in closed.get(family, set())]
            if not missing:
                continue
            closed_family = closed.get(family, set())
            decision = reviews.decide(family, entry.get('readings', []), entry.get('text_sha'),
                                      reviews._settlement_for(registry, family, entry['row'], entry.get('text_sha')),
                                      reviews._withdrawal_for(registry, family, entry_key, entry['row']), entry_key,
                                      depends_on=deps, closed_rows=closed_family, row=entry['row'])
            if decision['credit']:
                continue          # a credit that survives; not a fall
            if not str(decision['reason']).startswith('dependency_'):
                continue          # refused for another reason: not a rule-4 fall
            hypothetical = reviews.decide(family, entry.get('readings', []), entry.get('text_sha'),
                                          reviews._settlement_for(registry, family, entry['row'], entry.get('text_sha')),
                                          reviews._withdrawal_for(registry, family, entry_key, entry['row']), entry_key,
                                          depends_on=deps, closed_rows=set(closed_family) | set(deps),
                                          row=entry['row'])
            if not hypothetical['credit']:
                continue          # would not credit even with every dependency closed
            falls.append(dict(entry=entry_key, family=family, deps_not_closed=missing,
                              reason=decision['reason']))
    for credit_key in sorted(registry.get('credits') or {}):
        claim = registry['credits'][credit_key]
        family = claim.get('row_family')
        deps = list(claim.get('depends_on') or ())
        recorded = claim.get('depends_on_recorded', True)
        if recorded and not deps:
            continue
        closed_family = closed.get(family, set())
        decision = reviews.decide(family, claim.get('readings', []), claim.get('text_sha'),
                                  depends_on=deps, closed_rows=closed_family,
                                  depends_on_recorded=recorded)
        if decision['credit']:
            continue
        if recorded and not str(decision['reason']).startswith('dependency_'):
            continue
        hypothetical = reviews.decide(family, claim.get('readings', []), claim.get('text_sha'),
                                      depends_on=deps, closed_rows=set(closed_family) | set(deps),
                                      depends_on_recorded=recorded)
        if not hypothetical['credit']:
            continue
        falls.append(dict(entry=credit_key, family=family, deps_not_closed=[d for d in deps if d not in closed_family],
                          reason=decision['reason']))
    text = json.dumps(dict(falls=len(falls), credits=falls), indent=1)
    if args.out:
        args.out.write_text(text + '\n')
    print(text)
    return 0 if not falls else 1


if __name__ == '__main__':
    raise SystemExit(main())
