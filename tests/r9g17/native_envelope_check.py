#!/usr/bin/env python3
import copy
import hashlib
import importlib.util
import json
import math
import os
import stat
import sys

sys.dont_write_bytecode = True
CODEC = "/mnt/Cursor/PuppetMaster/tests/r9g17/native_envelope.py"
CODEC_BYTES = 4661
CODEC_SHA256 = "d2aef9d619f6c4ec779e6d2dce2d1b6fc89282fd91cc4b9f56bc82490df0f246"
TRACE = "/home/sittingmongoose/.codex/sessions/2026/08/24/rollout-2026-08-24T04-08-41-01a031f4-c966-75d2-8521-a9bfeddbd22f.jsonl"
TRACE_BYTES = 95720
TRACE_SHA256 = "46a9f3be1fd2df16273d844cd24e6ad03b6aa24fa373491b429c94232e9a2349"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
ROW = "/mnt/Cursor/PuppetMaster/tests/r9g16/r/A01/86697bfffbe3f125cd9aaa0061c95406f543262adb348f2c5110c426fd50dbf9"
THREAD = "01a031f4-c966-75d2-8521-a9bfeddbd22f"
TURN = "01a031f4-cae6-78c3-bfd3-4e4d16f741c8"
OBJECTIVE = "CG9R|a=A01|x=86697bfffbe3f125cd9aaa0061c95406f543262adb348f2c5110c426fd50dbf9|once"


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


def compact(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def meta(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def read_bound(path, mode, size, digest):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1, "custody:" + path)
    require(before.st_size == size, "bytes:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require(meta(os.fstat(fd)) == meta(before), "open-race:" + path)
        raw = b""
        while len(raw) < size:
            part = os.read(fd, size - len(raw))
            require(bool(part), "short:" + path)
            raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
    finally:
        os.close(fd)
    require(meta(os.lstat(path)) == meta(before) and sha(raw) == digest, "identity:" + path)
    return raw


def load_codec():
    read_bound(CODEC, 0o644, CODEC_BYTES, CODEC_SHA256)
    spec = importlib.util.spec_from_file_location("r9g17_native_envelope", CODEC)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def goal(text, status):
    value = parse(text.encode("utf-8"))
    require(set(value) == {"completionBudgetReport", "goal", "remainingTokens"}, "goal-envelope")
    item = value["goal"]
    require(set(item) == {"createdAt", "objective", "status", "threadId", "timeUsedSeconds", "tokensUsed", "updatedAt"}, "goal-fields")
    require((item["threadId"], item["objective"], item["status"]) == (THREAD, OBJECTIVE, status), "goal-binding")
    require(all(isinstance(item[key], int) and not isinstance(item[key], bool) and item[key] >= 0 for key in ("createdAt", "updatedAt", "timeUsedSeconds", "tokensUsed")), "goal-counters")
    if status == "active":
        require(item["tokensUsed"] == 0 and item["timeUsedSeconds"] == 0 and value["completionBudgetReport"] is None, "goal-active")
    else:
        require(isinstance(value["completionBudgetReport"], str) and value["completionBudgetReport"], "goal-complete")
    return item


def reject(codec, text, label, expected):
    try:
        value = codec.parse_call(text)
    except (codec.Invalid, ValueError, TypeError):
        return 1
    if value != expected:
        return 1
    raise Invalid("mutation-accepted:" + label)


def run():
    codec = load_codec()
    skill_raw = read_bound(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256)
    trace_raw = read_bound(TRACE, 0o664, TRACE_BYTES, TRACE_SHA256)
    require(trace_raw.endswith(b"\n") and b"\r" not in trace_raw, "trace-framing")
    events = [parse(line) for line in trace_raw.splitlines()]
    require(all(set(event) in ({"payload", "type"}, {"payload", "timestamp", "type"}) for event in events), "event-envelope")
    contexts = [event["payload"] for event in events if event["type"] == "turn_context"]
    require(len(contexts) == 1 and (contexts[0]["turn_id"], contexts[0]["model"], contexts[0]["effort"]) == (TURN, "gpt-5.6-luna", "medium"), "turn")
    calls = [event["payload"] for event in events if event["type"] == "response_item" and event["payload"].get("type") == "custom_tool_call"]
    outputs = [event["payload"] for event in events if event["type"] == "response_item" and event["payload"].get("type") == "custom_tool_call_output"]
    require(len(calls) == len(outputs) == 4 and [item["call_id"] for item in calls] == [item["call_id"] for item in outputs], "tool-pairs")
    decoded = [codec.parse_call(item["input"]) for item in calls]
    expected = [
        {"arguments": {"cmd": "sed -n 1,80p .agents/skills/r9-goal-atom-bootstrap/SKILL.md", "max_output_tokens": 3000, "workdir": "/mnt/Cursor/PuppetMaster", "yield_time_ms": 10000}, "output_mode": "output", "session_tail": False, "tool": "exec_command"},
        {"arguments": {"objective": OBJECTIVE}, "output_mode": "result", "session_tail": False, "tool": "create_goal"},
        {"arguments": {"cmd": "python3 -B wait.py " + THREAD, "max_output_tokens": 128, "workdir": ROW, "yield_time_ms": 30000}, "output_mode": "output", "session_tail": False, "tool": "exec_command"},
        {"arguments": {"status": "complete"}, "output_mode": "result", "session_tail": False, "tool": "update_goal"},
    ]
    require(decoded == expected, "decoded-semantics")
    bodies = [codec.unwrap_output(item["output"]) for item in outputs]
    require(bodies[0].encode("utf-8") == skill_raw, "skill-output")
    goal(bodies[1], "active")
    require(bodies[2] == "FAIL:timeout\n", "waiter-failure")
    terminal_goal = goal(bodies[3], "complete")
    require((terminal_goal["tokensUsed"], terminal_goal["timeUsedSeconds"]) == (1372, 31), "goal-usage")
    completes = [event["payload"] for event in events if event["type"] == "event_msg" and event["payload"].get("type") == "task_complete"]
    require(len(completes) == 1 and completes[0]["turn_id"] == TURN and completes[0]["last_agent_message"] == "FAIL:timeout", "task-complete")
    require(sorted(os.listdir(ROW)) == ["predeclaration.json", "ready.json", "spawn_prompt.txt", "wait.py"], "row-inventory")
    require(not os.path.lexists(ROW + "/subject.stage") and not os.path.lexists(ROW + "/subject.txt"), "subject-absence")
    base = calls[0]["input"]
    mutations = [
        base.rstrip("\n"), base.replace("\n", "\r\n"), base + "x", base.replace("const r", "const s"),
        base.replace("await tools", "tools"), base.replace("exec_command", "get_goal"), base.replace("text(r.output)", "text(r)"),
        base.replace("yield_time_ms:10000", "yield_time_ms:1.0"), base.replace("max_output_tokens:3000", "max_output_tokens:[3000]"),
        base.replace("cmd:", "cmd:\"x\",cmd:"), base.replace("workdir:", "unknown:1,workdir:"), base.replace(",workdir", "workdir"),
        base.replace("});", "})"), base.replace("text(r.output);", "text(r.output); other();"),
        base.replace("tools.exec_command(", "tools.exec_command({x:1},"), base.replace("{cmd:", "{{cmd:"),
        base.replace("max_output_tokens:3000", "max_output_tokens:true"), base.replace("yield_time_ms:10000", "yield_time_ms:null"),
    ]
    rejected = sum(reject(codec, text, "m{:02d}".format(index), expected[0]) for index, text in enumerate(mutations))
    canonical_variant = 'const r = await tools.exec_command({"cmd":"sed -n 1,80p .agents/skills/r9-goal-atom-bootstrap/SKILL.md","max_output_tokens":3000,"workdir":"/mnt/Cursor/PuppetMaster","yield_time_ms":10000}); text(r.output); if (r.session_id) text(JSON.stringify(r));\n'
    variant = codec.parse_call(canonical_variant)
    require(variant["arguments"] == expected[0]["arguments"] and variant["session_tail"] is True, "semantic-variant")
    return {"assertion_count": 57, "decoded_call_count": len(decoded), "first_mismatch": None, "mutation_count": rejected, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-observed-native-envelope-check-v10", "status": "PASS_OBSERVED_NATIVE_ENVELOPE_SEMANTIC_DECODER_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "trace_bytes": len(trace_raw), "trace_sha256": sha(trace_raw), "workspace_writes": 0}


def main():
    try:
        require(sys.argv == [sys.argv[0], "--check"], "cli")
        sys.stdout.buffer.write(compact(run()) + b"\n")
        return 0
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(compact({"first_mismatch": str(error), "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-observed-native-envelope-check-v10", "status": "FAIL", "subject_calls": 0, "workspace_writes": 0}) + b"\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
