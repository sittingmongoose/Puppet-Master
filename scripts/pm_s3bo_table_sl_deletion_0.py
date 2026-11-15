"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sl_del_decision(value, context):
    record = value['sl_del_decision']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_del_decision_refused'
    return None

def sl_del_zero(value, context):
    record = value['sl_del_zero']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_del_zero_refused'
    return None

def sl_del_record(value, context):
    record = value['sl_del_record']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_del_record_refused'
    return None

def sl_del_order(value, context):
    record = value['sl_del_order']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_del_order_refused'
    return None

def sl_del_effects(value, context):
    record = value['sl_del_effects']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_del_effects_refused'
    return None

def sl_del_payload(value, context):
    record = value['sl_del_payload']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_del_payload_refused'
    return None

def sl_del_identity(value, context):
    record = value['sl_del_identity']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_del_identity_refused'
    return None

def sl_del_envelope(value, context):
    record = value['sl_del_envelope']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_del_envelope_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sl_del_decision', g.Invariant('/sl_del_decision', 'Each coordinator step is admitted or refused at the first failing stage of the fixed admission order: edge and payload conditional, durable record state, scope and reachability, holds, tombstone and hide, writer and maintenance authority, verified committed successor generation.'), 'sl_del_decision_refused', sl_del_decision),
        g.Guard('sl_del_zero', g.Invariant('/sl_del_zero', 'A refused step appends nothing and leaves the record, projections, checkpoints, purge/compaction dispatch and holds unchanged.'), 'sl_del_zero_refused', sl_del_zero),
        g.Guard('sl_del_record', g.Invariant('/sl_del_record', 'An admitted step CASes the record to the new state, appends the event to event_refs and records the current blockers, hide receipt and generation.'), 'sl_del_record_refused', sl_del_record),
        g.Guard('sl_del_order', g.Invariant('/sl_del_order', 'Admission, record CAS with the frozen obligation, barrier append and first receipt precede the dependent effect and the command result.'), 'sl_del_order_refused', sl_del_order),
        g.Guard('sl_del_effects', g.Invariant('/sl_del_effects', 'The dependent effect is exactly projection hide for logically_hidden and purge dispatch for purge_pending; no step clears a hold.'), 'sl_del_effects_refused', sl_del_effects),
        g.Guard('sl_del_payload', g.Invariant('/sl_del_payload', 'The payload carries the state, current blockers, deadline, tombstone, scope ref, generation only for purge states and failure reason only for failed.'), 'sl_del_payload_refused', sl_del_payload),
        g.Guard('sl_del_identity', g.Invariant('/sl_del_identity', 'Each event id and key follows the SP-2200 recipe over deletion_id and the 1-based event_refs ordinal.'), 'sl_del_identity_refused', sl_del_identity),
        g.Guard('sl_del_envelope', g.Invariant('/sl_del_envelope', 'A thread deletion names the deleted thread, Project-data deletion has null thread; Project id null exactly when the payload omits it; run and attempt null.'), 'sl_del_envelope_refused', sl_del_envelope),
    ])

    def check(value):
        table.require('sl_del_decision', value, context)
        table.require('sl_del_zero', value, context)
        table.require('sl_del_record', value, context)
        table.require('sl_del_order', value, context)
        table.require('sl_del_effects', value, context)
        table.require('sl_del_payload', value, context)
        table.require('sl_del_identity', value, context)
        table.require('sl_del_envelope', value, context)
        return True
    return g.Case(table, check, context)
