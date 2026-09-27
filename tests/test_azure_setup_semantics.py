"""External Azure administration must not manufacture resource adoption."""
from copy import deepcopy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from pm_azure_setup_semantics import adoption_failures, digest, check_all


class AzureSetupReturnTests(unittest.TestCase):
    def setUp(self):
        pack = json.loads((ROOT / "Plans/azure_devops_setup_contract_fixtures.json").read_text())
        self.case = deepcopy(next(c for c in pack["semantic_cases"] if c["expected_accepted"]))

    def test_authored_cases_prove_expected_rejections(self):
        self.assertEqual(check_all(), [])

    def test_caller_rehash_cannot_switch_account(self):
        records = self.case["records"]
        records["handoff"]["account_id"] = "account:attacker"
        records["return"]["handoff_sha256"] = digest(records["handoff"])
        self.assertIn("identity_mismatch_account_id", adoption_failures(self.case))

    def test_consistent_return_and_discovery_still_need_current_owner_refresh(self):
        records = self.case["records"]
        records["return"]["refresh_ref"] = records["discovery"]["refresh_ref"] = "refresh:replayed"
        self.assertIn("refresh_substituted", adoption_failures(self.case))

    def test_adoption_cannot_use_future_observation(self):
        records = self.case["records"]
        records["discovery"]["discovered_at_utc"] = "2026-09-27T01:40:00Z"
        self.assertIn("discovery_not_fresh_for_handoff", adoption_failures(self.case))

    def test_expiry_boundary_is_closed(self):
        self.case["now_utc"] = self.case["records"]["handoff"]["expires_at_utc"]
        self.assertIn("handoff_expired_or_future", adoption_failures(self.case))

    def test_provider_guid_rename_remains_provider_owned(self):
        records = self.case["records"]
        records["return"]["draft_selection"]["project_name"] = "Locally invented name"
        self.assertIn("selection_mismatch_project_name", adoption_failures(self.case))

    def test_current_permission_replacement_invalidates_old_handoff(self):
        records = self.case["records"]
        records["onboarding"]["active_permission_snapshot_ref"] = "permission:new-generation"
        self.assertIn("authorization_mismatch_permission_snapshot_ref", adoption_failures(self.case))


if __name__ == "__main__":
    unittest.main()
