"""Static coordination event contract checks (OSI-438, CV-353, SP-320; DL-045); no native proof."""

import copy
import importlib.util
import json
import shutil
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("coordination_events", ROOT / "scripts/pm_coordination_events.py")
CHECK = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CHECK)
FIXTURES = CHECK.load(CHECK.FIXTURE_PATH)
LEDGER = CHECK.load(CHECK.LEDGER_PATH)
REGISTRY = CHECK.load(CHECK.REGISTRY_PATH)
PAYLOADS = {case["case_id"]: case for case in FIXTURES["payloads"]}
PROJECTIONS = {case["case_id"]: case for case in FIXTURES["projection_values"]}
CONTEXT = FIXTURES["storage_context"]


def errors(failures):
    return {failure["error"] for failure in failures}


def admitted(ledger, index):
    """Synthetic flip of one ledger row, as its own admission landing would write it."""
    ledger = copy.deepcopy(ledger)
    ledger["rows"][index]["admission_status"] = CHECK.ADMITTED
    ledger["rows"][index]["authority_contract_ref"] = CHECK.PROJECTION_PATH + "#/x-pm-event-authority-binding"
    return ledger


def with_row(registry, row):
    registry = copy.deepcopy(registry)
    registry["families"].append(copy.deepcopy(row))
    return registry


def store(admitted_types=CHECK.SEVEN):
    return CHECK.CoordinationStore(CONTEXT["storage_instance_id"], CONTEXT["recovery_epoch"], list(admitted_types))


def submit(model, case_id, **changes):
    case = PAYLOADS[case_id]
    return model.submit(case["event_type"], dict(copy.deepcopy(case["payload"]), **changes))


class ScratchRoot:
    """A temporary root holding copies of the named files, for checks that read one or two owner files."""

    def __init__(self, *paths):
        self.paths = paths

    def __enter__(self):
        self.directory = tempfile.TemporaryDirectory()
        root = Path(self.directory.name)
        for path in self.paths:
            (root / path).parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / path, root / path)
        return root

    def __exit__(self, *exc):
        CHECK.schema_registry.cache_clear()
        CHECK.definition_validator.cache_clear()
        self.directory.cleanup()

    @staticmethod
    def edit(root, path, change):
        value = json.loads((root / path).read_text(encoding="utf-8"))
        change(value)
        (root / path).write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


SCHEMA_FILES = (CHECK.PAYLOAD_PATH, CHECK.PROJECTION_PATH, CHECK.GENERIC_PATH, CHECK.REGISTRY_SCHEMA_PATH, CHECK.LEDGER_SCHEMA_PATH)


class StaticReportTests(unittest.TestCase):
    def test_live_report_passes_without_claiming_admission_or_native_proof(self):
        report = CHECK.validate()
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["status"], "pass")
        self.assertFalse(report["admission_claimed"])
        self.assertFalse(report["native_proof"])
        self.assertEqual(report["global_event_denominator"], "UNKNOWN_OPEN")
        self.assertIn("No family is admitted", report["claim_boundary"])
        self.assertEqual(set(report["prepared_rows"]) | set(report["admitted_rows"]), set(CHECK.SEVEN) | {CHECK.MIRROR})
        self.assertIn(CHECK.MIRROR, report["prepared_rows"])
        self.assertEqual(report["prepared_registry_rows"], 7)

    def test_fixture_census(self):
        report = CHECK.fixture_report()
        self.assertEqual(report["failures"], [])
        counts = {key: report[key] for key in (
            "positive_payload_cases", "negative_payload_cases", "negative_event_cases", "identity_vectors", "path_vectors",
            "transition_sequences", "transition_steps", "positive_projection_cases", "negative_projection_cases",
            "native_oracles_not_run")}
        self.assertEqual(counts, {
            "positive_payload_cases": 42, "negative_payload_cases": 67, "negative_event_cases": 12, "identity_vectors": 6,
            "path_vectors": 9, "transition_sequences": 22, "transition_steps": 83, "positive_projection_cases": 11,
            "negative_projection_cases": 20, "native_oracles_not_run": 13})

    def test_every_family_has_positive_negative_and_transition_cases(self):
        per_family = CHECK.fixture_report()["per_family"]
        for event_type in CHECK.SEVEN:
            with self.subTest(event=event_type):
                self.assertTrue(all(value > 0 for value in per_family[event_type].values()), per_family[event_type])

    def test_registry_membership_matches_ledger_status(self):
        admitted_types = {row["event_type"] for row in LEDGER["rows"] if row["admission_status"] == CHECK.ADMITTED}
        registered = {row["event_type"] for row in REGISTRY["families"] if row["event_type"].startswith("coordination.")}
        self.assertEqual(registered, admitted_types)
        self.assertEqual(CHECK.registry_membership_failures(), [])


class PayloadSchemaTests(unittest.TestCase):
    def test_live_payload_schema_is_closed_and_follows_the_contracts_rows(self):
        self.assertEqual(CHECK.payload_schema_failures(), [])

    def test_schema_drift_is_detected(self):
        mutations = {
            "payload_definition_fields_differ_from_contracts_row":
                lambda schema: schema["$defs"]["agent_registered"]["properties"].update(current_operation={"type": "string"}),
            "payload_definition_not_closed":
                lambda schema: schema["$defs"]["agent_crashed"].update(additionalProperties=True),
            "payload_schema_admits_null":
                lambda schema: schema["$defs"]["agent_status_updated"]["properties"].update(status_reason={"type": ["string", "null"]}),
            "closed_domain":
                lambda schema: schema["$defs"]["agent_status_updated"]["properties"].update(
                    status={"enum": ["queued", "running", "awaiting_parent", "blocked", "complete"]}),
            "payload_definition_schema_id":
                lambda schema: schema["$defs"]["agent_aborted"].update({"$id": "pm.coordination_event.agent_aborted.schema.v2"}),
            "payload_definition_required_fields":
                lambda schema: schema["$defs"]["agent_operation_updated"]["required"].remove("operation_summary"),
            "payload_schema_root_members":
                lambda schema: schema["oneOf"].pop(),
        }
        for expected, mutation in mutations.items():
            with self.subTest(expected=expected), ScratchRoot(CHECK.PAYLOAD_PATH) as root:
                ScratchRoot.edit(root, CHECK.PAYLOAD_PATH, mutation)
                self.assertIn(expected, errors(CHECK.payload_schema_failures(root=root)))

    def test_each_rule_layer_rejects_its_own_case(self):
        base = PAYLOADS["a8_registered_minimal"]
        self.assertIsNone(CHECK.payload_rejection(base["event_type"], base["payload"]))
        cases = {
            "schema": dict(base["payload"], platform="Claude"),
            "valid_utc_datetime": dict(base["payload"], started_at_utc="2026-02-30T04:10:00Z"),
            "identity_recipe": dict(base["payload"], idempotency_key="coordination:coordination.agent_registered:project_fixture_alpha:agent_other:1"),
        }
        for expected, payload in cases.items():
            with self.subTest(rule=expected):
                self.assertEqual(CHECK.payload_rejection(base["event_type"], payload), expected)
        claim = PAYLOADS["a7_file_editing_r4"]
        self.assertEqual(CHECK.payload_rejection(claim["event_type"], dict(claim["payload"], path_hash=CHECK.path_hash("src/lib.rs"))),
                         "path_hash_recipe")
        abort = PAYLOADS["a9_aborted_parent_r2"]
        self.assertEqual(CHECK.payload_rejection(abort["event_type"], dict(abort["payload"], aborted_by_ref="run:run_other")), "abort_ref_join")

    def test_secret_path_and_null_shapes_are_rejected(self):
        operation = PAYLOADS["a7_operation_progress_r5"]
        for summary in ("token sk-abcdefghijklmnop123", "Bearer abcdefghijklmnop", "line one\nline two"):
            with self.subTest(summary=summary):
                self.assertEqual(CHECK.payload_rejection(operation["event_type"], dict(operation["payload"], operation_summary=summary)), "schema")
        for ref in ("worktree:/home/user/project", "file:///tmp/result.json", "cargo test"):
            with self.subTest(ref=ref):
                self.assertEqual(CHECK.payload_rejection(operation["event_type"], dict(operation["payload"], operation_refs=[ref])), "schema")
        status = PAYLOADS["a10_status_blocked_r2"]
        self.assertEqual(CHECK.payload_rejection(status["event_type"], dict(status["payload"], thread_id=None)), "schema")

    def test_identity_recipes(self):
        self.assertEqual(CHECK.idempotency_key("coordination.agent_crashed", "project_a", "agent:with:colon", 12),
                         "coordination:coordination.agent_crashed:project_a:agent:with:colon:12")
        first = CHECK.event_id("4f1c2d3e-5a6b-4c7d-8e9f-0a1b2c3d4e5f", 3, "project_a", "coordination.agent_registered", "agent_a", 1)
        later_epoch = CHECK.event_id("4f1c2d3e-5a6b-4c7d-8e9f-0a1b2c3d4e5f", 4, "project_a", "coordination.agent_registered", "agent_a", 1)
        self.assertRegex(first, r"^evt_coordination_[0-9a-f]{64}$")
        self.assertNotEqual(first, later_epoch)
        self.assertIsNone(CHECK.normalize_observed_path("/work/wt", "/etc/hosts"))
        self.assertEqual(CHECK.normalize_observed_path("/work/wt", "./src/lib/../api.rs"), "src/api.rs")


class ProjectionAndCheckpointTests(unittest.TestCase):
    def test_live_projection_schema_and_binding(self):
        self.assertEqual(CHECK.projection_schema_failures(), [])

    def test_stored_token_and_binding_drift_is_detected(self):
        def fence(schema):
            schema["$defs"]["durable_read_token"]["properties"]["redb_snapshot_id"] = {"type": "string", "minLength": 1}
            schema["$defs"]["durable_read_token"]["required"].append("redb_snapshot_id")
        mutations = {
            "checkpoint_token_not_sp278_durable_token": fence,
            "stored_live_snapshot_fence": fence,
            "coordination_authority_binding_mismatch":
                lambda schema: schema["x-pm-event-authority-binding"].update(projector_version="1.0.1"),
            "checkpoint_admitted_domain":
                lambda schema: schema["$defs"]["checkpoint"]["properties"]["admitted_event_types"]["items"]["enum"].append(CHECK.MIRROR),
            "projection_value_identity":
                lambda schema: schema["$defs"]["file_projection"]["properties"].update(schema_id={"const": "pm.storage_value.other.v1"}),
        }
        for expected, mutation in mutations.items():
            with self.subTest(expected=expected), ScratchRoot(*SCHEMA_FILES) as root:
                ScratchRoot.edit(root, CHECK.PROJECTION_PATH, mutation)
                self.assertIn(expected, errors(CHECK.projection_schema_failures(root=root)))

    def test_checkpoint_rules_beyond_the_schema(self):
        current = PROJECTIONS["checkpoint_current"]["value"]
        self.assertEqual(CHECK.projection_value_failures("checkpoint", current), [])
        cases = {
            "checkpoint_scope_partition": dict(current, scope_partition=CHECK.scope_partition("project_other")),
            "checkpoint_token_storage_instance": dict(current, index_read_token=dict(
                current["index_read_token"], storage_instance_id="5f1c2d3e-5a6b-4c7d-8e9f-0a1b2c3d4e5f")),
            "checkpoint_admitted_types_not_sorted": dict(current, admitted_event_types=list(reversed(current["admitted_event_types"]))),
            "checkpoint_range_or_cursor": dict(current, index_through_sequence_id=46),
        }
        for expected, value in cases.items():
            with self.subTest(expected=expected):
                self.assertEqual(CHECK.projection_value_failures("checkpoint", value), [expected])
        history = copy.deepcopy(PROJECTIONS["checkpoint_with_retired_generation"]["value"])
        self.assertEqual(CHECK.projection_value_failures("checkpoint", history), [])
        history["retired_generations"][0]["checkpoint_core"]["publication_id"] = history["publication_id"]
        self.assertEqual(CHECK.projection_value_failures("checkpoint", history), ["checkpoint_publication_reused"])

    def test_file_row_path_hash_recipe(self):
        row = PROJECTIONS["projection_file_claim"]["value"]
        self.assertEqual(CHECK.projection_value_failures("file_projection", row), [])
        self.assertEqual(CHECK.projection_value_failures("file_projection", dict(row, path_hash=CHECK.path_hash("src/lib.rs"))),
                         ["path_hash_recipe"])

    def test_persisted_snapshot_id_is_rejected_by_schema(self):
        current = PROJECTIONS["checkpoint_current"]["value"]
        token = dict(current["index_read_token"], redb_snapshot_id="snapshot_fixture_1")
        self.assertEqual(CHECK.projection_value_failures("checkpoint", dict(current, index_read_token=token)), ["schema"])


class LedgerTests(unittest.TestCase):
    def test_live_ledger_and_prepared_rows(self):
        self.assertEqual(CHECK.ledger_failures(), [])
        for index, (event_type, definition, _entry) in enumerate(CHECK.FAMILIES):
            with self.subTest(event=event_type):
                row = LEDGER["rows"][index]
                self.assertEqual(row["registry_row"], CHECK.expected_registry_row(index, event_type, definition))
                self.assertEqual(row["registry_row_sha256"], CHECK.row_sha256(row["registry_row"]))
        self.assertIsNone(LEDGER["rows"][7]["registry_row"])

    def test_ledger_drift_is_detected(self):
        def source_refs(ledger):
            ledger["rows"][2]["registry_row"]["source_refs"].reverse()
        def retention(ledger):
            ledger["rows"][3]["registry_row"]["retention_policy_ref"]["policy_id"] = "RP-PROJECTION-3GEN"
        def digest(ledger):
            ledger["rows"][4]["registry_row_sha256"] = "0" * 64
        def producer(ledger):
            ledger["rows"][5]["producer_component"] = "AgentCoordinator.unregister_agent(AgentTerminalUpdate)"
        def status(ledger):
            ledger["rows"][0]["admission_status"] = CHECK.ADMITTED
        def order(ledger):
            ledger["rows"][0], ledger["rows"][1] = ledger["rows"][1], ledger["rows"][0]
        mutations = {
            "prepared_registry_row_mismatch": source_refs,
            "ledger_schema": retention,
            "prepared_registry_row_sha256": digest,
            "ledger_producer_binding": producer,
        }
        for expected, mutation in mutations.items():
            with self.subTest(expected=expected):
                ledger = copy.deepcopy(LEDGER)
                mutation(ledger)
                self.assertIn(expected, errors(CHECK.ledger_failures(ledger)))
        for mutation in (status, order):
            with self.subTest(mutation=mutation.__name__):
                ledger = copy.deepcopy(LEDGER)
                mutation(ledger)
                self.assertTrue(errors(CHECK.ledger_failures(ledger)) & {"ledger_schema", "ledger_row_order"})

    def test_admitted_row_needs_authority_contract_ref(self):
        ledger = admitted(LEDGER, 0)
        self.assertEqual(CHECK.ledger_failures(ledger), [])
        del ledger["rows"][0]["authority_contract_ref"]
        self.assertIn("ledger_schema", errors(CHECK.ledger_failures(ledger)))

    def test_each_prepared_row_is_what_the_registry_would_receive(self):
        self.assertEqual(CHECK.registry_preflight_failures(), [])
        ledger = copy.deepcopy(LEDGER)
        ledger["rows"][1]["registry_row"]["payload_schema_ref"]["json_pointer"] = "#/$defs/agent_missing"
        self.assertIn("prepared_row_not_admissible", errors(CHECK.registry_preflight_failures(ledger)))

    def test_validation_case_ids_stay_within_their_family(self):
        self.assertEqual(CHECK.validation_case_failures(), [])
        ledger = copy.deepcopy(LEDGER)
        ledger["rows"][0]["validation_case_ids"].append("status_terminal_value")
        self.assertIn("validation_case_of_other_family", errors(CHECK.validation_case_failures(ledger)))
        ledger = copy.deepcopy(LEDGER)
        ledger["rows"][6]["validation_case_ids"].remove("aborted_unknown_reason")
        self.assertIn("family_cases_not_named_by_ledger_row", errors(CHECK.validation_case_failures(ledger)))


class RegistryMembershipTests(unittest.TestCase):
    def test_prepared_row_cannot_be_registered(self):
        for index, event_type in enumerate(CHECK.SEVEN):
            with self.subTest(event=event_type):
                registry = with_row(REGISTRY, LEDGER["rows"][index]["registry_row"])
                self.assertEqual(errors(CHECK.registry_membership_failures(registry, LEDGER)), {"prepared_coordination_family_registered"})

    def test_admitted_row_must_be_registered_byte_for_byte(self):
        ledger = admitted(LEDGER, 0)
        prepared = ledger["rows"][0]["registry_row"]
        self.assertEqual(CHECK.registry_membership_failures(with_row(REGISTRY, prepared), ledger), [])
        self.assertEqual(errors(CHECK.registry_membership_failures(REGISTRY, ledger)), {"admitted_coordination_family_missing_or_duplicate"})
        changed = copy.deepcopy(prepared)
        changed["source_refs"] = changed["source_refs"][:-1]
        self.assertEqual(errors(CHECK.registry_membership_failures(with_row(REGISTRY, changed), ledger)),
                         {"admitted_coordination_row_differs_from_prepared_row"})
        self.assertEqual(errors(CHECK.registry_membership_failures(with_row(with_row(REGISTRY, prepared), prepared), ledger)),
                         {"admitted_coordination_family_missing_or_duplicate"})

    def test_mirror_and_unknown_coordination_rows_are_refused(self):
        mirror = copy.deepcopy(LEDGER["rows"][0]["registry_row"])
        mirror.update(event_type=CHECK.MIRROR, family_id="event-family-coordination-debug-mirror-exported")
        self.assertTrue(errors(CHECK.registry_membership_failures(with_row(REGISTRY, mirror), LEDGER)))
        unknown = dict(mirror, event_type="coordination.agent_heartbeat", family_id="event-family-coordination-agent-heartbeat")
        self.assertEqual(errors(CHECK.registry_membership_failures(with_row(REGISTRY, unknown), LEDGER)),
                         {"unexpected_coordination_registry_family"})


class StorageValueRegistryTests(unittest.TestCase):
    def test_live_rows_equal_their_sp320_materialization(self):
        self.assertEqual(CHECK.svr_failures(), [])

    def test_row_and_policy_drift_is_detected(self):
        svr = CHECK.load(CHECK.SVR_PATH)

        def family(value, family_id):
            return next(row for row in value["families"] if row["family_id"] == family_id)
        mutations = {
            "coordination_storage_family_mismatch": [
                lambda value: family(value, CHECK.RECORD_FAMILY).update(retention_compaction="Retain under runtime audit policy."),
                lambda value: family(value, CHECK.RECORD_FAMILY).update(producer=["coordination projector"]),
                lambda value: family(value, CHECK.PROJECTION_FAMILY)["value_schema"]["$defs"].pop("snapshot_projection"),
                lambda value: family(value, CHECK.PROJECTION_FAMILY).update(status="deferred_not_build_blocking"),
            ],
            "coordination_retention_policy_changed": [
                lambda value: next(policy for policy in value["retention_policies"] if policy["policy_id"] == "RP-COORDINATION-180D").update(ttl_seconds=86400),
            ],
        }
        for expected, changes in mutations.items():
            for change in changes:
                with self.subTest(expected=expected):
                    value = copy.deepcopy(svr)
                    change(value)
                    self.assertIn(expected, errors(CHECK.svr_failures(value)))


class FixtureTests(unittest.TestCase):
    def test_fixture_drift_is_detected(self):
        def step(value):
            value["transition_sequences"][1]["steps"][1]["expected"] = "appended"
        def negative(value):
            value["invalid_payloads"][0]["expected_rejection"] = "identity_recipe"
        def positive(value):
            value["payloads"][0]["payload"]["platform"] = "vscode"
        def oracle(value):
            value["required_native_oracles"][0]["execution_status"] = "PASS"
        def identity(value):
            value["identity_vectors"][0]["expected_event_id"] = "evt_coordination_" + "0" * 64
        def path(value):
            value["path_vectors"][0]["expected"] = "no_claim"
        def final(value):
            value["transition_sequences"][0]["final_agents"]["agent_fixture_7"]["active_claim_count"] = 1
        def event(value):
            value["invalid_events"][0]["expected_rejection"] = "inline_only"
        def projection(value):
            value["invalid_projection_values"][0]["patch"] = {}
        mutations = {
            "transition_step_mismatch": step,
            "negative_payload_not_rejected_for_stated_reason": negative,
            "positive_payload_rejected": positive,
            "native_oracles_must_stay_not_run": oracle,
            "identity_vector_mismatch": identity,
            "path_vector_mismatch": path,
            "transition_final_state_mismatch": final,
            "negative_event_not_rejected_for_stated_reason": event,
            "negative_projection_not_rejected_for_stated_reason": projection,
        }
        for expected, mutation in mutations.items():
            with self.subTest(expected=expected):
                value = copy.deepcopy(FIXTURES)
                mutation(value)
                self.assertIn(expected, errors(CHECK.fixture_report(value)["failures"]))


class TransitionModelTests(unittest.TestCase):
    def assert_refused_unchanged(self, model, case_id, expected, **changes):
        before = copy.deepcopy(vars(model))
        self.assertEqual(submit(model, case_id, **changes)["result"], expected)
        self.assertEqual(vars(model), before)

    def test_quarantined_family_changes_nothing_and_infers_no_sibling_state(self):
        model = store(["coordination.agent_registered"])
        self.assertEqual(submit(model, "a7_registered_full")["result"], "appended")
        for case_id in ("a7_status_running_r2", "a7_unregistered_failed_r3", "a7_crashed_process_lost_r3", "debug_mirror_exported_written"):
            with self.subTest(case=case_id):
                self.assert_refused_unchanged(model, case_id, "quarantined_before_append")
        self.assertNotIn("terminal", model.agents["agent_fixture_7"])

    def test_refusals_append_nothing(self):
        model = store()
        submit(model, "a7_registered_full")
        self.assert_refused_unchanged(model, "a7_status_running_r3", "coordination_conflict:stale_revision")
        self.assert_refused_unchanged(model, "a7_status_running_r2_other_run", "coordination_conflict:lineage_mismatch")
        self.assert_refused_unchanged(model, "a7_registered_retry_changed", "idempotency_conflict")
        self.assert_refused_unchanged(model, "a8_status_running_r2", "coordination_conflict:not_registered")
        self.assert_refused_unchanged(model, "a7_status_running_r2", "schema", status="complete")

    def test_exact_retry_returns_original_event_without_second_append(self):
        model = store()
        first = submit(model, "a7_registered_full")
        submit(model, "a7_operation_initial_r2")
        before = copy.deepcopy(vars(model))
        retry = submit(model, "a7_registered_full")
        self.assertEqual((retry["result"], retry["event_id"]), ("exact_retry_original_result", first["event_id"]))
        self.assertEqual(vars(model), before)

    def test_unchanged_update_advances_no_revision(self):
        model = store()
        for case_id in ("a10_registered", "a10_status_blocked_r2"):
            submit(model, case_id)
        self.assert_refused_unchanged(model, "a10_status_blocked_again_r3", "coordination_unchanged")
        self.assertEqual(submit(model, "a10_status_running_r3")["result"], "appended")
        self.assertEqual(model.agents["agent_fixture_10"]["agent_revision"], 3)

    def test_first_terminal_event_wins_and_releases_every_claim(self):
        model = store()
        for case_id in ("a7_registered_full", "a7_operation_initial_r2", "a7_status_running_r3", "a7_file_editing_r4",
                        "a7_operation_progress_r5", "a7_unregistered_complete_r6"):
            self.assertEqual(submit(model, case_id)["result"], "appended", case_id)
        self.assertEqual(model.files, {})
        self.assertEqual(model.agents["agent_fixture_7"]["status"], "complete")
        self.assert_refused_unchanged(model, "a7_crashed_race_r6", "coordination_conflict:stale_revision")
        self.assert_refused_unchanged(model, "a7_aborted_after_terminal_r7", "coordination_conflict:already_terminal")

    def test_heartbeat_expiry_needs_the_observed_age_and_no_threshold_field(self):
        crash = PAYLOADS["a8_crashed_heartbeat_r3"]
        without_age = {key: value for key, value in crash["payload"].items() if key != "heartbeat_age_ms"}
        self.assertEqual(CHECK.payload_rejection(crash["event_type"], without_age), "schema")
        self.assertEqual(CHECK.payload_rejection(crash["event_type"], dict(crash["payload"], coordination_heartbeat_expiry_ms=300000)), "schema")


if __name__ == "__main__":
    unittest.main()
