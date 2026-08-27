#!/usr/bin/env python3
import hashlib
import importlib.util
import os
import re
import shlex
import stat
import sys
import time

sys.dont_write_bytecode = True
ROOT = "/mnt/Cursor/PuppetMaster/tests/r9g21/r"
LEGACY = "/mnt/Cursor/PuppetMaster/tests/r9g20/wait.py"
LEGACY_BYTES = 17141
LEGACY_SHA256 = "29731691b6043edb9f5a51ce1352d7538f22cb94092add15d1b6679df91c7d71"
ARCH = "f86ad6d2bc5c1616be9207ea653c1846d935b2b3890fe5764aab53ca39eab142"
SKILL_PATH = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
MODEL = "gpt-5.6-luna"
EFFORT = "medium"
PRE = {"architecture_sha256", "atom_id", "bootstrap_skill_sha256", "goal_objective", "model_requested", "native_envelope_bytes", "native_envelope_sha256", "parent_thread_id", "reasoning_effort_requested", "review_nonce", "schema_id", "subject_bytes", "subject_sha256", "task_path", "waiter_bytes", "waiter_sha256"}
HEX = re.compile(r"^[0-9a-f]{64}$")
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def load_legacy():
    raw = open(LEGACY, "rb").read()
    require((len(raw), sha(raw), stat.S_IMODE(os.lstat(LEGACY).st_mode)) == (LEGACY_BYTES, LEGACY_SHA256, 0o644), "legacy-custody")
    spec = importlib.util.spec_from_file_location("r9g21_legacy_wait", LEGACY)
    require(spec is not None and spec.loader is not None, "legacy-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def semantic_skill_pair(legacy, codec, call, output, skill):
    require(call.get("call_id") == output.get("call_id") and call.get("name") == "exec" and call.get("type") == "custom_tool_call" and output.get("type") == "custom_tool_call_output", "pair:skill")
    decoded = codec.parse_call(call.get("input"))
    require(decoded["tool"] == "exec_command", "semantics:skill-tool")
    arguments = decoded["arguments"]
    require(set(arguments) in ({"cmd", "max_output_tokens", "workdir", "yield_time_ms"}, {"cmd", "login", "max_output_tokens", "workdir", "yield_time_ms"}), "semantics:skill-fields")
    require(arguments.get("login", False) is False and arguments["workdir"] == "/mnt/Cursor/PuppetMaster", "semantics:skill-context")
    require(isinstance(arguments["yield_time_ms"], int) and 250 <= arguments["yield_time_ms"] <= 30000 and isinstance(arguments["max_output_tokens"], int) and 1000 <= arguments["max_output_tokens"] <= 10000, "semantics:skill-bounds")
    try:
        words = shlex.split(arguments["cmd"], posix=True)
    except ValueError as error:
        raise Invalid("semantics:skill-shell") from error
    require(len(words) == 4 and words[:2] == ["sed", "-n"], "semantics:skill-program")
    match = re.fullmatch(r"1,([1-9][0-9]{0,3})p", words[2])
    require(match is not None and int(match.group(1)) >= skill.count(b"\n"), "semantics:skill-range")
    path = words[3] if os.path.isabs(words[3]) else os.path.join(arguments["workdir"], words[3])
    require(os.path.realpath(path) == SKILL_PATH, "semantics:skill-path")
    return codec.unwrap_output(output.get("output"))


def main(argv):
    require(len(argv) == 2 and UUID.fullmatch(argv[1] or ""), "argv")
    cwd = os.getcwd()
    require(os.path.realpath(cwd) == cwd and cwd.startswith(ROOT + "/"), "cwd")
    info = os.lstat(cwd)
    require(stat.S_ISDIR(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "cwd-custody")
    legacy = load_legacy()
    legacy.ROOT = ROOT
    legacy.ARCH = ARCH
    legacy.PARENT = PARENT
    legacy.MODEL = MODEL
    legacy.EFFORT = EFFORT
    legacy.SKILL_PATH = SKILL_PATH
    legacy.skill_pair = lambda codec, call, output, skill: semantic_skill_pair(legacy, codec, call, output, skill)
    dirfd = os.open(".", os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        pre_raw = legacy.read_file(dirfd, "predeclaration.json", 0o444, 8192)
        pre = legacy.parse(pre_raw)
        require(isinstance(pre, dict) and set(pre) == PRE and legacy.canonical(pre) == pre_raw, "predeclaration")
        require(pre["schema_id"] == "pw-r9-codex-native-goal-semantic-boundary-capability-predeclaration-v14", "pre-schema")
        require(pre["atom_id"] == "CAP01" and HEX.fullmatch(pre["review_nonce"] or ""), "pre-address")
        require((pre["architecture_sha256"], pre["bootstrap_skill_sha256"], pre["parent_thread_id"]) == (ARCH, SKILL_SHA256, PARENT), "pre-bindings")
        require((pre["model_requested"], pre["reasoning_effort_requested"]) == (MODEL, EFFORT), "pre-route")
        require(pre["goal_objective"] == "CG14CAP|x={}|once".format(pre["review_nonce"]) and pre["task_path"] == "/root/r9_cg14cap_" + pre["review_nonce"], "pre-control")
        require(cwd == ROOT + "/CAP01/" + pre["review_nonce"], "row-address")
        require(legacy.absent(dirfd, "active_trace.jsonl") and legacy.absent(dirfd, "active.json") and legacy.absent(dirfd, "subject.txt"), "row-state")
        waiter = legacy.read_file(dirfd, "wait.py", 0o444, 32768)
        require((len(waiter), sha(waiter)) == (pre["waiter_bytes"], pre["waiter_sha256"]), "waiter")
        skill = legacy.read_path(SKILL_PATH, 0o644, SKILL_BYTES, SKILL_SHA256)
        codec = legacy.load_codec(pre)
        packet = legacy.read_file(dirfd, "subject.packet", 0o444, 256)
        value = legacy.parse(packet[:-1])
        require(packet.endswith(b"\n") and packet.count(b"\n") == 1 and set(value) == {"c", "p", "q", "r", "v", "z"}, "subject-shape")
        require(value == {"c": "one capability token", "p": {"atom": "CAP01", "src": ARCH}, "q": "Return OK", "r": "TOKEN", "v": 4, "z": "PASS or FAIL_CAPABILITY"}, "subject-value")
        require((len(packet), sha(packet)) == (pre["subject_bytes"], pre["subject_sha256"]), "subject-identity")
        deadline = time.monotonic() + 8.0
        while True:
            try:
                trace_path, trace_raw = legacy.read_trace(argv[1])
                proof = legacy.validate_active(trace_raw, argv[1], pre, packet, skill, codec, cwd)
                break
            except (legacy.Invalid, Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError):
                if time.monotonic() >= deadline:
                    raise
                time.sleep(0.02)
        legacy.publish_raw(dirfd, "active_trace.jsonl", trace_raw)
        legacy.publish_json(dirfd, "active.json", {"atom_id": "CAP01", "goal_thread_id": argv[1], "profile": "SEMANTIC_SKILL_PATH_NORMALIZED_SELF_ATTESTED_V14", "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-semantic-boundary-capability-active-v14", "status": "ACTIVE_ATTESTED_SUBJECT_RELEASED_ZERO_CREDIT", "task_path": proof["task_path"], "trace": {"bytes": len(trace_raw), "path": trace_path, "sha256": sha(trace_raw)}, "turn_id": proof["turn_id"]})
        legacy.publish_raw(dirfd, "subject.txt", packet)
        legacy.write_all(1, packet)
        return 0
    finally:
        os.close(dirfd)


def entry():
    try:
        return main(sys.argv)
    except (Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError) as error:
        os.write(2, ("FAIL:" + str(error) + "\n").encode("utf-8", "strict"))
        return 1


if __name__ == "__main__":
    raise SystemExit(entry())
