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

---

## 3. Ownership boundaries

Ownership boundaries are explicit so downstream docs cannot re-own orchestration canon accidentally.

### 3.1 Runtime orchestration ownership
Canonical runtime orchestration ownership is:
- `Executor_Protocol.md` owns dispatch-time execution context and runtime role boundaries
- `Contracts_V0.md` owns persisted contract shapes, blocked-episode identity, command envelopes, `route_target`, and `OpenSubject`
- `storage-plan.md` owns durable record and projection families
- `Prompt_Pipeline.md` owns requested/effective runtime identity resolution semantics

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### 3.2 Orchestrator ownership
Canonical Orchestrator ownership is:
- node graph is the execution model
- `Feature Seam` and `Work Package` are graph-owned objects
- `Node` is the smallest executable unit
- `Package Overseer` and `Seam Overseer` are governance roles; runtime remains the canonical owner of readiness, blockers, transitions, retry budgets, and dispatch

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md

### 3.3 Navigation and source-open ownership
Canonical navigation/source-open ownership is:
- `Contracts_V0.md` owns `route_target` and `OpenSubject`
- `FileManager.md` owns `OpenFile`
- `storage-plan.md` owns persisted subject identity and restore joins
- `FinalGUISpec.md` owns shell realization and destination-surface behavior

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### 3.4 Source Control and lane/worktree ownership

Canonical source-control ownership is:
- Source Control is worktree-first and compact
- Orchestrator is lane/package/seam operational view
- `worktree` remains the concrete Git/filesystem backing object
- `lane` is the primary operational orchestration object bound to package execution and historical lineage

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Orchestrator_Page.md

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


### 3.13 DocumentInlineNotes
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

### 3.14 TargetedRevisionPass
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

### 3.15 FinalReviewGate
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
