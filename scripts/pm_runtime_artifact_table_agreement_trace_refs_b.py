"""DR guard table agreement_trace_refs_b: CV-526/CV-537 current-writer copied source agreement, one row per copy site.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('trace_refs_body_usage_event_ref', 'trace_refs_body_usage_record_id', 'trace_refs_raw_payload_ref', 'trace_settlement_usage_event_ref', 'trace_settlement_usage_record_id')


def trace_refs_body_usage_event_ref(value, context):
    for pair in value['trace_refs_body_usage_event_ref']:
        if pair[0] != pair[1]:
            return 'trace_refs: source/copy disagreement'
    return None


def trace_refs_body_usage_record_id(value, context):
    for pair in value['trace_refs_body_usage_record_id']:
        if pair[0] != pair[1]:
            return 'trace_refs: source/copy disagreement'
    return None


def trace_refs_raw_payload_ref(value, context):
    for pair in value['trace_refs_raw_payload_ref']:
        if pair[0] != pair[1]:
            return 'trace_refs: source/copy disagreement'
    return None


def trace_settlement_usage_event_ref(value, context):
    for pair in value['trace_settlement_usage_event_ref']:
        if pair[0] != pair[1]:
            return 'trace_settlement: source/copy disagreement'
    return None


def trace_settlement_usage_record_id(value, context):
    for pair in value['trace_settlement_usage_record_id']:
        if pair[0] != pair[1]:
            return 'trace_settlement: source/copy disagreement'
    return None


def trace_refs_b_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('trace_refs_body_usage_event_ref', g.Invariant('/trace_refs_body_usage_event_ref', 'refs.usage_event_ref equals the body value'), 'trace_refs: source/copy disagreement', trace_refs_body_usage_event_ref),
        g.Guard('trace_refs_body_usage_record_id', g.Invariant('/trace_refs_body_usage_record_id', 'refs.usage_record_id equals the body value'), 'trace_refs: source/copy disagreement', trace_refs_body_usage_record_id),
        g.Guard('trace_refs_raw_payload_ref', g.Invariant('/trace_refs_raw_payload_ref', 'refs.raw_payload_ref equals raw_payload.raw_payload_ref'), 'trace_refs: source/copy disagreement', trace_refs_raw_payload_ref),
        g.Guard('trace_settlement_usage_event_ref', g.Invariant('/trace_settlement_usage_event_ref', 'settlement usage_event_ref equals the body value'), 'trace_settlement: source/copy disagreement', trace_settlement_usage_event_ref),
        g.Guard('trace_settlement_usage_record_id', g.Invariant('/trace_settlement_usage_record_id', 'settlement usage_record_id equals the body value'), 'trace_settlement: source/copy disagreement', trace_settlement_usage_record_id),
    ])

    def check(value):
        table.require('trace_refs_body_usage_event_ref', value, context)
        table.require('trace_refs_body_usage_record_id', value, context)
        table.require('trace_refs_raw_payload_ref', value, context)
        table.require('trace_settlement_usage_event_ref', value, context)
        table.require('trace_settlement_usage_record_id', value, context)
        return True
    return g.Case(table, check, context)
