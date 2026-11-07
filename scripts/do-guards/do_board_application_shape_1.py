"""DO guard suite `board_application_shape_1` (sweep part 2A). Board source, application scope: closed edition schemas (board_source_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def application_source_schema(value, context):
    if value['board_branch'] != 'application':
        return None
    return 'application_source_schema' if value['source_schema_valid'] is not True else None


ROWS = (
    ('application_source_schema', '/source', 'validates against its closed application edition schema',
     'application_source_schema', application_source_schema, ('source_schema_valid', 'board_branch'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('application_source_schema', g.Invariant('/source', 'validates against its closed application edition schema'), 'application_source_schema', application_source_schema),
    ])
    context = None

    def check(complete):
        table.require('application_source_schema', complete, context)
        return True
    return g.Case(table, check, context)
