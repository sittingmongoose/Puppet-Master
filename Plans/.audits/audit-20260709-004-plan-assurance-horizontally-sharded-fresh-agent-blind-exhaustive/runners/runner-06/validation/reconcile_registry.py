#!/usr/bin/env python3
import json
from pathlib import Path

AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
AUDIT = Path("Plans/.audits") / AUDIT_ID
BASE = AUDIT / "runners/runner-06"
ASSIGNMENTS = AUDIT / "assignments/runner-06.jsonl"
REGISTRY = BASE / "fresh_agent_assignment_registry.jsonl"
RESULTS = BASE / "result_manifest.jsonl"

assignments = {
    row["assignment_id"]: row
    for row in (json.loads(line) for line in ASSIGNMENTS.read_text().splitlines() if line.strip())
}
registry = [json.loads(line) for line in REGISTRY.read_text().splitlines() if line.strip()]
results = [json.loads(line) for line in RESULTS.read_text().splitlines() if line.strip()] if RESULTS.exists() else []
result_by_attempt = {(row["assignment_id"], row["attempt"], row["agent_path"]): row for row in results}

for record in registry:
    assignment = assignments[record["assignment_id"]]
    capsule = json.loads(Path(assignment["capsule_ref"]).read_text())
    record.update({
        "runner_id": "runner-06",
        "model": assignment["required_model"],
        "reasoning_effort": assignment["required_reasoning_effort"],
        "role": assignment["role"],
        "window_id": assignment["window_id"],
        "doc_id": assignment["doc_id"],
        "document_path": assignment["document_path"],
        "core_range": assignment["core_range"],
        "overlap_ranges": capsule.get("context_ranges", []),
        "source_sha256": assignment["source_sha256"],
        "capsule_ref": assignment["capsule_ref"],
        "capsule_sha256": assignment["capsule_sha256"],
        "capsule_bytes": assignment["capsule_bytes"],
        "source_excerpt_ref": assignment["source_excerpt_ref"],
        "source_excerpt_sha256": assignment["source_excerpt_sha256"],
        "source_excerpt_bytes": assignment["source_excerpt_bytes"],
        "capsule_package_bytes": assignment["capsule_package_bytes"],
        "token_estimate": assignment["token_estimate"],
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
        "no_followup_reuse": True,
    })
    result = result_by_attempt.get((record["assignment_id"], record["attempt"], record["agent_path"]))
    if result:
        record.update({
            "created_at": result["created_at"],
            "completed_at": result["completed_at"],
            "result_ref": result["result_ref"],
            "result_sha256": result["result_sha256"],
            "state": "terminal_valid" if result["valid"] else "terminal_failed",
            "coverage_credit": result["coverage_credit"],
            "dispatch_validation_passed": result.get("dispatch_validation_passed"),
            "schema_validation_passed": result.get("schema_validation_passed"),
        })
        if "failure_reason" in result:
            record["failure_reason"] = result["failure_reason"]

REGISTRY.write_text("".join(json.dumps(row, separators=(",", ":"), sort_keys=True) + "\n" for row in registry))
print(json.dumps({"registry_records": len(registry), "reconciled_results": len(results)}, sort_keys=True))
