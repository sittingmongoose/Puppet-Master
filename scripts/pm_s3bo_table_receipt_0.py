"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def receipt_schema(value, context):
    record = value['receipt_schema']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'receipt_schema_refused'
    return None

def receipt_numbers(value, context):
    record = value['receipt_numbers']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'receipt_numbers_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('receipt_schema', g.Invariant('/receipt_schema', 'The first receipt validates as the complete closed CV-339 AppendReceipt.'), 'receipt_schema_refused', receipt_schema),
        g.Guard('receipt_numbers', g.Invariant('/receipt_numbers', 'Every Storage-assigned receipt integer uses shared storage_uint64.'), 'receipt_numbers_refused', receipt_numbers),
    ])

    def check(value):
        table.require('receipt_schema', value, context)
        table.require('receipt_numbers', value, context)
        return True
    return g.Case(table, check, context)
