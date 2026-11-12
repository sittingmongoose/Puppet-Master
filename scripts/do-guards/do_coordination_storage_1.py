"""DO guard suite `coordination_storage_1` (sweep part 2A). Storage: the coordination_event_records row equals the coordination generator's (DO-P1F-01).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def coordination_storage_member(value, context):
    return 'actual_coordination_storage_member_drift' if value['typed_row'] != value['typed_expected_row'] else None


ROWS = (
    ('coordination_storage_member', '/storage_value_registry/families/coordination_event_records', "is a typed copy of expected_svr_rows()'s row",
     'actual_coordination_storage_member_drift', coordination_storage_member, ('typed_row', 'typed_expected_row'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('coordination_storage_member', g.Invariant('/storage_value_registry/families/coordination_event_records', "is a typed copy of expected_svr_rows()'s row"), 'actual_coordination_storage_member_drift', coordination_storage_member),
    ])
    context = None

    def check(complete):
        table.require('coordination_storage_member', complete, context)
        return True
    return g.Case(table, check, context)
