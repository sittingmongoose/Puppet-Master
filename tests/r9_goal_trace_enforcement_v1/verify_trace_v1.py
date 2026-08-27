#!/usr/bin/env python3
import hashlib
import json
import os
import pathlib
import re
import stat
import sys

EXPECTED_SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-receipt-bound-atom-v1/SKILL.md"
EXPECTED_SKILL_RELATIVE = ".agents/skills/r9-goal-receipt-bound-atom-v1/SKILL.md"


class Invalid(Exception):
    pass


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def canon(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode() + b"\n"


def regular(path, mode):
    info = os.lstat(path)
    if not stat.S_ISREG(info.st_mode) or stat.S_IMODE(info.st_mode) != mode or info.st_uid != os.getuid():
        raise Invalid(f"custody:{path}")
    return pathlib.Path(path).read_bytes()


def load(path, mode):
    raw = regular(path, mode)
    value = json.loads(raw)
    if raw != canon(value):
        raise Invalid(f"canonical:{path}")
    return value, raw


def strings(value):
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return "\n".join(strings(item) for item in value)
    if isinstance(value, dict):
        return "\n".join(strings(item) for item in value.values())
    return ""


def normalized_call(item):
    kind = item.get("type")
    if kind == "function_call":
        name = item.get("name")
        try:
            args = json.loads(item.get("arguments", "{}"))
        except json.JSONDecodeError as error:
            raise Invalid("call-arguments") from error
        body = item.get("arguments", "")
        nested_count = 1
    elif kind == "custom_tool_call" and item.get("name") == "exec":
        body = item.get("input", "")
        nested = re.findall(r"await\s+tools\.([A-Za-z0-9_]+)\s*\(", body)
        if len(nested) != 1:
            raise Invalid("combined-or-empty-orchestration")
        name = nested[0]
        args = {}
        nested_count = len(nested)
    else:
        raise Invalid("unknown-call-kind")
    if name == "create_goal":
        if kind == "function_call":
            objective = args.get("objective")
            if set(args) - {"objective", "token_budget"} or args.get("token_budget") not in (None,):
                raise Invalid("create-goal-args")
        else:
            match = re.search(r'objective\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', body)
            objective = json.loads('"' + match.group(1) + '"') if match else None
        return {"kind": "CREATE_GOAL", "objective": objective, "nested_count": nested_count}
    if name == "update_goal":
        if kind == "function_call":
            status = args.get("status")
        else:
            match = re.search(r'status\s*:\s*"([^"]+)"', body)
            status = match.group(1) if match else None
        return {"kind": "UPDATE_GOAL", "status": status, "nested_count": nested_count}
    if name == "get_goal":
        return {"kind": "GET_GOAL", "nested_count": nested_count}
    if name == "exec_command":
        if kind == "function_call":
            command = args.get("cmd")
            workdir = args.get("workdir")
            max_output = args.get("max_output_tokens")
            yield_ms = args.get("yield_time_ms")
        else:
            command_match = re.search(r'cmd\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', body)
            workdir_match = re.search(r'workdir\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', body)
            max_match = re.search(r'max_output_tokens\s*:\s*(\d+)', body)
            yield_match = re.search(r'yield_time_ms\s*:\s*(\d+)', body)
            command = json.loads('"' + command_match.group(1) + '"') if command_match else None
            workdir = json.loads('"' + workdir_match.group(1) + '"') if workdir_match else None
            max_output = int(max_match.group(1)) if max_match else None
            yield_ms = int(yield_match.group(1)) if yield_match else None
        if command and (EXPECTED_SKILL in command or EXPECTED_SKILL_RELATIVE in command):
            return {"command": command, "kind": "SKILL_READ", "nested_count": nested_count, "workdir": workdir}
        if command and command.startswith("python3 -B atom.py "):
            return {"command": command, "kind": "ATOM_READER", "max_output_tokens": max_output, "nested_count": nested_count, "workdir": workdir, "yield_time_ms": yield_ms}
        return {"command": command, "kind": "OTHER_EXEC", "nested_count": nested_count, "workdir": workdir}
    return {"kind": "OTHER_TOOL", "name": name, "nested_count": nested_count}


def check_row(observed, row, run_root):
    trace_id = observed["trace"]
    trace_path = pathlib.Path(trace_id["path"])
    trace_raw = regular(trace_path, int(trace_id["mode"], 8))
    if len(trace_raw) != trace_id["bytes"] or digest(trace_raw) != trace_id["sha256"]:
        raise Invalid(f"{row['route']}:trace-identity")
    meta = None
    turn = None
    calls = []
    outputs = {}
    finals = []
    for index, raw_line in enumerate(trace_raw.splitlines()):
        entry = json.loads(raw_line)
        payload = entry.get("payload", {})
        if entry.get("type") == "session_meta":
            meta = payload
        elif entry.get("type") == "turn_context" and turn is None:
            turn = payload
        elif entry.get("type") == "response_item" and payload.get("type") in ("function_call", "custom_tool_call"):
            call = normalized_call(payload)
            call.update(call_id=payload.get("call_id"), position=index)
            calls.append(call)
        elif entry.get("type") == "response_item" and payload.get("type") in ("function_call_output", "custom_tool_call_output"):
            outputs[payload.get("call_id")] = {"position": index, "text": strings(payload.get("output"))}
        elif entry.get("type") == "event_msg" and payload.get("type") == "task_complete":
            finals.append({"position": index, "text": payload.get("last_agent_message")})
    if meta is None or turn is None or len(finals) != 1:
        raise Invalid(f"{row['route']}:trace-envelope")
    if meta.get("agent_path") != "/root/" + row["task_name"] or meta.get("id") != row["thread_id"] or meta.get("thread_source") != "subagent":
        raise Invalid(f"{row['route']}:task-identity")
    if turn.get("model") != row["model"] or turn.get("effort") != row["reasoning_effort"]:
        raise Invalid(f"{row['route']}:route")
    kinds = [call["kind"] for call in calls]
    if kinds != ["SKILL_READ", "CREATE_GOAL", "ATOM_READER", "UPDATE_GOAL"]:
        raise Invalid(f"{row['route']}:tool-sequence:{','.join(kinds)}")
    skill, create, reader, update = calls
    if "&&" in skill["command"] or skill["workdir"] != "/mnt/Cursor/PuppetMaster":
        raise Invalid(f"{row['route']}:skill-read")
    if create["objective"] != row["objective"]["text"] or create["nested_count"] != 1:
        raise Invalid(f"{row['route']}:create-goal")
    expected_command = "python3 -B atom.py " + row["thread_id"]
    expected_workdir = str(run_root / "rows" / row["route"])
    if reader["command"] != expected_command or reader["workdir"] != expected_workdir or reader["max_output_tokens"] != 1024 or reader["yield_time_ms"] != 10000 or reader["nested_count"] != 1:
        raise Invalid(f"{row['route']}:reader-call")
    if update["status"] != "complete" or update["nested_count"] != 1:
        raise Invalid(f"{row['route']}:update-goal")
    if any(call["call_id"] not in outputs for call in calls):
        raise Invalid(f"{row['route']}:missing-tool-output")
    create_output = outputs[create["call_id"]]
    reader_output = outputs[reader["call_id"]]
    update_output = outputs[update["call_id"]]
    active_tokens = (f'"threadId":"{row["thread_id"]}"', f'"objective":"{row["objective"]["text"]}"', '"status":"active"')
    complete_tokens = (f'"threadId":"{row["thread_id"]}"', '"status":"complete"')
    if not all(token in create_output["text"] for token in active_tokens):
        raise Invalid(f"{row['route']}:active-receipt")
    atom_raw = regular(run_root / "rows" / row["route"] / "atom.txt", 0o444)
    if reader_output["text"].count(atom_raw.decode()) != 1:
        raise Invalid(f"{row['route']}:atom-output")
    if not all(token in update_output["text"] for token in complete_tokens):
        raise Invalid(f"{row['route']}:complete-receipt")
    if not (create["position"] < create_output["position"] < reader["position"] < reader_output["position"] < update["position"] < update_output["position"] < finals[0]["position"]):
        raise Invalid(f"{row['route']}:ordering")
    if finals[0]["text"] != row["expected_answer"]["utf8"] or observed["final"]["utf8"] != finals[0]["text"]:
        raise Invalid(f"{row['route']}:final")
    journal, _ = load(run_root / "rows" / row["route"] / "journal" / "000.json", 0o444)
    if journal["thread_id"] != row["thread_id"] or journal["atom_sha256"] != row["atom"]["sha256"] or journal["attempt_id"] != row["attempt_id"]:
        raise Invalid(f"{row['route']}:journal")


def main():
    if len(sys.argv) != 3 or sys.argv[1] != "--observation":
        raise Invalid("cli")
    observation_path = pathlib.Path(sys.argv[2]).resolve()
    observation, observation_raw = load(observation_path, 0o644)
    if observation.get("schema_id") != "pw-r9-codex-native-goal-trace-observation-v1" or observation.get("authority") != {"qualification_credit": 0, "subject_matrix": False}:
        raise Invalid("observation")
    manifest_id = observation["manifest"]
    manifest_path = pathlib.Path(manifest_id["path"])
    manifest, manifest_raw = load(manifest_path, int(manifest_id["mode"], 8))
    if len(manifest_raw) != manifest_id["bytes"] or digest(manifest_raw) != manifest_id["sha256"] or manifest["experiment_id"] != observation["experiment_id"]:
        raise Invalid("manifest-binding")
    run_root = pathlib.Path(observation["run_root"])
    if run_root != manifest_path.parent or len(observation["rows"]) != len(manifest["rows"]):
        raise Invalid("run-root")
    if len({row["task_name"] for row in observation["rows"]}) != len(observation["rows"]):
        raise Invalid("task-reuse")
    for observed, row in zip(observation["rows"], manifest["rows"]):
        if observed["route"] != row["route"] or observed["task_name"] != row["task_name"]:
            raise Invalid("row-binding")
        thread_id = pathlib.Path(observed["trace"]["path"]).stem.rsplit("-", 5)[-5:]
        del thread_id
        trace_meta = json.loads(regular(pathlib.Path(observed["trace"]["path"]), int(observed["trace"]["mode"], 8)).splitlines()[0])["payload"]
        row = dict(row, thread_id=trace_meta["id"])
        check_row(observed, row, run_root)
    result = {"assertion_count": 31 * len(manifest["rows"]), "first_mismatch": None, "row_count": len(manifest["rows"]), "status": "PASS_TRACE_ENFORCED_ZERO_CREDIT", "workspace_writes": 0}
    sys.stdout.buffer.write(canon(result))


if __name__ == "__main__":
    try:
        main()
    except (Invalid, OSError, ValueError, TypeError, UnicodeError, json.JSONDecodeError) as error:
        sys.stdout.buffer.write(canon({"first_mismatch": str(error), "status": "FAIL", "workspace_writes": 0}))
        raise SystemExit(1)
