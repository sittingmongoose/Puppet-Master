"""DO guard suite `checkpoint_schema_1` (sweep part 2A). Checkpoint read: the two schema verdicts (checkpoint_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def checkpoint_value_schema(value, context):
    return 'checkpoint_schema' if value['checkpoint_schema_valid'] is not True else None


def read_token_value_schema(value, context):
    return 'checkpoint_schema' if value['read_token_schema_valid'] is not True else None


ROWS = (
    ('checkpoint_value_schema', '/read/checkpoint', 'validates against the closed checkpoint schema',
     'checkpoint_schema', checkpoint_value_schema, ('checkpoint_schema_valid',), 'checkpoint_schema'),
    ('read_token_value_schema', '/read/read_token', 'validates against the closed read-token schema',
     'checkpoint_schema', read_token_value_schema, ('read_token_schema_valid',), 'checkpoint_schema'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('checkpoint_value_schema', g.Invariant('/read/checkpoint', 'validates against the closed checkpoint schema'), 'checkpoint_schema', checkpoint_value_schema),
        g.Guard('read_token_value_schema', g.Invariant('/read/read_token', 'validates against the closed read-token schema'), 'checkpoint_schema', read_token_value_schema),
    ])
    context = None

    def check(complete):
        table.require('checkpoint_value_schema', complete, context)
        table.require('read_token_value_schema', complete, context)
        return True
    return g.Case(table, check, context)
