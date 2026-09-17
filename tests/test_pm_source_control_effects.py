"""Owner-schema effect consistency, not native execution or recovery proof."""

import copy
import importlib.util
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_COMMANDS = {
    "cmd.source_control.backend.detect",
    "cmd.source_control.backend.select",
    "cmd.source_control.repository.clone",
    "cmd.source_control.repository.bind",
    "cmd.source_control.repository.unbind",
    "cmd.source_control.status.refresh",
    "cmd.source_control.diff.open",
    "cmd.source_control.history.open",
    "cmd.source_control.workspace.list",
    "cmd.source_control.workspace.create",
    "cmd.source_control.workspace.open",
    "cmd.source_control.workspace.switch",
    "cmd.source_control.workspace.remove",
    "cmd.source_control.remote.fetch",
    "cmd.source_control.remote.sync",
    "cmd.source_control.remote.publish",
    "cmd.source_control.checkpoint.create",
    "cmd.source_control.checkpoint.inspect",
    "cmd.source_control.checkpoint.restore",
}


class SourceControlEffectContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads((ROOT / "Plans/source_control_contracts.schema.json").read_text())
        cls.fixtures = json.loads((ROOT / "Plans/source_control_contract_fixtures.json").read_text())
        cls.valid = {case["name"]: case for case in cls.fixtures["valid"]}
        cls.requests = {
            case["value"]["scope"]["command_id"]: case["value"]
            for case in cls.fixtures["valid"]
            if case.get("definition") == "source_control_command_request"
        }
        cls.validators = {
            kind: Draft202012Validator(
                {
                    "$schema": cls.schema["$schema"],
                    "$id": cls.schema["$id"],
                    "$defs": cls.schema["$defs"],
                    "$ref": "#/$defs/source_control_command_" + kind,
                },
                format_checker=FormatChecker(),
            )
            for kind in ("request", "result", "error")
        }

    def result_for(self, command):
        result = copy.deepcopy(self.valid["source_control_command_result_is_generic_and_receipted"]["value"])
        request = self.requests[command]
        result["command_instance_id"] = request["command_instance_id"]
        result["scope"] = copy.deepcopy(request["scope"])
        if "return_context" in request:
            result["return_context"] = copy.deepcopy(request["return_context"])
        return result

    def error_for(self, command):
        error = copy.deepcopy(self.valid["source_control_command_error_blocks_effect_unknown_retry"]["value"])
        request = self.requests[command]
        error["command_instance_id"] = request["command_instance_id"]
        error["scope"] = copy.deepcopy(request["scope"])
        return error

    def test_exact_nineteen_owner_requests_are_valid(self):
        self.assertEqual(set(self.requests), EXPECTED_COMMANDS)
        self.assertEqual(set(self.schema["$defs"]["source_control_command_id"]["enum"]), EXPECTED_COMMANDS)
        for command, request in self.requests.items():
            with self.subTest(command=command):
                self.validators["request"].validate(request)

    def test_known_success_and_explicit_unknown_results_remain_representable(self):
        for command in self.requests:
            for outcome, effect_state in (("succeeded", "effects_reconciled"), ("effect_unknown", "effect_unknown")):
                with self.subTest(command=command, outcome=outcome):
                    result = self.result_for(command)
                    result.update(outcome=outcome, effect_state=effect_state)
                    self.validators["result"].validate(result)

    def test_pre_repository_and_read_scopes_do_not_require_mutation_leases(self):
        for command in (
            "cmd.source_control.backend.detect", "cmd.source_control.backend.select",
            "cmd.source_control.status.refresh", "cmd.source_control.diff.open",
            "cmd.source_control.history.open", "cmd.source_control.workspace.list",
            "cmd.source_control.workspace.open", "cmd.source_control.checkpoint.inspect",
        ):
            with self.subTest(command=command):
                request = copy.deepcopy(self.requests[command])
                request["scope"].pop("writer_lease_ref", None)
                request["scope"].pop("credential_lease_ref", None)
                if ".backend." in command:
                    for field in ("repository_context_ref", "repo_id", "workspace_id", "expected_revision"):
                        request["scope"].pop(field, None)
                self.validators["request"].validate(request)

    def test_unknown_effect_cannot_claim_success(self):
        for command in self.requests:
            with self.subTest(command=command):
                result = self.result_for(command)
                result["effect_state"] = "effect_unknown"
                self.assertFalse(self.validators["result"].is_valid(result))

    def test_unknown_error_cannot_disguise_itself_as_known_and_retryable(self):
        for command in self.requests:
            for effect_state in ("no_effect", "effects_reconciled"):
                with self.subTest(command=command, effect_state=effect_state):
                    error = self.error_for(command)
                    error.update(effect_state=effect_state, retry_allowed=True, safe_next_actions=["retry"])
                    self.assertFalse(self.validators["error"].is_valid(error))

    def test_unknown_effect_does_not_offer_retry_even_alongside_reconciliation(self):
        for command in self.requests:
            with self.subTest(command=command):
                error = self.error_for(command)
                error["safe_next_actions"] = ["inspect", "retry", "reconcile_effects"]
                self.assertFalse(self.validators["error"].is_valid(error))

    def test_reconciliation_and_known_effect_errors_remain_representable(self):
        for command in self.requests:
            with self.subTest(command=command):
                error = self.error_for(command)
                self.validators["error"].validate(error)
                error.update(error_code="stale_revision", effect_state="no_effect", retry_allowed=True,
                             safe_next_actions=["refresh", "retry"])
                self.validators["error"].validate(error)


def load_gate_module():
    spec = importlib.util.spec_from_file_location(
        "pm_new_contracts_verify", ROOT / "scripts/pm-new-contracts-verify.py"
    )
    if spec is None or spec.loader is None:
        raise RuntimeError("unable to load scripts/pm-new-contracts-verify.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class SourceGraphPageSemanticTests(unittest.TestCase):
    """SCS-017 within-page relations; static fixture consistency only."""

    @classmethod
    def setUpClass(cls):
        cls.gate = load_gate_module()
        cls.schema = json.loads((ROOT / "Plans/source_control_contracts.schema.json").read_text())
        cls.fixtures = json.loads((ROOT / "Plans/source_control_contract_fixtures.json").read_text())
        cls.positives = {
            case["name"]: case.get("value", case.get("record", case.get("instance")))
            for case in cls.fixtures["valid"]
        }
        cls.graph = cls.positives["git_source_graph_is_bounded_identity_safe_and_virtualized"]
        cls.graph_validator = Draft202012Validator(
            {
                "$schema": cls.schema["$schema"],
                "$id": cls.schema["$id"],
                "$defs": cls.schema["$defs"],
                "$ref": "#/$defs/source_graph_projection",
            },
            format_checker=FormatChecker(),
        )

    def semantic_failures(self, value, definition="source_graph_projection"):
        return self.gate.contract_semantic_failures(
            self.gate.SOURCE_CONTROL_SCHEMA_REL, definition, value
        )

    def test_every_authored_source_control_positive_is_semantically_clean(self):
        for case in self.fixtures["valid"]:
            with self.subTest(case=case["name"]):
                value = case.get("value", case.get("record", case.get("instance")))
                self.assertEqual(
                    self.semantic_failures(value, case.get("definition", "<root>")), []
                )

    def test_authored_semantic_negatives_are_structural_positives_rejected_for_their_rule(self):
        cases = [case for case in self.fixtures["invalid"] if "semantic_rule" in case]
        self.assertEqual(
            {case["semantic_rule"] for case in cases},
            {
                "source_graph_returned_count_not_equal_to_emitted_nodes",
                "source_graph_returned_count_exceeds_page_size",
                "source_graph_duplicate_node_ref_in_page",
            },
        )
        for case in cases:
            with self.subTest(case=case["name"]):
                value = self.gate.materialize_invalid(case, self.positives)
                self.graph_validator.validate(value)
                self.assertEqual(self.semantic_failures(value), [case["semantic_rule"]])

    def test_returned_count_mismatch_is_rejected_in_both_directions(self):
        for returned_count in (1, 3):
            with self.subTest(returned_count=returned_count):
                page = copy.deepcopy(self.graph)
                page["page"]["returned_count"] = returned_count
                self.assertTrue(self.graph_validator.is_valid(page))
                self.assertIn(
                    "source_graph_returned_count_not_equal_to_emitted_nodes",
                    self.semantic_failures(page),
                )

    def test_repeated_node_ref_is_rejected_whether_or_not_the_rows_agree(self):
        # DL-053: uniqueness is the rule, not merely the absence of a conflict.
        for agree in (False, True):
            with self.subTest(rows_agree=agree):
                page = copy.deepcopy(self.graph)
                page["nodes"][1]["node_ref"] = page["nodes"][0]["node_ref"]
                if agree:
                    page["nodes"][1] = copy.deepcopy(page["nodes"][0])
                self.assertTrue(self.graph_validator.is_valid(page))
                self.assertEqual(
                    self.semantic_failures(page),
                    ["source_graph_duplicate_node_ref_in_page"],
                )

    def test_distinct_node_refs_are_untouched_by_the_uniqueness_rule(self):
        page = copy.deepcopy(self.graph)
        self.assertNotEqual(page["nodes"][0]["node_ref"], page["nodes"][1]["node_ref"])
        self.assertEqual(self.semantic_failures(page), [])

    def test_branch_is_scoped_to_the_source_graph_projection(self):
        inconsistent = {
            "schema_id": "pm.source_control.source_graph_projection.v1",
            "page": {"returned_count": 9, "page_size": 1},
            "nodes": [],
        }
        # The same shape is evaluated under this owner schema and ignored elsewhere.
        self.assertEqual(
            self.semantic_failures(inconsistent),
            [
                "source_graph_returned_count_exceeds_page_size",
                "source_graph_returned_count_not_equal_to_emitted_nodes",
            ],
        )
        # The Jujutsu owner schema now has its own semantic branch, so scoping is
        # proved by the branch declining a definition that is not its own rather
        # than by the whole schema path returning nothing.
        self.assertEqual(
            self.gate.contract_semantic_failures(
                "Plans/jujutsu_integration_contracts.schema.json",
                "source_graph_projection",
                inconsistent,
            ),
            [],
        )
        self.assertEqual(
            self.gate.contract_semantic_failures(
                "Plans/doctor_contracts.schema.json",
                "source_graph_projection",
                inconsistent,
            ),
            [],
        )
        # A non-graph record of this owner schema is not a page and is left alone.
        request = self.positives["source_control_command_request_01_backend_detect"]
        self.assertEqual(
            self.semantic_failures(request, "source_control_command_request"), []
        )


if __name__ == "__main__":
    unittest.main()
