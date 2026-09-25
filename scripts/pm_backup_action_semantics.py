"""BRS-030 owner-source joins. Static oracle, not an installed Backup handler.

Native integrations supply independently authenticated original-operation,
outcome and immutable-state resolvers plus real admission, derived-proof and
current-disclosure checks. Call under the owner's source/currentness fence;
this pure oracle neither acquires that fence nor executes/persists anything.
The fixture adapter below is explicitly NOT that integration or proof of it.
"""
from __future__ import annotations

from datetime import datetime
from functools import lru_cache
import json
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker


@lru_cache(maxsize=1)
def _schema():
    return json.loads((Path(__file__).resolve().parents[1] /
                       'Plans/backup_restore_system_contracts.schema.json').read_text())


def structural_errors(definition, value):
    schema = _schema()
    selected = {'$schema': schema['$schema'], '$defs': schema['$defs'],
                '$ref': '#/$defs/' + definition}
    return [error.message for error in Draft202012Validator(
        selected, format_checker=FormatChecker()).iter_errors(value)]


def validate_destination_update_result(operation_id, *, resolve_original_operation,
        resolve_result_metadata, resolve_destination_state, validate_record,
        verify_original_admission, verify_result_derivation, check_current_disclosure):
    """Resolve and check an original outcome; never accept a caller facts map.

    All resolver/check dependencies are mandatory. Resolvers must return actual
    owner-issued retained records for the requested identity, not synthesize
    them from a request, focused form or current destination. Proof callbacks
    return a list of failure codes, empty only on successful owner verification.
    verify_original_admission authenticates the historical original admission;
    current disclosure is a separate check and cannot rewrite that history.
    verify_result_derivation authenticates the actual resulting configuration,
    test-scope applicability, health/capabilities and partial effect facts. A
    matching last_test_receipt_ref is insufficient. Callback implementation and
    atomic native custody/fence proof are runtime prerequisites, not this oracle.
    """
    failures = []

    def check(callback, code, *args):
        try:
            result = callback(*args)
        except (KeyError, ValueError, TypeError, OSError):
            failures.append(code + '_unavailable')
            return
        if not isinstance(result, list) or not all(isinstance(item, str) and item for item in result):
            failures.append(code + '_invalid_response')
        elif result:
            failures.append(code)

    try:
        original = resolve_original_operation(operation_id)
        metadata = resolve_result_metadata(operation_id)
    except (KeyError, ValueError, TypeError, OSError):
        return ['backup_update_original_source_unavailable']
    if validate_record('backup_operation_binding', original):
        return ['backup_update_original_binding_schema']
    if validate_record('backup_destination_v3', metadata):
        return ['backup_update_metadata_schema']
    outcome = metadata['last_update']
    check(check_current_disclosure, 'backup_update_disclosure', original, metadata)
    if failures:
        return sorted(set(failures))
    if original['command_id'] != 'cmd.backup.destination.update':
        return ['backup_update_wrong_command']
    if original['operation_id'] != operation_id or outcome['original_operation'] != original:
        return ['backup_update_original_binding_mismatch']
    selected = original['selected_input']
    try:
        before = resolve_destination_state(outcome['before_state_ref'])
        after = (resolve_destination_state(outcome['after_state_ref'])
                 if outcome['after_state_ref'] is not None else None)
    except (KeyError, ValueError, TypeError, OSError):
        return ['backup_update_state_source_unavailable']
    if validate_record('backup_destination', before) or (
            after is not None and validate_record('backup_destination', after)):
        return ['backup_update_state_schema']

    def equal(left, right, code):
        if left != right:
            failures.append(code)

    equal(before['backup_destination_id'], selected['backup_destination_id'], 'backup_update_destination')
    equal(before['owning_server_id'], selected['target_server_id'], 'backup_update_server')
    equal(before['destination_generation'], selected['expected_destination_generation'], 'backup_update_expected_generation')
    equal(before['destination_generation'], outcome['before_generation'], 'backup_update_before_generation')
    # Metadata remains a real destination even when this attempt's effect is
    # unresolved. In that branch it cannot stand in for the missing after-state.
    for field in ('backup_destination_id', 'owning_server_id', 'destination_family',
                  'destination_adapter_id', 'created_at_utc'):
        equal(metadata['destination'][field], before[field], 'backup_update_identity')
    check(verify_original_admission, 'backup_update_original_admission', original, before)
    if after is None:
        equal(metadata['destination'], before, 'backup_update_unknown_not_last_known_before')
    if after is not None:
        equal(after, metadata['destination'], 'backup_update_metadata_not_actual_result')
        equal(after['destination_generation'], outcome['after_generation'], 'backup_update_after_generation')
        for field in ('backup_destination_id', 'owning_server_id', 'destination_family',
                      'destination_adapter_id', 'created_at_utc', 'repository_refs'):
            equal(after[field], before[field], 'backup_update_identity_or_repository_change')
        fields = ('display_name', 'location_ref', 'auth_profile_ref', 'credential_ref', 'oauth_registration_ref')
        for field in fields:
            if outcome['effect_status'] == 'partial' and field in selected['patch']:
                # Actual observed partial values are evidence, not an assertion
                # that the entire requested patch was applied. Proof callback
                # must authenticate them; unselected configuration stays fixed.
                continue
            expected = (selected['patch'].get(field, before[field])
                        if outcome['effect_status'] == 'applied' else before[field])
            equal(after[field], expected, 'backup_update_patch_or_unedited_configuration')
        if outcome['outcome'] == 'no_change':
            for field, value in selected['patch'].items():
                equal(before[field], value, 'backup_update_false_no_change')
    try:
        terminal = datetime.fromisoformat(outcome['completed_at_utc'].replace('Z', '+00:00'))
        for state in (before, after):
            if state is not None:
                created = datetime.fromisoformat(state['created_at_utc'].replace('Z', '+00:00'))
                updated = datetime.fromisoformat(state['updated_at_utc'].replace('Z', '+00:00'))
                if not created <= updated <= terminal:
                    failures.append('backup_update_time_order')
    except (ValueError, TypeError, OverflowError):
        failures.append('backup_update_time_invalid')
    check(verify_result_derivation, 'backup_update_result_derivation', original, before, after, outcome)
    # Helpers may have invalidated disclosure/source currentness. No result is
    # released without a fresh final check inside the caller's native fence.
    check(check_current_disclosure, 'backup_update_disclosure', original, metadata)
    return sorted(set(failures))


def backup_action_semantic_failures(definition_name, value):
    """Static fixture adapter only; no JSON value supplies real owner authority."""
    if definition_name == 'backup_action_result_v2':
        original = value.get('original_operation')
        if original is not None and original['command_id'] != value['command_id']:
            return ['backup_response_original_command_or_idempotency']
        return []
    if definition_name != 'backup_destination_update_validation_input':
        return []
    if structural_errors(definition_name, value):
        return ['backup_update_validation_input_schema']
    original = value['original_operation']
    metadata = value['resolved_metadata']
    result = metadata['last_update']

    def original_resolver(identity):
        if identity != original['operation_id']:
            raise KeyError(identity)
        return original

    def metadata_resolver(identity):
        # Intentionally allow a substituted fixture to reach the causal check.
        return metadata

    def state_resolver(ref):
        if ref == result['before_state_ref']:
            if ref == result['after_state_ref'] and value['before_state'] != value['after_state']:
                raise ValueError('same immutable ref has two different states')
            return value['before_state']
        if ref == result['after_state_ref'] and value['after_state'] is not None:
            return value['after_state']
        raise KeyError(ref)

    # These deliberate test doubles establish only record relations. Dedicated
    # tests supply refusing callbacks; no fixture is credited as native proof.
    return validate_destination_update_result(original['operation_id'],
        resolve_original_operation=original_resolver, resolve_result_metadata=metadata_resolver,
        resolve_destination_state=state_resolver, validate_record=structural_errors,
        verify_original_admission=lambda *args: [], verify_result_derivation=lambda *args: [],
        check_current_disclosure=lambda *args: [])


def _selected_equal(command_id, left, right):
    """Only the admitted verify snapshot set is order-insensitive."""
    if command_id != 'cmd.backup.verify':
        return left == right
    left, right = dict(left), dict(right)
    left['snapshot_ids'] = set(left['snapshot_ids'])
    right['snapshot_ids'] = set(right['snapshot_ids'])
    return left == right


def validate_action_response(request, response, *, resolve_original_operation,
        resolve_domain_result, validate_domain_result, verify_response_admission,
        check_current_disclosure):
    """Read-only transport join; all issuer/authority dependencies are mandatory.

    validate_domain_result(kind, original, record) must validate the exact owner
    schema AND call its source/result oracle with real original source readers
    and mandatory proof callbacks. It is not satisfied by an empty test double
    or a schema check. resolve_domain_result retrieves the genuine immutable
    historical owner result, never latest. verify_response_admission separately
    authenticates accepted work or a disabled/rejected/unavailable response and
    any admission/currentness claim. Run the complete sequence under the owner
    fence. This module installs none of these native dependencies or handlers.
    """
    if structural_errors('backup_action_request_v2', request) or structural_errors('backup_action_result_v2', response):
        return ['backup_response_schema']
    failures = []

    def proof(callback, label, *args):
        try:
            result = callback(*args)
        except (KeyError, ValueError, TypeError, OSError):
            failures.append(label + '_unavailable')
            return
        if not isinstance(result, list) or not all(isinstance(item, str) and item for item in result):
            failures.append(label + '_invalid_response')
        elif result:
            failures.append(label)

    for field in ('command_id', 'command_instance_id'):
        if request[field] != response[field]:
            failures.append('backup_response_invocation')
    proof(check_current_disclosure, 'backup_response_disclosure', request, response)
    proof(verify_response_admission, 'backup_response_admission', request, response)
    if failures:
        return sorted(set(failures))
    binding = response['original_operation']
    if binding is not None:
        try:
            original = resolve_original_operation(binding['operation_id'])
        except (KeyError, ValueError, TypeError, OSError):
            return ['backup_response_original_unavailable']
        if structural_errors('backup_operation_binding', original) or original != binding:
            return ['backup_response_original_binding']
        if original['command_id'] != request['command_id'] or original['idempotency_key'] != request['idempotency_key']:
            return ['backup_response_original_command_or_idempotency']
        if not _selected_equal(request['command_id'], original['selected_input'], request['action_input']):
            failures.append('backup_response_selected_input')
        if not response['replayed']:
            for field in ('command_instance_id', 'actor_ref', 'permission_snapshot_ref',
                          'expected_currentness_ref', 'expected_currentness_sha256', 'source_surface', 'return_route_ref'):
                if original[field] != request[field]:
                    failures.append('backup_response_fresh_original_binding')
        if failures:
            return sorted(set(failures))
    else:
        original = None
    if response['domain_result_ref'] is not None:
        kind = response['domain_result_kind']
        try:
            record = resolve_domain_result(kind, response['domain_result_ref'])
        except (KeyError, ValueError, TypeError, OSError):
            return ['backup_response_domain_unavailable']
        proof(validate_domain_result, 'backup_response_domain_validation', kind, original, record)
        if failures:
            return sorted(set(failures))
        try:
            if kind == 'destination_update':
                facts = record['last_update']
                domain_binding = facts['original_operation']
                expected = 'partial' if facts['effect_status'] == 'partial' else facts['outcome']
            elif kind == 'verification':
                domain_binding = record['original_operation']
                expected = {'passed': 'completed', 'cancelled': 'cancelled'}.get(record['status'], 'failed')
            elif kind == 'compare':
                domain_binding = record['operation_binding']
                expected = 'failed' if record['status'] == 'unavailable' else record['status']
            else:
                # Drill consumer supplies the same existing-family original
                # binding/status contract; cleanup can independently forbid an
                # entirely completed operation even when verification passed.
                domain_binding = record['original_operation']
                expected = {'completed': 'completed', 'cancelled': 'cancelled',
                            'failed': 'failed', 'recovery_required': 'partial'}[record['operation_status']]
            if domain_binding != original:
                failures.append('backup_response_domain_original_binding')
            if response['outcome'] != expected:
                failures.append('backup_response_domain_outcome')
        except (KeyError, ValueError, TypeError):
            failures.append('backup_response_domain_shape')
    proof(check_current_disclosure, 'backup_response_disclosure', request, response)
    return sorted(set(failures))
