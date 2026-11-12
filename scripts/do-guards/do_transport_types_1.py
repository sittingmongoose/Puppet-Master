"""DO guard suite `transport_types_1` (sweep part 2A). Transport: argument types (transport_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def transport_event_object(value, context):
    return 'payload_types' if type(value['event']) is not dict else None


def transport_logical_object(value, context):
    return 'payload_types' if type(value['logical']) is not dict else None


def transport_packs_object(value, context):
    return 'payload_types' if type(value['packs']) is not dict else None


def transport_inline_payload_object(value, context):
    event = value['event']
    if type(event) is not dict:
        return None
    return 'payload_types' if type(event.get('payload')) is not dict else None


ROWS = (
    ('transport_event_object', '/event', 'is an object',
     'payload_types', transport_event_object, ('event',), 'payload_types'),
    ('transport_logical_object', '/logical_payload', 'is an object',
     'payload_types', transport_logical_object, ('logical',), 'payload_types'),
    ('transport_packs_object', '/payload_packs', 'is an object',
     'payload_types', transport_packs_object, ('packs',), 'payload_types'),
    ('transport_inline_payload_object', '/event/payload', 'is an object',
     'payload_types', transport_inline_payload_object, ('event',), 'payload_types'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('transport_event_object', g.Invariant('/event', 'is an object'), 'payload_types', transport_event_object),
        g.Guard('transport_logical_object', g.Invariant('/logical_payload', 'is an object'), 'payload_types', transport_logical_object),
        g.Guard('transport_packs_object', g.Invariant('/payload_packs', 'is an object'), 'payload_types', transport_packs_object),
        g.Guard('transport_inline_payload_object', g.Invariant('/event/payload', 'is an object'), 'payload_types', transport_inline_payload_object),
    ])
    context = None

    def check(complete):
        table.require('transport_event_object', complete, context)
        table.require('transport_logical_object', complete, context)
        table.require('transport_packs_object', complete, context)
        table.require('transport_inline_payload_object', complete, context)
        return True
    return g.Case(table, check, context)
