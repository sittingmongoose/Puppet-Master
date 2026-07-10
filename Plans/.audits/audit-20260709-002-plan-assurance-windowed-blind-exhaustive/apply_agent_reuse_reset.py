#!/usr/bin/env python3
"""Terminally invalidate audit 002 after cross-assignment agent reuse was detected."""

from __future__ import annotations

import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
OLD_ID = "audit-20260709-002-plan-assurance-windowed-blind-exhaustive"
NEW_ID = "audit-20260709-003-plan-assurance-fresh-agent-windowed-blind-exhaustive"
STATUS = "SUPERSEDED_INVALID_AGENT_REUSE_FOR_ASSURANCE"
NOW = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
REASON = (
    "Substantive reviewer agent identities were reused across successive window/role assignments, "
    "violating the Fresh Agent Isolation Protocol."
)


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.write_text(
        "\n".join(json.dumps(row, sort_keys=True, separators=(",", ":")) for row in rows) + "\n",
        encoding="utf-8",
    )


assignment_path = AUDIT / "doc_window_assignments.jsonl"
result_path = AUDIT / "doc_window_results.jsonl"
assignments = load_jsonl(assignment_path)
results = load_jsonl(result_path)
assignment_rows = [row for row in assignments if row.get("record_type") == "window_assignment"]
result_rows = [row for row in results if row.get("record_type") == "window_result"]
agent_counts = Counter(row.get("agent_id") for row in assignment_rows)
duplicate_agents = sorted(agent for agent, count in agent_counts.items() if agent and count > 1)

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
        if path.name in {"doc_scope_manifest.jsonl", "doc_window_manifest.jsonl", "window_context_capsules.jsonl"}:
            row["mechanical_routing_lineage_only"] = True
            row["requires_independent_revalidation_before_reuse"] = True
        if row.get("record_type") in {
            "window_assignment", "window_result", "document_integration_result", "seam_finding",
            "research_evidence", "scenario", "interpretation_diff", "mutation", "finding",
        }:
            row["substantive_evidence_disposition"] = "invalid_never_carry_forward"
    write_jsonl(path, rows)

raw_dir = AUDIT / "raw_window_results"
if raw_dir.exists():
    for path in sorted(raw_dir.glob("*.json")):
        payload = json.loads(path.read_text(encoding="utf-8"))
        payload.update(terminal)
        payload["substantive_evidence_disposition"] = "invalid_never_carry_forward"
        path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")

reset_summary = {
    **terminal,
    "old_audit_id": OLD_ID,
    "new_audit_id": NEW_ID,
    "hard_reset": True,
    "goal_continues_unchanged": True,
    "invalidated_substantive_assignment_count": len(assignment_rows),
    "invalidated_persisted_result_count": len(result_rows),
    "unique_reviewer_agent_count": len(agent_counts),
    "duplicate_agent_identity_count": len(duplicate_agents),
    "recycled_agent_count": len(duplicate_agents),
    "duplicate_agent_ids": duplicate_agents,
    "interrupted_agent_ids": [
        "/root/window_worker_a", "/root/window_worker_b", "/root/window_worker_c"
    ],
    "coverage_carry_forward": "none",
    "mechanical_lineage_reuse": (
        "path census, hashes, and core-range manifest only, after independent source/hash/coverage revalidation"
    ),
    "forbidden_reuse": [
        "assignments", "results", "claims", "observations", "candidate findings", "role completion",
        "coverage counts", "integrations", "seams", "research", "scenarios", "shadow builders", "mutations"
    ],
}

for name in ("coverage_report.json", "doc_window_coverage_report.json", "validator_results.json"):
    path = AUDIT / name
    if not path.exists():
        continue
    payload = json.loads(path.read_text(encoding="utf-8"))
    payload.update(reset_summary)
    payload["complete"] = False
    payload["assurance_coverage_valid"] = False
    payload["valid_substantive_assignment_count"] = 0
    payload["valid_substantive_result_count"] = 0
    payload["valid_reviewed_window_count"] = 0
    payload["valid_integrated_document_count"] = 0
    payload["valid_seam_review_count"] = 0
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")

notice = f"""# TERMINAL RESET — {STATUS}

Audit ID: `{OLD_ID}`  
Superseded by: `{NEW_ID}`  
Superseded at: `{NOW}`

This audit is terminally invalid for assurance because the same substantive reviewer identities were reused across multiple window/role assignments. All assignments, results, claims, observations, candidate findings, role completions, coverage counts, integrations, seams, research, scenarios, shadow-builder outputs, and mutations from this directory have **zero assurance credit** and must never seed the replacement audit's blind finding set.

Only mechanical path census, source hashes, and core-range window routing may be consulted as non-authoritative lineage, and only after independent revalidation in audit `003`. The active Goal continues unchanged.

Duplicate/recycled reviewer identities: `{', '.join(duplicate_agents)}`.  
Invalidated substantive assignments: `{len(assignment_rows)}`.  
Invalidated persisted results: `{len(result_rows)}`.

---

"""

for name in ("AUDIT_REPORT.md", "FINAL_REPORT.md", "CHECKPOINT.md", "AUDIT_CHARTER.md", "RESET_LINEAGE.md"):
    path = AUDIT / name
    previous = path.read_text(encoding="utf-8") if path.exists() else ""
    if not previous.startswith("# TERMINAL RESET — SUPERSEDED_INVALID_AGENT_REUSE_FOR_ASSURANCE"):
        path.write_text(notice + previous, encoding="utf-8")

(AUDIT / "AUDIT_RESET.md").write_text(
    notice
    + "## Machine-readable reset summary\n\n"
    + "```json\n"
    + json.dumps(reset_summary, indent=2, sort_keys=True)
    + "\n```\n",
    encoding="utf-8",
)

print(json.dumps(reset_summary, sort_keys=True))
