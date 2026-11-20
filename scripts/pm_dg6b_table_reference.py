"""DG6B guard table reference: SP-337 payload reference availability.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('resolved_present', 'resolved_ref', 'payload_ref', 'durable', 'access_current')


def RA01_resolved_present(value, context):
    return 'payload_ref_unavailable' if value['resolved_present'] is not True else None


def RA02_resolved_ref(value, context):
    return 'payload_ref_unavailable' if value['resolved_present'] is True and value['resolved_ref'] != value['payload_ref'] else None


def RA03_durable(value, context):
    return 'payload_ref_unavailable' if value['resolved_present'] is True and value['durable'] is not True else None


def RA04_access_current(value, context):
    return 'payload_ref_unavailable' if value['resolved_present'] is True and value['access_current'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('RA01_resolved_present', g.Invariant('/resolved', 'the referenced body was resolved'), 'payload_ref_unavailable', RA01_resolved_present),
        g.Guard('RA02_resolved_ref', g.Invariant('/resolved/ref', 'equals the payload reference (resolved)'), 'payload_ref_unavailable', RA02_resolved_ref),
        g.Guard('RA03_durable', g.Invariant('/resolved/durable', 'is exactly True (resolved)'), 'payload_ref_unavailable', RA03_durable),
        g.Guard('RA04_access_current', g.Invariant('/resolved/access_current', 'is exactly True (resolved)'), 'payload_ref_unavailable', RA04_access_current),
    ])

    def check(value):
        table.require('RA01_resolved_present', value, context)
        table.require('RA02_resolved_ref', value, context)
        table.require('RA03_durable', value, context)
        table.require('RA04_access_current', value, context)
        return True
    return g.Case(table, check, context)
