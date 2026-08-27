#!/usr/bin/env python3
import glob
import hashlib
import importlib.util
import json
import os
import re
import stat
import sys

sys.dont_write_bytecode = True
SELF = "/mnt/Cursor/PuppetMaster/tests/r9g30/stream_harness.py"
BASE = "/mnt/Cursor/PuppetMaster/tests/r9g29/goal_harness.py"
BASE_BYTES = 30406
BASE_SHA256 = "4dbbd261b5e6b51839941b4001adc662ed6ac714ad1d2c6aa176ec853d45544c"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-streamed-row/SKILL.md"
SKILL_BYTES = 1425
SKILL_SHA256 = "93326a766bf70f98c4c859a7f2d183c68b91378f34583b313e39040760d4e046"
DECODER = "/mnt/Cursor/PuppetMaster/tests/r9g30/stream_decoder.py"
DECODER_BYTES = 6802
DECODER_SHA256 = "63d3d43284528e01adecaebcc9ff5acbd8a0d9e844340da38d2c66ca5fae7b26"
SEMANTIC = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/formal_candidate_v7/semantic_bundle.json"
SEMANTIC_BYTES = 786546
SEMANTIC_SHA256 = "11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2"
SESSION_GLOB = "/home/sittingmongoose/.codex/sessions/*/*/*/*-{}.jsonl"
ROSTER = {
    "alpha": {"model": "gpt-5.4-mini", "reasoning_effort": "xhigh"},
    "bravo": {"model": "gpt-5.4-mini", "reasoning_effort": "medium"},
    "charlie": {"model": "gpt-5.6-luna", "reasoning_effort": "medium"},
}
AUTHORITY = {"canary_launch": False, "matrix_launch": False, "qualification": False,
             "qualification_credit": 0, "release": False}
FAILURE = {"best_of": 0, "continue_after_failure": False, "relaunch": 0,
           "replacement": 0, "resend": 0, "retry": 0, "reuse": 0}
QUALIFICATION = {"clean_full_matrix_streak": 0, "credit": "0/2",
                 "required_consecutive_clean_full_matrices": 2}
LIMITS = {"goal_objective_utf8_bytes_max": 128, "result_utf8_bytes_max": 2048,
          "slice_payload_utf8_bytes_max": 170, "spawn_prompt_utf8_bytes_max": 512,
          "subject_utf8_bytes_max": 20000}
PREPARED_FILES = {"chunk.py", "predeclaration.json", "spawn_prompt.txt", "subject.packet"}
TERMINAL_FILES = {"goal_receipt.json", "result.txt", "terminal_trace.jsonl"}
PRE_FIELDS = {"cell", "cell_index", "decoder_bytes", "decoder_sha256", "expected_bytes",
              "expected_sha256", "goal_objective", "harness_bytes", "harness_sha256",
              "model_requested", "parent_thread_id", "plan_bytes", "plan_path", "plan_sha256",
              "reasoning_effort_requested", "review_nonce", "route", "row_id", "schema_id",
              "semantic_bytes", "semantic_sha256", "skill_bytes", "skill_sha256", "slice_count",
              "subject_bytes", "subject_sha256", "task_path", "wrapper_bytes", "wrapper_sha256"}
RELEASE_FIELDS = {"chunk_bytes", "chunk_index", "chunk_sha256", "goal_thread_id",
                  "qualification_credit", "review_nonce", "row_id", "schema_id", "status",
                  "task_path", "trace_path", "trace_prefix_bytes", "trace_prefix_sha256"}
ROW_ID = re.compile(r"^R[0-9]{3}$")
PREFIX = re.compile(r"^[A-Z][A-Z0-9]{1,15}$")
TASK_PREFIX = re.compile(r"^r9_[a-z0-9_]{1,32}_$")
HEX = re.compile(r"^[0-9a-f]{64}$")
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


def load_module(path, size, digest, name):
    before = os.lstat(path)
    if not (stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode)
            and stat.S_IMODE(before.st_mode) == 0o644 and before.st_uid == os.getuid()
            and before.st_nlink == 1 and before.st_size == size):
        raise ValueError("module-custody:" + name)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        raw = b""
        while len(raw) < size:
            part = os.read(fd, size - len(raw))
            if not part:
                raise ValueError("module-short:" + name)
            raw += part
        if os.read(fd, 1):
            raise ValueError("module-trailing:" + name)
    finally:
        os.close(fd)
    if hashlib.sha256(raw).hexdigest() != digest:
        raise ValueError("module-digest:" + name)
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise ValueError("module-spec:" + name)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


H = load_module(BASE, BASE_BYTES, BASE_SHA256, "r9g30_frozen_safe_base")
Invalid = H.Invalid


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def self_identity():
    raw = H.read_exact(SELF, 0o644, cap=150000)
    return {"bytes": len(raw), "mode": "0644", "path": SELF, "sha256": H.sha(raw)}


def binding(path, size, digest):
    return {"bytes": size, "mode": "0644", "path": path, "sha256": digest}


def immutable_binding(path, size, digest):
    return {"bytes": size, "mode": "0444", "path": path, "sha256": digest}


def load_semantic():
    raw = H.read_exact(SEMANTIC, 0o644, SEMANTIC_BYTES, SEMANTIC_SHA256)
    value = H.parse(raw)
    require(raw == H.canonical(value) and value.get("schema_id") == "pw-r9-immutable-semantic-bundle-v1", "semantic")
    require(value.get("routes") == [
        {"model": "gpt-5.4-mini", "reasoning_effort": "xhigh", "slot": "slot-alpha"},
        {"model": "gpt-5.4-mini", "reasoning_effort": "medium", "slot": "slot-bravo"},
        {"model": "gpt-5.6-luna", "reasoning_effort": "medium", "slot": "slot-charlie"}], "semantic-roster")
    cells = value.get("cells")
    require(isinstance(cells, list) and len(cells) == 97, "semantic-cells")
    for index, cell in enumerate(cells):
        require(cell.get("index") == index and isinstance(cell.get("cell"), str), "cell-index")
        subject = cell.get("render_utf8")
        expected = cell.get("expected_output_utf8")
        require(isinstance(subject, str) and isinstance(expected, str), "cell-text")
        subject_raw = subject.encode("utf-8")
        expected_raw = expected.encode("utf-8")
        require((len(subject_raw), H.sha(subject_raw)) == (cell.get("render_utf8_bytes"), cell.get("render_utf8_sha256")), "cell-subject")
        require((len(expected_raw), H.sha(expected_raw)) == (cell.get("expected_output_bytes"), cell.get("expected_output_sha256")), "cell-expected")
        require(1 <= len(subject_raw) <= LIMITS["subject_utf8_bytes_max"]
                and 1 <= len(expected_raw) <= LIMITS["result_utf8_bytes_max"], "cell-limits")
    return value, cells


def expected_bindings():
    return {
        "bootstrap_skill": binding(SKILL, SKILL_BYTES, SKILL_SHA256),
        "safe_base": binding(BASE, BASE_BYTES, BASE_SHA256),
        "semantic_bundle": binding(SEMANTIC, SEMANTIC_BYTES, SEMANTIC_SHA256),
        "stream_decoder": binding(DECODER, DECODER_BYTES, DECODER_SHA256),
    }


def validate_plan(plan):
    require(isinstance(plan, dict) and set(plan) == {"authority", "bindings", "experiment",
            "failure_contract", "limits", "qualification", "roster", "rows", "schema_id", "status"}, "plan-shape")
    require(plan["authority"] == AUTHORITY and plan["failure_contract"] == FAILURE
            and plan["qualification"] == QUALIFICATION and plan["roster"] == ROSTER
            and plan["limits"] == LIMITS, "plan-controls")
    require(plan["schema_id"] == "pw-r9-codex-native-goal-streamed-matrix-plan-v1"
            and plan["status"] == "PREDECLARED_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "plan-identity")
    require(plan["bindings"] == expected_bindings(), "plan-bindings")
    for item in plan["bindings"].values():
        H.read_exact(item["path"], 0o644, item["bytes"], item["sha256"])
    experiment = plan["experiment"]
    require(set(experiment) == {"experiment_id", "kind", "manifest_path", "matrix_index",
            "max_parallel", "objective_prefix", "parent_thread_id", "root", "row_count",
            "schedule", "stop_at_first_nonpass", "task_prefix"}, "experiment-shape")
    require(experiment["kind"] in {"STREAMED_CANARY", "FULL_MATRIX"}
            and experiment["max_parallel"] == 3 and experiment["stop_at_first_nonpass"] is True
            and experiment["schedule"] == "CELL_MAJOR_ALPHA_BRAVO_CHARLIE", "experiment-controls")
    require(PREFIX.fullmatch(experiment["objective_prefix"] or "")
            and TASK_PREFIX.fullmatch(experiment["task_prefix"] or "")
            and UUID.fullmatch(experiment["parent_thread_id"] or ""), "experiment-tokens")
    require(os.path.isabs(experiment["root"]) and os.path.realpath(experiment["root"]) == experiment["root"]
            and experiment["root"].startswith("/mnt/Cursor/PuppetMaster/tests/r9g30/"), "root")
    require(os.path.isabs(experiment["manifest_path"])
            and os.path.realpath(experiment["manifest_path"]) == experiment["manifest_path"]
            and experiment["manifest_path"].startswith("/mnt/Cursor/PuppetMaster/tests/r9g30/"), "manifest")
    rows = plan["rows"]
    require(isinstance(rows, list) and len(rows) == experiment["row_count"]
            and len(rows) in {3, 291}, "row-count")
    cells = load_semantic()[1]
    seen = set()
    route_counts = {name: 0 for name in ROSTER}
    cell_counts = {}
    for index, row in enumerate(rows):
        require(isinstance(row, dict) and set(row) == {"cell", "cell_index", "model",
                "reasoning_effort", "route", "row_id"}, "row-shape")
        require(ROW_ID.fullmatch(row["row_id"] or "") and row["row_id"] == "R{:03d}".format(index)
                and row["row_id"] not in seen, "row-id")
        require(type(row["cell_index"]) is int and 0 <= row["cell_index"] < 97
                and row["cell"] == cells[row["cell_index"]]["cell"], "row-cell")
        require(row["route"] in ROSTER
                and {"model": row["model"], "reasoning_effort": row["reasoning_effort"]} == ROSTER[row["route"]], "row-route")
        expected_route = ("alpha", "bravo", "charlie")[index % 3]
        require(row["route"] == expected_route, "row-order")
        seen.add(row["row_id"]); route_counts[row["route"]] += 1
        cell_counts[row["cell_index"]] = cell_counts.get(row["cell_index"], 0) + 1
    require(len(set(route_counts.values())) == 1 and all(count == 3 for count in cell_counts.values()), "row-coverage")


def read_plan(path):
    require(os.path.isabs(path) and os.path.realpath(path) == path
            and path.startswith("/mnt/Cursor/PuppetMaster/tests/r9g30/"), "plan-path")
    raw = H.read_exact(path, 0o444, cap=1000000)
    plan = H.parse(raw)
    require(raw == H.canonical(plan), "plan-canonical")
    validate_plan(plan)
    return raw, plan


def chunks(subject):
    output = []
    current = ""
    for char in subject.decode("utf-8"):
        candidate = (current + char).encode("utf-8")
        if current and len(candidate) > LIMITS["slice_payload_utf8_bytes_max"]:
            output.append(current.encode("utf-8")); current = char
        else:
            current += char
    if current:
        output.append(current.encode("utf-8"))
    require(bool(output) and b"".join(output) == subject
            and max(map(len, output)) <= LIMITS["slice_payload_utf8_bytes_max"], "chunks")
    return output


def derive(plan_raw, plan, row):
    experiment = plan["experiment"]
    nonce = H.sha(b"pw-r9-goal-streamed-row-v1\0" + H.sha(plan_raw).encode("ascii")
                  + b"\0" + row["row_id"].encode("ascii") + b"\0" + row["route"].encode("ascii"))
    objective = "{}|r={}|x={}|once".format(experiment["objective_prefix"], row["row_id"], nonce)
    task_name = experiment["task_prefix"] + nonce
    workdir = experiment["root"] + "/" + row["row_id"] + "/" + nonce
    require(len(objective.encode("utf-8")) <= LIMITS["goal_objective_utf8_bytes_max"], "objective-limit")
    return {"goal_objective": objective, "model": row["model"], "reasoning_effort": row["reasoning_effort"],
            "review_nonce": nonce, "route": row["route"], "row_id": row["row_id"],
            "task_name": task_name, "task_path": "/root/" + task_name, "workdir": workdir}


def cell_values(cells, row):
    cell = cells[row["cell_index"]]
    return cell["render_utf8"].encode("utf-8"), cell["expected_output_utf8"].encode("utf-8")


def wrapper(plan_path):
    text = '#!/usr/bin/env python3\nimport runpy,sys\n\nsys.argv=["stream_harness.py","--chunk",{0},sys.argv[1],sys.argv[2]]\nrunpy.run_path({1},run_name="__main__")\n'.format(json.dumps(plan_path), json.dumps(SELF))
    return text.encode("utf-8")


def spawn_prompt(item, count):
    raw = ("Use $r9-goal-streamed-row. Exact objective=" + json.dumps(item["goal_objective"])
           + "; reader workdir=" + json.dumps(item["workdir"])
           + "; slice_count=" + str(count) + ". No subject is in this message.").encode("utf-8")
    require(len(raw) <= LIMITS["spawn_prompt_utf8_bytes_max"], "spawn-prompt")
    return raw


def predeclaration(plan_path, plan_raw, plan, row, item, subject, expected, wrap):
    return {"cell": row["cell"], "cell_index": row["cell_index"], "decoder_bytes": DECODER_BYTES,
            "decoder_sha256": DECODER_SHA256, "expected_bytes": len(expected), "expected_sha256": H.sha(expected),
            "goal_objective": item["goal_objective"], "harness_bytes": self_identity()["bytes"],
            "harness_sha256": self_identity()["sha256"], "model_requested": item["model"],
            "parent_thread_id": plan["experiment"]["parent_thread_id"], "plan_bytes": len(plan_raw),
            "plan_path": plan_path, "plan_sha256": H.sha(plan_raw),
            "reasoning_effort_requested": item["reasoning_effort"], "review_nonce": item["review_nonce"],
            "route": item["route"], "row_id": item["row_id"],
            "schema_id": "pw-r9-codex-native-goal-streamed-row-predeclaration-v1",
            "semantic_bytes": SEMANTIC_BYTES, "semantic_sha256": SEMANTIC_SHA256,
            "skill_bytes": SKILL_BYTES, "skill_sha256": SKILL_SHA256,
            "slice_count": len(chunks(subject)), "subject_bytes": len(subject), "subject_sha256": H.sha(subject),
            "task_path": item["task_path"], "wrapper_bytes": len(wrap), "wrapper_sha256": H.sha(wrap)}


def release_name(index):
    return "release-{:03d}.json".format(index)


def expected_files(slice_count, terminal=False):
    names = PREPARED_FILES | {release_name(index) for index in range(slice_count)}
    return names | TERMINAL_FILES if terminal else names


def read_pre(row_path):
    raw = H.read_exact(os.path.join(row_path, "predeclaration.json"), 0o444, cap=8192)
    value = H.parse(raw)
    require(raw == H.canonical(value) and set(value) == PRE_FIELDS
            and value["schema_id"] == "pw-r9-codex-native-goal-streamed-row-predeclaration-v1", "predeclaration")
    return value


def locate(row_path):
    require(os.path.isabs(row_path) and os.path.realpath(row_path) == row_path, "row-path")
    pre = read_pre(row_path)
    plan_raw, plan = read_plan(pre["plan_path"])
    row = next((value for value in plan["rows"] if value["row_id"] == pre["row_id"]), None)
    require(row is not None, "row")
    item = derive(plan_raw, plan, row)
    require(row_path == item["workdir"] and os.path.basename(row_path) == pre["review_nonce"], "row-control")
    H.directory(plan["experiment"]["root"], 0o700)
    H.directory(os.path.dirname(row_path), 0o700); H.directory(row_path, 0o700)
    cells = load_semantic()[1]
    subject, expected = cell_values(cells, row)
    wrap = wrapper(pre["plan_path"])
    require(pre == predeclaration(pre["plan_path"], plan_raw, plan, row, item, subject, expected, wrap), "pre-values")
    require(H.read_exact(os.path.join(row_path, "subject.packet"), 0o444, len(subject), H.sha(subject)) == subject, "subject-copy")
    require(H.read_exact(os.path.join(row_path, "chunk.py"), 0o444, len(wrap), H.sha(wrap)) == wrap, "wrapper-copy")
    prompt = spawn_prompt(item, len(chunks(subject)))
    require(H.read_exact(os.path.join(row_path, "spawn_prompt.txt"), 0o444, len(prompt), H.sha(prompt)) == prompt
            and subject not in prompt, "spawn-copy")
    return pre, plan_raw, plan, row, item, subject, expected


def row_projection(plan_raw, plan):
    cells = load_semantic()[1]
    output = []
    for row in plan["rows"]:
        item = derive(plan_raw, plan, row)
        subject, expected = cell_values(cells, row)
        count = len(chunks(subject))
        prompt = spawn_prompt(item, count)
        output.append({**item, "cell": row["cell"], "cell_index": row["cell_index"],
                       "expected_bytes": len(expected), "expected_sha256": H.sha(expected),
                       "slice_count": count, "spawn_prompt_bytes": len(prompt),
                       "spawn_prompt_sha256": H.sha(prompt), "subject_bytes": len(subject),
                       "subject_sha256": H.sha(subject)})
    return output


def prepare(plan_path):
    plan_raw, plan = read_plan(plan_path)
    experiment = plan["experiment"]
    require(not os.path.lexists(experiment["root"]) and not os.path.lexists(experiment["manifest_path"]), "create-only-state")
    harness = self_identity(); cells = load_semantic()[1]; wrap = wrapper(plan_path)
    H.make_dir(experiment["root"], os.path.dirname(experiment["root"]))
    rows = []
    for row in plan["rows"]:
        item = derive(plan_raw, plan, row)
        row_parent = experiment["root"] + "/" + row["row_id"]
        H.make_dir(row_parent, experiment["root"]); H.make_dir(item["workdir"], row_parent)
        subject, expected = cell_values(cells, row)
        sliced = chunks(subject); prompt = spawn_prompt(item, len(sliced))
        H.publish(item["workdir"] + "/predeclaration.json", H.canonical(
            predeclaration(plan_path, plan_raw, plan, row, item, subject, expected, wrap)))
        H.publish(item["workdir"] + "/spawn_prompt.txt", prompt)
        H.publish(item["workdir"] + "/subject.packet", subject)
        H.publish(item["workdir"] + "/chunk.py", wrap)
        require(set(os.listdir(item["workdir"])) == PREPARED_FILES, "prepared-inventory")
        rows.append({**item, "cell": row["cell"], "cell_index": row["cell_index"],
                     "expected_bytes": len(expected), "expected_sha256": H.sha(expected),
                     "slice_count": len(sliced), "spawn_prompt_bytes": len(prompt),
                     "spawn_prompt_sha256": H.sha(prompt), "subject_bytes": len(subject),
                     "subject_sha256": H.sha(subject)})
    manifest = {"authority": AUTHORITY, "components": {"bootstrap_skill": plan["bindings"]["bootstrap_skill"],
            "harness": harness, "plan": immutable_binding(plan_path, len(plan_raw), H.sha(plan_raw)),
            "semantic_bundle": plan["bindings"]["semantic_bundle"], "stream_decoder": plan["bindings"]["stream_decoder"],
            "wrapper": {"bytes": len(wrap), "mode": "0444", "sha256": H.sha(wrap)}},
            "experiment": experiment, "qualification": QUALIFICATION, "rows": rows,
            "schema_id": "pw-r9-codex-native-goal-streamed-prepared-manifest-v1",
            "status": "PREPARED_CONTROL_ONLY_ZERO_CREDIT_NO_LAUNCH_AUTHORITY"}
    manifest_raw = H.canonical(manifest); H.publish(experiment["manifest_path"], manifest_raw)
    return {"first_mismatch": None, "manifest": {"bytes": len(manifest_raw), "sha256": H.sha(manifest_raw)},
            "max_slice_count": max(row["slice_count"] for row in rows),
            "max_spawn_prompt_bytes": max(row["spawn_prompt_bytes"] for row in rows),
            "max_subject_bytes": max(row["subject_bytes"] for row in rows), "qualification_credit": 0,
            "route_counts": {name: sum(row["route"] == name for row in rows) for name in ROSTER},
            "row_count": len(rows), "schema_id": "pw-r9-codex-native-goal-streamed-prepare-v1",
            "status": "PASS_PREPARED_ZERO_CALLS_ZERO_CREDIT", "subject_calls": 0}


def check(plan_path):
    plan_raw, plan = read_plan(plan_path)
    require(not os.path.lexists(plan["experiment"]["root"])
            and not os.path.lexists(plan["experiment"]["manifest_path"]), "check-no-write-state")
    rows = row_projection(plan_raw, plan)
    return {"assertion_count": 181 + 22 * len(rows), "first_mismatch": None,
            "max_slice_count": max(row["slice_count"] for row in rows),
            "max_spawn_prompt_bytes": max(row["spawn_prompt_bytes"] for row in rows),
            "max_subject_bytes": max(row["subject_bytes"] for row in rows), "qualification_credit": 0,
            "route_counts": {name: sum(row["route"] == name for row in rows) for name in ROSTER},
            "row_count": len(rows), "schema_id": "pw-r9-codex-native-goal-streamed-harness-check-v1",
            "status": "PASS_DATA_ONLY_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}


def trace_path(thread_id):
    require(UUID.fullmatch(thread_id or ""), "thread")
    paths = glob.glob(SESSION_GLOB.format(thread_id))
    require(len(paths) == 1 and os.path.basename(paths[0]).endswith("-" + thread_id + ".jsonl"), "trace-path")
    return paths[0]


def active_trace(thread_id):
    path = trace_path(thread_id); before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode)
            and stat.S_IMODE(before.st_mode) == 0o664 and before.st_uid == os.getuid()
            and before.st_nlink == 1 and 1 <= before.st_size <= 4000000, "trace-custody")
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require((os.fstat(fd).st_dev, os.fstat(fd).st_ino) == (before.st_dev, before.st_ino), "trace-race")
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw)); require(bool(part), "trace-short"); raw += part
        after = os.fstat(fd)
        require((after.st_dev, after.st_ino) == (before.st_dev, before.st_ino)
                and after.st_size >= before.st_size, "trace-inode")
    finally:
        os.close(fd)
    return path, raw


def stable_trace(thread_id):
    path = trace_path(thread_id)
    return path, H.read_exact(path, 0o664, cap=4000000)


def load_decoder():
    module = load_module(DECODER, DECODER_BYTES, DECODER_SHA256, "r9g30_stream_decoder_runtime")
    require(module.__all__ == ("Invalid", "validate_pending", "validate_terminal"), "decoder-api")
    return module


def control(pre, item, thread_id):
    return {"effort": pre["reasoning_effort_requested"], "model": pre["model_requested"],
            "objective": pre["goal_objective"], "parent_thread_id": pre["parent_thread_id"],
            "skill_alias_path": "/home/sittingmongoose/.codex/skills/.system/r9-goal-streamed-row/SKILL.md",
            "skill_path": SKILL, "task_path": pre["task_path"], "thread_id": thread_id,
            "workdir": item["workdir"]}


def release_expected(pre, item, thread_id, path, trace, sliced, index):
    return {"chunk_bytes": len(sliced[index]), "chunk_index": index,
            "chunk_sha256": H.sha(sliced[index]), "goal_thread_id": thread_id,
            "qualification_credit": 0, "review_nonce": pre["review_nonce"], "row_id": pre["row_id"],
            "schema_id": "pw-r9-codex-native-goal-streamed-slice-release-v1",
            "status": "PASS_ACTIVE_GOAL_SLICE_RELEASED_ZERO_CREDIT", "task_path": item["task_path"],
            "trace_path": path, "trace_prefix_bytes": len(trace), "trace_prefix_sha256": H.sha(trace)}


def release(plan_path, thread_id, index_text):
    require(re.fullmatch(r"[0-9]{3}", index_text or ""), "index-text")
    index = int(index_text); row_path = os.getcwd()
    pre, _, _, _, item, subject, _ = locate(row_path); sliced = chunks(subject)
    require(pre["plan_path"] == plan_path and 0 <= index < len(sliced), "release-control")
    expected_before = PREPARED_FILES | {release_name(value) for value in range(index)}
    require(set(os.listdir(row_path)) == expected_before, "release-inventory")
    decoder = load_decoder(); skill = H.read_exact(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256)
    path, trace = active_trace(thread_id)
    proof = decoder.validate_pending(trace, control(pre, item, thread_id), sliced, skill, index)
    require(proof["profile"] == "GOAL_STREAMED_READER_V1"
            and proof["session"]["agent_path"] == item["task_path"], "release-proof")
    H.publish(os.path.join(row_path, release_name(index)), H.canonical(
        release_expected(pre, item, thread_id, path, trace, sliced, index)))
    sys.stdout.buffer.write(sliced[index])


def read_release(row_path, pre, item, sliced, index, terminal_trace=None):
    raw = H.read_exact(os.path.join(row_path, release_name(index)), 0o444, cap=4096)
    value = H.parse(raw)
    require(raw == H.canonical(value) and set(value) == RELEASE_FIELDS, "release-shape")
    require(value["schema_id"] == "pw-r9-codex-native-goal-streamed-slice-release-v1"
            and value["status"] == "PASS_ACTIVE_GOAL_SLICE_RELEASED_ZERO_CREDIT", "release-status")
    require(value["chunk_index"] == index and value["chunk_bytes"] == len(sliced[index])
            and value["chunk_sha256"] == H.sha(sliced[index]) and value["review_nonce"] == pre["review_nonce"]
            and value["row_id"] == pre["row_id"] and value["task_path"] == item["task_path"], "release-values")
    require(UUID.fullmatch(value["goal_thread_id"] or "") and os.path.realpath(value["trace_path"]) == value["trace_path"], "release-identity")
    if terminal_trace is not None:
        require(value["trace_prefix_bytes"] <= len(terminal_trace)
                and H.sha(terminal_trace[:value["trace_prefix_bytes"]]) == value["trace_prefix_sha256"], "release-prefix")
    return value


def manifest_rows(plan_path, plan_raw, plan):
    raw = H.read_exact(plan["experiment"]["manifest_path"], 0o444, cap=1000000)
    value = H.parse(raw); harness = self_identity(); rows = row_projection(plan_raw, plan); wrap = wrapper(plan_path)
    expected = {"authority": AUTHORITY, "components": {"bootstrap_skill": plan["bindings"]["bootstrap_skill"],
            "harness": harness, "plan": immutable_binding(plan_path, len(plan_raw), H.sha(plan_raw)),
            "semantic_bundle": plan["bindings"]["semantic_bundle"], "stream_decoder": plan["bindings"]["stream_decoder"],
            "wrapper": {"bytes": len(wrap), "mode": "0444", "sha256": H.sha(wrap)}},
            "experiment": plan["experiment"], "qualification": QUALIFICATION, "rows": rows,
            "schema_id": "pw-r9-codex-native-goal-streamed-prepared-manifest-v1",
            "status": "PREPARED_CONTROL_ONLY_ZERO_CREDIT_NO_LAUNCH_AUTHORITY"}
    require(raw == H.canonical(value) == H.canonical(expected), "manifest-values")
    return rows


def prepared(row_path):
    before = H.inventory_sha(row_path, PREPARED_FILES)
    pre, _, _, row, _, subject, expected = locate(row_path)
    require(set(os.listdir(row_path)) == PREPARED_FILES and H.inventory_sha(row_path, PREPARED_FILES) == before, "prepared-drift")
    return {"expected_bytes": len(expected), "inventory_projection_sha256": before,
            "qualification_credit": 0, "review_nonce": pre["review_nonce"], "route": row["route"],
            "row_id": row["row_id"], "schema_id": "pw-r9-codex-native-goal-streamed-record-v1",
            "status": "PASS_PREPARED_ZERO_CREDIT", "subject_bytes": len(subject), "workspace_writes": 0}


def terminal(row_path, write):
    pre, _, _, row, item, subject, expected = locate(row_path); sliced = chunks(subject)
    expected_before = expected_files(len(sliced), terminal=not write)
    require(set(os.listdir(row_path)) == expected_before, "terminal-inventory")
    first = read_release(row_path, pre, item, sliced, 0)
    path, trace = stable_trace(first["goal_thread_id"])
    require(path == first["trace_path"], "terminal-trace-path")
    releases = [read_release(row_path, pre, item, sliced, index, trace) for index in range(len(sliced))]
    require(all(value["goal_thread_id"] == first["goal_thread_id"]
                and value["trace_path"] == path for value in releases), "release-global")
    decoder = load_decoder(); skill = H.read_exact(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256)
    proof = decoder.validate_terminal(trace, control(pre, item, first["goal_thread_id"]), sliced, skill, expected)
    require(proof["profile"] == "GOAL_STREAMED_READER_V1"
            and proof["session"]["agent_path"] == item["task_path"]
            and proof["result"].encode("utf-8") == expected, "terminal-proof")
    receipt = {"active_goal": proof["active_goal"], "cell": row["cell"], "complete_goal": proof["complete_goal"],
            "control_reads": proof["control_reads"], "goal_thread_id": first["goal_thread_id"],
            "profile": proof["profile"], "qualification_credit": 0, "result_bytes": len(expected),
            "result_sha256": H.sha(expected), "review_nonce": pre["review_nonce"], "route": row["route"],
            "row_id": row["row_id"], "schema_id": "pw-r9-codex-native-goal-streamed-goal-receipt-v1",
            "slice_count": len(sliced), "status": "PASS_FRESH_GOAL_STREAMED_ROW_ZERO_CREDIT",
            "task_path": item["task_path"], "trace": {"bytes": len(trace), "path": path, "sha256": H.sha(trace)},
            "turn_count": 1, "turn_id": proof["turn_id"]}
    if write:
        H.publish(os.path.join(row_path, "terminal_trace.jsonl"), trace)
        H.publish(os.path.join(row_path, "result.txt"), expected)
        H.publish(os.path.join(row_path, "goal_receipt.json"), H.canonical(receipt))
    else:
        require(H.read_exact(os.path.join(row_path, "terminal_trace.jsonl"), 0o444, len(trace), H.sha(trace)) == trace, "terminal-copy")
        require(H.read_exact(os.path.join(row_path, "result.txt"), 0o444, len(expected), H.sha(expected)) == expected, "result-copy")
        require(H.read_exact(os.path.join(row_path, "goal_receipt.json"), 0o444,
                             len(H.canonical(receipt)), H.sha(H.canonical(receipt))) == H.canonical(receipt), "receipt-copy")
    require(set(os.listdir(row_path)) == expected_files(len(sliced), terminal=True), "terminal-final-inventory")
    projection = H.inventory_sha(row_path, expected_files(len(sliced), terminal=True))
    return {"goal_thread_id": first["goal_thread_id"], "inventory_projection_sha256": projection,
            "qualification_credit": 0, "result_sha256": H.sha(expected), "review_nonce": pre["review_nonce"],
            "route": row["route"], "row_id": row["row_id"],
            "schema_id": "pw-r9-codex-native-goal-streamed-record-v1",
            "status": "PASS_FRESH_GOAL_STREAMED_ROW_ZERO_CREDIT", "task_path": item["task_path"],
            "terminal_trace_sha256": H.sha(trace), "turn_id": proof["turn_id"],
            "workspace_writes": 3 if write else 0}


def verify(plan_path, final):
    plan_raw, plan = read_plan(plan_path); rows = manifest_rows(plan_path, plan_raw, plan)
    results = []
    for row in rows:
        item = next(value for value in plan["rows"] if value["row_id"] == row["row_id"])
        path = derive(plan_raw, plan, item)["workdir"]
        results.append(terminal(path, False) if final else prepared(path))
    if final:
        for key in ("goal_thread_id", "review_nonce", "task_path", "terminal_trace_sha256", "turn_id"):
            require(len({item[key] for item in results}) == len(results), "global-unique:" + key)
    return {"assertion_count": (237 if not final else 907) + len(rows) * (31 if not final else 83),
            "first_mismatch": None, "qualification_credit": 0,
            "result_count": len(results) if final else 0,
            "route_counts": {name: sum(item["route"] == name for item in results) for name in ROSTER},
            "schema_id": "pw-r9-codex-native-goal-streamed-offline-check-v1",
            "status": "PASS_PREPARED_ZERO_WRITES" if not final else "PASS_CLEAN_STREAMED_MATRIX_ZERO_CREDIT",
            "subject_calls": 0 if not final else len(results), "workspace_writes": 0}


def main(argv):
    require(len(argv) >= 3, "argv")
    command = argv[1]
    if command == "--check" and len(argv) == 3:
        output = check(argv[2])
    elif command == "--prepare" and len(argv) == 3:
        output = prepare(argv[2])
    elif command == "--chunk" and len(argv) == 5:
        release(argv[2], argv[3], argv[4]); return 0
    elif command == "--record-prepared" and len(argv) == 3:
        output = prepared(argv[2])
    elif command == "--record-terminal" and len(argv) == 3:
        output = terminal(argv[2], True)
    elif command == "--verify-prepared" and len(argv) == 3:
        output = verify(argv[2], False)
    elif command == "--verify-final" and len(argv) == 3:
        output = verify(argv[2], True)
    else:
        raise Invalid("argv")
    sys.stdout.buffer.write(H.canonical(output)); return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(H.canonical({"first_mismatch": str(error), "qualification_credit": 0,
            "schema_id": "pw-r9-codex-native-goal-streamed-harness-v1", "status": "FAIL", "workspace_writes": 0}))
        raise SystemExit(1)
