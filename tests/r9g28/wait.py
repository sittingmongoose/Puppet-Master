#!/usr/bin/env python3
import glob
import hashlib
import importlib.util
import json
import math
import os
import re
import stat
import sys
import time

sys.dont_write_bytecode = True
ROOT = "/mnt/Cursor/PuppetMaster/tests/r9g28/r"
ARCH = "80bef45872b6d7af37483115f724a618217b2931e72479f6527bf600bd129ac1"
CHECKER = "/mnt/Cursor/PuppetMaster/tests/r9g28/check_projection_recipe.py"
CHECKER_BYTES = 14533
CHECKER_SHA256 = "2e17c8c83faa7c6ef30c51cd800676d7988732f38104985572c389a087725ad1"
DECODER = "/mnt/Cursor/PuppetMaster/tests/r9g26/goal_receipt_decoder.py"
DECODER_BYTES = 9353
DECODER_SHA256 = "4dfd11ca9bf9428daa0f42447e74d09deb3005026426f4a1e286e0552356d8a8"
RECIPE = "/mnt/Cursor/PuppetMaster/tests/r9g28/projection_recipe.json"
RECIPE_BYTES = 7423
RECIPE_SHA256 = "2f5d5c013644047361ba2f7905d636df6610c4063bdbf6b22d3516e53112b109"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
ROUTES = (("gpt-5.4-mini", "xhigh"), ("gpt-5.4-mini", "medium"), ("gpt-5.6-luna", "medium"))
SESSION_GLOB = "/home/sittingmongoose/.codex/sessions/*/*/*/*-{}.jsonl"
PRE = {"architecture_sha256", "atom_id", "bootstrap_skill_sha256", "checker_sha256", "decoder_bytes", "decoder_sha256", "goal_objective", "model_requested", "parent_thread_id", "reasoning_effort_requested", "recipe_sha256", "review_nonce", "schema_id", "subject_bytes", "subject_sha256", "task_path", "waiter_bytes", "waiter_sha256"}
ATOM = re.compile(r"^P(?:0[1-9]|1[0-8])$")
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
    value = json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid("nonfinite:" + item)))
    require(finite(value), "finite")
    return value


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def metadata(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def read_path(path, mode, size, digest):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode), "kind:" + path)
    require(stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size == size, "custody:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require(metadata(os.fstat(fd)) == metadata(before), "race:" + path)
        raw = b""
        while len(raw) < size:
            part = os.read(fd, size - len(raw))
            require(bool(part), "short:" + path)
            raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
    finally:
        os.close(fd)
    require(metadata(os.lstat(path)) == metadata(before) and sha(raw) == digest, "drift:" + path)
    return raw


def read_file(dirfd, name, mode, cap):
    before = os.stat(name, dir_fd=dirfd, follow_symlinks=False)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size <= cap, "file:" + name)
    fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC, dir_fd=dirfd)
    try:
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw))
            require(bool(part), "short:" + name)
            raw += part
        require(os.read(fd, 1) == b"", "trailing:" + name)
    finally:
        os.close(fd)
    require(metadata(os.stat(name, dir_fd=dirfd, follow_symlinks=False)) == metadata(before), "drift:" + name)
    return raw


def absent(dirfd, name):
    try:
        os.stat(name, dir_fd=dirfd, follow_symlinks=False)
    except FileNotFoundError:
        return True
    return False


def write_all(fd, raw):
    view = memoryview(raw)
    while view:
        count = os.write(fd, view)
        require(count > 0, "write")
        view = view[count:]


def publish(dirfd, name, raw):
    fd = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o444, dir_fd=dirfd)
    try:
        os.fchmod(fd, 0o444)
        write_all(fd, raw)
        os.fsync(fd)
    finally:
        os.close(fd)
    os.fsync(dirfd)
    require(read_file(dirfd, name, 0o444, max(4096, len(raw))) == raw, "publish:" + name)


def load_decoder():
    read_path(DECODER, 0o644, DECODER_BYTES, DECODER_SHA256)
    spec = importlib.util.spec_from_file_location("r9g28_wait_decoder", DECODER)
    require(spec is not None and spec.loader is not None, "decoder-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    require(module.__all__ == ("Invalid", "decode_events", "validate_active", "validate_terminal"), "decoder-api")
    return module


def read_trace(thread):
    paths = glob.glob(SESSION_GLOB.format(thread))
    require(len(paths) == 1 and os.path.basename(paths[0]).endswith("-" + thread + ".jsonl"), "trace-path")
    path = paths[0]
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode) and stat.S_IMODE(before.st_mode) == 0o664 and before.st_uid == os.getuid() and before.st_nlink == 1 and 1 <= before.st_size <= 600000, "trace-custody")
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        current = os.fstat(fd)
        require((current.st_dev, current.st_ino) == (before.st_dev, before.st_ino), "trace-race")
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw))
            require(bool(part), "trace-short")
            raw += part
        after = os.fstat(fd)
        require((after.st_dev, after.st_ino) == (before.st_dev, before.st_ino) and after.st_size >= before.st_size, "trace-inode")
    finally:
        os.close(fd)
    return path, raw


def subject(atom):
    raw = canonical({"id": atom["id"], "l": atom["left"], "op": atom["op"], "q": "Return TRUE iff relation holds.", "r": atom["right"], "v": 22, "z": "TRUE or FALSE"})
    require(len(raw) <= 512 and raw.count(b"\n") == 1 and b"\r" not in raw, "subject-limit")
    return raw


def main(argv):
    require(len(argv) == 2 and UUID.fullmatch(argv[1] or ""), "argv")
    cwd = os.getcwd()
    info = os.lstat(cwd)
    require(os.path.realpath(cwd) == cwd and cwd.startswith(ROOT + "/") and stat.S_ISDIR(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "cwd")
    decoder = load_decoder()
    dirfd = os.open(".", os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        pre_raw = read_file(dirfd, "predeclaration.json", 0o444, 8192)
        pre = parse(pre_raw)
        require(isinstance(pre, dict) and set(pre) == PRE and canonical(pre) == pre_raw, "pre")
        require(pre["schema_id"] == "pw-r9-codex-native-goal-fact-level-binary-projection-predeclaration-v22" and ATOM.fullmatch(pre["atom_id"] or "") and HEX.fullmatch(pre["review_nonce"] or ""), "pre-schema")
        require((pre["architecture_sha256"], pre["checker_sha256"], pre["decoder_bytes"], pre["decoder_sha256"], pre["bootstrap_skill_sha256"], pre["recipe_sha256"], pre["parent_thread_id"]) == (ARCH, CHECKER_SHA256, DECODER_BYTES, DECODER_SHA256, SKILL_SHA256, RECIPE_SHA256, PARENT), "pre-bindings")
        expected_route = ROUTES[(int(pre["atom_id"][1:]) - 1) % len(ROUTES)]
        require((pre["model_requested"], pre["reasoning_effort_requested"]) == expected_route, "pre-route")
        require(pre["goal_objective"] == "CG22P|a={}|x={}|once".format(pre["atom_id"], pre["review_nonce"]) and pre["task_path"] == "/root/r9_cg22p_" + pre["review_nonce"], "pre-control")
        require(cwd == ROOT + "/" + pre["atom_id"] + "/" + pre["review_nonce"] and absent(dirfd, "active.json") and absent(dirfd, "active_trace.jsonl") and absent(dirfd, "subject.txt"), "row")
        waiter = read_file(dirfd, "wait.py", 0o444, 512)
        require((len(waiter), sha(waiter)) == (pre["waiter_bytes"], pre["waiter_sha256"]), "waiter")
        skill = read_path(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256)
        read_path(CHECKER, 0o644, CHECKER_BYTES, CHECKER_SHA256)
        packet = read_file(dirfd, "subject.packet", 0o444, 512)
        recipe_raw = read_path(RECIPE, 0o644, RECIPE_BYTES, RECIPE_SHA256)
        recipe = parse(recipe_raw)
        require(recipe_raw == canonical(recipe) and recipe.get("schema_id") == "pw-r9-codex-native-goal-fact-level-binary-projection-recipe-v22", "recipe")
        atom = next((item for item in recipe.get("atoms", []) if item.get("id") == pre["atom_id"]), None)
        require(atom is not None, "atom")
        expected = subject(atom)
        require(packet == expected and (len(packet), sha(packet)) == (pre["subject_bytes"], pre["subject_sha256"]), "packet")
        control = {"effort": pre["reasoning_effort_requested"], "model": pre["model_requested"], "objective": pre["goal_objective"], "parent_thread_id": PARENT, "skill_alias_path": "/home/sittingmongoose/.codex/skills/.system/r9-goal-atom-bootstrap/SKILL.md", "skill_path": SKILL, "task_path": pre["task_path"], "thread_id": argv[1], "wait_arguments": {"cmd": "python3 -B wait.py " + argv[1], "max_output_tokens": 128, "workdir": cwd, "yield_time_ms": 30000}}
        deadline = time.monotonic() + 8.0
        while True:
            try:
                trace_path, trace_raw = read_trace(argv[1])
                proof = decoder.validate_active(trace_raw, control, packet, skill)
                break
            except (decoder.Invalid, Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError):
                if time.monotonic() >= deadline:
                    raise
                time.sleep(0.02)
        require(proof["profile"] == "GOAL_RECEIPT_ONLY_BROKER_V1", "profile")
        publish(dirfd, "active_trace.jsonl", trace_raw)
        active = {"atom_id": pre["atom_id"], "goal_thread_id": argv[1], "profile": proof["profile"], "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-fact-level-binary-projection-active-v22", "status": "ACTIVE_ATTESTED_SUBJECT_RELEASED_ZERO_CREDIT", "task_path": proof["session"]["agent_path"], "trace": {"bytes": len(trace_raw), "path": trace_path, "sha256": sha(trace_raw)}, "turn_id": proof["turn_id"]}
        publish(dirfd, "active.json", canonical(active))
        publish(dirfd, "subject.txt", packet)
        write_all(1, packet)
        return 0
    finally:
        os.close(dirfd)


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError) as error:
        os.write(2, ("FAIL:" + str(error) + "\n").encode("utf-8"))
        raise SystemExit(1)
