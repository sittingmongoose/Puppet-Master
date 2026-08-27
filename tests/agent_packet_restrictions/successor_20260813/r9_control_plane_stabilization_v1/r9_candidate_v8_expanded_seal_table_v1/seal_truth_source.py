#!/usr/bin/env python3
"""Deterministic authoring source for the expanded seal relation."""

SCHEMA_ID = "pw-r9-v8-expanded-seal-transition-relation-v2"
STATE_KEY = [
    "operation", "phase", "artifact_index", "publisher_cutpoint", "lock_state",
    "source_state", "shared_input_state", "client_state", "broker_state",
    "host_state", "scan_state",
]
OPERATIONS = ("ADMIT", "RESUME", "REOPEN")

ARTIFACTS = [
    {"artifact_id": "a00", "path": "seal_intent.json", "role": "seal_intent", "dependency_ids": []},
    {"artifact_id": "a01", "path": "seal_plan.json", "role": "seal_plan", "dependency_ids": ["a00"]},
    {"artifact_id": "a02", "path": "terminals/slot-alpha.json", "role": "terminal_alpha", "dependency_ids": ["a01"]},
    {"artifact_id": "a03", "path": "cursors/000.json", "role": "cursor000", "dependency_ids": ["a02"]},
    {"artifact_id": "a04", "path": "terminals/slot-bravo.json", "role": "terminal_bravo", "dependency_ids": ["a03"]},
    {"artifact_id": "a05", "path": "cursors/001.json", "role": "cursor001", "dependency_ids": ["a04"]},
    {"artifact_id": "a06", "path": "terminals/slot-charlie.json", "role": "terminal_charlie", "dependency_ids": ["a05"]},
    {"artifact_id": "a07", "path": "cursors/002.json", "role": "cursor002", "dependency_ids": ["a06"]},
    {"artifact_id": "a08", "path": "matrix_terminal.json", "role": "matrix_terminal", "dependency_ids": ["a07"]},
    {"artifact_id": "a09", "path": "cursors/003.json", "role": "cursor003", "dependency_ids": ["a01", "a02", "a04", "a06", "a08"], "forbidden_payload_fields": ["accounting_identity", "accounting_sha256", "accounting_bytes", "accounting_path", "predicted_successor"]},
    {"artifact_id": "a10", "path": "accounting.json", "role": "accounting", "dependency_ids": ["a00", "a01", "a02", "a03", "a04", "a05", "a06", "a07", "a08", "a09"], "bound_artifact_ids": ["a00", "a01", "a02", "a03", "a04", "a05", "a06", "a07", "a08", "a09"]},
]

ENVELOPE_FIELDS = [
    "schema_id", "run_id", "seal_epoch", "artifact_id", "artifact_index",
    "recipe_id", "dependency_identities", "payload",
]

A10_PAYLOAD_FIELDS = [
    "semantic_bundle_identity", "runner_identity", "recorder_identity", "verifier_identity",
    "seal_transition_relation_identity", "service_host_executable_identity",
    "service_host_argv_contract_identity", "service_host_config_binding_identity",
    "service_host_custody_identity", "cli_broker_executable_identity",
    "cli_broker_argv_contract_identity", "cli_broker_config_binding_identity",
    "cli_broker_custody_identity", "candidate_manifest_identity", "run_manifest_identity",
    "schedule_identity", "config_identity", "scorer_identity", "oracle_identity",
    "reducer_identity", "source_evidence_bundle_identity", "eligible_row_set_root_identity",
    "dispatch_journal_root_identity", "attempt_inventory_root", "spawn_inventory_root",
    "raw_result_inventory_root", "completion_inventory_root", "stage_inventory_root",
    "task_identity_inventory_root", "thread_identity_inventory_root", "turn_identity_inventory_root",
    "nonce_inventory_root", "argv_inventory_root", "rendered_prompt_inventory_root",
    "effective_config_inventory_root", "requested_route_inventory_root",
    "terminal_metadata_inventory_root", "score_inventory_root",
] + ["a%02d_identity" % index for index in range(10)] + [
    "planned_call_count", "attempt_count", "spawn_record_count", "raw_result_count",
    "valid_completion_count", "pass_count", "subject_fail_count", "controller_invalid_count",
    "missing_count", "ineligible_count", "aborted_count", "stopped_count", "stage_count",
    "invalid_stage_count", "spawn_failure_prefix_count", "terminal_failure_prefix_count",
    "retry_count", "relaunch_count", "replacement_count", "best_of_count", "thread_reuse_count",
    "duplicate_nonce_count", "post_admission_mutation_count", "unknown_dispatch_count",
    "unknown_terminal_delivery_count", "preaccounting_inventory_sha256",
    "preaccounting_inventory_entry_count", "preaccounting_inventory_bytes",
]

BAD_OBSERVATIONS = [
    "BAD_MISSING_REQUIRED_PARENT", "BAD_UNEXPECTED_DIRECTORY", "BAD_EXTRA_SCRATCH",
    "BAD_SYMLINK", "BAD_WRONG_TYPE", "BAD_WRONG_MODE", "BAD_WRONG_LINK_COUNT",
    "BAD_FINAL_BYTE_MISMATCH", "BAD_STAGE_BYTE_MISMATCH", "BAD_FINAL_IDENTITY_MISMATCH",
    "BAD_STAGE_IDENTITY_MISMATCH", "BAD_FINAL_STAGE_DIFFERENT_INODES",
    "BAD_FUTURE_ARTIFACT", "BAD_REORDERED_ARTIFACT", "BAD_PARTIAL_STAGE",
    "BAD_CONFLICTING_FINAL", "BAD_UNCLASSIFIED",
]
OBSERVATIONS = ["AA", "S1", "SF2", "F1"] + BAD_OBSERVATIONS

REQUEST_EVENTS = [
    "REQUEST_RECEIVED", "REQUEST_RUN_ID_VALID", "REQUEST_SEAL_EPOCH_VALID",
    "REQUEST_OPERATION_VALID", "REQUEST_AUTHORITY_FALSE", "REQUEST_EXECUTION_AUTHORITY_FALSE",
]
TOPOLOGY_EVENTS = [
    "TOPOLOGY_%s_%s_%s" % (client, broker, host)
    for client in ("OPEN", "QUIESCED", "LOST", "REPLACED")
    for broker in ("OPEN", "QUIESCED", "LOST")
    for host in ("OPEN", "QUIESCED", "RESTARTED", "LOST", "REPLACED", "RECOVERING", "STABLE")
]
LOCK_EVENTS = [
    "LOCK_ABSENT", "LOCK_EX_AVAILABLE", "LOCK_EX_BUSY", "LOCK_SH_AVAILABLE", "LOCK_SH_BUSY",
    "LOCK_NB_ACQUIRED", "LOCK_NB_DENIED", "LOCK_OWNER_LOST", "LOCK_REACQUIRED", "LOCK_INVALID",
]
SOURCE_EVENTS = [
    "SOURCE_ABSENT", "SOURCE_PRESENT_EXACT", "SOURCE_PRESENT_CHANGED", "SOURCE_MISSING",
    "SOURCE_WRONG_TYPE", "SOURCE_WRONG_MODE", "SOURCE_SYMLINK", "SOURCE_HASH_MISMATCH",
    "SOURCE_BYTES_MISMATCH", "SOURCE_PATH_MISMATCH", "SOURCE_CUSTODY_MISMATCH",
    "SOURCE_SCHEMA_MISMATCH", "SOURCE_RECIPE_MISMATCH", "SOURCE_DEPENDENCY_MISMATCH", "SOURCE_INVALID",
]
SHARED_EVENTS = [
    "SHARED_ABSENT", "SHARED_PRESENT_EXACT", "SHARED_PRESENT_CHANGED", "SHARED_MISSING",
    "SHARED_WRONG_TYPE", "SHARED_WRONG_MODE", "SHARED_SYMLINK", "SHARED_HASH_MISMATCH",
    "SHARED_BYTES_MISMATCH", "SHARED_PATH_MISMATCH", "SHARED_CUSTODY_MISMATCH",
    "SHARED_SCHEMA_MISMATCH", "SHARED_RECIPE_MISMATCH", "SHARED_DEPENDENCY_MISMATCH",
    "SHARED_ELIGIBLE_SET_MISMATCH", "SHARED_DISPATCH_JOURNAL_MISMATCH",
    "SHARED_PREACCOUNTING_MISMATCH", "SHARED_INVALID",
]

PUBLISH_STEPS = [
    "CREATE_STAGE", "WRITE_STAGE", "FSYNC_STAGE", "VERIFY_STAGE", "LINK_FINAL",
    "FSYNC_FINAL_PARENT", "UNLINK_STAGE", "FSYNC_SCRATCH_PARENT", "FINAL_VERIFY",
]
PUBLISH_EVENTS = [
    "DO_CREATE_STAGE", "CRASH_AFTER_CREATE_STAGE", "DO_WRITE_STAGE", "CRASH_AFTER_WRITE_STAGE",
    "DO_FSYNC_STAGE", "CRASH_AFTER_FSYNC_STAGE", "DO_VERIFY_STAGE", "CRASH_AFTER_VERIFY_STAGE",
    "DO_LINK_FINAL", "CRASH_AFTER_LINK_FINAL", "DO_FSYNC_FINAL_PARENT",
    "CRASH_AFTER_FSYNC_FINAL_PARENT", "DO_UNLINK_STAGE", "CRASH_AFTER_UNLINK_STAGE",
    "DO_FSYNC_SCRATCH_PARENT", "CRASH_AFTER_FSYNC_SCRATCH_PARENT", "DO_FINAL_VERIFY",
]
PUBLISH_CASES = ["AA_CREATE", "S1_RECOVERY", "SF2_CLEANUP", "F1_ADVANCE", "PARTIAL_STAGE", "FINAL_CONFLICT", "FINAL_EXACT"]


def state(operation, phase, artifact_index="NONE", publisher_cutpoint="NONE", lock_state="UNOBSERVED",
          source_state="UNOBSERVED", shared_input_state="UNOBSERVED", client_state="UNOBSERVED",
          broker_state="UNOBSERVED", host_state="UNOBSERVED", scan_state="UNOBSERVED"):
    return [operation, phase, artifact_index, publisher_cutpoint, lock_state, source_state,
            shared_input_state, client_state, broker_state, host_state, scan_state]


def changed(value, **updates):
    result = list(value)
    for key, item in updates.items():
        result[STATE_KEY.index(key)] = item
    return result


def lifecycle_rows(operation):
    rows = []
    base = state(operation, "REQUEST")
    groups = [
        ("request", REQUEST_EVENTS), ("topology", TOPOLOGY_EVENTS), ("lock", LOCK_EVENTS),
        ("source", SOURCE_EVENTS), ("shared", SHARED_EVENTS),
        ("post_source", ["POST_" + item for item in SOURCE_EVENTS]),
        ("post_shared", ["POST_" + item for item in SHARED_EVENTS]),
        ("post_lock", ["POST_" + item for item in LOCK_EVENTS]),
    ]
    for group, events in groups:
        for index, event in enumerate(events):
            before = changed(base, phase=group.upper(), scan_state="CASE_%03d" % index)
            after = changed(before, phase=group.upper() + "_OBSERVED")
            effects = ["NO_WRITE"]
            if group in ("lock", "post_lock"):
                lock_value = event.removeprefix("POST_").removeprefix("LOCK_")
                after = changed(after, lock_state=lock_value)
                if operation == "REOPEN" and event in ("LOCK_SH_AVAILABLE", "LOCK_NB_ACQUIRED", "POST_LOCK_SH_AVAILABLE", "POST_LOCK_NB_ACQUIRED"):
                    effects = ["LOCK_SH", "LOCK_NB", "READ_ONLY"]
                elif operation != "REOPEN" and event in ("LOCK_EX_AVAILABLE", "LOCK_NB_ACQUIRED", "POST_LOCK_EX_AVAILABLE", "POST_LOCK_NB_ACQUIRED"):
                    effects = ["LOCK_EX", "LOCK_NB"]
                elif "BUSY" in event or "DENIED" in event or "INVALID" in event:
                    effects = ["FAIL_CLOSED", "NO_WRITE"]
            elif group in ("source", "post_source"):
                after = changed(after, source_state=event.removeprefix("POST_").removeprefix("SOURCE_"))
            elif group in ("shared", "post_shared"):
                after = changed(after, shared_input_state=event.removeprefix("POST_").removeprefix("SHARED_"))
            elif group == "topology":
                _, client, broker, host = event.split("_", 3)
                after = changed(after, client_state=client, broker_state=broker, host_state=host)
            rows.append(("%s_%s" % (group.upper(), event), before, after, effects))
    assert len(rows) == 176
    return rows


def scanner_rows(operation):
    rows = []
    lifecycle = lifecycle_rows(operation)
    for pre_index, (_, _, lifecycle_next, _) in enumerate(lifecycle):
        artifact = "a%02d" % min(pre_index // 16, 10)
        for observation in OBSERVATIONS:
            before = changed(lifecycle_next, phase="SCAN_READ", artifact_index=artifact,
                             publisher_cutpoint="BEFORE_READ", scan_state="PRE_%03d" % pre_index)
            if operation == "REOPEN":
                before = changed(before, lock_state="SH_NB_HELD")
            if observation.startswith("BAD_"):
                after = changed(before, phase="FAILED_PRESERVED", publisher_cutpoint="AFTER_READ", scan_state=observation)
                effects = ["FAIL_CLOSED", "PRESERVE_EXISTING", "NO_WRITE"]
            else:
                after = changed(before, phase="SCAN_CLASS_RECORDED", publisher_cutpoint="AFTER_READ", scan_state=observation)
                effects = ["RECORD_%s" % observation, "NO_WRITE"]
            if operation == "REOPEN":
                effects.append("READ_ONLY")
            rows.append(("SCAN_PRE_%03d_%s" % (pre_index, observation), before, after, effects))
    for index in range(34):
        before = state(operation, "SCAN_EOF", "a%02d" % min(index // 3, 10), "BEFORE_EOF",
                       "HELD", "EXACT", "EXACT", "QUIESCED", "QUIESCED", "STABLE", "EOF_%02d" % index)
        phase = "SCAN_COMPLETE" if index % 2 == 0 else "SCAN_INCOMPLETE"
        effects = ["NO_WRITE", "SCAN_PREFIX_FIXED"]
        if operation == "ADMIT" and index >= 6:
            phase = "ADMIT_STOPPED_AFTER_A01"
            effects = ["NO_WRITE", "RETURN_ADMISSION_PREFIX"]
        elif operation == "RESUME" and index < 6:
            phase = "FAILED_NO_ADMISSION_PREFIX"
            effects = ["FAIL_CLOSED", "NO_WRITE"]
        elif operation == "REOPEN":
            effects = ["READ_ONLY", "NO_WRITE"]
        after = changed(before, phase=phase, publisher_cutpoint="AFTER_EOF")
        rows.append(("SCAN_EOF_%02d" % index, before, after, effects))
    assert len(rows) == 3730
    return rows


def publisher_rows(operation, artifact_id):
    rows = []
    for case in PUBLISH_CASES:
        for index, event in enumerate(PUBLISH_EVENTS):
            cutpoint = "BEFORE_" + PUBLISH_STEPS[min(index // 2, 8)]
            admission_state = "ADMISSION_AA_AA" if operation == "ADMIT" else "ADMISSION_F1_F1"
            before = state(operation, "PUBLISH", artifact_id, cutpoint, "EX_NB_HELD", admission_state, "EXACT",
                           "QUIESCED", "QUIESCED", "STABLE", case)
            after_cutpoint = event.removeprefix("DO_").removeprefix("CRASH_AFTER_")
            after = changed(before, publisher_cutpoint="AFTER_" + after_cutpoint)
            if event.startswith("CRASH_AFTER_"):
                effects = ["CRASH_SUCCESSOR", "RELEASE_KERNEL_LOCK", "PRESERVE_DURABLE_BOUNDARY"]
                after = changed(after, phase="CRASH_SUCCESSOR", lock_state="RELEASED_BY_KERNEL", host_state="RESTART_REQUIRED")
            elif case == "PARTIAL_STAGE":
                effects = ["FAIL_CLOSED", "PRESERVE_PARTIAL_STAGE", "NO_WRITE"]
                after = changed(after, phase="FAILED_PRESERVED")
            elif case == "FINAL_CONFLICT":
                effects = ["FAIL_CLOSED", "PRESERVE_CONFLICTING_FINAL", "NO_OVERWRITE"]
                after = changed(after, phase="FAILED_PRESERVED")
            elif case == "F1_ADVANCE":
                effects = ["ADVANCE_PREFIX", "NO_WRITE"]
                after = changed(after, phase="PREFIX_ADVANCED", scan_state="F1")
            elif case == "SF2_CLEANUP" and event.startswith("DO_"):
                effects = ["UNLINK_EXACT_STAGE", "FSYNC_SCRATCH_PARENT", "NO_OVERWRITE"]
                after = changed(after, scan_state="F1")
            elif case in ("S1_RECOVERY", "FINAL_EXACT") and event.startswith("DO_"):
                effects = ["VERIFY_EXACT", "LINK_OR_ADVANCE_WITHOUT_OVERWRITE"]
                after = changed(after, scan_state="SF2" if case == "S1_RECOVERY" else "F1")
            else:
                effects = [event, "NO_FALLBACK", "NO_OVERWRITE"]
                if event == "DO_FSYNC_STAGE":
                    after = changed(after, scan_state="S1")
                elif event == "DO_LINK_FINAL":
                    after = changed(after, scan_state="SF2")
                elif event == "DO_FSYNC_SCRATCH_PARENT":
                    after = changed(after, scan_state="F1")
            rows.append(("PUBLISH_%s_%s_%s" % (artifact_id.upper(), case, event), before, after, effects))
    assert len(rows) == 119
    return rows


def artifact_contracts():
    contracts = []
    for artifact in ARTIFACTS:
        artifact_id = artifact["artifact_id"]
        payload_fields = ["run_id", "seal_epoch", "content_identity"]
        if artifact_id == "a00":
            payload_fields += ["operation", "admission_input_identity", "dispatch_quiesced", "dispatch_journal_root_identity"]
        elif artifact_id == "a01":
            payload_fields += ["descendant_paths", "descendant_schema_ids", "descendant_recipe_ids", "descendant_dependency_ids", "descendant_hash_input_selectors"]
        elif artifact_id in ("a02", "a04", "a06"):
            payload_fields += ["terminal_slot", "eligible_row_identity", "attempt_identity", "spawn_identity", "raw_result_identity", "completion_identity", "terminal_metadata_identity", "score_identity"]
        elif artifact_id in ("a03", "a05", "a07"):
            payload_fields += ["completed_prefix_identities", "next_artifact_id", "eligible_row_set_root_identity", "dispatch_journal_root_identity"]
        elif artifact_id == "a08":
            payload_fields += ["terminal_identities", "cursor_identities", "eligible_row_set_root_identity", "dispatch_journal_root_identity", "matrix_row_count", "terminal_count"]
        elif artifact_id == "a09":
            payload_fields += ["accounting_required", "immutable_accounting_input", "immutable_accounting_input_digest"]
        elif artifact_id == "a10":
            payload_fields = list(A10_PAYLOAD_FIELDS)
        contracts.append({
            "artifact_id": artifact_id,
            "envelope_schema": {"additional_fields": False, "fields": list(ENVELOPE_FIELDS), "required_fields": list(ENVELOPE_FIELDS)},
            "payload_recipe": {"additional_fields": False, "field_set": payload_fields, "recipe_id": "recipe-%s-v1" % artifact_id},
        })
    return contracts


def build_relation():
    raw_rows = []
    section_counts = {}
    for operation in OPERATIONS:
        lifecycle = lifecycle_rows(operation)
        scanner = scanner_rows(operation)
        section_counts[operation] = {"lifecycle": len(lifecycle), "scanner": len(scanner), "publisher": 0}
        raw_rows.extend((operation + "_LIFECYCLE_" + item[0],) + item[1:] for item in lifecycle)
        raw_rows.extend((operation + "_" + item[0],) + item[1:] for item in scanner)
    publisher_ownership = {"ADMIT": ["a00", "a01"], "RESUME": ["a%02d" % index for index in range(2, 11)], "REOPEN": []}
    for operation in OPERATIONS:
        for artifact_id in publisher_ownership[operation]:
            publisher = publisher_rows(operation, artifact_id)
            section_counts[operation]["publisher"] += len(publisher)
            raw_rows.extend((operation + "_" + item[0],) + item[1:] for item in publisher)
    rows = []
    for ordinal, (event_key, before, after, effects) in enumerate(raw_rows):
        rows.append({"event_key": event_key, "from": before, "next": after, "ordinal": "tr%05d" % ordinal, "effects": effects})
    assert len(rows) == 13027
    assert rows[0]["ordinal"] == "tr00000" and rows[-1]["ordinal"] == "tr13026"
    assert all(list(row) == ["event_key", "from", "next", "ordinal", "effects"] for row in rows)
    assert all(len(row["from"]) == 11 and len(row["next"]) == 11 for row in rows)
    return {
        "artifact_contracts": artifact_contracts(),
        "artifact_order": [item["artifact_id"] for item in ARTIFACTS],
        "artifacts": ARTIFACTS,
        "authority": False,
        "dispatch_composition_seam": {
            "accounting_f1_fixed": True,
            "dispatch_open_no_intent": "DISPATCH_ALLOWED",
            "matching_f1_f1": "RESUME_ALLOWED",
            "quiesced_no_intent": "ADMIT_ALLOWED",
            "seal_intent_present": "DISPATCH_DENIED",
            "seal_state_present": "REOPEN_ALLOWED_READ_ONLY",
        },
        "execution_authority": False,
        "lineage_metadata": {
            "runtime_dependencies": [],
            "nonsemantic_failure_receipts": [
                {"bytes": 7431, "path": "r9_goal_operating_contract_v2_failure_receipt_v1.json", "sha256": "52a24fe5f1c3908242e4bd54170a08b664395413f86a07878567772c22de2a71"},
                {"bytes": 8133, "path": "r9_goal_operating_contract_v3_failure_receipt_v1.json", "sha256": "a335aadd04638fab4c56d7dd86b23e7d88a1dd5c06e55c62d8946a32bb7dbbe0"},
                {"bytes": 7221, "path": "r9_goal_operating_contract_v4_failure_receipt_v1.json", "sha256": "407ee3f5c4be019d2dbd7584d52b5bd8f0eb0777a56864fda015e743f23af1b8"},
                {"bytes": 6908, "path": "r9_candidate_v8_seal_fsm_v1_failure_receipt_v1.json", "sha256": "27001a54fcd1c7a21ad71ddbbd0aa2175d5c821564cbe5e7417aa30a1c8ea3ef"},
            ],
        },
        "operation_contracts": {
            "ADMIT": {"allowed_artifacts": ["a00", "a01"], "required_prefix": ["AA", "AA"], "stop_after": "a01"},
            "REOPEN": {"allowed_artifacts": [], "lock_effects": ["LOCK_SH", "LOCK_NB"], "read_only": True},
            "RESUME": {"allowed_artifacts": ["a%02d" % index for index in range(2, 11)], "required_prefix": ["F1", "F1"], "write_without_prefix": False},
        },
        "publisher_contract": {
            "final_overwrite": False, "fallback": False, "final_mode": "0444",
            "micro_steps": list(PUBLISH_STEPS), "stage_create": ["O_CREAT", "O_EXCL"],
        },
        "row_count": len(rows),
        "row_sections": section_counts,
        "rows": rows,
        "schema_id": SCHEMA_ID,
        "state_key": list(STATE_KEY),
    }
