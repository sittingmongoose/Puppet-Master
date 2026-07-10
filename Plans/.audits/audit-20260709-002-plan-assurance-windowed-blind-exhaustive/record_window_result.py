#!/usr/bin/env python3
"""Validate and record one raw window-agent result."""

import argparse
import json
from pathlib import Path


SCRIPT = Path(__file__).resolve()
AUDIT = SCRIPT.parent
REPO = AUDIT.parents[2]
REQUIRED_FIELDS = {
    "result_id","assignment_id","document_path","window_id","role","agent_id",
    "reviewed_core_range","reviewed_context_ranges","source_hash_verified","claims",
    "negative_space_observations","ambiguities","builder_discretion","candidate_findings",
    "cross_window_seams","evidence_refs","quality_state","zero_writes_confirmed",
}


def load(path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write(path, rows):
    path.write_text("\n".join(json.dumps(row, sort_keys=True, separators=(",", ":")) for row in rows) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--result-file", required=True)
    parser.add_argument("--completed-at", required=True)
    args = parser.parse_args()

    raw_path = Path(args.result_file).resolve()
    assert AUDIT in raw_path.parents, "Raw result must be inside audit directory"
    result = json.loads(raw_path.read_text(encoding="utf-8"))
    missing = REQUIRED_FIELDS - set(result)
    assert not missing, missing

    assignment_path = AUDIT / "doc_window_assignments.jsonl"
    manifest_path = AUDIT / "doc_window_manifest.jsonl"
    results_path = AUDIT / "doc_window_results.jsonl"
    master_path = AUDIT / "assignment_manifest.jsonl"
    coverage_path = AUDIT / "doc_window_coverage_report.json"
    overall_path = AUDIT / "coverage_report.json"
    assignments = load(assignment_path)
    manifest = load(manifest_path)
    results = load(results_path)
    master = load(master_path)
    assignment = next(row for row in assignments if row.get("assignment_id") == result["assignment_id"])
    window = next(row for row in manifest if row.get("window_id") == assignment["window_id"])

    assert result["result_id"] not in {row.get("result_id") for row in results}
    submitted_document_path = Path(result["document_path"])
    if submitted_document_path.is_absolute():
        submitted_document_path = submitted_document_path.relative_to(REPO)
    result["document_path"] = submitted_document_path.as_posix()
    assert result["document_path"] == assignment["document_path"] == window["document_path"]
    assert result["window_id"] == assignment["window_id"] == window["window_id"]
    assert result["role"] == assignment["role"]
    assert result["agent_id"] == assignment["agent_id"]
    assert result["reviewed_core_range"] == [window["core_line_start"], window["core_line_end"]]
    assert result["reviewed_context_ranges"] == window["context_ranges"]
    assert result["source_hash_verified"] is True
    assert result["zero_writes_confirmed"] is True
    quality_state = result["quality_state"]
    if isinstance(quality_state, dict):
        result["quality_detail"] = quality_state
        quality_state = quality_state.get("status")
        result["quality_state"] = quality_state
    assert quality_state in {"complete","pass","complete_with_observations"}
    for list_field in (
        "claims", "negative_space_observations", "ambiguities", "builder_discretion",
        "candidate_findings", "cross_window_seams",
    ):
        assert isinstance(result[list_field], list), list_field
    assert isinstance(result["evidence_refs"], (list, dict)), "evidence_refs"

    result["record_type"] = "window_result"
    result["completed_at"] = args.completed_at
    # Keep a stable repo-relative ref without depending on cwd.
    result["raw_result_ref"] = "Plans/.audits/audit-20260709-002-plan-assurance-windowed-blind-exhaustive/" + raw_path.relative_to(AUDIT).as_posix()
    results.append(result)
    for item in results:
        if item.get("record_type") == "audit_header":
            item["result_count"] = sum(row.get("record_type") == "window_result" for row in results)
            item["status"] = "reviews_in_progress"

    assignment["state"] = "completed"
    assignment["result_ref"] = result["result_id"]
    window["result_refs"].append(result["result_id"])
    completed_roles = {row["role"] for row in results if row.get("record_type") == "window_result" and row["window_id"] == window["window_id"]}
    required = set(window["required_roles"])
    window["completed_roles"] = sorted(completed_roles)
    window["review_state"] = "dual_role_complete_pending_specialists" if required <= completed_roles else "one_required_role_complete"

    for item in master:
        if item.get("assignment_id") == assignment["assignment_id"]:
            item["state"] = "completed"
            item["result_ref"] = result["result_id"]
            item["completed_at"] = args.completed_at

    write(results_path, results)
    write(assignment_path, assignments)
    write(manifest_path, manifest)
    write(master_path, master)

    result_rows = [row for row in results if row.get("record_type") == "window_result"]
    total_windows = sum(row.get("record_type") == "document_window" for row in manifest)
    contract_windows = {row["window_id"] for row in result_rows if row["role"] == "contract_capability_exact_behavior"}
    adversarial_windows = {row["window_id"] for row in result_rows if row["role"] == "adversarial_negative_space"}
    both = contract_windows & adversarial_windows
    specialist_results = [row for row in result_rows if row["role"] not in {"contract_capability_exact_behavior","adversarial_negative_space"}]
    coverage = json.loads(coverage_path.read_text(encoding="utf-8"))
    coverage["status"] = "window_reviews_in_progress"
    coverage["windows"]["contract_role_complete"] = len(contract_windows)
    coverage["windows"]["adversarial_role_complete"] = len(adversarial_windows)
    coverage["windows"]["both_required_roles_complete"] = len(both)
    coverage["windows"]["unreviewed_authoritative"] = total_windows - len(both)
    coverage["windows"]["specialist_assignments"] = len(specialist_results)
    coverage["unreviewed_window_count"] = total_windows - len(both)
    coverage_path.write_text(json.dumps(coverage, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    overall = json.loads(overall_path.read_text(encoding="utf-8"))
    overall["status"] = "window_reviews_in_progress"
    overall["document_window_coverage"]["unreviewed_window_count"] = total_windows - len(both)
    overall_path.write_text(json.dumps(overall, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"recorded":result["result_id"],"both_required_roles_complete_windows":len(both),"unreviewed_windows":total_windows-len(both)}, sort_keys=True))


if __name__ == "__main__":
    main()
