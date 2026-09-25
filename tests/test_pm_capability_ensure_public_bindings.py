"""Static public-route/owner composition; synthetic fixtures are not native proof."""
from copy import deepcopy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_capability_ensure_custody as CAP
import pm_ui_command_response as UI

BASE = "35c47d751ac87c7467818864ea270785fb537d32"
SCHEMA = "Plans/capability_ensure_custody_contracts.schema.json"
FIXTURES = "Plans/capability_ensure_custody_contract_fixtures.json"
REQUEST = SCHEMA + "#/$defs/capability_ensure_request_v2"
RESULT = SCHEMA + "#/$defs/capability_ensure_result_v2"


def shared_binding_validator():
    spec = importlib.util.spec_from_file_location(
        "shared_binding_check", ROOT / "scripts/pm-shared-runtime-command-contracts.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class CapabilityEnsurePublicBindings(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pack = json.loads((ROOT / FIXTURES).read_text())

    def test_exact_current_public_routes_and_handler(self):
        wiring = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())
        row = wiring["entries"]["catalog.capability_ensure"]
        self.assertEqual("cmd.capability.ensure", row["ui_command_id"])
        self.assertEqual(REQUEST, row["request_schema_ref"])
        self.assertEqual(RESULT, row["result_schema_ref"])
        for name in ("Commands_System.md", "UI_Command_Catalog.md"):
            rows = [line for line in (ROOT / "Plans" / name).read_text().splitlines()
                    if line.startswith("| `cmd.capability.ensure` |")]
            self.assertEqual(1, len(rows))
            self.assertIn(REQUEST, rows[0])
            self.assertIn(RESULT, rows[0])
            self.assertIn("handlers::capability::ensure", rows[0])

    def test_closed_manifest_enrolls_exact_pair_once(self):
        pairs = UI.contracts().CONTRACT_PAIRS
        self.assertEqual(1, pairs.count((SCHEMA, FIXTURES)))
        self.assertEqual([(SCHEMA, FIXTURES)], [p for p in pairs if p[0] == SCHEMA])
        # Test actual central semantic routing, not a separately copied predicate.
        for row in self.pack["valid"]:
            self.assertEqual([], UI.contracts().contract_semantic_failures(
                SCHEMA, row["definition"], deepcopy(row["value"])))

    def test_shared_runtime_binding_uses_same_current_successor(self):
        bindings = json.loads((ROOT / "Plans/shared_runtime_command_bindings.json").read_text())
        rows = [row for row in bindings["bindings"] if row["command_id"] == "cmd.capability.ensure"]
        self.assertEqual(1, len(rows))
        self.assertEqual(REQUEST, rows[0]["request_schema_ref"])
        self.assertEqual(RESULT, rows[0]["result_schema_ref"])
        self.assertEqual("handlers::capability::ensure", rows[0]["handler"])
        self.assertEqual("catalog.capability_ensure", rows[0]["wiring_entry_id"])

    def test_shared_binding_resolver_admits_only_exact_successor_pair(self):
        validator = shared_binding_validator()
        historical = json.loads((ROOT / "Plans/shared_runtime_command_contracts.schema.json").read_text())
        for ref in (REQUEST, RESULT):
            self.assertEqual(ref.split("/")[-1], validator.resolve_definition(ref, historical))
        for ref in (SCHEMA + "#/$defs/capability_provisioning_operation_v2",
                    SCHEMA + "#/$defs/not_a_definition",
                    "Plans/../Plans/capability_ensure_custody_contracts.schema.json#/$defs/capability_ensure_request_v2",
                    "https://example.invalid/schema#/$defs/capability_ensure_request_v2"):
            with self.subTest(ref=ref), self.assertRaises(ValueError):
                validator.resolve_definition(ref, historical)
        successor = json.loads((ROOT / SCHEMA).read_text())
        del successor["$defs"]["capability_ensure_request_v2"]
        with patch.object(validator, "read_json", return_value=successor), self.assertRaises(ValueError):
            validator.resolve_definition(REQUEST, historical)

    def test_central_entry_rejects_schema_valid_foreign_work_original(self):
        v = deepcopy(self.pack["valid"][2]["value"])
        v["work"]["identity"]["project_id"] = "project:foreign"
        v["result"]["work_record"] = CAP.binding(CAP.OwnerValue("work:1", 1, v["work"]))
        v["outcome"]["owner_result_sha256"] = CAP.digest(v["result"])
        self.assertEqual([], CAP.shape("capability_ensure_fixture", v))
        self.assertIn("shared_work_identity", UI.contracts().contract_semantic_failures(
            SCHEMA, "capability_ensure_fixture", v))

    def test_historical_owner_definitions_unchanged(self):
        definitions = {
            "shared_runtime_command_contracts.schema.json":
                ("capability_ensure_request", "capability_ensure_result"),
            "shared_runtime_contracts.schema.json":
                ("capability_provisioning_operation", "installation_lifecycle_record"),
        }
        for filename, names in definitions.items():
            original = json.loads(subprocess.check_output(
                ["git", "show", BASE + ":Plans/" + filename], cwd=ROOT, text=True))
            current = json.loads((ROOT / "Plans" / filename).read_text())
            for name in names:
                self.assertEqual(original["$defs"][name], current["$defs"][name], name)

    def test_central_typed_result_resolves_v2_and_rejects_wrong_definition(self):
        v = deepcopy(self.pack["valid"][0]["value"])
        binding = deepcopy(CAP.RESULT_ROUTE)
        self.assertTrue(UI.resolvable_owner_result(binding, v["result"]))
        for pointer in ("#/$defs/capability_ensure_request_v2",
                        "#/$defs/capability_provisioning_operation_v2",
                        "#/$defs/not_an_admitted_definition"):
            bad = dict(binding, json_pointer=pointer)
            self.assertFalse(UI.resolvable_owner_result(bad, v["result"]))
        old = dict(path="Plans/shared_runtime_command_contracts.schema.json",
                   json_pointer="#/$defs/capability_ensure_result",
                   schema_id="pm.shared_runtime.command_result.v1")
        self.assertFalse(UI.resolvable_owner_result(old, v["result"]))
        bad_value = deepcopy(v["result"])
        bad_value["schema_id"] = "pm.shared_runtime.command_result.v1"
        self.assertFalse(UI.resolvable_owner_result(binding, bad_value))

    def test_public_result_uses_real_original_composition_with_static_doubles(self):
        for row in self.pack["valid"]:
            v = deepcopy(row["value"])
            self.assertEqual([], CAP.validate_ensure_response(
                v["result"], "result:ensure", **CAP.fixture_dependencies(v)))
        v = deepcopy(self.pack["valid"][0]["value"])
        response = deepcopy(v["result"])
        response["schema_id"] = "pm.shared_runtime.command_result.v1"
        self.assertTrue(CAP.validate_ensure_response(
            response, "result:ensure", **CAP.fixture_dependencies(v)))


if __name__ == "__main__":
    unittest.main()
