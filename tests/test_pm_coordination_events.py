"""Static coordination event contract checks (OSI-438, CV-353, SP-320; DL-045); no native proof."""

import copy
import importlib.util
import json
import shutil
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, ROOT / path)
    loaded = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(loaded)
    return loaded


CHECK = module("coordination_events", "scripts/pm_coordination_events.py")
FIXTURES = CHECK.load(CHECK.FIXTURE_PATH)
LEDGER = CHECK.load(CHECK.LEDGER_PATH)
REGISTRY = CHECK.load(CHECK.REGISTRY_PATH)
PAYLOADS = {case["case_id"]: case for case in FIXTURES["payloads"]}
PROJECTIONS = {case["case_id"]: case for case in FIXTURES["projection_values"]}
CONTEXT = FIXTURES["storage_context"]


def all_prepared():
    """Synthetic baseline with no coordination family admitted, independent of later admission landings."""
    ledger, registry = copy.deepcopy(LEDGER), copy.deepcopy(REGISTRY)
    for row in ledger["rows"]:
        row["admission_status"] = CHECK.PREPARED
        row.pop("authority_contract_ref", None)
    registry["families"] = [row for row in registry["families"] if not row["event_type"].startswith("coordination.")]
    return ledger, registry


PREP_LEDGER, PREP_REGISTRY = all_prepared()


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
            "positive_payload_cases": 43, "negative_payload_cases": 67, "negative_event_cases": 12, "identity_vectors": 7,
            "path_vectors": 9, "transition_sequences": 22, "transition_steps": 83, "positive_projection_cases": 11,
            "negative_projection_cases": 20, "native_oracles_not_run": 13})

    def test_every_family_has_positive_negative_and_transition_cases(self):
        per_family = CHECK.fixture_report()["per_family"]
        for event_type in CHECK.SEVEN:
            with self.subTest(event=event_type):
                self.assertTrue(all(value > 0 for value in per_family[event_type].values()), per_family[event_type])

    def test_ats_entry_names_every_native_obligation(self):
        self.assertEqual(CHECK.ats_oracle_failures(), [])
        with ScratchRoot(CHECK.ATS_PATH, CHECK.FIXTURE_PATH) as root:
            path = root / CHECK.ATS_PATH
            path.write_text(path.read_text(encoding="utf-8").replace("`COORD-RACE-01`", "COORD-RACE"), encoding="utf-8")
            self.assertEqual(CHECK.ats_oracle_failures(root=root), [{"error": "ats_native_oracle_not_named", "detail": ["COORD-RACE-01"]}])
            path.write_text("# no entry\n", encoding="utf-8")
            self.assertEqual(errors(CHECK.ats_oracle_failures(root=root)), {"ats_coordination_oracle_entry_missing"})

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
            "platform_pattern":
                lambda schema: schema["$defs"]["lineage_envelope"]["properties"].update(
                    platform={"enum": ["codex", "claude", "cursor", "gemini", "copilot"]}),
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
            "identity_recipe": dict(base["payload"], idempotency_key="coordination:coordination.agent_registered:project_fixture_alpha:agent_other:3:1"),
        }
        for expected, payload in cases.items():
            with self.subTest(rule=expected):
                self.assertEqual(CHECK.payload_rejection(base["event_type"], payload), expected)
        claim = PAYLOADS["a7_file_editing_r4"]
        self.assertEqual(CHECK.payload_rejection(claim["event_type"], dict(claim["payload"], path_hash=CHECK.path_hash("src/lib.rs"))),
                         "path_hash_recipe")
        abort = PAYLOADS["a9_aborted_parent_r2"]
        self.assertEqual(CHECK.payload_rejection(abort["event_type"], dict(abort["payload"], aborted_by_ref="run:run_other")), "abort_ref_join")

    def test_platform_is_an_open_runtime_platform_id(self):
        # Review repair CP-01: no list of platforms is closed (OSI-258, Models_System.md 1.2); only the form is bounded.
        base = PAYLOADS["a8_registered_minimal"]
        for value in ("opencode", "gemini_direct", "antigravity_cli", "codex"):
            with self.subTest(platform=value):
                self.assertIsNone(CHECK.payload_rejection(base["event_type"], dict(base["payload"], platform=value)))
        for value in ("Claude", "open code", "open-code", "1codex", "", "x" * 257):
            with self.subTest(platform=value):
                self.assertEqual(CHECK.payload_rejection(base["event_type"], dict(base["payload"], platform=value)), "schema")

    def test_key_without_a_well_formed_recovery_epoch_is_off_recipe(self):
        base = PAYLOADS["a8_registered_minimal"]
        prefix = "coordination:coordination.agent_registered:project_fixture_alpha:agent_fixture_8:"
        self.assertEqual(base["payload"]["idempotency_key"], prefix + "3:1")
        for key in (prefix + "1", prefix + "03:1", prefix + "x:1"):
            with self.subTest(key=key):
                self.assertEqual(CHECK.payload_rejection(base["event_type"], dict(base["payload"], idempotency_key=key)), "identity_recipe")
        self.assertIsNone(CHECK.payload_rejection(base["event_type"], dict(base["payload"], idempotency_key=prefix + "4:1")))

    def test_event_record_key_uses_the_event_id_recovery_epoch(self):
        record = copy.deepcopy(FIXTURES["valid_event"])
        self.assertIsNone(CHECK.envelope_rejection(record, CONTEXT["storage_instance_id"], CONTEXT["recovery_epoch"]))
        other = record["idempotency_key"].rsplit(":", 2)
        key = f"{other[0]}:{CONTEXT['recovery_epoch'] + 1}:{other[2]}"
        record["idempotency_key"] = key
        record["payload"]["idempotency_key"] = key
        self.assertIsNone(CHECK.payload_rejection(record["event_type"], record["payload"]))
        self.assertEqual(CHECK.envelope_rejection(record, CONTEXT["storage_instance_id"], CONTEXT["recovery_epoch"]), "identity_recipe")

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
        self.assertEqual(CHECK.idempotency_key("coordination.agent_crashed", "project_a", "agent:with:colon", 3, 12),
                         "coordination:coordination.agent_crashed:project_a:agent:with:colon:3:12")
        # Review repair CP-02: the recovery epoch is in the key, so a new epoch gives a new key.
        self.assertNotEqual(CHECK.idempotency_key("coordination.agent_crashed", "project_a", "agent_a", 4, 6),
                            CHECK.idempotency_key("coordination.agent_crashed", "project_a", "agent_a", 3, 6))
        self.assertEqual(CHECK.key_recovery_epoch("coordination:coordination.agent_crashed:project_a:agent:with:colon:3:12"), 3)
        self.assertEqual(CHECK.key_recovery_epoch("coordination:coordination.agent_crashed:project_a:agent_a:0:2"), 0)
        for key in ("coordination:coordination.agent_crashed:project_a:agent_a:03:2", "coordination:coordination.agent_crashed:project_a:agent_a:-3:2",
                    "coordination:coordination.agent_crashed:project_a:agent_a:2", "coordination:2"):
            with self.subTest(key=key):
                self.assertIsNone(CHECK.key_recovery_epoch(key))
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
            "platform_pattern":
                lambda schema: schema["$defs"]["snapshot_agent"]["properties"].update(platform={"enum": ["codex"]}),
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
                ledger = copy.deepcopy(PREP_LEDGER)
                mutation(ledger)
                self.assertIn(expected, errors(CHECK.ledger_failures(ledger)))
        for mutation in (status, order):
            with self.subTest(mutation=mutation.__name__):
                ledger = copy.deepcopy(PREP_LEDGER)
                mutation(ledger)
                self.assertTrue(errors(CHECK.ledger_failures(ledger)) & {"ledger_schema", "ledger_row_order"})

    def test_admitted_row_needs_authority_contract_ref(self):
        ledger = admitted(PREP_LEDGER, 0)
        self.assertEqual(CHECK.ledger_failures(ledger), [])
        del ledger["rows"][0]["authority_contract_ref"]
        self.assertIn("ledger_schema", errors(CHECK.ledger_failures(ledger)))

    def test_each_prepared_row_is_what_the_registry_would_receive(self):
        self.assertEqual(CHECK.registry_preflight_failures(), [])
        self.assertEqual(CHECK.registry_preflight_failures(PREP_LEDGER, PREP_REGISTRY), [])
        ledger = copy.deepcopy(PREP_LEDGER)
        ledger["rows"][1]["registry_row"]["payload_schema_ref"]["json_pointer"] = "#/$defs/agent_missing"
        self.assertEqual(errors(CHECK.registry_preflight_failures(ledger, PREP_REGISTRY)), {"prepared_row_not_admissible"})

    def test_validation_case_ids_stay_within_their_family(self):
        self.assertEqual(CHECK.validation_case_failures(), [])
        ledger = copy.deepcopy(PREP_LEDGER)
        ledger["rows"][0]["validation_case_ids"].append("status_terminal_value")
        self.assertIn("validation_case_of_other_family", errors(CHECK.validation_case_failures(ledger)))
        ledger = copy.deepcopy(PREP_LEDGER)
        ledger["rows"][6]["validation_case_ids"].remove("aborted_unknown_reason")
        self.assertIn("family_cases_not_named_by_ledger_row", errors(CHECK.validation_case_failures(ledger)))


class RegistryMembershipTests(unittest.TestCase):
    def test_prepared_row_cannot_be_registered(self):
        for index, event_type in enumerate(CHECK.SEVEN):
            with self.subTest(event=event_type):
                registry = with_row(PREP_REGISTRY, PREP_LEDGER["rows"][index]["registry_row"])
                self.assertEqual(errors(CHECK.registry_membership_failures(registry, PREP_LEDGER)), {"prepared_coordination_family_registered"})

    def test_admitted_row_must_be_registered_byte_for_byte(self):
        ledger = admitted(PREP_LEDGER, 0)
        prepared = ledger["rows"][0]["registry_row"]
        self.assertEqual(CHECK.registry_membership_failures(with_row(PREP_REGISTRY, prepared), ledger), [])
        self.assertEqual(errors(CHECK.registry_membership_failures(PREP_REGISTRY, ledger)), {"admitted_coordination_family_missing_or_duplicate"})
        changed = copy.deepcopy(prepared)
        changed["source_refs"] = changed["source_refs"][:-1]
        self.assertEqual(errors(CHECK.registry_membership_failures(with_row(PREP_REGISTRY, changed), ledger)),
                         {"admitted_coordination_row_differs_from_prepared_row"})
        self.assertEqual(errors(CHECK.registry_membership_failures(with_row(with_row(PREP_REGISTRY, prepared), prepared), ledger)),
                         {"admitted_coordination_family_missing_or_duplicate"})

    def test_mirror_and_unknown_coordination_rows_are_refused(self):
        mirror = copy.deepcopy(PREP_LEDGER["rows"][0]["registry_row"])
        mirror.update(event_type=CHECK.MIRROR, family_id="event-family-coordination-debug-mirror-exported")
        self.assertTrue(errors(CHECK.registry_membership_failures(with_row(PREP_REGISTRY, mirror), PREP_LEDGER)))
        unknown = dict(mirror, event_type="coordination.agent_heartbeat", family_id="event-family-coordination-agent-heartbeat")
        self.assertEqual(errors(CHECK.registry_membership_failures(with_row(PREP_REGISTRY, unknown), PREP_LEDGER)),
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
            value["payloads"][0]["payload"]["platform"] = "VS Code"
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


    def test_new_recovery_epoch_vector_must_give_a_new_key(self):
        # Review repair CP-02: after a verified older restore a newly prepared event gets a new key.
        vector = next(case for case in FIXTURES["identity_vectors"] if "prior_recovery_epoch" in case)
        self.assertNotEqual(vector["prior_idempotency_key"], vector["expected_idempotency_key"])
        value = copy.deepcopy(FIXTURES)
        changed = next(case for case in value["identity_vectors"] if "prior_recovery_epoch" in case)
        changed["prior_idempotency_key"] = changed["expected_idempotency_key"]
        self.assertEqual(CHECK.fixture_report(value)["failures"], [{"error": "identity_vector_mismatch", "case_id": vector["case_id"]}])


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


def documents(registry, ledger):
    """Loader side effect that swaps only the central registry and the coordination ledger."""
    replacements = {CHECK.REGISTRY_PATH: registry, CHECK.LEDGER_PATH: ledger}

    def swap(original):
        return lambda path: copy.deepcopy(replacements[path]) if path in replacements else original(path)
    return swap


class ClosedWorldGuardTests(unittest.TestCase):
    """The Browser gate and the two pinned test helpers accept admitted coordination rows and nothing else.

    A first admission landing appends the prepared row and flips the ledger row; with the guards
    generalized, it has to move only the DL-078 pins, which these tests never touch.
    """

    @classmethod
    def setUpClass(cls):
        cls.browser = module("coordination_browser_gate", "scripts/pm-browser-event-admission.py")
        cls.testing = module("coordination_testing_session_tests", "tests/test_pm_testing_session_events.py")
        cls.github = module("coordination_github_project_tests", "tests/test_pm_github_project_integration.py")
        cls.first = admitted(PREP_LEDGER, 0)
        cls.first_registry = with_row(PREP_REGISTRY, cls.first["rows"][0]["registry_row"])

    def browser_failures(self, registry, ledger):
        with patch.object(self.browser, "load_json", side_effect=documents(registry, ledger)(self.browser.load_json)):
            _report, failures = self.browser.preexisting_preservation(self.browser.contract_context()[0], registry["families"])
        return errors(failures)

    def helpers(self):
        return (
            (self.testing.gate, self.testing.TestingSessionEventTests("test_static_candidates_and_all_authored_negatives_without_admission")),
            (self.github.GATE, self.github.GitHubProjectIntegrationTests("test_two_candidates_and_all_negative_fixtures_without_admission")),
        )

    def helper_count(self, gate, case, registry, ledger):
        with patch.object(gate, "load", side_effect=documents(registry, ledger)(gate.load)):
            return case.assert_registry_matches_upstream_plus_admitted_browser()

    def test_browser_behaviour_on_the_live_registry_is_unchanged(self):
        self.assertEqual(self.browser_failures(REGISTRY, LEDGER), set())
        self.assertEqual(self.browser.admitted_coordination_rows(),
                         {(row["family_id"], row["event_type"]): self.browser.fingerprint(row["registry_row"])
                          for row in LEDGER["rows"] if row["admission_status"] == CHECK.ADMITTED})

    def test_browser_gate_accepts_an_admitted_row_only_as_its_prepared_row(self):
        self.assertNotIn("unexpected_central_event_family", self.browser_failures(self.first_registry, self.first))
        self.assertIn("unexpected_central_event_family", self.browser_failures(self.first_registry, PREP_LEDGER))
        changed = copy.deepcopy(self.first["rows"][0]["registry_row"])
        changed["family_revision"] = "1.0.1"
        self.assertIn("unexpected_central_event_family", self.browser_failures(with_row(PREP_REGISTRY, changed), self.first))
        mirror = dict(changed, family_revision="1.0.0", event_type=CHECK.MIRROR, family_id="event-family-coordination-debug-mirror-exported")
        self.assertIn("unexpected_central_event_family", self.browser_failures(with_row(self.first_registry, mirror), self.first))

    def test_browser_gate_opens_no_family_outside_the_seven(self):
        # A ledger row marked admitted can open only its own coordination family, never another one.
        foreign = copy.deepcopy(self.first)
        other = dict(foreign["rows"][0]["registry_row"], event_type="crew.formed", family_id="event-family-crew-formed")
        foreign["rows"][0]["registry_row"] = other
        self.assertIn("unexpected_central_event_family", self.browser_failures(with_row(PREP_REGISTRY, other), foreign))
        relabelled = copy.deepcopy(foreign)
        relabelled["rows"][0].update(event_type="crew.formed", family_id="event-family-crew-formed")
        self.assertIn("unexpected_central_event_family", self.browser_failures(with_row(PREP_REGISTRY, other), relabelled))

    def test_browser_gate_fails_closed_without_a_readable_ledger(self):
        def unreadable(path):
            raise OSError(path)
        with patch.object(self.browser, "load_json", side_effect=unreadable):
            self.assertEqual(self.browser.admitted_coordination_rows(), {})
        _report, failures = self.browser.preexisting_preservation(
            self.browser.contract_context()[0], self.first_registry["families"], coordination_rows={})
        self.assertIn("unexpected_central_event_family", errors(failures))

    def test_browser_validate_passes_after_a_simulated_first_admission(self):
        with patch.object(self.browser, "load_json", side_effect=documents(self.first_registry, self.first)(self.browser.load_json)):
            report = self.browser.validate()
        browser = sum(1 for row in CHECK.load("Plans/browser_event_admission.json")["rows"] if row["admission_status"] == CHECK.ADMITTED)
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["registry_family_count"], len(PREP_REGISTRY["families"]) + 1)
        self.assertEqual(report["admitted_scoped_event_families"], browser)

    def test_pinned_helpers_count_admitted_coordination_rows_and_nothing_else(self):
        browser = sum(1 for row in CHECK.load("Plans/browser_event_admission.json")["rows"] if row["admission_status"] == CHECK.ADMITTED)
        coordination = sum(1 for row in LEDGER["rows"] if row["admission_status"] == CHECK.ADMITTED)
        changed = copy.deepcopy(self.first["rows"][0]["registry_row"])
        changed["source_refs"] = changed["source_refs"][:-1]
        for gate, case in self.helpers():
            with self.subTest(helper=type(case).__name__):
                self.assertEqual(self.helper_count(gate, case, REGISTRY, LEDGER), browser + coordination)
                self.assertEqual(self.helper_count(gate, case, PREP_REGISTRY, PREP_LEDGER), browser)
                self.assertEqual(self.helper_count(gate, case, self.first_registry, self.first), browser + 1)
                for registry, ledger in ((self.first_registry, PREP_LEDGER), (PREP_REGISTRY, self.first), (with_row(PREP_REGISTRY, changed), self.first)):
                    with self.assertRaises(AssertionError):
                        self.helper_count(gate, case, registry, ledger)

    def test_coordination_checker_passes_the_simulated_first_admission(self):
        self.assertEqual(CHECK.registry_membership_failures(self.first_registry, self.first), [])
        self.assertEqual(CHECK.ledger_failures(self.first), [])

    def test_holding_bucket_post_august_list_follows_admitted_coordination_rows(self):
        holding = module("coordination_holding_bucket_tests", "tests/test_event_authority_holding_bucket.py")
        admitted_types = [row["event_type"] for row in LEDGER["rows"] if row["admission_status"] == CHECK.ADMITTED]
        post = holding.PostAugustAdmissionTests.POST
        self.assertEqual(post[:3], ["context.compaction.completed", "browser.workspace.created", "browser.workspace.reset"])
        self.assertEqual(post[3:], admitted_types)
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            (repo / "Plans").mkdir()
            (repo / CHECK.LEDGER_PATH).write_text(json.dumps(PREP_LEDGER), encoding="utf-8")
            self.assertEqual(holding.admitted_coordination_decisions(repo), {})
            (repo / CHECK.LEDGER_PATH).write_text(json.dumps(self.first), encoding="utf-8")
            with self.assertRaises(FileNotFoundError):
                holding.admitted_coordination_decisions(repo)
            records = repo / "reports/event-authority-20260911/admission-records"
            records.mkdir(parents=True)
            (records / "coordination.agent_registered.json").write_text(
                json.dumps({"decision_ref": "Plans/Decision_Log.md#DL-094"}), encoding="utf-8")
            self.assertEqual(holding.admitted_coordination_decisions(repo), {"coordination.agent_registered": "DL-094"})


if __name__ == "__main__":
    unittest.main()
