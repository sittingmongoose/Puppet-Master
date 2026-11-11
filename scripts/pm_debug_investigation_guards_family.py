"""DDBG guard table: Family phase: mode resolution, unchanged context state.

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import (
    CONTEXT_STATES, CONTEXT_STATE_EVENT, STARTED_EVENT)


def family_explicit_yolo(value, context):
    # mode_resolution is a fixture projection with no schema: anything but an
    # exact true opt-in refuses, so a string or missing flag cannot pass.
    if value.get('event_type') != STARTED_EVENT or type(value.get('payload')) is not dict:
        return None
    payload = value['payload']
    if payload.get('runtime_mode') != 'yolo':
        return None
    if type(value.get('mode_resolution')) is not dict:
        return 'explicit_yolo_required'
    resolution = value['mode_resolution']
    return 'explicit_yolo_required' if resolution.get('explicit_yolo') is not True else None


def family_planning_approval(value, context):
    # Only an exact false from_planning skips the handoff approval; approval must be exactly true.
    if value.get('event_type') != STARTED_EVENT or type(value.get('payload')) is not dict:
        return None
    payload = value['payload']
    if payload.get('runtime_mode') not in ('regular', 'yolo'):
        return None
    if type(value.get('mode_resolution')) is not dict:
        return 'planning_approval_required'
    resolution = value['mode_resolution']
    if resolution.get('from_planning') is False:
        return None
    return 'planning_approval_required' if resolution.get('approval_received') is not True else None


def family_context_no_op(value, context):
    if value.get('event_type') != CONTEXT_STATE_EVENT or type(value.get('payload')) is not dict:
        return None
    payload = value['payload']
    before, after = payload.get('previous_state'), payload.get('state')
    if before not in CONTEXT_STATES or after not in CONTEXT_STATES:
        return None
    return 'no_op' if before == after else None


def family_case(case_value):
    # The SP-337 inline size is measured in EVENT_VALUE bytes by the shared-rule phase (shared.payload_size).
    context = None
    table = g.GuardTable([
        g.Guard('family.explicit_yolo', g.Invariant('/mode_resolution/explicit_yolo', 'is true when a started runtime_mode is yolo'), 'explicit_yolo_required', family_explicit_yolo),
        g.Guard('family.planning_approval', g.Invariant('/mode_resolution/approval_received', 'is true for a started regular/yolo run from planning'), 'planning_approval_required', family_planning_approval),
        g.Guard('family.context_no_op', g.Invariant('/payload/state', 'differs from previous_state for context_item_state_changed'), 'no_op', family_context_no_op)])

    def check(value):
        table.require('family.explicit_yolo', value, context)
        table.require('family.planning_approval', value, context)
        table.require('family.context_no_op', value, context)
        return True
    return g.Case(table, check, context)
