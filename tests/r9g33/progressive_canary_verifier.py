#!/usr/bin/env python3
import hashlib
import json
import math
import os
import re
import stat
import sys

SELF = "/mnt/Cursor/PuppetMaster/tests/r9g33/progressive_canary_verifier.py"
ROSTER = {
    "alpha": {"model": "gpt-5.4-mini", "reasoning_effort": "xhigh"},
    "bravo": {"model": "gpt-5.4-mini", "reasoning_effort": "medium"},
    "charlie": {"model": "gpt-5.6-luna", "reasoning_effort": "medium"},
}
ROUTE_CODE = {"alpha": "a", "bravo": "b", "charlie": "c"}
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
HEX = re.compile(r"^[0-9a-f]{64}$")


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
    require(os.path.isabs(path) and os.path.realpath(path) == path and path.startswith("/mnt/Cursor/PuppetMaster/tests/r9g33/"), "plan-path")
    raw = read_exact(path, 0o444, cap=1000000)
    plan = parse(raw)
    require(raw == canonical(plan), "plan-canonical")
    require(set(plan) == {"authority", "bindings", "experiment", "failure_contract", "limits", "nodes", "qualification", "roster", "routes", "schema_id", "status"}, "plan-shape")
    require(plan["schema_id"] == "pw-r9-codex-native-goal-progressive-notify-canary-plan-v1" and plan["status"] == "FROZEN_ZERO_CREDIT_NO_MATRIX_OR_QUALIFICATION_AUTHORITY", "plan-identity")
    require(plan["roster"] == ROSTER and plan["routes"] == ["alpha", "bravo", "charlie"], "plan-roster")
    require(plan["authority"] == {"canary_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0}, "plan-authority")
    require(plan["failure_contract"] == {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0}, "plan-failure")
    require(plan["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "required_consecutive_clean_full_matrices": 2}, "plan-qualification")
    require(set(plan["bindings"]) == {"journal", "offline_verifier", "reader", "skill"}, "plan-bindings")
    for value in plan["bindings"].values():
        validate_binding(value)
    require(plan["bindings"]["offline_verifier"] == binding(SELF), "verifier-binding")
    experiment = plan["experiment"]
    require(experiment["kind"] == "PROGRESSIVE_NOTIFY_ATOM_CANARY" and experiment["max_parallel"] == 3 and experiment["stop_at_first_nonpass"] is True, "experiment")
    require(UUID.fullmatch(experiment["parent_goal_thread_id"] or "") and os.path.isabs(experiment["root"]) and experiment["root"].startswith("/mnt/Cursor/PuppetMaster/tests/r9g33/"), "experiment-path")
    nodes = plan["nodes"]
    require(isinstance(nodes, list) and 2 <= len(nodes) <= 32, "node-count")
    seen = set()
    for index, node in enumerate(nodes):
        require(set(node) == {"acceptance_criterion", "dependencies", "node_id", "output_contract", "payload_spec"} and node["node_id"] == "n{:03d}".format(index), "node-shape")
        require(all(dep in seen for dep in node["dependencies"]), "node-order")
        seen.add(node["node_id"])
    require(experiment["final_node_id"] == nodes[-1]["node_id"], "final-node")
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


def output_text(payload):
    content = payload.get("content")
    require(isinstance(content, list) and len(content) == 1 and content[0].get("type") == "output_text" and isinstance(content[0].get("text"), str), "message")
    return content[0]["text"]


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for key, item in value.items():
            yield from strings(key); yield from strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)


def tool_goal(output):
    values = [text for text in strings(output) if text.startswith('{"goal":')]
    require(len(values) == 1, "goal-envelope")
    goal = parse(values[0].encode("utf-8")).get("goal")
    require(isinstance(goal, dict), "goal-record")
    return goal


def validate_result(node, result):
    require(1 <= len(result) <= 128 and b"\r" not in result and b"\n" not in result, "result-framing")
    contract = node["output_contract"]
    if contract["kind"] == "signal":
        require(len(result) <= contract["max_bytes"] and re.fullmatch(contract["regex"], result.decode("utf-8")), "signal-result")
    else:
        value = parse(result)
        require(canonical(value)[:-1] == result and set(value) == {"selected_choice"} and value["selected_choice"] in contract["options"], "choice-result")


def validate_trace(trace_raw, pre, capsules, result, reader_path, skill_path):
    require(trace_raw.endswith(b"\n") and b"\r" not in trace_raw, "trace-framing")
    events = [parse(line) for line in trace_raw.splitlines()]
    sessions = [event["payload"] for event in events if event.get("type") == "session_meta"]
    require(len(sessions) == 1 and sessions[0].get("parent_thread_id") == pre["parent_goal_thread_id"] and sessions[0].get("agent_path") == pre["task_path"], "trace-session")
    contexts = [event["payload"] for event in events if event.get("type") == "turn_context"]
    require(len(contexts) == 1 and contexts[0].get("model") == pre["model_requested"] and contexts[0].get("effort") == pre["reasoning_effort_requested"], "trace-route")
    records = [(index, event["payload"]) for index, event in enumerate(events) if event.get("type") == "response_item"]
    calls = [(index, payload) for index, payload in records if payload.get("type") == "custom_tool_call"]
    outputs = [(index, payload) for index, payload in records if payload.get("type") == "custom_tool_call_output"]
    require(len(calls) == 5, "trace-call-count")
    groups = [
        [item for item in calls if skill_path in item[1].get("input", "")],
        [item for item in calls if "tools.create_goal" in item[1].get("input", "")],
        [item for item in calls if reader_path in item[1].get("input", "") and pre["workdir"] in item[1].get("input", "")],
        [item for item in calls if "tools.get_goal" in item[1].get("input", "")],
        [item for item in calls if "tools.update_goal" in item[1].get("input", "")],
    ]
    require(all(len(group) == 1 for group in groups), "trace-call-kinds")
    require(groups[0][0][0] < groups[1][0][0] < groups[2][0][0] < groups[3][0][0] < groups[4][0][0], "trace-order")
    by_call = {group[0][1]["call_id"]: [payload for _, payload in outputs if payload.get("call_id") == group[0][1]["call_id"]] for group in groups[1:]}
    active = tool_goal(by_call[groups[1][0][1]["call_id"]][0].get("output"))
    current = tool_goal(by_call[groups[3][0][1]["call_id"]][0].get("output"))
    complete = tool_goal(by_call[groups[4][0][1]["call_id"]][0].get("output"))
    require(active.get("status") == "active" and active.get("objective") == pre["goal_objective"] and active.get("tokensUsed") == 0 and active.get("timeUsedSeconds") == 0, "trace-active")
    thread_id = active.get("threadId")
    require(UUID.fullmatch(thread_id or "") and current.get("threadId") == thread_id and current.get("status") == "active" and complete.get("threadId") == thread_id and complete.get("status") == "complete", "trace-goal-lifecycle")
    notify = [payload.get("output") for payload in by_call[groups[2][0][1]["call_id"]] if payload.get("name") == "exec"]
    require(notify == [capsule.decode("utf-8") for capsule in capsules], "trace-notify")
    finals = [(index, payload) for index, payload in records if payload.get("type") == "message" and payload.get("role") == "assistant" and payload.get("phase") == "final_answer"]
    require(len(finals) == 1 and groups[4][0][0] < finals[0][0] and output_text(finals[0][1]).encode("utf-8") == result, "trace-final")
    return thread_id


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
    required = {"capsule-000.bin", "capsule-001.bin", "capsule-002.bin", "goal_receipt.json", "launch_intent.json", "predeclaration.json", "release-000.json", "release-001.json", "release-002.json", "result.txt", "settlement.json", "spawn_prompt.txt", "terminal_trace.jsonl"}
    require(set(os.listdir(workdir)) == required, "row-inventory")
    pre_raw, pre = read_json(os.path.join(workdir, "predeclaration.json"), cap=8192)
    require(pre["plan_path"] == plan_path and pre["plan_bytes"] == len(plan_raw) and pre["plan_sha256"] == sha(plan_raw), "pre-plan")
    require(pre["route"] == route and pre["node_id"] == node["node_id"] and pre["workdir"] == workdir and pre["model_requested"] == ROSTER[route]["model"] and pre["reasoning_effort_requested"] == ROSTER[route]["reasoning_effort"], "pre-route")
    capsules = [read_exact(os.path.join(workdir, "capsule-{:03d}.bin".format(index)), 0o444, cap=256) for index in range(3)]
    require(capsules[0] == node["acceptance_criterion"].encode("utf-8") and capsules[2] == node["output_contract"]["utf8"].encode("utf-8"), "capsule-static")
    expected = expected_payload(node, prior)
    require(capsules[1] == expected and 1 <= len(expected) <= 170, "capsule-payload")
    expected_nonce = sha(canonical([plan["experiment"]["id"], route, node["node_id"], sha(expected)])[:-1])
    require(nonce == expected_nonce and pre["review_nonce"] == nonce, "nonce")
    objective = "{}|n={}|r={}|x={}|once".format(plan["experiment"]["objective_prefix"], node["node_id"], ROUTE_CODE[route], nonce)
    task_path = "/root/" + plan["experiment"]["task_prefix"] + nonce
    require(pre["goal_objective"] == objective and pre["task_path"] == task_path, "task-identity")
    spawn = ("Use $r9-goal-notify-atom-v1.\nObjective: " + objective + "\nWorkdir: " + workdir + "\nCapsule count: 3").encode("utf-8")
    require(read_exact(os.path.join(workdir, "spawn_prompt.txt"), 0o444) == spawn, "spawn-prompt")
    result = read_exact(os.path.join(workdir, "result.txt"), 0o444, cap=128)
    validate_result(node, result)
    settlement_raw, settlement = read_json(os.path.join(workdir, "settlement.json"), cap=16384)
    expected_self = sha(canonical({**settlement, "settlement_sha256_self_excluded": ""}))
    require(settlement["settlement_sha256_self_excluded"] == expected_self and settlement["result_sha256"] == sha(result) and settlement["result_bytes"] == len(result), "settlement")
    trace_raw = read_exact(os.path.join(workdir, "terminal_trace.jsonl"), 0o444, cap=2000000)
    thread_id = validate_trace(trace_raw, pre, capsules, result, plan["bindings"]["reader"]["path"], plan["bindings"]["skill"]["path"])
    require(thread_id == settlement["goal_thread_id"] and thread_id not in identities["goals"], "goal-unique")
    require(task_path not in identities["tasks"] and nonce not in identities["nonces"], "task-unique")
    identities["goals"].add(thread_id); identities["tasks"].add(task_path); identities["nonces"].add(nonce)
    for index in range(3):
        release_raw, release = read_json(os.path.join(workdir, "release-{:03d}.json".format(index)), cap=8192)
        require(release["goal_thread_id"] == thread_id and release["capsule_index"] == index and release["capsule_sha256"] == sha(capsules[index]) and release["trace_prefix_sha256"] == sha(trace_raw[: release["trace_prefix_bytes"]]), "release")
    goal_raw, goal = read_json(os.path.join(workdir, "goal_receipt.json"), cap=16384)
    require(goal["goal_thread_id"] == thread_id and goal["status"] == "PASS_FRESH_NATIVE_GOAL_ATOM_ZERO_CREDIT" and goal["qualification_credit"] == 0, "goal-receipt")
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
    require(terminal == {"experiment_id": plan["experiment"]["id"], "final_results": final, "qualification_credit": 0, "result_count": len(records), "schema_id": "pw-r9-codex-native-goal-progressive-notify-canary-terminal-v1", "status": "PASS_CANARY_ZERO_CREDIT"}, "terminal")
    accounting_raw, accounting = read_json(os.path.join(root, "accounting.json"), cap=8192)
    require(accounting == {"clean_full_matrix_streak": 0, "fresh_goal_count": len(records), "full_matrix_count": 0, "qualification_credit": 0, "qualification_score": "0/2", "required_consecutive_clean_full_matrices": 2, "schema_id": "pw-r9-codex-native-goal-progressive-notify-canary-accounting-v1", "status": "SEALED_CANARY_ZERO_CREDIT"}, "accounting")
    require(os.lstat(os.path.join(root, "accounting.json")).st_mtime_ns >= os.lstat(os.path.join(root, "canary_terminal.json")).st_mtime_ns, "accounting-last")
    after = inventory(root)
    require(before == after, "verification-write")
    return {"assertion_count": 241 + len(records) * 83, "first_mismatch": None, "fresh_goal_count": len(records), "inventory_sha256": after, "qualification_credit": 0, "route_counts": {route: len(results[route]) for route in plan["routes"]}, "schema_id": "pw-r9-codex-native-goal-progressive-notify-canary-verification-v1", "status": "PASS_CANARY_ZERO_CREDIT_NO_MATRIX_AUTHORITY", "workspace_writes": 0}


def main(argv):
    require(len(argv) == 3 and argv[1] in {"--check", "--verify"}, "argv")
    plan_path = os.path.realpath(argv[2])
    plan_raw, plan = load_plan(plan_path)
    if argv[1] == "--check":
        require(not os.path.lexists(plan["experiment"]["root"]), "check-root-present")
        result = {"first_mismatch": None, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-progressive-notify-canary-verification-v1", "status": "PASS_DATA_ONLY_ZERO_WRITES", "workspace_writes": 0}
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
