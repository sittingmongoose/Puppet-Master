"""Static option contract oracle for FGI-011/015.

The two public records are actual consumed option selections and owner catalogs.
Static composition tests inject a fixture resolver; production must inject the
Forge owner's authenticated/versioned catalog resolver and trusted current facts.
No caller field can promote a resolver response or permission into trusted data.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import json
from functools import lru_cache
from pathlib import Path
import subprocess
import sys
import time
from typing import Callable, Mapping, Any

from jsonschema import Draft202012Validator


PROVIDER_CATEGORIES = {
    "github": ("template", "team_access", "repository_permissions", "repository_policy"),
    "gitlab": ("path", "template", "merge_request_settings", "protected_branches", "ci_variables", "runners"),
    "azure_devops": ("existing_team_project", "inherited_project_visibility"),
    "bitbucket_cloud": ("project_grouping", "slug", "main_branch", "fork_policy", "branch_policy", "pipelines"),
    "bitbucket_data_center": ("project_grouping", "slug", "main_branch", "fork_policy", "branch_policy", "pipelines"),
    "forgejo": ("mirror", "template", "team_access", "ssh_host", "ssh_port", "scoped_ca", "branch_policy", "actions"),
    "gitea": ("mirror", "template", "team_access", "ssh_host", "ssh_port", "scoped_ca", "branch_policy", "actions"),
    "cursor_origin": ("repository_settings", "integrations"),
}
VALUE_KINDS = ("boolean", "text", "integer", "catalog_choice", "catalog_choice_list", "resource_ref", "resource_ref_list", "protected_ref")
RESOURCE_KINDS = ("template", "source_revision", "team", "member", "repository", "branch", "policy", "ci_variable_metadata", "runner", "project", "namespace", "integration", "instance_trust", "git_transport", "credential_grant")
PHASES = ("create_api", "post_create", "source_control_transport", "instance_trust")


@dataclass(frozen=True)
class CreationOptionContext:
    """Trusted Forge-owner facts, never deserialized from a caller request.

    Each admitted reference set is the result of owner resolution and current
    permission evaluation, not the caller's requested list. allowed_effects binds
    owner and phase. References alone are not proof. The resolver must authenticate
    catalog provenance/signature before returning its bytes; the digest callback
    must implement the owner's exact canonical JSON contract.
    """
    provider: str
    provider_variant: str
    normalized_host: str
    instance_id: str
    catalog_ref: str
    catalog_revision: int
    adapter_schema_ref: str
    adapter_schema_revision: int
    api_compatibility_ref: str
    capability_snapshot_ref: str
    catalog_owner_ref: str
    now_utc: datetime
    admitted_capability_refs: frozenset[str]
    admitted_permission_refs: frozenset[str]
    allowed_effects: frozenset[tuple[str, str]]
    admitted_resource_refs: frozenset[tuple[str, str]]


@lru_cache(maxsize=1)
def _owner_schema():
    return json.loads((Path(__file__).resolve().parents[1] / "Plans" /
                       "forge_integration_contracts.schema.json").read_text())


def structural_errors(definition: str, record: Any) -> list[str]:
    owner = _owner_schema()
    schema = {"$schema": owner["$schema"], "$defs": owner["$defs"],
              "$ref": "#/$defs/" + definition}
    validator = Draft202012Validator(schema, format_checker=Draft202012Validator.FORMAT_CHECKER)
    return sorted("/".join(map(str, e.absolute_path)) + ":" + e.message for e in validator.iter_errors(record))


_PATTERN_WORKER = r'''
import json, re, resource, sys
resource.setrlimit(resource.RLIMIT_AS, (256 * 1024 * 1024, 256 * 1024 * 1024))
resource.setrlimit(resource.RLIMIT_CPU, (1, 1))
pattern, text = json.loads(sys.stdin.read())
try:
    compiled = re.compile(pattern)
    print('ok' if text is None or compiled.fullmatch(text) is not None else 'no_match')
except (re.error, OverflowError, ValueError):
    print('invalid')
'''


def _bounded_pattern(pattern, value, deadline):
    """Static oracle isolation, not a promise about a native regex engine.

    Keep the full existing regex language. Exceeded/unavailable verification
    budgets block instead of silently ignoring a constraint or matching in the
    parent. Isolated child imports resource; platforms without enforceable
    limits fail closed. The shared deadline bounds cumulative pattern work
    across catalog/selection evaluation, not only each individual pattern.
    """
    if len(pattern.encode('utf-8')) > 16384 or (value is not None and len(value.encode('utf-8')) > 1048576):
        return 'budget'
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        return 'budget'
    try:
        result = subprocess.run([sys.executable, '-I', '-c', _PATTERN_WORKER],
            input=json.dumps([pattern, value]), capture_output=True, text=True,
            timeout=min(0.5, remaining))
    except subprocess.TimeoutExpired:
        return 'budget'
    except (OSError, ValueError):
        return 'unavailable'
    if result.returncode != 0 or result.stdout.strip() not in ('ok', 'no_match', 'invalid'):
        return 'unavailable'
    return result.stdout.strip()


def _value_failures(value: Mapping[str, Any], descriptor: Mapping[str, Any], deadline=None) -> list[str]:
    deadline = time.monotonic() + 5 if deadline is None else deadline
    failures = []
    kind = value["kind"]
    if kind != descriptor["value_kind"]:
        return ["value_kind_mismatch"]
    if kind in ("catalog_choice", "catalog_choice_list"):
        choices = [value["choice_id"]] if kind == "catalog_choice" else value["choice_ids"]
        if not set(choices) <= set(descriptor["choices"]):
            failures.append("choice_not_in_resolved_catalog")
    if kind in ("resource_ref", "resource_ref_list", "protected_ref"):
        if value["resource_kind"] != descriptor["resource_kind"]:
            failures.append("resource_kind_mismatch")
    if kind == "integer":
        for bound, sign in (("minimum", -1), ("maximum", 1)):
            limit = descriptor[bound]
            if limit is not None and (value["value"] - limit) * sign > 0:
                failures.append("integer_" + bound)
    if kind == "text":
        length = len(value["value"])
        if descriptor["min_length"] is not None and length < descriptor["min_length"]:
            failures.append("text_min_length")
        if descriptor["max_length"] is not None and length > descriptor["max_length"]:
            failures.append("text_max_length")
        pattern = descriptor["pattern"]
        if pattern is not None:
            result = _bounded_pattern(pattern, value["value"], deadline)
            if result == 'no_match':
                failures.append('text_provider_pattern')
            elif result != 'ok':
                failures.append('catalog_pattern_' + result)
    if kind in ("catalog_choice_list", "resource_ref_list"):
        count = len(value["choice_ids"] if kind == "catalog_choice_list" else value["refs"])
        if descriptor["min_items"] is not None and count < descriptor["min_items"]:
            failures.append("list_min_items")
        if descriptor["max_items"] is not None and count > descriptor["max_items"]:
            failures.append("list_max_items")
    return failures


def catalog_semantic_failures(catalog: Mapping[str, Any], *, deadline=None) -> list[str]:
    """Validate actual descriptor content, not just reference spellings."""
    deadline = time.monotonic() + 5 if deadline is None else deadline
    errors = structural_errors("creation_field_catalog", catalog)
    if errors:
        return ["catalog_shape:" + e for e in errors]
    failures = []
    expected = set(PROVIDER_CATEGORIES[catalog["provider"]])
    if set(catalog["category_inventory"]) != expected:
        failures.append("catalog_provider_category_inventory")
    fields = catalog["fields"]
    if len({f["field_id"] for f in fields}) != len(fields):
        failures.append("catalog_duplicate_field_id")
    # Every named source category remains represented even when its actual
    # adapter truthfully marks every descriptor unsupported.
    if {f["category"] for f in fields} != expected:
        failures.append("catalog_provider_category_coverage")
    by_id = {f["field_id"]: f for f in fields}
    for f in fields:
        if time.monotonic() >= deadline:
            return sorted(set(failures + ['catalog_validation_budget_exceeded']))
        name, kind = f["field_id"], f["value_kind"]
        if (f["data_classification"] == "protected_write_only") != (kind == "protected_ref"):
            failures.append("catalog_secret_value_kind:" + name)
        allowed = set()
        if kind in ("catalog_choice", "catalog_choice_list"):
            if f["supported"] and not f["choices"]:
                failures.append("catalog_empty_supported_choices:" + name)
            allowed.add("choices")
        elif f["choices"]:
            failures.append("catalog_inapplicable_choices:" + name)
        if kind in ("resource_ref", "resource_ref_list", "protected_ref"):
            allowed.add("resource_kind")
            if f["resource_kind"] is None or (kind == "protected_ref" and f["resource_kind"] != "credential_grant"):
                failures.append("catalog_resource_kind:" + name)
        if kind == "integer":
            allowed |= {"minimum", "maximum"}
        if kind == "text":
            allowed |= {"min_length", "max_length", "pattern"}
            if f["pattern"] is not None:
                result = _bounded_pattern(f['pattern'], None, deadline)
                if result != 'ok':
                    failures.append('catalog_pattern_' + result + ':' + name)
        if kind in ("catalog_choice_list", "resource_ref_list"):
            allowed |= {"min_items", "max_items"}
        for key in ("resource_kind", "minimum", "maximum", "min_length", "max_length", "pattern", "min_items", "max_items"):
            if key not in allowed and f[key] is not None:
                failures.append("catalog_inapplicable_constraint:" + name + ":" + key)
        for lower, upper in (("minimum", "maximum"), ("min_length", "max_length"), ("min_items", "max_items")):
            if f[lower] is not None and f[upper] is not None and f[lower] > f[upper]:
                failures.append("catalog_inverted_bounds:" + name + ":" + lower)
    rules = catalog["cross_field_constraints"]
    if len({r["constraint_id"] for r in rules}) != len(rules):
        failures.append("catalog_duplicate_constraint_id")
    for rule in rules:
        if time.monotonic() >= deadline:
            return sorted(set(failures + ['catalog_validation_budget_exceeded']))
        source = by_id.get(rule["when"]["field_id"])
        other = by_id.get(rule["other_field_id"])
        if source is None or other is None:
            failures.append("catalog_constraint_unknown_field:" + rule["constraint_id"])
            continue
        if source["field_id"] == other["field_id"]:
            failures.append("catalog_constraint_self_reference:" + rule["constraint_id"])
        if rule["relation"] == "same_value" and source["value_kind"] != other["value_kind"]:
            failures.append("catalog_constraint_incompatible_value_kinds:" + rule["constraint_id"])
        if rule["when"]["comparison"] == "equals":
            failures += ["catalog_predicate:" + rule["constraint_id"] + ":" + x for x in _value_failures(rule["when"]["value"], source, deadline)]
    return sorted(set(failures))


def validate_creation_options(selections: Mapping[str, Any], *,
                              resolve_catalog: Callable[[str], Mapping[str, Any]],
                              digest_record: Callable[[Mapping[str, Any]], str],
                              context: CreationOptionContext) -> list[str]:
    """Validate actual runtime selections against authenticated catalog/facts.

    Errors are deterministic static contract findings. The function does not
    perform authentication, owner queries, grants, mutations or native execution.
    Resolver/digest failures block; no fallback to supplied ref or cached label.
    """
    deadline = time.monotonic() + 5
    errors = structural_errors("creation_option_selections", selections)
    if errors:
        return ["selection_shape:" + e for e in errors]
    failures = []
    for key in ("provider", "provider_variant", "normalized_host", "instance_id", "catalog_ref", "catalog_revision"):
        if selections[key] != getattr(context, key):
            failures.append("selection_current_" + key + "_mismatch")
    try:
        catalog = resolve_catalog(selections["catalog_ref"])
    except Exception:
        return sorted(set(failures + ["catalog_resolution_failed"]))
    errors = catalog_semantic_failures(catalog, deadline=deadline)
    if errors:
        return sorted(set(failures + errors))
    try:
        if digest_record(catalog) != selections["catalog_sha256"]:
            failures.append("catalog_digest_mismatch")
    except Exception:
        failures.append("catalog_digest_unavailable")
    if catalog["catalog_id"] != selections["catalog_ref"]:
        failures.append("catalog_resolved_identity_mismatch")
    for key in ("provider", "provider_variant", "normalized_host", "instance_id", "catalog_revision",
                "adapter_schema_ref", "adapter_schema_revision", "api_compatibility_ref", "capability_snapshot_ref"):
        if catalog[key] != getattr(context, key):
            failures.append("catalog_current_" + key + "_mismatch")
    if catalog["owner_ref"] != context.catalog_owner_ref:
        failures.append("catalog_owner_mismatch")
    try:
        issued = datetime.fromisoformat(catalog["issued_at_utc"].replace("Z", "+00:00"))
        expires = datetime.fromisoformat(catalog["expires_at_utc"].replace("Z", "+00:00"))
        if context.now_utc.tzinfo is None or not issued <= context.now_utc < expires:
            failures.append("catalog_not_current")
    except (ValueError, TypeError):
        failures.append("catalog_time_invalid")
    descriptors = {f["field_id"]: f for f in catalog["fields"]}
    fields = selections["fields"]
    if len({f["field_id"] for f in fields}) != len(fields):
        failures.append("selection_duplicate_field_id")
    selected = {f["field_id"]: f for f in fields}
    for field_id, descriptor in descriptors.items():
        if descriptor["required_selection"] and field_id not in selected:
            failures.append("required_selection_missing:" + field_id)
    for field in fields:
        if time.monotonic() >= deadline:
            return sorted(set(failures + ['selection_validation_budget_exceeded']))
        name = field["field_id"]
        descriptor = descriptors.get(name)
        if descriptor is None:
            failures.append("selection_unknown_field:" + name)
            continue
        if not descriptor["supported"]:
            failures.append("selection_unsupported:" + name)
        for key in ("category", "owner_ref", "effect_phase", "capability_ref", "permission_ref"):
            if field[key] != descriptor[key]:
                failures.append("selection_descriptor_" + key + "_mismatch:" + name)
        if descriptor["capability_ref"] not in context.admitted_capability_refs:
            failures.append("selection_capability_not_admitted:" + name)
        if descriptor["permission_ref"] not in context.admitted_permission_refs:
            failures.append("selection_permission_not_admitted:" + name)
        if (descriptor["owner_ref"], descriptor["effect_phase"]) not in context.allowed_effects:
            failures.append("selection_owner_phase_not_admitted:" + name)
        value = field["value"]
        failures += ["selection_value:" + name + ":" + x for x in _value_failures(value, descriptor, deadline)]
        if value["kind"] in ("resource_ref", "resource_ref_list", "protected_ref"):
            refs = value["refs"] if value["kind"] == "resource_ref_list" else [value["ref"]]
            for owner_ref in refs:
                if (value["resource_kind"], owner_ref) not in context.admitted_resource_refs:
                    failures.append("selection_resource_not_admitted:" + name)
    for rule in catalog["cross_field_constraints"]:
        if time.monotonic() >= deadline:
            return sorted(set(failures + ['selection_validation_budget_exceeded']))
        source = selected.get(rule["when"]["field_id"])
        applies = source is not None and (rule["when"]["comparison"] == "present" or source["value"] == rule["when"]["value"])
        if not applies:
            continue
        other = selected.get(rule["other_field_id"])
        relation = rule["relation"]
        violated = ((relation == "requires" and other is None)
                    or (relation == "excludes" and other is not None)
                    or (relation == "same_value" and (other is None or source["value"] != other["value"])))
        if violated:
            failures.append("selection_cross_field:" + rule["constraint_id"])
    return sorted(set(failures))
