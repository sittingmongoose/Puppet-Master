# Shard 007: Shard indexes

Source: `Plans/00-plans-index.md`

Source lines: L490-L568

Source SHA256: `0874c6f5dec90701985009c004a2762946ca2df488ff19be8c81d84c9ea3d905`

---

## Shard indexes

Agent-friendly shards for long plan docs. Regenerate with `python3 scripts/pm-shard-plans.py --generate` and verify with `python3 scripts/pm-shard-plans.py --check`; `Plans/_shards/**` and `Plans/.evidence/**` remain regen-only after canonical doc edits, with evidence outputs regenerated/validated as applicable; do not hand-edit them during packetization or any transfer work. Post-edit validation/checks remain required after actual packet doc edits, including packet validation / gates as appropriate. `Plans/Spec_Lock.json` is validated through its locked protocol with `python3 scripts/pm-plans-verify.py verify-spec-lock`, and `Plans/auto_decisions.jsonl` is deterministic-log managed; stale `packet-decision` references are source-lineage only, not live packet doc intents.

| Source doc | Shard index |
| --- | --- |
| `orchestrator-subagent-integration.md` | [`Plans/_shards/orchestrator-subagent-integration/00-index.md`](Plans/_shards/orchestrator-subagent-integration/00-index.md) |
| `FinalGUISpec.md` | [`Plans/_shards/finalguispec/00-index.md`](Plans/_shards/finalguispec/00-index.md) |
| `interview-subagent-integration.md` | [`Plans/_shards/interview-subagent-integration/00-index.md`](Plans/_shards/interview-subagent-integration/00-index.md) |
| `newtools.md` | [`Plans/_shards/newtools/00-index.md`](Plans/_shards/newtools/00-index.md) |
| `rewrite-tie-in-memo.md` | [`Plans/_shards/rewrite-tie-in-memo/00-index.md`](Plans/_shards/rewrite-tie-in-memo/00-index.md) |
| `agent-rules-context.md` | [`Plans/_shards/agent-rules-context/00-index.md`](Plans/_shards/agent-rules-context/00-index.md) |
| `OpenCode_Deep_Extraction.md` | [`Plans/_shards/opencode_deep_extraction/00-index.md`](Plans/_shards/opencode_deep_extraction/00-index.md) |
| `LSPSupport.md` | [`Plans/_shards/lspsupport/00-index.md`](Plans/_shards/lspsupport/00-index.md) |
| `FileManager.md` | [`Plans/_shards/filemanager/00-index.md`](Plans/_shards/filemanager/00-index.md) |
| `FileSafe.md` | [`Plans/_shards/filesafe/00-index.md`](Plans/_shards/filesafe/00-index.md) |
| `Project_Output_Artifacts.md` | [`Plans/_shards/project_output_artifacts/00-index.md`](Plans/_shards/project_output_artifacts/00-index.md) |
| `chain-wizard-flexibility.md` | [`Plans/_shards/chain-wizard-flexibility/00-index.md`](Plans/_shards/chain-wizard-flexibility/00-index.md) |
| `assistant-chat-design.md` | [`Plans/_shards/assistant-chat-design/00-index.md`](Plans/_shards/assistant-chat-design/00-index.md) |
| `assistant-memory-subsystem.md` | [`Plans/_shards/assistant-memory-subsystem/00-index.md`](Plans/_shards/assistant-memory-subsystem/00-index.md) |
| `MiscPlan.md` | [`Plans/_shards/miscplan/00-index.md`](Plans/_shards/miscplan/00-index.md) |
| `newfeatures.md` | [`Plans/_shards/newfeatures/00-index.md`](Plans/_shards/newfeatures/00-index.md) |
| `WorktreeGitImprovement.md` | [`Plans/_shards/worktreegitimprovement/00-index.md`](Plans/_shards/worktreegitimprovement/00-index.md) |
| `Tools.md` | [`Plans/_shards/tools/00-index.md`](Plans/_shards/tools/00-index.md) |
| `GitHub_Integration.md` | [`Plans/_shards/github_integration/00-index.md`](Plans/_shards/github_integration/00-index.md) |
| `feature-list.md` | [`Plans/_shards/feature-list/00-index.md`](Plans/_shards/feature-list/00-index.md) |
| `usage-feature.md` | [`Plans/_shards/usage-feature/00-index.md`](Plans/_shards/usage-feature/00-index.md) |
| `Run_Graph_View.md` | [`Plans/_shards/run_graph_view/00-index.md`](Plans/_shards/run_graph_view/00-index.md) |
| `Orchestrator_Page.md` | [`Plans/_shards/orchestrator_page/00-index.md`](Plans/_shards/orchestrator_page/00-index.md) |
| `storage-plan.md` | [`Plans/_shards/storage-plan/00-index.md`](Plans/_shards/storage-plan/00-index.md) |
| `Runtime_Artifacts_Panel.md` | [`Plans/_shards/runtime_artifacts_panel/00-index.md`](Plans/_shards/runtime_artifacts_panel/00-index.md) |
| `Permissions_System.md` | [`Plans/_shards/permissions_system/00-index.md`](Plans/_shards/permissions_system/00-index.md) |
| `Contracts_V0.md` | [`Plans/_shards/contracts_v0/00-index.md`](Plans/_shards/contracts_v0/00-index.md) |
| `Crosswalk.md` | [`Plans/_shards/crosswalk/00-index.md`](Plans/_shards/crosswalk/00-index.md) |
| `Section15_MVP_Promoted_Features_Spec.md` | [`Plans/_shards/section15_mvp_promoted_features_spec/00-index.md`](Plans/_shards/section15_mvp_promoted_features_spec/00-index.md) |
| `MCP_Integration.md` | [`Plans/_shards/mcp_integration/00-index.md`](Plans/_shards/mcp_integration/00-index.md) |
| `CLI_Bridged_Providers.md` | [`Plans/_shards/cli_bridged_providers/00-index.md`](Plans/_shards/cli_bridged_providers/00-index.md) |
| `Models_System.md` | [`Plans/_shards/models_system/00-index.md`](Plans/_shards/models_system/00-index.md) |
| `Run_Modes.md` | [`Plans/_shards/run_modes/00-index.md`](Plans/_shards/run_modes/00-index.md) |
| `Goal_Runtime_System.md` | [`Plans/_shards/goal_runtime_system/00-index.md`](Plans/_shards/goal_runtime_system/00-index.md) |
| `PRD_Builder.md` | [`Plans/_shards/prd_builder/00-index.md`](Plans/_shards/prd_builder/00-index.md) |
| `Planning_Wizard.md` | [`Plans/_shards/planning_wizard/00-index.md`](Plans/_shards/planning_wizard/00-index.md) |
| `Commands_System.md` | [`Plans/_shards/commands_system/00-index.md`](Plans/_shards/commands_system/00-index.md) |
| `Executor_Protocol.md` | [`Plans/_shards/executor_protocol/00-index.md`](Plans/_shards/executor_protocol/00-index.md) |
| `UI_Command_Catalog.md` | [`Plans/_shards/ui_command_catalog/00-index.md`](Plans/_shards/ui_command_catalog/00-index.md) |
| `Skills_System.md` | [`Plans/_shards/skills_system/00-index.md`](Plans/_shards/skills_system/00-index.md) |
| `Multi-Account.md` | [`Plans/_shards/multi-account/00-index.md`](Plans/_shards/multi-account/00-index.md) |
| `Personas.md` | [`Plans/_shards/personas/00-index.md`](Plans/_shards/personas/00-index.md) |
| `Provider_OpenCode.md` | [`Plans/_shards/provider_opencode/00-index.md`](Plans/_shards/provider_opencode/00-index.md) |
| `human-in-the-loop.md` | [`Plans/_shards/human-in-the-loop/00-index.md`](Plans/_shards/human-in-the-loop/00-index.md) |
| `00-plans-index.md` | [`Plans/_shards/00-plans-index/00-index.md`](Plans/_shards/00-plans-index/00-index.md) |
| `Architecture_Invariants.md` | [`Plans/_shards/architecture_invariants/00-index.md`](Plans/_shards/architecture_invariants/00-index.md) |
| `BinaryLocator_Spec.md` | [`Plans/_shards/binarylocator_spec/00-index.md`](Plans/_shards/binarylocator_spec/00-index.md) |
| `Containers_Registry_and_Unraid.md` | [`Plans/_shards/containers_registry_and_unraid/00-index.md`](Plans/_shards/containers_registry_and_unraid/00-index.md) |
| `DRY_Rules.md` | [`Plans/_shards/dry_rules/00-index.md`](Plans/_shards/dry_rules/00-index.md) |
| `Decision_Log.md` | [`Plans/_shards/decision_log/00-index.md`](Plans/_shards/decision_log/00-index.md) |
| `Decision_Policy.md` | [`Plans/_shards/decision_policy/00-index.md`](Plans/_shards/decision_policy/00-index.md) |
| `Document_Packaging_Policy.md` | [`Plans/_shards/document_packaging_policy/00-index.md`](Plans/_shards/document_packaging_policy/00-index.md) |
| `Formatters_System.md` | [`Plans/_shards/formatters_system/00-index.md`](Plans/_shards/formatters_system/00-index.md) |
| `GitHub_API_Auth_and_Flows.md` | [`Plans/_shards/github_api_auth_and_flows/00-index.md`](Plans/_shards/github_api_auth_and_flows/00-index.md) |
| `Glossary.md` | [`Plans/_shards/glossary/00-index.md`](Plans/_shards/glossary/00-index.md) |
| `Media_Generation_and_Capabilities.md` | [`Plans/_shards/media_generation_and_capabilities/00-index.md`](Plans/_shards/media_generation_and_capabilities/00-index.md) |
| `OpenCode_Coverage_Matrix.md` | [`Plans/_shards/opencode_coverage_matrix/00-index.md`](Plans/_shards/opencode_coverage_matrix/00-index.md) |
| `Plugins_System.md` | [`Plans/_shards/plugins_system/00-index.md`](Plans/_shards/plugins_system/00-index.md) |
| `Progression_Gates.md` | [`Plans/_shards/progression_gates/00-index.md`](Plans/_shards/progression_gates/00-index.md) |
| `Provider_Stream_Mapping_External_Reference_A2A.md` | [`Plans/_shards/provider_stream_mapping_external_reference_a2a/00-index.md`](Plans/_shards/provider_stream_mapping_external_reference_a2a/00-index.md) |
| `UI_Wiring_Rules.md` | [`Plans/_shards/ui_wiring_rules/00-index.md`](Plans/_shards/ui_wiring_rules/00-index.md) |
| `Planning_Ledger_System.md` | [`Plans/_shards/planning_ledger_system/00-index.md`](Plans/_shards/planning_ledger_system/00-index.md) |
| `Plan_Document_System.md` | [`Plans/_shards/plan_document_system/00-index.md`](Plans/_shards/plan_document_system/00-index.md) |
| `Plan_To_Node_Compilation.md` | [`Plans/_shards/plan_to_node_compilation/00-index.md`](Plans/_shards/plan_to_node_compilation/00-index.md) |
| `Automated_Testing_System.md` | [`Plans/_shards/automated_testing_system/00-index.md`](Plans/_shards/automated_testing_system/00-index.md) |
| `Bootstrap_Planning_Migration.md` | [`Plans/_shards/bootstrap_planning_migration/00-index.md`](Plans/_shards/bootstrap_planning_migration/00-index.md) |
| `Prompt_Pipeline.md` | [`Plans/_shards/prompt_pipeline/00-index.md`](Plans/_shards/prompt_pipeline/00-index.md) |
| `Wiring_Matrix.md` | [`Plans/_shards/wiring_matrix/00-index.md`](Plans/_shards/wiring_matrix/00-index.md) |
| `GUI_Rebuild_Requirements_Checklist.md` | [`Plans/_shards/gui_rebuild_requirements_checklist/00-index.md`](Plans/_shards/gui_rebuild_requirements_checklist/00-index.md) |
| `Widget_System.md` | [`Plans/_shards/widget_system/00-index.md`](Plans/_shards/widget_system/00-index.md) |
| `prd_planning_runtime_contracts.json` | [`Plans/_shards/prd_planning_runtime_contracts/00-index.md`](Plans/_shards/prd_planning_runtime_contracts/00-index.md) |
| `prd_planning_runtime_contracts.schema.json` | [`Plans/_shards/prd_planning_runtime_contracts.schema/00-index.md`](Plans/_shards/prd_planning_runtime_contracts.schema/00-index.md) |
| `Release_Supply_Chain.md` | [`Plans/_shards/release_supply_chain/00-index.md`](Plans/_shards/release_supply_chain/00-index.md) |
