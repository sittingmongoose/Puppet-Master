"""The action census must inspect emitted source, never retired controllers."""

from __future__ import annotations

import importlib.util
import argparse
import copy
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

    def test_exact_and_wildcard_exclusions_cannot_reappear_as_peer_rows(self):
        rows = {"a": {"ui_command_id": "cmd.legacy.one", "handler_location": "handlers::legacy::one"}}
        for excluded in (["cmd.legacy.one"], ["cmd.legacy.*"]):
            report = self.inspection.whole_wiring_inventory(ROOT, '`cmd.legacy.one`', rows, [], excluded)
            self.assertEqual(report["errors"][0]["code"], "whole_wiring_excluded_command_has_peer_row")
        self.assertFalse(self.inspection.wiring_command_excluded("cmd.legacy.one", ["cmd.legacy"]))

    def test_standard_gate_rejects_peer_alias_and_competing_revert_handler(self):
        gate = load_module("whole_wiring_standard_gate", ROOT / "scripts/pm-plans-verify.py")
        matrix_path = ROOT / "Plans/Wiring_Matrix.production.json"
        original_load = gate.load_json
        baseline = original_load(matrix_path)
        mutations = [("cmd.actions.pin", "excluded_command_has_peer_production_wiring"),
                     ("cmd.chat.add_file_reference", "excluded_command_has_peer_production_wiring"),
                     ("cmd.chat.revert", "command_has_no_sole_handler_identity")]
        for cid, expected_error in mutations:
            altered = copy.deepcopy(baseline)
            row = copy.deepcopy(altered["entries"]["catalog.chat_revert"])
            row.update(ui_element_id="synthetic.peer", ui_command_id=cid, handler_location="handlers::synthetic::peer")
            altered["entries"]["synthetic.peer"] = row
            def fixture_load(path):
                return altered if Path(path) == matrix_path else original_load(path)
            with self.subTest(command=cid), mock.patch.object(gate, "load_json", side_effect=fixture_load):
                result = gate.cmd_validate_wiring_matrix(argparse.Namespace())
            self.assertEqual(result["status"], "fail")
            self.assertTrue(any(item.get("error") == expected_error for item in result["failures"]))

    def test_live_wiring_has_resolved_owners_one_handler_and_no_excluded_peers(self):
        matrix = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())
        exclusions = json.loads((ROOT / "Plans/Wiring_Matrix.production.exclusions.json").read_text())
        report = self.inspection.whole_wiring_inventory(
            ROOT, (ROOT / "Plans/UI_Command_Catalog.md").read_text(), matrix["entries"], [], exclusions["excluded_tokens"])
        self.assertEqual(report["errors"], [])
        revert = next(c for c in report["commands"] if c["command_id"] == "cmd.chat.revert")
        self.assertEqual(revert["sole_declared_handlers"], ["handlers::chat::revert"])
        self.assertEqual(report["wiring_row_count"], sum(len(c["wiring_rows"]) for c in report["commands"]))


class DryGuardConsumerTests(unittest.TestCase):
    """Static Touch accounting only; these checks do not execute a native guard."""

    RETIRED = "cmd.settings.agent_rules.dry_method_default_guard.set"
    OWNER_KEY = "app.agent_rules.dry_method_default_guard"
    INTENDED_ACTIONS = ["cmd.settings.transaction.preview", "cmd.settings.transaction.apply"]

    def setUp(self):
        self.registry = json.loads((ROOT / "Plans/touch_closure.json").read_text())
        self.settings = json.loads((ROOT / "Plans/settings_system_contract_fixtures.json").read_text())
        matrix = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())
        self.production_actions = {row["ui_command_id"] for row in matrix["entries"].values()}

    def check(self, registry=None, settings=None, production_actions=None):
        return validator.dry_guard_consumer_failures(
            self.registry if registry is None else registry,
            self.settings if settings is None else settings,
            self.production_actions if production_actions is None else production_actions)

    def retained_row(self, registry):
        return next(row for row in registry["rows"] if row[0] == "TOUCH-SETPROJ-003")

    def profile(self, registry):
        return next(profile for profile in registry["profiles"]
                    if profile["profile_id"] == "TCP-DRY-METHOD")

    def test_corrected_consumer_keeps_one_full_guard_obligation(self):
        self.assertEqual(self.check(), [])
        row = self.retained_row(self.registry)
        self.assertEqual(row[:5], ["TOUCH-SETPROJ-003", "TCP-DRY-METHOD",
                                  "presentation", "settings.manager.dry-method", "partial"])
        self.assertEqual(sum(r[3] == "settings.manager.dry-method" for r in self.registry["rows"]), 1)
        self.assertFalse(any(r[0] == "TOUCH-DRY-001" or r[3] == self.RETIRED
                             for r in self.registry["rows"]))
        profile = self.profile(self.registry)
        self.assertEqual((profile["owner_plan"], profile["plan_unit"]),
                         ("Plans/Settings_System.md", "SSYS-023"))
        self.assertEqual(profile["result_schema_ref"],
                         "Plans/settings_system_contracts.schema.json#/$defs/settings_named_visible_state_projection")
        self.assertEqual(profile["error_schema_ref"],
                         "Plans/settings_system_contracts.schema.json#/$defs/disabled_reason")
        for ref in ("Plans/Decision_Log.md#DL-041", "Plans/UI_Command_Catalog.md#UCC-104",
                    "Plans/Wiring_Matrix.md#WM-040", "Plans/Settings_System.md#SSYS-018",
                    "Plans/Settings_System.md#SSYS-023", "Plans/DRY_Rules.md#DR-040"):
            self.assertIn(ref, profile["requirement_refs"])
        self.assertEqual((profile["handler_status"], profile["wiring_status"]), ("absent", "absent"))
        self.assertEqual(profile["event_refs"], [])

    def test_generic_profile_or_synthetic_action_sequence_is_rejected(self):
        for field, value in ((1, "TCP-SET-NAMED-PROJECTION"),
                             (2, "command"), (3, "ui.settings.dry_guard.sequence"),
                             (4, "implemented")):
            registry = copy.deepcopy(self.registry)
            self.retained_row(registry)[field] = value
            with self.subTest(field=field, value=value):
                self.assertTrue(self.check(registry=registry))
        registry = copy.deepcopy(self.registry)
        duplicate = copy.deepcopy(self.retained_row(registry))
        duplicate[0] = "TOUCH-DRY-001"
        registry["rows"].append(duplicate)
        self.assertTrue(self.check(registry=registry))

    def test_premature_handler_wiring_or_event_claims_are_rejected(self):
        for field, value in (("handler_status", "specified"), ("handler_status", "implemented"),
                             ("wiring_status", "specified"), ("wiring_status", "verified"),
                             ("event_refs", ["settings.updated"])):
            registry = copy.deepcopy(self.registry)
            self.profile(registry)[field] = value
            with self.subTest(field=field, value=value):
                self.assertTrue(self.check(registry=registry))

    def test_owner_and_schema_routes_cannot_be_replaced(self):
        for field, value in (("owner_plan", "Plans/UI_Command_Catalog.md"),
                             ("plan_unit", "UCC-104"),
                             ("result_schema_ref", "synthetic requested/effective success"),
                             ("error_schema_ref", "synthetic error")):
            registry = copy.deepcopy(self.registry)
            self.profile(registry)[field] = value
            with self.subTest(field=field):
                self.assertTrue(self.check(registry=registry))
        for ref in ("Plans/Decision_Log.md#DL-041", "Plans/UI_Command_Catalog.md#UCC-104",
                    "Plans/Wiring_Matrix.md#WM-040", "Plans/Settings_System.md#SSYS-018",
                    "Plans/Settings_System.md#SSYS-023", "Plans/DRY_Rules.md#DR-040"):
            registry = copy.deepcopy(self.registry)
            self.profile(registry)["requirement_refs"].remove(ref)
            with self.subTest(missing_ref=ref):
                self.assertTrue(self.check(registry=registry))

    def test_retired_token_stays_forbidden_without_replacement_or_alias(self):
        exclusions = [row for row in self.registry["excluded_tokens"] if row["token"] == self.RETIRED]
        self.assertEqual(len(exclusions), 1)
        self.assertEqual((exclusions[0]["classification"], exclusions[0]["replacement"]), ("forbidden", ""))
        self.assertNotIn(self.RETIRED, self.registry["alias_bindings"])
        self.assertFalse(any(row["exact_target"] == self.RETIRED
                             for row in self.registry["alias_bindings"].values()))
        self.assertNotIn(self.RETIRED, self.production_actions)
        for field, value in (("classification", "documentation_family"),
                             ("replacement", self.INTENDED_ACTIONS[0])):
            registry = copy.deepcopy(self.registry)
            next(row for row in registry["excluded_tokens"] if row["token"] == self.RETIRED)[field] = value
            with self.subTest(field=field):
                self.assertTrue(self.check(registry=registry))
        registry = copy.deepcopy(self.registry)
        registry["excluded_tokens"].append(copy.deepcopy(exclusions[0]))
        self.assertTrue(self.check(registry=registry))

    def test_retired_alias_or_production_resurrection_is_rejected(self):
        existing_alias = next(iter(self.registry["alias_bindings"].values()))
        for alias_source, target in ((self.RETIRED, self.INTENDED_ACTIONS[0]),
                                     ("cmd.synthetic.dry_guard.alias", self.RETIRED)):
            registry = copy.deepcopy(self.registry)
            alias = copy.deepcopy(existing_alias)
            alias["exact_target"] = target
            registry["alias_bindings"][alias_source] = alias
            with self.subTest(source=alias_source, target=target):
                self.assertTrue(self.check(registry=registry))
        self.assertTrue(self.check(production_actions=self.production_actions | {self.RETIRED}))

    def test_settings_intended_targets_do_not_authorize_guard_mutation(self):
        descriptor = self.settings["manager_registry"]["dry-method"]
        self.assertEqual(descriptor["owner_action_ids"], self.INTENDED_ACTIONS)
        self.assertIn("owner_contract_missing", descriptor["owner_gap_reason"])
        self.assertIn("no mutation dispatch", descriptor["owner_gap_reason"])
        self.assertIn("setting write", descriptor["owner_gap_reason"])
        for actions in ([self.RETIRED], ["cmd.synthetic.dry_guard.set"], self.INTENDED_ACTIONS[:1]):
            settings = copy.deepcopy(self.settings)
            settings["manager_registry"]["dry-method"]["owner_action_ids"] = actions
            with self.subTest(actions=actions):
                self.assertTrue(self.check(settings=settings))
        settings = copy.deepcopy(self.settings)
        settings["manager_registry"]["dry-method"]["owner_gap_reason"] = "Mutation is available."
        self.assertTrue(self.check(settings=settings))

    def test_named_projection_preserves_guard_fields_and_safety(self):
        projection = self.settings["named_visible_state_projections"]["dry-method"]
        required_fields = {"requested_default_guard", "effective_default_guard", "origin", "scope",
                           "availability", "disabled_reason", "owner_evidence", "exceptions",
                           "consequence_disclosure"}
        self.assertTrue(required_fields <= set(projection["visible_state_fields"]))
        self.assertEqual(projection["owner_action_policy"], "owner_admitted_command_or_typed_route_only")
        self.assertIs(projection["settings_is_runtime_owner"], False)
        self.assertIs(projection["raw_logs_included"], False)
        required_negatives = {
            "do_not_weaken_instructions_or_safety",
            "do_not_weaken_secrets_source_authority_governance_permissions_or_source_control",
            "do_not_present_the_default_guard_as_a_universal_runtime_override",
        }
        self.assertTrue(required_negatives <= set(projection["negative_constraints"]))
        for field in required_fields:
            settings = copy.deepcopy(self.settings)
            settings["named_visible_state_projections"]["dry-method"]["visible_state_fields"].remove(field)
            with self.subTest(missing_field=field):
                self.assertTrue(self.check(settings=settings))
        for constraint in required_negatives:
            settings = copy.deepcopy(self.settings)
            settings["named_visible_state_projections"]["dry-method"]["negative_constraints"].remove(constraint)
            with self.subTest(missing_constraint=constraint):
                self.assertTrue(self.check(settings=settings))

    def test_static_obligation_keeps_exact_key_and_disabled_boundary(self):
        profile = self.profile(self.registry)
        text = json.dumps(profile) + " " + self.retained_row(self.registry)[5]
        for token in (self.OWNER_KEY, "enabled", "disabled_by_user", "owner_contract_missing"):
            self.assertIn(token, text)
        self.assertRegex(text.lower(), r"default.{0,40}enabled|enabled.{0,40}default")
        # Substituting an unrelated setting key must never invent the missing owner mapping.
        registry = json.loads(json.dumps(self.registry).replace(self.OWNER_KEY, "memory.assembly"))
        self.assertTrue(self.check(registry=registry))

    def test_verify_composes_the_dry_guard_consumer_check(self):
        sentinel = "DL-041 DRY guard: synthetic integration sentinel"
        with mock.patch.object(validator, "dry_guard_consumer_failures",
                               return_value=[sentinel]) as check:
            failures, _ = validator.verify()
        check.assert_called_once()
        self.assertIn(sentinel, failures)


class BoundedGapRepairInventoryTests(unittest.TestCase):
    def test_exact_owner_table_adds_only_38_partial_commands(self):
        admitted = validator.gap_repair_inventory()
        registry = json.loads((ROOT / "Plans/touch_closure.json").read_text())
        profiles = {p["profile_id"]: p for p in registry["profiles"]}
        rows = {r[3]: r for r in registry["rows"]}
        self.assertEqual(len(admitted), 38)
        self.assertEqual(sum(c.startswith("cmd.bsd.") for c in admitted), 9)
        self.assertEqual(sum(c.startswith("cmd.chat.context_lens.") for c in admitted), 7)
        self.assertNotIn("cmd.bsd.set", admitted)
        self.assertEqual(len(rows), 643)
        self.assertEqual(len(profiles), 133)
        for command, (profile_id, owner, unit) in admitted.items():
            with self.subTest(command=command):
                self.assertEqual(rows[command][1:5], [profile_id, "command", command, "partial"])
                profile = profiles[profile_id]
                self.assertEqual((profile["owner_plan"], profile["plan_unit"]), (owner, unit))
                self.assertEqual(profile["handler_status"], "specified")
                self.assertEqual(profile["wiring_status"], "specified")
                self.assertIn("Machine request/result/error schema materialization", profile["production_or_simulation"])
                self.assertTrue(all(profile[field].endswith("#" + unit)
                                    for field in ("dry_contract_ref", "payload_schema_ref", "result_schema_ref", "error_schema_ref")))

    def test_unrelated_catalog_or_prose_cannot_expand_the_gap_roster(self):
        expected = validator.gap_repair_inventory()
        original = validator.read
        def changed(path):
            value = original(path)
            return value + "\n| `cmd.unrelated.synthetic` | unrelated |\n" if path in {
                "Plans/Wiring_Matrix.md", "Plans/UI_Command_Catalog.md"} else value
        with mock.patch.object(validator, "read", side_effect=changed):
            self.assertEqual(validator.gap_repair_inventory(), expected)

    def test_duplicate_or_omitted_inventory_rows_fail_closed(self):
        original = validator.read
        text = original("Plans/Wiring_Matrix.md")
        row = next(line for line in text.splitlines() if line.startswith("| `cmd.bsd.configure` | `TCP-GAP-"))
        for replacement in ("", row + "\n" + row, row.replace("TCP-GAP-001", "invalid-profile")):
            changed = text.replace(row, replacement)
            with self.subTest(replacement=replacement), mock.patch.object(
                    validator, "read", side_effect=lambda path: changed if path == "Plans/Wiring_Matrix.md" else original(path)):
                with self.assertRaises(ValueError):
                    validator.gap_repair_inventory()

    def test_missing_primary_command_cannot_be_replaced_by_prose(self):
        original = validator.read
        def changed(path):
            value = original(path)
            if path == "Plans/UI_Command_Catalog.md":
                value = "\n".join(line for line in value.splitlines()
                                  if not line.startswith("| `cmd.bsd.configure` |"))
            return value
        with mock.patch.object(validator, "read", side_effect=changed), self.assertRaisesRegex(ValueError, "primary catalog"):
            validator.gap_repair_inventory()

    def test_bsd_mode_reuses_existing_machine_contract_refs(self):
        registry = json.loads((ROOT / "Plans/touch_closure.json").read_text())
        profile = next(p for p in registry["profiles"] if p["profile_id"] == "TCP-BSD")
        self.assertEqual(sum(r[3] == "cmd.bsd.set" for r in registry["rows"]), 1)
        for field, name in (("payload_schema_ref", "back_seat_driver_mode_set_request"),
                            ("result_schema_ref", "back_seat_driver_mode_set_result"),
                            ("error_schema_ref", "command_error")):
            self.assertEqual(profile[field], "Plans/shared_runtime_command_contracts.schema.json#/$defs/" + name)
            self.assertIsNone(validator.validate_repository_ref(profile[field]))


if __name__ == "__main__":
    unittest.main()
