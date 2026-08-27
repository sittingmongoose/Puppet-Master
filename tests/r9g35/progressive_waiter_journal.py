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
SELF = "/mnt/Cursor/PuppetMaster/tests/r9g35/progressive_waiter_journal.py"
DECODER = "/mnt/Cursor/PuppetMaster/tests/r9g26/goal_receipt_decoder.py"
DECODER_BYTES = 9353
DECODER_SHA256 = "4dfd11ca9bf9428daa0f42447e74d09deb3005026426f4a1e286e0552356d8a8"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
SESSION_GLOB = "/home/sittingmongoose/.codex/sessions/2026/08/24/rollout-*-{}.jsonl"
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
    "criterion_utf8_bytes_max": 128,
    "goal_objective_utf8_bytes_max": 128,
    "intermediate_result_utf8_bytes_max": 48,
    "output_contract_utf8_bytes_max": 128,
    "result_utf8_bytes_max": 48,
    "spawn_prompt_utf8_bytes_max": 512,
    "subject_payload_utf8_bytes_max": 170,
    "subject_packet_utf8_bytes_max": 384,
}
TOP_FIELDS = {"authority", "bindings", "experiment", "failure_contract", "limits", "nodes", "qualification", "roster", "routes", "schema_id", "status"}
EXPERIMENT_FIELDS = {"expected_final", "final_node_id", "id", "kind", "max_parallel", "objective_prefix", "parent_goal_thread_id", "root", "stop_at_first_nonpass", "task_prefix"}
NODE_FIELDS = {"acceptance_criterion", "dependencies", "node_id", "output_contract", "payload_spec"}
PRE_FIELDS = {
    "decoder_bytes", "decoder_sha256", "goal_objective", "model_requested", "node_id",
    "parent_goal_thread_id", "plan_bytes", "plan_path", "plan_sha256",
    "reasoning_effort_requested", "review_nonce", "route", "schema_id", "skill_bytes",
    "skill_sha256", "subject_bytes", "subject_sha256", "task_path", "waiter_bytes",
    "waiter_sha256", "workdir",
}
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
HEX = re.compile(r"^[0-9a-f]{64}$")
NODE = re.compile(r"^n[0-9]{3}$")
TASK_PREFIX = re.compile(r"^r9_[a-z0-9_]{1,24}_$")
PREPARED_FILES = {"predeclaration.json", "spawn_prompt.txt", "subject.packet", "wait.py"}
CLAIMED_FILES = PREPARED_FILES | {"launch_intent.json"}
ACTIVE_FILES = CLAIMED_FILES | {"active.json", "active_trace.jsonl", "subject.txt"}
TERMINAL_FILES = ACTIVE_FILES | {"goal_receipt.json", "result.txt", "settlement.json", "terminal_trace.jsonl"}


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def pairs(items):
    value = {}
    for key, item in items:
        require(key not in value, "duplicate-key")
        value[key] = item
    return value


def finite(value):
    if isinstance(value, float):
        require(math.isfinite(value), "nonfinite")
    elif isinstance(value, dict):
        for item in value.values():
            finite(item)
    elif isinstance(value, list):
        for item in value:
            finite(item)


def parse(raw):
    value = json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda value: (_ for _ in ()).throw(Invalid("constant:" + value)))
    finite(value)
    return value


def canonical(value):
    finite(value)
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


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


def write_all(fd, raw):
    view = memoryview(raw)
    while view:
        count = os.write(fd, view)
        require(count > 0, "write")
        view = view[count:]


class Helpers:
    canonical = staticmethod(canonical)
    parse = staticmethod(parse)
    sha = staticmethod(sha)
    strings = staticmethod(strings)
    write_all = staticmethod(write_all)
    Invalid = Invalid


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


H = Helpers


def load_decoder():
    raw = open_bound(DECODER, 0o644, DECODER_BYTES, DECODER_SHA256)
    spec = importlib.util.spec_from_file_location("r9g35_goal_decoder", DECODER)
    require(spec is not None and spec.loader is not None, "decoder-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    require(module.__all__ == ("Invalid", "decode_events", "validate_active", "validate_terminal") and sha(raw) == DECODER_SHA256, "decoder-api")
    return module


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
        plan["schema_id"] == "pw-r9-codex-native-goal-progressive-waiter-canary-plan-v1"
        and plan["status"] == "FROZEN_ZERO_CREDIT_NO_MATRIX_OR_QUALIFICATION_AUTHORITY",
        "plan-identity",
    )
    require(plan["authority"] == AUTHORITY and plan["failure_contract"] == FAILURE, "plan-authority")
    require(plan["qualification"] == QUALIFICATION and plan["roster"] == ROSTER and plan["limits"] == LIMITS, "plan-controls")
    require(plan["routes"] == ["alpha", "bravo", "charlie"], "routes")
    require(set(plan["bindings"]) == {"goal_receipt_decoder", "journal", "offline_verifier", "skill"}, "bindings")
    for value in plan["bindings"].values():
        validate_binding(value)
    require(plan["bindings"]["goal_receipt_decoder"] == binding(DECODER) and plan["bindings"]["skill"] == binding(SKILL), "runtime-bindings")
    require(plan["bindings"]["journal"] == binding(SELF), "journal-binding")
    experiment = plan["experiment"]
    require(set(experiment) == EXPERIMENT_FIELDS, "experiment-shape")
    require(
        experiment["kind"] == "PROGRESSIVE_BLOCKING_WAITER_ATOM_CANARY"
        and experiment["max_parallel"] == 3
        and experiment["stop_at_first_nonpass"] is True,
        "experiment-controls",
    )
    require(UUID.fullmatch(experiment["parent_goal_thread_id"] or "") and TASK_PREFIX.fullmatch(experiment["task_prefix"] or ""), "experiment-identity")
    require(
        os.path.isabs(experiment["root"]) and os.path.realpath(experiment["root"]) == experiment["root"]
        and experiment["root"].startswith("/mnt/Cursor/PuppetMaster/tests/r9g35/"),
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
        require(isinstance(contract, dict) and contract.get("kind") == "choice", "output-kind")
        require(isinstance(contract.get("utf8"), str) and 1 <= len(contract["utf8"].encode("utf-8")) <= LIMITS["output_contract_utf8_bytes_max"], "output-limit")
        require(
            set(contract) == {"kind", "options", "utf8"}
            and isinstance(contract["options"], list) and 2 <= len(contract["options"]) <= 8
            and len(set(contract["options"])) == len(contract["options"])
            and all(isinstance(item, str) and re.fullmatch(r"[A-Za-z0-9._:-]{1,48}", item) for item in contract["options"]),
            "choice-contract",
        )
        spec = node["payload_spec"]
        require(isinstance(spec, dict) and spec.get("kind") in {"static", "pair", "option"}, "payload-spec")
        if spec["kind"] == "static":
            require(set(spec) == {"kind", "utf8"} and not node["dependencies"], "static-spec")
        elif spec["kind"] == "pair":
            require(set(spec) == {"kind", "left", "right"} and node["dependencies"] == [spec["left"], spec["right"]], "pair-spec")
        else:
            require(set(spec) == {"kind", "options", "summary"} and node["dependencies"] == [spec["summary"]] and spec["options"] == contract["options"], "option-spec")
        maximum_payload = materialize_max(node)
        require(1 <= len(maximum_payload) <= LIMITS["subject_payload_utf8_bytes_max"], "payload-limit")
        require(len(subject_packet(node, maximum_payload)) <= LIMITS["subject_packet_utf8_bytes_max"], "subject-max")
        seen.add(node["node_id"])
    require(experiment["final_node_id"] == nodes[-1]["node_id"], "final-node")
    expected = experiment["expected_final"].encode("utf-8")
    validate_result(nodes[-1], expected)


def load_plan(path):
    require(os.path.isabs(path) and os.path.realpath(path) == path and path.startswith("/mnt/Cursor/PuppetMaster/tests/r9g35/"), "plan-path")
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
    raw = ("Use $r9-goal-atom-bootstrap. Exact objective=" + json.dumps(objective) + "; waiter workdir=" + json.dumps(workdir) + ". No subject or expected answer is in this message.").encode("utf-8")
    require(len(raw) <= LIMITS["spawn_prompt_utf8_bytes_max"], "spawn-prompt-limit")
    return raw


def waiter(plan_path):
    raw = ('#!/usr/bin/env python3\nimport runpy,sys\n\nsys.argv=["progressive_waiter_journal.py","--wait",{0},sys.argv[1]]\nrunpy.run_path({1},run_name="__main__")\n'.format(json.dumps(plan_path), json.dumps(SELF))).encode("utf-8")
    require(len(raw) <= 1024, "waiter-limit")
    return raw


def subject_packet(node, payload):
    raw = H.canonical({"criterion": node["acceptance_criterion"], "options": node["output_contract"]["options"], "payload": payload.decode("utf-8"), "response": node["output_contract"]["utf8"]})
    require(1 <= len(raw) <= LIMITS["subject_packet_utf8_bytes_max"], "subject-packet-limit")
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
    subject = subject_packet(node, payload)
    waiter_raw = waiter(plan_path)
    publish(os.path.join(workdir, "subject.packet"), subject)
    publish(os.path.join(workdir, "wait.py"), waiter_raw)
    prompt = spawn_prompt(objective, workdir)
    publish(os.path.join(workdir, "spawn_prompt.txt"), prompt)
    pre = {
        "decoder_bytes": DECODER_BYTES,
        "decoder_sha256": DECODER_SHA256,
        "goal_objective": objective,
        "model_requested": ROSTER[route]["model"],
        "node_id": node["node_id"],
        "parent_goal_thread_id": plan["experiment"]["parent_goal_thread_id"],
        "plan_bytes": len(plan_raw),
        "plan_path": plan_path,
        "plan_sha256": H.sha(plan_raw),
        "reasoning_effort_requested": ROSTER[route]["reasoning_effort"],
        "review_nonce": nonce,
        "route": route,
        "schema_id": "pw-r9-codex-native-goal-progressive-waiter-atom-predeclaration-v1",
        "skill_bytes": SKILL_BYTES,
        "skill_sha256": SKILL_SHA256,
        "subject_bytes": len(subject),
        "subject_sha256": H.sha(subject),
        "task_path": "/root/" + task_name,
        "waiter_bytes": len(waiter_raw),
        "waiter_sha256": H.sha(waiter_raw),
        "workdir": workdir,
    }
    require(set(pre) == PRE_FIELDS, "pre-fields")
    publish(os.path.join(workdir, "predeclaration.json"), H.canonical(pre))
    write_frame(plan, "MINT", {"node_id": node["node_id"], "payload_bytes": len(payload), "payload_sha256": H.sha(payload), "review_nonce": nonce, "route": route, "subject_bytes": len(subject), "subject_sha256": H.sha(subject), "task_path": pre["task_path"], "workdir": workdir})
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
    require(set(os.listdir(workdir)) == PREPARED_FILES, "claim-inventory")
    value = {"goal_objective": pre["goal_objective"], "node_id": pre["node_id"], "qualification_credit": 0, "review_nonce": pre["review_nonce"], "route": pre["route"], "schema_id": "pw-r9-codex-native-goal-progressive-waiter-launch-intent-v1", "status": "CLAIMED_CONSUMED_NO_RETRY", "task_path": pre["task_path"]}
    publish(os.path.join(workdir, "launch_intent.json"), H.canonical(value))
    write_frame(plan, "CLAIM", {"node_id": pre["node_id"], "review_nonce": pre["review_nonce"], "route": pre["route"], "task_path": pre["task_path"], "workdir": workdir})
    return value


def row_values(plan_path, plan_raw, plan, workdir):
    require(os.path.isabs(workdir) and os.path.realpath(workdir) == workdir, "workdir")
    _, pre = read_pre(workdir)
    require(pre["plan_path"] == plan_path and pre["plan_bytes"] == len(plan_raw) and pre["plan_sha256"] == H.sha(plan_raw), "pre-plan")
    require(pre["route"] in plan["routes"] and pre["node_id"] in node_map(plan), "pre-row")
    node = node_map(plan)[pre["node_id"]]
    payload = materialize(plan, pre["route"], node)
    nonce, objective, task_name = derive(plan, pre["route"], node, payload)
    subject = subject_packet(node, payload)
    waiter_raw = waiter(plan_path)
    expected = {
        "decoder_bytes": DECODER_BYTES,
        "decoder_sha256": DECODER_SHA256,
        "goal_objective": objective,
        "model_requested": ROSTER[pre["route"]]["model"],
        "node_id": node["node_id"],
        "parent_goal_thread_id": plan["experiment"]["parent_goal_thread_id"],
        "plan_bytes": len(plan_raw),
        "plan_path": plan_path,
        "plan_sha256": H.sha(plan_raw),
        "reasoning_effort_requested": ROSTER[pre["route"]]["reasoning_effort"],
        "review_nonce": nonce,
        "route": pre["route"],
        "schema_id": "pw-r9-codex-native-goal-progressive-waiter-atom-predeclaration-v1",
        "skill_bytes": SKILL_BYTES,
        "skill_sha256": SKILL_SHA256,
        "subject_bytes": len(subject),
        "subject_sha256": H.sha(subject),
        "task_path": "/root/" + task_name,
        "waiter_bytes": len(waiter_raw),
        "waiter_sha256": H.sha(waiter_raw),
        "workdir": workdir,
    }
    require(pre == expected and instance_dir(plan, pre["route"], node["node_id"], nonce) == workdir, "pre-values")
    require(open_bound(os.path.join(workdir, "spawn_prompt.txt"), 0o444, len(spawn_prompt(objective, workdir)), H.sha(spawn_prompt(objective, workdir))) == spawn_prompt(objective, workdir), "spawn-prompt")
    require(open_bound(os.path.join(workdir, "subject.packet"), 0o444, len(subject), H.sha(subject)) == subject, "subject-packet")
    require(open_bound(os.path.join(workdir, "wait.py"), 0o444, len(waiter_raw), H.sha(waiter_raw)) == waiter_raw, "waiter")
    open_bound(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256)
    open_bound(DECODER, 0o644, DECODER_BYTES, DECODER_SHA256)
    return pre, node, subject


def control(pre, thread_id):
    return {
        "effort": pre["reasoning_effort_requested"],
        "model": pre["model_requested"],
        "objective": pre["goal_objective"],
        "parent_thread_id": pre["parent_goal_thread_id"],
        "skill_alias_path": "/home/sittingmongoose/.codex/skills/.system/r9-goal-atom-bootstrap/SKILL.md",
        "skill_path": SKILL,
        "task_path": pre["task_path"],
        "thread_id": thread_id,
        "wait_arguments": {
            "cmd": "python3 -B wait.py " + thread_id,
            "max_output_tokens": 128,
            "workdir": pre["workdir"],
            "yield_time_ms": 30000,
        },
    }


def trace_path(thread_id):
    require(UUID.fullmatch(thread_id or ""), "thread")
    paths = glob.glob(SESSION_GLOB.format(thread_id))
    require(len(paths) == 1 and os.path.basename(paths[0]).endswith("-" + thread_id + ".jsonl"), "trace-path")
    return paths[0]


def active_trace(thread_id):
    path = trace_path(thread_id)
    before = os.lstat(path)
    require(
        stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode)
        and stat.S_IMODE(before.st_mode) == 0o664 and before.st_uid == os.getuid()
        and before.st_nlink == 1 and 1 <= before.st_size <= 1500000,
        "active-trace-custody",
    )
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require((os.fstat(fd).st_dev, os.fstat(fd).st_ino) == (before.st_dev, before.st_ino), "active-trace-race")
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw))
            require(bool(part), "active-trace-short")
            raw += part
        after = os.fstat(fd)
        require((after.st_dev, after.st_ino) == (before.st_dev, before.st_ino) and after.st_size >= before.st_size, "active-trace-inode")
    finally:
        os.close(fd)
    return path, raw


def stable_trace(path):
    first = open_bound(path, 0o664, cap=2000000)
    time.sleep(0.05)
    second = open_bound(path, 0o664, cap=2000000)
    require(first == second, "trace-not-stable")
    return first


def wait_subject(plan_path, plan_raw, plan, thread_id):
    workdir = os.getcwd()
    pre, node, subject = row_values(plan_path, plan_raw, plan, workdir)
    require(set(os.listdir(workdir)) == CLAIMED_FILES, "wait-inventory")
    claims = [frame for frame in frames(plan) if frame["event"] == "CLAIM" and frame["workdir"] == workdir]
    require(
        len(claims) == 1 and claims[0]["task_path"] == pre["task_path"]
        and claims[0]["review_nonce"] == pre["review_nonce"],
        "wait-claim",
    )
    decoder = load_decoder()
    skill = open_bound(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256)
    deadline = time.monotonic() + 8.0
    while True:
        try:
            path, trace_raw = active_trace(thread_id)
            proof = decoder.validate_active(trace_raw, control(pre, thread_id), subject, skill)
            break
        except (Invalid, decoder.Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError):
            require(time.monotonic() < deadline, "active-proof-timeout")
            time.sleep(0.02)
    require(
        proof["profile"] == "GOAL_RECEIPT_ONLY_BROKER_V1"
        and proof["session"]["agent_path"] == pre["task_path"],
        "active-proof",
    )
    active = {
        "goal_thread_id": thread_id,
        "node_id": node["node_id"],
        "profile": proof["profile"],
        "qualification_credit": 0,
        "route": pre["route"],
        "schema_id": "pw-r9-codex-native-goal-progressive-waiter-active-v1",
        "status": "ACTIVE_ATTESTED_SUBJECT_RELEASED_ZERO_CREDIT",
        "task_path": pre["task_path"],
        "trace": {"bytes": len(trace_raw), "path": path, "sha256": H.sha(trace_raw)},
        "turn_id": proof["turn_id"],
    }
    publish(os.path.join(workdir, "active_trace.jsonl"), trace_raw)
    publish(os.path.join(workdir, "active.json"), H.canonical(active))
    publish(os.path.join(workdir, "subject.txt"), subject)
    require(set(os.listdir(workdir)) == ACTIVE_FILES, "active-inventory")
    H.write_all(1, subject)


def validate_result(node, raw):
    require(1 <= len(raw) <= LIMITS["result_utf8_bytes_max"] and b"\r" not in raw and b"\n" not in raw, "result-framing")
    text = raw.decode("utf-8")
    require(text in node["output_contract"]["options"] and re.fullmatch(r"[A-Za-z0-9._:-]{1,48}", text), "choice-result")


def settle(plan_path, plan_raw, plan, workdir):
    require(not os.path.lexists(os.path.join(workdir, "settlement.json")), "settle-state")
    pre, node, subject = row_values(plan_path, plan_raw, plan, workdir)
    require(set(os.listdir(workdir)) == ACTIVE_FILES, "settle-inventory")
    active_raw, active = read_json(os.path.join(workdir, "active.json"), cap=8192)
    require(
        set(active) == {"goal_thread_id", "node_id", "profile", "qualification_credit", "route", "schema_id", "status", "task_path", "trace", "turn_id"}
        and active["schema_id"] == "pw-r9-codex-native-goal-progressive-waiter-active-v1"
        and active["status"] == "ACTIVE_ATTESTED_SUBJECT_RELEASED_ZERO_CREDIT"
        and active["qualification_credit"] == 0 and active["node_id"] == pre["node_id"]
        and active["route"] == pre["route"] and active["task_path"] == pre["task_path"],
        "active-values",
    )
    thread_id = active["goal_thread_id"]
    active_trace_raw = open_bound(os.path.join(workdir, "active_trace.jsonl"), 0o444, active["trace"]["bytes"], active["trace"]["sha256"], cap=1500000)
    require(open_bound(os.path.join(workdir, "subject.txt"), 0o444, len(subject), H.sha(subject)) == subject, "subject-copy")
    path = trace_path(thread_id)
    require(path == active["trace"]["path"], "trace-binding")
    trace_raw = stable_trace(path)
    require(trace_raw.startswith(active_trace_raw) and len(trace_raw) > len(active_trace_raw), "active-prefix")
    decoder = load_decoder()
    skill = open_bound(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256)
    try:
        proof = decoder.validate_terminal(trace_raw, active_trace_raw, control(pre, thread_id), subject, skill, set(node["output_contract"]["options"]))
    except decoder.Invalid as error:
        raise Invalid("terminal-decoder:" + str(error)) from error
    require(
        proof["profile"] == "GOAL_RECEIPT_ONLY_BROKER_V1"
        and proof["session"]["agent_path"] == pre["task_path"]
        and proof["turn_id"] == active["turn_id"],
        "terminal-proof",
    )
    result = proof["result"].encode("utf-8")
    validate_result(node, result)
    publish(os.path.join(workdir, "terminal_trace.jsonl"), trace_raw)
    publish(os.path.join(workdir, "result.txt"), result)
    goal_receipt = {
        "active_goal": proof["active_goal"],
        "complete_goal": proof["complete_goal"],
        "control_reads": proof["control_reads"],
        "goal_thread_id": thread_id,
        "node_id": pre["node_id"],
        "profile": proof["profile"],
        "qualification_credit": 0,
        "result": proof["result"],
        "review_nonce": pre["review_nonce"],
        "route": pre["route"],
        "schema_id": "pw-r9-codex-native-goal-progressive-waiter-goal-receipt-v1",
        "status": "PASS_FRESH_NATIVE_GOAL_ATOM_ZERO_CREDIT",
        "task_path": pre["task_path"],
        "traces": {
            "active": {"bytes": len(active_trace_raw), "sha256": H.sha(active_trace_raw)},
            "terminal": {"bytes": len(trace_raw), "sha256": H.sha(trace_raw)},
        },
        "turn_count": 1,
        "turn_id": proof["turn_id"],
    }
    publish(os.path.join(workdir, "goal_receipt.json"), H.canonical(goal_receipt))
    settlement = {
        "goal_thread_id": thread_id,
        "node_id": pre["node_id"],
        "qualification_credit": 0,
        "result_bytes": len(result),
        "result_sha256": H.sha(result),
        "review_nonce": pre["review_nonce"],
        "route": pre["route"],
        "schema_id": "pw-r9-codex-native-goal-progressive-waiter-settlement-v1",
        "settlement_sha256_self_excluded": "",
        "status": "PASS_PROTOCOL_ZERO_CREDIT",
        "task_path": pre["task_path"],
        "trace_bytes": len(trace_raw),
        "trace_sha256": H.sha(trace_raw),
    }
    settlement["settlement_sha256_self_excluded"] = H.sha(H.canonical({**settlement, "settlement_sha256_self_excluded": ""}))
    settlement_raw = H.canonical(settlement)
    publish(os.path.join(workdir, "settlement.json"), settlement_raw)
    require(set(os.listdir(workdir)) == TERMINAL_FILES, "terminal-inventory")
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
    terminal = {"experiment_id": plan["experiment"]["id"], "final_results": final_results, "qualification_credit": 0, "result_count": len(results), "schema_id": "pw-r9-codex-native-goal-progressive-waiter-canary-terminal-v1", "status": "PASS_CANARY_ZERO_CREDIT"}
    publish(os.path.join(root, "canary_terminal.json"), H.canonical(terminal))
    accounting = {"clean_full_matrix_streak": 0, "fresh_goal_count": len(results), "full_matrix_count": 0, "qualification_credit": 0, "qualification_score": "0/2", "required_consecutive_clean_full_matrices": 2, "schema_id": "pw-r9-codex-native-goal-progressive-waiter-canary-accounting-v1", "status": "SEALED_CANARY_ZERO_CREDIT"}
    publish(os.path.join(root, "accounting.json"), H.canonical(accounting))
    return accounting


def state(plan):
    values = frames(plan)
    return {"claimed": sum(item["event"] == "CLAIM" for item in values), "frame_count": len(values), "minted": sum(item["event"] == "MINT" for item in values), "qualification_credit": 0, "ready": ready(plan), "schema_id": "pw-r9-codex-native-goal-progressive-canary-state-v1", "settled": sum(item["event"] == "SETTLE" for item in values), "status": "PASS_READ_ONLY"}


def main(argv):
    require(len(argv) >= 3 and argv[1] in {"--prepare", "--mint-ready", "--ready", "--claim", "--settle", "--seal", "--check", "--wait"}, "argv")
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
        result = settle(plan_path, plan_raw, plan, argv[3])
    elif command == "--wait":
        require(len(argv) == 4 and UUID.fullmatch(argv[3] or ""), "wait-argv")
        wait_subject(plan_path, plan_raw, plan, argv[3])
        return 0
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
