"""Existing select and lifecycle routes must not share select-only types."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SELECT = "cmd.installation.select"
LIFECYCLE = {"cmd.installation." + name for name in
             ("install", "update", "repair", "rollback", "verify")}


def load(path):
    return json.loads((ROOT / path).read_text())


def mappings(value):
    result = {}
    for clause in value.split("; "):
        if " -> " not in clause:
            raise AssertionError("profile reference is not qualified by action")
        commands, ref = clause.split(" -> ", 1)
        for command in commands.split(", "):
            if command in result:
                raise AssertionError("duplicate command mapping")
            result[command] = ref
    return result


class InstallationProfileMapping(unittest.TestCase):
    def test_exact_action_qualified_existing_refs(self):
        closure = load("Plans/touch_closure.json")
        profile = next(p for p in closure["profiles"] if p["profile_id"] == "TCP-INSTALL")
        wiring = load("Plans/Wiring_Matrix.production.json")["entries"]
        specs = {
            "payload_schema_ref": ("InstallationSelectCommandRequest", "installation_lifecycle_command_request", "request_schema_ref"),
            "result_schema_ref": ("InstallationSelectCommandResult", "installation_lifecycle_command_result", "result_schema_ref"),
            "error_schema_ref": ("InstallationSelectCommandError", "command_error", None),
        }
        for field, (selected, lifecycle, wiring_field) in specs.items():
            actual = mappings(profile[field])
            self.assertEqual(set(actual), LIFECYCLE | {SELECT})
            for action, ref in actual.items():
                expected = ("Plans/shared_integration_runtime.schema.json#/$defs/" + selected
                            if action == SELECT else
                            "Plans/shared_runtime_command_contracts.schema.json#/$defs/" + lifecycle)
                self.assertEqual(ref, expected)
                path, pointer = ref.split("#", 1)
                value = load(path)
                for token in pointer.strip("/").split("/"):
                    value = value[token]
                self.assertIsInstance(value, dict)
                if wiring_field:
                    rows = [row for row in wiring.values() if row.get("ui_command_id") == action]
                    self.assertEqual(len(rows), 1)
                    self.assertEqual(rows[0][wiring_field], ref)
        self.assertEqual(profile["handler_status"], "specified")
        rows = [row for row in closure["rows"] if row[1] == "TCP-INSTALL"]
        self.assertEqual({row[3] for row in rows}, LIFECYCLE | {SELECT})
        self.assertTrue(all(row[4] == "partial" for row in rows))
        self.assertIn("permission_snapshot_ref", profile["permission_gate"])
        self.assertIn("explicit user acquisition", profile["permission_gate"])
        self.assertIn("not InstallationSelectAvailability", profile["availability_rule"])


if __name__ == "__main__":
    unittest.main()
