"""Touch must select the protected composition, not its permissive base type."""

import copy
import importlib.util
import json
from pathlib import Path
import unittest
from unittest import mock

from jsonschema import Draft202012Validator
from referencing import Registry, Resource


ROOT = Path(__file__).resolve().parents[1]


def load_json(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


class ProtectedAuthTouchTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = importlib.util.spec_from_file_location("touch", ROOT / "scripts/pm-touch-closure-verify.py")
        cls.checker = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.checker)
        cls.touch = load_json("Plans/touch_closure.json")
        cls.cases = load_json("Plans/shared_integration_runtime_expansion_fixtures.json")["local_action_cases"]
        cls.protected = {"ui.auth_session." + action for action in
                         ("close_secure_browser", "copy_device_code", "open_details")}
        cls.flags = {"human_only": True, "content_recording_allowed": False,
                     "content_inspection_allowed": False, "agent_access_allowed": False,
                     "adapter_access_allowed": False, "persistence_allowed": False,
                     "protected_content_exposed": False}

    def selected_validator(self, action, field):
        row = next(r for r in self.touch["rows"] if r[3] == action)
        profile = next(p for p in self.touch["profiles"] if p["profile_id"] == row[1])
        path, pointer = profile[field].split("#", 1)
        schema = load_json(path)
        selected = self.checker.resolve_json_pointer(schema, pointer)
        expansion = load_json("Plans/shared_integration_runtime_expansion_contracts.schema.json")
        def refuse_network(uri):
            raise ValueError(f"Unregistered schema URI: {uri}")
        registry = Registry(retrieve=refuse_network).with_resource(
            expansion["$id"], Resource.from_contents(expansion))
        return Draft202012Validator({**selected, "$defs": schema["$defs"]}, registry=registry)

    def test_exact_profile_guard_passes_and_is_called_by_full_verifier(self):
        self.assertEqual(self.checker.protected_auth_local_reference_failures(self.touch), [])
        with mock.patch.object(self.checker, "protected_auth_local_reference_failures",
                               return_value=["protected guard sentinel"]) as guard:
            failures, _ = self.checker.verify()
        guard.assert_called_once()
        self.assertIn("protected guard sentinel", failures)

    def test_three_valid_requests_and_three_results_use_effective_touch_refs(self):
        cases = [c for c in self.cases if c["action_id"] in self.protected]
        self.assertEqual(len(cases), 3)
        with mock.patch("urllib.request.urlopen", side_effect=AssertionError("network forbidden")):
            for case in cases:
                for key, field in (("request", "payload_schema_ref"), ("result", "result_schema_ref")):
                    with self.subTest(action=case["action_id"], key=key):
                        validator = self.selected_validator(case["action_id"], field)
                        self.assertEqual(list(validator.iter_errors(case[key])), [])

    def test_each_forbidden_boolean_and_each_omission_rejected_for_all_six_records(self):
        checks = 0
        for case in self.cases:
            if case["action_id"] not in self.protected:
                continue
            for key, field in (("request", "payload_schema_ref"), ("result", "result_schema_ref")):
                validator = self.selected_validator(case["action_id"], field)
                for flag, required_value in self.flags.items():
                    for mode in ("forbidden", "omitted"):
                        with self.subTest(action=case["action_id"], key=key, flag=flag, mode=mode):
                            value = copy.deepcopy(case[key])
                            if mode == "forbidden":
                                value[flag] = not required_value
                            else:
                                del value[flag]
                            self.assertFalse(validator.is_valid(value))
                            checks += 1
        self.assertEqual(checks, 84)

    def test_eleven_non_auth_actions_keep_generic_contract_and_accept_all_22_records(self):
        cases = [c for c in self.cases if c["action_id"] not in self.protected]
        self.assertEqual(len(cases), 11)
        for case in cases:
            row = next(r for r in self.touch["rows"] if r[3] == case["action_id"])
            self.assertEqual(row[1], "TCP-SIR-GAP-LOCAL")
            for key, field in (("request", "payload_schema_ref"), ("result", "result_schema_ref")):
                with self.subTest(action=case["action_id"], key=key):
                    self.assertTrue(self.selected_validator(case["action_id"], field).is_valid(case[key]))

    def test_generic_rebinding_reproduces_the_original_acceptance_hole(self):
        changed = copy.deepcopy(self.touch)
        for row in changed["rows"]:
            if row[3] in self.protected:
                row[1] = "TCP-SIR-GAP-LOCAL"
        with mock.patch.object(self, "touch", changed):
            for case in self.cases:
                if case["action_id"] not in self.protected:
                    continue
                for key, field in (("request", "payload_schema_ref"), ("result", "result_schema_ref")):
                    validator = self.selected_validator(case["action_id"], field)
                    for flag, required_value in self.flags.items():
                        value = copy.deepcopy(case[key])
                        value[flag] = not required_value
                        self.assertTrue(validator.is_valid(value))
                        del value[flag]
                        self.assertTrue(validator.is_valid(value))
        self.assertTrue(self.checker.protected_auth_local_reference_failures(changed))

    def test_guard_rejects_generic_rebinding_extra_action_identity_and_ref_drift(self):
        changes = []
        for index in (0, 1, 2, 3, 4):
            changed = copy.deepcopy(self.touch)
            row = next(r for r in changed["rows"] if r[3] == "ui.auth_session.open_details")
            row[index] = "wrong"
            changes.append(changed)
        for field in ("payload_schema_ref", "result_schema_ref", "error_schema_ref", "receipt_refs",
                      "permission_gate", "gui_triggers", "reverse_consumers"):
            changed = copy.deepcopy(self.touch)
            profile = next(p for p in changed["profiles"] if p["profile_id"] == "TCP-PROTECTED-AUTH-LOCAL")
            profile[field] = [] if isinstance(profile[field], list) else "wrong"
            changes.append(changed)
        changed = copy.deepcopy(self.touch)
        next(r for r in changed["rows"] if r[1] == "TCP-SIR-GAP-LOCAL")[1] = "TCP-PROTECTED-AUTH-LOCAL"
        changes.append(changed)
        for changed in changes:
            self.assertTrue(self.checker.protected_auth_local_reference_failures(changed))


if __name__ == "__main__":
    unittest.main()
