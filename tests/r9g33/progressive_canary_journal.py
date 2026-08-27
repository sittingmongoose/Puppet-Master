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
SELF = "/mnt/Cursor/PuppetMaster/tests/r9g33/progressive_canary_journal.py"
READER = "/mnt/Cursor/PuppetMaster/tests/r9g33/notify_atom_reader.py"
READER_BYTES = 10872
READER_SHA256 = "b2f4d78396def5afcc89afb05770cbf85810018061c583529da64a74cc4ffc6f"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-notify-atom-v1/SKILL.md"
SKILL_BYTES = 1824
SKILL_SHA256 = "573c3d80961135aec5d6b10bb38b30cda64da584808769f03898d3115a358994"
ROSTER = {
    "alpha": {"model": "gpt-5.4-mini", "reasoning_effort": "xhigh"},
    "bravo": {"model": "gpt-5.4-mini", "reasoning_effort": "medium"},
    "charlie": {"model": "gpt-5.6-luna", "reasoning_effort": "medium"},
}
ROUTE_CODE = {"alpha": "a", "bravo": "b", "charlie": "c"}
AUTHORITY = {"canary_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0}
FAILURE = {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0}
QUALIFICATION = {"clean_full_matrix_streak": 0, "credit": "0/2", "required_consecutive_clean_full_matrices": 2}
LIMITS = {
    "capsule_count": 3,
    "criterion_utf8_bytes_max": 256,
    "goal_objective_utf8_bytes_max": 128,
    "intermediate_result_utf8_bytes_max": 48,
    "output_contract_utf8_bytes_max": 128,
    "result_utf8_bytes_max": 128,
    "spawn_prompt_utf8_bytes_max": 512,
    "subject_payload_utf8_bytes_max": 170,
}
TOP_FIELDS = {"authority", "bindings", "experiment", "failure_contract", "limits", "nodes", "qualification", "roster", "routes", "schema_id", "status"}
EXPERIMENT_FIELDS = {"expected_final", "final_node_id", "id", "kind", "max_parallel", "objective_prefix", "parent_goal_thread_id", "root", "stop_at_first_nonpass", "task_prefix"}
NODE_FIELDS = {"acceptance_criterion", "dependencies", "node_id", "output_contract", "payload_spec"}
PRE_FIELDS = {
    "capsules", "goal_objective", "model_requested", "node_id", "parent_goal_thread_id",
    "plan_bytes", "plan_path", "plan_sha256", "reader_bytes", "reader_sha256",
    "reasoning_effort_requested", "review_nonce", "route", "schema_id", "skill_bytes",
    "skill_sha256", "task_path", "workdir",
}
RELEASE_FIELDS = {
    "capsule_bytes", "capsule_index", "capsule_sha256", "goal_thread_id", "node_id",
    "qualification_credit", "review_nonce", "route", "schema_id", "status", "task_path",
    "trace_path", "trace_prefix_bytes", "trace_prefix_sha256",
}
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
HEX = re.compile(r"^[0-9a-f]{64}$")
NODE = re.compile(r"^n[0-9]{3}$")
TASK_PREFIX = re.compile(r"^r9_[a-z0-9_]{1,24}_$")


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def load_reader():
    before = os.lstat(READER)
    require(
        stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode)
        and stat.S_IMODE(before.st_mode) == 0o644 and before.st_uid == os.getuid()
        and before.st_nlink == 1 and before.st_size == READER_BYTES,
        "reader-custody",
    )
    raw = open_bound(READER, 0o644, READER_BYTES, READER_SHA256)
    spec = importlib.util.spec_from_file_location("r9g33_reader", READER)
    require(spec is not None and spec.loader is not None, "reader-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    require(module.sha(raw) == READER_SHA256, "reader-api")
    return module


def open_bound(path, mode, size=None, digest=None, cap=None):
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
    require((after.st_dev, after.st_ino, after.st_size) == (before.st_dev, before.st_ino, before.st_size), "race:" + path)
    require((current.st_dev, current.st_ino, current.st_size) == (before.st_dev, before.st_ino, before.st_size), "drift:" + path)
    require(digest is None or hashlib.sha256(raw).hexdigest() == digest, "digest:" + path)
    return raw


H = load_reader()


def binding(path, mode=0o644):
    raw = open_bound(path, mode, cap=500000)
    return {"bytes": len(raw), "mode": "{:04o}".format(mode), "path": path, "sha256": H.sha(raw)}


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


def make_dir(path, parent):
    os.mkdir(path, 0o700)
    os.chmod(path, 0o700)
    directory(path)
    fsync_dir(parent)


def ensure_dir(path, parent):
    if os.path.lexists(path):
        directory(path)
    else:
        make_dir(path, parent)


def publish(path, raw, mode=0o444):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, mode)
    try:
        os.fchmod(fd, mode)
        H.write_all(fd, raw)
        os.fsync(fd)
    finally:
        os.close(fd)
    fsync_dir(os.path.dirname(path))
    require(open_bound(path, mode, len(raw), H.sha(raw)) == raw, "publish:" + path)


def read_json(path, mode=0o444, cap=2000000):
    raw = open_bound(path, mode, cap=cap)
    value = H.parse(raw)
    require(raw == H.canonical(value), "canonical:" + path)
    return raw, value


def validate_binding(value):
    require(set(value) == {"bytes", "mode", "path", "sha256"}, "binding-shape")
    require(value["mode"] == "0644" and type(value["bytes"]) is int and value["bytes"] > 0, "binding-values")
    require(os.path.isabs(value["path"]) and HEX.fullmatch(value["sha256"] or ""), "binding-path")
    open_bound(value["path"], 0o644, value["bytes"], value["sha256"])


def materialize_max(node):
    spec = node["payload_spec"]
    if spec["kind"] == "static":
        return spec["utf8"].encode("utf-8")
    if spec["kind"] == "pair":
        return H.canonical({"l": "x" * 48, "r": "x" * 48})[:-1]
    if spec["kind"] == "option":
        return H.canonical({"e": "x" * 48, "o": spec["options"]})[:-1]
    raise Invalid("payload-kind")


def validate_plan(plan):
    require(isinstance(plan, dict) and set(plan) == TOP_FIELDS, "plan-shape")
    require(
        plan["schema_id"] == "pw-r9-codex-native-goal-progressive-notify-canary-plan-v1"
        and plan["status"] == "FROZEN_ZERO_CREDIT_NO_MATRIX_OR_QUALIFICATION_AUTHORITY",
        "plan-identity",
    )
    require(plan["authority"] == AUTHORITY and plan["failure_contract"] == FAILURE, "plan-authority")
    require(plan["qualification"] == QUALIFICATION and plan["roster"] == ROSTER and plan["limits"] == LIMITS, "plan-controls")
    require(plan["routes"] == ["alpha", "bravo", "charlie"], "routes")
    require(set(plan["bindings"]) == {"journal", "offline_verifier", "reader", "skill"}, "bindings")
    for value in plan["bindings"].values():
        validate_binding(value)
    require(plan["bindings"]["reader"] == binding(READER) and plan["bindings"]["skill"] == binding(SKILL), "runtime-bindings")
    require(plan["bindings"]["journal"] == binding(SELF), "journal-binding")
    experiment = plan["experiment"]
    require(set(experiment) == EXPERIMENT_FIELDS, "experiment-shape")
    require(
        experiment["kind"] == "PROGRESSIVE_NOTIFY_ATOM_CANARY"
        and experiment["max_parallel"] == 3
        and experiment["stop_at_first_nonpass"] is True,
        "experiment-controls",
    )
    require(UUID.fullmatch(experiment["parent_goal_thread_id"] or "") and TASK_PREFIX.fullmatch(experiment["task_prefix"] or ""), "experiment-identity")
    require(
        os.path.isabs(experiment["root"]) and os.path.realpath(experiment["root"]) == experiment["root"]
        and experiment["root"].startswith("/mnt/Cursor/PuppetMaster/tests/r9g33/"),
        "experiment-root",
    )
    require(isinstance(experiment["objective_prefix"], str) and len(experiment["objective_prefix"].encode("utf-8")) <= 16, "objective-prefix")
    require(NODE.fullmatch(experiment["final_node_id"] or "") and isinstance(experiment["expected_final"], str), "expected-final")
    nodes = plan["nodes"]
    require(isinstance(nodes, list) and 2 <= len(nodes) <= 32, "node-count")
    seen = set()
    for index, node in enumerate(nodes):
        require(isinstance(node, dict) and set(node) == NODE_FIELDS, "node-shape")
        require(node["node_id"] == "n{:03d}".format(index) and node["node_id"] not in seen, "node-id")
        require(isinstance(node["dependencies"], list) and all(item in seen for item in node["dependencies"]), "node-dependencies")
        criterion = node["acceptance_criterion"].encode("utf-8")
        require(1 <= len(criterion) <= LIMITS["criterion_utf8_bytes_max"], "criterion-limit")
        contract = node["output_contract"]
        require(isinstance(contract, dict) and contract.get("kind") in {"signal", "choice"}, "output-kind")
        require(isinstance(contract.get("utf8"), str) and 1 <= len(contract["utf8"].encode("utf-8")) <= LIMITS["output_contract_utf8_bytes_max"], "output-limit")
        if contract["kind"] == "signal":
            require(set(contract) == {"kind", "max_bytes", "regex", "utf8"} and contract["max_bytes"] == 48 and contract["regex"] == "[A-Za-z0-9._:-]+", "signal-contract")
        else:
            require(set(contract) == {"kind", "options", "utf8"} and isinstance(contract["options"], list) and len(contract["options"]) >= 2, "choice-contract")
        spec = node["payload_spec"]
        require(isinstance(spec, dict) and spec.get("kind") in {"static", "pair", "option"}, "payload-spec")
        if spec["kind"] == "static":
            require(set(spec) == {"kind", "utf8"} and not node["dependencies"], "static-spec")
        elif spec["kind"] == "pair":
            require(set(spec) == {"kind", "left", "right"} and node["dependencies"] == [spec["left"], spec["right"]], "pair-spec")
        else:
            require(set(spec) == {"kind", "options", "summary"} and node["dependencies"] == [spec["summary"]] and spec["options"] == contract["options"], "option-spec")
        require(1 <= len(materialize_max(node)) <= LIMITS["subject_payload_utf8_bytes_max"], "payload-limit")
        seen.add(node["node_id"])
    require(experiment["final_node_id"] == nodes[-1]["node_id"] and nodes[-1]["output_contract"]["kind"] == "choice", "final-node")
    expected = experiment["expected_final"].encode("utf-8")
    validate_result(nodes[-1], expected)


def load_plan(path):
    require(os.path.isabs(path) and os.path.realpath(path) == path and path.startswith("/mnt/Cursor/PuppetMaster/tests/r9g33/"), "plan-path")
    raw = open_bound(path, 0o444, cap=1000000)
    plan = H.parse(raw)
    require(raw == H.canonical(plan), "plan-canonical")
    validate_plan(plan)
    return raw, plan


def node_map(plan):
    return {node["node_id"]: node for node in plan["nodes"]}


def instance_dir(plan, route, node_id, nonce):
    return os.path.join(plan["experiment"]["root"], "rows", route, node_id, nonce)


def locate_instance(plan, route, node_id):
    parent = os.path.join(plan["experiment"]["root"], "rows", route, node_id)
    if not os.path.lexists(parent):
        return None
    directory(parent)
    names = sorted(os.listdir(parent))
    require(len(names) == 1 and HEX.fullmatch(names[0] or ""), "instance-count:" + route + ":" + node_id)
    path = os.path.join(parent, names[0])
    directory(path)
    return path


def read_result(plan, route, node_id):
    workdir = locate_instance(plan, route, node_id)
    require(workdir is not None, "dependency-missing:" + node_id)
    settlement_raw, settlement = read_json(os.path.join(workdir, "settlement.json"), cap=16384)
    result = open_bound(os.path.join(workdir, "result.txt"), 0o444, settlement["result_bytes"], settlement["result_sha256"], cap=128)
    expected_self = H.sha(H.canonical({**settlement, "settlement_sha256_self_excluded": ""}))
    require(settlement["route"] == route and settlement["node_id"] == node_id and expected_self == settlement["settlement_sha256_self_excluded"], "dependency-settlement")
    return result


def materialize(plan, route, node):
    spec = node["payload_spec"]
    if spec["kind"] == "static":
        raw = spec["utf8"].encode("utf-8")
    elif spec["kind"] == "pair":
        raw = H.canonical({"l": read_result(plan, route, spec["left"]).decode("utf-8"), "r": read_result(plan, route, spec["right"]).decode("utf-8")})[:-1]
    else:
        raw = H.canonical({"e": read_result(plan, route, spec["summary"]).decode("utf-8"), "o": spec["options"]})[:-1]
    require(1 <= len(raw) <= LIMITS["subject_payload_utf8_bytes_max"] and b"\r" not in raw and b"\n" not in raw, "materialized-payload")
    return raw


def frames(plan):
    path = os.path.join(plan["experiment"]["root"], "journal")
    directory(path)
    names = sorted(os.listdir(path))
    require(names == ["{:06d}.json".format(index) for index in range(len(names))], "journal-sequence")
    values = []
    for name in names:
        _, value = read_json(os.path.join(path, name), cap=32768)
        require(value.get("frame_index") == len(values) and value.get("schema_id") == "pw-r9-codex-native-goal-progressive-journal-frame-v1", "journal-frame")
        expected_prior = None if not values else H.sha(H.canonical(values[-1]))
        require(value.get("prior_frame_sha256") == expected_prior, "journal-chain")
        values.append(value)
    return values


def write_frame(plan, event, fields):
    values = frames(plan)
    index = len(values)
    prior = None if not values else H.sha(H.canonical(values[-1]))
    value = {"event": event, "frame_index": index, "prior_frame_sha256": prior, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-progressive-journal-frame-v1", **fields}
    publish(os.path.join(plan["experiment"]["root"], "journal", "{:06d}.json".format(index)), H.canonical(value))
    return value


def derive(plan, route, node, payload):
    payload_sha = H.sha(payload)
    nonce = H.sha(H.canonical([plan["experiment"]["id"], route, node["node_id"], payload_sha])[:-1])
    objective = "{}|n={}|r={}|x={}|once".format(plan["experiment"]["objective_prefix"], node["node_id"], ROUTE_CODE[route], nonce)
    task_name = plan["experiment"]["task_prefix"] + nonce
    require(len(objective.encode("utf-8")) <= LIMITS["goal_objective_utf8_bytes_max"], "objective-limit")
    return nonce, objective, task_name


def spawn_prompt(objective, workdir):
    raw = ("Use $r9-goal-notify-atom-v1.\nObjective: " + objective + "\nWorkdir: " + workdir + "\nCapsule count: 3").encode("utf-8")
    require(len(raw) <= LIMITS["spawn_prompt_utf8_bytes_max"], "spawn-prompt-limit")
    return raw


def mint_one(plan_path, plan_raw, plan, route, node):
    require(locate_instance(plan, route, node["node_id"]) is None, "already-minted")
    payload = materialize(plan, route, node)
    nonce, objective, task_name = derive(plan, route, node, payload)
    root = plan["experiment"]["root"]
    route_dir = os.path.join(root, "rows", route)
    node_dir = os.path.join(route_dir, node["node_id"])
    ensure_dir(route_dir, os.path.join(root, "rows"))
    ensure_dir(node_dir, route_dir)
    workdir = instance_dir(plan, route, node["node_id"], nonce)
    make_dir(workdir, node_dir)
    capsules = [node["acceptance_criterion"].encode("utf-8"), payload, node["output_contract"]["utf8"].encode("utf-8")]
    records = []
    for index, raw in enumerate(capsules):
        require(1 <= len(raw) <= 256, "capsule-limit")
        publish(os.path.join(workdir, "capsule-{:03d}.bin".format(index)), raw)
        records.append({"bytes": len(raw), "index": index, "sha256": H.sha(raw)})
    prompt = spawn_prompt(objective, workdir)
    publish(os.path.join(workdir, "spawn_prompt.txt"), prompt)
    pre = {
        "capsules": records,
        "goal_objective": objective,
        "model_requested": ROSTER[route]["model"],
        "node_id": node["node_id"],
        "parent_goal_thread_id": plan["experiment"]["parent_goal_thread_id"],
        "plan_bytes": len(plan_raw),
        "plan_path": plan_path,
        "plan_sha256": H.sha(plan_raw),
        "reader_bytes": READER_BYTES,
        "reader_sha256": READER_SHA256,
        "reasoning_effort_requested": ROSTER[route]["reasoning_effort"],
        "review_nonce": nonce,
        "route": route,
        "schema_id": "pw-r9-codex-native-goal-progressive-atom-predeclaration-v1",
        "skill_bytes": SKILL_BYTES,
        "skill_sha256": SKILL_SHA256,
        "task_path": "/root/" + task_name,
        "workdir": workdir,
    }
    require(set(pre) == PRE_FIELDS, "pre-fields")
    publish(os.path.join(workdir, "predeclaration.json"), H.canonical(pre))
    write_frame(plan, "MINT", {"node_id": node["node_id"], "payload_bytes": len(payload), "payload_sha256": H.sha(payload), "review_nonce": nonce, "route": route, "task_path": pre["task_path"], "workdir": workdir})
    return {**pre, "spawn_prompt": prompt.decode("utf-8")}


def prepare(plan_path, plan_raw, plan):
    root = plan["experiment"]["root"]
    require(not os.path.lexists(root), "root-present")
    parent = os.path.dirname(root)
    directory(parent, 0o777)
    make_dir(root, parent)
    make_dir(os.path.join(root, "journal"), root)
    make_dir(os.path.join(root, "rows"), root)
    run = {"experiment_id": plan["experiment"]["id"], "plan_bytes": len(plan_raw), "plan_path": plan_path, "plan_sha256": H.sha(plan_raw), "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-progressive-canary-run-v1", "status": "OPEN"}
    publish(os.path.join(root, "run.json"), H.canonical(run))
    write_frame(plan, "INIT", {"experiment_id": plan["experiment"]["id"], "plan_sha256": H.sha(plan_raw)})
    return mint_ready(plan_path, plan_raw, plan)


def dependency_ready(plan, route, node):
    return all(locate_instance(plan, route, dep) is not None and os.path.lexists(os.path.join(locate_instance(plan, route, dep), "settlement.json")) for dep in node["dependencies"])


def mint_ready(plan_path, plan_raw, plan):
    require(not os.path.lexists(os.path.join(plan["experiment"]["root"], "accounting.json")), "run-sealed")
    minted = []
    for node in plan["nodes"]:
        for route in plan["routes"]:
            if locate_instance(plan, route, node["node_id"]) is None and dependency_ready(plan, route, node):
                minted.append(mint_one(plan_path, plan_raw, plan, route, node))
    return minted


def read_pre(workdir):
    raw, pre = read_json(os.path.join(workdir, "predeclaration.json"), cap=8192)
    require(set(pre) == PRE_FIELDS and pre["workdir"] == workdir, "predeclaration")
    return raw, pre


def ready(plan):
    claimed = {frame["workdir"] for frame in frames(plan) if frame["event"] in {"CLAIM", "SETTLE"}}
    minted = [frame for frame in frames(plan) if frame["event"] == "MINT"]
    output = []
    for frame in minted:
        workdir = frame["workdir"]
        if workdir in claimed:
            continue
        _, pre = read_pre(workdir)
        prompt = open_bound(os.path.join(workdir, "spawn_prompt.txt"), 0o444, cap=512).decode("utf-8")
        output.append({"goal_objective": pre["goal_objective"], "model": pre["model_requested"], "node_id": pre["node_id"], "reasoning_effort": pre["reasoning_effort_requested"], "review_nonce": pre["review_nonce"], "route": pre["route"], "spawn_prompt": prompt, "task_name": pre["task_path"].removeprefix("/root/"), "task_path": pre["task_path"], "workdir": workdir})
    return sorted(output, key=lambda item: (item["node_id"], plan["routes"].index(item["route"])))


def claim(plan, workdir):
    require(workdir in {item["workdir"] for item in ready(plan)}, "not-ready")
    _, pre = read_pre(workdir)
    value = {"goal_objective": pre["goal_objective"], "node_id": pre["node_id"], "qualification_credit": 0, "review_nonce": pre["review_nonce"], "route": pre["route"], "schema_id": "pw-r9-codex-native-goal-progressive-launch-intent-v1", "status": "CLAIMED_CONSUMED_NO_RETRY", "task_path": pre["task_path"]}
    publish(os.path.join(workdir, "launch_intent.json"), H.canonical(value))
    write_frame(plan, "CLAIM", {"node_id": pre["node_id"], "review_nonce": pre["review_nonce"], "route": pre["route"], "task_path": pre["task_path"], "workdir": workdir})
    return value


def output_text(payload):
    content = payload.get("content")
    require(isinstance(content, list) and len(content) == 1 and content[0].get("type") == "output_text" and isinstance(content[0].get("text"), str), "message-content")
    return content[0]["text"]


def tool_json(output):
    texts = list(H.strings(output))
    matches = [text for text in texts if text.startswith('{"goal":')]
    require(len(matches) == 1, "goal-envelope")
    value = H.parse(matches[0].encode("utf-8"))
    require(isinstance(value, dict) and isinstance(value.get("goal"), dict), "goal-json")
    return value["goal"]


def stable_trace(path):
    first = open_bound(path, 0o664, cap=2000000)
    time.sleep(0.05)
    second = open_bound(path, 0o664, cap=2000000)
    require(first == second, "trace-not-stable")
    return first


def validate_result(node, raw):
    require(1 <= len(raw) <= LIMITS["result_utf8_bytes_max"] and b"\r" not in raw and b"\n" not in raw, "result-framing")
    contract = node["output_contract"]
    text = raw.decode("utf-8")
    if contract["kind"] == "signal":
        require(len(raw) <= contract["max_bytes"] and re.fullmatch(contract["regex"], text), "signal-result")
    else:
        value = H.parse(raw)
        require(H.canonical(value)[:-1] == raw and set(value) == {"selected_choice"} and value["selected_choice"] in contract["options"], "choice-result")


def release_values(workdir, pre):
    values = []
    for index in range(3):
        raw, value = read_json(os.path.join(workdir, "release-{:03d}.json".format(index)), cap=8192)
        require(set(value) == RELEASE_FIELDS and value["capsule_index"] == index and value["qualification_credit"] == 0, "release-shape")
        capsule = open_bound(os.path.join(workdir, "capsule-{:03d}.bin".format(index)), 0o444)
        require((value["capsule_bytes"], value["capsule_sha256"]) == (len(capsule), H.sha(capsule)), "release-capsule")
        require(value["node_id"] == pre["node_id"] and value["route"] == pre["route"] and value["review_nonce"] == pre["review_nonce"] and value["task_path"] == pre["task_path"], "release-binding")
        values.append((raw, value, capsule))
    require(len({item[1]["goal_thread_id"] for item in values}) == 1 and len({item[1]["trace_path"] for item in values}) == 1, "release-global")
    return values


def settle(plan, workdir):
    require(os.path.lexists(os.path.join(workdir, "launch_intent.json")) and not os.path.lexists(os.path.join(workdir, "settlement.json")), "settle-state")
    _, pre = read_pre(workdir)
    nodes = node_map(plan)
    node = nodes[pre["node_id"]]
    releases = release_values(workdir, pre)
    thread_id = releases[0][1]["goal_thread_id"]
    trace_path = releases[0][1]["trace_path"]
    trace_raw = stable_trace(trace_path)
    for _, value, _ in releases:
        prefix = trace_raw[: value["trace_prefix_bytes"]]
        require(len(prefix) == value["trace_prefix_bytes"] and H.sha(prefix) == value["trace_prefix_sha256"], "release-prefix")
    events = [H.parse(line) for line in trace_raw.splitlines()]
    sessions = [event["payload"] for event in events if event.get("type") == "session_meta"]
    require(len(sessions) == 1 and sessions[0].get("id") == thread_id and sessions[0].get("parent_thread_id") == pre["parent_goal_thread_id"] and sessions[0].get("agent_path") == pre["task_path"], "terminal-session")
    contexts = [event["payload"] for event in events if event.get("type") == "turn_context"]
    require(len(contexts) == 1 and contexts[0].get("model") == pre["model_requested"] and contexts[0].get("effort") == pre["reasoning_effort_requested"], "terminal-route")
    records = [(index, event["payload"]) for index, event in enumerate(events) if event.get("type") == "response_item"]
    calls = [(index, payload) for index, payload in records if payload.get("type") == "custom_tool_call"]
    outputs = [(index, payload) for index, payload in records if payload.get("type") == "custom_tool_call_output"]
    require(len(calls) == 5, "call-count")
    skill_call = [item for item in calls if SKILL in item[1].get("input", "")]
    create_call = [item for item in calls if "tools.create_goal" in item[1].get("input", "")]
    driver_call = [item for item in calls if READER in item[1].get("input", "") and workdir in item[1].get("input", "") and thread_id in item[1].get("input", "")]
    get_call = [item for item in calls if "tools.get_goal" in item[1].get("input", "")]
    update_call = [item for item in calls if "tools.update_goal" in item[1].get("input", "")]
    require(all(len(group) == 1 for group in (skill_call, create_call, driver_call, get_call, update_call)), "call-kinds")
    require(skill_call[0][0] < create_call[0][0] < driver_call[0][0] < get_call[0][0] < update_call[0][0], "terminal-order")
    by_call = {call[1]["call_id"]: [payload for _, payload in outputs if payload.get("call_id") == call[1]["call_id"]] for call in (create_call[0], driver_call[0], get_call[0], update_call[0])}
    active = tool_json(by_call[create_call[0][1]["call_id"]][0].get("output"))
    current = tool_json(by_call[get_call[0][1]["call_id"]][0].get("output"))
    complete = tool_json(by_call[update_call[0][1]["call_id"]][0].get("output"))
    require(active.get("threadId") == thread_id and active.get("objective") == pre["goal_objective"] and active.get("status") == "active" and active.get("tokensUsed") == 0 and active.get("timeUsedSeconds") == 0, "terminal-active")
    require(current.get("threadId") == thread_id and current.get("objective") == pre["goal_objective"] and current.get("status") == "active", "terminal-current")
    require(complete.get("threadId") == thread_id and complete.get("objective") == pre["goal_objective"] and complete.get("status") == "complete", "terminal-complete")
    notify = [payload for payload in by_call[driver_call[0][1]["call_id"]] if payload.get("name") == "exec"]
    require([payload.get("output") for payload in notify] == [item[2].decode("utf-8") for item in releases], "notify-outputs")
    finals = [(index, payload) for index, payload in records if payload.get("type") == "message" and payload.get("role") == "assistant" and payload.get("phase") == "final_answer"]
    require(len(finals) == 1 and update_call[0][0] < finals[0][0], "final-order")
    result = output_text(finals[0][1]).encode("utf-8")
    require(result != b"ROW_CONSUMED_PROTOCOL_FAILURE", "protocol-failure-result")
    validate_result(node, result)
    publish(os.path.join(workdir, "terminal_trace.jsonl"), trace_raw)
    publish(os.path.join(workdir, "result.txt"), result)
    goal_receipt = {"active": active, "complete": complete, "goal_thread_id": thread_id, "pre_subject_active": current, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-progressive-atom-goal-receipt-v1", "status": "PASS_FRESH_NATIVE_GOAL_ATOM_ZERO_CREDIT"}
    publish(os.path.join(workdir, "goal_receipt.json"), H.canonical(goal_receipt))
    settlement = {"goal_thread_id": thread_id, "node_id": pre["node_id"], "qualification_credit": 0, "result_bytes": len(result), "result_sha256": H.sha(result), "review_nonce": pre["review_nonce"], "route": pre["route"], "schema_id": "pw-r9-codex-native-goal-progressive-atom-settlement-v1", "settlement_sha256_self_excluded": "", "status": "PASS_PROTOCOL_ZERO_CREDIT", "task_path": pre["task_path"], "trace_bytes": len(trace_raw), "trace_sha256": H.sha(trace_raw)}
    settlement["settlement_sha256_self_excluded"] = H.sha(H.canonical({**settlement, "settlement_sha256_self_excluded": ""}))
    settlement_raw = H.canonical(settlement)
    publish(os.path.join(workdir, "settlement.json"), settlement_raw)
    write_frame(plan, "SETTLE", {"goal_thread_id": thread_id, "node_id": pre["node_id"], "result_bytes": len(result), "result_sha256": H.sha(result), "review_nonce": pre["review_nonce"], "route": pre["route"], "settlement_sha256": H.sha(settlement_raw), "task_path": pre["task_path"], "workdir": workdir})
    return settlement


def seal(plan):
    root = plan["experiment"]["root"]
    require(not os.path.lexists(os.path.join(root, "accounting.json")), "already-sealed")
    results = []
    for node in plan["nodes"]:
        for route in plan["routes"]:
            workdir = locate_instance(plan, route, node["node_id"])
            require(workdir is not None and os.path.lexists(os.path.join(workdir, "settlement.json")), "unsettled:" + route + ":" + node["node_id"])
            raw = read_result(plan, route, node["node_id"])
            results.append({"node_id": node["node_id"], "result_bytes": len(raw), "result_sha256": H.sha(raw), "route": route})
    final_results = {route: read_result(plan, route, plan["experiment"]["final_node_id"]).decode("utf-8") for route in plan["routes"]}
    require(all(value == plan["experiment"]["expected_final"] for value in final_results.values()), "canary-result")
    write_frame(plan, "SEAL_INTENT", {"result_count": len(results)})
    terminal = {"experiment_id": plan["experiment"]["id"], "final_results": final_results, "qualification_credit": 0, "result_count": len(results), "schema_id": "pw-r9-codex-native-goal-progressive-notify-canary-terminal-v1", "status": "PASS_CANARY_ZERO_CREDIT"}
    publish(os.path.join(root, "canary_terminal.json"), H.canonical(terminal))
    accounting = {"clean_full_matrix_streak": 0, "fresh_goal_count": len(results), "full_matrix_count": 0, "qualification_credit": 0, "qualification_score": "0/2", "required_consecutive_clean_full_matrices": 2, "schema_id": "pw-r9-codex-native-goal-progressive-notify-canary-accounting-v1", "status": "SEALED_CANARY_ZERO_CREDIT"}
    publish(os.path.join(root, "accounting.json"), H.canonical(accounting))
    return accounting


def state(plan):
    values = frames(plan)
    return {"claimed": sum(item["event"] == "CLAIM" for item in values), "frame_count": len(values), "minted": sum(item["event"] == "MINT" for item in values), "qualification_credit": 0, "ready": ready(plan), "schema_id": "pw-r9-codex-native-goal-progressive-canary-state-v1", "settled": sum(item["event"] == "SETTLE" for item in values), "status": "PASS_READ_ONLY"}


def main(argv):
    require(len(argv) >= 3 and argv[1] in {"--prepare", "--mint-ready", "--ready", "--claim", "--settle", "--seal", "--check"}, "argv")
    plan_path = os.path.realpath(argv[2])
    plan_raw, plan = load_plan(plan_path)
    command = argv[1]
    if command == "--prepare":
        require(len(argv) == 3, "prepare-argv")
        result = {"minted": len(prepare(plan_path, plan_raw, plan)), "qualification_credit": 0, "ready": ready(plan), "status": "PASS_PREPARED_ZERO_CREDIT"}
    elif command == "--mint-ready":
        require(len(argv) == 3, "mint-argv")
        result = {"minted": len(mint_ready(plan_path, plan_raw, plan)), "qualification_credit": 0, "ready": ready(plan), "status": "PASS_MINTED_ZERO_CREDIT"}
    elif command == "--ready":
        require(len(argv) == 3, "ready-argv")
        result = {"qualification_credit": 0, "ready": ready(plan), "status": "PASS_READ_ONLY"}
    elif command == "--claim":
        require(len(argv) == 4 and os.path.isabs(argv[3]), "claim-argv")
        result = claim(plan, argv[3])
    elif command == "--settle":
        require(len(argv) == 4 and os.path.isabs(argv[3]), "settle-argv")
        result = settle(plan, argv[3])
    elif command == "--seal":
        require(len(argv) == 3, "seal-argv")
        result = seal(plan)
    else:
        require(len(argv) == 3, "check-argv")
        result = {"qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-progressive-canary-static-check-v1", "status": "PASS_DATA_ONLY_ZERO_WRITES"}
    sys.stdout.buffer.write(H.canonical(result))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, H.Invalid, OSError, UnicodeError, ValueError, KeyError, TypeError, json.JSONDecodeError) as error:
        sys.stdout.buffer.write(H.canonical({"first_mismatch": str(error), "qualification_credit": 0, "status": "FAIL"}))
        raise SystemExit(1)
