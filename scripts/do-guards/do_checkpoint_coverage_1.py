"""DO guard suite `checkpoint_coverage_1` (sweep part 2A). Checkpoint read: the frontier coverage, sequence, segment, selection, gap, locator and generation copies (DO-P1F04/05/06).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def coverage_complete(value, context):
    return 'index_complete_source_coverage' if value['coverage']['complete_to_captured_boundary'] is not True else None


ROWS = (
    ('coverage_complete', '/read/checkpoint/generations/*/frontier/coverage/complete_to_captured_boundary', 'is exactly true (duplicates the schema const)',
     'index_complete_source_coverage', coverage_complete, ('coverage',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('coverage_complete', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/complete_to_captured_boundary', 'is exactly true (duplicates the schema const)'), 'index_complete_source_coverage', coverage_complete),
    ])
    context = None

    def check(complete):
        table.require('coverage_complete', complete, context)
        return True
    return g.Case(table, check, context)
