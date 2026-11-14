"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def resolution_commitment(value, context):
    record = value['resolution_commitment']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'resolution_commitment_refused'
    return None

def resolution_barrier(value, context):
    record = value['resolution_barrier']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'resolution_barrier_refused'
    return None

def resolution_receipt_schema(value, context):
    record = value['resolution_receipt_schema']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'resolution_receipt_schema_refused'
    return None

def resolution_numbers(value, context):
    record = value['resolution_numbers']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'resolution_numbers_refused'
    return None

def resolution_time(value, context):
    record = value['resolution_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'resolution_time_refused'
    return None

def resolution_effect_event(value, context):
    record = value['resolution_effect_event']
    if record['applies'] is not True:
        return None
    if record['left'] not in record['right']:
        return 'resolution_effect_event_refused'
    return None

def resolution_effect_state(value, context):
    record = value['resolution_effect_state']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'resolution_effect_state_refused'
    return None

def resolution_effect_input(value, context):
    record = value['resolution_effect_input']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'resolution_effect_input_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('resolution_commitment', g.Invariant('/resolution_commitment', 'The resolution full-value commitment binds the complete original event.'), 'resolution_commitment_refused', resolution_commitment),
        g.Guard('resolution_barrier', g.Invariant('/resolution_barrier', 'The resolution first receipt is barrier-class.'), 'resolution_barrier_refused', resolution_barrier),
        g.Guard('resolution_receipt_schema', g.Invariant('/resolution_receipt_schema', 'The complete resolution first receipt keeps every CV-339 schema keyword.'), 'resolution_receipt_schema_refused', resolution_receipt_schema),
        g.Guard('resolution_numbers', g.Invariant('/resolution_numbers', 'Every resolution receipt Storage integer uses shared storage_uint64.'), 'resolution_numbers_refused', resolution_numbers),
        g.Guard('resolution_time', g.Invariant('/resolution_time', 'Resolution first-receipt acknowledgement uses the EventRecord date-time profile.'), 'resolution_time_refused', resolution_time),
        g.Guard('resolution_effect_event', g.Invariant('/resolution_effect_event', 'The original resolution transition receipt names this event.'), 'resolution_effect_event_refused', resolution_effect_event),
        g.Guard('resolution_effect_state', g.Invariant('/resolution_effect_state', 'The original dependent-effect transition has the resolution event state.'), 'resolution_effect_state_refused', resolution_effect_state),
        g.Guard('resolution_effect_input', g.Invariant('/resolution_effect_input', 'The dependent-effect transition binds the original quarantined raw hash.'), 'resolution_effect_input_refused', resolution_effect_input),
    ])

    def check(value):
        table.require('resolution_commitment', value, context)
        table.require('resolution_barrier', value, context)
        table.require('resolution_receipt_schema', value, context)
        table.require('resolution_numbers', value, context)
        table.require('resolution_time', value, context)
        table.require('resolution_effect_event', value, context)
        table.require('resolution_effect_state', value, context)
        table.require('resolution_effect_input', value, context)
        return True
    return g.Case(table, check, context)
