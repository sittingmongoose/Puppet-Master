"""DG6B guard table number_qualification: CV-1100 / SP-1100 route qualification, before any join or effect (sweep part 2B).

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('producer_qualified', 'payload_physical')


def PQ01_producer_jcs(value, context):
    return 'producer_number_domain' if value['producer_qualified'] is not True else None


def PQ02_payload_physical(value, context):
    return 'payload_number_domain' if value['producer_qualified'] is True and value['payload_physical'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PQ01_producer_jcs', g.Invariant('/event_record', 'the CV-317 producer projection has exact RFC 8785 JCS bytes (CV-1100)'), 'producer_number_domain', PQ01_producer_jcs),
        g.Guard('PQ02_payload_physical', g.Invariant('/payload', 'the logical payload has SP-236 EVENT_VALUE bytes (SP-1100; projection qualified)'), 'payload_number_domain', PQ02_payload_physical),
    ])

    def check(value):
        table.require('PQ01_producer_jcs', value, context)
        table.require('PQ02_payload_physical', value, context)
        return True
    return g.Case(table, check, context)
