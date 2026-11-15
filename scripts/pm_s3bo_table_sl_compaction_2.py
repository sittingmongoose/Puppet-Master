"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sl_cmp_retirement(value, context):
    record = value['sl_cmp_retirement']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_retirement_refused'
    return None

def sl_cmp_backup(value, context):
    record = value['sl_cmp_backup']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_backup_refused'
    return None

def sl_cmp_numbers(value, context):
    record = value['sl_cmp_numbers']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sl_cmp_numbers_refused'
    return None

def sl_cmp_time(value, context):
    record = value['sl_cmp_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sl_cmp_time_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sl_cmp_retirement', g.Invariant('/sl_cmp_retirement', 'The retirement intent with its HMP id precedes every unlink, each unlink is rechecked, the compact receipt is filled before the intent clears and a crash keeps the intent.'), 'sl_cmp_retirement_refused', sl_cmp_retirement),
        g.Guard('sl_cmp_backup', g.Invariant('/sl_cmp_backup', 'Restore keeps the original settlement and retirement times and receipts, active-detail removal leaves backup copies, and old pending identity never first-mints.'), 'sl_cmp_backup_refused', sl_cmp_backup),
        g.Guard('sl_cmp_numbers', g.Invariant('/sl_cmp_numbers', 'Detail member lengths use shared storage_uint64.'), 'sl_cmp_numbers_refused', sl_cmp_numbers),
        g.Guard('sl_cmp_time', g.Invariant('/sl_cmp_time', 'Proof capture times and their event occurrence copies use the EventRecord date-time profile.'), 'sl_cmp_time_refused', sl_cmp_time),
    ])

    def check(value):
        table.require('sl_cmp_retirement', value, context)
        table.require('sl_cmp_backup', value, context)
        table.require('sl_cmp_numbers', value, context)
        table.require('sl_cmp_time', value, context)
        return True
    return g.Case(table, check, context)
