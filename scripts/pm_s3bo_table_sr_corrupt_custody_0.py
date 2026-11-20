"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sr_cor_once(value, context):
    record = value['sr_cor_once']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cor_once_refused'
    return None

def sr_cor_status(value, context):
    record = value['sr_cor_status']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cor_status_refused'
    return None

def sr_cor_reader(value, context):
    record = value['sr_cor_reader']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cor_reader_refused'
    return None

def sr_cor_receipt(value, context):
    record = value['sr_cor_receipt']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cor_receipt_refused'
    return None

def sr_cor_conflict(value, context):
    record = value['sr_cor_conflict']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cor_conflict_refused'
    return None

def sr_cor_schema(value, context):
    record = value['sr_cor_schema']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sr_cor_schema_refused'
    return None

def sr_cor_time(value, context):
    record = value['sr_cor_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sr_cor_time_refused'
    return None

def sr_cor_numbers(value, context):
    record = value['sr_cor_numbers']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sr_cor_numbers_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sr_cor_once', g.Invariant('/sr_cor_once', 'Re-detection and replay resolve to the existing commit; the first reason stands and nothing is minted.'), 'sr_cor_once_refused', sr_cor_once),
        g.Guard('sr_cor_status', g.Invariant('/sr_cor_status', 'The record bytes are never rewritten; readers project corrupt exactly when a settled corruption commit exists.'), 'sr_cor_status_refused', sr_cor_status),
        g.Guard('sr_cor_reader', g.Invariant('/sr_cor_reader', 'A reader that verifies a point only reports a candidate finding; it writes no commit.'), 'sr_cor_reader_refused', sr_cor_reader),
        g.Guard('sr_cor_receipt', g.Invariant('/sr_cor_receipt', "The commit names its event's own SP-286 custody key and replay returns that original receipt."), 'sr_cor_receipt_refused', sr_cor_receipt),
        g.Guard('sr_cor_conflict', g.Invariant('/sr_cor_conflict', 'Same identity with a different semantic digest is idempotency_conflict and the commit is unchanged.'), 'sr_cor_conflict_refused', sr_cor_conflict),
        g.Guard('sr_cor_schema', g.Invariant('/sr_cor_schema', 'Every corruption commit validates against the complete closed corruption_commit schema.'), 'sr_cor_schema_refused', sr_cor_schema),
        g.Guard('sr_cor_time', g.Invariant('/sr_cor_time', 'Commit timestamps use shared date_time with the Storage UTC-Z profile.'), 'sr_cor_time_refused', sr_cor_time),
        g.Guard('sr_cor_numbers', g.Invariant('/sr_cor_numbers', 'Material lengths in commit evidence and appended payloads use shared current_integer with the exact 0..2^64-1 range.'), 'sr_cor_numbers_refused', sr_cor_numbers),
    ])

    def check(value):
        table.require('sr_cor_once', value, context)
        table.require('sr_cor_status', value, context)
        table.require('sr_cor_reader', value, context)
        table.require('sr_cor_receipt', value, context)
        table.require('sr_cor_conflict', value, context)
        table.require('sr_cor_schema', value, context)
        table.require('sr_cor_time', value, context)
        table.require('sr_cor_numbers', value, context)
        return True
    return g.Case(table, check, context)
