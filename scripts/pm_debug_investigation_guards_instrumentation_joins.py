"""DDBG guard table: Instrumentation source joins: the payload and the referenced detail agree with the original source record (DL-429).

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import CLEANUP_RESULTS, INSTR_STATES


def instr_join_payload_instrumentation(value, context):
    if type(value.get('payload')) is not dict or type(value.get('instrumentation_source')) is not dict:
        return None
    payload = value['payload']
    source = value['instrumentation_source']
    left, right = payload.get('instrumentation_id'), source.get('instrumentation_id')
    if type(left) is not str or type(right) is not str or not 0 < len(left) <= 256 or not 0 < len(right) <= 256:
        return None
    return 'instrumentation_source_mismatch' if left != right else None


def instr_join_payload_scope(value, context):
    if type(value.get('payload')) is not dict or type(value.get('instrumentation_source')) is not dict:
        return None
    payload = value['payload']
    source = value['instrumentation_source']
    left, right = payload.get('scope_kind'), source.get('scope_kind')
    if type(left) is not str or type(right) is not str or not 0 < len(right) <= 256:
        return None
    return 'instrumentation_source_mismatch' if left != right else None


def instr_join_previous_state(value, context):
    if type(value.get('payload')) is not dict or type(value.get('instrumentation_source')) is not dict:
        return None
    payload = value['payload']
    source = value['instrumentation_source']
    left, right = payload.get('previous_state'), source.get('state')
    if left not in INSTR_STATES or right not in INSTR_STATES:
        return None
    return 'instrumentation_source_mismatch' if left != right else None


def instr_join_previous_result(value, context):
    if type(value.get('payload')) is not dict or type(value.get('instrumentation_source')) is not dict:
        return None
    payload = value['payload']
    source = value['instrumentation_source']
    left, right = payload.get('previous_rollback_state'), source.get('cleanup_result')
    if left not in CLEANUP_RESULTS or right not in CLEANUP_RESULTS:
        return None
    return 'instrumentation_source_mismatch' if left != right else None


def instr_join_detail_instrumentation(value, context):
    if type(value.get('instrumentation_source')) is not dict:
        return None
    detail = context['detail']
    source = value['instrumentation_source']
    if type(detail) is not dict:
        return None
    left, right = detail.get('instrumentation_id'), source.get('instrumentation_id')
    if type(left) is not str or type(right) is not str or not 0 < len(left) <= 256 or not 0 < len(right) <= 256:
        return None
    return 'instrumentation_source_mismatch' if left != right else None


def instr_join_detail_operation(value, context):
    if type(value.get('payload')) is not dict:
        return None
    detail = context['detail']
    payload = value['payload']
    if type(detail) is not dict:
        return None
    left, right = detail.get('operation_id'), payload.get('operation_id')
    if type(left) is not str or type(right) is not str or not 0 < len(left) <= 256 or not 0 < len(right) <= 256:
        return None
    return 'instrumentation_source_mismatch' if left != right else None


def instr_join_detail_target(value, context):
    if type(value.get('instrumentation_source')) is not dict:
        return None
    detail = context['detail']
    source = value['instrumentation_source']
    if type(detail) is not dict:
        return None
    left, right = detail.get('target_ref'), source.get('target_ref')
    if type(left) is not str or type(right) is not str or not 0 < len(left) <= 256 or not 0 < len(right) <= 256:
        return None
    return 'instrumentation_source_mismatch' if left != right else None


def instr_join_detail_owner(value, context):
    if type(value.get('instrumentation_source')) is not dict:
        return None
    detail = context['detail']
    source = value['instrumentation_source']
    if type(detail) is not dict:
        return None
    left, right = detail.get('previous_owner_ref'), source.get('owner_ref')
    if type(left) is not str or type(right) is not str or not 0 < len(left) <= 256 or not 0 < len(right) <= 256:
        return None
    return 'instrumentation_source_mismatch' if left != right else None


def instr_join_detail_retry_count(value, context):
    if type(value.get('instrumentation_source')) is not dict:
        return None
    detail = context['detail']
    source = value['instrumentation_source']
    if type(detail) is not dict:
        return None
    left, right = detail.get('retry_count_before'), source.get('retry_count')
    if type(left) is not int or type(right) is not int or not 0 <= left <= 2 or not 0 <= right <= 2:
        return None
    return 'instrumentation_source_mismatch' if left != right else None


def instr_join_detail_attempt_failed(value, context):
    if type(value.get('instrumentation_source')) is not dict:
        return None
    detail = context['detail']
    source = value['instrumentation_source']
    if type(detail) is not dict:
        return None
    left, right = detail.get('previous_attempt_failed'), source.get('previous_attempt_failed')
    if type(left) is not bool or type(right) is not bool:
        return None
    return 'instrumentation_source_mismatch' if left is not right else None


def instr_join_detail_handoff_pending(value, context):
    if type(value.get('instrumentation_source')) is not dict:
        return None
    detail = context['detail']
    source = value['instrumentation_source']
    if type(detail) is not dict:
        return None
    left, right = detail.get('handoff_pending'), source.get('handoff_pending')
    if type(left) is not bool or type(right) is not bool:
        return None
    return 'instrumentation_source_mismatch' if left is not right else None


def instrumentation_joins_case(case_value):
    payload, records = case_value.get('payload'), case_value.get('detail_records')
    ref = payload.get('detail_ref') if type(payload) is dict else None
    # Selection only: the record payload.detail_ref names, or None.
    detail = records.get(ref) if type(ref) is str and type(records) is dict else None
    context = {'detail': detail}
    table = g.GuardTable([
        g.Guard('instr.join_payload_instrumentation', g.Invariant('/payload/instrumentation_id', 'equals instrumentation_source.instrumentation_id'), 'instrumentation_source_mismatch', instr_join_payload_instrumentation),
        g.Guard('instr.join_payload_scope', g.Invariant('/payload/scope_kind', 'equals instrumentation_source.scope_kind'), 'instrumentation_source_mismatch', instr_join_payload_scope),
        g.Guard('instr.join_previous_state', g.Invariant('/payload/previous_state', 'equals instrumentation_source.state'), 'instrumentation_source_mismatch', instr_join_previous_state),
        g.Guard('instr.join_previous_result', g.Invariant('/payload/previous_rollback_state', 'equals instrumentation_source.cleanup_result'), 'instrumentation_source_mismatch', instr_join_previous_result),
        g.Guard('instr.join_detail_instrumentation', g.Invariant('/detail_records/<detail_ref>/instrumentation_id', 'equals instrumentation_source.instrumentation_id'), 'instrumentation_source_mismatch', instr_join_detail_instrumentation),
        g.Guard('instr.join_detail_operation', g.Invariant('/detail_records/<detail_ref>/operation_id', 'equals payload.operation_id'), 'instrumentation_source_mismatch', instr_join_detail_operation),
        g.Guard('instr.join_detail_target', g.Invariant('/detail_records/<detail_ref>/target_ref', 'equals instrumentation_source.target_ref'), 'instrumentation_source_mismatch', instr_join_detail_target),
        g.Guard('instr.join_detail_owner', g.Invariant('/detail_records/<detail_ref>/previous_owner_ref', 'equals instrumentation_source.owner_ref'), 'instrumentation_source_mismatch', instr_join_detail_owner),
        g.Guard('instr.join_detail_retry_count', g.Invariant('/detail_records/<detail_ref>/retry_count_before', 'equals instrumentation_source.retry_count'), 'instrumentation_source_mismatch', instr_join_detail_retry_count),
        g.Guard('instr.join_detail_attempt_failed', g.Invariant('/detail_records/<detail_ref>/previous_attempt_failed', 'equals instrumentation_source.previous_attempt_failed'), 'instrumentation_source_mismatch', instr_join_detail_attempt_failed),
        g.Guard('instr.join_detail_handoff_pending', g.Invariant('/detail_records/<detail_ref>/handoff_pending', 'equals instrumentation_source.handoff_pending'), 'instrumentation_source_mismatch', instr_join_detail_handoff_pending)])

    def check(value):
        table.require('instr.join_payload_instrumentation', value, context)
        table.require('instr.join_payload_scope', value, context)
        table.require('instr.join_previous_state', value, context)
        table.require('instr.join_previous_result', value, context)
        table.require('instr.join_detail_instrumentation', value, context)
        table.require('instr.join_detail_operation', value, context)
        table.require('instr.join_detail_target', value, context)
        table.require('instr.join_detail_owner', value, context)
        table.require('instr.join_detail_retry_count', value, context)
        table.require('instr.join_detail_attempt_failed', value, context)
        table.require('instr.join_detail_handoff_pending', value, context)
        return True
    return g.Case(table, check, context)
