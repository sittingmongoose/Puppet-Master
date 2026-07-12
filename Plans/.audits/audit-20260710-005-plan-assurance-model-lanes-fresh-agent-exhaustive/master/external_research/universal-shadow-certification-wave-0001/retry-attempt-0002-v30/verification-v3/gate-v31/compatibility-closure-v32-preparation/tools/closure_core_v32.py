#!/usr/bin/env python3
"""Fail-closed C1 V32 compatibility closure core.

This module deliberately does not import or modify the sealed V31 writer.  It
keeps the V31 output contract while replacing the Python-3.9-incompatible
``Path.stat(follow_symlinks=False)`` inspection with ``os.lstat`` plus
``O_NOFOLLOW`` descriptor checks.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import stat
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Iterable, Optional, Union


UUID7 = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
SHA256 = re.compile(r"^[0-9a-f]{64}$")
FORBIDDEN_ACTIONS = ("followup_task", "send_message", "interrupt_agent")
MODEL = "gpt-5.6-luna"
EFFORT = "max"


class ClosureError(RuntimeError):
    """A fail-closed compatibility or integrity error."""

    def __init__(self, codes: Union[str, Iterable[str]]):
        if isinstance(codes, str):
            self.codes = (codes,)
        else:
            self.codes = tuple(sorted(set(codes)))
        super().__init__(",".join(self.codes))


@dataclass(frozen=True)
class StableRead:
    raw: bytes
    stat: os.stat_result
    sha256: str


@dataclass(frozen=True)
class LiveEvidence:
    report: StableRead
    report_document: dict[str, Any]
    parent_raw: tuple[bytes, ...]
    parent_rows: tuple[dict[str, Any], ...]
    child: StableRead
    child_raw: tuple[bytes, ...]
    child_rows: tuple[dict[str, Any], ...]
    binding: dict[str, Any]
    lineage: dict[str, Any]


def sha_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def canonical(document: Any) -> bytes:
    return (json.dumps(document, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode("utf-8")


def pretty(document: Any) -> bytes:
    return (json.dumps(document, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8")


def _inside(path: Path, root: Path, *, strict: bool) -> bool:
    try:
        resolved = path.resolve(strict=strict)
        resolved.relative_to(root.resolve(strict=True))
        return True
    except (FileNotFoundError, OSError, RuntimeError, ValueError):
        return False


def _safe_parent_chain(path: Path, root: Path) -> None:
    if not _inside(path.parent, root, strict=True):
        raise ClosureError("path-escape")
    root_resolved = root.resolve(strict=True)
    current = path.parent
    while True:
        item = os.lstat(current)
        if stat.S_ISLNK(item.st_mode) or not stat.S_ISDIR(item.st_mode):
            raise ClosureError("parent-symlink-or-nondirectory")
        if current.resolve(strict=True) == root_resolved:
            break
        if current.parent == current:
            raise ClosureError("parent-root-not-reached")
        current = current.parent


def _regular_lstat(path: Path, root: Path, *, single_link: bool = True) -> os.stat_result:
    try:
        item = os.lstat(path)
    except FileNotFoundError as exc:
        raise ClosureError("path-missing") from exc
    if stat.S_ISLNK(item.st_mode):
        raise ClosureError("path-symlink")
    if not stat.S_ISREG(item.st_mode):
        raise ClosureError("path-not-regular")
    if single_link and item.st_nlink != 1:
        raise ClosureError("path-hardlink")
    if not _inside(path, root, strict=True):
        raise ClosureError("path-escape")
    _safe_parent_chain(path, root)
    return item


def _read_descriptor(descriptor: int) -> bytes:
    chunks: list[bytes] = []
    while True:
        chunk = os.read(descriptor, 1024 * 1024)
        if not chunk:
            return b"".join(chunks)
        chunks.append(chunk)


def _same_file(left: os.stat_result, right: os.stat_result, *, mutable_size: bool = False) -> bool:
    keys = ("st_dev", "st_ino", "st_mode", "st_nlink")
    if not all(getattr(left, key) == getattr(right, key) for key in keys):
        return False
    if mutable_size:
        return True
    return left.st_size == right.st_size and left.st_mtime_ns == right.st_mtime_ns


def stable_regular_read(
    path: Path,
    root: Path,
    *,
    between_reads: Optional[Callable[[Path], None]] = None,
) -> StableRead:
    """Read a single-link regular file twice through one no-follow descriptor."""
    before = _regular_lstat(path, root)
    flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
    try:
        descriptor = os.open(path, flags)
    except OSError as exc:
        raise ClosureError("open-no-follow") from exc
    try:
        opened = os.fstat(descriptor)
        if not _same_file(before, opened) or not stat.S_ISREG(opened.st_mode) or opened.st_nlink != 1:
            raise ClosureError("open-identity-drift")
        first = _read_descriptor(descriptor)
        middle = os.fstat(descriptor)
        if between_reads is not None:
            between_reads(path)
        os.lseek(descriptor, 0, os.SEEK_SET)
        second = _read_descriptor(descriptor)
        after = os.fstat(descriptor)
    finally:
        os.close(descriptor)
    final_path = _regular_lstat(path, root)
    if first != second:
        raise ClosureError("toctou-bytes")
    if not (_same_file(opened, middle) and _same_file(middle, after) and _same_file(after, final_path)):
        raise ClosureError("toctou-metadata")
    if len(first) != after.st_size:
        raise ClosureError("short-read")
    return StableRead(first, after, sha_bytes(first))


def stable_prefix_jsonl(
    path: Path,
    root: Path,
    line_count: int,
    *,
    between_reads: Optional[Callable[[Path], None]] = None,
) -> tuple[tuple[bytes, ...], tuple[dict[str, Any], ...]]:
    """Read an immutable JSONL prefix while permitting later append-only rows."""
    before = _regular_lstat(path, root)
    flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
    descriptor = os.open(path, flags)
    try:
        opened = os.fstat(descriptor)
        if not _same_file(before, opened, mutable_size=True):
            raise ClosureError("prefix-open-identity-drift")
        first_all = _read_descriptor(descriptor).splitlines(keepends=True)
        if between_reads is not None:
            between_reads(path)
        os.lseek(descriptor, 0, os.SEEK_SET)
        second_all = _read_descriptor(descriptor).splitlines(keepends=True)
        after = os.fstat(descriptor)
    finally:
        os.close(descriptor)
    final_path = _regular_lstat(path, root)
    if not (_same_file(opened, after, mutable_size=True) and _same_file(after, final_path, mutable_size=True)):
        raise ClosureError("prefix-identity-drift")
    if line_count < 1 or len(first_all) < line_count or len(second_all) < line_count:
        raise ClosureError("prefix-line-count")
    first = tuple(first_all[:line_count])
    second = tuple(second_all[:line_count])
    if first != second:
        raise ClosureError("prefix-toctou")
    if any(not line.endswith(b"\n") for line in first):
        raise ClosureError("prefix-line-termination")
    try:
        rows = tuple(json.loads(line) for line in first)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ClosureError("prefix-jsonl") from exc
    return first, rows


def stable_jsonl(path: Path, root: Path) -> tuple[StableRead, tuple[bytes, ...], tuple[dict[str, Any], ...]]:
    item = stable_regular_read(path, root)
    raw = tuple(item.raw.splitlines(keepends=True))
    if not raw or any(not line.endswith(b"\n") for line in raw):
        raise ClosureError("jsonl-line-termination")
    try:
        rows = tuple(json.loads(line) for line in raw)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ClosureError("jsonl-parse") from exc
    return item, raw, rows


def load_stable_json(path: Path, root: Path) -> tuple[StableRead, dict[str, Any]]:
    item = stable_regular_read(path, root)
    try:
        document = json.loads(item.raw)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ClosureError("json-parse") from exc
    if not isinstance(document, dict):
        raise ClosureError("json-object-required")
    return item, document


def _require(errors: list[str], code: str, condition: bool) -> None:
    if not condition:
        errors.append(code)


def validate_scope(scope: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    _require(errors, "scope-activation", scope.get("activation_authorized") is False)
    _require(errors, "scope-launch", scope.get("launch_authorized") is False)
    _require(errors, "scope-credit", scope.get("credit") == 0 and not isinstance(scope.get("credit"), bool))
    _require(errors, "scope-spawn", scope.get("spawn") == "none" and scope.get("spawn_count") == 0)
    for key in ("results", "receipts", "runtime_native_capture_rows", "activation_transactions", "launches"):
        _require(errors, "scope-zero-" + key, scope.get(key) == 0 and not isinstance(scope.get(key), bool))
    return errors


def validate_report_document(report: dict[str, Any], expected: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    exact = {
        "schema_version": "universal-shadow-certification-atomic8-prelaunch-report-v31-v1",
        "audit_id": expected["audit_id"],
        "wave_id": expected["wave_id"],
        "attempt_id": expected["attempt_id"],
        "slot_id": expected["slot_id"],
        "cohort_id": expected["cohort_id"],
        "atomic_size": 8,
        "authority_sha256": expected["cohort_authority_sha256"],
        "manifest_sha256": expected["cohort_manifest_sha256"],
        "primary_postrun_sha256": expected["primary_postrun_sha256"],
        "primary_rejected_set_report_sha256": expected["primary_rejected_set_report_sha256"],
        "assignment_ids": expected["assignment_ids"],
        "status": "PASS",
        "errors": [],
        "activation_authorized": False,
        "launch_authorized": False,
        "credit": 0,
    }
    for key, value in exact.items():
        _require(errors, "report-" + key, report.get(key) == value and type(report.get(key)) is type(value))
    zero = report.get("zero_state")
    _require(errors, "report-zero-object", isinstance(zero, dict))
    if isinstance(zero, dict):
        expected_zero = {
            "activation_transactions": 0,
            "credit": 0,
            "empty_output_directories": 8,
            "receipts": 0,
            "results": 0,
            "runtime_native_capture_rows": 0,
        }
        _require(errors, "report-zero-keys", set(zero) == set(expected_zero))
        for key, value in expected_zero.items():
            _require(errors, "report-zero-" + key, zero.get(key) == value and type(zero.get(key)) is int)
    _require(errors, "report-top-level-keys", set(report) == set(exact) | {"zero_state"})
    return sorted(set(errors))


def output_text(row: dict[str, Any]) -> str:
    output = row.get("payload", {}).get("output", "")
    if isinstance(output, str):
        return output
    if isinstance(output, list):
        return "\n".join(str(item.get("text", "")) for item in output if isinstance(item, dict))
    return json.dumps(output, sort_keys=True)


def raw_line_hash(raw: tuple[bytes, ...], line_number: int) -> str:
    if line_number < 1 or line_number > len(raw):
        return ""
    return sha_bytes(raw[line_number - 1])


def _custom_source(row: dict[str, Any]) -> str:
    payload = row.get("payload", {})
    if row.get("type") != "response_item" or payload.get("type") != "custom_tool_call":
        return ""
    return str(payload.get("input", ""))


def validate_parent_records(
    raw: tuple[bytes, ...],
    rows: tuple[dict[str, Any], ...],
    binding: dict[str, Any],
    lineage: dict[str, Any],
    report_sha256: str,
) -> list[str]:
    errors: list[str] = []
    parent = binding["controller_parent"]
    child_id = binding["reviewer_native"]["native_thread_id"]
    _require(errors, "parent-prefix-lines", len(raw) == parent["session_prefix_line_count"])
    _require(errors, "parent-prefix-hash", sha_bytes(b"".join(raw)) == parent["session_prefix_sha256"])
    start, end = parent["turn_start_line"], parent["turn_end_line"]
    _require(errors, "parent-turn-range", 1 <= start <= end <= len(raw))
    if 1 <= start <= end <= len(raw):
        _require(errors, "parent-turn-hash", sha_bytes(b"".join(raw[start - 1:end])) == parent["turn_segment_sha256"])
    for label, line_key, hash_key in (
        ("turn-start", "turn_start_line", "turn_start_record_sha256"),
        ("context", "turn_context_line", "turn_context_record_sha256"),
        ("spawn", "spawn_call_line", "spawn_record_sha256"),
        ("spawn-result", "spawn_result_line", "spawn_result_record_sha256"),
        ("terminal", "terminal_record_line", "terminal_record_sha256"),
        ("failed-call", "failed_invocation_call_line", "failed_invocation_call_record_sha256"),
        ("failed-result", "failed_invocation_result_line", "failed_invocation_result_record_sha256"),
        ("turn-complete", "turn_end_line", "turn_complete_record_sha256"),
    ):
        _require(errors, "parent-record-" + label, raw_line_hash(raw, parent[line_key]) == parent[hash_key])
    if not (1 <= start <= end <= len(rows)):
        return sorted(set(errors))
    segment = rows[start - 1:end]
    contexts = [row for row in segment if row.get("type") == "turn_context" and row.get("payload", {}).get("turn_id") == parent["native_turn_id"]]
    _require(errors, "parent-context-cardinality", len(contexts) == 1)
    if len(contexts) == 1:
        context = contexts[0]["payload"]
        collaboration = context.get("collaboration_mode", {}).get("settings", {})
        _require(errors, "parent-model", context.get("model") == MODEL and collaboration.get("model") == MODEL)
        _require(errors, "parent-effort", context.get("effort") == EFFORT and collaboration.get("reasoning_effort") == EFFORT)
    started = rows[start - 1].get("payload", {})
    completed = rows[end - 1].get("payload", {})
    _require(errors, "parent-start", started.get("type") == "task_started" and started.get("turn_id") == parent["native_turn_id"])
    _require(errors, "parent-complete", completed.get("type") == "task_complete" and completed.get("turn_id") == parent["native_turn_id"])
    final_message = str(completed.get("last_agent_message", ""))
    _require(errors, "parent-terminal-fail-closed", "FAIL_CLOSED" in final_message)
    _require(errors, "parent-terminal-not-ready", "not `READY_FOR_SEPARATE_C1_V32_ACTIVATION`" in final_message)

    spawn_line = parent["spawn_call_line"]
    result_line = parent["spawn_result_line"]
    terminal_line = parent["terminal_record_line"]
    failure_call_line = parent["failed_invocation_call_line"]
    failure_result_line = parent["failed_invocation_result_line"]
    _require(errors, "parent-line-order", start < spawn_line < result_line < terminal_line < failure_call_line < failure_result_line < end)
    spawn = rows[spawn_line - 1].get("payload", {})
    source = _custom_source(rows[spawn_line - 1])
    _require(errors, "spawn-call-id", spawn.get("call_id") == parent["spawn_call_id"])
    for code, token in (
        ("spawn-tool", "spawn_agent"),
        ("spawn-marker", binding["spawn_marker"]),
        ("spawn-report", binding["report_relative_path"]),
        ("spawn-model", 'model: "gpt-5.6-luna"'),
        ("spawn-effort", 'reasoning_effort: "max"'),
        ("spawn-no-fork", "fork_context: false"),
        ("spawn-fork-turns", "fork_turns=none"),
    ):
        _require(errors, code, token in source)
    result = rows[result_line - 1].get("payload", {})
    _require(errors, "spawn-result-call-id", result.get("type") == "custom_tool_call_output" and result.get("call_id") == parent["spawn_call_id"])
    _require(errors, "spawn-result-child-id", child_id in output_text(rows[result_line - 1]))
    terminal = output_text(rows[terminal_line - 1])
    _require(errors, "terminal-child-id", child_id in terminal)
    _require(errors, "terminal-report-hash", report_sha256 in terminal)
    _require(errors, "terminal-completed", "completed" in terminal)

    marker_spawns = [row for row in rows if binding["spawn_marker"] in _custom_source(row) and "spawn_agent" in _custom_source(row)]
    _require(errors, "spawn-cardinality", len(marker_spawns) == 1)
    writer_calls = [row for row in rows if lineage["sealed_writer_relative_path"] in _custom_source(row) and "--slot c1-atomic8-prelaunch" in _custom_source(row)]
    _require(errors, "failed-writer-cardinality", len(writer_calls) == 1 == lineage["invocation_count"])
    failure_call = rows[failure_call_line - 1].get("payload", {})
    failure_source = _custom_source(rows[failure_call_line - 1])
    _require(errors, "failed-call-id", failure_call.get("call_id") == lineage["native_call_id"])
    _require(errors, "failed-command", lineage["exact_command"] in failure_source)
    _require(errors, "failed-workdir", lineage["workdir"] in failure_source)
    failure_result = rows[failure_result_line - 1].get("payload", {})
    failure_output = output_text(rows[failure_result_line - 1])
    _require(errors, "failed-result-call-id", failure_result.get("call_id") == lineage["native_call_id"])
    for code, token in (
        ("failed-exit", '"exit_code":1'),
        ("failed-type", lineage["exception_type"]),
        ("failed-message", lineage["exception_message"]),
        ("failed-source-call", lineage["unsupported_call"]),
    ):
        _require(errors, code, token in failure_output)
    for action in FORBIDDEN_ACTIONS:
        pattern = re.compile(rf"tools\.[A-Za-z0-9_]*{action}\s*\(")
        count = sum(bool(pattern.search(_custom_source(row))) and child_id in _custom_source(row) for row in rows)
        _require(errors, "parent-action-" + action, count == 0)
    return sorted(set(errors))


def validate_child_records(
    raw: tuple[bytes, ...],
    rows: tuple[dict[str, Any], ...],
    binding: dict[str, Any],
    report_sha256: str,
) -> list[str]:
    errors: list[str] = []
    child = binding["reviewer_native"]
    _require(errors, "child-session-lines", len(raw) == child["session_line_count"])
    _require(errors, "child-session-hash", sha_bytes(b"".join(raw)) == child["session_sha256"])
    for label, line_key, hash_key in (
        ("meta", "session_meta_line", "session_meta_record_sha256"),
        ("start", "task_started_line", "task_started_record_sha256"),
        ("context", "turn_context_line", "turn_context_record_sha256"),
        ("complete", "task_complete_line", "task_complete_record_sha256"),
    ):
        _require(errors, "child-record-" + label, raw_line_hash(raw, child[line_key]) == child[hash_key])
    metas = [row for row in rows if row.get("type") == "session_meta"]
    starts = [row for row in rows if row.get("type") == "event_msg" and row.get("payload", {}).get("type") == "task_started"]
    contexts = [row for row in rows if row.get("type") == "turn_context"]
    completes = [row for row in rows if row.get("type") == "event_msg" and row.get("payload", {}).get("type") == "task_complete"]
    _require(errors, "child-cardinality-meta", len(metas) == 1)
    _require(errors, "child-cardinality-start", len(starts) == 1)
    _require(errors, "child-cardinality-context", len(contexts) == 1)
    _require(errors, "child-cardinality-complete", len(completes) == 1)
    if not all((metas, starts, contexts, completes)):
        return sorted(set(errors))
    meta = metas[0].get("payload", {})
    start = starts[0].get("payload", {})
    context = contexts[0].get("payload", {})
    complete = completes[0].get("payload", {})
    collaboration = context.get("collaboration_mode", {}).get("settings", {})
    _require(errors, "child-id", meta.get("id") == child["native_thread_id"] and UUID7.fullmatch(str(meta.get("id", ""))) is not None)
    _require(errors, "child-parent", meta.get("parent_thread_id") == binding["controller_parent"]["native_thread_id"])
    _require(errors, "child-forked-from", meta.get("forked_from_id") is None)
    source = meta.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    _require(errors, "child-source-parent", source.get("parent_thread_id") == binding["controller_parent"]["native_thread_id"])
    _require(errors, "child-depth", source.get("depth") == 1)
    _require(errors, "child-nickname", source.get("agent_nickname") == "Meitner")
    _require(errors, "child-turn-start", start.get("turn_id") == child["native_turn_id"])
    _require(errors, "child-context-turn", context.get("turn_id") == child["native_turn_id"])
    _require(errors, "child-model", context.get("model") == MODEL and collaboration.get("model") == MODEL)
    _require(errors, "child-effort", context.get("effort") == EFFORT and collaboration.get("reasoning_effort") == EFFORT)
    _require(errors, "child-complete-turn", complete.get("turn_id") == child["native_turn_id"])
    _require(errors, "child-complete-last", child["task_complete_line"] == len(rows) and rows[-1].get("payload", {}).get("type") == "task_complete")
    terminal = str(complete.get("last_agent_message", ""))
    _require(errors, "child-terminal-report", report_sha256 in terminal)
    _require(errors, "child-terminal-pass", "PASS" in terminal)
    _require(errors, "child-terminal-zero", "activation/launch false, credit 0" in terminal)
    descendants = sum(len(re.findall(r"tools\.[A-Za-z0-9_]*spawn_agent\s*\(", _custom_source(row))) for row in rows)
    _require(errors, "child-descendants", descendants == 0)
    return sorted(set(errors))


def validate_binding_document(binding: dict[str, Any], authority: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    expected = authority["identity"]
    _require(errors, "binding-status", binding.get("status") == "PASS_NATIVE_IDENTITY_PREPARATION_ONLY")
    _require(errors, "binding-slot", binding.get("slot_id") == "c1-atomic8-prelaunch")
    _require(errors, "binding-report", binding.get("report_sha256") == authority["report"]["sha256"])
    _require(errors, "binding-controller", binding.get("controller_parent", {}).get("native_thread_id") == expected["controller_native_thread_id"])
    _require(errors, "binding-reviewer", binding.get("reviewer_native", {}).get("native_thread_id") == expected["reviewer_native_thread_id"])
    _require(errors, "binding-turn", binding.get("reviewer_native", {}).get("native_turn_id") == expected["reviewer_native_turn_id"])
    _require(errors, "binding-v32", binding.get("v32_policy_sha256") == authority["v32_policy"]["sha256"])
    errors.extend(validate_scope(binding.get("scope", {})))
    return sorted(set(errors))


def validate_lineage_document(lineage: dict[str, Any], authority: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    _require(errors, "lineage-status", lineage.get("status") == "FAILED_CLOSED_EXACTLY_ONCE_NO_RETRY_NO_WRITE")
    _require(errors, "lineage-count", lineage.get("invocation_count") == 1 and lineage.get("retry_count") == 0)
    _require(errors, "lineage-no-patch", lineage.get("sealed_writer_patched") is False and lineage.get("sealed_verifier_patched") is False)
    _require(errors, "lineage-output-zero", lineage.get("capture_written") is False and lineage.get("checkpoint_written") is False)
    _require(errors, "lineage-writer-hash", lineage.get("sealed_writer_sha256") == authority["sealed_v31"]["file_hashes"][lineage.get("sealed_writer_relative_path", "")])
    _require(errors, "lineage-verifier-hash", lineage.get("sealed_verifier_sha256") == authority["sealed_v31"]["file_hashes"][lineage.get("sealed_verifier_relative_path", "")])
    _require(errors, "lineage-exception", lineage.get("exception_type") == "TypeError" and "follow_symlinks" in str(lineage.get("exception_message", "")))
    _require(errors, "lineage-replacement", lineage.get("compatible_replacement") == "os.lstat(path) plus O_NOFOLLOW descriptor identity checks")
    errors.extend(validate_scope(lineage.get("scope", {})))
    return sorted(set(errors))


def _find_native_session(thread_id: str, session_root: Path) -> Path:
    if UUID7.fullmatch(thread_id) is None:
        raise ClosureError("native-thread-not-uuid7")
    matches: list[Path] = []
    for candidate in session_root.rglob("*" + thread_id + ".jsonl"):
        try:
            _, rows = stable_prefix_jsonl(candidate, session_root, 1)
            document = rows[0]
        except ClosureError:
            continue
        if document.get("type") == "session_meta" and document.get("payload", {}).get("id") == thread_id:
            matches.append(candidate)
    if len(matches) != 1:
        raise ClosureError("native-session-cardinality")
    return matches[0]


def load_stable_json_first_line(path: Path, root: Path) -> tuple[StableRead, dict[str, Any]]:
    item = stable_regular_read(path, root)
    first = item.raw.splitlines()
    if not first:
        raise ClosureError("native-session-empty")
    try:
        document = json.loads(first[0])
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ClosureError("native-session-first-line") from exc
    return item, document


def verify_live(
    authority: dict[str, Any],
    *,
    audit_root: Path,
    gate_root: Path,
    prep_root: Path,
    session_root: Path,
    require_future_authority_absent: bool = True,
) -> LiveEvidence:
    errors: list[str] = []
    _require(errors, "authority-status", authority.get("status") == "PREPARATION_ONLY_BLOCKED_FUTURE_CLOSURE_AUTHORITY_REQUIRED")
    _require(errors, "authority-append-only", authority.get("append_only") is True)
    errors.extend(validate_scope(authority.get("scope", {})))
    if errors:
        raise ClosureError(errors)

    for relative, expected_hash in authority["sealed_v31"]["file_hashes"].items():
        item = stable_regular_read(gate_root / relative, gate_root)
        if item.sha256 != expected_hash:
            errors.append("sealed-v31-drift:" + relative)
    policy = stable_regular_read(audit_root / authority["v32_policy"]["relative_path"], audit_root)
    if policy.sha256 != authority["v32_policy"]["sha256"]:
        errors.append("v32-policy-drift")

    lineage_item, lineage = load_stable_json(prep_root / authority["evidence"]["failed_invocation_lineage_path"], prep_root)
    binding_item, binding = load_stable_json(prep_root / authority["evidence"]["native_binding_path"], prep_root)
    if lineage_item.sha256 != authority["evidence"]["failed_invocation_lineage_sha256"]:
        errors.append("lineage-hash")
    if binding_item.sha256 != authority["evidence"]["native_binding_sha256"]:
        errors.append("binding-hash")
    errors.extend(validate_lineage_document(lineage, authority))
    errors.extend(validate_binding_document(binding, authority))

    report_path = audit_root / authority["report"]["relative_path"]
    report = stable_regular_read(report_path, gate_root)
    if report.sha256 != authority["report"]["sha256"] or len(report.raw) != authority["report"]["byte_count"]:
        errors.append("report-hash-or-size")
    if report.stat.st_ino != authority["report"]["inode"] or report.stat.st_mtime_ns != authority["report"]["mtime_ns"]:
        errors.append("report-inode-or-mtime")
    try:
        report_document = json.loads(report.raw)
    except (UnicodeDecodeError, json.JSONDecodeError):
        report_document = {}
        errors.append("report-json")
    errors.extend(validate_report_document(report_document, authority["report"]))

    parent_path = _find_native_session(authority["identity"]["controller_native_thread_id"], session_root)
    parent_raw, parent_rows = stable_prefix_jsonl(parent_path, session_root, binding["controller_parent"]["session_prefix_line_count"])
    child_path = _find_native_session(authority["identity"]["reviewer_native_thread_id"], session_root)
    child, child_raw, child_rows = stable_jsonl(child_path, session_root)
    errors.extend(validate_parent_records(parent_raw, parent_rows, binding, lineage, report.sha256))
    errors.extend(validate_child_records(child_raw, child_rows, binding, report.sha256))
    forbidden = set(authority["identity"]["forbidden_native_thread_ids"])
    if binding["reviewer_native"]["native_thread_id"] in forbidden:
        errors.append("native-identity-reuse")
    if len(forbidden | {binding["reviewer_native"]["native_thread_id"]}) != len(forbidden) + 1:
        errors.append("native-identity-cardinality")

    for key in ("capture_relative_path", "checkpoint_relative_path"):
        target = gate_root / authority["production"][key]
        if os.path.lexists(target):
            errors.append("production-not-zero:" + key)
    future_auth = prep_root / authority["production"]["future_authority_path"]
    if require_future_authority_absent and os.path.lexists(future_auth):
        errors.append("future-authority-must-be-absent-during-preparation")
    if errors:
        raise ClosureError(errors)
    return LiveEvidence(report, report_document, parent_raw, parent_rows, child, child_raw, child_rows, binding, lineage)


def build_checkpoint_and_capture(authority: dict[str, Any], evidence: LiveEvidence) -> tuple[bytes, bytes, dict[str, Any]]:
    binding = evidence.binding
    parent = binding["controller_parent"]
    child = binding["reviewer_native"]
    slot_id = authority["report"]["slot_id"]
    checkpoint_records = [
        {"record": "parent_native_spawn_call", "slot_id": slot_id, "controller_thread_id": parent["native_thread_id"], "controller_turn_id": parent["native_turn_id"], "native_call_id": parent["spawn_call_id"], "parent_line": parent["spawn_call_line"], "raw_record_sha256": parent["spawn_record_sha256"]},
        {"record": "parent_native_spawn_result", "slot_id": slot_id, "native_call_id": parent["spawn_call_id"], "native_thread_id": child["native_thread_id"], "parent_line": parent["spawn_result_line"], "raw_record_sha256": parent["spawn_result_record_sha256"]},
        {"record": "parent_native_terminal_mapping", "slot_id": slot_id, "native_thread_id": child["native_thread_id"], "report_sha256": evidence.report.sha256, "parent_line": parent["terminal_record_line"], "raw_record_sha256": parent["terminal_record_sha256"]},
        {"record": "child_native_session", "slot_id": slot_id, "native_thread_id": child["native_thread_id"], "native_turn_id": child["native_turn_id"], "session_line_count": child["session_line_count"], "session_sha256": child["session_sha256"], "session_meta_record_sha256": child["session_meta_record_sha256"], "task_started_record_sha256": child["task_started_record_sha256"], "turn_context_record_sha256": child["turn_context_record_sha256"], "task_complete_record_sha256": child["task_complete_record_sha256"], "report_sha256": evidence.report.sha256},
    ]
    checkpoint_raw = b"".join(canonical(record) for record in checkpoint_records)
    checkpoint_sha = sha_bytes(checkpoint_raw)
    capture = {
        "schema_version": "universal-shadow-certification-controller-native-reviewer-capture-v31-v1",
        "audit_id": authority["audit_id"],
        "wave_id": authority["wave_id"],
        "attempt_id": authority["attempt_id"],
        "slot_id": slot_id,
        "capture_authority": "controller_parent_native_session_records",
        "identity_authority": "native_session_not_report_self_attestation",
        "controller_native": {
            "native_thread_id": parent["native_thread_id"], "native_turn_id": parent["native_turn_id"],
            "actual_model": MODEL, "actual_reasoning_effort": EFFORT,
            "session_prefix_line_count": parent["session_prefix_line_count"], "session_prefix_sha256": parent["session_prefix_sha256"],
            "turn_start_line": parent["turn_start_line"], "turn_end_line": parent["turn_end_line"], "turn_segment_sha256": parent["turn_segment_sha256"],
            "spawn_call_line": parent["spawn_call_line"], "spawn_call_id": parent["spawn_call_id"], "spawn_record_sha256": parent["spawn_record_sha256"],
            "spawn_result_line": parent["spawn_result_line"], "spawn_result_record_sha256": parent["spawn_result_record_sha256"],
            "terminal_record_line": parent["terminal_record_line"], "terminal_record_sha256": parent["terminal_record_sha256"],
        },
        "reviewer_native": {
            "native_thread_id": child["native_thread_id"], "native_turn_id": child["native_turn_id"], "parent_thread_id": parent["native_thread_id"],
            "session_sha256": child["session_sha256"], "session_line_count": child["session_line_count"],
            "session_meta_line": child["session_meta_line"], "session_meta_record_sha256": child["session_meta_record_sha256"],
            "task_started_line": child["task_started_line"], "task_started_record_sha256": child["task_started_record_sha256"],
            "turn_context_line": child["turn_context_line"], "turn_context_record_sha256": child["turn_context_record_sha256"],
            "task_complete_line": child["task_complete_line"], "task_complete_record_sha256": child["task_complete_record_sha256"],
            "task_complete_is_last_line": True, "actual_model": MODEL, "actual_reasoning_effort": EFFORT,
            "collaboration_model": MODEL, "collaboration_reasoning_effort": EFFORT,
            "fork_context": False, "fork_turns": "none", "forked_from_id": None,
            "terminal_status": "completed", "terminal_report_sha256": evidence.report.sha256,
        },
        "closure": {"matching_spawn_count": 1, "followup_task_count": 0, "send_message_count": 0, "interrupt_count": 0, "retry_count": 0, "descendant_spawn_count": 0, "post_terminal_reuse_actions": []},
        "hash_closure": {"stable_double_read": True, "path_symlink": False, "report_sha256": evidence.report.sha256, "checkpoint_sha256": checkpoint_sha, "child_session_sha256": child["session_sha256"], "parent_session_prefix_sha256": parent["session_prefix_sha256"], "parent_turn_segment_sha256": parent["turn_segment_sha256"], "spawn_record_sha256": parent["spawn_record_sha256"], "spawn_result_record_sha256": parent["spawn_result_record_sha256"], "terminal_record_sha256": parent["terminal_record_sha256"]},
        "report_binding": {"relative_path": authority["report"]["relative_path"], "raw_sha256": evidence.report.sha256, "byte_count": len(evidence.report.raw), "inode": evidence.report.stat.st_ino, "mtime_epoch": int(evidence.report.stat.st_mtime), "semantic_status": "PASS", "identity_fields_authoritative": False, "terminal_sender_native_thread_id": child["native_thread_id"], "terminal_report_sha256": evidence.report.sha256},
        "checkpoint": {"relative_path": authority["production"]["checkpoint_relative_path"], "raw_sha256": checkpoint_sha, "record_count": 4},
        "scope": {"activation_authorized": False, "launch_authorized": False, "spawn": "none", "spawn_count": 0, "result_count": 0, "receipt_count": 0, "runtime_native_capture_rows": 0, "activation_transactions": 0, "credit": 0},
    }
    return checkpoint_raw, pretty(capture), capture


def validate_capture_document(capture: dict[str, Any], authority: dict[str, Any], checkpoint_raw: bytes) -> list[str]:
    errors: list[str] = []
    _require(errors, "capture-schema", capture.get("schema_version") == "universal-shadow-certification-controller-native-reviewer-capture-v31-v1")
    _require(errors, "capture-slot", capture.get("slot_id") == "c1-atomic8-prelaunch")
    _require(errors, "capture-controller", capture.get("controller_native", {}).get("native_thread_id") == authority["identity"]["controller_native_thread_id"])
    _require(errors, "capture-reviewer", capture.get("reviewer_native", {}).get("native_thread_id") == authority["identity"]["reviewer_native_thread_id"])
    _require(errors, "capture-report", capture.get("report_binding", {}).get("raw_sha256") == authority["report"]["sha256"])
    _require(errors, "capture-checkpoint", capture.get("checkpoint", {}).get("raw_sha256") == sha_bytes(checkpoint_raw))
    _require(errors, "capture-checkpoint-records", len(checkpoint_raw.splitlines()) == 4)
    scope = capture.get("scope", {})
    _require(errors, "capture-inactive", scope.get("activation_authorized") is False and scope.get("launch_authorized") is False and scope.get("credit") == 0)
    closure = capture.get("closure", {})
    _require(errors, "capture-cardinality", closure.get("matching_spawn_count") == 1)
    for key in ("followup_task_count", "send_message_count", "interrupt_count", "retry_count", "descendant_spawn_count"):
        _require(errors, "capture-zero-" + key, closure.get(key) == 0)
    return sorted(set(errors))


def exclusive_write_once(path: Path, root: Path, raw: bytes, *, mode: int = 0o444) -> StableRead:
    """Create exactly one immutable-ish proof file; never overwrite or unlink."""
    _safe_parent_chain(path, root)
    if os.path.lexists(path):
        raise ClosureError("output-exists")
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
    try:
        descriptor = os.open(path, flags, mode)
    except OSError as exc:
        raise ClosureError("output-exclusive-create") from exc
    try:
        offset = 0
        while offset < len(raw):
            written = os.write(descriptor, raw[offset:])
            if written <= 0:
                raise ClosureError("output-short-write")
            offset += written
        os.fsync(descriptor)
    finally:
        os.close(descriptor)
    directory = os.open(path.parent, os.O_RDONLY | getattr(os, "O_CLOEXEC", 0))
    try:
        os.fsync(directory)
    finally:
        os.close(directory)
    item = stable_regular_read(path, root)
    if item.raw != raw:
        raise ClosureError("output-readback")
    return item


def write_closure_pair(
    capture_path: Path,
    checkpoint_path: Path,
    gate_root: Path,
    capture_raw: bytes,
    checkpoint_raw: bytes,
) -> tuple[StableRead, StableRead]:
    if os.path.lexists(capture_path) or os.path.lexists(checkpoint_path):
        raise ClosureError("output-pair-not-empty")
    _safe_parent_chain(capture_path, gate_root)
    _safe_parent_chain(checkpoint_path, gate_root)
    checkpoint = exclusive_write_once(checkpoint_path, gate_root, checkpoint_raw)
    capture = exclusive_write_once(capture_path, gate_root, capture_raw)
    return capture, checkpoint
