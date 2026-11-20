"""DO guard suite `retry_replay_1` (sweep part 2A). Retry: replay-only candidates never append.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def retry_replay_only(value, context):
    if value['original_shape_valid'] is not True or value['candidate_shape_valid'] is not True:
        return None
    return 'replay_only_not_appendable' if value['candidate']['replay_policy'] == 'projector_replay_only' else None


ROWS = (
    ('retry_replay_only', '/candidate/replay_policy', 'is not projector_replay_only',
     'replay_only_not_appendable', retry_replay_only, ('candidate', 'original_shape_valid', 'candidate_shape_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('retry_replay_only', g.Invariant('/candidate/replay_policy', 'is not projector_replay_only'), 'replay_only_not_appendable', retry_replay_only),
    ])
    context = None

    def check(complete):
        table.require('retry_replay_only', complete, context)
        return True
    return g.Case(table, check, context)
