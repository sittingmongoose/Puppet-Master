"""Finite existing Onboarding search-consumer joins; no routing or owner effects."""
from copy import deepcopy
from functools import lru_cache
import json
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from pm_provider_setup_manifest_semantics import _proof
from pm_onboarding_semantics import onboarding_semantic_failures


@lru_cache(maxsize=8)
def schemas(contract_root=None):
    root = Path(contract_root) if contract_root else Path(__file__).resolve().parents[1]
    local = json.loads((Path(__file__).resolve().parents[1] / 'Plans/onboarding_search_consumer_contracts.schema.json').read_text())
    docs = [json.loads(p.read_text()) for p in (root / 'Plans').glob('*.schema.json')]
    docs.append(local)
    registry = Registry().with_resources((d['$id'], Resource.from_contents(d)) for d in docs if '$id' in d)
    return local, registry


def structural_errors(definition, value, contract_root=None):
    schema, registry = schemas(contract_root)
    return [e.message for e in Draft202012Validator({'$ref': schema['$id'] + '#/$defs/' + definition},
        registry=registry, format_checker=FormatChecker()).iter_errors(value)]


def selection_joins(request, result, snapshot, context, continuation):
    errors = onboarding_semantic_failures('onboarding_return_context', context)
    errors += onboarding_semantic_failures('onboarding_continuation_snapshot', continuation)
    def eq(a, b, code):
        if a != b:
            errors.append(code)
    eq(result['request_ref'], request['request_ref'], 'request_identity')
    eq(snapshot['request_ref'], request['request_ref'], 'snapshot_request_identity')
    eq(result['return_context_ref'], request['return_context_ref'], 'result_context_identity')
    eq(request['return_context_ref'], context['return_context_id'], 'context_identity')
    eq(result['registry_snapshot_ref'], snapshot['snapshot_ref'], 'snapshot_identity')
    eq(result['registry_revision'], snapshot['revision'], 'snapshot_revision')
    eq(context['stage'], 'provider_setup', 'not_postcommit_provider_phase')
    eq(context['project_disposition'], 'committed', 'project_not_committed')
    if not context['project_commit_binding']:
        errors.append('project_commit_missing')
    else:
        eq(context['project_id'], context['project_commit_binding']['project_id'], 'actual_project_mismatch')
    eq(context['expected_revision'], continuation['revision'], 'continuation_revision')
    # Compare all common original durable/context fields, not only visible stage.
    for key in context.keys() & continuation.keys() - {'schema_id', 'schema_version'}:
        eq(context[key], continuation[key], 'continuation_' + key)
    branch = context['active_branch']
    if branch is not None:
        for key in ('owner_operation_id', 'continuation_generation', 'initiating_client_id', 'return_focus_id', 'expected_revision'):
            eq(context[key], branch[key], 'branch_' + key)
        eq(context['project_id'], branch['target_ref'], 'branch_project')
        if context['project_commit_binding'] is not None:
            eq(context['project_commit_binding']['binding_id'], branch['project_commit_ref'], 'branch_commit')
    routes = [r['route_ref'] for r in snapshot['candidates']]
    if len(routes) != len(set(routes)):
        errors.append('duplicate_candidate_route')
    eligible = [r for r in snapshot['candidates'] if r['selection_state'] == 'eligible_ready']
    chosen = None
    if request['mode'] == 'automatic':
        if request['selected_route_ref'] is not None:
            errors.append('automatic_has_explicit_route')
        chosen = eligible[0] if eligible else None
    elif request['mode'] == 'explicit':
        if request['selected_route_ref'] is None:
            errors.append('explicit_route_missing')
        chosen = next((r for r in eligible if r['route_ref'] == request['selected_route_ref']), None)
    elif request['selected_route_ref'] is not None:
        errors.append('skip_has_explicit_route')
    expected_status = 'skipped' if request['mode'] == 'skip' else 'selected' if chosen else 'unresolved'
    eq(result['status'], expected_status, 'selection_status')
    for target, source in (('selected_route_ref', 'route_ref'), ('selected_account_ref', 'account_ref'),
            ('selected_model_ref', 'model_ref'), ('readiness_proof_ref', 'readiness_proof_ref')):
        eq(result[target], chosen[source] if chosen else None, 'selection_' + target)
    return sorted(set(errors))


def validate_selection(result_ref, *, resolve_original, resolve_ranked_registry, resolve_current_continuation,
        verify_registry_and_readiness, check_current_use, contract_root=None):
    """Mandatory owner-backed interfaces; static fixtures are not production adapters.

    resolve_original resolves immutable original selection/result/return-context.
    resolve_ranked_registry resolves the actual complete owner-ranked population
    at the pinned revision, not caller candidate rows. verify_registry_and_readiness
    authenticates production and order, supported search capability, actual selected
    account/model and readiness source, required Permissions, privacy/egress and
    current route eligibility for this exact Project/Host/Environment/Client.
    check_current_use authenticates latest session/continuation, active Client,
    current topology and original operation/context applicability before disclosure.
    No success authorizes search, changes a setting, or completes an owner flow.
    """
    retained = []
    def keep(definition, value):
        if structural_errors(definition, value, contract_root):
            raise ValueError('invalid owner value')
        retained.append((value, deepcopy(value)))
        return value
    try:
        result = keep('selection_result', resolve_original('selection_result', result_ref))
        request = keep('selection_request', resolve_original('selection_request', result['request_ref']))
        context = keep('return_context', resolve_original('return_context', request['return_context_ref']))
        snapshot = keep('registry_snapshot', resolve_ranked_registry(deepcopy(request), result['registry_snapshot_ref']))
        continuation = keep('continuation', resolve_current_continuation(context['onboarding_session_id']))
    except (KeyError, ValueError, TypeError, OSError):
        return ['search_owner_source_unavailable']
    if any(value != original for value, original in retained):
        return ['search_original_mutated']
    errors = selection_joins(request, result, snapshot, context, continuation)
    if result['result_ref'] != result_ref:
        errors.append('result_identity')
    if errors:
        return sorted(set(errors))
    errors += _proof(verify_registry_and_readiness, 'search_registry_readiness_proof', request, result, context, snapshot)
    errors += _proof(check_current_use, 'search_current_use', request, result, context, continuation)
    if any(value != original for value, original in retained):
        errors.append('search_original_mutated')
    return sorted(set(errors))


def fixture_dependencies(value):
    """Explicit arithmetic-only doubles; neither provenance nor eligibility proof."""
    records = {('selection_result', value['result']['result_ref']): value['result'],
        ('selection_request', value['request']['request_ref']): value['request'],
        ('return_context', value['return_context']['return_context_id']): value['return_context']}
    return dict(resolve_original=lambda kind, ref: records[(kind, ref)],
        resolve_ranked_registry=lambda *args: value['snapshot'],
        resolve_current_continuation=lambda ref: value['continuation'],
        verify_registry_and_readiness=lambda *args: [], check_current_use=lambda *args: [])


def onboarding_search_semantic_failures(definition, value, contract_root=None):
    if definition != 'search_fixture':
        return []
    if structural_errors(definition, value, contract_root):
        return ['search_fixture_shape']
    return validate_selection(value['result']['result_ref'], contract_root=contract_root, **fixture_dependencies(value))
