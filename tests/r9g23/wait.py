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
ROOT = "/mnt/Cursor/PuppetMaster/tests/r9g23/r"
LEGACY = "/mnt/Cursor/PuppetMaster/tests/r9g20/wait.py"
LEGACY_BYTES = 17141
LEGACY_SHA256 = "29731691b6043edb9f5a51ce1352d7538f22cb94092add15d1b6679df91c7d71"
ARCH = "e2b0e0fe1863dc15025d1e10fee98e133646c96dda4f9c0dca43744931441f75"
RECIPE_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g23/review_recipe.json"
RECIPE_BYTES = 8282
RECIPE_SHA256 = "6fab5fa043ee7233f35842dcd7579fb853000e3677e57849ec5f20e61ef4f78d"
SKILL_PATH = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
MODEL = "gpt-5.6-luna"
EFFORT = "medium"
ROW_WAITER_BYTES = 121
ROW_WAITER_SHA256 = "90fe00d841d620f97e5c642862fa51df3912d01edff960890f2bdab205dedea2"
PRE = {"architecture_sha256", "atom_id", "bootstrap_skill_sha256", "goal_objective", "model_requested", "native_envelope_bytes", "native_envelope_sha256", "parent_thread_id", "reasoning_effort_requested", "recipe_sha256", "review_nonce", "schema_id", "subject_bytes", "subject_sha256", "task_path", "waiter_bytes", "waiter_sha256"}
HEX = re.compile(r"^[0-9a-f]{64}$")
ATOM = re.compile(r"^A(?:0[1-9]|1[0-8])$")
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def load_legacy():
    before = os.lstat(LEGACY)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode) and stat.S_IMODE(before.st_mode) == 0o644 and before.st_size == LEGACY_BYTES, "legacy-custody")
    fd = os.open(LEGACY, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        raw = os.read(fd, LEGACY_BYTES + 1)
    finally:
        os.close(fd)
    require(len(raw) == LEGACY_BYTES and sha(raw) == LEGACY_SHA256, "legacy-identity")
    spec = importlib.util.spec_from_file_location("r9g23_legacy_wait", LEGACY)
    require(spec is not None and spec.loader is not None, "legacy-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def safe_skill_pair(codec, call, output, skill):
    require(call.get("call_id") == output.get("call_id") and call.get("name") == "exec" and call.get("type") == "custom_tool_call" and output.get("type") == "custom_tool_call_output", "pair:skill")
    decoded = codec.parse_call(call.get("input"))
    require(decoded["tool"] == "exec_command", "semantics:skill-tool")
    arguments = decoded["arguments"]
    allowed = {"cmd", "login", "max_output_tokens", "workdir", "yield_time_ms"}
    require(isinstance(arguments, dict) and {"cmd", "workdir"} <= set(arguments) <= allowed, "semantics:skill-fields")
    require(arguments.get("login", False) is False and arguments["workdir"] == "/mnt/Cursor/PuppetMaster", "semantics:skill-context")
    require("yield_time_ms" not in arguments or isinstance(arguments["yield_time_ms"], int), "semantics:skill-yield-type")
    require("max_output_tokens" not in arguments or isinstance(arguments["max_output_tokens"], int), "semantics:skill-output-type")
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


def load_recipe(legacy):
    raw = legacy.read_path(RECIPE_PATH, 0o644, RECIPE_BYTES, RECIPE_SHA256)
    value = legacy.parse(raw)
    require(raw == legacy.canonical(value), "recipe-canonical")
    require(value.get("schema_id") == "pw-r9-codex-native-goal-current-contract-atomic-review-recipe-v17" and len(value.get("atoms", [])) == 18, "recipe-schema")
    return value


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
    legacy.skill_pair = lambda codec, call, output, skill: safe_skill_pair(codec, call, output, skill)
    recipe = load_recipe(legacy)
    dirfd = os.open(".", os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        pre_raw = legacy.read_file(dirfd, "predeclaration.json", 0o444, 8192)
        pre = legacy.parse(pre_raw)
        require(isinstance(pre, dict) and set(pre) == PRE and legacy.canonical(pre) == pre_raw, "predeclaration")
        require(pre["schema_id"] == "pw-r9-codex-native-goal-current-contract-atomic-review-predeclaration-v17", "pre-schema")
        require(ATOM.fullmatch(pre["atom_id"] or "") and HEX.fullmatch(pre["review_nonce"] or ""), "pre-address")
        require((pre["architecture_sha256"], pre["recipe_sha256"], pre["bootstrap_skill_sha256"], pre["parent_thread_id"]) == (ARCH, RECIPE_SHA256, SKILL_SHA256, PARENT), "pre-bindings")
        require((pre["model_requested"], pre["reasoning_effort_requested"]) == (MODEL, EFFORT), "pre-route")
        require(pre["goal_objective"] == "CG17R|a={}|x={}|once".format(pre["atom_id"], pre["review_nonce"]) and pre["task_path"] == "/root/r9_cg17r_" + pre["review_nonce"], "pre-control")
        require(cwd == ROOT + "/" + pre["atom_id"] + "/" + pre["review_nonce"], "row-address")
        require(legacy.absent(dirfd, "active_trace.jsonl") and legacy.absent(dirfd, "active.json") and legacy.absent(dirfd, "subject.txt"), "row-state")
        waiter = legacy.read_file(dirfd, "wait.py", 0o444, 512)
        require((len(waiter), sha(waiter), pre["waiter_bytes"], pre["waiter_sha256"]) == (ROW_WAITER_BYTES, ROW_WAITER_SHA256, ROW_WAITER_BYTES, ROW_WAITER_SHA256), "waiter")
        skill = legacy.read_path(SKILL_PATH, 0o644, SKILL_BYTES, SKILL_SHA256)
        codec = legacy.load_codec(pre)
        packet = legacy.read_file(dirfd, "subject.packet", 0o444, 512)
        value = legacy.validate_subject(packet, pre)
        atom = next((item for item in recipe["atoms"] if item["id"] == pre["atom_id"]), None)
        require(atom is not None, "atom-missing")
        expected = {"c": atom["evidence"], "p": {"atom": atom["id"], "src": ARCH}, "q": atom["question"], "r": "TOKEN", "v": 4, "z": "PASS or " + atom["fail_token"]}
        require(value == expected and packet == legacy.canonical(expected), "subject-value")
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
        legacy.publish_json(dirfd, "active.json", {"atom_id": pre["atom_id"], "goal_thread_id": argv[1], "profile": "SAFE_SKILL_CURRENT_CONTRACT_SELF_ATTESTED_V17", "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-current-contract-atomic-review-active-v17", "status": "ACTIVE_ATTESTED_SUBJECT_RELEASED_ZERO_CREDIT", "task_path": proof["task_path"], "trace": {"bytes": len(trace_raw), "path": trace_path, "sha256": sha(trace_raw)}, "turn_id": proof["turn_id"]})
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
