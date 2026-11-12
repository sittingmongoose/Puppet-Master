"""DDBG guard table: Instrumentation transitions, part 1: status pairs, the approved edges and the never-needed and removal endings (DL-429).

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import (
    CLEANUP_RESULTS, EDGES, INSTR_STATES, NEVER_NEEDED,
    PAIRS, REMOVAL_SUCCESS, TRANSITION_KINDS)


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
        g.Guard('instr.removal_verified', g.Invariant('/detail_records/<detail_ref>/removal_verified', 'is true for a removal success'), 'verified_removal_required', instr_removal_verified)])

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
        return True
    return g.Case(table, check, context)
