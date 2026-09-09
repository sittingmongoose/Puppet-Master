"""Static installed-tool update-policy regressions; no updater or scheduler runs."""

from __future__ import annotations

import copy
import importlib.util
import itertools
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]
SOURCES = ["pm_managed", "external", "package_manager", "user", "organization"]
AUTHORITY_FIELDS = [
    "one_operation_consent_ref", "consent_current", "durable_delegation_ref",
    "delegation_scope_ref", "delegation_generation", "delegation_current",
    "delegation_revoked", "reviewed_maintenance_policy_ref", "maintenance_policy_current",
]


class InstallationUpdatePreferenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        spec = importlib.util.spec_from_file_location("pm_installation_contract_checker", ROOT / "scripts/pm-new-contracts-verify.py")
        cls.contract_checker = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.contract_checker)
        cls.schema = json.loads((ROOT / "Plans/egolite_retained_requirement_contracts.schema.json").read_text())
        cls.fixtures = json.loads((ROOT / "Plans/egolite_retained_requirement_contract_fixtures.json").read_text())
        aggregate = next(case["instance"] for case in cls.fixtures["valid"] if case["name"] == "aggregate_all_15")
        cls.baseline = next(record for record in aggregate["contracts"] if record["requirement_id"] == "IRT-008")
        cls.validator = Draft202012Validator({
            "$schema": cls.schema["$schema"], "$defs": cls.schema["$defs"], "$ref": "#/$defs/irt_008",
        })

    def case(self, authority="none", automatic="check_only", notifications="notify", source="external"):
        value = copy.deepcopy(self.baseline)
        for field in AUTHORITY_FIELDS:
            value.pop(field, None)
        value.update({
            "management_sources": SOURCES,
            "management_source": source,
            "installation_ref": "ref-installation-under-test",
            "host_ref": "ref-host-under-test",
            "environment_ref": "ref-environment-under-test",
            "policy_ref": "ref-installation-lifecycle-policy",
            "policy_generation": 3,
            "authority_basis": authority,
            "mutation_requires_explicit_user_action": authority in ("none", "one_operation_consent"),
            "update_preferences": {
                "automatic_check_policy": automatic,
                "routine_update_notifications": notifications,
                "manual_actions": ["check_for_updates", "check_and_install_updates"],
                "manual_actions_change_automatic_policy": False,
                "disabled_automatic_policy_disables_manual_actions": False,
                "suppress_required_feedback": False,
            },
        })
        automatic_authorized = authority in ("pm_managed_policy", "durable_delegation")
        awaiting_automatic_approval = automatic == "check_and_install" and not automatic_authorized
        value["effective_automatic_policy"] = "check_only" if awaiting_automatic_approval else automatic
        value["automatic_install_disabled_reason"] = "approval_required" if awaiting_automatic_approval else None
        effect_requirement = "explicit_action_or_current_delegation"
        if authority == "none":
            effect_requirement = "deny"
        elif authority == "one_operation_consent":
            value.update(one_operation_consent_ref="ref-one-operation-consent", consent_current=True)
        elif authority == "durable_delegation":
            value.update(
                durable_delegation_ref="ref-reviewed-update-delegation",
                delegation_scope_ref="ref-exact-installation-update-scope",
                delegation_generation=2, delegation_current=True, delegation_revoked=False,
            )
        elif authority == "pm_managed_policy":
            effect_requirement = "current_reviewed_pm_managed_policy"
            value.update(reviewed_maintenance_policy_ref="ref-reviewed-pm-policy", maintenance_policy_current=True)
        value["effect_policy"] = {effect: effect_requirement for effect in value["effect_kinds"]}
        return value

    def assert_valid(self, value):
        self.assertFalse(list(self.validator.iter_errors(value)))

    def assert_rejected(self, value):
        self.assertTrue(list(self.validator.iter_errors(value)))

    def test_schema_and_all_authored_maintenance_examples(self):
        Draft202012Validator.check_schema(self.schema)
        expected = {
            "irt008_notify_only": ("external", "none", "check_only", "notify", "check_only", None),
            "irt008_disabled_quiet": ("external", "none", "disabled", "do_not_notify", "disabled", None),
            "irt008_one_operation_consent": ("external", "one_operation_consent", "check_only", "notify", "check_only", None),
            "irt008_delegated_maintenance": ("external", "durable_delegation", "check_and_install", "notify", "check_and_install", None),
            "irt008_pm_managed_auto": ("pm_managed", "pm_managed_policy", "check_and_install", "do_not_notify", "check_and_install", None),
            "irt008_auto_requested_without_grant": ("external", "none", "check_and_install", "notify", "check_only", "approval_required"),
        }
        direct = {
            case["name"]: case for case in self.fixtures["valid"]
            if case.get("instance", {}).get("requirement_id") == "IRT-008"
        }
        self.assertEqual(set(direct), set(expected))
        for name, case in direct.items():
            value = case["instance"]
            with self.subTest(case=name):
                self.assertEqual(case["definition"], "irt_008")
                self.assertEqual((
                    value["management_source"], value["authority_basis"],
                    value["update_preferences"]["automatic_check_policy"],
                    value["update_preferences"]["routine_update_notifications"],
                    value["effective_automatic_policy"], value["automatic_install_disabled_reason"],
                ), expected[name])
                self.assert_valid(value)
        for case in self.fixtures["valid"]:
            for record in case.get("instance", {}).get("contracts", []):
                if record.get("requirement_id") == "IRT-008":
                    self.assert_valid(record)

    def test_named_maintenance_negatives_retain_their_exact_recipe_and_reject(self):
        expected = {}

        def reject_recipe(name, base, patch=None, remove=None):
            recipe = {"name": name, "base_valid": base, "definition": "irt_008"}
            if patch is not None:
                recipe["patch"] = patch
            if remove is not None:
                recipe["remove"] = remove
            expected[name] = recipe

        delegated = "irt008_delegated_maintenance"
        for field in ("delegation_current", "delegation_generation", "delegation_revoked",
                      "delegation_scope_ref", "durable_delegation_ref"):
            reject_recipe(f"contracts_8_{field}_required", delegated, remove=[field])
        for field in ("durable_delegation_ref", "delegation_scope_ref"):
            for suffix, value in (("nonempty", ""), ("maximum_length", "x" * 257),
                                  ("forbidden_sensitive_text", "password"), ("string_type", 7)):
                reject_recipe(f"contracts_8_{field}_{suffix}", delegated, patch={field: value})
        for field, suffix, value in (
            ("delegation_generation", "minimum", 0),
            ("delegation_generation", "integer_type", "not_an_integer"),
            ("delegation_current", "exact_invariant", False),
            ("delegation_revoked", "exact_invariant", True),
        ):
            reject_recipe(f"contracts_8_{field}_{suffix}", delegated, patch={field: value})

        one_time = "irt008_one_operation_consent"
        pm_auto = "irt008_pm_managed_auto"
        disabled = "irt008_disabled_quiet"
        cases = (
            ("one_time_consent_cannot_enable_background_install", one_time,
             {"update_preferences.automatic_check_policy": "check_and_install",
              "effective_automatic_policy": "check_and_install", "automatic_install_disabled_reason": None}),
            ("external_cannot_use_pm_managed_policy", pm_auto, {"management_source": "external"}),
            ("pm_managed_cannot_use_external_delegation", delegated, {"management_source": "pm_managed"}),
            ("disabled_cannot_become_background_check", disabled, {"effective_automatic_policy": "check_only"}),
            ("quiet_cannot_hide_required_feedback", disabled, {"update_preferences.suppress_required_feedback": True}),
            ("manual_action_cannot_change_saved_policy", one_time, {"update_preferences.manual_actions_change_automatic_policy": True}),
            ("disabling_background_checks_preserves_manual_actions", disabled,
             {"update_preferences.disabled_automatic_policy_disables_manual_actions": True}),
            ("one_time_authority_rejects_extra_delegation", one_time, {"durable_delegation_ref": "ref-unselected-delegation"}),
            ("delegation_rejects_extra_one_time_authority", delegated, {"one_operation_consent_ref": "ref-unselected-consent"}),
            ("no_grant_cannot_claim_effective_automatic_install", "irt008_auto_requested_without_grant",
             {"effective_automatic_policy": "check_and_install", "automatic_install_disabled_reason": None}),
            ("unknown_owner_is_not_automatic_authority", pm_auto, {"management_source": "unknown"}),
            ("stale_pm_policy_rejected", pm_auto, {"maintenance_policy_current": False}),
        )
        for name, base, patch in cases:
            reject_recipe(f"irt008_{name}", base, patch=patch)
        reject_recipe("irt008_missing_consent_current_rejected", one_time, remove=["consent_current"])
        for field in ("installation_ref", "host_ref", "environment_ref", "policy_ref",
                      "policy_generation", "authority_basis", "update_preferences"):
            reject_recipe(f"irt008_{field}_required", "irt008_notify_only", remove=[field])

        selected = [
            case for case in self.fixtures["invalid"]
            if case["name"].startswith("irt008_")
            or (case["name"].startswith("contracts_8_")
                and ("delegation" in case["name"]))
        ]
        actual = {case["name"]: case for case in selected}
        self.assertEqual(len(selected), len(actual))
        self.assertEqual(len(expected), 37)
        self.assertEqual(actual, expected)
        positives = {case["name"]: case["instance"] for case in self.fixtures["valid"]}
        for name, case in actual.items():
            with self.subTest(case=name):
                self.assert_valid(positives[case["base_valid"]])
                self.assert_rejected(self.contract_checker.materialize_invalid(case, positives))

    def test_automatic_modes_and_notification_choices_are_independent(self):
        checked = 0
        for source, authority, automatic, notifications in itertools.product(
            SOURCES, ["none", "one_operation_consent", "durable_delegation", "pm_managed_policy"],
            ["disabled", "check_only", "check_and_install"], ["notify", "do_not_notify"],
        ):
            if authority == "pm_managed_policy" and source != "pm_managed":
                continue
            if authority == "durable_delegation" and source == "pm_managed":
                continue
            with self.subTest(source=source, authority=authority, automatic=automatic, notifications=notifications):
                self.assert_valid(self.case(authority, automatic, notifications, source))
                checked += 1
        self.assertEqual(checked, 90)

    def test_manual_update_requires_one_time_consent_not_delegation(self):
        value = self.case("one_operation_consent")
        self.assertNotIn("durable_delegation_ref", value)
        self.assert_valid(value)
        for field in ("one_operation_consent_ref", "consent_current"):
            candidate = copy.deepcopy(value)
            candidate.pop(field)
            self.assert_rejected(candidate)

    def test_automatic_update_uses_reviewed_policy_or_delegation_not_one_time_consent(self):
        for authority, source in (("durable_delegation", "external"), ("pm_managed_policy", "pm_managed")):
            value = self.case(authority, "check_and_install", source=source)
            self.assertNotIn("one_operation_consent_ref", value)
            self.assertEqual(value["effective_automatic_policy"], "check_and_install")
            self.assert_valid(value)
        for authority in ("none", "one_operation_consent"):
            value = self.case(authority, "check_and_install")
            self.assertEqual(value["effective_automatic_policy"], "check_only")
            self.assertEqual(value["automatic_install_disabled_reason"], "approval_required")
            self.assert_valid(value)
            value.update(effective_automatic_policy="check_and_install", automatic_install_disabled_reason=None)
            self.assert_rejected(value)

    def test_manual_actions_neither_change_preferences_nor_disappear_when_checks_are_disabled(self):
        value = self.case(automatic="disabled")
        self.assert_valid(value)
        for field in ("manual_actions_change_automatic_policy", "disabled_automatic_policy_disables_manual_actions"):
            candidate = copy.deepcopy(value)
            candidate["update_preferences"][field] = True
            self.assert_rejected(candidate)
        for automatic in ("check_only", "check_and_install"):
            candidate = copy.deepcopy(value)
            candidate["effective_automatic_policy"] = automatic
            self.assert_rejected(candidate)

    def test_authority_loss_preserves_disabled_and_quiet_choices(self):
        # Two authored states, not a claim that a runtime revocation handler executes.
        before = self.case("durable_delegation", "disabled", "do_not_notify")
        after = self.case("none", "disabled", "do_not_notify")
        self.assert_valid(before)
        self.assert_valid(after)
        self.assertEqual(before["update_preferences"], after["update_preferences"])
        self.assertEqual(after["effective_automatic_policy"], "disabled")

    def test_quiet_updates_cannot_hide_required_feedback(self):
        value = self.case(notifications="do_not_notify")
        self.assert_valid(value)
        value["update_preferences"]["suppress_required_feedback"] = True
        self.assert_rejected(value)

    def test_authority_branches_do_not_accept_fallback_grants(self):
        value = self.case("one_operation_consent")
        value["durable_delegation_ref"] = "ref-unselected-delegation"
        self.assert_rejected(value)
        value = self.case("durable_delegation")
        value["one_operation_consent_ref"] = "ref-unselected-one-off"
        self.assert_rejected(value)
        value = self.case("none")
        value["reviewed_maintenance_policy_ref"] = "ref-unselected-pm-policy"
        self.assert_rejected(value)

    def test_external_ownership_cannot_borrow_pm_managed_authority(self):
        self.assert_rejected(self.case("durable_delegation", "check_and_install", source="pm_managed"))
        for source in SOURCES[1:]:
            with self.subTest(source=source):
                self.assert_rejected(self.case("pm_managed_policy", "check_and_install", source=source))

    def test_missing_stale_revoked_and_unknown_authority_is_rejected(self):
        for field, value in (("delegation_current", False), ("delegation_revoked", True), ("delegation_generation", 0)):
            candidate = self.case("durable_delegation", "check_and_install")
            candidate[field] = value
            self.assert_rejected(candidate)
        candidate = self.case("pm_managed_policy", "check_and_install", source="pm_managed")
        candidate["maintenance_policy_current"] = False
        self.assert_rejected(candidate)
        for field in ("management_source", "ownership_confidence", "authority_basis"):
            candidate = self.case()
            candidate[field] = "unknown"
            self.assert_rejected(candidate)

    def test_policy_target_and_generation_cannot_be_omitted(self):
        for field in ("installation_ref", "host_ref", "environment_ref", "policy_ref", "policy_generation"):
            candidate = self.case()
            candidate.pop(field)
            self.assert_rejected(candidate)

    def test_owner_and_settings_consume_choices_without_registering_deferred_routes(self):
        owner = (ROOT / "Plans/Shared_Integration_Runtime.md").read_text()
        settings = (ROOT / "Plans/Settings_System.md").read_text()
        for label in ("Check for updates", "Check for updates and install", "Automatically check for updates",
                      "Automatically check for updates and install", "Do not check automatically", "Do not notify"):
            self.assertIn(label, owner)
        for command in ("cmd.installation.check_updates", "cmd.installation.update_policy.set"):
            self.assertIn(f"| `{command}` | `deferred_noncanonical_candidate` |", owner)
        self.assertIn("installed-tool update choices", settings.lower())
        self.assertIn("do not alter Puppet Master's separate app-update/restart policy", settings)


if __name__ == "__main__":
    unittest.main()
