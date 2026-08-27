#!/usr/bin/env python3
import importlib.util
import json
import os
import re
import stat
import sys
import time

sys.dont_write_bytecode = True
SELF = "/mnt/Cursor/PuppetMaster/tests/r9g36/goal_socket_canary.py"
BROKER = "/mnt/Cursor/PuppetMaster/tests/r9g36/goal_socket_broker.py"
BROKER_BYTES = 14778
BROKER_SHA256 = "37a50d0ea9aeb2c4166191ba85049003928e28f2e981a8a29b67ac1ba2ef2f0e"
ATTESTOR = "/mnt/Cursor/PuppetMaster/tests/r9g36/goal_db_attestor.py"
ATTESTOR_BYTES = 9118
ATTESTOR_SHA256 = "274b818da6ae51fb7c01608c4b3aca2e0d3f69a74bfb9815db816aa57b38bcc6"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
DIRECT_ENVELOPE = re.compile(r"Chunk ID: [0-9a-f]+\nWall time: (?:0|[1-9][0-9]*)(?:\.[0-9]+)? seconds\nProcess exited with code (-?[0-9]+)\nOriginal token count: [0-9]+\nOutput:\n([\s\S]*)")
TOKEN = re.compile(r"^[A-Za-z0-9._:-]{1,48}$")


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def load_module(name, path, size, digest):
    raw = open_bound(path, 0o644, size, digest)
    spec = importlib.util.spec_from_file_location(name, path)
    require(spec is not None and spec.loader is not None, name + "-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module, raw


def broker_module():
    module, _ = load_module("r9g36_broker_contract", BROKER, BROKER_BYTES, BROKER_SHA256)
    return module


def attestor_module():
    module, _ = load_module("r9g36_attestor_contract", ATTESTOR, ATTESTOR_BYTES, ATTESTOR_SHA256)
    require(module.__all__ == ("Invalid", "active", "canonical", "parse", "terminal_absent"), "attestor-api")
    return module


def open_bound(path, mode, size=None, digest=None, cap=None):
    module = globals().get("_BROKER")
    if module is not None:
        return module.read_exact(path, mode, size, digest, cap)
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode) and stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1, "custody:" + path)
    require(size is None or before.st_size == size, "size:" + path)
    require(cap is None or before.st_size <= cap, "cap:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw)); require(bool(part), "short:" + path); raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
    finally:
        os.close(fd)
    if digest is not None:
        import hashlib
        require(hashlib.sha256(raw).hexdigest() == digest, "digest:" + path)
    return raw


_BROKER = broker_module()


def canonical(value):
    return _BROKER.canonical(value)


def parse(raw):
    return _BROKER.parse(raw)


def sha(raw):
    return _BROKER.sha(raw)


def publish(path, raw, mode=0o444):
    _BROKER.publish(path, raw, mode)


def directory(path, mode=0o700):
    _BROKER.directory(path, mode)


def load_plan(path):
    raw, plan = _BROKER.load_plan(path)
    require(plan["bindings"]["controller"] == _BROKER.binding(SELF), "controller-binding")
    return raw, plan


def make_dir(path, parent):
    directory(parent)
    os.mkdir(path, 0o700)
    os.chmod(path, 0o700)
    _BROKER.fsync_dir(parent)
    directory(path)


def waiter(socket_path, route, subject):
    source = '''#!/usr/bin/env python3
import hashlib,json,socket,sys
if len(sys.argv)!=2: raise SystemExit(2)
r={route!r}; t=sys.argv[1]; p={socket_path!r}
q=json.dumps({{"route":r,"schema_id":"pw-r9-codex-native-goal-db-socket-subject-request-v1","thread_id":t}},sort_keys=True,separators=(",",":")).encode()+b"\\n"
s=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM); s.settimeout(8.0); s.connect(p); s.sendall(q); s.shutdown(socket.SHUT_WR)
raw=b""
while True:
 x=s.recv(512)
 if not x: break
 raw+=x
s.close()
if len(raw)!={size} or hashlib.sha256(raw).hexdigest()!={digest!r}: raise SystemExit(3)
sys.stdout.buffer.write(raw)
'''.format(route=route, socket_path=socket_path, size=subject["bytes"], digest=subject["sha256"])
    raw = source.encode("utf-8")
    require(len(raw) <= 1400, "waiter-size")
    return raw


def spawn_prompt(objective, workdir):
    raw = ("Use $r9-goal-atom-bootstrap. Exact objective=" + json.dumps(objective) + "; waiter workdir=" + json.dumps(workdir) + ". No subject, criterion, options, or expected answer is in this message.").encode("utf-8")
    require(len(raw) <= 512, "spawn-prompt")
    return raw


def prepare(plan_path, plan_raw, plan):
    root = plan["experiment"]["root"]
    require(not os.path.lexists(root), "root-exists")
    make_dir(root, os.path.dirname(root))
    make_dir(os.path.join(root, "rows"), root)
    socket_path = os.path.join(root, plan["experiment"]["socket_name"])
    for row in plan["rows"]:
        workdir = os.path.join(root, "rows", row["route"])
        make_dir(workdir, os.path.join(root, "rows"))
        prompt = spawn_prompt(row["goal_objective"], workdir)
        wait_raw = waiter(socket_path, row["route"], row["subject"])
        pre = {
            "goal_objective": row["goal_objective"],
            "model_requested": row["model"],
            "plan": {"bytes": len(plan_raw), "path": plan_path, "sha256": sha(plan_raw)},
            "qualification_credit": 0,
            "reasoning_effort_requested": row["reasoning_effort"],
            "route": row["route"],
            "schema_id": "pw-r9-codex-native-goal-db-socket-predeclaration-v1",
            "spawn_prompt": {"bytes": len(prompt), "sha256": sha(prompt)},
            "status": "PREDECLARED_NO_SUBJECT_BYTES_ON_DISK",
            "subject_commitment": row["subject"],
            "task_name": row["task_name"],
            "task_path": row["task_path"],
            "waiter": {"bytes": len(wait_raw), "sha256": sha(wait_raw)},
            "workdir": workdir,
        }
        publish(os.path.join(workdir, "predeclaration.json"), canonical(pre))
        publish(os.path.join(workdir, "spawn_prompt.txt"), prompt)
        publish(os.path.join(workdir, "wait.py"), wait_raw)
    prepared = {"qualification_credit": 0, "routes": [row["route"] for row in plan["rows"]], "schema_id": "pw-r9-codex-native-goal-db-socket-prepared-v1", "status": "PASS_PREPARED_WITH_ZERO_SUBJECT_BYTES_ON_DISK"}
    publish(os.path.join(root, "prepared.json"), canonical(prepared))
    return prepared


def workdir_for(plan, route):
    require(route in {"alpha", "bravo", "charlie"}, "route")
    path = os.path.join(plan["experiment"]["root"], "rows", route)
    directory(path)
    return path


def row_for(plan, route):
    rows = [row for row in plan["rows"] if row["route"] == route]
    require(len(rows) == 1, "row")
    return rows[0]


def claim(plan, route):
    row = row_for(plan, route); workdir = workdir_for(plan, route)
    require(set(os.listdir(workdir)) == {"predeclaration.json", "spawn_prompt.txt", "wait.py"}, "claim-inventory")
    value = {"goal_objective": row["goal_objective"], "qualification_credit": 0, "route": route, "schema_id": "pw-r9-codex-native-goal-db-socket-launch-intent-v1", "status": "CLAIMED_CONSUMED_NO_RETRY", "task_path": row["task_path"]}
    publish(os.path.join(workdir, "launch_intent.json"), canonical(value))
    return value


def stable_trace(path):
    first = open_bound(path, 0o664, cap=2000000)
    time.sleep(0.05)
    second = open_bound(path, 0o664, cap=2000000)
    require(first == second and first.endswith(b"\n") and b"\r" not in first, "trace-stable")
    return first


def output_body(payload):
    output = payload.get("output")
    if payload.get("type") == "custom_tool_call_output":
        require(isinstance(output, list) and len(output) == 2 and output[0].get("type") == "input_text" and output[1].get("type") == "input_text", "wrapped-output")
        require(set(output[0]) == {"text", "type"} and set(output[1]) == {"text", "type"}, "wrapped-blocks")
        return output[1]["text"]
    require(payload.get("type") == "function_call_output" and isinstance(output, str), "direct-output")
    match = DIRECT_ENVELOPE.fullmatch(output)
    if match is not None:
        require(int(match.group(1)) == 0, "exec-code")
        return match.group(2)
    return output


def validate_trace(raw, row, active, subject):
    events = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        require(line.endswith(b"\n") and line.count(b"\n") == 1, "trace-line:" + str(index))
        event = parse(line)
        require(set(event) == {"payload", "timestamp", "type"} and isinstance(event["payload"], dict), "trace-event")
        events.append(event)
    metas = [e["payload"] for e in events if e["type"] == "session_meta"]
    require(len(metas) == 1 and metas[0].get("id") == active["attestation"]["goal"]["thread_id"] and metas[0].get("agent_path") == row["task_path"], "session-meta")
    direct_calls = [(i, e["payload"]) for i, e in enumerate(events) if e["type"] == "response_item" and e["payload"].get("type") == "function_call"]
    direct_outputs = [(i, e["payload"]) for i, e in enumerate(events) if e["type"] == "response_item" and e["payload"].get("type") == "function_call_output"]
    wrapped_calls = [(i, e["payload"]) for i, e in enumerate(events) if e["type"] == "response_item" and e["payload"].get("type") == "custom_tool_call"]
    wrapped_outputs = [(i, e["payload"]) for i, e in enumerate(events) if e["type"] == "response_item" and e["payload"].get("type") == "custom_tool_call_output"]
    require(not (direct_calls and wrapped_calls) and not (direct_outputs and wrapped_outputs), "mixed-tools")
    calls, outputs = (direct_calls, direct_outputs) if direct_calls else (wrapped_calls, wrapped_outputs)
    require(len(calls) == 4 and len(outputs) == 4, "tool-count")
    if direct_calls:
        require([item["name"] for _, item in calls] == ["exec_command", "create_goal", "exec_command", "update_goal"], "direct-sequence")
    else:
        for _, item in calls:
            source = item.get("input")
            require(isinstance(source, str) and source.count("tools.") == 1, "wrapped-single-tool")
            require(not any(token in source for token in ("tools[", "ALL_TOOLS", "globalThis", "eval(", "Function(", "store(", "load(", "notify(")), "wrapped-hidden-tool")
    by_call = {item["call_id"]: (index, output_body(item)) for index, item in outputs}
    bodies = []
    for call_index, call in calls:
        require(call["call_id"] in by_call and call_index < by_call[call["call_id"]][0], "call-output")
        bodies.append((by_call[call["call_id"]][0], by_call[call["call_id"]][1]))
    skill = open_bound(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256).decode("utf-8")
    require(bodies[0][1] == skill, "skill-output")
    active_goal = parse(bodies[1][1].encode("utf-8"))["goal"]
    complete_goal = parse(bodies[3][1].encode("utf-8"))["goal"]
    thread_id = active["attestation"]["goal"]["thread_id"]
    require(active_goal["threadId"] == thread_id and active_goal["objective"] == row["goal_objective"] and active_goal["status"] == "active", "active-output")
    require(complete_goal["threadId"] == thread_id and complete_goal["objective"] == row["goal_objective"] and complete_goal["status"] == "complete", "complete-output")
    require(bodies[2][1].encode("utf-8") == subject, "subject-output")
    finals = [e["payload"] for e in events if e["type"] == "response_item" and e["payload"].get("type") == "message" and e["payload"].get("phase") == "final_answer"]
    require(len(finals) == 1 and len(finals[0].get("content", [])) == 1 and finals[0]["content"][0].get("type") == "output_text", "final-shape")
    result = finals[0]["content"][0].get("text")
    require(isinstance(result, str) and TOKEN.fullmatch(result), "final-token")
    completes = [(i, e["payload"]) for i, e in enumerate(events) if e["type"] == "event_msg" and e["payload"].get("type") == "task_complete"]
    require(len(completes) == 1 and completes[0][0] == len(events) - 1 and completes[0][1].get("last_agent_message") == result, "task-complete")
    return result.encode("utf-8"), active_goal, complete_goal


def settle(plan, route):
    row = row_for(plan, route); workdir = workdir_for(plan, route)
    require(not os.path.lexists(os.path.join(workdir, "settlement.json")), "settled")
    _, active = _BROKER.read_json(os.path.join(workdir, "active_goal.json"), cap=32768)
    subject = open_bound(os.path.join(workdir, "subject.txt"), 0o444, row["subject"]["bytes"], row["subject"]["sha256"], cap=384)
    proof = active["attestation"]
    require(proof["status"] == "ACTIVE_NATIVE_GOAL_ATTESTED_BEFORE_SUBJECT" and active["route"] == route, "active-proof")
    attestor = attestor_module()
    terminal = attestor.terminal_absent(proof["goal"]["thread_id"], plan["experiment"]["parent_goal_thread_id"], row["task_path"], row["model"], row["reasoning_effort"])
    trace_path = proof["thread"]["rollout_path"]
    trace = stable_trace(trace_path)
    result, active_goal, complete_goal = validate_trace(trace, row, active, subject)
    require(len(result) == row["expected_result"]["bytes"] and sha(result) == row["expected_result"]["sha256"], "expected-result")
    publish(os.path.join(workdir, "terminal_trace.jsonl"), trace)
    publish(os.path.join(workdir, "result.txt"), result)
    terminal_receipt = {"active_goal_output": active_goal, "complete_goal_output": complete_goal, "database_terminal": terminal, "qualification_credit": 0, "route": route, "schema_id": "pw-r9-codex-native-goal-db-socket-terminal-receipt-v1", "status": "PASS_GOAL_ACTIVE_THROUGH_SUBJECT_AND_COMPLETE"}
    publish(os.path.join(workdir, "terminal_goal.json"), canonical(terminal_receipt))
    settlement = {"goal_thread_id": proof["goal"]["thread_id"], "qualification_credit": 0, "result": {"bytes": len(result), "sha256": sha(result)}, "route": route, "schema_id": "pw-r9-codex-native-goal-db-socket-settlement-v1", "status": "PASS_PROTOCOL_ZERO_CREDIT", "trace": {"bytes": len(trace), "sha256": sha(trace)}}
    publish(os.path.join(workdir, "settlement.json"), canonical(settlement))
    return settlement


def ready(plan):
    result = []
    for row in plan["rows"]:
        workdir = workdir_for(plan, row["route"])
        if not os.path.lexists(os.path.join(workdir, "launch_intent.json")):
            prompt = open_bound(os.path.join(workdir, "spawn_prompt.txt"), 0o444, cap=512).decode("utf-8")
            result.append({"model": row["model"], "reasoning_effort": row["reasoning_effort"], "route": row["route"], "spawn_prompt": prompt, "task_name": row["task_name"], "workdir": workdir})
    return result


def seal(plan):
    root = plan["experiment"]["root"]
    require(not os.path.lexists(os.path.join(root, "accounting.json")), "sealed")
    _, broker_terminal = _BROKER.read_json(os.path.join(root, "broker_terminal.json"), cap=8192)
    require(broker_terminal["delivered_routes"] == ["alpha", "bravo", "charlie"], "broker-terminal")
    results = {}
    for row in plan["rows"]:
        workdir = workdir_for(plan, row["route"])
        _, settlement = _BROKER.read_json(os.path.join(workdir, "settlement.json"), cap=8192)
        require(settlement["status"] == "PASS_PROTOCOL_ZERO_CREDIT", "settlement")
        raw = open_bound(os.path.join(workdir, "result.txt"), 0o444, row["expected_result"]["bytes"], row["expected_result"]["sha256"], cap=48)
        results[row["route"]] = raw.decode("utf-8")
    terminal = {"experiment_id": plan["experiment"]["id"], "qualification_credit": 0, "results": results, "schema_id": "pw-r9-codex-native-goal-db-socket-canary-terminal-v1", "status": "PASS_CANARY_ZERO_CREDIT"}
    publish(os.path.join(root, "canary_terminal.json"), canonical(terminal))
    accounting = {"clean_full_matrix_streak": 0, "fresh_goal_count": 3, "full_matrix_count": 0, "qualification_credit": 0, "qualification_score": "0/2", "required_consecutive_clean_full_matrices": 2, "schema_id": "pw-r9-codex-native-goal-db-socket-canary-accounting-v1", "status": "SEALED_CANARY_ZERO_CREDIT"}
    publish(os.path.join(root, "accounting.json"), canonical(accounting))
    return accounting


def main(argv):
    require(len(argv) >= 3 and argv[1] in {"--check", "--prepare", "--ready", "--claim", "--settle", "--seal"}, "argv")
    plan_path = os.path.realpath(argv[2]); plan_raw, plan = load_plan(plan_path); command = argv[1]
    if command == "--check":
        require(len(argv) == 3 and not os.path.lexists(plan["experiment"]["root"]), "check-state")
        result = {"qualification_credit": 0, "status": "PASS_DATA_ONLY_ZERO_WRITES"}
    elif command == "--prepare":
        require(len(argv) == 3, "prepare-argv"); result = prepare(plan_path, plan_raw, plan)
    elif command == "--ready":
        require(len(argv) == 3, "ready-argv"); result = {"qualification_credit": 0, "ready": ready(plan), "status": "PASS_READ_ONLY"}
    elif command == "--claim":
        require(len(argv) == 4, "claim-argv"); result = claim(plan, argv[3])
    elif command == "--settle":
        require(len(argv) == 4, "settle-argv"); result = settle(plan, argv[3])
    else:
        require(len(argv) == 3, "seal-argv"); result = seal(plan)
    sys.stdout.buffer.write(canonical(result)); return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, _BROKER.Invalid, OSError, UnicodeError, ValueError, KeyError, TypeError, json.JSONDecodeError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "qualification_credit": 0, "status": "FAIL"}))
        raise SystemExit(1)
