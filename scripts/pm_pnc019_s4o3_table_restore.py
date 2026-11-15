"""S4 reference-store restore predicates (generated)."""
import pm_guard_isolation as g


def restore_commitment(v, context):
    if v['captured_digest'] != v['expected_digest']:
        return 'restore_commitment'
    return None


def restore_receipts(v, context):
    if v['receipt_refs'] != v['original_refs']:
        return 'restore_custody'
    return None


def restore_holds(v, context):
    if v['captured_holds'] != v['expected_holds']:
        return 'restore_hold'
    return None


def restore_instance(v, context):
    if v['captured_instance'] != v['expected_instance']:
        return 'restore_identity'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('restore_commitment', g.Invariant('/restore_commitment', 'actual reference-store restore_commitment invariant'), 'restore_commitment', restore_commitment),
        g.Guard('restore_receipts', g.Invariant('/restore_receipts', 'actual reference-store restore_receipts invariant'), 'restore_custody', restore_receipts),
        g.Guard('restore_holds', g.Invariant('/restore_holds', 'actual reference-store restore_holds invariant'), 'restore_hold', restore_holds),
        g.Guard('restore_instance', g.Invariant('/restore_instance', 'actual reference-store restore_instance invariant'), 'restore_identity', restore_instance),
    ])

    def check(value):
        table.require('restore_commitment', value, context)
        table.require('restore_receipts', value, context)
        table.require('restore_holds', value, context)
        table.require('restore_instance', value, context)
        return True
    return g.Case(table, check, context)
