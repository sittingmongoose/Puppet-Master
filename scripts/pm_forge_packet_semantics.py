#!/usr/bin/env python3
"""FGI-021 static joins over actual owner records, never attestation flags.

Schema validity remains a separate prerequisite. These comparisons establish
internal consistency of evidence, not native execution or provider truth.
"""
from __future__ import annotations

import copy
from typing import Any, Callable

from jsonschema import Draft202012Validator

_SECRET_MARKERS = ('BEGIN PRIVATE KEY', 'BEGIN RSA PRIVATE KEY', 'BEGIN OPENSSH PRIVATE KEY',
                   'BEGIN PGP PRIVATE', 'ghp_', 'gho_', 'AKIA', 'xoxb-', 'xoxp-', 'sk-live-', 'sk-ant-')
_ARTIFACT = 'cmd.forge.pipeline.artifact.download'
_DELETE = 'cmd.forge.repository.delete'
_CREATE = 'cmd.forge.repository.create'
_OFFICIAL = 'cmd.forge.pipeline.open_in_browser'


def _dict(value: Any) -> dict:
    return value if isinstance(value, dict) else {}


def _secret(value: Any) -> bool:
    if isinstance(value, str):
        return any(marker in value for marker in _SECRET_MARKERS)
    if isinstance(value, dict):
        return any(_secret(k) or _secret(v) for k, v in value.items())
    return isinstance(value, list) and any(_secret(v) for v in value)


def _roundtrip(v: dict) -> list[str]:
    failures = set()
    def check(code, condition):
        if not condition:
            failures.add('forge_roundtrip_' + code)
    q, r, c = (_dict(v.get(k)) for k in ('request', 'result', 'receipt'))
    b, a = (_dict(v.get(k)) for k in ('repository_binding', 'automation_binding'))
    t = _dict(q.get('target'))
    cmd = v.get('command_id')
    check('command_mismatch', all(x.get('command_id') == cmd for x in (q, r, c)))
    for field, code in [('command_instance_id', 'command_instance_mismatch'),
                        ('observable_work_id', 'observable_work_mismatch')]:
        check(code, q.get(field) == r.get(field) == c.get(field))
    for field, code in [('operation_id', 'operation_mismatch'), ('outcome', 'outcome_mismatch'),
                        ('completed_at_utc', 'completion_mismatch'), ('event_refs', 'event_refs_mismatch')]:
        check(code, r.get(field) == c.get(field))
    check('receipt_ref_mismatch', r.get('receipt_ref') == c.get('receipt_id'))
    for field in ('idempotency_key', 'credential_or_grant_ref', 'requested_authority_role', 'effective_authority_role'):
        check(field + '_mismatch', q.get(field) == c.get(field))
    # Separate automation services are not repository-provider identity. Only
    # same_forge bindings require provider/host/account equality with the repo.
    same = not a or a.get('repository_relationship') == 'same_forge'
    service = a or b
    check('provider_mismatch', q.get('provider') == r.get('provider') == c.get('provider') == service.get('provider')
          and (not same or q.get('provider') == b.get('provider')))
    check('service_instance_mismatch', q.get('normalized_host') == service.get('normalized_host')
          and (not same or q.get('normalized_host') == b.get('normalized_host')))
    check('account_mismatch', q.get('account_id') == service.get('account_id')
          and (not same or q.get('account_id') == b.get('account_id')))
    check('repo_mismatch', q.get('repo_id') == b.get('repo_id') and (not a or a.get('repo_id') == b.get('repo_id')))
    check('repository_binding_mismatch', all(x.get('repository_binding_ref') == b.get('binding_id') for x in (q, r, c))
          and (not a or a.get('repository_binding_ref') == b.get('binding_id')))
    check('binding_generation_mismatch', all(x.get('expected_binding_generation') == b.get('binding_generation') for x in (q, r, c))
          and _dict(q.get('currentness')).get('binding_generation') == b.get('binding_generation'))
    if cmd != _ARTIFACT:
        check('provider_repository_mismatch', t.get('provider_repository_id') == b.get('provider_repository_id'))
    if same:
        check('provider_variant_mismatch', q.get('provider_variant') == b.get('provider_variant'))
    if a:
        check('automation_binding_mismatch', all(x.get('automation_binding_ref') == a.get('automation_binding_id') for x in (q, r, c)))
        check('automation_generation_mismatch', all(x.get('expected_automation_binding_generation') == a.get('binding_generation') for x in (q, r, c)))
        check('capability_snapshot_mismatch', q.get('capability_snapshot_ref') == a.get('capability_snapshot_ref'))
        check('permission_snapshot_mismatch', _dict(q.get('permission')).get('permission_snapshot_ref') == a.get('permission_snapshot_ref'))
        check('credential_or_grant_ref_mismatch', q.get('credential_or_grant_ref') == a.get('credential_or_grant_ref'))
    if cmd == _ARTIFACT:
        evidence = _dict(v.get('artifact_evidence'))
        run, artifact = (_dict(evidence.get(k)) for k in ('run_record', 'artifact_record'))
        check('artifact_evidence_missing', bool(evidence and run and artifact))
        # Hosted automation may reside on another service. Its provider's
        # repository identity comes from the observed automation target; only
        # same_forge relationships may equate it with the storage forge ID.
        service_repo = evidence.get('service_repository_id')
        check('provider_repository_mismatch', bool(service_repo)
              and t.get('provider_repository_id') == service_repo
              and (not same or service_repo == b.get('provider_repository_id')))
        check('artifact_target_mismatch', r.get('target_ref') == t.get('remote_artifact_record_ref') == evidence.get('remote_artifact_record_ref'))
        check('run_identity_not_definition', bool(t.get('automation_run_id')) and t.get('automation_run_id') not in (t.get('pipeline_id'), t.get('pipeline_definition_ref')))
        check('run_binding_mismatch', evidence.get('automation_binding_ref') == a.get('automation_binding_id')
              and evidence.get('automation_binding_generation') == a.get('binding_generation')
              and t.get('automation_run_id') == evidence.get('automation_run_id') == run.get('immutable_external_id')
              and run.get('record_kind') == 'AutomationRun')
        check('artifact_membership_mismatch', artifact.get('record_kind') == 'RemoteArtifact'
              and t.get('pipeline_artifact_id') == artifact.get('immutable_external_id')
              and all(t.get(k) == evidence.get(k) for k in ('pipeline_id', 'pipeline_definition_ref', 'job_id'))
              and run.get('revision_ref') == artifact.get('revision_ref'))
        for record in (run, artifact):
            check('run_binding_mismatch', record.get('provider_kind') == a.get('provider')
                  and record.get('instance_id') == a.get('instance_id')
                  and record.get('account_id') == a.get('account_id')
                  and record.get('repository_id') == service_repo)
        check('digest_mismatch', bool(evidence.get('artifact_digest')) and t.get('expected_digest') == evidence.get('artifact_digest'))
        for terminal in (r, c):
            identity = _dict(terminal.get('artifact_identity'))
            check('digest_mismatch', identity.get('expected_digest') == t.get('expected_digest'))
            check('artifact_target_mismatch', identity.get('remote_artifact_record_ref') == t.get('remote_artifact_record_ref')
                  and identity.get('pipeline_artifact_id') == t.get('pipeline_artifact_id'))
            check('run_binding_mismatch', identity.get('automation_run_id') == t.get('automation_run_id'))
    if cmd in {'cmd.forge.pipeline.' + area + '.' + verb for area in ('secret', 'variable') for verb in ('set', 'remove')}:
        check('setting_scope_mismatch', r.get('target_ref') == t.get('hosted_setting_scope_ref'))
    if cmd == _DELETE:
        cr, cc = (_dict(v.get(k)) for k in ('verified_create_result', 'verified_create_receipt'))
        resolved_target = _dict(v.get('verified_create_target'))
        created_binding = _dict(resolved_target.get('repository_binding'))
        check('verified_create_target_mismatch', bool(resolved_target)
              and cr.get('target_ref') == resolved_target.get('target_ref')
              and all(created_binding.get(k) == b.get(k) for k in (
                  'binding_id', 'provider', 'provider_variant', 'normalized_host',
                  'account_id', 'repo_id', 'provider_repository_id',
                  'repository_locator', 'binding_generation')))
        check('command_mismatch', cr.get('command_id') == cc.get('command_id') == _CREATE)
        check('verified_create_result_mismatch', bool(cr) and t.get('verified_create_result_ref') == cr.get('operation_id')
              and cr.get('outcome') == 'succeeded' and bool(cr.get('terminal_provider_result_ref'))
              and all(cr.get(k) == q.get(k) for k in ('provider', 'repository_binding_ref', 'expected_binding_generation')))
        check('verified_create_receipt_mismatch', bool(cc) and t.get('verified_create_receipt_ref') == cc.get('receipt_id') == cr.get('receipt_ref')
              and cc.get('outcome') == 'succeeded'
              and all(cc.get(k) == cr.get(k) for k in ('operation_id', 'command_instance_id', 'provider', 'repository_binding_ref', 'expected_binding_generation')))
    check('secret_value_leak', not _secret(v))
    return sorted(failures)


def _admission(v: dict) -> list[str]:
    failures = set()
    def check(code, condition):
        if not condition:
            failures.add('forge_admission_' + code)
    capability = v.get('requested_capability')
    profile, observation, permission = (_dict(v.get(k)) for k in ('matrix_profile', 'dimension_observation', 'permission_record'))
    check('profile_mismatch', v.get('provider_profile') == profile.get('profile_id') == observation.get('profile_id'))
    check('matrix_mismatch', v.get('matrix_dimension') == observation.get('dimension') and v.get('matrix_state') == observation.get('state'))
    check('permission_mismatch', v.get('permission_scope') == permission.get('scope') and v.get('permission_decision') == permission.get('decision'))
    available = v.get('availability_state') == 'available'
    check('matrix_not_ready', not available or (observation.get('state') == 'available' and observation.get('currentness') == 'current'))
    check('permission_not_ready', not available or permission.get('decision') == 'allow')
    # A profile without built-in CI may still use a separately configured
    # automation binding; this admission profile describes only its own CI.
    check('service_unavailable', not available or bool(profile.get('automation_service')))
    if capability == 'pipeline_artifacts':
        check('artifact_authority_mismatch', v.get('matrix_dimension') == 'artifact_read'
              and v.get('download_authority') == {'download':'filesafe_destination','import':'artifact_import_handoff'}.get(v.get('artifact_disposition'))
              and v.get('permission_scope') == 'local_mutation')
    else:
        surface = _dict(v.get('admin_surface'))
        rows = [x for x in surface.get('actions', []) if isinstance(x, dict) and x.get('area') == capability]
        check('admin_area_mismatch', v.get('admin_area') == capability and len(rows) == 1)
        if len(rows) == 1:
            row = rows[0]
            check('admin_write_mismatch', v.get('admin_write_state') == row.get('write_state'))
            check('admin_not_ready', not available or row.get('write_state') == 'ready')
            check('admin_permission_mismatch', row.get('permission_ref') == permission.get('permission_snapshot_ref'))
        check('admin_instance_mismatch', surface.get('instance_profile_ref') == v.get('instance_profile_ref'))
        expected_provider = {'github_cloud':'github','github_enterprise':'github','gitlab_saas':'gitlab','gitlab_self_managed':'gitlab','azure_devops_services':'azure_devops','azure_devops_server':'azure_devops','cursor_origin_native':'cursor_origin','cursor_origin_github_mirror':'github'}.get(v.get('provider_profile'), v.get('provider_profile'))
        check('admin_provider_mismatch', surface.get('provider') == expected_provider)
        check('write_authority_mismatch', v.get('matrix_dimension') == 'secrets_variables' and v.get('permission_scope') == 'remote_side_effect')
    return sorted(failures)


def forge_packet_semantic_failures(definition_name: str, value: Any) -> list[str]:
    """Additional joins; combine with the existing per-record Forge evaluator."""
    if not isinstance(value, dict):
        return []
    if definition_name == 'hosted_ci_command_roundtrip':
        return _roundtrip(value)
    if definition_name == 'hosted_ci_capability_admission':
        return _admission(value)
    if definition_name == 'command_availability':
        availability = _dict(value.get('availability'))
        if availability.get('state') == 'unsupported' and value.get('command_id', '').startswith('cmd.forge.pipeline.'):
            if any(x != _OFFICIAL for x in availability.get('allowed_action_ids', [])):
                return ['forge_availability_unsupported_native_fallback']
    return []


def _patched(base: dict, case: dict) -> dict:
    """Existing-path edits only: misspelled patches must not become evidence."""
    result = copy.deepcopy(base)
    for path, replacement in case.get('patch', {}).items():
        keys = path.split('.')
        node = result
        for key in keys[:-1]:
            node = node[int(key)] if isinstance(node, list) else node[key]
        key = int(keys[-1]) if isinstance(node, list) else keys[-1]
        if isinstance(node, dict) and key not in node:
            raise KeyError(path)
        node[key] = copy.deepcopy(replacement)
    for path in case.get('remove', []):
        keys = path.split('.')
        node = result
        for key in keys[:-1]:
            node = node[int(key)] if isinstance(node, list) else node[key]
        del node[int(keys[-1]) if isinstance(node, list) else keys[-1]]
    if result == base:
        raise ValueError('counterexample has no effective patch')
    return result


def validate_forge_counterexamples(schema: dict, fixtures: dict, *, registry=None,
                                   per_record_validator: Callable | None = None) -> list[dict]:
    """Validate patched real positives structurally, then compute named failures.

    Expected rules are required matches, not a whitelist that suppresses other
    genuine failed joins. Base failures and broken/missing patches fail closed.
    """
    if per_record_validator is None:
        from pm_packet_integration_semantics import forge_semantic_failures
        per_record_validator = forge_semantic_failures
    kwargs = {'registry': registry} if registry is not None else {}
    findings = []
    positives = {x['name']: x for x in fixtures.get('valid', []) if isinstance(x, dict) and 'name' in x}
    cases = fixtures.get('semantic_counterexamples')
    if not isinstance(cases, list) or not cases:
        return [{'code': 'forge_counterexamples_missing'}]
    names = set()
    for case in cases:
        name = case.get('name') if isinstance(case, dict) else None
        try:
            if not name or name in names:
                raise ValueError('missing or duplicate case name')
            names.add(name)
            base = positives[case['base_valid']]
            definition = case['definition']
            if base['definition'] != definition:
                raise ValueError('base definition mismatch')
            validator = Draft202012Validator({**schema, '$ref': '#/$defs/' + definition}, **kwargs)
            validator.validate(base['value'])
            baseline = set(per_record_validator(definition, base['value'])) | set(forge_packet_semantic_failures(definition, base['value']))
            if baseline:
                raise ValueError('invalid semantic base: ' + ','.join(sorted(baseline)))
            changed = _patched(base['value'], case)
            validator.validate(changed)
            actual = set(per_record_validator(definition, changed)) | set(forge_packet_semantic_failures(definition, changed))
            expected = case.get('violated_rules')
            if not isinstance(expected, list) or not expected or not all(isinstance(x, str) for x in expected):
                raise ValueError('missing named violated rules')
            missing = set(expected) - actual
            if missing:
                findings.append({'code':'forge_counterexample_rule_not_triggered','fixture':name,'missing_rules':sorted(missing),'actual_rules':sorted(actual)})
        except Exception as exc:
            findings.append({'code':'forge_counterexample_unevaluable','fixture':name,'detail':str(exc)[:500]})
    return findings
