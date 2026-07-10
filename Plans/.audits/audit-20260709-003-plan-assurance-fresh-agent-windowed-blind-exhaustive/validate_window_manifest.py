#!/usr/bin/env python3
"""Independent read-only validator for the window manifest and assignment gate."""

from __future__ import annotations

import hashlib
import json
import math
from collections import defaultdict
from pathlib import Path


AUDIT_ID = "audit-20260709-003-plan-assurance-fresh-agent-windowed-blind-exhaustive"
MAX_LINES = 400
MAX_TOKENS = 12_000
DIVISOR = 3
REQUIRED_ROLES = {"contract_capability_exact_behavior", "adversarial_negative_space"}

SCRIPT = Path(__file__).resolve()
AUDIT = SCRIPT.parent
REPO = SCRIPT.parents[3]


def load_jsonl(path: Path):
    return [json.loads(raw) for raw in path.read_text(encoding="utf-8").splitlines() if raw.strip()]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    scope = load_jsonl(AUDIT / "doc_scope_manifest.jsonl")
    manifest = load_jsonl(AUDIT / "doc_window_manifest.jsonl")
    seams = load_jsonl(AUDIT / "seam_findings.jsonl")
    assignments = load_jsonl(AUDIT / "doc_window_assignments.jsonl")

    scope_rows = [row for row in scope if row.get("record_type") == "document_scope"]
    primary = {row["path"]: row for row in scope_rows if row["primary_authority"]}
    windows = [row for row in manifest if row.get("record_type") == "document_window"]
    seam_rows = [row for row in seams if row.get("record_type") == "seam_manifest"]
    assignment_rows = [row for row in assignments if row.get("record_type") == "window_assignment"]

    assert not assignment_rows, "Review assignments exist before independent manifest validation"
    assert manifest[0]["audit_id"] == AUDIT_ID
    assert manifest[0]["status"] == "manifest_validated_assignments_allowed"

    by_doc = defaultdict(list)
    seen_ids = set()
    authoritative_lines = 0
    covered_lines = 0
    max_seen_lines = 0
    max_seen_tokens = 0
    oversized_windows = 0
    for row in windows:
        assert row["window_id"] not in seen_ids, row["window_id"]
        seen_ids.add(row["window_id"])
        assert row["document_path"] in primary, row["document_path"]
        assert set(row["required_roles"]) == REQUIRED_ROLES, row["window_id"]
        assert row["assigned_agent_ids"] == [] and row["assigned_roles"] == [], row["window_id"]
        assert row["review_state"] == "unassigned_manifest_validating", row["window_id"]
        by_doc[row["document_path"]].append(row)

    for path_rel, scope_row in primary.items():
        path = REPO / path_rel
        data = path.read_bytes()
        text = data.decode("utf-8")
        lines = text.splitlines(keepends=True)
        assert sha(data) == scope_row["source_hash"], path_rel
        assert len(lines) == scope_row["line_count"], path_rel
        authoritative_lines += len(lines)
        rows = sorted(by_doc[path_rel], key=lambda row: row["core_line_start"])
        assert rows, path_rel
        expected = 1
        for row in rows:
            start = row["core_line_start"]
            end = row["core_line_end"]
            assert start == expected, (path_rel, expected, start)
            assert 1 <= start <= end <= len(lines), (path_rel, start, end)
            core = "".join(lines[start - 1 : end])
            recomputed_tokens = math.ceil(len(core) / DIVISOR)
            assert recomputed_tokens == row["token_estimate"], row["window_id"]
            assert sha(core.encode("utf-8")) == row["window_source_hash"], row["window_id"]
            assert sha(data) == row["source_hash"], row["window_id"]
            line_count = end - start + 1
            assert line_count == row["authoritative_line_count"], row["window_id"]
            assert line_count <= MAX_LINES, row["window_id"]
            assert recomputed_tokens <= MAX_TOKENS, row["window_id"]
            max_seen_lines = max(max_seen_lines, line_count)
            max_seen_tokens = max(max_seen_tokens, recomputed_tokens)
            oversized_windows += int(bool(row["oversized_subdivision"]))
            for context_start, context_end in row["context_ranges"]:
                assert 1 <= context_start <= context_end <= len(lines), row["window_id"]
                assert context_end < start or context_start > end, row["window_id"]
            covered_lines += line_count
            expected = end + 1
        assert expected == len(lines) + 1, (path_rel, expected, len(lines) + 1)
        assert scope_row["window_manifest_refs"] == [row["window_id"] for row in rows], path_rel
        assert scope_row["window_coverage_status"] == "exact_core_coverage_validated", path_rel

    assert set(by_doc) == set(primary)
    assert covered_lines == authoritative_lines

    expected_seams = sum(max(0, len(rows) - 1) for rows in by_doc.values())
    assert len(seam_rows) == expected_seams
    seam_pairs = {(row["document_path"], row["left_window_id"], row["right_window_id"]) for row in seam_rows}
    assert len(seam_pairs) == len(seam_rows)
    for path_rel, rows in by_doc.items():
        ordered = sorted(rows, key=lambda row: row["core_line_start"])
        for left, right in zip(ordered, ordered[1:]):
            assert (path_rel, left["window_id"], right["window_id"]) in seam_pairs

    report = json.loads((AUDIT / "doc_window_coverage_report.json").read_text(encoding="utf-8"))
    assert report["manifest_validation_passed"] is True
    assert report["assignment_gate_open"] is True
    assert report["gap_count"] == 0
    assert report["duplicate_core_count"] == 0
    assert report["lines"]["authoritative"] == authoritative_lines
    assert report["lines"]["covered_by_exact_core"] == covered_lines
    assert report["windows"]["total_authoritative"] == len(windows)
    assert report["unreviewed_window_count"] == len(windows)

    result = {
        "audit_id": AUDIT_ID,
        "independent_validation_passed": True,
        "review_assignments_at_validation": 0,
        "authoritative_documents": len(primary),
        "authoritative_windows": len(windows),
        "authoritative_lines": authoritative_lines,
        "covered_lines": covered_lines,
        "gap_count": 0,
        "duplicate_core_count": 0,
        "boundary_count": len(seam_rows),
        "max_window_lines": max_seen_lines,
        "max_window_estimated_tokens": max_seen_tokens,
        "windows_containing_explicit_oversized_subdivisions": oversized_windows,
        "assignment_gate_open": True,
    }
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
