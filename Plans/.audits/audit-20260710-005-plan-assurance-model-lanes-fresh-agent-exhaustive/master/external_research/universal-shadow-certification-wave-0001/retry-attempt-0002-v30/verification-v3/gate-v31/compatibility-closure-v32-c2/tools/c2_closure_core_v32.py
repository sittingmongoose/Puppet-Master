#!/usr/bin/env python3
"""Fail-closed C2 future-reviewer/native-capture preparation primitives."""
from __future__ import annotations

import hashlib
import importlib.metadata
import json
import os
import re
import stat
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Iterable, Optional, Union

from jsonschema import Draft202012Validator, FormatChecker


AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
WAVE_ID = "universal-shadow-certification-wave-0001"
ATTEMPT_ID = "attempt-0002"
SLOT_ID = "c2-atomic8-prelaunch"
COHORT_ID = "cohort-0002"
CONTROLLER_ID = "019f553d-af6e-7c91-a43f-d81e06d100fd"
PRIOR_REVIEWER_ID = "019f556b-8004-7eb2-b4dc-b92f6f03f835"
MODEL = "gpt-5.6-luna"
EFFORT = "max"
SPAWN_MARKER = "A005-ERSC-GATE-V31-C2-ATOMIC8-PRELAUNCH"
TASK_NAME = "a005_ersc_v31_c2_atomic8_prelaunch_luna_max"
SOURCE_DIGEST = "c4ce218e0aa044d850b1b026fe10b98766138748b585e2680916fb80964cc70f"
REPORT_SHA = "a916e52e5b8994cce2000df919c899718ce41b2f7abc15f9f5be71b7adc3619d"
REPORT_SIZE = 1509
REPORT_RELATIVE = "master/external_research/universal-shadow-certification-wave-0001/retry-attempt-0002-v30/verification-v3/gate-v31/reports/c2-atomic8-prelaunch.json"
CAPTURE_RELATIVE = "controller-native-captures/c2-atomic8-prelaunch.json"
CHECKPOINT_RELATIVE = "controller-native-checkpoints/c2-atomic8-prelaunch.jsonl"
UUID7 = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
FORBIDDEN_ACTIONS = ("followup_task", "send_message", "interrupt_agent")
PINNED_PYTHON = Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
PYTHON_SHA = "eb9d74b9c7cfdfb2c9b91614edb2c3607360ba46c5aa7fc4557b3a4a23e97cff"
JSONSCHEMA_RECORD_SHA = "82af429e01d10b4c19118aeb1ae1462db5074c62564a7f355c4a68a3a910b1c8"


class ClosureError(RuntimeError):
    def __init__(self, codes: Union[str, Iterable[str]]):
        self.codes = (codes,) if isinstance(codes, str) else tuple(sorted(set(codes)))
        super().__init__(",".join(self.codes))


@dataclass(frozen=True)
class StableRead:
    raw: bytes
    stat: os.stat_result
    sha256: str


@dataclass(frozen=True)
class FutureEvidence:
    report: StableRead
    report_document: dict[str, Any]
    binding: StableRead
    binding_document: dict[str, Any]
    parent_raw: tuple[bytes, ...]
    parent_rows: tuple[dict[str, Any], ...]
    child: StableRead
    child_raw: tuple[bytes, ...]
    child_rows: tuple[dict[str, Any], ...]


def sha_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def canonical(document: Any) -> bytes:
    return (json.dumps(document, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def pretty(document: Any) -> bytes:
    return (json.dumps(document, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode()


def require(errors: list[str], code: str, condition: bool) -> None:
    if not condition:
        errors.append(code)


def _inside(path: Path, root: Path, *, strict: bool) -> bool:
    try:
        path.resolve(strict=strict).relative_to(root.resolve(strict=True))
        return True
    except (FileNotFoundError, OSError, RuntimeError, ValueError):
        return False


def _safe_parent_chain(path: Path, root: Path) -> None:
    if not _inside(path.parent, root, strict=True):
        raise ClosureError("path-escape")
    expected = root.resolve(strict=True)
    current = path.parent
    while True:
        item = os.lstat(current)
        if stat.S_ISLNK(item.st_mode) or not stat.S_ISDIR(item.st_mode):
            raise ClosureError("parent-symlink-or-nondirectory")
        if current.resolve(strict=True) == expected:
            return
        if current.parent == current:
            raise ClosureError("parent-root-not-reached")
        current = current.parent


def _raise_walk_error(code: str, error: OSError) -> None:
    """Turn os.walk's otherwise-skippable traversal errors into closure errors."""
    raise ClosureError(code) from error


def _regular_lstat(path: Path, root: Path) -> os.stat_result:
    try:
        item = os.lstat(path)
    except FileNotFoundError as exc:
        raise ClosureError("path-missing") from exc
    if stat.S_ISLNK(item.st_mode):
        raise ClosureError("path-symlink")
    if not stat.S_ISREG(item.st_mode):
        raise ClosureError("path-not-regular")
    if item.st_nlink != 1:
        raise ClosureError("path-hardlink")
    if not _inside(path, root, strict=True):
        raise ClosureError("path-escape")
    _safe_parent_chain(path, root)
    return item


def _read_fd(descriptor: int) -> bytes:
    chunks: list[bytes] = []
    while True:
        chunk = os.read(descriptor, 1024 * 1024)
        if not chunk:
            return b"".join(chunks)
        chunks.append(chunk)


def _same(left: os.stat_result, right: os.stat_result, *, allow_append: bool = False) -> bool:
    if any(getattr(left, key) != getattr(right, key) for key in ("st_dev", "st_ino", "st_mode", "st_nlink")):
        return False
    return allow_append or (left.st_size == right.st_size and left.st_mtime_ns == right.st_mtime_ns)


def stable_read(path: Path, root: Path, *, between_reads: Optional[Callable[[Path], None]] = None) -> StableRead:
    before = _regular_lstat(path, root)
    descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(descriptor)
        if not _same(before, opened):
            raise ClosureError("open-identity-drift")
        first = _read_fd(descriptor)
        middle = os.fstat(descriptor)
        if between_reads:
            between_reads(path)
        os.lseek(descriptor, 0, os.SEEK_SET)
        second = _read_fd(descriptor)
        after = os.fstat(descriptor)
    finally:
        os.close(descriptor)
    final = _regular_lstat(path, root)
    if first != second:
        raise ClosureError("toctou-bytes")
    if not (_same(opened, middle) and _same(middle, after) and _same(after, final)):
        raise ClosureError("toctou-metadata")
    if len(first) != after.st_size:
        raise ClosureError("short-read")
    return StableRead(first, after, sha_bytes(first))


def stable_empty_real_directory(path: Path, root: Path) -> bool:
    """Read an empty directory without following the leaf or any parent symlink."""
    try:
        before = os.lstat(path)
    except FileNotFoundError as exc:
        raise ClosureError("directory-missing") from exc
    if stat.S_ISLNK(before.st_mode):
        raise ClosureError("directory-symlink")
    if not stat.S_ISDIR(before.st_mode):
        raise ClosureError("directory-not-directory")
    if not _inside(path, root, strict=True):
        raise ClosureError("directory-escape")
    _safe_parent_chain(path / ".c2-directory-probe", root)
    flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_DIRECTORY", 0)
    descriptor = os.open(path, flags)
    try:
        opened = os.fstat(descriptor)
        if not _same(before, opened):
            raise ClosureError("directory-open-identity-drift")
        first = tuple(sorted(os.listdir(descriptor)))
        middle = os.fstat(descriptor)
        second = tuple(sorted(os.listdir(descriptor)))
        after = os.fstat(descriptor)
    finally:
        os.close(descriptor)
    final = os.lstat(path)
    _safe_parent_chain(path / ".c2-directory-probe", root)
    if first != second:
        raise ClosureError("directory-toctou-entries")
    if not (_same(opened, middle) and _same(middle, after) and _same(after, final)):
        raise ClosureError("directory-toctou-metadata")
    return not first


def stable_prefix_jsonl(path: Path, root: Path, line_count: int, *, between_reads: Optional[Callable[[Path], None]] = None) -> tuple[tuple[bytes, ...], tuple[dict[str, Any], ...]]:
    before = _regular_lstat(path, root)
    descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(descriptor)
        if not _same(before, opened, allow_append=True):
            raise ClosureError("prefix-open-identity-drift")
        first_all = _read_fd(descriptor).splitlines(keepends=True)
        if between_reads:
            between_reads(path)
        os.lseek(descriptor, 0, os.SEEK_SET)
        second_all = _read_fd(descriptor).splitlines(keepends=True)
        after = os.fstat(descriptor)
    finally:
        os.close(descriptor)
    final = _regular_lstat(path, root)
    if not (_same(opened, after, allow_append=True) and _same(after, final, allow_append=True)):
        raise ClosureError("prefix-identity-drift")
    if line_count < 1 or len(first_all) < line_count or len(second_all) < line_count:
        raise ClosureError("prefix-line-count")
    first, second = tuple(first_all[:line_count]), tuple(second_all[:line_count])
    if first != second:
        raise ClosureError("prefix-toctou")
    if any(not line.endswith(b"\n") for line in first):
        raise ClosureError("prefix-line-termination")
    try:
        rows = tuple(json.loads(line) for line in first)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ClosureError("prefix-jsonl") from exc
    return first, rows


def stable_json(path: Path, root: Path) -> tuple[StableRead, dict[str, Any]]:
    item = stable_read(path, root)
    try:
        document = json.loads(item.raw)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ClosureError("json-parse") from exc
    if not isinstance(document, dict):
        raise ClosureError("json-object-required")
    return item, document


def stable_jsonl(path: Path, root: Path) -> tuple[StableRead, tuple[bytes, ...], tuple[dict[str, Any], ...]]:
    item = stable_read(path, root)
    raw = tuple(item.raw.splitlines(keepends=True))
    if not raw or any(not line.endswith(b"\n") for line in raw):
        raise ClosureError("jsonl-line-termination")
    try:
        rows = tuple(json.loads(line) for line in raw)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ClosureError("jsonl-parse") from exc
    return item, raw, rows


def raw_hash(raw: tuple[bytes, ...], line: int) -> str:
    return sha_bytes(raw[line - 1]) if 1 <= line <= len(raw) else ""


def schema_errors(document: dict[str, Any], schema: dict[str, Any]) -> list[str]:
    return sorted("schema:" + "/".join(map(str, error.absolute_path)) + ":" + error.validator for error in Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(document))


def validate_runtime(audit_root: Path) -> list[str]:
    errors: list[str] = []
    require(errors, "runtime-python-version", sys.version_info[:3] == (3, 12, 13))
    require(errors, "runtime-python-path", Path(sys.executable).resolve() == PINNED_PYTHON.resolve())
    require(errors, "runtime-python-sha", sha_bytes(PINNED_PYTHON.read_bytes()) == PYTHON_SHA)
    require(errors, "runtime-no-site", sys.flags.no_site == 1)
    require(errors, "runtime-bytecode", sys.dont_write_bytecode is True and os.environ.get("PYTHONDONTWRITEBYTECODE") == "1")
    require(errors, "runtime-no-user-site", os.environ.get("PYTHONNOUSERSITE") == "1")
    require(errors, "runtime-hash-seed", os.environ.get("PYTHONHASHSEED") == "0")
    require(errors, "runtime-jsonschema-version", importlib.metadata.version("jsonschema") == "4.26.0")
    require(errors, "runtime-validator", Draft202012Validator.__name__ == "Draft202012Validator")
    record = audit_root / "master/dependencies/jsonschema-draft202012-v1/site-packages/jsonschema-4.26.0.dist-info/RECORD"
    require(errors, "runtime-jsonschema-record", sha_bytes(record.read_bytes()) == JSONSCHEMA_RECORD_SHA)
    expected_site = str((audit_root / "master/dependencies/jsonschema-draft202012-v1/site-packages").resolve())
    require(errors, "runtime-pinned-site", expected_site in [str(Path(item).resolve()) for item in sys.path if item])
    return sorted(set(errors))


def validate_runtime_contract(runtime: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    exact = {
        "python_path": str(PINNED_PYTHON), "python_version": "3.12.13", "python_sha256": PYTHON_SHA,
        "flags": ["-S", "-B"], "python_no_user_site": "1", "python_dont_write_bytecode": "1",
        "python_hash_seed": "0", "python_path_site_relative_to_audit": "master/dependencies/jsonschema-draft202012-v1/site-packages",
        "jsonschema_version": "4.26.0", "jsonschema_record_sha256": JSONSCHEMA_RECORD_SHA,
        "validator": "jsonschema.Draft202012Validator",
    }
    for key, value in exact.items():
        require(errors, "runtime-contract:" + key, runtime.get(key) == value and type(runtime.get(key)) is type(value))
    require(errors, "runtime-contract:keys", set(runtime) == set(exact))
    return sorted(set(errors))


def validate_absence_paths(gate_root: Path, namespace: Path, audit_root: Path, absence: dict[str, str], audit_absence: dict[str, str]) -> list[str]:
    errors: list[str] = []
    for label, relative in absence.items():
        path = namespace / relative if label.startswith("future_") else gate_root / relative
        if os.path.lexists(path):
            errors.append("absence-gate:" + label)
    for label, relative in audit_absence.items():
        if os.path.lexists(audit_root / relative):
            errors.append("audit-absence-gate:" + label)
    return sorted(set(errors))


def validate_scope(scope: dict[str, Any], *, capture_rows_key: str = "runtime_native_capture_rows") -> list[str]:
    errors: list[str] = []
    require(errors, "scope-activation", scope.get("activation_authorized") is False)
    require(errors, "scope-launch", scope.get("launch_authorized") is False)
    require(errors, "scope-credit", type(scope.get("credit")) is int and scope.get("credit") == 0)
    require(errors, "scope-spawn", scope.get("spawn") == "none" and scope.get("spawn_count") == 0)
    for key in ("result_count", "receipt_count", capture_rows_key, "activation_transactions"):
        require(errors, "scope-zero-" + key, type(scope.get(key)) is int and scope.get(key) == 0)
    return sorted(set(errors))


def output_text(row: dict[str, Any]) -> str:
    output = row.get("payload", {}).get("output", "")
    if isinstance(output, str):
        return output
    if isinstance(output, list):
        return "\n".join(str(item.get("text", "")) for item in output if isinstance(item, dict))
    return json.dumps(output, sort_keys=True)


def custom_source(row: dict[str, Any]) -> str:
    payload = row.get("payload", {})
    return str(payload.get("input", "")) if row.get("type") == "response_item" and payload.get("type") == "custom_tool_call" else ""


def resolve_session_path(value: str, *, fixture_root: Optional[Path], session_root: Path) -> tuple[Path, Path]:
    candidate = Path(value)
    if candidate.is_absolute():
        return candidate, session_root
    if fixture_root is None:
        raise ClosureError("relative-session-path-outside-fixture")
    return fixture_root / candidate, fixture_root


def validate_native_binding(
    document: dict[str, Any],
    schema: dict[str, Any],
    *,
    session_root: Path,
    fixture_root: Optional[Path] = None,
) -> tuple[list[str], tuple[bytes, ...], tuple[dict[str, Any], ...], StableRead, tuple[bytes, ...], tuple[dict[str, Any], ...]]:
    errors = schema_errors(document, schema)
    controller = document.get("controller_native", {})
    reviewer = document.get("reviewer_native", {})
    closure = document.get("closure", {})
    report = document.get("report_binding", {})
    source = document.get("source_binding", {})
    require(errors, "binding-fresh-thread", UUID7.fullmatch(str(reviewer.get("native_thread_id", ""))) is not None and reviewer.get("native_thread_id") not in {CONTROLLER_ID, PRIOR_REVIEWER_ID})
    require(errors, "binding-fresh-turn", UUID7.fullmatch(str(reviewer.get("native_turn_id", ""))) is not None and reviewer.get("native_turn_id") != reviewer.get("native_thread_id"))
    require(errors, "binding-report", report.get("raw_sha256") == REPORT_SHA and report.get("byte_count") == REPORT_SIZE)
    require(errors, "binding-source-digest", source.get("source_transaction_digest") == SOURCE_DIGEST)
    errors.extend(validate_scope(document.get("scope", {})))
    try:
        parent_path, parent_root = resolve_session_path(str(controller.get("session_path", "")), fixture_root=fixture_root, session_root=session_root)
        parent_raw, parent_rows = stable_prefix_jsonl(parent_path, parent_root, int(controller.get("session_prefix_line_count", 0)))
    except (ClosureError, ValueError, TypeError) as exc:
        errors.extend(exc.codes if isinstance(exc, ClosureError) else ("parent-session",))
        parent_raw, parent_rows = (), ()
    try:
        child_path, child_root = resolve_session_path(str(reviewer.get("session_path", "")), fixture_root=fixture_root, session_root=session_root)
        child, child_raw, child_rows = stable_jsonl(child_path, child_root)
    except ClosureError as exc:
        errors.extend(exc.codes)
        child = StableRead(b"", os.stat_result((0,) * 10), sha_bytes(b""))
        child_raw, child_rows = (), ()
    if parent_raw:
        require(errors, "parent-prefix-hash", sha_bytes(b"".join(parent_raw)) == controller.get("session_prefix_sha256"))
        start, end = controller.get("turn_start_line", 0), controller.get("turn_end_line", 0)
        require(errors, "parent-turn-range", type(start) is int and type(end) is int and 1 <= start <= end <= len(parent_raw))
        if type(start) is int and type(end) is int and 1 <= start <= end <= len(parent_raw):
            require(errors, "parent-turn-hash", sha_bytes(b"".join(parent_raw[start - 1:end])) == controller.get("turn_segment_sha256"))
        for label, line_key, hash_key in (
            ("context", "turn_context_line", "turn_context_record_sha256"),
            ("spawn", "spawn_call_line", "spawn_record_sha256"),
            ("spawn-result", "spawn_result_line", "spawn_result_record_sha256"),
            ("terminal", "terminal_record_line", "terminal_record_sha256"),
            ("complete", "turn_end_line", "task_complete_record_sha256"),
        ):
            require(errors, "parent-record-" + label, raw_hash(parent_raw, int(controller.get(line_key, 0))) == controller.get(hash_key))
        contexts = [row for row in parent_rows if row.get("type") == "turn_context" and row.get("payload", {}).get("turn_id") == controller.get("native_turn_id")]
        require(errors, "parent-context-cardinality", len(contexts) == 1)
        if len(contexts) == 1:
            context = contexts[0].get("payload", {})
            collaboration = context.get("collaboration_mode", {}).get("settings", {})
            require(errors, "parent-model", context.get("model") == MODEL and collaboration.get("model") == MODEL)
            require(errors, "parent-effort", context.get("effort") == EFFORT and collaboration.get("reasoning_effort") == EFFORT)
        spawn_line = int(controller.get("spawn_call_line", 0))
        result_line = int(controller.get("spawn_result_line", 0))
        terminal_line = int(controller.get("terminal_record_line", 0))
        if all(1 <= line <= len(parent_rows) for line in (spawn_line, result_line, terminal_line)):
            spawn = parent_rows[spawn_line - 1].get("payload", {})
            source_text = custom_source(parent_rows[spawn_line - 1])
            for code, token in (
                ("spawn-marker", SPAWN_MARKER), ("spawn-task", TASK_NAME), ("spawn-report", REPORT_RELATIVE),
                ("spawn-model", 'model: "gpt-5.6-luna"'), ("spawn-effort", 'reasoning_effort: "max"'),
                ("spawn-no-fork", "fork_context: false"), ("spawn-fork-turns", "fork_turns=none"),
            ):
                require(errors, code, token in source_text)
            require(errors, "spawn-call-id", spawn.get("call_id") == controller.get("spawn_call_id"))
            require(errors, "spawn-result-call", parent_rows[result_line - 1].get("payload", {}).get("call_id") == controller.get("spawn_call_id"))
            require(errors, "spawn-result-child", str(reviewer.get("native_thread_id")) in output_text(parent_rows[result_line - 1]))
            terminal = output_text(parent_rows[terminal_line - 1])
            require(errors, "terminal-child", str(reviewer.get("native_thread_id")) in terminal)
            require(errors, "terminal-report", REPORT_SHA in terminal)
            require(errors, "terminal-completed", "completed" in terminal)
        marker_spawns = [row for row in parent_rows if SPAWN_MARKER in custom_source(row) and "spawn_agent" in custom_source(row)]
        require(errors, "spawn-cardinality", len(marker_spawns) == 1 == closure.get("matching_spawn_count"))
        for action in FORBIDDEN_ACTIONS:
            pattern = re.compile(rf"tools\.[A-Za-z0-9_]*{action}\s*\(")
            count = sum(bool(pattern.search(custom_source(row))) and str(reviewer.get("native_thread_id")) in custom_source(row) for row in parent_rows)
            require(errors, "parent-action-" + action, count == 0)
    if child_raw:
        require(errors, "child-session-hash", child.sha256 == reviewer.get("session_sha256") and len(child_raw) == reviewer.get("session_line_count"))
        for label, line_key, hash_key in (
            ("meta", "session_meta_line", "session_meta_record_sha256"), ("start", "task_started_line", "task_started_record_sha256"),
            ("context", "turn_context_line", "turn_context_record_sha256"), ("complete", "task_complete_line", "task_complete_record_sha256"),
        ):
            require(errors, "child-record-" + label, raw_hash(child_raw, int(reviewer.get(line_key, 0))) == reviewer.get(hash_key))
        metas = [row for row in child_rows if row.get("type") == "session_meta"]
        starts = [row for row in child_rows if row.get("type") == "event_msg" and row.get("payload", {}).get("type") == "task_started"]
        contexts = [row for row in child_rows if row.get("type") == "turn_context"]
        completes = [row for row in child_rows if row.get("type") == "event_msg" and row.get("payload", {}).get("type") == "task_complete"]
        require(errors, "child-cardinality", len(metas) == len(starts) == len(contexts) == len(completes) == 1)
        if len(metas) == len(starts) == len(contexts) == len(completes) == 1:
            meta, started, context, complete = metas[0]["payload"], starts[0]["payload"], contexts[0]["payload"], completes[0]["payload"]
            collaboration = context.get("collaboration_mode", {}).get("settings", {})
            require(errors, "child-id", meta.get("id") == reviewer.get("native_thread_id"))
            require(errors, "child-parent", meta.get("parent_thread_id") == CONTROLLER_ID and meta.get("forked_from_id") is None)
            require(errors, "child-source-parent", meta.get("source", {}).get("subagent", {}).get("thread_spawn", {}).get("parent_thread_id") == CONTROLLER_ID)
            require(errors, "child-depth", meta.get("source", {}).get("subagent", {}).get("thread_spawn", {}).get("depth") == 1)
            require(errors, "child-turns", started.get("turn_id") == context.get("turn_id") == complete.get("turn_id") == reviewer.get("native_turn_id"))
            require(errors, "child-model", context.get("model") == collaboration.get("model") == MODEL)
            require(errors, "child-effort", context.get("effort") == collaboration.get("reasoning_effort") == EFFORT)
            terminal = str(complete.get("last_agent_message", ""))
            require(errors, "child-terminal-report", REPORT_SHA in terminal)
            require(errors, "child-terminal-source", SOURCE_DIGEST in terminal)
            require(errors, "child-terminal-zero", "activation/launch false, credit 0" in terminal)
        require(errors, "child-complete-last", reviewer.get("task_complete_line") == len(child_rows) and child_rows[-1].get("payload", {}).get("type") == "task_complete")
        descendants = sum(len(re.findall(r"tools\.[A-Za-z0-9_]*spawn_agent\s*\(", custom_source(row))) for row in child_rows)
        require(errors, "child-descendants", descendants == 0 == closure.get("descendant_spawn_count"))
    for key in ("reviewer_count", "matching_spawn_count"):
        require(errors, "closure-" + key, closure.get(key) == 1)
    for key in ("followup_task_count", "send_message_count", "interrupt_count", "retry_count", "descendant_spawn_count"):
        require(errors, "closure-zero-" + key, closure.get(key) == 0)
    return sorted(set(errors)), parent_raw, parent_rows, child, child_raw, child_rows


def tree_digest(root: Path) -> tuple[int, int, str]:
    rows: list[dict[str, Any]] = []
    root_stat = os.lstat(root)
    if stat.S_ISLNK(root_stat.st_mode) or not stat.S_ISDIR(root_stat.st_mode):
        raise ClosureError("tree-root-symlink-or-nondirectory")
    files: list[Path] = []
    for current, directory_names, file_names in os.walk(
        root,
        topdown=True,
        onerror=lambda error: _raise_walk_error("tree-walk-error", error),
        followlinks=False,
    ):
        current_path = Path(current)
        for name in sorted(directory_names):
            path = current_path / name
            item = os.lstat(path)
            if stat.S_ISLNK(item.st_mode) or not stat.S_ISDIR(item.st_mode):
                raise ClosureError("tree-directory-symlink-or-nondirectory:" + path.relative_to(root).as_posix())
        for name in sorted(file_names):
            path = current_path / name
            item = os.lstat(path)
            if stat.S_ISLNK(item.st_mode):
                raise ClosureError("tree-file-symlink:" + path.relative_to(root).as_posix())
            if not stat.S_ISREG(item.st_mode):
                raise ClosureError("tree-file-nonregular:" + path.relative_to(root).as_posix())
            if item.st_nlink != 1:
                raise ClosureError("tree-file-hardlink:" + path.relative_to(root).as_posix())
            files.append(path)
    for path in sorted(files, key=lambda item: item.relative_to(root).as_posix()):
        item = stable_read(path, root)
        rows.append({"path": path.relative_to(root).as_posix(), "byte_count": len(item.raw), "sha256": item.sha256})
    encoded = json.dumps(rows, sort_keys=True, separators=(",", ":")).encode()
    return len(rows), sum(row["byte_count"] for row in rows), sha_bytes(encoded)


def closed_world_census(root: Path, boundary: Path, expected_files: Iterable[str]) -> tuple[tuple[dict[str, Any], ...], str]:
    """Lexically enumerate one namespace and reject every unlisted or unsafe entry."""
    expected = set(expected_files)
    errors: list[str] = []
    for relative in expected:
        candidate = Path(relative)
        if candidate.is_absolute() or relative in {"", "."} or ".." in candidate.parts:
            errors.append("census-invalid-expected-path:" + relative)
    expected_directories: set[str] = set()
    for relative in expected:
        parent = Path(relative).parent
        while parent != Path("."):
            expected_directories.add(parent.as_posix())
            parent = parent.parent
    try:
        root_item = os.lstat(root)
    except FileNotFoundError as exc:
        raise ClosureError("census-root-missing") from exc
    if stat.S_ISLNK(root_item.st_mode) or not stat.S_ISDIR(root_item.st_mode):
        errors.append("census-root-symlink-or-nondirectory")
    if not _inside(root, boundary, strict=True):
        errors.append("census-root-escape")
    else:
        try:
            _safe_parent_chain(root / ".c2-census-probe", boundary)
        except ClosureError as exc:
            errors.extend("census-root:" + code for code in exc.codes)
    found_files: set[str] = set()
    found_directories: set[str] = set()
    for current, directory_names, file_names in os.walk(
        root,
        topdown=True,
        onerror=lambda error: _raise_walk_error("census-walk-error", error),
        followlinks=False,
    ):
        directory_names.sort()
        file_names.sort()
        current_path = Path(current)
        for name in tuple(directory_names):
            path = current_path / name
            relative = path.relative_to(root).as_posix()
            item = os.lstat(path)
            if stat.S_ISLNK(item.st_mode) or not stat.S_ISDIR(item.st_mode):
                errors.append("census-directory-unsafe:" + relative)
                directory_names.remove(name)
                continue
            found_directories.add(relative)
            if relative not in expected_directories:
                errors.append("census-unexpected-directory:" + relative)
        for name in file_names:
            path = current_path / name
            relative = path.relative_to(root).as_posix()
            item = os.lstat(path)
            found_files.add(relative)
            if stat.S_ISLNK(item.st_mode):
                errors.append("census-file-symlink:" + relative)
            elif not stat.S_ISREG(item.st_mode):
                errors.append("census-file-nonregular:" + relative)
            elif item.st_nlink != 1:
                errors.append("census-file-hardlink:" + relative)
            if relative not in expected:
                errors.append("census-unexpected-file:" + relative)
    for relative in sorted(expected - found_files):
        errors.append("census-missing-file:" + relative)
    for relative in sorted(expected_directories - found_directories):
        errors.append("census-missing-directory:" + relative)
    if errors:
        raise ClosureError(errors)
    rows: list[dict[str, Any]] = []
    for relative in sorted(expected):
        item = stable_read(root / relative, root)
        rows.append({"path": relative, "byte_count": len(item.raw), "sha256": item.sha256})
    path_set_digest = sha_bytes(("\n".join(sorted(expected)) + "\n").encode())
    return tuple(rows), path_set_digest


def inventory_subset(raw_lines: list[bytes], predicate: Callable[[dict[str, Any]], bool]) -> tuple[list[dict[str, Any]], str]:
    rows = [json.loads(line) for line in raw_lines]
    selected = [row for row in rows if predicate(row)]
    digest = sha_bytes(b"".join(canonical(row) for row in selected))
    return selected, digest


def verify_inventory_rows(rows: list[dict[str, Any]], audit_root: Path) -> list[str]:
    errors: list[str] = []
    for row in rows:
        relative = row.get("relative_path")
        if not isinstance(relative, str):
            errors.append("inventory-relative-path")
            continue
        try:
            item = stable_read(audit_root / relative, audit_root)
        except ClosureError as exc:
            errors.extend("inventory:" + code + ":" + relative for code in exc.codes)
            continue
        require(errors, "inventory-hash:" + relative, item.sha256 == row.get("sha256"))
        require(errors, "inventory-size:" + relative, len(item.raw) == row.get("byte_count"))
    return sorted(set(errors))


def equivalent_terminal(document: dict[str, Any], statuses: list[str]) -> bool:
    schema_version = str(document.get("schema_version", "")).lower()
    return document.get("slot_id") == SLOT_ID and "compatibility" in schema_version and "terminal" in schema_version and document.get("status") in statuses


def scan_foreign_equivalent_terminals(audit_root: Path, namespace: Path, statuses: list[str]) -> list[str]:
    matches: list[str] = []
    candidates: list[Path] = []
    for current, directory_names, file_names in os.walk(
        audit_root,
        topdown=True,
        onerror=lambda error: _raise_walk_error("dedup-walk-error", error),
        followlinks=False,
    ):
        current_path = Path(current)
        for name in directory_names:
            path = current_path / name
            item = os.lstat(path)
            relative = path.relative_to(audit_root).as_posix()
            if ("terminal" in name.lower() or "compatibility-closure" in relative.lower()) and (stat.S_ISLNK(item.st_mode) or not stat.S_ISDIR(item.st_mode)):
                raise ClosureError("dedup-directory-unsafe:" + relative)
        for name in file_names:
            if not name.endswith(".json"):
                continue
            path = current_path / name
            if _inside(path, namespace, strict=True):
                continue
            relative = path.relative_to(audit_root).as_posix()
            if "terminal" in name.lower() or "compatibility-closure" in relative.lower():
                candidates.append(path)
    for path in sorted(candidates, key=lambda item: item.relative_to(audit_root).as_posix()):
        relative = path.relative_to(audit_root).as_posix()
        try:
            _, document = stable_json(path, audit_root)
        except ClosureError as exc:
            raise ClosureError("dedup-candidate:" + code + ":" + relative for code in exc.codes) from exc
        if equivalent_terminal(document, statuses):
            matches.append(relative)
    return sorted(matches)


def build_checkpoint_capture(authority: dict[str, Any], evidence: FutureEvidence) -> tuple[bytes, bytes, dict[str, Any]]:
    binding = evidence.binding_document
    parent = binding["controller_native"]
    child = binding["reviewer_native"]
    checkpoint_records = [
        {"record": "parent_native_spawn_call", "slot_id": SLOT_ID, "controller_thread_id": CONTROLLER_ID, "controller_turn_id": parent["native_turn_id"], "native_call_id": parent["spawn_call_id"], "parent_line": parent["spawn_call_line"], "raw_record_sha256": parent["spawn_record_sha256"]},
        {"record": "parent_native_spawn_result", "slot_id": SLOT_ID, "native_call_id": parent["spawn_call_id"], "native_thread_id": child["native_thread_id"], "parent_line": parent["spawn_result_line"], "raw_record_sha256": parent["spawn_result_record_sha256"]},
        {"record": "parent_native_terminal_mapping", "slot_id": SLOT_ID, "native_thread_id": child["native_thread_id"], "report_sha256": REPORT_SHA, "parent_line": parent["terminal_record_line"], "raw_record_sha256": parent["terminal_record_sha256"]},
        {"record": "child_native_session", "slot_id": SLOT_ID, "native_thread_id": child["native_thread_id"], "native_turn_id": child["native_turn_id"], "session_line_count": child["session_line_count"], "session_sha256": child["session_sha256"], "session_meta_record_sha256": child["session_meta_record_sha256"], "task_started_record_sha256": child["task_started_record_sha256"], "turn_context_record_sha256": child["turn_context_record_sha256"], "task_complete_record_sha256": child["task_complete_record_sha256"], "report_sha256": REPORT_SHA},
    ]
    checkpoint_raw = b"".join(canonical(record) for record in checkpoint_records)
    checkpoint_sha = sha_bytes(checkpoint_raw)
    capture = {
        "schema_version": "universal-shadow-certification-controller-native-reviewer-capture-v31-v1",
        "audit_id": AUDIT_ID, "wave_id": WAVE_ID, "attempt_id": ATTEMPT_ID, "slot_id": SLOT_ID,
        "capture_authority": "controller_parent_native_session_records", "identity_authority": "native_session_not_report_self_attestation",
        "controller_native": {
            "native_thread_id": CONTROLLER_ID, "native_turn_id": parent["native_turn_id"], "actual_model": MODEL, "actual_reasoning_effort": EFFORT,
            "session_prefix_line_count": parent["session_prefix_line_count"], "session_prefix_sha256": parent["session_prefix_sha256"],
            "turn_start_line": parent["turn_start_line"], "turn_end_line": parent["turn_end_line"], "turn_segment_sha256": parent["turn_segment_sha256"],
            "spawn_call_line": parent["spawn_call_line"], "spawn_call_id": parent["spawn_call_id"], "spawn_record_sha256": parent["spawn_record_sha256"],
            "spawn_result_line": parent["spawn_result_line"], "spawn_result_record_sha256": parent["spawn_result_record_sha256"],
            "terminal_record_line": parent["terminal_record_line"], "terminal_record_sha256": parent["terminal_record_sha256"],
        },
        "reviewer_native": {
            "native_thread_id": child["native_thread_id"], "native_turn_id": child["native_turn_id"], "parent_thread_id": CONTROLLER_ID,
            "session_sha256": child["session_sha256"], "session_line_count": child["session_line_count"],
            "session_meta_line": child["session_meta_line"], "session_meta_record_sha256": child["session_meta_record_sha256"],
            "task_started_line": child["task_started_line"], "task_started_record_sha256": child["task_started_record_sha256"],
            "turn_context_line": child["turn_context_line"], "turn_context_record_sha256": child["turn_context_record_sha256"],
            "task_complete_line": child["task_complete_line"], "task_complete_record_sha256": child["task_complete_record_sha256"],
            "task_complete_is_last_line": True, "actual_model": MODEL, "actual_reasoning_effort": EFFORT,
            "collaboration_model": MODEL, "collaboration_reasoning_effort": EFFORT, "fork_context": False, "fork_turns": "none", "forked_from_id": None,
            "terminal_status": "completed", "terminal_report_sha256": REPORT_SHA,
        },
        "closure": {"matching_spawn_count": 1, "followup_task_count": 0, "send_message_count": 0, "interrupt_count": 0, "retry_count": 0, "descendant_spawn_count": 0, "post_terminal_reuse_actions": []},
        "hash_closure": {"stable_double_read": True, "path_symlink": False, "report_sha256": REPORT_SHA, "checkpoint_sha256": checkpoint_sha, "child_session_sha256": child["session_sha256"], "parent_session_prefix_sha256": parent["session_prefix_sha256"], "parent_turn_segment_sha256": parent["turn_segment_sha256"], "spawn_record_sha256": parent["spawn_record_sha256"], "spawn_result_record_sha256": parent["spawn_result_record_sha256"], "terminal_record_sha256": parent["terminal_record_sha256"]},
        "report_binding": {"relative_path": REPORT_RELATIVE, "raw_sha256": REPORT_SHA, "byte_count": len(evidence.report.raw), "inode": evidence.report.stat.st_ino, "mtime_epoch": int(evidence.report.stat.st_mtime), "semantic_status": "PASS", "identity_fields_authoritative": False, "terminal_sender_native_thread_id": child["native_thread_id"], "terminal_report_sha256": REPORT_SHA},
        "checkpoint": {"relative_path": CHECKPOINT_RELATIVE, "raw_sha256": checkpoint_sha, "record_count": 4},
        "scope": {"activation_authorized": False, "launch_authorized": False, "spawn": "none", "spawn_count": 0, "result_count": 0, "receipt_count": 0, "runtime_native_capture_rows": 0, "activation_transactions": 0, "credit": 0},
    }
    return checkpoint_raw, pretty(capture), capture


def exclusive_write(path: Path, root: Path, raw: bytes) -> StableRead:
    _safe_parent_chain(path, root)
    if os.path.lexists(path):
        raise ClosureError("output-exists")
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0), 0o444)
    try:
        offset = 0
        while offset < len(raw):
            written = os.write(descriptor, raw[offset:])
            if written <= 0:
                raise ClosureError("short-write")
            offset += written
        os.fsync(descriptor)
    finally:
        os.close(descriptor)
    directory = os.open(path.parent, os.O_RDONLY | getattr(os, "O_CLOEXEC", 0))
    try:
        os.fsync(directory)
    finally:
        os.close(directory)
    result = stable_read(path, root)
    if result.raw != raw:
        raise ClosureError("output-readback")
    return result


def write_pair(capture: Path, checkpoint: Path, root: Path, capture_raw: bytes, checkpoint_raw: bytes) -> tuple[StableRead, StableRead]:
    if os.path.lexists(capture) or os.path.lexists(checkpoint):
        raise ClosureError("output-pair-not-empty")
    _safe_parent_chain(capture, root)
    _safe_parent_chain(checkpoint, root)
    checkpoint_item = exclusive_write(checkpoint, root, checkpoint_raw)
    capture_item = exclusive_write(capture, root, capture_raw)
    return capture_item, checkpoint_item


def verify_preparation(
    authority: dict[str, Any],
    *,
    audit_root: Path,
    gate_root: Path,
    namespace: Path,
    allow_future_inputs: bool = False,
) -> dict[str, Any]:
    errors: list[str] = []
    require(errors, "authority-status", authority.get("status") == "BLOCKED_PREPARATION_ONLY_FUTURE_REVIEWER_AND_CAPTURE_AUTHORITIES_ABSENT")
    require(errors, "authority-namespace", authority.get("namespace") == namespace.relative_to(audit_root).as_posix())
    require(errors, "authority-append-only", authority.get("append_only") is True)
    require(errors, "authority-slot", authority.get("slot_id") == SLOT_ID and authority.get("cohort_id") == COHORT_ID)
    expected_zero = {"launches": 0, "reviewers": 0, "controllers": 0, "semantic_children": 0, "activations": 0, "generator_invocations": 0, "receipts": 0, "results": 0, "captures": 0, "checkpoints": 0, "promotion": 0, "canonical_reads": 0, "canonical_writes": 0, "credit": 0}
    require(errors, "authority-explicit-zero-state", authority.get("zero_state") == expected_zero)
    errors.extend(validate_runtime(audit_root))
    errors.extend(validate_runtime_contract(authority.get("runtime", {})))
    errors.extend(validate_scope(authority.get("scope", {})))

    for relative, expected in authority.get("protected_audit_file_hashes", {}).items():
        try:
            item = stable_read(audit_root / relative, audit_root)
            require(errors, "protected-hash:" + relative, item.sha256 == expected)
        except ClosureError as exc:
            errors.extend("protected:" + code + ":" + relative for code in exc.codes)

    prior_item, prior = stable_json(namespace / authority["prior_invocation_baseline"]["path"], namespace)
    require(errors, "prior-baseline-hash", prior_item.sha256 == authority["prior_invocation_baseline"]["sha256"])
    require(errors, "prior-baseline-status", prior.get("status") == "IMMUTABLE_PRIOR_FAILURE_AND_POSTRUN_PROOF_BOUND")
    lineage_path = audit_root / prior["attempt_0001_lineage"]["relative_path"]
    inventory_path = audit_root / prior["attempt_0001_inventory"]["relative_path"]
    lineage_item, lineage = stable_json(lineage_path, audit_root)
    inventory_item = stable_read(inventory_path, audit_root)
    require(errors, "prior-lineage-hash", lineage_item.sha256 == prior["attempt_0001_lineage"]["sha256"])
    require(errors, "prior-lineage-status", lineage.get("status") == prior["attempt_0001_lineage"]["status"])
    require(errors, "prior-lineage-zero", lineage.get("attempt_0001_credit") == 0 and lineage.get("attempt_0001_outputs_receipts_captures_mutated") is False)
    require(errors, "prior-inventory-hash", inventory_item.sha256 == prior["attempt_0001_inventory"]["sha256"])
    inventory_raw = inventory_item.raw.splitlines(keepends=True)
    invocation_rows, invocation_digest = inventory_subset(
        inventory_raw,
        lambda row: row.get("role") in {"attempt_0001_result", "attempt_0001_receipt"}
        and re.search(r"A005ERSC-00(?:09|10|11|12|13|14|15|16)", str(row.get("relative_path", ""))) is not None,
    )
    control_rows, control_digest = inventory_subset(inventory_raw, lambda row: "cohort-0002" in str(row.get("relative_path", "")))
    invocation_expected = prior["c2_prior_result_and_receipt_rows"]
    control_expected = prior["c2_v29_control_rows"]
    require(errors, "prior-invocation-count", len(invocation_rows) == invocation_expected["record_count"])
    require(errors, "prior-invocation-bytes", sum(row["byte_count"] for row in invocation_rows) == invocation_expected["byte_count"])
    require(errors, "prior-invocation-digest", invocation_digest == invocation_expected["canonical_jsonl_sha256"])
    require(errors, "prior-control-count", len(control_rows) == control_expected["record_count"])
    require(errors, "prior-control-bytes", sum(row["byte_count"] for row in control_rows) == control_expected["byte_count"])
    require(errors, "prior-control-digest", control_digest == control_expected["canonical_jsonl_sha256"])
    errors.extend(verify_inventory_rows(invocation_rows + control_rows, audit_root))

    independent = stable_read(audit_root / prior["independent_postrun"]["relative_path"], audit_root)
    primary = stable_read(audit_root / prior["primary_postrun"]["relative_path"], audit_root)
    prior_capture = stable_read(gate_root / prior["prior_postrun_native_capture"]["relative_path_from_gate"], gate_root)
    prior_checkpoint = stable_read(gate_root / prior["prior_postrun_native_checkpoint"]["relative_path_from_gate"], gate_root)
    require(errors, "prior-independent-report", independent.sha256 == prior["independent_postrun"]["sha256"] and len(independent.raw) == prior["independent_postrun"]["byte_count"])
    require(errors, "prior-primary-postrun", primary.sha256 == prior["primary_postrun"]["sha256"])
    require(errors, "prior-native-capture", prior_capture.sha256 == prior["prior_postrun_native_capture"]["sha256"])
    require(errors, "prior-native-checkpoint", prior_checkpoint.sha256 == prior["prior_postrun_native_checkpoint"]["sha256"] and len(prior_checkpoint.raw.splitlines()) == 4)
    try:
        prior_capture_document = json.loads(prior_capture.raw)
    except (UnicodeDecodeError, json.JSONDecodeError):
        prior_capture_document = {}
        errors.append("prior-native-capture-json")
    prior_native = prior["prior_postrun_native_capture"]
    live_controller = prior_capture_document.get("controller_native", {})
    live_reviewer = prior_capture_document.get("reviewer_native", {})
    for key, value in prior_native["controller_native"].items():
        require(errors, "prior-controller-native:" + key, live_controller.get(key) == value)
    for key, value in prior_native["reviewer_native"].items():
        if key == "descendant_spawn_count":
            actual = prior_capture_document.get("closure", {}).get("descendant_spawn_count")
        elif key == "retry_count":
            actual = prior_capture_document.get("closure", {}).get("retry_count")
        else:
            actual = live_reviewer.get(key)
        require(errors, "prior-reviewer-native:" + key, actual == value)
    baseline_report = prior_native["report_binding"]
    live_report = prior_capture_document.get("report_binding", {})
    for key, value in baseline_report.items():
        live_key = "raw_sha256" if key == "sha256" else key
        require(errors, "prior-report-binding:" + key, live_report.get(live_key) == value)
    c1 = prior["c1_no_touch_guard"]
    c1_count, c1_bytes, c1_digest = tree_digest(gate_root / c1["relative_path_from_gate"])
    require(errors, "c1-no-touch-count", c1_count == c1["file_count"])
    require(errors, "c1-no-touch-bytes", c1_bytes == c1["byte_count"])
    require(errors, "c1-no-touch-digest", c1_digest == c1["canonical_sorted_path_byte_count_sha256_tree_digest"])

    manifest_path = audit_root / authority["c2_source"]["manifest_path"]
    _, manifest = stable_json(manifest_path, audit_root)
    expected_ids = [f"A005ERSC-{number:04d}" for number in range(9, 17)]
    require(errors, "manifest-assignment-ids", manifest.get("assignment_ids") == expected_ids)
    require(errors, "manifest-source-digest", manifest.get("source_transaction_digest") == SOURCE_DIGEST)
    require(errors, "manifest-zero", manifest.get("zero_state") == {"activation_transactions": 0, "credit": 0, "empty_output_directories": 8, "native_capture_rows": 0, "receipts": 0, "results": 0})
    assignments = manifest.get("assignments", [])
    require(errors, "manifest-assignment-cardinality", len(assignments) == 8)
    empty_output_count = 0
    for expected_id, assignment in zip(expected_ids, assignments):
        require(errors, "assignment-id:" + expected_id, assignment.get("assignment_id") == expected_id)
        for label, ref_key, sha_key in (
            ("authorization", "authorization_ref", "authorization_sha256"),
            ("intent", "intent_ref", "intent_sha256"),
            ("packet", "packet_ref", "packet_sha256"),
        ):
            path = Path(str(assignment.get(ref_key, "")))
            try:
                item, document = stable_json(path, audit_root)
                require(errors, f"assignment-{label}-hash:{expected_id}", item.sha256 == assignment.get(sha_key))
                require(errors, f"assignment-{label}-id:{expected_id}", document.get("assignment_id", expected_id) == expected_id)
                if label == "intent":
                    require(errors, "intent-source-digest:" + expected_id, document.get("source_transaction_digest") == SOURCE_DIGEST)
                    require(errors, "intent-inactive:" + expected_id, document.get("status") == "PREPARED_INACTIVE_AWAITING_TWO_FRESH_LUNA_GATES" and document.get("spawn_count") == 0)
                if label == "authorization":
                    require(errors, "authorization-source-digest:" + expected_id, document.get("expected_source_transaction_digest") == SOURCE_DIGEST)
                    require(errors, "authorization-inactive:" + expected_id, document.get("status") == "BLOCKED_NOT_AUTHORIZED" and document.get("activation_authorized") is False and document.get("launch_authorized") is False)
            except ClosureError as exc:
                errors.extend(f"assignment-{label}:{code}:{expected_id}" for code in exc.codes)
        output = Path(str(assignment.get("output_directory", "")))
        try:
            if stable_empty_real_directory(output, audit_root):
                empty_output_count += 1
            else:
                errors.append("output-directory-not-empty:" + expected_id)
        except ClosureError as exc:
            errors.extend("output-directory:" + code + ":" + expected_id for code in exc.codes)
        for key in ("result_ref", "receipt_ref"):
            if os.path.lexists(Path(str(assignment.get(key, "")))):
                errors.append("attempt-0002-output-leak:" + expected_id + ":" + key)
    require(errors, "empty-output-count", empty_output_count == 8)

    dedup_item, dedup = stable_json(namespace / authority["dedup_precheck"]["path"], namespace)
    require(errors, "dedup-hash", dedup_item.sha256 == authority["dedup_precheck"]["sha256"])
    require(errors, "dedup-status", dedup.get("status") == "PASS_NO_EQUIVALENT_TERMINAL" and dedup.get("equivalent_terminal_count") == 0)
    foreign = scan_foreign_equivalent_terminals(audit_root, namespace, dedup["equivalence_predicate"]["terminal_status_alternatives"])
    require(errors, "dedup-live-foreign-equivalent", foreign == [])

    absence = dict(authority["absence_gates"])
    if allow_future_inputs:
        for label in ("production_report", "future_reviewer_authority", "future_capture_authority", "future_native_binding"):
            absence.pop(label, None)
    errors.extend(validate_absence_paths(gate_root, namespace, audit_root, absence, authority.get("audit_absence_gates", {})))
    if errors:
        raise ClosureError(errors)
    return {
        "prior_invocation_records_rehashed": len(invocation_rows),
        "prior_control_records_rehashed": len(control_rows),
        "empty_output_directories": empty_output_count,
        "foreign_equivalent_terminals": foreign,
        "c1_file_count": c1_count,
        "c1_byte_count": c1_bytes,
        "c1_tree_digest": c1_digest,
        "production_capture_present": False,
        "production_checkpoint_present": False,
        "future_authorities_present": False,
    }


def load_future_evidence(
    authority: dict[str, Any],
    *,
    audit_root: Path,
    gate_root: Path,
    namespace: Path,
    session_root: Path,
) -> FutureEvidence:
    report = stable_read(audit_root / REPORT_RELATIVE, gate_root)
    report_schema = json.loads(stable_read(namespace / authority["future"]["report_schema_path"], namespace).raw)
    report_document = json.loads(report.raw)
    errors = schema_errors(report_document, report_schema)
    require(errors, "future-report-hash", report.sha256 == REPORT_SHA and len(report.raw) == REPORT_SIZE)
    binding, binding_document = stable_json(namespace / authority["future"]["native_binding_path"], namespace)
    binding_schema = json.loads(stable_read(namespace / authority["future"]["native_binding_schema_path"], namespace).raw)
    binding_errors, parent_raw, parent_rows, child, child_raw, child_rows = validate_native_binding(binding_document, binding_schema, session_root=session_root)
    errors.extend(binding_errors)
    if errors:
        raise ClosureError(errors)
    return FutureEvidence(report, report_document, binding, binding_document, parent_raw, parent_rows, child, child_raw, child_rows)
