"""Existing Azure organization/project joins, not live provider evidence."""
import copy
import os
from dataclasses import replace
from pathlib import Path
import sys
import unittest

ROOT = Path(os.environ.get("PM_CANON_ROOT", str(Path(__file__).resolve().parents[1])))
sys.path.insert(0, str(ROOT / "scripts"))
sys.path.insert(0, str(ROOT / "tests"))
from onboarding_creation_fixtures import azure_existing_creation_fixture, provider_identity_creation_fixture
from pm_ui_command_response import owner_result_digest


class AzureExistingProjectTests(unittest.TestCase):
    def assert_shapes(self, h):
        for (owner, definition, ref), value in h.records.items():
            self.assertEqual([], h.validate(owner, definition, value), (definition, ref))
        self.assertEqual([], h.validate("forge", "repository_creation_subject", h.owner.subject))

    def test_actual_existing_azure_normal_fields_work_for_both_variants(self):
        for variant in ("azure_devops_services", "azure_devops_server"):
            h = azure_existing_creation_fixture(ROOT, variant)
            self.assert_shapes(h)
            before = copy.deepcopy(h.records)
            got = h.produce()
            self.assertEqual("ready", got["status"], got)
            self.assertEqual("inherit_project", got["choices"]["visibility"])
            self.assertEqual("project", got["subject"]["container_kind"])
            self.assertNotEqual(h.session["setup_draft"]["repository_container"], got["subject"]["account_container_ref"])
            self.assertNotEqual(h.session["setup_draft"]["repository_project"], got["subject"]["account_container_ref"])
            self.assertEqual(h.owner.resolved_destination.account_container_ref, got["subject"]["account_container_ref"])
            self.assertEqual(owner_result_digest(h.session["setup_draft"]), got["approval_binding"]["source_sha256"])
            self.assertEqual(before, h.records, "approved choices and source records must remain immutable")

    def test_missing_current_hierarchy_blocks_without_guessing(self):
        h = azure_existing_creation_fixture(ROOT)
        h.owner = replace(h.owner, azure_existing_project=None)
        self.assert_shapes(h)
        got = h.produce()
        self.assertEqual("blocked", got["status"])
        self.assertIn("producer_azure_existing_project_unresolved", got["errors"])
        self.assertIsNone(got["choices"])

    def test_each_independently_resolved_hierarchy_field_is_fenced(self):
        fields = {
            "organization_or_collection_ref": ("organization:different", "producer_azure_organization_or_collection"),
            "organization_or_collection_external_id": ("azure-organization-native:different", "producer_azure_parent_external_id"),
            "project_ref": ("project:different", "producer_azure_selected_project"),
            "project_namespace_external_id": ("azure-project-native:different", "producer_azure_project_namespace"),
            "provider_project_id": ("11111111-2222-4333-8444-555555555555", "producer_azure_project_guid"),
        }
        for field, (value, error) in fields.items():
            h = azure_existing_creation_fixture(ROOT)
            h.owner = replace(h.owner, azure_existing_project=replace(h.owner.azure_existing_project, **{field: value}))
            self.assert_shapes(h)
            got = h.produce()
            self.assertEqual("blocked", got["status"], (field, got))
            self.assertIn(error, got["errors"])

    def test_shape_valid_subject_cross_org_project_namespace_and_guid_are_rejected(self):
        for field, value, error in (
            ("parent_container_external_id", "azure-organization-native:other", "producer_azure_parent_external_id"),
            ("account_container_ref", "project:other", "producer_resolved_subject_account_container_ref"),
            ("namespace_external_id", "azure-project-native:other", "producer_azure_project_namespace"),
            ("provider_project_id", "11111111-2222-4333-8444-555555555555", "producer_azure_project_guid"),
        ):
            h = azure_existing_creation_fixture(ROOT)
            subject = {**h.owner.subject, field: value}
            h.owner = replace(h.owner, subject=subject)
            self.assert_shapes(h)
            self.assertIn(error, h.produce()["errors"])

    def test_reviewed_normal_org_project_and_advanced_selection_cannot_cross(self):
        for field, value, error in (
            ("repository_container", "organization:other", "producer_azure_organization_or_collection"),
            ("repository_project", "project:other", "producer_azure_selected_project"),
        ):
            h = azure_existing_creation_fixture(ROOT)
            h.session["setup_draft"][field] = value
            h.owner = replace(h.owner, destination_selection={**h.owner.destination_selection, field: value})
            h.refresh_review()  # Reapproval does not alter independent provider hierarchy.
            self.assert_shapes(h)
            self.assertIn(error, h.produce()["errors"])
        h = azure_existing_creation_fixture(ROOT)
        h.session["setup_draft"]["repository_creation_selection"]["azure_team_project_selection"]["existing_project_ref"] = "project:other"
        h.refresh_review()
        self.assert_shapes(h)
        self.assertIn("producer_azure_existing_project", h.produce()["errors"])

    def test_eight_provider_native_hierarchies_and_distinct_account_refs(self):
        providers = ("github", "gitlab", "azure_devops", "bitbucket_cloud", "bitbucket_data_center", "forgejo", "gitea", "cursor_origin")
        for provider in providers:
            with self.subTest(provider=provider):
                h = provider_identity_creation_fixture(ROOT, provider)
                self.assert_shapes(h)
                before = copy.deepcopy(h.records)
                got = h.produce()
                self.assertEqual("ready", got["status"], got)
                self.assertNotEqual(h.session["setup_draft"]["forge_account_ref"], got["subject"]["account_id"])
                self.assertEqual(h.owner.resolved_destination.account_container_ref, got["subject"]["account_container_ref"])
                self.assertEqual(before, h.records)
                if provider == "bitbucket_data_center":
                    self.assertEqual("project", got["subject"]["container_kind"])
                    self.assertEqual("ENG", got["subject"]["namespace_external_id"])
                    self.assertEqual("73", got["subject"]["provider_project_id"])
                    self.assertNotEqual("ENG", got["subject"]["account_container_ref"])
                if provider == "bitbucket_cloud":
                    self.assertEqual("workspace", got["subject"]["container_kind"])
                    self.assertNotEqual(h.session["setup_draft"]["repository_project"], got["subject"]["provider_project_id"])

    def test_full_actual_subject_is_bound_to_independent_resolution(self):
        changes = {"provider": "github", "provider_variant": "other-variant",
            "normalized_host": "other.example.test", "instance_profile_ref": "instance:other",
            "connection_ref": "connection:other", "connection_id": "native-connection-other",
            "account_id": "native-account-other", "account_generation": 999,
            "account_verification_ref": "verification:other", "account_container_ref": "container:other",
            "container_kind": "personal", "namespace_external_id": "OTHER",
            "parent_container_external_id": "parent-other", "provider_project_id": "777"}
        for field, value in changes.items():
            h = provider_identity_creation_fixture(ROOT, "bitbucket_data_center")
            subject = {**h.owner.subject, field: value}
            if field == "connection_ref":
                subject["connection_id"] = "native-connection-other"
            if field == "connection_id":
                subject["connection_ref"] = "connection:other"
            h.owner = replace(h.owner, subject=subject)
            self.assert_shapes(h)
            got = h.produce()
            self.assertEqual("blocked", got["status"], got)
            self.assertIn("producer_resolved_subject_" + field, got["errors"])

    def test_every_provider_rejects_cross_account_missing_stale_or_cross_subject(self):
        providers = ("github", "gitlab", "azure_devops", "bitbucket_cloud", "bitbucket_data_center", "forgejo", "gitea", "cursor_origin")
        for provider in providers:
            for field, value, error in (
                ("selected_account_ref", "selection:wrong-account", "producer_subject_account"),
                ("account_id", "native-account-wrong", "producer_resolved_subject_account_id"),
                ("account_generation", 999, "producer_resolved_subject_account_generation"),
                ("account_verification_ref", "verification:wrong", "producer_resolved_subject_account_verification_ref"),
                ("namespace_external_id", "wrong-native-container", "producer_resolved_subject_namespace_external_id"),
                ("expires_at_utc", "2026-09-24T11:59:59Z", "producer_destination_resolution_expired"),
            ):
                h = provider_identity_creation_fixture(ROOT, provider)
                h.owner = replace(h.owner, resolved_destination=replace(h.owner.resolved_destination, **{field: value}))
                self.assert_shapes(h)
                self.assertIn(error, h.produce()["errors"], (provider, field))
            h = provider_identity_creation_fixture(ROOT, provider)
            h.owner = replace(h.owner, resolved_destination=None)
            self.assertIn("producer_destination_resolution_missing", h.produce()["errors"])

    def test_unresolved_expired_rebound_or_invalid_mapping_blocks(self):
        for name, mutate, error in (
            ("missing", lambda m: None, "producer_destination_resolution_missing"),
            ("expired", lambda m: replace(m, expires_at_utc="2026-09-24T12:00:00Z"), "producer_destination_resolution_expired"),
            ("invalid-time", lambda m: replace(m, expires_at_utc="yesterday"), "producer_destination_resolution_time_invalid"),
            ("changed-review", lambda m: replace(m, approved_draft_sha256="0" * 64), "producer_destination_review_hash"),
            ("account-ref", lambda m: replace(m, selected_account_ref="selection:other"), "producer_subject_account"),
            ("container-selection", lambda m: replace(m, selected_container="selection:other"), "producer_subject_container"),
            ("optional-project", lambda m: replace(m, selected_project="project:other"), "producer_subject_project"),
            ("native-key", lambda m: replace(m, namespace_external_id="OTHER"), "producer_resolved_subject_namespace_external_id"),
            ("bad-generation", lambda m: replace(m, account_generation=-1), "producer_destination_resolution_schema"),
        ):
            h = provider_identity_creation_fixture(ROOT, "bitbucket_data_center")
            h.owner = replace(h.owner, resolved_destination=mutate(h.owner.resolved_destination))
            self.assert_shapes(h)
            got = h.produce()
            self.assertEqual("blocked", got["status"], (name, got))
            self.assertIn(error, got["errors"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
