"""Source-derived DG5 duplicate invariants, declared before the run that judges them.

1. Authored: the request's current integer primitive and its complete owner schema both
   reject a Boolean expected_revision. SirOwner.admit checks those two sites before
   hashing/storing the request.
2. Chains (scripts/pm_goal_dg5_duplicates.json): for a call whose single declared row was
   COVERED_LATER in a discovery run, the rows each widened cut uncovered until the complete
   call accepted (pm_goal_dg5_sweep.chain). The file is written from that run before the
   judging run starts; the judging run credits a set only when its joint cut accepts and each
   site, with the others cut, still refuses alone (GH1 _site_cuts). This declaration itself
   earns no credit.
"""
import json
from pathlib import Path

DUPLICATES = Path(__file__).resolve().parent / 'pm_goal_dg5_duplicates.json'
_CHAINS = None


def chains():
    global _CHAINS
    if _CHAINS is None:
        _CHAINS = json.loads(DUPLICATES.read_text())['calls'] if DUPLICATES.exists() else {}
    return _CHAINS


U_SITE = 'dg5/site/pm_goal_dg_u_owners.py:'

# Authored case -> (declared duplicate set, reason). Every member checks the same field with
# the same predicate; written from the source before the judging run.
DECLARED = {
    'U2/N/expected_revision_bool': (
        ('dg5/dgu/sir/request/expected_revision/number', 'dg5/dgu/sir/request/schema'),
        'SirOwner.admit: NUMRULE current integer and the owner schema integer type both reject a Boolean '
        'expected_revision (CV-1100 exact integer primitive).'),
    'U1/N/objective_4001_scalars': (
        ('dg5/dgu/sir/request/schema', U_SITE + '717'),
        'GoalUpdateRequestV2 objective_text maxLength 4000 (Unicode code points) and SirOwner.admit '
        'scalars(text) <= OBJECTIVE_LIMIT (4000, len over code points) bound the same field by the same predicate.'),
}


def target(case, ordinary, label=None):
    if case.get('dg5_target') is not None:  # a DG5 supplement case declares its own target
        return case['dg5_target']
    if case['id'] in DECLARED:
        return DECLARED[case['id']][0]
    chain = chains().get(label) if label else None
    if chain and ordinary in chain:
        return tuple(sorted(chain))
    return ordinary
