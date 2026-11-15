"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def ss_boot_bucket(value, context):
    record = value['ss_boot_bucket']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_boot_bucket_refused'
    return None

def ss_boot_reader(value, context):
    record = value['ss_boot_reader']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_boot_reader_refused'
    return None

def ss_boot_schema(value, context):
    record = value['ss_boot_schema']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'ss_boot_schema_refused'
    return None

def ss_boot_time(value, context):
    record = value['ss_boot_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'ss_boot_time_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('ss_boot_bucket', g.Invariant('/ss_boot_bucket', 'Application Boot records count in app:storage_operational: 2,000,000, fail-closed, compacting only expired unheld members.'), 'ss_boot_bucket_refused', ss_boot_bucket),
        g.Guard('ss_boot_reader', g.Invariant('/ss_boot_reader', 'The passive history reader stores no checkpoint and returns unavailable, not an empty history, when coverage does not verify.'), 'ss_boot_reader_refused', ss_boot_reader),
        g.Guard('ss_boot_schema', g.Invariant('/ss_boot_schema', 'Every floor, pending and anchor value keeps every keyword of the closed SP-292 floor schema.'), 'ss_boot_schema_refused', ss_boot_schema),
        g.Guard('ss_boot_time', g.Invariant('/ss_boot_time', 'Boot first-receipt acknowledgements use the EventRecord date_time profile (E5-2).'), 'ss_boot_time_refused', ss_boot_time),
    ])

    def check(value):
        table.require('ss_boot_bucket', value, context)
        table.require('ss_boot_reader', value, context)
        table.require('ss_boot_schema', value, context)
        table.require('ss_boot_time', value, context)
        return True
    return g.Case(table, check, context)
