"""DO guard suite `retry_identity_1` (sweep part 2A). Retry: the candidate names the original identity.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def retry_same_scope_kind(value, context):
    if value['candidate_shape_valid'] is not True or value['original_shape_valid'] is not True:
        return None
    return 'different_identity' if value['original']['scope_kind'] != value['candidate']['scope_kind'] else None


ROWS = (
    ('retry_same_scope_kind', '/candidate/scope_kind', "equals the original's",
     'different_identity', retry_same_scope_kind, ('original', 'candidate', 'original_shape_valid', 'candidate_shape_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('retry_same_scope_kind', g.Invariant('/candidate/scope_kind', "equals the original's"), 'different_identity', retry_same_scope_kind),
    ])
    context = None

    def check(complete):
        table.require('retry_same_scope_kind', complete, context)
        return True
    return g.Case(table, check, context)
