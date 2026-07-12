#!/usr/bin/env python3
"""Fail-closed V31 controller-native identity gate for the immutable V30 retry."""
from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import os
import re
import stat
import subprocess
import sys
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker


AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
BASE = AUDIT / "master/external_research/universal-shadow-certification-wave-0001/retry-attempt-0002-v30"
HERE = Path(__file__).resolve().parents[1]
AUTHORITY_PATH = HERE / "AUTHORITY_V31.json"
CAPTURE_SCHEMA_PATH = HERE / "schemas/controller_native_reviewer_capture_v31.schema.json"
REPORT_SCHEMA_PATH = HERE / "schemas/atomic8_prelaunch_report_v31.schema.json"
TOOL_SEAL_PATH = HERE / "GATE_V31_TOOL_SEAL.json"
BASELINE_TEST = BASE / "verification-v2/test_retry_attempt_0002_v30_v3.py"
PYTHON = Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
SITE = AUDIT / "master/dependencies/jsonschema-draft202012-v1/site-packages"
SESSION_ROOT = Path("/Users/jaredsmacbookair/.codex/sessions")
EXPECTED_BASELINE_STDOUT_SHA256 = "2533adc1664f4b1a9d3680626351cb1e6ea339dd7654ea3a373837821de4a343"
UUID7 = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
FORBIDDEN_PARENT_ACTIONS = ("followup_task", "send_message", "interrupt_agent")


def sha_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_jsonl_raw(path: Path) -> tuple[list[bytes], list[dict[str, Any]]]:
    raw = path.read_bytes().splitlines(keepends=True)
    return raw, [json.loads(line) for line in raw]


def isolated_env() -> dict[str, str]:
    return {
        "HOME": os.environ.get("HOME", "/Users/jaredsmacbookair"),
        "PATH": str(PYTHON.parent) + os.pathsep + "/usr/bin:/bin",
        "PYTHONPATH": str(SITE),
        "PYTHONNOUSERSITE": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONHASHSEED": "0",
        "LC_ALL": "C",
        "TZ": "UTC",
    }


def run_baseline() -> tuple[int, dict[str, Any], str, str]:
    proc = subprocess.run(
        [str(PYTHON), "-S", "-B", str(BASELINE_TEST)],
        cwd=AUDIT,
        env=isolated_env(),
        capture_output=True,
        text=True,
        check=False,
    )
    try:
        report = json.loads(proc.stdout)
    except Exception:
        report = {"status": "unparseable", "stdout_tail": proc.stdout[-2000:]}
    return proc.returncode, report, proc.stderr[-2000:], sha_bytes(proc.stdout.encode())


def protected_v30_manifest() -> tuple[int, str]:
    rows: list[bytes] = []
    files = [p for p in BASE.rglob("*") if p.is_file() and HERE not in p.parents]
    for path in sorted(files, key=lambda p: p.relative_to(BASE).as_posix()):
        relative = path.relative_to(BASE).as_posix()
        rows.append(f"{sha(path)}  ./{relative}\n".encode())
    return len(files), sha_bytes(b"".join(rows))


def find_native_session(thread_id: str) -> Path:
    if not UUID7.fullmatch(thread_id):
        raise ValueError("native-thread-id-not-uuid7")
    matches: list[Path] = []
    for path in SESSION_ROOT.rglob(f"*{thread_id}.jsonl"):
        try:
            first = json.loads(path.read_bytes().splitlines()[0])
        except Exception:
            continue
        if first.get("type") == "session_meta" and first.get("payload", {}).get("id") == thread_id:
            matches.append(path)
    if len(matches) != 1:
        raise ValueError(f"native-session-cardinality:{thread_id}:{len(matches)}")
    return matches[0]


def regular_contained(path: Path, root: Path) -> bool:
    try:
        if path.is_symlink() or not path.is_file():
            return False
        resolved = path.resolve(strict=True)
        resolved.relative_to(root.resolve(strict=True))
        return stat.S_ISREG(path.stat(follow_symlinks=False).st_mode)
    except (FileNotFoundError, ValueError, OSError):
        return False


def stable_file_read(path: Path) -> tuple[bytes, os.stat_result, bool]:
    before = path.stat(follow_symlinks=False)
    first = path.read_bytes()
    middle = path.stat(follow_symlinks=False)
    second = path.read_bytes()
    after = path.stat(follow_symlinks=False)
    stable = (
        first == second
        and before.st_ino == middle.st_ino == after.st_ino
        and before.st_size == middle.st_size == after.st_size
        and before.st_mtime_ns == middle.st_mtime_ns == after.st_mtime_ns
    )
    return first, after, stable


def schema_errors(document: dict[str, Any], schema: dict[str, Any]) -> list[str]:
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    return ["schema:" + "/".join(str(x) for x in error.absolute_path) + ":" + error.validator for error in validator.iter_errors(document)]


def validate_capture_document(
    capture: dict[str, Any],
    slot_id: str,
    slot: dict[str, Any],
    schema: dict[str, Any],
    expected_native: dict[str, Any] | None = None,
) -> list[str]:
    errors = schema_errors(capture, schema)
    controller = capture.get("controller_native", {})
    reviewer = capture.get("reviewer_native", {})
    closure = capture.get("closure", {})
    hashes = capture.get("hash_closure", {})
    report = capture.get("report_binding", {})
    checkpoint = capture.get("checkpoint", {})
    scope = capture.get("scope", {})
    expected = expected_native or slot

    def require(name: str, condition: bool) -> None:
        if not condition:
            errors.append(name)

    require("slot-id", capture.get("slot_id") == slot_id)
    require("identity-authority", capture.get("identity_authority") == "native_session_not_report_self_attestation")
    require("controller-id", controller.get("native_thread_id") == "019f553d-af6e-7c91-a43f-d81e06d100fd")
    require("controller-model", controller.get("actual_model") == "gpt-5.6-luna")
    require("controller-effort", controller.get("actual_reasoning_effort") == "max")
    require("report-path", report.get("relative_path") == slot.get("report_path"))
    if slot.get("report_sha256"):
        require("report-authority-sha", report.get("raw_sha256") == slot["report_sha256"])
    if expected.get("native_thread_id"):
        require("native-thread-id", reviewer.get("native_thread_id") == expected["native_thread_id"])
    if expected.get("native_turn_id"):
        require("native-turn-id", reviewer.get("native_turn_id") == expected["native_turn_id"])
    for name, value in (
        ("native-model", reviewer.get("actual_model") == "gpt-5.6-luna"),
        ("native-effort", reviewer.get("actual_reasoning_effort") == "max"),
        ("collaboration-model", reviewer.get("collaboration_model") == "gpt-5.6-luna"),
        ("collaboration-effort", reviewer.get("collaboration_reasoning_effort") == "max"),
        ("fork-context", reviewer.get("fork_context") is False),
        ("fork-turns", reviewer.get("fork_turns") == "none"),
        ("forked-from", reviewer.get("forked_from_id") is None),
        ("task-complete-last", reviewer.get("task_complete_is_last_line") is True),
        ("terminal-status", reviewer.get("terminal_status") == "completed"),
        ("terminal-sender", report.get("terminal_sender_native_thread_id") == reviewer.get("native_thread_id")),
        ("terminal-report-sha", report.get("terminal_report_sha256") == report.get("raw_sha256") == reviewer.get("terminal_report_sha256")),
        ("report-hash-closure", hashes.get("report_sha256") == report.get("raw_sha256")),
        ("session-hash-closure", hashes.get("child_session_sha256") == reviewer.get("session_sha256")),
        ("parent-prefix-closure", hashes.get("parent_session_prefix_sha256") == controller.get("session_prefix_sha256")),
        ("parent-turn-closure", hashes.get("parent_turn_segment_sha256") == controller.get("turn_segment_sha256")),
        ("spawn-record-closure", hashes.get("spawn_record_sha256") == controller.get("spawn_record_sha256")),
        ("spawn-result-closure", hashes.get("spawn_result_record_sha256") == controller.get("spawn_result_record_sha256")),
        ("terminal-record-closure", hashes.get("terminal_record_sha256") == controller.get("terminal_record_sha256")),
        ("checkpoint-closure", hashes.get("checkpoint_sha256") == checkpoint.get("raw_sha256")),
        ("stable-double-read", hashes.get("stable_double_read") is True),
        ("not-symlink", hashes.get("path_symlink") is False),
        ("report-identity-ignored", report.get("identity_fields_authoritative") is False),
    ):
        require(name, value)
    for key in ("matching_spawn_count",):
        require("closure:" + key, closure.get(key) == 1)
    for key in ("followup_task_count", "send_message_count", "interrupt_count", "retry_count", "descendant_spawn_count"):
        require("closure:" + key, closure.get(key) == 0)
    require("closure:post-terminal", closure.get("post_terminal_reuse_actions") == [])
    require("scope:inactive", scope.get("activation_authorized") is False and scope.get("launch_authorized") is False)
    require("scope:no-spawn", scope.get("spawn") == "none" and scope.get("spawn_count") == 0)
    require(
        "scope:zero-state",
        all(scope.get(key) == 0 for key in ("result_count", "receipt_count", "runtime_native_capture_rows", "activation_transactions", "credit")),
    )
    return sorted(set(errors))


def validate_rejected_set_report(slot_id: str, slot: dict[str, Any], report: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    ids = slot["assignment_ids"]
    if report.get("status") != "fail_closed":
        errors.append(f"{slot_id}:report-status")
    if report.get("cohort_id") != slot["cohort_id"]:
        errors.append(f"{slot_id}:report-cohort")
    if slot["cohort_id"] == "cohort-0001":
        sets = report.get("sets", {})
        counts = report.get("counts", {})
        primary = report.get("primary_reconciliation", {})
        side = report.get("reviewer_side_effects", {})
        if sets.get("rejected_ids") != ids or sets.get("eligible_ids") != [] or sets.get("unresolved_ids") != []:
            errors.append(f"{slot_id}:report-sets")
        if counts.get("rejected_count") != 8 or counts.get("eligible_count") != 0 or counts.get("unresolved_count") != 0:
            errors.append(f"{slot_id}:report-counts")
        if primary.get("actual_sha256") != slot["primary_postrun_sha256"] or primary.get("sha256_match") is not True:
            errors.append(f"{slot_id}:report-primary")
        zero_keys = [k for k, v in side.items() if k.endswith(("_written", "_awarded", "_requested", "_started", "_modified")) and k != "report_write_count" and v != 0]
        if zero_keys:
            errors.append(f"{slot_id}:report-side-effects")
    else:
        primary = report.get("primary_comparison", {})
        side = report.get("zero_side_effects", {})
        if report.get("rejected_ids") != ids or report.get("eligible_ids") != [] or report.get("unresolved_count") != 0:
            errors.append(f"{slot_id}:report-sets")
        if report.get("rejected_count") != 8 or report.get("eligible_count") != 0:
            errors.append(f"{slot_id}:report-counts")
        if primary.get("primary_sha256") != slot["primary_postrun_sha256"] or primary.get("primary_rehash_matches_required_sha256") is not True:
            errors.append(f"{slot_id}:report-primary")
        zero_keys = [k for k, v in side.items() if k != "report_writes_by_reviewer" and isinstance(v, int) and v != 0]
        if zero_keys:
            errors.append(f"{slot_id}:report-side-effects")
        for key in ("candidate_credit", "certification_credit", "promotion_credit", "research_credit", "spec_edit_credit"):
            if report.get(key) != 0:
                errors.append(f"{slot_id}:report-credit:{key}")
    return sorted(set(errors))


def validate_atomic8_report(slot_id: str, slot: dict[str, Any], report: dict[str, Any], schema: dict[str, Any]) -> list[str]:
    errors = schema_errors(report, schema)
    expected = {
        "slot_id": slot_id,
        "cohort_id": slot["cohort_id"],
        "authority_sha256": slot["cohort_authority_sha256"],
        "manifest_sha256": slot["cohort_manifest_sha256"],
        "primary_postrun_sha256": slot["primary_postrun_sha256"],
        "primary_rejected_set_report_sha256": slot["primary_rejected_set_report_sha256"],
        "assignment_ids": slot["assignment_ids"],
    }
    for key, value in expected.items():
        if report.get(key) != value:
            errors.append(f"{slot_id}:atomic8:{key}")
    return sorted(set(errors))


def count_forbidden_parent_actions(rows: list[dict[str, Any]], thread_id: str, through_line: int) -> dict[str, int]:
    counts = {name: 0 for name in FORBIDDEN_PARENT_ACTIONS}
    for row in rows[:through_line]:
        payload = row.get("payload", {})
        if row.get("type") != "response_item" or payload.get("type") != "custom_tool_call":
            continue
        source = str(payload.get("input", ""))
        if thread_id not in source:
            continue
        for name in counts:
            if re.search(rf"tools\.[A-Za-z0-9_]*{name}\s*\(", source):
                counts[name] += 1
    return counts


def child_descendant_spawn_count(rows: list[dict[str, Any]]) -> int:
    total = 0
    for row in rows:
        payload = row.get("payload", {})
        if row.get("type") == "response_item" and payload.get("type") == "custom_tool_call":
            source = str(payload.get("input", ""))
            total += len(re.findall(r"tools\.[A-Za-z0-9_]*spawn_agent\s*\(", source))
    return total


def raw_line_hash(raw: list[bytes], line_number: int) -> str:
    if line_number < 1 or line_number > len(raw):
        return ""
    return sha_bytes(raw[line_number - 1])


def validate_live_capture(slot_id: str, slot: dict[str, Any], capture: dict[str, Any], schema: dict[str, Any]) -> list[str]:
    errors = validate_capture_document(capture, slot_id, slot, schema)
    controller = capture["controller_native"]
    reviewer = capture["reviewer_native"]
    report_binding = capture["report_binding"]
    checkpoint = capture["checkpoint"]

    report_path = AUDIT / slot["report_path"]
    if not regular_contained(report_path, AUDIT):
        errors.append(f"{slot_id}:report-path-or-symlink")
        return sorted(set(errors))
    report_raw, report_stat, report_stable = stable_file_read(report_path)
    report_sha = sha_bytes(report_raw)
    if not report_stable:
        errors.append(f"{slot_id}:report-toctou")
    if report_sha != report_binding.get("raw_sha256") or len(report_raw) != report_binding.get("byte_count"):
        errors.append(f"{slot_id}:report-bytes")
    if report_stat.st_ino != report_binding.get("inode") or int(report_stat.st_mtime) != report_binding.get("mtime_epoch"):
        errors.append(f"{slot_id}:report-inode-mtime")

    checkpoint_path = HERE / slot["checkpoint_path"]
    if not regular_contained(checkpoint_path, HERE) or sha(checkpoint_path) != checkpoint.get("raw_sha256"):
        errors.append(f"{slot_id}:checkpoint-bytes")
    else:
        records = [json.loads(line) for line in checkpoint_path.read_text().splitlines() if line]
        if len(records) != 4 or any(record.get("slot_id") != slot_id for record in records):
            errors.append(f"{slot_id}:checkpoint-records")

    try:
        parent_path = find_native_session(controller["native_thread_id"])
        parent_raw, parent_rows = load_jsonl_raw(parent_path)
    except Exception as exc:
        errors.append(f"{slot_id}:parent-session:{type(exc).__name__}")
        return sorted(set(errors))
    prefix_count = controller["session_prefix_line_count"]
    if len(parent_raw) < prefix_count or sha_bytes(b"".join(parent_raw[:prefix_count])) != controller["session_prefix_sha256"]:
        errors.append(f"{slot_id}:parent-prefix")
    start = controller["turn_start_line"]
    end = controller["turn_end_line"]
    if sha_bytes(b"".join(parent_raw[start - 1:end])) != controller["turn_segment_sha256"]:
        errors.append(f"{slot_id}:parent-turn-segment")
    for label, line_key, hash_key in (
        ("spawn", "spawn_call_line", "spawn_record_sha256"),
        ("spawn-result", "spawn_result_line", "spawn_result_record_sha256"),
        ("terminal", "terminal_record_line", "terminal_record_sha256"),
    ):
        if raw_line_hash(parent_raw, controller[line_key]) != controller[hash_key]:
            errors.append(f"{slot_id}:parent-record:{label}")
    parent_context = [r for r in parent_rows[start - 1:end] if r.get("type") == "turn_context" and r.get("payload", {}).get("turn_id") == controller["native_turn_id"]]
    if not parent_context or any(row["payload"].get("model") != "gpt-5.6-luna" or row["payload"].get("effort") != "max" for row in parent_context):
        errors.append(f"{slot_id}:parent-runtime-lane")
    spawn_payload = parent_rows[controller["spawn_call_line"] - 1].get("payload", {})
    spawn_source = str(spawn_payload.get("input", ""))
    report_suffix = f"{slot['cohort_id']}/postrun/luna_independent_postrun.json" if slot["role"] == "primary-rejected-set-postrun" else slot["report_path"]
    if (
        spawn_payload.get("call_id") != controller["spawn_call_id"]
        or report_suffix not in spawn_source
        or 'model: "gpt-5.6-luna"' not in spawn_source
        or 'reasoning_effort: "max"' not in spawn_source
        or "fork_context: false" not in spawn_source
    ):
        errors.append(f"{slot_id}:parent-spawn-semantics")
    spawn_result_text = json.dumps(parent_rows[controller["spawn_result_line"] - 1])
    terminal_text = json.dumps(parent_rows[controller["terminal_record_line"] - 1])
    if reviewer["native_thread_id"] not in spawn_result_text:
        errors.append(f"{slot_id}:spawn-result-native-id")
    if reviewer["native_thread_id"] not in terminal_text or report_sha not in terminal_text or "completed" not in terminal_text:
        errors.append(f"{slot_id}:terminal-native-report-binding")
    action_counts = count_forbidden_parent_actions(parent_rows, reviewer["native_thread_id"], prefix_count)
    closure_fields = {"followup_task": "followup_task_count", "send_message": "send_message_count", "interrupt_agent": "interrupt_count"}
    for name, count in action_counts.items():
        if count != capture["closure"][closure_fields[name]]:
            errors.append(f"{slot_id}:parent-action:{name}")
    correct_transaction_root = str(report_path.parents[2]) if slot["role"] == "primary-rejected-set-postrun" else str(HERE)
    matching_spawns = sum(
        1
        for row in parent_rows[:prefix_count]
        if row.get("type") == "response_item"
        and row.get("payload", {}).get("type") == "custom_tool_call"
        and "spawn_agent" in str(row.get("payload", {}).get("input", ""))
        and correct_transaction_root in str(row.get("payload", {}).get("input", ""))
        and report_suffix in str(row.get("payload", {}).get("input", ""))
    )
    if matching_spawns != capture["closure"]["matching_spawn_count"]:
        errors.append(f"{slot_id}:spawn-cardinality")

    try:
        child_path = find_native_session(reviewer["native_thread_id"])
        child_raw, child_rows = load_jsonl_raw(child_path)
    except Exception as exc:
        errors.append(f"{slot_id}:child-session:{type(exc).__name__}")
        return sorted(set(errors))
    if sha_bytes(b"".join(child_raw)) != reviewer["session_sha256"] or len(child_raw) != reviewer["session_line_count"]:
        errors.append(f"{slot_id}:child-session-bytes")
    for label, line_key, hash_key in (
        ("meta", "session_meta_line", "session_meta_record_sha256"),
        ("started", "task_started_line", "task_started_record_sha256"),
        ("context", "turn_context_line", "turn_context_record_sha256"),
        ("complete", "task_complete_line", "task_complete_record_sha256"),
    ):
        if raw_line_hash(child_raw, reviewer[line_key]) != reviewer[hash_key]:
            errors.append(f"{slot_id}:child-record:{label}")
    meta = child_rows[reviewer["session_meta_line"] - 1]
    started = child_rows[reviewer["task_started_line"] - 1]
    context = child_rows[reviewer["turn_context_line"] - 1]
    complete = child_rows[reviewer["task_complete_line"] - 1]
    if (
        meta.get("type") != "session_meta"
        or meta.get("payload", {}).get("id") != reviewer["native_thread_id"]
        or meta.get("payload", {}).get("parent_thread_id") != reviewer["parent_thread_id"]
        or meta.get("payload", {}).get("forked_from_id") is not None
    ):
        errors.append(f"{slot_id}:child-meta")
    if started.get("payload", {}).get("turn_id") != reviewer["native_turn_id"]:
        errors.append(f"{slot_id}:child-turn-start")
    ctx = context.get("payload", {})
    collaboration = ctx.get("collaboration_mode", {}).get("settings", {})
    if (
        ctx.get("turn_id") != reviewer["native_turn_id"]
        or ctx.get("model") != "gpt-5.6-luna"
        or ctx.get("effort") != "max"
        or collaboration.get("model") != "gpt-5.6-luna"
        or collaboration.get("reasoning_effort") != "max"
    ):
        errors.append(f"{slot_id}:child-runtime-lane")
    if (
        reviewer["task_complete_line"] != len(child_rows)
        or complete.get("type") != "event_msg"
        or complete.get("payload", {}).get("type") != "task_complete"
        or complete.get("payload", {}).get("turn_id") != reviewer["native_turn_id"]
        or report_sha not in str(complete.get("payload", {}).get("last_agent_message", ""))
    ):
        errors.append(f"{slot_id}:child-terminal")
    if child_descendant_spawn_count(child_rows) != capture["closure"]["descendant_spawn_count"]:
        errors.append(f"{slot_id}:child-descendants")
    for event_type, expected_count in (("session_meta", 1), ("turn_context", 1)):
        if sum(row.get("type") == event_type for row in child_rows) != expected_count:
            errors.append(f"{slot_id}:child-cardinality:{event_type}")
    if sum(row.get("type") == "event_msg" and row.get("payload", {}).get("type") == "task_started" for row in child_rows) != 1:
        errors.append(f"{slot_id}:child-cardinality:task-started")
    if sum(row.get("type") == "event_msg" and row.get("payload", {}).get("type") == "task_complete" for row in child_rows) != 1:
        errors.append(f"{slot_id}:child-cardinality:task-complete")
    return sorted(set(errors))


def validate_capture_set(captures: dict[str, dict[str, Any]], required_slots: set[str]) -> list[str]:
    errors: list[str] = []
    if set(captures) != required_slots:
        errors.append("capture-set:slot-cardinality")
    values = {
        "native-thread": [capture.get("reviewer_native", {}).get("native_thread_id") for capture in captures.values()],
        "native-turn": [capture.get("reviewer_native", {}).get("native_turn_id") for capture in captures.values()],
        "session-sha": [capture.get("reviewer_native", {}).get("session_sha256") for capture in captures.values()],
    }
    for label, items in values.items():
        if len(items) != len(set(items)) or any(item in {None, "", "019f553d-af6e-7c91-a43f-d81e06d100fd"} for item in items):
            errors.append(f"capture-set:unique:{label}")
    return sorted(set(errors))


def validate_tool_seal() -> list[str]:
    if not TOOL_SEAL_PATH.is_file():
        return ["tool-seal:missing"]
    seal = load(TOOL_SEAL_PATH)
    errors: list[str] = []
    for relative, expected in seal.get("file_hashes", {}).items():
        path = HERE / relative
        if not regular_contained(path, HERE) or sha(path) != expected:
            errors.append("tool-seal:" + relative)
    return sorted(set(errors))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("preparation", "prelaunch"), default="preparation")
    args = parser.parse_args()
    authority = load(AUTHORITY_PATH)
    capture_schema = load(CAPTURE_SCHEMA_PATH)
    report_schema = load(REPORT_SCHEMA_PATH)
    Draft202012Validator.check_schema(capture_schema)
    Draft202012Validator.check_schema(report_schema)
    checks: dict[str, bool] = {}
    errors: list[str] = []

    count, manifest_sha = protected_v30_manifest()
    checks["protected-v30-file-count"] = count == authority["protected_v30"]["protected_file_count"] == 54
    checks["protected-v30-manifest"] = manifest_sha == authority["protected_v30"]["sorted_file_hash_manifest_sha256"]
    direct_pins = {
        "payload-authority": (BASE / "AUTHORITY_V30_ATTEMPT_0002.json", authority["protected_v30"]["payload_authority_sha256"]),
        "terminal-preparation": (BASE / "terminal-preparation-report.json", authority["protected_v30"]["terminal_preparation_report_sha256"]),
        "v2-authority": (BASE / "verification-v2/AUTHORITY.json", authority["protected_v30"]["verification_v2_authority_sha256"]),
        "v2-verifier": (BASE / "verification-v2/verify_retry_attempt_0002_v30_v2.py", authority["protected_v30"]["verification_v2_verifier_sha256"]),
        "v3-test": (BASELINE_TEST, authority["protected_v30"]["verification_v3_825_test_sha256"]),
        "policy-v31": (AUDIT / authority["controller"]["v31_policy_path"], authority["controller"]["v31_policy_sha256"]),
        "policy-v32": (AUDIT / authority["controller"]["v32_prospective_policy_path"], authority["controller"]["v32_prospective_policy_sha256"]),
    }
    for name, (path, expected) in direct_pins.items():
        checks["pin:" + name] = path.is_file() and sha(path) == expected

    baseline_rc, baseline, baseline_stderr, baseline_stdout_sha = run_baseline()
    baseline_tests = baseline.get("tests", {})
    checks["baseline:exit-zero"] = baseline_rc == 0
    checks["baseline:status"] = baseline.get("status") == "pass" and baseline.get("errors") == []
    checks["baseline:825"] = baseline_tests.get("passed") == baseline_tests.get("total") == 825 and baseline_tests.get("failed") == 0
    checks["baseline:807-plus-18"] = baseline_tests.get("wrapped_cases") == 807 and baseline_tests.get("wrapper_cases") == 18
    checks["baseline:stdout-sha"] = baseline_stdout_sha == EXPECTED_BASELINE_STDOUT_SHA256
    checks["baseline:stderr-empty"] = baseline_stderr == ""
    checks["runtime:python"] = sys.version.split()[0] == "3.12.13"
    checks["runtime:jsonschema"] = importlib.metadata.version("jsonschema") == "4.26.0"

    old_gate_paths = [
        BASE / "cohort-0001/independent-validation/luna-primary-rejected-set.json",
        BASE / "cohort-0001/independent-validation/luna-atomic8-prelaunch.json",
        BASE / "cohort-0002/independent-validation/luna-primary-rejected-set.json",
        BASE / "cohort-0002/independent-validation/luna-atomic8-prelaunch.json",
    ]
    checks["v30-independent-validation-paths-absent"] = not any(path.exists() for path in old_gate_paths)
    checks["gate-no-activation-files"] = not any(path.name in {"activation_core.json", "activation_envelope.json"} for path in HERE.rglob("*"))
    checks["v32-one-atomic8"] = load(AUDIT / authority["controller"]["v32_prospective_policy_path"])["scheduling"]["maximum_concurrent_atomic_semantic_transactions"] == 1
    checks["v32-no-scenario-cert-overlap"] = load(AUDIT / authority["controller"]["v32_prospective_policy_path"])["scheduling"]["overlap_scenario_and_certification_semantic_transactions"] is False
    errors.extend(validate_tool_seal())

    captures: dict[str, dict[str, Any]] = {}
    completed_slots: set[str] = set()
    pending_slots: set[str] = set()
    for slot_id, slot in authority["slots"].items():
        report_path = AUDIT / slot["report_path"]
        capture_path = HERE / slot["capture_path"]
        checkpoint_path = HERE / slot["checkpoint_path"]
        if slot["role"] == "primary-rejected-set-postrun":
            if not report_path.is_file() or sha(report_path) != slot["report_sha256"]:
                errors.append(f"{slot_id}:report-pin")
                continue
            report = load(report_path)
            errors.extend(validate_rejected_set_report(slot_id, slot, report))
            if not capture_path.is_file() or not checkpoint_path.is_file():
                errors.append(f"{slot_id}:native-capture-missing")
                continue
            capture = load(capture_path)
            errors.extend(validate_live_capture(slot_id, slot, capture, capture_schema))
            captures[slot_id] = capture
            completed_slots.add(slot_id)
        else:
            if args.mode == "preparation":
                if report_path.exists() or capture_path.exists() or checkpoint_path.exists():
                    errors.append(f"{slot_id}:future-proof-artifact-present-before-launch")
                else:
                    pending_slots.add(slot_id)
            else:
                if not report_path.is_file():
                    errors.append(f"{slot_id}:atomic8-report-missing")
                    continue
                report = load(report_path)
                errors.extend(validate_atomic8_report(slot_id, slot, report, report_schema))
                if not capture_path.is_file() or not checkpoint_path.is_file():
                    errors.append(f"{slot_id}:native-capture-missing")
                    continue
                live_slot = dict(slot)
                live_slot["report_sha256"] = sha(report_path)
                capture = load(capture_path)
                errors.extend(validate_live_capture(slot_id, live_slot, capture, capture_schema))
                captures[slot_id] = capture
                completed_slots.add(slot_id)

    if args.mode == "preparation":
        errors.extend(validate_capture_set(captures, {"c1-primary-rejected-set-postrun", "c2-primary-rejected-set-postrun"}))
    else:
        errors.extend(validate_capture_set(captures, set(authority["slots"])))
    errors.extend(name for name, passed in checks.items() if not passed)
    errors = sorted(set(errors))
    status = (
        "pass_preparation_only_blocked_future_atomic8_prelaunch"
        if args.mode == "preparation" and not errors
        else ("pass_four_fresh_native_identities_prelaunch_proof_only" if args.mode == "prelaunch" and not errors else "fail_closed")
    )
    report = {
        "schema_version": "universal-shadow-certification-controller-native-gate-v31-verification-v1",
        "mode": args.mode,
        "status": status,
        "errors": errors,
        "checks": checks,
        "baseline": {"passed": baseline_tests.get("passed"), "failed": baseline_tests.get("failed"), "total": baseline_tests.get("total"), "stdout_sha256": baseline_stdout_sha},
        "native_gate": {
            "required_slots": 4,
            "completed_slots": sorted(completed_slots),
            "pending_slots": sorted(pending_slots),
            "unique_native_thread_ids": len({capture["reviewer_native"]["native_thread_id"] for capture in captures.values()}),
            "unique_native_turn_ids": len({capture["reviewer_native"]["native_turn_id"] for capture in captures.values()}),
            "unique_child_session_sha256": len({capture["reviewer_native"]["session_sha256"] for capture in captures.values()}),
        },
        "zero_state": authority["zero_state"],
        "activation_authorized": False,
        "launch_authorized": False,
        "spawn": "none",
        "spawn_count": 0,
        "credit": 0,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
