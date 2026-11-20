"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def ss_rec_read(value, context):
    record = value['ss_rec_read']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_rec_read_refused'
    return None

def ss_rec_schema(value, context):
    record = value['ss_rec_schema']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'ss_rec_schema_refused'
    return None

def ss_rec_numbers(value, context):
    record = value['ss_rec_numbers']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'ss_rec_numbers_refused'
    return None

def ss_rec_time(value, context):
    record = value['ss_rec_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'ss_rec_time_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('ss_rec_read', g.Invariant('/ss_rec_read', 'The passive read returns the exact fields, freshness and health from the current source, or typed unavailable, with no effect.'), 'ss_rec_read_refused', ss_rec_read),
        g.Guard('ss_rec_schema', g.Invariant('/ss_rec_schema', 'Every capsule revision keeps every keyword of the closed SP-293 capsule schema.'), 'ss_rec_schema_refused', ss_rec_schema),
        g.Guard('ss_rec_numbers', g.Invariant('/ss_rec_numbers', 'Every first-receipt Storage integer copy uses shared storage_uint64.'), 'ss_rec_numbers_refused', ss_rec_numbers),
        g.Guard('ss_rec_time', g.Invariant('/ss_rec_time', 'Receipt acknowledgements use EventRecord and capsule custody times use Storage UTC-Z date_time.'), 'ss_rec_time_refused', ss_rec_time),
    ])

    def check(value):
        table.require('ss_rec_read', value, context)
        table.require('ss_rec_schema', value, context)
        table.require('ss_rec_numbers', value, context)
        table.require('ss_rec_time', value, context)
        return True
    return g.Case(table, check, context)
