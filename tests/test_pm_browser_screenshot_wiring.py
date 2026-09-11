"""RAP-054 / Event Authority admission remains pending; static intent only.

Schema fixtures prove shape, not real owner-resolved IDs, native capture,
persistence authorization, or retention execution. Native handlers remain absent.
"""

import ast
import copy
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]
SCHEMA_REF = "Plans/runtime_artifact_screenshot.schema.json"
OWNER_REF = "Plans/Runtime_Artifacts_Panel.md#RAP-054"
EXPECTED = {
    "add_selection_screenshot_to_chat": ["browser.context_captured", "runtime_artifact.screenshot"],
    "add_selection_full_screenshot_to_chat": ["browser.context_captured", "runtime_artifact.screenshot"],
    "add_screenshot_to_chat": ["runtime_artifact.screenshot"],
    "add_full_screenshot_to_chat": ["runtime_artifact.screenshot"],
}


class BrowserScreenshotWiringTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.entries = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())["entries"]
        cls.catalog = (ROOT / "Plans/UI_Command_Catalog.md").read_text()
        cls.schema = json.loads((ROOT / SCHEMA_REF).read_text())

    def test_existing_four_commands_keep_their_handlers_and_exact_owner_event_intent(self):
        for suffix, expected in EXPECTED.items():
            with self.subTest(command=suffix):
                row = self.entries["catalog.browser_" + suffix]
                self.assertEqual(row["ui_command_id"], "cmd.browser." + suffix)
                self.assertEqual(row["handler_location"], "handlers::browser::" + suffix)
                self.assertEqual(row["expected_event_types"], expected)
                refs = row["effect_contract"]["receipt_or_event_refs"]
                for ref in [*expected, OWNER_REF, SCHEMA_REF]:
                    self.assertIn(ref, refs)
                self.assertNotIn("runtime_artifact.created", json.dumps(row))

    def test_active_catalog_rows_do_not_require_the_forbidden_generic_event(self):
        for suffix in EXPECTED:
            with self.subTest(command=suffix):
                rows = [line for line in self.catalog.splitlines()
                        if line.startswith("| `cmd.browser." + suffix + "` |")]
                self.assertEqual(len(rows), 1)
                self.assertIn("runtime_artifact.screenshot", rows[0])
                self.assertNotIn("runtime_artifact.created", rows[0])

    def test_verifier_requires_the_same_exact_screenshot_event_intent(self):
        module = ast.parse((ROOT / "scripts/pm-plans-verify.py").read_text())
        assignments = [node for node in module.body if isinstance(node, ast.Assign)
                       and any(isinstance(target, ast.Name)
                               and target.id == "BROWSER_COMMAND_EXPECTED_EVENTS"
                               for target in node.targets)]
        self.assertEqual(len(assignments), 1)
        expected_events = ast.literal_eval(assignments[0].value)
        for suffix, expected in EXPECTED.items():
            with self.subTest(command=suffix):
                self.assertEqual(expected_events["cmd.browser." + suffix], expected)

    def test_pending_admission_and_actual_capture_lineage_remain_explicit(self):
        for suffix in EXPECTED:
            with self.subTest(command=suffix):
                row = self.entries["catalog.browser_" + suffix]
                requirements = " ".join(row["acceptance_checks"] + row["event_test_requirements"])
                for token in ("RAP-054", "Event Authority admission remains pending",
                              "project_id", "run_id", "attempt_id", "protected browser/auth",
                              "native handlers remain absent", "do not fabricate IDs",
                              "persist or emit events", "advance checkpoints",
                              "claim successful capture", "shape is not proof"):
                    self.assertIn(token.lower(), requirements.lower())
                self.assertIn("handler_unavailable", requirements)

    def test_owner_payload_requires_lineage_fields_and_rejects_inline_pixels(self):
        self.assertEqual(self.schema["$id"], "pm.runtime_artifact.screenshot.schema.v1")
        validator = Draft202012Validator(self.schema)
        value = {
            "schema_id": self.schema["$id"], "artifact_id": "artifact:fixture:screenshot",
            "artifact_type": "screenshot", "project_id": "project:fixture",
            "run_id": "run:fixture", "attempt_id": "attempt:fixture",
            "created_at_utc": "2026-09-11T00:00:00Z",
            "projection_freshness": "current", "projection_health": "healthy",
            "retention_class": "fixture_only_not_a_policy_assignment",
            "routing_refs": ["route:fixture:screenshot"],
            "type_payload": {"media_ref": "media:fixture:screenshot"},
        }
        validator.validate(value)
        for field in ("project_id", "run_id", "attempt_id"):
            with self.subTest(missing=field):
                invalid = copy.deepcopy(value)
                del invalid[field]
                self.assertFalse(validator.is_valid(invalid))
        for field in ("raw_pixels", "raw_secret", "artifact_subtype"):
            with self.subTest(forbidden=field):
                invalid = copy.deepcopy(value)
                invalid["type_payload"][field] = "synthetic-test-value"
                self.assertFalse(validator.is_valid(invalid))


if __name__ == "__main__":
    unittest.main()
