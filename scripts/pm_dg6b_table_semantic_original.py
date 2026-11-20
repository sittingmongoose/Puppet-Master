"""DG6B guard table semantic_original: Retry semantic payload against the original payload.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('payload_digest', 'original_payload_digest')


def SO01_original_payload(value, context):
    return 'original_payload_conflict' if value['payload_digest'] != value['original_payload_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('SO01_original_payload', g.Invariant('/payload', 'equals the original payload (exact typed bytes)'), 'original_payload_conflict', SO01_original_payload),
    ])

    def check(value):
        table.require('SO01_original_payload', value, context)
        return True
    return g.Case(table, check, context)
