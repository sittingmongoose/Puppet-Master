"""Shared static DL-039 non-admission checks, never a storage authority source."""

import hashlib
import json

AUTHORITY_REF = "Plans/Decision_Log.md#DL-039"
DECISION_ID = "EMIT-PERSIST-026"
DISPOSITION = "quarantined_not_admitted"
DENIAL = "event_not_admitted_dl039"
PREEXISTING_REGISTRY_COUNT = 40
PREEXISTING_REGISTRY_ROWS_SHA256 = "4f701c9598003d7c01a405f18f7991b373379eca8b182cf6222540a4746d1756"


def preexisting_registry_unchanged(manifest, registry):
    """Protect actual upstream membership, not the unlanded Browser proposal.

    This is scoped input preservation, not a PNC/currentness baseline update.
    Manifest edits cannot redefine the protected prefix or authorize additions.
    """
    if input_shape_failures(manifest, registry):
        return False
    if (manifest["preexisting_family_prefix_count"] != PREEXISTING_REGISTRY_COUNT
            or manifest["preexisting_family_prefix_sha256"] != PREEXISTING_REGISTRY_ROWS_SHA256
            or len(registry["families"]) < PREEXISTING_REGISTRY_COUNT):
        return False
    encoded = json.dumps(registry["families"][:PREEXISTING_REGISTRY_COUNT], sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(encoded).hexdigest() == PREEXISTING_REGISTRY_ROWS_SHA256


def input_shape_failures(manifest, registry):
    """Reject malformed contract inputs before either caller traverses them."""
    failures = []
    if not isinstance(manifest, dict):
        failures.append("manifest_root")
    else:
        if (not isinstance(manifest.get("preexisting_family_prefix_count"), int)
                or isinstance(manifest.get("preexisting_family_prefix_count"), bool)
                or not isinstance(manifest.get("preexisting_family_prefix_sha256"), str)):
            failures.append("manifest_prefix_shape")
        rows = manifest.get("rows")
        if not isinstance(rows, list):
            failures.append("manifest_rows")
        else:
            for index, row in enumerate(rows):
                if not isinstance(row, dict):
                    failures.append("manifest_row:" + str(index))
                    continue
                for field in ("event_type", "command_id", "semantic_owner_ref",
                              "producer_component", "scope_policy"):
                    if not isinstance(row.get(field), str) or not row[field]:
                        failures.append("manifest_row_field:" + str(index) + ":" + field)
                for field, keys in (
                        ("payload_schema_ref", ("path", "json_pointer", "schema_id")),
                        ("proposed_retention_policy_ref", ("registry_schema_id", "policy_id", "policy_version"))):
                    value = row.get(field)
                    if not isinstance(value, dict) or any(not isinstance(value.get(key), str) for key in keys):
                        failures.append("manifest_row_field:" + str(index) + ":" + field)
    if not isinstance(registry, dict):
        failures.append("registry_root")
    elif not isinstance(registry.get("families"), list):
        failures.append("registry_families")
    else:
        for index, row in enumerate(registry["families"]):
            if not isinstance(row, dict) or not isinstance(row.get("event_type"), str):
                failures.append("registry_family:" + str(index))
    return failures


def invalid_input_report(schema_id, failures):
    """No fixture results are claimed when input traversal cannot proceed."""
    return {"schema_id": schema_id, "status": "fail", "failures": failures,
            "admitted_events": 0, "event_disposition": DISPOSITION,
            "event_persistence_authorized": False}


def disposition_failures(manifest, registry, event_types):
    """Require explicit emit-only provenance and absence from the live registry.

    This validates the scoped consumer contracts. It does not modify, replace or
    certify the independently owned fixed54 holding receipt or its validator.
    Proposed schema/family/retention metadata cannot authorize persistence.
    """
    failures = input_shape_failures(manifest, registry)
    if failures:
        return failures
    if (manifest.get("authority_ref") != AUTHORITY_REF
            or manifest.get("decision_id") != DECISION_ID
            or manifest.get("owner_disposition") != "ACCEPT_EMIT_OBLIGATION_ONLY"
            or manifest.get("admission_status") != DISPOSITION
            or manifest.get("event_persistence_authorized") is not False
            or manifest.get("event_projection_authorized") is not False):
        failures.append("admission_disposition")
    live = {row["event_type"] for row in registry["families"]}
    failures.extend("event_registry_admission_forbidden:" + name
                    for name in sorted(set(event_types) & live))
    for row in manifest["rows"]:
        if (row.get("admission_status") != DISPOSITION
                or row.get("metadata_disposition") != "proposed_contract_only_no_registration"
                or "retention_policy_ref" in row or "physical_storage_owner" in row):
            failures.append("row_admission_disposition:" + row["event_type"])
        if row.get("proposed_retention_policy_ref") != {
                "registry_schema_id": "pm.storage_value_registry.v2",
                "policy_id": "RP-AUTHORITY-INDEFINITE", "policy_version": "1.0.0"}:
            failures.append("proposed_retention_metadata:" + row["event_type"])
    return failures


def deny_admission(candidate_errors, event_type, expected_types):
    """Candidate validity is a separate question from permission to append."""
    if not isinstance(event_type, str):
        return sorted(set(candidate_errors) | {"event_type_shape"})
    return sorted(set(candidate_errors) | ({DENIAL} if event_type in expected_types else set()))
