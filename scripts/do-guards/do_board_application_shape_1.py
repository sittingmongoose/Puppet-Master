"""DO guard suite `board_application_shape_1` (sweep part 2A). Board source, application scope: closed edition schemas (board_source_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def application_source_schema(value, context):
    return 'application_source_schema' if value['source_schema_valid'] is not True else None


def application_input_schema(value, context):
    return 'application_input_schema' if value['input_schema_valid'] is not True else None


def application_wrapper_schema(value, context):
    return 'application_wrapper_schema' if value['wrapper_schema_valid'] is not True else None


ROWS = (
    ('application_source_schema', '/source', 'validates against its closed application edition schema',
     'application_source_schema', application_source_schema, ('source_schema_valid',), None),
    ('application_input_schema', '/source/original_input', 'validates against its closed application edition schema',
     'application_input_schema', application_input_schema, ('input_schema_valid',), None),
    ('application_wrapper_schema', '/wrapper', 'validates against its closed application edition schema',
     'application_wrapper_schema', application_wrapper_schema, ('wrapper_schema_valid',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('application_source_schema', g.Invariant('/source', 'validates against its closed application edition schema'), 'application_source_schema', application_source_schema),
        g.Guard('application_input_schema', g.Invariant('/source/original_input', 'validates against its closed application edition schema'), 'application_input_schema', application_input_schema),
        g.Guard('application_wrapper_schema', g.Invariant('/wrapper', 'validates against its closed application edition schema'), 'application_wrapper_schema', application_wrapper_schema),
    ])
    context = None

    def check(complete):
        table.require('application_source_schema', complete, context)
        table.require('application_input_schema', complete, context)
        table.require('application_wrapper_schema', complete, context)
        return True
    return g.Case(table, check, context)
