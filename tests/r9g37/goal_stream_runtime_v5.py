#!/usr/bin/env python3
import hashlib
import importlib.util
import json
import math
import os
import re
import socket
import sqlite3
import stat
import struct
import sys
import time

sys.dont_write_bytecode = True
SELF = "/mnt/Cursor/PuppetMaster/tests/r9g37/goal_stream_runtime_v5.py"
ATTESTOR = "/mnt/Cursor/PuppetMaster/tests/r9g36/goal_db_attestor.py"
ATTESTOR_BYTES = 9118
ATTESTOR_SHA256 = "274b818da6ae51fb7c01608c4b3aca2e0d3f69a74bfb9815db816aa57b38bcc6"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-streamed-row-v5/SKILL.md"
SKILL_BYTES = 2345
SKILL_SHA256 = "e918e0d5228d3541fa60ce009ea0ba08a54e0f871cbc44adabde245bc4d28b07"
CONTRACT = "/mnt/Cursor/PuppetMaster/tests/r9g37/goal_stream_contract_v5.json"
CONTRACT_BYTES = 3876
CONTRACT_SHA256 = "9a914d1c5efb1f5922db8e4e295ce5445ea05862cf7aac70d4fe4732e119a1a7"
SOURCE_ROOT = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/codex_native_goal_bite_matrix_pair_005_006_inputs_v3"
SOURCE_MANIFEST = SOURCE_ROOT + "/manifest.json"
SOURCE_MANIFEST_BYTES = 243312
SOURCE_MANIFEST_SHA256 = "a0da41236655d4352f1aa5074673c2296ff2a4077dd26b8f315e60e80516cd87"
ROOT_PREFIX = "/mnt/Cursor/PuppetMaster/tests/r9g37/"
HEX = re.compile(r"^[0-9a-f]{64}$")
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
ROW_ID = re.compile(r"^row-[0-9]{3}$")
TASK = re.compile(r"^r9_gds5_[0-9a-f]{64}$")
DIRECT_ENVELOPE = re.compile(r"Chunk ID: [0-9a-f]+\nWall time: (?:0|[1-9][0-9]*)(?:\.[0-9]+)? seconds\nProcess exited with code (-?[0-9]+)\nOriginal token count: [0-9]+\nOutput:\n([\s\S]*)")
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


def directory(path, mode=0o700):
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode), "directory-kind:" + path)
    require(stat.S_IMODE(info.st_mode) == mode and info.st_uid == os.getuid(), "directory-custody:" + path)


def fsync_dir(path):
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def publish(path, raw, mode=0o444):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, mode)
    try:
        os.fchmod(fd, mode)
        view = memoryview(raw)
        while view:
            count = os.write(fd, view)
            require(count > 0, "write:" + path)
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    fsync_dir(os.path.dirname(path))
    require(read_exact(path, mode, len(raw), sha(raw)) == raw, "publish:" + path)


def make_dir(path, parent):
    directory(parent, 0o755 if parent == ROOT_PREFIX.rstrip("/") else 0o700)
    os.mkdir(path, 0o700)
    os.chmod(path, 0o700)
    fsync_dir(parent)
    directory(path)


def binding(path, mode=0o644):
    raw = read_exact(path, mode, cap=2000000)
    return {"bytes": len(raw), "mode": format(mode, "04o"), "path": path, "sha256": sha(raw)}


def load_contract():
    raw = read_exact(CONTRACT, 0o444, CONTRACT_BYTES, CONTRACT_SHA256)
    value = parse(raw)
    require(raw == canonical(value) and value["schema_id"] == "pw-r9-codex-native-goal-db-stream-source-derived-contract-v5" and value["status"] == "FROZEN_SOURCE_DERIVED_SINGLE_OWNER_ROW_CONTRACT_ZERO_CREDIT", "contract")
    require(value["source"]["manifest"] == binding(SOURCE_MANIFEST) and value["skill"] == binding(SKILL) and value["roster"] == ROSTER, "contract-bindings")
    require(value["limits"]["subject_chunk_count_rule"] == "EXACT_BOUND_SOURCE_ROW_NO_INDEPENDENT_NUMERIC_CEILING" and value["source"]["row_count"] == 291, "contract-row-authority")
    return value


def validate_binding(item):
    require(set(item) == {"bytes", "mode", "path", "sha256"}, "binding-shape")
    require(type(item["bytes"]) is int and item["bytes"] > 0 and item["mode"] in {"0444", "0644"} and os.path.isabs(item["path"]) and os.path.realpath(item["path"]) == item["path"] and HEX.fullmatch(item["sha256"] or ""), "binding-values")
    read_exact(item["path"], int(item["mode"], 8), item["bytes"], item["sha256"])


def commitment(item, name):
    require(set(item) == {"bytes", "sha256"} and type(item["bytes"]) is int and item["bytes"] > 0 and HEX.fullmatch(item["sha256"] or ""), "commitment:" + name)


def load_plan(path):
    contract = load_contract()
    require(os.path.isabs(path) and os.path.realpath(path) == path and path.startswith(ROOT_PREFIX), "plan-path")
    raw = read_exact(path, 0o444, cap=1000000)
    plan = parse(raw)
    require(raw == canonical(plan), "plan-canonical")
    require(set(plan) == {"authority", "bindings", "experiment", "failure_contract", "prior_clean_matrix", "qualification", "rows", "schema_id", "status"}, "plan-shape")
    require(plan["schema_id"] == "pw-r9-codex-native-goal-db-stream-v5-plan-v1" and plan["status"] == "FROZEN_GOAL_FIRST_STREAMED_SUBJECT_ZERO_CREDIT", "plan-id")
    require(plan["authority"] == {"empirical_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0}, "plan-authority")
    require(plan["failure_contract"] == contract["failure_contract"], "failure-contract")
    qualification = plan["qualification"]
    require(set(qualification) == {"clean_full_matrix_streak_before", "credit", "required_consecutive_clean_full_matrices"} and qualification["credit"] == contract["qualification"]["credit"] and qualification["required_consecutive_clean_full_matrices"] == contract["qualification"]["required_consecutive_clean_full_matrices"] and qualification["clean_full_matrix_streak_before"] in {0, 1}, "qualification")
    require(set(plan["bindings"]) == {"attestor", "builder", "canary_006_success", "contract", "offline_verifier", "preflight", "runtime", "skill", "source_manifest", "v2_failure", "v3_failure", "v4_failure"}, "bindings")
    for item in plan["bindings"].values():
        validate_binding(item)
    require(plan["bindings"]["attestor"] == binding(ATTESTOR) and plan["bindings"]["contract"] == binding(CONTRACT, 0o444) and plan["bindings"]["runtime"] == binding(SELF) and plan["bindings"]["skill"] == binding(SKILL) and plan["bindings"]["source_manifest"] == binding(SOURCE_MANIFEST) and plan["bindings"]["v4_failure"] == contract["lineage"]["v4_matrix_plan_failure"], "runtime-bindings")
    experiment = plan["experiment"]
    require(set(experiment) == {"id", "kind", "matrix_ordinal", "max_in_flight", "parent_goal_thread_id", "root", "row_count", "socket_name", "source_matrix_id", "stop_at_first_nonpass"}, "experiment-shape")
    require(experiment["kind"] in {"canary", "matrix"} and experiment["matrix_ordinal"] in {0, 1, 2} and type(experiment["row_count"]) is int and experiment["row_count"] in {3, 291}, "experiment-kind")
    require((experiment["kind"], experiment["matrix_ordinal"], experiment["row_count"]) in {("canary", 0, 3), ("matrix", 1, 291), ("matrix", 2, 291)}, "experiment-cardinality")
    require(experiment["max_in_flight"] == contract["limits"]["max_in_flight"] and experiment["socket_name"] == "goal_chunks.sock" and experiment["source_matrix_id"] == contract["source"]["matrix_id"] and experiment["stop_at_first_nonpass"] is True, "experiment-values")
    require(UUID.fullmatch(experiment["parent_goal_thread_id"] or "") and os.path.isabs(experiment["root"]) and os.path.realpath(experiment["root"]) == experiment["root"] and experiment["root"].startswith(ROOT_PREFIX), "experiment-paths")
    expected_experiments = {item["matrix_ordinal"]: (item["id"], item["root"]) for item in contract["experiments"].values()}
    require((experiment["id"], experiment["root"]) == expected_experiments[experiment["matrix_ordinal"]], "experiment-identity")
    if experiment["matrix_ordinal"] < 2:
        require(plan["prior_clean_matrix"] is None and qualification["clean_full_matrix_streak_before"] == 0, "prior-clean-matrix")
    else:
        validate_binding(plan["prior_clean_matrix"])
        require(plan["prior_clean_matrix"]["mode"] == "0644" and plan["prior_clean_matrix"]["path"] == ROOT_PREFIX + "stream_matrix_001_success_receipt_v5.json" and qualification["clean_full_matrix_streak_before"] == 1, "prior-clean-matrix")
    rows = plan["rows"]
    require(isinstance(rows, list) and len(rows) == experiment["row_count"], "row-count")
    seen = {"index": set(), "row_id": set(), "task_name": set(), "task_path": set()}
    route_counts = {key: 0 for key in ROSTER}
    for row in rows:
        require(set(row) == {"agent_role", "cell", "cell_index", "chunk_count", "expected_result", "goal_objective", "index", "model", "reasoning_effort", "route", "row_id", "source_row", "subject", "task_name", "task_path"}, "row-shape")
        require(type(row["index"]) is int and 0 <= row["index"] < 291 and ROW_ID.fullmatch(row["row_id"] or "") and row["row_id"] == "row-" + format(row["index"], "03d"), "row-index")
        require(row["route"] in ROSTER and {"model": row["model"], "reasoning_effort": row["reasoning_effort"]} == {"model": ROSTER[row["route"]]["model"], "reasoning_effort": ROSTER[row["route"]]["reasoning_effort"]}, "row-roster")
        require(type(row["cell_index"]) is int and 0 <= row["cell_index"] < 97 and isinstance(row["cell"], str) and 1 <= len(row["cell"]) <= 80, "row-cell")
        require(row["agent_role"] == "default" and type(row["chunk_count"]) is int and row["chunk_count"] >= 1 and isinstance(row["goal_objective"], str) and 1 <= len(row["goal_objective"].encode("utf-8")) <= contract["limits"]["goal_objective_max_bytes"], "row-bounds")
        require(TASK.fullmatch(row["task_name"] or "") and row["task_path"] == "/root/" + row["task_name"], "row-task")
        commitment(row["subject"], "subject")
        commitment(row["expected_result"], "expected-result")
        validate_binding(row["source_row"])
        require(row["source_row"]["path"].startswith(SOURCE_ROOT + "/rows/codex-native-goal-bite-matrix-006/") and row["source_row"]["mode"] == "0644", "source-row-path")
        declared_experiment = [item for item in contract["experiments"].values() if item["matrix_ordinal"] == experiment["matrix_ordinal"]][0]
        token = declared_experiment["goal_run_token"]
        require(row["goal_objective"] == "R9G37V5|" + token + "|" + row["row_id"] + "|" + row["subject"]["sha256"], "goal-objective")
        nonce = sha(("r9g37|" + experiment["id"] + "|" + row["row_id"] + "|" + row["subject"]["sha256"] + "|once").encode("utf-8"))
        require(row["task_name"] == "r9_gds5_" + nonce, "task-name")
        source_payloads(row, contract)
        for key in seen:
            value = row[key]
            require(value not in seen[key], "duplicate:" + key)
            seen[key].add(value)
        route_counts[row["route"]] += 1
    require([row["index"] for row in rows] == sorted(row["index"] for row in rows), "row-order")
    if experiment["kind"] == "matrix":
        require(route_counts == {"alpha": 97, "bravo": 97, "charlie": 97} and [row["index"] for row in rows] == list(range(291)), "matrix-schedule")
    else:
        require(route_counts == {"alpha": 1, "bravo": 1, "charlie": 1} and [row["index"] for row in rows] == [0, 97, 194], "canary-schedule")
    return raw, plan


def load_admission(path, plan_path, plan_raw, plan):
    contract = load_contract()
    require(os.path.isabs(path) and os.path.realpath(path) == path and path.startswith(ROOT_PREFIX), "admission-path")
    raw = read_exact(path, 0o644, cap=100000)
    value = parse(raw)
    require(raw == canonical(value), "admission-canonical")
    require(set(value) == {"authority", "bindings", "checks", "constraints", "schema_id", "status"}, "admission-shape")
    require(value["schema_id"] == "pw-r9-codex-native-goal-db-stream-v5-launch-admission-v1" and value["status"] == "PASS_EXACT_ONE_FRESH_GOAL_FIRST_STREAMED_RUN_ZERO_CREDIT", "admission-id")
    expected_authority = {"canary_launch": plan["experiment"]["kind"] == "canary", "matrix_launch": plan["experiment"]["kind"] == "matrix", "qualification": False, "qualification_credit": 0, "release": False}
    require(value["authority"] == expected_authority, "admission-authority")
    require(value["constraints"] == {"explicit_agent_role": "default", "max_in_flight": contract["limits"]["max_in_flight"], "no_subject_before_active_goal": True, "pre_goal_control_bootstrap": "BOUNDED_NON_SUBJECT_ONLY", "stop_at_first_nonpass": True, "subject_chunk_count_rule": contract["limits"]["subject_chunk_count_rule"], "subject_slice_max_bytes": contract["limits"]["subject_slice_max_bytes"], "two_clean_full_matrices_required": True}, "admission-constraints")
    require(value["checks"] == {"agent_role_rows": len(plan["rows"]), "frozen_trace_rows_checked": 3, "goal_objective_max_bytes": max(len(row["goal_objective"].encode("utf-8")) for row in plan["rows"]), "parent_mode": "0755", "plan_rows": len(plan["rows"]), "source_chunk_count_max_observed": contract["source"]["observed_chunk_count"]["max"], "source_corpus_rows_checked": 291, "source_rows_reconstructed": len(plan["rows"]), "spawn_prompt_max_bytes": max(len(spawn_prompt(row, os.path.join(plan["experiment"]["root"], "rows", row["row_id"]), contract)) for row in plan["rows"]), "subject_slice_max_bytes": contract["limits"]["subject_slice_max_bytes"]}, "admission-checks")
    require(set(value["bindings"]) == {"canary_006_success", "contract", "plan", "preflight", "runtime", "skill", "source_manifest", "v2_failure", "v3_failure", "v4_failure"}, "admission-bindings")
    for item in value["bindings"].values():
        validate_binding(item)
    require(value["bindings"]["contract"] == binding(CONTRACT, 0o444) and value["bindings"]["plan"] == {"bytes": len(plan_raw), "mode": "0444", "path": plan_path, "sha256": sha(plan_raw)} and value["bindings"]["runtime"] == binding(SELF) and value["bindings"]["skill"] == binding(SKILL) and value["bindings"]["source_manifest"] == binding(SOURCE_MANIFEST) and value["bindings"]["v4_failure"] == contract["lineage"]["v4_matrix_plan_failure"], "admission-bind")
    return raw, value


def load_attestor():
    read_exact(ATTESTOR, 0o644, ATTESTOR_BYTES, ATTESTOR_SHA256)
    spec = importlib.util.spec_from_file_location("r9g37_goal_db_attestor", ATTESTOR)
    require(spec is not None and spec.loader is not None, "attestor-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    require(module.__all__ == ("Invalid", "active", "canonical", "parse", "terminal_absent"), "attestor-api")
    return module


def source_payloads(row, contract=None):
    contract = load_contract() if contract is None else contract
    raw = read_exact(row["source_row"]["path"], 0o644, row["source_row"]["bytes"], row["source_row"]["sha256"], cap=100000)
    source = parse(raw)
    require(raw == canonical(source), "source-canonical:" + row["row_id"])
    require(source["schema_id"] == "pw-r9-codex-native-goal-bite-matrix-row-v3" and source["run_id"] == "codex-native-goal-bite-matrix-006" and source["index"] == row["index"] and source["row_id"] == row["row_id"] and source["cell"] == row["cell"] and source["cell_index"] == row["cell_index"], "source-identity:" + row["row_id"])
    roster = ROSTER[row["route"]]
    require(source["route"] == roster["source_route"] and source["model_requested"] == row["model"] and source["reasoning_effort_requested"] == row["reasoning_effort"], "source-roster:" + row["row_id"])
    require(source["subject"] == {"bytes": row["subject"]["bytes"], "chunk_count": row["chunk_count"], "sha256": row["subject"]["sha256"], "source_path": "subjects/cell-" + format(row["cell_index"], "03d") + ".txt"}, "source-subject:" + row["row_id"])
    require(source["expected_output_bytes"] == row["expected_result"]["bytes"] and source["expected_output_sha256"] == row["expected_result"]["sha256"], "source-expected:" + row["row_id"])
    chunks = source["prompt_sequence"]["subject_chunks"]
    require(isinstance(chunks, list) and len(chunks) == row["chunk_count"], "source-chunk-count:" + row["row_id"])
    payloads = []
    for index, item in enumerate(chunks):
        text = item["text"].encode("utf-8")
        require(text.count(b"\n") >= 1, "chunk-newline:" + row["row_id"])
        _, payload = text.split(b"\n", 1)
        require(item["chunk_index"] == index and item["payload_bytes"] == len(payload) and item["payload_sha256"] == sha(payload) and 1 <= len(payload) <= contract["limits"]["subject_slice_max_bytes"], "chunk-payload:" + row["row_id"] + ":" + str(index))
        payloads.append(payload)
    subject = b"".join(payloads)
    require(len(subject) == row["subject"]["bytes"] and sha(subject) == row["subject"]["sha256"], "subject-reconstruct:" + row["row_id"])
    return payloads, subject


def spawn_prompt(row, workdir, contract=None):
    contract = load_contract() if contract is None else contract
    final = format(row["chunk_count"] - 1, "03d")
    raw = ("Use $r9-goal-streamed-row-v5. Exact objective=" + json.dumps(row["goal_objective"]) + "; reader workdir=" + json.dumps(workdir) + "; slice count=" + format(row["chunk_count"], "03d") + ", indexes 000.." + final + ". No subject bytes, criteria, options, or answer are in this message.").encode("utf-8")
    require(len(raw) <= contract["limits"]["spawn_prompt_max_bytes"], "spawn-prompt:" + row["row_id"])
    return raw


def chunk_reader(socket_path, row, payloads):
    sizes = [len(item) for item in payloads]
    digests = [sha(item) for item in payloads]
    source = '''#!/usr/bin/env python3
import hashlib,json,socket,sys
ROW={row_id!r}; PATH={socket_path!r}; SIZES={sizes!r}; DIGESTS={digests!r}
if len(sys.argv)!=3 or len(sys.argv[2])!=3 or not sys.argv[2].isdigit(): raise SystemExit(2)
thread=sys.argv[1]; index=int(sys.argv[2])
if index<0 or index>=len(SIZES): raise SystemExit(2)
request=json.dumps({{"chunk_index":index,"row_id":ROW,"schema_id":"pw-r9-codex-native-goal-db-stream-v5-chunk-request-v1","thread_id":thread}},sort_keys=True,separators=(",",":")).encode()+b"\\n"
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
    raw = source.encode("utf-8")
    require(len(raw) <= 8000 and b"subject" not in raw.lower(), "chunk-reader:" + row["row_id"])
    return raw


def prepare(plan_path, plan_raw, plan, admission_path, admission_raw):
    root = plan["experiment"]["root"]
    require(not os.path.lexists(root), "root-exists")
    make_dir(root, os.path.dirname(root))
    rows_root = os.path.join(root, "rows")
    make_dir(rows_root, root)
    socket_path = os.path.join(root, plan["experiment"]["socket_name"])
    for row in plan["rows"]:
        workdir = os.path.join(rows_root, row["row_id"])
        make_dir(workdir, rows_root)
        payloads, _ = source_payloads(row)
        prompt = spawn_prompt(row, workdir)
        reader = chunk_reader(socket_path, row, payloads)
        pre = {
            "admission": {"bytes": len(admission_raw), "path": admission_path, "sha256": sha(admission_raw)},
            "chunk_count": row["chunk_count"],
            "agent_role": row["agent_role"],
            "goal_objective": row["goal_objective"],
            "model_requested": row["model"],
            "plan": {"bytes": len(plan_raw), "path": plan_path, "sha256": sha(plan_raw)},
            "qualification_credit": 0,
            "reasoning_effort_requested": row["reasoning_effort"],
            "route": row["route"],
            "row_id": row["row_id"],
            "schema_id": "pw-r9-codex-native-goal-db-stream-v5-predeclaration-v1",
            "spawn_prompt": {"bytes": len(prompt), "sha256": sha(prompt)},
            "status": "PREDECLARED_ZERO_SUBJECT_BYTES_IN_ROW_WORKDIR",
            "subject_commitment": row["subject"],
            "task_name": row["task_name"],
            "task_path": row["task_path"],
            "reader": {"bytes": len(reader), "sha256": sha(reader)},
            "workdir": workdir,
        }
        publish(os.path.join(workdir, "predeclaration.json"), canonical(pre))
        publish(os.path.join(workdir, "spawn_prompt.txt"), prompt)
        publish(os.path.join(workdir, "chunk.py"), reader)
    prepared = {"admission": {"bytes": len(admission_raw), "path": admission_path, "sha256": sha(admission_raw)}, "qualification_credit": 0, "row_count": len(plan["rows"]), "schema_id": "pw-r9-codex-native-goal-db-stream-v5-prepared-v1", "status": "PASS_PREPARED_ALL_ROWS_WITH_ZERO_SUBJECT_BYTES_IN_WORKDIRS"}
    publish(os.path.join(root, "prepared.json"), canonical(prepared))
    return prepared


def row_for(plan, row_id):
    rows = [row for row in plan["rows"] if row["row_id"] == row_id]
    require(len(rows) == 1, "row:" + row_id)
    return rows[0]


def workdir_for(plan, row):
    path = os.path.join(plan["experiment"]["root"], "rows", row["row_id"])
    directory(path)
    return path


def claim(plan, row_id):
    row = row_for(plan, row_id)
    workdir = workdir_for(plan, row)
    require(set(os.listdir(workdir)) == {"chunk.py", "predeclaration.json", "spawn_prompt.txt"}, "claim-inventory:" + row_id)
    value = {"agent_role": row["agent_role"], "goal_objective": row["goal_objective"], "qualification_credit": 0, "route": row["route"], "row_id": row_id, "schema_id": "pw-r9-codex-native-goal-db-stream-v5-launch-intent-v1", "status": "CLAIMED_CONSUMED_NO_RETRY", "task_path": row["task_path"]}
    publish(os.path.join(workdir, "launch_intent.json"), canonical(value))
    return value


def receive_line(connection, cap=1024):
    raw = b""
    while len(raw) <= cap:
        part = connection.recv(cap + 1 - len(raw))
        if not part:
            break
        raw += part
    require(len(raw) <= cap and raw.endswith(b"\n") and raw.count(b"\n") == 1, "request-framing")
    value = parse(raw)
    require(raw == canonical(value), "request-canonical")
    return value


def serve(plan_path, plan_raw, plan, admission_path, admission_raw):
    root = plan["experiment"]["root"]
    directory(root)
    directory(os.path.join(root, "rows"))
    _, prepared = read_json(os.path.join(root, "prepared.json"), cap=100000)
    require(prepared["admission"] == {"bytes": len(admission_raw), "path": admission_path, "sha256": sha(admission_raw)}, "prepared-admission")
    socket_path = os.path.join(root, plan["experiment"]["socket_name"])
    require(not os.path.lexists(socket_path), "socket-exists")
    attestor = load_attestor()
    rows = {row["row_id"]: row for row in plan["rows"]}
    corpus = {row_id: source_payloads(row)[0] for row_id, row in rows.items()}
    state = {row_id: {"next": 0, "thread_id": None} for row_id in rows}
    expected_connections = sum(row["chunk_count"] for row in plan["rows"])
    server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    connection_count = 0
    completed = []
    try:
        server.bind(socket_path)
        os.chmod(socket_path, 0o600)
        server.listen(16)
        fsync_dir(root)
        ready = {"expected_connections": expected_connections, "qualification_credit": 0, "row_count": len(rows), "schema_id": "pw-r9-codex-native-goal-db-stream-v5-broker-ready-v1", "socket_path": socket_path, "status": "READY_PRIVATE_SOURCE_PAYLOADS_IN_MEMORY_ZERO_CREDIT"}
        publish(os.path.join(root, "broker_ready.json"), canonical(ready))
        sys.stdout.buffer.write(canonical(ready)); sys.stdout.buffer.flush()
        while connection_count < expected_connections:
            connection, _ = server.accept()
            with connection:
                credentials = connection.getsockopt(socket.SOL_SOCKET, socket.SO_PEERCRED, struct.calcsize("3i"))
                _, uid, _ = struct.unpack("3i", credentials)
                require(uid == os.getuid(), "peer-uid")
                request = receive_line(connection)
                require(set(request) == {"chunk_index", "row_id", "schema_id", "thread_id"} and request["schema_id"] == "pw-r9-codex-native-goal-db-stream-v5-chunk-request-v1", "request-shape")
                row_id = request["row_id"]
                index = request["chunk_index"]
                thread_id = request["thread_id"]
                require(row_id in rows and type(index) is int and UUID.fullmatch(thread_id or ""), "request-values")
                row = rows[row_id]
                current = state[row_id]
                require(index == current["next"] and index < row["chunk_count"], "request-order:" + row_id)
                workdir = workdir_for(plan, row)
                _, launch = read_json(os.path.join(workdir, "launch_intent.json"), cap=10000)
                require(launch["row_id"] == row_id and launch["task_path"] == row["task_path"] and launch["goal_objective"] == row["goal_objective"] and launch["agent_role"] == "default", "launch-intent:" + row_id)
                require(current["thread_id"] in {None, thread_id}, "thread-drift:" + row_id)
                deadline = time.monotonic() + 5.0
                while True:
                    try:
                        proof = attestor.active(thread_id, row["goal_objective"], plan["experiment"]["parent_goal_thread_id"], row["task_path"], row["model"], row["reasoning_effort"])
                        break
                    except (attestor.Invalid, OSError, sqlite3.Error) as error:
                        require(time.monotonic() < deadline, "active-db-timeout:" + str(error))
                        time.sleep(0.02)
                if index == 0:
                    require(current["thread_id"] is None and not os.path.lexists(os.path.join(workdir, "active_goal.json")), "first-chunk-state:" + row_id)
                    current["thread_id"] = thread_id
                    active = {"attestation": proof, "chunk_count": row["chunk_count"], "qualification_credit": 0, "row_id": row_id, "schema_id": "pw-r9-codex-native-goal-db-stream-v5-active-release-v1", "status": "ACTIVE_ATTESTED_BEFORE_FIRST_SUBJECT_SLICE", "subject": row["subject"]}
                    publish(os.path.join(workdir, "active_goal.json"), canonical(active))
                else:
                    require(current["thread_id"] == thread_id, "thread-continuity:" + row_id)
                payload = corpus[row_id][index]
                connection.sendall(payload)
                connection.shutdown(socket.SHUT_WR)
                current["next"] += 1
                connection_count += 1
                if current["next"] == row["chunk_count"]:
                    terminal = {"chunk_count": row["chunk_count"], "goal_thread_id": thread_id, "qualification_credit": 0, "row_id": row_id, "schema_id": "pw-r9-codex-native-goal-db-stream-v5-delivery-terminal-v1", "status": "PASS_ALL_SUBJECT_SLICES_RELEASED_ONLY_WHILE_GOAL_ACTIVE", "subject": row["subject"]}
                    publish(os.path.join(workdir, "delivery_terminal.json"), canonical(terminal))
                    completed.append(row_id)
        require(all(item["next"] == rows[row_id]["chunk_count"] for row_id, item in state.items()), "broker-incomplete")
    finally:
        server.close()
        if os.path.lexists(socket_path):
            os.unlink(socket_path)
            fsync_dir(root)
    terminal = {"completed_rows": sorted(completed), "connection_count": connection_count, "qualification_credit": 0, "row_count": len(rows), "schema_id": "pw-r9-codex-native-goal-db-stream-v5-broker-terminal-v1", "status": "PASS_ALL_ROWS_STREAMED_AFTER_ACTIVE_GOAL_ATTESTATION_ZERO_CREDIT"}
    publish(os.path.join(root, "broker_terminal.json"), canonical(terminal))
    sys.stdout.buffer.write(canonical(terminal)); sys.stdout.buffer.flush()
    return terminal


def stable_trace(path):
    first = read_exact(path, 0o664, cap=6000000)
    time.sleep(0.05)
    second = read_exact(path, 0o664, cap=6000000)
    require(first == second and first.endswith(b"\n") and b"\r" not in first, "trace-stable")
    return first


def output_body(payload):
    output = payload.get("output")
    if payload.get("type") == "custom_tool_call_output":
        require(isinstance(output, list) and len(output) == 2 and all(isinstance(item, dict) and set(item) == {"text", "type"} and item["type"] == "input_text" for item in output), "wrapped-output")
        return output[1]["text"]
    require(payload.get("type") == "function_call_output" and isinstance(output, str), "direct-output")
    match = DIRECT_ENVELOPE.fullmatch(output)
    if match is not None:
        require(int(match.group(1)) == 0, "exec-code")
        return match.group(2)
    return output


def wrapped_tool_name(item):
    source = item.get("input")
    require(isinstance(source, str) and source.count("tools.") == 1, "wrapped-single-tool")
    require(not any(token in source for token in ("tools[", "ALL_TOOLS", "globalThis", "eval(", "Function(", "store(", "load(", "notify(", "Promise.all")), "wrapped-hidden-tool")
    names = re.findall(r"tools\.(exec_command|create_goal|update_goal)\s*\(", source)
    require(len(names) == 1, "wrapped-tool-name")
    return names[0]


def direct_arguments(item):
    source = item.get("arguments")
    require(isinstance(source, str), "direct-arguments")
    value = parse(source.encode("utf-8"))
    require(isinstance(value, dict), "direct-arguments-shape")
    return value


def validate_pregoal_call(item, direct, workdir):
    if direct:
        args = direct_arguments(item)
        require(item.get("name") == "exec_command" and isinstance(args.get("cmd"), str), "pregoal-tool")
        source = args["cmd"]
        require(args.get("workdir") in {None, "/mnt/Cursor/PuppetMaster"}, "pregoal-cwd")
    else:
        require(wrapped_tool_name(item) == "exec_command", "pregoal-tool")
        source = item["input"]
    require("chunk.py" not in source and workdir not in source and SOURCE_ROOT not in source, "pregoal-subject-surface")
    require(SKILL in source or "/home/sittingmongoose/.codex/memories/" in source, "pregoal-scope")


def validate_goal_call(item, direct, objective):
    if direct:
        require(item.get("name") == "create_goal" and direct_arguments(item) == {"objective": objective}, "create-goal-call")
    else:
        require(wrapped_tool_name(item) == "create_goal" and json.dumps(objective) in item["input"], "create-goal-call")


def validate_chunk_call(item, direct, thread_id, index, workdir):
    command = "python3 -B chunk.py " + thread_id + " " + format(index, "03d")
    if direct:
        require(item.get("name") == "exec_command", "chunk-tool")
        args = direct_arguments(item)
        require({"cmd", "max_output_tokens", "workdir", "yield_time_ms"} <= set(args) <= {"cmd", "login", "max_output_tokens", "tty", "workdir", "yield_time_ms"} and args.get("cmd") == command and args.get("workdir") == workdir and args.get("yield_time_ms") == 30000 and args.get("max_output_tokens") == 256 and all(type(args[name]) is bool for name in set(args) & {"login", "tty"}), "chunk-required-projection:" + format(index, "03d"))
    else:
        require(wrapped_tool_name(item) == "exec_command", "chunk-tool")
        source = item["input"]
        require(not re.search(r"\b(?:for|while)\s*\(", source) and ".map(" not in source and source.count("chunk.py") == 1, "chunk-wrapper-batch")
        require(command in source and workdir in source and "yield_time_ms" in source and "30000" in source and "max_output_tokens" in source and "256" in source, "chunk-wrapper-arguments:" + format(index, "03d"))


def validate_update_call(item, direct):
    if direct:
        require(item.get("name") == "update_goal" and direct_arguments(item) == {"status": "complete"}, "update-goal-call")
    else:
        require(wrapped_tool_name(item) == "update_goal" and "complete" in item["input"], "update-goal-call")


def validate_trace(raw, row, active, payloads, subject, workdir):
    lines = raw.splitlines(keepends=True)
    events = []
    for index, line in enumerate(lines):
        require(line.endswith(b"\n") and line.count(b"\n") == 1, "trace-line:" + str(index))
        event = parse(line)
        require(set(event) == {"payload", "timestamp", "type"} and isinstance(event["payload"], dict), "trace-event")
        events.append(event)
    thread_id = active["attestation"]["goal"]["thread_id"]
    metas = [event["payload"] for event in events if event["type"] == "session_meta"]
    require(len(metas) == 1 and metas[0].get("id") == thread_id and metas[0].get("agent_path") == row["task_path"] and metas[0].get("agent_role") == "default", "session-meta")
    direct_calls = [(i, e["payload"]) for i, e in enumerate(events) if e["type"] == "response_item" and e["payload"].get("type") == "function_call"]
    direct_outputs = [(i, e["payload"]) for i, e in enumerate(events) if e["type"] == "response_item" and e["payload"].get("type") == "function_call_output"]
    wrapped_calls = [(i, e["payload"]) for i, e in enumerate(events) if e["type"] == "response_item" and e["payload"].get("type") == "custom_tool_call"]
    wrapped_outputs = [(i, e["payload"]) for i, e in enumerate(events) if e["type"] == "response_item" and e["payload"].get("type") == "custom_tool_call_output"]
    require(not (direct_calls and wrapped_calls) and not (direct_outputs and wrapped_outputs), "mixed-tools")
    direct = bool(direct_calls)
    calls, outputs = (direct_calls, direct_outputs) if direct else (wrapped_calls, wrapped_outputs)
    require(calls and len(outputs) == len(calls), "tool-count")
    names = [item.get("name") if direct else wrapped_tool_name(item) for _, item in calls]
    require(names.count("create_goal") == 1 and names.count("update_goal") == 1, "goal-tool-cardinality")
    create_position = names.index("create_goal")
    require(create_position >= 1 and names[create_position + 1:] == ["exec_command"] * row["chunk_count"] + ["update_goal"], "post-goal-sequence")
    for _, item in calls[:create_position]:
        validate_pregoal_call(item, direct, workdir)
    validate_goal_call(calls[create_position][1], direct, row["goal_objective"])
    for index, (_, item) in enumerate(calls[create_position + 1:-1]):
        validate_chunk_call(item, direct, thread_id, index, workdir)
    validate_update_call(calls[-1][1], direct)
    create_event_index = calls[create_position][0]
    prefix = b"".join(lines[:create_event_index])
    require(all(payload not in prefix for payload in payloads), "subject-before-goal")
    require(not any(i > create_event_index and e["type"] == "response_item" and e["payload"].get("type") == "web_search_call" for i, e in enumerate(events)), "post-goal-web")
    by_call = {item["call_id"]: (index, output_body(item)) for index, item in outputs}
    bodies = []
    for call_index, call in calls:
        require(call["call_id"] in by_call and call_index < by_call[call["call_id"]][0], "call-output")
        bodies.append(by_call[call["call_id"]][1])
    skill = read_exact(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256).decode("utf-8")
    require(skill in bodies[:create_position], "skill-output")
    active_goal = parse(bodies[create_position].encode("utf-8"))["goal"]
    complete_goal = parse(bodies[-1].encode("utf-8"))["goal"]
    require(active_goal["threadId"] == thread_id and active_goal["objective"] == row["goal_objective"] and active_goal["status"] == "active", "active-output")
    require(complete_goal["threadId"] == thread_id and complete_goal["objective"] == row["goal_objective"] and complete_goal["status"] == "complete", "complete-output")
    delivered = b"".join(body.encode("utf-8") for body in bodies[create_position + 1:-1])
    require(delivered == subject, "subject-output")
    finals = [e["payload"] for e in events if e["type"] == "response_item" and e["payload"].get("type") == "message" and e["payload"].get("phase") == "final_answer"]
    require(len(finals) == 1 and len(finals[0].get("content", [])) == 1 and finals[0]["content"][0].get("type") == "output_text", "final-shape")
    result = finals[0]["content"][0].get("text")
    require(isinstance(result, str), "final-text")
    result_raw = result.encode("utf-8")
    require(len(result_raw) == row["expected_result"]["bytes"] and sha(result_raw) == row["expected_result"]["sha256"], "expected-result")
    completes = [(i, e["payload"]) for i, e in enumerate(events) if e["type"] == "event_msg" and e["payload"].get("type") == "task_complete"]
    require(len(completes) == 1 and completes[0][0] == len(events) - 1 and completes[0][1].get("last_agent_message") == result, "task-complete")
    return result_raw, active_goal, complete_goal


def settle(plan, row_id):
    row = row_for(plan, row_id)
    workdir = workdir_for(plan, row)
    require(not os.path.lexists(os.path.join(workdir, "settlement.json")), "settled:" + row_id)
    _, active = read_json(os.path.join(workdir, "active_goal.json"), cap=50000)
    _, delivery = read_json(os.path.join(workdir, "delivery_terminal.json"), cap=10000)
    require(delivery["row_id"] == row_id and delivery["status"] == "PASS_ALL_SUBJECT_SLICES_RELEASED_ONLY_WHILE_GOAL_ACTIVE", "delivery:" + row_id)
    proof = active["attestation"]
    require(proof["status"] == "ACTIVE_NATIVE_GOAL_ATTESTED_BEFORE_SUBJECT" and active["row_id"] == row_id and active["status"] == "ACTIVE_ATTESTED_BEFORE_FIRST_SUBJECT_SLICE", "active-proof:" + row_id)
    attestor = load_attestor()
    terminal = attestor.terminal_absent(proof["goal"]["thread_id"], plan["experiment"]["parent_goal_thread_id"], row["task_path"], row["model"], row["reasoning_effort"])
    trace = stable_trace(proof["thread"]["rollout_path"])
    payloads, subject = source_payloads(row)
    result, active_goal, complete_goal = validate_trace(trace, row, active, payloads, subject, workdir)
    publish(os.path.join(workdir, "terminal_trace.jsonl"), trace)
    publish(os.path.join(workdir, "result.txt"), result)
    terminal_receipt = {"active_goal_output": active_goal, "complete_goal_output": complete_goal, "database_terminal": terminal, "qualification_credit": 0, "row_id": row_id, "schema_id": "pw-r9-codex-native-goal-db-stream-v5-terminal-receipt-v1", "status": "PASS_GOAL_ACTIVE_THROUGH_ALL_SUBJECT_SLICES_AND_COMPLETE"}
    publish(os.path.join(workdir, "terminal_goal.json"), canonical(terminal_receipt))
    settlement = {"chunk_count": row["chunk_count"], "goal_thread_id": proof["goal"]["thread_id"], "qualification_credit": 0, "result": {"bytes": len(result), "sha256": sha(result)}, "row_id": row_id, "schema_id": "pw-r9-codex-native-goal-db-stream-v5-settlement-v1", "status": "PASS_PROTOCOL_ZERO_CREDIT", "trace": {"bytes": len(trace), "sha256": sha(trace)}}
    publish(os.path.join(workdir, "settlement.json"), canonical(settlement))
    return settlement


def ready(plan):
    values = []
    for row in plan["rows"]:
        workdir = workdir_for(plan, row)
        if not os.path.lexists(os.path.join(workdir, "launch_intent.json")):
            prompt = read_exact(os.path.join(workdir, "spawn_prompt.txt"), 0o444, cap=512).decode("utf-8")
            values.append({"agent_type": row["agent_role"], "model": row["model"], "reasoning_effort": row["reasoning_effort"], "row_id": row["row_id"], "spawn_prompt": prompt, "task_name": row["task_name"], "workdir": workdir})
            if len(values) == plan["experiment"]["max_in_flight"]:
                break
    return values


def seal(plan):
    root = plan["experiment"]["root"]
    require(not os.path.lexists(os.path.join(root, "accounting.json")), "sealed")
    _, broker_terminal = read_json(os.path.join(root, "broker_terminal.json"), cap=100000)
    require(broker_terminal["row_count"] == len(plan["rows"]) and broker_terminal["completed_rows"] == sorted(row["row_id"] for row in plan["rows"]) and broker_terminal["status"] == "PASS_ALL_ROWS_STREAMED_AFTER_ACTIVE_GOAL_ATTESTATION_ZERO_CREDIT", "broker-terminal")
    identities = []
    route_counts = {key: 0 for key in ROSTER}
    seen_threads = set()
    for row in plan["rows"]:
        workdir = workdir_for(plan, row)
        _, settlement = read_json(os.path.join(workdir, "settlement.json"), cap=10000)
        require(settlement["status"] == "PASS_PROTOCOL_ZERO_CREDIT" and settlement["row_id"] == row["row_id"] and settlement["goal_thread_id"] not in seen_threads, "settlement:" + row["row_id"])
        seen_threads.add(settlement["goal_thread_id"])
        result = read_exact(os.path.join(workdir, "result.txt"), 0o444, row["expected_result"]["bytes"], row["expected_result"]["sha256"], cap=8192)
        identities.append({"bytes": len(result), "row_id": row["row_id"], "sha256": sha(result)})
        route_counts[row["route"]] += 1
    result_root = sha(canonical(identities))
    kind = plan["experiment"]["kind"]
    if kind == "canary":
        terminal_name = "canary_terminal.json"
        terminal = {"experiment_id": plan["experiment"]["id"], "fresh_goal_count": len(plan["rows"]), "qualification_credit": 0, "result_identity_root": result_root, "row_count": len(plan["rows"]), "schema_id": "pw-r9-codex-native-goal-db-stream-v5-canary-terminal-v1", "status": "PASS_STREAMED_CORPUS_CANARY_ZERO_CREDIT"}
        accounting = {"clean_full_matrix_streak": plan["qualification"]["clean_full_matrix_streak_before"], "fresh_goal_count": len(plan["rows"]), "full_matrix_count": 0, "qualification_credit": 0, "qualification_score": "0/2", "required_consecutive_clean_full_matrices": 2, "schema_id": "pw-r9-codex-native-goal-db-stream-v5-accounting-v1", "status": "SEALED_STREAMED_CANARY_ZERO_CREDIT"}
    else:
        terminal_name = "matrix_terminal.json"
        ordinal = plan["experiment"]["matrix_ordinal"]
        terminal = {"experiment_id": plan["experiment"]["id"], "failure_count": 0, "fresh_goal_count": len(plan["rows"]), "matrix_ordinal": ordinal, "pass_count": len(plan["rows"]), "qualification_credit": 0, "result_identity_root": result_root, "route_counts": route_counts, "row_count": len(plan["rows"]), "schema_id": "pw-r9-codex-native-goal-db-stream-v5-matrix-terminal-v1", "status": "PASS_CLEAN_FULL_MATRIX_ZERO_CREDIT"}
        streak = plan["qualification"]["clean_full_matrix_streak_before"] + 1
        accounting = {"clean_full_matrix_streak": streak, "fresh_goal_count": len(plan["rows"]), "full_matrix_count": ordinal, "qualification_credit": 0, "qualification_score": "0/2", "required_consecutive_clean_full_matrices": 2, "schema_id": "pw-r9-codex-native-goal-db-stream-v5-accounting-v1", "status": "SEALED_MATRIX_CLEAN_STREAK_" + str(streak) + "_ZERO_CREDIT_PENDING_TWO_MATRIX_BAR"}
    publish(os.path.join(root, terminal_name), canonical(terminal))
    publish(os.path.join(root, "accounting.json"), canonical(accounting))
    return accounting


def main(argv):
    require(len(argv) >= 3 and argv[1] in {"--check", "--prepare", "--serve", "--ready", "--claim", "--settle", "--seal"}, "argv")
    plan_path = os.path.realpath(argv[2])
    plan_raw, plan = load_plan(plan_path)
    command = argv[1]
    if command == "--check":
        require(len(argv) == 3 and not os.path.lexists(plan["experiment"]["root"]), "check-state")
        result = {"first_mismatch": None, "qualification_credit": 0, "status": "PASS_DATA_ONLY_ZERO_WRITES"}
    elif command in {"--prepare", "--serve"}:
        require(len(argv) == 4, "admission-argv")
        admission_path = os.path.realpath(argv[3])
        admission_raw, _ = load_admission(admission_path, plan_path, plan_raw, plan)
        result = prepare(plan_path, plan_raw, plan, admission_path, admission_raw) if command == "--prepare" else serve(plan_path, plan_raw, plan, admission_path, admission_raw)
    elif command == "--ready":
        require(len(argv) == 3, "ready-argv")
        result = {"qualification_credit": 0, "ready": ready(plan), "status": "PASS_READ_ONLY"}
    elif command == "--claim":
        require(len(argv) == 4, "claim-argv")
        result = claim(plan, argv[3])
    elif command == "--settle":
        require(len(argv) == 4, "settle-argv")
        result = settle(plan, argv[3])
    else:
        require(len(argv) == 3, "seal-argv")
        result = seal(plan)
    sys.stdout.buffer.write(canonical(result)); sys.stdout.buffer.flush()
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, ValueError, KeyError, TypeError, json.JSONDecodeError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "qualification_credit": 0, "status": "FAIL"})); sys.stdout.buffer.flush()
        raise SystemExit(1)
