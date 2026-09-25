"""Static Git-three contracts, not permission or native Git execution proof."""
from copy import deepcopy
import json
import importlib.util
import os
from pathlib import Path
import sys
import unittest
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_git_selected_three as m


class GitThree(unittest.TestCase):
    def setUp(self):
        self.fixtures = json.loads((ROOT / "Plans/git_selected_three_fixtures.json").read_text())
        self.cases = {x["name"]: x["value"] for x in self.fixtures["valid"]}

    def check(self, x):
        return m.result_failures(x["request"], x["result"], **m.fixture_dependencies(x))

    def test_all_three_positive(self):
        for x in self.cases.values():
            self.assertEqual(self.check(x), [])

    def test_fixture_pair_shape_and_semantics(self):
        for f in self.fixtures["valid"] + self.fixtures["invalid"]:
            self.assertEqual(m.shape_failures("fixture_case", f["value"]), [])
            errors = m.git_selected_semantic_failures("fixture_case", f["value"])
            if "expected_error" in f:
                self.assertIn(f["expected_error"], errors)
            else:
                self.assertEqual(errors, [])

    def test_real_central_fixture_selection_pipeline(self):
        canon = Path(os.environ.get("PM_CANON_ROOT", ROOT))
        sys.path.insert(0, str(canon / "scripts"))
        spec = importlib.util.spec_from_file_location("git3_central_gate", canon / "scripts/pm-new-contracts-verify.py")
        gate = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = gate
        spec.loader.exec_module(gate)
        schema = json.loads((ROOT / "Plans/git_selected_three.schema.json").read_text())
        registry = gate.offline_schema_registry().with_resource(schema["$id"], m.Resource.from_contents(schema))
        self.assertEqual(self.fixtures["schema_version"], "1.0.0")
        for positive, cases in ((True, self.fixtures["valid"]), (False, self.fixtures["invalid"])):
            for case in cases:
                definition, selected = gate.select_definition(schema, case, case["value"], require_valid=positive)
                accepted = gate.validator_for(schema, selected, registry).is_valid(case["value"])
                # Proposed central semantic dispatch for this not-yet-enrolled pair.
                # No canonical gate or manifest is monkeypatched/enrolled here.
                failures = m.git_selected_semantic_failures(definition, case["value"])
                if positive:
                    self.assertTrue(accepted)
                    self.assertEqual(failures, [])
                else:
                    self.assertIn("semantic_rule", case)
                    self.assertTrue(accepted, "semantic_negative_not_structurally_valid")
                    self.assertIn(case["semantic_rule"], failures, "semantic_negative_not_proven")

    def test_no_pull_stash_apply_or_branch_delete(self):
        for command in ("cmd.git.pull", "cmd.source_control.stash.apply", "cmd.source_control.branch.delete"):
            x = deepcopy(self.cases["commit"])
            x["request"]["command_id"] = command
            self.assertTrue(self.check(x))

    def test_selected_command_mismatch(self):
        x = deepcopy(self.cases["commit"])
        x["request"]["command_id"] = "cmd.source_control.branch.create"
        self.assertIn("selected_command", self.check(x))

    def test_exact_applied_operands(self):
        for kind, field, value in (("commit", "message", "other"), ("commit", "expected_index_tree", "f"*40),
                                   ("stash_create", "include_untracked", False), ("stash_create", "message", "other"),
                                   ("branch_create", "branch", "other"), ("branch_create", "base", "a"*40)):
            x = deepcopy(self.cases[kind])
            x["records"]["effect:"+kind]["applied_selection"][field] = value
            self.assertIn("effect_applied_selection", self.check(x))

    def test_foreign_lease_workspace(self):
        x = deepcopy(self.cases["commit"])
        x["records"][x["request"]["writer_lease_ref"]]["workspace_id"] = "workspace:foreign"
        self.assertIn("lease_context", self.check(x))

    def test_stale_lease_epoch(self):
        x = deepcopy(self.cases["commit"])
        x["records"][x["request"]["writer_lease_ref"]]["epoch"] += 1
        self.assertIn("lease_generation", self.check(x))

    def test_current_head_cannot_replace_original(self):
        x = deepcopy(self.cases["commit"])
        x["records"][x["request"]["repository_context_ref"]]["revision"]["commit_oid"] = "a"*40
        self.assertIn("original_git_revision", self.check(x))

    def test_wrong_result_original(self):
        x = deepcopy(self.cases["stash_create"])
        x["records"][x["result"]["original_request_ref"]]["idempotency_key"] = "other"
        self.assertIn("original_request", self.check(x))

    def test_wrong_receipt_operation(self):
        x = deepcopy(self.cases["stash_create"])
        x["records"]["receipt:stash_create"]["operation_id"] = "other"
        self.assertIn("effect_operation", self.check(x))

    def test_success_requires_complete_actual_effect(self):
        for completion in ("partial", "unknown"):
            x = deepcopy(self.cases["commit"])
            x["records"]["effect:commit"]["completion"] = completion
            self.assertIn("success_partial_or_unknown_effect", self.check(x))
        x = deepcopy(self.cases["commit"])
        x["result"]["native_effect_ref"] = None
        self.assertIn("success_without_native_effect", self.check(x))

    def test_failed_operation_does_not_need_invented_object(self):
        x = deepcopy(self.cases["commit"])
        x["result"]["native_effect_ref"] = None
        x["records"]["receipt:commit"]["outcome"] = "failed"
        x["records"]["receipt:commit"]["after_revision"] = None
        self.assertEqual(self.check(x), [])

    def test_branch_result_points_to_selected_base(self):
        x = deepcopy(self.cases["branch_create"])
        x["records"]["effect:branch_create"]["result_object"] = "b"*40
        self.assertIn("branch_base_result", self.check(x))

    def test_commit_result_matches_actual_after_revision(self):
        x = deepcopy(self.cases["commit"])
        x["records"]["receipt:commit"]["after_revision"]["commit_oid"] = "b"*40
        self.assertIn("commit_after_revision", self.check(x))

    def test_sha256_repository_does_not_accept_sha1_operand(self):
        x = deepcopy(self.cases["branch_create"])
        x["request"]["expected_revision"]["object_format"] = "sha256"
        x["request"]["expected_revision"]["commit_oid"] = "a"*64
        self.assertIn("selected_object_format", self.check(x))

    def test_mutating_resolver_cannot_change_original_late(self):
        x = deepcopy(self.cases["commit"])
        def read(ref):
            if ref == "receipt:commit":
                x["request"]["selection"]["message"] = "late mutation"
            return deepcopy(x["records"][ref])
        self.assertIn("input_mutated_during_resolution",
                      m.result_failures(x["request"], x["result"], resolve_record=read))

    def test_missing_effect_record_fails_closed(self):
        x = deepcopy(self.cases["commit"])
        del x["records"]["effect:commit"]
        self.assertTrue(any(e.startswith("unresolved:") for e in self.check(x)))

    def test_success_cannot_omit_backend_after_state(self):
        x = deepcopy(self.cases["stash_create"])
        x["records"]["receipt:stash_create"]["after_revision"] = None
        self.assertIn("success_without_after_revision", self.check(x))


if __name__ == "__main__":
    unittest.main()
