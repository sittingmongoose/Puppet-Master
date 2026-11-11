#!/usr/bin/env python3
"""Single-defect witnesses and gated guard-tool runs for coordination."""
import copy
import importlib.util
import json
from pathlib import Path

import pm_guard_isolation as g
import pm_coordination_tables as tables

ROOT = Path(__file__).resolve().parents[1]


def load_coordination():
    spec = importlib.util.spec_from_file_location("coordination_guard_events", ROOT / "scripts/pm_coordination_events.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_wave2(coordination):
    spec = importlib.util.spec_from_file_location("coordination_guard_wave2", ROOT / "scripts/pm_coordination_wave2.py")
    module = importlib.util.module_from_spec(spec)
    # The wave2 module loads its own coordination copy. Witnesses patch that copy.
    spec.loader.exec_module(module)
    return module


def names(items):
    if items is None:
        return []
    if isinstance(items, str):
        return [items]
    return [item["error"] if isinstance(item, dict) else item for item in items]


def unique(items):
    found = []
    for name in names(items):
        if name not in found:
            found.append(name)
    return found


class Witnesses:
    def __init__(self):
        self.c = load_coordination()
        self.w = load_wave2(self.c)
        self.fix = self.c.load(self.c.FIXTURE_PATH)
        self.payloads = {case["case_id"]: case for case in self.fix["payloads"]}
        self.projections = {case["case_id"]: case for case in self.fix["projection_values"]}
        self.events = {case["case_id"]: case for case in self.fix["valid_events"]}
        self.found = {phase: {} for phase in tables.CASES}

    def add(self, phase, row, defect, got):
        got = unique(got)
        if got == [row]:
            self.found[phase][row] = defect
        return got

    def attempt(self, phase, defect, got):
        got = unique(got)
        if len(got) == 1 and got[0] not in self.found[phase]:
            order = list(tables.CASES[phase]().table.guards)
            if got[0] in order:
                self.found[phase][got[0]] = defect

    def with_docs(self, replacements, call):
        original = self.c.load

        def load(path, root=self.c.ROOT):
            if path in replacements:
                return replacements[path]
            return original(path, root)

        self.c.load = load
        try:
            return call()
        finally:
            self.c.load = original

    def collect(self):
        self.payload_schema()
        self.payload_instance()
        self.projection_schema()
        self.projection_value()
        self.ledger()
        self.registry()
        self.preflight()
        self.svr()
        self.envelope()
        self.fixtures()
        self.validation()
        self.ats()
        self.transition()
        self.wave2()
        self.more()
        return self.found

    def payload_schema(self):
        c = self.c
        uri = c.PAYLOAD_SCHEMA_URI
        base = c.load(c.PAYLOAD_PATH)

        def run(label, mutate):
            doc = copy.deepcopy(base)
            mutate(doc)
            got = self.with_docs({c.PAYLOAD_PATH: doc}, lambda: c.payload_schema_failures())
            return self.add("payload_schema", label, label, got)

        run("payload_schema_invalid", lambda s: s.__setitem__("type", ["nope"]))
        run("payload_schema_uri", lambda s: s.update({"$id": "other"}))
        run("payload_schema_definition_census", lambda s: s["$defs"].__setitem__("rogue", {"type": "object"}))
        run("payload_schema_root_members", lambda s: s["oneOf"].pop())
        run("lineage_envelope_fields", lambda s: s["$defs"]["lineage_envelope"]["properties"].__setitem__("extra", {"type": "string"}))
        run("payload_definition_schema_id", lambda s: s["$defs"]["agent_aborted"].update({"$id": "pm.coordination_event.agent_aborted.schema.v2"}))
        run("payload_definition_not_closed", lambda s: s["$defs"]["agent_crashed"].update(additionalProperties=True))
        run("payload_definition_schema_version", lambda s: s["$defs"]["agent_registered"]["properties"]["schema_version"].update(const="9.9.9"))
        run("payload_definition_fields_differ_from_contracts_row", lambda s: s["$defs"]["agent_registered"]["properties"].update(current_operation={"type": "string"}))
        run("payload_definition_required_fields", lambda s: s["$defs"]["agent_operation_updated"]["required"].remove("operation_summary"))
        run("closed_domain", lambda s: s["$defs"]["agent_status_updated"]["properties"].update(status={"enum": ["queued", "running", "awaiting_parent", "blocked", "complete"]}))
        run("platform_pattern", lambda s: s["$defs"]["lineage_envelope"]["properties"].update(platform={"enum": ["codex"]}))
        run("path_ref_pattern", lambda s: s["$defs"]["agent_file_ownership_updated"]["properties"]["path_ref"].update(maxLength=4096))
        run("project_payload_reference_not_isolated", lambda s: s["$defs"]["agent_status_updated"]["properties"].__setitem__(
            "status_reason", {"$ref": uri + "#/$defs/agent_status_updatedApplicationV1/properties/status_reason"}))
        run("payload_schema_admits_null", lambda s: s["$defs"]["agent_status_updated"]["properties"].update(status_reason={"type": ["string", "null"]}))
        run("application_integer_bounds_match", lambda s: s["$defs"]["agent_status_updatedApplicationV1"]["properties"]["agent_revision"].update(minimum=9))

        def both_lineage(s):
            ref = {"$ref": uri + "#/$defs/non_secret_ref"}
            s["$defs"]["agent_status_updated"]["allOf"] = [ref]
            s["$defs"]["agent_status_updatedApplicationV1"]["allOf"] = [copy.deepcopy(ref)]
        run("payload_definition_lineage_envelope", both_lineage)

    def payload_instance(self):
        c = self.c
        base = self.payloads["a8_registered_minimal"]
        claim = self.payloads["a7_file_editing_r4"]
        abort = self.payloads["a9_aborted_parent_r2"]
        operation = self.payloads["a7_operation_progress_r5"]
        cases = {
            "unknown_event_type": ("nope", base["payload"]),
            "schema": (base["event_type"], dict(base["payload"], platform="Claude")),
            "payload_integer_slots": (operation["event_type"], dict(operation["payload"], progress_pct=1.0)),
            "valid_utc_datetime": (base["event_type"], dict(base["payload"], started_at_utc="2026-02-30T04:10:00Z")),
            "identity_recipe": (base["event_type"], dict(base["payload"], idempotency_key="coordination:coordination.agent_registered:project_fixture_alpha:agent_other:3:1")),
            "path_hash_recipe": (claim["event_type"], dict(claim["payload"], path_hash=c.path_hash("src/lib.rs"))),
            "abort_ref_join": (abort["event_type"], dict(abort["payload"], aborted_by_ref="run:run_other")),
        }
        for row, (event_type, payload) in cases.items():
            self.add("payload_instance", row, row, c.payload_rejection(event_type, payload))

    def projection_schema(self):
        c = self.c
        base = c.load(c.PROJECTION_PATH)

        def run(label, mutate):
            doc = copy.deepcopy(base)
            mutate(doc)
            got = self.with_docs({c.PROJECTION_PATH: doc}, lambda: c.projection_schema_failures())
            self.add("projection_schema", label, label, got)

        run("projection_schema_invalid", lambda s: s.__setitem__("type", ["nope"]))
        run("projection_schema_uri", lambda s: s.update({"$id": "other"}))
        run("projection_schema_definition_census", lambda s: s["$defs"].__setitem__("rogue", {"type": "object"}))
        run("projection_schema_root_members", lambda s: s["oneOf"].pop())
        run("projection_value_identity", lambda s: s["$defs"]["file_projection"]["properties"].update(schema_id={"const": "pm.storage_value.other.v1"}))
        run("checkpoint_token_binding", lambda s: s["$defs"]["checkpoint"]["properties"].__setitem__("index_read_token", {"type": "object"}))
        run("checkpoint_cursor_not_sp278_last_frame", lambda s: s["$defs"]["checkpoint"]["properties"].__setitem__("source_cursor", {"type": "object"}))
        run("checkpoint_admitted_domain", lambda s: s["$defs"]["checkpoint"]["properties"]["admitted_event_types"]["items"]["enum"].append(c.MIRROR))
        run("platform_pattern", lambda s: s["$defs"]["snapshot_agent"]["properties"].update(platform={"enum": ["codex"]}))
        run("path_ref_pattern", lambda s: s["$defs"]["path_ref"].update(maxLength=4096))
        run("coordination_authority_binding_mismatch", lambda s: s["x-pm-event-authority-binding"].update(projector_version="1.0.1"))
        run("stored_live_snapshot_fence", lambda s: s["$defs"]["agent_projection"]["properties"].__setitem__("redb_snapshot_id", {"type": "string"}))
        run("checkpoint_token_not_sp278_durable_token", lambda s: s["$defs"]["durable_read_token"]["properties"].pop("frontier_sha256"))

    def projection_value(self):
        c = self.c
        current = self.projections["checkpoint_current"]["value"]
        history = copy.deepcopy(self.projections["checkpoint_with_retired_generation"]["value"])
        file_row = self.projections["projection_file_claim"]["value"]
        cases = {
            "schema": ("checkpoint", dict(current, index_read_token=dict(current["index_read_token"], redb_snapshot_id="snapshot_fixture_1"))),
            "path_hash_recipe": ("file_projection", dict(file_row, path_hash=c.path_hash("src/lib.rs"))),
            "checkpoint_scope_partition": ("checkpoint", dict(current, scope_partition=c.scope_partition("project_other"))),
            "checkpoint_token_storage_instance": ("checkpoint", dict(current, index_read_token=dict(current["index_read_token"], storage_instance_id="5f1c2d3e-5a6b-4c7d-8e9f-0a1b2c3d4e5f"))),
            "checkpoint_admitted_types_not_sorted": ("checkpoint", dict(current, admitted_event_types=list(reversed(current["admitted_event_types"])))),
            "checkpoint_publication_reused": ("checkpoint", history),
        }
        history["retired_generations"][0]["checkpoint_core"]["publication_id"] = history["publication_id"]
        for row, (definition, value) in list(cases.items()):
            if row == "checkpoint_publication_reused":
                value = history
            self.add("projection_value", row, row, c.projection_value_failures(definition, value))
        # Range and cursor are separate observations inside one public code. Each witness changes one side
        # and keeps the other true, so the public list stays the one code.
        ranged = copy.deepcopy(current)
        ranged["first_retained_sequence_id"] = ranged["index_through_sequence_id"] + 1
        ranged["source_cursor"] = dict(ranged["source_cursor"], last_sequence_id=ranged["index_through_sequence_id"])
        self.add("projection_value", "checkpoint_range_or_cursor", "first sequence after the cursor", c.projection_value_failures("checkpoint", ranged))
        core = copy.deepcopy(history)
        core["retired_generations"][0]["checkpoint_core"]["project_id"] = "project_other"
        core["retired_generations"][0]["checkpoint_core"]["publication_id"] = "publication-retired-only"
        self.add("projection_value", "checkpoint_retired_core_other_key", "retired core project", c.projection_value_failures("checkpoint", core))
        stamped = copy.deepcopy(file_row)
        stamped["observed_at_utc"] = "2026-09-25T24:00:00Z"
        self.add("projection_value", "projection_timestamp", "hour 24", c.projection_value_failures("file_projection", stamped))

    def ledger(self):
        c = self.c
        ledger = copy.deepcopy(c.load(c.LEDGER_PATH))
        self.add("ledger", "ledger_row_order", "swap first rows", self._ledger(self._swap(ledger)))
        broken = copy.deepcopy(c.load(c.LEDGER_PATH))
        broken["rows"][0]["family_id"] = "event-family-other"
        self.add("ledger", "ledger_family_id", "family id", self._ledger(broken))
        sha = copy.deepcopy(c.load(c.LEDGER_PATH))
        sha["rows"][0]["registry_row_sha256"] = "0" * 64
        self.add("ledger", "prepared_registry_row_sha256", "row sha", self._ledger(sha))

    def _swap(self, ledger):
        ledger["rows"][0], ledger["rows"][1] = ledger["rows"][1], ledger["rows"][0]
        return ledger

    def _ledger(self, ledger):
        return self.c.ledger_failures(ledger)

    def registry(self):
        c = self.c
        registry = copy.deepcopy(c.load(c.REGISTRY_PATH))
        registry["families"].append({"event_type": "coordination.agent_registered", "family_id": "event-family-coordination-agent-registered"})
        self.add("registry", "prepared_coordination_family_registered", "prepared row present", c.registry_membership_failures(registry))

    def preflight(self):
        c = self.c
        ledger = copy.deepcopy(c.load(c.LEDGER_PATH))
        ledger["rows"][0]["registry_row"]["family_revision"] = ""
        self.add("preflight", "prepared_row_not_admissible", "blank revision", c.registry_preflight_failures(ledger))

    def svr(self):
        c = self.c
        svr = copy.deepcopy(c.load(c.SVR_PATH))
        for row in svr["families"]:
            if row.get("family_id") == c.RECORD_FAMILY:
                row["schema_version"] = "9.9.9"
        self.add("svr", "coordination_storage_family_mismatch", "schema version", c.svr_failures(svr))
        missing = copy.deepcopy(c.load(c.SVR_PATH))
        missing["families"] = [row for row in missing["families"] if row.get("family_id") != c.RECORD_FAMILY]
        self.add("svr", "coordination_storage_family_missing_or_duplicate", "drop records family", c.svr_failures(missing))
        policy = copy.deepcopy(c.load(c.SVR_PATH))
        for item in policy["retention_policies"]:
            if item.get("policy_id") == "RP-COORDINATION-180D":
                item["ttl_seconds"] = 1
        self.add("svr", "coordination_retention_policy_changed", "ttl", c.svr_failures(policy))

    def envelope(self):
        c = self.c
        context = self.fix["storage_context"]
        record = copy.deepcopy(self.events["event_registered"]["record"]) if "event_registered" in self.events else copy.deepcopy(next(iter(self.events.values()))["record"])
        store, epoch = context["storage_instance_id"], context["recovery_epoch"]

        def check(row, mutate):
            sample = copy.deepcopy(record)
            mutate(sample)
            self.add("envelope", row, row, c.envelope_rejection(sample, store, epoch))

        check("project_only", lambda r: r.update(scope_kind="application"))
        check("inline_only", lambda r: r.update(payload_ref="payloads/ref"))
        check("payload_schema_id", lambda r: r.update(payload_schema_id="pm.coordination_event.other.schema.v1"))
        check("payload_envelope_identity", lambda r: r.update(run_id="run_other"))
        check("redaction_profile", lambda r: r.update(redaction_profile="other"))
        check("replay_only_not_appendable", lambda r: r.update(replay_policy="projector_replay_only"))
        check("replay_policy", lambda r: r.update(replay_policy="append_once"))
        check("occurred_at_join", lambda r: r.update(occurred_at_utc="2026-01-02T03:04:05Z"))
        check("envelope_occurred_at", lambda r: r.update(occurred_at_utc="2026-09-25T24:00:00Z"))
        check("envelope_storage_time", lambda r: r.update(observed_at_utc="2026-09-25T04:00:00+00:00"))
        check("unknown_event_type", lambda r: r.update(event_type="coordination.not_a_family"))
        check("identity_recipe", lambda r: r.update(event_id="evt_coordination_" + "ab" * 32))

    def fixtures(self):
        c = self.c
        fixtures = copy.deepcopy(self.fix)
        fixtures["storage_context"]["scope_partition"] = "project~other"
        self.add("fixtures", "fixture_storage_context_partition", "partition", c.fixture_report(fixtures)["failures"])

    def validation(self):
        c = self.c
        ledger = copy.deepcopy(c.load(c.LEDGER_PATH))
        ledger["rows"][0]["validation_case_ids"] = ["missing_case_for_guard"]
        self.add("validation", "validation_case_missing", "missing case", c.validation_case_failures(ledger))

    def ats(self):
        c = self.c
        fixtures = copy.deepcopy(self.fix)
        fixtures["required_native_oracles"] = [{"oracle_id": "missing_native_oracle", "execution_status": "NOT_RUN"}]
        self.add("ats", "ats_native_oracle_not_named", "unnamed oracle", c.ats_oracle_failures(fixtures))

    def transition(self):
        c = self.c
        context = self.fix["storage_context"]
        registered = self.payloads["a8_registered_minimal"]
        store = c.CoordinationStore(context["storage_instance_id"], context["recovery_epoch"], [registered["event_type"]])
        first = store.submit(registered["event_type"], copy.deepcopy(registered["payload"]))
        if first["result"] != "appended":
            return
        again = store.submit(registered["event_type"], copy.deepcopy(registered["payload"]))
        self.add("transition", "exact_retry_is_not_a_refusal", "retry", [again["result"]])
        conflict = copy.deepcopy(registered["payload"])
        conflict["platform"] = "cursor" if conflict.get("platform") != "cursor" else "codex"
        # platform change may fail schema or identity; use a field the digest covers and schema allows
        conflict = copy.deepcopy(registered["payload"])
        conflict["model_id"] = "other-model"
        self.add("transition", "idempotency_conflict", "different model", [store.submit(registered["event_type"], conflict)["result"]])
        fresh = c.CoordinationStore(context["storage_instance_id"], context["recovery_epoch"], [])
        self.add("transition", "quarantined_before_append", "not admitted", [fresh.submit(registered["event_type"], copy.deepcopy(registered["payload"]))["result"]])

    def wave2(self):
        owner = (ROOT / "Plans/orchestrator-subagent-integration.md").read_text()
        storage = (ROOT / "Plans/storage-plan.md").read_text()
        fixtures = json.loads((ROOT / "Plans/coordination_wave2_oracles.json").read_text())
        self.add("wave2", "threshold_owner_literals", "drop a literal", self.w.validate_contracts(fixtures, owner_text=owner.replace("**300000**", "300000", 1))["failures"])
        bad = copy.deepcopy(fixtures)
        bad["heartbeat_expiry_vectors"] = [{"age_ms": 1, "expected": False}]
        self.add("wave2", "threshold_oracle_census", "one vector", self.w.validate_contracts(bad)["failures"])
        self.add("wave2", "sp_unit_literals", "drop SP-278", self.w.validate_contracts(fixtures, storage_text=storage.replace("SP-278", "SP-000", 1))["failures"])


    def more(self):
        c = self.c
        ledger = c.load(c.LEDGER_PATH)
        registry = c.load(c.REGISTRY_PATH)
        fix = self.fix

        def led(mutate):
            value = copy.deepcopy(ledger)
            mutate(value)
            self.attempt("ledger", "ledger", c.ledger_failures(value))

        led(lambda v: v["rows"].__setitem__(slice(0, 2), [v["rows"][1], v["rows"][0]]))
        led(lambda v: v["rows"][1].__setitem__("family_id", v["rows"][2]["family_id"]))
        led(lambda v: v["rows"][2]["registry_row"]["source_refs"].reverse() or v["rows"][2].__setitem__(
            "registry_row_sha256", c.row_sha256(v["rows"][2]["registry_row"])))
        led(lambda v: v["rows"][5].__setitem__("producer_component", "AgentCoordinator.unregister_agent(AgentTerminalUpdate)"))
        led(lambda v: v["rows"][3]["registry_row"]["retention_policy_ref"].__setitem__("policy_id", "RP-PROJECTION-3GEN"))
        led(lambda v: v.__setitem__("rows", v["rows"][:1]))
        led(lambda v: v["rows"][1]["registry_row"].__setitem__("semantic_owner_doc", "Plans/other.md"))
        led(lambda v: v["rows"][1].__setitem__("semantic_owner_ref", "Plans/missing.md#nope"))
        led(lambda v: v["rows"][1]["registry_row"]["payload_schema_ref"].__setitem__("json_pointer", "#/$defs/missing"))
        led(lambda v: v["rows"][1]["consumer_contract_refs"].pop())
        led(lambda v: v["rows"][7]["payload_schema_ref"].__setitem__("json_pointer", "#/$defs/missing"))
        led(lambda v: v["rows"][7].__setitem__("semantic_owner_ref", "Plans/missing.md#nope"))

        def reg(ledger_value, registry_value, defect):
            self.attempt("registry", defect, c.registry_membership_failures(registry_value, ledger_value))

        prepared = copy.deepcopy(registry)
        prepared["families"].append(copy.deepcopy(ledger["rows"][1]["registry_row"]))
        reg(ledger, prepared, "prepared family registered")
        admitted = copy.deepcopy(ledger)
        admitted["rows"][1]["admission_status"] = c.ADMITTED
        admitted["rows"][1]["authority_contract_ref"] = "Plans/storage-plan.md#SP-544"
        reg(admitted, registry, "admitted missing")
        changed = copy.deepcopy(admitted["rows"][1]["registry_row"])
        changed["source_refs"] = changed["source_refs"][:-1]
        both = copy.deepcopy(registry)
        both["families"].append(changed)
        reg(admitted, both, "admitted bytes differ")
        unknown = copy.deepcopy(registry)
        unknown["families"].append({"event_type": "coordination.agent_heartbeat", "family_id": "event-family-coordination-agent-heartbeat"})
        reg(ledger, unknown, "unexpected family")

        pre = copy.deepcopy(ledger)
        pre["rows"][1]["registry_row"]["payload_schema_ref"]["json_pointer"] = "#/$defs/agent_missing"
        self.attempt("preflight", "bad pointer", c.registry_preflight_failures(pre, registry))

        def fix_codes(mutate, defect):
            value = copy.deepcopy(fix)
            mutate(value)
            self.attempt("fixtures", defect, c.fixture_report(value)["failures"])

        fix_codes(lambda v: v["payload_schema"].__setitem__("schema_id", "other"), "schema ref")
        fix_codes(lambda v: v["payloads"].append(copy.deepcopy(v["payloads"][0])), "duplicate id")
        fix_codes(lambda v: v["invalid_payloads"][0].__setitem__("base_case_id", "missing"), "payload base")
        fix_codes(lambda v: v["invalid_payloads"][0].__setitem__("expected_rejection", "identity_recipe"), "payload reason")
        fix_codes(lambda v: v["valid_events"][0].__setitem__("payload_case_id", "missing"), "event join")
        fix_codes(lambda v: v["valid_events"][0]["record"].__setitem__("unexpected_field", 1), "envelope schema")
        fix_codes(lambda v: v["valid_events"][0]["record"].__setitem__("event_id", "evt_coordination_" + "ab" * 32), "event rejected")
        fix_codes(lambda v: v["invalid_events"][0].__setitem__("base_event_case_id", "missing"), "event base")
        fix_codes(lambda v: v["invalid_events"][0].__setitem__("expected_rejection", "inline_only"), "event reason")
        fix_codes(lambda v: v["identity_vectors"][0].__setitem__("expected_event_id", "evt_coordination_" + "0" * 64), "identity vector")
        fix_codes(lambda v: v["path_vectors"][0].__setitem__("expected", "no_claim"), "path vector")
        fix_codes(lambda v: v["transition_sequences"][0]["steps"][0].__setitem__("payload_case_id", "missing"), "missing step payload")
        fix_codes(lambda v: v["transition_sequences"][1]["steps"][1].__setitem__("expected", "appended"), "step mismatch")
        fix_codes(lambda v: v["transition_sequences"][0]["final_agents"]["agent_fixture_7"].__setitem__("active_claim_count", 1), "final")
        fix_codes(lambda v: v["projection_values"][0]["value"].__setitem__("schema_id", "other"), "projection rejected")
        fix_codes(lambda v: v["invalid_projection_values"][0].__setitem__("base_case_id", "missing"), "projection base")
        fix_codes(lambda v: v["invalid_projection_values"][0].__setitem__("patch", {}), "projection reason")
        fix_codes(lambda v: v["required_native_oracles"][0].__setitem__("execution_status", "PASS"), "oracle")
        used = {event["payload_case_id"] for event in fix["valid_events"]}
        def positive(v):
            for case in v["payloads"]:
                if case["case_id"] not in used:
                    case["payload"]["platform"] = "VS Code"
                    return
        fix_codes(positive, "positive payload")
        def joins(v):
            base = next(event["case_id"] for event in v["valid_events"] if event["event_type"] == "coordination.agent_aborted")
            v["invalid_events"] = [event for event in v["invalid_events"]
                                   if not (event["base_event_case_id"] == base and event["expected_rejection"] == "occurred_at_join")]
        fix_codes(joins, "missing join")

        def val(mutate, defect):
            value = copy.deepcopy(ledger)
            mutate(value)
            self.attempt("validation", defect, c.validation_case_failures(value, fix))

        val(lambda v: v["rows"][0]["validation_case_ids"].append("status_terminal_value"), "other family")
        val(lambda v: v["rows"][0]["validation_case_ids"].__setitem__(0, "missing_case_for_guard"), "missing")
        val(lambda v: v["rows"][6]["validation_case_ids"].remove("aborted_unknown_reason"), "unnamed")

        text = (ROOT / "Plans/Automated_Testing_System.md").read_text().replace(
            '<a id="coordination-event-oracles-dl-045-2026-09-25"></a>', '<a id="removed"></a>', 1)
        original = (self.c.ROOT / "Plans/Automated_Testing_System.md").read_text
        # The checker reads the file. A witness passes fixtures; the missing-anchor case needs the file.
        # Keep the named-oracle witness only. The anchor row is proved by a temporary replacement below.
        path = self.c.ROOT / "Plans/Automated_Testing_System.md"
        original_text = path.read_text()
        try:
            path.write_text(text)
            self.attempt("ats", "missing anchor", c.ats_oracle_failures(fix))
        finally:
            path.write_text(original_text)

        context = fix["storage_context"]
        for sequence in fix["transition_sequences"]:
            store = c.CoordinationStore(context["storage_instance_id"], context["recovery_epoch"], sequence["admitted_event_types"])
            payloads = {case["case_id"]: case for case in fix["payloads"]}
            for step in sequence["steps"]:
                entry = payloads[step["payload_case_id"]]
                result = store.submit(entry["event_type"], copy.deepcopy(entry["payload"]))["result"]
                self.attempt("transition", sequence["case_id"], [result])

        hist = copy.deepcopy(self.projections["checkpoint_with_retired_generation"]["value"])
        core = hist["retired_generations"][0]["checkpoint_core"]
        core["project_id"] = "project_other"
        core["scope_partition"] = c.scope_partition("project_other")
        self.attempt("projection_value", "retired other project", c.projection_value_failures("checkpoint", hist))
        hist = copy.deepcopy(self.projections["checkpoint_with_retired_generation"]["value"])
        core = hist["retired_generations"][0]["checkpoint_core"]
        core["index_read_token"] = dict(core["index_read_token"], storage_instance_id="5f1c2d3e-5a6b-4c7d-8e9f-0a1b2c3d4e5f")
        self.attempt("projection_value", "retired token", c.projection_value_failures("checkpoint", hist))
        hist = copy.deepcopy(self.projections["checkpoint_with_retired_generation"]["value"])
        core = hist["retired_generations"][0]["checkpoint_core"]
        core["admitted_event_types"] = list(reversed(hist["admitted_event_types"]))
        self.attempt("projection_value", "retired sort", c.projection_value_failures("checkpoint", hist))
        hist = copy.deepcopy(self.projections["checkpoint_with_retired_generation"]["value"])
        core = hist["retired_generations"][0]["checkpoint_core"]
        core["first_retained_sequence_id"] = core["index_through_sequence_id"] + 1
        core["source_cursor"] = dict(core["source_cursor"], last_sequence_id=core["index_through_sequence_id"])
        self.attempt("projection_value", "retired range", c.projection_value_failures("checkpoint", hist))

        # Family transition census: retarget aborted steps and refresh derived expectations.
        value = copy.deepcopy(fix)
        reg_id = next(case["case_id"] for case in value["payloads"] if case["event_type"] == "coordination.agent_registered")
        types = {case["case_id"]: case["event_type"] for case in fix["payloads"]}
        ctx = value["storage_context"]
        for sequence in value["transition_sequences"]:
            for step in sequence["steps"]:
                if types[step["payload_case_id"]] == "coordination.agent_aborted":
                    step["payload_case_id"] = reg_id
            store = c.CoordinationStore(ctx["storage_instance_id"], ctx["recovery_epoch"], sequence["admitted_event_types"])
            payloads = {case["case_id"]: case for case in value["payloads"]}
            for step in sequence["steps"]:
                entry = payloads[step["payload_case_id"]]
                outcome = store.submit(entry["event_type"], copy.deepcopy(entry["payload"]))
                step["expected"] = outcome["result"]
                if outcome.get("event_id") is not None:
                    step["event_id"] = outcome["event_id"]
                else:
                    step.pop("event_id", None)
            final = store.final_state()
            for key in ("final_agents", "final_file_claims", "final_operations"):
                sequence[key] = final[key]
        self.attempt("fixtures", "aborted transitions retargeted", c.fixture_report(value)["failures"])

        led = copy.deepcopy(ledger)
        led["rows"][1]["payload_schema_ref"] = {
            "path": "Plans/coordination_event_payloads.schema.json",
            "json_pointer": "#/$defs/agent_registered",
            "schema_id": "pm.coordination_event.agent_registered.schema.v1",
        }
        self.attempt("ledger", "registry join", c.ledger_failures(led))
        led = copy.deepcopy(ledger)
        led["rows"][1]["consumer_contract_refs"] = ["Plans/storage-plan.md#SP-320"]
        self.attempt("ledger", "consumer refs", c.ledger_failures(led))
        appended = copy.deepcopy(ledger)
        appended["rows"][0]["validation_case_ids"].append("not_a_real_case")
        self.attempt("validation", "append missing", c.validation_case_failures(appended, fix))
        unclaimed = copy.deepcopy(ledger)
        sequence_id = fix["transition_sequences"][0]["case_id"]
        for row in unclaimed["rows"]:
            row["validation_case_ids"] = [item for item in row["validation_case_ids"] if item != sequence_id]
        self.attempt("validation", "unclaimed sequence", c.validation_case_failures(unclaimed, fix))
        foreign = copy.deepcopy(ledger)
        only_registered = next(
            sequence["case_id"] for sequence in fix["transition_sequences"]
            if {case["event_type"] for case in fix["payloads"] if case["case_id"] in {step["payload_case_id"] for step in sequence["steps"]}}
            == {"coordination.agent_registered"})
        foreign["rows"][1]["validation_case_ids"].append(only_registered)
        self.attempt("validation", "sequence without status", c.validation_case_failures(foreign, fix))
        value = copy.deepcopy(fix)
        value["transition_sequences"][0]["steps"][0]["payload_case_id"] = "missing"
        ctx = value["storage_context"]
        sequence = value["transition_sequences"][0]
        store = c.CoordinationStore(ctx["storage_instance_id"], ctx["recovery_epoch"], sequence["admitted_event_types"])
        payloads = {case["case_id"]: case for case in value["payloads"]}
        for step in sequence["steps"][1:]:
            entry = payloads[step["payload_case_id"]]
            outcome = store.submit(entry["event_type"], copy.deepcopy(entry["payload"]))
            step["expected"] = outcome["result"]
            if outcome.get("event_id") is not None:
                step["event_id"] = outcome["event_id"]
            else:
                step.pop("event_id", None)
        final = store.final_state()
        for key in ("final_agents", "final_file_claims", "final_operations"):
            sequence[key] = final[key]
        self.attempt("fixtures", "missing first payload", c.fixture_report(value)["failures"])

        owner = (ROOT / "Plans/orchestrator-subagent-integration.md").read_text()
        storage = (ROOT / "Plans/storage-plan.md").read_text()
        fixtures = json.loads((ROOT / "Plans/coordination_wave2_oracles.json").read_text())
        self.attempt("wave2", "unit literal", self.w.validate_contracts(
            fixtures, storage_text=storage.replace("### SP-540 -", "### SP-540 -\n\nSP-000\n", 1).replace("SP-278", "SP-000"))["failures"])
        original = self.w.c.load
        svr = copy.deepcopy(original(self.w.c.SVR_PATH))
        for row in svr["families"]:
            if row.get("family_id") == self.w.c.RECORD_FAMILY:
                row["schema_version"] = "9.9.9"

        def load(path, root=self.w.c.ROOT):
            if path == self.w.c.SVR_PATH:
                return svr
            return original(path, root)

        self.w.c.load = load
        try:
            self.attempt("wave2", "stored registry drift", self.w.validate_contracts(fixtures)["failures"])
        finally:
            self.w.c.load = original


def gaps(found):
    missing = {}
    for phase, function in tables.CASES.items():
        if phase == "wave2_entailed" or phase.endswith("_unprovable"):
            continue
        rows = list(function().table.guards)
        absent = [row for row in rows if row not in found.get(phase, {})]
        if absent:
            missing[phase] = absent
    return missing


def run_tool(found):
    reports = []
    memory = g.MemoryGate(max_rss=8192, pause_when_low=10, resume_at=13.5, poll=30)
    for phase, function in tables.CASES.items():
        if phase == "wave2_entailed" or phase.endswith("_unprovable"):
            continue
        order = list(function().table.guards)
        if any(row not in found[phase] for row in order):
            continue
        control = {name: True for name in order}
        negatives = []
        for row in order:
            value = dict(control)
            value[row] = False
            negatives.append(g.Negative("n-" + row.replace(":", "_"), value, row, row, "control", found[phase][row]))
        suite = g.Suite(
            "DCO " + phase,
            function,
            [g.Control("control", control, "synthetic")],
            negatives,
            ("scripts/pm_coordination_table_" + phase + ".py",),
            ROOT,
            non_guards=[g.NonGuard(
                "scripts/pm_coordination_table_" + phase + ".py", phase + "_case", "return",
                "return g.Case(table, check)", "Fresh case construction is not an acceptance decision.")],
        )
        report = g.run(suite, memory=memory)
        reports.append({
            "phase": phase,
            "status": report["status"],
            "rows": len(order),
            "proved": sum(1 for row in report["rows"] if row.get("proved")),
            "kinds": sorted({item["kind"] for item in report["failures"]}),
            "flips": sum(len(row.get("flips", [])) for row in report["rows"]),
            "stays": sum(len(row.get("stays", [])) for row in report["rows"]),
        })
        print(phase, report["status"], reports[-1]["proved"], "/", len(order), reports[-1]["kinds"])
    return reports


def main():
    witness = Witnesses()
    found = witness.collect()
    missing = gaps(found)
    print("MISSING")
    for phase, rows in missing.items():
        print(phase, rows)
    if not missing:
        run_tool(found)


if __name__ == "__main__":
    main()
