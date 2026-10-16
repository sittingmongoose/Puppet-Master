#!/usr/bin/env python3
"""Read-only static checks for the PM7 canon companions; no native certification."""
from pathlib import Path
from copy import deepcopy
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
        ("appearance_quick_sets.json", "appearance_quick_sets.schema.json"),
        ("terminal_background_catalog.json", "terminal_background_catalog.schema.json"),
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
    require(settings['code.terminal.min-contrast']['options'] == ['Off', '3:1', '4.5:1', '7:1'], 'Terminal program-output choices differ from the approved contract')
    require(settings['code.terminal.min-contrast']['default'] == '4.5:1', 'Terminal program-output contrast default changed')
    require(settings['code.terminal.padding']['default'] == 0, 'Terminal padding is not zero by default')
    require('Superseded by SSYS-010' in settings['general.visual.theme-preview']['desc'] and 'default' not in settings['general.visual.theme-preview'], 'The visible theme-preview preference is not retired')

    require('catalog.theme_preview' not in wiring, 'Retired visible theme-preview producer remains in production wiring')
    require('cmd.theme.preview' in read('Wiring_Matrix.production.exclusions.json')['excluded_tokens'], 'Retired theme-preview lineage is not explicitly excluded')

    quick_sets = read('appearance_quick_sets.json')['kinds']
    for kind, group in quick_sets.items():
        require(all(key in settings for key in group['reset_ids']), f'{kind}: reset names an unknown setting')
        require(all(set(ids) <= set(group['reset_ids']) for ids in group['reset_groups'].values()), f'{kind}: group reset escapes its kind')
        for name, preset in group['quick_sets'].items():
            values = preset.get('values', {})
            require(set(values) <= set(group['reset_ids']), f'{kind}.{name}: patch escapes its kind')
            for key, value in values.items():
                row = settings.get(key, {})
                if row.get('type') == 'select':
                    require(value in row.get('options', []), f'{kind}.{name}: invalid value for {key}')
                elif row.get('type') == 'toggle':
                    require(isinstance(value, bool), f'{kind}.{name}: non-boolean toggle {key}')
                elif row.get('type') == 'number':
                    require(isinstance(value, (int, float)) and not isinstance(value, bool), f'{kind}.{name}: non-number {key}')
            if kind == 'editor' and values:
                require(jsonschema.Draft202012Validator({**schema, '$ref': '#/$defs/fields'}).is_valid(values), f'{kind}.{name}: patch violates the editor field schema')
    for row in census:
        reference = row.get('quick_set_ref')
        group_reference = row.get('reset_group_ref')
        require(bool(group_reference) == ('.reset_group.' in row['control_id']), f"{row['control_id']}: missing or misplaced group-reset reference")
        if group_reference:
            group_kind, group_name = group_reference.split('.', 1)
            require(row['setting_ids'] == quick_sets[group_kind]['reset_groups'][group_name], f"{row['control_id']}: reset-group ids differ")
        composite = '.quickset.' in row['control_id'] or row['control_id'] in {f'{kind}.{scope}.reset' for kind in quick_sets for scope in ['this', 'all']}
        require(bool(reference) == composite, f"{row['control_id']}: missing or misplaced quick-set reference")
        if not reference:
            continue
        kind, name = reference.split('.', 1)
        preset = quick_sets[kind]['quick_sets'][name]
        affected = list(preset['values']) if preset['operation'] == 'set' else quick_sets[kind]['reset_ids']
        require(row['setting_ids'] == affected, f"{row['control_id']}: affected ids differ from the exact patch")
        expected_ref = row['control_id'].split('.')[0] + '.' + (row['control_id'].split('.')[-1] if '.quickset.' in row['control_id'] else 'look_own')
        require(reference == expected_ref, f"{row['control_id']}: references a different quick set")

    # These fixtures pin the intended source patches, not merely their schema shape.
    # A broad reset or one extra field fails even if every id and value is individually valid.
    quick_cases = read('pm7_canon.fixtures.json')['quick_set_cases']
    for case in quick_cases:
        kind, name = case['quick_set_ref'].split('.', 1)
        preset = quick_sets[kind]['quick_sets'][name]
        require(preset['operation'] == case['expected_operation'], f"{case['name']}: set/reset confused")
        before = deepcopy(case['unchanged_values'])
        if preset['operation'] == 'set':
            require(preset['values'] == case['expected_values'], f"{case['name']}: exact source patch differs")
            after = {**before, **preset['values']}
        else:
            before.update({key: 'explicit test override' for key in case['sample_owned_ids']})
            if case['scope'] == 'this':
                after = {key: value for key, value in before.items() if key not in quick_sets[kind]['reset_ids']}
                require(all(key not in after for key in case['sample_owned_ids']), f"{case['name']}: tab reset did not clear overrides")
            else:
                after = {**before, **{key: settings[key].get('default') for key in quick_sets[kind]['reset_ids']}}
                require(all(after[key] == settings[key].get('default') for key in case['sample_owned_ids']), f"{case['name']}: Project reset did not use registry defaults")
        require(all(after.get(key) == value for key, value in case['unchanged_values'].items()), f"{case['name']}: unrelated token/behavior/Settings value changed")

    group_cases = read('pm7_canon.fixtures.json')['group_reset_cases']
    for case in group_cases:
        kind, group = case['reset_group_ref'].split('.', 1)
        ids = quick_sets[kind]['reset_groups'][group]
        before = {**case['cleared_values'], **case['unchanged_values']}
        after = {key: value for key, value in before.items() if key not in ids}
        require(after == case['unchanged_values'], f'{kind}.{group}: group reset changed unrelated values or retained intended overrides')

    wallpaper_catalog = read("wallpaper_catalog.json")
    wallpapers = wallpaper_catalog["wallpapers"]
    require(len({row['id'] for row in wallpapers}) == len(wallpapers), "Duplicate wallpaper id")
    require(not ({row['id'] for row in wallpapers} & set(wallpaper_catalog['withdrawn_ids'])), 'Withdrawn NieR print remains selectable')
    require(not wallpaper_catalog['pending_families'], 'Published wallpaper family is still held')
    require(len(wallpapers) == 29, 'Published wallpaper census differs')
    nier = [row for row in wallpapers if row['family'] == 'nier']
    require([row['id'] for row in nier] == ['city', 'bunker', 'desert', 'forest', 'park', 'flooded'], 'Approved NieR scene identities differ')
    require(all(row['default_for'] is None for row in nier), 'A gallery print replaced the NieR look default')
    wallpaper_cases = read('pm7_canon.fixtures.json')['wallpaper_order_cases']
    for case in wallpaper_cases:
        state = {'wallpaper': 'look', 'nier_background': 'city'}
        for change in case['actions']:
            state.update(change)
            if 'nier_background' in change:
                state['wallpaper'] = 'look'
        require(state == case['expected'], 'Wallpaper ordering fixture does not reflect the most recent change')
    for wallpaper in wallpapers:
        require(set(wallpaper['assets']) == {'light', 'dark'}, f"Missing wallpaper mode: {wallpaper['id']}")
        for path in wallpaper["assets"].values():
            require((ROOT / path).is_file(), f"Missing wallpaper asset: {path}")

    backgrounds = read('terminal_background_catalog.json')
    designs = backgrounds['designs']
    require(len(designs) == len({row['id'] for row in designs}) == 64, 'Terminal design census or identity differs')
    require(all(row['category'] in backgrounds['categories'] and row['available_in_all_looks'] for row in designs), 'A terminal design is unavailable across looks or has an unknown category')
    for field, extra in [('code.terminal.background-gradient', []), ('code.terminal.background-image', ['Custom'])]:
        require(settings[field]['options'] == [row['settings_value'] for row in designs if row['field'] == field] + extra, f'{field}: choices differ from the design catalog')
    design_ids = {row['id'] for row in designs}
    require(set(backgrounds['defaults'].values()) <= design_ids, 'A terminal catalog default does not exist')
    require(all(target in design_ids for mapping in backgrounds['compatibility'].values() for target in mapping.values()), 'A terminal compatibility mapping has no target')
    require('default' not in settings['general.visual.glass-background-mode'] and 'Superseded' in settings['general.visual.glass-background-mode']['desc'], 'Legacy Glass background selector is not retired')

    preset_schema = read('terminal_appearance_presets.schema.json')
    jsonschema.Draft202012Validator.check_schema(preset_schema)
    preset_validator = jsonschema.Draft202012Validator(preset_schema, format_checker=jsonschema.FormatChecker())
    terminal_ids = quick_sets['terminal']['reset_ids']
    require(set(preset_schema['$defs']['fields']['properties']) == set(terminal_ids), 'Preset fields and terminal appearance ownership differ')
    require(not read('pm7_control_bindings.json')['held_controls'], 'Resolved PM7 controls remain held')
    for field in terminal_ids:
        for scope in ['this', 'all']:
            require(any(row['control_id'] == f"terminal.{scope}.{field.split('.')[-1]}" and row['setting_ids'] == [field] for row in census), f'Missing {scope} terminal binding: {field}')
    for scope in ['this', 'all']:
        binding = next(row for row in census if row['control_id'] == f'terminal.{scope}.preset.apply')
        require(binding['setting_ids'] == terminal_ids, f'{scope}: preset apply is not a complete appearance replacement')
        expected_actions = ['cmd.terminal.appearance.set'] if scope == 'this' else ['cmd.settings.transaction.preview', 'cmd.settings.transaction.apply']
        require(binding['action_ids'] == expected_actions, f'{scope}: preset apply bypasses the existing writer')
    local_ids = {f'terminal.preset.{action}' for action in ['save', 'rename', 'delete', 'undo']}
    local_ids.update(row['control_id'] for row in census if row['control_id'].startswith('panel.picker.back.'))
    require(len(local_ids) == 13, 'Preset/picker local control census differs')
    for control_id in local_ids:
        row = next(row for row in census if row['control_id'] == control_id)
        require(row['disposition'] == 'local' and not row['production_entries'] and not row['setting_ids'], f'{control_id}: local action acquired a command or Settings write')
    for control_id, action, owner, schema in [
        ('notifications.setup.continue', 'ui.onboarding.start', 'PWIZ-021', 'pm.product_onboarding.action_request.v2'),
        ('notifications.tour_resume.continue', 'ui.guided_tour.resume', 'PWIZ-023', 'pm.guided_tour.action_request.v3'),
    ]:
        bell_continue = next(row for row in census if row['control_id'] == control_id)
        require(bell_continue['action_ids'] == [action]
                and bell_continue['owner_ref'] == f'Plans/Planning_Wizard.md#{owner}'
                and schema in bell_continue['payload']
                and bell_continue['disposition'] == 'local'
                and not bell_continue['production_entries'] and not bell_continue['setting_ids'],
                f'{control_id}: bell Continue lost its original prompt owner/action/schema')

    preset_cases = read('pm7_canon.fixtures.json')['terminal_preset_cases']
    for case in preset_cases:
        value = case['value']
        valid = preset_validator.is_valid(value)
        if valid:
            records = value['presets']
            names = [record['name'] for record in records]
            valid = (len({record['id'] for record in records}) == len(records)
                     and len({name.lower() for name in names}) == len(names)
                     and all(name == ' '.join(name.split()) for name in names))
        require(valid == case['valid'], f"Preset fixture result differs: {case['name']}")
    preset_apply_cases = read('pm7_canon.fixtures.json')['terminal_preset_apply_cases']
    for case in preset_apply_cases:
        require(set(case['saved_fields']) <= set(terminal_ids), f"{case['name']}: saved patch escapes appearance")
        patch = {key: case['saved_fields'].get(key, settings[key].get('default') if case['scope'] == 'all' else None) for key in terminal_ids}
        after = {**case['before'], **patch}
        if case['scope'] == 'this':
            after = {key: value for key, value in after.items() if value is not None}
            require(case['expected_cleared'] not in after, f"{case['name']}: stale tab override survived")
        else:
            key = case['expected_default']
            require(after[key] == settings[key].get('default'), f"{case['name']}: omitted Project field did not use its default")
        require(all(after.get(key) == value for key, value in case['saved_fields'].items()), f"{case['name']}: saved choice lost")
        require(all(after.get(key) == value for key, value in case['unchanged'].items()), f"{case['name']}: unrelated setting changed")

    glyphs = read("glyph_catalog.json")['status_marks']
    require(len({row['key'] for row in glyphs}) == 22, 'Shared status vocabulary differs')
    require(all(row['meaning'] and row['tone'] for row in glyphs), 'Missing glyph semantics')
    require(next(row for row in glyphs if row['key'] == 'warning')['glyph_id'] != next(row for row in glyphs if row['key'] == 'failed')['glyph_id'], 'Failed and warning share a glyph')
    result = {"status": "fail" if failures else "pass", "scope": "Static canon companions; native handler/rendering evidence remains required", "control_bindings": len(census), "editor_fields": len(fields), "schema_fixtures": len(fixtures), "quick_set_fixtures": len(quick_cases), "group_reset_fixtures": len(group_cases), "wallpaper_order_fixtures": len(wallpaper_cases), "wallpapers": len(wallpapers), "terminal_designs": len(designs), "terminal_preset_fixtures": len(preset_cases), "terminal_preset_apply_fixtures": len(preset_apply_cases), "failures": failures}
    print(json.dumps(result, indent=2))
    return bool(failures)


if __name__ == "__main__":
    sys.exit(check())
