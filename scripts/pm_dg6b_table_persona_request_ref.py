"""DG6B guard table persona_request_ref: Owner request reference custody.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('owner_request_ref_digest', 'source_owner_request_ref_digest')


def RQ01_owner_request_ref(value, context):
    return 'original_source_join' if value['owner_request_ref_digest'] != value['source_owner_request_ref_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('RQ01_owner_request_ref', g.Invariant('/owner_request_ref', 'equals the source owner_request_ref (exact typed bytes)'), 'original_source_join', RQ01_owner_request_ref),
    ])

    def check(value):
        table.require('RQ01_owner_request_ref', value, context)
        return True
    return g.Case(table, check, context)
