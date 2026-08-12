# Shard 003: Anti-drift layer (required reading order)

Source: `Plans/00-plans-index.md`

Source lines: L43-L200

Source SHA256: `e0358f4d0c5cdce2cbbac0fdef1e70a80ba910ff84c72d999f77c9fc01893eb2`

---

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
- Contracts/Crosswalk/legacy chain-wizard source-lineage seam: `Plans/chain-wizard-flexibility.md` is preserved only as compatibility/source-lineage input; active contract and boundary ownership remains with `Plans/Contracts_V0.md` and `Plans/Crosswalk.md`.
- Legacy chain-wizard/contracts/executor source-lineage seam: `Plans/chain-wizard-flexibility.md` (section 1) is preserved only as historical input; active executor/runtime ownership remains with `Plans/Contracts_V0.md`, `Plans/Executor_Protocol.md`, and the current PRD/Planning owner docs.
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
