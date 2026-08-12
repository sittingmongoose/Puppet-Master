# Plans Index (authoritative map)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Change Summary


  ContractRef: ContractName:Plans/Document_Packaging_Policy.md, PolicyRule:Decision_Policy.md§2
- 2026-02-26: Registered Plans/assistant-memory-subsystem.md as canonical Assistant-only memory SSOT.
- 2026-02-25: Registered Plans/GitHub_Integration.md in plan map table.
- 2026-06-11: Registered the PM Bootstrap Planning Ledger, Plan Document System, Plan-to-node compilation boundary, and bootstrap migration owner docs compiled from ledger `pldg-20260610-001-ledger-plan-system`.
- 2026-06-16: Registered `Plans/Goal_Runtime_System.md` as the canonical owner for native Goal Mode runtime/control-plane behavior compiled from ledger `pldg-20260616-001-goal-runtime-system`.
- 2026-06-16: Registered Orchestrator Goal Runtime Flow owner routing compiled from ledger `pldg-20260616-002-orchestrator-goal-runtime-flow`; an explicit governance seal may refresh generated governance artifacts after live Plans and allowed PlanUnit indexes stabilize.
- 2026-06-17: Registered semantic audit closure routing: `Plans/Planning_Ledger_System.md` owns the durable closure registry and reopen policy, `Plans/Plan_Document_System.md` owns deterministic finding keys and closure-matrix validation, and bootstrap prompt/workflow docs consume those owner contracts.
- 2026-06-17: Registered Plans-to-code handoff routing compiled from ledger `pldg-20260617-001-plans-to-code-handoff`; PlanCompile remains design-only/disabled, `Plans/Automated_Testing_System.md` is the automated-testing SSOT, `Plans/plans_to_code_handoff.schema.json` is a design-only schema draft, governance registration is metadata-only, and no WorkNodes, NodeSeeds, executable queues, runtime dispatch, implementation files, dispatched GoalRuns, or production build tasks are authorized.
- 2026-06-18: Registered PRD Builder and Planning Wizard owner routing compiled from ledger `pldg-20260618-001-prd-planning-wizard`; bootstrap compile remains Plans/index-only and does not run finished-product Plan Compile or create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.
- 2026-06-21: Registered PRD/Planning runtime-contract repair: `Plans/prd_planning_runtime_contracts.json` and schema carry strict Native Ledger Service, ProjectContextSnapshot, stage-card, WorkNode, activation, testing, UICommand, clean-room, and retired-search-exclusion contracts; `scripts/pm-prd-planning-runtime-validate.py` is part of standard gates.
- 2026-06-21: Retired `Plans/chain-wizard.md` and `Plans/chain-wizard-flexibility.md` from active product canon. Their `CW-*` and `CWF-*` PlanUnits are compatibility/source-lineage only and must not be accepted/indexed as active current-product truth.
- 2026-06-26: Registered provider-update compile routing from ledger `pldg-20260624-001-provider-updates`: Gemini CLI is retired from active provider support, Gemini Direct remains API-key-backed, Antigravity CLI replaces Gemini CLI for the CLI-backed Google/agent route, Provider -> models catalogs are mandatory, media support splits input/output/generated-media routes, OpenAI/Codex subscription-backed image generation is mandatory alongside official OpenAI API-key image routes, and provider readiness stays route/model/account specific.
- 2026-06-27: Registered miscellaneous PM History, PM-native vision_bridge / see_image, and Teach/Teacher owner routing compiled from ledger `pldg-20260626-001-feature-name`; PMConcept.html remains non-final source-lineage only, and this compile creates no WorkNodes, NodeSeeds, executable queues, implementation files, or governance-seal artifacts.
- 2026-07-01: Registered containerized-hosts owner routing compiled from ledger `pldg-20260630-001-feature-intake`: `Docker/Hosts` is a native Slint routed page/lab reached from Docker Manager and cross-surface links, `docker_manager` remains the Activity Bar side-panel owner and command namespace, Coasts remains source-lineage inspiration only, runtime families are whole-MVP but capability-probed/gated, and this compile creates no WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, or governance-seal artifacts.
- 2026-07-02: Registered GUI / PMConcept implementation-readiness repair artifacts: `Plans/PMConcept_Control_Reconciliation.json` inventories PMConcept controls and dispositions, `Plans/Wiring_Matrix.production.json` is the schema-validated production wiring matrix, `Plans/Wiring_Matrix.production.exclusions.json` records parser/generic/compatibility exclusions, and PMConcept remains concept/source-lineage only rather than canonical implementation HTML/CSS/demo state.
- 2026-07-07: Refreshed Rust/Slint currentness routing: the active GUI/toolchain target is Rust stable 1.96.1 plus Slint 1.17.1 by owner decision, with native Winit + Skia compiled/default, Winit + FemtoVG-wgpu fallback, Winit software emergency fallback, and a first-build Slint/WASM canvas web GUI mediated by a trusted local daemon for OS-owned capabilities. PMConcept terminal transcripts, old audit version strings, and demo version strings are fixture/source-lineage only, and runtime implementation must reverify official stable releases before code/build work.
- 2026-07-05: Registered implementation-readiness buildability gates: `Plans/.implementation_readiness/readiness_blockers.jsonl` is the governed blocker registry, `Plans/.implementation_readiness/readiness_matrix.json` is the governed gate contract, `Plans/.implementation_readiness/buildability_gate_report.json` is the generated consumer report, and `scripts/pm-implementation-readiness.py` owns generation, validation, and fixture self-tests. These artifacts prevent source preservation, schema existence, wiring JSON existence, semantic closure, node-readiness reporting, or validators passing from being treated as proof of implementation buildability; `Approve And Build` remains disabled while open blockers remain or `Plans/.plan_index/node_readiness_report.json` reports a hard-disabled PNC-019 lifecycle boundary. This registration creates no WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime launches, production build tasks, or product repairs.
- 2026-07-06: Registered Tier 0B `execution_unit_context` ownership: `Plans/Executor_Protocol.md` is the sole owner, `Plans/execution_unit_context.schema.json` carries schema_id `pm.execution_unit_context` and schema_version `1.0.0`, and Prompt Pipeline, Contracts_V0, storage-plan, orchestrator-subagent-integration, Plan_To_Node_Compilation, and Planning_Wizard consume the schema by reference. This registration does not close EventRecord, storage value schema, provider stream, runtime lifecycle, clean-room harness, GUI, or security blockers and creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, production build tasks, or product repairs.
- 2026-07-06: Registered Tier 0C-1 `EventRecord` ownership: `Plans/Contracts_V0.md` §1.2 owns the canonical persisted `pm.event.v0` envelope, `Plans/event_record.schema.json` carries the Draft 2020-12 machine-readable schema with `schema_version = 1.0.0`, and `Plans/storage-plan.md` owns seglog/redb persistence, replay, retention, migration, legacy compatibility, and payload-schema registration boundaries. This is partial closure for the EventRecord envelope and storage value boundary only; it does not close provider stream, runtime lifecycle, clean-room harness, GUI, security, behavioral, or broad redb-family blockers and creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, production build tasks, or product repairs.
- 2026-07-06: Registered Tier 0C-2 storage value-schema registry ownership: `Plans/storage_value_registry.json` inventories redb/seglog storage value families and fully materializes the launch-critical values for ApprovedPlanPack, PlanApproved outbox, PlanCompileRun, compiler wave contract, WorkGraph draft, WorkNodeRequest, Executor intake report, attempt receipt, EventRecord index, blocked projection, and goal receipt; `Plans/storage_value_registry.schema.json` owns registry shape; `scripts/pm-implementation-readiness.py` validates parsing, key/value ownership, schema_version, no-secret storage fields, and the rule that `buildability_gate_passed` remains false. Non-critical GUI/provider/analytics/terminal/browser/project-state/worktree/permission families are deferred_not_build_blocking with owner, reason, and reopen condition. This is partial storage-value progress only; it does not close provider stream, runtime lifecycle, clean-room harness, GUI, security, behavioral, currentness, or broad persistence blockers and creates no WorkNodes, NodeSeeds, candidates, queues, manifests, implementation files, runtime launches, production build tasks, or product repairs.
- 2026-07-06: Registered non-executable implementation-readiness closure evidence: `Plans/.implementation_readiness/non_executable_closure_evidence.schema.json` owns the evidence shape and `Plans/.implementation_readiness/non_executable_closure_evidence.json` records owner-routed specs, schema refs, validator coverage, and positive/negative fixture contracts for the non-executable closure lane. This lane closes only the spec/schema/validator/fixture scope for `contract_materialization`, `persistence_materialization`, `provider_stream`, `security_boundary`, `gui_wiring`, `behavioral_acceptance`, `structural_integrity`, `owner_routing`, and `currentness`. It explicitly leaves `runtime_lifecycle` and `clean_room_harness` open, keeps `PNC-019` hard-disabled, keeps `buildability_gate_passed=false`, and creates no WorkNodes, NodeSeeds, candidates, queues, manifests, implementation files, runtime launches, production build tasks, or product repairs.
- 2026-07-09: Registered `Plans/web_operation_contracts.schema.json` as the shared schema owner for PM WebOperation, provider-adapter registry/projection, permissions/cache/egress, async WebOperationJob status, read/extract/research/deep-research citations, research synthesis/subagent records, PageRepresentation, BrowserSession, BrowserActionResult, BrowserRuntimeState, web operation cards, and browser-testing contract shapes. `Plans/web_provider_adapter_registry.seed.json` is the no-secret seed/projection artifact for PM-native Site Reader, direct API, MCP, model-native, CLI/server bridge, and coding-agent projection examples derived from that registry; `Plans/web_provider_projection_fixtures.json` is the no-secret generated-projection fixture for `.claude`, `.cursor`, and `.codex` target shapes without mutating local provider config. `Plans/web_capability_source_packet_receipt.json` and `Plans/web_capability_source_packet_receipt.schema.json` record v3 packet lineage by artifact basename, hash, byte size, and finding IDs without absolute local paths or secrets. `Plans/web_operation_card_fixtures.json`, `Plans/web_operation_job_fixtures.json`, `Plans/web_agent_policy_fixtures.json`, `Plans/web_research_run_fixtures.json`, `Plans/web_intent_routing_fixtures.json`, and `Plans/web_policy_negative_fixtures.json` carry validator fixtures for operation/progress/denied/partial/fallback/batch cards, async job progress/timeout/non-queue constraints, assistant/persona/Goal/PRD/Planning Wizard/Orchestrator/subagent autonomous tool-use policy, standard/deep research source evidence and closure, slash/palette/NL/agent routing parity, and web security/permission/cache/browser-unavailable/citation negative coverage, with `Plans/web_policy_negative_fixtures.schema.json` owning the policy fixture shape. `Plans/web_capability_findings_coverage.json` maps every v3 finding ID to canonical evidence files and validator surfaces, with `Plans/web_capability_findings_coverage.schema.json` owning that coverage shape, while marking generated-governance refresh and live provider projection sync as separate lanes. `Plans/Tools.md`, `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/evidence.schema.json`, runtime artifact schemas, `Plans/Commands_System.md`, chat/GUI, Prompt Pipeline, Run Modes, Goal Runtime, Personas, PRD Builder, Planning Wizard, MCP, Models, Permissions, and Automated Testing consume this owner; it creates no WorkNodes, NodeSeeds, executable queues, runtime code, implementation files, production build tasks, or governance-seal artifacts by itself.
- 2026-07-16: Registered the initial 817-row canonical settings inventory registry: `Plans/settings_inventory.json` is the machine authority consumed by the search-first Settings surface (F3-432), the fuzzy search contract (F3-433), the shelves and curation service (F3-435/F3-436/F3-437), the setting-row renderer contract (F3-438), and the Project Settings Modal derivation (F3-442); `Plans/settings_inventory.schema.json` owns the registry shape (`pm.settings_inventory.v1`). Rows carry id/label/desc/type/options/default/scope/tier/recommended/curated/search/badges plus the sparse authored `related_features` usage-signal mapping; demo runtime fields (value, static status, src attributions) are excluded because per-setting status is derived from live subsystem state per F3-435. Provenance pins the concept sidecar extraction (source-lineage only per `Plans/usage-feature.md`). Registered per `dec-2026-07-16-settings-inventory-registry-registration`; this creates no WorkNodes, NodeSeeds, executable queues, runtime code, implementation files, production build tasks, or governance-seal artifacts by itself.
- 2026-07-17: Registered the Case L seven-row Storage & Retention propagation: `Plans/settings_inventory.json` remains the machine authority and now contains 824 settings across 12 categories, including the seven new `system.advanced.*` rows; `Plans/settings_inventory.schema.json` remains the unchanged registry-shape owner. `Plans/storage-plan.md#Case-L-3` owns retention, hold, compaction, deletion, and quarantine policy; `Plans/FinalGUISpec.md` and `Plans/UI_Command_Catalog.md` consume that policy and the inventory for visible Settings and command routing without becoming policy owners. This is index routing only and creates no WorkNodes, NodeSeeds, executable queues, runtime code, implementation files, production build tasks, or governance-seal artifacts.
- 2026-07-18: Registered `Plans/storage_recovery_contracts.schema.json` as the strict machine-readable sidecar owner for `migration_preflight_result` and `migration_progress_snapshot`. `Plans/storage-plan.md` owns migration transitions and journal-derived projection behavior; `pm.storage_value.migration_receipt.v1` remains the sole durable terminal migration receipt, and the progress snapshot is not a peer receipt. This registration is routing only: it does not close a finding, Case L, a registry, or any denominator, and it does not authorize event-dependent generation, gates, runtime, harnesses, or certification.
- 2026-07-18 (currentness updated 2026-08-10): Registered `Plans/event_family_registry.json` and `Plans/event_family_registry.schema.json` as the bounded persisted event-family machine registry, owned by `Plans/storage-plan.md#case-l-5-eventrecord-persistence-legacy-normalization-and-dedupe`. The live registry is revision `2026-08-04.1` with 39 rows; the Known-37 material remains a historical bounded static slice, not the current complete registry. July Event Authority evidence records 37 registered rows plus at least 248 confirmed persisted-unregistered families, at least 40 unresolved exact rows, and 68 excluded rows, proving only a source-dated persisted floor of `>=285` with denominator status `UNKNOWN_OPEN`. The content-addressed external-custody evidence is `EA-27_PRODUCER_UNION_AND_DENOMINATOR.json` (SHA-256 `644c6d0bc913eaed62f41e231fdb7e04f55d270549fcdede73a0869994111e47`; `union_rows_sha256=aa9c365904788eba74df73bb1b5eecaae903a6aa167e0514b7937198aa0dbf4d`) and `EA-29_TERMINAL_FINDINGS_RESIDUALS_CONTRACT_DEPTH_REPAIR_AND_WAVE1_CHECKPOINT.md` (SHA-256 `17820aef1b498acf2e5165bee106171ff1ef35a1b23fa67d0cc23e291a8ed7bf`) under `PuppetMaster-AssuranceLab` custody. `CL-CRIT-EVENT-AUTHORITY-001` remains open: the evidence requires fresh reconciliation, bulk registration is forbidden, material depth is incomplete, and producer-owner decisions are pending. This routing update is not denominator closure, registry completion, Case L closure, PNC-019 certification, buildability, or authority for event-dependent generation, runtime, or harness success.
- 2026-07-07: Registered platform_specs retirement and provider/model capability authority repair: `Plans/Models_System.md` owns active context-window, max-token, fallback-chain, capability provenance, and requested/effective model capability fields; `Plans/Contracts_V0.md` carries only the cross-surface capability snapshot reference envelope; `Plans/assistant-chat-design.md` and `Plans/Provider_OpenCode.md` consume those owners. Legacy `platform_specs` / `platform_specs.rs` references are source-lineage only and cannot be used as active `context_window` or `fallback_model_ids` authority.
- 2026-07-23: Registered the PMConcept7 concept promotion (ChatGuiUpdates2 workstreams, revs 4-9.2). Title-bar notifications: the rightward notification stack + count badge + sprout inbox is the sole in-app notification affordance, replacing the bottom-right toast stack, the status-bar bell, and the Notifications side-panel affordance (F3-447/F3-448/F3-453 amended in place with stale dispositions; F3-460/F3-461 added; shared alert store and ack/snooze lifecycle semantics unchanged). Status-bar mode/platform/model/context chips and the activity-bar Settings/Usage/Notifications/Orchestrator/Run Graph/Planning Wizard shortcuts are retired with successor owners on the assistant chat surface, the chat context ring, and the title-bar page tabs. `Plans/FinalGUISpec.md` adds F3-462..F3-470 (Projects-like page headers, orchestrator tab-strip theme presentation, page-tab sliding ink + directional transitions, magnet + spotlight hover superseding the F3-446 jiggle, friendly editor file tabs, friendly pill field end clearance, boot paint first-paint gate, chats rail presentation and resize collapse, planning wizard runhead one-liner). `Plans/assistant-chat-design.md` adds ACD-439..ACD-444 (corner-origin sprout popout motion, effort/thoroughness option-count resize in place, context ring click sprout, header chrome menu sprouts and theme-matched popout chrome, chat more-options kebab, chats rail cleanup) and re-anchors requested-platform registration to the chat surface per amended ACD-437/ACD-009. `Plans/usage-feature.md` adds UF-089 (usage page head presentation). `Plans/UI_Command_Catalog.md` re-anchors `cmd.chat.platform` and records icon-only `cmd.usage.refresh`/`cmd.usage.export` affordances. `Plans/UI_Wiring_Rules.md` §0.1 names `Concepts/PMConcept7.html` + `Concepts/ChatGuiUpdates2.md` as the current concept reconciliation input, and `Plans/Wiring_Matrix.production.json` updates the affected rows' ui_location and accessibility contracts. `Concepts/PMConcept7.html` and `Concepts/ChatGuiUpdates2.md` remain illustrative source-lineage only; this compile creates no WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, or governance-seal artifacts by itself.
- 2026-07-28: Registered the Run & Debug revival spec wave and the PMConcept7 Cozy Shelves integration wave. Run & Debug revival: `Plans/Commands_System.md` adds §7.2/§7.3/§7.4 + CS-063..CS-065 (the `cmd.run_debug.*` classical DAP dispatch family, the `cmd.run.*` orchestrator run-control trio, and the investigation verification/cleanup pair closing the §1.0B phase-model holes); `Plans/UI_Command_Catalog.md` adds the Run & Debug reconciliation + registration tables + UCC-139..UCC-142; `Plans/FinalGUISpec.md` adds F3-482..F3-496 (Debug & Run panel identity and layout, debug session state machine, F3-484 multi-session policy superseding the F3-259 one-session cap via stale disposition, unified Variables & Watch shelf, Call Stack shelf, Breakpoint canon, Launch Profile schema, bottom Debug tab canon, panel-to-tab handoff contract, debug hotkey bindings, accessibility contract, adapter registry and portability, terminology boundary, demo fixture description); `Plans/Wiring_Matrix.production.json` adds 44 rows (`catalog.run_debug_*`, `catalog.run_*`, `catalog.debug_record_verification`, `catalog.debug_run_cleanup`) and re-homes the ten `catalog.debug_*` rows to the assistant Debug Mode investigation surface; `Plans/storage-plan.md` adds SP-244 (debug persistence keys); `Plans/Runtime_Artifacts_Panel.md` adds RAP-053 (debug adapter model deferral closure); `Plans/Orchestrator_Page.md` adds OP-034 (run-control trio semantics); `Plans/settings_inventory.json` upgrades `code.execution.debug-configurations` to reference the F3-489 schema. PMConcept7 integration: `Plans/FinalGUISpec.md` adds F3-497..F3-500 (Cozy Shelves panel integration with c2 id canon, F3-471 width envelope applied to the PM7 shell, activity-bar Debug entry, retired panel-unraid/pm6-panel-notify removals); `Plans/FileManager.md` adds F-079 (Cozy Shelves File Manager PM7 integration incl. F2-205 trash-first surfacing); `Plans/UI_Command_Catalog.md` adds UCC-143 (`cmd.chat.open` adjudicated as a compatibility alias of `cmd.chat.open_thread`, exclusions-registered); `Plans/UI_Wiring_Rules.md` §0.1 records the integrated PMConcept7 as concept input; the July 2026 PM7 integrated Cozy control census is deferred pending a current source-hashed recensus, and no Cozy census artifact is registered in this branch. The PM7 build pipeline re-derived `Concepts/pm7-tools/dead_selectors.py` (400 frozen selectors, human-review flag recorded in-file) and `Concepts/pm7-tools/build_pm7.py` census constants for the 31-block base. `Concepts/rail-concepts/**` and `Concepts/pm6-build/**` remain illustrative source-lineage only; this compile creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, production build tasks, or governance-seal artifacts by itself.

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

## Rewrite tie-in (2026-02-21)
The project is intentionally adapting an OpenCode-style architecture and is mid-transition to a deterministic agent-loop core with:
- **Providers** behind one unified **event model**
- **Event-sourced storage**: `seglog` (canonical ledger) -> projections into `redb` (KV state/settings) + Tantivy (search)
- **Central tool registry + policy engine** and a patch/apply/verify/rollback pipeline
- **UI rewrite**: Rust stable 1.96.1 + Slint 1.17.1 by owner decision on 2026-07-07 (Winit + Skia compiled/default on Windows/Linux/macOS; Winit + FemtoVG-wgpu fallback; Winit software emergency fallback; Slint/WASM canvas web GUI via trusted local daemon for OS capabilities; reverify official stable releases before runtime implementation)
- **Auth**: subscription-first; Gemini Direct (`gemini`, direct key-only/API-key-backed) remains active, while Gemini CLI (`gemini_cli`) is retired from active provider support and preserved only as source-lineage/compatibility terminology. Antigravity CLI is the active CLI-backed Google/agent route replacing the stale Gemini CLI route. Provider identity, requested/effective auth, account identity, account/plan UI, quota/usage labels, media capabilities, and setup/health are route-, account-, and model-dependent across direct providers, CLI-backed providers, coding-plan providers, and generated-media routes.

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
| `event_record.schema.json` | [`Plans/_shards/event_record.schema/00-index.md`](Plans/_shards/event_record.schema/00-index.md) |
| `storage_value_registry.schema.json` | [`Plans/_shards/storage_value_registry.schema/00-index.md`](Plans/_shards/storage_value_registry.schema/00-index.md) |
| `storage_value_registry.json` | [`Plans/_shards/storage_value_registry/00-index.md`](Plans/_shards/storage_value_registry/00-index.md) |
| `settings_inventory.schema.json` | [`Plans/_shards/settings_inventory.schema/00-index.md`](Plans/_shards/settings_inventory.schema/00-index.md) |
| `settings_inventory.json` | [`Plans/_shards/settings_inventory/00-index.md`](Plans/_shards/settings_inventory/00-index.md) |
| `non_executable_closure_evidence.schema.json` | [`Plans/_shards/non_executable_closure_evidence.schema/00-index.md`](Plans/_shards/non_executable_closure_evidence.schema/00-index.md) |
| `non_executable_closure_evidence.json` | [`Plans/_shards/non_executable_closure_evidence/00-index.md`](Plans/_shards/non_executable_closure_evidence/00-index.md) |
| `web_agent_policy_fixtures.json` | [`Plans/_shards/web_agent_policy_fixtures/00-index.md`](Plans/_shards/web_agent_policy_fixtures/00-index.md) |
| `web_capability_findings_coverage.json` | [`Plans/_shards/web_capability_findings_coverage/00-index.md`](Plans/_shards/web_capability_findings_coverage/00-index.md) |
| `web_capability_findings_coverage.schema.json` | [`Plans/_shards/web_capability_findings_coverage.schema/00-index.md`](Plans/_shards/web_capability_findings_coverage.schema/00-index.md) |
| `web_capability_source_packet_receipt.json` | [`Plans/_shards/web_capability_source_packet_receipt/00-index.md`](Plans/_shards/web_capability_source_packet_receipt/00-index.md) |
| `web_capability_source_packet_receipt.schema.json` | [`Plans/_shards/web_capability_source_packet_receipt.schema/00-index.md`](Plans/_shards/web_capability_source_packet_receipt.schema/00-index.md) |
| `web_intent_routing_fixtures.json` | [`Plans/_shards/web_intent_routing_fixtures/00-index.md`](Plans/_shards/web_intent_routing_fixtures/00-index.md) |
| `web_operation_card_fixtures.json` | [`Plans/_shards/web_operation_card_fixtures/00-index.md`](Plans/_shards/web_operation_card_fixtures/00-index.md) |
| `web_operation_contracts.schema.json` | [`Plans/_shards/web_operation_contracts.schema/00-index.md`](Plans/_shards/web_operation_contracts.schema/00-index.md) |
| `web_operation_job_fixtures.json` | [`Plans/_shards/web_operation_job_fixtures/00-index.md`](Plans/_shards/web_operation_job_fixtures/00-index.md) |
| `web_policy_negative_fixtures.json` | [`Plans/_shards/web_policy_negative_fixtures/00-index.md`](Plans/_shards/web_policy_negative_fixtures/00-index.md) |
| `web_policy_negative_fixtures.schema.json` | [`Plans/_shards/web_policy_negative_fixtures.schema/00-index.md`](Plans/_shards/web_policy_negative_fixtures.schema/00-index.md) |
| `web_provider_adapter_registry.seed.json` | [`Plans/_shards/web_provider_adapter_registry.seed/00-index.md`](Plans/_shards/web_provider_adapter_registry.seed/00-index.md) |
| `web_provider_projection_fixtures.json` | [`Plans/_shards/web_provider_projection_fixtures/00-index.md`](Plans/_shards/web_provider_projection_fixtures/00-index.md) |
| `web_research_run_fixtures.json` | [`Plans/_shards/web_research_run_fixtures/00-index.md`](Plans/_shards/web_research_run_fixtures/00-index.md) |
| `Release_Supply_Chain.md` | [`Plans/_shards/release_supply_chain/00-index.md`](Plans/_shards/release_supply_chain/00-index.md) |
| `storage_recovery_contracts.schema.json` | [`Plans/_shards/storage_recovery_contracts.schema/00-index.md`](Plans/_shards/storage_recovery_contracts.schema/00-index.md) |
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
- `Plans/assistant-chat-design.md` and `Plans/interview-subagent-integration.md` for active paused/degraded planning-state semantics; `Plans/chain-wizard-flexibility.md` preserves legacy examples only as compatibility/source-lineage input
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

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/00-plans-index.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### 0PI-001 - Plans Index Retired Source-Preserving Bridge

```yaml
plan_unit_id: 0PI-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 0PI-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 112 because 00-plans-index-S0001
  through S0027 are covered by 0PI-002 through 0PI-054 or explicit structural, retired, and migration-coverage dispositions.
  0PI-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is carried
  by fine-grained Plans index PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- 0PI-002
- 0PI-003
- 0PI-004
- 0PI-005
- 0PI-006
- 0PI-007
- 0PI-008
- 0PI-009
- 0PI-010
- 0PI-011
- 0PI-012
- 0PI-013
- 0PI-014
- 0PI-015
- 0PI-016
- 0PI-017
- 0PI-018
- 0PI-019
- 0PI-020
- 0PI-021
- 0PI-022
- 0PI-023
- 0PI-024
- 0PI-025
- 0PI-026
- 0PI-027
- 0PI-028
- 0PI-029
- 0PI-030
- 0PI-031
- 0PI-032
- 0PI-033
- 0PI-034
- 0PI-035
- 0PI-036
- 0PI-037
- 0PI-038
- 0PI-039
- 0PI-040
- 0PI-041
- 0PI-042
- 0PI-043
- 0PI-044
- 0PI-045
- 0PI-046
- 0PI-047
- 0PI-048
- 0PI-049
- 0PI-050
- 0PI-051
- 0PI-052
- 0PI-053
- 0PI-054
unblocks: []
acceptance_criteria:
- 0PI-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 112.
- 00-plans-index-S0001 through S0027 coverage is owned by 0PI-002 through 0PI-054 or explicit structural, retired, and migration-coverage
  dispositions.
- 0PI-001 remains only to preserve migration lineage for the former source-preserving bridge.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0026
preserved_exact_tokens:
- 0PI-001
- Plans Index (authoritative map) Source-Preserving PlanUnit
- Plans Index Residual Source-Preserving Bridge
- source_preserving_planunit
- source_preserving_bridge_retired
- PlanUnits
- Migration Coverage
negative_constraints:
- 0PI-001 must not re-own 00-plans-index-S0001 through S0027 after Phase 2B batch 112.
- 0PI-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Retired bridge lineage must not be treated as implementation-ready product coverage.
- The retired bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- 0PI-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former 0PI-001 residual source-preserving bridge is retired by Phase 2B batch 112.
owner_boundary_notes:
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Progression_Gates.md'
```

### 0PI-002 - Index Authority And Compliance

```yaml
plan_unit_id: 0PI-002
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Plans index is the authoritative map and preserves the plans-index-authoritative-map alias, compliance with Plans/DRY_Rules.md and Plans/Contracts_V0.md, Puppet Master naming, no open questions, and deterministic defaults.
gui_related: false
gui_classification_reason: The unit records document authority and compliance metadata, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: index_authority_and_compliance
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: index_authority_and_compliance
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0001'
preserved_exact_tokens:
- 'Plans Index (authoritative map)'
- 'plans-index-authoritative-map'
- 'Plans/DRY_Rules.md'
- 'Plans/Contracts_V0.md'
- 'Puppet Master'
- 'Plans/Decision_Policy.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-003 - Change Summary And Index Role

```yaml
plan_unit_id: 0PI-003
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The change summary preserves dated registration entries including assistant-memory-subsystem, GitHub_Integration, PM Bootstrap Planning Ledger, Plan Document System, Plan-to-node compilation boundary, bootstrap migration owner docs, and ledger pldg-20260610-001-ledger-plan-system; the index is navigation and canonicalization aid only and does not override detail in any plan.
gui_related: false
gui_classification_reason: The unit records index metadata, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: change_summary_and_index_role
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: change_summary_and_index_role
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0002'
preserved_exact_tokens:
- '2026-02-26'
- 'Plans/assistant-memory-subsystem.md'
- '2026-02-25'
- 'Plans/GitHub_Integration.md'
- '2026-06-11'
- 'pldg-20260610-001-ledger-plan-system'
- 'navigation + canonicalization aid'
negative_constraints:
- 'It does not remove or override detail in any plan.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md, PolicyRule:Decision_Policy.md§2'
```

### 0PI-004 - Anti Drift Reading Order

```yaml
plan_unit_id: 0PI-004
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The anti-drift layer preserves the required owner-doc reading order, primary consumer docs, and reconciliation rules that owner docs precede consumer docs, consumer docs must not preserve stale tier-era or request-era canon as peer alternatives, and summary/checklist mirrors reconcile after owners and primary consumers.
gui_related: false
gui_classification_reason: The unit records reading-order governance, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: anti_drift_reading_order
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: anti_drift_reading_order
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0003'
preserved_exact_tokens:
- 'rewrite-tie-in-memo.md'
- 'Decision_Log.md'
- 'DRY_Rules.md'
- 'Crosswalk.md'
- 'Contracts_V0.md'
- 'storage-plan.md'
- 'Prompt_Pipeline.md'
- 'Executor_Protocol.md'
- 'Decision_Policy.md'
- 'Progression_Gates.md'
negative_constraints:
- 'consumer docs must not preserve stale tier-era or request-era canon as peer alternatives'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Owner docs are reconciled before consumer docs.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Progression_Gates.md'
```

### 0PI-005 - Owner Map Guard And Initial Seams

```yaml
plan_unit_id: 0PI-005
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The owner-map guard records routing relationships only and does not re-own contract, storage, UI, chat, run-graph, HITL, executor, or usage behavior; initial seams route primary owners and adjacent consumers for contracts, crosswalk, storage, UI, Final GUI, file surfaces, usage, run graph, HITL, and mixed-era layering.
gui_related: true
gui_classification_reason: The unit maps GUI/UI owner seams and runtime consumers.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_map_guard_and_initial_seams
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: owner_map_guard_and_initial_seams
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0004'
preserved_exact_tokens:
- 'does not re-own'
- 'Contracts/Crosswalk to UI/run seam'
- 'Contracts/Final GUI seam'
- 'Storage/command/UI/contract seam'
- 'mixed-era'
negative_constraints:
- 'Mixed-era layering must not preserve older framing as peer canon.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Primary owner entries carry owning canon; adjacent docs consume or align.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-006 - Owner Map Routing And Stale Consumer Seams

```yaml
plan_unit_id: 0PI-006
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The owner-map routing section preserves priority/routing docs, source-order equivalence, stale-consumer, owner-gap, shell-adoption strata, /inconsistent, /precedence, and repeated-owner-set notes so reconciliation follows the same owner sets regardless of source ordering.
gui_related: true
gui_classification_reason: The unit includes GUI/run/UI routing and stale-consumer owner-map facts.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_map_routing_and_stale_consumer_seams
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: owner_map_routing_and_stale_consumer_seams
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0004'
preserved_exact_tokens:
- 'Priority 3'
- 'source orderings'
- 'stale-consumer'
- 'owner-gap'
- '/inconsistent'
- '/precedence'
- 'repeated source orderings'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- 'Stale consumer and owner-gap labels are routing facts, not new product owners.'
owner_boundary_notes:
- 'Plans/00-plans-index.md records routing; named docs retain canon.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-007 - Owner Map Runtime File Storage Seams

```yaml
plan_unit_id: 0PI-007
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The owner-map runtime/file/storage seams preserve terminology and routing for safe-point, restore-point, rollback, contamination, source-lineage exclusions, runtime/storage/policy/UI terminology, GATE-010 limitation, and owner/consumer boundaries for runtime, file, storage, policy, executor, and contracts.
gui_related: true
gui_classification_reason: The unit includes runtime and UI owner-map seams affecting visible recovery and command surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_map_runtime_file_storage_seams
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: owner_map_runtime_file_storage_seams
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0004'
preserved_exact_tokens:
- 'safe-point'
- 'restore-point'
- 'rollback'
- 'contamination'
- 'source-lineage only'
- 'GATE-010'
- 'command-normalization'
negative_constraints:
- 'GATE-010 cannot express the routing and command-normalization checks now needed.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Index routing points to owner docs; it does not replace them.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-008 - Owner Map GUI Widget Usage Final Pass Seams

```yaml
plan_unit_id: 0PI-008
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The owner-map GUI/widget/usage/final-pass seams preserve GUI widget and usage routing, usage_event_ref shape, page_tab, cost_usage, runtime-recovery duplicate-canon cleanup, blocked_sequence ownership, and /HITL/chat/storage compatibility-only bucket handling.
gui_related: true
gui_classification_reason: The unit directly covers GUI/widget/usage routing and user-visible command destinations.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_map_gui_widget_usage_final_pass_seams
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: owner_map_gui_widget_usage_final_pass_seams
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0004'
preserved_exact_tokens:
- 'usage_event_ref'
- 'page_tab'
- 'cost_usage'
- 'runtime-recovery'
- 'blocked_sequence'
- '/HITL/chat/storage'
- 'coordination-canon'
negative_constraints:
- 'usage-feature.md consumers must not rely on timestamp heuristics or a shape that lacks authoritative storage/runtime linkage.'
- 'UI/HITL/chat/storage docs must not re-own the blocked episode.'
compatibility_only_notes:
- 'Legacy /HITL/chat/storage bucket shorthand is a compatibility label, not an owner.'
stale_retired_dispositions: []
owner_boundary_notes:
- 'Executor_Protocol and Contracts_V0 own blocked_sequence runtime scheduler/executor semantics.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-009 - Rewrite Agent Loop Architecture Baseline

```yaml
plan_unit_id: 0PI-009
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The rewrite tie-in records adaptation of OpenCode-style architecture into a deterministic agent-loop core with unified event model, seglog to redb and Tantivy projections, central tool registry and policy engine, and patch/apply/verify/rollback pipeline.
gui_related: false
gui_classification_reason: This split unit records backend architecture and storage/tooling behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rewrite_agent_loop_architecture_baseline
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: rewrite_agent_loop_architecture_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0005'
preserved_exact_tokens:
- 'OpenCode-style architecture'
- 'deterministic agent-loop core'
- 'event model'
- 'seglog'
- 'redb'
- 'Tantivy'
- 'tool registry + policy engine'
- 'patch/apply/verify/rollback'
negative_constraints: []
compatibility_only_notes:
- 'OpenCode-style architecture is adaptation baseline, not ownership transfer.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-010 - Rewrite UI Auth Account Carry Through

```yaml
plan_unit_id: 0PI-010
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The rewrite tie-in preserves Rust + Slint UI rewrite, subscription-first auth, Gemini Direct as active direct API,
  Antigravity CLI as the active Google-owned CLI-runtime route, retired Gemini CLI split vocabulary as source-lineage
  only, key-exception lineage, and requested/effective auth, account identity, account/plan UI, quota, and usage labels
  carrying across storage, runtime, setup/health, media capabilities, and usage.
gui_related: true
gui_classification_reason: The unit covers Rust + Slint UI rewrite, account/plan UI, and visible auth/quota/usage labels.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rewrite_ui_auth_account_carry_through
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: rewrite_ui_auth_account_carry_through
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0005'
preserved_exact_tokens:
- 'Rust + Slint'
- 'subscription-first'
- 'Gemini Direct'
- 'gemini'
- 'Gemini CLI'
- 'gemini_cli'
- 'key-exception'
- 'requested/effective auth'
- 'account/plan UI'
negative_constraints:
- 'Do not treat Gemini CLI as an active provider entry.'
compatibility_only_notes:
- 'Gemini Direct and Gemini CLI split is retained only as source-lineage; current active split is Gemini Direct plus Antigravity CLI.'
stale_retired_dispositions:
- 'Gemini is modeled as two provider entries, not one stale-canon mixed-account provider.'
- 'Active Gemini CLI provider-entry support is retired by provider-update ledger pldg-20260624-001-provider-updates.'
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD'
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
```

### 0PI-011 - Provider Account Owner Split

```yaml
plan_unit_id: 0PI-011
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Provider/account reconciliation keeps Multi-Account and provider docs as requested/effective account, auth, quota, and provider-health owners; Section 15 owns the promoted shell; FinalGUISpec consumes shell placement and recovery UI; orchestrator, run modes, executor, and storage own runtime records; stale pre-promotion, /title-bar/recovery, and similar shell wording are lineage or mirror cleanup input.
gui_related: true
gui_classification_reason: The unit covers visible promoted shell, settings, title-bar, attention, recovery, and account UI consumers.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_account_owner_split
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: provider_account_owner_split
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0006'
preserved_exact_tokens:
- 'Multi-Account.md'
- 'Section15_MVP_Promoted_Features_Spec.md'
- 'FinalGUISpec.md'
- 'pre-promotion'
- '/title-bar/recovery'
- 'lineage or mirror cleanup input'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- 'Stale pre-promotion page, /title-bar/recovery, and feature-list/newfeatures shell wording are not live owner alternatives.'
owner_boundary_notes:
- 'Provider/account/promoted-shell routing stays split by owner surface.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md'
```

### 0PI-012 - PM Planning And Node Readiness Owner Split

```yaml
plan_unit_id: 0PI-012
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The PM Bootstrap Planning map preserves owner split for Planning_Ledger_System, Plan_Document_System, Plan_To_Node_Compilation, and Bootstrap_Planning_Migration; it preserves literal gui_related: true|false and states that ordinary ledger writing, plan drafting, conversion, indexing, and node-readiness reporting do not update governance artifacts or create WorkNodes, executable build tasks, or NodeSeed candidates.
gui_related: false
gui_classification_reason: This unit is plan/governance metadata rather than GUI behavior, while preserving the literal gui_related token.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: pm_planning_and_node_readiness_owner_split
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: pm_planning_and_node_readiness_owner_split
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0008'
preserved_exact_tokens:
- 'Planning_Ledger_System.md'
- 'Plan_Document_System.md'
- 'Plan_To_Node_Compilation.md'
- 'Bootstrap_Planning_Migration.md'
- 'gui_related: true|false'
- 'Spec_Lock.json'
- 'WorkNodes'
- 'NodeSeed'
negative_constraints:
- 'It does not create WorkNodes, executable build tasks, or NodeSeed candidates until the compiler contract is complete and the PNC-019 executable lifecycle certification harness has passed with recorded evidence.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
```

### 0PI-013 - Instant Grep Live Canon Map

```yaml
plan_unit_id: 0PI-013
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Instant Grep note makes 00-plans-index.md the live canon-map and /index discoverability map for promoted Instant Grep canon, preserving owner boundaries for implementation-safe detail and clarification-gate routing to owner maps.
gui_related: true
gui_classification_reason: The unit covers user-visible /index discoverability and clarification flows.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: instant_grep_live_canon_map
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: instant_grep_live_canon_map
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0009'
preserved_exact_tokens:
- '/00-plans-index.md'
- '/index'
- 'Instant Grep'
- 'ArcSwap'
- 'dirty-layer'
- 'clarification gate'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Storage, runtime contracts, FinalGUISpec, and Usage analytics retain their owner boundaries.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-014 - Instant Grep Owner Split

```yaml
plan_unit_id: 0PI-014
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Instant Grep packet owner split preserves Tools ownership for grep semantics, storage ownership for regex-index layout and dirty-layer lifecycle, FinalGUISpec ownership for indexing settings/status/Search UX, GitHub ownership for remote cache behavior, and named reconciliation consumers.
gui_related: true
gui_classification_reason: The unit includes FinalGUISpec settings, status-bar, Search ownership, and remote-cache administration surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: instant_grep_owner_split
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: instant_grep_owner_split
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0009'
preserved_exact_tokens:
- 'Tools.md'
- 'storage-plan.md'
- 'FinalGUISpec.md'
- 'GitHub_Integration.md'
- 'sparse-n-gram'
- 'tool.invoked.index_used'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md'
```

### 0PI-015 - Browser Owner Split

```yaml
plan_unit_id: 0PI-015
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Browser owner split preserves Section 15 as browser behavior SSOT, rewrite-tie-in as browser-runtime baseline owner, FinalGUISpec/FileManager/UI_Command_Catalog as primary browser consumers, related reconciliation consumers, and signal_confidence values authoritative, structured, heuristic, and local_only.
gui_related: true
gui_classification_reason: The unit covers browser UI placement, preview/click-to-context, user-visible commands, DevTools, and evidence surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_owner_split
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: browser_owner_split
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0010'
preserved_exact_tokens:
- 'Section15_MVP_Promoted_Features_Spec.md'
- 'rewrite-tie-in-memo.md'
- 'FinalGUISpec.md'
- 'FileManager.md'
- 'UI_Command_Catalog.md'
- 'signal_confidence'
- 'authoritative'
- 'structured'
- 'heuristic'
- 'local_only'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/UI_Command_Catalog.md'
```

### 0PI-016 - Browser Stale Cleanup And Consumer Map

```yaml
plan_unit_id: 0PI-016
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Browser cleanup preserves newfeatures.md as historical/origin material only, retires stale cues such as /stale-canon, /WebView2/WebKitGTK, older trust-tier browser permission matrices, bottom-panel/browser panel wording, and maps Section 15, Final GUI, File Manager, UI Command Catalog, Wiring Matrix, and newtools consumer responsibilities.
gui_related: true
gui_classification_reason: The unit covers visible browser/session behavior, command routing, placement, and stale GUI terminology cleanup.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_stale_cleanup_and_consumer_map
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: browser_stale_cleanup_and_consumer_map
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0010'
preserved_exact_tokens:
- 'newfeatures.md'
- 'historical/origin material only'
- '/stale-canon'
- '/WebView2/WebKitGTK'
- 'trust-tier'
- 'bottom-panel'
- 'browser panel/window'
- 'preview_mode = browser_panel'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- 'Browser stale-reference cues are retired origin/stale-canon cues, not live browser owners or implementation alternatives.'
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/newfeatures.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md'
```

### 0PI-017 - Slash Chat SSOT Boundary

```yaml
plan_unit_id: 0PI-017
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Slash-Command and Chat-Tools map preserves that 00-plans-index.md is index and ownership map only, not SSOT for slash-command schemas, tool permissions, GUI /presentation, or persisted event payloads; it locks phase A through D reconciliation order across chat, commands, tools, permissions, GUI behavior, and storage registration.
gui_related: true
gui_classification_reason: The unit covers chat tools, slash commands, GUI /presentation, and persisted payload routing.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: slash_chat_ssot_boundary
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: slash_chat_ssot_boundary
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0011'
preserved_exact_tokens:
- 'Slash-Command and Chat-Tools SSOT Map'
- 'not the SSOT'
- 'GUI `/presentation`'
- 'phase A'
- 'phase B'
- 'phase C'
- 'phase D'
negative_constraints:
- 'Avoid schema duplication here.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Runtime/event envelope stays in Contracts_V0 and concrete payload registration in storage-plan.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-018 - Slash Chat Scope And Drift Risks

```yaml
plan_unit_id: 0PI-018
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Slash/chat scope preserves ready-now /web command family, normalized operation set, distinct activity labels and tool keys, permission-key expansion, citation/provenance precedence, bounded operation defaults, additive web child payload recommendations, blocked provider-runtime scope, and highest drift-risk pairs.
gui_related: true
gui_classification_reason: The unit covers chat command UX, activity labels, permission behavior, and provider settings UX boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: slash_chat_scope_and_drift_risks
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: slash_chat_scope_and_drift_risks
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0011'
preserved_exact_tokens:
- '/web'
- 'permission-key expansion'
- 'citation/provenance precedence'
- 'bounded operation defaults'
- 'provider taxonomy'
- 'account-selection'
- 'provider settings rows/layout'
- 'global versus per-operation provider ordering UX'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Named owner docs resolve drift-risk pairs.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
```

### 0PI-019 - Artifact HITL Tool Owner Split

```yaml
plan_unit_id: 0PI-019
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Artifact, HITL, and tool approval canon preserves owner split across Runtime_Artifacts_Panel, storage-plan, Contracts_V0, Tools, human-in-the-loop, and Permissions_System for artifact presentation, durable projections, event envelope, tool policy, HITL approval UX, and permission snapshot semantics.
gui_related: true
gui_classification_reason: The unit includes runtime artifact presentation and approval UX surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: artifact_hitl_tool_owner_split
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: artifact_hitl_tool_owner_split
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0012'
preserved_exact_tokens:
- 'Runtime_Artifacts_Panel.md'
- 'storage-plan.md'
- 'Contracts_V0.md'
- 'Tools.md'
- 'human-in-the-loop.md'
- 'Permissions_System.md'
- 'approval UX'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Artifact, HITL, and tool approval canon uses owner split rather than a three-way SSOT.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Permissions_System.md'
```

### 0PI-020 - Approval Compatibility Boundary

```yaml
plan_unit_id: 0PI-020
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The approval compatibility boundary preserves request_id to blocked_sequence as lineage routing, canonical blocked episode resolution before runtime mutation, approval_scope_key, ordered allowed_action_ids[], and the negative constraint that allowed_actions is not revived as a peer field family or generic approval widener.
gui_related: false
gui_classification_reason: The unit records compatibility and runtime mutation boundary semantics rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: approval_compatibility_boundary
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: approval_compatibility_boundary
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0012'
preserved_exact_tokens:
- 'request_id <-> blocked_sequence'
- 'approval_scope_key'
- 'allowed_action_ids[]'
- 'allowed_actions'
negative_constraints:
- 'Do not revive allowed_actions as a peer field family.'
- 'Do not let a generic session approval widen beyond its explicit scope key.'
compatibility_only_notes:
- 'Surviving request_id values resolve to canonical blocked episode before runtime mutation.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-021 - Terminal Ownership Map

```yaml
plan_unit_id: 0PI-021
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The terminal ownership map preserves Section 15, FinalGUISpec, and storage-plan as terminal owners; assistant-chat-design and FileManager as primary consumers; UI_Command_Catalog, Contracts_V0, and Wiring_Matrix for commands/contracts/wiring; adjacent policy/runtime/terminology companions; anti-drift review order; non-buildable omission rule; and ContractRefs.
gui_related: true
gui_classification_reason: The unit covers terminal placement, settings UI, session identity, command cards, file workflows, and terminal/browser tabs.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: terminal_ownership_map
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: terminal_ownership_map
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0013'
preserved_exact_tokens:
- 'Terminal Ownership Map'
- 'Section15_MVP_Promoted_Features_Spec.md'
- 'FinalGUISpec.md'
- 'storage-plan.md'
- 'assistant-chat-design.md'
- 'FileManager.md'
- 'UI_Command_Catalog.md'
- 'Wiring_Matrix.md'
- 'non-buildable'
negative_constraints:
- 'Terminal packets that omit UI_Command_Catalog.md, Contracts_V0.md, or Wiring_Matrix.md are non-buildable.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
```

### 0PI-022 - File Manager Editor Owner Posture

```yaml
plan_unit_id: 0PI-022
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The file manager/editor map preserves bounded reconciliation posture and owner boundaries for Crosswalk, GitHub_Integration SSH remote behavior, LSPSupport, FileManager file/editor behavior, Section15 plus storage terminal/runtime identity, and FinalGUISpec shell realization and banners.
gui_related: true
gui_classification_reason: The unit covers file manager/editor shell, inspectors, banners, remote mode, LSP, and terminal/runtime UI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_editor_owner_posture
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: file_manager_editor_owner_posture
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0014'
preserved_exact_tokens:
- 'Crosswalk.md'
- 'GitHub_Integration.md §C'
- 'LSPSupport.md'
- 'FileManager.md'
- 'Section15_MVP_Promoted_Features_Spec.md'
- 'storage-plan.md'
- 'FinalGUISpec.md'
- 'one-bounded-auto-retry'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-023 - File Manager Editor Packetization Gates

```yaml
plan_unit_id: 0PI-023
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The file manager/editor packetization gates preserve stale cleanup order, Wiring_Matrix requirement for introduced command rows, MUST CHANGE/MUST RECONCILE/MUST VERIFY register, browser residue cleanup, remote/session storage promotion guard, and Contracts_V0 promotion when event-level host or freshness fields are canonized.
gui_related: true
gui_classification_reason: The unit covers GUI/file command wiring, stale browser cleanup, and remote/session visibility gates.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_manager_editor_packetization_gates
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: file_manager_editor_packetization_gates
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0014'
preserved_exact_tokens:
- 'Wiring_Matrix.md'
- 'MUST CHANGE'
- 'MUST RECONCILE'
- 'MUST VERIFY'
- 'browser residue cleanup'
- 'host_id'
- 'root_identity'
- '/event-level'
- '/health/write-availability'
negative_constraints:
- 'Command routing is non-coherent without Wiring_Matrix when relevant commands are introduced.'
compatibility_only_notes: []
stale_retired_dispositions:
- 'Browser residue cleanup cues are retired markers, not peer canon.'
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-024 - GUI Worktree And Source Control Handoff

```yaml
plan_unit_id: 0PI-024
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  GUI worktree visibility is part of the seam: FinalGUISpec owns visible cross-surface behavior, FileManager may show compact repo/worktree context without owning commit history or worktree management, WorktreeGitImprovement owns worktree lifecycle/recovery, assistant-chat-design owns preview cards, and File Manager preserves repo_id and worktree_id when handing off to Source Control.
gui_related: true
gui_classification_reason: The unit covers visible worktree context, File Manager headers, Source Control handoff, editor status, and breadcrumbs.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_worktree_and_source_control_handoff
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: gui_worktree_and_source_control_handoff
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0014'
preserved_exact_tokens:
- 'GUI worktree visibility'
- 'repo_id'
- 'worktree_id'
- 'Source Control'
- '/workspace'
- '/strip'
- '/tab'
- '/conflicted'
negative_constraints:
- 'Do not repeat a worktree symbol on every file row or tab by default.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'WorktreeGitImprovement owns worktree lifecycle and recovery.'
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/WorktreeGitImprovement.md'
```

### 0PI-025 - Debug Ownership And Packet Coupling

```yaml
plan_unit_id: 0PI-025
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Debug canon note preserves assistant-chat-design as Assistant Debug owner, Run_Modes/Permissions/storage as runtime posture owners, Section 15 as browser-target debug owner, Runtime_Artifacts/Contracts/Prompt/Tools as artifact/event/prompt/tool owners, primary consumers, reconciliation companions, and mandatory Commands/Glossary/Wiring plus Contracts/Prompt/GitHub packet coupling.
gui_related: true
gui_classification_reason: The unit covers Debug Mode UI, investigation context, thread lifecycle, visible browser evidence, automation, shell placement, command routing, and debug tooling discovery.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_ownership_and_packet_coupling
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: debug_ownership_and_packet_coupling
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0015'
preserved_exact_tokens:
- 'Debug Mode'
- 'Investigation Context'
- 'automation_session'
- 'attention_required'
- 'Commands_System.md'
- 'Glossary.md'
- 'Wiring_Matrix.md'
- 'Contracts_V0.md'
- 'Prompt_Pipeline.md'
- 'GitHub_Integration.md'
negative_constraints:
- 'Packets omitting required coupled docs leave drift.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md'
```

### 0PI-026 - Plan Map Table Core UX Owners

```yaml
plan_unit_id: 0PI-026
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Plan map table core UX owner rows preserve rewrite, promoted Section 15, agent rules, orchestrator subagents, interview subagents, assistant chat, assistant memory, FinalGUISpec, GitHub, FileManager, LSPSupport, and storage-plan scopes and canonical intent.
gui_related: true
gui_classification_reason: The table rows include GUI shell, chat UX, file manager, LSP editor behavior, Git panel, and storage-backed user-visible state.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plan_map_table_core_ux_owners
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: plan_map_table_core_ux_owners
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0015'
preserved_exact_tokens:
- 'rewrite-tie-in-memo.md'
- 'Section15_MVP_Promoted_Features_Spec.md'
- 'agent-rules-context.md'
- 'orchestrator-subagent-integration.md'
- 'assistant-chat-design.md'
- 'FinalGUISpec.md'
- 'GitHub_Integration.md'
- 'FileManager.md'
- 'LSPSupport.md'
- 'storage-plan.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-027 - Plan Map Table Planning Runtime Artifacts

```yaml
plan_unit_id: 0PI-027
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Plan map table planning/runtime/artifact rows preserve chain wizard, document packaging, planning ledger, Plan Document System, Plan-to-node compilation, Bootstrap migration, HITL, FileSafe, Prompt Pipeline, WorktreeGitImprovement, MiscPlan, newtools, Tools, OpenCode Deep Extraction, Decision Log, usage, runtime artifacts, project output, and newfeatures scopes.
gui_related: true
gui_classification_reason: The table rows include usage dashboards, runtime artifacts panel, project output artifacts, testing tools, and HITL user-visible behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plan_map_table_planning_runtime_artifacts
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: plan_map_table_planning_runtime_artifacts
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0015'
preserved_exact_tokens:
- 'chain-wizard-flexibility.md'
- 'Document_Packaging_Policy.md'
- 'Planning_Ledger_System.md'
- 'Plan_Document_System.md'
- 'Plan_To_Node_Compilation.md'
- 'Bootstrap_Planning_Migration.md'
- 'human-in-the-loop.md'
- 'FileSafe.md'
- 'Prompt_Pipeline.md'
- 'WorktreeGitImprovement.md'
- 'newtools.md'
- 'Tools.md'
- 'OpenCode_Deep_Extraction.md'
- 'usage-feature.md'
- 'Runtime_Artifacts_Panel.md'
- 'Project_Output_Artifacts.md'
- 'newfeatures.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-028 - Plan Map Table Widgets Config Media Wiring

```yaml
plan_unit_id: 0PI-028
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Plan map table widgets/config/media/wiring rows preserve Widget_System, Run_Graph_View, Orchestrator_Page, GUI checklist, Executor_Protocol, UI_Wiring_Rules, provider reference docs, BinaryLocator, Run_Modes, Personas, Permissions, Commands, Skills, Plugins, Formatters, Models, Media Generation, OpenCode Coverage Matrix, and Wiring Matrix scopes.
gui_related: true
gui_classification_reason: The table rows cover widgets, graph view, orchestrator tabs, GUI checklist, UI wiring, permissions/settings, commands, skills/plugins/formatters/models/media GUI, and wiring matrix.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plan_map_table_widgets_config_media_wiring
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: plan_map_table_widgets_config_media_wiring
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0015'
preserved_exact_tokens:
- 'Widget_System.md'
- 'Run_Graph_View.md'
- 'Orchestrator_Page.md'
- 'GUI_Rebuild_Requirements_Checklist.md'
- 'Executor_Protocol.md'
- 'UI_Wiring_Rules.md'
- 'Provider_OpenCode.md'
- 'BinaryLocator_Spec.md'
- 'Run_Modes.md'
- 'Personas.md'
- 'Permissions_System.md'
- 'Commands_System.md'
- 'Skills_System.md'
- 'Plugins_System.md'
- 'Formatters_System.md'
- 'Models_System.md'
- 'Media_Generation_and_Capabilities.md'
- 'OpenCode_Coverage_Matrix.md'
- 'Wiring_Matrix.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-029 - Instant Grep Sparse N Gram Owner Split

```yaml
plan_unit_id: 0PI-029
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Instant Grep sparse n-gram owner split preserves Tools ownership for grep semantics and analytics, storage ownership for regex index layout and file watchers, FinalGUISpec ownership for status bar/settings/Search panel UX, GitHub ownership for remote project search index cache, and reconciliation consumers including assistant chat, UI command catalog, Glossary, Architecture Invariants, BinaryLocator, usage, Wiring Matrix, and this index.
gui_related: true
gui_classification_reason: The unit covers indexing status bar, settings, Search panel UX, and remote-cache settings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'Plans/00-plans-index.md remains a navigation and canonicalization aid; named owner docs retain product canon.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: instant_grep_sparse_n_gram_owner_split
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: instant_grep_sparse_n_gram_owner_split
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0016'
preserved_exact_tokens:
- 'Instant Grep'
- 'sparse n-gram index'
- 'Tools.md'
- 'storage-plan.md'
- 'FinalGUISpec.md'
- 'GitHub_Integration.md'
- 'status bar Indexing indicator'
- 'Search panel index-acceleration UX'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md'
```


### 0PI-030 - Cross-Cutting Backend Duplication Hotspots

```yaml
plan_unit_id: 0PI-030
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Known cross-cutting duplication hotspots section preserves backend and runtime duplication risks for child-run
  canon versus provider-native subagent language, Persona selection versus subagent registry language, crew shared-state versus
  legacy memory-manager language, dynamic context shrinking versus compaction and Subcompact language, requested/effective
  runtime surface and effort language, and blocked/awaiting-parent versus older denial or recovery aliases.
gui_related: false
gui_classification_reason: The unit records backend/runtime owner-routing duplication risks rather than user-visible presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cross_cutting_backend_duplication_hotspots
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: cross_cutting_backend_duplication_hotspots
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0017
preserved_exact_tokens:
- Known cross-cutting duplication hotspots
- child-run canon
- provider-native subagent language
- Persona selection
- subagent registry language
- crew shared-state
- legacy memory-manager language
- dynamic context shrinking
- Subcompact
- requested/effective runtime surface and effort language
- blocked/awaiting-parent
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Named owner docs carry the underlying canon; this index records the duplication hotspot map.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md'
```

### 0PI-031 - Context Lens UI Hotspot

```yaml
plan_unit_id: 0PI-031
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Known cross-cutting duplication hotspots section preserves Context Lens UI wording versus command and
  wiring ownership as a GUI-related owner-routing risk that must be reconciled through command and wiring owners rather than
  duplicated index prose.
gui_related: true
gui_classification_reason: The unit explicitly covers Context Lens UI wording and command/wiring ownership for a user-visible
  surface.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: context_lens_ui_hotspot
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: context_lens_ui_hotspot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0017
preserved_exact_tokens:
- Context Lens UI wording
- command and wiring ownership
- Known cross-cutting duplication hotspots
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Command and wiring owner docs must carry implementation canon for this UI hotspot.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md'
```

### 0PI-032 - Rewrite-Era Owner Guidance

```yaml
plan_unit_id: 0PI-032
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: Rewrite-era guidance preserves that owner docs define the canon, consumer docs should reference owner docs
  rather than re-describing the full model, and packetization and reconciliation should prefer rewrite-outright where stale
  canon would remain misleading if left in place.
gui_related: false
gui_classification_reason: The unit records governance and owner-doc routing guidance, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rewrite_era_owner_guidance
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: rewrite_era_owner_guidance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0017
preserved_exact_tokens:
- Rewrite-era guidance
- owner docs define the canon
- consumer docs should reference owner docs
- rewrite-outright
- stale canon
negative_constraints:
- Consumer docs must not re-describe a competing full model when owner docs carry the canon.
compatibility_only_notes: []
stale_retired_dispositions:
- Stale canon should be rewritten outright when leaving it in place would remain misleading.
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Progression_Gates.md'
```

### 0PI-033 - Shard Governance Boundaries

```yaml
plan_unit_id: 0PI-033
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The shard index governance text preserves regeneration and check commands, declares Plans/_shards/** and Plans/.evidence/**
  regen-only after canonical doc edits, forbids hand-editing them during packetization or transfer work, keeps post-edit validation
  required, validates Plans/Spec_Lock.json through verify-spec-lock, manages Plans/auto_decisions.jsonl as a deterministic
  log, and treats stale packet-decision references as source-lineage only.
gui_related: false
gui_classification_reason: The unit covers generated governance artifact handling rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shard_governance_boundaries
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: shard_governance_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0018
preserved_exact_tokens:
- Shard indexes
- python3 scripts/pm-shard-plans.py --generate
- python3 scripts/pm-shard-plans.py --check
- Plans/_shards/**
- Plans/.evidence/**
- do not hand-edit
- Plans/Spec_Lock.json
- python3 scripts/pm-plans-verify.py verify-spec-lock
- Plans/auto_decisions.jsonl
- packet-decision
- source-lineage only
negative_constraints:
- Plans/_shards/** and Plans/.evidence/** must not be hand-edited during packetization or transfer work.
compatibility_only_notes:
- Stale packet-decision references are source-lineage only, not live packet doc intents.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-034 - Shard Index Routing Table

```yaml
plan_unit_id: 0PI-034
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The shard index table preserves every Source doc to Plans/_shards/<doc-slug>/00-index.md mapping in the index, including
  orchestrator subagents, FinalGUISpec, bootstrap, prompt, wiring, GUI checklist, widget, and 00-plans-index.md shard entries.
gui_related: false
gui_classification_reason: The unit records document-to-shard routing metadata, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shard_index_routing_table
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: shard_index_routing_table
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0018
preserved_exact_tokens:
- Source doc
- Shard index
- orchestrator-subagent-integration.md
- FinalGUISpec.md
- Planning_Ledger_System.md
- Plan_Document_System.md
- Plan_To_Node_Compilation.md
- Bootstrap_Planning_Migration.md
- Prompt_Pipeline.md
- Wiring_Matrix.md
- GUI_Rebuild_Requirements_Checklist.md
- Widget_System.md
- 00-plans-index.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The table is an index routing aid and does not replace the listed source docs.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-035 - Containers Registry Unraid Owner Scope

```yaml
plan_unit_id: 0PI-035
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The 2026-03-07 containers, registry, and Unraid addendum registers Plans/Containers_Registry_and_Unraid.md
  as the canonical SSOT for first-class DockerHub image publishing, container runtime management, managed Unraid template
  repositories, ca_profile.xml behavior, protected repo creation, managed template-repo defaults, ca_profile.xml scope/editability,
  and maintainer-asset handling.
gui_related: false
gui_classification_reason: The unit records container/registry owner scope and operational canon rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: containers_registry_unraid_owner_scope
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: containers_registry_unraid_owner_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0019
preserved_exact_tokens:
- 2026-03-07 addendum — containers, registry, and Unraid
- Plans/Containers_Registry_and_Unraid.md
- canonical SSOT
- first-class DockerHub image publishing
- managed Unraid template repositories
- ca_profile.xml
- protected repo creation
- managed template-repo defaults
- maintainer-asset handling
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Containers_Registry_and_Unraid.md owns the canonical container, registry, and Unraid behavior.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-036 - Docker Manager Auth UX Routing

```yaml
plan_unit_id: 0PI-036
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The containers, registry, and Unraid addendum preserves contextual Docker management UI and Docker Manager
  UI routing, including DockerHub browser/PAT auth UX, requested vs effective auth capability, Publish / Unraid, project-focused
  Kubernetes placement, and contextual Docker Manager UI scope.
gui_related: true
gui_classification_reason: The unit covers Docker Manager UI, auth UX, and user-facing placement surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_manager_auth_ux_routing
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: docker_manager_auth_ux_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0019
preserved_exact_tokens:
- contextual Docker management UI
- Docker Manager UI
- DockerHub browser/PAT auth UX
- requested vs effective auth capability
- Publish / Unraid
- project-focused Kubernetes placement
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Containers_Registry_and_Unraid.md owns Docker Manager operational subviews and related UI canon.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-037 - Runtime Packet Owner Routing

```yaml
plan_unit_id: 0PI-037
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Runtime Packet Index Coverage Consolidation Addendum preserves owner routing for scheduler semantics and
  queue analysis, event/contracts and storage for attempts, safe points, and remediation lineage, provider/auth/permission
  mappings into runtime taxonomy, glossary ownership for runtime terms, canonical events/enums/identities/action fields, scheduler
  semantics, attempt lifecycle, graph-lock behavior, persistence, and restart rules.
gui_related: false
gui_classification_reason: The unit records runtime contract and owner routing rather than rendering or UI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_packet_owner_routing
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: runtime_packet_owner_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0020
preserved_exact_tokens:
- Runtime Packet Index Coverage Consolidation Addendum (2026-03-09)
- scheduler semantics and queue analysis
- event/contracts and storage
- attempts, safe points, and remediation lineage
- provider/auth/permission mappings
- runtime taxonomy
- Glossary.md
- canonical events, enums, identities, and action fields
- graph-lock behavior
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime contracts, executor protocol, storage, and glossary docs own their respective details.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md,
  ContractName:Plans/Glossary.md'
```

### 0PI-038 - Runtime Rendering And Blocked UX

```yaml
plan_unit_id: 0PI-038
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Runtime Packet Index Coverage Consolidation Addendum preserves blocked-state UX and recovery actions plus
  rendering and interaction routing through Plans/Run_Graph_View.md, Plans/Orchestrator_Page.md, and Plans/FinalGUISpec.md,
  with planning-state semantics consumed by chain wizard, assistant chat, and interview subagent docs.
gui_related: true
gui_classification_reason: The unit covers blocked-state UX, recovery actions, rendering, and interaction surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_rendering_and_blocked_ux
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: runtime_rendering_and_blocked_ux
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0020
preserved_exact_tokens:
- blocked-state UX and recovery actions
- Plans/Run_Graph_View.md
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
- rendering and interaction
- Plans/chain-wizard-flexibility.md
- Plans/assistant-chat-design.md
- Plans/interview-subagent-integration.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Rendering and blocked-state UX consumers must defer to runtime and GUI owner docs.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md,
  ContractName:Plans/Glossary.md'
```

### 0PI-039 - Source Control Actions Docker Owner Split

```yaml
plan_unit_id: 0PI-039
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 'The 2026-03-12 source control, GitHub Actions, and Docker Manager addendum preserves the owner split: Plans/GitHub_Integration.md
  owns Git-first Source Control and GitHub Actions, Plans/WorktreeGitImprovement.md owns worktree correctness and runtime
  alignment, Plans/Containers_Registry_and_Unraid.md owns Docker Manager, Plans/newtools.md owns Docker/Actions doctor and
  result minima, and Contracts, storage, Permissions, and usage are anti-drift companions.'
gui_related: false
gui_classification_reason: The unit records owner-doc routing and runtime/worktree/container responsibilities rather than
  visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: source_control_actions_docker_owner_split
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: source_control_actions_docker_owner_split
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0021
preserved_exact_tokens:
- 2026-03-12 addendum — source control, GitHub Actions, and Docker Manager
- Git-first Source Control
- GitHub Actions
- Plans/WorktreeGitImprovement.md
- worktree correctness and runtime alignment
- Docker Manager
- Docker/Actions doctor and result minima
- anti-drift companions
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Feature-owner docs own their surfaces; anti-drift companions must be read alongside them.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md,
  ContractName:Plans/storage-plan.md'
```

### 0PI-040 - Visible Source-Control Surface Routing

```yaml
plan_unit_id: 0PI-040
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The source control, GitHub Actions, and Docker Manager restart-pass owner map preserves FinalGUISpec ownership
  of activity-bar and side-panel vocabulary, Source Control, GitHub Actions, Docker Manager, cross-surface deep links, blocked-state
  presentation, mirror/owner attention behavior, GitHub Actions Current Branch / Workflows / Settings, secrets, variables,
  /environments, rerun/cancel/pin, workflow authoring help, Docker Manager operational subviews, /auth/Unraid, Publish / Unraid,
  Kubernetes placement, Orchestrator receipts, and deep links into owner surfaces.
gui_related: true
gui_classification_reason: The unit covers visible source-control, actions, Docker Manager, side-panel, and deep-link UI surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: visible_source_control_surface_routing
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: visible_source_control_surface_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0021
preserved_exact_tokens:
- activity-bar and side-panel vocabulary
- Source Control
- GitHub Actions
- Docker Manager
- Current Branch
- Workflows
- Settings
- secrets
- variables
- /environments
- rerun/cancel/pin
- workflow authoring help
- /auth/Unraid
- Publish / Unraid
- Kubernetes placement
- Orchestrator receipts
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- FinalGUISpec and feature-owner docs own visible shell vocabulary and deep-link behavior.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md,
  ContractName:Plans/storage-plan.md'
```

### 0PI-041 - Retired Git Alias And Stale-Canon Risk

```yaml
plan_unit_id: 0PI-041
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The source-control/GitHub Actions/Docker Manager addendum preserves Git (GitHub) only as a retired migration
  alias and records the highest stale-canon replacement risk in rewrite-tie-in-memo.md, usage-feature.md, FinalGUISpec.md,
  and Media_Generation_and_Capabilities.md, which must be reconciled against feature owners before older wording is treated
  as authoritative.
gui_related: true
gui_classification_reason: The unit covers a user-facing retired Git label and stale GUI/usage/media consumer risk.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: retired_git_alias_and_stale_canon_risk
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: retired_git_alias_and_stale_canon_risk
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0021
preserved_exact_tokens:
- Git (GitHub)
- retired migration alias
- stale-canon
- Plans/rewrite-tie-in-memo.md
- Plans/usage-feature.md
- Plans/FinalGUISpec.md
- Plans/Media_Generation_and_Capabilities.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Git (GitHub) is retained only as a retired migration alias.
- Older source-control/GitHub Actions/Docker Manager wording must not be treated as authoritative before reconciliation.
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md,
  ContractName:Plans/storage-plan.md'
```

### 0PI-042 - Web Firecrawl Owner Set

```yaml
plan_unit_id: 0PI-042
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Web Tools + Firecrawl + Missing-Spec Owner Alignment Note preserves the reconciled owner and consumer
  set for web tools, Firecrawl, questions, planning/TODO, permissions, runtime identity, and MCP across Tools, assistant chat,
  FinalGUISpec, Permissions, storage, Commands, UI Command Catalog, Skills, Contracts, Run Modes, Section 15, MCP Integration,
  LSPSupport, CLI Bridged Providers, Provider OpenCode, and newfeatures.
gui_related: true
gui_classification_reason: The unit includes web/chat/widget/tool/provider owner routing with user-visible web and chat surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_firecrawl_owner_set
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: web_firecrawl_owner_set
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0022
preserved_exact_tokens:
- Web Tools + Firecrawl + Missing-Spec Owner Alignment Note (2026-03-30)
- web tools
- Firecrawl
- questions
- planning/TODO
- permissions
- runtime identity
- MCP
- Plans/Tools.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
- Plans/Commands_System.md
- Plans/UI_Command_Catalog.md
- Plans/Skills_System.md
- Plans/Contracts_V0.md
- Plans/Run_Modes.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/MCP_Integration.md
- Plans/LSPSupport.md
- Plans/CLI_Bridged_Providers.md
- Plans/Provider_OpenCode.md
- Plans/newfeatures.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Consumer summaries defer to repaired owner sections rather than keeping competing canon.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/Tools.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/Provider_OpenCode.md'
```

### 0PI-043 - Firecrawl Consumer Deference And Anchors

```yaml
plan_unit_id: 0PI-043
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 'The Firecrawl alignment note preserves the consumer-deference rule, verify-only out-of-packet scope, exact
  anchor-level regeneration targets, and drift-risk heading labels including #4.1, #8.6, #13.1, #13.2, #13.3, #28.2, storage
  #4.1/#4.3/#4.4, Tools #3.6/#10.3/#10.7/## 11/## 12/## 13, Permissions #6/#10.4, Commands #7/#2.4, Skills #4/#6, Section15
  #1.3A, MCP owner sections after ## 4, and FinalGUISpec audit/replacement surfaces.'
gui_related: true
gui_classification_reason: The unit covers exact anchors for chat, storage, tool, permission, command, skill, browser, MCP,
  and GUI audit surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_consumer_deference_and_anchors
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: firecrawl_consumer_deference_and_anchors
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0022
preserved_exact_tokens:
- Consumer summaries
- defer
- Verify-only docs
- out of packet scope
- '#4.1'
- '#8.6'
- '#13.1'
- '#13.2'
- '#13.3'
- '#28.2'
- '#4.3'
- '#4.4'
- '#3.6'
- '#10.3'
- '#10.7'
- '## 11'
- '## 12'
- '## 13'
- '## 6'
- '### 10.4'
- Plans/FinalGUISpec.md
- '### 7.19 Agent Activity'
- '## 15'
- drift-risk heading labels
negative_constraints:
- Verify-only docs are intentionally out of packet scope when no edits are required.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/Tools.md, ContractName:Plans/CLI_Bridged_Providers.md,
  ContractName:Plans/Provider_OpenCode.md'
```

### 0PI-044 - Firecrawl Obligation Routing

```yaml
plan_unit_id: 0PI-044
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Firecrawl alignment note preserves explicit obligation routing for obl-013, obl-014, obl-053, obl-054,
  obl-066, obl-067, obl-044, obl-055, obl-056, obl-040, obl-059, obl-060, obl-036, obl-037, obl-042, obl-048, obl-035, obl-045,
  obl-046, obl-047, obl-051, obl-062, and obl-064, keeps ownership/index descriptions drift-sensitive, and keeps Plans/newfeatures.md
  as a summary rollup consumer for repaired web/question/MCP/LSP surfaces.
gui_related: false
gui_classification_reason: The unit records obligation-to-owner routing and index drift governance rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_obligation_routing
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: firecrawl_obligation_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0022
preserved_exact_tokens:
- Obligation routing remains explicit
- obl-013
- obl-014
- obl-053
- obl-054
- obl-066
- obl-067
- obl-044
- obl-055
- obl-056
- obl-040
- obl-059
- obl-060
- obl-036
- obl-037
- obl-042
- obl-048
- obl-035
- obl-045
- obl-046
- obl-047
- obl-051
- obl-062
- obl-064
- drift-sensitive
- Plans/newfeatures.md
- /question/MCP/LSP
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Normative behavior remains in the owner docs, while newfeatures is a summary rollup consumer only.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-045 - Slash And Provider Drift Guards

```yaml
plan_unit_id: 0PI-045
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 'The Firecrawl alignment note preserves slash-command cleanup and provider drift guards: XV2 and XV-FIX are
  AUTHORITATIVE for the reserved-command family, /clear is LOCKED and REMOVED from the reserved set, native PM structured
  reading uses /detail-level with minimal, summary, and full and is not MCP-based, and web-provider drift checks must preserve
  /effective-state, cache-persistence, under-specification, Rerun in Terminal, /TODO/Plan/Deep, Provider_OpenCode, and CLI_Bridged_Providers.'
gui_related: true
gui_classification_reason: The unit covers slash commands, command labels, structured reading UX, terminal rerun, and provider/chat
  command surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: slash_and_provider_drift_guards
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: slash_and_provider_drift_guards
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0022
preserved_exact_tokens:
- Slash-command cleanup is locked
- XV2
- XV-FIX
- AUTHORITATIVE
- /clear
- LOCKED
- REMOVED
- /detail-level
- minimal
- summary
- full
- not MCP-based
- /effective-state
- cache-persistence
- under-specification
- Rerun in Terminal
- /TODO/Plan/Deep
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
negative_constraints:
- Native PM structured reading uses /detail-level and is not MCP-based.
compatibility_only_notes: []
stale_retired_dispositions:
- /clear is locked and removed from the reserved-command family.
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-046 - Firecrawl Packet-Conflict Reset Scope

```yaml
plan_unit_id: 0PI-046
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Firecrawl/missing-spec packet-conflict reset preserves the reset title RECONCILIATION / COVERAGE PASS
  — PACKET-CONFLICT RESET (2026-04-06), supersedes older three-bucket, 12-doc, 13-doc, 23-blocker, and coverage-consuming
  registers, covers the full Firecrawl gap analysis plus missing-spec owner-alignment surface, consumes 54 active obligations
  and 7 active coverage blockers into MUST CHANGE owner docs plus MUST RECONCILE consumers, and keeps WebAction/browser consumer
  routing exact.
gui_related: true
gui_classification_reason: The unit includes web/provider, feature/settings/chat, terminal/operation cards, visualizer, skills,
  LSP, MCP, permission, and browser consumer routing.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_packet_conflict_reset_scope
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: firecrawl_packet_conflict_reset_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0022
preserved_exact_tokens:
- Firecrawl/missing-spec packet-conflict reset (2026-04-06)
- RECONCILIATION / COVERAGE PASS — PACKET-CONFLICT RESET (2026-04-06)
- three-bucket
- 12-doc
- 13-doc
- 23-blocker
- coverage-consuming registers
- full Firecrawl gap analysis
- missing-spec owner-alignment surface
- 54 active
- '7'
- MUST CHANGE
- MUST RECONCILE
- already_resolved
- verify_only
- MUST VERIFY
- WebAction/browser consumer
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Older three-bucket, 12-doc, 13-doc, 23-blocker, and coverage-consuming registers are superseded for this work-item scope.
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-047 - Reset Operation Constraints

```yaml
plan_unit_id: 0PI-047
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 'The packet-conflict reset preserves operation constraints: packet operations must be re-packetized as replace_section
  where stale canon or packet-appended section families would survive, especially in Tools, FinalGUISpec, Commands, newtools,
  and storage-plan; weaker append, insert_after, or verify_only hints and weak obligation hints must not weaken owner-correction
  operations or active blocker repair for obl-060, obl-067, obl-044, obl-055, or obl-056; research_packet.json, packet-shape
  reports, verifier outputs, shards, and evidence exports are process artifacts, not live packet doc intents.'
gui_related: false
gui_classification_reason: The unit records packet operation and process-artifact constraints rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: reset_operation_constraints
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: reset_operation_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0022
preserved_exact_tokens:
- replace_section
- stale canon
- packet-appended
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/Commands_System.md
- Plans/newtools.md
- Plans/storage-plan.md
- append
- insert_after
- verify_only
- weak obligation hints
- obl-060
- obl-067
- obl-044
- obl-055
- obl-056
- research_packet.json
- packet-shape reports
- verifier outputs
- shards
- evidence exports
negative_constraints:
- Weaker append, insert_after, or verify_only hints and weak obligation hints must not weaken owner-correction operations
  or active blocker repair.
- Process artifacts are not live packet doc intents.
compatibility_only_notes:
- Research packet, verifier, shard, and evidence outputs are process artifacts to regenerate or revalidate after canonical
  docs change.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-048 - Legacy Fidelity Traceability

```yaml
plan_unit_id: 0PI-048
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Firecrawl/missing-spec reset preserves legacy fidelity labels only as reset traceability for owner/consumer
  routing, including FIDELITY-LF-007, FIDELITY-LF-008, FIDELITY-LF-009, FIDELITY-LF-011, FIDELITY-LF-012, FIDELITY-LF-015,
  and FIDELITY-LF-017 mappings, retired packet-count summaries 13, 10 MUST CHANGE, 3 MUST RECONCILE, 12, 9 MUST CHANGE, 2
  MUST VERIFY, 1 MUST VERIFY-only packet extra, and 11 / 11, canonical_obligations audit vocabulary, path-level and anchor-exact
  GATE-014 validation, and /operation as packet content/operation verification work.
gui_related: false
gui_classification_reason: The unit records audit traceability and validation vocabulary rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: legacy_fidelity_traceability
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: legacy_fidelity_traceability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0022
preserved_exact_tokens:
- FIDELITY-LF-007
- FIDELITY-LF-008
- FIDELITY-LF-009
- FIDELITY-LF-011
- FIDELITY-LF-012
- FIDELITY-LF-015
- FIDELITY-LF-017
- '13'
- 10 MUST CHANGE
- 3 MUST RECONCILE
- '12'
- 9 MUST CHANGE
- 2 MUST VERIFY
- 1 MUST VERIFY-only packet extra
- 11 / 11
- canonical_obligations
- canonical_obligations.json
- '32'
- doc-local
- verify_only
- already_resolved
- path-level
- anchor-exact
- GATE-014
- /operation
negative_constraints:
- Legacy fidelity labels do not create separate GitHub Integration canon or packet-shape artifacts.
compatibility_only_notes:
- Legacy labels remain live only as reset traceability for owner/consumer routing.
stale_retired_dispositions:
- Older packet-count summaries are retired by the reset.
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-049 - Additional Fidelity And Webmap Guard

```yaml
plan_unit_id: 0PI-049
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 'Additional Firecrawl/lost-spec fidelity routing remains traceability-only under the same reset for FIDELITY-01
  through FIDELITY-07 and FIDELITY-LF-003, FIDELITY-LF-004, FIDELITY-LF-006, FIDELITY-LF-010, FIDELITY-LF-013, FIDELITY-LF-014,
  FIDELITY-LF-018, and FIDELITY-LF-019; these mappings do not promote Plans/GitHub_Integration.md from adjacent consumer to
  owner. The index-only fidelity guard preserves webmap as a minimal url: string input returning site map + source refs, perspective
  precedence between chat/system UX and contracts, and the uppercase source term PERSPECTIVE as retired audit vocabulary rather
  than a live UI label.'
gui_related: true
gui_classification_reason: The unit covers webmap behavior, chat UX presentation, GUI/runtime/system perspective, and retired
  UI-label vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: additional_fidelity_and_webmap_guard
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: additional_fidelity_and_webmap_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0022
preserved_exact_tokens:
- FIDELITY-01
- FIDELITY-02
- FIDELITY-03
- FIDELITY-04
- FIDELITY-05
- FIDELITY-06
- FIDELITY-07
- FIDELITY-LF-003
- FIDELITY-LF-004
- FIDELITY-LF-006
- FIDELITY-LF-010
- FIDELITY-LF-013
- FIDELITY-LF-014
- FIDELITY-LF-018
- FIDELITY-LF-019
- Plans/GitHub_Integration.md
- webmap
- 'url: string'
- site map + source refs
- chat-perspective
- system-perspective
- PERSPECTIVE
negative_constraints:
- These mappings do not promote Plans/GitHub_Integration.md from adjacent consumer to owner for web, chat, storage, command,
  skill, MCP, LSP, browser, or run-mode recovery canon.
compatibility_only_notes: []
stale_retired_dispositions:
- The uppercase source term PERSPECTIVE is retired as audit vocabulary rather than a live UI label.
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-050 - A2A OpenCode Packet Boundary

```yaml
plan_unit_id: 0PI-050
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The A2A / OpenCode research packet map is an index and owner-map note only; live runtime, event, permission,
  usage, prompt, tool/provider, storage, and UI behavior remains in owner docs. Draft research-packet artifacts, verifier
  reports, and other pipeline files are process artifacts, not packet docs and not canonical evidence. The next packet missing
  owner/consumer docs are Executor_Protocol, Contracts_V0, and assistant-chat-design, while Prompt_Pipeline is resolved-only
  unless a fresh contradiction appears.
gui_related: true
gui_classification_reason: The unit references UI behavior and chat owner/consumer surfaces while preserving packet boundary
  governance.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: a2a_opencode_packet_boundary
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: a2a_opencode_packet_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0023
preserved_exact_tokens:
- A2A / OpenCode research packet map (2026-03-28)
- index and owner-map note only
- live runtime, event, permission, usage, prompt, tool/provider, storage, and UI behavior
- Draft research-packet artifacts
- verifier reports
- process artifacts
- not packet docs
- not canonical evidence
- Plans/Executor_Protocol.md
- Plans/Contracts_V0.md
- Plans/assistant-chat-design.md
- Plans/Prompt_Pipeline.md
- resolved-only
negative_constraints:
- Draft research-packet artifacts, verifier reports, and other pipeline files are process artifacts, not packet docs and not
  canonical evidence.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-051 - A2A Impacted-Doc Taxonomy

```yaml
plan_unit_id: 0PI-051
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 'The A2A/OpenCode packet map preserves the considered and narrowed doc taxonomy: 31 docs considered, final
  impacted-doc set of 27, 16 clearly implicated owner docs, 5 cross-doc reconciliation seams, 6 verification-only drift watchers,
  4 adjacent docs not bucketed, plus intermediate owner/consumer categories for runtime/orchestration, tool/provider/MCP,
  mutation/durability, usage/event/protocol, chat/auth/UI consumers, and resolved packet-only blockers.'
gui_related: true
gui_classification_reason: The taxonomy includes chat/auth/UI consumers and GUI-related FinalGUISpec/WorktreeGit surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: a2a_impacted_doc_taxonomy
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: a2a_impacted_doc_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0023
preserved_exact_tokens:
- '31'
- '27'
- '16'
- '5'
- '6'
- '4'
- Run_Modes.md
- Permissions_System.md
- Tools.md
- CLI_Bridged_Providers.md
- Models_System.md
- usage-feature.md
- Contracts_V0.md
- FileSafe.md
- storage-plan.md
- Prompt_Pipeline.md
- orchestrator-subagent-integration.md
- GitHub_API_Auth_and_Flows.md
- LSPSupport.md
- Executor_Protocol.md
- Architecture_Invariants.md
- Plugins_System.md
- Crosswalk.md
- OpenCode_Coverage_Matrix.md
- WorktreeGitImprovement.md
- FinalGUISpec.md
- Provider_OpenCode.md
- GitHub_Integration.md
- UI_Command_Catalog.md
- FileManager.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Docs not bucketed remain downstream consumers or already defer to actual owners unless a MUST VERIFY check fails.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-052 - A2A Cleanup And Final Narrowing

```yaml
plan_unit_id: 0PI-052
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 'The A2A/OpenCode packet map preserves packetization-ready cleanup and final narrowing: remove direct packet
  intents for Permissions_System and Provider_Stream_Mapping_External_Reference_A2A, demote Contracts_V0 to verify-only unless
  a fresh schema conflict appears, retarget stale packet anchors in orchestrator-subagent-integration, CLI_Bridged_Providers,
  storage-plan, and assistant-chat-design, keep verifier reports out of packet buckets, drop over-coverage for Run_Modes,
  storage-plan, Contracts_V0#Billing entity field contract, and FileSafe#9 unless fresh contradictions appear, and narrow
  the final remaining packet surface to the 4 owner-doc set Run_Modes, FileSafe, storage-plan, and Contracts_V0.'
gui_related: false
gui_classification_reason: The unit records packet cleanup, owner narrowing, and verification boundaries rather than UI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: a2a_cleanup_and_final_narrowing
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: a2a_cleanup_and_final_narrowing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0023
preserved_exact_tokens:
- Packetization-ready cleanup
- remove direct packet intents
- Plans/Permissions_System.md
- Plans/Provider_Stream_Mapping_External_Reference_A2A.md
- verify-only
- fresh schema conflict
- retarget packet anchors
- orchestrator-subagent-integration.md
- CLI_Bridged_Providers.md
- storage-plan.md
- assistant-chat-design.md
- over-coverage cleanup
- Plans/Run_Modes.md
- Plans/Contracts_V0.md#Billing entity field contract
- Plans/FileSafe.md#9. Implementation Checklist
- '4'
- Plans/Run_Modes.md
- Plans/FileSafe.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
negative_constraints:
- Verifier reports stay out of packet buckets while preserving auditability.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The final narrowed remaining packet surface is the four owner-doc set Run_Modes, FileSafe, storage-plan, and Contracts_V0.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-053 - A2A Evidence And Anchor Exactness

```yaml
plan_unit_id: 0PI-053
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The A2A/OpenCode packet map preserves that all active fidelity blockers consumed by the reconciliation result
  must land as explicit owner-doc fixes in MUST CHANGE or dependent consumer /mirror alignment in MUST RECONCILE, none may
  remain implicit or MUST VERIFY-only, validation artifacts and packet-shape reports are process evidence rather than packet
  doc intents or Project Plan Package outputs, ledger_fidelity_report.txt ending <ledger_fidelity_blocked/> and fidelity_recovery_plan.txt
  ending <recovery_plan_ready/> are run-scoped process-readiness markers, LFA-001 is CONFIRMED RESOLVED by live Contracts_V0.md#4.1
  null-padding / omission semantics, and packet section coverage is anchor-exact rather than path-only.
gui_related: false
gui_classification_reason: The unit records evidence, validation, and anchor-exact governance rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: a2a_evidence_and_anchor_exactness
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: a2a_evidence_and_anchor_exactness
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0023
preserved_exact_tokens:
- MUST CHANGE
- MUST RECONCILE
- MUST VERIFY-only
- Validation artifacts
- packet-shape reports
- process evidence
- Project Plan Package outputs
- ledger_fidelity_report.txt
- <ledger_fidelity_blocked/>
- fidelity_recovery_plan.txt
- <recovery_plan_ready/>
- ledger_fidelity_blocked
- recovery_plan_ready
- LFA-001
- CONFIRMED RESOLVED
- Contracts_V0.md#4.1
- null-padding / omission semantics
- anchor-exact
- not path-only
- '### HTTP/status to failure-class mapping'
- '### Stream cancellation and replay safety'
- '### Normalized usage event minimum fields'
- '### 15.12 Integration Checklist'
- lock-path
- storage-root
- '### 2.3 Post-filter integrity rules'
negative_constraints:
- All active fidelity blockers consumed by this reconciliation result must not remain implicit or MUST VERIFY-only.
- Validation artifacts and packet-shape reports are process evidence, not packet doc intents or Project Plan Package outputs.
- ledger_fidelity_blocked and recovery_plan_ready do not become permission states or UI labels.
- Packet section coverage is anchor-exact, not path-only.
compatibility_only_notes:
- Plans/.pipeline/ledger_fidelity_report.txt and /.pipeline/ledger_fidelity_report.txt are source-lineage paths only and do
  not become Plans/Personas.md persona schema canon.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs: []
```

### 0PI-054 - Standardization Owner Consumer Boundary

```yaml
plan_unit_id: 0PI-054
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The Owner / Consumer Map section preserves that source-preserving standardization keeps the owner and consumer
  boundaries stated in the original document body, keeps Plans/00-plans-index.md as owner for the behavior described by its
  preserved sections during the batch, and routes cross-doc ownership through the ContractRefs and boundary notes already
  present in the original text.
gui_related: false
gui_classification_reason: The unit records plan standardization owner/consumer boundaries rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered index-map fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- Plans/00-plans-index.md remains an index and routing map; named owner docs carry product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: standardization_owner_consumer_boundary
reasoning_tier: standard
context_scope: plans_index_standardization
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: standardization_owner_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:00-plans-index-S0024
preserved_exact_tokens:
- Owner / Consumer Map
- source-preserving standardization
- owner and consumer boundaries
- Plans/00-plans-index.md
- ContractRefs
- boundary notes
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/00-plans-index.md preserves index-body behavior while cross-doc ownership follows ContractRefs and boundary notes.
owner_hints:
- Plans/00-plans-index.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
```

### 0PI-055 - Goal Runtime System Owner Map

```yaml
plan_unit_id: 0PI-055
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Plans/00-plans-index.md registers the Native Goal Runtime owner split compiled from ledger pldg-20260616-001-goal-runtime-system. Plans/Goal_Runtime_System.md owns native Goal Mode runtime/control-plane behavior; assistant-chat-design owns visible Assistant Chat Goal UI and thread surfaces; FinalGUISpec owns Settings GUI placement for separate worker and verifier/adjudicator model selectors; Planning_Wizard owns current Planning Wizard flow semantics while chain-wizard-flexibility remains a legacy compatibility/source-lineage consumer; Contracts_V0, storage-plan, and Permissions_System own shared envelope, persistence, and approval-scope registration; Runtime_Artifacts_Panel consumes Goal Runtime evidence/receipt identities while Project_Output_Artifacts remains a project-output boundary reference only; Models_System and Multi-Account own concrete model/account resolution, while provider-specific docs such as Provider_OpenCode own existing provider capability/model discovery surfaces and do not define Goal Runtime provider-default tier mappings unless promoted by a later provider hook; Planning_Ledger_System, Plan_Document_System, and Plan_To_Node_Compilation retain ledger, PlanUnit, generated index, and readiness-only compiler boundaries.
gui_related: false
gui_classification_reason: This unit records index owner routing metadata; GUI owner docs are referenced but not implemented here.
depends_on:
  - GRS-001
unblocks: []
acceptance_criteria:
  - The Plan map names Plans/Goal_Runtime_System.md as the canonical Goal Runtime owner doc.
  - Assistant Chat and Final GUI are recorded as consumers for visible controls and settings placement.
  - Planning Wizard, legacy Chain Wizard compatibility, contract, storage, permission, runtime artifact, project-output boundary, model, account, and provider owner/consumer refs are recorded without moving Goal Runtime behavior out of Goal_Runtime_System.
  - The index preserves the no-WorkNode boundary and separates ledger compile, explicit PlanUnit indexing, and later explicit governance seal phases.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system
risk_class: owner_map_drift
reasoning_tier: standard
context_scope: plans_index_goal_runtime_map
implementation_surfaces:
  - Plans/00-plans-index.md
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
node_compile_hint:
  mode: goal_runtime_owner_map
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0080
  - pldg-20260616-001-goal-runtime-system:atom-0082
  - pldg-20260616-001-goal-runtime-system:atom-0083
  - pldg-20260616-001-goal-runtime-system:atom-0103
  - pldg-20260616-001-goal-runtime-system:atom-0104
  - pldg-20260616-001-goal-runtime-system:atom-0105
  - pldg-20260616-001-goal-runtime-system:dec-0012
preserved_exact_tokens:
  - "Goal_Runtime_System.md"
  - "Native Goal Runtime Map"
  - "pldg-20260616-001-goal-runtime-system"
  - "worker model"
  - "verifier/adjudicator model"
  - "chain-wizard-flexibility.md"
  - "Contracts_V0.md"
  - "storage-plan.md"
  - "Permissions_System.md"
  - "Runtime_Artifacts_Panel.md"
  - "Project_Output_Artifacts.md"
  - "Models_System.md"
  - "Multi-Account.md"
  - "Provider_OpenCode.md"
  - "WorkNodes"
  - "NodeSeeds"
  - "Spec_Lock"
  - "evidence bundles"
negative_constraints:
  - Do not treat Plans/00-plans-index.md as the owner for Goal Runtime behavior.
  - Do not create WorkNodes, NodeSeeds, or governance seal artifacts during the pre-seal compile phase.
  - Do not conflate ledger compile, PlanUnit indexing, and governance seal phases.
owner_hints:
  - Plans/00-plans-index.md
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
```

### 0PI-056 - Orchestrator Goal Runtime Flow Owner Map

```yaml
plan_unit_id: 0PI-056
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Plans/00-plans-index.md registers the Orchestrator Goal Runtime Flow owner split. Goal_Runtime_System owns the shared Goal Runtime engine and repair-loop policy; Orchestrator_Page owns GoalRun control and projection; Executor_Protocol owns WorkNode readiness, backoff, capacity, dispatch, retries, and classification; orchestrator-subagent-integration owns bounded SubagentWave and parent/child supervision; Plan_To_Node_Compilation owns runtime-object and compiler-boundary readiness without creating WorkNodes; Contracts_V0, storage-plan, Permissions_System, Models_System, Multi-Account, provider-specific docs, Planning_Ledger_System, and Plan_Document_System own their contract, persistence, approval, model/account/provider, ledger, and PlanUnit/index boundaries. Run_Graph_View, FinalGUISpec, Assistant Chat, Chain Wizard, Runtime Artifacts, WorktreeGitImprovement, UI_Command_Catalog, Wiring_Matrix, usage-feature, and Glossary consume or mirror the flow through their owner surfaces, and consumer mirrors may retain old fixed-hierarchy labels only as compatibility/search aliases while owner docs keep active terminology on GoalRun, WorkGraph, WorkNode, capability_lane, agent_role, SubagentWave, VerificationCycle, and Receipt. Compile-readiness records may state accepted recommendations, no remaining open design questions, and live repo backlink audit requirements for ledger-to-Plans compile, but not direct implementation readiness. The pre-seal compile phase may regenerate allowed Plans/.plan_index outputs only; a later explicit governance seal may refresh Spec_Lock, generated shards, evidence bundles, plan_graph, and auto_decisions without creating NodeSeeds, WorkNodes, executable queues, final node manifests, final build tasks, production build tasks, or final node queues.
gui_related: false
gui_classification_reason: This unit records canonical owner routing metadata; GUI docs are referenced as consumers but not implemented here.
depends_on:
  - 0PI-055
  - GRS-026
  - OP-022
  - EP-098
  - PNC-009
  - PDS-006
unblocks: []
acceptance_criteria:
  - The index names the Orchestrator Goal Runtime Flow owner docs and consumer docs.
  - Executor scheduler truth remains separate from Orchestrator projection/control truth.
  - Capability lane, model, account/provider, permission, storage, receipt, GUI, chat, chain-wizard, runtime-artifact, ledger, PlanUnit, and compiler-boundary owner docs are recorded without taking over Goal Runtime behavior.
  - Consumer mirrors may retain old fixed-hierarchy labels only as compatibility/search aliases; they do not preserve stale tier labels as active canonical runtime semantics.
  - Compile-readiness records can preserve accepted recommendations, no remaining open design questions, and live repo backlink audit requirements without authorizing direct code implementation.
  - The index preserves the no-WorkNode, no-NodeSeed, no-executable-queue, no-final-node-manifest, no-final-build-task, no-production-build-task boundary across compile, indexing, and governance seal phases.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow
risk_class: orchestrator_goal_owner_map_drift
reasoning_tier: high
context_scope: plans_index_orchestrator_goal_runtime_flow
implementation_surfaces:
  - Plans/00-plans-index.md
  - Plans/Goal_Runtime_System.md
  - Plans/Orchestrator_Page.md
  - Plans/Executor_Protocol.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Run_Graph_View.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard.md
  - Plans/chain-wizard-flexibility.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
  - Plans/Permissions_System.md
  - Plans/storage-plan.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/usage-feature.md
  - Plans/Glossary.md
node_compile_hint:
  mode: orchestrator_goal_runtime_flow_owner_map
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0010
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0070
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0078
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0080
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0081
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0082
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0083
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0084
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0085
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0086
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0088
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0097
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0098
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0099
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0104
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0016
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0027
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0029
preserved_exact_tokens:
  - "Orchestrator Goal Runtime Flow"
  - "GoalRun"
  - "WorkGraph"
  - "SubagentWave"
  - "VerificationCycle"
  - "WorkNode"
  - "agent_role"
  - "Receipt"
  - "compatibility/search aliases"
  - "ledger-to-Plans compile"
  - "accepted"
  - "no remaining open design questions"
  - "live repo backlink audit"
  - "capability_lane"
  - "write_mode"
  - "pending governance seal"
  - "Spec_Lock"
  - "WorkNodes"
  - "NodeSeeds"
  - "final build tasks"
negative_constraints:
  - Do not treat Plans/00-plans-index.md as the owner for runtime behavior.
  - Do not keep stale tier labels as active canonical runtime semantics.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, final build tasks, or production build tasks during compile, indexing, or governance seal.
  - Do not conflate ledger compile, allowed PlanUnit indexing, and governance seal phases.
  - Do not treat plan-compile readiness as direct code implementation readiness.
owner_hints:
  - Plans/00-plans-index.md
  - Plans/Goal_Runtime_System.md
  - Plans/Orchestrator_Page.md
  - Plans/Executor_Protocol.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Run_Graph_View.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard.md
  - Plans/chain-wizard-flexibility.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
  - Plans/Permissions_System.md
  - Plans/storage-plan.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/usage-feature.md
  - Plans/Glossary.md
```

### 0PI-057 - Semantic Audit Closure Owner Map

```yaml
plan_unit_id: 0PI-057
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Plans/00-plans-index.md records the semantic audit closure owner split
  without re-owning closure semantics. Planning_Ledger_System/PLS-012 owns the
  durable Plans/.audits/_semantic_closure_registry.jsonl row shape,
  audit_scope_manifest.jsonl, repair_impact_matrix.jsonl, previously_closed
  reuse, reopen policy, subject_ref/observation_ref, and latest_audit_*
  terminal-state rules. Plan_Document_System/PDS-014 owns deterministic
  finding_key and check_id construction, repair_required/finding_level,
  audit source artifact validation, cross-artifact ref checks,
  repair_closure_matrix.jsonl, scope/impact coverage, and validator-facing
  actionable-row coverage.
  Bootstrap_Planning_Workflow and
  Codex_Prompts consume those owner PlanUnits for workflow and reusable prompt
  text. scripts/pm-audit-closure.py, the global closure registry,
  audit_scope_manifest.jsonl, repair_impact_matrix.jsonl, and audit-scoped
  repair_closure_matrix.jsonl are support/governance surfaces, not product
  implementation files, WorkNodes, NodeSeeds, executable queues, final node
  manifests, or build tasks.
gui_related: false
gui_classification_reason: This unit records canonical owner routing for audit governance support; it does not implement user-visible GUI behavior.
depends_on:
  - PLS-012
  - PDS-014
unblocks: []
acceptance_criteria:
  - The index routes closure registry row shape and reopen policy to PLS-012.
  - The index routes audit_scope_manifest.jsonl and repair_impact_matrix.jsonl process behavior to PLS-012.
  - The index routes subject_ref, observation_ref, and latest_audit_* terminal-state rules to PLS-012.
  - The index routes deterministic finding_key/check_id, repair_required/finding_level, audit source validation, scope/impact coverage, and repair_closure_matrix validation to PDS-014.
  - Bootstrap workflow and prompt docs are recorded as consumers rather than schema owners.
  - Closure support artifacts and scripts are not product implementation, WorkNode, NodeSeed, executable queue, final node manifest, or build-task artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-audit-closure.py validate
risk_class: owner_routing
reasoning_tier: high
context_scope: bootstrap_audit_repair
implementation_surfaces:
  - Plans/00-plans-index.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
  - Plans/bootstrap/Codex_Prompts.md
  - scripts/pm-audit-closure.py
  - Plans/.audits/_semantic_closure_registry.jsonl
  - Plans/.audits/audit-*/audit_scope_manifest.jsonl
  - Plans/.audits/audit-*/repair_impact_matrix.jsonl
  - Plans/.audits/audit-*/repair_closure_matrix.jsonl
node_compile_hint:
  mode: owner_routing_only
  create_worknodes: false
source_lineage:
  - source_ref:chat:2026-06-17-semantic-closure-registry-support
preserved_exact_tokens:
  - "Plans/.audits/_semantic_closure_registry.jsonl"
  - "repair_closure_matrix.jsonl"
  - "audit_scope_manifest.jsonl"
  - "repair_impact_matrix.jsonl"
  - "finding_key"
  - "check_id"
  - "previously_closed"
  - "repair_required"
  - "finding_level"
  - "subject_ref"
  - "observation_ref"
  - "scripts/pm-audit-closure.py"
  - "PLS-012"
  - "PDS-014"
negative_constraints:
  - Do not make Plans/00-plans-index.md the owner of closure registry schema or closure matrix validation.
  - Do not make Plans/00-plans-index.md the owner of scope-manifest or impact-matrix schema semantics.
  - Do not route repair_required=false warnings, previously_closed rows, audit-only observations, or hygiene-only runs into repair obligations.
  - Do not treat audit closure support scripts or audit JSONL artifacts as product implementation files.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or build tasks from closure registry state.
owner_hints:
  - Plans/00-plans-index.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
```

ContractRef: ContractName:Plans/00-plans-index.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md

### 0PI-058 - Plans-To-Code Handoff Owner Map

```yaml
plan_unit_id: 0PI-058
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Plans/00-plans-index.md records the Plans-to-code handoff owner split without re-owning behavior. Plan_To_Node_Compilation owns design-only PlanCompileRun, stage cards, NodeSeed candidate, WorkGraph draft, WorkNode request, handoff matrix, and schema boundary. Automated_Testing_System owns automated test discovery, harness, strategy, binding, receipts, oracles, adapters, and test-gap blockers. Executor_Protocol owns intake, dispatch boundary, preflights, loop breakers, PlanChangeDetected handling, and execution receipts. Goal_Runtime_System owns future Planning Wizard trigger semantics after explicit enablement, autonomy/HITL boundary consumption, and GoalCompletionReceipt certification. Models_System owns six model settings and model resolution receipts. Orchestrator_Page and FinalGUISpec own the seven-tab Orchestrator shell, visible Plan Compile tab, and Settings projection. WorktreeGitImprovement, FileSafe, and GitHub_Integration own source-control execution contracts. Project_Output_Artifacts and Runtime_Artifacts_Panel own packaged receipt artifacts and evidence projection. Contracts_V0 owns shared envelopes and the design-only schema draft. Planning_Ledger_System and Plan_Document_System own matrix compile inputs and reference-scan gates.
  The index records backlinks, index docs, UI command docs, and crosswalks as reference-scan consumers, and preserves the boundary: Do not update only the obvious owner docs while leaving stale references in consumer/index/UI docs. It also preserves: Do not do an uncontrolled whole-repo rename as part of this compile; do not leave direct contradictions in touched sections.
gui_related: false
gui_classification_reason: This unit records owner routing in the canonical index; it does not implement the visible UI.
depends_on:
  - PNC-010
  - PNC-014
  - ATS-001
  - EP-099
  - EP-103
  - GRS-028
  - GRS-030
  - MS-110
  - OP-023
  - F3-397
  - W-072
  - F2-189
  - GI-031
  - POA-048
  - RAP-029
  - CV-289
  - PLS-013
  - PDS-015
unblocks: []
acceptance_criteria:
  - The index names the primary owners and consumer boundaries for the Plans-to-code handoff compile.
  - The index records Automated_Testing_System and plans_to_code_handoff.schema.json as canonical docs/schema drafts.
  - The index explicitly preserves the no-build boundary: PlanCompile disabled, no WorkNodes, no NodeSeeds, no executable queues, no implementation files, no dispatched GoalRuns, and governance registration remains metadata-only.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-shard-plans.py --check
risk_class: owner_routing
reasoning_tier: high
context_scope: plans_to_code_handoff_index
implementation_surfaces:
  - Plans/00-plans-index.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Automated_Testing_System.md
  - Plans/Executor_Protocol.md
  - Plans/Goal_Runtime_System.md
  - Plans/Models_System.md
  - Plans/Orchestrator_Page.md
  - Plans/FinalGUISpec.md
  - Plans/WorktreeGitImprovement.md
  - Plans/FileSafe.md
  - Plans/GitHub_Integration.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Contracts_V0.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
  - Plans/plans_to_code_handoff.schema.json
node_compile_hint:
  mode: owner_routing_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0058
  - pldg-20260617-001-plans-to-code-handoff:atom-0061
  - pldg-20260617-001-plans-to-code-handoff:atom-0062
  - pldg-20260617-001-plans-to-code-handoff:atom-0063
  - pldg-20260617-001-plans-to-code-handoff:atom-0064
  - pldg-20260617-001-plans-to-code-handoff:dec-0024
  - pldg-20260617-001-plans-to-code-handoff:dec-0026
  - pldg-20260617-001-plans-to-code-handoff:dec-0027
  - pldg-20260617-001-plans-to-code-handoff:dec-0028
preserved_exact_tokens:
  - "Plan_To_Node_Compilation"
  - "Goal_Runtime_System"
  - "Orchestrator_Page"
  - "Executor_Protocol"
  - "Automated_Testing_System"
  - "implementation_readiness_matrix"
  - "doc_impact_matrix"
  - "owner docs"
  - "consumer docs"
  - "reference docs"
  - "no-update evidence"
negative_constraints:
  - Do not run PlanCompile or build WorkNodes from this index entry.
  - Do not update generated governance artifacts during ordinary ledger compile; refresh them only in explicit governance registration/seal scope.
compatibility_only_notes:
  - Pre-rename Plan Wizard tokens may remain in source_lineage, preserved_exact_tokens, historical migration notes, and compatibility aliases only.
stale_retired_dispositions:
  - Plan Wizard is retired as active product/runtime/compile terminology; current prose, PlanUnits, commands, events, prompts, and index rows use Planning Wizard.
owner_hints:
  - Plans/00-plans-index.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Automated_Testing_System.md
  - Plans/Executor_Protocol.md
  - Plans/Goal_Runtime_System.md
```

ContractRef: ContractName:Plans/00-plans-index.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Goal_Runtime_System.md


## Migration Coverage

Original hash: `475b95ed4e8e89d86185b6089000b5eaecfe544af05c37b150e269696b4efebd`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batches 111 and 112 atomized source spans `00-plans-index-S0001` through `00-plans-index-S0024` into fine-grained PlanUnits `0PI-002` through `0PI-054`, except for structural heading/container dispositions. `00-plans-index-S0007` is the Plan map heading, `00-plans-index-S0025` is the PlanUnits heading/container, and `00-plans-index-S0027` is Migration Coverage metadata. `00-plans-index-S0026` is the retired `0PI-001` bridge disposition. `0PI-001` is retired to migration-lineage compatibility only and no longer uses `source_preserving_planunit` compile mode. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and they did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### 0PI-059 - PRD Builder And Planning Wizard Owner Map

```yaml
plan_unit_id: 0PI-059
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 'Create Plans/PRD_Builder.md and Plans/Planning_Wizard.md using the New Plan Authoring Profile and make them authoritative owners for their respective finished-product workflows. Review, split, update, or retire Plans/chain-wizard.md and Plans/chain-wizard-flexibility.md into the new PRD Builder and Planning Wizard owners, preserving still-valid requirements and explicitly retiring stale workflow concepts. Run a doc-impact pass over Assistant Chat, Goal Runtime, Planning Ledger, Plan Document, Plan Compile, Automated Testing, Executor, Orchestrator, Personas, Models, FileSafe, Git/worktree, GitHub, permissions, contracts, commands, GUI, wiring, artifacts, indexes, and reference docs. After canonical owner and consumer docs are stable, regenerate allowed PlanUnit indexes, then shards, evidence, Spec Lock, plan graph, and governance decisions in the established separate phases. The finished-product feature formerly called
  Requirements Doc Builder is named PRD Builder everywhere in user-facing UI and canonical product documentation. The canonical product name is Planning Wizard; Chain Wizard and Plan Wizard are stale names that must be retired from active product prose, UI, commands, events, and contracts. PRD Builder captures and normalizes planning-intake product intent; Planning Wizard consumes an approved PRD Pack or normalized requirements input and resolves implementation-ready planning.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/00-plans-index.md
- Plans/Plan_Document_System.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Crosswalk.md
- Plans/Wiring_Matrix.md
- Plans/Planning_Ledger_System.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0158
- pldg-20260618-001-prd-planning-wizard:atom-0159
- pldg-20260618-001-prd-planning-wizard:atom-0160
- pldg-20260618-001-prd-planning-wizard:atom-0161
- pldg-20260618-001-prd-planning-wizard:atom-0001
- pldg-20260618-001-prd-planning-wizard:atom-0002
- pldg-20260618-001-prd-planning-wizard:atom-0004
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/10-doc-and-contract-impact.md#SRC-IMPACT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/01-naming-and-boundaries.md#SRC-NAMING
source_atom_ids:
- atom-0158
- atom-0159
- atom-0160
- atom-0161
- atom-0001
- atom-0002
- atom-0004
decision_refs:
- dec-0029
- dec-0001
- dec-0002
correction_refs:
- corr-0001
- corr-0002
preserved_exact_tokens:
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- PlanProfile
- Plans/chain-wizard.md
- Plans/chain-wizard-flexibility.md
- doc-impact pass
- PlanUnit index
- governance seal
- PRD Builder
- Requirements Doc Builder
- Planning Wizard
- Chain Wizard
- Plan Wizard
- planning-intake
- Approved PRD Pack
- implementation-ready planning
negative_constraints:
- Do not perform a blind filename or term replacement that preserves obsolete ownership and workflow.
- Do not hand-edit generated shards, evidence, Spec Lock, or plan graph during the conversational ledger phase.
- Do not preserve Requirements Doc Builder as a current product feature name except in explicitly historical migration notes.
- Do not use Chain Wizard or Plan Wizard as current terminology.
- Do not collapse PRD Builder and Planning Wizard into one indistinguishable interview.
compatibility_only_notes:
- Chain Wizard, Plan Wizard, Requirements Doc Builder, Run Chain Wizard later, and Start Chain are retained only for historical migration, source-lineage, and search compatibility.
- Current product prose must use PRD Builder, Planning Wizard, Approve PRD for Planning Wizard, and Approve And Build.
stale_retired_dispositions:
- Active Chain Wizard and Plan Wizard ownership is retired.
- Current owner routing is PRD Builder intake -> Planning Wizard planning -> Approve And Build -> Orchestrator Plan Compile.
owner_hints:
- Plans/Plan_Document_System.md
- Plans/00-plans-index.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Crosswalk.md
- Plans/Wiring_Matrix.md
- Plans/Planning_Ledger_System.md
- Plans/FinalGUISpec.md
```

### Native Discovery Owner Map (2026-06-22)

The native fff-inspired discovery packet compiled from `pldg-20260622-001-fff` uses this owner split:
- `Plans/Tools.md` owns `DiscoveryService`, `discover_paths`, ranking/fallback/freshness behavior, ambient agent use, and the boundary between path/context discovery and content verification.
- `Plans/Contracts_V0.md` owns promoted shared discovery enum, event, and receipt envelope terms.
- `Plans/storage-plan.md`, `Plans/WorktreeGitImprovement.md`, `Plans/FileSafe.md`, and `Plans/Permissions_System.md` own persistence, remote/cache/SSH identity, no-leak filtering, permission snapshots, host trust, credential handles, and redaction.
- `Plans/FinalGUISpec.md`, `Plans/assistant-chat-design.md`, `Plans/UI_Command_Catalog.md`, `Plans/FileManager.md`, `Plans/Planning_Wizard.md`, and `Plans/PRD_Builder.md` consume discovery for user-visible pickers, type-ahead, Assistant Chat activity, and source selection.
- `Plans/orchestrator-subagent-integration.md`, `Plans/Executor_Protocol.md`, `Plans/Automated_Testing_System.md`, `Plans/Runtime_Artifacts_Panel.md`, and `Plans/Plan_To_Node_Compilation.md` consume discovery for agent orientation, verification handoff, conformance tests, receipt browsing, and future-boundary-only Plan-to-Node references.

Cursor-style regex acceleration remains the Instant Grep / SparseNgramIndex content-search lane. Direct `fff` and OpenCode implementation details are lineage/reference/prototype-only unless Jared changes direction. Current product prose uses `PRD Builder` and `Planning Wizard`; `Chain Wizard`, `Plan Wizard`, `Requirements Doc Builder`, and `Start Chain` remain historical or compatibility-only terms.

```yaml
plan_unit_id: 0PI-060
unit_type: owner_map
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Native PM-owned fff-inspired discovery is routed as one shared path/context discovery substrate. Tools owns DiscoveryService and discover_paths behavior; Contracts_V0 owns promoted shared enum/event/receipt envelopes; storage, worktree, FileSafe, and Permissions owners govern persistence, remote/cache/SSH identity, no-leak filtering, permission snapshots, host trust, credential handles, and redaction; GUI and agent docs consume the shared substrate without re-owning ranking or schema semantics. Instant Grep, grep, and codesearch remain the content regex and exact content verification owners. Direct fff and OpenCode details are source-lineage/reference/prototype-only, and this compile creates no WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, production build tasks, Spec_Lock, shards, evidence, plan_graph, or auto_decisions.
gui_related: false
gui_classification_reason: This is owner-map and governance routing for discovery behavior, not direct GUI implementation.
depends_on: [0PI-014, 0PI-029]
unblocks: [F3-399, ACD-422, OSI-429, ATS-011]
acceptance_criteria:
  - Owner routing points behavior to Tools and shared schema envelopes to Contracts_V0.
  - Cursor-style regex acceleration remains Instant Grep / SparseNgramIndex, not DiscoveryService.
  - fff and OpenCode are preserved only as source-lineage/reference/prototype evidence unless product direction changes.
  - Current product terms remain PRD Builder and Planning Wizard, with legacy wizard names compatibility-only.
  - CV-291, T-160, T-161, and T-162 are owner-routing references from this index map, not PlanUnit build-order prerequisites.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: standard
context_scope: cross_doc_owner_map
implementation_surfaces: [Plans/00-plans-index.md, Plans/Tools.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: owner_map_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0007
  - pldg-20260622-001-fff:atom-0011
  - pldg-20260622-001-fff:atom-0014
  - pldg-20260622-001-fff:atom-0015
  - pldg-20260622-001-fff:atom-0016
  - pldg-20260622-001-fff:atom-0017
  - pldg-20260622-001-fff:atom-0018
  - pldg-20260622-001-fff:atom-0019
  - pldg-20260622-001-fff:atom-0020
  - pldg-20260622-001-fff:atom-0026
  - pldg-20260622-001-fff:atom-0031
  - pldg-20260622-001-fff:atom-0034
  - pldg-20260622-001-fff:atom-0035
  - pldg-20260622-001-fff:atom-0036
  - pldg-20260622-001-fff:atom-0046
  - pldg-20260622-001-fff:atom-0047
  - pldg-20260622-001-fff:atom-0048
  - pldg-20260622-001-fff:atom-0049
  - pldg-20260622-001-fff:atom-0050
  - pldg-20260622-001-fff:atom-0060
  - pldg-20260622-001-fff:atom-0063
  - pldg-20260622-001-fff:atom-0076
  - pldg-20260622-001-fff:atom-0088
  - pldg-20260622-001-fff:atom-0090
  - pldg-20260622-001-fff:atom-0091
  - pldg-20260622-001-fff:atom-0092
  - pldg-20260622-001-fff:atom-0093
  - pldg-20260622-001-fff:atom-0094
  - pldg-20260622-001-fff:atom-0095
  - pldg-20260622-001-fff:state/doc_impact_matrix.json#DIM-001
  - pldg-20260622-001-fff:state/subagent_compile_proposals.json#Helmholtz
source_atom_ids: [atom-0007, atom-0011, atom-0014, atom-0015, atom-0016, atom-0017, atom-0018, atom-0019, atom-0020, atom-0026, atom-0031, atom-0034, atom-0035, atom-0036, atom-0046, atom-0047, atom-0048, atom-0049, atom-0050, atom-0060, atom-0063, atom-0076, atom-0088, atom-0090, atom-0091, atom-0092, atom-0093, atom-0094, atom-0095]
preserved_exact_tokens:
  - "native fff-inspired file discovery"
  - "DiscoveryService"
  - "discover_paths"
  - "Instant Grep"
  - "SparseNgramIndex"
  - "direct fff"
  - "OpenCode"
  - "PRD Builder"
  - "Planning Wizard"
  - "Chain Wizard"
  - "Plan Wizard"
negative_constraints:
  - Do not compile OpenCode or fff prose as product authority.
  - Do not create a second regex/content-search canon beside Instant Grep, grep, or codesearch.
  - Do not revive Chain Wizard, Plan Wizard, Requirements Doc Builder, or Start Chain as current product terms.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, production build tasks, Spec_Lock, shards, evidence, plan_graph, or auto_decisions from this compile.
owner_hints: [Plans/00-plans-index.md, Plans/Tools.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/FinalGUISpec.md]
```

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260624-001-provider-updates` into this index. It registers owner routing only; detailed behavior remains owned by the referenced Plans docs. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### 0PI-061 - Provider Updates Owner Map And Retired Gemini CLI Anchor

```yaml
plan_unit_id: 0PI-061
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Provider updates from ledger pldg-20260624-001-provider-updates route to the existing provider owner docs instead of a new owner doc. Gemini CLI and gemini_cli are retired from active provider support and preserved only as compatibility/source-lineage tokens; Gemini Direct remains the API-key-backed direct provider; Antigravity CLI replaces Gemini CLI for the active CLI-backed Google/agent route. Provider support is now Provider -> models, with same-named models allowed under multiple provider entries, direct providers and CLI-backed providers kept separate, and coding-plan/provider-media rows marked green only from route-level E2E proof or explicit capability-gated/unverified status.
gui_related: false
gui_classification_reason: This is index owner routing and stale-anchor disposition, not visual presentation.
depends_on: [PLS-001, PDS-005]
unblocks: [MS-113, MA-062, CBP-019, MGAC-094, F3-400]
acceptance_criteria:
  - Gemini CLI appears only as retired/source-lineage/compatibility terminology after this compile.
  - Provider updates route to Models_System, Multi-Account, CLI_Bridged_Providers, Media_Generation_and_Capabilities, Contracts_V0, usage-feature, FinalGUISpec, Provider_OpenCode, BinaryLocator_Spec, Tools, Permissions_System, Runtime_Artifacts_Panel, and Project_Output_Artifacts as owners or consumers.
  - The index does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_owner_routing_drift
reasoning_tier: high
context_scope: provider_updates_owner_map
implementation_surfaces:
  - Plans/00-plans-index.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Media_Generation_and_Capabilities.md
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: owner_map_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0005
  - pldg-20260624-001-provider-updates:atom-0015
  - pldg-20260624-001-provider-updates:atom-0016
  - pldg-20260624-001-provider-updates:atom-0024
  - pldg-20260624-001-provider-updates:atom-0025
  - pldg-20260624-001-provider-updates:atom-0115
  - pldg-20260624-001-provider-updates:atom-0123
source_atom_ids: [atom-0005, atom-0015, atom-0016, atom-0024, atom-0025, atom-0115, atom-0123]
decision_refs: [dec-0002, dec-0004, dec-0005, dec-0008, dec-0034]
correction_refs: [corr-0001, corr-0003, corr-0012]
preserved_exact_tokens:
  - "Kill Gemini cli support"
  - "it’s being turned off, so no one can use it"
  - "It has to be replaced by antigravity"
  - "No, kill Gemini completely"
  - "Gemini direct provider via api is ok to keep"
  - "Provider -> models"
  - "gemini_cli"
  - "Gemini CLI"
  - "GEMINI_CLI_HOME"
  - "exactly 7 provider entries"
  - "platform_specs.rs"
  - "compatibility-only"
  - "retired-token"
negative_constraints:
  - Do not preserve Gemini CLI as active provider support.
  - Do not silently alias gemini_cli to antigravity_cli.
  - Do not collapse provider/model identity across providers that expose the same model name.
  - Do not rely on removed Rust/Iced or platform_specs.rs anchors as implementation authority.
owner_hints:
  - Plans/00-plans-index.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
  - Plans/Media_Generation_and_Capabilities.md
```


## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### 0PI-062 - Miscellaneous History Vision Bridge Teach Owner Map

```yaml
plan_unit_id: 0PI-062
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: The miscellaneous feature ledger pldg-20260626-001-feature-name compiles into existing owner docs
  rather than a new feature owner doc. Historical wizard-created PRD/Plan documents and historical Orchestrator
  runs route through Orchestrator History, history projection/storage, output/export, runtime artifact, permission,
  command, and testing owners. The PM-native vision_bridge / see_image capability routes through Tools, Prompt Pipeline,
  Models, Media Capabilities, Permissions, FileSafe, Runtime Artifacts, Assistant Chat, usage, OpenCode-provider
  lineage, and tests. Teach is the feature and Teacher is the Persona used by it; its threaded guidance, model setting,
  PM knowledge substrate, help/glossary content, guided GUI, command invocation, memory capture, handoff, and tests
  route to the existing chat/persona/model/prompt/GUI/command/storage/glossary/testing owners. PMConcept.html is
  source-lineage only and must not become final UI canon.
gui_related: false
gui_classification_reason: Owner routing and compile registration are index/governance metadata, not GUI implementation.
depends_on:
- PDS-005
- PLS-011
unblocks:
- OP-026
- T-165
- ACD-426
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: owner_routing_drift
reasoning_tier: high
context_scope: misc_history_vision_teach_owner_map
implementation_surfaces:
- Plans/00-plans-index.md
node_compile_hint:
  mode: owner_map_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0007
- pldg-20260626-001-feature-name:atom-0008
- pldg-20260626-001-feature-name:atom-0009
- pldg-20260626-001-feature-name:atom-0069
- pldg-20260626-001-feature-name:atom-0090
- pldg-20260626-001-feature-name:atom-0150
- pldg-20260626-001-feature-name:atom-0151
- pldg-20260626-001-feature-name:atom-0152
- pldg-20260626-001-feature-name:atom-0153
- pldg-20260626-001-feature-name:atom-0154
- chat:misc-history-scope
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Orchestrator_Page.md
- chat:opencode-see-image-request
- chat:teacher-feature-initial-framing
- chat:teach-teacher-correction
- Plans/Personas.md#RESERVED-PERSONAS
- Plans/Personas.md#CORE-PERSONA-CATALOG
- Plans/assistant-chat-design.md#6-Teach
- chat:teach-bundle-accepted-pmconcept-reference
- Concepts/PMConcept.html
- chat:assistant-chat-threads-modeled-in-concept
- Concepts/PMConcept.html#chat-panel
- Concepts/PMConcept.html#chat-thread-sidebar
- Concepts/PMConcept.html#switchToChatThread
- chat:pmconcept-gui-reference
- Concepts/PMConcept.html#orch-tab-history
- Concepts/PMConcept.html#orch-panel-history
- Concepts/PMConcept.html#Screenshot-to-Chat
- Concepts/PMConcept.html#composer-chip
- Concepts/PMConcept.html#activity-card
- Concepts/PMConcept.html#requested-effective-model
source_atom_ids:
- atom-0007
- atom-0008
- atom-0009
- atom-0069
- atom-0090
- atom-0150
- atom-0151
- atom-0152
- atom-0153
- atom-0154
decision_refs:
- dec-0002
- dec-0014
- dec-0018
- dec-0020
- dec-0024
correction_refs:
- corr-0001
preserved_exact_tokens:
- a bunch of miscellaneous things
- The fist one
- see historical documents that are made
- by documents I mean the plans and PRD docs that are created by the wizard
- plans and PRD docs
- created by the wizard
- historical orchestrator runs in PM
- historical orchestrator runs
- opencode-see-image
- see_image
- models models without vision
- adopt it to PM
- image
- screenshot
- Teach feature
- Teacher persona
- Teacher is also a persona(used for the teacher feature)
- requested_persona
- effective_persona
- For the Gui
- PMConcept.html
- That isnt the final form
- just a concept
- will give you an idea
- figure the gui out for these features
- The assistant chat window and threads are modeled in the concept too.
- Assistant Chat
- Teacher
- thread
- persona
- help icon
- new thread
- Orchestrator page
- History
- tab
- Progress
- Plan Compile
- Node Graph
- Evidence
- Ledger
- Screenshot to Chat
- composer-chip
- activity-card
- Requested Model
- Effective Model
- inspect/rerun
- provider/model disclosure
- dense workbench
- activity rail
- page tabs
- resizable chat panel
- floating chat
- compact chips
- role badges
- runtime popovers
- activity cards
negative_constraints:
- Do not treat later miscellaneous items as already specified by this first item.
- Do not collapse PRD Builder outputs, Planning Wizard outputs, Plan packs, and runtime artifacts into an anonymous
  flat document list.
- Do not treat mutable draft projections as the same thing as immutable approved packs or historical snapshots.
- Do not show historical runs as ambiguous text summaries without stable run identity.
- Do not lose links to artifacts, evidence, ledger records, usage, or receipts when a run becomes historical.
- Do not let non-vision models guess image contents when a bridge is available.
- Do not treat image input as image generation.
- Do not compile this requirement to canonical Plans without a future explicit compile request.
- Do not introduce `requested_persona_id` or `effective_persona_id` as canonical fields; those are stale aliases
  in Personas.md.
- Do not make Teacher a hidden subagent for this feature; existing Plans say `teacher` is user-facing and not subagent-only.
- Do not treat PMConcept.html as final or canonical UI truth.
- Do not copy the concept HTML/CSS directly into canonical Plans or implementation.
- Do not let the concept override accepted ledger decisions or canonical Plans owner docs during a future compile.
- Do not invent a separate Teach-only chat surface when the Assistant Chat thread model can carry Teacher.
- Do not lose Teacher persona/model/source/context disclosure when launching from a help icon or summon phrase.
- Do not hide thread state such as working, unread, blocked, degraded, draft, archived, or handoff state when relevant.
- Do not use PMConcept History table columns as the final complete schema when accepted ledger History atoms specify
  deeper document/run/package comparison.
- Do not let concept-only tab naming override future canonical owner placement.
- Do not make vision bridge artifacts feel like detached plugin output.
- Do not hide requested/effective model or fallback state when the bridge uses a separate vision-capable route.
- Do not replace accepted PM-owned permission/disclosure behavior with PMConcept demo-only controls.
- Do not freeze PMConcept colors, CSS, demo data, or HTML class names as canonical implementation details.
- Do not use PMConcept visual inspiration to skip responsive, accessibility, overflow, or actual Slint/Rust feasibility
  checks.
owner_hints:
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Orchestrator_Page.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
- Plans/Personas.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
compatibility_only_notes:
- Concept/source-lineage references are preserved for routing and audit only; they do not make external plugins
  or PMConcept.html canonical implementation source.
```

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum records the owner-map impact of compiling bootstrap ledger `pldg-20260627-001-feature-intake`. Product requirements remain in the owner docs listed by the PlanUnit index. This addendum does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### 0PI-063 - Miscellaneous Feature Intake Compile Owner Map

```yaml
plan_unit_id: 0PI-063
unit_type: owner_map
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Bootstrap ledger pldg-20260627-001-feature-intake compiled four miscellaneous feature lanes into canonical owner docs:
  inline visualizer v2, notifications/sounds, manual compaction readiness, and default-on user-disableable DRY Method.
  The live owner docs are assistant-chat-design, FinalGUISpec, storage-plan, Permissions_System, Runtime_Artifacts_Panel,
  Automated_Testing_System, Contracts_V0, UI_Command_Catalog, Wiring_Matrix, agent-rules-context, Prompt_Pipeline,
  DRY_Rules, Decision_Policy, orchestrator-subagent-integration, interview-subagent-integration, and usage-feature.
  Plans/newfeatures.md, PeonPing/OpenPeon references, and external provider docs remain source-lineage or compatibility
  references only unless a live owner PlanUnit says otherwise.
gui_related: false
gui_classification_reason: This index entry records owner routing and compile lineage; GUI behavior is owned by the referenced GUI PlanUnits.
depends_on: []
unblocks: []
acceptance_criteria:
  - The index identifies each compiled lane and the canonical owner-doc set.
  - Source-lineage-only materials are not treated as live product owners.
  - No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - git diff --check
risk_class: owner_map_drift
reasoning_tier: standard
context_scope: miscellaneous_feature_intake_compile_owner_map
implementation_surfaces:
  - Plans/00-plans-index.md
node_compile_hint:
  mode: miscellaneous_feature_intake_owner_map
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/source_compile_readiness_integration_matrix_20260628.json
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/implementation_readiness_fourth_recheck_20260628.json
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/current.json
preserved_exact_tokens:
  - "inline visualizer v2"
  - "notifications"
  - "toast"
  - "Slack"
  - "Discord"
  - "sound"
  - "ntfy"
  - "Pushover"
  - "Telegram"
  - "Compact Now"
  - "using the dry method"
  - "default"
  - "the user can turn it off"
  - "Plans/newfeatures.md"
  - "PeonPing"
  - "OpenPeon"
negative_constraints:
  - Do not treat Plans/newfeatures.md as a live owner for these compiled lanes.
  - Do not treat PeonPing/OpenPeon compatibility references as bundled assets or runtime imports.
  - Do not call this compile governance sealed until an explicit governance seal phase refreshes generated governance artifacts.
owner_hints:
  - Plans/00-plans-index.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Automated_Testing_System.md
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/agent-rules-context.md
  - Plans/Prompt_Pipeline.md
  - Plans/DRY_Rules.md
  - Plans/Decision_Policy.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/interview-subagent-integration.md
  - Plans/usage-feature.md
```

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum registers the Free Models compile owner map. It does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### 0PI-064 - Free Models Compile Owner Map

```yaml
plan_unit_id: 0PI-064
unit_type: owner_map
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The Free Models ledger compiles into existing owner docs rather than a new Free Models plan doc. Models_System owns provider/model wrapper identity, Auto Apply source/cadence/runtime-adapter policy, top-10 precedence, and availability reason semantics. Multi-Account owns underlying provider/account setup and shared pressure/cooldown. usage-feature owns paid/costed fallback gates, Usage receipts, and immutable request provenance. Contracts_V0 owns import, adapter, identity, and route eligibility contracts. storage-plan owns import snapshots, aliases, currentness, activation/quarantine/rollback, and diagnostics storage. Permissions_System owns source trust, credential custody, probe, and live-call authority. FileSafe owns upstream side-effect blocking. FinalGUISpec owns visible catalog/settings/top-10/setup/update UX. Runtime_Artifacts_Panel owns diagnostic and provenance projections. Executor_Protocol owns dispatch fallback, in-flight isolation, and adapter activation. Prompt_Pipeline owns requested/effective route snapshot handoff. Provider_OpenCode remains adjacent/reference-only unless a concrete OpenCode-specific Free Models hook is later accepted.
gui_related: false
gui_classification_reason: This index entry records owner routing and compile lineage; GUI behavior is owned by referenced GUI PlanUnits.
depends_on: []
unblocks: []
acceptance_criteria:
  - The index records the canonical owner-doc set for Free Models.
  - Provider_OpenCode is explicitly adjacent/reference-only for this compile.
  - No new Free Models owner doc, WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files are created.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - git diff --check
risk_class: owner_map_drift
reasoning_tier: standard
context_scope: free_models_compile_owner_map
implementation_surfaces:
  - Plans/00-plans-index.md
node_compile_hint:
  mode: free_models_owner_map
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/state/current.json
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/state/handoff.json
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/source_shards/free_coding_models_upstream_inspection_20260629.json
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/source_shards/free_coding_models_temp_checkout_inspection_20260629.json
source_atom_ids: [atom-0268, atom-0272, atom-0273, atom-0274, atom-0297, atom-0298]
preserved_exact_tokens:
  - "Free Models"
  - "Provider_OpenCode adjacent/reference-only"
  - "Do not compile Free Models ownership into Provider_OpenCode by default"
  - "No canonical Plans, PlanUnit index, governance, WorkNode, NodeSeed, executable queue, runtime/build, or implementation artifacts were touched"
negative_constraints:
  - Do not compile Free Models ownership into Provider_OpenCode by default; keep Provider_OpenCode adjacent/reference-only unless a concrete hook is later accepted.
  - Do not call this compile governance sealed until an explicit governance seal phase refreshes generated governance artifacts.
owner_hints:
  - Plans/00-plans-index.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/FinalGUISpec.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Executor_Protocol.md
  - Plans/Prompt_Pipeline.md
  - Plans/FileSafe.md
```

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum registers the containerized-hosts compile owner map. It does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, implementation files, runtime dispatch, production build tasks, or a governance seal.

### 0PI-065 - Containerized Hosts Compile Owner Map

```yaml
plan_unit_id: 0PI-065
unit_type: owner_map
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The containerized-hosts ledger compiles into existing owner docs rather than a new Coasts or Hosts plan doc.
  Containers_Registry_and_Unraid owns PM-native containerized-host capability, Docker Manager ownership, the
  RuntimeHostFamilyProfile whole-MVP matrix, and Docker/Hosts operational boundaries. Contracts_V0 owns
  host_capability_ref, host_profile_id, host instance/assignment/receipt/blocker envelopes, HostCapabilityCommand,
  and HostOperationRequest. storage-plan owns persisted host profile, instance, assignment, build artifact,
  port_access_record, receipt, projection, cleanup, and retention records. Permissions_System and FileSafe own host
  trust, approval, secret, mount, network, Docker socket, remote-side-effect, and FileSafe gates. Automated_Testing_System
  owns the containerized-host adapter, Compose-primary test path, and TestRunReceipt proof fields. Executor_Protocol,
  Run_Modes, Tools, orchestrator-subagent-integration, assistant-chat-design, Orchestrator_Page, Run_Graph_View,
  FinalGUISpec, UI_Command_Catalog, and Runtime_Artifacts_Panel consume those owner contracts for execution lanes,
  agent use, visible readiness, routed Docker/Hosts navigation, command envelopes, and evidence projection without
  becoming host mutation authorities.
gui_related: false
gui_classification_reason: This index entry records owner routing and compile lineage; GUI behavior is owned by referenced GUI PlanUnits.
depends_on: [PDS-003, PNC-001]
unblocks: []
acceptance_criteria:
  - Containerized-hosts ownership is registered without creating a separate Coasts website, a new Activity Bar slot, or a new owner doc.
  - "`Docker/Hosts` remains a routed primary-content page/lab opened from Docker Manager and cross-surface links while `docker_manager` remains the Activity Bar side-panel owner and command namespace."
  - Coasts and PMConcept.html remain source-lineage or directional evidence only.
  - No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260630-001-feature-intake
  - git diff --check
risk_class: owner_map_drift
reasoning_tier: standard
context_scope: containerized_hosts_compile_owner_map
implementation_surfaces:
  - Plans/00-plans-index.md
node_compile_hint:
  mode: containerized_hosts_owner_map
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/state/current.json
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/state/handoff.json
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0006
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0017
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0051
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0054
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0055
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0056
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0076
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0082
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/subagent_hardening_synthesis_20260701.json
source_atom_ids: [atom-0006, atom-0017, atom-0051, atom-0054, atom-0055, atom-0056, atom-0076, atom-0082]
decision_refs: [dec-0001, dec-0003, dec-0004, dec-0005, dec-0011, dec-0017, dec-0018, dec-0019, dec-0020]
preserved_exact_tokens:
  - "containerized hosts"
  - "Docker/Hosts"
  - "docker_manager"
  - "Activity Bar side-panel owner"
  - "routed primary-content page"
  - "Coasts source-lineage"
  - "PMConcept.html"
  - "whole thing for mvp"
  - "HostCapabilityCommand"
  - "RuntimeHostFamilyProfile"
negative_constraints:
  - Do not compile containerized-host ownership into a separate Coasts website, vendored Coasts daemon, new Hosts owner doc, new Activity Bar slot, or stale `newtools.md` owner bridge.
  - Do not promote Coasts runtime claims, PMConcept.html concept code, or ledger prose into product canon without PM-owned PlanUnits.
  - Do not call this compile governance sealed until an explicit governance seal phase refreshes generated governance artifacts.
owner_hints:
  - Plans/00-plans-index.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
  - Plans/Automated_Testing_System.md
  - Plans/Executor_Protocol.md
  - Plans/Run_Modes.md
  - Plans/Tools.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/assistant-chat-design.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Runtime_Artifacts_Panel.md
```

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. The ordinary compile did not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal; the later explicit seal phase refreshed generated governance/provenance artifacts without creating runtime or build artifacts.

### 0PI-066 - 0PI-066

```yaml
plan_unit_id: 0PI-066
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The external repo system-wide improvement import from pldg-20260703-001-feature-intake is routed to existing Puppet Master subsystem owners plus the new Release_Supply_Chain owner for release/install/provenance gaps. The compile preserves GUI-first/no-PM-CLI constraints, treats terminal/CLI lessons as GUI-native runtime/provider/tool/context/agent-control contracts, keeps imported rows source-lineage-backed rather than ledger-canonical, and creates no WorkNodes, NodeSeeds, executable queues, implementation files, or production build tasks during ordinary compile; the later explicit governance seal refreshes only generated governance/provenance artifacts.
gui_related: false
gui_classification_reason: Index owner-routing metadata, not direct GUI implementation.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- All 113 imported external repo rows and 5 import guardrails have a compiled PlanUnit or existing PlanUnit disposition.
- The 12 rows that arrived with empty target_docs are owner-adjudicated without asking row-by-row.
- Terminal lessons remain GUI-terminal/runtime contracts, not a Puppet Master CLI product surface.
- Only live Plans docs and allowed Plans/.plan_index outputs are changed during ordinary compile; the later explicit governance seal refreshes generated governance/provenance artifacts only.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- git diff --check
risk_class: owner_map_drift
reasoning_tier: high
context_scope: external_repo_system_wide_compile_owner_map
implementation_surfaces:
- Plans/00-plans-index.md
- Plans/00-plans-index.md
- Plans/Automated_Testing_System.md
- Plans/BinaryLocator_Spec.md
- Plans/CLI_Bridged_Providers.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/FileSafe.md
- Plans/FinalGUISpec.md
- Plans/GitHub_Integration.md
- Plans/Goal_Runtime_System.md
- Plans/MCP_Integration.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Multi-Account.md
- Plans/Permissions_System.md
- Plans/Plan_Document_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Planning_Ledger_System.md
- Plans/Plugins_System.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/Release_Supply_Chain.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/assistant-chat-design.md
- Plans/assistant-memory-subsystem.md
- Plans/storage-plan.md
- Plans/usage-feature.md
node_compile_hint:
  mode: external_repo_system_wide_owner_map
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/state/current.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/state/handoff.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/import_completion_recheck_20260703.json
source_atom_ids:
- atom-0001
- atom-0002
- atom-0003
- atom-0004
- atom-0005
- atom-0006
- atom-0007
- atom-0008
- atom-0009
- atom-0010
- atom-0011
- atom-0012
- atom-0013
- atom-0014
- atom-0015
- atom-0016
- atom-0017
- atom-0018
- atom-0019
- atom-0020
- atom-0021
- atom-0022
- atom-0023
- atom-0024
- atom-0025
- atom-0026
- atom-0027
- atom-0028
- atom-0029
- atom-0030
- atom-0031
- atom-0032
- atom-0033
- atom-0034
- atom-0035
- atom-0036
- atom-0037
- atom-0038
- atom-0039
- atom-0040
- atom-0041
- atom-0042
- atom-0043
- atom-0044
- atom-0045
- atom-0046
- atom-0047
- atom-0048
- atom-0049
- atom-0050
- atom-0051
- atom-0052
- atom-0053
- atom-0054
- atom-0055
- atom-0056
- atom-0057
- atom-0058
- atom-0059
- atom-0060
- atom-0061
- atom-0062
- atom-0063
- atom-0064
- atom-0065
- atom-0066
- atom-0067
- atom-0068
- atom-0069
- atom-0070
- atom-0071
- atom-0072
- atom-0073
- atom-0074
- atom-0075
- atom-0076
- atom-0077
- atom-0078
- atom-0079
- atom-0080
- atom-0081
- atom-0082
- atom-0083
- atom-0084
- atom-0085
- atom-0086
- atom-0087
- atom-0088
- atom-0089
- atom-0090
- atom-0091
- atom-0092
- atom-0093
- atom-0094
- atom-0095
- atom-0096
- atom-0097
- atom-0098
- atom-0099
- atom-0100
- atom-0101
- atom-0102
- atom-0103
- atom-0104
- atom-0105
- atom-0106
- atom-0107
- atom-0108
- atom-0109
- atom-0110
- atom-0111
- atom-0112
- atom-0113
- atom-0114
- atom-0115
- atom-0116
- atom-0117
- atom-0118
- atom-0119
- atom-0120
- atom-0121
- atom-0122
decision_refs:
- dec-0002
- dec-0003
- dec-0004
preserved_exact_tokens:
- OpenCode v1/dev/beta
- OpenCode v2 specs
- Cline
- Agent Zero
- Pi
- OpenAI Codex
- Ghostty
- Warp
- tmux
- GUI-first
- not building a CLI
- ContextEpoch
- ProviderCapabilityEpoch
- ToolTurnSettlement
- AgentControlEnvelope
- TerminalBackpressureState
- Command approval is a GUI-visible lease
negative_constraints:
- Do not translate terminal/CLI lessons into a Puppet Master CLI product shape.
- Do not collapse the 113 imported rows into a vague summary.
- Do not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs during ordinary compile; refresh governance outputs only in an explicit seal phase.
owner_hints:
- Plans/00-plans-index.md
- Plans/Automated_Testing_System.md
- Plans/BinaryLocator_Spec.md
- Plans/CLI_Bridged_Providers.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/FileSafe.md
- Plans/FinalGUISpec.md
- Plans/GitHub_Integration.md
- Plans/Goal_Runtime_System.md
- Plans/MCP_Integration.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Multi-Account.md
- Plans/Permissions_System.md
- Plans/Plan_Document_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Planning_Ledger_System.md
- Plans/Plugins_System.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/Release_Supply_Chain.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/assistant-chat-design.md
- Plans/assistant-memory-subsystem.md
- Plans/storage-plan.md
- Plans/usage-feature.md
```

### PMConcept7 Home Workspace direct-manipulation repair wave — 2026-08-12

Repairs a set of Home regressions and replaces the surface movement affordance.
Ten reported defects were traced to the Home layer projecting over the PM6 shell
rather than to missing features: the layer reparented shell surfaces and then
overrode their layout wholesale, mounted its own controls where the host chrome
already lived, and intercepted two shell controls in the capture phase. Owner-doc
changes:

- `Plans/FinalGUISpec.md` — F3-HOME-002 amended (direct manipulation with live
  neighbour reflow and an in-flow placeholder; drop-target priority; capture loss
  is not a cancellation vector; per-frame resize scope; keyboard movement on the
  grab handle). F3-HOME-003 amended (one top-left grab handle per eligible
  surface; the per-surface Move or dock rows retired; the terminal collapse
  chevron is a toggle and the collapsed strip is the expand affordance). F3-460
  amended (notification stack moves after the title-bar search, centred before the
  theme/settings cluster). F3-464 scope clarified to title-bar page tabs. New
  F3-505 — contact-aware editor tab silhouette.
- `Plans/Wiring_Matrix.production.json` — the 42 `home.*.move.*` and 35
  `home.*.redock.*` rows are retired (128 → 51 `home.` rows); the grab, drop
  target, resizer and terminal-toggle rows carry the new locations and checks.
  `cmd.workspace_layout.move_surface` keeps full catalog↔wiring closure through
  the grab and drop-target rows.
- `Plans/UI_Command_Catalog.md` — UCC-144 amended; no new command IDs.
- `Plans/Widget_System.md` — dashboard widgets adopt the shared
  direct-manipulation vocabulary while `widget_layout:v1:dashboard` keeps
  ownership of widget layout.
- `Plans/FileManager.md` — Open in Panel must render a real buffer in all four
  panels.
- `Plans/Automated_Testing_System.md` and
  `Plans/GUI_Rebuild_Requirements_Checklist.md` — fixtures must assert observable
  geometry and rendered content, not dispatch counts.
- `Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json` — census 128 → 51
  with refreshed source hashes.
- `Plans/UI_Wiring_Rules.md` §0.1 — concept-input note re-pointed.

`Plans/home_workspace_layout.schema.json` and `Plans/storage-plan.md` are
unchanged: the record shape, storage key and revision/readback rules are
unaffected. `Concepts/PMConcept7.html` remains a generated artifact and
illustrative source lineage only; this compile creates no WorkNodes, NodeSeeds,
executable queues, implementation files, runtime artifacts, production build
tasks, or governance-seal artifacts by itself.

### PMConcept7 Home Workspace implementation wave — 2026-08-04

The model-driven Home workspace is routed through these canonical owners and
consumers:

- `Plans/FinalGUISpec.md` — Home shell composition, four stable editor surfaces,
  five hosts, drag/drop previews, resize reliability, themes, scroll treatment,
  and web/native capability matrix.
- `Plans/FileManager.md` — editor panel identity and File Manager open-target
  routing.
- `Plans/Section15_MVP_Promoted_Features_Spec.md` — terminal section/workgroup
  identity and four-section/four-pane limits.
- `Plans/home_workspace_layout.schema.json` and `Plans/storage-plan.md` — typed
  layout record, persistence scope, migration, validation, and recovery.
- `Plans/UI_Command_Catalog.md`, `Plans/Contracts_V0.md`,
  `Plans/event_family_registry.json`, `Plans/UI_Wiring_Rules.md`, and
  `Plans/Wiring_Matrix.production.json` — command/event/wiring boundaries.
- `Plans/Widget_System.md` and `Plans/DRY_Rules.md` — widget non-hostability and
  owner/consumer separation.
- `Plans/Automated_Testing_System.md` and
  `Plans/GUI_Rebuild_Requirements_Checklist.md` — live and visual evidence gates.
- `Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json` — implementation
  control evidence; it does not replace older PMConcept census artifacts.

The former one-floating-editor File Manager limit and two-terminal/editor-area
Section15 limit are superseded by the explicit addenda in their owner documents.
Governance artifacts and Spec Lock are refreshed only after these ordinary docs,
source transforms, generated PM7 output, and evidence stop changing.

#### Post-audit repair registration — 2026-08-05

The implementation-facing Home authority is now formalized by accepted PlanUnits
`F3-501` through `F3-504`, `F-080`, `SMPFS-138`, `SP-245`, `UCC-144`,
`CV-323`, `UIW-010`, and `ATS-029`. `SMPFS-079` is retired compatibility
lineage and no longer supplies a current two-terminal ceiling. The sole layout
schema ID is `pm.home_workspace_layout.v1`; earlier Home schema/key identifiers
are read-only migration inputs.

The title-bar Home popup is the compact exact three-row menu owned by `F3-502`,
not the earlier control-center presentation. Production leaf routing, transactional
receipt/event truth, source-hashed census, executable interaction coverage, exact
72-case visual matrix, Slint 1.17.1 Rust/multi-window ownership, Wayland best-effort
restore, and direct-user-activation popup degradation are routed to the PlanUnits
above. This registration does not broaden Widget System hostability, introduce any
Home `cmd.widget.*` command, or change the native `cmd.file.open_with` enum.
