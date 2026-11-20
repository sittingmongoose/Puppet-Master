"""DO guard suite `history_state_1` (sweep part 2A). Historical read: the reader state schema (historical_read_errors stops after it).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def historical_state_schema(value, context):
    return 'historical_state_schema' if value['historical_state_valid'] is not True else None


ROWS = (
    ('historical_state_schema', '/historical_reader_state', 'validates against the closed historical-read schema',
     'historical_state_schema', historical_state_schema, ('historical_state_valid',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('historical_state_schema', g.Invariant('/historical_reader_state', 'validates against the closed historical-read schema'), 'historical_state_schema', historical_state_schema),
    ])
    context = None

    def check(complete):
        table.require('historical_state_schema', complete, context)
        return True
    return g.Case(table, check, context)
