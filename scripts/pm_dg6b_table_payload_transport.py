"""DG6B guard table payload_transport: Inline envelope body equals the payload; a referenced body is the empty object.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('envelope_payload_digest', 'expected_payload_digest')


def PJ01_body_copy(value, context):
    return 'payload_transport_join' if value['envelope_payload_digest'] != value['expected_payload_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PJ01_body_copy', g.Invariant('/event_record/payload', 'equals the payload inline, or {} with payload_ref'), 'payload_transport_join', PJ01_body_copy),
    ])

    def check(value):
        table.require('PJ01_body_copy', value, context)
        return True
    return g.Case(table, check, context)
