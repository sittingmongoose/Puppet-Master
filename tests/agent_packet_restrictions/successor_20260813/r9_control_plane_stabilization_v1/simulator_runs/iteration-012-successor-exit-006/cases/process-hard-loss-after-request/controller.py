#!/usr/bin/env python3
from __future__ import annotations

import base64
import ctypes
import errno
import fcntl
import hashlib
import json
import os
import pathlib
import signal
import stat
import struct
import subprocess
import sys
import time
from typing import Any


CASE_NAME = "process-hard-loss-after-request"
CASE_ID = "process-hard-loss-after-request-exit006"
FAULT_ID = "HARD_LOSS_AFTER_REQUEST"
RUN_ID = "process-hard-loss-after-request-exit006"
EXPECTED_PREFIX = ["attempt.json", "provider_input.txt", "spawn_message.txt"]
EXPECTED_REOPEN_ERROR = {
    "error": "matrix terminal: missing",
    "error_type": "_Invalid",
    "schema_id": "pw-r9-runner-error-v1",
    "status": "CONTROLLER_INVALID",
}
SOURCE_SUCCESSOR = pathlib.Path("/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813")
SOURCE_COMPONENT = SOURCE_SUCCESSOR / "r9_control_plane_stabilization_v1" / "iteration_012"
COMPONENT_REL = pathlib.Path("r9_control_plane_stabilization_v1/iteration_012")
PARTS = (
    ("evidence_recorder.py", "APPEND_ONLY_EVIDENCE_RECORDER", "7f8ca2d19750a65ac71b711f13ed4fb1205eab0711b945463561a5f3f35a9e52", 39866),
    ("semantic_bundle.json", "IMMUTABLE_SEMANTIC_BUNDLE", "11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2", 786546),
    ("offline_verifier.py", "OFFLINE_VERIFIER", "7cea3258b0928430b6064ae48c9a3b296ed024f196c972184b779f938279c569", 95000),
    ("runner.py", "PROCESS_RUNNER", "3d773914f3be5eac06d73f7a4e27c25bfea212aa1baa9c399e06200211199469", 59507),
)
SHARED = (
    ("r9_goal_operating_contract_v1.json", "764dd27b3f472a90eef0f8493e63ac8fb349fe05a3a97dc4673a4a835e6e8dbd", 7024),
    ("r9_subject_transport_addendum_subagent_invocations_v1.json", "7b5186b3c9f244488a75695b34b0d06e79ee6b720acb934fc3767315c4b005d8", 5909),
    ("r9_subject_transport_subagent_route_capability_receipt_v1.json", "3d523eac087e691b2336a6ab878dbfe64b8359891831dc866641039f97f8646a", 4780),
)
EXPECTED_IDENTITY = {
    "schema_id": "pw-r9-four-part-component-identity-v1",
    "part_count": 4,
    "aggregate_file_bytes": 980919,
    "rows_sha256": "87613ab41965d2bfb50665320bbacc5d13c45a7c6606b97f22ed260208500f2c",
    "rows_bytes": 494,
    "parts": [{"role": role, "sha256": digest, "bytes": size} for _, role, digest, size in PARTS],
}
PTRACE_TRACEME = 0
PTRACE_CONT = 7
PTRACE_SYSCALL = 24
PTRACE_SETOPTIONS = 0x4200
PTRACE_GET_SYSCALL_INFO = 0x420E
PTRACE_O_TRACESYSGOOD = 0x00000001
PTRACE_O_EXITKILL = 0x00100000
AUDIT_ARCH_X86_64 = 0xC000003E
SYSCALL_INFO_ENTRY = 1
SYSCALL_INFO_EXIT = 2
SYS_READ = 0
SYS_PIDFD_SEND_SIGNAL = 424
DEADLINE_SECONDS = 120.0


class ControllerFailure(RuntimeError):
    pass


def canon(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def receipt_safe(value: Any) -> Any:
    if isinstance(value, bytes):
        return {"sha256": sha256(value), "bytes": len(value), "base64": base64.b64encode(value).decode("ascii")}
    if isinstance(value, list):
        return [receipt_safe(item) for item in value]
    if isinstance(value, tuple):
        return [receipt_safe(item) for item in value]
    if isinstance(value, dict):
        return {str(key): receipt_safe(item) for key, item in value.items()}
    return value


def fsync_dir(path: pathlib.Path) -> None:
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0))
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def mkdir_new(path: pathlib.Path) -> None:
    path.mkdir(mode=0o755)
    fsync_dir(path)
    fsync_dir(path.parent)


def open_new(path: pathlib.Path, mode: int = 0o600) -> int:
    return os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0), mode)


def write_all(fd: int, data: bytes) -> None:
    view = memoryview(data)
    while view:
        count = os.write(fd, view)
        if count <= 0:
            raise ControllerFailure("short write")
        view = view[count:]


def close_capture(fd: int, path: pathlib.Path) -> None:
    os.fsync(fd)
    os.fchmod(fd, 0o444)
    os.close(fd)
    fsync_dir(path.parent)


def write_new(path: pathlib.Path, data: bytes, mode: int = 0o444) -> None:
    fd = open_new(path)
    try:
        write_all(fd, data)
        os.fsync(fd)
        os.fchmod(fd, mode)
    finally:
        os.close(fd)
    fsync_dir(path.parent)


def write_json(path: pathlib.Path, value: Any) -> None:
    write_new(path, canon(value) + b"\n")


def parse_canonical_line(raw: bytes) -> dict[str, Any]:
    if not raw.endswith(b"\n") or raw.endswith(b"\n\n") or b"\r" in raw or b"\n" in raw[:-1]:
        raise ControllerFailure("not an exact one-LF object line")
    value = json.loads(raw[:-1].decode("utf-8"))
    if not isinstance(value, dict) or canon(value) != raw[:-1]:
        raise ControllerFailure("not a canonical object line")
    return value


def read_bound(path: pathlib.Path, digest: str, size: int) -> bytes:
    info = os.lstat(path)
    if stat.S_ISLNK(info.st_mode) or not stat.S_ISREG(info.st_mode):
        raise ControllerFailure(f"bound source type mismatch:{path}")
    data = path.read_bytes()
    if (sha256(data), len(data)) != (digest, size):
        raise ControllerFailure(f"bound source bytes mismatch:{path.name}")
    return data


def run_git(repo: pathlib.Path, args: list[str], extra_env: dict[str, str] | None = None) -> bytes:
    env = dict(os.environ)
    env.update({"GIT_CONFIG_NOSYSTEM": "1", "GIT_CONFIG_GLOBAL": "/dev/null", "LC_ALL": "C"})
    if extra_env:
        env.update(extra_env)
    result = subprocess.run(["git", "-C", os.fspath(repo), *args], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env, timeout=30, check=False)
    if result.returncode != 0:
        raise ControllerFailure(f"git {' '.join(args)} failed:{result.stderr.decode('utf-8', 'replace')}")
    return result.stdout


def setup_isolated_repo(case_dir: pathlib.Path, capture: pathlib.Path) -> tuple[pathlib.Path, pathlib.Path, pathlib.Path, str]:
    repo = case_dir / "isolated-repo"
    mkdir_new(repo)
    component = repo / COMPONENT_REL
    component.parent.mkdir(parents=True, mode=0o755)
    component.mkdir(mode=0o755)
    copied = []
    for name, role, digest, size in PARTS:
        data = read_bound(SOURCE_COMPONENT / name, digest, size)
        destination = component / name
        write_new(destination, data, 0o644)
        copied.append({"path": destination.relative_to(repo).as_posix(), "role": role, "sha256": digest, "bytes": size})
    for name, digest, size in SHARED:
        data = read_bound(SOURCE_SUCCESSOR / name, digest, size)
        write_new(repo / name, data, 0o644)
        copied.append({"path": name, "role": "SHARED_AUTHORITY", "sha256": digest, "bytes": size})
    initialized = subprocess.run(
        ["git", "init", "--initial-branch=main", os.fspath(repo)], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        env={**os.environ, "GIT_CONFIG_NOSYSTEM": "1", "GIT_CONFIG_GLOBAL": "/dev/null", "LC_ALL": "C"}, timeout=30, check=False,
    )
    if initialized.returncode != 0:
        raise ControllerFailure(f"git init failed:{initialized.stderr.decode('utf-8', 'replace')}")
    tracked = [(COMPONENT_REL / item[0]).as_posix() for item in PARTS] + [item[0] for item in SHARED]
    run_git(repo, ["add", "--", *tracked])
    identity_env = {
        "GIT_AUTHOR_NAME": "PW R9 Process Controller", "GIT_AUTHOR_EMAIL": "pw-r9-process@example.invalid",
        "GIT_COMMITTER_NAME": "PW R9 Process Controller", "GIT_COMMITTER_EMAIL": "pw-r9-process@example.invalid",
        "GIT_AUTHOR_DATE": "2000-01-01T00:00:00Z", "GIT_COMMITTER_DATE": "2000-01-01T00:00:00Z",
    }
    run_git(repo, ["commit", "--no-gpg-sign", "-m", "exact current iteration_012 process fixture"], identity_env)
    head = run_git(repo, ["rev-parse", "HEAD"]).decode("ascii").strip()
    run_git(repo, ["update-ref", "refs/remotes/origin/main", head])
    if run_git(repo, ["status", "--porcelain=v1", "--untracked-files=all"]):
        raise ControllerFailure("isolated repository is not tracked-clean")
    evidence = case_dir / "evidence"
    mkdir_new(evidence)
    write_json(capture / "preflight.json", {
        "schema_id": "pw-r9-process-case-preflight-v1", "case": CASE_ID, "fault_id": FAULT_ID,
        "component_identity": EXPECTED_IDENTITY, "copied": copied,
        "git": {"head": head, "origin_main": head, "scoped_clean": True, "network_calls": 0},
        "evidence_root": os.fspath(evidence.resolve()), "primary_launch_limit": 1, "qualification_credit": 0,
    })
    return repo, component, evidence, head


def entry_type(mode: int) -> str:
    if stat.S_ISREG(mode):
        return "regular"
    if stat.S_ISDIR(mode):
        return "directory"
    if stat.S_ISLNK(mode):
        return "symlink"
    return "other"


def inventory(root: pathlib.Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    pending = [root]
    while pending:
        path = pending.pop()
        info = os.lstat(path)
        kind = entry_type(info.st_mode)
        row: dict[str, Any] = {
            "relative_path": "." if path == root else path.relative_to(root).as_posix(), "entry_type": kind,
            "device": info.st_dev, "inode": info.st_ino, "mode": info.st_mode, "nlink": info.st_nlink,
            "size": info.st_size, "mtime_ns": info.st_mtime_ns, "ctime_ns": info.st_ctime_ns,
        }
        if kind == "regular":
            row["sha256_for_regular_files"] = sha256(path.read_bytes())
        elif kind == "symlink":
            row["link_target"] = os.readlink(path)
        rows.append(row)
        if kind == "directory":
            pending.extend(sorted(path.iterdir(), key=lambda item: item.name, reverse=True))
    rows.sort(key=lambda item: item["relative_path"])
    return rows


LIBC = ctypes.CDLL(None, use_errno=True)
LIBC.ptrace.restype = ctypes.c_long
LIBC.syscall.restype = ctypes.c_long


def ptrace(request: int, pid: int, addr: int = 0, data: int = 0) -> int:
    ctypes.set_errno(0)
    result = LIBC.ptrace(ctypes.c_ulong(request), ctypes.c_ulong(pid), ctypes.c_void_p(addr), ctypes.c_void_p(data))
    saved = ctypes.get_errno()
    if result == -1 and saved:
        raise ControllerFailure(f"ptrace {request:#x} failed:{os.strerror(saved)}")
    return int(result)


def pidfd_send_signal(pidfd: int, signum: int) -> int:
    ctypes.set_errno(0)
    result = LIBC.syscall(ctypes.c_long(SYS_PIDFD_SEND_SIGNAL), ctypes.c_int(pidfd), ctypes.c_int(signum), ctypes.c_void_p(0), ctypes.c_uint(0))
    saved = ctypes.get_errno()
    if result == -1:
        raise ControllerFailure(f"pidfd_send_signal failed:{os.strerror(saved)}")
    return int(result)


def ptrace_continue_after_sigkill(pid: int) -> dict[str, Any]:
    ctypes.set_errno(0)
    result = LIBC.ptrace(ctypes.c_ulong(PTRACE_CONT), ctypes.c_ulong(pid), ctypes.c_void_p(0), ctypes.c_void_p(0))
    saved = ctypes.get_errno()
    if result != -1:
        saved = 0
    return {"result": int(result), "errno": saved, "errno_name": errno.errorcode.get(saved) if saved else None}


class Tracee:
    def __init__(self, component: pathlib.Path, repo: pathlib.Path, evidence: pathlib.Path, capture: pathlib.Path):
        self.component, self.repo, self.evidence, self.capture = component, repo, evidence, capture
        self.deadline = time.monotonic() + DEADLINE_SECONDS
        self.sequence = 0
        self.stdout = bytearray()
        self.stderr = bytearray()
        self.alive = False
        self.final_wait_status: int | None = None
        self.pidfd = self.in_write = self.out_read = self.err_read = -1
        self.out_path, self.err_path, self.in_path, self.syscalls_path = (capture / "primary.stdout.bin", capture / "primary.stderr.bin", capture / "primary.stdin.bin", capture / "syscalls.jsonl")
        self.out_fd, self.err_fd, self.in_fd, self.syscalls_fd = (open_new(self.out_path), open_new(self.err_path), open_new(self.in_path), open_new(self.syscalls_path))

    def log(self, value: dict[str, Any], durable: bool = False) -> None:
        write_all(self.syscalls_fd, canon(value) + b"\n")
        if durable:
            os.fsync(self.syscalls_fd)

    def launch(self) -> dict[str, Any]:
        in_read, self.in_write = os.pipe2(os.O_CLOEXEC)
        self.out_read, out_write = os.pipe2(os.O_CLOEXEC)
        self.err_read, err_write = os.pipe2(os.O_CLOEXEC)
        pid = os.fork()
        if pid == 0:
            try:
                os.dup2(in_read, 0); os.dup2(out_write, 1); os.dup2(err_write, 2)
                for fd in {in_read, self.in_write, self.out_read, out_write, self.err_read, err_write}:
                    if fd > 2:
                        os.close(fd)
                ctypes.set_errno(0)
                if LIBC.ptrace(ctypes.c_ulong(PTRACE_TRACEME), ctypes.c_ulong(0), ctypes.c_void_p(0), ctypes.c_void_p(0)) == -1:
                    os.write(2, f"PTRACE_TRACEME:{os.strerror(ctypes.get_errno())}\n".encode()); os._exit(126)
                os.kill(os.getpid(), signal.SIGSTOP)
                env = dict(os.environ)
                env.update({"PW_R9_EVIDENCE_ROOT": os.fspath(self.evidence.resolve()), "PYTHONDONTWRITEBYTECODE": "1", "LC_ALL": "C"})
                os.chdir(self.repo)
                command = [sys.executable, os.fspath(self.component / "runner.py"), "run-canary", "--run-root", os.fspath((self.evidence / RUN_ID).resolve())]
                os.execve(sys.executable, command, env)
            except BaseException as exc:
                os.write(2, f"child setup failure:{type(exc).__name__}:{exc}\n".encode("utf-8", "replace")); os._exit(127)
        self.pid, self.alive = pid, True
        os.close(in_read); os.close(out_write); os.close(err_write)
        for fd in (self.out_read, self.err_read):
            fcntl.fcntl(fd, fcntl.F_SETFL, fcntl.fcntl(fd, fcntl.F_GETFL) | os.O_NONBLOCK)
        waited, wait_status = os.waitpid(pid, 0)
        if waited != pid or not os.WIFSTOPPED(wait_status) or os.WSTOPSIG(wait_status) != signal.SIGSTOP:
            raise ControllerFailure(f"missing initial SIGSTOP:{wait_status}")
        ptrace(PTRACE_SETOPTIONS, pid, 0, PTRACE_O_TRACESYSGOOD | PTRACE_O_EXITKILL)
        self.pidfd = os.pidfd_open(pid, 0)
        info = os.fstat(self.pidfd)
        self.log({"kind": "initial-stop", "pid": pid, "wait_status": wait_status, "stop_signal": signal.SIGSTOP}, True)
        return {"pid": pid, "pidfd": self.pidfd, "pidfd_device": info.st_dev, "pidfd_inode": info.st_ino, "initial_wait_status": wait_status}

    def drain(self) -> None:
        for fd, buffer, capture_fd, attr in ((self.out_read, self.stdout, self.out_fd, "out_read"), (self.err_read, self.stderr, self.err_fd, "err_read")):
            if fd < 0:
                continue
            while True:
                try:
                    part = os.read(fd, 65536)
                except BlockingIOError:
                    break
                if not part:
                    os.close(fd); setattr(self, attr, -1); break
                buffer.extend(part); write_all(capture_fd, part)

    def syscall_info(self) -> dict[str, Any]:
        buffer = ctypes.create_string_buffer(128)
        returned = ptrace(PTRACE_GET_SYSCALL_INFO, self.pid, 128, ctypes.addressof(buffer))
        if returned < 24:
            raise ControllerFailure(f"PTRACE_GET_SYSCALL_INFO short:{returned}")
        raw = buffer.raw[: min(returned, 128)]
        op, arch = raw[0], struct.unpack_from("=I", raw, 4)[0]
        if arch != AUDIT_ARCH_X86_64:
            raise ControllerFailure(f"unsupported syscall ABI:{arch:#x}")
        value: dict[str, Any] = {"op": op, "arch": arch, "instruction_pointer": struct.unpack_from("=Q", raw, 8)[0], "stack_pointer": struct.unpack_from("=Q", raw, 16)[0], "get_syscall_info_bytes": returned, "raw_base64": base64.b64encode(raw).decode("ascii")}
        if op == SYSCALL_INFO_ENTRY:
            value["nr"] = struct.unpack_from("=Q", raw, 24)[0]
            value["args"] = list(struct.unpack_from("=6Q", raw, 32))
        elif op == SYSCALL_INFO_EXIT:
            value["rval"] = struct.unpack_from("=q", raw, 24)[0]
            value["is_error"] = raw[32]
        return value

    def resume_wait(self, reinject: int = 0) -> dict[str, Any]:
        if time.monotonic() > self.deadline:
            raise ControllerFailure("timeout before stdin-read barrier")
        ptrace(PTRACE_SYSCALL, self.pid, 0, reinject)
        waited, wait_status = os.waitpid(self.pid, 0)
        if waited != self.pid:
            raise ControllerFailure("waitpid returned wrong child")
        self.sequence += 1
        if os.WIFEXITED(wait_status):
            self.alive = False; self.final_wait_status = wait_status
            event = {"sequence": self.sequence, "kind": "exit", "pid": self.pid, "wait_status": wait_status, "exit_code": os.WEXITSTATUS(wait_status)}
        elif os.WIFSIGNALED(wait_status):
            self.alive = False; self.final_wait_status = wait_status
            event = {"sequence": self.sequence, "kind": "signaled", "pid": self.pid, "wait_status": wait_status, "term_signal": os.WTERMSIG(wait_status)}
        elif os.WIFSTOPPED(wait_status):
            stop_signal = os.WSTOPSIG(wait_status)
            if stop_signal == (signal.SIGTRAP | 0x80):
                event = {"sequence": self.sequence, "kind": "syscall", "pid": self.pid, "wait_status": wait_status, "stop_signal": stop_signal, "syscall": self.syscall_info()}
            else:
                event = {"sequence": self.sequence, "kind": "signal-stop", "pid": self.pid, "wait_status": wait_status, "stop_signal": stop_signal}
        else:
            raise ControllerFailure(f"unrecognized wait status:{wait_status}")
        self.log(event); self.drain(); return event

    @staticmethod
    def is_stdin_read(event: dict[str, Any]) -> bool:
        info = event.get("syscall", {})
        return event.get("kind") == "syscall" and info.get("op") == SYSCALL_INFO_ENTRY and info.get("nr") == SYS_READ and info.get("args", [None])[0] == 0

    def wait_for_stdin_read(self) -> dict[str, Any]:
        pending = 0
        while True:
            event = self.resume_wait(pending); pending = 0
            if not self.alive:
                raise ControllerFailure("tracee exited before stdin-read barrier")
            if self.is_stdin_read(event):
                self.log({"sequence": self.sequence, "kind": "declared-after-request-read-barrier", "pid": self.pid, "syscall_sequence": event["sequence"]}, True)
                return event
            if event.get("kind") == "signal-stop" and event["stop_signal"] not in {signal.SIGTRAP, signal.SIGSTOP}:
                pending = event["stop_signal"]

    def kill_at_barrier(self, barrier: dict[str, Any], capture: pathlib.Path) -> tuple[dict[str, Any], dict[str, Any]]:
        pidfd_info = os.fstat(self.pidfd)
        send_result = pidfd_send_signal(self.pidfd, signal.SIGKILL)
        self.log({
            "sequence": self.sequence, "kind": "pidfd-sigkill-sent", "pid": self.pid,
            "pidfd": self.pidfd, "signal": signal.SIGKILL, "pidfd_send_result": send_result,
        }, True)
        continue_observation = ptrace_continue_after_sigkill(self.pid)
        waited, wait_status = os.waitpid(self.pid, 0)
        self.sequence += 1
        if waited != self.pid or not os.WIFSIGNALED(wait_status) or os.WTERMSIG(wait_status) != signal.SIGKILL:
            raise ControllerFailure(f"SIGKILL did not terminate tracee exactly:{wait_status}")
        self.alive = False; self.final_wait_status = wait_status
        self.log({
            "sequence": self.sequence, "kind": "post-sigkill-ptrace-cont", "pid": self.pid,
            "ptrace_continue": continue_observation,
        }, True)
        continue_accepted = continue_observation["result"] == 0 or (
            continue_observation["result"] == -1 and continue_observation["errno"] == errno.ESRCH
        )
        if not continue_accepted:
            raise ControllerFailure(
                f"PTRACE_CONT after SIGKILL returned disallowed result:"
                f"{continue_observation['result']}:{continue_observation['errno_name'] or continue_observation['errno']}"
            )
        event = {"sequence": self.sequence, "kind": "signaled", "pid": self.pid, "wait_status": wait_status, "term_signal": os.WTERMSIG(wait_status)}
        self.log(event, True); self.drain()
        kill_receipt = {
            "schema_id": "pw-r9-external-hard-loss-receipt-v1", "signal_kind": "SIGKILL", "signal_number": signal.SIGKILL,
            "tracee_pid": self.pid, "pidfd": self.pidfd,
            "pidfd_binding": {"device": pidfd_info.st_dev, "inode": pidfd_info.st_ino, "mode": pidfd_info.st_mode},
            "pidfd_send_result": send_result, "ptrace_continue_result": continue_observation["result"],
            "ptrace_continue_errno": continue_observation["errno"], "ptrace_continue_errno_name": continue_observation["errno_name"],
            "ptrace_continue_accepted_post_sigkill": continue_accepted,
            "injection_barrier": {"ptrace_sequence": barrier["sequence"], "syscall_nr": barrier["syscall"]["nr"], "fd": barrier["syscall"]["args"][0]},
            "termination": event,
        }
        write_json(capture / "kill-receipt.json", kill_receipt)
        process = {"raw_wait_status": wait_status, "subprocess_returncode": -signal.SIGKILL, "conventional_shell_status": 128 + signal.SIGKILL, "exit_code": None, "term_signal": signal.SIGKILL}
        return kill_receipt, process

    def finalize(self) -> None:
        self.drain()
        if self.in_write >= 0:
            os.close(self.in_write); self.in_write = -1
        for attr in ("pidfd", "out_read", "err_read"):
            fd = getattr(self, attr)
            if fd >= 0:
                os.close(fd); setattr(self, attr, -1)
        for fd, path in ((self.out_fd, self.out_path), (self.err_fd, self.err_path), (self.in_fd, self.in_path), (self.syscalls_fd, self.syscalls_path)):
            close_capture(fd, path)


def run_reopens(component: pathlib.Path, repo: pathlib.Path, evidence: pathlib.Path, capture: pathlib.Path) -> list[dict[str, Any]]:
    values = []
    env = dict(os.environ)
    env.update({"PW_R9_EVIDENCE_ROOT": os.fspath(evidence.resolve()), "PYTHONDONTWRITEBYTECODE": "1", "LC_ALL": "C"})
    run_root = (evidence / RUN_ID).resolve()
    for index in (1, 2):
        before = inventory(evidence); write_json(capture / f"reopen-{index}.inventory-before.json", before)
        result = subprocess.run([sys.executable, os.fspath(component / "runner.py"), "reopen", "--run-root", os.fspath(run_root)], cwd=repo, env=env, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60, check=False)
        write_new(capture / f"reopen-{index}.stdout.bin", result.stdout); write_new(capture / f"reopen-{index}.stderr.bin", result.stderr)
        after = inventory(evidence); write_json(capture / f"reopen-{index}.inventory-after.json", after)
        parsed = parse_canonical_line(result.stdout)
        record = {"index": index, "command": "runner.py reopen --run-root ABSOLUTE_RUN_ROOT", "returncode": result.returncode, "stdout_sha256": sha256(result.stdout), "stdout_bytes": len(result.stdout), "stderr_sha256": sha256(result.stderr), "stderr_bytes": len(result.stderr), "parsed": parsed, "inventory_unchanged": before == after, "inventory_sha256": sha256(canon(before))}
        write_json(capture / f"reopen-{index}.result.json", record); values.append(record)
    return values


def row_inventory(evidence: pathlib.Path, row_id: str) -> list[str]:
    row = evidence / RUN_ID / "rows" / row_id
    return sorted(item.name for item in row.iterdir()) if row.is_dir() else []


def main() -> int:
    case_dir = pathlib.Path(__file__).resolve().parent
    if case_dir.name != CASE_NAME:
        raise ControllerFailure("case directory binding mismatch")
    unexpected = sorted(item.name for item in case_dir.iterdir() if item.name != "controller.py")
    if unexpected:
        raise ControllerFailure(f"one-shot case is not fresh:{unexpected}")
    capture = case_dir / "controller-capture"; mkdir_new(capture)
    tracee: Tracee | None = None
    primary_launch_count = 0
    mismatches: list[dict[str, Any]] = []

    def check(check_id: str, actual: Any, expected: Any) -> None:
        if actual != expected:
            mismatches.append({"check_id": check_id, "actual": receipt_safe(actual), "expected": receipt_safe(expected)})

    try:
        repo, component, evidence, head = setup_isolated_repo(case_dir, capture)
        tracee = Tracee(component, repo, evidence, capture)
        launch = tracee.launch(); primary_launch_count += 1
        barrier = tracee.wait_for_stdin_read()
        request_lines = bytes(tracee.stdout).splitlines(keepends=True)
        if len(request_lines) != 1:
            raise ControllerFailure(f"expected one complete request before kill:{len(request_lines)}")
        request = parse_canonical_line(request_lines[0])
        if request.get("schema_id") != "pw-r9-subagent-spawn-request-v1":
            raise ControllerFailure("stdout line is not a public spawn request")
        prefix_at_barrier = row_inventory(evidence, "row-000")
        if prefix_at_barrier != EXPECTED_PREFIX:
            raise ControllerFailure(f"hard-loss prefix mismatch:{prefix_at_barrier}")
        os.fsync(tracee.out_fd)
        tracee.log({
            "sequence": tracee.sequence, "kind": "durable-hard-loss-injection-boundary", "pid": tracee.pid,
            "request_sha256": sha256(request_lines[0]), "request_bytes": len(request_lines[0]),
            "prefix_at_barrier": prefix_at_barrier,
        }, True)
        kill_receipt, process = tracee.kill_at_barrier(barrier, capture)
        tracee.finalize(); tracee = None
        write_json(capture / "primary-process.json", {"launch": launch, "request_sha256": sha256(request_lines[0]), "request_bytes": len(request_lines[0]), "prefix_at_barrier": prefix_at_barrier, "process": process})
        primary_stdout = (capture / "primary.stdout.bin").read_bytes()
        parsed_primary = [parse_canonical_line(line) for line in primary_stdout.splitlines(keepends=True)]
        spawn_lines = [item for item in parsed_primary if item.get("schema_id") == "pw-r9-subagent-spawn-request-v1"]
        reopens = run_reopens(component, repo, evidence, capture)
        run_value = parse_canonical_line((evidence / RUN_ID / "run.json").read_bytes())
        top_entries = sorted(item.name for item in (evidence / RUN_ID).iterdir())
        component_status = run_git(repo, ["status", "--porcelain=v1", "--untracked-files=all", "--", COMPONENT_REL.as_posix(), *(item[0] for item in SHARED)])
        check("primary_launch_count_no_relaunch", primary_launch_count, 1)
        check("primary_subprocess_returncode", process["subprocess_returncode"], -9)
        check("primary_conventional_shell_status", process["conventional_shell_status"], 137)
        check("primary_sigkill", process["term_signal"], signal.SIGKILL)
        check("request_count", len(spawn_lines), 1)
        check("stdin_exactly_empty", (capture / "primary.stdin.bin").read_bytes(), b"")
        check("prefix_at_barrier", prefix_at_barrier, EXPECTED_PREFIX)
        check("prefix_after_death", row_inventory(evidence, "row-000"), EXPECTED_PREFIX)
        check("other_rows_absent", [row_inventory(evidence, "row-001"), row_inventory(evidence, "row-002")], [[], []])
        check("unsealed_top_tree", top_entries, ["artifacts", "rows", "run.json", "terminals"])
        check("matrix_terminal_absent", (evidence / RUN_ID / "matrix_terminal.json").exists(), False)
        check("accounting_absent", (evidence / RUN_ID / "accounting.json").exists(), False)
        check("run_component_identity", run_value.get("component_identity"), EXPECTED_IDENTITY)
        check("kill_child_pid_only", kill_receipt["tracee_pid"], launch["pid"])
        check("reopen_count", len(reopens), 2)
        check("reopen_returncodes", [item["returncode"] for item in reopens], [2, 2])
        check("reopen_schema", [item["parsed"].get("schema_id") for item in reopens], ["pw-r9-runner-error-v1", "pw-r9-runner-error-v1"])
        check("reopen_status", [item["parsed"].get("status") for item in reopens], ["CONTROLLER_INVALID", "CONTROLLER_INVALID"])
        check("reopen_error", [item["parsed"].get("error") for item in reopens], ["matrix terminal: missing", "matrix terminal: missing"])
        check("reopen_error_type", [item["parsed"].get("error_type") for item in reopens], ["_Invalid", "_Invalid"])
        check("reopen_exact_public_error_objects", [item["parsed"] for item in reopens], [EXPECTED_REOPEN_ERROR, EXPECTED_REOPEN_ERROR])
        check("reopen_stderr_exactly_empty", [item["stderr_bytes"] for item in reopens], [0, 0])
        check("reopen_has_no_offline_verifier", ["offline_verifier" in item["parsed"] for item in reopens], [False, False])
        check("reopen_outputs_identical", reopens[0]["stdout_sha256"], reopens[1]["stdout_sha256"])
        check("reopen_trees_unchanged", [item["inventory_unchanged"] for item in reopens], [True, True])
        check("reopen_tree_same_across_both", reopens[0]["inventory_sha256"], reopens[1]["inventory_sha256"])
        check("component_scoped_git_clean", component_status, b"")
        receipt_value = {
            "schema_id": "pw-r9-process-case-receipt-v1", "case": CASE_ID, "fault_id": FAULT_ID,
            "status": "PASS" if not mismatches else "FAIL", "first_mismatch": mismatches[0] if mismatches else None, "mismatches": mismatches,
            "component_identity": EXPECTED_IDENTITY, "git_custody": {"head": head, "origin_main": head, "scoped_clean_after": component_status == b""},
            "primary": {"launch_count": primary_launch_count, "process": process, "stdout_sha256": sha256(primary_stdout), "stdout_bytes": len(primary_stdout), "stdin_sha256": sha256(b""), "stdin_bytes": 0, "spawn_requests": len(spawn_lines), "no_relaunch": True},
            "hard_loss": {"signal": "SIGKILL", "pidfd_bound": True, "after_durable_attempt_and_request": True, "before_receipt": True, "exact_prefix": row_inventory(evidence, "row-000")},
            "reopens": [{"index": item["index"], "returncode": item["returncode"], "status": item["parsed"].get("status"), "stdout_sha256": item["stdout_sha256"], "inventory_unchanged": item["inventory_unchanged"]} for item in reopens],
            "calls": {"provider": 0, "subject": 0, "collaboration": 0, "model": 0, "network": 0},
            "credit": {"empirical": 0, "qualification": 0, "audit": 0, "candidate": 0, "release": 0},
            "retry_count": 0, "replacement_count": 0,
            "nonclaims": ["controller-generated mechanics receive zero empirical or qualification credit", "this receipt is not qualification formal audit freeze release or goal completion"],
        }
    except BaseException as exc:
        if tracee is not None:
            try:
                if tracee.alive and tracee.pidfd >= 0:
                    pidfd_send_signal(tracee.pidfd, signal.SIGKILL)
                    try: ptrace(PTRACE_CONT, tracee.pid, 0, 0)
                    except BaseException: pass
                    try: os.waitpid(tracee.pid, 0)
                    except BaseException: pass
                tracee.finalize()
            except BaseException:
                pass
        mismatch = {"check_id": "platform_or_controller_limitation", "actual": f"{type(exc).__name__}:{exc}", "expected": "declared after-request boundary reached and exact prefix retained"}
        receipt_value = {
            "schema_id": "pw-r9-process-case-receipt-v1", "case": CASE_ID, "fault_id": FAULT_ID, "status": "PRESERVED_FAILURE",
            "first_mismatch": mismatch, "mismatches": [mismatch], "component_identity": EXPECTED_IDENTITY,
            "primary": {"launch_count": primary_launch_count},
            "calls": {"provider": 0, "subject": 0, "collaboration": 0, "model": 0, "network": 0},
            "credit": {"empirical": 0, "qualification": 0, "audit": 0, "candidate": 0, "release": 0},
            "retry_count": 0, "replacement_count": 0, "platform_limitation_preserved": True,
        }
    write_json(case_dir / "case-receipt.json", receipt_value)
    sys.stdout.buffer.write(canon(receipt_value) + b"\n"); sys.stdout.buffer.flush()
    return 0 if receipt_value["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
