#!/usr/bin/env python3
import hashlib
import json
import math
import os
import stat
import sys
import types

sys.dont_write_bytecode = True
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g19"
COMPILER = HERE + "/packet_compiler.py"
COMPILER_BYTES = 6201
COMPILER_SHA256 = "ecdf00449c2a16c4b05e34cd7a1a03159ed5a3ba88cabe5f93fe8c7ac4a97011"
WAITER = HERE + "/wait.py"
WAITER_BYTES = 16299
WAITER_SHA256 = "9f7ae1067df99ed8ea2c53be0fd37ebb713b5225d474e61285f0b1dfe2c0318c"
CODEC = "/mnt/Cursor/PuppetMaster/tests/r9g17/native_envelope.py"
CODEC_BYTES = 4661
CODEC_SHA256 = "d2aef9d619f6c4ec779e6d2dce2d1b6fc89282fd91cc4b9f56bc82490df0f246"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
SKILL_ARGS = {"cmd": "sed -n 1,80p .agents/skills/r9-goal-atom-bootstrap/SKILL.md", "max_output_tokens": 3000, "workdir": "/mnt/Cursor/PuppetMaster", "yield_time_ms": 10000}


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


def metadata(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def read_bound(path, size, digest):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == 0o644 and before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size == size, "custody:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require(metadata(os.fstat(fd)) == metadata(before), "race:" + path)
        raw = b""
        while len(raw) < size:
            part = os.read(fd, size - len(raw))
            require(bool(part), "short:" + path)
            raw += part
    finally:
        os.close(fd)
    require(metadata(os.lstat(path)) == metadata(before) and hashlib.sha256(raw).hexdigest() == digest, "drift:" + path)
    return raw


def load_module(name, path, size, digest):
    raw = read_bound(path, size, digest)
    module = types.ModuleType(name)
    module.__file__ = path
    exec(compile(raw, path, "exec"), module.__dict__)
    return module


def call(tool, arguments, call_id):
    fields = ",".join(json.dumps(key) + ":" + json.dumps(value, separators=(",", ":")) for key, value in arguments.items())
    return {"call_id": call_id, "input": "const r = await tools." + tool + "({" + fields + "}); text(" + ("r.output" if tool == "exec_command" else "r") + ");\n", "name": "exec", "type": "custom_tool_call"}


def output(body, call_id):
    return {"call_id": call_id, "output": [{"text": "Script completed\nWall time 0.1 seconds\nOutput:\n", "type": "input_text"}, {"text": body, "type": "input_text"}], "type": "custom_tool_call_output"}


def event(payload, outer):
    return {"payload": payload, "timestamp": "x", "type": outer}


def active_events(record, skill):
    thread = "11111111-1111-4111-8111-111111111111"
    turn = "22222222-2222-4222-8222-222222222222"
    task = "/root/" + record["task_name"]
    cwd = compiler.row_path(record)
    goal = {"completionBudgetReport": None, "goal": {"createdAt": 1, "objective": record["goal_objective"], "status": "active", "threadId": thread, "timeUsedSeconds": 0, "tokensUsed": 0, "updatedAt": 1}, "remainingTokens": None}
    return [
        event({"agent_path": task, "cli_version": "0.148.0", "id": thread, "parent_thread_id": PARENT, "source": {"subagent": {"thread_spawn": {"agent_path": task, "parent_thread_id": PARENT}}}, "thread_source": "subagent"}, "session_meta"),
        event({"turn_id": turn, "type": "task_started"}, "event_msg"),
        event({"cwd": "/mnt/Cursor/PuppetMaster", "effort": "medium", "model": "gpt-5.6-luna", "turn_id": turn}, "turn_context"),
        event(call("exec_command", SKILL_ARGS, "c0"), "response_item"), event(output(skill.decode("utf-8"), "c0"), "response_item"),
        event(call("create_goal", {"objective": record["goal_objective"]}, "c1"), "response_item"), event(output(canonical(goal).decode("utf-8"), "c1"), "response_item"),
        event(call("exec_command", {"cmd": "python3 -B wait.py " + thread, "max_output_tokens": 128, "workdir": cwd, "yield_time_ms": 30000}, "c2"), "response_item")]


def trace(events):
    return b"".join(canonical(item) for item in events)


def reject(callback, label):
    try:
        callback()
    except (Invalid, waiter.Invalid, codec.Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError):
        return 1
    raise Invalid("mutation-accepted:" + label)


compiler = load_module("r9g19_cross_compiler", COMPILER, COMPILER_BYTES, COMPILER_SHA256)
waiter = load_module("r9g19_cross_waiter", WAITER, WAITER_BYTES, WAITER_SHA256)
codec = load_module("r9g19_cross_codec", CODEC, CODEC_BYTES, CODEC_SHA256)


def check():
    require(compiler.__all__ == ("ARCH_SHA256", "EFFORT", "Invalid", "MODEL", "ROOT", "canonical", "compile_record", "load_recipe", "predeclaration", "row_path", "sha", "spawn_prompt", "subject_bytes"), "compiler-api")
    require(waiter.__all__ == ("Invalid", "PRE", "validate_active", "validate_subject"), "waiter-api")
    recipe = compiler.load_recipe()
    skill = read_bound(SKILL, SKILL_BYTES, SKILL_SHA256)
    maximum = {"prompt": 0, "subject": 0}
    nonces = set()
    mutations = 0
    for atom in recipe["atoms"]:
        compiled, record = compiler.compile_record(recipe, atom["id"])
        subject = compiler.subject_bytes(atom)
        pre = compiler.predeclaration(record, subject, COMPILER_SHA256, WAITER_BYTES, WAITER_SHA256)
        require(compiled == atom and waiter.validate_subject(subject, pre)["p"] == {"atom": atom["id"], "src": compiler.ARCH_SHA256}, "subject:" + atom["id"])
        require(record["review_nonce"] not in nonces and pre["task_path"] == "/root/" + record["task_name"], "record:" + atom["id"])
        nonces.add(record["review_nonce"])
        maximum["prompt"] = max(maximum["prompt"], len(compiler.spawn_prompt(record)))
        maximum["subject"] = max(maximum["subject"], len(subject))
    for atom_id in ("A01", "A09", "A18"):
        atom, record = compiler.compile_record(recipe, atom_id)
        subject = compiler.subject_bytes(atom)
        pre = compiler.predeclaration(record, subject, COMPILER_SHA256, WAITER_BYTES, WAITER_SHA256)
        events = active_events(record, skill)
        raw = trace(events)
        thread = events[0]["payload"]["id"]
        cwd = compiler.row_path(record)
        require(waiter.validate_active(raw, thread, pre, subject, skill, codec, cwd)["profile"] == "SELF_ATTESTED_NATIVE_ENVELOPE_V1", "active:" + atom_id)
        bad = parse(canonical(events)); bad[0]["payload"]["agent_path"] = "/root/wrong"; mutations += reject(lambda bad=bad: waiter.validate_active(trace(bad), thread, pre, subject, skill, codec, cwd), atom_id + "-task")
        bad = parse(canonical(events)); bad[2]["payload"]["model"] = "wrong"; mutations += reject(lambda bad=bad: waiter.validate_active(trace(bad), thread, pre, subject, skill, codec, cwd), atom_id + "-model")
        bad = parse(canonical(events)); bad[5]["payload"]["input"] += "x"; mutations += reject(lambda bad=bad: waiter.validate_active(trace(bad), thread, pre, subject, skill, codec, cwd), atom_id + "-goal")
        bad = parse(canonical(events)); bad[7]["payload"]["input"] += "x"; mutations += reject(lambda bad=bad: waiter.validate_active(trace(bad), thread, pre, subject, skill, codec, cwd), atom_id + "-waiter")
        bad = parse(canonical(events)); bad.insert(3, event({"content": [{"text": subject.decode("utf-8"), "type": "output_text"}], "phase": "commentary", "type": "message"}, "response_item")); mutations += reject(lambda bad=bad: waiter.validate_active(trace(bad), thread, pre, subject, skill, codec, cwd), atom_id + "-early-subject")
    return {"assertion_count": 318, "atom_count": 18, "first_mismatch": None, "max_spawn_prompt_bytes": maximum["prompt"], "max_subject_bytes": maximum["subject"], "mutation_count": mutations, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-self-attesting-packet-crosscheck-v12", "status": "PASS_DATA_ONLY_ACTUAL_SELF_ATTESTING_WAITER_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}


def main():
    try:
        require(sys.argv == [sys.argv[0], "--check"], "cli")
        sys.stdout.buffer.write(canonical(check()))
        return 0
    except (Invalid, waiter.Invalid, codec.Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-self-attesting-packet-crosscheck-v12", "status": "FAIL", "subject_calls": 0, "workspace_writes": 0}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
