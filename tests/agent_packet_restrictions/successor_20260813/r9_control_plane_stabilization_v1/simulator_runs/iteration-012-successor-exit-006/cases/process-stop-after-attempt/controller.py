#!/usr/bin/python3
import base64
import ctypes
import errno
import hashlib
import json
import os
import pathlib
import select
import shutil
import signal
import stat
import subprocess
import sys
import time

FAULT = "STOP_AFTER_ATTEMPT"
CASE_BY_FAULT = {
    "STOP_BEFORE_ADMISSION": "process-stop-before-admission",
    "STOP_AFTER_ATTEMPT": "process-stop-after-attempt",
    "STOP_AFTER_RECEIPT": "process-stop-after-receipt",
}
RUN_BY_FAULT = {
    "STOP_BEFORE_ADMISSION": "pf-stop-before-admission",
    "STOP_AFTER_ATTEMPT": "process-stop-after-attempt",
    "STOP_AFTER_RECEIPT": "pf-stop-after-receipt",
}
EXPECTED_PARTS = {
    "semantic_bundle.json": ("IMMUTABLE_SEMANTIC_BUNDLE", "11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2", 786546),
    "runner.py": ("PROCESS_RUNNER", "3d773914f3be5eac06d73f7a4e27c25bfea212aa1baa9c399e06200211199469", 59507),
    "evidence_recorder.py": ("APPEND_ONLY_EVIDENCE_RECORDER", "7f8ca2d19750a65ac71b711f13ed4fb1205eab0711b945463561a5f3f35a9e52", 39866),
    "offline_verifier.py": ("OFFLINE_VERIFIER", "7cea3258b0928430b6064ae48c9a3b296ed024f196c972184b779f938279c569", 95000),
}
ROLE_ORDER = [
    "APPEND_ONLY_EVIDENCE_RECORDER",
    "IMMUTABLE_SEMANTIC_BUNDLE",
    "OFFLINE_VERIFIER",
    "PROCESS_RUNNER",
]
EXPECTED_IDENTITY = {
    "schema_id": "pw-r9-four-part-component-identity-v1",
    "part_count": 4,
    "aggregate_file_bytes": 980919,
    "rows_sha256": "87613ab41965d2bfb50665320bbacc5d13c45a7c6606b97f22ed260208500f2c",
    "rows_bytes": 494,
}
EXPECTED_SHARED = {
    "r9_goal_operating_contract_v1.json": ("764dd27b3f472a90eef0f8493e63ac8fb349fe05a3a97dc4673a4a835e6e8dbd", 7024),
    "r9_subject_transport_addendum_subagent_invocations_v1.json": ("7b5186b3c9f244488a75695b34b0d06e79ee6b720acb934fc3767315c4b005d8", 5909),
    "r9_subject_transport_subagent_route_capability_receipt_v1.json": ("3d523eac087e691b2336a6ab878dbfe64b8359891831dc866641039f97f8646a", 4780),
}
SENTINEL = "__PW_R9_PROCESS_FAULT_MECHANICAL_SENTINEL__"
MAX_SECONDS = 90.0


class CaseError(RuntimeError):
    def __init__(self, code, expected=None, actual=None):
        super().__init__(code)
        self.code = code
        self.expected = expected
        self.actual = actual


def canon(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def exact_file(path):
    before = os.lstat(path)
    if stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode):
        raise CaseError("REGULAR_NONLINK_REQUIRED", "regular nonlink", str(path))
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        chunks = []
        while True:
            chunk = os.read(fd, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
    finally:
        os.close(fd)
    data = b"".join(chunks)
    after = os.lstat(path)
    if (before.st_dev, before.st_ino, before.st_size) != (after.st_dev, after.st_ino, after.st_size) or len(data) != before.st_size:
        raise CaseError("FILE_DRIFT_DURING_REOPEN", [before.st_dev, before.st_ino, before.st_size], [after.st_dev, after.st_ino, after.st_size, len(data)])
    return data


def create_bytes(path, data, mode=0o644):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, mode)
    try:
        view = memoryview(data)
        while view:
            count = os.write(fd, view)
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    dfd = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(dfd)
    finally:
        os.close(dfd)


def create_json(path, value):
    create_bytes(path, canon(value) + b"\n")


def assert_equal(code, actual, expected):
    if actual != expected:
        raise CaseError(code, expected, actual)


def parse_line(raw, label):
    if not raw.endswith(b"\n") or raw.endswith(b"\n\n") or b"\r" in raw or b"\n" in raw[:-1]:
        raise CaseError(label + "_FRAMING", "canonical one-LF line", base64.b64encode(raw).decode("ascii"))
    try:
        value = json.loads(raw[:-1].decode("utf-8"))
    except Exception as exc:
        raise CaseError(label + "_JSON", "JSON object", f"{type(exc).__name__}:{exc}") from exc
    if not isinstance(value, dict) or canon(value) + b"\n" != raw:
        raise CaseError(label + "_CANONICAL", "sorted minified JSON object plus LF", digest(raw))
    return value


def inventory(root):
    root = pathlib.Path(root)
    if not os.path.lexists(root):
        return {"root_exists": False, "entries": []}
    entries = []
    paths = [root]
    for current, directories, files in os.walk(root, topdown=True, followlinks=False):
        directories.sort()
        files.sort()
        paths.extend(pathlib.Path(current) / name for name in directories)
        paths.extend(pathlib.Path(current) / name for name in files)
    for path in sorted(set(paths), key=lambda item: ("." if item == root else item.relative_to(root).as_posix()).encode("utf-8")):
        info = os.lstat(path)
        if stat.S_ISREG(info.st_mode):
            kind = "regular"
            sha = digest(exact_file(path))
        elif stat.S_ISDIR(info.st_mode):
            kind = "directory"
            sha = None
        elif stat.S_ISLNK(info.st_mode):
            kind = "symlink"
            sha = None
        else:
            kind = "other"
            sha = None
        entries.append({
            "relative_path": "." if path == root else path.relative_to(root).as_posix(),
            "entry_type": kind,
            "device": info.st_dev,
            "inode": info.st_ino,
            "mode": info.st_mode,
            "nlink": info.st_nlink,
            "size": info.st_size,
            "mtime_ns": info.st_mtime_ns,
            "ctime_ns": info.st_ctime_ns,
            "sha256_for_regular_files": sha,
        })
    return {"root_exists": True, "entries": entries}


def run_git(repo, arguments, environment=None):
    env = dict(os.environ)
    env.update({"LC_ALL": "C", "GIT_OPTIONAL_LOCKS": "0", "GIT_NO_REPLACE_OBJECTS": "1"})
    if environment:
        env.update(environment)
    result = subprocess.run(["git", "-C", str(repo), *arguments], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env, timeout=30, check=False)
    if result.returncode != 0:
        raise CaseError("GIT_COMMAND_FAILED", [*arguments, 0], [result.returncode, result.stderr.decode("utf-8", "replace")])
    return result.stdout


def setup(case):
    expected_case = CASE_BY_FAULT[FAULT]
    assert_equal("CASE_DIRECTORY_BINDING", case.name, expected_case)
    successor = case.parents[4]
    component_source = successor / "r9_control_plane_stabilization_v1" / "iteration_012"
    source_parts = []
    by_role = {}
    for name, (role, sha, size) in EXPECTED_PARTS.items():
        data = exact_file(component_source / name)
        assert_equal("SOURCE_PART_IDENTITY_" + name, [digest(data), len(data)], [sha, size])
        by_role[role] = data
        source_parts.append({"name": name, "role": role, "sha256": sha, "bytes": size})
    rows = [{"role": role, "sha256": digest(by_role[role]), "bytes": len(by_role[role])} for role in ROLE_ORDER]
    rows_bytes = canon(rows)
    identity = dict(EXPECTED_IDENTITY)
    identity["parts"] = rows
    assert_equal("COMPONENT_ROWS_IDENTITY", [digest(rows_bytes), len(rows_bytes), sum(item["bytes"] for item in rows)], [EXPECTED_IDENTITY["rows_sha256"], EXPECTED_IDENTITY["rows_bytes"], EXPECTED_IDENTITY["aggregate_file_bytes"]])
    shared = []
    for name, (sha, size) in EXPECTED_SHARED.items():
        data = exact_file(successor / name)
        assert_equal("SOURCE_SHARED_IDENTITY_" + name, [digest(data), len(data)], [sha, size])
        shared.append({"name": name, "sha256": sha, "bytes": size})
    semantic = json.loads(by_role["IMMUTABLE_SEMANTIC_BUNDLE"].decode("utf-8"))
    canary_outputs = [semantic["cells"][0]["expected_output_utf8"] for _ in semantic["routes"]]
    if SENTINEL in canary_outputs:
        raise CaseError("SENTINEL_COLLIDES_WITH_CANARY_ORACLE", "distinct sentinel", SENTINEL)
    repo = case / "custody-repo"
    evidence = case / "evidence"
    captures = case / "captures"
    run_id = RUN_BY_FAULT[FAULT]
    run_root = evidence / run_id
    for path, label in ((repo, "custody repo"), (evidence, "evidence root"), (captures, "captures root"), (run_root, "run root")):
        if os.path.lexists(path):
            raise CaseError("PREFLIGHT_ROOT_NOT_ABSENT", f"{label} absent", str(path))
    repo.mkdir()
    evidence.mkdir()
    captures.mkdir()
    component_copy = repo / "r9_control_plane_stabilization_v1" / "iteration_012"
    component_copy.mkdir(parents=True)
    for name in EXPECTED_PARTS:
        shutil.copyfile(component_source / name, component_copy / name)
    for name in EXPECTED_SHARED:
        shutil.copyfile(successor / name, repo / name)
    run_git(repo, ["init", "-q"])
    run_git(repo, ["config", "user.name", "PW R9 Process Controller"])
    run_git(repo, ["config", "user.email", "pw-r9-process-controller.invalid"])
    tracked = [f"r9_control_plane_stabilization_v1/iteration_012/{name}" for name in EXPECTED_PARTS] + list(EXPECTED_SHARED)
    run_git(repo, ["add", "--", *tracked])
    fixed_env = {
        "GIT_AUTHOR_DATE": "2000-01-01T00:00:00Z",
        "GIT_COMMITTER_DATE": "2000-01-01T00:00:00Z",
    }
    run_git(repo, ["commit", "-q", "-m", "isolated current-byte process fault custody"], fixed_env)
    head = run_git(repo, ["rev-parse", "HEAD"]).decode("ascii").strip()
    run_git(repo, ["update-ref", "refs/remotes/origin/main", head])
    assert_equal("CUSTODY_HEAD_ORIGIN", run_git(repo, ["rev-parse", "HEAD", "refs/remotes/origin/main"]).decode("ascii").splitlines(), [head, head])
    assert_equal("CUSTODY_SCOPED_STATUS", run_git(repo, ["status", "--porcelain=v1", "--untracked-files=all", "--", *tracked]), b"")
    copied = []
    for name, (role, sha, size) in EXPECTED_PARTS.items():
        data = exact_file(component_copy / name)
        assert_equal("COPIED_PART_IDENTITY_" + name, [digest(data), len(data)], [sha, size])
        blob = run_git(repo, ["show", f"HEAD:r9_control_plane_stabilization_v1/iteration_012/{name}"])
        assert_equal("HEAD_PART_BLOB_" + name, blob, data)
        copied.append({"name": name, "role": role, "sha256": sha, "bytes": size})
    for name, (sha, size) in EXPECTED_SHARED.items():
        data = exact_file(repo / name)
        assert_equal("COPIED_SHARED_IDENTITY_" + name, [digest(data), len(data)], [sha, size])
        assert_equal("HEAD_SHARED_BLOB_" + name, run_git(repo, ["show", f"HEAD:{name}"]), data)
    pre_target = inventory(run_root)
    assert_equal("RUN_ROOT_ABSENT_BEFORE_PRIMARY", pre_target, {"root_exists": False, "entries": []})
    preflight = {
        "schema_id": "pw-r9-process-fault-case-preflight-v1",
        "fault_id": FAULT,
        "platform": {"system": os.uname().sysname, "release": os.uname().release, "machine": os.uname().machine, "python": sys.version.split()[0]},
        "component_identity": identity,
        "source_parts": sorted(source_parts, key=lambda item: item["name"]),
        "shared_authorities": sorted(shared, key=lambda item: item["name"]),
        "sentinel": {"utf8": SENTINEL, "sha256": digest(SENTINEL.encode("utf-8")), "bytes": len(SENTINEL.encode("utf-8")), "distinct_from_all_canary_expected_outputs": True},
        "custody": {"mode": "FRESH_ISOLATED_TRACKED_CLEAN_LOCAL_GIT", "head": head, "origin_main": head, "tracked_component_count": 4, "tracked_shared_authority_count": 3, "scoped_clean": True, "network_operations": 0},
        "roots": {"case": str(case), "custody_repo": str(repo), "evidence_root": str(evidence), "run_id": run_id, "run_root_absent": True},
        "primary_launch_count_before_marker": 0,
        "calls": {"provider": 0, "subject": 0, "model": 0, "network": 0, "collaboration": 0},
        "qualification_credit": 0,
        "authority": {"candidate_mint": False, "formal_audit": False, "freeze": False, "goal_completion": False, "launch": False, "qualification_claim": False, "release": False},
    }
    create_json(case / "preflight.json", preflight)
    create_json(captures / "target-inventory-pre-primary.json", pre_target)
    return repo, component_copy, evidence, captures, run_id, run_root, preflight


def activity():
    return {"tool_calls": 0, "file_accesses": 0, "browsing": 0, "network_accesses": 0, "delegations": 0, "memory_accesses": 0, "followup_turns": 0, "nonterminal_messages": [], "observation_basis": "ROOT_VISIBLE_COLLABORATION_DELIVERIES"}


def request_events(request):
    request_bytes = canon(request)
    receipt = {
        "schema_id": "pw-r9-subagent-spawn-receipt-event-v1",
        "invocation_id": request["invocation_id"],
        "spawn_request_sha256": digest(request_bytes),
        "tool_result": {"task_name": request["expected_canonical_task_path"]},
        "returned_identity_kind": "canonical_task_path",
        "returned_canonical_task_path": request["expected_canonical_task_path"],
    }
    terminal = {
        "schema_id": "pw-r9-subagent-terminal-delivery-event-v1",
        "invocation_id": request["invocation_id"],
        "returned_canonical_task_path": request["expected_canonical_task_path"],
        "message_type": "FINAL_ANSWER",
        "final_utf8": SENTINEL,
        "observed_activity": activity(),
        "terminal_status": "FINAL_RETURNED",
    }
    return canon(receipt) + b"\n", canon(terminal) + b"\n"


def validate_request(request, run_id, evidence):
    assert_equal("REQUEST_SCHEMA", request.get("schema_id"), "pw-r9-subagent-spawn-request-v1")
    assert_equal("REQUEST_RUN_ID", request.get("run_id"), run_id)
    assert_equal("REQUEST_RUN_KIND", request.get("run_kind"), "run-canary")
    assert_equal("REQUEST_MODE", request.get("mode"), "actual")
    assert_equal("REQUEST_ORDINAL", request.get("ordinal"), 0)
    attempt_path = pathlib.Path(evidence) / run_id / "rows" / "row-000" / "attempt.json"
    attempt_data = exact_file(attempt_path)
    assert_equal("REQUEST_ATTEMPT_SHA256", request.get("attempt_sha256"), digest(attempt_data))
    assert_equal("REQUEST_ATTEMPT_BYTES", request.get("attempt_bytes"), len(attempt_data))


class Capture:
    def __init__(self, captures):
        self.out_path = captures / "primary.stdout.bin"
        self.err_path = captures / "primary.stderr.bin"
        self.trace_path = captures / "signal-barrier-trace.jsonl"
        self.out_fd = os.open(self.out_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o644)
        self.err_fd = os.open(self.err_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o644)
        self.trace_fd = os.open(self.trace_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o644)
        self.stdout = bytearray()
        self.stderr = bytearray()
        self.sequence = 0

    def append(self, fd, data, target):
        if data:
            os.write(fd, data)
            os.fsync(fd)
            target.extend(data)

    def event(self, kind, **fields):
        self.sequence += 1
        value = {"sequence": self.sequence, "kind": kind, **fields}
        os.write(self.trace_fd, canon(value) + b"\n")
        os.fsync(self.trace_fd)

    def close(self):
        for fd in (self.out_fd, self.err_fd, self.trace_fd):
            try:
                os.fsync(fd)
            finally:
                os.close(fd)


def drain_fd(fd, capture_fd, target):
    while True:
        try:
            data = os.read(fd, 65536)
        except BlockingIOError:
            return False
        if not data:
            return True
        os.write(capture_fd, data)
        os.fsync(capture_fd)
        target.extend(data)


def send_owned(pid, pidfd, signum):
    if hasattr(signal, "pidfd_send_signal"):
        signal.pidfd_send_signal(pidfd, signum, None, 0)
        return "pidfd_send_signal"
    os.kill(pid, signum)
    return "kill"


def wait_plain(pid, stdout_r, stderr_r, capture, deadline):
    os.set_blocking(stdout_r, False)
    os.set_blocking(stderr_r, False)
    status = None
    while status is None:
        drain_fd(stdout_r, capture.out_fd, capture.stdout)
        drain_fd(stderr_r, capture.err_fd, capture.stderr)
        waited, observed = os.waitpid(pid, os.WNOHANG)
        if waited == pid:
            status = observed
            break
        if time.monotonic() > deadline:
            os.kill(pid, signal.SIGKILL)
            os.waitpid(pid, 0)
            raise CaseError("PRIMARY_TIMEOUT", f"less than {MAX_SECONDS}s", "timeout; owned child killed")
        select.select([stdout_r, stderr_r], [], [], 0.01)
    drain_fd(stdout_r, capture.out_fd, capture.stdout)
    drain_fd(stderr_r, capture.err_fd, capture.stderr)
    os.close(stdout_r)
    os.close(stderr_r)
    if not os.WIFEXITED(status):
        raise CaseError("PRIMARY_NOT_NORMAL_EXIT", "normal exit 2", status)
    return os.WEXITSTATUS(status)


def primary_before(component, evidence, captures, run_id):
    capture = Capture(captures)
    stdin_r, stdin_w = os.pipe()
    stdout_r, stdout_w = os.pipe()
    stderr_r, stderr_w = os.pipe()
    barrier_r, barrier_w = os.pipe()
    release_r, release_w = os.pipe()
    marker = {"schema_id": "pw-r9-process-primary-launch-marker-v1", "fault_id": FAULT, "run_id": run_id, "primary_launch_ordinal": 1, "retry_count": 0, "relaunch_count": 0, "replacement_count": 0}
    create_json(captures / "primary-launch-marker.json", marker)
    pid = os.fork()
    if pid == 0:
        try:
            os.close(stdin_w); os.close(stdout_r); os.close(stderr_r); os.close(barrier_r); os.close(release_w)
            os.dup2(stdin_r, 0); os.dup2(stdout_w, 1); os.dup2(stderr_w, 2)
            for fd in (stdin_r, stdout_w, stderr_w):
                if fd > 2:
                    os.close(fd)
            signal.pthread_sigmask(signal.SIG_BLOCK, {signal.SIGINT, signal.SIGTERM})
            os.write(barrier_w, canon({"kind": "CHILD_SIGNAL_MASK_READY", "pid": os.getpid(), "blocked": ["SIGINT", "SIGTERM"]}) + b"\n")
            if os.read(release_r, 1) != b"R":
                os._exit(120)
            pending = signal.sigpending()
            os.write(barrier_w, canon({"kind": "CHILD_PENDING_VERIFIED", "pid": os.getpid(), "sigterm_pending": signal.SIGTERM in pending}) + b"\n")
            if signal.SIGTERM not in pending:
                os._exit(121)
            os.close(barrier_w); os.close(release_r)
            environment = dict(os.environ)
            environment.update({"PW_R9_EVIDENCE_ROOT": str(evidence), "PYTHONDONTWRITEBYTECODE": "1", "LC_ALL": "C"})
            os.execve("/usr/bin/python3", ["/usr/bin/python3", str(component / "runner.py"), "run-canary", "--run-root", run_id], environment)
        except BaseException:
            os._exit(122)
    os.close(stdin_r); os.close(stdout_w); os.close(stderr_w); os.close(barrier_w); os.close(release_r)
    pidfd = os.pidfd_open(pid, 0)
    try:
        ready = b""
        while not ready.endswith(b"\n"):
            ready += os.read(barrier_r, 4096)
        ready_value = parse_line(ready, "PRIVATE_READY")
        assert_equal("PRIVATE_READY_PID", ready_value.get("pid"), pid)
        capture.event("child_signal_mask_ready", pid=pid, blocked=ready_value.get("blocked"))
        method = send_owned(pid, pidfd, signal.SIGTERM)
        capture.event("signal_send_success", pid=pid, signal="SIGTERM", method=method, owned_direct_child=True)
        os.close(stdin_w)
        os.write(release_w, b"R"); os.close(release_w)
        pending = b""
        while not pending.endswith(b"\n"):
            chunk = os.read(barrier_r, 4096)
            if not chunk:
                break
            pending += chunk
        pending_value = parse_line(pending, "PRIVATE_PENDING")
        assert_equal("PRIVATE_PENDING_PID", pending_value.get("pid"), pid)
        assert_equal("SIGTERM_PENDING_BEFORE_EXEC", pending_value.get("sigterm_pending"), True)
        capture.event("pending_signal_verified_before_exec", pid=pid, signal="SIGTERM", sigpending=True, exec_release_with_signal_blocked=True)
        os.close(barrier_r)
        rc = wait_plain(pid, stdout_r, stderr_r, capture, time.monotonic() + MAX_SECONDS)
        capture.event("primary_exit", pid=pid, normal_exit=True, returncode=rc)
    finally:
        os.close(pidfd)
        capture.close()
    return rc, bytes(capture.stdout), bytes(capture.stderr)


PTRACE_TRACEME = 0
PTRACE_SYSCALL = 24
PTRACE_SETOPTIONS = 0x4200
PTRACE_GETSIGINFO = 0x4202
PTRACE_GET_SYSCALL_INFO = 0x420E
PTRACE_O_TRACESYSGOOD = 1
PTRACE_O_EXITKILL = 1 << 20
PTRACE_SYSCALL_INFO_ENTRY = 1
AUDIT_ARCH_X86_64 = 0xC000003E
SYS_READ_X86_64 = 0
libc = ctypes.CDLL(None, use_errno=True)
libc.ptrace.restype = ctypes.c_long
libc.ptrace.argtypes = [ctypes.c_uint, ctypes.c_uint, ctypes.c_void_p, ctypes.c_void_p]


def ptrace(request, pid, address=0, data=0):
    result = libc.ptrace(request, pid, ctypes.c_void_p(address), ctypes.c_void_p(data))
    if result == -1:
        error = ctypes.get_errno()
        raise CaseError("PTRACE_FAILED", 0, {"request": request, "pid": pid, "errno": error, "detail": os.strerror(error)})
    return result


def syscall_info(pid):
    buffer = ctypes.create_string_buffer(128)
    result = libc.ptrace(PTRACE_GET_SYSCALL_INFO, pid, ctypes.c_void_p(len(buffer)), ctypes.cast(buffer, ctypes.c_void_p))
    if result == -1:
        error = ctypes.get_errno()
        raise CaseError("PTRACE_GET_SYSCALL_INFO_FAILED", "supported", {"errno": error, "detail": os.strerror(error)})
    raw = bytes(buffer)
    op = raw[0]
    arch = int.from_bytes(raw[4:8], "little")
    ip = int.from_bytes(raw[8:16], "little")
    sp = int.from_bytes(raw[16:24], "little")
    if op == PTRACE_SYSCALL_INFO_ENTRY:
        number = int.from_bytes(raw[24:32], "little")
        args = [int.from_bytes(raw[32 + 8 * index:40 + 8 * index], "little") for index in range(6)]
    else:
        number = None
        args = []
    return {"op": op, "arch": arch, "instruction_pointer": ip, "stack_pointer": sp, "number": number, "args": args, "returned_bytes": result}


def siginfo(pid):
    buffer = ctypes.create_string_buffer(128)
    result = libc.ptrace(PTRACE_GETSIGINFO, pid, None, ctypes.cast(buffer, ctypes.c_void_p))
    if result == -1:
        error = ctypes.get_errno()
        raise CaseError("PTRACE_GETSIGINFO_FAILED", "available at signal delivery stop", {"errno": error, "detail": os.strerror(error)})
    raw = bytes(buffer)
    return {"si_signo": int.from_bytes(raw[0:4], "little", signed=True), "si_errno": int.from_bytes(raw[4:8], "little", signed=True), "si_code": int.from_bytes(raw[8:12], "little", signed=True)}


def primary_traced(component, evidence, captures, run_id):
    if os.uname().sysname != "Linux" or os.uname().machine != "x86_64":
        raise CaseError("UNSUPPORTED_PTRACE_PLATFORM", "Linux x86_64", [os.uname().sysname, os.uname().machine])
    capture = Capture(captures)
    stdin_r, stdin_w = os.pipe()
    stdout_r, stdout_w = os.pipe()
    stderr_r, stderr_w = os.pipe()
    marker = {"schema_id": "pw-r9-process-primary-launch-marker-v1", "fault_id": FAULT, "run_id": run_id, "primary_launch_ordinal": 1, "retry_count": 0, "relaunch_count": 0, "replacement_count": 0}
    create_json(captures / "primary-launch-marker.json", marker)
    pid = os.fork()
    if pid == 0:
        try:
            os.close(stdin_w); os.close(stdout_r); os.close(stderr_r)
            os.dup2(stdin_r, 0); os.dup2(stdout_w, 1); os.dup2(stderr_w, 2)
            for fd in (stdin_r, stdout_w, stderr_w):
                if fd > 2:
                    os.close(fd)
            if libc.ptrace(PTRACE_TRACEME, 0, None, None) == -1:
                os._exit(123)
            os.kill(os.getpid(), signal.SIGSTOP)
            environment = dict(os.environ)
            environment.update({"PW_R9_EVIDENCE_ROOT": str(evidence), "PYTHONDONTWRITEBYTECODE": "1", "LC_ALL": "C"})
            os.execve("/usr/bin/python3", ["/usr/bin/python3", str(component / "runner.py"), "run-canary", "--run-root", run_id], environment)
        except BaseException:
            os._exit(124)
    os.close(stdin_r); os.close(stdout_w); os.close(stderr_w)
    os.set_blocking(stdout_r, False); os.set_blocking(stderr_r, False)
    pidfd = os.pidfd_open(pid, 0)
    request = None
    receipt_line = terminal_line = None
    phase = "WAIT_REQUEST_RECEIPT_READ" if FAULT == "STOP_AFTER_ATTEMPT" else "WAIT_REQUEST_THEN_FEED_RECEIPT"
    signal_stop_seen = False
    signal_send_seen = False
    stdin_closed = False
    deadline = time.monotonic() + MAX_SECONDS
    try:
        waited, status = os.waitpid(pid, 0)
        assert_equal("PTRACE_INITIAL_WAIT_PID", waited, pid)
        if not os.WIFSTOPPED(status) or os.WSTOPSIG(status) != signal.SIGSTOP:
            raise CaseError("PTRACE_INITIAL_STOP", "SIGSTOP", status)
        capture.event("ptrace_initial_stop", pid=pid, signal="SIGSTOP", owned_direct_child=True)
        ptrace(PTRACE_SETOPTIONS, pid, 0, PTRACE_O_TRACESYSGOOD | PTRACE_O_EXITKILL)
        capture.event("ptrace_options_set", pid=pid, options=["PTRACE_O_TRACESYSGOOD", "PTRACE_O_EXITKILL"])
        ptrace(PTRACE_SYSCALL, pid, 0, 0)
        exit_status = None
        while exit_status is None:
            drain_fd(stdout_r, capture.out_fd, capture.stdout)
            drain_fd(stderr_r, capture.err_fd, capture.stderr)
            if request is None and b"\n" in capture.stdout:
                first = bytes(capture.stdout[:capture.stdout.index(10) + 1])
                candidate = parse_line(first, "SPAWN_REQUEST")
                if candidate.get("schema_id") == "pw-r9-subagent-spawn-request-v1":
                    validate_request(candidate, run_id, evidence)
                    request = candidate
                    receipt_line, terminal_line = request_events(request)
                    capture.event("spawn_request_observed", pid=pid, stdout_line_sha256=digest(first), stdout_line_bytes=len(first), attempt_fsync_and_parent_fsync_and_reopen_precedes_publication=True)
            waited, status = os.waitpid(pid, os.WNOHANG)
            if waited == 0:
                if time.monotonic() > deadline:
                    send_owned(pid, pidfd, signal.SIGKILL)
                    os.waitpid(pid, 0)
                    raise CaseError("PRIMARY_TIMEOUT", f"less than {MAX_SECONDS}s", "timeout; owned child killed")
                select.select([stdout_r, stderr_r], [], [], 0.005)
                continue
            if waited != pid:
                raise CaseError("PTRACE_WAIT_PID_MISMATCH", pid, waited)
            if os.WIFEXITED(status) or os.WIFSIGNALED(status):
                exit_status = status
                break
            if not os.WIFSTOPPED(status):
                raise CaseError("PTRACE_UNEXPECTED_WAIT_STATUS", "stopped or exited", status)
            stop_signal = os.WSTOPSIG(status)
            if stop_signal == (signal.SIGTRAP | 0x80):
                info = syscall_info(pid)
                if info["op"] == PTRACE_SYSCALL_INFO_ENTRY:
                    assert_equal("PTRACE_ARCH", info["arch"], AUDIT_ARCH_X86_64)
                    if info["number"] == SYS_READ_X86_64 and info["args"] and info["args"][0] == 0:
                        if request is None:
                            drain_fd(stdout_r, capture.out_fd, capture.stdout)
                            if b"\n" in capture.stdout:
                                first = bytes(capture.stdout[:capture.stdout.index(10) + 1])
                                request = parse_line(first, "SPAWN_REQUEST")
                                validate_request(request, run_id, evidence)
                                receipt_line, terminal_line = request_events(request)
                                capture.event("spawn_request_observed", pid=pid, stdout_line_sha256=digest(first), stdout_line_bytes=len(first), attempt_fsync_and_parent_fsync_and_reopen_precedes_publication=True)
                        if request is None:
                            raise CaseError("STDIN_READ_BEFORE_REQUEST_PUBLICATION", "complete canonical spawn request", info)
                        capture.event("stdin_read_syscall_entry", pid=pid, fd=0, count=info["args"][2], syscall_number=info["number"], audit_arch=info["arch"], phase=phase)
                        if FAULT == "STOP_AFTER_ATTEMPT" and phase == "WAIT_REQUEST_RECEIPT_READ":
                            method = send_owned(pid, pidfd, signal.SIGTERM)
                            signal_send_seen = True
                            capture.event("signal_send_success", pid=pid, signal="SIGTERM", method=method, owned_direct_child=True, boundary="AFTER_DURABLE_ATTEMPT_BEFORE_SPAWN_RECEIPT")
                            phase = "WAIT_SIGNAL_DELIVERY_FOR_ATTEMPT"
                        elif FAULT == "STOP_AFTER_ATTEMPT" and phase == "WAIT_HANDLER_RETURN_RECEIPT_READ":
                            os.write(stdin_w, receipt_line)
                            capture.event("spawn_receipt_fed", pid=pid, sha256=digest(receipt_line), bytes=len(receipt_line), after_distinct_signal_delivery_stop=True)
                            phase = "WAIT_TERMINAL_READ_AFTER_RECEIPT"
                        elif FAULT == "STOP_AFTER_ATTEMPT" and phase == "WAIT_TERMINAL_READ_AFTER_RECEIPT":
                            spawn_path = pathlib.Path(evidence) / run_id / "rows" / "row-000" / "spawn_receipt.json"
                            stored = exact_file(spawn_path)
                            capture.event("spawn_receipt_durable_observation", pid=pid, relative_path="rows/row-000/spawn_receipt.json", sha256=digest(stored), bytes=len(stored), observation_is_advisory=True)
                            os.write(stdin_w, terminal_line); os.close(stdin_w); stdin_closed = True
                            capture.event("terminal_fed_and_stdin_closed", pid=pid, sha256=digest(terminal_line), bytes=len(terminal_line), boundary="AFTER_HANDLER_RETURN_AND_DURABLE_RECEIPT")
                            phase = "DRAIN_TO_STOPPED_SEAL"
                        elif FAULT == "STOP_AFTER_RECEIPT" and phase == "WAIT_REQUEST_THEN_FEED_RECEIPT":
                            os.write(stdin_w, receipt_line)
                            capture.event("spawn_receipt_fed", pid=pid, sha256=digest(receipt_line), bytes=len(receipt_line), stdin_kept_open=True)
                            phase = "WAIT_TERMINAL_READ_SIGNAL_TARGET"
                        elif FAULT == "STOP_AFTER_RECEIPT" and phase == "WAIT_TERMINAL_READ_SIGNAL_TARGET":
                            spawn_path = pathlib.Path(evidence) / run_id / "rows" / "row-000" / "spawn_receipt.json"
                            stored = exact_file(spawn_path)
                            capture.event("terminal_read_barrier_reached", pid=pid, fd=0, relative_path="rows/row-000/spawn_receipt.json", stored_sha256=digest(stored), stored_bytes=len(stored), barrier_proves_record_spawn_fsync_parent_fsync_exact_reopen_parse_and_binding=True, external_file_read_alone_is_advisory=True)
                            method = send_owned(pid, pidfd, signal.SIGTERM)
                            signal_send_seen = True
                            capture.event("signal_send_success", pid=pid, signal="SIGTERM", method=method, owned_direct_child=True, boundary="AFTER_DURABLE_RECEIPT_AT_TERMINAL_READ_ENTRY")
                            phase = "WAIT_SIGNAL_DELIVERY_FOR_RECEIPT"
                        elif FAULT == "STOP_AFTER_RECEIPT" and phase == "WAIT_HANDLER_RETURN_TERMINAL_READ":
                            os.write(stdin_w, terminal_line); os.close(stdin_w); stdin_closed = True
                            capture.event("terminal_fed_and_stdin_closed", pid=pid, sha256=digest(terminal_line), bytes=len(terminal_line), boundary="AFTER_SIGNAL_HANDLER_RETURN_TO_TERMINAL_READ")
                            phase = "DRAIN_TO_STOPPED_SEAL"
                ptrace(PTRACE_SYSCALL, pid, 0, 0)
                continue
            if stop_signal == signal.SIGTERM and phase in {"WAIT_SIGNAL_DELIVERY_FOR_ATTEMPT", "WAIT_SIGNAL_DELIVERY_FOR_RECEIPT"}:
                info = siginfo(pid)
                assert_equal("SIGINFO_SIGNO", info["si_signo"], signal.SIGTERM)
                signal_stop_seen = True
                capture.event("signal_delivery_stop", pid=pid, signal="SIGTERM", ptrace_getsiginfo=info, reinjection="SIGTERM")
                phase = "WAIT_HANDLER_RETURN_RECEIPT_READ" if FAULT == "STOP_AFTER_ATTEMPT" else "WAIT_HANDLER_RETURN_TERMINAL_READ"
                ptrace(PTRACE_SYSCALL, pid, 0, signal.SIGTERM)
                continue
            reinject = 0 if stop_signal == signal.SIGTRAP else stop_signal
            capture.event("other_ptrace_stop", pid=pid, signal_number=stop_signal, reinjected_signal_number=reinject)
            ptrace(PTRACE_SYSCALL, pid, 0, reinject)
        drain_fd(stdout_r, capture.out_fd, capture.stdout)
        drain_fd(stderr_r, capture.err_fd, capture.stderr)
        if not stdin_closed:
            os.close(stdin_w); stdin_closed = True
        if not os.WIFEXITED(exit_status):
            raise CaseError("PRIMARY_NOT_NORMAL_EXIT", "normal exit 2", exit_status)
        rc = os.WEXITSTATUS(exit_status)
        assert_equal("SIGNAL_SEND_OBSERVED", signal_send_seen, True)
        assert_equal("SIGNAL_DELIVERY_STOP_OBSERVED", signal_stop_seen, True)
        assert_equal("FINAL_PTRACE_PHASE", phase, "DRAIN_TO_STOPPED_SEAL")
        capture.event("primary_exit", pid=pid, normal_exit=True, returncode=rc, final_phase=phase)
    finally:
        if not stdin_closed:
            try:
                os.close(stdin_w)
            except OSError:
                pass
        os.close(pidfd)
        os.close(stdout_r); os.close(stderr_r)
        capture.close()
    return rc, bytes(capture.stdout), bytes(capture.stderr)


def expected_counts():
    common = {
        "planned_calls": 3, "pass_rows": 0, "invalid_rows": 0, "ineligible_rows": 0,
        "controller_aborted_rows": 0, "missing_rows": 0, "stage_artifacts": 0,
        "invalid_stage_artifacts": 0, "spawn_failure_prefix_count": 0,
        "terminal_failure_prefix_count": 0, "retry_count": 0,
        "replacement_count": 0, "best_of_count": 0,
    }
    if FAULT == "STOP_BEFORE_ADMISSION":
        common.update({"attempts": 0, "captured_spawn_records": 0, "captured_raw_results": 0, "completed_rows": 0, "subject_fail_rows": 0, "stopped_rows": 3})
    else:
        common.update({"attempts": 1, "captured_spawn_records": 1, "captured_raw_results": 1, "completed_rows": 1, "subject_fail_rows": 1, "stopped_rows": 2})
    return common


def validate_result(value, label):
    assert_equal(label + "_SCHEMA", value.get("schema_id"), "pw-r9-reopen-result-v4")
    assert_equal(label + "_STATUS", value.get("status"), "STOPPED_AFTER_DRAIN")
    assert_equal(label + "_MATRIX_STATUS", value.get("matrix_status"), "STOPPED_AFTER_DRAIN")
    report = value.get("offline_verifier")
    if not isinstance(report, dict):
        raise CaseError(label + "_VERIFIER_REPORT", "object", report)
    assert_equal(label + "_VERIFIER_SCHEMA", report.get("schema_id"), "pw-r9-offline-verifier-report-v4")
    assert_equal(label + "_VERIFIER_VALID", report.get("valid"), True)
    assert_equal(label + "_VERIFIER_STATUS", report.get("matrix_status"), "STOPPED_AFTER_DRAIN")
    calls = report.get("calls")
    assert_equal(label + "_CALLS", calls, {"model": 0, "collaboration": 0, "provider": 0, "subject": 0, "network": 0})
    assert_equal(label + "_QUALIFICATION_CREDIT", report.get("credit", {}).get("qualification_clean_run_credit"), 0)
    counts = report.get("counts")
    wanted = expected_counts()
    for key, expected in wanted.items():
        assert_equal(label + "_COUNT_" + key, counts.get(key) if isinstance(counts, dict) else None, expected)
    return counts


def validate_target(run_root):
    matrix = parse_line(exact_file(run_root / "matrix_terminal.json"), "MATRIX_TERMINAL")
    accounting = parse_line(exact_file(run_root / "accounting.json"), "ACCOUNTING")
    assert_equal("MATRIX_CAUSE", matrix.get("cause"), {"kind": "STOPPED_AFTER_DRAIN", "detail": "signal at terminal decision boundary"})
    assert_equal("MATRIX_STATUS", matrix.get("status"), "STOPPED_AFTER_DRAIN")
    assert_equal("ACCOUNTING_STATUS", accounting.get("status"), "STOPPED_AFTER_DRAIN")
    for key, expected in expected_counts().items():
        accounting_key = "valid_completions" if key == "completed_rows" else key
        if accounting_key in accounting:
            assert_equal("ACCOUNTING_" + accounting_key, accounting[accounting_key], expected)
        if key in matrix:
            assert_equal("MATRIX_" + key, matrix[key], expected)
    top_files = sorted(path.name for path in run_root.iterdir() if path.is_file())
    assert_equal("TOP_FILE_INVENTORY", top_files, ["accounting.json", "matrix_terminal.json", "run.json"])
    terminals = sorted(path.name for path in (run_root / "terminals").iterdir())
    assert_equal("TERMINAL_INVENTORY", terminals, ["slot-alpha.json", "slot-bravo.json", "slot-charlie.json"])
    artifacts = [path.relative_to(run_root / "artifacts").as_posix() for path in (run_root / "artifacts").rglob("*") if path.is_file()]
    assert_equal("ARTIFACT_FILE_COUNT", len(artifacts), 0)
    row_directories = sorted(path.name for path in (run_root / "rows").iterdir())
    if FAULT == "STOP_BEFORE_ADMISSION":
        assert_equal("ROW_DIRECTORY_INVENTORY", row_directories, [])
    else:
        assert_equal("ROW_DIRECTORY_INVENTORY", row_directories, ["row-000"])
        row_files = sorted(path.name for path in (run_root / "rows" / "row-000").iterdir())
        assert_equal("ROW_000_FILE_INVENTORY", row_files, ["attempt.json", "completion.json", "provider_input.txt", "raw_result.json", "spawn_message.txt", "spawn_receipt.json"])
    return matrix, accounting


def reopen_twice(component, evidence, captures, run_id, run_root, baseline):
    outputs = []
    for ordinal in (1, 2):
        before = inventory(run_root)
        create_json(captures / f"target-inventory-before-reopen-{ordinal}.json", before)
        assert_equal(f"TARGET_BEFORE_REOPEN_{ordinal}", before, baseline)
        env = dict(os.environ)
        env.update({"PW_R9_EVIDENCE_ROOT": str(evidence), "PYTHONDONTWRITEBYTECODE": "1", "LC_ALL": "C"})
        result = subprocess.run(["/usr/bin/python3", str(component / "runner.py"), "reopen", "--run-root", run_id], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env, timeout=90, check=False)
        create_bytes(captures / f"reopen-{ordinal}.stdout.bin", result.stdout)
        create_bytes(captures / f"reopen-{ordinal}.stderr.bin", result.stderr)
        create_bytes(captures / f"reopen-{ordinal}-return-code.txt", f"{result.returncode}\n".encode("ascii"))
        after = inventory(run_root)
        create_json(captures / f"target-inventory-after-reopen-{ordinal}.json", after)
        assert_equal(f"REOPEN_{ordinal}_RETURN_CODE", result.returncode, 2)
        assert_equal(f"REOPEN_{ordinal}_STDERR", result.stderr, b"")
        assert_equal(f"TARGET_UNCHANGED_BY_REOPEN_{ordinal}", after, before)
        lines = result.stdout.splitlines(keepends=True)
        assert_equal(f"REOPEN_{ordinal}_STDOUT_LINE_COUNT", len(lines), 1)
        value = parse_line(lines[0], f"REOPEN_{ordinal}_RESULT")
        validate_result(value, f"REOPEN_{ordinal}")
        outputs.append((result.stdout, result.stderr, result.returncode, value))
    assert_equal("REOPEN_STDOUTS_IDENTICAL", outputs[0][0], outputs[1][0])
    assert_equal("REOPEN_STDERRS_IDENTICAL", outputs[0][1], outputs[1][1])
    assert_equal("REOPEN_RETURN_CODES_IDENTICAL", outputs[0][2], outputs[1][2])
    return outputs


def capture_inventory(captures):
    result = []
    for path in sorted(captures.iterdir(), key=lambda item: item.name.encode("utf-8")):
        if path.is_file():
            data = exact_file(path)
            result.append({"relative_path": path.name, "sha256": digest(data), "bytes": len(data)})
    return result


def main():
    case = pathlib.Path(__file__).resolve().parent
    receipt_path = case / "case-receipt.json"
    first_mismatch = None
    try:
        repo, component, evidence, captures, run_id, run_root, preflight = setup(case)
        if FAULT == "STOP_BEFORE_ADMISSION":
            rc, stdout, stderr = primary_before(component, evidence, captures, run_id)
        else:
            rc, stdout, stderr = primary_traced(component, evidence, captures, run_id)
        create_bytes(captures / "primary-return-code.txt", f"{rc}\n".encode("ascii"))
        assert_equal("PRIMARY_RETURN_CODE", rc, 2)
        assert_equal("PRIMARY_STDERR", stderr, b"")
        lines = stdout.splitlines(keepends=True)
        expected_line_count = 1 if FAULT == "STOP_BEFORE_ADMISSION" else 2
        assert_equal("PRIMARY_STDOUT_LINE_COUNT", len(lines), expected_line_count)
        if FAULT != "STOP_BEFORE_ADMISSION":
            request = parse_line(lines[0], "PRIMARY_REQUEST")
            validate_request(request, run_id, evidence)
        primary_value = parse_line(lines[-1], "PRIMARY_RESULT")
        counts = validate_result(primary_value, "PRIMARY")
        matrix, accounting = validate_target(run_root)
        baseline = inventory(run_root)
        create_json(captures / "target-inventory-post-primary.json", baseline)
        reopens = reopen_twice(component, evidence, captures, run_id, run_root, baseline)
        final_inventory = inventory(run_root)
        assert_equal("TARGET_UNCHANGED_AFTER_ALL_REOPENS", final_inventory, baseline)
        receipt = {
            "schema_id": "pw-r9-process-fault-case-receipt-v1",
            "fault_id": FAULT,
            "case_id": case.name,
            "verdict": "EXPECTED_MECHANICAL_OUTCOME_OBSERVED",
            "expected_status": "STOPPED_AFTER_DRAIN",
            "primary": {"launch_count": 1, "returncode": rc, "stdout_sha256": digest(stdout), "stdout_bytes": len(stdout), "stderr_sha256": digest(stderr), "stderr_bytes": len(stderr), "result": primary_value},
            "counts": counts,
            "matrix_cause": matrix["cause"],
            "protocol_stimulus": "CONTROLLER_GENERATED_MECHANICAL_ONLY",
            "signal_evidence": {"trace_path": "captures/signal-barrier-trace.jsonl", "trace_sha256": digest(exact_file(captures / "signal-barrier-trace.jsonl")), "trace_bytes": len(exact_file(captures / "signal-barrier-trace.jsonl")), "owned_child_only": True},
            "reopen": {"invocation_count": 2, "returncodes": [item[2] for item in reopens], "stdout_streams_identical": reopens[0][0] == reopens[1][0], "typed_results_identical": reopens[0][3] == reopens[1][3], "target_tree_unchanged": True},
            "component_identity": preflight["component_identity"],
            "custody": preflight["custody"],
            "capture_inventory_before_receipt": capture_inventory(captures),
            "execution": {"primary_launches": 1, "primary_retries": 0, "primary_relaunches": 0, "primary_replacements": 0, "best_of_count": 0, "public_run_surface": "runner.py run-canary --run-root " + run_id, "public_reopen_surface": "runner.py reopen --run-root " + run_id},
            "calls": {"provider": 0, "subject": 0, "model": 0, "network": 0, "collaboration": 0},
            "qualification_credit": 0,
            "empirical_credit": 0,
            "authority": {"candidate_mint": False, "formal_audit": False, "freeze": False, "goal_completion": False, "launch": False, "qualification_claim": False, "release": False},
            "first_mismatch": None,
        }
        create_json(receipt_path, receipt)
        sys.stdout.buffer.write(canon(receipt) + b"\n")
        sys.stdout.buffer.flush()
        return 0
    except BaseException as exc:
        if isinstance(exc, CaseError):
            first_mismatch = {"code": exc.code, "expected": exc.expected, "actual": exc.actual}
        else:
            first_mismatch = {"code": "UNEXPECTED_CONTROLLER_EXCEPTION", "expected": "successful bounded controller execution", "actual": f"{type(exc).__name__}:{exc}"}
        failure = {
            "schema_id": "pw-r9-process-fault-case-receipt-v1",
            "fault_id": FAULT,
            "case_id": CASE_BY_FAULT.get(FAULT),
            "verdict": "FAIL_CLOSED",
            "first_mismatch": first_mismatch,
            "qualification_credit": 0,
            "empirical_credit": 0,
            "calls": {"provider": 0, "subject": 0, "model": 0, "network": 0, "collaboration": 0},
            "authority": {"candidate_mint": False, "formal_audit": False, "freeze": False, "goal_completion": False, "launch": False, "qualification_claim": False, "release": False},
        }
        if not os.path.lexists(receipt_path):
            create_json(receipt_path, failure)
        sys.stdout.buffer.write(canon(failure) + b"\n")
        sys.stdout.buffer.flush()
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
