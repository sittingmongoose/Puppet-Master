"""Regression tests for the Jujutsu branch of the contract semantic gate.

Claim boundary: these tests exercise the four JJI-006 and JJI-008 relations that
JSON Schema cannot express, as evaluated by
``scripts/pm-new-contracts-verify.py``. They prove that the authored negatives
are structurally valid and fail exactly one named rule, that every shipped
positive is clean, and that the branch stays scoped to its own owner schema and
its own definitions. They establish no handler, adapter, native behaviour,
runtime certification or readiness claim.
"""

import copy
import importlib.util
import json
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]

JUJUTSU_SCHEMA_REL = "Plans/jujutsu_integration_contracts.schema.json"
JUJUTSU_FIXTURE_REL = "Plans/jujutsu_integration_contract_fixtures.json"

AUTHORIZED_RULES = {
    "jujutsu_pointer_resolution_incomplete_for_layout",
    "jujutsu_operation_heads_changed_during_read_only_verification",
    "jujutsu_closure_publishes_a_head_before_its_dependencies",
    "jujutsu_recovery_action_not_in_canonical_inventory",
}


def load_gate_module():
    spec = importlib.util.spec_from_file_location(
        "pm_new_contracts_verify", ROOT / "scripts/pm-new-contracts-verify.py"
    )
    if spec is None or spec.loader is None:
        raise RuntimeError("unable to load scripts/pm-new-contracts-verify.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class JujutsuClosureSemanticTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.gate = load_gate_module()
        cls.schema = json.loads((ROOT / JUJUTSU_SCHEMA_REL).read_text(encoding="utf-8"))
        cls.fixtures = json.loads((ROOT / JUJUTSU_FIXTURE_REL).read_text(encoding="utf-8"))
        cls.positives = {case["name"]: case["value"] for case in cls.fixtures["valid"]}

        registry = Registry(
            retrieve=lambda uri: (_ for _ in ()).throw(ValueError(f"unregistered schema URI: {uri}"))
        )
        for schema_rel in (
            JUJUTSU_SCHEMA_REL,
            "Plans/source_control_contracts.schema.json",
            "Plans/backup_restore_system_contracts.schema.json",
        ):
            schema = json.loads((ROOT / schema_rel).read_text(encoding="utf-8"))
            registry = registry.with_resource(schema["$id"], Resource.from_contents(schema))
        cls.registry = registry

    def semantic_failures(self, value, definition):
        return self.gate.contract_semantic_failures(
            self.gate.JUJUTSU_SCHEMA_REL, definition, value
        )

    def validator_for(self, definition):
        return Draft202012Validator(
            {
                "$schema": self.schema.get("$schema"),
                "$id": self.schema["$id"],
                "$defs": self.schema["$defs"],
                "$ref": f"#/$defs/{definition}",
            },
            registry=self.registry,
            format_checker=FormatChecker(),
        )

    def positive(self, name):
        return copy.deepcopy(self.positives[name])

    def test_every_shipped_positive_is_semantically_clean(self):
        for case in self.fixtures["valid"]:
            with self.subTest(case=case["name"]):
                self.assertEqual(
                    self.semantic_failures(case["value"], case["definition"]), []
                )

    def test_authored_semantic_rules_are_exactly_the_authorized_four(self):
        authored = {
            case["semantic_rule"]
            for case in self.fixtures["invalid"]
            if case.get("semantic_rule") is not None
        }
        self.assertEqual(authored, AUTHORIZED_RULES)

    def test_each_semantic_negative_is_valid_and_fails_only_its_own_rule(self):
        for case in self.fixtures["invalid"]:
            rule = case.get("semantic_rule")
            if rule is None:
                continue
            with self.subTest(case=case["name"]):
                value = self.gate.materialize_invalid(case, self.positives)
                self.assertTrue(
                    self.validator_for(case["definition"]).is_valid(value),
                    "a semantic negative must pass JSON Schema so the rule is what rejects it",
                )
                self.assertEqual(self.semantic_failures(value, case["definition"]), [rule])

    def test_a_colocated_layout_must_resolve_its_whole_pointer_chain(self):
        value = self.positive("backup_jj_colocated_closure_captures_git_common_store_and_dirty_files")
        value["pointer_resolutions"] = [
            resolution
            for resolution in value["pointer_resolutions"]
            if resolution["pointer_kind"] != "git_commondir"
        ]
        self.assertEqual(
            self.semantic_failures(value, "backup_jj_closure_record"),
            ["jujutsu_pointer_resolution_incomplete_for_layout"],
        )

    def test_a_non_colocated_layout_does_not_require_a_commondir(self):
        value = self.positive("backup_jj_non_colocated_closure_does_not_invent_git_checkout")
        self.assertNotIn(
            "git_commondir",
            {resolution["pointer_kind"] for resolution in value["pointer_resolutions"]},
        )
        self.assertEqual(self.semantic_failures(value, "backup_jj_closure_record"), [])

    def test_a_pointer_chain_with_a_gap_in_its_hops_is_rejected(self):
        value = self.positive("backup_jj_shared_multi_workspace_closure_preserves_stable_maps")
        for resolution in value["pointer_resolutions"]:
            if resolution["pointer_kind"] == "workspace_gitdir_link" and resolution["hop_index"] == 1:
                resolution["hop_index"] = 4
        self.assertEqual(
            self.semantic_failures(value, "backup_jj_closure_record"),
            ["jujutsu_pointer_resolution_incomplete_for_layout"],
        )

    def test_operation_heads_are_compared_as_sets_not_as_ordered_lists(self):
        value = self.positive("backup_jj_shared_multi_workspace_closure_preserves_stable_maps")
        receipt = self.positive("backup_jj_isolated_restore_verifies_historical_operation_and_requires_sign_in")
        heads = receipt["operation_head_refs"]
        receipt["operation_heads_after_refs"] = list(reversed(heads))
        self.assertEqual(
            self.semantic_failures(receipt, "backup_jj_restore_verification_receipt"), []
        )
        receipt["operation_heads_after_refs"] = heads + ["operation-head:jj:restore:extra"]
        self.assertEqual(
            self.semantic_failures(receipt, "backup_jj_restore_verification_receipt"),
            ["jujutsu_operation_heads_changed_during_read_only_verification"],
        )
        del value

    def test_activation_markers_must_be_the_last_materialization_step(self):
        value = self.positive("backup_jj_colocated_closure_captures_git_common_store_and_dirty_files")
        value["closure_expansion"]["materialization_order"] = [
            "dependency_objects",
            "workspace_files",
            "activation_markers",
            "operation_heads",
        ]
        self.assertEqual(
            self.semantic_failures(value, "backup_jj_closure_record"),
            ["jujutsu_closure_publishes_a_head_before_its_dependencies"],
        )

    def test_a_recovery_floor_may_name_a_declared_owner_route(self):
        value = self.positive("command_availability_quarantined_repository_keeps_the_operation_log_floor")
        value["availability"]["allowed_action_ids"] = [
            "cmd.jujutsu.operation.log",
            "cmd.jujutsu.operation.show",
            "cmd.source_control.status.refresh",
        ]
        self.assertEqual(self.semantic_failures(value, "command_availability"), [])

    def test_the_admitted_action_set_is_read_from_the_owner_schema(self):
        admitted = self.gate.jujutsu_admitted_action_ids()
        canonical = set(self.schema["$defs"]["command_id"]["enum"])
        self.assertTrue(canonical.issubset(admitted))
        self.assertIn("cmd.backup.browse", admitted)
        self.assertNotIn("cmd.jujutsu.change.converge", admitted)

    def test_the_branch_is_scoped_to_its_own_owner_schema(self):
        value = self.positive("backup_jj_colocated_closure_captures_git_common_store_and_dirty_files")
        value["closure_expansion"]["materialization_order"] = [
            "operation_heads",
            "dependency_objects",
        ]
        self.assertEqual(
            self.semantic_failures(value, "backup_jj_closure_record"),
            ["jujutsu_closure_publishes_a_head_before_its_dependencies"],
        )
        self.assertEqual(
            self.gate.contract_semantic_failures(
                "Plans/source_control_contracts.schema.json",
                "backup_jj_closure_record",
                value,
            ),
            [],
        )

    def test_the_branch_is_scoped_to_its_own_definitions(self):
        value = self.positive("backup_jj_colocated_closure_captures_git_common_store_and_dirty_files")
        value["closure_expansion"]["materialization_order"] = [
            "operation_heads",
            "dependency_objects",
        ]
        self.assertEqual(self.semantic_failures(value, "command_request"), [])

    def test_a_non_object_instance_is_left_alone(self):
        self.assertEqual(self.semantic_failures([], "backup_jj_closure_record"), [])
        self.assertEqual(self.semantic_failures("not a record", "command_availability"), [])


if __name__ == "__main__":
    unittest.main()
