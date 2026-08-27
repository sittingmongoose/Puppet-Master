#!/usr/bin/env python3
import hashlib
import json
import os
import re
import stat
import sys


BASE = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1"
INPUT_DIR = BASE + "/codex_native_goal_tool_event_atomic_matrix_pair_007_008_inputs_v1"
PUBLIC_DIR = BASE + "/codex_native_goal_direct_canary_002_public_plan_v1"
EXPECTED_MANIFEST = INPUT_DIR + "/manifest.json"
MATRIX_IDS = [
    "codex-native-goal-tool-event-matrix-007",
    "codex-native-goal-tool-event-matrix-008",
]
ROSTER = [
    ("slot-alpha", "a", "gpt-5.4-mini", "xhigh"),
    ("slot-bravo", "b", "gpt-5.4-mini", "medium"),
    ("slot-charlie", "c", "gpt-5.6-luna", "medium"),
]
BOUND = {
    "churn_audit": ("r9_codex_native_goal_churn_audit_20260823t214410z_v1.json", 3674, "021ca6db9cc17e46d3d5d5acb3512dd4993e07a277a0eb9d98d8bbc6720d1f45"),
    "matrix_005_failure_adjudication": ("r9_codex_native_goal_bite_matrix_005_failure_adjudication_v1.json", 3124, "31f4e66fc46e8191bd478c88b8c230d0b7fb149aa1a7c34080fb440fed9b0375"),
    "matrix_005_runtime_failure": ("r9_codex_native_goal_bite_matrix_005_runtime_failure_receipt_v1.json", 3571, "1bfea5d4070405efa5d3f17d75fa9f28da7bd83274f831efb2e4260c0a46d634"),
    "public_capacity": ("codex_native_goal_direct_canary_002_public_plan_v1/capacity.json", 1161, "c99d01a1db38f2791e10cf796f0edf34ae74e9629681bc355e7c3ada70448cc6"),
    "public_plan_manifest": ("codex_native_goal_direct_canary_002_public_plan_v1/manifest.json", 98424, "d840adca04316ef54aa220b44a1778638616e53275d4723e5f923520bbe18606"),
    "q14_admission": ("r9_codex_native_goal_tool_event_microcase_q14_admission_v1.json", 4368, "8c4dbe960a30686400c546cc7d05d936690e9a889ea6a618febd939994cd55ed"),
    "q14_independent_validation": ("r9_codex_native_goal_tool_event_microcase_q14_independent_mechanical_validation_v1.json", 2262, "ebd5b29edafd1237debd307c4fcf68e221282f608e81e42f7fad0421ef716681"),
    "q14_runtime_success": ("r9_codex_native_goal_tool_event_microcase_q14_runtime_success_receipt_v1.json", 2797, "029ca283f93ba028de032e9476ab16e14bf1563f42ced47fe03af76fcd61f6d3"),
    "scorer_manifest": ("codex_native_goal_direct_canary_002_scorer_plan_v1/manifest.json", 26213, "4b3f50be0907974de9f58e1d95571260926b7701cf750dca19fffa5c813d09d8"),
}


class Invalid(Exception):
    pass


CHECKS = 0


def require(condition, mismatch):
    global CHECKS
    CHECKS += 1
    if not condition:
        raise Invalid(mismatch)


def _constant(value):
    raise Invalid("nonfinite-json:" + value)


def _pairs(items):
    result = {}
    for key, value in items:
        if key in result:
            raise Invalid("duplicate-key:" + key)
        result[key] = value
    return result


def parse(raw, label):
    try:
        value = json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs, parse_constant=_constant)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise Invalid(label + ":json:" + str(exc)) from exc
    require(isinstance(value, dict), label + ":root-object")
    return value


def canon(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def _meta(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def read_bound(path, expected_mode=None, expected_bytes=None, expected_sha=None, cap=2_000_000):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and before.st_uid == os.getuid() and before.st_nlink == 1, "custody:" + path)
    if expected_mode is not None:
        require(stat.S_IMODE(before.st_mode) == expected_mode, "mode:" + path)
    if expected_bytes is not None:
        require(before.st_size == expected_bytes, "bytes:" + path)
    require(before.st_size <= cap, "cap:" + path)
    flags = os.O_RDONLY | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        require(_meta(os.fstat(fd)) == _meta(before), "open-race:" + path)
        chunks = []
        remaining = before.st_size
        while remaining:
            chunk = os.read(fd, min(remaining, 1 << 20))
            require(bool(chunk), "short-read:" + path)
            chunks.append(chunk)
            remaining -= len(chunk)
        require(os.read(fd, 1) == b"", "trailing-read:" + path)
    finally:
        os.close(fd)
    raw = b"".join(chunks)
    require(_meta(os.lstat(path)) == _meta(before), "read-drift:" + path)
    if expected_sha is not None:
        require(sha(raw) == expected_sha, "sha256:" + path)
    return raw


def blob(value, label, maximum):
    require(isinstance(value, dict) and set(value) == {"bytes", "sha256", "utf8"}, label + ":shape")
    raw = value["utf8"].encode("utf-8")
    require(value["bytes"] == len(raw) and value["sha256"] == sha(raw), label + ":identity")
    require(len(raw) <= maximum, label + ":limit")
    return raw


def execution_record(matrix_id, route_row, wave):
    prefix = "pw-r9-tool-event-execution-v1"
    preimage = "\0".join([
        prefix,
        matrix_id,
        route_row["source_cell_file_sha256"],
        route_row["atom_id"],
        route_row["source_node_sha256"],
        str(wave),
    ]).encode("utf-8")
    execution_nonce = sha(preimage)
    attempt_id = sha(b"pw-r9-tool-event-attempt-v1\0" + execution_nonce.encode("ascii"))[:24]
    objective = "R9 atom;run={};w={:04d};r={};x={};no-retry.".format(matrix_id, wave, route_row["route_code"], execution_nonce)
    return {
        "atom_id": route_row["atom_id"],
        "attempt": 0,
        "attempt_id": attempt_id,
        "cell": route_row["cell"],
        "cell_index": route_row["cell_index"],
        "execution_nonce": execution_nonce,
        "goal_objective": objective,
        "goal_objective_sha256": sha(objective.encode("utf-8")),
        "matrix_id": matrix_id,
        "model_requested": route_row["model_requested"],
        "reasoning_effort_requested": route_row["reasoning_effort_requested"],
        "route": route_row["route"],
        "source_cell_file_sha256": route_row["source_cell_file_sha256"],
        "source_node_sha256": route_row["source_node_sha256"],
        "source_path": route_row["source_path"],
        "task_name": "r9_cg_" + execution_nonce,
        "wave_index": wave,
    }


def validate_node(node, index, cell, source_path, seen, kind_counts):
    label = source_path + ":node:" + str(index)
    common = {
        "acceptance_criterion", "atom_id", "atom_path", "attempt", "attempt_id", "dependencies",
        "dynamic", "goal_objective", "kind", "output_contract", "result_max_bytes",
        "result_validation", "route_code", "schema_id",
    }
    require(common <= set(node), label + ":common-fields")
    require(node["schema_id"] == "pw-r9-codex-native-goal-atomic-node-v1", label + ":schema")
    require(node["atom_id"] == "n{:05d}".format(index), label + ":atom-id")
    require(node["attempt"] == 0 and re.fullmatch(r"[0-9a-f]{24}", node["attempt_id"]) is not None, label + ":attempt")
    require(node["route_code"] == cell["route_code"], label + ":route-code")
    require(isinstance(node["dependencies"], list) and len(node["dependencies"]) == len(set(node["dependencies"])), label + ":dependencies")
    for dependency in node["dependencies"]:
        require(dependency in seen, label + ":dependency-not-earlier:" + str(dependency))
    blob(node["goal_objective"], label + ":goal-objective", 256)
    blob(node["acceptance_criterion"], label + ":criterion", 256)
    blob(node["output_contract"], label + ":output", 128)
    require(isinstance(node["result_max_bytes"], int) and 1 <= node["result_max_bytes"] <= 128, label + ":result-max")
    require(isinstance(node["kind"], str), label + ":kind")
    kind_counts[node["kind"]] = kind_counts.get(node["kind"], 0) + 1
    if node["dynamic"]:
        require(bool(node["dependencies"]), label + ":dynamic-dependencies")
        require("subject_template" in node and "wire_message_max_bytes" in node, label + ":dynamic-shape")
        template = node["subject_template"]
        require(isinstance(template, dict) and isinstance(template.get("canonical_json_template"), dict), label + ":template")
        require(isinstance(template.get("max_payload_bytes"), int) and template["max_payload_bytes"] <= 170, label + ":template-payload")
        require(node["wire_message_max_bytes"].get("subject_atom", 491) <= 490, label + ":template-wire")
        require("subject_atom" not in node and "subject_payload" not in node, label + ":dynamic-not-materialized")
    else:
        require(not node["dependencies"], label + ":static-dependencies")
        require({"atom_nonce", "control_bind", "spawn_bootstrap", "subject_atom", "subject_payload", "task_name"} <= set(node), label + ":static-shape")
        payload_raw = blob(node["subject_payload"], label + ":payload", 170)
        atom_raw = blob(node["subject_atom"], label + ":subject-atom", 490)
        atom = parse(atom_raw, label + ":subject-atom-json")
        require(set(atom) == {"a", "i", "k", "n", "p", "ph", "v"}, label + ":subject-atom-fields")
        require(atom["a"] == node["attempt_id"] and atom["i"] == node["atom_id"] and atom["k"] == "subject" and atom["v"] == 1, label + ":subject-atom-bind")
        require(atom["p"].encode("utf-8") == payload_raw and atom["ph"] == sha(payload_raw), label + ":payload-bind")
        require(re.fullmatch(r"[0-9a-f]{64}", node["atom_nonce"]) is not None, label + ":source-nonce")
    seen.add(node["atom_id"])
    return sha(canon(node))


def validate_source(manifest):
    public_raw = read_bound(BASE + "/" + BOUND["public_plan_manifest"][0], 0o644, BOUND["public_plan_manifest"][1], BOUND["public_plan_manifest"][2])
    capacity_raw = read_bound(BASE + "/" + BOUND["public_capacity"][0], 0o644, BOUND["public_capacity"][1], BOUND["public_capacity"][2])
    scorer_raw = read_bound(BASE + "/" + BOUND["scorer_manifest"][0], 0o644, BOUND["scorer_manifest"][1], BOUND["scorer_manifest"][2])
    public = parse(public_raw, "public-manifest")
    capacity = parse(capacity_raw, "capacity")
    scorer = parse(scorer_raw, "scorer")
    require(public["schema_id"] == "pw-r9-codex-native-goal-atomic-public-manifest-v1", "public-schema")
    require(public["matrix_id"] == "codex-native-goal-direct-canary-002", "public-matrix")
    require(public["status"] == "COMPILED_STATIC_PUBLIC_ATOM_DAGS_ZERO_CREDIT_NO_EMPIRICAL_AUTHORITY", "public-status")
    require(public["qualification_credit"] == 0 and not any(public["authority"].values()), "public-authority")
    require(public["public_scorer_separation"] == "PUBLIC_ROOT_CONTAINS_NO_EXPECTED_VALUE_FIELDS_OR_SCORER_PATH", "public-scorer-separation")
    require(capacity["schema_id"] == "pw-r9-codex-native-goal-atomic-capacity-report-v1", "capacity-schema")
    require(capacity["exact_atom_count"] == 15612 and capacity["test_taker_goal_count"] == 15612, "capacity-atoms")
    require(capacity["semantic_cell_count"] == 97 and capacity["semantic_cell_route_outcome_count"] == 291, "capacity-cells")
    require(capacity["route_atom_counts"] == {route: 5204 for route, _, _, _ in ROSTER}, "capacity-routes")
    require(capacity["subject_atoms_per_goal"] == 1 and capacity["max_concurrent_test_takers"] == 3, "capacity-goal-unit")
    require(capacity["max_compiled_static_message_bytes"] <= 490 and capacity["max_subject_payload_bytes"] <= 170, "capacity-bite-size")
    expected_roster = [{"model_requested": model, "reasoning_effort_requested": effort, "route": route} for route, _, model, effort in ROSTER]
    require(public["route_roster"] == expected_roster, "public-roster")
    require(isinstance(public["cells"], list) and len(public["cells"]) == 291, "public-cell-count")
    route_rows = {route: [] for route, _, _, _ in ROSTER}
    kind_counts = {}
    cell_route_shapes = {}
    expected_entry_keys = {"atom_count", "cell", "cell_file", "cell_index", "compiler_family", "model_requested", "reasoning_effort_requested", "route"}
    expected_cell_keys = {"assembly_recipe", "cell", "cell_index", "compiler_family", "context_coverage", "context_identity", "control_manifest_projection_bytes", "control_manifest_sha256", "dependency_gate", "final_node_ids", "matrix_id", "model_requested", "nodes", "reasoning_effort_requested", "root_signal_node_id", "route", "route_code", "schema_id", "source_shape"}
    cell_paths = set()
    for entry in public["cells"]:
        require(set(entry) == expected_entry_keys, "public-cell-entry-fields")
        require(entry["route"] in route_rows and isinstance(entry["cell_index"], int) and 0 <= entry["cell_index"] < 97, "public-cell-entry-id")
        route_info = next(item for item in ROSTER if item[0] == entry["route"])
        require((entry["model_requested"], entry["reasoning_effort_requested"]) == route_info[2:], "public-cell-route")
        file_value = entry["cell_file"]
        require(set(file_value) == {"bytes", "path", "sha256"}, "public-cell-file-shape")
        expected_path = "cells/cell-{:03d}/{}.json".format(entry["cell_index"], entry["route"])
        require(file_value["path"] == expected_path and expected_path not in cell_paths, "public-cell-path")
        cell_paths.add(expected_path)
        cell_raw = read_bound(PUBLIC_DIR + "/" + expected_path, 0o644, file_value["bytes"], file_value["sha256"], 500_000)
        require(b"expected_output" not in cell_raw, "public-cell-private-score-leak")
        cell = parse(cell_raw, "cell:" + expected_path)
        require(set(cell) == expected_cell_keys, "cell-fields:" + expected_path)
        require(cell["schema_id"] == "pw-r9-codex-native-goal-atomic-cell-dag-v1", "cell-schema:" + expected_path)
        require(cell["matrix_id"] == public["matrix_id"] and cell["cell"] == entry["cell"] and cell["cell_index"] == entry["cell_index"], "cell-identity:" + expected_path)
        require(cell["route"] == entry["route"] and cell["route_code"] == route_info[1], "cell-route:" + expected_path)
        require(cell["model_requested"] == route_info[2] and cell["reasoning_effort_requested"] == route_info[3], "cell-model:" + expected_path)
        require(isinstance(cell["nodes"], list) and len(cell["nodes"]) == entry["atom_count"] and bool(cell["nodes"]), "cell-nodes:" + expected_path)
        seen = set()
        rows = []
        for index, node in enumerate(cell["nodes"]):
            node_sha = validate_node(node, index, cell, expected_path, seen, kind_counts)
            rows.append({
                "atom_id": node["atom_id"],
                "cell": cell["cell"],
                "cell_index": cell["cell_index"],
                "model_requested": cell["model_requested"],
                "reasoning_effort_requested": cell["reasoning_effort_requested"],
                "route": cell["route"],
                "route_code": cell["route_code"],
                "source_cell_file_sha256": file_value["sha256"],
                "source_node_sha256": node_sha,
                "source_path": expected_path + "#/nodes/" + str(index),
            })
        root_signals = cell["root_signal_node_id"]
        if isinstance(root_signals, str):
            root_signal_ids = {root_signals}
        else:
            require(isinstance(root_signals, dict) and all(isinstance(key, str) and isinstance(value, str) for key, value in root_signals.items()), "cell-root-signal-shape:" + expected_path)
            root_signal_ids = set(root_signals.values())
        require(set(cell["final_node_ids"]) <= seen and root_signal_ids <= seen, "cell-terminals:" + expected_path)
        route_rows[entry["route"]].append((entry["cell_index"], rows))
        cell_route_shapes.setdefault(entry["cell_index"], []).append((entry["route"], entry["cell"], entry["compiler_family"], len(rows)))
    require(len(cell_paths) == 291, "public-cell-path-count")
    flattened = {}
    for route, _, _, _ in ROSTER:
        ordered = sorted(route_rows[route], key=lambda item: item[0])
        require([item[0] for item in ordered] == list(range(97)), "route-cell-order:" + route)
        flattened[route] = [row for _, rows in ordered for row in rows]
        require(len(flattened[route]) == 5204, "route-atom-count:" + route)
    for cell_index, values in cell_route_shapes.items():
        require(len(values) == 3, "cell-route-cardinality:" + str(cell_index))
        require(len({(cell, family, count) for _, cell, family, count in values}) == 1, "cell-route-shape:" + str(cell_index))
    require(kind_counts == capacity["atom_kind_counts"], "atom-kind-counts")
    require(sum(kind_counts.values()) == 15612, "atom-kind-total")
    require(scorer["schema_id"] == "pw-r9-codex-native-goal-atomic-scorer-v1", "scorer-schema")
    require(scorer["matrix_id"] == public["matrix_id"] and scorer["qualification_credit"] == 0, "scorer-identity")
    require(scorer["cell_count"] == 97 and scorer["route_outcome_count"] == 291, "scorer-counts")
    require(scorer["comparator"] == manifest["scoring"]["comparator"], "scorer-comparator")
    require(isinstance(scorer["cells"], list) and len(scorer["cells"]) == 97, "scorer-cells")
    for index, scored in enumerate(scorer["cells"]):
        require(scored["cell_index"] == index and set(scored) == {"cell", "cell_index", "expected_output_bytes", "expected_output_sha256", "expected_output_utf8"}, "scorer-cell-shape")
        expected_raw = scored["expected_output_utf8"].encode("utf-8")
        require(len(expected_raw) == scored["expected_output_bytes"] and sha(expected_raw) == scored["expected_output_sha256"], "scorer-cell-identity")
    return flattened


def validate_manifest(manifest_raw, mode):
    manifest = parse(manifest_raw, "manifest")
    require(manifest_raw == canon(manifest) + b"\n", "manifest-canonical")
    require(set(manifest) == {"architecture", "authority", "bindings", "execution_identity", "failure_contract", "limits", "matrices", "preservation", "qualification", "roster", "schedule", "schema_id", "scoring", "source_corpus", "status"}, "manifest-fields")
    require(manifest["schema_id"] == "pw-r9-codex-native-goal-tool-event-atomic-matrix-pair-inputs-v1", "manifest-schema")
    require(manifest["authority"] == {"canary_launch": False, "matrix_007_launch": False, "matrix_008_launch": False, "mechanical_manifest_validation": True, "qualification": False, "qualification_credit": 0, "release": False}, "manifest-authority")
    require(set(manifest["bindings"]) == set(BOUND), "manifest-binding-names")
    for name, (path, size, digest) in BOUND.items():
        require(manifest["bindings"][name] == {"bytes": size, "mode": "0644", "path": path, "sha256": digest}, "manifest-binding:" + name)
        read_bound(BASE + "/" + path, 0o644, size, digest)
    require(manifest["architecture"]["subject_atoms_per_goal"] == 1 and manifest["architecture"]["chunks_per_task"] == 0, "manifest-atomic")
    require(manifest["architecture"]["function_call_order"] == ["create_goal", "exec_command:show", "exec_command:record", "update_goal"], "manifest-call-order")
    require(manifest["architecture"]["parent_followups"] == 0 and manifest["architecture"]["turns_per_task"] == 1, "manifest-one-turn")
    require(manifest["failure_contract"] == {"any_task_mismatch": "CONSUME_CURRENT_MATRIX_ZERO_CREDIT_STOP_WITHOUT_RETRY", "best_of": False, "matrix_008_after_matrix_007_failure": "REMAINS_FROZEN", "relaunch": False, "replacement": False, "resend": False, "retry": False, "reuse": False}, "manifest-failure-contract")
    require(manifest["limits"] == {"acceptance_criterion_max_utf8_bytes": 256, "case_body_max_utf8_bytes": 490, "goal_objective_max_utf8_bytes": 256, "initial_routing_message_max_utf8_bytes": 512, "max_concurrent_test_takers": 3, "output_contract_max_utf8_bytes": 128, "subject_payload_max_utf8_bytes": 170}, "manifest-limits")
    expected_roster = [{"model_requested": model, "reasoning_effort_requested": effort, "route": route, "route_code": code} for route, code, model, effort in ROSTER]
    require(manifest["roster"] == expected_roster, "manifest-roster")
    require([item["matrix_id"] for item in manifest["matrices"]] == MATRIX_IDS, "manifest-matrix-ids")
    require(all(item["subject_task_count"] == 15612 and item["wave_count"] == 5204 for item in manifest["matrices"]), "manifest-matrix-counts")
    require(manifest["matrices"][0]["launch_state"] == "PENDING_RUNTIME_IMPLEMENTATION_AND_INDEPENDENT_ADMISSION", "manifest-007-state")
    require(manifest["matrices"][1]["launch_state"] == "FROZEN_UNTIL_MATRIX_007_IS_INDEPENDENTLY_VERIFIED_CLEAN", "manifest-008-state")
    require(manifest["qualification"]["credit"] == "0/2" and manifest["qualification"]["clean_full_matrix_streak"] == 0 and not manifest["qualification"]["increment"], "manifest-qualification")
    require(manifest["qualification"]["required_consecutive_clean_full_matrices"] == 2 and manifest["qualification"]["matrix_order"] == MATRIX_IDS, "manifest-qualification-order")
    require(manifest["source_corpus"] == {"atom_count": 15612, "cell_route_count": 291, "public_plan_matrix_id": "codex-native-goal-direct-canary-002", "route_atom_counts": {route: 5204 for route, _, _, _ in ROSTER}, "semantic_cell_count": 97}, "manifest-source-counts")
    require(manifest["schedule"]["route_order"] == [route for route, _, _, _ in ROSTER] and manifest["schedule"]["route_local_atom_count"] == 5204, "manifest-schedule")
    require(manifest["scoring"] == {"comparator": "EXACT_UTF8_AND_SHA256_AFTER_PUBLIC_RECIPE_ASSEMBLY", "expected_output_source": "BOUND_PRIVATE_SCORER_MANIFEST_REOPENED_ONLY_BY_OFFLINE_SCORER_AFTER_ALL_SUBJECT_TASKS_TERMINAL", "route_outcome_count_per_matrix": 291, "subject_access_to_scorer": False}, "manifest-scoring")
    require(manifest["preservation"]["matrix_005"] == "PERMANENTLY_FAILED_ZERO_CREDIT_NO_RETRY_OR_SALVAGE", "manifest-preserve-005")
    require(manifest["preservation"]["omp_artifacts"] == "FROZEN_SEPARATE_OWNER_DIAGNOSTIC_COMPARATOR_ONLY_NO_READ_EXECUTION_OR_DEPENDENCY", "manifest-preserve-omp")
    flattened = validate_source(manifest)
    projection = hashlib.sha256()
    projection_bytes = 0
    projection_records = 0
    nonces = set()
    attempts = set()
    tasks = set()
    objectives = set()
    for matrix_id in MATRIX_IDS:
        for wave in range(5204):
            for route, _, _, _ in ROSTER:
                record = execution_record(matrix_id, flattened[route][wave], wave)
                require(len(record["goal_objective"].encode("utf-8")) <= 256, "derived-objective-limit")
                require(re.fullmatch(r"r9_cg_[0-9a-f]{64}", record["task_name"]) is not None, "derived-task-name")
                require(record["execution_nonce"] not in nonces, "execution-nonce-collision")
                require(record["attempt_id"] not in attempts, "attempt-id-collision")
                require(record["task_name"] not in tasks, "task-name-collision")
                require(record["goal_objective"] not in objectives, "goal-objective-collision")
                nonces.add(record["execution_nonce"])
                attempts.add(record["attempt_id"])
                tasks.add(record["task_name"])
                objectives.add(record["goal_objective"])
                raw = canon(record) + b"\n"
                projection.update(raw)
                projection_bytes += len(raw)
                projection_records += 1
    require(projection_records == 31224 and len(nonces) == len(attempts) == len(tasks) == len(objectives) == 31224, "derived-projection-count")
    derived = {"bytes": projection_bytes, "record_count": projection_records, "sha256": projection.hexdigest()}
    declared = manifest["execution_identity"]["schedule_projection"]
    if mode == "--derive":
        require(declared == {"bytes": 0, "record_count": 31224, "sha256": "PENDING_FINAL_MECHANICAL_DERIVATION"}, "derive-placeholder")
        require(manifest["status"] == "PREDECLARED_TOOL_EVENT_ONLY_ATOMIC_MATRIX_PAIR_PENDING_FINAL_MECHANICAL_DERIVATION_NO_LAUNCH_ZERO_CREDIT", "derive-status")
    else:
        require(declared == derived, "schedule-projection-binding")
        require(manifest["status"] == "PASS_MECHANICAL_PREDECLARATION_PENDING_RUNTIME_IMPLEMENTATION_AND_INDEPENDENT_ADMISSION_NO_LAUNCH_ZERO_CREDIT", "check-status")
    return derived


def main():
    global CHECKS
    try:
        require(len(sys.argv) == 4 and sys.argv[1] == "--manifest" and os.path.isabs(sys.argv[2]) and sys.argv[2] == EXPECTED_MANIFEST and sys.argv[3] in {"--derive", "--check"}, "cli")
        mode = sys.argv[3]
        raw = read_bound(sys.argv[2], 0o644, cap=100_000)
        derived = validate_manifest(raw, mode)
        output = {
            "assertion_count": CHECKS,
            "first_mismatch": None,
            "mode": mode[2:].upper(),
            "schedule_projection": derived,
            "schema_id": "pw-r9-codex-native-goal-tool-event-atomic-matrix-pair-manifest-check-v1",
            "status": "PASS",
            "subject_calls": 0,
            "workspace_writes": 0,
        }
        sys.stdout.buffer.write(canon(output) + b"\n")
        return 0
    except (Invalid, OSError, KeyError, TypeError, ValueError) as exc:
        output = {
            "assertion_count": CHECKS,
            "first_mismatch": str(exc),
            "mode": sys.argv[-1][2:].upper() if len(sys.argv) else "UNKNOWN",
            "schema_id": "pw-r9-codex-native-goal-tool-event-atomic-matrix-pair-manifest-check-v1",
            "status": "FAIL",
            "subject_calls": 0,
            "workspace_writes": 0,
        }
        sys.stdout.buffer.write(canon(output) + b"\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
