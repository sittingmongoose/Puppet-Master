#!/usr/bin/env python3
"""Case-local Linux process controller for the iteration-012 process faults."""

from __future__ import annotations

import ctypes
import errno
import hashlib
import json
import os
import pathlib
import platform
import select
import shutil
import signal
import stat
import subprocess
import sys
import time
from typing import Any

sys.dont_write_bytecode = True

CASE_DIR = pathlib.Path(__file__).resolve().parent
CASE_ID = CASE_DIR.name
ALLOWED_CASES = {
    "process-completion-prefix-reopen-invalid",
    "process-same-root-reinvoke-zero-request",
    "process-root-eof-trailing-bytes",
}
if CASE_ID not in ALLOWED_CASES:
    raise SystemExit("controller must remain in one declared case directory")

SOURCE_SUCCESSOR = CASE_DIR.parents[4]
SOURCE_COMPONENT = SOURCE_SUCCESSOR / "r9_control_plane_stabilization_v1" / "iteration_012"
BUILD_CONTRACT = SOURCE_SUCCESSOR / "r9_control_plane_stabilization_v1" / "iteration_012_build_contract_v1.json"
SANDBOX = CASE_DIR / "sandbox_repo"
SANDBOX_SUCCESSOR = SANDBOX / "successor_20260813"
COMPONENT = SANDBOX_SUCCESSOR / "r9_control_plane_stabilization_v1" / "iteration_012"
EVIDENCE = SANDBOX / "evidence"
RUN_ID = {
    "process-completion-prefix-reopen-invalid": "pf-completion-prefix-reopen-invalid",
    "process-same-root-reinvoke-zero-request": "pf-same-root-reinvoke",
    "process-root-eof-trailing-bytes": "pf-root-eof-trailing-bytes",
}[CASE_ID]
FAULT_ID = {
    "process-completion-prefix-reopen-invalid": "COMPLETION_PREFIX_REOPEN_INVALID",
    "process-same-root-reinvoke-zero-request": "SAME_ROOT_REINVOKE_ZERO_REQUEST",
    "process-root-eof-trailing-bytes": "ROOT_EOF_TRAILING_BYTES",
}[CASE_ID]

PARTS = {
    "semantic_bundle.json": ("11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2", 786546),
    "runner.py": ("3d773914f3be5eac06d73f7a4e27c25bfea212aa1baa9c399e06200211199469", 59507),
    "evidence_recorder.py": ("7f8ca2d19750a65ac71b711f13ed4fb1205eab0711b945463561a5f3f35a9e52", 39866),
    "offline_verifier.py": ("7cea3258b0928430b6064ae48c9a3b296ed024f196c972184b779f938279c569", 95000),
}
SHARED = {
    "r9_goal_operating_contract_v1.json": ("764dd27b3f472a90eef0f8493e63ac8fb349fe05a3a97dc4673a4a835e6e8dbd", 7024),
    "r9_subject_transport_addendum_subagent_invocations_v1.json": ("7b5186b3c9f244488a75695b34b0d06e79ee6b720acb934fc3767315c4b005d8", 5909),
    "r9_subject_transport_subagent_route_capability_receipt_v1.json": ("3d523eac087e691b2336a6ab878dbfe64b8359891831dc866641039f97f8646a", 4780),
}
SENTINEL = "PW_R9_ZERO_CREDIT_PROCESS_SENTINEL_V1"
ROOT_EOF_BYTE = b"X"
ROOT_EOF_SHA256 = "4b68ab3847feda7d6c62c1fbcbeebfa35eab7351ed5e78f4ddadea5df64b8015"
CALLS_ZERO = {"collaboration": 0, "model": 0, "network": 0, "provider": 0, "subject": 0}
CREDIT_ZERO = {"audit": 0, "candidate": 0, "empirical": 0, "qualification": 0, "release": 0}

PTRACE_TRACEME = 0
PTRACE_CONT = 7
PTRACE_SYSCALL = 24
PTRACE_SETOPTIONS = 0x4200
PTRACE_GET_SYSCALL_INFO = 0x420E
PTRACE_O_TRACESYSGOOD = 0x00000001
PTRACE_O_EXITKILL = 0x00100000
PTRACE_SYSCALL_INFO_ENTRY = 1
PTRACE_SYSCALL_INFO_EXIT = 2
AUDIT_READ_SYSCALLS = {
    0xC000003E: 0,   # AUDIT_ARCH_X86_64
    0xC00000B7: 63,  # AUDIT_ARCH_AARCH64
    0x40000003: 3,   # AUDIT_ARCH_I386
}


class SyscallEntry(ctypes.Structure):
    _fields_ = [("nr", ctypes.c_uint64), ("args", ctypes.c_uint64 * 6)]


class SyscallExit(ctypes.Structure):
    _fields_ = [("rval", ctypes.c_int64), ("is_error", ctypes.c_uint8), ("pad", ctypes.c_uint8 * 7)]


class SyscallData(ctypes.Union):
    _fields_ = [("entry", SyscallEntry), ("exit", SyscallExit), ("pad", ctypes.c_uint8 * 64)]


class SyscallInfo(ctypes.Structure):
    _fields_ = [
        ("op", ctypes.c_uint8),
        ("pad", ctypes.c_uint8 * 3),
        ("arch", ctypes.c_uint32),
        ("instruction_pointer", ctypes.c_uint64),
        ("stack_pointer", ctypes.c_uint64),
        ("data", SyscallData),
    ]


LIBC = ctypes.CDLL(None, use_errno=True)
LIBC.ptrace.restype = ctypes.c_long
LIBC.ptrace.argtypes = [ctypes.c_ulong, ctypes.c_ulong, ctypes.c_void_p, ctypes.c_void_p]


def canonical(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def exact_write(path: pathlib.Path, data: bytes) -> None:
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
    fd = os.open(path, flags, 0o644)
    try:
        view = memoryview(data)
        while view:
            count = os.write(fd, view)
            if count <= 0:
                raise RuntimeError(f"short write: {path}")
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    parent = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(parent)
    finally:
        os.close(parent)


def json_receipt(path: pathlib.Path, value: Any) -> None:
    exact_write(path, canonical(value) + b"\n")


def read_exact(path: pathlib.Path, expected: tuple[str, int]) -> bytes:
    info = path.lstat()
    if not stat.S_ISREG(info.st_mode) or stat.S_ISLNK(info.st_mode):
        raise RuntimeError(f"regular nonlink required: {path}")
    data = path.read_bytes()
    if (sha(data), len(data)) != expected:
        raise RuntimeError(f"frozen identity mismatch: {path}")
    return data


def run_git(*args: str, env: dict[str, str] | None = None) -> bytes:
    result = subprocess.run(
        ["git", "-C", str(SANDBOX), *args],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env,
        check=False,
        timeout=30,
    )
    if result.returncode:
        raise RuntimeError(f"git {' '.join(args)}: {result.stderr.decode('utf-8', 'replace')}")
    return result.stdout


def prepare_sandbox() -> dict[str, Any]:
    if SANDBOX.exists() or (CASE_DIR / "receipt.json").exists():
        raise RuntimeError("case sequence is create-only and has already been attempted")
    contract_data = BUILD_CONTRACT.read_bytes()
    contract = json.loads(contract_data)
    if contract.get("schema_id") != "pw-r9-iteration-012-four-part-build-contract-v1":
        raise RuntimeError("build contract schema mismatch")
    source_parts = {name: read_exact(SOURCE_COMPONENT / name, identity) for name, identity in PARTS.items()}
    source_shared = {name: read_exact(SOURCE_SUCCESSOR / name, identity) for name, identity in SHARED.items()}
    bundle = json.loads(source_parts["semantic_bundle.json"])
    canary_expected = [bundle["cells"][0]["expected_output_utf8"] for _ in bundle["routes"]]
    if len(canary_expected) != 3 or any(value == SENTINEL for value in canary_expected):
        raise RuntimeError("sentinel preflight failed")
    COMPONENT.mkdir(parents=True)
    EVIDENCE.mkdir()
    for name, data in source_parts.items():
        exact_write(COMPONENT / name, data)
    for name, data in source_shared.items():
        exact_write(SANDBOX_SUCCESSOR / name, data)
    subprocess.run(["git", "init", "-q", str(SANDBOX)], check=True, timeout=30)
    run_git("config", "user.name", "R9 Process Controller")
    run_git("config", "user.email", "r9-process-controller.invalid")
    tracked = [
        str(path.relative_to(SANDBOX))
        for path in [*(COMPONENT / name for name in PARTS), *(SANDBOX_SUCCESSOR / name for name in SHARED)]
    ]
    run_git("add", "--", *tracked)
    commit_env = dict(os.environ)
    commit_env.update({
        "GIT_AUTHOR_DATE": "2026-08-21T00:00:00Z",
        "GIT_COMMITTER_DATE": "2026-08-21T00:00:00Z",
        "LC_ALL": "C",
    })
    run_git("commit", "-q", "-m", "isolated iteration-012 process custody", env=commit_env)
    head = run_git("rev-parse", "HEAD").decode("ascii").strip()
    run_git("update-ref", "refs/remotes/origin/main", head)
    if run_git("status", "--porcelain=v1", "--untracked-files=all", "--", *tracked):
        raise RuntimeError("isolated custody is not scoped-clean")
    copied = {name: {"sha256": sha((COMPONENT / name).read_bytes()), "bytes": (COMPONENT / name).stat().st_size} for name in PARTS}
    return {
        "build_contract": {"sha256": sha(contract_data), "bytes": len(contract_data), "schema_id": contract["schema_id"]},
        "component_parts": copied,
        "git": {"head": head, "origin_main": head, "scoped_clean": True, "network_calls": 0},
        "sentinel": {"utf8": SENTINEL, "sha256": sha(SENTINEL.encode()), "bytes": len(SENTINEL.encode()), "differs_from_all_three_canary_oracles": True},
    }


def ptrace(request: int, pid: int, addr: int | ctypes.c_void_p = 0, data: int | ctypes.c_void_p = 0) -> int:
    ctypes.set_errno(0)
    addr_value = addr if isinstance(addr, ctypes.c_void_p) else ctypes.c_void_p(addr)
    data_value = data if isinstance(data, ctypes.c_void_p) else ctypes.c_void_p(data)
    result = LIBC.ptrace(request, pid, addr_value, data_value)
    if result == -1 and ctypes.get_errno():
        code = ctypes.get_errno()
        raise OSError(code, os.strerror(code))
    return int(result)


def syscall_info(pid: int) -> SyscallInfo:
    value = SyscallInfo()
    ctypes.set_errno(0)
    result = LIBC.ptrace(
        PTRACE_GET_SYSCALL_INFO,
        pid,
        ctypes.c_void_p(ctypes.sizeof(value)),
        ctypes.cast(ctypes.byref(value), ctypes.c_void_p),
    )
    if result <= 0:
        code = ctypes.get_errno()
        raise OSError(code or errno.ENOTSUP, "PTRACE_GET_SYSCALL_INFO unavailable")
    return value


def wait_child(pid: int, deadline: float) -> int:
    while True:
        found, status = os.waitpid(pid, os.WNOHANG)
        if found == pid:
            return status
        if time.monotonic() >= deadline:
            raise TimeoutError("timeout before declared ptrace boundary")
        time.sleep(0.001)


def drain(fd: int, target: bytearray) -> None:
    while True:
        try:
            part = os.read(fd, 65536)
        except BlockingIOError:
            return
        if not part:
            return
        target.extend(part)


def write_all(fd: int, data: bytes) -> None:
    view = memoryview(data)
    while view:
        count = os.write(fd, view)
        if count <= 0:
            raise RuntimeError("short controller pipe write")
        view = view[count:]


def receipt_for(request: dict[str, Any]) -> dict[str, Any]:
    path = request["expected_canonical_task_path"]
    return {
        "schema_id": "pw-r9-subagent-spawn-receipt-event-v1",
        "invocation_id": request["invocation_id"],
        "spawn_request_sha256": sha(canonical(request)),
        "tool_result": {"task_name": path},
        "returned_identity_kind": "canonical_task_path",
        "returned_canonical_task_path": path,
    }


def terminal_for(request: dict[str, Any]) -> dict[str, Any]:
    return {
        "schema_id": "pw-r9-subagent-terminal-delivery-event-v1",
        "invocation_id": request["invocation_id"],
        "returned_canonical_task_path": request["expected_canonical_task_path"],
        "message_type": "FINAL_ANSWER",
        "final_utf8": SENTINEL,
        "observed_activity": {
            "tool_calls": 0,
            "file_accesses": 0,
            "browsing": 0,
            "network_accesses": 0,
            "delegations": 0,
            "memory_accesses": 0,
            "followup_turns": 0,
            "nonterminal_messages": [],
            "observation_basis": "ROOT_VISIBLE_COLLABORATION_DELIVERIES",
        },
        "terminal_status": "FINAL_RETURNED",
    }


def parse_request(line: bytes, ordinal: int) -> dict[str, Any]:
    if not line.endswith(b"\n") or line.endswith(b"\n\n"):
        raise RuntimeError("spawn request line framing mismatch")
    value = json.loads(line[:-1])
    if canonical(value) != line[:-1]:
        raise RuntimeError("spawn request is not canonical")
    if value.get("schema_id") != "pw-r9-subagent-spawn-request-v1" or value.get("run_id") != RUN_ID:
        raise RuntimeError("spawn request binding mismatch")
    if value.get("ordinal") != ordinal or value.get("index") != ordinal or value.get("attempt_bytes", 0) <= 0:
        raise RuntimeError("spawn request sequence mismatch")
    return value


def traced_primary(kind: str) -> dict[str, Any]:
    stdin_r, stdin_w = os.pipe()
    stdout_r, stdout_w = os.pipe()
    stderr_r, stderr_w = os.pipe()
    pid = os.fork()
    if pid == 0:
        try:
            os.close(stdin_w)
            os.close(stdout_r)
            os.close(stderr_r)
            os.dup2(stdin_r, 0)
            os.dup2(stdout_w, 1)
            os.dup2(stderr_w, 2)
            for fd in (stdin_r, stdout_w, stderr_w):
                if fd > 2:
                    os.close(fd)
            ptrace(PTRACE_TRACEME, 0)
            environment = dict(os.environ)
            environment.update({"PW_R9_EVIDENCE_ROOT": str(EVIDENCE), "PYTHONDONTWRITEBYTECODE": "1", "LC_ALL": "C"})
            os.execve(sys.executable, [sys.executable, str(COMPONENT / "runner.py"), "run-canary", "--run-root", RUN_ID], environment)
        except BaseException as exc:
            os.write(2, f"child setup failed:{type(exc).__name__}:{exc}\n".encode())
            os._exit(127)
    os.close(stdin_r)
    os.close(stdout_w)
    os.close(stderr_w)
    os.set_blocking(stdout_r, False)
    os.set_blocking(stderr_r, False)
    stdout_all = bytearray()
    stderr_all = bytearray()
    stdout_pending = bytearray()
    stdin_all = bytearray()
    requests: list[dict[str, Any]] = []
    events_written = 0
    completed_pairs = 0
    pending_read_stage: str | None = None
    root_eof_injected = False
    deadline = time.monotonic() + 90
    trace_path = CASE_DIR / "ptrace.trace.jsonl"
    trace_file = os.fdopen(os.open(trace_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o644), "wb", buffering=0)

    def trace(event: dict[str, Any]) -> None:
        event = {"sequence": trace.counter, "traced_child_pid": pid, **event}
        trace.counter += 1
        trace_file.write(canonical(event) + b"\n")
    trace.counter = 0

    def collect() -> None:
        before = len(stdout_all)
        drain(stdout_r, stdout_all)
        if len(stdout_all) > before:
            stdout_pending.extend(stdout_all[before:])
        drain(stderr_r, stderr_all)

    killed = False
    exit_status: dict[str, Any] | None = None
    try:
        status = wait_child(pid, deadline)
        if not os.WIFSTOPPED(status) or os.WSTOPSIG(status) != signal.SIGTRAP:
            raise RuntimeError(f"missing exec ptrace stop: {status}")
        ptrace(PTRACE_SETOPTIONS, pid, 0, PTRACE_O_TRACESYSGOOD | PTRACE_O_EXITKILL)
        trace({"event": "exec_stop", "signal": signal.SIGTRAP, "child_only": True})
        ptrace(PTRACE_SYSCALL, pid)
        while True:
            status = wait_child(pid, deadline)
            collect()
            if os.WIFEXITED(status):
                exit_status = {"kind": "EXITED", "returncode": os.WEXITSTATUS(status)}
                trace({"event": "process_exit", **exit_status})
                break
            if os.WIFSIGNALED(status):
                exit_status = {"kind": "SIGNALED", "signal": os.WTERMSIG(status), "subprocess_returncode": -os.WTERMSIG(status)}
                trace({"event": "process_exit", **exit_status})
                break
            if not os.WIFSTOPPED(status):
                raise RuntimeError(f"unexpected wait status: {status}")
            stop_signal = os.WSTOPSIG(status)
            if stop_signal != (signal.SIGTRAP | 0x80):
                trace({"event": "signal_delivery_stop", "signal": stop_signal})
                if stop_signal == signal.SIGTRAP:
                    raise RuntimeError("unexpected plain SIGTRAP after exec")
                ptrace(PTRACE_SYSCALL, pid, 0, stop_signal)
                continue
            info = syscall_info(pid)
            if info.op == PTRACE_SYSCALL_INFO_ENTRY:
                read_nr = AUDIT_READ_SYSCALLS.get(info.arch)
                if read_nr is None:
                    raise RuntimeError(f"unsupported syscall ABI:0x{info.arch:08x}")
                if info.data.entry.nr == read_nr and info.data.entry.args[0] == 0:
                    collect()
                    if pending_read_stage is not None:
                        raise RuntimeError("nested stdin read entry")
                    if kind == "hard_loss" and events_written == 0:
                        stage = "row-000-spawn-receipt"
                    elif events_written < 6:
                        stage = f"row-{events_written // 2:03d}-" + ("spawn-receipt" if events_written % 2 == 0 else "terminal-delivery")
                    elif kind == "root_eof" and root_eof_injected:
                        stage = "require-eof-after-injection"
                    else:
                        stage = "require-eof"
                    pending_read_stage = stage
                    trace({
                        "event": "stdin_read_entry",
                        "stage": stage,
                        "arch": f"0x{info.arch:08x}",
                        "syscall_nr": int(info.data.entry.nr),
                        "fd": int(info.data.entry.args[0]),
                        "count": int(info.data.entry.args[2]),
                        "instruction_pointer": int(info.instruction_pointer),
                    })
                    if stage.endswith("spawn-receipt"):
                        if b"\n" not in stdout_pending:
                            raise RuntimeError("request unavailable at receipt read barrier")
                        end = stdout_pending.index(10) + 1
                        line = bytes(stdout_pending[:end])
                        del stdout_pending[:end]
                        request = parse_request(line, len(requests))
                        requests.append(request)
                        if kind == "hard_loss":
                            os.kill(pid, signal.SIGKILL)
                            killed = True
                            trace({"event": "inject_sigkill", "stage": stage, "stdin_events_written": 0})
                            continue
                        event = canonical(receipt_for(request)) + b"\n"
                        write_all(stdin_w, event)
                        stdin_all.extend(event)
                        events_written += 1
                        trace({"event": "write_root_event", "stage": stage, "sha256": sha(event), "bytes": len(event)})
                    elif stage.endswith("terminal-delivery"):
                        request = requests[-1]
                        event = canonical(terminal_for(request)) + b"\n"
                        write_all(stdin_w, event)
                        stdin_all.extend(event)
                        events_written += 1
                        completed_pairs += 1
                        trace({"event": "write_root_event", "stage": stage, "sha256": sha(event), "bytes": len(event)})
                    elif stage == "require-eof":
                        if completed_pairs != 3 or len(requests) != 3 or events_written != 6:
                            raise RuntimeError("require-EOF boundary reached before three complete protocol pairs")
                        if kind == "completion_kill":
                            os.kill(pid, signal.SIGKILL)
                            killed = True
                            trace({"event": "inject_sigkill", "stage": stage, "after_completed_rows": 3, "before_seal": True})
                            continue
                        if kind == "root_eof":
                            write_all(stdin_w, ROOT_EOF_BYTE)
                            stdin_all.extend(ROOT_EOF_BYTE)
                            os.close(stdin_w)
                            stdin_w = -1
                            root_eof_injected = True
                            trace({"event": "inject_root_eof_bytes_and_close", "stage": stage, "hex": "58", "sha256": ROOT_EOF_SHA256, "bytes": 1})
                        else:
                            raise RuntimeError(f"unexpected traced kind: {kind}")
                    elif stage == "require-eof-after-injection":
                        trace({"event": "resume_root_eof_drain", "stage": stage, "additional_bytes_written": 0})
            elif info.op == PTRACE_SYSCALL_INFO_EXIT and pending_read_stage is not None:
                trace({"event": "stdin_read_exit", "stage": pending_read_stage, "return_value": int(info.data.exit.rval), "is_error": bool(info.data.exit.is_error)})
                pending_read_stage = None
            ptrace(PTRACE_SYSCALL, pid)
        collect()
        if killed and (exit_status != {"kind": "SIGNALED", "signal": signal.SIGKILL, "subprocess_returncode": -signal.SIGKILL}):
            raise RuntimeError(f"SIGKILL status mismatch: {exit_status}")
    except BaseException:
        try:
            os.kill(pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        try:
            os.waitpid(pid, 0)
        except ChildProcessError:
            pass
        raise
    finally:
        trace_file.flush()
        os.fsync(trace_file.fileno())
        trace_file.close()
        if stdin_w >= 0:
            os.close(stdin_w)
        os.close(stdout_r)
        os.close(stderr_r)
    exact_write(CASE_DIR / "primary.stdin.bin", bytes(stdin_all))
    exact_write(CASE_DIR / "primary.stdout.bin", bytes(stdout_all))
    exact_write(CASE_DIR / "primary.stderr.bin", bytes(stderr_all))
    return {
        "pid": pid,
        "exit": exit_status,
        "spawn_requests": len(requests),
        "root_events_written": events_written,
        "completed_protocol_pairs": completed_pairs,
        "stdin": {"sha256": sha(bytes(stdin_all)), "bytes": len(stdin_all)},
        "stdout": {"sha256": sha(bytes(stdout_all)), "bytes": len(stdout_all)},
        "stderr": {"sha256": sha(bytes(stderr_all)), "bytes": len(stderr_all)},
    }


def inventory(root: pathlib.Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in [root, *sorted(root.rglob("*"), key=lambda item: item.relative_to(root).as_posix())]:
        info = path.lstat()
        relative = "." if path == root else path.relative_to(root).as_posix()
        if stat.S_ISDIR(info.st_mode):
            kind = "directory"
        elif stat.S_ISREG(info.st_mode):
            kind = "regular"
        elif stat.S_ISLNK(info.st_mode):
            kind = "symlink"
        else:
            kind = "other"
        row = {
            "relative_path": relative,
            "entry_type": kind,
            "device": info.st_dev,
            "inode": info.st_ino,
            "mode": stat.S_IMODE(info.st_mode),
            "nlink": info.st_nlink,
            "size": info.st_size,
            "mtime_ns": info.st_mtime_ns,
            "ctime_ns": info.st_ctime_ns,
        }
        if kind == "regular":
            row["sha256"] = sha(path.read_bytes())
        rows.append(row)
    return rows


def public_process(label: str, command: list[str]) -> dict[str, Any]:
    environment = dict(os.environ)
    environment.update({"PW_R9_EVIDENCE_ROOT": str(EVIDENCE), "PYTHONDONTWRITEBYTECODE": "1", "LC_ALL": "C"})
    result = subprocess.run(command, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=environment, check=False, timeout=90)
    exact_write(CASE_DIR / f"{label}.stdout.bin", result.stdout)
    exact_write(CASE_DIR / f"{label}.stderr.bin", result.stderr)
    process = {
        "label": label,
        "returncode": result.returncode,
        "stdout": {"sha256": sha(result.stdout), "bytes": len(result.stdout)},
        "stderr": {"sha256": sha(result.stderr), "bytes": len(result.stderr)},
    }
    json_receipt(CASE_DIR / f"{label}.process.json", process)
    return {**process, "stdout_raw": result.stdout, "stderr_raw": result.stderr}


def reopen_twice() -> dict[str, Any]:
    command = [sys.executable, str(COMPONENT / "runner.py"), "reopen", "--run-root", RUN_ID]
    before = inventory(EVIDENCE)
    json_receipt(CASE_DIR / "evidence.before-reopen-1.inventory.json", before)
    first = public_process("reopen-1", command)
    after_first = inventory(EVIDENCE)
    json_receipt(CASE_DIR / "evidence.after-reopen-1.inventory.json", after_first)
    second = public_process("reopen-2", command)
    after_second = inventory(EVIDENCE)
    json_receipt(CASE_DIR / "evidence.after-reopen-2.inventory.json", after_second)
    if before != after_first or before != after_second:
        raise RuntimeError("public reopen mutated the evidence tree")
    if first["returncode"] != second["returncode"] or first["stdout_raw"] != second["stdout_raw"] or first["stderr_raw"] != second["stderr_raw"]:
        raise RuntimeError("public reopen results are unstable")
    return {
        "count": 2,
        "returncode": first["returncode"],
        "stdout_sha256": first["stdout"]["sha256"],
        "stdout_bytes": first["stdout"]["bytes"],
        "stderr_sha256": first["stderr"]["sha256"],
        "stderr_bytes": first["stderr"]["bytes"],
        "evidence_inventory_identical": True,
        "stdout_identical": True,
        "returncode_identical": True,
    }


def load_json_line(data: bytes) -> dict[str, Any]:
    if not data.endswith(b"\n") or data.endswith(b"\n\n") or b"\n" in data[:-1]:
        raise RuntimeError("expected exactly one canonical JSON line")
    value = json.loads(data[:-1])
    if canonical(value) != data[:-1]:
        raise RuntimeError("noncanonical JSON line")
    return value


def row_inventory() -> dict[str, list[str]]:
    root = EVIDENCE / RUN_ID / "rows"
    result: dict[str, list[str]] = {}
    if root.exists():
        for row in sorted(root.iterdir()):
            result[row.name] = sorted(item.name for item in row.iterdir())
    return result


def validate_unsealed_reopen(reopens: dict[str, Any]) -> None:
    if reopens["returncode"] != 2:
        raise RuntimeError("unsealed reopen rc mismatch")
    value = load_json_line((CASE_DIR / "reopen-1.stdout.bin").read_bytes())
    expected = {
        "schema_id": "pw-r9-runner-error-v1",
        "status": "CONTROLLER_INVALID",
        "error_type": "_Invalid",
        "error": "matrix terminal: missing",
    }
    if value != expected:
        raise RuntimeError(f"unsealed reopen projection mismatch: {value}")


def validate_root_eof(primary: dict[str, Any], reopens: dict[str, Any]) -> dict[str, Any]:
    if primary["exit"] != {"kind": "EXITED", "returncode": 2}:
        raise RuntimeError("ROOT_EOF primary rc mismatch")
    stdout = (CASE_DIR / "primary.stdout.bin").read_bytes()
    lines = stdout.splitlines(keepends=True)
    if len(lines) != 4:
        raise RuntimeError(f"ROOT_EOF stdout line count mismatch: {len(lines)}")
    terminal = load_json_line(lines[-1])
    if terminal.get("schema_id") != "pw-r9-reopen-result-v4" or terminal.get("status") != "CONTROLLER_INVALID" or terminal.get("matrix_status") != "CONTROLLER_INVALID":
        raise RuntimeError("ROOT_EOF terminal projection mismatch")
    report = terminal.get("offline_verifier")
    if not isinstance(report, dict) or report.get("valid") is not True or report.get("credit", {}).get("qualification_clean_run_credit") != 0:
        raise RuntimeError("ROOT_EOF verifier projection mismatch")
    matrix = json.loads((EVIDENCE / RUN_ID / "matrix_terminal.json").read_text("utf-8"))
    expected_detail = f"ROOT_EOF_INVALID:_Invalid:trailing root bytes:1:{ROOT_EOF_SHA256}"
    if matrix.get("cause") != {"kind": "CONTROLLER_INVALID", "detail": expected_detail}:
        raise RuntimeError(f"ROOT_EOF cause mismatch: {matrix.get('cause')}")
    if reopens["returncode"] != 2:
        raise RuntimeError("ROOT_EOF reopen rc mismatch")
    reopened = load_json_line((CASE_DIR / "reopen-1.stdout.bin").read_bytes())
    if reopened != terminal:
        raise RuntimeError("ROOT_EOF public reopen differs from primary terminal")
    return {"cause": matrix["cause"], "offline_verifier_valid": True, "qualification_clean_run_credit": 0}


def main() -> int:
    CASE_DIR.mkdir(parents=True, exist_ok=True)
    sequence = {
        "schema_id": "pw-r9-process-fault-predeclared-sequence-v1",
        "case_id": CASE_ID,
        "fault_id": FAULT_ID,
        "run_id": RUN_ID,
        "retry_count": 0,
        "relaunch_count": 0,
        "replacement_count": 0,
        "best_of": False,
        "processes": (
            ["killed-prefix-create", "same-root-second-create", "public-reopen-1", "public-reopen-2"]
            if CASE_ID == "process-same-root-reinvoke-zero-request"
            else ["fault-injected-primary", "public-reopen-1", "public-reopen-2"]
        ),
    }
    json_receipt(CASE_DIR / "sequence.json", sequence)
    preflight = prepare_sandbox()
    preflight.update({
        "schema_id": "pw-r9-process-fault-preflight-v1",
        "case_id": CASE_ID,
        "fault_id": FAULT_ID,
        "platform": {"system": platform.system(), "machine": platform.machine(), "linux_required": True},
        "ptrace": {"mechanism": "PTRACE_TRACEME+PTRACE_GET_SYSCALL_INFO", "direct_child_only": True, "fail_closed": True},
        "calls": CALLS_ZERO,
        "credit": CREDIT_ZERO,
        "sequence_sha256": sha((CASE_DIR / "sequence.json").read_bytes()),
    })
    if platform.system() != "Linux":
        raise RuntimeError("Linux required")
    json_receipt(CASE_DIR / "preflight.json", preflight)

    case_specific: dict[str, Any]
    if CASE_ID == "process-completion-prefix-reopen-invalid":
        primary = traced_primary("completion_kill")
        expected_files = ["attempt.json", "completion.json", "provider_input.txt", "raw_result.json", "spawn_message.txt", "spawn_receipt.json"]
        rows = row_inventory()
        if primary["exit"] != {"kind": "SIGNALED", "signal": signal.SIGKILL, "subprocess_returncode": -signal.SIGKILL} or primary["spawn_requests"] != 3 or primary["root_events_written"] != 6 or primary["completed_protocol_pairs"] != 3:
            raise RuntimeError("completion-prefix primary mechanics mismatch")
        if rows != {f"row-{index:03d}": expected_files for index in range(3)}:
            raise RuntimeError(f"completion-prefix row inventory mismatch: {rows}")
        if (EVIDENCE / RUN_ID / "matrix_terminal.json").exists() or (EVIDENCE / RUN_ID / "accounting.json").exists():
            raise RuntimeError("completion-prefix unexpectedly sealed")
        reopens = reopen_twice()
        validate_unsealed_reopen(reopens)
        case_specific = {"primary": primary, "rows": rows, "sealed": False, "reopens": reopens}
    elif CASE_ID == "process-same-root-reinvoke-zero-request":
        primary = traced_primary("hard_loss")
        rows = row_inventory()
        expected = {"row-000": ["attempt.json", "provider_input.txt", "spawn_message.txt"]}
        if primary["exit"] != {"kind": "SIGNALED", "signal": signal.SIGKILL, "subprocess_returncode": -signal.SIGKILL} or primary["spawn_requests"] != 1 or primary["root_events_written"] != 0 or rows != expected:
            raise RuntimeError(f"hard-loss prefix mismatch: {primary} {rows}")
        before_second = inventory(EVIDENCE)
        json_receipt(CASE_DIR / "evidence.before-second-create.inventory.json", before_second)
        command = [sys.executable, str(COMPONENT / "runner.py"), "run-canary", "--run-root", RUN_ID]
        second = public_process("same-root-second-create", command)
        after_second = inventory(EVIDENCE)
        json_receipt(CASE_DIR / "evidence.after-second-create.inventory.json", after_second)
        if before_second != after_second:
            raise RuntimeError("same-root second create mutated killed prefix")
        second_value = load_json_line(second["stdout_raw"])
        if second["returncode"] != 2 or second_value != {"schema_id": "pw-r9-runner-error-v1", "status": "CONTROLLER_INVALID", "error_type": "_Invalid", "error": "x"}:
            raise RuntimeError(f"same-root second create projection mismatch: {second_value}")
        if b"pw-r9-subagent-spawn-request-v1" in second["stdout_raw"]:
            raise RuntimeError("same-root second create emitted a request")
        reopens = reopen_twice()
        validate_unsealed_reopen(reopens)
        case_specific = {
            "first_process": primary,
            "second_process": {key: value for key, value in second.items() if not key.endswith("_raw")},
            "second_process_spawn_requests": 0,
            "tree_identical_after_second_process": True,
            "rows": rows,
            "reopens": reopens,
        }
    else:
        primary = traced_primary("root_eof")
        expected_files = ["attempt.json", "completion.json", "provider_input.txt", "raw_result.json", "spawn_message.txt", "spawn_receipt.json"]
        rows = row_inventory()
        if primary["spawn_requests"] != 3 or primary["root_events_written"] != 6 or primary["completed_protocol_pairs"] != 3 or rows != {f"row-{index:03d}": expected_files for index in range(3)}:
            raise RuntimeError("ROOT_EOF completed-prefix mismatch")
        reopens = reopen_twice()
        root_eof = validate_root_eof(primary, reopens)
        case_specific = {"primary": primary, "rows": rows, "sealed": True, "root_eof": root_eof, "reopens": reopens}

    receipt = {
        "schema_id": "pw-r9-process-fault-case-receipt-v1",
        "status": "PASS",
        "case_id": CASE_ID,
        "fault_id": FAULT_ID,
        "run_id": RUN_ID,
        "authority": {"candidate_mint": False, "formal_audit": False, "freeze": False, "goal_completion": False, "qualification_claim": False, "release": False, "value": 0},
        "calls": CALLS_ZERO,
        "credit": CREDIT_ZERO,
        "component_parts": preflight["component_parts"],
        "custody": preflight["git"],
        "predeclared_sequence": sequence["processes"],
        "retry_count": 0,
        "relaunch_count": 0,
        "replacement_count": 0,
        "best_of": False,
        "public_reopens": 2,
        "ptrace": {"direct_child_only": True, "barrier": "PTRACE_GET_SYSCALL_INFO read(fd=0) syscall entry", "trace_file": "ptrace.trace.jsonl", "fail_closed": True},
        "case_result": case_specific,
        "nonclaims": ["mechanical protocol stimulus only", "zero empirical or qualification credit", "not a candidate audit freeze release or goal-completion receipt"],
    }
    json_receipt(CASE_DIR / "receipt.json", receipt)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        failure = {
            "schema_id": "pw-r9-process-fault-controller-failure-v1",
            "status": "CONTROLLER_INVALID",
            "case_id": CASE_ID,
            "fault_id": FAULT_ID,
            "error_type": type(exc).__name__,
            "error": str(exc),
            "calls": CALLS_ZERO,
            "credit": CREDIT_ZERO,
        }
        path = CASE_DIR / "controller-failure.json"
        if not path.exists():
            json_receipt(path, failure)
        raise
