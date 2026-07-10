#!/usr/bin/env python3
"""Mechanical runner-02 dispatch, capture, and validation support.

This utility never performs substantive review. It reads assignment metadata,
immutable capsules, bounded source-excerpt bytes, and native subagent session
receipts; writes only inside runners/runner-02; and preserves final reviewer
output bytes exactly as emitted by the native collaboration agent.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import secrets
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
RUNNER_ID = "runner-02"
RUNNER_THREAD_ID = "019f49e2-0bbd-7a42-a792-97a0f348de81"
REQUIRED_MODEL = "gpt-5.6-sol"
REQUIRED_EFFORT = "ultra"
PROMPT_TEMPLATE_VERSION = "runner02-adversarial-v4-first-source-line-counts"
REPO = Path(__file__).resolve().parents[6]
AUDIT_ROOT = REPO / "Plans" / ".audits" / AUDIT_ID
RUNNER_DIR = AUDIT_ROOT / "runners" / RUNNER_ID
PACKET = AUDIT_ROOT / "assignments" / f"{RUNNER_ID}.jsonl"
REGISTRY = RUNNER_DIR / "fresh_agent_assignment_registry.jsonl"
RESULT_MANIFEST = RUNNER_DIR / "result_manifest.jsonl"
FAILED_MANIFEST = RUNNER_DIR / "failed_attempts.jsonl"
RAW_DIR = RUNNER_DIR / "raw_results"
VALIDATION_DIR = RUNNER_DIR / "validation"
ROLE_CARD = VALIDATION_DIR / "adversarial_role_card_v3.json"
DISPATCH_RECEIPTS_DIR = RUNNER_DIR / "dispatch_receipts"
ATTEMPT_RECEIPTS_DIR = RUNNER_DIR / "attempt_receipts"
CHECKPOINT = RUNNER_DIR / "CHECKPOINT.json"
SESSION_BASE = Path.home() / ".codex" / "sessions"


OUTPUT_SCHEMA_TEXT = (
    '{"assignment_id":string,"audit_id":string,"runner_id":"runner-02",'
    '"role":"adversarial_negative_space","window_id":string,"doc_id":string,'
    '"document_path":string,"core_range":[integer,integer],"source_sha256":string,'
    '"capsule_ref":string,"capsule_sha256":string,"capsule_bytes":integer,'
    '"source_excerpt_ref":string,"source_excerpt_sha256":string,'
    '"source_excerpt_bytes":integer,"model":"gpt-5.6-sol",'
    '"reasoning_effort":"ultra","observations":[{"observation_id":string,'
    '"statement":string,"evidence_ids":[string]}],"candidate_findings":'
    '[{"finding_id":string,"title":string,"severity":"blocker|high|medium|low",'
    '"negative_space_dimension":string,"claim":string,"why_it_matters":string,'
    '"evidence_ids":[string],"scope_confined":true}],"explicit_non_gaps":'
    '[{"non_gap_id":string,"statement":string,"evidence_ids":[string]}],'
    '"unknowns":[{"unknown_id":string,"statement":string,'
    '"reason_unresolved":string}],"exact_evidence_refs":'
    '[{"evidence_id":string,"document_path":string,"line_start":integer,'
    '"line_end":integer,"excerpt":string}],"scope_attestation":'
    '{"only_capsule_and_source_excerpt_read":true,"no_prior_audits":true,'
    '"no_other_results":true,"no_unrelated_windows":true,'
    '"no_external_research":true,"hashes_verified":true,"bytes_verified":true,'
    '"evidence_within_capsule":true,"no_writes":true},'
    '"terminal_after_result":true}'
)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_path(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def repo_path(ref: str) -> Path:
    path = (REPO / ref).resolve()
    audit_resolved = AUDIT_ROOT.resolve()
    if audit_resolved not in path.parents and path != audit_resolved:
        raise ValueError(f"reference escapes audit root: {ref}")
    return path


def atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    runner_resolved = RUNNER_DIR.resolve()
    resolved_parent = path.parent.resolve()
    if runner_resolved not in resolved_parent.parents and resolved_parent != runner_resolved:
        raise ValueError(f"write escapes runner namespace: {path}")
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_bytes(data)
    os.replace(tmp, path)


def write_json(path: Path, value: Any) -> None:
    atomic_write(path, (json.dumps(value, indent=2, sort_keys=True) + "\n").encode("utf-8"))


def immutable_write(path: Path, data: bytes) -> None:
    if path.exists():
        if path.read_bytes() != data:
            raise ValueError(f"immutable path already contains different bytes: {path}")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    runner_resolved = RUNNER_DIR.resolve()
    resolved_parent = path.parent.resolve()
    if runner_resolved not in resolved_parent.parents and resolved_parent != runner_resolved:
        raise ValueError(f"write escapes runner namespace: {path}")
    with path.open("xb") as handle:
        handle.write(data)


def write_json_immutable(path: Path, value: Any) -> None:
    immutable_write(path, (json.dumps(value, indent=2, sort_keys=True) + "\n").encode("utf-8"))


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        value = json.loads(line)
        if not isinstance(value, dict):
            raise ValueError(f"{path}:{line_no}: expected object")
        rows.append(value)
    return rows


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    data = "".join(json.dumps(row, sort_keys=True, separators=(",", ":")) + "\n" for row in rows)
    atomic_write(path, data.encode("utf-8"))


def append_jsonl_record(path: Path, record: dict[str, Any], key_fields: tuple[str, ...]) -> bool:
    rows = load_jsonl(path)
    matches = [
        row
        for row in rows
        if all(row.get(field) == record.get(field) for field in key_fields)
    ]
    if matches:
        if len(matches) != 1 or matches[0] != record:
            raise ValueError(
                f"immutable JSONL key conflict in {path}: "
                + ",".join(f"{field}={record.get(field)!r}" for field in key_fields)
            )
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    runner_resolved = RUNNER_DIR.resolve()
    resolved_parent = path.parent.resolve()
    if runner_resolved not in resolved_parent.parents and resolved_parent != runner_resolved:
        raise ValueError(f"append escapes runner namespace: {path}")
    encoded = (json.dumps(record, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")
    with path.open("ab") as handle:
        handle.write(encoded)
    return True


def packet_rows() -> list[dict[str, Any]]:
    rows = load_jsonl(PACKET)
    if len(rows) != 212:
        raise ValueError(f"runner packet count drift: {len(rows)}")
    return rows


def packet_row(assignment_id: str) -> dict[str, Any]:
    matches = [row for row in packet_rows() if row.get("assignment_id") == assignment_id]
    if len(matches) != 1:
        raise ValueError(f"assignment lookup count {len(matches)} for {assignment_id}")
    return matches[0]


def capsule_for(row: dict[str, Any]) -> dict[str, Any]:
    path = repo_path(row["capsule_ref"])
    data = path.read_bytes()
    if len(data) != row["capsule_bytes"]:
        raise ValueError("capsule byte mismatch")
    if sha256_bytes(data) != row["capsule_sha256"]:
        raise ValueError("capsule hash mismatch")
    capsule = json.loads(data)
    if capsule.get("assignment_id") != row["assignment_id"]:
        raise ValueError("capsule assignment mismatch")
    return capsule


def validate_source_package(row: dict[str, Any], capsule: dict[str, Any]) -> None:
    ref = row["source_excerpt_ref"]
    if capsule.get("source_excerpt_ref") != ref:
        raise ValueError("capsule source excerpt ref mismatch")
    path = repo_path(ref)
    data = path.read_bytes()
    if len(data) != row["source_excerpt_bytes"]:
        raise ValueError("source excerpt byte mismatch")
    if sha256_bytes(data) != row["source_excerpt_sha256"]:
        raise ValueError("source excerpt hash mismatch")
    if row["capsule_package_bytes"] != row["capsule_bytes"] + row["source_excerpt_bytes"]:
        raise ValueError("capsule package byte total mismatch")
    if row["capsule_package_bytes"] > 65536:
        raise ValueError("capsule package exceeds 64 KB")


def session_meta_from_file(path: Path) -> dict[str, Any] | None:
    try:
        with path.open("r", encoding="utf-8") as handle:
            for line in handle:
                item = json.loads(line)
                if item.get("type") == "session_meta":
                    payload = item.get("payload")
                    return payload if isinstance(payload, dict) else None
    except (OSError, json.JSONDecodeError):
        return None
    return None


def find_session(agent_path: str) -> Path:
    matches: list[Path] = []
    for path in SESSION_BASE.rglob("*.jsonl"):
        meta = session_meta_from_file(path)
        if meta and meta.get("agent_path") == agent_path:
            matches.append(path)
    if len(matches) != 1:
        raise ValueError(f"native session lookup count {len(matches)} for {agent_path}")
    return matches[0]


def parse_session(path: Path) -> dict[str, Any]:
    items: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_no, line in enumerate(handle, 1):
            try:
                item = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"session JSONL parse error at line {line_no}: {exc}") from exc
            if isinstance(item, dict):
                items.append(item)
    metas = [item["payload"] for item in items if item.get("type") == "session_meta"]
    contexts = [item["payload"] for item in items if item.get("type") == "turn_context"]
    if len(metas) != 1 or len(contexts) != 1:
        raise ValueError("session must have exactly one session_meta and one turn_context")
    final_positions: list[tuple[int, dict[str, Any]]] = []
    for index, item in enumerate(items):
        payload = item.get("payload", {})
        if (
            item.get("type") == "response_item"
            and payload.get("type") == "message"
            and payload.get("role") == "assistant"
            and payload.get("phase") == "final_answer"
        ):
            final_positions.append((index, item))
    result: dict[str, Any] = {
        "items": items,
        "meta": metas[0],
        "context": contexts[0],
        "final": None,
        "final_text": None,
        "output_after_terminal": False,
    }
    if not final_positions:
        return result
    if len(final_positions) != 1:
        raise ValueError("session has multiple final answers")
    final_index, final_item = final_positions[0]
    content = final_item.get("payload", {}).get("content")
    if not isinstance(content, list) or not content:
        raise ValueError("final answer has no content")
    if any(part.get("type") != "output_text" or not isinstance(part.get("text"), str) for part in content):
        raise ValueError("final answer content is not pure output_text")
    text = "".join(part["text"] for part in content)
    for item in items[final_index + 1 :]:
        payload = item.get("payload", {})
        if item.get("type") == "response_item" and payload.get("role") == "assistant":
            result["output_after_terminal"] = True
    result["final"] = final_item
    result["final_text"] = text
    return result


def session_identity(session: dict[str, Any], expected_agent_path: str) -> dict[str, Any]:
    meta = session["meta"]
    context = session["context"]
    source = meta.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    errors: list[str] = []
    if meta.get("thread_source") != "subagent":
        errors.append("thread_source_not_subagent")
    if meta.get("agent_path") != expected_agent_path or source.get("agent_path") != expected_agent_path:
        errors.append("agent_path_mismatch")
    if meta.get("parent_thread_id") != RUNNER_THREAD_ID or source.get("parent_thread_id") != RUNNER_THREAD_ID:
        errors.append("parent_thread_id_mismatch")
    if meta.get("session_id") != RUNNER_THREAD_ID:
        errors.append("runner_session_id_mismatch")
    if context.get("model") != REQUIRED_MODEL:
        errors.append("wrong_actual_model")
    if context.get("effort") != REQUIRED_EFFORT:
        errors.append("wrong_actual_reasoning_effort")
    if errors:
        raise ValueError(";".join(errors))
    return {
        "agent_thread_id": meta["id"],
        "agent_path": expected_agent_path,
        "agent_instance_id": expected_agent_path.rsplit("/", 1)[-1],
        "agent_nickname": meta.get("agent_nickname"),
        "created_at": meta["timestamp"],
        "model": context["model"],
        "reasoning_effort": context["effort"],
    }


def dispatch_record(row: dict[str, Any], capsule: dict[str, Any], identity: dict[str, Any], attempt_number: int) -> dict[str, Any]:
    role_card_bytes = ROLE_CARD.read_bytes()
    return {
        "record_type": "dispatch",
        "attempt_id": f"{row['assignment_id']}__attempt-{attempt_number:03d}",
        "assignment_id": row["assignment_id"],
        "assignment_seq": row["assignment_seq"],
        "runner_id": RUNNER_ID,
        "runner_thread_id": RUNNER_THREAD_ID,
        **identity,
        "role": row["role"],
        "window_id": row["window_id"],
        "doc_id": row["doc_id"],
        "document_path": row["document_path"],
        "core_range": row["core_range"],
        "overlap_ranges": capsule.get("context_ranges", []),
        "core_sha256": row["core_sha256"],
        "source_sha256": row["source_sha256"],
        "role_card_ref": str(ROLE_CARD.relative_to(REPO)),
        "role_card_sha256": sha256_bytes(role_card_bytes),
        "role_card_bytes": len(role_card_bytes),
        "capsule_ref": row["capsule_ref"],
        "capsule_sha256": row["capsule_sha256"],
        "capsule_bytes": row["capsule_bytes"],
        "capsule_package_bytes": row["capsule_package_bytes"],
        "source_excerpt_ref": row["source_excerpt_ref"],
        "source_excerpt_sha256": row["source_excerpt_sha256"],
        "source_excerpt_bytes": row["source_excerpt_bytes"],
        "token_estimate": row["token_estimate"],
        "completed_at": None,
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
        "no_followup_reuse": True,
        "fork_turns": "none",
        "prompt_template_version": PROMPT_TEMPLATE_VERSION,
        "result_ref": None,
        "result_sha256": None,
        "coverage_credit": 0,
        "state": "running",
    }


def register_agent(assignment_id: str, agent_path: str, attempt_number: int) -> dict[str, Any]:
    row = packet_row(assignment_id)
    capsule = capsule_for(row)
    validate_source_package(row, capsule)
    session_path = find_session(agent_path)
    session = parse_session(session_path)
    identity = session_identity(session, agent_path)
    record = dispatch_record(row, capsule, identity, attempt_number)
    rows = load_jsonl(REGISTRY)
    attempt_id = record["attempt_id"]
    matches = [
        item
        for item in rows
        if item.get("record_type") == "dispatch" and item.get("attempt_id") == attempt_id
    ]
    if len(matches) > 1:
        raise ValueError(f"duplicate registry attempt {attempt_id}")
    if matches:
        existing = matches[0]
        if any(
            existing.get(field) != record.get(field)
            for field in ("assignment_id", "agent_instance_id", "agent_path", "agent_thread_id")
        ):
            raise ValueError("attempt already bound to another native identity")
        return existing
    else:
        append_jsonl_record(REGISTRY, record, ("record_type", "attempt_id"))
        rows.append(record)
    dispatches = [item for item in rows if item.get("record_type") == "dispatch"]
    for field in ("agent_instance_id", "agent_path", "agent_thread_id"):
        values = [item.get(field) for item in dispatches]
        if len(values) != len(set(values)):
            raise ValueError(f"duplicate {field}")
    return record


TOP_LEVEL_KEYS = {
    "assignment_id",
    "audit_id",
    "runner_id",
    "role",
    "window_id",
    "doc_id",
    "document_path",
    "core_range",
    "source_sha256",
    "capsule_ref",
    "capsule_sha256",
    "capsule_bytes",
    "source_excerpt_ref",
    "source_excerpt_sha256",
    "source_excerpt_bytes",
    "model",
    "reasoning_effort",
    "observations",
    "candidate_findings",
    "explicit_non_gaps",
    "unknowns",
    "exact_evidence_refs",
    "scope_attestation",
    "terminal_after_result",
}


def nonempty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def normalized_text(value: str) -> str:
    return " ".join(value.split())


def validate_result(result: Any, row: dict[str, Any], capsule: dict[str, Any], session: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if not isinstance(result, dict):
        return ["result_not_object"]
    if set(result) != TOP_LEVEL_KEYS:
        errors.append(f"top_level_schema_keys_mismatch:{sorted(set(result) ^ TOP_LEVEL_KEYS)}")
    expected = {
        "assignment_id": row["assignment_id"],
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "role": row["role"],
        "window_id": row["window_id"],
        "doc_id": row["doc_id"],
        "document_path": row["document_path"],
        "core_range": row["core_range"],
        "source_sha256": row["source_sha256"],
        "capsule_ref": row["capsule_ref"],
        "capsule_sha256": row["capsule_sha256"],
        "capsule_bytes": row["capsule_bytes"],
        "source_excerpt_ref": row["source_excerpt_ref"],
        "source_excerpt_sha256": row["source_excerpt_sha256"],
        "source_excerpt_bytes": row["source_excerpt_bytes"],
        "model": REQUIRED_MODEL,
        "reasoning_effort": REQUIRED_EFFORT,
        "terminal_after_result": True,
    }
    for key, value in expected.items():
        if result.get(key) != value:
            errors.append(f"metadata_mismatch:{key}")
    if session.get("output_after_terminal"):
        errors.append("output_after_terminal")
    attestation = result.get("scope_attestation")
    required_attestation = {
        "only_capsule_and_source_excerpt_read",
        "no_prior_audits",
        "no_other_results",
        "no_unrelated_windows",
        "no_external_research",
        "hashes_verified",
        "bytes_verified",
        "evidence_within_capsule",
        "no_writes",
    }
    if not isinstance(attestation, dict) or set(attestation) != required_attestation or any(attestation.get(key) is not True for key in required_attestation):
        errors.append("scope_attestation_invalid")
    arrays = ("observations", "candidate_findings", "explicit_non_gaps", "unknowns", "exact_evidence_refs")
    for key in arrays:
        if not isinstance(result.get(key), list):
            errors.append(f"not_array:{key}")
    if any(not isinstance(result.get(key), list) for key in arrays):
        return errors
    allowed_ranges = [row["core_range"], *capsule.get("context_ranges", [])]
    canonical_path = (REPO / row["document_path"]).resolve()
    if not canonical_path.exists():
        errors.append("canonical_source_missing")
        source_lines: list[str] = []
    else:
        if sha256_path(canonical_path) != row["source_sha256"]:
            errors.append("canonical_source_hash_mismatch")
        source_lines = canonical_path.read_text(encoding="utf-8").splitlines()
    evidence_ids: list[str] = []
    for index, evidence in enumerate(result["exact_evidence_refs"]):
        if not isinstance(evidence, dict) or set(evidence) != {"evidence_id", "document_path", "line_start", "line_end", "excerpt"}:
            errors.append(f"evidence_schema:{index}")
            continue
        evidence_id = evidence.get("evidence_id")
        if not nonempty_string(evidence_id):
            errors.append(f"evidence_id_invalid:{index}")
        else:
            evidence_ids.append(evidence_id)
        start, end = evidence.get("line_start"), evidence.get("line_end")
        if evidence.get("document_path") != row["document_path"]:
            errors.append(f"evidence_path_spill:{index}")
        if not isinstance(start, int) or isinstance(start, bool) or not isinstance(end, int) or isinstance(end, bool) or start > end:
            errors.append(f"evidence_range_invalid:{index}")
        elif not any(start >= low and end <= high for low, high in allowed_ranges):
            errors.append(f"evidence_range_spill:{index}")
        excerpt = evidence.get("excerpt")
        if not nonempty_string(excerpt):
            errors.append(f"evidence_excerpt_missing:{index}")
        elif isinstance(start, int) and isinstance(end, int) and start >= 1 and end <= len(source_lines):
            canonical_text = normalized_text("\n".join(source_lines[start - 1 : end]))
            if normalized_text(excerpt) not in canonical_text:
                errors.append(f"exact_evidence_quote_mismatch:{index}")
        elif source_lines:
            errors.append(f"evidence_range_outside_canonical_source:{index}")
    if len(evidence_ids) != len(set(evidence_ids)):
        errors.append("duplicate_evidence_ids")
    evidence_set = set(evidence_ids)

    def validate_evidence_consumers(key: str, id_key: str, required_fields: set[str]) -> None:
        identifiers: list[str] = []
        for index, item in enumerate(result[key]):
            if not isinstance(item, dict) or set(item) != required_fields:
                errors.append(f"{key}_schema:{index}")
                continue
            identifier = item.get(id_key)
            if not nonempty_string(identifier):
                errors.append(f"{key}_id_invalid:{index}")
            else:
                identifiers.append(identifier)
            refs = item.get("evidence_ids")
            if not isinstance(refs, list) or not refs or any(not nonempty_string(ref) for ref in refs):
                errors.append(f"{key}_evidence_missing:{index}")
            elif any(ref not in evidence_set for ref in refs):
                errors.append(f"{key}_evidence_unknown:{index}")
        if len(identifiers) != len(set(identifiers)):
            errors.append(f"{key}_duplicate_ids")

    validate_evidence_consumers("observations", "observation_id", {"observation_id", "statement", "evidence_ids"})
    validate_evidence_consumers("explicit_non_gaps", "non_gap_id", {"non_gap_id", "statement", "evidence_ids"})
    validate_evidence_consumers(
        "candidate_findings",
        "finding_id",
        {"finding_id", "title", "severity", "negative_space_dimension", "claim", "why_it_matters", "evidence_ids", "scope_confined"},
    )
    for index, finding in enumerate(result["candidate_findings"]):
        if isinstance(finding, dict):
            if finding.get("severity") not in {"blocker", "high", "medium", "low"}:
                errors.append(f"finding_severity_invalid:{index}")
            if finding.get("scope_confined") is not True:
                errors.append(f"finding_scope_not_confined:{index}")
    unknown_ids: list[str] = []
    for index, unknown in enumerate(result["unknowns"]):
        if not isinstance(unknown, dict) or set(unknown) != {"unknown_id", "statement", "reason_unresolved"}:
            errors.append(f"unknown_schema:{index}")
            continue
        if not all(nonempty_string(unknown.get(key)) for key in ("unknown_id", "statement", "reason_unresolved")):
            errors.append(f"unknown_value_invalid:{index}")
        else:
            unknown_ids.append(unknown["unknown_id"])
    if len(unknown_ids) != len(set(unknown_ids)):
        errors.append("duplicate_unknown_ids")
    return errors


def update_registry_completion(attempt_id: str, completed_at: str, result_ref: str, result_sha256: str, state: str, coverage: int) -> dict[str, Any]:
    rows = load_jsonl(REGISTRY)
    matches = [
        row
        for row in rows
        if row.get("record_type") == "dispatch" and row.get("attempt_id") == attempt_id
    ]
    if len(matches) != 1:
        raise ValueError(f"registry completion lookup count {len(matches)} for {attempt_id}")
    completion = dict(matches[0])
    completion.update(
        {
            "record_type": "completion",
            "completed_at": completed_at,
            "result_ref": result_ref,
            "result_sha256": result_sha256,
            "coverage_credit": coverage,
            "validation_passed": coverage == 1,
            "exact_evidence_validation_passed": coverage == 1,
            "state": state,
        }
    )
    append_jsonl_record(REGISTRY, completion, ("record_type", "attempt_id"))
    return completion


def capture_result(assignment_id: str, agent_path: str, attempt_number: int) -> dict[str, Any]:
    row = packet_row(assignment_id)
    capsule = capsule_for(row)
    validate_source_package(row, capsule)
    session_path = find_session(agent_path)
    session = parse_session(session_path)
    identity = session_identity(session, agent_path)
    if session["final"] is None:
        return {"status": "running", "assignment_id": assignment_id, "agent_path": agent_path, **identity}
    final_text = session["final_text"]
    assert isinstance(final_text, str)
    final_bytes = final_text.encode("utf-8")
    try:
        result = json.loads(final_text)
        parse_error = None
    except json.JSONDecodeError as exc:
        result = None
        parse_error = f"json_parse_error:{exc}"
    errors = [parse_error] if parse_error else validate_result(result, row, capsule, session)
    errors = [error for error in errors if error]
    attempt_id = f"{assignment_id}__attempt-{attempt_number:03d}"
    completed_at = session["final"].get("timestamp")
    if not isinstance(completed_at, str):
        raise ValueError("final response timestamp missing")
    raw_sha = sha256_bytes(final_bytes)
    if errors:
        raw_path = RAW_DIR / f"{attempt_id}.failed.json"
        immutable_write(raw_path, final_bytes)
        raw_ref = str(raw_path.relative_to(REPO))
        validation = {
            "assignment_id": assignment_id,
            "attempt_id": attempt_id,
            "runner_id": RUNNER_ID,
            "agent_instance_id": identity["agent_instance_id"],
            "agent_path": agent_path,
            "agent_thread_id": identity["agent_thread_id"],
            "model": identity["model"],
            "reasoning_effort": identity["reasoning_effort"],
            "completed_at": completed_at,
            "result_ref": raw_ref,
            "result_sha256": raw_sha,
            "errors": errors,
            "coverage_credit": 0,
            "validation_passed": False,
            "exact_evidence_validation_passed": False,
            "status": "quarantined",
        }
        validation_path = VALIDATION_DIR / f"{attempt_id}.json"
        write_json_immutable(validation_path, validation)
        validation_ref = str(validation_path.relative_to(REPO))
        validation_sha = sha256_path(validation_path)
        completion = update_registry_completion(
            attempt_id, completed_at, raw_ref, raw_sha, "quarantined", 0
        )
        failure_record = {
            **completion,
            "record_type": "failed_attempt",
            "validation_ref": validation_ref,
            "validation_sha256": validation_sha,
            "validation_errors": errors,
            "errors": errors,
            "coverage_credit": 0,
            "validation_passed": False,
            "exact_evidence_validation_passed": False,
            "status": "quarantined",
            "state": "quarantined",
            "retry_required": True,
        }
        append_jsonl_record(FAILED_MANIFEST, failure_record, ("attempt_id",))
        attempt_receipt = {
            **completion,
            "validation_ref": validation_ref,
            "validation_sha256": validation_sha,
            "validation_errors": errors,
            "validation_passed": False,
            "exact_evidence_validation_passed": False,
            "status": "quarantined",
        }
        write_json_immutable(ATTEMPT_RECEIPTS_DIR / f"{attempt_id}.json", attempt_receipt)
        return {"status": "fail", "assignment_id": assignment_id, "attempt_id": attempt_id, "errors": errors}
    raw_path = RAW_DIR / f"{attempt_id}.json"
    immutable_write(raw_path, final_bytes)
    raw_ref = str(raw_path.relative_to(REPO))
    validation = {
        "assignment_id": assignment_id,
        "attempt_id": attempt_id,
        "runner_id": RUNNER_ID,
        "agent_instance_id": identity["agent_instance_id"],
        "agent_path": agent_path,
        "agent_thread_id": identity["agent_thread_id"],
        "model": identity["model"],
        "reasoning_effort": identity["reasoning_effort"],
        "capsule_hash_and_size": "pass",
        "source_excerpt_hash_and_size": "pass",
        "metadata_match": "pass",
        "output_schema": "pass",
        "exact_evidence_structure": "pass",
        "scope_bounds": "pass",
        "terminal_state": "pass",
        "identity_isolation": "pass",
        "completed_at": completed_at,
        "result_ref": raw_ref,
        "result_sha256": raw_sha,
        "errors": [],
        "coverage_credit": 1,
        "validation_passed": True,
        "schema_validation_passed": True,
        "exact_evidence_validation_passed": True,
        "scope_validation_passed": True,
        "status": "pass",
    }
    validation_path = VALIDATION_DIR / f"{attempt_id}.json"
    write_json_immutable(validation_path, validation)
    validation_ref = str(validation_path.relative_to(REPO))
    validation_sha = sha256_path(validation_path)
    dispatch = update_registry_completion(attempt_id, completed_at, raw_ref, raw_sha, "valid_terminal", 1)
    manifest_rows = load_jsonl(RESULT_MANIFEST)
    existing = [item for item in manifest_rows if item.get("assignment_id") == assignment_id]
    result_record = {
        "record_type": "valid_result",
        "attempt_id": attempt_id,
        "assignment_id": assignment_id,
        "assignment_seq": row["assignment_seq"],
        "runner_id": RUNNER_ID,
        "runner_thread_id": RUNNER_THREAD_ID,
        "agent_instance_id": identity["agent_instance_id"],
        "agent_path": agent_path,
        "agent_thread_id": identity["agent_thread_id"],
        "agent_nickname": identity["agent_nickname"],
        "model": identity["model"],
        "reasoning_effort": identity["reasoning_effort"],
        "role": row["role"],
        "window_id": row["window_id"],
        "doc_id": row["doc_id"],
        "document_path": row["document_path"],
        "core_range": row["core_range"],
        "overlap_ranges": capsule.get("context_ranges", []),
        "core_sha256": row["core_sha256"],
        "source_sha256": row["source_sha256"],
        "role_card_ref": dispatch.get("role_card_ref"),
        "role_card_sha256": dispatch.get("role_card_sha256"),
        "role_card_bytes": dispatch.get("role_card_bytes"),
        "capsule_ref": row["capsule_ref"],
        "capsule_sha256": row["capsule_sha256"],
        "capsule_bytes": row["capsule_bytes"],
        "capsule_package_bytes": row["capsule_package_bytes"],
        "source_excerpt_ref": row["source_excerpt_ref"],
        "source_excerpt_sha256": row["source_excerpt_sha256"],
        "source_excerpt_bytes": row["source_excerpt_bytes"],
        "token_estimate": row["token_estimate"],
        "created_at": identity["created_at"],
        "completed_at": completed_at,
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
        "no_followup_reuse": True,
        "result_ref": raw_ref,
        "result_sha256": raw_sha,
        "result_bytes": len(final_bytes),
        "validation_ref": validation_ref,
        "validation_sha256": validation_sha,
        "coverage_credit": 1,
        "validation_passed": True,
        "schema_validation_passed": True,
        "exact_evidence_validation_passed": True,
        "scope_validation_passed": True,
        "status": "valid",
    }
    append_jsonl_record(RESULT_MANIFEST, result_record, ("attempt_id",))
    attempt_receipt = {
        **dispatch,
        "validation_ref": validation_ref,
        "validation_sha256": validation_sha,
        "validation_passed": True,
        "schema_validation_passed": True,
        "exact_evidence_validation_passed": True,
        "scope_validation_passed": True,
        "status": "valid",
    }
    write_json_immutable(ATTEMPT_RECEIPTS_DIR / f"{attempt_id}.json", attempt_receipt)
    return {"status": "pass", "result": result_record, "dispatch": dispatch}


def make_prompt(row: dict[str, Any]) -> str:
    role_card_bytes = ROLE_CARD.read_bytes()
    if len(role_card_bytes) + row["capsule_package_bytes"] > 65536:
        raise ValueError("role-card plus capsule package exceeds 64 KB")
    role_card_ref = str(ROLE_CARD.relative_to(REPO))
    role_card_sha256 = sha256_bytes(role_card_bytes)
    return f"""Fresh isolated single-assignment reviewer for audit-20260709-004. Native runtime configuration is inherited as {REQUIRED_MODEL} with reasoning_effort {REQUIRED_EFFORT}. Perform exactly one substantive assignment and then terminate.

Assignment: {row['assignment_id']}; {RUNNER_ID}; role {row['role']}; window {row['window_id']}; doc {row['doc_id']} / {row['document_path']}; core lines {row['core_range'][0]}-{row['core_range'][1]}; source_sha256 {row['source_sha256']}.

Read only these three immutable inputs and nothing else:
1. Fixed universal lens/output card: {role_card_ref} (sha256 {role_card_sha256}; {len(role_card_bytes)} bytes).
2. Assignment metadata capsule: {row['capsule_ref']} (sha256 {row['capsule_sha256']}; {row['capsule_bytes']} bytes).
3. Source excerpt named inside that capsule: {row['source_excerpt_ref']} (sha256 {row['source_excerpt_sha256']}; {row['source_excerpt_bytes']} bytes).

Verify all three hashes and byte counts, then follow the fixed card and assignment capsule exactly. The bounded excerpt is the only substantive evidence universe. Critical canonical-line rule: the first line immediately after every range marker counts as the range's first source line even when that line is empty; never discard it as marker formatting. Return exactly the one JSON object required by the card, once, then remain terminal."""


def prepare_selected_rows(
    selected_rows: list[dict[str, Any]],
    wave_number: int,
    *,
    selection_kind: str,
    start_packet_index: int | None,
) -> dict[str, Any]:
    rows = packet_rows()
    dispatches = load_jsonl(REGISTRY)
    used_names = {item.get("agent_instance_id") for item in dispatches}
    plan_entries: list[dict[str, Any]] = []
    prepared_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    for row in selected_rows:
        attempts = [
            item
            for item in dispatches
            if item.get("record_type") == "dispatch"
            and item.get("assignment_id") == row["assignment_id"]
        ]
        attempt_number = len(attempts) + 1
        while True:
            suffix = secrets.token_hex(3)
            task_name = f"a004_r02_adv_{row['assignment_seq']:06d}_{suffix}"
            if task_name not in used_names:
                used_names.add(task_name)
                break
        prompt = make_prompt(row)
        prompt_sha = sha256_bytes(prompt.encode("utf-8"))
        capsule = capsule_for(row)
        validate_source_package(row, capsule)
        attempt_id = f"{row['assignment_id']}__attempt-{attempt_number:03d}"
        role_card_bytes = ROLE_CARD.read_bytes()
        prelaunch_receipt = {
            "record_type": "prelaunch_dispatch",
            "attempt_id": attempt_id,
            "assignment_id": row["assignment_id"],
            "assignment_seq": row["assignment_seq"],
            "runner_id": RUNNER_ID,
            "runner_thread_id": RUNNER_THREAD_ID,
            "agent_instance_id": task_name,
            "agent_path": f"/root/{task_name}",
            "agent_thread_id": None,
            "identity_state": "pending_native_spawn",
            "model": REQUIRED_MODEL,
            "reasoning_effort": REQUIRED_EFFORT,
            "role": row["role"],
            "window_id": row["window_id"],
            "doc_id": row["doc_id"],
            "document_path": row["document_path"],
            "core_range": row["core_range"],
            "overlap_ranges": capsule.get("context_ranges", []),
            "core_sha256": row["core_sha256"],
            "source_sha256": row["source_sha256"],
            "role_card_ref": str(ROLE_CARD.relative_to(REPO)),
            "role_card_sha256": sha256_bytes(role_card_bytes),
            "role_card_bytes": len(role_card_bytes),
            "capsule_ref": row["capsule_ref"],
            "capsule_sha256": row["capsule_sha256"],
            "capsule_bytes": row["capsule_bytes"],
            "capsule_package_bytes": row["capsule_package_bytes"],
            "source_excerpt_ref": row["source_excerpt_ref"],
            "source_excerpt_sha256": row["source_excerpt_sha256"],
            "source_excerpt_bytes": row["source_excerpt_bytes"],
            "token_estimate": row["token_estimate"],
            "created_at": prepared_at,
            "completed_at": None,
            "prior_substantive_assignment_count": 0,
            "terminal_after_result": True,
            "no_followup_reuse": True,
            "fork_turns": "none",
            "prompt_template_version": PROMPT_TEMPLATE_VERSION,
            "prompt_sha256": prompt_sha,
            "result_ref": None,
            "result_sha256": None,
            "coverage_credit": 0,
            "state": "authorized_prelaunch",
        }
        dispatch_receipt_path = DISPATCH_RECEIPTS_DIR / f"{attempt_id}.json"
        write_json_immutable(dispatch_receipt_path, prelaunch_receipt)
        entry = {
            "assignment_id": row["assignment_id"],
            "assignment_seq": row["assignment_seq"],
            "packet_index": rows.index(row),
            "attempt_number": attempt_number,
            "attempt_id": attempt_id,
            "task_name": task_name,
            "agent_path": f"/root/{task_name}",
            "fork_turns": "none",
            "required_model": REQUIRED_MODEL,
            "required_reasoning_effort": REQUIRED_EFFORT,
            "prompt_template_version": PROMPT_TEMPLATE_VERSION,
            "prompt_sha256": prompt_sha,
            "dispatch_receipt_ref": str(dispatch_receipt_path.relative_to(REPO)),
            "dispatch_receipt_sha256": sha256_path(dispatch_receipt_path),
            "prompt": prompt,
        }
        plan_entries.append(entry)
    plan = {
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "wave_number": wave_number,
        "selection_kind": selection_kind,
        "start_packet_index": start_packet_index,
        "count": len(selected_rows),
        "entries": plan_entries,
    }
    path = VALIDATION_DIR / f"wave-{wave_number:04d}-dispatch-plan.json"
    if path.exists():
        raise ValueError(f"wave plan already exists: {path}")
    write_json_immutable(path, plan)
    plan["plan_ref"] = str(path.relative_to(REPO))
    plan["plan_sha256"] = sha256_path(path)
    return plan


def prepare_wave(start_index: int, count: int, wave_number: int) -> dict[str, Any]:
    rows = packet_rows()
    if start_index < 0 or start_index + count > len(rows):
        raise ValueError("wave index range outside packet")
    return prepare_selected_rows(
        rows[start_index : start_index + count],
        wave_number,
        selection_kind="packet_order",
        start_packet_index=start_index,
    )


def prepare_assignment_wave(assignment_ids: list[str], wave_number: int) -> dict[str, Any]:
    if not assignment_ids or len(assignment_ids) > 3 or len(assignment_ids) != len(set(assignment_ids)):
        raise ValueError("prepare-assignments requires one to three unique assignment ids")
    selected = [packet_row(assignment_id) for assignment_id in assignment_ids]
    return prepare_selected_rows(
        selected,
        wave_number,
        selection_kind="explicit_retry_or_priority",
        start_packet_index=None,
    )


def load_wave_plan(ref: str) -> dict[str, Any]:
    path = repo_path(ref)
    if RUNNER_DIR.resolve() not in path.parents:
        raise ValueError("wave plan is outside runner namespace")
    return json.loads(path.read_bytes())


def register_wave(ref: str) -> dict[str, Any]:
    plan = load_wave_plan(ref)
    results = []
    for entry in plan["entries"]:
        results.append(register_agent(entry["assignment_id"], entry["agent_path"], entry["attempt_number"]))
    return {"status": "pass", "registered": results}


def capture_wave(ref: str) -> dict[str, Any]:
    plan = load_wave_plan(ref)
    results = []
    for entry in plan["entries"]:
        results.append(capture_result(entry["assignment_id"], entry["agent_path"], entry["attempt_number"]))
    statuses = [item["status"] for item in results]
    status = "pass" if all(value == "pass" for value in statuses) else "running" if any(value == "running" for value in statuses) else "fail"
    return {"status": status, "results": results}


def record_initial_v2_quarantines(snapshot_ref: str) -> dict[str, Any]:
    snapshot_path = repo_path(snapshot_ref)
    if snapshot_path is None or not snapshot_path.exists():
        raise ValueError("V2 evidence snapshot missing")
    snapshot = json.loads(snapshot_path.read_bytes())
    packet_ids = {row["assignment_id"] for row in packet_rows()}
    credited = [
        assignment_id
        for assignment_id in snapshot.get("credited_assignment_ids", [])
        if assignment_id in packet_ids
    ]
    candidates = [
        item
        for item in snapshot.get("quarantine_candidates", [])
        if item.get("runner_id") == RUNNER_ID
    ]
    manifests = load_jsonl(RESULT_MANIFEST)
    registry = load_jsonl(REGISTRY)
    existing_failures = load_jsonl(FAILED_MANIFEST)
    recorded: list[str] = []
    skipped: list[str] = []
    snapshot_sha = sha256_path(snapshot_path)
    snapshot_repo_ref = str(snapshot_path.relative_to(REPO))
    for candidate in candidates:
        assignment_id = candidate.get("assignment_id")
        attempt_id = candidate.get("attempt_id")
        if not assignment_id or not attempt_id:
            raise ValueError("localized quarantine candidate lacks assignment or attempt id")
        if assignment_id in credited:
            raise ValueError(f"credited assignment unexpectedly quarantined: {assignment_id}")
        if any(row.get("attempt_id") == attempt_id for row in existing_failures):
            skipped.append(attempt_id)
            continue
        result_matches = [
            row
            for row in manifests
            if row.get("assignment_id") == assignment_id
            and row.get("attempt_id") == attempt_id
        ]
        dispatch_matches = [
            row
            for row in registry
            if row.get("record_type") == "dispatch"
            and row.get("assignment_id") == assignment_id
            and row.get("attempt_id") == attempt_id
        ]
        if len(result_matches) != 1 or len(dispatch_matches) != 1:
            raise ValueError(
                f"quarantine join failed for {attempt_id}: "
                f"results={len(result_matches)} dispatches={len(dispatch_matches)}"
            )
        result_row = result_matches[0]
        dispatch = dispatch_matches[0]
        reasons = sorted(set(candidate.get("reasons", [])))
        recorded_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        quarantine_validation = {
            "assignment_id": assignment_id,
            "attempt_id": attempt_id,
            "runner_id": RUNNER_ID,
            "agent_instance_id": result_row.get("agent_instance_id"),
            "agent_path": result_row.get("agent_path"),
            "agent_thread_id": result_row.get("agent_thread_id"),
            "result_ref": result_row.get("result_ref"),
            "result_sha256": result_row.get("result_sha256"),
            "source_snapshot_ref": snapshot_repo_ref,
            "source_snapshot_sha256": snapshot_sha,
            "source_receipt": candidate.get("receipt"),
            "errors": reasons,
            "coverage_credit": 0,
            "validation_passed": False,
            "exact_evidence_validation_passed": False,
            "retry_required": True,
            "recorded_at": recorded_at,
            "status": "quarantined",
        }
        quarantine_path = VALIDATION_DIR / "quarantines" / f"{attempt_id}.json"
        write_json_immutable(quarantine_path, quarantine_validation)
        quarantine_ref = str(quarantine_path.relative_to(REPO))
        quarantine_sha = sha256_path(quarantine_path)
        failure_record = {
            **dispatch,
            "record_type": "failed_attempt",
            "completed_at": result_row.get("completed_at") or dispatch.get("completed_at"),
            "result_ref": result_row.get("result_ref"),
            "result_sha256": result_row.get("result_sha256"),
            "validation_ref": quarantine_ref,
            "validation_sha256": quarantine_sha,
            "validation_errors": reasons,
            "errors": reasons,
            "coverage_credit": 0,
            "validation_passed": False,
            "exact_evidence_validation_passed": False,
            "status": "quarantined",
            "state": "quarantined",
            "retry_required": True,
            "quarantine_source_ref": snapshot_repo_ref,
            "quarantine_source_sha256": snapshot_sha,
            "quarantine_source_receipt": candidate.get("receipt"),
            "failure_recorded_at": recorded_at,
        }
        append_jsonl_record(FAILED_MANIFEST, failure_record, ("attempt_id",))
        recorded.append(attempt_id)
    return {
        "status": "pass",
        "runner_id": RUNNER_ID,
        "preserved_credited_assignments": credited,
        "recorded_zero_credit_attempts": recorded,
        "already_recorded_zero_credit_attempts": skipped,
    }


def checkpoint(last_completed_wave: int, next_packet_index: int, status: str) -> dict[str, Any]:
    current = json.loads(CHECKPOINT.read_bytes()) if CHECKPOINT.exists() else {}
    dispatches = [item for item in load_jsonl(REGISTRY) if item.get("record_type") == "dispatch"]
    results = [item for item in load_jsonl(RESULT_MANIFEST) if item.get("record_type") == "valid_result"]
    failures = [item for item in load_jsonl(FAILED_MANIFEST) if item.get("record_type") == "failed_attempt"]
    failed_attempt_ids = {item.get("attempt_id") for item in failures}
    positive_statuses = {"pass", "passed", "valid", "validated", "valid_result", "valid_terminal", "complete", "completed"}
    eligible_results = [
        item
        for item in results
        if item.get("attempt_id") not in failed_attempt_ids
        and (
            item.get("validation_passed") is True
            or str(item.get("status", "")).lower() in positive_statuses
        )
    ]
    duplicate_counts: dict[str, int] = {}
    for field in ("agent_instance_id", "agent_path", "agent_thread_id"):
        values = [item.get(field) for item in dispatches]
        duplicate_counts[field] = len(values) - len(set(values))
    current.update(
        {
            "status": status,
            "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "assignment_count": len(packet_rows()),
            "valid_assignments": len({item["assignment_id"] for item in eligible_results}),
            "result_manifest_records": len(results),
            "failed_attempts": len(failures),
            "unique_agents_spawned": len(dispatches),
            "last_completed_wave": last_completed_wave,
            "next_packet_index": next_packet_index,
            "duplicate_agent_instance_count": duplicate_counts["agent_instance_id"],
            "duplicate_agent_path_count": duplicate_counts["agent_path"],
            "duplicate_agent_thread_count": duplicate_counts["agent_thread_id"],
            "recycled_agent_count": 0,
            "multi_scope_agent_count": 0,
            "scope_spill_count": len([item for item in failures if any("spill" in error for error in item.get("errors", []))]),
            "wrong_model_or_effort_count": len([item for item in failures if any("model" in error or "effort" in error for error in item.get("errors", []))]),
        }
    )
    write_json(CHECKPOINT, current)
    return current


def validate_runner(require_complete: bool) -> dict[str, Any]:
    packet = packet_rows()
    dispatches = [item for item in load_jsonl(REGISTRY) if item.get("record_type") == "dispatch"]
    results = [item for item in load_jsonl(RESULT_MANIFEST) if item.get("record_type") == "valid_result"]
    failures = [item for item in load_jsonl(FAILED_MANIFEST) if item.get("record_type") == "failed_attempt"]
    errors: list[str] = []
    packet_ids = {row["assignment_id"] for row in packet}
    result_ids = [row.get("assignment_id") for row in results]
    if len(result_ids) != len(set(result_ids)):
        errors.append("duplicate_valid_assignment_results")
    if any(assignment_id not in packet_ids for assignment_id in result_ids):
        errors.append("result_outside_runner_packet")
    for field in ("agent_instance_id", "agent_path", "agent_thread_id"):
        values = [row.get(field) for row in dispatches]
        if len(values) != len(set(values)):
            errors.append(f"duplicate_{field}")
    for dispatch in dispatches:
        if dispatch.get("model") != REQUIRED_MODEL or dispatch.get("reasoning_effort") != REQUIRED_EFFORT:
            errors.append(f"wrong_model_or_effort:{dispatch.get('attempt_id')}")
        if dispatch.get("prior_substantive_assignment_count") != 0:
            errors.append(f"prior_assignment_count_nonzero:{dispatch.get('attempt_id')}")
        if dispatch.get("no_followup_reuse") is not True or dispatch.get("terminal_after_result") is not True:
            errors.append(f"reuse_or_terminal_flag_invalid:{dispatch.get('attempt_id')}")
    for result in results:
        path = repo_path(result["result_ref"])
        if not path.exists() or sha256_path(path) != result["result_sha256"]:
            errors.append(f"result_hash_mismatch:{result['assignment_id']}")
        validation_path = repo_path(result["validation_ref"])
        if not validation_path.exists() or sha256_path(validation_path) != result["validation_sha256"]:
            errors.append(f"validation_hash_mismatch:{result['assignment_id']}")
    if require_complete and set(result_ids) != packet_ids:
        errors.append(f"incomplete_coverage:{len(set(result_ids))}/{len(packet_ids)}")
    report = {
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "assignment_count": len(packet),
        "valid_assignment_count": len(set(result_ids)),
        "failed_attempt_count": len(failures),
        "unique_agents_spawned": len(dispatches),
        "duplicate_agent_instance_count": len(dispatches) - len({row.get("agent_instance_id") for row in dispatches}),
        "duplicate_agent_path_count": len(dispatches) - len({row.get("agent_path") for row in dispatches}),
        "duplicate_agent_thread_count": len(dispatches) - len({row.get("agent_thread_id") for row in dispatches}),
        "recycled_agent_count": 0,
        "multi_scope_agent_count": 0,
        "required_model": REQUIRED_MODEL,
        "required_reasoning_effort": REQUIRED_EFFORT,
        "complete_required": require_complete,
        "errors": errors,
        "status": "pass" if not errors else "fail",
    }
    path = VALIDATION_DIR / "runner_validation.json"
    write_json(path, report)
    return report


def main() -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    register = subparsers.add_parser("register")
    register.add_argument("--assignment-id", required=True)
    register.add_argument("--agent-path", required=True)
    register.add_argument("--attempt-number", required=True, type=int)
    capture = subparsers.add_parser("capture")
    capture.add_argument("--assignment-id", required=True)
    capture.add_argument("--agent-path", required=True)
    capture.add_argument("--attempt-number", required=True, type=int)
    prepare = subparsers.add_parser("prepare-wave")
    prepare.add_argument("--start-index", required=True, type=int)
    prepare.add_argument("--count", required=True, type=int)
    prepare.add_argument("--wave-number", required=True, type=int)
    prepare_assignments = subparsers.add_parser("prepare-assignments")
    prepare_assignments.add_argument("--assignment-id", action="append", required=True)
    prepare_assignments.add_argument("--wave-number", required=True, type=int)
    register_wave_parser = subparsers.add_parser("register-wave")
    register_wave_parser.add_argument("--plan-ref", required=True)
    capture_wave_parser = subparsers.add_parser("capture-wave")
    capture_wave_parser.add_argument("--plan-ref", required=True)
    checkpoint_parser = subparsers.add_parser("checkpoint")
    checkpoint_parser.add_argument("--last-completed-wave", required=True, type=int)
    checkpoint_parser.add_argument("--next-packet-index", required=True, type=int)
    checkpoint_parser.add_argument("--status", required=True)
    validate_parser = subparsers.add_parser("validate-runner")
    validate_parser.add_argument("--require-complete", action="store_true")
    quarantine_parser = subparsers.add_parser("record-initial-v2-quarantines")
    quarantine_parser.add_argument("--snapshot-ref", required=True)
    args = parser.parse_args()
    try:
        if args.command == "register":
            value = register_agent(args.assignment_id, args.agent_path, args.attempt_number)
        elif args.command == "capture":
            value = capture_result(args.assignment_id, args.agent_path, args.attempt_number)
        elif args.command == "prepare-wave":
            value = prepare_wave(args.start_index, args.count, args.wave_number)
        elif args.command == "prepare-assignments":
            value = prepare_assignment_wave(args.assignment_id, args.wave_number)
        elif args.command == "register-wave":
            value = register_wave(args.plan_ref)
        elif args.command == "capture-wave":
            value = capture_wave(args.plan_ref)
        elif args.command == "checkpoint":
            value = checkpoint(args.last_completed_wave, args.next_packet_index, args.status)
        elif args.command == "validate-runner":
            value = validate_runner(args.require_complete)
        elif args.command == "record-initial-v2-quarantines":
            value = record_initial_v2_quarantines(args.snapshot_ref)
        else:
            raise ValueError(f"unknown command {args.command}")
        print(json.dumps(value, indent=2, sort_keys=True))
        if isinstance(value, dict) and value.get("status") == "fail":
            return 2
        return 0
    except Exception as exc:  # deterministic infrastructure failure receipt on stderr
        print(json.dumps({"status": "error", "error": str(exc)}, sort_keys=True), file=sys.stderr)
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
