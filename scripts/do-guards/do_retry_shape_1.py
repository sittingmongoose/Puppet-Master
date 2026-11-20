"""DO guard suite `retry_shape_1` (sweep part 2A). Retry: both records are well-formed EventRecords with valid inline payloads.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def retry_original_shape(value, context):
    return 'retry_value_schema' if value['original_shape_valid'] is not True else None


def retry_candidate_shape(value, context):
    if value['original_shape_valid'] is not True:
        return None
    return 'retry_value_schema' if value['candidate_shape_valid'] is not True else None


ROWS = (
    ('retry_original_shape', '/original', 'is a valid EventRecord with a valid payload',
     'retry_value_schema', retry_original_shape, ('original_shape_valid',), None),
    ('retry_candidate_shape', '/candidate', 'is a valid EventRecord with a valid payload',
     'retry_value_schema', retry_candidate_shape, ('original_shape_valid', 'candidate_shape_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('retry_original_shape', g.Invariant('/original', 'is a valid EventRecord with a valid payload'), 'retry_value_schema', retry_original_shape),
        g.Guard('retry_candidate_shape', g.Invariant('/candidate', 'is a valid EventRecord with a valid payload'), 'retry_value_schema', retry_candidate_shape),
    ])
    context = None

    def check(complete):
        table.require('retry_original_shape', complete, context)
        table.require('retry_candidate_shape', complete, context)
        return True
    return g.Case(table, check, context)
