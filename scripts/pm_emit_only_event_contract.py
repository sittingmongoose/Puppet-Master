"""Shared static DL-039 non-admission checks, never a storage authority source."""

import hashlib
import json
import copy

AUTHORITY_REF = "Plans/Decision_Log.md#DL-039"
DECISION_ID = "EMIT-PERSIST-026"
DISPOSITION = "quarantined_not_admitted"
DENIAL = "event_not_admitted_dl039"
PREEXISTING_REGISTRY_COUNT = 40
# Re-frozen 2026-09-23 (was 4f701c95..., last true at 4fe66204bd). Six landed commits changed
# upstream rows since, each on main with its own record in reports/event-authority-20260911/:
# 3890d86c70 goal.created v3, 5fc9747b6f goal.updated v3, 1136661ddc goal.cancelled v3,
# e686963ad5 goal_run.started v3, a3c511657f goal_run.cancelled v3, f6350caf27 goal_run.certified
# v3. Row order and membership are unchanged. Re-freeze again only for landed, recorded changes.
# Re-frozen 2026-10-10 (was a27cf49b...): DL-188 (D42) moves workspace.layout_changed to family revision
# 2.0.0 (CV-361), approved by Jared; row order and membership are unchanged.
PREEXISTING_REGISTRY_ROWS_SHA256 = "237b757a8f78e70fc77d3332f27eb51f0c4f80f2f5fbc16d5ff6792a344c49f8"

# CV-366/GRS-086 add an exact scope-selector edition, with app producers still
# requiring owner adoption. Project payloads and the upstream preservation hash
# remain unchanged. These digests cover only the three new edition fields.
EVENT_EDITION_DELTAS = {
    'event-family-goal-run-blocked': '8a370d4117f280a6ee75e42130ad628cf093b93abb42d9d21410ac2342c51c99',
    'event-family-goal-run-cancelled': '16df42254cacfc5dd7a406cc2287d2a3c137ad7173c768cf4c15776759f7e683',
    'event-family-goal-run-started': '5b35d7eed54e1f923920cba20e890eeef18a75ed3ab466b86a84b9d0fe5c2a18',
    'event-family-goal-blocked': '910a22878a8043d786f4071be7c0d01fc90b9dec18e0bdec476810e30a3908df',
    'event-family-goal-cancelled': '4afe090c7f14a6ef738d9873718a0e1cd66d18f4548df0311f9e540f0065ab4c',
    'event-family-goal-completed': 'bb88a07045a6e16cae0ae7a09aee2f9088045932099f9252f05553244f425b7a',
    'event-family-goal-created': '65fdc17ff924c6fd9b6f3615445591286193fb97b8302f9800f48185a778a646',
    'event-family-goal-evidence-captured': '3c0826be830f7e2c4bd043701578ab67fbf61663346fb70a5139e1b21440c469',
    'event-family-goal-receipt-recorded': '8874870fd7a1cb671b9f2ddce07217efa0dcb478057ab3ab4823c6c756ab84f9',
    'event-family-goal-tool-check-recorded': 'c14269072e6758d9a5a13738ac855cf3a481b48a7333570e703fe5f6c3268d5a',
    'event-family-goal-updated': '8ffaabea855bacf8c95d39dc75323c59671a382433433e3e446d66083872d787',
}


def legacy_registry_rows(rows):
    """Project exact approved selector additions out of the historical pin.

    Unknown edits, changed app admission, or changed Project payload bytes fail;
    this is not a governance rebaseline or a general metadata exemption.
    """
    result = copy.deepcopy(rows)
    for row in result:
        ident = row.get('family_id')
        if ident in EVENT_EDITION_DELTAS and 'payload_versions' in row:
            edition = {k: row[k] for k in ('scope_policy', 'payload_versions', 'payload_selection_policy')}
            digest = hashlib.sha256(json.dumps(edition, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
            if digest != EVENT_EDITION_DELTAS[ident]:
                raise ValueError('unknown Goal scope-selector edition: ' + ident)
            row['scope_policy'] = 'project_only'
            del row['payload_versions'], row['payload_selection_policy']
    return result


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
    try:
        preserved = legacy_registry_rows(registry["families"][:PREEXISTING_REGISTRY_COUNT])
    except (KeyError, ValueError):
        return False
    encoded = json.dumps(preserved, sort_keys=True, separators=(",", ":")).encode()
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
