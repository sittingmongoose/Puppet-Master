# Freeze currentness — closed-world census

**Generated:** 2026-08-12T10:34:29Z  
**Freeze artifact:** `closed-world-census/CURRENT_SOURCE_INVENTORY.json`  
**Denominator:** `closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json`

## Digest pin

| Field | Value |
|---|---|
| `frozen_at_utc` | `2026-08-12T03:59:43Z` |
| inventory `canonical_digest_sha256` | `b93ef8493d91b69beefbcfc9498e72fc01af9cabbbcd9259e684f3c15e540d56` |
| denominator `freeze_digest_sha256` | `b93ef8493d91b69beefbcfc9498e72fc01af9cabbbcd9259e684f3c15e540d56` |
| Match | **yes** |
| `closed` | **false** (correct; do not seal) |

**Ledger bucket split** (IndividualDisposition; see `denominator/FRESH_CENSUS_DENOMINATOR.json` `persistence_open_not_admitted`): unresolved **54** (`28` owner-veto + `26` evidence-gap); alias **12** outside unresolved; admitted working count **255** with `event_types=null`.

This report does **not** rewrite the freeze or restamp hashes.

## Inventory membership

180 members, all present on disk (0 missing):

| `source_class` | Count |
|---|---:|
| `canonical_product_prose` | 72 |
| `canonical_machine_schema` | 83 |
| `canonical_machine_registry_or_contract` | 25 |

Live SHA-256 + byte length vs frozen record: **170 match**, **10 drift**.

## Drifted sources (post `frozen_at_utc`)

**Drift census pass:** `2026-08-12T10:34:29Z` — live SHA-256 + byte length recomputed for all 10 drift paths; extract artifacts in `closed-world-census/extract/` (`EXTRACT_SUMMARY.json` `drift_census_pass`, `extract/drift_sources/*.json`). Contract triple-bound / md-binding sets unchanged vs frozen git baseline; full-file lexical delta: **4** new tokens, **231** removed (Wiring_Matrix shrink), **567** line-context shifts. No admission inference (`CENSUS_ADMISSION_RULE_V2`).

A fresh denominator seal still requires owner adjudication beyond this census pass. `closed=false` remains correct.

| Path | Frozen bytes | Live bytes | Frozen SHA-256 | Live SHA-256 |
|---|---:|---:|---|---|
| `Plans/00-plans-index.md` | 345233 | 347882 | `e0358f4d0c5cdce2cbbac0fdef1e70a80ba910ff84c72d999f77c9fc01893eb2` | `ec69685c8f1c769879100ef8c305c390184659630b1a4bcab0b7fb941d9ba06e` |
| `Plans/Automated_Testing_System.md` | 239947 | 242190 | `e31f410d13c34109b0e8f74e9a342035c71d0ced1bf04c8c8ac6a087851b96b3` | `cbf113bc3497116549e38ee16407505136466fca3596837cc3acbcfddb699533` |
| `Plans/FileManager.md` | 281604 | 282208 | `e2ab56c877541e4bfaf3c69fab1ecfe81fa4ad96e5f0f032c68a8b309a8f3694` | `75c16d913e9410c6988a1e4d67c8bd9a03bf60216e0640aea83d5c0db65109bd` |
| `Plans/FinalGUISpec.md` | 1674036 | 1683845 | `62b38f0b20ec5ffd6300105382188f64d70f5c26b8a41eb6761addafbf8d9360` | `dc51354b20dad6d8cf56051b7dcb649ab91d723ecfcf4a9dbbb2ab8a74341032` |
| `Plans/GUI_Rebuild_Requirements_Checklist.md` | 107509 | 108520 | `171f065b11ff22f97b3cfe1bf884d75b4048fc9656fc91306f25e9da5f8735ab` | `706621f63d64d09122cea29208ce19c805002d89aee23ebc15df994033a763ca` |
| `Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json` | 10406 | 12102 | `643366a5e2dc8073623ccccea4113884bcf1f4a5c5b24f4a28aca9d9fe0a661b` | `7d115787cf9b3595efce910f194bfb1a6ebd77b32592d4052b70d6b0154a2551` |
| `Plans/UI_Command_Catalog.md` | 663531 | 664425 | `675341194e15f562897bd18f552ac6582a1198cc4095730f8d4ab219e0c87b88` | `fadca8b6579e67ee7a7c91df171fa823c2aef41d4129be8e22b873ff2673cae4` |
| `Plans/UI_Wiring_Rules.md` | 46149 | 46439 | `87574f03b1957e88172a9a9d809b1bbeba5ddc0561f49e6d6adfc64d407a0626` | `a079b3c2ecfa46c779a6fd8f4516899d091a012c379c6ce3bdda5bc4b1bf67fb` |
| `Plans/Widget_System.md` | 58640 | 59534 | `35371c337f13a7a43e31da7b629f9e2405fad713d188bb87915ab577078ea72d` | `4c3b870ad93bb8af380bcc86e47e6857f8f71946e59e620c00b51dc0d66d44ad` |
| `Plans/Wiring_Matrix.production.json` | 3304568 | 2954976 | `42ff981beb8d456f0a442d1f2ec49134d389744fe6ec3a85a1d1db1a0b7828a7` | `f9942023b0bc2bd32216652d80eaf762c38bec8d1f8ca6a166c68231fa0b5341` |

`Plans/Wiring_Matrix.production.json` shrank (3304568 → 2954976 bytes). Do not treat that as a freeze restamp.

## Complete inventory members

Every frozen member path, grouped by `source_class`, marked `unchanged` or `DRIFT` against live SHA-256 + bytes. Hashes for drifted rows are in the table above; this list is the explicit 180-member enumeration.

### Canonical product prose (`canonical_product_prose`) — 64 unchanged / 8 DRIFT / 72 total

- `Plans/00-plans-index.md` — DRIFT
- `Plans/Architecture_Invariants.md` — unchanged
- `Plans/Automated_Testing_System.md` — DRIFT
- `Plans/BinaryLocator_Spec.md` — unchanged
- `Plans/Bootstrap_Planning_Migration.md` — unchanged
- `Plans/CLI_Bridged_Providers.md` — unchanged
- `Plans/Commands_System.md` — unchanged
- `Plans/Containers_Registry_and_Unraid.md` — unchanged
- `Plans/Contracts_V0.md` — unchanged
- `Plans/Crosswalk.md` — unchanged
- `Plans/DRY_Rules.md` — unchanged
- `Plans/Decision_Log.md` — unchanged
- `Plans/Decision_Policy.md` — unchanged
- `Plans/Document_Packaging_Policy.md` — unchanged
- `Plans/Executor_Protocol.md` — unchanged
- `Plans/FileManager.md` — DRIFT
- `Plans/FileSafe.md` — unchanged
- `Plans/FinalGUISpec.md` — DRIFT
- `Plans/Formatters_System.md` — unchanged
- `Plans/GUI_Rebuild_Requirements_Checklist.md` — DRIFT
- `Plans/GitHub_API_Auth_and_Flows.md` — unchanged
- `Plans/GitHub_Integration.md` — unchanged
- `Plans/Glossary.md` — unchanged
- `Plans/Goal_Runtime_System.md` — unchanged
- `Plans/LSPSupport.md` — unchanged
- `Plans/MCP_Integration.md` — unchanged
- `Plans/Media_Generation_and_Capabilities.md` — unchanged
- `Plans/MiscPlan.md` — unchanged
- `Plans/Models_System.md` — unchanged
- `Plans/Multi-Account.md` — unchanged
- `Plans/OpenCode_Coverage_Matrix.md` — unchanged
- `Plans/OpenCode_Deep_Extraction.md` — unchanged
- `Plans/Orchestrator_Page.md` — unchanged
- `Plans/PRD_Builder.md` — unchanged
- `Plans/Permissions_System.md` — unchanged
- `Plans/Personas.md` — unchanged
- `Plans/Plan_Document_System.md` — unchanged
- `Plans/Plan_To_Node_Compilation.md` — unchanged
- `Plans/Planning_Ledger_System.md` — unchanged
- `Plans/Planning_Wizard.md` — unchanged
- `Plans/Plugins_System.md` — unchanged
- `Plans/Progression_Gates.md` — unchanged
- `Plans/Project_Output_Artifacts.md` — unchanged
- `Plans/Prompt_Pipeline.md` — unchanged
- `Plans/Provider_OpenCode.md` — unchanged
- `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` — unchanged
- `Plans/Release_Supply_Chain.md` — unchanged
- `Plans/Run_Graph_View.md` — unchanged
- `Plans/Run_Modes.md` — unchanged
- `Plans/Runtime_Artifacts_Panel.md` — unchanged
- `Plans/Section15_MVP_Promoted_Features_Spec.md` — unchanged
- `Plans/Skills_System.md` — unchanged
- `Plans/Tools.md` — unchanged
- `Plans/UI_Command_Catalog.md` — DRIFT
- `Plans/UI_Wiring_Rules.md` — DRIFT
- `Plans/Widget_System.md` — DRIFT
- `Plans/Wiring_Matrix.md` — unchanged
- `Plans/WorktreeGitImprovement.md` — unchanged
- `Plans/agent-rules-context.md` — unchanged
- `Plans/assistant-chat-design.md` — unchanged
- `Plans/assistant-memory-subsystem.md` — unchanged
- `Plans/chain-wizard-flexibility.md` — unchanged
- `Plans/chain-wizard.md` — unchanged
- `Plans/feature-list.md` — unchanged
- `Plans/human-in-the-loop.md` — unchanged
- `Plans/interview-subagent-integration.md` — unchanged
- `Plans/newfeatures.md` — unchanged
- `Plans/newtools.md` — unchanged
- `Plans/orchestrator-subagent-integration.md` — unchanged
- `Plans/rewrite-tie-in-memo.md` — unchanged
- `Plans/storage-plan.md` — unchanged
- `Plans/usage-feature.md` — unchanged

### Canonical machine schema (`canonical_machine_schema`) — 83 unchanged / 0 DRIFT / 83 total

- `Plans/.implementation_readiness/non_executable_closure_evidence.schema.json` — unchanged
- `Plans/.implementation_readiness/pnc019_certification_receipt.schema.json` — unchanged
- `Plans/Wiring_Matrix.schema.json` — unchanged
- `Plans/acceptance_manifest.schema.json` — unchanged
- `Plans/auto_decisions.schema.json` — unchanged
- `Plans/change_budget.schema.json` — unchanged
- `Plans/contracts_index.schema.json` — unchanged
- `Plans/event_family_registry.schema.json` — unchanged
- `Plans/event_payload_platform_capability_evaluated.schema.json` — unchanged
- `Plans/event_payload_restore_point_corrupt.schema.json` — unchanged
- `Plans/event_payload_run_started.schema.json` — unchanged
- `Plans/event_payload_safe_point_recovery_unavailable.schema.json` — unchanged
- `Plans/event_payload_storage_boot_recovery.schema.json` — unchanged
- `Plans/event_payload_storage_integrity_detected.schema.json` — unchanged
- `Plans/event_payload_storage_recovery_applied.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_blocked.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_cancelled.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_child_status_changed.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_completed.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_created.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_degraded.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_evidence_captured.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_progressed.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_receipt_recorded.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_replanned.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_run_blocked.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_run_cancelled.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_run_certified.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_run_replanned.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_run_started.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_run_stopped.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_scheduled.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_stopped.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_tool_check_recorded.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_updated.schema.json` — unchanged
- `Plans/event_payloads/goal_runtime/goal_verification_decided.schema.json` — unchanged
- `Plans/event_payloads/terminal_workgroup_moved.schema.json` — unchanged
- `Plans/event_payloads/workspace_layout_changed.schema.json` — unchanged
- `Plans/event_record.schema.json` — unchanged
- `Plans/evidence.schema.json` — unchanged
- `Plans/execution_unit_context.schema.json` — unchanged
- `Plans/goal_runtime_events.schema.json` — unchanged
- `Plans/gui_automation_manifest.schema.json` — unchanged
- `Plans/home_workspace_layout.schema.json` — unchanged
- `Plans/ledgers/v2/schemas/plan_unit.schema.json` — unchanged
- `Plans/path_reference_registry.schema.json` — unchanged
- `Plans/plan_graph.schema.json` — unchanged
- `Plans/plans_to_code_handoff.schema.json` — unchanged
- `Plans/platform_capability_catalog.schema.json` — unchanged
- `Plans/prd_planning_runtime_contracts.schema.json` — unchanged
- `Plans/project_plan_graph_index.schema.json` — unchanged
- `Plans/project_plan_node.schema.json` — unchanged
- `Plans/requested_effective_runtime.schema.json` — unchanged
- `Plans/requirements_coverage.schema.json` — unchanged
- `Plans/requirements_quality_report.schema.json` — unchanged
- `Plans/runtime_artifact_api_web_call.schema.json` — unchanged
- `Plans/runtime_artifact_artifact_version.schema.json` — unchanged
- `Plans/runtime_artifact_before_after_snapshot.schema.json` — unchanged
- `Plans/runtime_artifact_browser_recording.schema.json` — unchanged
- `Plans/runtime_artifact_code_diff.schema.json` — unchanged
- `Plans/runtime_artifact_context_snapshot.schema.json` — unchanged
- `Plans/runtime_artifact_cost_usage.schema.json` — unchanged
- `Plans/runtime_artifact_document.schema.json` — unchanged
- `Plans/runtime_artifact_envelope.schema.json` — unchanged
- `Plans/runtime_artifact_evidence.schema.json` — unchanged
- `Plans/runtime_artifact_failed_attempts.schema.json` — unchanged
- `Plans/runtime_artifact_hitl_approval.schema.json` — unchanged
- `Plans/runtime_artifact_implementation_plan.schema.json` — unchanged
- `Plans/runtime_artifact_reasoning_summary.schema.json` — unchanged
- `Plans/runtime_artifact_restore_point.schema.json` — unchanged
- `Plans/runtime_artifact_screenshot.schema.json` — unchanged
- `Plans/runtime_artifact_subagent_lineage.schema.json` — unchanged
- `Plans/runtime_artifact_suggested_next_steps.schema.json` — unchanged
- `Plans/runtime_artifact_tool_llm_trace.schema.json` — unchanged
- `Plans/runtime_artifact_validation_test.schema.json` — unchanged
- `Plans/settings_inventory.schema.json` — unchanged
- `Plans/storage_recovery_contracts.schema.json` — unchanged
- `Plans/storage_value_registry.schema.json` — unchanged
- `Plans/test_strategy.schema.json` — unchanged
- `Plans/web_capability_findings_coverage.schema.json` — unchanged
- `Plans/web_capability_source_packet_receipt.schema.json` — unchanged
- `Plans/web_operation_contracts.schema.json` — unchanged
- `Plans/web_policy_negative_fixtures.schema.json` — unchanged

### Canonical machine registry or contract (`canonical_machine_registry_or_contract`) — 23 unchanged / 2 DRIFT / 25 total

- `Plans/.implementation_readiness/non_executable_closure_evidence.json` — unchanged
- `Plans/.implementation_readiness/pnc019_certification_receipt.json` — unchanged
- `Plans/.implementation_readiness/readiness_blockers.jsonl` — unchanged
- `Plans/.implementation_readiness/readiness_matrix.json` — unchanged
- `Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json` — DRIFT
- `Plans/PMConcept_Control_Reconciliation.json` — unchanged
- `Plans/Wiring_Matrix.production.exclusions.json` — unchanged
- `Plans/Wiring_Matrix.production.json` — DRIFT
- `Plans/event_family_registry.json` — unchanged
- `Plans/ledgers/v2/ledger_registry.json` — unchanged
- `Plans/path_reference_registry.json` — unchanged
- `Plans/platform_capability_catalog.json` — unchanged
- `Plans/prd_planning_runtime_contracts.json` — unchanged
- `Plans/settings_inventory.json` — unchanged
- `Plans/storage_value_registry.json` — unchanged
- `Plans/web_agent_policy_fixtures.json` — unchanged
- `Plans/web_capability_findings_coverage.json` — unchanged
- `Plans/web_capability_source_packet_receipt.json` — unchanged
- `Plans/web_intent_routing_fixtures.json` — unchanged
- `Plans/web_operation_card_fixtures.json` — unchanged
- `Plans/web_operation_job_fixtures.json` — unchanged
- `Plans/web_policy_negative_fixtures.json` — unchanged
- `Plans/web_provider_adapter_registry.seed.json` — unchanged
- `Plans/web_provider_projection_fixtures.json` — unchanged
- `Plans/web_research_run_fixtures.json` — unchanged

Class totals from live SHA-256+bytes vs freeze: prose **64 unchanged / 8 DRIFT**; schema **83 unchanged / 0 DRIFT**; registry-or-contract **23 unchanged / 2 DRIFT**. (A prior scout split of 63/9 prose counted `Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json` as prose; inventory `source_class` places that JSON in registry-or-contract, which is why registry-or-contract is 23/2 rather than 24/1.)
## Non-claims

- Does not close the denominator.
- Does not authorize PNC-019.
- Does not restamp `canonical_digest_sha256`.
- Direct `Plans/*.md` membership is still the frozen 72 prose sources; drift is content, not membership drop.