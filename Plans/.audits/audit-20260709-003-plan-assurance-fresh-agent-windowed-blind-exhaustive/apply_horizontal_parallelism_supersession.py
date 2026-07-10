#!/usr/bin/env python3
"""Terminally supersede audit 003 for insufficient horizontal parallelism."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
OLD_ID = "audit-20260709-003-plan-assurance-fresh-agent-windowed-blind-exhaustive"
NEW_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
STATUS = "SUPERSEDED_INVALID_INSUFFICIENT_HORIZONTAL_PARALLELISM_FOR_THIS_ASSURANCE_RUN"
NOW = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
REASON = (
    "The three-subagent concurrency ceiling is insufficient for the required exhaustive 1,248-window assurance run; "
    "the successor will horizontally shard work across isolated top-level runner tasks."
)
INTERRUPTED = [
    "/root/fa003_w0002_exact_000003",
    "/root/fa003_w0002_adversarial_000004",
    "/root/fa003_w0003_exact_000005",
]
ALL_INVALID_AGENT_OUTPUTS = [
    "/root/fa003_w0001_exact_000001",
    "/root/fa003_w0001_adversarial_000002",
    "/root/fa003_w0002_exact_000003",
    "/root/fa003_w0002_adversarial_000004",
    "/root/fa003_w0003_exact_000005",
]


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.write_text(
        "\n".join(json.dumps(row, sort_keys=True, separators=(",", ":")) for row in rows) + "\n",
        encoding="utf-8",
    )


registry = load_jsonl(AUDIT / "fresh_agent_assignment_registry.jsonl")
assignments = [row for row in registry if row.get("record_type") == "substantive_assignment"]
results = [row for row in load_jsonl(AUDIT / "doc_window_results.jsonl") if row.get("record_type") == "window_result"]
terminal = {
    "status": STATUS,
    "superseded_by": NEW_ID,
    "superseded_at": NOW,
    "invalid_reason": REASON,
    "invalid_for_assurance_coverage": True,
    "substantive_coverage_credit": 0,
}

for path in sorted(AUDIT.glob("*.jsonl")):
    rows = load_jsonl(path)
    for row in rows:
        row.update(terminal)
        if path.name in {"doc_scope_manifest.jsonl", "doc_window_manifest.jsonl", "window_context_capsules.jsonl", "seam_findings.jsonl"}:
            row["quarantined_mechanical_routing_lineage_only"] = True
            row["requires_independent_revalidation_by_successor_master"] = True
        if row.get("record_type") in {
            "substantive_assignment", "window_assignment", "window_result", "assignment_ref",
            "document_integration_result", "research_evidence", "scenario", "interpretation_diff",
            "mutation", "finding", "frontier_pass",
        }:
            row["substantive_evidence_disposition"] = "invalid_never_carry_forward"
    write_jsonl(path, rows)

for directory in (AUDIT / "raw_window_results", AUDIT / "raw_assignment_results"):
    if not directory.exists():
        continue
    for path in sorted(directory.glob("*.json")):
        payload = json.loads(path.read_text(encoding="utf-8"))
        payload.update(terminal)
        payload["substantive_evidence_disposition"] = "invalid_never_carry_forward"
        path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")

summary = {
    **terminal,
    "old_audit_id": OLD_ID,
    "successor_id": NEW_ID,
    "successor_created_here": False,
    "active_goal_left_unmodified": True,
    "hard_architectural_supersession": True,
    "fresh_agent_isolation_method_retained_by_successor": True,
    "fresh_agent_isolation_work_not_criticized": True,
    "invalidated_registered_assignment_count": len(assignments),
    "invalidated_persisted_result_count": len(results),
    "invalidated_returned_or_active_agent_count": len(ALL_INVALID_AGENT_OUTPUTS),
    "invalidated_agent_ids": ALL_INVALID_AGENT_OUTPUTS,
    "interrupted_active_agent_ids": INTERRUPTED,
    "interrupted_unregistered_spawn": "/root/fa003_w0003_exact_000005",
    "valid_substantive_coverage": 0,
    "coverage_carry_forward": "none",
    "mechanical_lineage_reuse": (
        "only independently reproducible corpus census, source/core hashes, semantic window ranges, seam routing, "
        "and capsule construction after independent successor-master revalidation"
    ),
    "forbidden_reuse": [
        "review assignments", "review results", "claims", "observations", "candidate findings", "role completion",
        "coverage counts", "integrations", "seam conclusions", "research", "scenarios", "shadow builders", "mutations"
    ],
}

for name in ("coverage_report.json", "doc_window_coverage_report.json", "validator_results.json", "fresh_agent_isolation_report.json", "blind_candidate_freeze.json"):
    path = AUDIT / name
    if not path.exists():
        continue
    payload = json.loads(path.read_text(encoding="utf-8"))
    if name == "fresh_agent_isolation_report.json":
        payload["fresh_agent_protocol_was_mechanically_valid_before_architectural_supersession"] = payload.get("fresh_agent_isolation_passed") is True
    payload.update(summary)
    payload["complete"] = False
    payload["assurance_coverage_valid"] = False
    payload["valid_substantive_assignment_count"] = 0
    payload["valid_substantive_result_count"] = 0
    payload["valid_reviewed_window_count"] = 0
    payload["valid_integrated_document_count"] = 0
    payload["valid_seam_review_count"] = 0
    if name == "doc_window_coverage_report.json":
        payload["windows"]["contract_role_complete"] = 0
        payload["windows"]["adversarial_role_complete"] = 0
        payload["windows"]["both_required_roles_complete"] = 0
        payload["windows"]["unreviewed_authoritative"] = payload["windows"]["total_authoritative"]
        payload["unreviewed_window_count"] = payload["windows"]["total_authoritative"]
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")

notice = f"""# TERMINAL ARCHITECTURAL SUPERSESSION — {STATUS}

Audit ID: `{OLD_ID}`  
Successor ID: `{NEW_ID}`  
Superseded at: `{NOW}`

This audit is stopped and has **zero substantive assurance credit**. The three-subagent concurrency ceiling is insufficient for the exhaustive 1,248-window run, so the source task will launch the successor across multiple isolated top-level gpt-5.6-sol/ultra runner tasks. This is an architectural scaling decision, not a criticism of the fresh-agent isolation protocol.

All audit-003 assignments, returned or persisted results, claims, observations, candidate findings, role completions, coverage counts, integrations, seam conclusions, research, scenarios, shadow-builder outputs, and mutations are invalid and must never seed audit 004's blind set. Only independently reproducible corpus/window/hash/seam/capsule construction may survive as quarantined routing lineage, and only after independent revalidation by the successor master coordinator.

Interrupted active agents: `{', '.join(INTERRUPTED)}`. No replacements were dispatched. Audit 004 was not created here. The active Goal was not completed, blocked, or otherwise modified.

---

"""

for name in ("AUDIT_REPORT.md", "FINAL_REPORT.md", "CHECKPOINT.md", "AUDIT_CHARTER.md", "RESET_LINEAGE.md"):
    path = AUDIT / name
    previous = path.read_text(encoding="utf-8") if path.exists() else ""
    if not previous.startswith("# TERMINAL ARCHITECTURAL SUPERSESSION"):
        path.write_text(notice + previous, encoding="utf-8")

(AUDIT / "AUDIT_RESET.md").write_text(
    notice + "## Machine-readable supersession summary\n\n```json\n" + json.dumps(summary, indent=2, sort_keys=True) + "\n```\n",
    encoding="utf-8",
)

print(json.dumps(summary, sort_keys=True))
