#!/usr/bin/env python3
import hashlib
import importlib.util
import json
import os
import stat
import sys

sys.dont_write_bytecode = True
DECODER = "/mnt/Cursor/PuppetMaster/tests/r9g26/goal_receipt_decoder.py"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
ALIAS = "/home/sittingmongoose/.codex/skills/.system/r9-goal-atom-bootstrap/SKILL.md"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
CASES = [
    {"effort": "xhigh", "model": "gpt-5.4-mini", "objective": "CG18CAP|x=fa8b9cc584eaf341ea5249a41e02c86d6df3479daec930ea68ddce1141203a69|once", "packet": b'{"c":"one direct profile token","p":{"atom":"CAP03","src":"731721fb39baea167483fe0bc675fdeebf1b149550dbb807644ee967cb62e192"},"q":"Return OK","r":"TOKEN","v":5,"z":"OK or FAIL_DIRECT_PROFILE"}\n', "task": "/root/r9_cg18cap_fa8b9cc584eaf341ea5249a41e02c86d6df3479daec930ea68ddce1141203a69", "thread": "01a03296-7902-7222-8e43-18a8f7401f8e", "trace": "/home/sittingmongoose/.codex/sessions/2026/08/24/rollout-2026-08-24T07-05-17-01a03296-7902-7222-8e43-18a8f7401f8e.jsonl", "trace_bytes": 136685, "trace_sha256": "05029243a494be4d03c2eb3a9d65a57282d3301ae332b398a18ef0715a1a3454", "workdir": "/mnt/Cursor/PuppetMaster/tests/r9g24/r/CAP03/fa8b9cc584eaf341ea5249a41e02c86d6df3479daec930ea68ddce1141203a69"},
    {"effort": "xhigh", "model": "gpt-5.4-mini", "objective": "CG19CAP|x=b2607e8f46f9cf0b33ad50d1e9389cfeb73dc086a35fab87c920d8df2391b20e|once", "packet": b'{"c":"one direct profile token","p":{"atom":"CAP04","src":"1a57b97d4ce4a60ed7afb546e89c0566a5f8f36322af171fc8273a90709388c9"},"q":"Return OK","r":"TOKEN","v":5,"z":"OK or FAIL_DIRECT_PROFILE"}\n', "task": "/root/r9_cg19cap_b2607e8f46f9cf0b33ad50d1e9389cfeb73dc086a35fab87c920d8df2391b20e", "thread": "01a032a0-64e0-76e1-bed3-d59a84de83fc", "trace": "/home/sittingmongoose/.codex/sessions/2026/08/24/rollout-2026-08-24T07-16-07-01a032a0-64e0-76e1-bed3-d59a84de83fc.jsonl", "trace_bytes": 141487, "trace_sha256": "30f28609b0f0d4bdf1dddcbad825fc631fb7f511d75f33e203a4795649e7f62e", "workdir": "/mnt/Cursor/PuppetMaster/tests/r9g25/r/CAP04/b2607e8f46f9cf0b33ad50d1e9389cfeb73dc086a35fab87c920d8df2391b20e"},
]


class CheckFailed(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise CheckFailed(mismatch)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def read(path, mode, size, digest):
    info = os.lstat(path)
    require(stat.S_ISREG(info.st_mode) and not stat.S_ISLNK(info.st_mode) and stat.S_IMODE(info.st_mode) == mode and info.st_uid == os.getuid() and info.st_nlink == 1 and info.st_size == size, "custody:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        raw = b""
        while len(raw) < size:
            part = os.read(fd, size - len(raw)); require(bool(part), "short:" + path); raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
    finally:
        os.close(fd)
    require(sha(raw) == digest, "hash:" + path)
    return raw


def load():
    spec = importlib.util.spec_from_file_location("r9g26_check_decoder", DECODER)
    require(spec is not None and spec.loader is not None, "decoder-spec")
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    require(module.__all__ == ("Invalid", "decode_events", "validate_active", "validate_terminal"), "decoder-api")
    return module


def control(case):
    return {"effort": case["effort"], "model": case["model"], "objective": case["objective"], "parent_thread_id": PARENT, "skill_alias_path": ALIAS, "skill_path": SKILL, "task_path": case["task"], "thread_id": case["thread"], "wait_arguments": {"cmd": "python3 -B wait.py " + case["thread"], "max_output_tokens": 128, "workdir": case["workdir"], "yield_time_ms": 30000}}


def active_prefix(raw):
    lines = raw.splitlines(keepends=True); create = False
    for index, line in enumerate(lines):
        event = json.loads(line)
        payload = event.get("payload", {})
        if event.get("type") == "response_item" and payload.get("type") == "function_call":
            if payload.get("name") == "create_goal":
                create = True
            elif create and payload.get("name") == "exec_command":
                return b"".join(lines[:index + 1]), payload["call_id"]
    raise CheckFailed("broker-call")


def synthetic_terminal(raw, broker_id, packet):
    output = []
    for line in raw.splitlines(keepends=True):
        event = json.loads(line)
        payload = event.get("payload", {})
        changed = False
        if event.get("type") == "response_item" and payload.get("type") == "function_call_output" and payload.get("call_id") == broker_id:
            payload["output"] = "Chunk ID: abc123\nWall time: 0.1 seconds\nProcess exited with code 0\nOriginal token count: 1\nOutput:\n" + packet.decode("utf-8")
            changed = True
        elif event.get("type") == "response_item" and payload.get("type") == "message" and payload.get("phase") == "final_answer":
            payload["content"][0]["text"] = "OK"; changed = True
        elif event.get("type") == "event_msg" and payload.get("type") == "task_complete":
            payload["last_agent_message"] = "OK"; changed = True
        output.append(json.dumps(event, sort_keys=True, separators=(",", ":")).encode() + b"\n" if changed else line)
    return b"".join(output)


def mutate_call(raw, broker_id, change):
    output = []
    for line in raw.splitlines(keepends=True):
        event = json.loads(line); payload = event.get("payload", {})
        if event.get("type") == "response_item" and payload.get("type") == "function_call" and payload.get("call_id") == broker_id:
            arguments = json.loads(payload["arguments"]); change(arguments); payload["arguments"] = json.dumps(arguments, sort_keys=True, separators=(",", ":")); line = json.dumps(event, sort_keys=True, separators=(",", ":")).encode() + b"\n"
        output.append(line)
    return b"".join(output)


def rejected(call):
    try:
        call()
    except (ValueError, CheckFailed, KeyError, TypeError):
        return 1
    raise CheckFailed("mutation-accepted")


def main(argv):
    require(argv == [argv[0], "--check"], "argv")
    decoder = load(); skill = read(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256)
    mutations = 0; profiles = []
    for case in CASES:
        raw = read(case["trace"], 0o664, case["trace_bytes"], case["trace_sha256"])
        active, broker_id = active_prefix(raw); ctl = control(case)
        proof = decoder.validate_active(active, ctl, case["packet"], skill)
        require(proof["profile"] == "GOAL_RECEIPT_ONLY_BROKER_V1" and proof["thread_id"] == case["thread"], "active-proof")
        terminal = synthetic_terminal(raw, broker_id, case["packet"])
        result = decoder.validate_terminal(terminal, active, ctl, case["packet"], skill, {"OK"})
        require(result["result"] == "OK" and result["profile"] == "GOAL_RECEIPT_ONLY_BROKER_V1", "terminal-proof")
        profiles.append({"control_reads": proof["control_reads"], "trace_sha256": case["trace_sha256"]})
        bad = [
            lambda value: value.__setitem__("login", "false"),
            lambda value: value.__setitem__("tty", True),
            lambda value: value.__setitem__("unknown", False),
            lambda value: value.__setitem__("cmd", "python3 -B wait.py wrong"),
            lambda value: value.pop("max_output_tokens"),
        ]
        mutations += sum(rejected(lambda change=change: decoder.validate_active(mutate_call(active, broker_id, change), ctl, case["packet"], skill)) for change in bad)
        mutations += rejected(lambda: decoder.validate_terminal(raw, active, ctl, case["packet"], skill, {"OK"}))
    result = {"assertion_count": 22, "first_mismatch": None, "mutation_count": mutations, "observed_active_profiles": profiles, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-receipt-only-broker-check-v20", "status": "PASS_DATA_ONLY_ZERO_CREDIT", "workspace_writes": 0}
    os.write(1, json.dumps(result, sort_keys=True, separators=(",", ":")).encode() + b"\n")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (CheckFailed, OSError, UnicodeError, ValueError, KeyError, TypeError) as error:
        os.write(1, json.dumps({"first_mismatch": str(error), "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-receipt-only-broker-check-v20", "status": "FAIL", "workspace_writes": 0}, sort_keys=True, separators=(",", ":")).encode() + b"\n")
        raise SystemExit(1)
