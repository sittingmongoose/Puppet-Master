#!/usr/bin/env python3
"""Read-only PM7 owner-contract checks; never runtime or rendering evidence."""
from copy import deepcopy
import json
import hashlib
from pathlib import Path
import runpy
import sys

import jsonschema

ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"


def read(name):
    return json.loads((PLANS / name).read_text())


def target_disposition(request, observed):
    """Static oracle for the identity guard required before owner dispatch."""
    scope = ("work_id", "project_id", "server_id", "environment_id", "generation")
    if any(request.get(key) != observed.get(key) for key in scope):
        return "stale_target"
    if request.get("pid") != observed.get("pid") or request.get("pid_start_time") != observed.get("pid_start_time"):
        return "pid_reused"
    if request.get("process_group") != observed.get("process_group"):
        return "stale_target"
    return "current"


def validate():
    failures = []

    def require(ok, message):
        if not ok:
            failures.append(message)

    schema = read("pm7_build_contracts.schema.json")
    jsonschema.Draft202012Validator.check_schema(schema)
    fixtures = read("pm7_build_contracts.fixtures.json")
    for case in fixtures["schema_cases"]:
        scoped = {**schema, "$ref": "#/$defs/" + case["definition"]}
        # Test a definition directly, without the top-level record union.
        scoped.pop("oneOf", None)
        valid = jsonschema.Draft202012Validator(scoped).is_valid(case["instance"])
        require(valid == case["valid"], "Schema case differs: " + case["name"])
    for case in fixtures["semantic_cases"]:
        require(target_disposition(case["request"], case["observed"]) == case["expected"],
                "Target guard differs: " + case["name"])

    parts = read("pip_parts.json")
    scoped = {**schema, "$ref": "#/$defs/PipPartsRegistry"}
    scoped.pop("oneOf", None)
    for error in jsonschema.Draft202012Validator(scoped).iter_errors(parts):
        failures.append("Pip registry: " + error.message)
    ids = [part["id"] for part in parts["parts"]]
    require(len(ids) == len(set(ids)) == 25, "Pip part IDs are not exactly 25 unique values")
    require(set(parts["presets"]) == {"Full", "Quiet", "Still", "Plain"}, "Pip preset names drifted")
    require(set(parts["presets"]["Full"]) == set(ids) - {"app-voice"}, "Full/default voice contract drifted")
    require({part["id"] for part in parts["parts"] if part["default_enabled"]} == set(parts["presets"]["Full"]),
            "Registry default flags disagree with Full")
    require(not set(parts["presets"]["Still"]) & {
        part["id"] for part in parts["parts"] if part["group"] == "Motion" or part["id"] == "setup-world-life"
    }, "Still enables motion or living worlds")
    require(not set(ids) & {"brand", "title-bar-mark", "tray-faces", "loaders", "notification-faces"},
            "S9 immutable brand/loader consumers became switchable")
    inventory = read("settings_inventory.json")["settings"]
    settings = {row["id"]: row for row in inventory}
    require(len(settings) == len(inventory) == 1011, "Settings count differs from the two-row admission")
    pip = settings["general.visual.pip-parts"]
    require(pip["options"] == ids and pip["default"] == parts["presets"]["Full"], "Settings and parts registry differ")
    require(settings["general.interaction.status-bar-words"]["default"] is False, "Numbers is not the default")
    glyphs = read("glyph_catalog.json")
    keys = {row["key"] for row in glyphs["status_marks"]}
    require(len(keys) == 22, "PM7 added a status key")
    require(set(glyphs["pip_mood_status_mappings"].values()) <= keys, "Mood maps to an unknown key")
    require("loading" not in next(row for row in glyphs["status_marks"] if row["key"] == "working")["surface_words"]["panels"],
            "Working still conflates application loading with item state")

    for surface, states in glyphs["surface_status_faces"].items():
        require(all(pair[0] in keys for pair in states.values()), surface + ": unknown status-face key")
    require(set(glyphs["surface_status_faces"]["memory"]) == {"Unverified", "Verified", "Discarded", "Out of date"},
            "Memory face table invents or omits a verification/display state")
    require(set(glyphs["surface_status_faces"]["scheduled"]) == {"Scheduled", "Held", "Sent", "Canceled", "Failed", "Expired"},
            "Scheduled face table differs from its six owner states")
    require(len(glyphs["surface_status_faces"]["agents"]) == 13, "Agent face table omits its run-state subset")
    require(glyphs["tray_status_precedence"] == ["waiting", "failed", "blocked", "working", "paused", "complete", "idle"],
            "A3 tray aggregation precedence differs from canon")
    require(next(row for row in glyphs["object_control_mappings"] if row["semantic_name"] == "work-panel-resources")["glyph_id"] == "gauge",
            "Resources does not reuse the existing gauge")
    pip_owner = (PLANS / "Settings_System.md").read_text()
    require(all(part_id in pip_owner for part_id in ids), "Accepted parts list is absent from SSYS-056 prose")

    bindings = read("pm7_control_bindings.json")["bindings"]
    by_control = {row["control_id"]: row for row in bindings}
    require(not any(row["control_id"].startswith("statusbar.") and
                    any(term in row["control_id"] for term in ("cpu", "memory", "ram")) for row in bindings),
            "G4 prohibits a CPU/RAM status bar item")
    for tab in ("agents", "processes", "resources"):
        require("work.panel." + tab in by_control, "Missing work panel tab " + tab)
    for control in ("work.stop_all.thread", "work.stop_all.platform"):
        require(by_control[control]["action_ids"] == ["cmd.work.stop"], "Stop all forks command identity")
    require(by_control["work.clear_finished"]["action_ids"] == ["cmd.work.clear_finished"], "Clear Finished route drifted")
    wiring = read("Wiring_Matrix.production.json")["entries"]
    command_ids = set(schema["$defs"]["project_command_id"]["enum"] + schema["$defs"]["work_command_id"]["enum"])
    for command in command_ids:
        routes = [row for row in wiring.values() if row["ui_command_id"] == command]
        require(len(routes) == 1, command + ": expected exactly one canonical production-intent route")
        if routes:
            require(routes[0]["request_schema_ref"].split("/")[-1] in schema["$defs"], command + ": unresolved request schema")
            require(not routes[0]["expected_event_types"], command + ": new candidate event emitted without authority")
    require(next(row for row in wiring.values() if row["ui_command_id"] == "cmd.work.clear_finished")["handler_location"] ==
            "handlers::work_panel::clear_finished", "Clear Finished must stay with the view owner")

    full = read("full_thread_runtime_contracts.schema.json")
    jsonschema.Draft202012Validator.check_schema(full)
    goal_realm = read("goal_workflow_cancel_schema_resources.json")["realms"]["goal"]
    full_thread_pins = [entry for kind in ("whole_documents", "embedded_resources")
                        for entry in goal_realm.get(kind, [])
                        if entry["path"] == "Plans/full_thread_runtime_contracts.schema.json"]
    full_thread_digest = hashlib.sha256((PLANS / "full_thread_runtime_contracts.schema.json").read_bytes()).hexdigest()
    require(bool(full_thread_pins) and all(entry["complete_document_sha256"] == full_thread_digest
                                         for entry in full_thread_pins),
            "Live Goal resource realm has a stale full-thread dependency digest")
    runtime = read("full_thread_runtime_contract_fixtures.json")
    semantic_check = runpy.run_path(str(ROOT / "scripts/pm_full_thread_semantics.py"))["full_thread_semantic_failures"]
    runtime_cases = 0
    for group, valid in (("positive", True), ("negative", False)):
        for case in runtime[group]:
            if not isinstance(case.get("instance"), dict):
                continue
            if case["instance"].get("record_kind") not in {"process_facts", "server_resource_sample"}:
                continue
            runtime_cases += 1
            actual = (jsonschema.Draft202012Validator(full, format_checker=jsonschema.FormatChecker()).is_valid(case["instance"])
                      and not semantic_check(case.get("definition", "<root>"), case["instance"]))
            require(actual == valid,
                    "Runtime case differs: " + case["name"])
    layout_schema = read("home_workspace_layout_v2.schema.json")
    registered_layout = next(row["value_schema"] for row in read("storage_value_registry.json")["families"]
                             if row["family_id"] == "home_workspace_layout_v2")
    require(registered_layout == layout_schema, "Current registered v2 layout schema differs from its owner")
    for label, value_schema in (("owner", layout_schema), ("registry", registered_layout)):
        width = value_schema["$defs"]["chat_column"]["properties"]["width_px"]
        width_validator = jsonschema.Draft202012Validator(width)
        require(all(width_validator.is_valid(value) for value in (900, 1200, None))
                and not width_validator.is_valid(399), label + ": chat width caps above 760 or loses its floor")

    touch = read("touch_closure.json")
    counts = fixtures["counts"]
    observed = {"settings": len(inventory), "status_keys": len(keys), "pip_parts": len(ids),
                "default_parts": len(pip["default"]), "pm7_bindings": len(bindings), "touch_rows": len(touch["rows"]),
                "touch_profiles": len(touch["profiles"]), "production_wiring_entries": len(wiring)}
    for key, count in observed.items():
        require(count == counts[key], key + ": fixture count pin differs")
    return {"status": "fail" if failures else "pass", "scope": "Static PM7 contracts; no native/runtime/rendering certification",
            "counts": observed, "schema_cases": len(fixtures["schema_cases"]),
            "identity_cases": len(fixtures["semantic_cases"]), "runtime_shape_cases": runtime_cases, "failures": failures}


if __name__ == "__main__":
    result = validate()
    print(json.dumps(result, indent=2))
    sys.exit(bool(result["failures"]))
