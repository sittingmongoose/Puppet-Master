import copy
import importlib.util
import json
import unittest
from pathlib import Path
from unittest.mock import patch

from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts/pm-protected-auth-browser-contracts.py"


def load_module():
    spec = importlib.util.spec_from_file_location("pm_protected_auth_browser_contracts", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class ProtectedAuthBrowserContractsTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.module = load_module()
        cls.schema = json.loads(
            (ROOT / "Plans/protected_auth_browser_contracts.schema.json").read_text(
                encoding="utf-8"
            )
        )
        cls.fixtures = json.loads(cls.module.FIXTURE_PATH.read_text(encoding="utf-8"))

    def test_schema_is_valid_draft_2020_12(self) -> None:
        Draft202012Validator.check_schema(self.schema)

    def test_positive_negative_and_cross_schema_matrix(self) -> None:
        report = self.module.validate()
        self.assertTrue(report["passed"], report["failures"])
        self.assertEqual(report["valid_fixture_count"], 19)
        self.assertEqual(report["invalid_fixture_count"], 27)
        self.assertEqual(report["cross_schema_rejection_count"], 3)
        self.assertEqual(report["cross_schema_positive_control_count"], 3)

    def report_with_fixtures(self, fixtures):
        original_read = self.module.read_json
        with patch.object(
            self.module, "read_json",
            side_effect=lambda path: fixtures if path == self.module.FIXTURE_PATH else original_read(path),
        ):
            return self.module.validate()

    def test_named_local_actions_are_checked_against_the_declared_definition(self):
        local = [fixture for fixture in self.fixtures["valid"]
                 if fixture.get("definition", "").startswith("ProtectedAuthLocalAction")]
        self.assertEqual(len(local), 6)
        # Root rejection alone cannot prove a malformed local request/result is
        # rejected by its actual owner contract. Positive controls must pass it.
        for fixture in local:
            with self.subTest(fixture=fixture["name"]):
                self.assertFalse(Draft202012Validator(self.schema).is_valid(fixture["value"]))
                report = self.report_with_fixtures({"valid": [fixture], "invalid": []})
                self.assertTrue(report["passed"], report["failures"])
                report = self.report_with_fixtures({"valid": [], "invalid": [fixture]})
                self.assertFalse(report["passed"])
                self.assertEqual(report["failures"][0]["fixture"], fixture["name"])
                self.assertEqual(report["failures"][0]["expected"], "invalid")

    def test_missing_or_malformed_definition_never_counts_as_negative_rejection(self):
        original = next(fixture for fixture in self.fixtures["valid"]
                        if fixture.get("definition") == "ProtectedAuthLocalActionRequest")
        for definition in ["MissingDefinition", "", None, [], {}]:
            for group in ["valid", "invalid"]:
                with self.subTest(definition=definition, group=group):
                    fixture = copy.deepcopy(original)
                    fixture["definition"] = definition
                    fixtures = {"valid": [], "invalid": []}
                    fixtures[group] = [fixture]
                    report = self.report_with_fixtures(fixtures)
                    self.assertFalse(report["passed"])
                    self.assertEqual(report["failures"][0]["expected"], "resolvable_fixture_schema")

    def test_unregistered_external_schema_is_reported_without_network_access(self):
        fixture = next(fixture for fixture in self.fixtures["valid"]
                       if fixture.get("definition") == "ProtectedAuthLocalActionRequest")
        schema = copy.deepcopy(self.schema)
        schema["$defs"]["ProtectedAuthLocalActionRequest"]["allOf"][0]["$ref"] = (
            "https://unregistered.invalid/forbidden.schema.json"
        )
        original_read = self.module.read_json
        for group in ["valid", "invalid"]:
            with self.subTest(group=group):
                fixtures = {"valid": [], "invalid": []}
                fixtures[group] = [fixture]
                with patch.object(self.module, "read_json", side_effect=lambda path: (
                    schema if path == self.module.SCHEMA_PATH else fixtures
                    if path == self.module.FIXTURE_PATH else original_read(path)
                )), patch("urllib.request.urlopen", side_effect=AssertionError("network forbidden")) as network:
                    report = self.module.validate()
                network.assert_not_called()
                self.assertFalse(report["passed"])
                self.assertEqual(report["failures"][0]["expected"], "resolvable_fixture_schema")

    def test_cross_schema_discriminator_ablation_is_detected(self):
        self.assert_cross_schema_mutation_detected("remove_security_fence", "protected_auth_rejected")

    def test_cross_schema_unrelated_rejection_is_not_proof(self):
        self.assert_cross_schema_mutation_detected("reject_ordinary_control", "ordinary_positive_control_valid")

    def assert_cross_schema_mutation_detected(self, mode, expected):
        for filename, definition in [
            ("web_operation_contracts.schema.json", "BrowserSession"),
            ("runtime_artifact_browser_recording.schema.json", "BrowserRecordingPayload"),
            ("gui_automation_manifest.schema.json", "TestingBrowserManifest"),
        ]:
            with self.subTest(schema=filename, mode=mode):
                path = self.module.PLANS / filename
                original_read = self.module.read_json
                schema = copy.deepcopy(original_read(path))
                selected = schema["$defs"][definition]
                if mode == "remove_security_fence":
                    # Keep the session_class restriction: the security fence
                    # must be tested independently of that other discriminator.
                    selected["properties"]["session_security_class"] = {"type": "string"}
                else:
                    selected["required"].append("invented_required_field")
                with patch.object(self.module, "read_json", side_effect=lambda candidate: (
                    schema if candidate == path else original_read(candidate)
                )):
                    report = self.module.validate()
                self.assertFalse(report["passed"])
                self.assertTrue(any(
                    row["fixture"] == f"{filename}#{definition}" and row["expected"] == expected
                    for row in report["failures"]
                ), report["failures"])

    def test_protected_lifecycle_shape_has_no_content_fields(self) -> None:
        properties = self.schema["$defs"][
            "protected_auth_browser_lifecycle_projection"
        ]["properties"]
        forbidden = {
            "url",
            "active_url",
            "title",
            "dom",
            "page_representation_ref",
            "console_ref",
            "network_ref",
            "screenshot_ref",
            "recording_ref",
            "storage_state_ref",
            "clipboard_ref",
            "artifact_refs",
            "profile_path",
            "cookie_ref",
        }
        self.assertFalse(forbidden.intersection(properties))


if __name__ == "__main__":
    unittest.main()
