"""DR guard table full_value_ids_a: SP-286/CV-339 complete-value retry and retained-original joins.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('receipt_event_id', 'candidate_event_id', 'custody_event_id', 'custody_scope_partition', 'expected_scope_partition', 'custody_event_type', 'candidate_event_type', 'custody_idempotency_key', 'candidate_idempotency_key')


def F11a_receipt_event(value, context):
    return 'full_value_mismatch' if value['receipt_event_id'] != value['candidate_event_id'] else None


def F11b_custody_event(value, context):
    return 'full_value_mismatch' if value['candidate_event_id'] != value['custody_event_id'] else None


def F03_partition(value, context):
    return 'full_value_mismatch' if value['custody_scope_partition'] != value['expected_scope_partition'] else None


def F04_custody_family(value, context):
    return 'full_value_mismatch' if value['custody_event_type'] != value['candidate_event_type'] else None


def F05_custody_key(value, context):
    return 'full_value_mismatch' if value['custody_idempotency_key'] != value['candidate_idempotency_key'] else None


def ids_a_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('F11a_receipt_event', g.Invariant('/receipt_event_id', 'equals the candidate event_id'), 'full_value_mismatch', F11a_receipt_event),
        g.Guard('F11b_custody_event', g.Invariant('/custody_event_id', 'equals the candidate event_id'), 'full_value_mismatch', F11b_custody_event),
        g.Guard('F03_partition', g.Invariant('/custody_scope_partition', 'equals the encoded project~ partition of the candidate project'), 'full_value_mismatch', F03_partition),
        g.Guard('F04_custody_family', g.Invariant('/custody_event_type', 'equals the candidate event_type'), 'full_value_mismatch', F04_custody_family),
        g.Guard('F05_custody_key', g.Invariant('/custody_idempotency_key', 'equals the candidate idempotency_key'), 'full_value_mismatch', F05_custody_key),
    ])

    def check(value):
        table.require('F11a_receipt_event', value, context)
        table.require('F11b_custody_event', value, context)
        table.require('F03_partition', value, context)
        table.require('F04_custody_family', value, context)
        table.require('F05_custody_key', value, context)
        return True
    return g.Case(table, check, context)
