"""DDBG guard table: Instrumentation transition phase: the DL-429 transition rules.

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import (
    ATTEMPT_KINDS, CLEANUP_RESULTS, EDGES, INSTR_STATES,
    NEEDS_OBLIGATIONS, NEVER_NEEDED, PAIRS, RECEIVING,
    REMOVAL_SUCCESS, RETRY_CEILING, TRANSITION_KINDS)


def instr_second_handoff(value, context):
    if type(value.get('instrumentation_source')) is not dict:
        return None
    detail = context['detail']
    source = value['instrumentation_source']
    if type(detail) is not dict or detail.get('transition_kind') != 'responsibility_handoff':
        return None
    return 'receiving_acceptance_before_second_handoff' if source.get('handoff_pending') is True else None


def instr_no_op(value, context):
    if type(value.get('payload')) is not dict:
        return None
    payload = value['payload']
    states = (payload.get('previous_state'), payload.get('state'))
    results = (payload.get('previous_rollback_state'), payload.get('rollback_state'))
    if not all([state in INSTR_STATES for state in states]) or not all([result in CLEANUP_RESULTS for result in results]):
        return None
    return 'no_op' if states[0] == states[1] and results[0] == results[1] else None


def instr_pair_before(value, context):
    if type(value.get('payload')) is not dict:
        return None
    payload = value['payload']
    if payload.get('previous_state') not in INSTR_STATES:
        return None
    if payload.get('previous_rollback_state') not in CLEANUP_RESULTS:
        return None
    return 'invalid_status_result_pair' if (payload['previous_state'], payload['previous_rollback_state']) not in PAIRS else None


def instr_pair_after(value, context):
    if type(value.get('payload')) is not dict:
        return None
    payload = value['payload']
    if payload.get('state') not in INSTR_STATES or payload.get('rollback_state') not in CLEANUP_RESULTS:
        return None
    return 'invalid_status_result_pair' if (payload['state'], payload['rollback_state']) not in PAIRS else None


def instr_cleaned_restart(value, context):
    # Defined on a change between two legal pairs; instr.no_op and the pair rows own the rest.
    if type(value.get('payload')) is not dict:
        return None
    payload = value['payload']
    before = (payload.get('previous_state'), payload.get('previous_rollback_state'))
    after = (payload.get('state'), payload.get('rollback_state'))
    if before == after or before not in PAIRS or after not in PAIRS:
        return None
    return 'cleaned_requires_linked_probe' if before[0] == 'cleaned' else None


def instr_edge_start(value, context):
    # The approved edge table is defined on a change between two legal pairs that does not leave Cleaned.
    if type(value.get('payload')) is not dict:
        return None
    payload = value['payload']
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') not in TRANSITION_KINDS:
        return None
    before = (payload.get('previous_state'), payload.get('previous_rollback_state'))
    after = (payload.get('state'), payload.get('rollback_state'))
    if before == after or before not in PAIRS or after not in PAIRS or before[0] == 'cleaned':
        return None
    starts = [edge[1] for edge in EDGES if edge[0] == detail['transition_kind']][0]
    return 'transition_not_allowed' if before not in starts else None


def instr_edge_end(value, context):
    if type(value.get('payload')) is not dict:
        return None
    payload = value['payload']
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') not in TRANSITION_KINDS:
        return None
    before = (payload.get('previous_state'), payload.get('previous_rollback_state'))
    after = (payload.get('state'), payload.get('rollback_state'))
    if before == after or before not in PAIRS or after not in PAIRS or before[0] == 'cleaned':
        return None
    end = [edge[2] for edge in EDGES if edge[0] == detail['transition_kind']][0]
    return 'transition_not_allowed' if after != end else None


def instr_never_needed_whole_lane(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') not in NEVER_NEEDED:
        return None
    return 'whole_lane_never_needed_proof_required' if detail.get('whole_lane_never_needed_undoing') is False else None


def instr_never_needed_no_leftovers(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') not in NEVER_NEEDED:
        return None
    return 'leftovers_prevent_cleaned' if detail.get('no_leftovers') is False else None


def instr_never_needed_proof(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') not in NEVER_NEEDED or 'proof_ref' not in detail:
        return None
    return 'proof_ref_required' if detail['proof_ref'] is None else None


def instr_never_needed_not_removed(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') not in NEVER_NEEDED:
        return None
    return 'actual_removal_is_not_not_needed' if detail.get('removal_verified') is True else None


def instr_removal_verified(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') not in REMOVAL_SUCCESS:
        return None
    return 'verified_removal_required' if detail.get('removal_verified') is False else None


def instr_removal_no_leftovers(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') not in REMOVAL_SUCCESS:
        return None
    return 'leftovers_prevent_cleaned' if detail.get('no_leftovers') is False else None


def instr_removal_proof(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') not in REMOVAL_SUCCESS or 'proof_ref' not in detail:
        return None
    return 'proof_ref_required' if detail['proof_ref'] is None else None


def instr_obligations_remaining(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') not in NEEDS_OBLIGATIONS:
        return None
    refs = detail.get('remaining_obligation_refs')
    return 'remaining_obligations_required' if type(refs) is list and len(refs) == 0 else None


def instr_obligations_recovery(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') not in NEEDS_OBLIGATIONS or 'recovery_ref' not in detail:
        return None
    return 'recovery_link_required' if detail['recovery_ref'] is None else None


def instr_handoff_approved(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') != 'responsibility_handoff':
        return None
    return 'handoff_approval_required' if detail.get('handoff_approved') is False else None


def instr_handoff_committed(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') != 'responsibility_handoff':
        return None
    return 'handoff_not_committed' if detail.get('handoff_committed') is False else None


def instr_handoff_linked_work(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') != 'responsibility_handoff' or 'linked_work_ref' not in detail:
        return None
    return 'linked_work_required' if detail['linked_work_ref'] is None else None


def instr_handoff_new_owner(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') != 'responsibility_handoff':
        return None
    owner, previous = detail.get('owner_ref'), detail.get('previous_owner_ref')
    if type(owner) is not str or type(previous) is not str or not 0 < len(owner) <= 256 or not 0 < len(previous) <= 256:
        return None
    return 'new_responsible_owner_required' if owner == previous else None


def instr_handoff_kind(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') != 'responsibility_handoff':
        return None
    return 'handoff_kind_required' if detail.get('handoff_kind') == 'none' else None


def instr_handoff_durable_fix(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') != 'responsibility_handoff' or detail.get('handoff_kind') != 'durable_fix':
        return None
    return 'durable_fix_approval_required' if detail.get('durable_fix_approved') is False else None


def instr_owner_unchanged(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') not in TRANSITION_KINDS:
        return None
    if detail['transition_kind'] == 'responsibility_handoff':
        return None
    owner, previous = detail.get('owner_ref'), detail.get('previous_owner_ref')
    if type(owner) is not str or type(previous) is not str or not 0 < len(owner) <= 256 or not 0 < len(previous) <= 256:
        return None
    return 'responsibility_changed_without_handoff' if owner != previous else None


def instr_replacement_linked_work(value, context):
    detail = context['detail']
    if type(detail) is not dict or detail.get('transition_kind') != 'replacement_never_needed' or 'linked_work_ref' not in detail:
        return None
    return 'linked_work_required' if detail['linked_work_ref'] is None else None


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


def instrumentation_case(case_value):
    payload, records = case_value.get('payload'), case_value.get('detail_records')
    ref = payload.get('detail_ref') if type(payload) is dict else None
    # Selection only: the record payload.detail_ref names, or None.
    detail = records.get(ref) if type(ref) is str and type(records) is dict else None
    context = {'detail': detail}
    table = g.GuardTable([
        g.Guard('instr.second_handoff', g.Invariant('/instrumentation_source/handoff_pending', 'is not true for a responsibility_handoff'), 'receiving_acceptance_before_second_handoff', instr_second_handoff),
        g.Guard('instr.no_op', g.Invariant('/payload/state', '(state, rollback_state) differs from (previous_state, previous_rollback_state)'), 'no_op', instr_no_op),
        g.Guard('instr.pair_before', g.Invariant('/payload/previous_rollback_state', '(previous_state, previous_rollback_state) is one of the eight legal pairs'), 'invalid_status_result_pair', instr_pair_before),
        g.Guard('instr.pair_after', g.Invariant('/payload/rollback_state', '(state, rollback_state) is one of the eight legal pairs'), 'invalid_status_result_pair', instr_pair_after),
        g.Guard('instr.cleaned_restart', g.Invariant('/payload/previous_state', 'is not cleaned for a change between legal pairs'), 'cleaned_requires_linked_probe', instr_cleaned_restart),
        g.Guard('instr.edge_start', g.Invariant('/payload/previous_state', 'before pair is an approved start of transition_kind'), 'transition_not_allowed', instr_edge_start),
        g.Guard('instr.edge_end', g.Invariant('/payload/state', 'after pair is the approved end of transition_kind'), 'transition_not_allowed', instr_edge_end),
        g.Guard('instr.never_needed_whole_lane', g.Invariant('/detail_records/<detail_ref>/whole_lane_never_needed_undoing', 'is true for a never-needed ending'), 'whole_lane_never_needed_proof_required', instr_never_needed_whole_lane),
        g.Guard('instr.never_needed_no_leftovers', g.Invariant('/detail_records/<detail_ref>/no_leftovers', 'is true for a never-needed ending'), 'leftovers_prevent_cleaned', instr_never_needed_no_leftovers),
        g.Guard('instr.never_needed_proof', g.Invariant('/detail_records/<detail_ref>/proof_ref', 'is not null for a never-needed ending'), 'proof_ref_required', instr_never_needed_proof),
        g.Guard('instr.never_needed_not_removed', g.Invariant('/detail_records/<detail_ref>/removal_verified', 'is false for a never-needed ending'), 'actual_removal_is_not_not_needed', instr_never_needed_not_removed),
        g.Guard('instr.removal_verified', g.Invariant('/detail_records/<detail_ref>/removal_verified', 'is true for a removal success'), 'verified_removal_required', instr_removal_verified),
        g.Guard('instr.removal_no_leftovers', g.Invariant('/detail_records/<detail_ref>/no_leftovers', 'is true for a removal success'), 'leftovers_prevent_cleaned', instr_removal_no_leftovers),
        g.Guard('instr.removal_proof', g.Invariant('/detail_records/<detail_ref>/proof_ref', 'is not null for a removal success'), 'proof_ref_required', instr_removal_proof),
        g.Guard('instr.obligations_remaining', g.Invariant('/detail_records/<detail_ref>/remaining_obligation_refs', 'is nonempty when obligations remain'), 'remaining_obligations_required', instr_obligations_remaining),
        g.Guard('instr.obligations_recovery', g.Invariant('/detail_records/<detail_ref>/recovery_ref', 'is not null when obligations remain'), 'recovery_link_required', instr_obligations_recovery),
        g.Guard('instr.handoff_approved', g.Invariant('/detail_records/<detail_ref>/handoff_approved', 'is true for a responsibility_handoff'), 'handoff_approval_required', instr_handoff_approved),
        g.Guard('instr.handoff_committed', g.Invariant('/detail_records/<detail_ref>/handoff_committed', 'is true for a responsibility_handoff'), 'handoff_not_committed', instr_handoff_committed),
        g.Guard('instr.handoff_linked_work', g.Invariant('/detail_records/<detail_ref>/linked_work_ref', 'is not null for a responsibility_handoff'), 'linked_work_required', instr_handoff_linked_work),
        g.Guard('instr.handoff_new_owner', g.Invariant('/detail_records/<detail_ref>/owner_ref', 'differs from previous_owner_ref for a responsibility_handoff'), 'new_responsible_owner_required', instr_handoff_new_owner),
        g.Guard('instr.handoff_kind', g.Invariant('/detail_records/<detail_ref>/handoff_kind', 'is not none for a responsibility_handoff'), 'handoff_kind_required', instr_handoff_kind),
        g.Guard('instr.handoff_durable_fix', g.Invariant('/detail_records/<detail_ref>/durable_fix_approved', 'is true for a durable_fix handoff'), 'durable_fix_approval_required', instr_handoff_durable_fix),
        g.Guard('instr.owner_unchanged', g.Invariant('/detail_records/<detail_ref>/owner_ref', 'equals previous_owner_ref outside a responsibility_handoff'), 'responsibility_changed_without_handoff', instr_owner_unchanged),
        g.Guard('instr.replacement_linked_work', g.Invariant('/detail_records/<detail_ref>/linked_work_ref', 'is not null for replacement_never_needed'), 'linked_work_required', instr_replacement_linked_work),
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
        table.require('instr.second_handoff', value, context)
        table.require('instr.no_op', value, context)
        table.require('instr.pair_before', value, context)
        table.require('instr.pair_after', value, context)
        table.require('instr.cleaned_restart', value, context)
        table.require('instr.edge_start', value, context)
        table.require('instr.edge_end', value, context)
        table.require('instr.never_needed_whole_lane', value, context)
        table.require('instr.never_needed_no_leftovers', value, context)
        table.require('instr.never_needed_proof', value, context)
        table.require('instr.never_needed_not_removed', value, context)
        table.require('instr.removal_verified', value, context)
        table.require('instr.removal_no_leftovers', value, context)
        table.require('instr.removal_proof', value, context)
        table.require('instr.obligations_remaining', value, context)
        table.require('instr.obligations_recovery', value, context)
        table.require('instr.handoff_approved', value, context)
        table.require('instr.handoff_committed', value, context)
        table.require('instr.handoff_linked_work', value, context)
        table.require('instr.handoff_new_owner', value, context)
        table.require('instr.handoff_kind', value, context)
        table.require('instr.handoff_durable_fix', value, context)
        table.require('instr.owner_unchanged', value, context)
        table.require('instr.replacement_linked_work', value, context)
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
