"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def source_time(value, context):
    record = value['source_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'source_time_refused'
    return None

def storage_time(value, context):
    record = value['storage_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'storage_time_refused'
    return None

def ack_time(value, context):
    record = value['ack_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'ack_time_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('source_time', g.Invariant('/source_time', 'Source timestamps use date_time EVENT_RECORD without normalization.'), 'source_time_refused', source_time),
        g.Guard('storage_time', g.Invariant('/storage_time', 'Observed and persisted times use date_time STORAGE_UTC_Z.'), 'storage_time_refused', storage_time),
        g.Guard('ack_time', g.Invariant('/ack_time', 'AppendReceipt acknowledged_at_utc uses EVENT_RECORD (E5-2).'), 'ack_time_refused', ack_time),
    ])

    def check(value):
        table.require('source_time', value, context)
        table.require('storage_time', value, context)
        table.require('ack_time', value, context)
        return True
    return g.Case(table, check, context)
