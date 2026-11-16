"""DG5 declared duplicate sets for goal_run.started (owner: helper B, SPLIT.md).

Same form as pm_goal_dg5_declarations: DECLARED = {case_id: (members, reason)} and/or DECLARED_RULES =
((case-id test, members, reason), ...). Every set is reviewed against the source before the judging run:
all members check the same field with the same predicate.
"""
S_READERS = 'dg5/site/pm_goal_dg_s_readers.py:'

DECLARED = {}
DECLARED_RULES = (
    (lambda cid: cid == 'S4/historical_reader_withdrawn',
     (S_READERS + '788', S_READERS + '790'),
     'StartedReaders._passive checks `method not in self.withdrawn_readers` at pm_goal_dg_s_readers.py:788 and '
     're-checks the identical predicate on the same set at its final boundary :790.'),
)
