#!/usr/bin/env python3
"""Read-only static checks for the PM7 canon companions; no native certification."""
from pathlib import Path
import json
import sys

import jsonschema

ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"


def read(name):
    return json.loads((PLANS / name).read_text())


def check():
    failures = []

    def require(ok, message):
        if not ok:
            failures.append(message)

    for instance, schema in [
        ("settings_inventory.json", "settings_inventory.schema.json"),
        ("Wiring_Matrix.production.json", "Wiring_Matrix.schema.json"),
        ("pm7_control_bindings.json", "pm7_control_bindings.schema.json"),
    ]:
        validator = jsonschema.Draft202012Validator(read(schema))
        for error in validator.iter_errors(read(instance)):
            failures.append(f"{instance} {list(error.path)}: {error.message}")

    inventory = read("settings_inventory.json")["settings"]
    settings = {row["id"]: row for row in inventory}
    require(len(settings) == len(inventory), "Duplicate Settings id")
    wiring = read("Wiring_Matrix.production.json")["entries"]
    census = read("pm7_control_bindings.json")["bindings"]
    require(len({row['control_id'] for row in census}) == len(census), "Duplicate control binding")
    command_text = (PLANS / "UI_Command_Catalog.md").read_text()
    for row in census:
        label = row["control_id"]
        for setting in row["setting_ids"]:
            require(setting in settings, f"{label}: missing setting {setting}")
        for entry in row["production_entries"]:
            require(entry in wiring, f"{label}: missing production entry {entry}")
        for action in row["action_ids"]:
            if row["disposition"] == "command":
                require(action in command_text, f"{label}: uncataloged {action}")
                require(any(wiring.get(entry, {}).get("ui_command_id") == action for entry in row["production_entries"]), f"{label}: no production route for {action}")
            else:
                require(action.startswith("ui."), f"{label}: local action is not ui.*")

    schema = read("editor_appearance.schema.json")
    jsonschema.Draft202012Validator.check_schema(schema)
    fields = schema["$defs"]["fields"]["properties"]
    for field in fields:
        require(field in settings, f"Unknown editor field {field}")
        for scope in ["this", "all"]:
            require(any(row["control_id"] == f"editor.{scope}.{field.split('.')[-1]}" and field in row["setting_ids"] for row in census), f"Missing {scope} editor binding: {field}")
    fixtures = read("pm7_canon.fixtures.json")["editor_appearance_cases"]
    for case in fixtures:
        scoped = {**schema, "$ref": "#/$defs/" + case["definition"]}
        valid = jsonschema.Draft202012Validator(scoped).is_valid(case["value"])
        require(valid == case["valid"], f"Fixture result differs: {case['name']}")
    require(settings['code.terminal.min-contrast']['options'] == ['4.5:1', '7:1'], 'Terminal offers a contrast floor below the settled-text requirement')

    wallpapers = read("wallpaper_catalog.json")["wallpapers"]
    require(len({row['id'] for row in wallpapers}) == len(wallpapers), "Duplicate wallpaper id")
    for wallpaper in wallpapers:
        require(set(wallpaper['assets']) == {'light', 'dark'}, f"Missing wallpaper mode: {wallpaper['id']}")
        for path in wallpaper["assets"].values():
            require((ROOT / path).is_file(), f"Missing wallpaper asset: {path}")
    glyphs = read("glyph_catalog.json")['status_marks']
    require(len({row['key'] for row in glyphs}) == 22, 'Shared status vocabulary differs')
    require(all(row['meaning'] and row['tone'] for row in glyphs), 'Missing glyph semantics')
    require(next(row for row in glyphs if row['key'] == 'warning')['glyph_id'] != next(row for row in glyphs if row['key'] == 'failed')['glyph_id'], 'Failed and warning share a glyph')
    result = {"status": "fail" if failures else "pass", "scope": "Static canon companions; native handler/rendering evidence remains required", "control_bindings": len(census), "editor_fields": len(fields), "schema_fixtures": len(fixtures), "failures": failures}
    print(json.dumps(result, indent=2))
    return bool(failures)


if __name__ == "__main__":
    sys.exit(check())
