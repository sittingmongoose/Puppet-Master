"""DO guard suite `history_disclosure_1` (sweep part 2A). Historical read: the current disclosure fence (after the original-event rows).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def disclosure_access_allowed(value, context):
    return 'historical_disclosure_fence' if not value['state']['current_access_allowed'] else None


def disclosure_source_present(value, context):
    return 'historical_disclosure_fence' if value['state']['source_deleted'] else None


def disclosure_hold_allows(value, context):
    return 'historical_disclosure_fence' if not value['state']['hold_allows_disclosure'] else None


ROWS = (
    ('disclosure_access_allowed', '/historical_reader_state/current_access_allowed', 'is true',
     'historical_disclosure_fence', disclosure_access_allowed, ('state',), 'disclosure'),
    ('disclosure_source_present', '/historical_reader_state/source_deleted', 'is false',
     'historical_disclosure_fence', disclosure_source_present, ('state',), 'disclosure'),
    ('disclosure_hold_allows', '/historical_reader_state/hold_allows_disclosure', 'is true',
     'historical_disclosure_fence', disclosure_hold_allows, ('state',), 'disclosure'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('disclosure_access_allowed', g.Invariant('/historical_reader_state/current_access_allowed', 'is true'), 'historical_disclosure_fence', disclosure_access_allowed),
        g.Guard('disclosure_source_present', g.Invariant('/historical_reader_state/source_deleted', 'is false'), 'historical_disclosure_fence', disclosure_source_present),
        g.Guard('disclosure_hold_allows', g.Invariant('/historical_reader_state/hold_allows_disclosure', 'is true'), 'historical_disclosure_fence', disclosure_hold_allows),
    ])
    context = None

    def check(complete):
        table.require('disclosure_access_allowed', complete, context)
        table.require('disclosure_source_present', complete, context)
        table.require('disclosure_hold_allows', complete, context)
        return True
    return g.Case(table, check, context)
