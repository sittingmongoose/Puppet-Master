"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def record_cas(value, context):
    record = value['record_cas']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'record_cas_refused'
    return None

def append_order(value, context):
    record = value['append_order']
    if record['applies'] is not True:
        return None
    if record['left'] >= record['right']:
        return 'append_order_refused'
    return None

def receipt_order(value, context):
    record = value['receipt_order']
    if record['applies'] is not True:
        return None
    if record['left'] >= record['right']:
        return 'receipt_order_refused'
    return None

def raw_order(value, context):
    record = value['raw_order']
    if record['applies'] is not True:
        return None
    if record['left'] >= record['right']:
        return 'raw_order_refused'
    return None

def materialize_order(value, context):
    record = value['materialize_order']
    if record['applies'] is not True:
        return None
    if record['left'] >= record['right']:
        return 'materialize_order_refused'
    return None

def attest_order(value, context):
    record = value['attest_order']
    if record['applies'] is not True:
        return None
    if record['left'] >= record['right']:
        return 'attest_order_refused'
    return None

def source_preserved(value, context):
    record = value['source_preserved']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'source_preserved_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('record_cas', g.Invariant('/record_cas', 'Record CAS compares against actual held revision.'), 'record_cas_refused', record_cas),
        g.Guard('append_order', g.Invariant('/append_order', 'Record CAS precedes barrier append.'), 'append_order_refused', append_order),
        g.Guard('receipt_order', g.Invariant('/receipt_order', 'First receipt precedes dependent publication.'), 'receipt_order_refused', receipt_order),
        g.Guard('raw_order', g.Invariant('/raw_order', 'Quarantine raw custody fsync precedes record CAS.'), 'raw_order_refused', raw_order),
        g.Guard('materialize_order', g.Invariant('/materialize_order', 'Application reserves target IDs before materialization.'), 'materialize_order_refused', materialize_order),
        g.Guard('attest_order', g.Invariant('/attest_order', 'Corruption FileSafe attestation precedes record CAS.'), 'attest_order_refused', attest_order),
        g.Guard('source_preserved', g.Invariant('/source_preserved', 'Application preserves source thread, branch, worktree and safe-point data.'), 'source_preserved_refused', source_preserved),
    ])

    def check(value):
        table.require('record_cas', value, context)
        table.require('append_order', value, context)
        table.require('receipt_order', value, context)
        table.require('raw_order', value, context)
        table.require('materialize_order', value, context)
        table.require('attest_order', value, context)
        table.require('source_preserved', value, context)
        return True
    return g.Case(table, check, context)
