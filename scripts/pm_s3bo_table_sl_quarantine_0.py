"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sl_qtn_detect(value, context):
    record = value['sl_qtn_detect']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_qtn_detect_refused'
    return None

def sl_qtn_decision(value, context):
    record = value['sl_qtn_decision']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_qtn_decision_refused'
    return None

def sl_qtn_zero(value, context):
    record = value['sl_qtn_zero']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_qtn_zero_refused'
    return None

def sl_qtn_record(value, context):
    record = value['sl_qtn_record']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_qtn_record_refused'
    return None

def sl_qtn_order(value, context):
    record = value['sl_qtn_order']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_qtn_order_refused'
    return None

def sl_qtn_effects(value, context):
    record = value['sl_qtn_effects']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_qtn_effects_refused'
    return None

def sl_qtn_payload(value, context):
    record = value['sl_qtn_payload']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_qtn_payload_refused'
    return None

def sl_qtn_identity(value, context):
    record = value['sl_qtn_identity']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_qtn_identity_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sl_qtn_detect', g.Invariant('/sl_qtn_detect', 'Detection mints the qtn_ identity with occurrence one plus the matching purged records; a re-detection of an open record resolves to it and mints nothing.'), 'sl_qtn_detect_refused', sl_qtn_detect),
        g.Guard('sl_qtn_decision', g.Invariant('/sl_qtn_decision', 'Each transition is admitted or refused at the first failing stage: closed edge and risk-class state, durable record state, synchronized raw custody, the outcome evidence, the Q policy cleanup clock, holds, then dependencies.'), 'sl_qtn_decision_refused', sl_qtn_decision),
        g.Guard('sl_qtn_zero', g.Invariant('/sl_qtn_zero', 'A refused transition appends nothing and leaves the record, the live key and the raw custody unchanged.'), 'sl_qtn_zero_refused', sl_qtn_zero),
        g.Guard('sl_qtn_record', g.Invariant('/sl_qtn_record', 'An admitted transition CASes the record state and appends its transition receipt continuing from detected, with the resolution output bound to the resolved bytes, and stores the frozen obligation in the row-local closed event_obligation: owner identity, payload and envelope, and the producer fields the append sends.'), 'sl_qtn_record_refused', sl_qtn_record),
        g.Guard('sl_qtn_order', g.Invariant('/sl_qtn_order', 'Raw bytes and the manifest are synchronized before the record CAS; CAS, barrier append and first receipt precede the live-key effect or disposal.'), 'sl_qtn_order_refused', sl_qtn_order),
        g.Guard('sl_qtn_effects', g.Invariant('/sl_qtn_effects', 'The live-key effect is exactly that of the resolution; purged disposes the raw content once; securing and recovery_blocked touch nothing.'), 'sl_qtn_effects_refused', sl_qtn_effects),
        g.Guard('sl_qtn_payload', g.Invariant('/sl_qtn_payload', 'The payload carries the record identity, source ref, schemas, raw custody hash and ref, risk class, state and transition receipt.'), 'sl_qtn_payload_refused', sl_qtn_payload),
        g.Guard('sl_qtn_identity', g.Invariant('/sl_qtn_identity', 'Each event id and key follows the SP-2201 recipe over quarantine_id and the state.'), 'sl_qtn_identity_refused', sl_qtn_identity),
    ])

    def check(value):
        table.require('sl_qtn_detect', value, context)
        table.require('sl_qtn_decision', value, context)
        table.require('sl_qtn_zero', value, context)
        table.require('sl_qtn_record', value, context)
        table.require('sl_qtn_order', value, context)
        table.require('sl_qtn_effects', value, context)
        table.require('sl_qtn_payload', value, context)
        table.require('sl_qtn_identity', value, context)
        return True
    return g.Case(table, check, context)
