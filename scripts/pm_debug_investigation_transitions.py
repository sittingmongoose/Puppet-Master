"""Static models of DL-428/429; all source/proof inputs are fixture projections.

Native owner exclusion, original receipts and evidence dereference remain NOT_RUN.
This is product transition logic, not guard-isolation/proof machinery.
"""
import json
from pathlib import Path
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
FAILED_REASONS = (
    'investigation.verification_failed', 'investigation.no_repro_observed',
    'investigation.budget_exhausted', 'investigation.runtime_unavailable',
    'investigation.target_unreachable', 'investigation.adapter_unavailable')
TERMINAL = ('failed', 'resolved', 'cancelled', 'superseded')
ATTENTION = (
    'auth_handoff_required', 'manual_repro_required', 'manual_verification_required',
    'external_app_start_required', 'session_reconnect_required',
    'missing_credentials_or_secret', 'degraded_evidence_review_required',
    'sensitive_capture_review_required', 'adapter_switch_recommended',
    'target_selection_required', 'workspace_binding_required', 'import_bundle_required')


def lifecycle_refusal(case):
    p, source = case['payload'], case['lifecycle_source']
    schema = json.loads((ROOT / 'Plans/debug_investigation_event_payloads.schema.json').read_text())
    if not Draft202012Validator(schema['$defs']['lifecycle_source']).is_valid(source):
        return 'invalid_lifecycle_source'
    if (p['previous_state'] != source['state']
            or p['previous_phase'] != source['phase']):
        return 'stale_lifecycle_source'
    if (p['previous_state'], p['previous_phase']) == (p['state'], p['phase']):
        return 'no_op'
    if source['state'] in TERMINAL:
        return 'terminal_requires_linked_investigation'
    reason = p.get('stop_reason_code')
    reasons = {
        'failed': FAILED_REASONS,
        'failed_cleanup': ('investigation.cleanup_failed',),
        'resolved': ('investigation.resolved_verified', 'investigation.analysis_only_completed'),
        'attention_required': ('investigation.attention_required',),
        'blocked': ('investigation.blocked',),
        'cancelled': ('investigation.cancelled_by_user',),
        'superseded': ('investigation.superseded',),
        'active': (None,), 'verifying': (None,)}
    if reason not in reasons[p['state']]:
        return 'state_reason_mismatch'
    if p['state'] == 'attention_required' and p.get('attention_required_reason_code') not in ATTENTION:
        return 'attention_reason_required'
    if p['state'] == 'blocked' and not p.get('blocked_reason_code'):
        return 'blocked_reason_required'
    if p['state'] == 'resolved':
        if not source['verification_qualified']:
            return 'verification_required'
        if not (source['cleanup_completed'] or source['documented_preservation_hold']):
            return 'cleanup_required'
    return None


def cleanup_retry_refusal(retries_used, authorized):
    """Owner's typed initiation decision, before allocating an attempt/body."""
    if not authorized:
        return 'retry_authorization_required'
    if retries_used >= 2:
        return 'retry_ceiling'
    return None


def instrumentation_refusal(case):
    p, source = case['payload'], case['instrumentation_source']
    detail = case['detail_records'].get(p['detail_ref'])
    if detail is None:
        return 'detail_unavailable'
    schema = json.loads((ROOT / 'Plans/debug_investigation_event_payloads.schema.json').read_text())
    if not Draft202012Validator(schema['$defs']['instrumentation_source']).is_valid(source):
        return 'invalid_instrumentation_source'
    if not Draft202012Validator(schema['$defs']['instrumentation_change_detail']).is_valid(detail):
        return 'invalid_detail'
    if len(json.dumps(detail, ensure_ascii=False, separators=(',', ':')).encode()) > 16384:
        return 'detail_payload_reference_required'
    if (p['instrumentation_id'] != source['instrumentation_id']
            or p['scope_kind'] != source['scope_kind']
            or p['previous_state'] != source['state']
            or p['previous_rollback_state'] != source['cleanup_result']
            or detail['instrumentation_id'] != source['instrumentation_id']
            or detail['operation_id'] != p['operation_id']
            or detail['target_ref'] != source['target_ref']
            or detail['previous_owner_ref'] != source['owner_ref']
            or detail['retry_count_before'] != source['retry_count']
            or detail['previous_attempt_failed'] != source['previous_attempt_failed']
            or detail['handoff_pending'] != source['handoff_pending']):
        return 'instrumentation_source_mismatch'
    before = (p['previous_state'], p['previous_rollback_state'])
    after = (p['state'], p['rollback_state'])
    if detail['transition_kind'] == 'responsibility_handoff' and source['handoff_pending']:
        return 'receiving_acceptance_before_second_handoff'
    if before == after:
        return 'no_op'
    early = (('planned', 'not_needed'), ('active', 'pending'), ('collecting', 'pending'))
    cleanup = ('cleanup_pending', 'pending')
    handed = ('cleanup_pending', 'superseded')
    failed = ('cleanup_failed', 'failed')
    clean_none, clean_done = ('cleaned', 'not_needed'), ('cleaned', 'succeeded')
    pairs = (*early, cleanup, handed, failed, clean_none, clean_done)
    if before not in pairs or after not in pairs:
        return 'invalid_status_result_pair'
    if before[0] == 'cleaned':
        return 'cleaned_requires_linked_probe'
    kind = detail['transition_kind']
    # Exactly the approved edges, including both retry outcome alternatives.
    allowed = {
        'installation_succeeded': (early[:1], early[1]),
        'collection_started': (early[1:2], early[2]),
        'collection_paused_or_finished': (early[2:], early[1]),
        'ended_never_needed': (early, clean_none),
        'leftovers_require_cleanup': (early, cleanup),
        'inspection_never_needed': ((cleanup, handed, failed), clean_none),
        'removal_succeeded': ((cleanup,), clean_done),
        'removal_failed': ((cleanup,), failed),
        'retry_begins': ((failed,), cleanup),
        'retry_outcome_succeeded': ((cleanup,), clean_done),
        'retry_outcome_failed': ((cleanup,), failed),
        'responsibility_handoff': ((*early, cleanup, failed), handed),
        'receiving_owner_begins': ((handed,), cleanup),
        'receiving_owner_cannot_retry': ((handed,), failed),
        'replacement_never_needed': (early, clean_none)}
    starts, end = allowed[kind]
    if before not in starts or after != end:
        return 'transition_not_allowed'
    never_needed = kind in ('ended_never_needed', 'inspection_never_needed', 'replacement_never_needed')
    if never_needed:
        if not detail['whole_lane_never_needed_undoing']:
            return 'whole_lane_never_needed_proof_required'
        if not detail['no_leftovers']:
            return 'leftovers_prevent_cleaned'
        if detail['proof_ref'] is None:
            return 'proof_ref_required'
        if detail['removal_verified']:
            return 'actual_removal_is_not_not_needed'
    if kind in ('removal_succeeded', 'retry_outcome_succeeded'):
        if not detail['removal_verified']:
            return 'verified_removal_required'
        if not detail['no_leftovers']:
            return 'leftovers_prevent_cleaned'
        if detail['proof_ref'] is None:
            return 'proof_ref_required'
    needs_obligations = kind in ('leftovers_require_cleanup', 'removal_failed', 'retry_outcome_failed',
                                'responsibility_handoff', 'receiving_owner_cannot_retry')
    if needs_obligations:
        if not detail['remaining_obligation_refs']:
            return 'remaining_obligations_required'
        if detail['recovery_ref'] is None:
            return 'recovery_link_required'
    if kind == 'responsibility_handoff':
        if not detail['handoff_approved']:
            return 'handoff_approval_required'
        if not detail['handoff_committed']:
            return 'handoff_not_committed'
        if detail['linked_work_ref'] is None:
            return 'linked_work_required'
        if detail['owner_ref'] == detail['previous_owner_ref']:
            return 'new_responsible_owner_required'
        if detail['handoff_kind'] == 'none':
            return 'handoff_kind_required'
        if detail['handoff_kind'] == 'durable_fix' and not detail['durable_fix_approved']:
            return 'durable_fix_approval_required'
    elif detail['owner_ref'] != detail['previous_owner_ref']:
        return 'responsibility_changed_without_handoff'
    if kind == 'replacement_never_needed' and detail['linked_work_ref'] is None:
        return 'linked_work_required'
    receiving = kind in ('receiving_owner_begins', 'receiving_owner_cannot_retry')
    if receiving and not detail['owner_accepted']:
        return 'receiving_owner_acceptance_required'
    starts_retry = kind == 'retry_begins' or (
        kind == 'receiving_owner_begins' and detail['previous_attempt_failed'])
    before_count, after_count = detail['retry_count_before'], detail['retry_count_after']
    if starts_retry:
        if reason := cleanup_retry_refusal(before_count, detail['retry_authorized']):
            return reason
        if after_count != before_count + 1:
            return 'retry_count_mismatch'
    elif after_count != before_count:
        return 'retry_count_mismatch'
    starts_attempt = kind in ('leftovers_require_cleanup', 'retry_begins', 'receiving_owner_begins')
    completes_attempt = kind in ('removal_succeeded', 'removal_failed', 'retry_outcome_succeeded', 'retry_outcome_failed')
    if starts_attempt or completes_attempt:
        if detail['attempt_number'] != after_count + 1:
            return 'attempt_number_mismatch'
    elif detail['attempt_number'] != 0:
        return 'no_cleanup_attempt_allowed'
    if kind == 'receiving_owner_cannot_retry':
        if not detail['previous_attempt_failed']:
            return 'previous_failure_required'
        if detail['retry_authorized'] and before_count < 2:
            return 'available_authorized_retry_must_resume'
    if kind == 'installation_succeeded':
        if not detail['restore_receipt_verified']:
            return 'restore_receipt_required'
        if not detail['permission_verified']:
            return 'narrowed_permission_required'
        if detail['overlap_present']:
            return 'overlapping_temporary_changes'
        if detail['target_leftovers_present'] and not detail['target_leftovers_promoted']:
            return 'target_cleanup_unresolved'
    return None


def resolve_all_schema_refs(schema):
    """Fail eagerly for every reference, including never-visited branches.

    This self-contained companion permits only internal references and its exact
    declared schema ids; no external schema or network resolution is assumed.
    """
    ids = {}
    def walk(value):
        if isinstance(value, dict):
            if '$id' in value:
                ids[value['$id']] = value
            yield value
            for child in value.values():
                yield from walk(child)
        elif isinstance(value, list):
            for child in value:
                yield from walk(child)
    nodes = list(walk(schema))
    for node in nodes:
        for key in ('$ref', '$dynamicRef'):
            if key not in node:
                continue
            base, _, pointer = node[key].partition('#')
            target = ids[base] if base else schema
            if pointer:
                if not pointer.startswith('/'):
                    raise ValueError('Unsupported or unresolved schema anchor: ' + node[key])
                for part in pointer[1:].split('/'):
                    target = target[part.replace('~1', '/').replace('~0', '~')]
            if not isinstance(target, (dict, bool)):
                raise ValueError('Reference is not a schema: ' + node[key])
