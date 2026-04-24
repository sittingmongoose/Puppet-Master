# Crosswalk (Canonical)

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
This file uses primitive names as **routing labels** only; detailed schemas belong to their SSOT documents.

- `Primitive:Provider` -- provider CLIs and their normalized streams (see `Plans/CLI_Bridged_Providers.md`).
- `Primitive:Tool` -- host tools invoked by Puppet Master (see `Plans/Tools.md`).
- `Primitive:UICommand` -- stable UI command IDs (see `Plans/Contracts_V0.md#UICommand` and `Plans/UI_Command_Catalog.md`).
- `Primitive:SessionStore` -- persistent store boundaries (see `Plans/storage-plan.md`).
- `Primitive:PatchPipeline` -- Git + PR workflows (see `Plans/WorktreeGitImprovement.md` and `Plans/GitHub_API_Auth_and_Flows.md`).
- `Primitive:DocumentPane` -- embedded document navigation and editing surface contract (see `Plans/FinalGUISpec.md` and `Plans/FileManager.md`).
- `Primitive:DocumentReviewSurface` -- workflow-level document review routing and tri-location pointers (see `Plans/chain-wizard-flexibility.md`, `Plans/interview-subagent-integration.md`, and `Plans/assistant-chat-design.md`).
- `Primitive:ReviewFindingsSummary` -- structured Multi-Pass findings summary and rendering contract (see `Plans/chain-wizard-flexibility.md`, `Plans/interview-subagent-integration.md`, and `Plans/FinalGUISpec.md`).
- `Primitive:ReviewApprovalGate` -- final approval gate contract for revised document bundles (see `Plans/chain-wizard-flexibility.md`, `Plans/interview-subagent-integration.md`, and `Plans/Project_Output_Artifacts.md`).
- `Primitive:DocumentCheckpoint` -- checkpoint and restore contracts for document revisions (see `Plans/storage-plan.md`, `Plans/Project_Output_Artifacts.md`, and `Plans/FileManager.md`).
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
The source control lane, worktree, and open-file system are owned by the FileManager. However, navigation through opened files (following includes, tracing references) remains a GUI responsibility coordinated through open/route semantics.

### 3.4 Source Control and lane/worktree ownership
FileManager owns the git/worktree model and lane assignments. Crosswalk clarifies when navigation crosses lanes and how that affects artifact visibility and approval scope.

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
| Shell environment isolation and shell lifecycle | `Plans/orchestrator-subagent-integration.md` + `Plans/Tools.md` jointly |
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
- consumer docs may extend display metadata but MUST NOT redefine terminal or event identity primitives

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

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
- Annotation lifecycle is `open -> addressed -> resolved`.
- Anchor storage MUST include both `TextPositionSelector { start, end }` and `TextQuoteSelector { exact, prefix, suffix }` when deterministic source text exists.

ContractRef: Primitive:DocumentInlineNotes, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

- Re-anchoring is deterministic: 1) position selector match, else 2) quote selector match using prefix/suffix preference, else 3) keep the annotation open and surface `Anchor not found — reselect to re-anchor`.
- `comment` annotations may coexist with any other annotation on the same span.
- Overlapping mutating annotations conflict by default and are excluded from automatic targeted revision until resolved.
- `Send selection to chat` is adjacent behavior, not a durable annotation by default.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md

---

### 3.15 TargetedRevisionPass
**Owner:** Workflow semantics in `Plans/chain-wizard-flexibility.md` and `Plans/interview-subagent-integration.md`; UI placement in `Plans/FinalGUISpec.md`; prompt and persistence details in `Plans/Prompt_Pipeline.md` and `Plans/storage-plan.md`.

Rules:
- `Resubmit with Annotations` triggers a targeted revision pass scoped to documents with open durable annotations, or a user-selected subset.
- Targeted revision consumes deterministic ordered annotation records that include `operation`, `intent_kind`, `operation_payload`, anchor data, and bounded provenance.
- Targeted revision may apply requested edits and/or answer question/comment annotations.
- For each input annotation, the runtime records `addressed | still_open | cannot_apply`, `addressed_explanation`, and `updated_anchor?`.

ContractRef: Primitive:TargetedRevisionPass, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/storage-plan.md

- Targeted revision MUST NOT trigger Multi-Pass Review.
- Conflicting or stale mutating annotations are excluded from automatic revision until resolved.
- One automatic retry is allowed on structured validation failure; after that, the run must explicitly degrade or fail.

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

## Recovery Terminology Reconciliation Addendum (2026-03-08)

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
- chat, GUI, run graph, orchestrator, and wizard surfaces are consumers of the contracts above

Precedence rules:
- legacy packet-era names such as `analysis_id`, `run.scheduler_analysis`, `allowed_actions[]`, and `recovery_options[]` are compatibility terms only
- when a consumer doc conflicts with the owner docs above, the owner docs win
- stale canonical text must be replaced or retired, not preserved by later additive notes alone

## Source Control, GitHub Actions, and Docker Manager Ownership Addendum (2026-03-12)

### SourceControlSurface

Owner: `Plans/GitHub_Integration.md` + `Plans/WorktreeGitImprovement.md`.

Rules:
- Git-local and Git-remote repo operations, history, graph, stash, conflicts, and worktree UX belong to Source Control.
- GitHub-hosted workflow/admin behavior does not belong to Source Control.
- Worktree lifecycle correctness remains owned by the worktree plan even when surfaced through Source Control.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md

### GitHubActionsSurface

Owner: `Plans/GitHub_Integration.md` with auth/runtime constraints from `Plans/GitHub_API_Auth_and_Flows.md`.

Rules:
- GitHub Actions uses GitHub API identity and capability, not Git transport state, for hosted workflow/admin behavior.
- Current Branch / Workflows / Settings are separate subviews of one Actions surface.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/newtools.md

### DockerManagerSurface

Owner: `Plans/Containers_Registry_and_Unraid.md` with readiness/result minima from `Plans/newtools.md`.

Rules:
- Docker Manager is the canonical umbrella for Docker, Podman, registries/Docker Hub, compose, build/bake, Publish / Unraid, and project-focused Kubernetes.
- Unraid and Kubernetes are not required top-level shell surfaces for MVP.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md
