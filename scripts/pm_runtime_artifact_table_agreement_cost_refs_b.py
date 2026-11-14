"""DR guard table agreement_cost_refs_b: CV-526/CV-537 current-writer copied source agreement, one row per copy site.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('usage_refs_run_id', 'usage_refs_attempt_id', 'usage_refs_thread_id', 'usage_refs_node_id', 'usage_refs_raw_payload_ref')


def usage_refs_run_id(value, context):
    for pair in value['usage_refs_run_id']:
        if pair[0] != pair[1]:
            return 'usage_refs: source/copy disagreement'
    return None


def usage_refs_attempt_id(value, context):
    for pair in value['usage_refs_attempt_id']:
        if pair[0] != pair[1]:
            return 'usage_refs: source/copy disagreement'
    return None


def usage_refs_thread_id(value, context):
    for pair in value['usage_refs_thread_id']:
        if pair[0] != pair[1]:
            return 'usage_refs: source/copy disagreement'
    return None


def usage_refs_node_id(value, context):
    for pair in value['usage_refs_node_id']:
        if pair[0] != pair[1]:
            return 'usage_refs: source/copy disagreement'
    return None


def usage_refs_raw_payload_ref(value, context):
    for pair in value['usage_refs_raw_payload_ref']:
        if pair[0] != pair[1]:
            return 'usage_refs: source/copy disagreement'
    return None


def cost_refs_b_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('usage_refs_run_id', g.Invariant('/usage_refs_run_id', 'refs.run_id equals the payload run_id'), 'usage_refs: source/copy disagreement', usage_refs_run_id),
        g.Guard('usage_refs_attempt_id', g.Invariant('/usage_refs_attempt_id', 'refs.attempt_id equals the payload attempt_id'), 'usage_refs: source/copy disagreement', usage_refs_attempt_id),
        g.Guard('usage_refs_thread_id', g.Invariant('/usage_refs_thread_id', 'refs.thread_id equals the payload thread_id'), 'usage_refs: source/copy disagreement', usage_refs_thread_id),
        g.Guard('usage_refs_node_id', g.Invariant('/usage_refs_node_id', 'refs.node_id equals the payload node_id'), 'usage_refs: source/copy disagreement', usage_refs_node_id),
        g.Guard('usage_refs_raw_payload_ref', g.Invariant('/usage_refs_raw_payload_ref', 'refs.raw_payload_ref equals the authority raw_payload_ref'), 'usage_refs: source/copy disagreement', usage_refs_raw_payload_ref),
    ])

    def check(value):
        table.require('usage_refs_run_id', value, context)
        table.require('usage_refs_attempt_id', value, context)
        table.require('usage_refs_thread_id', value, context)
        table.require('usage_refs_node_id', value, context)
        table.require('usage_refs_raw_payload_ref', value, context)
        return True
    return g.Case(table, check, context)
