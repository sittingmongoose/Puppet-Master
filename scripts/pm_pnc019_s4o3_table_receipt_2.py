"""S4 reference-store receipt_2 predicates (generated)."""
import pm_guard_isolation as g


def receipt_first_append_receipt_acknowledged_at_utc(v, context):
    if type(v['receipt_first_append_receipt_acknowledged_at_utc']['seen']) is not type(v['receipt_first_append_receipt_acknowledged_at_utc']['first']) or v['receipt_first_append_receipt_acknowledged_at_utc']['seen'] != v['receipt_first_append_receipt_acknowledged_at_utc']['first']:
        return 'retained_receipt_join'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('receipt_first_append_receipt_acknowledged_at_utc', g.Invariant('/receipt_first_append_receipt_acknowledged_at_utc', 'actual reference-store receipt_first_append_receipt_acknowledged_at_utc invariant'), 'retained_receipt_join', receipt_first_append_receipt_acknowledged_at_utc),
    ])

    def check(value):
        table.require('receipt_first_append_receipt_acknowledged_at_utc', value, context)
        return True
    return g.Case(table, check, context)
