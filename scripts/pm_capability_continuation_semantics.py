"""SIR-003 original readiness/continuation result joins; no effect dispatcher.

The public API accepts an identity and independently owned resolvers, never a
caller authority container. Actual native owners must authenticate all source
records and hold their fences. Static fixture doubles prove relationships only.
Historical effect-time currentness is distinct from today's read permission;
this oracle never resumes work or reinterprets a historical success as a grant.
"""
from dataclasses import dataclass
from datetime import datetime
from functools import lru_cache
import json
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from pm_ui_command_response import owner_result_digest


@dataclass(frozen=True)
class OwnerValue:
    """Actual resolver return metadata, not evidence by construction."""
    record_ref: str
    generation: int
    value: object


@lru_cache(maxsize=1)
def _schemas():
    root = Path(__file__).resolve().parents[1] / 'Plans'
    schemas = [json.loads((root / name).read_text()) for name in (
        'capability_provisioning_continuation_contracts.schema.json',
        'shared_runtime_contracts.schema.json', 'full_thread_runtime_contracts.schema.json')]
    return schemas, Registry().with_resources((s['$id'], Resource.from_contents(s)) for s in schemas)


def structural_errors(definition, value):
    schemas, registry = _schemas()
    schema = schemas[1] if definition == 'capability_provisioning_operation' else schemas[0]
    return [e.message for e in Draft202012Validator(
        {'$schema': schema['$schema'], '$ref': schema['$id'] + '#/$defs/' + definition},
        registry=registry, format_checker=FormatChecker()).iter_errors(value)]


def _binding(record):
    return dict(record_ref=record.record_ref, generation=record.generation,
                sha256=owner_result_digest(record.value))


def _time(value):
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def _suppression(demand, waiter, current, settled):
    if current['waiter_state'] == 'detached':
        return 'waiter_detached'
    if current['origin_state'] != 'active':
        return 'origin_inactive'
    if demand['origin_identity'] != current['origin_identity']:
        return 'origin_changed'
    if demand['source']['source'] != current['source']:
        return 'source_changed'
    if waiter['admitted_policy'] != current['policy'] or waiter['effective_mode'] != current['effective_mode']:
        return 'policy_changed'
    if demand['continuation'] != current['continuation']:
        return 'continuation_changed'
    if _time(demand['continuation']['expires_at_utc']) <= settled:
        return 'continuation_expired'
    return None


def validate_capability_settlement(settlement_ref, *, resolve_owner_record,
        verify_original_admission, verify_readiness, verify_origin_snapshot,
        verify_waiter_effect, check_disclosure_fence):
    """Validate genuine retained result custody; never perform continuation.

    resolve_owner_record(kind, ref) returns OwnerValue from the actual original
    owner. Kinds: settlement, waiter, demand, operation, readiness, currentness,
    verification, subject, effect. Currentness is the immutable snapshot at the
    ORIGINAL settlement, not current Settings rewritten as historical policy.
    Readiness proof must validate the actual verification/subject/effect owner
    schemas and successful semantics, including Installation OR Connection,
    compatibility/provenance and actual effect-time Permissions, FileSafe,
    lease/resource/license/cost/elevation admission. It is not a ref comparison.
    Original admission authenticates the actual request/source/policy/permission
    and coalescing fingerprint. Origin proof authenticates effect-time identity,
    source, policy, waiter cancellation and continuation observation. Waiter
    effect proof authenticates the original continuation receipt or actual
    no-effect/permission-refusal result; mere receipt presence is insufficient.
    check_disclosure_fence rechecks all surviving original sources and current
    read permission after helpers. Native pre-effect admission/atomic dispatch
    and historical read-back must exist independently; this is not their API.
    Proof callbacks return failure-code lists and are all mandatory.
    """
    failures = []

    def proof(callback, label, *args):
        try:
            result = callback(*args)
        except (KeyError, ValueError, TypeError, OSError):
            failures.append(label + '_unavailable')
            return
        if not isinstance(result, list) or any(not isinstance(item, str) or not item for item in result):
            failures.append(label + '_invalid_response')
        elif result:
            failures.append(label)

    def read(kind, reference, definition=None):
        record = resolve_owner_record(kind, reference)
        if not isinstance(record, OwnerValue) or record.record_ref != reference:
            raise ValueError('original record identity unavailable')
        if type(record.generation) is not int or record.generation < 0:
            raise ValueError('original record generation unavailable')
        if definition and structural_errors(definition, record.value):
            raise ValueError('original record schema unavailable')
        return record

    def equal(left, right, code):
        if left != right:
            failures.append(code)

    try:
        settlement = read('settlement', settlement_ref, 'capability_continuation_settlement').value
        waiter = read('waiter', settlement['waiter_ref'], 'capability_waiter_binding').value
        demand_record = read('demand', waiter['demand']['record_ref'], 'capability_demand_value')
        demand = demand_record.value
        operation = read('operation', settlement['provisioning_operation_ref'], 'capability_provisioning_operation').value
        current = read('currentness', settlement['currentness_snapshot_ref'], 'capability_origin_currentness').value
    except (KeyError, ValueError, TypeError, OSError):
        return ['capability_original_source_unavailable']
    equal(settlement['settlement_ref'], settlement_ref, 'capability_settlement_identity')
    equal(waiter['waiter_ref'], settlement['waiter_ref'], 'capability_waiter_identity')
    equal(demand['demand_ref'], demand_record.record_ref, 'capability_demand_identity')
    equal(waiter['demand'], _binding(demand_record), 'capability_original_demand_binding')
    equal(waiter['shared_operation_id'], operation['operation_id'], 'capability_shared_operation')
    equal(operation['capability_id'], demand['capability_id'], 'capability_operation_capability')
    equal(operation['host_id'], demand['origin_identity']['execution_host_id'], 'capability_operation_host')
    equal(operation['environment_id'], demand['origin_identity']['execution_environment_id'], 'capability_operation_environment')
    equal(operation['policy_ref'], waiter['admitted_policy']['record_ref'], 'capability_operation_policy')
    if operation['provider_cli']:
        failures.append('capability_provider_setup_out_of_scope')
    equal(current['snapshot_ref'], settlement['currentness_snapshot_ref'], 'capability_currentness_identity')
    equal(current['waiter_ref'], waiter['waiter_ref'], 'capability_currentness_waiter')
    equal(current['origin_identity']['operation_id'], demand['origin_identity']['operation_id'], 'capability_currentness_origin')
    proof(check_disclosure_fence, 'capability_disclosure', demand, waiter, operation, current, settlement)
    proof(verify_original_admission, 'capability_original_admission', demand, waiter, operation)
    proof(verify_origin_snapshot, 'capability_origin_snapshot', demand, waiter, current, settlement)
    if failures:
        return sorted(set(failures))
    try:
        settled = _time(settlement['settled_at_utc'])
        if not _time(waiter['requested_at_utc']) <= _time(current['observed_at_utc']) <= settled:
            failures.append('capability_settlement_time')
        started = _time(operation['started_at_utc'])
        updated = _time(operation['updated_at_utc'])
        terminal = operation['terminal_at_utc']
        if started > updated:
            failures.append('capability_operation_time')
        if operation['phase'] in ('ready', 'blocked', 'failed', 'cancelled', 'rolled_back', 'recovery_required'):
            if terminal is None or not started <= _time(terminal) <= updated <= settled:
                failures.append('capability_operation_time')
        suppressed = _suppression(demand, waiter, current, settled)
    except (ValueError, TypeError, OverflowError):
        return ['capability_settlement_time']
    ready = None
    if settlement['readiness_result_ref'] is not None:
        try:
            ready = read('readiness', settlement['readiness_result_ref'], 'capability_readiness_result').value
            verification = read('verification', ready['verification']['record_ref'])
            subject = read('subject', ready['subject']['record_ref'])
            effect = None if ready['effect_result'] is None else read('effect', ready['effect_result']['record_ref'])
            equal(ready['verification'], _binding(verification), 'capability_verification_binding')
            equal(ready['subject']['generation'], subject.generation, 'capability_subject_generation')
            if effect is not None:
                equal(ready['effect_result'], _binding(effect), 'capability_effect_binding')
            equal(ready['result_ref'], settlement['readiness_result_ref'], 'capability_ready_identity')
            equal(ready['shared_operation_id'], operation['operation_id'], 'capability_ready_operation')
            equal(ready['capability_id'], demand['capability_id'], 'capability_ready_capability')
            equal(ready['compatibility_requirement'], demand['compatibility_requirement'], 'capability_ready_requirement')
            for field in ('execution_host_id', 'execution_environment_id', 'topology_generation'):
                equal(ready[field], demand['origin_identity'][field], 'capability_ready_target')
            equal(operation['phase'], 'ready', 'capability_operation_not_ready')
            if operation['terminal_at_utc'] is None or _time(operation['terminal_at_utc']) > settled:
                failures.append('capability_ready_terminal_time')
            if not _time(ready['verified_at_utc']) <= settled < _time(ready['expires_at_utc']):
                failures.append('capability_verification_expired_at_settlement')
            if ready['readiness_basis'] == 'verified_provisioning' and waiter['effective_mode'] == 'Off':
                failures.append('capability_off_provisioning')
            if ready['readiness_basis'] == 'existing_verified_capability' and operation['installation_operation_ref'] is not None:
                failures.append('capability_existing_has_new_installation')
            # A Connection effect is not an Installation. Its actual owner
            # output is checked by the mandatory adapter, never fabricated here.
            if ready['subject']['kind'] == 'Installation' and effect is not None:
                equal(operation['installation_operation_ref'], effect.record_ref, 'capability_installation_effect')
            proof(verify_readiness, 'capability_readiness_proof', demand, operation, ready, verification, subject, effect)
        except (KeyError, ValueError, TypeError, OSError, OverflowError):
            failures.append('capability_readiness_source_unavailable')
    outcome = settlement['outcome']
    if outcome == 'resumed':
        if suppressed is not None:
            failures.append('capability_stale_continuation')
    elif outcome == 'ready_without_resume':
        if settlement['reason'] != suppressed and not (suppressed is None and settlement['reason'] == 'admission_refused'):
            failures.append('capability_wrong_suppression_reason')
    elif outcome == 'detached':
        if current['waiter_state'] != 'detached':
            failures.append('capability_false_detach')
    else:
        # A failed acquisition can finish a successful rollback without making
        # the requested capability ready. Preserve that original owner phase.
        allowed_phases = ('failed', 'rolled_back') if outcome == 'failed' else (outcome,)
        if operation['phase'] not in allowed_phases:
            failures.append('capability_failure_phase')
    proof(verify_waiter_effect, 'capability_waiter_effect', demand, waiter, operation, ready, current, settlement)
    proof(check_disclosure_fence, 'capability_disclosure', demand, waiter, operation, current, settlement)
    return sorted(set(failures))


def capability_continuation_semantic_failures(definition_name, value):
    """Static fixture adapter only. Never install these doubles in native code."""
    if definition_name != 'capability_continuation_fixture':
        return []
    if structural_errors(definition_name, value):
        return ['capability_fixture_schema']
    return validate_capability_settlement(value['settlement']['settlement_ref'], **fixture_dependencies(value))


def fixture_dependencies(value):
    """Explicit fabricated original records for relational tests, not authority.

    Verification/subject/effect bodies are fixed test values; actual native
    adapters must supply their full owner schemas and effect verification.
    """
    settlement, waiter = value['settlement'], value['waiter']
    ready = value['readiness']
    records = {
        ('settlement', settlement['settlement_ref']): OwnerValue(settlement['settlement_ref'], 1, settlement),
        ('waiter', waiter['waiter_ref']): OwnerValue(waiter['waiter_ref'], 1, waiter),
        ('demand', value['demand']['demand_ref']): OwnerValue(value['demand']['demand_ref'], 1, value['demand']),
        ('operation', settlement['provisioning_operation_ref']): OwnerValue(settlement['provisioning_operation_ref'], 1, value['operation']),
        ('currentness', value['currentness']['snapshot_ref']): OwnerValue(value['currentness']['snapshot_ref'], 1, value['currentness']),
    }
    if ready is not None:
        records[('readiness', ready['result_ref'])] = OwnerValue(ready['result_ref'], 1, ready)
        records[('verification', 'verification:fixture')] = OwnerValue('verification:fixture', 1, {'fixture_kind': 'verification'})
        records[('subject', 'subject:fixture')] = OwnerValue('subject:fixture', 1, {'fixture_kind': 'subject'})
        records[('effect', 'effect:fixture')] = OwnerValue('effect:fixture', 1, {'fixture_kind': 'effect'})
    return dict(resolve_owner_record=lambda kind, ref: records[(kind, ref)],
        verify_original_admission=lambda *args: [], verify_readiness=lambda *args: [],
        verify_origin_snapshot=lambda *args: [], verify_waiter_effect=lambda *args: [],
        check_disclosure_fence=lambda *args: [])
