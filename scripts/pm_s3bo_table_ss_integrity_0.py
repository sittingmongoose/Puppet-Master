"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def ss_int_outcome(value, context):
    record = value['ss_int_outcome']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_int_outcome_refused'
    return None

def ss_int_events(value, context):
    record = value['ss_int_events']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_int_events_refused'
    return None

def ss_int_order(value, context):
    record = value['ss_int_order']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_int_order_refused'
    return None

def ss_int_effects(value, context):
    record = value['ss_int_effects']
    if record['applies'] is not True:
        return None
    if record['left'] != []:
        return 'ss_int_effects_refused'
    return None

def ss_int_codec(value, context):
    record = value['ss_int_codec']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_int_codec_refused'
    return None

def ss_int_finding(value, context):
    record = value['ss_int_finding']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_int_finding_refused'
    return None

def ss_int_identity(value, context):
    record = value['ss_int_identity']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_int_identity_refused'
    return None

def ss_int_payload(value, context):
    record = value['ss_int_payload']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_int_payload_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('ss_int_outcome', g.Invariant('/ss_int_outcome', 'Each detection ends exactly as SP-279 decides: appended, replayed, pending, conflict, blocked or refused.'), 'ss_int_outcome_refused', ss_int_outcome),
        g.Guard('ss_int_events', g.Invariant('/ss_int_events', 'A detection appends at most one EventRecord, once; refusal, pending, replay and resumption after the append add none.'), 'ss_int_events_refused', ss_int_events),
        g.Guard('ss_int_order', g.Invariant('/ss_int_order', 'Revalidate, durable finding write/sync/promote/readback, projection qualification, barrier append, first receipt, then release.'), 'ss_int_order_refused', ss_int_order),
        g.Guard('ss_int_effects', g.Invariant('/ss_int_effects', 'Detection never truncates, seals, excludes, repairs, rebuilds, clears a block or advances a checkpoint.'), 'ss_int_effects_refused', ss_int_effects),
        g.Guard('ss_int_codec', g.Invariant('/ss_int_codec', 'The durable finding is exact canonical_uint_json.v1 bytes that decode only to their own re-encoding.'), 'ss_int_codec_refused', ss_int_codec),
        g.Guard('ss_int_finding', g.Invariant('/ss_int_finding', 'The finding records the admitted input, the owner validator witness and the first actor and time; a retry returns the original bytes.'), 'ss_int_finding_refused', ss_int_finding),
        g.Guard('ss_int_identity', g.Invariant('/ss_int_identity', 'input_sha256, integrity_id, event_id, idempotency_key and report_ref follow SP-279 exactly.'), 'ss_int_identity_refused', ss_int_identity),
        g.Guard('ss_int_payload', g.Invariant('/ss_int_payload', 'The payload is exactly the finding input projection, with absent optional fields left absent.'), 'ss_int_payload_refused', ss_int_payload),
    ])

    def check(value):
        table.require('ss_int_outcome', value, context)
        table.require('ss_int_events', value, context)
        table.require('ss_int_order', value, context)
        table.require('ss_int_effects', value, context)
        table.require('ss_int_codec', value, context)
        table.require('ss_int_finding', value, context)
        table.require('ss_int_identity', value, context)
        table.require('ss_int_payload', value, context)
        return True
    return g.Case(table, check, context)
