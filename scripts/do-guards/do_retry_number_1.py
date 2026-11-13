"""DO guard suite `retry_number_1` (sweep part 2A). Retry: the candidate's current-input number domain (NUMRULE adoption is sweep part 2B).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def retry_number_domain(value, context):
    return 'number_domain' if value['candidate_number_errors'] else None


ROWS = (
    ('retry_number_domain', '/candidate', 'holds only current-input number spellings in its semantic fields',
     'number_domain', retry_number_domain, ('candidate_number_errors',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('retry_number_domain', g.Invariant('/candidate', 'holds only current-input number spellings in its semantic fields'), 'number_domain', retry_number_domain),
    ])
    context = None

    def check(complete):
        table.require('retry_number_domain', complete, context)
        return True
    return g.Case(table, check, context)
