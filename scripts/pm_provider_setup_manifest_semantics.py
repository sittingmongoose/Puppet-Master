"""Declarative setup metadata joins, not a procedure runner or provider proof.

Native resolvers must belong to existing provider/auth owners. Fixture adapters
below are explicit fabricated metadata only and must never authorize execution.
"""
from copy import deepcopy
from functools import lru_cache
import hashlib
import json
from pathlib import Path
from urllib.parse import urlsplit

from jsonschema import Draft202012Validator, FormatChecker


@lru_cache(maxsize=1)
def schema():
    return json.loads((Path(__file__).resolve().parents[1] / 'Plans' /
        'provider_setup_manifest_contracts.schema.json').read_text())


def structural_errors(definition, value):
    doc = schema()
    return [e.message for e in Draft202012Validator(
        {'$schema': doc['$schema'], '$defs': doc['$defs'], '$ref': '#/$defs/' + definition},
        format_checker=FormatChecker()).iter_errors(value)]


def manifest_errors(manifest):
    errors = structural_errors('provider_setup_manifest', manifest)
    if errors:
        return ['manifest_shape']
    hosts = manifest['authorization_destination']['allowed_hosts']
    for field, identity, reference in (('secure_input', 'type_id', 'owner_descriptor_ref'),
            ('callback', 'behavior_id', 'owner_behavior_ref')):
        if (manifest[field][identity] is None) != (manifest[field][reference] is None):
            errors.append('manifest_incomplete_' + field)
    for host in hosts:
        # Exact host metadata only; no wildcard, URL, path or suffix matching.
        if host != host.lower() or any(c in host for c in '/:@*?#') or not host.isascii():
            errors.append('manifest_allowlist_host')
    for url in (manifest['account_creation_url'], manifest['authorization_destination']['url']):
        if url is None:
            continue
        try:
            parsed = urlsplit(url)
            if parsed.scheme not in ('https', 'http') or not parsed.hostname:
                errors.append('manifest_destination_scheme')
            if parsed.username is not None or parsed.password is not None:
                errors.append('manifest_destination_credentials')
            if parsed.hostname not in hosts:
                errors.append('manifest_destination_not_allowlisted')
            if parsed.fragment:
                errors.append('manifest_destination_fragment')
            parsed.port
        except ValueError:
            errors.append('manifest_destination_invalid')
    return sorted(set(errors))


def _proof(callback, label, *args):
    try:
        response = callback(*args)
    except (KeyError, ValueError, TypeError, OSError):
        return [label + '_unavailable']
    if not isinstance(response, list) or any(not isinstance(e, str) or not e for e in response):
        return [label + '_invalid_response']
    return [label + ':' + e for e in response]


def _strict_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('duplicate key')
        result[key] = value
    return result


def validate_setup_binding(binding_ref, *, resolve_original_binding,
        resolve_manifest_bytes, resolve_trusted_procedure, verify_official_manifest,
        verify_route_account_binding, check_current_use):
    """Read-only validation, never a transferable dispatch/navigation permit.

    resolve_original_binding authenticates the original invocation and immutable
    binding, not a caller replacement. resolve_manifest_bytes resolves exact
    PM-owned UTF-8 JSON bytes pinned by ref/revision/SHA. Procedure resolution is
    through the genuine trusted registry and returns its closed metadata view.
    verify_official_manifest authenticates PM source publication, verification
    date, destinations and credential/input/callback owner descriptors; redirects
    and generated URLs stay under native Auth authority. Route/account verifier
    resolves actual supported method, route, account/product/auth compatibility,
    Host/topology and independent readiness proof when referenced; refs alone
    are not facts. Final check_current_use rechecks all original/current values,
    invocation, manifest and registry revisions, route/account/authority and exact
    return context after all helpers under the genuine effect/disclosure fence.
    Real procedure invocation must remain in that fence; this oracle does not run
    procedures, authenticate, emit secrets, persist or navigate.
    """
    try:
        binding = resolve_original_binding(binding_ref)
        if structural_errors('setup_consumer_binding', binding):
            return ['binding_shape']
        original_binding = deepcopy(binding)
        raw = resolve_manifest_bytes(binding['manifest'])
        if binding != original_binding:
            return ['helper_changed_original_values']
        if type(raw) is not bytes:
            return ['manifest_bytes_unavailable']
        manifest = json.loads(raw.decode('utf-8'), object_pairs_hook=_strict_object)
    except (KeyError, ValueError, TypeError, OSError, UnicodeError):
        return ['original_manifest_unavailable']
    errors = manifest_errors(manifest)
    if errors:
        return errors
    def equal(a, b, label):
        if a != b:
            errors.append(label)
    equal(binding['binding_ref'], binding_ref, 'binding_identity')
    equal(hashlib.sha256(raw).hexdigest(), binding['manifest']['sha256'], 'manifest_source_bytes')
    equal(manifest['manifest_ref'], binding['manifest']['record_ref'], 'manifest_binding_identity')
    equal(manifest['revision'], binding['manifest']['revision'], 'manifest_binding_revision')
    equal(manifest['provider_id'], binding['provider_entry_id'], 'manifest_binding_provider')
    equal(manifest['setup_method_id'], binding['setup_method_id'], 'manifest_binding_method')
    equal(manifest['credential_owner'], binding['credential_owner'], 'manifest_binding_credential_owner')
    equal(manifest['return_destination_ref'], binding['return_destination_ref'], 'manifest_binding_return')
    if errors:
        return sorted(set(errors))
    procedures = []
    original_procedures = []
    for field, role in (('validation_procedure_id', 'validate'),
            ('model_refresh_procedure_id', 'refresh_models'), ('usage_refresh_procedure_id', 'refresh_usage')):
        procedure_id = manifest[field]
        if procedure_id is None:
            continue
        try:
            procedure = resolve_trusted_procedure(procedure_id)
            if structural_errors('procedure_resolution', procedure):
                raise ValueError('invalid registry view')
        except (KeyError, ValueError, TypeError, OSError):
            errors.append('trusted_procedure_unavailable')
            continue
        equal(procedure['procedure_id'], procedure_id, 'procedure_identity')
        equal(procedure['role'], role, 'procedure_role')
        equal(procedure['provider_entry_id'], binding['provider_entry_id'], 'procedure_provider')
        equal(procedure['setup_method_id'], binding['setup_method_id'], 'procedure_method')
        equal(procedure['credential_owner'], binding['credential_owner'], 'procedure_credential_owner')
        procedures.append(procedure)
        original_procedures.append(deepcopy(procedure))
    if errors:
        return sorted(set(errors))
    if binding != original_binding or procedures != original_procedures:
        return ['helper_changed_original_values']
    snapshot = deepcopy((original_binding, manifest, original_procedures))
    errors += _proof(verify_official_manifest, 'official_manifest', binding, manifest)
    errors += _proof(verify_route_account_binding, 'route_account_binding', binding, manifest)
    errors += _proof(check_current_use, 'current_use', binding, manifest, procedures)
    if snapshot != (binding, manifest, procedures):
        errors.append('helper_changed_original_values')
    return sorted(set(errors))


def fixture_dependencies(value):
    """Fabricated sources, never an authoritative provider/registry adapter."""
    raw = json.dumps(value['manifest'], ensure_ascii=False, separators=(',', ':')).encode()
    registry = {p['procedure_id']: p for p in value['procedures']}
    return dict(resolve_original_binding=lambda _: value['binding'],
        resolve_manifest_bytes=lambda _: raw,
        resolve_trusted_procedure=lambda pid: registry[pid],
        verify_official_manifest=lambda *args: [], verify_route_account_binding=lambda *args: [],
        check_current_use=lambda *args: [])


def provider_setup_manifest_semantic_failures(definition, value):
    if definition == 'provider_setup_manifest':
        return manifest_errors(value)
    if definition == 'manifest_fixture':
        if structural_errors(definition, value):
            return ['fixture_shape']
        return validate_setup_binding(value['binding']['binding_ref'], **fixture_dependencies(value))
    return []
