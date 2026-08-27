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
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g15"
WAITER_PATH = HERE + "/wait.py"
THREAD_ID = "10000000-0000-0000-0000-000000000001"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"


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
    namespace = {"__name__": "r9g15_waiter_model"}
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
            require(count > 0, "publish")
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)


def subject(extra=False):
    value = {"c": "Return one token.", "p": {"op": "label", "x": "amber"}, "q": "token", "r": "TOKEN", "v": 2, "z": "direct"}
    if extra:
        value["answer"] = "amber"
    return canonical(value)


def predeclaration(waiter, nonce, raw):
    return {
        "bootstrap_skill_bytes": SKILL_BYTES, "bootstrap_skill_sha256": SKILL_SHA256,
        "execution_nonce": nonce, "goal_objective": "CG8|m=C04|w=0000|r=a|x={}|once".format(nonce),
        "matrix_code": "C04", "matrix_id": "codex-native-goal-skill-blocking-mailbox-canary-004",
        "model_requested": "gpt-5.4-mini", "reasoning_effort_requested": "xhigh", "result_contract_sha256": "2" * 64,
        "route": "slot-alpha", "route_code": "a", "schema_id": "pw-r9-codex-native-goal-skill-blocking-predeclaration-v3",
        "subject_bytes": len(raw), "subject_sha256": sha(raw), "task_path": "/root/r9_cg8_" + nonce,
        "waiter_bytes": len(waiter), "waiter_sha256": sha(waiter), "wave_index": 0,
    }


def run_case(namespace, waiter, name, mutate=None, delivered=None, bind_delivered=False, prepublish=False, ready=True, rc=0):
    temp = tempfile.mkdtemp(prefix="r9g15-wait-model-")
    try:
        root = temp + "/r"
        nonce = sha(name.encode("ascii"))
        row = root + "/C04/0000/a/" + nonce
        path = root
        make_dir(path)
        for part in ("C04", "0000", "a", nonce):
            path += "/" + part
            make_dir(path)
        good = subject()
        pre = predeclaration(waiter, nonce, good)
        if bind_delivered:
            pre["subject_bytes"] = len(delivered)
            pre["subject_sha256"] = sha(delivered)
        if mutate:
            mutate(pre)
        publish(row + "/wait.py", waiter)
        publish(row + "/predeclaration.json", canonical(pre))
        if prepublish:
            publish(row + "/subject.txt", good)
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
                    result = namespace["main"](root)
                except Exception as error:
                    os.write(2, ("FAIL:" + str(error) + "\n").encode("utf-8"))
                    result = 1
                os._exit(result)
            except BaseException:
                os._exit(97)
        os.close(out_w)
        os.close(err_w)
        ready_path = row + "/ready.json"
        deadline = time.monotonic() + 3.0
        status_value = None
        while time.monotonic() < deadline:
            waited, status_now = os.waitpid(pid, os.WNOHANG)
            if waited == pid:
                status_value = status_now
                break
            if os.path.lexists(ready_path):
                payload = good if delivered is None else delivered
                if not os.path.lexists(row + "/subject.txt"):
                    publish(row + "/subject.stage", payload)
                    os.link(row + "/subject.stage", row + "/subject.txt", follow_symlinks=False)
                    dirfd = os.open(row, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
                    try:
                        os.fsync(dirfd)
                        os.unlink("subject.stage", dir_fd=dirfd)
                        os.fsync(dirfd)
                    finally:
                        os.close(dirfd)
                break
            time.sleep(0.005)
        while status_value is None and time.monotonic() < deadline:
            waited, status_now = os.waitpid(pid, os.WNOHANG)
            if waited == pid:
                status_value = status_now
                break
            time.sleep(0.005)
        if status_value is None:
            os.kill(pid, signal.SIGKILL)
            _, status_value = os.waitpid(pid, 0)
            raise Invalid("timeout:" + name)
        stdout = os.read(out_r, 4096)
        stderr = os.read(err_r, 4096)
        os.close(out_r)
        os.close(err_r)
        exit_code = os.waitstatus_to_exitcode(status_value)
        require(os.path.lexists(ready_path) is ready, "ready:" + name)
        require(exit_code == rc, "rc:{}:{}:{}".format(name, exit_code, stderr.decode("utf-8", "replace")))
        if rc == 0:
            require(stdout == good and stderr == b"", "happy")
        else:
            require(stdout == b"" and stderr.startswith(b"FAIL:"), "failure:" + name)
        return {"name": name, "rc": exit_code, "ready": os.path.lexists(ready_path)}
    finally:
        shutil.rmtree(temp)


def main():
    require(sys.argv == [sys.argv[0], "--check"], "cli")
    waiter, before = identity(WAITER_PATH)
    namespace = load_waiter(waiter)
    cases = [
        run_case(namespace, waiter, "happy"),
        run_case(namespace, waiter, "wrong-skill", lambda pre: pre.__setitem__("bootstrap_skill_sha256", "3" * 64), ready=False, rc=1),
        run_case(namespace, waiter, "wrong-roster", lambda pre: pre.__setitem__("model_requested", "gpt-5.6-luna"), ready=False, rc=1),
        run_case(namespace, waiter, "private-field", lambda pre: pre.__setitem__("expected_result_sha256", "3" * 64), ready=False, rc=1),
        run_case(namespace, waiter, "objective", lambda pre: pre.__setitem__("goal_objective", "wrong"), ready=False, rc=1),
        run_case(namespace, waiter, "subject-hash", delivered=subject() + b" ", ready=True, rc=1),
        run_case(namespace, waiter, "subject-private", delivered=subject(True), bind_delivered=True, ready=True, rc=1),
        run_case(namespace, waiter, "prepublished", prepublish=True, ready=False, rc=1),
    ]
    _, after = identity(WAITER_PATH)
    require(before == after and not os.path.lexists(HERE + "/r"), "workspace-drift")
    output = {
        "case_count": len(cases), "cases": cases, "first_mismatch": None, "qualification_credit": 0,
        "schema_id": "pw-r9-codex-native-goal-skill-blocking-waiter-model-check-v1",
        "status": "PASS_DATA_ONLY_TEMPORARY_MODEL_ZERO_SUBJECT_CALLS", "subject_calls": 0,
        "temporary_root_absent": True, "waiter": {"bytes": len(waiter), "sha256": sha(waiter)}, "workspace_writes": 0,
    }
    sys.stdout.buffer.write(canonical(output))


try:
    main()
except Exception as error:
    sys.stderr.write("FAIL:" + str(error) + "\n")
    raise SystemExit(1)
