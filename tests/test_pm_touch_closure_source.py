"""The action census must inspect emitted source, never retired controllers."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import sys
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


validator = load_module("touch_closure", ROOT / "scripts/pm-touch-closure-verify.py")
SOURCE = ROOT / "Concepts/pm7-tools/guided_tour_source.py"


class EffectiveGuidedTourSourceTests(unittest.TestCase):
    def test_current_tour_inventory_preserves_domain_owners_and_open_status(self) -> None:
        expected, failures = validator.expected_inventory()
        self.assertFalse([item for item in failures if "Guided Tour" in item], failures)
        registry = json.loads((ROOT / "Plans/touch_closure.json").read_text(encoding="utf-8"))
        rows = {row[3]: row for row in registry["rows"]}
        profiles = {profile["profile_id"]: profile for profile in registry["profiles"]}
        targets = {
            "ui.guided_tour.show_me": ("TCP-TOUR", "ui_action", "Plans/Planning_Wizard.md"),
            "cmd.persona.select": ("TCP-TOUR-PERSONA", "command", "Plans/Personas.md"),
            "cmd.chat.send": ("TCP-TOUR-CHAT", "command", "Plans/assistant-chat-design.md"),
            "cmd.chat.eli5.set": ("TCP-TOUR-CHAT", "command", "Plans/assistant-chat-design.md"),
        }
        for action, (profile, kind, owner) in targets.items():
            with self.subTest(action=action):
                self.assertEqual(expected[action], (profile, kind, "partial"))
                self.assertEqual(rows[action][1:5], [profile, kind, action, "partial"])
                self.assertEqual(profiles[profile]["owner_plan"], owner)
                self.assertEqual(profiles[profile]["handler_status"], "specified")
                self.assertEqual(profiles[profile]["wiring_status"], "concept_simulated")

    def test_extra_tour_action_cannot_expand_the_closed_inventory(self) -> None:
        actual = validator.schema_enum_actions

        def changed(path, pointer):
            result = actual(path, pointer)
            return result | {"ui.guided_tour.private_send"} if "guided_tour" in path else result

        with mock.patch.object(validator, "schema_enum_actions", side_effect=changed):
            with self.assertRaisesRegex(ValueError, "eleven-action inventory drift"):
                validator.expected_inventory()

    def test_missing_reused_domain_catalog_command_fails_closed(self) -> None:
        actual = validator.read

        def changed(path):
            value = actual(path)
            return value.replace("cmd.chat.eli5.set", "retired.eli5") if path == "Plans/UI_Command_Catalog.md" else value

        with mock.patch.object(validator, "read", side_effect=changed):
            with self.assertRaisesRegex(ValueError, "domain routes absent from canonical catalog"):
                validator.expected_inventory()

    def test_current_composition_matches_emitted_bands_exactly(self) -> None:
        actual = validator.effective_guided_tour_bands(SOURCE.read_text(encoding="utf-8"))
        with mock.patch.object(sys, "path", [str(SOURCE.parent), *sys.path]):
            authored = load_module("guided_tour_authored", SOURCE)
        self.assertEqual(actual, (authored.GUIDED_TOUR_MARKUP, authored.GUIDED_TOUR_STYLE, authored.GUIDED_TOUR_SCRIPT))
        self.assertIn("ui.guided_tour.show_me", actual[2])
        self.assertNotIn("cmd.panel.redock", actual[2])
        self.assertNotIn("cmd.widget.remove", actual[2])
        self.assertIn("createGuidedPlanningPractice", actual[2])
        self.assertIn("cmd.chat.send", actual[2])
        self.assertNotIn("ui.assistant_chat.", actual[2])

    def test_only_reviewed_literal_helper_is_read_without_execution(self) -> None:
        source = '''
from guided_tour_practice_source import PLANNING_PRACTICE_SCRIPT
GUIDED_TOUR_MARKUP = "markup"
GUIDED_TOUR_STYLE = "style"
GUIDED_TOUR_SCRIPT = PLANNING_PRACTICE_SCRIPT
'''
        with mock.patch.object(validator, "read", return_value='raise RuntimeError("not executed")\nPLANNING_PRACTICE_SCRIPT = "literal"'):
            self.assertEqual(validator.effective_guided_tour_bands(source), ("markup", "style", "literal"))
        for helper in (
            'PLANNING_PRACTICE_SCRIPT = str("computed")',
            'PLANNING_PRACTICE_SCRIPT = "first"\nPLANNING_PRACTICE_SCRIPT = "second"',
            'PLANNING_PRACTICE_SCRIPT = "first"\nif True:\n    PLANNING_PRACTICE_SCRIPT = "hidden"',
        ):
            with self.subTest(helper=helper), mock.patch.object(validator, "read", return_value=helper):
                with self.assertRaises(ValueError):
                    validator.effective_guided_tour_bands(source)
        for changed in (source.replace("guided_tour_practice_source", "unreviewed_helper"),
                        source.replace("import PLANNING_PRACTICE_SCRIPT", "import PLANNING_PRACTICE_SCRIPT as other")):
            with self.assertRaises(ValueError):
                validator.effective_guided_tour_bands(changed)

    def test_composed_fixture_retains_only_bounded_live_fragment(self) -> None:
        source = '''
GUIDED_TOUR_MARKUP = "markup"
GUIDED_TOUR_STYLE = "style"
legacy = "retired<start>live<end>retired"
begin = legacy.index("<start>")
end = legacy.index("<end>")
fragment = legacy[begin:end]
GUIDED_TOUR_SCRIPT = "before:" + fragment + ":after"
'''
        self.assertEqual(validator.effective_guided_tour_bands(source), ("markup", "style", "before:<start>live:after"))
        for changed in (
            source.replace('index("<end>")', 'index("missing")'),
            source.replace('"before:" + fragment + ":after"', '"".join([fragment])'),
            source + '\nGUIDED_TOUR_SCRIPT = "duplicate"\n',
            source.replace("legacy[begin:end]", "legacy[end:begin:-1]"),
            source.replace("legacy[begin:end]", "legacy[begin:end:2]"),
            source.replace("legacy[begin:end]", "legacy[:]"),
            source.replace("legacy[begin:end]", "legacy[begin:999999]"),
            source.replace('"before:" + fragment + ":after"', '"before:" + 7'),
            source.replace('"before:" + fragment + ":after"', 'GUIDED_TOUR_SCRIPT'),
            source + '\nif True:\n    GUIDED_TOUR_SCRIPT = "hidden overwrite"\n',
            source + '\nGUIDED_TOUR_SCRIPT += "hidden append"\n',
            source + '\nfragment, extra = "different", "other"\n',
            source + '\ndel GUIDED_TOUR_SCRIPT\n',
        ):
            with self.subTest(source=changed):
                with self.assertRaises(ValueError):
                    validator.effective_guided_tour_bands(changed)

    def test_source_resolution_does_not_execute_module_code(self) -> None:
        source = '''
raise RuntimeError("must not execute")
GUIDED_TOUR_MARKUP = "markup"
GUIDED_TOUR_STYLE = "style"
GUIDED_TOUR_SCRIPT = "script"
'''
        self.assertEqual(validator.effective_guided_tour_bands(source), ("markup", "style", "script"))


class WholeCommandAccountingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.inspection = load_module("whole_command_inspection", ROOT / "scripts/pm-assistant-contract-check.py")

    def test_every_wiring_row_is_accounted_without_expanding_touch(self):
        rows = {
            "surface.one": {"ui_command_id": "cmd.alpha.one", "handler_location": "handlers::alpha::one"},
            "surface.two": {"ui_command_id": "cmd.alpha.one", "handler_location": "handlers::alpha::one"},
            "surface.three": {"ui_command_id": "cmd.beta.two", "handler_location": "handlers::beta::two"},
        }
        catalogue = '| `cmd.alpha.one` | one |\nLegacy `cmd.beta.two` is not a primary registration.\n'
        touch = [{"action_id": "cmd.alpha.one", "touch_id": "T-ONE"}]
        report = self.inspection.whole_wiring_inventory(ROOT, catalogue, rows, touch)
        self.assertEqual(report["command_count"], 2)
        self.assertEqual(report["wiring_row_count"], 3)
        self.assertEqual(report["commands_in_packet_touch"], 1)
        self.assertEqual(report["commands_without_packet_touch"], 1)
        self.assertEqual(report["rows_with_request_and_result_pointers"], 0)
        self.assertEqual(sum(len(c["wiring_rows"]) for c in report["commands"]), 3)
        self.assertEqual(report["commands"][1]["catalogue_occurrences"][0]["kind"], "prose_or_planunit")
        self.assertEqual(touch, [{"action_id": "cmd.alpha.one", "touch_id": "T-ONE"}])
        self.assertTrue(all(c["semantic_review_status"] == "not_run" and not c["native_runtime_proven"] for c in report["commands"]))

    def test_duplicate_handler_targets_and_missing_owner_are_real_gaps(self):
        rows = {
            "a": {"ui_command_id": "cmd.alpha.one", "handler_location": "handlers::alpha::one"},
            "b": {"ui_command_id": "cmd.alpha.one", "handler_location": "handlers::other::one",
                  "evidence_required": "Plans/nonexistent_synthetic_test_owner_20260910.md"},
        }
        report = self.inspection.whole_wiring_inventory(ROOT, '`cmd.alpha.one`', rows, [])
        self.assertEqual({e["code"] for e in report["errors"]}, {"whole_command_handler_conflict", "whole_wiring_missing_owner_reference"})

    def test_catalogue_alias_target_column_does_not_claim_primary_registration(self):
        rows = {"a": {"ui_command_id": "cmd.alpha.one", "handler_location": "handlers::alpha::one"}}
        report = self.inspection.whole_wiring_inventory(ROOT, '| `cmd.old.one` | `cmd.alpha.one` | alias target |', rows, [])
        self.assertEqual(report["commands"][0]["catalogue_occurrences"], [{"line": 1, "kind": "other_table_column"}])
        self.assertEqual(report["errors"], [])

    def test_machine_pointer_is_checked_instead_of_trusting_named_prose(self):
        rows = {"a": {"ui_command_id": "cmd.alpha.one", "handler_location": "handlers::alpha::one",
                      "request_schema_ref": "Plans/shared_runtime_command_contracts.schema.json#/$defs/missing_synthetic_20260910"}}
        report = self.inspection.whole_wiring_inventory(ROOT, '`cmd.alpha.one`', rows, [])
        self.assertEqual(report["errors"][0]["code"], "whole_wiring_invalid_contract_reference")
        self.assertEqual(report["commands"][0]["wiring_rows"][0]["missing_machine_contract_fields"], ["result_schema_ref"])


if __name__ == "__main__":
    unittest.main()
