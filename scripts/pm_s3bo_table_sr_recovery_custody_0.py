"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sr_sru_receipt_join(value, context):
    record = value['sr_sru_receipt_join']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_receipt_join_refused'
    return None

def sr_sru_receipt_schema(value, context):
    record = value['sr_sru_receipt_schema']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sr_sru_receipt_schema_refused'
    return None

def sr_sru_anchor_schema(value, context):
    record = value['sr_sru_anchor_schema']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sr_sru_anchor_schema_refused'
    return None

def sr_sru_numbers(value, context):
    record = value['sr_sru_numbers']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sr_sru_numbers_refused'
    return None

def sr_sru_time(value, context):
    record = value['sr_sru_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sr_sru_time_refused'
    return None

def sr_sru_ui(value, context):
    record = value['sr_sru_ui']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_ui_refused'
    return None

def sr_sru_stored(value, context):
    record = value['sr_sru_stored']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_sru_stored_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sr_sru_receipt_join', g.Invariant('/sr_sru_receipt_join', 'Each receipt binds the episode, anchor, command, key, request digest, actor and source or confirmation refs.'), 'sr_sru_receipt_join_refused', sr_sru_receipt_join),
        g.Guard('sr_sru_receipt_schema', g.Invariant('/sr_sru_receipt_schema', 'Every resolution receipt validates against the complete closed receipt schema, all allOf/oneOf branches intact.'), 'sr_sru_receipt_schema_refused', sr_sru_receipt_schema),
        g.Guard('sr_sru_anchor_schema', g.Invariant('/sr_sru_anchor_schema', 'Every anchor snapshot validates against the complete closed recovery_anchor_record schema.'), 'sr_sru_anchor_schema_refused', sr_sru_anchor_schema),
        g.Guard('sr_sru_numbers', g.Invariant('/sr_sru_numbers', 'Anchor and receipt blocked_sequence use shared current_integer with their owner minimum.'), 'sr_sru_numbers_refused', sr_sru_numbers),
        g.Guard('sr_sru_time', g.Invariant('/sr_sru_time', 'Receipt completed_at_utc uses shared date_time with the Storage UTC-Z profile.'), 'sr_sru_time_refused', sr_sru_time),
        g.Guard('sr_sru_ui', g.Invariant('/sr_sru_ui', 'The UI shows success only for an applied or replayed domain result with a committed receipt.'), 'sr_sru_ui_refused', sr_sru_ui),
        g.Guard('sr_sru_stored', g.Invariant('/sr_sru_stored', 'The establishing event of the default episode is the independently stored EventRecord.'), 'sr_sru_stored_refused', sr_sru_stored),
    ])

    def check(value):
        table.require('sr_sru_receipt_join', value, context)
        table.require('sr_sru_receipt_schema', value, context)
        table.require('sr_sru_anchor_schema', value, context)
        table.require('sr_sru_numbers', value, context)
        table.require('sr_sru_time', value, context)
        table.require('sr_sru_ui', value, context)
        table.require('sr_sru_stored', value, context)
        return True
    return g.Case(table, check, context)
