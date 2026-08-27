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
CAPSULE = "/mnt/Cursor/PuppetMaster/tests/r9g7/capsule.py"
CAPSULE_BYTES = 11608
CAPSULE_SHA256 = "46b84494ba7e5744cae2604ab69f1839f837662fe168f76c1234112dcf5a5ea7"
MATERIALIZER = "/mnt/Cursor/PuppetMaster/tests/r9g7/materialize.py"
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
WAVE_COUNT = 5204
SUBJECT_TASK_COUNT = 15612
RUN_FIELDS = {
    "capsule", "manifest", "materializer", "matrix_code", "matrix_id",
    "parent_thread_id", "qualification_credit", "schedule",
    "schedule_offsets", "schema_id", "status", "wave_count",
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


def fsync_directory(path):
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_CLOEXEC)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def make_directory(path, parent):
    os.mkdir(path, 0o700)
    os.chmod(path, 0o700)
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "mkdir")
    fsync_directory(parent)


def publish(path, raw, mode):
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags, mode)
    try:
        os.fchmod(fd, mode)
        offset = 0
        while offset < len(raw):
            offset += os.write(fd, raw[offset:])
        os.fsync(fd)
        info = os.fstat(fd)
        require(stat.S_IMODE(info.st_mode) == mode and info.st_uid == os.getuid() and info.st_nlink == 1 and info.st_size == len(raw), "publish")
    finally:
        os.close(fd)
    fsync_directory(os.path.dirname(path))
    require(read_bound(path, mode, len(raw), len(raw), sha(raw)) == raw, "publish-reopen")


def validate_static_bindings():
    pair_raw = read_bound(PAIR_MANIFEST, 0o644, PAIR_MANIFEST_BYTES, PAIR_MANIFEST_BYTES, PAIR_MANIFEST_SHA256)
    pair = parse(pair_raw)
    require(pair_raw == canon(pair) + b"\n" and pair["schema_id"] == "pw-r9-codex-native-goal-tool-event-atomic-matrix-pair-inputs-v1", "pair-manifest")
    public_raw = read_bound(PUBLIC_MANIFEST, 0o644, PUBLIC_MANIFEST_BYTES, PUBLIC_MANIFEST_BYTES, PUBLIC_MANIFEST_SHA256)
    public = parse(public_raw)
    require(public["schema_id"] == "pw-r9-codex-native-goal-atomic-public-manifest-v1" and len(public["cells"]) == 291, "public-manifest")
    read_bound(CAPSULE, 0o644, CAPSULE_BYTES, CAPSULE_BYTES, CAPSULE_SHA256)
    return pair, public


def materializer_identity():
    raw = read_bound(MATERIALIZER, 0o644, 100_000)
    return {"bytes": len(raw), "path": MATERIALIZER, "sha256": sha(raw)}


def verifier_identity():
    raw = read_bound(VERIFIER, 0o644, 100_000)
    return {"bytes": len(raw), "path": VERIFIER, "sha256": sha(raw)}


def require_matrix_008_gate():
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
        "materializer": materializer_identity(),
        "verifier": verifier_identity(),
    }, "matrix-008-gate-components")
    report = gate["offline_verification"]
    require(isinstance(report, dict) and set(report) == {
        "clean_full_matrix", "external_adjudication_required", "fresh_goal_threads",
        "fresh_task_paths", "fresh_trace_hashes", "matrix_code", "matrix_id",
        "nonclaims", "qualification_credit", "route_outcomes_exact_pass",
        "schema_id", "status", "subject_task_count", "wave_count",
    }, "matrix-008-gate-report-shape")
    require(report.get("matrix_code") == "007" and report.get("matrix_id") == MATRICES["007"], "matrix-008-gate-report")
    require(report.get("status") == "PASS_CLEAN_FULL_MATRIX_ZERO_CREDIT_PENDING_INDEPENDENT_ADJUDICATION" and report.get("clean_full_matrix") is True and report.get("qualification_credit") == 0, "matrix-008-gate-report-status")
    require(report.get("subject_task_count") == SUBJECT_TASK_COUNT and report.get("fresh_goal_threads") == SUBJECT_TASK_COUNT and report.get("route_outcomes_exact_pass") == 291, "matrix-008-gate-report-counts")
    reviewer = gate["reviewer"]
    require(isinstance(reviewer, dict) and set(reviewer) == {"goal_status", "goal_thread_id", "task_path", "time_used_seconds", "tokens_used"}, "matrix-008-gate-reviewer")
    require(reviewer["goal_status"] == "complete" and re.fullmatch(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", reviewer["goal_thread_id"]) is not None and re.fullmatch(r"/root/[a-z0-9_]+", reviewer["task_path"]) is not None, "matrix-008-gate-reviewer-id")
    require(isinstance(reviewer["tokens_used"], int) and reviewer["tokens_used"] > 0 and isinstance(reviewer["time_used_seconds"], int) and reviewer["time_used_seconds"] >= 0, "matrix-008-gate-reviewer-usage")
    matrix = gate["matrix_007"]
    require(isinstance(matrix, dict) and set(matrix) == {"accounting", "matrix_id", "terminal"} and matrix["matrix_id"] == MATRICES["007"], "matrix-008-gate-matrix")
    run_root = RUNS + "/" + MATRICES["007"]
    for name, key in (("matrix_accounting.json", "accounting"), ("matrix_terminal.json", "terminal")):
        value = matrix[key]
        path = run_root + "/" + name
        require(value.get("path") == path, "matrix-008-gate-path")
        read_bound(path, 0o444, 32_000, value["bytes"], value["sha256"])
    return gate


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
    require(payload.get("op") == "label" and isinstance(payload.get("x"), str), "static-label-payload")
    if node["kind"] == "EVIDENCE_SLICE_LABEL":
        require(set(payload) == {"op", "t", "x"} and isinstance(payload["t"], str), "static-evidence-payload")
    else:
        require(node["kind"] == "ENDPOINT_SLICE_LABEL", "static-kind")
        if set(payload) == {"d", "k", "op", "x"}:
            require(payload["k"] == "choice" and isinstance(payload["d"], str), "static-endpoint-choice")
        else:
            require(set(payload) == {"i", "k", "op", "x"} and payload["k"] in {"statement", "type"} and isinstance(payload["i"], str), "static-endpoint-item")
    return payload


def build_schedule(matrix_code, public):
    require(matrix_code in MATRICES, "matrix-code")
    matrix_id = MATRICES[matrix_code]
    by_route = {route: [] for route, _, _, _ in ROSTER}
    entries = {route: [] for route, _, _, _ in ROSTER}
    for entry in public["cells"]:
        require(entry["route"] in entries, "source-route")
        entries[entry["route"]].append(entry)
    for route, route_code, model, effort in ROSTER:
        wave = 0
        for entry in sorted(entries[route], key=lambda item: item["cell_index"]):
            require(entry["cell_index"] == len({item["cell_index"] for item in entries[route] if item["cell_index"] < entry["cell_index"]}), "source-cell-order")
            cell_file = entry["cell_file"]
            cell_raw = read_bound(PUBLIC_DIR + "/" + cell_file["path"], 0o644, 500_000, cell_file["bytes"], cell_file["sha256"])
            cell = parse(cell_raw)
            require(cell["route"] == route and cell["model_requested"] == model and cell["reasoning_effort_requested"] == effort, "source-cell-bind")
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
                    require(validation["regex"] == "[A-Za-z0-9._:-]+" and 1 <= validation["utf8_bytes_min"] <= validation["utf8_bytes_max"] <= 48, "static-label-result")
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
            record = by_route[route][wave]
            require(record["wave_index"] == wave, "wave-alignment")
            records.append(record)
    require(len(records) == 15612 and len({item["execution_nonce"] for item in records}) == 15612, "schedule-count")
    return records


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


def read_schedule_record(run_root, run, wave, route_index):
    offsets_raw = read_bound(run_root + "/schedule_offsets.json", 0o444, run["schedule_offsets"]["bytes"], run["schedule_offsets"]["bytes"], run["schedule_offsets"]["sha256"])
    offsets = parse(offsets_raw)
    require(offsets_raw == canon(offsets) + b"\n" and offsets["count"] == 15612, "offsets")
    index = wave * 3 + route_index
    offset, length = offsets["entries"][index]
    flags = os.O_RDONLY | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(run_root + "/schedule.jsonl", flags)
    try:
        raw = os.pread(fd, length, offset)
    finally:
        os.close(fd)
    require(len(raw) == length and raw.endswith(b"\n"), "schedule-read")
    record = parse(raw[:-1])
    require(raw == canon(record) + b"\n" and record["wave_index"] == wave, "schedule-record")
    return record


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
        return {
            "kind": "regex",
            "max_bytes": validation["utf8_bytes_max"],
            "min_bytes": validation["utf8_bytes_min"],
            "pattern": validation["regex"],
        }
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
        require(re.fullmatch(r"[PCK]", code) is not None, "result-specialist-code")
        values = ["S:" + code, "U:" + code]
    require(all(len(value.encode("utf-8")) <= node["result_max_bytes"] and "'" not in value for value in values), "result-values")
    return {"kind": "exact_set", "max_bytes": node["result_max_bytes"], "values": values}


def load_result(matrix_id, wave, route):
    row_root = RUNS + "/" + matrix_id + "/rows/wave-{:04d}/{}".format(wave, route)
    require(sorted(os.listdir(row_root)) == ["admission.json", "case.txt", "goal_receipt.json", "result.txt"], "dependency-row-inventory")
    admission_raw = read_bound(row_root + "/admission.json", 0o444, 12_000)
    admission = parse(admission_raw)
    require(admission_raw == canon(admission) + b"\n" and admission["schema_id"] == "pw-r9-codex-native-goal-tool-event-atomic-row-admission-v1", "dependency-admission")
    require(admission["matrix_id"] == matrix_id and admission["wave_index"] == wave and admission["route"] == route, "dependency-admission-bind")
    contract = admission["result_contract"]
    path = row_root + "/result.txt"
    raw = read_bound(path, 0o444, 129)
    require(b"\r" not in raw and raw.endswith(b"\n") and raw.count(b"\n") == 1, "dependency-result")
    value_raw = raw[:-1]
    require(1 <= len(value_raw) <= contract["max_bytes"], "dependency-result-size")
    value = value_raw.decode("utf-8")
    if contract["kind"] == "regex":
        require(contract["min_bytes"] <= len(value_raw) and re.fullmatch(contract["pattern"], value) is not None, "dependency-result-regex")
    else:
        require(contract["kind"] == "exact_set" and value in contract["values"], "dependency-result-set")
    receipt_raw = read_bound(row_root + "/goal_receipt.json", 0o444, 4096)
    receipt = parse(receipt_raw)
    require(receipt_raw == canon(receipt) + b"\n" and set(receipt) == GOAL_RECEIPT_FIELDS and receipt["schema_id"] == "pw-r9-codex-native-goal-tool-event-atomic-goal-receipt-v1", "dependency-goal-receipt")
    require(receipt["matrix_id"] == matrix_id and receipt["wave_index"] == wave and receipt["route"] == route and receipt["status"] == "PASS_FRESH_NATIVE_GOAL_SINGLE_ATOM_ZERO_CREDIT", "dependency-goal-bind")
    require(receipt["result"] == {"bytes": len(value_raw), "sha256": sha(value_raw)}, "dependency-goal-result")
    return value


def materialize_row(record, cell, node, matrix_code):
    results = [load_result(record["matrix_id"], wave, record["route"]) for wave in record["dependency_waves"]]
    if node["dynamic"]:
        payload_value = replace_template(node["subject_template"]["canonical_json_template"], results)
        payload_raw = canon(payload_value)
        require(len(payload_raw) <= node["subject_template"]["max_payload_bytes"] <= 170, "dynamic-payload")
    else:
        require(not results, "static-results")
        payload_raw = node["subject_payload"]["utf8"].encode("utf-8")
        require(len(payload_raw) == node["subject_payload"]["bytes"] <= 170 and sha(payload_raw) == node["subject_payload"]["sha256"], "static-payload")
    subject = {
        "a": record["attempt_id"],
        "i": record["atom_id"],
        "k": "subject",
        "n": record["execution_nonce"],
        "p": payload_raw.decode("utf-8"),
        "ph": sha(payload_raw),
        "v": 1,
    }
    body = canon(subject)
    require(len(body) <= 490, "case-body-limit")
    header = "CASE|v2|m={}|w={:04d}|r={}|kind={}|instruction={}|output={}|record=RESULT".format(
        matrix_code, record["wave_index"], record["route_code"], node["kind"],
        node["acceptance_criterion"]["utf8"], node["output_contract"]["utf8"],
    )
    header_raw = header.encode("utf-8")
    require(len(header_raw) <= 256 and b"\n" not in header_raw and b"\r" not in header_raw, "case-header-limit")
    case_raw = header_raw + b"\n" + body + b"\n"
    initial_raw = record["initial_routing"].encode("utf-8")
    admission = {
        "attempt": 0,
        "attempt_id": record["attempt_id"],
        "case": {
            "body_bytes": len(body),
            "body_sha256": sha(body),
            "bytes": len(case_raw),
            "header_bytes": len(header_raw),
            "header_sha256": sha(header_raw),
            "header_utf8": header,
            "sha256": sha(case_raw),
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
            "atom_id": record["atom_id"],
            "cell": record["cell"],
            "cell_index": record["cell_index"],
            "path": record["source_cell_path"] + "#/nodes/" + str(record["node_index"]),
            "source_cell_file_sha256": record["source_cell_file_sha256"],
            "source_node_sha256": record["source_node_sha256"],
        },
        "task_name": record["task_name"],
        "wave_index": record["wave_index"],
    }
    return canon(admission) + b"\n", case_raw


def begin(matrix_code):
    _, public = validate_static_bindings()
    require(matrix_code in MATRICES, "begin-matrix")
    if matrix_code == "008":
        require_matrix_008_gate()
    records = build_schedule(matrix_code, public)
    schedule_raw, offsets_raw = schedule_bytes(records)
    if not os.path.exists(RUNS):
        make_directory(RUNS, BASE)
    else:
        info = os.lstat(RUNS)
        require(stat.S_ISDIR(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "runs-root")
    run_root = RUNS + "/" + MATRICES[matrix_code]
    make_directory(run_root, RUNS)
    make_directory(run_root + "/rows", run_root)
    lock_fd = os.open(run_root + "/run.lock", os.O_RDWR | os.O_CREAT | os.O_EXCL | os.O_CLOEXEC, 0o600)
    try:
        os.fchmod(lock_fd, 0o600)
        os.fsync(lock_fd)
    finally:
        os.close(lock_fd)
    fsync_directory(run_root)
    publish(run_root + "/schedule.jsonl", schedule_raw, 0o444)
    publish(run_root + "/schedule_offsets.json", offsets_raw, 0o444)
    run = {
        "capsule": {"bytes": CAPSULE_BYTES, "path": CAPSULE, "sha256": CAPSULE_SHA256},
        "manifest": {"bytes": PAIR_MANIFEST_BYTES, "path": PAIR_MANIFEST, "sha256": PAIR_MANIFEST_SHA256},
        "materializer": materializer_identity(),
        "matrix_code": matrix_code,
        "matrix_id": MATRICES[matrix_code],
        "parent_thread_id": PARENT_THREAD_ID,
        "qualification_credit": 0,
        "schedule": {"bytes": len(schedule_raw), "records": 15612, "sha256": sha(schedule_raw)},
        "schedule_offsets": {"bytes": len(offsets_raw), "sha256": sha(offsets_raw)},
        "schema_id": "pw-r9-codex-native-goal-tool-event-atomic-run-v1",
        "status": "OPEN_ZERO_CREDIT",
        "wave_count": 5204,
    }
    publish(run_root + "/run.json", canon(run) + b"\n", 0o444)
    sys.stdout.buffer.write(canon(run) + b"\n")


def locked_run(matrix_code):
    validate_static_bindings()
    require(matrix_code in MATRICES, "run-matrix")
    run_root = RUNS + "/" + MATRICES[matrix_code]
    run_raw = read_bound(run_root + "/run.json", 0o444, 4096)
    run = parse(run_raw)
    require(run_raw == canon(run) + b"\n" and set(run) == RUN_FIELDS and run["matrix_code"] == matrix_code and run["status"] == "OPEN_ZERO_CREDIT", "run")
    require(run["materializer"] == materializer_identity(), "run-materializer")
    lock_fd = os.open(run_root + "/run.lock", os.O_RDWR | os.O_CLOEXEC | (os.O_NOFOLLOW if hasattr(os, "O_NOFOLLOW") else 0))
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except Exception:
        os.close(lock_fd)
        raise
    return run_root, run, lock_fd


def prepare(matrix_code, wave_text):
    require(re.fullmatch(r"[0-9]{4}", wave_text) is not None and 0 <= int(wave_text) < 5204, "prepare-wave")
    wave = int(wave_text)
    run_root, run, lock_fd = locked_run(matrix_code)
    try:
        row_entries = sorted(os.listdir(run_root + "/rows"))
        require(row_entries == ["wave-{:04d}".format(index) for index in range(wave)], "prepare-sequence")
        if wave:
            for route, _, _, _ in ROSTER:
                load_result(run["matrix_id"], wave - 1, route)
        prepared = []
        materialized = []
        for route_index, (route, route_code, model, effort) in enumerate(ROSTER):
            record = read_schedule_record(run_root, run, wave, route_index)
            require(record["route"] == route and record["route_code"] == route_code and record["model_requested"] == model and record["reasoning_effort_requested"] == effort, "prepare-route")
            cell_raw = read_bound(PUBLIC_DIR + "/" + record["source_cell_path"], 0o644, 500_000, record["source_cell_file_bytes"], record["source_cell_file_sha256"])
            cell = parse(cell_raw)
            node = cell["nodes"][record["node_index"]]
            require(node["atom_id"] == record["atom_id"] and sha(canon(node)) == record["source_node_sha256"], "prepare-source")
            cell_start_wave = wave - record["node_index"]
            expected_dependency_waves = [cell_start_wave + int(dependency[1:]) for dependency in node["dependencies"]]
            require(record["dependency_waves"] == expected_dependency_waves and all(value < wave for value in expected_dependency_waves), "prepare-dependency-map")
            admission_raw, case_raw = materialize_row(record, cell, node, matrix_code)
            materialized.append((route, admission_raw, case_raw))
            prepared.append({
                "goal_objective": record["goal_objective"],
                "initial_routing": record["initial_routing"],
                "model": model,
                "reasoning_effort": effort,
                "route": route,
                "task_name": record["task_name"],
            })
        wave_root = run_root + "/rows/wave-" + wave_text
        make_directory(wave_root, run_root + "/rows")
        for route, admission_raw, case_raw in materialized:
            row_root = wave_root + "/" + route
            make_directory(row_root, wave_root)
            publish(row_root + "/admission.json", admission_raw, 0o444)
            publish(row_root + "/case.txt", case_raw, 0o444)
        sys.stdout.buffer.write(canon({"matrix_id": run["matrix_id"], "prepared": prepared, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-tool-event-atomic-wave-preparation-v1", "wave_index": wave}) + b"\n")
    finally:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)


def inspect(matrix_code, wave_text):
    require(re.fullmatch(r"[0-9]{4}", wave_text) is not None and 0 <= int(wave_text) < 5204, "inspect-wave")
    wave = int(wave_text)
    run_root, run, lock_fd = locked_run(matrix_code)
    try:
        results = []
        for route, route_code, model, effort in ROSTER:
            raw = read_bound(run_root + "/rows/wave-" + wave_text + "/" + route + "/result.txt", 0o444, 129)
            require(raw.endswith(b"\n") and raw.count(b"\n") == 1 and b"\r" not in raw, "inspect-result")
            results.append({"bytes": len(raw) - 1, "route": route, "sha256": sha(raw[:-1]), "utf8": raw[:-1].decode("utf-8")})
        sys.stdout.buffer.write(canon({"matrix_id": run["matrix_id"], "qualification_credit": 0, "results": results, "schema_id": "pw-r9-codex-native-goal-tool-event-atomic-wave-inspection-v1", "wave_index": wave}) + b"\n")
    finally:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)


def inventory_projection(root, excluded):
    records = []
    total_file_bytes = 0

    def visit(path, relative):
        nonlocal total_file_bytes
        directory = os.lstat(path)
        require(stat.S_ISDIR(directory.st_mode) and stat.S_IMODE(directory.st_mode) == 0o700 and directory.st_uid == os.getuid(), "inventory-directory:" + relative)
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
            expected_mode = 0o600 if child_relative == "run.lock" else 0o444
            raw = read_bound(entry.path, expected_mode, 30_000_000)
            records.append({"bytes": len(raw), "kind": "file", "mode": "{:04o}".format(expected_mode), "path": child_relative, "sha256": sha(raw)})
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


def seal_locked(run_root, run, wave_count, subject_task_count):
    require(sorted(os.listdir(run_root)) == ["rows", "run.json", "run.lock", "schedule.jsonl", "schedule_offsets.json"], "seal-root-state")
    require(sorted(os.listdir(run_root + "/rows")) == ["wave-{:04d}".format(index) for index in range(wave_count)], "seal-wave-inventory")
    goal_threads = set()
    task_paths = set()
    trace_hashes = set()
    results = 0
    for wave in range(wave_count):
        wave_root = run_root + "/rows/wave-{:04d}".format(wave)
        require(sorted(os.listdir(wave_root)) == [item[0] for item in ROSTER], "seal-route-inventory")
        for route, _, _, _ in ROSTER:
            load_result(run["matrix_id"], wave, route)
            receipt_raw = read_bound(wave_root + "/" + route + "/goal_receipt.json", 0o444, 4096)
            receipt = parse(receipt_raw)
            goal_threads.add(receipt["goal_thread_id"])
            task_paths.add(receipt["task_path"])
            trace_hashes.add(receipt["trace"]["sha256"])
            results += 1
    require(results == subject_task_count and len(goal_threads) == results and len(task_paths) == results and len(trace_hashes) == results, "seal-global-freshness")
    preterminal = inventory_projection(run_root, {"matrix_accounting.json", "matrix_terminal.json"})
    terminal = {
        "fresh_goal_threads": len(goal_threads),
        "fresh_task_paths": len(task_paths),
        "fresh_trace_hashes": len(trace_hashes),
        "matrix_id": run["matrix_id"],
        "preterminal_inventory": preterminal,
        "qualification_credit": 0,
        "row_count": results,
        "schema_id": "pw-r9-codex-native-goal-tool-event-atomic-matrix-terminal-v1",
        "status": "SEALED_EVIDENCE_ZERO_CREDIT_PENDING_INDEPENDENT_SCORE",
        "wave_count": wave_count,
    }
    terminal_raw = canon(terminal) + b"\n"
    publish(run_root + "/matrix_terminal.json", terminal_raw, 0o444)
    require(inventory_projection(run_root, {"matrix_accounting.json", "matrix_terminal.json"}) == preterminal, "seal-preterminal-drift")
    before_accounting = inventory_projection(run_root, {"matrix_accounting.json"})
    accounting = {
        "inventory_before_accounting": before_accounting,
        "matrix_id": run["matrix_id"],
        "matrix_terminal": {"bytes": len(terminal_raw), "sha256": sha(terminal_raw)},
        "qualification_credit": 0,
        "retry_count": 0,
        "schema_id": "pw-r9-codex-native-goal-tool-event-atomic-matrix-accounting-v1",
        "status": "SEALED_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFICATION",
        "subject_task_count": results,
    }
    accounting_raw = canon(accounting) + b"\n"
    publish(run_root + "/matrix_accounting.json", accounting_raw, 0o444)
    require(inventory_projection(run_root, {"matrix_accounting.json"}) == before_accounting, "seal-accounting-predecessor-drift")
    require(read_bound(run_root + "/matrix_accounting.json", 0o444, len(accounting_raw), len(accounting_raw), sha(accounting_raw)) == accounting_raw, "seal-accounting-reopen")
    sys.stdout.buffer.write(canon(accounting) + b"\n")


def seal(matrix_code):
    run_root, run, lock_fd = locked_run(matrix_code)
    try:
        require(run["wave_count"] == WAVE_COUNT and run["schedule"]["records"] == SUBJECT_TASK_COUNT, "seal-run-counts")
        seal_locked(run_root, run, WAVE_COUNT, SUBJECT_TASK_COUNT)
    finally:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)


def trace_items(events, event_type, payload_type=None):
    output = []
    for index, event in enumerate(events):
        payload = event.get("payload")
        if event.get("type") == event_type and isinstance(payload, dict) and (payload_type is None or payload.get("type") == payload_type):
            output.append((index, payload))
    return output


def tool_turn(payload):
    return payload.get("internal_chat_message_metadata_passthrough", {}).get("turn_id")


def read_trace(path):
    require(path.startswith(SESSION_ROOT + "/") and os.path.realpath(path) == path, "trace-path")
    raw = read_bound(path, 0o664, 2_000_000)
    require(raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    events = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        require(line != b"\n" and line.endswith(b"\n"), "trace-line:" + str(index))
        events.append(parse(line[:-1]))
    require(bool(events), "trace-empty")
    return raw, events


def attest(matrix_code, wave_text, route_code, trace_path):
    require(re.fullmatch(r"[0-9]{4}", wave_text) is not None and 0 <= int(wave_text) < 5204 and route_code in {item[1] for item in ROSTER}, "attest-address")
    wave = int(wave_text)
    run_root, run, lock_fd = locked_run(matrix_code)
    try:
        route, model, effort = next((item[0], item[2], item[3]) for item in ROSTER if item[1] == route_code)
        row_root = run_root + "/rows/wave-" + wave_text + "/" + route
        require(sorted(os.listdir(row_root)) == ["admission.json", "case.txt", "result.txt"], "attest-row-state")
        admission_raw = read_bound(row_root + "/admission.json", 0o444, 12_000)
        admission = parse(admission_raw)
        require(admission_raw == canon(admission) + b"\n" and admission["matrix_id"] == run["matrix_id"] and admission["wave_index"] == wave and admission["route_code"] == route_code, "attest-admission")
        case_raw = read_bound(row_root + "/case.txt", 0o444, 768, admission["case"]["bytes"], admission["case"]["sha256"])
        result_raw = read_bound(row_root + "/result.txt", 0o444, 129)
        require(result_raw.endswith(b"\n") and result_raw.count(b"\n") == 1 and b"\r" not in result_raw, "attest-result")
        result = result_raw[:-1].decode("utf-8")
        contract = admission["result_contract"]
        if contract["kind"] == "regex":
            require(contract["min_bytes"] <= len(result_raw) - 1 <= contract["max_bytes"] and re.fullmatch(contract["pattern"], result) is not None, "attest-result-regex")
        else:
            require(result in contract["values"], "attest-result-set")
        trace_raw, events = read_trace(trace_path)
        sessions = trace_items(events, "session_meta")
        require(len(sessions) == 1 and sessions[0][0] == 0, "attest-session-count")
        session = sessions[0][1]
        expected_task_path = "/root/" + admission["task_name"]
        spawn = session.get("source", {}).get("subagent", {}).get("thread_spawn", {})
        thread_id = session["id"]
        require(session.get("parent_thread_id") == PARENT_THREAD_ID and session.get("session_id") == PARENT_THREAD_ID, "attest-parent")
        require(session.get("agent_path") == expected_task_path and spawn.get("agent_path") == expected_task_path and spawn.get("parent_thread_id") == PARENT_THREAD_ID and spawn.get("depth") == 1, "attest-task")
        require(re.fullmatch(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", thread_id) is not None, "attest-thread")
        require(os.path.basename(trace_path).endswith("-" + thread_id + ".jsonl"), "attest-trace-thread")
        contexts = trace_items(events, "turn_context")
        require(len(contexts) == 1 and contexts[0][1]["model"] == model and contexts[0][1]["effort"] == effort, "attest-route")
        turn_id = contexts[0][1]["turn_id"]
        started = trace_items(events, "event_msg", "task_started")
        completed = trace_items(events, "event_msg", "task_complete")
        require(len(started) == 1 and started[0][1].get("turn_id") == turn_id and len(completed) == 1 and completed[0][1].get("turn_id") == turn_id and completed[0][0] == len(events) - 1, "attest-task-events")
        hidden_tools = [
            (index, event["payload"])
            for index, event in enumerate(events)
            if event.get("type") == "response_item"
            and isinstance(event.get("payload"), dict)
            and event["payload"].get("type") == "custom_tool_call"
        ]
        require(not hidden_tools, "attest-hidden-tool")
        calls = trace_items(events, "response_item", "function_call")
        require([payload["name"] for _, payload in calls] == ["create_goal", "exec_command", "exec_command", "update_goal"], "attest-call-order")
        require({tool_turn(payload) for _, payload in calls} == {turn_id}, "attest-one-turn")
        require(len({payload["call_id"] for _, payload in calls}) == 4, "attest-call-ids")
        create_i, create = calls[0]
        show_i, show = calls[1]
        record_i, record = calls[2]
        update_i, update = calls[3]
        require(parse(create["arguments"].encode("utf-8")) == {"objective": admission["goal_objective"]}, "attest-create")
        common = {"login": False, "max_output_tokens": 1000, "workdir": "/mnt/Cursor/PuppetMaster/tests/r9g7", "yield_time_ms": 10000}
        expected_show = dict(common, cmd="python3 -B capsule.py show {} {} {}".format(matrix_code, wave_text, route_code))
        expected_record = dict(common, cmd="python3 -B capsule.py record {} {} {} '{}'".format(matrix_code, wave_text, route_code, result))
        require(parse(show["arguments"].encode("utf-8")) == expected_show, "attest-show")
        require(parse(record["arguments"].encode("utf-8")) == expected_record, "attest-record")
        require(parse(update["arguments"].encode("utf-8")) == {"status": "complete"}, "attest-update")
        outputs = {payload["call_id"]: (index, payload) for index, payload in trace_items(events, "response_item", "function_call_output")}
        require(set(outputs) == {payload["call_id"] for _, payload in calls}, "attest-outputs")
        require(len(trace_items(events, "response_item", "function_call_output")) == 4 and {tool_turn(payload) for _, payload in outputs.values()} == {turn_id}, "attest-output-turn")
        active_i, active_output = outputs[create["call_id"]]
        active = parse(active_output["output"].encode("utf-8"))["goal"]
        require(active["threadId"] == thread_id and active["objective"] == admission["goal_objective"] and active["status"] == "active", "attest-active")
        show_o_i, show_output = outputs[show["call_id"]]
        require("Process exited with code 0" in show_output["output"] and show_output["output"].rsplit("Output:\n", 1)[1].encode("utf-8") == case_raw, "attest-show-output")
        record_o_i, record_output = outputs[record["call_id"]]
        require("Process exited with code 0" in record_output["output"] and record_output["output"].endswith("Output:\nDONE"), "attest-record-output")
        complete_i, complete_output = outputs[update["call_id"]]
        complete = parse(complete_output["output"].encode("utf-8"))["goal"]
        require(complete["threadId"] == thread_id and complete["objective"] == admission["goal_objective"] and complete["status"] == "complete", "attest-complete")
        require(isinstance(complete["tokensUsed"], int) and complete["tokensUsed"] > 0 and isinstance(complete["timeUsedSeconds"], int) and complete["timeUsedSeconds"] >= 0, "attest-usage")
        require(create_i < active_i < show_i < show_o_i < record_i < record_o_i < update_i < complete_i < completed[0][0], "attest-causal-order")
        for prior_wave in range(wave + 1):
            for prior_route, _, _, _ in ROSTER:
                prior = run_root + "/rows/wave-{:04d}/{}/goal_receipt.json".format(prior_wave, prior_route)
                if os.path.exists(prior):
                    prior_value = parse(read_bound(prior, 0o444, 4096))
                    require(prior_value["goal_thread_id"] != thread_id and prior_value["task_path"] != expected_task_path and prior_value["trace"]["sha256"] != sha(trace_raw), "attest-freshness")
        receipt = {
            "function_call_order": ["create_goal", "exec_command:show", "exec_command:record", "update_goal"],
            "goal": {"objective": admission["goal_objective"], "status": "complete", "time_used_seconds": complete["timeUsedSeconds"], "tokens_used": complete["tokensUsed"]},
            "goal_thread_id": thread_id,
            "matrix_id": run["matrix_id"],
            "model": model,
            "qualification_credit": 0,
            "reasoning_effort": effort,
            "result": {"bytes": len(result_raw) - 1, "sha256": sha(result_raw[:-1])},
            "route": route,
            "schema_id": "pw-r9-codex-native-goal-tool-event-atomic-goal-receipt-v1",
            "status": "PASS_FRESH_NATIVE_GOAL_SINGLE_ATOM_ZERO_CREDIT",
            "task_path": expected_task_path,
            "trace": {"bytes": len(trace_raw), "mode": "0664", "path": trace_path, "sha256": sha(trace_raw)},
            "turn_count": 1,
            "wave_index": wave,
        }
        publish(row_root + "/goal_receipt.json", canon(receipt) + b"\n", 0o444)
        sys.stdout.buffer.write(canon(receipt) + b"\n")
    finally:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)


def check_only(matrix_code):
    _, public = validate_static_bindings()
    records = build_schedule(matrix_code, public)
    schedule_raw, offsets_raw = schedule_bytes(records)
    max_initial = max(len(item["initial_routing"].encode("utf-8")) for item in records)
    output = {
        "capsule_writes": 0,
        "matrix_code": matrix_code,
        "max_initial_routing_bytes": max_initial,
        "qualification_credit": 0,
        "schedule": {"bytes": len(schedule_raw), "records": len(records), "sha256": sha(schedule_raw)},
        "schedule_offsets": {"bytes": len(offsets_raw), "sha256": sha(offsets_raw)},
        "schema_id": "pw-r9-codex-native-goal-tool-event-atomic-materializer-check-v1",
        "status": "PASS_ZERO_CALLS_ZERO_WRITES",
        "subject_calls": 0,
    }
    sys.stdout.buffer.write(canon(output) + b"\n")


def main():
    try:
        require(os.getcwd() == "/mnt/Cursor/PuppetMaster/tests/r9g7", "cwd")
        if len(sys.argv) == 3 and sys.argv[1] == "check" and sys.argv[2] in MATRICES:
            check_only(sys.argv[2])
        elif len(sys.argv) == 3 and sys.argv[1] == "begin" and sys.argv[2] in MATRICES:
            begin(sys.argv[2])
        elif len(sys.argv) == 4 and sys.argv[1] == "prepare" and sys.argv[2] in MATRICES:
            prepare(sys.argv[2], sys.argv[3])
        elif len(sys.argv) == 4 and sys.argv[1] == "inspect" and sys.argv[2] in MATRICES:
            inspect(sys.argv[2], sys.argv[3])
        elif len(sys.argv) == 3 and sys.argv[1] == "seal" and sys.argv[2] in MATRICES:
            seal(sys.argv[2])
        elif len(sys.argv) == 6 and sys.argv[1] == "attest" and sys.argv[2] in MATRICES:
            attest(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
        else:
            raise Invalid("cli")
        return 0
    except (Invalid, OSError, KeyError, IndexError, TypeError, ValueError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        sys.stderr.write("FAIL:" + str(exc) + "\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
