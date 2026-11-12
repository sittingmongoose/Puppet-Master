"""DO guard suite `board_application_shape_3` (sweep part 2A). Board source, application scope: closed edition schemas (board_source_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def application_wrapper_schema(value, context):
    if value['board_branch'] != 'application':
        return None
    return 'application_wrapper_schema' if value['wrapper_schema_valid'] is not True else None


ROWS = (
    ('application_wrapper_schema', '/wrapper', 'validates against its closed application edition schema',
     'application_wrapper_schema', application_wrapper_schema, ('wrapper_schema_valid', 'board_branch'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('application_wrapper_schema', g.Invariant('/wrapper', 'validates against its closed application edition schema'), 'application_wrapper_schema', application_wrapper_schema),
    ])
    context = None

    def check(complete):
        table.require('application_wrapper_schema', complete, context)
        return True
    return g.Case(table, check, context)
