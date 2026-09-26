"""Focused static checks for the trusted Client details settlement companion.

No native local controller, GUI surface, storage value, command dispatcher, or
EventRecord executes here. The pack is joined to the pinned owner schema by
$id so a changed owner family fails this suite instead of silently validating
a stale copy. The candidate copies of touch_closure.json and
pm-new-contracts-verify.py are checked against their pinned inputs/ originals
so only the two intended narrow edits exist.
"""
import copy
import ast
import difflib
import json
import runpy
from pathlib import Path
import sys
import subprocess
import unittest

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

CANDIDATE = Path(__file__).resolve().parents[1]
CASE_ROOT = CANDIDATE.parent
sys.path.insert(0, str(CANDIDATE / "scripts"))
from pm_client_trust_local_settlement import (  # noqa: E402
    DEFINITION,
    LOCAL_ACTION_IDS,
    REFUSAL_REASONS,
    client_trust_local_settlement_semantic_failures,
)

SCHEMA_REL = "Plans/client_trust_local_settlement.schema.json"
FIXTURE_REL = "Plans/client_trust_local_settlement_fixtures.json"
OWNER_SCHEMA_REL = "Plans/server_system_contracts.schema.json"
CENTRAL_SCHEMA_REL = "Plans/ui_command_response.schema.json"
OWNER_DOC_REL = "Plans/Server_System.md"
TOUCH_REL = "Plans/touch_closure.json"
PROFILE_ID = "TCP-CLIENT-TRUST-LOCAL"
ACTION_ID = "ui.client.open_details"
RETIRED_SPELLING = "cmd.client.open_details"
DOMAIN_COMMAND_IDS = {
    "cmd.client.access.update",
    "cmd.client.remove",
    "cmd.client.rename",
    "cmd.client.session.revoke",
}


def candidate_path(rel):
    return CANDIDATE / rel


def input_path(rel):
    external = CASE_ROOT / "inputs" / rel
    return external if external.is_file() else CANDIDATE / rel


def pinned_text(rel):
    external = CASE_ROOT / "inputs" / rel
    if external.is_file():
        return external.read_text()
    return subprocess.check_output(
        ["git", "show", "64728e06aef19325d1adb7bfbb141aac00429a3a:" + rel],
        cwd=CANDIDATE, text=True)


def manifest(text):
    values = {}
    for node in ast.parse(text).body:
        if isinstance(node, ast.Assign) and isinstance(node.targets[0], ast.Name):
            name = node.targets[0].id
            if name in {"CONTRACT_PAIRS", "EXPECTED_CONTRACT_PAIR_COUNT"}:
                values[name] = ast.literal_eval(node.value)
    return values["CONTRACT_PAIRS"], values["EXPECTED_CONTRACT_PAIR_COUNT"]


def load(path):
    return json.loads(path.read_text())


_FIXTURES_CACHE = {}


def case(names, group):
    if group not in _FIXTURES_CACHE:
        _FIXTURES_CACHE[group] = load(candidate_path(FIXTURE_REL))[group]
    for row in _FIXTURES_CACHE[group]:
        if row["name"] == names:
            return copy.deepcopy(row["value"])
    raise AssertionError(f"unknown fixture case {names}")


def semantic(value):
    return client_trust_local_settlement_semantic_failures(DEFINITION, value)


class LocalSettlementTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = load(candidate_path(SCHEMA_REL))
        cls.fixtures = load(candidate_path(FIXTURE_REL))
        cls.owner = load(input_path(OWNER_SCHEMA_REL))
        cls.central = load(input_path(CENTRAL_SCHEMA_REL))
        cls.registry = (
            Registry()
            .with_resource(cls.owner["$id"], Resource.from_contents(cls.owner))
            .with_resource(cls.schema["$id"], Resource.from_contents(cls.schema))
        )

    def validator(self, definition=DEFINITION):
        schema = dict(self.schema)
        schema.pop("oneOf", None)
        schema["$ref"] = f"#/$defs/{definition}"
        return Draft202012Validator(schema, registry=self.registry,
                                    format_checker=FormatChecker())

    def owner_validator(self, definition):
        schema = dict(self.owner)
        schema.pop("oneOf", None)
        schema["$ref"] = f"#/$defs/{definition}"
        return Draft202012Validator(schema)  # owner defs are self-contained

    def test_schema_and_fixture_metadata(self):
        Draft202012Validator.check_schema(self.schema)
        self.assertEqual(self.schema["$schema"], "https://json-schema.org/draft/2020-12/schema")
        self.assertEqual(self.fixtures["contract_schema_id"], self.schema["x-schema-id"])
        self.assertEqual(self.fixtures["schema_ref"], SCHEMA_REL)
        self.assertEqual(self.fixtures["owner_request_schema"], OWNER_SCHEMA_REL)
        self.assertEqual(self.schema["x-local-action-ids"], list(LOCAL_ACTION_IDS))
        self.assertEqual(self.schema["x-owner-plan-unit"], "SRV-011")
        self.assertEqual(self.schema["x-touch-profile"], PROFILE_ID)
        self.assertIsInstance(self.fixtures["claim_boundary"], str)
        self.assertIn("unproven binding", self.fixtures["claim_boundary"])
        self.assertFalse(self.fixtures["coverage"]["runtime_evidence_claimed"])
        self.assertFalse(self.fixtures["coverage"]["central_ui_command_response_routed"])
        self.assertTrue(self.fixtures["composed_owner_family"]["unchanged_owner_artifacts"])
        self.assertEqual(self.fixtures["composed_owner_family"]["local_actions"], list(LOCAL_ACTION_IDS))

    def test_vocabulary_reuses_owner_and_central_tokens_only(self):
        reasons = set(self.schema["$defs"]["ClientTrustLocalRefusalReason"]["enum"])
        self.assertEqual(reasons, set(REFUSAL_REASONS))
        self.assertEqual(set(self.schema["x-refusal-reason-vocabulary"]), reasons)
        owner_error = set(
            self.owner["$defs"]["ClientTrustCommandError"]["properties"]["code"]["enum"]
        )
        owner_disabled = set(
            self.owner["$defs"]["ClientTrustDisabledReason"]["properties"]["code"]["enum"]
        )
        central_codes = set(
            self.central["$defs"]["UICommandError"]["properties"]["code"]["enum"]
        )
        # stale_projection and handler_unavailable are the TCP-CLIENT-TRUST-LOCAL
        # disabled-reason tokens and central UICommandError codes.
        self.assertLessEqual({"stale_projection", "handler_unavailable"}, central_codes)
        self.assertIn("handler_unavailable", owner_error)
        self.assertIn("handler_unavailable", owner_disabled)
        self.assertNotIn("stale_projection", owner_error)
        # caller_unavailable is the owner exact-return prose rule.
        owner_text = input_path(OWNER_DOC_REL).read_text()
        self.assertIn(
            "Exact return restores the initiating surface, route, focus, and generation "
            "or reports `caller_unavailable`; another connected Client is not a fallback.",
            owner_text,
        )
        # No reason outside the owner/central vocabulary is admitted:
        # stale_projection and handler_unavailable are central/owner tokens,
        # caller_unavailable is the owner exact-return prose token above.
        self.assertLessEqual(reasons - {"caller_unavailable"}, owner_error | central_codes)
        # Every domain token not reused is excluded with an explicit reason.
        self.assertEqual(
            set(self.schema["x-excluded-owner-reason-codes"]),
            (owner_error | owner_disabled) - {"handler_unavailable"},
        )
        # The outcome vocabulary is exactly presented plus the refusal reasons.
        self.assertEqual(
            set(self.schema["x-refusal-reason-vocabulary"]) | {"presented"},
            {row["value"]["outcome"] for row in self.fixtures["valid"]}
            | set(self.schema["x-refusal-reason-vocabulary"]),
        )

    def test_domain_error_and_availability_records_are_not_reused_as_carrier(self):
        # They bind ClientTrustCommandId, which excludes the local action.
        command_id_enum = set(
            self.owner["$defs"]["ClientTrustCommandId"]["enum"]
        )
        self.assertEqual(command_id_enum, DOMAIN_COMMAND_IDS)
        self.assertNotIn(ACTION_ID, command_id_enum)
        self.assertNotIn(RETIRED_SPELLING, command_id_enum)
        owner_text = json.dumps(self.owner)
        for definition in (
            "ClientTrustCommandError",
            "ClientTrustCommandAvailability",
            "ClientTrustDisabledReason",
        ):
            self.assertIn(f'"{definition}"', owner_text)
        companion_text = json.dumps(self.schema)
        for definition in (
            "ClientTrustCommandError",
            "ClientTrustCommandAvailability",
            "ClientTrustDisabledReason",
        ):
            self.assertNotIn(f"#/$defs/{definition}", companion_text)

    def test_central_dispatcher_boundary_is_not_widened_or_routed(self):
        # CV-333 CommandId accepts cmd.* only; ui.client.open_details is not a
        # command and the companion never produces a central response record.
        central_pattern = self.central["$defs"]["CommandId"]["pattern"]
        self.assertNotRegex(ACTION_ID, central_pattern)
        self.assertRegex("cmd.client.rename", central_pattern)
        companion = self.schema
        companion_text = json.dumps(companion)
        self.assertNotIn("pm.ui_command_response", companion_text)
        settlement = companion["$defs"]["ClientTrustLocalSettlement"]
        for central_field in ("response_kind", "ack_status", "result_status", "dispatch_id"):
            self.assertNotIn(central_field, settlement["properties"])
        self.assertNotIn("local_projection",
                         json.dumps(settlement["properties"]))
        for row in self.fixtures["valid"]:
            self.assertIsNone(row["value"]["domain_command_id"])

    def test_positive_fixtures_settle_exactly(self):
        validator = self.validator()
        for row in self.fixtures["valid"]:
            value = row["value"]
            errors = list(validator.iter_errors(value))
            self.assertEqual(errors, [], f"{row['name']}: {errors[:1]}")
            self.assertEqual(semantic(value), [], row["name"])
            self.assertEqual(value["request"]["local_action_id"], ACTION_ID)

    def test_two_presented_positives_open_a_differing_accessible_target(self):
        # The opened accessible target may differ from the restored initiating
        # focus; equality in the ordinary positive is fixture coincidence, not
        # an owner law, so it is never relied on.
        presented = [row["value"] for row in self.fixtures["valid"]
                     if row["value"]["outcome"] == "presented"]
        differing = [
            value for value in presented
            if value["owner_result"]["accessible_focus_target"]
            != value["request"]["return_context"]["focus_target"]
        ]
        self.assertGreaterEqual(len(presented), 3)
        self.assertEqual(len(differing), 2)
        for value in differing:
            self.assertEqual(
                value["return_settlement"]["focus_target"],
                value["request"]["return_context"]["focus_target"],
            )
            self.assertEqual(semantic(value), [])

    def test_positive_cases_cover_presented_and_every_genuine_refusal(self):
        outcomes = set()
        for row in self.fixtures["valid"]:
            value = row["value"]
            outcomes.add(value["outcome"])
            return_context = value["request"]["return_context"]
            if value["outcome"] == "presented":
                self.assertIsNotNone(value["owner_result"])
                self.assertEqual(
                    value["return_settlement"]["focus_target"], return_context["focus_target"]
                )
                self.assertEqual(
                    value["request"]["expected_projection_generation"],
                    value["owner_current_projection"]["projection_generation"],
                )
            else:
                self.assertIsNone(value["owner_result"], row["name"])
                self.assertEqual(value["refusal"]["reason_code"], value["outcome"])
                if value["return_settlement"]["restoration"] == "restored":
                    self.assertEqual(
                        value["return_settlement"]["focus_target"], return_context["focus_target"]
                    )
                else:
                    self.assertIsNone(value["return_settlement"]["focus_target"])
        self.assertEqual(
            outcomes, {"presented"} | set(REFUSAL_REASONS)
        )

    def test_embedded_owner_records_stay_exactly_owner_admitted(self):
        request_validator = self.owner_validator("ClientTrustLocalActionRequest")
        result_validator = self.owner_validator("ClientTrustLocalActionResult")
        return_validator = self.owner_validator("ClientTrustReturnContext")
        for row in self.fixtures["valid"]:
            value = row["value"]
            self.assertEqual(list(request_validator.iter_errors(value["request"])), [], row["name"])
            self.assertEqual(
                list(return_validator.iter_errors(value["request"]["return_context"])),
                [], row["name"],
            )
            if value["owner_result"] is not None:
                self.assertEqual(
                    list(result_validator.iter_errors(value["owner_result"])), [], row["name"]
                )

    def test_structural_negatives_are_rejected_by_the_schema(self):
        validator = self.validator()
        structural = [row for row in self.fixtures["invalid"] if "semantic_rule" not in row]
        self.assertTrue(structural)
        for row in structural:
            errors = list(validator.iter_errors(row["value"]))
            self.assertTrue(errors, f"{row['name']} was accepted")
            # A structural negative must fail for its authored violation, never
            # because a fixture name leaked into the record identity.
            paths = {"/".join(str(part) for part in error.absolute_path) for error in errors}
            self.assertNotIn("settlement_id", paths, row["name"])
        retired = case("negative.settlement.details.retired_action_identity", "invalid")
        self.assertEqual(retired["request"]["local_action_id"], RETIRED_SPELLING)
        paths = {
            "/".join(str(part) for part in error.absolute_path)
            for error in validator.iter_errors(retired)
        }
        self.assertIn("request/local_action_id", paths)
        secret = case("negative.settlement.details.raw_secret_ref", "invalid")
        paths = {
            "/".join(str(part) for part in error.absolute_path)
            for error in validator.iter_errors(secret)
        }
        self.assertIn("owner_current_projection/projection_ref", paths)
        # No other-Client fallback restoration vocabulary exists at all.
        fallback = case("negative.settlement.details.foreign_restoration_vocabulary", "invalid")
        self.assertEqual(fallback["return_settlement"]["restoration"], "returned_to_peer_client")

    def test_semantic_negatives_are_structurally_valid_and_causally_wrong(self):
        validator = self.validator()
        semantic_rows = [row for row in self.fixtures["invalid"] if "semantic_rule" in row]
        self.assertTrue(semantic_rows)
        for row in semantic_rows:
            value = row["value"]
            self.assertEqual(
                list(validator.iter_errors(value)), [], f"{row['name']} is not structurally valid"
            )
            self.assertIn(row["semantic_rule"], semantic(value), row["name"])

    def test_required_causal_negatives_are_present_and_joined(self):
        # The four reviewed causal negatives, each schema-valid and each caught
        # by exactly the cross-record join the schema cannot express.
        required = {
            "negative.settlement.details.success_on_altered_generation":
                "client_trust_local_settlement_success_on_stale_projection",
            "negative.settlement.details.success_on_altered_subject":
                "client_trust_local_settlement_projection_identity_mismatch",
            "negative.settlement.details.success_without_mounted_controller":
                "client_trust_local_settlement_success_without_mounted_controller",
            "negative.settlement.details.false_success_after_refusal":
                "client_trust_local_settlement_caller_unavailable_mismatch",
            "negative.settlement.details.return_to_another_caller":
                "client_trust_local_settlement_return_identity_mismatch",
        }
        names = {row["name"] for row in self.fixtures["invalid"]}
        for name, rule in required.items():
            self.assertIn(name, names)
            value = case(name, "invalid")
            failures = semantic(value)
            self.assertIn(rule, failures, name)
            # Without the specific join the record would pass: no unrelated
            # shape or identity rule objects. Sibling rules of the same
            # cross-record join family may fire alongside the required one.
            unrelated = set(failures) - {rule} - {
                "client_trust_local_settlement_currentness_understates_generation_change",
                "client_trust_local_settlement_owner_result_generation_mismatch",
            }
            self.assertEqual(unrelated, set(), f"{name}: {sorted(unrelated)}")

    def test_absent_owner_projection_refusal_is_truthful(self):
        # The owner-selected current projection can be absent at settlement
        # time; the null member is the truthful representation and settles as
        # the genuine stale_projection refusal with no success result.
        value = case("positive.settlement.details.absent_projection_refused", "valid")
        self.assertIsNone(value["owner_current_projection"])
        self.assertEqual(value["outcome"], "stale_projection")
        self.assertIsNone(value["owner_result"])
        self.assertEqual(value["refusal"]["reason_code"], "stale_projection")
        self.assertEqual(
            value["refusal"]["blocking_refs"], [value["request"]["projection_ref"]]
        )
        self.assertEqual(list(self.validator().iter_errors(value)), [])
        self.assertEqual(semantic(value), [])
        # The refusal branch itself does not depend on absence: with the
        # selection present again at a superseded generation, the same
        # settlement is still the genuine stale refusal.
        repopulated = copy.deepcopy(value)
        repopulated["owner_current_projection"] = {
            "projection_ref": repopulated["request"]["projection_ref"],
            "projection_generation": 11,
            "mounted_local_controller_ref": "controller:client_trust:local:1",
        }
        self.assertEqual(semantic(repopulated), [])
        self.assertEqual(list(self.validator().iter_errors(repopulated)), [])

    def test_absent_owner_projection_success_is_causally_rejected(self):
        # A presented success carried on an absent owner projection is
        # schema-valid — the absence join is causal, not structural — and is
        # caught by the semantic rule bound to the actual
        # owner_current_projection field, not to any copied declaration.
        validator = self.validator()
        value = case("negative.settlement.details.success_on_absent_projection", "invalid")
        self.assertIsNone(value["owner_current_projection"])
        self.assertEqual(value["outcome"], "presented")
        self.assertIsInstance(value["owner_result"], dict)
        self.assertEqual(list(validator.iter_errors(value)), [])
        self.assertEqual(
            semantic(value),
            [
                "client_trust_local_settlement_owner_result_generation_mismatch",
                "client_trust_local_settlement_success_on_absent_projection",
            ],
        )
        # The no-success condition reads the field itself: restoring the
        # selected projection with exactly the claimed identity and current
        # generation — and changing nothing else — clears every failure.
        healed = copy.deepcopy(value)
        healed["owner_current_projection"] = {
            "projection_ref": healed["request"]["projection_ref"],
            "projection_generation": healed["request"]["expected_projection_generation"],
            "mounted_local_controller_ref": "controller:client_trust:local:1",
        }
        self.assertEqual(semantic(healed), [])
        self.assertEqual(list(validator.iter_errors(healed)), [])
        # Absence settles only as the stale refusal: any other refusal cause
        # mistakes the missing selection for a controller or caller failure.
        # The caller_unavailable tamper additionally trips the pre-existing
        # outcome/return parity rule, because its return context is restored.
        for other_reason, siblings in (
            ("handler_unavailable", ()),
            ("caller_unavailable",
             ("client_trust_local_settlement_caller_unavailable_mismatch",)),
        ):
            mismatched = copy.deepcopy(value)
            mismatched["outcome"] = other_reason
            mismatched["owner_result"] = None
            mismatched["refusal"] = {
                "reason_code": other_reason,
                "safe_message": "Not available.",
                "blocking_refs": [mismatched["request"]["projection_ref"]],
            }
            self.assertEqual(list(validator.iter_errors(mismatched)), [])
            self.assertEqual(
                semantic(mismatched),
                sorted(
                    (
                        "client_trust_local_settlement_absent_projection_requires_stale_refusal",
                        *siblings,
                    )
                ),
                other_reason,
            )

    def test_currentness_is_derived_never_declared(self):
        # The settlement has no declared currentness field at all; copying the
        # request's expected generation into the owner projection slot does not
        # authenticate a stale or current claim.
        self.assertNotIn("currentness", self.schema["$defs"]["ClientTrustLocalSettlement"]["properties"])
        witness = case("positive.settlement.details.stale_generation_refused", "valid")
        self.assertNotEqual(
            witness["request"]["expected_projection_generation"],
            witness["owner_current_projection"]["projection_generation"],
        )
        copied = copy.deepcopy(witness)
        copied["owner_current_projection"]["projection_generation"] = (
            copied["request"]["expected_projection_generation"]
        )
        self.assertIn(
            "client_trust_local_settlement_stale_claim_without_generation_change",
            semantic(copied),
        )

    def test_opened_target_is_separate_from_return_restoration(self):
        changed = case("positive.settlement.details.presented", "valid")
        self.assertEqual(semantic(changed), [])
        changed["owner_result"]["accessible_focus_target"] = "foreign-focus"
        changed["return_settlement"]["focus_target"] = "foreign-focus"
        self.assertIn("client_trust_local_settlement_return_focus_mismatch", semantic(changed))
        self.assertEqual(changed["request"]["return_context"]["focus_target"], "client-details")
        opened = case("positive.settlement.details.presented_opened_sessions", "valid")
        self.assertNotEqual(
            opened["owner_result"]["accessible_focus_target"],
            opened["request"]["return_context"]["focus_target"],
        )
        self.assertEqual(
            opened["return_settlement"]["focus_target"],
            opened["request"]["return_context"]["focus_target"],
        )
        self.assertIn(
            "client_trust_local_settlement_return_focus_mismatch",
            semantic(case("negative.settlement.details.opened_and_return_focus_changed", "invalid")),
        )

    def test_opaque_owner_refs_are_not_scanned_for_command_substrings(self):
        # A projection ref is content provenance, not an action identity, so an
        # owner-valid ref naming a domain command stays admissible; the typed
        # identity slots and domain_command_id decide.
        value = case("positive.settlement.details.presented", "valid")
        self.assertEqual(semantic(value), [])
        origin = "projection:client_trust:after:cmd.client.access.update"
        value["request"]["projection_ref"] = origin
        value["owner_current_projection"]["projection_ref"] = origin
        value["owner_result"]["projection_ref"] = origin
        self.assertEqual(semantic(value), [])
        self.assertEqual(list(self.validator().iter_errors(value)), [])
        self.assertEqual(value["domain_command_id"], None)
        # The same spelling in an actual typed identity slot is impossible.
        retired = case("negative.settlement.details.retired_action_identity", "invalid")
        self.assertTrue(list(self.validator().iter_errors(retired)))

    def test_helper_fails_closed_on_direct_calls(self):
        value = case("positive.settlement.details.presented", "valid")
        self.assertEqual(semantic(value), [])
        self.assertEqual(
            client_trust_local_settlement_semantic_failures("OtherRecord", value), []
        )
        self.assertEqual(
            client_trust_local_settlement_semantic_failures(
                DEFINITION, {"record_kind": "OtherRecord"}
            ),
            ["client_trust_local_settlement_malformed_input"],
        )
        for key, replacement, rule in (
            ("mutated_domain_state", True, "client_trust_local_settlement_domain_effect_present"),
            ("domain_handler_invoked", True, "client_trust_local_settlement_domain_effect_present"),
            ("domain_event_emitted", True, "client_trust_local_settlement_domain_effect_present"),
            ("domain_command_id", "cmd.client.rename", "client_trust_local_settlement_domain_effect_present"),
            ("record_kind", "ClientTrustLocalActionResult", "client_trust_local_settlement_malformed_input"),
        ):
            tampered = copy.deepcopy(value)
            tampered[key] = replacement
            self.assertIn(rule, semantic(tampered), key)
        leaked = copy.deepcopy(value)
        leaked["return_settlement"]["surface_ref"] = "surface:authorization"
        self.assertIn("client_trust_local_settlement_secret_material", semantic(leaked))

    def test_refusal_never_carries_a_domain_command_or_event(self):
        for row in self.fixtures["valid"]:
            value = row["value"]
            self.assertIsNone(value["domain_command_id"])
            self.assertFalse(value["domain_event_emitted"])
            self.assertFalse(value["domain_handler_invoked"])
            self.assertFalse(value["mutated_domain_state"])
            if value["outcome"] != "presented":
                self.assertNotIn("cmd.", json.dumps(value))

    def test_required_dimensions_are_covered(self):
        coverage = self.fixtures["coverage"]
        valid, invalid = self.fixtures["valid"], self.fixtures["invalid"]
        presented = [row for row in valid if row["value"]["outcome"] == "presented"]
        structural = [row for row in invalid if "semantic_rule" not in row]
        semantic_rows = [row for row in invalid if "semantic_rule" in row]
        self.assertEqual(coverage["positive_cases"], len(valid))
        self.assertEqual(coverage["negative_cases"], len(invalid))
        self.assertEqual(coverage["presented_cases"], len(presented))
        self.assertEqual(coverage["refused_cases"], len(valid) - len(presented))
        self.assertEqual(coverage["structural_negatives"], len(structural))
        self.assertEqual(coverage["semantic_negatives"], len(semantic_rows))
        self.assertEqual(coverage["presented_cases_with_differing_opened_target"], 2)
        self.assertEqual(
            coverage["refusal_reasons"], sorted(set(REFUSAL_REASONS))
        )
        names = {row["name"] for row in invalid}
        self.assertTrue(names)
        for dimension in coverage["required_negative_dimensions"]:
            self.assertIsInstance(dimension, str)


class TouchProfileBindingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.profile = next(
            p for p in load(candidate_path(TOUCH_REL))["profiles"]
            if p["profile_id"] == PROFILE_ID
        )
        rows = load(candidate_path(TOUCH_REL))["rows"]
        cls.row = next(r for r in rows if r[0] == "TOUCH-SGAPLOCAL-019")

    def test_exact_owner_and_settlement_references(self):
        # payload and receipt stay on the unchanged owner artifacts; the
        # previously success-only error_schema_ref now names the typed refusal.
        self.assertEqual(self.profile["payload_schema_ref"],
                         OWNER_SCHEMA_REL + "#/$defs/ClientTrustLocalActionRequest")
        self.assertEqual(self.profile["receipt_refs"],
                         [OWNER_SCHEMA_REL + "#/$defs/ClientTrustLocalActionResult"])
        self.assertEqual(self.profile["dry_contract_ref"], SCHEMA_REL)
        self.assertEqual(self.profile["result_schema_ref"],
                         SCHEMA_REL + "#/$defs/ClientTrustLocalSettlement")
        self.assertEqual(self.profile["error_schema_ref"],
                         SCHEMA_REL + "#/$defs/ClientTrustLocalRefusal")
        self.assertEqual(self.profile["test_refs"],
                         [FIXTURE_REL, "Plans/server_system_contract_fixtures.json"])

    def test_error_schema_ref_resolves_to_a_real_refusal_definition(self):
        schema = load(candidate_path(SCHEMA_REL))
        pointer = self.profile["error_schema_ref"].split("#", 1)[1]
        current = schema
        for token in pointer.lstrip("/").split("/"):
            self.assertIn(token, current)
            current = current[token]
        reason = current["properties"]["reason_code"]
        if "$ref" in reason:
            reason = schema["$defs"][reason["$ref"].rsplit("/", 1)[1]]
        self.assertIn("stale_projection", reason["enum"])
        self.assertIn("handler_unavailable", reason["enum"])
        self.assertNotIn("presented", reason["enum"])

    def test_row_stays_partial_with_exact_local_identity(self):
        self.assertEqual(self.row[1], PROFILE_ID)
        self.assertEqual(self.row[2], "ui_action")
        self.assertEqual(self.row[3], ACTION_ID)
        self.assertEqual(self.row[4], "partial")

    def test_only_the_selected_profile_changed_against_the_pinned_input(self):
        candidate = load(candidate_path(TOUCH_REL))
        pinned = json.loads(pinned_text(TOUCH_REL))
        if not (CASE_ROOT / "inputs" / TOUCH_REL).is_file():
            # Later unrelated profiles/rows may evolve; preserve this action's
            # exact migration against the pinned pre-integration source.
            for registry in (candidate, pinned):
                registry["profiles"] = [p for p in registry["profiles"] if p["profile_id"] == PROFILE_ID]
                registry["rows"] = [r for r in registry["rows"] if r[0] == "TOUCH-SGAPLOCAL-019"]
        self.assertEqual(len(candidate["profiles"]), len(pinned["profiles"]))
        self.assertEqual(candidate["rows"], pinned["rows"])
        self.assertEqual(candidate["schema_id"], pinned["schema_id"])
        changed = []
        for new, old in zip(candidate["profiles"], pinned["profiles"]):
            if new != old:
                changed.append((old["profile_id"], old, new))
        self.assertEqual([name for name, _, _ in changed], [PROFILE_ID])
        _, old, new = changed[0]
        self.assertEqual(
            {key for key in set(old) | set(new) if old.get(key) != new.get(key)},
            {"dry_contract_ref", "result_schema_ref", "error_schema_ref", "test_refs"},
        )


class NarrowEnrollmentTests(unittest.TestCase):
    """The copied gate is enrolled narrowly; whole-tree gates stay with root."""

    def test_live_gate_selects_client_records_with_offline_owner_registry(self):
        gate = runpy.run_path(str(CANDIDATE / "scripts/pm-new-contracts-verify.py"))
        registry = gate["offline_schema_registry"]()
        schema = load(candidate_path(SCHEMA_REL))
        for row in load(candidate_path(FIXTURE_REL))["valid"]:
            _, selected = gate["select_definition"](
                schema, row, row["value"], require_valid=True, registry=registry)
            self.assertEqual(list(gate["validator_for"](
                schema, selected, registry).iter_errors(row["value"])), [])

    def test_contract_pair_manifest_enrolls_exactly_the_new_pair(self):
        text = (CANDIDATE / "scripts/pm-new-contracts-verify.py").read_text()
        self.assertIn(
            '("Plans/client_trust_local_settlement.schema.json", '
            '"Plans/client_trust_local_settlement_fixtures.json"),',
            text,
        )
        pairs, count = manifest(text)
        old_pairs, _ = manifest(pinned_text("scripts/pm-new-contracts-verify.py"))
        self.assertEqual(len(pairs), count)
        self.assertTrue(set(old_pairs).issubset(set(pairs)))
        self.assertEqual(sum(p[0] == SCHEMA_REL for p in pairs), 1)
        self.assertIn(
            "from pm_client_trust_local_settlement import "
            "client_trust_local_settlement_semantic_failures",
            text,
        )
        self.assertIn(
            'if schema_rel == "Plans/client_trust_local_settlement.schema.json":\n'
            "        return client_trust_local_settlement_semantic_failures(definition_name, value)",
            text,
        )

    def test_copied_gate_differs_from_the_pinned_input_only_in_enrollment(self):
        pinned = pinned_text("scripts/pm-new-contracts-verify.py").splitlines(keepends=True)
        candidate = (CANDIDATE / "scripts/pm-new-contracts-verify.py").read_text().splitlines(keepends=True)
        diff = list(difflib.unified_diff(pinned, candidate, n=0))
        changed = [line for line in diff
                   if line.startswith(("+", "-")) and not line.startswith(("+++", "---"))]
        expected = {
            "+from pm_client_trust_local_settlement import client_trust_local_settlement_semantic_failures\n",
            "+    (\"Plans/client_trust_local_settlement.schema.json\", \"Plans/client_trust_local_settlement_fixtures.json\"),\n",
            "+EXPECTED_CONTRACT_PAIR_COUNT = 82\n",
            "-EXPECTED_CONTRACT_PAIR_COUNT = 81\n",
            "+    if schema_rel == \"Plans/client_trust_local_settlement.schema.json\":\n",
            "+        return client_trust_local_settlement_semantic_failures(definition_name, value)\n",
        }
        if not (CASE_ROOT / "inputs/scripts/pm-new-contracts-verify.py").is_file():
            # The live manifest includes other accepted companions and can
            # grow later. This test isolates this companion's enrollment.
            changed = [line for line in changed if "client_trust_local_settlement" in line]
            expected = {line for line in expected if "client_trust_local_settlement" in line}
        self.assertEqual(set(changed), expected)


if __name__ == "__main__":
    unittest.main()
