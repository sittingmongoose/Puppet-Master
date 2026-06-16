# Preliminary Orchestrator Backlink Audit Source Notes

This shard preserves preliminary backlink-audit memory from the uploaded repo snapshot and prior conversation. It is not canonical. Compile must rerun the audit against the current repo.

## High-priority owner/backbone docs

- Plans/Orchestrator_Page.md
- Plans/orchestrator-subagent-integration.md
- Plans/Executor_Protocol.md
- Plans/Run_Graph_View.md
- Plans/Run_Modes.md
- Plans/Contracts_V0.md
- Plans/Decision_Log.md
- Plans/Crosswalk.md
- Plans/Architecture_Invariants.md
- Plans/Progression_Gates.md
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md

## Goal/Chat/Builder/Settings docs

- Plans/Goal_Runtime_System.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/chain-wizard.md
- Plans/chain-wizard-flexibility.md
- Plans/interview-subagent-integration.md
- Plans/Planning_Ledger_System.md
- Plans/Plan_Document_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/00-plans-index.md

## Model/provider/capability policy docs

- Plans/Models_System.md
- Plans/Multi-Account.md
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
- Plans/Tools.md
- Plans/Personas.md
- Plans/Skills_System.md
- Plans/MCP_Integration.md
- Plans/Permissions_System.md
- Plans/FileSafe.md
- Plans/WorktreeGitImprovement.md

## GUI/page/surface docs

- Plans/FinalGUISpec.md
- Plans/Widget_System.md
- Plans/UI_Command_Catalog.md
- Plans/UI_Wiring_Rules.md
- Plans/Wiring_Matrix.md
- Plans/GUI_Rebuild_Requirements_Checklist.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/feature-list.md
- Plans/newfeatures.md
- Plans/newtools.md
- Plans/usage-feature.md
- Plans/Glossary.md

## Integration/consumer docs

- Plans/GitHub_Integration.md
- Plans/GitHub_API_Auth_and_Flows.md
- Plans/Containers_Registry_and_Unraid.md
- Plans/LSPSupport.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Plugins_System.md
- Plans/Project_Output_Artifacts.md
- Plans/Provider_Stream_Mapping_External_Reference_A2A.md
- Plans/OpenCode_Coverage_Matrix.md
- Plans/OpenCode_Deep_Extraction.md
- Plans/BinaryLocator_Spec.md
- Plans/Document_Packaging_Policy.md
- Plans/DRY_Rules.md
- Plans/Decision_Policy.md
- Plans/human-in-the-loop.md
- Plans/assistant-memory-subsystem.md
- Plans/agent-rules-context.md
- Plans/rewrite-tie-in-memo.md
- Plans/MiscPlan.md

## Conceptual-only references noted in prior conversation

- Plans/Bootstrap_Planning_Migration.md
- Plans/GitHub_API_Auth_and_Flows.md
- Plans/MCP_Integration.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Planning_Ledger_System.md
- Plans/UI_Wiring_Rules.md
- Plans/chain-wizard.md

## Snapshot direct-reference audit note

A local snapshot audit over the uploaded repo reported 68 top-level Markdown docs scanned and 60 docs with direct references when Orchestrator_Page, orchestrator-subagent-integration, Executor_Protocol, Goal_Runtime_System, and Plan_To_Node_Compilation references were included. Rerun against the live repo before compiling.

## Uploaded snapshot audit excerpt

# Orchestrator Backlink Audit

Scope: top-level `Plans/*.md` only; direct filename/ContractRef references to `Orchestrator_Page`, `orchestrator-subagent-integration`, `Executor_Protocol`, `Goal_Runtime_System`, and `Plan_To_Node_Compilation`. Generated subdirectories and JSON artifacts excluded.

Total top-level markdown docs scanned: 68

Docs with direct orchestration/backbone references: 60

| Path | Total | Orchestrator_Page | OSI | Executor | Goal Runtime | Plan-To-Node |
|---|---:|---:|---:|---:|---:|---:|
| `Plans/orchestrator-subagent-integration.md` | 2136 | 6 | 2068 | 62 | 0 | 0 |
| `Plans/Executor_Protocol.md` | 464 | 10 | 12 | 442 | 0 | 0 |
| `Plans/Contracts_V0.md` | 202 | 37 | 42 | 123 | 0 | 0 |
| `Plans/Orchestrator_Page.md` | 183 | 178 | 2 | 3 | 0 | 0 |
| `Plans/00-plans-index.md` | 131 | 56 | 19 | 34 | 10 | 12 |
| `Plans/Crosswalk.md` | 89 | 16 | 23 | 50 | 0 | 0 |
| `Plans/Goal_Runtime_System.md` | 68 | 0 | 0 | 0 | 57 | 11 |
| `Plans/Run_Modes.md` | 64 | 0 | 25 | 39 | 0 | 0 |
| `Plans/Decision_Log.md` | 54 | 39 | 5 | 10 | 0 | 0 |
| `Plans/assistant-chat-design.md` | 52 | 1 | 23 | 20 | 8 | 0 |
| `Plans/assistant-memory-subsystem.md` | 51 | 24 | 17 | 10 | 0 | 0 |
| `Plans/WorktreeGitImprovement.md` | 48 | 22 | 16 | 10 | 0 | 0 |
| `Plans/FinalGUISpec.md` | 47 | 31 | 10 | 4 | 2 | 0 |
| `Plans/Permissions_System.md` | 40 | 1 | 10 | 29 | 0 | 0 |
| `Plans/newtools.md` | 40 | 8 | 32 | 0 | 0 | 0 |
| `Plans/storage-plan.md` | 40 | 7 | 3 | 30 | 0 | 0 |
| `Plans/Architecture_Invariants.md` | 39 | 10 | 2 | 27 | 0 | 0 |
| `Plans/Tools.md` | 39 | 2 | 23 | 14 | 0 | 0 |
| `Plans/FileSafe.md` | 33 | 7 | 12 | 14 | 0 | 0 |
| `Plans/Plan_To_Node_Compilation.md` | 32 | 0 | 0 | 0 | 0 | 32 |
| `Plans/Run_Graph_View.md` | 29 | 14 | 2 | 13 | 0 | 0 |
| `Plans/Containers_Registry_and_Unraid.md` | 28 | 25 | 3 | 0 | 0 | 0 |
| `Plans/Commands_System.md` | 27 | 2 | 7 | 18 | 0 | 0 |
| `Plans/Models_System.md` | 27 | 7 | 6 | 14 | 0 | 0 |
| `Plans/LSPSupport.md` | 26 | 5 | 15 | 6 | 0 | 0 |
| `Plans/Personas.md` | 26 | 4 | 15 | 7 | 0 | 0 |
| `Plans/human-in-the-loop.md` | 25 | 5 | 14 | 6 | 0 | 0 |
| `Plans/Widget_System.md` | 24 | 24 | 0 | 0 | 0 | 0 |
| `Plans/MiscPlan.md` | 23 | 0 | 21 | 2 | 0 | 0 |
| `Plans/Progression_Gates.md` | 22 | 6 | 2 | 14 | 0 | 0 |
| `Plans/feature-list.md` | 21 | 13 | 0 | 8 | 0 | 0 |
| `Plans/GUI_Rebuild_Requirements_Checklist.md` | 20 | 20 | 0 | 0 | 0 | 0 |
| `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` | 18 | 0 | 8 | 10 | 0 | 0 |
| `Plans/OpenCode_Deep_Extraction.md` | 17 | 6 | 8 | 3 | 0 | 0 |
| `Plans/Decision_Policy.md` | 16 | 0 | 10 | 6 | 0 | 0 |
| `Plans/Prompt_Pipeline.md` | 16 | 6 | 2 | 8 | 0 | 0 |
| `Plans/Glossary.md` | 15 | 15 | 0 | 0 | 0 | 0 |
| `Plans/Provider_OpenCode.md` | 15 | 1 | 2 | 12 | 0 | 0 |
| `Plans/UI_Command_Catalog.md` | 15 | 9 | 0 | 6 | 0 | 0 |
| `Plans/DRY_Rules.md` | 14 | 7 | 0 | 7 | 0 | 0 |
| `Plans/chain-wizard-flexibility.md` | 14 | 2 | 3 | 9 | 0 | 0 |
| `Plans/CLI_Bridged_Providers.md` | 13 | 0 | 7 | 6 | 0 | 0 |
| `Plans/newfeatures.md` | 12 | 9 | 0 | 3 | 0 | 0 |
| `Plans/Plugins_System.md` | 11 | 0 | 0 | 11 | 0 | 0 |
| `Plans/Wiring_Matrix.md` | 11 | 5 | 0 | 6 | 0 | 0 |
| `Plans/usage-feature.md` | 11 | 4 | 1 | 6 | 0 | 0 |
| `Plans/agent-rules-context.md` | 8 | 2 | 6 | 0 | 0 | 0 |
| `Plans/GitHub_Integration.md` | 7 | 3 | 0 | 4 | 0 | 0 |
| `Plans/Plan_Document_System.md` | 7 | 0 | 0 | 0 | 0 | 7 |
| `Plans/Project_Output_Artifacts.md` | 7 | 2 | 0 | 5 | 0 | 0 |
| `Plans/BinaryLocator_Spec.md` | 6 | 1 | 0 | 5 | 0 | 0 |
| `Plans/Media_Generation_and_Capabilities.md` | 6 | 3 | 3 | 0 | 0 | 0 |
| `Plans/Multi-Account.md` | 6 | 0 | 2 | 4 | 0 | 0 |
| `Plans/Planning_Ledger_System.md` | 6 | 0 | 0 | 0 | 0 | 6 |
| `Plans/rewrite-tie-in-memo.md` | 6 | 5 | 1 | 0 | 0 | 0 |
| `Plans/OpenCode_Coverage_Matrix.md` | 5 | 2 | 1 | 2 | 0 | 0 |
| `Plans/Bootstrap_Planning_Migration.md` | 4 | 0 | 0 | 0 | 0 | 4 |
| `Plans/Document_Packaging_Policy.md` | 4 | 0 | 2 | 2 | 0 | 0 |
| `Plans/interview-subagent-integration.md` | 4 | 2 | 2 | 0 | 0 | 0 |
| `Plans/Runtime_Artifacts_Panel.md` | 2 | 2 | 0 | 0 | 0 | 0 |
