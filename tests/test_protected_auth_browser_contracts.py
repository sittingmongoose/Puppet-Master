import importlib.util
import json
import unittest
from pathlib import Path

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

    def test_schema_is_valid_draft_2020_12(self) -> None:
        Draft202012Validator.check_schema(self.schema)

    def test_positive_negative_and_cross_schema_matrix(self) -> None:
        report = self.module.validate()
        self.assertTrue(report["passed"], report["failures"])
        self.assertEqual(report["valid_fixture_count"], 3)
        self.assertGreaterEqual(report["invalid_fixture_count"], 5)
        self.assertEqual(report["cross_schema_rejection_count"], 3)

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
