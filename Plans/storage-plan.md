# Storage plan (seglog, redb, Tantivy, projectors)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


**Date:** 2026-02-20  
**Status:** Implementation checklist + detailed design  
**Cross-references:** Plans/rewrite-tie-in-memo.md, Plans/assistant-chat-design.md (§10-§11, §24), Plans/assistant-memory-subsystem.md, Plans/usage-feature.md, Plans/FileManager.md (§2.9), Plans/Tools.md (§8.0, §8.4 -- tool events and rollups), AGENTS.md. **Validation:** Deterministic verifier gates plus SSOT acceptance/evidence contracts are authoritative for this stack (`python3 scripts/pm-plans-verify.py run-gates`, `Plans/Progression_Gates.md`, `Plans/evidence.schema.json`); SQLite remains off the table.

---

## Summary

Storage for the rewrite follows a multi-store design: **seglog** as the canonical append-only event stream, **redb** for durable KV state (settings, sessions, runs, checkpoints, editor state, analytics rollups), and **Tantivy** for full-text search. Projectors consume seglog and maintain a JSONL mirror, Tantivy indices, and redb state. Analytics scan jobs compute rollups from seglog and store them in redb for fast dashboard and Usage queries. This plan specifies **how** we implement it: file locations, event format, redb schema, projector behavior, and how we address gaps, failure modes, and optional enhancements.

---

## Table of Contents

1. [Definitions and concepts](#1-definitions-and-concepts)
2. [How we're going to do it](#2-how-were-going-to-do-it)
3. [Implementation checklist](#3-implementation-checklist)
4. [Impact on chat (Assistant / Interview)](#4-impact-on-chat-assistant--interview)
5. [Gaps and how we address them](#5-gaps-and-how-we-address-them)
6. [Potential problems and solutions](#6-potential-problems-and-solutions)
7. [Enhancements](#7-enhancements)
8. [Implementation order and testing](#8-implementation-order-and-testing)

---

## 1. Definitions and concepts
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md

### Additional shell/runtime identities required by the promoted Section 15 feature set

The storage model MUST treat the following as first-class identities when the feature is enabled:
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md
- `workspace_tab_id`
- `window_id`
- `browser_tab_id`
- `preview_session_id`
- `terminal_session_id`
- `dev_session_id`
- `branch_id` for branched conversation/session lineage

Identity rules:
- `project_id` is stable across path rebinding and restore operations; raw path is not the canonical identity
- `workspace_tab_id` is distinct from `project_id`
- `browser_tab_id` is distinct from `preview_session_id`
- detached windows and ephemeral automation/auth sessions have separate persistence scope from workspace-tab shell state

| Term | Meaning |
|------|--------|
| **seglog** | Single append-only event log (file or segment files). Every run, message, tool use, and usage event is appended here. Canonical source of truth; replay and projections are derived from it. |
| **redb** | Embedded key-value store (Rust `redb` crate). Durable; used for settings, session/thread metadata, checkpoints, editor state, and analytics rollups. Not the source of truth for event history -- that is seglog. |
| **Tantivy** | Full-text search engine (Rust). Indices are built by projectors from seglog (e.g. chat messages, docs, log summaries). Queries serve human and agent search. |
| **Projector** | A process or pipeline that **reads** seglog (tail or full) and **writes** derived state: e.g. seglog → JSONL mirror, seglog → Tantivy index, seglog → redb checkpoints/snapshots. Projectors are **deterministic**: same seglog input ⇒ same output. |
| **Analytics scan** | A job that scans seglog (or the JSONL mirror) over a time range and computes **aggregates** (e.g. 5h/7d usage, tool latency percentiles, error rates). Results are written to redb for fast dashboard/Usage reads. |
| **Checkpoint** | A position in seglog (e.g. byte offset or event sequence number) that a projector or scan has processed up to; stored in redb so we can resume without reprocessing from the start. |
| **project_id** | A stable identifier for a project (repo root). Format: either (a) a UUID (e.g. v4) assigned when the project is first opened, or (b) a deterministic hash of the project root path (e.g. SHA256 truncated to 16 bytes, encoded as hex or base64url). Max length for redb key: e.g. 64 chars. |
| **path_hash** | A stable, short identifier for a file path within a project. Format: e.g. SHA256(path) truncated to 8 bytes and encoded as hex (16 chars), or a numeric hash encoded for key safety. Used in redb keys where full path would be long (e.g. scroll_cursor, unsaved buffers). |
| **window** | For rollup keys: literal string `5h`, `7d`, or `24h`. Analytics scan writes one key per (window, platform) for usage and one per window for tool_latency and tool_usage (e.g. `tool_usage.5h`, `tool_usage.7d`). Allowed window values are fixed for MVP. |

---

## 2. How we're going to do it

### 2.1 File locations and directory layout

All storage lives under a single **app data root** (e.g. `~/.puppet-master/` or `$XDG_DATA_HOME/puppet-master/` on Linux; `%APPDATA%/puppet-master` on Windows; `~/Library/Application Support/puppet-master` on macOS). Project-specific data (e.g. per-project seglog or redb) may live under **project root / project workspace** (e.g. `.puppet-master/`) when we want isolation per workspace; the plan below assumes **app-global** seglog/redb by default, with **project_id** or **project_path** in keys where needed.

| Path (relative to app data root) | Purpose |
|----------------------------------|---------|
| `storage/seglog/` | seglog segment files (or single `events.log`). Append-only. |
| `storage/redb/` | redb database file(s). One main DB (e.g. `state.redb`) for settings, sessions, checkpoints, rollups; schema versioned via migrations. |
| `storage/jsonl/` | Human-readable JSONL mirror of seglog (one file per day or one rolling file). Written by projector. |
| `storage/tantivy/projects/{project_id}/` | **Per-project** Tantivy index directories (e.g. `chat`, `code`, `logs`, optional `docs`). Built by projectors/watchers. Per-project indices are required for project-only search scoping and for long-lived performance (see §2.4 and Plans/assistant-chat-design.md §10.3). |
| `storage/blobs/` | Blob store for large persisted payloads referenced by `blob_ref` (e.g. secrets-scrubbed tool/log payloads used by `logread`). |
| `storage/backups/` | Optional: point-in-time copies of redb or seglog for recovery. |

**Implementation:** Resolve app data root at startup (env override optional). Create `storage/seglog`, `storage/redb`, `storage/jsonl`, `storage/tantivy` if missing. Use a single redb file for MVP; split by domain (e.g. `state.redb`, `rollups.redb`) only if needed later.

#### 2.1.1 Assistant-only memory stores (separate physical boundary)

Assistant memory is specified canonically in `Plans/assistant-memory-subsystem.md` and is intentionally separated from system storage in this document.
Canonical system storage defaults in this plan remain app-global (`storage/redb/state.redb`); the Assistant-memory spec's `.puppet-master/project/state/system.redb` reference is a project-state packaging alias and does not redefine system-storage ownership here.

Rule: Assistant memory MUST use separate per-project physical stores (`.puppet-master/project/state/assistant_memory.redb`, `.puppet-master/project/state/assistant_memory_index/`, `.puppet-master/project/state/assistant_memory_vectors.usearch`) while preserving system storage contracts in this plan.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#2-physical-storage-layout, ContractName:Plans/storage-plan.md

Rule: Assistant memory evidence persistence MUST follow the SSOT EvidenceRef pointer-only contract and MUST NOT inline large diffs/logs into memory records.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, ContractName:Plans/assistant-memory-subsystem.md#3-data-model

Rule: The separation boundary exists to avoid writer contention/coupling and MUST NOT change `seglog` as the canonical system event source.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#2-physical-storage-layout, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Contracts_V0.md#EventRecord

#### 2.1.2 Per-project seglog isolation mode

Puppet Master supports two deterministic seglog storage scopes:

- `app_global` (default): canonical seglog is stored under the app data root (`storage/seglog/`).
- `project_local`: canonical seglog is stored under the active project root at `.puppet-master/state/seglog/`.

**Config contract (single source of truth):**
- `storage.seglog.scope = app_global | project_local`
- Default: `app_global`

**Path contract for `project_local`:**
- Seglog directory: `.puppet-master/state/seglog/`
- JSONL mirror for that seglog stream: `.puppet-master/state/jsonl/`
- Seglog backups for that project: `.puppet-master/state/backups/seglog/`

**Scope rule:**
- `project_local` isolates the canonical seglog stream and its immediately derived seglog-local artifacts (JSONL mirror and seglog backups) to the active project.
- redb remains app-global unless a separate plan explicitly changes that contract.
- Tantivy remains per-project as already defined in §2.4.

**Activation / failure semantics:**
- `project_local` MAY be used only when an active project root exists.
- If `storage.seglog.scope = project_local` and no project is open, Puppet Master MUST fail fast before starting a run that would emit events. It MUST NOT silently fall back to `app_global`.
- If the project root exists but `.puppet-master/state/seglog/` cannot be created or written, seglog initialization MUST fail and event-producing flows MUST stop before persistence begins.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Contracts_V0.md#EventRecord

### 2.2 seglog: format, writer, rotation

#### Persona/runtime payload registration

The event table above is expanded by the canonical Persona/runtime snapshot contract from `Plans/Contracts_V0.md`.

Required payload additions:
- `run.started` MUST include the full Persona/runtime snapshot once prompt/runtime resolution is complete.
- `run.completed` MUST include the final Persona/runtime snapshot actually used for the completed run, including any clamped or skipped controls.
- `chat.subagent_started` MUST include:
  - `subagent_run_id`
  - `task_label`
  - `requested_persona`
  - `effective_persona`
  - `persona_selection_source`
  - `selection_reason`
  - `effective_platform`
  - `effective_model`
  - optional `effective_variant`
  - optional `effective_reasoning_effort`
  - optional `effective_talkativeness`
  - `applied_persona_controls[]`
  - `skipped_persona_controls[]`
- `chat.subagent_completed` MUST include the same fields plus completion `status`.
- `run.persona_stage_changed` MUST carry:
  - `persona_stage`
  - `tier_id`
  - the full Persona/runtime snapshot active for that stage transition.

Approval visibility rule:
- If a HITL approval request is raised for a tier that has already resolved Persona/runtime state, `hitl.approval_requested` SHOULD include the current tier's `persona_runtime_snapshot` so approval UI and replay can display what the user is approving.

**Event envelope (per record):** Persisted seglog records MUST use `Plans/Contracts_V0.md#EventRecord`. Each appended record is a single line or frame so we can tail easily. Recommended persisted format: **newline-delimited JSON** (NDJSON).

```json
{
  "schema": "pm.event.v0",
  "ts": "2026-02-21T12:00:00Z",
  "seq": 12345,
  "type": "chat.message",
  "run_id": "PM-...",
  "thread_id": "TH-...",
  "payload": { ... }
}
```

- `EventEnvelopeV1` examples elsewhere are compatibility-only and MUST NOT be treated as the persisted write contract.
- Concrete payload schemas are registered here; the top-level envelope remains owned by `Plans/Contracts_V0.md`.

**Event types (minimum set for chat + usage + runs):**

| type | Purpose | payload (key fields) |
|------|---------|----------------------|
| `chat.message` | User or assistant message appended to a thread | `thread_id`, `role`, `content`, `message_id`, optional `attachments`, `model`. For **assistant** messages, optional **`usage`** (e.g. `tokens_in`, `tokens_out`, `cost`, `reasoning_tokens`) so per-thread usage can be derived from messages without querying usage.event; canonical usage remains `usage.event` with `thread_id`. |
| `chat.thread_created` | New thread | `thread_id`, `project_id`, `title` |
| `run.started` | Orchestrator or Assistant run started | `run_id`, `thread_id`, `platform`, `tier_id`, `mode`, `strategy`, `strategy_resolution_reason` |
| `run.completed` | Run finished (success or failure) | `run_id`, `status`, `outcome`, optional `stop_reason`, optional `budget_key`, optional `budget_limit`, optional `observed_value`, optional **`usage`** (summary for this run: e.g. `tokens_in`, `tokens_out`, `cost`, `thread_id`) so consumers can get run-level usage without scanning `usage.event`. Canonical per-request usage remains `usage.event`; `run.completed.usage` is a convenience snapshot for dashboards and thread Usage tab. |
| `usage.event` | Token/request/error event for Usage/Ledger | `platform`, `tokens_in`, `tokens_out`, `session_id`, **`thread_id`** (Assistant/Interview thread), `tier_id`, `timestamp`, optional `cost`, `reasoning_tokens`, `cache_read`, `cache_write` |
| `tool.invoked` | Tool call (for analytics) | `tool_name`, `latency_ms`, `run_id`; optional **`success`** (bool), **`error`** (string), **`thread_id`** for error rate and Usage tool widget (Plans/Tools.md §8.0). |
| `tool.denied` | Tool call blocked by policy (optional) | `tool_name`, `run_id`, `reason` (e.g. "permission_denied", "user_declined") for audit (Plans/Tools.md §8.0). |

**Additional event types (full feature set):** The following support assistant-chat-design, orchestrator, interview, and human-in-the-loop. Projectors and analytics scan may ignore unknown types until needed.

| type | Purpose | payload (key fields) |
|------|---------|----------------------|
| `chat.queue_updated` (or `queue_add` / `queue_remove` / `queue_edit` / `queue_clear`) | Queue state per thread (§4.1, §11) | `thread_id`, `message_id`, `text` (for add/edit) |
| `chat.thread_archived`, `chat.thread_deleted` | Archive (hide but keep searchable) or permanent delete (§11) | `thread_id`, optional `project_id` |
| `chat.plan_todo_updated` | Plan and todo per thread (§11) | `thread_id`, plan/todo payload |
| `chat.subagent_started`, `chat.subagent_completed` | Subagent lifecycle in thread (§14.1) | `thread_id`, `subagent_id` or persona name, optional `task_label` |
| `run.tier_started`, `run.tier_completed` | Tier boundaries for replay (orchestrator) | `run_id`, `tier` (phase/task/subtask) |
| `run.iteration_started`, `run.iteration_completed` | Iteration boundaries | `run_id`, `iteration_id`, `status` |
| `run.verification_result` | Verification passed/failed | `run_id`, `tier`, `passed`, optional details |
| `interview.started`, `interview.completed` | Interview session | `interview_id`, `project_id`, optional `thread_id` |
| `interview.phase_started`, `interview.phase_completed` | Interview phase | `interview_id`, `phase`, optional result |
| `interview.document_generated` | Interview artifact for projectors/Tantivy | `interview_id`, `doc_type`, `path` or content ref |
| `hitl.approval_requested`, `hitl.approved`, `hitl.rejected`, `hitl.cancelled` | HITL at tier boundary (human-in-the-loop.md) | `request_id`, `run_id`, `tier_id`, `tier_type`, `request_kind`, `message`, `allowed_actions`, `timestamp`; resolution events add `resolution`, optional `reject_resolution`, optional `rationale` |
| `editor.file_opened`, `editor.file_closed`, `editor.tab_switched`, `editor.buffer_saved`, `editor.buffer_reverted` | Editor lifecycle (FileManager.md §2.9) | `project_id`, `path` or `path_hash`, optional tab index / session_id |
| `restore_point.created` | Auto-snapshot before turn/tool mutation (newfeatures.md §8) | `restore_point_id`, `project_id`, `turn_id` or `iteration_id`, `timestamp`, `file_snapshots` list: `{ path, content_hash, blob_ref }` (or inline marker for small blobs) |
| `restore_point.pruned` | Retention cleanup of old restore points (§8) | `restore_point_id`, `project_id`, `reason` (e.g. `age_exceeded`, `count_exceeded`) |
| `rollback.requested` | Agent or user requests rollback (§8) | `restore_point_id`, `requester` (`agent` or `user`), `scope` (`narrow` or `broad`), optional `thread_id` |
| `rollback.confirmed` | User confirms rollback (§8) | `restore_point_id`, `conflicts` (list of conflicted files, may be empty) |
| `rollback.completed` | Rollback applied successfully (§8) | `restore_point_id`, `files_restored` (list of paths written back) |
| `rollback.cancelled` | User cancelled rollback (§8) | `restore_point_id`, optional `reason` |
| `config.validation.passed`, `config.validation.warning`, `config.validation.failed` | Tier-start config wiring validation result | `run_id`, `tier_id`, `tier_type`, requested/effective platform/model/runtime fields, `issues[]` |
| `run.persona_stage_changed` | Tier-internal Persona/runtime stage transition | `run_id`, `tier_id`, `persona_stage`, requested/effective Persona/runtime snapshot, `selection_reason` |
| `platform.capability_evaluated` | Platform capability snapshot + gating decision | `run_id`, `platform`, `snapshot`, `precedence_source`, `gated_features[]` |
| `run.qa_cycle_started`, `run.qa_cycle_completed` | Autonomous QA loop lifecycle | `run_id`, `tier_id`, `cycle`, `blocking_findings`, `outcome` |
| `crew.started`, `crew.member_started`, `crew.member_completed`, `crew.message_posted`, `crew.completed` | Crew lifecycle and shared-board traffic | `crew_id`, `run_id`, member ids, message metadata, lifecycle status |
| `run.background_enqueued`, `run.background_state_changed` | Background / async run queue lifecycle | `run_id`, `project_id`, `thread_id`, `state`, `queue_position`, optional `worktree_path`, optional `branch_name` |

**Writer API:** One module (e.g. `storage::seglog::Writer`) that:

1. Opens the current segment file in append mode (or creates it).
2. Serializes the event to the envelope format.
3. Appends the line (with newline); flushes so projectors can tail.
4. Optionally updates an in-memory or redb "last seq" for durability guarantees.

**Contract:** `append(event)` returns `Result<(), SeglogError>`. On failure (e.g. disk full, I/O error), no partial record is written; caller must handle the error (e.g. surface to user, stop appending, optional retry). redb open and write operations return Result; caller must handle open failure (e.g. corrupt DB → do not open; show error or offer recover-from-backup).

**Rotation:** When the current segment reaches a size limit (e.g. 64 MB) or a new day, close it and start a new file (e.g. `events_2026-02-21.ndjson`). Projectors and analytics scans must be able to list and read segments in order (by name or by embedded timestamp). **Retention:** Policy for deleting or archiving old segments (e.g. keep 90 days) so disk is bounded; document in §6.

#### 2.2.1 Replay, rebuild, and compaction contract

- `seglog` is the only canonical ledger. `redb`, Tantivy, and the JSONL mirror are disposable projections and MUST be rebuildable from `seglog`.
- Replay/rebuild MUST capture a deterministic `target_seq`, build into scratch outputs, verify logical equivalence, and promote only on success. Live checkpoints/projections MUST remain unchanged on replay failure.
- Runtime resume means restart from the last durable safe boundary recorded by checkpoint state; it does not require provider-process or transport-session reattachment.
- Compaction is a file-boundary optimization only. It MUST NOT rewrite event payloads or change `seq` values.
- Compaction MUST NEVER include the active writer segment.
- Once compaction exists, durable projector and analytics checkpoints MUST use `seq` as the canonical resume token. Segment/offset MAY remain an optimization, not the sole durable identifier.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/rewrite-tie-in-memo.md, PolicyRule:Decision_Policy.md§2

### 2.3 redb: schema, migrations, key patterns

#### Persona resolution persistence contract

redb MUST persist the user-visible Persona-resolution state that the GUI exposes.

Minimum keys / records:
- `config:chat.persona`
  - `mode` (`manual | auto | hybrid`)
  - optional `manual_persona`
  - optional `locked_persona`
  - optional per-thread default override policy
- `config:interview.persona`
  - `mode`
  - `stage_persona_overrides`
  - `phase_primary_personas`
  - `phase_secondary_personas`
  - optional per-stage platform/model overrides
- `config:builder.persona`
  - `mode`
  - `stage_personas`
  - `review_pass_personas`
  - optional per-stage platform/model overrides
  - optional next-run explicit override
- `config:orchestrator.persona`
  - `mode`
  - `tier_personas`
  - `operation_frame_personas`
  - optional per-tier platform/model overrides
  - optional next-run explicit override
- `thread_state:{thread_id}:persona_override`
  - `requested_persona`
  - `scope` (`turn | session | run | task | subagent`)
  - `owner_id`
  - `selection_source`
  - `created_seq`
  - optional `expires_after_seq`
  - optional `cleared_seq`

Rules:
- GUI controls MUST read/write these records rather than inventing surface-local state.
- Session-scoped and task-scoped natural-language Persona overrides MUST survive restart if they were active before shutdown.
- Replay from seglog remains canonical; redb stores the current projected state for fast restore.

#### Additions: Preview session + browser rendering persistence contract

##### Artifact-backed preview identity and restore

Preview persistence MUST support both document-backed and artifact-backed subjects.

**Canonical subject key**
- `preview_subject_id = doc:<document_id>` or `artifact:<artifact_id>`

**Required redb keys**
- `preview_state.v1:{project_id}:{preview_subject_id}` -> JSON `{ preview_mode, last_preview_session_id, last_attached_surface, trust_tier, export_preferences, scroll_sync_enabled, last_error }`
- `preview_source_artifact.v1:{project_id}:{artifact_id}` -> JSON `{ artifact_kind, source_kind, origin_surface, thread_id?, message_id?, source_revision, source_text_ref, backing_document_id?, last_saved_path? }`

**Projector rule**
- Existing lifecycle events may continue to carry `document_id` or `artifact_id`, but projectors MUST derive `preview_subject_id` deterministically for restore and UI-state joins.

**Restore rules**
- Document-backed restore reopens the workspace document path/buffer.
- Artifact-backed restore reopens a transient `generated://<artifact_id>` source buffer unless a `backing_document_id` has since been assigned.
- Restore MUST NOT require a historical live webview instance or persisted DOM state.

Preview/browser rendering requires both durable UI state and replayable lifecycle events.

**Required seglog event types**
- `preview.session.created`
- `preview.session.state_changed`
- `preview.session.attached`
- `preview.session.detached`
- `preview.session.closed`
- `preview.session.reloaded`
- `preview.session.exported`
- `preview.action.requested`
- `preview.action.completed`
- `browser.element_captured`

**Minimum event payloads**
- `preview.session.*`: `project_id`, `preview_session_id`, `document_id` or `artifact_id`, `source_kind`, `trust_tier`, `transport_mode`, `attached_surface`, `source_revision`, optional `error_code`
- `preview.action.*`: `project_id`, `preview_session_id`, `node_id`, `operation`, `result_code`, optional `patch_summary`
- `browser.element_captured`: `project_id`, optional `thread_id`, optional `preview_session_id`, `origin_kind`, `page_url`, `capture_id`, bounded summary payload

**Recommended redb placement**
- `preview_state.v1:{project_id}:{document_id}` -> JSON `{ preview_mode, last_preview_session_id, last_attached_surface, trust_tier, export_preferences, scroll_sync_enabled, last_error }`
- `browser_state.v1:{project_id}` -> JSON `{ tabs, history, bookmarks, last_selected_tab, inspect_mode_defaults }`
- `browser_state_external.v1` -> JSON `{ history, bookmarks }` for optional user-opened external browsing that is not workspace-scoped
- `preview_exports.v1:{project_id}` -> JSON `{ last_directory, last_format, last_theme, last_background }`

**Partitioning rule**
- Workspace preview/browser state MUST be partitioned per project.
- External browsing state, if supported, MUST NOT share cookies/history/storage with workspace preview state by default.

**Restore rule**
- redb restores browser/preview UI intent and recent state.
- seglog remains the canonical source for lifecycle/audit history.

#### Additions: Container publish / DockerHub / Unraid persistence contract

This addendum defines the persistence required for Source Control, GitHub Actions, Docker Manager, and their Orchestrator linkage.

### Scope split

| Scope | Store | What belongs here |
|---|---|---|
| Secret | OS credential store only | GitHub API tokens, Docker PATs, browser-login derived credentials, registry/helper secrets |
| Global app state | redb | shared Source Control defaults, Actions defaults, Docker Manager defaults, hidden-subview policy |
| Project state | redb | selected repo/worktree, panel subviews, pinned workflows, selected runtime/context, requested auth mode, template repo state |
| Event ledger | seglog | auth validation, blocked/recovery outcomes, workflow actions, publish results, runtime receipts, cross-surface linkage |

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/newtools.md, PolicyRule:no_secrets_in_storage

### Required redb keys
- `source_control.project_state.{project_id}` -> `{ active_subview, selected_repo_id, selected_worktree_id?, history_filter?, graph_filter?, graph_layout?, compare_target?, auto_fetch_interval_s, conflict_presentation }`
- `github_actions.project_state.{project_id}` -> `{ active_subview, current_branch_ref?, pinned_workflow_ids[], refresh_interval_s, last_opened_run_id?, last_opened_job_id?, admin_scope_selection?, log_display_mode? }`
- `docker_manager.project_state.{project_id}` -> `{ active_subview, selected_runtime, selected_context?, selected_compose_project?, selected_registry?, requested_auth_mode?, selected_namespace?, selected_repository?, tag_template?, push_policy?, last_validation_snapshot?, last_publish_result_id?, template_repo_id?, kubernetes_focus? }`
- `orchestrator.receipt.{run_id}.{attempt_id}` -> `{ repo_id?, worktree_id?, branch_ref?, commit_range?, workflow_refs?, docker_refs?, kubernetes_refs?, usage_event_ref? }`

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/usage-feature.md

- `provider_accounts.project_policy.{project_id}.{provider_id}` -> `{ enabled, default_switch_mode, default_threshold, selection_mode, default_auth_surface_order[], manual_preferred_account_id?, role_policy_refs[], updated_at_utc }`
- `provider_accounts.account.{project_id}.{provider_id}.{account_id}` -> `{ label, auth_surface, provider_identity?, credential_ref, enabled, priority, threshold_override?, switch_mode_override?, cooldown_until?, retry_budget?, configured_project_id?, allowed_roles?, disallowed_roles?, credential_state, configuration_state, availability_state, last_validated_at_utc? }`
- `provider_accounts.run_snapshot.{run_id}.{provider_id}` -> `{ auth_surface_order[], eligible_account_ids[], policy_hash, snapshot_created_at_utc }`
- `provider_accounts.health.{project_id}.{provider_id}.{account_id}` -> `{ last_usage_signal_at_utc?, usage_source_kind?, signal_confidence?, projected_remaining?, reset_at?, hard_failure_reason?, recent_switch_reason? }`

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, PolicyRule:no_secrets_in_storage
### Naming and migration rules
- `docker_manage_surface_state` is legacy naming and MUST migrate to `docker_manager.project_state.{project_id}`.
- `requested_auth_mode` and `effective_*` snapshots remain separate fields.
- Canonical auth/account routing names are `requested_account_policy`, `effective_account_id`, `effective_account_label?`, `effective_provider_identity?`, `effective_project_id?`, and `account_switch_reason?`.
- `provider_identity` is provider-native metadata only and MUST NOT replace `account_id`.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD

- `credential_ref` is the canonical non-secret handle for OS-stored credentials.
- Secrets, API keys, bearer tokens, refresh tokens, and raw credential payloads MUST remain outside redb and seglog.
- blocked-state payloads use canonical `allowed_action_ids[]`; `recovery_options[]` is not canonical project-state vocabulary.
- account-scoped state uses the canonical names `credential_state`, `configuration_state`, and `availability_state`.

ContractRef: PolicyRule:no_secrets_in_storage, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md#AuthState
### 2.4 Projector pipeline: consumption, JSONL mirror, Tantivy, checkpoints

**Consumption model:** Each projector runs in a loop (or is triggered periodically):

1. Read **checkpoint** from redb (e.g. `projector.jsonl_mirror` → last seglog path + offset).
2. **Tail** seglog from that position (open file, seek to offset, read new lines; or list segments, read from last segment).
3. For each event: (a) write to JSONL mirror (if this projector owns the mirror), (b) update Tantivy index (if event type matches), (c) update redb snapshots if needed.
4. **Commit** new checkpoint to redb (and flush Tantivy) so we don't reprocess on restart.

**JSONL mirror:** Same envelope format as seglog; one file per day under `storage/jsonl/` (e.g. `events_2026-02-21.jsonl`) or one rolling file. Human-readable; useful for debugging and for analytics scan if we prefer scanning JSONL. Writer: single projector that reads seglog and appends to the mirror.

**Tantivy indices (required per project):** Indices are written under `storage/tantivy/projects/{project_id}/…` to enforce **project-only scoping** and keep performance stable for long-lived projects (Plans/assistant-chat-design.md §10.3). Separate index per domain:

- **chat (required):** Documents from `chat.message` (and optionally `chat.thread_created` / `chat.thread_updated`).  
  **Fields (minimum):** `project_id`, `thread_id`, `message_id`, `role`, `ts`, `content`.  
  **Optional fields:** `archived`, `deleted`, `context_overlay_flags` (muted/subcompacted markers) to support Context Lens filtering.  
  **Use:** Chat history search (human + agent), and smart auto-retrieval (RAG) from prior project threads.

- **code (required, MVP):** A project-scoped code search index for the **project workspace / project root**.  
  **Producer:** A file-watcher + indexer (can be implemented as a “projector” even though the source is filesystem change events rather than seglog). The indexer must respect `.gitignore` by default and apply FileSafe-style sensitive-path exclusions (see below).  
  **Chunking:** Index large files as chunks so results return tight snippets (e.g. 4–16 KiB chunks with `chunk_id` and byte/line range metadata).  
  **Fields (minimum):** `project_id`, `path`, `chunk_id`, `content`, `language?`, `mtime` (or `content_hash`).  
  **Use:** `codesearch` tool and auto-retrieval for code grounding. LSP symbol search remains complementary (symbol-aware), not a replacement.

- **logs (required, MVP):** A project-scoped logs/search index based on **log summaries** with pointers to full payload.  
  **Producers:** seglog projectors that consume `tool.invoked`, `tool.denied`, `run.*`, `bash.*`, and error events and emit index documents.  
  **Index the summary, not the blob:** Store only compact summaries/snippets in Tantivy; store full (secrets-scrubbed) payload as a blob/file under `storage/blobs/…` referenced by `blob_ref` (or event id) so log search stays fast and storage remains bounded.  
  **Fields (minimum):** `project_id`, `ts`, `thread_id?`, `run_id?`, `tool_name?`, `level?`, `summary`, `blob_ref` (or `event_id`).  
  **Use:** `logsearch` tool, auto-retrieval for “why did this fail,” and UI debugging surfaces.

- **docs (optional):** Index selected long-form docs or generated artifacts if needed for retrieval (“teach” mode, doc lookup). Prefer indexing doc summaries/pointers rather than full bodies when possible.

**Sensitive indexing + persistence guards (chat + code + logs):**
- **PolicyRule:no_secrets_in_storage / INV-002 (mandatory):** Any text persisted to seglog/redb/Tantivy/blob files MUST be passed through a strict secrets scrubber that removes tokens/credentials/private keys. This mandatory scrub is always-on and not user-configurable.
- **Path-based exclusions (mandatory):** Default deny indexing of `.env` and `.env.*` while allowing `.env.example` (align with Permissions_System default `.env` deny semantics). Exclude common key/cert paths (e.g. `*.pem`, `*.key`, `id_rsa*`) from indexing and from log/blob persistence when detected.
- **Additional heuristic redaction (optional; default OFF):** `retrieval.redaction.secretish_enabled` MAY apply an additional aggressive heuristic redaction pass (on top of the mandatory scrub) to log-summary indexing, snippet display, and retrieved-context injection.

**Blob refs (logs):**
- Store log payload blobs under `storage/blobs/projects/{project_id}/logs/` with a deterministic filename (e.g. `{event_id}.json` or `{content_hash}.json`).
- `blob_ref` is a stable identifier that resolves to this blob path; `logread` reads the blob and returns the secrets-scrubbed content (bounded by size caps).

**Schema per index:** Define fields (text, keyword, date) and build documents from event payloads / filesystem scanner output. Index is written incrementally (add/update documents) and periodically committed.

**Checkpoints:** Stored in redb under `checkpoints` namespace. Value encodes enough to resume: e.g. `{ "segment": "events_2026-02-21.ndjson", "offset": 123456 }` or `{ "seq": 99999 }`. On startup, projector reads checkpoint, opens seglog from that position, and continues. Code indexer maintains its own checkpoint (e.g. last scan watermark / file mtime map) and supports a full rebuild when schema changes.

#### 2.4.1 JSONL mirror + projector contract

- The JSONL mirror is a regenerable projection of seglog and MUST preserve `EventRecord` lines verbatim.
- Daily layout is canonical: `events_YYYY-MM-DD.jsonl` under the selected JSONL root.
- The mirror projector MUST append and flush mirror output before advancing its durable checkpoint.
- On restart after a crash, the projector MUST resume from the last durable checkpoint and MUST NOT duplicate already committed mirror lines.
- Projector and analytics freshness notifications to the UI are derived from committed projection state; ad-hoc polling is not the correctness source.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/FinalGUISpec.md

### 2.5 Analytics scan jobs

**Trigger:** Periodic (e.g. every 5 minutes) or on-demand (e.g. when Usage view is opened). Can run in a background task or a separate thread; must not block the main UI. On-demand refresh should leave the previously written rollups visible until the new scan completes.

**Scan range:** Last N hours (e.g. at least 7d for `tool_usage.7d`) or since last scan checkpoint. Read from seglog (or JSONL mirror) in order; filter by event type (`usage.event`, `run.completed`, `tool.invoked`). Canonical tool-usage windows for MVP are `5h`, `24h`, and `7d`; `1h` remains optional.

**Compute:** For 5h/7d: aggregate `usage.event` by platform, sum tokens (or request count) in sliding 5h and 7d windows. For tool latency: collect `tool.invoked` latencies, compute percentiles (p50, p95). For error rates: count run failures / total runs in window. For **tool usage** (Usage tool widget, Plans/Tools.md §8.4): aggregate `tool.invoked` by `tool_name` over the window -- count, p50/p95 ms, error_count (count only events where `success = false`). `tool.denied` events and FileSafe blocks do **not** contribute to `tool_usage.{window}` because the widget reflects executed calls only.

**Write:** Store results in redb under `rollups` namespace (e.g. `usage_5h.{platform}`, `usage_7d.{platform}`, `tool_latency.{window}`, **`tool_usage.{window}`**, `tool_usage_meta.{window}`). Usage view and tool usage widget read from these keys; no direct seglog read for dashboard.

**Checkpoint:** Store "last scanned up to seq X" or "last scanned timestamp" in redb so the next run doesn't rescan from the beginning. Idempotent: recomputing the same window and writing the same keys is safe.

---

## 3. Implementation checklist

- [ ] **Resolve app data root** and create `storage/seglog`, `storage/redb`, `storage/jsonl`, `storage/tantivy`.
- [ ] **Implement seglog writer:** envelope format (ts, seq, type, payload); rotation by size or day; flush on append.
- [ ] **Define event type schemas** for `chat.message`, `chat.thread_created`, `run.started`, `run.completed`, `usage.event`, `tool.invoked` (include optional `success`, `error`, `thread_id` per Plans/Tools.md §8.0), optional `tool.denied`, and any editor lifecycle events per FileManager.md.
- [ ] **Implement redb schema + migrations:** namespaces (settings, sessions, runs, checkpoints, editor, rollups, review_rules); key patterns as in §2.3; migration runner and version bump.
- [ ] **Implement projector: seglog → JSONL mirror** (tail, checkpoint, write mirror).
- [ ] **Implement projector: seglog → Tantivy** (chat index; optional docs/logs); incremental index updates; checkpoint.
- [ ] **Persist projector checkpoints** in redb under `checkpoints` namespace.
- [ ] **Implement analytics scan:** scan seglog (or JSONL) for usage/tool/run events; compute 5h/7d, tool latency, and **tool_usage** (per-tool count, p50/p95, error_count) rollups; write to redb `rollups` (including `tool_usage.{window}` per Plans/Tools.md §8.4); store scan checkpoint.
- [ ] **Wire chat persistence:** thread list and thread content write to seglog; read from redb (session metadata) and seglog or redb snapshots for full thread load (per assistant-chat-design.md).
- [ ] **Wire editor state:** open tabs, active tab, scroll/cursor per FileManager.md §2.9 into redb `editor` namespace.
- [ ] **Wire Usage/dashboard:** read 5h/7d and rollups from redb; trigger analytics scan on interval or when Usage view opens (per usage-feature.md).
- [ ] **Emit usage.event with thread_id:** When recording usage for Assistant or Interview runs, include **thread_id** in the event payload so per-thread usage (context circle, thread Usage tab) can be aggregated from seglog or usage.jsonl (usage-feature.md §5, assistant-chat-design §12).
- [ ] **Emit run.completed with optional usage snapshot:** When a run finishes, include optional **usage** in the `run.completed` payload (tokens_in, tokens_out, cost, thread_id) so dashboards and thread Usage tab can use run-level usage without scanning usage.event. Canonical per-request data remains usage.event.

---

## 4. Impact on chat (Assistant / Interview)

Assistant and Interview surfaces persist thread-local state, activity traces, and reviewable history, but they do not become the canonical owner of runtime identity.

### 4.1 Shared runtime identity consumption
Chat/activity/question/todo records may display runtime identity, but the canonical requested/effective snapshot comes from the owner docs.

Rules:
- thread/activity projections consume frozen requested/effective runtime snapshots captured for the execution
- chat must not recompute historical runtime state from current settings
- assistant/chat-local state may reference runtime snapshots, but it must not rename or re-own the shared schema

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md

### 4.2 Question and clarification state
Structured question flows may span one or many questions.

Rules:
- `requirements.clarification_requested` and related clarification records retain canonical `question_ids[]`
- thread-scoped questionnaire drafts persist only bounded structured answer data needed to restore the flow
- do not persist arbitrary widget/UI runtime state for question forms
- resolved question flows persist explicit outcome state (`submitted`, `dismissed`, `timed_out`, or equivalent) rather than ambiguous partial state

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md

### 4.3 Plan and TODO state
`chat.plan_todo_updated` is the canonical event family for thread-visible plan and TODO state.

Required payload shape:
- `thread_id`
- `plan_state`
- `plan_revision_id?`
- `todos[]` using the normalized TODO schema
- `updated_by?`
- `source?`

Rules:
- the same TODO identity persists across draft, approval, execution, completion, blocking, and supersession
- structured revision/status history must be sufficient to restore the sticky plan panel honestly after reload/restart
- inline milestone updates in chat are derived from this state; they are not a separate source of truth

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md

### 4.4 Activity transparency payloads
`tool.invoked` / `tool.denied` payloads may attach bounded feature-specific metadata under `payload.meta`.

Recommended chat-facing additions include:
- web activity meta (`web_operation`, `support_tier`, `execution_path`, `sources_ref`, `provider_fallback_summary`)
- question-flow refs (`question_ids[]`, questionnaire state refs when needed)
- command-card preview refs and session-linkage metadata
- plan/todo tracker refs

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md

## 5. Gaps and how we address them

| Gap | Addressed how |
|-----|----------------|
| **Event type set not closed** | Define a minimal set in §2.2; document extension process (add type + payload schema, update projectors/analytics if they care). |
| **Project vs app-global storage** | Default: app-global seglog/redb with `project_id` in keys. If we need per-project seglog (e.g. one log per repo), add a layout option and document in §2.1. |
| **Ordering across segments** | Use global **seq** (single writer) or per-segment seq + segment ordering by name/date so projectors and scans see a total order. |
| **Editor state key vs project path** | FileManager.md uses `project_id` or project root path. We use a stable **project_id** (hash of path or UUID) in redb keys so renames don't break. |
| **Recovery / unsaved buffers** | Optional: store in redb (e.g. `editor/unsaved.{project_id}.{path_hash}`) or temp files; document in FileManager.md; not required for MVP. |
| **Who writes seglog** | Single **seglog writer** in the app; all components (chat, orchestrator, usage tracker) call into it. No direct file I/O from multiple writers. |
| **Tantivy schema churn** | Version the index (e.g. schema v2); on upgrade, rebuild index from seglog or keep old index until rebuilt. Document rebuild procedure. |
| **Rollup key expiry** | Rollups are overwritten per window (e.g. 5h/7d); no expiry needed. Historical rollups (e.g. per-day) can be optional; if stored, add TTL or retention in §6. |
| **Implementation order and dependencies** | §8 defines phased order: seglog → redb + schema → projectors (checkpoints namespace first) → analytics scan (rollups namespace first). No projector or scan runs before its storage dependencies exist. |
| **Projectors when seglog is empty** | When checkpoint is missing and seglog has no segments (or empty dir), projector starts from position 0 and has no events to process; checkpoint remains unset or is set to "start of first segment" once the first segment exists. No special-case code beyond "read from 0; get 0 events." |

---

## 6. Potential problems and solutions

| Problem | Solution |
|---------|----------|
| **seglog corruption or partial write** | Append-only with flush; if we detect truncation, stop reading at last complete line. Optional: checksum per record or segment. Recovery: restore from backup or discard tail; projectors resume from last good checkpoint. |
| **redb corruption** | redb is durable; use backups (e.g. copy `state.redb` periodically). If corruption, restore from backup; seglog is source of truth so we can rebuild redb state from seglog if we have projectors that re-materialize state. |
| **Projector falls behind** | Tail reader keeps up with writer; if projector is slow (e.g. Tantivy commit), buffer events in memory and process in batches; checkpoint only after commit. If seglog grows faster than projector, consider backpressure or multiple segments. |
| **Analytics scan blocks UI** | Run scan in background thread/task; never block main thread. Use a "last rollup" timestamp in redb; UI shows last computed rollup and optionally "Updating..." while scan runs. |
| **Disk full** | seglog writer and redb writes can fail; handle I/O errors: show user-facing error, stop appending, and optionally retry. Retention policy (§2.2) limits seglog size; redb size is bounded by state (not unbounded event history). |
| **Migration failure** | Migrations run on open; if one fails, log and leave DB at previous version; do not open DB in inconsistent state. Provide a "reset storage" or "recover from seglog" path for power users. |
| **Multiple app instances** | Single writer for seglog (one process). If we ever support multiple processes (e.g. CLI + GUI), use a lock file or single writer process; document in §2.2. |
| **Tantivy index size** | Index only what search needs (e.g. message content, thread_id, ts). Optional: skip very old messages or summarize; document retention for search index. |
| **Checkpoint lost** | If redb checkpoint is lost, projector can restart from beginning of seglog (or from oldest segment we keep). Rebuild is expensive but one-time; ensure seglog retention is long enough to recover. |
| **API contract (caller handling errors)** | seglog `append()` and redb open/write return `Result`. Callers must handle errors (e.g. surface to user, stop appending, retry policy). No silent swallow; document in §2.2 Writer API. |
| **Projector panic or crash** | On panic, do not advance checkpoint so the projector can resume from last checkpoint. Design projectors to be **idempotent** (reprocessing same event has same effect, e.g. overwrite same key or dedupe by event id). Catch panic in projector loop, log, and exit or restart from same checkpoint. |
| **Project deletion and orphaned keys** | When a project is removed (e.g. from recent list), optionally run a cleanup: remove `thread_list.{project_id}`, `editor` keys for that project_id, and any run/checkpoint keys tied to that project. Threads and runs that reference the project can remain in seglog; redb keys are the main cleanup target. Document cleanup as optional or on explicit "forget project" action. |
| **Thread deleted vs archived** | **Archived:** thread stays in seglog and Tantivy; redb `thread.{id}` gets `archived: true` and thread is omitted from default thread_list or filtered in UI. **Deleted:** same as archived for MVP, or optionally hard-delete: remove from thread_list, mark thread as deleted in metadata; seglog is immutable so events remain; Tantivy can filter by `deleted` flag if we add it via a projector, or we omit from search by filtering thread_id against a "deleted threads" set in redb. |
| **Queue restore after crash** | Queue state is in redb `queue.{thread_id}`; it is also replayed from seglog `chat.queue_*` events. On load: either read from redb only, or replay queue events for that thread from seglog and overwrite redb. Prefer redb as cache and seglog as source of truth so replay can rebuild queue. |
| **HITL restore from redb** | On startup, read `checkpoints.hitl.{run_id}`; if any run has pending approval, restore HITL UI (e.g. show approval dialog for that run/tier). Clear key when user approves/rejects. If run is no longer active, clear stale HITL keys in background or on next run completion. |
| **Interview vs thread identity** | Interview can have its own `interview_id` and optionally a linked `thread_id`. Store interview state in `interview_session.{interview_id}` and `interview_checkpoint.{interview_id}`; thread state in `thread.{thread_id}`. Correlation via event payload (`thread_id` in interview events) for UI and search. |
| **thread_usage / rollup retention when thread archived or deleted** | Optional: when thread is archived or deleted, remove `rollups.thread_usage.{thread_id}` to save space, or leave for analytics. Document as product choice; implementation can delete on archive/delete or leave. |
| **Usage/ledger retention policy** | seglog retention (e.g. 90 days) bounds usage history; analytics rollups overwrite 5h/7d. For long-term ledger, optional export or cold storage; document in §2.2 retention. |
| **Editor keys and project path change** | All editor keys use **project_id** (stable hash or UUID), not raw path. If user moves project, project_id may change (if hash-based); then old editor keys are orphaned. Prefer UUID assigned on first open so moving the folder keeps same project_id; document in §1. |
| **thread_checkpoint cleanup** | When thread is deleted (or purged), remove `thread_checkpoint.{thread_id}` so we don't accumulate dead keys. Optional background job or on delete. |
| **HITL with multiple app instances** | Single-writer seglog implies one process. If multiple instances are allowed later, HITL state in redb could be read by another instance; use a lock or "owner" in redb for HITL so only one instance shows the approval UI, or document that multi-instance HITL is unsupported for MVP. |

---

## 7. Enhancements

- **Compaction:** Specified in §2.2.1. Optional for MVP, but when enabled it MUST preserve `seq`, exclude the active segment, and keep replay/projector correctness intact.
- **Backup/restore:** Scheduled backups MUST snapshot canonical stores at one shared boundary, validate checksums before restore, and rebuild disposable projections (JSONL/Tantivy) after restore rather than treating them as authoritative.
- **Export:** Export thread or run history to JSONL/JSON for user (e.g. from seglog or JSONL mirror filtered by thread_id).
- **Read replicas:** Not applicable for embedded redb; if we move to a server-backed store later, read replicas can serve dashboard/Usage reads.
- **Per-project seglog:** Specified in §2.1.2; default remains app-global.
- **Event schema registry:** Required infrastructure for payload validation and doc generation; this plan owns payload registry/workflow while `Plans/Contracts_V0.md` owns the top-level envelope.
- **Streaming projector:** Optional richer UX path; correctness still depends on committed projector state and durable checkpoints.

---

## 8. Implementation order and testing

### 8.1 Phased implementation order

- **Phase 1 -- seglog foundation**  
  Build first: app data root resolution, directory creation (`storage/seglog`, `storage/redb`, `storage/jsonl`, `storage/tantivy`), and seglog writer only (envelope format, seq, flush, optional rotation by size/day). No projectors, no redb.  
  **Exit criterion:** We can append events and read them back (by tailing or reading the segment file).

- **Phase 2 -- redb and schema**  
  Build: redb open under app data root, schema (namespaces/tables per §2.3: settings, sessions, runs, checkpoints, editor, rollups, review_rules), key patterns, and a migrations runner (version in meta, run migrations on open).  
  **Exit criterion:** We can read/write settings and checkpoints (e.g. put/get in `settings` and `checkpoints` namespaces).

- **Phase 3 -- projector: seglog → JSONL mirror**  
  Build: single projector that tails seglog from a checkpoint, appends to the JSONL mirror (same envelope format), and persists its checkpoint in redb (`checkpoints` namespace).  
  **Exit criterion:** Tail seglog, write mirror, resume from checkpoint after restart (no duplicate mirror lines, checkpoint advances).

- **Phase 4 -- projector: seglog → Tantivy (chat index)**  
  Build: projector (or second projector) that reads seglog from checkpoint, indexes `chat.message` (and optionally `chat.thread_created`) into a Tantivy chat index (fields: thread_id, content, role, ts, message_id), and persists its checkpoint in redb.  
  **Exit criterion:** Events are indexed and search returns results (e.g. by content or thread_id).

- **Phase 5 -- analytics scan and rollups**  
  Build: analytics scan job (periodic or on-demand) that scans seglog (or JSONL mirror) over a time range, computes 5h/7d usage rollups, tool latency, and tool_usage (per-tool count, p50/p95, error_count per Plans/Tools.md §8.4), writes to redb `rollups` namespace, and stores a scan checkpoint.  
  **Exit criterion:** 5h/7d and tool rollups are written to redb and the UI (or a test reader) can read them.

- **Phase 6 -- wire chat, editor, and Usage**  
  Build: wire chat persistence (thread list and thread content to seglog; read from redb + seglog/snapshots per assistant-chat-design), editor state to redb `editor` namespace (FileManager.md §2.9), Usage/dashboard reading rollups from redb and triggering analytics scan (usage-feature.md); emit `usage.event` with `thread_id` and `run.completed` with optional usage snapshot.  
  **Exit criterion:** Full flow works: create thread, send message, events in seglog; projectors update mirror and index; Usage view shows rollups; editor state persists.

**Dependencies:** seglog writer before any projector; redb open + schema + migrations (including `checkpoints` and `rollups` namespaces) before projectors and analytics scan; projectors must not start until redb is open and checkpoints namespace exists; analytics scan must not run until rollups namespace (and scan checkpoint key) exists. Projectors may start once the seglog writer is initialized (current segment may be empty). When checkpoint is missing and seglog is empty, projector starts from position 0 and has nothing to process; when checkpoint is missing and seglog has data, projector starts from the beginning of the first segment.

### 8.2 Dependency graph

- **seglog writer** before any projector (projectors read seglog).
- **redb open + schema + migrations** before projector checkpoints (checkpoints namespace must exist).
- **checkpoints namespace** before any projector runs (projectors read/write checkpoint).
- **Event type schemas** (minimal set for writer) before or with Phase 1; full set before Phase 3/4/5.
- **rollups namespace** before analytics scan writes (Phase 2 defines it; Phase 5 uses it).
- **Tantivy chat index** before chat search UX (Phase 4 before Phase 6 chat wiring).
- **Chat/editor/Usage wiring** after Phase 1-5 storage primitives exist.

### 8.3 Startup and shutdown

**Startup order:** (1) Resolve app data root (env override optional). (2) Create `storage/seglog`, `storage/redb`, `storage/jsonl`, `storage/tantivy` if missing. (3) Open redb, run migrations (create namespaces and set schema_version on first run). (4) Open seglog writer (create first segment on first append if dir empty). (5) Start projectors (e.g. background threads or async tasks that tail seglog and write JSONL/Tantivy/checkpoints). (6) Optionally start analytics scan scheduler. This runs at app init (e.g. main or before UI).

**Shutdown:** (1) Signal projectors to stop (and flush). (2) Wait for projectors to commit last checkpoint and flush outputs (Tantivy commit, JSONL flush). (3) Flush and close seglog writer. (4) Close redb. Shutdown must complete within a timeout (e.g. 5s) or force-close to avoid hangs.

**Concurrency and single-writer:** The seglog writer is held by the main process; only one thread (or the main event loop) may call append, or append is protected by a mutex if multiple threads enqueue events. In-process single-writer guarantee: exactly one Writer instance; appends are serialized so that seq is monotonic and no concurrent appends occur. Projectors only **read** (tail) seglog and do not hold the writer; they run in background threads/tasks.

### 8.4 First run / empty state

- **Dirs:** If app data root exists but `storage/*` dirs are missing, create them (§2.1).
- **Seglog:** If `storage/seglog/` is empty, writer creates the first segment on first append; projectors reading checkpoint "none" start from offset 0 and see no events until the first append.
- **redb:** On first open, if no `schema_version` (or missing `meta` namespace), run initial migration that creates all namespaces and sets `schema_version` to 1. redb is created on first open if the file does not exist (standard redb behavior).
- **Projectors:** When checkpoint is missing, treat as "start from beginning of seglog" (first segment, offset 0); when seglog is empty, no work.
**Analytics Scan When Checkpoint Missing (Resolved):**

When the analytics scan checkpoint is missing (first run or after reset):
- Scan from **seq 0** (beginning of seglog).
- Rationale: ensures no data is missed. The seglog is append-only, so a full scan is safe and idempotent.
- For large seglogs, the scan is paginated: process **1000 events per batch**, yielding between batches to avoid blocking the event loop.
- After the scan completes, write the checkpoint to redb (`analytics:scan_checkpoint` → last processed seq).
- Subsequent runs resume from the checkpoint.
- Config: `analytics.scan_batch_size`, default `1000`.

### 8.5 Testing strategy

- **Phase 1:** Unit: app data root resolution; dir creation idempotent; seglog writer append and read-back/tail; rotation. Integration: append N events, close writer, open for read, assert all N lines and envelope fields.
- **Phase 2:** Unit: redb open/create; put/get in each namespace; migration runner. Integration: run migrations from version 0 to current; assert all namespaces usable.
- **Phase 3:** Unit: checkpoint read/write; tail logic; mirror append. Integration: append N events; run JSONL projector; assert mirror has N lines; restart projector, assert no duplicates and checkpoint advanced.
- **Phase 4:** Unit: Tantivy index add document and search by content and thread_id. Integration: append chat.message events; run chat projector; assert search results.
- **Phase 5:** Unit: rollup computation (usage by platform, tool percentiles). Integration: fixture seglog with known usage.event and tool.invoked; run analytics scan; assert rollup values in redb.
- **Phase 6:** Integration: end-to-end thread + message + projectors + search + Usage + editor state.

### 8.6 Acceptance criteria per phase

| Phase | Acceptance criteria |
|-------|----------------------|
| **1** | App data root resolved and storage dirs exist; seglog writer appends envelope-format events and they can be read back in order. |
| **2** | redb opens with current schema; migrations run on version change; settings and checkpoints can be written and read. |
| **3** | JSONL projector tails seglog, appends to mirror, and resumes from checkpoint after restart without duplicating or skipping events. |
| **4** | Chat projector indexes seglog events into Tantivy; search by content and thread_id returns expected results. |
| **5** | Analytics scan writes 5h/7d and tool_usage rollups to redb; a reader (e.g. UI or test) can read them. |
| **6** | Chat, editor, and Usage use seglog and redb; full flow (thread + message + projectors + search + Usage + editor state) works end-to-end. |

---

## Version history

| Date | Change |
|------|--------|
| 2026-02-20 | Initial checklist. |
| 2026-02-22 | Validation reference migrated from file-specific citation to verifier/evidence-based validation contracts. |
| 2026-02-22 (current) | Implementation-ready pass: §8 (phased implementation order, dependencies, startup/shutdown, first-run, testing, acceptance criteria); definitions (project_id, path_hash, window); extended event types (HITL, interview, run tier/iteration/verification, queue, plan_todo, thread archive/delete, subagent, editor lifecycle); extended redb keys (queue, plan_todo, thread_usage, file_tree_expanded, layout, recent_files, run/interview/hitl checkpoints) and value encoding; §5 gaps (implementation order, projectors when seglog empty); §6 problems (API contract, projector panic, project/thread lifecycle, queue/HITL restore, interview vs thread, retention, editor keys, thread_checkpoint cleanup, multi-instance HITL). |
| 2026-02-20 | Fleshed out: definitions, §2 how we do it (locations, seglog format, redb schema, projectors, analytics), §5 gaps, §6 problems, §7 enhancements; expanded checklist. |

## Scheduler Runtime, Safe-Point, and Remediation Storage Addendum (2026-03-08)

Required storage support for the runtime scheduler feature cluster.

### Event ingestion

The storage layer MUST ingest and project the following canonical events (using canonical names, not legacy aliases):

**Scheduler events:**
- `scheduler.pass` (canonical; legacy alias: `run.scheduler_analysis`)
- `node.blocked` (canonical; legacy alias: `run.node_blocked`)
- `node.unblocked` (canonical; legacy alias: `run.node_unblocked`)

**Safe-point events:**
- `safe_point.created`
- `safe_point.restored`

**Remediation events:**
- `remediation.spawned` (canonical; legacy alias: `run.remediation_started`)
- `remediation.resolved` (canonical; legacy alias: `run.remediation_completed`)

> **Migration rule:** Storage consumers MUST accept both canonical and legacy event names during migration but MUST normalize to canonical names before writing projections. New storage code MUST NOT emit legacy names.

### redb key projections

```
scheduler_pass.{run_id}.{scheduler_pass_id}
blocked_projection.{run_id}.{node_id}.{blocked_sequence}
remediation.{run_id}.{remediation_root_id}
safe_point.sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}
```

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md
## Runtime Attempt / Safe Point / Queue Analysis Storage Addendum (2026-03-09)

Storage and projections MUST persist the scheduler and recovery model without SQLite.

### Projection rules
- run-graph and orchestrator projections MUST resolve by `attempt_id` rather than only by `node_id`
- the latest blocked state must remain inspectable after app restart
- `ready_since_utc` must survive projection refresh while the node remains continuously ready
- stale attempts from an older `replan_generation` must remain queryable for history but may not be resumed as active work

### Persistence safety rules
- safe-point metadata must persist before mutation-capable attempt execution begins
- local-work-preserved blocked outcomes must be represented explicitly, not inferred from missing failure rows
- queue-analysis records are append-only observability data; later projections may summarize them, but the canonical pass history must remain reconstructable
## Runtime Attempt / Safe Point / Queue Analysis Reconciliation Addendum (2026-03-09)

Storage and projections MUST persist the scheduler and recovery model without ambiguity.

### Counter semantics
- `attempt_count` = total dispatch attempts for the node in the run, including the first attempt
- `retry_count` = `attempt_count - 1`

### Projection rules
- run-graph and orchestrator projections MUST resolve by `attempt_id`, not only `node_id`
- blocked projections remain historical after resolution; unblocking does not overwrite prior blocked rows
- `ready_since_utc` survives projection refresh only while the node remains continuously ready
- attempts from older generations remain queryable but are labeled stale and are never resumable

### Snapshot refresh rules
- permission/auth/approval/replan resolution creates a new attempt snapshot; old attempt snapshots remain immutable
- safe-point restore does not mutate the originating attempt record in place; it leads to a new attempt record tied back by lineage
## Runtime Recovery Persistence and Restart Reconciliation Addendum (2026-03-09)
### Promoted Section 15 restore-scope rules

Restore eligibility:
- workspace tabs restore independently with project identity, active surface, and local shell state
- detached windows restore only when their surface class and platform support allow it
- in-shell browser tabs restore by project and workspace tab
- auth sessions and automation sessions do not auto-restore as shell browser tabs
- terminal sessions and dev sessions restore as records of prior state; a live process is not presumed healthy after restart without verification

Project-switch rule:
- switching projects recalculates effective tool/MCP/persona/browser capability state for the new project context
- background activity from the previous project remains queryable and visible through its own project/workspace identities rather than being collapsed into the new active project
This section is the canonical persistence contract for runtime recovery, blocked episodes, usage attribution, and runtime identity needed by Orchestrator, Run Graph, HITL, and chat surfaces.

### Canonical keys
- `scheduler_pass_record`: key = `run_id`, `scheduler_pass_id`
- `blocked_projection`: key = `run_id`, `node_id`, `blocked_sequence`
- `attempt_record`: key = `run_id`, `node_id`, `attempt_id`
- `tier_runtime_record`: key = `run_id`, `tier_id`
- `usage_record`: key = `run_id`, `tier_id`, `attempt_id?`, `usage_sequence`
- `evidence_record`: key = `run_id`, `tier_id`, `evidence_id`
- `wizard_runtime_state`: key = `wizard_id`
- `safe_point_restore_record`: key = `safe_point_id`, `restore_sequence`
- `thread_blocked_notice`: key = `thread_id`, `blocked_sequence`

`attempt_id?` and `thread_id?` remain fields on `blocked_projection` and are not primary-key components.

### Cross-surface receipt record

The runtime receipt record is the canonical bridge between Orchestrator, Source Control, GitHub Actions, Docker Manager, Artifacts, and Usage.

Minimum fields:
- `run_id`
- `attempt_id`
- `project_id`
- `repo_id?`
- `worktree_id?`
- `branch_ref?`
- `commit_range?`
- `workflow_refs?` with workflow / run / job / step identifiers
- `docker_refs?` with runtime/context/image/publish/template identifiers
- `kubernetes_refs?` with context/namespace/workload/rollout identifiers
- `usage_event_ref?`
- `created_at_utc`

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Orchestrator_Page.md

### Canonical records
1. `attempt_record`
   - fields include `scheduler_pass_id`, requested/effective persona snapshot refs, requested/effective model snapshot refs, requested/effective permission snapshot refs, `requested_auth_mode?`, `effective_auth_mode?`, `requested_account_policy?`, `effective_account_id?`, `effective_project_id?`, `account_switch_reason?`, `replan_generation`, `mutation_capable`, `safe_point_id?`, `provider_attempt_ref?`, remediation lineage refs, and terminal outcome fields
2. `tier_runtime_record`
   - fields include `run_id`, `tier_id`, current state, requested/effective persona/platform/model, `requested_auth_mode?`, `effective_auth_mode?`, `effective_account_id?`, latest progress markers, queue-analysis refs, and pointers to current attempt or blocked episode when active
3. `blocked_projection`
   - fields include `blocked_reason_code`, ordered `allowed_action_ids[]`, `preserved_local_work`, `requires_safe_point_restore?`, prerequisite metadata, `failure_class?`, `detail_ref?`, `attempt_id?`, and `thread_id?`

ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md#EventRecord

4. `usage_record`
   - fields include `run_kind`, `run_id`, `tier_id`, `attempt_id?`, `thread_id?`, `effective_platform`, `effective_model`, `effective_auth_mode?`, `effective_account_id?`, `provider_account_id?`, `usage_source_kind?`, `signal_confidence?`, `effective_project_id?`, `input_tokens`, `output_tokens`, `total_tokens`, `estimated_cost?`, and usage timestamps suitable for rollups and ledger views
5. `evidence_record`
   - fields include `summary`, `summary_kind?`, evidence refs, and any parent-summary/handoff refs needed by completed-prose surfaces
6. `thread_blocked_notice`
   - fields include `node_id?`, `attempt_id?`, active blocked metadata, `message_id`, and `resume_url?`
7. `wizard_runtime_state`
   - fields include `wizard_status`, `wizard_step`, `blocked_reason_code?`, `clarification_round_count`, `report_ref?`, `resume_url?`, `decomposition_degraded`, `degradation_reason?`, and `replan_generation?`

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Orchestrator_Page.md
### Counter rule
- `attempt_count` is the total started attempts for the node in the run
- `automatic_retry_count`, `prerequisite_resume_count`, `manual_resume_count`, and `remediation_retry_count` remain independent stored counters
- `retry_count` is derived display data only and MUST NOT drive policy

### Restart and stale history
Attempts from older generations, or in-flight attempts that cannot resume after restart, transition to `stale_historical`. They remain queryable but are never resumable.

### Identity and field-name rules
- canonical blocked-action field is `allowed_action_ids[]`
- canonical persisted references use `*_ref` fields; raw `*_path` naming is compatibility-only
- requested vs effective persona/platform/model state must remain queryable from runtime records so UI surfaces do not reconstruct it heuristically

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Personas.md
## Permission Snapshot Storage and Safe-Point Namespace Addendum

### Permission snapshot storage

The `attempt_record` includes a `permission_snapshot` field containing the resolved permission state at attempt start.

**Schema:**
```json
{
  "snapshot_id": "uuid",
  "attempt_id": "uuid",
  "node_id": "uuid",
  "captured_at": "ISO-8601 timestamp",
  "resolved_permissions": {
    "<permission_key>": {
      "resolution": "allow | deny | ask",
      "source": "preset | project | user_override | session",
      "effective_value": true
    }
  }
}
```

**Rules:**
1. Created at `attempt.started` emission, before any tool invocation.
2. Immutable after creation -- permission changes during the attempt do NOT retroactively modify the snapshot.
3. Used for audit trail and for determining whether a permission change requires attempt restart.

### Safe-point vs restore-point namespace separation

Safe points and restore points use distinct storage key prefixes:

| Type | Key prefix | Scope |
|------|-----------|-------|
| Safe point | `sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}` | Runtime-internal, scoped to run/node/attempt |
| Restore point | `rp:{project_id}:{restore_point_id}` | User-facing, scoped to project |

These namespaces MUST NOT overlap. Queries for safe points MUST use the `sp:` prefix; queries for restore points MUST use the `rp:` prefix.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/newfeatures.md, ContractName:Plans/Contracts_V0.md
