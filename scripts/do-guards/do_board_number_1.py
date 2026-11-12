"""DO guard suite `board_number_1` (sweep part 2A). Board join: payload and envelope number domains (NUMRULE adoption is sweep part 2B; board_join_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def board_payload_number_domain(value, context):
    return 'number_domain' if value['payload_number_errors'] else None


def board_envelope_number_domain(value, context):
    return 'number_domain' if value['envelope_number_errors'] else None


ROWS = (
    ('board_payload_number_domain', '/payload', 'holds only current-input number spellings',
     'number_domain', board_payload_number_domain, ('payload_number_errors',), 'board_number'),
    ('board_envelope_number_domain', '/envelope', 'holds only current-input number spellings',
     'number_domain', board_envelope_number_domain, ('envelope_number_errors',), 'board_number'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('board_payload_number_domain', g.Invariant('/payload', 'holds only current-input number spellings'), 'number_domain', board_payload_number_domain),
        g.Guard('board_envelope_number_domain', g.Invariant('/envelope', 'holds only current-input number spellings'), 'number_domain', board_envelope_number_domain),
    ])
    context = None

    def check(complete):
        table.require('board_payload_number_domain', complete, context)
        table.require('board_envelope_number_domain', complete, context)
        return True
    return g.Case(table, check, context)
