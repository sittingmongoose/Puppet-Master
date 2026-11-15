"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def writer_cutoff(value, context):
    record = value['writer_cutoff']
    if record['applies'] is not True:
        return None
    if record['left'] >= record['right']:
        return 'writer_cutoff_refused'
    return None

def reader_fence(value, context):
    record = value['reader_fence']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'reader_fence_refused'
    return None

def withdrawal_order(value, context):
    record = value['withdrawal_order']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'withdrawal_order_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('writer_cutoff', g.Invariant('/writer_cutoff', 'Current append is below the installed writer cutoff.'), 'writer_cutoff_refused', writer_cutoff),
        g.Guard('reader_fence', g.Invariant('/reader_fence', 'Withdrawn readers cannot disclose retained events.'), 'reader_fence_refused', reader_fence),
        g.Guard('withdrawal_order', g.Invariant('/withdrawal_order', 'Withdrawal installs cutoff, drains obligations, then fences the reader.'), 'withdrawal_order_refused', withdrawal_order),
    ])

    def check(value):
        table.require('writer_cutoff', value, context)
        table.require('reader_fence', value, context)
        table.require('withdrawal_order', value, context)
        return True
    return g.Case(table, check, context)
