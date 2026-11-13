"""DO guard suite `append_number_1` (sweep part 2A). Append: the current-input number domain (NUMRULE adoption is sweep part 2B).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def append_number_domain(value, context):
    return 'number_domain' if value['number_domain_errors'] else None


ROWS = (
    ('append_number_domain', '/event + /logical_payload + /producer_context', 'hold only current-input number spellings (record_number_errors)',
     'number_domain', append_number_domain, ('number_domain_errors',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('append_number_domain', g.Invariant('/event + /logical_payload + /producer_context', 'hold only current-input number spellings (record_number_errors)'), 'number_domain', append_number_domain),
    ])
    context = None

    def check(complete):
        table.require('append_number_domain', complete, context)
        return True
    return g.Case(table, check, context)
