"""DO guard suite `transport_ingest_1` (sweep part 2A). Transport: the ingest adapter and the encoding fence.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def inline_base64_body(value, context):
    return 'inline_base64_body' if value['ingest_encoding'] != 'decoded' else None


ROWS = (
    ('inline_base64_body', '/ingest_encoding', "is 'decoded' (the adapter decoded any encoded input)",
     'inline_base64_body', inline_base64_body, ('ingest_encoding',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('inline_base64_body', g.Invariant('/ingest_encoding', "is 'decoded' (the adapter decoded any encoded input)"), 'inline_base64_body', inline_base64_body),
    ])
    context = None

    def check(complete):
        table.require('inline_base64_body', complete, context)
        return True
    return g.Case(table, check, context)
