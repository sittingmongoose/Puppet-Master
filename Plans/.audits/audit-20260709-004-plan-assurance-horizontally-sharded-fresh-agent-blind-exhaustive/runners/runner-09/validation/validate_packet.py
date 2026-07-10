#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path

AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
RUNNER_ID = "runner-09"
RUNNER_THREAD_ID = "019f49e2-16f5-7d13-b047-49d8c1252759"
AUDIT_ROOT = Path(__file__).resolve().parents[3]
REPO_ROOT = AUDIT_ROOT.parents[2]

def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()

def repo_path(ref: str) -> Path:
    path = (REPO_ROOT / ref).resolve()
    path.relative_to(REPO_ROOT.resolve())
    return path

ready_path = AUDIT_ROOT / "coordination" / "READY_FOR_RUNNERS.json"
packet_path = AUDIT_ROOT / "assignments" / f"{RUNNER_ID}.jsonl"
ready = json.loads(ready_path.read_text())
assert ready["audit_id"] == AUDIT_ID
assert ready["status"] == "READY_FOR_RUNNERS"
assert ready["prelaunch_validation_passed"] is True
assert ready["old_audit_substantive_credit"] == 0
sealed = {
    "manifest_sha256": AUDIT_ROOT / "assignments" / "global_assignment_manifest.jsonl",
    "window_manifest_sha256": AUDIT_ROOT / "manifests" / "window_manifest.jsonl",
    "capsule_registry_sha256": AUDIT_ROOT / "manifests" / "context_capsule_registry.jsonl",
    "runner_registry_sha256": AUDIT_ROOT / "coordination" / "runner_thread_registry.json",
    "validator_result_sha256": AUDIT_ROOT / "validator_results.json",
}
for key, path in sealed.items():
    assert sha256(path) == ready[key], (key, path)
runner_registry = json.loads((AUDIT_ROOT / "coordination" / "runner_thread_registry.json").read_text())
assert runner_registry[RUNNER_ID] == RUNNER_THREAD_ID
rows = [json.loads(line) for line in packet_path.read_text().splitlines() if line.strip()]
assert len(rows) == 211
assert len({row["assignment_id"] for row in rows}) == len(rows)
assert len({row["assignment_seq"] for row in rows}) == len(rows)
assert len({row["window_id"] for row in rows}) == len(rows)
total_bytes = 0
total_tokens = 0
for row in rows:
    assert row["audit_id"] == AUDIT_ID
    assert row["runner_id"] == RUNNER_ID
    assert row["runner_thread_id"] == RUNNER_THREAD_ID
    assert row["required_model"] == "gpt-5.6-sol"
    assert row["required_reasoning_effort"] == "ultra"
    assert row["role_key"] == "exact"
    assert row["fresh_agent_required"] is True
    assert row["followup_reuse_forbidden"] is True
    assert row["prior_substantive_assignment_count"] == 0
    assert row["terminal_after_result"] is True
    assert row["state"] == "ready_unassigned"
    assert row["capsule_package_bytes"] <= 65536
    capsule_path = repo_path(row["capsule_ref"])
    source_path = repo_path(row["source_excerpt_ref"])
    assert capsule_path.stat().st_size == row["capsule_bytes"]
    assert source_path.stat().st_size == row["source_excerpt_bytes"]
    assert row["capsule_package_bytes"] == row["capsule_bytes"] + row["source_excerpt_bytes"]
    assert sha256(capsule_path) == row["capsule_sha256"]
    assert sha256(source_path) == row["source_excerpt_sha256"]
    capsule = json.loads(capsule_path.read_text())
    for key in ("assignment_id", "audit_id", "runner_id", "runner_thread_id", "role", "role_key", "window_id", "doc_id", "document_path", "core_range", "core_sha256", "source_sha256", "source_excerpt_ref", "source_excerpt_sha256", "source_excerpt_bytes"):
        assert capsule[key] == row[key], (row["assignment_id"], key)
    assert capsule["blindness"] == {"other_reviewer_results": "forbidden", "prior_audits": "forbidden", "unrelated_windows": "forbidden"}
    assert capsule["output_required"] == ["observations", "candidate_findings", "explicit_non_gaps", "unknowns", "exact_evidence_refs"]
    total_bytes += row["capsule_package_bytes"]
    total_tokens += row["token_estimate"]
print(json.dumps({
    "audit_id": AUDIT_ID,
    "runner_id": RUNNER_ID,
    "validation_passed": True,
    "assignment_count": len(rows),
    "unique_assignment_ids": len(rows),
    "max_capsule_package_bytes": max(row["capsule_package_bytes"] for row in rows),
    "total_capsule_package_bytes": total_bytes,
    "total_token_estimate": total_tokens,
}, sort_keys=True))
