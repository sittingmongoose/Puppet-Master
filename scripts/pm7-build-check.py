#!/usr/bin/env python3
"""Read-only PM7 owner-contract checks; never runtime or rendering evidence."""
from copy import deepcopy
import ast
import json
import hashlib
from pathlib import Path
import runpy
import re
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


def activity_detail_after_thread_switch(before, selected_thread):
    """G1 B contract oracle; native subscriptions/rendering still need GUI evidence."""
    remains_open = before["open"] and before["pinned"]
    return {
        "view_id": before["view_id"],
        "thread_id": selected_thread["thread_id"],
        "open": remains_open,
        "pinned": before["pinned"],
        "row_ids": list(selected_thread["row_ids"]) if remains_open else [],
    }


def project_badge_disposition(case):
    """B5 contract oracle: buffers belong to their Project; layout is autosaved."""
    keys = set(case["status_keys"])
    if any(tab["project_id"] == case["project_id"] and tab["dirty"] for tab in case["home_tabs"]):
        keys.add("change-modified")
    word = {"waiting": "Needs you", "blocked": "Blocked", "working": "Working",
            "change-modified": "Unsaved changes", "idle": ""}
    key = next((key for key in word if key in keys), "idle")
    return {"key": key, "word": word[key]}


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
    for case in fixtures["project_badge_cases"]:
        require(project_badge_disposition(case) == case["expected"], "B5 badge differs: " + case["name"])
    activity_state_schema = {**schema, "$ref": "#/$defs/ActivityDetailViewState"}
    activity_state_schema.pop("oneOf", None)
    activity_state_validator = jsonschema.Draft202012Validator(activity_state_schema)
    for case in fixtures["activity_detail_thread_switch_cases"]:
        actual = activity_detail_after_thread_switch(case["before"], case["selected_thread"])
        require(activity_state_validator.is_valid(case["before"])
                and activity_state_validator.is_valid(case["expected"]),
                "Invalid G1 view-state fixture: " + case["name"])
        require(actual == case["expected"], "G1 thread switch differs: " + case["name"])

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
    code_parts = []
    part_source = (ROOT / "Concepts/glyph-system/opus-5.5/src/logo/pm-pip-parts.js").read_text()
    for match in re.finditer(r"\['([^']+)', '([^']+)', '([^']+)', (true|false), (\d+), '((?:\\.|[^'])*)'\]", part_source):
        code_parts.append({"id": match[1], "label": match[2], "group": match[3],
                           "default_enabled": match[4] == "true", "size": int(match[5]),
                           "help": ast.literal_eval("'" + match[6] + "'")})
    require(len(code_parts) == 25 and all(
        all(canon.get(key) == value for key, value in actual.items())
        for canon, actual in zip(parts["parts"], code_parts)),
        "S1-S9 parts IDs/labels/groups/defaults/sizes/help differ from the joined one registry")
    require(not set(parts["presets"]["Still"]) & {
        part["id"] for part in parts["parts"] if part["group"] == "Motion" or part["id"] == "setup-world-life"
    }, "Still enables motion or living worlds")
    require(not set(ids) & {"brand", "title-bar-mark", "tray-faces", "loaders", "notification-faces"},
            "S9 immutable brand/loader consumers became switchable")
    inventory = read("settings_inventory.json")["settings"]
    settings = {row["id"]: row for row in inventory}
    require(len(settings) == len(inventory) == 1011, "Settings count differs from the two-row admission")
    pip = settings["general.visual.pip-parts"]
    labels = [part["label"] for part in parts["parts"]]
    label_by_id = {part["id"]: part["label"] for part in parts["parts"]}
    require(len(set(labels)) == 25, "Pip labels do not map one-to-one to stable IDs")
    require(pip["options"] == labels and pip["default"] == [label_by_id[part_id] for part_id in parts["presets"]["Full"]],
            "Settings must store shared-registry labels, with IDs reserved for registry/API identity")
    require(schema["$defs"]["PipPartsSettingValue"]["items"]["enum"] == labels,
            "Pip setting value schema differs from the registry labels")
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
    code_status = json.loads((ROOT / "Concepts/glyph-system/opus-5.5/src/data/status.json").read_text())
    require(code_status["surfaces"]["working"]["panels"] ==
            next(row for row in glyphs["status_marks"] if row["key"] == "working")["surface_words"]["panels"],
            "L1 joined code and canon disagree on working panels words")
    kit = (ROOT / "Concepts/glyph-system/opus-5.5/src/logo/pm-logo.js").read_text()
    # A5: each real kit mood has its own alias; sharing the working status adds no status key.
    mood_row = re.search(r"const MOOD_STATUS = Object.freeze\(\{(.*?)\}\)", kit, re.S)
    code_moods = dict(re.findall(r"(\w+):\s*'([^']+)'", mood_row[1])) if mood_row else {}
    require(bool(code_moods) and all(glyphs["pip_mood_status_mappings"].get(mood) == key
                                    for mood, key in code_moods.items()),
            "A5 code mood aliases differ from the canonical mood-to-status table")
    period = re.search(r"function periodOf\([^)]*\)\s*\{(.*?)\n  \}", kit, re.S)
    require(bool(period) and "tier" not in period[1] and "fam.dur * .78" in period[1]
            and "fam.dur * 1.15" in period[1], "L-1 motion ratios differ by tier or from the accepted values")
    require(fixtures["loader_contract"]["family_token_owner"] == "PMLogo.MOTION"
            and fixtures["loader_contract"]["ratios"] == {"swing": 1, "think": 1.15, "hop": .78},
            "Loader motion owner/fixture ratios differ")
    basic_export = re.search(r"'basic-dark':\s*\{(.*?)(?=\n    'basic-light':)", kit, re.S)
    for token in ("#121212", "#E8E8E8", "#9E9E9E", "#7A8290", "#64B5F6", "#2D2D2D", "rgba(255,255,255,.08)"):
        require(bool(basic_export) and token in basic_export[1], "W1-40 release EXPORT palette differs: " + token)
    require("px: 14" in (ROOT / "Concepts/onboarding/opus-5.5/src/settings/kit.js").read_text()
            and "px: 14" in (ROOT / "Concepts/home-redesign/src/panels/js/27-frames.js").read_text()
            and "px: 16" in (ROOT / "Concepts/chat-assistant-concepts/5.6 Pro/pip.js").read_text(),
            "L-2 busy-button/thinking source sizes differ")
    require(fixtures["loader_contract"]["placements_px"] == {
        "busy_button": 14, "thinking_placeholder": 16, "working_row": 18,
        "content_wait_tab": 14, "panel": 40, "splash": 128}, "L-2 accepted placement fixture differs")
    pip_owner = (PLANS / "Settings_System.md").read_text()
    require(all(part_id in pip_owner for part_id in ids), "Accepted parts list is absent from SSYS-056 prose")

    bindings = read("pm7_control_bindings.json")["bindings"]
    by_control = {row["control_id"]: row for row in bindings}
    source_anchors = 0
    for row in bindings:
        for anchor in row.get("concept_sources", []):
            source_anchors += 1
            path = ROOT / anchor["path"]
            require(path.is_file(), row["control_id"] + ": missing concept source " + anchor["path"])
            if path.is_file():
                body = path.read_text()
                for token in anchor["tokens"]:
                    require(token in body, row["control_id"] + ": missing source token " + token)
    require(sum(bool(row.get("concept_sources")) for row in bindings) == fixtures["counts"]["new_bindings"],
            "A new PM7 control lacks its joined source-name mapping")
    for control, action in (("statusbar.system_status", "ui.system_status.open"),
                            ("work.open_system_status", "ui.system_status.open"),
                            ("system_status.close", "ui.system_status.close"),
                            ("system_status.service.open_settings", "ui.settings.route.open")):
        row = by_control.get(control, {})
        require(row.get("action_ids") == [action] and row.get("disposition") == "local"
                and not row.get("production_entries") and not row.get("setting_ids"),
                control + ": System status gained a mutation route or lost its local identity")
    require(set(schema["$defs"]["system_status_settings_route_request"]["properties"]["setting_id"]["enum"])
            <= set(settings), "System status owner navigation targets an unknown setting")
    pin = by_control.get("chat.activity.pin", {})
    require(pin.get("action_ids") == ["ui.activity_detail.pin"] and pin.get("disposition") == "local"
            and not pin.get("production_entries") and not pin.get("setting_ids"),
            "G1 Pin must retain its single view-local route without a Settings/runtime writer")
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
            "identity_cases": len(fixtures["semantic_cases"]), "runtime_shape_cases": runtime_cases,
            "activity_thread_switch_cases": len(fixtures["activity_detail_thread_switch_cases"]),
            "project_badge_cases": len(fixtures["project_badge_cases"]),
            "concept_source_anchors": source_anchors, "failures": failures}


if __name__ == "__main__":
    result = validate()
    print(json.dumps(result, indent=2))
    sys.exit(bool(result["failures"]))
