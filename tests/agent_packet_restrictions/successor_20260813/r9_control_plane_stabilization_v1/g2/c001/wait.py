#!/usr/bin/env python3
import hashlib
import json
import math
import os
import re
import stat
import sys
import time

sys.dont_write_bytecode = True
ROOT = "/mnt/Cursor/PuppetMaster"
PRE_KEYS = {"atom_id", "atom_nonce", "attempt_id", "case_id", "control_bytes", "control_sha256", "expected_result_bytes", "expected_result_sha256", "fresh_run_id", "goal_objective", "goal_objective_bytes", "goal_objective_sha256", "mailbox_relative_path", "requested_model", "requested_reasoning_effort", "route", "schema_id", "source_cell_bytes", "source_cell_path", "source_cell_sha256", "subject_bytes", "subject_sha256", "task_path", "waiter_bytes", "waiter_sha256"}
READY_KEYS = {"atom_id", "case_id", "fresh_run_id", "goal_thread_id", "phase", "pid", "previous_phase_sha256", "request_sha256", "schema_id", "waiter_sha256"}
THREAD_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


class Invalid(Exception):
    pass


def pairs(items):
    out = {}
    for key, value in items:
        if key in out:
            raise Invalid("duplicate key")
        out[key] = value
    return out


def finite(value):
    if isinstance(value, float) and not math.isfinite(value):
        raise Invalid("nonfinite")
    if isinstance(value, dict):
        return all(finite(key) and finite(item) for key, item in value.items())
    if isinstance(value, list):
        return all(finite(item) for item in value)
    return True


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"), sort_keys=True).encode("utf-8") + b"\n"


def read_exact(dirfd, name, mode, limit):
    before = os.stat(name, dir_fd=dirfd, follow_symlinks=False)
    if not stat.S_ISREG(before.st_mode) or stat.S_IMODE(before.st_mode) != mode or before.st_uid != os.getuid() or before.st_nlink != 1:
        raise Invalid(name + " custody")
    fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC, dir_fd=dirfd)
    try:
        opened = os.fstat(fd)
        if (opened.st_dev, opened.st_ino, opened.st_size) != (before.st_dev, before.st_ino, before.st_size):
            raise Invalid(name + " identity")
        raw = os.read(fd, limit + 1)
        if len(raw) > limit or len(raw) != opened.st_size:
            raise Invalid(name + " size")
    finally:
        os.close(fd)
    after = os.stat(name, dir_fd=dirfd, follow_symlinks=False)
    if (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) != (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns):
        raise Invalid(name + " drift")
    return raw


def absent(dirfd, name):
    try:
        os.stat(name, dir_fd=dirfd, follow_symlinks=False)
    except FileNotFoundError:
        return True
    return False


def decode_canonical(raw, keys, code):
    try:
        value = json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda token: (_ for _ in ()).throw(Invalid(code + " nonfinite")))
    except (UnicodeError, json.JSONDecodeError) as exc:
        raise Invalid(code + " json") from exc
    if not isinstance(value, dict) or set(value) != keys or not finite(value) or canonical(value) != raw:
        raise Invalid(code + " shape")
    return value


def write_ready(dirfd, name, value):
    raw = canonical(value)
    fd = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o444, dir_fd=dirfd)
    try:
        os.fchmod(fd, 0o444)
        view = memoryview(raw)
        while view:
            written = os.write(fd, view)
            if written <= 0:
                raise Invalid("ready write")
            view = view[written:]
        os.fsync(fd)
    finally:
        os.close(fd)
    os.fsync(dirfd)


def validate_pre(pre, pre_raw, waiter):
    if pre["schema_id"] != "pw-r9-codex-native-goal-two-phase-mailbox-predeclaration-v1":
        raise Invalid("schema")
    rel = pre["mailbox_relative_path"]
    if not isinstance(rel, str) or os.path.isabs(rel) or ".." in rel.split("/") or os.path.realpath(os.path.join(ROOT, rel)) != os.path.realpath(os.getcwd()):
        raise Invalid("mailbox")
    if len(waiter) != pre["waiter_bytes"] or hashlib.sha256(waiter).hexdigest() != pre["waiter_sha256"]:
        raise Invalid("waiter")
    if len(pre["goal_objective"].encode("utf-8")) != pre["goal_objective_bytes"] or hashlib.sha256(pre["goal_objective"].encode("utf-8")).hexdigest() != pre["goal_objective_sha256"]:
        raise Invalid("objective")
    if pre["control_bytes"] < 2 or pre["control_bytes"] > 512 or pre["subject_bytes"] < 2 or pre["subject_bytes"] > 512:
        raise Invalid("phase ceiling")
    if hashlib.sha256(pre_raw).hexdigest() == pre["control_sha256"] or hashlib.sha256(pre_raw).hexdigest() == pre["subject_sha256"]:
        raise Invalid("identity collision")


def main():
    if len(sys.argv) != 3 or sys.argv[1] not in ("control", "subject") or not THREAD_RE.fullmatch(sys.argv[2]):
        raise Invalid("argv")
    phase = sys.argv[1]
    thread_id = sys.argv[2]
    dirfd = os.open(".", os.O_RDONLY | os.O_DIRECTORY | os.O_CLOEXEC)
    try:
        pre_raw = read_exact(dirfd, "predeclaration.json", 0o444, 16384)
        pre = decode_canonical(pre_raw, PRE_KEYS, "predeclaration")
        waiter = read_exact(dirfd, "wait.py", 0o644, 32768)
        validate_pre(pre, pre_raw, waiter)
        request_sha = hashlib.sha256(pre_raw).hexdigest()
        if phase == "control":
            for name in ("ready_control.json", "control.stage", "control.txt", "ready_subject.json", "subject.stage", "subject.txt"):
                if not absent(dirfd, name):
                    raise Invalid("control prepublication")
            previous = None
            ready_name = "ready_control.json"
            target_name = "control.txt"
            expected_bytes = pre["control_bytes"]
            expected_sha = pre["control_sha256"]
        else:
            if not absent(dirfd, "control.stage") or not absent(dirfd, "ready_subject.json") or not absent(dirfd, "subject.stage") or not absent(dirfd, "subject.txt"):
                raise Invalid("subject prepublication")
            control = read_exact(dirfd, "control.txt", 0o444, 512)
            if len(control) != pre["control_bytes"] or hashlib.sha256(control).hexdigest() != pre["control_sha256"]:
                raise Invalid("control binding")
            prior = decode_canonical(read_exact(dirfd, "ready_control.json", 0o444, 2048), READY_KEYS, "ready control")
            if prior["phase"] != "control" or prior["goal_thread_id"] != thread_id or prior["request_sha256"] != request_sha or prior["previous_phase_sha256"] is not None:
                raise Invalid("ready control binding")
            previous = pre["control_sha256"]
            ready_name = "ready_subject.json"
            target_name = "subject.txt"
            expected_bytes = pre["subject_bytes"]
            expected_sha = pre["subject_sha256"]
        write_ready(dirfd, ready_name, {"atom_id": pre["atom_id"], "case_id": pre["case_id"], "fresh_run_id": pre["fresh_run_id"], "goal_thread_id": thread_id, "phase": phase, "pid": os.getpid(), "previous_phase_sha256": previous, "request_sha256": request_sha, "schema_id": "pw-r9-codex-native-goal-two-phase-mailbox-ready-v1", "waiter_sha256": pre["waiter_sha256"]})
        deadline = time.monotonic() + 25.0
        while time.monotonic() < deadline:
            if not absent(dirfd, target_name):
                capsule = read_exact(dirfd, target_name, 0o444, 512)
                if len(capsule) != expected_bytes or hashlib.sha256(capsule).hexdigest() != expected_sha or not capsule.endswith(b"\n") or b"\n" in capsule[:-1]:
                    raise Invalid("capsule")
                if phase == "subject":
                    control = read_exact(dirfd, "control.txt", 0o444, 512)
                    if hashlib.sha256(control).hexdigest() != pre["control_sha256"]:
                        raise Invalid("control postflight")
                os.write(1, capsule)
                return 0
            time.sleep(0.02)
        raise Invalid("timeout")
    finally:
        os.close(dirfd)


try:
    raise SystemExit(main())
except (Invalid, OSError, UnicodeError, json.JSONDecodeError, TypeError, KeyError) as exc:
    os.write(2, ("FAIL:" + str(exc) + "\n").encode("utf-8", "strict"))
    raise SystemExit(1)
