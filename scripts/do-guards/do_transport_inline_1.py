"""DO guard suite `transport_inline_1` (sweep part 2A). Transport: inline size and join.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

LIMIT = 16384


def inline_payload_size(value, context):
    return 'inline_payload_over_16k' if value['inline_packed_size'] > LIMIT else None


def inline_payload_join(value, context):
    event = value['event']
    if (type(event) is not dict or type(value['logical']) is not dict or type(event.get('payload')) is not dict
            or event.get('payload_ref') is not None):
        return None
    return 'inline_payload_join' if event.get('payload') != value['logical'] else None


ROWS = (
    ('inline_payload_size', '/event/payload', "packs to at most Storage's 16 KiB inline limit",
     'inline_payload_over_16k', inline_payload_size, ('inline_packed_size',), None),
    ('inline_payload_join', '/event/payload', 'equals the logical payload when payload_ref is null',
     'inline_payload_join', inline_payload_join, ('event', 'logical'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('inline_payload_size', g.Invariant('/event/payload', "packs to at most Storage's 16 KiB inline limit"), 'inline_payload_over_16k', inline_payload_size),
        g.Guard('inline_payload_join', g.Invariant('/event/payload', 'equals the logical payload when payload_ref is null'), 'inline_payload_join', inline_payload_join),
    ])
    context = None

    def check(complete):
        table.require('inline_payload_size', complete, context)
        table.require('inline_payload_join', complete, context)
        return True
    return g.Case(table, check, context)
