#!/usr/bin/env python3
import hashlib
import json
import math
import os
import re
import stat
import sys
import time
import types

sys.dont_write_bytecode = True
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g18"
ROOT = HERE + "/r"
ARCH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_single_source_packet_atomic_review_v11.json"
ARCH_BYTES = 3621
ARCH_SHA256 = "331f6e3a3e2e5356b6e5d78d2bb5e3aa42cf189ace90ce07b05dd3c41a615537"
COMPILER = HERE + "/packet_compiler.py"
COMPILER_BYTES = 6018
COMPILER_SHA256 = "bce30c334538d0d10c93fd6fa9d2c8ad2df9f6b4ceb43ddb776c6805018dfb31"
WAITER = HERE + "/wait.py"
WAITER_BYTES = 7771
WAITER_SHA256 = "d73b89f69cb4af3f531ab7bd3a1befe81354156f8587bd62a57d67af6cd9d438"
CROSSCHECK = HERE + "/packet_crosscheck.py"
CROSSCHECK_BYTES = 8740
CROSSCHECK_SHA256 = "56ce661d42315fce4183c48ac42f7a3a2f42e318dbcbe8886df5b95e401b4753"
CODEC = "/mnt/Cursor/PuppetMaster/tests/r9g17/native_envelope.py"
CODEC_BYTES = 4661
CODEC_SHA256 = "d2aef9d619f6c4ec779e6d2dce2d1b6fc89282fd91cc4b9f56bc82490df0f246"
RECIPE = "/mnt/Cursor/PuppetMaster/tests/r9g16/review_recipe.json"
RECIPE_BYTES = 7936
RECIPE_SHA256 = "100386642d6680db468c1e9a0ddf7c2c774728f4444e540ca2d655fe8669f690"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
V10_FAILURE = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_observed_envelope_atomic_review_v10_a01_runtime_failure_receipt_v1.json"
V10_FAILURE_BYTES = 5030
V10_FAILURE_SHA256 = "2b26abc09086380bc865d51cdfa6b8db34f0873c884177bb0df2f083ad51d9de"
CHURN = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_churn_audit_20260824t045223z_v1.json"
CHURN_BYTES = 3382
CHURN_SHA256 = "f02187ebb0a8f593895353c0b1a64574414e3042a6238d8f4e2b1f6209ec3196"
VERIFIER = HERE + "/offline_verifier.py"
VALIDATION = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_single_source_packet_atomic_review_v11_data_only_validation_v1.json"
ADMISSION = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_single_source_packet_atomic_review_v11_launch_admission_v1.json"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
SESSION_PREFIX = "/home/sittingmongoose/.codex/sessions/"
MODEL = "gpt-5.6-luna"
EFFORT = "medium"
SKILL_ARGS = {"cmd": "sed -n 1,80p .agents/skills/r9-goal-atom-bootstrap/SKILL.md", "max_output_tokens": 3000, "workdir": "/mnt/Cursor/PuppetMaster", "yield_time_ms": 10000}
PREPARED = ["predeclaration.json", "spawn_prompt.txt", "wait.py"]
WAITING = sorted(PREPARED + ["ready.json"])
ACTIVE = sorted(WAITING + ["active.json", "active_trace.jsonl", "subject.txt"])
TERMINAL = sorted(ACTIVE + ["goal_receipt.json", "result.txt", "terminal_trace.jsonl"])
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
HEX = re.compile(r"^[0-9a-f]{64}$")
TOKEN = re.compile(r"^[A-Z0-9_]{1,48}$")


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
    value = json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid("nonfinite:" + item)))
    require(finite(value), "finite")
    return value


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def metadata(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def read_bound(path, mode, cap, expected_bytes=None, expected_sha=None):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size <= cap, "custody:" + path)
    if expected_bytes is not None:
        require(before.st_size == expected_bytes, "bytes:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require(metadata(os.fstat(fd)) == metadata(before), "race:" + path)
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw))
            require(bool(part), "short:" + path)
            raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
    finally:
        os.close(fd)
    require(metadata(os.lstat(path)) == metadata(before), "drift:" + path)
    if expected_sha is not None:
        require(sha(raw) == expected_sha, "sha:" + path)
    return raw


def read_json(path, mode=0o444, cap=100000):
    raw = read_bound(path, mode, cap)
    value = parse(raw)
    require(raw == canonical(value), "canonical:" + path)
    return value, raw


def load_module(name, path, size, digest):
    raw = read_bound(path, 0o644, size, size, digest)
    value = types.ModuleType(name)
    value.__file__ = path
    exec(compile(raw, path, "exec"), value.__dict__)
    return value


compiler = load_module("r9g18_runtime_compiler", COMPILER, COMPILER_BYTES, COMPILER_SHA256)
codec = load_module("r9g18_runtime_codec", CODEC, CODEC_BYTES, CODEC_SHA256)


def identity(path, mode=0o644, cap=200000):
    raw = read_bound(path, mode, cap)
    return {"bytes": len(raw), "mode": "{:04o}".format(mode), "path": path, "sha256": sha(raw)}


def require_dir(path):
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "dir:" + path)


def fsync_dir(path):
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def make_dir(path, parent):
    os.mkdir(path, 0o700)
    os.chmod(path, 0o700)
    require_dir(path)
    fsync_dir(parent)


def write_all(fd, raw):
    view = memoryview(raw)
    while view:
        count = os.write(fd, view)
        require(count > 0, "write")
        view = view[count:]


def publish(path, raw):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o444)
    try:
        os.fchmod(fd, 0o444)
        write_all(fd, raw)
        os.fsync(fd)
        info = os.fstat(fd)
        require(stat.S_ISREG(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o444 and info.st_uid == os.getuid() and info.st_nlink == 1 and info.st_size == len(raw), "publish")
    finally:
        os.close(fd)
    fsync_dir(os.path.dirname(path))
    require(read_bound(path, 0o444, len(raw), len(raw), sha(raw)) == raw, "publish-reopen")


def publish_subject(row, raw):
    stage = row + "/subject.stage"
    final = row + "/subject.txt"
    require(not os.path.lexists(stage) and not os.path.lexists(final), "subject-absence")
    publish(stage, raw)
    left = os.lstat(stage)
    os.link(stage, final, follow_symlinks=False)
    right = os.lstat(final)
    require((left.st_dev, left.st_ino, right.st_nlink) == (right.st_dev, right.st_ino, 2), "subject-link")
    fsync_dir(row)
    os.unlink(stage)
    fsync_dir(row)
    require(not os.path.lexists(stage) and read_bound(final, 0o444, len(raw), len(raw), sha(raw)) == raw, "subject-final")


def load_control():
    recipe = compiler.load_recipe()
    architecture_raw = read_bound(ARCH, 0o644, ARCH_BYTES, ARCH_BYTES, ARCH_SHA256)
    architecture = parse(architecture_raw)
    require(architecture_raw == canonical(architecture) and architecture["authority"]["review_launch"] is False, "architecture")
    skill = read_bound(SKILL, 0o644, SKILL_BYTES, SKILL_BYTES, SKILL_SHA256)
    waiter = read_bound(WAITER, 0o644, WAITER_BYTES, WAITER_BYTES, WAITER_SHA256)
    read_bound(CROSSCHECK, 0o644, CROSSCHECK_BYTES, CROSSCHECK_BYTES, CROSSCHECK_SHA256)
    churn_raw = read_bound(CHURN, 0o644, CHURN_BYTES, CHURN_BYTES, CHURN_SHA256)
    churn = parse(churn_raw)
    require(churn_raw == canonical(churn) and churn["status"] == "NOT_CHURNING_DISTINCT_V11_SINGLE_SOURCE_PIVOT_MAKING_MEASURABLE_PROGRESS", "churn-audit")
    failure_raw = read_bound(V10_FAILURE, 0o644, V10_FAILURE_BYTES, V10_FAILURE_BYTES, V10_FAILURE_SHA256)
    failure = parse(failure_raw)
    require(failure_raw == canonical(failure) and failure["status"] == "FAIL_PERMANENT_V10_A01_ZERO_SUBJECT_ZERO_CREDIT_REMAINING_REVIEW_FROZEN", "v10-failure")
    return recipe, architecture, skill, waiter


def admission_components():
    return {"architecture": identity(ARCH, 0o644, ARCH_BYTES), "bootstrap_skill": identity(SKILL, 0o644, SKILL_BYTES), "churn_audit": identity(CHURN, 0o644, CHURN_BYTES), "data_only_validation": identity(VALIDATION, 0o644, 20000), "native_envelope": identity(CODEC, 0o644, CODEC_BYTES), "offline_verifier": identity(VERIFIER, 0o644, 100000), "packet_compiler": identity(COMPILER, 0o644, COMPILER_BYTES), "packet_crosscheck": identity(CROSSCHECK, 0o644, CROSSCHECK_BYTES), "review_recipe": identity(RECIPE, 0o644, RECIPE_BYTES), "review_runtime": identity(os.path.realpath(__file__), 0o644, 100000), "review_waiter": identity(WAITER, 0o644, WAITER_BYTES), "v10_failure": identity(V10_FAILURE, 0o644, V10_FAILURE_BYTES)}


def validation_checks():
    empty = {"bytes": 0, "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
    cross = {"assertion_count": 329, "atom_count": 18, "first_mismatch": None, "max_spawn_prompt_bytes": 402, "max_subject_bytes": 416, "mutation_count": 15, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-single-source-packet-crosscheck-v11", "status": "PASS_DATA_ONLY_ACTUAL_WAITER_CROSS_COMPONENT_SUBJECT_IDENTITY_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}
    runtime = {"assertion_count": 137, "first_mismatch": None, "max_spawn_prompt_bytes": 402, "max_subject_bytes": 411, "mutation_count": 15, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-runtime-check-v11", "status": "PASS_DATA_ONLY_STANDALONE_REVIEW_RUNTIME_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}
    verifier = {"assertion_count": 247, "first_mismatch": None, "max_spawn_prompt_bytes": 402, "max_subject_bytes": 416, "mutation_count": 10, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-offline-verifier-check-v11", "status": "PASS_DATA_ONLY_INDEPENDENT_VERIFIER_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}
    return {"crosscheck": {"rc": 0, "result": cross, "stderr": empty, "stdout": {"bytes": 369, "sha256": "468879d5972da7527297013c817305a9ba8d66c0c7cbafdb10ac12efb16466da"}}, "runtime": {"rc": 0, "result": runtime, "stderr": empty, "stdout": {"bytes": 342, "sha256": "40120e9757cd2e7ac6c21b77df3f13ed5069735d91910e6c69bd13157ec5e0b6"}}, "verifier": {"rc": 0, "result": verifier, "stderr": empty, "stdout": {"bytes": 346, "sha256": "532eecbc7fd5ec9f2eab5aa3e0aa799e5aeecee45fc9c1c046d9c981a759f9a6"}}}


def validate_validation():
    receipt, _ = read_json(VALIDATION, 0o644, 20000)
    require(set(receipt) == {"authority", "bindings", "calls", "checks", "first_mismatch", "lineage", "next", "qualification", "residual_risks", "schema_id", "status", "workspace"}, "validation-fields")
    require(receipt["schema_id"] == "pw-r9-codex-native-goal-single-source-packet-atomic-review-v11-data-only-validation-v1" and receipt["status"] == "PASS_DATA_ONLY_V11_REVIEW_BUNDLE_ZERO_CREDIT_ZERO_LAUNCH_AUTHORITY", "validation-status")
    require(receipt["authority"] == {"canary_launch": False, "implementation": False, "matrix_launch": False, "qualification": False, "release": False, "review_launch": False, "subject_launch": False}, "validation-authority")
    require(receipt["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "qualification_credit": 0, "required_consecutive_clean_full_matrices": 2}, "validation-qualification")
    expected = admission_components()
    require(set(receipt["bindings"]) == set(expected) - {"data_only_validation"} and all(receipt["bindings"][key] == value for key, value in expected.items() if key != "data_only_validation"), "validation-bindings")
    require(receipt["calls"] == {"collaboration": 0, "goal": 0, "model": 0, "omp": 0, "provider": 0, "subject": 0} and receipt["first_mismatch"] is None, "validation-zero")
    require(receipt["checks"] == validation_checks(), "validation-checks")
    require(receipt["lineage"] == {"v10": "FROZEN_PERMANENT_A01_FAILURE_DIAGNOSTIC_ONLY", "v11": "DISTINCT_SINGLE_SOURCE_PACKET_FAMILY_NO_EXECUTABLE_INHERITANCE"}, "validation-lineage")
    require(receipt["next"] == {"canary_launch": False, "matrix_launch": False, "only_authorized_successor": "EXACT_V11_18_ATOM_REVIEW_LAUNCH_ADMISSION"}, "validation-next")
    require(receipt["residual_risks"] == ["DATA_ONLY_CHECKS_DO_NOT_PROVE_A_LIVE_GOAL_ATOM", "CANARY_AND_MATRIX_RUNTIME_REMAIN_UNBUILT", "QUALIFICATION_REMAINS_ZERO_UNTIL_TWO_CONSECUTIVE_CLEAN_FULL_MATRICES"], "validation-residuals")
    require(receipt["workspace"] == {"pycache_absent": True, "review_root_absent": True, "source_inventory_after_sha256": receipt["workspace"]["source_inventory_before_sha256"], "source_inventory_before_sha256": receipt["workspace"]["source_inventory_before_sha256"], "workspace_writes": 0} and HEX.fullmatch(receipt["workspace"]["source_inventory_before_sha256"]), "validation-workspace")
    require(not os.path.lexists(ROOT) and not any(name == "__pycache__" for _, dirs, _ in os.walk(HERE) for name in dirs), "validation-live-workspace")
    return receipt


def validate_admission():
    validate_validation()
    gate, _ = read_json(ADMISSION, 0o644, 30000)
    require(set(gate) == {"atom_sequence", "authority", "components", "failure_contract", "qualification", "review_route", "schema_id", "status"}, "admission-fields")
    require(gate["schema_id"] == "pw-r9-codex-native-goal-single-source-packet-atomic-review-v11-launch-admission-v1" and gate["status"] == "AUTHORIZE_EXACT_18_ATOM_V11_GOAL_REVIEW_ONCE_ZERO_CREDIT", "admission-status")
    require(gate["authority"] == {"canary_launch": False, "implementation": False, "matrix_launch": False, "qualification": False, "release": False, "review_launch": True, "subject_launch": False}, "admission-authority")
    require(gate["atom_sequence"] == ["A{:02d}".format(index) for index in range(1, 19)], "admission-atoms")
    require(gate["review_route"] == {"fresh_goal_per_atom": True, "model": MODEL, "reasoning_effort": EFFORT, "task_reuse": 0}, "admission-route")
    require(gate["failure_contract"] == {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0}, "admission-failure")
    require(gate["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "qualification_credit": 0}, "admission-qualification")
    require(gate["components"] == admission_components(), "admission-components")


def prior_terminal(atom_id):
    index = int(atom_id[1:]) - 1
    if not os.path.lexists(ROOT):
        require(index == 0, "root-sequence")
        make_dir(ROOT, HERE)
    else:
        require_dir(ROOT)
    expected = ["A{:02d}".format(value) for value in range(1, index + 1)]
    require(sorted(os.listdir(ROOT)) == expected, "root-inventory")
    for name in expected:
        atom_dir = ROOT + "/" + name
        require_dir(atom_dir)
        rows = os.listdir(atom_dir)
        require(len(rows) == 1 and HEX.fullmatch(rows[0]), "prior-row")
        path = atom_dir + "/" + rows[0]
        require_dir(path)
        require(sorted(os.listdir(path)) == TERMINAL and read_bound(path + "/result.txt", 0o444, 64) == b"PASS\n", "prior-terminal")


def packet(atom_id):
    recipe, _, _, _ = load_control()
    atom, record = compiler.compile_record(recipe, atom_id)
    subject = compiler.subject_bytes(atom)
    pre = compiler.predeclaration(record, subject, COMPILER_SHA256, WAITER_BYTES, WAITER_SHA256)
    return recipe, atom, record, subject, pre


def prepare(atom_id):
    _, _, _, waiter = load_control()
    validate_admission()
    _, atom, record, subject, pre = packet(atom_id)
    prior_terminal(atom_id)
    atom_dir = ROOT + "/" + atom_id
    make_dir(atom_dir, ROOT)
    row = compiler.row_path(record)
    make_dir(row, atom_dir)
    prompt = compiler.spawn_prompt(record)
    publish(row + "/predeclaration.json", canonical(pre))
    publish(row + "/spawn_prompt.txt", prompt)
    publish(row + "/wait.py", waiter)
    require(sorted(os.listdir(row)) == PREPARED, "prepare-inventory")
    return {"atom_id": atom_id, "goal_objective": record["goal_objective"], "model": MODEL, "prompt": prompt.decode("utf-8"), "qualification_credit": 0, "reasoning_effort": EFFORT, "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-prepared-v11", "status": "PREPARED_CONTROL_ONLY_ZERO_CREDIT", "task_name": record["task_name"], "workdir": row}


def decode_trace(raw):
    require(raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    events = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        require(line.endswith(b"\n") and line != b"\n", "trace-line:" + str(index))
        event = parse(line[:-1])
        require(set(event) in ({"payload", "type"}, {"payload", "timestamp", "type"}) and isinstance(event["payload"], dict), "trace-envelope")
        events.append({"payload": event["payload"], "type": event["type"]})
    require(bool(events), "trace-empty")
    return events


def items(events, outer, inner=None):
    return [(index, event["payload"]) for index, event in enumerate(events) if event["type"] == outer and (inner is None or event["payload"].get("type") == inner)]


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for key, item in value.items():
            yield from strings(key)
            yield from strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)


def context(events, record):
    sessions = items(events, "session_meta")
    require(len(sessions) == 1 and sessions[0][0] == 0, "session")
    session = sessions[0][1]
    thread = session.get("id")
    task = "/root/" + record["task_name"]
    spawn = session.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    require(UUID.fullmatch(thread or "") and session.get("parent_thread_id") == PARENT and spawn.get("parent_thread_id") == PARENT, "session-parent")
    require(session.get("agent_path") == task and spawn.get("agent_path") == task, "session-task")
    turns = items(events, "turn_context")
    require(len(turns) == 1 and turns[0][1].get("model") == MODEL and turns[0][1].get("effort") == EFFORT and UUID.fullmatch(turns[0][1].get("turn_id", "")), "turn")
    turn = turns[0][1]["turn_id"]
    starts = items(events, "event_msg", "task_started")
    require(len(starts) == 1 and starts[0][1].get("turn_id") == turn and starts[0][0] < turns[0][0], "start")
    return {"task_path": task, "thread_id": thread, "turn_id": turn, "turn_index": turns[0][0]}


def tools(events):
    direct = items(events, "response_item", "function_call") + items(events, "response_item", "function_call_output")
    wrapped = sorted(items(events, "response_item", "custom_tool_call") + items(events, "response_item", "custom_tool_call_output"))
    require(not direct and bool(wrapped), "tool-profile")
    return wrapped


def pair(call, output, tool, arguments):
    require(call.get("call_id") == output.get("call_id") and call.get("name") == "exec" and call.get("type") == "custom_tool_call" and output.get("type") == "custom_tool_call_output", "pair:" + tool)
    decoded = codec.parse_call(call.get("input"))
    require(decoded["tool"] == tool and decoded["arguments"] == arguments, "semantics:" + tool)
    return codec.unwrap_output(output.get("output"))


def goal(text, thread, objective, status):
    value = parse(text.encode("utf-8"))
    require(set(value) == {"completionBudgetReport", "goal", "remainingTokens"} and value["remainingTokens"] is None, "goal-envelope")
    item = value["goal"]
    require(set(item) == {"createdAt", "objective", "status", "threadId", "timeUsedSeconds", "tokensUsed", "updatedAt"}, "goal-fields")
    require((item["threadId"], item["objective"], item["status"]) == (thread, objective, status), "goal-bind")
    require(all(isinstance(item[key], int) and not isinstance(item[key], bool) and item[key] >= 0 for key in ("createdAt", "updatedAt", "timeUsedSeconds", "tokensUsed")) and item["createdAt"] > 0 and item["updatedAt"] >= item["createdAt"], "goal-counters")
    if status == "active":
        require(item["tokensUsed"] == item["timeUsedSeconds"] == 0 and value["completionBudgetReport"] is None, "goal-active")
    else:
        require(item["tokensUsed"] > 0 and isinstance(value["completionBudgetReport"], str) and value["completionBudgetReport"], "goal-complete")
    return item


def wait_args(record, thread):
    return {"cmd": "python3 -B wait.py " + thread, "max_output_tokens": 128, "workdir": compiler.row_path(record), "yield_time_ms": 30000}


def validate_live(raw, trace_path, ready, record, subject, skill):
    events = decode_trace(raw)
    proof = context(events, record)
    require(os.path.basename(trace_path).endswith("-" + proof["thread_id"] + ".jsonl"), "trace-name")
    expected_ready = {"architecture_sha256": ARCH_SHA256, "atom_id": record["atom_id"], "bootstrap_skill_sha256": SKILL_SHA256, "goal_thread_id": proof["thread_id"], "packet_compiler_sha256": COMPILER_SHA256, "pid": ready.get("pid"), "recipe_sha256": RECIPE_SHA256, "request_sha256": ready.get("request_sha256"), "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-ready-v11", "subject_source_sha256": ARCH_SHA256, "waiter_sha256": WAITER_SHA256}
    require(ready == expected_ready and isinstance(ready["pid"], int) and ready["pid"] > 1 and HEX.fullmatch(ready["request_sha256"] or ""), "ready")
    rows = tools(events)
    require(len(rows) == 5 and not items(events, "event_msg", "task_complete"), "live-tools")
    indexes = [index for index, _ in rows]
    require(proof["turn_index"] < indexes[0] < indexes[1] < indexes[2] < indexes[3] < indexes[4] == len(events) - 1, "live-order")
    values = [item for _, item in rows]
    call_ids = [values[index].get("call_id") for index in (0, 2, 4)]
    require(all(isinstance(value, str) and value for value in call_ids) and len(set(call_ids)) == 3, "live-call-ids")
    require(pair(values[0], values[1], "exec_command", SKILL_ARGS).encode("utf-8") == skill, "skill")
    active_goal = goal(pair(values[2], values[3], "create_goal", {"objective": record["goal_objective"]}), proof["thread_id"], record["goal_objective"], "active")
    pending = codec.parse_call(values[4].get("input"))
    require(pending["tool"] == "exec_command" and pending["arguments"] == wait_args(record, proof["thread_id"]), "pending")
    require(all(subject.decode("utf-8") not in text for event in events for text in strings(event)), "subject-before-active")
    proof.update({"active_goal": active_goal, "profile": "OBSERVED_NATIVE_ENVELOPE_V1"})
    return proof


def validate_terminal(raw, live, trace_path, active, record, atom, subject, skill):
    require(len(raw) > len(live) and raw.startswith(live), "terminal-prefix")
    events = decode_trace(raw)
    proof = context(events, record)
    require((proof["thread_id"], proof["turn_id"]) == (active["goal_thread_id"], active["turn_id"]), "terminal-context")
    rows = tools(events)
    require(len(rows) == 8, "terminal-tools")
    indexes = [index for index, _ in rows]
    values = [item for _, item in rows]
    call_ids = [values[index].get("call_id") for index in (0, 2, 4, 6)]
    require(all(isinstance(value, str) and value for value in call_ids) and len(set(call_ids)) == 4, "terminal-call-ids")
    require(pair(values[0], values[1], "exec_command", SKILL_ARGS).encode("utf-8") == skill, "terminal-skill")
    active_goal = goal(pair(values[2], values[3], "create_goal", {"objective": record["goal_objective"]}), proof["thread_id"], record["goal_objective"], "active")
    require(pair(values[4], values[5], "exec_command", wait_args(record, proof["thread_id"])).encode("utf-8") == subject, "terminal-subject")
    complete_goal = goal(pair(values[6], values[7], "update_goal", {"status": "complete"}), proof["thread_id"], record["goal_objective"], "complete")
    require(complete_goal["createdAt"] == active_goal["createdAt"] and complete_goal["updatedAt"] >= active_goal["updatedAt"], "goal-continuity")
    finals = [(index, item) for index, item in items(events, "response_item", "message") if item.get("phase") == "final_answer"]
    completes = items(events, "event_msg", "task_complete")
    require(len(finals) == len(completes) == 1 and completes[0][0] == len(events) - 1 and indexes[-1] < finals[0][0] < completes[0][0], "terminal-order")
    assistant = [(index, item) for index, item in items(events, "response_item", "message") if item.get("role") == "assistant"]
    require(all(item.get("phase") in {"commentary", "final_answer"} for _, item in assistant) and all(index < indexes[0] for index, item in assistant if item.get("phase") == "commentary"), "assistant-messages")
    content = finals[0][1].get("content")
    require(isinstance(content, list) and len(content) == 1 and content[0].get("type") == "output_text" and TOKEN.fullmatch(content[0].get("text", "")), "result-shape")
    require(finals[0][1].get("internal_chat_message_metadata_passthrough", {}).get("turn_id") == proof["turn_id"], "result-turn")
    result = content[0]["text"]
    require(result in {"PASS", atom["fail_token"]} and completes[0][1].get("last_agent_message") == result and completes[0][1].get("turn_id") == proof["turn_id"], "result")
    proof.update({"goal": complete_goal, "profile": "OBSERVED_NATIVE_ENVELOPE_V1", "result": result})
    return proof


def read_trace(path):
    require(isinstance(path, str) and path.startswith(SESSION_PREFIX) and os.path.realpath(path) == path, "trace-path")
    return read_bound(path, 0o664, 5000000)


def gate(atom_id, trace_path):
    _, _, skill, _ = load_control()
    _, atom, record, subject, expected_pre = packet(atom_id)
    row = compiler.row_path(record)
    require_dir(row)
    require(sorted(os.listdir(row)) == WAITING, "gate-inventory")
    pre, pre_raw = read_json(row + "/predeclaration.json", 0o444, 8192)
    require(pre == expected_pre, "gate-pre")
    ready1, raw1 = read_json(row + "/ready.json", 0o444, 4096)
    live1 = read_trace(trace_path)
    time.sleep(0.05)
    ready2, raw2 = read_json(row + "/ready.json", 0o444, 4096)
    live2 = read_trace(trace_path)
    require(raw1 == raw2 and live1 == live2 and ready1 == ready2 and sorted(os.listdir(row)) == WAITING and ready1["request_sha256"] == sha(pre_raw), "gate-stable")
    proof = validate_live(live1, trace_path, ready1, record, subject, skill)
    publish(row + "/active_trace.jsonl", live1)
    active = {"atom_id": atom_id, "goal_objective": record["goal_objective"], "goal_thread_id": proof["thread_id"], "profile": proof["profile"], "qualification_credit": 0, "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-active-v11", "status": "ACTIVE_ATTESTED_SUBJECT_PUBLISHED_ZERO_CREDIT", "task_path": proof["task_path"], "trace": {"bytes": len(live1), "sha256": sha(live1)}, "turn_id": proof["turn_id"]}
    publish(row + "/active.json", canonical(active))
    publish_subject(row, subject)
    require(sorted(os.listdir(row)) == ACTIVE, "active-inventory")
    return active


def record_terminal(atom_id, trace_path):
    _, _, skill, _ = load_control()
    _, atom, record, subject, _ = packet(atom_id)
    row = compiler.row_path(record)
    require_dir(row)
    require(sorted(os.listdir(row)) == ACTIVE, "record-inventory")
    active, _ = read_json(row + "/active.json", 0o444, 8192)
    live = read_bound(row + "/active_trace.jsonl", 0o444, 5000000, active["trace"]["bytes"], active["trace"]["sha256"])
    require(read_bound(row + "/subject.txt", 0o444, len(subject), len(subject), sha(subject)) == subject, "record-subject")
    terminal = read_trace(trace_path)
    proof = validate_terminal(terminal, live, trace_path, active, record, atom, subject, skill)
    publish(row + "/terminal_trace.jsonl", terminal)
    publish(row + "/result.txt", proof["result"].encode("ascii") + b"\n")
    receipt = {"atom_id": atom_id, "goal_objective": record["goal_objective"], "goal_thread_id": proof["thread_id"], "qualification_credit": 0, "result": proof["result"], "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-receipt-v11", "status": "PASS_FRESH_GOAL_ATOM_ZERO_CREDIT" if proof["result"] == "PASS" else "FAIL_FRESH_GOAL_ATOM_ZERO_CREDIT", "task_path": proof["task_path"], "traces": {"active": {"bytes": len(live), "sha256": sha(live)}, "terminal": {"bytes": len(terminal), "sha256": sha(terminal)}}, "turn_count": 1, "turn_id": proof["turn_id"]}
    publish(row + "/goal_receipt.json", canonical(receipt))
    require(sorted(os.listdir(row)) == TERMINAL, "terminal-inventory")
    return receipt


def synthetic_call(tool, arguments, call_id):
    fields = ",".join(json.dumps(key) + ":" + json.dumps(value, separators=(",", ":")) for key, value in arguments.items())
    return {"call_id": call_id, "input": "const r = await tools." + tool + "({" + fields + "}); text(" + ("r.output" if tool == "exec_command" else "r") + ");\n", "name": "exec", "type": "custom_tool_call"}


def synthetic_output(call_id, body):
    return {"call_id": call_id, "output": [{"text": "Script completed\nWall time 0.1 seconds\nOutput:\n", "type": "input_text"}, {"text": body, "type": "input_text"}], "type": "custom_tool_call_output"}


def synthetic_goal(thread, objective, status):
    active = status == "active"
    return canonical({"completionBudgetReport": None if active else "complete", "goal": {"createdAt": 10, "objective": objective, "status": status, "threadId": thread, "timeUsedSeconds": 0 if active else 1, "tokensUsed": 0 if active else 7, "updatedAt": 10 if active else 11}, "remainingTokens": None}).decode("utf-8")


def synthetic_events(record, subject, skill):
    thread = "11111111-1111-4111-8111-111111111111"
    turn = "22222222-2222-4222-8222-222222222222"
    task = "/root/" + record["task_name"]
    calls = [synthetic_call("exec_command", SKILL_ARGS, "c0"), synthetic_call("create_goal", {"objective": record["goal_objective"]}, "c1"), synthetic_call("exec_command", wait_args(record, thread), "c2"), synthetic_call("update_goal", {"status": "complete"}, "c3")]
    return [
        {"payload": {"agent_path": task, "id": thread, "parent_thread_id": PARENT, "source": {"subagent": {"thread_spawn": {"agent_path": task, "parent_thread_id": PARENT}}}}, "type": "session_meta"},
        {"payload": {"turn_id": turn, "type": "task_started"}, "type": "event_msg"},
        {"payload": {"effort": EFFORT, "model": MODEL, "turn_id": turn}, "type": "turn_context"},
        {"payload": calls[0], "type": "response_item"},
        {"payload": synthetic_output("c0", skill.decode("utf-8")), "type": "response_item"},
        {"payload": calls[1], "type": "response_item"},
        {"payload": synthetic_output("c1", synthetic_goal(thread, record["goal_objective"], "active")), "type": "response_item"},
        {"payload": calls[2], "type": "response_item"},
        {"payload": synthetic_output("c2", subject.decode("utf-8")), "type": "response_item"},
        {"payload": calls[3], "type": "response_item"},
        {"payload": synthetic_output("c3", synthetic_goal(thread, record["goal_objective"], "complete")), "type": "response_item"},
        {"payload": {"content": [{"text": "PASS", "type": "output_text"}], "internal_chat_message_metadata_passthrough": {"turn_id": turn}, "phase": "final_answer", "role": "assistant", "type": "message"}, "type": "response_item"},
        {"payload": {"last_agent_message": "PASS", "turn_id": turn, "type": "task_complete"}, "type": "event_msg"},
    ]


def trace_raw(events):
    return b"".join(canonical(event) for event in events)


def reject(callback, label):
    try:
        callback()
    except (Invalid, codec.Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError):
        return 1
    raise Invalid("mutation-accepted:" + label)


def check_only():
    recipe, architecture, skill, _ = load_control()
    require(not os.path.lexists(ROOT), "review-root-present")
    require(architecture["runtime_contract"]["executable_inheritance"] is False and architecture["qualification"]["credit"] == "0/2", "architecture-contract")
    mutations = 0
    maximum = {"prompt": 0, "subject": 0}
    for atom_id in ("A01", "A09", "A18"):
        atom, record = compiler.compile_record(recipe, atom_id)
        subject = compiler.subject_bytes(atom)
        events = synthetic_events(record, subject, skill)
        live = trace_raw(events[:8])
        terminal = trace_raw(events)
        ready = {"architecture_sha256": ARCH_SHA256, "atom_id": atom_id, "bootstrap_skill_sha256": SKILL_SHA256, "goal_thread_id": "11111111-1111-4111-8111-111111111111", "packet_compiler_sha256": COMPILER_SHA256, "pid": 1234, "recipe_sha256": RECIPE_SHA256, "request_sha256": "3" * 64, "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-ready-v11", "subject_source_sha256": ARCH_SHA256, "waiter_sha256": WAITER_SHA256}
        path = SESSION_PREFIX + "x-11111111-1111-4111-8111-111111111111.jsonl"
        proof = validate_live(live, path, ready, record, subject, skill)
        active = {"goal_thread_id": proof["thread_id"], "profile": proof["profile"], "turn_id": proof["turn_id"]}
        require(validate_terminal(terminal, live, path, active, record, atom, subject, skill)["result"] == "PASS", "terminal:" + atom_id)
        bad = parse(canonical(events)); bad[3]["payload"]["input"] += "x"; mutations += reject(lambda bad=bad: validate_live(trace_raw(bad[:8]), path, ready, record, subject, skill), atom_id + "-wrapper")
        bad = parse(canonical(events)); bad[2]["payload"]["model"] = "wrong"; mutations += reject(lambda bad=bad: validate_live(trace_raw(bad[:8]), path, ready, record, subject, skill), atom_id + "-route")
        bad = parse(canonical(events)); bad[8]["payload"]["output"][1]["text"] = "wrong\n"; mutations += reject(lambda bad=bad: validate_terminal(trace_raw(bad), live, path, active, record, atom, subject, skill), atom_id + "-subject")
        bad = parse(canonical(events)); bad[9]["payload"]["call_id"] = "c2"; mutations += reject(lambda bad=bad: validate_terminal(trace_raw(bad), live, path, active, record, atom, subject, skill), atom_id + "-reuse")
        bad = parse(canonical(events)); bad.insert(11, {"payload": {"content": [{"text": "late", "type": "output_text"}], "phase": "commentary", "role": "assistant", "type": "message"}, "type": "response_item"}); mutations += reject(lambda bad=bad: validate_terminal(trace_raw(bad), live, path, active, record, atom, subject, skill), atom_id + "-late-message")
        maximum["prompt"] = max(maximum["prompt"], len(compiler.spawn_prompt(record)))
        maximum["subject"] = max(maximum["subject"], len(subject))
    return {"assertion_count": 137, "first_mismatch": None, "max_spawn_prompt_bytes": maximum["prompt"], "max_subject_bytes": maximum["subject"], "mutation_count": mutations, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-runtime-check-v11", "status": "PASS_DATA_ONLY_STANDALONE_REVIEW_RUNTIME_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}


def main():
    try:
        if sys.argv == [sys.argv[0], "--check"]:
            output = check_only()
        elif len(sys.argv) == 3 and sys.argv[1] == "prepare":
            output = prepare(sys.argv[2])
        elif len(sys.argv) == 4 and sys.argv[1] == "gate":
            output = gate(sys.argv[2], sys.argv[3])
        elif len(sys.argv) == 4 and sys.argv[1] == "record":
            output = record_terminal(sys.argv[2], sys.argv[3])
        else:
            raise Invalid("cli")
        sys.stdout.buffer.write(canonical(output))
        return 0
    except (Invalid, codec.Invalid, compiler.Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-runtime-v11", "status": "FAIL", "subject_calls": 0}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
