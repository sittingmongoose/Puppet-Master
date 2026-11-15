"""DG6B guard table receipt_schema: Schema occurrence: the sealed CV-339 full-value original receipt result.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('errors',)


def RC01_full_receipt(value, context):
    return 'receipt_schema' if value['errors'] != 0 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('RC01_full_receipt', g.Invariant('/errors', 'the complete original full_value_result owner schema reports no error'), 'receipt_schema', RC01_full_receipt),
    ])

    def check(value):
        table.require('RC01_full_receipt', value, context)
        return True
    return g.Case(table, check, context)
