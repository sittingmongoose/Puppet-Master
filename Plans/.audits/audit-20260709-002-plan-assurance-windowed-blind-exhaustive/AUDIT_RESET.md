# TERMINAL RESET — SUPERSEDED_INVALID_AGENT_REUSE_FOR_ASSURANCE

Audit ID: `audit-20260709-002-plan-assurance-windowed-blind-exhaustive`  
Superseded by: `audit-20260709-003-plan-assurance-fresh-agent-windowed-blind-exhaustive`  
Superseded at: `2026-07-10T02:19:17Z`

This audit is terminally invalid for assurance because the same substantive reviewer identities were reused across multiple window/role assignments. All assignments, results, claims, observations, candidate findings, role completions, coverage counts, integrations, seams, research, scenarios, shadow-builder outputs, and mutations from this directory have **zero assurance credit** and must never seed the replacement audit's blind finding set.

Only mechanical path census, source hashes, and core-range window routing may be consulted as non-authoritative lineage, and only after independent revalidation in audit `003`. The active Goal continues unchanged.

Duplicate/recycled reviewer identities: `/root/window_worker_a, /root/window_worker_b, /root/window_worker_c`.  
Invalidated substantive assignments: `11`.  
Invalidated persisted results: `5`.

---

## Machine-readable reset summary

```json
{
  "coverage_carry_forward": "none",
  "duplicate_agent_identity_count": 3,
  "duplicate_agent_ids": [
    "/root/window_worker_a",
    "/root/window_worker_b",
    "/root/window_worker_c"
  ],
  "forbidden_reuse": [
    "assignments",
    "results",
    "claims",
    "observations",
    "candidate findings",
    "role completion",
    "coverage counts",
    "integrations",
    "seams",
    "research",
    "scenarios",
    "shadow builders",
    "mutations"
  ],
  "goal_continues_unchanged": true,
  "hard_reset": true,
  "interrupted_agent_ids": [
    "/root/window_worker_a",
    "/root/window_worker_b",
    "/root/window_worker_c"
  ],
  "invalid_for_assurance_coverage": true,
  "invalid_reason": "Substantive reviewer agent identities were reused across successive window/role assignments, violating the Fresh Agent Isolation Protocol.",
  "invalidated_persisted_result_count": 5,
  "invalidated_substantive_assignment_count": 11,
  "mechanical_lineage_reuse": "path census, hashes, and core-range manifest only, after independent source/hash/coverage revalidation",
  "new_audit_id": "audit-20260709-003-plan-assurance-fresh-agent-windowed-blind-exhaustive",
  "old_audit_id": "audit-20260709-002-plan-assurance-windowed-blind-exhaustive",
  "recycled_agent_count": 3,
  "status": "SUPERSEDED_INVALID_AGENT_REUSE_FOR_ASSURANCE",
  "substantive_coverage_credit": 0,
  "superseded_at": "2026-07-10T02:19:17Z",
  "superseded_by": "audit-20260709-003-plan-assurance-fresh-agent-windowed-blind-exhaustive",
  "unique_reviewer_agent_count": 3
}
```
