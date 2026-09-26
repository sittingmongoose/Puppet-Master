"""Doctor application-update owner read: finite static joins, never native authority.

The two `app_update` source occurrences of the Doctor source catalog consume exactly
one read-only owner fact. This module checks the closed static shape of that read,
the one-read/two-occurrence projection, and the join between the disclosed values
and the original owner records a resolver read.

Authority rules that no static artifact may claim:
  * injected originals are compared only as labeled static doubles;
  * `certifies_native_issuer` is always False; there is no success return value that
    certifies a native issuer, a real permission grant, physical custody or an
    observed update/Server result;
  * a copied caller value, a schema-valid digest, an internally self-consistent
    payload and a command outcome are never treated as owner evidence;
  * a missing read stays unbound/unknown or failed. Query completion is not health;
  * the lifecycle disclosure is compared with the typed service-issued
    `ApplicationUpdateSelectedCurrentJournalOriginal` that the independent
    `resolve_selected_current_original` interface reads from the service's own
    restart-surviving journal/current-operation authority. Absent, ambiguous, foreign or
    caller-substituted selections fail; a fixture or resolver label is not an original.

Callers hold the native fences: the Permissions-owned read admission, the runtime
resource governor admission, the actual owner resolvers and the physical records.
"""
from __future__ import annotations

import copy
import hashlib
import json
import re
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

PLANS = Path(__file__).resolve().parents[1] / "Plans"

OWNER_SCHEMA_FILES = (
    "doctor_contracts.schema.json",
    "doctor_application_update_owner_read_contracts.schema.json",
    "application_update_check_contracts.schema.json",
    "release_update_contracts.schema.json",
    "server_system_contracts.schema.json",
)

FACT_KEY = "application_update"
OWNER_READ_OCCURRENCES = ("sep03-doctor-008", "sep03-doctor-043")
SOURCE_POINTERS = {"sep03-doctor-008": "/groups/0/checks/7", "sep03-doctor-043": "/groups/5/checks/0"}
REQUIRED_DIMENSIONS = {
    "sep03-doctor-008": ["version", "channel", "install source", "available update", "restart requirement"],
    "sep03-doctor-043": ["version", "channel", "install source", "restart", "protocol"],
}
OWNER_READ_FIELD_KEYS = (
    "version",
    "channel",
    "install_source",
    "available_update",
    "restart_requirement",
    "protocol",
)

AUTHORITY_CLASSES = ("fixture_only_static_double", "native_owner_resolver")

SELECTED_CURRENT_OWNER_REF = "Plans/Release_Supply_Chain.md#RSC-014"
SELECTED_CURRENT_LABEL_PATTERN = re.compile(
    r"(^|[:._/-])(fixture|fixtures|resolver[_-]?label|label|asserted[_-]?witness|witness|self[_-]?asserted)($|[:._/-])"
)

# Owner values that are display, cache or command projections rather than owner records.
# These are the exact substitutions the accepted contract forbids.
NON_OWNER_SOURCE_PATTERNS = (
    ("mutating_command_source", re.compile(r"(^|[:._/-])cmd\.update\.app\.(check|download|install_restart|rollback|cancel_download|automatic_set_enabled|remind_later)($|[:._/-])")),
    ("command_result_source", re.compile(r"(^|[:._/-])(command_result|command_output|command_receipt|command:update)($|[:._/-])")),
    ("cached_projection_source", re.compile(r"(^|[:._/-])(cache|panel|settings_projection|card_projection|client_projection)($|[:._/-])")),
    ("client_display_source", re.compile(r"(^|[:._/-])(client_banner|banner|window_title|package_filename|filename|endpoint_text|handler_default)($|[:._/-])")),
)


def _time(value):
    parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    if parsed.tzinfo is None or parsed.utcoffset() != timedelta(0):
        raise ValueError("not UTC")
    return parsed


@lru_cache(maxsize=1)
def _registry():
    schema = json.loads((PLANS / "doctor_application_update_owner_read_contracts.schema.json").read_text())
    docs = [json.loads((PLANS / name).read_text()) for name in OWNER_SCHEMA_FILES]
    registry = Registry()
    for document in docs:
        registry = registry.with_resource(document["$id"], Resource.from_contents(document))
    return schema, registry


def structural_errors(definition, value):
    schema, registry = _registry()
    validator = Draft202012Validator(
        {"$schema": schema["$schema"], "$ref": schema["$id"] + "#/$defs/" + definition},
        registry=registry,
        format_checker=FormatChecker(),
    )
    return [error.message for error in validator.iter_errors(value)]


def payload_digest(fields):
    """Canonical digest of the disclosed non-secret typed values only."""

    canonical = json.dumps(fields, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _walk_strings(value, path="$"):
    if isinstance(value, str):
        yield path, value
    elif isinstance(value, dict):
        for key, child in value.items():
            yield from _walk_strings(child, path + "." + str(key))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from _walk_strings(child, path + "[" + str(index) + "]")


SENSITIVE_MATERIAL_PATTERN = re.compile(
    r"(^|[:._/-])(credential|credentials|signing[_-]?key|private[_-]?key|token|token[_-]?ref|"
    r"package[_-]?bytes|artifact[_-]?content|release[_-]?note[_-]?body)($|[:._/-])"
)


def _sensitive_material_failures(value, prefix):
    failures = []
    for _path, text in _walk_strings(value):
        if SENSITIVE_MATERIAL_PATTERN.search(text):
            failures.append(prefix + "_sensitive_material_ref")
            break
    return failures


def _source_class_failures(owner_ref, prefix):
    failures = []
    for label, pattern in NON_OWNER_SOURCE_PATTERNS:
        if pattern.search(owner_ref):
            failures.append(prefix + "_" + label)
    return failures


def _scope_join_failures(scope, target, expected_scope, prefix):
    failures = []
    if target["target_kind"] != "application":
        failures.append(prefix + "_target_kind")
    if target["identity_ref"] != scope["installation_id"]:
        failures.append(prefix + "_installation_identity")
    if target["server_id"] != scope["server_id"]:
        failures.append(prefix + "_server_identity")
    if target["installation_generation"] != scope["installation_generation"]:
        failures.append(prefix + "_installation_generation")
    if scope["server_id"] != expected_scope["server_id"]:
        failures.append(prefix + "_server_scope")
    for key in ("installation_id", "installation_generation", "source_id", "source_generation", "channel_id"):
        if scope[key] != expected_scope[key]:
            failures.append(prefix + "_scope_" + key)
    return failures


def _member_binding_failures(bindings, prefix):
    failures = []
    member_ids = [item["member_id"] for item in bindings]
    query_ids = [item["query_id"] for item in bindings]
    if len(member_ids) != len(set(member_ids)):
        failures.append(prefix + "_duplicate_member")
    if len(query_ids) != len(set(query_ids)):
        failures.append(prefix + "_duplicate_query")
    return failures


def application_update_owner_read_semantic_failures(definition_name, value):
    """Single-record relational laws. Schema validation runs first; fail closed."""

    try:
        if definition_name == "application_update_owner_read_request":
            return sorted(set(_request_failures(value)))
        if definition_name == "application_update_owner_read_result":
            return sorted(set(_result_failures(value)))
        if definition_name == "application_update_owner_read_pair":
            return sorted(set(_pair_failures(value)))
        return []
    except (KeyError, TypeError, ValueError, OverflowError):
        return ["owner_read_malformed_semantic_input"]


def _target_kind_failures(value, prefix):
    if value["target"]["target_kind"] != "application":
        return [prefix + "_target_kind"]
    return []


def _request_failures(value):
    failures = []
    if _time(value["deadline_utc"]) <= _time(value["requested_at_utc"]):
        failures.append("owner_read_invalid_request_deadline")
    if value["read_only"] is not True:
        failures.append("owner_read_not_read_only")
    failures += _target_kind_failures(value, "owner_read_request")
    failures += _member_binding_failures(value["member_bindings"], "owner_read_request")
    failures += _sensitive_material_failures(value, "owner_read_request")
    mutating = NON_OWNER_SOURCE_PATTERNS[0][1]
    for _path, text in _walk_strings(value):
        if mutating.search(text):
            failures.append("owner_read_mutating_command_requested")
            break
    return failures


def _result_failures(value):
    failures = []
    if _time(value["finished_at_utc"]) < _time(value["started_at_utc"]):
        failures.append("owner_read_query_time_reversed")
    failures += _target_kind_failures(value, "owner_read_result")
    failures += _member_binding_failures(value["member_bindings"], "owner_read_result")
    failures += _sensitive_material_failures(value, "owner_read_result")
    if value["payload_digest"] != payload_digest(value["fields"]):
        failures.append("owner_read_payload_digest")
    if value["owner_original_join"]["caller_copied_values_authority"] is not False:
        failures.append("owner_read_copied_values_claimed_as_authority")
    populated = sorted(key for key, field in value["fields"].items() if field is not None)
    if value["status"] == "completed":
        missing = sorted(set(OWNER_READ_FIELD_KEYS) - set(populated))
        if missing:
            failures.append("owner_read_completed_fields_missing:" + ",".join(missing))
    elif populated:
        failures.append("owner_read_noncompleted_fields_present:" + ",".join(populated))

    version = value["fields"].get("version")
    if version is not None:
        provenance = version["installed_provenance"]
        record = version["installed_version_record"]
        failures += _source_class_failures(provenance["owner_ref"], "installed_version_source")
        if provenance["owner_record_ref"] != value["owner_original_join"]["installed_version_original_ref"]:
            failures.append("installed_version_original_ref")
        if record["currentness_ref"] != value["owner_original_join"]["installed_version_original_ref"]:
            failures.append("installed_version_record_key")
        if provenance["owner_record_ref"] != record["currentness_ref"]:
            failures.append("installed_version_record_key")
        if record["installed_version"] != version["installed_version"]:
            failures.append("installed_version_record_value")
        authority_epoch = (value["fields"].get("install_source") or {}).get("installation_authority_generation")
        if authority_epoch is not None and record["authority_generation"] != authority_epoch:
            failures.append("installed_version_record_authority_epoch")
        for key in ("server_id", "installation_id", "source_id"):
            if record[key] != value["scope"][key]:
                failures.append("installed_version_record_scope:" + key)
        if record["installation_generation"] != value["scope"]["installation_generation"]:
            failures.append("installed_version_record_generation")
        if record["source_generation"] != value["scope"]["source_generation"]:
            failures.append("installed_version_record_source_generation")
        installation_authority = value["owner_original_join"]["installation_authority_original_ref"]
        if record["installation_authority_ref"] != installation_authority:
            failures.append("installed_version_record_authority")
        if provenance["owner_record_ref"] == installation_authority:
            failures.append("installed_version_owner_is_installation_authority_owner")
        if _time(record["observed_at_utc"]) > _time(value["finished_at_utc"]):
            failures.append("installed_version_record_after_finish")
        candidate = version["candidate_version"]
        if candidate is None:
            if version["candidate_provenance"] is not None:
                failures.append("candidate_version_provenance_without_candidate")
        else:
            candidate_provenance = version["candidate_provenance"]
            if candidate_provenance is None:
                failures.append("candidate_version_provenance_missing")
            else:
                failures += _source_class_failures(candidate_provenance["owner_ref"], "candidate_version_source")
                if candidate_provenance["owner_record_ref"] != candidate["metadata_ref"]:
                    failures.append("candidate_version_owner_record")
            if candidate["version"] == version["installed_version"] and provenance["owner_record_ref"] == installation_authority:
                failures.append("installed_version_copied_from_publication")

    channel = value["fields"].get("channel")
    if channel is not None:
        if channel["scope_channel_id"] != value["scope"]["channel_id"]:
            failures.append("owner_read_channel_scope")
        if channel["publication_channel"] is not None and channel["publication_channel"] != value["scope"]["channel_id"]:
            failures.append("owner_read_publication_channel_mismatch")
        failures += _source_class_failures(channel["provenance"]["owner_ref"], "channel_source")

    install_source = value["fields"].get("install_source")
    if install_source is not None:
        if install_source["source_id"] != value["scope"]["source_id"] or install_source["source_generation"] != value["scope"]["source_generation"]:
            failures.append("owner_read_install_source_scope")
        if install_source["installation_authority_ref"] != value["owner_original_join"]["installation_authority_original_ref"]:
            failures.append("owner_read_installation_authority_ref")
        failures += _source_class_failures(install_source["provenance"]["owner_ref"], "install_source_source")

    available = value["fields"].get("available_update")
    if available is not None:
        failures += _source_class_failures(available["provenance"]["owner_ref"], "available_update_source")
        source_result = available["source_result"]
        if source_result["scope"] != value["scope"]:
            failures.append("owner_read_source_result_scope")
        if available["outcome"] != source_result["outcome"]:
            failures.append("owner_read_source_result_outcome")
        if available["submitted_validator"] != source_result["submitted_validator"]:
            failures.append("owner_read_source_result_validator")
        publication = source_result["publication"]
        if publication is None:
            if available["publication_revision"] is not None or available["metadata"]:
                failures.append("owner_read_source_result_publication")
        else:
            if available["publication_revision"] != publication["publication_revision"]:
                failures.append("owner_read_source_result_publication_revision")
            if available["metadata"] != publication["metadata"]:
                failures.append("owner_read_source_result_metadata")
            for metadata in available["metadata"]:
                if metadata["channel"] != value["scope"]["channel_id"]:
                    failures.append("owner_read_publication_channel_mismatch")
        if available["outcome"] in ("validated", "not_modified"):
            if publication is None or source_result["source_evidence_ref"] is None:
                failures.append("owner_read_available_update_missing_source_validation")
        elif publication is not None or source_result["source_evidence_ref"] is not None:
            failures.append("owner_read_available_update_nonsuccess_source_claim")
        if available["outcome"] == "not_modified" and available["submitted_validator"] is None:
            failures.append("owner_read_not_modified_without_validator")
        if _time(source_result["completed_at_utc"]) > _time(value["finished_at_utc"]):
            failures.append("source_result_record_after_finish")

    restart = value["fields"].get("restart_requirement")
    if restart is not None:
        disclosure = restart["lifecycle_disclosure"]
        if restart["phase"] != disclosure["phase"]:
            failures.append("owner_read_restart_phase_not_disclosure")
        if restart["restart_required"] != (restart["phase"] == "restart-required"):
            failures.append("owner_read_restart_requirement_derivation")
        for key in ("server_id", "installation_id", "installation_generation", "source_id", "source_generation"):
            if disclosure[key] != value["scope"][key]:
                failures.append("owner_read_lifecycle_" + key)
        if _time(disclosure["observed_at_utc"]) > _time(value["finished_at_utc"]):
            failures.append("lifecycle_record_after_finish")
        selected = restart["selected_current_original"]
        for disclosure_key, selected_key in (
            ("application_operation", "application_operation"),
            ("operation_id", "operation_id"),
            ("journal_ref", "journal_ref"),
            ("journal_generation", "journal_generation"),
            ("phase", "phase"),
            ("phase_revision", "phase_revision"),
            ("currentness_ref", "currentness_ref"),
        ):
            if selected_key in selected and disclosure[disclosure_key] != selected[selected_key]:
                failures.append("lifecycle_disclosure_selected_" + disclosure_key)
        for key in ("server_id", "installation_id", "installation_generation", "source_id", "source_generation"):
            if selected[key] != value["scope"][key]:
                failures.append("selected_current_scope:" + key)
        if selected["channel_id"] != value["scope"]["channel_id"]:
            failures.append("selected_current_scope:channel_id")
        failures += _source_class_failures(selected["owner_ref"], "selected_current_owner")
        if SELECTED_CURRENT_LABEL_PATTERN.search(selected["owner_ref"]):
            failures.append("selected_current_label")
        if selected["owner_ref"] != SELECTED_CURRENT_OWNER_REF:
            failures.append("selected_current_owner_ref")
        if _time(selected["observed_at_utc"]) > _time(value["finished_at_utc"]):
            failures.append("selected_current_after_finish")
        if _time(selected["resolved_at_utc"]) > _time(value["finished_at_utc"]):
            failures.append("selected_current_resolution_after_finish")
        failures += _source_class_failures(restart["provenance"]["owner_ref"], "restart_source")
        if restart["provenance"]["owner_record_ref"] != disclosure["journal_ref"] and restart["provenance"]["owner_record_ref"] != disclosure["currentness_ref"]:
            failures.append("owner_read_restart_owner_record")

    protocol = value["fields"].get("protocol")
    if protocol is not None:
        server_value = protocol["server_value"]
        if protocol["connection_state"] != server_value["connection_state"]:
            failures.append("owner_read_protocol_connection_state")
        if server_value["server_id"] != value["scope"]["server_id"]:
            failures.append("owner_read_protocol_server_join")
        if server_value["installation_id"] != value["scope"]["installation_id"]:
            failures.append("owner_read_protocol_installation_join")
        if server_value["installation_generation"] != value["scope"]["installation_generation"]:
            failures.append("owner_read_protocol_installation_generation")
        if server_value["runtime_claim"] is not False:
            failures.append("owner_read_protocol_runtime_claim")
        if _time(server_value["observed_at_utc"]) > _time(value["finished_at_utc"]):
            failures.append("protocol_record_after_finish")
        failures += _source_class_failures(protocol["provenance"]["owner_ref"], "protocol_source")
        if protocol["provenance"]["owner_record_ref"] != value["owner_original_join"]["server_protocol_original_ref"]:
            failures.append("owner_read_protocol_original_ref")
        if server_value["currentness_ref"] != value["owner_original_join"]["server_protocol_original_ref"]:
            failures.append("protocol_record_key")
        if protocol["provenance"]["owner_record_ref"] != server_value["currentness_ref"]:
            failures.append("protocol_record_key")
    return failures


def _pair_failures(value):
    failures = []
    members = value["occurrence_members"]
    ids = [member["occurrence_id"] for member in members]
    if ids != list(OWNER_READ_OCCURRENCES):
        failures.append("owner_read_pair_occurrence_identity")
    pointers = [member["source_pointer"] for member in members]
    if len(pointers) != len(set(pointers)):
        failures.append("owner_read_pair_pointer_reused")
    for member, occurrence_id in zip(members, OWNER_READ_OCCURRENCES):
        if member["occurrence_id"] != occurrence_id:
            continue
        if member["source_pointer"] != SOURCE_POINTERS[occurrence_id]:
            failures.append("owner_read_pair_pointer:" + occurrence_id)
        if member["source_label"] != "app_update":
            failures.append("owner_read_pair_label:" + occurrence_id)
        if member["required_dimensions"] != REQUIRED_DIMENSIONS[occurrence_id]:
            failures.append("owner_read_pair_dimensions:" + occurrence_id)
    query_refs = [member["query_ref"] for member in members]
    if len(query_refs) != len(set(query_refs)):
        failures.append("owner_read_pair_duplicate_query")
    result_refs = [member["result_ref"] for member in members]
    if len(result_refs) != len(set(result_refs)):
        failures.append("owner_read_pair_duplicate_result")
    for key in ("second_owner_read", "second_check_dispatched", "second_descriptor_created", "mutation_dispatched"):
        if value[key] is not False:
            failures.append("owner_read_pair_" + key)
    if value["evidence_level"] != "static_typed_contract_join_only":
        failures.append("owner_read_pair_evidence_level")
    if value["native_claim"] != "none":
        failures.append("owner_read_pair_native_claim")
    return failures


def _authority_failures(authority_class):
    if authority_class not in AUTHORITY_CLASSES:
        return ["owner_read_authority_unlabeled"]
    return []


def resolve_selected_current_original(scope, *, resolve_service_selection):
    """Independently resolve the one ApplicationUpdateService selected-current original.

    `resolve_service_selection(scope)` reads the service's own restart-surviving
    journal/current-operation authority for the exact scope. It returns a mapping with
    `resolution_ref`, `resolved_at_utc`, `journal_authority_generation` and `candidates`,
    the originals that read produced: no candidate is absent, more than one is ambiguous.
    The callback is never handed the Doctor request, the lifecycle disclosure, the
    resealed payload digest, a command result, the separate source-check operation, a
    cached projection or any fixture/resolver label, and this helper does not select on
    the caller's behalf.
    """

    verdict = {"failures": [], "original": None, "resolution": None}
    try:
        resolution = resolve_service_selection(scope)
    except (KeyError, TypeError, ValueError, OSError):
        verdict["failures"].append("owner_read_selected_current_unresolved")
        return verdict
    if not isinstance(resolution, dict):
        verdict["failures"].append("owner_read_selected_current_unresolved")
        return verdict
    verdict["resolution"] = resolution
    candidates = resolution.get("candidates")
    if not isinstance(candidates, list) or not candidates:
        verdict["failures"].append("owner_read_selected_current_absent")
        return verdict
    if len(candidates) > 1:
        verdict["failures"].append("owner_read_selected_current_ambiguous")
        return verdict
    original = candidates[0]
    shape = structural_errors("application_update_selected_current_original", original)
    if shape:
        verdict["failures"] += ["owner_read_selected_current_invalid"] + shape
        return verdict
    verdict["original"] = original
    return verdict


def validate_selected_current_original(scope, original, finished_at_utc, resolution=None):
    """Scope, owner, currentness and resolution-provenance laws of the typed original.

    The original's journal authority epoch is its own domain: it is never compared with
    the installation authority epoch, the installation generation or the source
    generation, and its operation is never inferred to equal the source-check operation.
    """

    failures = []
    for key in ("server_id", "installation_id", "installation_generation",
                "source_id", "source_generation", "channel_id"):
        if original[key] != scope[key]:
            failures.append("owner_read_selected_current_scope:" + key)
    failures += _source_class_failures(original["owner_ref"], "owner_read_selected_current_owner")
    if SELECTED_CURRENT_LABEL_PATTERN.search(original["owner_ref"]):
        failures.append("owner_read_selected_current_label")
    if original["owner_ref"] != SELECTED_CURRENT_OWNER_REF:
        failures.append("owner_read_selected_current_owner_ref")
    if _time(original["observed_at_utc"]) > _time(finished_at_utc):
        failures.append("owner_read_selected_current_after_finish")
    if _time(original["resolved_at_utc"]) > _time(finished_at_utc):
        failures.append("owner_read_selected_current_resolution_after_finish")
    if isinstance(resolution, dict):
        for original_key, resolution_key in (("resolution_ref", "resolution_ref"),
                                             ("resolved_at_utc", "resolved_at_utc"),
                                             ("journal_authority_generation", "journal_authority_generation")):
            if original[original_key] != resolution.get(resolution_key):
                failures.append("owner_read_selected_current_resolution_" + resolution_key)
    return failures


def validate_owner_read_join(request, result, *, originals, authority_class, resolve_selected_current=None):
    """Compare one owner read against the originals a resolver actually read.

    `originals` is injected authority. Static validation injects a labeled fixture
    double (`fixture_only_static_double`); a native caller injects
    `native_owner_resolver`. Either way the return value never certifies a native
    issuer, a permission grant or an empirical result, and an unlabeled authority is
    refused instead of trusted.
    """

    failures = _authority_failures(authority_class)
    for record, definition in ((request, "application_update_owner_read_request"), (result, "application_update_owner_read_result")):
        shape = structural_errors(definition, record)
        if shape:
            return {
                "failures": ["owner_read_invalid_shape"] + shape,
                "evidence_level": authority_class,
                "certifies_native_issuer": False,
            }
    failures += application_update_owner_read_semantic_failures("application_update_owner_read_request", request)
    failures += application_update_owner_read_semantic_failures("application_update_owner_read_result", result)

    try:
        expected_scope = originals["scope"]
    except (KeyError, TypeError):
        return {
            "failures": failures + ["owner_read_originals_unavailable"],
            "evidence_level": authority_class,
            "certifies_native_issuer": False,
        }
    if originals.get("fact_key") != FACT_KEY or request["fact_key"] != FACT_KEY or result["fact_key"] != FACT_KEY:
        failures.append("owner_read_fact_key")

    failures += _scope_join_failures(request["scope"], request["target"], expected_scope, "owner_read_request")
    failures += _scope_join_failures(result["scope"], result["target"], expected_scope, "owner_read_result")
    for key in ("scope", "target", "member_bindings", "owner_read_ref"):
        if request[key] != result[key]:
            failures.append("owner_read_request_result_" + key)
    if request["expected_owner_generation"] != result["observed_owner_generation"]:
        failures.append("owner_read_owner_generation_mismatch")
    if request["expected_cache_generation"] != result["observed_cache_generation"]:
        failures.append("owner_read_cache_generation_mismatch")
    if request["expected_state_revision"] != result["observed_state_revision"]:
        failures.append("owner_read_state_revision_mismatch")
    if request["expected_policy_version"] != result["observed_policy_version"]:
        failures.append("owner_read_policy_version_mismatch")
    if request["expected_descriptor_revision"] != 1:
        failures.append("owner_read_descriptor_revision")
    if request["expected_owner_generation"] != originals["state"]["owner_generation"]:
        failures.append("owner_read_owner_generation_not_current")
    if request["expected_cache_generation"] != originals["state"]["cache_generation"]:
        failures.append("owner_read_cache_generation_not_current")
    if request["expected_state_revision"] != originals["state"]["revision"]:
        failures.append("owner_read_state_revision_not_current")
    if request["expected_policy_version"] != originals["state"]["policy_version"]:
        failures.append("owner_read_policy_revision_not_current")
    if result["owner_original_join"]["resolver_generation"] != originals["resolver_generation"]:
        failures.append("owner_read_resolver_generation")
    if result["owner_original_join"]["state_original_ref"] != originals["state"]["state_ref"]:
        failures.append("owner_read_state_original_ref")

    admission = originals["admission"]
    if request["read_admission_ref"] != admission["admission_ref"]:
        failures.append("owner_read_admission_ref")
    if admission["decision"] != "allow":
        failures.append("owner_read_admission_refused")
    if not (_time(admission["evaluated_at_utc"]) <= _time(request["requested_at_utc"]) < _time(admission["expires_at_utc"])):
        failures.append("owner_read_admission_expired")
    if admission["authority_generation"] != originals["state"]["owner_generation"]:
        failures.append("owner_read_admission_stale_authority")
    if request["governor_admission_ref"] != originals["governor"]["admission_ref"]:
        failures.append("owner_read_governor_admission_ref")
    if request["observable_work_ref"] != originals["governor"]["observable_work_ref"]:
        failures.append("owner_read_shared_work_mismatch")

    if result["status"] != "completed":
        if any(field is not None for field in result["fields"].values()):
            failures.append("owner_read_noncompleted_discloses_fields")
        return {
            "failures": sorted(set(failures)),
            "evidence_level": authority_class,
            "certifies_native_issuer": False,
        }

    requested = set(request["requested_fields"])
    disclosed = {key for key, field in result["fields"].items() if field is not None}
    if disclosed != requested:
        failures.append("owner_read_requested_field_subset")
        return {
            "failures": sorted(set(failures)),
            "evidence_level": authority_class,
            "certifies_native_issuer": False,
        }

    join_refs = result["owner_original_join"]
    if join_refs["installed_version_original_ref"] != originals["installed_version"]["record_ref"]:
        failures.append("owner_read_installed_version_original_key")
    if join_refs["server_protocol_original_ref"] != originals["server_protocol"]["record_ref"]:
        failures.append("owner_read_protocol_original_key")
    if join_refs["installation_authority_original_ref"] != originals["installation_authority"]["authority_ref"]:
        failures.append("owner_read_installation_authority_original_key")
    if join_refs["source_result_original_ref"] != originals["source_result"]["record"]["result_id"]:
        failures.append("owner_read_source_result_original_key")
    if join_refs["lifecycle_journal_original_ref"] != originals["lifecycle"]["disclosure"]["journal_ref"]:
        failures.append("owner_read_lifecycle_original_key")

    version, version_originals = result["fields"]["version"], originals["installed_version"]
    if version["installed_version"] != version_originals["version"]:
        failures.append("owner_read_installed_version_mismatch")
    if version["installed_version_ref"] != version_originals["value_ref"]:
        failures.append("owner_read_installed_version_ref")
    if version["installed_provenance"]["owner_ref"] != version_originals["owner_ref"]:
        failures.append("owner_read_installed_version_owner")
    if version["installed_provenance"]["owner_record_ref"] != version_originals["record_ref"]:
        failures.append("owner_read_installed_version_original_ref")
    installed_record = version["installed_version_record"]
    if installed_record["currentness_ref"] != version_originals["record_ref"]:
        failures.append("owner_read_installed_version_record_key")
    if installed_record != version_originals["record"]:
        failures.append("owner_read_installed_version_record_original")
    independent = version_originals["record"]
    for key in ("server_id", "installation_id", "source_id"):
        if independent[key] != request["scope"][key]:
            failures.append("owner_read_installed_version_record_scope:" + key)
    if independent["installation_generation"] != request["scope"]["installation_generation"]:
        failures.append("owner_read_installed_version_record_generation")
    if independent["source_generation"] != request["scope"]["source_generation"]:
        failures.append("owner_read_installed_version_record_source_generation")
    if independent["installed_version"] != version["installed_version"]:
        failures.append("owner_read_installed_version_record_value")
    if _time(independent["observed_at_utc"]) > _time(result["finished_at_utc"]):
        failures.append("owner_read_installed_version_original_after_finish")
    if independent["authority_generation"] != originals["installation_authority"]["authority_generation"]:
        failures.append("owner_read_installed_version_record_authority_epoch")
    if independent["installation_authority_ref"] != originals["installation_authority"]["authority_ref"]:
        failures.append("owner_read_installed_version_record_authority")
    source_result = originals["source_result"]["record"]
    publication = source_result["publication"]
    candidate = version["candidate_version"]
    if publication is None:
        if candidate is not None:
            failures.append("owner_read_candidate_without_publication")
    elif candidate is None:
        failures.append("owner_read_candidate_missing")
    else:
        if candidate["publication_revision"] != publication["publication_revision"]:
            failures.append("owner_read_candidate_publication_revision")
        if not any(item["version"] == candidate["version"] and item["channel"] == candidate["channel"] for item in publication["metadata"]):
            failures.append("owner_read_candidate_not_published")
        if version["installed_version"] != version_originals["version"] and version["installed_version"] == candidate["version"]:
            failures.append("owner_read_installed_version_copied_from_candidate")
    if (candidate is not None) != (version["candidate_provenance"] is not None):
        failures.append("owner_read_candidate_provenance_presence")
    if candidate is not None and version["candidate_provenance"]["owner_ref"] != originals["source_result"]["owner_ref"]:
        failures.append("owner_read_candidate_provenance_owner")

    channel = result["fields"]["channel"]
    channel_result = originals["channel"]
    if channel["scope_channel_id"] != channel_result["scope_channel_id"]:
        failures.append("owner_read_channel_value")
    if channel["publication_channel"] != channel_result["publication_channel"]:
        failures.append("owner_read_publication_channel_value")

    install_source = result["fields"]["install_source"]
    authority = originals["installation_authority"]
    if install_source["installation_authority_ref"] != authority["authority_ref"]:
        failures.append("owner_read_installation_authority_value")
    if install_source["installation_authority_generation"] != authority["authority_generation"]:
        failures.append("owner_read_installation_authority_generation")
    if install_source["installation_authority_owner_ref"] != authority["owner_ref"]:
        failures.append("owner_read_installation_authority_owner")

    available = result["fields"]["available_update"]
    prior_cache = originals["state"].get("cache") or {}
    if available["submitted_validator"] != request["submitted_conditional_validator"]:
        failures.append("owner_read_submitted_validator_mismatch")
    if request["submitted_conditional_validator"] is not None and request["submitted_conditional_validator"] != prior_cache.get("conditional_validator"):
        failures.append("owner_read_unbound_validator")
    if available["source_result"] != source_result:
        failures.append("owner_read_source_result_original")
    if _time(source_result["completed_at_utc"]) > _time(result["finished_at_utc"]):
        failures.append("owner_read_source_result_original_after_finish")
    if available["outcome"] != source_result["outcome"]:
        failures.append("owner_read_source_result_outcome_value")

    restart = result["fields"]["restart_requirement"]
    lifecycle = originals["lifecycle"]
    if restart["lifecycle_disclosure"] != lifecycle["disclosure"]:
        failures.append("owner_read_lifecycle_original")
    if _time(lifecycle["disclosure"]["observed_at_utc"]) > _time(result["finished_at_utc"]):
        failures.append("owner_read_lifecycle_original_after_finish")
    embedded_selected = restart["selected_current_original"]
    failures += validate_selected_current_original(request["scope"], embedded_selected, result["finished_at_utc"])
    if resolve_selected_current is None:
        failures.append("owner_read_selected_current_unresolved")
    else:
        resolved = resolve_selected_current_original(
            request["scope"], resolve_service_selection=resolve_selected_current
        )
        failures += resolved["failures"]
        if resolved["original"] is not None:
            if resolved["original"] != embedded_selected:
                failures.append("owner_read_selected_current_original")
            failures += validate_selected_current_original(
                request["scope"], resolved["original"], result["finished_at_utc"], resolved["resolution"]
            )
    if restart["phase"] != lifecycle["phase"]:
        failures.append("owner_read_lifecycle_phase_value")
    if restart["restart_required"] != (lifecycle["phase"] == "restart-required"):
        failures.append("owner_read_restart_requirement_value")
    if restart["provenance"]["owner_ref"] != lifecycle["owner_ref"]:
        failures.append("owner_read_restart_owner")

    protocol = result["fields"]["protocol"]
    protocol_original = originals["server_protocol"]
    if protocol["server_value"] != protocol_original["value"]:
        failures.append("owner_read_protocol_original")
    if protocol["connection_state"] != protocol_original["connection_state"]:
        failures.append("owner_read_protocol_state_value")
    if protocol["provenance"]["owner_ref"] != protocol_original["owner_ref"]:
        failures.append("owner_read_protocol_owner")
    if protocol["provenance"]["owner_record_ref"] != protocol_original["record_ref"]:
        failures.append("owner_read_protocol_original_ref")
    server_value = protocol["server_value"]
    if server_value["currentness_ref"] != protocol_original["record_ref"]:
        failures.append("owner_read_protocol_record_key")
    independent_protocol = protocol_original["value"]
    for key in ("server_id", "installation_id"):
        if independent_protocol[key] != request["scope"][key]:
            failures.append("owner_read_protocol_record_scope:" + key)
    if independent_protocol["installation_generation"] != request["scope"]["installation_generation"]:
        failures.append("owner_read_protocol_record_generation")
    if independent_protocol["connection_projection_ref"] != protocol_original["projection_ref"]:
        failures.append("owner_read_protocol_projection_ref")
    if _time(independent_protocol["observed_at_utc"]) > _time(result["finished_at_utc"]):
        failures.append("owner_read_protocol_original_after_finish")

    for field_name, field in result["fields"].items():
        if field is None:
            continue
        provenance = field["installed_provenance"] if field_name == "version" else field["provenance"]
        if provenance["observed_at_utc"] > result["finished_at_utc"]:
            failures.append("owner_read_observation_after_completion:" + field_name)
            break
    if not result["evidence_refs"]:
        failures.append("owner_read_completed_without_evidence")

    return {
        "failures": sorted(set(failures)),
        "evidence_level": authority_class,
        "certifies_native_issuer": False,
    }


def validate_occurrence_projection(pair, *, resolve_record, originals, authority_class,
                                   resolve_selected_current=None):
    """Join the two occurrences to the one owner read and its one owner result.

    `resolve_record(kind, ref)` retrieves original Doctor controller/owner records:
    `doctor_owner_query_request`, `doctor_owner_query_result`, `owner_request` and
    `owner_result`. Missing, duplicated or independently resolved records fail; a
    second check, a second descriptor or any mutation dispatch fails; a dropped
    occurrence fails. The resolved owner request and owner result are additionally
    validated by `validate_owner_read_join` against the injected originals, so a
    substituted, stale or resealed owner value under an intact reference fails here
    too. Completion of the query is never reported as health.
    """

    failures = _authority_failures(authority_class)
    shape = structural_errors("application_update_owner_read_pair", pair)
    if shape:
        return {
            "failures": ["owner_read_pair_invalid_shape"] + shape,
            "evidence_level": authority_class,
            "certifies_native_issuer": False,
        }
    failures += application_update_owner_read_semantic_failures("application_update_owner_read_pair", pair)
    if originals.get("fact_key") != FACT_KEY:
        failures.append("owner_read_pair_fact_key")
    shared_owner_result = None
    shared_owner_result_value = None
    shared_owner_request = None
    shared_owner_result_bindings = []
    query_refs = set()
    expected_bindings = []
    for member in pair["occurrence_members"]:
        occurrence_id = member["occurrence_id"]
        try:
            query = resolve_record("doctor_owner_query_request", member["query_ref"])
            query_result = resolve_record("doctor_owner_query_result", member["result_ref"])
        except (KeyError, TypeError, ValueError, OSError):
            failures.append("owner_read_pair_unresolved_query:" + occurrence_id)
            continue
        expected_bindings.append({
            "batch_id": query["batch_id"],
            "member_id": query["member_id"],
            "query_id": query["query_id"],
        })
        if query["query_id"] in query_refs:
            failures.append("owner_read_pair_query_reused:" + occurrence_id)
        query_refs.add(query["query_id"])
        if query_result["query_id"] != query["query_id"]:
            failures.append("owner_read_pair_query_result_identity:" + occurrence_id)
        if query["observable_work_ref"] != pair["observable_work_ref"]:
            failures.append("owner_read_pair_second_work:" + occurrence_id)
        if query["owner_request_ref"] != pair["owner_read_ref"]:
            failures.append("owner_read_pair_second_read:" + occurrence_id)
        if query["owner_request_schema_ref"] != pair["request_schema_ref"]:
            failures.append("owner_read_pair_request_schema:" + occurrence_id)
        if query_result["owner_result_schema_ref"] != pair["result_schema_ref"]:
            failures.append("owner_read_pair_result_schema:" + occurrence_id)
        if query_result["observed_owner_generation"] != pair["shared_owner_generation"]:
            failures.append("owner_read_pair_owner_generation:" + occurrence_id)
        if query_result["status"] != "completed":
            failures.append("owner_read_pair_query_not_completed:" + occurrence_id)
        try:
            owner_request = resolve_record("owner_request", query["owner_request_ref"])
        except (KeyError, TypeError, ValueError, OSError):
            failures.append("owner_read_pair_owner_request_unavailable:" + occurrence_id)
            owner_request = None
        if owner_request is not None:
            if shared_owner_request is None:
                shared_owner_request = copy.deepcopy(owner_request)
            elif shared_owner_request != owner_request:
                failures.append("owner_read_pair_second_owner_request:" + occurrence_id)
        owner_result_ref = query_result["owner_result_ref"]
        if shared_owner_result is None:
            shared_owner_result = owner_result_ref
        elif shared_owner_result != owner_result_ref:
            failures.append("owner_read_pair_second_owner_result:" + occurrence_id)
        try:
            owner_result = resolve_record("owner_result", owner_result_ref)
        except (KeyError, TypeError, ValueError, OSError):
            failures.append("owner_read_pair_owner_result_unavailable:" + occurrence_id)
            continue
        if not shared_owner_result_bindings:
            shared_owner_result_bindings.append(owner_result.get("member_bindings"))
        if shared_owner_result_value is None:
            shared_owner_result_value = copy.deepcopy(owner_result)
        if owner_result["owner_read_ref"] != pair["owner_read_ref"]:
            failures.append("owner_read_pair_owner_result_read:" + occurrence_id)
        if owner_result["scope"] != pair["shared_scope"] or owner_result["target"] != pair["shared_target"]:
            failures.append("owner_read_pair_owner_result_scope:" + occurrence_id)
        for dimension in REQUIRED_DIMENSIONS[occurrence_id]:
            key = {"restart requirement": "restart_requirement", "restart": "restart_requirement"}.get(dimension, dimension.replace(" ", "_"))
            if owner_result["fields"].get(key) is None:
                failures.append("owner_read_pair_dimension_missing:" + occurrence_id + ":" + dimension)
    if expected_bindings and len(expected_bindings) != len(pair["occurrence_members"]):
        failures.append("owner_read_pair_unresolved_members")
    shared_binding = shared_owner_result_bindings[0] if shared_owner_result_bindings else None
    if shared_binding is not None and shared_binding != expected_bindings:
        failures.append("owner_read_pair_owner_result_members")
    if pair["shared_cache_generation"] != originals["state"]["cache_generation"]:
        failures.append("owner_read_pair_cache_generation")
    if shared_owner_request is None or shared_owner_result_value is None:
        failures.append("owner_read_projection_owner_read_unresolved")
    else:
        validated = validate_owner_read_join(
            shared_owner_request,
            shared_owner_result_value,
            originals=originals,
            authority_class=authority_class,
            resolve_selected_current=resolve_selected_current,
        )
        if not validated["certifies_native_issuer"] is False:
            failures.append("owner_read_projection_certification_claim")
        failures += ["owner_read_projection_" + failure for failure in validated["failures"]]
    return {
        "failures": sorted(set(failures)),
        "evidence_level": authority_class,
        "certifies_native_issuer": False,
    }
