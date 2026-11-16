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


def target(case, ordinary, label=None):
    if case['id'] == 'U2/N/expected_revision_bool':
        return ('dg5/dgu/sir/request/expected_revision/number', 'dg5/dgu/sir/request/schema')
    chain = chains().get(label) if label else None
    if chain and ordinary in chain:
        return tuple(sorted(chain))
    return ordinary
