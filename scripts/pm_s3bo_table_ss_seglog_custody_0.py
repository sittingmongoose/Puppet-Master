"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def ss_seg_reader(value, context):
    record = value['ss_seg_reader']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_seg_reader_refused'
    return None

def ss_seg_schema(value, context):
    record = value['ss_seg_schema']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'ss_seg_schema_refused'
    return None

def ss_seg_time(value, context):
    record = value['ss_seg_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'ss_seg_time_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('ss_seg_reader', g.Invariant('/ss_seg_reader', 'The reader stores the nine-field durable token, discloses under the live token of its read and reports sources honestly.'), 'ss_seg_reader_refused', ss_seg_reader),
        g.Guard('ss_seg_schema', g.Invariant('/ss_seg_schema', 'Every stored reader checkpoint keeps every keyword of the closed SP-270 schema, so a stored redb_snapshot_id refuses.'), 'ss_seg_schema_refused', ss_seg_schema),
        g.Guard('ss_seg_time', g.Invariant('/ss_seg_time', 'Metadata first-receipt acknowledgements use the EventRecord date_time profile (E5-2).'), 'ss_seg_time_refused', ss_seg_time),
    ])

    def check(value):
        table.require('ss_seg_reader', value, context)
        table.require('ss_seg_schema', value, context)
        table.require('ss_seg_time', value, context)
        return True
    return g.Case(table, check, context)
