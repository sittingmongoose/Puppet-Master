"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def quarantine_delete_image(value, context):
    record = value['quarantine_delete_image']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'quarantine_delete_image_refused'
    return None

def resolution_state(value, context):
    record = value['resolution_state']
    if record['applies'] is not True:
        return None
    if record['left'] not in record['right']:
        return 'resolution_state_refused'
    return None

def resolution_subject(value, context):
    record = value['resolution_subject']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'resolution_subject_refused'
    return None

def resolution_event_id(value, context):
    record = value['resolution_event_id']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'resolution_event_id_refused'
    return None

def resolution_key(value, context):
    record = value['resolution_key']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'resolution_key_refused'
    return None

def resolution_receipt_count(value, context):
    record = value['resolution_receipt_count']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'resolution_receipt_count_refused'
    return None

def resolution_receipt_event(value, context):
    record = value['resolution_receipt_event']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'resolution_receipt_event_refused'
    return None

def resolution_receipt_sequence(value, context):
    record = value['resolution_receipt_sequence']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'resolution_receipt_sequence_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('quarantine_delete_image', g.Invariant('/quarantine_delete_image', 'Deleted-scope raw bytes remain until resolution and while held; resolution without holds deletes them.'), 'quarantine_delete_image_refused', quarantine_delete_image),
        g.Guard('resolution_state', g.Invariant('/resolution_state', 'The canonical transition is a successful existing resolution state.'), 'resolution_state_refused', resolution_state),
        g.Guard('resolution_subject', g.Invariant('/resolution_subject', 'The resolution event belongs to this exact quarantined value.'), 'resolution_subject_refused', resolution_subject),
        g.Guard('resolution_event_id', g.Invariant('/resolution_event_id', 'The original resolution event ID follows the quarantine owner recipe.'), 'resolution_event_id_refused', resolution_event_id),
        g.Guard('resolution_key', g.Invariant('/resolution_key', 'The resolution idempotency key follows the quarantine owner recipe.'), 'resolution_key_refused', resolution_key),
        g.Guard('resolution_receipt_count', g.Invariant('/resolution_receipt_count', 'Exactly one independent original first receipt exists for the resolution event.'), 'resolution_receipt_count_refused', resolution_receipt_count),
        g.Guard('resolution_receipt_event', g.Invariant('/resolution_receipt_event', 'The first receipt names the exact resolution event.'), 'resolution_receipt_event_refused', resolution_receipt_event),
        g.Guard('resolution_receipt_sequence', g.Invariant('/resolution_receipt_sequence', 'The first receipt sequence joins the original resolution event sequence.'), 'resolution_receipt_sequence_refused', resolution_receipt_sequence),
    ])

    def check(value):
        table.require('quarantine_delete_image', value, context)
        table.require('resolution_state', value, context)
        table.require('resolution_subject', value, context)
        table.require('resolution_event_id', value, context)
        table.require('resolution_key', value, context)
        table.require('resolution_receipt_count', value, context)
        table.require('resolution_receipt_event', value, context)
        table.require('resolution_receipt_sequence', value, context)
        return True
    return g.Case(table, check, context)
