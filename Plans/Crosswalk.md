# Crosswalk (Canonical)


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Coverage blocker worktree allocation strategy
### Route/open compatibility-only fallback marking
> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- CANONICAL CROSSWALK

Purpose:
- Define *ownership boundaries* for core primitives so plan documents do not drift into duplicating each other.
- Keep it DRY: other plans reference these sections rather than redefining boundaries.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This document is a **boundary map**, not an implementation plan.
It assigns authoritative ownership for *primitives* (Tool, Provider, UICommand, SessionStore, PatchPipeline, AuthState, etc.) so each plan can remain DRY.

ContractRef: Primitive:Crosswalk

---

## 1. Precedence (anti-drift)
When two plan documents disagree, resolve conflicts deterministically with this precedence order:
1. `Plans/Spec_Lock.json`
2. This Crosswalk
3. `Plans/DRY_Rules.md`
4. `Plans/Glossary.md`
5. `Plans/Decision_Policy.md`

ContractRef: PolicyRule:Decision_Policy.md§2, SchemaID:Spec_Lock.json

---

## 2. Primitive index (definitions are DRY)


### 2.1 Canonical primitive entries

This file uses primitive names as **routing labels** only; detailed schemas belong to their SSOT documents.

- `Primitive:Provider` -- provider CLIs and their normalized streams (see `Plans/CLI_Bridged_Providers.md`).
- `Primitive:Tool` -- host tools invoked by Puppet Master (see `Plans/Tools.md`).
- `Primitive:UICommand` -- stable UI command IDs (see `Plans/Contracts_V0.md#7-uicommand` and `Plans/UI_Command_Catalog.md`).
- `Primitive:SessionStore` -- persistent store boundaries (see `Plans/storage-plan.md`).
- `Primitive:PatchPipeline` -- Git + PR workflows (see `Plans/WorktreeGitImprovement.md` and `Plans/GitHub_API_Auth_and_Flows.md`).
- `Primitive:DocumentPane` -- embedded document navigation and editing surface contract (see `Plans/FinalGUISpec.md` and `Plans/FileManager.md`).
- `Primitive:DocumentReviewSurface` -- workflow-level document review routing and tri-location pointers (see `Plans/chain-wizard-flexibility.md`, `Plans/interview-subagent-integration.md`, and `Plans/assistant-chat-design.md`).
- `Primitive:ReviewFindingsSummary` -- structured Multi-Pass findings summary and rendering contract (see `Plans/chain-wizard-flexibility.md`, `Plans/interview-subagent-integration.md`, and `Plans/FinalGUISpec.md`).
- `Primitive:ReviewApprovalGate` -- final approval gate contract for revised document bundles (see `Plans/chain-wizard-flexibility.md`, `Plans/interview-subagent-integration.md`, and `Plans/Project_Output_Artifacts.md`).
- `Primitive:DocumentCheckpoint` -- checkpoint and restore contracts for document revisions (see `Plans/storage-plan.md`, `Plans/Project_Output_Artifacts.md`, and `Plans/FileManager.md`).
- `Primitive:RouteTarget` -- canonical route, focus, and cross-surface target identity boundary for GUI, CLI, help, and service navigation. `resume_url`, `route_target`, and `/open-by-identity` serialize or transport this identity; they do not own it.
- `Primitive:OpenSubject` -- identity-native open/focus primitive for `doc:` / `artifact:` subject IDs and other open-oriented `subject_id` values. Non-subject domain objects route by `object_kind` plus object identity before any path-based `OpenFile` realization.
- `ContractName:Contracts_V0.md#AuthState` -- auth state + events.

ContractRef: ContractName:Contracts_V0.md, SchemaID:Spec_Lock.json

Primitive:RouteTarget / Primitive:OpenSubject

Route targets and open subjects are the canonical way to name destinations and inspection points across GUI, CLI, help, and underlying services. This section clarifies the boundary: ownership and canonical semantics live in Plans/Contracts_V0.md; this section explains how surfaces navigate them.

#### Route target navigation rules


1. CLI `-r`/`--route` and GUI "Save" buttons resolve route_target strings through a cascade:
   - `file://...` → local file system (requires file permissions)
   - `github://owner/repo/path` → GitHub repository (requires auth and branch access)
   - `workspace://project/concern` → internal workspace (always allowed, creates if absent)
   - `share://sharepoint-url` or `notion://...` → external service (depends on integration availability)
2. If route is ambiguous (e.g., `~/output` with no scheme), the active Persona's default route is used.
3. Crosswalk does not own the decision; it documents how the decision made in Contracts_V0.md and Models_System.md flows through to the UI.

#### Open subject navigation rules


1. GUI "Open" and "Inspect" buttons normalize open requests to an OpenSubject and route through the orchestrator's concern/help/artifact resolution.
2. Subject types: `file`, `concern`, `help_entry`, `project_state`, `run`, `artifact_storage`.
3. Crosswalk describes which surfaces can open which types; canonical ownership rules are in Contracts_V0.md.

### 3.3 Navigation and source-open ownership


`Plans/FileManager.md` owns path-based editor realization only: `OpenFile` handles workspace paths, line/range selection, editor chrome, and code-navigation clicks after a canonical path is known. Cross-surface `route-target` / `OpenSubject` navigation, `/open-by-identity`, and identity-native document, artifact, runtime, and governance opens are not FileManager ownership; they route through the canonical route/open boundary before any `OpenFile` realization.

### 3.4 Source Control and lane/worktree ownership


Source Control and `Plans/WorktreeGitImprovement.md` own Git/worktree object navigation and worktree lifecycle; `Plans/FileManager.md` only preserves path/root context when handing off to that route. Worktree selection, `open-in-SCM`, and Source Control pivots are object navigation, not pure layout state. SCM lineage for node/package execution cannot rely on optional or singular branch/worktree data; it preserves `/package`, `/worktree`, `repo_id`, `worktree_id`, `/node/attempt`, package-level rollback/retry context, and cross-surface navigation to the canonical worktree object. Source Control remains compact and Git `worktree-first`, while Orchestrator remains lane/package/seam `/package/seam/node-first`; routes carry lane, package, seam, lifecycle, and historical lineage instead of becoming panel-only state. `/help/labels`, `/dashboard`, `/projection`, Orchestrator tab copy, Source Control / lane/worktree language, blocked/recovery actions, and `concerns/promotions/patches/history/ledger` labels consume this lane/worktree terminology; `acknowledged` is escalation `/noise` control and ownership visibility, not semantic closure or blocker removal.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Models_System.md, ContractName:Plans/FileManager.md
### 3.5 Assistant thread worktree binding ownership


Thread-to-worktree binding is owned by `Plans/assistant-chat-design.md`.

| Aspect | Owner doc | Consumer docs |
|---|---|---|
| Binding data model (1:1, thread↔worktree) | assistant-chat-design.md | storage-plan.md, Contracts_V0.md |
| Seglog events (`chat.thread_worktree_*`) | assistant-chat-design.md | storage-plan.md, Contracts_V0.md, Wiring_Matrix.md |
| Commands (`cmd.chat.worktree.*`) | assistant-chat-design.md | UI_Command_Catalog.md, Commands_System.md, Contracts_V0.md |
| Settings (10 keys) | assistant-chat-design.md | storage-plan.md, FinalGUISpec.md |
| Merge-back flow | assistant-chat-design.md | GitHub_Integration.md, Executor_Protocol.md |
| Pre-merge test gate | assistant-chat-design.md | storage-plan.md, Executor_Protocol.md |
| SC accordion & filter | GitHub_Integration.md | storage-plan.md, FinalGUISpec.md, Wiring_Matrix.md |
| Worktree record extension (`owner_thread_id`) | storage-plan.md | WorktreeGitImprovement.md, Orchestrator_Page.md |
| File manager worktree toggle | FileManager.md | assistant-chat-design.md, storage-plan.md |
| LSP worktree root_identity | LSPSupport.md | assistant-chat-design.md, Executor_Protocol.md |

**Freshness / health projection:** Thread worktree binding state follows the two-dimensional projection model (freshness=current|refreshing|stale × health=healthy|degraded|unavailable) defined in storage-plan.md §Projection state.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/DRY_Rules.md

### 3.6 Projection-state ownership


Projection freshness/health vocabulary is owned centrally so consumer docs do not invent surface-local degraded-state semantics.

Canonical ownership is:
- `storage-plan.md` owns the projection-state axes and persisted freshness/health semantics
- `Decision_Policy.md` owns behavior when stale, degraded, or unavailable state affects execution or mutation gating
- `FinalGUISpec.md` owns how freshness/health are disclosed in UI surfaces
- feature/surface docs may consume these states but MUST NOT redefine the axes or collapse them into one field

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md

### 3.7 Subagent, crew, and context-shaping ownership

Subagent and crew ownership is intentionally split across owner docs. Each concern has one authoritative home.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md

| Concern | SSOT owner |
|---|---|
| Global execution limits (`maxNestingDepth`, `maxTotalSpawnedAgents`, `maxToolRoundsPerAgent`, concurrency caps) | `Plans/orchestrator-subagent-integration.md` |
| Per-interview reviewer cap (`max_subagents_spawn`) | `Plans/interview-subagent-integration.md` |
| Shell environment isolation, `shell-isolation`, and shell lifecycle | `Plans/orchestrator-subagent-integration.md` + `Plans/Tools.md` jointly |
| Context-shaping transitions and compaction-state events | `Plans/Prompt_Pipeline.md` + `Plans/storage-plan.md` |
| Crew lifecycle and message-board events | `Plans/storage-plan.md` |
| Requested vs effective runtime surface for child runs | `Plans/Models_System.md` + `Plans/CLI_Bridged_Providers.md` |

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md

Per-surface docs may narrow these behaviors, but MUST NOT redefine the owners above.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md

### 3.8 Human-in-the-loop ownership

Canonical HITL ownership is:
- `human-in-the-loop.md` owns approval/decline semantics and the blocked-episode overlay contract
- `Contracts_V0.md` owns the canonical blocked-episode fields, action ids, and persisted payload shapes
- `UI_Command_Catalog.md` owns the concrete command ids that execute approval actions
- `FinalGUISpec.md` and `assistant-chat-design.md` own presentation only

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md

### 3.9 Debug-mode and investigation ownership

Canonical debug/investigation ownership is:
- `assistant-chat-design.md` owns Assistant Debug Mode as the user-facing workflow overlay and investigation-thread behavior
- `orchestrator-subagent-integration.md` owns orchestrator/delegated-worker use of shared investigation contracts
- `Executor_Protocol.md` owns execution-time investigation context propagation
- `storage-plan.md` owns persisted investigation records, snapshots, and recovery joins
- `Permissions_System.md` owns the Debug Automation Profile and grant/revalidation semantics

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

### 3.10 Permission and approval-scope ownership


Canonical permission ownership is:
- `Permissions_System.md` owns permission precedence, rule persistence, approval-scope derivation, durable-rule authoring, and blocked-family expectations for permission-caused outcomes
- `Contracts_V0.md` owns canonical blocked payload shapes, `approval_scope_key`, and action-id field names
- `human-in-the-loop.md` owns approval interaction semantics, not rule persistence
- consumer docs may name required permission keys or blocked triggers but MUST NOT redefine the approval-scope contract

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md

### 3.11 Remediation lifecycle ownership


Canonical remediation ownership is:
- `Executor_Protocol.md` owns when remediation is spawned, how it interacts with retry/safe-point flows, and when execution escalates instead of retrying
- `Contracts_V0.md` owns `remediation.spawned` / `remediation.resolved` event shapes and the canonical `resolution` enum
- `Decision_Policy.md` owns deterministic remediation ceilings and blocked posture after ceiling exhaustion
- `storage-plan.md` owns durable remediation lineage, joins, and historical projection behavior
- Orchestrator/GUI/chat docs consume remediation state but MUST NOT redefine remediation enums or ceiling behavior

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md

### 3.12 Provider and account-selection ownership

Canonical provider/account selection ownership is:
- `Models_System.md` owns provider-entry/runtime-surface selection priority and requested/effective model/runtime fields
- `Multi-Account.md` owns account selection, provider-entry separation, requested/effective account fields, and switch lineage semantics
- `Prompt_Pipeline.md` owns when requested/effective provider/account/model decisions freeze into the runtime handoff bundle
- `CLI_Bridged_Providers.md` and provider-specific docs own transport/capability facts and provider-native fallback constraints, but not the global selection precedence

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/CLI_Bridged_Providers.md

### 3.13 Event, record, and terminal-identity ownership

Canonical ownership is:
- `Contracts_V0.md` owns event families, runtime-facing payload names, and command/event envelopes
- `storage-plan.md` owns persisted record families, projection joins, `terminal_session_id`, `dev_session_id`, and terminal continuity/restart identity rules
- `FinalGUISpec.md` owns shell realization and terminal layout presentation
- `Plans/Section15_MVP_Promoted_Features_Spec.md` is the shell-level owner for terminal placement plus shell/session identities across `Plans/**` consumers, including `/session` behavior that downstream docs may route to but must not redefine
- consumer docs may extend display metadata but MUST NOT redefine terminal or event identity primitives

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

### 3.13A Provider pressure, effort-control, and rewrite crosswalk

- `Plans/assistant-chat-design.md` and `Plans/FinalGUISpec.md` are rewrite-map targets for effort-control updates when Gemini/Cursor assumptions drift; Crosswalk only names owner routing and does not redefine those product surfaces.
- Scheduler and GUI consumers use cross-provider requested/effective state. The portable provider-pressure projection records `Observed effective` versus `Inferred only`, normalized `pressure_state`, `hard_block`, `effective_pressure_state`, and `effective_resolution_outcome`; provider-specific strings remain subordinate evidence rather than scheduler inputs.
- PM uses one cross-provider scheduler across Gemini/Cursor/Claude/Codex/OpenCode; GUI, usage, and routing surfaces must preserve coherent `/effective` state across /Cursor/Claude/Codex/OpenCode instead of inventing local provider-specific phrasing.
- `/context-detail` and usage-display surfaces are consumer projections: `FinalGUISpec.md` owns shell/UI placement, `assistant-chat-design.md` owns chat behavior, `usage-feature.md` owns usage semantics, and `storage-plan.md` owns persisted projection inputs.
- Firecrawl/lost-spec web/chat/storage repair routing is owner/consumer only: `Plans/Tools.md` owns repaired web/tool behavior, `Plans/assistant-chat-design.md` owns chat/widget carry-through, and `Plans/storage-plan.md` owns persisted cache/projection inputs; `Plans/chain-wizard-flexibility.md` and `Plans/interview-subagent-integration.md` are workflow consumers that align document-review and interview flows without redefining tool, chat, or storage contracts.

### 3.13B Rewrite-era owner-routing safety

- Crosswalk routes cross-cutting persisted-envelope field families, stable event names, account IDs, account-routing semantics, requested/effective runtime resolution, stable command IDs, command argument families, Glossary terms, and execution-core semantics to the owner docs: `Contracts_V0.md`, `storage-plan.md`, `Prompt_Pipeline.md`, `Multi-Account.md`, `UI_Command_Catalog.md`, `Glossary.md`, `Executor_Protocol.md`, and `orchestrator-subagent-integration.md`. `UI_Command_Catalog.md` does not own the deeper route ontology by itself.
- Bridged-provider request `/persistence` envelopes use the same auth/account fields already owned by `Contracts_V0.md` and `Prompt_Pipeline.md`; requested-side concrete account inspection, including GPT-family runtime inspectors, routes through `Multi-Account.md`, `Models_System.md`, and the Prompt Pipeline `effective resolution record` for `/platform/model/auth/account`, requested-vs-effective state, `requested_account_policy`, `preferred-account`, role-by-account overrides, and `effective_account_id`.
- Structural owner safety is mandatory: `Plans/Glossary.md §2` references to `Overseer`, `attempt`, `attempt_id`, `safe point`, `lane`, and `work package` are routing risks until Glossary defines them; broad `effective state` wording is too broad for execution-identity, and non-terminal duplicate-numbered `References`, missing `Primitive` table entries for `Primitive:Seglog`, `Primitive:EvidenceBundle`, and `Primitive:CapabilityGating`, source-control `/GitHub-actions/docker`, `Seglog`, evidence-bundle output ownership, capability-gating, `/events`, `/effective`, `/capability`, and already-defined primitives must be routed before consumer docs cite them.
- Append-after-references drift is a structural owner-doc failure: `References` followed by then-more-content in Crosswalk, `GitHub_Integration.md`, or adjacent owner docs must be treated as normative content placement debt, not as a new source of truth. `ArtifactStore` and assistant-memory/AuthPolicy short anchors are routing risks until their SSOT pointers are explicit; runtime nouns such as `attempt_id`, `safe_point_id`, `scheduler_lane`, `blocked_sequence`, `provider_attempt_ref`, handoff, and promotion namespaces must route to owner docs before Glossary or Crosswalk consumers cite them.
- Highest-risk owner-routing remains explicit: `Crosswalk`, `DRY_Rules`, `Decision_Log`, and `Progression_Gates` route traceability checks; `Section15`, `FinalGUISpec`, GUI checklist, feature-list, and `newfeatures` route promoted-shell command and persistence identity; `FileSafe`, `MiscPlan`, `Executor_Protocol`, and `Run_Modes` route DAE/FileSafe `/FileSafe/recovery` lineage exactness; OpenCode provider-native and event-correlation contracts include `OpenCode_*` and `OpenCode_` bridge docs.
- Blocking rewrite owners route through existing docs: `Plans/orchestrator-subagent-integration.md` owns the core execution model, `Plans/FinalGUISpec.md` must retire Tiers/linear navigation assumptions, and `Plans/FileSafe.md` must not let a strict Phase/Task/Subtask hierarchy block package-based planning or `/Task/Subtask` compatibility mapping.
- Formal field precedence for Orchestrator surfaces routes `Plans/Orchestrator_Page.md` and `/Orchestrator_Page.md` through `Plans/Contracts_V0.md`; Crosswalk records the owner boundary and does not make Orchestrator pages the field-schema owner.
- Storage/project-state support routes through `storage-plan.md`: `orchestrator.project_state.{project_id}`, `/project-state`, focused and `/selected` run state, `attempt_record`, `provider_attempt_ref?`, `orchestrator.receipt.{run_id}.{attempt_id}`, `orchestrator.receipt`, `usage_record`, `run_id`, `attempt_id`, `thread_id`, and effective account/model/auth fields including `/model/auth`.
- Surface-specific state remains owner-handled: Source Control `active_subview`, selected repo/worktree, compare target, and graph filters; GitHub Actions `active_subview`, current branch, pinned workflows, and last opened run `/job`; Docker Manager `active_subview` plus runtime `/context/registry/namespace` focus; Document pane selected document/view/history/approval state; `/selection` and `/worktree` focus are routing identities, not consumer-owned local state.
- Multi-account switch/pressure behavior routes to `Plans/Multi-Account.md`; durable switch-history storage and `/pressure` joins must align with scheduler dispatch plus usage/storage identity fields rather than remaining account-only notes. `Plans/Provider_OpenCode.md` owns provider-specific transport-vs-upstream identity and full auth/account runtime disclosure, while Crosswalk only routes the `/account` boundary.
- Cross-owner seam routing may name future Projects `/attention-center` docs, `Plans/Runtime_Artifacts_Panel.md`, and `/Runtime_Artifacts_Panel.md` alongside `Plans/storage-plan.md`, `Plans/FinalGUISpec.md`, `Plans/Contracts_V0.md`, `Plans/UI_Command_Catalog.md`, and `Plans/assistant-chat-design.md`; these names mark implicated owner surfaces, not a license for consumer-only navigation or artifact state.
- Existing navigation mechanisms such as the command palette, `preview_subject_id`, `resume_url` deep links for wizard `/interview` recovery, `Show in Ledger`, `Show in Usage`, Orchestrator pivots into Source Control/GitHub Actions/Docker Manager, chat and thread navigation, open-file contracts, and local tab search/filter normalize to route-target/OpenSubject recipes rather than letting any consumer make `resume_url` or open-file behavior the owner.
- `FileManager.md` stays the path-based editor realization owner: `OpenFile` handles workspace paths, line/range selection, and editor chrome, while `route-target` / `OpenSubject` own cross-surface identity navigation and `/open-by-identity` compatibility transport.
- Worktree selection, `open-in-SCM`, and Source Control pivots are object navigation, not pure layout state. SCM lineage for node/package execution preserves `/package`, `/worktree`, package-level rollback/retry context, and cross-surface routing to the canonical worktree object.
- Source Control remains Git `worktree-first`, while Orchestrator remains lane/package/seam `/package/seam/node-first`; routes that cross the seam carry `/worktree`, `/node/attempt`, lane, package, and seam context instead of becoming panel-only state.
- Crosswalk `/index/primitive` routing must list rewrite-era primitives before `/gate` checks or downstream owner docs depend on them, and duplicate runtime/gate addenda collapse into one numbered canonical section per owner; missing primitive entries are structural owner debt, not consumer cleanup.
- Glossary and `/help/labels` consumers for lane/worktree, blocked/recovery, and concerns `/promotions/patches/history/ledger` copy route through this primitive boundary so copy drift does not create alternate owners.
- `acknowledged` is escalation `/noise` control and ownership visibility only; it does not close a concern, remove a blocker, or replace resolved/dismissed lifecycle states.
- The preview subject identity base is `doc:` / `artifact:` under `subject_id`. Keep `subject_id` narrow and open-oriented for renderable content; non-subject domain objects use `object_kind` plus object identity for navigation, focus, or inspection.
- `FileManager.md` and `/navigation` consumers must not make `OpenFile` the universal navigation primitive; identity-native document, artifact, runtime, and governance opens normalize through `OpenSubject` or object routes first.
- `historical-run` mode is route context, not a local UI toggle. `cmd.panel.switch` remains a concrete command, while palette `/search/thread` jumps, cross-surface commands, and other command-specific payloads normalize to the shared route model instead of becoming a second navigation language.
- `resume_url` serializes route identity, not source-open identity. The route-target primitive sits between `Primitive:UICommand`, `Primitive:DocumentPane`, `DocumentPane`, `OpenFile`, `OpenFile { path... }`, and lower-level service opens; Crosswalk names the owner boundary while `Contracts_V0.md`, `storage-plan.md`, and `FileManager.md` own contract shape, persisted refs, `/doc/artifact` restore identity, and file-open realization respectively, preventing FileManager over-claims or surface-local navigation semantics.
- Project and panel navigation stay route-consuming: `cmd.project.open` must not mutate `shell-state`, panel `/subview` entries such as `Source Control` may be landed by route identity, and that route must not become a full serialized `source_control.project_state` owned by the surface.
- Navigation identity is owned by the route contract and primitive boundary. `storage-plan.md` owns persisted subject refs and restore joins without owning the route ontology; `FinalGUISpec.md`, `FileManager.md`, and `UI_Command_Catalog.md` consume that boundary, and ad hoc `UI_Command_Catalog` navigation payload shapes must normalize into the bounded shared field set.
- Runtime-artifact subject opens preserve owner split: `preview_subject_id`, `generated://<artifact_id>`, and `artifact_id` are storage-family subject identity inputs, `/open` and `OpenSubject` route through the contract primitive, `route_target` ties navigation to that subject-first identity, and runtime-artifact consumers do not become navigation owners. First-class `worktree_record` and `lane_record` families likewise anchor `/worktree` and `/summary` joins for Orchestrator, Source Control, runtime artifacts, and project attention.
- `thread_blocked_notice` and `wizard_runtime_state` carry blocked and `/wizard` state, but any `resume_url?` inside those records is navigation transport for canonical route identity rather than stored model identity; `/model` and `/model/persona` precedence stays with the provider/account/model owner chain.
- Orchestrator tab and action routing uses this owner inventory: `Plans/UI_Command_Catalog.md`, `Plans/orchestrator-subagent-integration.md`, `Plans/storage-plan.md`, `Plans/human-in-the-loop.md`, `Plans/Glossary.md`, `Plans/Orchestrator_Page.md`, `Plans/assistant-chat-design.md`, and `Plans/FinalGUISpec.md`. Crosswalk first pins Orchestrator ownership boundaries, then routes tab responsibilities and `CTA` behavior, cross-links to Usage/Evidence/Graph/history/blocked outcomes, provider/model/persona precedence, and worktree ownership `/isolation` rules to those owners.
- Tier-era UI migration routes through `Plans/FinalGUISpec.md`, `Plans/Orchestrator_Page.md`, and `Plans/storage-plan.md`: the old `Tiers` tab, per-tier worktree ownership, linear phase progress bars, and rigid phase `/task` navigation must yield to parallel lanes, package boundaries, seams, effective identities, and storage-backed owner state instead of just tasks.
- Orchestrator tab ownership stays asymmetric. `Progress` is the widget-hosting operational tab, native deep-inspection tabs own seams plus `/graph/evidence/history/ledger`, and Source Control remains the Git `/worktree-first` inventory and `/manipulation` surface rather than letting Orchestrator duplicate a worktree manager.
- Persona and model-adjacent routing stays split by owner family: `Plans/Personas.md`, `Plans/Prompt_Pipeline.md`, and `Plans/interview-subagent-integration.md` own persona/prompt/interview handoff behavior, including protected core IDs, specialty mutability, chat/subagent eligibility, and requested/effective Persona names. `Plans/Models_System.md`, `Plans/orchestrator-subagent-integration.md`, and `Plans/FinalGUISpec.md` own model-system selection, orchestrator execution integration, and shell exposure.
- Widget/account routing names `Plans/Widget_System.md` as the widget owner; `Prompt_Pipeline.md`, `Multi-Account.md`, `FinalGUISpec.md`, and `Executor_Protocol.md` provide supporting account/runtime references rather than redefining widget contracts.
- Permissioned interview/chat flows route `Plans/Permissions_System.md`, `Plans/assistant-chat-design.md`, and `Plans/interview-subagent-integration.md` as the owner set for approval, chat, and interview behavior; preview/browser `trust_tier` must not be reused as a generic `projection-state` term.
- Execution and command cleanup stays owner-specific: `Plans/Executor_Protocol.md` owns `execution_role`, `blocked_sequence` minting, and `startup-recovery` scheduler handoff; `Plans/UI_Command_Catalog.md` owns `command-family` migration where ghost-ID dependents and navigation commands need the same discipline as event aliases and `cmd.runtime.*` / `cmd.runtime` consolidation.
- Storage/orchestrator consistency routes through `Plans/storage-plan.md` and `Plans/orchestrator-subagent-integration.md`: storage-plan `spot-checks` must preserve persisted subject identity, `projector-derived` joins, and restore semantics instead of turning projection joins into surface-owned state.
- Cross-owner artifact seams name `Plans/FileManager.md`, `Plans/storage-plan.md`, `Plans/FinalGUISpec.md`, `Plans/assistant-chat-design.md`, and `Plans/Runtime_Artifacts_Panel.md` as implicated owners; Crosswalk records the seam and restore/open routing boundary without making any consumer doc the canonical artifact owner.
- UX-facing wrapper commands such as `cmd.panel.switch`, `cmd.chat.open_thread_usage`, `cmd.artifacts.show_in_usage`, `cmd.orchestrator.open_in_source_control`, and `cmd.project.open` remain useful surface verbs, but they are not the universal navigation primitive; `Plans/FinalGUISpec.md`, `Plans/Contracts_V0.md`, and `Plans/assistant-chat-design.md` consume the shared primitive boundary instead of replacing it.
- Crosswalk owns the navigation `primitive-boundary` declaration for `route-target` and `subject-open` navigation. `route-target` and `subject-open` identify the canonical route/open boundary, while `resume_url` and `/open-by-identity` are transport or compatibility expressions that must serialize that identity rather than invent a second navigation model.
- Usage navigation treats `usage_event` as a first-class routed object; `usage-feature.md` may present page-local filtering behavior, but page-local filters are consumers of routed usage identity rather than the canonical route owner.
- `Plans/FileManager.md` realizes file-open behavior while `Plans/storage-plan.md`, `Plans/FinalGUISpec.md`, and `Plans/assistant-chat-design.md` consume persisted refs and shell/chat projections. `OpenSubject`, `/OpenSubject`, `OpenFile`, runtime-lineage subject families, and fuller OpenFile/OpenSubject governance remain routed through this owner split.
- Strong stale consumers such as `Plans/FinalGUISpec.md` and `Plans/chain-wizard-flexibility.md` must reference the route-target/subject-open boundary rather than continuing surface-local navigation assumptions.
- Orchestrator `CTAs` into Source Control, GitHub, Docker, and adjacent operations must preserve exact project/run/package/lane/worktree context, including `/run/package/lane/worktree` and `/worktree` routing, instead of downgrading to panel-only jumps. Historical-safe actions may inspect graph, inspect evidence, inspect ledger, export, view lineage, and open related Source Control / GitHub / Docker context only in historical mode where the route context remains explicit.
- Ledger exact records, history chronology, graph generations, seams completion `/promotions`, and the lane/worktree cleanup lifecycle must share durable route identity; navigation actions distinguish `none` selection from open/focus/navigate/deep-link, `/focus/navigate/deep-link`, open evidence/history/ledger/source control, `/history/ledger/source`, and tab-local filter/sort/search changes including `/sort/search`.
- Account and persona/model routing must keep `Multi-Account.md`, `Models_System.md`, and `Personas.md` aligned on requested/effective visibility, selection reason, skipped or `/honored` control disclosure, and attempt-level snapshotting. `Multi-Account.md` owns selection policy and role/account precedence rules, while `/account` runtime fields are referenced rather than redefined.
- `Plans/Glossary.md`, `Plans/FinalGUISpec.md`, `Plans/assistant-chat-design.md`, `Plans/human-in-the-loop.md`, and `Plans/interview-subagent-integration.md` remain consumer/owner surfaces for terminology, shell/chat, approval, and interview behavior. `cmd.panel.switch` is panel-centric and too shallow for focused run restoration, inspector target restoration, tab-native filters, object identity restoration, trust context, or `/historical` mode; `UI_Command_Catalog.md` / `UI_Command_Catalog` must not become a de facto navigation contract where deeper route payload ownership is still unowned.
- `operational_identity` records the external side-effect target context in play: GitHub org/repo/workflow/job and `/repo/workflow/job`, Docker context/image/publish target and `/image/publish`, Kubernetes context/namespace/workload and `/namespace/workload`, plus other environment-specific target identities. `Plans/FinalGUISpec.md` must not overstate `OpenFile` as the universal file-open contract when identity-native subject opens are required.
- Attention and `/CtA` surfaces are route consumers: local field conventions must normalize to the generalized `route-target` model, and most identifiers in navigation payloads must not become top-level canonical `route_target` fields. `generated://<artifact_id>` is resolved source transport chosen by the `OpenSubject` executor when an `artifact_id` subject has no workspace-backed document; `storage-plan.md` subject identity still depends on named `owner-doc` contracts instead of replacing them.
- Crosswalk must surface its own numbering and owner-map debt: duplicated section numbering for `3.13` `RunGraphView` / `DocumentInlineNotes` and `3.14` `OrchestratorPage` / `TargetedRevisionPass` is a structural risk, and runtime-worktree-centric `/tier`, `/tier/subtask`, per-tier `Tiers`, `owner run/tier when present`, and owner run/tier wording must yield to package-based `lane-pool`, `/package/seam/lane-aware`, node/package/seam/lane-aware execution identity.
- Identity-facing owner docs such as `Prompt_Pipeline.md`, `Models_System.md`, `Personas.md`, `Models_System`, and `Prompt_Pipeline` must retire tier-bound selection, override-owner, and execution-framing assumptions. Orchestrator should show lane/worktree summary in package context, `/state` health badges, and deep links into Source Control for Git-native operations without mirroring a raw worktree inventory table.
- Historical lane/worktree records must survive `archive`, `prune`, and `remove`; external-operation lineage must preserve Source Control repo/worktree/branch and `/worktree/branch`, GitHub workflow/job/step and `/job/step`, Docker context/image/publish/template and `/image/publish/template`, and Kubernetes context/namespace/workload/rollout and `/namespace/workload/rollout`.
- `Executor_Protocol.md` / `Executor_Protocol` owns node-native scheduler behavior but still needs an explicit `execution-context` contract naming minimum dispatch fields. Surface copy must distinguish `Open in Editor` for file or `/document-backed` targets from `Open Artifact`, `Open Report`, and other routed opens where the target is `identity-native`.
- Crosswalk must define one canonical internal route/target payload: `resume_url` is only one persisted `/serialized` recovery `/deep-link` transport form for `/target`, not the hidden canonical navigation primitive. `OpenSubject` and `OpenFile` must live inside the same routing model rather than becoming separate navigation stacks.
- Artifact/file/storage routing promotes `project_id`, `attempt_id`, and generated `/runtime` subject routing to first-class owners across artifact `/file/storage` docs. `doc:` and `artifact:` are canonical persisted subject `IDs`, while `generated://` remains an implementation-level transient representation rather than the persisted subject ID.
- Future reconciliation work prioritizes command/event namespace unification, wiring `/gate` extraction and `/schema` hardening, artifact/run/workflow identity closure including `/run/workflow`, `Glossary`/`Crosswalk` strengthening, and startup `/blocked/DAE` governance ownership; `/Crosswalk`, `/event`, and `/gate` references are owner-boundary signals, not a new process artifact.
- `Plans/Crosswalk.md` / `Crosswalk.md` now names the primitive boundary that `Primitive:UICommand`, `Primitive:DocumentPane`, `UICommand`, and `DocumentPane` consume: `route-target` navigation and identity-native open/focus behavior including `/focus`. If an infrastructural navigation family is needed, it stays tiny and internal, such as `/shared` `open_subject` or `focus_route`, not a user-facing broad replacement for domain wrapper verbs.
- Downstream navigation fields such as `usage_event_ref`, `wizard_step`, direct artifact/document `IDs`, `/document`, and other special-case top-level fields must normalize to the owner-level route/open model. This seam is owner-level, not consumer-level: fixing `Orchestrator_Page.md`, `Orchestrator_Page`, or `FinalGUISpec.md` first would still leave stale routing at the top of the precedence stack; `Contracts_V0.md` / `Contracts_V0` must converge raw `resume_url` and `/open` stories into named route/open primitives.
- `FinalGUISpec.md` must retire `Tiers` as a primary view, reduce `resume_url` to transport rather than `first-class` navigation identity, and align dashboard/settings language with the graph/seam/package and `/seam/package` model. Owner-doc primitive boundaries must stop remaining `prose-only`: route-target ownership, evidence `/gate` schemas, and richer routing `/normalization` need formal owner-doc anchors rather than implied contracts.
- Cross-tab navigation is a design contract: important objects and `/events` must be deep-linkable across Progress, Seams, Node Graph, Evidence, History, and Ledger, while cross-tab routes preserve `/filter/select` target context instead of merely switching tabs. Adjacent `durable-object` patterns require blocked episodes, annotations, and review outputs to preserve identity, anchoring, lifecycle, and unresolved findings rather than collapse everything into one `/fail` result.
- Missing `usage_event_ref` definition is a hard blocker for trust-safe cross-surface navigation. `TierContext` replacement `/wrapper` is a structural follow-up; `Prompt_Pipeline.md` / `Prompt_Pipeline` owns the canonical requested `/effective` runtime record, but wizard `/interview` handoff payloads must expose more than a thin subset of it.
- Project/artifact/file surfaces must route by `project_id`, `attempt_id`, generated `/runtime` subject identity, and `/artifact/file` pivots. `resume_url` must not outrank generic `UICommand.args`, and normalized `open in X` / `show in Y` actions become thin wrappers rather than independent navigation systems.
- `Crosswalk.md` explicitly owns neighboring primitives `Primitive:UICommand`, `Primitive:DocumentPane`, `Primitive:DocumentReviewSurface`, `Primitive:DocumentCheckpoint`, `DocumentReviewSurface`, `DocumentPane`, `DocumentCheckpoint`, and `UICommand`; navigation normalization should reuse the `event-alias` and `recovery-command` migration style as its template.
- Execution-core restart ownership routes to `Executor_Protocol.md`: `blocked_sequence` minting, restart-recovery to first `scheduler.pass` handoff from `startup_recovered`, `TierContext` constructor alignment, reviewer `/corroboration` lifecycle, `/contracts/UI` payload dependencies, `execution_role` in effective-resolution/runtime snapshots, and tier-rooted `/hook` coordination that must preserve `/worktree/permission/runtime` joins.
- Scheduler truth must not split among lexicographic, scored, and UI-derived recovery models across `Plans/Executor_Protocol.md`, `Plans/Progression_Gates.md`, `Plans/plan_graph.schema.json`, and `Plans/Run_Graph_View.md`; Crosswalk routes the `/Progression_Gates.md`, `/plan_graph.schema.json`, and `/Run_Graph_View.md` contradiction to owner docs and requires one scheduler truth.
- In graph-canonical execution, top-level governance is the scheduler plus bounded manager agent contract: deterministic runtime scheduler only is too narrow when replan/escalation decisions are needed, and an overseer-style continuous loop is not the canonical owner.
- Orchestrator seam routing must keep the runtime ownership boundary, page/tab IA, blocked/remediation UX, and lineage across graph/evidence/history/usage visible as distinct owner concerns instead of collapsing them into one Orchestrator page discussion.
- Historical lane/worktree records and historical lane/worktree lineage must survive cleanup/archive/remove and archive/prune/remove while preserving safe-point/remediation linkage; Source Control remains compact and worktree-first, with /retained historical material behind filters or lineage views.
- Orchestrator/Evidence surface copy such as `Open in Editor` must not imply raw-path opens for artifact-backed or report-backed subjects; those actions normalize to `OpenSubject`, `Open Artifact`, `Open Report`, or object routes before any path realization.
- Structural owner-doc readiness includes Glossary term ownership, Crosswalk routing/index integrity, gate-registry completeness, and duplicate-section cleanup before downstream reconciliation may rely on those owners.
- The smaller hidden or lower-level canonical navigation primitive remains contract-owned rather than catalog-dominant: `UI_Command_Catalog.md` wrapper commands consume the route/open contract instead of defining the reusable route or subject semantics themselves.
- Shared record-semantic vocabulary spans attempts, promotions, concerns, graph patches, recovery records, and lane/worktree objects so records preserve lifecycle and owner identity consistently across route consumers.
- Chat `jump-to-message`, cost_usage deep-links, and blocked/runtime resumes are context-preserving navigation consumers of the same route/open model even when their surface docs document them separately as commands or links.
- `FinalGUISpec.md` and `FileManager.md` must reference both workspace file open and identity-native subject/route open: FileManager realizes workspace paths, while Final GUI consumes route/subject identity for shell-level navigation.
- `GATE-010` cannot serve as a serious route/subject guardrail for the route/subject direction until it verifies reusable navigation semantics: wrapper normalization, subject kind, route target kind, argument passthrough, and route/open contract coverage.
- Draft `/generation` and artifact-first flows open by subject identity first and path second; generated artifacts resolve through `OpenSubject` before FileManager path realization so upstream generation surfaces do not invent a parallel open contract.
- The route-target and subject-open primitive boundary covers `/open-by-identity` as compatibility transport when kept tight: one canonical primitive may span route-target navigation and subject-open/open-by-identity behavior only if it preserves the shared route/open identity contract.
- Runtime lineage is object-first, not attempt-first, so blocked episodes, scheduler passes, and graph generations remain intelligible across runtime-artifact, graph, evidence, history, and ledger consumers.
- SCM/runtime flows replace tier-bound worktree identity with the lane/worktree plus execution-context model; `/runtime` and `/worktree` routes carry lane/package/seam context rather than reviving per-tier worktree ownership.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Glossary.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Models_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Tools.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Personas.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Widget_System.md, ContractName:Plans/FileManager.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Progression_Gates.md, ContractName:Plans/plan_graph.schema.json, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Provider_OpenCode.md

## References


- `Plans/Spec_Lock.json`
- `Plans/DRY_Rules.md`
- `Plans/Glossary.md`
- `Plans/Decision_Policy.md`
- `Plans/Tools.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/Widget_System.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`


### 3.14 DocumentInlineNotes
**Owner:** GUI contract in `Plans/FinalGUISpec.md`; persistence contract in `Plans/storage-plan.md`; workflow semantics in `Plans/chain-wizard-flexibility.md` and `Plans/interview-subagent-integration.md`; chat-handoff rules in `Plans/assistant-chat-design.md`.

Rules:
- This primitive now covers durable document annotations on the legacy `note_record.v1` substrate.
- User-facing term is **Annotations** even though storage keys retain `note` naming for continuity.
- Durable annotation operations are `comment`, `replace`, `insert_after`, and `remove`.
- The implementation-ready operation contract is `operation = comment | replace | insert_after | remove`, `intent_kind = question | change_request | both`, and optional `operation_payload` with exact shapes: `comment` uses `{ body }`, `replace` uses `{ replacement_text, rationale? }`, `insert_after` uses `{ insert_text, rationale? }`, and `remove` uses `{ rationale? }`.
- Annotation lifecycle is `open -> addressed -> resolved`.
- Anchor storage MUST include both `TextPositionSelector { start, end }` and `TextQuoteSelector { exact, prefix, suffix }` when deterministic source text exists.

ContractRef: Primitive:DocumentInlineNotes, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

- Re-anchoring is deterministic: 1) position selector match, else 2) quote selector match using prefix/suffix preference, else 3) keep the annotation open and surface `Anchor not found — reselect to re-anchor`.
- `comment` annotations may coexist with any other annotation on the same span.
- Overlapping mutating annotations conflict by default and are excluded from automatic targeted revision until resolved.
- `Send selection to chat` is adjacent behavior, not a durable annotation by default.
- `Send selection to chat` is a thread-scoped chip/handoff path; it must not be collapsed into the durable `/annotation` lifecycle, and it does not create patch-apply semantics.
- Supported `source_surface` values include `assistant_deep_plan`, `interview_doc_pane`, and `document_viewer`; unsupported or `/no-source-map` surfaces are `send-to-chat-only` unless they define stable semantic anchor IDs.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md

---

### 3.15 TargetedRevisionPass
**Owner:** Workflow semantics in `Plans/chain-wizard-flexibility.md` and `Plans/interview-subagent-integration.md`; UI placement in `Plans/FinalGUISpec.md`; prompt and persistence details in `Plans/Prompt_Pipeline.md` and `Plans/storage-plan.md`.

Rules:
- `Resubmit with Annotations` triggers a targeted revision pass scoped to documents with open durable annotations, or a user-selected subset.
- Targeted revision consumes deterministic ordered annotation records that include `annotation_id`, `doc_id`, `operation`, `intent_kind`, `selected_text`, `operation_payload`, `anchor`, and bounded provenance.
- Targeted revision may apply requested edits and/or answer question/comment annotations.
- For each input annotation, the runtime records `addressed | still_open | cannot_apply`, `addressed_explanation`, and `updated_anchor?`.

ContractRef: Primitive:TargetedRevisionPass, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/storage-plan.md

- Targeted revision MUST NOT trigger Multi-Pass Review.
- Conflicting or stale mutating annotations are excluded from automatic revision until resolved.
- One automatic retry is allowed on structured validation failure; after that, the run must explicitly degrade or fail.
- The requested/effective revision capability is explicit: `requested_revision_capability` is compared with the effective capability, which is one of `schema_enforced_structured_revision`, `validated_structured_revision`, or `chat_handoff_only`.
- `schema_enforced_structured_revision` requires transport-native `/structured-output` support and local validation; `validated_structured_revision` allows local shape and anchor validation when provider guarantees are weaker; `chat_handoff_only` preserves durable annotations but routes mutating work into chat/manual follow-up.
- Bundle lifecycle/audit events remain visible as `bundle.note_created`, `bundle.note_status_changed`, `bundle.revision_started`, `bundle.revision_completed`, `bundle.revision_interrupted`, `bundle.selection_sent_to_chat`, and `bundle.selection_forward_blocked`.
- Future-phase risk tags for this primitive are explicit and non-blocking: `/future-phase`, `/risk`, `/providers`, `/conflicts`, `revision-prompt`, `thread-target`, `send-to-chat`, `sensitivity-aware`, `/stale`, and `/degradation`.
- V1 is note-based embedded-document review upgraded into structured annotations; direct `patch-apply` behavior is out of scope.

ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md

---

### 3.16 FinalReviewGate
**Owner:** Workflow semantics in `Plans/chain-wizard-flexibility.md` and `Plans/interview-subagent-integration.md`; artifact taxonomy and restore semantics in `Plans/storage-plan.md`.

Rules:
- Multi-Pass Review is final-review only: enabled only when all bundle docs are Approved/Done and no durable annotations remain open.
- Question/comment annotations count as open until the user resolves them.
- Pending `Send selection to chat` chips do not satisfy or bypass the gate.
- Final review runs once by default; rerun explicit only.
- Final gate is a single decision: `Accept | Reject | Edit`.

ContractRef: Primitive:TargetedRevisionPass, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/storage-plan.md

## Recovery Terminology Canonical Alignment (2026-03-08)


This packet requires an explicit terminology crosswalk:
- `safe point` = runtime-internal retry/remediation anchor
- `restore point` = user-visible history/rewind anchor
- `rollback` = explicit request/confirm restoration flow
- `worktree baseline` = execution-root state used to materialize a safe point or restore point depending on context

Required rule:
- docs and implementations must not use these terms interchangeably
- UI copy must preserve the distinction
## Runtime Scheduler / Recovery Ownership and Precedence


Canonical ownership:
- runtime lifecycle and scheduling: `Plans/Executor_Protocol.md`
- runtime events, enums, and payloads: `Plans/Contracts_V0.md`
- persistence and restart recovery: `Plans/storage-plan.md`
- deterministic recovery defaults: `Plans/Decision_Policy.md`
- runtime command IDs: `Plans/UI_Command_Catalog.md`
- Context Lens control/action wiring rows: `Plans/Wiring_Matrix.md`
- chat, GUI, run graph, orchestrator, and wizard surfaces are consumers of the contracts above
- `Executor_Protocol.md` owns `blocked_sequence` minting and the restart-recovery to first `scheduler.pass` handoff from `startup_recovered`; `Contracts_V0.md` owns `/contracts/UI` payload implications; effective-resolution/runtime snapshots must carry `execution_role`; and `orchestrator-subagent-integration.md` must stop tier-rooted `/hook` coordination from losing attempt/worktree/permission/runtime joins such as `/worktree/permission/runtime`.

Precedence rules:
- legacy packet-era names such as `analysis_id`, `run.scheduler_analysis`, `allowed_actions[]`, and `recovery_options[]` are compatibility terms only
- when a consumer doc conflicts with the owner docs above, the owner docs win
- stale canonical text must be replaced or retired, not preserved by later additive notes alone
- Scheduler truth must not split among lexicographic, scored, and UI-derived recovery models across `Plans/Executor_Protocol.md`, `Plans/Progression_Gates.md`, `Plans/plan_graph.schema.json`, and `Plans/Run_Graph_View.md`; Crosswalk routes that contradiction to owner docs and requires one scheduler truth.

## Source Control, GitHub Actions, and Docker Manager Ownership Addendum (2026-03-12)

### SourceControlSurface

Owner: `Plans/GitHub_Integration.md` + `Plans/WorktreeGitImprovement.md`.

Rules:
- Git-local and Git-remote repo operations, history, graph, stash, conflicts, and worktree UX belong to Source Control.
- GitHub-hosted workflow/admin behavior does not belong to Source Control.
- Remote-first project-mode consequences route through the Source Control and SSH owner chain: `GitHub_Integration.md §C` owns remote git execution, reconnect budget, and SSH subprocess behavior, while FileManager, LSP, terminal, and GUI surfaces consume the remote project mode without silently substituting local files, local git, or local shells.
- Worktree lifecycle correctness remains owned by the worktree plan even when surfaced through Source Control.
- `Worktrees` remains the Source Control subview name for worktree-row-first routing; row metadata must include package/lane/run ownership and lifecycle state.
- Source Control and GitHub worktree views stay /worktree-centric while attaching package-lane and /seam/lane-aware visibility; legacy run/tier row ownership is compatibility metadata, not the shared worktree identity model. Archive and /prune/remove cleanup is gated by active-run ownership, unresolved blocked recovery, safe-point restore targeting that exact worktree/baseline, unresolved conflict inspection, and newer lineage operations depending on the lane/worktree.
- `Plans/WorktreeGitImprovement.md` owns `worktree_id`, base-branch, and worktree lifecycle semantics; canonical blocked-emitter behavior routes through Contracts and runtime owner docs instead of being inferred from Source Control rows.
- Source Control reconciles the legacy split across `FinalGUISpec`, `GitHub_Integration`, and `WorktreeGitImprovement`; `Git (GitHub)` is a migration alias only, and live `/surfaces` route through Source Control plus WorktreeGitImprovement rather than preserving a combined Git/GitHub panel.
- Direct git/diff command anchors are owned by `GitHub_Integration.md`: `cmd.git.stage`, `cmd.git.unstage`, `cmd.git.discard`, `cmd.git.diff_open`, and `cmd.git.diff_toggle_mode`. Chat rollback/recovery anchors such as `cmd.chat.rewind` and `cmd.chat.revert` remain owned by `UI_Command_Catalog.md`; Crosswalk only routes the boundary between git-native Source Control actions and chat-owned recovery commands.
- Per-project Source Control panel state, GitHub Actions panel state, richer Docker Manager state, and run receipts spanning SCM/Actions/Docker/Kubernetes are not underdefined local UI extras. They route through this Crosswalk as `/Actions/Docker/Kubernetes` ownership boundaries, then to the feature owners listed in this addendum.
- Orchestrator, Dashboard, history, and graph cards may expose cross-surface actions named exactly `Open in Source Control`, `Open in GitHub Actions`, and `Open in Docker Manager` when canonical context exists. The same actions are used by blocked cards and destination panels so requested action and effective outcome remain explainable.
- The canonical `panel-switch` navigation contract uses a shared `panel-context` envelope instead of panel-local ad hoc arguments. Every cross-surface deep link carries `project_id`; Source Control adds `repo_id`, `worktree_id`, optional `branch`, optional `commit`, optional `compare_target`, and optional `conflict_file`; GitHub Actions adds `repo_remote`, optional `workflow_id`, optional `run_id`, optional `job_id`, optional `step_id`, and optional `branch`; Docker Manager adds `runtime`, optional `context_name`, optional `compose_project`, optional `container_id`, optional `image_ref`, optional `registry_host`, optional `publish_result_id`, and optional Kubernetes context fields.
- `receipt-extension` payloads for SCM, Actions, Docker, Kubernetes, `/registry/Kubernetes/SSH`, and `/index/reference` flows extend the shared runtime `receipt` and blocked-payload packet with domain `capability` and identity refs; they do not create a second receipt, navigation, or index owner.
- Compatibility shorthands such as `/local-git` and `/worktree/push` route through `Primitive:PatchPipeline` and the Source Control owner docs. `conflict-precedence` follows this Crosswalk precedence plus the feature owner docs rather than consumer help text.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/UI_Command_Catalog.md

### GitHubActionsSurface

Owner: `Plans/GitHub_Integration.md` with auth/runtime constraints from `Plans/GitHub_API_Auth_and_Flows.md`.

Rules:
- GitHub Actions uses GitHub API identity and capability, not Git transport state, for hosted workflow/admin behavior.
- Current Branch / Workflows / Settings are separate subviews of one Actions surface.
- `GitHub API` remains hidden plumbing used by GitHub-hosted features; GitHub Actions owns hosted workflow runs, dispatch, run triage, Actions admin/settings, readiness constraints inherited from `newtools.md`, and reusable doctor IDs/result payloads rather than exposing API plumbing as a user panel.
- Final GUI migration labels such as `Git (GitHub)` and separate activity-bar entries for Docker or Source Control are routing aliases, not owner changes; Crosswalk resolves them to Source Control, GitHub Actions, and Docker Manager owners before wiring commands or state.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/newtools.md

### DockerManagerSurface

Owner: `Plans/Containers_Registry_and_Unraid.md` with readiness/result minima from `Plans/newtools.md`.

Rules:
- Docker Manager is the canonical umbrella for Docker, Podman, registries/Docker Hub, compose, build/bake, Publish / Unraid, and project-focused Kubernetes.
- Docker Manager is the umbrella for Docker/Podman/Kubernetes; `/Podman/Kubernetes` wording is a compatibility shorthand for alternate runtime plus project-focused Kubernetes subview ownership, not separate shell ownership.
- Unraid and Kubernetes are not required top-level shell surfaces for MVP.
- Docker Manager owns `/runtime/build/publish`, `/build/compose/registry/publish/Kubernetes`, and runtime/build/compose/registry/publish/Kubernetes project operations while reusing `newtools.md` doctor IDs and Docker publish/auth result payload shapes instead of inventing parallel IDs.
- Crosswalk routes Docker Manager persistence as global settings plus project-scoped state: subview, `/runtime/context`, and Kubernetes `/context/workload` focus are durable owner-handled state, while transient runtime observations remain projections owned by storage/runtime docs.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md

### External Reference Baselines

Additional external references beyond the user-supplied repos remain useful reconciliation inputs and should inform owner-doc wording without becoming live product owners. The baseline references are `git-scm.com/docs/git-worktree` (`/docs/git-worktree`) for worktree behavior; official VS Code Source Control / Git / Worktrees docs for graph/history/worktrees/stash/conflict, staging, `/committing`, `/fetch/pull/push`, incoming `/outgoing`, merge-conflict inline actions, 3-way merge editor, Source Control Graph, Timeline/history, and multiple SCM providers; GitHub Actions official REST/docs and extension baselines for rerun/cancel/workflow, `Current Branch`, `Workflows`, `Settings`, environments/variables/secrets, and authoring assistance; Docker Docs, Container Tools, and Docker DX for Bake, Compose profiles, Docker Hub repositories, Docker Desktop images/volumes/Kubernetes, runtime/registry/compose/container management, and authoring/debugging; Kubernetes docs for `logs`, `exec`, `port-forward`, rollout status, `/logs/exec/port-forward/Helm/workload`, and project-focused apply/logs/exec/port-forward/Helm/workload flows; and JetBrains / GitLens / GitKraken-style SCM UX references for dense history/conflict/graph behavior.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/UI_Command_Catalog.md

### Secondary-doc precedence constraints

When feature-owner docs disagree, this Crosswalk records the owner precedence and secondary-doc constraints rather than letting consumer wording decide. `newtools.md` owns Docker and Actions doctor IDs plus result payload minima; `doctor.registry.auth` is a deprecated alias only for DockerHub-specific flows and the preferred visible ID is `doctor.dockerhub.auth.capability`. `usage-feature.md` owns `cost_usage` routing and `/deep-link/usage` identity behavior to canonical Usage/Ledger surfaces. Section15 owns stable `/workspace/thread/browser/dev-session` identities, while UI_Wiring_Rules and Wiring_Matrix own command wiring `/gating`; internal built-in command namespaces remain `/internal`. `/blocked` routing is owned by Contracts_V0 and the destination feature owners, so Crosswalk only routes the boundary instead of retyping blocked-state payloads locally. Source Control and Orchestrator wording must keep `safe point` distinct from `restore point`. Legacy `allowed_actions[]` is compatibility-only; canonical blocked and recovery payloads use ordered `allowed_action_ids[]`.
- HITL approval requests may use an explicit action-list vocabulary only where Contracts_V0 owns the request shape; blocked/recovery payloads stay on canonical action-id / `allowed_action_ids[]` naming so implementers do not guess between HITL and recovery fields.
- Secondary broad-pass constraints: chat and file-tree docs remain consumers of the legacy Git/GitHub model and must be reconciled alongside the feature-owner docs; `git*` and `actions*` remain built-in chat command namespaces; Docker/registry/Kubernetes operational identity is not owned by Multi-Account unless a later owner doc explicitly moves it; `/underdefined` UI-state contracts must be resolved in the named surface owner docs rather than by adding consumer-only state; prescriptive `recovery_options` or `recovery_options[]` wording must be retired in favor of `allowed_action_ids` and `allowed_action_ids[]`.

ContractRef: ContractName:Plans/newtools.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/human-in-the-loop.md

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Crosswalk.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### C-001 - Crosswalk (Canonical) Source-Preserving PlanUnit

```yaml
plan_unit_id: C-001
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: Plans/Crosswalk.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/Crosswalk.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Crosswalk-S0035
preserved_exact_tokens:
- Crosswalk (Canonical)
- Canonical owner-section requirements
- Coverage blocker worktree allocation strategy
- Route/open compatibility-only fallback marking
- 0. Scope
- 'ContractRef: Primitive:Crosswalk'
- 1. Precedence (anti-drift)
- 'ContractRef: PolicyRule:Decision_Policy.md§2, SchemaID:Spec_Lock.json'
- 2. Primitive index (definitions are DRY)
- 2.1 Canonical primitive entries
- 'ContractRef: ContractName:Contracts_V0.md, SchemaID:Spec_Lock.json'
- Route target navigation rules
- Open subject navigation rules
- 3.3 Navigation and source-open ownership
- 3.4 Source Control and lane/worktree ownership
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Models_System.md, ContractName:Plans/FileManager.md'
- 3.5 Assistant thread worktree binding ownership
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/DRY_Rules.md'
- 3.6 Projection-state ownership
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md'
- 3.7 Subagent, crew, and context-shaping ownership
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md'
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md'
negative_constraints:
- '- feature/surface docs may consume these states but MUST NOT redefine the axes or collapse them into one field'
- Per-surface docs may narrow these behaviors, but MUST NOT redefine the owners above.
- '- consumer docs may name required permission keys or blocked triggers but MUST NOT redefine the approval-scope contract'
- '- Orchestrator/GUI/chat docs consume remediation state but MUST NOT redefine remediation enums or ceiling behavior'
- '- `Plans/Section15_MVP_Promoted_Features_Spec.md` is the shell-level owner for terminal placement plus shell/session identities across `Plans/**` consumers, including `/session` behavior that downstream docs may route to but must not redefine'
- '- consumer docs may extend display metadata but MUST NOT redefine terminal or event identity primitives'
- '- Blocking rewrite owners route through existing docs: `Plans/orchestrator-subagent-integration.md` owns the core execution model, `Plans/FinalGUISpec.md` must retire Tiers/linear navigation assumptions, and `Plans/FileSafe.md` must not let a strict Phase/Task/Subtask hierarchy block package-based p'
- '- `FileManager.md` and `/navigation` consumers must not make `OpenFile` the universal navigation primitive; identity-native document, artifact, runtime, and governance opens normalize through `OpenSubject` or object routes first.'
- '- Project and panel navigation stay route-consuming: `cmd.project.open` must not mutate `shell-state`, panel `/subview` entries such as `Source Control` may be landed by route identity, and that route must not become a full serialized `source_control.project_state` owned by the surface.'
- '- Permissioned interview/chat flows route `Plans/Permissions_System.md`, `Plans/assistant-chat-design.md`, and `Plans/interview-subagent-integration.md` as the owner set for approval, chat, and interview behavior; preview/browser `trust_tier` must not be reused as a generic `projection-state` term.'
- '- `Plans/Glossary.md`, `Plans/FinalGUISpec.md`, `Plans/assistant-chat-design.md`, `Plans/human-in-the-loop.md`, and `Plans/interview-subagent-integration.md` remain consumer/owner surfaces for terminology, shell/chat, approval, and interview behavior. `cmd.panel.switch` is panel-centric and too shal'
- '- `operational_identity` records the external side-effect target context in play: GitHub org/repo/workflow/job and `/repo/workflow/job`, Docker context/image/publish target and `/image/publish`, Kubernetes context/namespace/workload and `/namespace/workload`, plus other environment-specific target i'
- '- Attention and `/CtA` surfaces are route consumers: local field conventions must normalize to the generalized `route-target` model, and most identifiers in navigation payloads must not become top-level canonical `route_target` fields. `generated://<artifact_id>` is resolved source transport chosen '
- '- Project/artifact/file surfaces must route by `project_id`, `attempt_id`, generated `/runtime` subject identity, and `/artifact/file` pivots. `resume_url` must not outrank generic `UICommand.args`, and normalized `open in X` / `show in Y` actions become thin wrappers rather than independent navigat'
- '- Scheduler truth must not split among lexicographic, scored, and UI-derived recovery models across `Plans/Executor_Protocol.md`, `Plans/Progression_Gates.md`, `Plans/plan_graph.schema.json`, and `Plans/Run_Graph_View.md`; Crosswalk routes the `/Progression_Gates.md`, `/plan_graph.schema.json`, and '
- '- Orchestrator/Evidence surface copy such as `Open in Editor` must not imply raw-path opens for artifact-backed or report-backed subjects; those actions normalize to `OpenSubject`, `Open Artifact`, `Open Report`, or object routes before any path realization.'
- '- `Send selection to chat` is a thread-scoped chip/handoff path; it must not be collapsed into the durable `/annotation` lifecycle, and it does not create patch-apply semantics.'
- '- Targeted revision MUST NOT trigger Multi-Pass Review.'
- '- V1 is note-based embedded-document review upgraded into structured annotations; direct `patch-apply` behavior is out of scope.'
- '- docs and implementations must not use these terms interchangeably'
- '- Scheduler truth must not split among lexicographic, scored, and UI-derived recovery models across `Plans/Executor_Protocol.md`, `Plans/Progression_Gates.md`, `Plans/plan_graph.schema.json`, and `Plans/Run_Graph_View.md`; Crosswalk routes that contradiction to owner docs and requires one scheduler '
compatibility_only_notes:
- '### Route/open compatibility-only fallback marking'
- '- If older naming exists, refer to it only as "legacy naming" (do not quote it).'
- '- Blocking rewrite owners route through existing docs: `Plans/orchestrator-subagent-integration.md` owns the core execution model, `Plans/FinalGUISpec.md` must retire Tiers/linear navigation assumptions, and `Plans/FileSafe.md` must not let a strict Phase/Task/Subtask hierarchy block package-based p'
- '- `FileManager.md` stays the path-based editor realization owner: `OpenFile` handles workspace paths, line/range selection, and editor chrome, while `route-target` / `OpenSubject` own cross-surface identity navigation and `/open-by-identity` compatibility transport.'
- '- Crosswalk owns the navigation `primitive-boundary` declaration for `route-target` and `subject-open` navigation. `route-target` and `subject-open` identify the canonical route/open boundary, while `resume_url` and `/open-by-identity` are transport or compatibility expressions that must serialize t'
- '- The route-target and subject-open primitive boundary covers `/open-by-identity` as compatibility transport when kept tight: one canonical primitive may span route-target navigation and subject-open/open-by-identity behavior only if it preserves the shared route/open identity contract.'
- '- This primitive now covers durable document annotations on the legacy `note_record.v1` substrate.'
- '- legacy packet-era names such as `analysis_id`, `run.scheduler_analysis`, `allowed_actions[]`, and `recovery_options[]` are compatibility terms only'
- '- Source Control and GitHub worktree views stay /worktree-centric while attaching package-lane and /seam/lane-aware visibility; legacy run/tier row ownership is compatibility metadata, not the shared worktree identity model. Archive and /prune/remove cleanup is gated by active-run ownership, unresol'
- '- Source Control reconciles the legacy split across `FinalGUISpec`, `GitHub_Integration`, and `WorktreeGitImprovement`; `Git (GitHub)` is a migration alias only, and live `/surfaces` route through Source Control plus WorktreeGitImprovement rather than preserving a combined Git/GitHub panel.'
- '- Compatibility shorthands such as `/local-git` and `/worktree/push` route through `Primitive:PatchPipeline` and the Source Control owner docs. `conflict-precedence` follows this Crosswalk precedence plus the feature owner docs rather than consumer help text.'
- '- Docker Manager is the umbrella for Docker/Podman/Kubernetes; `/Podman/Kubernetes` wording is a compatibility shorthand for alternate runtime plus project-focused Kubernetes subview ownership, not separate shell ownership.'
- When feature-owner docs disagree, this Crosswalk records the owner precedence and secondary-doc constraints rather than letting consumer wording decide. `newtools.md` owns Docker and Actions doctor IDs plus result payload minima; `doctor.registry.auth` is a deprecated alias only for DockerHub-specif
- '- Secondary broad-pass constraints: chat and file-tree docs remain consumers of the legacy Git/GitHub model and must be reconciled alongside the feature-owner docs; `git*` and `actions*` remain built-in chat command namespaces; Docker/registry/Kubernetes operational identity is not owned by Multi-Ac'
stale_retired_dispositions:
- '**Freshness / health projection:** Thread worktree binding state follows the two-dimensional projection model (freshness=current|refreshing|stale × health=healthy|degraded|unavailable) defined in storage-plan.md §Projection state.'
- '- `Decision_Policy.md` owns behavior when stale, degraded, or unavailable state affects execution or mutation gating'
- '- Strong stale consumers such as `Plans/FinalGUISpec.md` and `Plans/chain-wizard-flexibility.md` must reference the route-target/subject-open boundary rather than continuing surface-local navigation assumptions.'
- '- Downstream navigation fields such as `usage_event_ref`, `wizard_step`, direct artifact/document `IDs`, `/document`, and other special-case top-level fields must normalize to the owner-level route/open model. This seam is owner-level, not consumer-level: fixing `Orchestrator_Page.md`, `Orchestrator'
- '- Conflicting or stale mutating annotations are excluded from automatic revision until resolved.'
- '- Future-phase risk tags for this primitive are explicit and non-blocking: `/future-phase`, `/risk`, `/providers`, `/conflicts`, `revision-prompt`, `thread-target`, `send-to-chat`, `sensitivity-aware`, `/stale`, and `/degradation`.'
- '- stale canonical text must be replaced or retired, not preserved by later additive notes alone'
- When feature-owner docs disagree, this Crosswalk records the owner precedence and secondary-doc constraints rather than letting consumer wording decide. `newtools.md` owns Docker and Actions doctor IDs plus result payload minima; `doctor.registry.auth` is a deprecated alias only for DockerHub-specif
- '- Secondary broad-pass constraints: chat and file-tree docs remain consumers of the legacy Git/GitHub model and must be reconciled alongside the feature-owner docs; `git*` and `actions*` remain built-in chat command namespaces; Docker/registry/Kubernetes operational identity is not owned by Multi-Ac'
owner_boundary_notes:
- '# Crosswalk (Canonical)'
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- PUPPET MASTER -- CANONICAL CROSSWALK
- This document is a **boundary map**, not an implementation plan.
- '### 2.1 Canonical primitive entries'
- This file uses primitive names as **routing labels** only; detailed schemas belong to their SSOT documents.
- '- `Primitive:RouteTarget` -- canonical route, focus, and cross-surface target identity boundary for GUI, CLI, help, and service navigation. `resume_url`, `route_target`, and `/open-by-identity` serialize or transport this identity; they do not own it.'
- 'Route targets and open subjects are the canonical way to name destinations and inspection points across GUI, CLI, help, and underlying services. This section clarifies the boundary: ownership and canonical semantics live in Plans/Contracts_V0.md; this section explains how surfaces navigate them.'
- '- `github://owner/repo/path` → GitHub repository (requires auth and branch access)'
- 3. Crosswalk describes which surfaces can open which types; canonical ownership rules are in Contracts_V0.md.
- '`Plans/FileManager.md` owns path-based editor realization only: `OpenFile` handles workspace paths, line/range selection, editor chrome, and code-navigation clicks after a canonical path is known. Cross-surface `route-target` / `OpenSubject` navigation, `/open-by-identity`, and identity-native docum'
- 'Source Control and `Plans/WorktreeGitImprovement.md` own Git/worktree object navigation and worktree lifecycle; `Plans/FileManager.md` only preserves path/root context when handing off to that route. Worktree selection, `open-in-SCM`, and Source Control pivots are object navigation, not pure layout '
- '| Aspect | Owner doc | Consumer docs |'
- Projection freshness/health vocabulary is owned centrally so consumer docs do not invent surface-local degraded-state semantics.
- 'Canonical ownership is:'
- Subagent and crew ownership is intentionally split across owner docs. Each concern has one authoritative home.
- '| Concern | SSOT owner |'
- 'Canonical HITL ownership is:'
- '- `Contracts_V0.md` owns the canonical blocked-episode fields, action ids, and persisted payload shapes'
- 'Canonical debug/investigation ownership is:'
- 'Canonical permission ownership is:'
- '- `Contracts_V0.md` owns canonical blocked payload shapes, `approval_scope_key`, and action-id field names'
owner_hints:
- Plans/Crosswalk.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `b3ab29d3fdfc69b5ac8ad8d1f6c9d2873085fa86f03b37bb459fba8bf6e57564`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Crosswalk-S0001` through `Crosswalk-S0035` are preserved in place and mapped in `coverage_map.jsonl` to `C-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
