"""Forge wiring labels use the selected adapter's display vocabulary."""

from __future__ import annotations

import argparse
import copy
import importlib.util
from pathlib import Path
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


validator = load_module("plans_verify_wiring_vocabulary", ROOT / "scripts/pm-plans-verify.py")


def review_row(command="cmd.forge.review.create"):
    return {
        "ui_command_id": command,
        "ui_location": "Source Control > Reviews",
        "acceptance_checks": ["The selected adapter supplies the review noun."],
        "evidence_required": "Dispatch and state projection evidence.",
        "vocabulary": {
            "noun_source": "selected_repository_adapter",
            "noun_field": "review_noun",
            "label_template": "Create {noun}",
        },
    }


def fixtures(*profiles):
    return {"valid": [{"definition": "provider_capability_matrix", "value": {"profiles": list(profiles)}}]}


class WiringVocabularyTests(unittest.TestCase):
    def setUp(self):
        self.entries = {"review.create": review_row()}
        self.fixtures = fixtures(
            {"profile_id": "github_cloud", "review_vocabulary": "Pull request"},
            {"profile_id": "gitlab_saas", "review_vocabulary": "Merge request"},
            {"profile_id": "generic_git", "review_vocabulary": None},
        )

    def validate(self):
        return validator.validate_wiring_vocabulary(self.entries, self.fixtures)

    def error_codes(self):
        return {failure["error"] for failure in self.validate()["failures"]}

    def test_review_commands_require_a_vocabulary_object(self):
        for command in ("cmd.forge.review.create", "cmd.forge.review.merge"):
            for value in ("missing", None, "invalid", []):
                with self.subTest(command=command, vocabulary=value):
                    row = review_row(command)
                    if value == "missing":
                        del row["vocabulary"]
                    else:
                        row["vocabulary"] = value
                    self.entries = {"review.action": row}
                    self.assertIn("wiring_vocabulary_required_missing", self.error_codes())

    def test_other_commands_may_omit_vocabulary(self):
        self.entries = {"forge.refresh": {"ui_command_id": "cmd.forge.refresh"}}
        self.assertEqual(self.validate()["failures"], [])
        self.assertEqual(self.validate()["rendered_vocabulary_labels"], {})

    def test_source_and_field_pair_must_match(self):
        for source, field in (
            ("selected_automation_binding_adapter", "review_noun"),
            ("selected_repository_adapter", "pipeline_noun"),
            ("unknown_adapter", "review_noun"),
            ("selected_repository_adapter", "unknown_noun"),
            (None, None),
            ([], []),
        ):
            with self.subTest(source=source, field=field):
                self.entries["review.create"]["vocabulary"].update(noun_source=source, noun_field=field)
                result = self.validate()
                self.assertIn("wiring_vocabulary_binding_mismatch", {item["error"] for item in result["failures"]})
                self.assertEqual(result["rendered_vocabulary_labels"], {})

    def test_template_requires_noun_placeholder(self):
        for template in ("Create review", "Create {review_noun}", "", None, 1):
            with self.subTest(template=template):
                self.entries["review.create"]["vocabulary"]["label_template"] = template
                self.assertIn("wiring_vocabulary_template_missing_noun", self.error_codes())

    def test_provider_literals_are_rejected_in_templates(self):
        for literal in ("github", "GITLAB", "Azure DevOps", "Bitbucket", "GitHub Actions", "pull request", "pull requests", "merge requests"):
            with self.subTest(literal=literal):
                self.entries["review.create"]["vocabulary"]["label_template"] = f"Create {literal} {{noun}}"
                self.assertIn("wiring_vocabulary_template_literal", self.error_codes())

    def test_template_literal_scan_still_runs_without_placeholder(self):
        self.entries["review.create"]["vocabulary"]["label_template"] = "Create GitHub review"
        self.assertTrue({"wiring_vocabulary_template_literal", "wiring_vocabulary_template_missing_noun"} <= self.error_codes())

    def test_generic_literal_scan_covers_each_text_field_and_counts_hits(self):
        row = self.entries["review.create"]
        row.update(ui_location="GitHub > pull requests", evidence_required="GitLab evidence")
        row["acceptance_checks"] = ["Azure DevOps merge request", "Bitbucket"]
        result = self.validate()
        self.assertEqual(result["wiring_provider_literal_row_count"], 1)
        self.assertEqual(result["wiring_provider_literal_hit_count"], 6)
        self.assertEqual({item["field"] for item in result["failures"]}, {
            "ui_location", "evidence_required", "acceptance_checks[0]", "acceptance_checks[1]",
        })

    def test_literal_scan_preserves_non_generic_rows_and_allowed_word_boundaries(self):
        self.entries["provider.action"] = {
            "ui_command_id": "cmd.github.action", "ui_location": "GitHub > pull requests",
        }
        self.entries["review.create"]["ui_location"] = "Actions & Pipelines > Origin > githubish"
        self.assertEqual(self.validate()["failures"], [])

    def test_null_review_vocabulary_is_unavailable_without_blank_label(self):
        result = self.validate()
        self.assertEqual(result["failures"], [])
        self.assertEqual(result["rendered_vocabulary_labels"]["review.create"], ["Create merge request", "Create pull request"])
        self.assertEqual(result["unavailable_vocabulary_profiles"]["review.create"], ["generic_git"])
        self.assertEqual(result["vocabulary_review_profile_count"], 2)

    def test_only_null_profiles_are_unavailable_without_missing_fixture_failure(self):
        self.fixtures = fixtures({"profile_id": "generic_git", "review_vocabulary": None})
        result = self.validate()
        self.assertEqual(result["failures"], [])
        self.assertEqual(result["rendered_vocabulary_labels"]["review.create"], [])
        self.assertEqual(result["unavailable_vocabulary_profiles"]["review.create"], ["generic_git"])

    def test_missing_or_invalid_display_noun_is_unsupported(self):
        for profile in (
            {"profile_id": "unsupported"},
            {"profile_id": "unsupported", "review_vocabulary": ""},
            {"profile_id": "unsupported", "review_vocabulary": "  "},
            {"profile_id": "unsupported", "review_vocabulary": []},
        ):
            with self.subTest(profile=profile):
                self.fixtures = fixtures(profile)
                result = self.validate()
                self.assertEqual(result["failures"][0]["error"], "wiring_vocabulary_unsupported_noun")
                self.assertEqual(result["failures"][0]["profile_id"], "unsupported")
                self.assertEqual(result["failures"][0]["noun_field"], "review_noun")
                self.assertEqual(result["unavailable_vocabulary_profiles"]["review.create"], [])
                self.assertEqual(result["rendered_vocabulary_labels"]["review.create"], [])

    def test_absent_review_fixture_profiles_fail(self):
        for value in ({}, {"valid": []}, fixtures(), {"valid": [{"definition": "unrelated", "value": {"profiles": [{"review_vocabulary": "Pull request"}]}}]}):
            with self.subTest(fixtures=value):
                self.fixtures = value
                self.assertIn("wiring_vocabulary_missing_review_fixtures", self.error_codes())

    def test_provider_names_in_rendered_vocabulary_fail(self):
        self.fixtures = fixtures({"profile_id": "bad", "review_vocabulary": "GitHub review"})
        self.assertIn("wiring_vocabulary_rendered_provider_name", self.error_codes())

    def test_review_display_labels_are_deduplicated_and_sorted_per_row(self):
        self.fixtures["valid"][0]["value"]["profiles"].append({"profile_id": "github_enterprise", "review_vocabulary": "Pull request"})
        self.entries["review.merge"] = review_row("cmd.forge.review.merge")
        self.entries["review.merge"]["vocabulary"]["label_template"] = "Merge {noun}"
        result = self.validate()
        self.assertEqual(result["failures"], [])
        self.assertEqual(result["rendered_vocabulary_labels"], {
            "review.create": ["Create merge request", "Create pull request"],
            "review.merge": ["Merge merge request", "Merge pull request"],
        })
        self.assertEqual(result["vocabulary_review_profile_count"], 3)

    def test_pipeline_requires_display_fixtures_not_review_or_adapter_enum_tokens(self):
        self.entries = {"pipeline.run": {
            "ui_command_id": "cmd.forge.pipeline.run",
            "vocabulary": {"noun_source": "selected_automation_binding_adapter", "noun_field": "pipeline_noun", "label_template": "Run {noun}"},
        }}
        self.fixtures["valid"].append({"definition": "provider_adapter_profile", "value": {"pipeline_noun": "actions"}})
        self.fixtures["valid"][0]["value"]["profiles"][0]["automation_service"] = "GitHub Actions"
        result = self.validate()
        self.assertEqual({item["error"] for item in result["failures"]}, {"wiring_vocabulary_missing_pipeline_fixtures"})
        self.assertEqual(result["rendered_vocabulary_labels"]["pipeline.run"], [])

    def test_helper_does_not_read_files_or_mutate_inputs(self):
        before = copy.deepcopy((self.entries, self.fixtures))
        with mock.patch.object(validator, "load_json", side_effect=AssertionError("unexpected read")), mock.patch.object(Path, "read_text", side_effect=AssertionError("unexpected read")):
            result = self.validate()
        self.assertEqual(result["failures"], [])
        self.assertEqual((self.entries, self.fixtures), before)

    def test_live_wiring_matrix_passes(self):
        report = validator.cmd_validate_wiring_matrix(argparse.Namespace())
        self.assertEqual(report["status"], "pass", report["failures"])
        for key in ("catalog.forge_review_create", "catalog.forge_review_merge"):
            self.assertIn(key, report["rendered_vocabulary_labels"])
            self.assertEqual(report["unavailable_vocabulary_profiles"][key], ["generic_git"])


if __name__ == "__main__":
    unittest.main()
