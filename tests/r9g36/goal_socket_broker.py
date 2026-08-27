#!/usr/bin/env python3
import hashlib
import importlib.util
import json
import math
import os
import re
import socket
import sqlite3
import stat
import struct
import sys
import time

sys.dont_write_bytecode = True
SELF = "/mnt/Cursor/PuppetMaster/tests/r9g36/goal_socket_broker.py"
ATTESTOR = "/mnt/Cursor/PuppetMaster/tests/r9g36/goal_db_attestor.py"
ATTESTOR_BYTES = 9118
ATTESTOR_SHA256 = "274b818da6ae51fb7c01608c4b3aca2e0d3f69a74bfb9815db816aa57b38bcc6"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
HEX = re.compile(r"^[0-9a-f]{64}$")
ROSTER = {
    "alpha": {"model": "gpt-5.4-mini", "reasoning_effort": "xhigh"},
    "bravo": {"model": "gpt-5.4-mini", "reasoning_effort": "medium"},
    "charlie": {"model": "gpt-5.6-luna", "reasoning_effort": "medium"},
}


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
    value = json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda token: (_ for _ in ()).throw(Invalid("nonfinite:" + token)))
    require(finite(value), "finite")
    return value


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"), sort_keys=True).encode("utf-8") + b"\n"


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def read_exact(path, mode, size=None, digest=None, cap=None):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode), "kind:" + path)
    require(stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1, "custody:" + path)
    require(size is None or before.st_size == size, "size:" + path)
    require(cap is None or before.st_size <= cap, "cap:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw))
            require(bool(part), "short:" + path)
            raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
        after = os.fstat(fd)
    finally:
        os.close(fd)
    current = os.lstat(path)
    require((after.st_dev, after.st_ino, after.st_size) == (before.st_dev, before.st_ino, before.st_size), "race:" + path)
    require((current.st_dev, current.st_ino, current.st_size) == (before.st_dev, before.st_ino, before.st_size), "drift:" + path)
    require(digest is None or sha(raw) == digest, "digest:" + path)
    return raw


def read_json(path, mode=0o444, cap=1000000):
    raw = read_exact(path, mode, cap=cap)
    value = parse(raw)
    require(raw == canonical(value), "canonical:" + path)
    return raw, value


def directory(path, mode=0o700):
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode), "directory-kind:" + path)
    require(stat.S_IMODE(info.st_mode) == mode and info.st_uid == os.getuid(), "directory-custody:" + path)


def fsync_dir(path):
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def publish(path, raw, mode=0o444):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, mode)
    try:
        os.fchmod(fd, mode)
        view = memoryview(raw)
        while view:
            count = os.write(fd, view)
            require(count > 0, "write:" + path)
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    fsync_dir(os.path.dirname(path))
    require(read_exact(path, mode, len(raw), sha(raw)) == raw, "publish:" + path)


def binding(path):
    raw = read_exact(path, 0o644, cap=500000)
    return {"bytes": len(raw), "mode": "0644", "path": path, "sha256": sha(raw)}


def validate_binding(value):
    require(set(value) == {"bytes", "mode", "path", "sha256"} and value["mode"] == "0644", "binding-shape")
    require(os.path.isabs(value["path"]) and type(value["bytes"]) is int and value["bytes"] > 0 and HEX.fullmatch(value["sha256"] or ""), "binding-values")
    read_exact(value["path"], 0o644, value["bytes"], value["sha256"])


def load_plan(path):
    require(os.path.isabs(path) and os.path.realpath(path) == path and path.startswith("/mnt/Cursor/PuppetMaster/tests/r9g36/"), "plan-path")
    raw = read_exact(path, 0o444, cap=1000000)
    plan = parse(raw)
    require(raw == canonical(plan), "plan-canonical")
    require(set(plan) == {"authority", "bindings", "experiment", "failure_contract", "qualification", "rows", "schema_id", "status"}, "plan-shape")
    require(plan["schema_id"] == "pw-r9-codex-native-goal-db-socket-canary-plan-v1" and plan["status"] == "FROZEN_ZERO_CREDIT_NO_MATRIX_OR_QUALIFICATION_AUTHORITY", "plan-id")
    require(plan["authority"] == {"canary_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0}, "authority")
    require(plan["failure_contract"] == {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0}, "failure-contract")
    require(plan["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "required_consecutive_clean_full_matrices": 2}, "qualification")
    require(set(plan["bindings"]) == {"attestor", "broker", "controller", "offline_verifier", "skill"}, "bindings")
    for value in plan["bindings"].values():
        validate_binding(value)
    require(plan["bindings"]["attestor"] == binding(ATTESTOR) and plan["bindings"]["broker"] == binding(SELF) and plan["bindings"]["skill"] == binding(SKILL), "runtime-bindings")
    experiment = plan["experiment"]
    require(set(experiment) == {"id", "parent_goal_thread_id", "root", "socket_name", "stop_at_first_nonpass"}, "experiment-shape")
    require(UUID.fullmatch(experiment["parent_goal_thread_id"] or "") and experiment["socket_name"] == "goal_subject.sock" and experiment["stop_at_first_nonpass"] is True, "experiment-values")
    require(os.path.isabs(experiment["root"]) and os.path.realpath(experiment["root"]) == experiment["root"] and experiment["root"].startswith("/mnt/Cursor/PuppetMaster/tests/r9g36/"), "root")
    rows = plan["rows"]
    require(isinstance(rows, list) and len(rows) == 3, "row-count")
    for index, row in enumerate(rows):
        require(set(row) == {"expected_result", "goal_objective", "model", "reasoning_effort", "route", "subject", "task_name", "task_path"}, "row-shape")
        route = ("alpha", "bravo", "charlie")[index]
        require(row["route"] == route and {"model": row["model"], "reasoning_effort": row["reasoning_effort"]} == ROSTER[route], "row-route")
        require(isinstance(row["goal_objective"], str) and 1 <= len(row["goal_objective"].encode()) <= 128, "row-objective")
        require(row["task_path"] == "/root/" + row["task_name"] and re.fullmatch(r"r9_gdb6_[0-9a-f]{64}", row["task_name"] or ""), "row-task")
        for key in ("subject", "expected_result"):
            commitment = row[key]
            require(set(commitment) == {"bytes", "sha256"} and type(commitment["bytes"]) is int and commitment["bytes"] > 0 and HEX.fullmatch(commitment["sha256"] or ""), "commitment:" + key)
    return raw, plan


def load_attestor():
    read_exact(ATTESTOR, 0o644, ATTESTOR_BYTES, ATTESTOR_SHA256)
    spec = importlib.util.spec_from_file_location("r9g36_goal_db_attestor", ATTESTOR)
    require(spec is not None and spec.loader is not None, "attestor-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    require(module.__all__ == ("Invalid", "active", "canonical", "parse", "terminal_absent"), "attestor-api")
    return module


def read_corpus(plan):
    raw = sys.stdin.buffer.readline(8193)
    require(raw.endswith(b"\n") and len(raw) <= 8192 and sys.stdin.buffer.read(1) == b"", "corpus-framing")
    corpus = parse(raw)
    require(raw == canonical(corpus) and set(corpus) == {"rows", "schema_id"} and corpus["schema_id"] == "pw-r9-codex-native-goal-db-socket-canary-private-corpus-v1", "corpus-shape")
    require(isinstance(corpus["rows"], dict) and set(corpus["rows"]) == {"alpha", "bravo", "charlie"}, "corpus-routes")
    by_route = {row["route"]: row for row in plan["rows"]}
    for route, item in corpus["rows"].items():
        require(set(item) == {"expected_result", "subject"} and isinstance(item["expected_result"], str) and isinstance(item["subject"], str), "corpus-row")
        subject = item["subject"].encode("utf-8")
        result = item["expected_result"].encode("utf-8")
        require(len(subject) == by_route[route]["subject"]["bytes"] and sha(subject) == by_route[route]["subject"]["sha256"], "subject-commitment")
        require(len(result) == by_route[route]["expected_result"]["bytes"] and sha(result) == by_route[route]["expected_result"]["sha256"], "result-commitment")
        require(subject.endswith(b"\n") and b"\r" not in subject and len(subject) <= 384, "subject-framing")
        require(re.fullmatch(rb"[A-Za-z0-9._:-]{1,48}", result), "result-framing")
    return corpus


def receive_line(connection, cap=512):
    raw = b""
    while len(raw) <= cap:
        part = connection.recv(cap + 1 - len(raw))
        if not part:
            break
        raw += part
    require(len(raw) <= cap and raw.endswith(b"\n") and raw.count(b"\n") == 1, "request-framing")
    value = parse(raw)
    require(raw == canonical(value), "request-canonical")
    return value


def serve(plan_path):
    _, plan = load_plan(plan_path)
    corpus = read_corpus(plan)
    root = plan["experiment"]["root"]
    directory(root)
    directory(os.path.join(root, "rows"))
    socket_path = os.path.join(root, plan["experiment"]["socket_name"])
    require(not os.path.lexists(socket_path), "socket-exists")
    attestor = load_attestor()
    server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    served = []
    try:
        server.bind(socket_path)
        os.chmod(socket_path, 0o600)
        server.listen(3)
        fsync_dir(root)
        ready = {"expected_connections": 3, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-db-socket-broker-ready-v1", "socket_path": socket_path, "status": "READY_PRIVATE_CORPUS_IN_MEMORY_ZERO_CREDIT"}
        publish(os.path.join(root, "broker_ready.json"), canonical(ready))
        sys.stdout.buffer.write(canonical(ready)); sys.stdout.buffer.flush()
        by_route = {row["route"]: row for row in plan["rows"]}
        while len(served) < 3:
            connection, _ = server.accept()
            with connection:
                credentials = connection.getsockopt(socket.SOL_SOCKET, socket.SO_PEERCRED, struct.calcsize("3i"))
                _, uid, _ = struct.unpack("3i", credentials)
                require(uid == os.getuid(), "peer-uid")
                request = receive_line(connection)
                require(set(request) == {"route", "schema_id", "thread_id"} and request["schema_id"] == "pw-r9-codex-native-goal-db-socket-subject-request-v1", "request-shape")
                route = request["route"]
                thread_id = request["thread_id"]
                require(route in by_route and route not in served and UUID.fullmatch(thread_id or ""), "request-values")
                row = by_route[route]
                workdir = os.path.join(root, "rows", route)
                directory(workdir)
                _, launch = read_json(os.path.join(workdir, "launch_intent.json"), cap=8192)
                require(launch["route"] == route and launch["task_path"] == row["task_path"] and launch["goal_objective"] == row["goal_objective"], "launch-intent")
                deadline = time.monotonic() + 5.0
                while True:
                    try:
                        proof = attestor.active(thread_id, row["goal_objective"], plan["experiment"]["parent_goal_thread_id"], row["task_path"], row["model"], row["reasoning_effort"])
                        break
                    except (attestor.Invalid, OSError, sqlite3.Error) as error:
                        require(time.monotonic() < deadline, "active-db-timeout:" + str(error))
                        time.sleep(0.02)
                subject = corpus["rows"][route]["subject"].encode("utf-8")
                active = {"attestation": proof, "qualification_credit": 0, "route": route, "schema_id": "pw-r9-codex-native-goal-db-socket-active-release-v1", "status": "ACTIVE_ATTESTED_BEFORE_PRIVATE_SUBJECT_RELEASE", "subject": row["subject"]}
                publish(os.path.join(workdir, "active_goal.json"), canonical(active))
                publish(os.path.join(workdir, "subject.txt"), subject)
                connection.sendall(subject)
                connection.shutdown(socket.SHUT_WR)
                served.append(route)
        require(served == ["alpha", "bravo", "charlie"], "serve-order")
    finally:
        server.close()
        if os.path.lexists(socket_path):
            os.unlink(socket_path)
            fsync_dir(root)
    terminal = {"delivered_routes": served, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-db-socket-broker-terminal-v1", "status": "PASS_ALL_PRIVATE_SUBJECTS_RELEASED_AFTER_DB_ACTIVE_ATTESTATION_ZERO_CREDIT"}
    publish(os.path.join(root, "broker_terminal.json"), canonical(terminal))
    sys.stdout.buffer.write(canonical(terminal)); sys.stdout.buffer.flush()
    return 0


def main(argv):
    require(len(argv) == 3 and argv[1] in {"--check", "--serve"}, "argv")
    plan_path = os.path.realpath(argv[2])
    if argv[1] == "--check":
        load_plan(plan_path)
        sys.stdout.buffer.write(canonical({"qualification_credit": 0, "status": "PASS_DATA_ONLY_ZERO_WRITES"}))
        return 0
    return serve(plan_path)


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, ValueError, KeyError, TypeError, json.JSONDecodeError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "qualification_credit": 0, "status": "FAIL"})); sys.stdout.buffer.flush()
        raise SystemExit(1)
