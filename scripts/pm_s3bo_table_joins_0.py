"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def pending_copy(value, context):
    record = value['pending_copy']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'pending_copy_refused'
    return None

def receipt_event(value, context):
    record = value['receipt_event']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'receipt_event_refused'
    return None

def receipt_sequence(value, context):
    record = value['receipt_sequence']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'receipt_sequence_refused'
    return None

def receipt_full_value(value, context):
    record = value['receipt_full_value']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'receipt_full_value_refused'
    return None

def history_copy(value, context):
    record = value['history_copy']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'history_copy_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('pending_copy', g.Invariant('/pending_copy', 'Frozen pending event equals its independently held stored EventRecord.'), 'pending_copy_refused', pending_copy),
        g.Guard('receipt_event', g.Invariant('/receipt_event', 'First receipt event ID joins the independently held stored EventRecord.'), 'receipt_event_refused', receipt_event),
        g.Guard('receipt_sequence', g.Invariant('/receipt_sequence', 'First receipt sequence joins the independently held stored EventRecord.'), 'receipt_sequence_refused', receipt_sequence),
        g.Guard('receipt_full_value', g.Invariant('/receipt_full_value', 'First receipt full-value hash commits complete Storage event bytes.'), 'receipt_full_value_refused', receipt_full_value),
        g.Guard('history_copy', g.Invariant('/history_copy', 'History contains the original stored event, not a substituted copy.'), 'history_copy_refused', history_copy),
    ])

    def check(value):
        table.require('pending_copy', value, context)
        table.require('receipt_event', value, context)
        table.require('receipt_sequence', value, context)
        table.require('receipt_full_value', value, context)
        table.require('history_copy', value, context)
        return True
    return g.Case(table, check, context)
