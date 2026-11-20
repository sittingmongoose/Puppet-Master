"""DR guard table agreement_trace_refs_a: CV-526/CV-537 current-writer copied source agreement, one row per copy site.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('trace_refs_root_provider_attempt_ref', 'trace_refs_root_usage_event_ref', 'trace_refs_root_usage_record_id', 'trace_refs_root_receipt_refs', 'trace_refs_body_provider_attempt_ref')


def trace_refs_root_provider_attempt_ref(value, context):
    for pair in value['trace_refs_root_provider_attempt_ref']:
        if pair[0] != pair[1]:
            return 'trace_refs: source/copy disagreement'
    return None


def trace_refs_root_usage_event_ref(value, context):
    for pair in value['trace_refs_root_usage_event_ref']:
        if pair[0] != pair[1]:
            return 'trace_refs: source/copy disagreement'
    return None


def trace_refs_root_usage_record_id(value, context):
    for pair in value['trace_refs_root_usage_record_id']:
        if pair[0] != pair[1]:
            return 'trace_refs: source/copy disagreement'
    return None


def trace_refs_root_receipt_refs(value, context):
    for pair in value['trace_refs_root_receipt_refs']:
        if pair[0] != pair[1]:
            return 'trace_refs: source/copy disagreement'
    return None


def trace_refs_body_provider_attempt_ref(value, context):
    for pair in value['trace_refs_body_provider_attempt_ref']:
        if pair[0] != pair[1]:
            return 'trace_refs: source/copy disagreement'
    return None


def trace_refs_a_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('trace_refs_root_provider_attempt_ref', g.Invariant('/trace_refs_root_provider_attempt_ref', 'a root provider_attempt_ref copy equals refs.provider_attempt_ref'), 'trace_refs: source/copy disagreement', trace_refs_root_provider_attempt_ref),
        g.Guard('trace_refs_root_usage_event_ref', g.Invariant('/trace_refs_root_usage_event_ref', 'a root usage_event_ref copy equals refs.usage_event_ref'), 'trace_refs: source/copy disagreement', trace_refs_root_usage_event_ref),
        g.Guard('trace_refs_root_usage_record_id', g.Invariant('/trace_refs_root_usage_record_id', 'a root usage_record_id copy equals refs.usage_record_id'), 'trace_refs: source/copy disagreement', trace_refs_root_usage_record_id),
        g.Guard('trace_refs_root_receipt_refs', g.Invariant('/trace_refs_root_receipt_refs', 'a root receipt_refs copy equals refs.receipt_refs'), 'trace_refs: source/copy disagreement', trace_refs_root_receipt_refs),
        g.Guard('trace_refs_body_provider_attempt_ref', g.Invariant('/trace_refs_body_provider_attempt_ref', 'refs.provider_attempt_ref equals the body value'), 'trace_refs: source/copy disagreement', trace_refs_body_provider_attempt_ref),
    ])

    def check(value):
        table.require('trace_refs_root_provider_attempt_ref', value, context)
        table.require('trace_refs_root_usage_event_ref', value, context)
        table.require('trace_refs_root_usage_record_id', value, context)
        table.require('trace_refs_root_receipt_refs', value, context)
        table.require('trace_refs_body_provider_attempt_ref', value, context)
        return True
    return g.Case(table, check, context)
