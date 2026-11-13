"""DDBG guard table: Lifecycle phase (debug.investigation.state_changed, DL-428).

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import (
    ATTENTION, FAILED_REASONS, LIFECYCLE_PHASES, LIFECYCLE_ROOTS,
    LIFECYCLE_STATES, LIFECYCLE_URI, TERMINAL)

# Injected by pm_debug_investigation_transitions.load_documents() before any
# case is built: {document key: {document_uri: schema}}.
DOCUMENTS = None


def lifecycle_subject(value, context):
    return value.get('lifecycle_source')


def lifecycle_stale_state(value, context):
    if type(value.get('payload')) is not dict or type(value.get('lifecycle_source')) is not dict:
        return None
    payload = value['payload']
    source = value['lifecycle_source']
    before, original = payload.get('previous_state'), source.get('state')
    if before not in LIFECYCLE_STATES or original not in LIFECYCLE_STATES:
        return None
    return 'stale_lifecycle_source' if before != original else None


def lifecycle_stale_phase(value, context):
    if type(value.get('payload')) is not dict or type(value.get('lifecycle_source')) is not dict:
        return None
    payload = value['payload']
    source = value['lifecycle_source']
    before, original = payload.get('previous_phase'), source.get('phase')
    if before not in LIFECYCLE_PHASES or original not in LIFECYCLE_PHASES:
        return None
    return 'stale_lifecycle_source' if before != original else None


def lifecycle_no_op(value, context):
    if type(value.get('payload')) is not dict:
        return None
    payload = value['payload']
    states = (payload.get('previous_state'), payload.get('state'))
    phases = (payload.get('previous_phase'), payload.get('phase'))
    if not all(state in LIFECYCLE_STATES for state in states) or not all(phase in LIFECYCLE_PHASES for phase in phases):
        return None
    return 'no_op' if states[0] == states[1] and phases[0] == phases[1] else None


def lifecycle_terminal(value, context):
    if type(value.get('lifecycle_source')) is not dict:
        return None
    source = value['lifecycle_source']
    return 'terminal_requires_linked_investigation' if source.get('state') in TERMINAL else None


def lifecycle_state_reason(value, context):
    if type(value.get('payload')) is not dict:
        return None
    payload = value['payload']
    if payload.get('state') not in LIFECYCLE_STATES:
        return None
    reason = payload.get('stop_reason_code')
    if 'stop_reason_code' in payload and (type(reason) is not str or not 0 < len(reason) <= 256):
        return None
    # A display, not a module dict: module-level mutable state is refused as shared across cases.
    allowed = {
        'failed': FAILED_REASONS,
        'failed_cleanup': ('investigation.cleanup_failed',),
        'resolved': ('investigation.resolved_verified', 'investigation.analysis_only_completed'),
        'attention_required': ('investigation.attention_required',),
        'blocked': ('investigation.blocked',),
        'cancelled': ('investigation.cancelled_by_user',),
        'superseded': ('investigation.superseded',),
        'active': (None,),
        'verifying': (None,)}
    return 'state_reason_mismatch' if reason not in allowed[payload['state']] else None


def lifecycle_attention_reason(value, context):
    if type(value.get('payload')) is not dict:
        return None
    payload = value['payload']
    if payload.get('state') != 'attention_required':
        return None
    reason = payload.get('attention_required_reason_code')
    if 'attention_required_reason_code' in payload and (type(reason) is not str or not 0 < len(reason) <= 256):
        return None
    return 'attention_reason_required' if reason not in ATTENTION else None


def lifecycle_blocked_reason(value, context):
    if type(value.get('payload')) is not dict:
        return None
    payload = value['payload']
    if payload.get('state') != 'blocked':
        return None
    return 'blocked_reason_required' if 'blocked_reason_code' not in payload else None


def lifecycle_verification(value, context):
    if type(value.get('payload')) is not dict or type(value.get('lifecycle_source')) is not dict:
        return None
    payload = value['payload']
    source = value['lifecycle_source']
    if payload.get('state') != 'resolved':
        return None
    return 'verification_required' if source.get('verification_qualified') is False else None


def lifecycle_cleanup(value, context):
    if type(value.get('payload')) is not dict or type(value.get('lifecycle_source')) is not dict:
        return None
    payload = value['payload']
    source = value['lifecycle_source']
    if payload.get('state') != 'resolved':
        return None
    completed, hold = source.get('cleanup_completed'), source.get('documented_preservation_hold')
    if type(completed) is not bool or type(hold) is not bool:
        return None
    return 'cleanup_required' if not (completed or hold) else None


def lifecycle_case(case_value):
    catalog = g.SchemaCatalog(DOCUMENTS['lifecycle'], roots=LIFECYCLE_ROOTS)
    table = g.schema_table(catalog, {LIFECYCLE_URI: lifecycle_subject}, guards=[
        g.Guard('lifecycle.stale_state', g.Invariant('/payload/previous_state', 'equals lifecycle_source.state'), 'stale_lifecycle_source', lifecycle_stale_state),
        g.Guard('lifecycle.stale_phase', g.Invariant('/payload/previous_phase', 'equals lifecycle_source.phase'), 'stale_lifecycle_source', lifecycle_stale_phase),
        g.Guard('lifecycle.no_op', g.Invariant('/payload/state', '(state, phase) differs from (previous_state, previous_phase)'), 'no_op', lifecycle_no_op),
        g.Guard('lifecycle.terminal', g.Invariant('/lifecycle_source/state', 'is not failed, resolved, cancelled or superseded'), 'terminal_requires_linked_investigation', lifecycle_terminal),
        g.Guard('lifecycle.state_reason', g.Invariant('/payload/stop_reason_code', 'is one of the reasons DL-428 allows for payload.state'), 'state_reason_mismatch', lifecycle_state_reason),
        g.Guard('lifecycle.attention_reason', g.Invariant('/payload/attention_required_reason_code', 'is a closed attention reason when state is attention_required'), 'attention_reason_required', lifecycle_attention_reason),
        g.Guard('lifecycle.blocked_reason', g.Invariant('/payload/blocked_reason_code', 'is present when state is blocked'), 'blocked_reason_required', lifecycle_blocked_reason),
        g.Guard('lifecycle.verification', g.Invariant('/lifecycle_source/verification_qualified', 'is not false when state is resolved'), 'verification_required', lifecycle_verification),
        g.Guard('lifecycle.cleanup', g.Invariant('/lifecycle_source/cleanup_completed', 'cleanup completed or a documented preservation hold when state is resolved'), 'cleanup_required', lifecycle_cleanup)])
    context = None

    def check(value):
        table.validate(LIFECYCLE_URI, value, context)
        table.require('lifecycle.stale_state', value, context)
        table.require('lifecycle.stale_phase', value, context)
        table.require('lifecycle.no_op', value, context)
        table.require('lifecycle.terminal', value, context)
        table.require('lifecycle.state_reason', value, context)
        table.require('lifecycle.attention_reason', value, context)
        table.require('lifecycle.blocked_reason', value, context)
        table.require('lifecycle.verification', value, context)
        table.require('lifecycle.cleanup', value, context)
        return True
    return g.Case(table, check, context)
