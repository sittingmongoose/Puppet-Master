#!/usr/bin/env python3
"""Read-only mechanical validator/extractor for one audit-004 reviewer session."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


AUDIT = Path(
    "Plans/.audits/"
    "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
)
PACKET = AUDIT / "assignments/runner-05.jsonl"
PARENT_THREAD_ID = "019f49e2-1022-71c1-b547-37d8b9e8bf28"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--session", required=True, type=Path)
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--agent-path", required=True)
    args = parser.parse_args()

    assignments = [
        json.loads(line)
        for line in PACKET.read_text().splitlines()
        if line.strip()
    ]
    assignment = next(
        row for row in assignments if row["assignment_id"] == args.assignment_id
    )
    events = [
        json.loads(line)
        for line in args.session.read_text().splitlines()
        if line.strip()
    ]
    session_meta = events[0]["payload"]
    spawn = session_meta["source"]["subagent"]["thread_spawn"]
    turn_context = next(
        event["payload"] for event in events if event["type"] == "turn_context"
    )
    final_messages = [
        event
        for event in events
        if event["type"] == "response_item"
        and event["payload"].get("type") == "message"
        and event["payload"].get("role") == "assistant"
        and event["payload"].get("phase") == "final_answer"
    ]

    errors: list[str] = []
    if len(final_messages) != 1:
        errors.append(f"assistant_final_count={len(final_messages)}")
    raw = ""
    if final_messages:
        raw = "".join(
            item.get("text", "")
            for item in final_messages[0]["payload"].get("content", [])
            if item.get("type") in {"output_text", "text"}
        )
    try:
        result = json.loads(raw)
    except Exception as exc:  # noqa: BLE001 - validator must report malformed output
        result = {}
        errors.append(f"invalid_json:{exc}")

    capsule_path = Path(assignment["capsule_ref"])
    excerpt_path = Path(assignment["source_excerpt_ref"])
    capsule = json.loads(capsule_path.read_text())
    if (
        len(capsule_path.read_bytes()) != assignment["capsule_bytes"]
        or sha256(capsule_path) != assignment["capsule_sha256"]
    ):
        errors.append("capsule_mismatch")
    if (
        len(excerpt_path.read_bytes()) != assignment["source_excerpt_bytes"]
        or sha256(excerpt_path) != assignment["source_excerpt_sha256"]
    ):
        errors.append("source_excerpt_mismatch")

    document = Path(assignment["document_path"])
    if sha256(document) != assignment["source_sha256"]:
        errors.append("source_hash_mismatch")

    fixed_fields = {
        "assignment_id": args.assignment_id,
        "role": assignment["role"],
        "window_id": assignment["window_id"],
        "document_path": assignment["document_path"],
        "core_range": assignment["core_range"],
    }
    if result.get("schema_version") not in {
        "audit004.document_window_result.v1",
        "audit004.document_window_result.v2",
    }:
        errors.append("result_field_mismatch:schema_version")
    for key, expected in fixed_fields.items():
        if result.get(key) != expected:
            errors.append(f"result_field_mismatch:{key}")

    array_fields = (
        "observations",
        "candidate_findings",
        "explicit_non_gaps",
        "unknowns",
        "exact_evidence_refs",
    )
    for key in array_fields:
        if not isinstance(result.get(key), list):
            errors.append(f"not_array:{key}")

    evidence_rows = (
        result.get("exact_evidence_refs", [])
        if isinstance(result.get("exact_evidence_refs"), list)
        else []
    )
    if not evidence_rows:
        errors.append("exact_evidence_refs_empty")
    evidence_map: dict[str, dict] = {}
    allowed_ranges = [("core", assignment["core_range"])] + [
        ("context", item) for item in capsule.get("context_ranges", [])
    ]
    source_lines = document.read_text().splitlines()
    for index, evidence in enumerate(evidence_rows):
        evidence_id = evidence.get("evidence_ref_id")
        if not isinstance(evidence_id, str) or not evidence_id:
            errors.append(f"evidence_id_missing:{index}")
            continue
        if evidence_id in evidence_map:
            errors.append(f"duplicate_evidence_id:{evidence_id}")
        evidence_map[evidence_id] = evidence
        if evidence.get("document_path") != assignment["document_path"]:
            errors.append(f"evidence_path:{evidence_id}")
        line_start = evidence.get("line_start")
        line_end = evidence.get("line_end")
        if (
            not isinstance(line_start, int)
            or not isinstance(line_end, int)
            or line_start < 1
            or line_end < line_start
            or line_end > len(source_lines)
        ):
            errors.append(f"evidence_line_shape:{evidence_id}")
            continue
        matching_scopes = [
            scope
            for scope, (low, high) in allowed_ranges
            if line_start >= low and line_end <= high
        ]
        if not matching_scopes:
            errors.append(
                f"evidence_out_of_capsule:{evidence_id}:{line_start}-{line_end}"
            )
        elif evidence.get("scope_class") not in matching_scopes:
            errors.append(f"evidence_scope_class:{evidence_id}")
        source_text = " ".join(
            "\n".join(source_lines[line_start - 1 : line_end]).split()
        )
        quote = evidence.get("quote")
        if not isinstance(quote, str) or not quote.strip():
            errors.append(f"exact_quote_missing:{evidence_id}")
        elif " ".join(quote.split()) not in source_text:
            errors.append(f"exact_quote_mismatch:{evidence_id}")

    item_id_fields = {
        "observations": "observation_id",
        "candidate_findings": "finding_id",
        "explicit_non_gaps": "non_gap_id",
        "unknowns": "unknown_id",
    }
    for array_name, id_field in item_id_fields.items():
        seen_ids: set[str] = set()
        values = (
            result.get(array_name, [])
            if isinstance(result.get(array_name), list)
            else []
        )
        for index, item in enumerate(values):
            item_id = item.get(id_field)
            if not isinstance(item_id, str) or not item_id:
                errors.append(f"{array_name}_id_missing:{index}")
            elif item_id in seen_ids:
                errors.append(f"{array_name}_id_duplicate:{item_id}")
            seen_ids.add(item_id)
            refs = item.get("evidence_ref_ids")
            if not isinstance(refs, list) or not refs:
                errors.append(f"{array_name}_refs_empty:{item_id}")
            else:
                for ref in refs:
                    if ref not in evidence_map:
                        errors.append(f"{array_name}_unknown_ref:{item_id}:{ref}")

    declaration = result.get("reviewer_declaration")
    required_declaration = {
        "verified_capsule_hash_and_bytes": True,
        "verified_source_excerpt_hash_and_bytes": True,
        "reviewed_entire_core": True,
        "prior_audits_accessed": False,
        "other_reviewer_results_accessed": False,
        "unrelated_windows_accessed": False,
        "external_sources_accessed": False,
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
    }
    if not isinstance(declaration, dict):
        errors.append("declaration_missing")
    else:
        if not (
            declaration.get("used_only_assigned_capsule") is True
            or declaration.get(
                "used_only_assigned_capsule_and_bounded_canonical_lines"
            )
            is True
        ):
            errors.append("declaration_mismatch:used_only_assigned_capsule")
        for key, expected in required_declaration.items():
            if declaration.get(key) != expected:
                errors.append(f"declaration_mismatch:{key}")

    if session_meta.get("parent_thread_id") != PARENT_THREAD_ID:
        errors.append("parent_thread_id_mismatch")
    if turn_context.get("model") != "gpt-5.6-sol":
        errors.append(f"wrong_model:{turn_context.get('model')}")
    if turn_context.get("effort") != "ultra":
        errors.append(f"wrong_effort:{turn_context.get('effort')}")
    if spawn.get("agent_path") != args.agent_path:
        errors.append("agent_path_mismatch")

    task_complete = [
        event
        for event in events
        if event["type"] == "event_msg"
        and event["payload"].get("type") == "task_complete"
    ]
    if not task_complete:
        errors.append("task_complete_missing")
    final_index = events.index(final_messages[0]) if final_messages else -1
    post_terminal_outputs = [
        event
        for event in events[final_index + 1 :]
        if event["type"] == "response_item"
        and event["payload"].get("type") == "message"
        and event["payload"].get("role") == "assistant"
    ]
    if post_terminal_outputs:
        errors.append("assistant_output_after_terminal")

    token_events = [
        event["payload"].get("info")
        for event in events
        if event["type"] == "event_msg"
        and event["payload"].get("type") == "token_count"
        and event["payload"].get("info")
    ]
    token_usage = (
        token_events[-1].get("total_token_usage") if token_events else None
    )
    completed_at = task_complete[-1].get("timestamp") if task_complete else None
    raw_with_newline = (raw + "\n").encode()
    output = {
        "raw": raw,
        "validation": {
            "status": "pass" if not errors else "fail",
            "errors": errors,
            "evidence_count": len(evidence_rows),
            "observation_count": len(result.get("observations", []))
            if isinstance(result.get("observations"), list)
            else 0,
            "candidate_finding_count": len(result.get("candidate_findings", []))
            if isinstance(result.get("candidate_findings"), list)
            else 0,
            "explicit_non_gap_count": len(result.get("explicit_non_gaps", []))
            if isinstance(result.get("explicit_non_gaps"), list)
            else 0,
            "unknown_count": len(result.get("unknowns", []))
            if isinstance(result.get("unknowns"), list)
            else 0,
        },
        "session": {
            "thread_id": session_meta["id"],
            "parent_thread_id": session_meta.get("parent_thread_id"),
            "agent_path": spawn.get("agent_path"),
            "agent_nickname": spawn.get("agent_nickname"),
            "created_at": session_meta.get("timestamp"),
            "completed_at": completed_at,
            "model": turn_context.get("model"),
            "reasoning_effort": turn_context.get("effort"),
            "token_usage": token_usage,
        },
        "result_sha256_with_newline": hashlib.sha256(raw_with_newline).hexdigest(),
        "result_bytes_with_newline": len(raw_with_newline),
    }
    print(json.dumps(output, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
