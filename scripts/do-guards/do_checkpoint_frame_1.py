"""DO guard suite `checkpoint_frame_1` (sweep part 2A). Checkpoint read: the null last frame (checkpoint_errors stops after it).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def coverage_last_frame_present(value, context):
    return 'index_coverage_last_frame_null' if value['coverage']['last_frame'] is None else None


ROWS = (
    ('coverage_last_frame_present', '/read/checkpoint/generations/*/frontier/coverage/last_frame', 'is not null',
     'index_coverage_last_frame_null', coverage_last_frame_present, ('coverage',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('coverage_last_frame_present', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/last_frame', 'is not null'), 'index_coverage_last_frame_null', coverage_last_frame_present),
    ])
    context = None

    def check(complete):
        table.require('coverage_last_frame_present', complete, context)
        return True
    return g.Case(table, check, context)
