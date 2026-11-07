"""DO guard suite `board_application_shape_2` (sweep part 2A). Board source, application scope: closed edition schemas (board_source_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def application_input_schema(value, context):
    if value['board_branch'] != 'application':
        return None
    return 'application_input_schema' if value['input_schema_valid'] is not True else None


ROWS = (
    ('application_input_schema', '/source/original_input', 'validates against its closed application edition schema',
     'application_input_schema', application_input_schema, ('input_schema_valid', 'board_branch'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('application_input_schema', g.Invariant('/source/original_input', 'validates against its closed application edition schema'), 'application_input_schema', application_input_schema),
    ])
    context = None

    def check(complete):
        table.require('application_input_schema', complete, context)
        return True
    return g.Case(table, check, context)
