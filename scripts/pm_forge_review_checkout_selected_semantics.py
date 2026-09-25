"""DL-097 static original/fence/effect/response joins; no native checkout engine.

Resolvers and proof adapters must authenticate actual immutable owner inputs and
span current permission/redaction/disclosure fences. Fixture doubles do neither.
No silent placement default, dirty discard, autostash, mutation-safety waiver,
review-open substitution, or generic push/publication follows from validation.
"""
from copy import deepcopy
from datetime import datetime
from functools import lru_cache
import json
import os
from pathlib import Path
import sys
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
CANON = Path(os.environ.get('PM_CANON_ROOT', ROOT))
sys.path.insert(0, str(CANON / 'scripts'))
from pm_full_thread_semantics import full_thread_semantic_failures, command_outcome_binding_failures
from pm_ui_command_response import replay_failures, owner_result_digest
COMMAND = 'cmd.forge.review.checkout'
SCHEMA = 'Plans/forge_review_checkout_selected_contracts.schema.json'
BINDING = {'path': SCHEMA, 'json_pointer': '#/$defs/result', 'schema_id': 'pm.forge.review_checkout_selected.result.v1'}


@lru_cache(maxsize=1)
def schemas():
    names = [SCHEMA, 'Plans/forge_integration_contracts.schema.json', 'Plans/full_thread_runtime_contracts.schema.json',
             'Plans/source_control_contracts.schema.json', 'Plans/ui_command_response.schema.json', 'Plans/shared_runtime_command_contracts.schema.json']
    docs = {name: json.loads(((ROOT if name == SCHEMA else CANON) / name).read_text()) for name in names}
    return docs, Registry().with_resources((s['$id'], Resource.from_contents(s)) for s in docs.values())


def shape(definition, value, filename=SCHEMA):
    docs, registry = schemas()
    s = docs[filename]
    selected = s if definition is None else {'$ref': s['$id'] + '#/$defs/' + definition}
    return [e.message for e in Draft202012Validator(selected, registry=registry, format_checker=FormatChecker()).iter_errors(value)]


def instant(s):
    return datetime.fromisoformat(s.replace('Z', '+00:00'))


def validate_checkout_result(request, result, original_binding_ref, outcome_ref, response_ref, delivery_return_context, *,
                             resolve_record, canonical_digest, verify_original_admission,
                             verify_review_authority, verify_checkout_effect, check_current_disclosure):
    """Validate exact original admission plus actual selected review checkout and UI outcome.

    Every dependency is mandatory. Proof functions return list[str], never truthy
    caller facts. Native dependencies authenticate originals, review/revision
    membership, actual SCM handoff/effect, safe error projection and present access.
    """
    inputs = (request, result, delivery_return_context)
    saved = deepcopy(inputs)
    request, result, delivery = deepcopy(saved)
    errors = []
    snapshots = []
    cache = {}

    def read(ref, definition, filename=SCHEMA):
        if ref not in cache:
            actual = resolve_record(ref)
            snapshots.append((actual, deepcopy(actual)))
            cache[ref] = deepcopy(actual)
        value = deepcopy(cache[ref])
        if shape(definition, value, filename):
            raise ValueError('shape:' + str(definition))
        return value

    def proof(name, fn, *args):
        prior = deepcopy(args)
        value = fn(*args)
        if type(value) is not list or any(type(x) is not str for x in value):
            errors.append(name + '_invalid_proof')
        else:
            errors.extend(name + ':' + x for x in value)
        if args != prior:
            errors.append('proof_input_mutated')

    def digest(value):
        copy = deepcopy(value)
        d = canonical_digest(copy)
        if copy != value:
            errors.append('digest_input_mutated')
        if not isinstance(d, str) or len(d) != 64 or any(c not in '0123456789abcdef' for c in d):
            raise ValueError('digest')
        return d

    try:
        if shape('request', request) or shape('result', result):
            return ['input_shape']
        a = request['authority']
        s = request['selection']
        r = result['owner_result']
        forge = 'Plans/forge_integration_contracts.schema.json'
        scm = 'Plans/source_control_contracts.schema.json'
        original = read(original_binding_ref, 'dispatch_binding')
        actual_request = read(result['original_request_ref'], 'request')
        o = read(outcome_ref, 'CommandOutcomeRecord', 'Plans/full_thread_runtime_contracts.schema.json')
        response = read(response_ref, None, 'Plans/ui_command_response.schema.json')
        if read(o['owner_result_ref'], 'result') != result:
            errors.append('actual_result')
        if actual_request != request or original['arguments'] != request or original['request_ref'] != result['original_request_ref']:
            errors.append('original_request')
        if shape('delivery_return_context', delivery) or delivery != original['return_context']:
            errors.append('original_return')
        errors += full_thread_semantic_failures('IdentityEnvelope', original['identity'])
        errors += full_thread_semantic_failures('CommandOutcomeRecord', o)
        errors += command_outcome_binding_failures(response, o, outcome_ref)
        expected = {'accepted': ('accepted', {'pending'}), 'acknowledged': ('accepted', {'pending'}),
                    'executing': ('accepted', {'pending'}), 'succeeded': ('accepted', {'succeeded'}),
                    'failed': ('accepted', {'failed'}), 'cancelled': ('accepted', {'cancelled'}),
                    'rejected': ('rejected', {None}), 'terminal_unknown': ('accepted', {'recovery_required'})}[o['outcome']]
        if response['ack_status'] != expected[0] or response['result_status'] not in expected[1]:
            errors.append('response_outcome')
        expected_receipts = (None, o['acknowledgement_receipt_ref']) if o['outcome'] in ('accepted', 'acknowledged', 'executing') else (o['result_receipt_ref'],)
        if response['receipt_ref'] not in expected_receipts:
            errors.append('response_receipt')
        if response['event_refs'] != r['event_refs']:
            errors.append('response_events')
        if response['response_kind'] != 'owner_operation' or response['owner_result_schema_ref'] != BINDING or o['owner_result_schema_ref'] != BINDING:
            errors.append('response_binding')
        if response['request_ref'] != original['request_ref'] or response['owner_result_ref'] != o['owner_result_ref']:
            errors.append('response_original')
        if response['command_id'] != COMMAND or o['command_id'] != COMMAND:
            errors.append('response_command')
        if any(v != original['identity'] for v in (o['identity'], response['owner_identity'])):
            errors.append('original_identity')
        if a['command_instance_id'] != original['identity'].get('command_instance_id') or response['command_instance_id'] != a['command_instance_id']:
            errors.append('original_instance')
        if r['operation_id'] != original['identity']['operation_id']:
            errors.append('original_operation')
        if (response['original_dispatch_id'] if response['replayed'] else response['dispatch_id']) != original['dispatch_id']:
            errors.append('original_dispatch')
        for k in ('dispatch_frame_id', 'target_generation', 'payload_sha256', 'idempotency_key'):
            if o[k] != original[k]:
                errors.append('original_' + k)
        if original['payload_sha256'] != digest(request) or o['owner_result_sha256'] != digest(result):
            errors.append('original_digest')
        if original['idempotency_key'] != a['idempotency_key'] or original['permission_snapshot_ref'] != a['permission']['permission_snapshot_ref']:
            errors.append('original_authority')
        if not instant(a['requested_at_utc']) <= instant(original['accepted_at_utc']) <= instant(r['completed_at_utc']) <= instant(o['observed_at']):
            errors.append('original_time')
        if instant(response['ts']) < instant(r['completed_at_utc']):
            errors.append('response_before_result')
        actual_error = projection = None
        if r['error'] is None:
            if o['error_ref'] is not None or response['error'] is not None or result['error_projection_ref'] is not None:
                errors.append('error_presence')
        else:
            actual_error = read(o['error_ref'], 'command_error_record', forge)
            if actual_error['error'] != r['error'] or any(actual_error[k] != a[k] for k in ('command_id', 'command_instance_id', 'provider', 'repository_binding_ref')):
                errors.append('actual_owner_error')
            projection = read(result['error_projection_ref'], 'error_projection')
            if projection['projection_id'] != result['error_projection_ref'] or projection['owner_error_ref'] != o['error_ref'] or projection['original_request_ref'] != original['request_ref'] or projection['identity'] != original['identity']:
                errors.append('error_projection_source')
            if projection['ui_error'] != response['error']:
                errors.append('error_projection_value')
            if projection['return_context'] != original['return_context'] or projection['return_context'] != delivery:
                errors.append('error_projection_caller')
            if not instant(a['requested_at_utc']) <= instant(actual_error['recorded_at_utc']) <= instant(r['completed_at_utc']):
                errors.append('owner_error_time')
            if not instant(actual_error['recorded_at_utc']) <= instant(projection['recorded_at_utc']) <= instant(o['observed_at']):
                errors.append('error_projection_time')
        # Local-write authority: checkout mutates a local workspace, never a remote review.
        if a['permission']['scope'] != 'local_mutation':
            errors.append('checkout_authority')
        if a['file_safe_decision_ref'] is None:
            errors.append('checkout_filesafe_missing')
        if a['currentness']['mutation_safety'] != 'verified' or a['currentness']['state'] != 'current' or a['currentness']['direct_revalidation_ref'] is None:
            errors.append('checkout_mutation_safety')
        if a['effective_authority_role'] != 'authority':
            errors.append('checkout_effective_authority')
        if r['observable_work_id'] != a['observable_work_id']:
            errors.append('original_work_reference')
        binding = read(a['repository_binding_ref'], 'repository_binding', forge)
        if binding['binding_id'] != a['repository_binding_ref'] or binding['binding_generation'] != a['expected_binding_generation']:
            errors.append('repository_binding_generation')
        if any(binding[k] != a[k] for k in ('provider', 'provider_variant', 'normalized_host', 'account_id', 'repo_id')):
            errors.append('repository_binding_identity')
        if binding['provider_repository_id'] != a['target']['provider_repository_id']:
            errors.append('repository_identity')
        for k in ('command_id', 'command_instance_id', 'provider', 'repository_binding_ref', 'expected_binding_generation', 'automation_binding_ref', 'expected_automation_binding_generation'):
            if (k in r, r.get(k)) != (k in a, a.get(k)):
                errors.append('result_' + k)
        if r['event_refs']:
            errors.append('unadmitted_event_effect')
        receipt = None
        if r['receipt_ref'] is not None:
            receipt = read(r['receipt_ref'], 'command_receipt', forge)
            if receipt['receipt_id'] != r['receipt_ref']:
                errors.append('receipt_identity')
            for k in ('command_id', 'command_instance_id', 'provider', 'repository_binding_ref', 'expected_binding_generation', 'automation_binding_ref', 'expected_automation_binding_generation', 'requested_authority_role', 'effective_authority_role', 'credential_or_grant_ref', 'idempotency_key'):
                if (k in receipt, receipt.get(k)) != (k in a, a.get(k)):
                    errors.append('receipt_' + k)
            for k in ('operation_id', 'outcome', 'observable_work_id', 'completed_at_utc', 'event_refs'):
                if receipt[k] != r[k]:
                    errors.append('receipt_' + k)
            if receipt['recovery_actions'] != r['recovery_action_ids'] or receipt['review_revision_ref'] != a['target']['review_revision_ref']:
                errors.append('receipt_context')
        for key in ('provider_review_id', 'review_revision_ref'):
            if s[key] != a['target'][key]:
                errors.append('selected_' + key)
        if a['target']['thread_id'] is not None:
            errors.append('invented_original_thread')
        if a['target']['target_kind'] != 'review':
            errors.append('checkout_target_kind')
        if a['target']['source_control_handoff_ref'] != s['checkout_preview_ref']:
            errors.append('checkout_handoff_binding')
        revision = read(s['review_revision_ref'], 'review_revision', forge)
        if revision['review_revision_id'] != s['review_revision_ref']:
            errors.append('revision_identity')
        if revision['evidence_state'] != 'current' or not revision['contents_complete']:
            errors.append('original_revision_not_current_complete')
        if revision['provider_review_id'] != s['provider_review_id'] or revision['provider'] != a['provider'] or revision['repository_binding_ref'] != a['repository_binding_ref']:
            errors.append('revision_review_scope')
        # SCM handoff qualification through the existing neutral authority.
        context = read(s['repository_context_ref'], 'repository_context', scm)
        if context['scm_backend'] != s['scm_backend']:
            errors.append('checkout_backend_mismatch')
        if context['repo_id'] != a['repo_id']:
            errors.append('checkout_repo_mismatch')
        if context['forge_binding']['binding_ref'] != a['repository_binding_ref'] or context['forge_binding']['forge_provider'] != a['provider']:
            errors.append('checkout_forge_binding')
        if original['identity'].get('source_location_id') is None or original['identity']['source_location_id'] != context['lineage']['source_location_id']:
            errors.append('checkout_source_location')
        if s['expected_revision'].get('kind') != ('git' if s['scm_backend'] == 'git' else 'jujutsu'):
            errors.append('checkout_revision_backend')
        if context['revision'] != s['expected_revision']:
            errors.append('checkout_expected_revision')
        preview = read(s['checkout_preview_ref'], 'review_checkout_preview', scm)
        if preview['preview_id'] != s['checkout_preview_ref']:
            errors.append('preview_identity')
        for k in ('repository_context_ref', 'scm_backend', 'placement', 'provider_review_id', 'review_revision_ref', 'expected_revision'):
            if preview[k] != s[k]:
                errors.append('preview_' + k)
        if preview['command_id'] != COMMAND or preview['command_instance_id'] != a['command_instance_id']:
            errors.append('preview_command_instance')
        try:
            if digest(preview) != s['checkout_preview_digest']:
                errors.append('preview_digest')
        except ValueError:
            errors.append('preview_digest')
        if preview['repo_id'] != context['repo_id']:
            errors.append('preview_repo')
        if preview['source_workspace_id'] != context['workspace_id']:
            errors.append('preview_source_workspace')
        if preview['source_topology_generation'] != context['lineage']['topology_generation']:
            errors.append('preview_topology')
        if preview['before_revision'] != context['revision']:
            errors.append('preview_before_revision')
        want_kind = 'git_worktree' if s['scm_backend'] == 'git' else 'jujutsu_workspace'
        if preview['target_workspace_kind'] != want_kind:
            errors.append('preview_target_kind')
        if s['placement'] == 'current_workspace':
            if preview['target_workspace_id'] != context['workspace_id']:
                errors.append('preview_current_target')
        else:
            if preview['target_workspace_id'] == context['workspace_id']:
                errors.append('preview_separate_target')
        if preview['before_revision'].get('kind') != s['expected_revision'].get('kind') or preview['proposed_revision'].get('kind') != s['expected_revision'].get('kind'):
            errors.append('preview_revision_backend')
        if preview['permission_snapshot_ref'] != a['permission']['permission_snapshot_ref']:
            errors.append('preview_permission')
        if preview['file_safe_decision_ref'] != a['file_safe_decision_ref']:
            errors.append('preview_filesafe')
        # The preview lease fences the TARGET workspace; the source-context lease is revalidated separately below.
        lease = read(preview['writer_lease_ref'], 'writer_lease', scm)
        if lease['lease_id'] != preview['writer_lease_ref']:
            errors.append('lease_identity')
        if lease['repo_id'] != context['repo_id'] or lease['workspace_id'] != preview['target_workspace_id'] or lease['scm_backend'] != s['scm_backend']:
            errors.append('lease_scope')
        if lease['generation'] != preview['writer_lease_generation'] or lease['epoch'] != preview['writer_lease_epoch']:
            errors.append('lease_generation')
        if lease['state'] != 'active' or not instant(lease['acquired_at_utc']) <= instant(original['accepted_at_utc']) < instant(lease['expires_at_utc']):
            errors.append('lease_current')
        source_lease = read(context['writer_lease_ref'], 'writer_lease', scm)
        if source_lease['lease_id'] != context['writer_lease_ref']:
            errors.append('source_lease_identity')
        if source_lease['repo_id'] != context['repo_id'] or source_lease['workspace_id'] != context['workspace_id'] or source_lease['scm_backend'] != s['scm_backend']:
            errors.append('source_lease_scope')
        if source_lease['state'] != 'active' or not instant(source_lease['acquired_at_utc']) <= instant(original['accepted_at_utc']) < instant(source_lease['expires_at_utc']):
            errors.append('source_lease_current')
        if s['placement'] == 'separate_workspace' and preview['writer_lease_ref'] == context['writer_lease_ref']:
            errors.append('target_reuses_source_lease')
        if not instant(preview['issued_at_utc']) <= instant(a['requested_at_utc']):
            errors.append('preview_time')
        effect_paths = [e['path'] for e in preview['effects']]
        if len(effect_paths) != len(set(effect_paths)):
            errors.append('preview_effect_duplicate')
        if not set(preview['dirty_paths']) <= {e['path'] for e in preview['effects'] if e['disposition'] == 'preserved'}:
            errors.append('preview_dirty_not_preserved')
        if any(c['state'] == 'unresolved' for c in preview['conflicts']) and preview['qualification'] == 'qualified':
            errors.append('preview_conflict_qualified')
        if preview['qualification'] != 'qualified' or preview['currentness_state'] != 'current':
            preview_admitted = False
        else:
            preview_admitted = True
        observation = None
        scm_receipt = None
        if r['terminal_provider_result_ref'] is not None and r['terminal_provider_result_ref'] != result['observation_ref']:
            errors.append('terminal_observation_reference')
        if result['observation_ref'] is not None:
            observation = read(result['observation_ref'], 'observation')
            if observation['selection'] != s or observation['original_request_ref'] != original['request_ref'] or observation['command_instance_id'] != a['command_instance_id'] or observation['operation_id'] != r['operation_id']:
                errors.append('observation_original')
            if observation['target_ref'] != r['target_ref'] or observation['provider'] != a['provider'] or observation['repository_binding_ref'] != a['repository_binding_ref']:
                errors.append('observation_target')
            if not instant(original['accepted_at_utc']) <= instant(observation['observed_at_utc']) <= instant(r['completed_at_utc']):
                errors.append('observation_time')
            if observation['target_workspace_id'] != preview['target_workspace_id'] or observation['target_workspace_kind'] != preview['target_workspace_kind']:
                errors.append('observation_target_workspace')
            if observation['provider_receipt_ref'] is not None:
                errors.append('checkout_provider_effect_forbidden')
            dirty = observation['dirty_state']
            if dirty['before_snapshot_sha256'] != preview['dirty_snapshot_sha256']:
                errors.append('dirty_before_mismatch')
            if not dirty['preserved'] or dirty['discarded_paths'] or dirty['autostash_observed']:
                errors.append('checkout_dirty_discarded')
            if dirty['after_snapshot_sha256'] != dirty['before_snapshot_sha256']:
                errors.append('dirty_snapshot_changed')
            actual_paths = [e['path'] for e in observation['actual_effects']]
            if len(actual_paths) != len(set(actual_paths)):
                errors.append('observation_effect_duplicate')
            if set(actual_paths) != set(effect_paths):
                errors.append('observation_effect_scope')
            if observation['outcome'] == 'checked_out':
                if observation['effect_state'] != 'known_applied':
                    errors.append('checked_out_without_effect')
                if observation['actual_effects'] != preview['effects']:
                    errors.append('checked_out_effect_mismatch')
                if observation['conflicts'] != preview['conflicts']:
                    errors.append('checked_out_conflict_mismatch')
                if not preview_admitted:
                    errors.append('checked_out_without_qualified_preview')
                if any(c['state'] == 'unresolved' for c in observation['conflicts']):
                    errors.append('checked_out_with_unresolved_conflict')
                if any(e['disposition'] == 'unknown' for e in observation['actual_effects']):
                    errors.append('checked_out_with_unknown_effect')
            if observation['effect_state'] == 'known_applied' and r['error'] is not None and r['error']['effect_state'] in ('none', 'known_not_applied'):
                errors.append('owner_error_contradicts_applied_checkout')
            if observation['effect_state'] in ('not_attempted', 'known_not_applied'):
                if any(e['disposition'] not in ('preserved',) for e in observation['actual_effects']):
                    errors.append('unapplied_effect_not_preserved')
                if observation['scm_operation_receipt_ref'] is not None:
                    pass
            if observation['outcome'] == 'unknown' or observation['effect_state'] == 'unknown':
                if observation['outcome'] != 'unknown' or observation['effect_state'] != 'unknown' or observation['reconciliation_ref'] is None or r['outcome'] not in ('effect_unknown', 'recovery_required'):
                    errors.append('unknown_effect_preservation')
            elif observation['outcome'] not in ('checked_out', 'rejected', 'cancelled'):
                errors.append('contradictory_known_failure')
            if observation['scm_operation_receipt_ref'] is not None:
                scm_receipt = read(observation['scm_operation_receipt_ref'], 'operation_receipt', scm)
                if scm_receipt['receipt_id'] != observation['scm_operation_receipt_ref']:
                    errors.append('scm_receipt_identity')
                if scm_receipt['command_instance_id'] != a['command_instance_id'] or scm_receipt['operation_id'] != r['operation_id']:
                    errors.append('scm_receipt_operation')
                if scm_receipt['repository_context_ref'] != s['repository_context_ref'] or scm_receipt['writer_lease_ref'] != preview['writer_lease_ref']:
                    errors.append('scm_receipt_scope')
                if scm_receipt['scm_backend'] != s['scm_backend']:
                    errors.append('scm_receipt_backend')
                if scm_receipt['before_revision'] != preview['before_revision']:
                    errors.append('scm_receipt_before')
                if observation['outcome'] == 'checked_out':
                    if scm_receipt['after_revision'] != preview['proposed_revision']:
                        errors.append('scm_receipt_after')
                    if scm_receipt['outcome'] != 'succeeded':
                        errors.append('scm_receipt_outcome')
                else:
                    if scm_receipt['after_revision'] not in (None, preview['before_revision']):
                        errors.append('scm_receipt_after_not_applied')
                if scm_receipt['event_refs']:
                    errors.append('scm_receipt_unadmitted_event')
                if (scm_receipt['observable_work_id'] or None) != (r['observable_work_id'] or None):
                    errors.append('scm_receipt_work')
                if not instant(a['requested_at_utc']) <= instant(scm_receipt['completed_at_utc']) <= instant(r['completed_at_utc']):
                    errors.append('scm_receipt_time')
            elif r['outcome'] not in ('accepted',):
                errors.append('scm_receipt_missing')
        if r['outcome'] == 'succeeded' and (observation is None or observation['outcome'] != 'checked_out'):
            errors.append('success_without_checked_out_effect')
        if r['outcome'] != 'accepted' and observation is None:
            errors.append('terminal_observation_missing')
        if r['outcome'] == 'accepted':
            if o['outcome'] not in ('accepted', 'acknowledged', 'executing') or o['result_receipt_ref'] is not None or observation is not None:
                errors.append('accepted_not_terminal')
            if r['observable_work_id'] is None:
                errors.append('accepted_without_work')
            if r['receipt_ref'] is not None and r['receipt_ref'] != o['acknowledgement_receipt_ref']:
                errors.append('acceptance_receipt')
        elif r['outcome'] == 'degraded':
            errors.append('degraded_mapping_unadmitted')
        else:
            expected = {'succeeded': 'succeeded', 'blocked': 'rejected', 'failed': 'failed', 'cancelled': 'cancelled', 'effect_unknown': 'terminal_unknown', 'recovery_required': 'terminal_unknown'}[r['outcome']]
            if (r['error'] or {}).get('effect_state') == 'unknown':
                expected = 'terminal_unknown'
            if observation is not None and observation['effect_state'] == 'unknown':
                expected = 'terminal_unknown'
            if o['outcome'] != expected or o['result_receipt_ref'] != r['receipt_ref'] or receipt is None:
                errors.append('terminal_outcome')
        if r['observable_work_id'] is not None:
            work = read(r['observable_work_id'], 'ObservableWorkRecord', 'Plans/full_thread_runtime_contracts.schema.json')
            errors += full_thread_semantic_failures('ObservableWorkRecord', work)
            if work['identity'] != original['identity'] or work['observable_work_id'] != r['observable_work_id']:
                errors.append('original_work')
            if r['outcome'] == 'accepted' and (work['work_state'] in ('completed', 'failed', 'cancelled', 'recovery-required') or work['result_receipt_ref'] is not None):
                errors.append('accepted_work_terminal')
        original_response = read(response['original_dispatch_id'], None, 'Plans/ui_command_response.schema.json') if response['replayed'] else None
        errors += replay_failures(response, original_response)
        proof('admission', verify_original_admission, original, request)
        proof('review', verify_review_authority, original, binding, revision, context, preview, request)
        proof('effect', verify_checkout_effect, original, request, result, preview, observation, scm_receipt)
        proof('disclosure', check_current_disclosure, original, result, response, delivery, actual_error, projection)
    except Exception as exc:
        errors.append('owner_resolution:' + type(exc).__name__)
    if inputs != saved or any(v != frozen for v, frozen in snapshots):
        errors.append('original_mutated')
    return sorted(set(errors))


def response_failures(bundle, dependencies):
    """Central UI hook; dependencies are trusted adapters, never bundle facts."""
    if not isinstance(dependencies, dict):
        return ['checkout_native_dependencies_missing']
    frozen = deepcopy(bundle)
    snapshots = []
    try:
        resolver = dependencies['resolve_record']

        def read(ref):
            actual = resolver(ref)
            snapshots.append((actual, deepcopy(actual)))
            return deepcopy(actual)

        original = read(bundle['original_binding_ref'])
        result = bundle['owner_result']
        response = bundle['response']
        outcome = bundle['outcome']
        normalized = bundle['normalized_request']
        errors = []
        expected = {'request_ref': original['request_ref'], 'command_id': COMMAND,
                    'command_instance_id': original['identity']['command_instance_id'],
                    'operation_id': original['identity']['operation_id'], 'owner_identity': original['identity'],
                    **{k: original[k] for k in ('payload_sha256', 'idempotency_key', 'target_generation', 'dispatch_frame_id')}}
        if any(normalized.get(k) != v for k, v in expected.items()):
            errors.append('checkout_normalized_original')
        if read(bundle['resolved_outcome_ref']) != outcome or read(bundle['response_ref']) != response:
            errors.append('checkout_bundle_actual_records')
        errors += validate_checkout_result(bundle['owner_request'], result, bundle['original_binding_ref'],
                                           bundle['resolved_outcome_ref'], bundle['response_ref'], bundle['delivery_return_context'], **dependencies)
    except Exception as exc:
        errors = ['checkout_response_resolution:' + type(exc).__name__]
    if bundle != frozen or any(a != b for a, b in snapshots):
        errors.append('checkout_response_original_mutated')
    return sorted(set(errors))


def fixture_dependencies(value):
    """Synthetic static doubles; not genuine issuer/content/redaction proof."""
    return {'resolve_record': lambda ref: value['records'][ref],
            'canonical_digest': owner_result_digest, **{k: lambda *args: [] for k in ('verify_original_admission', 'verify_review_authority', 'verify_checkout_effect', 'check_current_disclosure')}}


def review_checkout_selected_semantic_failures(definition, value):
    if definition != 'fixture_case':
        return []
    if shape(definition, value):
        return ['fixture_shape']
    return validate_checkout_result(value['request'], value['result'], value['original_binding_ref'], value['outcome_ref'], value['response_ref'], value['delivery_return_context'], **fixture_dependencies(value))
