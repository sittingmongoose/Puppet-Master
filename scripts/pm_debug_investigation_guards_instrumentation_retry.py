"""DDBG guard table: Instrumentation transitions, part 3: receiving owner, retries, attempts and installation (DL-429).

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import (
    ATTEMPT_KINDS, RECEIVING, RETRY_CEILING, TRANSITION_KINDS)


def instr_receiving_accepted(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') not in RECEIVING:
        return None
    return 'receiving_owner_acceptance_required' if detail.get('owner_accepted') is False else None


def instr_retry_authorized(value, context):
    detail = context['detail']
    if type(detail) is not dict:
        return None
    kind, failed = detail.get('transition_kind'), detail.get('previous_attempt_failed')
    if not (kind == 'retry_begins' or kind == 'receiving_owner_begins' and failed is True):
        return None
    return 'retry_authorization_required' if detail.get('retry_authorized') is False else None


def instr_retry_ceiling(value, context):
    detail = context['detail']
    if type(detail) is not dict:
        return None
    kind, failed = detail.get('transition_kind'), detail.get('previous_attempt_failed')
    if not (kind == 'retry_begins' or kind == 'receiving_owner_begins' and failed is True):
        return None
    before = detail.get('retry_count_before')
    if type(before) is not int or not 0 <= before <= 2:
        return None
    return 'retry_ceiling' if before >= RETRY_CEILING else None


def instr_retry_count_increment(value, context):
    # Defined for a retry the ceiling permits; at the ceiling instr.retry_ceiling refuses.
    detail = context['detail']
    if type(detail) is not dict:
        return None
    kind, failed = detail.get('transition_kind'), detail.get('previous_attempt_failed')
    if not (kind == 'retry_begins' or kind == 'receiving_owner_begins' and failed is True):
        return None
    before, after = detail.get('retry_count_before'), detail.get('retry_count_after')
    if type(before) is not int or type(after) is not int or not 0 <= before < RETRY_CEILING or not 0 <= after <= 2:
        return None
    return 'retry_count_mismatch' if after != before + 1 else None


def instr_retry_count_unchanged(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') not in TRANSITION_KINDS:
        return None
    kind, failed = detail['transition_kind'], detail.get('previous_attempt_failed')
    if type(failed) is not bool or kind == 'retry_begins' or kind == 'receiving_owner_begins' and failed:
        return None
    before, after = detail.get('retry_count_before'), detail.get('retry_count_after')
    if type(before) is not int or type(after) is not int or not 0 <= before <= 2 or not 0 <= after <= 2:
        return None
    return 'retry_count_mismatch' if after != before else None


def instr_attempt_number(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') not in ATTEMPT_KINDS:
        return None
    after, attempt = detail.get('retry_count_after'), detail.get('attempt_number')
    if type(after) is not int or type(attempt) is not int or not 0 <= after <= 2 or not 0 <= attempt <= 3:
        return None
    return 'attempt_number_mismatch' if attempt != after + 1 else None


def instr_attempt_none(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') not in TRANSITION_KINDS:
        return None
    attempt = detail.get('attempt_number')
    if detail['transition_kind'] in ATTEMPT_KINDS or type(attempt) is not int or not 0 <= attempt <= 3:
        return None
    return 'no_cleanup_attempt_allowed' if attempt != 0 else None


def instr_cannot_retry_previous_failure(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') != 'receiving_owner_cannot_retry':
        return None
    return 'previous_failure_required' if detail.get('previous_attempt_failed') is False else None


def instr_cannot_retry_available(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') != 'receiving_owner_cannot_retry':
        return None
    before = detail.get('retry_count_before')
    if detail.get('retry_authorized') is not True or type(before) is not int or not 0 <= before <= 2:
        return None
    return 'available_authorized_retry_must_resume' if before < RETRY_CEILING else None


def instr_install_restore_receipt(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') != 'installation_succeeded':
        return None
    return 'restore_receipt_required' if detail.get('restore_receipt_verified') is False else None


def instr_install_permission(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') != 'installation_succeeded':
        return None
    return 'narrowed_permission_required' if detail.get('permission_verified') is False else None


def instr_install_overlap(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') != 'installation_succeeded':
        return None
    return 'overlapping_temporary_changes' if detail.get('overlap_present') is True else None


def instr_install_target_leftovers(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') != 'installation_succeeded':
        return None
    present, promoted = detail.get('target_leftovers_present'), detail.get('target_leftovers_promoted')
    if type(present) is not bool or type(promoted) is not bool:
        return None
    return 'target_cleanup_unresolved' if present and not promoted else None


def instrumentation_retry_case(case_value):
    payload, records = case_value.get('payload'), case_value.get('detail_records')
    ref = payload.get('detail_ref') if type(payload) is dict else None
    # Selection only: the record payload.detail_ref names, or None.
    detail = records.get(ref) if type(ref) is str and type(records) is dict else None
    context = {'detail': detail}
    table = g.GuardTable([
        g.Guard('instr.receiving_accepted', g.Invariant('/detail_records/<detail_ref>/owner_accepted', 'is true for a receiving-owner transition'), 'receiving_owner_acceptance_required', instr_receiving_accepted),
        g.Guard('instr.retry_authorized', g.Invariant('/detail_records/<detail_ref>/retry_authorized', 'is true when a retry starts'), 'retry_authorization_required', instr_retry_authorized),
        g.Guard('instr.retry_ceiling', g.Invariant('/detail_records/<detail_ref>/retry_count_before', 'is below two when a retry starts'), 'retry_ceiling', instr_retry_ceiling),
        g.Guard('instr.retry_count_increment', g.Invariant('/detail_records/<detail_ref>/retry_count_after', 'is retry_count_before + 1 when a permitted retry starts'), 'retry_count_mismatch', instr_retry_count_increment),
        g.Guard('instr.retry_count_unchanged', g.Invariant('/detail_records/<detail_ref>/retry_count_after', 'equals retry_count_before when no retry starts'), 'retry_count_mismatch', instr_retry_count_unchanged),
        g.Guard('instr.attempt_number', g.Invariant('/detail_records/<detail_ref>/attempt_number', 'is retry_count_after + 1 when an attempt starts or completes'), 'attempt_number_mismatch', instr_attempt_number),
        g.Guard('instr.attempt_none', g.Invariant('/detail_records/<detail_ref>/attempt_number', 'is 0 when no attempt starts or completes'), 'no_cleanup_attempt_allowed', instr_attempt_none),
        g.Guard('instr.cannot_retry_previous_failure', g.Invariant('/detail_records/<detail_ref>/previous_attempt_failed', 'is true for receiving_owner_cannot_retry'), 'previous_failure_required', instr_cannot_retry_previous_failure),
        g.Guard('instr.cannot_retry_available', g.Invariant('/detail_records/<detail_ref>/retry_authorized', 'no authorized retry is still available for receiving_owner_cannot_retry'), 'available_authorized_retry_must_resume', instr_cannot_retry_available),
        g.Guard('instr.install_restore_receipt', g.Invariant('/detail_records/<detail_ref>/restore_receipt_verified', 'is true for installation_succeeded'), 'restore_receipt_required', instr_install_restore_receipt),
        g.Guard('instr.install_permission', g.Invariant('/detail_records/<detail_ref>/permission_verified', 'is true for installation_succeeded'), 'narrowed_permission_required', instr_install_permission),
        g.Guard('instr.install_overlap', g.Invariant('/detail_records/<detail_ref>/overlap_present', 'is false for installation_succeeded'), 'overlapping_temporary_changes', instr_install_overlap),
        g.Guard('instr.install_target_leftovers', g.Invariant('/detail_records/<detail_ref>/target_leftovers_present', 'leftovers are promoted when present for installation_succeeded'), 'target_cleanup_unresolved', instr_install_target_leftovers)])

    def check(value):
        table.require('instr.receiving_accepted', value, context)
        table.require('instr.retry_authorized', value, context)
        table.require('instr.retry_ceiling', value, context)
        table.require('instr.retry_count_increment', value, context)
        table.require('instr.retry_count_unchanged', value, context)
        table.require('instr.attempt_number', value, context)
        table.require('instr.attempt_none', value, context)
        table.require('instr.cannot_retry_previous_failure', value, context)
        table.require('instr.cannot_retry_available', value, context)
        table.require('instr.install_restore_receipt', value, context)
        table.require('instr.install_permission', value, context)
        table.require('instr.install_overlap', value, context)
        table.require('instr.install_target_leftovers', value, context)
        return True
    return g.Case(table, check, context)
