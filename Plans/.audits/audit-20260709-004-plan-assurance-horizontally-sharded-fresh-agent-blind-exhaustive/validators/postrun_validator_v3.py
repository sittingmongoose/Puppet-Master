#!/usr/bin/env python3
"""Attempt-aware post-run coverage validator v3 for audit-004 receipts.

This validator never edits runner output. It identifies mechanically eligible
coverage candidates only when a completed registry receipt, a positive
result-manifest validation receipt, and the referenced raw result agree with
the immutable global assignment and capsule. It never edits runner output;
``--output`` may write a versioned evidence snapshot.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path, PurePosixPath
from typing import Any


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
HERE = Path(__file__).resolve()
ROOT = HERE.parents[2] if HERE.parent.name == "frozen" else HERE.parents[1]
REPO = ROOT.parents[2]
REQUIRED_OUTPUT_LISTS = (
    "observations",
    "candidate_findings",
    "explicit_non_gaps",
    "unknowns",
    "exact_evidence_refs",
)
POSITIVE_STATUSES = {
    "accepted",
    "complete",
    "completed",
    "completed_valid",
    "pass",
    "passed",
    "success",
    "succeeded",
    "valid",
    "validated",
    "valid_result",
    "valid_terminal",
}
NEGATIVE_STATUSES = {
    "error",
    "fail",
    "failed",
    "failed_attempt",
    "failed_attempt_zero_coverage",
    "invalid",
    "pending",
    "quarantined",
    "rejected",
    "zero_coverage",
}

# Immutable authority anchors.  These values are deliberately not read from
# READY_FOR_RUNNERS.json: READY is itself one of the objects being verified.
IMMUTABLE_ANCHORS = {
    "ready": (
        "coordination/READY_FOR_RUNNERS.json",
        "aa353b8f33dfda7c2695d7325e843deb169a67b0d4d96778214c2e6674681b4c",
    ),
    "assignment_manifest": (
        "assignments/global_assignment_manifest.jsonl",
        "2dc5d14db8a3f8d6486de66c94463ee99abd5483392f4cfaf36c0d94de29db28",
    ),
    "window_manifest": (
        "manifests/window_manifest.jsonl",
        "36a657ccc9672a3f9335efe48305372326dd80a2eb07d7527d6cdfc6262c5b3d",
    ),
    "capsule_registry": (
        "manifests/context_capsule_registry.jsonl",
        "711a8f2697ee0c68b4af64d486b89e6ff831e4aa2b09d5cda63b3ed99ff388f9",
    ),
    "runner_registry": (
        "coordination/runner_thread_registry.json",
        "4d81e417ce0055ee26f7115b5c84d04e31713e8fc188140921bb359e7adcfbb2",
    ),
    "validator_result": (
        "validator_results.json",
        "488f0b2de1928b5e385103d7f68acebb29e1109ed35d80430c4a8c099181f1cb",
    ),
    "v2_authority": (
        "validators/VALIDATOR_AUTHORITY_V2.json",
        "88304df2f47c703531399b86a309ddce7fe71466f02f4d444f23f0e9b75f1ea0",
    ),
    "protocol_alert_0002": (
        "coordination/PROTOCOL_ALERT_0002.json",
        "1109e1e10eed0f2fa6336eb93f032331813f470afa84f94b945a8e14928fd9c6",
    ),
    "protocol_alert_0002_ack": (
        "coordination/PROTOCOL_ALERT_0002_ACK.json",
        "e3e19c0dfa805a7607a197d8efc3d1b32e0caa9cd762798f0efb3da2be7a3ed4",
    ),
    "protocol_alert_0003": (
        "coordination/PROTOCOL_ALERT_0003.json",
        "422bb587e404b9ea547b2f8248aac71d8443d64cccb6b08babc7a6ac92d05108",
    ),
    "protocol_alert_0004": (
        "coordination/PROTOCOL_ALERT_0004.json",
        "b08638d3b751aebd8b2fa8ad57c473f87249cbdcaf0338a519db73a36001f3dc",
    ),
    "v2_structural_rejection_adjudication": (
        "coordination/V2_STRUCTURAL_REJECTION_ADJUDICATION_V3.json",
        "10c2630d4e7232ac0bff42aa168926c26ff34ca7cb4e9da97460730ec92ad4e2",
    ),
    "frozen_v2_primary": (
        "validators/frozen/postrun_validator_v2.py",
        "6df3b229ca48e028b5a88010574131c18208a1f0cad89dd2c1b92223abedb7e2",
    ),
    "frozen_v2_crosscheck": (
        "validators/frozen/postrun_validator_v2_crosscheck.py",
        "7483557c3ca2213643d464208c1f6e7cbee3ef55b490cfeca20eea217406af30",
    ),
    "v2_crosschecked_floor_snapshot": (
        "validators/evidence/postrun_validator_v2.live.20260710T0343Z.json",
        "1bcef735be8c7b8e6e32708c1cbc06c322244c38967f409019f7c04c0f532390",
    ),
    "v2_crosschecked_floor_receipt": (
        "validators/evidence/postrun_validator_v2.crosscheck.live.20260710T0343Z.json",
        "d4a7191bf6af437cca01576dc837e027b1aa11cfde1626595a67fd0df8c53a6b",
    ),
    "initial_failure_lineage": (
        "validators/failure_lineage_v3.initial.json",
        "bf558c0aa8034e8bb1c82ae49462fe3603ae07651506d0942f2867fa7a0005f4",
    ),
}

EXPECTED_READY_VALUES = {
    "audit_id": AUDIT_ID,
    "status": "READY_FOR_RUNNERS",
    "prelaunch_validation_passed": True,
    "old_audit_substantive_credit": 0,
    "assignment_count": 2538,
    "window_count": 1269,
    "runner_count": 12,
    "manifest_sha256": IMMUTABLE_ANCHORS["assignment_manifest"][1],
    "window_manifest_sha256": IMMUTABLE_ANCHORS["window_manifest"][1],
    "capsule_registry_sha256": IMMUTABLE_ANCHORS["capsule_registry"][1],
    "runner_registry_sha256": IMMUTABLE_ANCHORS["runner_registry"][1],
    "validator_result_sha256": IMMUTABLE_ANCHORS["validator_result"][1],
}

KNOWN_REVOKED_ATTEMPTS = frozenset(
    {
        ("A004-000018-ADVERSARIAL-WIN-510B3DE676A3-0003", "1"),
        ("A004-000023-EXACT-WIN-F25915291C7A-0002", "1"),
        ("A004-000028-ADVERSARIAL-WIN-C45446C7AC96-0003", "1"),
    }
)
BOOTSTRAP_CHECKPOINT_REF = (
    "coordination/lineage_v3/candidates/"
    "checkpoint-000000-20260710T091708Z.json"
)
BOOTSTRAP_CHECKPOINT_SHA256 = "19ec083adf767edebd3e45831c3e433cd068a587cc065935a8813a3d6fa390be"

ATTEMPT_FIELDS = (
    "attempt_id",
    "attempt",
    "attempt_no",
    "attempt_number",
    "assignment_attempt_number",
    "attempt_ordinal",
)
IDENTITY_FIELDS = ("agent_instance_id", "agent_path", "agent_thread_id")
SCOPE_CONFIRMATION = {
    "capsule_only": True,
    "prior_audits_used": False,
    "other_results_used": False,
    "unrelated_windows_used": False,
}
V3_COVERAGE_POLICY = (
    "Prospective V3 credit requires one attempt-scoped positive result manifest joined "
    "to one explicit fresh registry attempt, three globally unique identity values, "
    "immutable assignment/capsule/source/result agreement, exact bounded evidence, and "
    "one terminally closed native session containing exactly one initial NEW_TASK, no "
    "later inbound message, and no custom_tool_call or custom_tool_call_output event. "
    "The sealed blind capsule contract, emitted scope declarations, and attempt-level "
    "failure/quarantine vetoes must also agree. The independently crosschecked "
    "19-assignment V2 floor is grandfathered from these new prospective-only session "
    "restrictions and is rechecked only for hard live immutable contradictions. Runner "
    "artifacts classified checkpoint_metadata are mutable progress diagnostics, are "
    "excluded from transaction evidence, and can never create or veto coverage. The "
    "reported post-checkpoint file lists are non-authoritative lower-bound diagnostics; "
    "all such files are excluded from this pinned-checkpoint credit transaction."
)

SCOPE_TRUE_IF_PRESENT = (
    "within_capsule_only",
    "read_only",
    "only_capsule_and_source_excerpt_read",
    "capsule_only",
    "no_prior_audits",
    "no_other_results",
    "no_unrelated_windows",
    "permitted_inputs_only",
    "allowed_assignment_inputs_only",
    "only_allowed_inputs_read",
    "canonical_document_read_only_within_assigned_slice",
    "read_only_named_capsule_and_excerpt",
    "used_only_assigned_capsule",
)
SCOPE_FALSE_IF_PRESENT = (
    "prior_audits_read",
    "prior_audits_accessed",
    "prior_audits_used",
    "prior_audits_seen",
    "prior_audits_or_findings_read",
    "other_results_read",
    "other_results_accessed",
    "other_results_used",
    "other_results_seen",
    "runner_results_or_receipts_read",
    "reviewer_results_read",
    "other_reviewer_results_accessed",
    "other_agents_used",
    "other_capsules_read",
    "other_windows_read",
    "other_capsules_or_windows_read",
    "unrelated_windows_read",
    "unrelated_windows_accessed",
    "unrelated_windows_used",
    "unrelated_windows_seen",
    "unrelated_files_read",
    "other_files_read",
    "web_sources_used",
    "web_sources_read",
    "external_research_used",
    "environment_keys_read",
    "git_state_read",
    "files_written",
    "writes_performed",
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def strict_json_loads(value: str | bytes | bytearray) -> Any:
    """Decode standards-compliant JSON with no ambiguous object keys."""

    def unique_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for key, item in pairs:
            if key in result:
                raise ValueError(f"duplicate JSON object key: {key!r}")
            result[key] = item
        return result

    def reject_nonfinite(token: str) -> Any:
        raise ValueError(f"non-standard JSON numeric constant: {token}")

    def finite_decimal(token: str) -> float:
        exact = Decimal(token)
        number = float(token)
        if not math.isfinite(number):
            raise ValueError(f"JSON decimal is outside the finite range: {token}")
        if exact != 0 and number == 0.0:
            raise ValueError(f"JSON decimal underflows the finite range: {token}")
        return number

    decoded = json.loads(
        value,
        object_pairs_hook=unique_object,
        parse_constant=reject_nonfinite,
        parse_float=finite_decimal,
    )
    pending = [decoded]
    while pending:
        item = pending.pop()
        if isinstance(item, str):
            if any(0xD800 <= ord(character) <= 0xDFFF for character in item):
                raise ValueError("JSON string contains an unpaired surrogate code point")
        elif isinstance(item, dict):
            pending.extend(item.keys())
            pending.extend(item.values())
        elif isinstance(item, list):
            pending.extend(item)
    return decoded


def strict_utf8_bytes(value: str) -> bytes | None:
    try:
        return value.encode("utf-8")
    except UnicodeEncodeError:
        return None


def write_new_evidence_output(requested: Path, rendered: str) -> None:
    """Exclusively create one versioned primary snapshot in validators/evidence."""
    evidence_root = (ROOT / "validators/evidence").resolve()
    candidate = requested if requested.is_absolute() else ROOT / requested
    if candidate.exists() or candidate.is_symlink():
        raise ValueError("--output must name a new, non-symlink evidence file")
    if candidate.parent.is_symlink() or candidate.parent.resolve() != evidence_root:
        raise ValueError("--output parent must be exactly validators/evidence")
    if not re.fullmatch(r"postrun_validator_v3\.(?!crosscheck\.)[A-Za-z0-9_.-]+\.json", candidate.name):
        raise ValueError("--output must use a versioned postrun_validator_v3.*.json filename")
    with candidate.open("x", encoding="utf-8") as handle:
        handle.write(rendered)


def sha256_prefix(path: Path, byte_count: int) -> str:
    digest = hashlib.sha256()
    remaining = byte_count
    with path.open("rb") as handle:
        while remaining:
            chunk = handle.read(min(1024 * 1024, remaining))
            if not chunk:
                break
            digest.update(chunk)
            remaining -= len(chunk)
    if remaining:
        raise ValueError(f"{path} is shorter than anchored prefix")
    return digest.hexdigest()


def file_bytes(path: Path) -> int:
    return path.stat().st_size


def load_json(path: Path, errors: list[str]) -> Any:
    try:
        return strict_json_loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"{path.relative_to(ROOT)}: invalid JSON: {exc}")
        return None


def load_json_with_bytes_bound(
    path: Path,
    expected_sha256: str,
    errors: list[str],
) -> tuple[Any, bytes | None]:
    """Parse exactly the bytes whose digest is authorized by the caller."""
    try:
        raw = path.read_bytes()
        if hashlib.sha256(raw).hexdigest() != expected_sha256:
            raise ValueError("bytes do not match the expected SHA-256")
        return strict_json_loads(raw.decode("utf-8")), raw
    except Exception as exc:
        try:
            label = path.relative_to(ROOT)
        except ValueError:
            label = path
        errors.append(f"{label}: invalid or unbound JSON: {exc}")
        return None, None


def load_json_bound(path: Path, expected_sha256: str, errors: list[str]) -> Any:
    value, _raw = load_json_with_bytes_bound(path, expected_sha256, errors)
    return value


def read_prefix_bytes_bound(
    path: Path,
    byte_count: int,
    expected_sha256: str,
) -> bytes:
    """Capture one prefix once and bind every derived semantic to that buffer."""
    if byte_count < 0:
        raise ValueError("negative prefix length")
    with path.open("rb") as handle:
        raw = handle.read(byte_count + 1)
    prefix = raw[:byte_count]
    if len(prefix) != byte_count:
        raise ValueError("file is shorter than anchored prefix")
    if hashlib.sha256(prefix).hexdigest() != expected_sha256:
        raise ValueError("captured prefix does not match the expected SHA-256")
    return prefix


def parse_jsonl_bytes(
    path: Path,
    raw: bytes,
    errors: list[str],
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    try:
        text = raw.decode("utf-8")
    except Exception as exc:
        errors.append(f"{path.relative_to(ROOT)}: cannot decode JSONL: {exc}")
        return rows
    for line_no, line in enumerate(text.splitlines(), 1):
        if not line.strip():
            continue
        try:
            value = strict_json_loads(line)
        except Exception as exc:
            errors.append(f"{path.relative_to(ROOT)}:{line_no}: invalid JSON: {exc}")
            continue
        if not isinstance(value, dict):
            errors.append(f"{path.relative_to(ROOT)}:{line_no}: row is not an object")
            continue
        value["_receipt_file"] = str(path.relative_to(ROOT))
        value["_receipt_line"] = line_no
        rows.append(value)
    return rows


def load_jsonl(path: Path, errors: list[str]) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    try:
        raw = path.read_bytes()
    except Exception as exc:
        errors.append(f"{path.relative_to(ROOT)}: cannot read JSONL: {exc}")
        return []
    return parse_jsonl_bytes(path, raw, errors)


def load_jsonl_bound(
    path: Path,
    expected_sha256: str,
    errors: list[str],
) -> list[dict[str, Any]]:
    try:
        raw = path.read_bytes()
        if hashlib.sha256(raw).hexdigest() != expected_sha256:
            raise ValueError("bytes do not match the expected SHA-256")
    except Exception as exc:
        errors.append(f"{path.relative_to(ROOT)}: invalid or unbound JSONL: {exc}")
        return []
    return parse_jsonl_bytes(path, raw, errors)


def load_jsonl_captured(
    path: Path,
    errors: list[str],
) -> tuple[list[dict[str, Any]], str | None]:
    try:
        raw = path.read_bytes()
    except Exception as exc:
        errors.append(f"{path.relative_to(ROOT)}: cannot read JSONL: {exc}")
        return [], None
    observed_hash = hashlib.sha256(raw).hexdigest()
    return parse_jsonl_bytes(path, raw, errors), observed_hash


def first(record: dict[str, Any], *names: str) -> Any:
    for name in names:
        if name in record:
            return record[name]
    return None


def hash_field(record: dict[str, Any], stem: str) -> Any:
    return first(record, f"{stem}_sha256", f"{stem}_hash")


def canonical_sha256(value: Any) -> str | None:
    if isinstance(value, str) and re.fullmatch(r"[0-9a-f]{64}", value):
        return value
    return None


def canonical_nonnegative_int(value: Any) -> int | None:
    if isinstance(value, int) and not isinstance(value, bool) and value >= 0:
        return value
    return None


def canonical_nonnegative_number(value: Any) -> int | float | None:
    if (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and value >= 0
    ):
        return value
    return None


def strict_context_ranges(
    assignment: dict[str, Any], capsule: dict[str, Any]
) -> tuple[list[list[int]], list[str]]:
    issues: list[str] = []
    raw_ranges: list[Any] = [assignment.get("core_range")]
    context = capsule.get("context_ranges", [])
    if not isinstance(context, list):
        issues.append("capsule context_ranges is not an array")
        context = []
    raw_ranges.extend(context)
    ranges: list[list[int]] = []
    for index, value in enumerate(raw_ranges):
        if (
            not isinstance(value, list)
            or len(value) != 2
            or any(not isinstance(item, int) or isinstance(item, bool) for item in value)
            or value[0] < 1
            or value[0] > value[1]
        ):
            issues.append(f"capsule range {index} is malformed")
            continue
        ranges.append(value)
    if not ranges:
        issues.append("capsule has no valid evidence range")
    return ranges, issues


def normalize_ref(value: Any) -> str | None:
    if not isinstance(value, str) or not value:
        return None
    return value


def repo_path(ref: Any) -> Path | None:
    ref = normalize_ref(ref)
    if ref is None:
        return None
    path = Path(ref)
    if path.is_absolute():
        return path
    if path.parts and path.parts[0] in {
        "assignments",
        "capsules",
        "coordination",
        "manifests",
        "merged",
        "reports",
        "runners",
        "validators",
    }:
        return ROOT / path
    return REPO / path


def under(path: Path, parent: Path) -> bool:
    try:
        path.resolve().relative_to(parent.resolve())
        return True
    except (ValueError, OSError):
        return False


def equal_field(
    issues: list[str],
    record: dict[str, Any],
    expected: dict[str, Any],
    receipt_names: tuple[str, ...],
    expected_name: str,
    required: bool = True,
) -> None:
    actual = first(record, *receipt_names)
    if actual is None and not required:
        return
    if actual is None:
        issues.append(f"missing {receipt_names[0]}")
    elif actual != expected.get(expected_name):
        issues.append(
            f"{receipt_names[0]} mismatch: {actual!r} != {expected.get(expected_name)!r}"
        )


def normalized_text(value: str) -> str:
    return " ".join(value.split())


def evidence_parts(ref: dict[str, Any]) -> tuple[Any, Any, Any, Any]:
    path = first(ref, "path", "document_path", "file")
    start = first(ref, "line_start", "start_line")
    end = first(ref, "line_end", "end_line")
    quote = first(
        ref, "quote", "excerpt", "exact_excerpt", "exact_quote", "exact_text"
    )
    compact = ref.get("ref")
    if (path is None or start is None) and isinstance(compact, str):
        match = re.fullmatch(r"(.+):(\d+)(?:-(\d+))?", compact.strip())
        if match:
            path = path or match.group(1)
            start = start or int(match.group(2))
            end = end or int(match.group(3) or match.group(2))
    return path, start, end, quote


def evidence_issues(
    ref: Any,
    assignment: dict[str, Any],
    capsule: dict[str, Any],
    source_lines: list[str],
    *,
    require_quote: bool,
) -> list[str]:
    if not isinstance(ref, dict):
        return ["evidence reference is not an object"]
    path, start, end, quote = evidence_parts(ref)
    issues: list[str] = []
    if path != assignment["document_path"]:
        issues.append("evidence document path mismatch")
    if not isinstance(start, int) or isinstance(start, bool):
        issues.append("evidence line_start missing or invalid")
        return issues
    if end is None:
        end = start
    if not isinstance(end, int) or isinstance(end, bool) or start > end:
        issues.append("evidence line range invalid")
        return issues
    ranges, range_issues = strict_context_ranges(assignment, capsule)
    issues.extend(range_issues)
    if not any(start >= low and end <= high for low, high in ranges):
        issues.append("evidence range outside assigned capsule")
    if start < 1 or end > len(source_lines):
        issues.append("evidence range outside canonical source")
        return issues
    if require_quote:
        if not isinstance(quote, str) or not quote.strip():
            issues.append("exact evidence quote missing")
        else:
            source_text = "\n".join(source_lines[start - 1 : end])
            if quote not in source_text:
                issues.append("exact evidence quote mismatch")
    return issues


def attempt_token(record: dict[str, Any]) -> str | None:
    value = first(record, "attempt_id", "attempt", "attempt_no", "attempt_number")
    if value is None:
        return None
    if isinstance(value, int):
        return str(value)
    text = str(value)
    match = re.search(r"attempt[-_]?(\d+)$", text, re.IGNORECASE)
    return str(int(match.group(1))) if match else text


def same_attempt(left: dict[str, Any], right: dict[str, Any]) -> bool:
    if left.get("assignment_id") != right.get("assignment_id"):
        return False
    for field in ("agent_instance_id", "agent_thread_id", "agent_path"):
        if left.get(field) and right.get(field):
            return left[field] == right[field]
    left_attempt = attempt_token(left)
    right_attempt = attempt_token(right)
    if left_attempt is not None and right_attempt is not None:
        return left_attempt == right_attempt
    return True


def primary_identity(record: dict[str, Any]) -> tuple[str, str] | None:
    for field in ("agent_instance_id", "agent_thread_id", "agent_path"):
        value = record.get(field)
        if value:
            return field, str(value)
    return None


def attempt_identity_key(record: dict[str, Any]) -> tuple[str, str, str, str]:
    assignment_id = str(record.get("assignment_id") or "")
    identity = primary_identity(record) or ("missing_identity", "")
    attempt = attempt_token(record) or f"identity:{identity[0]}:{identity[1]}"
    return assignment_id, attempt, identity[0], identity[1]


def walk_dicts(value: Any):
    if isinstance(value, dict):
        yield value
        for nested in value.values():
            yield from walk_dicts(nested)
    elif isinstance(value, list):
        for nested in value:
            yield from walk_dicts(nested)


def check_receipt_metadata(
    record: dict[str, Any],
    assignment: dict[str, Any],
    capsule: dict[str, Any],
    *,
    strict_identity: bool,
) -> list[str]:
    issues: list[str] = []
    equal_field(issues, record, assignment, ("runner_id",), "runner_id")
    equal_field(issues, record, assignment, ("role",), "role")
    equal_field(issues, record, assignment, ("window_id",), "window_id")
    equal_field(issues, record, assignment, ("doc_id",), "doc_id")
    equal_field(issues, record, assignment, ("document_path",), "document_path")
    equal_field(issues, record, assignment, ("core_range",), "core_range")
    equal_field(issues, record, assignment, ("capsule_ref",), "capsule_ref")
    equal_field(
        issues, record, assignment, ("capsule_sha256", "capsule_hash"), "capsule_sha256"
    )
    equal_field(issues, record, assignment, ("capsule_bytes",), "capsule_bytes")
    equal_field(
        issues,
        record,
        assignment,
        ("source_sha256", "source_hash"),
        "source_sha256",
    )
    equal_field(
        issues,
        record,
        assignment,
        ("source_excerpt_ref",),
        "source_excerpt_ref",
        required=False,
    )
    equal_field(
        issues,
        record,
        assignment,
        ("source_excerpt_sha256", "source_excerpt_hash"),
        "source_excerpt_sha256",
        required=False,
    )
    equal_field(
        issues,
        record,
        assignment,
        ("source_excerpt_bytes",),
        "source_excerpt_bytes",
        required=False,
    )
    if first(record, "model") != assignment["required_model"]:
        issues.append("wrong or missing model")
    if first(record, "reasoning_effort") != assignment["required_reasoning_effort"]:
        issues.append("wrong or missing reasoning_effort")
    if first(record, "prior_substantive_assignment_count") != 0:
        issues.append("prior_substantive_assignment_count must equal 0")
    if first(record, "terminal_after_result") is not True:
        issues.append("terminal_after_result must be true")
    if first(record, "no_followup_reuse") is not True:
        issues.append("no_followup_reuse must be true")
    if first(record, "fork_turns") not in (None, "none"):
        issues.append("fork_turns must be none when recorded")
    context = first(record, "context_ranges", "overlap_ranges")
    if context is not None and context != capsule.get("context_ranges", []):
        issues.append("context/overlap ranges mismatch capsule")
    for field in ("agent_instance_id", "agent_path"):
        if not first(record, field):
            issues.append(f"missing {field}")
    if strict_identity and not first(record, "agent_thread_id"):
        issues.append("missing agent_thread_id")
    return issues


def strict_normalize_attempt(value: Any) -> str | None:
    """Return a canonical positive decimal attempt number."""
    if isinstance(value, bool) or value is None:
        return None
    if isinstance(value, int):
        return str(value) if value > 0 else None
    text = str(value).strip()
    if re.fullmatch(r"\d+", text):
        number = int(text)
        return str(number) if number > 0 else None
    match = re.search(r"attempt[-_]?0*(\d+)$", text, re.IGNORECASE)
    if not match:
        return None
    number = int(match.group(1))
    return str(number) if number > 0 else None


def strict_attempt(record: dict[str, Any]) -> tuple[str | None, list[str]]:
    supplied = [record[name] for name in ATTEMPT_FIELDS if record.get(name) is not None]
    if not supplied:
        return None, ["missing explicit attempt number"]
    normalized = [strict_normalize_attempt(value) for value in supplied]
    if any(value is None for value in normalized):
        return None, ["invalid attempt number"]
    unique = set(normalized)
    if len(unique) != 1:
        return None, [f"conflicting attempt numbers: {sorted(unique)}"]
    return next(iter(unique)), []


def strict_identity_field(field: str, value: Any) -> str | None:
    if field not in IDENTITY_FIELDS:
        return None
    if not isinstance(value, str) or not value or value != value.strip():
        return None
    if field == "agent_path":
        normalized = str(PurePosixPath(value))
        if (
            not value.startswith("/root/")
            or normalized != value
            or any(part in {"", ".", ".."} for part in value.split("/")[2:])
        ):
            return None
    return value


def strict_identity(record: dict[str, Any]) -> tuple[str, str, str] | None:
    values = [
        strict_identity_field(field, record.get(field))
        for field in IDENTITY_FIELDS
    ]
    if any(value is None for value in values):
        return None
    return values[0], values[1], values[2]


def strict_custom_tool_issues(rows: list[dict[str, Any]]) -> list[str]:
    """Fail closed on every native-session custom tool invocation.

    A ``custom_tool_call`` can execute arbitrary V8 which can in turn invoke
    nested host tools and a shell.  Proving confinement would therefore
    require a positive parser for both JavaScript and every reachable command
    language.  V3 deliberately makes the smaller auditable claim: prospective
    credit is available only when the checkpointed native session contains no
    custom tool call at all.  Pure response reasoning remains inspectable via
    the immutable session transcript.
    """
    forbidden_rows = [
        row
        for row in rows
        if isinstance(row, dict)
        and (
            row.get("type") in {"custom_tool_call", "custom_tool_call_output"}
            or (
                isinstance(row.get("payload"), dict)
                and row["payload"].get("type")
                in {"custom_tool_call", "custom_tool_call_output"}
            )
        )
    ]
    return [
        (
            f"custom tool event {index} is forbidden for prospective V3 credit; "
            "V3 does not claim JavaScript, nested-command, or output confinement"
        )
        for index, _row in enumerate(forbidden_rows, 1)
    ]


def strict_read_closed_native_session(
    session_path: Path,
    session_row: dict[str, Any],
) -> tuple[bytes | None, list[str]]:
    """Read one native session only when the checkpoint is its terminal seal."""
    count = session_row.get("prefix_bytes")
    if canonical_nonnegative_int(count) is None:
        return None, ["native session checkpoint byte count is invalid"]
    expected_device = session_row.get("device")
    expected_inode = session_row.get("inode")
    if canonical_nonnegative_int(expected_device) is None or canonical_nonnegative_int(
        expected_inode
    ) is None:
        return None, ["native session checkpoint identity is invalid"]
    try:
        if session_path.is_symlink():
            raise ValueError("session path is a symlink")
        before = session_path.stat()
        with session_path.open("rb") as handle:
            opened = os.fstat(handle.fileno())
            raw_bytes = handle.read()
            closed = os.fstat(handle.fileno())
        after = session_path.stat()
    except Exception as exc:
        return None, [f"native session closure read failed: {type(exc).__name__}"]
    identities = {
        (state.st_dev, state.st_ino)
        for state in (before, opened, closed, after)
    }
    sizes = {state.st_size for state in (before, opened, closed, after)}
    mtimes = {state.st_mtime_ns for state in (before, opened, closed, after)}
    ctimes = {state.st_ctime_ns for state in (before, opened, closed, after)}
    issues: list[str] = []
    if identities != {(expected_device, expected_inode)}:
        issues.append("native session inode or device differs from checkpoint")
    if sizes != {count} or len(raw_bytes) != count:
        issues.append(
            "native session is not terminally closed at the checkpoint byte length"
        )
    if len(mtimes) != 1 or len(ctimes) != 1:
        issues.append("native session changed during closure read")
    if hashlib.sha256(raw_bytes).hexdigest() != session_row.get("prefix_sha256"):
        issues.append("native session full-file hash differs from checkpoint")
    return (raw_bytes if not issues else None), issues


def strict_agent_message_issues(
    rows: list[dict[str, Any]],
    agent_path: Any,
) -> list[str]:
    """Require one initial encrypted NEW_TASK and reject every later delivery."""
    issues: list[str] = []
    delivery_rows: list[tuple[int, dict[str, Any]]] = []
    outbound_rows: list[int] = []
    user_lines: list[int] = []
    turn_lines: list[int] = []
    for index, row in enumerate(rows, 1):
        payload = row.get("payload") if isinstance(row, dict) else None
        if row.get("type") == "turn_context":
            turn_lines.append(index)
        if not isinstance(payload, dict):
            continue
        if payload.get("type") == "message" and payload.get("role") == "user":
            user_lines.append(index)
        if row.get("type") == "response_item" and payload.get("type") == "agent_message":
            is_outbound = (
                set(payload) == {"type", "message", "phase", "memory_citation"}
                and payload.get("phase") in {"commentary", "final_answer"}
                and isinstance(payload.get("message"), str)
            )
            if is_outbound:
                outbound_rows.append(index)
            else:
                delivery_rows.append((index, payload))
    if len(delivery_rows) != 1:
        issues.append(
            "native session must contain exactly one initial inbound agent message"
        )
        return issues
    delivery_line, payload = delivery_rows[0]
    if set(payload) != {
        "type",
        "author",
        "recipient",
        "content",
        "internal_chat_message_metadata_passthrough",
    }:
        issues.append("initial agent message has an unexpected payload schema")
    if any(index < delivery_line for index in outbound_rows):
        issues.append("native session emitted agent output before its NEW_TASK")
    if (
        payload.get("author") != "/root"
        or not isinstance(agent_path, str)
        or payload.get("recipient") != agent_path
    ):
        issues.append("initial agent message sender or recipient is not authorized")
    expected_text = (
        f"Message Type: NEW_TASK\nTask name: {agent_path}\n"
        "Sender: /root\nPayload:\n"
    )
    content = payload.get("content")
    if (
        not isinstance(content, list)
        or len(content) != 2
        or not isinstance(content[0], dict)
        or set(content[0]) != {"type", "text"}
        or content[0].get("type") != "input_text"
        or content[0].get("text") != expected_text
        or not isinstance(content[1], dict)
        or set(content[1]) != {"type", "encrypted_content"}
        or content[1].get("type") != "encrypted_content"
        or not isinstance(content[1].get("encrypted_content"), str)
        or not content[1]["encrypted_content"].startswith("gAAAAA")
    ):
        issues.append("initial agent message is not the sealed encrypted NEW_TASK form")
    metadata = payload.get("internal_chat_message_metadata_passthrough")
    if (
        not isinstance(metadata, dict)
        or set(metadata) != {"turn_id"}
        or not isinstance(metadata.get("turn_id"), str)
        or not metadata["turn_id"]
    ):
        issues.append("initial agent message lacks its exact turn binding")
    turn_payload = (
        rows[turn_lines[0] - 1].get("payload")
        if len(turn_lines) == 1
        and isinstance(rows[turn_lines[0] - 1].get("payload"), dict)
        else {}
    )
    if isinstance(metadata, dict) and metadata.get("turn_id") != turn_payload.get(
        "turn_id"
    ):
        issues.append("initial agent message turn_id differs from turn_context")
    if (
        len(user_lines) != 1
        or len(turn_lines) != 1
        or not (user_lines[0] < turn_lines[0] < delivery_line)
    ):
        issues.append("initial agent message chronology is not authorized")
    for index, row in enumerate(rows, 1):
        payload_row = row.get("payload") if isinstance(row, dict) else None
        if (
            index > delivery_line
            and row.get("type") == "response_item"
            and isinstance(payload_row, dict)
            and payload_row.get("type") == "message"
            and payload_row.get("role") in {"user", "developer", "system"}
        ):
            issues.append("native session received a later inbound message")
            break
    return issues


def strict_transcript_event_issues(rows: list[dict[str, Any]]) -> list[str]:
    """Accept only transcript events proven non-actionable by the V3 contract."""
    issues: list[str] = []
    allowed_outer = {
        "session_meta",
        "event_msg",
        "response_item",
        "inter_agent_communication_metadata",
        "world_state",
        "turn_context",
    }
    allowed_event_payloads = {
        "task_started",
        "agent_reasoning",
        "token_count",
        "agent_message",
        "task_complete",
    }
    outer_payload_keys = {
        "session_meta": {
            "session_id", "id", "parent_thread_id", "timestamp", "cwd",
            "originator", "cli_version", "source", "thread_source",
            "agent_nickname", "agent_path", "model_provider",
            "base_instructions", "history_mode", "multi_agent_version",
            "context_window", "git",
        },
        "world_state": {"full", "state"},
        "turn_context": {
            "turn_id", "cwd", "workspace_roots", "current_date", "timezone",
            "approval_policy", "approvals_reviewer", "sandbox_policy",
            "permission_profile", "model", "comp_hash", "personality",
            "collaboration_mode", "multi_agent_version", "multi_agent_mode",
            "realtime_active", "effort", "summary",
        },
        "inter_agent_communication_metadata": {"trigger_turn"},
    }
    event_payload_keys = {
        "task_started": {
            "type", "collaboration_mode_kind", "model_context_window",
            "started_at", "turn_id",
        },
        "agent_reasoning": {"type", "text"},
        "token_count": {"type", "info", "rate_limits"},
        "agent_message": {"type", "message", "phase", "memory_citation"},
        "task_complete": {
            "type", "completed_at", "duration_ms", "last_agent_message",
            "time_to_first_token_ms", "turn_id",
        },
    }
    response_payload_keys = {
        "reasoning": {
            "type", "id", "summary", "encrypted_content",
            "internal_chat_message_metadata_passthrough",
        },
        "message": {
            "type", "role", "content", "id", "phase",
            "internal_chat_message_metadata_passthrough",
        },
        "agent_message": {
            "type", "author", "recipient", "content", "message", "phase",
            "memory_citation", "internal_chat_message_metadata_passthrough",
        },
        "custom_tool_call": {
            "type", "id", "call_id", "name", "input", "status",
            "internal_chat_message_metadata_passthrough",
        },
        "custom_tool_call_output": {
            "type", "call_id", "output",
            "internal_chat_message_metadata_passthrough",
        },
    }
    calls: dict[str, tuple[int, str]] = {}
    outputs: dict[str, tuple[int, str]] = {}
    session_meta_lines: list[int] = []
    turn_context_rows: list[tuple[int, dict[str, Any]]] = []
    singleton_rows: dict[str, list[int]] = defaultdict(list)
    task_started_rows: list[tuple[int, dict[str, Any]]] = []
    task_complete_rows: list[tuple[int, dict[str, Any]]] = []
    response_turns: list[tuple[int, str]] = []
    for index, row in enumerate(rows, 1):
        outer_type = row.get("type")
        payload = row.get("payload") if isinstance(row, dict) else None
        if not isinstance(row, dict) or set(row) != {"timestamp", "type", "payload"}:
            issues.append(f"transcript outer row schema is not allowed at line {index}")
        if outer_type not in allowed_outer:
            issues.append(f"unknown or actionable transcript row type at line {index}")
            continue
        if not isinstance(payload, dict):
            issues.append(f"transcript payload is not an object at line {index}")
            continue
        if outer_type in outer_payload_keys:
            singleton_rows[outer_type].append(index)
            allowed_keys = outer_payload_keys[outer_type]
            if set(payload) != allowed_keys:
                issues.append(
                    f"{outer_type} payload schema is not closed at line {index}"
                )
            if outer_type == "session_meta":
                session_meta_lines.append(index)
                if not {"id", "parent_thread_id", "agent_path"}.issubset(payload):
                    issues.append(f"session_meta lacks identity fields at line {index}")
            elif outer_type == "world_state":
                state = payload.get("state")
                if (
                    set(payload) != {"full", "state"}
                    or not isinstance(payload.get("full"), bool)
                    or not isinstance(state, dict)
                ):
                    issues.append(f"world_state payload is not static state at line {index}")
                elif (
                    set(state)
                    - {
                        "agents_md", "apps_instructions", "environments",
                        "plugins_instructions", "skills",
                    }
                    or not {"agents_md", "environments"}.issubset(state)
                ):
                    issues.append(
                        f"world_state contains unapproved ambient context at line {index}"
                    )
            elif outer_type == "inter_agent_communication_metadata":
                if payload != {"trigger_turn": True}:
                    issues.append(
                        f"inter-agent metadata payload is not the sealed trigger at line {index}"
                    )
            elif outer_type == "turn_context":
                turn_context_rows.append((index, payload))
                if not isinstance(payload.get("turn_id"), str) or not payload["turn_id"]:
                    issues.append(f"turn_context lacks a canonical turn_id at line {index}")
                if payload.get("summary") != "auto":
                    issues.append(
                        f"turn_context carries inherited summary context at line {index}"
                    )
            continue
        if outer_type == "event_msg":
            event_type = payload.get("type")
            if event_type not in allowed_event_payloads:
                issues.append(
                    f"unknown or actionable event_msg payload at line {index}: {event_type!r}"
                )
            elif set(payload) != event_payload_keys[event_type]:
                issues.append(
                    f"event_msg payload schema is not closed at line {index}: {event_type!r}"
                )
            if event_type == "task_started":
                task_started_rows.append((index, payload))
            elif event_type == "task_complete":
                task_complete_rows.append((index, payload))
            continue
        if outer_type != "response_item":
            continue
        payload_type = payload.get("type")
        if "internal_chat_message_metadata_passthrough" in payload:
            response_metadata = payload.get(
                "internal_chat_message_metadata_passthrough"
            )
            if (
                not isinstance(response_metadata, dict)
                or set(response_metadata) != {"turn_id"}
                or not isinstance(response_metadata.get("turn_id"), str)
                or not response_metadata["turn_id"]
            ):
                issues.append(
                    f"response turn metadata schema is not closed at line {index}"
                )
        if payload_type == "reasoning":
            if set(payload) != response_payload_keys[payload_type]:
                issues.append(f"reasoning payload schema is not closed at line {index}")
            summary = payload.get("summary")
            if (
                not isinstance(summary, list)
                or any(
                    not isinstance(item, dict)
                    or set(item) != {"type", "text"}
                    or item.get("type") != "summary_text"
                    or not isinstance(item.get("text"), str)
                    for item in summary
                )
            ):
                issues.append(f"reasoning summary grammar is not closed at line {index}")
            metadata = payload.get("internal_chat_message_metadata_passthrough")
            if isinstance(metadata, dict) and isinstance(metadata.get("turn_id"), str):
                response_turns.append((index, metadata["turn_id"]))
            continue
        if payload_type == "message":
            message_key_variants = {
                frozenset({
                    "type", "role", "content",
                    "internal_chat_message_metadata_passthrough",
                }),
                frozenset({
                    "type", "role", "content", "id",
                    "internal_chat_message_metadata_passthrough",
                }),
                frozenset({
                    "type", "role", "content", "id", "phase",
                    "internal_chat_message_metadata_passthrough",
                }),
            }
            if frozenset(payload) not in message_key_variants:
                issues.append(f"message payload schema is not closed at line {index}")
            role = payload.get("role")
            if role not in {"developer", "user", "assistant"}:
                issues.append(f"response message role is not allowed at line {index}")
            content = payload.get("content")
            expected_content_type = "output_text" if role == "assistant" else "input_text"
            if (
                not isinstance(content, list)
                or any(
                    not isinstance(item, dict)
                    or set(item) != {"type", "text"}
                    or item.get("type") != expected_content_type
                    or not isinstance(item.get("text"), str)
                    for item in content
                )
            ):
                issues.append(f"message content grammar is not closed at line {index}")
            metadata = payload.get("internal_chat_message_metadata_passthrough")
            if isinstance(metadata, dict) and isinstance(metadata.get("turn_id"), str):
                response_turns.append((index, metadata["turn_id"]))
            continue
        if payload_type == "agent_message":
            inbound_keys = {
                "type", "author", "recipient", "content",
                "internal_chat_message_metadata_passthrough",
            }
            outbound_keys = {"type", "message", "phase", "memory_citation"}
            if frozenset(payload) not in {
                frozenset(inbound_keys),
                frozenset(outbound_keys),
            }:
                issues.append(f"agent_message payload schema is not closed at line {index}")
            metadata = payload.get("internal_chat_message_metadata_passthrough")
            if isinstance(metadata, dict) and isinstance(metadata.get("turn_id"), str):
                response_turns.append((index, metadata["turn_id"]))
            continue
        if payload_type in {"custom_tool_call", "custom_tool_call_output"}:
            # The dedicated custom-tool rule records the disqualification.
            if set(payload) - response_payload_keys[payload_type]:
                issues.append(
                    f"custom-tool payload schema is not closed at line {index}"
                )
            continue
        if payload_type == "function_call":
            try:
                arguments = strict_json_loads(payload.get("arguments", ""))
            except Exception:
                arguments = None
            metadata = payload.get("internal_chat_message_metadata_passthrough")
            call_id = payload.get("call_id")
            turn_id = metadata.get("turn_id") if isinstance(metadata, dict) else None
            if (
                set(payload)
                != {
                    "type",
                    "id",
                    "call_id",
                    "namespace",
                    "name",
                    "arguments",
                    "internal_chat_message_metadata_passthrough",
                }
                or payload.get("namespace") != "collaboration"
                or payload.get("name") != "send_message"
                or not isinstance(call_id, str)
                or not call_id
                or call_id in calls
                or not isinstance(turn_id, str)
                or not turn_id
                or not isinstance(arguments, dict)
                or set(arguments) != {"target", "message"}
                or arguments.get("target") != "/root"
                or not isinstance(arguments.get("message"), str)
                or not arguments["message"].startswith("gAAAAA")
            ):
                issues.append(f"function_call is not the sealed root metadata send at line {index}")
            else:
                calls[call_id] = (index, turn_id)
            continue
        if payload_type == "function_call_output":
            metadata = payload.get("internal_chat_message_metadata_passthrough")
            call_id = payload.get("call_id")
            turn_id = metadata.get("turn_id") if isinstance(metadata, dict) else None
            if (
                set(payload)
                != {
                    "type",
                    "call_id",
                    "output",
                    "internal_chat_message_metadata_passthrough",
                }
                or not isinstance(call_id, str)
                or not call_id
                or call_id in outputs
                or payload.get("output") != ""
                or not isinstance(turn_id, str)
                or not turn_id
            ):
                issues.append(f"function_call_output is not a sealed empty receipt at line {index}")
            else:
                outputs[call_id] = (index, turn_id)
            continue
        issues.append(
            f"unknown or actionable response_item payload at line {index}: {payload_type!r}"
        )
    if set(calls) != set(outputs):
        issues.append("sealed root metadata function calls and outputs are not one-to-one")
    authorized_turn = (
        turn_context_rows[0][1].get("turn_id")
        if len(turn_context_rows) == 1
        else None
    )
    for call_id in sorted(set(calls) & set(outputs)):
        call_line, call_turn = calls[call_id]
        output_line, output_turn = outputs[call_id]
        if (
            output_line <= call_line
            or output_turn != call_turn
            or call_turn != authorized_turn
        ):
            issues.append("sealed root metadata output chronology or turn binding is invalid")
    for line_number, response_turn in response_turns:
        if response_turn != authorized_turn:
            issues.append(
                f"response metadata is bound to a different turn at line {line_number}"
            )
    if len(session_meta_lines) != 1 or session_meta_lines[0] != 1:
        issues.append("native session must contain exactly one first session_meta row")
    if len(turn_context_rows) != 1:
        issues.append("native session must contain exactly one turn_context row")
    for outer_type in ("world_state", "inter_agent_communication_metadata"):
        if len(singleton_rows.get(outer_type, [])) != 1:
            issues.append(f"native session must contain exactly one {outer_type} row")
    if (
        len(task_started_rows) != 1
        or task_started_rows[0][1].get("turn_id") != authorized_turn
    ):
        issues.append("native session task_started is not bound to the sole turn")
    if (
        len(task_complete_rows) != 1
        or task_complete_rows[0][0] != len(rows)
        or task_complete_rows[0][1].get("turn_id") != authorized_turn
    ):
        issues.append("native session task_complete is not the sole terminal turn event")
    return issues


def strict_session_state_issues(
    rows: list[dict[str, Any]],
    result_bytes: bytes,
) -> list[str]:
    """Enforce the one-shot session chronology as one explicit state machine."""
    issues: list[str] = []

    def payload_at(index: int) -> dict[str, Any]:
        payload = rows[index - 1].get("payload")
        return payload if isinstance(payload, dict) else {}

    session_meta = [
        index for index, row in enumerate(rows, 1) if row.get("type") == "session_meta"
    ]
    task_started = [
        index
        for index, row in enumerate(rows, 1)
        if row.get("type") == "event_msg"
        and payload_at(index).get("type") == "task_started"
    ]
    developer_messages = [
        index
        for index, row in enumerate(rows, 1)
        if row.get("type") == "response_item"
        and payload_at(index).get("type") == "message"
        and payload_at(index).get("role") == "developer"
    ]
    user_messages = [
        index
        for index, row in enumerate(rows, 1)
        if row.get("type") == "response_item"
        and payload_at(index).get("type") == "message"
        and payload_at(index).get("role") == "user"
    ]
    world_states = [
        index for index, row in enumerate(rows, 1) if row.get("type") == "world_state"
    ]
    turn_contexts = [
        index for index, row in enumerate(rows, 1) if row.get("type") == "turn_context"
    ]
    inter_agent_metadata = [
        index
        for index, row in enumerate(rows, 1)
        if row.get("type") == "inter_agent_communication_metadata"
    ]
    inbound_new_tasks = [
        index
        for index, row in enumerate(rows, 1)
        if row.get("type") == "response_item"
        and payload_at(index).get("type") == "agent_message"
        and "author" in payload_at(index)
    ]
    assistant_messages = [
        index
        for index, row in enumerate(rows, 1)
        if row.get("type") == "response_item"
        and payload_at(index).get("type") == "message"
        and payload_at(index).get("role") == "assistant"
    ]
    terminal_events = [
        index
        for index, row in enumerate(rows, 1)
        if row.get("type") == "event_msg"
        and payload_at(index).get("type") == "agent_message"
    ]
    task_completes = [
        index
        for index, row in enumerate(rows, 1)
        if row.get("type") == "event_msg"
        and payload_at(index).get("type") == "task_complete"
    ]
    cardinalities = (
        len(session_meta), len(task_started), len(user_messages), len(world_states),
        len(turn_contexts), len(inter_agent_metadata), len(inbound_new_tasks),
        len(assistant_messages), len(terminal_events), len(task_completes),
    )
    if cardinalities != (1, 1, 1, 1, 1, 1, 1, 1, 1, 1):
        return [
            "native session state-machine cardinality mismatch: "
            f"{cardinalities}"
        ]

    meta_line = session_meta[0]
    start_line = task_started[0]
    user_line = user_messages[0]
    world_line = world_states[0]
    turn_line = turn_contexts[0]
    iac_line = inter_agent_metadata[0]
    delivery_line = inbound_new_tasks[0]
    event_line = terminal_events[0]
    assistant_line = assistant_messages[0]
    complete_line = task_completes[0]
    if not (
        meta_line == 1
        and start_line == 2
        and start_line < user_line < world_line < turn_line < iac_line < delivery_line
        and delivery_line < event_line
        and event_line + 1 == assistant_line
        and assistant_line < complete_line == len(rows)
        and all(start_line < line < user_line for line in developer_messages)
    ):
        issues.append("native session setup/output chronology violates the sealed state machine")

    setup_lines = {
        meta_line, start_line, user_line, world_line, turn_line, iac_line,
        delivery_line, *developer_messages,
    }
    if setup_lines != set(range(1, delivery_line + 1)):
        issues.append("native session contains a non-setup event before NEW_TASK")

    allowed_work_events = {
        ("event_msg", "agent_reasoning"),
        ("event_msg", "token_count"),
        ("response_item", "reasoning"),
        ("response_item", "function_call"),
        ("response_item", "function_call_output"),
        ("response_item", "custom_tool_call"),
        ("response_item", "custom_tool_call_output"),
    }
    for index in range(delivery_line + 1, event_line):
        row = rows[index - 1]
        relation = (row.get("type"), payload_at(index).get("type"))
        if relation not in allowed_work_events:
            issues.append(f"native session work-state event is not allowed at line {index}")

    allowed_after_output = {
        ("event_msg", "agent_reasoning"),
        ("event_msg", "token_count"),
        ("response_item", "reasoning"),
    }
    for index in range(assistant_line + 1, complete_line):
        row = rows[index - 1]
        relation = (row.get("type"), payload_at(index).get("type"))
        if relation not in allowed_after_output:
            issues.append(f"native session emitted action/output after final response at line {index}")

    event_payload = payload_at(event_line)
    assistant_payload = payload_at(assistant_line)
    complete_payload = payload_at(complete_line)
    assistant_content = assistant_payload.get("content")
    assistant_text = (
        assistant_content[0].get("text")
        if isinstance(assistant_content, list)
        and len(assistant_content) == 1
        and isinstance(assistant_content[0], dict)
        and assistant_content[0].get("type") == "output_text"
        else None
    )
    event_text = event_payload.get("message")
    completion_text = complete_payload.get("last_agent_message")
    if (
        event_payload.get("phase") != "final_answer"
        or assistant_payload.get("phase") != "final_answer"
        or not isinstance(event_text, str)
        or not isinstance(assistant_text, str)
        or not isinstance(completion_text, str)
        or event_text != assistant_text
        or assistant_text != completion_text
        or strict_utf8_bytes(completion_text) != result_bytes
    ):
        issues.append(
            "terminal event, assistant response, task_complete, and raw result are not identical"
        )
    return sorted(set(issues))


def strict_native_session_proof(
    session_id: str,
    session_row: dict[str, Any],
    session_path: Path,
    record: dict[str, Any],
    assignment: dict[str, Any],
    result_bytes: bytes,
    runner_thread_id: str,
) -> tuple[list[str], dict[str, Any]]:
    issues: list[str] = []
    count = session_row.get("prefix_bytes")
    raw_bytes, closure_issues = strict_read_closed_native_session(
        session_path, session_row
    )
    if closure_issues or raw_bytes is None:
        return closure_issues, {}
    try:
        lines = raw_bytes.decode("utf-8").splitlines()
        if any(not line.strip() for line in lines):
            raise ValueError("blank physical transcript row")
        rows = [strict_json_loads(line) for line in lines]
    except Exception as exc:
        return [f"native session prefix is invalid: {type(exc).__name__}"], {}
    if not rows or any(not isinstance(row, dict) for row in rows):
        issues.append("native session contains a non-object row")
        return issues, {}
    user_messages = [
        row
        for row in rows
        if row.get("type") == "response_item"
        and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") == "message"
        and row["payload"].get("role") == "user"
    ]
    if len(user_messages) != 1:
        issues.append("native session does not contain exactly one user assignment message")
    issues.extend(strict_agent_message_issues(rows, record.get("agent_path")))
    issues.extend(strict_transcript_event_issues(rows))
    issues.extend(strict_session_state_issues(rows, result_bytes))
    issues.extend(strict_custom_tool_issues(rows))
    meta = rows[0]
    payload = meta.get("payload") if isinstance(meta, dict) else None
    if (
        meta.get("type") != "session_meta"
        or not isinstance(payload, dict)
        or payload.get("id") != session_id
        or payload.get("session_id") != runner_thread_id
        or payload.get("parent_thread_id") != runner_thread_id
        or payload.get("agent_path") != record.get("agent_path")
        or session_row.get("runner_id") != assignment.get("runner_id")
        or session_row.get("parent_thread_id") != runner_thread_id
        or session_row.get("agent_path") != record.get("agent_path")
    ):
        issues.append("native session metadata does not bind the attempt")
    stored_thread = record.get("agent_thread_id")
    if stored_thread != session_id:
        issues.append("stored agent_thread_id does not bind the native session")
    turn_rows = [
        (index, row)
        for index, row in enumerate(rows, 1)
        if row.get("type") == "turn_context"
    ]
    if len(turn_rows) != 1:
        issues.append("native session does not contain exactly one turn_context")
    else:
        turn_payload = turn_rows[0][1].get("payload")
        if (
            not isinstance(turn_payload, dict)
            or turn_payload.get("model") != assignment.get("required_model")
            or turn_payload.get("effort") != assignment.get("required_reasoning_effort")
        ):
            issues.append("native session model or reasoning effort mismatch")
    completion_rows = [
        (index, row)
        for index, row in enumerate(rows, 1)
        if row.get("type") == "event_msg"
        and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") == "task_complete"
    ]
    if len(completion_rows) != 1:
        issues.append("native session does not contain exactly one task_complete")
    else:
        completion_index, completion = completion_rows[0]
        if completion_index != len(rows):
            issues.append("native session contains output after task_complete")
        last_message = completion["payload"].get("last_agent_message")
        if (
            not isinstance(last_message, str)
            or strict_utf8_bytes(last_message) != result_bytes
        ):
            issues.append("native session terminal output does not match raw result bytes")
    if assignment.get("assignment_id", "").encode("utf-8") not in raw_bytes:
        issues.append("native session does not contain the assigned assignment_id")
    proof = {
        "session_id": session_id,
        "session_prefix_bytes": count,
        "session_prefix_sha256": session_row.get("prefix_sha256"),
        "runner_id": session_row.get("runner_id"),
        "parent_thread_id": session_row.get("parent_thread_id"),
        "agent_path": session_row.get("agent_path"),
        "turn_context_line": turn_rows[0][0] if len(turn_rows) == 1 else None,
        "task_complete_line": completion_rows[0][0] if len(completion_rows) == 1 else None,
    }
    return issues, proof


def strict_full_key(record: dict[str, Any]) -> tuple[str, str, str, str, str] | None:
    assignment_id = record.get("assignment_id")
    attempt, problems = strict_attempt(record)
    identity = strict_identity(record)
    if not isinstance(assignment_id, str) or not assignment_id or problems or identity is None:
        return None
    return assignment_id, attempt, *identity


def strict_base_key(record: dict[str, Any]) -> tuple[str, str, str, str] | None:
    assignment_id = record.get("assignment_id")
    attempt, problems = strict_attempt(record)
    instance = record.get("agent_instance_id")
    path = record.get("agent_path")
    if (
        not isinstance(assignment_id, str)
        or not assignment_id
        or problems
        or not isinstance(instance, str)
        or not instance.strip()
        or not isinstance(path, str)
        or not path.strip()
    ):
        return None
    return assignment_id, attempt, instance, path


def strict_canonical(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def strict_values(rows: list[dict[str, Any]], *names: str) -> list[Any]:
    values: dict[str, Any] = {}
    for row in rows:
        for name in names:
            if name in row and row[name] is not None:
                values.setdefault(strict_canonical(row[name]), row[name])
    return list(values.values())


def strict_unique_value(rows: list[dict[str, Any]], *names: str) -> tuple[Any, list[str]]:
    values = strict_values(rows, *names)
    if not values:
        return None, []
    if len(values) > 1:
        return None, [f"conflicting {'/'.join(names)} values"]
    return values[0], []


def strict_claims_positive(record: dict[str, Any]) -> bool:
    credit_values = [
        record[name]
        for name in ("coverage_credit", "valid_coverage", "coverage_count")
        if name in record
    ]
    if credit_values and all(
        value is True
        or (isinstance(value, int) and not isinstance(value, bool) and value == 1)
        for value in credit_values
    ):
        return True
    if any(record.get(name) is True for name in (
        "validation_passed", "valid", "valid_coverage", "schema_validation_passed",
        "dispatch_validation_passed", "exact_evidence_validation_passed",
        "scope_validation_passed",
    )):
        return True
    return any(
        str(record.get(name, "")).lower() in POSITIVE_STATUSES
        for name in (
            "validation_status", "status", "result_status", "state",
            "attempt_state", "attempt_status",
        )
    )


def strict_claims_negative(record: dict[str, Any]) -> bool:
    credit_values = [
        record[name]
        for name in ("coverage_credit", "valid_coverage", "coverage_count")
        if name in record
    ]
    if any(
        value is False
        or (isinstance(value, int) and not isinstance(value, bool) and value != 1)
        or (value is not True and not isinstance(value, int))
        for value in credit_values
    ):
        return True
    if any(
        name in record and record.get(name) is False
        for name in (
            "validation_passed",
            "passed",
            "valid",
            "valid_coverage",
            "schema_validation_passed",
            "dispatch_validation_passed",
            "exact_evidence_validation_passed",
            "scope_validation_passed",
        )
    ):
        return True
    return any(
        any(marker in str(record.get(name, "")).lower() for marker in (
            "fail", "invalid", "reject", "quarant", "revok", "error"
        ))
        for name in (
            "validation_status", "status", "result_status", "state",
            "attempt_state", "attempt_status",
        )
    )


def strict_terminal_negative(record: dict[str, Any]) -> bool:
    """Identify terminal zero-credit registry events without vetoing live dispatch rows."""
    if record.get("zero_coverage") is True:
        return True
    false_flag = any(
        name in record and record.get(name) is False
        for name in (
            "validation_passed",
            "passed",
            "valid",
            "valid_coverage",
            "schema_validation_passed",
            "dispatch_validation_passed",
            "exact_evidence_validation_passed",
            "scope_validation_passed",
        )
    )
    statuses = [
        str(record.get(name, "")).lower()
        for name in (
            "validation_status",
            "status",
            "result_status",
            "state",
            "attempt_state",
            "attempt_status",
        )
        if record.get(name) is not None
    ]
    if any(
        any(
            marker in value
            for marker in ("fail", "invalid", "reject", "quarant", "revok", "error")
        )
        for value in statuses
    ):
        return True
    credit_values = [
        record[name]
        for name in ("coverage_credit", "valid_coverage", "coverage_count")
        if name in record
    ]
    explicit_zero = any(
        value is False
        or (isinstance(value, int) and not isinstance(value, bool) and value == 0)
        for value in credit_values
    )
    result_ref = first(record, "result_ref", "raw_result_ref", "bad_capture_ref")
    failure_evidence = any(
        record.get(name) not in (None, "", [])
        for name in (
            "validation_failure_code",
            "failure_reason",
            "failure_validation_ref",
            "bad_capture_validation_ref",
            "error",
            "errors",
        )
    ) or (
        isinstance(result_ref, str)
        and "/failed_attempts/" in result_ref.replace("\\", "/")
    )
    return (false_flag or explicit_zero) and failure_evidence


def strict_positive_issues(record: dict[str, Any], *, registry: bool) -> list[str]:
    issues: list[str] = []
    credit_values = [
        record[name]
        for name in ("coverage_credit", "valid_coverage", "coverage_count")
        if name in record
    ]
    if not credit_values or any(
        not (
            value is True
            or (isinstance(value, int) and not isinstance(value, bool) and value == 1)
        )
        for value in credit_values
    ):
        issues.append("coverage credit is not exactly one")
    validation_positive = False
    for name in (
        "validation_passed",
        "passed",
        "valid",
        "valid_coverage",
        "schema_validation_passed",
        "dispatch_validation_passed",
        "exact_evidence_validation_passed",
        "scope_validation_passed",
        "schema_validation",
        "hash_validation",
        "range_validation",
    ):
        if record.get(name) is True:
            validation_positive = True
        elif record.get(name) is False:
            issues.append(f"{name} is false")
    if record.get("zero_coverage") is True:
        issues.append("zero_coverage is true")
    for name in ("errors", "validation_errors"):
        if name in record and record.get(name) not in (None, []):
            issues.append(f"{name} is not an empty array")
    for name in (
        "validation_status", "status", "result_status", "state",
        "attempt_state", "attempt_status",
    ):
        if name not in record or record[name] is None:
            continue
        lowered = str(record[name]).lower()
        if lowered in NEGATIVE_STATUSES or any(
            marker in lowered
            for marker in ("fail", "invalid", "reject", "quarant", "pending", "revok", "error")
        ):
            issues.append(f"{name} is negative: {record[name]}")
        elif lowered in POSITIVE_STATUSES:
            validation_positive = True
    if not validation_positive:
        issues.append("receipt lacks explicit positive validation")
    return issues


def strict_same_veto(candidate: dict[str, Any], veto: dict[str, Any]) -> bool:
    """Match a veto to one attempt, never to an entire assignment lineage."""
    if candidate.get("assignment_id") != veto.get("assignment_id"):
        return False
    candidate_attempt, candidate_attempt_issues = strict_attempt(candidate)
    veto_attempt, veto_attempt_issues = strict_attempt(veto)
    if not candidate_attempt_issues and not veto_attempt_issues:
        return candidate_attempt == veto_attempt
    for field in IDENTITY_FIELDS:
        if candidate.get(field) and veto.get(field) and candidate[field] == veto[field]:
            return True
    return False


def strict_floor_veto_matches(
    floor: dict[str, Any],
    manifest: dict[str, Any],
    veto: dict[str, Any],
) -> bool:
    """Veto a floor row by assignment+attempt before considering identity."""
    if veto.get("assignment_id") != floor.get("assignment_id"):
        return False
    floor_attempt = strict_normalize_attempt(
        floor.get("attempt") if floor.get("attempt") is not None else manifest.get("attempt")
    )
    veto_attempt, _ = strict_attempt(veto)
    if floor_attempt is not None and veto_attempt is not None:
        return floor_attempt == veto_attempt

    comparisons: list[bool] = []
    for name in ("agent_instance_id", "agent_thread_id", "agent_path"):
        floor_value = floor.get(name) or manifest.get(name)
        veto_value = veto.get(name)
        if floor_value is not None and veto_value is not None:
            comparisons.append(str(floor_value) == str(veto_value))
    floor_hash = canonical_sha256(floor.get("result_sha256"))
    veto_hash = canonical_sha256(hash_field(veto, "result"))
    if floor_hash is not None and veto_hash is not None:
        comparisons.append(floor_hash == veto_hash)
    floor_ref = floor.get("result_ref")
    veto_ref = first(veto, "result_ref", "raw_result_ref")
    if floor_ref is not None and veto_ref is not None:
        comparisons.append(floor_ref == veto_ref)
    return bool(comparisons) and all(comparisons)


def strict_ref_and_hash(record: dict[str, Any], stem: str) -> tuple[Any, Any]:
    return first(record, f"{stem}_ref", f"raw_{stem}_ref"), hash_field(record, stem)


def strict_metadata_issues(
    record: dict[str, Any],
    assignment: dict[str, Any],
    capsule: dict[str, Any],
    runner_thread_id: str,
    all_runner_thread_ids: set[str],
) -> list[str]:
    issues = check_receipt_metadata(record, assignment, capsule, strict_identity=True)
    if record.get("runner_thread_id") != runner_thread_id:
        issues.append("runner_thread_id mismatch")
    if record.get("agent_thread_id") in all_runner_thread_ids:
        issues.append("reviewer agent_thread_id reuses a persistent runner root thread")
    if record.get("actual_model") not in (None, assignment["required_model"]):
        issues.append("actual_model mismatch")
    if record.get("actual_reasoning_effort") not in (
        None,
        assignment["required_reasoning_effort"],
    ):
        issues.append("actual_reasoning_effort mismatch")
    # Self-authored runtime-evidence flags are compatibility metadata only.
    # Independent native session proof is required separately for every
    # candidate and is never inferred from these booleans.
    attempt, attempt_issues = strict_attempt(record)
    issues.extend(attempt_issues)
    if attempt is None:
        issues.append("attempt is not canonical")
    return issues


def strict_raw_issues(
    raw: dict[str, Any],
    assignment: dict[str, Any],
    capsule: dict[str, Any],
    full_key: tuple[str, str, str, str, str],
    source_lines: list[str],
) -> list[str]:
    issues: list[str] = []
    _, _, instance, path, thread = full_key
    if raw.get("assignment_id") != assignment["assignment_id"]:
        issues.append("raw result assignment_id mismatch")
    # The globally sealed capsule contract requires the five output arrays and
    # assignment binding.  Several runner-local prompts added more top-level
    # metadata, so those fields are verified whenever emitted without treating
    # their historical absence as retroactive schema failure.
    optional_identity = {
        "runner_id": assignment["runner_id"],
        "agent_instance_id": instance,
        "agent_path": path,
        "model": assignment["required_model"],
        "reasoning_effort": assignment["required_reasoning_effort"],
        "role": assignment["role"],
        "window_id": assignment["window_id"],
        "doc_id": assignment["doc_id"],
        "document_path": assignment["document_path"],
        "core_range": assignment["core_range"],
        "terminal_after_result": True,
    }
    for name, wanted in optional_identity.items():
        if name in raw and raw[name] != wanted:
            issues.append(f"raw result {name} mismatch")
    if "status" in raw:
        raw_status = str(raw["status"]).lower()
        if raw_status in NEGATIVE_STATUSES or any(
            marker in raw_status for marker in ("fail", "invalid", "reject", "quarant", "error")
        ):
            issues.append("raw result status is explicitly negative")
    if raw.get("audit_id") not in (None, AUDIT_ID):
        issues.append("raw result audit_id mismatch")
    if raw.get("agent_thread_id") not in (None, thread):
        issues.append("raw result agent_thread_id mismatch")
    if "scope_confirmation" in raw and raw.get("scope_confirmation") != SCOPE_CONFIRMATION:
        issues.append("raw result scope_confirmation mismatch")
    scope_attestation = raw.get("scope_attestation")
    if scope_attestation is not None:
        if not isinstance(scope_attestation, dict) or any(
            name in scope_attestation and scope_attestation.get(name) is not True
            for name in SCOPE_TRUE_IF_PRESENT
        ) or any(
            name in scope_attestation and scope_attestation.get(name) is not False
            for name in SCOPE_FALSE_IF_PRESENT
        ):
            issues.append("raw result scope_attestation contradicts blind capsule use")
    reviewer_declaration = raw.get("reviewer_declaration")
    if reviewer_declaration is not None:
        if not isinstance(reviewer_declaration, dict) or (
            any(
                name in reviewer_declaration and reviewer_declaration.get(name) is not True
                for name in SCOPE_TRUE_IF_PRESENT
            )
        ) or any(
            name in reviewer_declaration and reviewer_declaration.get(name) is not False
            for name in SCOPE_FALSE_IF_PRESENT
        ):
            issues.append("raw result reviewer_declaration contradicts blind capsule use")
    optional_expected = {
        "capsule_ref": assignment["capsule_ref"],
        "capsule_bytes": assignment["capsule_bytes"],
        "source_excerpt_ref": assignment["source_excerpt_ref"],
        "source_excerpt_bytes": assignment["source_excerpt_bytes"],
        "source_sha256": assignment["source_sha256"],
        "context_ranges": capsule.get("context_ranges", []),
    }
    for name, wanted in optional_expected.items():
        if name in raw and raw[name] != wanted:
            issues.append(f"raw result {name} mismatch")
    for stem, wanted in (
        ("capsule", assignment["capsule_sha256"]),
        ("source_excerpt", assignment["source_excerpt_sha256"]),
        ("source", assignment["source_sha256"]),
    ):
        observed_values = strict_values(
            [raw],
            f"{stem}_sha256",
            f"{stem}_hash",
            f"raw_{stem}_sha256",
            f"raw_{stem}_hash",
        )
        if len(observed_values) > 1:
            issues.append(f"raw result {stem} hash aliases conflict")
            continue
        observed = observed_values[0] if observed_values else None
        if observed is not None and observed != wanted:
            issues.append(f"raw result {stem} hash mismatch")

    for name in REQUIRED_OUTPUT_LISTS:
        if not isinstance(raw.get(name), list):
            issues.append(f"raw result {name} must be an array")
    exact_refs = raw.get("exact_evidence_refs")
    if not isinstance(exact_refs, list):
        return issues
    if not exact_refs:
        issues.append("raw result lacks required exact evidence")
    evidence_ids: set[str] = set()
    for index, value in enumerate(exact_refs):
        if not isinstance(value, dict):
            issues.append(f"exact_evidence_refs[{index}] is not an object")
            continue
        evidence_id = first(value, "evidence_id", "evidence_ref_id", "id", "ref_id")
        if evidence_id is not None:
            if not isinstance(evidence_id, str) or not evidence_id:
                issues.append(f"exact_evidence_refs[{index}] evidence_id invalid")
            elif evidence_id in evidence_ids:
                issues.append(f"duplicate evidence_id: {evidence_id}")
            else:
                evidence_ids.add(evidence_id)
        for problem in evidence_issues(
            value, assignment, capsule, source_lines, require_quote=True
        ):
            issues.append(f"exact_evidence_refs[{index}]: {problem}")

    for list_name in (
        "observations",
        "candidate_findings",
        "explicit_non_gaps",
        "unknowns",
    ):
        values = raw.get(list_name)
        if not isinstance(values, list):
            continue
        for index, item in enumerate(values):
            if not isinstance(item, dict):
                issues.append(f"{list_name}[{index}] is not an object")
                continue
            refs = first(item, "evidence_ref_ids", "evidence_ids", "evidence_refs")
            if refs is None:
                continue
            if not isinstance(refs, list):
                issues.append(f"{list_name}[{index}] evidence references are not an array")
            elif all(isinstance(ref, str) for ref in refs):
                if any(ref not in evidence_ids for ref in refs):
                    issues.append(f"{list_name}[{index}] cites unknown evidence")
            elif all(isinstance(ref, dict) for ref in refs):
                for ref_index, ref in enumerate(refs):
                    for problem in evidence_issues(
                        ref, assignment, capsule, source_lines, require_quote=True
                    ):
                        issues.append(
                            f"{list_name}[{index}] evidence_refs[{ref_index}]: {problem}"
                        )
            else:
                issues.append(f"{list_name}[{index}] mixes invalid evidence reference types")
    return issues


def strict_validation_issues(
    validation: dict[str, Any],
    assignment: dict[str, Any],
    attempt: str,
    result_ref: str,
    result_hash: str,
    result_bytes: int,
) -> list[str]:
    issues: list[str] = []
    if validation.get("assignment_id") != assignment["assignment_id"]:
        issues.append("validation receipt assignment_id mismatch")
    validation_result_refs = strict_values(validation and [validation] or [], "result_ref", "raw_result_ref")
    validation_result_hashes = strict_values(
        validation and [validation] or [],
        "result_sha256",
        "raw_result_sha256",
        "result_hash",
        "raw_result_hash",
    )
    if len(validation_result_refs) != 1 or validation_result_refs[0] != result_ref:
        issues.append("validation receipt result_ref mismatch")
    if len(validation_result_refs) > 1:
        issues.append("validation receipt result_ref aliases conflict")
    if len(validation_result_hashes) != 1 or validation_result_hashes[0] != result_hash:
        issues.append("validation receipt result_sha256 mismatch")
    if len(validation_result_hashes) > 1:
        issues.append("validation receipt result hash aliases conflict")
    if validation.get("audit_id") not in (None, AUDIT_ID):
        issues.append("validation receipt audit_id mismatch")
    if validation.get("runner_id") not in (None, assignment["runner_id"]):
        issues.append("validation receipt runner_id mismatch")
    if validation.get("result_bytes") not in (None, result_bytes):
        issues.append("validation receipt result_bytes mismatch")
    observed_attempt, attempt_issues = strict_attempt(validation)
    if attempt_issues or observed_attempt != attempt:
        issues.append("validation receipt attempt mismatch")
    for name in ("errors", "validation_errors"):
        if isinstance(validation.get(name), list) and validation[name]:
            issues.append(f"validation receipt {name} is not empty")
    if validation.get("coverage_credit") not in (None, 1, True):
        issues.append("validation receipt coverage_credit is not one")
    validation_positive = False
    for name in (
        "validation_passed", "passed", "valid", "valid_coverage", "schema_validation_passed",
        "dispatch_validation_passed", "exact_evidence_validation_passed",
        "scope_validation_passed", "schema_validation", "hash_validation",
        "range_validation",
    ):
        if validation.get(name) is True:
            validation_positive = True
        elif validation.get(name) is False:
            issues.append(f"validation receipt {name} is false")
    status_values = [
        str(validation[name]).lower()
        for name in ("status", "validation_status", "state")
        if validation.get(name) is not None
    ]
    if status_values and any(
        value in NEGATIVE_STATUSES
        or any(marker in value for marker in ("fail", "invalid", "reject", "quarant"))
        for value in status_values
    ):
        issues.append("validation receipt status is negative")
    if any(value in POSITIVE_STATUSES for value in status_values):
        validation_positive = True
    if validation.get("errors") not in (None, []):
        issues.append("validation receipt errors are not empty")
    checks = validation.get("checks")
    if isinstance(checks, dict) and any(
        str(value).lower() not in {"pass", "passed", "true"} and value is not True
        for value in checks.values()
    ):
        issues.append("validation receipt contains a failed check")
    if not validation_positive:
        issues.append("validation receipt lacks explicit positive validation")
    return issues


def strict_digest(values: set[str] | list[str]) -> str:
    ordered = sorted(values)
    return hashlib.sha256(
        ("\n".join(ordered) + ("\n" if ordered else "")).encode("utf-8")
    ).hexdigest()


def strict_load_runner_jsonl(
    path: Path,
    byte_limit: int | None = None,
    expected_sha256: str | None = None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Load append-only runner JSONL while retaining malformed-line evidence."""
    rows: list[dict[str, Any]] = []
    malformed: list[dict[str, Any]] = []
    if not path.is_file():
        if byte_limit == 0:
            return rows, malformed
        return rows, malformed
    try:
        if byte_limit is None:
            anchored_prefix = path.read_bytes()
        else:
            with path.open("rb") as handle:
                anchored_prefix = handle.read(byte_limit)
            if len(anchored_prefix) != byte_limit:
                raise ValueError("file is shorter than checkpoint prefix")
        if (
            expected_sha256 is not None
            and hashlib.sha256(anchored_prefix).hexdigest() != expected_sha256
        ):
            raise ValueError("anchored bytes do not match checkpoint prefix hash")
        text = anchored_prefix.decode("utf-8")
    except Exception as exc:
        digest = hashlib.sha256(locals().get("anchored_prefix", b"")).hexdigest()
        return rows, [
            {
                "source_receipt": f"{path.relative_to(ROOT)}:file",
                "line_sha256": digest,
                "error": f"{type(exc).__name__}: {exc}",
            }
        ]
    for line_no, line in enumerate(text.splitlines(), 1):
        if not line.strip():
            continue
        try:
            value = strict_json_loads(line)
        except Exception as exc:
            malformed.append(
                {
                    "source_receipt": f"{path.relative_to(ROOT)}:{line_no}",
                    "line_sha256": hashlib.sha256(line.encode("utf-8")).hexdigest(),
                    "error": f"{type(exc).__name__}: {exc}",
                }
            )
            continue
        if not isinstance(value, dict):
            malformed.append(
                {
                    "source_receipt": f"{path.relative_to(ROOT)}:{line_no}",
                    "line_sha256": hashlib.sha256(line.encode("utf-8")).hexdigest(),
                    "error": "row is not a JSON object",
                }
            )
            continue
        value["_receipt_file"] = str(path.relative_to(ROOT))
        value["_receipt_line"] = line_no
        value["_receipt_line_sha256"] = hashlib.sha256(
            line.encode("utf-8")
        ).hexdigest()
        rows.append(value)
    return rows, malformed


def strict_stream_inventory_digest(rows: list[dict[str, Any]]) -> str:
    rendered = b"".join(
        (
            json.dumps(row, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
            + "\n"
        ).encode("utf-8")
        for row in sorted(rows, key=lambda item: str(item.get("ref")))
    )
    return hashlib.sha256(rendered).hexdigest()


def strict_checkpoint_streams(
    checkpoint_path: Path,
    lineage_anchor: dict[str, Any],
    errors: list[str],
    seen_checkpoint_paths: set[Path] | None = None,
    expected_checkpoint_sha256: str | None = None,
) -> tuple[
    dict[str, dict[str, Any]],
    dict[str, dict[str, Any]],
    dict[str, Path],
    dict[str, dict[str, Any]],
    dict[str, Any],
]:
    checkpoint_path = checkpoint_path.resolve()
    seen_checkpoint_paths = set() if seen_checkpoint_paths is None else seen_checkpoint_paths
    if checkpoint_path in seen_checkpoint_paths:
        errors.append("lineage checkpoint parent chain contains a cycle")
        return {}, {}, {}, {}, {}
    seen_checkpoint_paths.add(checkpoint_path)
    local_errors: list[str] = []
    checkpoint_start_hash = expected_checkpoint_sha256 or ""
    checkpoint = load_json_bound(checkpoint_path, checkpoint_start_hash, local_errors)
    errors.extend(local_errors)
    if not isinstance(checkpoint, dict):
        errors.append("lineage checkpoint is not an object")
        return {}, {}, {}, {}, {}
    if checkpoint.get("schema") != "audit004.lineage_checkpoint.v1":
        errors.append("lineage checkpoint schema mismatch")
    if checkpoint.get("audit_id") != AUDIT_ID:
        errors.append("lineage checkpoint audit mismatch")
    if checkpoint.get("captured_by_thread_id") != "019f4a04-5fe1-71f3-b992-e599aad3da5b":
        errors.append("lineage checkpoint writer identity mismatch")
    sequence = checkpoint.get("sequence")
    if canonical_nonnegative_int(sequence) is None:
        errors.append("lineage checkpoint sequence is invalid")
    parent = checkpoint.get("parent")
    if sequence == 0:
        if checkpoint_start_hash != BOOTSTRAP_CHECKPOINT_SHA256:
            errors.append("checkpoint zero is not the authority-pinned V3 bootstrap checkpoint")
        if parent != {
            "kind": "sealed_initial_anchor",
            "ref": IMMUTABLE_ANCHORS["initial_failure_lineage"][0],
            "sha256": IMMUTABLE_ANCHORS["initial_failure_lineage"][1],
        }:
            errors.append("checkpoint zero parent does not match the sealed initial anchor")
    elif not isinstance(parent, dict) or parent.get("kind") != "checkpoint":
        errors.append("later lineage checkpoint parent is invalid")
    if not isinstance(checkpoint.get("checkpoint_id"), str) or not checkpoint.get("checkpoint_id"):
        errors.append("lineage checkpoint_id is missing")
    if not isinstance(checkpoint.get("captured_at"), str) or not checkpoint.get("captured_at"):
        errors.append("lineage checkpoint captured_at is missing")
    rows = checkpoint.get("streams")
    if not isinstance(rows, list) or not rows:
        errors.append("lineage checkpoint has no stream inventory")
        return {}, {}, {}, {}, checkpoint
    clean_rows: list[dict[str, Any]] = []
    streams: dict[str, dict[str, Any]] = {}
    empty_sha = hashlib.sha256(b"").hexdigest()
    for row in rows:
        if not isinstance(row, dict):
            errors.append("lineage checkpoint contains a non-object stream row")
            continue
        clean_rows.append(row)
        ref = row.get("ref")
        if (
            not isinstance(ref, str)
            or not ref
            or ref != str(PurePosixPath(ref))
            or PurePosixPath(ref).is_absolute()
            or ".." in PurePosixPath(ref).parts
            or ref in streams
        ):
            errors.append("lineage checkpoint contains a duplicate or unsafe stream ref")
            continue
        if not (
            re.fullmatch(r"runners/runner-\d{2}/.+\.jsonl", ref)
            or ref == "coordination/QUARANTINE_REGISTRY.jsonl"
        ):
            errors.append(f"lineage checkpoint stream is out of scope: {ref}")
            continue
        state = row.get("state")
        count = row.get("prefix_bytes")
        wanted = canonical_sha256(row.get("prefix_sha256"))
        if (
            state not in {"present", "missing"}
            or canonical_nonnegative_int(count) is None
            or wanted is None
            or not isinstance(row.get("semantic_class"), str)
            or not row.get("semantic_class")
        ):
            errors.append(f"lineage checkpoint stream row is malformed: {ref}")
            continue
        if state == "missing" and (count != 0 or wanted != empty_sha):
            errors.append(f"missing lineage stream has nonempty prefix: {ref}")
        if state == "present" and row.get("ends_with_lf") is not True:
            errors.append(f"present lineage stream is not captured at a line boundary: {ref}")
        streams[ref] = row
    if checkpoint.get("stream_inventory_sha256") != strict_stream_inventory_digest(clean_rows):
        errors.append("lineage checkpoint stream inventory digest mismatch")

    expected_runner_ids = {f"runner-{number:02d}" for number in range(1, 13)}
    canonical_refs = {
        f"runners/{runner_id}/{name}"
        for runner_id in expected_runner_ids
        for name in (
            "fresh_agent_assignment_registry.jsonl",
            "result_manifest.jsonl",
            "failed_attempts.jsonl",
            "ingest_errors.jsonl",
        )
    }
    if not canonical_refs.issubset(streams):
        errors.append("lineage checkpoint omits canonical runner stream markers")
    quarantine = streams.get("coordination/QUARANTINE_REGISTRY.jsonl")
    if not isinstance(quarantine, dict) or quarantine.get("state") != "present":
        errors.append("lineage checkpoint omits the present root quarantine stream")

    initial_rows = {
        row.get("ref"): row
        for row in lineage_anchor.get("files", [])
        if isinstance(row, dict) and isinstance(row.get("ref"), str)
    }
    for ref, row in streams.items():
        path = ROOT / ref
        count = row.get("prefix_bytes", 0)
        wanted = row.get("prefix_sha256")
        if row.get("state") == "present":
            try:
                prefix_bytes = (
                    read_prefix_bytes_bound(path, count, wanted)
                    if path.is_file()
                    else None
                )
                actual = (
                    hashlib.sha256(prefix_bytes).hexdigest()
                    if prefix_bytes is not None
                    else None
                )
                if actual != wanted:
                    errors.append(f"lineage checkpoint prefix mismatch: {ref}")
                if count and prefix_bytes is not None and prefix_bytes[-1:] != b"\n":
                    errors.append(f"lineage checkpoint prefix ends mid-line: {ref}")
            except Exception:
                errors.append(f"lineage checkpoint prefix cannot be read: {ref}")
        anchored = initial_rows.get(ref)
        if isinstance(anchored, dict):
            old_count = anchored.get("prefix_bytes")
            old_hash = anchored.get("prefix_sha256")
            if (
                row.get("state") != "present"
                or canonical_nonnegative_int(old_count) is None
                or count < old_count
            ):
                errors.append(f"checkpoint does not extend sealed initial stream: {ref}")
            else:
                try:
                    if sha256_prefix(path, old_count) != old_hash:
                        errors.append(f"checkpoint rewrites sealed initial stream: {ref}")
                except Exception:
                    errors.append(f"checkpoint cannot prove sealed initial stream: {ref}")
    native_rows = checkpoint.get("native_sessions")
    if not isinstance(native_rows, list):
        errors.append("lineage checkpoint native-session inventory is missing")
        native_rows = []
    native_sessions: dict[str, dict[str, Any]] = {}
    clean_native_rows: list[dict[str, Any]] = []
    for row in native_rows:
        if not isinstance(row, dict):
            errors.append("native-session checkpoint row is not an object")
            continue
        clean_native_rows.append(row)
        session_id = row.get("session_id")
        agent_path = row.get("agent_path")
        parent_thread = row.get("parent_thread_id")
        if (
            not isinstance(session_id, str)
            or not session_id
            or session_id in native_sessions
            or not isinstance(agent_path, str)
            or agent_path != agent_path.strip()
            or not agent_path.startswith("/root/")
            or not isinstance(parent_thread, str)
            or not parent_thread
            or canonical_nonnegative_int(row.get("prefix_bytes")) is None
            or canonical_sha256(row.get("prefix_sha256")) is None
            or row.get("ends_with_lf") is not True
            or not isinstance(row.get("runner_id"), str)
            or canonical_nonnegative_int(row.get("introduced_at_sequence")) is None
            or row.get("introduced_at_sequence") > sequence
        ):
            errors.append("native-session checkpoint row is malformed or duplicated")
            continue
        native_sessions[session_id] = row
    rendered = b"".join(
        (
            json.dumps(row, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
            + "\n"
        ).encode("utf-8")
        for row in sorted(clean_native_rows, key=lambda item: str(item.get("session_id")))
    )
    if checkpoint.get("native_session_inventory_sha256") != hashlib.sha256(rendered).hexdigest():
        errors.append("native-session checkpoint inventory digest mismatch")

    native_paths: dict[str, Path] = {}
    sessions_root = Path.home() / ".codex" / "sessions"
    for path in sessions_root.rglob("*.jsonl"):
        if not path.is_file() or path.is_symlink():
            continue
        try:
            with path.open("rb") as handle:
                first_line = handle.readline()
            first_row = strict_json_loads(first_line.decode("utf-8"))
        except Exception:
            continue
        payload = first_row.get("payload") if isinstance(first_row, dict) else None
        session_id = payload.get("id") if isinstance(payload, dict) else None
        if session_id not in native_sessions:
            continue
        if session_id in native_paths:
            errors.append(f"native session id resolves to multiple files: {session_id}")
            continue
        native_paths[session_id] = path
    for session_id, row in native_sessions.items():
        path = native_paths.get(session_id)
        if path is None:
            errors.append(f"checkpointed native session is missing: {session_id}")
            continue
        count = row["prefix_bytes"]
        try:
            raw = read_prefix_bytes_bound(path, count, row["prefix_sha256"])
            first_row = (
                strict_json_loads(raw.splitlines()[0].decode("utf-8"))
                if raw
                else None
            )
        except Exception:
            errors.append(f"checkpointed native session cannot be read: {session_id}")
            continue
        payload = first_row.get("payload") if isinstance(first_row, dict) else None
        source = payload.get("source") if isinstance(payload, dict) else None
        spawn = (
            source.get("subagent", {}).get("thread_spawn", {})
            if isinstance(source, dict)
            else {}
        )
        if (
            first_row.get("type") != "session_meta"
            or not isinstance(payload, dict)
            or payload.get("id") != session_id
            or payload.get("session_id") != row.get("parent_thread_id")
            or payload.get("parent_thread_id") != row.get("parent_thread_id")
            or payload.get("thread_source") != "subagent"
            or payload.get("agent_path") != row.get("agent_path")
            or not isinstance(spawn, dict)
            or spawn.get("parent_thread_id") != row.get("parent_thread_id")
            or spawn.get("agent_path") != row.get("agent_path")
        ):
            errors.append(f"checkpointed native session metadata mismatch: {session_id}")
    artifact_rows = checkpoint.get("runner_artifacts")
    if not isinstance(artifact_rows, list):
        errors.append("lineage checkpoint runner-artifact inventory is missing")
        artifact_rows = []
    runner_artifacts: dict[str, dict[str, Any]] = {}
    clean_artifact_rows: list[dict[str, Any]] = []
    empty_sha = hashlib.sha256(b"").hexdigest()
    for row in artifact_rows:
        if not isinstance(row, dict):
            errors.append("runner-artifact checkpoint row is not an object")
            continue
        clean_artifact_rows.append(row)
        ref = row.get("ref")
        state = row.get("state")
        if (
            not isinstance(ref, str)
            or not re.fullmatch(r"runners/runner-\d{2}/.+", ref)
            or ref != str(PurePosixPath(ref))
            or ".." in PurePosixPath(ref).parts
            or ref in runner_artifacts
            or state not in {"present", "missing"}
            or canonical_nonnegative_int(row.get("bytes")) is None
            or canonical_sha256(row.get("sha256")) is None
            or not isinstance(row.get("semantic_class"), str)
            or not row.get("semantic_class")
        ):
            errors.append("runner-artifact checkpoint row is malformed or duplicated")
            continue
        if state == "present":
            if (
                canonical_nonnegative_int(row.get("introduced_at_sequence")) is None
                or row.get("introduced_at_sequence") > sequence
            ):
                errors.append(f"runner artifact introduction sequence is invalid: {ref}")
        elif (
            row.get("bytes") != 0
            or row.get("sha256") != empty_sha
            or row.get("introduced_at_sequence") is not None
        ):
            errors.append(f"missing runner artifact has nonempty state: {ref}")
        runner_artifacts[ref] = row
    rendered_artifacts = b"".join(
        (
            json.dumps(row, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
            + "\n"
        ).encode("utf-8")
        for row in sorted(clean_artifact_rows, key=lambda item: str(item.get("ref")))
    )
    if checkpoint.get("runner_artifact_inventory_sha256") != hashlib.sha256(
        rendered_artifacts
    ).hexdigest():
        errors.append("runner-artifact checkpoint inventory digest mismatch")
    completion_refs = {
        f"runners/runner-{number:02d}/RUNNER_COMPLETE.json" for number in range(1, 13)
    }
    if not completion_refs.issubset(runner_artifacts):
        errors.append("runner-artifact checkpoint omits completion markers")
    for ref, row in runner_artifacts.items():
        path = ROOT / ref
        if (
            row.get("state") == "present"
            and row.get("semantic_class") != "checkpoint_metadata"
        ):
            if (
                not path.is_file()
                or path.is_symlink()
                or file_bytes(path) != row.get("bytes")
                or sha256(path) != row.get("sha256")
            ):
                errors.append(f"checkpointed runner artifact changed or disappeared: {ref}")

    if isinstance(sequence, int) and not isinstance(sequence, bool) and sequence > 0:
        parent_ref = parent.get("ref") if isinstance(parent, dict) else None
        parent_hash = canonical_sha256(parent.get("sha256")) if isinstance(parent, dict) else None
        parent_sequence = parent.get("sequence") if isinstance(parent, dict) else None
        parent_path = ROOT / parent_ref if isinstance(parent_ref, str) else None
        if (
            parent_path is None
            or not under(parent_path, ROOT / "coordination/lineage_v3")
            or not parent_path.is_file()
            or parent_hash is None
            or sha256(parent_path) != parent_hash
            or parent_sequence != sequence - 1
        ):
            errors.append("lineage checkpoint parent ref/hash/sequence is invalid")
        else:
            (
                parent_streams,
                parent_sessions,
                _,
                parent_artifacts,
                parent_doc,
            ) = strict_checkpoint_streams(
                parent_path,
                lineage_anchor,
                errors,
                seen_checkpoint_paths,
                parent_hash,
            )
            if parent_doc.get("sequence") != sequence - 1:
                errors.append("lineage checkpoint parent document sequence mismatch")
            for ref, old in parent_streams.items():
                current = streams.get(ref)
                if not isinstance(current, dict):
                    errors.append(f"lineage checkpoint drops parent stream: {ref}")
                    continue
                if current.get("semantic_class") != old.get("semantic_class"):
                    errors.append(f"lineage checkpoint changes stream semantic class: {ref}")
                if current.get("introduced_at_sequence") != old.get("introduced_at_sequence"):
                    errors.append(f"lineage checkpoint changes stream introduction sequence: {ref}")
                if old.get("state") == "present":
                    if (
                        current.get("state") != "present"
                        or current.get("prefix_bytes", -1) < old.get("prefix_bytes", 0)
                    ):
                        errors.append(f"lineage checkpoint shrinks or drops parent stream: {ref}")
                    else:
                        try:
                            if sha256_prefix(ROOT / ref, old["prefix_bytes"]) != old.get(
                                "prefix_sha256"
                            ):
                                errors.append(f"lineage checkpoint rewrites parent stream: {ref}")
                        except Exception:
                            errors.append(f"lineage checkpoint cannot prove parent stream: {ref}")
                elif current.get("state") == "present" and current.get(
                    "introduced_at_sequence"
                ) != sequence:
                    errors.append(f"newly present stream has wrong introduction sequence: {ref}")
            for ref, current in streams.items():
                if ref not in parent_streams and current.get("introduced_at_sequence") != sequence:
                    errors.append(f"new stream has wrong introduction sequence: {ref}")
            for session_id, old in parent_sessions.items():
                current = native_sessions.get(session_id)
                if not isinstance(current, dict):
                    errors.append(f"lineage checkpoint drops native session: {session_id}")
                    continue
                for name in ("runner_id", "parent_thread_id", "agent_path", "introduced_at_sequence"):
                    if current.get(name) != old.get(name):
                        errors.append(f"lineage checkpoint changes native session {name}: {session_id}")
                if current.get("prefix_bytes", -1) < old.get("prefix_bytes", 0):
                    errors.append(f"lineage checkpoint shrinks native session: {session_id}")
                else:
                    path = native_paths.get(session_id)
                    try:
                        if path is None or sha256_prefix(path, old["prefix_bytes"]) != old.get(
                            "prefix_sha256"
                        ):
                            errors.append(f"lineage checkpoint rewrites native session: {session_id}")
                    except Exception:
                        errors.append(f"lineage checkpoint cannot prove native session: {session_id}")
            for session_id, current in native_sessions.items():
                if session_id not in parent_sessions and current.get(
                    "introduced_at_sequence"
                ) != sequence:
                    errors.append(
                        f"new native session has wrong introduction sequence: {session_id}"
                    )
            for ref, old in parent_artifacts.items():
                current = runner_artifacts.get(ref)
                if not isinstance(current, dict):
                    errors.append(f"lineage checkpoint drops runner artifact: {ref}")
                    continue
                if current.get("semantic_class") != old.get("semantic_class"):
                    errors.append(f"lineage checkpoint changes runner artifact class: {ref}")
                if old.get("state") == "present":
                    if (
                        current.get("state") != "present"
                        or current.get("bytes") != old.get("bytes")
                        or current.get("sha256") != old.get("sha256")
                        or current.get("introduced_at_sequence")
                        != old.get("introduced_at_sequence")
                    ):
                        errors.append(f"lineage checkpoint changes runner artifact: {ref}")
                elif current.get("state") == "present" and current.get(
                    "introduced_at_sequence"
                ) != sequence:
                    errors.append(f"newly present runner artifact has wrong sequence: {ref}")
            for ref, current in runner_artifacts.items():
                if ref not in parent_artifacts and current.get("introduced_at_sequence") != sequence:
                    errors.append(f"new runner artifact has wrong introduction sequence: {ref}")
    return streams, native_sessions, native_paths, runner_artifacts, checkpoint


def strict_recover_plus_jsonl_row(
    source_receipt: Any,
    prefix_bytes: Any,
    prefix_sha256: Any,
) -> tuple[dict[str, Any] | None, str | None, list[str]]:
    """Recover exactly one leading-plus JSON object and bind its physical runner."""
    issues: list[str] = []
    if not isinstance(source_receipt, str) or ":" not in source_receipt:
        return None, None, ["source receipt is not a runner JSONL line reference"]
    relative_ref, line_token = source_receipt.rsplit(":", 1)
    relative_path = Path(relative_ref)
    if (
        len(relative_path.parts) < 3
        or relative_path.parts[0] != "runners"
        or not re.fullmatch(r"runner-\d{2}", relative_path.parts[1])
        or not relative_ref.endswith(".jsonl")
    ):
        return None, None, ["source receipt is outside a physical runner JSONL namespace"]
    try:
        line_no = int(line_token)
    except (TypeError, ValueError):
        return None, relative_path.parts[1], ["source receipt line number is invalid"]
    path = ROOT / relative_path
    try:
        if canonical_nonnegative_int(prefix_bytes) is None or canonical_sha256(prefix_sha256) is None:
            raise ValueError("checkpoint prefix metadata is invalid")
        with path.open("rb") as handle:
            raw_prefix = handle.read(prefix_bytes)
        if len(raw_prefix) != prefix_bytes:
            raise ValueError("checkpoint prefix is short")
        if hashlib.sha256(raw_prefix).hexdigest() != prefix_sha256:
            raise ValueError("checkpoint prefix hash mismatch")
        lines = raw_prefix.decode("utf-8").splitlines()
    except Exception as exc:
        return None, relative_path.parts[1], [f"source receipt cannot be decoded: {type(exc).__name__}"]
    if line_no < 1 or line_no > len(lines):
        return None, relative_path.parts[1], ["source receipt line is absent"]
    line = lines[line_no - 1]
    if not line.startswith("+") or line.startswith("++"):
        return None, relative_path.parts[1], ["malformed line is not exactly one leading-plus JSON object"]
    try:
        recovered = strict_json_loads(line[1:])
    except Exception as exc:
        return None, relative_path.parts[1], [f"leading-plus payload is not JSON: {type(exc).__name__}"]
    if not isinstance(recovered, dict):
        issues.append("leading-plus payload is not an object")
        return None, relative_path.parts[1], issues
    return recovered, relative_path.parts[1], issues


def strict_manifest_key(
    record: dict[str, Any],
    registry_keys: set[tuple[str, str, str, str, str]],
) -> tuple[tuple[str, str, str, str, str] | None, list[str]]:
    """Resolve a manifest to an explicit registry attempt.

    Historical single-attempt manifests may omit an attempt field.  They are
    accepted only when all three fresh-identity fields resolve to exactly one
    registry attempt that itself has an explicit attempt number.  Missing
    attempts are never synthesized from assignment order or treated as attempt
    one.
    """
    direct = strict_full_key(record)
    if direct is not None:
        return direct, []
    identity = strict_identity(record)
    assignment_id = record.get("assignment_id")
    supplied = [record[name] for name in ATTEMPT_FIELDS if record.get(name) is not None]
    if supplied:
        _, issues = strict_attempt(record)
        return None, issues or ["manifest attempt does not form a full key"]
    if not isinstance(assignment_id, str) or not assignment_id or identity is None:
        return None, ["manifest lacks full fresh identity"]
    matches = {
        key
        for key in registry_keys
        if key[0] == assignment_id and tuple(key[2:]) == identity
    }
    if len(matches) != 1:
        return None, [
            "manifest without attempt does not resolve to exactly one explicit registry attempt"
        ]
    return next(iter(matches)), []


def strict_completion_attempt_records(
    evidence_rows: list[dict[str, Any]],
    expected: dict[str, dict[str, Any]],
) -> dict[str, list[dict[str, Any]]]:
    """Build fail-closed physical-attempt accounting for completion receipts.

    Completion totals cannot be derived only from parseable registry groups:
    failed-only, manifest-only, ingest-error, and root-recovered malformed rows
    are also evidence that an agent was spawned.  Rows sharing a same-field
    identity value for the same assignment/attempt are clustered; distinct
    identity triples remain distinct physical attempts.  An identity-free row
    may join exactly one already recovered assignment/attempt cluster, otherwise
    it remains an opaque cluster that prevents RUNNER_COMPLETE validation.
    """
    candidates_by_runner: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for ordinal, row in enumerate(evidence_rows):
        if row.get("_synthetic_authority_veto") is True:
            continue
        assignment_id = row.get("assignment_id")
        assignment = expected.get(assignment_id) if isinstance(assignment_id, str) else None
        runner_id = row.get("_scan_runner_id") or row.get("runner_id")
        if not isinstance(runner_id, str) or not runner_id:
            runner_id = assignment.get("runner_id") if isinstance(assignment, dict) else None
        if not isinstance(runner_id, str) or not runner_id:
            continue
        attempt, attempt_issues = strict_attempt(row)
        identities = {
            name: str(row.get(name))
            for name in ("agent_instance_id", "agent_path", "agent_thread_id")
            if isinstance(row.get(name), str) and str(row.get(name))
        }
        artifact_values = {
            "result_ref": first(row, "result_ref", "raw_result_ref", "bad_capture_ref"),
            "result_sha256": (
                hash_field(row, "result")
                or row.get("bad_capture_sha256")
                or row.get("bad_capture_hash")
            ),
            "validation_ref": first(
                row, "validation_ref", "failure_validation_ref", "bad_capture_validation_ref"
            ),
            "validation_sha256": (
                hash_field(row, "validation")
                or row.get("failure_validation_sha256")
                or row.get("failure_validation_hash")
                or row.get("bad_capture_validation_sha256")
                or row.get("bad_capture_validation_hash")
            ),
            "completed_at": row.get("completed_at"),
        }
        artifact_values = {
            name: value for name, value in artifact_values.items() if value is not None
        }
        candidates_by_runner[runner_id].append(
            {
                "assignment_id": assignment_id if isinstance(assignment_id, str) else None,
                "attempt": attempt if not attempt_issues else None,
                "attempt_invalid": bool(attempt_issues),
                "assignment_known": isinstance(assignment, dict),
                "runner_matches_assignment": (
                    isinstance(assignment, dict) and runner_id == assignment.get("runner_id")
                ),
                "identities": identities,
                "artifacts": artifact_values,
                "receipt": f"{row.get('_receipt_file', 'unknown')}:{row.get('_receipt_line', ordinal)}",
            }
        )

    records_by_runner: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for runner_id, candidates in candidates_by_runner.items():
        clusters: list[dict[str, Any]] = []

        def same_logical_attempt(left: dict[str, Any], right: dict[str, Any]) -> bool:
            if left["assignment_id"] != right["assignment_id"]:
                return False
            right_attempts = right.get("attempt_values", set())
            return (
                left["attempt"] in right_attempts
                or left["attempt"] is None
                or not right_attempts
            )

        def identities_overlap(left: dict[str, str], right: dict[str, set[str]]) -> bool:
            return any(value in right.get(name, set()) for name, value in left.items())

        # Identity-bearing evidence establishes physical clusters first.
        for candidate in (item for item in candidates if item["identities"]):
            matching = [
                index
                for index, cluster in enumerate(clusters)
                if same_logical_attempt(candidate, cluster)
                and identities_overlap(candidate["identities"], cluster["identity_values"])
            ]
            if not matching:
                clusters.append(
                    {
                        "assignment_id": candidate["assignment_id"],
                        "attempt": candidate["attempt"],
                        "attempt_values": (
                            {candidate["attempt"]} if candidate["attempt"] is not None else set()
                        ),
                        "attempt_invalid": candidate["attempt_invalid"],
                        "assignment_known": candidate["assignment_known"],
                        "runner_matches_assignment": candidate["runner_matches_assignment"],
                        "identity_values": {
                            name: {value} for name, value in candidate["identities"].items()
                        },
                        "artifact_values": {
                            name: {strict_canonical(value)}
                            for name, value in candidate["artifacts"].items()
                        },
                        "receipts": {candidate["receipt"]},
                    }
                )
                continue
            target = clusters[matching[0]]
            if candidate["attempt"] is not None:
                target["attempt_values"].add(candidate["attempt"])
            target["attempt"] = (
                next(iter(target["attempt_values"]))
                if len(target["attempt_values"]) == 1
                else None
            )
            target["attempt_invalid"] = target["attempt_invalid"] or candidate["attempt_invalid"]
            target["assignment_known"] = target["assignment_known"] and candidate["assignment_known"]
            target["runner_matches_assignment"] = (
                target["runner_matches_assignment"] and candidate["runner_matches_assignment"]
            )
            for name, value in candidate["identities"].items():
                target["identity_values"].setdefault(name, set()).add(value)
            for name, value in candidate["artifacts"].items():
                target["artifact_values"].setdefault(name, set()).add(
                    strict_canonical(value)
                )
            target["receipts"].add(candidate["receipt"])
            for index in reversed(matching[1:]):
                other = clusters.pop(index)
                target["attempt_values"].update(other.get("attempt_values", set()))
                target["attempt"] = (
                    next(iter(target["attempt_values"]))
                    if len(target["attempt_values"]) == 1
                    else None
                )
                target["attempt_invalid"] = target["attempt_invalid"] or other.get(
                    "attempt_invalid", False
                )
                target["assignment_known"] = target["assignment_known"] and other.get(
                    "assignment_known", False
                )
                target["runner_matches_assignment"] = (
                    target["runner_matches_assignment"]
                    and other.get("runner_matches_assignment", False)
                )
                for name, values in other["identity_values"].items():
                    target["identity_values"].setdefault(name, set()).update(values)
                for name, values in other.get("artifact_values", {}).items():
                    target["artifact_values"].setdefault(name, set()).update(values)
                target["receipts"].update(other["receipts"])

        # Identity-free evidence is deduplicated only when there is no ambiguity.
        opaque_by_key: dict[tuple[Any, Any], dict[str, Any]] = {}
        for candidate in (item for item in candidates if not item["identities"]):
            matching = [
                cluster
                for cluster in clusters
                if cluster["assignment_id"] == candidate["assignment_id"]
                and len(cluster.get("attempt_values", set())) == 1
                and candidate["attempt"] in cluster.get("attempt_values", set())
            ]
            if len(matching) == 1:
                matching[0]["receipts"].add(candidate["receipt"])
                for name, value in candidate["artifacts"].items():
                    matching[0]["artifact_values"].setdefault(name, set()).add(
                        strict_canonical(value)
                    )
                matching[0]["attempt_invalid"] = (
                    matching[0]["attempt_invalid"] or candidate["attempt_invalid"]
                )
                matching[0]["assignment_known"] = (
                    matching[0]["assignment_known"] and candidate["assignment_known"]
                )
                matching[0]["runner_matches_assignment"] = (
                    matching[0]["runner_matches_assignment"]
                    and candidate["runner_matches_assignment"]
                )
                continue
            key = (candidate["assignment_id"], candidate["attempt"])
            opaque = opaque_by_key.get(key)
            if opaque is None:
                opaque = {
                    "assignment_id": candidate["assignment_id"],
                    "attempt": candidate["attempt"],
                    "attempt_values": (
                        {candidate["attempt"]} if candidate["attempt"] is not None else set()
                    ),
                    "attempt_invalid": candidate["attempt_invalid"],
                    "assignment_known": candidate["assignment_known"],
                    "runner_matches_assignment": candidate["runner_matches_assignment"],
                    "identity_values": {},
                    "artifact_values": {
                        name: {strict_canonical(value)}
                        for name, value in candidate["artifacts"].items()
                    },
                    "receipts": set(),
                    "ambiguous_identity_free_evidence": len(matching) > 1,
                }
                opaque_by_key[key] = opaque
                clusters.append(opaque)
            opaque["receipts"].add(candidate["receipt"])
            for name, value in candidate["artifacts"].items():
                opaque["artifact_values"].setdefault(name, set()).add(
                    strict_canonical(value)
                )
            opaque["attempt_invalid"] = opaque["attempt_invalid"] or candidate["attempt_invalid"]
            opaque["assignment_known"] = opaque["assignment_known"] and candidate["assignment_known"]
            opaque["runner_matches_assignment"] = (
                opaque["runner_matches_assignment"] and candidate["runner_matches_assignment"]
            )

        for cluster in clusters:
            assignment = expected.get(cluster["assignment_id"], {})
            identity_values = cluster["identity_values"]
            records_by_runner[runner_id].append(
                {
                    "assignment_id": cluster["assignment_id"],
                    "attempt": (
                        next(iter(cluster.get("attempt_values", set())))
                        if len(cluster.get("attempt_values", set())) == 1
                        else None
                    ),
                    "agent_instance_ids": sorted(identity_values.get("agent_instance_id", set())),
                    "agent_paths": sorted(identity_values.get("agent_path", set())),
                    "agent_thread_ids": sorted(identity_values.get("agent_thread_id", set())),
                    "token_estimate": assignment.get("token_estimate", 0),
                    "capsule_package_bytes": assignment.get("capsule_package_bytes", 0),
                    "opaque_lineage": any(
                        len(identity_values.get(name, set())) != 1
                        for name in ("agent_instance_id", "agent_path", "agent_thread_id")
                    )
                    or len(cluster.get("attempt_values", set())) != 1
                    or bool(cluster.get("attempt_invalid"))
                    or any(
                        len(values) > 1
                        for values in cluster.get("artifact_values", {}).values()
                    )
                    or not bool(cluster.get("assignment_known"))
                    or not bool(cluster.get("runner_matches_assignment"))
                    or bool(cluster.get("ambiguous_identity_free_evidence")),
                    "evidence_receipts": sorted(cluster["receipts"]),
                }
            )
    return records_by_runner


def strict_completion_issues(
    runner_id: str,
    receipt: Any,
    runner_thread_id: str,
    expected_rows: list[dict[str, Any]],
    valid_assignment_ids: set[str],
    attempt_records: list[dict[str, Any]],
    failed_records: list[dict[str, Any]],
    checkpoint_runner_artifacts: dict[str, dict[str, Any]],
) -> tuple[list[str], dict[str, Any]]:
    issues: list[str] = []
    hashes: dict[str, Any] = {}
    runner_dir = ROOT / "runners" / runner_id
    complete_path = runner_dir / "RUNNER_COMPLETE.json"
    if complete_path.is_file():
        hashes["runner_complete_sha256"] = sha256(complete_path)
    packet_path = ROOT / "assignments" / f"{runner_id}.jsonl"
    hashes["assignment_packet_sha256"] = sha256(packet_path) if packet_path.is_file() else None
    failed_path = runner_dir / "failed_attempts.jsonl"
    hashes["failed_attempts_sha256"] = sha256(failed_path) if failed_path.is_file() else None
    if not isinstance(receipt, dict) or not receipt:
        return ["RUNNER_COMPLETE is not a nonempty object"], hashes
    expected_count = len(expected_rows)
    runner_valid_ids = {
        assignment_id
        for assignment_id in valid_assignment_ids
        if any(row["assignment_id"] == assignment_id for row in expected_rows)
    }
    required = {
        "audit_id": AUDIT_ID,
        "runner_id": runner_id,
        "runner_thread_id": runner_thread_id,
        "status": "complete",
        "assignment_count": expected_count,
        "valid_assignments": expected_count,
        "required_model": "gpt-5.6-sol",
        "required_reasoning_effort": "ultra",
    }
    for name, wanted in required.items():
        observed = receipt.get(name)
        if (
            isinstance(wanted, int)
            and not isinstance(wanted, bool)
            and canonical_nonnegative_int(observed) != wanted
        ) or (
            not isinstance(wanted, int) and observed != wanted
        ):
            issues.append(f"RUNNER_COMPLETE {name} mismatch")
    if len(runner_valid_ids) != expected_count:
        issues.append(
            f"RUNNER_COMPLETE is premature: {len(runner_valid_ids)}/{expected_count} assignments validate"
        )
    if not isinstance(receipt.get("completed_at"), str) or not receipt["completed_at"]:
        issues.append("RUNNER_COMPLETE completed_at missing")
    if canonical_nonnegative_number(receipt.get("elapsed_seconds")) is None:
        issues.append("RUNNER_COMPLETE elapsed_seconds invalid")

    for name in ("coverage_credit", "validation_passed", "passed", "valid"):
        if name in receipt and receipt.get(name) not in (1, True):
            issues.append(f"RUNNER_COMPLETE {name} is not explicitly positive")
    for name in ("errors", "validation_errors"):
        if name in receipt and receipt.get(name) != []:
            issues.append(f"RUNNER_COMPLETE {name} must be an empty array")

    zero_fields = (
        "duplicate_agent_instances",
        "recycled_agent_instances",
        "multi_scope_agent_instances",
        "wrong_model_effort_count",
        "source_capsule_mismatch_count",
        "scope_spill_count",
        "role_leak_count",
        "post_terminal_output_count",
    )
    for name in zero_fields:
        if canonical_nonnegative_int(receipt.get(name)) != 0:
            issues.append(f"RUNNER_COMPLETE {name} must equal zero")
    if receipt.get("unresolved_infrastructure_issues") != []:
        issues.append("RUNNER_COMPLETE unresolved_infrastructure_issues must be empty")

    identity_lists = {
        field: [
            value
            for row in attempt_records
            for value in row.get(field, [])
            if isinstance(value, str) and value
        ]
        for field in ("agent_instance_ids", "agent_paths", "agent_thread_ids")
    }
    identities = set(identity_lists["agent_instance_ids"])
    if canonical_nonnegative_int(receipt.get("actual_unique_agents_spawned")) != len(identities):
        issues.append("RUNNER_COMPLETE actual_unique_agents_spawned mismatch")
    if any(row.get("opaque_lineage") is True for row in attempt_records):
        issues.append("RUNNER_COMPLETE attempt accounting contains opaque identity lineage")
    for field, values in identity_lists.items():
        if len(values) != len(attempt_records) or len(values) != len(set(values)):
            issues.append(f"RUNNER_COMPLETE {field} are missing or reused across physical attempts")
    logical_attempt_keys = [
        (row.get("assignment_id"), row.get("attempt")) for row in attempt_records
    ]
    if len(logical_attempt_keys) != len(set(logical_attempt_keys)):
        issues.append("RUNNER_COMPLETE reuses a canonical assignment/attempt number")
    if any(row.get("opaque_lineage") is True for row in failed_records):
        issues.append("RUNNER_COMPLETE failed-attempt accounting contains opaque lineage")
    if canonical_nonnegative_int(receipt.get("failed_attempts")) != len(failed_records):
        issues.append("RUNNER_COMPLETE failed_attempts mismatch")

    valid_tokens = sum(int(row.get("token_estimate", 0)) for row in expected_rows)
    valid_capsule_bytes = sum(
        int(row.get("capsule_package_bytes", 0)) for row in expected_rows
    )
    if canonical_nonnegative_int(receipt.get("valid_token_estimate")) != valid_tokens:
        issues.append("RUNNER_COMPLETE valid_token_estimate mismatch")
    if canonical_nonnegative_int(receipt.get("valid_capsule_package_bytes")) != valid_capsule_bytes:
        issues.append("RUNNER_COMPLETE valid_capsule_package_bytes mismatch")
    attempted_tokens = sum(
        int(row.get("token_estimate", 0))
        for row in attempt_records
        if isinstance(row.get("token_estimate", 0), (int, float))
    )
    attempted_capsule_bytes = sum(
        int(row.get("capsule_package_bytes", 0))
        for row in attempt_records
        if isinstance(row.get("capsule_package_bytes", 0), (int, float))
    )
    if canonical_nonnegative_int(receipt.get("attempted_token_estimate")) != attempted_tokens:
        issues.append("RUNNER_COMPLETE attempted_token_estimate mismatch")
    if canonical_nonnegative_int(receipt.get("attempted_capsule_package_bytes")) != attempted_capsule_bytes:
        issues.append("RUNNER_COMPLETE attempted_capsule_package_bytes mismatch")

    exact_refs = {
        "fresh_agent_assignment_registry_ref": runner_dir
        / "fresh_agent_assignment_registry.jsonl",
        "result_manifest_ref": runner_dir / "result_manifest.jsonl",
    }
    for name, wanted_path in exact_refs.items():
        observed_path = repo_path(receipt.get(name))
        if observed_path is None or observed_path.resolve() != wanted_path.resolve():
            issues.append(f"RUNNER_COMPLETE {name} mismatch")
        elif not observed_path.is_file():
            issues.append(f"RUNNER_COMPLETE {name} missing")
        else:
            hashes[name.replace("_ref", "_sha256")] = sha256(observed_path)
            claimed = receipt.get(name.replace("_ref", "_sha256"))
            if claimed is not None and claimed != hashes[name.replace("_ref", "_sha256")]:
                issues.append(f"RUNNER_COMPLETE {name} claimed hash mismatch")

    final_ref = repo_path(receipt.get("final_validation_ref"))
    expected_validation_dir = runner_dir / "validation"
    if (
        final_ref is None
        or not final_ref.is_file()
        or not under(final_ref, expected_validation_dir)
    ):
        issues.append("RUNNER_COMPLETE final_validation_ref missing or out of scope")
    else:
        try:
            final_validation_bytes = final_ref.read_bytes()
            hashes["final_validation_sha256"] = hashlib.sha256(
                final_validation_bytes
            ).hexdigest()
            validation = strict_json_loads(final_validation_bytes.decode("utf-8"))
        except Exception:
            final_validation_bytes = None
            validation = None
        final_validation_ref = str(final_ref.relative_to(ROOT))
        final_validation_artifact = checkpoint_runner_artifacts.get(
            final_validation_ref, {}
        )
        expected_final_validation_sha256 = (
            final_validation_artifact.get("sha256")
            if isinstance(final_validation_artifact, dict)
            and final_validation_artifact.get("state") == "present"
            else None
        )
        if (
            canonical_sha256(expected_final_validation_sha256) is None
            or hashes.get("final_validation_sha256")
            != expected_final_validation_sha256
        ):
            issues.append(
                "RUNNER_COMPLETE final validation differs from checkpointed bytes"
            )
        claimed = receipt.get("final_validation_sha256")
        if claimed is not None and claimed != hashes.get("final_validation_sha256"):
            issues.append("RUNNER_COMPLETE final validation claimed hash mismatch")
        if final_validation_bytes is None or not isinstance(validation, dict):
            issues.append("RUNNER_COMPLETE final validation is invalid JSON")
        else:
            if validation.get("audit_id") != AUDIT_ID:
                issues.append("final runner validation audit_id mismatch")
            if validation.get("runner_id") != runner_id:
                issues.append("final runner validation runner_id mismatch")
            if str(validation.get("status", "")).lower() not in {"pass", "passed"}:
                issues.append("final runner validation status is not pass")
            positive_validation = any(
                validation.get(name) is True
                for name in ("validation_passed", "passed", "valid")
            ) or str(validation.get("status", "")).lower() in {"pass", "passed"}
            if any(
                name in validation and validation.get(name) is False
                for name in ("validation_passed", "passed", "valid")
            ):
                issues.append("final runner validation has an explicit false validation flag")
            if not positive_validation:
                issues.append("final runner validation lacks an explicit positive validation")
            if validation.get("errors") != []:
                issues.append("final runner validation errors are not empty")
            if validation.get("validation_errors") not in (None, []):
                issues.append("final runner validation validation_errors are not empty")
            if canonical_nonnegative_int(validation.get("assignment_count")) != expected_count:
                issues.append("final runner validation assignment_count mismatch")
            if canonical_nonnegative_int(validation.get("valid_assignment_count")) != expected_count:
                issues.append("final runner validation valid_assignment_count mismatch")
            for name in (
                "duplicate_agent_instance_count",
                "duplicate_agent_path_count",
                "duplicate_agent_thread_id_count",
                "recycled_agent_count",
                "multi_scope_agent_count",
            ):
                if canonical_nonnegative_int(validation.get(name)) != 0:
                    issues.append(f"final runner validation {name} must equal zero")
    return sorted(set(issues)), hashes


def revoked_draft_main() -> int:
    """Superseded pre-review draft retained only for byte-level lineage."""
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--final",
        action="store_true",
        help="Require all assignments and runner completion receipts.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Write the canonical JSON report to this path as well as stdout.",
    )
    args = parser.parse_args()

    errors: list[str] = []
    localized_receipt_errors: list[str] = []
    warnings: list[str] = []
    quarantine: list[dict[str, Any]] = []

    assignment_rows = load_jsonl(ROOT / "assignments/global_assignment_manifest.jsonl", errors)
    expected: dict[str, dict[str, Any]] = {}
    for row in assignment_rows:
        assignment_id = row.get("assignment_id")
        if not assignment_id:
            errors.append("global assignment without assignment_id")
        elif assignment_id in expected:
            errors.append(f"duplicate global assignment: {assignment_id}")
        else:
            expected[assignment_id] = row

    ready = load_json(ROOT / "coordination/READY_FOR_RUNNERS.json", errors) or {}
    runner_threads = load_json(ROOT / "coordination/runner_thread_registry.json", errors) or {}
    sealed = {
        "assignment_manifest": (
            ROOT / "assignments/global_assignment_manifest.jsonl",
            ready.get("manifest_sha256"),
        ),
        "window_manifest": (
            ROOT / "manifests/window_manifest.jsonl",
            ready.get("window_manifest_sha256"),
        ),
        "capsule_registry": (
            ROOT / "manifests/context_capsule_registry.jsonl",
            ready.get("capsule_registry_sha256"),
        ),
        "runner_registry": (
            ROOT / "coordination/runner_thread_registry.json",
            ready.get("runner_registry_sha256"),
        ),
        "validator_result": (
            ROOT / "validator_results.json",
            ready.get("validator_result_sha256"),
        ),
    }
    seal_checks: dict[str, str] = {}
    for name, (path, wanted) in sealed.items():
        actual = sha256(path) if path.is_file() else None
        seal_checks[name] = "pass" if wanted and actual == wanted else "fail"
        if seal_checks[name] == "fail":
            errors.append(f"sealed {name} hash mismatch")

    capsule_cache: dict[str, dict[str, Any]] = {}
    source_hash_cache: dict[str, str] = {}
    file_hash_cache: dict[Path, str] = {}
    transaction_input_hashes: dict[str, str] = {}

    def transaction_key(path: Path) -> str:
        if under(path, ROOT):
            return str(path.resolve().relative_to(ROOT.resolve()))
        if under(path, REPO):
            return "repo:" + str(path.resolve().relative_to(REPO.resolve()))
        return "external:" + hashlib.sha256(str(path.resolve()).encode("utf-8")).hexdigest()

    def cached_hash(path: Path) -> str:
        path = path.resolve()
        if path not in file_hash_cache:
            file_hash_cache[path] = sha256(path)
            transaction_input_hashes[transaction_key(path)] = file_hash_cache[path]
            if under(path, ROOT / "runners"):
                runner_input_hashes[str(path.relative_to(ROOT.resolve()))] = file_hash_cache[path]
        return file_hash_cache[path]

    dispatches: list[dict[str, Any]] = []
    manifests: list[dict[str, Any]] = []
    raw_files: set[Path] = set()
    failed_rows: list[dict[str, Any]] = []
    complete_receipts: dict[str, dict[str, Any]] = {}
    per_runner: dict[str, dict[str, int]] = {}

    for number in range(1, 13):
        runner_id = f"runner-{number:02d}"
        runner_dir = ROOT / "runners" / runner_id
        runner_errors: list[str] = []
        registry = load_jsonl(runner_dir / "fresh_agent_assignment_registry.jsonl", runner_errors)
        result_rows = load_jsonl(runner_dir / "result_manifest.jsonl", runner_errors)
        failure_rows = load_jsonl(runner_dir / "failed_attempts.jsonl", runner_errors)
        ingest_error_rows = load_jsonl(runner_dir / "ingest_errors.jsonl", runner_errors)
        failure_rows.extend(ingest_error_rows)
        errors.extend(runner_errors)
        dispatches.extend(registry)
        manifests.extend(result_rows)
        failed_rows.extend(failure_rows)
        runner_raw = set((runner_dir / "raw_results").glob("*.json"))
        raw_files.update(runner_raw)
        complete_path = runner_dir / "RUNNER_COMPLETE.json"
        if complete_path.exists():
            complete_receipts[runner_id] = load_json(complete_path, errors) or {}
        per_runner[runner_id] = {
            "expected_assignments": sum(1 for row in expected.values() if row["runner_id"] == runner_id),
            "dispatch_records": len(registry),
            "result_manifest_records": len(result_rows),
            "raw_result_files": len(runner_raw),
            "failed_attempt_records": len(failure_rows),
            "validated_results": 0,
            "runner_complete_receipts": int(complete_path.exists()),
        }

    raw_dispatch_record_count = len(dispatches)
    grouped_dispatches: dict[tuple[Any, ...], dict[str, Any]] = {}
    for row in dispatches:
        key = (
            row.get("runner_id"),
            row.get("assignment_id"),
            attempt_token(row),
            row.get("agent_instance_id"),
            row.get("agent_thread_id"),
            row.get("agent_path"),
        )
        if key not in grouped_dispatches:
            grouped_dispatches[key] = dict(row)
            grouped_dispatches[key]["_receipt_members"] = [
                f"{row.get('_receipt_file')}:{row.get('_receipt_line')}"
            ]
            continue
        combined = grouped_dispatches[key]
        for name, value in row.items():
            if value is not None:
                combined[name] = value
        combined["_receipt_members"].append(
            f"{row.get('_receipt_file')}:{row.get('_receipt_line')}"
        )
    dispatches = list(grouped_dispatches.values())
    for runner_id, counts in per_runner.items():
        counts["dispatch_attempts"] = sum(
            1 for row in dispatches if row.get("runner_id") == runner_id
        )

    coordination_quarantine = load_jsonl(
        ROOT / "coordination/QUARANTINE_REGISTRY.jsonl", errors
    )
    failed_by_assignment: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in [*failed_rows, *coordination_quarantine]:
        if row.get("assignment_id"):
            failed_by_assignment[str(row["assignment_id"])].append(row)

    dispatch_by_assignment: dict[str, list[dict[str, Any]]] = defaultdict(list)
    identity_maps: dict[str, dict[str, list[dict[str, Any]]]] = {
        name: defaultdict(list)
        for name in ("agent_instance_id", "agent_path", "agent_thread_id")
    }
    pending_identity_receipts = 0

    for row in dispatches:
        assignment_id = row.get("assignment_id")
        runner_id = row.get("runner_id")
        assignment = expected.get(assignment_id)
        issues: list[str] = []
        if assignment is None:
            issues.append("assignment_id is missing or not expected")
        elif runner_id != assignment["runner_id"]:
            issues.append("runner scope spill or wrong runner_id")
        if assignment is not None:
            capsule_ref = repo_path(assignment["capsule_ref"])
            if capsule_ref is None or not capsule_ref.exists():
                issues.append("expected capsule missing")
                capsule = {}
            else:
                capsule = capsule_cache.setdefault(
                    assignment_id, load_json(capsule_ref, errors) or {}
                )
                issues.extend(
                    check_receipt_metadata(row, assignment, capsule, strict_identity=False)
                )
                if cached_hash(capsule_ref) != assignment["capsule_sha256"]:
                    issues.append("live capsule hash mismatch")
                if file_bytes(capsule_ref) != assignment["capsule_bytes"]:
                    issues.append("live capsule byte count mismatch")
                excerpt = repo_path(assignment["source_excerpt_ref"])
                if excerpt is None or not excerpt.exists():
                    issues.append("source excerpt missing")
                else:
                    if cached_hash(excerpt) != assignment["source_excerpt_sha256"]:
                        issues.append("live source excerpt hash mismatch")
                    if file_bytes(excerpt) != assignment["source_excerpt_bytes"]:
                        issues.append("live source excerpt byte count mismatch")
                document = repo_path(assignment["document_path"])
                if document is None or not document.exists():
                    issues.append("canonical source missing")
                else:
                    key = str(document)
                    source_hash_cache.setdefault(key, cached_hash(document))
                    if source_hash_cache[key] != assignment["source_sha256"]:
                        issues.append("live canonical source hash mismatch")
        if not row.get("agent_thread_id"):
            pending_identity_receipts += 1
        for field, mapping in identity_maps.items():
            value = row.get(field)
            if value:
                mapping[str(value)].append(row)
        if assignment_id:
            dispatch_by_assignment[assignment_id].append(row)
        if issues:
            quarantine.append(
                {
                    "runner_id": runner_id,
                    "assignment_id": assignment_id,
                    "attempt_id": first(row, "attempt_id", "attempt", "attempt_no", "attempt_number"),
                    "receipt": f"{row.get('_receipt_file')}:{row.get('_receipt_line')}",
                    "reasons": sorted(set(issues)),
                }
            )

    for field, mapping in identity_maps.items():
        for value, rows in mapping.items():
            assignments = {row.get("assignment_id") for row in rows}
            if len(rows) > 1 or len(assignments) > 1:
                reason = f"duplicate or recycled {field}: {value}"
                localized_receipt_errors.append(reason)
                for row in rows:
                    failed_by_assignment[str(row.get("assignment_id"))].append(row)
                    quarantine.append(
                        {
                            "runner_id": row.get("runner_id"),
                            "assignment_id": row.get("assignment_id"),
                            "attempt_id": first(
                                row, "attempt_id", "attempt", "attempt_no", "attempt_number"
                            ),
                            "receipt": f"{row.get('_receipt_file')}:{row.get('_receipt_line')}",
                            "reasons": [reason],
                        }
                    )

    valid_results: set[str] = set()
    valid_result_receipts: list[dict[str, Any]] = []
    referenced_raw: set[Path] = set()
    failed_result_paths: set[Path] = set()
    failed_result_hashes: set[str] = set()
    invalid_candidate_result_paths: set[Path] = set()
    invalid_candidate_result_hashes: set[str] = set()
    result_attempt_counts = Counter(attempt_identity_key(row) for row in manifests)

    attempt_number_groups: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for row in manifests:
        token = attempt_token(row)
        if row.get("assignment_id") and token is not None:
            attempt_number_groups[(str(row["assignment_id"]), token)].append(row)
    for (assignment_id, token), rows in attempt_number_groups.items():
        identities = {primary_identity(row) for row in rows}
        if len(identities) <= 1:
            continue
        reason = (
            f"assignment attempt number reused across fresh identities: "
            f"{assignment_id}:attempt-{token}"
        )
        localized_receipt_errors.append(reason)
        for row in rows:
            failed_by_assignment[assignment_id].append(row)
            quarantine.append(
                {
                    "runner_id": row.get("runner_id"),
                    "assignment_id": assignment_id,
                    "attempt_id": first(row, "attempt_id", "attempt", "attempt_no"),
                    "receipt": f"{row.get('_receipt_file')}:{row.get('_receipt_line')}",
                    "reasons": [reason],
                }
            )

    zero_credit_failed_attempts = 0
    for row in failed_rows:
        assignment_id = row.get("assignment_id")
        issues: list[str] = []
        if not isinstance(assignment_id, str) or assignment_id not in expected:
            issues.append("failed-attempt assignment_id is missing or not expected")
        if row.get("coverage_credit") not in (None, 0, False):
            issues.append("failed-attempt receipt grants nonzero coverage")
        if any(row.get(field) is True for field in ("validation_passed", "valid", "valid_coverage")):
            issues.append("failed-attempt receipt contains a positive validation flag")
        statuses = {
            str(row[field]).lower()
            for field in ("validation_status", "status", "result_status", "state", "attempt_state")
            if row.get(field) is not None
        }
        if statuses & POSITIVE_STATUSES:
            issues.append(f"failed-attempt receipt contains a positive status: {sorted(statuses & POSITIVE_STATUSES)}")
        result_ref = first(row, "result_ref", "raw_result_ref", "bad_capture_ref")
        result_path = repo_path(result_ref)
        if result_path is not None and result_path.exists():
            referenced_raw.add(result_path)
            expected_failed_hash = (
                hash_field(row, "result")
                or row.get("bad_capture_sha256")
                or row.get("bad_capture_hash")
            )
            if expected_failed_hash and cached_hash(result_path) != expected_failed_hash:
                issues.append("failed-attempt raw result hash mismatch")
        elif result_ref:
            issues.append("failed-attempt raw result is missing")
        capture_validation_ref = row.get("bad_capture_validation_ref")
        if capture_validation_ref:
            capture_validation_path = repo_path(capture_validation_ref)
            if capture_validation_path is None or not capture_validation_path.exists():
                issues.append("failed-capture validation receipt is missing")
            else:
                capture_validation = load_json(capture_validation_path, errors)
                if isinstance(capture_validation, dict):
                    original_ref = capture_validation.get("result_ref")
                    original_hash = hash_field(capture_validation, "result")
                    original_path = repo_path(original_ref)
                    if (
                        original_path is not None
                        and original_path.exists()
                        and original_hash
                        and cached_hash(original_path) != original_hash
                    ):
                        issues.append(
                            "failed-attempt result_ref was overwritten after immutable failure receipt"
                        )
        zero_credit_failed_attempts += 1
        if issues:
            quarantine.append(
                {
                    "runner_id": row.get("runner_id"),
                    "assignment_id": assignment_id,
                    "attempt_id": first(row, "attempt_id", "attempt", "attempt_no"),
                    "receipt": f"{row.get('_receipt_file')}:{row.get('_receipt_line')}",
                    "reasons": sorted(set(issues)),
                }
            )

    for row in manifests:
        assignment_id = row.get("assignment_id")
        assignment = expected.get(assignment_id)
        issues: list[str] = []
        if assignment is None:
            issues.append("result assignment_id is missing or not expected")
            capsule = {}
        else:
            capsule_ref = repo_path(assignment["capsule_ref"])
            capsule = capsule_cache.setdefault(
                assignment_id,
                load_json(capsule_ref, errors) if capsule_ref and capsule_ref.exists() else {},
            ) or {}
        if result_attempt_counts.get(attempt_identity_key(row), 0) != 1:
            issues.append(
                "expected exactly one result-manifest row for normalized attempt and identity"
            )

        candidates = dispatch_by_assignment.get(assignment_id, [])
        for identity_field in ("agent_instance_id", "agent_thread_id", "agent_path"):
            identity_value = row.get(identity_field)
            if identity_value:
                candidates = [
                    item for item in candidates if item.get(identity_field) == identity_value
                ]
                break
        row_attempt = attempt_token(row)
        if row_attempt is not None:
            candidates = [
                item
                for item in candidates
                if attempt_token(item) in (None, row_attempt)
            ]
        if len(candidates) != 1:
            issues.append("result does not resolve to exactly one dispatch receipt")
            dispatch = {}
        else:
            dispatch = candidates[0]
            combined = dict(dispatch)
            combined.update({key: value for key, value in row.items() if value is not None})
            if assignment is not None:
                issues.extend(
                    check_receipt_metadata(
                        combined, assignment, capsule, strict_identity=True
                    )
                )
            if not dispatch.get("agent_thread_id"):
                issues.append("completed dispatch lacks agent_thread_id")
            if not dispatch.get("completed_at"):
                issues.append("completed dispatch lacks completed_at")
            if not first(dispatch, "result_ref", "raw_result_ref"):
                issues.append("completed dispatch lacks result_ref")
            if not hash_field(dispatch, "result"):
                issues.append("completed dispatch lacks result hash")

        vetoes = [
            failed
            for failed in failed_by_assignment.get(str(assignment_id), [])
            if same_attempt(row, failed)
        ]
        if vetoes:
            sources = sorted(
                {
                    f"{item.get('_receipt_file', 'coordination/QUARANTINE_REGISTRY.jsonl')}:{item.get('_receipt_line', '?')}"
                    for item in vetoes
                }
            )
            issues.append(f"explicit failed-attempt/quarantine veto: {sources}")

        credit_value = first(row, "coverage_credit", "valid_coverage", "coverage_count")
        positive_credit = credit_value is True or credit_value == 1
        if not positive_credit:
            issues.append("result manifest does not explicitly grant one coverage credit")
        validation_positive = False
        for name in (
            "validation_passed",
            "valid",
            "valid_coverage",
            "schema_validation_passed",
            "dispatch_validation_passed",
            "exact_evidence_validation_passed",
            "scope_validation_passed",
            "schema_validation",
            "hash_validation",
            "range_validation",
            "validation_status",
            "status",
            "result_status",
            "state",
        ):
            if name not in row or row[name] is None:
                continue
            current = row[name]
            if current is True:
                validation_positive = True
                continue
            if current is False:
                issues.append(f"{name} is false")
                continue
            lowered = str(current).lower()
            if lowered in NEGATIVE_STATUSES or any(
                marker in lowered for marker in ("fail", "invalid", "reject", "quarant")
            ):
                issues.append(f"{name} is not positive: {current}")
            elif lowered in POSITIVE_STATUSES:
                validation_positive = True
        for name in ("validation_errors", "errors"):
            value = row.get(name)
            if isinstance(value, list) and value:
                issues.append(f"{name} is nonempty")
        if not validation_positive:
            issues.append("result manifest lacks explicit positive validation")

        validation_ref = row.get("validation_ref")
        if validation_ref:
            validation_path = repo_path(validation_ref)
            expected_validation_dir = (
                ROOT
                / "runners"
                / str(assignment.get("runner_id") if assignment else "")
                / "validation"
            )
            if validation_path is None or not validation_path.exists():
                issues.append("referenced validation receipt missing")
            elif not under(validation_path, expected_validation_dir):
                issues.append("validation_ref spills outside runner validation namespace")
            else:
                validation_hash = hash_field(row, "validation")
                if validation_hash and cached_hash(validation_path) != validation_hash:
                    issues.append("validation receipt hash mismatch")
                validation = load_json(validation_path, errors)
                if not isinstance(validation, dict):
                    issues.append("validation receipt is not an object")
                else:
                    if validation.get("assignment_id") not in (None, assignment_id):
                        issues.append("validation receipt assignment_id mismatch")
                    receipt_positive = any(
                        validation.get(field) is True
                        for field in ("passed", "validation_passed", "valid", "valid_coverage")
                    ) or str(
                        first(validation, "validation_status", "status", "state") or ""
                    ).lower() in POSITIVE_STATUSES
                    if not receipt_positive:
                        issues.append("referenced validation receipt is not explicitly positive")

        result_ref = first(row, "result_ref", "raw_result_ref") or first(
            dispatch, "result_ref", "raw_result_ref"
        )
        result_hash = hash_field(row, "result") or hash_field(dispatch, "result")
        result_path = repo_path(result_ref)
        expected_result_dir = ROOT / "runners" / str(assignment.get("runner_id") if assignment else "") / "raw_results"
        if result_path is None or not result_path.exists():
            issues.append("referenced raw result missing")
            raw = None
        elif not under(result_path, expected_result_dir):
            issues.append("result_ref spills outside runner raw_results namespace")
            raw = None
        else:
            referenced_raw.add(result_path)
            if not result_hash:
                issues.append("missing result hash")
            elif cached_hash(result_path) != result_hash:
                issues.append("result hash mismatch")
            raw = load_json(result_path, errors)
            if not isinstance(raw, dict):
                issues.append("raw result is not an object")
            else:
                if raw.get("assignment_id") != assignment_id:
                    issues.append("raw result assignment_id mismatch")
                for field in REQUIRED_OUTPUT_LISTS:
                    if not isinstance(raw.get(field), list):
                        issues.append(f"raw result {field} must be an array")
                if assignment is not None and capsule:
                    document_path = repo_path(assignment["document_path"])
                    if document_path is None or not document_path.exists():
                        issues.append("canonical source unavailable for exact-evidence validation")
                    else:
                        source_lines = document_path.read_text(encoding="utf-8").splitlines()
                        exact_refs = raw.get("exact_evidence_refs", [])
                        if raw.get("candidate_findings") and not exact_refs:
                            issues.append("candidate findings lack exact_evidence_refs")
                        if isinstance(exact_refs, list):
                            for index, value in enumerate(exact_refs):
                                for problem in evidence_issues(
                                    value,
                                    assignment,
                                    capsule,
                                    source_lines,
                                    require_quote=True,
                                ):
                                    issues.append(f"exact_evidence_refs[{index}]: {problem}")
                        for value in walk_dicts(raw):
                            if isinstance(exact_refs, list) and value in exact_refs:
                                continue
                            compact_ref = value.get("ref")
                            has_line_ref = any(
                                key in value for key in ("line_start", "start_line")
                            ) or (
                                isinstance(compact_ref, str)
                                and re.fullmatch(r".+:\d+(?:-\d+)?", compact_ref.strip())
                            )
                            if not has_line_ref:
                                continue
                            for problem in evidence_issues(
                                value,
                                assignment,
                                capsule,
                                source_lines,
                                require_quote=True,
                            ):
                                issues.append(f"nested evidence: {problem}")

        if issues:
            quarantine.append(
                {
                    "runner_id": row.get("runner_id"),
                    "assignment_id": assignment_id,
                    "attempt_id": first(row, "attempt_id", "attempt"),
                    "receipt": f"{row.get('_receipt_file')}:{row.get('_receipt_line')}",
                    "reasons": sorted(set(issues)),
                }
            )
            if positive_credit:
                localized_receipt_errors.append(
                    f"invalid positive-credit result receipt: {row.get('runner_id')}:{assignment_id}"
                )
        else:
            valid_result_receipts.append(
                {
                    "assignment_id": assignment_id,
                    "runner_id": assignment["runner_id"],
                    "attempt": attempt_token(row),
                    "attempt_identity_key": list(attempt_identity_key(row)),
                    "agent_instance_id": row.get("agent_instance_id"),
                    "agent_thread_id": row.get("agent_thread_id"),
                    "result_ref": result_ref,
                    "result_sha256": result_hash,
                    "manifest_receipt": f"{row.get('_receipt_file')}:{row.get('_receipt_line')}",
                }
            )

    candidate_receipts_by_assignment: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for receipt in valid_result_receipts:
        candidate_receipts_by_assignment[str(receipt["assignment_id"])].append(receipt)
    valid_result_receipts = []
    valid_results = set()
    for assignment_id, receipts in candidate_receipts_by_assignment.items():
        if len(receipts) != 1:
            reason = f"multiple independently valid attempts exist for one assignment: {assignment_id}"
            localized_receipt_errors.append(reason)
            for receipt in receipts:
                quarantine.append(
                    {
                        "runner_id": receipt.get("runner_id"),
                        "assignment_id": assignment_id,
                        "attempt_id": receipt.get("attempt"),
                        "receipt": receipt.get("manifest_receipt"),
                        "reasons": [reason],
                    }
                )
            continue
        valid_results.add(assignment_id)
        valid_result_receipts.append(receipts[0])
    for counts in per_runner.values():
        counts["validated_results"] = 0
    for receipt in valid_result_receipts:
        per_runner[str(receipt["runner_id"])]["validated_results"] += 1

    unmanifested_raw = sorted(str(path.relative_to(ROOT)) for path in raw_files - referenced_raw)
    if unmanifested_raw:
        warnings.append(f"{len(unmanifested_raw)} raw result files are not creditable yet")

    quarantine_by_key: dict[str, dict[str, Any]] = {}
    for item in quarantine:
        key = json.dumps(
            [item.get("runner_id"), item.get("assignment_id"), item.get("attempt_id"), item.get("receipt")],
            sort_keys=True,
        )
        if key not in quarantine_by_key:
            quarantine_by_key[key] = item
        else:
            quarantine_by_key[key]["reasons"] = sorted(
                set(quarantine_by_key[key]["reasons"]) | set(item["reasons"])
            )
    quarantine = sorted(
        quarantine_by_key.values(),
        key=lambda item: (
            str(item.get("runner_id")),
            str(item.get("assignment_id")),
            str(item.get("attempt_id")),
        ),
    )

    pending_assignments = len(expected) - len(valid_results)
    if args.final:
        if pending_assignments:
            errors.append(f"final mode: {pending_assignments} assignments lack a valid result")
        if len(complete_receipts) != 12:
            errors.append(
                f"final mode: expected 12 RUNNER_COMPLETE receipts, found {len(complete_receipts)}"
            )
        if unmanifested_raw:
            errors.append("final mode: unmanifested raw results remain")
        if pending_identity_receipts:
            errors.append("final mode: incomplete agent thread identity receipts remain")
    valid_id_digest = hashlib.sha256(
        ("\n".join(sorted(valid_results)) + ("\n" if valid_results else "")).encode("utf-8")
    ).hexdigest()
    seal_integrity_passed = all(value == "pass" for value in seal_checks.values())
    credited_results = set(valid_results) if seal_integrity_passed else set()
    credited_id_digest = hashlib.sha256(
        ("\n".join(sorted(credited_results)) + ("\n" if credited_results else "")).encode(
            "utf-8"
        )
    ).hexdigest()
    root_credit = len(credited_results)
    report = {
        "audit_id": AUDIT_ID,
        "validator": "postrun_validator_v3.py",
        "validator_version": "3.0.0",
        "observed_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "mode": "final" if args.final else "in_progress",
        "status": (
            "fail"
            if errors or localized_receipt_errors
            else "pass"
            if args.final and pending_assignments == 0
            else "in_progress"
        ),
        "authority": "frozen_postrun_coverage_authority_when_hash_matches_VALIDATOR_AUTHORITY_V3",
        "seal_checks": seal_checks,
        "counts": {
            "expected_assignments": len(expected),
            "dispatch_records": raw_dispatch_record_count,
            "dispatch_attempts": len(dispatches),
            "unique_dispatched_assignments": len(dispatch_by_assignment),
            "result_manifest_records": len(manifests),
            "raw_result_files": len(raw_files),
            "unmanifested_raw_result_files": len(unmanifested_raw),
            "failed_attempt_records": len(failed_rows),
            "zero_credit_failed_attempts": zero_credit_failed_attempts,
            "coordination_quarantine_records": len(coordination_quarantine),
            "validated_results": len(valid_results),
            "mechanically_eligible_assignments": len(valid_results),
            "credited_assignments": root_credit,
            "pending_assignments": pending_assignments,
            "runner_complete_receipts": len(complete_receipts),
            "pending_agent_thread_identity_receipts": pending_identity_receipts,
            "quarantine_candidates": len(quarantine),
            "localized_receipt_errors": len(set(localized_receipt_errors)),
        },
        "identity_uniqueness": {
            field: {
                "recorded": len(mapping),
                "duplicate_values": sum(1 for rows in mapping.values() if len(rows) > 1),
            }
            for field, mapping in identity_maps.items()
        },
        "validated_assignment_ids_sha256": valid_id_digest,
        "mechanically_eligible_assignment_ids": sorted(valid_results),
        "credited_assignment_ids_sha256": credited_id_digest,
        "credited_assignment_ids": sorted(credited_results),
        "seal_integrity_allows_per_assignment_credit": seal_integrity_passed,
        "mechanically_eligible_result_receipts": sorted(
            valid_result_receipts, key=lambda item: str(item["assignment_id"])
        ),
        "per_runner": per_runner,
        "unmanifested_raw_result_files": unmanifested_raw,
        "quarantine_candidates": quarantine,
        "warnings": warnings,
        "errors": sorted(set(errors)),
        "localized_receipt_errors": sorted(set(localized_receipt_errors)),
        "coverage_policy": (
            "An assignment is eligible only after one complete fresh-agent dispatch receipt, "
            "one matching result-manifest receipt, immutable metadata/hash agreement, a confined "
            "raw result with required output arrays and exact in-range evidence quotes, no explicit "
            "failed-attempt or quarantine veto for that attempt, and no identity reuse. Invalid attempts "
            "remain zero-credit without erasing unrelated validated assignment credit. A failure of any "
            "READY-sealed input hash suppresses all assignment credit."
        ),
    }
    rendered = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if args.output:
        write_new_evidence_output(args.output, rendered)
    print(rendered, end="")
    return 0 if report["status"] != "fail" else 1


def strict_main() -> int:
    """Frozen-v3 entrypoint.

    The earlier ``main`` is preserved as review lineage only.  This entrypoint
    performs a fresh, fail-closed recomputation with immutable authority
    anchors and attempt-scoped retry semantics.
    """
    validator_start_sha256 = sha256(HERE)
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--final",
        action="store_true",
        help="Require all assignments and all validated runner completion receipts.",
    )
    parser.add_argument("--output", type=Path)
    parser.add_argument(
        "--lineage-checkpoint",
        type=Path,
        help="Validate a root-owned candidate checkpoint; default is the V3 bootstrap checkpoint.",
    )
    args = parser.parse_args()

    integrity_errors: list[str] = []
    final_errors: list[str] = []
    localized_receipt_errors: list[str] = []
    warnings: list[str] = []
    quarantine: list[dict[str, Any]] = []
    transaction_input_hashes: dict[str, str] = {}

    seal_checks: dict[str, str] = {}
    for name, (relative_ref, wanted) in IMMUTABLE_ANCHORS.items():
        path = ROOT / relative_ref
        actual = sha256(path) if path.is_file() else None
        if actual is not None:
            transaction_input_hashes[relative_ref] = actual
        seal_checks[name] = "pass" if actual == wanted else "fail"
        if seal_checks[name] == "fail":
            integrity_errors.append(
                f"immutable anchor mismatch: {name}: observed={actual!r} expected={wanted}"
            )

    ready_errors: list[str] = []
    ready = load_json_bound(
        ROOT / IMMUTABLE_ANCHORS["ready"][0],
        IMMUTABLE_ANCHORS["ready"][1],
        ready_errors,
    )
    integrity_errors.extend(ready_errors)
    if not isinstance(ready, dict):
        integrity_errors.append("READY_FOR_RUNNERS is not an object")
        ready = {}
    for name, wanted in EXPECTED_READY_VALUES.items():
        if ready.get(name) != wanted:
            integrity_errors.append(f"READY_FOR_RUNNERS {name} mismatch")

    authority_errors: list[str] = []
    v2_authority = load_json_bound(
        ROOT / IMMUTABLE_ANCHORS["v2_authority"][0],
        IMMUTABLE_ANCHORS["v2_authority"][1],
        authority_errors,
    )
    integrity_errors.extend(authority_errors)
    if not isinstance(v2_authority, dict):
        integrity_errors.append("VALIDATOR_AUTHORITY_V2 is not an object")
        v2_authority = {}
    observed_revoked: set[tuple[str, str]] = set()
    for row in v2_authority.get("known_revoked_attempts", []):
        if not isinstance(row, dict):
            integrity_errors.append("V2 known_revoked_attempts contains a non-object")
            continue
        token = strict_normalize_attempt(row.get("attempt"))
        if isinstance(row.get("assignment_id"), str) and token:
            observed_revoked.add((row["assignment_id"], token))
    if observed_revoked != set(KNOWN_REVOKED_ATTEMPTS):
        integrity_errors.append("V2 known revoked attempt set mismatch")
    postrun_authority = v2_authority.get("postrun_coverage_authority", {})
    if not isinstance(postrun_authority, dict):
        integrity_errors.append("V2 postrun_coverage_authority missing")
    else:
        attempt_rule = str(postrun_authority.get("attempt_rule", ""))
        if "new attempt number" not in attempt_rule or "new agent instance, path, and thread identity" not in attempt_rule:
            integrity_errors.append("V2 fresh-retry authority rule mismatch")
    original_ready = v2_authority.get("original_ready_evidence", {})
    if not isinstance(original_ready, dict) or original_ready.get("ready_sha256") != IMMUTABLE_ANCHORS["ready"][1]:
        integrity_errors.append("V2 authority READY anchor mismatch")

    alert_errors: list[str] = []
    alert_0003 = load_json_bound(
        ROOT / IMMUTABLE_ANCHORS["protocol_alert_0003"][0],
        IMMUTABLE_ANCHORS["protocol_alert_0003"][1],
        alert_errors,
    )
    alert_0004 = load_json_bound(
        ROOT / IMMUTABLE_ANCHORS["protocol_alert_0004"][0],
        IMMUTABLE_ANCHORS["protocol_alert_0004"][1],
        alert_errors,
    )
    integrity_errors.extend(alert_errors)
    required_fix = (
        alert_0003.get("decision", {}).get("required_fix", [])
        if isinstance(alert_0003, dict)
        and isinstance(alert_0003.get("decision"), dict)
        else []
    )
    if (
        not isinstance(alert_0003, dict)
        or alert_0003.get("alert_id") != "A004-PROTOCOL-ALERT-0003"
        or alert_0003.get("affected_validator_sha256")
        != IMMUTABLE_ANCHORS["frozen_v2_primary"][1]
        or alert_0003.get("decision", {}).get("initial_17_credits_revoked") is not False
        or not isinstance(required_fix, list)
        or not any("assignment plus attempt plus fresh identity" in str(item) for item in required_fix)
        or not any("Independently recompute all eligible attempts" in str(item) for item in required_fix)
        or not any("exact_text" in str(item) for item in required_fix)
        or not any("immutable lineage" in str(item) for item in required_fix)
    ):
        integrity_errors.append("Protocol Alert 0003 semantic authority mismatch")
    alert4_evidence = alert_0004.get("evidence", {}) if isinstance(alert_0004, dict) else {}
    alert4_credit = alert_0004.get("credit_effect", {}) if isinstance(alert_0004, dict) else {}
    alert4_recovery = alert_0004.get("required_recovery", []) if isinstance(alert_0004, dict) else []
    if (
        not isinstance(alert_0004, dict)
        or alert_0004.get("alert_id") != "A004-PROTOCOL-ALERT-0004"
        or alert4_evidence.get("runner_receipt")
        != "runners/runner-07/fresh_agent_assignment_registry.jsonl:22"
        or alert4_evidence.get("malformed_line_sha256")
        != "f28b331ae34eaa255d93ff43bdc9b87551cb9118f34a520ce5cc5939ff3dac47"
        or alert4_credit.get("credit") != 0
        or alert_0004.get("master_actions", {}).get("root_credit_advanced") is not False
        or not isinstance(alert4_recovery, list)
        or not any("Preserve the malformed line" in str(item) for item in alert4_recovery)
        or not any("Do not delete, rewrite, or normalize" in str(item) for item in alert4_recovery)
        or not any("new attempt number" in str(item) for item in alert4_recovery)
        or not any("fail closed" in str(item) for item in alert4_recovery)
    ):
        integrity_errors.append("Protocol Alert 0004 semantic authority mismatch")

    floor_errors: list[str] = []
    v2_floor_snapshot = load_json_bound(
        ROOT / IMMUTABLE_ANCHORS["v2_crosschecked_floor_snapshot"][0],
        IMMUTABLE_ANCHORS["v2_crosschecked_floor_snapshot"][1],
        floor_errors,
    )
    v2_floor_crosscheck = load_json_bound(
        ROOT / IMMUTABLE_ANCHORS["v2_crosschecked_floor_receipt"][0],
        IMMUTABLE_ANCHORS["v2_crosschecked_floor_receipt"][1],
        floor_errors,
    )
    integrity_errors.extend(floor_errors)
    v2_floor_receipts: dict[str, dict[str, Any]] = {}
    if not isinstance(v2_floor_snapshot, dict) or not isinstance(v2_floor_crosscheck, dict):
        integrity_errors.append("V2 crosschecked credit-floor evidence is invalid")
        v2_floor_snapshot = {}
        v2_floor_crosscheck = {}
    floor_ids = v2_floor_snapshot.get("credited_assignment_ids", [])
    floor_receipt_rows = v2_floor_snapshot.get(
        "mechanically_eligible_result_receipts", []
    )
    if (
        v2_floor_snapshot.get("validator_version") != "2.0.0"
        or v2_floor_snapshot.get("credited_assignment_ids_sha256")
        != "a518810069e77f35604fb81dffe15dcb420af373026047d16adf8e05d5f1592e"
        or not isinstance(floor_ids, list)
        or len(floor_ids) != 19
        or len(set(floor_ids)) != 19
        or strict_digest(set(floor_ids))
        != "a518810069e77f35604fb81dffe15dcb420af373026047d16adf8e05d5f1592e"
        or not isinstance(floor_receipt_rows, list)
        or len(floor_receipt_rows) != 19
    ):
        integrity_errors.append("V2 crosschecked 19-assignment floor snapshot mismatch")
    else:
        for receipt in floor_receipt_rows:
            assignment_id = receipt.get("assignment_id") if isinstance(receipt, dict) else None
            if (
                not isinstance(assignment_id, str)
                or assignment_id not in floor_ids
                or assignment_id in v2_floor_receipts
            ):
                integrity_errors.append("V2 credit-floor receipt set is malformed or duplicated")
                continue
            v2_floor_receipts[assignment_id] = dict(receipt)
    if (
        v2_floor_crosscheck.get("status") != "pass"
        or v2_floor_crosscheck.get("snapshot_sha256")
        != IMMUTABLE_ANCHORS["v2_crosschecked_floor_snapshot"][1]
        or v2_floor_crosscheck.get("validator_sha256")
        != IMMUTABLE_ANCHORS["frozen_v2_primary"][1]
        or v2_floor_crosscheck.get("credited_assignments_checked") != 19
        or v2_floor_crosscheck.get("root_credited_assignments_observed") != 19
        or v2_floor_crosscheck.get("errors") != []
    ):
        integrity_errors.append("V2 independent 19-assignment floor receipt mismatch")

    adjudication_errors: list[str] = []
    structural_adjudication = load_json_bound(
        ROOT / IMMUTABLE_ANCHORS["v2_structural_rejection_adjudication"][0],
        IMMUTABLE_ANCHORS["v2_structural_rejection_adjudication"][1],
        adjudication_errors,
    )
    integrity_errors.extend(adjudication_errors)
    adjudicated_structural_rows: dict[str, dict[str, Any]] = {}
    adjudicated_rows = (
        structural_adjudication.get("adjudicated_receipts", [])
        if isinstance(structural_adjudication, dict)
        else []
    )
    if (
        not isinstance(structural_adjudication, dict)
        or structural_adjudication.get("audit_id") != AUDIT_ID
        or structural_adjudication.get("classification")
        != "receipt_scoped_validator_infrastructure_supersession"
        or structural_adjudication.get("runner_namespaces_mutated") is not False
        or structural_adjudication.get("launch_packets_mutated") is not False
        or not isinstance(adjudicated_rows, list)
        or len(adjudicated_rows) != 3
    ):
        integrity_errors.append("V2 structural-rejection adjudication semantics mismatch")
        adjudicated_rows = []
    for item in adjudicated_rows:
        source_receipt = item.get("source_receipt") if isinstance(item, dict) else None
        attempt = strict_normalize_attempt(item.get("attempt")) if isinstance(item, dict) else None
        if (
            not isinstance(source_receipt, str)
            or not re.fullmatch(r"runners/runner-\d{2}/failed_attempts\.jsonl:\d+", source_receipt)
            or source_receipt in adjudicated_structural_rows
            or not isinstance(item.get("assignment_id"), str)
            or attempt is None
            or strict_identity(item) is None
            or canonical_sha256(item.get("source_line_sha256")) is None
            or canonical_sha256(item.get("result_sha256")) is None
            or canonical_sha256(item.get("validation_sha256")) is None
            or canonical_sha256(item.get("v2_quarantine_sha256")) is None
            or canonical_sha256(item.get("v2_snapshot_sha256")) is None
        ):
            integrity_errors.append("V2 structural-rejection adjudication row is malformed or duplicated")
            continue
        adjudicated_structural_rows[source_receipt] = dict(item)
    if len(adjudicated_structural_rows) != 3:
        integrity_errors.append("V2 structural-rejection adjudication row set mismatch")

    lineage_errors: list[str] = []
    lineage_anchor = load_json_bound(
        ROOT / IMMUTABLE_ANCHORS["initial_failure_lineage"][0],
        IMMUTABLE_ANCHORS["initial_failure_lineage"][1],
        lineage_errors,
    )
    integrity_errors.extend(lineage_errors)
    lineage_prefix_checks: dict[str, str] = {}
    initial_anchored_line_limits: dict[str, int] = {}
    if not isinstance(lineage_anchor, dict) or lineage_anchor.get("audit_id") != AUDIT_ID:
        integrity_errors.append("initial failure-lineage anchor is invalid")
        lineage_anchor = {}
    lineage_rows = lineage_anchor.get("files", [])
    if not isinstance(lineage_rows, list) or not lineage_rows:
        integrity_errors.append("initial failure-lineage anchor has no file rows")
        lineage_rows = []
    seen_lineage_refs: set[str] = set()
    for row in lineage_rows:
        if not isinstance(row, dict):
            integrity_errors.append("failure-lineage anchor contains a non-object row")
            continue
        ref = row.get("ref")
        byte_count = row.get("prefix_bytes")
        wanted = row.get("prefix_sha256")
        if (
            not isinstance(ref, str)
            or ref in seen_lineage_refs
            or not isinstance(byte_count, int)
            or isinstance(byte_count, bool)
            or byte_count < 0
            or not isinstance(wanted, str)
        ):
            integrity_errors.append("failure-lineage anchor row is malformed or duplicated")
            continue
        seen_lineage_refs.add(ref)
        path = ROOT / ref
        try:
            prefix_bytes = (
                read_prefix_bytes_bound(path, byte_count, wanted)
                if path.is_file()
                else None
            )
            actual = hashlib.sha256(prefix_bytes).hexdigest() if prefix_bytes is not None else None
        except Exception:
            prefix_bytes = None
            actual = None
        lineage_prefix_checks[ref] = "pass" if actual == wanted else "fail"
        if actual != wanted:
            integrity_errors.append(f"anchored runner-lineage prefix changed: {ref}")
        else:
            try:
                if prefix_bytes is None:
                    raise ValueError("captured prefix unavailable")
                prefix_text = prefix_bytes.decode("utf-8")
                initial_anchored_line_limits[ref] = len(prefix_text.splitlines())
            except Exception:
                integrity_errors.append(f"anchored runner-lineage prefix is not UTF-8: {ref}")
    anchored_validation_payloads: dict[str, dict[str, Any]] = {}
    payload_rows = lineage_anchor.get("unhashed_validation_payloads", [])
    if not isinstance(payload_rows, list):
        integrity_errors.append("initial lineage validation-payload list is invalid")
        payload_rows = []
    for row in payload_rows:
        if not isinstance(row, dict):
            integrity_errors.append("initial lineage validation payload row is not an object")
            continue
        source_receipt = row.get("source_receipt")
        ref = row.get("validation_ref")
        wanted_hash = row.get("validation_sha256")
        wanted_bytes = row.get("validation_bytes")
        if (
            not isinstance(source_receipt, str)
            or source_receipt in anchored_validation_payloads
            or not isinstance(ref, str)
            or canonical_sha256(wanted_hash) is None
            or not isinstance(wanted_bytes, int)
            or isinstance(wanted_bytes, bool)
            or wanted_bytes < 0
        ):
            integrity_errors.append("initial lineage validation payload row is malformed")
            continue
        anchored_validation_payloads[source_receipt] = row
        path = repo_path(ref)
        if (
            path is None
            or not path.is_file()
            or file_bytes(path) != wanted_bytes
            or sha256(path) != wanted_hash
        ):
            integrity_errors.append(
                f"anchored unhashed validation payload changed: {source_receipt}"
            )

    checkpoint_path = (
        args.lineage_checkpoint
        if args.lineage_checkpoint is not None
        else ROOT / BOOTSTRAP_CHECKPOINT_REF
    )
    if not checkpoint_path.is_absolute():
        checkpoint_path = ROOT / checkpoint_path
    checkpoint_path = checkpoint_path.resolve()
    if not under(checkpoint_path, ROOT / "coordination/lineage_v3"):
        integrity_errors.append("lineage checkpoint is outside the root-owned lineage directory")
    checkpoint_hash = sha256(checkpoint_path) if checkpoint_path.is_file() else None
    if checkpoint_hash is not None and under(checkpoint_path, ROOT):
        transaction_input_hashes[str(checkpoint_path.relative_to(ROOT))] = checkpoint_hash
    pinned_checkpoint = (ROOT / BOOTSTRAP_CHECKPOINT_REF).resolve()
    if (
        checkpoint_path != pinned_checkpoint
        or checkpoint_hash != BOOTSTRAP_CHECKPOINT_SHA256
    ):
        parser.error(
            "authoritative V3 accepts only the compile-time pinned bootstrap "
            "checkpoint; rolling checkpoints require a superseding frozen authority"
        )
    (
        lineage_streams,
        checkpoint_native_sessions,
        checkpoint_native_session_paths,
        checkpoint_runner_artifacts,
        lineage_checkpoint,
    ) = strict_checkpoint_streams(
        checkpoint_path,
        lineage_anchor,
        integrity_errors,
        expected_checkpoint_sha256=BOOTSTRAP_CHECKPOINT_SHA256,
    )
    checkpoint_jsonl_refs = {
        ref for ref, row in lineage_streams.items() if row.get("state") == "present"
    }
    runner_jsonl_set_at_start = {
        str(path.relative_to(ROOT))
        for path in (ROOT / "runners").glob("runner-*/**/*.jsonl")
        if path.is_file()
    }
    authoritative_runner_jsonl_set_at_start = {
        ref for ref in lineage_streams if (ROOT / ref).is_file()
    }
    post_checkpoint_jsonls = sorted(runner_jsonl_set_at_start - checkpoint_jsonl_refs)
    if post_checkpoint_jsonls:
        warnings.append(
            f"{len(post_checkpoint_jsonls)} runner JSONLs were created after the selected checkpoint and are deferred"
        )
    checkpoint_artifact_refs = {
        ref
        for ref, row in checkpoint_runner_artifacts.items()
        if row.get("state") == "present"
    }
    runner_artifact_set_at_start = {
        str(path.relative_to(ROOT))
        for path in (ROOT / "runners").glob("runner-*/**/*")
        if path.is_file() and path.suffix != ".jsonl"
    }
    authoritative_runner_artifact_set_at_start = {
        ref
        for ref, row in checkpoint_runner_artifacts.items()
        if row.get("semantic_class") != "checkpoint_metadata"
        and (ROOT / ref).is_file()
    }
    post_checkpoint_runner_artifacts = sorted(
        runner_artifact_set_at_start - checkpoint_artifact_refs
    )
    if post_checkpoint_runner_artifacts:
        warnings.append(
            f"{len(post_checkpoint_runner_artifacts)} runner artifacts were created after the selected checkpoint and are deferred"
        )

    assignment_rows = load_jsonl_bound(
        ROOT / "assignments/global_assignment_manifest.jsonl",
        IMMUTABLE_ANCHORS["assignment_manifest"][1],
        integrity_errors,
    )
    expected: dict[str, dict[str, Any]] = {}
    for row in assignment_rows:
        assignment_id = row.get("assignment_id")
        if not isinstance(assignment_id, str) or not assignment_id:
            integrity_errors.append("global assignment row lacks assignment_id")
        elif assignment_id in expected:
            integrity_errors.append(f"duplicate global assignment: {assignment_id}")
        else:
            expected[assignment_id] = row
    if len(expected) != 2538:
        integrity_errors.append(f"expected 2538 global assignments, found {len(expected)}")

    registry_errors: list[str] = []
    runner_threads = load_json_bound(
        ROOT / "coordination/runner_thread_registry.json",
        IMMUTABLE_ANCHORS["runner_registry"][1],
        registry_errors,
    )
    integrity_errors.extend(registry_errors)
    if not isinstance(runner_threads, dict):
        integrity_errors.append("runner thread registry is not an object")
        runner_threads = {}
    expected_runner_ids = {f"runner-{number:02d}" for number in range(1, 13)}
    runners_root = ROOT / "runners"
    observed_runner_namespaces = (
        {path.name for path in runners_root.iterdir() if path.is_dir()}
        if runners_root.is_dir()
        else set()
    )
    if observed_runner_namespaces != expected_runner_ids:
        integrity_errors.append(
            "unexpected or missing runner namespaces: "
            f"observed={sorted(observed_runner_namespaces)}"
        )
    if set(runner_threads) != expected_runner_ids:
        integrity_errors.append("runner thread registry key set mismatch")
    if any(not isinstance(value, str) or not value for value in runner_threads.values()):
        integrity_errors.append("runner thread registry contains an empty identity")
    if len(set(runner_threads.values())) != len(runner_threads):
        integrity_errors.append("runner thread registry reuses a persistent thread identity")

    def clean_row(row: dict[str, Any]) -> dict[str, Any]:
        return {key: value for key, value in row.items() if not key.startswith("_receipt_")}

    packet_issues: dict[str, list[str]] = defaultdict(list)
    expected_by_runner: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in expected.values():
        expected_by_runner[str(row.get("runner_id"))].append(row)
    for runner_id in sorted(expected_runner_ids):
        packet_path = ROOT / "assignments" / f"{runner_id}.jsonl"
        packet_errors: list[str] = []
        packet_rows, packet_hash = load_jsonl_captured(packet_path, packet_errors)
        if packet_hash is not None:
            transaction_input_hashes[str(packet_path.relative_to(ROOT))] = packet_hash
        packet_issues[runner_id].extend(packet_errors)
        packet_clean = [clean_row(row) for row in packet_rows]
        expected_clean = [
            clean_row(row)
            for row in assignment_rows
            if row.get("runner_id") == runner_id
        ]
        if packet_clean != expected_clean:
            packet_issues[runner_id].append(
                "runner assignment packet does not exactly match global manifest subset"
            )

    all_registry_rows: list[dict[str, Any]] = []
    all_manifest_rows: list[dict[str, Any]] = []
    all_failed_rows: list[dict[str, Any]] = []
    all_auxiliary_rows: list[dict[str, Any]] = []
    auxiliary_failure_rows: list[dict[str, Any]] = []
    open_infrastructure_rows: list[dict[str, Any]] = []
    malformed_runner_receipts: list[dict[str, Any]] = []
    raw_files: set[Path] = set()
    complete_receipts: dict[str, Any] = {}
    complete_load_errors: dict[str, list[str]] = defaultdict(list)
    per_runner: dict[str, dict[str, Any]] = {}
    runner_input_hashes: dict[str, str | None] = {}
    for ref, artifact_row in checkpoint_runner_artifacts.items():
        if artifact_row.get("semantic_class") == "checkpoint_metadata":
            continue
        runner_input_hashes[ref] = (
            artifact_row.get("sha256")
            if artifact_row.get("state") == "present"
            else None
        )
        if artifact_row.get("state") == "present":
            transaction_input_hashes[ref] = artifact_row["sha256"]
    for session_id, session_row in checkpoint_native_sessions.items():
        runner_input_hashes[f"native_session:{session_id}"] = session_row.get(
            "prefix_sha256"
        )

    def stable_runner_jsonl(path: Path) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        relative = str(path.relative_to(ROOT))
        checkpoint_row = lineage_streams.get(relative)
        if not isinstance(checkpoint_row, dict):
            integrity_errors.append(f"runner JSONL is not captured by the selected checkpoint: {relative}")
            return [], []
        byte_limit = checkpoint_row.get("prefix_bytes")
        state = checkpoint_row.get("state")
        if canonical_nonnegative_int(byte_limit) is None:
            integrity_errors.append(f"runner JSONL checkpoint byte limit is invalid: {relative}")
            return [], []
        try:
            prefix_before = (
                sha256_prefix(path, byte_limit)
                if state == "present" and path.is_file()
                else hashlib.sha256(b"").hexdigest()
                if state == "missing"
                else None
            )
        except Exception:
            prefix_before = None
        rows, malformed = strict_load_runner_jsonl(
            path, byte_limit, checkpoint_row.get("prefix_sha256")
        )
        try:
            prefix_after = (
                sha256_prefix(path, byte_limit)
                if state == "present" and path.is_file()
                else hashlib.sha256(b"").hexdigest()
                if state == "missing"
                else None
            )
        except Exception:
            prefix_after = None
        runner_input_hashes[relative] = prefix_after
        if prefix_before != prefix_after:
            integrity_errors.append(f"runner checkpoint prefix changed during validator scan: {relative}")
        if prefix_after != checkpoint_row.get("prefix_sha256"):
            integrity_errors.append(f"runner input no longer matches checkpoint prefix: {relative}")
        return rows, malformed

    for runner_id in sorted(expected_runner_ids):
        runner_dir = ROOT / "runners" / runner_id
        registry, malformed = stable_runner_jsonl(
            runner_dir / "fresh_agent_assignment_registry.jsonl"
        )
        malformed_runner_receipts.extend(malformed)
        manifests, malformed = stable_runner_jsonl(
            runner_dir / "result_manifest.jsonl"
        )
        malformed_runner_receipts.extend(malformed)
        failures, malformed = stable_runner_jsonl(
            runner_dir / "failed_attempts.jsonl"
        )
        malformed_runner_receipts.extend(malformed)
        ingest_rows, malformed = stable_runner_jsonl(
            runner_dir / "ingest_errors.jsonl"
        )
        failures.extend(ingest_rows)
        malformed_runner_receipts.extend(malformed)
        for row in registry:
            row["_scan_runner_id"] = runner_id
        for row in manifests:
            row["_scan_runner_id"] = runner_id
        for row in failures:
            row["_scan_runner_id"] = runner_id
        all_registry_rows.extend(registry)
        all_manifest_rows.extend(manifests)
        all_failed_rows.extend(failures)
        canonical_runner_jsonls = {
            (runner_dir / "fresh_agent_assignment_registry.jsonl").resolve(),
            (runner_dir / "result_manifest.jsonl").resolve(),
            (runner_dir / "failed_attempts.jsonl").resolve(),
            (runner_dir / "ingest_errors.jsonl").resolve(),
        }
        auxiliary_paths = sorted(
            ROOT / ref
            for ref, checkpoint_row in lineage_streams.items()
            if ref.startswith(f"runners/{runner_id}/")
            and ref.endswith(".jsonl")
            and checkpoint_row.get("state") == "present"
            and (ROOT / ref).resolve() not in canonical_runner_jsonls
        )
        runner_auxiliary_count = 0
        for auxiliary_path in auxiliary_paths:
            auxiliary_rows, malformed = stable_runner_jsonl(auxiliary_path)
            malformed_runner_receipts.extend(malformed)
            runner_auxiliary_count += len(auxiliary_rows)
            for auxiliary_row in auxiliary_rows:
                auxiliary_row["_scan_runner_id"] = runner_id
                auxiliary_row["_auxiliary_receipt"] = True
                auxiliary_row["_auxiliary_ref"] = str(auxiliary_path.relative_to(ROOT))
                if (
                    "failed_attempt" in auxiliary_path.name
                    or strict_terminal_negative(auxiliary_row)
                ):
                    auxiliary_failure_rows.append(auxiliary_row)
                if (
                    "infrastructure" in auxiliary_path.name
                    and str(auxiliary_row.get("status", "")).lower()
                    not in {"closed", "resolved", "pass", "passed"}
                ):
                    open_infrastructure_rows.append(auxiliary_row)
            all_auxiliary_rows.extend(auxiliary_rows)
        artifact_semantic_rows = 0
        for artifact_ref, artifact_row in sorted(checkpoint_runner_artifacts.items()):
            if (
                not artifact_ref.startswith(f"runners/{runner_id}/")
                or artifact_row.get("state") != "present"
                or not artifact_ref.endswith(".json")
                or artifact_row.get("semantic_class")
                in {"raw_result", "runner_completion", "checkpoint_metadata"}
            ):
                continue
            artifact_path = ROOT / artifact_ref
            local_errors: list[str] = []
            artifact_value = load_json_bound(
                artifact_path, artifact_row["sha256"], local_errors
            )
            if local_errors:
                # Only JSON artifacts whose filename promises JSON are semantic
                # inputs.  Invalid JSON is retained as zero-credit lineage.
                malformed_runner_receipts.append(
                    {
                        "source_receipt": f"{artifact_ref}:artifact",
                        "line_sha256": artifact_row.get("sha256"),
                        "error": "; ".join(local_errors),
                    }
                )
                continue
            if not isinstance(artifact_value, dict):
                continue
            if not any(
                name in artifact_value
                for name in (
                    "assignment_id",
                    "agent_instance_id",
                    "agent_path",
                    "agent_thread_id",
                    "status",
                    "state",
                    "validation_status",
                )
            ):
                continue
            artifact_value["_receipt_file"] = artifact_ref
            artifact_value["_receipt_line"] = "artifact"
            artifact_value["_scan_runner_id"] = runner_id
            artifact_value["_auxiliary_receipt"] = True
            artifact_value["_auxiliary_ref"] = artifact_ref
            artifact_value["_artifact_semantic_class"] = artifact_row.get(
                "semantic_class"
            )
            all_auxiliary_rows.append(artifact_value)
            artifact_semantic_rows += 1
            if (
                artifact_row.get("semantic_class") == "failed_artifact"
                or strict_terminal_negative(artifact_value)
            ):
                auxiliary_failure_rows.append(artifact_value)
            if (
                artifact_row.get("semantic_class") == "infrastructure"
                and str(artifact_value.get("status", "")).lower()
                not in {"closed", "resolved", "pass", "passed"}
            ):
                open_infrastructure_rows.append(artifact_value)
        runner_raw = {
            ROOT / ref
            for ref, artifact_row in checkpoint_runner_artifacts.items()
            if ref.startswith(f"runners/{runner_id}/raw_results/")
            and ref.endswith(".json")
            and artifact_row.get("state") == "present"
        }
        raw_files.update(runner_raw)
        complete_path = runner_dir / "RUNNER_COMPLETE.json"
        complete_ref = str(complete_path.relative_to(ROOT))
        complete_artifact = checkpoint_runner_artifacts.get(complete_ref, {})
        runner_input_hashes[complete_ref] = (
            complete_artifact.get("sha256")
            if complete_artifact.get("state") == "present"
            else None
        )
        if complete_artifact.get("state") == "present":
            local_errors: list[str] = []
            complete_receipts[runner_id] = load_json_bound(
                complete_path, complete_artifact["sha256"], local_errors
            )
            complete_load_errors[runner_id].extend(local_errors)
        per_runner[runner_id] = {
            "expected_assignments": len(expected_by_runner.get(runner_id, [])),
            "dispatch_records": len(registry),
            "result_manifest_records": len(manifests),
            "raw_result_files": len(runner_raw),
            "failed_attempt_records": len(failures),
            "auxiliary_lineage_records": runner_auxiliary_count + artifact_semantic_rows,
            "validated_results": 0,
            "runner_complete_receipts": int(complete_artifact.get("state") == "present"),
            "runner_complete_valid": False,
            "packet_issues": sorted(set(packet_issues.get(runner_id, []))),
        }

    quarantine_path = ROOT / "coordination/QUARANTINE_REGISTRY.jsonl"
    coordination_quarantine, malformed_quarantine = stable_runner_jsonl(quarantine_path)
    if malformed_quarantine:
        integrity_errors.append("root quarantine registry contains malformed JSONL rows")
    native_sessions_by_agent_path: dict[str, list[str]] = defaultdict(list)
    for session_id, session_row in checkpoint_native_sessions.items():
        agent_path = session_row.get("agent_path")
        if isinstance(agent_path, str):
            native_sessions_by_agent_path[agent_path].append(session_id)
    for evidence_row in [
        *all_registry_rows,
        *all_manifest_rows,
        *all_failed_rows,
        *all_auxiliary_rows,
        *coordination_quarantine,
    ]:
        agent_path = evidence_row.get("agent_path")
        matches = (
            native_sessions_by_agent_path.get(agent_path, [])
            if isinstance(agent_path, str)
            else []
        )
        if len(matches) == 1:
            evidence_row["_native_thread_id"] = matches[0]
    native_session_violations: dict[str, set[str]] = defaultdict(set)
    native_session_lineage_claims: dict[str, dict[str, set[str]]] = defaultdict(
        lambda: defaultdict(set)
    )
    for evidence_row in [
        *all_registry_rows,
        *all_manifest_rows,
        *all_failed_rows,
        *all_auxiliary_rows,
        *coordination_quarantine,
    ]:
        session_id = evidence_row.get("_native_thread_id")
        if not isinstance(session_id, str):
            continue
        assignment_id = evidence_row.get("assignment_id")
        attempt, attempt_issues = strict_attempt(evidence_row)
        assignment_token = (
            str(assignment_id) if isinstance(assignment_id, str) else "missing-assignment"
        )
        native_session_lineage_claims[session_id][assignment_token].add(
            attempt if not attempt_issues and attempt else "unkeyed-attempt"
        )
        session_runner = checkpoint_native_sessions.get(session_id, {}).get("runner_id")
        expected_runner = (
            expected.get(assignment_id, {}).get("runner_id")
            if isinstance(assignment_id, str)
            else None
        )
        physical_runner = evidence_row.get("_scan_runner_id") or evidence_row.get("runner_id")
        if expected_runner is not None and session_runner != expected_runner:
            native_session_violations[session_id].add(
                "native session runner scope differs from assignment"
            )
        if isinstance(physical_runner, str) and session_runner != physical_runner:
            native_session_violations[session_id].add(
                "native session runner scope differs from physical receipt"
            )
    native_session_lineage_pairs: dict[str, set[tuple[str, str]]] = defaultdict(set)
    for session_id, assignment_claims in native_session_lineage_claims.items():
        if len(assignment_claims) != 1:
            native_session_violations[session_id].add(
                "native session is reused across assignment attempts"
            )
            for assignment_id, attempts in assignment_claims.items():
                for attempt in attempts:
                    native_session_lineage_pairs[session_id].add((assignment_id, attempt))
            continue
        assignment_id, attempts = next(iter(assignment_claims.items()))
        explicit_attempts = attempts - {"unkeyed-attempt"}
        if len(explicit_attempts) > 1:
            native_session_violations[session_id].add(
                "native session is reused across assignment attempts"
            )
            for attempt in attempts:
                native_session_lineage_pairs[session_id].add((assignment_id, attempt))
        elif len(explicit_attempts) == 1:
            native_session_lineage_pairs[session_id].add(
                (assignment_id, next(iter(explicit_attempts)))
            )
        else:
            native_session_lineage_pairs[session_id].add(
                (assignment_id, "unkeyed-attempt")
            )
    unreceipted_native_sessions = sorted(
        set(checkpoint_native_sessions) - set(native_session_lineage_pairs)
    )
    if unreceipted_native_sessions:
        warnings.append(
            f"{len(unreceipted_native_sessions)} checkpointed native reviewer sessions lack runner receipts"
        )
    unreceipted_native_by_runner = Counter(
        checkpoint_native_sessions[session_id].get("runner_id")
        for session_id in unreceipted_native_sessions
    )
    for runner_id in per_runner:
        per_runner[runner_id]["unreceipted_native_sessions"] = int(
            unreceipted_native_by_runner.get(runner_id, 0)
        )
    for row in coordination_quarantine:
        row["_scan_runner_id"] = row.get("runner_id")
    negative_manifest_rows = [
        row for row in all_manifest_rows if strict_claims_negative(row)
    ]
    terminal_negative_registry_rows = [
        row for row in all_registry_rows if strict_terminal_negative(row)
    ]
    veto_rows = [
        *all_failed_rows,
        *coordination_quarantine,
        *negative_manifest_rows,
        *terminal_negative_registry_rows,
        *auxiliary_failure_rows,
    ]
    for malformed in malformed_runner_receipts:
        matching_quarantines = [
            row
            for row in coordination_quarantine
            if row.get("source_receipt") == malformed["source_receipt"]
            and row.get("immutable_malformed_line_sha256") == malformed["line_sha256"]
            and row.get("coverage_credit") in (0, False)
        ]
        if len(matching_quarantines) != 1:
            integrity_errors.append(
                f"unquarantined malformed runner receipt: {malformed['source_receipt']} "
                f"sha256={malformed['line_sha256']}"
            )
        else:
            recovered = matching_quarantines[0]
            malformed_ref = str(malformed["source_receipt"]).rsplit(":", 1)[0]
            malformed_stream = lineage_streams.get(malformed_ref, {})
            payload, physical_runner, payload_issues = strict_recover_plus_jsonl_row(
                malformed["source_receipt"],
                malformed_stream.get("prefix_bytes"),
                malformed_stream.get("prefix_sha256"),
            )
            recovered_assignment = recovered.get("assignment_id")
            recovered_attempt, recovered_attempt_issues = strict_attempt(recovered)
            recovered_issues: list[str] = []
            recovered_issues.extend(payload_issues)
            if not isinstance(recovered_assignment, str) or recovered_assignment not in expected:
                recovered_issues.append("expected assignment is missing")
            else:
                wanted_runner = expected[recovered_assignment]["runner_id"]
                if recovered.get("runner_id") != wanted_runner:
                    recovered_issues.append("quarantine runner scope does not match the assignment")
                if physical_runner != wanted_runner:
                    recovered_issues.append("physical malformed runner scope does not match the assignment")
            if (
                not isinstance(recovered.get("attempt"), int)
                or isinstance(recovered.get("attempt"), bool)
                or recovered.get("attempt", 0) < 1
                or recovered_attempt is None
                or recovered_attempt_issues
            ):
                recovered_issues.append("canonical positive attempt number is missing or conflicting")
            for identity_name in ("agent_instance_id", "agent_path", "agent_thread_id"):
                if not isinstance(recovered.get(identity_name), str) or not recovered[identity_name]:
                    recovered_issues.append(f"{identity_name} is missing")
            if isinstance(payload, dict):
                payload_attempt, payload_attempt_issues = strict_attempt(payload)
                if payload.get("assignment_id") != recovered_assignment:
                    recovered_issues.append("quarantine assignment differs from malformed payload")
                if payload.get("runner_id") != recovered.get("runner_id"):
                    recovered_issues.append("quarantine runner differs from malformed payload")
                if payload_attempt_issues or payload_attempt != recovered_attempt:
                    recovered_issues.append("quarantine attempt differs from malformed payload")
                for identity_name in ("agent_instance_id", "agent_path", "agent_thread_id"):
                    if payload.get(identity_name) != recovered.get(identity_name):
                        recovered_issues.append(
                            f"quarantine {identity_name} differs from malformed payload"
                        )
                payload_result_ref = first(payload, "result_ref", "raw_result_ref", "bad_capture_ref")
                recovered_result_ref = first(recovered, "result_ref", "raw_result_ref", "bad_capture_ref")
                payload_result_hash = (
                    hash_field(payload, "result")
                    or payload.get("bad_capture_sha256")
                    or payload.get("bad_capture_hash")
                )
                recovered_result_hash = (
                    hash_field(recovered, "result")
                    or recovered.get("bad_capture_sha256")
                    or recovered.get("bad_capture_hash")
                )
                payload_validation_ref = first(
                    payload,
                    "validation_ref",
                    "failure_validation_ref",
                    "bad_capture_validation_ref",
                )
                recovered_validation_ref = first(
                    recovered,
                    "validation_ref",
                    "failure_validation_ref",
                    "bad_capture_validation_ref",
                )
                payload_validation_hash = (
                    hash_field(payload, "validation")
                    or payload.get("failure_validation_sha256")
                    or payload.get("failure_validation_hash")
                    or payload.get("bad_capture_validation_sha256")
                    or payload.get("bad_capture_validation_hash")
                )
                recovered_validation_hash = (
                    hash_field(recovered, "validation")
                    or recovered.get("failure_validation_sha256")
                    or recovered.get("failure_validation_hash")
                    or recovered.get("bad_capture_validation_sha256")
                    or recovered.get("bad_capture_validation_hash")
                )
                for label, payload_value, recovered_value in (
                    ("result_ref", payload_result_ref, recovered_result_ref),
                    ("result_sha256", payload_result_hash, recovered_result_hash),
                    ("validation_ref", payload_validation_ref, recovered_validation_ref),
                    ("validation_sha256", payload_validation_hash, recovered_validation_hash),
                ):
                    if label.endswith("sha256") and canonical_sha256(payload_value) is None:
                        recovered_issues.append(f"malformed payload {label} is missing or invalid")
                    elif not isinstance(payload_value, str) or not payload_value:
                        recovered_issues.append(f"malformed payload {label} is missing")
                    elif recovered_value != payload_value:
                        recovered_issues.append(f"quarantine {label} differs from malformed payload")
            else:
                recovered_issues.append("malformed payload is not independently recoverable")
            if recovered_issues:
                integrity_errors.append(
                    "malformed runner receipt has opaque assurance-blocking lineage: "
                    f"{malformed['source_receipt']} ({'; '.join(sorted(set(recovered_issues)))})"
                )
            else:
                warnings.append(
                    f"accounted malformed zero-credit receipt with full recovered lineage: "
                    f"{malformed['source_receipt']}"
                )
    for row in coordination_quarantine:
        pinned = row.get("immutable_malformed_line_sha256")
        if not pinned:
            continue
        if not any(
            malformed.get("source_receipt") == row.get("source_receipt")
            and malformed.get("line_sha256") == pinned
            for malformed in malformed_runner_receipts
        ):
            integrity_errors.append(
                "pinned malformed runner receipt is missing or changed: "
                f"{row.get('source_receipt')} sha256={pinned}"
            )
    for assignment_id, attempt in KNOWN_REVOKED_ATTEMPTS:
        veto_rows.append(
            {
                "assignment_id": assignment_id,
                "attempt": int(attempt),
                "coverage_credit": 0,
                "status": "revoked_by_immutable_v2_authority",
                "_receipt_file": "validators/VALIDATOR_AUTHORITY_V2.json",
                "_receipt_line": "known_revoked_attempts",
                "_scan_runner_id": expected.get(assignment_id, {}).get("runner_id"),
                "_synthetic_authority_veto": True,
            }
        )

    def receipt_label(row: dict[str, Any]) -> str:
        return f"{row.get('_receipt_file', 'unknown')}:{row.get('_receipt_line', '?')}"

    file_hash_cache: dict[Path, str] = {}

    def transaction_key(path: Path) -> str:
        if under(path, ROOT):
            return str(path.resolve().relative_to(ROOT.resolve()))
        if under(path, REPO):
            return "repo:" + str(path.resolve().relative_to(REPO.resolve()))
        return "external:" + hashlib.sha256(str(path.resolve()).encode("utf-8")).hexdigest()

    def cached_hash(path: Path) -> str:
        path = path.resolve()
        if path not in file_hash_cache:
            file_hash_cache[path] = sha256(path)
            transaction_input_hashes[transaction_key(path)] = file_hash_cache[path]
            if under(path, ROOT / "runners"):
                ref = str(path.relative_to(ROOT.resolve()))
                artifact_row = checkpoint_runner_artifacts.get(ref)
                if (
                    not isinstance(artifact_row, dict)
                    or artifact_row.get("state") != "present"
                    or artifact_row.get("sha256") != file_hash_cache[path]
                ):
                    integrity_errors.append(
                        f"read runner artifact is absent from or differs from checkpoint: {ref}"
                    )
                runner_input_hashes[ref] = file_hash_cache[path]
        return file_hash_cache[path]

    structural_failure_detail = (
        "Frozen postrun validator v2 rejected the otherwise canonical-evidence retry "
        "solely because result_row_counts for the assignment is not exactly one under "
        "append-only retry history."
    )

    def structural_supersession_issues(
        row: dict[str, Any], adjudication: dict[str, Any]
    ) -> list[str]:
        issues: list[str] = []
        source_file = row.get("_receipt_file")
        source_line = row.get("_receipt_line")
        if not isinstance(source_file, str) or not isinstance(source_line, int):
            return ["adjudicated structural row lacks a physical source line"]
        physical_line_hash = row.get("_receipt_line_sha256")
        if canonical_sha256(physical_line_hash) is None:
            return ["adjudicated structural row lacks checkpoint-bound line bytes"]
        if physical_line_hash != adjudication.get("source_line_sha256"):
            issues.append("adjudicated structural source-line hash mismatch")
        exact_fields = (
            "assignment_id",
            "attempt_id",
            "agent_instance_id",
            "agent_path",
            "agent_thread_id",
            "result_ref",
            "result_sha256",
            "result_bytes",
        )
        for name in exact_fields:
            if row.get(name) != adjudication.get(name):
                issues.append(f"adjudicated structural {name} mismatch")
        observed_attempt, attempt_issues = strict_attempt(row)
        if attempt_issues or observed_attempt != strict_normalize_attempt(adjudication.get("attempt")):
            issues.append("adjudicated structural attempt mismatch")
        if (
            row.get("failure_kind") != "postrun_v2_structural_rejection"
            or row.get("failure_detail") != structural_failure_detail
            or row.get("immutable") is not True
            or row.get("coverage_credit") != 0
            or row.get("validation_passed") is not False
            or row.get("status") != "failed_attempt_zero_coverage"
        ):
            issues.append("adjudicated structural zero-credit semantics mismatch")
        artifact_pairs = (
            ("quarantine_receipt_ref", "quarantine_receipt_sha256", "v2_quarantine_ref", "v2_quarantine_sha256"),
            ("source_validator_ref", "source_validator_sha256", "v2_snapshot_ref", "v2_snapshot_sha256"),
        )
        loaded_artifacts: dict[str, Any] = {}
        for row_ref, row_hash, authority_ref, authority_hash in artifact_pairs:
            if (
                row.get(row_ref) != adjudication.get(authority_ref)
                or row.get(row_hash) != adjudication.get(authority_hash)
            ):
                issues.append(f"adjudicated structural {row_ref} binding mismatch")
                continue
            artifact_path = repo_path(row.get(row_ref))
            if artifact_path is None or not artifact_path.is_file():
                issues.append(f"adjudicated structural {row_ref} is missing")
                continue
            if cached_hash(artifact_path) != row.get(row_hash):
                issues.append(f"adjudicated structural {row_ref} hash mismatch")
                continue
            local_errors: list[str] = []
            loaded_artifacts[row_ref] = load_json_bound(
                artifact_path, str(row.get(row_hash)), local_errors
            )
            if local_errors:
                issues.append(f"adjudicated structural {row_ref} is invalid JSON")
        quarantine_payload = loaded_artifacts.get("quarantine_receipt_ref")
        if not isinstance(quarantine_payload, dict) or any(
            quarantine_payload.get(name) != row.get(name)
            for name in (
                "assignment_id",
                "attempt_id",
                "attempt_number",
                "agent_instance_id",
                "agent_path",
                "agent_thread_id",
                "result_ref",
                "result_sha256",
                "result_bytes",
                "failure_kind",
                "failure_detail",
                "coverage_credit",
                "validation_passed",
                "immutable",
                "status",
            )
        ):
            issues.append("adjudicated structural quarantine payload mismatch")
        v2_snapshot = loaded_artifacts.get("source_validator_ref")
        matching_v2_candidates = [
            candidate
            for candidate in (
                v2_snapshot.get("quarantine_candidates", [])
                if isinstance(v2_snapshot, dict)
                else []
            )
            if isinstance(candidate, dict)
            and candidate.get("assignment_id") == row.get("assignment_id")
            and strict_normalize_attempt(candidate.get("attempt_id")) == observed_attempt
            and candidate.get("receipt") == adjudication.get("positive_manifest_receipt")
        ]
        if (
            not isinstance(v2_snapshot, dict)
            or v2_snapshot.get("validator") != "postrun_validator_v2.py"
            or v2_snapshot.get("validator_version") != "2.0.0"
            or v2_snapshot.get("errors") != []
            or len(matching_v2_candidates) != 1
            or matching_v2_candidates[0].get("reasons")
            != ["expected exactly one result-manifest row for assignment"]
        ):
            issues.append("adjudicated structural v2-only rejection proof mismatch")
        manifest_matches = [
            manifest
            for manifest in all_manifest_rows
            if receipt_label(manifest) == adjudication.get("positive_manifest_receipt")
        ]
        if len(manifest_matches) != 1:
            issues.append("adjudicated structural positive manifest is missing or duplicated")
        else:
            manifest = manifest_matches[0]
            manifest_line_hash = manifest.get("_receipt_line_sha256")
            if manifest_line_hash != adjudication.get("positive_manifest_line_sha256"):
                issues.append("adjudicated structural positive-manifest line hash mismatch")
            for name in (
                "assignment_id",
                "agent_instance_id",
                "agent_path",
                "agent_thread_id",
                "result_ref",
                "result_bytes",
                "validation_ref",
                "validation_sha256",
            ):
                if manifest.get(name) != adjudication.get(name):
                    issues.append(f"adjudicated structural manifest {name} mismatch")
            if hash_field(manifest, "result") != adjudication.get("result_sha256"):
                issues.append("adjudicated structural manifest result hash mismatch")
            manifest_attempt, manifest_attempt_issues = strict_attempt(manifest)
            if manifest_attempt_issues or manifest_attempt != observed_attempt:
                issues.append("adjudicated structural manifest attempt mismatch")
            if not strict_claims_positive(manifest):
                issues.append("adjudicated structural manifest is not positive")
        result_path = repo_path(row.get("result_ref"))
        if (
            result_path is None
            or not result_path.is_file()
            or cached_hash(result_path) != adjudication.get("result_sha256")
            or file_bytes(result_path) != adjudication.get("result_bytes")
        ):
            issues.append("adjudicated structural raw-result binding mismatch")
        validation_path = repo_path(adjudication.get("validation_ref"))
        if (
            validation_path is None
            or not validation_path.is_file()
            or cached_hash(validation_path) != adjudication.get("validation_sha256")
        ):
            issues.append("adjudicated structural validation binding mismatch")
        return sorted(set(issues))

    referenced_raw: set[Path] = set()
    failed_result_paths: set[Path] = set()
    failed_result_hashes: set[str] = set()
    invalid_candidate_result_paths: set[Path] = set()
    invalid_candidate_result_hashes: set[str] = set()
    explicit_veto_pairs: set[tuple[str, str]] = set(KNOWN_REVOKED_ATTEMPTS)
    superseded_v2_structural_rejections: list[dict[str, Any]] = []
    failures_by_assignment: dict[str, list[dict[str, Any]]] = defaultdict(list)
    failures_by_runner: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in veto_rows:
        source_receipt = receipt_label(row)
        adjudication = adjudicated_structural_rows.get(source_receipt)
        pre_failure_issues: list[str] = []
        if adjudication is not None:
            structural_issues = structural_supersession_issues(row, adjudication)
            if not structural_issues:
                superseded_v2_structural_rejections.append(
                    {
                        "source_receipt": source_receipt,
                        "source_line_sha256": adjudication.get("source_line_sha256"),
                        "assignment_id": row.get("assignment_id"),
                        "attempt": strict_normalize_attempt(adjudication.get("attempt")),
                        "agent_instance_id": row.get("agent_instance_id"),
                        "agent_path": row.get("agent_path"),
                        "agent_thread_id": row.get("agent_thread_id"),
                        "result_ref": row.get("result_ref"),
                        "result_sha256": row.get("result_sha256"),
                        "coverage_credit": 0,
                        "v3_effect": "preserved_zero_credit_validator_infrastructure_lineage_not_substantive_veto",
                    }
                )
                continue
            pre_failure_issues.extend(structural_issues)
        elif row.get("failure_kind") == "postrun_v2_structural_rejection":
            pre_failure_issues.append("unadjudicated structural-rejection receipt")
        assignment_id = row.get("assignment_id")
        if isinstance(assignment_id, str) and assignment_id:
            failures_by_assignment[assignment_id].append(row)
        runner_id = row.get("_scan_runner_id") or row.get("runner_id")
        if isinstance(runner_id, str) and row.get("_synthetic_authority_veto") is not True:
            failures_by_runner[runner_id].append(row)
        attempt, attempt_issues = strict_attempt(row)
        if isinstance(assignment_id, str) and not attempt_issues and attempt:
            explicit_veto_pairs.add((assignment_id, attempt))
        failure_issues: list[str] = list(pre_failure_issues)
        if not isinstance(assignment_id, str) or assignment_id not in expected:
            failure_issues.append("failed/quarantine receipt assignment is not expected")
        else:
            wanted_failure_runner = expected[assignment_id]["runner_id"]
            if row.get("runner_id") not in (None, wanted_failure_runner):
                failure_issues.append("failed/quarantine receipt claimed runner scope spill")
            if row.get("_scan_runner_id") not in (None, wanted_failure_runner):
                failure_issues.append("failed/quarantine receipt physical runner scope spill")
        credit_values = [
            row[name]
            for name in ("coverage_credit", "valid_coverage", "coverage_count")
            if name in row
        ]
        if not credit_values or any(
            not (
                value is False
                or (isinstance(value, int) and not isinstance(value, bool) and value == 0)
            )
            for value in credit_values
        ):
            failure_issues.append("failed/quarantine receipt lacks exact zero credit")
        source_file = row.get("_receipt_file")
        source_line = row.get("_receipt_line")
        initially_anchored = (
            isinstance(source_file, str)
            and isinstance(source_line, int)
            and not isinstance(source_line, bool)
            and source_line <= initial_anchored_line_limits.get(source_file, -1)
        )
        if not initially_anchored:
            if attempt_issues or attempt is None or strict_identity(row) is None:
                failure_issues.append("post-anchor failure lacks full attempt identity")
        if row.get("agent_thread_id") in set(runner_threads.values()):
            failure_issues.append("failed/quarantine attempt reuses a persistent runner root thread")
        if any(
            row.get(name) is True
            for name in ("validation_passed", "valid", "valid_coverage")
        ):
            failure_issues.append("failed/quarantine receipt has a positive validation flag")
        if any(
            str(row.get(name, "")).lower() in POSITIVE_STATUSES
            for name in (
                "validation_status", "status", "result_status", "state",
                "attempt_status", "attempt_state",
            )
        ):
            failure_issues.append("failed/quarantine receipt has a positive status")
        result_ref = first(row, "result_ref", "raw_result_ref", "bad_capture_ref")
        result_hash_claim = (
            hash_field(row, "result")
            or row.get("bad_capture_sha256")
            or row.get("bad_capture_hash")
        )
        result_hash = canonical_sha256(result_hash_claim)
        result_path = repo_path(result_ref)
        if result_hash:
            failed_result_hashes.add(result_hash)
        if result_ref:
            expected_failed_runner_dir = (
                ROOT / "runners" / expected[assignment_id]["runner_id"]
                if isinstance(assignment_id, str) and assignment_id in expected
                else ROOT / "runners"
            )
            if (
                result_path is None
                or not result_path.is_file()
                or not any(
                    under(result_path, expected_failed_runner_dir / directory)
                    for directory in ("raw_results", "failed_attempts")
                )
            ):
                failure_issues.append("failed-attempt raw result missing or out of scope")
            else:
                referenced_raw.add(result_path)
                failed_result_paths.add(result_path.resolve())
                actual_failed_hash = cached_hash(result_path)
                failed_result_hashes.add(actual_failed_hash)
                if result_hash is None:
                    failure_issues.append("failed-attempt raw result hash missing or invalid")
                elif actual_failed_hash != result_hash:
                    failure_issues.append("failed-attempt raw result hash mismatch")
        elif not initially_anchored:
            no_result = row.get("no_result_artifact") is True or row.get("result_not_produced") is True
            reason = first(row, "no_result_reason", "failure_reason", "reason")
            if not no_result or not isinstance(reason, str) or not reason.strip():
                failure_issues.append(
                    "post-anchor failure lacks a bound result or explicit no-result disposition"
                )
        validation_ref = first(
            row, "validation_ref", "failure_validation_ref", "bad_capture_validation_ref"
        )
        validation_path = repo_path(validation_ref)
        if validation_ref:
            expected_failed_validation_dir = (
                ROOT / "runners" / expected[assignment_id]["runner_id"] / "validation"
                if isinstance(assignment_id, str) and assignment_id in expected
                else ROOT / "runners"
            )
            if (
                validation_path is None
                or not validation_path.is_file()
                or not under(validation_path, expected_failed_validation_dir)
            ):
                failure_issues.append(
                    "failed-attempt validation receipt missing or out of scope"
                )
            else:
                validation_hash_claim = (
                    hash_field(row, "validation")
                    or row.get("failure_validation_sha256")
                    or row.get("failure_validation_hash")
                    or row.get("bad_capture_validation_sha256")
                    or row.get("bad_capture_validation_hash")
                )
                validation_hash = canonical_sha256(validation_hash_claim)
                anchor_payload = anchored_validation_payloads.get(receipt_label(row))
                if validation_hash is None and anchor_payload is not None:
                    if anchor_payload.get("validation_ref") != validation_ref:
                        failure_issues.append(
                            "failed-attempt validation ref differs from immutable payload anchor"
                        )
                    validation_hash = canonical_sha256(
                        anchor_payload.get("validation_sha256")
                    )
                    if file_bytes(validation_path) != anchor_payload.get("validation_bytes"):
                        failure_issues.append(
                            "failed-attempt validation byte count differs from immutable payload anchor"
                        )
                elif validation_hash is None:
                    failure_issues.append(
                        "failed-attempt validation receipt lacks a hash and immutable payload anchor"
                    )
                if validation_hash is not None and cached_hash(validation_path) != validation_hash:
                    failure_issues.append("failed-attempt validation hash mismatch")
        if failure_issues:
            quarantine.append(
                {
                    "runner_id": row.get("runner_id") or runner_id,
                    "assignment_id": assignment_id,
                    "attempt_id": attempt,
                    "receipt": receipt_label(row),
                    "reasons": sorted(set(failure_issues)),
                }
            )
            warnings.append(
                f"quarantined malformed zero-credit lineage receipt: {receipt_label(row)}"
            )
            if row.get("_receipt_file") == "coordination/QUARANTINE_REGISTRY.jsonl":
                integrity_errors.append(
                    "root quarantine registry contains semantically invalid lineage: "
                    f"{receipt_label(row)}"
                )
            if any(
                "missing" in reason or "hash mismatch" in reason
                for reason in failure_issues
            ):
                localized_receipt_errors.append(
                    f"failed-attempt immutability evidence missing or changed: {receipt_label(row)}"
                )

    registry_groups: dict[tuple[str, str, str, str], list[dict[str, Any]]] = defaultdict(list)
    registry_row_issues: dict[int, list[str]] = {}
    unkeyed_registry_rows: list[dict[str, Any]] = []
    for row in all_registry_rows:
        assignment_id = row.get("assignment_id")
        row_issues: list[str] = []
        if not isinstance(assignment_id, str) or assignment_id not in expected:
            row_issues.append("registry assignment is missing or not expected")
        else:
            wanted_runner = expected[assignment_id]["runner_id"]
            if row.get("_scan_runner_id") != wanted_runner or row.get("runner_id") != wanted_runner:
                row_issues.append("registry runner scope spill")
        key = strict_base_key(row)
        if key is None:
            _, attempt_issues = strict_attempt(row)
            row_issues.extend(attempt_issues)
            if not row.get("agent_instance_id"):
                row_issues.append("registry agent_instance_id missing")
            if not row.get("agent_path"):
                row_issues.append("registry agent_path missing")
            unkeyed_registry_rows.append(row)
        else:
            registry_groups[key].append(row)
        if row_issues:
            registry_row_issues[id(row)] = sorted(set(row_issues))
            quarantine.append(
                {
                    "runner_id": row.get("runner_id") or row.get("_scan_runner_id"),
                    "assignment_id": assignment_id,
                    "attempt_id": first(row, *ATTEMPT_FIELDS),
                    "receipt": receipt_label(row),
                    "reasons": sorted(set(row_issues)),
                }
            )
            vetoed = any(
                strict_same_veto(row, veto)
                for veto in failures_by_assignment.get(str(assignment_id), [])
            )
            if strict_claims_positive(row) and not vetoed:
                localized_receipt_errors.append(
                    f"unresolved invalid positive registry row: {receipt_label(row)}"
                )

    immutable_group_aliases = (
        ("assignment_id",),
        ("runner_id",),
        ("role",),
        ("window_id",),
        ("doc_id",),
        ("document_path",),
        ("core_range",),
        ("capsule_ref",),
        ("capsule_sha256", "capsule_hash"),
        ("capsule_bytes",),
        ("source_sha256", "source_hash"),
        ("source_excerpt_ref",),
        ("source_excerpt_sha256", "source_excerpt_hash"),
        ("source_excerpt_bytes",),
        ("model",),
        ("reasoning_effort",),
        ("actual_model",),
        ("actual_reasoning_effort",),
        ("prior_substantive_assignment_count",),
        ("terminal_after_result",),
        ("no_followup_reuse",),
        ("fork_turns",),
        ("agent_instance_id",),
        ("agent_path",),
        ("agent_thread_id",),
        ("runner_thread_id",),
        ("created_at",),
    )
    dynamic_group_aliases = (
        ("result_ref", "raw_result_ref"),
        ("result_sha256", "result_hash"),
        ("result_bytes",),
        ("validation_ref",),
        ("validation_sha256", "validation_hash"),
        ("session_ref",),
        ("session_sha256", "session_hash"),
        ("completed_at",),
    )
    group_infos: dict[tuple[str, str, str, str], dict[str, Any]] = {}
    groups_by_full_key: dict[tuple[str, str, str, str, str], dict[str, Any]] = {}
    invalid_attempt_pairs: dict[tuple[str, str], set[str]] = defaultdict(set)
    grouped_attempt_records_by_runner: dict[str, list[dict[str, Any]]] = defaultdict(list)

    for base_key, rows in registry_groups.items():
        assignment_id, attempt, instance, path = base_key
        issues: list[str] = []
        for row in rows:
            issues.extend(registry_row_issues.get(id(row), []))
        thread_values = strict_values(rows, "_native_thread_id")
        thread = thread_values[0] if len(thread_values) == 1 else None
        if len(thread_values) != 1 or not isinstance(thread, str) or not thread:
            issues.append("registry attempt does not resolve to exactly one native thread identity")
        recorded_thread_values = strict_values(rows, "agent_thread_id")
        if len(recorded_thread_values) != 1:
            issues.append("registry attempt does not record exactly one agent_thread_id")
        elif recorded_thread_values[0] != thread:
            issues.append("recorded agent_thread_id does not equal native session identity")
        for aliases in immutable_group_aliases:
            _, conflicts = strict_unique_value(rows, *aliases)
            issues.extend(conflicts)
        for row in rows:
            observed_attempt, attempt_issues = strict_attempt(row)
            if attempt_issues or observed_attempt != attempt:
                issues.append("registry attempt fields conflict after normalization")

        positive_rows = [row for row in rows if strict_claims_positive(row)]
        if len(positive_rows) > 1:
            issues.append("registry attempt has multiple positive completion rows")
        completion = positive_rows[0] if len(positive_rows) == 1 else None
        combined: dict[str, Any] = {}
        for row in rows:
            for name, value in row.items():
                if value is not None and not name.startswith("_receipt_"):
                    combined[name] = value
        if completion is not None:
            combined.update(
                {
                    name: value
                    for name, value in completion.items()
                    if value is not None and not name.startswith("_receipt_")
                }
            )
        combined["attempt"] = int(attempt)
        if thread is not None:
            combined["agent_thread_id"] = thread
            issues.extend(sorted(native_session_violations.get(thread, set())))

        for aliases in dynamic_group_aliases:
            value, conflicts = strict_unique_value(rows, *aliases)
            issues.extend(conflicts)
            if value is not None:
                combined[aliases[0]] = value
        if completion is not None:
            issues.extend(strict_positive_issues(completion, registry=True))
        if not strict_values(rows, "created_at"):
            issues.append("registry attempt lacks created_at")
        if completion is not None and not strict_values(rows, "completed_at"):
            issues.append("registry positive attempt lacks completed_at")

        full_key = (
            assignment_id,
            attempt,
            instance,
            path,
            thread,
        ) if isinstance(thread, str) and thread else None
        if full_key is not None:
            if full_key in groups_by_full_key:
                issues.append("duplicate registry full attempt key")
            groups_by_full_key[full_key] = {
                "base_key": base_key,
                "rows": rows,
                "combined": combined,
                "completion": completion,
                "issues": issues,
                "full_key": full_key,
            }
        info = {
            "base_key": base_key,
            "rows": rows,
            "combined": combined,
            "completion": completion,
            "issues": issues,
            "full_key": full_key,
        }
        group_infos[base_key] = info
        grouped_attempt_records_by_runner[
            str(expected.get(assignment_id, {}).get("runner_id") or rows[0].get("_scan_runner_id"))
        ].append(combined)
        if issues:
            invalid_attempt_pairs[(assignment_id, attempt)].update(issues)

    registry_full_keys = set(groups_by_full_key)

    identity_attempts: dict[str, dict[str, set[tuple[str, str]]]] = {
        field: defaultdict(set) for field in IDENTITY_FIELDS
    }
    attempt_identities: dict[tuple[str, str], set[tuple[str, str, str]]] = defaultdict(set)
    for full_key in registry_full_keys:
        assignment_id, attempt, instance, path, thread = full_key
        pair = (assignment_id, attempt)
        attempt_identities[pair].add((instance, path, thread))
        for field, value in zip(IDENTITY_FIELDS, (instance, path, thread)):
            identity_attempts[field][value].add(pair)
    for row in [
        *all_registry_rows,
        *all_failed_rows,
        *coordination_quarantine,
        *all_auxiliary_rows,
    ]:
        assignment_id = row.get("assignment_id")
        attempt, attempt_issues = strict_attempt(row)
        assignment_marker = (
            assignment_id
            if isinstance(assignment_id, str) and assignment_id
            else f"invalid-assignment:{receipt_label(row)}"
        )
        pair = (
            assignment_marker,
            attempt
            if not attempt_issues and attempt
            else f"unkeyed:{receipt_label(row)}",
        )
        identity = strict_identity(row)
        if identity is not None:
            attempt_identities[pair].add(identity)
        for field in IDENTITY_FIELDS:
            value = strict_identity_field(field, row.get(field))
            if value is not None:
                identity_attempts[field][value].add(pair)

    for field, mapping in identity_attempts.items():
        for value, pairs in mapping.items():
            if len(pairs) <= 1:
                continue
            reason = f"recycled {field}: {value}"
            for pair in pairs:
                invalid_attempt_pairs[pair].add(reason)
    for pair, identities in attempt_identities.items():
        if len(identities) > 1:
            invalid_attempt_pairs[pair].add(
                "assignment attempt number reused across fresh identities"
            )

    manifest_key_errors: dict[int, list[str]] = {}
    manifest_keys: dict[int, tuple[str, str, str, str, str]] = {}
    manifests_by_key: dict[tuple[str, str, str, str, str], list[dict[str, Any]]] = defaultdict(list)
    for index, row in enumerate(all_manifest_rows):
        key, key_issues = strict_manifest_key(row, registry_full_keys)
        if key is None:
            manifest_key_errors[index] = key_issues
        else:
            manifest_keys[index] = key
            manifests_by_key[key].append(row)
    for index, row in enumerate(all_manifest_rows):
        key = manifest_keys.get(index)
        pair = (
            (key[0], key[1])
            if key is not None
            else (
                str(row.get("assignment_id") or f"invalid-assignment:{receipt_label(row)}"),
                f"unkeyed:{receipt_label(row)}",
            )
        )
        identity = strict_identity(row)
        if identity is not None:
            attempt_identities[pair].add(identity)
        for field in IDENTITY_FIELDS:
            value = strict_identity_field(field, row.get(field))
            if value is not None:
                identity_attempts[field][value].add(pair)
    for field, mapping in identity_attempts.items():
        for value, pairs in mapping.items():
            if len(pairs) > 1:
                for pair in pairs:
                    invalid_attempt_pairs[pair].add(f"recycled {field}: {value}")
    for pair, identities in attempt_identities.items():
        if len(identities) > 1:
            invalid_attempt_pairs[pair].add(
                "assignment attempt number reused across fresh identities"
            )

    capsule_cache: dict[str, dict[str, Any]] = {}
    source_lines_cache: dict[str, list[str]] = {}
    eligible_receipts: list[dict[str, Any]] = []
    native_session_proofs: dict[str, dict[str, Any]] = {}
    positive_manifest_keys: set[tuple[str, str, str, str, str]] = set()

    for index, row in enumerate(all_manifest_rows):
        if not strict_claims_positive(row):
            continue
        assignment_id = row.get("assignment_id")
        key = manifest_keys.get(index)
        issues: list[str] = list(manifest_key_errors.get(index, []))
        assignment = expected.get(str(assignment_id))
        if assignment is None:
            issues.append("positive manifest assignment is missing or not expected")
        if key is not None:
            positive_manifest_keys.add(key)
            pair = (key[0], key[1])
        else:
            candidate_attempt, candidate_attempt_issues = strict_attempt(row)
            pair = (
                str(assignment_id),
                candidate_attempt if not candidate_attempt_issues and candidate_attempt else "",
            )
        veto_matches = [
            veto
            for veto in failures_by_assignment.get(str(assignment_id), [])
            if strict_same_veto(row, veto)
        ]
        vetoed = pair in explicit_veto_pairs or bool(veto_matches)
        if pair in KNOWN_REVOKED_ATTEMPTS:
            issues.append("immutable V2 attempt-level revocation")
        if veto_matches:
            issues.append(
                "explicit failed-attempt/quarantine veto: "
                + repr(sorted({receipt_label(veto) for veto in veto_matches}))
            )
        group: dict[str, Any] | None = None
        combined: dict[str, Any] = {}
        completion: dict[str, Any] | None = None
        if key is None:
            issues.append("positive manifest does not resolve to a full registry attempt")
        else:
            group = groups_by_full_key.get(key)
            if group is None:
                issues.append("matching full registry attempt is missing")
            else:
                combined = group["combined"]
                completion = group["completion"]
                issues.extend(group["issues"])
                if completion is None:
                    issues.append("registry attempt has no explicit positive completion")
            if len(manifests_by_key.get(key, [])) != 1:
                issues.append("manifest cardinality is not exactly one for full attempt key")
            if pair in invalid_attempt_pairs:
                issues.extend(sorted(invalid_attempt_pairs[pair]))

        issues.extend(strict_positive_issues(row, registry=False))
        if assignment is not None:
            manifest_required = {
                "runner_id": assignment["runner_id"],
                "role": assignment["role"],
                "window_id": assignment["window_id"],
                "model": assignment["required_model"],
                "reasoning_effort": assignment["required_reasoning_effort"],
                "terminal_after_result": True,
                "no_followup_reuse": True,
            }
            for name, wanted in manifest_required.items():
                if row.get(name) != wanted:
                    issues.append(f"positive manifest {name} mismatch")
            manifest_optional = {
                "audit_id": AUDIT_ID,
                "runner_thread_id": runner_threads.get(assignment["runner_id"]),
                "doc_id": assignment["doc_id"],
                "document_path": assignment["document_path"],
                "core_range": assignment["core_range"],
                "capsule_ref": assignment["capsule_ref"],
                "capsule_bytes": assignment["capsule_bytes"],
                "source_excerpt_ref": assignment["source_excerpt_ref"],
                "source_excerpt_bytes": assignment["source_excerpt_bytes"],
                "prior_substantive_assignment_count": 0,
                "actual_model": assignment["required_model"],
                "actual_reasoning_effort": assignment["required_reasoning_effort"],
            }
            for name, wanted in manifest_optional.items():
                if name in row and row.get(name) != wanted:
                    issues.append(f"positive manifest optional {name} mismatch")
            for stem, wanted in (
                ("capsule", assignment["capsule_sha256"]),
                ("source", assignment["source_sha256"]),
                ("source_excerpt", assignment["source_excerpt_sha256"]),
            ):
                values = strict_values(
                    [row], f"{stem}_sha256", f"{stem}_hash",
                    f"raw_{stem}_sha256", f"raw_{stem}_hash"
                )
                if len(values) > 1:
                    issues.append(f"positive manifest {stem} hash aliases conflict")
                elif values and values[0] != wanted:
                    issues.append(f"positive manifest {stem} hash mismatch")
            if row.get("_scan_runner_id") != assignment["runner_id"]:
                issues.append("positive manifest runner namespace spill")
            if packet_issues.get(assignment["runner_id"]):
                issues.extend(
                    f"runner packet invalid: {problem}"
                    for problem in packet_issues[assignment["runner_id"]]
                )
        if not isinstance(row.get("completed_at"), str) or not row["completed_at"]:
            issues.append("positive manifest completed_at missing")

        capsule: dict[str, Any] = {}
        source_path: Path | None = None
        if assignment is not None:
            capsule_path = repo_path(assignment["capsule_ref"])
            excerpt_path = repo_path(assignment["source_excerpt_ref"])
            source_path = repo_path(assignment["document_path"])
            if capsule_path is None or not capsule_path.is_file():
                issues.append("assigned capsule is missing")
            else:
                local_errors: list[str] = []
                capsule = capsule_cache.setdefault(
                    assignment["assignment_id"],
                    load_json_bound(
                        capsule_path, assignment["capsule_sha256"], local_errors
                    )
                    or {},
                )
                if local_errors or not isinstance(capsule, dict):
                    issues.append("assigned capsule is invalid JSON")
                    capsule = {}
                if cached_hash(capsule_path) != assignment["capsule_sha256"]:
                    issues.append("live assigned capsule hash mismatch")
                if file_bytes(capsule_path) != assignment["capsule_bytes"]:
                    issues.append("live assigned capsule byte count mismatch")
                for name in (
                    "assignment_id",
                    "runner_id",
                    "role",
                    "window_id",
                    "doc_id",
                    "document_path",
                    "core_range",
                    "source_sha256",
                    "source_excerpt_ref",
                    "source_excerpt_sha256",
                    "source_excerpt_bytes",
                ):
                    if capsule.get(name) != assignment.get(name):
                        issues.append(f"capsule {name} mismatch with assignment")
                if capsule.get("blindness") != {
                    "other_reviewer_results": "forbidden",
                    "prior_audits": "forbidden",
                    "unrelated_windows": "forbidden",
                }:
                    issues.append("capsule blindness contract mismatch")
            if excerpt_path is None or not excerpt_path.is_file():
                issues.append("source excerpt is missing")
            else:
                if cached_hash(excerpt_path) != assignment["source_excerpt_sha256"]:
                    issues.append("live source excerpt hash mismatch")
                if file_bytes(excerpt_path) != assignment["source_excerpt_bytes"]:
                    issues.append("live source excerpt byte count mismatch")
            if source_path is None or not source_path.is_file():
                issues.append("canonical source is missing")
            elif cached_hash(source_path) != assignment["source_sha256"]:
                issues.append("live canonical source hash mismatch")
            if group is not None and capsule:
                issues.extend(
                    strict_metadata_issues(
                        combined,
                        assignment,
                        capsule,
                        str(runner_threads.get(assignment["runner_id"]) or ""),
                        {
                            str(value)
                            for value in runner_threads.values()
                            if isinstance(value, str)
                        },
                    )
                )

        result_ref_values = strict_values([row], "result_ref", "raw_result_ref")
        result_hash_values = strict_values(
            [row], "result_sha256", "result_hash", "raw_result_sha256", "raw_result_hash"
        )
        if len(result_ref_values) > 1:
            issues.append("positive manifest result_ref aliases conflict")
        if len(result_hash_values) > 1:
            issues.append("positive manifest result hash aliases conflict")
        result_ref = result_ref_values[0] if len(result_ref_values) == 1 else None
        result_hash = result_hash_values[0] if len(result_hash_values) == 1 else None
        result_bytes = row.get("result_bytes")
        if not isinstance(result_ref, str) or not result_ref:
            issues.append("positive manifest result_ref missing")
        if canonical_sha256(result_hash) is None:
            issues.append("positive manifest result hash missing")
        if not isinstance(result_bytes, int) or isinstance(result_bytes, bool) or result_bytes < 0:
            issues.append("positive manifest result_bytes missing or invalid")
        if group is not None:
            registry_result_ref = first(combined, "result_ref", "raw_result_ref")
            registry_result_hash = hash_field(combined, "result")
            registry_result_bytes = combined.get("result_bytes")
            if registry_result_ref != result_ref:
                issues.append("registry and manifest result_ref mismatch")
            if registry_result_hash != result_hash:
                issues.append("registry and manifest result hash mismatch")
            if registry_result_bytes != result_bytes:
                issues.append("registry and manifest result_bytes mismatch")
            if combined.get("completed_at") != row.get("completed_at"):
                issues.append("registry and manifest completed_at mismatch")

        result_path = repo_path(result_ref)
        if assignment is not None:
            expected_result_dir = ROOT / "runners" / assignment["runner_id"] / "raw_results"
        else:
            expected_result_dir = ROOT / "runners"
        raw: dict[str, Any] | None = None
        raw_result_bytes: bytes | None = None
        if (
            result_path is None
            or not result_path.is_file()
            or not under(result_path, expected_result_dir)
        ):
            issues.append("positive raw result is missing or outside runner namespace")
        else:
            referenced_raw.add(result_path)
            if result_path.resolve() in failed_result_paths:
                issues.append("positive attempt reuses a failed raw-result path")
            if isinstance(result_hash, str) and result_hash in failed_result_hashes:
                issues.append("positive attempt reuses a failed raw-result hash")
            if isinstance(result_hash, str) and cached_hash(result_path) != result_hash:
                issues.append("positive raw result hash mismatch")
            if isinstance(result_bytes, int) and file_bytes(result_path) != result_bytes:
                issues.append("positive raw result byte count mismatch")
            local_errors: list[str] = []
            expected_raw_hash = (
                canonical_sha256(result_hash)
                or checkpoint_runner_artifacts.get(
                    str(result_path.relative_to(ROOT)), {}
                ).get("sha256")
                or ""
            )
            loaded, raw_result_bytes = load_json_with_bytes_bound(
                result_path, expected_raw_hash, local_errors
            )
            if local_errors or not isinstance(loaded, dict):
                issues.append("positive raw result is invalid JSON")
            else:
                raw = loaded
        native_proof: dict[str, Any] = {}
        if assignment is not None and group is not None and result_path is not None:
            native_session_id = combined.get("_native_thread_id")
            native_session_row = (
                checkpoint_native_sessions.get(native_session_id)
                if isinstance(native_session_id, str)
                else None
            )
            native_session_path = (
                checkpoint_native_session_paths.get(native_session_id)
                if isinstance(native_session_id, str)
                else None
            )
            if (
                not isinstance(native_session_id, str)
                or not isinstance(native_session_row, dict)
                or native_session_path is None
            ):
                issues.append("attempt does not resolve to exactly one checkpointed native session")
            elif result_path.is_file() and raw_result_bytes is not None:
                session_refs = strict_values([row, combined], "session_ref")
                if len(session_refs) > 1:
                    issues.append("registry and manifest session_ref conflict")
                elif len(session_refs) == 1:
                    declared_session_path = Path(session_refs[0]) if isinstance(
                        session_refs[0], str
                    ) else None
                    sessions_root = (Path.home() / ".codex" / "sessions").resolve()
                    if (
                        declared_session_path is None
                        or not declared_session_path.is_absolute()
                        or declared_session_path.is_symlink()
                        or not declared_session_path.is_file()
                        or not under(declared_session_path, sessions_root)
                        or declared_session_path.resolve() != native_session_path.resolve()
                    ):
                        issues.append("declared session_ref does not match native session proof")
                session_hashes = strict_values(
                    [row, combined], "session_sha256", "session_hash"
                )
                if len(session_hashes) > 1:
                    issues.append("registry and manifest session hash conflict")
                elif len(session_hashes) == 1 and session_hashes[0] != native_session_row.get(
                    "prefix_sha256"
                ):
                    issues.append("declared session hash does not match checkpointed prefix")
                session_issues, native_proof = strict_native_session_proof(
                    native_session_id,
                    native_session_row,
                    native_session_path,
                    combined,
                    assignment,
                    raw_result_bytes,
                    str(runner_threads.get(assignment["runner_id"]) or ""),
                )
                issues.extend(session_issues)
                runner_input_hashes[f"native_session:{native_session_id}"] = native_session_row.get(
                    "prefix_sha256"
                )
            else:
                issues.append("native session terminal binding lacks captured raw-result bytes")
        if (
            raw is not None
            and assignment is not None
            and capsule
            and key is not None
            and source_path is not None
            and source_path.is_file()
        ):
            try:
                source_bytes = source_path.read_bytes()
                if hashlib.sha256(source_bytes).hexdigest() != assignment["source_sha256"]:
                    raise ValueError("canonical source bytes changed after hash validation")
                source_lines = source_lines_cache.setdefault(
                    assignment["document_path"],
                    source_bytes.decode("utf-8").splitlines(),
                )
            except Exception:
                issues.append("canonical source is not valid UTF-8")
            else:
                issues.extend(strict_raw_issues(raw, assignment, capsule, key, source_lines))

        validation_refs = strict_values(
            [row, combined] if group is not None else [row], "validation_ref"
        )
        validation_hashes = strict_values(
            [row, combined] if group is not None else [row],
            "validation_sha256",
            "validation_hash",
        )
        validation_ref: str | None = None
        validation_hash: str | None = None
        if len(validation_refs) > 1:
            issues.append("registry and manifest validation_ref conflict")
        elif len(validation_refs) == 1:
            validation_ref = validation_refs[0]
        if len(validation_hashes) > 1:
            issues.append("registry and manifest validation hash conflict")
        elif len(validation_hashes) == 1:
            validation_hash = validation_hashes[0]
        if validation_ref is not None and assignment is not None:
            validation_path = repo_path(validation_ref)
            expected_validation_dir = (
                ROOT / "runners" / assignment["runner_id"] / "validation"
            )
            if (
                validation_path is None
                or not validation_path.is_file()
                or not under(validation_path, expected_validation_dir)
            ):
                issues.append("validation receipt missing or outside runner namespace")
            else:
                actual_validation_hash = cached_hash(validation_path)
                if validation_hash is not None and validation_hash != actual_validation_hash:
                    issues.append("validation receipt claimed hash mismatch")
                local_errors: list[str] = []
                validation = load_json_bound(
                    validation_path, actual_validation_hash, local_errors
                )
                if local_errors or not isinstance(validation, dict):
                    issues.append("validation receipt is invalid JSON")
                elif (
                    key is not None
                    and isinstance(result_ref, str)
                    and isinstance(result_hash, str)
                    and isinstance(result_bytes, int)
                ):
                    issues.extend(
                        strict_validation_issues(
                            validation,
                            assignment,
                            key[1],
                            result_ref,
                            result_hash,
                            result_bytes,
                        )
                    )
                validation_hash = actual_validation_hash
        elif validation_hash is not None:
            issues.append("validation hash exists without validation_ref")

        if issues:
            if result_path is not None and result_path.is_file() and under(
                result_path, expected_result_dir
            ):
                actual_invalid_hash = cached_hash(result_path)
                invalid_candidate_result_paths.add(result_path.resolve())
                invalid_candidate_result_hashes.add(actual_invalid_hash)
            quarantine.append(
                {
                    "runner_id": row.get("runner_id") or row.get("_scan_runner_id"),
                    "assignment_id": assignment_id,
                    "attempt_id": key[1] if key is not None else first(row, *ATTEMPT_FIELDS),
                    "receipt": receipt_label(row),
                    "result_ref": result_ref,
                    "result_sha256": (
                        cached_hash(result_path)
                        if result_path is not None and result_path.is_file()
                        else canonical_sha256(result_hash)
                    ),
                    "reasons": sorted(set(issues)),
                }
            )
            if not vetoed:
                localized_receipt_errors.append(
                    f"unresolved invalid positive manifest: {receipt_label(row)}"
                )
            continue

        assert assignment is not None and key is not None
        eligible_receipts.append(
            {
                "assignment_id": assignment_id,
                "runner_id": assignment["runner_id"],
                "attempt": key[1],
                "attempt_identity_key": list(key),
                "agent_instance_id": key[2],
                "agent_path": key[3],
                "agent_thread_id": key[4],
                "result_ref": result_ref,
                "result_sha256": result_hash,
                "result_bytes": result_bytes,
                "validation_ref": validation_ref,
                "validation_sha256": validation_hash,
                "native_session_proof": native_proof,
                "manifest_receipt": receipt_label(row),
                "registry_receipts": sorted(receipt_label(item) for item in group["rows"]),
            }
        )
        if native_proof:
            native_session_proofs[str(assignment_id)] = native_proof

    for group in group_infos.values():
        key = group.get("full_key")
        if group["completion"] is None or (
            key is not None and key in positive_manifest_keys
        ):
            continue
        base_key = group["base_key"]
        pair = (base_key[0], base_key[1])
        vetoed = pair in explicit_veto_pairs or any(
            strict_same_veto(group["combined"], veto)
            for veto in failures_by_assignment.get(base_key[0], [])
        )
        reasons = ["positive registry completion has no resolvable positive manifest"]
        reasons.extend(group["issues"])
        quarantine.append(
            {
                "runner_id": group["combined"].get("runner_id"),
                "assignment_id": base_key[0],
                "attempt_id": base_key[1],
                "receipt": ",".join(receipt_label(row) for row in group["rows"]),
                "reasons": sorted(set(reasons)),
            }
        )
        if not vetoed:
            localized_receipt_errors.append(
                f"unresolved positive registry attempt without manifest: {key[0]}:attempt-{key[1]}"
                if key is not None
                else f"unresolved positive registry attempt without full identity: {base_key[0]}:attempt-{base_key[1]}"
            )

    reuse_safe_receipts: list[dict[str, Any]] = []
    for receipt in eligible_receipts:
        path = repo_path(receipt.get("result_ref"))
        result_hash = receipt.get("result_sha256")
        if (
            path is not None
            and path.resolve() in invalid_candidate_result_paths
        ) or (
            isinstance(result_hash, str)
            and result_hash in invalid_candidate_result_hashes
        ):
            quarantine.append(
                {
                    "runner_id": receipt.get("runner_id"),
                    "assignment_id": receipt.get("assignment_id"),
                    "attempt_id": receipt.get("attempt"),
                    "receipt": receipt.get("manifest_receipt"),
                    "result_ref": receipt.get("result_ref"),
                    "result_sha256": receipt.get("result_sha256"),
                    "reasons": [
                        "positive result path or bytes are reused by an invalid zero-credit candidate"
                    ],
                }
            )
            localized_receipt_errors.append(
                "positive candidate reuses invalid-attempt artifact: "
                f"{receipt.get('manifest_receipt')}"
            )
        else:
            reuse_safe_receipts.append(receipt)
    eligible_receipts = reuse_safe_receipts

    receipts_by_assignment: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for receipt in eligible_receipts:
        receipts_by_assignment[str(receipt["assignment_id"])].append(receipt)
    valid_receipts: list[dict[str, Any]] = []
    valid_results: set[str] = set()
    for assignment_id, receipts in receipts_by_assignment.items():
        ordered_receipts = sorted(
            receipts,
            key=lambda receipt: (
                int(str(receipt.get("attempt")))
                if str(receipt.get("attempt", "")).isdigit()
                else 10**18,
                str(receipt.get("agent_instance_id")),
                str(receipt.get("manifest_receipt")),
            ),
        )
        winner = ordered_receipts[0]
        valid_results.add(assignment_id)
        valid_receipts.append(winner)
        if len(ordered_receipts) > 1:
            warnings.append(
                f"deterministically selected earliest valid attempt for assignment: {assignment_id}"
            )
            for receipt in ordered_receipts[1:]:
                quarantine.append(
                    {
                        "runner_id": receipt.get("runner_id"),
                        "assignment_id": assignment_id,
                        "attempt_id": receipt.get("attempt"),
                        "receipt": receipt.get("manifest_receipt"),
                        "reasons": [
                            "redundant later valid attempt; earliest valid attempt receives the assignment credit"
                        ],
                    }
                )

    strict_v3_results = set(valid_results)
    strict_v3_receipts = list(valid_receipts)

    # Alert 0003 requires the independently crosschecked V2 set to remain a
    # monotonic floor.  V3 may invalidate a floor receipt only on new live
    # immutable contradiction (missing/changed result bytes, deleted positive
    # manifest lineage, explicit same-attempt veto, or actual identity reuse),
    # never merely because V3 adds stricter prospective receipt fields.
    v2_floor_invalidations: list[dict[str, Any]] = []
    surviving_v2_floor_receipts: list[dict[str, Any]] = []

    for assignment_id, floor in sorted(v2_floor_receipts.items()):
        issues: list[str] = []
        assignment = expected.get(assignment_id)
        floor_attempt = strict_normalize_attempt(floor.get("attempt"))
        if assignment is None:
            issues.append("floor assignment is absent from sealed manifest")
        result_ref = floor.get("result_ref")
        result_hash = canonical_sha256(floor.get("result_sha256"))
        result_path = repo_path(result_ref)
        expected_result_dir = (
            ROOT / "runners" / str(floor.get("runner_id")) / "raw_results"
        )
        if (
            result_path is None
            or not result_path.is_file()
            or not under(result_path, expected_result_dir)
        ):
            issues.append("floor raw result is missing or outside its runner namespace")
        elif result_hash is None or cached_hash(result_path) != result_hash:
            issues.append("floor raw result bytes no longer match the crosschecked hash")

        manifest_matches = [
            row
            for row in all_manifest_rows
            if row.get("assignment_id") == assignment_id
            and row.get("agent_instance_id") == floor.get("agent_instance_id")
            and hash_field(row, "result") == result_hash
            and first(row, "result_ref", "raw_result_ref") == result_ref
        ]
        if len(manifest_matches) != 1:
            issues.append(
                "crosschecked floor manifest lineage is missing, changed, or duplicated"
            )
            manifest = {}
        else:
            manifest = manifest_matches[0]
            if not strict_claims_positive(manifest):
                issues.append("crosschecked floor manifest is no longer explicitly positive")

        floor_attempt_candidates = {
            attempt
            for evidence_row in [floor, manifest, *all_registry_rows]
            if evidence_row.get("assignment_id") == assignment_id
            and evidence_row.get("agent_instance_id") == floor.get("agent_instance_id")
            and (
                evidence_row is floor
                or evidence_row is manifest
                or first(evidence_row, "result_ref", "raw_result_ref") == result_ref
            )
            for attempt in [strict_attempt(evidence_row)[0]]
            if attempt is not None
        }
        if floor_attempt is not None:
            floor_attempt_candidates.add(floor_attempt)
        floor_attempt_inferred = False
        if len(floor_attempt_candidates) > 1:
            issues.append("crosschecked floor lineage has conflicting attempt numbers")
        elif len(floor_attempt_candidates) == 1:
            floor_attempt = next(iter(floor_attempt_candidates))
        else:
            # The independently crosschecked V2 floor contains two original
            # attempt rows captured before attempt fields became mandatory.
            # Their immutable, single-manifest initial lineage is normalized
            # to attempt 1 solely for floor-veto joins; this is not available
            # to prospective V3 receipts.
            floor_attempt = "1"
            floor_attempt_inferred = True

        if manifest and any(
            strict_floor_veto_matches(
                {**floor, "attempt": floor_attempt}, manifest, veto
            )
            for veto in failures_by_assignment.get(assignment_id, [])
        ):
            issues.append("crosschecked floor attempt now has an explicit immutable veto")
        if floor_attempt is not None and (
            assignment_id,
            floor_attempt,
        ) in explicit_veto_pairs:
            issues.append("crosschecked floor assignment/attempt is explicitly vetoed")

        floor_native_session_id = manifest.get("_native_thread_id") if manifest else None
        floor_identity = {
            "agent_instance_id": floor.get("agent_instance_id"),
            "agent_thread_id": floor_native_session_id or floor.get("agent_thread_id"),
            "agent_path": manifest.get("agent_path") if manifest else None,
        }
        floor_pair = (assignment_id, floor_attempt)
        pair_identity_values: dict[str, set[str]] = defaultdict(set)
        all_floor_evidence = [
            *all_registry_rows,
            *all_manifest_rows,
            *all_failed_rows,
            *coordination_quarantine,
            *all_auxiliary_rows,
        ]
        for evidence_row in all_floor_evidence:
            evidence_attempt, evidence_attempt_issues = strict_attempt(evidence_row)
            if (
                evidence_attempt_issues
                or evidence_row.get("assignment_id") != assignment_id
                or evidence_attempt != floor_attempt
            ):
                continue
            for name in IDENTITY_FIELDS:
                raw_value = (
                    evidence_row.get("_native_thread_id")
                    or evidence_row.get(name)
                    if name == "agent_thread_id"
                    else evidence_row.get(name)
                )
                value = strict_identity_field(name, raw_value)
                if value is not None:
                    pair_identity_values[name].add(value)
        for name, values in pair_identity_values.items():
            if len(values) > 1:
                issues.append(
                    f"floor assignment/attempt reuses multiple {name} values"
                )
            expected_identity_value = strict_identity_field(
                name, floor_identity.get(name)
            )
            if (
                expected_identity_value is not None
                and values
                and values != {expected_identity_value}
            ):
                issues.append(
                    f"floor assignment/attempt {name} differs from its sealed identity"
                )
        for name, value in floor_identity.items():
            if value is None:
                continue
            used_pairs: set[tuple[str, str]] = set()
            ungoverned_partial_reuse: list[str] = []
            for evidence_row in all_floor_evidence:
                observed_value = (
                    evidence_row.get("_native_thread_id")
                    or evidence_row.get(name)
                    if name == "agent_thread_id"
                    else evidence_row.get(name)
                )
                if observed_value != value:
                    continue
                evidence_attempt, evidence_attempt_issues = strict_attempt(
                    evidence_row
                )
                evidence_assignment = evidence_row.get("assignment_id")
                if (
                    isinstance(evidence_assignment, str)
                    and evidence_assignment
                    and not evidence_attempt_issues
                    and evidence_attempt is not None
                ):
                    used_pairs.add((evidence_assignment, evidence_attempt))
                    continue
                receipt_file = str(evidence_row.get("_receipt_file") or "")
                governed_pre_attempt_floor_lineage = (
                    evidence_assignment == assignment_id
                    and evidence_row.get("agent_instance_id")
                    == floor.get("agent_instance_id")
                    and first(evidence_row, "result_ref", "raw_result_ref")
                    == result_ref
                    and hash_field(evidence_row, "result") == result_hash
                    and (
                        receipt_file.endswith(
                            (
                                "fresh_agent_assignment_registry.jsonl",
                                "result_manifest.jsonl",
                            )
                        )
                        or (
                            evidence_row.get("_artifact_semantic_class")
                            == "validation_artifact"
                            and evidence_row.get("validation_passed") is True
                        )
                    )
                    and strict_claims_positive(evidence_row)
                )
                if not governed_pre_attempt_floor_lineage:
                    ungoverned_partial_reuse.append(receipt_label(evidence_row))
            if used_pairs - {floor_pair}:
                issues.append(f"floor {name} is reused by another attempt identity")
            if ungoverned_partial_reuse:
                issues.append(
                    f"floor {name} is reused by malformed/unkeyed evidence: "
                    f"{sorted(set(ungoverned_partial_reuse))}"
                )

        if floor_attempt is not None and (assignment_id, floor_attempt) in KNOWN_REVOKED_ATTEMPTS:
            issues.append("floor attempt is in the immutable revoked-attempt set")
        if isinstance(floor_native_session_id, str):
            issues.extend(sorted(native_session_violations.get(floor_native_session_id, set())))
            floor_session_row = checkpoint_native_sessions.get(floor_native_session_id)
            floor_session_path = checkpoint_native_session_paths.get(
                floor_native_session_id
            )
            if not isinstance(floor_session_row, dict) or floor_session_path is None:
                issues.append("floor native session is absent from the pinned checkpoint")
            else:
                _floor_bytes, floor_closure_issues = strict_read_closed_native_session(
                    floor_session_path, floor_session_row
                )
                issues.extend(floor_closure_issues)
        else:
            issues.append("floor attempt lacks a checkpointed native session")

        if issues:
            v2_floor_invalidations.append(
                {
                    "assignment_id": assignment_id,
                    "runner_id": floor.get("runner_id"),
                    "attempt": floor_attempt,
                    "result_ref": result_ref,
                    "result_sha256": result_hash,
                    "reasons": sorted(set(issues)),
                }
            )
            continue

        surviving_v2_floor_receipts.append(
            {
                **floor,
                "attempt": floor_attempt,
                "agent_path": manifest.get("agent_path") if manifest else None,
                "result_bytes": file_bytes(result_path) if result_path is not None and result_path.is_file() else None,
                "manifest_receipt": receipt_label(manifest) if manifest else None,
                "native_session_id": floor_native_session_id,
                "credit_provenance": [
                    "v2_crosschecked_floor_20260710T0343Z",
                    *(
                        ["v2_pre_attempt_field_normalized_to_attempt_1"]
                        if floor_attempt_inferred
                        else []
                    ),
                ],
            }
        )

    strict_receipts_by_assignment = {
        str(receipt["assignment_id"]): receipt for receipt in valid_receipts
    }
    final_receipts_by_assignment: dict[str, dict[str, Any]] = {
        str(receipt["assignment_id"]): receipt
        for receipt in surviving_v2_floor_receipts
    }
    for assignment_id, receipt in sorted(strict_receipts_by_assignment.items()):
        floor_receipt = final_receipts_by_assignment.get(assignment_id)
        if floor_receipt is None:
            final_receipts_by_assignment[assignment_id] = receipt
            continue
        if (
            floor_receipt.get("result_sha256") == receipt.get("result_sha256")
            and floor_receipt.get("agent_instance_id") == receipt.get("agent_instance_id")
        ):
            enriched = dict(receipt)
            enriched["credit_provenance"] = [
                "v2_crosschecked_floor_20260710T0343Z",
                "v3_strict_recomputation",
            ]
            final_receipts_by_assignment[assignment_id] = enriched
            continue
        warnings.append(
            "redundant later V3-valid attempt exists for already crosschecked floor assignment: "
            f"{assignment_id}"
        )
        quarantine.append(
            {
                "runner_id": receipt.get("runner_id"),
                "assignment_id": assignment_id,
                "attempt_id": receipt.get("attempt"),
                "receipt": receipt.get("manifest_receipt"),
                "result_ref": receipt.get("result_ref"),
                "result_sha256": receipt.get("result_sha256"),
                "reasons": [
                    "assignment already has an immutable crosschecked V2 floor credit"
                ],
            }
        )

    valid_receipts = sorted(
        final_receipts_by_assignment.values(),
        key=lambda item: str(item.get("assignment_id")),
    )
    valid_results = set(final_receipts_by_assignment)

    for runner_id in per_runner:
        per_runner[runner_id]["validated_results"] = sum(
            1 for receipt in valid_receipts if receipt["runner_id"] == runner_id
        )

    for path in sorted(raw_files):
        runner_input_hashes[str(path.relative_to(ROOT))] = cached_hash(path)

    unmanifested_raw = sorted(
        str(path.relative_to(ROOT)) for path in raw_files - referenced_raw
    )
    if unmanifested_raw:
        warnings.append(f"{len(unmanifested_raw)} raw result files are not bound to credit or failure receipts")

    unresolved_attempts: list[str] = []
    for base_key, group in group_infos.items():
        assignment_id, attempt, _, _ = base_key
        pair = (assignment_id, attempt)
        vetoed = pair in explicit_veto_pairs or any(
            strict_same_veto(group["combined"], veto)
            for veto in failures_by_assignment.get(assignment_id, [])
        )
        if group["completion"] is None and not vetoed:
            unresolved_attempts.append(
                f"{assignment_id}:attempt-{attempt}:{group['combined'].get('agent_instance_id')}"
            )
    for row in unkeyed_registry_rows:
        vetoed = any(
            strict_same_veto(row, veto)
            for veto in failures_by_assignment.get(str(row.get("assignment_id")), [])
        )
        if not vetoed:
            unresolved_attempts.append(
                f"unkeyed:{row.get('assignment_id')}:{receipt_label(row)}"
            )

    # Re-read every prospective winner as a complete, terminally closed native
    # session before it can enter accounting.  A failure removes only that
    # assignment's V3 candidate; an independently sealed V2 floor receipt for
    # the same assignment remains intact.
    closure_failed_assignments: set[str] = set()
    for receipt in strict_v3_receipts:
        proof = receipt.get("native_session_proof")
        session_id = proof.get("session_id") if isinstance(proof, dict) else None
        session_row = (
            checkpoint_native_sessions.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        session_path = (
            checkpoint_native_session_paths.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        if not isinstance(session_row, dict) or session_path is None:
            closure_issues = ["prospective winner lacks checkpointed native session"]
        else:
            _closed_bytes, closure_issues = strict_read_closed_native_session(
                session_path, session_row
            )
        if not closure_issues:
            continue
        assignment_id = str(receipt.get("assignment_id"))
        closure_failed_assignments.add(assignment_id)
        localized_receipt_errors.append(
            "prospective native session failed transaction closure recheck: "
            f"{receipt.get('manifest_receipt')}"
        )
        quarantine.append(
            {
                "runner_id": receipt.get("runner_id"),
                "assignment_id": assignment_id,
                "attempt_id": receipt.get("attempt"),
                "receipt": receipt.get("manifest_receipt"),
                "reasons": sorted(set(closure_issues)),
            }
        )
    if closure_failed_assignments:
        strict_v3_receipts = [
            receipt
            for receipt in strict_v3_receipts
            if str(receipt.get("assignment_id")) not in closure_failed_assignments
        ]
        strict_v3_results = {
            assignment_id
            for assignment_id in strict_v3_results
            if assignment_id not in closure_failed_assignments
        }
        floor_receipts_by_assignment = {
            str(receipt["assignment_id"]): receipt
            for receipt in surviving_v2_floor_receipts
        }
        for assignment_id in closure_failed_assignments:
            if assignment_id in floor_receipts_by_assignment:
                final_receipts_by_assignment[assignment_id] = (
                    floor_receipts_by_assignment[assignment_id]
                )
            else:
                final_receipts_by_assignment.pop(assignment_id, None)
        valid_receipts = sorted(
            final_receipts_by_assignment.values(),
            key=lambda item: str(item.get("assignment_id")),
        )
        valid_results = set(final_receipts_by_assignment)
        for runner_id in per_runner:
            per_runner[runner_id]["validated_results"] = sum(
                1
                for receipt in valid_receipts
                if receipt.get("runner_id") == runner_id
            )

    completion_attempt_records_by_runner = strict_completion_attempt_records(
        [
            *all_registry_rows,
            *all_manifest_rows,
            *all_failed_rows,
            *coordination_quarantine,
            *all_auxiliary_rows,
        ],
        expected,
    )
    completion_failed_attempt_records_by_runner = strict_completion_attempt_records(
        [
            *all_failed_rows,
            *coordination_quarantine,
            *negative_manifest_rows,
            *terminal_negative_registry_rows,
            *auxiliary_failure_rows,
        ],
        expected,
    )
    completion_validation: dict[str, dict[str, Any]] = {}
    valid_complete_receipts = 0
    for runner_id in sorted(expected_runner_ids):
        if runner_id not in complete_receipts:
            completion_validation[runner_id] = {
                "present": False,
                "valid": False,
                "issues": [],
                "hashes": {},
            }
            continue
        receipt = complete_receipts.get(runner_id)
        issues = list(complete_load_errors.get(runner_id, []))
        recomputed_issues, hashes = strict_completion_issues(
            runner_id,
            receipt,
            str(runner_threads.get(runner_id) or ""),
            expected_by_runner.get(runner_id, []),
            valid_results,
            completion_attempt_records_by_runner.get(runner_id, []),
            completion_failed_attempt_records_by_runner.get(runner_id, []),
            checkpoint_runner_artifacts,
        )
        issues.extend(recomputed_issues)
        if unreceipted_native_by_runner.get(runner_id, 0):
            issues.append(
                "RUNNER_COMPLETE omits checkpointed native reviewer sessions without receipts"
            )
        issues = sorted(set(issues))
        valid = not issues
        if valid:
            valid_complete_receipts += 1
            per_runner[runner_id]["runner_complete_valid"] = True
        else:
            localized_receipt_errors.append(
                f"invalid or premature RUNNER_COMPLETE receipt: {runner_id}"
            )
        completion_validation[runner_id] = {
            "present": True,
            "valid": valid,
            "issues": issues,
            "hashes": hashes,
        }

    mechanically_pending_assignments = len(expected) - len(valid_results)
    if args.final:
        final_errors.append(
            "final mode: V3 is live per-assignment credit authority only; an immutable "
            "post-run lineage reseal and superseding final validator authority are required"
        )
        if mechanically_pending_assignments:
            final_errors.append(
                f"final mode: {mechanically_pending_assignments} assignments lack exactly one valid result"
            )
        if valid_complete_receipts != 12:
            final_errors.append(
                f"final mode: expected 12 valid RUNNER_COMPLETE receipts, found {valid_complete_receipts}"
            )
        if unmanifested_raw:
            final_errors.append(
                f"final mode: {len(unmanifested_raw)} unbound raw result files remain"
            )
        if unresolved_attempts:
            final_errors.append(
                f"final mode: {len(unresolved_attempts)} unresolved dispatched attempts remain"
            )
        if open_infrastructure_rows:
            final_errors.append(
                f"final mode: {len(open_infrastructure_rows)} open runner infrastructure issues remain"
            )
        if unreceipted_native_sessions:
            final_errors.append(
                f"final mode: {len(unreceipted_native_sessions)} native reviewer sessions lack runner receipts"
            )

    for ref, stream_row in lineage_streams.items():
        if stream_row.get("state") != "present":
            continue
        path = ROOT / ref
        try:
            closing_hash = sha256_prefix(path, stream_row["prefix_bytes"])
        except Exception:
            closing_hash = None
        if closing_hash != stream_row.get("prefix_sha256"):
            integrity_errors.append(
                f"checkpointed lineage prefix changed before transaction close: {ref}"
            )
    for session_id, session_row in checkpoint_native_sessions.items():
        path = checkpoint_native_session_paths.get(session_id)
        try:
            closing_hash = (
                sha256_prefix(path, session_row["prefix_bytes"])
                if path is not None
                else None
            )
        except Exception:
            closing_hash = None
        if closing_hash != session_row.get("prefix_sha256"):
            integrity_errors.append(
                "checkpointed native-session prefix changed before transaction close: "
                f"{session_id}"
            )
    # A second closure check catches append/replace races after prospective
    # accounting.  The affected attempt alone loses prospective credit; an
    # unrelated valid assignment and the grandfathered V2 floor are preserved.
    late_closure_failed_assignments: set[str] = set()
    late_closure_failed_runners: set[str] = set()
    for receipt in strict_v3_receipts:
        proof = receipt.get("native_session_proof")
        session_id = proof.get("session_id") if isinstance(proof, dict) else None
        session_row = (
            checkpoint_native_sessions.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        session_path = (
            checkpoint_native_session_paths.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        if not isinstance(session_row, dict) or session_path is None:
            closing_issues = ["missing prospective native-session seal"]
        else:
            _closed_bytes, closing_issues = strict_read_closed_native_session(
                session_path, session_row
            )
        if closing_issues:
            assignment_id = str(receipt.get("assignment_id"))
            late_closure_failed_assignments.add(assignment_id)
            late_closure_failed_runners.add(str(receipt.get("runner_id")))
            localized_receipt_errors.append(
                "prospective native session changed before transaction close: "
                f"{receipt.get('manifest_receipt')}"
            )
            quarantine.append(
                {
                    "runner_id": receipt.get("runner_id"),
                    "assignment_id": assignment_id,
                    "attempt_id": receipt.get("attempt"),
                    "receipt": receipt.get("manifest_receipt"),
                    "reasons": sorted(set(closing_issues)),
                }
            )
    if late_closure_failed_assignments:
        strict_v3_receipts = [
            receipt
            for receipt in strict_v3_receipts
            if str(receipt.get("assignment_id"))
            not in late_closure_failed_assignments
        ]
        strict_v3_results -= late_closure_failed_assignments
        floor_receipts_by_assignment = {
            str(receipt["assignment_id"]): receipt
            for receipt in surviving_v2_floor_receipts
        }
        for assignment_id in late_closure_failed_assignments:
            if assignment_id in floor_receipts_by_assignment:
                final_receipts_by_assignment[assignment_id] = (
                    floor_receipts_by_assignment[assignment_id]
                )
            else:
                final_receipts_by_assignment.pop(assignment_id, None)
        valid_receipts = sorted(
            final_receipts_by_assignment.values(),
            key=lambda item: str(item.get("assignment_id")),
        )
        valid_results = set(final_receipts_by_assignment)
        mechanically_pending_assignments = len(expected) - len(valid_results)
        for runner_id in per_runner:
            per_runner[runner_id]["validated_results"] = sum(
                1
                for receipt in valid_receipts
                if receipt.get("runner_id") == runner_id
            )
        for runner_id in late_closure_failed_runners:
            detail = completion_validation.get(runner_id)
            if isinstance(detail, dict) and detail.get("valid") is True:
                detail["valid"] = False
                detail["issues"] = sorted(
                    set(detail.get("issues", []))
                    | {"prospective native session changed before transaction close"}
                )
                per_runner[runner_id]["runner_complete_valid"] = False
        valid_complete_receipts = sum(
            int(detail.get("valid") is True)
            for detail in completion_validation.values()
            if isinstance(detail, dict)
        )
        if args.final:
            final_errors.append(
                "final mode: a prospectively eligible native session changed before "
                "transaction close"
            )
    for ref, artifact_row in checkpoint_runner_artifacts.items():
        if (
            artifact_row.get("state") != "present"
            or artifact_row.get("semantic_class") == "checkpoint_metadata"
        ):
            continue
        path = ROOT / ref
        if (
            not path.is_file()
            or path.is_symlink()
            or file_bytes(path) != artifact_row.get("bytes")
            or sha256(path) != artifact_row.get("sha256")
        ):
            integrity_errors.append(
                f"checkpointed runner artifact changed before transaction close: {ref}"
            )
    for path, wanted in file_hash_cache.items():
        if not path.is_file() or sha256(path) != wanted:
            integrity_errors.append(
                f"semantic input changed before transaction close: {transaction_key(path)}"
            )
    for key, wanted in transaction_input_hashes.items():
        if key.startswith("repo:"):
            path = REPO / key.removeprefix("repo:")
        elif key.startswith("external:"):
            continue
        else:
            path = ROOT / key
        if not path.is_file() or sha256(path) != wanted:
            integrity_errors.append(
                f"transaction input changed before close: {key}"
            )
    runner_jsonl_set_at_close = {
        ref for ref in lineage_streams if (ROOT / ref).is_file()
    }
    if runner_jsonl_set_at_close != authoritative_runner_jsonl_set_at_start:
        integrity_errors.append("runner JSONL namespace membership changed during validation")
    runner_artifact_set_at_close = {
        ref
        for ref, row in checkpoint_runner_artifacts.items()
        if row.get("semantic_class") != "checkpoint_metadata"
        and (ROOT / ref).is_file()
    }
    if runner_artifact_set_at_close != authoritative_runner_artifact_set_at_start:
        integrity_errors.append("runner artifact namespace membership changed during validation")
    if not checkpoint_path.is_file() or sha256(checkpoint_path) != checkpoint_hash:
        integrity_errors.append("selected lineage checkpoint changed during validation")
    if sha256(HERE) != validator_start_sha256:
        integrity_errors.append("validator executable changed during validation")

    # This is the final filesystem read in the credit transaction.  Reclose
    # every floor and prospective session after all other input, namespace,
    # checkpoint, and executable checks so a late append cannot retain credit.
    final_floor_closure_failures: dict[str, list[str]] = {}
    for receipt in surviving_v2_floor_receipts:
        assignment_id = str(receipt.get("assignment_id"))
        session_id = receipt.get("native_session_id")
        session_row = (
            checkpoint_native_sessions.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        session_path = (
            checkpoint_native_session_paths.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        if not isinstance(session_row, dict) or session_path is None:
            final_floor_closure_failures[assignment_id] = [
                "floor session seal is missing at final transaction close"
            ]
            continue
        _closed_floor, final_floor_issues = strict_read_closed_native_session(
            session_path, session_row
        )
        if final_floor_issues:
            final_floor_closure_failures[assignment_id] = sorted(
                set(final_floor_issues)
            )

    final_strict_closure_failures: dict[str, list[str]] = {}
    for receipt in strict_v3_receipts:
        assignment_id = str(receipt.get("assignment_id"))
        proof = receipt.get("native_session_proof")
        session_id = proof.get("session_id") if isinstance(proof, dict) else None
        session_row = (
            checkpoint_native_sessions.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        session_path = (
            checkpoint_native_session_paths.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        if not isinstance(session_row, dict) or session_path is None:
            final_strict_closure_failures[assignment_id] = [
                "prospective session seal is missing at final transaction close"
            ]
            continue
        _closed_strict, final_strict_issues = strict_read_closed_native_session(
            session_path, session_row
        )
        if final_strict_issues:
            final_strict_closure_failures[assignment_id] = sorted(
                set(final_strict_issues)
            )

    if final_floor_closure_failures or final_strict_closure_failures:
        for assignment_id, reasons in sorted(final_floor_closure_failures.items()):
            receipt = next(
                (
                    item
                    for item in surviving_v2_floor_receipts
                    if str(item.get("assignment_id")) == assignment_id
                ),
                {},
            )
            localized_receipt_errors.append(
                f"preserved V2 floor session changed at final transaction close: {assignment_id}"
            )
            v2_floor_invalidations.append(
                {
                    "assignment_id": assignment_id,
                    "runner_id": receipt.get("runner_id"),
                    "attempt": receipt.get("attempt"),
                    "result_ref": receipt.get("result_ref"),
                    "result_sha256": receipt.get("result_sha256"),
                    "reasons": reasons,
                }
            )
        surviving_v2_floor_receipts = [
            receipt
            for receipt in surviving_v2_floor_receipts
            if str(receipt.get("assignment_id")) not in final_floor_closure_failures
        ]
        for assignment_id, reasons in sorted(final_strict_closure_failures.items()):
            receipt = next(
                (
                    item
                    for item in strict_v3_receipts
                    if str(item.get("assignment_id")) == assignment_id
                ),
                {},
            )
            localized_receipt_errors.append(
                f"prospective native session changed at final transaction close: "
                f"{receipt.get('manifest_receipt')}"
            )
            quarantine.append(
                {
                    "runner_id": receipt.get("runner_id"),
                    "assignment_id": assignment_id,
                    "attempt_id": receipt.get("attempt"),
                    "receipt": receipt.get("manifest_receipt"),
                    "reasons": reasons,
                }
            )
        strict_v3_receipts = [
            receipt
            for receipt in strict_v3_receipts
            if str(receipt.get("assignment_id")) not in final_strict_closure_failures
        ]
        strict_v3_results = {
            str(receipt.get("assignment_id")) for receipt in strict_v3_receipts
        }
        final_receipts_by_assignment = {
            str(receipt["assignment_id"]): receipt
            for receipt in surviving_v2_floor_receipts
        }
        for receipt in strict_v3_receipts:
            assignment_id = str(receipt["assignment_id"])
            floor_receipt = final_receipts_by_assignment.get(assignment_id)
            if floor_receipt is None:
                final_receipts_by_assignment[assignment_id] = receipt
            elif (
                floor_receipt.get("result_sha256") == receipt.get("result_sha256")
                and floor_receipt.get("agent_instance_id")
                == receipt.get("agent_instance_id")
            ):
                enriched = dict(receipt)
                enriched["credit_provenance"] = [
                    "v2_crosschecked_floor_20260710T0343Z",
                    "v3_strict_recomputation",
                ]
                final_receipts_by_assignment[assignment_id] = enriched
        valid_receipts = sorted(
            final_receipts_by_assignment.values(),
            key=lambda item: str(item.get("assignment_id")),
        )
        valid_results = set(final_receipts_by_assignment)
        mechanically_pending_assignments = len(expected) - len(valid_results)
        affected_assignment_ids = (
            set(final_floor_closure_failures)
            | set(final_strict_closure_failures)
        )
        affected_runners = {
            str(expected[assignment_id].get("runner_id"))
            for assignment_id in affected_assignment_ids
            if assignment_id in expected
        }
        for runner_id in per_runner:
            per_runner[runner_id]["validated_results"] = sum(
                1
                for receipt in valid_receipts
                if receipt.get("runner_id") == runner_id
            )
        for runner_id in affected_runners:
            detail = completion_validation.get(runner_id)
            if isinstance(detail, dict) and detail.get("valid") is True:
                detail["valid"] = False
                detail["issues"] = sorted(
                    set(detail.get("issues", []))
                    | {"credited native session changed at final transaction close"}
                )
                per_runner[runner_id]["runner_complete_valid"] = False
        valid_complete_receipts = sum(
            int(detail.get("valid") is True)
            for detail in completion_validation.values()
            if isinstance(detail, dict)
        )

    anchor_integrity_passed = all(
        value == "pass" for value in seal_checks.values()
    )
    credit_integrity_passed = anchor_integrity_passed and not integrity_errors
    floor_authority_integrity_passed = (
        credit_integrity_passed
        and
        seal_checks.get("v2_crosschecked_floor_snapshot") == "pass"
        and seal_checks.get("v2_crosschecked_floor_receipt") == "pass"
        and seal_checks.get("protocol_alert_0003") == "pass"
        and len(v2_floor_receipts) == 19
    )
    preserved_floor_results = (
        {
            str(receipt["assignment_id"])
            for receipt in surviving_v2_floor_receipts
        }
        if floor_authority_integrity_passed
        else set()
    )
    v3_new_credit_results = (
        strict_v3_results - preserved_floor_results if credit_integrity_passed else set()
    )
    credited_results = preserved_floor_results | v3_new_credit_results
    credited_receipt_map: dict[str, dict[str, Any]] = {}
    if floor_authority_integrity_passed:
        credited_receipt_map.update(
            {
                str(receipt["assignment_id"]): receipt
                for receipt in surviving_v2_floor_receipts
            }
        )
    if credit_integrity_passed:
        for receipt in strict_v3_receipts:
            assignment_id = str(receipt["assignment_id"])
            if assignment_id in preserved_floor_results:
                enriched = dict(receipt)
                enriched["credit_provenance"] = [
                    "v2_crosschecked_floor_20260710T0343Z",
                    "v3_strict_recomputation",
                ]
                credited_receipt_map[assignment_id] = enriched
            else:
                enriched = dict(receipt)
                enriched["credit_provenance"] = ["v3_strict_recomputation"]
                credited_receipt_map[assignment_id] = enriched
    credited_receipts = sorted(
        credited_receipt_map.values(), key=lambda item: str(item.get("assignment_id"))
    )
    pending_assignments = len(expected) - len(credited_results)

    quarantine_by_key: dict[str, dict[str, Any]] = {}
    for item in quarantine:
        key = strict_canonical(
            [
                item.get("runner_id"),
                item.get("assignment_id"),
                item.get("attempt_id"),
                item.get("receipt"),
            ]
        )
        if key not in quarantine_by_key:
            quarantine_by_key[key] = item
        else:
            quarantine_by_key[key]["reasons"] = sorted(
                set(quarantine_by_key[key].get("reasons", []))
                | set(item.get("reasons", []))
            )
    quarantine = sorted(
        quarantine_by_key.values(),
        key=lambda item: (
            str(item.get("runner_id")),
            str(item.get("assignment_id")),
            str(item.get("attempt_id")),
            str(item.get("receipt")),
        ),
    )

    all_errors = sorted(set(integrity_errors + final_errors))
    localized_receipt_errors = sorted(set(localized_receipt_errors))
    status = (
        "fail"
        if all_errors or localized_receipt_errors
        else "pass"
        if args.final and mechanically_pending_assignments == 0 and valid_complete_receipts == 12
        else "in_progress"
    )
    report = {
        "audit_id": AUDIT_ID,
        "validator": "postrun_validator_v3.py",
        "validator_version": "3.2.0",
        "validator_sha256": validator_start_sha256,
        "observed_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "mode": "final" if args.final else "in_progress",
        "status": status,
        "authority": "frozen_postrun_coverage_authority_when_hash_matches_VALIDATOR_AUTHORITY_V3",
        "authority_scope": "live_per_assignment_credit_only",
        "final_lineage_reseal_required": True,
        "seal_checks": seal_checks,
        "lineage_prefix_checks": dict(sorted(lineage_prefix_checks.items())),
        "lineage_checkpoint": {
            "ref": str(checkpoint_path.relative_to(ROOT)) if under(checkpoint_path, ROOT) else None,
            "sha256": checkpoint_hash,
            "sequence": lineage_checkpoint.get("sequence"),
            "checkpoint_id": lineage_checkpoint.get("checkpoint_id"),
            "stream_inventory_sha256": lineage_checkpoint.get("stream_inventory_sha256"),
            "present_streams": sum(
                row.get("state") == "present" for row in lineage_streams.values()
            ),
            "missing_streams": sum(
                row.get("state") == "missing" for row in lineage_streams.values()
            ),
            "native_sessions": len(checkpoint_native_sessions),
            "native_session_inventory_sha256": lineage_checkpoint.get(
                "native_session_inventory_sha256"
            ),
            "present_runner_artifacts": sum(
                row.get("state") == "present"
                for row in checkpoint_runner_artifacts.values()
            ),
            "missing_runner_artifacts": sum(
                row.get("state") == "missing"
                for row in checkpoint_runner_artifacts.values()
            ),
            "runner_artifact_inventory_sha256": lineage_checkpoint.get(
                "runner_artifact_inventory_sha256"
            ),
            "post_checkpoint_runner_jsonls": post_checkpoint_jsonls,
            "post_checkpoint_runner_artifacts": post_checkpoint_runner_artifacts,
            "deferred_file_list_semantics": (
                "non_authoritative_lower_bound_all_post_checkpoint_files_excluded_from_credit"
            ),
            "pre_anchor_auxiliary_provenance_limitation": lineage_checkpoint.get(
                "pre_anchor_auxiliary_provenance_limitation"
            ),
        },
        "seal_integrity_allows_per_assignment_credit": anchor_integrity_passed,
        "credit_integrity_allows_per_assignment_credit": credit_integrity_passed,
        "v2_floor_authority_integrity_passed": floor_authority_integrity_passed,
        "credit_suppression_reasons": sorted(set(integrity_errors)),
        "counts": {
            "expected_assignments": len(expected),
            "dispatch_records": len(all_registry_rows),
            "dispatch_attempts": len(registry_groups),
            "unique_dispatched_assignments": len(
                {key[0] for key in registry_groups}
            ),
            "result_manifest_records": len(all_manifest_rows),
            "raw_result_files": len(raw_files),
            "unmanifested_raw_result_files": len(unmanifested_raw),
            "failed_attempt_records": len(all_failed_rows),
            "auxiliary_lineage_records": len(all_auxiliary_rows),
            "auxiliary_failure_records": len(auxiliary_failure_rows),
            "open_infrastructure_records": len(open_infrastructure_rows),
            "checkpointed_native_sessions": len(checkpoint_native_sessions),
            "receipted_native_sessions": len(native_session_lineage_pairs),
            "unreceipted_native_sessions": len(unreceipted_native_sessions),
            "coordination_quarantine_records": len(coordination_quarantine),
            "known_immutable_revoked_attempts": len(KNOWN_REVOKED_ATTEMPTS),
            "superseded_v2_structural_rejection_records": len(
                superseded_v2_structural_rejections
            ),
            "malformed_runner_receipts": len(malformed_runner_receipts),
            "strict_v3_mechanically_eligible_assignments": len(strict_v3_results),
            "mechanically_eligible_assignments": len(strict_v3_results),
            "validated_results": len(strict_v3_results),
            "preserved_v2_floor_assignments": len(preserved_floor_results),
            "new_v3_credited_assignments": len(v3_new_credit_results),
            "credited_assignments": len(credited_results),
            "strict_v3_mechanically_pending_assignments": len(expected) - len(strict_v3_results),
            "mechanically_pending_assignments": len(expected) - len(strict_v3_results),
            "pending_assignments": pending_assignments,
            "runner_complete_receipts": len(complete_receipts),
            "valid_runner_complete_receipts": valid_complete_receipts,
            "unresolved_dispatch_attempts": len(unresolved_attempts),
            "quarantine_candidates": len(quarantine),
            "localized_receipt_errors": len(localized_receipt_errors),
            "global_integrity_errors": len(set(integrity_errors)),
            "final_mode_errors": len(set(final_errors)),
        },
        "identity_uniqueness": {
            field: {
                "recorded": len(mapping),
                "reused_values": sum(1 for pairs in mapping.values() if len(pairs) > 1),
            }
            for field, mapping in identity_attempts.items()
        },
        "validated_assignment_ids_sha256": strict_digest(strict_v3_results),
        "mechanically_eligible_assignment_ids": sorted(strict_v3_results),
        "preserved_v2_floor_assignment_ids_sha256": strict_digest(preserved_floor_results),
        "preserved_v2_floor_assignment_ids": sorted(preserved_floor_results),
        "new_v3_credited_assignment_ids_sha256": strict_digest(v3_new_credit_results),
        "new_v3_credited_assignment_ids": sorted(v3_new_credit_results),
        "credited_assignment_ids_sha256": strict_digest(credited_results),
        "credited_assignment_ids": sorted(credited_results),
        "mechanically_eligible_result_receipts": sorted(
            strict_v3_receipts, key=lambda item: str(item["assignment_id"])
        ),
        "credited_result_receipts": sorted(
            credited_receipts, key=lambda item: str(item["assignment_id"])
        ),
        "per_runner": per_runner,
        "runner_completion_validation": completion_validation,
        "runner_input_file_sha256": dict(sorted(runner_input_hashes.items())),
        "transaction_input_file_sha256": dict(sorted(transaction_input_hashes.items())),
        "unreceipted_native_sessions": unreceipted_native_sessions,
        "unmanifested_raw_result_files": unmanifested_raw,
        "unresolved_dispatch_attempts": sorted(unresolved_attempts),
        "superseded_v2_structural_rejections": sorted(
            superseded_v2_structural_rejections,
            key=lambda item: str(item.get("source_receipt")),
        ),
        "malformed_runner_receipts": malformed_runner_receipts,
        "quarantine_candidates": quarantine,
        "preserved_v2_floor_assurance_discrepancies": v2_floor_invalidations,
        "warnings": sorted(set(warnings)),
        "errors": all_errors,
        "localized_receipt_errors": localized_receipt_errors,
        "coverage_policy": V3_COVERAGE_POLICY,
    }
    rendered = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if args.output:
        write_new_evidence_output(args.output, rendered)
    print(rendered, end="")
    return 0 if status != "fail" else 1


if __name__ == "__main__":
    sys.exit(strict_main())
