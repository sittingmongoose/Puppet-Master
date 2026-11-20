"""DDBG guard table: Instrumentation transitions, part 2: removal proof, remaining obligations and the responsibility handoff (DL-429).

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import (
    NEEDS_OBLIGATIONS, REMOVAL_SUCCESS, TRANSITION_KINDS)


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


def instrumentation_handoff_case(case_value):
    payload, records = case_value.get('payload'), case_value.get('detail_records')
    ref = payload.get('detail_ref') if type(payload) is dict else None
    # Selection only: the record payload.detail_ref names, or None.
    detail = records.get(ref) if type(ref) is str and type(records) is dict else None
    context = {'detail': detail}
    table = g.GuardTable([
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
        g.Guard('instr.replacement_linked_work', g.Invariant('/detail_records/<detail_ref>/linked_work_ref', 'is not null for replacement_never_needed'), 'linked_work_required', instr_replacement_linked_work)])

    def check(value):
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
        return True
    return g.Case(table, check, context)
