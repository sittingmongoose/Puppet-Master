"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sealed_dispatch(value, context):
    record = value['sealed_dispatch']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sealed_dispatch_refused'
    return None

def store_snapshot(value, context):
    record = value['store_snapshot']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'store_snapshot_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sealed_dispatch', g.Invariant('/sealed_dispatch', 'Retained recipe selected only from unique independently sealed original receipt.'), 'sealed_dispatch_refused', sealed_dispatch),
        g.Guard('store_snapshot', g.Invariant('/store_snapshot', 'Retained read preserves the complete sealed store snapshot.'), 'store_snapshot_refused', store_snapshot),
    ])

    def check(value):
        table.require('sealed_dispatch', value, context)
        table.require('store_snapshot', value, context)
        return True
    return g.Case(table, check, context)
