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
SELF = "/mnt/Cursor/PuppetMaster/tests/r9g35/progressive_waiter_verifier.py"
DECODER = "/mnt/Cursor/PuppetMaster/tests/r9g26/goal_receipt_decoder.py"
DECODER_BYTES = 9353
DECODER_SHA256 = "4dfd11ca9bf9428daa0f42447e74d09deb3005026426f4a1e286e0552356d8a8"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
ROSTER = {
    "alpha": {"model": "gpt-5.4-mini", "reasoning_effort": "xhigh"},
    "bravo": {"model": "gpt-5.4-mini", "reasoning_effort": "medium"},
    "charlie": {"model": "gpt-5.6-luna", "reasoning_effort": "medium"},
}
ROUTE_CODE = {"alpha": "a", "bravo": "b", "charlie": "c"}
LIMITS = {
    "criterion_utf8_bytes_max": 128,
    "goal_objective_utf8_bytes_max": 128,
    "intermediate_result_utf8_bytes_max": 48,
    "output_contract_utf8_bytes_max": 128,
    "result_utf8_bytes_max": 48,
    "spawn_prompt_utf8_bytes_max": 512,
    "subject_packet_utf8_bytes_max": 384,
    "subject_payload_utf8_bytes_max": 170,
}
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
HEX = re.compile(r"^[0-9a-f]{64}$")
TASK_PREFIX = re.compile(r"^[a-z0-9_]{1,32}$")


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
    require((after.st_dev, after.st_ino, after.st_size) == (before.st_dev, before.st_ino, before.st_size), "race:" + path)
    require((current.st_dev, current.st_ino, current.st_size) == (before.st_dev, before.st_ino, before.st_size), "drift:" + path)
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


def binding(path):
    raw = read_exact(path, 0o644, cap=500000)
    return {"bytes": len(raw), "mode": "0644", "path": path, "sha256": sha(raw)}


def validate_binding(value):
    require(set(value) == {"bytes", "mode", "path", "sha256"} and value["mode"] == "0644", "binding-shape")
    require(os.path.isabs(value["path"]) and type(value["bytes"]) is int and value["bytes"] > 0 and HEX.fullmatch(value["sha256"] or ""), "binding-values")
    read_exact(value["path"], 0o644, value["bytes"], value["sha256"])


def load_plan(path):
    require(os.path.isabs(path) and os.path.realpath(path) == path and path.startswith("/mnt/Cursor/PuppetMaster/tests/r9g35/"), "plan-path")
    raw = read_exact(path, 0o444, cap=1000000)
    plan = parse(raw)
    require(raw == canonical(plan), "plan-canonical")
    require(set(plan) == {"authority", "bindings", "experiment", "failure_contract", "limits", "nodes", "qualification", "roster", "routes", "schema_id", "status"}, "plan-shape")
    require(plan["schema_id"] == "pw-r9-codex-native-goal-progressive-waiter-canary-plan-v1" and plan["status"] == "FROZEN_ZERO_CREDIT_NO_MATRIX_OR_QUALIFICATION_AUTHORITY", "plan-identity")
    require(plan["roster"] == ROSTER and plan["routes"] == ["alpha", "bravo", "charlie"], "plan-roster")
    require(plan["authority"] == {"canary_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0}, "plan-authority")
    require(plan["failure_contract"] == {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0}, "plan-failure")
    require(plan["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "required_consecutive_clean_full_matrices": 2}, "plan-qualification")
    require(plan["limits"] == LIMITS, "plan-limits")
    require(set(plan["bindings"]) == {"goal_receipt_decoder", "journal", "offline_verifier", "skill"}, "plan-bindings")
    for value in plan["bindings"].values():
        validate_binding(value)
    require(plan["bindings"]["offline_verifier"] == binding(SELF), "verifier-binding")
    require(plan["bindings"]["goal_receipt_decoder"] == binding(DECODER) and plan["bindings"]["skill"] == binding(SKILL), "runtime-bindings")
    experiment = plan["experiment"]
    require(set(experiment) == {"expected_final", "final_node_id", "id", "kind", "max_parallel", "objective_prefix", "parent_goal_thread_id", "root", "stop_at_first_nonpass", "task_prefix"}, "experiment-shape")
    require(experiment["kind"] == "PROGRESSIVE_BLOCKING_WAITER_ATOM_CANARY" and experiment["max_parallel"] == 3 and experiment["stop_at_first_nonpass"] is True, "experiment")
    require(
        UUID.fullmatch(experiment["parent_goal_thread_id"] or "")
        and os.path.isabs(experiment["root"])
        and os.path.realpath(experiment["root"]) == experiment["root"]
        and experiment["root"].startswith("/mnt/Cursor/PuppetMaster/tests/r9g35/")
        and isinstance(experiment["objective_prefix"], str)
        and len(experiment["objective_prefix"].encode("utf-8")) <= 16
        and TASK_PREFIX.fullmatch(experiment["task_prefix"] or ""),
        "experiment-path",
    )
    nodes = plan["nodes"]
    require(isinstance(nodes, list) and 2 <= len(nodes) <= 32, "node-count")
    seen = set()
    for index, node in enumerate(nodes):
        require(set(node) == {"acceptance_criterion", "dependencies", "node_id", "output_contract", "payload_spec"} and node["node_id"] == "n{:03d}".format(index), "node-shape")
        require(isinstance(node["dependencies"], list) and all(dep in seen for dep in node["dependencies"]), "node-order")
        require(isinstance(node["acceptance_criterion"], str) and 1 <= len(node["acceptance_criterion"].encode("utf-8")) <= LIMITS["criterion_utf8_bytes_max"], "node-criterion")
        contract = node["output_contract"]
        require(set(contract) == {"kind", "options", "utf8"} and contract["kind"] == "choice" and 2 <= len(contract["options"]) <= 8 and len(set(contract["options"])) == len(contract["options"]), "node-contract")
        require(all(isinstance(item, str) and re.fullmatch(r"[A-Za-z0-9._:-]{1,48}", item) for item in contract["options"]), "node-options")
        require(isinstance(contract["utf8"], str) and 1 <= len(contract["utf8"].encode("utf-8")) <= LIMITS["output_contract_utf8_bytes_max"], "node-output")
        spec = node["payload_spec"]
        require(isinstance(spec, dict), "payload-spec")
        if spec.get("kind") == "static":
            require(set(spec) == {"kind", "utf8"} and not node["dependencies"] and isinstance(spec["utf8"], str), "static-spec")
            maximum_payload = spec["utf8"].encode("utf-8")
        elif spec.get("kind") == "pair":
            require(set(spec) == {"kind", "left", "right"} and node["dependencies"] == [spec["left"], spec["right"]], "pair-spec")
            maximum_payload = canonical({"l": "x" * 48, "r": "x" * 48})[:-1]
        elif spec.get("kind") == "option":
            require(set(spec) == {"kind", "options", "summary"} and node["dependencies"] == [spec["summary"]] and spec["options"] == contract["options"], "option-spec")
            maximum_payload = canonical({"e": "x" * 48, "o": spec["options"]})[:-1]
        else:
            raise Invalid("payload-kind")
        require(1 <= len(maximum_payload) <= LIMITS["subject_payload_utf8_bytes_max"], "payload-limit")
        require(len(subject_packet(node, maximum_payload)) <= LIMITS["subject_packet_utf8_bytes_max"], "subject-max")
        seen.add(node["node_id"])
    require(experiment["final_node_id"] == nodes[-1]["node_id"], "final-node")
    validate_result(nodes[-1], experiment["expected_final"].encode("utf-8"))
    return raw, plan


def inventory(root):
    rows = []
    for current, dirs, files in os.walk(root, topdown=True, followlinks=False):
        dirs.sort(); files.sort()
        rel_dir = os.path.relpath(current, root)
        info = os.lstat(current)
        require(stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode), "inventory-directory")
        rows.append({"kind": "d", "mode": stat.S_IMODE(info.st_mode), "path": rel_dir})
        for name in files:
            path = os.path.join(current, name)
            raw = read_exact(path, stat.S_IMODE(os.lstat(path).st_mode), cap=3000000)
            rows.append({"bytes": len(raw), "kind": "f", "mode": stat.S_IMODE(os.lstat(path).st_mode), "path": os.path.relpath(path, root), "sha256": sha(raw)})
    return sha(canonical(rows))


def load_decoder():
    raw = read_exact(DECODER, 0o644, DECODER_BYTES, DECODER_SHA256)
    spec = importlib.util.spec_from_file_location("r9g35_offline_goal_decoder", DECODER)
    require(spec is not None and spec.loader is not None, "decoder-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    require(module.__all__ == ("Invalid", "decode_events", "validate_active", "validate_terminal") and sha(raw) == DECODER_SHA256, "decoder-api")
    return module


def waiter(plan_path, journal_path):
    return ('#!/usr/bin/env python3\nimport runpy,sys\n\nsys.argv=["progressive_waiter_journal.py","--wait",{0},sys.argv[1]]\nrunpy.run_path({1},run_name="__main__")\n'.format(json.dumps(plan_path), json.dumps(journal_path))).encode("utf-8")


def subject_packet(node, payload):
    return canonical({"criterion": node["acceptance_criterion"], "options": node["output_contract"]["options"], "payload": payload.decode("utf-8"), "response": node["output_contract"]["utf8"]})


def control(plan, pre, thread_id):
    return {
        "effort": pre["reasoning_effort_requested"],
        "model": pre["model_requested"],
        "objective": pre["goal_objective"],
        "parent_thread_id": pre["parent_goal_thread_id"],
        "skill_alias_path": "/home/sittingmongoose/.codex/skills/.system/r9-goal-atom-bootstrap/SKILL.md",
        "skill_path": plan["bindings"]["skill"]["path"],
        "task_path": pre["task_path"],
        "thread_id": thread_id,
        "wait_arguments": {
            "cmd": "python3 -B wait.py " + thread_id,
            "max_output_tokens": 128,
            "workdir": pre["workdir"],
            "yield_time_ms": 30000,
        },
    }


def validate_result(node, result):
    require(1 <= len(result) <= 48 and b"\r" not in result and b"\n" not in result, "result-framing")
    require(result.decode("utf-8") in node["output_contract"]["options"] and re.fullmatch(rb"[A-Za-z0-9._:-]{1,48}", result), "choice-result")


def expected_payload(node, prior):
    spec = node["payload_spec"]
    if spec["kind"] == "static":
        return spec["utf8"].encode("utf-8")
    if spec["kind"] == "pair":
        return canonical({"l": prior[spec["left"]].decode("utf-8"), "r": prior[spec["right"]].decode("utf-8")})[:-1]
    return canonical({"e": prior[spec["summary"]].decode("utf-8"), "o": spec["options"]})[:-1]


def validate_row(plan_path, plan_raw, plan, route, node, prior, identities):
    parent = os.path.join(plan["experiment"]["root"], "rows", route, node["node_id"])
    directory(parent)
    names = sorted(os.listdir(parent))
    require(len(names) == 1 and HEX.fullmatch(names[0] or ""), "instance")
    nonce = names[0]
    workdir = os.path.join(parent, nonce)
    directory(workdir)
    required = {
        "active.json", "active_trace.jsonl", "goal_receipt.json", "launch_intent.json",
        "predeclaration.json", "result.txt", "settlement.json", "spawn_prompt.txt",
        "subject.packet", "subject.txt", "terminal_trace.jsonl", "wait.py",
    }
    require(set(os.listdir(workdir)) == required, "row-inventory")
    pre_raw, pre = read_json(os.path.join(workdir, "predeclaration.json"), cap=8192)
    payload = expected_payload(node, prior)
    expected_nonce = sha(canonical([plan["experiment"]["id"], route, node["node_id"], sha(payload)])[:-1])
    objective = "{}|n={}|r={}|x={}|once".format(plan["experiment"]["objective_prefix"], node["node_id"], ROUTE_CODE[route], expected_nonce)
    task_path = "/root/" + plan["experiment"]["task_prefix"] + expected_nonce
    subject = subject_packet(node, payload)
    waiter_raw = waiter(plan_path, plan["bindings"]["journal"]["path"])
    expected_pre = {
        "decoder_bytes": DECODER_BYTES,
        "decoder_sha256": DECODER_SHA256,
        "goal_objective": objective,
        "model_requested": ROSTER[route]["model"],
        "node_id": node["node_id"],
        "parent_goal_thread_id": plan["experiment"]["parent_goal_thread_id"],
        "plan_bytes": len(plan_raw),
        "plan_path": plan_path,
        "plan_sha256": sha(plan_raw),
        "reasoning_effort_requested": ROSTER[route]["reasoning_effort"],
        "review_nonce": expected_nonce,
        "route": route,
        "schema_id": "pw-r9-codex-native-goal-progressive-waiter-atom-predeclaration-v1",
        "skill_bytes": SKILL_BYTES,
        "skill_sha256": SKILL_SHA256,
        "subject_bytes": len(subject),
        "subject_sha256": sha(subject),
        "task_path": task_path,
        "waiter_bytes": len(waiter_raw),
        "waiter_sha256": sha(waiter_raw),
        "workdir": workdir,
    }
    require(nonce == expected_nonce and pre == expected_pre and pre_raw == canonical(expected_pre), "pre-values")
    spawn = ("Use $r9-goal-atom-bootstrap. Exact objective=" + json.dumps(objective) + "; waiter workdir=" + json.dumps(workdir) + ". No subject or expected answer is in this message.").encode("utf-8")
    require(read_exact(os.path.join(workdir, "spawn_prompt.txt"), 0o444, len(spawn), sha(spawn)) == spawn, "spawn-prompt")
    require(read_exact(os.path.join(workdir, "subject.packet"), 0o444, len(subject), sha(subject)) == subject, "subject-packet")
    require(read_exact(os.path.join(workdir, "wait.py"), 0o444, len(waiter_raw), sha(waiter_raw)) == waiter_raw, "waiter")
    launch_raw, launch = read_json(os.path.join(workdir, "launch_intent.json"), cap=8192)
    expected_launch = {
        "goal_objective": objective,
        "node_id": node["node_id"],
        "qualification_credit": 0,
        "review_nonce": nonce,
        "route": route,
        "schema_id": "pw-r9-codex-native-goal-progressive-waiter-launch-intent-v1",
        "status": "CLAIMED_CONSUMED_NO_RETRY",
        "task_path": task_path,
    }
    require(launch == expected_launch and launch_raw == canonical(expected_launch), "launch-intent")
    active_raw, active = read_json(os.path.join(workdir, "active.json"), cap=8192)
    require(
        set(active) == {"goal_thread_id", "node_id", "profile", "qualification_credit", "route", "schema_id", "status", "task_path", "trace", "turn_id"}
        and active["schema_id"] == "pw-r9-codex-native-goal-progressive-waiter-active-v1"
        and active["status"] == "ACTIVE_ATTESTED_SUBJECT_RELEASED_ZERO_CREDIT"
        and active["node_id"] == node["node_id"] and active["route"] == route
        and active["task_path"] == task_path and active["qualification_credit"] == 0,
        "active",
    )
    thread_id = active["goal_thread_id"]
    require(UUID.fullmatch(thread_id or "") and thread_id not in identities["goals"], "goal-unique")
    active_trace = read_exact(os.path.join(workdir, "active_trace.jsonl"), 0o444, active["trace"]["bytes"], active["trace"]["sha256"], cap=1500000)
    require(read_exact(os.path.join(workdir, "subject.txt"), 0o444, len(subject), sha(subject)) == subject, "subject-copy")
    terminal_trace = read_exact(os.path.join(workdir, "terminal_trace.jsonl"), 0o444, cap=2000000)
    require(terminal_trace.startswith(active_trace) and len(terminal_trace) > len(active_trace), "trace-prefix")
    decoder = load_decoder()
    skill = read_exact(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256)
    try:
        proof = decoder.validate_terminal(terminal_trace, active_trace, control(plan, pre, thread_id), subject, skill, set(node["output_contract"]["options"]))
    except decoder.Invalid as error:
        raise Invalid("trace-decoder:" + str(error)) from error
    require(
        proof["profile"] == "GOAL_RECEIPT_ONLY_BROKER_V1"
        and proof["session"]["agent_path"] == task_path
        and proof["turn_id"] == active["turn_id"],
        "trace-proof",
    )
    result = read_exact(os.path.join(workdir, "result.txt"), 0o444, len(proof["result"].encode("utf-8")), sha(proof["result"].encode("utf-8")), cap=48)
    validate_result(node, result)
    goal_raw, goal = read_json(os.path.join(workdir, "goal_receipt.json"), cap=16384)
    expected_goal = {
        "active_goal": proof["active_goal"],
        "complete_goal": proof["complete_goal"],
        "control_reads": proof["control_reads"],
        "goal_thread_id": thread_id,
        "node_id": node["node_id"],
        "profile": proof["profile"],
        "qualification_credit": 0,
        "result": proof["result"],
        "review_nonce": nonce,
        "route": route,
        "schema_id": "pw-r9-codex-native-goal-progressive-waiter-goal-receipt-v1",
        "status": "PASS_FRESH_NATIVE_GOAL_ATOM_ZERO_CREDIT",
        "task_path": task_path,
        "traces": {
            "active": {"bytes": len(active_trace), "sha256": sha(active_trace)},
            "terminal": {"bytes": len(terminal_trace), "sha256": sha(terminal_trace)},
        },
        "turn_count": 1,
        "turn_id": proof["turn_id"],
    }
    require(goal == expected_goal and goal_raw == canonical(expected_goal), "goal-receipt")
    settlement_raw, settlement = read_json(os.path.join(workdir, "settlement.json"), cap=16384)
    expected_self = sha(canonical({**settlement, "settlement_sha256_self_excluded": ""}))
    require(
        set(settlement) == {"goal_thread_id", "node_id", "qualification_credit", "result_bytes", "result_sha256", "review_nonce", "route", "schema_id", "settlement_sha256_self_excluded", "status", "task_path", "trace_bytes", "trace_sha256"}
        and settlement["schema_id"] == "pw-r9-codex-native-goal-progressive-waiter-settlement-v1"
        and settlement["status"] == "PASS_PROTOCOL_ZERO_CREDIT"
        and settlement["settlement_sha256_self_excluded"] == expected_self
        and settlement["result_sha256"] == sha(result) and settlement["result_bytes"] == len(result)
        and settlement["trace_sha256"] == sha(terminal_trace) and settlement["trace_bytes"] == len(terminal_trace)
        and settlement["goal_thread_id"] == thread_id and settlement["node_id"] == node["node_id"]
        and settlement["route"] == route and settlement["review_nonce"] == nonce
        and settlement["task_path"] == task_path and settlement["qualification_credit"] == 0,
        "settlement",
    )
    require(task_path not in identities["tasks"] and nonce not in identities["nonces"], "task-unique")
    identities["goals"].add(thread_id)
    identities["tasks"].add(task_path)
    identities["nonces"].add(nonce)
    return result, {"goal_thread_id": thread_id, "nonce": nonce, "result_sha256": sha(result), "settlement_sha256": sha(settlement_raw), "task_path": task_path, "workdir": workdir}


def verify(plan_path, plan_raw, plan):
    root = plan["experiment"]["root"]
    directory(root)
    before = inventory(root)
    require(set(os.listdir(root)) == {"accounting.json", "canary_terminal.json", "journal", "rows", "run.json"}, "root-inventory")
    run_raw, run = read_json(os.path.join(root, "run.json"), cap=8192)
    require(run["plan_path"] == plan_path and run["plan_sha256"] == sha(plan_raw) and run["status"] == "OPEN" and run["qualification_credit"] == 0, "run")
    directory(os.path.join(root, "journal")); directory(os.path.join(root, "rows"))
    frame_names = sorted(os.listdir(os.path.join(root, "journal")))
    expected_frames = 1 + len(plan["nodes"]) * len(plan["routes"]) * 3 + 1
    require(frame_names == ["{:06d}.json".format(index) for index in range(expected_frames)], "journal-count")
    frames = []
    for name in frame_names:
        _, frame = read_json(os.path.join(root, "journal", name), cap=32768)
        require(frame["frame_index"] == len(frames) and frame["prior_frame_sha256"] == (None if not frames else sha(canonical(frames[-1]))), "journal-chain")
        frames.append(frame)
    require(sum(item["event"] == "INIT" for item in frames) == 1 and sum(item["event"] == "MINT" for item in frames) == len(plan["nodes"]) * 3 and sum(item["event"] == "CLAIM" for item in frames) == len(plan["nodes"]) * 3 and sum(item["event"] == "SETTLE" for item in frames) == len(plan["nodes"]) * 3 and frames[-1]["event"] == "SEAL_INTENT", "journal-events")
    identities = {"goals": set(), "nonces": set(), "tasks": set()}
    results = {route: {} for route in plan["routes"]}
    records = []
    for node in plan["nodes"]:
        for route in plan["routes"]:
            result, record = validate_row(plan_path, plan_raw, plan, route, node, results[route], identities)
            results[route][node["node_id"]] = result
            records.append({"node_id": node["node_id"], "route": route, **record})
    final = {route: results[route][plan["experiment"]["final_node_id"]].decode("utf-8") for route in plan["routes"]}
    require(all(value == plan["experiment"]["expected_final"] for value in final.values()), "final-results")
    terminal_raw, terminal = read_json(os.path.join(root, "canary_terminal.json"), cap=16384)
    require(terminal == {"experiment_id": plan["experiment"]["id"], "final_results": final, "qualification_credit": 0, "result_count": len(records), "schema_id": "pw-r9-codex-native-goal-progressive-waiter-canary-terminal-v1", "status": "PASS_CANARY_ZERO_CREDIT"}, "terminal")
    accounting_raw, accounting = read_json(os.path.join(root, "accounting.json"), cap=8192)
    require(accounting == {"clean_full_matrix_streak": 0, "fresh_goal_count": len(records), "full_matrix_count": 0, "qualification_credit": 0, "qualification_score": "0/2", "required_consecutive_clean_full_matrices": 2, "schema_id": "pw-r9-codex-native-goal-progressive-waiter-canary-accounting-v1", "status": "SEALED_CANARY_ZERO_CREDIT"}, "accounting")
    require(os.lstat(os.path.join(root, "accounting.json")).st_mtime_ns >= os.lstat(os.path.join(root, "canary_terminal.json")).st_mtime_ns, "accounting-last")
    after = inventory(root)
    require(before == after, "verification-write")
    return {"assertion_count": 241 + len(records) * 83, "first_mismatch": None, "fresh_goal_count": len(records), "inventory_sha256": after, "qualification_credit": 0, "route_counts": {route: len(results[route]) for route in plan["routes"]}, "schema_id": "pw-r9-codex-native-goal-progressive-waiter-canary-verification-v1", "status": "PASS_CANARY_ZERO_CREDIT_NO_MATRIX_AUTHORITY", "workspace_writes": 0}


def main(argv):
    require(len(argv) == 3 and argv[1] in {"--check", "--verify"}, "argv")
    plan_path = os.path.realpath(argv[2])
    plan_raw, plan = load_plan(plan_path)
    if argv[1] == "--check":
        require(not os.path.lexists(plan["experiment"]["root"]), "check-root-present")
        result = {"first_mismatch": None, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-progressive-waiter-canary-verification-v1", "status": "PASS_DATA_ONLY_ZERO_WRITES", "workspace_writes": 0}
    else:
        result = verify(plan_path, plan_raw, plan)
    sys.stdout.buffer.write(canonical(result))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, ValueError, KeyError, TypeError, json.JSONDecodeError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "qualification_credit": 0, "status": "FAIL", "workspace_writes": 0}))
        raise SystemExit(1)
