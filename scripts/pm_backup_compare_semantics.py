"""F-085/BRS-030 compare joins; pure oracle, never an installed handler.

Native resolvers return authentic original records under the real owners' read,
path, content-lifetime and concurrency fences. Mandatory proof callbacks resolve
authority and actual pinned content; JSON assertions cannot implement them.
The explicit fixture adapter below tests relations only. Runtime proof NOT_RUN.
"""
from functools import lru_cache
import json
from pathlib import Path

from jsonschema import Draft202012Validator
from referencing import Registry, Resource


@lru_cache(maxsize=1)
def _schemas():
    root = Path(__file__).resolve().parents[1] / 'Plans'
    schemas = [json.loads((root / name).read_text()) for name in (
        'backup_compare_result_contracts.schema.json',
        'backup_restore_system_contracts.schema.json',
        'source_control_contracts.schema.json')]
    registry = Registry().with_resources((s['$id'], Resource.from_contents(s)) for s in schemas)
    return schemas[0], registry


def structural_errors(definition, value):
    schema, registry = _schemas()
    selected = {'$schema': schema['$schema'], '$ref': schema['$id'] + '#/$defs/' + definition}
    return [e.message for e in Draft202012Validator(selected, registry=registry).iter_errors(value)]


def validate_compare_result(operation_id, *, resolve_original_operation,
        resolve_result, resolve_read, resolve_comparison, resolve_snapshot,
        validate_snapshot, verify_original_admission, verify_target_resolution,
        verify_content_custody, verify_comparison, verify_result_facts,
        check_current_disclosure):
    """Resolve original evidence without reexecution or current-target fallback.

    resolve_read(kind, ref) handles source/target owner outputs; resolve_snapshot
    returns the shared backup_snapshot_resolution. validate_snapshot must call
    the snapshot companion's validate_snapshot_resolution with genuine owner
    record resolvers/custody checks. verify_target_resolution authenticates the
    exact selected File/buffer/SCM identity/version, native context and topology.
    verify_content_custody(kind, original, read) pins actual representation and
    bytes/view, canonical-path authorization and evidence. verify_comparison
    authenticates execution over BOTH actual contents; equal refs do not suffice.
    verify_result_facts also verifies original focus, effects and no mutation.
    Callbacks return lists of failure codes; malformed/missing responses fail.
    All calls and final disclosure run under the integrating owners' fences.
    """
    failures = []

    def proof(callback, code, *args):
        try:
            answer = callback(*args)
        except (KeyError, ValueError, TypeError, OSError):
            failures.append(code + '_unavailable')
            return
        if not isinstance(answer, list) or any(not isinstance(x, str) or not x for x in answer):
            failures.append(code + '_invalid_response')
        elif answer:
            failures.append(code)

    def equal(a, b, code):
        if a != b:
            failures.append(code)

    try:
        original = resolve_original_operation(operation_id)
        result = resolve_result(operation_id)
    except (KeyError, ValueError, TypeError, OSError):
        return ['backup_compare_original_unavailable']
    if structural_errors('binding', original) or structural_errors('backup_browse_operation_v3', result):
        return ['backup_compare_record_schema']
    equal(original['operation_id'], operation_id, 'backup_compare_operation')
    equal(result['operation_binding'], original, 'backup_compare_operation')
    equal(result['return_route_ref'], original['return_route_ref'], 'backup_compare_return_route')
    proof(check_current_disclosure, 'backup_compare_disclosure', original, result)
    if failures:
        return sorted(set(failures))
    proof(verify_original_admission, 'backup_compare_original_admission', original)
    if failures:
        return sorted(set(failures))
    selected = original['selected_input']
    reads = {}
    for kind in ('source', 'target'):
        reference = result[kind + '_read_ref']
        if reference is None:
            continue
        try:
            read = resolve_read(kind, reference)
        except (KeyError, ValueError, TypeError, OSError):
            failures.append('backup_compare_' + kind + '_unavailable')
            continue
        if structural_errors(kind + '_read_result', read):
            failures.append('backup_compare_' + kind + '_schema')
            continue
        reads[kind] = read
        equal(read['read_ref'], reference, 'backup_compare_read_identity')
        equal(read['operation_binding'], original, 'backup_compare_operation')
        if kind == 'source':
            equal(read['selected_path_ref'], selected['selected_path_ref'], 'backup_compare_source_path')
            equal(read['capture_set_id'], selected['capture_set_id'], 'backup_compare_capture')
            try:
                snapshot = resolve_snapshot(read['snapshot_resolution_ref'])
                proof(validate_snapshot, 'backup_compare_snapshot_custody', original, snapshot)
                equal(snapshot['operation_binding'], original, 'backup_compare_operation')
                equal(snapshot['selection'], {k: selected[k] for k in (
                    'repository_id', 'backup_destination_id', 'snapshot_id')}, 'backup_compare_snapshot')
                if snapshot['disposition'] != 'resolved':
                    failures.append('backup_compare_snapshot_unresolved')
                else:
                    equal(snapshot['resolved_source']['capture_set_id'], read['capture_set_id'], 'backup_compare_capture')
            except (KeyError, ValueError, TypeError, OSError):
                failures.append('backup_compare_snapshot_unavailable')
            proof(verify_content_custody, 'backup_compare_source_custody', kind, original, read)
        else:
            equal(read['target_ref'], selected['target_ref'], 'backup_compare_target_selection')
            equal(read['target_revision'], selected['target_revision'], 'backup_compare_target_revision')
            proof(verify_target_resolution, 'backup_compare_target_resolution', original, read)
            if any(code.startswith('backup_compare_target_resolution') for code in failures):
                continue
            payload = read['resolved']
            if payload is None:
                if result['status'] == 'completed' or 'target_read' in result['read_effects']:
                    failures.append('backup_compare_target_unresolved')
                continue
            identity = payload['identity']
            version_field = {'file': 'file_version', 'editor_buffer': 'buffer_version',
                             'source_control': 'content_version'}[identity['target_kind']]
            equal(identity[version_field], payload['content']['content_version'], 'backup_compare_content_version')
            equal(payload['topology']['server_id'], selected['target_server_id'], 'backup_compare_topology')
            equal(payload['evidence']['filesafe_ref'], selected['filesafe_decision_ref'], 'backup_compare_filesafe')
            if identity['target_kind'] == 'source_control':
                context = identity['repository_context']
                for field, native in (
                    ('project_id', 'project_id'), ('server_id', 'project_home_server_id'),
                    ('host_id', 'execution_host_id'), ('environment_id', 'execution_environment_id'),
                    ('source_location_id', 'source_location_id'), ('topology_generation', 'topology_generation')):
                    equal(payload['topology'][field], context['lineage'][native], 'backup_compare_native_topology')
                if context['scm_backend'] == 'jujutsu':
                    equal(context['workspace_id'], context['revision']['workspace_id'], 'backup_compare_workspace')
            proof(verify_content_custody, 'backup_compare_target_custody', kind, original, read)
    effects = set(result['read_effects'])
    for kind in ('source', 'target'):
        if kind + '_read' in effects and kind not in reads:
            failures.append('backup_compare_effect_without_read')
    if 'comparison_attempted' in effects and not {'source_read', 'target_read'} <= effects:
        failures.append('backup_compare_attempt_without_operands')
    if result['status'] == 'completed' and len(reads) == 2 and reads['target']['resolved'] is not None:
        try:
            comparison = resolve_comparison(result['comparison_evidence_ref'])
            if structural_errors('comparison_evidence', comparison):
                failures.append('backup_compare_evidence_schema')
            else:
                for field, expected in (
                    ('evidence_ref', result['comparison_evidence_ref']), ('operation_id', operation_id),
                    ('source_read_ref', result['source_read_ref']), ('target_read_ref', result['target_read_ref']),
                    ('source_content', reads['source']['content']),
                    ('target_content', reads['target']['resolved']['content'])):
                    equal(comparison[field], expected, 'backup_compare_evidence_binding')
                proof(verify_comparison, 'backup_compare_execution', original, reads['source'], reads['target'], comparison)
        except (KeyError, ValueError, TypeError, OSError):
            failures.append('backup_compare_evidence_unavailable')
    proof(verify_result_facts, 'backup_compare_result_facts', original, result, reads)
    proof(check_current_disclosure, 'backup_compare_disclosure', original, result)
    return sorted(set(failures))


def fixture_dependencies(value):
    """Explicit static doubles, no owner/permission/byte/race proof."""
    original = value['original_operation']
    selected = original['selected_input']

    def read(kind, ref):
        record = value[kind + '_read']
        if record is None or record['read_ref'] != ref:
            raise KeyError(ref)
        return record

    return dict(resolve_original_operation=lambda _: original,
        resolve_result=lambda _: value['result'], resolve_read=read,
        resolve_comparison=lambda _: value['comparison'],
        resolve_snapshot=lambda _: {'operation_binding': original,
            'selection': {k: selected[k] for k in ('repository_id', 'backup_destination_id', 'snapshot_id')},
            'disposition': 'resolved', 'resolved_source': {'capture_set_id': selected['capture_set_id']}},
        validate_snapshot=lambda *args: [], verify_original_admission=lambda *args: [],
        verify_target_resolution=lambda *args: [], verify_content_custody=lambda *args: [],
        verify_comparison=lambda *args: [], verify_result_facts=lambda *args: [],
        check_current_disclosure=lambda *args: [])


def backup_compare_semantic_failures(definition_name, value):
    if definition_name != 'backup_compare_validation_input':
        return []
    if structural_errors(definition_name, value):
        return ['backup_compare_validation_schema']
    return validate_compare_result(value['original_operation']['operation_id'], **fixture_dependencies(value))
