#!/usr/bin/env python3
"""Reuse a landing check's validator runs when everything they read is unchanged (`--cache`, opt-in).

What is cached. One unit is one validator command: `pm-plans-verify.py <command> <arguments>`, which both
aggregates and the exports run, or `pm-plan-migration.py validate --run-dir <run>`. The aggregates themselves
always run: their own code, unchanged, asks for each subcheck, builds the report and prints it; only the
function that spawns a subcheck (`run_validator_subprocess`) is wrapped, and on a hit it hands back the bytes
that subcheck wrote last time. `verify_spec_lock`, which run-gates runs in-process, is never cached.

The key is measured, not assumed. A commit's tree id is not what a validator reads. Read in this repository
on 2026-11-06: `iter_repo_files` asks git for untracked files, `pm-audit-closure.py` asks about HEAD's
history, `pm-plan-index.py` reads `origin/main`, `pm_evidence_paths.py` reads `PM_EVIDENCE_MAP`, and several
read gitignored audit and evidence files. So a cold run is traced with strace and a unit's inputs are what the
trace shows it did: each file opened (its bytes), each path stat-ed (present or absent, type, size; a `.py`
file's bytes, because the importer only stats a source with a valid `.pyc`), each directory listed (names and
types), each symlink read, and each git command. A later lookup recomputes those values from the current
state and reuses the result only when all of them match.

Why that is sound: a validator is deterministic given what it reads. Same program and arguments, first read
sees the same value, so the second read is the same read, and so on: the same reads, the same output. The
read set needs no prediction, and a new file in a listed folder or a file appearing where a stat found nothing
changes a recorded value.

Inputs that are not files. The environment, except names on ENV_IGNORED, which a test proves no script reads.
Python's version and path, git's version, this module's bytes. A git command is run again at lookup and its
output compared; one that reads stdin, and any unit with more than MAX_GIT_REPLAYS of them, is keyed instead on
the repository's whole state (git directory, HEAD, every ref, the index), so any fetch misses it. The clock is
not an input: every clock read in scripts/ goes into a `generated_at_utc` field. File times are not inputs:
no validator reads them (a test greps for it).

A unit is never stored when the trace cannot be read whole, a process of the tree was killed, a read failed
transiently (EIO, ESTALE and the like), it wrote outside scratch, it ran a git command that may write, its
report holds a timeout row, it ended oddly, or an input changed while it ran (RACE_MARGIN_NS). Without strace
nothing new is stored. Whatever is not stored simply runs: the cache can only ever cost a rerun.

Never reused for a baseline: `--record-baseline --cache` refuses with exit 3. Nothing writes inside the
repository; a fingerprint mismatch or a damaged entry is a miss. Writes are atomic and the folder is capped.
See reports/landing-checks/README.md, "The result cache".
"""
from __future__ import annotations

import argparse
import atexit
import errno
import gzip
import hashlib
import importlib.util
import json
import os
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

SCHEMA = "pm.landing_cache.v1"
ROOT_TOKEN = "@ROOT"
OUTPUT_ROOT_TOKEN = "@@PM_LANDING_ROOT@@"
DEFAULT_MAX_MB = 2048
MANIFESTS_PER_COMMAND = 8
# More git commands than this are not replayed one by one; the unit is keyed on the repository's state.
MAX_GIT_REPLAYS = 64
# A file whose ctime is this close to a unit's start, or later, may have changed after the unit read it.
# 10 ms of skew measured against the NFS mount on 2026-11-06.
RACE_MARGIN_NS = 2_000_000_000
AGGREGATES = {"run-gates", "audit-governance"}
AGGREGATE_CHILD_ENV = "PM_PLANS_VERIFY_AGGREGATE_CHILD"
INFRASTRUCTURE_ERRORS = ("subprocess_timeout", "subcheck_timeout")

# Every syscall that names a path, so an unknown one stops a unit rather than hiding an input, plus what
# follows processes and directory reads. `?` keeps it working where an architecture has no such call.
TRACE_FILTER = "%file,?getdents,?getdents64,fchdir,?clone,?clone3,?fork,?vfork"
TRACE_STRING_LIMIT = 8192

# Environment names left out of the key: session noise, and PATH, whose effect is measured per exec (`which`).
# test_no_script_reads_an_ignored_environment_name proves that no script reads one of them. Anything not named
# here is in the key, so an unknown variable costs a rerun, never a wrong reuse. Only a digest is stored.
ENV_IGNORED = {
    "_", "PWD", "OLDPWD", "SHLVL", "PATH", "TERM", "COLORTERM", "COLUMNS", "LINES", "MAIL", "LOGNAME", "USER",
    "SHELL", "DISPLAY", "LS_COLORS", "LESS", "PAGER", "EDITOR", "VISUAL", "GIT_EDITOR", "HOSTNAME", "AI_AGENT",
    "DESKTOP_SESSION", "INVOCATION_ID", "MANAGERPID", "MANAGERPIDFDID", "SYSTEMD_EXEC_PID", "COREPACK_ENABLE_AUTO_PIN",
    "NoDefaultCurrentDirectoryInExePath", "MEMORY_PRESSURE_WATCH", "MEMORY_PRESSURE_WRITE", "QT_ACCESSIBILITY",
    "GPG_AGENT_INFO", "XAUTHORITY", "XAUTHLOCALHOSTNAME", "DBUS_SESSION_BUS_ADDRESS", "SSH_AUTH_SOCK",
}
ENV_IGNORED_PREFIXES = ("CLAUDE", "T3", "CODEX", "XDG_", "SSH_", "TMUX", "ANDROID_", "ANTHROPIC_", "OPENAI_")

# Results that say something about this tree. Anything else on a read (EIO, ESTALE, ENOMEM, EMFILE) says
# something about the machine at that moment, and must not be remembered.
STABLE_ERRNOS = {
    "ENOENT", "ENOTDIR", "EEXIST", "EINVAL", "ELOOP", "EACCES", "EPERM", "EISDIR", "ENAMETOOLONG", "ENODATA",
    "ENOTEMPTY", "EXDEV", "ENOTSUP", "EOPNOTSUPP", "ENXIO", "ENOSYS",
}
READ_SYSCALLS = {"open", "openat", "openat2", "creat", "stat", "lstat", "newfstatat", "fstatat64", "statx", "access",
                 "faccessat", "faccessat2", "readlink", "readlinkat", "getxattr", "lgetxattr", "listxattr", "llistxattr",
                 "statfs", "getcwd"}
WRITE_SYSCALLS = {"mkdir", "mkdirat", "rmdir", "unlink", "unlinkat", "rename", "renameat", "renameat2", "link", "linkat",
                  "symlink", "symlinkat", "truncate", "chmod", "fchmodat", "fchmodat2", "chown", "lchown", "fchownat", "utime",
                  "utimes", "utimensat", "futimesat", "setxattr", "lsetxattr", "removexattr", "lremovexattr", "mknod", "mknodat"}
PROCESS_SYSCALLS = {"clone", "clone3", "fork", "vfork"}

# git commands that only read. Whether their answer is a function of what the key holds is what replaying checks.
GIT_READ_VERBS = {"ls-files", "rev-parse", "show", "ls-tree", "log", "merge-base", "cat-file", "diff", "rev-list",
                  "for-each-ref", "symbolic-ref", "status", "describe", "name-rev", "version", "--version"}
GIT_GLOBAL_WITH_VALUE = {"-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path"}


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def canonical(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", "surrogateescape")).hexdigest()


# ------------------------------------------------------------------------------- reading a trace


def unescape_c(text: str) -> str:
    """strace's escapes back to a path: \\", \\\\, \\n and friends, \\NNN octal, \\xNN hex."""
    if "\\" not in text:
        return text
    simple = {"n": 10, "t": 9, "r": 13, "v": 11, "f": 12, "a": 7, "b": 8, "e": 27, '"': 34, "\\": 92, "'": 39}
    out = bytearray()
    index, length = 0, len(text)
    while index < length:
        char = text[index]
        if char != "\\" or index + 1 >= length:
            out += char.encode("utf-8", "surrogateescape")
            index += 1
            continue
        following = text[index + 1]
        if following in "01234567":
            end = index + 1
            while end < length and end < index + 4 and text[end] in "01234567":
                end += 1
            out.append(int(text[index + 1:end], 8) & 0xFF)
            index = end
        elif following == "x" and re.match(r"[0-9a-fA-F]{2}", text[index + 2:index + 4]):
            out.append(int(text[index + 2:index + 4], 16))
            index += 4
        else:
            out.append(simple.get(following, ord(following) & 0xFF))
            index += 2
    return os.fsdecode(bytes(out))


def split_arguments(text: str) -> list[str]:
    """Split a syscall's argument text at its top-level commas: strings, arrays, structs and `3</fd path>` whole."""
    parts: list[str] = []
    depth = 0
    start = index = 0
    length = len(text)
    while index < length:
        char = text[index]
        if char == '"':
            index += 1
            while index < length and text[index] != '"':
                index += 2 if text[index] == "\\" else 1
        elif char == "<":
            end = text.find(">", index)
            if end > 0:
                index = end
        elif char in "{[(":
            depth += 1
        elif char in "}])":
            depth -= 1
        elif char == "," and depth == 0:
            parts.append(text[start:index].strip())
            start = index + 1
        index += 1
    parts.append(text[start:].strip())
    return parts


def string_argument(token: str) -> tuple[str | None, bool]:
    """(the string, cut short) of a quoted argument; (None, False) when it is an address or a flag."""
    if not token.startswith('"'):
        return None, False
    index = 1
    length = len(token)
    while index < length and token[index] != '"':
        index += 2 if token[index] == "\\" else 1
    return unescape_c(token[1:index]), token[index + 1:].startswith("...")


FD_ANNOTATION = re.compile(r"^(AT_FDCWD|-?\d+)(?:<(.*)>)?$", re.S)
CALL = re.compile(r"^([a-z0-9_]+)\((.*)\)\s+= (.*)$", re.S)
UNFINISHED = re.compile(r"^(.*) <unfinished \.\.\.>$", re.S)
RESUMED = re.compile(r"^<\.\.\. ([a-z0-9_]+) resumed>(.*)$", re.S)


def annotated_path(token: str) -> tuple[str | None, str | None]:
    """(what the fd is, its path) from `AT_FDCWD</cwd>` or `3</dir>`."""
    match = FD_ANNOTATION.match(token)
    if not match:
        return None, None
    return match.group(1), unescape_c(match.group(2)) if match.group(2) is not None else None


def normal_path(path: str) -> str:
    """A path with `.` and repeated slashes gone. A `..` stays: past a symlink it does not mean the parent."""
    if ".." in path.split("/"):
        return re.sub(r"/+", "/", "/".join(part for part in path.split("/") if part != "."))
    return os.path.normpath(path)


def is_pseudo(path: str) -> bool:
    return path in {"/proc", "/sys", "/dev"} or path.startswith(("/proc/", "/sys/", "/dev/"))


def is_bytecode(path: str) -> bool:
    """Bytecode is derived from the source, and the source's bytes are in the key. Python writes it on its own."""
    return "__pycache__" in path.split("/")


def is_under(path: str, folder: str) -> bool:
    return path == folder or path.startswith(folder.rstrip("/") + "/")


@dataclass
class Trace:
    """What one traced command did. `reasons` holds why it cannot be cached; empty means it can."""

    reads: set[tuple[str, str]] = field(default_factory=set)
    git: list[dict[str, Any]] = field(default_factory=list)
    git_needs_state: bool = False
    written: set[str] = field(default_factory=set)
    which: dict[str, str] = field(default_factory=dict)
    reasons: list[str] = field(default_factory=list)
    lines: int = 0

    def refuse(self, reason: str) -> None:
        if reason not in self.reasons and len(self.reasons) < 8:
            self.reasons.append(reason)


class TraceReader:
    """Turn a strace log into a Trace, failing closed: a line it cannot read makes the unit uncacheable."""

    def __init__(self, root: Path, scratch: Iterable[str] = ()):
        self.root = str(root)
        self.scratch = [str(folder).rstrip("/") or "/" for folder in scratch]
        self.trace = Trace()
        self.parents: dict[int, int] = {}
        self.cwd: dict[int, str] = {}
        self.git_pids: set[int] = set()
        self.created_dirs: set[str] = set()
        self.resolved_dirs: dict[str, str] = {}

    def token(self, path: str) -> str:
        if path == self.root:
            return ROOT_TOKEN
        if path.startswith(self.root + "/"):
            return ROOT_TOKEN + path[len(self.root):]
        return path

    def records(self, lines: Iterable[str]) -> list[tuple[int, str, str, str]]:
        """Syscalls as (pid, name, arguments, result), with interrupted ones joined back together."""
        out: list[tuple[int, str, str, str]] = []
        pending: dict[int, str] = {}
        for raw in lines:
            self.trace.lines += 1
            line = raw.rstrip("\n")
            pid_text, _, rest = line.partition(" ")
            if not pid_text.isdigit():
                if line.strip():
                    self.trace.refuse(f"a trace line could not be read: {line[:100]}")
                continue
            pid = int(pid_text)
            rest = rest.lstrip()
            if rest.startswith("+++"):
                if "killed by" in rest:
                    self.trace.refuse(f"a process it started was {rest.strip('+ ')}")
                continue
            if rest.startswith("---"):
                continue
            unfinished = UNFINISHED.match(rest)
            if unfinished:
                pending[pid] = unfinished.group(1)
                continue
            resumed = RESUMED.match(rest)
            if resumed:
                rest = pending.pop(pid, f"{resumed.group(1)}(") + resumed.group(2)
            call = CALL.match(rest)
            if not call:
                # `exit_group(0) = ?` never returns and has no path in it; nothing else is expected here.
                if " = ?" in rest:
                    continue
                self.trace.refuse(f"a trace line could not be read: {rest[:100]}")
                continue
            out.append((pid, call.group(1), call.group(2), call.group(3).strip()))
        for pid, text in pending.items():
            if not text.startswith(("exit_group", "exit")):
                self.trace.refuse(f"a call never finished in the trace: {text[:100]}")
        return out

    def read_lines(self, lines: Iterable[str]) -> Trace:
        records = self.records(lines)
        for pid, name, _arguments, result in records:
            if name in PROCESS_SYSCALLS and result.isdigit():
                self.parents[int(result)] = pid
        for pid, name, arguments, result in records:
            self.apply(pid, name, arguments, result)
        return self.trace

    def in_git(self, pid: int) -> bool:
        seen: set[int] = set()
        while pid not in seen:
            if pid in self.git_pids:
                return True
            seen.add(pid)
            if pid not in self.parents:
                return False
            pid = self.parents[pid]
        return False

    def cwd_of(self, pid: int) -> str | None:
        seen: set[int] = set()
        while pid not in seen:
            if pid in self.cwd:
                return self.cwd[pid]
            seen.add(pid)
            if pid not in self.parents:
                return self.root
            pid = self.parents[pid]
        return self.root

    def absolute(self, pid: int, base: str | None, path: str) -> str | None:
        if path.startswith("/"):
            return normal_path(path)
        where = base if base is not None else self.cwd_of(pid)
        if where is None:
            return None
        return normal_path(where.rstrip("/") + "/" + path)

    def internal(self, path: str) -> bool:
        """Something the run itself made: it is not an input."""
        if path in self.trace.written or path in self.created_dirs:
            return True
        if not self.created_dirs:
            return False
        parent = path
        while "/" in parent[1:]:
            parent = parent.rsplit("/", 1)[0]
            if parent in self.created_dirs:
                return True
        return False

    def add_read(self, kind: str, path: str) -> None:
        if is_pseudo(path) or is_bytecode(path) or self.internal(path):
            return
        self.trace.reads.add((kind, self.token(path)))

    def add_write(self, path: str, make_dir: bool = False) -> None:
        if is_pseudo(path):
            return
        scratch = not is_under(path, self.root) and any(is_under(path, folder) for folder in self.scratch)
        if not is_bytecode(path) and not scratch:
            if not self.internal(path):
                self.trace.refuse(f"it wrote outside scratch: {self.token(path)}")
        if make_dir:
            self.created_dirs.add(path)
        else:
            self.trace.written.add(path)

    def apply(self, pid: int, name: str, arguments: str, result: str) -> None:
        if name in PROCESS_SYSCALLS:
            return
        failed = result.startswith("-1 ")
        error = result.split()[1] if failed and len(result.split()) > 1 else None
        args = split_arguments(arguments)
        if name in {"execve", "execveat"}:
            self.apply_exec(pid, name, args, failed)
            return
        if name in {"chdir", "fchdir"}:
            self.apply_chdir(pid, name, args, failed)
            return
        if name in {"getdents", "getdents64"}:
            self.apply_listing(pid, args)
            return
        if name == "getcwd":
            return
        if name not in READ_SYSCALLS and name not in WRITE_SYSCALLS:
            self.trace.refuse(f"it made a call this reader does not know: {name}")
            return
        # A cwd annotation is printed on every *at call, so it also keeps cwd_of current.
        if args and args[0].startswith("AT_FDCWD<"):
            _, where = annotated_path(args[0])
            if where:
                self.cwd[pid] = where
        if self.in_git(pid):
            return
        if error and error not in STABLE_ERRNOS:
            self.trace.refuse(f"{name} failed with {error}, which says nothing about the tree")
            return
        if name in WRITE_SYSCALLS:
            self.apply_write(pid, name, args, failed, error)
            return
        self.apply_read(pid, name, args, failed, result)

    def named_path(self, pid: int, args: list[str], index: int, fd_index: int | None = None) -> str | None:
        """The absolute path of the argument at `index`, relative to the dirfd at `fd_index` when the call has one."""
        if len(args) <= index:
            self.trace.refuse("a call in the trace has too few arguments")
            return None
        text, cut = string_argument(args[index])
        if text is None or cut:
            self.trace.refuse(f"a path in the trace could not be read: {args[index][:80]}")
            return None
        base = None
        if fd_index is not None:
            kind, where = annotated_path(args[fd_index])
            if kind is None:
                self.trace.refuse(f"a directory fd in the trace could not be read: {args[fd_index][:80]}")
                return None
            base = where
            if kind != "AT_FDCWD" and where is None and not text.startswith("/") and text:
                self.trace.refuse(f"a directory fd has no path in the trace: {args[fd_index][:80]}")
                return None
        if not text:
            return ""
        return self.absolute(pid, base, text)

    def apply_read(self, pid: int, name: str, args: list[str], failed: bool, result: str) -> None:
        if name in {"open", "creat"}:
            path, flags = self.named_path(pid, args, 0), args[1] if len(args) > 1 else ""
        elif name in {"openat", "openat2"}:
            path, flags = self.named_path(pid, args, 1, 0), args[2] if len(args) > 2 else ""
        elif name in {"stat", "lstat", "access", "getxattr", "lgetxattr", "listxattr", "llistxattr", "statfs"}:
            path = self.named_path(pid, args, 0)
            if path:
                self.add_read("lstat" if name in {"lstat", "lgetxattr", "llistxattr"} else "stat", path)
            return
        elif name in {"newfstatat", "fstatat64", "statx", "faccessat", "faccessat2"}:
            path = self.named_path(pid, args, 1, 0)
            if path:
                # newfstatat keeps its flags last, statx third, and only they can say not to follow a symlink.
                follow = not any("AT_SYMLINK_NOFOLLOW" in argument for argument in args[2:])
                self.add_read("stat" if follow else "lstat", path)
            return
        elif name == "readlink":
            path = self.named_path(pid, args, 0)
            if path:
                self.add_read("link", path)
            return
        elif name == "readlinkat":
            path = self.named_path(pid, args, 1, 0)
            if path:
                self.add_read("link", path)
            return
        else:  # pragma: no cover - READ_SYSCALLS is exhausted above.
            self.trace.refuse(f"it made a call this reader does not know: {name}")
            return
        if not path:
            return
        writes = name == "creat" or any(flag in flags for flag in ("O_WRONLY", "O_RDWR", "O_CREAT", "O_TRUNC", "O_APPEND"))
        if failed:
            self.add_read("stat", path)
            return
        if writes:
            self.add_write(path)
            return
        if "O_PATH" in flags:
            self.add_read("stat", path)
        elif "O_DIRECTORY" in flags:
            self.add_read("stat", path)
            match = FD_ANNOTATION.match(result)
            if match and match.group(2) is not None:
                self.resolved_dirs[unescape_c(match.group(2))] = path
        else:
            self.add_read("file", path)
            # A plain open of a directory (os.open, or Python's os.scandir on some paths) may still be listed.
            match = FD_ANNOTATION.match(result)
            if match and match.group(2) is not None:
                self.resolved_dirs.setdefault(unescape_c(match.group(2)), path)

    def apply_write(self, pid: int, name: str, args: list[str], failed: bool, error: str | None) -> None:
        if name in {"mkdir", "mkdirat"}:
            path = self.named_path(pid, args, 0) if name == "mkdir" else self.named_path(pid, args, 1, 0)
            if not path:
                return
            if failed:
                self.add_read("stat", path)
            else:
                self.add_write(path, make_dir=True)
            return
        if name in {"rename", "link", "symlink"}:
            first, second = (self.named_path(pid, args, 0), self.named_path(pid, args, 1)) if name != "symlink" \
                else (None, self.named_path(pid, args, 1))
        elif name in {"renameat", "renameat2", "linkat"}:
            first, second = self.named_path(pid, args, 1, 0), self.named_path(pid, args, 3, 2)
        elif name == "symlinkat":
            first, second = None, self.named_path(pid, args, 2, 1)
        elif name in {"unlinkat", "fchmodat", "fchmodat2", "fchownat", "utimensat", "futimesat", "mknodat"}:
            first, second = self.named_path(pid, args, 1, 0), None
        else:
            first, second = self.named_path(pid, args, 0), None
        for path in (first, second):
            if not path:
                continue
            if failed:
                self.add_read("stat", path)
            else:
                self.add_write(path)

    def apply_exec(self, pid: int, name: str, args: list[str], failed: bool) -> None:
        index = 1 if name == "execveat" else 0
        if failed:
            return
        path = self.named_path(pid, args, 0) if name == "execve" else self.named_path(pid, args, 1, 0)
        if not path or len(args) <= index + 1:
            self.trace.refuse("an exec in the trace could not be read")
            return
        vector = args[index + 1]
        if not (vector.startswith("[") and vector.endswith("]")):
            self.trace.refuse("an exec's arguments in the trace could not be read")
            return
        inner = split_arguments(vector[1:-1])
        argv: list[str] = []
        for token in inner:
            if token == "...":
                self.trace.refuse("an exec's arguments were cut short in the trace")
                return
            text, cut = string_argument(token)
            if text is None or cut:
                self.trace.refuse("an exec's arguments were cut short in the trace")
                return
            argv.append(text)
        if argv and "/" not in argv[0]:
            self.trace.which[argv[0]] = path
        base = os.path.basename(path)
        if base == "git" or base.startswith("git-"):
            already_git = self.in_git(pid)
            self.git_pids.add(pid)
            if not already_git:
                self.record_git(pid, argv)
            return
        if not self.in_git(pid):
            self.add_read("file", path)

    def apply_chdir(self, pid: int, name: str, args: list[str], failed: bool) -> None:
        if failed:
            return
        if name == "chdir":
            path = self.named_path(pid, args, 0)
            if path:
                self.cwd[pid] = path
        else:
            _, where = annotated_path(args[0])
            if where:
                self.cwd[pid] = where
            else:
                self.trace.refuse("an fchdir in the trace has no path")

    def apply_listing(self, pid: int, args: list[str]) -> None:
        if self.in_git(pid):
            return
        _, where = annotated_path(args[0])
        if not where:
            self.trace.refuse(f"a directory read in the trace has no path: {args[0][:80]}")
            return
        self.add_read("list", self.resolved_dirs.get(where, where))

    def record_git(self, pid: int, argv: list[str]) -> None:
        """Classify one git command: run again at lookup, keyed on the repository's state, or a reason to stop."""
        cwd = self.cwd_of(pid) or self.root
        index = 1
        while index < len(argv) and argv[index].startswith("-") and argv[index] not in {"--version"}:
            option = argv[index]
            if option == "-C" and index + 1 < len(argv):
                cwd = os.path.join(cwd, argv[index + 1])
            index += 2 if option in GIT_GLOBAL_WITH_VALUE else 1
        verb = argv[index] if index < len(argv) else ""
        # A repository the run itself made (a validator's self-test) depends on nothing but git and the run.
        if self.internal(normal_path(cwd)):
            return
        rest = argv[index + 1:]
        if verb not in GIT_READ_VERBS:
            self.trace.refuse(f"it ran `git {verb}`, which may write")
            return
        if any(arg == "--stdin" or arg.startswith("--batch") for arg in rest):
            self.trace.git_needs_state = True
            return
        tokens = [arg.replace(self.root, ROOT_TOKEN) for arg in argv[1:]]
        entry = {"argv": tokens, "cwd": self.token(normal_path(self.cwd_of(pid) or self.root))}
        if entry not in self.trace.git:
            self.trace.git.append(entry)


def read_trace(log: Path, root: Path, scratch: Iterable[str]) -> Trace:
    reader = TraceReader(root, scratch)
    with log.open(encoding="utf-8", errors="surrogateescape") as handle:
        trace = reader.read_lines(handle)
    if not trace.lines:
        trace.refuse("the trace is empty")
    return trace


# ------------------------------------------------------------------------------- the tracer


class Tracer:
    """strace, when it is here and works. Every unit it cannot watch simply runs and is not stored."""

    def __init__(self) -> None:
        self.path = shutil.which("strace")
        self.prefix: list[str] = []
        self.version = ""
        self.problem = None if self.path else "strace is not installed"
        if not self.path:
            return
        version = subprocess.run([self.path, "--version"], capture_output=True, text=True, check=False)
        self.version = (version.stdout.splitlines() or [""])[0].strip()
        for extra in (["--seccomp-bpf"], []):
            # Signals stay on: `+++ killed by SIGKILL +++` is only printed for a signal in the traced set.
            flags = [self.path, "-f", "-q", "-y", *extra, "-s", str(TRACE_STRING_LIMIT), "-e", f"trace={TRACE_FILTER}"]
            try:
                probe = subprocess.run([*flags, "-o", os.devnull, "--", "true"], capture_output=True, text=True,
                                       check=False, timeout=30)
            except (OSError, subprocess.SubprocessError) as exc:
                self.problem = f"strace could not start: {exc}"
                continue
            if probe.returncode == 0 and not probe.stderr.strip():
                self.prefix = flags
                self.problem = None
                return
            self.problem = f"strace does not work here: {probe.stderr.strip()[:120]}"

    def wrap(self, log: Path, argv: list[str]) -> list[str]:
        return [*self.prefix, "-o", str(log), "--", *argv]


# ------------------------------------------------------------------------------- measuring inputs


def environment_digest(environment: dict[str, str]) -> str:
    kept = {name: value for name, value in environment.items()
            if name not in ENV_IGNORED and not name.startswith(ENV_IGNORED_PREFIXES)}
    return sha256_text(canonical(kept))


class Fingerprints:
    """The current value of each input. One pass sees one value per input, so a whole run reads one state;
    `changed()` then says whether anything moved under it."""

    def __init__(self, root: Path):
        self.root = root
        self.values: dict[tuple[str, str], str] = {}
        self.signatures: dict[tuple[str, str], tuple[int, ...] | None] = {}
        self.git_cache: dict[str, str] = {}

    def real(self, token: str) -> str:
        if token == ROOT_TOKEN:
            return str(self.root)
        if token.startswith(ROOT_TOKEN + "/"):
            return str(self.root) + token[len(ROOT_TOKEN):]
        return token

    def value(self, kind: str, token: str) -> str:
        key = (kind, token)
        if key not in self.values:
            self.values[key] = self.measure(kind, token)
        return self.values[key]

    def values_of(self, inputs: Iterable[tuple[str, str]]) -> dict[str, str]:
        return {f"{kind} {token}": self.value(kind, token) for kind, token in inputs}

    def measure(self, kind: str, token: str) -> str:
        if kind == "git":
            return self.git_value(token)
        if kind == "gitstate":
            return self.git_state()
        if kind == "which":
            return shutil.which(token) or "absent"
        path = self.real(token)
        if kind == "file":
            return self.file_value(kind, token, path)
        if kind == "list":
            return self.list_value(kind, token, path)
        if kind == "link":
            return self.link_value(path)
        if kind in {"stat", "lstat"}:
            return self.stat_value(kind, token, path)
        raise ValueError(f"unknown input kind {kind}")

    def signature(self, status: os.stat_result) -> tuple[int, ...]:
        return (status.st_mode, status.st_ino, status.st_size, status.st_mtime_ns, status.st_ctime_ns)

    def file_value(self, kind: str, token: str, path: str) -> str:
        for _attempt in range(2):
            digest = hashlib.sha256()
            try:
                before = os.stat(path)
                if stat.S_ISDIR(before.st_mode):
                    self.signatures[(kind, token)] = None
                    return "dir"
                with open(path, "rb") as handle:
                    while chunk := handle.read(1 << 20):
                        digest.update(chunk)
                after = os.stat(path)
            except OSError as exc:
                return error_value(exc)
            if self.signature(before) == self.signature(after):
                self.signatures[(kind, token)] = self.signature(after)
                return "sha256:" + digest.hexdigest()
        # It is changing as we read it: a value nothing can ever match.
        return f"unstable:{time.time_ns()}"

    def stat_value(self, kind: str, token: str, path: str) -> str:
        try:
            status = os.stat(path) if kind == "stat" else os.lstat(path)
        except OSError as exc:
            return error_value(exc)
        mode = status.st_mode
        if stat.S_ISREG(mode):
            if path.endswith(".py"):
                # The importer stats a source and goes on to its .pyc when that is valid, so a stat of a
                # .py is a read of it as far as the program's behaviour goes.
                return self.file_value(kind, token, path)
            self.signatures[(kind, token)] = self.signature(status)
            return f"reg:{status.st_size}"
        if stat.S_ISDIR(mode):
            return "dir"
        if stat.S_ISLNK(mode):
            return "lnk"
        return f"other:{stat.S_IFMT(mode)}"

    def link_value(self, path: str) -> str:
        try:
            return "target:" + os.readlink(path).replace(str(self.root), ROOT_TOKEN)
        except OSError as exc:
            if exc.errno == errno.EINVAL:
                return "notlink"
            return error_value(exc)

    def list_value(self, kind: str, token: str, path: str) -> str:
        try:
            rows = []
            with os.scandir(path) as entries:
                for entry in entries:
                    if entry.name == "__pycache__":
                        continue
                    rows.append((entry.name, "l" if entry.is_symlink() else "d" if entry.is_dir(follow_symlinks=False)
                                 else "f" if entry.is_file(follow_symlinks=False) else "o"))
        except OSError as exc:
            return error_value(exc)
        return "list:" + sha256_text(canonical(sorted(rows)))

    def run_git(self, argv: list[str], cwd: str) -> tuple[int, bytes]:
        proc = subprocess.run(["git", *argv], cwd=cwd, capture_output=True, stdin=subprocess.DEVNULL, check=False)
        return proc.returncode, proc.stdout

    def git_value(self, token: str) -> str:
        entry = json.loads(token)
        argv = [arg.replace(ROOT_TOKEN, str(self.root)) for arg in entry["argv"]]
        code, out = self.run_git(argv, self.real(entry["cwd"]))
        out = out.replace(os.fsencode(str(self.root)), ROOT_TOKEN.encode("utf-8"))
        return f"rc:{code}:{hashlib.sha256(out).hexdigest()}"

    def git_state(self) -> str:
        """Everything a git read can depend on: which clone, HEAD, every ref, the index."""
        digest = hashlib.sha256()
        root = str(self.root)
        for argv in (["rev-parse", "--path-format=absolute", "--git-common-dir"], ["rev-parse", "HEAD"],
                     ["for-each-ref", "--format=%(objectname) %(refname)"], ["ls-files", "-s"]):
            code, out = self.run_git(argv, root)
            digest.update(f"{code}\0".encode() + out + b"\0")
        return "state:" + digest.hexdigest()

    def changed(self) -> list[str]:
        """What moved since it was measured. A listing is read again, because creating `__pycache__` or the
        temporary audit link touches a folder's times without changing what a validator sees."""
        out: list[str] = []
        for (kind, token), value in sorted(self.values.items()):
            if kind == "list":
                if self.list_value(kind, token, self.real(token)) != value:
                    out.append(token)
            elif kind == "link":
                if self.measure(kind, token) != value:
                    out.append(token)
            elif kind in {"file", "stat", "lstat"}:
                expected = self.signatures.get((kind, token))
                if expected is None:
                    if self.measure(kind, token) != value:
                        out.append(token)
                    continue
                try:
                    path = self.real(token)
                    status = os.stat(path) if kind != "lstat" else os.lstat(path)
                except OSError:
                    out.append(token)
                    continue
                if self.signature(status) != expected:
                    out.append(token)
        return out


def error_value(exc: OSError) -> str:
    if exc.errno in {errno.ENOENT, errno.ENOTDIR}:
        return "absent"
    return "err:" + errno.errorcode.get(exc.errno or 0, str(exc.errno))


def raced_inputs(values: Iterable[str], fingerprints: Fingerprints, started_ns: int, margin_ns: int = RACE_MARGIN_NS) -> list[str]:
    """Inputs that changed about when the unit ran. It may have read the bytes before the change and we hashed
    them after it, so the entry would claim a result for bytes it never saw. A folder only matters when it is
    listed; ctime cannot be set from user space, so this holds whatever a tool does with mtime."""
    out: list[str] = []
    limit = started_ns - margin_ns
    for key in values:
        kind, _, token = key.partition(" ")
        if kind not in {"file", "stat", "lstat", "list", "link"}:
            continue
        try:
            status = os.lstat(fingerprints.real(token)) if kind in {"lstat", "link"} else os.stat(fingerprints.real(token))
        except OSError:
            continue
        if stat.S_ISDIR(status.st_mode) and kind != "list":
            continue
        if status.st_ctime_ns >= limit:
            out.append(token)
    return out


# ------------------------------------------------------------------------------- the store


def normalized_command(argv: list[str], root: Path) -> list[str]:
    """A command as the key sees it: the interpreter by name, no scratch report path, no time bound.

    The bound decides whether a run finishes, never what a finished run says: reports are read for rows only,
    a report with a timeout row is never stored, and a rerun after a timeout with a larger bound is exactly the
    case that should reuse everything that did finish.
    """
    out: list[str] = ["python"]
    skip = False
    for arg in argv[1:]:
        if skip:
            skip = False
            continue
        if arg in {"--report", "--subcheck-timeout-seconds"}:
            skip = True
            continue
        out.append(arg.replace(str(root), ROOT_TOKEN))
    return out


def tool_identity() -> dict[str, str]:
    git = subprocess.run(["git", "--version"], capture_output=True, text=True, check=False).stdout.strip()
    return {
        "schema": SCHEMA,
        "python": sys.version,
        "python_path": sys.executable,
        "git": git,
        "git_path": shutil.which("git") or "",
        "module": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
    }


def command_key(identity: dict[str, str], command: list[str], environment: dict[str, str]) -> str:
    return sha256_text(canonical({"identity": identity, "command": command, "environment": environment_digest(environment)}))


def tokenize_output(text: str, root: Path) -> str:
    """The checkout's absolute path out of a stored output, so a result carries over to another checkout."""
    return re.sub(re.escape(str(root)) + r"(?![A-Za-z0-9_.\-])", OUTPUT_ROOT_TOKEN, text)


def detokenize_output(text: str, root: Path) -> str:
    return text.replace(OUTPUT_ROOT_TOKEN, str(root))


def write_atomic(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    handle, temporary = tempfile.mkstemp(dir=path.parent, prefix=".tmp-")
    try:
        with os.fdopen(handle, "wb") as out:
            out.write(data)
        os.replace(temporary, path)
    except BaseException:
        Path(temporary).unlink(missing_ok=True)
        raise


def write_json_gz(path: Path, value: Any) -> None:
    write_atomic(path, gzip.compress(json.dumps(value, sort_keys=True).encode("utf-8", "surrogateescape"), compresslevel=6, mtime=0))


def read_json_gz(path: Path) -> Any:
    return json.loads(gzip.decompress(path.read_bytes()).decode("utf-8", "surrogateescape"))


@dataclass
class Unit:
    """One unit's outcome, as the report header prints it."""

    label: str
    status: str  # "cache": reused; "fresh": ran and stored; "never": ran and not stored.
    key: str = ""
    detail: str = ""
    recorded_at: str = ""
    commit: str = ""
    elapsed_seconds: float = 0.0
    changed: list[str] = field(default_factory=list)
    changed_total: int = 0

    def row(self) -> dict[str, Any]:
        return dict(self.__dict__)


class Store:
    """The cache folder: <dir>/<schema>/<key>/m-<manifest>.json.gz, the inputs one recorded run of that command
    measured, and r-<manifest>-<digest>.json.gz, what it wrote when those inputs had that digest."""

    def __init__(self, folder: Path, root: Path, fingerprints: Fingerprints, race_margin_ns: int = RACE_MARGIN_NS):
        self.folder = folder
        self.root = root
        self.fingerprints = fingerprints
        self.race_margin_ns = race_margin_ns

    def unit_dir(self, key: str) -> Path:
        return self.folder / SCHEMA / key

    def lookup(self, key: str) -> tuple[dict[str, Any] | None, str, list[str], int]:
        """(the entry when one matches, why not, the inputs that changed, how many)."""
        folder = self.unit_dir(key)
        try:
            manifests = sorted(folder.glob("m-*.json.gz"), key=lambda path: path.stat().st_mtime_ns, reverse=True)
        except OSError:
            manifests = []
        if not manifests:
            return None, "nothing recorded for this command", [], 0
        for path in manifests[:MANIFESTS_PER_COMMAND]:
            try:
                manifest = read_json_gz(path)
                inputs = [(row[0], row[1]) for row in manifest["inputs"]]
            except (OSError, ValueError, KeyError, IndexError, TypeError):
                path.unlink(missing_ok=True)
                continue
            values = self.fingerprints.values_of(inputs)
            digest = sha256_text(canonical(values))
            entry_path = folder / f"r-{manifest['id']}-{digest}.json.gz"
            if not entry_path.exists():
                continue
            try:
                entry = read_json_gz(entry_path)
                if entry["digest"] != digest or entry["key"] != key:
                    raise ValueError("entry does not match its name")
                if entry["inputs"] != values:
                    raise ValueError("entry's inputs differ")
            except (OSError, ValueError, KeyError, TypeError):
                entry_path.unlink(missing_ok=True)
                continue
            now = time.time()
            for touched in (path, entry_path):
                try:
                    os.utime(touched, (now, now))
                except OSError:
                    pass
            return entry, "", [], 0
        return (None, *self.explain(folder, manifests))

    def explain(self, folder: Path, manifests: list[Path]) -> tuple[str, list[str], int]:
        """Which inputs differ from the latest recorded run: what makes a miss readable, and what the negative
        tests read."""
        try:
            entries = sorted(folder.glob("r-*.json.gz"), key=lambda path: path.stat().st_mtime_ns, reverse=True)
            if not entries:
                return "a recorded run has no result left", [], 0
            old = read_json_gz(entries[0])["inputs"]
            pairs = [tuple(key.split(" ", 1)) for key in old]
            now = self.fingerprints.values_of(pairs)
        except (OSError, ValueError, KeyError, TypeError):
            return "the recorded run could not be read", [], 0
        differ = sorted(key for key in old if old[key] != now[key])
        if not differ:
            # Same values, no entry under that name: a different recorded read set matched neither.
            return "no recorded run matches", [], 0
        names = [key.split(" ", 1)[1] for key in differ]
        short = [self.short_name(name) for name in names]
        return f"input changed: {short[0]}" + (f" and {len(short) - 1} more" if len(short) > 1 else ""), short[:20], len(short)

    def short_name(self, name: str) -> str:
        if name.startswith(ROOT_TOKEN + "/"):
            return name[len(ROOT_TOKEN) + 1:]
        return name[:200]

    def store(self, key: str, command: list[str], trace: Trace, outputs: dict[str, Any], started_ns: int,
              elapsed: float, commit: str) -> tuple[str, str]:
        """(digest, "") when stored, ("", why not) when not."""
        inputs = sorted(trace.reads)
        inputs += [("which", name) for name in sorted(trace.which)]
        git = list(trace.git)
        needs_state = trace.git_needs_state
        if len(git) > MAX_GIT_REPLAYS:
            needs_state = True
            # The repository's state covers history; what the working tree holds still has to be asked.
            git = [entry for entry in git if {"ls-files", "status", "diff"} & set(entry["argv"])]
        inputs += [("git", canonical(entry)) for entry in git]
        if needs_state:
            inputs.append(("gitstate", "state"))
        values = self.fingerprints.values_of(inputs)
        unstable = [key_name for key_name, value in values.items() if value.startswith("unstable:")]
        if unstable:
            return "", f"an input was changing while it was hashed: {self.short_name(unstable[0].split(' ', 1)[1])}"
        raced = raced_inputs(values, self.fingerprints, started_ns, self.race_margin_ns)
        if raced:
            return "", f"an input changed about when it ran: {self.short_name(raced[0])}"
        manifest_id = sha256_text(canonical(sorted(values)))[:32]
        digest = sha256_text(canonical(values))
        folder = self.unit_dir(key)
        write_json_gz(folder / f"m-{manifest_id}.json.gz", {"id": manifest_id, "inputs": [list(pair) for pair in inputs]})
        write_json_gz(folder / f"r-{manifest_id}-{digest}.json.gz", {
            "schema": SCHEMA,
            "key": key,
            "digest": digest,
            "command": command,
            "recorded_at_utc": utc_now(),
            "commit": commit,
            "elapsed_seconds": round(elapsed, 1),
            "inputs": values,
            "outputs": {name: (tokenize_output(value, self.root) if isinstance(value, str) else value)
                        for name, value in outputs.items()},
        })
        return digest, ""


def evict(folder: Path, max_bytes: int) -> int:
    """Oldest entries go first until the folder fits. A hit touches its files, so this is least recently used."""
    rows: list[tuple[int, int, Path]] = []
    total = 0
    for directory, _subdirs, names in os.walk(folder):
        for name in names:
            path = Path(directory) / name
            try:
                status = path.stat()
            except OSError:
                continue
            rows.append((status.st_mtime_ns, status.st_size, path))
            total += status.st_size
    removed = 0
    for _mtime, size, path in sorted(rows):
        if total <= max_bytes:
            break
        try:
            path.unlink()
        except OSError:
            continue
        total -= size
        removed += 1
    return removed


# ------------------------------------------------------------------------------- running one unit


def report_says_it_did_not_finish(text: str) -> bool:
    return any(f'"{error}"' in text for error in INFRASTRUCTURE_ERRORS)


class Runner:
    """Look a unit up, or run it traced and record it. Runs in the process that would have spawned the unit."""

    def __init__(self, root: Path, cache_dir: Path, stats: Path | None, label: str, race_margin_ns: int = RACE_MARGIN_NS):
        self.root = root
        self.label = label
        self.stats = stats
        self.fingerprints = Fingerprints(root)
        self.store = Store(cache_dir, root, self.fingerprints, race_margin_ns)
        self.tracer = Tracer()
        self.identity = tool_identity()
        self.commit = subprocess.run(["git", "rev-parse", "HEAD"], cwd=root, capture_output=True, text=True,
                                     check=False).stdout.strip()
        self.git_state_at_start: str | None = None

    def note(self, unit: Unit) -> Unit:
        if self.stats is not None:
            with self.stats.open("a", encoding="utf-8") as out:
                out.write(json.dumps(unit.row(), sort_keys=True) + "\n")
        return unit

    def key_of(self, argv: list[str], environment: dict[str, str]) -> tuple[str, list[str]]:
        command = normalized_command(argv, self.root)
        return command_key(self.identity, command, environment), command

    def lookup(self, name: str, argv: list[str], environment: dict[str, str]) -> tuple[dict[str, Any] | None, Unit]:
        """The entry and a noted unit on a hit; (None, a unit to finish) on a miss."""
        key, _command = self.key_of(argv, environment)
        unit = Unit(label=f"{self.label}/{name}" if self.label else name, status="never", key=key[:16])
        try:
            entry, why, changed, total = self.store.lookup(key)
        except Exception as exc:  # noqa: BLE001 - a broken cache costs a rerun, nothing else.
            entry, why, changed, total = None, f"the lookup failed ({type(exc).__name__}: {exc})", [], 0
        if entry is not None:
            unit.status = "cache"
            unit.key = f"{key[:16]}-{entry['digest'][:16]}"
            unit.recorded_at = entry.get("recorded_at_utc", "")
            unit.commit = str(entry.get("commit", ""))[:12]
            unit.elapsed_seconds = float(entry.get("elapsed_seconds", 0.0))
            self.note(unit)
            return entry, unit
        unit.detail, unit.changed, unit.changed_total = why, changed, total
        return None, unit

    def outputs_of(self, entry: dict[str, Any]) -> dict[str, Any]:
        return {name: (detokenize_output(value, self.root) if isinstance(value, str) else value)
                for name, value in entry["outputs"].items()}

    def record(self, unit: Unit, argv: list[str], environment: dict[str, str], log: Path, outputs: dict[str, Any],
               started_ns: int, elapsed: float, scratch: Iterable[str]) -> Unit:
        """After a traced run: store it if it can be stored, say why not otherwise."""
        unit.elapsed_seconds = round(elapsed, 1)
        why_missed = unit.detail
        trace_reasons: list[str] = []
        try:
            trace = read_trace(log, self.root, scratch)
            trace_reasons = list(trace.reasons)
            code = outputs.get("returncode")
            for name in ("report", "stdout"):
                value = outputs.get(name)
                if isinstance(value, str) and report_says_it_did_not_finish(value):
                    trace_reasons.append("its report holds a timeout row")
                    break
            if code not in (0, 1):
                trace_reasons.append(f"it exited with {code}")
            if not (outputs.get("report") or outputs.get("stdout")):
                trace_reasons.append("it wrote no report")
            if (trace.git or trace.git_needs_state) and self.git_state_at_start is not None:
                if Fingerprints(self.root).git_state() != self.git_state_at_start:
                    trace_reasons.append("the repository's HEAD, refs or index moved while it ran")
            if trace_reasons:
                unit.status, unit.detail = "never", trace_reasons[0]
                return self.note(unit)
            key, command = self.key_of(argv, environment)
            digest, refused = self.store.store(key, command, trace, outputs, started_ns, elapsed, self.commit)
            if refused:
                unit.status, unit.detail = "never", refused
            else:
                unit.status = "fresh"
                unit.key = f"{key[:16]}-{digest[:16]}"
                unit.detail = why_missed
        except Exception as exc:  # noqa: BLE001 - a result that cannot be recorded is still the fresh result.
            unit.status, unit.detail = "never", f"recording failed ({type(exc).__name__}: {exc})"
        return self.note(unit)

    def untraced(self, unit: Unit) -> None:
        unit.status = "never"
        unit.detail = self.tracer.problem or "it could not be traced"
        self.note(unit)

    def start_git_watch(self) -> None:
        self.git_state_at_start = Fingerprints(self.root).git_state()

    def whole_command(self, name: str, argv: list[str]) -> int:
        """A unit that is one whole command: pm-plan-migration.py validate. Prints what it printed, exits as it did."""
        environment = dict(os.environ)
        entry, unit = self.lookup(name, argv, environment)
        if entry is not None:
            outputs = self.outputs_of(entry)
            sys.stdout.write(outputs.get("stdout") or "")
            sys.stderr.write(outputs.get("stderr") or "")
            return int(outputs.get("returncode") or 0)
        if self.tracer.problem:
            proc = subprocess.run(argv, cwd=self.root, capture_output=True, text=True, check=False)
            self.untraced(unit)
        else:
            self.start_git_watch()
            with tempfile.TemporaryDirectory(prefix="pm-landing-cache-trace-") as scratch:
                log = Path(scratch) / "trace.log"
                started_ns, started = time.time_ns(), time.monotonic()
                proc = subprocess.run(self.tracer.wrap(log, argv), cwd=self.root, capture_output=True, text=True, check=False)
                outputs = {"stdout": proc.stdout, "stderr": proc.stderr, "returncode": proc.returncode}
                self.record(unit, argv, environment, log, outputs, started_ns, time.monotonic() - started,
                            [tempfile.gettempdir(), scratch])
        sys.stdout.write(proc.stdout)
        sys.stderr.write(proc.stderr)
        return proc.returncode

    def aggregate(self, argv: list[str]) -> int:
        """run-gates or audit-governance, by their own code, with subcheck spawns going through the cache."""
        script = self.root / argv[1]
        spec = importlib.util.spec_from_file_location("pm_plans_verify_cached_aggregate", script)
        if spec is None or spec.loader is None:
            raise RuntimeError(f"{script} cannot be loaded")
        module = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = module
        spec.loader.exec_module(module)
        original = module.run_validator_subprocess
        self.start_git_watch()

        def spawn(check_name, child_argv, *, timeout_seconds, extra_failure_fields=None, aggregate_child=False):
            return self.spawn_subcheck(original, check_name, child_argv, timeout_seconds, extra_failure_fields, aggregate_child)

        module.run_validator_subprocess = spawn
        saved_argv = sys.argv
        sys.argv = [argv[1], *argv[2:]]
        try:
            return int(module.main())
        finally:
            sys.argv = saved_argv

    def spawn_subcheck(self, original, check_name, argv, timeout_seconds, extra_failure_fields, aggregate_child):
        run_plain = lambda: original(check_name, argv, timeout_seconds=timeout_seconds,  # noqa: E731
                                     extra_failure_fields=extra_failure_fields, aggregate_child=aggregate_child)
        # Only the shape an aggregate spawns is a unit; anything else (a helper of an in-process check) just runs.
        if not aggregate_child or "--report" not in argv:
            return run_plain()
        report_path = Path(argv[argv.index("--report") + 1])
        environment = dict(os.environ)
        environment[AGGREGATE_CHILD_ENV] = "1"
        entry, unit = self.lookup(check_name, argv, environment)
        if entry is not None:
            outputs = self.outputs_of(entry)
            report_path.write_text(outputs.get("report") or "", encoding="utf-8", errors="surrogateescape")
            return subprocess.CompletedProcess(args=argv, returncode=int(outputs.get("returncode") or 0),
                                               stdout=outputs.get("stdout") or "", stderr=outputs.get("stderr") or ""), None
        if self.tracer.problem:
            result = run_plain()
            self.untraced(unit)
            return result
        with tempfile.TemporaryDirectory(prefix="pm-landing-cache-trace-") as scratch:
            log = Path(scratch) / "trace.log"
            started_ns, started = time.time_ns(), time.monotonic()
            proc, timeout_report = original(check_name, self.tracer.wrap(log, argv), timeout_seconds=timeout_seconds,
                                            extra_failure_fields=extra_failure_fields, aggregate_child=aggregate_child)
            elapsed = time.monotonic() - started
            if timeout_report is not None or proc is None:
                unit.status, unit.detail, unit.elapsed_seconds = "never", "it timed out", round(elapsed, 1)
                self.note(unit)
                return proc, timeout_report
            report = report_path.read_text(encoding="utf-8", errors="surrogateescape") if report_path.is_file() else ""
            outputs = {"report": report, "stdout": proc.stdout, "stderr": proc.stderr, "returncode": proc.returncode}
            self.record(unit, argv, environment, log, outputs, started_ns, elapsed,
                        [tempfile.gettempdir(), str(report_path.parent), scratch])
        return subprocess.CompletedProcess(args=argv, returncode=proc.returncode, stdout=proc.stdout, stderr=proc.stderr), None

    def finish(self) -> list[str]:
        """What moved under the units this process looked up or recorded."""
        return self.fingerprints.changed()


# ------------------------------------------------------------------------------- pm-landing-check's side


class LandingCache:
    """What pm-landing-check.py holds while --cache is on: three hooks and the report header's section."""

    def __init__(self, root: Path, cache_dir: Path, max_mb: int, keep_dir: str | None = None):
        self.root = root
        self.cache_dir = cache_dir
        self.max_mb = max_mb
        self.keep_dir = Path(keep_dir).resolve() if keep_dir else None
        self.work = Path(tempfile.mkdtemp(prefix="pm-landing-cache-"))
        atexit.register(shutil.rmtree, self.work, ignore_errors=True)
        self.stats = self.work / "units.jsonl"
        self.runner: Runner | None = None
        self.units: list[dict[str, Any]] = []
        self.unstable: list[str] = []
        self.tracer_note = ""

    @classmethod
    def open(cls, root: Path, args: argparse.Namespace) -> "LandingCache":
        """Refuses what must not happen: recording a baseline from cached results, a cache inside the repository."""
        if args.record_baseline:
            raise RuntimeError(
                "--cache refuses --record-baseline: a baseline is what every later landing is judged against, so it "
                "comes from a run in which every check really ran. Run --record-baseline without --cache.")
        cache_dir = Path(args.cache_dir).expanduser().resolve() if args.cache_dir else default_cache_dir()
        if cache_dir == root or root in cache_dir.parents:
            raise RuntimeError(f"--cache-dir must be outside the repository: {cache_dir}")
        cache_dir.mkdir(parents=True, exist_ok=True)
        return cls(root, cache_dir, args.cache_max_mb, args.keep_check_reports)

    def settle(self) -> None:
        """A clean worktree's temporary audit link was made a moment ago, which reads as a race on the folder it
        sits in for a unit that starts now and lists that folder. Starting after the margin costs seconds once."""
        try:
            age = time.time_ns() - os.stat(self.root / "Plans" / ".audits").st_ctime_ns
        except OSError:
            return
        if 0 <= age < RACE_MARGIN_NS:
            time.sleep((RACE_MARGIN_NS - age) / 1e9 + 0.05)

    def wrap_check(self, name: str, argv: list[str]) -> list[str]:
        self.settle()
        return [sys.executable, str(Path(__file__).resolve()), "exec", "--root", str(self.root), "--cache-dir",
                str(self.cache_dir), "--stats", str(self.stats), "--label", name, "--", *argv]

    def export(self, argv: list[str]) -> dict[str, Any] | None:
        """A subcheck's export from the cache, shaped as run_export returns it, or None to run it as ever.

        One lookup at export time, of the same inputs as the aggregates' run: if the tree moved in between, the
        key misses and the export really runs, so the check's total and row comparisons still see that.
        """
        if self.runner is None:
            self.runner = Runner(self.root, self.cache_dir, self.stats, "export")
        command = [sys.executable, "scripts/pm-plans-verify.py", argv[0], "--report", "-", *argv[1:]]
        environment = dict(os.environ)
        environment[AGGREGATE_CHILD_ENV] = "1"
        entry, unit = self.runner.lookup(argv[0], command, environment)
        if entry is None:
            unit.detail = f"the export runs as ever: {unit.detail}"
            self.runner.note(unit)
            return None
        outputs = self.runner.outputs_of(entry)
        payload = outputs.get("report") or outputs.get("stdout") or ""
        try:
            report = json.loads(payload)
        except ValueError:
            return None
        if not isinstance(report, dict) or not isinstance(report.get("failures"), list):
            return None
        return {"report": report, "timed_out": False, "error": None, "elapsed_seconds": 0.0}

    def finish(self) -> None:
        """After the exports, before anything is judged: read what the units did, and stop if the tree moved."""
        if self.stats.exists():
            for line in self.stats.read_text(encoding="utf-8").splitlines():
                row = json.loads(line)
                if row.get("status") == "unstable":
                    self.unstable.extend(row.get("changed") or [])
                else:
                    self.units.append(row)
        if self.runner is not None:
            self.unstable.extend(self.runner.finish())
        tracer = Tracer()
        self.tracer_note = tracer.problem or tracer.version
        evict(self.cache_dir, self.max_mb * 1024 * 1024)
        if self.keep_dir is not None and self.keep_dir.is_dir():
            (self.keep_dir / "cache.json").write_text(json.dumps(self.summary(), indent=1, sort_keys=True) + "\n",
                                                      encoding="utf-8")
        shutil.rmtree(self.work, ignore_errors=True)
        if self.unstable:
            names = ", ".join(sorted(set(self.unstable))[:5])
            raise RuntimeError(f"--cache: inputs changed during this run, so its parts did not all see one state: {names}. "
                               "Rerun on a tree nothing is writing to.")

    def counts(self) -> dict[str, int]:
        return {status: sum(1 for row in self.units if row["status"] == status) for status in ("cache", "fresh", "never")}

    def summary(self) -> dict[str, Any]:
        return {"directory": str(self.cache_dir), "tracer": self.tracer_note, "counts": self.counts(), "units": self.units}

    def header(self) -> list[str]:
        counts = self.counts()
        lines = [f"  --cache: {counts['cache']} of {len(self.units)} validator runs came from the cache, "
                 f"{counts['fresh']} ran and were stored, {counts['never']} ran and were not "
                 f"({self.cache_dir}; tracer: {self.tracer_note})"]
        for row in self.units:
            tag = {"cache": "cache", "fresh": "fresh", "never": "never"}[row["status"]]
            if row["status"] == "cache":
                tail = f"recorded {row['recorded_at']} at {row['commit']}, ran {row['elapsed_seconds']} s then"
            else:
                tail = row["detail"] or "nothing recorded"
            lines.append(f"    [{tag}] {row['label']}  key {row['key']}  {tail}")
        return lines


def default_cache_dir() -> Path:
    base = os.environ.get("XDG_CACHE_HOME")
    return (Path(base) if base else Path.home() / ".cache") / "pm-landing-cache"


# ------------------------------------------------------------------------------- the child process


def exec_main(args: argparse.Namespace) -> int:
    """Stands where a check's command stood: same stdout, same report file, same exit code."""
    root = Path(args.root).resolve()
    margin = RACE_MARGIN_NS if args.race_margin_ms is None else args.race_margin_ms * 1_000_000
    runner = Runner(root, Path(args.cache_dir), Path(args.stats) if args.stats else None, args.label, margin)
    argv = args.command
    if argv and argv[0] == "--":
        argv = argv[1:]
    aggregate = len(argv) > 2 and argv[2] in AGGREGATES and argv[1].endswith("pm-plans-verify.py")
    try:
        code = runner.aggregate(argv) if aggregate else runner.whole_command(args.label, argv)
    finally:
        changed = runner.finish()
        if changed and runner.stats is not None:
            with runner.stats.open("a", encoding="utf-8") as out:
                out.write(json.dumps({"status": "unstable", "label": args.label, "changed": changed[:20]}) + "\n")
    return code


def compare_main(args: argparse.Namespace) -> int:
    """Whether two --keep-check-reports folders hold the same results: every field but the ones that move on their
    own (when it ran, how long it took, which checkout). What the measurement of cached against fresh prints."""
    def load(folder: str, name: str) -> Any:
        return normalize_report(json.loads((Path(folder) / f"{name}.json").read_text(encoding="utf-8")), args.root_a if folder == args.first else args.root_b)

    code = 0
    for name in ("run-gates", "audit-governance", "plan-migration-validate"):
        first, second = load(args.first, name), load(args.second, name)
        if first == second:
            print(f"same     {name}")
        else:
            code = 1
            print(f"DIFFERS  {name}: {first_difference(first, second)}")
    return code


def normalize_report(value: Any, root: str | None) -> Any:
    if isinstance(value, dict):
        return {key: normalize_report(item, root) for key, item in value.items()
                if key not in {"generated_at_utc", "elapsed_ms", "elapsed_seconds", "duration_seconds"}}
    if isinstance(value, list):
        return [normalize_report(item, root) for item in value]
    if isinstance(value, str) and root:
        return value.replace(root, ROOT_TOKEN)
    return value


def first_difference(first: Any, second: Any, where: str = "") -> str:
    if isinstance(first, dict) and isinstance(second, dict):
        for key in sorted(set(first) | set(second)):
            if key not in first or key not in second:
                return f"{where}/{key} is only on one side"
            if first[key] != second[key]:
                return first_difference(first[key], second[key], f"{where}/{key}")
    if isinstance(first, list) and isinstance(second, list):
        if len(first) != len(second):
            return f"{where} has {len(first)} rows against {len(second)}"
        for index, (one, other) in enumerate(zip(first, second)):
            if one != other:
                return first_difference(one, other, f"{where}[{index}]")
    return f"{where}: {str(first)[:120]} / {str(second)[:120]}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    commands = parser.add_subparsers(dest="action", required=True)
    run = commands.add_parser("exec", help="run one check's command through the cache (pm-landing-check.py does this)")
    run.add_argument("--root", required=True)
    run.add_argument("--cache-dir", required=True)
    run.add_argument("--stats")
    run.add_argument("--label", default="")
    run.add_argument("--race-margin-ms", type=int, default=None, help=argparse.SUPPRESS)  # the tests' tree is seconds old
    run.add_argument("command", nargs=argparse.REMAINDER)
    compare = commands.add_parser("compare", help="compare two --keep-check-reports folders")
    compare.add_argument("first")
    compare.add_argument("second")
    compare.add_argument("--root-a", default=None, help="the checkout the first folder ran in")
    compare.add_argument("--root-b", default=None, help="the checkout the second folder ran in")
    args = parser.parse_args()
    return exec_main(args) if args.action == "exec" else compare_main(args)


if __name__ == "__main__":
    raise SystemExit(main())
