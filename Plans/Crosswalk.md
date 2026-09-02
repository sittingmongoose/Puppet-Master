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

Crosswalk precedence chooses the sole owner and compatibility route; it does not
replace that owner's accepted semantic contract with copied Crosswalk prose. Once
an owner is selected here, the newest accepted PlanUnit in that owner document
controls its domain fields, state machine, commands, receipts, availability, and
negative requirements. Older Crosswalk examples remain compatibility lineage when
a later accepted owner PlanUnit explicitly supersedes their surface identity.

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
| Settings (10 keys) | assistant-chat-design.md | Settings_System.md, storage-plan.md, FinalGUISpec.md |
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
- `FinalGUISpec.md` owns shared GUI disclosure grammar; `Settings_System.md` owns its Settings-surface realization
- feature/surface docs may consume these states but MUST NOT redefine the axes or collapse them into one field

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Settings_System.md

### 3.6A Settings system ownership

`Plans/Settings_System.md` is the sole owner for the Settings shell and information architecture, all persisted ordinary setting values' Project binding, fresh/no-Project defaults, All Settings search/facets/variable-height virtualization, atomic mutation and Restore Defaults, detached exact-ID Project transfer, manager grammar, and Settings-to-domain routing.

`Plans/settings_inventory.json` remains the 828-ID ordinary-setting machine inventory. Its scope metadata routes applicability and domain ownership but does not authorize non-Project persistence. `Plans/FinalGUISpec.md` retains shared application-shell and theme-token ownership; Storage retains physical persistence; Permissions/FileSafe/Multi-Account retain authority and credential custody; Shared Integration Runtime plus Commands/Catalog/Wiring retain lifecycle commands; provider, Server, Project Sync, Browser, SCM, Docker Manager, Onboarding, Doctor, and testing docs retain runtime truth. Settings consumes those owners and must not implement peer operations.

K3 Tome Tabs and generated PMConcept7 T44 are geometry/concept lineage, not runtime authority or certification. Later Server First Backbone, Egolite/Hermes/Origin/Browser/SCM, Full Thread Performance, Onboarding/Doctor Correction, and Settings Bakeoff decisions supersede K3 content and behavior through SSYS-001..SSYS-017.

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/settings_inventory.json, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Shared_Integration_Runtime.md

### 3.6B Packet-authoritative system ownership

The 2026-08-31 owner wave is a DRY routing split, not a new umbrella runtime:

| Primitive or behavior | Sole semantic owner | Primary consumers and exclusions |
|---|---|---|
| Project identity and lifecycle | `Plans/Project_System.md` | Settings, Onboarding, Planning Wizard, File Manager; excludes SCM engines, Vault movement, and backup. |
| Named Plan identity and lifecycle | `Plans/Named_Plan_System.md` | Planning Wizard, Goals, Settings; excludes plan interview/compile ownership. |
| Server catalog, identity, trust, pairing, endpoints, discovery, clients, lifecycle | `Plans/Server_System.md` | Settings, Onboarding, Doctor; visibility never equals consent or trust. |
| Remote route policy, migration, exposure, and continuity | `Plans/Remote_Access_System.md` | Server, Settings, Doctor; owns the PM-managed connector and route provenance but excludes Server identity, generic transport ownership, and the user's external host-Tailscale installation. |
| Project and Full Server backup/recovery | `Plans/Backup_Restore_System.md` | Settings, Bootstrap/Product Onboarding restore paths, Files, Projects, Source Control/JJ, and Doctor; RecoverySet/Kit, destination, snapshot, retention, browse, and restore semantics remain owner-only, and ordinary secret bytes stay excluded unless separately recovery-enveloped. |
| Explicit test capture and motion evidence | `Plans/Test_Capture_and_Motion_Evidence.md` | Final GUI, Automated Testing, Runtime Artifacts; protected AuthBrowserSession and native-certification promotion are forbidden. |
| Common source-control repository/workspace operations | `Plans/Source_Control_System.md` | Project System, File Manager, Settings, Guided Tour, and Backup source-closure consumption; excludes forge, Backup byte/restore, and JJ-specific semantics. |
| JJ-specific operations | `Plans/Jujutsu_Integration.md` | Source Control and Project consumers; canonical namespace is `cmd.jujutsu.*`, with `cmd.jj.*` compatibility only. |
| Hosted-forge reviews, pipelines, repositories, webhooks, mirrors, and automation binding | `Plans/Forge_Integrations.md` | GitHub/GitLab/Azure DevOps/Bitbucket/Cursor Origin plus distinct Forgejo and Gitea consumers; RepositoryForgeBinding and AutomationBinding remain independent, and provider-specific primary command namespaces are forbidden. |
| Cursor Origin Preview | `Plans/Cursor_Origin_Integration.md` | Common forge/SCM flow only; no SCM backend, dedicated rail/panel, Onboarding subsystem, or `cmd.origin.*`. |
| GitLab, Azure DevOps, Bitbucket provider projections | Their eponymous integration docs | Consume common forge/auth/install/connection contracts; do not fork common state machines. |
| PM-native Browser and protected AuthBrowserSession | `Plans/Section15_MVP_Promoted_Features_Spec.md` | AuthBrowserSession remains human-only, ephemeral, non-recordable, non-inspectable, non-exportable, and unavailable to agents/adapters. |
| Product Onboarding and Guided Tour orchestration | `Plans/Planning_Wizard.md` | Bounded nine-stage modal Onboarding, six-stage connect-existing shortcut, review-before-apply setup plan, and directed live-workspace Tour in Usage -> Planning Wizard -> Assistant Chat/Teacher order; local Safe History backend and optional online forge copy remain independent selections, and every mutation routes to the named system owner. |
| Doctor registry and remediation routing | `Plans/newtools.md` N2-151 | Domain owners retain probe truth and repair; Doctor performs no private mutation. |

Settings and Final GUI are projections/interaction consumers of these owners. Static schemas, fixtures, PMConcept7 simulations, browser tests, and packet audits do not prove native handlers, runtime readiness, WAN operation, recovery execution, or Slint certification.

ContractRef: ContractName:Plans/Project_System.md, ContractName:Plans/Named_Plan_System.md, ContractName:Plans/Server_System.md, ContractName:Plans/Remote_Access_System.md, ContractName:Plans/Backup_Restore_System.md, ContractName:Plans/Test_Capture_and_Motion_Evidence.md, ContractName:Plans/Source_Control_System.md, ContractName:Plans/Jujutsu_Integration.md, ContractName:Plans/Forge_Integrations.md, ContractName:Plans/Cursor_Origin_Integration.md, ContractName:Plans/GitLab_Integration.md, ContractName:Plans/Azure_DevOps_Integration.md, ContractName:Plans/Bitbucket_Integration.md

### 3.6C Forge, Backup, And PM Connector Routing

The 2026-09-01 post-integration packet changes specific cross-owner seams without
creating an umbrella owner:

| Routed concern | Semantic owner | Crosswalk rule |
|---|---|---|
| Repository host, account, review, release, pipeline, runner, and automation-service identity | `Plans/Forge_Integrations.md` | Forgejo and Gitea are distinct. `RepositoryForgeBinding` does not imply `AutomationBinding`; the canonical occupant is `repository_automation` / **Actions & Pipelines**. `github_actions` is migration input that restores a GitHub automation binding, not a peer panel or provider-neutral dispatch authority. |
| Local Git/JJ repository and workspace truth | `Plans/Source_Control_System.md` plus `Plans/Jujutsu_Integration.md` for JJ-specific semantics | Source Control supplies exact native revision, closure, barrier/fence, merge/rebind, and remote-validation truth. It never owns Backup bytes/RestoreRun or Forge automation authority. |
| Backup destinations, repositories, RecoverySet/Kit, immutable snapshots/capture sets, retention, browse, retrieve, and restore | `Plans/Backup_Restore_System.md` | Files, Projects, SCM/JJ, Settings, Onboarding, Doctor, and GUI are consumers. Reverse routes retain the exact repository/snapshot/capture-set/filter/focus and never select latest after refresh. |
| Server identity, trust, pairing, catalog, and endpoint association | `Plans/Server_System.md` | Route visibility or connector membership never proves identity, trust, pairing, or deduplication. |
| PM-managed connector, private ingress/egress, Headscale, hosted Funnel, route policy, and route provenance | `Plans/Remote_Access_System.md` | One connector identity belongs to one stable PM Server. Connector-private, hosted Funnel, and external host-managed routes stay distinct; the connector does not adopt or manage the user's host Tailscale installation. |
| Shared auth/profile, protected browser, governor, ObservableWork, lease, and outbox primitives | Their existing Multi-Account, protected-browser, Permissions, and `Plans/Shared_Integration_Runtime.md` owners | Forge, Backup, and Remote Access consume exact refs and continuations. None gains a peer auth broker, scheduler, secret store, supervisor, or EventRecord authority. |
| Persistence, redaction, and migration custody | `Plans/storage-plan.md` and its registries | Domain records are registered by reference to owner schemas; storage does not become the domain owner and raw keys, tokens, connector state, protected browser content, and foreign absolute paths remain excluded. |

All affected navigation consumes `Contracts_V0.md` CV-327. A route has exactly one
primary selector; repository, binding, snapshot, capture-set, Server, endpoint,
provenance, generation, filter, focus, and return refs are bounded context only.
Fresh Full Server recovery uses Bootstrap scope before a Project exists rather
than fabricating a Project identity. Protected continuations return through an
immutable normalized route ref after owner currentness validation and carry no
protected content.

This routing closure is static canon only. It admits no handler, provider,
connector, restore engine, EventRecord, native Slint surface, or runtime/security/
visual/readiness evidence.

ContractRef: ContractName:Plans/Contracts_V0.md#CV-327, ContractName:Plans/Forge_Integrations.md#FGI-012, ContractName:Plans/Backup_Restore_System.md#BRS-014, ContractName:Plans/Remote_Access_System.md#RAS-015, ContractName:Plans/Source_Control_System.md#SCS-014, ContractName:Plans/Server_System.md#SRV-013

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
- Surface-specific state remains owner-handled: Source Control `active_subview`, selected repo/worktree, compare target, and graph filters; Actions & Pipelines `active_subview`, independent `automation_binding_id`, current branch, pinned definitions, and last opened run `/job`; Docker Manager `active_subview` plus runtime `/context/registry/namespace` focus; Document pane selected document/view/history/approval state; `/selection` and `/worktree` focus are routing identities, not consumer-owned local state. Legacy GitHub Actions state is accepted only as migration input for a GitHub automation binding.
- Multi-account switch/pressure behavior routes to `Plans/Multi-Account.md`; durable switch-history storage and `/pressure` joins must align with scheduler dispatch plus usage/storage identity fields rather than remaining account-only notes. `Plans/Provider_OpenCode.md` owns provider-specific transport-vs-upstream identity and full auth/account runtime disclosure, while Crosswalk only routes the `/account` boundary.
- Cross-owner seam routing may name future Projects `/attention-center` docs, `Plans/Runtime_Artifacts_Panel.md`, and `/Runtime_Artifacts_Panel.md` alongside `Plans/storage-plan.md`, `Plans/FinalGUISpec.md`, `Plans/Contracts_V0.md`, `Plans/UI_Command_Catalog.md`, and `Plans/assistant-chat-design.md`; these names mark implicated owner surfaces, not a license for consumer-only navigation or artifact state.
- Existing navigation mechanisms such as the command palette, `preview_subject_id`, `resume_url` deep links for wizard `/interview` recovery, `Show in Ledger`, `Show in Usage`, Orchestrator pivots into Source Control/Actions & Pipelines/Docker Manager, chat and thread navigation, open-file contracts, and local tab search/filter normalize to route-target/OpenSubject recipes rather than letting any consumer make `resume_url` or open-file behavior the owner.
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
- UX-facing wrapper commands such as `cmd.panel.switch`, compatibility thread-usage aliases, `cmd.artifacts.show_in_usage`, `cmd.orchestrator.open_in_source_control`, and `cmd.project.open` remain searchable surface lineage, but they are not the universal navigation primitive; legacy `cmd.chat.open_thread_usage` and related thread-usage callers normalize to `cmd.nav.open_usage_subject` or the Context Detail Pane command family before dispatch, while `Plans/FinalGUISpec.md`, `Plans/Contracts_V0.md`, and `Plans/assistant-chat-design.md` consume the shared primitive boundary instead of replacing it.
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
- Cross-tab navigation is a design contract: important objects and `/events` must be deep-linkable across Progress, Plan Compile, Seams, Node Graph, Evidence, History, and Ledger, while cross-tab routes preserve `/filter/select` target context instead of merely switching tabs. Adjacent `durable-object` patterns require blocked episodes, annotations, and review outputs to preserve identity, anchoring, lifecycle, and unresolved findings rather than collapse everything into one `/fail` result.
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

## Source Control, Actions & Pipelines, and Docker Manager Ownership Addendum (2026-03-12; scoped supersession 2026-09-01)

The 2026-09-01 FGI-012/F3-528 owner transaction supersedes this addendum's
generic GitHub-Actions occupant wording. GitHub-specific behavior remains valid
inside an explicit GitHub `AutomationBinding`; the canonical provider-neutral
occupant and route are `repository_automation` / **Actions & Pipelines**.

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
- Per-project Source Control panel state, Actions & Pipelines state, richer Docker Manager state, and run receipts spanning SCM/automation/Docker/Kubernetes are not underdefined local UI extras. They route through this Crosswalk as `/Actions/Docker/Kubernetes` ownership boundaries, then to the feature owners listed in this addendum.
- Orchestrator, Dashboard, history, and graph cards may expose cross-surface actions named exactly `Open in Source Control`, `Open in Actions & Pipelines`, and `Open in Docker Manager` when canonical context exists. `Open in GitHub Actions` is a migration-read label that normalizes to the same automation occupant with a GitHub binding. The same actions are used by blocked cards and destination panels so requested action and effective outcome remain explainable.
- The canonical `panel-switch` navigation contract consumes `route_target` instead of panel-local ad hoc arguments. Every cross-surface deep link carries explicit scope and one primary selector; Source Control adds exact repository/worktree context, Actions & Pipelines binds `automation_binding_id`, `binding_generation`, `currentness_ref`, and provider-native definition/run/job/step identity, and Docker Manager adds its owner-defined runtime/context/resource refs. These are validated context refinements, not peer selectors or copied domain records.
- `receipt-extension` payloads for SCM, Actions, Docker, Kubernetes, `/registry/Kubernetes/SSH`, and `/index/reference` flows extend the shared runtime `receipt` and blocked-payload packet with domain `capability` and identity refs; they do not create a second receipt, navigation, or index owner.
- Compatibility shorthands such as `/local-git` and `/worktree/push` route through `Primitive:PatchPipeline` and the Source Control owner docs. `conflict-precedence` follows this Crosswalk precedence plus the feature owner docs rather than consumer help text.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/UI_Command_Catalog.md

### GitHubActionsSurface (GitHub-binding compatibility name)

Owner split: `Plans/Forge_Integrations.md` owns `AutomationBinding` and the
provider-neutral occupant; `Plans/GitHub_Integration.md` owns GitHub-specific
behavior with auth/runtime constraints from `Plans/GitHub_API_Auth_and_Flows.md`.

Rules:
- A GitHub automation binding uses GitHub API identity and capability, not Git transport state, for hosted workflow/admin behavior; other bindings use their own provider adapter and capability profile.
- Current Branch / Workflows / Settings are separate subviews of one Actions surface.
- `GitHub API` remains hidden plumbing used by GitHub-hosted features; Forge Integrations owns the provider-neutral automation binding and the GitHub adapter retains GitHub-specific workflow runs, dispatch, triage, Actions admin/settings, readiness constraints, and reusable Doctor payloads without exposing API plumbing as a user panel.
- Final GUI migration labels such as `Git (GitHub)` or `github_actions` and separate activity-bar entries for Docker or Source Control are routing aliases, not owner changes; Crosswalk resolves them to Source Control, Actions & Pipelines, and Docker Manager owners before wiring commands or state.

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

### C-002 - Crosswalk Owner Section Canonicality

```yaml
plan_unit_id: C-002
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Crosswalk is canonical live specification text for owner-section requirements
  and preserves product, runtime, storage, UI, and governance details in
  owner-section form while acting as the owner-boundary map.
gui_related: true
gui_classification_reason: The owner-section requirement explicitly includes UI details and user-visible surface boundaries.
split_recommended: false
depends_on: []
unblocks: [C-003, C-004]
acceptance_criteria:
  - "Crosswalk remains canonical live specification text for this owner document."
  - "Product, runtime, storage, UI, and governance details are preserved in owner-section form."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: crosswalk_owner_section_loss
reasoning_tier: standard
context_scope: crosswalk_owner_section_canonicality
implementation_surfaces:
  - Plans/Crosswalk.md
node_compile_hint:
  mode: crosswalk_owner_section_canonicality
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0002
preserved_exact_tokens:
  - "Crosswalk (Canonical)"
  - "Canonical owner-section requirements"
  - "product, runtime, storage, UI, and governance details"
negative_constraints: []
owner_hints:
  - Plans/Crosswalk.md
```

### C-003 - Compliance Naming And Compatibility Fallback

```yaml
plan_unit_id: C-003
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Crosswalk follows DRY_Rules, references SSOT contracts in Contracts_V0,
  uses the platform name Puppet Master only, treats older naming as legacy
  naming, and preserves route/open compatibility-only fallback marking.
gui_related: false
gui_classification_reason: This unit defines naming, compliance, and compatibility constraints rather than UI presentation.
split_recommended: false
depends_on: [C-002]
unblocks: [C-004, C-006]
acceptance_criteria:
  - "Crosswalk references SSOT contracts in Plans/Contracts_V0.md and follows Plans/DRY_Rules.md."
  - "The platform name is Puppet Master only."
  - "Older naming is referred to only as legacy naming."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: naming_compatibility_drift
reasoning_tier: standard
context_scope: compliance_naming_compatibility_fallback
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/DRY_Rules.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: compliance_naming_compatibility_fallback
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0003
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0004
preserved_exact_tokens:
  - "Coverage blocker worktree allocation strategy"
  - "Route/open compatibility-only fallback marking"
  - "Puppet Master"
  - "legacy naming"
negative_constraints:
  - "If older naming exists, refer to it only as legacy naming."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/DRY_Rules.md
  - Plans/Contracts_V0.md
```

### C-004 - Crosswalk Boundary Map Scope

```yaml
plan_unit_id: C-004
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Crosswalk is a boundary map, not an implementation plan; it assigns
  authoritative primitive ownership so plan documents remain DRY.
gui_related: false
gui_classification_reason: This unit defines document scope and ownership routing.
split_recommended: false
depends_on: [C-002, C-003]
unblocks: [C-005, C-006]
acceptance_criteria:
  - "Crosswalk is treated as a boundary map rather than an implementation plan."
  - "Primitive ownership assignments keep plan documents DRY."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: crosswalk_scope_overreach
reasoning_tier: standard
context_scope: crosswalk_boundary_map_scope
implementation_surfaces:
  - Plans/Crosswalk.md
node_compile_hint:
  mode: crosswalk_boundary_map_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0005
preserved_exact_tokens:
  - "`boundary map`"
  - "`Primitive:Crosswalk`"
negative_constraints:
  - "Crosswalk must not become an implementation plan."
owner_hints:
  - Plans/Crosswalk.md
```

### C-005 - Crosswalk Anti-Drift Precedence

```yaml
plan_unit_id: C-005
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Crosswalk conflict resolution follows the anti-drift precedence order:
  Spec_Lock.json, Crosswalk, DRY_Rules, Glossary, and Decision_Policy.
gui_related: false
gui_classification_reason: This unit defines governance precedence rather than user-visible UI.
split_recommended: false
depends_on: [C-004]
unblocks: [C-006]
acceptance_criteria:
  - "Conflicts between plan documents are resolved through the stated precedence order."
  - "Decision_Policy.md§2 and Spec_Lock.json references remain preserved."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: anti_drift_precedence_loss
reasoning_tier: high
context_scope: crosswalk_anti_drift_precedence
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Spec_Lock.json
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: crosswalk_anti_drift_precedence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0006
preserved_exact_tokens:
  - "`Plans/Spec_Lock.json`"
  - "`Plans/DRY_Rules.md`"
  - "`Plans/Glossary.md`"
  - "`Plans/Decision_Policy.md`"
  - "ContractRef: PolicyRule:Decision_Policy.md§2, SchemaID:Spec_Lock.json"
negative_constraints:
  - "Consumer wording must not override Crosswalk's stated precedence order."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Decision_Policy.md
```

### C-006 - Primitive Routing Labels And SSOT Ownership

```yaml
plan_unit_id: C-006
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Crosswalk uses primitive names as routing labels only; detailed schemas belong
  to their SSOT documents, including Provider, Tool, UICommand, SessionStore,
  PatchPipeline, DocumentPane, DocumentReviewSurface, ReviewFindingsSummary,
  ReviewApprovalGate, DocumentCheckpoint, RouteTarget, OpenSubject, and
  AuthState.
gui_related: true
gui_classification_reason: The primitive index includes UICommand, DocumentPane, review surfaces, route targets, and open subjects that affect user-visible navigation and controls.
split_recommended: false
depends_on: [C-004, C-005]
unblocks: [C-007, C-008, C-009]
acceptance_criteria:
  - "Primitive names are routing labels only."
  - "Detailed schemas remain in their SSOT documents."
  - "RouteTarget and OpenSubject ownership stays in Contracts_V0."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: primitive_schema_ownership_drift
reasoning_tier: high
context_scope: primitive_routing_labels_ssot_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: primitive_routing_labels_ssot_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0007
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0008
preserved_exact_tokens:
  - "`Primitive:RouteTarget`"
  - "`Primitive:OpenSubject`"
  - "`Primitive:UICommand`"
  - "`Primitive:DocumentPane`"
  - "ContractRef: ContractName:Contracts_V0.md, SchemaID:Spec_Lock.json"
negative_constraints:
  - "Crosswalk must not redefine detailed primitive schemas owned by SSOT documents."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
```

### C-007 - Route Target Navigation Cascade

```yaml
plan_unit_id: C-007
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  CLI route arguments and GUI Save buttons resolve route_target strings through
  the canonical cascade for file, GitHub, workspace, SharePoint, and Notion
  routes; ambiguous routes use the active Persona default route, while
  Contracts_V0 and Models_System own the decision that flows through to UI.
gui_related: true
gui_classification_reason: This unit governs GUI Save behavior and cross-surface navigation resolution.
split_recommended: false
depends_on: [C-006]
unblocks: [C-008, C-024]
acceptance_criteria:
  - "CLI -r/--route and GUI Save actions resolve route_target strings through the documented cascade."
  - "Ambiguous routes use the active Persona default route."
  - "Crosswalk documents flow-through and does not own the underlying route decision."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_target_navigation_drift
reasoning_tier: high
context_scope: route_target_navigation_cascade
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
node_compile_hint:
  mode: route_target_navigation_cascade
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0009
preserved_exact_tokens:
  - "`file://...`"
  - "`github://owner/repo/path`"
  - "`workspace://project/concern`"
  - "`share://sharepoint-url`"
  - "`notion://...`"
negative_constraints:
  - "Route-target decisions must not become Crosswalk-owned implementation behavior."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
```

### C-008 - OpenSubject Navigation Normalization

```yaml
plan_unit_id: C-008
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  GUI Open and Inspect buttons normalize open requests to OpenSubject and route
  through orchestrator concern/help/artifact resolution; Crosswalk describes
  openable subject types while Contracts_V0 owns canonical OpenSubject rules.
gui_related: true
gui_classification_reason: This unit governs GUI Open and Inspect button normalization.
split_recommended: false
depends_on: [C-006, C-007]
unblocks: [C-009, C-024]
acceptance_criteria:
  - "GUI Open and Inspect actions normalize requests to OpenSubject."
  - "Subject types include file, concern, help_entry, project_state, run, and artifact_storage."
  - "Contracts_V0 owns canonical OpenSubject rules."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: open_subject_normalization_drift
reasoning_tier: high
context_scope: opensubject_navigation_normalization
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: opensubject_navigation_normalization
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0010
preserved_exact_tokens:
  - "`OpenSubject`"
  - "`file`"
  - "`concern`"
  - "`help_entry`"
  - "`project_state`"
  - "`run`"
  - "`artifact_storage`"
negative_constraints:
  - "Crosswalk must not replace Contracts_V0 as the canonical OpenSubject owner."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
```

### C-009 - FileManager Path Realization Boundary

```yaml
plan_unit_id: C-009
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  FileManager owns path-based OpenFile realization only after a canonical path is
  known; cross-surface route-target/OpenSubject navigation, open-by-identity,
  and identity-native document, artifact, runtime, and governance opens route
  through the canonical route/open boundary before OpenFile realization.
gui_related: false
gui_classification_reason: This unit defines owner routing and path-realization boundaries; UI consumption is indirect.
split_recommended: false
depends_on: [C-006, C-008]
unblocks: [C-024, C-030]
acceptance_criteria:
  - "FileManager owns path-based editor realization only."
  - "Identity-native opens normalize through route/open boundaries before OpenFile realization."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: filemanager_navigation_overclaim
reasoning_tier: high
context_scope: filemanager_path_realization_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/FileManager.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: filemanager_path_realization_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0011
preserved_exact_tokens:
  - "`OpenFile`"
  - "`route-target`"
  - "`OpenSubject`"
  - "`/open-by-identity`"
negative_constraints:
  - "FileManager must not become the universal navigation owner."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/FileManager.md
  - Plans/Contracts_V0.md
```

### C-010 - Source Control Lane Worktree Ownership

```yaml
plan_unit_id: C-010
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Source Control and WorktreeGitImprovement own Git/worktree object navigation
  and worktree lifecycle, while FileManager only preserves path/root context;
  routes carry package, worktree, repo, worktree, node attempt, lane, package,
  seam, lifecycle, and historical lineage rather than becoming panel-only state.
gui_related: true
gui_classification_reason: This unit governs Source Control pivots, Orchestrator tab copy, blocked/recovery actions, and other user-visible route labels.
split_recommended: false
depends_on: [C-009]
unblocks: [C-025, C-033]
acceptance_criteria:
  - "Source Control and WorktreeGitImprovement own Git/worktree object navigation and lifecycle."
  - "SCM lineage preserves package, worktree, repo_id, worktree_id, node/attempt, rollback/retry context, and cross-surface navigation."
  - "acknowledged remains escalation/noise control and ownership visibility, not semantic closure."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_lane_worktree_boundary_drift
reasoning_tier: high
context_scope: source_control_lane_worktree_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/WorktreeGitImprovement.md
  - Plans/FileManager.md
node_compile_hint:
  mode: source_control_lane_worktree_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0012
preserved_exact_tokens:
  - "`open-in-SCM`"
  - "`/package`"
  - "`/worktree`"
  - "`repo_id`"
  - "`worktree_id`"
  - "`/node/attempt`"
  - "`acknowledged`"
negative_constraints:
  - "Worktree selection, open-in-SCM, and Source Control pivots are object navigation, not pure layout state."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/WorktreeGitImprovement.md
  - Plans/FileManager.md
```

### C-011 - Assistant Thread Worktree Binding Ownership

```yaml
plan_unit_id: C-011
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Assistant thread worktree binding is owned by assistant-chat-design, with the
  owner table preserving binding data model, seglog events, commands, settings,
  merge-back, pre-merge test gate, Source Control accordion/filter, worktree
  record extension, FileManager toggle, and LSP root identity consumers.
gui_related: true
gui_classification_reason: The owner table includes settings, Source Control accordion/filter, FileManager toggle, and other user-visible controls.
split_recommended: false
depends_on: [C-010]
unblocks: [C-032]
acceptance_criteria:
  - "Thread-to-worktree binding is owned by assistant-chat-design.md."
  - "The binding owner table remains the routing source for consumers."
  - "Freshness/health projection follows storage-plan projection state."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: thread_worktree_binding_owner_drift
reasoning_tier: high
context_scope: assistant_thread_worktree_binding_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: assistant_thread_worktree_binding_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0013
preserved_exact_tokens:
  - "`chat.thread_worktree_*`"
  - "`cmd.chat.worktree.*`"
  - "`owner_thread_id`"
  - "`root_identity`"
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/DRY_Rules.md"
negative_constraints:
  - "Consumer docs must not reassign thread-to-worktree binding ownership away from assistant-chat-design.md."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### C-012 - Projection Freshness Health Ownership

```yaml
plan_unit_id: C-012
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Projection freshness and health vocabulary is centrally owned: storage-plan
  owns axes and persisted semantics, Decision_Policy owns stale/degraded/
  unavailable gating behavior, FinalGUISpec owns UI disclosure, and consumers
  may consume but must not redefine or collapse the axes.
gui_related: true
gui_classification_reason: FinalGUISpec owns UI disclosure for freshness and health state.
split_recommended: false
depends_on: [C-011]
unblocks: [C-022, C-026]
acceptance_criteria:
  - "Projection freshness/health axes and persisted semantics are owned by storage-plan."
  - "Decision_Policy owns behavior when projection state affects execution or mutation gating."
  - "FinalGUISpec owns UI disclosure of freshness/health."
  - "Feature and surface docs do not redefine or collapse the axes."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: projection_state_axis_drift
reasoning_tier: high
context_scope: projection_freshness_health_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/storage-plan.md
  - Plans/Decision_Policy.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: projection_freshness_health_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0014
preserved_exact_tokens:
  - "`freshness=current|refreshing|stale`"
  - "`health=healthy|degraded|unavailable`"
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md"
negative_constraints:
  - "Feature/surface docs may consume these states but MUST NOT redefine the axes or collapse them into one field."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/storage-plan.md
  - Plans/Decision_Policy.md
  - Plans/FinalGUISpec.md
```

### C-013 - Subagent Crew Context Shaping Ownership

```yaml
plan_unit_id: C-013
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Subagent, crew, shell isolation, context-shaping transitions, crew lifecycle,
  and requested/effective child-run runtime surfaces are split across their SSOT
  owner docs; per-surface docs may narrow these behaviors but must not redefine
  the owners.
gui_related: false
gui_classification_reason: This unit defines runtime ownership routing rather than UI presentation.
split_recommended: false
depends_on: [C-012]
unblocks: [C-032]
acceptance_criteria:
  - "Each subagent, crew, shell-isolation, context-shaping, and child-runtime concern has one authoritative owner."
  - "Per-surface docs may narrow behaviors but must not redefine the owners."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_crew_owner_redefinition
reasoning_tier: high
context_scope: subagent_crew_context_shaping_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/interview-subagent-integration.md
  - Plans/Tools.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: subagent_crew_context_shaping_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0015
preserved_exact_tokens:
  - "`maxNestingDepth`"
  - "`maxTotalSpawnedAgents`"
  - "`maxToolRoundsPerAgent`"
  - "`shell-isolation`"
  - "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md"
negative_constraints:
  - "Per-surface docs may narrow these behaviors, but MUST NOT redefine the owners above."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/interview-subagent-integration.md
  - Plans/Tools.md
```

### C-014 - Human In The Loop Ownership Split

```yaml
plan_unit_id: C-014
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Human-in-the-loop ownership is split so human-in-the-loop owns approval and
  decline semantics plus blocked-episode overlay, Contracts_V0 owns canonical
  blocked fields/action ids/persisted payloads, UI_Command_Catalog owns command
  ids, and FinalGUISpec plus assistant-chat-design own presentation only.
gui_related: false
gui_classification_reason: This unit routes HITL ownership; presentation ownership is named but not defined here.
split_recommended: false
depends_on: [C-013]
unblocks: [C-016, C-028]
acceptance_criteria:
  - "human-in-the-loop.md owns approval/decline semantics and blocked-episode overlay contract."
  - "Contracts_V0 owns canonical blocked-episode fields, action ids, and persisted payload shapes."
  - "FinalGUISpec and assistant-chat-design own presentation only."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hitl_ownership_drift
reasoning_tier: high
context_scope: hitl_ownership_split
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/human-in-the-loop.md
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: hitl_ownership_split
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0016
preserved_exact_tokens:
  - "`Contracts_V0.md` owns the canonical blocked-episode fields, action ids, and persisted payload shapes"
  - "ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md"
negative_constraints:
  - "HITL presentation docs must not become owners of blocked payload shapes."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/human-in-the-loop.md
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
```

### C-015 - Debug Investigation Ownership Split

```yaml
plan_unit_id: C-015
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Debug and investigation ownership is split across assistant-chat-design for
  Assistant Debug Mode and investigation-thread behavior,
  orchestrator-subagent-integration for delegated-worker use,
  Executor_Protocol for execution-time propagation, storage-plan for persisted
  records/snapshots/recovery joins, and Permissions_System for Debug Automation
  Profile grants and revalidation.
gui_related: false
gui_classification_reason: This unit routes debug/investigation ownership and persistence boundaries.
split_recommended: false
depends_on: [C-014]
unblocks: [C-029]
acceptance_criteria:
  - "Assistant debug workflow overlay ownership remains in assistant-chat-design."
  - "Execution, persistence, and permission aspects route to their named owner docs."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_investigation_owner_drift
reasoning_tier: high
context_scope: debug_investigation_ownership_split
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/assistant-chat-design.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: debug_investigation_ownership_split
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0017
preserved_exact_tokens:
  - "Assistant Debug Mode"
  - "Debug Automation Profile"
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md"
negative_constraints:
  - "Debug/investigation ownership must not collapse into a single surface doc."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/assistant-chat-design.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
```

### C-016 - Permission Approval Scope Ownership

```yaml
plan_unit_id: C-016
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Permissions_System owns permission precedence, rule persistence,
  approval-scope derivation, durable-rule authoring, and permission-caused
  blocked outcomes; Contracts_V0 owns canonical blocked payload shapes,
  approval_scope_key, and action-id fields; human-in-the-loop owns approval
  interaction semantics.
gui_related: false
gui_classification_reason: This unit defines permission and payload ownership routing.
split_recommended: false
depends_on: [C-014]
unblocks: [C-028]
acceptance_criteria:
  - "Permissions_System owns permission precedence and approval-scope derivation."
  - "Contracts_V0 owns blocked payload shape, approval_scope_key, and action-id field names."
  - "Consumer docs may name required keys or blocked triggers but do not redefine approval-scope contracts."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: permission_approval_scope_redefinition
reasoning_tier: high
context_scope: permission_approval_scope_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: permission_approval_scope_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0018
preserved_exact_tokens:
  - "`approval_scope_key`"
  - "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md"
negative_constraints:
  - "Consumer docs may name required permission keys or blocked triggers but MUST NOT redefine the approval-scope contract."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
```

### C-017 - Remediation Lifecycle Ownership

```yaml
plan_unit_id: C-017
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Executor_Protocol owns remediation spawn/retry/safe-point/escalation behavior,
  Contracts_V0 owns remediation.spawned and remediation.resolved event shapes
  plus the resolution enum, Decision_Policy owns deterministic ceilings and
  blocked posture after ceiling exhaustion, and storage-plan owns durable
  remediation lineage and historical projection behavior.
gui_related: true
gui_classification_reason: Orchestrator, GUI, and chat docs consume remediation state and user-visible blocked/recovery behavior.
split_recommended: false
depends_on: [C-016]
unblocks: [C-029]
acceptance_criteria:
  - "Remediation spawn/retry/safe-point behavior routes to Executor_Protocol."
  - "Remediation event shapes and resolution enum route to Contracts_V0."
  - "Orchestrator, GUI, and chat docs consume remediation state without redefining enums or ceiling behavior."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: remediation_lifecycle_owner_drift
reasoning_tier: high
context_scope: remediation_lifecycle_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/Decision_Policy.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: remediation_lifecycle_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0019
preserved_exact_tokens:
  - "`remediation.spawned`"
  - "`remediation.resolved`"
  - "`resolution`"
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md"
negative_constraints:
  - "Orchestrator/GUI/chat docs consume remediation state but MUST NOT redefine remediation enums or ceiling behavior."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/Decision_Policy.md
  - Plans/storage-plan.md
```

### C-018 - Provider Account Selection Precedence

```yaml
plan_unit_id: C-018
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Provider and account selection ownership routes to Models_System for
  provider-entry/runtime-surface selection priority and requested/effective
  runtime fields, Multi-Account for account selection and switch lineage,
  Prompt_Pipeline for runtime handoff freeze points, and provider docs for
  transport/capability facts rather than global selection precedence.
gui_related: false
gui_classification_reason: This unit defines provider/account owner routing and runtime precedence.
split_recommended: false
depends_on: [C-013]
unblocks: [C-020, C-023]
acceptance_criteria:
  - "Models_System owns provider-entry/runtime-surface selection priority and requested/effective runtime fields."
  - "Multi-Account owns account selection and switch lineage."
  - "Provider-specific docs do not own global selection precedence."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_account_precedence_drift
reasoning_tier: high
context_scope: provider_account_selection_precedence
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Prompt_Pipeline.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: provider_account_selection_precedence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0020
preserved_exact_tokens:
  - "`requested/effective`"
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/CLI_Bridged_Providers.md"
negative_constraints:
  - "Provider-specific transport/capability docs must not own global selection precedence."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Prompt_Pipeline.md
```

### C-019 - Event Record Terminal Identity Ownership

```yaml
plan_unit_id: C-019
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Contracts_V0 owns event families and command/event envelopes, storage-plan
  owns persisted record families, projection joins, terminal_session_id,
  dev_session_id, and terminal continuity identity, FinalGUISpec owns shell
  realization, and Section15 owns shell/session identities across Plans
  consumers.
gui_related: true
gui_classification_reason: FinalGUISpec owns shell realization and terminal layout presentation.
split_recommended: false
depends_on: [C-018]
unblocks: [C-029, C-032]
acceptance_criteria:
  - "Contracts_V0 owns event families and command/event envelopes."
  - "storage-plan owns persisted records, projection joins, and terminal continuity/restart identity."
  - "Consumer docs may extend display metadata but do not redefine terminal or event identity primitives."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: event_record_terminal_identity_drift
reasoning_tier: high
context_scope: event_record_terminal_identity_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: event_record_terminal_identity_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0021
preserved_exact_tokens:
  - "`terminal_session_id`"
  - "`dev_session_id`"
  - "`/session`"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md"
negative_constraints:
  - "Consumer docs may extend display metadata but MUST NOT redefine terminal or event identity primitives."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
```

### C-020 - Provider Pressure Effort And Repair Routing

```yaml
plan_unit_id: C-020
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Crosswalk routes provider pressure, effort-control rewrites, context-detail
  usage display, and Firecrawl/lost-spec web/chat/storage repair to the named
  owner docs while preserving cross-provider requested/effective state and
  keeping provider-specific strings subordinate evidence rather than scheduler
  inputs.
gui_related: true
gui_classification_reason: This unit names GUI, usage, context-detail, and routing surfaces that consume provider pressure state.
split_recommended: false
depends_on: [C-018]
unblocks: [C-023, C-029]
acceptance_criteria:
  - "Provider pressure projection records Observed effective versus Inferred only and normalized pressure fields."
  - "GUI, usage, and routing surfaces preserve coherent effective state across providers."
  - "Firecrawl/lost-spec repair routing remains owner/consumer only."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_pressure_owner_routing_drift
reasoning_tier: high
context_scope: provider_pressure_effort_repair_routing
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
  - Plans/Tools.md
node_compile_hint:
  mode: provider_pressure_effort_repair_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0022
preserved_exact_tokens:
  - "`Observed effective`"
  - "`Inferred only`"
  - "`pressure_state`"
  - "`hard_block`"
  - "`effective_pressure_state`"
  - "`effective_resolution_outcome`"
  - "`/context-detail`"
negative_constraints:
  - "Provider-specific strings remain subordinate evidence rather than scheduler inputs."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/Tools.md
```

### C-021 - Rewrite Era Cross Cutting Owner Routing

```yaml
plan_unit_id: C-021
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Rewrite-era cross-cutting field families, event names, account IDs,
  account-routing semantics, requested/effective runtime resolution, stable
  command IDs, command arguments, Glossary terms, and execution-core semantics
  route to their owner docs, while UI_Command_Catalog does not own the deeper
  route ontology by itself and structural owner-doc debt remains explicit.
gui_related: false
gui_classification_reason: This unit defines owner routing and structural debt rather than UI presentation.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is dense and is split across C-021 through C-033 to preserve separate owner-routing concerns.
depends_on: [C-005, C-006]
unblocks: [C-022, C-024, C-029]
acceptance_criteria:
  - "Cross-cutting persisted-envelope, event, account, command, Glossary, and execution-core families route to owner docs."
  - "UI_Command_Catalog does not own the deeper route ontology by itself."
  - "Structural owner safety debt and append-after-references drift remain visible."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: rewrite_owner_routing_drift
reasoning_tier: high
context_scope: rewrite_era_cross_cutting_owner_routing
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Prompt_Pipeline.md
  - Plans/Multi-Account.md
  - Plans/UI_Command_Catalog.md
  - Plans/Glossary.md
  - Plans/Executor_Protocol.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: rewrite_era_cross_cutting_owner_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`Contracts_V0.md`"
  - "`storage-plan.md`"
  - "`Prompt_Pipeline.md`"
  - "`Multi-Account.md`"
  - "`UI_Command_Catalog.md`"
  - "`Glossary.md`"
  - "`Executor_Protocol.md`"
  - "`orchestrator-subagent-integration.md`"
  - "`Primitive:Seglog`"
  - "`Primitive:EvidenceBundle`"
  - "`Primitive:CapabilityGating`"
negative_constraints:
  - "`UI_Command_Catalog.md` does not own the deeper route ontology by itself."
  - "Append-after-references drift is a structural owner-doc failure, not a new source of truth."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Prompt_Pipeline.md
  - Plans/Multi-Account.md
  - Plans/UI_Command_Catalog.md
  - Plans/Glossary.md
  - Plans/Executor_Protocol.md
```

### C-022 - Storage Project And Surface State Routing

```yaml
plan_unit_id: C-022
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Storage and project-state support routes through storage-plan, while
  surface-specific active_subview, selection, branch, filter, document history,
  and worktree focus state remain owner-handled routing identities instead of
  consumer-owned local state.
gui_related: true
gui_classification_reason: This unit governs user-visible surface state such as active subviews, selected repos/worktrees, filters, and document pane selection.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-021]
unblocks: [C-024, C-030, C-032]
acceptance_criteria:
  - "Project-state and persisted support route through storage-plan."
  - "Surface-specific active_subview, selection, branch, filter, and document state remain owner-handled."
  - "Selection and worktree focus are routing identities, not consumer-owned local state."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: surface_state_owner_drift
reasoning_tier: high
context_scope: storage_project_surface_state_routing
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
  - Plans/FileManager.md
node_compile_hint:
  mode: storage_project_surface_state_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`orchestrator.project_state.{project_id}`"
  - "`/project-state`"
  - "`active_subview`"
  - "`/selection`"
  - "`/worktree`"
negative_constraints:
  - "Surface-specific state must not become consumer-owned local state when it is a route or focus identity."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
  - Plans/FileManager.md
```

### C-023 - Provider Account Persona Model Routing

```yaml
plan_unit_id: C-023
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Multi-account switch and pressure behavior routes to Multi-Account; provider
  transport/upstream identity routes to provider owner docs; persona, prompt,
  interview handoff, requested/effective persona names, model selection,
  orchestrator integration, and shell exposure remain split by their owner
  families.
gui_related: false
gui_classification_reason: This unit routes provider/account/persona/model owner families and runtime disclosure.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-018, C-020, C-021]
unblocks: [C-030]
acceptance_criteria:
  - "Multi-Account owns selection policy, role/account precedence, durable switch-history storage, and pressure joins."
  - "Provider-specific transport-vs-upstream identity routes to provider owner docs."
  - "Persona and model-adjacent routing stays split by owner family."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_account_persona_model_owner_drift
reasoning_tier: high
context_scope: provider_account_persona_model_routing
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
  - Plans/Personas.md
  - Plans/Prompt_Pipeline.md
  - Plans/interview-subagent-integration.md
  - Plans/Models_System.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: provider_account_persona_model_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`requested/effective`"
  - "`preferred-account`"
  - "`effective_account_id`"
  - "`Plans/Provider_OpenCode.md`"
  - "`Plans/Personas.md`"
negative_constraints:
  - "Account and persona/model routing must not collapse into provider-only notes."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
  - Plans/Personas.md
  - Plans/Prompt_Pipeline.md
  - Plans/Models_System.md
```

### C-024 - Route Open Normalization Boundary

```yaml
plan_unit_id: C-024
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Route-target, subject-open, OpenSubject, OpenFile, resume_url, generated
  subject transport, and open-by-identity behavior normalize to the shared
  route/open contract boundary rather than allowing FileManager,
  UI_Command_Catalog, or any surface wrapper command to become the navigation
  owner.
gui_related: true
gui_classification_reason: This unit governs command palette, preview subject, deep links, open-file actions, and cross-surface navigation behavior.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-006, C-007, C-008, C-009, C-021, C-022]
unblocks: [C-027, C-030, C-032]
acceptance_criteria:
  - "resume_url serializes route identity and is not the canonical navigation primitive."
  - "OpenSubject and OpenFile live inside the same route/open model rather than separate navigation stacks."
  - "FileManager and navigation consumers do not make OpenFile the universal navigation primitive."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_open_normalization_drift
reasoning_tier: high
context_scope: route_open_normalization_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/FileManager.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: route_open_normalization_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`route-target`"
  - "`subject-open`"
  - "`resume_url`"
  - "`OpenSubject`"
  - "`OpenFile`"
  - "`/open-by-identity`"
  - "`generated://<artifact_id>`"
negative_constraints:
  - "`FileManager.md` and `/navigation` consumers must not make `OpenFile` the universal navigation primitive."
  - "`resume_url` is only one persisted serialized recovery deep-link transport form, not the hidden canonical navigation primitive."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/FileManager.md
  - Plans/UI_Command_Catalog.md
```

### C-025 - Source Control Lane Worktree Historical Routing

```yaml
plan_unit_id: C-025
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Source Control remains Git worktree-first while Orchestrator remains
  lane/package/seam first; SCM/runtime flows replace tier-bound worktree
  identity with lane/worktree plus execution context, preserve package and
  worktree lineage through cleanup/archive/remove, and keep worktree operations
  as object navigation rather than panel-only state.
gui_related: true
gui_classification_reason: This unit governs Source Control, Orchestrator, history, graph, and cleanup views.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-010, C-021]
unblocks: [C-026, C-033]
acceptance_criteria:
  - "Source Control remains Git worktree-first while Orchestrator remains lane/package/seam first."
  - "Historical lane/worktree records survive archive, prune, and remove."
  - "SCM/runtime routes carry lane/package/seam context rather than reviving per-tier worktree ownership."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_lane_worktree_historical_drift
reasoning_tier: high
context_scope: source_control_lane_worktree_historical_routing
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Orchestrator_Page.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: source_control_lane_worktree_historical_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`worktree-first`"
  - "`/package/seam/node-first`"
  - "`/run/package/lane/worktree`"
  - "`archive`"
  - "`prune`"
  - "`remove`"
negative_constraints:
  - "Source Control and Git worktree routes must not degrade into panel-only jumps or tier-bound ownership."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Orchestrator_Page.md
  - Plans/FinalGUISpec.md
```

### C-026 - Orchestrator Tab IA And Cross Tab Navigation

```yaml
plan_unit_id: C-026
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Orchestrator routing preserves tab responsibility, CTA behavior, Usage,
  Evidence, Graph, history, blocked outcomes, provider/model/persona precedence,
  worktree ownership, Tiers retirement, cross-tab deep-linkability, and
  route/filter/select target context without duplicating Source Control or
  reducing navigation to tab switches.
gui_related: true
gui_classification_reason: This unit governs Orchestrator tabs, CTAs, cross-tab navigation, and shell IA.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-012, C-025]
unblocks: [C-027, C-032, C-033]
acceptance_criteria:
  - "Tier-era UI assumptions route through FinalGUISpec, Orchestrator_Page, and storage-plan for retirement."
  - "Cross-tab routes preserve filter/select target context instead of merely switching tabs."
  - "Progress remains widget-hosting operational tab while native deep-inspection tabs own seams plus graph/evidence/history/ledger."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: orchestrator_tab_navigation_drift
reasoning_tier: high
context_scope: orchestrator_tab_ia_cross_tab_navigation
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/UI_Command_Catalog.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/storage-plan.md
  - Plans/human-in-the-loop.md
  - Plans/Glossary.md
  - Plans/Orchestrator_Page.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: orchestrator_tab_ia_cross_tab_navigation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`CTA`"
  - "`Tiers`"
  - "`/filter/select`"
  - "`Progress`"
  - "`/graph/evidence/history/ledger`"
negative_constraints:
  - "Orchestrator tab ownership must not collapse runtime ownership, page/tab IA, blocked/remediation UX, and graph/evidence/history/usage lineage into one page discussion."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Orchestrator_Page.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
```

### C-027 - Wrapper Commands And Command Palette Route Consumption

```yaml
plan_unit_id: C-027
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Wrapper commands, command palette jumps, panel switches, chat/thread
  navigation, show/open actions, and command-specific payloads are route/open
  consumers that normalize into the shared route model instead of becoming a
  second navigation language or a universal navigation primitive.
gui_related: true
gui_classification_reason: This unit governs user-facing commands, palette jumps, panel switches, and show/open actions.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-024, C-026]
unblocks: [C-029, C-032]
acceptance_criteria:
  - "Wrapper commands remain useful surface verbs but not the universal navigation primitive."
  - "cmd.panel.switch remains panel-centric and too shallow for richer restoration contexts."
  - "Command-specific payloads normalize to the shared route model."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wrapper_command_navigation_drift
reasoning_tier: high
context_scope: wrapper_commands_palette_route_consumption
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: wrapper_commands_palette_route_consumption
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`cmd.panel.switch`"
  - "`cmd.chat.open_thread_usage`"
  - "`cmd.artifacts.show_in_usage`"
  - "`cmd.orchestrator.open_in_source_control`"
  - "`cmd.project.open`"
  - "`jump-to-message`"
negative_constraints:
  - "Wrapper commands must not replace shared route/open contract semantics."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

### C-028 - Permissioned Interview Chat Approval Routing

```yaml
plan_unit_id: C-028
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Permissioned interview and chat flows route Permissions_System,
  assistant-chat-design, and interview-subagent-integration as the owner set for
  approval, chat, and interview behavior; preview/browser trust_tier must not be
  reused as a generic projection-state term.
gui_related: true
gui_classification_reason: This unit governs approval, chat, interview, preview, and browser user-visible behavior.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-014, C-016]
unblocks: [C-035]
acceptance_criteria:
  - "Permissioned interview/chat flows route approval, chat, and interview behavior through the named owner docs."
  - "preview/browser trust_tier is not reused as generic projection-state terminology."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: permissioned_interview_chat_owner_drift
reasoning_tier: high
context_scope: permissioned_interview_chat_approval_routing
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Permissions_System.md
  - Plans/assistant-chat-design.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: permissioned_interview_chat_approval_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`trust_tier`"
  - "`projection-state`"
negative_constraints:
  - "preview/browser `trust_tier` must not be reused as a generic `projection-state` term."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Permissions_System.md
  - Plans/assistant-chat-design.md
  - Plans/interview-subagent-integration.md
```

### C-029 - Execution Command Cleanup And Scheduler Truth

```yaml
plan_unit_id: C-029
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Execution and command cleanup stays owner-specific: Executor_Protocol owns
  execution_role, blocked_sequence minting, and startup-recovery scheduler
  handoff; UI_Command_Catalog owns command-family migration; scheduler truth
  must not split among lexicographic, scored, and UI-derived recovery models
  across Executor_Protocol, Progression_Gates, plan_graph.schema, and
  Run_Graph_View.
gui_related: false
gui_classification_reason: This unit defines execution-core and scheduler ownership routing.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-015, C-017, C-019, C-020, C-021, C-027]
unblocks: [C-037]
acceptance_criteria:
  - "Executor_Protocol owns execution_role, blocked_sequence minting, and startup-recovery scheduler handoff."
  - "UI_Command_Catalog owns command-family migration."
  - "One scheduler truth is required across the listed owner docs."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scheduler_truth_split
reasoning_tier: high
context_scope: execution_command_cleanup_scheduler_truth
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Executor_Protocol.md
  - Plans/UI_Command_Catalog.md
  - Plans/Progression_Gates.md
  - Plans/plan_graph.schema.json
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: execution_command_cleanup_scheduler_truth
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`execution_role`"
  - "`blocked_sequence`"
  - "`startup-recovery`"
  - "`scheduler.pass`"
  - "`cmd.runtime.*`"
negative_constraints:
  - "Scheduler truth must not split among lexicographic, scored, and UI-derived recovery models across Plans/Executor_Protocol.md, Plans/Progression_Gates.md, Plans/plan_graph.schema.json, and Plans/Run_Graph_View.md."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Executor_Protocol.md
  - Plans/UI_Command_Catalog.md
  - Plans/Progression_Gates.md
  - Plans/Run_Graph_View.md
```

### C-030 - Artifact Runtime Operational Identity Routing

```yaml
plan_unit_id: C-030
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Artifact, file, storage, runtime, operational identity, and generated subject
  routing promote project_id, attempt_id, doc/artifact subject IDs, generated
  runtime subject identity, and environment-specific target context to
  first-class owner-routed identities without making generated transport or raw
  path opens the canonical persisted subject model.
gui_related: true
gui_classification_reason: This unit governs runtime artifact, file, report, and open/show surface navigation.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-022, C-023, C-024]
unblocks: [C-032]
acceptance_criteria:
  - "Project/artifact/file surfaces route by project_id, attempt_id, runtime subject identity, and artifact/file pivots."
  - "generated:// remains implementation-level transient representation rather than persisted subject ID."
  - "operational_identity records external side-effect target context."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: artifact_runtime_identity_owner_drift
reasoning_tier: high
context_scope: artifact_runtime_operational_identity_routing
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/FileManager.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: artifact_runtime_operational_identity_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`project_id`"
  - "`attempt_id`"
  - "`doc:`"
  - "`artifact:`"
  - "`generated://`"
  - "`operational_identity`"
  - "`Open Artifact`"
  - "`Open Report`"
negative_constraints:
  - "Orchestrator/Evidence surface copy such as Open in Editor must not imply raw-path opens for artifact-backed or report-backed subjects."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/FileManager.md
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
```

### C-031 - Usage Attention Help Labels And Acknowledged Semantics

```yaml
plan_unit_id: C-031
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Usage navigation, attention surfaces, help labels, lane/worktree copy,
  blocked/recovery terminology, concerns/promotions/patches/history/ledger copy,
  and acknowledged semantics are route consumers of the shared route/open model;
  acknowledged is escalation noise control and ownership visibility only.
gui_related: true
gui_classification_reason: This unit governs user-visible Usage, attention, help label, blocked/recovery, and ledger copy.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-010, C-020, C-024]
unblocks: [C-032]
acceptance_criteria:
  - "usage_event is a first-class routed object."
  - "Attention and CtA surfaces normalize local field conventions to route-target."
  - "acknowledged does not close concerns, remove blockers, or replace resolved/dismissed lifecycle states."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: usage_attention_acknowledged_semantics_drift
reasoning_tier: high
context_scope: usage_attention_help_labels_acknowledged_semantics
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
  - Plans/Glossary.md
node_compile_hint:
  mode: usage_attention_help_labels_acknowledged_semantics
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`usage_event`"
  - "`/CtA`"
  - "`acknowledged`"
  - "`concerns/promotions/patches/history/ledger`"
negative_constraints:
  - "`acknowledged` is escalation `/noise` control and ownership visibility only; it does not close a concern, remove a blocker, or replace resolved/dismissed lifecycle states."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
  - Plans/Glossary.md
```

### C-032 - Durable Route Identity Across History Surfaces

```yaml
plan_unit_id: C-032
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Ledger records, history chronology, graph generations, seams completion,
  promotions, runtime lineage, blocked episodes, scheduler passes, graph
  generations, attempts, concerns, graph patches, recovery records, and
  lane/worktree objects preserve durable route identity and lifecycle semantics
  across graph, evidence, history, ledger, runtime-artifact, and chat consumers.
gui_related: true
gui_classification_reason: This unit governs graph, evidence, history, ledger, runtime-artifact, chat, and blocked/runtime resume navigation.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-011, C-013, C-019, C-022, C-024, C-026, C-027, C-030, C-031]
unblocks: [C-033]
acceptance_criteria:
  - "Durable route identity distinguishes none selection, open/focus/navigate/deep-link, and tab-local filter/sort/search changes."
  - "Runtime lineage is object-first, not attempt-first."
  - "Shared record-semantic vocabulary spans attempts, promotions, concerns, graph patches, recovery records, and lane/worktree objects."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: durable_route_identity_drift
reasoning_tier: high
context_scope: durable_route_identity_history_surfaces
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/storage-plan.md
  - Plans/Run_Graph_View.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: durable_route_identity_history_surfaces
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`/history/ledger/source`"
  - "`/focus/navigate/deep-link`"
  - "`jump-to-message`"
  - "`cost_usage`"
  - "`runtime-lineage`"
negative_constraints:
  - "Runtime lineage is object-first, not attempt-first."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/storage-plan.md
  - Plans/Run_Graph_View.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/assistant-chat-design.md
```

### C-033 - Tier Bound Identity Replacement

```yaml
plan_unit_id: C-033
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Tier-bound selection, override-owner, execution-framing, per-tier worktree,
  tier/subtask, and owner run/tier assumptions must yield to package-based
  lane-pool, package/seam/lane-aware, graph/seam/package, effective identity,
  lane/worktree, and execution-context models.
gui_related: true
gui_classification_reason: This unit governs shell/Orchestrator migration away from Tiers and linear UI assumptions.
split_recommended: true
split_recommendation_reason: Crosswalk-S0023 is split across multiple routing concerns.
depends_on: [C-025, C-026, C-032]
unblocks: []
acceptance_criteria:
  - "Tiers is retired as a primary view and route identity."
  - "Tier/rooted worktree identity yields to lane/worktree plus execution-context models."
  - "Owner docs retire tier-bound selection, override-owner, and execution-framing assumptions."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: tier_bound_identity_resurrection
reasoning_tier: high
context_scope: tier_bound_identity_replacement
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/FinalGUISpec.md
  - Plans/Orchestrator_Page.md
  - Plans/storage-plan.md
  - Plans/Prompt_Pipeline.md
  - Plans/Models_System.md
  - Plans/Personas.md
node_compile_hint:
  mode: tier_bound_identity_replacement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0023
preserved_exact_tokens:
  - "`Tiers`"
  - "`/tier`"
  - "`/tier/subtask`"
  - "`lane-pool`"
  - "`/package/seam/lane-aware`"
  - "`execution-context`"
negative_constraints:
  - "SCM/runtime flows replace tier-bound worktree identity with the lane/worktree plus execution-context model."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/FinalGUISpec.md
  - Plans/Orchestrator_Page.md
  - Plans/storage-plan.md
```

### C-034 - Document Inline Notes Annotation Boundary

```yaml
plan_unit_id: C-034
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  DocumentInlineNotes routes durable document annotation behavior across
  FinalGUISpec, storage-plan, chain-wizard-flexibility,
  interview-subagent-integration, and assistant-chat-design; user-facing
  Annotations preserve note_record.v1 continuity, operation shapes, lifecycle,
  anchoring selectors, deterministic re-anchoring, coexistence/conflict rules,
  and send-selection-to-chat boundaries.
gui_related: true
gui_classification_reason: This unit governs embedded document annotations, source surfaces, and user-facing annotation behavior.
split_recommended: false
depends_on: [C-024, C-028]
unblocks: [C-035, C-036]
acceptance_criteria:
  - "DocumentInlineNotes preserves durable annotation operation shapes and lifecycle."
  - "Anchor storage includes TextPositionSelector and TextQuoteSelector when deterministic source text exists."
  - "Send selection to chat remains adjacent behavior and not durable annotation lifecycle or patch-apply semantics."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: document_inline_notes_boundary_drift
reasoning_tier: high
context_scope: document_inline_notes_annotation_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: document_inline_notes_annotation_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0025
preserved_exact_tokens:
  - "`Primitive:DocumentInlineNotes`"
  - "`Annotations`"
  - "`note_record.v1`"
  - "`operation = comment | replace | insert_after | remove`"
  - "`TextPositionSelector { start, end }`"
  - "`TextQuoteSelector { exact, prefix, suffix }`"
  - "`Anchor not found — reselect to re-anchor`"
negative_constraints:
  - "`Send selection to chat` is a thread-scoped chip/handoff path; it must not be collapsed into the durable `/annotation` lifecycle, and it does not create patch-apply semantics."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/assistant-chat-design.md
```

### C-035 - Targeted Revision Pass Boundary

```yaml
plan_unit_id: C-035
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  TargetedRevisionPass routes targeted revision through workflow, UI, prompt,
  persistence, interview, and permission owners; Resubmit with Annotations
  consumes ordered annotation records, records addressed/still_open/cannot_apply
  outcomes, supports explicit requested/effective revision capability, exposes
  bundle lifecycle/audit events, and remains note-based V1 without direct
  patch-apply behavior.
gui_related: true
gui_classification_reason: This unit governs Resubmit with Annotations, document review, and revision workflow controls.
split_recommended: false
depends_on: [C-028, C-034]
unblocks: [C-036]
acceptance_criteria:
  - "Targeted revision consumes deterministic ordered annotation records."
  - "Each input annotation records addressed, still_open, or cannot_apply with explanation and optional updated anchor."
  - "Targeted revision does not trigger Multi-Pass Review and direct patch-apply is out of scope."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: targeted_revision_pass_boundary_drift
reasoning_tier: high
context_scope: targeted_revision_pass_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/FinalGUISpec.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: targeted_revision_pass_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0026
preserved_exact_tokens:
  - "`Primitive:TargetedRevisionPass`"
  - "`Resubmit with Annotations`"
  - "`addressed | still_open | cannot_apply`"
  - "`schema_enforced_structured_revision`"
  - "`validated_structured_revision`"
  - "`chat_handoff_only`"
  - "`bundle.revision_started`"
  - "`bundle.revision_completed`"
negative_constraints:
  - "Targeted revision MUST NOT trigger Multi-Pass Review."
  - "V1 is note-based embedded-document review upgraded into structured annotations; direct `patch-apply` behavior is out of scope."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
```

### C-036 - Final Review Gate Boundary

```yaml
plan_unit_id: C-036
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  FinalReviewGate routes final-review-only Multi-Pass Review through workflow
  and storage owners; it is enabled only when all bundle docs are Approved/Done
  and no durable annotations remain open, pending Send selection to chat chips
  do not satisfy or bypass it, reruns are explicit, and the gate decision is
  Accept, Reject, or Edit.
gui_related: false
gui_classification_reason: This unit defines workflow gate semantics and artifact taxonomy rather than UI presentation.
split_recommended: false
depends_on: [C-034, C-035]
unblocks: []
acceptance_criteria:
  - "Multi-Pass Review is final-review only and requires approved/done bundle docs with no open durable annotations."
  - "Question/comment annotations count as open until user resolution."
  - "Final gate decisions are Accept, Reject, or Edit."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: final_review_gate_boundary_drift
reasoning_tier: high
context_scope: final_review_gate_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: final_review_gate_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0027
preserved_exact_tokens:
  - "`Multi-Pass Review`"
  - "`Approved/Done`"
  - "`Send selection to chat`"
  - "`Accept | Reject | Edit`"
negative_constraints:
  - "Pending Send selection to chat chips do not satisfy or bypass the final review gate."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/storage-plan.md
```

### C-037 - Recovery Terminology Distinction

```yaml
plan_unit_id: C-037
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Recovery terminology distinguishes safe point as runtime-internal
  retry/remediation anchor, restore point as user-visible history/rewind anchor,
  rollback as explicit request/confirm restoration flow, and worktree baseline
  as execution-root state used to materialize a safe point or restore point
  depending on context.
gui_related: true
gui_classification_reason: The unit includes user-visible restore point, rollback, and UI copy distinctions.
split_recommended: false
depends_on: [C-017, C-029]
unblocks: []
acceptance_criteria:
  - "safe point, restore point, rollback, and worktree baseline remain distinct terms."
  - "Docs and implementations do not use these terms interchangeably."
  - "UI copy preserves the distinction."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: recovery_terminology_conflation
reasoning_tier: high
context_scope: recovery_terminology_distinction
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: recovery_terminology_distinction
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0028
preserved_exact_tokens:
  - "`safe point`"
  - "`restore point`"
  - "`rollback`"
  - "`worktree baseline`"
negative_constraints:
  - "Docs and implementations must not use these terms interchangeably."
  - "UI copy must preserve the distinction."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
  - Plans/Decision_Policy.md
```

### C-038 - Runtime Scheduler Recovery Ownership Precedence

```yaml
plan_unit_id: C-038
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Runtime scheduler and recovery ownership routes lifecycle and scheduling to
  Executor_Protocol, runtime events/enums/payloads to Contracts_V0, persistence
  and restart recovery to storage-plan, deterministic recovery defaults to
  Decision_Policy, runtime command IDs to UI_Command_Catalog, Context Lens
  control/action wiring to Wiring_Matrix, and chat/GUI/run-graph/orchestrator/
  wizard surfaces as consumers.
gui_related: true
gui_classification_reason: The unit names GUI, chat, run graph, orchestrator, wizard, and Context Lens consumer surfaces.
split_recommended: false
depends_on: [C-017, C-029, C-037]
unblocks: [C-039, C-046]
acceptance_criteria:
  - "Executor_Protocol owns runtime lifecycle, scheduling, blocked_sequence minting, and restart-recovery to first scheduler.pass handoff from startup_recovered."
  - "Contracts_V0 owns runtime events, enums, payloads, and contracts/UI payload implications."
  - "Legacy packet-era names are compatibility terms only."
  - "Scheduler truth does not split among lexicographic, scored, and UI-derived recovery models."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_scheduler_recovery_owner_split
reasoning_tier: high
context_scope: runtime_scheduler_recovery_ownership_precedence
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Decision_Policy.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: runtime_scheduler_recovery_ownership_precedence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0029
preserved_exact_tokens:
  - "`analysis_id`"
  - "`run.scheduler_analysis`"
  - "`allowed_actions[]`"
  - "`recovery_options[]`"
  - "`blocked_sequence`"
  - "`startup_recovered`"
  - "`scheduler.pass`"
  - "`execution_role`"
  - "`/worktree/permission/runtime`"
negative_constraints:
  - "Legacy packet-era names such as analysis_id, run.scheduler_analysis, allowed_actions[], and recovery_options[] are compatibility terms only."
  - "When a consumer doc conflicts with the owner docs, the owner docs win."
  - "Stale canonical text must be replaced or retired, not preserved by later additive notes alone."
  - "Scheduler truth must not split among lexicographic, scored, and UI-derived recovery models across Plans/Executor_Protocol.md, Plans/Progression_Gates.md, Plans/plan_graph.schema.json, and Plans/Run_Graph_View.md."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Decision_Policy.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
```

### C-039 - Source Control Operations Ownership

```yaml
plan_unit_id: C-039
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  SourceControlSurface routes Git-local and Git-remote repo operations, history,
  graph, stash, conflicts, worktree UX, remote-first Source Control/SSH
  consequences, worktree lifecycle, and Worktrees subview routing to
  GitHub_Integration and WorktreeGitImprovement, while GitHub-hosted workflow
  and admin behavior does not belong to Source Control.
gui_related: true
gui_classification_reason: SourceControlSurface, Worktrees subview routing, graph/history/conflict UX, and Source Control rows are user-visible surfaces.
split_recommended: true
split_recommendation_reason: Crosswalk-S0031 is split across Source Control operation, identity, command, and cross-surface panel concerns.
depends_on: [C-010, C-025, C-038]
unblocks: [C-040, C-041, C-042]
acceptance_criteria:
  - "Git-local and Git-remote repo operations, history, graph, stash, conflicts, and worktree UX belong to Source Control."
  - "Remote-first project-mode consequences route through the Source Control and SSH owner chain."
  - "GitHub-hosted workflow/admin behavior does not belong to Source Control."
  - "Remote project mode consumers do not silently substitute local files, local git, or local shells."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_operation_owner_drift
reasoning_tier: high
context_scope: source_control_operations_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/GitHub_Integration.md
  - Plans/WorktreeGitImprovement.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: source_control_operations_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0031
preserved_exact_tokens:
  - "`SourceControlSurface`"
  - "`Git-local`"
  - "`Git-remote`"
  - "`Plans/GitHub_Integration.md §C`"
  - "`Worktrees`"
  - "`package/lane/run`"
  - "ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/UI_Command_Catalog.md"
negative_constraints:
  - "GitHub-hosted workflow/admin behavior does not belong to Source Control."
  - "Remote project mode must not silently substitute local files, local git, or local shells."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/GitHub_Integration.md
  - Plans/WorktreeGitImprovement.md
  - Plans/UI_Command_Catalog.md
```

### C-040 - Source Control Worktree Identity Cleanup Gates

```yaml
plan_unit_id: C-040
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Source Control and GitHub worktree views stay worktree-centric while attaching
  package-lane and seam/lane-aware visibility; WorktreeGitImprovement owns
  worktree_id, base-branch, and lifecycle semantics; cleanup/archive/prune/
  remove is gated by active-run ownership, blocked recovery, safe-point restore,
  conflict inspection, and newer lane/worktree lineage; Git (GitHub) is only a
  migration alias.
gui_related: true
gui_classification_reason: This unit governs Source Control rows, worktree views, cleanup actions, and visible migration labels.
split_recommended: true
split_recommendation_reason: Crosswalk-S0031 is split across Source Control operation, identity, command, and cross-surface panel concerns.
depends_on: [C-025, C-039]
unblocks: [C-041, C-042]
acceptance_criteria:
  - "Source Control and GitHub worktree views stay worktree-centric with package-lane and seam/lane-aware visibility."
  - "Legacy run/tier row ownership remains compatibility metadata, not shared worktree identity."
  - "Blocked-emitter behavior routes through Contracts and runtime owner docs rather than being inferred from Source Control rows."
  - "Git (GitHub) is a migration alias only."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_worktree_identity_drift
reasoning_tier: high
context_scope: source_control_worktree_identity_cleanup_gates
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/WorktreeGitImprovement.md
  - Plans/GitHub_Integration.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: source_control_worktree_identity_cleanup_gates
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0031
preserved_exact_tokens:
  - "`/worktree-centric`"
  - "`/seam/lane-aware`"
  - "`worktree_id`"
  - "`base-branch`"
  - "`/prune/remove`"
  - "`safe-point restore`"
  - "`Git (GitHub)`"
  - "`/surfaces`"
negative_constraints:
  - "Legacy run/tier row ownership is compatibility metadata, not the shared worktree identity model."
  - "Canonical blocked-emitter behavior must not be inferred from Source Control rows."
  - "Live surfaces route through Source Control plus WorktreeGitImprovement rather than preserving a combined Git/GitHub panel."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/WorktreeGitImprovement.md
  - Plans/GitHub_Integration.md
  - Plans/Contracts_V0.md
```

### C-041 - Git Diff Commands And Chat Recovery Boundary

```yaml
plan_unit_id: C-041
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Git/diff command anchors are owned by GitHub_Integration, chat rollback and
  recovery anchors remain owned by UI_Command_Catalog, and compatibility
  shorthands such as local-git and worktree/push route through
  Primitive:PatchPipeline and Source Control owners without letting consumer
  help text define conflict precedence.
gui_related: true
gui_classification_reason: This unit governs concrete UI command anchors and chat recovery commands.
split_recommended: true
split_recommendation_reason: Crosswalk-S0031 is split across Source Control operation, identity, command, and cross-surface panel concerns.
depends_on: [C-039, C-040]
unblocks: [C-042]
acceptance_criteria:
  - "Git/diff commands remain owned by GitHub_Integration."
  - "Chat rollback/recovery commands remain owned by UI_Command_Catalog."
  - "Compatibility shorthands route through Primitive:PatchPipeline and Source Control owner docs."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: git_chat_command_boundary_drift
reasoning_tier: high
context_scope: git_diff_commands_chat_recovery_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/GitHub_Integration.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: git_diff_commands_chat_recovery_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0031
preserved_exact_tokens:
  - "`cmd.git.stage`"
  - "`cmd.git.unstage`"
  - "`cmd.git.discard`"
  - "`cmd.git.diff_open`"
  - "`cmd.git.diff_toggle_mode`"
  - "`cmd.chat.rewind`"
  - "`cmd.chat.revert`"
  - "`/local-git`"
  - "`/worktree/push`"
  - "`Primitive:PatchPipeline`"
  - "`conflict-precedence`"
negative_constraints:
  - "Chat rollback/recovery anchors remain owned by UI_Command_Catalog."
  - "Consumer help text must not define conflict precedence."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/GitHub_Integration.md
  - Plans/UI_Command_Catalog.md
```

### C-042 - Cross Surface Panel Context Receipt Boundary

```yaml
plan_unit_id: C-042
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Cross-surface actions Open in Source Control, Open in Actions & Pipelines, and
  Open in Docker Manager use canonical route_target context and receipt-extension
  payloads that extend shared runtime receipts and blocked packets with domain
  capability and identity refs without creating a second receipt, navigation, or
  index owner. Open in GitHub Actions is migration input for the canonical
  automation occupant with an explicit GitHub AutomationBinding.
gui_related: true
gui_classification_reason: This unit governs cross-surface panel actions, blocked cards, destination panels, and deep links.
split_recommended: true
split_recommendation_reason: Crosswalk-S0031 is split across Source Control operation, identity, command, and cross-surface panel concerns.
depends_on: [C-039, C-040, C-041, FGI-012, CV-327]
unblocks: [C-043, C-044]
acceptance_criteria:
  - "Cross-surface actions use exactly Open in Source Control, Open in Actions & Pipelines, and Open in Docker Manager when canonical context exists."
  - "Open in GitHub Actions normalizes to repository_automation with an explicit GitHub AutomationBinding and has no peer occupant or handler."
  - "panel-switch navigation consumes route_target instead of panel-local ad hoc arguments."
  - "receipt-extension payloads extend shared runtime receipt and blocked-payload packets without creating second owners."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: panel_context_receipt_boundary_drift
reasoning_tier: high
context_scope: cross_surface_panel_context_receipt_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/GitHub_Integration.md
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: cross_surface_panel_context_receipt_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0031
preserved_exact_tokens:
  - "`Open in Source Control`"
  - "`Open in GitHub Actions`"
  - "`Open in Actions & Pipelines`"
  - "`Open in Docker Manager`"
  - "`panel-switch`"
  - "`panel-context`"
  - "`project_id`"
  - "`repo_id`"
  - "`worktree_id`"
  - "`workflow_id`"
  - "`container_id`"
  - "`image_ref`"
  - "`publish_result_id`"
  - "`/registry/Kubernetes/SSH`"
  - "`/index/reference`"
negative_constraints:
  - "Per-project panel state and run receipts spanning SCM/Actions/Docker/Kubernetes are not underdefined local UI extras."
  - "receipt-extension payloads do not create a second receipt, navigation, or index owner."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/GitHub_Integration.md
  - Plans/Containers_Registry_and_Unraid.md
```

### C-043 - GitHub Actions Surface Identity Boundary

```yaml
plan_unit_id: C-043
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  GitHub-specific workflow and administration behavior uses GitHub API identity
  and capability, not Git transport state, inside an explicit GitHub
  AutomationBinding selected by the canonical repository_automation / Actions &
  Pipelines occupant. Current Branch, Workflows, and Settings remain GitHub-native
  subviews; GitHub API remains hidden plumbing, and GitHubActionsSurface,
  github_actions, and Git (GitHub) are migration inputs rather than owner or
  occupant changes.
gui_related: true
gui_classification_reason: This unit governs GitHub-native automation subviews inside the provider-neutral Actions & Pipelines occupant and its visible migration labels.
split_recommended: false
depends_on: [C-042, FGI-012]
unblocks: [C-046]
acceptance_criteria:
  - "A GitHub AutomationBinding uses GitHub API identity and capability rather than Git transport state."
  - "Current Branch, Workflows, and Settings are GitHub-native subviews inside the one Actions & Pipelines occupant."
  - "GitHub API remains hidden plumbing, not a user panel."
  - "GitHubActionsSurface, github_actions, and Git (GitHub) are migration inputs that do not create another occupant, handler, or owner."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: github_automation_binding_or_occupant_identity_drift
reasoning_tier: high
context_scope: github_automation_binding_surface_identity_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Forge_Integrations.md
  - Plans/FinalGUISpec.md
  - Plans/GitHub_Integration.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/newtools.md
node_compile_hint:
  mode: github_automation_binding_surface_identity_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0032
preserved_exact_tokens:
  - "`GitHubActionsSurface`"
  - "`repository_automation`"
  - "`Actions & Pipelines`"
  - "`AutomationBinding`"
  - "`github_actions`"
  - "`GitHub API`"
  - "`Current Branch`"
  - "`Workflows`"
  - "`Settings`"
  - "`Git (GitHub)`"
  - "ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/newtools.md"
negative_constraints:
  - "GitHub API plumbing is hidden and must not be exposed as a user panel."
  - "Final GUI migration labels such as Git (GitHub) are routing aliases, not owner changes."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Forge_Integrations.md
  - Plans/FinalGUISpec.md
  - Plans/GitHub_Integration.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/newtools.md
```

### C-044 - Docker Manager Umbrella Persistence Boundary

```yaml
plan_unit_id: C-044
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  DockerManagerSurface is the canonical umbrella for Docker, Podman,
  registries/Docker Hub, compose, build/bake, Publish/Unraid, and
  project-focused Kubernetes; it owns runtime/build/publish and project
  operations while routing persistence as global settings plus project-scoped
  state and reusing newtools doctor/result minima rather than inventing
  parallel IDs.
gui_related: false
gui_classification_reason: This unit defines surface ownership and persistence boundaries rather than visual presentation.
split_recommended: false
depends_on: [C-042]
unblocks: [C-045, C-046]
acceptance_criteria:
  - "Docker Manager is the canonical umbrella for Docker, Podman, registries, compose, build/bake, Publish/Unraid, and project-focused Kubernetes."
  - "/Podman/Kubernetes wording remains compatibility shorthand."
  - "Unraid and Kubernetes are not required top-level shell surfaces for MVP."
  - "Docker Manager reuses newtools doctor IDs and result payload shapes instead of inventing parallel IDs."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: docker_manager_persistence_boundary_drift
reasoning_tier: high
context_scope: docker_manager_umbrella_persistence_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/newtools.md
node_compile_hint:
  mode: docker_manager_umbrella_persistence_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0033
preserved_exact_tokens:
  - "`DockerManagerSurface`"
  - "`Docker Manager`"
  - "`Docker/Podman/Kubernetes`"
  - "`/Podman/Kubernetes`"
  - "`Publish / Unraid`"
  - "`/runtime/build/publish`"
  - "`/build/compose/registry/publish/Kubernetes`"
  - "`/runtime/context`"
  - "`/context/workload`"
  - "ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md"
negative_constraints:
  - "`/Podman/Kubernetes` wording is a compatibility shorthand, not separate shell ownership."
  - "Unraid and Kubernetes are not required top-level shell surfaces for MVP."
  - "Docker Manager must not invent parallel doctor IDs or result payload shapes."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/newtools.md
```

### C-045 - External Reference Baseline Non-Ownership

```yaml
plan_unit_id: C-045
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  External references for Git worktrees, VS Code/SCM, GitHub Actions, Docker,
  Kubernetes, JetBrains, GitLens, and GitKraken-style behavior remain
  reconciliation inputs that may inform owner-doc wording without becoming live
  product owners.
gui_related: false
gui_classification_reason: This unit defines evidence/reference status and owner boundaries.
split_recommended: false
depends_on: [C-039, C-043, C-044]
unblocks: [C-046]
acceptance_criteria:
  - "External references remain useful reconciliation inputs."
  - "External references do not become live product owners."
  - "Owner-doc wording remains controlled by canonical Plans."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: external_reference_owner_leak
reasoning_tier: standard
context_scope: external_reference_baseline_non_ownership
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/GitHub_Integration.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: external_reference_baseline_non_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0034
preserved_exact_tokens:
  - "`git-scm.com/docs/git-worktree`"
  - "`/docs/git-worktree`"
  - "`/committing`"
  - "`/fetch/pull/push`"
  - "`/outgoing`"
  - "`Current Branch`"
  - "`Workflows`"
  - "`Settings`"
  - "`logs`"
  - "`exec`"
  - "`port-forward`"
  - "`/logs/exec/port-forward/Helm/workload`"
  - "ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/UI_Command_Catalog.md"
negative_constraints:
  - "External references are reconciliation inputs and must not become live product owners."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/GitHub_Integration.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/UI_Command_Catalog.md
```

### C-046 - Feature Owner Precedence And Action ID Compatibility

```yaml
plan_unit_id: C-046
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  When feature-owner docs disagree, Crosswalk records owner precedence and
  secondary-doc constraints; newtools owns Docker and Actions doctor IDs/result
  minima, usage-feature owns cost_usage and deep-link usage identity, Section15
  owns workspace/thread/browser/dev-session identities, UI_Wiring_Rules and
  Wiring_Matrix own command gating, blocked routing stays with Contracts_V0 and
  destination owners, and canonical blocked/recovery payloads use ordered
  allowed_action_ids.
gui_related: true
gui_classification_reason: This unit governs visible doctor IDs, Usage/Ledger deep links, blocked routing, and action-id behavior.
split_recommended: true
split_recommendation_reason: Crosswalk-S0035 is split across feature-owner precedence, HITL action-list, and secondary cleanup concerns.
depends_on: [C-038, C-043, C-044, C-045]
unblocks: [C-047, C-048]
acceptance_criteria:
  - "Consumer wording does not decide feature-owner conflicts."
  - "doctor.registry.auth remains deprecated alias and doctor.dockerhub.auth.capability is the preferred visible ID."
  - "blocked routing is owned by Contracts_V0 and destination feature owners, not retyped locally."
  - "Legacy allowed_actions[] is compatibility-only; canonical blocked and recovery payloads use ordered allowed_action_ids[]."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: feature_owner_precedence_action_id_drift
reasoning_tier: high
context_scope: feature_owner_precedence_action_id_compatibility
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/newtools.md
  - Plans/usage-feature.md
  - Plans/Executor_Protocol.md
  - Plans/human-in-the-loop.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: feature_owner_precedence_action_id_compatibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0035
preserved_exact_tokens:
  - "`newtools.md`"
  - "`doctor.registry.auth`"
  - "`doctor.dockerhub.auth.capability`"
  - "`cost_usage`"
  - "`/deep-link/usage`"
  - "`/workspace/thread/browser/dev-session`"
  - "`/gating`"
  - "`/internal`"
  - "`/blocked`"
  - "`safe point`"
  - "`restore point`"
  - "`allowed_actions[]`"
  - "`allowed_action_ids[]`"
negative_constraints:
  - "Consumer wording must not decide feature-owner conflicts."
  - "`/blocked` routing must not be retyped locally by Crosswalk."
  - "Legacy `allowed_actions[]` is compatibility-only; canonical blocked and recovery payloads use ordered `allowed_action_ids[]`."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/newtools.md
  - Plans/usage-feature.md
  - Plans/Executor_Protocol.md
  - Plans/human-in-the-loop.md
  - Plans/Contracts_V0.md
```

### C-047 - HITL Action List Vocabulary Boundary

```yaml
plan_unit_id: C-047
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  HITL approval requests may use explicit action-list vocabulary only where
  Contracts_V0 owns the request shape; blocked and recovery payloads stay on
  canonical action-id and allowed_action_ids naming so implementers do not
  guess between HITL and recovery fields.
gui_related: false
gui_classification_reason: This unit defines payload vocabulary ownership rather than UI presentation.
split_recommended: true
split_recommendation_reason: Crosswalk-S0035 is split across feature-owner precedence, HITL action-list, and secondary cleanup concerns.
depends_on: [C-046]
unblocks: [C-048]
acceptance_criteria:
  - "HITL approval requests use action-list vocabulary only where Contracts_V0 owns the request shape."
  - "Blocked/recovery payloads stay on canonical action-id and allowed_action_ids naming."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hitl_action_list_vocabulary_drift
reasoning_tier: high
context_scope: hitl_action_list_vocabulary_boundary
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: hitl_action_list_vocabulary_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0035
preserved_exact_tokens:
  - "`HITL`"
  - "`Contracts_V0`"
  - "`action-list`"
  - "`action-id`"
  - "`allowed_action_ids[]`"
negative_constraints:
  - "Action-list vocabulary is allowed only where Contracts_V0 owns the request shape."
  - "Blocked/recovery payloads must stay on canonical action-id and allowed_action_ids naming."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
```

### C-048 - Secondary Consumer Cleanup UI State Resolution

```yaml
plan_unit_id: C-048
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Secondary broad-pass cleanup keeps chat and file-tree docs as consumers of the
  legacy Git/GitHub model until reconciled with feature-owner docs, preserves
  git* and actions* built-in chat namespaces, leaves Docker/registry/Kubernetes
  operational identity outside Multi-Account unless later moved by an owner doc,
  and resolves underdefined UI-state contracts in named surface owner docs
  rather than consumer-only state.
gui_related: true
gui_classification_reason: This unit governs chat/file-tree consumers, built-in chat namespaces, and underdefined UI-state contracts.
split_recommended: true
split_recommendation_reason: Crosswalk-S0035 is split across feature-owner precedence, HITL action-list, and secondary cleanup concerns.
depends_on: [C-046, C-047]
unblocks: []
acceptance_criteria:
  - "Chat and file-tree docs remain consumers of the legacy Git/GitHub model until reconciled with feature-owner docs."
  - "git* and actions* remain built-in chat command namespaces."
  - "Docker/registry/Kubernetes operational identity is not owned by Multi-Account unless a later owner doc explicitly moves it."
  - "Underdefined UI-state contracts are resolved in named surface owner docs rather than by adding consumer-only state."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: secondary_consumer_ui_state_owner_drift
reasoning_tier: high
context_scope: secondary_consumer_cleanup_ui_state_resolution
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/newtools.md
  - Plans/usage-feature.md
  - Plans/Executor_Protocol.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: secondary_consumer_cleanup_ui_state_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0035
preserved_exact_tokens:
  - "`chat and file-tree`"
  - "`legacy Git/GitHub model`"
  - "`git*`"
  - "`actions*`"
  - "`Docker/registry/Kubernetes`"
  - "`Multi-Account`"
  - "`/underdefined`"
  - "`recovery_options`"
  - "`recovery_options[]`"
  - "`allowed_action_ids`"
negative_constraints:
  - "Docker/registry/Kubernetes operational identity is not owned by Multi-Account unless a later owner doc explicitly moves it."
  - "`/underdefined` UI-state contracts must be resolved in the named surface owner docs rather than by adding consumer-only state."
  - "Prescriptive recovery_options or recovery_options[] wording must be retired in favor of allowed_action_ids and allowed_action_ids[]."
owner_hints:
  - Plans/Crosswalk.md
  - Plans/newtools.md
  - Plans/usage-feature.md
  - Plans/Executor_Protocol.md
  - Plans/human-in-the-loop.md
```

### C-001 - Crosswalk Source-Preserving Bridge Retired

```yaml
plan_unit_id: C-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  The former Crosswalk source-preserving bridge is retired in place after Phase
  2B atomized or structurally dispositioned Crosswalk-S0001 through
  Crosswalk-S0039 into C-002 through C-048 or explicit structural coverage.
  C-001 remains only as migration lineage for the retired bridge span and must
  not re-own atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- C-001 no longer uses the source-preserving PlanUnit compile hint.
- Prior source coverage remains carried by C-002 through C-048 and structural coverage_map dispositions.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- Coverage for the retired bridge is recorded in the Phase 2B batch 042 coverage map.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/Crosswalk.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Crosswalk-S0038
preserved_exact_tokens:
- C-001
- source_preserving_planunit
- C-002
- C-048
negative_constraints:
- "Do not remap atomized Crosswalk spans back to C-001."
- "Do not treat the retired bridge as implementation-ready product coverage."
- "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit."
compatibility_only_notes:
- "The old source-preserving bridge is retained only so migration lineage and historical references to C-001 remain auditable."
owner_hints:
- Plans/Crosswalk.md
```

## Migration Coverage

Original hash: `b3ab29d3fdfc69b5ac8ad8d1f6c9d2873085fa86f03b37bb459fba8bf6e57564`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Crosswalk-S0001` through `Crosswalk-S0039` are preserved in place. Phase 2B batch 041 atomized or structurally dispositioned `Crosswalk-S0001` through `Crosswalk-S0028` into fine-grained PlanUnits `C-002` through `C-037` or explicit structural dispositions. Phase 2B batch 042 atomized or structurally dispositioned `Crosswalk-S0029` through `Crosswalk-S0039` into fine-grained PlanUnits `C-038` through `C-048`, the retired migration-lineage bridge `C-001`, or explicit structural dispositions. `C-001` is retained only as a retired bridge and must not re-own atomized source coverage. This phase did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

## Ledger Compile Addendum - pldg-20260614-001

### C-049 - Boundary Stub And Route Open Fallback Recovery

```yaml
plan_unit_id: C-049
unit_type: constraint
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Crosswalk top stubs for coverage blocker, route/open fallback, package/worktree allocation, and boundary maps recover as owner pointers.
  Crosswalk may map boundaries and precedence but must not re-own Contracts route/open primitives, storage records, Executor runtime policy,
  worktree allocation, or Persona/subagent registry semantics.
gui_related: true
gui_classification_reason: Crosswalk boundary maps include GUI route/open and page destination relationships, even though Crosswalk is not a visual implementation doc.
depends_on: [C-001]
unblocks: []
acceptance_criteria:
  - Base route/open primitives landed, but missing: is retired or converted to an owner pointer.
  - coverage blocker headings point to the owner doc that actually owns the blocked behavior.
  - Crosswalk does not preserve stale boundary-map text as peer canon.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual Crosswalk owner-pointer review
risk_class: crosswalk_owner_drift
reasoning_tier: standard
context_scope: cross_doc_boundary_map
implementation_surfaces: [Plans/Crosswalk.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/WorktreeGitImprovement.md]
node_compile_hint: {mode: crosswalk_owner_pointer_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0068
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0073
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0074
preserved_exact_tokens: ["Coverage blocker", "Base route/open primitives landed, but missing:", "route/open fallback", "boundary-map owner pointers"]
negative_constraints:
  - Do not let Crosswalk become the owner for route/open primitives or worktree allocation.
owner_hints: [Plans/Crosswalk.md, Plans/Contracts_V0.md, Plans/WorktreeGitImprovement.md, Plans/Executor_Protocol.md]
```


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### C-050 - PRD Builder And Planning Wizard Term Routing

```yaml
plan_unit_id: C-050
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: 'The finished-product feature formerly called Requirements Doc Builder is named PRD Builder everywhere in user-facing UI and canonical product documentation. The canonical product name is Planning Wizard; Chain Wizard and Plan Wizard are stale names that must be retired from active product prose, UI, commands, events, and contracts. Review, split, update, or retire Plans/chain-wizard.md and Plans/chain-wizard-flexibility.md into the new PRD Builder and Planning Wizard owners, preserving still-valid requirements and explicitly retiring stale workflow concepts. Run a doc-impact pass over Assistant Chat, Goal Runtime, Planning Ledger, Plan Document, Plan Compile, Automated Testing, Executor, Orchestrator, Personas, Models, FileSafe, Git/worktree, GitHub, permissions, contracts, commands, GUI, wiring, artifacts, indexes, and reference docs.'
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
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Crosswalk.md
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
- Plans/00-plans-index.md
- Plans/Planning_Wizard.md
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0001
- pldg-20260618-001-prd-planning-wizard:atom-0002
- pldg-20260618-001-prd-planning-wizard:atom-0159
- pldg-20260618-001-prd-planning-wizard:atom-0160
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/01-naming-and-boundaries.md#SRC-NAMING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/10-doc-and-contract-impact.md#SRC-IMPACT
source_atom_ids:
- atom-0001
- atom-0002
- atom-0159
- atom-0160
decision_refs:
- dec-0001
- dec-0029
correction_refs:
- corr-0001
- corr-0002
preserved_exact_tokens:
- PRD Builder
- Requirements Doc Builder
- Planning Wizard
- Chain Wizard
- Plan Wizard
- Plans/chain-wizard.md
- Plans/chain-wizard-flexibility.md
- doc-impact pass
negative_constraints:
- Do not preserve Requirements Doc Builder as a current product feature name except in explicitly historical migration notes.
- Do not use Chain Wizard or Plan Wizard as current terminology.
- Do not perform a blind filename or term replacement that preserves obsolete ownership and workflow.
owner_hints:
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
- Plans/00-plans-index.md
- Plans/Planning_Wizard.md
- Plans/Crosswalk.md
- Plans/Wiring_Matrix.md
```

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime Crosswalk pointer rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-276a3e41fd08d5c4adaff514` and `sfk-973c4b99a2e3f9e5ad705e53`: `max_subagents_spawn` is owned by `Plans/interview-subagent-integration.md` as `interview.max_subagents_spawn`. Crosswalk may route to that owner but must not invent a separate field.

## Touch Closure Authority Addendum - 2026-09-01

### C-051 - Touch Closure Authority And Consumer Routing

```yaml
plan_unit_id: C-051
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  The Touch Closure Matrix is a machine crosswalk across existing owners, not a
  new runtime owner. Commands System owns command identities and sole future-handler
  bindings; UI Command Catalog owns GUI consumers and reverse reachability; Wiring
  Matrix owns static production-intent rows; UI Wiring Rules owns dispatch and return
  invariants; and each named domain owner owns its typed request, result, error,
  availability, permission, persistence, receipt, event, and projection contracts.
  Plans/touch_closure.json joins those authorities by exact keys and records their
  dispositions. A closed row proves canonical static coverage only; it does not prove
  a native handler, running service, browser behavior, visual quality, evidence
  freshness, implementation readiness, or Slint certification.
gui_related: true
gui_classification_reason: Reverse reachability maps commands and local UI actions to every intended visible PMConcept7 consumer.
split_recommended: false
depends_on: [C-050, CS-074, UCC-152, WM-051, UIW-017]
unblocks: [DR-041, CV-326, 0PI-068]
acceptance_criteria:
  - "Every actionable command row points to Commands System, exactly one owner handler identity, one typed owner contract, and every intended GUI consumer."
  - "Every typed local UI action remains owner-local and is not promoted into a domain command or production handler."
  - "Aliases normalize to exact canonical targets without peer production rows or peer handlers."
  - "The matrix preserves the exact resolved denominator of 560 rows: 401 primary commands, 51 aliases, 101 typed local UI actions, and 7 presentation behaviors; 400 primary commands are actionable and one is explicitly blocked."
  - "Static crosswalk closure is never reported as native runtime, visual, motion, accessibility, performance, recovery, security, readiness, or Slint evidence."
validation_surfaces:
  - python3 scripts/pm-touch-closure-verify.py --json
  - python3 scripts/pm-server-command-gap-verify.py --json
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
risk_class: crosswalk_runtime_authority_or_reverse_wiring_drift
reasoning_tier: high
context_scope: touch_closure_owner_consumer_routing
implementation_surfaces:
  - Plans/Crosswalk.md
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
  - Plans/UI_Wiring_Rules.md
  - Plans/touch_closure.json
  - Plans/touch_closure.schema.json
node_compile_hint: {mode: machine_crosswalk_static_coverage_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Commands_System.md#cs-074---remaining-packet-command-production-intent-and-sole-future-handler-closure
  - Plans/UI_Command_Catalog.md#ucc-152---remaining-packet-command-reverse-gui-coverage
  - Plans/Wiring_Matrix.md#wm-051---remaining-packet-command-production-intent-wiring
  - Plans/UI_Wiring_Rules.md#uiw-017---remaining-packet-command-dispatch-return-and-disabled-state-closure
preserved_exact_tokens: [touch_closure.json, command_id, sole_handler, schema_ref, reverse_consumers, production-intent, typed local UI action]
negative_constraints:
  - "Do not make Touch Closure a runtime owner, schema owner, event authority, or evidence authority."
  - "Do not infer a native handler or production implementation from a future-handler or production-intent row."
  - "Do not invent a GUI control merely to make reverse coverage appear complete."
owner_hints: [Plans/Crosswalk.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md, Plans/UI_Wiring_Rules.md]
```

## Forge/Backup/tsnet Owner And Route Reconciliation Addendum - 2026-09-01

The following AUTH preservation matrix is part of the accepted `C-052` boundary. It is a lossless owner/evidence route, not an umbrella implementation claim:

| Packet row | Preserved substance and semantic owners | Current evidence boundary |
|---|---|---|
| `AUTH-001` | Packet decisions govern affected scope; newer live canon governs untouched behavior; preserved tsnet detail and older sources remain lineage. `Contracts_V0` and Crosswalk select current owners and require an actual baseline revision, protected dirty-tree receipt, owner/action/route map, and hash/evidence for reused or reopened closure. | Owner selection and lineage are static; the actual baseline revision, dirty-tree receipt, accepted execution plan, and diff/release proof remain partial and must come from the later execution transaction. |
| `AUTH-002` | `Server_System`, `storage-plan`, `Project_System`, and Project Sync preserve seglog/redb/Tantivy/CAS, absolute no-SQLite, small Server Catalog plus physical Project Vaults, one Home Server/writer, distinct Home Server/Execution Host/Source Location/environment/Client/Move, and typed permissioned cross-Project operations. Backup is recovery, never writable replica, multi-master sync, public-plane storage, or canonical remote state. | Static owner/schema references only; no storage migration, writer-fence, backup barrier, or runtime restore evidence. |
| `AUTH-003` | Platform/deployment/release owners retain full native Windows/macOS/Linux and standalone Server execution; Docker Hub is wrapped by TrueNAS Apps and Unraid Community Applications; Kubernetes stays a deployment target; TrueNAS modular Compose and Unraid XML obligations remain; WSL2 is optional/non-degrading; Apple Linux and native/virtualized/compatibility/cross-target proof remain truthful. Origin CLI availability cannot make Windows WSL mandatory. | Package/platform requirements are preserved; supported-version, artifact, native execution, package-install, and release evidence remain partial. |
| `AUTH-004` | `Project_System`, Settings, Project Sync/Backbone, Shared Runtime, and Backup retain concrete independent Project settings, roughly ten selectable copy categories, same-Server profile references, optional preview, pre-copy recovery, atomic apply/rollback, distinct template/configuration/history duplication, device-local window realization, Client-independent Goals/chats, and checkpoint/fence/source-reconciled handoff/Move. | Static consumer and copy/move contracts only; no executable copy, rollback, handoff, continuity, or native GUI proof. |
| `AUTH-005` | Application update/release owners retain Automatic Updates On/Off, Check for Updates, bottom-status Update Available, internal cadence/asynchronous checks, signature/provenance, drain/checkpoint, pre-update recovery, install-source authority, migration/rollback, and separation among app, content/catalog, external tool/source-control, connector, and Backup updates. Backup daily/weekly/monthly retention never becomes an app-update schedule picker. | Separation is canonical; updater, connector artifact, rollback, and release evidence remain partial. |
| `AUTH-006` | Server/Remote Access/Final GUI owners retain LAN discovery and stable `server_id` deduplication; Tailscale/Headscale private access, hosted Funnel, NGINX/Traefik, existing VPN/manual routes, and approved Cloudflare-reference accountless Remote Link; no Tailcat without pricing approval, Tor, or Rust Tailscale backend. The source token `Built into PuppetMaster` is preserved while visible brand copy normalizes spacing to `Built into Puppet Master`; permanent web, future Swift/Kotlin, Slint/theme/motion/accessibility contracts remain, with no Backup Activity Bar occupant or redundant Assistant Chat host banner. | Route/UI obligations are static; WAN reachability, connector, native/web GUI, accessibility, theme/width/motion, and visual proof remain partial. |
| `AUTH-007` | Authentication Broker, scoped Credential Broker, Shared Integration Runtime, FileSafe, RuntimeResourceGovernor, ObservableWork, release tool lifecycle, and human-only protected sessions remain single shared owners. No PM Playwright backend/facade, agent/recording access to auth/key sessions, project-triggered provider installation, offline-tool product, or model-token classification for maintenance. | Owner references and secret-negative schemas are static; provider acquisition, protected-session isolation, resource behavior, and security proof remain partial. |
| `AUTH-008` | Forge owns the explicit GitHub-to-provider-neutral `repository_automation`/Actions & Pipelines migration while preserving GitHub compatibility. Backup owns explicit reviewed expansion of new-Project scope to PM data plus source and Git/JJ history; existing users are not silently opted into larger uploads. Restic/rclone is a reference design, not permission to displace an evidenced equivalent. New billing, exposure, destructive deletion, secret export, scope expansion, or account switch requires explicit consent and migration receipt. | Scope/migration/consent contracts are static; user migration, consent, provider billing/exposure, executable conversion, and release proof remain partial. |

### C-052 - Forge/Backup/tsnet Owner Precedence And Exact Route Context

```yaml
plan_unit_id: C-052
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  The post-integration Forge, Backup, and PM-managed connector transaction routes
  every semantic field to its existing domain owner and every cross-surface open,
  continuation, and reverse-navigation flow through CV-327. Forge Integrations
  owns distinct Forgejo/Gitea profiles, RepositoryForgeBinding, independent
  AutomationBinding, and the sole repository_automation / Actions & Pipelines
  occupant. Backup Restore owns destinations, repositories, RecoverySet/Kit,
  immutable snapshots/capture sets, retention, browse/retrieve, and RestoreRun.
  Source Control/JJ supply native closure and reconciliation only. Server owns
  server_id/trust/pairing; Remote Access owns the PM connector and route provenance;
  shared auth/runtime/storage owners retain their existing primitives and custody.
  Crosswalk selects and orders these owners without copying their schemas, commands,
  handlers, state machines, events, or runtime claims.
gui_related: true
gui_classification_reason: This boundary controls the visible Actions & Pipelines migration, exact snapshot/filter/focus return, Bootstrap recovery scope, endpoint provenance, and all consumer handoffs.
split_recommended: false
depends_on: [C-007, C-024, C-039, C-042, C-043, C-051, CV-327, FGI-012, BRS-014, BRS-016, RAS-015, SCS-013, SCS-014, JJI-008, SRV-013, SIR-032, SP-254, F3-528]
unblocks: []
acceptance_criteria:
  - "Crosswalk precedence chooses the owner; the newest accepted owner PlanUnit supplies domain semantics and later scoped supersession makes contradictory older examples compatibility lineage."
  - "Forgejo and Gitea remain distinct provider identities, RepositoryForgeBinding and AutomationBinding remain independent, and repository_automation / Actions & Pipelines is the sole automation occupant."
  - "github_actions and Open in GitHub Actions are migration inputs that normalize to the canonical occupant with an explicit GitHub binding; neither has a peer handler, panel, command family, or provider-neutral authority."
  - "Backup reverse navigation binds immutable repository/snapshot/capture-set, Project/Server scope, filter, focus, currentness generation, and return route; refresh never substitutes latest or another object."
  - "Fresh Full Server recovery uses explicit Bootstrap scope before a Project exists; Files, Projects, SCM/JJ, Settings, Onboarding, Doctor, and Final GUI remain consumers of Backup-owned behavior."
  - "Server identity/trust/pairing remains distinct from Remote-Access connector identity and route provenance; connector-private, hosted Funnel, and external host-managed routes do not imply trust or equivalence."
  - "Auth/profile, protected browser, Permissions, governor, ObservableWork, lease, outbox, persistence, and redaction remain with their existing owners; no domain obtains a peer shared runtime or secret store."
  - "All new commands remain owner-routed, event-silent where expected_event_types=[], and handler_unavailable until independent native evidence exists; this Crosswalk adds no command, handler, EventRecord, or runtime proof."
  - "The AUTH-001..AUTH-008 matrix above preserves authority/baseline and dirty-tree receipt, no-SQLite/Home-writer architecture, platform/package obligations, Project settings/continuity, app-update separation, WAN/UI and spaced-brand normalization, shared safety/resource owners, and explicit scope/migration/consent through real semantic owners without re-owning them."
  - "CMDX-001/CMDX-002 keep one semantic owner command/handler and the common non-secret operation envelope; external-effect states are accepted, running, outcome_unknown, observed_complete, failed, partial, and cancelled, and protected material uses separate channels."
  - "Executable/native/provider/security/visual/accessibility/performance evidence, baseline and dirty-tree receipts, actual diff/release artifacts, and PROC-001/PROC-002 execution remain partial; C-052 does not mark them implemented."
validation_surfaces:
  - Plans/Contracts_V0.md#cv-327---cross-owner-route-scope-immutable-selection-and-provenance-binding
  - Plans/Forge_Integrations.md#fgi-012---distinct-self-hosted-providers-and-independent-automation-authority
  - Plans/Backup_Restore_System.md#brs-014---snapshot-browse-retrieve-compare-export-and-archive-delivery
  - Plans/Remote_Access_System.md#ras-015---pm-owned-go-tsnet-connector-durable-authorization-and-private-route-replacement
  - Plans/Shared_Integration_Runtime.md#sir-034---backup-shared-primitives-and-common-external-effect-envelope
  - Plans/Project_System.md#pjct-005---project-backup-preference-copy-move-and-recovery-consumption
  - Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/BackupSharedRuntimeConsumptionRecord
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plan-index.py validate
risk_class: cross_owner_duplication_or_exact_return_loss
reasoning_tier: high
context_scope: forge_backup_tsnet_owner_and_route_precedence
implementation_surfaces: [Plans/Crosswalk.md, Plans/Contracts_V0.md]
node_compile_hint: {mode: crosswalk_owner_routing_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:AUTH-001-AUTH-008
  - source_ref:packet:2026-09-01:OWN-001-OWN-006
  - source_ref:packet:2026-09-01:CMDX-001-CMDX-004
  - source_ref:packet:2026-09-01:PROC-001-PROC-003
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_tsnet_reconciliation.md
preserved_exact_tokens: [Forgejo, Gitea, RepositoryForgeBinding, AutomationBinding, repository_automation, "Actions & Pipelines", github_actions, RecoverySet, Recovery Kit, snapshot_id, capture_set_id, server_id, server_endpoint_id, remote_route_id, connector_id, pm-tailnet-connector, route_provenance_ref, seglog, redb, Tantivy, CAS, no-SQLite, "Built into PuppetMaster", "Built into Puppet Master", RuntimeResourceGovernor, ObservableWork, outcome_unknown, observed_complete, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - "Do not create an umbrella Forge/Backup/connector runtime, copied schema, peer command family, peer handler, peer auth broker, peer scheduler, or peer secret store in Crosswalk."
  - "Do not infer automation from repository hosting, Backup access from tailnet login, Server trust from reachability, or successful restore from browse/static schema evidence."
  - "Do not retarget stale routes, select latest, fabricate Project/Server identity, or place protected material in route context."
  - "Do not claim native handler, runtime, provider, connector, restore, security, visual, accessibility, readiness, or Slint proof from this owner map."
  - "Do not treat the AUTH matrix or preserved PROC references as an accepted execution plan, baseline/dirty-tree receipt, executable diff, release proof, runtime implementation, or completed PROC-001/PROC-002 evidence."
owner_hints: [Plans/Crosswalk.md, Plans/Contracts_V0.md, Plans/Forge_Integrations.md, Plans/Backup_Restore_System.md, Plans/Remote_Access_System.md]
```
