# Plans Index (authoritative map)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Change Summary


  ContractRef: ContractName:Plans/Document_Packaging_Policy.md, PolicyRule:Decision_Policy.md§2
- 2026-02-26: Registered Plans/assistant-memory-subsystem.md as canonical Assistant-only memory SSOT.
- 2026-02-25: Registered Plans/GitHub_Integration.md in plan map table.
- 2026-06-11: Registered the PM Bootstrap Planning Ledger, Plan Document System, Plan-to-node compilation boundary, and bootstrap migration owner docs compiled from ledger `pldg-20260610-001-ledger-plan-system`.

This index is a navigation + canonicalization aid for the `Plans/` folder.
It does **not** remove or override detail in any plan; it exists so implementation stays consistent and rewrite-aware.

## Anti-drift layer (required reading order)

Required reading order for the orchestrator rewrite canon-collapse is:
1. `Plans/rewrite-tie-in-memo.md`
2. `Plans/Decision_Log.md`
3. `Plans/DRY_Rules.md`
4. `Plans/Crosswalk.md`
5. `Plans/Contracts_V0.md`
6. `Plans/storage-plan.md`
7. `Plans/Prompt_Pipeline.md`
8. `Plans/Executor_Protocol.md`
9. `Plans/Decision_Policy.md`
10. `Plans/Progression_Gates.md`

Primary consumer docs then follow:
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/FinalGUISpec.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Widget_System.md`
- `Plans/usage-feature.md`
- `Plans/FileManager.md`

Rules:
- owner docs are reconciled before consumer docs
- consumer docs must not preserve stale tier-era or request-era canon as peer alternatives
- summary and checklist mirrors are reconciled after owner and primary consumer docs

ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Progression_Gates.md

### Cross-doc owner-map guard

This index records these routing relationships only; it does not re-own contract, storage, UI, chat, run-graph, HITL, executor, or usage behavior. For each seam below, Primary owners and Primary doc entries carry the owning canon; Cross-owner docs implicated by this seam, Strongly implicated adjacent docs, Adjacent owners implicated, stale-consumer, and already-identified owner entries are reconciliation companions that consume or align to that owner canon.

- Contracts/Crosswalk to UI/run seam: Primary owners: `Plans/Contracts_V0.md` and `Plans/Crosswalk.md`; Cross-owner docs implicated by this seam: `Plans/storage-plan.md`, `Plans/UI_Command_Catalog.md`, `Plans/assistant-chat-design.md`, `Plans/Orchestrator_Page.md`, `Plans/Runtime_Artifacts_Panel.md`, and `Plans/FinalGUISpec.md`.
- Contracts/Final GUI seam: Primary owners: `Plans/Contracts_V0.md` and `Plans/FinalGUISpec.md`; Cross-owner docs implicated by this seam: `Plans/storage-plan.md`, `Plans/assistant-chat-design.md`, `Plans/UI_Command_Catalog.md`, and `Plans/Crosswalk.md`.
- Storage/command/UI/contract seam: Primary owners: `Plans/storage-plan.md`, `Plans/UI_Command_Catalog.md`, `Plans/FinalGUISpec.md`, and `Plans/Contracts_V0.md`.
- Contracts/Crosswalk file-surface seam: Primary owners: `Plans/Contracts_V0.md` and `Plans/Crosswalk.md`; Strongly implicated adjacent docs: `Plans/storage-plan.md`, `Plans/FileManager.md`, `Plans/FinalGUISpec.md`, and `Plans/UI_Command_Catalog.md`.
- Contracts routing seam with usage carry-through: Primary owners: `Plans/Contracts_V0.md`; Strongly implicated adjacent docs: `Plans/Crosswalk.md`, `Plans/FinalGUISpec.md`, `Plans/UI_Command_Catalog.md`, `Plans/storage-plan.md`, and `Plans/usage-feature.md`.
- Contracts routing seam without usage carry-through: Primary owners: `Plans/Contracts_V0.md`; Strongly implicated adjacent docs: `Plans/Crosswalk.md`, `Plans/FinalGUISpec.md`, `Plans/UI_Command_Catalog.md`, and `Plans/storage-plan.md`.
- Contracts usage/UI seam: Primary owners: `Plans/Contracts_V0.md`; Strongly implicated adjacent docs: `Plans/UI_Command_Catalog.md`, `Plans/FinalGUISpec.md`, `Plans/usage-feature.md`, and `Plans/storage-plan.md`.
- Contracts run-graph seam: Primary owners: `Plans/Contracts_V0.md`; Strongly implicated adjacent docs: `Plans/Run_Graph_View.md`, `Plans/Orchestrator_Page.md`, `Plans/UI_Command_Catalog.md`, and `Plans/storage-plan.md`.
- Usage stale-consumer seam: Primary stale consumer: `Plans/usage-feature.md`; Owner docs already identified: `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, and `Plans/Runtime_Artifacts_Panel.md`.
- Orchestrator command/storage seam: Owner docs already implicated: `Plans/Orchestrator_Page.md`, `Plans/UI_Command_Catalog.md`, `Plans/Contracts_V0.md`, and `Plans/storage-plan.md`.
- Contracts/HITL/executor seam: Primary doc: `Plans/Contracts_V0.md`; Adjacent owners implicated: `Plans/Crosswalk.md`, `Plans/storage-plan.md`, `Plans/human-in-the-loop.md`, `Plans/Executor_Protocol.md`, `Plans/UI_Command_Catalog.md`, `Plans/FileManager.md`, and `Plans/FinalGUISpec.md`.
- HITL run-graph seam: Primary doc: `Plans/human-in-the-loop.md`; Adjacent owners implicated: `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/UI_Command_Catalog.md`, `Plans/Run_Graph_View.md`, `Plans/Orchestrator_Page.md`, and `Plans/orchestrator-subagent-integration.md`.
- UI/run adjacent seam: Adjacent owners implicated: `Plans/Contracts_V0.md`, `Plans/Run_Graph_View.md`, `Plans/FinalGUISpec.md`, `Plans/Widget_System.md`, `Plans/storage-plan.md`, and `Plans/UI_Command_Catalog.md`.
- Runtime-artifact/orchestrator adjacent seam: Adjacent owners implicated: `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/Orchestrator_Page.md`, `Plans/FinalGUISpec.md`, `Plans/UI_Command_Catalog.md`, and `Plans/Runtime_Artifacts_Panel.md`.
- Mixed-era layering seam: `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/FinalGUISpec.md`, and `Plans/UI_Command_Catalog.md` must not preserve `mixed-era` layering where additive patches landed without fully retiring older framing.
- impacted_docs seam: impacted_docs: `Plans/Contracts_V0.md`, `Plans/Executor_Protocol.md`, `Plans/UI_Command_Catalog.md`, `Plans/storage-plan.md`, `Plans/FinalGUISpec.md`, `Plans/assistant-chat-design.md`, `Plans/usage-feature.md`, and `Plans/Orchestrator_Page.md`.
- Priority 3 — Terminology, routing, and anti-drift docs: `Plans/00-plans-index.md`, `Plans/Crosswalk.md`, `Plans/Glossary.md`, `Plans/feature-list.md`, `Plans/OpenCode_Coverage_Matrix.md`, and `Plans/Project_Output_Artifacts.md`.
- Orchestrator/storage/contracts triad: `Plans/Orchestrator_Page.md`, `Plans/storage-plan.md`, and `Plans/Contracts_V0.md`; equivalent source orderings that begin with `Plans/storage-plan.md` or pair `Plans/storage-plan.md` with `Plans/Contracts_V0.md` still route to the same three owner docs.
- Orchestrator/Final GUI storage seam: `Plans/storage-plan.md`, `Plans/Contracts_V0.md`, `Plans/FinalGUISpec.md`, and `Plans/Orchestrator_Page.md`.
- Final GUI/widget storage seam: `Plans/FinalGUISpec.md`, `Plans/Widget_System.md`, `Plans/Contracts_V0.md`, and `Plans/storage-plan.md`.
- Widget/account command seam: `Plans/Widget_System.md`, `Plans/Multi-Account.md`, `Plans/Contracts_V0.md`, and `Plans/UI_Command_Catalog.md`.
- Providers/accounts/cost/auth prompt-pipeline seam: Primary owners: `Plans/Prompt_Pipeline.md`, `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, and `Plans/Multi-Account.md`; source orderings that begin with `Plans/Multi-Account.md` or `Plans/Contracts_V0.md` still route to the same four owner docs.
- Execution-assumption downstream-consumer seam: downstream consumers that depend on these execution assumptions: `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`, `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, `Plans/UI_Command_Catalog.md`, and `Plans/human-in-the-loop.md`.
- UI command/user-command contract seam: Adjacent owners: `Plans/UI_Command_Catalog.md`, `Plans/Commands_System.md`, and `Plans/Contracts_V0.md`.
- Crosswalk/contract file-manager storage seam: Primary owners: `Plans/Crosswalk.md`, `Plans/Contracts_V0.md`, `Plans/FileManager.md`, and `Plans/storage-plan.md`; unordered source mentions of the same four paths route to the same owner set.
- Contract UI-command crosswalk seam: Primary owners: `Plans/Contracts_V0.md`, `Plans/UI_Command_Catalog.md`, and `Plans/Crosswalk.md`.
- Final GUI/storage/crosswalk/contract seam: Primary owners: `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, `Plans/Crosswalk.md`, and `Plans/Contracts_V0.md`.
- Contract/Final GUI/UI-command primary seam: Primary owners: `Plans/Contracts_V0.md`, `Plans/FinalGUISpec.md`, and `Plans/UI_Command_Catalog.md`.
- UI-command/contract/crosswalk/Final GUI seam: `Plans/UI_Command_Catalog.md`, `Plans/Contracts_V0.md`, `Plans/Crosswalk.md`, and `Plans/FinalGUISpec.md`.
- Contract UI/chat/file consumer seam: Primary owners: `Plans/Contracts_V0.md`; Strongly implicated adjacent docs: `Plans/Crosswalk.md`, `Plans/FileManager.md`, `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, `Plans/assistant-chat-design.md`, and `Plans/usage-feature.md`.
- Contract runtime-artifact file/chat consumer seam: Primary owners: `Plans/Contracts_V0.md`; Strongly implicated adjacent docs: `Plans/storage-plan.md`, `Plans/FinalGUISpec.md`, `Plans/FileManager.md`, `Plans/assistant-chat-design.md`, and `Plans/Runtime_Artifacts_Panel.md`.
- UI-command/storage pair seam: `Plans/UI_Command_Catalog.md` and `Plans/storage-plan.md`.
- Contract run/orchestrator GUI-command seam: Primary owners: `Plans/Contracts_V0.md`; Strongly implicated adjacent docs: `Plans/Run_Graph_View.md`, `Plans/Orchestrator_Page.md`, `Plans/FinalGUISpec.md`, and `Plans/UI_Command_Catalog.md`.
- Contract UI-command/crosswalk/Final GUI adjacent seam: Primary owners: `Plans/Contracts_V0.md`; Strongly implicated adjacent docs: `Plans/UI_Command_Catalog.md`, `Plans/Crosswalk.md`, and `Plans/FinalGUISpec.md`.
- Contract orchestrator/Final GUI/UI-command adjacent seam: Primary owners: `Plans/Contracts_V0.md`; Strongly implicated adjacent docs: `Plans/Orchestrator_Page.md`, `Plans/FinalGUISpec.md`, and `Plans/UI_Command_Catalog.md`.
- Contract/storage run adjacent seam: Primary owners: `Plans/Contracts_V0.md`; Strongly implicated adjacent docs: `Plans/storage-plan.md`, `Plans/Run_Graph_View.md`, and `Plans/Orchestrator_Page.md`.
- Run/GUI/UI primary stale-consumer seam: Primary stale consumers: `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`, `Plans/FinalGUISpec.md`, and `Plans/UI_Command_Catalog.md`.
- Contract/Crosswalk/storage already-identified owner seam: Owner docs already identified: `Plans/Contracts_V0.md`, `Plans/Crosswalk.md`, and `Plans/storage-plan.md`.
- Worktree/chat stale-consumer seam: Primary stale consumer: `Plans/WorktreeGitImprovement.md`; Strong aligned adjacent consumer: `Plans/assistant-chat-design.md`.
- Crosswalk/contract owner-gap seam: Primary owner-gap docs: `Plans/Crosswalk.md` and `Plans/Contracts_V0.md`; Strong aligned consumer: `Plans/storage-plan.md`.
- Contract/Crosswalk shell-adoption strata seam: Stratum 1: owner docs: `Plans/Contracts_V0.md` and `Plans/Crosswalk.md`; Stratum 2: command and shell adoption: `Plans/UI_Command_Catalog.md` and `Plans/FinalGUISpec.md`.
- Contract/storage owner-gap seam: Primary owner-gap docs: `Plans/Contracts_V0.md` and `Plans/storage-plan.md`.
- Contract/storage runtime/chat strong-consumer seam: Primary owner docs: `Plans/Contracts_V0.md` and `Plans/storage-plan.md`; Strong adjacent consumers: `Plans/Runtime_Artifacts_Panel.md`, `Plans/assistant-chat-design.md`, and `Plans/Orchestrator_Page.md`.
- Storage owner-gap/executor-adjacent seam: Primary owner-gap doc: `Plans/storage-plan.md`; Strong adjacent owners: `Plans/Contracts_V0.md` and `Plans/Executor_Protocol.md`.
- Contract/storage chat aligned-consumer seam: Primary owner docs: `Plans/Contracts_V0.md` and `Plans/storage-plan.md`; Strong aligned consumer: `Plans/assistant-chat-design.md`.
- Contracts/Crosswalk/storage/HITL seam: `Plans/Contracts_V0.md`, `Plans/Crosswalk.md`, `Plans/storage-plan.md`, and `Plans/human-in-the-loop.md`.
- Prompt-pipeline contracts storage run-modes seam: `Plans/Prompt_Pipeline.md`, `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, and `Plans/Run_Modes.md`.
- Storage/HITL/contract primary-owner seam: Primary owner docs: `Plans/storage-plan.md`, `Plans/human-in-the-loop.md`, and `Plans/Contracts_V0.md`.
- UI/run/orchestrator strong stale-consumer seam: Strong stale consumers: `Plans/UI_Command_Catalog.md`, `Plans/Run_Graph_View.md`, and `Plans/Orchestrator_Page.md`.
- HITL/storage/contract primary-owner seam: Primary owner docs: `Plans/human-in-the-loop.md`, `Plans/storage-plan.md`, and `Plans/Contracts_V0.md`.
- UI/executor stale-consumer aligned-owner seam: Strong stale consumer: `Plans/UI_Command_Catalog.md`; Strong aligned owner: `Plans/Executor_Protocol.md`.
- Run/orchestrator/UI primary stale-consumer seam: Primary stale consumers: `Plans/Run_Graph_View.md`, `Plans/Orchestrator_Page.md`, and `Plans/UI_Command_Catalog.md`.
- UI/run stale-inconsistent consumer seam: Primary stale/inconsistent consumers: `Plans/UI_Command_Catalog.md` and `Plans/Run_Graph_View.md`; retain `/inconsistent` classification when reconciling those consumers.
- Prompt-pipeline adjacent-owner seam: Primary doc: `Plans/Prompt_Pipeline.md`; Adjacent owners implicated: `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/Multi-Account.md`, `Plans/Executor_Protocol.md`, `Plans/Orchestrator_Page.md`, and `Plans/Run_Graph_View.md`.
- Contract/Crosswalk/orchestrator/widget run adjacent seam: Adjacent owners implicated: `Plans/Contracts_V0.md`, `Plans/Crosswalk.md`, `Plans/Orchestrator_Page.md`, `Plans/Widget_System.md`, `Plans/Run_Graph_View.md`, and `Plans/storage-plan.md`.
- Final-GUI/widget/orchestrator command worktree HITL adjacent seam: Adjacent owners implicated: `Plans/FinalGUISpec.md`, `Plans/Widget_System.md`, `Plans/Orchestrator_Page.md`, `Plans/UI_Command_Catalog.md`, `Plans/WorktreeGitImprovement.md`, and `Plans/human-in-the-loop.md`.
- Contracts/Crosswalk/storage/HITL repeat seam: `Plans/Contracts_V0.md`, `Plans/Crosswalk.md`, `Plans/storage-plan.md`, and `Plans/human-in-the-loop.md` remain the owner-map set for repeated source orderings of the same four docs.
- Runtime/storage/policy/UI terminology seam: normalize `safe-point`, `restore-point`, `rollback`, and `contamination` terminology through one authoritative mapping and event taxonomy across runtime, storage, policy, and UI docs; index routing points to `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/Decision_Policy.md`, and `Plans/FinalGUISpec.md`.
- Final GUI/UI/orchestrator repeat seam: listed orderings `Plans/FinalGUISpec.md`, `Plans/UI_Command_Catalog.md`, `Plans/Orchestrator_Page.md` and `Plans/FinalGUISpec.md`, `Plans/Orchestrator_Page.md`, `Plans/UI_Command_Catalog.md` route to the same owner-map set.
- Contracts/Crosswalk/chain-wizard seam: `Plans/Contracts_V0.md`, `Plans/Crosswalk.md`, and `Plans/chain-wizard-flexibility.md`.
- Chain-wizard/contracts/executor seam: `Plans/chain-wizard-flexibility.md` (section 1), `Plans/Contracts_V0.md`, and `Plans/Executor_Protocol.md`.
- Contracts/executor/multi-account seam: `Plans/Contracts_V0.md`, `Plans/Executor_Protocol.md`, and `Plans/Multi-Account.md`.
- Storage/orchestrator pair seam: `Plans/storage-plan.md` and `Plans/Orchestrator_Page.md`.
- Orchestrator-subagent/executor/storage repeat seam: `Plans/orchestrator-subagent-integration.md`, `Plans/Executor_Protocol.md`, and `Plans/storage-plan.md` remain the owner-map set for repeated source orderings of the same three docs.
- Orchestrator/Final GUI source-lineage seam: `Plans/Orchestrator_Page.md` and `Plans/FinalGUISpec.md`; non-Plan source ledger references are source-lineage only and are excluded from live owner docs.
- Contracts/usage Orchestrator spot-checks seam: `Plans/Contracts_V0.md` and `Plans/usage-feature.md`, with spot-checks against `Plans/Orchestrator_Page.md`.
- UI command/commands/chat seam: `Plans/UI_Command_Catalog.md`, `Plans/Commands_System.md`, and `Plans/assistant-chat-design.md`.
- UI command/Final GUI/FileManager seam: `Plans/UI_Command_Catalog.md`, `Plans/FinalGUISpec.md`, and `Plans/FileManager.md`.
- File/runtime progression seam: Cross-owner docs implicated by this seam: `Plans/FileManager.md`, `Plans/Contracts_V0.md`, `Plans/Progression_Gates.md`, `Plans/Orchestrator_Page.md`, and `Plans/Runtime_Artifacts_Panel.md`.
- Storage/file GUI/runtime primary-owner seam: Primary owners: `Plans/storage-plan.md`, `Plans/FileManager.md`, `Plans/FinalGUISpec.md`, and `Plans/Runtime_Artifacts_Panel.md`.
- GUI/usage/runtime/UI/orchestrator primary-owner seam: Primary owners: `Plans/FinalGUISpec.md`, `Plans/usage-feature.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/UI_Command_Catalog.md`, and `Plans/Orchestrator_Page.md`.
- Contracts/Crosswalk/FileManager primary-owner seam: Primary owners: `Plans/Contracts_V0.md`, `Plans/Crosswalk.md`, and `Plans/FileManager.md`.
- Orchestrator/runtime/storage seam: `Plans/Orchestrator_Page.md`, `Plans/Runtime_Artifacts_Panel.md`, and `Plans/storage-plan.md`.
- Contracts/GUI/orchestrator/FileManager primary-owner seam: Primary owners: `Plans/Contracts_V0.md`, `Plans/FinalGUISpec.md`, `Plans/Orchestrator_Page.md`, and `Plans/FileManager.md`.
- Contracts/Crosswalk/Final GUI primary-owner seam: Primary owners: `Plans/Contracts_V0.md`, `Plans/Crosswalk.md`, and `Plans/FinalGUISpec.md`.
- Storage/chat/orchestrator/Crosswalk seam: Cross-owner docs implicated by this seam: `Plans/storage-plan.md`, `Plans/assistant-chat-design.md`, `Plans/Orchestrator_Page.md`, and `Plans/Crosswalk.md`.
- Binary/DRY/decision/formatter seam: `Plans/BinaryLocator_Spec.md`, `Plans/DRY_Rules.md`, `Plans/Decision_Log.md`, and `Plans/Formatters_System.md`.
- Primary tranche docs seam: Primary docs in this tranche: `Plans/BinaryLocator_Spec.md`, `Plans/DRY_Rules.md`, `Plans/Decision_Log.md`, `Plans/Formatters_System.md`, `Plans/OpenCode_Coverage_Matrix.md`, `Plans/Plugins_System.md`, `Plans/Skills_System.md`, `Plans/feature-list.md`, `Plans/newfeatures.md`, and `Plans/rewrite-tie-in-memo.md`.
- Highest-signal continuation tranche seam: `Plans/Decision_Log.md`, `Plans/Formatters_System.md`, `Plans/OpenCode_Coverage_Matrix.md`, `Plans/Plugins_System.md`, `Plans/Skills_System.md`, `Plans/feature-list.md`, `Plans/newfeatures.md`, and `Plans/rewrite-tie-in-memo.md`; `Plans/DRY_Rules.md` is the mechanical-integrity forcing function, and `Plans/BinaryLocator_Spec.md` is lower-risk but still non-zero.
- Orchestrator source-lineage seam: `Plans/Orchestrator_Page.md`; protected working-ledger source paths are source-lineage only and are excluded from live owner docs.
- FileManager/chat implicit-consumer seam: Primary stale consumer: `Plans/FileManager.md`; Strong aligned-but-implicit consumer: `Plans/assistant-chat-design.md`.
- Runtime/storage/Crosswalk seam: `Plans/Runtime_Artifacts_Panel.md`, `Plans/storage-plan.md`, and `Plans/Crosswalk.md`.
- Contracts/Crosswalk primary-owner seam: Primary owner docs: `Plans/Contracts_V0.md` and `Plans/Crosswalk.md`.
- UI command/Final GUI adoption seam: Primary adoption docs: `Plans/UI_Command_Catalog.md` and `Plans/FinalGUISpec.md`.
- Storage primary-owner seam: Primary owner doc: `Plans/storage-plan.md`.
- Orchestrator/run primary stale-consumer seam: Primary stale consumers: `Plans/Orchestrator_Page.md` and `Plans/Run_Graph_View.md`.
- Prompt pipeline residual stale-scope seam: Strong owner docs with residual stale scope wording: `Plans/Prompt_Pipeline.md`.
- Orchestrator/run/UI targeted-doc seam: `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`, and `Plans/UI_Command_Catalog.md`.
- Contracts/executor seam: `Plans/Contracts_V0.md` and `Plans/Executor_Protocol.md`.
- Widget owner-consumer hybrid seam: Primary stale owner/consumer hybrid: `Plans/Widget_System.md`.
- Owner-routing adjacent-owner seam: Adjacent owners implicated by this seam: `Plans/Contracts_V0.md`, `Plans/Progression_Gates.md`, `Plans/Widget_System.md`, `Plans/Orchestrator_Page.md`, and `Plans/FinalGUISpec.md`.
- Progression gate command-normalization seam: `GATE-010` cannot express the routing and `command-normalization` checks now needed; the `GATE` layer remains behind the owner contract layer.
- Rewrite/UI/Final GUI primary-doc seam: Primary docs: `Plans/rewrite-tie-in-memo.md`, `Plans/UI_Command_Catalog.md`, and `Plans/FinalGUISpec.md`.
- UI/run/widget seam: `Plans/UI_Command_Catalog.md`, `Plans/Run_Graph_View.md`, and `Plans/Widget_System.md`.
- Widget/orchestrator/Final GUI seam: `Plans/Widget_System.md`, `Plans/Orchestrator_Page.md`, and `Plans/FinalGUISpec.md`.
- Final GUI/widget pair seam: `Plans/FinalGUISpec.md` and `Plans/Widget_System.md`.
- Usage/widget pair seam: `Plans/usage-feature.md` and `Plans/Widget_System.md`.
- Usage/Multi-Account pair seam: `Plans/usage-feature.md` and `Plans/Multi-Account.md`.
- Orchestrator/Final GUI pair seam: `Plans/Orchestrator_Page.md` and `Plans/FinalGUISpec.md`.
- Usage/Final GUI/orchestrator seam: `Plans/usage-feature.md`, `Plans/FinalGUISpec.md`, and `Plans/Orchestrator_Page.md`.
- Widget/FileManager/runtime seam: `Plans/Widget_System.md`, `Plans/FileManager.md`, and `Plans/Runtime_Artifacts_Panel.md`.
- Glossary/Final GUI/orchestrator/run seam: `Plans/Glossary.md`, `Plans/FinalGUISpec.md`, `Plans/Orchestrator_Page.md`, and `Plans/Run_Graph_View.md`.
- Executor-only seam: `Plans/Executor_Protocol.md`.
- Prompt pipeline/Final GUI seam: `Plans/Prompt_Pipeline.md` and `Plans/FinalGUISpec.md`.
- Prompt pipeline/Multi-Account/executor seam: `Plans/Prompt_Pipeline.md`, `Plans/Multi-Account.md`, and `Plans/Executor_Protocol.md`.
- Orchestrator/Source Control-related seam: `Plans/Orchestrator_Page.md` plus Source Control-related docs.
- Crosswalk precedence rewrite-era seam: `Plans/Crosswalk.md` remains structurally unreliable as a boundary/precedence map when rewrite-era ownership disputes peak; preserve `/precedence`.
- Final-pass core owner set seam: Highest-signal docs remain the same core owner set for final pass: `Plans/Commands_System.md`, `Plans/Wiring_Matrix.md`, `Plans/UI_Wiring_Rules.md`, `Plans/Project_Output_Artifacts.md`, `Plans/FileManager.md`, `Plans/Crosswalk.md`, `Plans/Decision_Policy.md`, `Plans/Run_Modes.md`, `Plans/Progression_Gates.md`, `Plans/newtools.md`, and `Plans/assistant-memory-subsystem.md`.
- Orchestrator/Final GUI/FileManager seam: `Plans/Orchestrator_Page.md`, `Plans/FinalGUISpec.md`, and `Plans/FileManager.md`.
- Containers/DRY/decision seam: `Plans/Containers_Registry_and_Unraid.md`, `Plans/DRY_Rules.md`, and `Plans/Decision_Log.md`.
- Orchestrator/run/Final GUI seam: `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`, and `Plans/FinalGUISpec.md`.
- Crosswalk/usage/Final GUI/orchestrator seam: `Plans/Crosswalk.md`, `Plans/usage-feature.md`, `Plans/FinalGUISpec.md`, and `Plans/Orchestrator_Page.md`.
- Spec-integrity primary-doc seam: Primary spec-integrity docs: `Plans/Crosswalk.md`, `Plans/usage-feature.md`, `Plans/FinalGUISpec.md`, and `Plans/Orchestrator_Page.md`.
- Executor/orchestrator seam: `Plans/Executor_Protocol.md` and `Plans/Orchestrator_Page.md`.
- Widget/Final GUI/usage seam: `Plans/Widget_System.md`, `Plans/FinalGUISpec.md`, and `Plans/usage-feature.md`.
- Widget/Final GUI spec-integrity seam: Primary spec-integrity docs: `Plans/Widget_System.md` and `Plans/FinalGUISpec.md`.
- Progression Gates adjacent traceability seam: `Plans/Progression_Gates.md`; adjacent references checked through existing owner docs: `Plans/DRY_Rules.md` and `Plans/Crosswalk.md`.
- Run Graph/widget/Progression Gates seam: `Plans/Run_Graph_View.md`, `Plans/Widget_System.md`, and `Plans/Progression_Gates.md`.
- Usage event reference shape seam: `Plans/usage-feature.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/storage-plan.md`, and `Plans/Contracts_V0.md` remain the owner/consumer set for `usage_event_ref`; `usage-feature.md` consumers must not rely on timestamp heuristics or a shape that lacks authoritative storage/runtime linkage.
- Orchestrator page-tab routing seam: `Plans/Orchestrator_Page.md`, `Plans/UI_Command_Catalog.md`, and `Plans/Contracts_V0.md` own `page_tab` route semantics; use `page_tab` only when a routed destination must land inside a known page and force a specific tab.
- Usage cost consumer seam: `Plans/usage-feature.md` owns `cost_usage` routing and duplicate-consumer cleanup, with `Plans/Runtime_Artifacts_Panel.md` and `Plans/storage-plan.md` carrying artifact and persistence alignment so there is one authoritative consumer section.
- Runtime-recovery duplicate-canon seam: `runtime-recovery` addenda and same-file canon duplication are cleanup inputs for `Plans/Crosswalk.md`, `Plans/human-in-the-loop.md`, and `Plans/storage-plan.md`; this index records routing only and does not make duplicated addenda canonical.
- Runtime scheduler/executor blocked-sequence seam: `blocked_sequence` is owned by the runtime scheduler/executor layer through `Plans/Executor_Protocol.md` and `Plans/Contracts_V0.md`; UI/HITL/chat/storage docs, including the legacy `/HITL/chat/storage` bucket shorthand, are consumers and must not re-own the blocked episode.
- Orchestrator subagent coordination-canon seam: `Plans/orchestrator-subagent-integration.md` owns live `coordination-canon` contradictions in its runtime scheduler consumer model; same-file contradictions must be resolved there before `Plans/FileManager.md` or index consumers mirror them.

## Rewrite tie-in (2026-02-21)
The project is intentionally adapting an OpenCode-style architecture and is mid-transition to a deterministic agent-loop core with:
- **Providers** behind one unified **event model**
- **Event-sourced storage**: `seglog` (canonical ledger) -> projections into `redb` (KV state/settings) + Tantivy (search)
- **Central tool registry + policy engine** and a patch/apply/verify/rollback pipeline
- **UI rewrite**: Rust + Slint (winit; Skia default)
- **Auth**: subscription-first; Gemini is modeled as two provider entries, not one stale-canon `mixed-account` provider: Gemini Direct (`gemini`, direct key-only/API-key-backed) and Gemini CLI (`gemini_cli`, CLI-wrapped OAuth/API-key/Google-credential paths). The Gemini API key remains the explicit `key-exception` where that path is selected. Requested/effective auth, account identity, account/plan UI, and quota/usage labels are mode-dependent and carry across storage, runtime, setup/health, media capabilities, and usage

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD

See: `Plans/rewrite-tie-in-memo.md`, `Plans/Multi-Account.md`, `Plans/usage-feature.md`, and `Plans/FinalGUISpec.md`.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### Provider/account canon reconciliation note (2026-03-20)

Provider and usage reconciliation spans `Plans/Models_System.md`, `Plans/usage-feature.md`, `Plans/FinalGUISpec.md`, and `Plans/rewrite-tie-in-memo.md`; concrete owner docs still carry behavior, while this index records the cross-doc impact map. Additional downstream reconciliation may touch provider-health / auth / doctor-related planning docs when those owner surfaces are expanded.

Provider / account / promoted-shell routing stays split by owner surface. `Plans/Multi-Account.md` and provider-specific docs own requested/effective account, auth, quota, and provider-health semantics; `Plans/Section15_MVP_Promoted_Features_Spec.md` owns the promoted shell and promoted-feature behavior envelope; `Plans/FinalGUISpec.md` consumes that shell-surface canon for visible placement, settings, title-bar, attention, and recovery UI; `Plans/Orchestrator_Page.md`, `Plans/Run_Modes.md`, `Plans/Executor_Protocol.md`, and `Plans/storage-plan.md` own the run/package/lane/runtime records that the shell presents. Stale `pre-promotion` page, `/title-bar/recovery`, or feature-list/newfeatures shell wording is lineage or mirror cleanup input, not a live owner alternative.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md

## Plan map

### PM Bootstrap Planning, PlanUnit, and Node-Readiness Map (2026-06-11)

The bootstrap planning packet uses the following owner split:
- `Plans/Planning_Ledger_System.md` owns the Bootstrap Ledger and future Native Ledger Service concepts, compact operating state, source-lineage preservation, per-turn ledger protocol, and ledger-to-Plan compilation boundary.
- `Plans/Plan_Document_System.md` owns standardized Plan doc layout, stable PlanUnits, `gui_related: true|false`, lossless Plan conversion proof, owner adjudication metadata, and generated PlanUnit index boundaries.
- `Plans/Plan_To_Node_Compilation.md` owns the safe PlanUnit-to-node-readiness boundary and future compiler interface; it does not create WorkNodes or executable build tasks.
- `Plans/Bootstrap_Planning_Migration.md` owns current bootstrap workflow usage, AGENTS trigger migration, Codex phase model, controlled Plan conversion batches, governance seal timing, and retired-experiment exclusions.

The ledger `Plans/ledgers/v2/pldg-20260610-001-ledger-plan-system/` is source-lineage/planning memory for these docs, not canonical product prose. Generated governance artifacts remain seal-phase only: ordinary ledger writing, plan drafting, plan conversion, PlanUnit indexing, and node-readiness reporting do not update `Plans/Spec_Lock.json`, `Plans/_shards/**`, `Plans/.evidence/**`, `Plans/plan_graph.json`, or `Plans/auto_decisions.jsonl`.

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Bootstrap_Planning_Migration.md

### Instant Grep canon reconciliation note (2026-03-30)

Plans/00-plans-index.md (`/00-plans-index.md`) is the live canon-map and `/index` discoverability map for promoted Instant Grep canon so future agents can find the owner split without relying on stale search terms.

Instant Grep implementation-safe detail stays with the owner docs before any consumer-mirror cleanup: storage owns `ArcSwap` publication and `dirty-layer` lifecycle/recovery, runtime contracts only carry shared `/runtime` event and routing fields if promoted, FinalGUISpec owns project indexing `/degradation/settings` visibility, and Usage analytics consumes `tool.invoked.index_used` without re-owning freshness, publication, or fallback behavior.

Clarification gate ownership remains split by owner map: `/chat` and `/audit` consumers may raise a question when OpenCode coverage, cross-doc `/reference`, runtime identity, TODO routing, or GUI ownership is ambiguous, but the final target decision follows the canonical owner map rather than a consumer-only note.


The Instant Grep packet uses the following ownership split:
- `Tools.md` is the primary owner for grep tool semantics, sparse-n-gram query flow, covering/fallback rules, and `tool.invoked.index_used`
- `storage-plan.md` is the primary owner for regex-index storage layout, binary formats, dirty-layer lifecycle, publication, and startup recovery
- `FinalGUISpec.md` is the primary owner for indexing settings, status-bar disclosure, Search ownership, and remote-cache administration surfaces
- `GitHub_Integration.md` is the primary owner for remote Git/non-Git cache behavior, verification paths, staging, re-anchor, and no-silent-local-fallback reconciliation
- `assistant-chat-design.md`, `UI_Command_Catalog.md`, `Glossary.md`, `Architecture_Invariants.md`, `BinaryLocator_Spec.md`, `usage-feature.md`, and `Wiring_Matrix.md` are required reconciliation consumers

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md


### Browser canon reconciliation note (2026-03-19)

The built-in browser packet uses the following ownership split:
- `Section15_MVP_Promoted_Features_Spec.md` is the browser behavior SSOT for session-class/session classes, runtime model, built-in browser named actions, DevTools, action/command families, capture rules, permissions defaults, persistence hooks, recovery expectations, and anti-drift/non-goals
- `rewrite-tie-in-memo.md` is the rewrite-baseline constraint owner for browser-runtime and preview/browser architectural assumptions, including CEF/editor-tab canon and stale bottom-panel / `wry` wording cleanup
- `FinalGUISpec.md`, `FileManager.md`, and `UI_Command_Catalog.md` are the primary browser consumers for placement, open flows, click-to-context, and user-visible commands
- `assistant-chat-design.md`, `Prompt_Pipeline.md`, `Permissions_System.md`, `storage-plan.md`, `Runtime_Artifacts_Panel.md`, `newtools.md`, and `Wiring_Matrix.md` are reconciliation consumers for chat capture, prompt assembly, permissions, persistence, evidence, live testing/tooling, and command wiring
- `signal_confidence` values used by browser and related recovery evidence are locked to `authoritative`, `structured`, `heuristic`, and `local_only`

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/UI_Command_Catalog.md

`newfeatures.md` remains historical/origin material only for this topic. Normative browser behavior now lives in the promoted Section 15 owner and the reconciled subsystem SSOT docs above.

Browser cleanup rule: `Plans/newfeatures.md §15.18`, stale-reference cues, `/stale-canon`, `/WebView2/WebKitGTK`, detached-first runtime matrices, older `trust-tier` browser permission matrices that predate the locked three-action `allow` / `ask` / `deny` permission model and deterministic precedence rules, `document_selection_context` browser capture wording, bottom-panel-primary host wording, and browser state fields that omit requested/effective capability disclosure are retired origin/stale-canon cues, not live browser owners or implementation alternatives.

Browser consumer map: Section 15 owns browser behavior, session classes, action families, permissions defaults, persistence hooks, recovery expectations, and non-goals; Final GUI, File Manager, and UI Command Catalog are the primary browser consumers for placement, preview/click-to-context, and user-visible commands; Wiring Matrix records open, focus, detach, DevTools, share, takeover, `/promote`, and recovery command routing; `newtools.md` stays a testing/tooling consumer for built-in browser verification rather than the product browser owner.

ContractRef: ContractName:Plans/newfeatures.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md

### Slash-Command and Chat-Tools SSOT Map

For the chat/tools reconciliation packet, `Plans/00-plans-index.md` is an index and ownership map only; it is not the SSOT for slash-command schemas, tool permission rules, GUI `/presentation`, or persisted event payloads. Avoid schema duplication here: keep the runtime/event envelope in `Contracts_V0.md`, concrete child payload registration in `Plans/storage-plan.md`, and treat `Plans/feature-list.md` (`/feature-list.md`) plus slash-command summary docs as dependent `/docs` updates after the owning SSOT docs are corrected.

Reconciliation order is locked as follows: phase A resolves slash-command SSOT in `assistant-chat-design.md`, `UI_Command_Catalog.md`, and `Commands_System.md`; phase B resolves tool and permission contracts in `Tools.md` and `Permissions_System.md`; phase C resolves GUI behavior and `/presentation` in `FinalGUISpec.md`; phase D resolves persistence registration in `Plans/storage-plan.md`, with only minimal additive examples in `Contracts_V0.md` / `Contracts_V0` when truly necessary.

Stable ready-now scope includes the `/web` command family, normalized operation set, distinct activity labels, distinct tool keys, permission-key expansion, citation/provenance precedence, bounded operation defaults, and additive web child payload recommendations. Blocked/provider-runtime scope remains provider taxonomy, account-selection or routing algorithm internals, provider settings rows/layout, and global versus per-operation provider ordering UX.

Highest drift-risk pairs stay visible in this index: `Tools.md` versus `assistant-chat-design.md` / `FinalGUISpec.md`; `Permissions_System.md` versus explicit PM Ask `/Plan` semantics; slash-command docs across `assistant-chat-design.md`, `Commands_System.md`, and `UI_Command_Catalog.md`; chat question `/todo` behavior versus storage `/event` docs; and assistant `/chat` display needs versus the shared runtime owner boundary.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### Artifact, HITL, and Tool Contract Ownership Map

Artifact, HITL, and tool approval canon uses an owner split rather than a three-way SSOT. `Plans/Runtime_Artifacts_Panel.md` owns runtime artifact presentation and artifact-surface behavior; `Plans/storage-plan.md` owns durable artifact-projection key families and projector storage; `Plans/Contracts_V0.md` owns the shared event envelope, persisted approval events, and compatibility boundary for request-era identifiers; `Plans/Tools.md` owns tool policy flow, `tool.denied`, and headless ask/deny/HITL mapping; `Plans/human-in-the-loop.md` owns HITL configuration and blocked-episode approval UX; and `Plans/Permissions_System.md` owns permission snapshot and approval-ladder semantics.

The `request_id <-> blocked_sequence` relation is compatibility and lineage routing: surviving `request_id` values resolve to the canonical blocked episode before a runtime mutation is allowed. New tool-approval or HITL surfaces use `blocked_sequence`, `approval_scope_key`, and ordered `allowed_action_ids[]`; they do not revive `allowed_actions` as a peer field family or let a generic session approval widen beyond its explicit scope key.

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Permissions_System.md

### Terminal Ownership Map

The terminal subsystem uses the following ownership split:
- Owner / canonical behavior: `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/FinalGUISpec.md`, and `Plans/storage-plan.md` own terminal section/tab/pane/session identity, terminal placement and settings UI, terminal persistence, and platform capability disclosure.
- Primary terminal consumers: `Plans/assistant-chat-design.md` and `Plans/FileManager.md` consume terminal ownership for command cards, Open in Terminal reveal, editor/file workflows, and terminal/browser tabs without becoming the terminal SSOT.
- Command, routing, and acceptance: `Plans/UI_Command_Catalog.md`, `Plans/Contracts_V0.md`, and `Plans/Wiring_Matrix.md` own terminal command IDs, canonical event/action contracts, and cross-surface wiring.
- Adjacent policy / runtime / terminology: `Plans/Tools.md`, `Plans/Run_Modes.md`, `Plans/Multi-Account.md`, `Plans/Permissions_System.md`, and `Plans/Glossary.md` remain required companions for shell execution policy, provider/account health signals, permission disclosure, and terminal vocabulary.

Terminal anti-drift review starts with the owner specs (`Section15_MVP_Promoted_Features_Spec.md`, `FinalGUISpec.md`, `storage-plan.md`), terminal consumers (`assistant-chat-design.md`, `FileManager.md`), and command, contract, and wiring docs (`UI_Command_Catalog.md`, `Contracts_V0.md`, `Wiring_Matrix.md`). Reconcile those owner and consumer docs before treating older terminal phrasing as canonical.

Terminal packets that omit `Plans/UI_Command_Catalog.md`, `Plans/Contracts_V0.md`, or `Plans/Wiring_Matrix.md` are non-buildable because route, command, and acceptance wiring canon would be absent.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### File Manager / Editor Reconciliation Ownership Map

The file manager and editor seam is now bounded reconciliation, not additional architecture discovery. Owner-doc posture is now-locked as follows:
- `Crosswalk.md` owns the boundary map for primitive ownership and cross-doc routing.
- `GitHub_Integration.md §C` owns SSH remote target ownership, remote-mode project context, and the one-bounded-auto-retry reconnect behavior.
- `LSPSupport.md` owns the LSP support catalog, server-selection, `/conflict/runtime` rules, and LSP-specific fallback behavior.
- `FileManager.md` owns `OpenFile`, shared-buffer `/editor/file-surface` behavior, file-manager-local search `/filter`, and compact repo/worktree context in the file surface.
- `Section15_MVP_Promoted_Features_Spec.md` plus `storage-plan.md` own terminal/runtime identity, persistence tiers, requested `/effective` runtime state, and cross-surface linkage.
- `FinalGUISpec.md` owns shell realization, GUI placement, inspectors, banners, and user-facing wording that consumes owner docs without re-owning them.

The minimal reconciliation sequence starts with contradictions and stale references in canonical owner and /consumer docs before adding more owner text: normalize SSH reconnect wording to `GitHub_Integration.md §C` now-locked one-bounded-auto-retry behavior, remove stale browser or bottom-panel residue from `FinalGUISpec.md`, repair language-detection and LSP cross-references, and surface remote-mode consequences in `Crosswalk.md`.

File-manager/editor packetization is coherence-gated: `Plans/Wiring_Matrix.md` is required whenever reconciliation introduces `cmd.search.*`, `cmd.file.*`, `cmd.chat.add_file_reference`, or added `cmd.git.*` rows, otherwise command routing is non-coherent. `UI_Command_Catalog.md` and `GitHub_Integration.md` may receive additive deepening, but those additions must retire any implication that the existing smaller `cmd.git` or `cmd.git.*` command sets are complete; `FinalGUISpec.md`, `FileManager.md`, `LSPSupport.md`, `storage-plan.md`, and `assistant-chat-design.md` are replace/retire stale canon surfaces for this packet rather than simple append-only targets.

File-manager/editor packetization register: **MUST CHANGE** docs are `Plans/FinalGUISpec.md`, `Plans/FileManager.md`, `Plans/UI_Command_Catalog.md`, `Plans/LSPSupport.md`, `Plans/GitHub_Integration.md`, `Plans/storage-plan.md`, and `Plans/assistant-chat-design.md`; **MUST RECONCILE** is `Plans/Wiring_Matrix.md`; **MUST VERIFY** docs are `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/rewrite-tie-in-memo.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/Prompt_Pipeline.md`, `Plans/Contracts_V0.md`, `Plans/Tools.md`, `Plans/Crosswalk.md`, `Plans/WorktreeGitImprovement.md`, `Plans/FileSafe.md`, and `Plans/newtools.md`. This register supersedes raw coverage-ledger notes; `Plans/sharding_config.json` remains shard configuration and artifact policy rather than the packet-intent owner.

Browser residue cleanup rides with shell-placement, file-action, and remote/recovery reconciliation rather than becoming a separate seventh packet. Stale cues such as `Browser tab (§7.20)`, `Bottom Panel Browser tab`, `browser panel/window`, `preview_mode = browser_panel`, and `max 5 attempts` are retired browser-cleanup markers; live browser/session verification stays in the ring of `Section15_MVP_Promoted_Features_Spec.md`, `rewrite-tie-in-memo.md`, `Runtime_Artifacts_Panel.md`, `Prompt_Pipeline.md`, and `newtools.md`. The retired cue list explicitly includes `FinalGUISpec.md` storage-table `1011-1015` keys `ssh_connections:v1` / `browser_state:v1`, promoted-features `1204-1217`, risk-table `1188-1190`, and `FileManager.md` `570` / `590` line cues so the stale browser names collapse into the new command/state model instead of surviving as peer canon.

Remote/session storage promotion is explicit: if reconciliation canonizes persisted/event-level `host_id`, `root_identity`, or remote freshness/health/write-availability fields beyond storage/UI prose, `Plans/Contracts_V0.md` is promoted from **MUST VERIFY** to **MUST RECONCILE** for that packet instead of being left as a loose verification-only reference. This guard covers `/event-level` identity, `/health/write-availability`, and the browser/session verification ring without treating packetization notes as owner docs.

GUI worktree visibility is part of the seam, not a cosmetic pass. `FinalGUISpec.md` owns visible cross-surface behavior; `FileManager.md` may show compact repo/worktree context in its header or `/strip` but must not own commit `/history/graph/worktree` management; `WorktreeGitImprovement.md` owns worktree lifecycle and `/recovery`; `assistant-chat-design.md` (assistant-chat-design) owns compact preview cards that route into the real owner surfaces.

When multiple roots or worktrees are relevant, File Manager preserves `repo_id` and `worktree_id` when handing off to Source Control, which remains compact, worktree-first, and Git-native. PM should show active worktree context at the `/workspace`, file-surface header, Source Control strip, editor status, or breadcrumb level when ambiguity, non-default roots, or `/conflicted` worktree state matters; it should not repeat a worktree symbol on every file row or `/tab` by default.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/WorktreeGitImprovement.md

### Debug canon reconciliation note (2026-03-23)

The Debug Mode packet uses the following ownership split:
- `Plans/assistant-chat-design.md` is the Assistant Debug Mode owner for mode-strip behavior, Investigation Context visibility, thread lifecycle, attach-to-chat payload handling, and slash-command expectations
- `Plans/Run_Modes.md`, `Plans/Permissions_System.md`, and `Plans/storage-plan.md` own runtime posture, Debug Automation Profile behavior, and persisted investigation identity/state
- `Plans/Section15_MVP_Promoted_Features_Spec.md` owns browser-target debug behavior and the visible browser evidence / automation contract, including browser-backed `automation_session` visibility, Debug-specific auto-ingestion, auth handoff / `attention_required`, session-class consistency, and takeover/`/promote` behavior
- `Plans/Runtime_Artifacts_Panel.md`, `Plans/Contracts_V0.md`, `Plans/Prompt_Pipeline.md`, and `Plans/Tools.md` own artifact grouping, event fields, prompt assembly, and shared debug-capable tool semantics
- `Plans/FinalGUISpec.md`, `Plans/UI_Command_Catalog.md`, `Plans/newtools.md`, `Plans/GitHub_Integration.md`, and `Plans/feature-list.md` are primary consumers for shell placement, command routing, tooling discovery, remote scope, and summary coverage
- `Commands_System.md`, `Glossary.md`, `FileManager.md`, `human-in-the-loop.md`, `Architecture_Invariants.md`, `orchestrator-subagent-integration.md`, `interview-subagent-integration.md`, `Wiring_Matrix.md`, `rewrite-tie-in-memo.md`, and `MiscPlan.md` are required reconciliation companions

Debug packetization must keep `Plans/Commands_System.md`, `Plans/Glossary.md`, and `Plans/Wiring_Matrix.md` in scope together; if it omits any of them, the shipped canon will still drift on slash-command semantics, terminology, and command-routing coverage.

Debug packetization must keep `Plans/Contracts_V0.md`, `Plans/Prompt_Pipeline.md`, and `Plans/GitHub_Integration.md` in scope together; if the packet only follows the earlier minimum checklist and omits any of them, canon will drift on persisted fields, prompt assembly, and remote Debug scope even if the primary UI/runtime docs are updated.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

| Plan | Primary scope | Notes / canonical intent |
|------|--------------|--------------------------|
| `rewrite-tie-in-memo.md` | Locked rewrite decisions | Canonical for rewrite constraints + deltas to apply elsewhere |
| `Section15_MVP_Promoted_Features_Spec.md` | Promoted Section 15 feature owner | Canonical owner for the promoted Section 15 shell, browser, project-switch, workspace-tab/window, thread-usage, catalog-lifecycle, terminal/dev-loop, and cross-feature defaults/identities/non-goals set. |
| `agent-rules-context.md` | Application/project rules pipeline | Canonical for rules sourcing + injection into every agent/provider run |
| `orchestrator-subagent-integration.md` | Main run loop policy: tiers, subagents, wiring validation | Registry-driven Persona set (canonical list §4: Phase, Task lang/domain/framework, Subtask, Iteration, Cross-phase including `explorer` and `requirements-quality-reviewer`). DRY:DATA:subagent_registry; task tool (Tools.md §3.6) validates against this list. Persona definitions, storage, schema, and injection: `Plans/Personas.md` (SSOT). Treat platform specifics as Provider concerns. |
| `interview-subagent-integration.md` | Interview phases + subagent use | `Plans/interview-subagent-integration.md` owns interview-phase subagent use. Phase assignments use the registry-driven Persona set; cross-phase (`ux-researcher`, `knowledge-synthesizer`, `explorer`, `requirements-quality-reviewer`, etc.). Mirrors orchestrator patterns at interview-phase boundaries. Persona injection per `Plans/Personas.md` §5.2. `context-manager` is source-lineage/import seed vocabulary, not a PM Persona catalog entry. |
| `assistant-chat-design.md` | Assistant/Chat UX and modes | Canonical for chat/thread/session navigation, PM-native Ask/Plan semantics, slash-command behavior, shared question flows, activity transparency, `/web`, `/skill`, and plan/TODO semantics. |
| `assistant-memory-subsystem.md` | Assistant-only memory continuity subsystem | Canonical SSOT for Assistant memory boundary, per-project memory stores (`assistant_memory.redb` + lexical/semantic indexes), decay scoring, capsule/retrieval budgets, and maintenance operations. Explicitly separate from rules pipeline contracts. |
| `FinalGUISpec.md` | Slint GUI contract | Canonical UI source for shell/layout/view placement, responsive behavior, settings IA, chat widgets/activity cards/plan tracker, Agent Config > Skills, Agent Config > Personas placement, browser/terminal surfaces, and Interaction Mode (Expert/ELI5) + Chat ELI5 defaults/independence. |
| `GitHub_Integration.md` | GitHub/Git IDE integration spec | Git panel (repo/branch/diff/operations), GitHub API (OAuth device-code, PRs, Actions), SSH remote dev servers, no-wizard project flows (Add Existing / New Local / New GitHub Repo). Cross-refs: Plans/GitHub_API_Auth_and_Flows.md, Plans/FileManager.md, Plans/chain-wizard-flexibility.md. |
| `FileManager.md` | File Manager panel, IDE-style editor, @ mention, click-to-open | Canonical for file tree, editor (tabs, split panes, save, line numbers, syntax), image viewer, HTML/browser preview, detached preview behavior, `@` mention integration, terminal/browser tabs (§9), editor enhancements MVP (§10), language/framework presets (§11). |
| `LSPSupport.md` | LSP client support for rewrite | **LSP is MVP** -- in scope for desktop release. Canonical for LSP diagnostics, navigation, chat/editor LSP behavior, server registry/root discovery, and the widened canonical `lsp` tool surface used by Assistant Chat and editor workflows. |
| `storage-plan.md` | seglog, redb, Tantivy, projectors, analytics scan | Canonical persistence and restore model for project identity, workspace tabs, windows, browser/preview state, terminal sessions, dev sessions, plan/TODO/question/activity state, usage projections, and analytics scan rollups. |
| `chain-wizard-flexibility.md` | Wizard intents + requirements canonicalization + GitHub flows | Canonical for intent-based flows and requirements merge/canonical artifact |
| `Document_Packaging_Policy.md` | Deterministic packaging for large Markdown/text artifacts | Canonical Document Set contract: sharded set + `00-index.md` + `manifest.json` + full audits with non-bypassable run failure on verification breach. |
| `Planning_Ledger_System.md` | Bootstrap planning ledger and future native ledger service | Canonical for the Bootstrap Ledger, Native Ledger Service import/export boundary, compact operating capsules, per-turn ledger protocol, design_atom lifecycle, exact source-lineage preservation, owner ambiguity handling, and ledger-to-Plan compilation boundary. |
| `Plan_Document_System.md` | Standardized Plan docs and PlanUnit contract | Canonical for Plan doc layout, PlanUnit fields including `gui_related: true|false`, owner adjudication metadata, lossless Plan conversion proof, generated PlanUnit indexes, and node-readiness metadata. |
| `Plan_To_Node_Compilation.md` | PlanUnit index and node-readiness boundary | Canonical for future PlanUnit-to-NodeSeed-to-WorkNode compiler inputs and the current readiness-only boundary. It does not create WorkNodes, executable build tasks, or NodeSeed candidates before the compiler contract is complete. |
| `Bootstrap_Planning_Migration.md` | Bootstrap ledger migration and governance seal workflow | Canonical for AGENTS trigger use, Codex Goal-phase migration, less-than-4,000-character goal prompt posture, controlled Plan conversion batches, Spec Lock seal timing, and retired prompt-packet/tranche experiment exclusions. |
| `human-in-the-loop.md` | HITL semantics at tier boundaries | Canonical for pause-for-approval toggles + tier boundary meaning |
| `FileSafe.md` | Safe-edit guards + context compilation | Canonical blocked destructive-command behavior and restore-before-rerun integration; maps to central tool policy + patch pipeline. |
| `Prompt_Pipeline.md` | Prompt assembly pipeline + compaction contract | SSOT for prompt assembly stage ordering and compaction/rotation contracts (pairs with FileSafe Part B for compilation details). |
| `WorktreeGitImprovement.md` | Worktree/git correctness + GUI wiring | Canonical for stable project identity vs path rebinding and worktree-aware project-switch/restore behavior. |
| `MiscPlan.md` | Cleanup + runner contract + artifact retention | Maps to patch pipeline + event artifacts retention |
| `newtools.md` | GUI testing/tools discovery + MCP tooling | Canonical for MCP settings/UI flow, cited search, testing-tool discovery, and runtime-health-oriented MCP GUI behavior. |
| `Tools.md` | Built-in tools, custom tools, permissions (allow/deny/ask) | Canonical for tool semantics, MCP integration, requested-vs-effective tool availability, normalized `question` / TODO tool contracts, expanded web operations, Site Reader structured browser runtime, `task`, widened `lsp`, and permission-adjacent tool behavior. |
| `OpenCode_Deep_Extraction.md` | OpenCode pattern extraction procedure + known-good baseline | Provenance doc for extracting upstream patterns and mapping them into Puppet Master SSOT docs. Covers 8 subsystems (run modes, agents, permissions, commands, formatters, skills, plugins, models) with file pointers, behavior summaries, SSOT mapping table (§8), and delta hooks (§9). |
| `Decision_Log.md` | Decisions made during plan updates | Records decisions not captured in `auto_decisions.jsonl`; timestamped and final. |
| `usage-feature.md` | Usage UX + dashboards | Canonical for app-wide Usage plus per-thread usage in chat, shared UsageRecord ownership, and cost_usage deep-link behavior. |
| `Runtime_Artifacts_Panel.md` | Artifacts panel (runtime artifacts) | Canonical for 19 artifact types, seglog `runtime_artifact.*`, redb `artifacts_index:v1:{project_id}`, cost_usage, Show in Ledger/Usage, browser recordings, and JSON schemas. Distinct from Project Plan Package (`Project_Output_Artifacts.md`). |
| `Project_Output_Artifacts.md` | Project Plan Package outputs | Canonical owner for user-project Project Plan Package artifacts under `.puppet-master/project/**`, including plan graph indexes/nodes, acceptance and requirements quality reports, requirements coverage outputs, quickstart derivation, and deterministic validation rules. Distinct from runtime artifacts, permission approval scope, and transfer packet recovery policy. |
| `newfeatures.md` | Feature ideas + patterns | Historical/origin source for promoted Section 15 ideas; normative behavior for promoted items now lives in the promoted Section 15 owner and reconciled subsystem SSOTs. |
| `Widget_System.md` | Cross-cutting widget catalog, grid layout, add-widget flow | Canonical for portable page widgets, grid-based resizing, layout persistence. Referenced by Dashboard, Usage, Orchestrator pages. Single widget catalog shared across all widget-composed surfaces. |
| `Run_Graph_View.md` | Node Graph Display (Airflow-style DAG view) | Canonical for the full-page graph visualization tab on the Orchestrator page. NOT a portable widget. Includes Slint implementation guide, data model contract, 5 layout presets, 8-section detail panel, HITL controls, performance targets (500 nodes). |
| `Orchestrator_Page.md` | Orchestrator single-page 6-tab structure | Canonical for tab layout (Progress / Seams / Node Graph Display / Evidence / History / Ledger). Widget-based tabs reference Widget_System.md. Node Graph tab references Run_Graph_View.md. Terminal widgets, prose summaries, data source documentation. |
| `GUI_Rebuild_Requirements_Checklist.md` | Auditable summary checklist for 2026-02-23 GUI rebuild handoff requirements | `Plans/GUI_Rebuild_Requirements_Checklist.md` is the single verification table confirming coverage for widget system, Usage page, chat context enhancements, Dashboard widget grid migration, Orchestrator 6-tab structure, and Node Graph image-backed spec. |
| `Executor_Protocol.md` | Deterministic overseer flow and lifecycle semantics | Canonical for Builder/Verifier/Overseer roles, next-ready selection, and verifier-driven auto completion to `done`. |
| `UI_Wiring_Rules.md` | UI wiring rules + verification | Canonical for Rule 1 (UI dispatches only typed UICommands) and Rule 2 (every UI element maps to one UICommandID). Defines UI Command Dispatcher boundary and Wiring Matrix verification concept. |
| `Provider_Stream_Mapping_External_Reference_A2A.md` | Upstream external-framework + A2A bridge → V0 stream mapping | Canonical mapping of upstream native events and A2A bridge concepts to V0 normalized stream events. Diagnostic instrumentation categories, deterministic rules, and Overseer audit protocol instrumentation. Cross-refs: CLI_Bridged_Providers.md, Architecture_Invariants.md#INV-001, Glossary.md, Executor_Protocol.md. |
| `Provider_OpenCode.md` | OpenCode server-bridged provider integration | Optional provider; user installs OpenCode locally; Puppet Master connects via HTTP REST + SSE. See also CLI_Bridged_Providers.md (extended for HTTP transport). |
| `BinaryLocator_Spec.md` | Deterministic provider CLI discovery | Canonical algorithm for locating + validating external Provider CLIs (initially Cursor Agent + Claude Code) across OS using only official install footprints (override/PATH/common locations/launchers). |
| `Run_Modes.md` | Canonical run-mode definitions + CLI-bridged strategy selection | SSOT for Mode enum (ask/plan/regular/yolo), HTE vs DAE strategy selection, budget defaults, kill conditions, outcome taxonomy, and mode-specific context-management deltas. |
| `Personas.md` | Canonical Persona system definitions | SSOT for Persona vs Agent vs Subagent definitions, storage layout (`.puppet-master/personas/` + `~/.config/puppet-master/personas/` plus PM-owned built-ins), PERSONA.md schema (YAML frontmatter + body), validation rules, protected core IDs (`assistant`, `general-purpose`, `overseer`, `bash`, `teacher`, `collaborator`, `researcher`, `deep-researcher`, `explorer`), the explicit non-core `Document Writer` boundary, Agent Config > Personas management rules, prompt visibility, specialty curation, context-injection rules, and registry relationship. |
| `Permissions_System.md` | Canonical permission system definitions | SSOT for permission actions (`allow`/`ask`/`deny`), multi-layer precedence (mode > session > Persona > project > global > defaults), PM-native Ask/Plan mode semantics, granular rules (wildcard syntax, last-match-wins), special guards (`doom_loop`, `external_directory`), question/TODO/web tool defaults, `.env` deny rules, resolution algorithm, TOML persistence, permission profiles, and GUI requirements (Settings > Permissions). |
| `Commands_System.md` | Canonical User Commands system | SSOT for User Commands (user-authored command presets): definitions (User Command vs UICommand distinction), storage layout (`.puppet-master/commands/` + `~/.config/puppet-master/commands/`), command schema (YAML frontmatter + Markdown template body), template syntax (`$ARGUMENTS`, `$N`, `@path`, `` !`cmd` ``), execution semantics (subtask, Persona/mode/model overrides), reserved built-in slash-command collision rules, permissions integration, GUI requirements (Settings > Rules & Commands > Commands), and dry-run preview. |
| `Skills_System.md` | Canonical skills system | SSOT for skill discovery/storage roots, SKILL.md schema (frontmatter + body), validation rules, permission integration, Persona skill refs (`default_skill_refs`), runtime surface (via `skill` tool), and GUI requirements under Agent Config > Skills. |
| `Plugins_System.md` | Canonical plugin system | SSOT for plugin discovery (internal/project/global/config paths), load order (deterministic), plugin context, 10 hook events with typed I/O and return enums, compaction hook (InjectContext/ReplacePrompt), custom tool registration with collision policy, structured plugin logging, GUI requirements (Settings > Plugins), and OpenCode baseline/deltas. |
| `Formatters_System.md` | Canonical formatter system | SSOT for formatter lifecycle (HTE-only, triggered on File.Edited), built-in formatter table (21 formatters), per-formatter config (disabled/command/environment/extensions, `$FILE` placeholder), evidence tracking via `format.applied` events, GUI requirements (Settings > Formatters), and OpenCode baseline/deltas. |
| `Models_System.md` | Canonical model system | SSOT for canonical model ID (`provider_id/model_id`), 6-level selection priority, model options (per-provider+model), per-Persona model overrides (`default_model`/`default_variant` in PERSONA.md frontmatter), variants (built-in default/fast/powerful + custom + disabling + cycling), canonical media model alias table (§6.8: Nano Banana, Nano Banana Pro, Veo fast, TTS flash, TTS pro), GUI requirements (Settings > Models, Chat model picker, variant picker), and OpenCode baseline/deltas. |
| `Media_Generation_and_Capabilities.md` | Media generation and capability system SSOT | Canonical for `capabilities.get` (internal tool returning all media + provider-tool capabilities with enabled/disabled + disabled_reason + setup hints), `media.generate` (uniform media generation interface with per-request `model_override`, artifact-path output, and stable error codes), natural-language slot extraction grammar (deterministic regex-based prompt parsing), capability picker dropdown UI/UX, Cursor-native image routing (Image only; Video/TTS/Music unsupported on Cursor), Gemini media APIs, and verbatim UI copy strings. Model aliases for media (Nano Banana, Nano Banana Pro, Veo fast, TTS flash, TTS pro) are DRY-referenced from `Plans/Models_System.md` §6.8. |
| `OpenCode_Coverage_Matrix.md` | OpenCode-to-SSOT coverage audit | Audit of all OpenCode-derived capabilities (extraction §7A–§7H) vs Puppet Master SSOT docs. Coverage matrix, DRY authority audit, GUI/config wiring audit, and mandatory fix list (anchors/subsections). |
| `Wiring_Matrix.md` | Wiring matrix template + examples | Canonical routing for UI command producer/consumer mappings and required runtime/browser/dev/catalog wiring coverage; example/template posture is subordinate to the canonical runtime wiring sections. |


### Instant Grep (sparse n-gram index) canon reconciliation note


The Instant Grep packet uses the following ownership split:
- `Tools.md` is the primary owner for grep tool semantics, index-accelerated query flow, covering algorithm, fallback behavior, and `tool.invoked` analytics fields
- `storage-plan.md` is the primary owner for regex index storage layout (§2.1), binary file formats, generation directory scheme, file watcher dual-consumer model (§2.4), and sensitive indexing guards
- `FinalGUISpec.md` is the primary owner for status bar Indexing indicator (§3.2), Indexing settings section (§7.4.2), and Search panel index-acceleration UX (Search side-panel owner)
- `GitHub_Integration.md` is the primary owner for remote project search index cache (§C.3), bare Git clone lifecycle, non-Git remote indexer binary, and cache settings
- `assistant-chat-design.md`, `UI_Command_Catalog.md`, `Glossary.md`, `Architecture_Invariants.md`, `BinaryLocator_Spec.md`, `usage-feature.md`, `Wiring_Matrix.md`, and `00-plans-index.md` are reconciliation consumers

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md

## Known cross-cutting duplication hotspots


The highest-risk duplication hotspots for this planning set are now:

- child-run canon versus provider-native subagent language
- Persona selection versus subagent registry language
- crew shared-state versus legacy memory-manager language
- dynamic context shrinking versus compaction and Subcompact language
- requested/effective runtime surface and effort language
- blocked/awaiting-parent versus older denial or recovery aliases
- Context Lens UI wording versus command and wiring ownership

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md

Rewrite-era guidance:
- owner docs define the canon.
- consumer docs should reference owner docs rather than re-describing the full model.
- packetization and reconciliation should prefer rewrite-outright where stale canon would remain misleading if left in place.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Progression_Gates.md
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
| `Commands_System.md` | [`Plans/_shards/commands_system/00-index.md`](Plans/_shards/commands_system/00-index.md) |
| `Executor_Protocol.md` | [`Plans/_shards/executor_protocol/00-index.md`](Plans/_shards/executor_protocol/00-index.md) |
| `UI_Command_Catalog.md` | [`Plans/_shards/ui_command_catalog/00-index.md`](Plans/_shards/ui_command_catalog/00-index.md) |
| `Skills_System.md` | [`Plans/_shards/skills_system/00-index.md`](Plans/_shards/skills_system/00-index.md) |
| `Multi-Account.md` | [`Plans/_shards/multi-account/00-index.md`](Plans/_shards/multi-account/00-index.md) |
| `Personas.md` | [`Plans/_shards/personas/00-index.md`](Plans/_shards/personas/00-index.md) |
| `Provider_OpenCode.md` | [`Plans/_shards/provider_opencode/00-index.md`](Plans/_shards/provider_opencode/00-index.md) |
| `human-in-the-loop.md` | [`Plans/_shards/human-in-the-loop/00-index.md`](Plans/_shards/human-in-the-loop/00-index.md) |
| `00-plans-index.md` | [`Plans/_shards/00-plans-index/00-index.md`](Plans/_shards/00-plans-index/00-index.md) |
| `Prompt_Pipeline.md` | [`Plans/_shards/prompt_pipeline/00-index.md`](Plans/_shards/prompt_pipeline/00-index.md) |
| `Wiring_Matrix.md` | [`Plans/_shards/wiring_matrix/00-index.md`](Plans/_shards/wiring_matrix/00-index.md) |
| `GUI_Rebuild_Requirements_Checklist.md` | [`Plans/_shards/gui_rebuild_requirements_checklist/00-index.md`](Plans/_shards/gui_rebuild_requirements_checklist/00-index.md) |
| `Widget_System.md` | [`Plans/_shards/widget_system/00-index.md`](Plans/_shards/widget_system/00-index.md) |
## 2026-03-07 addendum — containers, registry, and Unraid

- Registered `Plans/Containers_Registry_and_Unraid.md` as the canonical SSOT for first-class DockerHub image publishing, contextual Docker management UI, managed Unraid template repositories, and `ca_profile.xml` behavior.

| Plan | Primary scope | Notes / canonical intent |
|------|--------------|--------------------------|
| `Containers_Registry_and_Unraid.md` | First-class DockerHub publishing, container runtime management, and Unraid template workflows | Canonical for DockerHub browser/PAT auth UX, requested vs effective auth capability, protected repo creation, contextual Docker Manager UI, managed template-repo defaults, `ca_profile.xml` scope/editability, and maintainer-asset handling. |

## Runtime Packet Index Coverage Consolidation Addendum (2026-03-09)


Update index descriptions so readers can find the owning docs for:
- scheduler semantics and queue analysis
- event/contracts and storage for attempts, safe points, and remediation lineage
- blocked-state UX and recovery actions
- provider/auth/permission mappings into runtime taxonomy
- glossary ownership for new runtime terms

Index descriptions for this packet MUST point readers to:
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Glossary.md
- `Plans/Contracts_V0.md` for canonical events, enums, identities, and action fields
- `Plans/Executor_Protocol.md` for scheduler semantics, attempt lifecycle, and graph-lock behavior
- `Plans/storage-plan.md` for persistence and restart rules
- `Plans/Run_Graph_View.md`, `Plans/Orchestrator_Page.md`, and `Plans/FinalGUISpec.md` for rendering and interaction
- `Plans/chain-wizard-flexibility.md`, `Plans/assistant-chat-design.md`, and `Plans/interview-subagent-integration.md` for paused/degraded planning-state semantics
- `Plans/Glossary.md` for canonical runtime terminology

## 2026-03-12 addendum — source control, GitHub Actions, and Docker Manager

- `Plans/GitHub_Integration.md` now owns two distinct operational surfaces: Git-first Source Control and GitHub Actions.
- `Plans/WorktreeGitImprovement.md` remains canonical for worktree correctness and runtime alignment, but Source Control is the primary user-facing worktree surface.
- `Plans/Containers_Registry_and_Unraid.md` is the canonical owner for Docker Manager, including Publish / Unraid and project-focused Kubernetes placement.
- `Plans/newtools.md` remains canonical for Docker/Actions doctor and result minima and must be read alongside the feature-owner docs.
- `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/Permissions_System.md`, and `Plans/usage-feature.md` are required anti-drift companions for this packet.

Restart-pass by-doc owner map:
- `Plans/FinalGUISpec.md` owns the activity-bar and side-panel vocabulary for Source Control, GitHub Actions, Docker Manager, cross-surface deep links, blocked-state presentation, and mirror/owner attention behavior.
- `Plans/GitHub_Integration.md` owns the Source Control versus GitHub Actions split, including GitHub Actions `Current Branch` / `Workflows` / `Settings`, secrets, variables, `/environments`, rerun/cancel/pin, and workflow authoring help. `Git (GitHub)` is retained only as a retired migration alias.
- `Plans/WorktreeGitImprovement.md` owns worktree-native Source Control details, including worktree inventory, compare/lineage/recovery, review mode, conflict assistant, and blocked-state handoff.
- `Plans/Containers_Registry_and_Unraid.md` owns Docker Manager operational subviews, `/auth/Unraid`, Publish / Unraid, Kubernetes placement, and the retirement of `Docker Manage` as a canonical surface name.
- `Plans/Orchestrator_Page.md` owns lane/run/package truth, Orchestrator receipts, run-blocking recovery pivots, and deep links into Source Control, GitHub Actions, Docker Manager, and Kubernetes owner surfaces.
- Highest `stale-canon` replacement risk for this source-control/GitHub Actions/Docker Manager sweep remains concentrated in `Plans/rewrite-tie-in-memo.md`, `Plans/usage-feature.md`, `Plans/FinalGUISpec.md`, and `Plans/Media_Generation_and_Capabilities.md`; reconcile those consumer docs against the feature owners above before treating older wording as authoritative.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md, ContractName:Plans/storage-plan.md


## Web Tools + Firecrawl + Missing-Spec Owner Alignment Note (2026-03-30)

The reconciled owner and consumer set for web tools, Firecrawl, questions, planning/TODO, permissions, runtime identity, and MCP now spans:
- `Plans/Tools.md`
- `Plans/assistant-chat-design.md`
- `Plans/FinalGUISpec.md`
- `Plans/Permissions_System.md`
- `Plans/storage-plan.md`
- `Plans/Commands_System.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Skills_System.md`
- `Plans/Contracts_V0.md`
- `Plans/Run_Modes.md`
- `Plans/Section15_MVP_Promoted_Features_Spec.md`
- `Plans/MCP_Integration.md`
- `Plans/LSPSupport.md`
- `Plans/CLI_Bridged_Providers.md`
- `Plans/Provider_OpenCode.md`
- `Plans/newfeatures.md`

ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/Tools.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md

Consumer summaries in orchestration, interview, provider, account, and index surfaces defer to those repaired owner sections instead of keeping competing canon. Verify-only docs were checked during reconciliation and are intentionally out of packet scope because no edits were required.

Anchor-level regeneration for this packet must keep the live owner references discoverable and exact enough for repacketization:
- `Plans/assistant-chat-design.md#4.1`, `#8.6`, `#13.1`, `#13.2`, `#13.3`, and `#28.2`
- `Plans/storage-plan.md#4.1`, `#4.3`, and `#4.4`, plus the inline-visualizer persistence section after `#4.4`
- `Plans/Tools.md#3.6`, `#10.3`, `#10.7`, `## 11`, `## 12`, `## 13`, and the new non-Firecrawl provider-detail landing between `## 11` and `## 12`
- `Plans/Permissions_System.md#6`, `#10.4`, and the acceptance-criteria residue term `reject`
- `Plans/Commands_System.md#7` and `#2.4`
- `Plans/Skills_System.md#4` and `#6`
- `Plans/Section15_MVP_Promoted_Features_Spec.md#1.3A`
- `Plans/MCP_Integration.md` new owner sections after `## 4`
- the `Plans/FinalGUISpec.md` audit surface after `### 7.19 Agent Activity` and deeper replacements in `## 15`

The drift-risk heading labels remain exact for validation and regeneration: `### 4.1`, `### 8.1`, `### 8.6`, `### 4.3`, `### 4.4`, `### 3.6`, `### 10.3`, `### 10.7`, `## 11`, `## 12`, `## 13`, `## 6`, and `### 10.4`.

Obligation routing remains explicit:
- `Plans/Tools.md` owns `obl-013`, `obl-014`, `obl-053`, `obl-054`, `obl-066`, and `obl-067`.
- `Plans/Contracts_V0.md` owns `obl-044`, `obl-055`, and `obl-056`.
- `Plans/storage-plan.md` owns `obl-040`, `obl-059`, and `obl-060`.
- `Plans/assistant-chat-design.md` owns or mirrors `obl-036`, `obl-037`, `obl-042`, and `obl-048`.
- `Plans/FinalGUISpec.md` owns or mirrors `obl-035` and `obl-045`.
- `Plans/Commands_System.md` owns `obl-046`.
- `Plans/UI_Command_Catalog.md` owns `obl-047` and `obl-051`.
- `Plans/Permissions_System.md` owns `obl-062`.
- `Plans/LSPSupport.md` owns `obl-064`.

Ownership/index descriptions are drift-sensitive: when a packet changes command/skills/LSP/chat/tool responsibilities, this index text must be updated in the same reconciliation tranche so the owner map does not silently lag the repaired command, skills, LSP, chat, or tool contracts.

`Plans/newfeatures.md` is a summary rollup consumer for repaired web/question/MCP/LSP surfaces; the `/newfeatures.md` map carries the `/question/MCP/LSP` traceability cue and the file-end reconciliation note, while normative behavior remains in the owner docs above.

Slash-command cleanup is locked: `XV2` and `XV-FIX` are AUTHORITATIVE for the reserved-command family, `/clear` is LOCKED and REMOVED from the reserved set, and `assistant-chat-design.md` plus `Commands_System.md` own that locked-removed decision. Native PM structured reading uses `/detail-level` with `minimal`, `summary`, and `full`; it is not MCP-based.

Web-provider drift checks must preserve `/effective-state`, cache-persistence, under-specification, `Rerun in Terminal`, `/TODO/Plan/Deep`, `Plans/Provider_OpenCode.md`, and `Plans/CLI_Bridged_Providers.md` in the cross-doc map so provider, terminal, question/TODO, and command surfaces do not silently diverge from the repaired owner sections.

Firecrawl and missing-spec index drift guard: `Plans/Tools.md` remains the owner for Firecrawl/web tool behavior, no-silent-fallback contracts, and repaired web tools; `Plans/CLI_Bridged_Providers.md` is a Firecrawl provider consumer summary, not competing owner canon; `Plans/assistant-chat-design.md` mirrors web activity/provenance and chat/widget behavior without stale fallback wording; `Plans/Permissions_System.md`, `Plans/storage-plan.md`, and `Plans/Commands_System.md` carry permission, cache, and command consumers. Runtime identity references route through `Plans/Multi-Account.md`; any legacy account-doc mention is a retired shorthand, not a live owner. `plan-mode` `auto-deny`, `question`/`TODO`, `/TODO`, `/widget`, question/TODO contracts, and MCP availability must stay pointed at the repaired owner docs rather than summary-only index prose.

Firecrawl/missing-spec packet-conflict reset (2026-04-06): the section titled `RECONCILIATION / COVERAGE PASS — PACKET-CONFLICT RESET (2026-04-06)` supersedes the older three-bucket, 12-doc, 13-doc, 23-blocker, and coverage-consuming registers for this work-item scope. The scope is the full Firecrawl gap analysis plus missing-spec owner-alignment surface, not only the earlier Firecrawl owner-doc repair: web/provider canon, `/feature` and Settings/chat carry-through, commands and slash families, terminal/inline operation cards, planning/TODO and question contracts, visualizer/Mermaid, skills/Agent Config, subagent/task, LSP, MCP auth/effective-state, runtime identity payloads, permissions, and logging/audit. The reset consumes `54 active` obligations from `canonical_obligations.json` and `7` active coverage blockers into `MUST CHANGE` owner docs (`Plans/Tools.md`, `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/assistant-chat-design.md`, `Plans/FinalGUISpec.md`, `Plans/Commands_System.md`, `Plans/UI_Command_Catalog.md`, `Plans/Skills_System.md`, `Plans/Permissions_System.md`, `Plans/LSPSupport.md`, and `Plans/MCP_Integration.md`) plus `MUST RECONCILE` consumers (`Plans/Models_System.md` and `Plans/newtools.md`); `already_resolved` / `verify_only` obligations `obl-023` through `obl-032`, `obl-058`, `obl-060`, and `obl-067` may stay verify-only only when covered by stronger buckets plus `MUST VERIFY`. Recovery-plan targeting stays exact enough that `Plans/Skills_System.md` remains the `/skill` owner and `Plans/Section15_MVP_Promoted_Features_Spec.md` remains the WebAction/browser consumer. Packet operations must be re-packetized as `replace_section` where stale canon or `packet-appended` section families would survive, especially in `Plans/Tools.md`, `Plans/FinalGUISpec.md`, `Plans/Commands_System.md`, `Plans/newtools.md`, and `Plans/storage-plan.md`; weaker `append`, `insert_after`, or `verify_only` hints and weak obligation hints must not weaken owner-correction operations or active blocker repair for `obl-060`, `obl-067`, `obl-044`, `obl-055`, or `obl-056`. `research_packet.json`, packet-shape reports, verifier outputs, shards, and evidence exports are process artifacts to regenerate or revalidate after canonical docs change; they are not live packet doc intents.

Legacy Firecrawl/missing-spec coverage labels remain live only as reset traceability for owner/consumer routing, not as separate GitHub Integration canon or packet-shape artifacts: `FIDELITY-LF-007` maps to `MUST CHANGE` in `Plans/Permissions_System.md` and `Plans/Tools.md`; `FIDELITY-LF-008` maps to `MUST CHANGE` in `Plans/Permissions_System.md` plus `Plans/Tools.md` and `Plans/Run_Modes.md` carry-through; `FIDELITY-LF-009` maps to `MUST CHANGE` in `Plans/Tools.md` and `MUST RECONCILE` in `Plans/CLI_Bridged_Providers.md`, `Plans/Models_System.md`, and `Plans/newtools.md`; `FIDELITY-LF-011` maps to `MUST CHANGE` in `Plans/Tools.md`; `FIDELITY-LF-012` maps to `MUST CHANGE` in `Plans/Contracts_V0.md` and `Plans/Tools.md`; `FIDELITY-LF-015` maps to `MUST CHANGE` in `Plans/Tools.md` and `MUST RECONCILE` in `Plans/orchestrator-subagent-integration.md`; `FIDELITY-LF-017` maps to `MUST CHANGE` in `Plans/storage-plan.md` and `Plans/Contracts_V0.md` and `MUST RECONCILE` in `Plans/Multi-Account.md` and `Plans/Personas.md`. Older packet-count summaries `13`, `10 MUST CHANGE`, `3 MUST RECONCILE`, `12`, `9 MUST CHANGE`, `2 MUST VERIFY`, `1 MUST VERIFY-only packet extra`, and `11 / 11` are retired by the reset; earlier `canonical_obligations` / `canonical_obligations.json` summaries such as `32`, `doc-local`, `verify_only`, and `already_resolved` are retained only as audit vocabulary when covered by the stronger current buckets. Packet validation is `path-level` and anchor-exact through `GATE-014`, but a `/operation` defect is packet content/operation verification work, not evidence that `Plans/GitHub_Integration.md` or another missing impacted-doc path must be added.

Additional Firecrawl/lost-spec fidelity routing is traceability-only under the same reset: `FIDELITY-01` and `FIDELITY-02` map to `MUST CHANGE` in `Plans/Tools.md`; `FIDELITY-03` maps to `MUST CHANGE` in `Plans/Tools.md`; `FIDELITY-04` maps to `MUST CHANGE` in `Plans/storage-plan.md`; `FIDELITY-05` maps to `MUST CHANGE` in `Plans/MCP_Integration.md`; `FIDELITY-06` maps to `MUST CHANGE` in `Plans/LSPSupport.md`; `FIDELITY-07` maps to `MUST CHANGE` in `Plans/UI_Command_Catalog.md`; `FIDELITY-LF-003` maps to `MUST CHANGE` in `Plans/assistant-chat-design.md`; `FIDELITY-LF-004` maps to `MUST CHANGE` in `Plans/assistant-chat-design.md` and `Plans/FinalGUISpec.md`; `FIDELITY-LF-006` maps to `MUST CHANGE` in `Plans/assistant-chat-design.md`, `Plans/storage-plan.md`, and `Plans/FinalGUISpec.md`; `FIDELITY-LF-010` maps to `MUST CHANGE` in `Plans/Section15_MVP_Promoted_Features_Spec.md`; `FIDELITY-LF-013` maps to `MUST CHANGE` in `Plans/Commands_System.md` and `Plans/assistant-chat-design.md` and `MUST RECONCILE` in `Plans/UI_Command_Catalog.md`; `FIDELITY-LF-014` maps to `MUST CHANGE` in `Plans/Skills_System.md` and `Plans/Tools.md` and `MUST RECONCILE` in `Plans/FinalGUISpec.md`; `FIDELITY-LF-018` maps to `MUST CHANGE` in `Plans/FinalGUISpec.md` and `MUST RECONCILE` in `Plans/assistant-chat-design.md` and `Plans/storage-plan.md`; `FIDELITY-LF-019` maps to `MUST CHANGE` in `Plans/Run_Modes.md`. These mappings do not promote `Plans/GitHub_Integration.md` from adjacent consumer to owner for web, chat, storage, command, skill, MCP, LSP, browser, or run-mode recovery canon.

Index-only fidelity guard: `webmap` remains a minimal `url: string` input that returns `site map + source refs`, with the operation contract owned by `Plans/Tools.md` / command docs. Chat-thread docs are authoritative only from the chat-perspective for UX presentation, while GUI/runtime/system docs are authoritative from the system-perspective for contracts; when they disagree, system-perspective canon wins for contracts and chat-perspective canon wins for UX. The uppercase source term `PERSPECTIVE` is retired as audit vocabulary rather than a live UI label.

## A2A / OpenCode research packet map (2026-03-28)

The A2A / OpenCode research packet is an index and owner-map note only; live runtime, event, permission, usage, prompt, tool/provider, storage, and UI behavior remains in the owner docs below. Draft research-packet artifacts, verifier reports, and other pipeline files are process artifacts, not packet docs and not canonical evidence. For the next packet, the missing owner/consumer docs are `Plans/Executor_Protocol.md`, `Plans/Contracts_V0.md`, and `Plans/assistant-chat-design.md`; `Plans/Prompt_Pipeline.md` is resolved-only unless a fresh contradiction appears.

Broad A2A/OpenCode coverage considered `31` docs, with a final impacted-doc set of `27` and packet scope narrowed away from process artifacts. Clearly implicated owner docs (`16`) are `Run_Modes.md`, `Permissions_System.md`, `Tools.md`, `CLI_Bridged_Providers.md`, `Models_System.md`, `usage-feature.md`, `Contracts_V0.md`, `FileSafe.md`, `storage-plan.md`, `Prompt_Pipeline.md`, `orchestrator-subagent-integration.md`, `GitHub_API_Auth_and_Flows.md`, `LSPSupport.md`, `Executor_Protocol.md`, `Architecture_Invariants.md`, and `Plugins_System.md`. Cross-doc reconciliation seams (`5`) are `Crosswalk.md`, `interview-subagent-integration.md`, `OpenCode_Coverage_Matrix.md`, `WorktreeGitImprovement.md`, and `FinalGUISpec.md`. Verification-only drift watchers (`6`) are `Section15_MVP_Promoted_Features_Spec.md`, `Runtime_Artifacts_Panel.md`, `Wiring_Matrix.md`, `MiscPlan.md`, `assistant-chat-design.md`, and `Provider_Stream_Mapping_External_Reference_A2A.md`. Adjacent docs considered but not bucketed (`4`) are `Provider_OpenCode.md`, `GitHub_Integration.md`, `UI_Command_Catalog.md`, and `FileManager.md` because they are downstream consumers or already defer to the actual owner docs above unless a `MUST VERIFY` check fails.

Intermediate narrowing retained this owner/consumer taxonomy: runtime / orchestration owners are `Run_Modes.md` and `orchestrator-subagent-integration.md`; tool / provider / MCP owners are `Tools.md` and `CLI_Bridged_Providers.md`; mutation / durability owners are `FileSafe.md` and `storage-plan.md`; usage / event / protocol surfaces are `usage-feature.md`, `Contracts_V0.md`, `Executor_Protocol.md`, and `Runtime_Artifacts_Panel.md`; chat / auth / UI consumers are `assistant-chat-design.md`, `GitHub_API_Auth_and_Flows.md`, `FinalGUISpec.md`, and `WorktreeGitImprovement.md`; resolved packet-only blockers are `Prompt_Pipeline.md` and `Media_Generation_and_Capabilities.md`.

Confirmed remaining owner-doc changes (`10`) narrowed into confirmed remaining owner-doc gaps (`8`): `Plans/orchestrator-subagent-integration.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/FileSafe.md`, `Plans/Prompt_Pipeline.md`, `Plans/usage-feature.md`, `Plans/storage-plan.md`, `Plans/Run_Modes.md`, and `Plans/Tools.md`. Consumer / mirror docs that still drift if left untouched (`2`) are `Plans/OpenCode_Coverage_Matrix.md` and `Plans/assistant-chat-design.md`. Verify-only watchers that should not stay as packet doc intents unless a fresh conflict is found (`3`) include `Plans/Contracts_V0.md`, `Plans/FinalGUISpec.md`, and `Plans/Models_System.md`. Current packet docs rechecked and demoted to verify-only (`2`) are `Plans/OpenCode_Coverage_Matrix.md` and `Plans/assistant-chat-design.md`. Additional verify-only drift watchers (`4`) are `Plans/Contracts_V0.md`, `Plans/Permissions_System.md`, `Plans/WorktreeGitImprovement.md`, and `Plans/FinalGUISpec.md`. Additional adjacent docs rechecked and kept out of the final impacted set are `Plans/Architecture_Invariants.md`, `Plans/Executor_Protocol.md`, `Plans/GitHub_API_Auth_and_Flows.md`, `Plans/Models_System.md`, and `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` because the current capability / external-reference framing already matches the narrowed owner set unless the next owner edits expose a fresh contradiction.

An intermediate recheck found no remaining packet-time changes needed for `Plans/Models_System.md`, `Plans/GitHub_API_Auth_and_Flows.md`, `Plans/LSPSupport.md`, `Plans/Executor_Protocol.md`, `Plans/Plugins_System.md`, `Plans/Crosswalk.md`, `Plans/interview-subagent-integration.md`, `Plans/WorktreeGitImprovement.md`, `Plans/FinalGUISpec.md`, and `Plans/Media_Generation_and_Capabilities.md`; those docs stay visible for traceability without becoming stale packet write targets.

Packetization-ready cleanup is explicit: remove direct packet intents for `Plans/Permissions_System.md` and `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`; demote `Plans/Contracts_V0.md` to verify-only unless a fresh schema conflict is found during packet rebuild; retarget packet anchors where current candidates are stale in `orchestrator-subagent-integration.md`, `CLI_Bridged_Providers.md`, `storage-plan.md`, and `assistant-chat-design.md`; keep verifier reports out of packet buckets while preserving auditability of the verify-only watcher set. Verify-only watchers missing from the comparison set include `Plans/FinalGUISpec.md` and `Plans/Models_System.md`.

Current packet over-coverage cleanup also drops `Plans/Run_Modes.md` unless a fresh contradiction appears, drops `Plans/storage-plan.md` unless the `Plans/FileSafe.md` owner rewrite exposes a real neighboring-owner contradiction, drops `Plans/Contracts_V0.md#Billing entity field contract` unless the `### 4.1 AuthState` rewrite exposes same-file drift, and drops `Plans/FileSafe.md#9. Implementation Checklist` unless the owner rewrite proves the checklist must echo the exact identifiers. Major drift risks remain owner-routing drift between `Run_Modes.md` and `Plans/Prompt_Pipeline.md`, storage-owned rewrite canon thinner than FileSafe-managed rewrite canon, stale FileSafe checklist residue, contradictory billing-entity semantics inside `Plans/Contracts_V0.md`, and packet anchor coverage that is path-complete but still misses exact stale sections.

The final narrowed remaining packet surface is the `4` owner-doc set `Plans/Run_Modes.md`, `Plans/FileSafe.md`, `Plans/storage-plan.md`, and `Plans/Contracts_V0.md`. Major drift risks are stale owner routing, stale checklist residue, under-specified storage-owned rewrite canon, contradictory billing/auth examples, stale `AuthState` example residue, and softened optimistic-concurrency identifiers in `FileSafe.md`. Packet-scope narrowing after blocked owner correction preserves the owner split: `auth-state` example cleanup and `omission/null-padding` canon stay with `Contracts_V0.md`, `billing-entity` and attribution tuple consumers stay with Usage and runtime contracts, and `mutable-rewrite` integrity plus git snapshot materialization stay with `FileSafe.md`. Run-scoped ledger repair IDs and active recovery targets stay transfer-state/process evidence only; they are not live index canon.

All active fidelity blockers consumed by this reconciliation result must land as explicit owner-doc fixes in `MUST CHANGE` or as dependent consumer `/mirror` alignment in `MUST RECONCILE`; none may remain implicit or `MUST VERIFY`-only. Validation artifacts such as verifier and packet-shape reports are process evidence for packet rebuilds, not packet doc intents or Project Plan Package outputs. For the Firecrawl/lost-spec packetization basis, `ledger_fidelity_report.txt` ending `<ledger_fidelity_blocked/>` and `fidelity_recovery_plan.txt` ending `<recovery_plan_ready/>` are run-scoped process-readiness markers; `ledger_fidelity_blocked` and `recovery_plan_ready` do not become `Plans/Permissions_System.md` permission states or UI labels.

AuthState fidelity closure: `LFA-001` is `CONFIRMED RESOLVED` by live `Contracts_V0.md#4.1` null-padding / omission semantics. `Plans/.pipeline/ledger_fidelity_report.txt` and `/.pipeline/ledger_fidelity_report.txt` are source-lineage paths only and do not become `Plans/Personas.md` persona schema canon.

Packet section coverage for this research result is anchor-exact, not path-only: `Plans/Run_Modes.md` evidence must reach the kill-condition tables and run outcome taxonomy, `Plans/CLI_Bridged_Providers.md` must reach `### HTTP/status to failure-class mapping`, `### Stream cancellation and replay safety`, and `### Normalized usage event minimum fields`, `Plans/FileSafe.md` must account for `### 15.12 Integration Checklist` lineage without substituting generic managed-mutation background, `Plans/storage-plan.md` must preserve `lock-path` wording in durability / multi-instance / startup sections as well as broader `storage-root` selection, and `Plans/Prompt_Pipeline.md` must reach `### 2.3 Post-filter integrity rules` instead of only compaction-adjacent context. `Plans/orchestrator-subagent-integration.md` and `Plans/usage-feature.md` stay in the packet as `MUST RECONCILE` alignment surfaces; they are not owner-gap add-ons or raw `/anchor` placeholders.
