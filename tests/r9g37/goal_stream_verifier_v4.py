#!/usr/bin/env python3
import hashlib
import importlib.util
import json
import math
import os
import re
import stat
import sys

sys.dont_write_bytecode = True
SELF = "/mnt/Cursor/PuppetMaster/tests/r9g37/goal_stream_verifier_v4.py"
RUNTIME = "/mnt/Cursor/PuppetMaster/tests/r9g37/goal_stream_runtime_v4.py"
ATTESTOR = "/mnt/Cursor/PuppetMaster/tests/r9g36/goal_db_attestor.py"
ATTESTOR_BYTES = 9118
ATTESTOR_SHA256 = "274b818da6ae51fb7c01608c4b3aca2e0d3f69a74bfb9815db816aa57b38bcc6"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-streamed-row-v4/SKILL.md"
SKILL_BYTES = 2345
SKILL_SHA256 = "4ca3bd2f77262905597c68604754ba09146888f07235d3e12aa36d57af3e8c58"
SOURCE_ROOT = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/codex_native_goal_bite_matrix_pair_005_006_inputs_v3"
SOURCE_MANIFEST = SOURCE_ROOT + "/manifest.json"
SOURCE_MANIFEST_BYTES = 243312
SOURCE_MANIFEST_SHA256 = "a0da41236655d4352f1aa5074673c2296ff2a4077dd26b8f315e60e80516cd87"
CANARY_SUCCESS = "/mnt/Cursor/PuppetMaster/tests/r9g36/canary_006_success_receipt.json"
CANARY_SUCCESS_BYTES = 3911
CANARY_SUCCESS_SHA256 = "0973bbc5aeeb352c5d8f8aaf9461e3d9034326ba96a130edd0b4268306c56c8a"
ROOT_PREFIX = "/mnt/Cursor/PuppetMaster/tests/r9g37/"
HEX = re.compile(r"^[0-9a-f]{64}$")
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
ROW_ID = re.compile(r"^row-[0-9]{3}$")
TASK = re.compile(r"^r9_gds4_[0-9a-f]{64}$")
DIRECT = re.compile(r"Chunk ID: [0-9a-f]+\nWall time: (?:0|[1-9][0-9]*)(?:\.[0-9]+)? seconds\nProcess exited with code (-?[0-9]+)\nOriginal token count: [0-9]+\nOutput:\n([\s\S]*)")
ROSTER = {
    "alpha": {"model": "gpt-5.4-mini", "reasoning_effort": "xhigh", "source_route": "slot-alpha"},
    "bravo": {"model": "gpt-5.4-mini", "reasoning_effort": "medium", "source_route": "slot-bravo"},
    "charlie": {"model": "gpt-5.6-luna", "reasoning_effort": "medium", "source_route": "slot-charlie"},
}


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def pairs(items):
    value = {}
    for key, item in items:
        require(key not in value, "duplicate-key:" + key)
        value[key] = item
    return value


def finite(value):
    if isinstance(value, float):
        return math.isfinite(value)
    if isinstance(value, list):
        return all(finite(item) for item in value)
    if isinstance(value, dict):
        return all(isinstance(key, str) and finite(item) for key, item in value.items())
    return True


def parse(raw):
    value = json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda token: (_ for _ in ()).throw(Invalid("nonfinite:" + token)))
    require(finite(value), "finite")
    return value


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"), sort_keys=True).encode("utf-8") + b"\n"


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def read_exact(path, mode, size=None, digest=None, cap=None):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode), "kind:" + path)
    require(stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1, "custody:" + path)
    require(size is None or before.st_size == size, "size:" + path)
    require(cap is None or before.st_size <= cap, "cap:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw))
            require(bool(part), "short:" + path)
            raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
        after = os.fstat(fd)
    finally:
        os.close(fd)
    current = os.lstat(path)
    identity = (before.st_dev, before.st_ino, before.st_size)
    require(identity == (after.st_dev, after.st_ino, after.st_size) == (current.st_dev, current.st_ino, current.st_size), "race:" + path)
    require(digest is None or sha(raw) == digest, "digest:" + path)
    return raw


def read_json(path, mode=0o444, cap=2000000):
    raw = read_exact(path, mode, cap=cap)
    value = parse(raw)
    require(raw == canonical(value), "canonical:" + path)
    return raw, value


def directory(path):
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "directory:" + path)


def binding(path, mode=0o644):
    raw = read_exact(path, mode, cap=2000000)
    return {"bytes": len(raw), "mode": format(mode, "04o"), "path": path, "sha256": sha(raw)}


def validate_binding(item):
    require(set(item) == {"bytes", "mode", "path", "sha256"} and type(item["bytes"]) is int and item["bytes"] > 0 and item["mode"] in {"0444", "0644"} and os.path.isabs(item["path"]) and os.path.realpath(item["path"]) == item["path"] and HEX.fullmatch(item["sha256"] or ""), "binding")
    read_exact(item["path"], int(item["mode"], 8), item["bytes"], item["sha256"])


def load_plan(path):
    require(os.path.isabs(path) and os.path.realpath(path) == path and path.startswith(ROOT_PREFIX), "plan-path")
    raw = read_exact(path, 0o444, cap=1000000)
    plan = parse(raw)
    require(raw == canonical(plan) and set(plan) == {"authority", "bindings", "experiment", "failure_contract", "prior_clean_matrix", "qualification", "rows", "schema_id", "status"}, "plan")
    require(plan["schema_id"] == "pw-r9-codex-native-goal-db-stream-v4-plan-v1" and plan["status"] == "FROZEN_GOAL_FIRST_STREAMED_SUBJECT_ZERO_CREDIT", "plan-id")
    require(plan["authority"] == {"empirical_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0}, "authority")
    require(plan["failure_contract"] == {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0}, "failure")
    require(set(plan["bindings"]) == {"attestor", "builder", "canary_006_success", "offline_verifier", "preflight", "runtime", "skill", "source_manifest", "v2_failure", "v3_failure"}, "bindings")
    for item in plan["bindings"].values():
        validate_binding(item)
    require(plan["bindings"]["attestor"] == binding(ATTESTOR) and plan["bindings"]["offline_verifier"] == binding(SELF) and plan["bindings"]["runtime"] == binding(RUNTIME) and plan["bindings"]["skill"] == binding(SKILL) and plan["bindings"]["source_manifest"] == binding(SOURCE_MANIFEST) and plan["bindings"]["canary_006_success"] == binding(CANARY_SUCCESS), "own-bindings")
    qualification = plan["qualification"]
    require(set(qualification) == {"clean_full_matrix_streak_before", "credit", "required_consecutive_clean_full_matrices"} and qualification["credit"] == "0/2" and qualification["required_consecutive_clean_full_matrices"] == 2 and qualification["clean_full_matrix_streak_before"] in {0, 1}, "qualification")
    exp = plan["experiment"]
    require(set(exp) == {"id", "kind", "matrix_ordinal", "max_in_flight", "parent_goal_thread_id", "root", "row_count", "socket_name", "source_matrix_id", "stop_at_first_nonpass"}, "experiment")
    require((exp["kind"], exp["matrix_ordinal"], exp["row_count"]) in {("canary", 0, 3), ("matrix", 1, 291), ("matrix", 2, 291)} and exp["max_in_flight"] == 3 and exp["socket_name"] == "goal_chunks.sock" and exp["source_matrix_id"] == "codex-native-goal-bite-matrix-006" and exp["stop_at_first_nonpass"] is True and UUID.fullmatch(exp["parent_goal_thread_id"] or ""), "experiment-values")
    require(os.path.isabs(exp["root"]) and os.path.realpath(exp["root"]) == exp["root"] and exp["root"].startswith(ROOT_PREFIX), "root")
    expected_experiments = {0: ("r9g37-v4-canary-004", ROOT_PREFIX + "run-stream-canary-004"), 1: ("r9g37-v4-matrix-001", ROOT_PREFIX + "run-stream-v4-matrix-001"), 2: ("r9g37-v4-matrix-002", ROOT_PREFIX + "run-stream-v4-matrix-002")}
    require((exp["id"], exp["root"]) == expected_experiments[exp["matrix_ordinal"]], "experiment-identity")
    if exp["matrix_ordinal"] < 2:
        require(plan["prior_clean_matrix"] is None and qualification["clean_full_matrix_streak_before"] == 0, "prior-clean-matrix")
    else:
        validate_binding(plan["prior_clean_matrix"])
        require(plan["prior_clean_matrix"]["mode"] == "0644" and plan["prior_clean_matrix"]["path"] == ROOT_PREFIX + "stream_matrix_001_success_receipt_v4.json" and qualification["clean_full_matrix_streak_before"] == 1, "prior-clean-matrix")
    rows = plan["rows"]
    require(isinstance(rows, list) and len(rows) == exp["row_count"], "rows")
    seen = {"index": set(), "row_id": set(), "task_name": set(), "task_path": set()}
    route_counts = {key: 0 for key in ROSTER}
    for row in rows:
        require(set(row) == {"agent_role", "cell", "cell_index", "chunk_count", "expected_result", "goal_objective", "index", "model", "reasoning_effort", "route", "row_id", "source_row", "subject", "task_name", "task_path"}, "row-shape")
        require(type(row["index"]) is int and row["row_id"] == "row-" + format(row["index"], "03d") and ROW_ID.fullmatch(row["row_id"] or "") and row["route"] in ROSTER, "row-id")
        roster = ROSTER[row["route"]]
        require(row["model"] == roster["model"] and row["reasoning_effort"] == roster["reasoning_effort"] and TASK.fullmatch(row["task_name"] or "") and row["task_path"] == "/root/" + row["task_name"], "row-roster")
        require(row["agent_role"] == "default" and type(row["chunk_count"]) is int and 1 <= row["chunk_count"] <= 64 and type(row["cell_index"]) is int and 0 <= row["cell_index"] < 97 and isinstance(row["cell"], str) and isinstance(row["goal_objective"], str) and 1 <= len(row["goal_objective"].encode()) <= 128, "row-values")
        for name in ("subject", "expected_result"):
            item = row[name]
            require(set(item) == {"bytes", "sha256"} and type(item["bytes"]) is int and item["bytes"] > 0 and HEX.fullmatch(item["sha256"] or ""), "commitment")
        validate_binding(row["source_row"])
        require(row["source_row"]["mode"] == "0644" and row["source_row"]["path"].startswith(SOURCE_ROOT + "/rows/codex-native-goal-bite-matrix-006/"), "source-path")
        token = {0: "c004", 1: "m001", 2: "m002"}[exp["matrix_ordinal"]]
        require(row["goal_objective"] == "R9G37V4|" + token + "|" + row["row_id"] + "|" + row["subject"]["sha256"], "goal-objective")
        nonce = sha(("r9g37|" + exp["id"] + "|" + row["row_id"] + "|" + row["subject"]["sha256"] + "|once").encode("utf-8"))
        require(row["task_name"] == "r9_gds4_" + nonce, "task-name")
        for name in seen:
            require(row[name] not in seen[name], "duplicate:" + name)
            seen[name].add(row[name])
        route_counts[row["route"]] += 1
    require([row["index"] for row in rows] == sorted(row["index"] for row in rows), "row-order")
    if exp["kind"] == "matrix":
        require([row["index"] for row in rows] == list(range(291)) and route_counts == {"alpha": 97, "bravo": 97, "charlie": 97}, "matrix-schedule")
    else:
        require([row["index"] for row in rows] == [0, 97, 194] and route_counts == {"alpha": 1, "bravo": 1, "charlie": 1}, "canary-schedule")
    return raw, plan


def source_payloads(row):
    raw = read_exact(row["source_row"]["path"], 0o644, row["source_row"]["bytes"], row["source_row"]["sha256"], cap=100000)
    source = parse(raw)
    require(raw == canonical(source) and source["schema_id"] == "pw-r9-codex-native-goal-bite-matrix-row-v3" and source["run_id"] == "codex-native-goal-bite-matrix-006", "source")
    roster = ROSTER[row["route"]]
    require(source["index"] == row["index"] and source["row_id"] == row["row_id"] and source["cell"] == row["cell"] and source["cell_index"] == row["cell_index"] and source["route"] == roster["source_route"] and source["model_requested"] == row["model"] and source["reasoning_effort_requested"] == row["reasoning_effort"], "source-identity")
    require(source["subject"] == {"bytes": row["subject"]["bytes"], "chunk_count": row["chunk_count"], "sha256": row["subject"]["sha256"], "source_path": "subjects/cell-" + format(row["cell_index"], "03d") + ".txt"}, "source-subject")
    require(source["expected_output_bytes"] == row["expected_result"]["bytes"] and source["expected_output_sha256"] == row["expected_result"]["sha256"], "source-expected")
    chunks = source["prompt_sequence"]["subject_chunks"]
    require(len(chunks) == row["chunk_count"], "chunk-count")
    payloads = []
    for index, item in enumerate(chunks):
        _, payload = item["text"].encode("utf-8").split(b"\n", 1)
        require(item["chunk_index"] == index and item["payload_bytes"] == len(payload) and item["payload_sha256"] == sha(payload) and 1 <= len(payload) <= 170, "payload")
        payloads.append(payload)
    subject = b"".join(payloads)
    require(len(subject) == row["subject"]["bytes"] and sha(subject) == row["subject"]["sha256"], "subject-reconstruct")
    return payloads, subject


def expected_prompt(row, workdir):
    raw = ("Use $r9-goal-streamed-row-v4. Exact objective=" + json.dumps(row["goal_objective"]) + "; reader workdir=" + json.dumps(workdir) + "; slice count=" + format(row["chunk_count"], "03d") + ", indexes 000.." + format(row["chunk_count"] - 1, "03d") + ". No subject bytes, criteria, options, or answer are in this message.").encode("utf-8")
    require(len(raw) <= 512, "prompt-size")
    return raw


def expected_reader(socket_path, row, payloads):
    sizes = [len(item) for item in payloads]
    digests = [sha(item) for item in payloads]
    source = '''#!/usr/bin/env python3
import hashlib,json,socket,sys
ROW={row_id!r}; PATH={socket_path!r}; SIZES={sizes!r}; DIGESTS={digests!r}
if len(sys.argv)!=3 or len(sys.argv[2])!=3 or not sys.argv[2].isdigit(): raise SystemExit(2)
thread=sys.argv[1]; index=int(sys.argv[2])
if index<0 or index>=len(SIZES): raise SystemExit(2)
request=json.dumps({{"chunk_index":index,"row_id":ROW,"schema_id":"pw-r9-codex-native-goal-db-stream-v4-chunk-request-v1","thread_id":thread}},sort_keys=True,separators=(",",":")).encode()+b"\\n"
channel=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM); channel.settimeout(10.0); channel.connect(PATH); channel.sendall(request); channel.shutdown(socket.SHUT_WR)
raw=b""
while True:
 part=channel.recv(512)
 if not part: break
 raw+=part
channel.close()
if len(raw)!=SIZES[index] or hashlib.sha256(raw).hexdigest()!=DIGESTS[index]: raise SystemExit(3)
sys.stdout.buffer.write(raw)
'''.format(row_id=row["row_id"], socket_path=socket_path, sizes=sizes, digests=digests)
    return source.encode("utf-8")


def load_attestor():
    read_exact(ATTESTOR, 0o644, ATTESTOR_BYTES, ATTESTOR_SHA256)
    spec = importlib.util.spec_from_file_location("r9g37_verify_attestor", ATTESTOR)
    require(spec is not None and spec.loader is not None, "attestor-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    require(module.__all__ == ("Invalid", "active", "canonical", "parse", "terminal_absent"), "attestor-api")
    return module


def body(payload):
    output = payload.get("output")
    if payload.get("type") == "custom_tool_call_output":
        require(isinstance(output, list) and len(output) == 2 and all(isinstance(item, dict) and set(item) == {"text", "type"} and item["type"] == "input_text" for item in output), "wrapped-output")
        return output[1]["text"]
    require(payload.get("type") == "function_call_output" and isinstance(output, str), "direct-output")
    match = DIRECT.fullmatch(output)
    if match:
        require(int(match.group(1)) == 0, "exec-code")
        return match.group(2)
    return output


def wrapped_name(item):
    source = item.get("input")
    require(isinstance(source, str) and source.count("tools.") == 1 and not any(token in source for token in ("tools[", "ALL_TOOLS", "globalThis", "eval(", "Function(", "store(", "load(", "notify(", "Promise.all")), "wrapped-source")
    names = re.findall(r"tools\.(exec_command|create_goal|update_goal)\s*\(", source)
    require(len(names) == 1, "wrapped-name")
    return names[0]


def arguments(item):
    source = item.get("arguments")
    require(isinstance(source, str), "arguments")
    value = parse(source.encode("utf-8"))
    require(isinstance(value, dict), "arguments-shape")
    return value


def pregoal(item, direct, workdir):
    if direct:
        args = arguments(item)
        require(item.get("name") == "exec_command" and isinstance(args.get("cmd"), str) and args.get("workdir") in {None, "/mnt/Cursor/PuppetMaster"}, "pregoal-tool")
        source = args["cmd"]
    else:
        require(wrapped_name(item) == "exec_command", "pregoal-tool")
        source = item["input"]
    require("chunk.py" not in source and workdir not in source and SOURCE_ROOT not in source, "pregoal-subject-surface")
    require(SKILL in source or "/home/sittingmongoose/.codex/memories/" in source, "pregoal-scope")


def goal_call(item, direct, objective):
    if direct:
        require(item.get("name") == "create_goal" and arguments(item) == {"objective": objective}, "goal-call")
    else:
        require(wrapped_name(item) == "create_goal" and json.dumps(objective) in item["input"], "goal-call")


def chunk_call(item, direct, thread_id, index, workdir):
    command = "python3 -B chunk.py " + thread_id + " " + format(index, "03d")
    if direct:
        args = arguments(item)
        require(item.get("name") == "exec_command" and {"cmd", "max_output_tokens", "workdir", "yield_time_ms"} <= set(args) <= {"cmd", "login", "max_output_tokens", "tty", "workdir", "yield_time_ms"} and args.get("cmd") == command and args.get("workdir") == workdir and args.get("yield_time_ms") == 30000 and args.get("max_output_tokens") == 256 and all(type(args[name]) is bool for name in set(args) & {"login", "tty"}), "chunk-required-projection:" + format(index, "03d"))
    else:
        require(wrapped_name(item) == "exec_command", "chunk-tool")
        source = item["input"]
        require(not re.search(r"\b(?:for|while)\s*\(", source) and ".map(" not in source and source.count("chunk.py") == 1, "chunk-batch")
        require(command in source and workdir in source and "yield_time_ms" in source and "30000" in source and "max_output_tokens" in source and "256" in source, "chunk-call:" + format(index, "03d"))


def update_call(item, direct):
    if direct:
        require(item.get("name") == "update_goal" and arguments(item) == {"status": "complete"}, "update-call")
    else:
        require(wrapped_name(item) == "update_goal" and "complete" in item["input"], "update-call")


def trace_result(raw, row, active, payloads, subject, workdir):
    require(raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    lines = raw.splitlines(keepends=True)
    events = []
    for index, line in enumerate(lines):
        require(line.endswith(b"\n") and line.count(b"\n") == 1, "trace-line:" + str(index))
        event = parse(line)
        require(set(event) == {"payload", "timestamp", "type"}, "trace-event")
        events.append(event)
    thread_id = active["attestation"]["goal"]["thread_id"]
    metas = [event["payload"] for event in events if event["type"] == "session_meta"]
    require(len(metas) == 1 and metas[0].get("id") == thread_id and metas[0].get("agent_path") == row["task_path"] and metas[0].get("agent_role") == "default", "session")
    dc = [(i, e["payload"]) for i, e in enumerate(events) if e["type"] == "response_item" and e["payload"].get("type") == "function_call"]
    do = [(i, e["payload"]) for i, e in enumerate(events) if e["type"] == "response_item" and e["payload"].get("type") == "function_call_output"]
    wc = [(i, e["payload"]) for i, e in enumerate(events) if e["type"] == "response_item" and e["payload"].get("type") == "custom_tool_call"]
    wo = [(i, e["payload"]) for i, e in enumerate(events) if e["type"] == "response_item" and e["payload"].get("type") == "custom_tool_call_output"]
    require(not (dc and wc) and not (do and wo), "mixed")
    direct = bool(dc)
    calls, outputs = (dc, do) if direct else (wc, wo)
    require(calls and len(calls) == len(outputs), "tool-count")
    names = [item.get("name") if direct else wrapped_name(item) for _, item in calls]
    require(names.count("create_goal") == 1 and names.count("update_goal") == 1, "goal-cardinality")
    create_position = names.index("create_goal")
    require(create_position >= 1 and names[create_position + 1:] == ["exec_command"] * row["chunk_count"] + ["update_goal"], "post-goal-sequence")
    for _, item in calls[:create_position]:
        pregoal(item, direct, workdir)
    goal_call(calls[create_position][1], direct, row["goal_objective"])
    for index, (_, item) in enumerate(calls[create_position + 1:-1]):
        chunk_call(item, direct, thread_id, index, workdir)
    update_call(calls[-1][1], direct)
    create_event_index = calls[create_position][0]
    require(all(payload not in b"".join(lines[:create_event_index]) for payload in payloads), "subject-before-goal")
    require(not any(i > create_event_index and event["type"] == "response_item" and event["payload"].get("type") == "web_search_call" for i, event in enumerate(events)), "post-goal-web")
    outputs_by_call = {item["call_id"]: (index, body(item)) for index, item in outputs}
    bodies = []
    for call_index, call in calls:
        require(call["call_id"] in outputs_by_call and call_index < outputs_by_call[call["call_id"]][0], "pair")
        bodies.append(outputs_by_call[call["call_id"]][1])
    require(read_exact(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256).decode("utf-8") in bodies[:create_position], "skill")
    active_goal = parse(bodies[create_position].encode("utf-8"))["goal"]
    complete_goal = parse(bodies[-1].encode("utf-8"))["goal"]
    require(active_goal["threadId"] == thread_id and active_goal["objective"] == row["goal_objective"] and active_goal["status"] == "active", "active-output")
    require(complete_goal["threadId"] == thread_id and complete_goal["objective"] == row["goal_objective"] and complete_goal["status"] == "complete", "complete-output")
    require(b"".join(item.encode("utf-8") for item in bodies[create_position + 1:-1]) == subject, "subject-output")
    finals = [event["payload"] for event in events if event["type"] == "response_item" and event["payload"].get("type") == "message" and event["payload"].get("phase") == "final_answer"]
    require(len(finals) == 1 and len(finals[0].get("content", [])) == 1 and finals[0]["content"][0].get("type") == "output_text", "final")
    result = finals[0]["content"][0].get("text")
    require(isinstance(result, str), "result-type")
    result_raw = result.encode("utf-8")
    require(len(result_raw) == row["expected_result"]["bytes"] and sha(result_raw) == row["expected_result"]["sha256"], "expected")
    completes = [(i, event["payload"]) for i, event in enumerate(events) if event["type"] == "event_msg" and event["payload"].get("type") == "task_complete"]
    require(len(completes) == 1 and completes[0][0] == len(events) - 1 and completes[0][1].get("last_agent_message") == result, "task-complete")
    return result_raw, active_goal, complete_goal


def inventory(root):
    values = []
    for current, dirs, files in os.walk(root, topdown=True, followlinks=False):
        dirs.sort(); files.sort(); directory(current)
        values.append({"kind": "d", "path": os.path.relpath(current, root)})
        for name in files:
            path = os.path.join(current, name)
            info = os.lstat(path)
            raw = read_exact(path, stat.S_IMODE(info.st_mode), cap=6000000)
            values.append({"bytes": len(raw), "kind": "f", "mode": stat.S_IMODE(info.st_mode), "path": os.path.relpath(path, root), "sha256": sha(raw)})
    return sha(canonical(values))


def validate_admission(path, plan_path, plan_raw, plan):
    raw = read_exact(path, 0o644, cap=100000)
    value = parse(raw)
    require(raw == canonical(value) and set(value) == {"authority", "bindings", "checks", "constraints", "schema_id", "status"}, "admission")
    require(value["schema_id"] == "pw-r9-codex-native-goal-db-stream-v4-launch-admission-v1" and value["status"] == "PASS_EXACT_ONE_FRESH_GOAL_FIRST_STREAMED_RUN_ZERO_CREDIT", "admission-id")
    authority = {"canary_launch": plan["experiment"]["kind"] == "canary", "matrix_launch": plan["experiment"]["kind"] == "matrix", "qualification": False, "qualification_credit": 0, "release": False}
    require(value["authority"] == authority and value["constraints"] == {"explicit_agent_role": "default", "max_in_flight": 3, "no_subject_before_active_goal": True, "pre_goal_control_bootstrap": "BOUNDED_NON_SUBJECT_ONLY", "stop_at_first_nonpass": True, "subject_slice_max_bytes": 170, "two_clean_full_matrices_required": True}, "admission-values")
    require(value["checks"] == {"agent_role_rows": len(plan["rows"]), "frozen_trace_rows_checked": 3, "goal_objective_max_bytes": max(len(row["goal_objective"].encode("utf-8")) for row in plan["rows"]), "parent_mode": "0755", "plan_rows": len(plan["rows"]), "source_corpus_rows_checked": 291, "source_rows_reconstructed": len(plan["rows"]), "spawn_prompt_max_bytes": max(len(expected_prompt(row, os.path.join(plan["experiment"]["root"], "rows", row["row_id"]))) for row in plan["rows"]), "subject_slice_max_bytes": 170}, "admission-checks")
    require(set(value["bindings"]) == {"canary_006_success", "plan", "preflight", "runtime", "skill", "source_manifest", "v2_failure", "v3_failure"}, "admission-bindings")
    for item in value["bindings"].values():
        validate_binding(item)
    require(value["bindings"]["plan"] == {"bytes": len(plan_raw), "mode": "0444", "path": plan_path, "sha256": sha(plan_raw)} and value["bindings"]["runtime"] == binding(RUNTIME) and value["bindings"]["skill"] == binding(SKILL) and value["bindings"]["source_manifest"] == binding(SOURCE_MANIFEST) and value["bindings"]["canary_006_success"] == binding(CANARY_SUCCESS), "admission-bind")
    return raw


def verify(plan_path, plan_raw, plan):
    root = plan["experiment"]["root"]
    directory(root)
    before = inventory(root)
    require(not os.path.lexists(os.path.join(root, plan["experiment"]["socket_name"])), "socket-present")
    terminal_name = "canary_terminal.json" if plan["experiment"]["kind"] == "canary" else "matrix_terminal.json"
    require(set(os.listdir(root)) == {"accounting.json", "broker_ready.json", "broker_terminal.json", terminal_name, "prepared.json", "rows"}, "root-inventory")
    _, prepared = read_json(os.path.join(root, "prepared.json"), cap=100000)
    admission_path = prepared["admission"]["path"]
    admission_raw = validate_admission(admission_path, plan_path, plan_raw, plan)
    require(prepared == {"admission": {"bytes": len(admission_raw), "path": admission_path, "sha256": sha(admission_raw)}, "qualification_credit": 0, "row_count": len(plan["rows"]), "schema_id": "pw-r9-codex-native-goal-db-stream-v4-prepared-v1", "status": "PASS_PREPARED_ALL_ROWS_WITH_ZERO_SUBJECT_BYTES_IN_WORKDIRS"}, "prepared")
    _, broker_ready = read_json(os.path.join(root, "broker_ready.json"), cap=100000)
    require(broker_ready["expected_connections"] == sum(row["chunk_count"] for row in plan["rows"]) and broker_ready["status"] == "READY_PRIVATE_SOURCE_PAYLOADS_IN_MEMORY_ZERO_CREDIT", "broker-ready")
    _, broker_terminal = read_json(os.path.join(root, "broker_terminal.json"), cap=100000)
    require(broker_terminal["completed_rows"] == sorted(row["row_id"] for row in plan["rows"]) and broker_terminal["connection_count"] == sum(row["chunk_count"] for row in plan["rows"]) and broker_terminal["row_count"] == len(plan["rows"]) and broker_terminal["status"] == "PASS_ALL_ROWS_STREAMED_AFTER_ACTIVE_GOAL_ATTESTATION_ZERO_CREDIT", "broker-terminal")
    _, old_canary = read_json(CANARY_SUCCESS, 0o644, cap=100000)
    prior_threads = {item["goal_thread_id"] for item in old_canary["evidence"]["rows"]}
    attestor = load_attestor()
    seen_threads = set()
    identities = []
    route_counts = {key: 0 for key in ROSTER}
    rows_root = os.path.join(root, "rows")
    directory(rows_root)
    require(set(os.listdir(rows_root)) == {row["row_id"] for row in plan["rows"]}, "rows-inventory")
    for row in plan["rows"]:
        workdir = os.path.join(rows_root, row["row_id"])
        directory(workdir)
        require(set(os.listdir(workdir)) == {"active_goal.json", "chunk.py", "delivery_terminal.json", "launch_intent.json", "predeclaration.json", "result.txt", "settlement.json", "spawn_prompt.txt", "terminal_goal.json", "terminal_trace.jsonl"}, "row-inventory:" + row["row_id"])
        payloads, subject = source_payloads(row)
        prompt = read_exact(os.path.join(workdir, "spawn_prompt.txt"), 0o444, cap=512)
        require(prompt == expected_prompt(row, workdir), "spawn-prompt:" + row["row_id"])
        reader = read_exact(os.path.join(workdir, "chunk.py"), 0o444, cap=8000)
        require(reader == expected_reader(os.path.join(root, plan["experiment"]["socket_name"]), row, payloads) and b"subject" not in reader.lower(), "reader:" + row["row_id"])
        _, launch = read_json(os.path.join(workdir, "launch_intent.json"), cap=10000)
        require(launch["row_id"] == row["row_id"] and launch["task_path"] == row["task_path"] and launch["agent_role"] == "default" and launch["status"] == "CLAIMED_CONSUMED_NO_RETRY", "launch:" + row["row_id"])
        _, active = read_json(os.path.join(workdir, "active_goal.json"), cap=50000)
        proof = active["attestation"]
        thread_id = proof["goal"]["thread_id"]
        require(thread_id not in seen_threads and thread_id not in prior_threads and proof["goal"]["status"] == "active" and proof["goal"]["objective"] == row["goal_objective"] and active["row_id"] == row["row_id"] and active["status"] == "ACTIVE_ATTESTED_BEFORE_FIRST_SUBJECT_SLICE", "active:" + row["row_id"])
        seen_threads.add(thread_id)
        _, delivery = read_json(os.path.join(workdir, "delivery_terminal.json"), cap=10000)
        require(delivery == {"chunk_count": row["chunk_count"], "goal_thread_id": thread_id, "qualification_credit": 0, "row_id": row["row_id"], "schema_id": "pw-r9-codex-native-goal-db-stream-v4-delivery-terminal-v1", "status": "PASS_ALL_SUBJECT_SLICES_RELEASED_ONLY_WHILE_GOAL_ACTIVE", "subject": row["subject"]}, "delivery:" + row["row_id"])
        trace = read_exact(os.path.join(workdir, "terminal_trace.jsonl"), 0o444, cap=6000000)
        result, active_output, complete_output = trace_result(trace, row, active, payloads, subject, workdir)
        require(read_exact(os.path.join(workdir, "result.txt"), 0o444, len(result), sha(result), cap=8192) == result, "result-copy")
        terminal = attestor.terminal_absent(thread_id, plan["experiment"]["parent_goal_thread_id"], row["task_path"], row["model"], row["reasoning_effort"])
        _, terminal_file = read_json(os.path.join(workdir, "terminal_goal.json"), cap=100000)
        require(terminal_file == {"active_goal_output": active_output, "complete_goal_output": complete_output, "database_terminal": terminal, "qualification_credit": 0, "row_id": row["row_id"], "schema_id": "pw-r9-codex-native-goal-db-stream-v4-terminal-receipt-v1", "status": "PASS_GOAL_ACTIVE_THROUGH_ALL_SUBJECT_SLICES_AND_COMPLETE"}, "terminal:" + row["row_id"])
        _, settlement = read_json(os.path.join(workdir, "settlement.json"), cap=10000)
        require(settlement == {"chunk_count": row["chunk_count"], "goal_thread_id": thread_id, "qualification_credit": 0, "result": {"bytes": len(result), "sha256": sha(result)}, "row_id": row["row_id"], "schema_id": "pw-r9-codex-native-goal-db-stream-v4-settlement-v1", "status": "PASS_PROTOCOL_ZERO_CREDIT", "trace": {"bytes": len(trace), "sha256": sha(trace)}}, "settlement:" + row["row_id"])
        identities.append({"bytes": len(result), "row_id": row["row_id"], "sha256": sha(result)})
        route_counts[row["route"]] += 1
    result_root = sha(canonical(identities))
    _, terminal = read_json(os.path.join(root, terminal_name), cap=100000)
    if plan["experiment"]["kind"] == "canary":
        expected_terminal = {"experiment_id": plan["experiment"]["id"], "fresh_goal_count": len(plan["rows"]), "qualification_credit": 0, "result_identity_root": result_root, "row_count": len(plan["rows"]), "schema_id": "pw-r9-codex-native-goal-db-stream-v4-canary-terminal-v1", "status": "PASS_STREAMED_CORPUS_CANARY_ZERO_CREDIT"}
        expected_accounting = {"clean_full_matrix_streak": plan["qualification"]["clean_full_matrix_streak_before"], "fresh_goal_count": len(plan["rows"]), "full_matrix_count": 0, "qualification_credit": 0, "qualification_score": "0/2", "required_consecutive_clean_full_matrices": 2, "schema_id": "pw-r9-codex-native-goal-db-stream-v4-accounting-v1", "status": "SEALED_STREAMED_CANARY_ZERO_CREDIT"}
        status = "PASS_STREAMED_CORPUS_CANARY_ZERO_CREDIT"
    else:
        ordinal = plan["experiment"]["matrix_ordinal"]
        expected_terminal = {"experiment_id": plan["experiment"]["id"], "failure_count": 0, "fresh_goal_count": len(plan["rows"]), "matrix_ordinal": ordinal, "pass_count": len(plan["rows"]), "qualification_credit": 0, "result_identity_root": result_root, "route_counts": route_counts, "row_count": len(plan["rows"]), "schema_id": "pw-r9-codex-native-goal-db-stream-v4-matrix-terminal-v1", "status": "PASS_CLEAN_FULL_MATRIX_ZERO_CREDIT"}
        streak = plan["qualification"]["clean_full_matrix_streak_before"] + 1
        expected_accounting = {"clean_full_matrix_streak": streak, "fresh_goal_count": len(plan["rows"]), "full_matrix_count": ordinal, "qualification_credit": 0, "qualification_score": "0/2", "required_consecutive_clean_full_matrices": 2, "schema_id": "pw-r9-codex-native-goal-db-stream-v4-accounting-v1", "status": "SEALED_MATRIX_CLEAN_STREAK_" + str(streak) + "_ZERO_CREDIT_PENDING_TWO_MATRIX_BAR"}
        status = "PASS_CLEAN_FULL_MATRIX_" + str(ordinal) + "_ZERO_CREDIT"
    require(terminal == expected_terminal, "terminal")
    _, accounting = read_json(os.path.join(root, "accounting.json"), cap=100000)
    require(accounting == expected_accounting, "accounting")
    accounting_time = os.lstat(os.path.join(root, "accounting.json")).st_mtime_ns
    require(all(os.lstat(os.path.join(current, name)).st_mtime_ns <= accounting_time for current, _, files in os.walk(root) for name in files), "accounting-last")
    after = inventory(root)
    require(before == after, "workspace-writes")
    return {"first_mismatch": None, "fresh_goal_count": len(seen_threads), "inventory_sha256": after, "qualification_credit": 0, "status": status, "workspace_writes": 0}


def main(argv):
    require(len(argv) == 3 and argv[1] in {"--check", "--verify"}, "argv")
    plan_path = os.path.realpath(argv[2])
    plan_raw, plan = load_plan(plan_path)
    if argv[1] == "--check":
        require(not os.path.lexists(plan["experiment"]["root"]), "root-exists")
        result = {"first_mismatch": None, "qualification_credit": 0, "status": "PASS_DATA_ONLY_ZERO_WRITES", "workspace_writes": 0}
    else:
        result = verify(plan_path, plan_raw, plan)
    sys.stdout.buffer.write(canonical(result)); sys.stdout.buffer.flush()
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, ValueError, KeyError, TypeError, json.JSONDecodeError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "qualification_credit": 0, "status": "FAIL", "workspace_writes": 0})); sys.stdout.buffer.flush()
        raise SystemExit(1)
