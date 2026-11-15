"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def ss_seg_obligation(value, context):
    record = value['ss_seg_obligation']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_seg_obligation_refused'
    return None

def ss_seg_events(value, context):
    record = value['ss_seg_events']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_seg_events_refused'
    return None

def ss_seg_order(value, context):
    record = value['ss_seg_order']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_seg_order_refused'
    return None

def ss_seg_identity(value, context):
    record = value['ss_seg_identity']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_seg_identity_refused'
    return None

def ss_seg_payload(value, context):
    record = value['ss_seg_payload']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_seg_payload_refused'
    return None

def ss_seg_envelope(value, context):
    record = value['ss_seg_envelope']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_seg_envelope_refused'
    return None

def ss_seg_original(value, context):
    record = value['ss_seg_original']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_seg_original_refused'
    return None

def ss_seg_retry(value, context):
    record = value['ss_seg_retry']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_seg_retry_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('ss_seg_obligation', g.Invariant('/ss_seg_obligation', 'Each original is emitted, skipped for its exact SP-270 reason, left pending, replayed or refused as SP-270 decides.'), 'ss_seg_obligation_refused', ss_seg_obligation),
        g.Guard('ss_seg_events', g.Invariant('/ss_seg_events', 'Exactly one metadata append per emitted native original; skips, pending, replay and refusals append none.'), 'ss_seg_events_refused', ss_seg_events),
        g.Guard('ss_seg_order', g.Invariant('/ss_seg_order', 'Original frame and watermark, metadata admission, append and receipt, then canonical prefix, then disposable checkpoint.'), 'ss_seg_order_refused', ss_seg_order),
        g.Guard('ss_seg_identity', g.Invariant('/ss_seg_identity', 'event_id and idempotency_key use SHA-256 of RFC 8785 [storage_instance_id, original.event_id].'), 'ss_seg_identity_refused', ss_seg_identity),
        g.Guard('ss_seg_payload', g.Invariant('/ss_seg_payload', 'The payload maps seq, type, event_ref, the original segment ref and the original persisted time, with no writer_id.'), 'ss_seg_payload_refused', ss_seg_payload),
        g.Guard('ss_seg_envelope', g.Invariant('/ss_seg_envelope', 'The envelope inherits scope, binds the observer actor and original lineage, and its sequence is strictly later.'), 'ss_seg_envelope_refused', ss_seg_envelope),
        g.Guard('ss_seg_original', g.Invariant('/ss_seg_original', 'The original result and receipt are never rewritten or replaced by metadata, whatever observability does.'), 'ss_seg_original_refused', ss_seg_original),
        g.Guard('ss_seg_retry', g.Invariant('/ss_seg_retry', 'Same identity and digest returns the original result; a conflicting digest or unavailable authority refuses.'), 'ss_seg_retry_refused', ss_seg_retry),
    ])

    def check(value):
        table.require('ss_seg_obligation', value, context)
        table.require('ss_seg_events', value, context)
        table.require('ss_seg_order', value, context)
        table.require('ss_seg_identity', value, context)
        table.require('ss_seg_payload', value, context)
        table.require('ss_seg_envelope', value, context)
        table.require('ss_seg_original', value, context)
        table.require('ss_seg_retry', value, context)
        return True
    return g.Case(table, check, context)
