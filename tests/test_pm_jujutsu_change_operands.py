"""Static composition tests only; callback doubles are NOT native JJ proof."""
import copy
import importlib.util
import json
import os
from pathlib import Path
import sys
import unittest
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
CANON = Path(os.environ.get("JJ_CANON_ROOT", ROOT))
sys.path[:0] = [str(ROOT / "scripts"), str(CANON / "scripts")]
from pm_jujutsu_change_operands import (operand_semantic_failures, validate_request,
                                       validate_result)

def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class Operands(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads((ROOT / "Plans/jujutsu_change_operand_contracts.schema.json").read_text())
        cls.fixtures = json.loads((ROOT / "Plans/jujutsu_change_operand_contract_fixtures.json").read_text())
        cls.values = {v["name"]: v["value"] for v in cls.fixtures["valid"]}
        cls.gate = load(CANON / "scripts/pm-new-contracts-verify.py", "jj_operand_legacy_gate")
        cls.registry = Registry()
        for path in ("jujutsu_integration_contracts.schema.json",
                     "source_control_contracts.schema.json",
                     "backup_restore_system_contracts.schema.json"):
            s = json.loads((CANON / "Plans" / path).read_text())
            cls.registry = cls.registry.with_resource(s["$id"], Resource.from_contents(s))
        cls.registry = cls.registry.with_resource(cls.schema["$id"], Resource.from_contents(cls.schema))

    def structural(self, definition, value):
        schema = {"$schema": self.schema["$schema"], "$ref": self.schema["$id"] + "#/$defs/" + definition}
        return [e.message for e in Draft202012Validator(schema, registry=self.registry,
                                                       format_checker=FormatChecker()).iter_errors(value)]

    def legacy(self, definition, value):
        return self.gate.jujutsu_semantic_failures(definition, value)

    def value(self, name):
        return copy.deepcopy(self.values[name])

    def request_check(self, request, preview=None, native=lambda *a: []):
        return validate_request(request, preview, structural_errors=self.structural,
                                legacy_semantics=self.legacy, authenticate_request=native)

    def result_check(self, original, binding, native=lambda *a: [], disclosure=lambda *a: []):
        return validate_result(original, binding, structural_errors=self.structural,
                               legacy_semantics=self.legacy, authenticate_result=native,
                               final_disclosure=disclosure)

    def test_pair_positives_and_semantic_only_negatives(self):
        for fixture in self.fixtures["valid"]:
            with self.subTest(name=fixture["name"]):
                self.assertEqual(self.structural(fixture["definition"], fixture["value"]), [])
                self.assertEqual(operand_semantic_failures(fixture["definition"], fixture["value"]), [])
        for fixture in self.fixtures["invalid"]:
            with self.subTest(name=fixture["name"]):
                self.assertEqual(self.structural(fixture["definition"], fixture["value"]), [])
                self.assertEqual(operand_semantic_failures(fixture["definition"], fixture["value"]),
                                 [fixture["expected_failure"]])

    def test_actual_typed_v1_composition_all_five(self):
        for kind in ("describe", "new", "squash", "rebase", "abandon"):
            q = self.value("request_" + kind)
            p = self.value("preview_" + kind) if kind in {"squash", "rebase", "abandon"} else None
            self.assertEqual(self.request_check(q, p), [])
            self.assertEqual(self.result_check(q, self.value("result_" + kind)), [])

    def test_each_exact_operand_change_requires_native_original_choice_admission(self):
        mutations = {
            "describe": lambda s: s.update(description=s["description"].strip()),
            "new": lambda s: s["parents"][1].update(commit_id="commit:substituted"),
            "squash": lambda s: s["source_changes"][1].update(commit_id="commit:substituted"),
            "rebase": lambda s: s["changes"][1].update(commit_id="commit:substituted"),
            "abandon": lambda s: s["change_ids"][1].update(commit_id="commit:substituted"),
        }
        for kind, mutate in mutations.items():
            original = self.value("request_" + kind)
            q = copy.deepcopy(original)
            mutate(q["selection"])
            p = self.value("preview_" + kind) if kind in {"squash", "rebase", "abandon"} else None
            self.assertEqual(self.structural("command_request_v2", q), [])
            if p:
                self.assertIn("preview_selection_mismatch", self.request_check(q, p))
                # Even forged matching previews never substitute for owner issuance.
                p["selection"] = copy.deepcopy(q["selection"])
            def native(request, preview):
                return [] if request == original else ["native_original_choice_mismatch"]
            self.assertEqual(self.request_check(q, p, native), ["native_original_choice_mismatch"])

    def test_preview_wrong_context_and_ref_are_structurally_valid(self):
        for field, val in (("repository_context_ref", "repository:other"),
                           ("command_instance_id", "command:other"), ("preview_ref", "preview:other")):
            p = self.value("preview_rebase")
            p[field] = val
            self.assertEqual(self.structural("selection_preview_v2", p), [])
            self.assertIn("preview_" + field + "_mismatch",
                          self.request_check(self.value("request_rebase"), p))

    def test_original_request_echo_not_authority(self):
        binding = self.value("result_describe")
        original = copy.deepcopy(binding["original_request"])
        binding["original_request"]["selection"]["description"] = "substitute"
        self.assertEqual(self.structural("command_result_binding_v2", binding), [])
        self.assertIn("original_request_mismatch", self.result_check(original, binding))

    def test_native_fence_and_final_current_disclosure_are_mandatory(self):
        q = self.value("request_abandon")
        self.assertEqual(self.request_check(q, self.value("preview_abandon"),
                                          lambda *a: ["native_confirmation_stale"]),
                         ["native_confirmation_stale"])
        b = self.value("result_abandon")
        calls = []
        def native(*args):
            calls.append("owner")
            return []
        def final(*args):
            calls.append("current-disclosure")
            return ["disclosure_revoked"]
        self.assertEqual(self.result_check(q, b, native, final), ["disclosure_revoked"])
        self.assertEqual(calls, ["owner", "current-disclosure"])
        self.assertEqual(self.result_check(q, b, lambda *a: ["native_receipt_untrusted"]),
                         ["native_receipt_untrusted"])

    def test_empty_and_whitespace_descriptions_preserved(self):
        for text in ("", "  ", "\ntext\n"):
            q = self.value("request_describe")
            q["selection"]["description"] = text
            seen = []
            self.assertEqual(self.request_check(q, native=lambda req, p: seen.append(req) or []), [])
            self.assertEqual(seen[0]["selection"]["description"], text)

    def test_missing_operands_closed_shape_and_v1_not_current(self):
        for kind in ("describe", "new", "squash", "rebase", "abandon"):
            q = self.value("request_" + kind)
            self.assertTrue(self.structural("command_request_v2", q["authority"]))
            for key in list(q["selection"]):
                bad = copy.deepcopy(q)
                del bad["selection"][key]
                self.assertTrue(self.request_check(bad))
        q = self.value("request_describe")
        q["selection"]["payload"] = {}
        self.assertTrue(self.request_check(q))

    def test_currentness_and_permission_guards_preserved(self):
        q = self.value("request_describe")
        q["authority"]["permission"]["decision"] = "deny"
        # Existing closed v1 envelope, not replacement synthetic authorization.
        self.assertTrue(self.request_check(q))
        q = self.value("request_describe")
        self.assertEqual(self.request_check(q, native=lambda *a: ["native_permission_denied"]),
                         ["native_permission_denied"])
        q = self.value("request_new")
        q["authority"]["currentness"]["expected_operation_id"] = "operation:other"
        self.assertIn("operand_expected_operation_mismatch", self.request_check(q))

    def test_nonterminal_accepted_never_manufactures_receipt(self):
        b = self.value("result_rebase")
        b["owner_result"].update(outcome="accepted", receipt_ref=None)
        b["operation_receipt"] = None
        self.assertEqual(self.result_check(b["original_request"], b), [])
        b["owner_result"]["outcome"] = "succeeded"
        self.assertTrue(self.result_check(b["original_request"], b))

    def test_legacy_fixtures_still_validate_without_rewriting(self):
        fixtures = json.loads((CANON / "Plans/jujutsu_integration_contract_fixtures.json").read_text())
        for x in fixtures["valid"]:
            self.assertEqual(self.legacy(x["definition"], x["value"]), [])

    def test_five_public_consumers_and_no_other_jj_request_change(self):
        kinds = {"describe", "new", "squash", "rebase", "abandon"}
        current = "Plans/jujutsu_change_operand_contracts.schema.json#/$defs/command_request_v2"
        historical = "Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request"
        wiring = json.loads((CANON / "Plans/Wiring_Matrix.production.json").read_text())["entries"]
        for kind in kinds:
            self.assertEqual(wiring["catalog.jujutsu_change_" + kind]["request_schema_ref"], current)
        self.assertEqual(wiring["catalog.jujutsu_change_split"]["request_schema_ref"], historical)
        touch = json.loads((CANON / "Plans/touch_closure.json").read_text())
        selected = [row for row in touch["rows"] if row[1] == "TCP-JJ-OPERANDS"]
        self.assertEqual({row[3] for row in selected}, {"cmd.jujutsu.change." + k for k in kinds})
        self.assertEqual(len(selected), 5)
        profile = next(p for p in touch["profiles"] if p["profile_id"] == "TCP-JJ-OPERANDS")
        self.assertEqual(profile["payload_schema_ref"], current)

    def test_central_semantics_enrollment_keeps_all_negative_keys(self):
        schema = "Plans/jujutsu_change_operand_contracts.schema.json"
        self.assertEqual(self.gate.CONTRACT_PAIRS.count(
            (schema, "Plans/jujutsu_change_operand_contract_fixtures.json")), 1)
        for row in self.fixtures["invalid"]:
            self.assertIn(row["semantic_rule"],
                          self.gate.contract_semantic_failures(schema, row["definition"], row["value"]))

    def test_request_auth_cannot_substitute_original_after_checks(self):
        q = self.value("request_describe")
        def mutate(*args):
            q["selection"]["description"] = "substituted"
            return []
        self.assertIn("request_inputs_mutated", self.request_check(q, native=mutate))

    def test_result_final_disclosure_cannot_substitute_original_or_result(self):
        for which in ("original", "binding"):
            q, b = self.value("request_describe"), self.value("result_describe")
            def mutate(*args):
                if which == "original":
                    q["selection"]["description"] = "substituted"
                else:
                    b["owner_result"]["receipt_ref"] = "receipt:foreign"
                return []
            self.assertIn("result_inputs_mutated", self.result_check(q, b, disclosure=mutate))

    def test_callback_shapes_exceptions_and_argument_mutation_fail_closed(self):
        for answer in (None, False, True, "", {}, [False], [""]):
            q = self.value("request_describe")
            self.assertEqual(self.request_check(q, native=lambda *a: answer),
                             ["callback_contract_invalid:authenticate_request"])
        def mutate(req, preview):
            req["selection"]["description"] = "substituted"
            return []
        self.assertEqual(self.request_check(self.value("request_describe"), native=mutate),
                         ["callback_arguments_mutated:authenticate_request"])
        def throws(*args):
            raise RuntimeError("private message must not leak")
        self.assertEqual(self.request_check(self.value("request_describe"), native=throws),
                         ["callback_exception:authenticate_request:RuntimeError"])


if __name__ == "__main__":
    unittest.main()
