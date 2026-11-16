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


STOP_LATCHED = tuple(U_SITE + str(n) for n in (1511, 1575))
HITL_TARGET = (U_SITE + '968', U_SITE + '991')
# Reviewed DG5 sets (same field, same predicate): (case-id test, set, reason).
DECLARED_RULES = (
    (lambda cid: cid == 'U2/N/stop_at_capture' or (cid.startswith('U5/F/source.capture/after:') and cid.endswith('/stop')),
     STOP_LATCHED,
     "UpdateSourceOwner.capture checks `not stop['stop_latched']` on the Goal's current host Stop record "
     '(w.stops.current(goal_id)) at pm_goal_dg_u_owners.py:1511 and re-reads it at its final boundary :1575 '
     "(`not stop2['stop_latched']`): the same field, the same predicate."),
    (lambda cid: cid == 'U5/N/goal_id_empty',
     ('dg5/dgu/sir/request/schema', U_SITE + '287'),
     'GoalUpdateRequestV2 goal_id minLength 1 and exact_str (pm_goal_dg_u_owners.py:287) `value != \'\'` require the '
     'same field to be non-empty.'),
    (lambda cid: cid.startswith('U5/F/hitl.capture/after:') and cid.endswith('/body'),
     HITL_TARGET,
     "ApprovalOwner.capture checks the Goal body's revision and currentness_hash against the proposal target at :968 "
     'and re-reads and re-checks the identical predicate at its final boundary :991.'),
)


S_READERS = 'dg5/site/pm_goal_dg_s_readers.py:'
DECLARED_RULES += (
    (lambda cid: cid == 'S4/historical_reader_withdrawn',
     (S_READERS + '788', S_READERS + '790'),
     'StartedReaders._passive checks `method not in self.withdrawn_readers` at pm_goal_dg_s_readers.py:788 and '
     're-checks the identical predicate on the same set at its final boundary :790.'),
)


FAMILY_MODULES = ('s', 'ca', 'r', 'cf')   # pm_goal_dg5_declarations_<x>.py, one owner per file (SPLIT.md)
_LOADED = []


def _family_rules():
    """Per-family declaration files (each defines DECLARED and/or DECLARED_RULES like this module)."""
    if not _LOADED:
        import importlib
        for name in FAMILY_MODULES:
            try:
                module = importlib.import_module('pm_goal_dg5_declarations_' + name)
            except ModuleNotFoundError as error:
                if error.name != 'pm_goal_dg5_declarations_' + name:
                    raise
                continue
            _LOADED.append(module)
        _LOADED.append(None)  # loaded marker
    return [m for m in _LOADED if m is not None]


def declared(case_id):
    if case_id in DECLARED:
        return DECLARED[case_id]
    for module in _family_rules():
        if case_id in getattr(module, 'DECLARED', {}):
            return module.DECLARED[case_id]
        for test, members, reason in getattr(module, 'DECLARED_RULES', ()):
            if test(case_id):
                return members, reason
    for test, members, reason in DECLARED_RULES:
        if test(case_id):
            return members, reason
    return None


def target(case, ordinary, label=None):
    if case.get('dg5_target') is not None:  # a DG5 supplement case declares its own target
        return case['dg5_target']
    found = declared(case['id'])
    if found is not None:
        return found[0]
    chain = chains().get(label) if label else None
    if chain and ordinary in chain:
        return tuple(sorted(chain))
    return ordinary
