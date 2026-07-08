# Remaining Action Plan Repair

Generated: 2026-07-08T01:24:48Z

## Scope

This pass processed all non-runtime rows from `fable_remaining_action_plan.jsonl` and left PNC-019 runtime/clean-room certification currentness out of scope. It creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

## Result

- Non-runtime rows processed: 216
- Runtime/PNC-019 rows excluded: 2
- duplicate_of_closed_row: 3
- explicitly_deferred: 35
- not_for_plan: 5
- repaired: 168
- repaired_superseded: 3
- source_lineage_only: 1
- stale_retired: 1

## Repairs By Doc

- `Plans/Architecture_Invariants.md`: 3 owner-note rows
- `Plans/Automated_Testing_System.md`: 3 owner-note rows
- `Plans/BinaryLocator_Spec.md`: 3 owner-note rows
- `Plans/Bootstrap_Planning_Migration.md`: 1 owner-note rows
- `Plans/Commands_System.md`: 3 owner-note rows
- `Plans/Containers_Registry_and_Unraid.md`: 3 owner-note rows
- `Plans/Contracts_V0.md`: 5 owner-note rows
- `Plans/Crosswalk.md`: 2 owner-note rows
- `Plans/DRY_Rules.md`: 1 owner-note rows
- `Plans/Decision_Log.md`: 2 owner-note rows
- `Plans/Decision_Policy.md`: 3 owner-note rows
- `Plans/Document_Packaging_Policy.md`: 2 owner-note rows
- `Plans/Executor_Protocol.md`: 3 owner-note rows
- `Plans/FileManager.md`: 4 owner-note rows
- `Plans/FileSafe.md`: 1 owner-note rows
- `Plans/FinalGUISpec.md`: 11 owner-note rows
- `Plans/Formatters_System.md`: 1 owner-note rows
- `Plans/GUI_Rebuild_Requirements_Checklist.md`: 2 owner-note rows
- `Plans/GitHub_Integration.md`: 4 owner-note rows
- `Plans/Glossary.md`: 1 owner-note rows
- `Plans/Goal_Runtime_System.md`: 2 owner-note rows
- `Plans/LSPSupport.md`: 4 owner-note rows
- `Plans/Media_Generation_and_Capabilities.md`: 10 owner-note rows
- `Plans/MiscPlan.md`: 6 owner-note rows
- `Plans/Multi-Account.md`: 1 owner-note rows
- `Plans/OpenCode_Coverage_Matrix.md`: 1 owner-note rows
- `Plans/OpenCode_Deep_Extraction.md`: 2 owner-note rows
- `Plans/Orchestrator_Page.md`: 5 owner-note rows
- `Plans/Permissions_System.md`: 12 owner-note rows
- `Plans/Personas.md`: 3 owner-note rows
- `Plans/Plan_Document_System.md`: 3 owner-note rows
- `Plans/Planning_Wizard.md`: 4 owner-note rows
- `Plans/Progression_Gates.md`: 1 owner-note rows
- `Plans/Prompt_Pipeline.md`: 3 owner-note rows
- `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`: 3 owner-note rows
- `Plans/Release_Supply_Chain.md`: 4 owner-note rows
- `Plans/Run_Graph_View.md`: 2 owner-note rows
- `Plans/Run_Modes.md`: 2 owner-note rows
- `Plans/Runtime_Artifacts_Panel.md`: 3 owner-note rows
- `Plans/Section15_MVP_Promoted_Features_Spec.md`: 9 owner-note rows
- `Plans/Skills_System.md`: 2 owner-note rows
- `Plans/Tools.md`: 11 owner-note rows
- `Plans/UI_Command_Catalog.md`: 1 owner-note rows
- `Plans/UI_Wiring_Rules.md`: 1 owner-note rows
- `Plans/Widget_System.md`: 4 owner-note rows
- `Plans/WorktreeGitImprovement.md`: 3 owner-note rows
- `Plans/agent-rules-context.md`: 2 owner-note rows
- `Plans/assistant-chat-design.md`: 3 owner-note rows
- `Plans/assistant-memory-subsystem.md`: 2 owner-note rows
- `Plans/chain-wizard-flexibility.md`: 1 owner-note rows
- `Plans/feature-list.md`: 1 owner-note rows
- `Plans/human-in-the-loop.md`: 3 owner-note rows
- `Plans/interview-subagent-integration.md`: 5 owner-note rows
- `Plans/newfeatures.md`: 2 owner-note rows
- `Plans/newtools.md`: 10 owner-note rows
- `Plans/orchestrator-subagent-integration.md`: 14 owner-note rows
- `Plans/rewrite-tie-in-memo.md`: 1 owner-note rows
- `Plans/storage-plan.md`: 3 owner-note rows
- `Plans/usage-feature.md`: 5 owner-note rows

## Blocked Decisions

No non-runtime row required a remaining Jared product decision after conservative owner-doc adjudication. Rows that would require schema/runtime scope outside this lane are explicitly deferred with reopen conditions instead of being over-claimed.

## Remaining PNC-019 Rows

- `fable-20260706-report-l0548-critical-l506-510-registry-itself-states-buildability-gate-passed-false-e29bd955`: - [CRITICAL] L506,510: registry itself states `buildability_gate_passed=false` for most non-Tier-0 families while other sections list them as "required" FIX: scope any READY claim to only the 10 materialized Tier-0 ro...
- `Plans/.implementation_readiness::{IRB-005,IRB-011}`: Current buildability gate remains blocked by IRB-005 runtime_lifecycle and IRB-011 clean_room_harness with node_readiness_status=blocked_runtime_certification_incomplete.

## Validator Results

Recorded: 2026-07-08T01:34:16Z

- `python3 scripts/pm-audit-closure.py validate`: pass
- `python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status`: pass
- `python3 scripts/pm-plans-verify.py verify-spec-lock`: pass
- `python3 scripts/pm-plan-index.py validate`: pass
- `python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits`: pass
- `python3 scripts/pm-plans-verify.py validate-implementation-readiness`: pass
- `python3 scripts/pm-plans-verify.py validate-wiring-matrix`: pass
- `python3 scripts/pm-plans-verify.py lint-contractrefs`: pass
- `python3 scripts/pm-plans-verify.py validate-auto-decisions`: pass
- `python3 scripts/pm-plans-verify.py validate-evidence`: pass
- `python3 scripts/pm-shard-plans.py --check`: pass
- `python3 scripts/pm-plans-verify.py run-gates --subcheck-timeout-seconds 60`: pass
- `git diff --check`: pass

## PNC-019 Boundary Check

- `buildability_gate_passed`: false
- `open_blocker_count`: 2
- `node_readiness_status`: `blocked_runtime_certification_incomplete`
- `runtime_blocked_by_ref`: `PNC-019`
- `runtime_enabled`: false
- `ordinary_product_worknodes_allowed`: false
- `executable_lifecycle_certification_complete`: false
- `no_worknodes_created`: true
- `nodeseed_candidates_created`: false
