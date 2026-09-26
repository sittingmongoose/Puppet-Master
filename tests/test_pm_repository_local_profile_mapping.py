#!/usr/bin/env python3
"""Focused regression for the repaired TCP-REPOSITORY-LOCAL Touch profile.

Validates the installed repository authorities (or the external author's
frozen input authorities when run inside the detached job) against the
repaired Touch Closure profile, that:

1. each of the three accepted F3-529 local presentation actions maps to its
   exact existing specialized request/result ``$defs`` in the profile's
   action-qualified reference strings, with no permissive common-type pointer
   left anywhere in the profile;
2. every specialized request/result rejects the root's ``{}`` replacement of
   ``action_context``/``result_detail`` with the exact per-pair error counts
   root reproduced from the current schema (7/6, 6/4, 8/7) while the common
   types accept the same replacement (0 errors) — the permissive-pointer
   weakness the repair removes;
3. all three actions appear in triggers, receipt refs and return attribution;
   the permission gate is corrected from "Neither action" to three with the
   identical denied-authority list (no permission/availability broadening);
4. the false-mutation, no-semantic-domain-handler, no-EventRecord,
   no-persistence and no-native-proof boundaries hold in the profile, the
   owner's negative constraints, and the positive fixtures;
5. the three TOUCH-REPLOCAL rows keep their exact identities and partial
   disposition. When an explicit baseline is supplied, no unrelated Touch
   row or profile changes relative to that baseline.

Static contract validation only. A passing run proves shape-level mapping and
fixture rejection; it is not native controller authorization, runtime
execution, or any handler/permission/availability proof.
"""

import copy
import json
import os
import re
import sys
from pathlib import Path

from jsonschema import Draft202012Validator

TEST_FILE = Path(__file__).resolve()
EXTERNAL_JOB = TEST_FILE.parents[2]
if (EXTERNAL_JOB / "inputs/Plans/touch_closure.json").is_file() and (
    TEST_FILE.parents[1] / "Plans/touch_closure.json"
).is_file():
    INPUTS = EXTERNAL_JOB / "inputs"
    CANDIDATE = EXTERNAL_JOB / "candidate"
    DEFAULT_BASE_TOUCH_PATH = INPUTS / "Plans/touch_closure.json"
else:
    # The test also runs after installation at <repo>/tests/<this file>.
    INPUTS = TEST_FILE.parents[1]
    CANDIDATE = INPUTS
    DEFAULT_BASE_TOUCH_PATH = None

SCHEMA_PATH = INPUTS / "Plans" / "final_gui_interaction_contracts.schema.json"
FIXTURES_PATH = INPUTS / "Plans" / "final_gui_interaction_contract_fixtures.json"
OWNER_PATH = INPUTS / "Plans" / "FinalGUISpec.md"
BASE_TOUCH_PATH = (
    Path(os.environ["PM_REPOSITORY_LOCAL_BASE_TOUCH"])
    if os.environ.get("PM_REPOSITORY_LOCAL_BASE_TOUCH")
    else DEFAULT_BASE_TOUCH_PATH
)
REPAIRED_TOUCH_PATH = CANDIDATE / "Plans" / "touch_closure.json"

PROFILE_ID = "TCP-REPOSITORY-LOCAL"
ACTIONS = (
    "ui.source_control.profile.preview",
    "ui.repository_automation.binding.select",
    "ui.source_control.backup_history.open",
)

SPECIALIZED_DEFS = {
    "ui.source_control.profile.preview": (
        "source_control_profile_preview_local_action_request",
        "source_control_profile_preview_local_action_result",
    ),
    "ui.repository_automation.binding.select": (
        "repository_local_action_request",
        "repository_local_action_result",
    ),
    "ui.source_control.backup_history.open": (
        "source_control_backup_local_action_request",
        "source_control_backup_local_action_result",
    ),
}

FIXTURE_KEYS = {
    "ui.source_control.profile.preview": (
        "profile_preview_request",
        "profile_preview_result",
    ),
    "ui.repository_automation.binding.select": (
        "binding_select_request",
        "binding_select_result",
    ),
    "ui.source_control.backup_history.open": (
        "backup_history_open_request",
        "backup_history_open_result",
    ),
}

# Exact per-pair specialized error counts root reproduced against the current
# schema by replacing request action_context / result result_detail with {}
# (scope ../REPOSITORY-LOCAL-PROFILE-SCOPE-20260926.md); re-derived live below,
# never guessed.
SPECIALIZED_REJECTION_COUNTS = {
    "ui.source_control.profile.preview": (7, 6),
    "ui.repository_automation.binding.select": (6, 4),
    "ui.source_control.backup_history.open": (8, 7),
}

EXPECTED_UNCHANGED_PROFILE_FIELDS = {
    "availability_rule": "The exact current repository projection, project and repository identities, accessibility description, caller return context, and mounted owner-local presentation controller are required; binding selection additionally requires at least two already-authorized AutomationBinding refs, and Backup navigation requires an immutable revision plus exact Backup-owner route and deep link.",
    "disabled_reason_rule": "Return stale_projection or caller_unavailable with deterministic return settlement; never register or simulate a semantic-domain command, provider mutation, restore, or owner work.",
    "handler_owner": "Owner-local typed UI controller only; semantic_domain_handler is null and no domain handler exists.",
    "wiring_status": "specified",
    "production_or_simulation": "Typed owner-local request/result contract and static fixtures only; no production UICommand row, EventRecord, persistent-state mutation, native Slint controller, or runtime claim.",
}

FAILURES = []


def check(condition, message):
    if not condition:
        FAILURES.append(message)
    return condition


def validator_for(defs, name):
    return Draft202012Validator({"$ref": f"#/$defs/{name}", "$defs": defs})


def error_count(validator, instance):
    return len(list(validator.iter_errors(instance)))


def exact_action_map(value, expected):
    """Require one and only one exact typed reference for every accepted action."""
    entries = value.split("; ")
    if len(entries) != len(expected):
        return False
    parsed = []
    for entry in entries:
        parts = entry.split(" -> ")
        if len(parts) != 2 or not all(parts):
            return False
        parsed.append(tuple(parts))
    keys = [action for action, _ in parsed]
    return len(keys) == len(set(keys)) and dict(parsed) == expected


def main():
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    defs = schema["$defs"]
    fixtures = json.loads(FIXTURES_PATH.read_text(encoding="utf-8"))
    pairs = fixtures["positive_instance"]["contracts"][7]["local_action_pairs"]

    repaired_doc = json.loads(REPAIRED_TOUCH_PATH.read_text(encoding="utf-8"))
    base_doc = (
        json.loads(BASE_TOUCH_PATH.read_text(encoding="utf-8"))
        if BASE_TOUCH_PATH is not None
        else None
    )
    profiles = {p["profile_id"]: p for p in repaired_doc["profiles"]}
    base_profiles = (
        {p["profile_id"]: p for p in base_doc["profiles"]}
        if base_doc is not None
        else None
    )
    check(
        PROFILE_ID in profiles,
        f"{PROFILE_ID} missing from candidate touch_closure.json",
    )
    profile = profiles[PROFILE_ID]
    owner_rows = [
        row
        for row in repaired_doc["rows"]
        if row[1] == PROFILE_ID
    ]

    # --- 1. exact action-qualified mapping to the existing specialized defs ---
    request_ref = profile["payload_schema_ref"]
    result_ref = profile["result_schema_ref"]
    error_ref = profile["error_schema_ref"]
    expected_request_map = {
        action: f"Plans/final_gui_interaction_contracts.schema.json#/$defs/{req_def}"
        for action, (req_def, _) in SPECIALIZED_DEFS.items()
    }
    expected_result_map = {
        action: f"Plans/final_gui_interaction_contracts.schema.json#/$defs/{res_def}"
        for action, (_, res_def) in SPECIALIZED_DEFS.items()
    }
    for field, expected in (
        ("dry_contract_ref", expected_request_map),
        ("payload_schema_ref", expected_request_map),
        ("result_schema_ref", expected_result_map),
        ("error_schema_ref", expected_result_map),
    ):
        check(
            exact_action_map(profile[field], expected),
            f"profile {field} must resolve exactly three unique actions to exact specialized refs",
        )
    first_action = ACTIONS[0]
    duplicate = request_ref + f"; {first_action} -> {expected_request_map[first_action]}"
    wrong = request_ref.replace(
        f"{first_action} -> {expected_request_map[first_action]}",
        f"{first_action} -> {expected_request_map[ACTIONS[1]]}",
        1,
    )
    check(not exact_action_map(duplicate, expected_request_map), "duplicate action negative probe passed")
    check(not exact_action_map(wrong, expected_request_map), "wrong-target negative probe passed")
    for field in ("dry_contract_ref", "payload_schema_ref", "result_schema_ref", "error_schema_ref"):
        value = profile[field]
        check(
            "local_action_common_request" not in value
            and "local_action_common_result" not in value,
            f"profile {field} still references the permissive common type: {value}",
        )
        for action in ACTIONS:
            check(
                action in value,
                f"profile {field} is missing the action-qualified entry for {action}",
            )
    for action, (req_def, res_def) in SPECIALIZED_DEFS.items():
        check(
            req_def in defs and res_def in defs,
            f"specialized defs for {action} missing from schema $defs",
        )
        expected_request = (
            f"{action} -> Plans/final_gui_interaction_contracts.schema.json#/$defs/{req_def}"
        )
        expected_result = (
            f"{action} -> Plans/final_gui_interaction_contracts.schema.json#/$defs/{res_def}"
        )
        check(
            expected_request in request_ref and expected_request in profile["dry_contract_ref"],
            f"request mapping for {action} is not action-qualified to #/$defs/{req_def}",
        )
        check(
            expected_result in result_ref and expected_result in error_ref,
            f"result/error mapping for {action} is not action-qualified to #/$defs/{res_def}",
        )
    check(request_ref == profile["dry_contract_ref"], "dry_contract_ref and payload_schema_ref request mappings diverge")
    check(error_ref == result_ref, "error_schema_ref and result_schema_ref mappings diverge")

    # --- 2. specialized pairs reject {} replacement; common types accept it ---
    common_request = validator_for(defs, "local_action_common_request")
    common_result = validator_for(defs, "local_action_common_result")
    for action, (req_def, res_def) in SPECIALIZED_DEFS.items():
        req_key, res_key = FIXTURE_KEYS[action]
        request = pairs[req_key]
        result = pairs[res_key]
        check(
            request["action_id"] == action and result["action_id"] == action,
            f"fixture pair {req_key}/{res_key} does not carry action_id {action}",
        )
        spec_request = validator_for(defs, req_def)
        spec_result = validator_for(defs, res_def)

        check(
            error_count(spec_request, request) == 0,
            f"positive {req_key} no longer validates against {req_def}",
        )
        check(
            error_count(spec_result, result) == 0,
            f"positive {res_key} no longer validates against {res_def}",
        )

        hollow_request = copy.deepcopy(request)
        hollow_request["action_context"] = {}
        hollow_result = copy.deepcopy(result)
        hollow_result["result_detail"] = {}

        check(
            error_count(common_request, hollow_request) == 0,
            f"common request unexpectedly rejects {{}} action_context for {action}",
        )
        check(
            error_count(common_result, hollow_result) == 0,
            f"common result unexpectedly rejects {{}} result_detail for {action}",
        )
        expected_req_errors, expected_res_errors = SPECIALIZED_REJECTION_COUNTS[action]
        actual_req_errors = error_count(spec_request, hollow_request)
        actual_res_errors = error_count(spec_result, hollow_result)
        check(
            actual_req_errors == expected_req_errors,
            f"specialized {req_def} rejects {{}} action_context with {actual_req_errors} "
            f"errors, current schema yields {expected_req_errors}",
        )
        check(
            actual_res_errors == expected_res_errors,
            f"specialized {res_def} rejects {{}} result_detail with {actual_res_errors} "
            f"errors, current schema yields {expected_res_errors}",
        )

    # --- 3. three triggers, receipt refs and return attribution ---
    triggers = profile["gui_triggers"]
    check(len(triggers) == 3, f"expected exactly three gui_triggers, found {len(triggers)}")
    check(
        any("presentation switch" in t and "Git/Jujutsu" in t for t in triggers),
        f"no profile-preview trigger among {triggers}",
    )
    check(
        any("AutomationBinding selector" in t for t in triggers),
        f"no binding-select trigger among {triggers}",
    )
    check(
        any("Backup history" in t for t in triggers),
        f"no backup-history trigger among {triggers}",
    )
    for action, (_, res_def) in SPECIALIZED_DEFS.items():
        check(
            f"Plans/final_gui_interaction_contracts.schema.json#/$defs/{res_def}" in profile["receipt_refs"],
            f"receipt_refs missing the specialized result for {action}",
        )
    check(len(profile["receipt_refs"]) == 3, "receipt_refs must attribute exactly the three specialized results")
    return_route = profile["return_route"]
    check("profile-preview" in return_route, "return_route omits profile-preview return attribution")
    check("binding-picker" in return_route, "return_route omits binding-picker return attribution")
    check("Backup history target" in return_route, "return_route omits Backup history return attribution")

    permission_gate = profile["permission_gate"]
    check("Neither action" not in permission_gate, "permission_gate still says 'Neither action'")
    check(
        "three" in permission_gate,
        "permission_gate does not count the three local presentation actions",
    )
    check(
        "grants provider, installation, authentication, filesystem, browser, restore, "
        "Source Control, Backup, repository-binding, or AutomationBinding mutation authority"
        in permission_gate,
        "permission_gate denied-authority list changed; permission must not be broadened or narrowed",
    )
    for field, expected in EXPECTED_UNCHANGED_PROFILE_FIELDS.items():
        check(profile[field] == expected, f"{field} changed from its retained owner boundary")
        if base_profiles is not None:
            check(
                profile[field] == base_profiles[PROFILE_ID][field],
                f"{field} changed from the optional baseline",
            )

    # --- 4. no-mutation / no-domain-handler / no-EventRecord / no-native-proof ---
    check(profile["handler_status"] == "specified", "handler_status changed")
    check(
        "EventRecord" in profile["production_or_simulation"]
        and "no production UICommand row" in profile["production_or_simulation"]
        and "persistent-state mutation" in profile["production_or_simulation"]
        and "native Slint controller" in profile["production_or_simulation"]
        and "runtime claim" in profile["production_or_simulation"],
        "production_or_simulation no longer denies EventRecord/UICommand/persistence/native/runtime claims",
    )
    check(
        profile["event_refs"] == ["none_local_presentation_action"],
        "event_refs must stay the non-emitting local-presentation sentinel",
    )
    check(
        profile["persistence_refs"] == ["none; persistent_state_mutation=false"],
        "persistence_refs must keep persistent_state_mutation=false",
    )
    check(
        profile["requirement_refs"] == ["Plans/FinalGUISpec.md#F3-529"]
        and profile["owner_plan"] == "Plans/FinalGUISpec.md"
        and profile["plan_unit"] == "F3-529",
        "profile ownership must stay F3-529",
    )
    check(
        profile["evidence_refs"] == ["static_owner_schema_and_fixture_only"],
        "evidence_refs must not claim more than static owner schema/fixture evidence",
    )

    owner_text = OWNER_PATH.read_text(encoding="utf-8")
    f3_start = owner_text.index("### F3-529 - ")
    f3_end = owner_text.index("### F3-530 - ")
    f3_section = owner_text[f3_start:f3_end]
    for action in ACTIONS:
        check(
            f"`{action}`" in f3_section or action in f3_section,
            f"owner F3-529 section does not define {action}",
        )
    check(
        "Do not register any of these `ui.*` local actions as a domain command" in f3_section
        and "emit a domain EventRecord" in f3_section
        and "start restore" in f3_section,
        "owner F3-529 negative constraints changed; no-domain-command/EventRecord/restore boundary must hold",
    )
    check(
        "status: accepted" in f3_section,
        "owner F3-529 is not accepted; cannot map against a non-accepted owner",
    )

    for action, (req_key, res_key) in FIXTURE_KEYS.items():
        for key in (req_key, res_key):
            record = pairs[key]
            check(
                record["domain_command_registered"] is False
                and record["semantic_domain_handler"] is None
                and record["domain_event_emitted"] is False
                and record["presentation_only"] is True
                and record["persistent_state_mutation"] is False,
                f"fixture {key} loosened a false-mutation/no-domain boundary",
            )
            for flag in (
                "installation_authority_granted",
                "authentication_authority_granted",
                "filesystem_authority_granted",
                "browser_authority_granted",
                "provider_authority_granted",
            ):
                check(
                    record[flag] is False,
                    f"fixture {key} claims {flag}; no authority may be granted",
                )

    # --- 5. rows and unrelated profile preservation ---
    row_actions = [row[3] for row in owner_rows]
    check(
        sorted(row_actions) == sorted(ACTIONS),
        f"TOUCH-REPLOCAL rows must carry exactly the three actions, found {row_actions}",
    )
    check(
        [row[0] for row in owner_rows]
        == ["TOUCH-REPLOCAL-001", "TOUCH-REPLOCAL-002", "TOUCH-REPLOCAL-003"],
        "TOUCH-REPLOCAL row identities changed",
    )
    for row in owner_rows:
        check(row[4] == "partial", f"{row[0]} must stay partial; runtime remains unproved")
        check(
            "native Slint local-controller" in row[5]
            and "runtime evidence remain absent" in row[5],
            f"{row[0]} must retain the native/runtime residual",
        )
    if base_doc is not None:
        base_rows = {row[0]: row for row in base_doc["rows"]}
        for row in owner_rows:
            check(row[5] == base_rows[row[0]][5], f"{row[0]} residual_risk changed")
        changed_profiles = [
            pid
            for pid in base_profiles
            if json.dumps(base_profiles[pid], sort_keys=True)
            != json.dumps(profiles.get(pid), sort_keys=True)
        ]
        check(
            changed_profiles == [PROFILE_ID],
            f"unrelated profiles changed: {sorted(set(changed_profiles) - {PROFILE_ID})}",
        )
        check(
            len(repaired_doc["profiles"]) == len(base_doc["profiles"])
            and json.dumps(repaired_doc["rows"]) == json.dumps(base_doc["rows"]),
            "profile count or Touch rows changed",
        )
    check(
        profile["test_refs"]
        == [
            "Plans/final_gui_interaction_contract_fixtures.json#/positive_instance/contracts/7/local_action_pairs",
            "tests/test_pm_repository_local_profile_mapping.py",
        ],
        f"test_refs unexpected: {profile['test_refs']}",
    )

    if FAILURES:
        print(f"FAIL ({len(FAILURES)} checks):")
        for failure in FAILURES:
            print(f"  - {failure}")
        return 1
    baseline_statement = (
        "all other Touch rows and profiles unchanged against the supplied baseline."
        if base_doc is not None
        else "baseline comparison not run; supply PM_REPOSITORY_LOCAL_BASE_TOUCH to compare unrelated rows and profiles."
    )
    print(
        "OK: TCP-REPOSITORY-LOCAL maps the three F3-529 actions to the existing "
        "specialized request/result $defs; specialized pairs reject {} "
        "action_context/result_detail with exact counts 7/6, 6/4, 8/7 while common "
        "types accept; three triggers/receipt/return paths present; permission gate "
        "corrected to three actions with unchanged denied authority; partial, "
        "non-mutating, non-emitting, non-persistent, native-unproved boundaries hold; "
        + baseline_statement
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
