"""Settings-owner draft preview/rebind tests; no Settings or Project is mutated."""

import copy
import importlib.util
import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("settings_draft_contracts", ROOT / "scripts/pm-new-contracts-verify.py")
GATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GATE)
from pm_onboarding_semantics import settings_draft_join_failures, settings_draft_semantic_failures

SCHEMA = json.loads((ROOT / "Plans/settings_system_contracts.schema.json").read_text())
PACK = json.loads((ROOT / "Plans/settings_system_contract_fixtures.json").read_text())
CASES = {row["case_id"]: row["record"] for row in PACK["valid_cases"]}
REQUEST = CASES["valid-settings-transfer-draft-preview-request"]
PREVIEW = CASES["valid-settings-transfer-draft-preview"]
REBIND = CASES["valid-settings-transfer-draft-rebind"]
REGISTRY = GATE.offline_schema_registry()


def valid(definition, value):
    return GATE.validator_for(SCHEMA, {"$ref": "#/$defs/" + definition}, REGISTRY).is_valid(value)


def joined(request=REQUEST, preview=PREVIEW, rebind=None, **changes):
    args = dict(resolved_preview_ref=PREVIEW["preview_id"], source_revision=7,
                eligible_setting_ids=PREVIEW["exact_setting_ids"] + REQUEST["explicit_choice_setting_ids"],
                rebind=rebind, confirmed_draft=PREVIEW["destination_draft"] if rebind else None)
    args.update(changes)
    return settings_draft_join_failures(request, preview, **args)


class SettingsDraftTransferTests(unittest.TestCase):
    def test_existing_and_draft_variants_share_original_wiring_refs(self):
        self.assertTrue(valid("settings_transaction_preview_request", REQUEST))
        self.assertTrue(valid("settings_transaction_preview", PREVIEW))
        self.assertTrue(valid("settings_transfer_draft_rebind", REBIND))
        for row in PACK["valid_cases"]:
            if row["schema_ref"] in {"#/$defs/settings_transaction_preview_request", "#/$defs/settings_transaction_preview"}:
                with self.subTest(case=row["case_id"]):
                    self.assertTrue(valid(row["schema_ref"].rsplit("/", 1)[-1], row["record"]))

    def test_all_authored_draft_shape_negatives_rejected(self):
        cases = [row for row in PACK["negative_cases"] if row["case_id"].startswith("invalid-settings-transfer-")]
        self.assertEqual(len(cases), 8)
        for row in cases:
            with self.subTest(case=row["case_id"]):
                self.assertFalse(valid(row["schema_ref"].rsplit("/", 1)[-1], row["record"]))

    def test_preview_and_rebind_exact_source_and_draft(self):
        self.assertEqual(joined(), [])
        self.assertEqual(joined(rebind=REBIND), [])
        self.assertNotIn("project_id", REQUEST)
        self.assertIsNone(PREVIEW["destination_draft"]["destination_project_id"])

    def test_changed_source_revision_invalidates_preview(self):
        self.assertIn("settings_transfer_source_revision_stale", joined(source_revision=8))

    def test_changed_draft_cannot_rebind_after_commit(self):
        changed = copy.deepcopy(PREVIEW["destination_draft"])
        changed["draft_revision"] += 1
        self.assertIn("settings_transfer_unconfirmed_or_changed_draft", joined(rebind=REBIND, confirmed_draft=changed))

    def test_rebind_requires_same_preview_hash_and_id(self):
        changed = copy.deepcopy(REBIND)
        changed["draft_preview_sha256"] = "d" * 64
        self.assertIn("settings_transfer_rebind_preview_mismatch", joined(rebind=changed))

    def test_explicit_choices_cannot_be_overwritten(self):
        changed = copy.deepcopy(PREVIEW)
        changed["exact_setting_ids"] += changed["explicit_choice_setting_ids"]
        self.assertIn("settings_transfer_overwrites_explicit_choices", settings_draft_semantic_failures("settings_transfer_draft_preview", changed))

    def test_owner_excluded_values_cannot_be_copied(self):
        changed = copy.deepcopy(PREVIEW)
        changed["excluded_settings"] = [{"setting_id": changed["exact_setting_ids"][0], "reason_code": "secret_excluded", "human_reason": "Owner excludes this setting."}]
        self.assertIn("settings_transfer_copies_excluded_id", settings_draft_semantic_failures("settings_transfer_draft_preview", changed))

    def test_values_are_exact_sorted_owner_resolved_set(self):
        changed = copy.deepcopy(PREVIEW)
        changed["proposed_values_by_setting_id"]["general.interaction.panel-dock"] = "left"
        self.assertIn("settings_transfer_values_not_exact_preview_ids", settings_draft_semantic_failures("settings_transfer_draft_preview", changed))
        self.assertIn("settings_transfer_owner_eligible_set_mismatch", joined(eligible_setting_ids=[]))

    def test_draft_cannot_be_used_as_apply_request(self):
        self.assertFalse(valid("settings_transaction_apply_request", REQUEST))
        self.assertFalse(valid("settings_transaction_apply_request", REBIND))

    def test_expired_or_same_source_rebind_is_not_valid(self):
        changed = copy.deepcopy(PREVIEW)
        changed["expires_at_utc"] = changed["created_at_utc"]
        self.assertIn("settings_transfer_expiry_not_after_creation", settings_draft_semantic_failures("settings_transfer_draft_preview", changed))
        rebind = copy.deepcopy(REBIND)
        rebind["destination_project_id"] = rebind["source_project_id"]
        self.assertIn("settings_transfer_draft_rebound_to_source_project", settings_draft_semantic_failures("settings_transfer_draft_rebind", rebind))


class SettingsLayeringRefreshTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from pm_settings_layering import check, resolve_setting, snapshot_failures
        cls.resolve = staticmethod(resolve_setting)
        cls.snapshot_failures = staticmethod(snapshot_failures)
        cls.check = staticmethod(check)
        cls.rows = {r['id']: r for r in json.loads((ROOT / 'Plans/settings_inventory.json').read_text())['settings']}

    def test_complete_reviewed_corpus_and_semantic_expectations(self):
        errors, counts = self.check()
        self.assertEqual(errors, [])
        self.assertEqual(counts['rows'], 1024)
        self.assertGreater(counts['semantic_cases'], 30)

    def test_placement_preset_override_resolves_before_computer_selection(self):
        row = self.rows['code.execution.auto-preset']
        self.assertEqual(self.resolve(row, {'everywhere': 'balanced', 'project': 'fastest'}), 'fastest')
        self.assertEqual(self.resolve(row, {'everywhere': 'balanced'}), 'balanced')
        for forbidden in ('computer', 'device'):
            with self.subTest(level=forbidden), self.assertRaises(ValueError):
                self.resolve(row, {forbidden: 'fastest'})

    def test_placement_levels_are_host_specific_and_not_project_overrides(self):
        row = self.rows['code.execution.computer-level']
        self.assertEqual(row['layering']['computer_key'], 'execution_host')
        self.assertEqual(self.resolve(row, {'computer': 'less_often'}), 'less_often')
        with self.assertRaises(ValueError):
            self.resolve(row, {'project': 'prefer'})

    def test_device_cannot_set_work_computer_behavior(self):
        case = copy.deepcopy(next(c['record'] for c in PACK['projects_refresh_cases'] if c['case_id'] == 'fd-settings-device'))
        self.assertIn('unoffered_level', self.snapshot_failures(case, self.rows))

    def test_sparse_revision_omission_cannot_pass_shape_only(self):
        case = copy.deepcopy(next(c['record'] for c in PACK['projects_refresh_cases'] if c['case_id'] == 'fd-settings-everywhere'))
        case['setting_revisions'].clear()
        self.assertIn('sparse_key_sets', self.snapshot_failures(case, self.rows))

    def test_protective_order_and_custom_computer_fallback(self):
        row = self.rows['safety.rules.permission-preset']
        self.assertEqual(self.resolve(row, {'computer': 'custom', 'project': 'read_only'}), 'custom')
        self.assertEqual(self.resolve(row, {'computer': 'plan', 'project': 'full'}), 'plan')
        with self.assertRaises(ValueError):
            self.resolve(row, {'computer': 'unvalidated-profile'})

    def test_motion_os_and_capacity_are_independent_operators(self):
        self.assertIs(self.resolve(self.rows['general.visual.reduce-animations'], {'device': False}, os_reduce_motion=True), True)
        self.assertEqual(self.resolve(self.rows['ai.usage.max-tool-rounds'], {'computer': 3, 'project': 8}), 3)

    def test_map_rows_cannot_use_a_scalar_merge(self):
        with self.assertRaises(ValueError):
            self.resolve(self.rows['safety.rules.per-tool-permissions'], {'computer': {'shell': 'ask'}})


if __name__ == "__main__":
    unittest.main()
