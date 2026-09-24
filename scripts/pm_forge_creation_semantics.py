"""Forge creation contract joins over independently resolved owner inputs.

This is a static contract oracle, not a native handler or authentication proof.
The owner-facing function takes resolver, validator, canonical digest and current
owner-state dependencies separately from the actual command. A fixture map is
provided only by the explicitly non-runtime aggregate adapter below. Native
owners must authenticate record resolution, current state and approved intent;
no request, safe ref, hash or caller boolean grants that authority.
"""
from __future__ import annotations

from datetime import datetime, timezone


def _utc(value):
    parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
    if parsed.utcoffset() != timezone.utc.utcoffset(parsed):
        raise ValueError('not_utc')
    return parsed


def validate_repository_creation(request, *, resolve_record, context,
                                 validate_record, digest_record, validate_options):
    """Check the actual create request against trusted owner dependencies.

    resolve_record(kind, ref) must be owner-authenticated, not a request map.
    context is independently obtained current owner state. validate_record
    validates a named definition in the canonical common Forge schema. The
    digest dependency must implement the owner's declared canonical-JSON domain.
    """
    if validate_record('repository_create_command_request_v2', request):
        return ['forge_creation_request_schema']
    if validate_record('repository_creation_execution_snapshot', context):
        return ['forge_creation_owner_context_schema']
    intent = request['repository_creation_intent']
    subject, choices = intent['subject'], intent['choices']
    failures = []

    def equal(left, right, code):
        if left != right:
            failures.append(code)

    # These are independently authenticated original admission/current facts,
    # never constructed from the caller's request by the runtime adapter.
    envelope = {key: value for key, value in request.items() if key not in (
        'schema_id', 'repository_creation_intent', 'creation_preview_ref', 'creation_preview_sha256')}
    equal(envelope, context['command_envelope_binding'], 'forge_creation_current_envelope')
    equal(request['expected_binding_generation'], request['currentness']['binding_generation'],
          'forge_creation_binding_generation')
    if request['target'].get('target_namespace') is not None:
        equal(request['target']['target_namespace'], subject['namespace_external_id'],
              'forge_creation_target_namespace')
    if request['target']['connection_id'] is not None:
        equal(request['target']['connection_id'], subject['connection_id'],
              'forge_creation_target_connection')
    for key in ('provider', 'provider_variant', 'normalized_host', 'account_id'):
        equal(subject[key], request[key], 'forge_creation_request_' + key)
    equal(subject, context['subject'], 'forge_creation_current_subject')
    option_context = context['option_context']
    for key in ('provider', 'provider_variant', 'normalized_host'):
        equal(option_context[key], subject[key], 'forge_creation_option_' + key)
    equal(option_context['instance_id'], subject['instance_profile_ref'],
          'forge_creation_option_instance')
    equal(option_context['now_utc'], context['now_utc'], 'forge_creation_option_time')
    capability = intent['capability_binding']
    equal(capability, context['capability_binding'], 'forge_creation_current_capability')
    for key in ('capability_snapshot_ref', 'api_compatibility_ref'):
        equal(capability[key], request[key], 'forge_creation_request_' + key)
        equal(option_context[key], capability[key], 'forge_creation_option_' + key)
    for key in ('catalog_generation', 'api_probe_ref', 'direct_revalidation_ref'):
        equal(capability[key], request['currentness'][key], 'forge_creation_request_' + key)
    equal(request['permission'], context['permission'], 'forge_creation_current_permission')
    equal(intent['approval_binding'], context['approval_binding'], 'forge_creation_current_approval')
    for key in ('resolved_slug_or_path', 'effective_visibility', 'visibility_policy_ref',
                'source_template_revision_ref', 'source_template_capability_ref',
                'source_template_permission_ref', 'source_control_transport_intent_ref'):
        equal(intent[key], context[key], 'forge_creation_current_' + key)
    equal(intent['expected_name_availability_revision'], context['name_availability_revision'],
          'forge_creation_current_name_revision')
    if context['name_availability'] != 'available':
        failures.append('forge_creation_current_name_unavailable')
    equal(request['target']['repository_locator_ref'], context['repository_locator_ref'],
          'forge_creation_current_locator')
    if choices['provider_slug_or_path'] is not None:
        equal(choices['provider_slug_or_path'], intent['resolved_slug_or_path'], 'forge_creation_selected_path')
        if intent['slug_derivation_ref'] is not None:
            failures.append('forge_creation_explicit_path_has_derivation')
    elif intent['resolved_slug_or_path'] is not None and intent['slug_derivation_ref'] is None:
        failures.append('forge_creation_derived_path_missing_proof')
    elif intent['resolved_slug_or_path'] is None and intent['slug_derivation_ref'] is not None:
        failures.append('forge_creation_absent_path_has_derivation')
    if choices['visibility'] != 'inherit_project':
        equal(choices['visibility'], intent['effective_visibility'], 'forge_creation_visibility_substitution')
    try:
        intent_digest = digest_record(intent)
        equal(intent_digest, context['approved_intent_sha256'], 'forge_creation_approved_intent_digest')
        equal(digest_record(choices), context['approved_choices_sha256'], 'forge_creation_approved_choices_digest')
    except (ValueError, TypeError, OverflowError):
        return sorted(set(failures + ['forge_creation_digest_domain']))
    try:
        preview = resolve_record('repository_creation_preview', request['creation_preview_ref'])
    except (KeyError, ValueError, TypeError, OSError):
        return sorted(set(failures + ['forge_creation_preview_unresolved']))
    if validate_record('repository_creation_preview', preview):
        return sorted(set(failures + ['forge_creation_preview_schema']))
    equal(preview['preview_id'], request['creation_preview_ref'], 'forge_creation_preview_identity')
    try:
        equal(digest_record(preview), request['creation_preview_sha256'], 'forge_creation_preview_digest')
    except (ValueError, TypeError, OverflowError):
        failures.append('forge_creation_preview_digest_domain')
    equal(preview['intent_sha256'], intent_digest, 'forge_creation_preview_intent_digest')
    for key in ('subject', 'capability_binding', 'approval_binding'):
        equal(preview[key], intent[key], 'forge_creation_preview_' + key)
    equal(preview['repository_name'], choices['repository_name'], 'forge_creation_preview_name')
    equal(preview['resolved_slug_or_path'], intent['resolved_slug_or_path'], 'forge_creation_preview_path')
    equal(preview['name_availability_revision'], intent['expected_name_availability_revision'],
          'forge_creation_preview_name_revision')
    equal(preview['permission_snapshot_ref'], request['permission']['permission_snapshot_ref'],
          'forge_creation_preview_permission')
    equal(preview['repository_locator_ref'], request['target']['repository_locator_ref'],
          'forge_creation_preview_locator')
    if preview['preview_state'] != 'ready' or preview['name_availability'] != 'available':
        failures.append('forge_creation_preview_unavailable')
    try:
        now = _utc(context['now_utc'])
        observed, expires = _utc(preview['observed_at_utc']), _utc(preview['expires_at_utc'])
        requested = _utc(request['requested_at_utc'])
        for timestamp in (request['permission']['evaluated_at_utc'],
                          request['availability']['evaluated_at_utc'],
                          request['currentness']['projection_updated_at_utc']):
            if _utc(timestamp) > now:
                failures.append('forge_creation_future_envelope_evidence')
        if not observed <= requested <= now < expires:
            failures.append('forge_creation_preview_time')
        if now >= _utc(context['approval_expires_at_utc']):
            failures.append('forge_creation_approval_expired')
    except (ValueError, TypeError, OverflowError):
        failures.append('forge_creation_timestamp')
    failures.extend(validate_options(choices['provider_options'], resolve_record=resolve_record,
                                     context=context['option_context'], digest_record=digest_record))
    return sorted(set(failures))


def forge_creation_semantic_failures(definition_name, value):
    """Aggregate fixture adapter; never a runtime resolver or authority source.

    Standalone request fixtures establish shape only. Cross-record checks use
    the explicitly non-runtime validation input and actual request/preview/
    catalog shapes. Native dispatch must call validate_repository_creation
    with independently authenticated owner dependencies instead of this map.
    """
    from pm_forge_creation_options import (
        CreationOptionContext, catalog_semantic_failures, structural_errors,
        validate_creation_options,
    )
    from pm_ui_command_response import owner_result_digest

    schema_id = value.get('schema_id') if isinstance(value, dict) else None
    if definition_name == 'creation_field_catalog' or schema_id == 'pm.forge.creation_field_catalog.v1':
        return catalog_semantic_failures(value)
    if definition_name != 'repository_creation_validation_input':
        return []
    if structural_errors('repository_creation_validation_input', value):
        return ['forge_creation_validation_input_schema']

    def resolve_record(kind, ref):
        record, identity = {
            'repository_creation_preview': (value['resolved_preview'], 'preview_id'),
            'creation_field_catalog': (value['resolved_catalog'], 'catalog_id'),
        }[kind]
        if record[identity] != ref:
            raise KeyError(ref)
        return record

    def option_adapter(selections, *, resolve_record, context, digest_record):
        facts = dict(context)
        facts['now_utc'] = _utc(facts['now_utc'])
        for key in ('admitted_capability_refs', 'admitted_permission_refs'):
            facts[key] = frozenset(facts[key])
        for key in ('allowed_effects', 'admitted_resource_refs'):
            facts[key] = frozenset(tuple(pair) for pair in facts[key])
        return validate_creation_options(
            selections, resolve_catalog=lambda ref: resolve_record('creation_field_catalog', ref),
            context=CreationOptionContext(**facts), digest_record=digest_record,
        )

    try:
        return validate_repository_creation(
            value['request'], resolve_record=resolve_record, context=value['execution_snapshot'],
            validate_record=structural_errors, digest_record=owner_result_digest,
            validate_options=option_adapter,
        )
    except (ValueError, TypeError, OverflowError):
        return ['forge_creation_fixture_context_invalid']
