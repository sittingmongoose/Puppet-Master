#!/usr/bin/env python3
import copy
import hashlib
import importlib.util
import json
import os
import stat
import sys

sys.dont_write_bytecode = True
DECODER_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g25/profile_decoder.py"
BASE_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g24/profile_decoder.py"
BASE_BYTES = 14662
BASE_SHA256 = "d0b112bd6b36061204aa79a505df40a48dfa8b63f69756251c2500ea7893e15c"
TRACE_PATH = "/home/sittingmongoose/.codex/sessions/2026/08/24/rollout-2026-08-24T07-05-17-01a03296-7902-7222-8e43-18a8f7401f8e.jsonl"
TRACE_BYTES = 136685
TRACE_SHA256 = "05029243a494be4d03c2eb3a9d65a57282d3301ae332b398a18ef0715a1a3454"
SKILL_PATH = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
THREAD = "01a03296-7902-7222-8e43-18a8f7401f8e"
OBJECTIVE = "CG18CAP|x=fa8b9cc584eaf341ea5249a41e02c86d6df3479daec930ea68ddce1141203a69|once"
TASK_PATH = "/root/r9_cg18cap_fa8b9cc584eaf341ea5249a41e02c86d6df3479daec930ea68ddce1141203a69"
WORKDIR = "/mnt/Cursor/PuppetMaster/tests/r9g24/r/CAP03/fa8b9cc584eaf341ea5249a41e02c86d6df3479daec930ea68ddce1141203a69"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"


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


def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    require(spec is not None and spec.loader is not None, "spec:" + name)
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    require(module.__all__ == ("Invalid", "decode_events", "profile", "validate_active", "validate_terminal"), "api:" + name)
    return module


def prefix(raw):
    output = b""; count = 0
    for line in raw.splitlines(keepends=True):
        output += line
        event = json.loads(line)
        if event.get("type") == "response_item" and event.get("payload", {}).get("type") == "function_call":
            count += 1
            if count == 3:
                return output
    raise CheckFailed("third-call")


def mutate(raw, change):
    lines = raw.splitlines(keepends=True); count = 0
    for index, line in enumerate(lines):
        event = json.loads(line)
        if event.get("type") == "response_item" and event.get("payload", {}).get("type") == "function_call":
            count += 1
            if count == 3:
                args = json.loads(event["payload"]["arguments"])
                change(args)
                event["payload"]["arguments"] = json.dumps(args, sort_keys=True, separators=(",", ":"))
                lines[index] = json.dumps(event, sort_keys=True, separators=(",", ":")).encode() + b"\n"
                return b"".join(lines)
    raise CheckFailed("mutation-third-call")


def rejected(call):
    try:
        call()
    except (ValueError, CheckFailed, KeyError, TypeError):
        return 1
    raise CheckFailed("accepted-mutation")


def main(argv):
    require(argv == [argv[0], "--check"], "argv")
    trace = read(TRACE_PATH, 0o664, TRACE_BYTES, TRACE_SHA256)
    skill = read(SKILL_PATH, 0o644, SKILL_BYTES, SKILL_SHA256)
    read(BASE_PATH, 0o644, BASE_BYTES, BASE_SHA256)
    decoder_raw = open(DECODER_PATH, "rb").read()
    decoder = load(DECODER_PATH, "r9g25_check_decoder")
    base = load(BASE_PATH, "r9g25_check_base")
    active = prefix(trace)
    packet = b'{"c":"one direct profile token","p":{"atom":"CAP03","src":"731721fb39baea167483fe0bc675fdeebf1b149550dbb807644ee967cb62e192"},"q":"Return OK","r":"TOKEN","v":5,"z":"OK or FAIL_DIRECT_PROFILE"}\n'
    control = {"effort": "xhigh", "model": "gpt-5.4-mini", "objective": OBJECTIVE, "parent_thread_id": PARENT, "skill_path": SKILL_PATH, "task_path": TASK_PATH, "thread_id": THREAD, "wait_arguments": {"cmd": "python3 -B wait.py " + THREAD, "max_output_tokens": 128, "workdir": WORKDIR, "yield_time_ms": 30000}}
    require(rejected(lambda: base.validate_active(active, control, packet, skill)) == 1, "base-must-reject")
    proof = decoder.validate_active(active, control, packet, skill)
    require(proof["profile"] == "DIRECT_FUNCTION_CALL_V1" and proof["wait_argument_profile"] == "REQUIRED_PLUS_OPTIONAL_FALSE_DEFAULTS_V1", "observed-proof")
    variants = [
        lambda value: (value.pop("login"), value.pop("tty")),
        lambda value: value.pop("login"),
        lambda value: value.pop("tty"),
    ]
    for change in variants:
        candidate = mutate(active, change)
        require(decoder.validate_active(candidate, control, packet, skill)["profile"] == "DIRECT_FUNCTION_CALL_V1", "optional-default")
    bad = [
        lambda value: value.__setitem__("login", True),
        lambda value: value.__setitem__("login", 0),
        lambda value: value.__setitem__("tty", True),
        lambda value: value.__setitem__("tty", 0),
        lambda value: value.__setitem__("unknown", False),
        lambda value: value.pop("max_output_tokens"),
        lambda value: value.__setitem__("yield_time_ms", 29999),
        lambda value: value.__setitem__("cmd", "python3 -B wait.py wrong"),
    ]
    mutations = sum(rejected(lambda change=change: decoder.validate_active(mutate(active, change), control, packet, skill)) for change in bad)
    result = {"assertion_count": 16, "base_decoder_sha256": BASE_SHA256, "decoder": {"bytes": len(decoder_raw), "sha256": sha(decoder_raw)}, "first_mismatch": None, "mutation_count": mutations, "observed_failure_trace_sha256": TRACE_SHA256, "observed_profile": proof["profile"], "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-default-normalization-check-v19", "status": "PASS_DATA_ONLY_ZERO_CREDIT", "workspace_writes": 0}
    os.write(1, json.dumps(result, sort_keys=True, separators=(",", ":")).encode() + b"\n")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (CheckFailed, OSError, UnicodeError, ValueError, KeyError, TypeError) as error:
        os.write(1, json.dumps({"first_mismatch": str(error), "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-default-normalization-check-v19", "status": "FAIL", "workspace_writes": 0}, sort_keys=True, separators=(",", ":")).encode() + b"\n")
        raise SystemExit(1)
