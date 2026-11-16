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


DECLARED_RULES += (
    (lambda cid: cid == 'U5/G/commit_reserved_control_substituted',
     (U_SITE + '1206', U_SITE + '1237'),
     "GoalBodyOwner.commit requires `A.same(<current control>, reserved_control)`: :1206 on its first read and :1237 "
     'on its final re-read of the same Goal control record (the same field, the same predicate).'),
    (lambda cid: cid == 'U5/G/release_reserved_control_substituted',
     (U_SITE + '1267', U_SITE + '1272'),
     "GoalBodyOwner.release requires `A.same(<current control>, reserved_control)`: :1267 on its first read and :1272 "
     'on its final re-read of the same Goal control record (the same field, the same predicate).'),
    (lambda cid: cid == 'U5/N/goal_id_array',
     ('dg5/dgu/sir/request/schema', U_SITE + '286'),
     'GoalUpdateRequestV2 goal_id `type: string` and exact_str (pm_goal_dg_u_owners.py:286) `type(value) is str` '
     'require the same field to be a string.'),
)


# Enum- or const-closed equivalent checks (lead decision 1116073727-d098; listed apart in the report).
APPROVAL_CLOSURE = ("Plans/goal_runtime_contracts.schema.json ApprovalResolution.decision is enum-closed "
                    "{approved, denied, expired}; ApprovalOwner.decide validates the resolution against it at "
                    "pm_goal_dg_u_owners.py:1018 before read_resolution's checks run. Path checked for :1039 alone: a "
                    "stored resolution re-put without its schema (ApprovalOwner cells are digest-checked only) carries "
                    "an out-of-enum decision past :1037/:1038; supplement U-DG5/N/approval_decision_out_of_enum KILLS "
                    ":1039 alone.")
ENUM_CLOSED_RULES = (
    (lambda cid: cid == 'U5/N/approval_denied', (U_SITE + '1037', U_SITE + '1039'),
     "decision != 'denied' (:1037) and decision == 'approved' (:1039) agree on the defect value 'denied' over the "
     'enum-closed domain. ' + APPROVAL_CLOSURE),
    (lambda cid: cid == 'U5/N/approval_expired', (U_SITE + '1038', U_SITE + '1039'),
     "decision != 'expired' (:1038) and decision == 'approved' (:1039) agree on the defect value 'expired' over the "
     'enum-closed domain. ' + APPROVAL_CLOSURE),
)
DECLARED_RULES += ENUM_CLOSED_RULES

DECLARED_RULES += (
    (lambda cid: cid == 'U5/G/api_body_start_existing_goal',
     (U_SITE + '1087', 'dg5/site/pm_goal_test_storage.py:1654'),
     "GoalBodyOwner.start requires the goal body cell absent (:1087, cell(T_BODY, body_key) is None) and "
     "Storage's transact requires every expected=None write's current cell absent (tx/cas_absent, "
     "pm_goal_test_storage.py:1654): the same start-bundle cells, the same absence predicate. The start "
     "pre-check names the body key; the CAS enforces absence on it and its four sibling start keys."),
    (lambda cid: cid == 'U5/G/api_metadata_state_unknown',
     (U_SITE + '1289', 'dg5/dgu/body/metadata/intent/schema', 'dg5/dgu/body/goal_body_record/schema'),
     "metadata_update requires change.state in (active, paused, blocked, completed) at :1289; the intent "
     "record carries that same after_record body (pending schema, :1306 validate) and the stored body row "
     "is validated against storage_body, whose state is the same four-value enum: one field, one predicate."),
    (lambda cid: cid == 'U5/F/producer.publish/before_release/candidate',
     (U_SITE + '1793', U_SITE + '1800'),
     "publish requires A.same(ctx candidate, frozen producer_input) at :1793 before the append and "
     "A.same(producer25(stored event), frozen producer_input) at :1800 after it: the same whole "
     "producer_input value, the same exact-equality predicate, once on the candidate and once on "
     "its stored round-trip (producer25 is the stored event minus Storage-assigned fields)."),
    (lambda cid: cid == 'U5/G/api_metadata_blocked_without_reason',
     (U_SITE + '1291', 'dg5/dgu/body/metadata/intent/schema', 'dg5/dgu/body/goal_body_record/schema'),
     "metadata_update requires (state == blocked) == (blocked_reason_ref is not None) at :1291 on the "
     "change, then on the after body it builds from it (state and blocked_reason_ref copied at :1296-1297): "
     "the intent pending schema over after_record and the storage_body schema encode the same equivalence "
     "on the same two fields."),
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
