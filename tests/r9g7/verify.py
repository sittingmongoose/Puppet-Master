#!/usr/bin/env python3
import fcntl
import hashlib
import json
import os
import re
import stat
import sys


BASE = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1"
PUBLIC_DIR = BASE + "/codex_native_goal_direct_canary_002_public_plan_v1"
PUBLIC_MANIFEST = PUBLIC_DIR + "/manifest.json"
PUBLIC_MANIFEST_BYTES = 98424
PUBLIC_MANIFEST_SHA256 = "d840adca04316ef54aa220b44a1778638616e53275d4723e5f923520bbe18606"
PAIR_MANIFEST = BASE + "/codex_native_goal_tool_event_atomic_matrix_pair_007_008_inputs_v1/manifest.json"
PAIR_MANIFEST_BYTES = 7445
PAIR_MANIFEST_SHA256 = "41dac10192008071d79ef22163609901deee18814d065a5a1ddda38f9b3a1a22"
SCORER = BASE + "/codex_native_goal_direct_canary_002_scorer_plan_v1/manifest.json"
SCORER_BYTES = 26213
SCORER_SHA256 = "4b3f50be0907974de9f58e1d95571260926b7701cf750dca19fffa5c813d09d8"
SEMANTIC = BASE + "/formal_candidate_v7/semantic_bundle.json"
SEMANTIC_BYTES = 786546
SEMANTIC_SHA256 = "11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2"
CAPSULE = "/mnt/Cursor/PuppetMaster/tests/r9g7/capsule.py"
CAPSULE_BYTES = 11608
CAPSULE_SHA256 = "46b84494ba7e5744cae2604ab69f1839f837662fe168f76c1234112dcf5a5ea7"
MATERIALIZER = "/mnt/Cursor/PuppetMaster/tests/r9g7/materialize.py"
MATERIALIZER_BYTES = 47629
MATERIALIZER_SHA256 = "6ee4c9fa61938dca4449b2cdd6528c953ab8d0255b81b1944e72cc53189c36af"
VERIFIER = "/mnt/Cursor/PuppetMaster/tests/r9g7/verify.py"
RUNS = BASE + "/codex_native_goal_tool_event_atomic_matrix_runs_v1"
MATRIX_007_GATE = BASE + "/r9_codex_native_goal_tool_event_atomic_matrix_007_independent_verification_v1.json"
SESSION_ROOT = "/home/sittingmongoose/.codex/sessions"
PARENT_THREAD_ID = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
MATRICES = {
    "007": "codex-native-goal-tool-event-matrix-007",
    "008": "codex-native-goal-tool-event-matrix-008",
}
ROSTER = [
    ("slot-alpha", "a", "gpt-5.4-mini", "xhigh"),
    ("slot-bravo", "b", "gpt-5.4-mini", "medium"),
    ("slot-charlie", "c", "gpt-5.6-luna", "medium"),
]
RUN_FIELDS = {
    "capsule", "manifest", "materializer", "matrix_code", "matrix_id",
    "parent_thread_id", "qualification_credit", "schedule",
    "schedule_offsets", "schema_id", "status", "wave_count",
}
ADMISSION_FIELDS = {
    "attempt", "attempt_id", "case", "execution_nonce", "goal_objective",
    "initial_routing", "manifest", "matrix_code", "matrix_id",
    "model_requested", "reasoning_effort_requested", "result_contract",
    "route", "route_code", "schema_id", "source", "task_name", "wave_index",
}
GOAL_RECEIPT_FIELDS = {
    "function_call_order", "goal", "goal_thread_id", "matrix_id", "model",
    "qualification_credit", "reasoning_effort", "result", "route",
    "schema_id", "status", "task_path", "trace", "turn_count", "wave_index",
}


class Invalid(Exception):
    pass


def require(condition, mismatch):
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


def parse(raw):
    return json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs, parse_constant=_constant)


def canon(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def ordered(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":")).encode("utf-8")


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def _meta(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def read_bound(path, mode, cap, expected_bytes=None, expected_sha=None):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == mode, "read-custody:" + path)
    require(before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size <= cap, "read-identity:" + path)
    if expected_bytes is not None:
        require(before.st_size == expected_bytes, "read-bytes:" + path)
    flags = os.O_RDONLY | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        require(_meta(os.fstat(fd)) == _meta(before), "read-open-race:" + path)
        raw = b""
        while len(raw) < before.st_size:
            chunk = os.read(fd, before.st_size - len(raw))
            require(bool(chunk), "read-short:" + path)
            raw += chunk
        require(os.read(fd, 1) == b"", "read-trailing:" + path)
    finally:
        os.close(fd)
    require(_meta(os.lstat(path)) == _meta(before), "read-drift:" + path)
    if expected_sha is not None:
        require(sha(raw) == expected_sha, "read-sha256:" + path)
    return raw


def require_directory(path, mode=0o700):
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and stat.S_IMODE(info.st_mode) == mode and info.st_uid == os.getuid(), "directory:" + path)


def public_sources():
    pair_raw = read_bound(PAIR_MANIFEST, 0o644, PAIR_MANIFEST_BYTES, PAIR_MANIFEST_BYTES, PAIR_MANIFEST_SHA256)
    pair = parse(pair_raw)
    require(pair_raw == canon(pair) + b"\n" and pair["schema_id"] == "pw-r9-codex-native-goal-tool-event-atomic-matrix-pair-inputs-v1", "pair")
    public_raw = read_bound(PUBLIC_MANIFEST, 0o644, PUBLIC_MANIFEST_BYTES, PUBLIC_MANIFEST_BYTES, PUBLIC_MANIFEST_SHA256)
    public = parse(public_raw)
    require(public["schema_id"] == "pw-r9-codex-native-goal-atomic-public-manifest-v1" and len(public["cells"]) == 291, "public")
    read_bound(CAPSULE, 0o644, CAPSULE_BYTES, CAPSULE_BYTES, CAPSULE_SHA256)
    read_bound(MATERIALIZER, 0o644, MATERIALIZER_BYTES, MATERIALIZER_BYTES, MATERIALIZER_SHA256)
    return pair, public


def verifier_identity():
    raw = read_bound(VERIFIER, 0o644, 100_000)
    return {"bytes": len(raw), "path": VERIFIER, "sha256": sha(raw)}


def matrix_008_gate():
    raw = read_bound(MATRIX_007_GATE, 0o644, 32_000)
    gate = parse(raw)
    require(raw == canon(gate) + b"\n" and set(gate) == {
        "clean_full_matrix_streak", "components", "matrix_007", "matrix_008_launch_authority",
        "offline_verification", "qualification_credit", "reviewer", "schema_id", "status",
    }, "matrix-008-gate-shape")
    require(gate["schema_id"] == "pw-r9-codex-native-goal-tool-event-atomic-matrix-007-independent-verification-v1", "matrix-008-gate-schema")
    require(gate["status"] == "PASS_INDEPENDENT_MATRIX_007_CLEAN_AUTHORIZE_EXACT_MATRIX_008" and gate["matrix_008_launch_authority"] is True, "matrix-008-gate-status")
    require(gate["clean_full_matrix_streak"] == 1 and gate["qualification_credit"] == "1/2", "matrix-008-gate-credit")
    require(gate["components"] == {
        "capsule": {"bytes": CAPSULE_BYTES, "path": CAPSULE, "sha256": CAPSULE_SHA256},
        "materializer": {"bytes": MATERIALIZER_BYTES, "path": MATERIALIZER, "sha256": MATERIALIZER_SHA256},
        "verifier": verifier_identity(),
    }, "matrix-008-gate-components")
    report = gate["offline_verification"]
    require(isinstance(report, dict) and set(report) == {
        "clean_full_matrix", "external_adjudication_required", "fresh_goal_threads",
        "fresh_task_paths", "fresh_trace_hashes", "matrix_code", "matrix_id",
        "nonclaims", "qualification_credit", "route_outcomes_exact_pass",
        "schema_id", "status", "subject_task_count", "wave_count",
    }, "matrix-008-gate-report-shape")
    require(report["matrix_code"] == "007" and report["matrix_id"] == MATRICES["007"] and report["clean_full_matrix"] is True, "matrix-008-gate-report")
    require(report["status"] == "PASS_CLEAN_FULL_MATRIX_ZERO_CREDIT_PENDING_INDEPENDENT_ADJUDICATION" and report["qualification_credit"] == 0 and report["subject_task_count"] == 15612 and report["fresh_goal_threads"] == 15612 and report["route_outcomes_exact_pass"] == 291, "matrix-008-gate-report-status")
    reviewer = gate["reviewer"]
    require(isinstance(reviewer, dict) and set(reviewer) == {"goal_status", "goal_thread_id", "task_path", "time_used_seconds", "tokens_used"}, "matrix-008-gate-reviewer")
    require(reviewer["goal_status"] == "complete" and re.fullmatch(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", reviewer["goal_thread_id"]) is not None and re.fullmatch(r"/root/[a-z0-9_]+", reviewer["task_path"]) is not None, "matrix-008-gate-reviewer-id")
    require(isinstance(reviewer["tokens_used"], int) and reviewer["tokens_used"] > 0 and isinstance(reviewer["time_used_seconds"], int) and reviewer["time_used_seconds"] >= 0, "matrix-008-gate-reviewer-usage")
    matrix = gate["matrix_007"]
    require(isinstance(matrix, dict) and set(matrix) == {"accounting", "matrix_id", "terminal"} and matrix["matrix_id"] == MATRICES["007"], "matrix-008-gate-matrix")
    root = RUNS + "/" + MATRICES["007"]
    for name, key in (("matrix_accounting.json", "accounting"), ("matrix_terminal.json", "terminal")):
        value = matrix[key]
        path = root + "/" + name
        require(value.get("path") == path, "matrix-008-gate-path")
        read_bound(path, 0o444, 32_000, value["bytes"], value["sha256"])
    return gate


def private_scorer():
    raw = read_bound(SCORER, 0o644, SCORER_BYTES, SCORER_BYTES, SCORER_SHA256)
    value = parse(raw)
    require(raw == canon(value) + b"\n" and value["schema_id"] == "pw-r9-codex-native-goal-atomic-scorer-v1", "scorer")
    require(value["cell_count"] == 97 and value["route_outcome_count"] == 291 and value["qualification_credit"] == 0, "scorer-count")
    require(value["semantic_bundle"] == {"bytes": SEMANTIC_BYTES, "sha256": SEMANTIC_SHA256}, "scorer-semantic")
    read_bound(SEMANTIC, 0o644, SEMANTIC_BYTES, SEMANTIC_BYTES, SEMANTIC_SHA256)
    return value


def execution_fields(matrix_id, wave, route_code, cell_sha, atom_id, node_sha):
    preimage = "\0".join([
        "pw-r9-tool-event-execution-v1", matrix_id, cell_sha, atom_id, node_sha, str(wave)
    ]).encode("utf-8")
    nonce = sha(preimage)
    attempt_id = sha(b"pw-r9-tool-event-attempt-v1\0" + nonce.encode("ascii"))[:24]
    objective = "R9 atom;run={};w={:04d};r={};x={};no-retry.".format(matrix_id, wave, route_code, nonce)
    task_name = "r9_cg_" + nonce
    initial = (
        "Call create_goal with exact objective \"{}\". After ACTIVE, run python3 -B capsule.py show {} {:04d} {} "
        "in /mnt/Cursor/PuppetMaster/tests/r9g7 with login=false, yield_time_ms=10000, max_output_tokens=1000. "
        "Read it; run python3 -B capsule.py record {} {:04d} {} '<RESULT>' with the same controls. "
        "Call update_goal complete. Use exactly four function calls."
    ).format(objective, matrix_id[-3:], wave, route_code, matrix_id[-3:], wave, route_code)
    require(len(objective.encode("utf-8")) <= 256 and len(initial.encode("utf-8")) <= 512, "routing-limit")
    return nonce, attempt_id, objective, task_name, initial


def static_payload(node):
    payload = parse(node["subject_payload"]["utf8"].encode("utf-8"))
    require(payload.get("op") == "label" and isinstance(payload.get("x"), str), "static-payload")
    if node["kind"] == "EVIDENCE_SLICE_LABEL":
        require(set(payload) == {"op", "t", "x"} and isinstance(payload["t"], str), "evidence-payload")
    else:
        require(node["kind"] == "ENDPOINT_SLICE_LABEL", "endpoint-kind")
        require(
            (set(payload) == {"d", "k", "op", "x"} and payload["k"] == "choice")
            or (set(payload) == {"i", "k", "op", "x"} and payload["k"] in {"statement", "type"}),
            "endpoint-payload",
        )
    return payload


def build_schedule(matrix_code, public):
    require(matrix_code in MATRICES, "matrix-code")
    matrix_id = MATRICES[matrix_code]
    entries = {route: [] for route, _, _, _ in ROSTER}
    for entry in public["cells"]:
        require(entry["route"] in entries, "source-route")
        entries[entry["route"]].append(entry)
    by_route = {route: [] for route in entries}
    cells = {}
    for route, route_code, model, effort in ROSTER:
        wave = 0
        route_entries = sorted(entries[route], key=lambda item: item["cell_index"])
        require([entry["cell_index"] for entry in route_entries] == list(range(97)), "source-cell-order")
        for entry in route_entries:
            cell_file = entry["cell_file"]
            cell_raw = read_bound(PUBLIC_DIR + "/" + cell_file["path"], 0o644, 500_000, cell_file["bytes"], cell_file["sha256"])
            cell = parse(cell_raw)
            require(cell["route"] == route and cell["model_requested"] == model and cell["reasoning_effort_requested"] == effort, "source-cell-bind")
            cells[(route, cell["cell_index"])] = cell
            atom_waves = {}
            for node_index, node in enumerate(cell["nodes"]):
                require(node["atom_id"] == "n{:05d}".format(node_index), "source-atom-order")
                dependencies = []
                for dependency in node["dependencies"]:
                    require(dependency in atom_waves, "source-dependency-order")
                    dependencies.append(atom_waves[dependency])
                if not node["dynamic"]:
                    payload = static_payload(node)
                    validation = node["result_validation"]
                    require(validation["regex"] == "[A-Za-z0-9._:-]+" and isinstance(payload["x"], str), "static-result")
                node_sha = sha(canon(node))
                nonce, attempt_id, objective, task_name, initial = execution_fields(
                    matrix_id, wave, route_code, cell_file["sha256"], node["atom_id"], node_sha
                )
                record = {
                    "atom_id": node["atom_id"],
                    "attempt": 0,
                    "attempt_id": attempt_id,
                    "cell": cell["cell"],
                    "cell_index": cell["cell_index"],
                    "dependency_waves": dependencies,
                    "execution_nonce": nonce,
                    "goal_objective": objective,
                    "initial_routing": initial,
                    "matrix_id": matrix_id,
                    "model_requested": model,
                    "node_index": node_index,
                    "reasoning_effort_requested": effort,
                    "route": route,
                    "route_code": route_code,
                    "schema_id": "pw-r9-codex-native-goal-tool-event-atomic-schedule-row-v1",
                    "source_cell_file_bytes": cell_file["bytes"],
                    "source_cell_file_sha256": cell_file["sha256"],
                    "source_cell_path": cell_file["path"],
                    "source_node_sha256": node_sha,
                    "task_name": task_name,
                    "wave_index": wave,
                }
                by_route[route].append(record)
                atom_waves[node["atom_id"]] = wave
                wave += 1
        require(wave == 5204, "route-wave-count")
    records = []
    for wave in range(5204):
        for route, _, _, _ in ROSTER:
            records.append(by_route[route][wave])
    require(len(records) == 15612 and len({record["execution_nonce"] for record in records}) == 15612, "schedule-count")
    return records, cells


def schedule_bytes(records):
    lines = []
    offsets = []
    offset = 0
    for record in records:
        line = canon(record) + b"\n"
        lines.append(line)
        offsets.append([offset, len(line)])
        offset += len(line)
    raw = b"".join(lines)
    offsets_raw = canon({
        "count": len(records),
        "entries": offsets,
        "schedule_bytes": len(raw),
        "schedule_sha256": sha(raw),
        "schema_id": "pw-r9-codex-native-goal-tool-event-atomic-schedule-offsets-v1",
    }) + b"\n"
    return raw, offsets_raw


def replace_template(value, results):
    mapping = {
        "${LEFT_RESULT}": results[0] if len(results) == 2 else None,
        "${RIGHT_RESULT}": results[1] if len(results) == 2 else None,
        "${SUMMARY_RESULT}": results[0] if len(results) == 1 else None,
    }
    if isinstance(value, str) and value in mapping:
        require(mapping[value] is not None, "template-placeholder")
        return mapping[value]
    if isinstance(value, list):
        return [replace_template(item, results) for item in value]
    if isinstance(value, dict):
        return {key: replace_template(item, results) for key, item in value.items()}
    return value


def result_contract(node, cell):
    validation = node["result_validation"]
    if "regex" in validation:
        require(validation["regex"] == "[A-Za-z0-9._:-]+", "result-regex")
        if not node["dynamic"]:
            payload = static_payload(node)
            value_raw = payload["x"].encode("utf-8")
            if validation["utf8_bytes_min"] <= len(value_raw) <= validation["utf8_bytes_max"] and re.fullmatch(validation["regex"], payload["x"]) is not None and "'" not in payload["x"]:
                return {"kind": "exact_set", "max_bytes": validation["utf8_bytes_max"], "values": [payload["x"]]}
        return {"kind": "regex", "max_bytes": validation["utf8_bytes_max"], "min_bytes": validation["utf8_bytes_min"], "pattern": validation["regex"]}
    require(validation == {"closed_output_contract": True, "utf8_bytes_max": node["result_max_bytes"]}, "result-closed")
    recipe = cell["assembly_recipe"]
    if node["kind"] in {"FINAL_OPTION_SELECTOR", "FINAL_EDGE_VERDICT", "FINAL_TENSION_VERDICT"}:
        require(recipe["dynamic_node"] == node["atom_id"] and recipe["kind"] == "MODEL_FINAL_CANONICAL_ONE_FIELD_JSON", "result-recipe")
        values = [canon({recipe["output_key"]: value}).decode("utf-8") for value in recipe["allowed_values"]]
    elif node["kind"] == "FINAL_EDGE_VERDICT_PER_EDGE":
        values = ["S", "U"]
    else:
        require(node["kind"] == "FINAL_SPECIALIST_CODE", "result-kind")
        code = node["subject_template"]["canonical_json_template"]["c"]
        values = ["S:" + code, "U:" + code]
    require(all(len(value.encode("utf-8")) <= node["result_max_bytes"] and "'" not in value for value in values), "result-values")
    return {"kind": "exact_set", "max_bytes": node["result_max_bytes"], "values": values}


def expected_row(record, cell, node, matrix_code, dependency_results):
    if node["dynamic"]:
        payload_raw = canon(replace_template(node["subject_template"]["canonical_json_template"], dependency_results))
        require(len(payload_raw) <= node["subject_template"]["max_payload_bytes"] <= 170, "dynamic-payload")
    else:
        require(not dependency_results, "static-dependencies")
        payload_raw = node["subject_payload"]["utf8"].encode("utf-8")
        require(len(payload_raw) == node["subject_payload"]["bytes"] and sha(payload_raw) == node["subject_payload"]["sha256"], "static-payload-identity")
    body = canon({
        "a": record["attempt_id"],
        "i": record["atom_id"],
        "k": "subject",
        "n": record["execution_nonce"],
        "p": payload_raw.decode("utf-8"),
        "ph": sha(payload_raw),
        "v": 1,
    })
    require(len(body) <= 490, "body-limit")
    header = "CASE|v2|m={}|w={:04d}|r={}|kind={}|instruction={}|output={}|record=RESULT".format(
        matrix_code, record["wave_index"], record["route_code"], node["kind"],
        node["acceptance_criterion"]["utf8"], node["output_contract"]["utf8"],
    )
    header_raw = header.encode("utf-8")
    require(len(header_raw) <= 256 and b"\n" not in header_raw and b"\r" not in header_raw, "header-limit")
    case_raw = header_raw + b"\n" + body + b"\n"
    initial_raw = record["initial_routing"].encode("utf-8")
    admission = {
        "attempt": 0,
        "attempt_id": record["attempt_id"],
        "case": {
            "body_bytes": len(body), "body_sha256": sha(body), "bytes": len(case_raw),
            "header_bytes": len(header_raw), "header_sha256": sha(header_raw),
            "header_utf8": header, "sha256": sha(case_raw),
        },
        "execution_nonce": record["execution_nonce"],
        "goal_objective": record["goal_objective"],
        "initial_routing": {"bytes": len(initial_raw), "sha256": sha(initial_raw), "utf8": record["initial_routing"]},
        "manifest": {"bytes": PAIR_MANIFEST_BYTES, "path": PAIR_MANIFEST, "sha256": PAIR_MANIFEST_SHA256},
        "matrix_code": matrix_code,
        "matrix_id": record["matrix_id"],
        "model_requested": record["model_requested"],
        "reasoning_effort_requested": record["reasoning_effort_requested"],
        "result_contract": result_contract(node, cell),
        "route": record["route"],
        "route_code": record["route_code"],
        "schema_id": "pw-r9-codex-native-goal-tool-event-atomic-row-admission-v1",
        "source": {
            "atom_id": record["atom_id"], "cell": record["cell"], "cell_index": record["cell_index"],
            "path": record["source_cell_path"] + "#/nodes/" + str(record["node_index"]),
            "source_cell_file_sha256": record["source_cell_file_sha256"],
            "source_node_sha256": record["source_node_sha256"],
        },
        "task_name": record["task_name"],
        "wave_index": record["wave_index"],
    }
    return canon(admission) + b"\n", case_raw, admission


def validate_result(raw, contract):
    require(raw.endswith(b"\n") and raw.count(b"\n") == 1 and b"\r" not in raw, "result-framing")
    value_raw = raw[:-1]
    require(1 <= len(value_raw) <= contract["max_bytes"], "result-size")
    value = value_raw.decode("utf-8")
    if contract["kind"] == "regex":
        require(contract["min_bytes"] <= len(value_raw) and re.fullmatch(contract["pattern"], value) is not None, "result-regex")
    else:
        require(value in contract["values"], "result-set")
    return value, value_raw


def trace_items(events, event_type, payload_type=None):
    output = []
    for index, event in enumerate(events):
        payload = event.get("payload")
        if event.get("type") == event_type and isinstance(payload, dict) and (payload_type is None or payload.get("type") == payload_type):
            output.append((index, payload))
    return output


def tool_turn(payload):
    return payload.get("internal_chat_message_metadata_passthrough", {}).get("turn_id")


def read_trace(path, expected):
    require(path.startswith(SESSION_ROOT + "/") and os.path.realpath(path) == path, "trace-path")
    raw = read_bound(path, 0o664, 2_000_000, expected["bytes"], expected["sha256"])
    require(raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    events = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        require(line != b"\n" and line.endswith(b"\n"), "trace-line:" + str(index))
        events.append(parse(line[:-1]))
    require(bool(events), "trace-empty")
    return raw, events


def verify_goal_trace(admission, case_raw, result, result_raw, receipt):
    require(set(receipt) == GOAL_RECEIPT_FIELDS, "receipt-shape")
    trace_info = receipt["trace"]
    require(set(trace_info) == {"bytes", "mode", "path", "sha256"} and trace_info["mode"] == "0664", "receipt-trace-shape")
    trace_raw, events = read_trace(trace_info["path"], trace_info)
    sessions = trace_items(events, "session_meta")
    require(len(sessions) == 1 and sessions[0][0] == 0, "session-count")
    session = sessions[0][1]
    thread_id = session["id"]
    task_path = "/root/" + admission["task_name"]
    spawn = session.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    require(session.get("parent_thread_id") == PARENT_THREAD_ID and session.get("session_id") == PARENT_THREAD_ID, "session-parent")
    require(session.get("agent_path") == task_path and spawn.get("agent_path") == task_path and spawn.get("parent_thread_id") == PARENT_THREAD_ID and spawn.get("depth") == 1, "session-task")
    require(re.fullmatch(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", thread_id) is not None, "session-thread")
    require(os.path.basename(trace_info["path"]).endswith("-" + thread_id + ".jsonl"), "trace-thread")
    contexts = trace_items(events, "turn_context")
    require(len(contexts) == 1 and contexts[0][1]["model"] == admission["model_requested"] and contexts[0][1]["effort"] == admission["reasoning_effort_requested"], "trace-route")
    turn_id = contexts[0][1]["turn_id"]
    started = trace_items(events, "event_msg", "task_started")
    completed = trace_items(events, "event_msg", "task_complete")
    require(len(started) == 1 and started[0][1].get("turn_id") == turn_id and len(completed) == 1 and completed[0][1].get("turn_id") == turn_id and completed[0][0] == len(events) - 1, "trace-task-events")
    hidden = [
        event for event in events
        if event.get("type") == "response_item" and isinstance(event.get("payload"), dict)
        and event["payload"].get("type") == "custom_tool_call"
    ]
    require(not hidden, "trace-hidden-tool")
    calls = trace_items(events, "response_item", "function_call")
    require([payload["name"] for _, payload in calls] == ["create_goal", "exec_command", "exec_command", "update_goal"], "trace-call-order")
    require({tool_turn(payload) for _, payload in calls} == {turn_id} and len({payload["call_id"] for _, payload in calls}) == 4, "trace-call-identity")
    create_i, create = calls[0]
    show_i, show = calls[1]
    record_i, record = calls[2]
    update_i, update = calls[3]
    require(parse(create["arguments"].encode("utf-8")) == {"objective": admission["goal_objective"]}, "trace-create")
    common = {"login": False, "max_output_tokens": 1000, "workdir": "/mnt/Cursor/PuppetMaster/tests/r9g7", "yield_time_ms": 10000}
    expected_show = dict(common, cmd="python3 -B capsule.py show {} {:04d} {}".format(admission["matrix_code"], admission["wave_index"], admission["route_code"]))
    expected_record = dict(common, cmd="python3 -B capsule.py record {} {:04d} {} '{}'".format(admission["matrix_code"], admission["wave_index"], admission["route_code"], result))
    require(parse(show["arguments"].encode("utf-8")) == expected_show, "trace-show")
    require(parse(record["arguments"].encode("utf-8")) == expected_record, "trace-record")
    require(parse(update["arguments"].encode("utf-8")) == {"status": "complete"}, "trace-update")
    output_items = trace_items(events, "response_item", "function_call_output")
    outputs = {payload["call_id"]: (index, payload) for index, payload in output_items}
    require(len(output_items) == 4 and set(outputs) == {payload["call_id"] for _, payload in calls}, "trace-outputs")
    require({tool_turn(payload) for _, payload in outputs.values()} == {turn_id}, "trace-output-turn")
    active_i, active_output = outputs[create["call_id"]]
    active = parse(active_output["output"].encode("utf-8"))["goal"]
    require(active["threadId"] == thread_id and active["objective"] == admission["goal_objective"] and active["status"] == "active", "trace-active")
    show_o_i, show_output = outputs[show["call_id"]]
    require("Process exited with code 0" in show_output["output"] and show_output["output"].rsplit("Output:\n", 1)[1].encode("utf-8") == case_raw, "trace-show-output")
    record_o_i, record_output = outputs[record["call_id"]]
    require("Process exited with code 0" in record_output["output"] and record_output["output"].endswith("Output:\nDONE"), "trace-record-output")
    complete_i, complete_output = outputs[update["call_id"]]
    complete = parse(complete_output["output"].encode("utf-8"))["goal"]
    require(complete["threadId"] == thread_id and complete["objective"] == admission["goal_objective"] and complete["status"] == "complete", "trace-complete")
    require(isinstance(complete["tokensUsed"], int) and complete["tokensUsed"] > 0 and isinstance(complete["timeUsedSeconds"], int) and complete["timeUsedSeconds"] >= 0, "trace-usage")
    require(create_i < active_i < show_i < show_o_i < record_i < record_o_i < update_i < complete_i < completed[0][0], "trace-order")
    expected_receipt = {
        "function_call_order": ["create_goal", "exec_command:show", "exec_command:record", "update_goal"],
        "goal": {"objective": admission["goal_objective"], "status": "complete", "time_used_seconds": complete["timeUsedSeconds"], "tokens_used": complete["tokensUsed"]},
        "goal_thread_id": thread_id,
        "matrix_id": admission["matrix_id"],
        "model": admission["model_requested"],
        "qualification_credit": 0,
        "reasoning_effort": admission["reasoning_effort_requested"],
        "result": {"bytes": len(result_raw), "sha256": sha(result_raw)},
        "route": admission["route"],
        "schema_id": "pw-r9-codex-native-goal-tool-event-atomic-goal-receipt-v1",
        "status": "PASS_FRESH_NATIVE_GOAL_SINGLE_ATOM_ZERO_CREDIT",
        "task_path": task_path,
        "trace": trace_info,
        "turn_count": 1,
        "wave_index": admission["wave_index"],
    }
    require(receipt == expected_receipt, "receipt-rederivation")
    return thread_id, task_path, sha(trace_raw), trace_info["path"], _meta(os.lstat(trace_info["path"]))


def assemble(recipe, node_results):
    if recipe["kind"] == "MODEL_FINAL_CANONICAL_ONE_FIELD_JSON":
        raw = node_results[recipe["dynamic_node"]]
        value = parse(raw)
        require(list(value) == [recipe["output_key"]] and value[recipe["output_key"]] in recipe["allowed_values"], "assembly-model-final")
        return raw
    if recipe["kind"] == "DETERMINISTIC_S50_ASSEMBLY_FROM_EIGHT_COMPACT_VERDICTS":
        fixed = recipe["fixed"]
        verdicts = []
        for item in recipe["ordered_edge_items"]:
            code = node_results[item["verdict_from_compact_node"]].decode("utf-8")
            require(code in {"S", "U"}, "assembly-s50-code")
            verdicts.append({"edge_id": item["edge_id"], "verdict": "supported" if code == "S" else "unsupported", "source_decision_ids": item["source_decision_ids"]})
        return ordered({
            "protocol_id": fixed["protocol_id"], "stage": fixed["stage"],
            "topic_artifact_hashes": fixed["topic_artifact_hashes"],
            "checked_edge_ids": fixed["checked_edge_ids"], "edge_verdicts": verdicts,
            "claim_boundary": fixed["claim_boundary"], "external_audit_status": fixed["external_audit_status"],
            "forbidden_action_violations": fixed["forbidden_action_violations"],
        })
    require(recipe["kind"] == "DETERMINISTIC_S60_ASSEMBLY_FROM_COMPACT_SPECIALIST_CODE", "assembly-kind")
    fixed = recipe["fixed"]
    code = node_results[recipe["compact_node"]].decode("utf-8")
    expected_code = {"provenance_gap": "P", "authority_conflation": "C", "counterfactual_failure": "K"}[fixed["classification"]]
    require(code in {"S:" + expected_code, "U:" + expected_code}, "assembly-s60-code")
    return ordered({
        "protocol_id": fixed["protocol_id"], "stage": fixed["stage"], "role": fixed["role"],
        "candidate_edge_id": fixed["candidate_edge_id"], "candidate_lineage_sha256": fixed["candidate_lineage_sha256"],
        "integration_candidate_sha256": fixed["integration_candidate_sha256"],
        "verdict": "supported" if code.startswith("S:") else "unsupported",
        "classification": fixed["classification"], "source_record_ids": fixed["source_record_ids"],
        "claim_boundary": fixed["claim_boundary"], "external_audit_status": fixed["external_audit_status"],
        "forbidden_action_violations": fixed["forbidden_action_violations"],
    })


def inventory_projection(root, excluded):
    records = []
    total_file_bytes = 0

    def visit(path, relative):
        nonlocal total_file_bytes
        require_directory(path)
        records.append({"kind": "directory", "mode": "0700", "path": relative})
        with os.scandir(path) as handle:
            entries = sorted(handle, key=lambda item: item.name)
        for entry in entries:
            child_relative = entry.name if relative == "." else relative + "/" + entry.name
            if child_relative in excluded:
                continue
            info = entry.stat(follow_symlinks=False)
            if stat.S_ISDIR(info.st_mode):
                visit(entry.path, child_relative)
                continue
            require(stat.S_ISREG(info.st_mode) and info.st_uid == os.getuid() and info.st_nlink == 1, "inventory-regular:" + child_relative)
            mode = 0o600 if child_relative == "run.lock" else 0o444
            raw = read_bound(entry.path, mode, 30_000_000)
            records.append({"bytes": len(raw), "kind": "file", "mode": "{:04o}".format(mode), "path": child_relative, "sha256": sha(raw)})
            total_file_bytes += len(raw)

    visit(root, ".")
    projection = b"".join(canon(record) + b"\n" for record in records)
    return {
        "directories": sum(record["kind"] == "directory" for record in records),
        "entries": len(records),
        "files": sum(record["kind"] == "file" for record in records),
        "projection_bytes": len(projection),
        "projection_sha256": sha(projection),
        "total_file_bytes": total_file_bytes,
    }


def acquire_lock(path):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == 0o600 and before.st_uid == os.getuid() and before.st_nlink == 1, "lock-custody")
    flags = os.O_RDONLY | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        require(_meta(os.fstat(fd)) == _meta(before), "lock-open-race")
        fcntl.flock(fd, fcntl.LOCK_SH | fcntl.LOCK_NB)
    except Exception:
        os.close(fd)
        raise
    return fd


def load_run(matrix_code):
    require(matrix_code in MATRICES, "run-code")
    run_root = RUNS + "/" + MATRICES[matrix_code]
    require_directory(RUNS)
    require_directory(run_root)
    lock_fd = acquire_lock(run_root + "/run.lock")
    try:
        run_raw = read_bound(run_root + "/run.json", 0o444, 4096)
        run = parse(run_raw)
        require(run_raw == canon(run) + b"\n" and set(run) == RUN_FIELDS, "run-shape")
        require(run == {
            "capsule": {"bytes": CAPSULE_BYTES, "path": CAPSULE, "sha256": CAPSULE_SHA256},
            "manifest": {"bytes": PAIR_MANIFEST_BYTES, "path": PAIR_MANIFEST, "sha256": PAIR_MANIFEST_SHA256},
            "materializer": {"bytes": MATERIALIZER_BYTES, "path": MATERIALIZER, "sha256": MATERIALIZER_SHA256},
            "matrix_code": matrix_code,
            "matrix_id": MATRICES[matrix_code],
            "parent_thread_id": PARENT_THREAD_ID,
            "qualification_credit": 0,
            "schedule": run["schedule"],
            "schedule_offsets": run["schedule_offsets"],
            "schema_id": "pw-r9-codex-native-goal-tool-event-atomic-run-v1",
            "status": "OPEN_ZERO_CREDIT",
            "wave_count": 5204,
        }, "run-values")
        return run_root, run, lock_fd
    except Exception:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)
        raise


def validate_terminal_surface(run_root, run, wave_count=5204, subject_task_count=15612):
    require(sorted(os.listdir(run_root)) == [
        "matrix_accounting.json", "matrix_terminal.json", "rows", "run.json",
        "run.lock", "schedule.jsonl", "schedule_offsets.json",
    ], "sealed-root-inventory")
    terminal_raw = read_bound(run_root + "/matrix_terminal.json", 0o444, 4096)
    terminal = parse(terminal_raw)
    require(terminal_raw == canon(terminal) + b"\n", "terminal-canonical")
    require(set(terminal) == {
        "fresh_goal_threads", "fresh_task_paths", "fresh_trace_hashes", "matrix_id",
        "preterminal_inventory", "qualification_credit", "row_count", "schema_id",
        "status", "wave_count",
    }, "terminal-shape")
    require(terminal["matrix_id"] == run["matrix_id"] and terminal["schema_id"] == "pw-r9-codex-native-goal-tool-event-atomic-matrix-terminal-v1", "terminal-bind")
    require(terminal["status"] == "SEALED_EVIDENCE_ZERO_CREDIT_PENDING_INDEPENDENT_SCORE" and terminal["qualification_credit"] == 0, "terminal-status")
    require(terminal["wave_count"] == wave_count and terminal["row_count"] == subject_task_count, "terminal-count")
    require(terminal["fresh_goal_threads"] == subject_task_count and terminal["fresh_task_paths"] == subject_task_count and terminal["fresh_trace_hashes"] == subject_task_count, "terminal-freshness")
    preterminal = inventory_projection(run_root, {"matrix_accounting.json", "matrix_terminal.json"})
    require(terminal["preterminal_inventory"] == preterminal, "terminal-inventory")
    accounting_raw = read_bound(run_root + "/matrix_accounting.json", 0o444, 4096)
    accounting = parse(accounting_raw)
    require(accounting_raw == canon(accounting) + b"\n", "accounting-canonical")
    require(set(accounting) == {
        "inventory_before_accounting", "matrix_id", "matrix_terminal",
        "qualification_credit", "retry_count", "schema_id", "status",
        "subject_task_count",
    }, "accounting-shape")
    require(accounting["matrix_id"] == run["matrix_id"] and accounting["schema_id"] == "pw-r9-codex-native-goal-tool-event-atomic-matrix-accounting-v1", "accounting-bind")
    require(accounting["status"] == "SEALED_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFICATION" and accounting["qualification_credit"] == 0 and accounting["retry_count"] == 0 and accounting["subject_task_count"] == subject_task_count, "accounting-status")
    require(accounting["matrix_terminal"] == {"bytes": len(terminal_raw), "sha256": sha(terminal_raw)}, "accounting-terminal")
    require(accounting["inventory_before_accounting"] == inventory_projection(run_root, {"matrix_accounting.json"}), "accounting-inventory")
    return terminal_raw, accounting_raw


def index_prior_receipts(run_root):
    threads = set()
    tasks = set()
    traces = set()
    require(sorted(os.listdir(run_root + "/rows")) == ["wave-{:04d}".format(index) for index in range(5204)], "prior-waves")
    for wave in range(5204):
        wave_root = run_root + "/rows/wave-{:04d}".format(wave)
        require(sorted(os.listdir(wave_root)) == [item[0] for item in ROSTER], "prior-routes")
        for route, _, _, _ in ROSTER:
            row_root = wave_root + "/" + route
            require(sorted(os.listdir(row_root)) == ["admission.json", "case.txt", "goal_receipt.json", "result.txt"], "prior-row")
            receipt_raw = read_bound(row_root + "/goal_receipt.json", 0o444, 4096)
            receipt = parse(receipt_raw)
            require(receipt_raw == canon(receipt) + b"\n" and set(receipt) == GOAL_RECEIPT_FIELDS, "prior-receipt")
            threads.add(receipt["goal_thread_id"])
            tasks.add(receipt["task_path"])
            traces.add(receipt["trace"]["sha256"])
    require(len(threads) == 15612 and len(tasks) == 15612 and len(traces) == 15612, "prior-freshness")
    return threads, tasks, traces


def verify_rows(run_root, matrix_code, records, cells, wave_count, prior_ids):
    require(sorted(os.listdir(run_root + "/rows")) == ["wave-{:04d}".format(index) for index in range(wave_count)], "wave-inventory")
    results_by_wave = {}
    node_results = {}
    goal_threads = set()
    task_paths = set()
    trace_hashes = set()
    trace_postflight = []
    for wave in range(wave_count):
        wave_root = run_root + "/rows/wave-{:04d}".format(wave)
        require(sorted(os.listdir(wave_root)) == [item[0] for item in ROSTER], "route-inventory")
        for route_index, (route, route_code, model, effort) in enumerate(ROSTER):
            record = records[wave * 3 + route_index]
            require(record["route"] == route and record["route_code"] == route_code and record["model_requested"] == model and record["reasoning_effort_requested"] == effort, "record-route")
            cell = cells[(route, record["cell_index"])]
            node = cell["nodes"][record["node_index"]]
            dependencies = [results_by_wave[(route, dependency)] for dependency in record["dependency_waves"]]
            expected_admission, expected_case, expected_admission_value = expected_row(record, cell, node, matrix_code, dependencies)
            row_root = wave_root + "/" + route
            require(sorted(os.listdir(row_root)) == ["admission.json", "case.txt", "goal_receipt.json", "result.txt"], "row-inventory")
            admission_raw = read_bound(row_root + "/admission.json", 0o444, 12_000, len(expected_admission), sha(expected_admission))
            require(admission_raw == expected_admission and set(parse(admission_raw)) == ADMISSION_FIELDS, "admission-exact")
            case_raw = read_bound(row_root + "/case.txt", 0o444, 768, len(expected_case), sha(expected_case))
            require(case_raw == expected_case, "case-exact")
            result_file = read_bound(row_root + "/result.txt", 0o444, 129)
            result, result_raw = validate_result(result_file, expected_admission_value["result_contract"])
            receipt_file = read_bound(row_root + "/goal_receipt.json", 0o444, 4096)
            receipt = parse(receipt_file)
            require(receipt_file == canon(receipt) + b"\n", "receipt-canonical")
            thread_id, task_path, trace_hash, trace_path, trace_meta = verify_goal_trace(expected_admission_value, case_raw, result, result_raw, receipt)
            require(thread_id not in goal_threads and thread_id not in prior_ids[0], "global-thread-reuse")
            require(task_path not in task_paths and task_path not in prior_ids[1], "global-task-reuse")
            require(trace_hash not in trace_hashes and trace_hash not in prior_ids[2], "global-trace-reuse")
            goal_threads.add(thread_id)
            task_paths.add(task_path)
            trace_hashes.add(trace_hash)
            trace_postflight.append((trace_path, trace_meta))
            results_by_wave[(route, wave)] = result
            node_results.setdefault((route, record["cell_index"]), {})[record["atom_id"]] = result_raw
    expected_count = wave_count * len(ROSTER)
    require(len(goal_threads) == expected_count and len(task_paths) == expected_count and len(trace_hashes) == expected_count, "global-current-freshness")
    for trace_path, trace_meta in trace_postflight:
        require(_meta(os.lstat(trace_path)) == trace_meta, "trace-postflight-drift")
    return goal_threads, task_paths, trace_hashes, node_results


def verify_matrix(matrix_code):
    pair, public = public_sources()
    require(pair["authority"]["qualification_credit"] == 0 and pair["qualification"]["credit"] == "0/2", "pair-credit")
    prior_lock = None
    prior_ids = (set(), set(), set())
    if matrix_code == "008":
        matrix_008_gate()
        prior_root = RUNS + "/" + MATRICES["007"]
        require_directory(prior_root)
        prior_lock = acquire_lock(prior_root + "/run.lock")
        try:
            prior_run_raw = read_bound(prior_root + "/run.json", 0o444, 4096)
            prior_run = parse(prior_run_raw)
            require(prior_run_raw == canon(prior_run) + b"\n" and prior_run["matrix_code"] == "007", "prior-run")
            validate_terminal_surface(prior_root, prior_run)
            prior_ids = index_prior_receipts(prior_root)
        except Exception:
            fcntl.flock(prior_lock, fcntl.LOCK_UN)
            os.close(prior_lock)
            raise
    run_root = None
    lock_fd = None
    try:
        run_root, run, lock_fd = load_run(matrix_code)
        records, cells = build_schedule(matrix_code, public)
        expected_schedule, expected_offsets = schedule_bytes(records)
        schedule_raw = read_bound(run_root + "/schedule.jsonl", 0o444, 30_000_000, len(expected_schedule), sha(expected_schedule))
        offsets_raw = read_bound(run_root + "/schedule_offsets.json", 0o444, 500_000, len(expected_offsets), sha(expected_offsets))
        require(schedule_raw == expected_schedule and offsets_raw == expected_offsets, "schedule-exact")
        require(run["schedule"] == {"bytes": len(expected_schedule), "records": 15612, "sha256": sha(expected_schedule)}, "run-schedule")
        require(run["schedule_offsets"] == {"bytes": len(expected_offsets), "sha256": sha(expected_offsets)}, "run-offsets")
        validate_terminal_surface(run_root, run)
        goal_threads, task_paths, trace_hashes, node_results = verify_rows(
            run_root, matrix_code, records, cells, 5204, prior_ids
        )
        scorer = private_scorer()
        expected_cells = {entry["cell_index"]: entry for entry in scorer["cells"]}
        require(set(expected_cells) == set(range(97)), "scorer-cell-index")
        route_outcomes = 0
        for route, _, _, _ in ROSTER:
            for cell_index in range(97):
                cell = cells[(route, cell_index)]
                actual = assemble(cell["assembly_recipe"], node_results[(route, cell_index)])
                expected = expected_cells[cell_index]
                require(expected["cell"] == cell["cell"], "score-cell")
                require(len(actual) == expected["expected_output_bytes"] and sha(actual) == expected["expected_output_sha256"] and actual.decode("utf-8") == expected["expected_output_utf8"], "score-mismatch:{}:{}".format(route, cell["cell"]))
                route_outcomes += 1
        require(route_outcomes == 291, "score-count")
        validate_terminal_surface(run_root, run)
        output = {
            "clean_full_matrix": True,
            "external_adjudication_required": True,
            "fresh_goal_threads": len(goal_threads),
            "fresh_task_paths": len(task_paths),
            "fresh_trace_hashes": len(trace_hashes),
            "matrix_code": matrix_code,
            "matrix_id": run["matrix_id"],
            "nonclaims": ["RAW_PRE_GOAL_TRACE_SUBSTRINGS_ARE_ENCRYPTED_AND_EXCLUDED", "NO_QUALIFICATION_AUTHORITY_FROM_THIS_PROGRAM"],
            "qualification_credit": 0,
            "route_outcomes_exact_pass": route_outcomes,
            "schema_id": "pw-r9-codex-native-goal-tool-event-atomic-offline-verification-v1",
            "status": "PASS_CLEAN_FULL_MATRIX_ZERO_CREDIT_PENDING_INDEPENDENT_ADJUDICATION",
            "subject_task_count": len(goal_threads),
            "wave_count": 5204,
        }
        return output
    finally:
        if lock_fd is not None:
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
            os.close(lock_fd)
        if prior_lock is not None:
            fcntl.flock(prior_lock, fcntl.LOCK_UN)
            os.close(prior_lock)


def check_only(matrix_code):
    pair, public = public_sources()
    records, _ = build_schedule(matrix_code, public)
    schedule_raw, offsets_raw = schedule_bytes(records)
    require(pair["matrices"][int(matrix_code) - 7]["subject_task_count"] == 15612, "pair-matrix-count")
    return {
        "matrix_code": matrix_code,
        "qualification_credit": 0,
        "schedule": {"bytes": len(schedule_raw), "records": len(records), "sha256": sha(schedule_raw)},
        "schedule_offsets": {"bytes": len(offsets_raw), "sha256": sha(offsets_raw)},
        "schema_id": "pw-r9-codex-native-goal-tool-event-atomic-offline-verifier-check-v1",
        "scorer_reads": 0,
        "status": "PASS_PUBLIC_STATIC_ZERO_WRITES_ZERO_CALLS_ZERO_CREDIT",
        "subject_calls": 0,
        "workspace_writes": 0,
    }


def emit(value):
    sys.stdout.buffer.write(canon(value) + b"\n")


def main():
    try:
        require(os.getcwd() == "/mnt/Cursor/PuppetMaster/tests/r9g7", "cwd")
        if len(sys.argv) == 3 and sys.argv[1] == "check" and sys.argv[2] in MATRICES:
            emit(check_only(sys.argv[2]))
        elif len(sys.argv) == 3 and sys.argv[1] == "verify" and sys.argv[2] in MATRICES:
            emit(verify_matrix(sys.argv[2]))
        else:
            raise Invalid("cli")
        return 0
    except (Invalid, OSError, KeyError, IndexError, TypeError, ValueError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        emit({
            "first_mismatch": str(exc),
            "qualification_credit": 0,
            "schema_id": "pw-r9-codex-native-goal-tool-event-atomic-offline-verification-failure-v1",
            "status": "FAIL_ZERO_CREDIT",
            "workspace_writes": 0,
        })
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
