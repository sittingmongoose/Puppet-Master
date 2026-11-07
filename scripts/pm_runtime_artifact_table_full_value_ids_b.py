"""DR guard table full_value_ids_b: SP-286/CV-339 complete-value retry and retained-original joins.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('receipt_sequence_code', 'candidate_sequence_code', 'result_segment_ref', 'custody_segment_ref', 'expected_commitment', 'custody_commitment', 'result_commitment', 'expected_semantic_digest', 'custody_semantic_digest')


def F06_receipt_sequence(value, context):
    return 'full_value_mismatch' if value['receipt_sequence_code'] != value['candidate_sequence_code'] else None


def F07_segment_ref(value, context):
    return 'full_value_mismatch' if value['result_segment_ref'] != value['custody_segment_ref'] else None


def F08a_custody_commitment(value, context):
    return 'full_value_mismatch' if value['expected_commitment'] != value['custody_commitment'] else None


def F08b_result_commitment(value, context):
    return 'full_value_mismatch' if value['custody_commitment'] != value['result_commitment'] else None


def F09_semantic_digest(value, context):
    return 'full_value_mismatch' if value['expected_semantic_digest'] != value['custody_semantic_digest'] else None


def ids_b_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('F06_receipt_sequence', g.Invariant('/receipt_sequence_code', 'receipt sequence_id bytes equal the candidate sequence_id bytes'), 'full_value_mismatch', F06_receipt_sequence),
        g.Guard('F07_segment_ref', g.Invariant('/result_segment_ref', 'equals the custody original_segment_ref'), 'full_value_mismatch', F07_segment_ref),
        g.Guard('F08a_custody_commitment', g.Invariant('/custody_commitment', 'equals the recomputed original event value commitment'), 'full_value_mismatch', F08a_custody_commitment),
        g.Guard('F08b_result_commitment', g.Invariant('/result_commitment', 'equals the custody commitment'), 'full_value_mismatch', F08b_result_commitment),
        g.Guard('F09_semantic_digest', g.Invariant('/custody_semantic_digest', 'equals the recomputed producer semantic digest'), 'full_value_mismatch', F09_semantic_digest),
    ])

    def check(value):
        table.require('F06_receipt_sequence', value, context)
        table.require('F07_segment_ref', value, context)
        table.require('F08a_custody_commitment', value, context)
        table.require('F08b_result_commitment', value, context)
        table.require('F09_semantic_digest', value, context)
        return True
    return g.Case(table, check, context)
