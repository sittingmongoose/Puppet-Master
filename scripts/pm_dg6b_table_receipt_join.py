"""DG6B guard table receipt_join: Typed original receipt event/sequence/full-value binding against the independently sealed EventRecord.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('receipt_binding_digest', 'original_binding_digest')


def RJ01_original_receipt(value, context):
    return 'receipt_original_join' if value['receipt_binding_digest'] != value['original_binding_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('RJ01_original_receipt', g.Invariant('/first_append_receipt', 'the receipt event/sequence/full-value tuple equals the original EventRecord tuple'), 'receipt_original_join', RJ01_original_receipt),
    ])

    def check(value):
        table.require('RJ01_original_receipt', value, context)
        return True
    return g.Case(table, check, context)
