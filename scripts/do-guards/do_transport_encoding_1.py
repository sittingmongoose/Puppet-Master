"""DO guard suite `transport_encoding_1` (sweep part 2A). Transport: a value the transport codecs cannot encode.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def payload_encoding(value, context):
    return 'payload_encoding' if value['transport_encoding_failed'] is True else None


ROWS = (
    ('payload_encoding', '/event/payload', 'encodes under the transport codecs (no TypeError/ValueError/UnicodeError/KeyError)',
     'payload_encoding', payload_encoding, ('transport_encoding_failed',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('payload_encoding', g.Invariant('/event/payload', 'encodes under the transport codecs (no TypeError/ValueError/UnicodeError/KeyError)'), 'payload_encoding', payload_encoding),
    ])
    context = None

    def check(complete):
        table.require('payload_encoding', complete, context)
        return True
    return g.Case(table, check, context)
