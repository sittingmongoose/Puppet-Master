#!/usr/bin/env python3
"""Independent eligibility recomputation for audit-004 validator v3.

This script intentionally does not import the primary validator. It proves
that every mechanically eligible receipt in a v2 snapshot has a positive
manifest, a matching completed dispatch, an immutable raw-result hash, the
required arrays, exact in-range evidence quotes, and no attempt-level failure
or quarantine veto. It also verifies fail-closed root-credit accounting.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any


HERE = Path(__file__).resolve()
ROOT = HERE.parents[2] if HERE.parent.name == "frozen" else HERE.parents[1]
REPO = ROOT.parents[2]
REQUIRED_ARRAYS = (
    "observations",
    "candidate_findings",
    "explicit_non_gaps",
    "unknowns",
    "exact_evidence_refs",
)
POSITIVE = {
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
REVOKED_ASSIGNMENTS = {
    "A004-000018-ADVERSARIAL-WIN-510B3DE676A3-0003",
    "A004-000023-EXACT-WIN-F25915291C7A-0002",
    "A004-000028-ADVERSARIAL-WIN-C45446C7AC96-0003",
}

# Strict-v3 entrypoint constants.  REVOKED_ASSIGNMENTS above belongs only to
# the superseded draft main and is intentionally not used by x_main.
AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
X_ANCHORS = {
    "ready": ("coordination/READY_FOR_RUNNERS.json", "aa353b8f33dfda7c2695d7325e843deb169a67b0d4d96778214c2e6674681b4c"),
    "assignment_manifest": ("assignments/global_assignment_manifest.jsonl", "2dc5d14db8a3f8d6486de66c94463ee99abd5483392f4cfaf36c0d94de29db28"),
    "window_manifest": ("manifests/window_manifest.jsonl", "36a657ccc9672a3f9335efe48305372326dd80a2eb07d7527d6cdfc6262c5b3d"),
    "capsule_registry": ("manifests/context_capsule_registry.jsonl", "711a8f2697ee0c68b4af64d486b89e6ff831e4aa2b09d5cda63b3ed99ff388f9"),
    "runner_registry": ("coordination/runner_thread_registry.json", "4d81e417ce0055ee26f7115b5c84d04e31713e8fc188140921bb359e7adcfbb2"),
    "validator_result": ("validator_results.json", "488f0b2de1928b5e385103d7f68acebb29e1109ed35d80430c4a8c099181f1cb"),
    "v2_authority": ("validators/VALIDATOR_AUTHORITY_V2.json", "88304df2f47c703531399b86a309ddce7fe71466f02f4d444f23f0e9b75f1ea0"),
    "protocol_alert_0002": ("coordination/PROTOCOL_ALERT_0002.json", "1109e1e10eed0f2fa6336eb93f032331813f470afa84f94b945a8e14928fd9c6"),
    "protocol_alert_0002_ack": ("coordination/PROTOCOL_ALERT_0002_ACK.json", "e3e19c0dfa805a7607a197d8efc3d1b32e0caa9cd762798f0efb3da2be7a3ed4"),
    "protocol_alert_0003": ("coordination/PROTOCOL_ALERT_0003.json", "422bb587e404b9ea547b2f8248aac71d8443d64cccb6b08babc7a6ac92d05108"),
    "protocol_alert_0004": ("coordination/PROTOCOL_ALERT_0004.json", "b08638d3b751aebd8b2fa8ad57c473f87249cbdcaf0338a519db73a36001f3dc"),
    "v2_structural_rejection_adjudication": ("coordination/V2_STRUCTURAL_REJECTION_ADJUDICATION_V3.json", "10c2630d4e7232ac0bff42aa168926c26ff34ca7cb4e9da97460730ec92ad4e2"),
    "frozen_v2_primary": ("validators/frozen/postrun_validator_v2.py", "6df3b229ca48e028b5a88010574131c18208a1f0cad89dd2c1b92223abedb7e2"),
    "frozen_v2_crosscheck": ("validators/frozen/postrun_validator_v2_crosscheck.py", "7483557c3ca2213643d464208c1f6e7cbee3ef55b490cfeca20eea217406af30"),
    "v2_crosschecked_floor_snapshot": ("validators/evidence/postrun_validator_v2.live.20260710T0343Z.json", "1bcef735be8c7b8e6e32708c1cbc06c322244c38967f409019f7c04c0f532390"),
    "v2_crosschecked_floor_receipt": ("validators/evidence/postrun_validator_v2.crosscheck.live.20260710T0343Z.json", "d4a7191bf6af437cca01576dc837e027b1aa11cfde1626595a67fd0df8c53a6b"),
    "initial_failure_lineage": ("validators/failure_lineage_v3.initial.json", "bf558c0aa8034e8bb1c82ae49462fe3603ae07651506d0942f2867fa7a0005f4"),
}
X_KNOWN_REVOKED = frozenset(
    {
        ("A004-000018-ADVERSARIAL-WIN-510B3DE676A3-0003", "1"),
        ("A004-000023-EXACT-WIN-F25915291C7A-0002", "1"),
        ("A004-000028-ADVERSARIAL-WIN-C45446C7AC96-0003", "1"),
    }
)
X_BOOTSTRAP_CHECKPOINT_REF = (
    "coordination/lineage_v3/candidates/"
    "checkpoint-000000-20260710T091708Z.json"
)
X_BOOTSTRAP_CHECKPOINT_SHA256 = (
    "19ec083adf767edebd3e45831c3e433cd068a587cc065935a8813a3d6fa390be"
)
X_ATTEMPT_FIELDS = (
    "attempt_id", "attempt", "attempt_no", "attempt_number",
    "assignment_attempt_number", "attempt_ordinal",
)
X_IDENTITY_FIELDS = ("agent_instance_id", "agent_path", "agent_thread_id")
X_SCOPE = {
    "capsule_only": True,
    "prior_audits_used": False,
    "other_results_used": False,
    "unrelated_windows_used": False,
}
X_NEGATIVE = {
    "error", "fail", "failed", "failed_attempt", "failed_attempt_zero_coverage",
    "invalid", "pending", "quarantined", "rejected", "zero_coverage",
}
X_SCOPE_TRUE_IF_PRESENT = (
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
X_SCOPE_FALSE_IF_PRESENT = (
    "prior_audits_read",
    "prior_audits_accessed",
    "prior_audits_used",
    "prior_audits_seen",
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
PRIMARY_V3_SHA256 = "5fd00971028bb3ca13ac32ed5f51df7469783fc8df45331d634d68732a90033a"
PRIMARY_AUTHORITY = "frozen_postrun_coverage_authority_when_hash_matches_VALIDATOR_AUTHORITY_V3"
PRIMARY_COVERAGE_POLICY = (
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
PRIMARY_REPORT_KEYS = {
    "audit_id", "authority", "authority_scope", "counts", "coverage_policy",
    "credit_integrity_allows_per_assignment_credit", "credit_suppression_reasons",
    "credited_assignment_ids", "credited_assignment_ids_sha256",
    "credited_result_receipts", "errors", "final_lineage_reseal_required",
    "identity_uniqueness", "lineage_checkpoint", "lineage_prefix_checks",
    "localized_receipt_errors", "malformed_runner_receipts",
    "mechanically_eligible_assignment_ids", "mechanically_eligible_result_receipts",
    "mode", "new_v3_credited_assignment_ids", "new_v3_credited_assignment_ids_sha256",
    "observed_at", "per_runner", "preserved_v2_floor_assignment_ids",
    "preserved_v2_floor_assignment_ids_sha256",
    "preserved_v2_floor_assurance_discrepancies", "quarantine_candidates",
    "runner_completion_validation", "runner_input_file_sha256", "seal_checks",
    "seal_integrity_allows_per_assignment_credit", "status",
    "superseded_v2_structural_rejections", "transaction_input_file_sha256",
    "unmanifested_raw_result_files", "unreceipted_native_sessions",
    "unresolved_dispatch_attempts", "v2_floor_authority_integrity_passed",
    "validated_assignment_ids_sha256", "validator", "validator_sha256",
    "validator_version", "warnings",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def x_json_loads(value: str | bytes | bytearray) -> Any:
    """Independently reject duplicate keys and non-standard JSON numbers."""

    def unique_pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
        keys = [key for key, _item in pairs]
        if len(keys) != len(set(keys)):
            raise ValueError("JSON object contains a duplicate key")
        return dict(pairs)

    def standards_only(token: str) -> Any:
        raise ValueError(f"JSON numeric constant is not standard: {token}")

    def bounded_float(token: str) -> float:
        number = float(token)
        if number in {float("inf"), float("-inf")}:
            raise ValueError("JSON decimal overflows the finite numeric domain")
        significand = token.lower().split("e", 1)[0]
        if number == 0.0 and any(digit in significand for digit in "123456789"):
            raise ValueError("JSON decimal underflows the finite numeric domain")
        return number

    decoded = json.loads(
        value,
        object_pairs_hook=unique_pairs,
        parse_constant=standards_only,
        parse_float=bounded_float,
    )
    stack = [decoded]
    while stack:
        item = stack.pop()
        if isinstance(item, str):
            encoded = item.encode("utf-8", errors="surrogatepass")
            if any(byte in {0xED} for byte in encoded) and any(
                0xD800 <= ord(character) <= 0xDFFF for character in item
            ):
                raise ValueError("JSON string contains a surrogate code point")
        elif isinstance(item, dict):
            stack.extend(item)
            stack.extend(item.values())
        elif isinstance(item, list):
            stack.extend(item)
    return decoded


def x_utf8_bytes(value: str) -> bytes | None:
    try:
        return value.encode("utf-8")
    except UnicodeEncodeError:
        return None


def write_new_crosscheck_output(requested: Path, rendered: str) -> None:
    """Exclusively create one versioned cross-check snapshot in validators/evidence."""
    evidence_root = (ROOT / "validators/evidence").resolve()
    candidate = requested if requested.is_absolute() else ROOT / requested
    if candidate.exists() or candidate.is_symlink():
        raise ValueError("--output must name a new, non-symlink evidence file")
    if candidate.parent.is_symlink() or candidate.parent.resolve() != evidence_root:
        raise ValueError("--output parent must be exactly validators/evidence")
    if not re.fullmatch(r"postrun_validator_v3\.crosscheck\.[A-Za-z0-9_.-]+\.json", candidate.name):
        raise ValueError(
            "--output must use a versioned postrun_validator_v3.crosscheck.*.json filename"
        )
    with candidate.open("x", encoding="utf-8") as handle:
        handle.write(rendered)


def x_sha256_prefix(path: Path, byte_count: int) -> str:
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
        raise ValueError(f"{path} shorter than anchored prefix")
    return digest.hexdigest()


def x_descriptor_capture(
    path: Path,
    expected_sha256: str | None = None,
) -> tuple[bytes, str, tuple[int, int, int, int, int]]:
    """Independently capture one complete file through a stable descriptor."""
    descriptor: int | None = None
    try:
        flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
        descriptor = os.open(path, flags)
        opened = os.fstat(descriptor)
        body = os.pread(descriptor, opened.st_size + 1, 0)
        finished = os.fstat(descriptor)
        os.close(descriptor)
        descriptor = None
        path_state = path.lstat()
    except Exception:
        if descriptor is not None:
            os.close(descriptor)
        raise
    opened_signature = (
        opened.st_dev, opened.st_ino, opened.st_size,
        opened.st_mtime_ns, opened.st_ctime_ns,
    )
    finished_signature = (
        finished.st_dev, finished.st_ino, finished.st_size,
        finished.st_mtime_ns, finished.st_ctime_ns,
    )
    path_signature = (
        path_state.st_dev, path_state.st_ino, path_state.st_size,
        path_state.st_mtime_ns, path_state.st_ctime_ns,
    )
    if opened_signature != finished_signature or finished_signature != path_signature:
        raise ValueError("file changed or was replaced during descriptor capture")
    if len(body) != opened.st_size:
        raise ValueError("descriptor capture length differs from file size")
    digest = hashlib.sha256(body).hexdigest()
    if expected_sha256 is not None and digest != expected_sha256:
        raise ValueError("descriptor capture digest differs from expected SHA-256")
    return body, digest, opened_signature


def x_descriptor_prefix(
    path: Path,
    byte_count: int,
    expected_sha256: str,
) -> bytes:
    """Capture one checkpoint prefix once and parse only those bound bytes."""
    if x_nonnegative_int(byte_count) is None:
        raise ValueError("prefix length is not canonical")
    descriptor: int | None = None
    try:
        flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
        descriptor = os.open(path, flags)
        opened = os.fstat(descriptor)
        body = os.pread(descriptor, byte_count, 0)
        finished = os.fstat(descriptor)
        os.close(descriptor)
        descriptor = None
        path_state = path.lstat()
    except Exception:
        if descriptor is not None:
            os.close(descriptor)
        raise
    if (
        (opened.st_dev, opened.st_ino, opened.st_size, opened.st_mtime_ns, opened.st_ctime_ns)
        != (finished.st_dev, finished.st_ino, finished.st_size, finished.st_mtime_ns, finished.st_ctime_ns)
        or (finished.st_dev, finished.st_ino, finished.st_size, finished.st_mtime_ns, finished.st_ctime_ns)
        != (path_state.st_dev, path_state.st_ino, path_state.st_size, path_state.st_mtime_ns, path_state.st_ctime_ns)
    ):
        raise ValueError("prefix source changed during descriptor capture")
    if len(body) != byte_count:
        raise ValueError("prefix source is shorter than checkpoint length")
    if hashlib.sha256(body).hexdigest() != expected_sha256:
        raise ValueError("captured prefix differs from expected SHA-256")
    return body


def load_json(path: Path) -> Any:
    return x_json_loads(path.read_text(encoding="utf-8"))


def x_load_json_bound(path: Path, expected_sha256: str) -> Any:
    raw = path.read_bytes()
    if hashlib.sha256(raw).hexdigest() != expected_sha256:
        raise ValueError("bytes do not match the expected SHA-256")
    return x_json_loads(raw.decode("utf-8"))


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        row = x_json_loads(line)
        row["_source"] = f"{path.relative_to(ROOT)}:{line_no}"
        rows.append(row)
    return rows


def first(record: dict[str, Any], *names: str) -> Any:
    for name in names:
        if name in record:
            return record[name]
    return None


def x_canonical_sha256(value: Any) -> str | None:
    if isinstance(value, str) and re.fullmatch(r"[0-9a-f]{64}", value):
        return value
    return None


def x_nonnegative_int(value: Any) -> int | None:
    if isinstance(value, int) and not isinstance(value, bool) and value >= 0:
        return value
    return None


def x_nonnegative_number(value: Any) -> int | float | None:
    if (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and value >= 0
    ):
        return value
    return None


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


def resolve_ref(value: Any) -> Path | None:
    if not isinstance(value, str) or not value:
        return None
    path = Path(value)
    if path.is_absolute():
        return path
    if path.parts and path.parts[0] in {
        "assignments",
        "capsules",
        "coordination",
        "manifests",
        "runners",
        "validators",
    }:
        return ROOT / path
    return REPO / path


def under(path: Path, parent: Path) -> bool:
    try:
        path.resolve().relative_to(parent.resolve())
        return True
    except (OSError, ValueError):
        return False


def normalized(value: str) -> str:
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


def walk_dicts(value: Any):
    if isinstance(value, dict):
        yield value
        for nested in value.values():
            yield from walk_dicts(nested)
    elif isinstance(value, list):
        for nested in value:
            yield from walk_dicts(nested)


def hash_field(record: dict[str, Any], stem: str) -> Any:
    return first(record, f"{stem}_sha256", f"{stem}_hash")


def metadata_errors(record: dict[str, Any], assignment: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    expected_fields = {
        "runner_id": assignment["runner_id"],
        "role": assignment["role"],
        "window_id": assignment["window_id"],
        "doc_id": assignment["doc_id"],
        "document_path": assignment["document_path"],
        "core_range": assignment["core_range"],
        "capsule_ref": assignment["capsule_ref"],
        "capsule_bytes": assignment["capsule_bytes"],
    }
    for field, expected in expected_fields.items():
        if record.get(field) != expected:
            errors.append(f"{field} mismatch")
    if hash_field(record, "capsule") != assignment["capsule_sha256"]:
        errors.append("capsule hash mismatch")
    if hash_field(record, "source") != assignment["source_sha256"]:
        errors.append("source hash mismatch")
    if record.get("model") != assignment["required_model"]:
        errors.append("model mismatch")
    if record.get("reasoning_effort") != assignment["required_reasoning_effort"]:
        errors.append("reasoning effort mismatch")
    if record.get("prior_substantive_assignment_count") != 0:
        errors.append("prior substantive assignment count mismatch")
    if record.get("terminal_after_result") is not True:
        errors.append("terminal_after_result is not true")
    if record.get("no_followup_reuse") is not True:
        errors.append("no_followup_reuse is not true")
    if not all(record.get(field) for field in ("agent_instance_id", "agent_path", "agent_thread_id")):
        errors.append("fresh identity fields are incomplete")
    return errors


def evidence_errors(
    ref: Any,
    assignment: dict[str, Any],
    ranges: list[list[int]],
    source_lines: list[str],
) -> list[str]:
    if not isinstance(ref, dict):
        return ["evidence is not an object"]
    path, start, end, quote = evidence_parts(ref)
    end = start if end is None else end
    errors: list[str] = []
    if path != assignment["document_path"]:
        errors.append("evidence path mismatch")
    if (
        not isinstance(start, int)
        or isinstance(start, bool)
        or not isinstance(end, int)
        or isinstance(end, bool)
        or start > end
    ):
        errors.append("evidence range invalid")
        return errors
    if not any(start >= low and end <= high for low, high in ranges):
        errors.append("evidence outside capsule range")
    if start < 1 or end > len(source_lines):
        errors.append("evidence outside canonical source")
        return errors
    if not isinstance(quote, str) or not quote.strip():
        errors.append("exact evidence quote missing")
    elif quote not in "\n".join(source_lines[start - 1 : end]):
        errors.append("exact evidence quote mismatch")
    return errors


def manifest_positive(row: dict[str, Any]) -> bool:
    credit = first(row, "coverage_credit", "valid_coverage", "coverage_count")
    if credit not in (1, True):
        return False
    if any(row.get(field) is False for field in ("validation_passed", "valid", "valid_coverage")):
        return False
    if any(isinstance(row.get(field), list) and row[field] for field in ("errors", "validation_errors")):
        return False
    if any(
        row.get(field) is True
        for field in (
            "validation_passed",
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
        str(row.get(field, "")).lower() in POSITIVE
        for field in (
            "schema_validation",
            "hash_validation",
            "range_validation",
            "validation_status",
            "status",
            "result_status",
            "state",
            "attempt_state",
        )
    )


def revoked_draft_main() -> int:
    """Superseded pre-review draft retained only for byte-level lineage."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--snapshot", type=Path, required=True)
    parser.add_argument("--validator", type=Path, required=True)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--lineage-checkpoint", type=Path)
    args = parser.parse_args()

    errors: list[str] = []
    snapshot = load_json(args.snapshot)
    assignments = {
        row["assignment_id"]: row
        for row in load_jsonl(ROOT / "assignments/global_assignment_manifest.jsonl")
    }
    eligible = snapshot.get("mechanically_eligible_assignment_ids", [])
    credited = snapshot.get("credited_assignment_ids", [])
    receipts = snapshot.get("mechanically_eligible_result_receipts", [])
    receipt_by_assignment = {row.get("assignment_id"): row for row in receipts}

    if snapshot.get("validator_version") != "3.0.0":
        errors.append("snapshot is not validator version 3.0.0")
    if len(eligible) != len(set(eligible)) or len(eligible) != len(receipts):
        errors.append("eligible IDs and receipt list are not one-to-one")
    digest = hashlib.sha256(
        ("\n".join(sorted(eligible)) + ("\n" if eligible else "")).encode("utf-8")
    ).hexdigest()
    if digest != snapshot.get("validated_assignment_ids_sha256"):
        errors.append("eligible assignment digest mismatch")
    credited_digest = hashlib.sha256(
        ("\n".join(sorted(credited)) + ("\n" if credited else "")).encode("utf-8")
    ).hexdigest()
    if credited_digest != snapshot.get("credited_assignment_ids_sha256"):
        errors.append("credited assignment digest mismatch")
    if snapshot.get("counts", {}).get("credited_assignments") != len(credited):
        errors.append("credited assignment count does not match credited ID list")
    if any(value != "pass" for value in snapshot.get("seal_checks", {}).values()):
        if credited:
            errors.append("credit exists despite a failed READY-sealed input hash")
    elif set(credited) != set(eligible):
        errors.append("sealed inputs pass but eligible and credited assignment sets differ")
    if REVOKED_ASSIGNMENTS & set(credited):
        errors.append(f"revoked assignments appear credited: {sorted(REVOKED_ASSIGNMENTS & set(credited))}")

    manifests: dict[str, list[dict[str, Any]]] = defaultdict(list)
    dispatches: dict[str, list[dict[str, Any]]] = defaultdict(list)
    failures: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for number in range(1, 13):
        runner_dir = ROOT / "runners" / f"runner-{number:02d}"
        for row in load_jsonl(runner_dir / "result_manifest.jsonl"):
            manifests[str(row.get("assignment_id"))].append(row)
        for row in load_jsonl(runner_dir / "fresh_agent_assignment_registry.jsonl"):
            dispatches[str(row.get("assignment_id"))].append(row)
        for filename in ("failed_attempts.jsonl", "ingest_errors.jsonl"):
            for row in load_jsonl(runner_dir / filename):
                failures[str(row.get("assignment_id"))].append(row)
    for row in load_jsonl(ROOT / "coordination/QUARANTINE_REGISTRY.jsonl"):
        failures[str(row.get("assignment_id"))].append(row)

    dispatch_groups: dict[tuple[str, str, str, str], dict[str, Any]] = {}
    for rows in dispatches.values():
        for row in rows:
            key = attempt_identity_key(row)
            combined = dispatch_groups.setdefault(key, {})
            for name, value in row.items():
                if value is not None:
                    combined[name] = value

    identity_attempts: dict[str, dict[str, set[tuple[str, str, str, str]]]] = {
        field: defaultdict(set)
        for field in ("agent_instance_id", "agent_thread_id", "agent_path")
    }
    for key, row in dispatch_groups.items():
        for field, mapping in identity_attempts.items():
            if row.get(field):
                mapping[str(row[field])].add(key)
    identity_conflict_keys: set[tuple[str, str, str, str]] = set()
    for mapping in identity_attempts.values():
        for keys in mapping.values():
            if len(keys) > 1:
                identity_conflict_keys.update(keys)

    manifest_attempt_number_groups: dict[
        tuple[str, str], set[tuple[str, str, str, str]]
    ] = defaultdict(set)
    for assignment_id, rows in manifests.items():
        for row in rows:
            token = attempt_token(row)
            if token is not None:
                manifest_attempt_number_groups[(assignment_id, token)].add(
                    attempt_identity_key(row)
                )
    reused_attempt_keys = {
        key
        for keys in manifest_attempt_number_groups.values()
        if len(keys) > 1
        for key in keys
    }

    source_cache: dict[str, list[str]] = {}
    capsule_cache: dict[str, dict[str, Any]] = {}
    independently_valid_receipts: list[dict[str, Any]] = []

    for assignment_id, rows in manifests.items():
        assignment = assignments.get(assignment_id)
        for row in rows:
            row_errors: list[str] = []
            key = attempt_identity_key(row)
            if assignment is None:
                row_errors.append("assignment is not expected")
            if sum(1 for other in rows if attempt_identity_key(other) == key) != 1:
                row_errors.append("manifest cardinality is not one for normalized attempt/identity")
            if key in reused_attempt_keys:
                row_errors.append("attempt number is reused across fresh identities")
            if key in identity_conflict_keys:
                row_errors.append("fresh identity is recycled across attempts")
            if not manifest_positive(row):
                row_errors.append("manifest is not explicitly positive")
            if any(same_attempt(row, failed) for failed in failures.get(assignment_id, [])):
                row_errors.append("attempt has an explicit failure/quarantine veto")
            if assignment is None:
                continue

            dispatch = dispatch_groups.get(key)
            if dispatch is None:
                row_errors.append("matching dispatch attempt is missing")
            else:
                combined = dict(dispatch)
                combined.update({name: value for name, value in row.items() if value is not None})
                row_errors.extend(metadata_errors(combined, assignment))
                dispatch_ref = first(dispatch, "result_ref", "raw_result_ref")
                dispatch_hash = hash_field(dispatch, "result")
                if not dispatch.get("completed_at") or not dispatch_ref or not dispatch_hash:
                    row_errors.append("matching dispatch is not completed and hashed")
                row_ref = first(row, "result_ref", "raw_result_ref")
                row_hash = hash_field(row, "result")
                if dispatch_ref and row_ref and dispatch_ref != row_ref:
                    row_errors.append("dispatch and manifest result refs differ")
                if dispatch_hash and row_hash and dispatch_hash != row_hash:
                    row_errors.append("dispatch and manifest result hashes differ")

            source_path = resolve_ref(assignment["document_path"])
            capsule_path = resolve_ref(assignment["capsule_ref"])
            excerpt_path = resolve_ref(assignment["source_excerpt_ref"])
            if source_path is None or not source_path.exists():
                row_errors.append("canonical source is missing")
            elif sha256(source_path) != assignment["source_sha256"]:
                row_errors.append("canonical source hash mismatch")
            if capsule_path is None or not capsule_path.is_file():
                row_errors.append("capsule is missing")
            elif sha256(capsule_path) != assignment["capsule_sha256"]:
                row_errors.append("capsule hash mismatch")
            if excerpt_path is None or not excerpt_path.is_file():
                row_errors.append("source excerpt is missing")
            elif sha256(excerpt_path) != assignment["source_excerpt_sha256"]:
                row_errors.append("source excerpt hash mismatch")

            validation_ref = row.get("validation_ref")
            if validation_ref:
                validation_path = resolve_ref(validation_ref)
                expected_validation_dir = ROOT / "runners" / assignment["runner_id"] / "validation"
                if (
                    validation_path is None
                    or not validation_path.exists()
                    or not under(validation_path, expected_validation_dir)
                ):
                    row_errors.append("validation receipt missing or out of scope")
                else:
                    validation = load_json(validation_path)
                    validation_positive = any(
                        validation.get(field) is True
                        for field in ("passed", "validation_passed", "valid", "valid_coverage")
                    ) or str(first(validation, "validation_status", "status", "state") or "").lower() in POSITIVE
                    if not validation_positive:
                        row_errors.append("referenced validation receipt is not positive")

            result_ref = first(row, "result_ref", "raw_result_ref")
            result_hash = hash_field(row, "result")
            result_path = resolve_ref(result_ref)
            expected_dir = ROOT / "runners" / assignment["runner_id"] / "raw_results"
            if result_path is None or not result_path.exists() or not under(result_path, expected_dir):
                row_errors.append("raw result path missing or out of scope")
            elif not result_hash or sha256(result_path) != result_hash:
                row_errors.append("raw result hash mismatch")
            else:
                raw = load_json(result_path)
                if raw.get("assignment_id") != assignment_id:
                    row_errors.append("raw result assignment mismatch")
                if any(not isinstance(raw.get(name), list) for name in REQUIRED_ARRAYS):
                    row_errors.append("required result arrays missing")
                else:
                    if raw.get("candidate_findings") and not raw.get("exact_evidence_refs"):
                        row_errors.append("findings lack exact evidence")
                    if source_path is not None and source_path.exists() and capsule_path is not None and capsule_path.exists():
                        source_lines = source_cache.setdefault(
                            assignment["document_path"],
                            source_path.read_text(encoding="utf-8").splitlines(),
                        )
                        capsule = capsule_cache.setdefault(assignment_id, load_json(capsule_path))
                        ranges = [assignment["core_range"], *capsule.get("context_ranges", [])]
                        exact_refs = raw["exact_evidence_refs"]
                        for evidence in exact_refs:
                            row_errors.extend(evidence_errors(evidence, assignment, ranges, source_lines))
                        for evidence in walk_dicts(raw):
                            if evidence in exact_refs:
                                continue
                            compact = evidence.get("ref")
                            if any(name in evidence for name in ("line_start", "start_line")) or (
                                isinstance(compact, str)
                                and re.fullmatch(r".+:\d+(?:-\d+)?", compact.strip())
                            ):
                                row_errors.extend(
                                    evidence_errors(evidence, assignment, ranges, source_lines)
                                )

            if not row_errors:
                independently_valid_receipts.append(
                    {
                        "assignment_id": assignment_id,
                        "attempt_identity_key": list(key),
                        "agent_instance_id": row.get("agent_instance_id"),
                        "result_sha256": hash_field(row, "result"),
                    }
                )

    independent_by_assignment: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for receipt in independently_valid_receipts:
        independent_by_assignment[str(receipt["assignment_id"])].append(receipt)
    independently_credited = {
        assignment_id
        for assignment_id, rows in independent_by_assignment.items()
        if len(rows) == 1
    }
    ambiguous_valid_assignments = sorted(
        assignment_id
        for assignment_id, rows in independent_by_assignment.items()
        if len(rows) != 1
    )
    if ambiguous_valid_assignments:
        errors.append(
            f"multiple independently valid attempts for assignments: {ambiguous_valid_assignments}"
        )
    if set(credited) != independently_credited:
        errors.append(
            "primary credited set differs from independently recomputed set: "
            f"missing_from_primary={sorted(independently_credited - set(credited))}, "
            f"extra_in_primary={sorted(set(credited) - independently_credited)}"
        )
    for assignment_id in credited:
        receipt = receipt_by_assignment.get(assignment_id)
        if receipt is None:
            errors.append(f"{assignment_id}: primary snapshot lacks credited receipt detail")

    report = {
        "audit_id": snapshot.get("audit_id"),
        "crosscheck": "postrun_validator_v3_crosscheck.py",
        "observed_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "status": "pass" if not errors else "fail",
        "validator_sha256": sha256(args.validator),
        "snapshot_sha256": sha256(args.snapshot),
        "eligible_assignments_reported": len(eligible),
        "credited_assignments_checked": len(credited),
        "root_credited_assignments_observed": snapshot.get("counts", {}).get("credited_assignments"),
        "revoked_assignments_absent": not bool(REVOKED_ASSIGNMENTS & set(credited)),
        "errors": errors,
    }
    rendered = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if args.output:
        write_new_crosscheck_output(args.output, rendered)
    print(rendered, end="")
    return 0 if not errors else 1


def x_attempt_value(value: Any) -> str | None:
    if value is None or isinstance(value, bool):
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


def x_attempt(row: dict[str, Any]) -> tuple[str | None, list[str]]:
    supplied = [row[name] for name in X_ATTEMPT_FIELDS if row.get(name) is not None]
    if not supplied:
        return None, ["attempt missing"]
    values = [x_attempt_value(value) for value in supplied]
    if any(value is None for value in values):
        return None, ["attempt invalid"]
    unique = set(values)
    if len(unique) != 1:
        return None, ["attempt fields conflict"]
    return next(iter(unique)), []


def x_identity_field(name: str, value: Any) -> str | None:
    if name not in X_IDENTITY_FIELDS:
        return None
    if not isinstance(value, str) or not value or value != value.strip():
        return None
    if name == "agent_path":
        normalized = str(PurePosixPath(value))
        if (
            not value.startswith("/root/")
            or normalized != value
            or any(part in {"", ".", ".."} for part in value.split("/")[2:])
        ):
            return None
    return value


def x_identity(row: dict[str, Any]) -> tuple[str, str, str] | None:
    values = [x_identity_field(name, row.get(name)) for name in X_IDENTITY_FIELDS]
    if any(value is None for value in values):
        return None
    return values[0], values[1], values[2]


def x_identity_value(row: dict[str, Any], name: str) -> Any:
    return row.get(name)


def x_completion_attempt_inventory(
    evidence_rows: list[dict[str, Any]],
    assignments: dict[str, dict[str, Any]],
) -> dict[str, list[dict[str, Any]]]:
    """Independently inventory every physical attempt evidenced by the run."""
    by_runner: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for index, row in enumerate(evidence_rows):
        if row.get("_synthetic_authority_veto") is True:
            continue
        assignment_id = row.get("assignment_id")
        assignment = assignments.get(assignment_id) if isinstance(assignment_id, str) else None
        runner_id = row.get("_scan_runner_id") or row.get("runner_id")
        if not isinstance(runner_id, str) or not runner_id:
            runner_id = assignment.get("runner_id") if isinstance(assignment, dict) else None
        if not isinstance(runner_id, str) or not runner_id:
            continue
        attempt, attempt_issues = x_attempt(row)
        identity = {
            name: row[name]
            for name in X_IDENTITY_FIELDS
            if isinstance(
                row.get(name),
                str,
            )
            and (
                row.get(name)
            )
        }
        artifacts = {
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
        artifacts = {name: value for name, value in artifacts.items() if value is not None}
        by_runner[runner_id].append(
            {
                "assignment_id": assignment_id if isinstance(assignment_id, str) else None,
                "attempt": attempt if not attempt_issues else None,
                "attempt_invalid": bool(attempt_issues),
                "assignment_known": isinstance(assignment, dict),
                "runner_matches_assignment": (
                    isinstance(assignment, dict) and runner_id == assignment.get("runner_id")
                ),
                "identity": identity,
                "artifacts": artifacts,
                "receipt": row.get("_source")
                or f"{row.get('_receipt_file', 'unknown')}:{row.get('_receipt_line', index)}",
            }
        )

    inventory: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for runner_id, candidates in by_runner.items():
        identified = [candidate for candidate in candidates if candidate["identity"]]
        parents = list(range(len(identified)))

        def find(index: int) -> int:
            while parents[index] != index:
                parents[index] = parents[parents[index]]
                index = parents[index]
            return index

        def union(left: int, right: int) -> None:
            left_root = find(left)
            right_root = find(right)
            if left_root != right_root:
                parents[right_root] = left_root

        for left in range(len(identified)):
            for right in range(left + 1, len(identified)):
                a = identified[left]
                b = identified[right]
                same_assignment = a["assignment_id"] == b["assignment_id"]
                compatible_attempt = (
                    a["attempt"] == b["attempt"]
                    or a["attempt"] is None
                    or b["attempt"] is None
                )
                shared_identity = any(
                    a["identity"].get(name) == b["identity"].get(name)
                    for name in X_IDENTITY_FIELDS
                    if a["identity"].get(name) and b["identity"].get(name)
                )
                if same_assignment and compatible_attempt and shared_identity:
                    union(left, right)

        components: dict[int, list[dict[str, Any]]] = defaultdict(list)
        for index, candidate in enumerate(identified):
            components[find(index)].append(candidate)
        clusters: list[dict[str, Any]] = []
        for component in components.values():
            attempts = {row["attempt"] for row in component if row["attempt"] is not None}
            identities = {
                name: {
                    row["identity"][name]
                    for row in component
                    if name in row["identity"]
                }
                for name in X_IDENTITY_FIELDS
            }
            artifact_values = {
                name: {
                    x_canonical(row["artifacts"][name])
                    for row in component
                    if name in row["artifacts"]
                }
                for name in (
                    "result_ref", "result_sha256", "validation_ref",
                    "validation_sha256", "completed_at",
                )
            }
            clusters.append(
                {
                    "assignment_id": component[0]["assignment_id"],
                    "attempt": next(iter(attempts)) if len(attempts) == 1 else None,
                    "identities": identities,
                    "artifact_values": artifact_values,
                    "receipts": {row["receipt"] for row in component},
                    "attempt_conflict": len(attempts) > 1,
                    "attempt_invalid": any(row["attempt_invalid"] for row in component),
                    "assignment_known": all(row["assignment_known"] for row in component),
                    "runner_matches_assignment": all(
                        row["runner_matches_assignment"] for row in component
                    ),
                }
            )

        opaque_clusters: dict[tuple[Any, Any], dict[str, Any]] = {}
        for candidate in (row for row in candidates if not row["identity"]):
            matches = [
                cluster
                for cluster in clusters
                if cluster["assignment_id"] == candidate["assignment_id"]
                and cluster["attempt"] == candidate["attempt"]
            ]
            if len(matches) == 1:
                matches[0]["receipts"].add(candidate["receipt"])
                for name, value in candidate["artifacts"].items():
                    matches[0]["artifact_values"].setdefault(name, set()).add(
                        x_canonical(value)
                    )
                matches[0]["attempt_invalid"] = (
                    matches[0]["attempt_invalid"] or candidate["attempt_invalid"]
                )
                matches[0]["assignment_known"] = (
                    matches[0]["assignment_known"] and candidate["assignment_known"]
                )
                matches[0]["runner_matches_assignment"] = (
                    matches[0]["runner_matches_assignment"]
                    and candidate["runner_matches_assignment"]
                )
                continue
            key = (candidate["assignment_id"], candidate["attempt"])
            cluster = opaque_clusters.setdefault(
                key,
                {
                    "assignment_id": candidate["assignment_id"],
                    "attempt": candidate["attempt"],
                    "identities": {name: set() for name in X_IDENTITY_FIELDS},
                    "artifact_values": {
                        name: {x_canonical(value)}
                        for name, value in candidate["artifacts"].items()
                    },
                    "receipts": set(),
                    "ambiguous": len(matches) > 1,
                    "attempt_invalid": candidate["attempt_invalid"],
                    "assignment_known": candidate["assignment_known"],
                    "runner_matches_assignment": candidate["runner_matches_assignment"],
                },
            )
            cluster["receipts"].add(candidate["receipt"])
            for name, value in candidate["artifacts"].items():
                cluster["artifact_values"].setdefault(name, set()).add(
                    x_canonical(value)
                )
            cluster["ambiguous"] = cluster["ambiguous"] or len(matches) > 1
            cluster["attempt_invalid"] = cluster["attempt_invalid"] or candidate["attempt_invalid"]
            cluster["assignment_known"] = cluster["assignment_known"] and candidate["assignment_known"]
            cluster["runner_matches_assignment"] = (
                cluster["runner_matches_assignment"] and candidate["runner_matches_assignment"]
            )
        clusters.extend(opaque_clusters.values())

        for cluster in clusters:
            assignment = assignments.get(cluster["assignment_id"], {})
            identities = cluster["identities"]
            inventory[runner_id].append(
                {
                    "assignment_id": cluster["assignment_id"],
                    "attempt": cluster["attempt"],
                    "agent_instance_ids": sorted(identities.get("agent_instance_id", set())),
                    "agent_paths": sorted(identities.get("agent_path", set())),
                    "agent_thread_ids": sorted(identities.get("agent_thread_id", set())),
                    "token_estimate": assignment.get("token_estimate", 0),
                    "capsule_package_bytes": assignment.get("capsule_package_bytes", 0),
                    "opaque_lineage": bool(cluster.get("ambiguous"))
                    or bool(cluster.get("attempt_conflict"))
                    or bool(cluster.get("attempt_invalid"))
                    or any(
                        len(values) > 1
                        for values in cluster.get("artifact_values", {}).values()
                    )
                    or not bool(cluster.get("assignment_known"))
                    or not bool(cluster.get("runner_matches_assignment"))
                    or any(
                        len(identities.get(name, set())) != 1
                        for name in X_IDENTITY_FIELDS
                    ),
                    "evidence_receipts": sorted(cluster["receipts"]),
                }
            )
    return inventory


def x_base_key(row: dict[str, Any]) -> tuple[str, str, str, str] | None:
    assignment_id = row.get("assignment_id")
    attempt, issues = x_attempt(row)
    instance = row.get("agent_instance_id")
    path = row.get("agent_path")
    if (
        not isinstance(assignment_id, str)
        or not assignment_id
        or issues
        or not isinstance(instance, str)
        or not instance.strip()
        or not isinstance(path, str)
        or not path.strip()
        or path != path.strip()
        or not path.startswith("/root/")
        or str(PurePosixPath(path)) != path
        or any(part in {"", ".", ".."} for part in path.split("/")[2:])
    ):
        return None
    return assignment_id, attempt, instance, path


def x_full_key(row: dict[str, Any]) -> tuple[str, str, str, str, str] | None:
    base = x_base_key(row)
    identity = x_identity(row)
    if base is None or identity is None:
        return None
    return base[0], base[1], identity[0], identity[1], identity[2]


def x_canonical(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def x_values(rows: list[dict[str, Any]], *names: str) -> list[Any]:
    found: dict[str, Any] = {}
    for row in rows:
        for name in names:
            if row.get(name) is not None:
                found.setdefault(x_canonical(row[name]), row[name])
    return list(found.values())


def x_load_runner_jsonl(
    path: Path,
    byte_limit: int | None = None,
    expected_prefix_sha256: str | None = None,
    captured_bytes: bytes | None = None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    rows: list[dict[str, Any]] = []
    malformed: list[dict[str, Any]] = []
    if captured_bytes is None and not path.is_file():
        return rows, malformed
    try:
        if captured_bytes is not None:
            anchored_prefix = captured_bytes
            if byte_limit is not None and len(anchored_prefix) != byte_limit:
                raise ValueError("captured JSONL length differs from expected length")
        elif byte_limit is None:
            anchored_prefix = path.read_bytes()
        else:
            with path.open("rb") as handle:
                anchored_prefix = handle.read(byte_limit)
            if len(anchored_prefix) != byte_limit:
                raise ValueError("file shorter than checkpoint prefix")
        if (
            expected_prefix_sha256 is not None
            and hashlib.sha256(anchored_prefix).hexdigest()
            != expected_prefix_sha256
        ):
            raise ValueError("anchored bytes do not match checkpoint prefix hash")
        # The selected lineage checkpoint is the semantic observation boundary.
        # Bytes appended after that prefix are deliberately deferred to a later
        # checkpoint and must not be decoded into this validation transaction.
        text = anchored_prefix.decode("utf-8")
    except Exception as exc:
        digest = hashlib.sha256(
            locals().get("anchored_prefix", b"")
        ).hexdigest()
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
            row = x_json_loads(line)
        except Exception as exc:
            malformed.append(
                {
                    "source_receipt": f"{path.relative_to(ROOT)}:{line_no}",
                    "line_sha256": hashlib.sha256(line.encode("utf-8")).hexdigest(),
                    "error": f"{type(exc).__name__}: {exc}",
                }
            )
            continue
        if not isinstance(row, dict):
            malformed.append(
                {
                    "source_receipt": f"{path.relative_to(ROOT)}:{line_no}",
                    "line_sha256": hashlib.sha256(line.encode("utf-8")).hexdigest(),
                    "error": "row is not an object",
                }
            )
            continue
        row["_receipt_file"] = str(path.relative_to(ROOT))
        row["_receipt_line"] = line_no
        row["_receipt_line_sha256"] = hashlib.sha256(
            line.encode("utf-8")
        ).hexdigest()
        rows.append(row)
    return rows, malformed


def x_recover_leading_plus_row(
    source_receipt: Any,
    byte_limit: int | None = None,
    expected_prefix_sha256: str | None = None,
) -> tuple[dict[str, Any] | None, str | None, list[str]]:
    issues: list[str] = []
    if not isinstance(source_receipt, str):
        return None, None, ["malformed source receipt is not a string"]
    match = re.fullmatch(r"(runners/(runner-\d{2})/.+\.jsonl):(\d+)", source_receipt)
    if match is None:
        return None, None, ["malformed source receipt is not a physical runner JSONL line"]
    relative_ref, physical_runner, line_token = match.groups()
    path = ROOT / relative_ref
    try:
        if x_nonnegative_int(byte_limit) is None:
            raise ValueError("checkpoint prefix length unavailable")
        with path.open("rb") as handle:
            anchored_prefix = handle.read(byte_limit)
        if len(anchored_prefix) != byte_limit:
            raise ValueError("file shorter than checkpoint prefix")
        if (
            x_canonical_sha256(expected_prefix_sha256) is None
            or hashlib.sha256(anchored_prefix).hexdigest()
            != expected_prefix_sha256
        ):
            raise ValueError("anchored bytes do not match checkpoint prefix hash")
        lines = anchored_prefix.decode("utf-8").splitlines()
        line_no = int(line_token)
    except Exception as exc:
        return None, physical_runner, [f"malformed source cannot be decoded: {type(exc).__name__}"]
    if line_no < 1 or line_no > len(lines):
        return None, physical_runner, ["malformed source line is absent"]
    line = lines[line_no - 1]
    if not line.startswith("+") or line.startswith("++"):
        return None, physical_runner, ["malformed source is not exactly one leading-plus JSON object"]
    try:
        recovered = x_json_loads(line[1:])
    except Exception as exc:
        return None, physical_runner, [f"leading-plus payload parse failed: {type(exc).__name__}"]
    if not isinstance(recovered, dict):
        issues.append("leading-plus payload is not an object")
        return None, physical_runner, issues
    return recovered, physical_runner, issues


def x_claims_positive(row: dict[str, Any]) -> bool:
    credit_values = [
        row[name]
        for name in ("coverage_credit", "valid_coverage", "coverage_count")
        if name in row
    ]
    if credit_values and all(
        value is True
        or (isinstance(value, int) and not isinstance(value, bool) and value == 1)
        for value in credit_values
    ):
        return True
    if any(
        row.get(name) is True
        for name in (
            "validation_passed", "passed", "valid", "valid_coverage", "schema_validation_passed",
            "dispatch_validation_passed", "exact_evidence_validation_passed",
            "scope_validation_passed",
        )
    ):
        return True
    return any(
        str(row.get(name, "")).lower() in POSITIVE
        for name in (
            "validation_status", "status", "result_status", "state",
            "attempt_state", "attempt_status",
        )
    )


def x_claims_negative(row: dict[str, Any]) -> bool:
    credit_values = [
        row[name]
        for name in ("coverage_credit", "valid_coverage", "coverage_count")
        if name in row
    ]
    if any(
        value is False
        or (isinstance(value, int) and not isinstance(value, bool) and value != 1)
        or (value is not True and not isinstance(value, int))
        for value in credit_values
    ):
        return True
    if any(
        name in row and row.get(name) is False
        for name in (
            "validation_passed", "passed", "valid", "valid_coverage", "schema_validation_passed",
            "dispatch_validation_passed", "exact_evidence_validation_passed",
            "scope_validation_passed",
        )
    ):
        return True
    return any(
        any(marker in str(row.get(name, "")).lower() for marker in (
            "fail", "invalid", "reject", "quarant", "revok", "error"
        ))
        for name in (
            "validation_status", "status", "result_status", "state",
            "attempt_state", "attempt_status",
        )
    )


def x_terminal_negative(row: dict[str, Any]) -> bool:
    """Treat only terminal zero-credit registry events as attempt vetoes."""
    if row.get("zero_coverage") is True:
        return True
    false_flag = any(
        name in row and row.get(name) is False
        for name in (
            "validation_passed", "passed", "valid", "valid_coverage",
            "schema_validation_passed", "dispatch_validation_passed",
            "exact_evidence_validation_passed", "scope_validation_passed",
        )
    )
    statuses = [
        str(row.get(name, "")).lower()
        for name in (
            "validation_status", "status", "result_status", "state",
            "attempt_state", "attempt_status",
        )
        if row.get(name) is not None
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
        row[name]
        for name in ("coverage_credit", "valid_coverage", "coverage_count")
        if name in row
    ]
    explicit_zero = any(
        value is False
        or (isinstance(value, int) and not isinstance(value, bool) and value == 0)
        for value in credit_values
    )
    result_ref = first(row, "result_ref", "raw_result_ref", "bad_capture_ref")
    failure_evidence = any(
        row.get(name) not in (None, "", [])
        for name in (
            "validation_failure_code", "failure_reason", "failure_validation_ref",
            "bad_capture_validation_ref", "error", "errors",
        )
    ) or (
        isinstance(result_ref, str)
        and "/failed_attempts/" in result_ref.replace("\\", "/")
    )
    return (false_flag or explicit_zero) and failure_evidence


def x_positive_issues(row: dict[str, Any], registry: bool) -> list[str]:
    issues: list[str] = []
    credit_values = [
        row[name]
        for name in ("coverage_credit", "valid_coverage", "coverage_count")
        if name in row
    ]
    if not credit_values or any(
        not (
            value is True
            or (isinstance(value, int) and not isinstance(value, bool) and value == 1)
        )
        for value in credit_values
    ):
        issues.append("credit is not one")
    validation_positive = False
    for name in (
        "validation_passed", "passed", "valid", "valid_coverage", "schema_validation_passed",
        "dispatch_validation_passed", "exact_evidence_validation_passed",
        "scope_validation_passed", "schema_validation", "hash_validation",
        "range_validation",
    ):
        if row.get(name) is True:
            validation_positive = True
        elif row.get(name) is False:
            issues.append(f"{name} false")
    if row.get("zero_coverage") is True:
        issues.append("zero_coverage true")
    for name in ("errors", "validation_errors"):
        if name in row and row.get(name) not in (None, []):
            issues.append(f"{name} nonempty")
    for name in (
        "validation_status", "status", "result_status", "state",
        "attempt_state", "attempt_status",
    ):
        if row.get(name) is None:
            continue
        value = str(row[name]).lower()
        if value in X_NEGATIVE or any(
            marker in value
            for marker in ("fail", "invalid", "reject", "quarant", "pending", "revok", "error")
        ):
            issues.append(f"{name} negative")
        elif value in POSITIVE:
            validation_positive = True
    if not validation_positive:
        issues.append("receipt lacks explicit positive validation")
    return issues


def x_same_veto(candidate: dict[str, Any], veto: dict[str, Any]) -> bool:
    if candidate.get("assignment_id") != veto.get("assignment_id"):
        return False
    candidate_attempt, candidate_issues = x_attempt(candidate)
    veto_attempt, veto_issues = x_attempt(veto)
    if not candidate_issues and not veto_issues:
        return candidate_attempt == veto_attempt
    return any(
        candidate.get(field) and candidate.get(field) == veto.get(field)
        for field in X_IDENTITY_FIELDS
    )


def x_floor_veto_matches(
    floor: dict[str, Any], manifest: dict[str, Any], veto: dict[str, Any]
) -> bool:
    """Independently join floor vetoes by assignment+attempt first."""
    if veto.get("assignment_id") != floor.get("assignment_id"):
        return False
    floor_attempt = x_attempt_value(
        floor.get("attempt") if floor.get("attempt") is not None else manifest.get("attempt")
    )
    veto_attempt, _ = x_attempt(veto)
    if floor_attempt is not None and veto_attempt is not None:
        return floor_attempt == veto_attempt
    relations: list[bool] = []
    for field in X_IDENTITY_FIELDS:
        floor_value = floor.get(field) or manifest.get(field)
        veto_value = veto.get(field)
        if floor_value is not None and veto_value is not None:
            relations.append(str(floor_value) == str(veto_value))
    floor_hash = x_canonical_sha256(floor.get("result_sha256"))
    veto_hash = x_canonical_sha256(hash_field(veto, "result"))
    if floor_hash is not None and veto_hash is not None:
        relations.append(floor_hash == veto_hash)
    floor_ref = floor.get("result_ref")
    veto_ref = first(veto, "result_ref", "raw_result_ref")
    if floor_ref is not None and veto_ref is not None:
        relations.append(floor_ref == veto_ref)
    return bool(relations) and all(relations)


def x_digest(values: list[str] | set[str]) -> str:
    ordered = sorted(values)
    return hashlib.sha256(
        ("\n".join(ordered) + ("\n" if ordered else "")).encode("utf-8")
    ).hexdigest()


def x_manifest_key(
    row: dict[str, Any],
    registry_keys: set[tuple[str, str, str, str, str]],
) -> tuple[tuple[str, str, str, str, str] | None, list[str]]:
    direct = x_full_key(row)
    if direct is not None:
        return direct, []
    supplied = [row[name] for name in X_ATTEMPT_FIELDS if row.get(name) is not None]
    if supplied:
        _, issues = x_attempt(row)
        return None, issues or ["manifest full attempt key invalid"]
    identity = x_identity(row)
    assignment_id = row.get("assignment_id")
    if identity is None or not isinstance(assignment_id, str):
        return None, ["manifest identity incomplete"]
    matches = {
        key
        for key in registry_keys
        if key[0] == assignment_id and tuple(key[2:]) == identity
    }
    if len(matches) != 1:
        return None, ["manifest without attempt is not uniquely bound to registry attempt"]
    return next(iter(matches)), []


def x_context_ranges(
    assignment: dict[str, Any], capsule: dict[str, Any]
) -> tuple[list[list[int]], list[str]]:
    issues: list[str] = []
    values: list[Any] = [assignment.get("core_range")]
    context = capsule.get("context_ranges", [])
    if not isinstance(context, list):
        issues.append("capsule context_ranges is not an array")
        context = []
    values.extend(context)
    ranges: list[list[int]] = []
    for index, value in enumerate(values):
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


def x_scope_contradiction(value: Any) -> bool:
    if not isinstance(value, dict):
        return True
    return any(
        name in value and value.get(name) is not True
        for name in X_SCOPE_TRUE_IF_PRESENT
    ) or any(
        name in value and value.get(name) is not False
        for name in X_SCOPE_FALSE_IF_PRESENT
    )


def x_evidence_issues(
    ref: Any,
    assignment: dict[str, Any],
    capsule: dict[str, Any],
    source_lines: list[str],
) -> list[str]:
    if not isinstance(ref, dict):
        return ["evidence not object"]
    path, start, end, quote = evidence_parts(ref)
    end = start if end is None else end
    issues: list[str] = []
    if path != assignment["document_path"]:
        issues.append("evidence path mismatch")
    if (
        not isinstance(start, int)
        or isinstance(start, bool)
        or not isinstance(end, int)
        or isinstance(end, bool)
        or start > end
    ):
        return issues + ["evidence range invalid"]
    ranges, range_issues = x_context_ranges(assignment, capsule)
    issues.extend(range_issues)
    if not any(start >= low and end <= high for low, high in ranges):
        issues.append("evidence range outside capsule")
    if start < 1 or end > len(source_lines):
        return issues + ["evidence range outside source"]
    if not isinstance(quote, str) or not quote.strip():
        issues.append("evidence quote missing")
    elif quote not in "\n".join(source_lines[start - 1 : end]):
        issues.append("evidence quote mismatch")
    return issues


def x_raw_issues(
    raw: dict[str, Any],
    assignment: dict[str, Any],
    capsule: dict[str, Any],
    key: tuple[str, str, str, str, str],
    source_lines: list[str],
) -> list[str]:
    issues: list[str] = []
    _, range_issues = x_context_ranges(assignment, capsule)
    issues.extend(range_issues)
    if raw.get("assignment_id") != assignment["assignment_id"]:
        issues.append("raw assignment mismatch")
    optional = {
        "runner_id": assignment["runner_id"],
        "agent_instance_id": key[2],
        "agent_path": key[3],
        "model": assignment["required_model"],
        "reasoning_effort": assignment["required_reasoning_effort"],
        "role": assignment["role"],
        "window_id": assignment["window_id"],
        "doc_id": assignment["doc_id"],
        "document_path": assignment["document_path"],
        "core_range": assignment["core_range"],
        "terminal_after_result": True,
    }
    for name, wanted in optional.items():
        if name in raw and raw[name] != wanted:
            issues.append(f"raw {name} mismatch")
    if raw.get("agent_thread_id") not in (None, key[4]):
        issues.append("raw thread mismatch")
    if raw.get("audit_id") not in (None, AUDIT_ID):
        issues.append("raw audit mismatch")
    if "status" in raw:
        raw_status = str(raw["status"]).lower()
        if raw_status in X_NEGATIVE or any(
            marker in raw_status for marker in ("fail", "invalid", "reject", "quarant", "error")
        ):
            issues.append("raw status explicitly negative")
    if "scope_confirmation" in raw:
        scope_confirmation = raw.get("scope_confirmation")
        if scope_confirmation != X_SCOPE and x_scope_contradiction(scope_confirmation):
            issues.append("raw scope confirmation contradicts blind capsule use")
    scope_attestation = raw.get("scope_attestation")
    if scope_attestation is not None and x_scope_contradiction(scope_attestation):
        issues.append("raw scope attestation contradicts blind capsule use")
    reviewer_declaration = raw.get("reviewer_declaration")
    if reviewer_declaration is not None and x_scope_contradiction(reviewer_declaration):
        issues.append("raw reviewer declaration contradicts blind capsule use")
    optional_metadata = {
        "capsule_ref": assignment["capsule_ref"],
        "capsule_bytes": assignment["capsule_bytes"],
        "source_excerpt_ref": assignment["source_excerpt_ref"],
        "source_excerpt_bytes": assignment["source_excerpt_bytes"],
        "source_sha256": assignment["source_sha256"],
        "context_ranges": capsule.get("context_ranges", []),
    }
    for name, wanted in optional_metadata.items():
        if name in raw and raw[name] != wanted:
            issues.append(f"raw {name} mismatch")
    for stem, wanted in (
        ("capsule", assignment["capsule_sha256"]),
        ("source_excerpt", assignment["source_excerpt_sha256"]),
        ("source", assignment["source_sha256"]),
    ):
        observed = hash_field(raw, stem)
        if observed is not None and observed != wanted:
            issues.append(f"raw {stem} hash mismatch")
    for name in REQUIRED_ARRAYS:
        if not isinstance(raw.get(name), list):
            issues.append(f"raw {name} not array")
    exact_refs = raw.get("exact_evidence_refs")
    if not isinstance(exact_refs, list):
        return issues
    if not exact_refs:
        issues.append("raw exact evidence empty")
    ids: set[str] = set()
    for ref in exact_refs:
        if isinstance(ref, dict):
            evidence_id = first(ref, "evidence_id", "evidence_ref_id", "id", "ref_id")
            if evidence_id is not None:
                if not isinstance(evidence_id, str) or not evidence_id:
                    issues.append("evidence id invalid")
                elif evidence_id in ids:
                    issues.append("evidence id duplicate")
                else:
                    ids.add(evidence_id)
        issues.extend(x_evidence_issues(ref, assignment, capsule, source_lines))
    for list_name in ("observations", "candidate_findings", "explicit_non_gaps", "unknowns"):
        values = raw.get(list_name)
        if not isinstance(values, list):
            continue
        for item in values:
            if not isinstance(item, dict):
                issues.append(f"{list_name} item not object")
                continue
            refs = first(item, "evidence_ref_ids", "evidence_ids", "evidence_refs")
            if refs is None:
                continue
            if not isinstance(refs, list):
                issues.append(f"{list_name} item evidence refs are not an array")
            elif all(isinstance(ref, str) for ref in refs):
                if any(ref not in ids for ref in refs):
                    issues.append(f"{list_name} item cites unknown evidence")
            elif all(isinstance(ref, dict) for ref in refs):
                for ref in refs:
                    issues.extend(x_evidence_issues(ref, assignment, capsule, source_lines))
            else:
                issues.append(f"{list_name} item mixes invalid evidence reference types")
    return issues


def x_inventory_digest(rows: list[dict[str, Any]], key_name: str) -> str:
    rendered = b"".join(
        (
            json.dumps(row, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
            + "\n"
        ).encode("utf-8")
        for row in sorted(rows, key=lambda item: str(item.get(key_name)))
    )
    return hashlib.sha256(rendered).hexdigest()


def x_checkpoint_state(
    checkpoint_path: Path,
    lineage_anchor: dict[str, Any],
    seen_paths: set[Path] | None = None,
    chain_hashes: dict[Path, str] | None = None,
) -> tuple[
    dict[str, dict[str, Any]],
    dict[str, dict[str, Any]],
    dict[str, Path],
    dict[str, dict[str, Any]],
    dict[str, Any],
    list[str],
]:
    issues: list[str] = []
    seen_paths = set() if seen_paths is None else seen_paths
    chain_hashes = {} if chain_hashes is None else chain_hashes
    checkpoint_path = checkpoint_path.resolve()
    if checkpoint_path in seen_paths:
        return {}, {}, {}, {}, {}, ["lineage checkpoint chain contains a cycle"]
    seen_paths.add(checkpoint_path)
    if not under(checkpoint_path, ROOT / "coordination/lineage_v3"):
        return {}, {}, {}, {}, {}, ["lineage checkpoint chain path is out of scope"]
    try:
        checkpoint_bytes = checkpoint_path.read_bytes()
        checkpoint_digest = hashlib.sha256(checkpoint_bytes).hexdigest()
        chain_hashes[checkpoint_path] = checkpoint_digest
        checkpoint = x_json_loads(checkpoint_bytes.decode("utf-8"))
    except Exception as exc:
        return {}, {}, {}, {}, {}, [f"lineage checkpoint cannot be parsed: {type(exc).__name__}"]
    if not isinstance(checkpoint, dict):
        return {}, {}, {}, {}, {}, ["lineage checkpoint is not an object"]
    if checkpoint.get("schema") != "audit004.lineage_checkpoint.v1":
        issues.append("lineage checkpoint schema mismatch")
    if checkpoint.get("audit_id") != AUDIT_ID:
        issues.append("lineage checkpoint audit mismatch")
    if checkpoint.get("captured_by_thread_id") != "019f4a04-5fe1-71f3-b992-e599aad3da5b":
        issues.append("lineage checkpoint writer mismatch")
    sequence = checkpoint.get("sequence")
    sequence_value = x_nonnegative_int(sequence)
    if sequence_value is None:
        issues.append("lineage checkpoint sequence invalid")
    if sequence_value == 0 and checkpoint.get("parent") != {
        "kind": "sealed_initial_anchor",
        "ref": X_ANCHORS["initial_failure_lineage"][0],
        "sha256": X_ANCHORS["initial_failure_lineage"][1],
    }:
        issues.append("lineage checkpoint zero parent mismatch")
    elif sequence_value is not None and sequence_value != 0 and (
        not isinstance(checkpoint.get("parent"), dict)
        or checkpoint["parent"].get("kind") != "checkpoint"
    ):
        issues.append("later lineage checkpoint parent invalid")
    if not isinstance(checkpoint.get("checkpoint_id"), str) or not checkpoint.get("checkpoint_id"):
        issues.append("lineage checkpoint_id missing")
    if not isinstance(checkpoint.get("captured_at"), str) or not checkpoint.get("captured_at"):
        issues.append("lineage checkpoint captured_at missing")

    stream_rows = checkpoint.get("streams")
    if not isinstance(stream_rows, list) or not stream_rows:
        return {}, {}, {}, {}, checkpoint, issues + ["lineage checkpoint streams invalid"]
    streams: dict[str, dict[str, Any]] = {}
    empty_sha = hashlib.sha256(b"").hexdigest()
    for row in stream_rows:
        if not isinstance(row, dict):
            issues.append("lineage checkpoint contains non-object stream")
            continue
        ref = row.get("ref")
        if (
            not isinstance(ref, str)
            or not ref
            or ref in streams
            or PurePosixPath(ref).is_absolute()
            or str(PurePosixPath(ref)) != ref
            or ".." in PurePosixPath(ref).parts
            or not (
                re.fullmatch(r"runners/runner-\d{2}/.+\.jsonl", ref)
                or ref == "coordination/QUARANTINE_REGISTRY.jsonl"
            )
        ):
            issues.append("lineage checkpoint stream ref invalid or duplicated")
            continue
        state = row.get("state")
        count = row.get("prefix_bytes")
        wanted = x_canonical_sha256(row.get("prefix_sha256"))
        if (
            state not in {"present", "missing"}
            or x_nonnegative_int(count) is None
            or wanted is None
            or not isinstance(row.get("semantic_class"), str)
            or not row.get("semantic_class")
        ):
            issues.append(f"lineage checkpoint stream row malformed: {ref}")
            continue
        if state == "missing" and (count != 0 or wanted != empty_sha):
            issues.append(f"missing lineage stream is nonempty: {ref}")
        introduced_at_sequence = x_nonnegative_int(row.get("introduced_at_sequence"))
        if state == "present" and (
            introduced_at_sequence is None
            or sequence_value is None
            or introduced_at_sequence > sequence_value
        ):
            issues.append(f"lineage stream introduction sequence invalid: {ref}")
        if state == "missing" and row.get("introduced_at_sequence") is not None:
            issues.append(f"missing lineage stream has introduction sequence: {ref}")
        if state == "present" and row.get("ends_with_lf") is not True:
            issues.append(f"lineage checkpoint stream is not line-delimited: {ref}")
        streams[ref] = row
    if checkpoint.get("stream_inventory_sha256") != x_inventory_digest(
        [row for row in stream_rows if isinstance(row, dict)], "ref"
    ):
        issues.append("lineage checkpoint stream inventory digest mismatch")
    canonical_refs = {
        f"runners/runner-{number:02d}/{name}"
        for number in range(1, 13)
        for name in (
            "fresh_agent_assignment_registry.jsonl", "result_manifest.jsonl",
            "failed_attempts.jsonl", "ingest_errors.jsonl",
        )
    }
    if not canonical_refs.issubset(streams):
        issues.append("lineage checkpoint omits canonical stream markers")
    if streams.get("coordination/QUARANTINE_REGISTRY.jsonl", {}).get("state") != "present":
        issues.append("lineage checkpoint omits present root quarantine")
    initial_rows = {
        row.get("ref"): row
        for row in lineage_anchor.get("files", [])
        if isinstance(row, dict) and isinstance(row.get("ref"), str)
    }
    for ref, row in streams.items():
        path = ROOT / ref
        count = row["prefix_bytes"]
        if row.get("state") == "present":
            try:
                prefix_bytes = (
                    x_descriptor_prefix(path, count, row["prefix_sha256"])
                    if path.is_file()
                    else None
                )
                if prefix_bytes is None:
                    issues.append(f"lineage checkpoint prefix mismatch: {ref}")
                elif count and prefix_bytes[-1:] != b"\n":
                    issues.append(f"lineage checkpoint prefix ends mid-line: {ref}")
            except Exception:
                issues.append(f"lineage checkpoint prefix unreadable: {ref}")
        anchored = initial_rows.get(ref)
        if isinstance(anchored, dict):
            old_count = anchored.get("prefix_bytes")
            old_hash = anchored.get("prefix_sha256")
            if (
                row.get("state") != "present"
                or x_nonnegative_int(old_count) is None
                or count < old_count
            ):
                issues.append(f"lineage checkpoint does not extend initial anchor: {ref}")
            else:
                try:
                    if x_sha256_prefix(path, old_count) != old_hash:
                        issues.append(f"lineage checkpoint rewrites initial anchor: {ref}")
                except Exception:
                    issues.append(f"lineage checkpoint cannot prove initial anchor: {ref}")

    native_rows = checkpoint.get("native_sessions")
    if not isinstance(native_rows, list):
        native_rows = []
        issues.append("lineage checkpoint native sessions invalid")
    native_sessions: dict[str, dict[str, Any]] = {}
    for row in native_rows:
        if not isinstance(row, dict):
            issues.append("lineage checkpoint native session is non-object")
            continue
        session_id = row.get("session_id")
        agent_path = row.get("agent_path")
        if (
            not isinstance(session_id, str)
            or not session_id
            or session_id in native_sessions
            or not isinstance(agent_path, str)
            or agent_path != agent_path.strip()
            or not agent_path.startswith("/root/")
            or str(PurePosixPath(agent_path)) != agent_path
            or not isinstance(row.get("parent_thread_id"), str)
            or not row.get("parent_thread_id")
            or not isinstance(row.get("runner_id"), str)
            or x_nonnegative_int(row.get("prefix_bytes")) is None
            or x_canonical_sha256(row.get("prefix_sha256")) is None
            or row.get("ends_with_lf") is not True
            or x_nonnegative_int(row.get("introduced_at_sequence")) is None
            or sequence_value is None
            or x_nonnegative_int(row.get("introduced_at_sequence")) > sequence_value
        ):
            issues.append("lineage checkpoint native session row invalid or duplicated")
            continue
        native_sessions[session_id] = row
    if checkpoint.get("native_session_inventory_sha256") != x_inventory_digest(
        [row for row in native_rows if isinstance(row, dict)], "session_id"
    ):
        issues.append("lineage checkpoint native session inventory digest mismatch")
    native_paths: dict[str, Path] = {}
    sessions_root = Path.home() / ".codex" / "sessions"
    for path in sessions_root.rglob("*.jsonl"):
        if not path.is_file() or path.is_symlink():
            continue
        try:
            with path.open("rb") as handle:
                first_line = handle.readline()
            first_row = x_json_loads(first_line.decode("utf-8"))
        except Exception:
            continue
        payload = first_row.get("payload") if isinstance(first_row, dict) else None
        session_id = payload.get("id") if isinstance(payload, dict) else None
        if session_id not in native_sessions:
            continue
        if session_id in native_paths:
            issues.append(f"native session id resolves more than once: {session_id}")
        else:
            native_paths[session_id] = path
    for session_id, row in native_sessions.items():
        path = native_paths.get(session_id)
        if path is None:
            issues.append(f"checkpointed native session missing: {session_id}")
            continue
        try:
            raw = x_descriptor_prefix(
                path, row["prefix_bytes"], row["prefix_sha256"]
            )
            first_row = (
                x_json_loads(raw.splitlines()[0].decode("utf-8"))
                if raw
                else None
            )
        except Exception:
            issues.append(f"checkpointed native session unreadable: {session_id}")
            continue
        payload = first_row.get("payload") if isinstance(first_row, dict) else None
        source = payload.get("source") if isinstance(payload, dict) else None
        spawn = (
            source.get("subagent", {}).get("thread_spawn", {})
            if isinstance(source, dict)
            else {}
        )
        if (
            not isinstance(first_row, dict)
            or first_row.get("type") != "session_meta"
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
            issues.append(f"checkpointed native session metadata mismatch: {session_id}")

    artifact_rows = checkpoint.get("runner_artifacts")
    if not isinstance(artifact_rows, list) or not artifact_rows:
        artifact_rows = []
        issues.append("lineage checkpoint runner artifact inventory invalid")
    runner_artifacts: dict[str, dict[str, Any]] = {}
    for row in artifact_rows:
        if not isinstance(row, dict):
            issues.append("lineage checkpoint runner artifact is non-object")
            continue
        ref = row.get("ref")
        state = row.get("state")
        count = row.get("bytes")
        wanted = x_canonical_sha256(row.get("sha256"))
        if (
            not isinstance(ref, str)
            or not re.fullmatch(r"runners/runner-\d{2}/.+", ref)
            or ref.endswith(".jsonl")
            or ref in runner_artifacts
            or PurePosixPath(ref).is_absolute()
            or str(PurePosixPath(ref)) != ref
            or ".." in PurePosixPath(ref).parts
            or state not in {"present", "missing"}
            or x_nonnegative_int(count) is None
            or wanted is None
            or not isinstance(row.get("semantic_class"), str)
            or not row.get("semantic_class")
        ):
            issues.append("lineage checkpoint runner artifact row invalid or duplicated")
            continue
        if state == "missing" and (count != 0 or wanted != empty_sha):
            issues.append(f"missing runner artifact is nonempty: {ref}")
        introduced_at_sequence = x_nonnegative_int(row.get("introduced_at_sequence"))
        if state == "present" and (
            introduced_at_sequence is None
            or sequence_value is None
            or introduced_at_sequence > sequence_value
        ):
            issues.append(f"runner artifact introduction sequence invalid: {ref}")
        if state == "missing" and row.get("introduced_at_sequence") is not None:
            issues.append(f"missing runner artifact has introduction sequence: {ref}")
        path = ROOT / ref
        if state == "present" and row.get("semantic_class") != "checkpoint_metadata":
            if (
                not path.is_file()
                or path.is_symlink()
                or path.stat().st_size != count
                or sha256(path) != wanted
            ):
                issues.append(f"checkpointed runner artifact changed: {ref}")
        runner_artifacts[ref] = row
    if checkpoint.get("runner_artifact_inventory_sha256") != x_inventory_digest(
        [row for row in artifact_rows if isinstance(row, dict)], "ref"
    ):
        issues.append("lineage checkpoint runner artifact inventory digest mismatch")
    completion_refs = {
        f"runners/runner-{number:02d}/RUNNER_COMPLETE.json" for number in range(1, 13)
    }
    if not completion_refs.issubset(runner_artifacts):
        issues.append("lineage checkpoint omits runner completion markers")
    if sequence_value is not None and sequence_value > 0:
        parent_ref = parent.get("ref") if isinstance(parent, dict) else None
        parent_hash = (
            x_canonical_sha256(parent.get("sha256"))
            if isinstance(parent, dict)
            else None
        )
        parent_sequence = parent.get("sequence") if isinstance(parent, dict) else None
        parent_path = ROOT / parent_ref if isinstance(parent_ref, str) else None
        if (
            parent_path is None
            or not under(parent_path, ROOT / "coordination/lineage_v3")
            or not parent_path.is_file()
            or parent_hash is None
            or sha256(parent_path) != parent_hash
            or parent_sequence != sequence_value - 1
        ):
            issues.append("lineage checkpoint parent ref/hash/sequence invalid")
        else:
            (
                parent_streams,
                parent_sessions,
                _,
                parent_artifacts,
                parent_doc,
                parent_issues,
            ) = x_checkpoint_state(
                parent_path,
                lineage_anchor,
                seen_paths,
                chain_hashes,
            )
            issues.extend(parent_issues)
            if parent_doc.get("sequence") != sequence_value - 1:
                issues.append("lineage checkpoint parent document sequence mismatch")
            for ref, old in parent_streams.items():
                current = streams.get(ref)
                if not isinstance(current, dict):
                    issues.append(f"lineage checkpoint drops parent stream: {ref}")
                    continue
                if current.get("semantic_class") != old.get("semantic_class"):
                    issues.append(f"lineage checkpoint changes stream class: {ref}")
                if current.get("introduced_at_sequence") != old.get("introduced_at_sequence"):
                    issues.append(f"lineage checkpoint changes stream introduction: {ref}")
                if old.get("state") == "present":
                    if (
                        current.get("state") != "present"
                        or current.get("prefix_bytes", -1) < old.get("prefix_bytes", 0)
                    ):
                        issues.append(f"lineage checkpoint shrinks parent stream: {ref}")
                    else:
                        try:
                            if x_sha256_prefix(ROOT / ref, old["prefix_bytes"]) != old.get(
                                "prefix_sha256"
                            ):
                                issues.append(f"lineage checkpoint rewrites parent stream: {ref}")
                        except Exception:
                            issues.append(f"lineage checkpoint cannot prove parent stream: {ref}")
                elif (
                    current.get("state") == "present"
                    and current.get("introduced_at_sequence") != sequence_value
                ):
                    issues.append(f"newly present stream sequence invalid: {ref}")
            for ref, current in streams.items():
                if ref not in parent_streams and current.get("introduced_at_sequence") != sequence_value:
                    issues.append(f"new stream sequence invalid: {ref}")
            for session_id, old in parent_sessions.items():
                current = native_sessions.get(session_id)
                if not isinstance(current, dict):
                    issues.append(f"lineage checkpoint drops native session: {session_id}")
                    continue
                for name in ("runner_id", "parent_thread_id", "agent_path", "introduced_at_sequence"):
                    if current.get(name) != old.get(name):
                        issues.append(f"lineage checkpoint changes native session {name}: {session_id}")
                if current.get("prefix_bytes", -1) < old.get("prefix_bytes", 0):
                    issues.append(f"lineage checkpoint shrinks native session: {session_id}")
                else:
                    path = native_paths.get(session_id)
                    try:
                        if path is None or x_sha256_prefix(path, old["prefix_bytes"]) != old.get(
                            "prefix_sha256"
                        ):
                            issues.append(f"lineage checkpoint rewrites native session: {session_id}")
                    except Exception:
                        issues.append(f"lineage checkpoint cannot prove native session: {session_id}")
            for session_id, current in native_sessions.items():
                if (
                    session_id not in parent_sessions
                    and current.get("introduced_at_sequence") != sequence_value
                ):
                    issues.append(f"new native session sequence invalid: {session_id}")
            for ref, old in parent_artifacts.items():
                current = runner_artifacts.get(ref)
                if not isinstance(current, dict):
                    issues.append(f"lineage checkpoint drops runner artifact: {ref}")
                    continue
                if current.get("semantic_class") != old.get("semantic_class"):
                    issues.append(f"lineage checkpoint changes runner artifact class: {ref}")
                if old.get("state") == "present":
                    for name in ("state", "bytes", "sha256", "introduced_at_sequence"):
                        if current.get(name) != old.get(name):
                            issues.append(f"lineage checkpoint changes runner artifact: {ref}")
                            break
                elif (
                    current.get("state") == "present"
                    and current.get("introduced_at_sequence") != sequence_value
                ):
                    issues.append(f"newly present runner artifact sequence invalid: {ref}")
            for ref, current in runner_artifacts.items():
                if (
                    ref not in parent_artifacts
                    and current.get("introduced_at_sequence") != sequence_value
                ):
                    issues.append(f"new runner artifact sequence invalid: {ref}")
    return streams, native_sessions, native_paths, runner_artifacts, checkpoint, issues


def x_custom_tool_issues(rows: list[dict[str, Any]]) -> list[str]:
    """Independently enforce V3's no-custom-tool prospective-credit rule.

    Arbitrary V8 plus nested tools is not positively confineable with a
    substring check.  The independent verifier therefore rejects the entire
    custom-tool capability instead of sharing or trusting the primary's
    implementation.
    """
    forbidden_types = {"custom_tool_call", "custom_tool_call_output"}
    observed_lines = [
        position
        for position, row in enumerate(rows, 1)
        if isinstance(row, dict)
        and (
            row.get("type") in forbidden_types
            or (
                isinstance(row.get("payload"), dict)
                and row["payload"].get("type") in forbidden_types
            )
        )
    ]
    if not observed_lines:
        return []
    return [
        "prospective V3 session contains forbidden custom-tool call/output events "
        f"at transcript lines {observed_lines}"
    ]


def x_read_closed_native_session(
    session_path: Path,
    session_row: dict[str, Any],
) -> tuple[bytes | None, list[str]]:
    """Independently require the checkpoint to cover the complete live file."""
    count = session_row.get("prefix_bytes")
    device = session_row.get("device")
    inode = session_row.get("inode")
    if x_nonnegative_int(count) is None:
        return None, ["native session checkpoint length invalid"]
    if x_nonnegative_int(device) is None or x_nonnegative_int(inode) is None:
        return None, ["native session checkpoint file identity invalid"]
    descriptor: int | None = None
    try:
        flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
        descriptor = os.open(session_path, flags)
        opened = os.fstat(descriptor)
        body = os.pread(descriptor, count + 1, 0)
        finished = os.fstat(descriptor)
        os.close(descriptor)
        descriptor = None
        final_path_state = session_path.lstat()
    except Exception as exc:
        if descriptor is not None:
            os.close(descriptor)
        return None, [f"native session descriptor capture failed: {type(exc).__name__}"]
    issues: list[str] = []
    if (
        (opened.st_dev, opened.st_ino) != (device, inode)
        or (finished.st_dev, finished.st_ino) != (device, inode)
        or (final_path_state.st_dev, final_path_state.st_ino) != (device, inode)
    ):
        issues.append("native session descriptor identity differs from checkpoint")
    if opened.st_size != count or finished.st_size != count or len(body) != count:
        issues.append("native session descriptor exposes bytes beyond its terminal seal")
    if (
        opened.st_size != finished.st_size
        or opened.st_mtime_ns != finished.st_mtime_ns
        or opened.st_ctime_ns != finished.st_ctime_ns
        or finished.st_size != final_path_state.st_size
        or finished.st_mtime_ns != final_path_state.st_mtime_ns
        or finished.st_ctime_ns != final_path_state.st_ctime_ns
    ):
        issues.append("native session descriptor changed during capture")
    if hashlib.sha256(body).hexdigest() != session_row.get("prefix_sha256"):
        issues.append("native session complete hash differs from checkpoint")
    return (body if not issues else None), issues


def x_agent_message_issues(
    rows: list[dict[str, Any]],
    agent_path: Any,
) -> list[str]:
    """Verify delivery isolation with an event-state relation, independently."""
    problems: set[str] = set()
    user_events: list[int] = []
    turn_events: list[tuple[int, dict[str, Any]]] = []
    delivery_events: list[tuple[int, dict[str, Any]]] = []
    output_events: list[int] = []

    for position, row in enumerate(rows, 1):
        payload = row.get("payload") if isinstance(row, dict) else None
        if row.get("type") == "turn_context":
            turn_events.append(
                (position, payload if isinstance(payload, dict) else {})
            )
        if row.get("type") != "response_item" or not isinstance(payload, dict):
            continue
        if payload.get("type") == "message":
            role = payload.get("role")
            if role == "user":
                user_events.append(position)
            if role in {"user", "developer", "system"} and delivery_events:
                problems.add("inbound message observed after NEW_TASK delivery")
        if payload.get("type") != "agent_message":
            continue
        output_shape = (
            set(payload) == {"type", "message", "phase", "memory_citation"}
            and payload.get("phase") in {"commentary", "final_answer"}
            and isinstance(payload.get("message"), str)
        )
        if output_shape:
            output_events.append(position)
            if not delivery_events:
                problems.add("agent output precedes NEW_TASK delivery")
        else:
            delivery_events.append((position, payload))

    if len(delivery_events) != 1:
        problems.add("NEW_TASK delivery cardinality differs from one")
        return sorted(problems)
    position, delivery = delivery_events[0]
    expected_keys = {
        "type", "author", "recipient", "content",
        "internal_chat_message_metadata_passthrough",
    }
    if set(delivery) != expected_keys:
        problems.add("NEW_TASK delivery schema differs from the sealed schema")
    expected_header = (
        f"Message Type: NEW_TASK\nTask name: {agent_path}\n"
        "Sender: /root\nPayload:\n"
    )
    content = delivery.get("content")
    header_ok = (
        isinstance(content, list)
        and len(content) == 2
        and content[0] == {"type": "input_text", "text": expected_header}
    )
    cipher_ok = (
        isinstance(content, list)
        and len(content) == 2
        and isinstance(content[1], dict)
        and set(content[1]) == {"type", "encrypted_content"}
        and content[1].get("type") == "encrypted_content"
        and isinstance(content[1].get("encrypted_content"), str)
        and content[1]["encrypted_content"].startswith("gAAAAA")
    )
    if not header_ok or not cipher_ok:
        problems.add("NEW_TASK delivery envelope is not canonical")
    if delivery.get("author") != "/root" or delivery.get("recipient") != agent_path:
        problems.add("NEW_TASK delivery endpoints differ from root and assigned agent")
    metadata = delivery.get("internal_chat_message_metadata_passthrough")
    delivery_turn_id = (
        metadata.get("turn_id")
        if isinstance(metadata, dict) and set(metadata) == {"turn_id"}
        else None
    )
    context_turn_id = (
        turn_events[0][1].get("turn_id") if len(turn_events) == 1 else None
    )
    if (
        len(user_events) != 1
        or len(turn_events) != 1
        or not (user_events[0] < turn_events[0][0] < position)
        or not isinstance(delivery_turn_id, str)
        or delivery_turn_id != context_turn_id
    ):
        problems.add("NEW_TASK delivery is not bound to the sole initial turn")
    return sorted(problems)


def x_transcript_action_issues_legacy(rows: list[dict[str, Any]]) -> list[str]:
    """Independently anti-join transcript events against a closed safe grammar."""
    findings: set[str] = set()
    outer_grammar = {
        "session_meta", "event_msg", "response_item",
        "inter_agent_communication_metadata", "world_state", "turn_context",
    }
    event_grammar = {
        "task_started", "agent_reasoning", "token_count", "agent_message",
        "task_complete",
    }
    response_grammar = {
        "reasoning", "message", "agent_message", "function_call",
        "function_call_output", "custom_tool_call", "custom_tool_call_output",
    }
    call_relation: dict[str, tuple[int, str]] = {}
    output_relation: dict[str, tuple[int, str]] = {}

    for line_number, row in enumerate(rows, 1):
        outer = row.get("type") if isinstance(row, dict) else None
        payload = row.get("payload") if isinstance(row, dict) else None
        if outer not in outer_grammar:
            findings.add(f"transcript outer grammar rejects line {line_number}: {outer!r}")
            continue
        if outer == "event_msg":
            event_kind = payload.get("type") if isinstance(payload, dict) else None
            if event_kind not in event_grammar:
                findings.add(
                    f"event grammar rejects actionable/unknown line {line_number}: {event_kind!r}"
                )
            continue
        if outer != "response_item":
            continue
        if not isinstance(payload, dict):
            findings.add(f"response grammar rejects non-object line {line_number}")
            continue
        kind = payload.get("type")
        if kind not in response_grammar:
            findings.add(
                f"response grammar rejects actionable/unknown line {line_number}: {kind!r}"
            )
            continue
        if kind == "message" and payload.get("role") not in {
            "developer", "user", "assistant"
        }:
            findings.add(f"response grammar rejects message role at line {line_number}")
        if kind == "function_call":
            try:
                arguments = x_json_loads(payload.get("arguments", ""))
            except Exception:
                arguments = None
            metadata = payload.get("internal_chat_message_metadata_passthrough")
            call_id = payload.get("call_id")
            turn_id = metadata.get("turn_id") if isinstance(metadata, dict) else None
            valid_call = (
                set(payload)
                == {
                    "type", "id", "call_id", "namespace", "name", "arguments",
                    "internal_chat_message_metadata_passthrough",
                }
                and payload.get("namespace") == "collaboration"
                and payload.get("name") == "send_message"
                and isinstance(call_id, str)
                and call_id
                and call_id not in call_relation
                and isinstance(turn_id, str)
                and turn_id
                and isinstance(arguments, dict)
                and arguments.get("target") == "/root"
                and set(arguments) == {"target", "message"}
                and isinstance(arguments.get("message"), str)
                and arguments["message"].startswith("gAAAAA")
            )
            if valid_call:
                call_relation[call_id] = (line_number, turn_id)
            else:
                findings.add(f"function-call relation rejects line {line_number}")
        elif kind == "function_call_output":
            metadata = payload.get("internal_chat_message_metadata_passthrough")
            call_id = payload.get("call_id")
            turn_id = metadata.get("turn_id") if isinstance(metadata, dict) else None
            valid_output = (
                set(payload)
                == {
                    "type", "call_id", "output",
                    "internal_chat_message_metadata_passthrough",
                }
                and isinstance(call_id, str)
                and call_id
                and call_id not in output_relation
                and payload.get("output") == ""
                and isinstance(turn_id, str)
                and turn_id
            )
            if valid_output:
                output_relation[call_id] = (line_number, turn_id)
            else:
                findings.add(f"function-output relation rejects line {line_number}")

    if set(call_relation) != set(output_relation):
        findings.add("function-call/output relation is not one-to-one")
    for call_id in set(call_relation) & set(output_relation):
        call_line, call_turn = call_relation[call_id]
        output_line, output_turn = output_relation[call_id]
        if call_line >= output_line or call_turn != output_turn:
            findings.add("function-call/output relation has invalid chronology or turn")
    return sorted(findings)


def x_transcript_action_issues(rows: list[dict[str, Any]]) -> list[str]:
    """Relationally require every transcript row to match one sealed shape."""
    findings: set[str] = set()
    session_meta_keys = frozenset({
        "session_id", "id", "parent_thread_id", "timestamp", "cwd",
        "originator", "cli_version", "source", "thread_source",
        "agent_nickname", "agent_path", "model_provider", "base_instructions",
        "history_mode", "multi_agent_version", "context_window", "git",
    })
    turn_keys = frozenset({
        "turn_id", "cwd", "workspace_roots", "current_date", "timezone",
        "approval_policy", "approvals_reviewer", "sandbox_policy",
        "permission_profile", "model", "comp_hash", "personality",
        "collaboration_mode", "multi_agent_version", "multi_agent_mode",
        "realtime_active", "effort", "summary",
    })
    event_shapes = {
        "task_started": frozenset({
            "type", "collaboration_mode_kind", "model_context_window",
            "started_at", "turn_id",
        }),
        "agent_reasoning": frozenset({"type", "text"}),
        "token_count": frozenset({"type", "info", "rate_limits"}),
        "agent_message": frozenset({"type", "message", "phase", "memory_citation"}),
        "task_complete": frozenset({
            "type", "completed_at", "duration_ms", "last_agent_message",
            "time_to_first_token_ms", "turn_id",
        }),
    }
    response_shapes = {
        "reasoning": {
            frozenset({
                "type", "id", "summary", "encrypted_content",
                "internal_chat_message_metadata_passthrough",
            })
        },
        "message": {
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
        },
        "agent_message": {
            frozenset({
                "type", "author", "recipient", "content",
                "internal_chat_message_metadata_passthrough",
            }),
            frozenset({"type", "message", "phase", "memory_citation"}),
        },
        "custom_tool_call": {
            frozenset({
                "type", "id", "call_id", "name", "input", "status",
                "internal_chat_message_metadata_passthrough",
            })
        },
        "custom_tool_call_output": {
            frozenset({
                "type", "call_id", "output",
                "internal_chat_message_metadata_passthrough",
            })
        },
    }
    singleton_positions: dict[str, list[int]] = defaultdict(list)
    turns: list[tuple[int, dict[str, Any]]] = []
    starts: list[tuple[int, dict[str, Any]]] = []
    completes: list[tuple[int, dict[str, Any]]] = []
    response_turns: list[tuple[int, str]] = []
    calls: dict[str, tuple[int, str]] = {}
    outputs: dict[str, tuple[int, str]] = {}

    for position, row in enumerate(rows, 1):
        if not isinstance(row, dict) or frozenset(row) != frozenset(
            {"timestamp", "type", "payload"}
        ):
            findings.add(f"outer row shape rejects transcript line {position}")
            continue
        outer = row.get("type")
        payload = row.get("payload")
        if not isinstance(payload, dict):
            findings.add(f"non-object payload rejects transcript line {position}")
            continue
        payload_keys = frozenset(payload)
        if outer == "session_meta":
            singleton_positions[outer].append(position)
            if payload_keys != session_meta_keys:
                findings.add(f"session_meta shape rejects transcript line {position}")
            continue
        if outer == "world_state":
            singleton_positions[outer].append(position)
            world_state = payload.get("state")
            if (
                payload_keys != frozenset({"full", "state"})
                or not isinstance(payload.get("full"), bool)
                or not isinstance(world_state, dict)
            ):
                findings.add(f"world_state shape rejects transcript line {position}")
            elif (
                set(world_state)
                - {
                    "agents_md", "apps_instructions", "environments",
                    "plugins_instructions", "skills",
                }
                or not {"agents_md", "environments"}.issubset(world_state)
            ):
                findings.add(
                    f"world_state ambient-context relation rejects transcript line {position}"
                )
            continue
        if outer == "turn_context":
            singleton_positions[outer].append(position)
            turns.append((position, payload))
            if payload_keys != turn_keys:
                findings.add(f"turn_context shape rejects transcript line {position}")
            if payload.get("summary") != "auto":
                findings.add(
                    f"turn_context inherited-summary relation rejects transcript line {position}"
                )
            continue
        if outer == "inter_agent_communication_metadata":
            singleton_positions[outer].append(position)
            if payload != {"trigger_turn": True}:
                findings.add(f"inter-agent metadata rejects transcript line {position}")
            continue
        if outer == "event_msg":
            event_kind = payload.get("type")
            if event_kind not in event_shapes or payload_keys != event_shapes[event_kind]:
                findings.add(f"event relation rejects transcript line {position}: {event_kind!r}")
            if event_kind == "task_started":
                starts.append((position, payload))
            elif event_kind == "task_complete":
                completes.append((position, payload))
            continue
        if outer != "response_item":
            findings.add(f"outer relation rejects transcript line {position}: {outer!r}")
            continue

        kind = payload.get("type")
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
                findings.add(
                    f"response turn metadata shape rejects transcript line {position}"
                )
        if kind in response_shapes:
            if payload_keys not in response_shapes[kind]:
                findings.add(f"response shape rejects transcript line {position}: {kind!r}")
            if kind == "message":
                role = payload.get("role")
                content_kind = "output_text" if role == "assistant" else "input_text"
                if role not in {"developer", "user", "assistant"}:
                    findings.add(f"message role rejects transcript line {position}")
                content = payload.get("content")
                if (
                    not isinstance(content, list)
                    or any(
                        not isinstance(item, dict)
                        or item != {"type": content_kind, "text": item.get("text")}
                        or not isinstance(item.get("text"), str)
                        for item in content
                    )
                ):
                    findings.add(f"message content rejects transcript line {position}")
            elif kind == "reasoning":
                summary = payload.get("summary")
                if (
                    not isinstance(summary, list)
                    or any(
                        not isinstance(item, dict)
                        or item != {"type": "summary_text", "text": item.get("text")}
                        or not isinstance(item.get("text"), str)
                        for item in summary
                    )
                ):
                    findings.add(f"reasoning summary rejects transcript line {position}")
            metadata = payload.get("internal_chat_message_metadata_passthrough")
            if isinstance(metadata, dict) and isinstance(metadata.get("turn_id"), str):
                response_turns.append((position, metadata["turn_id"]))
            continue

        if kind == "function_call":
            try:
                arguments = x_json_loads(payload.get("arguments", ""))
            except Exception:
                arguments = None
            metadata = payload.get("internal_chat_message_metadata_passthrough")
            call_id = payload.get("call_id")
            turn_id = metadata.get("turn_id") if isinstance(metadata, dict) else None
            valid = (
                payload_keys
                == frozenset({
                    "type", "id", "call_id", "namespace", "name", "arguments",
                    "internal_chat_message_metadata_passthrough",
                })
                and payload.get("namespace") == "collaboration"
                and payload.get("name") == "send_message"
                and isinstance(call_id, str) and call_id and call_id not in calls
                and isinstance(turn_id, str) and turn_id
                and isinstance(arguments, dict)
                and set(arguments) == {"target", "message"}
                and arguments.get("target") == "/root"
                and isinstance(arguments.get("message"), str)
                and arguments["message"].startswith("gAAAAA")
            )
            if valid:
                calls[call_id] = (position, turn_id)
            else:
                findings.add(f"function-call relation rejects transcript line {position}")
            continue
        if kind == "function_call_output":
            metadata = payload.get("internal_chat_message_metadata_passthrough")
            call_id = payload.get("call_id")
            turn_id = metadata.get("turn_id") if isinstance(metadata, dict) else None
            valid = (
                payload_keys
                == frozenset({
                    "type", "call_id", "output",
                    "internal_chat_message_metadata_passthrough",
                })
                and isinstance(call_id, str) and call_id and call_id not in outputs
                and payload.get("output") == ""
                and isinstance(turn_id, str) and turn_id
            )
            if valid:
                outputs[call_id] = (position, turn_id)
            else:
                findings.add(f"function-output relation rejects transcript line {position}")
            continue
        findings.add(f"response relation rejects transcript line {position}: {kind!r}")

    authorized_turn = turns[0][1].get("turn_id") if len(turns) == 1 else None
    if singleton_positions.get("session_meta") != [1]:
        findings.add("session_meta relation is not exactly the first transcript row")
    for singleton in (
        "world_state", "turn_context", "inter_agent_communication_metadata"
    ):
        if len(singleton_positions.get(singleton, [])) != 1:
            findings.add(f"{singleton} relation cardinality differs from one")
    if len(starts) != 1 or starts[0][1].get("turn_id") != authorized_turn:
        findings.add("task_started relation is not bound to the sole turn")
    if (
        len(completes) != 1
        or completes[0][0] != len(rows)
        or completes[0][1].get("turn_id") != authorized_turn
    ):
        findings.add("task_complete relation is not the sole terminal turn event")
    if set(calls) != set(outputs):
        findings.add("sealed function call/output relation is not one-to-one")
    for call_id in set(calls) & set(outputs):
        call_line, call_turn = calls[call_id]
        output_line, output_turn = outputs[call_id]
        if (
            call_line >= output_line
            or call_turn != output_turn
            or call_turn != authorized_turn
        ):
            findings.add("sealed function relation has invalid chronology or sole-turn binding")
    for position, response_turn in response_turns:
        if response_turn != authorized_turn:
            findings.add(f"response turn relation rejects transcript line {position}")
    return sorted(findings)


def x_session_state_issues(
    rows: list[dict[str, Any]],
    result_bytes: bytes,
) -> list[str]:
    """Independently validate the session as a finite event-state relation."""
    problems: set[str] = set()
    relation: list[tuple[str, str | None, str | None]] = []
    for row in rows:
        payload = row.get("payload") if isinstance(row, dict) else None
        payload = payload if isinstance(payload, dict) else {}
        relation.append(
            (row.get("type"), payload.get("type"), payload.get("role"))
        )

    def positions(predicate: Any) -> list[int]:
        return [
            index
            for index, item in enumerate(relation, 1)
            if predicate(item, rows[index - 1].get("payload", {}))
        ]

    meta = positions(lambda item, _payload: item[0] == "session_meta")
    started = positions(
        lambda item, _payload: item[:2] == ("event_msg", "task_started")
    )
    developers = positions(
        lambda item, _payload: item == ("response_item", "message", "developer")
    )
    users = positions(
        lambda item, _payload: item == ("response_item", "message", "user")
    )
    world = positions(lambda item, _payload: item[0] == "world_state")
    turns = positions(lambda item, _payload: item[0] == "turn_context")
    iac = positions(
        lambda item, _payload: item[0] == "inter_agent_communication_metadata"
    )
    delivery = positions(
        lambda item, payload: item[:2] == ("response_item", "agent_message")
        and isinstance(payload, dict)
        and "author" in payload
    )
    final_events = positions(
        lambda item, _payload: item[:2] == ("event_msg", "agent_message")
    )
    assistants = positions(
        lambda item, _payload: item == ("response_item", "message", "assistant")
    )
    completed = positions(
        lambda item, _payload: item[:2] == ("event_msg", "task_complete")
    )
    cardinality = tuple(
        len(values)
        for values in (
            meta, started, users, world, turns, iac, delivery,
            final_events, assistants, completed,
        )
    )
    if cardinality != (1,) * 10:
        return [f"session state relation cardinality mismatch: {cardinality}"]

    m, s, u, w, t, i, d, e, a, c = (
        meta[0], started[0], users[0], world[0], turns[0], iac[0],
        delivery[0], final_events[0], assistants[0], completed[0],
    )
    ordered_setup = (
        m == 1
        and s == 2
        and s < u < w < t < i < d < e
        and e + 1 == a
        and a < c == len(rows)
        and all(s < line < u for line in developers)
    )
    if not ordered_setup:
        problems.add("session state relation chronology mismatch")
    setup_positions = {m, s, u, w, t, i, d, *developers}
    if setup_positions != set(range(1, d + 1)):
        problems.add("pre-NEW_TASK relation contains a non-setup event")

    work_relation = {
        ("event_msg", "agent_reasoning"), ("event_msg", "token_count"),
        ("response_item", "reasoning"), ("response_item", "function_call"),
        ("response_item", "function_call_output"),
        ("response_item", "custom_tool_call"),
        ("response_item", "custom_tool_call_output"),
    }
    for line in range(d + 1, e):
        if relation[line - 1][:2] not in work_relation:
            problems.add(f"work-state relation rejects transcript line {line}")
    terminal_tail_relation = {
        ("event_msg", "agent_reasoning"), ("event_msg", "token_count"),
        ("response_item", "reasoning"),
    }
    for line in range(a + 1, c):
        if relation[line - 1][:2] not in terminal_tail_relation:
            problems.add(f"post-output relation rejects transcript line {line}")

    event_payload = rows[e - 1].get("payload", {})
    assistant_payload = rows[a - 1].get("payload", {})
    complete_payload = rows[c - 1].get("payload", {})
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
        or len({event_text, assistant_text, completion_text}) != 1
        or x_utf8_bytes(completion_text) != result_bytes
    ):
        problems.add("terminal response relation differs from raw result")
    return sorted(problems)


def x_native_session_issues(
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
    raw_bytes, closure_issues = x_read_closed_native_session(
        session_path, session_row
    )
    if closure_issues or raw_bytes is None:
        return closure_issues, {}
    try:
        physical_lines = raw_bytes.decode("utf-8").splitlines()
        if any(not line.strip() for line in physical_lines):
            raise ValueError("blank physical transcript row")
        rows = [x_json_loads(line) for line in physical_lines]
    except Exception as exc:
        return [f"native session prefix invalid: {type(exc).__name__}"], {}
    if not rows or any(not isinstance(row, dict) for row in rows):
        return ["native session contains non-object row"], {}
    user_messages = [
        row
        for row in rows
        if row.get("type") == "response_item"
        and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") == "message"
        and row["payload"].get("role") == "user"
    ]
    if len(user_messages) != 1:
        issues.append("native session user assignment message cardinality mismatch")
    issues.extend(x_agent_message_issues(rows, record.get("agent_path")))
    issues.extend(x_transcript_action_issues(rows))
    issues.extend(x_session_state_issues(rows, result_bytes))
    issues.extend(x_custom_tool_issues(rows))
    meta = rows[0]
    payload = meta.get("payload")
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
        issues.append("native session metadata does not bind attempt")
    if record.get("agent_thread_id") != session_id:
        issues.append("stored thread does not bind native session")
    turn_rows = [
        (index, row)
        for index, row in enumerate(rows, 1)
        if row.get("type") == "turn_context"
    ]
    if len(turn_rows) != 1:
        issues.append("native session turn_context cardinality mismatch")
    else:
        turn_payload = turn_rows[0][1].get("payload")
        if (
            not isinstance(turn_payload, dict)
            or turn_payload.get("model") != assignment.get("required_model")
            or turn_payload.get("effort") != assignment.get("required_reasoning_effort")
        ):
            issues.append("native session model/effort mismatch")
    completion_rows = [
        (index, row)
        for index, row in enumerate(rows, 1)
        if row.get("type") == "event_msg"
        and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") == "task_complete"
    ]
    if len(completion_rows) != 1:
        issues.append("native session task_complete cardinality mismatch")
    else:
        index, completion = completion_rows[0]
        if index != len(rows):
            issues.append("native session has output after task_complete")
        last_message = completion["payload"].get("last_agent_message")
        if (
            not isinstance(last_message, str)
            or x_utf8_bytes(last_message) != result_bytes
        ):
            issues.append("native session terminal output differs from raw result")
    if str(assignment.get("assignment_id", "")).encode("utf-8") not in raw_bytes:
        issues.append("native session omits assignment_id")
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


def x_localized_session_credit_state(
    floor_receipts: dict[str, dict[str, Any]],
    prospective_receipts: list[dict[str, Any]],
    failed_floor_assignments: set[str],
    failed_prospective_assignments: set[str],
) -> tuple[
    dict[str, dict[str, Any]],
    list[dict[str, Any]],
    set[str],
    set[str],
    set[str],
    set[str],
]:
    """Remove only assignments whose own terminal session seal failed."""
    surviving_floor = {
        assignment_id: receipt
        for assignment_id, receipt in floor_receipts.items()
        if assignment_id not in failed_floor_assignments
    }
    surviving_prospective = [
        receipt
        for receipt in prospective_receipts
        if str(receipt.get("assignment_id"))
        not in failed_prospective_assignments
    ]
    prospective_ids = {
        str(receipt.get("assignment_id")) for receipt in surviving_prospective
    }
    floor_ids = set(surviving_floor)
    new_ids = prospective_ids - floor_ids
    credited_ids = floor_ids | new_ids
    return (
        surviving_floor,
        surviving_prospective,
        prospective_ids,
        floor_ids,
        new_ids,
        credited_ids,
    )


def x_global_transaction_failure_state(
    final_transaction_errors: list[str],
    completion_details: dict[str, dict[str, Any]],
) -> tuple[
    bool,
    bool,
    set[str],
    set[str],
    set[str],
    dict[str, dict[str, Any]],
    int,
] | None:
    """Globally suppress credit only when a required transaction input drifts."""
    if not final_transaction_errors:
        return None
    updated_completion_details: dict[str, dict[str, Any]] = {}
    for runner_id, original in completion_details.items():
        detail = dict(original)
        if detail.get("valid") is True:
            detail["valid"] = False
            detail["issues"] = sorted(
                set(detail.get("issues", []))
                | {"crosscheck transaction failed after completion accounting"}
            )
        updated_completion_details[runner_id] = detail
    return (
        False,
        False,
        set(),
        set(),
        set(),
        updated_completion_details,
        0,
    )


def x_main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--snapshot", type=Path, required=True)
    parser.add_argument("--validator", type=Path, required=True)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--lineage-checkpoint", type=Path)
    args = parser.parse_args()
    errors: list[str] = []
    scan_instability_count = 0

    transaction_input_hashes: dict[str, str | None] = {}

    def x_input_ref(path: Path) -> str:
        return (
            str(path.resolve().relative_to(REPO.resolve()))
            if under(path, REPO)
            else str(path.resolve())
        )

    def x_record_input(path: Path) -> str | None:
        relative = x_input_ref(path)
        observed = sha256(path) if path.is_file() else None
        transaction_input_hashes.setdefault(relative, observed)
        return observed

    def x_capture_semantic(
        path: Path,
        expected_sha256: str | None = None,
    ) -> tuple[bytes, str]:
        body, digest, _signature = x_descriptor_capture(path, expected_sha256)
        relative = x_input_ref(path)
        first_digest = transaction_input_hashes.setdefault(relative, digest)
        if first_digest != digest:
            raise ValueError("semantic capture differs from the transaction's first digest")
        return body, digest

    try:
        cross_start_bytes, cross_start_sha256, cross_start_signature = (
            x_descriptor_capture(HERE)
        )
        transaction_input_hashes.setdefault(x_input_ref(HERE), cross_start_sha256)
    except Exception as exc:
        cross_start_bytes = b""
        cross_start_sha256 = None
        cross_start_signature = None
        errors.append(f"crosscheck executable cannot be self-sealed: {type(exc).__name__}")

    snapshot_bytes: bytes | None
    try:
        if not args.snapshot.is_file():
            raise FileNotFoundError(args.snapshot)
        snapshot_bytes, snapshot_hash = x_capture_semantic(args.snapshot)
        snapshot = x_json_loads(snapshot_bytes.decode("utf-8"))
    except Exception as exc:
        snapshot_bytes = None
        snapshot_hash = None
        snapshot = {}
        errors.append(f"snapshot missing or invalid JSON: {type(exc).__name__}: {exc}")
    if not isinstance(snapshot, dict):
        snapshot = {}
        errors.append("snapshot is not an object")
    if set(snapshot) != PRIMARY_REPORT_KEYS:
        errors.append(
            "snapshot top-level schema mismatch: "
            f"missing={sorted(PRIMARY_REPORT_KEYS - set(snapshot))}, "
            f"unknown={sorted(set(snapshot) - PRIMARY_REPORT_KEYS)}"
        )
    if snapshot.get("authority") != PRIMARY_AUTHORITY:
        errors.append("snapshot authority label mismatch")
    if snapshot.get("coverage_policy") != PRIMARY_COVERAGE_POLICY:
        errors.append("snapshot coverage policy mismatch")
    try:
        observed_at = snapshot.get("observed_at")
        if not isinstance(observed_at, str):
            raise ValueError("not a string")
        datetime.strptime(observed_at, "%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        errors.append("snapshot observed_at is not canonical UTC")
    for field in ("warnings", "credit_suppression_reasons"):
        values = snapshot.get(field)
        if (
            not isinstance(values, list)
            or any(not isinstance(value, str) for value in values)
            or values != sorted(set(values))
        ):
            errors.append(f"snapshot {field} is not a sorted unique string list")

    validator_hash = x_record_input(args.validator)
    if validator_hash != PRIMARY_V3_SHA256:
        errors.append(
            f"primary validator hash mismatch: {validator_hash!r} != {PRIMARY_V3_SHA256}"
        )
    if snapshot.get("validator_sha256") != validator_hash:
        errors.append("snapshot does not bind the supplied primary validator hash")
    if snapshot.get("audit_id") != AUDIT_ID:
        errors.append("snapshot audit_id mismatch")
    if snapshot.get("validator") != "postrun_validator_v3.py":
        errors.append("snapshot validator name mismatch")
    if snapshot.get("validator_version") != "3.2.0":
        errors.append("snapshot validator version mismatch")

    seal_checks: dict[str, str] = {}
    anchor_buffers: dict[str, bytes] = {}
    for name, (ref, wanted) in X_ANCHORS.items():
        path = ROOT / ref
        try:
            raw_anchor = path.read_bytes()
            actual = hashlib.sha256(raw_anchor).hexdigest()
            anchor_buffers[name] = raw_anchor
            relative = str(path.resolve().relative_to(REPO.resolve()))
            transaction_input_hashes.setdefault(relative, actual)
        except Exception:
            actual = None
        seal_checks[name] = "pass" if actual == wanted else "fail"
        if actual != wanted:
            errors.append(f"immutable anchor mismatch: {name}")

    def x_anchor_json(name: str) -> Any:
        raw = anchor_buffers.get(name)
        if raw is None:
            raise ValueError(f"anchor buffer unavailable: {name}")
        return x_json_loads(raw.decode("utf-8"))
    reported_seal_checks = snapshot.get("seal_checks")
    if not isinstance(reported_seal_checks, dict):
        errors.append("snapshot seal_checks is not an object")
        reported_seal_checks = {}
    if set(reported_seal_checks) != set(X_ANCHORS):
        errors.append("snapshot seal_checks key set mismatch")
    if reported_seal_checks != seal_checks:
        errors.append("snapshot seal_checks differ from independent recomputation")

    try:
        ready = x_anchor_json("ready")
    except Exception as exc:
        ready = None
        errors.append(f"READY parse failure: {type(exc).__name__}")
    ready_expected = {
        "audit_id": AUDIT_ID,
        "status": "READY_FOR_RUNNERS",
        "prelaunch_validation_passed": True,
        "old_audit_substantive_credit": 0,
        "assignment_count": 2538,
        "window_count": 1269,
        "runner_count": 12,
        "manifest_sha256": X_ANCHORS["assignment_manifest"][1],
        "window_manifest_sha256": X_ANCHORS["window_manifest"][1],
        "capsule_registry_sha256": X_ANCHORS["capsule_registry"][1],
        "runner_registry_sha256": X_ANCHORS["runner_registry"][1],
        "validator_result_sha256": X_ANCHORS["validator_result"][1],
    }
    ready_integrity_ok = isinstance(ready, dict) and not any(
        ready.get(k) != v for k, v in ready_expected.items()
    )
    if not ready_integrity_ok:
        errors.append("READY semantic values mismatch")

    try:
        authority = x_anchor_json("v2_authority")
    except Exception as exc:
        authority = None
        errors.append(f"V2 authority parse failure: {type(exc).__name__}")
    authority_revoked: set[tuple[str, str]] = set()
    authority_rows_valid = True
    if isinstance(authority, dict):
        for row in authority.get("known_revoked_attempts", []):
            if isinstance(row, dict):
                token = x_attempt_value(row.get("attempt"))
                if isinstance(row.get("assignment_id"), str) and token:
                    authority_revoked.add((row["assignment_id"], token))
            else:
                authority_rows_valid = False
    if authority_revoked != set(X_KNOWN_REVOKED):
        errors.append("V2 authority revoked-attempt set mismatch")
    postrun_authority = authority.get("postrun_coverage_authority", {}) if isinstance(authority, dict) else {}
    attempt_rule = str(postrun_authority.get("attempt_rule", "")) if isinstance(postrun_authority, dict) else ""
    original_ready = authority.get("original_ready_evidence", {}) if isinstance(authority, dict) else {}
    authority_integrity_ok = (
        isinstance(authority, dict)
        and authority_rows_valid
        and authority_revoked == set(X_KNOWN_REVOKED)
        and isinstance(postrun_authority, dict)
        and "new attempt number" in attempt_rule
        and "new agent instance, path, and thread identity" in attempt_rule
        and isinstance(original_ready, dict)
        and original_ready.get("ready_sha256") == X_ANCHORS["ready"][1]
    )
    if not authority_integrity_ok:
        errors.append("V2 authority semantic integrity mismatch")

    try:
        alert3 = x_anchor_json("protocol_alert_0003")
        alert4 = x_anchor_json("protocol_alert_0004")
    except Exception as exc:
        alert3 = {}
        alert4 = {}
        errors.append(f"protocol alert parse failure: {type(exc).__name__}")
    alert3_fix = (
        alert3.get("decision", {}).get("required_fix", [])
        if isinstance(alert3, dict) and isinstance(alert3.get("decision"), dict)
        else []
    )
    if (
        not isinstance(alert3, dict)
        or alert3.get("alert_id") != "A004-PROTOCOL-ALERT-0003"
        or alert3.get("affected_validator_sha256") != X_ANCHORS["frozen_v2_primary"][1]
        or alert3.get("decision", {}).get("initial_17_credits_revoked") is not False
        or not isinstance(alert3_fix, list)
        or not any("assignment plus attempt plus fresh identity" in str(value) for value in alert3_fix)
        or not any("Independently recompute all eligible attempts" in str(value) for value in alert3_fix)
        or not any("exact_text" in str(value) for value in alert3_fix)
        or not any("immutable lineage" in str(value) for value in alert3_fix)
    ):
        errors.append("Protocol Alert 0003 semantic authority mismatch")
    alert4_evidence = alert4.get("evidence", {}) if isinstance(alert4, dict) else {}
    alert4_credit = alert4.get("credit_effect", {}) if isinstance(alert4, dict) else {}
    alert4_recovery = alert4.get("required_recovery", []) if isinstance(alert4, dict) else []
    if (
        not isinstance(alert4, dict)
        or alert4.get("alert_id") != "A004-PROTOCOL-ALERT-0004"
        or alert4_evidence.get("runner_receipt")
        != "runners/runner-07/fresh_agent_assignment_registry.jsonl:22"
        or alert4_evidence.get("malformed_line_sha256")
        != "f28b331ae34eaa255d93ff43bdc9b87551cb9118f34a520ce5cc5939ff3dac47"
        or alert4_credit.get("credit") != 0
        or alert4.get("master_actions", {}).get("root_credit_advanced") is not False
        or not isinstance(alert4_recovery, list)
        or not any("Preserve the malformed line" in str(value) for value in alert4_recovery)
        or not any("Do not delete, rewrite, or normalize" in str(value) for value in alert4_recovery)
        or not any("new attempt number" in str(value) for value in alert4_recovery)
        or not any("fail closed" in str(value) for value in alert4_recovery)
    ):
        errors.append("Protocol Alert 0004 semantic authority mismatch")

    floor_digest = "a518810069e77f35604fb81dffe15dcb420af373026047d16adf8e05d5f1592e"
    try:
        v2_floor_snapshot = x_anchor_json("v2_crosschecked_floor_snapshot")
        v2_floor_crosscheck = x_anchor_json("v2_crosschecked_floor_receipt")
    except Exception as exc:
        v2_floor_snapshot = {}
        v2_floor_crosscheck = {}
        errors.append(f"V2 credit floor evidence parse failure: {type(exc).__name__}")
    v2_floor_receipts: dict[str, dict[str, Any]] = {}
    floor_ids = (
        v2_floor_snapshot.get("credited_assignment_ids", [])
        if isinstance(v2_floor_snapshot, dict)
        else []
    )
    floor_rows = (
        v2_floor_snapshot.get("mechanically_eligible_result_receipts", [])
        if isinstance(v2_floor_snapshot, dict)
        else []
    )
    floor_snapshot_ok = (
        isinstance(v2_floor_snapshot, dict)
        and v2_floor_snapshot.get("validator_version") == "2.0.0"
        and v2_floor_snapshot.get("credited_assignment_ids_sha256") == floor_digest
        and isinstance(floor_ids, list)
        and len(floor_ids) == 19
        and all(isinstance(value, str) and value for value in floor_ids)
        and len(set(floor_ids)) == 19
        and x_digest(set(floor_ids)) == floor_digest
        and isinstance(floor_rows, list)
        and len(floor_rows) == 19
    )
    if not floor_snapshot_ok:
        errors.append("V2 crosschecked credit floor snapshot mismatch")
        floor_ids = []
        floor_rows = []
    for receipt in floor_rows:
        assignment_id = receipt.get("assignment_id") if isinstance(receipt, dict) else None
        if (
            not isinstance(assignment_id, str)
            or assignment_id not in floor_ids
            or assignment_id in v2_floor_receipts
        ):
            errors.append("V2 credit floor receipt set malformed or duplicated")
        else:
            v2_floor_receipts[assignment_id] = dict(receipt)
    if (
        not isinstance(v2_floor_crosscheck, dict)
        or v2_floor_crosscheck.get("status") != "pass"
        or v2_floor_crosscheck.get("snapshot_sha256")
        != X_ANCHORS["v2_crosschecked_floor_snapshot"][1]
        or v2_floor_crosscheck.get("validator_sha256")
        != X_ANCHORS["frozen_v2_primary"][1]
        or v2_floor_crosscheck.get("credited_assignments_checked") != 19
        or v2_floor_crosscheck.get("eligible_assignments_reported") != 19
        or v2_floor_crosscheck.get("root_credited_assignments_observed") != 19
        or v2_floor_crosscheck.get("revoked_assignments_absent") is not True
        or v2_floor_crosscheck.get("errors") != []
    ):
        errors.append("V2 independent credit floor receipt mismatch")

    try:
        structural_adjudication = x_anchor_json(
            "v2_structural_rejection_adjudication"
        )
    except Exception as exc:
        structural_adjudication = {}
        errors.append(f"V2 structural adjudication parse failure: {type(exc).__name__}")
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
        errors.append("V2 structural adjudication semantics mismatch")
        adjudicated_rows = []
    for item in adjudicated_rows:
        source_receipt = item.get("source_receipt") if isinstance(item, dict) else None
        if (
            not isinstance(source_receipt, str)
            or not re.fullmatch(r"runners/runner-\d{2}/failed_attempts\.jsonl:\d+", source_receipt)
            or source_receipt in adjudicated_structural_rows
            or not isinstance(item.get("assignment_id"), str)
            or x_attempt_value(item.get("attempt")) is None
            or x_identity(item) is None
            or x_canonical_sha256(item.get("source_line_sha256")) is None
            or x_canonical_sha256(item.get("result_sha256")) is None
            or x_canonical_sha256(item.get("validation_sha256")) is None
            or x_canonical_sha256(item.get("v2_quarantine_sha256")) is None
            or x_canonical_sha256(item.get("v2_snapshot_sha256")) is None
        ):
            errors.append("V2 structural adjudication row malformed or duplicated")
            continue
        adjudicated_structural_rows[source_receipt] = dict(item)
    if len(adjudicated_structural_rows) != 3:
        errors.append("V2 structural adjudication row set mismatch")

    lineage_integrity_ok = True
    initial_anchored_line_limits: dict[str, int] = {}
    try:
        lineage_anchor = x_anchor_json("initial_failure_lineage")
    except Exception:
        lineage_anchor = None
        lineage_integrity_ok = False
    lineage_prefix_checks: dict[str, str] = {}
    if not isinstance(lineage_anchor, dict) or lineage_anchor.get("audit_id") != AUDIT_ID:
        errors.append("initial failure-lineage anchor invalid")
        lineage_integrity_ok = False
        lineage_rows: list[Any] = []
    else:
        lineage_rows = lineage_anchor.get("files", [])
        if not isinstance(lineage_rows, list) or not lineage_rows:
            errors.append("initial failure-lineage file list invalid")
            lineage_integrity_ok = False
            lineage_rows = []
    seen_lineage_refs: set[str] = set()
    for row in lineage_rows:
        if not isinstance(row, dict):
            errors.append("failure-lineage row is not an object")
            lineage_integrity_ok = False
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
            errors.append("failure-lineage row malformed or duplicated")
            lineage_integrity_ok = False
            continue
        seen_lineage_refs.add(ref)
        path = ROOT / ref
        try:
            prefix_bytes = (
                x_descriptor_prefix(path, byte_count, wanted)
                if path.is_file()
                else None
            )
            actual = hashlib.sha256(prefix_bytes).hexdigest() if prefix_bytes is not None else None
        except Exception:
            prefix_bytes = None
            actual = None
        lineage_prefix_checks[ref] = "pass" if actual == wanted else "fail"
        if actual != wanted:
            errors.append(f"anchored runner-lineage prefix changed: {ref}")
            lineage_integrity_ok = False
        else:
            try:
                if prefix_bytes is None:
                    raise ValueError("captured prefix unavailable")
                prefix_text = prefix_bytes.decode("utf-8")
                initial_anchored_line_limits[ref] = len(prefix_text.splitlines())
            except Exception:
                errors.append(f"anchored runner-lineage prefix is not UTF-8: {ref}")
                lineage_integrity_ok = False
    anchored_validation_payloads: dict[str, dict[str, Any]] = {}
    payload_rows = (
        lineage_anchor.get("unhashed_validation_payloads", [])
        if isinstance(lineage_anchor, dict)
        else []
    )
    if not isinstance(payload_rows, list):
        errors.append("initial lineage validation-payload list invalid")
        lineage_integrity_ok = False
        payload_rows = []
    for row in payload_rows:
        if not isinstance(row, dict):
            errors.append("initial lineage validation payload row is not an object")
            lineage_integrity_ok = False
            continue
        source_receipt = row.get("source_receipt")
        ref = row.get("validation_ref")
        wanted_hash = row.get("validation_sha256")
        wanted_bytes = row.get("validation_bytes")
        if (
            not isinstance(source_receipt, str)
            or source_receipt in anchored_validation_payloads
            or not isinstance(ref, str)
            or x_canonical_sha256(wanted_hash) is None
            or not isinstance(wanted_bytes, int)
            or isinstance(wanted_bytes, bool)
            or wanted_bytes < 0
        ):
            errors.append("initial lineage validation payload row malformed or duplicated")
            lineage_integrity_ok = False
            continue
        anchored_validation_payloads[source_receipt] = row
        payload_path = resolve_ref(ref)
        if (
            payload_path is None
            or not payload_path.is_file()
            or payload_path.stat().st_size != wanted_bytes
            or sha256(payload_path) != wanted_hash
        ):
            errors.append(f"anchored unhashed validation payload changed: {source_receipt}")
            lineage_integrity_ok = False
        if payload_path is not None:
            x_record_input(payload_path)
    if snapshot.get("lineage_prefix_checks") != dict(sorted(lineage_prefix_checks.items())):
        errors.append("snapshot lineage-prefix checks differ from independent recomputation")

    checkpoint_path = (
        args.lineage_checkpoint
        if args.lineage_checkpoint is not None
        else ROOT / X_BOOTSTRAP_CHECKPOINT_REF
    )
    if not checkpoint_path.is_absolute():
        checkpoint_path = ROOT / checkpoint_path
    checkpoint_path = checkpoint_path.resolve()
    if not under(checkpoint_path, ROOT / "coordination/lineage_v3"):
        errors.append("lineage checkpoint is outside root-owned lineage directory")
    checkpoint_hash = x_record_input(checkpoint_path)
    pinned_checkpoint = (ROOT / X_BOOTSTRAP_CHECKPOINT_REF).resolve()
    if (
        checkpoint_path != pinned_checkpoint
        or checkpoint_hash != X_BOOTSTRAP_CHECKPOINT_SHA256
    ):
        parser.error(
            "authoritative V3 cross-check accepts only the compile-time pinned "
            "bootstrap checkpoint"
        )
    checkpoint_chain_hashes: dict[Path, str] = {}
    (
        lineage_streams,
        checkpoint_native_sessions,
        checkpoint_native_paths,
        checkpoint_runner_artifacts,
        lineage_checkpoint,
        checkpoint_issues,
    ) = x_checkpoint_state(
        checkpoint_path,
        lineage_anchor if isinstance(lineage_anchor, dict) else {},
        chain_hashes=checkpoint_chain_hashes,
    )
    if checkpoint_chain_hashes.get(checkpoint_path) != X_BOOTSTRAP_CHECKPOINT_SHA256:
        errors.append("parsed checkpoint buffer differs from the authority pin")
    for chain_path, chain_hash in checkpoint_chain_hashes.items():
        chain_key = (
            str(chain_path.relative_to(REPO))
            if under(chain_path, REPO)
            else str(chain_path)
        )
        transaction_input_hashes[chain_key] = chain_hash
    errors.extend(checkpoint_issues)
    checkpoint_jsonl_refs = {
        ref for ref, row in lineage_streams.items() if row.get("state") == "present"
    }
    runner_jsonl_set_at_start = {
        str(path.relative_to(ROOT))
        for path in (ROOT / "runners").glob("runner-*/**/*.jsonl")
        if path.is_file()
    }
    post_checkpoint_jsonls = sorted(runner_jsonl_set_at_start - checkpoint_jsonl_refs)
    checkpoint_artifact_refs = {
        ref
        for ref, row in checkpoint_runner_artifacts.items()
        if row.get("state") == "present"
    }
    runner_artifact_set_at_start = {
        str(path.relative_to(ROOT))
        for path in (ROOT / "runners").glob("runner-*/**/*")
        if path.is_file() and not path.name.endswith(".jsonl")
    }
    post_checkpoint_runner_artifacts = sorted(
        runner_artifact_set_at_start - checkpoint_artifact_refs
    )
    checkpoint_summary = {
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
        "runner_artifact_inventory_sha256": lineage_checkpoint.get(
            "runner_artifact_inventory_sha256"
        ),
        "present_runner_artifacts": sum(
            row.get("state") == "present"
            for row in checkpoint_runner_artifacts.values()
        ),
        "missing_runner_artifacts": sum(
            row.get("state") == "missing"
            for row in checkpoint_runner_artifacts.values()
        ),
        "post_checkpoint_runner_jsonls": post_checkpoint_jsonls,
        "post_checkpoint_runner_artifacts": post_checkpoint_runner_artifacts,
        "deferred_file_list_semantics": (
            "non_authoritative_lower_bound_all_post_checkpoint_files_excluded_from_credit"
        ),
        "pre_anchor_auxiliary_provenance_limitation": lineage_checkpoint.get(
            "pre_anchor_auxiliary_provenance_limitation"
        ),
    }
    reported_checkpoint = snapshot.get("lineage_checkpoint")
    if not isinstance(reported_checkpoint, dict):
        errors.append("snapshot lineage checkpoint summary is not an object")
        reported_checkpoint = {}
    if set(reported_checkpoint) != set(checkpoint_summary):
        errors.append("snapshot lineage checkpoint schema mismatch")
    for name, wanted in checkpoint_summary.items():
        if name in {"post_checkpoint_runner_jsonls", "post_checkpoint_runner_artifacts"}:
            continue
        if reported_checkpoint.get(name) != wanted:
            errors.append(f"snapshot lineage checkpoint field mismatch: {name}")
    for name, current_values in (
        ("post_checkpoint_runner_jsonls", post_checkpoint_jsonls),
        ("post_checkpoint_runner_artifacts", post_checkpoint_runner_artifacts),
    ):
        reported_values = reported_checkpoint.get(name)
        if (
            not isinstance(reported_values, list)
            or any(not isinstance(value, str) for value in reported_values)
            or reported_values != sorted(set(reported_values))
            or not set(reported_values).issubset(current_values)
        ):
            errors.append(f"snapshot lineage checkpoint deferred file list invalid: {name}")
    checkpoint_session_prefix_hashes = {
        f"native_session:{session_id}": row.get("prefix_sha256")
        for session_id, row in checkpoint_native_sessions.items()
    }

    assignments_list, assignment_manifest_bad = x_load_runner_jsonl(
        ROOT / "assignments/global_assignment_manifest.jsonl",
        byte_limit=len(anchor_buffers.get("assignment_manifest", b"")),
        expected_prefix_sha256=X_ANCHORS["assignment_manifest"][1],
        captured_bytes=anchor_buffers.get("assignment_manifest"),
    )
    assignment_integrity_ok = not assignment_manifest_bad
    if assignment_manifest_bad:
        errors.append("global assignment manifest contains malformed rows")
    assignments: dict[str, dict[str, Any]] = {}
    for row in assignments_list:
        assignment_id = row.get("assignment_id")
        if not isinstance(assignment_id, str) or assignment_id in assignments:
            errors.append("global assignment manifest key/cardinality error")
            assignment_integrity_ok = False
        else:
            assignments[assignment_id] = row
    if len(assignments) != 2538:
        errors.append(f"global assignment count is {len(assignments)}, not 2538")
        assignment_integrity_ok = False
    try:
        runner_threads = x_anchor_json("runner_registry")
    except Exception as exc:
        runner_threads = None
        errors.append(f"runner thread registry parse failure: {type(exc).__name__}")
    expected_runner_names = {
        f"runner-{n:02d}" for n in range(1, 13)
    }
    runner_registry_integrity_ok = (
        isinstance(runner_threads, dict)
        and set(runner_threads) == expected_runner_names
        and all(isinstance(value, str) and value for value in runner_threads.values())
        and len(set(runner_threads.values())) == 12
    )
    if not runner_registry_integrity_ok:
        errors.append("runner thread registry structure mismatch")
        runner_threads = {}
    runners_root = ROOT / "runners"
    observed_runner_namespaces = (
        {path.name for path in runners_root.iterdir() if path.is_dir()}
        if runners_root.is_dir()
        else set()
    )
    runner_namespace_integrity_ok = observed_runner_namespaces == expected_runner_names
    if not runner_namespace_integrity_ok:
        errors.append("unexpected or missing runner namespace")

    eligible_reported = snapshot.get("mechanically_eligible_assignment_ids", [])
    credited_reported = snapshot.get("credited_assignment_ids", [])
    eligible_receipts_reported = snapshot.get(
        "mechanically_eligible_result_receipts", []
    )
    credited_receipts_reported = snapshot.get("credited_result_receipts", [])
    for name, values in (
        ("eligible IDs", eligible_reported),
        ("credited IDs", credited_reported),
        ("eligible receipts", eligible_receipts_reported),
        ("credited receipts", credited_receipts_reported),
    ):
        if not isinstance(values, list):
            errors.append(f"snapshot {name} is not a list")
    if not isinstance(eligible_reported, list):
        eligible_reported = []
    if not isinstance(credited_reported, list):
        credited_reported = []
    if not isinstance(eligible_receipts_reported, list):
        eligible_receipts_reported = []
    if not isinstance(credited_receipts_reported, list):
        credited_receipts_reported = []
    if any(not isinstance(value, str) for value in eligible_reported):
        errors.append("snapshot eligible IDs contain non-string values")
        eligible_reported = [value for value in eligible_reported if isinstance(value, str)]
    if any(not isinstance(value, str) for value in credited_reported):
        errors.append("snapshot credited IDs contain non-string values")
        credited_reported = [value for value in credited_reported if isinstance(value, str)]
    if len(eligible_reported) != len(set(eligible_reported)):
        errors.append("snapshot eligible assignment IDs are not unique")
    if len(credited_reported) != len(set(credited_reported)):
        errors.append("snapshot credited assignment IDs are not unique")
    eligible_receipt_ids = [
        row.get("assignment_id")
        for row in eligible_receipts_reported
        if isinstance(row, dict) and isinstance(row.get("assignment_id"), str)
    ]
    credited_receipt_ids = [
        row.get("assignment_id")
        for row in credited_receipts_reported
        if isinstance(row, dict) and isinstance(row.get("assignment_id"), str)
    ]
    if len(eligible_receipt_ids) != len(eligible_receipts_reported):
        errors.append("snapshot eligible receipt list contains non-object rows")
    if len(credited_receipt_ids) != len(credited_receipts_reported):
        errors.append("snapshot credited receipt list contains non-object rows")
    if len(eligible_receipt_ids) != len(set(eligible_receipt_ids)) or set(eligible_receipt_ids) != set(eligible_reported):
        errors.append("snapshot eligible receipt details are not one-to-one with eligible IDs")
    if len(credited_receipt_ids) != len(set(credited_receipt_ids)) or set(credited_receipt_ids) != set(credited_reported):
        errors.append("snapshot credited receipt details are not one-to-one with credited IDs")
    if snapshot.get("validated_assignment_ids_sha256") != x_digest(eligible_reported):
        errors.append("snapshot eligible digest mismatch")
    if snapshot.get("credited_assignment_ids_sha256") != x_digest(credited_reported):
        errors.append("snapshot credited digest mismatch")
    counts = snapshot.get("counts", {})
    if not isinstance(counts, dict):
        counts = {}
        errors.append("snapshot counts missing")
    expected_count_fields = {
        "expected_assignments", "dispatch_records", "dispatch_attempts",
        "unique_dispatched_assignments", "result_manifest_records",
        "raw_result_files", "unmanifested_raw_result_files",
        "failed_attempt_records", "auxiliary_lineage_records",
        "auxiliary_failure_records", "open_infrastructure_records",
        "coordination_quarantine_records", "known_immutable_revoked_attempts",
        "superseded_v2_structural_rejection_records",
        "malformed_runner_receipts", "mechanically_eligible_assignments",
        "validated_results", "credited_assignments",
        "mechanically_pending_assignments", "pending_assignments",
        "runner_complete_receipts", "valid_runner_complete_receipts",
        "unresolved_dispatch_attempts", "quarantine_candidates",
        "localized_receipt_errors", "global_integrity_errors",
        "final_mode_errors", "checkpointed_native_sessions",
        "receipted_native_sessions", "unreceipted_native_sessions",
        "strict_v3_mechanically_eligible_assignments",
        "strict_v3_mechanically_pending_assignments",
        "preserved_v2_floor_assignments", "new_v3_credited_assignments",
    }
    if set(counts) != expected_count_fields:
        errors.append(
            "snapshot counts schema mismatch: "
            f"missing={sorted(expected_count_fields - set(counts))}, "
            f"unknown={sorted(set(counts) - expected_count_fields)}"
        )
    invalid_count_fields = sorted(
        name for name, value in counts.items() if x_nonnegative_int(value) is None
    )
    if invalid_count_fields:
        errors.append(
            f"snapshot counts contain non-canonical nonnegative integers: {invalid_count_fields}"
        )

    def x_count(name: str) -> int:
        value = counts.get(name)
        canonical = x_nonnegative_int(value)
        return canonical if canonical is not None else 0

    if x_count("mechanically_eligible_assignments") != len(eligible_reported):
        errors.append("snapshot eligible count mismatch")
    if x_count("credited_assignments") != len(credited_reported):
        errors.append("snapshot credited count mismatch")

    all_registry: list[dict[str, Any]] = []
    all_manifests: list[dict[str, Any]] = []
    all_failures: list[dict[str, Any]] = []
    all_auxiliary: list[dict[str, Any]] = []
    auxiliary_failures: list[dict[str, Any]] = []
    open_infrastructure: list[dict[str, Any]] = []
    malformed: list[dict[str, Any]] = []
    complete_paths: dict[str, Path] = {}
    raw_files: set[Path] = set()
    runner_input_hashes: dict[str, str | None] = {}
    runner_input_hashes.update(checkpoint_session_prefix_hashes)
    runner_input_hashes.update(
        {
            ref: row.get("sha256") if row.get("state") == "present" else None
            for ref, row in checkpoint_runner_artifacts.items()
            if row.get("semantic_class") != "checkpoint_metadata"
        }
    )
    runner_scan_counts: dict[str, dict[str, int]] = {}

    def x_record_runner_artifact(path: Path) -> str | None:
        if under(path, ROOT):
            relative = str(path.relative_to(ROOT))
            if relative in lineage_streams:
                return sha256(path) if path.is_file() else None
            artifact_row = checkpoint_runner_artifacts.get(relative)
            if isinstance(artifact_row, dict):
                return (
                    sha256(path)
                    if artifact_row.get("state") == "present" and path.is_file()
                    else None
                )
            if under(path, runners_root):
                return None
        observed = x_record_input(path)
        if under(path, runners_root):
            runner_input_hashes[str(path.relative_to(ROOT))] = observed
        return observed

    def x_checkpoint_artifact_present(path: Path) -> bool:
        if not under(path, ROOT):
            return False
        row = checkpoint_runner_artifacts.get(str(path.relative_to(ROOT)))
        return isinstance(row, dict) and row.get("state") == "present"

    def x_runner_file_set() -> set[Path]:
        authoritative_refs = set(lineage_streams) | {
            ref
            for ref, row in checkpoint_runner_artifacts.items()
            if row.get("semantic_class") != "checkpoint_metadata"
        }
        return {
            (ROOT / ref).resolve()
            for ref in authoritative_refs
            if (ROOT / ref).is_file()
        }

    initial_runner_file_set = x_runner_file_set()
    initial_runner_file_hashes = {
        str(path.relative_to(ROOT.resolve())): sha256(path)
        for path in sorted(initial_runner_file_set)
        if path.suffix.lower() != ".jsonl"
    }

    runner_prefix_limits: dict[str, tuple[str, int, str]] = {}

    def x_stable_load(path: Path) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        nonlocal scan_instability_count
        relative = str(path.relative_to(ROOT))
        checkpoint_row = lineage_streams.get(relative)
        if not isinstance(checkpoint_row, dict):
            errors.append(f"runner JSONL is absent from selected checkpoint: {relative}")
            return [], []
        state = checkpoint_row.get("state")
        byte_limit = checkpoint_row.get("prefix_bytes")
        if x_nonnegative_int(byte_limit) is None:
            errors.append(f"runner JSONL checkpoint length invalid: {relative}")
            return [], []
        empty_sha = hashlib.sha256(b"").hexdigest()
        try:
            before = (
                x_sha256_prefix(path, byte_limit)
                if state == "present" and path.is_file()
                else empty_sha
                if state == "missing"
                else None
            )
        except Exception:
            before = None
        rows, bad = x_load_runner_jsonl(
            path, byte_limit, str(checkpoint_row.get("prefix_sha256"))
        )
        try:
            after = (
                x_sha256_prefix(path, byte_limit)
                if state == "present" and path.is_file()
                else empty_sha
                if state == "missing"
                else None
            )
        except Exception:
            after = None
        # Record and later rehash only the sealed checkpoint prefix. A live
        # JSONL suffix is outside this transaction and is intentionally deferred.
        runner_input_hashes[relative] = after
        runner_prefix_limits[relative] = (str(state), byte_limit, str(checkpoint_row.get("prefix_sha256")))
        if before != after:
            scan_instability_count += 1
            errors.append(f"runner input changed during crosscheck scan: {path.relative_to(ROOT)}")
        if after != checkpoint_row.get("prefix_sha256"):
            errors.append(f"runner input no longer matches checkpoint prefix: {relative}")
        return rows, bad

    for number in range(1, 13):
        runner_id = f"runner-{number:02d}"
        runner_dir = ROOT / "runners" / runner_id
        runner_dispatch_records = 0
        runner_manifest_records = 0
        runner_failure_records = 0
        runner_auxiliary_records = 0
        rows, bad = x_stable_load(runner_dir / "fresh_agent_assignment_registry.jsonl")
        runner_dispatch_records = len(rows)
        malformed.extend(bad)
        for row in rows:
            row["_scan_runner_id"] = runner_id
        all_registry.extend(rows)
        rows, bad = x_stable_load(runner_dir / "result_manifest.jsonl")
        runner_manifest_records = len(rows)
        malformed.extend(bad)
        for row in rows:
            row["_scan_runner_id"] = runner_id
        all_manifests.extend(rows)
        for filename in ("failed_attempts.jsonl", "ingest_errors.jsonl"):
            rows, bad = x_stable_load(runner_dir / filename)
            malformed.extend(bad)
            for row in rows:
                row["_scan_runner_id"] = runner_id
            all_failures.extend(rows)
            runner_failure_records += len(rows)
        canonical_jsonls = {
            (runner_dir / "fresh_agent_assignment_registry.jsonl").resolve(),
            (runner_dir / "result_manifest.jsonl").resolve(),
            (runner_dir / "failed_attempts.jsonl").resolve(),
            (runner_dir / "ingest_errors.jsonl").resolve(),
        }
        for auxiliary_path in sorted(
            ROOT / ref
            for ref, checkpoint_row in lineage_streams.items()
            if ref.startswith(f"runners/{runner_id}/")
            and ref.endswith(".jsonl")
            and checkpoint_row.get("state") == "present"
            and (ROOT / ref).resolve() not in canonical_jsonls
        ):
            rows, bad = x_stable_load(auxiliary_path)
            malformed.extend(bad)
            runner_auxiliary_records += len(rows)
            for row in rows:
                row["_scan_runner_id"] = runner_id
                row["_auxiliary_receipt"] = True
                row["_auxiliary_ref"] = str(auxiliary_path.relative_to(ROOT))
                if "failed_attempt" in auxiliary_path.name or x_terminal_negative(row):
                    auxiliary_failures.append(row)
                if (
                    "infrastructure" in auxiliary_path.name
                    and str(row.get("status", "")).lower()
                    not in {"closed", "resolved", "pass", "passed"}
                ):
                    open_infrastructure.append(row)
            all_auxiliary.extend(rows)
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
            try:
                artifact_value = x_load_json_bound(
                    artifact_path, str(artifact_row.get("sha256"))
                )
            except Exception as exc:
                malformed.append(
                    {
                        "source_receipt": f"{artifact_ref}:artifact",
                        "line_sha256": artifact_row.get("sha256"),
                        "error": f"{artifact_ref}: invalid or unbound JSON: {exc}",
                    }
                )
                continue
            if not isinstance(artifact_value, dict) or not any(
                name in artifact_value
                for name in (
                    "assignment_id", "agent_instance_id", "agent_path",
                    "agent_thread_id", "status", "state", "validation_status",
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
            all_auxiliary.append(artifact_value)
            runner_auxiliary_records += 1
            if (
                artifact_row.get("semantic_class") == "failed_artifact"
                or x_terminal_negative(artifact_value)
            ):
                auxiliary_failures.append(artifact_value)
            if (
                artifact_row.get("semantic_class") == "infrastructure"
                and str(artifact_value.get("status", "")).lower()
                not in {"closed", "resolved", "pass", "passed"}
            ):
                open_infrastructure.append(artifact_value)
        complete_path = runner_dir / "RUNNER_COMPLETE.json"
        complete_artifact = checkpoint_runner_artifacts.get(
            str(complete_path.relative_to(ROOT))
        )
        if (
            isinstance(complete_artifact, dict)
            and complete_artifact.get("state") == "present"
            and complete_path.is_file()
        ):
            complete_paths[runner_id] = complete_path
        runner_raw_files = {
            ROOT / ref
            for ref, artifact_row in checkpoint_runner_artifacts.items()
            if ref.startswith(f"runners/{runner_id}/raw_results/")
            and ref.endswith(".json")
            and artifact_row.get("state") == "present"
            and (ROOT / ref).is_file()
        }
        raw_files.update(runner_raw_files)
        runner_scan_counts[runner_id] = {
            "dispatch_records": runner_dispatch_records,
            "result_manifest_records": runner_manifest_records,
            "failed_attempt_records": runner_failure_records,
            "auxiliary_lineage_records": runner_auxiliary_records,
            "raw_result_files": len(runner_raw_files),
        }

    quarantine_path = ROOT / "coordination/QUARANTINE_REGISTRY.jsonl"
    coordination_quarantine, coordination_quarantine_bad = x_stable_load(
        quarantine_path
    )
    root_quarantine_integrity_ok = quarantine_path.is_file() and not coordination_quarantine_bad
    if not quarantine_path.is_file():
        errors.append("root coordination quarantine JSONL is missing or not a file")
    if coordination_quarantine_bad:
        errors.append("root coordination quarantine JSONL is malformed")
    pinned_malformed_mismatch_count = 0
    native_sessions_by_agent_path: dict[str, list[str]] = defaultdict(list)
    for session_id, session_row in checkpoint_native_sessions.items():
        agent_path = session_row.get("agent_path")
        if isinstance(agent_path, str):
            native_sessions_by_agent_path[agent_path].append(session_id)
    for evidence_row in [
        *all_registry,
        *all_manifests,
        *all_failures,
        *all_auxiliary,
        *coordination_quarantine,
    ]:
        agent_path = evidence_row.get("agent_path")
        native_matches = (
            native_sessions_by_agent_path.get(agent_path, [])
            if isinstance(agent_path, str)
            else []
        )
        if len(native_matches) == 1:
            evidence_row["_native_thread_id"] = native_matches[0]
    for row in coordination_quarantine:
        row["_scan_runner_id"] = row.get("runner_id")
    unaccounted_malformed = 0
    for bad in malformed:
        matching_quarantines = [
            row
            for row in coordination_quarantine
            if (
            row.get("source_receipt") == bad["source_receipt"]
            and row.get("immutable_malformed_line_sha256") == bad["line_sha256"]
            and row.get("coverage_credit") in (0, False)
            )
        ]
        if len(matching_quarantines) != 1:
            unaccounted_malformed += 1
            errors.append(f"unaccounted malformed runner receipt: {bad['source_receipt']}")
            continue
        recovered = matching_quarantines[0]
        recovered_assignment_id = recovered.get("assignment_id")
        recovered_assignment = assignments.get(str(recovered_assignment_id))
        recovered_attempt, recovered_attempt_issues = x_attempt(recovered)
        malformed_ref = bad["source_receipt"].rsplit(":", 1)[0]
        malformed_stream = lineage_streams.get(malformed_ref, {})
        payload, physical_runner, recovery_issues = x_recover_leading_plus_row(
            bad["source_receipt"],
            malformed_stream.get("prefix_bytes"),
            malformed_stream.get("prefix_sha256"),
        )
        lineage_issues: list[str] = list(recovery_issues)
        if recovered_assignment is None:
            lineage_issues.append("expected assignment missing")
        else:
            wanted_runner = recovered_assignment.get("runner_id")
            if recovered.get("runner_id") != wanted_runner:
                lineage_issues.append("quarantine runner scope mismatch")
            if physical_runner != wanted_runner:
                lineage_issues.append("physical malformed runner scope mismatch")
        if (
            not isinstance(recovered.get("attempt"), int)
            or isinstance(recovered.get("attempt"), bool)
            or recovered.get("attempt", 0) < 1
            or recovered_attempt is None
            or recovered_attempt_issues
        ):
            lineage_issues.append("canonical positive attempt missing or conflicting")
        for identity_name in ("agent_instance_id", "agent_path", "agent_thread_id"):
            if not isinstance(recovered.get(identity_name), str) or not recovered[identity_name]:
                lineage_issues.append(f"{identity_name} missing")
        if isinstance(payload, dict):
            payload_attempt, payload_attempt_issues = x_attempt(payload)
            if payload.get("assignment_id") != recovered_assignment_id:
                lineage_issues.append("quarantine assignment differs from malformed payload")
            if payload.get("runner_id") != recovered.get("runner_id"):
                lineage_issues.append("quarantine runner differs from malformed payload")
            if payload_attempt_issues or payload_attempt != recovered_attempt:
                lineage_issues.append("quarantine attempt differs from malformed payload")
            for identity_name in ("agent_instance_id", "agent_path", "agent_thread_id"):
                if payload.get(identity_name) != recovered.get(identity_name):
                    lineage_issues.append(
                        f"quarantine {identity_name} differs from malformed payload"
                    )
            payload_result_ref = first(payload, "result_ref", "raw_result_ref", "bad_capture_ref")
            quarantine_result_ref = first(recovered, "result_ref", "raw_result_ref", "bad_capture_ref")
            payload_result_hash = (
                hash_field(payload, "result")
                or payload.get("bad_capture_sha256")
                or payload.get("bad_capture_hash")
            )
            quarantine_result_hash = (
                hash_field(recovered, "result")
                or recovered.get("bad_capture_sha256")
                or recovered.get("bad_capture_hash")
            )
            payload_validation_ref = first(
                payload, "validation_ref", "failure_validation_ref", "bad_capture_validation_ref"
            )
            quarantine_validation_ref = first(
                recovered, "validation_ref", "failure_validation_ref", "bad_capture_validation_ref"
            )
            payload_validation_hash = (
                hash_field(payload, "validation")
                or payload.get("failure_validation_sha256")
                or payload.get("failure_validation_hash")
                or payload.get("bad_capture_validation_sha256")
                or payload.get("bad_capture_validation_hash")
            )
            quarantine_validation_hash = (
                hash_field(recovered, "validation")
                or recovered.get("failure_validation_sha256")
                or recovered.get("failure_validation_hash")
                or recovered.get("bad_capture_validation_sha256")
                or recovered.get("bad_capture_validation_hash")
            )
            for label, payload_value, quarantine_value in (
                ("result_ref", payload_result_ref, quarantine_result_ref),
                ("result_sha256", payload_result_hash, quarantine_result_hash),
                ("validation_ref", payload_validation_ref, quarantine_validation_ref),
                ("validation_sha256", payload_validation_hash, quarantine_validation_hash),
            ):
                if label.endswith("sha256") and x_canonical_sha256(payload_value) is None:
                    lineage_issues.append(f"malformed payload {label} missing or invalid")
                elif not isinstance(payload_value, str) or not payload_value:
                    lineage_issues.append(f"malformed payload {label} missing")
                elif quarantine_value != payload_value:
                    lineage_issues.append(f"quarantine {label} differs from malformed payload")
        else:
            lineage_issues.append("malformed payload is not independently recoverable")
        if lineage_issues:
            unaccounted_malformed += 1
            errors.append(
                "malformed runner receipt has opaque assurance-blocking lineage: "
                f"{bad['source_receipt']} ({'; '.join(sorted(set(lineage_issues)))})"
            )
    for row in coordination_quarantine:
        pinned = row.get("immutable_malformed_line_sha256")
        if pinned and not any(
            bad.get("source_receipt") == row.get("source_receipt")
            and bad.get("line_sha256") == pinned
            for bad in malformed
        ):
            pinned_malformed_mismatch_count += 1
            errors.append(
                f"pinned malformed runner receipt is missing or changed: {row.get('source_receipt')}"
            )
    if x_canonical(snapshot.get("malformed_runner_receipts")) != x_canonical(
        malformed
    ):
        errors.append(
            "snapshot malformed_runner_receipts differs from checkpoint-prefix recomputation"
        )

    negative_manifest_rows = [row for row in all_manifests if x_claims_negative(row)]
    terminal_negative_registry_rows = [
        row for row in all_registry if x_terminal_negative(row)
    ]
    veto_rows = [
        *all_failures,
        *coordination_quarantine,
        *negative_manifest_rows,
        *terminal_negative_registry_rows,
        *auxiliary_failures,
    ]
    structural_detail = (
        "Frozen postrun validator v2 rejected the otherwise canonical-evidence retry "
        "solely because result_row_counts for the assignment is not exactly one under "
        "append-only retry history."
    )

    def x_structural_supersession_issues(
        row: dict[str, Any], authority_row: dict[str, Any]
    ) -> list[str]:
        found: list[str] = []
        source_file = row.get("_receipt_file")
        source_line = row.get("_receipt_line")
        physical_hash = row.get("_receipt_line_sha256")
        if x_canonical_sha256(physical_hash) is None:
            return ["structural source line is not bound to checkpointed bytes"]
        if physical_hash != authority_row.get("source_line_sha256"):
            found.append("structural source-line hash mismatch")
        for name in (
            "assignment_id",
            "attempt_id",
            "agent_instance_id",
            "agent_path",
            "agent_thread_id",
            "result_ref",
            "result_sha256",
            "result_bytes",
        ):
            if row.get(name) != authority_row.get(name):
                found.append(f"structural {name} mismatch")
        attempt, attempt_problems = x_attempt(row)
        if attempt_problems or attempt != x_attempt_value(authority_row.get("attempt")):
            found.append("structural attempt mismatch")
        if (
            row.get("failure_kind") != "postrun_v2_structural_rejection"
            or row.get("failure_detail") != structural_detail
            or row.get("immutable") is not True
            or row.get("coverage_credit") != 0
            or row.get("validation_passed") is not False
            or row.get("status") != "failed_attempt_zero_coverage"
        ):
            found.append("structural zero-credit semantics mismatch")
        loaded: dict[str, Any] = {}
        for row_ref, row_hash, auth_ref, auth_hash in (
            ("quarantine_receipt_ref", "quarantine_receipt_sha256", "v2_quarantine_ref", "v2_quarantine_sha256"),
            ("source_validator_ref", "source_validator_sha256", "v2_snapshot_ref", "v2_snapshot_sha256"),
        ):
            if row.get(row_ref) != authority_row.get(auth_ref) or row.get(row_hash) != authority_row.get(auth_hash):
                found.append(f"structural {row_ref} authority mismatch")
                continue
            artifact_path = resolve_ref(row.get(row_ref))
            if (
                artifact_path is None
                or not artifact_path.is_file()
                or not x_checkpoint_artifact_present(artifact_path)
                or sha256(artifact_path) != row.get(row_hash)
            ):
                found.append(f"structural {row_ref} artifact mismatch")
                continue
            x_record_runner_artifact(artifact_path)
            try:
                loaded[row_ref] = x_load_json_bound(
                    artifact_path, str(row.get(row_hash))
                )
            except Exception:
                found.append(f"structural {row_ref} JSON invalid")
        quarantine_payload = loaded.get("quarantine_receipt_ref")
        if not isinstance(quarantine_payload, dict) or any(
            quarantine_payload.get(name) != row.get(name)
            for name in (
                "assignment_id", "attempt_id", "attempt_number", "agent_instance_id",
                "agent_path", "agent_thread_id", "result_ref", "result_sha256",
                "result_bytes", "failure_kind", "failure_detail", "coverage_credit",
                "validation_passed", "immutable", "status",
            )
        ):
            found.append("structural quarantine payload mismatch")
        v2_snapshot = loaded.get("source_validator_ref")
        v2_matches = [
            item
            for item in (
                v2_snapshot.get("quarantine_candidates", [])
                if isinstance(v2_snapshot, dict)
                else []
            )
            if isinstance(item, dict)
            and item.get("assignment_id") == row.get("assignment_id")
            and x_attempt_value(item.get("attempt_id")) == attempt
            and item.get("receipt") == authority_row.get("positive_manifest_receipt")
        ]
        if (
            not isinstance(v2_snapshot, dict)
            or v2_snapshot.get("validator") != "postrun_validator_v2.py"
            or v2_snapshot.get("validator_version") != "2.0.0"
            or v2_snapshot.get("errors") != []
            or len(v2_matches) != 1
            or v2_matches[0].get("reasons")
            != ["expected exactly one result-manifest row for assignment"]
        ):
            found.append("structural v2-only rejection proof mismatch")
        manifest_matches = [
            manifest
            for manifest in all_manifests
            if f"{manifest.get('_receipt_file')}:{manifest.get('_receipt_line')}"
            == authority_row.get("positive_manifest_receipt")
        ]
        if len(manifest_matches) != 1:
            found.append("structural positive manifest missing or duplicated")
        else:
            manifest = manifest_matches[0]
            manifest_hash = manifest.get("_receipt_line_sha256")
            if manifest_hash != authority_row.get("positive_manifest_line_sha256"):
                found.append("structural positive-manifest line hash mismatch")
            for name in (
                "assignment_id", "agent_instance_id", "agent_path", "agent_thread_id",
                "result_ref", "result_bytes", "validation_ref", "validation_sha256",
            ):
                if manifest.get(name) != authority_row.get(name):
                    found.append(f"structural manifest {name} mismatch")
            if hash_field(manifest, "result") != authority_row.get("result_sha256"):
                found.append("structural manifest result hash mismatch")
            manifest_attempt, manifest_problems = x_attempt(manifest)
            if manifest_problems or manifest_attempt != attempt or not x_claims_positive(manifest):
                found.append("structural manifest attempt/positive state mismatch")
        result_path = resolve_ref(row.get("result_ref"))
        if (
            result_path is None
            or not result_path.is_file()
            or not x_checkpoint_artifact_present(result_path)
            or sha256(result_path) != authority_row.get("result_sha256")
            or result_path.stat().st_size != authority_row.get("result_bytes")
        ):
            found.append("structural raw-result binding mismatch")
        validation_path = resolve_ref(authority_row.get("validation_ref"))
        if (
            validation_path is None
            or not validation_path.is_file()
            or not x_checkpoint_artifact_present(validation_path)
            or sha256(validation_path) != authority_row.get("validation_sha256")
        ):
            found.append("structural validation binding mismatch")
        return sorted(set(found))

    explicit_veto_pairs: set[tuple[str, str]] = set(X_KNOWN_REVOKED)
    superseded_v2_structural_rejections: list[dict[str, Any]] = []
    failures_by_assignment: dict[str, list[dict[str, Any]]] = defaultdict(list)
    failed_result_paths: set[Path] = set()
    failed_result_hashes: set[str] = set()
    failure_receipt_issues: dict[str, list[str]] = {}
    for row in veto_rows:
        assignment_id = row.get("assignment_id")
        assignment = assignments.get(assignment_id) if isinstance(assignment_id, str) else None
        source_receipt = row.get("_source") or f"{row.get('_receipt_file', 'unknown')}:{row.get('_receipt_line', '?')}"
        row_issues: list[str] = []
        authority_row = adjudicated_structural_rows.get(str(source_receipt))
        if authority_row is not None:
            structural_issues = x_structural_supersession_issues(row, authority_row)
            if not structural_issues:
                superseded_v2_structural_rejections.append(
                    {
                        "source_receipt": source_receipt,
                        "source_line_sha256": authority_row.get("source_line_sha256"),
                        "assignment_id": row.get("assignment_id"),
                        "attempt": x_attempt_value(authority_row.get("attempt")),
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
            row_issues.extend(structural_issues)
        elif row.get("failure_kind") == "postrun_v2_structural_rejection":
            row_issues.append("unadjudicated structural-rejection receipt")
        attempt, attempt_issues = x_attempt(row)
        if isinstance(assignment_id, str):
            failures_by_assignment[assignment_id].append(row)
            if not attempt_issues and attempt:
                explicit_veto_pairs.add((assignment_id, attempt))
        if assignment is None:
            row_issues.append("failed/quarantine assignment is not expected")
        else:
            wanted_runner = assignment["runner_id"]
            if row.get("runner_id") not in (None, wanted_runner):
                row_issues.append("failed/quarantine claimed runner scope spill")
            if row.get("_scan_runner_id") not in (None, wanted_runner):
                row_issues.append("failed/quarantine physical runner scope spill")
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
            row_issues.append("failed/quarantine lacks exact zero credit")
        source_file = row.get("_receipt_file")
        source_line = row.get("_receipt_line")
        initially_anchored = (
            isinstance(source_file, str)
            and isinstance(source_line, int)
            and not isinstance(source_line, bool)
            and source_line <= initial_anchored_line_limits.get(source_file, -1)
        )
        if not initially_anchored and (attempt_issues or attempt is None or x_identity(row) is None):
            row_issues.append("post-anchor failure lacks full attempt identity")
        if row.get("agent_thread_id") in set(runner_threads.values()):
            row_issues.append("failed/quarantine reuses a persistent runner root thread")
        if any(
            row.get(name) is True
            for name in ("validation_passed", "passed", "valid", "valid_coverage")
        ):
            row_issues.append("failed/quarantine has a positive validation flag")
        if any(
            str(row.get(name, "")).lower() in POSITIVE
            for name in (
                "validation_status", "status", "result_status", "state",
                "attempt_status", "attempt_state",
            )
        ):
            row_issues.append("failed/quarantine has a positive status")
        result_ref = first(row, "result_ref", "raw_result_ref", "bad_capture_ref")
        result_hash_claim = (
            hash_field(row, "result")
            or row.get("bad_capture_sha256")
            or row.get("bad_capture_hash")
        )
        result_hash = x_canonical_sha256(result_hash_claim)
        if result_hash:
            failed_result_hashes.add(result_hash)
        if result_ref:
            result_path = resolve_ref(result_ref)
            if result_path is not None:
                x_record_runner_artifact(result_path)
            expected_failed_runner_dir = (
                ROOT / "runners" / assignment["runner_id"]
                if assignment is not None
                else ROOT / "runners"
            )
            if (
                result_path is None
                or not result_path.is_file()
                or not x_checkpoint_artifact_present(result_path)
                or not any(
                    under(result_path, expected_failed_runner_dir / directory)
                    for directory in ("raw_results", "failed_attempts")
                )
            ):
                row_issues.append("failed raw result missing or out of scope")
            else:
                failed_result_paths.add(result_path.resolve())
                actual_result_hash = sha256(result_path)
                runner_input_hashes[str(result_path.relative_to(ROOT))] = actual_result_hash
                failed_result_hashes.add(actual_result_hash)
                if result_hash is None:
                    row_issues.append("failed raw result hash missing or invalid")
                elif actual_result_hash != result_hash:
                    row_issues.append("failed raw result hash mismatch")
        elif not initially_anchored:
            no_result = (
                row.get("no_result_artifact") is True
                or row.get("result_not_produced") is True
            )
            reason = first(row, "no_result_reason", "failure_reason", "reason")
            if not no_result or not isinstance(reason, str) or not reason.strip():
                row_issues.append(
                    "post-anchor failure lacks bound result or explicit no-result disposition"
                )
        validation_ref = first(
            row, "validation_ref", "failure_validation_ref", "bad_capture_validation_ref"
        )
        if validation_ref:
            validation_path = resolve_ref(validation_ref)
            if validation_path is not None:
                x_record_runner_artifact(validation_path)
            expected_validation_dir = (
                ROOT / "runners" / assignment["runner_id"] / "validation"
                if assignment is not None
                else ROOT / "runners"
            )
            if (
                validation_path is None
                or not validation_path.is_file()
                or not x_checkpoint_artifact_present(validation_path)
                or not under(validation_path, expected_validation_dir)
            ):
                row_issues.append("failed validation missing or out of scope")
            else:
                validation_hash_claim = (
                    hash_field(row, "validation")
                    or row.get("failure_validation_sha256")
                    or row.get("failure_validation_hash")
                    or row.get("bad_capture_validation_sha256")
                    or row.get("bad_capture_validation_hash")
                )
                validation_hash = x_canonical_sha256(validation_hash_claim)
                anchor_payload = anchored_validation_payloads.get(source_receipt)
                if validation_hash is None and anchor_payload is not None:
                    if anchor_payload.get("validation_ref") != validation_ref:
                        row_issues.append("failed validation ref differs from immutable payload anchor")
                    if validation_path.stat().st_size != anchor_payload.get("validation_bytes"):
                        row_issues.append("failed validation bytes differ from immutable payload anchor")
                    validation_hash = x_canonical_sha256(
                        anchor_payload.get("validation_sha256")
                    )
                elif validation_hash is None:
                    row_issues.append("failed validation lacks hash and immutable payload anchor")
                if validation_hash is not None and sha256(validation_path) != validation_hash:
                    row_issues.append("failed validation hash mismatch")
        if row_issues:
            failure_receipt_issues[str(source_receipt)] = sorted(set(row_issues))
            if row.get("_receipt_file") == "coordination/QUARANTINE_REGISTRY.jsonl":
                root_quarantine_integrity_ok = False
                errors.append(
                    "root quarantine registry contains semantically invalid lineage: "
                    f"{source_receipt}"
                )

    independent_structural_supersessions = sorted(
        superseded_v2_structural_rejections,
        key=lambda item: str(item.get("source_receipt")),
    )
    if x_canonical(snapshot.get("superseded_v2_structural_rejections", [])) != x_canonical(
        independent_structural_supersessions
    ):
        errors.append("primary structural-supersession set differs from independent recomputation")
    if x_count("superseded_v2_structural_rejection_records") != len(
        independent_structural_supersessions
    ):
        errors.append("primary structural-supersession count mismatch")

    def clean(row: dict[str, Any]) -> dict[str, Any]:
        return {
            key: value
            for key, value in row.items()
            if not key.startswith("_receipt_") and key != "_source"
        }

    packet_issues: dict[str, list[str]] = defaultdict(list)
    for runner_id in sorted(runner_threads):
        packet_path = ROOT / "assignments" / f"{runner_id}.jsonl"
        try:
            packet_bytes = packet_path.read_bytes()
            packet_hash = hashlib.sha256(packet_bytes).hexdigest()
            transaction_input_hashes.setdefault(
                str(packet_path.resolve().relative_to(REPO.resolve())), packet_hash
            )
        except Exception:
            packet_bytes = None
        loaded_packet_rows, packet_bad = x_load_runner_jsonl(
            packet_path, captured_bytes=packet_bytes
        )
        if packet_bytes is None:
            packet_issues[runner_id].append("assignment packet cannot be captured")
        packet_rows = [clean(row) for row in loaded_packet_rows]
        if packet_bad:
            packet_issues[runner_id].append("assignment packet contains malformed rows")
        wanted_rows = [
            clean(row) for row in assignments_list if row.get("runner_id") == runner_id
        ]
        if packet_rows != wanted_rows:
            packet_issues[runner_id].append("assignment packet differs from global subset")

    registry_groups: dict[tuple[str, str, str, str], list[dict[str, Any]]] = defaultdict(list)
    unkeyed_registry_rows: list[dict[str, Any]] = []
    for row in all_registry:
        key = x_base_key(row)
        if key is not None:
            registry_groups[key].append(row)
        else:
            unkeyed_registry_rows.append(row)

    immutable_aliases = (
        ("assignment_id",), ("runner_id",), ("role",), ("window_id",),
        ("doc_id",), ("document_path",), ("core_range",), ("capsule_ref",),
        ("capsule_sha256", "capsule_hash"), ("capsule_bytes",),
        ("source_sha256", "source_hash"), ("source_excerpt_ref",),
        ("source_excerpt_sha256", "source_excerpt_hash"),
        ("source_excerpt_bytes",), ("model",), ("reasoning_effort",),
        ("actual_model",), ("actual_reasoning_effort",),
        ("prior_substantive_assignment_count",), ("terminal_after_result",),
        ("no_followup_reuse",), ("fork_turns",), ("agent_instance_id",),
        ("agent_path",), ("agent_thread_id",), ("runner_thread_id",), ("created_at",),
    )
    dynamic_aliases = (
        ("result_ref", "raw_result_ref"),
        ("result_sha256", "result_hash"),
        ("result_bytes",),
        ("validation_ref",),
        ("validation_sha256", "validation_hash"),
        ("session_ref",),
        ("session_sha256", "session_hash"),
        ("completed_at",),
    )
    group_map: dict[tuple[str, str, str, str, str], dict[str, Any]] = {}
    all_group_infos: list[dict[str, Any]] = []
    invalid_pairs: dict[tuple[str, str], set[str]] = defaultdict(set)
    for base_key, rows in registry_groups.items():
        assignment_id, attempt, instance, path = base_key
        group_issues: list[str] = []
        assignment = assignments.get(assignment_id)
        if assignment is None:
            group_issues.append("registry assignment not expected")
        else:
            for row in rows:
                if (
                    row.get("_scan_runner_id") != assignment["runner_id"]
                    or row.get("runner_id") != assignment["runner_id"]
                ):
                    group_issues.append("registry runner namespace spill")
        threads = x_values(rows, "_native_thread_id")
        thread = threads[0] if len(threads) == 1 else None
        if not isinstance(thread, str) or not thread:
            group_issues.append("native thread identity cardinality failure")
        recorded_threads = x_values(rows, "agent_thread_id")
        if len(recorded_threads) != 1:
            group_issues.append("recorded agent_thread_id cardinality failure")
        elif recorded_threads[0] != thread:
            group_issues.append("recorded agent_thread_id differs from native session identity")
        for aliases in immutable_aliases:
            if len(x_values(rows, *aliases)) > 1:
                group_issues.append(f"conflicting {'/'.join(aliases)}")
        positive_rows = [row for row in rows if x_claims_positive(row)]
        if len(positive_rows) > 1:
            group_issues.append("multiple positive registry completion rows")
        completion = positive_rows[0] if len(positive_rows) == 1 else None
        combined: dict[str, Any] = {}
        for source in [*rows, *([completion] if completion is not None else [])]:
            for name, value in source.items():
                if value is not None and not name.startswith("_receipt_"):
                    combined[name] = value
        combined["attempt"] = int(attempt)
        if isinstance(thread, str):
            combined["agent_thread_id"] = thread
        for aliases in dynamic_aliases:
            values = x_values(rows, *aliases)
            if len(values) > 1:
                group_issues.append(f"conflicting {'/'.join(aliases)}")
            elif values:
                combined[aliases[0]] = values[0]
        if completion is not None:
            group_issues.extend(x_positive_issues(completion, True))
        if not x_values(rows, "created_at"):
            group_issues.append("created_at missing")
        if completion is not None and not x_values(rows, "completed_at"):
            group_issues.append("completed_at missing")
        if isinstance(thread, str) and thread:
            key = (assignment_id, attempt, instance, path, thread)
            if key in group_map:
                group_issues.append("duplicate full registry key")
            group_map[key] = {
                "rows": rows,
                "combined": combined,
                "completion": completion,
                "issues": group_issues,
            }
        all_group_infos.append(
            {
                "base_key": base_key,
                "full_key": (
                    (assignment_id, attempt, instance, path, thread)
                    if isinstance(thread, str) and thread
                    else None
                ),
                "combined": combined,
                "completion": completion,
                "issues": group_issues,
            }
        )
        if group_issues:
            invalid_pairs[(assignment_id, attempt)].update(group_issues)

    registry_keys = set(group_map)
    identity_uses: dict[str, dict[str, set[tuple[str, str]]]] = {
        field: defaultdict(set) for field in X_IDENTITY_FIELDS
    }
    attempt_identities: dict[tuple[str, str], set[tuple[str, str, str]]] = defaultdict(set)
    for key in registry_keys:
        pair = (key[0], key[1])
        identity = (key[2], key[3], key[4])
        attempt_identities[pair].add(identity)
        for field, value in zip(X_IDENTITY_FIELDS, identity):
            identity_uses[field][value].add(pair)
    for row in [
        *all_registry,
        *all_failures,
        *coordination_quarantine,
        *all_auxiliary,
    ]:
        assignment_id = row.get("assignment_id")
        attempt, attempt_issues = x_attempt(row)
        assignment_marker = (
            assignment_id
            if isinstance(assignment_id, str) and assignment_id
            else f"invalid-assignment:{row.get('_receipt_file')}:{row.get('_receipt_line')}"
        )
        pair = (
            assignment_marker,
            attempt
            if not attempt_issues and attempt
            else f"unkeyed:{row.get('_receipt_file')}:{row.get('_receipt_line')}",
        )
        identity = x_identity(row)
        if identity is not None:
            attempt_identities[pair].add(identity)
        for field in X_IDENTITY_FIELDS:
            value = x_identity_field(field, x_identity_value(row, field))
            if value is not None:
                identity_uses[field][value].add(pair)
    for field, mapping in identity_uses.items():
        for value, pairs in mapping.items():
            if len(pairs) > 1:
                for pair in pairs:
                    invalid_pairs[pair].add(f"recycled {field}: {value}")
    for pair, identities in attempt_identities.items():
        if len(identities) > 1:
            invalid_pairs[pair].add("attempt number reused across identities")

    manifest_keys: dict[int, tuple[str, str, str, str, str]] = {}
    manifest_key_issues: dict[int, list[str]] = {}
    manifests_by_key: dict[tuple[str, str, str, str, str], list[dict[str, Any]]] = defaultdict(list)
    for index, row in enumerate(all_manifests):
        key, key_issues = x_manifest_key(row, registry_keys)
        if key is None:
            manifest_key_issues[index] = key_issues
        else:
            manifest_keys[index] = key
            manifests_by_key[key].append(row)
    for index, row in enumerate(all_manifests):
        key = manifest_keys.get(index)
        pair = (
            (key[0], key[1])
            if key is not None
            else (
                str(
                    row.get("assignment_id")
                    or f"invalid-assignment:{row.get('_receipt_file')}:{row.get('_receipt_line')}"
                ),
                f"unkeyed:{row.get('_receipt_file')}:{row.get('_receipt_line')}",
            )
        )
        identity = x_identity(row)
        if identity is not None:
            attempt_identities[pair].add(identity)
        for field in X_IDENTITY_FIELDS:
            value = x_identity_field(field, x_identity_value(row, field))
            if value is not None:
                identity_uses[field][value].add(pair)
    for field, mapping in identity_uses.items():
        for value, pairs in mapping.items():
            if len(pairs) > 1:
                for pair in pairs:
                    invalid_pairs[pair].add(f"recycled {field}: {value}")
    for pair, identities in attempt_identities.items():
        if len(identities) > 1:
            invalid_pairs[pair].add("attempt number reused across identities")

    independent_identity_uniqueness = {
        field: {
            "recorded": len(mapping),
            "reused_values": sum(1 for pairs in mapping.values() if len(pairs) > 1),
        }
        for field, mapping in identity_uses.items()
    }
    if snapshot.get("identity_uniqueness") != independent_identity_uniqueness:
        errors.append("snapshot identity_uniqueness differs from independent relations")

    file_hashes: dict[Path, str] = {}

    def h(path: Path) -> str:
        if path not in file_hashes:
            file_hashes[path] = sha256(path)
            x_record_runner_artifact(path)
        return file_hashes[path]

    recomputed_receipts: list[dict[str, Any]] = []
    independent_candidate_issues: dict[str, list[str]] = {}
    referenced_raw: set[Path] = set(failed_result_paths)
    invalid_candidate_result_paths: set[Path] = set()
    invalid_candidate_result_hashes: set[str] = set()
    invalid_reuse_receipts: set[str] = set()
    positive_manifest_keys: set[tuple[str, str, str, str, str]] = set()
    unresolved_positive_keys: set[str] = set()
    for index, row in enumerate(all_manifests):
        if not x_claims_positive(row):
            continue
        issues = list(manifest_key_issues.get(index, []))
        key = manifest_keys.get(index)
        if key is not None:
            positive_manifest_keys.add(key)
        assignment_id = row.get("assignment_id")
        assignment = assignments.get(str(assignment_id))
        if assignment is None:
            issues.append("assignment not expected")
        pair = (key[0], key[1]) if key is not None else (str(assignment_id), "")
        vetoed = pair in explicit_veto_pairs or any(
            x_same_veto(row, veto)
            for veto in failures_by_assignment.get(str(assignment_id), [])
        )
        if vetoed:
            issues.append("attempt vetoed")
        group = group_map.get(key) if key is not None else None
        combined: dict[str, Any] = group["combined"] if group is not None else {}
        if key is None or group is None:
            issues.append("matching full registry attempt missing")
        else:
            issues.extend(group["issues"])
            if group["completion"] is None:
                issues.append("positive registry completion missing")
            if len(manifests_by_key[key]) != 1:
                issues.append("manifest full-key cardinality failure")
            issues.extend(invalid_pairs.get(pair, set()))
        issues.extend(x_positive_issues(row, False))

        capsule: dict[str, Any] = {}
        source_path: Path | None = None
        source_content_bytes: bytes | None = None
        if assignment is not None:
            required_manifest = {
                "runner_id": assignment["runner_id"],
                "role": assignment["role"],
                "window_id": assignment["window_id"],
                "model": assignment["required_model"],
                "reasoning_effort": assignment["required_reasoning_effort"],
                "terminal_after_result": True,
                "no_followup_reuse": True,
            }
            for name, wanted in required_manifest.items():
                if row.get(name) != wanted:
                    issues.append(f"manifest {name} mismatch")
            if row.get("_scan_runner_id") != assignment["runner_id"]:
                issues.append("manifest runner scope spill")
            issues.extend(packet_issues.get(assignment["runner_id"], []))
            capsule_path = resolve_ref(assignment["capsule_ref"])
            excerpt_path = resolve_ref(assignment["source_excerpt_ref"])
            source_path = resolve_ref(assignment["document_path"])
            for immutable_path in (capsule_path, excerpt_path, source_path):
                if immutable_path is not None:
                    x_record_input(immutable_path)
            if capsule_path is None or not capsule_path.is_file():
                issues.append("capsule missing")
            else:
                try:
                    capsule_bytes, capsule_digest = x_capture_semantic(
                        capsule_path, assignment["capsule_sha256"]
                    )
                    loaded_capsule = x_json_loads(capsule_bytes.decode("utf-8"))
                except Exception:
                    capsule_bytes = b""
                    capsule_digest = None
                    loaded_capsule = None
                if not isinstance(loaded_capsule, dict):
                    issues.append("capsule invalid JSON")
                else:
                    capsule = loaded_capsule
                if capsule_digest != assignment["capsule_sha256"]:
                    issues.append("capsule hash mismatch")
                if len(capsule_bytes) != assignment["capsule_bytes"]:
                    issues.append("capsule bytes mismatch")
                if isinstance(loaded_capsule, dict):
                    for name in (
                        "assignment_id", "runner_id", "role", "window_id", "doc_id",
                        "document_path", "core_range", "source_sha256",
                        "source_excerpt_ref", "source_excerpt_sha256", "source_excerpt_bytes",
                    ):
                        if loaded_capsule.get(name) != assignment.get(name):
                            issues.append(f"capsule {name} mismatch")
                    if loaded_capsule.get("blindness") != {
                        "other_reviewer_results": "forbidden",
                        "prior_audits": "forbidden",
                        "unrelated_windows": "forbidden",
                    }:
                        issues.append("capsule blindness mismatch")
            if excerpt_path is None or not excerpt_path.is_file():
                issues.append("source excerpt missing")
            else:
                try:
                    excerpt_bytes, excerpt_digest = x_capture_semantic(
                        excerpt_path, assignment["source_excerpt_sha256"]
                    )
                except Exception:
                    excerpt_bytes = b""
                    excerpt_digest = None
                if excerpt_digest != assignment["source_excerpt_sha256"]:
                    issues.append("source excerpt hash mismatch")
                if len(excerpt_bytes) != assignment["source_excerpt_bytes"]:
                    issues.append("source excerpt bytes mismatch")
            if source_path is None or not source_path.is_file():
                issues.append("canonical source missing")
            else:
                try:
                    source_content_bytes, source_digest = x_capture_semantic(
                        source_path, assignment["source_sha256"]
                    )
                except Exception:
                    source_content_bytes = None
                    source_digest = None
                if source_digest != assignment["source_sha256"]:
                    issues.append("canonical source hash mismatch")
            if group is not None and capsule:
                metadata_expected = {
                    "runner_id": assignment["runner_id"], "role": assignment["role"],
                    "window_id": assignment["window_id"], "doc_id": assignment["doc_id"],
                    "document_path": assignment["document_path"],
                    "core_range": assignment["core_range"],
                    "capsule_ref": assignment["capsule_ref"],
                    "capsule_bytes": assignment["capsule_bytes"],
                    "model": assignment["required_model"],
                    "reasoning_effort": assignment["required_reasoning_effort"],
                    "prior_substantive_assignment_count": 0,
                    "terminal_after_result": True, "no_followup_reuse": True,
                    "runner_thread_id": runner_threads.get(assignment["runner_id"]),
                }
                for name, wanted in metadata_expected.items():
                    if combined.get(name) != wanted:
                        issues.append(f"registry {name} mismatch")
                if hash_field(combined, "capsule") != assignment["capsule_sha256"]:
                    issues.append("registry capsule hash mismatch")
                if hash_field(combined, "source") != assignment["source_sha256"]:
                    issues.append("registry source hash mismatch")
                if combined.get("source_excerpt_ref") not in (None, assignment["source_excerpt_ref"]):
                    issues.append("registry source excerpt ref mismatch")
                if hash_field(combined, "source_excerpt") not in (None, assignment["source_excerpt_sha256"]):
                    issues.append("registry source excerpt hash mismatch")
                if combined.get("source_excerpt_bytes") not in (None, assignment["source_excerpt_bytes"]):
                    issues.append("registry source excerpt bytes mismatch")
                context = first(combined, "context_ranges", "overlap_ranges")
                if context is not None and context != capsule.get("context_ranges", []):
                    issues.append("registry context ranges mismatch")
                if combined.get("actual_model") not in (None, assignment["required_model"]):
                    issues.append("registry actual model mismatch")
                if combined.get("actual_reasoning_effort") not in (None, assignment["required_reasoning_effort"]):
                    issues.append("registry actual effort mismatch")
                if combined.get("agent_thread_id") in set(runner_threads.values()):
                    issues.append("reviewer thread reuses persistent runner root thread")
                if combined.get("fork_turns") not in (None, "none"):
                    issues.append("registry fork_turns mismatch")
        if not isinstance(row.get("completed_at"), str) or not row["completed_at"]:
            issues.append("manifest completed_at missing")

        result_ref = first(row, "result_ref", "raw_result_ref")
        result_hash = hash_field(row, "result")
        result_bytes = row.get("result_bytes")
        if not isinstance(result_ref, str) or not result_ref:
            issues.append("result ref missing")
        if x_canonical_sha256(result_hash) is None:
            issues.append("result hash missing")
        if not isinstance(result_bytes, int) or isinstance(result_bytes, bool) or result_bytes < 0:
            issues.append("result bytes invalid")
        if group is not None:
            if first(combined, "result_ref", "raw_result_ref") != result_ref:
                issues.append("registry result ref differs")
            if hash_field(combined, "result") != result_hash:
                issues.append("registry result hash differs")
            if combined.get("result_bytes") != result_bytes:
                issues.append("registry result bytes differs")
            if combined.get("completed_at") != row.get("completed_at"):
                issues.append("registry completed_at differs")
        result_path = resolve_ref(result_ref)
        if result_path is not None:
            x_record_runner_artifact(result_path)
        expected_result_dir = (
            ROOT / "runners" / assignment["runner_id"] / "raw_results"
            if assignment is not None
            else ROOT / "runners"
        )
        raw: dict[str, Any] | None = None
        raw_result_bytes: bytes | None = None
        if (
            result_path is None
            or not result_path.is_file()
            or not x_checkpoint_artifact_present(result_path)
            or not under(result_path, expected_result_dir)
        ):
            issues.append("raw result missing or out of scope")
        else:
            referenced_raw.add(result_path.resolve())
            if result_path.resolve() in failed_result_paths:
                issues.append("positive attempt reuses failed result path")
            if isinstance(result_hash, str) and result_hash in failed_result_hashes:
                issues.append("positive attempt reuses failed result hash")
            try:
                raw_result_bytes, captured_result_hash = x_capture_semantic(
                    result_path,
                    result_hash if x_canonical_sha256(result_hash) is not None else None,
                )
                loaded_raw = x_json_loads(raw_result_bytes.decode("utf-8"))
            except Exception:
                raw_result_bytes = None
                captured_result_hash = None
                loaded_raw = None
            if isinstance(result_hash, str) and captured_result_hash != result_hash:
                issues.append("raw result hash mismatch")
            if (
                isinstance(result_bytes, int)
                and (raw_result_bytes is None or len(raw_result_bytes) != result_bytes)
            ):
                issues.append("raw result bytes mismatch")
            if not isinstance(loaded_raw, dict):
                issues.append("raw result invalid JSON")
            else:
                raw = loaded_raw
        native_proof: dict[str, Any] = {}
        if assignment is not None and group is not None and result_path is not None:
            native_session_id = combined.get("_native_thread_id")
            native_session_row = (
                checkpoint_native_sessions.get(native_session_id)
                if isinstance(native_session_id, str)
                else None
            )
            native_session_path = (
                checkpoint_native_paths.get(native_session_id)
                if isinstance(native_session_id, str)
                else None
            )
            if (
                not isinstance(native_session_id, str)
                or not isinstance(native_session_row, dict)
                or native_session_path is None
            ):
                issues.append("attempt does not resolve to one checkpointed native session")
            elif result_path.is_file() and raw_result_bytes is not None:
                session_refs = x_values([row, combined], "session_ref")
                if len(session_refs) > 1:
                    issues.append("registry and manifest session ref conflict")
                elif len(session_refs) == 1:
                    declared_session_path = (
                        Path(session_refs[0])
                        if isinstance(session_refs[0], str)
                        else None
                    )
                    sessions_root = (Path.home() / ".codex" / "sessions").resolve()
                    if (
                        declared_session_path is None
                        or not declared_session_path.is_absolute()
                        or declared_session_path.is_symlink()
                        or not declared_session_path.is_file()
                        or not under(declared_session_path, sessions_root)
                        or declared_session_path.resolve() != native_session_path.resolve()
                    ):
                        issues.append("declared session ref differs from native session")
                session_hashes = x_values(
                    [row, combined], "session_sha256", "session_hash"
                )
                if len(session_hashes) > 1:
                    issues.append("registry and manifest session hash conflict")
                elif (
                    len(session_hashes) == 1
                    and session_hashes[0] != native_session_row.get("prefix_sha256")
                ):
                    issues.append("declared session hash differs from checkpoint prefix")
                session_issues, native_proof = x_native_session_issues(
                    native_session_id,
                    native_session_row,
                    native_session_path,
                    combined,
                    assignment,
                    raw_result_bytes,
                    str(runner_threads.get(assignment["runner_id"]) or ""),
                )
                issues.extend(session_issues)
                runner_input_hashes[f"native_session:{native_session_id}"] = (
                    native_session_row.get("prefix_sha256")
                )
            else:
                issues.append("native session terminal binding lacks captured raw-result bytes")
        if (
            raw is not None
            and assignment is not None
            and capsule
            and key is not None
            and source_content_bytes is not None
        ):
            try:
                source_lines = source_content_bytes.decode("utf-8").splitlines()
            except Exception:
                issues.append("canonical source is not valid UTF-8")
            else:
                issues.extend(x_raw_issues(raw, assignment, capsule, key, source_lines))

        validation_refs = x_values([row, combined] if group is not None else [row], "validation_ref")
        validation_hashes = x_values(
            [row, combined] if group is not None else [row],
            "validation_sha256", "validation_hash",
        )
        validation_ref = validation_refs[0] if len(validation_refs) == 1 else None
        validation_hash = validation_hashes[0] if len(validation_hashes) == 1 else None
        if len(validation_refs) > 1:
            issues.append("validation refs conflict")
        if len(validation_hashes) > 1:
            issues.append("validation hashes conflict")
        if validation_ref is not None and assignment is not None:
            validation_path = resolve_ref(validation_ref)
            if validation_path is not None:
                x_record_runner_artifact(validation_path)
            validation_dir = ROOT / "runners" / assignment["runner_id"] / "validation"
            if (
                validation_path is None
                or not validation_path.is_file()
                or not x_checkpoint_artifact_present(validation_path)
                or not under(validation_path, validation_dir)
            ):
                issues.append("validation receipt missing or out of scope")
            else:
                try:
                    validation_bytes, actual_validation_hash = x_capture_semantic(
                        validation_path,
                        validation_hash
                        if x_canonical_sha256(validation_hash) is not None
                        else None,
                    )
                    validation = x_json_loads(validation_bytes.decode("utf-8"))
                except Exception:
                    actual_validation_hash = None
                    validation = None
                if validation_hash is not None and validation_hash != actual_validation_hash:
                    issues.append("validation hash mismatch")
                if not isinstance(validation, dict):
                    issues.append("validation receipt invalid JSON")
                elif key is not None:
                    if validation.get("assignment_id") != assignment["assignment_id"]:
                        issues.append("validation assignment mismatch")
                    if validation.get("audit_id") not in (None, AUDIT_ID):
                        issues.append("validation audit mismatch")
                    if validation.get("runner_id") not in (None, assignment["runner_id"]):
                        issues.append("validation runner mismatch")
                    validation_attempt, validation_attempt_issues = x_attempt(validation)
                    if validation_attempt_issues or validation_attempt != key[1]:
                        issues.append("validation attempt mismatch")
                    if first(validation, "result_ref", "raw_result_ref") != result_ref:
                        issues.append("validation result ref mismatch")
                    if first(
                        validation, "result_sha256", "raw_result_sha256", "result_hash"
                    ) != result_hash:
                        issues.append("validation result hash mismatch")
                    if validation.get("result_bytes") not in (None, result_bytes):
                        issues.append("validation result bytes mismatch")
                    if validation.get("coverage_credit") not in (None, 1, True):
                        issues.append("validation coverage credit mismatch")
                    validation_positive = False
                    for name in (
                        "validation_passed", "passed", "valid", "valid_coverage",
                        "schema_validation_passed", "dispatch_validation_passed",
                        "exact_evidence_validation_passed", "scope_validation_passed",
                        "schema_validation", "hash_validation", "range_validation",
                    ):
                        if validation.get(name) is True:
                            validation_positive = True
                        elif validation.get(name) is False:
                            issues.append(f"validation {name} is false")
                    for name in ("errors", "validation_errors"):
                        if name in validation and validation.get(name) not in (None, []):
                            issues.append(f"validation {name} nonempty")
                    statuses = [
                        str(validation[name]).lower()
                        for name in ("status", "validation_status", "state")
                        if validation.get(name) is not None
                    ]
                    if any(
                        status in X_NEGATIVE or any(marker in status for marker in ("fail", "invalid", "reject", "quarant"))
                        for status in statuses
                    ):
                        issues.append("validation status negative")
                    if any(status in POSITIVE for status in statuses):
                        validation_positive = True
                    checks = validation.get("checks")
                    if isinstance(checks, dict) and any(
                        str(value).lower() not in {"pass", "passed", "true"}
                        and value is not True
                        for value in checks.values()
                    ):
                        issues.append("validation contains failed check")
                    if not validation_positive:
                        issues.append("validation lacks explicit positive validation")
                validation_hash = actual_validation_hash
        elif validation_hash is not None:
            issues.append("validation hash without ref")

        if issues:
            if (
                result_path is not None
                and result_path.is_file()
                and under(result_path, expected_result_dir)
            ):
                invalid_candidate_result_paths.add(result_path.resolve())
                invalid_candidate_result_hashes.add(h(result_path))
            if not vetoed:
                independent_candidate_issues[
                    f"{row.get('_receipt_file')}:{row.get('_receipt_line')}"
                ] = sorted(set(issues))
                unresolved_positive_keys.add(
                    f"manifest:{row.get('_receipt_file')}:{row.get('_receipt_line')}"
                )
        if not issues:
            assert key is not None and assignment is not None and group is not None
            recomputed_receipts.append(
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
                    "manifest_receipt": f"{row.get('_receipt_file')}:{row.get('_receipt_line')}",
                    "registry_receipts": sorted(
                        f"{item.get('_receipt_file')}:{item.get('_receipt_line')}"
                        for item in group["rows"]
                    ),
                }
            )

    reuse_safe_receipts: list[dict[str, Any]] = []
    for receipt in recomputed_receipts:
        receipt_path = resolve_ref(receipt.get("result_ref"))
        if (
            receipt_path is not None
            and receipt_path.resolve() in invalid_candidate_result_paths
        ) or receipt.get("result_sha256") in invalid_candidate_result_hashes:
            receipt_label = str(receipt.get("manifest_receipt"))
            invalid_reuse_receipts.add(receipt_label)
            independent_candidate_issues[receipt_label] = [
                "positive result path or bytes are reused by an invalid zero-credit candidate"
            ]
        else:
            reuse_safe_receipts.append(receipt)
    recomputed_receipts = reuse_safe_receipts

    for group in all_group_infos:
        if group["completion"] is None:
            continue
        full_key = group.get("full_key")
        if full_key is not None and full_key in positive_manifest_keys:
            continue
        base_key = group["base_key"]
        pair = (base_key[0], base_key[1])
        vetoed = pair in explicit_veto_pairs or any(
            x_same_veto(group["combined"], veto)
            for veto in failures_by_assignment.get(base_key[0], [])
        )
        if not vetoed:
            unresolved_positive_keys.add(
                f"registry:{base_key[0]}:attempt-{base_key[1]}"
            )
    for row in unkeyed_registry_rows:
        if not x_claims_positive(row):
            continue
        vetoed = any(
            x_same_veto(row, veto)
            for veto in failures_by_assignment.get(str(row.get("assignment_id")), [])
        )
        if not vetoed:
            unresolved_positive_keys.add(
                f"registry-unkeyed:{row.get('_receipt_file')}:{row.get('_receipt_line')}"
            )

    independent_unresolved_attempts: list[str] = []
    for group in all_group_infos:
        if group["completion"] is not None:
            continue
        base_key = group["base_key"]
        pair = (base_key[0], base_key[1])
        vetoed = pair in explicit_veto_pairs or any(
            x_same_veto(group["combined"], veto)
            for veto in failures_by_assignment.get(base_key[0], [])
        )
        if not vetoed:
            independent_unresolved_attempts.append(
                f"{base_key[0]}:attempt-{base_key[1]}:{group['combined'].get('agent_instance_id')}"
            )
    for row in unkeyed_registry_rows:
        vetoed = any(
            x_same_veto(row, veto)
            for veto in failures_by_assignment.get(str(row.get("assignment_id")), [])
        )
        if not vetoed:
            independent_unresolved_attempts.append(
                f"unkeyed:{row.get('assignment_id')}:{row.get('_receipt_file')}:{row.get('_receipt_line')}"
            )
    independent_unresolved_attempts = sorted(set(independent_unresolved_attempts))
    independent_unmanifested_raw = sorted(
        str(path.relative_to(ROOT))
        for path in raw_files
        if path.resolve() not in referenced_raw
    )

    by_assignment: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for receipt in recomputed_receipts:
        by_assignment[str(receipt["assignment_id"])].append(receipt)
    independent_receipts: list[dict[str, Any]] = []
    redundant_valid_attempts: dict[str, list[dict[str, Any]]] = {}
    for assignment_id, rows in by_assignment.items():
        ordered_rows = sorted(
            rows,
            key=lambda receipt: (
                int(str(receipt.get("attempt")))
                if str(receipt.get("attempt", "")).isdigit()
                else 10**18,
                str(receipt.get("agent_instance_id")),
                str(receipt.get("manifest_receipt")),
            ),
        )
        independent_receipts.append(ordered_rows[0])
        if len(ordered_rows) > 1:
            redundant_valid_attempts[assignment_id] = ordered_rows[1:]
    closure_safe_independent_receipts: list[dict[str, Any]] = []
    for receipt in independent_receipts:
        proof = receipt.get("native_session_proof")
        session_id = proof.get("session_id") if isinstance(proof, dict) else None
        session_row = (
            checkpoint_native_sessions.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        session_path = (
            checkpoint_native_paths.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        if not isinstance(session_row, dict) or session_path is None:
            closure_issues = ["independent winner lacks native-session seal"]
        else:
            _closed_bytes, closure_issues = x_read_closed_native_session(
                session_path, session_row
            )
        if closure_issues:
            label = str(receipt.get("manifest_receipt"))
            independent_candidate_issues[label] = sorted(
                set(independent_candidate_issues.get(label, []) + closure_issues)
            )
            unresolved_positive_keys.add(f"manifest:{label}")
        else:
            closure_safe_independent_receipts.append(receipt)
    independent_receipts = closure_safe_independent_receipts
    independent_ids = {str(row["assignment_id"]) for row in independent_receipts}

    v2_floor_invalidations: dict[str, list[str]] = {}
    surviving_floor_receipts: dict[str, dict[str, Any]] = {}
    normalized_floor_attempts: dict[str, str] = {}
    for assignment_id, floor in sorted(v2_floor_receipts.items()):
        floor_issues: list[str] = []
        floor_attempt = x_attempt_value(floor.get("attempt"))
        if assignment_id not in assignments:
            floor_issues.append("floor assignment absent from sealed manifest")
        result_ref = floor.get("result_ref")
        result_hash = x_canonical_sha256(floor.get("result_sha256"))
        result_path = resolve_ref(result_ref)
        expected_floor_dir = (
            ROOT / "runners" / str(floor.get("runner_id")) / "raw_results"
        )
        if (
            result_path is None
            or not result_path.is_file()
            or not x_checkpoint_artifact_present(result_path)
            or not under(result_path, expected_floor_dir)
        ):
            floor_issues.append("floor raw result missing or outside runner namespace")
        else:
            try:
                floor_result_bytes, floor_result_digest = x_capture_semantic(
                    result_path, result_hash
                )
            except Exception:
                floor_result_bytes = b""
                floor_result_digest = None
            if result_hash is None or floor_result_digest != result_hash:
                floor_issues.append("floor raw result differs from crosschecked hash")
            else:
                referenced_raw.add(result_path)
        manifest_matches = [
            manifest
            for manifest in all_manifests
            if manifest.get("assignment_id") == assignment_id
            and manifest.get("agent_instance_id") == floor.get("agent_instance_id")
            and hash_field(manifest, "result") == result_hash
            and first(manifest, "result_ref", "raw_result_ref") == result_ref
        ]
        manifest = manifest_matches[0] if len(manifest_matches) == 1 else {}
        if len(manifest_matches) != 1:
            floor_issues.append("crosschecked floor manifest lineage missing or duplicated")
        elif not x_claims_positive(manifest):
            floor_issues.append("crosschecked floor manifest is no longer positive")

        floor_attempt_candidates = {
            attempt
            for evidence in [floor, manifest, *all_registry]
            if evidence.get("assignment_id") == assignment_id
            and evidence.get("agent_instance_id") == floor.get("agent_instance_id")
            and (
                evidence is floor
                or evidence is manifest
                or first(evidence, "result_ref", "raw_result_ref") == result_ref
            )
            for attempt in [x_attempt(evidence)[0]]
            if attempt is not None
        }
        if floor_attempt is not None:
            floor_attempt_candidates.add(floor_attempt)
        floor_attempt_inferred = False
        if len(floor_attempt_candidates) > 1:
            floor_issues.append("crosschecked floor lineage has conflicting attempts")
        elif len(floor_attempt_candidates) == 1:
            floor_attempt = next(iter(floor_attempt_candidates))
        else:
            floor_attempt = "1"
            floor_attempt_inferred = True
        normalized_floor_attempts[assignment_id] = floor_attempt
        if manifest and any(
            x_floor_veto_matches({**floor, "attempt": floor_attempt}, manifest, veto)
            for veto in failures_by_assignment.get(assignment_id, [])
        ):
            floor_issues.append("crosschecked floor attempt has immutable veto")
        if floor_attempt is not None and (
            assignment_id,
            floor_attempt,
        ) in explicit_veto_pairs:
            floor_issues.append("crosschecked floor assignment/attempt explicitly vetoed")
        floor_native_session_id = manifest.get("_native_thread_id") if manifest else None
        floor_identity = {
            "agent_instance_id": floor.get("agent_instance_id"),
            "agent_thread_id": floor_native_session_id or floor.get("agent_thread_id"),
            "agent_path": manifest.get("agent_path") if manifest else None,
        }
        floor_pair = (assignment_id, floor_attempt)
        all_floor_evidence = [
            *all_registry, *all_manifests, *all_failures,
            *coordination_quarantine, *all_auxiliary,
        ]
        pair_identity_values: dict[str, set[str]] = defaultdict(set)
        for evidence in all_floor_evidence:
            evidence_attempt, evidence_attempt_issues = x_attempt(evidence)
            if (
                evidence_attempt_issues
                or evidence.get("assignment_id") != assignment_id
                or evidence_attempt != floor_attempt
            ):
                continue
            for name in X_IDENTITY_FIELDS:
                candidate = x_identity_field(
                    name,
                    evidence.get("_native_thread_id") or evidence.get(name)
                    if name == "agent_thread_id"
                    else evidence.get(name),
                )
                if candidate is not None:
                    pair_identity_values[name].add(candidate)
        for name, values in pair_identity_values.items():
            if len(values) > 1:
                floor_issues.append(
                    f"floor assignment/attempt reuses multiple {name} values"
                )
            expected_value = x_identity_field(name, floor_identity.get(name))
            if expected_value is not None and values and values != {expected_value}:
                floor_issues.append(
                    f"floor assignment/attempt {name} differs from sealed identity"
                )
        for name, value in floor_identity.items():
            if value is None:
                continue
            used_pairs: set[tuple[str, str]] = set()
            ungoverned_partial_reuse: list[str] = []
            for evidence in all_floor_evidence:
                observed_value = (
                    evidence.get("_native_thread_id")
                    or x_identity_value(evidence, name)
                    if name == "agent_thread_id"
                    else x_identity_value(evidence, name)
                )
                if observed_value != value:
                    continue
                evidence_attempt, evidence_attempt_issues = x_attempt(evidence)
                evidence_assignment = evidence.get("assignment_id")
                if (
                    isinstance(evidence_assignment, str)
                    and evidence_assignment
                    and not evidence_attempt_issues
                    and evidence_attempt is not None
                ):
                    used_pairs.add((evidence_assignment, evidence_attempt))
                    continue
                receipt_file = str(evidence.get("_receipt_file") or "")
                governed_pre_attempt_floor_lineage = (
                    evidence_assignment == assignment_id
                    and evidence.get("agent_instance_id")
                    == floor.get("agent_instance_id")
                    and first(evidence, "result_ref", "raw_result_ref") == result_ref
                    and hash_field(evidence, "result") == result_hash
                    and (
                        receipt_file.endswith(
                            (
                                "fresh_agent_assignment_registry.jsonl",
                                "result_manifest.jsonl",
                            )
                        )
                        or (
                            evidence.get("_artifact_semantic_class")
                            == "validation_artifact"
                            and evidence.get("validation_passed") is True
                        )
                    )
                    and x_claims_positive(evidence)
                )
                if not governed_pre_attempt_floor_lineage:
                    ungoverned_partial_reuse.append(
                        f"{evidence.get('_receipt_file')}:{evidence.get('_receipt_line')}"
                    )
            if used_pairs - {floor_pair}:
                floor_issues.append(f"floor {name} reused by another attempt identity")
            if ungoverned_partial_reuse:
                floor_issues.append(
                    f"floor {name} reused by malformed/unkeyed evidence: "
                    f"{sorted(set(ungoverned_partial_reuse))}"
                )
        if floor_attempt is not None and (assignment_id, floor_attempt) in X_KNOWN_REVOKED:
            floor_issues.append("floor attempt is immutable-revoked")
        if isinstance(floor_native_session_id, str):
            floor_session_row = checkpoint_native_sessions.get(floor_native_session_id)
            floor_session_path = checkpoint_native_paths.get(floor_native_session_id)
            if not isinstance(floor_session_row, dict) or floor_session_path is None:
                floor_issues.append("floor native session absent from pinned checkpoint")
            else:
                _floor_session_bytes, floor_session_issues = (
                    x_read_closed_native_session(
                        floor_session_path, floor_session_row
                    )
                )
                floor_issues.extend(floor_session_issues)
        else:
            floor_issues.append("floor attempt lacks checkpointed native session")
        if floor_issues:
            v2_floor_invalidations[assignment_id] = sorted(set(floor_issues))
            continue
        surviving_floor_receipts[assignment_id] = {
            **floor,
            "attempt": floor_attempt,
            "agent_path": manifest.get("agent_path"),
            "result_bytes": (
                len(floor_result_bytes)
                if result_path is not None and result_path.is_file()
                else None
            ),
            "manifest_receipt": (
                f"{manifest.get('_receipt_file')}:{manifest.get('_receipt_line')}"
                if manifest
                else None
            ),
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

    # Transaction-close revalidation is per prospective attempt.  A changed
    # session is removed before the independent eligible/credit sets are built;
    # it never suppresses an unrelated assignment or the V2 floor.
    final_closure_safe_receipts: list[dict[str, Any]] = []
    for receipt in independent_receipts:
        proof = receipt.get("native_session_proof")
        session_id = proof.get("session_id") if isinstance(proof, dict) else None
        session_row = (
            checkpoint_native_sessions.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        session_path = (
            checkpoint_native_paths.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        if not isinstance(session_row, dict) or session_path is None:
            closure_issues = ["missing native-session seal at transaction close"]
        else:
            _closed_bytes, closure_issues = x_read_closed_native_session(
                session_path, session_row
            )
        if closure_issues:
            label = str(receipt.get("manifest_receipt"))
            independent_candidate_issues[label] = sorted(
                set(independent_candidate_issues.get(label, []) + closure_issues)
            )
            unresolved_positive_keys.add(f"manifest:{label}")
        else:
            final_closure_safe_receipts.append(receipt)
    independent_receipts = final_closure_safe_receipts
    independent_ids = {
        str(receipt["assignment_id"]) for receipt in independent_receipts
    }

    strict_receipts_by_assignment = {
        str(receipt["assignment_id"]): receipt for receipt in independent_receipts
    }
    final_receipts_by_assignment = dict(surviving_floor_receipts)
    redundant_strict_attempts: set[str] = set()
    for assignment_id, receipt in sorted(strict_receipts_by_assignment.items()):
        floor_receipt = final_receipts_by_assignment.get(assignment_id)
        if floor_receipt is None:
            final_receipts_by_assignment[assignment_id] = receipt
        elif (
            floor_receipt.get("result_sha256") == receipt.get("result_sha256")
            and floor_receipt.get("agent_instance_id") == receipt.get("agent_instance_id")
        ):
            enriched = dict(receipt)
            enriched["credit_provenance"] = [
                "v2_crosschecked_floor_20260710T0343Z",
                "v3_strict_recomputation",
            ]
            final_receipts_by_assignment[assignment_id] = enriched
        else:
            redundant_strict_attempts.add(assignment_id)
    independent_credit_receipts = sorted(
        final_receipts_by_assignment.values(), key=lambda item: str(item.get("assignment_id"))
    )
    independent_credit_ids = set(final_receipts_by_assignment)
    independent_unmanifested_raw = sorted(
        str(path.relative_to(ROOT))
        for path in raw_files
        if path.resolve() not in {item.resolve() for item in referenced_raw}
    )

    independent_map = {row["assignment_id"]: row for row in independent_receipts}
    reported_map = {
        row.get("assignment_id"): row
        for row in eligible_receipts_reported
        if isinstance(row, dict) and isinstance(row.get("assignment_id"), str)
    }
    if set(eligible_reported) != independent_ids:
        errors.append(
            "primary eligible set differs from independent recomputation: "
            f"missing_from_primary={sorted(independent_ids - set(eligible_reported))}, "
            f"extra_in_primary={sorted(set(eligible_reported) - independent_ids)}"
        )
    for assignment_id in sorted(independent_ids | set(eligible_reported)):
        if assignment_id in independent_map and assignment_id in reported_map:
            if x_canonical(independent_map[assignment_id]) != x_canonical(reported_map[assignment_id]):
                errors.append(f"primary eligible receipt detail mismatch: {assignment_id}")

    for path in sorted(raw_files):
        observed_raw_hash = sha256(path)
        runner_input_hashes[str(path.relative_to(ROOT))] = observed_raw_hash
        x_record_input(path)

    def x_rehash_runner_inventory() -> list[str]:
        changed: list[str] = []
        for relative_ref, observed_hash in runner_input_hashes.items():
            if relative_ref.startswith("native_session:"):
                session_id = relative_ref.split(":", 1)[1]
                row = checkpoint_native_sessions.get(session_id, {})
                path = checkpoint_native_paths.get(session_id)
                try:
                    current_hash = (
                        x_sha256_prefix(path, row.get("prefix_bytes"))
                        if path is not None and path.is_file()
                        else None
                    )
                except Exception:
                    current_hash = None
                if current_hash != observed_hash:
                    changed.append(relative_ref)
                continue
            path = ROOT / relative_ref
            prefix = runner_prefix_limits.get(relative_ref)
            if prefix is not None:
                state, count, wanted_prefix = prefix
                try:
                    current_prefix_hash = (
                        x_sha256_prefix(path, count)
                        if state == "present" and path.is_file()
                        else hashlib.sha256(b"").hexdigest()
                        if state == "missing"
                        else None
                    )
                except Exception:
                    current_prefix_hash = None
                current_hash = current_prefix_hash
                if current_prefix_hash != wanted_prefix:
                    changed.append(f"{relative_ref}:checkpoint-prefix")
            elif relative_ref in checkpoint_runner_artifacts:
                artifact_row = checkpoint_runner_artifacts[relative_ref]
                current_hash = (
                    sha256(path)
                    if artifact_row.get("state") == "present" and path.is_file()
                    else None
                    if artifact_row.get("state") == "missing"
                    else None
                )
            else:
                current_hash = sha256(path) if path.is_file() else None
            if current_hash != observed_hash:
                changed.append(relative_ref)
        return sorted(changed)

    def x_reenumerate_authoritative_runner_inputs() -> list[str]:
        current_set = x_runner_file_set()
        changed = {
            f"added:{path.relative_to(ROOT.resolve())}"
            for path in current_set - initial_runner_file_set
        }
        changed.update(
            f"removed:{path.relative_to(ROOT.resolve())}"
            for path in initial_runner_file_set - current_set
        )
        for path in current_set & initial_runner_file_set:
            relative = str(path.relative_to(ROOT.resolve()))
            if path.suffix.lower() != ".jsonl" and sha256(path) != initial_runner_file_hashes.get(relative):
                changed.add(f"changed:{relative}")
        return sorted(changed)

    def x_rehash_all_read_inputs() -> list[str]:
        changed: list[str] = []
        for ref, observed_hash in transaction_input_hashes.items():
            path = Path(ref) if Path(ref).is_absolute() else REPO / ref
            current_hash = sha256(path) if path.is_file() else None
            if current_hash != observed_hash:
                changed.append(ref)
        return sorted(changed)

    midscan_changes = x_rehash_runner_inventory()
    if midscan_changes:
        scan_instability_count += len(midscan_changes)
        errors.append(f"runner inputs changed after crosscheck scan: {midscan_changes}")
    midscan_set_changes = x_reenumerate_authoritative_runner_inputs()
    if midscan_set_changes:
        scan_instability_count += len(midscan_set_changes)
        errors.append(
            "authoritative runner input file set changed after crosscheck scan: "
            f"{midscan_set_changes}"
        )

    live_integrity_ok = (
        all(value == "pass" for value in seal_checks.values())
        and ready_integrity_ok
        and authority_integrity_ok
        and lineage_integrity_ok
        and assignment_integrity_ok
        and runner_registry_integrity_ok
        and runner_namespace_integrity_ok
        and root_quarantine_integrity_ok
        and unaccounted_malformed == 0
        and pinned_malformed_mismatch_count == 0
        and scan_instability_count == 0
    )
    floor_authority_integrity_ok = (
        live_integrity_ok
        and
        seal_checks.get("v2_crosschecked_floor_snapshot") == "pass"
        and seal_checks.get("v2_crosschecked_floor_receipt") == "pass"
        and seal_checks.get("protocol_alert_0003") == "pass"
        and len(v2_floor_receipts) == 19
    )
    independently_preserved_floor_ids = (
        set(surviving_floor_receipts) if floor_authority_integrity_ok else set()
    )
    independent_new_v3_ids = (
        independent_ids - independently_preserved_floor_ids
        if live_integrity_ok
        else set()
    )
    independent_credited_ids = independently_preserved_floor_ids | independent_new_v3_ids
    expected_floor_discrepancies = [
        {
            "assignment_id": assignment_id,
            "runner_id": v2_floor_receipts.get(assignment_id, {}).get("runner_id"),
            "attempt": normalized_floor_attempts.get(assignment_id),
            "result_ref": v2_floor_receipts.get(assignment_id, {}).get("result_ref"),
            "result_sha256": x_canonical_sha256(
                v2_floor_receipts.get(assignment_id, {}).get("result_sha256")
            ),
            "reasons": reasons,
        }
        for assignment_id, reasons in sorted(v2_floor_invalidations.items())
    ]
    if snapshot.get("v2_floor_authority_integrity_passed") is not floor_authority_integrity_ok:
        errors.append("snapshot V2 floor-authority gate differs from independent gate")
    if snapshot.get("preserved_v2_floor_assignment_ids") != sorted(
        independently_preserved_floor_ids
    ):
        errors.append("snapshot preserved V2 floor IDs differ from independent set")
    if snapshot.get("preserved_v2_floor_assignment_ids_sha256") != x_digest(
        independently_preserved_floor_ids
    ):
        errors.append("snapshot preserved V2 floor digest mismatch")
    if snapshot.get("new_v3_credited_assignment_ids") != sorted(
        independent_new_v3_ids
    ):
        errors.append("snapshot new V3 credit IDs differ from independent set")
    if snapshot.get("new_v3_credited_assignment_ids_sha256") != x_digest(
        independent_new_v3_ids
    ):
        errors.append("snapshot new V3 credit digest mismatch")
    if snapshot.get("preserved_v2_floor_assurance_discrepancies") != (
        expected_floor_discrepancies
    ):
        errors.append("snapshot V2 floor discrepancy rows differ from independent proof")
    suppression_reasons = snapshot.get("credit_suppression_reasons")
    if live_integrity_ok:
        if suppression_reasons != []:
            errors.append("clean primary transaction reports fabricated credit suppression")
    elif not isinstance(suppression_reasons, list) or not suppression_reasons:
        errors.append("failed primary transaction omits credit suppression reasons")
    if set(credited_reported) != independent_credited_ids:
        errors.append(
            "primary credited set differs from fail-closed independent set: "
            f"missing_from_primary={sorted(independent_credited_ids - set(credited_reported))}, "
            f"extra_in_primary={sorted(set(credited_reported) - independent_credited_ids)}"
        )
    if snapshot.get("credit_integrity_allows_per_assignment_credit") is not live_integrity_ok:
        errors.append("snapshot credit-integrity gate differs from independent gate")
    if snapshot.get("seal_integrity_allows_per_assignment_credit") is not all(
        value == "pass" for value in seal_checks.values()
    ):
        errors.append("snapshot seal-integrity gate differs from independent gate")
    expected_credited_receipts = {
        assignment_id: dict(receipt)
        for assignment_id, receipt in surviving_floor_receipts.items()
    } if floor_authority_integrity_ok else {}
    if live_integrity_ok:
        for independent_receipt in independent_receipts:
            credited_receipt = dict(independent_receipt)
            assignment_id = str(credited_receipt["assignment_id"])
            if assignment_id in independently_preserved_floor_ids:
                credited_receipt["credit_provenance"] = [
                    "v2_crosschecked_floor_20260710T0343Z",
                    "v3_strict_recomputation",
                ]
            else:
                credited_receipt["credit_provenance"] = ["v3_strict_recomputation"]
            expected_credited_receipts[assignment_id] = credited_receipt
    if {
        row.get("assignment_id"): row
        for row in credited_receipts_reported
        if isinstance(row, dict) and isinstance(row.get("assignment_id"), str)
    } != expected_credited_receipts:
        errors.append("credited receipt details differ from independent provenance policy")
    revoked_credited = sorted(
        pair
        for pair in X_KNOWN_REVOKED
        if any(
            row.get("assignment_id") == pair[0] and str(row.get("attempt")) == pair[1]
            for row in credited_receipts_reported
            if isinstance(row, dict)
        )
    )
    if revoked_credited:
        errors.append(f"known revoked attempts credited: {revoked_credited}")

    expected_by_runner: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in assignments.values():
        expected_by_runner[str(row.get("runner_id"))].append(row)
    failures_by_runner: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in veto_rows:
        runner_id = row.get("_scan_runner_id") or row.get("runner_id")
        if isinstance(runner_id, str):
            failures_by_runner[runner_id].append(row)
    attempts_by_runner = x_completion_attempt_inventory(
        [
            *all_registry,
            *all_manifests,
            *all_failures,
            *coordination_quarantine,
            *all_auxiliary,
        ],
        assignments,
    )
    failed_attempts_by_runner = x_completion_attempt_inventory(
        [
            *all_failures,
            *coordination_quarantine,
            *negative_manifest_rows,
            *terminal_negative_registry_rows,
            *auxiliary_failures,
        ],
        assignments,
    )

    completion_details: dict[str, dict[str, Any]] = {}
    independent_valid_completes = 0
    for number in range(1, 13):
        runner_id = f"runner-{number:02d}"
        path = complete_paths.get(runner_id)
        if path is None:
            completion_details[runner_id] = {
                "present": False,
                "valid": False,
                "issues": [],
                "hashes": {},
            }
            continue
        completion_issues: list[str] = []
        try:
            complete_artifact = checkpoint_runner_artifacts.get(
                str(path.relative_to(ROOT)), {}
            )
            completion_bytes, completion_digest = x_capture_semantic(
                path,
                complete_artifact.get("sha256")
                if isinstance(complete_artifact, dict)
                else None,
            )
            completion = x_json_loads(completion_bytes.decode("utf-8"))
        except Exception:
            completion_digest = None
            completion = None
        if not isinstance(completion, dict) or not completion:
            completion_issues.append("completion receipt invalid")
            completion = {}
        expected_rows = expected_by_runner[runner_id]
        expected_ids = {row["assignment_id"] for row in expected_rows}
        required = {
            "audit_id": AUDIT_ID,
            "runner_id": runner_id,
            "runner_thread_id": runner_threads.get(runner_id),
            "status": "complete",
            "assignment_count": len(expected_rows),
            "valid_assignments": len(expected_rows),
            "required_model": "gpt-5.6-sol",
            "required_reasoning_effort": "ultra",
        }
        for name, wanted in required.items():
            observed = completion.get(name)
            if (
                isinstance(wanted, int)
                and not isinstance(wanted, bool)
                and x_nonnegative_int(observed) != wanted
            ) or (
                not isinstance(wanted, int) and observed != wanted
            ):
                completion_issues.append(f"completion {name} mismatch")
        if not isinstance(completion.get("completed_at"), str) or not completion["completed_at"]:
            completion_issues.append("completion completed_at missing")
        if x_nonnegative_number(completion.get("elapsed_seconds")) is None:
            completion_issues.append("completion elapsed_seconds invalid")
        for name in ("coverage_credit", "validation_passed", "passed", "valid"):
            if name in completion and completion.get(name) not in (1, True):
                completion_issues.append(f"completion {name} is not explicitly positive")
        for name in ("errors", "validation_errors"):
            if name in completion and completion.get(name) != []:
                completion_issues.append(f"completion {name} is not an empty array")
        if not expected_ids.issubset(independent_credit_ids):
            completion_issues.append("completion is premature")
        for name in (
            "duplicate_agent_instances", "recycled_agent_instances",
            "multi_scope_agent_instances", "wrong_model_effort_count",
            "source_capsule_mismatch_count", "scope_spill_count", "role_leak_count",
            "post_terminal_output_count",
        ):
            if x_nonnegative_int(completion.get(name)) != 0:
                completion_issues.append(f"completion {name} is not zero")
        if completion.get("unresolved_infrastructure_issues") != []:
            completion_issues.append("completion unresolved issues nonempty")
        attempts = attempts_by_runner[runner_id]
        identity_lists = {
            field: [
                value
                for row in attempts
                for value in row.get(field, [])
                if isinstance(value, str) and value
            ]
            for field in ("agent_instance_ids", "agent_paths", "agent_thread_ids")
        }
        identities = set(identity_lists["agent_instance_ids"])
        if x_nonnegative_int(completion.get("actual_unique_agents_spawned")) != len(identities):
            completion_issues.append("completion unique agent count mismatch")
        if any(row.get("opaque_lineage") is True for row in attempts):
            completion_issues.append("completion attempt accounting contains opaque identity lineage")
        for field, values in identity_lists.items():
            if len(values) != len(attempts) or len(values) != len(set(values)):
                completion_issues.append(f"completion {field} missing or reused")
        logical_keys = [(row.get("assignment_id"), row.get("attempt")) for row in attempts]
        if len(logical_keys) != len(set(logical_keys)):
            completion_issues.append("completion reuses a canonical assignment/attempt number")
        failed_attempts = failed_attempts_by_runner[runner_id]
        if any(row.get("opaque_lineage") is True for row in failed_attempts):
            completion_issues.append("completion failed-attempt accounting contains opaque lineage")
        if x_nonnegative_int(completion.get("failed_attempts")) != len(failed_attempts):
            completion_issues.append("completion failed attempt count mismatch")
        valid_tokens = sum(int(row.get("token_estimate", 0)) for row in expected_rows)
        valid_capsules = sum(int(row.get("capsule_package_bytes", 0)) for row in expected_rows)
        attempted_tokens = sum(
            int(row.get("token_estimate", 0))
            for row in attempts
            if isinstance(row.get("token_estimate", 0), (int, float))
            and not isinstance(row.get("token_estimate", 0), bool)
        )
        attempted_capsules = sum(
            int(row.get("capsule_package_bytes", 0))
            for row in attempts
            if isinstance(row.get("capsule_package_bytes", 0), (int, float))
            and not isinstance(row.get("capsule_package_bytes", 0), bool)
        )
        for name, wanted in (
            ("valid_token_estimate", valid_tokens),
            ("valid_capsule_package_bytes", valid_capsules),
            ("attempted_token_estimate", attempted_tokens),
            ("attempted_capsule_package_bytes", attempted_capsules),
        ):
            if x_nonnegative_int(completion.get(name)) != wanted:
                completion_issues.append(f"completion {name} mismatch")
        hashes = {"runner_complete_sha256": completion_digest}
        exact_refs = {
            "fresh_agent_assignment_registry_ref": ROOT / "runners" / runner_id / "fresh_agent_assignment_registry.jsonl",
            "result_manifest_ref": ROOT / "runners" / runner_id / "result_manifest.jsonl",
        }
        for name, wanted_path in exact_refs.items():
            observed = resolve_ref(completion.get(name))
            if observed is None or observed.resolve() != wanted_path.resolve() or not observed.is_file():
                completion_issues.append(f"completion {name} mismatch")
            else:
                hashes[name.replace("_ref", "_sha256")] = h(observed)
                claimed = completion.get(name.replace("_ref", "_sha256"))
                if claimed is not None and claimed != hashes[name.replace("_ref", "_sha256")]:
                    completion_issues.append(f"completion {name} claimed hash mismatch")
        final_ref = resolve_ref(completion.get("final_validation_ref"))
        validation_dir = ROOT / "runners" / runner_id / "validation"
        if final_ref is not None:
            x_record_runner_artifact(final_ref)
        if (
            final_ref is None
            or not final_ref.is_file()
            or not x_checkpoint_artifact_present(final_ref)
            or not under(final_ref, validation_dir)
        ):
            completion_issues.append("completion final validation missing")
        else:
            final_artifact = checkpoint_runner_artifacts.get(
                str(final_ref.relative_to(ROOT)), {}
            )
            try:
                final_validation_bytes, final_validation_digest = x_capture_semantic(
                    final_ref,
                    final_artifact.get("sha256")
                    if isinstance(final_artifact, dict)
                    else None,
                )
                final_validation = x_json_loads(
                    final_validation_bytes.decode("utf-8")
                )
            except Exception:
                final_validation_digest = None
                final_validation = None
            hashes["final_validation_sha256"] = final_validation_digest
            claimed_final_hash = completion.get("final_validation_sha256")
            if claimed_final_hash is not None and claimed_final_hash != hashes["final_validation_sha256"]:
                completion_issues.append("completion final validation claimed hash mismatch")
            if not isinstance(final_validation, dict):
                completion_issues.append("final validation invalid")
            else:
                if final_validation.get("audit_id") != AUDIT_ID:
                    completion_issues.append("final validation audit mismatch")
                if final_validation.get("runner_id") != runner_id:
                    completion_issues.append("final validation runner mismatch")
                if str(final_validation.get("status", "")).lower() not in {"pass", "passed"}:
                    completion_issues.append("final validation status mismatch")
                positive_validation = any(
                    final_validation.get(name) is True
                    for name in ("validation_passed", "passed", "valid")
                ) or str(final_validation.get("status", "")).lower() in {"pass", "passed"}
                if any(
                    name in final_validation and final_validation.get(name) is False
                    for name in ("validation_passed", "passed", "valid")
                ):
                    completion_issues.append("final validation has explicit false validation flag")
                if not positive_validation:
                    completion_issues.append("final validation lacks explicit positive validation")
                if final_validation.get("errors") != []:
                    completion_issues.append("final validation errors nonempty")
                if final_validation.get("validation_errors") not in (None, []):
                    completion_issues.append("final validation validation_errors nonempty")
                if x_nonnegative_int(final_validation.get("assignment_count")) != len(expected_rows):
                    completion_issues.append("final validation assignment count mismatch")
                if x_nonnegative_int(final_validation.get("valid_assignment_count")) != len(expected_rows):
                    completion_issues.append("final validation valid count mismatch")
                for name in (
                    "duplicate_agent_instance_count", "duplicate_agent_path_count",
                    "duplicate_agent_thread_id_count", "recycled_agent_count",
                    "multi_scope_agent_count",
                ):
                    if x_nonnegative_int(final_validation.get(name)) != 0:
                        completion_issues.append(f"final validation {name} is not zero")
        assignment_packet = ROOT / "assignments" / f"{runner_id}.jsonl"
        hashes["assignment_packet_sha256"] = (
            x_record_input(assignment_packet) if assignment_packet.is_file() else None
        )
        failed_path = ROOT / "runners" / runner_id / "failed_attempts.jsonl"
        hashes["failed_attempts_sha256"] = sha256(failed_path) if failed_path.is_file() else None
        completion_issues = sorted(set(completion_issues))
        valid = not completion_issues
        independent_valid_completes += int(valid)
        completion_details[runner_id] = {
            "present": True,
            "valid": valid,
            "issues": completion_issues,
            "hashes": hashes,
        }

    reported_completion = snapshot.get("runner_completion_validation", {})
    if not isinstance(reported_completion, dict):
        errors.append("snapshot runner completion validation missing")
        reported_completion = {}
    if set(reported_completion) != expected_runner_names:
        errors.append("snapshot runner completion validation key set mismatch")
    for runner_id, independently_observed in completion_details.items():
        reported = reported_completion.get(runner_id)
        if not isinstance(reported, dict):
            errors.append(f"snapshot lacks completion detail: {runner_id}")
            continue
        if set(reported) != {"present", "valid", "issues", "hashes"}:
            errors.append(f"snapshot completion detail schema mismatch: {runner_id}")
        for name in ("present", "valid", "hashes"):
            if name in {"present", "valid"} and not isinstance(reported.get(name), bool):
                errors.append(f"snapshot completion {name} is not boolean: {runner_id}")
            if name == "hashes" and not isinstance(reported.get(name), dict):
                errors.append(f"snapshot completion hashes are not an object: {runner_id}")
            if reported.get(name) != independently_observed.get(name):
                errors.append(f"snapshot completion {name} mismatch: {runner_id}")
        reported_issues = reported.get("issues")
        if not isinstance(reported_issues, list):
            errors.append(f"snapshot completion issues are not a list: {runner_id}")
        elif any(not isinstance(item, str) for item in reported_issues):
            errors.append(f"snapshot completion issues contain non-strings: {runner_id}")
        elif reported_issues != sorted(set(reported_issues)):
            errors.append(f"snapshot completion issues are not sorted unique: {runner_id}")
        elif reported.get("present") and not reported.get("valid") and not reported_issues:
            errors.append(f"snapshot invalid completion lacks diagnostics: {runner_id}")
        elif reported.get("valid") and reported_issues:
            errors.append(f"snapshot valid completion has diagnostics: {runner_id}")
    if x_count("runner_complete_receipts") != len(complete_paths):
        errors.append("snapshot runner complete receipt count mismatch")
    if x_count("valid_runner_complete_receipts") != independent_valid_completes:
        errors.append("snapshot valid runner complete count mismatch")

    receipted_native_session_ids = {
        str(row.get("_native_thread_id"))
        for row in [
            *all_registry, *all_manifests, *all_failures,
            *all_auxiliary, *coordination_quarantine,
        ]
        if isinstance(row.get("_native_thread_id"), str)
    }
    independent_unreceipted_native_sessions = sorted(
        set(checkpoint_native_sessions) - receipted_native_session_ids
    )
    if snapshot.get("unreceipted_native_sessions") != (
        independent_unreceipted_native_sessions
    ):
        errors.append(
            "snapshot unreceipted_native_sessions differs from independent inventory"
        )

    structural_counts = {
        "expected_assignments": len(assignments),
        "dispatch_records": len(all_registry),
        "dispatch_attempts": len(registry_groups),
        "unique_dispatched_assignments": len({key[0] for key in registry_groups}),
        "result_manifest_records": len(all_manifests),
        "raw_result_files": len(raw_files),
        "unmanifested_raw_result_files": len(independent_unmanifested_raw),
        "failed_attempt_records": len(all_failures),
        "auxiliary_lineage_records": len(all_auxiliary),
        "auxiliary_failure_records": len(auxiliary_failures),
        "open_infrastructure_records": len(open_infrastructure),
        "coordination_quarantine_records": len(coordination_quarantine),
        "known_immutable_revoked_attempts": len(X_KNOWN_REVOKED),
        "malformed_runner_receipts": len(malformed),
        "mechanically_eligible_assignments": len(independent_ids),
        "validated_results": len(independent_ids),
        "credited_assignments": len(independent_credited_ids),
        "strict_v3_mechanically_eligible_assignments": len(independent_ids),
        "strict_v3_mechanically_pending_assignments": len(assignments) - len(independent_ids),
        "preserved_v2_floor_assignments": len(surviving_floor_receipts),
        "new_v3_credited_assignments": len(independent_ids - set(surviving_floor_receipts)),
        "checkpointed_native_sessions": len(checkpoint_native_sessions),
        "receipted_native_sessions": len(receipted_native_session_ids),
        "unreceipted_native_sessions": len(
            independent_unreceipted_native_sessions
        ),
        "mechanically_pending_assignments": len(assignments) - len(independent_ids),
        "pending_assignments": len(assignments) - len(independent_credited_ids),
        "unresolved_dispatch_attempts": len(independent_unresolved_attempts),
    }
    for name, wanted in structural_counts.items():
        if x_count(name) != wanted:
            errors.append(f"snapshot structural count mismatch: {name}")
    reported_quarantine = snapshot.get("quarantine_candidates", [])
    if not isinstance(reported_quarantine, list):
        errors.append("snapshot quarantine_candidates is not a list")
        reported_quarantine = []
    if any(not isinstance(row, dict) for row in reported_quarantine):
        errors.append("snapshot quarantine_candidates contains non-object rows")
    if x_count("quarantine_candidates") != len(reported_quarantine):
        errors.append("snapshot quarantine candidate detail/count mismatch")
    for row in reported_quarantine:
        if not isinstance(row, dict):
            continue
        reasons = row.get("reasons")
        if (
            not isinstance(reasons, list)
            or any(not isinstance(reason, str) for reason in reasons)
            or reasons != sorted(set(reasons))
        ):
            errors.append("snapshot quarantine candidate has non-canonical reasons")
    reported_quarantine_receipts = {
        row.get("receipt")
        for row in reported_quarantine
        if isinstance(row, dict) and isinstance(row.get("receipt"), str)
    }
    omitted_failure_receipts = sorted(
        set(failure_receipt_issues) - reported_quarantine_receipts
    )
    if omitted_failure_receipts:
        errors.append(
            f"primary quarantine omits independently invalid failure receipts: {omitted_failure_receipts}"
        )
    for path in sorted(raw_files):
        runner_input_hashes[str(path.relative_to(ROOT))] = sha256(path)
    if snapshot.get("runner_input_file_sha256") != dict(sorted(runner_input_hashes.items())):
        errors.append("primary snapshot runner-input hash inventory differs from crosscheck state")

    excluded_transaction_paths = {
        args.snapshot.resolve(),
        args.validator.resolve(),
        HERE.resolve(),
    }
    expected_primary_transaction_inputs: dict[str, str] = {}
    for ref, observed_hash in transaction_input_hashes.items():
        if not isinstance(observed_hash, str):
            continue
        candidate_path = Path(ref) if Path(ref).is_absolute() else REPO / ref
        candidate_path = candidate_path.resolve()
        if candidate_path in excluded_transaction_paths:
            continue
        if under(candidate_path, ROOT):
            normalized_ref = str(candidate_path.relative_to(ROOT.resolve()))
        elif under(candidate_path, REPO):
            repo_relative = str(candidate_path.relative_to(REPO.resolve()))
            if repo_relative.startswith("raw_results/"):
                continue
            normalized_ref = f"repo:{repo_relative}"
        else:
            continue
        expected_primary_transaction_inputs[normalized_ref] = observed_hash
    for ref, artifact_row in checkpoint_runner_artifacts.items():
        if (
            artifact_row.get("state") == "present"
            and artifact_row.get("semantic_class") != "checkpoint_metadata"
            and isinstance(
            artifact_row.get("sha256"), str
            )
        ):
            expected_primary_transaction_inputs[ref] = artifact_row["sha256"]
    if snapshot.get("transaction_input_file_sha256") != dict(
        sorted(expected_primary_transaction_inputs.items())
    ):
        errors.append(
            "primary transaction-input inventory differs from independent reconstruction"
        )

    per_runner_reported = snapshot.get("per_runner", {})
    receipted_native_session_ids = {
        str(row.get("_native_thread_id"))
        for row in [
            *all_registry, *all_manifests, *all_failures,
            *all_auxiliary, *coordination_quarantine,
        ]
        if isinstance(row.get("_native_thread_id"), str)
    }
    if isinstance(per_runner_reported, dict):
        if set(per_runner_reported) != expected_runner_names:
            errors.append("snapshot per_runner key set mismatch")
        for runner_id in sorted(expected_runner_names):
            rows = expected_by_runner.get(runner_id, [])
            observed = per_runner_reported.get(runner_id)
            if not isinstance(observed, dict):
                errors.append(f"snapshot per-runner row is not an object: {runner_id}")
                continue
            scan_counts = runner_scan_counts.get(runner_id, {})
            independent_row = {
                "expected_assignments": len(rows),
                "dispatch_records": scan_counts.get("dispatch_records", 0),
                "result_manifest_records": scan_counts.get("result_manifest_records", 0),
                "raw_result_files": scan_counts.get("raw_result_files", 0),
                "failed_attempt_records": scan_counts.get("failed_attempt_records", 0),
                "auxiliary_lineage_records": scan_counts.get("auxiliary_lineage_records", 0),
                "validated_results": len(
                    independent_credit_ids & {row["assignment_id"] for row in rows}
                ),
                "runner_complete_receipts": int(runner_id in complete_paths),
                "runner_complete_valid": completion_details[runner_id]["valid"],
                "unreceipted_native_sessions": len(
                    {
                        session_id
                        for session_id, session_row in checkpoint_native_sessions.items()
                        if session_row.get("runner_id") == runner_id
                    }
                    - receipted_native_session_ids
                ),
                "packet_issues": sorted(set(packet_issues.get(runner_id, []))),
            }
            if set(observed) != set(independent_row):
                errors.append(f"snapshot per-runner field set mismatch: {runner_id}")
            for name, wanted in independent_row.items():
                value = observed.get(name)
                if isinstance(wanted, int) and not isinstance(wanted, bool):
                    if x_nonnegative_int(value) != wanted:
                        errors.append(
                            f"snapshot per-runner {name} mismatch: {runner_id}"
                        )
                elif isinstance(wanted, bool):
                    if value is not wanted:
                        errors.append(
                            f"snapshot per-runner {name} mismatch: {runner_id}"
                        )
                elif value != wanted:
                    errors.append(
                        f"snapshot per-runner {name} mismatch: {runner_id}"
                    )
    else:
        errors.append("snapshot per_runner is not an object")

    snapshot_mode = snapshot.get("mode")
    snapshot_status = snapshot.get("status")
    snapshot_errors = snapshot.get("errors")
    snapshot_localized = snapshot.get("localized_receipt_errors")
    if snapshot.get("authority_scope") != "live_per_assignment_credit_only":
        errors.append("snapshot V3 authority scope is not live per-assignment credit only")
    if snapshot.get("final_lineage_reseal_required") is not True:
        errors.append("snapshot omits the mandatory final-lineage reseal limitation")
    if not isinstance(snapshot_mode, str) or snapshot_mode not in {"in_progress", "final"}:
        errors.append("snapshot mode invalid")
    if not isinstance(snapshot_status, str) or snapshot_status not in {"in_progress", "fail", "pass"}:
        errors.append("snapshot status invalid")
    if not isinstance(snapshot_errors, list):
        errors.append("snapshot errors is not a list")
        snapshot_errors = []
    if not isinstance(snapshot_localized, list):
        errors.append("snapshot localized_receipt_errors is not a list")
        snapshot_localized = []
    if any(not isinstance(item, str) for item in snapshot_errors):
        errors.append("snapshot errors contain non-string values")
    if any(not isinstance(item, str) for item in snapshot_localized):
        errors.append("snapshot localized errors contain non-string values")
    canonical_snapshot_errors = sorted(
        set(item for item in snapshot_errors if isinstance(item, str))
    )
    canonical_snapshot_localized = sorted(
        set(item for item in snapshot_localized if isinstance(item, str))
    )
    if snapshot_errors != canonical_snapshot_errors:
        errors.append("snapshot errors are not a sorted unique string list")
    if snapshot_localized != canonical_snapshot_localized:
        errors.append("snapshot localized errors are not a sorted unique string list")
    if (
        x_count("global_integrity_errors")
        + x_count("final_mode_errors")
        != len(canonical_snapshot_errors)
    ):
        errors.append("snapshot global/final error count mismatch")
    if x_count("localized_receipt_errors") != len(canonical_snapshot_localized):
        errors.append("snapshot localized error count mismatch")
    if live_integrity_ok and x_count("global_integrity_errors") != 0:
        errors.append("snapshot invents global integrity errors absent from independent state")
    if not live_integrity_ok and x_count("global_integrity_errors") < 1:
        errors.append("snapshot omits independently observed global integrity failure")
    if snapshot_mode == "in_progress" and x_count("final_mode_errors") != 0:
        errors.append("in-progress snapshot invents final-mode errors")
    if snapshot_mode == "final" and x_count("valid_runner_complete_receipts") != 12:
        if snapshot_status == "pass":
            errors.append("final pass lacks 12 valid completion receipts")
    if snapshot_mode == "final" and not any(
        isinstance(item, str) and "superseding final validator authority" in item
        for item in snapshot_errors
    ):
        errors.append("final-mode snapshot omits the mandatory V3 lineage-reseal failure")
    unresolved_reported = snapshot.get("unresolved_dispatch_attempts")
    unmanifested_reported = snapshot.get("unmanifested_raw_result_files")
    if not isinstance(unresolved_reported, list):
        errors.append("snapshot unresolved-dispatch detail/count mismatch")
    elif any(not isinstance(item, str) for item in unresolved_reported):
        errors.append("snapshot unresolved-dispatch details contain non-string values")
    elif x_count("unresolved_dispatch_attempts") != len(unresolved_reported):
        errors.append("snapshot unresolved-dispatch detail/count mismatch")
    if not isinstance(unmanifested_reported, list):
        errors.append("snapshot unmanifested-raw detail/count mismatch")
    elif any(not isinstance(item, str) for item in unmanifested_reported):
        errors.append("snapshot unmanifested-raw details contain non-string values")
    elif x_count("unmanifested_raw_result_files") != len(unmanifested_reported):
        errors.append("snapshot unmanifested-raw detail/count mismatch")
    if isinstance(unresolved_reported, list) and unresolved_reported != independent_unresolved_attempts:
        errors.append("snapshot unresolved-dispatch details differ from independent recomputation")
    if isinstance(unmanifested_reported, list) and unmanifested_reported != independent_unmanifested_raw:
        errors.append("snapshot unmanifested-raw details differ from independent recomputation")
    invalid_completion_count = sum(
        1
        for detail in completion_details.values()
        if detail.get("present") and not detail.get("valid")
    )
    required_localized_errors: set[str] = set()
    for key in unresolved_positive_keys:
        if key.startswith("manifest:"):
            required_localized_errors.add(
                f"unresolved invalid positive manifest: {key.removeprefix('manifest:')}"
            )
        elif key.startswith("registry-unkeyed:"):
            required_localized_errors.add(
                "unresolved invalid positive registry row: "
                f"{key.removeprefix('registry-unkeyed:')}"
            )
        elif key.startswith("registry:"):
            required_localized_errors.add(
                "unresolved positive registry attempt without manifest: "
                f"{key.removeprefix('registry:')}"
            )
    required_localized_errors.update(
        f"positive candidate reuses invalid-attempt artifact: {receipt}"
        for receipt in invalid_reuse_receipts
    )
    required_localized_errors.update(
        f"invalid or premature RUNNER_COMPLETE receipt: {runner_id}"
        for runner_id, detail in completion_details.items()
        if detail.get("present") and not detail.get("valid")
    )
    required_localized_errors.update(
        f"failed-attempt immutability evidence missing or changed: {receipt}"
        for receipt, receipt_issues in failure_receipt_issues.items()
        if any("missing" in issue or "hash mismatch" in issue for issue in receipt_issues)
    )
    missing_required_localized = sorted(
        required_localized_errors - set(canonical_snapshot_localized)
    )
    if missing_required_localized:
        errors.append(
            "snapshot localized errors omit independent required diagnostics: "
            f"{missing_required_localized}"
        )
    minimum_localized_errors = len(required_localized_errors)
    if len(canonical_snapshot_localized) < minimum_localized_errors:
        errors.append("snapshot localized error cardinality is below independent minimum")
    independent_localized_basis = bool(required_localized_errors)
    expected_snapshot_status = (
        "fail"
        if snapshot_mode == "final" or not live_integrity_ok or independent_localized_basis
        else "in_progress"
    )
    if snapshot_status != expected_snapshot_status:
        errors.append(
            f"snapshot status differs from independent status: {snapshot_status!r} != "
            f"{expected_snapshot_status!r}"
        )
    if snapshot_mode == "in_progress" and live_integrity_ok and not independent_localized_basis:
        if snapshot_errors or snapshot_localized:
            errors.append("clean in-progress snapshot contains a fabricated failure basis")

    final_transaction_errors: list[str] = []
    final_scan_changes = x_rehash_runner_inventory()
    if final_scan_changes:
        final_transaction_errors.append(
            "runner inputs changed before crosscheck transaction closed: "
            f"{final_scan_changes}"
        )
    final_set_changes = x_reenumerate_authoritative_runner_inputs()
    if final_set_changes:
        final_transaction_errors.append(
            "authoritative runner input file set changed before crosscheck transaction closed: "
            f"{final_set_changes}"
        )
    final_read_changes = x_rehash_all_read_inputs()
    if final_read_changes:
        final_transaction_errors.append(
            "files read by crosscheck changed before transaction closed: "
            f"{final_read_changes}"
        )
    try:
        cross_final_bytes, cross_final_sha256, cross_final_signature = (
            x_descriptor_capture(HERE, cross_start_sha256)
        )
        if (
            cross_start_sha256 is None
            or cross_final_sha256 != cross_start_sha256
            or cross_final_bytes != cross_start_bytes
            or cross_final_signature != cross_start_signature
        ):
            final_transaction_errors.append(
                "crosscheck executable differs from its start-of-transaction seal"
            )
    except Exception as exc:
        final_transaction_errors.append(
            f"crosscheck executable final self-seal failed: {type(exc).__name__}"
        )

    # The full-session relation is the final filesystem read.  Prefix-only
    # runner rehashes cannot authorize a session that grew after prospective
    # or floor accounting.
    final_floor_session_failures: dict[str, list[str]] = {}
    for assignment_id, receipt in sorted(surviving_floor_receipts.items()):
        session_id = receipt.get("native_session_id")
        session_row = (
            checkpoint_native_sessions.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        session_path = (
            checkpoint_native_paths.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        if not isinstance(session_row, dict) or session_path is None:
            final_floor_session_failures[assignment_id] = [
                "floor session seal missing at final crosscheck close"
            ]
            continue
        _floor_body, floor_close_issues = x_read_closed_native_session(
            session_path, session_row
        )
        if floor_close_issues:
            final_floor_session_failures[assignment_id] = sorted(
                set(floor_close_issues)
            )

    final_prospective_session_failures: dict[str, list[str]] = {}
    for receipt in independent_receipts:
        assignment_id = str(receipt.get("assignment_id"))
        proof = receipt.get("native_session_proof")
        session_id = proof.get("session_id") if isinstance(proof, dict) else None
        session_row = (
            checkpoint_native_sessions.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        session_path = (
            checkpoint_native_paths.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        if not isinstance(session_row, dict) or session_path is None:
            final_prospective_session_failures[assignment_id] = [
                "prospective session seal missing at final crosscheck close"
            ]
            continue
        _prospective_body, prospective_close_issues = x_read_closed_native_session(
            session_path, session_row
        )
        if prospective_close_issues:
            final_prospective_session_failures[assignment_id] = sorted(
                set(prospective_close_issues)
            )

    # A second executable descriptor seal follows the first session pass.  A
    # second full-session pass then becomes the final filesystem operation,
    # closing both sides of the otherwise non-atomic executable/session set.
    try:
        cross_end_bytes, cross_end_sha256, cross_end_signature = (
            x_descriptor_capture(HERE, cross_start_sha256)
        )
        if (
            cross_end_sha256 != cross_start_sha256
            or cross_end_bytes != cross_start_bytes
            or cross_end_signature != cross_start_signature
        ):
            final_transaction_errors.append(
                "crosscheck executable differs at its post-session end seal"
            )
    except Exception as exc:
        final_transaction_errors.append(
            f"crosscheck executable post-session end seal failed: {type(exc).__name__}"
        )

    for assignment_id, receipt in sorted(surviving_floor_receipts.items()):
        session_id = receipt.get("native_session_id")
        session_row = (
            checkpoint_native_sessions.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        session_path = (
            checkpoint_native_paths.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        if not isinstance(session_row, dict) or session_path is None:
            final_floor_session_failures.setdefault(
                assignment_id,
                ["floor session seal missing after executable end seal"],
            )
            continue
        _last_floor_body, last_floor_issues = x_read_closed_native_session(
            session_path, session_row
        )
        if last_floor_issues:
            final_floor_session_failures[assignment_id] = sorted(
                set(final_floor_session_failures.get(assignment_id, []))
                | set(last_floor_issues)
            )
    for receipt in independent_receipts:
        assignment_id = str(receipt.get("assignment_id"))
        proof = receipt.get("native_session_proof")
        session_id = proof.get("session_id") if isinstance(proof, dict) else None
        session_row = (
            checkpoint_native_sessions.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        session_path = (
            checkpoint_native_paths.get(session_id)
            if isinstance(session_id, str)
            else None
        )
        if not isinstance(session_row, dict) or session_path is None:
            final_prospective_session_failures.setdefault(
                assignment_id,
                ["prospective session seal missing after executable end seal"],
            )
            continue
        _last_prospective_body, last_prospective_issues = (
            x_read_closed_native_session(session_path, session_row)
        )
        if last_prospective_issues:
            final_prospective_session_failures[assignment_id] = sorted(
                set(final_prospective_session_failures.get(assignment_id, []))
                | set(last_prospective_issues)
            )

    if final_floor_session_failures or final_prospective_session_failures:
        errors.append(
            "one or more credited native sessions changed at final crosscheck close"
        )
        for assignment_id, reasons in final_floor_session_failures.items():
            v2_floor_invalidations[assignment_id] = reasons
        for receipt in independent_receipts:
            assignment_id = str(receipt.get("assignment_id"))
            reasons = final_prospective_session_failures.get(assignment_id)
            if reasons:
                label = str(receipt.get("manifest_receipt"))
                independent_candidate_issues[label] = sorted(
                    set(independent_candidate_issues.get(label, []) + reasons)
                )
                unresolved_positive_keys.add(f"manifest:{label}")
        (
            surviving_floor_receipts,
            independent_receipts,
            independent_ids,
            independently_preserved_floor_ids,
            independent_new_v3_ids,
            independent_credited_ids,
        ) = x_localized_session_credit_state(
            surviving_floor_receipts,
            independent_receipts,
            set(final_floor_session_failures),
            set(final_prospective_session_failures),
        )
        expected_credited_receipts = {
            assignment_id: receipt
            for assignment_id, receipt in expected_credited_receipts.items()
            if assignment_id in independent_credited_ids
        }
    if final_transaction_errors:
        errors.extend(final_transaction_errors)
        failure_state = x_global_transaction_failure_state(
            final_transaction_errors, completion_details
        )
        assert failure_state is not None
        (
            live_integrity_ok,
            floor_authority_integrity_ok,
            independently_preserved_floor_ids,
            independent_new_v3_ids,
            independent_credited_ids,
            completion_details,
            independent_valid_completes,
        ) = failure_state
        expected_credited_receipts = {}

    report = {
        "audit_id": AUDIT_ID,
        "crosscheck": "postrun_validator_v3_crosscheck.py",
        "crosscheck_version": "3.2.0",
        "observed_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "status": "pass" if not errors else "fail",
        "validator_sha256": validator_hash,
        "snapshot_sha256": snapshot_hash,
        "crosscheck_sha256": cross_start_sha256,
        "seal_checks": seal_checks,
        "independent_live_integrity_ok": live_integrity_ok,
        "independently_eligible_assignments": len(independent_ids),
        "independently_eligible_assignment_ids_sha256": x_digest(independent_ids),
        "independently_eligible_assignment_ids": sorted(independent_ids),
        "independently_eligible_result_receipts": sorted(
            independent_receipts, key=lambda item: str(item.get("assignment_id"))
        ),
        "independently_credited_assignments": len(independent_credited_ids),
        "independently_credited_assignment_ids_sha256": x_digest(independent_credited_ids),
        "independently_credited_assignment_ids": sorted(independent_credited_ids),
        "independently_credited_result_receipts": (
            sorted(expected_credited_receipts.values(), key=lambda item: str(item.get("assignment_id")))
            if live_integrity_ok
            else []
        ),
        "independent_v2_floor_discrepancies": v2_floor_invalidations,
        "credited_assignments_checked": len(credited_reported),
        "independently_valid_runner_complete_receipts": independent_valid_completes,
        "malformed_runner_receipts": malformed,
        "independently_superseded_v2_structural_rejections": independent_structural_supersessions,
        "independently_invalid_failure_receipts": failure_receipt_issues,
        "independent_unresolved_positive_keys": sorted(unresolved_positive_keys),
        "independent_candidate_issues": dict(sorted(independent_candidate_issues.items())),
        "known_revoked_attempts_absent": not bool(revoked_credited),
        "transaction_input_file_sha256": dict(sorted(transaction_input_hashes.items())),
        "independent_runner_input_file_sha256": dict(sorted(runner_input_hashes.items())),
        "final_runner_file_set_changes": final_set_changes,
        "final_read_input_changes": final_read_changes,
        "errors": sorted(set(errors)),
    }
    rendered = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if args.output:
        write_new_crosscheck_output(args.output, rendered)
    print(rendered, end="")
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(x_main())
