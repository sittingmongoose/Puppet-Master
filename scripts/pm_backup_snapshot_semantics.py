"""BRS-030 static joins; no native reader, engine execution or authenticity proof.

Native callers must hold the original owner's custody/currentness fences. The
mandatory callbacks below authenticate original admission, opaque associations,
external commit/manifest bytes and actual achieved engine coverage. Tests mock
them explicitly; passing a test does not install any such authority.
"""
from functools import lru_cache
from copy import deepcopy
import json
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource


@lru_cache(maxsize=1)
def _schemas():
    plans = Path(__file__).resolve().parents[1] / 'Plans'
    source = json.loads((plans / 'backup_restore_system_contracts.schema.json').read_text())
    result = json.loads((plans / 'backup_snapshot_result_contracts.schema.json').read_text())
    registry = Registry().with_resources((s['$id'], Resource.from_contents(s)) for s in (source, result))
    return source, result, registry


def structural_errors(definition, value):
    source, result, registry = _schemas()
    schema = result if definition in result['$defs'] else source
    selected = {'$schema': schema['$schema'], '$ref': schema['$id'] + '#/$defs/' + definition}
    return [e.message for e in Draft202012Validator(selected, registry=registry,
            format_checker=FormatChecker()).iter_errors(value)]


def _callback_errors(callback, label, *args):
    try:
        result = callback(*args)
    except (KeyError, ValueError, TypeError, OSError):
        return [label + '_unavailable']
    if not isinstance(result, list) or not all(isinstance(x, str) and x for x in result):
        return [label + '_invalid_response']
    return [label + ':' + x for x in result]


def operation_equal(left, right):
    """Verify selection is a set; every other original field stays exact."""
    left, right = deepcopy(left), deepcopy(right)
    for value in (left, right):
        if value.get('command_id') == 'cmd.backup.verify':
            selected = value.get('selected_input', {})
            if 'snapshot_ids' in selected:
                selected['snapshot_ids'] = sorted(selected['snapshot_ids'])
    return left == right


def _selection_errors(original, resolution):
    errors = []
    if not operation_equal(resolution['operation_binding'], original):
        errors.append('original_operation_mismatch')
    selected = original['selected_input']
    selection = resolution['selection']
    if original['command_id'] not in ('cmd.backup.verify', 'cmd.backup.test_restore', 'cmd.backup.file.compare'):
        return errors + ['unsupported_source_operation']
    for key in ('repository_id', 'backup_destination_id'):
        if selection[key] != selected[key]:
            errors.append('selection_' + key)
    members = selected.get('snapshot_ids', [selected.get('snapshot_id')])
    if selection['snapshot_id'] not in members:
        errors.append('unrequested_snapshot')
    return errors


def validate_snapshot_resolution(original, resolution, *, resolve_record, verify_source_custody,
                                 check_current_disclosure):
    """Check a genuine owner's output against original records, under native fence.

    resolve_record(kind, opaque_ref) retrieves the actual typed original; kinds
    are backup_repository_binding, backup_run, backup_receipt, backup_manifest.
    Exactly one authentic run OR receipt suffices; a disposed original cannot
    be reconstructed. verify_source_custody(original, resolution, binding,
    origin, manifest, attempt) must authenticate original admission, immutable
    snapshot/ref/attempt/commit associations, manifest bytes and source custody.
    For unresolved output the last four arguments are None, and the callback
    must authenticate the actual failed resolution, not manufacture absence.
    The output descriptor is not a permission token or proof supplied by callers.
    """
    errors = structural_errors('backup_operation_binding', original)
    errors += structural_errors('backup_snapshot_resolution', resolution)
    if errors:
        return ['invalid_shape'] + errors
    errors += _selection_errors(original, resolution)
    return errors + validate_snapshot_source_records(original, resolution,
        resolve_record=resolve_record, verify_source_custody=verify_source_custody,
        check_current_disclosure=check_current_disclosure)


def validate_snapshot_source_records(original, resolution, *, resolve_record,
                                     verify_source_custody, check_current_disclosure):
    """Shared owner-record joins AFTER caller validates its own binding/selection.

    This helper grants no action admission. Each caller must validate its exact
    versioned request and resolution shapes and bind the selected snapshot first.
    It deliberately does not fabricate an admitted verification operation.
    """
    errors = []
    if resolution['disposition'] == 'unresolved':
        errors += _callback_errors(verify_source_custody, 'source_custody',
                                   original, resolution, None, None, None, None)
        return errors + _callback_errors(check_current_disclosure, 'current_disclosure', original, resolution)
    d = resolution['resolved_source']
    s = resolution['selection']
    try:
        binding = resolve_record('backup_repository_binding', d['repository_binding_id'])
        origin = resolve_record(d['origin_kind'], d['origin_ref'])
        manifest = resolve_record('backup_manifest', d['manifest_ref'])
    except (KeyError, ValueError, TypeError, OSError):
        return errors + ['source_unavailable']
    for kind, record in [('backup_repository_binding', binding), (d['origin_kind'], origin), ('backup_manifest', manifest)]:
        found = structural_errors(kind, record)
        if found:
            errors += ['invalid_' + kind] + found
    if any(e.startswith('invalid_') for e in errors):
        return errors
    def equal(a, b, label):
        if a != b:
            errors.append(label)
    equal(binding['repository_id'], s['repository_id'], 'repository_mismatch')
    equal(binding['repository_binding_id'], d['repository_binding_id'], 'binding_mismatch')
    if s['backup_destination_id'] not in binding['destination_binding_ids']:
        errors.append('destination_not_bound')
    for key in ('server_id', 'recovery_set_id', 'boundary_kind', 'project_id', 'project_vault_id'):
        equal(d[key], binding[key], 'descriptor_' + key)
    for key in ('backup_id', 'capture_set_id', 'backup_type', 'server_id'):
        equal(origin[key], manifest[key], 'origin_manifest_' + key)
    for key in ('project_ids', 'project_vault_ids'):
        equal(set(origin[key]), set(manifest[key]), 'origin_manifest_' + key)
    for key in ('backup_id', 'capture_set_id', 'manifest_id', 'manifest_sha256', 'server_id', 'recovery_set_id'):
        equal(d[key], manifest[key], 'descriptor_manifest_' + key)
    equal(d['backup_run_id'], origin['backup_run_id'], 'backup_run_mismatch')
    if d['origin_kind'] == 'backup_run':
        if d['repository_binding_id'] not in origin['repository_binding_ids']:
            errors.append('run_binding_missing')
        equal(origin['recovery_set_id'], manifest['recovery_set_id'], 'run_recovery_set')
        try:
            equal(resolve_record('backup_manifest', origin['manifest_ref']), manifest, 'run_manifest_resolution')
        except (KeyError, ValueError, TypeError, OSError):
            errors.append('run_manifest_unavailable')
    else:
        equal(origin['manifest_id'], manifest['manifest_id'], 'receipt_manifest')
    for source in (origin, manifest):
        if d['repository_snapshot_ref'] not in source['repository_snapshot_refs']:
            errors.append('snapshot_ref_missing')
    attempts = [a for a in origin['destination_attempts'] if a['attempt_id'] == d['destination_attempt_id']]
    if len(attempts) != 1:
        return errors + ['attempt_missing_or_ambiguous']
    attempt = attempts[0]
    for key in ('repository_id', 'backup_destination_id'):
        equal(attempt[key], s[key], 'attempt_' + key)
    equal(attempt['remote_snapshot_id'], s['snapshot_id'], 'attempt_snapshot')
    equal(attempt['commit_receipt_ref'], d['commit_receipt_ref'], 'attempt_commit')
    if attempt['upload_state'] != 'committed' or not attempt['terminal_at_utc'] or attempt['failure_ref'] is not None:
        errors.append('attempt_not_committed')
    boundaries = manifest['consistency_boundaries']
    if binding['boundary_kind'] == 'project':
        if binding['project_id'] not in manifest['project_ids'] or binding['project_vault_id'] not in manifest['project_vault_ids']:
            errors.append('project_membership')
        matched = [b for b in boundaries if b['boundary_kind'] == 'project_vault' and
                   all(b[k] == binding[k] for k in ('server_id', 'project_id', 'project_vault_id'))]
    else:
        matched = [b for b in boundaries if b['boundary_kind'] == 'server_catalog' and
                   b['server_id'] == binding['server_id'] and b['catalog_revision'] == origin['catalog_revision']]
    if not matched:
        errors.append('consistency_boundary_missing')
    if 'capture_set_id' in original['selected_input']:
        equal(original['selected_input']['capture_set_id'], d['capture_set_id'], 'selected_capture_mismatch')
    errors += _callback_errors(verify_source_custody, 'source_custody', original,
                              resolution, binding, origin, manifest, attempt)
    errors += _callback_errors(check_current_disclosure, 'current_disclosure', original, resolution)
    return errors


def backup_snapshot_semantic_failures(definition, value):
    """Intrinsic consistency only. Does not authenticate retained or external data."""
    if definition == 'backup_snapshot_resolution':
        return _selection_errors(value['operation_binding'], value)
    if definition != 'backup_verification_receipt_v2':
        return []
    errors = []
    original = value['original_operation']
    selected = original['selected_input']
    for key in ('operation_id', 'command_id', 'idempotency_key'):
        if value[key] != original[key]:
            errors.append('receipt_original_' + key)
    for key in ('repository_id', 'backup_destination_id', 'requested_scope'):
        if value[key] != selected[key]:
            errors.append('receipt_selection_' + key)
    if set(value['selected_snapshot_ids']) != set(selected['snapshot_ids']):
        errors.append('receipt_selected_set')
    ids = [o['resolution']['selection']['snapshot_id'] for o in value['outcomes']]
    if len(ids) != len(set(ids)) or set(ids) != set(selected['snapshot_ids']):
        errors.append('outcomes_not_exact_selected_set')
    levels = {'structural': 1, 'sampled_data_read': 2, 'full_data_read': 3, None: 0}
    for outcome in value['outcomes']:
        errors += _selection_errors(original, outcome['resolution'])
        if outcome['requested_scope'] != selected['requested_scope']:
            errors.append('outcome_requested_scope')
        if outcome['status'] == 'passed':
            if levels[outcome['achieved_scope']] < levels[outcome['requested_scope']]:
                errors.append('insufficient_achieved_scope')
            if any(c['status'] != 'passed' for c in outcome['checks']):
                errors.append('passed_with_unpassed_checks')
        if outcome['resolution']['disposition'] == 'resolved':
            if outcome['resolution']['resolved_source']['server_id'] != value['server_id']:
                errors.append('receipt_server_mismatch')
    passed = all(o['status'] == 'passed' for o in value['outcomes'])
    if (value['status'] == 'passed') != passed:
        errors.append('selected_set_pass_mismatch')
    if value['status'] == 'passed' and value['failure_refs']:
        errors.append('passed_with_failures')
    return errors


def validate_verification_receipt(original, receipt, *, resolve_record,
                                  verify_source_custody, verify_engine_outcome,
                                  verify_receipt_scope, check_current_disclosure):
    """Owner must authenticate actual version-pinned engine scope/coverage evidence.

    verify_engine_outcome(original, outcome) checks the genuine result including
    failure/cancellation, check coverage and counts, not just evidence-ref presence.
    verify_receipt_scope(original, receipt) authenticates the actual original
    Server/Project receipt scope, including unresolved members and catalog/full
    Server captures. Catalog does not imply an empty Project set, and a foreign
    Project cannot be introduced by copying a receipt. check_current_disclosure
    rechecks current authority after engine/source consumption before disclosure.
    Caller authenticates the actual retained receipt and original before use.
    """
    errors = structural_errors('backup_operation_binding', original)
    errors += structural_errors('backup_verification_receipt_v2', receipt)
    if errors:
        return ['invalid_shape'] + errors
    if not operation_equal(original, receipt['original_operation']):
        errors.append('receipt_original_mismatch')
    errors += backup_snapshot_semantic_failures('backup_verification_receipt_v2', receipt)
    errors += _callback_errors(verify_receipt_scope, 'receipt_scope', original, receipt)
    for outcome in receipt['outcomes']:
        errors += validate_snapshot_resolution(original, outcome['resolution'],
                    resolve_record=resolve_record, verify_source_custody=verify_source_custody,
                    check_current_disclosure=check_current_disclosure)
        errors += _callback_errors(verify_engine_outcome, 'engine_outcome', original, outcome)
    errors += _callback_errors(check_current_disclosure, 'current_disclosure', original, receipt)
    return errors
