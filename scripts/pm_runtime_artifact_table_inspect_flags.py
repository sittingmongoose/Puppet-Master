"""DR guard table inspect_flags: Authenticated source inspection for retained reads.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('withdrawn', 'authorized', 'source_valid', 'receipt_valid', 'source_project_id', 'payload_project_id', 'source_event_type', 'row_event_type')


def H01a_withdrawn(value, context):
    return 'unavailable' if value['withdrawn'] is not False else None


def H01b_authorized(value, context):
    return 'unavailable' if value['authorized'] is not True else None


def H02a_source_valid(value, context):
    return 'unavailable' if value['source_valid'] is not True else None


def H02b_receipt_valid(value, context):
    return 'unavailable' if value['receipt_valid'] is not True else None


def H03a_project(value, context):
    return 'identity_conflict' if value['source_project_id'] != value['payload_project_id'] else None


def H03b_family(value, context):
    return 'identity_conflict' if value['source_event_type'] != value['row_event_type'] else None


def flags_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('H01a_withdrawn', g.Invariant('/withdrawn', 'is exactly false'), 'unavailable', H01a_withdrawn),
        g.Guard('H01b_authorized', g.Invariant('/authorized', 'is exactly true'), 'unavailable', H01b_authorized),
        g.Guard('H02a_source_valid', g.Invariant('/source_valid', 'is exactly true'), 'unavailable', H02a_source_valid),
        g.Guard('H02b_receipt_valid', g.Invariant('/receipt_valid', 'is exactly true'), 'unavailable', H02b_receipt_valid),
        g.Guard('H03a_project', g.Invariant('/source_project_id', 'equals the payload project_id'), 'identity_conflict', H03a_project),
        g.Guard('H03b_family', g.Invariant('/source_event_type', 'equals the draft row event type'), 'identity_conflict', H03b_family),
    ])

    def check(value):
        table.require('H01a_withdrawn', value, context)
        table.require('H01b_authorized', value, context)
        table.require('H02a_source_valid', value, context)
        table.require('H02b_receipt_valid', value, context)
        table.require('H03a_project', value, context)
        table.require('H03b_family', value, context)
        return True
    return g.Case(table, check, context)
