#!/usr/bin/env python3
import ast
import hashlib
import json
import os
import shutil
import signal
import stat
import sys
import tempfile
import time

sys.dont_write_bytecode = True
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g14"
WAITER_PATH = HERE + "/wait.py"
THREAD_ID = "10000000-0000-0000-0000-000000000001"


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def identity(path):
    info = os.lstat(path)
    require(stat.S_ISREG(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o644 and info.st_uid == os.getuid() and info.st_nlink == 1, "source-custody")
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        raw = b""
        while len(raw) < info.st_size:
            chunk = os.read(fd, info.st_size - len(raw))
            require(bool(chunk), "source-short")
            raw += chunk
        require(os.read(fd, 1) == b"", "source-trailing")
    finally:
        os.close(fd)
    after = os.lstat(path)
    require((after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) == (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns), "source-drift")
    return raw, (info.st_dev, info.st_ino, info.st_mode, info.st_size, info.st_mtime_ns, sha(raw))


def load_waiter(raw):
    tree = ast.parse(raw, filename=WAITER_PATH)
    require(isinstance(tree.body[-1], ast.Try), "waiter-terminal")
    module = ast.Module(body=tree.body[:-1], type_ignores=[])
    ast.fix_missing_locations(module)
    namespace = {"__name__": "r9g14_waiter_model"}
    exec(compile(module, WAITER_PATH, "exec"), namespace)
    require(callable(namespace.get("main")), "waiter-main")
    return namespace


def make_dir(path):
    os.mkdir(path, 0o700)
    os.chmod(path, 0o700)


def publish(path, raw, mode=0o444):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, mode)
    try:
        os.fchmod(fd, mode)
        view = memoryview(raw)
        while view:
            count = os.write(fd, view)
            require(count > 0, "publish-write")
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    parent_fd = os.open(os.path.dirname(path), os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        os.fsync(parent_fd)
    finally:
        os.close(parent_fd)


def subject(extra=False):
    value = {"c": "Return one token.", "p": {"op": "label", "x": "amber"}, "q": "token", "r": "TOKEN", "v": 2, "z": "direct"}
    if extra:
        value["answer"] = "amber"
    return canonical(value)


def base_pre(waiter_raw, nonce, subject_raw):
    return {
        "execution_nonce": nonce,
        "goal_objective": "CG7|m=C03|w=0000|r=a|x={}|once".format(nonce),
        "matrix_code": "C03",
        "matrix_id": "codex-native-goal-single-turn-blocking-mailbox-canary-003",
        "model_requested": "gpt-5.4-mini",
        "reasoning_effort_requested": "xhigh",
        "result_contract_sha256": "2" * 64,
        "route": "slot-alpha",
        "route_code": "a",
        "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-predeclaration-v2",
        "subject_bytes": len(subject_raw),
        "subject_sha256": sha(subject_raw),
        "task_path": "/root/r9_cg7_" + nonce,
        "waiter_bytes": len(waiter_raw),
        "waiter_sha256": sha(waiter_raw),
        "wave_index": 0,
    }


def run_case(namespace, waiter_raw, name, mutate_pre=None, delivered=None, bind_delivered=False, prepublish=False, expected_ready=True, expected_rc=0):
    temp = tempfile.mkdtemp(prefix="r9g14-wait-model-")
    try:
        root = temp + "/r"
        matrix = root + "/C03"
        wave = matrix + "/0000"
        route = wave + "/a"
        nonce = sha(name.encode("ascii"))
        row = route + "/" + nonce
        for path in (root, matrix, wave, route, row):
            make_dir(path)
        good_subject = subject()
        pre = base_pre(waiter_raw, nonce, good_subject)
        if bind_delivered:
            require(delivered is not None, "bind-delivered")
            pre["subject_bytes"] = len(delivered)
            pre["subject_sha256"] = sha(delivered)
        if mutate_pre is not None:
            mutate_pre(pre)
        publish(row + "/wait.py", waiter_raw)
        publish(row + "/predeclaration.json", canonical(pre))
        if prepublish:
            publish(row + "/subject.txt", good_subject)
        out_r, out_w = os.pipe()
        err_r, err_w = os.pipe()
        pid = os.fork()
        if pid == 0:
            try:
                os.close(out_r)
                os.close(err_r)
                os.dup2(out_w, 1)
                os.dup2(err_w, 2)
                os.close(out_w)
                os.close(err_w)
                os.chdir(row)
                sys.argv = ["wait.py", THREAD_ID]
                try:
                    rc = namespace["main"](root)
                except Exception as exc:
                    os.write(2, ("FAIL:" + str(exc) + "\n").encode("utf-8", "strict"))
                    rc = 1
                os._exit(rc)
            except BaseException:
                os._exit(97)
        os.close(out_w)
        os.close(err_w)
        ready = row + "/ready.json"
        deadline = time.monotonic() + 3.0
        child_status = None
        while time.monotonic() < deadline:
            waited, status_value = os.waitpid(pid, os.WNOHANG)
            if waited == pid:
                child_status = status_value
                break
            if os.path.lexists(ready):
                payload = good_subject if delivered is None else delivered
                if not os.path.lexists(row + "/subject.txt"):
                    publish(row + "/subject.stage", payload)
                    os.link(row + "/subject.stage", row + "/subject.txt", follow_symlinks=False)
                    directory_fd = os.open(row, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
                    try:
                        os.fsync(directory_fd)
                        os.unlink("subject.stage", dir_fd=directory_fd)
                        os.fsync(directory_fd)
                    finally:
                        os.close(directory_fd)
                break
            time.sleep(0.005)
        if child_status is None:
            while time.monotonic() < deadline:
                waited, status_value = os.waitpid(pid, os.WNOHANG)
                if waited == pid:
                    child_status = status_value
                    break
                time.sleep(0.005)
        if child_status is None:
            os.kill(pid, signal.SIGKILL)
            _, child_status = os.waitpid(pid, 0)
            raise Invalid("case-timeout:" + name)
        stdout = os.read(out_r, 4096)
        stderr = os.read(err_r, 4096)
        os.close(out_r)
        os.close(err_r)
        rc = os.waitstatus_to_exitcode(child_status)
        require(os.path.lexists(ready) is expected_ready, "ready:{}:rc:{}:{}".format(name, rc, stderr.decode("utf-8", "replace")))
        require(rc == expected_rc, "rc:{}:{}:{}".format(name, rc, stderr.decode("utf-8", "replace")))
        if expected_rc == 0:
            require(stdout == good_subject and stderr == b"", "happy-output")
        else:
            require(stdout == b"" and stderr.startswith(b"FAIL:"), "failure-output:" + name)
        return {"name": name, "rc": rc, "ready": os.path.lexists(ready)}
    finally:
        shutil.rmtree(temp)


def main():
    require(sys.argv == [sys.argv[0], "--check"], "cli")
    waiter_raw, before = identity(WAITER_PATH)
    namespace = load_waiter(waiter_raw)
    cases = []
    cases.append(run_case(namespace, waiter_raw, "happy"))
    cases.append(run_case(namespace, waiter_raw, "wrong-roster", lambda pre: pre.__setitem__("model_requested", "gpt-5.6-luna"), expected_ready=False, expected_rc=1))
    cases.append(run_case(namespace, waiter_raw, "private-field", lambda pre: pre.__setitem__("expected_result_sha256", "3" * 64), expected_ready=False, expected_rc=1))
    cases.append(run_case(namespace, waiter_raw, "objective-drift", lambda pre: pre.__setitem__("goal_objective", "wrong"), expected_ready=False, expected_rc=1))
    bad_hash = subject()
    cases.append(run_case(namespace, waiter_raw, "subject-hash", delivered=bad_hash + b" ", expected_ready=True, expected_rc=1))
    cases.append(run_case(namespace, waiter_raw, "subject-private", delivered=subject(extra=True), bind_delivered=True, expected_ready=True, expected_rc=1))
    cases.append(run_case(namespace, waiter_raw, "prepublished", prepublish=True, expected_ready=False, expected_rc=1))
    _, after = identity(WAITER_PATH)
    require(before == after and not os.path.lexists(HERE + "/r"), "workspace-drift")
    output = {
        "case_count": len(cases),
        "cases": cases,
        "first_mismatch": None,
        "qualification_credit": 0,
        "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-waiter-model-check-v1",
        "status": "PASS_DATA_ONLY_TEMPORARY_MODEL_ZERO_SUBJECT_CALLS",
        "subject_calls": 0,
        "temporary_root_absent": True,
        "waiter": {"bytes": len(waiter_raw), "sha256": sha(waiter_raw)},
        "workspace_writes": 0,
    }
    sys.stdout.buffer.write(canonical(output))


try:
    main()
except Exception as exc:
    sys.stderr.write("FAIL:" + str(exc) + "\n")
    raise SystemExit(1)
