# Work Item w-20260312-203855 — Current State

## Status
`ready_for_planning` — Coverage Matrix Builder complete. transfer_coverage.json written (59 rows, 20 docs audited). Next stage: Reconciliation Planner.

## Identity
- work_id: w-20260312-203855
- run_prefix: r-20260312-203855
- run_id (current): r-20260312-203855-16
- next_run_seq: 17
- next_required_stage: Reconciliation Planner

## Coverage Matrix Summary (transfer_coverage.json)
- canon_items_total: 8
- coverage_rows_total: 59 (17 owner + 29 consumer + 13 stale_retirement)
- rows_present: 35
- rows_partial: 14
- rows_missing: 10
- owner_rows_missing: 1
- consumer_rows_missing: 6
- stale_retirement_rows_missing: 3
- docs_affected: 15

## Key Findings

### Resolved since open_gaps.json was written (no action needed)
Many items open_gaps.json listed as missing are NOW PRESENT in current Plans docs:
- Contracts_V0.md: `### 5.1B` at :471 — PRESENT
- orchestrator-subagent-integration.md: all 9 identity fields at :149-157 — PRESENT
- storage-plan.md: all 4 required headings (Required redb keys:243, Restart and stale history:1220, Cross-surface receipt record:253, Canonical records:240) — PRESENT
- Glossary.md: `### Orchestrator rewrite terms`:33 + `### Runtime and routing terms`:77 + full 7-field help-entry structure — PRESENT
- All previously-broken `Orchestrator_Page.md#11.` anchor refs updated to `#Source Control boundary` — valid

### Still requiring Reconciliation Planner action

**Owner rows needing action (1 missing, 2 partial):**
- cov-015: GitHub_Integration.md — `## Source Control boundary` heading MISSING (owner for canon-007)
- cov-002: Executor_Protocol.md — `### 5.1 Unified DispatchContext schema` exact heading unconfirmed (PARTIAL)
- cov-009: human-in-the-loop.md — `### Canonical HITL request contract` missing `escalation_level` (PARTIAL)

**Consumer rows needing action (6 missing, 7 partial):**
- cov-023: Wiring_Matrix.md — command normalization rows MISSING
- cov-025: GitHub_Integration.md — Source Control open routing section MISSING
- cov-030: Run_Graph_View.md — historical route identity packet MISSING (canon-003)
- cov-031: Contracts_V0.md — Authoritative EventRecord shape MISSING
- cov-040: usage-feature.md — help surfaces section MISSING
- cov-042: Run_Graph_View.md — historical route identity packet MISSING (canon-007, duplicate of cov-030 in different canon context)
- cov-004: UI_Command_Catalog.md — broken ContractRef at :179 (stale `#10.` anchor prefix)
- cov-020: interview-subagent-integration.md — `execution_unit_context` missing from Runtime identity visibility
- cov-027/cov-028: Project_Output_Artifacts.md / Runtime_Artifacts_Panel.md — exact heading form missing
- cov-037/cov-038: assistant-chat-design.md — blocked_notice payload missing action_available, escalation_level, report_ref, startup_recovered
- cov-043/cov-044: storage-plan.md / WorktreeGitImprovement.md — cross-refs only, no own Source Control boundary sections

**Stale retirement rows needing action (3 missing, 1 partial):**
- cov-048: Executor_Protocol.md — TierContext/tier_id still present (marked deprecated, not removed)
- cov-049: orchestrator-subagent-integration.md — TierContext:1717 + tier_id:6347 still present
- cov-050: Run_Graph_View.md — work_package_id? + feature_seam_id? in § 4 Data model (active use, not retirement docs)
- cov-053: Runtime_Artifacts_Panel.md — artifact_kind at :89 present in "not canonical" context (partial, needs clean removal)

## Locked decisions (carried forward)
- `execution_unit_context` replaces `TierContext` as the canonical context struct
- `run_id` + `node_id` replace `tier_id` as canonical identifiers
- `BeforeTierContext` → `BeforeUnitContext`; `AfterTierContext` → `AfterUnitContext`
- `blocked_notice` / `action_available` replace the `{ tool_name, invocation_summary, options }` ask-event tuple
- ContractRef correct anchor: `Plans/Orchestrator_Page.md#Source Control boundary` (no "§11." or "#10.")
- `credential_ref`, `execution_role`, `operational_identity` are required attribution fields in UsageRecord

## Next required stage
**Reconciliation Planner** — consume transfer_coverage.json (59 rows) to produce reconciliation_plan.json with precise rewrite targets for all partial/missing rows.
