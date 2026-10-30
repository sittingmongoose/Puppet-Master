#!/usr/bin/env python3
"""Q22 static theme/migration conformance. No native or GUI execution claim."""
from copy import deepcopy
from pathlib import Path
import json
import runpy
import sys

import jsonschema

ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"


def read(name):
    return json.loads((PLANS / name).read_text())


def migrate_settings(values, os_mode):
    """Contract oracle only; the product load migration belongs to Settings."""
    result = deepcopy(values)
    old = result.pop("general.visual.nier-mode", None)
    if old is True:
        mode = result["general.visual.theme-mode"]
        result["general.visual.theme"] = "NieR " + (os_mode.title() if mode == "Auto" else mode)
    return result


def transition(source, target, reboot):
    entering = target.startswith("nier-") and not source.startswith("nier-")
    return "reboot" if entering and reboot else "standard_cover"


def check():
    failures = []
    counts = {}

    def require(ok, message):
        if not ok:
            failures.append(message)

    fixtures = read("pm7_canon.fixtures.json")
    contract = fixtures["nier_theme_contract"]
    families = ["basic", "friendly", "glass", "retro", "nier"]
    variants = [family + "-" + mode for family in families for mode in ("dark", "light")]
    labels = [(family.title() if family != "nier" else "NieR") + " " + mode
              for family in families for mode in ("Dark", "Light")]
    require(contract["decision_id"] == "Q22" and contract["family_order"] == families,
            "Q22 family authority/order differs")
    require(contract["variant_ids"] == variants, "Q22 variant identity/order differs")
    inventory_document = read("settings_inventory.json")
    inventory = inventory_document["settings"]
    settings = {row["id"]: row for row in inventory}
    require(len(inventory) == len(settings) == 1010, "Q22 inventory is not 1010 unique rows")
    require(settings["general.visual.theme"]["options"] == labels, "Theme is not the ten ordered variants")
    require(settings["general.visual.theme"]["default"] == "Basic Dark", "Q22 changed the factory seed")
    require("general.visual.nier-mode" not in settings, "Retired override remains an active row")
    require(inventory_document.get("retired_input_ids") == ["general.visual.nier-mode"],
            "Q22 retired migration input catalog differs")
    require(not set(inventory_document.get("retired_input_ids", [])) & set(settings),
            "Retired migration metadata revives an active row")
    require(all(key in settings for key in contract["retained_adjust_setting_ids"]), "NieR Adjust row was removed")
    require(len(settings["general.visual.nier-parts"]["options"]) == 29, "NieR Adjust parts changed")
    require(len(settings["general.visual.nier-background"]["options"]) == 8, "NieR backgrounds changed")
    require(contract["adjust_visible_theme_values"] == ["NieR Dark", "NieR Light"], "NieR Adjust applicability drifted")
    require(all(key in settings for key in contract["basic_only_setting_ids"]), "Basic-only applicability names an unknown row")

    census = read("pm7_control_bindings.json")["bindings"]
    bindings = {row["control_id"]: row for row in census}
    for cid in contract["retired_control_ids"]:
        row = bindings[cid]
        require(row["disposition"] == "non_dispatch" and not any(row[key] for key in
                ("action_ids", "setting_ids", "production_entries")), cid + ": retired checkbox dispatches")
    for row in census:
        require("general.visual.nier-mode" not in row["setting_ids"], row["control_id"] + ": retired writer")
    pair = ["cmd.settings.transaction.preview", "cmd.settings.transaction.apply"]
    for cid in ("shell.theme.family", "tour.theme.family", "nier.editor.turn_on"):
        row = bindings[cid]
        require(row["action_ids"] == pair and row["setting_ids"] ==
                ["general.visual.theme", "general.visual.theme-mode"], cid + ": family bypasses existing pair")
    require(bindings["onboarding.theme.family"]["action_ids"] == ["ui.onboarding.choose_look"]
            and not bindings["onboarding.theme.family"]["production_entries"], "Onboarding family bypasses local owner")
    require([bindings["nier.editor." + action]["action_ids"][0] for action in ("open", "close", "replay")]
            == contract["retained_local_action_ids"], "NieR local editor actions drifted")

    # Reuse the published offline resolver, patch semantics and owner predicates.
    # Run only the three changed contract packs, never the aggregate gate suite.
    verifier = runpy.run_path(str(ROOT / "scripts/pm-new-contracts-verify.py"))
    registry = verifier["offline_schema_registry"]()
    packs = [
        ("product_onboarding_contracts.schema.json", "product_onboarding_contract_fixtures.json"),
        ("settings_system_contracts.schema.json", "settings_system_contract_fixtures.json"),
        ("final_gui_interaction_contracts.schema.json", "final_gui_interaction_contract_fixtures.json"),
    ]
    for schema_name, fixture_name in packs:
        schema = read(schema_name)
        pack = read(fixture_name)
        jsonschema.Draft202012Validator.check_schema(schema)
        positives = pack.get("valid", pack.get("valid_cases", []))
        if "positive_instance" in pack:
            positives = [{"name": "root", "value": pack["positive_instance"]}]
        by_name = {case.get("name", case.get("case_id")): case.get("value", case.get("record"))
                   for case in positives}
        valid_count = negative_count = 0
        for case in positives:
            name = case.get("name", case.get("case_id"))
            value = by_name[name]
            definition, selected = verifier["select_definition"](schema, case, value, require_valid=True)
            errors = list(verifier["validator_for"](schema, selected, registry).iter_errors(value))
            semantic = [] if errors else verifier["contract_semantic_failures"](
                "Plans/" + schema_name, definition, value, context=case.get("context"))
            require(not errors and not semantic, fixture_name + ": positive " + str(name) + ": " +
                    (errors[0].message if errors else str(semantic)))
            if definition in verifier["root_definition_names"](schema):
                require(verifier["validator_for"](schema, schema, registry).is_valid(value),
                        fixture_name + ": aggregate rejects " + str(name))
            valid_count += 1
        for case in pack.get("invalid", pack.get("negative_cases", [])):
            name = case.get("name", case.get("case_id"))
            value = verifier["materialize_invalid"](case, by_name)
            definition, selected = verifier["select_definition"](schema, case, value, require_valid=False)
            valid = verifier["validator_for"](schema, selected, registry).is_valid(value)
            semantic = verifier["contract_semantic_failures"](
                "Plans/" + schema_name, definition, value, context=case.get("context")) if valid else []
            require(not valid or bool(semantic), fixture_name + ": negative accepted " + str(name))
            negative_count += 1
        for case in pack.get("negative_mutations", []):
            value = verifier["pointer_set"](pack["positive_instance"], case["json_pointer"], case.get("replacement"))
            require(not verifier["validator_for"](schema, schema, registry).is_valid(value),
                    fixture_name + ": negative accepted " + case["case_id"])
            negative_count += 1
        counts[fixture_name] = {"positive": valid_count, "negative": negative_count}

    onboarding = read("product_onboarding_contracts.schema.json")
    look = onboarding["$defs"]["onboarding_look_choice"]
    require("nier_mode" not in look["properties"] and "nier_mode" not in look["required"], "Closed look retains boolean")
    require("preview_nier" not in onboarding["$defs"]["onboarding_local_action_context"]["properties"]["intent"]["enum"],
            "Retired onboarding preview intent remains")
    for case in fixtures["nier_theme_migration_cases"]:
        result = migrate_settings(case["before"], case["os_mode"])
        require(result == case["expected"], "Migration differs: " + case["name"])
        require(migrate_settings(result, case["os_mode"]) == result, "Migration is not idempotent: " + case["name"])
    look_validator = verifier["validator_for"](onboarding, {"$ref": "#/$defs/onboarding_look_choice"}, registry)
    for case in fixtures["nier_legacy_session_look_cases"]:
        result = deepcopy(case["before"])
        if result.pop("nier_mode", None) is True:
            result["theme_family"] = "nier"
        require(result == case["expected"] and look_validator.is_valid(result),
                "Legacy session look conversion differs: " + case["name"])
    for case in fixtures["nier_theme_transition_cases"]:
        require(transition(case["from"], case["to"], case["reboot"]) == case["expected"],
                "Transition differs: " + case["name"])
    current_setting = read("settings_system_contracts.schema.json")
    current_validator = verifier["validator_for"](current_setting, {"$ref": "#/$defs/setting_id"}, registry)
    require(not current_validator.is_valid("general.visual.nier-mode"), "Current setting-ID schema admits retired key")
    require(current_validator.is_valid("general.visual.theme"), "Current setting-ID schema rejects family selection")
    counts.update(settings=len(settings), bindings=len(census), migration_cases=len(fixtures["nier_theme_migration_cases"]),
                  legacy_session_cases=len(fixtures["nier_legacy_session_look_cases"]),
                  transition_cases=len(fixtures["nier_theme_transition_cases"]))
    return {"check": "pm7-nier-theme", "decision_id": "Q22", "status": "fail" if failures else "pass",
            "claim_boundary": "static_contract_and_migration_oracle_only_no_native_or_rendering_proof",
            "counts": counts, "failures": failures}


if __name__ == "__main__":
    report = check()
    print(json.dumps(report, indent=2))
    sys.exit(bool(report["failures"]))
