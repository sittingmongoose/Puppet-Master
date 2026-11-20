"""DO guard suite `successor_storage_count_1` (sweep part 2A). Successor graph: one Storage member (successor_errors stops after it).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def successor_storage_member(value, context):
    return 'successor_storage_member' if value['storage_member_count'] != 1 else None


ROWS = (
    ('successor_storage_member', '/storage_value_registry/families/crew_board_message_application_v2', 'appears exactly once',
     'successor_storage_member', successor_storage_member, ('storage_member_count',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('successor_storage_member', g.Invariant('/storage_value_registry/families/crew_board_message_application_v2', 'appears exactly once'), 'successor_storage_member', successor_storage_member),
    ])
    context = None

    def check(complete):
        table.require('successor_storage_member', complete, context)
        return True
    return g.Case(table, check, context)
