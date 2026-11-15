"""DG6A guard table current_context__2: the original commit/result/receipt refs and retry body (CC09-CC11).

The second bounded part of the current_context phase of
scripts/pm-card5-event-contracts-check.py::current_errors (C12-DG6A, PNC-019
quality bar: at most eight rows per gated table). CC01-CC08 are in
pm_dg6a_table_current_context.py; the checker evaluates that module's rows and
then these, in declared order, over the same observation, collecting every
refusing row's code exactly as before. Predicates never recompute, repair or
call helpers.
"""
import pm_guard_isolation as g

FIELDS = ('result_ref_exact', 'dispatch_receipt_ref_exact', 'retry_body_exact')


def CC09_original_result_ref(value, context):
    return 'original_result_ref' if value['result_ref_exact'] is not True else None

def CC10_original_dispatch_receipt_ref(value, context):
    return 'original_dispatch_receipt_ref' if value['dispatch_receipt_ref_exact'] is not True else None

def CC11_retry_body(value, context):
    return 'idempotency_conflict' if value['retry_body_exact'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('CC09_original_result_ref', g.Invariant('/result_ref_exact', 'context commit_refs result_ref exactly equals the operation ref'), 'original_result_ref', CC09_original_result_ref),
        g.Guard('CC10_original_dispatch_receipt_ref', g.Invariant('/dispatch_receipt_ref_exact', 'context commit_refs dispatch_receipt_ref exactly equals the operation ref'), 'original_dispatch_receipt_ref', CC10_original_dispatch_receipt_ref),
        g.Guard('CC11_retry_body', g.Invariant('/retry_body_exact', 'context retry_body exactly equals the original command'), 'idempotency_conflict', CC11_retry_body),
    ])

    def check(value):
        table.require('CC09_original_result_ref', value, context)
        table.require('CC10_original_dispatch_receipt_ref', value, context)
        table.require('CC11_retry_body', value, context)
        return True
    return g.Case(table, check, context)
