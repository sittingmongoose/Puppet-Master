"""DO guard suite `append_join_1` (sweep part 2A). Append: the envelope joins to the payload and the recomputed identity.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def event_type_pattern(value, context):
    if value['payload_schema_valid'] is not True:
        return None
    return 'event_type_join' if value['event_type_pattern_valid'] is not True else None


ROWS = (
    ('event_type_pattern', '/event/event_type', 'full-matches the dotted family identifier grammar',
     'event_type_join', event_type_pattern, ('event_type_pattern_valid', 'payload_schema_valid'), 'event_type_join'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('event_type_pattern', g.Invariant('/event/event_type', 'full-matches the dotted family identifier grammar'), 'event_type_join', event_type_pattern),
    ])
    context = None

    def check(complete):
        table.require('event_type_pattern', complete, context)
        return True
    return g.Case(table, check, context)
