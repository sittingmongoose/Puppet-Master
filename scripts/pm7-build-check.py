#!/usr/bin/env python3
"""Read-only PM7 owner-contract checks; never runtime or rendering evidence."""
from copy import deepcopy
import ast
import json
import hashlib
from pathlib import Path
import runpy
import re
import subprocess
import sys

import yaml

import jsonschema
from referencing import Resource
from pm_ui_command_response import registry as command_response_registry

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


def pip_presets_match(canon, actual):
    expected = {name.title(): ids for name, ids in actual.items()}
    return canon == expected and canon.get("Plain") == []


def work_detail_census_errors(source, bindings, cases):
    """Reverse the literal detail controls/labels, including shared-hook branches."""
    detail = source.split("function detail(it, o)", 1)[1].split("\n  const btn =", 1)[0]
    actions = set(re.findall(r'data-work-act="([a-z_]+)"', detail))
    actions.update(re.findall(r"btn\(\s*'([^']+)'\s*,", detail))
    labels = set(re.findall(r"'act\.([^']+)'", detail))
    errors = []
    if actions != {case["source_action"] for case in cases}:
        errors.append("Detail action census differs from source emissions")
    if labels != {label for case in cases for label in case["source_labels"]}:
        errors.append("Detail label census omits a visible branch")
    by_id = {row["control_id"]: row for row in bindings}
    for case in cases:
        row = by_id.get(case["binding_id"], {})
        if row.get("action_ids") != case["action_ids"] or row.get("disposition") != case["disposition"]:
            errors.append("Missing/misrouted work control: " + case["binding_id"])
    return errors


def thread_consumer_route(profile, context):
    """Static consumer rule oracle; no thread navigation or focus is executed."""
    rule = profile.get("consumer_rules", {}).get(context.get("consumer"))
    if (not rule or not context.get("project_id") or not context.get("thread_id")
            or not context.get("current") or not context.get("focus_id")
            or (rule["requires_teacher_thread"] and not context.get("is_teacher_thread"))):
        return {"allowed": False}
    target = context.get("settings_manager") if rule["return_target"] == "settings_manager" else context.get("view_id")
    return ({"allowed": True, "view_id": target, "focus_id": context["focus_id"]}
            if target else {"allowed": False})


def activity_detail_geometry(policy, context):
    """G2 static boundary oracle; the layout owner supplies measured remaining width."""
    if context["can_widen"]:
        return "widen"
    return ("dock_squeeze" if context["remaining_messages_px"] >= policy["minimum_remaining_messages_px"]
            else policy["below_minimum"])


def notice_stage_presentation(policy, context):
    """F3-1 relational placement/click oracle; no DOM, paint or click is executed."""
    placed = context["placement_settled"]
    settled = placed and (context["phase"] == "settled" or (context["phase"] == "entering"
                         and context["reduced_motion"] and policy["reduced_motion_instant"]))
    selector_bottom = context["theme_menu_wrap_bottom_px"]
    top = (selector_bottom + context["theme_menu_gap_px"] if selector_bottom is not None
           else max(context["stage_base_top_px"], context["titlebar_bottom_px"] + context["theme_menu_gap_px"]))
    if context["inbox_open"]:
        top = context["inbox_bottom_px"] + context["inbox_gap_px"]
    accepts = (policy["accepts_clicks_during_exit"] if context["phase"] == "leaving"
               else settled or (placed and policy["accepts_clicks_during_entry"]))
    return {"first_card_top_px": top, "accepts_clicks": accepts}


def inbox_push_disposition(context):
    """F3-6 static ordering/geometry oracle; no owner animation or layout is executed."""
    if not context["open"]:
        return {"action": "clear"}
    if not context["owner_opened"]:
        return {"action": "defer"}
    target = context["chrome_target_height_px"]
    adjustment = 0 if target is None else target - context["chrome_layout_height_px"]
    return {"action": "set", "push_px": round(context["panel_layout_height_px"] + adjustment + context["gap_px"])}


def validate():
    failures = []

    def require(ok, message):
        if not ok:
            failures.append(message)

    schema = read("pm7_build_contracts.schema.json")
    jsonschema.Draft202012Validator.check_schema(schema)
    fixtures = read("pm7_build_contracts.fixtures.json")
    touch_profiles = {p["profile_id"]: p for p in read("touch_closure.json")["profiles"]}
    schema_documents = [schema, read("ui_command_response.schema.json"),
                        read("full_thread_runtime_contracts.schema.json"),
                        read("scheduling_and_quota_resume_contracts.schema.json")]
    registry = command_response_registry().with_resources(
        (doc["$id"], Resource.from_contents(doc)) for doc in schema_documents)

    def validate_ref(ref, value):
        path, _, fragment = ref.partition("#")
        doc = schema if path == "Plans/pm7_build_contracts.schema.json" else json.loads((ROOT / path).read_text())
        selected = {"$schema": "https://json-schema.org/draft/2020-12/schema",
                    "$ref": doc["$id"] + ("#" + fragment if fragment else "")}
        return jsonschema.Draft202012Validator(selected, registry=registry,
                                              format_checker=jsonschema.FormatChecker()).is_valid(value)

    for case in fixtures["reused_owner_touch_cases"]:
        profile = touch_profiles[case["profile_id"]]
        part, value = case["part"], case["instance"]
        ref = profile[{"payload": "payload_schema_ref", "result": "result_schema_ref", "error": "error_schema_ref"}[part]]
        if part == "payload" and ".json" not in ref.partition("#")[0]:
            # Catalog refs stay the payload authority. This fence checks common identity only.
            ref = profile["request_identity_schema_ref"]
            require("body validation remains uncompiled" in profile["production_or_simulation"],
                    case["profile_id"] + ": catalog identity fence promoted to body validation")
        owns = part == "error" or (isinstance(value, dict) and value.get("command_id") in profile["command_ids"])
        require((owns and validate_ref(ref, value)) == case["valid"], "Reused-owner Touch case differs: " + case["name"])
    expected_contracts = {
        "TCP-PM7-BROWSER-OPEN": ("Plans/UI_Command_Catalog.md#UCC-063", "Plans/ui_command_response.schema.json"),
        "TCP-PM7-TERMINAL-RERUN": ("Plans/UI_Command_Catalog.md#UCC-201", "Plans/ui_command_response.schema.json"),
        "TCP-PM7-SCHEDULE-CANCEL": (
            "Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ScheduledMessageCancelRequest",
            "Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ScheduledMessageCancelResult")}
    for profile_id, (request, result) in expected_contracts.items():
        profile = touch_profiles[profile_id]
        require((profile["payload_schema_ref"], profile["result_schema_ref"]) == (request, result),
                profile_id + ": wrong owner contract references")
        require(profile["receipt_refs"] and "pm7_build_contracts.schema.json" not in profile["error_schema_ref"],
                profile_id + ": wrong owner error/receipt contract")
    for case in fixtures["thread_consumer_cases"]:
        require(thread_consumer_route(touch_profiles["TCP-TEACHER-HELP"], case["context"]) == case["expected"],
                "Thread consumer availability/return differs: " + case["name"])
    policy = fixtures["presentation_policy"]
    policy_schema = {**schema, "$ref": "#/$defs/PresentationPolicy"}
    policy_schema.pop("oneOf", None)
    require(jsonschema.Draft202012Validator(policy_schema).is_valid(policy),
            "G2/F3-1 live static policy differs from the approved descriptor")
    require(not jsonschema.Draft202012Validator(schema).is_valid(policy),
            "Static presentation policy was admitted as a native command/action request")
    for case in fixtures["activity_geometry_cases"]:
        require(activity_detail_geometry(policy["activity_detail"], case["context"]) == case["expected"],
                "G2 geometry differs: " + case["name"])
    for case in fixtures["notice_stage_cases"]:
        require(notice_stage_presentation(policy["notice_stage"], case["context"]) == case["expected"],
                "F3-1 stage/entry differs: " + case["name"])
    for case in fixtures["inbox_push_cases"]:
        require(inbox_push_disposition(case["context"]) == case["expected"],
                "F3-6 inbox push differs: " + case["name"])
    # Execute only the actual source's pure placement helper against synthetic boxes, never a browser/paint.
    placement_source = ROOT / "Concepts/home-redesign/src/panels/js/50-pageshell.js"
    source_anchor_probe = r"""
      const fs = require('fs'), vm = require('vm'), d = JSON.parse(fs.readFileSync(0, 'utf8'));
      const src = fs.readFileSync(d.source, 'utf8');
      const globals = src.match(/var NOTICE_GAP = [^;]+;/)[0] + src.match(/var BAR_GAP = [^;]+;/)[0];
      const noticeGap = vm.runInNewContext(globals + '\nNOTICE_GAP');
      const fn = src.slice(src.indexOf('function noticeDrop(host)'), src.indexOf('function applyDrop()'));
      const rows = d.cases.filter(c => !c.context.inbox_open).map(c => {
        const x = c.context, selector = x.theme_menu_wrap_bottom_px;
        const box = bottom => ({getClientRects: () => [1], getBoundingClientRect: () => ({bottom, height: 20})});
        const ctx = {doc: {getElementById: () => selector == null ? null : box(selector),
                           querySelector: () => box(x.titlebar_bottom_px)}, host: box(x.stage_base_top_px - noticeGap)};
        const drop = vm.runInNewContext(globals + fn + '\nnoticeDrop(host)', ctx);
        return {name: c.name, top: x.stage_base_top_px + drop, expected: c.expected.first_card_top_px};
      });
      process.stdout.write(JSON.stringify(rows));
    """
    anchor_rows = json.loads(subprocess.run(["node", "-e", source_anchor_probe],
        input=json.dumps({"source": str(placement_source), "cases": fixtures["notice_stage_cases"]}),
        text=True, capture_output=True, check=True, timeout=20).stdout)
    require(all(abs(row["top"] - row["expected"]) <= 0.11 for row in anchor_rows),
            "F3-1 actual noticeDrop helper differs from theme-menu resting-top fixtures")
    notification_source = (ROOT / "Concepts/onboarding/opus-5.5/src/js/19-notify.js").read_text()
    notification_css = (ROOT / "Concepts/onboarding/opus-5.5/src/css/26-notify-00-core.css").read_text()
    require("--pmn-clear" not in notification_source + notification_css
            and "--pmn-push" in notification_source and "--pmn-push" in notification_css,
            "F3-1 clearance removal or lead inbox push exception differs from GUI source")
    stage_body = notification_source.split("function stage(it)", 1)[1].split("function enter(", 1)[0]
    open_body = notification_source.split("function openPanel()", 1)[1].split("function closePanel(", 1)[0]
    require(stage_body.index("c.classList.add('pmn-entering')") < stage_body.index("stageEl.appendChild(c)")
            and ".pmn-toast:is(.pmn-entering, .pmn-leaving)" in notification_css
            and "pointer-events: none !important" in notification_css,
            "F3-5 first-mount/all-page entry/exit pointer gate differs from GUI source")
    require(open_body.rfind("pushStage()") > open_body.index("window.PM6_SPROUT.open("),
            "F3-6 authoritative push is not refreshed after the sprout owner opens")
    push_probe = r"""
      const fs = require('fs'), vm = require('vm'), d = JSON.parse(fs.readFileSync(0, 'utf8'));
      const src = fs.readFileSync(d.source, 'utf8'), start = src.indexOf('function pushStage()');
      const fn = src.slice(start, src.indexOf('/* keep the stage inside the window.', start));
      const rows = d.cases.filter(c => !c.context.open || c.context.owner_opened).map(c => {
        const x = c.context; let push = null;
        const chrome = {style: {height: x.chrome_target_height_px == null ? '' : x.chrome_target_height_px + 'px'},
                        offsetHeight: x.chrome_layout_height_px};
        const ctx = {open: x.open, panelEl: {offsetHeight: x.panel_layout_height_px,
                     querySelector: () => chrome, getBoundingClientRect: () => ({height: x.painted_height_px})},
                     stageEl: {style: {setProperty: (_, value) => {push = parseFloat(value);}, removeProperty: () => {push = null;}}}};
        vm.runInNewContext(fn + '\npushStage()', ctx);
        return {name: c.name, actual: push == null ? {action: 'clear'} : {action: 'set', push_px: push}, expected: c.expected};
      });
      process.stdout.write(JSON.stringify(rows));
    """
    push_rows = json.loads(subprocess.run(["node", "-e", push_probe],
        input=json.dumps({"source": str(ROOT / "Concepts/onboarding/opus-5.5/src/js/19-notify.js"),
                          "cases": fixtures["inbox_push_cases"]}),
        text=True, capture_output=True, check=True, timeout=20).stdout)
    require(all(row["actual"] == row["expected"] for row in push_rows),
            "F3-6 actual pushStage helper differs from resting/destination height fixtures")
    gui_spec = (PLANS / "FinalGUISpec.md").read_text()
    require("Keep notice content clear of nearby controls" not in gui_spec
            and "Collision avoidance tries the nearest clear position" not in gui_spec
            and "Home staging below its panel strip" not in gui_spec,
            "F3-1 retired control-clearance or page-offset rule remains active")
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
    # Evaluate the one shared preset table without booting any UI or dispatching events.
    preset_script = """const fs=require('fs'),vm=require('vm');
const context={window:{addEventListener(){}},document:{readyState:'loading',addEventListener(){}}};
vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8'),context,{timeout:1000});
process.stdout.write(JSON.stringify(context.window.PM_PIP_PARTS.PRESETS));"""
    actual_presets = json.loads(subprocess.check_output(
        ["node", "-e", preset_script, str(ROOT / "Concepts/glyph-system/opus-5.5/src/logo/pm-pip-parts.js")],
        text=True, timeout=10))
    require(pip_presets_match(parts["presets"], actual_presets), "S1/S6 shared preset arrays differ")
    for case in fixtures["pip_preset_parity_cases"]:
        mutated = deepcopy(parts["presets"])
        for name, replacement in case["overrides"].items():
            mutated[name] = list(parts["presets"][replacement])
        require(pip_presets_match(mutated, actual_presets) == case["valid"],
                "Preset drift case differs: " + case["name"])
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
    chat = (ROOT / "Concepts/chat-assistant-concepts/5.6 Pro/module-shell.js").read_text()
    chat_faces = re.search(r"var PIP_STATE_MOOD = \{(.*?)\};", chat, re.S)
    face_map = {a or b: c for a, b, c in re.findall(
        r"(?:'([^']+)'|(\w+)):\s*'([^']+)'", chat_faces[1])} if chat_faces else {}
    aliases = {"needs-you": "needs", "dependency-wait": "waiting-dep"}
    for state, (_, face) in glyphs["surface_status_faces"]["agents"].items():
        actual = face_map.get(aliases.get(state, state), "idle")
        require(face == ("working" if actual == "dots" else actual),
                "A5 chat agent face differs: " + state)
    require(glyphs["surface_status_faces"]["agents"]["working"] == ["working", "working"]
            and re.search(r"function moodOf\(m\).*?m === 'working' \? 'dots'", kit)
            and "working: 'working'" in kit,
            "Working must use the public mood that both consumers render as dots")
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
    work_source = (ROOT / "Concepts/onboarding/opus-5.5/src/js/48-work.js").read_text()
    census = fixtures["work_detail_control_census"]
    failures.extend(work_detail_census_errors(work_source, bindings, census))
    for case in fixtures["work_detail_census_cases"]:
        mutated_bindings, mutated_cases, mutated_source = deepcopy(bindings), deepcopy(census), work_source
        if "remove_binding" in case:
            mutated_bindings = [row for row in mutated_bindings if row["control_id"] != case["remove_binding"]]
        if "remove_case" in case:
            mutated_cases = [row for row in mutated_cases if row["binding_id"] != case["remove_case"]]
        if "extra_action" in case:
            mutated_source = mutated_source.replace("\n  const btn =", '\n data-work-act="' + case["extra_action"] + '"\n  const btn =', 1)
        if "rebind" in case:
            next(row for row in mutated_bindings if row["control_id"] == case["rebind"])["action_ids"] = case["action_ids"]
        require((not work_detail_census_errors(mutated_source, mutated_bindings, mutated_cases)) == case["valid"],
                "Reverse control census case differs: " + case["name"])
    by_control = {row["control_id"]: row for row in bindings}
    staged_notice_controls = {"notifications.activate_toast", "notifications.dismiss_toast",
        "notifications.approve", "notifications.decline", "notifications.permission.once",
        "notifications.permission.session", "notifications.permission.always", "notifications.permission.deny",
        "notifications.concern.resolve", "notifications.details", "notifications.explain",
        "notifications.permission.pattern", "notifications.permission.scope", "notifications.filesafe.once",
        "notifications.filesafe.deny", "notifications.filesafe.add_rule"}
    require(all("inactive during entry or exit" in by_control[c]["payload"] for c in staged_notice_controls),
            "F3-1 stage producer is missing its transient click gate")
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
    unit_sets = {"Decision_Log.md": [f"DL-{n:03d}" for n in range(235, 257)],
                 "FinalGUISpec.md": [f"F3-{n}" for n in range(660, 666)],
                 "DRY_Rules.md": [f"DR-{n:03d}" for n in range(76, 80)],
                 "Settings_System.md": ["SSYS-056", "SSYS-057"],
                 "assistant-chat-design.md": ["ACD-505", "ACD-506", "ACD-507"],
                 "Commands_System.md": ["CS-105", "CS-106"],
                 "UI_Command_Catalog.md": ["UCC-209", "UCC-210", "UCC-211"],
                 "Wiring_Matrix.md": ["WM-097"], "UI_Wiring_Rules.md": ["UIW-045"],
                 "Shared_Integration_Runtime.md": ["SIR-054"]}
    for file, wanted in unit_sets.items():
        units = {}
        for block in re.findall(r"```yaml\n(.*?)\n```", (PLANS / file).read_text(), re.S):
            match = re.search(r"^plan_unit_id: (\S+)$", block, re.M)
            if match and match[1] in wanted:
                units[match[1]] = yaml.safe_load(block)
        require(set(units) == set(wanted), "PM7 registered unit missing in " + file)
        for unit_id, unit in units.items():
            for token in unit.get("preserved_exact_tokens", []):
                require(token in unit["canonical_text"], unit_id + ": registered token absent: " + token)
            if unit_id in {"CS-106", "UCC-210", "F3-664"}:
                require("ui.system_status.close" in unit["canonical_text"], unit_id + ": abbreviated System close token")
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
            "work_detail_controls": len(census),
            "work_detail_omission_cases": len(fixtures["work_detail_census_cases"]),
            "pip_preset_parity_cases": len(fixtures["pip_preset_parity_cases"]),
            "reused_owner_touch_cases": len(fixtures["reused_owner_touch_cases"]),
            "thread_consumer_cases": len(fixtures["thread_consumer_cases"]),
            "activity_geometry_cases": len(fixtures["activity_geometry_cases"]),
            "notice_stage_cases": len(fixtures["notice_stage_cases"]),
            "inbox_push_cases": len(fixtures["inbox_push_cases"]),
            "notice_source_anchor_cases": len(anchor_rows),
            "inbox_source_push_cases": len(push_rows),
            "concept_source_anchors": source_anchors, "failures": failures}


if __name__ == "__main__":
    result = validate()
    print(json.dumps(result, indent=2))
    sys.exit(bool(result["failures"]))
