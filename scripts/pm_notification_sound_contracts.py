#!/usr/bin/env python3
"""Static gate for the typed Notifications/Sounds action companion.

Validates the closed typed companion, its causal fixtures, its authentic
original/dispatcher binding, the actual central response join, the Touch
Closure profile binding and the existing production wiring values for exactly
`cmd.notifications.destination.test` and `cmd.sound.preview`.

Nothing here is native dispatch, delivery, audio playback, permission, receipt
or physical-custody proof, and no Touch row, handler status or wiring status is
promoted by a passing run.
"""

from __future__ import annotations

import argparse
import copy
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

import pm_notification_sound_response as ADAPTER  # noqa: E402

ACTION_FIXTURES = "Plans/notifications_sound_action_fixtures.json"
DISPATCH_FIXTURES = "Plans/sir_notifications_sound_dispatch_fixtures.json"
TOUCH_REGISTRY = "Plans/touch_closure.json"
WIRING_MATRIX = "Plans/Wiring_Matrix.production.json"
SHARED_PROFILE = "TCP-NOTIFY-SOUND"
SEALED_ACCOUNTING = {"profile_count": 152, "row_count": 646, "excluded_token_count": 58, "alias_binding_count": 65}
ACTION_REF_DEFINITION = {
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
# All four other Sound routes now have action-qualified static companions;
# this notification/preview companion does not claim their native execution.
UNBOUND_SOUND_ACTIONS: set[str] = set()
COMPANION_BOUND_SOUND_ACTIONS = {
    "cmd.sound.upload": "Plans/sound_upload_import_action_contracts.schema.json",
    "cmd.sound.pack.import": "Plans/sound_upload_import_action_contracts.schema.json",
    "cmd.sound.asset.delete": "Plans/sound_asset_delete_action_contracts.schema.json",
    "cmd.sound.asset.export": "Plans/sound_asset_export_action_contracts.schema.json",
}
WIRING_ROW = {
    "cmd.notifications.destination.test": "catalog.notifications_destination_test",
    "cmd.sound.preview": "catalog.sound_preview",
}
RETIRED_SPELLING = "cmd.settings.open_notifications"
OWNER_UNITS = {
    "Plans/UI_Command_Catalog.md": ["UCC-103"],
    "Plans/Contracts_V0.md": ["CV-298", "CV-333"],
    "Plans/Permissions_System.md": ["PS-124"],
    "Plans/storage-plan.md": ["SP-222"],
    "Plans/FinalGUISpec.md": ["F3-405"],
    "Plans/Runtime_Artifacts_Panel.md": ["RAP-039"],
    "Plans/Automated_Testing_System.md": ["ATS-016"],
    "Plans/Wiring_Matrix.md": ["WM-039"],
    "Plans/Shared_Integration_Runtime.md": ["SIR-042"],
}


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
        return ADAPTER.notification_sound_semantic_failures(
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
    return definition.endswith("_case") or definition in {"projection_case"}


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
        if "notification_sound_resolver_missing:resolve_owner_original" not in observed and (
                "notification_sound_resolver_missing:resolve_sir_dispatch" not in observed and
                "notification_sound_resolver_missing:resolve_dispatcher" not in observed):
            failures.append(f"resolver_required:{label}: missing resolver was not refused: {observed[:3]}")
    return failures


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
        if "remain implementation and verification work" not in residual:
            failures.append(f"touch:{action}: residual must distinguish remaining implementation and verification work from the materialized specification")
        if "native" not in residual.lower():
            failures.append(f"touch:{action}: residual must keep naming the missing native work")
        if "implemented" in residual.lower() or "verified native" in residual.lower():
            failures.append(f"touch:{action}: residual must not claim implementation")
        for field, definition in definitions.items():
            ref = str(profile.get(field, ""))
            binding = f"{action} -> {ADAPTER.ACTION_SCHEMA}#/$defs/{definition}"
            if binding not in ref:
                failures.append(f"touch:{action}: {field} must carry the action-qualified binding {binding!r}")
                continue
            pointer = "#/$defs/" + definition
            try:
                resolve_pointer(load(ADAPTER.ACTION_SCHEMA), pointer)
            except Exception as exc:  # noqa: BLE001 - a stale ref is a gate failure
                failures.append(f"touch:{action}: {field} has an unresolved pointer {pointer}: {exc}")
        stats[action] = {"profile": row[1], "disposition": row[4], "handler_status": profile["handler_status"]}
    if profile.get("handler_status") != "specified":
        failures.append("touch: handler_status must stay specified for both rows")
    if profile.get("wiring_status") != "specified":
        failures.append("touch: wiring_status must stay specified for both rows")
    # The planned handler identities are joined from the real production rows in
    # wiring_failures(); the shared profile keeps its static owner prose.
    evidence = " ".join(profile.get("evidence_refs", [])).lower()
    if "static" not in evidence:
        failures.append("touch: evidence_refs must stay explicitly static")
    for field in ("payload_schema_ref", "result_schema_ref", "error_schema_ref"):
        clauses = {}
        for clause in str(profile.get(field, "")).split(";"):
            left, _, right = clause.partition("->")
            for action in left.split("/"):
                action = action.strip()
                if action.startswith("cmd."):
                    clauses[action] = right.strip()
        for action in sorted(UNBOUND_SOUND_ACTIONS):
            binding = clauses.get(action)
            if binding != "unmaterialized":
                failures.append(f"touch: {field} must leave unbound route {action} unmaterialized, "
                                f"found {binding!r}")
        for action, companion in sorted(COMPANION_BOUND_SOUND_ACTIONS.items()):
            if companion not in str(clauses.get(action, "")):
                failures.append(f"touch: {field} must bind {action} to {companion}, "
                                f"found {clauses.get(action)!r}")
        if ADAPTER.ACTION_SCHEMA in str(profile.get(field, "")) and not any(
                ADAPTER.COMMANDS & set(clauses)):
            failures.append(f"touch: {field} companion refs must stay action-qualified")
    if "RAP-039 applies to destination-test and asset-export evidence only; not local playback" not in (
            profile.get("production_or_simulation", "")):
        failures.append("touch: the profile lost its RAP-039/local-preview scope statement")
    if "local preview never sends externally" not in profile.get("disabled_reason_rule", ""):
        failures.append("touch: the profile lost its local-preview statement")
    test_refs = [str(ref) for ref in profile.get("test_refs", [])]
    for ref in (ACTION_FIXTURES, DISPATCH_FIXTURES, "scripts/pm_notification_sound_contracts.py"):
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
        ACTION_FIXTURES: load(ACTION_FIXTURES),
        DISPATCH_FIXTURES: load(DISPATCH_FIXTURES),
    }
    for path, document in documents.items():
        text = json.dumps(document)
        for key in ADAPTER.FORBIDDEN_COMPANION_KEYS:
            if f'"{key}"' in text:
                failures.append(f"vocabulary:{path}: forbidden new key {key!r} is present")
    closed = documents[ADAPTER.ACTION_SCHEMA]["$defs"]["action_id"]["enum"]
    if set(closed) != set(ADAPTER.COMMANDS):
        failures.append("vocabulary: the closed action set must be exactly the two authored routes")
    providers = documents[ADAPTER.ACTION_SCHEMA]["$defs"]["provider_kind"]["enum"]
    if len(providers) != 9:
        failures.append("vocabulary: provider kinds must stay the CV-298 destination set")
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
    return failures, {"providers": len(providers), "closed_actions": closed}


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


def validate() -> dict[str, Any]:
    try:
        return _validate()
    except Exception as exc:  # noqa: BLE001 - a broken companion input is a named gate failure
        return {
            "check": "validate-notification-sound-contracts",
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
        if document.get("$id") != ADAPTER._document(str(ROOT), path)["$id"]:
            failures.append(f"schema:{path}: unstable $id")
    action_failures, action_stats = fixture_failures(ACTION_FIXTURES, "action")
    dispatch_failures, dispatch_stats = fixture_failures(DISPATCH_FIXTURES, "dispatch")
    failures.extend(action_failures + dispatch_failures)
    stats.update(action_stats)
    stats["dispatch_positive_cases"] = dispatch_stats["positive_cases"]
    stats["dispatch_negative_cases"] = dispatch_stats["negative_cases"]
    fixture_document = load(ACTION_FIXTURES)
    live = next(row["value"] for row in fixture_document["valid"]
                if row["name"] == "destination_test_request_case")
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
    mapping = {
        path: sorted(set(ADAPTER.OWNER_RESULT_OUTCOME.get(path, {})))
        for path in sorted(ADAPTER.COMMANDS)
    }
    for path in sorted(ADAPTER.COMMANDS):
        enum_values = json.loads((ROOT / ADAPTER.ACTION_SCHEMA).read_text(encoding="utf-8"))[
            "$defs"][ADAPTER.RESULT_DEFINITION[path]]["properties"]["outcome"]["enum"]
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
        "check": "validate-notification-sound-contracts",
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
