"""ADO-008 static cross-owner conformance oracle; never a native permission grant.

Only the request/return are caller input. provider/onboarding/route/discovery
records below represent independent reads by their actual owners, not caller
assertions. Runtime adapters must acquire them under current auth/permission and
source-request fences; fixtures exercise comparisons, not acquisition security.
"""
from __future__ import annotations

import hashlib
import json
from datetime import datetime
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = "Plans/azure_devops_setup_contracts.schema.json"
FIXTURES = "Plans/azure_devops_setup_contract_fixtures.json"
DEFINITIONS = {
    "handoff": "azure_setup_handoff_request", "route": "azure_official_route_record",
    "provider": "azure_provider_authoritative_state", "onboarding": "azure_onboarding_owner_state",
    "discovery": "azure_project_discovery_record", "return": "azure_setup_return_pair",
}
IDENTITY = ("provider_variant", "normalized_instance", "container_scope", "account_id")


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def timestamp(value):
    result = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if result.tzinfo is None:
        raise ValueError("timezone required")
    return result


def definition_errors(schema, name, value):
    selected = {"$schema": schema["$schema"], "$defs": schema["$defs"], "$ref": "#/$defs/" + name}
    return list(Draft202012Validator(selected, format_checker=FormatChecker()).iter_errors(value))


def adoption_failures(case, schema=None):
    """Compare proposed handoff/return with independently acquired owner records."""
    schema = schema or json.loads((ROOT / SCHEMA).read_text())
    records = case.get("records", {})
    for role, definition in DEFINITIONS.items():
        if definition_errors(schema, definition, records.get(role)):
            return ["invalid_" + role + "_shape"]
    h, route, provider, owner, discovery, result = (records[k] for k in DEFINITIONS)
    failures = []
    def require(condition, code):
        if not condition and code not in failures:
            failures.append(code)
    try:
        now = timestamp(case["now_utc"])
        issued, expires = timestamp(h["issued_at_utc"]), timestamp(h["expires_at_utc"])
        observed, returned = timestamp(discovery["discovered_at_utc"]), timestamp(result["returned_at_utc"])
        require(issued <= returned <= now < expires, "handoff_expired_or_future")
        require(timestamp(route["verified_at_utc"]) <= now, "official_route_future")
        require(issued <= observed <= returned, "discovery_not_fresh_for_handoff")
    except (ValueError, KeyError, TypeError):
        return ["invalid_comparison_time"]
    require(owner["current_phase"] == h["owner_phase"], "owner_phase_changed")
    expected_container = "services_organization" if h["provider_variant"] == "azure_devops_services" else "server_collection"
    require(h["container_scope"]["kind"] == expected_container, "variant_container_mismatch")
    for other in (route, provider, discovery):
        for key in IDENTITY:
            require(h[key] == other[key], "identity_mismatch_" + key)
    require(h["official_route_ref"] == route["route_id"], "official_route_substituted")
    require(route["catalog_generation"] == provider["current_catalog_generation"] == discovery["observed_catalog_generation"], "stale_catalog")
    require(h["web_approved_domain"] == route["web_domain"] == provider["current_web_approved_domain"], "web_domain_policy_mismatch")
    require(h["api_approved_domain"] == route["api_domain"] == provider["current_api_approved_domain"], "api_domain_policy_mismatch")
    for key in ("onboarding_session_id", "project_draft_ref", "selected_source_ref", "initiating_client_id"):
        require(h[key] == owner[key], "owner_context_mismatch_" + key)
    require(h["project_draft_revision"] == owner["current_draft_revision"] == result["expected_draft_revision"], "stale_draft")
    for key in ("precommit_authorization_ref", "human_confirmation_ref", "permission_snapshot_ref", "capability_snapshot_ref"):
        require(h[key] == owner["active_" + key], "authorization_mismatch_" + key)
    for key in ("onboarding_session_id", "project_draft_ref", "initiating_client_id"):
        require(h[key] == result[key], "return_context_mismatch_" + key)
    require(result["handoff_ref"] == h["handoff_id"] and result["handoff_sha256"] == digest(h), "handoff_binding_mismatch")
    require(result["discovery_ref"] == discovery["discovery_id"] == owner["current_discovery_ref"], "discovery_substituted")
    require(result["refresh_ref"] == discovery["refresh_ref"] == owner["current_refresh_ref"], "refresh_substituted")
    require(discovery["human_refresh_confirmation_ref"] == owner["current_refresh_confirmation_ref"], "refresh_confirmation_mismatch")
    require(discovery["access_state"] == "verified_accessible", "project_not_accessible")
    require(discovery["project_guid"] is not None and discovery["project_name"] is not None and discovery["provider_resource_ref"] is not None and discovery["hierarchy_path_ref"] is not None, "provider_resource_incomplete")
    require(discovery["project_kind"] == "git", "tfvc_container_unsupported")
    selection = result["draft_selection"]
    require(selection["adopted"] is True, "no_adoption_requested")
    for key in ("project_guid", "project_name", "project_kind"):
        require(selection[key] == discovery[key], "selection_mismatch_" + key)
    return failures


def validate_azure_setup_pairs(pack):
    """Return gate findings, including cases whose expected rejection is unproved."""
    cases = pack.get("semantic_cases", [])
    findings = []
    if not cases:
        return [{"code": "azure_setup_semantic_cases_missing", "fixture": FIXTURES}]
    seen = set()
    for case in cases:
        name = case.get("name")
        if not name or name in seen:
            findings.append({"code": "azure_setup_case_name_invalid", "case": name})
        seen.add(name)
        failures = adoption_failures(case)
        expected = case.get("expected_accepted")
        if not isinstance(expected, bool) or expected != (not failures) or (not expected and case.get("expected_reason") not in failures):
            findings.append({"code": "azure_setup_semantic_verdict_mismatch", "fixture": FIXTURES, "case": name, "failures": failures})
    return findings


def check_all():
    schema = json.loads((ROOT / SCHEMA).read_text())
    pack = json.loads((ROOT / FIXTURES).read_text())
    Draft202012Validator.check_schema(schema)
    findings = validate_azure_setup_pairs(pack)
    for group in ("valid", "invalid"):
        for case in pack[group]:
            errors = definition_errors(schema, case["definition"], case["value"])
            if (not errors) != (group == "valid"):
                findings.append({"code": "azure_setup_shape_expectation", "case": case["name"]})
    return findings


if __name__ == "__main__":
    failures = check_all()
    print(json.dumps({"status": "fail" if failures else "pass", "failures": failures}, indent=2))
    raise SystemExit(int(bool(failures)))
