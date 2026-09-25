"""BRS-030 isolated-drill source oracle, not a restore executor or authority.

Actual RestoreCoordinator owns target custody and phases. Native callbacks must
authenticate owner-issued records and retain fences through staging, native
verification and cleanup; this static oracle installs none of those interfaces.
"""
from functools import lru_cache
import json
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from pm_backup_snapshot_semantics import (operation_equal, validate_snapshot_resolution,
                                         _callback_errors)
from pm_jujutsu_backup_semantics import jj_backup_verification_failures


@lru_cache(maxsize=1)
def _schemas():
    plans = Path(__file__).resolve().parents[1] / 'Plans'
    schemas = [json.loads((plans / name).read_text()) for name in (
        'backup_restore_system_contracts.schema.json', 'backup_snapshot_result_contracts.schema.json',
        'backup_drill_result_contracts.schema.json', 'jujutsu_integration_contracts.schema.json',
        'source_control_contracts.schema.json')]
    return schemas[2], Registry().with_resources((s['$id'], Resource.from_contents(s)) for s in schemas)


def structural_errors(definition, value):
    schema, registry = _schemas()
    return [e.message for e in Draft202012Validator(
        {'$schema': schema['$schema'], '$ref': schema['$id'] + '#/$defs/' + definition},
        registry=registry, format_checker=FormatChecker()).iter_errors(value)]


def _coverage_equal(a, b):
    return (set(a['selected_family_ids']) == set(b['selected_family_ids']) and
            a['path_selection'] == b['path_selection'] and
            set(a['selected_path_refs']) == set(b['selected_path_refs']))


def backup_drill_semantic_failures(definition, value):
    errors = []
    if definition == 'backup_jj_context_verification_receipt_v2':
        errors += jj_backup_verification_failures(value)
        context = value['verification_context']
        if context['kind'] == 'isolated_drill':
            original = context['original_operation']
            admission = context['target_admission']
            resolution = context['source_resolution']
            errors += backup_drill_semantic_failures('backup_drill_target_admission', admission)
            if not operation_equal(original, admission['original_operation']) or not operation_equal(original, resolution['operation_binding']):
                errors.append('native_context_original_mismatch')
            if resolution['disposition'] != 'resolved' or admission['snapshot_selection'] != resolution['selection']:
                errors.append('native_context_source_mismatch')
            for native_key, target_key in (('execution_host_id', 'host_id'), ('execution_environment_id', 'environment_id')):
                if value['native_toolchain_identity'][native_key] != admission[target_key]:
                    errors.append('native_context_' + target_key)
        return errors
    if definition == 'backup_drill_target_admission':
        original = value['original_operation']
        if original['command_id'] != 'cmd.backup.test_restore':
            return ['wrong_drill_operation']
        selected = original['selected_input']
        if any(value['snapshot_selection'][k] != selected[k] for k in ('repository_id', 'backup_destination_id', 'snapshot_id')):
            errors.append('admission_snapshot_mismatch')
        if value['isolated_destination_ref'] != selected['isolated_destination_ref']:
            errors.append('admission_target_mismatch')
        return errors
    if definition != 'backup_drill_verification_receipt_v2':
        return errors
    original = value['original_operation']
    selected = original['selected_input']
    for key in ('operation_id', 'command_id', 'idempotency_key'):
        if value[key] != original[key]:
            errors.append('receipt_original_' + key)
    resolution = value['source_resolution']
    if not operation_equal(original, resolution['operation_binding']):
        errors.append('source_original_mismatch')
    if any(resolution['selection'][k] != selected[k] for k in ('repository_id', 'backup_destination_id', 'snapshot_id')):
        errors.append('source_selection_mismatch')
    if not _coverage_equal(selected['coverage'], value['requested_coverage']):
        errors.append('requested_coverage_mismatch')
    admission = value['target_admission']
    if admission is not None:
        errors += backup_drill_semantic_failures('backup_drill_target_admission', admission)
        if not operation_equal(original, admission['original_operation']):
            errors.append('target_original_mismatch')
        if value['server_id'] != admission['server_id']:
            errors.append('target_server_mismatch')
        if admission['snapshot_selection'] != resolution['selection']:
            errors.append('target_source_mismatch')
    for label in ('attempted_coverage', 'achieved_coverage'):
        coverage = value[label]
        if coverage['path_selection'] == 'none':
            if coverage['selected_family_ids'] or coverage['selected_path_refs'] or coverage['evidence_refs']:
                errors.append(label + '_nonempty_none')
        elif not coverage['selected_family_ids'] or not coverage['evidence_refs']:
            errors.append(label + '_unproved')
        if coverage['path_selection'] == 'selected_paths' and not coverage['selected_path_refs']:
            errors.append(label + '_empty_paths')
        if coverage['path_selection'] == 'all_paths_in_selected_families' and coverage['selected_path_refs']:
            errors.append(label + '_all_paths_with_selection')
    if not set(value['achieved_coverage']['selected_family_ids']).issubset(value['attempted_coverage']['selected_family_ids']):
        errors.append('achieved_without_attempt')
    achieved, attempted = value['achieved_coverage'], value['attempted_coverage']
    if achieved['path_selection'] == 'all_paths_in_selected_families' and attempted['path_selection'] != 'all_paths_in_selected_families':
        errors.append('achieved_paths_without_attempt')
    if achieved['path_selection'] == 'selected_paths':
        if attempted['path_selection'] == 'none' or (attempted['path_selection'] == 'selected_paths' and
                not set(achieved['selected_path_refs']).issubset(attempted['selected_path_refs'])):
            errors.append('achieved_paths_without_attempt')
    effects = value['effects']
    if len({e['effect_id'] for e in effects}) != len(effects):
        errors.append('duplicate_effect')
    if effects and (admission is None or resolution['disposition'] != 'resolved'):
        errors.append('effects_without_source_target')
    for effect in effects:
        if admission and effect['target_identity_ref'] != admission['target_identity_ref']:
            errors.append('effect_outside_admitted_target')
        if effect['outcome'] == 'completed' and not effect['evidence_refs']:
            errors.append('completed_effect_without_evidence')
    if value['verification_status'] == 'passed':
        if admission is None or resolution['disposition'] != 'resolved':
            errors.append('passed_without_source_target')
        if not _coverage_equal(value['requested_coverage'], value['achieved_coverage']):
            errors.append('passed_without_requested_coverage')
        if not any(e['phase'] == 'isolated_verification' and e['outcome'] == 'completed' for e in effects):
            errors.append('passed_without_isolated_verification')
    if value['cleanup_status'] == 'completed':
        if not value['cleanup_evidence_refs'] or value['residual_artifact_refs']:
            errors.append('cleanup_completion_unproved')
    if value['cleanup_status'] in ('failed', 'pending', 'outcome_unknown'):
        if value['recovery_ref'] is None:
            errors.append('cleanup_obligation_without_recovery')
        if value['operation_status'] == 'completed':
            errors.append('completed_with_cleanup_obligation')
    if value['cleanup_status'] == 'not_needed' and (effects or value['residual_artifact_refs']):
        errors.append('cleanup_not_needed_with_effects')
    if value['operation_status'] == 'completed' and (value['verification_status'] != 'passed' or value['failure_refs']):
        errors.append('operation_completion_unproved')
    if admission is None or resolution['disposition'] == 'unresolved':
        if value['attempted_coverage']['path_selection'] != 'none' or value['achieved_coverage']['path_selection'] != 'none':
            errors.append('coverage_without_source_target')
    return errors


def validate_drill_receipt(original, receipt, *, resolve_record, verify_source_custody,
        verify_target_admission, verify_phase_effects, verify_native_closure,
        verify_cleanup, verify_receipt_scope, check_current_disclosure):
    """Mandatory actual-owner interfaces; never replace with serialized assertions.

    Target callback authenticates topology identity/generation/lease, containment,
    original permissions, FileSafe and cost/network/resource admission. Phase
    callback authenticates original staging/verification effects, phase-time
    admission fences, no live activation, no hooks, and path/family coverage.
    Native callback independently discovers mandatory SCS-014/JJI-008/BRS-021
    and BRS-024..029 closure, validates genuine owner evidence, and rejects
    omitted applicable proof even for narrowly requested coverage. Genuine JJI
    receipts must satisfy their own owner and genuine disjoint live/drill context;
    an unavailable producer cannot be replaced by fabricated live restore records.
    Cleanup callback authenticates final disposition and target-limited effects,
    residuals and recovery ownership. Reconciliation consumes original custody;
    absent custody never authorizes a substitute target or fresh drill.
    verify_receipt_scope authenticates the actual original Server/Project receipt
    scope, including unresolved, catalog and full-Server outcomes. Catalog never
    implies an empty Project set, and source and target scope remain distinct.
    Each callback(original, receipt) returns failure codes; current disclosure
    runs last as well as in source consumption under the native owner's fence.
    """
    errors = structural_errors('backup_operation_binding', original)
    errors += structural_errors('backup_drill_verification_receipt_v2', receipt)
    if errors:
        return ['invalid_shape'] + errors
    if not operation_equal(original, receipt['original_operation']):
        errors.append('original_operation_mismatch')
    errors += backup_drill_semantic_failures('backup_drill_verification_receipt_v2', receipt)
    errors += _callback_errors(verify_receipt_scope, 'receipt_scope', original, receipt)
    errors += validate_snapshot_resolution(original, receipt['source_resolution'],
        resolve_record=resolve_record, verify_source_custody=verify_source_custody,
        check_current_disclosure=check_current_disclosure)
    for callback, label in ((verify_target_admission, 'target_admission'),
                            (verify_phase_effects, 'phase_effects'),
                            (verify_native_closure, 'native_closure'),
                            (verify_cleanup, 'cleanup'),
                            (check_current_disclosure, 'current_disclosure')):
        errors += _callback_errors(callback, label, original, receipt)
    return errors


def validate_jj_context_receipt(receipt, *, verify_native_context, check_current_disclosure):
    """JJ owner authenticates original context/closure, isolated repository and toolchain.

    verify_native_context(receipt) must also apply the complete existing JJI-008
    semantic checks (layout-specific pointer-chain completeness, pinned reads,
    historical-operation/object closure, custody and native result derivation).
    Disjoint context does not weaken any original native verification requirement.
    """
    errors = structural_errors('backup_jj_context_verification_receipt_v2', receipt)
    if errors:
        return ['invalid_shape'] + errors
    errors += backup_drill_semantic_failures('backup_jj_context_verification_receipt_v2', receipt)
    errors += _callback_errors(verify_native_context, 'native_context', receipt)
    errors += _callback_errors(check_current_disclosure, 'current_disclosure', receipt)
    return errors
