"""DR guard table full_value_bytes: SP-286/CV-339 complete-value retry and retained-original joins.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('candidate_sha256', 'stored_sha256', 'result_sha256', 'original_result_sha256', 'custody_sha256', 'original_custody_sha256', 'receipt_sha256', 'custody_receipt_sha256')


def F02_candidate_bytes(value, context):
    return 'full_value_mismatch' if value['candidate_sha256'] != value['stored_sha256'] else None


def F12_result_bytes(value, context):
    return 'full_value_mismatch' if value['result_sha256'] != value['original_result_sha256'] else None


def F13_custody_bytes(value, context):
    return 'full_value_mismatch' if value['custody_sha256'] != value['original_custody_sha256'] else None


def F10_receipt_copy(value, context):
    return 'full_value_mismatch' if value['receipt_sha256'] != value['custody_receipt_sha256'] else None


def bytes_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('F02_candidate_bytes', g.Invariant('/candidate_sha256', 'candidate canonical bytes equal the stored original event bytes'), 'full_value_mismatch', F02_candidate_bytes),
        g.Guard('F12_result_bytes', g.Invariant('/result_sha256', 'supplied result bytes equal the original result bytes'), 'full_value_mismatch', F12_result_bytes),
        g.Guard('F13_custody_bytes', g.Invariant('/custody_sha256', 'supplied custody bytes equal the original custody bytes'), 'full_value_mismatch', F13_custody_bytes),
        g.Guard('F10_receipt_copy', g.Invariant('/receipt_sha256', 'result first receipt bytes equal the custody first receipt bytes'), 'full_value_mismatch', F10_receipt_copy),
    ])

    def check(value):
        table.require('F02_candidate_bytes', value, context)
        table.require('F12_result_bytes', value, context)
        table.require('F13_custody_bytes', value, context)
        table.require('F10_receipt_copy', value, context)
        return True
    return g.Case(table, check, context)
