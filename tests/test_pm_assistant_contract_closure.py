"""Static Assistant Plans contract-closure regressions (PM-ASSISTANT-CONTRACT-CLOSURE-2026-09-22-v1).

Pins the closure evidence for the five reported storage-binding findings (ACC-ST-01..05), the
BSD event/effect authority boundary (ACC-BSD-01), and the proof-truthfulness guardrail
(ACC-TRUTH-01). These are static contract checks over live Plans source: they prove schema,
registry, wiring, and owner-reference agreement only, never native runtime, handler,
persistence, event emission, or governance-seal results.

Wave 2 (CCR-01/CCR-02, 2026-09-23) adds BsdLifecycleRecordClosureTests: typed record contracts for the six
`pm.bsd.*` lifecycle families, the central durable/pending disposition row, and executed positive, negative,
and broken-reference fixture evidence.
"""

from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest import mock

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
FIXTURES_PATH = ROOT / "tests" / "fixtures" / "assistant_contract_closure" / "payload_fixtures.json"


def _load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def _load_module(name: str, relpath: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / relpath)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


# Reuse the central checker's exact-case reference resolver and Touch Closure materializer
# rather than re-implementing a second resolution semantics.
checker = _load_module("assistant_contract_check_for_closure", "scripts/pm-assistant-contract-check.py")
shared_runtime_validator = _load_module(
    "shared_runtime_command_contracts_for_closure", "scripts/pm-shared-runtime-command-contracts.py"
)

REGISTRY = _load_json(ROOT / "Plans" / "storage_value_registry.json")
REGISTRY_SCHEMA = _load_json(ROOT / "Plans" / "storage_value_registry.schema.json")
CUSTODY = _load_json(ROOT / "Plans" / "goal_execution_binding_custody.schema.json")
CANCEL_CUSTODY = _load_json(ROOT / "Plans" / "assistant_plan_cancel_custody.schema.json")
SHARED_COMMANDS = _load_json(ROOT / "Plans" / "shared_runtime_command_contracts.schema.json")
SHARED_RUNTIME = _load_json(ROOT / "Plans" / "shared_runtime_contracts.schema.json")
WIRING = _load_json(ROOT / "Plans" / "Wiring_Matrix.production.json")
EVENT_REGISTRY = _load_json(ROOT / "Plans" / "event_family_registry.json")
SETTINGS = _load_json(ROOT / "Plans" / "settings_inventory.json")
TOUCH = _load_json(ROOT / "Plans" / "touch_closure.json")
GATE_REPORT = _load_json(ROOT / "Plans" / ".implementation_readiness" / "buildability_gate_report.json")
FIXTURES = _load_json(FIXTURES_PATH)
BSD_RECORDS = _load_json(ROOT / "Plans" / "back_seat_driver_contracts.schema.json")
REDACTION_TRANSFORMS = _load_json(ROOT / "Plans" / "redaction_transform_registry.json")

APR_TEXT = (ROOT / "Plans" / "Assistant_Plan_Runtime.md").read_text(encoding="utf-8")
CV0_TEXT = (ROOT / "Plans" / "Contracts_V0.md").read_text(encoding="utf-8")
CS_TEXT = (ROOT / "Plans" / "Commands_System.md").read_text(encoding="utf-8")
SP_TEXT = (ROOT / "Plans" / "storage-plan.md").read_text(encoding="utf-8")
GRS_TEXT = (ROOT / "Plans" / "Goal_Runtime_System.md").read_text(encoding="utf-8")
SQR_TEXT = (ROOT / "Plans" / "Scheduling_and_Quota_Resume.md").read_text(encoding="utf-8")
TDR_TEXT = (ROOT / "Plans" / "ToDo_Runtime.md").read_text(encoding="utf-8")
BSD_TEXT = (ROOT / "Plans" / "Back_Seat_Driver.md").read_text(encoding="utf-8")
SIR_TEXT = (ROOT / "Plans" / "Shared_Integration_Runtime.md").read_text(encoding="utf-8")
REGISTRY_TEXT = (ROOT / "Plans" / "storage_value_registry.json").read_text(encoding="utf-8")

REPORTED_NAMES = [
    "PlanProgressProjection",
    "GoalPlanBinding",
    "PlanningQuestionBudget",
    "ScheduledMessageProjection",
    "ToDoOutcomeRecord",
]

BSD_DECLARED_EVENTS = [
    "bsd.policy_changed",
    "bsd.workflow_binding_created",
    "bsd.assignment_started",
    "bsd.assignment_paused",
    "bsd.assignment_resumed",
    "bsd.assignment_stopped",
    "bsd.review_started",
    "bsd.finding_held",
    "bsd.finding_reconfirmed",
    "bsd.finding_cleared",
    "bsd.advice_emitted",
    "bsd.finding_suppressed",
    "bsd.review_failed",
    "bsd.review_timed_out",
    "bsd.output_quarantined",
]

BSD_DISABLED_REASONS = ["stale_projection", "already_in_state", "policy_denied", "permission_required"]


def family(fid: str) -> dict:
    hits = [f for f in REGISTRY["families"] if f["family_id"] == fid]
    if len(hits) != 1:
        raise AssertionError(f"expected exactly one family {fid}, found {len(hits)}")
    return hits[0]


def section(text: str, start_marker: str, end_marker: str) -> str:
    start = text.index(start_marker)
    end = text.index(end_marker, start)
    return text[start:end]


def validator_for(doc: dict, def_name: str) -> Draft202012Validator:
    registry = Registry().with_resource(doc["$id"], Resource.from_contents(doc))
    return Draft202012Validator({"$ref": f"{doc['$id']}#/$defs/{def_name}"}, registry=registry)


def apply_mutation(payload: dict, mutation: dict) -> dict:
    mutated = copy.deepcopy(payload)
    if "remove" in mutation:
        del mutated[mutation["remove"]]
    if "set" in mutation:
        mutated.update(mutation["set"])
    return mutated


def schema_doc_for(def_name: str) -> dict:
    if def_name in CUSTODY.get("$defs", {}):
        return CUSTODY
    if def_name in SHARED_COMMANDS.get("$defs", {}):
        return SHARED_COMMANDS
    if def_name in BSD_RECORDS.get("$defs", {}):
        return BSD_RECORDS
    if def_name in CANCEL_CUSTODY.get("$defs", {}):
        return CANCEL_CUSTODY
    raise AssertionError(f"unknown fixture schema def: {def_name}")


def run_negative_fixtures(test: unittest.TestCase, *schemas: str) -> None:
    """Assert each selected negative fixture fails for its intended defect (D02)."""
    positive = FIXTURES["positive"]
    ran = 0
    for negative in FIXTURES["negative"]:
        if negative["schema"] not in schemas:
            continue
        ran += 1
        mutated = apply_mutation(positive[negative["target"]], negative["mutation"])
        validator = validator_for(schema_doc_for(negative["schema"]), negative["schema"])
        errors = list(validator.iter_errors(mutated))
        test.assertTrue(errors, f"{negative['negative_id']} was not rejected")
        expected_path = negative.get("expected_path")
        expected_field = negative.get("expected_message_field")
        matched = any(
            e.validator == negative["expected_keyword"]
            and (expected_path is None or list(e.absolute_path)[: len(expected_path)] == expected_path)
            and (expected_field is None or expected_field in e.message)
            for e in errors
        )
        detail = [(e.validator, list(e.absolute_path), e.message[:120]) for e in errors]
        test.assertTrue(
            matched,
            f"{negative['negative_id']} rejected for the wrong reason: {detail}",
        )
    test.assertGreaterEqual(ran, 2)


class RegistryBindingHygieneTests(unittest.TestCase):
    """The reported `payload_schema_ref: NONE` regression can never re-enter the registry."""

    def test_registry_validates_against_own_schema(self) -> None:
        Draft202012Validator.check_schema(REGISTRY_SCHEMA)
        errors = list(Draft202012Validator(REGISTRY_SCHEMA).iter_errors(REGISTRY))
        self.assertEqual(errors, [], [str(e)[:200] for e in errors[:5]])

    def test_no_none_binding_values_anywhere(self) -> None:
        self.assertNotIn('"NONE"', REGISTRY_TEXT)
        for fam in REGISTRY["families"]:
            self.assertTrue(fam["value_schema_ref"].strip(), fam["family_id"])

    def test_reported_finding_shape_is_not_reproducible(self) -> None:
        # The registry has no payload_schema_ref field at all and no NONE binding value, so the
        # reported `payload_schema_ref: "NONE"` observation has no live referent in this file.
        self.assertNotIn("payload_schema_ref", REGISTRY_TEXT)
        self.assertNotIn('"NONE"', REGISTRY_TEXT)
        # Four of the five reported names have no registry row: their central representation is
        # the owner contract plus the CS-078 adjudication queue, pinned in the tests below. The
        # fifth, GoalPlanBinding, is bound by the goal_plan_binding family (GoalPlanBindingClosureTests);
        # its only textual occurrences are that family's binding references.
        family_ids = {f["family_id"] for f in REGISTRY["families"]}
        for fid in (
            "plan_progress_projection",
            "planning_question_budget",
            "scheduled_message_projection",
            "to_do_outcome_record",
            "progress_projection",
            "question_budget",
            "message_projection",
            "todo_outcome",
        ):
            self.assertNotIn(fid, family_ids)
        record_kinds = {
            kind
            for row in REGISTRY["contract_family_dispositions"]
            for kind in row["record_kinds"]
        }
        for schema_id in (
            "pm.assistant_plan.progress_projection.v1",
            "pm.assistant_plan.question_budget_projection.v1",
            "pm.assistant_plan.question_budget_policy.v2",
            "pm.schedule.message_projection.v1",
            "pm.chat.todo_transition.v1",
        ):
            self.assertNotIn(schema_id, record_kinds)

    def test_every_value_schema_ref_resolves_or_is_declared(self) -> None:
        by_id = {f["family_id"]: f for f in REGISTRY["families"]}
        for fam in REGISTRY["families"]:
            ref = fam["value_schema_ref"]
            fid = fam["family_id"]
            if ref.startswith("deferred:"):
                self.assertIn(
                    fam["status"], ("deferred_not_build_blocking", "compatibility_alias"), fid
                )
                for key in ("deferred_owner", "deferred_reason", "reopen_condition"):
                    self.assertTrue(fam.get(key), f"{fid} missing {key}")
            elif ref.startswith("Plans/storage_value_registry.json#/families/"):
                tail = ref.split("#/families/", 1)[1]
                target, _, rest = tail.partition("/")
                self.assertEqual(target, fid, "inline pointer must address its own family")
                self.assertEqual(rest, "value_schema")
                self.assertIn("value_schema", by_id[fid], fid)
            elif ref.startswith("Plans/"):
                checker.resolve(ROOT, ref)  # raises on missing file, case drift, or bad pointer
            elif ref.startswith("https://puppetmaster.local/proposals/"):
                # Provenance-only proposal URIs are permitted solely with an inline schema.
                self.assertIn("value_schema", fam, fid)
            else:
                self.fail(f"{fid}: unaccepted value_schema_ref representation {ref}")


class GoalPlanBindingClosureTests(unittest.TestCase):
    """ACC-ST-02: one authoritative versioned payload contract, centrally bound and resolvable."""

    def test_family_binding_chain_resolves(self) -> None:
        fam = family("goal_plan_binding")
        self.assertEqual(fam["status"], "materialized")
        self.assertEqual(
            fam["value_schema_ref"],
            "Plans/goal_execution_binding_custody.schema.json#/$defs/StorageGoalPlanBinding",
        )
        self.assertEqual(fam["owner_doc"], "Plans/storage-plan.md#SP-305")
        self.assertTrue(fam["key_shape"].startswith("goal_plan_binding.v1:"))
        storage_def = CUSTODY["$defs"]["StorageGoalPlanBinding"]
        self.assertEqual(
            storage_def["properties"]["schema_id"]["const"], "pm.storage_value.goal_plan_binding.v1"
        )
        binding = CUSTODY["$defs"]["GoalPlanBinding"]
        self.assertEqual(
            set(binding["required"]),
            {
                "goal_id",
                "assistant_plan_id",
                "plan_version",
                "plan_hash",
                "plan_run_id",
                "todo_list_ref",
                "planunit_bundle_ref",
            },
        )
        self.assertEqual(binding["properties"]["plan_hash"]["pattern"], "^[0-9a-f]{64}$")
        bundle = binding["properties"]["planunit_bundle_ref"]["oneOf"]
        self.assertIn({"type": "null"}, bundle)  # Regular Plan null bundle stays accepted (G01)

    def test_inline_and_external_schemas_agree(self) -> None:
        fam = family("goal_plan_binding")
        inline = copy.deepcopy(fam["value_schema"])
        record_ref = inline["properties"]["record"]["$ref"]
        self.assertTrue(record_ref.startswith(CUSTODY["$id"]), "inline record ref must target the custody schema")
        inline["properties"]["record"]["$ref"] = "#/$defs/GoalPlanBinding"
        self.assertEqual(inline, CUSTODY["$defs"]["StorageGoalPlanBinding"])

    def test_owner_docs_agree_on_the_binding(self) -> None:
        self.assertIn("pm.goal.plan_binding.v1", GRS_TEXT)
        self.assertIn("seven-field GoalPlanBinding", GRS_TEXT)
        self.assertIn("`pm.goal.plan_binding.v1` | Assistant_Plan_Runtime + Goal_Runtime", CV0_TEXT)
        self.assertIn(
            "Do not admit a storage writer before the record family is registered", CS_TEXT
        )
        self.assertIn("new storage writers stay disabled until that registration closes", APR_TEXT)

    def test_positive_fixtures_validate(self) -> None:
        positive = FIXTURES["positive"]
        binding_v = validator_for(CUSTODY, "GoalPlanBinding")
        for name in ("goal_plan_binding_deep", "goal_plan_binding_regular_null_bundle"):
            errors = list(binding_v.iter_errors(positive[name]))
            self.assertEqual(errors, [], f"{name}: {[str(e)[:200] for e in errors]}")
        envelope_v = validator_for(CUSTODY, "StorageGoalPlanBinding")
        errors = list(envelope_v.iter_errors(positive["goal_plan_binding_storage_envelope"]))
        self.assertEqual(errors, [], [str(e)[:200] for e in errors])
        # The registry's inline value_schema is an equally authoritative view of the same envelope.
        inline_v = Draft202012Validator(
            family("goal_plan_binding")["value_schema"],
            registry=Registry().with_resource(CUSTODY["$id"], Resource.from_contents(CUSTODY)),
        )
        errors = list(inline_v.iter_errors(positive["goal_plan_binding_storage_envelope"]))
        self.assertEqual(errors, [], [str(e)[:200] for e in errors])

    def test_negative_fixtures_fail_for_the_intended_reason(self) -> None:
        run_negative_fixtures(self, "GoalPlanBinding", "StorageGoalPlanBinding")


class AssistantRecordClosureTests(unittest.TestCase):
    """ACC-ST-01/03/04/05: each record maps to one authoritative owner-declared contract."""

    def test_progress_projection_owner_contract(self) -> None:
        self.assertIn("pm.assistant_plan.progress_projection.v1", APR_TEXT)
        self.assertIn("`pm.assistant_plan.progress_projection.v1` | Assistant_Plan_Runtime", CV0_TEXT)
        rule = section(SP_TEXT, "Projections are rebuilt, never trusted as authority", "2. **Question charge")
        self.assertIn("PlanProgressProjection", rule)
        self.assertIn("currentness_hash", rule)

    def test_question_budget_types_are_explicitly_mapped(self) -> None:
        # QMAX-006 maps the durable question record per backend; the projection and the
        # policy record stay distinct named types (Q01).
        mapped = section(APR_TEXT, "### QMAX-006", "### QMAX-008")
        for token in (
            "pm.assistant_plan.deep_ledger_session.v1",
            "pm.brainstorm.question_bank.v1",
            "Plans/Collaborative_Workflows.md",
            "QuestionnaireEnvelope",
            "Plans/assistant-chat-design.md",
            "Plans/Planning_Ledger_System.md",
            "pm.assistant_plan.question_budget_projection.v1",
            "pm.assistant_plan.question_budget_policy.v2",
        ):
            self.assertIn(token, mapped)

    def test_question_budget_factory_values(self) -> None:
        settings = {s["id"]: s for s in SETTINGS["settings"]}
        expected = {
            "branching.plan.quick-question-limit": 3,
            "branching.plan.standard-question-limit": 6,
            "branching.plan.thorough-question-limit": 8,
            "branching.deep-plan.thorough-question-limit": 10,
            "branching.deep-plan.exhaustive-question-limit": 15,
            "branching.crew.brainstorm-question-limit": 20,
            "branching.crew.grill-me-question-extension": 25,
        }
        for setting_id, value in expected.items():
            self.assertEqual(settings[setting_id]["default"], value, setting_id)
        block = section(APR_TEXT, "### QMAX-001", "### QMAX-005")
        for total in (28, 31, 33, 35, 40, 45):  # base + 25, derived never stored
            self.assertIn(str(total), block)
            self.assertEqual(total - 25 in (3, 6, 8, 10, 15, 20), True)

    def test_scheduled_message_projection_and_durable_authority(self) -> None:
        self.assertIn("pm.schedule.message_projection.v1", SQR_TEXT)
        self.assertIn("pm.chat.scheduled_message_snapshot.v1", SQR_TEXT)
        rule = section(SP_TEXT, "Projections are rebuilt, never trusted as authority", "2. **Question charge")
        self.assertIn("ScheduledMessageProjection", rule)
        fam = family("execution_schedule")
        self.assertEqual(fam["status"], "materialized")
        checker.resolve(ROOT, fam["value_schema_ref"])
        schedule = CANCEL_CUSTODY["$defs"]["ExecutionSchedule"]
        self.assertEqual(schedule["properties"]["schema_id"]["const"], "pm.execution.schedule.v1")
        self.assertIn("scheduled_message", schedule["properties"]["target_kind"]["enum"])
        self.assertIn("`pm.chat.scheduled_message_snapshot.v1` | `Plans/Scheduling_and_Quota_Resume.md` | `required`", CS_TEXT)

    def test_todo_outcome_resolves_to_live_records(self) -> None:
        # The reported name does not exist; the live outcome attribution records do (T01).
        self.assertNotIn("ToDoOutcomeRecord", TDR_TEXT)
        self.assertNotIn("ToDoOutcomeRecord", SP_TEXT)
        self.assertNotIn("ToDoOutcomeRecord", CV0_TEXT)
        for record_id in ("pm.chat.todo_item.v2", "pm.chat.todo_work_binding.v1", "pm.chat.todo_transition.v1"):
            self.assertIn(record_id, TDR_TEXT)
            self.assertIn(f"| `{record_id}` | `Plans/ToDo_Runtime.md` | `required` |", CS_TEXT)
        self.assertIn("outcome_satisfied", TDR_TEXT)
        self.assertIn("A tool call returning successfully is evidence about the tool and not about the outcome", TDR_TEXT)


class BsdEventEffectClosureTests(unittest.TestCase):
    """ACC-BSD-01: deliberate receipt/projection-only design, centrally owned and typed."""

    def setUp(self) -> None:
        self.entries = WIRING["entries"]
        self.bsd_rows = [v for v in self.entries.values() if v.get("ui_command_id") == "cmd.bsd.set"]

    def test_exactly_one_production_row_with_both_producers(self) -> None:
        self.assertEqual(len(self.bsd_rows), 1)
        row = self.entries["catalog.bsd_set"]
        self.assertIs(row, self.bsd_rows[0])
        self.assertEqual(row["handler_location"], "handlers::back_seat_driver::set_mode")
        acceptance = " ".join(row["acceptance_checks"])
        self.assertIn("wand BSD sidecar", acceptance)
        self.assertIn("Assistant Chat Back Seat Driver control", acceptance)
        self.assertIn("two producers of this one command", acceptance)

    def test_receipt_only_effect_with_active_marker(self) -> None:
        row = self.bsd_rows[0]
        self.assertEqual(row["expected_event_types"], [])
        effect = row["effect_contract"]
        self.assertEqual(effect["effect_kind"], "receipt")
        self.assertIn("missing_event_registration", effect["receipt_or_event_refs"])
        self.assertIn("UNKNOWN_OPEN", effect["description"])

    def test_typed_request_result_resolve(self) -> None:
        row = self.bsd_rows[0]
        request = checker.resolve(ROOT, row["request_schema_ref"])
        result = checker.resolve(ROOT, row["result_schema_ref"])
        self.assertEqual(request["allOf"][1]["properties"]["command_id"]["const"], "cmd.bsd.set")
        self.assertEqual(
            set(request["allOf"][1]["required"]),
            {"scope_kind", "scope_id", "requested_mode", "expected_policy_revision"},
        )
        self.assertEqual(request["allOf"][1]["properties"]["requested_mode"]["enum"], ["Off", "Auto", "On"])
        self.assertEqual(result["allOf"][1]["properties"]["result_type"]["const"], "BackSeatDriverModeSetResult")
        envelope = SHARED_COMMANDS["$defs"]["command_result_envelope"]
        for field in ("projection_ref", "receipt_refs", "replayed", "original_operation_id", "command_outcome_ref"):
            self.assertIn(field, envelope["required"])
        request_envelope = SHARED_COMMANDS["$defs"]["command_request_envelope"]
        for field in ("idempotency", "command_instance_id", "topology_generation", "permission_snapshot_ref"):
            self.assertIn(field, request_envelope["required"])

    def test_command_fixtures_validate_and_negatives_fail(self) -> None:
        positive = FIXTURES["positive"]
        request_v = validator_for(SHARED_COMMANDS, "back_seat_driver_mode_set_request")
        result_v = validator_for(SHARED_COMMANDS, "back_seat_driver_mode_set_result")
        self.assertEqual(list(request_v.iter_errors(positive["bsd_mode_set_request"])), [])
        self.assertEqual(list(result_v.iter_errors(positive["bsd_mode_set_result"])), [])
        run_negative_fixtures(
            self, "back_seat_driver_mode_set_request", "back_seat_driver_mode_set_result"
        )

    def test_disabled_reasons_closed_set(self) -> None:
        row = self.bsd_rows[0]
        acceptance = " ".join(row["acceptance_checks"])
        enum = SHARED_COMMANDS["$defs"]["disabled_reason"]["enum"]
        for reason in BSD_DISABLED_REASONS:
            self.assertIn(reason, acceptance)
            self.assertIn(reason, enum)

    def test_bsd_runtime_record_family_resolves(self) -> None:
        fam = family("bsd_runtime_record")
        self.assertEqual(fam["status"], "materialized")
        definition = checker.resolve(ROOT, fam["value_schema_ref"])
        self.assertEqual(definition["properties"]["schema_id"]["const"], "pm.shared_runtime.bsd_runtime_record.v1")
        self.assertTrue(fam["replay_behavior"].strip())
        recovery = fam["recovery_disposition"]
        self.assertEqual(recovery["authority_class"], "canonical_non_rebuildable")
        self.assertTrue(recovery["backup_required"])

    def test_declared_bsd_events_stay_unregistered(self) -> None:
        registered = {r["event_type"] for r in EVENT_REGISTRY["families"]}
        for name in BSD_DECLARED_EVENTS:
            self.assertIn(name, BSD_TEXT)  # §19 declares the exact semantic names
            self.assertNotIn(name, registered)  # none is admitted; none is guessed into a column
        self.assertFalse(any(t.startswith("bsd.") for t in registered))

    def test_markers_are_central_policy_not_stale_residue(self) -> None:
        self.assertIn("Event Authority denominator `UNKNOWN_OPEN`", SIR_TEXT)
        self.assertIn("No bulk registration or inferred closure", SIR_TEXT)
        self.assertIn("Until that registration closes, BSD writes receipts and projections only", BSD_TEXT)
        self.assertIn("records `missing_event_registration`", BSD_TEXT)
        self.assertIn("Do not emit an unregistered EventRecord", BSD_TEXT)
        self.assertIn("Required but unadmitted EventRecord families remain missing_event_registration", BSD_TEXT)

    def test_touch_closure_rows_claim_no_event_or_native_handler(self) -> None:
        rows = [r for r in checker.materialize_touch(TOUCH) if r["action_id"].startswith("cmd.bsd")]
        self.assertEqual(len(rows), 10)
        for row in rows:
            self.assertEqual(row["handler_status"], "specified")
            self.assertEqual(row["wiring_status"], "specified")
            joined = " ".join(row["event_refs"])
            self.assertFalse(any(ref.startswith("bsd.") for ref in row["event_refs"]))
            self.assertTrue(
                "none_pending_event_authority" in joined or "no EventRecord is invented" in joined,
                row["action_id"],
            )

    def test_negative_duplicate_row_fails_central_validator(self) -> None:
        # Drive the real exactly-one-production-row rule (pm-shared-runtime-command-contracts.py
        # validate(): "<cmd>:production_wiring_count=N") with the shape of the merged-away
        # assistant.redesign.w_036.bsd_set duplicate, through a temporary copy of the matrix
        # rather than a local re-count that could not fail if the detector were removed.
        self.assertNotIn("assistant.redesign.w_036.bsd_set", self.entries)
        mutated = copy.deepcopy(WIRING)
        mutated["entries"]["assistant.redesign.w_036.bsd_set"] = copy.deepcopy(self.bsd_rows[0])
        with tempfile.TemporaryDirectory() as tmp:
            tmp_wiring = Path(tmp) / "Wiring_Matrix.production.json"
            tmp_wiring.write_text(json.dumps(mutated), encoding="utf-8")
            with mock.patch.object(shared_runtime_validator, "WIRING_PATH", tmp_wiring):
                report = shared_runtime_validator.validate()
        self.assertFalse(report["passed"])
        self.assertIn("cmd.bsd.set:production_wiring_count=2", report["failures"])
        # The same validator passes on the unmutated tree, so the failure above is
        # attributable to the injected duplicate alone.
        self.assertTrue(shared_runtime_validator.validate()["passed"])


class BsdLifecycleRecordClosureTests(unittest.TestCase):
    """CCR-01/CCR-02: the six BSD lifecycle record families have typed, centrally referenced
    contracts, a durable/pending disposition row, and executed fixture evidence."""

    RECORD_DEFS = [
        "bsd_policy",
        "bsd_workflow_binding",
        "bsd_assignment",
        "bsd_review_cycle",
        "bsd_finding",
        "bsd_quarantine",
    ]
    RECORD_SCHEMA_IDS = [
        "pm.bsd.policy.v1",
        "pm.bsd.workflow_binding.v1",
        "pm.bsd.assignment.v1",
        "pm.bsd.review_cycle.v1",
        "pm.bsd.finding.v1",
        "pm.bsd.quarantine.v1",
    ]

    def disposition_row(self) -> dict:
        rows = [
            row
            for row in REGISTRY["contract_family_dispositions"]
            if row["disposition_id"] == "scd.back_seat_driver.durable.v1"
        ]
        self.assertEqual(len(rows), 1, "expected exactly one BSD disposition row")
        return rows[0]

    def test_schema_is_valid_draft_2020_12(self) -> None:
        Draft202012Validator.check_schema(BSD_RECORDS)

    def test_defs_bind_declared_schema_ids(self) -> None:
        for def_name, schema_id in zip(self.RECORD_DEFS, self.RECORD_SCHEMA_IDS):
            definition = BSD_RECORDS["$defs"][def_name]
            self.assertEqual(definition["properties"]["schema_id"]["const"], schema_id, def_name)
            self.assertEqual(definition["properties"]["schema_version"]["const"], "1.0.0", def_name)
            self.assertFalse(definition["additionalProperties"], def_name)
            self.assertIn("schema_id", definition["required"], def_name)

    def test_positive_record_fixtures_validate(self) -> None:
        seen = set()
        for name, record in FIXTURES["positive"].items():
            schema_id = str(record.get("schema_id", ""))
            if not schema_id.startswith("pm.bsd."):
                continue
            def_name = schema_id[len("pm.") : -len(".v1")].replace(".", "_")
            errors = list(validator_for(BSD_RECORDS, def_name).iter_errors(record))
            self.assertEqual(errors, [], f"{name}: {[str(e)[:200] for e in errors]}")
            seen.add((schema_id, record.get("state"), record.get("result"), record.get("terminal_action")))
        # The reviewer-required lifecycle states each carry an executed positive fixture.
        for required in (
            ("pm.bsd.assignment.v1", "holding"),
            ("pm.bsd.assignment.v1", "stopped"),
            ("pm.bsd.review_cycle.v1", "held"),
            ("pm.bsd.finding.v1", "held"),
            ("pm.bsd.finding.v1", "reconfirming"),
            ("pm.bsd.finding.v1", "cleared"),
            ("pm.bsd.finding.v1", "closed"),
        ):
            self.assertTrue(
                any(s[0] == required[0] and required[1] in s for s in seen),
                f"missing positive fixture for {required}",
            )
        self.assertIn(("pm.bsd.quarantine.v1", None, None, "pause_bsd"), seen)
        self.assertEqual(len(seen), 11)

    def test_negative_record_fixtures_fail_for_intended_reason(self) -> None:
        run_negative_fixtures(self, *self.RECORD_DEFS)

    def test_disposition_row_bound_and_bounded(self) -> None:
        row = self.disposition_row()
        self.assertEqual(row["system_id"], "back_seat_driver")
        self.assertEqual(row["owner_doc"], "Plans/Back_Seat_Driver.md")
        self.assertEqual(row["record_kinds"], self.RECORD_SCHEMA_IDS)
        self.assertEqual(row["persistence_disposition"], "durable")
        self.assertEqual(row["physical_family_status"], "physical_family_registration_pending")
        self.assertIs(row["runtime_evidence"], False)
        self.assertEqual(
            row["event_effect_policy"], "receipt_only_no_eventrecord_pending_event_authority"
        )
        self.assertEqual(
            row["existing_family_refs"],
            ["Plans/storage_value_registry.json#/families/bsd_runtime_record"],
        )
        self.assertEqual(row["retention_disposition"]["mode"], "physical_registration_pending")
        self.assertEqual(row["retention_disposition"]["refs"], [])
        resolved = checker.resolve(ROOT, row["schema_ref"])
        self.assertEqual(Path(resolved).name, "back_seat_driver_contracts.schema.json")
        registered = {t["transform_id"] for t in REDACTION_TRANSFORMS["transforms"]}
        for transform_id in row["redaction_transform_ids"]:
            self.assertIn(transform_id, registered)
        # The disposition adds no physical family (SP-251/SP-318 negative constraint).
        # Census re-adjudicated after the 2026-09-23 Event Authority landing (+12 families): 282 -> 294.
        self.assertEqual(len(REGISTRY["families"]), 294)

    def test_lifecycle_not_folded_into_summary(self) -> None:
        self.assertNotIn("bsd_runtime_record", BSD_RECORDS["$defs"])
        summary = checker.resolve(ROOT, family("bsd_runtime_record")["value_schema_ref"])
        self.assertEqual(
            summary["properties"]["schema_id"]["const"], "pm.shared_runtime.bsd_runtime_record.v1"
        )
        self.assertEqual(len(summary["required"]), 23)
        summary_text = json.dumps(summary).lower()
        for token in ("quarantine", "reconfirm", "pm.bsd."):
            self.assertNotIn(token, summary_text)

    def test_broken_reference_negatives(self) -> None:
        # S02 broken-reference control executed through the central resolver (CCR-02).
        with self.assertRaises(ValueError):
            checker.resolve(ROOT, "Plans/Back_Seat_Driver_Contracts.schema.json")  # case drift
        with self.assertRaises(ValueError):
            checker.resolve(ROOT, "Plans/no_such_bsd_contracts.schema.json")  # missing file
        with self.assertRaises(KeyError):
            checker.resolve(ROOT, "Plans/back_seat_driver_contracts.schema.json#/$defs/NoSuchDef")
        with self.assertRaises(ValueError):
            checker.resolve(ROOT, "scripts/pm-plan-index.py")  # non-canonical prefix


class LiveEquivalentPayloadClosureTests(unittest.TestCase):
    """Finish pass (2026-09-23): payload-schema evidence against the LIVE equivalents of the reported
    records, plus machine-pinned BLOCKED states for the record kinds whose owner-authored definitions
    do not exist yet (an absent schema is a blocked check, never an inapplicable one)."""

    DEFINITIONLESS_RECORD_IDS = [
        "pm.assistant_plan.progress_projection.v1",
        "pm.assistant_plan.question_budget_projection.v1",
        "pm.assistant_plan.question_budget_policy.v2",
        "pm.assistant_plan.deep_ledger_session.v1",
        "pm.brainstorm.question_bank.v1",
        "pm.schedule.message_projection.v1",
        "pm.chat.scheduled_message_snapshot.v1",
        "pm.chat.todo_item.v2",
        "pm.chat.todo_work_binding.v1",
        "pm.chat.todo_transition.v1",
        "QuestionnaireEnvelope",
    ]

    def test_scheduled_message_durable_payloads_validate(self) -> None:
        # M01/M02 structural side: the materialized durable authority for scheduled messages is the
        # execution_schedule family; validate real payloads against its actual authoritative defs.
        positive = FIXTURES["positive"]
        pairs = [
            ("execution_schedule_scheduled_message", "StorageExecutionSchedule"),
            ("execution_schedule_record_bare", "ExecutionSchedule"),
            ("schedule_run_binding_assistant_plan", "StorageScheduleRunBinding"),
            ("schedule_run_binding_record_bare", "ScheduleRunBinding"),
        ]
        for name, def_name in pairs:
            errors = list(validator_for(CANCEL_CUSTODY, def_name).iter_errors(positive[name]))
            self.assertEqual(errors, [], f"{name}: {[str(e)[:200] for e in errors]}")
        # The live registry families resolve to exactly these defs (family -> contract binding).
        for fid, def_name in (
            ("execution_schedule", "StorageExecutionSchedule"),
            ("execution_schedule_run_binding", "StorageScheduleRunBinding"),
        ):
            definition = checker.resolve(ROOT, family(fid)["value_schema_ref"])
            self.assertEqual(definition, CANCEL_CUSTODY["$defs"][def_name])
        # Schedule identity and dispatched-run identity are structurally distinct records (M01
        # non-conflation): the binding references the schedule by id and adds its own run identity.
        self.assertEqual(
            positive["schedule_run_binding_record_bare"]["schedule_id"],
            positive["execution_schedule_record_bare"]["schedule_id"],
        )
        self.assertNotIn("plan_run_id", CANCEL_CUSTODY["$defs"]["ExecutionSchedule"]["properties"])

    def test_live_equivalent_negatives_fail_for_intended_reason(self) -> None:
        run_negative_fixtures(
            self,
            "StorageExecutionSchedule",
            "ExecutionSchedule",
            "StorageScheduleRunBinding",
            "ScheduleRunBinding",
        )

    def test_definitionless_records_stay_blocked(self) -> None:
        # BLOCKED tripwire: these record kinds are declared by live owners (APR QMAX/PPROG blocks,
        # SQR, TDR) and queued in CS-078, but no machine definition exists anywhere in Plans schemas
        # or the registry. Payload validation for them is BLOCKED on owner-authored definitions -
        # not inapplicable. If an owner materializes one, this test fails and the payload checks
        # must be completed in the same change.
        texts = []
        for path in sorted((ROOT / "Plans").glob("*.schema.json")):
            texts.append(path.read_text(encoding="utf-8"))
        texts.append(REGISTRY_TEXT)
        for record_id in self.DEFINITIONLESS_RECORD_IDS:
            for text in texts:
                self.assertNotIn('"' + record_id + '"', text, record_id)
        # Their owner declarations remain the live references (CS-078 queue rows for the todo trio
        # are pinned by AssistantRecordClosureTests; the APR companion absence by TruthBoundaryTests).
        for token in ("pm.chat.todo_item.v2", "pm.chat.todo_work_binding.v1", "pm.chat.todo_transition.v1"):
            self.assertIn(token, TDR_TEXT)

    def test_bsd_registration_stays_blocked_pending_authority(self) -> None:
        # Item-1 blocked tripwire: the BSD lifecycle persistence/effect registration is pending
        # central authority (physical-family denominator governance, Event Authority adjudication,
        # designated reseal) - pinned here so silent partial registration cannot pass unnoticed.
        rows = [
            r
            for r in REGISTRY["contract_family_dispositions"]
            if r["disposition_id"] == "scd.back_seat_driver.durable.v1"
        ]
        self.assertEqual(len(rows), 1)
        row = rows[0]
        self.assertEqual(row["persistence_disposition"], "durable")
        self.assertEqual(row["physical_family_status"], "physical_family_registration_pending")
        self.assertEqual(row["retention_disposition"]["mode"], "physical_registration_pending")
        self.assertEqual(
            row["event_effect_policy"], "receipt_only_no_eventrecord_pending_event_authority"
        )
        self.assertIs(row["runtime_evidence"], False)
        family_ids = {f["family_id"] for f in REGISTRY["families"]}
        for candidate in ("bsd_policy", "bsd_workflow_binding", "bsd_assignment",
                          "bsd_review_cycle", "bsd_finding", "bsd_quarantine"):
            self.assertNotIn(candidate, family_ids)
        registered = {r["event_type"] for r in EVENT_REGISTRY["families"]}
        self.assertFalse(any(t.startswith("bsd.") for t in registered))


class TruthBoundaryTests(unittest.TestCase):
    """ACC-TRUTH-01: future declarations stay future; gates stay closed."""

    def test_buildability_gate_stays_false(self) -> None:
        self.assertTrue(REGISTRY["buildability_gate_policy"]["buildability_gate_passed_must_remain_false"])
        self.assertFalse(GATE_REPORT["buildability_gate_passed"])

    def test_future_contract_files_declared_not_materialized(self) -> None:
        self.assertIn("are required and do not exist yet", APR_TEXT)
        self.assertIn("Naming them here does not create them", CS_TEXT)
        self.assertFalse((ROOT / "Plans" / "assistant_plan_runtime_contracts.schema.json").exists())
        # The BSD typed companion now exists (CCR-01 repair) but strictly as record definitions:
        # none of the CS-078 command request/result definitions may appear in it, so every
        # CS-078 row keeps handler_unavailable truthfully.
        self.assertTrue((ROOT / "Plans" / "back_seat_driver_contracts.schema.json").exists())
        for command_def in (
            "BackSeatDriverModeSetRequest",
            "BackSeatDriverModeSetResult",
            "BSDPolicyUpdateRequest",
            "BSDPolicyUpdateResult",
            "BSDWorkflowBindingRequest",
            "BSDWorkflowBindingResult",
            "BSDAssignmentControlRequest",
            "BSDAssignmentControlResult",
            "BSDAssignmentRetryRequest",
            "BSDAssignmentRetryResult",
            "BSDFindingRoute",
            "BSDUsageRoute",
            "BSDTranscriptRoute",
            "RouteResult",
        ):
            self.assertNotIn(command_def, BSD_RECORDS["$defs"])

    def test_bsd_set_row_keeps_handler_unavailable_boundary(self) -> None:
        rows = [
            line
            for line in CS_TEXT.splitlines()
            if line.startswith("| `cmd.bsd.set` |") and "back_seat_driver_contracts.schema.json" in line
        ]
        self.assertEqual(len(rows), 1)
        self.assertIn("handler_unavailable", rows[0])


if __name__ == "__main__":
    unittest.main()
