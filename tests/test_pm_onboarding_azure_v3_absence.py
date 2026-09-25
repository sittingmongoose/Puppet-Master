"""Pre-release v3 correction; static schema evidence, no child dispatch proof."""
import copy
import json
import os
from pathlib import Path
import subprocess
import sys
import unittest

ROOT = Path(os.environ.get("PM_CANON_ROOT", str(Path(__file__).resolve().parents[1])))
REPO = os.environ.get("PM_CANON_BASELINE_ROOT", str(ROOT))
BASE = "4c549b78be94654144a16723354c2ef72e5db8bf"
sys.path.insert(0, str(ROOT / "scripts"))
sys.path.insert(0, str(ROOT / "tests"))
from onboarding_creation_fixtures import azure_existing_creation_fixture
from pm_onboarding_creation_schema import build_onboarding_creation_defs, build_onboarding_v3_storage_bundle, materialized_v3_registry
from jsonschema import Draft202012Validator


def pinned(path):
    return json.loads(subprocess.check_output(["git", "-C", REPO, "show", BASE + ":" + path], text=True))


def azure_rule(draft):
    return next(r for r in draft["allOf"] if r.get("if", {}).get("properties", {}).get("forge") == {"const": "azure_devops"})


def new_project_fixture():
    h = azure_existing_creation_fixture(ROOT)
    draft = h.session["setup_draft"]
    draft["repository_project"] = ""
    draft["repository_creation_selection"]["azure_team_project_selection"] = {
        "mode": "create", "existing_project_ref": None, "project_name": "New Azure Project",
        "visibility": "private", "process_template_ref": "process-template:owner-selected", "version_control": "git"}
    h.refresh_review()  # Test-only explicit source edit/reapproval, never migration.
    return h


class AzureV3AbsenceTests(unittest.TestCase):
    def test_exact_pinned_definition_delta_and_all_other_historical_shapes(self):
        h = new_project_fixture()
        old = pinned("Plans/product_onboarding_contracts.schema.json")
        new = copy.deepcopy(h.schemas["onboarding"])
        prior = old["$defs"]["onboarding_setup_plan_v3"]
        changed = new["$defs"]["onboarding_setup_plan_v3"]
        rule = azure_rule(changed)
        self.assertNotIn("repository_project", rule["then"]["properties"])
        condition = rule["then"]["allOf"][0]
        self.assertEqual({"const": ""}, condition["then"]["properties"]["repository_project"])
        self.assertEqual(azure_rule(prior)["then"]["properties"]["repository_project"], condition["else"]["properties"]["repository_project"])
        # Restore only that complete Azure conditional, then require full-tree
        # equality. This pins all prior definitions, IDs, primitives and choices.
        changed["allOf"][changed["allOf"].index(rule)] = copy.deepcopy(azure_rule(prior))
        self.assertEqual(old, new)

    def test_exact_storage_delta_no_key_family_policy_or_writer_version_change(self):
        h = new_project_fixture()
        old = pinned("Plans/storage_value_registry.json")
        current = h.load("storage_value_registry.json")
        old_row = next(r for r in old["families"] if r["family_id"] == "onboarding_state")
        row = next(r for r in current["families"] if r["family_id"] == "onboarding_state")
        bundle = build_onboarding_v3_storage_bundle(h.schemas["onboarding"], h.schemas["project"], h.schemas["settings"], h.schemas["forge"])
        self.assertEqual(bundle, row["value_schema"])
        self.assertEqual([], list(Draft202012Validator(bundle).iter_errors(h.session)))
        # Assert the exact current physical union independently of the isolated
        # Azure correction. Unrelated later dispositions are not Azure changes.
        reviewed_main = json.loads(subprocess.check_output([
            "git", "-C", REPO, "show",
            "1e5d9b097b46aa58e7af488a9c38a87efb780d5f:Plans/storage_value_registry.json",
        ], text=True))
        expected = materialized_v3_registry(reviewed_main, bundle)
        self.assertEqual(294, len(current["families"]))
        self.assertEqual(27, len(current["retention_policies"]))
        self.assertEqual(expected["families"], current["families"])
        self.assertEqual(reviewed_main["retention_policies"], current["retention_policies"])
        name = "onboarding__onboarding_setup_plan_v3"
        row["value_schema"]["$defs"][name] = copy.deepcopy(old_row["value_schema"]["$defs"][name])
        self.assertEqual(old_row, row, "only the Azure conditional may change within the onboarding family")

    def test_actual_no_existing_project_is_writable_without_identity_or_readiness(self):
        h = new_project_fixture()
        before = copy.deepcopy(h.records)
        for definition, value in (("onboarding_setup_plan_v3", h.session["setup_draft"]),
                                  ("onboarding_setup_plan_current_write", h.session["setup_draft"]),
                                  ("onboarding_session_v3", h.session), ("onboarding_session_current_write", h.session)):
            self.assertEqual([], h.validate("onboarding", definition, value), definition)
        h.owner = None
        result = h.produce()
        self.assertEqual("pending", result["status"])
        self.assertEqual(["producer_azure_team_project_owner_operation_required"], result["errors"])
        self.assertIsNone(result["choices"])
        self.assertIsNone(result["subject"])
        self.assertEqual(before, h.records)

    def test_create_rejects_leftover_existing_normal_or_advanced_identity(self):
        for normal, advanced in (("project:previous", None), ("", "project:previous")):
            h = new_project_fixture()
            draft = h.session["setup_draft"]
            draft["repository_project"] = normal
            draft["repository_creation_selection"]["azure_team_project_selection"]["existing_project_ref"] = advanced
            h.refresh_review()
            before = copy.deepcopy(h.records)
            self.assertTrue(h.validate("onboarding", "onboarding_setup_plan_current_write", draft))
            self.assertEqual("blocked", h.produce()["status"])
            self.assertEqual(before, h.records)

    def test_existing_unresolved_and_existing_repository_keep_prior_constraint(self):
        for mode in ("existing", "unresolved", "existing_repository"):
            h = azure_existing_creation_fixture(ROOT)
            draft = h.session["setup_draft"]
            if mode == "unresolved":
                draft["repository_creation_selection"]["azure_team_project_selection"] = None
            elif mode == "existing_repository":
                draft.update(online_mode="existing", repository_ref="repository:real", repository_creation_selection=None)
            h.refresh_review()
            self.assertEqual([], h.validate("onboarding", "onboarding_setup_plan_v3", draft))
            draft["repository_project"] = ""
            self.assertTrue(h.validate("onboarding", "onboarding_setup_plan_v3", draft))
        h = azure_existing_creation_fixture(ROOT)
        self.assertEqual("ready", h.produce()["status"])

    def test_builder_matches_actual_companion_without_mutating_inputs(self):
        h = new_project_fixture()
        before = copy.deepcopy(h.schemas)
        additions = build_onboarding_creation_defs(h.schemas["onboarding"], h.schemas["forge"])
        for name, definition in additions.items():
            self.assertEqual(h.schemas["onboarding"]["$defs"][name], definition, name)
        self.assertEqual(before, h.schemas)


if __name__ == "__main__":
    unittest.main(verbosity=2)
