#!/usr/bin/env python3
import glob
import hashlib
import importlib.util
import json
import math
import os
import re
import stat
import sys
import time

sys.dont_write_bytecode = True
SELF = "/mnt/Cursor/PuppetMaster/tests/r9g29/goal_harness.py"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
DECODER = "/mnt/Cursor/PuppetMaster/tests/r9g26/goal_receipt_decoder.py"
DECODER_BYTES = 9353
DECODER_SHA256 = "4dfd11ca9bf9428daa0f42447e74d09deb3005026426f4a1e286e0552356d8a8"
SESSION_GLOB = "/home/sittingmongoose/.codex/sessions/*/*/*/*-{}.jsonl"
ROSTER = {"alpha": {"model": "gpt-5.4-mini", "reasoning_effort": "xhigh"}, "bravo": {"model": "gpt-5.4-mini", "reasoning_effort": "medium"}, "charlie": {"model": "gpt-5.6-luna", "reasoning_effort": "medium"}}
AUTHORITY = {"canary_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0, "release": False}
FAILURE = {"best_of": 0, "continue_after_failure": False, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0}
QUALIFICATION = {"clean_full_matrix_streak": 0, "credit": "0/2", "required_consecutive_clean_full_matrices": 2}
PRE_FIELDS = {"atom_id", "bootstrap_skill_bytes", "bootstrap_skill_sha256", "decoder_bytes", "decoder_sha256", "goal_objective", "harness_bytes", "harness_sha256", "model_requested", "parent_thread_id", "plan_bytes", "plan_path", "plan_sha256", "reasoning_effort_requested", "review_nonce", "schema_id", "subject_bytes", "subject_sha256", "task_path", "waiter_bytes", "waiter_sha256"}
PREPARED_FILES = {"predeclaration.json", "spawn_prompt.txt", "subject.packet", "wait.py"}
ACTIVE_FILES = PREPARED_FILES | {"active.json", "active_trace.jsonl", "subject.txt"}
TERMINAL_FILES = ACTIVE_FILES | {"goal_receipt.json", "result.txt", "terminal_trace.jsonl"}
ATOM = re.compile(r"^[A-Z][A-Z0-9_]{0,15}$")
TOKEN = re.compile(r"^[A-Z0-9_]{1,32}$")
PREFIX = re.compile(r"^[A-Z][A-Z0-9]{1,15}$")
TASK_PREFIX = re.compile(r"^r9_[a-z0-9_]{1,32}_$")
HEX = re.compile(r"^[0-9a-f]{64}$")
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


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


def read_exact(path, mode, size=None, digest=None, cap=None):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode), "kind:" + path)
    require(stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1, "custody:" + path)
    require(size is None or before.st_size == size, "size:" + path)
    require(cap is None or before.st_size <= cap, "cap:" + path)
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
    require(digest is None or sha(raw) == digest, "digest:" + path)
    return raw


def directory(path, mode):
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode) and stat.S_IMODE(info.st_mode) == mode and info.st_uid == os.getuid(), "directory:" + path)


def self_identity():
    raw = read_exact(SELF, 0o644, cap=100000)
    return {"bytes": len(raw), "mode": "0644", "path": SELF, "sha256": sha(raw)}


def read_plan(path):
    require(os.path.isabs(path) and os.path.realpath(path) == path and path.startswith("/mnt/Cursor/PuppetMaster/tests/r9g"), "plan-path")
    raw = read_exact(path, 0o644, cap=2000000)
    plan = parse(raw)
    require(raw == canonical(plan), "plan-canonical")
    validate_plan(plan)
    return raw, plan


def validate_plan(plan):
    require(isinstance(plan, dict) and set(plan) == {"authority", "bindings", "experiment", "failure_contract", "limits", "qualification", "roster", "rows", "schema_id", "status"}, "plan-shape")
    require(plan["authority"] == AUTHORITY and plan["failure_contract"] == FAILURE and plan["qualification"] == QUALIFICATION and plan["roster"] == ROSTER, "plan-controls")
    require(isinstance(plan["schema_id"], str) and plan["schema_id"].startswith("pw-r9-codex-native-goal-") and plan["status"].endswith("ZERO_CREDIT_NO_LAUNCH_AUTHORITY"), "plan-identity")
    limits = plan["limits"]
    require(limits == {"goal_objective_utf8_bytes_max": 128, "spawn_prompt_utf8_bytes_max": 512, "subject_line_utf8_bytes_max": 512}, "limits")
    experiment = plan["experiment"]
    require(set(experiment) == {"experiment_id", "kind", "manifest_path", "objective_prefix", "parent_thread_id", "root", "row_count", "sequential", "stop_at_first_nonpass", "task_prefix"}, "experiment-shape")
    require(PREFIX.fullmatch(experiment["objective_prefix"] or "") and TASK_PREFIX.fullmatch(experiment["task_prefix"] or ""), "prefix")
    require(UUID.fullmatch(experiment["parent_thread_id"] or "") and experiment["sequential"] is True and experiment["stop_at_first_nonpass"] is True, "experiment-control")
    require(os.path.isabs(experiment["root"]) and os.path.realpath(experiment["root"]) == experiment["root"] and experiment["root"].startswith("/mnt/Cursor/PuppetMaster/tests/r9g"), "root")
    require(os.path.isabs(experiment["manifest_path"]) and os.path.dirname(experiment["manifest_path"]) == os.path.dirname(experiment["root"]), "manifest")
    rows = plan["rows"]
    require(isinstance(rows, list) and len(rows) == experiment["row_count"] and 1 <= len(rows) <= 1000, "row-count")
    seen = {"atom": set(), "pass": set(), "fail": set()}
    for row in rows:
        require(isinstance(row, dict) and set(row) == {"atom_id", "fail_token", "model", "pass_token", "reasoning_effort", "route", "subject"}, "row-shape")
        require(ATOM.fullmatch(row["atom_id"] or "") and row["atom_id"] not in seen["atom"], "atom")
        require(row["route"] in ROSTER and {"model": row["model"], "reasoning_effort": row["reasoning_effort"]} == ROSTER[row["route"]], "route")
        require(TOKEN.fullmatch(row["pass_token"] or "") and TOKEN.fullmatch(row["fail_token"] or "") and row["pass_token"] != row["fail_token"], "tokens")
        require(row["pass_token"] not in seen["pass"] and row["fail_token"] not in seen["fail"], "token-unique")
        require(isinstance(row["subject"], dict) and row["subject"].get("token") == row["pass_token"] and row["subject"].get("failure_token") == row["fail_token"], "subject-tokens")
        packet = canonical(row["subject"])
        require(1 <= len(packet) <= 512 and packet.count(b"\n") == 1 and b"\r" not in packet, "subject-limit")
        seen["atom"].add(row["atom_id"]); seen["pass"].add(row["pass_token"]); seen["fail"].add(row["fail_token"])
    require(isinstance(plan["bindings"], dict) and set(plan["bindings"]) >= {"bootstrap_skill", "goal_receipt_decoder"}, "bindings")
    for name, binding in plan["bindings"].items():
        require(set(binding) == {"bytes", "mode", "path", "sha256"} and binding["mode"] == "0644" and isinstance(binding["bytes"], int) and binding["bytes"] > 0 and HEX.fullmatch(binding["sha256"] or ""), "binding:" + name)
        read_exact(binding["path"], 0o644, binding["bytes"], binding["sha256"])
    require(plan["bindings"]["bootstrap_skill"] == {"bytes": SKILL_BYTES, "mode": "0644", "path": SKILL, "sha256": SKILL_SHA256}, "skill-binding")
    require(plan["bindings"]["goal_receipt_decoder"] == {"bytes": DECODER_BYTES, "mode": "0644", "path": DECODER, "sha256": DECODER_SHA256}, "decoder-binding")


def load_decoder():
    read_exact(DECODER, 0o644, DECODER_BYTES, DECODER_SHA256)
    spec = importlib.util.spec_from_file_location("r9g29_goal_decoder", DECODER)
    require(spec is not None and spec.loader is not None, "decoder-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    require(module.__all__ == ("Invalid", "decode_events", "validate_active", "validate_terminal"), "decoder-api")
    return module


def derive(plan_raw, plan, row):
    experiment = plan["experiment"]
    nonce = sha(b"pw-r9-goal-generic-harness-v1\0" + sha(plan_raw).encode("ascii") + b"\0" + row["atom_id"].encode("ascii") + b"\0" + row["route"].encode("ascii"))
    objective = "{}|a={}|x={}|once".format(experiment["objective_prefix"], row["atom_id"], nonce)
    task_name = experiment["task_prefix"] + nonce
    workdir = experiment["root"] + "/" + row["atom_id"] + "/" + nonce
    require(len(objective.encode("utf-8")) <= plan["limits"]["goal_objective_utf8_bytes_max"], "objective-limit")
    return {"atom_id": row["atom_id"], "goal_objective": objective, "model": row["model"], "reasoning_effort": row["reasoning_effort"], "review_nonce": nonce, "route": row["route"], "task_name": task_name, "task_path": "/root/" + task_name, "workdir": workdir}


def packet(row):
    return canonical(row["subject"])


def wrapper(plan_path):
    text = '#!/usr/bin/env python3\nimport runpy,sys\n\nsys.argv=["goal_harness.py","--wait",{0},sys.argv[1]]\nrunpy.run_path({1},run_name="__main__")\n'.format(json.dumps(plan_path), json.dumps(SELF))
    return text.encode("utf-8")


def spawn_prompt(item):
    raw = ("Use $r9-goal-atom-bootstrap. Exact objective=" + json.dumps(item["goal_objective"]) + "; waiter workdir=" + json.dumps(item["workdir"]) + ". No subject is in this message.").encode("utf-8")
    require(len(raw) <= 512 and b"failure_token" not in raw and b"token" not in raw, "spawn-prompt")
    return raw


def predeclaration(plan_path, plan_raw, plan, row, item, harness, waiter, subject):
    return {"atom_id": row["atom_id"], "bootstrap_skill_bytes": SKILL_BYTES, "bootstrap_skill_sha256": SKILL_SHA256, "decoder_bytes": DECODER_BYTES, "decoder_sha256": DECODER_SHA256, "goal_objective": item["goal_objective"], "harness_bytes": harness["bytes"], "harness_sha256": harness["sha256"], "model_requested": item["model"], "parent_thread_id": plan["experiment"]["parent_thread_id"], "plan_bytes": len(plan_raw), "plan_path": plan_path, "plan_sha256": sha(plan_raw), "reasoning_effort_requested": item["reasoning_effort"], "review_nonce": item["review_nonce"], "schema_id": "pw-r9-codex-native-goal-generic-row-predeclaration-v1", "subject_bytes": len(subject), "subject_sha256": sha(subject), "task_path": item["task_path"], "waiter_bytes": len(waiter), "waiter_sha256": sha(waiter)}


def row_projection(plan_raw, plan):
    rows = []
    for row in plan["rows"]:
        item = derive(plan_raw, plan, row)
        subject = packet(row)
        prompt = spawn_prompt(item)
        rows.append({**item, "fail_token": row["fail_token"], "pass_token": row["pass_token"], "spawn_prompt_bytes": len(prompt), "spawn_prompt_sha256": sha(prompt), "subject_bytes": len(subject), "subject_sha256": sha(subject)})
    return rows


def fsync_dir(path):
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def make_dir(path, parent):
    os.mkdir(path, 0o700)
    os.chmod(path, 0o700)
    directory(path, 0o700)
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
    finally:
        os.close(fd)
    fsync_dir(os.path.dirname(path))
    require(read_exact(path, 0o444, len(raw), sha(raw)) == raw, "publish:" + path)


def prepare(plan_path):
    plan_raw, plan = read_plan(plan_path)
    root = plan["experiment"]["root"]
    manifest_path = plan["experiment"]["manifest_path"]
    require(not os.path.lexists(root) and not os.path.lexists(manifest_path), "create-only-state")
    harness = self_identity()
    waiter = wrapper(plan_path)
    make_dir(root, os.path.dirname(root))
    rows = []
    for row in plan["rows"]:
        item = derive(plan_raw, plan, row)
        atom_dir = root + "/" + row["atom_id"]
        make_dir(atom_dir, root)
        make_dir(item["workdir"], atom_dir)
        subject = packet(row)
        prompt = spawn_prompt(item)
        publish(item["workdir"] + "/predeclaration.json", canonical(predeclaration(plan_path, plan_raw, plan, row, item, harness, waiter, subject)))
        publish(item["workdir"] + "/spawn_prompt.txt", prompt)
        publish(item["workdir"] + "/subject.packet", subject)
        publish(item["workdir"] + "/wait.py", waiter)
        require(sorted(os.listdir(item["workdir"])) == sorted(PREPARED_FILES), "prepared-inventory")
        rows.append({**item, "fail_token": row["fail_token"], "pass_token": row["pass_token"], "spawn_prompt_bytes": len(prompt), "spawn_prompt_sha256": sha(prompt), "subject_bytes": len(subject), "subject_sha256": sha(subject)})
    manifest = {"authority": AUTHORITY, "components": {"bootstrap_skill": plan["bindings"]["bootstrap_skill"], "goal_receipt_decoder": plan["bindings"]["goal_receipt_decoder"], "harness": harness, "plan": {"bytes": len(plan_raw), "mode": "0644", "path": plan_path, "sha256": sha(plan_raw)}, "row_waiter": {"bytes": len(waiter), "mode": "0444", "sha256": sha(waiter)}}, "experiment": plan["experiment"], "qualification": QUALIFICATION, "rows": rows, "schema_id": "pw-r9-codex-native-goal-generic-prepared-manifest-v1", "status": "PREPARED_CONTROL_ONLY_ZERO_CREDIT_NO_LAUNCH_AUTHORITY"}
    manifest_raw = canonical(manifest)
    publish(manifest_path, manifest_raw)
    return {"first_mismatch": None, "manifest": {"bytes": len(manifest_raw), "sha256": sha(manifest_raw)}, "max_spawn_prompt_bytes": max(item["spawn_prompt_bytes"] for item in rows), "max_subject_bytes": max(item["subject_bytes"] for item in rows), "qualification_credit": 0, "route_counts": {name: sum(item["route"] == name for item in rows) for name in ROSTER}, "row_count": len(rows), "schema_id": "pw-r9-codex-native-goal-generic-prepare-v1", "status": "PASS_PREPARED_ZERO_CALLS_ZERO_CREDIT", "subject_calls": 0}


def check(plan_path):
    plan_raw, plan = read_plan(plan_path)
    require(not os.path.lexists(plan["experiment"]["root"]) and not os.path.lexists(plan["experiment"]["manifest_path"]), "check-no-write-state")
    rows = row_projection(plan_raw, plan)
    return {"assertion_count": 73 + 18 * len(rows), "first_mismatch": None, "max_spawn_prompt_bytes": max(item["spawn_prompt_bytes"] for item in rows), "max_subject_bytes": max(item["subject_bytes"] for item in rows), "qualification_credit": 0, "route_counts": {name: sum(item["route"] == name for item in rows) for name in ROSTER}, "row_count": len(rows), "schema_id": "pw-r9-codex-native-goal-generic-harness-check-v1", "status": "PASS_DATA_ONLY_HARNESS_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}


def load_pre(row_path):
    raw = read_exact(os.path.join(row_path, "predeclaration.json"), 0o444, cap=8192)
    pre = parse(raw)
    require(isinstance(pre, dict) and set(pre) == PRE_FIELDS and raw == canonical(pre), "predeclaration")
    require(pre["schema_id"] == "pw-r9-codex-native-goal-generic-row-predeclaration-v1", "pre-schema")
    return pre


def locate(row_path):
    require(os.path.isabs(row_path) and os.path.realpath(row_path) == row_path, "row-path")
    pre = load_pre(row_path)
    plan_raw, plan = read_plan(pre["plan_path"])
    row = next((item for item in plan["rows"] if item["atom_id"] == pre["atom_id"]), None)
    require(row is not None, "row")
    item = derive(plan_raw, plan, row)
    require(row_path == item["workdir"] and os.path.basename(row_path) == pre["review_nonce"], "row-control")
    directory(plan["experiment"]["root"], 0o700)
    directory(os.path.dirname(row_path), 0o700)
    directory(row_path, 0o700)
    harness = self_identity()
    waiter = wrapper(pre["plan_path"])
    subject = packet(row)
    expected_pre = predeclaration(pre["plan_path"], plan_raw, plan, row, item, harness, waiter, subject)
    require(pre == expected_pre, "pre-values")
    require(read_exact(os.path.join(row_path, "subject.packet"), 0o444, len(subject), sha(subject)) == subject, "packet")
    require(read_exact(os.path.join(row_path, "wait.py"), 0o444, len(waiter), sha(waiter)) == waiter, "waiter")
    prompt = spawn_prompt(item)
    require(read_exact(os.path.join(row_path, "spawn_prompt.txt"), 0o444, len(prompt), sha(prompt)) == prompt and subject not in prompt, "prompt")
    return pre, plan_raw, plan, row, item, subject


def inventory(row_path, expected):
    names = sorted(os.listdir(row_path))
    require(set(names) == expected and len(names) == len(expected), "inventory")
    result = []
    for name in names:
        raw = read_exact(os.path.join(row_path, name), 0o444, cap=600000)
        result.append({"bytes": len(raw), "mode": "0444", "path": name, "sha256": sha(raw)})
    return result


def inventory_sha(row_path, expected):
    return sha(canonical(inventory(row_path, expected)))


def control(pre, item, thread_id):
    return {"effort": pre["reasoning_effort_requested"], "model": pre["model_requested"], "objective": pre["goal_objective"], "parent_thread_id": pre["parent_thread_id"], "skill_alias_path": "/home/sittingmongoose/.codex/skills/.system/r9-goal-atom-bootstrap/SKILL.md", "skill_path": SKILL, "task_path": pre["task_path"], "thread_id": thread_id, "wait_arguments": {"cmd": "python3 -B wait.py " + thread_id, "max_output_tokens": 128, "workdir": item["workdir"], "yield_time_ms": 30000}}


def active_trace(thread_id):
    paths = glob.glob(SESSION_GLOB.format(thread_id))
    require(len(paths) == 1 and os.path.basename(paths[0]).endswith("-" + thread_id + ".jsonl"), "trace-path")
    path = paths[0]
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode) and stat.S_IMODE(before.st_mode) == 0o664 and before.st_uid == os.getuid() and before.st_nlink == 1 and 1 <= before.st_size <= 600000, "trace-custody")
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require((os.fstat(fd).st_dev, os.fstat(fd).st_ino) == (before.st_dev, before.st_ino), "trace-race")
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw)); require(bool(part), "trace-short"); raw += part
        after = os.fstat(fd)
        require((after.st_dev, after.st_ino) == (before.st_dev, before.st_ino) and after.st_size >= before.st_size, "trace-inode")
    finally:
        os.close(fd)
    return path, raw


def stable_trace(thread_id):
    require(UUID.fullmatch(thread_id or ""), "thread")
    paths = glob.glob(SESSION_GLOB.format(thread_id))
    require(len(paths) == 1, "trace-count")
    return paths[0], read_exact(paths[0], 0o664, cap=600000)


def wait_subject(plan_path, thread_id):
    require(UUID.fullmatch(thread_id or ""), "thread")
    row_path = os.getcwd()
    pre, _, _, row, item, subject = locate(row_path)
    require(pre["plan_path"] == plan_path and sorted(os.listdir(row_path)) == sorted(PREPARED_FILES), "wait-state")
    decoder = load_decoder()
    skill = read_exact(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256)
    deadline = time.monotonic() + 8.0
    while True:
        try:
            trace_path, trace_raw = active_trace(thread_id)
            proof = decoder.validate_active(trace_raw, control(pre, item, thread_id), subject, skill)
            break
        except (decoder.Invalid, Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError):
            if time.monotonic() >= deadline:
                raise
            time.sleep(0.02)
    require(proof["profile"] == "GOAL_RECEIPT_ONLY_BROKER_V1", "profile")
    active = {"atom_id": row["atom_id"], "goal_thread_id": thread_id, "profile": proof["profile"], "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-generic-active-v1", "status": "ACTIVE_ATTESTED_SUBJECT_RELEASED_ZERO_CREDIT", "task_path": proof["session"]["agent_path"], "trace": {"bytes": len(trace_raw), "path": trace_path, "sha256": sha(trace_raw)}, "turn_id": proof["turn_id"]}
    publish(os.path.join(row_path, "active_trace.jsonl"), trace_raw)
    publish(os.path.join(row_path, "active.json"), canonical(active))
    publish(os.path.join(row_path, "subject.txt"), subject)
    write_all(1, subject)
    return None


def prepared(row_path):
    before = inventory_sha(row_path, PREPARED_FILES)
    pre, _, _, row, _, subject = locate(row_path)
    require(inventory_sha(row_path, PREPARED_FILES) == before, "prepared-drift")
    return {"atom_id": row["atom_id"], "inventory_projection_sha256": before, "qualification_credit": 0, "review_nonce": pre["review_nonce"], "route": row["route"], "schema_id": "pw-r9-codex-native-goal-generic-record-v1", "status": "PASS_PREPARED_ZERO_CREDIT", "subject_bytes": len(subject), "workspace_writes": 0}


def active_values(row_path, pre, row, item, subject):
    active_raw = read_exact(os.path.join(row_path, "active.json"), 0o444, cap=4096)
    active = parse(active_raw)
    require(active_raw == canonical(active) and set(active) == {"atom_id", "goal_thread_id", "profile", "qualification_credit", "schema_id", "status", "task_path", "trace", "turn_id"}, "active")
    require((active["schema_id"], active["status"], active["atom_id"], active["profile"], active["qualification_credit"], active["task_path"]) == ("pw-r9-codex-native-goal-generic-active-v1", "ACTIVE_ATTESTED_SUBJECT_RELEASED_ZERO_CREDIT", row["atom_id"], "GOAL_RECEIPT_ONLY_BROKER_V1", 0, pre["task_path"]), "active-values")
    active_raw_trace = read_exact(os.path.join(row_path, "active_trace.jsonl"), 0o444, cap=600000)
    require(active["trace"] == {"bytes": len(active_raw_trace), "path": active["trace"]["path"], "sha256": sha(active_raw_trace)}, "active-trace")
    require(read_exact(os.path.join(row_path, "subject.txt"), 0o444, len(subject), sha(subject)) == subject, "subject-copy")
    path, trace = stable_trace(active["goal_thread_id"])
    require(path == active["trace"]["path"] and trace.startswith(active_raw_trace), "trace-binding")
    return active, active_raw_trace, path, trace


def terminal(row_path, write):
    expected_files = ACTIVE_FILES if write else TERMINAL_FILES
    before = inventory_sha(row_path, expected_files)
    pre, _, _, row, item, subject = locate(row_path)
    active, active_raw_trace, path, trace = active_values(row_path, pre, row, item, subject)
    decoder = load_decoder()
    skill = read_exact(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256)
    proof = decoder.validate_terminal(trace, active_raw_trace, control(pre, item, active["goal_thread_id"]), subject, skill, {row["pass_token"], row["fail_token"]})
    require(proof["profile"] == "GOAL_RECEIPT_ONLY_BROKER_V1" and proof["result"] in {row["pass_token"], row["fail_token"]} and proof["session"]["agent_path"] == pre["task_path"] and proof["turn_id"] == active["turn_id"], "terminal-proof")
    receipt = {"active_goal": proof["active_goal"], "atom_id": row["atom_id"], "complete_goal": proof["complete_goal"], "control_reads": proof["control_reads"], "goal_thread_id": active["goal_thread_id"], "profile": proof["profile"], "qualification_credit": 0, "result": proof["result"], "review_nonce": pre["review_nonce"], "route": row["route"], "schema_id": "pw-r9-codex-native-goal-generic-goal-receipt-v1", "status": "PASS_FRESH_GOAL_ATOM_ZERO_CREDIT" if proof["result"] == row["pass_token"] else "FAIL_FRESH_GOAL_ATOM_ZERO_CREDIT", "task_path": pre["task_path"], "traces": {"active": {"bytes": len(active_raw_trace), "sha256": sha(active_raw_trace)}, "terminal": {"bytes": len(trace), "sha256": sha(trace)}}, "turn_count": 1, "turn_id": proof["turn_id"]}
    if write:
        require(inventory_sha(row_path, ACTIVE_FILES) == before, "active-drift")
        publish(os.path.join(row_path, "terminal_trace.jsonl"), trace)
        publish(os.path.join(row_path, "result.txt"), (proof["result"] + "\n").encode("ascii"))
        publish(os.path.join(row_path, "goal_receipt.json"), canonical(receipt))
        projection = inventory_sha(row_path, TERMINAL_FILES)
    else:
        require(read_exact(os.path.join(row_path, "terminal_trace.jsonl"), 0o444, len(trace), sha(trace)) == trace, "terminal-copy")
        require(read_exact(os.path.join(row_path, "result.txt"), 0o444, len(proof["result"]) + 1, sha((proof["result"] + "\n").encode("ascii"))) == (proof["result"] + "\n").encode("ascii"), "result-copy")
        require(read_exact(os.path.join(row_path, "goal_receipt.json"), 0o444, len(canonical(receipt)), sha(canonical(receipt))) == canonical(receipt), "receipt-copy")
        require(inventory_sha(row_path, TERMINAL_FILES) == before, "terminal-drift")
        projection = before
    return {"atom_id": row["atom_id"], "goal_thread_id": active["goal_thread_id"], "inventory_projection_sha256": projection, "profile": proof["profile"], "qualification_credit": 0, "result": proof["result"], "review_nonce": pre["review_nonce"], "route": row["route"], "schema_id": "pw-r9-codex-native-goal-generic-record-v1", "status": receipt["status"], "task_path": pre["task_path"], "terminal_trace_sha256": sha(trace), "turn_id": proof["turn_id"], "workspace_writes": 3 if write else 0}


def read_manifest(plan_path, plan_raw, plan):
    raw = read_exact(plan["experiment"]["manifest_path"], 0o444, cap=2000000)
    value = parse(raw)
    harness = self_identity()
    rows = row_projection(plan_raw, plan)
    waiter = wrapper(plan_path)
    expected = {"authority": AUTHORITY, "components": {"bootstrap_skill": plan["bindings"]["bootstrap_skill"], "goal_receipt_decoder": plan["bindings"]["goal_receipt_decoder"], "harness": harness, "plan": {"bytes": len(plan_raw), "mode": "0644", "path": plan_path, "sha256": sha(plan_raw)}, "row_waiter": {"bytes": len(waiter), "mode": "0444", "sha256": sha(waiter)}}, "experiment": plan["experiment"], "qualification": QUALIFICATION, "rows": rows, "schema_id": "pw-r9-codex-native-goal-generic-prepared-manifest-v1", "status": "PREPARED_CONTROL_ONLY_ZERO_CREDIT_NO_LAUNCH_AUTHORITY"}
    require(raw == canonical(value) == canonical(expected), "manifest-values")
    return rows


def global_projection(rows, expected):
    value = [{"atom_id": row["atom_id"], "files": inventory(row["workdir"], expected), "review_nonce": row["review_nonce"]} for row in rows]
    return sha(canonical(value))


def verify(plan_path, final):
    plan_raw, plan = read_plan(plan_path)
    rows = read_manifest(plan_path, plan_raw, plan)
    expected = TERMINAL_FILES if final else PREPARED_FILES
    before = global_projection(rows, expected)
    results = [terminal(row["workdir"], False) for row in rows] if final else [prepared(row["workdir"]) for row in rows]
    require(global_projection(rows, expected) == before, "global-drift")
    if final:
        plan_rows = {row["atom_id"]: row for row in plan["rows"]}
        require(all(item["result"] == plan_rows[item["atom_id"]]["pass_token"] for item in results), "experiment-result")
        for key in ("goal_thread_id", "review_nonce", "task_path", "terminal_trace_sha256", "turn_id"):
            require(len({item[key] for item in results}) == len(results), "global-unique:" + key)
    return {"assertion_count": (157 if not final else 611) + len(rows) * (29 if not final else 71), "first_mismatch": None, "qualification_credit": 0, "result_count": len(results) if final else 0, "route_counts": {name: sum(item["route"] == name for item in results) for name in ROSTER}, "schema_id": "pw-r9-codex-native-goal-generic-offline-check-v1", "status": "PASS_PREPARED_ZERO_WRITES" if not final else "PASS_FRESH_GOAL_EXPERIMENT_ZERO_CREDIT", "subject_calls": 0 if not final else len(results), "workspace_projection_sha256": before, "workspace_writes": 0}


def main(argv):
    require(len(argv) >= 3, "argv")
    command = argv[1]
    if command == "--check" and len(argv) == 3:
        output = check(argv[2])
    elif command == "--prepare" and len(argv) == 3:
        output = prepare(argv[2])
    elif command == "--wait" and len(argv) == 4:
        wait_subject(argv[2], argv[3]); return 0
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
    sys.stdout.buffer.write(canonical(output))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-generic-harness-v1", "status": "FAIL", "workspace_writes": 0}))
        raise SystemExit(1)
