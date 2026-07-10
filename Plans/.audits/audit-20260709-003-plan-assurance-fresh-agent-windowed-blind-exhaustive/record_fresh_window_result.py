#!/usr/bin/env python3
"""Validate and persist one fresh-agent window result, then terminalize that agent."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
REPO = AUDIT.parents[2]
REQUIRED = {
    "result_id", "assignment_id", "document_path", "window_id", "role", "agent_instance_id", "agent_path",
    "reviewed_core_range", "reviewed_context_ranges", "context_capsule_hash_verified", "source_hash_verified",
    "claims", "negative_space_observations", "ambiguities", "builder_discretion", "candidate_findings",
    "cross_window_seams", "evidence_refs", "quality_state", "zero_writes_confirmed", "blind_isolation_confirmed",
}


def load(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write(path: Path, rows: list[dict]) -> None:
    path.write_text("\n".join(json.dumps(row, sort_keys=True, separators=(",", ":")) for row in rows) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--result-file", required=True)
    parser.add_argument("--completed-at", required=True)
    args = parser.parse_args()
    raw = Path(args.result_file).resolve()
    assert AUDIT in raw.parents
    result = json.loads(raw.read_text(encoding="utf-8"))
    assert not (REQUIRED - set(result)), REQUIRED - set(result)

    registry_path = AUDIT / "fresh_agent_assignment_registry.jsonl"
    docs_path = AUDIT / "doc_window_assignments.jsonl"
    results_path = AUDIT / "doc_window_results.jsonl"
    master_path = AUDIT / "assignment_manifest.jsonl"
    manifest_path = AUDIT / "doc_window_manifest.jsonl"
    registry = load(registry_path)
    docs = load(docs_path)
    results = load(results_path)
    master = load(master_path)
    manifest = load(manifest_path)
    assignment = next(row for row in registry if row.get("assignment_id") == result["assignment_id"])
    doc_assignment = next(row for row in docs if row.get("assignment_id") == result["assignment_id"])
    window = next(row for row in manifest if row.get("window_id") == assignment["window_id"])
    assert assignment["state"] == "assigned" and assignment["result_ref"] is None
    assert result["result_id"] not in {row.get("result_id") for row in results}
    path = Path(result["document_path"])
    if path.is_absolute():
        path = path.relative_to(REPO)
    result["document_path"] = path.as_posix()
    for field in ("document_path", "window_id", "role", "agent_instance_id", "agent_path"):
        expected = assignment["agent_instance_id"] if field == "agent_path" else assignment[field]
        assert result[field] == expected, (field, result[field], expected)
    assert result["reviewed_core_range"] == [window["core_line_start"], window["core_line_end"]]
    assert result["reviewed_context_ranges"] == window["context_ranges"]
    assert result["context_capsule_hash_verified"] is True
    assert result["source_hash_verified"] is True
    assert result["zero_writes_confirmed"] is True
    assert result["blind_isolation_confirmed"] is True
    assert result["quality_state"] == "complete"
    for field in ("claims", "negative_space_observations", "ambiguities", "builder_discretion", "candidate_findings", "cross_window_seams", "evidence_refs"):
        assert isinstance(result[field], list), field

    result.update({
        "record_type": "window_result",
        "completed_at": args.completed_at,
        "context_capsule_ref": assignment["context_capsule_ref"],
        "context_capsule_hash": assignment["context_capsule_hash"],
        "raw_result_ref": f"Plans/.audits/{AUDIT.name}/" + raw.relative_to(AUDIT).as_posix(),
        "fresh_agent_terminal_after_result": True,
    })
    results.append(result)
    for row in results:
        if row.get("record_type") == "audit_header":
            row["status"] = "fresh_reviews_in_progress"
            row["row_count"] = sum(item.get("record_type") == "window_result" for item in results)

    for row in (assignment, doc_assignment):
        row["state"] = "terminal"
        row["completed_at"] = args.completed_at
        row["terminal_at"] = args.completed_at
        row["result_ref"] = result["result_id"]
    for row in master:
        if row.get("assignment_id") == assignment["assignment_id"]:
            row["state"] = "terminal"
            row["completed_at"] = args.completed_at
            row["terminal_at"] = args.completed_at
            row["result_ref"] = result["result_id"]
    window["result_refs"].append(result["result_id"])
    completed_roles = {row["role"] for row in results if row.get("record_type") == "window_result" and row["window_id"] == window["window_id"]}
    window["completed_roles"] = sorted(completed_roles)
    required = set(window["required_roles"])
    window["review_state"] = "dual_role_complete_pending_specialists" if required <= completed_roles else "one_required_role_complete"

    write(registry_path, registry)
    write(docs_path, docs)
    write(results_path, results)
    write(master_path, master)
    write(manifest_path, manifest)

    result_rows = [row for row in results if row.get("record_type") == "window_result"]
    exact = {row["window_id"] for row in result_rows if row["role"] == "contract_capability_exact_behavior"}
    adversarial = {row["window_id"] for row in result_rows if row["role"] == "adversarial_negative_space"}
    both = exact & adversarial
    coverage_path = AUDIT / "doc_window_coverage_report.json"
    coverage = json.loads(coverage_path.read_text(encoding="utf-8"))
    total = coverage["windows"]["total_authoritative"]
    coverage["status"] = "fresh_window_reviews_in_progress"
    coverage["windows"]["contract_role_complete"] = len(exact)
    coverage["windows"]["adversarial_role_complete"] = len(adversarial)
    coverage["windows"]["both_required_roles_complete"] = len(both)
    coverage["windows"]["unreviewed_authoritative"] = total - len(both)
    coverage["unreviewed_window_count"] = total - len(both)
    coverage_path.write_text(json.dumps(coverage, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    overall_path = AUDIT / "coverage_report.json"
    overall = json.loads(overall_path.read_text(encoding="utf-8"))
    overall["status"] = "fresh_window_reviews_in_progress"
    overall["document_window_coverage"]["unreviewed_window_count"] = total - len(both)
    overall_path.write_text(json.dumps(overall, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"recorded": result["result_id"], "agent_terminal": assignment["agent_instance_id"], "dual_reviewed_windows": len(both)}, sort_keys=True))


if __name__ == "__main__":
    main()
