"""DG5 declared duplicate sets for goal_run.started (owner: helper B, SPLIT.md).

Same form as pm_goal_dg5_declarations: DECLARED = {case_id: (members, reason)} and/or DECLARED_RULES =
((case-id test, members, reason), ...). Every set is reviewed against the source before the judging run:
all members check the same field with the same predicate. Sets of the enum/const-closed class
(lead decision 1116073727-d098) are listed apart in ENUM_CLOSED_RULES and in the handoff report.
"""
S_READERS = 'dg5/site/pm_goal_dg_s_readers.py:'
S_START = 'dg5/site/pm_goal_dg_s_start.py:'

DECLARED = {}
DECLARED_RULES = (
    (lambda cid: cid == 'S4/historical_reader_withdrawn',
     (S_READERS + '788', S_READERS + '790'),
     'StartedReaders._passive checks `method not in self.withdrawn_readers` at pm_goal_dg_s_readers.py:788 and '
     're-checks the identical predicate on the same set at its final boundary :790.'),
    (lambda cid: cid in ('S5/fourth_generation_slot_refused', 'S5/held_retired_generation_not_removed'),
     (S_READERS + '607', 'dg5/projector/logical/schema'),
     'StartedProjector.stage requires len(generations) < 3 before adding a generation '
     '(pm_goal_dg_s_readers.py:607), and the LogicalCheckpoint schema it then validates in _logical '
     '(pm_goal_dg_s_readers.py:593, row projector/logical/schema) bounds the same field, generations, '
     'by maxProperties 3 (Plans/goal_run_projection_reference_contracts/started.v1.schema.json '
     '$defs/LogicalCheckpoint). Same field, same bound: at most three generations.'),
    (lambda cid: cid == 'S1/second_operation_while_candidate_pending',
     (S_START + '973', S_START + '1004'),
     'Both sites guard the same local (pending, prepared) pair under the same code '
     'start/pending_other_operation: with a pending candidate present, :973 requires this '
     "operation's prepared submission to exist, and the else branch at :1004 requires no "
     'pending candidate before writing a new one. The defect state (pending for another '
     'operation, no prepared submission for this one) is the single state both refuse, at '
     'the two points where commit_start branches on prepared.'),
)


# Enum- or const-closed equivalent checks (lead decision 1116073727-d098; listed apart in the report).
COMMITMENT_CLOSURE = (
    "Plans/event_append_receipt_contracts.schema.json $defs/original_event_value_commitment is const-closed: "
    "schema_id, schema_version, codec, domain, event_schema_id and event_schema_version are each a schema "
    "const; sha256 (pattern ^[0-9a-f]{64}$) is the only free field. Representation.decode validates the whole "
    "row against the successor schema at pm_goal_dg_s_readers.py:471 (dg5/representation/row/schema) before "
    ":489/:491 run, and relations() binds the custody commitment's sha256 to the recomputed digest "
    "(pm_goal_dg_s_readers.py:206, required at :258) in the same acquired original. Paths checked for a "
    "single kill first: the sha256 defect (the authored S6/false_commitment) refuses at :489, so :491 can "
    "never be the first refusal; a defect in any const field refuses at the :471 schema row before both "
    "checks, and decode validates on every call, so no real path carries an out-of-const commitment past "
    "the schema to :489 alone.")
ENUM_CLOSED_RULES = (
    (lambda cid: cid == 'S6/false_commitment',
     (S_READERS + '489', S_READERS + '491'),
     "wrapper.original_event_value_commitment equals the custody commitment (:489) and its sha256 equals "
     "the recomputed full-value digest of the record's event (:491) agree on every defect value over the "
     "const-closed commitment: only sha256 can differ, and both fix it to the same digest. "
     + COMMITMENT_CLOSURE),
)
DECLARED_RULES += ENUM_CLOSED_RULES
