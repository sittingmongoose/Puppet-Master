"""Focused static checks for the owner-local settlement companion (RSC-014).

No native updater, local controller, GUI surface, storage value, command
dispatcher, or EventRecord executes here. The pack is joined to the pinned
owner schema by $id so a changed owner family fails this suite instead of
silently validating a stale copy.
"""
import copy
import json
from pathlib import Path
import sys
import unittest

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from pm_application_update_local_result import (  # noqa: E402
    CURRENTNESS,
    DEFINITION,
    LOCAL_ACTION_IDS,
    REFUSAL_REASONS,
    local_settlement_semantic_failures,
)

SCHEMA_REL = "Plans/application_update_local_result.schema.json"
FIXTURE_REL = "Plans/application_update_local_result_fixtures.json"
OWNER_SCHEMA_REL = "Plans/release_update_contracts.schema.json"


def load(rel):
    return json.loads((ROOT / rel).read_text())


class LocalSettlementTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = load(SCHEMA_REL)
        cls.fixtures = load(FIXTURE_REL)
        cls.owner = load(OWNER_SCHEMA_REL)
        cls.registry = Registry().with_resource(
            cls.owner["$id"], Resource.from_contents(cls.owner)
        ).with_resource(cls.schema["$id"], Resource.from_contents(cls.schema))

    def validator(self, definition=DEFINITION):
        schema = dict(self.schema)
        schema.pop("oneOf", None)
        schema["$ref"] = f"#/$defs/{definition}"
        return Draft202012Validator(schema, registry=self.registry, format_checker=FormatChecker())

    def owner_validator(self, definition):
        schema = dict(self.owner)
        schema.pop("oneOf", None)
        schema["$ref"] = f"#/$defs/{definition}"
        return Draft202012Validator(schema)  # owner defs are self-contained

    def cases(self, group):
        return list(self.fixtures[group])

    def case(self, name):
        for group in ("valid", "invalid"):
            for row in self.fixtures[group]:
                if row["name"] == name:
                    return copy.deepcopy(row["value"])
        raise AssertionError(f"unknown fixture case {name}")

    def semantic(self, value):
        return local_settlement_semantic_failures(DEFINITION, value)

    def test_schema_and_fixture_metadata(self):
        Draft202012Validator.check_schema(self.schema)
        self.assertEqual(self.schema["$schema"], "https://json-schema.org/draft/2020-12/schema")
        self.assertEqual(self.fixtures["contract_schema_id"], self.schema["x-schema-id"])
        self.assertEqual(self.fixtures["schema_ref"], SCHEMA_REL)
        self.assertEqual(self.fixtures["owner_request_schema"], OWNER_SCHEMA_REL)
        self.assertEqual(set(self.schema["x-local-action-ids"]), set(LOCAL_ACTION_IDS))
        self.assertIsInstance(self.fixtures["claim_boundary"], str)
        self.assertFalse(self.fixtures["coverage"]["runtime_evidence_claimed"])
        self.assertFalse(self.fixtures["coverage"]["central_ui_command_response_routed"])
        self.assertTrue(self.fixtures["composed_owner_family"]["unchanged_owner_artifacts"])
        self.assertEqual(
            self.fixtures["composed_owner_family"]["local_actions"],
            [f"ui.update.app.{short}" for short in ("open_details", "open_logs", "open_release_notes")],
        )

    def test_vocabulary_reuses_owner_tokens_only(self):
        reasons = set(self.schema["$defs"]["ApplicationUpdateLocalRefusalReason"]["enum"])
        self.assertEqual(reasons, set(REFUSAL_REASONS))
        self.assertEqual(set(self.schema["x-refusal-reason-vocabulary"]), reasons)
        owner_error = set(
            self.owner["$defs"]["ApplicationUpdateCommandError"]["properties"]["code"]["enum"]
        )
        owner_disabled = set(
            self.owner["$defs"]["ApplicationUpdateDisabledReason"]["properties"]["code"]["enum"]
        )
        # The refusal reasons are owner tokens of this exact family.
        self.assertLessEqual(
            {"invalid_request", "handler_unavailable", "permission_denied", "identity_mismatch"},
            owner_error,
        )
        self.assertLessEqual(
            {"handler_unavailable", "permission_denied", "identity_mismatch"}, owner_disabled
        )
        # stale_projection is the closed central/local-table currentness token,
        # not a command family token.
        central = load("Plans/ui_command_response.schema.json")
        self.assertIn(
            "stale_projection",
            central["$defs"]["UICommandError"]["properties"]["code"]["enum"],
        )
        self.assertNotIn("stale_projection", owner_error)
        # No reason outside the owner vocabulary is admitted.
        self.assertLessEqual(
            reasons, owner_error | {"stale_projection", "caller_unavailable"}
        )
        self.assertEqual(
            set(self.schema["$defs"]["ApplicationUpdateLocalCurrentness"]["enum"]), set(CURRENTNESS)
        )
        self.assertEqual(
            set(self.owner["$defs"]["ApplicationUpdateCommandOutput"]["properties"]["currentness"]["enum"]),
            set(CURRENTNESS),
        )
        self.assertEqual(
            set(self.owner["$defs"]["ApplicationUpdateLocalActionId"]["enum"]),
            set(LOCAL_ACTION_IDS),
        )
        self.assertEqual(
            set(self.schema["x-excluded-owner-reason-codes"]),
            (owner_error | owner_disabled) - set(REFUSAL_REASONS),
        )

    def test_positive_fixtures_settle_exactly(self):
        validator = self.validator()
        settled_actions = set()
        for row in self.cases("valid"):
            value = row["value"]
            errors = list(validator.iter_errors(value))
            self.assertEqual(errors, [], f"{row['name']}: {errors[:1]}")
            self.assertEqual(self.semantic(value), [], row["name"])
            settled_actions.add(value["request"]["local_action_id"])
        self.assertEqual(settled_actions, set(LOCAL_ACTION_IDS))

    def test_positive_cases_cover_presented_and_every_genuine_refusal(self):
        outcomes = {}
        opened_elsewhere = 0
        for row in self.cases("valid"):
            value = row["value"]
            outcomes.setdefault(value["request"]["local_action_id"], set()).add(value["outcome"])
            return_context = value["request"]["return_context"]
            if value["outcome"] == "presented":
                self.assertIsNotNone(value["owner_result"])
                # The return restores the authentic initiating focus; the opened
                # target lives in the owner result and may differ from it.
                self.assertEqual(
                    value["return_settlement"]["focus_target"], return_context["focus_target"]
                )
                self.assertEqual(
                    value["request"]["expected_projection_generation"],
                    value["owner_current_projection"]["projection_generation"],
                )
                if value["owner_result"]["accessible_focus_target"] != return_context["focus_target"]:
                    opened_elsewhere += 1
            else:
                self.assertIsNone(value["owner_result"], row["name"])
                self.assertEqual(value["refusal"]["reason_code"], value["outcome"])
                if value["return_settlement"]["restoration"] == "restored":
                    self.assertEqual(
                        value["return_settlement"]["focus_target"], return_context["focus_target"]
                    )
                else:
                    self.assertIsNone(value["return_settlement"]["focus_target"])
        for action_id, seen in outcomes.items():
            self.assertEqual(
                seen,
                {"presented", "permission_denied", "stale_projection", "handler_unavailable", "caller_unavailable"},
                action_id,
            )
        self.assertEqual(opened_elsewhere, 2)

    def test_embedded_owner_records_stay_exactly_owner_admitted(self):
        request_validator = self.owner_validator("ApplicationUpdateLocalActionRequest")
        result_validator = self.owner_validator("ApplicationUpdateLocalActionResult")
        for row in self.cases("valid"):
            value = row["value"]
            self.assertEqual(list(request_validator.iter_errors(value["request"])), [], row["name"])
            if value["owner_result"] is not None:
                self.assertEqual(list(result_validator.iter_errors(value["owner_result"])), [], row["name"])

    def test_structural_negatives_are_rejected_by_the_schema(self):
        validator = self.validator()
        structural = [row for row in self.cases("invalid") if "semantic_rule" not in row]
        self.assertTrue(structural)
        for row in structural:
            errors = list(validator.iter_errors(row["value"]))
            self.assertTrue(errors, f"{row['name']} was accepted")
            # A structural negative must fail for its authored violation, never
            # because a fixture name leaked into the record identity.
            paths = {"/".join(str(part) for part in error.absolute_path) for error in errors}
            self.assertNotIn("settlement_id", paths, row["name"])
        secret = [row for row in structural if row["name"].endswith("raw_secret_ref")]
        self.assertTrue(secret)
        for row in secret:
            paths = {
                "/".join(str(part) for part in error.absolute_path)
                for error in validator.iter_errors(row["value"])
            }
            self.assertIn("owner_current_projection/projection_ref", paths, row["name"])

    def test_semantic_negatives_are_structurally_valid_and_causally_wrong(self):
        validator = self.validator()
        semantic = [row for row in self.cases("invalid") if "semantic_rule" in row]
        self.assertTrue(semantic)
        for row in semantic:
            value = row["value"]
            self.assertEqual(
                list(validator.iter_errors(value)), [], f"{row['name']} is not structurally valid"
            )
            self.assertIn(row["semantic_rule"], self.semantic(value), row["name"])

    def test_required_dimensions_and_actions_are_covered(self):
        names = [row["name"] for row in self.cases("invalid")]
        expected = {
            "owner_result_action_identity",
            "projection_ref_identity",
            "success_on_stale_generation",
            "stale_currentness_unproven",
            "caller_invocation_identity",
            "return_focus_identity",
            "opened_and_return_focus_changed",
            "foreign_owner_result_projection",
            "owner_result_return_context",
            "success_without_mounted_controller",
            "handler_unavailable_with_controller",
            "caller_unavailable_claim",
            "refusal_reason_mismatch",
            "retired_action_identity",
            "denial_reported_as_success",
            "refusal_with_success_projection",
            "owner_result_domain_event",
            "owner_result_domain_mutation",
            "raw_secret_ref",
            "domain_command_identity",
        }
        for action in ("details", "logs", "release_notes"):
            for suffix in expected:
                self.assertIn(f"negative.settlement.{action}.{suffix}", names)
        self.assertEqual(self.fixtures["coverage"]["local_action_rows"], len(LOCAL_ACTION_IDS))
        self.assertFalse(self.fixtures["coverage"]["central_ui_command_response_routed"])
        coverage = self.fixtures["coverage"]
        valid, invalid = self.cases("valid"), self.cases("invalid")
        presented = [row for row in valid if row["value"]["outcome"] == "presented"]
        structural = [row for row in invalid if "semantic_rule" not in row]
        semantic = [row for row in invalid if "semantic_rule" in row]
        self.assertEqual(coverage["positive_cases"], len(valid))
        self.assertEqual(coverage["negative_cases"], len(invalid))
        self.assertEqual(coverage["presented_cases"], len(presented))
        self.assertEqual(coverage["refused_cases"], len(valid) - len(presented))
        self.assertEqual(coverage["structural_negatives_per_action"], len(structural) // len(LOCAL_ACTION_IDS))
        self.assertEqual(coverage["semantic_negatives_per_action"], len(semantic) // len(LOCAL_ACTION_IDS))
        self.assertEqual(len(structural) % len(LOCAL_ACTION_IDS), 0)
        self.assertEqual(len(semantic) % len(LOCAL_ACTION_IDS), 0)
        self.assertEqual(
            sorted(coverage["refusal_reasons"]),
            sorted({row["value"]["outcome"] for row in valid if row["value"]["outcome"] != "presented"}),
        )

    def test_changed_owner_projection_or_return_identity_fails(self):
        for name in (
            "negative.settlement.logs.projection_ref_identity",
            "negative.settlement.logs.caller_invocation_identity",
            "negative.settlement.logs.owner_result_action_identity",
        ):
            value = self.case(name)
            self.assertTrue(self.semantic(value), name)
        changed = self.case("positive.settlement.logs.presented")
        self.assertEqual(self.semantic(changed), [])
        changed["return_settlement"]["invocation_token"] = "return:settings.updates:2"
        self.assertIn("local_settlement_return_identity_mismatch", self.semantic(changed))

    def test_opened_target_is_separate_from_return_restoration(self):
        # The reviewed finding: a presented settlement must not be able to move
        # the initiating focus while the downstream values agree.
        changed = self.case("positive.settlement.details.presented")
        self.assertEqual(self.semantic(changed), [])
        changed["owner_result"]["accessible_focus_target"] = "foreign-focus"
        changed["return_settlement"]["focus_target"] = "foreign-focus"
        failures = self.semantic(changed)
        self.assertIn("local_settlement_return_focus_mismatch", failures)
        self.assertEqual(
            changed["request"]["return_context"]["focus_target"], "update-details"
        )
        # Opening a different target is legitimate as long as the caller is
        # returned to the exact initiating focus.
        opened = self.case("positive.settlement.logs.presented_opened_elsewhere")
        self.assertEqual(self.semantic(opened), [])
        self.assertNotEqual(
            opened["owner_result"]["accessible_focus_target"],
            opened["request"]["return_context"]["focus_target"],
        )
        self.assertEqual(
            opened["return_settlement"]["focus_target"],
            opened["request"]["return_context"]["focus_target"],
        )
        for name in (
            "negative.settlement.details.opened_and_return_focus_changed",
            "negative.settlement.logs.opened_and_return_focus_changed",
            "negative.settlement.release_notes.opened_and_return_focus_changed",
        ):
            self.assertIn("local_settlement_return_focus_mismatch", self.semantic(self.case(name)))

    def test_opaque_owner_refs_are_not_scanned_for_command_substrings(self):
        # Reviewed finding: a projection/log ref is content provenance, not an
        # action identity, so an owner-valid ref that names a command stays
        # admissible; the typed identity slots and domain_command_id decide.
        value = self.case("positive.settlement.details.presented")
        self.assertEqual(self.semantic(value), [])
        origin = "projection:cmd.update.app.check"
        for path, mutate in (
            (("request", "projection_ref"), None),
            (("owner_current_projection", "projection_ref"), None),
            (("owner_result", "projection_ref"), None),
        ):
            value[path[0]][path[1]] = origin
        self.assertEqual(self.semantic(value), [])
        self.assertEqual(
            list(self.validator().iter_errors(value)), []
        )
        self.assertEqual(value["domain_command_id"], None)
        self.assertEqual(value["request"]["local_action_id"], "ui.update.app.open_details")
        # The same spelling in an actual typed identity slot is impossible.
        retired = self.case("negative.settlement.details.retired_action_identity")
        self.assertEqual(retired["request"]["local_action_id"], "cmd.update.app.open_details")
        paths = {
            "/".join(str(part) for part in error.absolute_path)
            for error in self.validator().iter_errors(retired)
        }
        self.assertIn("request/local_action_id", paths)
        # And the command-origin positives are admitted for all three actions.
        for name in ("details", "logs", "release_notes"):
            row = self.case(f"positive.settlement.{name}.command_origin_projection_ref")
            self.assertIn("cmd.update.app.check", row["request"]["projection_ref"])
            self.assertEqual(self.semantic(row), [])

    def test_helper_fails_closed_on_direct_calls(self):
        value = self.case("positive.settlement.details.presented")
        self.assertEqual(self.semantic(value), [])
        self.assertEqual(local_settlement_semantic_failures("OtherRecord", value), [])
        self.assertEqual(
            local_settlement_semantic_failures(DEFINITION, {"record_kind": "OtherRecord"}),
            ["local_settlement_malformed_input"],
        )
        for key, replacement, rule in (
            ("mutated_domain_state", True, "local_settlement_domain_effect_present"),
            ("domain_handler_invoked", True, "local_settlement_domain_effect_present"),
            ("domain_event_emitted", True, "local_settlement_domain_effect_present"),
            ("domain_command_id", "cmd.update.app.rollback", "local_settlement_domain_effect_present"),
            ("record_kind", "ApplicationUpdateLocalActionResult", "local_settlement_malformed_input"),
        ):
            tampered = self.case("positive.settlement.details.presented")
            tampered[key] = replacement
            self.assertIn(rule, self.semantic(tampered), key)
        leaked = self.case("positive.settlement.details.presented")
        leaked["refusal_safe_message"] = "carries a raw token"
        leaked["return_settlement"]["surface_ref"] = "surface:access_token"
        self.assertIn("local_settlement_secret_material", self.semantic(leaked))

    def test_refusal_never_carries_a_domain_command_or_event(self):
        for row in self.cases("valid"):
            value = row["value"]
            if value["outcome"] == "presented":
                continue
            self.assertIsNone(value["domain_command_id"])
            self.assertFalse(value["domain_event_emitted"])
            self.assertFalse(value["domain_handler_invoked"])
            self.assertFalse(value["mutated_domain_state"])
            self.assertNotIn("cmd.", json.dumps(value))


if __name__ == "__main__":
    unittest.main()
