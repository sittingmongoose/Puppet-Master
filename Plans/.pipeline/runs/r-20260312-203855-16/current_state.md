# Work Item w-20260312-203855 — Current State

## Status
`reconciliation_plan_ready` — reconciliation_plan.json v4.1 written (subagent-validated, 7 parallel agents); ready for Packet Builder.

## Identity
- work_id: w-20260312-203855
- run_prefix: r-20260312-203855
- run_id (last completed): r-20260312-203855-15 (fidelity_blocked)
- run_id (next): r-20260312-203855-16
- next_required_stage: Packet Builder

## What happened in run-15
Fidelity audit (5 parallel subagents) confirmed **7 live fidelity gaps** across 4 docs.  
Ledger fidelity report written: `Plans/.pipeline/ledger_fidelity_report.txt` (312 lines).

| Gap ID  | Doc                                | Gap description                                         |
|---------|------------------------------------|---------------------------------------------------------|
| FG-001-A | orchestrator-subagent-integration.md | TierContext 32x doc-wide (outside §Subagent Selector) |
| FG-001-B | orchestrator-subagent-integration.md | tier_id 68x doc-wide (outside §Subagent Selector)     |
| FG-005-A | Tools.md                          | Stale { tool_name, invocation_summary, options } tuple at §10.7 line 1104 |
| FG-007-A | WorktreeGitImprovement.md         | Stale ContractRef at line 611 (old anchor with §11.)   |
| FG-008-A | usage-feature.md                  | credential_ref absent from §Unified UsageRecord schema |
| FG-008-B | usage-feature.md                  | execution_role absent from §Unified UsageRecord schema |
| FG-008-C | usage-feature.md                  | operational_identity absent from §Unified UsageRecord schema |

Root cause: run-15 targets were narrowly scoped; stale residue outside target spans not covered.

## Reconciliation plan v4
Written at: `Plans/.pipeline/work_items/w-20260312-203855/reconciliation_plan.json`  
Schema: pm.reconciliation_plan.v4.1 (subagent-validated)  
18 targets; 6 full_owner_container, 12 exact_owner_section.  
7 parallel subagents confirmed section mappings, replace_scope, forbidden string forms for all targets.  
Key upgrades from v4→v4.1: targets 028/031/034/035/038 upgraded to full_owner_container; BeforeTierContext/AfterTierContext added to forbidden_strings in 028/029/031; to_tier_id confirmed in 034/035; TierContext struct param confirmed in 038; blocked_sequence/approval_scope_key added to survivors in 040; insertion point confirmed for 042.
- Schema: `pm.reconciliation_plan.v4`
- Mutation targets: 18 (target-025 through target-042)
- Docs affected: 4
- Full coverage map:
  - orchestrator-subagent-integration.md: 15 section-cluster targets (025–039) covering all 99 stale TierContext/tier_id occurrences
  - Tools.md: 1 target (040) — §10.7 ask-flow runner tuple
  - WorktreeGitImprovement.md: 1 target (041) — ContractRef stale anchor at line 611
  - usage-feature.md: 1 target (042) — add credential_ref / execution_role / operational_identity to §Unified UsageRecord schema

## Locked decisions
- execution_unit_context replaces TierContext as the canonical context struct
- run_id + node_id replace tier_id as canonical identifiers
- BeforeTierContext → BeforeUnitContext; AfterTierContext → AfterUnitContext
- blocked_notice / action_available replace the { tool_name, invocation_summary, options } ask-event tuple
- ContractRef correct anchor: Plans/Orchestrator_Page.md#Source Control boundary (no "11.")
- credential_ref, execution_role, operational_identity are required attribution fields in UsageRecord

## Planning blockers
None (planning_blockers = 0 confirmed from open_gaps.json).

## Next required stage
Packet Builder — consume reconciliation_plan.json v4, emit research_packet.json for run-16.
