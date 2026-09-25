"""Existing ProviderReadinessProof value joins; never a probe or dispatch permit."""
from copy import deepcopy
from functools import lru_cache
import json
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from pm_provider_setup_manifest_semantics import schema as setup_schema, structural_errors as setup_errors, _proof

DIMENSIONS = ('installation_state', 'executable_health', 'authentication_state',
    'account_identity_state', 'product_or_entitlement_state', 'model_catalog_state',
    'adapter_handshake_state', 'required_capability_state', 'generation_verification_state', 'usage_telemetry_state')


@lru_cache(maxsize=1)
def schema():
    return json.loads((Path(__file__).resolve().parents[1] / 'Plans/provider_readiness_contracts.schema.json').read_text())


def structural_errors(definition, value):
    s = schema()
    registry = Registry().with_resources((d['$id'], Resource.from_contents(d)) for d in (s, setup_schema()))
    return [e.message for e in Draft202012Validator({'$ref': s['$id'] + '#/$defs/' + definition},
        registry=registry, format_checker=FormatChecker()).iter_errors(value)]


def intrinsic(proof):
    if structural_errors('readiness_proof', proof):
        return ['readiness_shape']
    errors = []
    if (proof['installation_id'] is None) != (proof['installation_generation'] is None):
        errors.append('installation_pair')
    if (proof['account_ref'] is None) != (proof['account_id'] is None):
        errors.append('account_pair')
    for dimension, fact in proof['observed_facts'].items():
        if fact['dimension'] != dimension or fact['query_ref'] != proof['query_ref']:
            errors.append('fact_identity')
        if fact['state'] in ('verified', 'not_applicable') and not fact['evidence_refs']:
            errors.append('fact_missing_evidence')
        if fact['state'] in ('failed', 'unavailable') and fact['reason_ref'] is None:
            errors.append('fact_missing_reason')
    if len({f['fact_ref'] for f in proof['observed_facts'].values()}) != len(DIMENSIONS):
        errors.append('fact_reused')
    if proof['readiness_state'] == 'ready' and any(proof['observed_facts'][d]['state'] not in
            ('verified', 'not_applicable') for d in proof['required_checks']):
        errors.append('required_fact_not_ready')
    generation = proof['observed_facts']['generation_verification_state']
    if generation['state'] == 'verified' and proof['generation_proof_ref'] is None:
        errors.append('generation_proof_missing')
    if generation['state'] in ('unavailable', 'failed') and proof['generation_refusal_ref'] is None:
        errors.append('generation_refusal_missing')
    if generation['state'] in ('unavailable', 'failed') and proof['readiness_confidence'] == 'verified':
        errors.append('generation_confidence_overclaim')
    return sorted(set(errors))


def validate_readiness(proof_ref, *, resolve_original, resolve_fact, resolve_required_checks,
        verify_route_account_and_facts, check_current_disclosure):
    """Resolve genuine immutable proof/query/setup binding and fact-owner values.

    resolve_original(kind, ref) belongs to genuine producing owners. Required
    checks come from the selected route/compatibility owner, never proof input.
    verify_route_account_and_facts must authenticate original production, genuine
    entry/method/account/product/credential compatibility, exact installation and
    topology, independent fact semantics/applicability, all probe/evidence refs,
    observation time and readiness/confidence determination. This includes genuine
    unsupported/unavailable findings; strings alone are not evidence. Present
    disclosure/current-use checks occur after helpers; original historical values
    are never rewritten using current UI selection or a replacement installation.
    No callback or return value dispatches a provider or performs a probe.
    """
    retained = []
    def keep(kind, reference, definition, checker=structural_errors):
        value = resolve_original(kind, reference)
        if checker(definition, value):
            raise ValueError('invalid original owner record')
        retained.append((value, deepcopy(value)))
        return value
    try:
        proof = keep('readiness_proof', proof_ref, 'readiness_proof')
        query = keep('readiness_query', proof['query_ref'], 'query')
        binding = keep('setup_binding', query['setup_binding_ref'], 'setup_consumer_binding', setup_errors)
        required = resolve_required_checks(deepcopy(query), deepcopy(binding))
        if not isinstance(required, list) or len(required) != len(set(required)) or any(x not in DIMENSIONS for x in required):
            raise ValueError('invalid owner check set')
        retained.append((required, deepcopy(required)))
        actual_facts = {}
        for dimension, selected in proof['observed_facts'].items():
            fact = resolve_fact(selected['fact_ref'])
            if structural_errors('fact', fact):
                raise ValueError('invalid fact owner record')
            retained.append((fact, deepcopy(fact)))
            actual_facts[dimension] = fact
    except (KeyError, ValueError, TypeError, OSError):
        return ['readiness_source_unavailable']
    if any(value != original for value, original in retained):
        return ['readiness_source_mutated']
    errors = intrinsic(proof)
    def eq(a, b, code):
        if a != b:
            errors.append(code)
    eq(proof['proof_ref'], proof_ref, 'readiness_identity')
    eq(proof['query_ref'], query['query_ref'], 'query_identity')
    eq(proof['setup_binding_ref'], binding['binding_ref'], 'binding_identity')
    eq(query['setup_binding_ref'], binding['binding_ref'], 'query_binding')
    eq(proof['provider_id'], binding['provider_entry_id'], 'provider_identity')
    for key in ('provider_route_id', 'execution_host_id', 'execution_environment_id', 'topology_generation',
            'account_ref', 'profile_ref', 'connection_ref', 'owner_currentness_ref'):
        eq(proof[key], binding[key], 'readiness_context_' + key)
    eq(query['owner_currentness_ref'], binding['owner_currentness_ref'], 'query_currentness')
    eq(set(proof['required_checks']), set(required), 'required_check_set')
    eq(proof['observed_facts'], actual_facts, 'observed_fact_substitution')
    if binding['readiness_proof_ref'] is not None:
        eq(binding['readiness_proof_ref'], proof_ref, 'selected_readiness_proof')
    if errors:
        return sorted(set(errors))
    errors += _proof(verify_route_account_and_facts, 'readiness_owner_proof', query, binding, proof, actual_facts)
    errors += _proof(check_current_disclosure, 'readiness_current_disclosure', query, binding, proof)
    if any(value != original for value, original in retained):
        errors.append('readiness_source_mutated')
    return sorted(set(errors))


def fixture_dependencies(value):
    records = {('readiness_proof', value['proof']['proof_ref']): value['proof'],
        ('readiness_query', value['query']['query_ref']): value['query'],
        ('setup_binding', value['binding']['binding_ref']): value['binding']}
    facts = {f['fact_ref']: deepcopy(f) for f in value['proof']['observed_facts'].values()}
    return dict(resolve_original=lambda kind, ref: records[(kind, ref)],
        resolve_fact=lambda ref: facts[ref], resolve_required_checks=lambda *args: value['owner_required_checks'],
        verify_route_account_and_facts=lambda *args: [], check_current_disclosure=lambda *args: [])


def provider_readiness_semantic_failures(definition, value):
    if definition == 'readiness_proof':
        return intrinsic(value)
    if definition == 'readiness_fixture':
        if structural_errors(definition, value):
            return ['readiness_fixture_shape']
        return validate_readiness(value['proof']['proof_ref'], **fixture_dependencies(value))
    return []
