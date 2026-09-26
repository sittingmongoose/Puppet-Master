#!/usr/bin/env python3
"""Static gate for the typed sound upload / pack import action companion.

Validates the closed typed companion, its causal fixtures, its authentic
original/dispatcher binding, the actual central response join, the Touch Closure
profile binding and the existing production wiring values for exactly
`cmd.sound.upload` and `cmd.sound.pack.import`, including SP-222's existing
5 MiB source, 10-second decoded and warn-above-3-second owner limits.

Nothing here is native dispatch, FileSafe admission, decode, persistence,
receipt or physical-custody proof, and no Touch row, handler status or wiring
status is promoted by a passing run.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

import pm_sound_upload_import_response as ADAPTER  # noqa: E402

ACTION_FIXTURES = "Plans/sound_upload_import_action_fixtures.json"
DISPATCH_FIXTURES = "Plans/sir_sound_upload_import_dispatch_fixtures.json"
TOUCH_REGISTRY = "Plans/touch_closure.json"
WIRING_MATRIX = "Plans/Wiring_Matrix.production.json"
SHARED_PROFILE = "TCP-NOTIFY-SOUND"
SEALED_ACCOUNTING = {"profile_count": 151, "row_count": 646, "excluded_token_count": 58, "alias_binding_count": 65}
ACTION_REF_DEFINITION = {
    "cmd.sound.upload": {
        "payload_schema_ref": "sound_upload_request",
        "result_schema_ref": "sound_upload_result",
        "error_schema_ref": "action_error",
    },
    "cmd.sound.pack.import": {
        "payload_schema_ref": "sound_pack_import_request",
        "result_schema_ref": "sound_pack_import_result",
        "error_schema_ref": "action_error",
    },
}
# No Sound route remains unmaterialized on this shared profile. These two routes
# are bound by their own static companions, not by this upload/import gate.
UNBOUND_SOUND_ACTIONS: set[str] = set()
B_COMPANION_SCHEMA = {
    "cmd.sound.asset.delete": "Plans/sound_asset_delete_action_contracts.schema.json",
    "cmd.sound.asset.export": "Plans/sound_asset_export_action_contracts.schema.json",
}
B_COMPANION_BINDING = {
    "cmd.sound.asset.delete": {
        "payload_schema_ref": "delete_request", "result_schema_ref": "delete_result",
        "error_schema_ref": "action_error",
    },
    "cmd.sound.asset.export": {
        "payload_schema_ref": "export_request", "result_schema_ref": "export_result",
        "error_schema_ref": "action_error",
    },
}
ACCEPTED_COMPANION_SCHEMA = "Plans/notifications_sound_action_contracts.schema.json"
ACCEPTED_COMPANION_BINDING = {
    "cmd.notifications.destination.test": {
        "payload_schema_ref": "destination_test_request",
        "result_schema_ref": "destination_test_result",
        "error_schema_ref": "action_error",
    },
    "cmd.sound.preview": {
        "payload_schema_ref": "sound_preview_request",
        "result_schema_ref": "sound_preview_result",
        "error_schema_ref": "action_error",
    },
}
WIRING_ROW = {
    "cmd.sound.upload": "catalog.sound_upload",
    "cmd.sound.pack.import": "catalog.sound_pack_import",
}
RETIRED_SPELLING = "cmd.settings.open_notifications"
OWNER_UNITS = {
    "Plans/storage-plan.md": ["SP-222", "SP-251"],
    "Plans/UI_Command_Catalog.md": ["UCC-103"],
    "Plans/Contracts_V0.md": ["CV-298", "CV-333"],
    "Plans/Permissions_System.md": ["PS-124"],
    "Plans/FinalGUISpec.md": ["F3-405"],
    "Plans/Wiring_Matrix.md": ["WM-039"],
    "Plans/Automated_Testing_System.md": ["ATS-016"],
    "Plans/Runtime_Artifacts_Panel.md": ["RAP-039"],
    "Plans/FileSafe.md": ["F2-045", "F2-046", "F2-070", "F2-209"],
    "Plans/Shared_Integration_Runtime.md": ["SIR-042"],
}
OWNER_LIMITS = {
    "source_size_limit_bytes": 5242880,
    "decoded_duration_limit_ms": 10000,
    "duration_warning_ms": 3000,
}
# SP-222 declares these as preserved exact tokens; the companion must consume the
# same owner limits instead of inventing new ones.
OWNER_LIMIT_TOKENS = ("5MiB", "10s", "warn >3s")
OWNER_LIMIT_UNIT = "Plans/storage-plan.md#SP-222"
DISABLED_DESTINATION_STATEMENT = "RAP-039 applies to destination-test and asset-export evidence only; not local playback"


def load(path: str) -> Any:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def resolve_pointer(document: Any, pointer: str) -> Any:
    if pointer in ("", "#"):
        return document
    fragment = pointer[1:] if pointer.startswith("#") else pointer
    if not fragment.startswith("/"):
        raise ValueError(f"not an exact JSON pointer: {pointer}")
    current = document
    for token in fragment[1:].split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        current = current[int(token)] if isinstance(current, list) else current[token]
    return current


def drive(row: dict[str, Any]) -> list[str]:
    # Every drive starts from the frozen fixture: a synthetic mutation hook or a
    # late-value fence must behave identically on a repeated gate run.
    try:
        return ADAPTER.sound_upload_import_semantic_failures(
            row["definition"], copy.deepcopy(row["value"]), canon_root=ROOT)
    except Exception as exc:  # noqa: BLE001 - fail closed on any driver refusal
        return ["fixture_driver_error:" + type(exc).__name__ + ":" + str(exc)]


def fixture_failures(path: str, kind: str) -> tuple[list[str], dict[str, int]]:
    failures: list[str] = []
    try:
        document = load(path)
    except Exception as exc:  # noqa: BLE001 - a missing companion artifact fails closed
        return [f"contract_missing:{path}:{type(exc).__name__}"], {
            "positive_cases": 0, "negative_cases": 0, "semantic_negatives": 0, "structural_negatives": 0}
    valid = document.get("valid", [])
    invalid = document.get("invalid", [])
    stats = {"positive_cases": 0, "negative_cases": len(invalid), "semantic_negatives": 0,
             "structural_negatives": 0}
    for row in valid:
        name = f"{path}:{row['name']}"
        observed = drive(row)
        if observed:
            failures.append(f"{name}: declared valid fixture fails: {observed[:4]}")
        shape = ADAPTER.shape_failures("#", row["value"], canon_root=ROOT)
        if shape and not _is_case_definition(row["definition"]):
            failures.append(f"{name}: declared valid record is not shape-valid: {shape[:3]}")
        stats["positive_cases"] += 1
    for row in invalid:
        name = f"{path}:{row['name']}"
        observed = drive(row)
        if not observed:
            failures.append(f"{name}: declared invalid fixture was accepted")
            continue
        structural = any(item.startswith("shape:") for item in observed)
        if row.get("shape_failure"):
            stats["structural_negatives"] += 1
            if not structural:
                failures.append(f"{name}: declared structural refusal did not fail closed on shape")
            continue
        stats["semantic_negatives"] += 1
        if structural:
            failures.append(f"{name}: semantic negative is only a shape refusal: {observed[:3]}")
        if row.get("semantic_rule") not in observed:
            failures.append(f"{name}: declared rule {row.get('semantic_rule')!r} not proven: {observed[:4]}")
    return failures, stats


def _is_case_definition(definition: str) -> bool:
    return definition.endswith("_case")


def resolver_required_failures(fixture: dict[str, Any]) -> list[str]:
    """Every join requires its injected owner/SIR/dispatcher resolver."""
    failures: list[str] = []
    request = fixture["request"]
    dispatcher = fixture["records"][request["dispatcher_ref"]]
    sir = fixture["records"][request["sir_dispatch_ref"]]
    for label, call in (
        ("request_owner", lambda: ADAPTER.request_failures(
            request, resolve_owner_original=None,
            resolve_sir_dispatch=lambda ref: sir, resolve_dispatcher=lambda ref: dispatcher,
            canon_root=ROOT)),
        ("request_sir", lambda: ADAPTER.request_failures(
            request, resolve_owner_original=lambda ref: fixture["records"][ref],
            resolve_sir_dispatch=None, resolve_dispatcher=lambda ref: dispatcher, canon_root=ROOT)),
        ("request_dispatcher", lambda: ADAPTER.request_failures(
            request, resolve_owner_original=lambda ref: fixture["records"][ref],
            resolve_sir_dispatch=lambda ref: sir, resolve_dispatcher="not-callable", canon_root=ROOT)),
    ):
        observed = call()
        if "sound_upload_import_resolver_missing:resolve_owner_original" not in observed and (
                "sound_upload_import_resolver_missing:resolve_sir_dispatch" not in observed and
                "sound_upload_import_resolver_missing:resolve_dispatcher" not in observed):
            failures.append(f"resolver_required:{label}: missing resolver was not refused: {observed[:3]}")
    return failures


def profile_clauses(field: str, profile: dict[str, Any]) -> dict[str, str]:
    clauses: dict[str, str] = {}
    for clause in str(profile.get(field, "")).split(";"):
        left, _, right = clause.partition("->")
        for action in left.split("/"):
            action = action.strip()
            if action.startswith("cmd."):
                clauses[action] = right.strip()
    return clauses


def touch_failures() -> tuple[list[str], dict[str, Any]]:
    """The two rows keep their shared profile; the refs are action-qualified."""
    failures: list[str] = []
    registry = load(TOUCH_REGISTRY)
    rows = registry["rows"]
    profiles = {profile["profile_id"]: profile for profile in registry["profiles"]}
    by_action = {row[3]: row for row in rows}
    stats: dict[str, Any] = {}
    observed_accounting = {
        "profile_count": len(registry["profiles"]),
        "row_count": len(rows),
        "excluded_token_count": len(registry.get("excluded_tokens", [])),
        "alias_binding_count": len(registry.get("alias_bindings", {})),
    }
    if observed_accounting != SEALED_ACCOUNTING:
        failures.append("touch: the sealed Touch accounting denominators drifted: "
                        f"{observed_accounting} != {SEALED_ACCOUNTING}")
    profile = profiles.get(SHARED_PROFILE)
    if profile is None:
        failures.append(f"touch: the shared {SHARED_PROFILE} profile is missing")
        return failures, stats
    for action, definitions in ACTION_REF_DEFINITION.items():
        row = by_action.get(action)
        if row is None:
            failures.append(f"touch:{action}: no Touch Closure row")
            continue
        if row[1] != SHARED_PROFILE:
            failures.append(f"touch:{action}: row must keep the shared {SHARED_PROFILE} profile, found {row[1]!r}")
        if row[4] != "partial":
            failures.append(f"touch:{action}: disposition must stay partial, found {row[4]!r}")
        residual = row[5]
        if "remain implementation and verification work" not in residual or "remain specification work" in residual:
            failures.append(f"touch:{action}: residual must distinguish the materialized specification from the "
                            "remaining implementation work")
        if "native" not in residual.lower():
            failures.append(f"touch:{action}: residual must keep naming the missing native work")
        if "implemented" in residual.lower() or "verified native" in residual.lower():
            failures.append(f"touch:{action}: residual must not claim implementation")
        for field, definition in definitions.items():
            clauses = profile_clauses(field, profile)
            binding = f"{action} -> {ADAPTER.ACTION_SCHEMA}#/$defs/{definition}"
            ref = str(profile.get(field, ""))
            if binding not in ref:
                failures.append(f"touch:{action}: {field} must carry the action-qualified binding {binding!r}")
                continue
            pointer = "#/$defs/" + definition
            try:
                resolve_pointer(load(ADAPTER.ACTION_SCHEMA), pointer)
            except Exception as exc:  # noqa: BLE001 - a stale ref is a gate failure
                failures.append(f"touch:{action}: {field} has an unresolved pointer {pointer}: {exc}")
            for unbound in sorted(UNBOUND_SOUND_ACTIONS):
                if clauses.get(unbound) != "unmaterialized":
                    failures.append(f"touch: {field} must leave unbound route {unbound} unmaterialized, "
                                    f"found {clauses.get(unbound)!r}")
            for other_action, other_definitions in B_COMPANION_BINDING.items():
                expected = f"{B_COMPANION_SCHEMA[other_action]}#/$defs/{other_definitions[field]}"
                if clauses.get(other_action) != expected:
                    failures.append(f"touch: {field} must preserve the Sound asset companion binding for "
                                    f"{other_action}, found {clauses.get(other_action)!r}")
            for accepted_action, accepted_definitions in ACCEPTED_COMPANION_BINDING.items():
                accepted_definition = accepted_definitions[field]
                expected = f"{accepted_action} -> {ACCEPTED_COMPANION_SCHEMA}#/$defs/{accepted_definition}"
                if expected not in ref:
                    failures.append(f"touch: {field} must preserve the accepted companion binding {expected!r}")
        stats[action] = {"profile": row[1], "disposition": row[4], "handler_status": profile["handler_status"]}
    if profile.get("handler_status") != "specified":
        failures.append("touch: handler_status must stay specified for both rows")
    if profile.get("wiring_status") != "specified":
        failures.append("touch: wiring_status must stay specified for both rows")
    evidence = " ".join(profile.get("evidence_refs", [])).lower()
    if "static" not in evidence:
        failures.append("touch: evidence_refs must stay explicitly static")
    if DISABLED_DESTINATION_STATEMENT not in str(profile.get("production_or_simulation", "")):
        failures.append("touch: the profile lost its RAP-039 projection scope statement")
    test_refs = [str(ref) for ref in profile.get("test_refs", [])]
    for ref in (ACTION_FIXTURES, DISPATCH_FIXTURES, "scripts/pm_sound_upload_import_contracts.py"):
        if ref not in test_refs:
            failures.append(f"touch: the Touch validation path must keep resolving {ref}")
    stats["sealed_accounting"] = observed_accounting
    return failures, stats


def wiring_failures() -> tuple[list[str], dict[str, Any]]:
    failures: list[str] = []
    entries = load(WIRING_MATRIX)["entries"]
    stats: dict[str, Any] = {}
    for action, row_id in WIRING_ROW.items():
        row = entries.get(row_id)
        if row is None:
            failures.append(f"wiring:{action}: production row {row_id} is missing")
            continue
        expected = ADAPTER.EFFECT_VALUES[action]
        if row.get("ui_command_id") != action:
            failures.append(f"wiring:{action}: ui_command_id drifted")
        if row.get("handler_location") != expected["handler_id"]:
            failures.append(f"wiring:{action}: handler_location drifted from the companion handler identity")
        effect = row.get("effect_contract", {})
        if effect.get("effect_kind") != expected["effect_kind"]:
            failures.append(f"wiring:{action}: effect_kind drifted")
        if effect.get("receipt_or_event_refs") != expected["receipt_or_event_refs"]:
            failures.append(f"wiring:{action}: receipt_or_event_refs drifted")
        if row.get("expected_event_types") != expected["expected_event_types"]:
            failures.append(f"wiring:{action}: expected_event_types must stay empty")
        if row.get("state_selector") != ADAPTER.AVAILABILITY_SELECTOR[action]:
            failures.append(f"wiring:{action}: state_selector drifted")
        if row.get("disabled_reason_projection") != ADAPTER.DISABLED_REASON_SELECTOR[action]:
            failures.append(f"wiring:{action}: disabled_reason_projection drifted")
        stats[action] = {"row": row_id, "effect_kind": effect.get("effect_kind"),
                         "receipt_or_event_refs": effect.get("receipt_or_event_refs")}
    return failures, stats


def retirement_failures() -> list[str]:
    failures: list[str] = []
    registry = load(TOUCH_REGISTRY)
    actions = {row[3] for row in registry["rows"]}
    if RETIRED_SPELLING in actions:
        failures.append(f"retired:{RETIRED_SPELLING} must stay unregistered as a Touch row")
    if RETIRED_SPELLING in registry.get("alias_bindings", {}):
        failures.append(f"retired:{RETIRED_SPELLING} must stay a non-alias")
    excluded = {token["token"]: token for token in registry.get("excluded_tokens", [])}
    token = excluded.get(RETIRED_SPELLING)
    if token is None or token.get("classification") != "forbidden":
        failures.append(f"retired:{RETIRED_SPELLING} must stay a forbidden excluded token")
    closed = ADAPTER.shape_failures("action_id", RETIRED_SPELLING, canon_root=ROOT)
    if not closed:
        failures.append(f"retired:{RETIRED_SPELLING} must stay outside the closed action set")
    return failures


def vocabulary_failures() -> tuple[list[str], dict[str, Any]]:
    failures: list[str] = []
    documents = {
        ADAPTER.ACTION_SCHEMA: load(ADAPTER.ACTION_SCHEMA),
        ADAPTER.DISPATCH_SCHEMA: load(ADAPTER.DISPATCH_SCHEMA),
        # Only admitted rows: a negative fixture may declare a refused key to
        # prove the refusal.
        ACTION_FIXTURES: {"valid": load(ACTION_FIXTURES)["valid"]},
        DISPATCH_FIXTURES: {"valid": load(DISPATCH_FIXTURES)["valid"]},
    }
    for path, document in documents.items():
        text = json.dumps(document)
        for key in ADAPTER.FORBIDDEN_COMPANION_KEYS:
            if f'"{key}"' in text:
                failures.append(f"vocabulary:{path}: forbidden new key {key!r} is present")
    action_schema = documents[ADAPTER.ACTION_SCHEMA]
    closed = action_schema["$defs"]["action_id"]["enum"]
    if set(closed) != set(ADAPTER.COMMANDS):
        failures.append("vocabulary: the closed action set must be exactly the two authored routes")
    accepted = documents.get(ACCEPTED_COMPANION_SCHEMA) if ACCEPTED_COMPANION_SCHEMA in documents else None
    if accepted is None:
        try:
            accepted = load(ACCEPTED_COMPANION_SCHEMA)
        except Exception:  # noqa: BLE001 - the accepted companion is a required neighbour
            failures.append(f"vocabulary:{ACCEPTED_COMPANION_SCHEMA}: the accepted companion is missing")
            accepted = None
    if accepted is not None and set(accepted["$defs"]["action_id"]["enum"]) != set(ACCEPTED_COMPANION_BINDING):
        failures.append("vocabulary: the accepted companion's closed action set must stay its two routes")
    for action, binding in ADAPTER.EFFECT_VALUES.items():
        if binding["expected_event_types"]:
            failures.append(f"vocabulary:{action}: the companion must not admit an event type")
    persisted = [
        row["name"] for row in documents[ACTION_FIXTURES]["valid"]
        if isinstance(row["value"], dict) and isinstance(row["value"].get("result"), dict)
        and row["value"]["result"].get("persisted_event_refs")
    ]
    if persisted:
        failures.append(f"vocabulary: fixtures admit persisted events: {persisted}")
    return failures, {"closed_actions": closed}


def owner_reference_failures() -> list[str]:
    failures: list[str] = []
    for path, units in OWNER_UNITS.items():
        document = ROOT / path
        if not document.is_file():
            failures.append(f"owner_refs:{path}: canonical owner file is missing")
            continue
        text = document.read_text(encoding="utf-8")
        for unit in units:
            if unit not in text:
                failures.append(f"owner_refs:{path}: cited owner unit {unit} is absent")
    return failures


def owner_limit_failures() -> tuple[list[str], dict[str, Any]]:
    """The companion consumes SP-222's declared limits and invents no other number."""
    failures: list[str] = []
    observed = ADAPTER.owner_limits(canon_root=ROOT)
    if observed != OWNER_LIMITS:
        failures.append(f"owner_limits: the companion limits drifted: {observed} != {OWNER_LIMITS}")
    schema = load(ADAPTER.ACTION_SCHEMA)
    declared = schema.get("x-owner-limits")
    if declared != OWNER_LIMITS:
        failures.append(f"owner_limits: x-owner-limits must stay the owner values, found {declared!r}")
    definition = schema["$defs"]["owner_limits"]["properties"]
    for key, value in OWNER_LIMITS.items():
        if definition.get(key, {}).get("const") != value:
            failures.append(f"owner_limits: $defs/owner_limits/{key} must stay the owner value {value}")
    storage = (ROOT / "Plans/storage-plan.md").read_text(encoding="utf-8")
    heading = "### " + OWNER_LIMIT_UNIT.split("#")[1]
    start = storage.find(heading)
    if start < 0:
        failures.append(f"owner_limits: {OWNER_LIMIT_UNIT} is absent from the owner document")
    else:
        following = storage.find("\n### ", start + len(heading))
        span = storage[start:following if following > start else len(storage)]
        for token in OWNER_LIMIT_TOKENS:
            if token not in span:
                failures.append(f"owner_limits: {OWNER_LIMIT_UNIT} no longer declares the exact token {token!r}")
    numeric = sorted({
        node["const"] for node in _walk(schema)
        if isinstance(node, dict) and isinstance(node.get("const"), int) and not isinstance(node.get("const"), bool)
    })
    # Structural counts may be zero; every other numeric constant must be one of
    # the owner's existing limits.
    if sorted(set(numeric) - {0}) != sorted(OWNER_LIMITS.values()):
        failures.append(f"owner_limits: the companion declares numeric constants outside the owner limits: {numeric}")
    return failures, {"limits": observed, "numeric_constants": numeric}


def _walk(value: Any):
    if isinstance(value, dict):
        yield value
        for member in value.values():
            yield from _walk(member)
    elif isinstance(value, list):
        for member in value:
            yield from _walk(member)


def redaction_failures() -> tuple[list[str], dict[str, int]]:
    """No raw audio body and no private path enters the record set or a central receipt."""
    failures: list[str] = []
    checked = 0
    forbidden = ("audio_body", "raw_body", "raw_audio", "audio_bytes", "file_bytes",
                 "content_bytes", "absolute_path", "source_path", "filesystem_path", "private_path")
    for path in (ACTION_FIXTURES, DISPATCH_FIXTURES):
        document = load(path)
        # Only admitted rows are scanned: a negative fixture may declare the
        # refused key or value precisely to prove that it fails closed.
        text = json.dumps(document["valid"])
        for key in forbidden:
            if f'"{key}":' in text:
                failures.append(f"redaction:{path}: raw body or private-path key {key!r} is present")
        for row in document.get("valid", []):
            observed = ADAPTER._secret_material_failures(row["value"])  # noqa: SLF001 - shared static heuristic
            if observed:
                failures.append(f"redaction:{path}:{row['name']}: secret material or private path present")
            checked += 1
    declared = {
        row.get("semantic_rule") for row in load(ACTION_FIXTURES)["invalid"]
    } | {
        row.get("semantic_rule") for row in load(DISPATCH_FIXTURES)["invalid"]
    }
    if "sound_upload_import_secret_material" not in declared:
        failures.append("redaction: no negative fixture proves that secret material or a private path is refused")
    return failures, {"checked_records": checked}


def structural_failures() -> tuple[list[str], dict[str, int]]:
    """Every bare authored record still validates against its declared definition."""
    failures: list[str] = []
    counts = {"action_records": 0, "dispatch_records": 0}
    for path, key in ((ACTION_FIXTURES, "action_records"), (DISPATCH_FIXTURES, "dispatch_records")):
        for row in load(path)["valid"]:
            if _is_case_definition(row["definition"]):
                continue
            observed = ADAPTER.sound_upload_import_semantic_failures(
                row["definition"], row["value"], canon_root=ROOT)
            if observed:
                failures.append(f"structure:{path}:{row['name']}: {observed[:3]}")
            counts[key] += 1
    return failures, counts


def validate() -> dict[str, Any]:
    try:
        return _validate()
    except Exception as exc:  # noqa: BLE001 - a broken companion input is a named gate failure
        return {
            "check": "validate-sound-upload-import-contracts",
            "status": "fail",
            "failures": [f"validator_failure:{type(exc).__name__}:{exc}"],
            "stats": {"native_proof": False},
        }


def _validate() -> dict[str, Any]:
    failures: list[str] = []
    stats: dict[str, Any] = {}
    for path in (ADAPTER.ACTION_SCHEMA, ADAPTER.DISPATCH_SCHEMA):
        try:
            document = load(path)
        except Exception as exc:  # noqa: BLE001 - report the unreadable schema
            failures.append(f"schema:{path}: {exc}")
            continue
        if document.get("$id") != ADAPTER._document(str(ROOT), path)["$id"]:  # noqa: SLF001
            failures.append(f"schema:{path}: unstable $id")
    action_failures, action_stats = fixture_failures(ACTION_FIXTURES, "action")
    dispatch_failures, dispatch_stats = fixture_failures(DISPATCH_FIXTURES, "dispatch")
    failures.extend(action_failures + dispatch_failures)
    stats.update(action_stats)
    stats["dispatch_positive_cases"] = dispatch_stats["positive_cases"]
    stats["dispatch_negative_cases"] = dispatch_stats["negative_cases"]
    fixture_document = load(ACTION_FIXTURES)
    live = next(row["value"] for row in fixture_document["valid"]
                if row["name"] in ("sound_upload_request_case", "sound_pack_import_request_case"))
    failures.extend(resolver_required_failures(live))
    truth = ADAPTER.truth_table_agreement_failures(canon_root=ROOT)
    failures.extend(truth)
    stats["truth_table_states"] = len(ADAPTER.OUTCOME_RESPONSE_TRUTH)
    stats["truth_table_agreement"] = not truth
    touch, touch_stats = touch_failures()
    failures.extend(touch)
    stats["touch"] = touch_stats
    wiring, wiring_stats = wiring_failures()
    failures.extend(wiring)
    stats["wiring"] = wiring_stats
    limits, limit_stats = owner_limit_failures()
    failures.extend(limits)
    stats["owner_limits"] = limit_stats
    redaction, redaction_stats = redaction_failures()
    failures.extend(redaction)
    stats["redaction"] = redaction_stats
    structure, structure_stats = structural_failures()
    failures.extend(structure)
    stats["structure"] = structure_stats
    mapping = {
        path: sorted(set(ADAPTER.OWNER_RESULT_OUTCOME.get(path, {})))
        for path in sorted(ADAPTER.COMMANDS)
    }
    schema = load(ADAPTER.ACTION_SCHEMA)
    for path in sorted(ADAPTER.COMMANDS):
        enum_values = schema["$defs"][ADAPTER.RESULT_DEFINITION[path]]["properties"]["outcome"]["enum"]
        covered = set(ADAPTER.OWNER_RESULT_OUTCOME.get(path, {}))
        if set(enum_values) - covered:
            failures.append(f"owner_result_outcome:{path}: unmapped owner outcomes "
                            f"{sorted(set(enum_values) - covered)}")
    stats["owner_result_outcome_states"] = mapping
    failures.extend(retirement_failures())
    vocabulary, vocabulary_stats = vocabulary_failures()
    failures.extend(vocabulary)
    stats.update(vocabulary_stats)
    failures.extend(owner_reference_failures())
    response_cases = [row["name"] for row in fixture_document["valid"]
                      if row["definition"] == "response_case"]
    stats["response_cases"] = len(response_cases)
    stats["native_proof"] = False
    return {
        "check": "validate-sound-upload-import-contracts",
        "status": "pass" if not failures else "fail",
        "failures": sorted(failures),
        "stats": stats,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["validate"])
    parser.add_argument("--json", action="store_true", help="print the machine-readable report")
    args = parser.parse_args()
    report = validate()
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
