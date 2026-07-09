# Shard 005: Plan map

Source: `Plans/00-plans-index.md`

Source lines: L218-L474

Source SHA256: `4eefdf9546cfd489c71e58fb020fe39e5df1fff2aeb0941d6eb77d43f26c9c9e`

---

## Plan map

### PM Bootstrap Planning, PlanUnit, and Node-Readiness Map (2026-06-11)

The bootstrap planning packet uses the following owner split:
- `Plans/Planning_Ledger_System.md` owns the Bootstrap Ledger and finished-product Native Ledger Service contracts, compact operating state, source-lineage preservation, per-turn ledger protocol, and ledger-to-Plan compilation boundary.
- `Plans/Plan_Document_System.md` owns standardized Plan doc layout, stable PlanUnits, `gui_related: true|false`, lossless Plan conversion proof, owner adjudication metadata, and generated PlanUnit index boundaries.
- `Plans/Plan_To_Node_Compilation.md` owns the safe PlanUnit-to-node-readiness boundary and future compiler interface; it does not create WorkNodes or executable build tasks.
- `Plans/Bootstrap_Planning_Migration.md` owns current bootstrap workflow usage, AGENTS trigger migration, Codex phase model, controlled Plan conversion batches, governance seal timing, and retired-experiment exclusions.

The ledger `Plans/ledgers/v2/pldg-20260610-001-ledger-plan-system/` is source-lineage/planning memory for these docs, not canonical product prose. Generated governance artifacts remain seal-phase only: ordinary ledger writing, plan drafting, plan conversion, PlanUnit indexing, and node-readiness reporting do not update `Plans/Spec_Lock.json`, `Plans/_shards/**`, `Plans/.evidence/**`, `Plans/plan_graph.json`, or `Plans/auto_decisions.jsonl`.

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Bootstrap_Planning_Migration.md

### PM Semantic Audit Closure Map (2026-06-17)

Semantic audit closure support uses this owner split:
- `Plans/Planning_Ledger_System.md` / `PLS-012` owns `Plans/.audits/_semantic_closure_registry.jsonl`, `audit_scope_manifest.jsonl`, `repair_impact_matrix.jsonl`, durable closure row shape, `previously_closed` reuse, reopen policy, `subject_ref`/`observation_ref`, and ledger `latest_audit_*` terminal-state rules.
- `Plans/Plan_Document_System.md` / `PDS-014` owns deterministic `finding_key` and `check_id` construction, `repair_required`/`finding_level`, `repair_closure_matrix.jsonl`, audit source artifact validation, cross-artifact ref checks, scope/impact coverage, and validator-facing actionable-row coverage.
- `Plans/bootstrap/Bootstrap_Planning_Workflow.md` and `Plans/bootstrap/Codex_Prompts.md` are workflow and reusable-prompt consumers; they must point back to `PLS-012` and `PDS-014` instead of re-owning schema or enum semantics.
- `scripts/pm-audit-closure.py`, `Plans/.audits/_semantic_closure_registry.jsonl`, `Plans/.audits/audit-*/audit_scope_manifest.jsonl`, `Plans/.audits/audit-*/repair_impact_matrix.jsonl`, and `Plans/.audits/audit-*/repair_closure_matrix.jsonl` are support/governance surfaces, not product implementation, WorkNodes, NodeSeeds, executable queues, or build tasks.

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md

### Plans-To-Code Handoff Map (2026-06-17)

The Plans-to-code handoff packet compiled from `pldg-20260617-001-plans-to-code-handoff` uses this owner split:
- `Plans/Plan_To_Node_Compilation.md` owns the design-only PlanCompileRun state machine, low-context stage cards, non-executable NodeSeed candidate and review contracts, WorkGraph draft and WorkNode request contracts, handoff matrix, schema boundary, shared compiler core, Codex bootstrap adapter, and native Puppet Master adapter.
- `Plans/Automated_Testing_System.md` owns Test Capability Discovery, Test Harness Probe, Test Strategy v2, WorkNode test binding, Test Run Receipt, test oracle policy, platform adapter policy, automated visual/browser/device evidence policy, and test-gap blockers.
- `Plans/Executor_Protocol.md` owns ExecutorIntakeReport, WorkNode request acceptance, runnable dispatch boundary, source-control/model/test/authority preflights, failure signatures, loop breakers, PlanChangeDetected handling, and execution receipt chain.
- `Plans/Goal_Runtime_System.md` owns future Planning Wizard approval trigger semantics after explicit enablement, hands-off autonomy policy, HITL consumption boundary, and GoalCompletionReceipt completion certification.
- `Plans/Models_System.md` owns the six user-facing model settings: Default Model, Overseer Model, Worker Model, GUI / Frontend Worker Model, High-Effort Worker Model, and Auditor Model, plus model resolution receipt semantics. There is no user-facing Executor Model setting.
- `Plans/Orchestrator_Page.md` and `Plans/FinalGUISpec.md` own the seven-tab Orchestrator shell, visible Plan Compile tab, animated node-factory UX, Settings placement, progress/status projection, and separation from existing execution views.
- `Plans/WorktreeGitImprovement.md`, `Plans/FileSafe.md`, and `Plans/GitHub_Integration.md` own worktree allocation, safe points, rollback, FileSafe guard inputs, and optional GitHub promotion/output after Executor intake.
- `Plans/Project_Output_Artifacts.md` and `Plans/Runtime_Artifacts_Panel.md` own packaged receipt artifacts and user-visible evidence projection without becoming runtime truth.
- `Plans/Contracts_V0.md` owns shared contract envelopes and points to `Plans/plans_to_code_handoff.schema.json` as the design-only schema draft.
- `Plans/Planning_Ledger_System.md` and `Plans/Plan_Document_System.md` own implementation-readiness/doc-impact matrix handling and the owner/consumer/reference scan gate for this compile class.

The ledger is source-lineage/planning memory only. Metadata-only PlanUnit index and governance registration may refresh `Plans/.plan_index/**`, `Plans/Spec_Lock.json`, `Plans/_shards/**`, `Plans/.evidence/**`, `Plans/plan_graph.json`, and `Plans/auto_decisions.jsonl` after the live Plans docs are stable. Those artifacts remain governance/registering outputs only; this compile does not enable PlanCompile runtime, native Planning Wizard launch, Codex bootstrap launch, WorkNodes, NodeSeeds, executable queues, final node manifests, product implementation files, dispatched GoalRuns, production build tasks, or runtime dispatch.

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Models_System.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md


### PRD Builder And Planning Wizard Map (2026-06-18)

The PRD Builder and Planning Wizard packet compiled from `pldg-20260618-001-prd-planning-wizard` uses this owner split:
- `Plans/PRD_Builder.md` owns finished-product PRD Builder intake, source ingestion, PRD projection, Approved PRD Pack creation, annotation/readiness behavior, and the explicit `Approve PRD for Planning Wizard` handoff.
- `Plans/Planning_Wizard.md` owns PlanningRun, dynamic topic graphs, topic-scoped ledger work, Planning Context Capsules, topic conversion/audit, final integration, ApprovedPlanPack, compile readiness, Planning Wizard GUI states, and `Approve And Build`.
- `Plans/Automated_Testing_System.md` owns testing defaults, current official-source capability research, safe installation policy, Auto/On/Off testing settings, visible verification sessions, redaction, and test receipts.
- `Plans/Plan_To_Node_Compilation.md`, `Plans/Executor_Protocol.md`, and `Plans/Goal_Runtime_System.md` own the downstream PlanCompile, Executor intake, WorkNodeRecord materialization, activation, receipt, and runtime boundary contracts. This compile records a runtime-capable v2 contract direction but does not enable runtime launch or emit runtime artifacts.
- `Plans/prd_planning_runtime_contracts.json` and `Plans/prd_planning_runtime_contracts.schema.json` instantiate strict PRD/Planning runtime contracts around Native Ledger Service APIs, ProjectContextSnapshot variants, Plan Compile stage cards, WorkNode and activation records, testing receipts, typed UICommand contracts, clean-room positive/negative scenarios, and retired compatibility retrieval exclusions.
- `Plans/FinalGUISpec.md`, `Plans/Orchestrator_Page.md`, `Plans/UI_Command_Catalog.md`, `Plans/Commands_System.md`, `Plans/assistant-chat-design.md`, `Plans/Crosswalk.md`, and `Plans/Wiring_Matrix.md` consume or route the user-facing surfaces, command families, thread model, and reference terminology.
- `Plans/Contracts_V0.md` owns the shared event, pack, record, exception, and runtime-envelope contract terms consumed by PRD Builder, Planning Wizard, Plan Compile, Executor, and Goal Runtime.
- `Plans/00-plans-index.md`, `Plans/Bootstrap_Planning_Migration.md`, `Plans/FileSafe.md`, `Plans/GitHub_API_Auth_and_Flows.md`, `Plans/GitHub_Integration.md`, `Plans/Media_Generation_and_Capabilities.md`, `Plans/Models_System.md`, `Plans/Multi-Account.md`, `Plans/Permissions_System.md`, `Plans/Personas.md`, `Plans/Plan_Document_System.md`, `Plans/Planning_Ledger_System.md`, `Plans/Progression_Gates.md`, `Plans/Project_Output_Artifacts.md`, `Plans/Run_Graph_View.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/WorktreeGitImprovement.md`, `Plans/human-in-the-loop.md`, and `Plans/storage-plan.md` remain valid PlanUnit-index owner docs for lineage/support/consumer addenda from this compile; they are not ContractRef promotion targets for the PRD Builder and Planning Wizard product map.
- `Plans/chain-wizard.md` and `Plans/chain-wizard-flexibility.md` are compatibility/source-lineage consumers for semantically migrated legacy wizard material and are excluded from active product/runtime retrieval by the runtime contract packet; `Chain Wizard`, `Plan Wizard`, `Requirements Doc Builder`, and `Start Chain` are not active current-product names except where explicitly marked historical or compatibility-only.

Generated indexes may refresh under `Plans/.plan_index/**` after live Plans stabilize. Spec Lock, generated shards, evidence bundles, plan graph, and auto_decisions remain governance-seal-only. This compile does not create WorkNodes, NodeSeeds, executable queues, final node manifests, GoalRuns, implementation files, production build tasks, runtime dispatch, or Orchestrator builds.

ContractRef: ContractName:Plans/PRD_Builder.md, ContractName:Plans/Planning_Wizard.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/prd_planning_runtime_contracts.schema.json

### Native Goal Runtime Map (2026-06-16)

The native Goal Runtime packet uses the following owner split:
- `Plans/Goal_Runtime_System.md` owns native Goal Mode runtime/control-plane behavior, invisible/internal goals, durable goal state, scheduler updates, attachments, weak-model safety, child goals, write authority, completion receipts, verifier/adjudicator policy, approval-boundary invocation, and runtime evidence requirements.
- `Plans/assistant-chat-design.md` owns visible Assistant Chat Goal UI and thread-surface behavior, including activation, status, task tracker, controls, evidence/activity display, completion reports, and collapsible child-goal details.
- `Plans/FinalGUISpec.md` owns Settings GUI placement for the separate Goal Mode worker model and verifier/adjudicator model selectors.
- `Plans/Planning_Wizard.md` owns current Planning Wizard flow semantics for future invisible Goal Mode ledger-to-Plans transfer. `Plans/chain-wizard-flexibility.md` remains a legacy compatibility/source-lineage consumer only; this compile does not revive Chain Wizard as current product terminology.
- `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, and `Plans/Permissions_System.md` own shared envelope, persistence, and approval-scope registration needed by Goal Runtime data shapes while `Plans/Goal_Runtime_System.md` keeps behavior semantics.
- `Plans/Runtime_Artifacts_Panel.md` consumes Goal Runtime evidence and receipt identities for browsing, retention visibility, and redaction surfaces; `Plans/Project_Output_Artifacts.md` remains a project-output package boundary reference, not a Goal Runtime evidence owner.
- `Plans/Models_System.md`, `Plans/Multi-Account.md`, and provider-specific docs such as `Plans/Provider_OpenCode.md` own concrete requested/effective model, account, and provider capability resolution consumed by Goal Runtime role policy.
- `Plans/Planning_Ledger_System.md`, `Plans/Plan_Document_System.md`, and `Plans/Plan_To_Node_Compilation.md` remain owners for ledger records, PlanUnits, generated indexes, and the readiness-only compiler boundary; Goal Runtime consumes them for ledger-to-Plans goals without creating WorkNodes or NodeSeeds.

The ledger `Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system/` is source-lineage/planning memory for this compile, not canonical product prose. Generated governance artifacts remain seal-phase only: ordinary ledger planning, plan drafting, and ledger compile do not update `Plans/.plan_index/**`, `Plans/Spec_Lock.json`, `Plans/_shards/**`, `Plans/.evidence/**`, `Plans/plan_graph.json`, or `Plans/auto_decisions.jsonl`. A separate explicit PlanUnit index phase may regenerate allowed `Plans/.plan_index/**` outputs after live Plans docs are stable. A later explicit governance seal may refresh governance artifacts without changing product canon or creating node/build artifacts.

ContractRef: ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md

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
| `GitHub_Integration.md` | GitHub/Git IDE integration spec | Git panel (repo/branch/diff/operations), GitHub API (OAuth device-code, PRs, Actions), SSH remote dev servers, no-wizard project flows (Add Existing / New Local / New GitHub Repo). Cross-refs: Plans/GitHub_API_Auth_and_Flows.md, Plans/FileManager.md, and legacy/source-lineage examples in Plans/chain-wizard-flexibility.md. |
| `FileManager.md` | File Manager panel, IDE-style editor, @ mention, click-to-open | Canonical for file tree, editor (tabs, split panes, save, line numbers, syntax), image viewer, HTML/browser preview, detached preview behavior, `@` mention integration, terminal/browser tabs (§9), editor enhancements MVP (§10), language/framework presets (§11). |
| `LSPSupport.md` | LSP client support for rewrite | **LSP is MVP** -- in scope for desktop release. Canonical for LSP diagnostics, navigation, chat/editor LSP behavior, server registry/root discovery, and the widened canonical `lsp` tool surface used by Assistant Chat and editor workflows. |
| `storage-plan.md` | seglog, redb, Tantivy, projectors, analytics scan | Canonical persistence and restore model for project identity, EventRecord seglog/redb persistence boundaries, workspace tabs, windows, browser/preview state, terminal sessions, dev sessions, plan/TODO/question/activity state, usage projections, and analytics scan rollups. |
| `chain-wizard-flexibility.md` | Retired legacy Chain Wizard / Interview source-lineage | Compatibility/source-lineage only for historical intent, requirements, interview, GitHub, fork, PR, blocked-state, and route examples; current PRD intake and planning authority is owned by `PRD_Builder.md`, `Planning_Wizard.md`, `FinalGUISpec.md`, and downstream contract/runtime/PlanCompile/Executor owner docs. |
| `Document_Packaging_Policy.md` | Deterministic packaging for large Markdown/text artifacts | Canonical Document Set contract: sharded set + `00-index.md` + `manifest.json` + full audits with non-bypassable run failure on verification breach. |
| `Planning_Ledger_System.md` | Bootstrap planning ledger and finished-product Native Ledger Service | Canonical for the Bootstrap Ledger, Native Ledger Service import/export boundary, compact operating capsules, per-turn ledger protocol, design_atom lifecycle, exact source-lineage preservation, owner ambiguity handling, ledger-to-Plan compilation boundary, semantic closure registry row shape, audit scope manifests, repair impact matrices, and reopen policy. |
| `Plan_Document_System.md` | Standardized Plan docs and PlanUnit contract | Canonical for Plan doc layout, PlanUnit fields including `gui_related: true|false`, owner adjudication metadata, lossless Plan conversion proof, generated PlanUnit indexes, node-readiness metadata, deterministic semantic finding keys, and repair closure matrix validation. |
| `Plan_To_Node_Compilation.md` | PlanUnit index and node-readiness boundary | Canonical for future PlanUnit-to-NodeSeed-to-WorkNode compiler inputs and the current readiness-only boundary. It does not create WorkNodes, executable build tasks, or NodeSeed candidates until the compiler contract is complete and the `PNC-019` executable lifecycle certification harness has passed with recorded evidence. |
| `Bootstrap_Planning_Migration.md` | Bootstrap ledger migration and governance seal workflow | Canonical for AGENTS trigger use, Codex Goal-phase migration, less-than-4,000-character goal prompt posture, controlled Plan conversion batches, Spec Lock seal timing, and retired prompt-packet/tranche experiment exclusions. |
| `Goal_Runtime_System.md` | Native Goal Mode runtime/control-plane system | Canonical owner for native Goal Runtime state, scheduler/replan behavior, invisible and visible goal execution semantics, child goals, write authority, completion receipts, evidence/certification, weak-model safety, verifier/adjudicator policy, approval-boundary invocation, and goal task templates. |
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
| `Runtime_Artifacts_Panel.md` | Artifacts panel (runtime artifacts) | Canonical for 19 artifact types, seglog `runtime_artifact.*`, redb `artifacts_index.v1:{project_id}:{artifact_id}`, cost_usage, Show in Ledger/Usage, browser recordings, and JSON schemas. Distinct from Project Plan Package (`Project_Output_Artifacts.md`). |
| `Project_Output_Artifacts.md` | Project Plan Package outputs | Canonical owner for user-project Project Plan Package artifacts under `.puppet-master/project/**`, including plan graph indexes/nodes, acceptance and requirements quality reports, requirements coverage outputs, quickstart derivation, and deterministic validation rules. Distinct from runtime artifacts, permission approval scope, and transfer packet recovery policy. |
| `newfeatures.md` | Feature ideas + patterns | Historical/origin source for promoted Section 15 ideas; normative behavior for promoted items now lives in the promoted Section 15 owner and reconciled subsystem SSOTs. |
| `Widget_System.md` | Cross-cutting widget catalog, grid layout, add-widget flow | Canonical for portable page widgets, grid-based resizing, layout persistence. Referenced by Dashboard, Usage, Orchestrator pages. Single widget catalog shared across all widget-composed surfaces. |
| `Run_Graph_View.md` | Node Graph Display (Airflow-style DAG view) | Canonical for the full-page graph visualization tab on the Orchestrator page. NOT a portable widget. Includes Slint implementation guide, data model contract, 5 layout presets, 8-section detail panel, HITL controls, performance targets (500 nodes). |
| `Orchestrator_Page.md` | Orchestrator single-page seven-tab structure | Canonical for tab layout (`Progress` / `Plan Compile` / `Seams` / `Node Graph` / `Evidence` / `History` / `Ledger`). `Progress` is the only widget-composed Orchestrator tab. `Node Graph` references `Run_Graph_View.md`; `Plan Compile` references design-only plans-to-code projection contracts. Terminal widgets, prose summaries, and data source documentation remain consumers of this shell. |
| `GUI_Rebuild_Requirements_Checklist.md` | Auditable summary checklist for 2026-02-23 GUI rebuild handoff requirements | `Plans/GUI_Rebuild_Requirements_Checklist.md` is the single verification table confirming coverage for widget system, Usage page, chat context enhancements, Dashboard widget grid migration, Orchestrator seven-tab structure with `Plan Compile`, and Node Graph image-backed spec. |
| `Executor_Protocol.md` | Deterministic overseer flow and lifecycle semantics | Canonical for Builder/Verifier/Overseer roles, next-ready selection, verifier-driven auto completion to `done`, and the versioned `execution_unit_context` contract in `Plans/execution_unit_context.schema.json`. |
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
| `Media_Generation_and_Capabilities.md` | Media generation and capability system SSOT | Canonical for `capabilities.get` (internal tool returning all media + provider-tool capabilities with enabled/disabled + disabled_reason + setup hints), `media.generate` (uniform media generation interface with per-request `model_override`, artifact-path output, route-specific provider/model generated-media capabilities, artifact-path output, and stable error codes), natural-language slot extraction grammar, capability picker dropdown UI/UX, OpenAI/Codex subscription and API-key image routes, MiniMax Image-01, Gemini Direct where verified, provider-specific gated/unsupported rows, and media alias resolution. Cursor image-input proof and media aliases such as Nano Banana are not provider availability proof without route/catalog/artifact evidence. |
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
