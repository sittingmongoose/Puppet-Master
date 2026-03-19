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
  - `run_id`
  - `node_id?`
  - `attempt_id?`
  - the full Persona/runtime snapshot active for that stage transition.

Approval visibility rule:
- If an approval-blocked episode is raised after Persona/runtime state has already resolved, the persisted blocked record SHOULD include or reference the current Persona/runtime snapshot so approval UI and replay can display what the user is approving.

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
| `run.started` | Orchestrator or Assistant run started | `run_id`, `project_id`, optional `thread_id`, `mode`, `strategy`, `strategy_resolution_reason`, optional requested/effective runtime snapshot refs |
| `run.completed` | Run finished (success or failure) | `run_id`, `status`, `outcome`, optional `stop_reason`, optional `budget_key`, optional `budget_limit`, optional `observed_value`, optional **`usage`** (summary for this run: e.g. `tokens_in`, `tokens_out`, `cost`, `thread_id`) so consumers can get run-level usage without scanning `usage.event`. Canonical per-request usage remains `usage.event`; `run.completed.usage` is a convenience snapshot for dashboards and the thread-scoped Context Detail Pane. |
| `usage.event` | Token/request/error event for Usage/Ledger | `usage_event_ref`, optional `run_id`, optional `thread_id`, optional `node_id`, optional `attempt_id`, `platform`, `tokens_in`, `tokens_out`, `timestamp`, optional `cost`, `reasoning_tokens`, `cache_read`, `cache_write` |
| `tool.invoked` | Tool call (for analytics) | `tool_name`, `latency_ms`, `run_id`; optional **`success`** (bool), **`error`** (string), **`thread_id`** for error rate and Usage tool widget (Plans/Tools.md §8.0). |
| `tool.denied` | Tool call blocked by policy (optional) | `tool_name`, `run_id`, `reason` (e.g. "permission_denied", "user_declined") for audit (Plans/Tools.md §8.0). |

**Additional event types (full feature set):** The following support assistant-chat-design, orchestrator, interview, and human-in-the-loop. Projectors and analytics scan may ignore unknown types until needed.

| type | Purpose | payload (key fields) |
|------|---------|----------------------|
| `chat.queue_updated` (or `queue_add` / `queue_remove` / `queue_edit` / `queue_clear`) | Queue state per thread (§4.1, §11) | `thread_id`, `message_id`, `text` (for add/edit) |
| `chat.thread_archived`, `chat.thread_deleted` | Archive (hide but keep searchable) or permanent delete (§11) | `thread_id`, optional `project_id` |
| `chat.plan_todo_updated` | Plan and todo per thread (§11) | `thread_id`, plan/todo payload |
| `chat.subagent_started`, `chat.subagent_completed` | Subagent lifecycle in thread (§14.1) | `thread_id`, `subagent_id` or persona name, optional `task_label` |
| `run.tier_started`, `run.tier_completed` | Compatibility replay events for legacy tier-boundary views | `run_id`, optional `node_id`, optional `work_package_id`, optional `feature_seam_id`, optional derived tier label |
| `run.iteration_started`, `run.iteration_completed` | Iteration boundaries | `run_id`, `iteration_id`, `status` |
| `run.verification_result` | Verification passed/failed | `run_id`, `tier`, `passed`, optional details |
| `interview.started`, `interview.completed` | Interview session | `interview_id`, `project_id`, optional `thread_id` |
| `interview.phase_started`, `interview.phase_completed` | Interview phase | `interview_id`, `phase`, optional result |
| `interview.document_generated` | Interview artifact for projectors/Tantivy | `interview_id`, `doc_type`, `path` or content ref |
| `hitl.approval_requested`, `hitl.approved`, `hitl.rejected`, `hitl.cancelled` | Compatibility approval event family for blocked runtime state | optional `request_id` for lineage, `run_id`, `node_id`, `blocked_sequence`, `message`, ordered `allowed_action_ids[]`, `timestamp`; resolution events add `resolution`, optional `reject_resolution`, optional `rationale` |
| `editor.file_opened`, `editor.file_closed`, `editor.tab_switched`, `editor.buffer_saved`, `editor.buffer_reverted` | Editor lifecycle (FileManager.md §2.9) | `project_id`, `path` or `path_hash`, optional tab index / session_id |
| `restore_point.created` | Auto-snapshot before turn/tool mutation (newfeatures.md §8) | `restore_point_id`, `project_id`, `turn_id` or `iteration_id`, `timestamp`, `file_snapshots` list: `{ path, content_hash, blob_ref }` (or inline marker for small blobs) |
| `restore_point.pruned` | Retention cleanup of old restore points (§8) | `restore_point_id`, `project_id`, `reason` (e.g. `age_exceeded`, `count_exceeded`) |
| `rollback.requested` | Agent or user requests rollback (§8) | `restore_point_id`, `requester` (`agent` or `user`), `scope` (`narrow` or `broad`), optional `thread_id` |
| `rollback.confirmed` | User confirms rollback (§8) | `restore_point_id`, `conflicts` (list of conflicted files, may be empty) |
| `rollback.completed` | Rollback applied successfully (§8) | `restore_point_id`, `files_restored` (list of paths written back) |
| `rollback.cancelled` | User cancelled rollback (§8) | `restore_point_id`, optional `reason` |
| `config.validation.passed`, `config.validation.warning`, `config.validation.failed` | Runtime execution-unit config validation result | `run_id`, optional `node_id`, optional `attempt_id`, requested/effective platform/model/runtime fields, `issues[]` |
| `run.persona_stage_changed` | Runtime Persona/runtime stage transition | `run_id`, optional `node_id`, optional `attempt_id`, `persona_stage`, requested/effective Persona/runtime snapshot, `selection_reason` |
| `platform.capability_evaluated` | Platform capability snapshot + gating decision | `run_id`, `platform`, `snapshot`, `precedence_source`, `gated_features[]` |
| `run.qa_cycle_started`, `run.qa_cycle_completed` | Autonomous QA loop lifecycle | `run_id`, optional `node_id`, optional `attempt_id`, `cycle`, `blocking_findings`, `outcome` |
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
- `preview_state.v1:{project_id}:{preview_subject_id}` -> JSON `{ preview_mode, last_preview_session_id, last_attached_surface, preview_surface_kind, export_preferences, scroll_sync_enabled, last_error }`
- `preview_source_artifact.v1:{project_id}:{artifact_id}` -> JSON `{ artifact_kind, source_kind, origin_surface, thread_id?, message_id?, source_revision, source_text_ref, backing_document_id?, last_saved_path? }`

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Runtime_Artifacts_Panel.md

**Projector rule**
- lifecycle events may continue to carry `document_id` or `artifact_id`, but projectors MUST derive `preview_subject_id` deterministically for restore and UI-state joins
- restore MUST NOT require a historical live browser/webview instance or persisted DOM state

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md

##### Browser session state and profile isolation

Browser-capable sessions persist separately from preview-subject identity.

**Required redb keys**
- `browser_session_state.v1:{project_id}:{browser_session_id}` -> JSON `{ session_class, workspace_tab_id?, preview_subject_id?, requested_browser_runtime, effective_browser_runtime, requested_capabilities, effective_capabilities, capability_degradations, blocked_actions, permission_tier, profile_scope, restore_policy, takeover_state, last_selected_tab?, last_error? }`
- `browser_profile_state.v1:{project_id}:{profile_scope}` -> JSON `{ history, bookmarks, cookie_store_ref?, local_storage_ref?, session_storage_ref? }`
- `browser_profile_state.external.v1:{profile_scope}` -> JSON `{ history, bookmarks }` for explicitly separate detached or other externalized non-project browsing profiles when supported

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md

Partitioning rules:
- `workspace_preview` uses project-scoped persistent browser state
- `detached_preview` shares the originating normal-browsing state unless the user explicitly creates separate detached state
- `automation_session` uses separate ephemeral profile state by default
- `auth_session` uses isolated auth/profile state
- browser state MUST NOT silently bleed across profile scopes

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md

##### Browser lifecycle events and payloads

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
- `browser.session.created`
- `browser.session.state_changed`
- `browser.session.takeover_state_changed`
- `browser.session.promoted`
- `browser.session.closed`
- `browser.context_captured`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Runtime_Artifacts_Panel.md

**Minimum event payloads**
- `preview.session.*`: `project_id`, `preview_session_id`, `preview_subject_id`, `source_kind`, `preview_surface_kind`, `transport_mode`, `attached_surface`, `source_revision`, optional `error_code`
- `preview.action.*`: `project_id`, `preview_session_id`, `node_id`, `operation`, `result_code`, optional `patch_summary`
- `browser.session.*`: `project_id`, `browser_session_id`, `session_class`, `workspace_tab_id?`, `preview_subject_id?`, `requested_browser_runtime`, `effective_browser_runtime`, `requested_capabilities`, `effective_capabilities`, `capability_degradations`, `blocked_actions`, `permission_tier`, `profile_scope`, `restore_policy`, `takeover_state`, optional `error_code`
- `browser.context_captured`: `project_id`, optional `thread_id`, `browser_session_id`, `session_class`, `capture_kind`, `capture_id`, `page_url`, bounded summary payload
- browser-linked `runtime_artifact.*` records for screenshots, traces, videos, and recordings MUST carry `browser_session_id` and `session_class` when they originate from a browser session

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Runtime_Artifacts_Panel.md

**Restore rule**
- redb restores browser/preview UI intent and recent state
- seglog remains the canonical source for lifecycle/audit history
- requested/effective browser runtime/capability snapshots are persisted as frozen runtime history and are not recomputed heuristically from current settings

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md

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

The promoted orchestrator/runtime rewrite requires durable record and projection families that do not depend on `tier_id` as the primary cross-surface key.

Required canonical record and projection families include:
- `attempt_record.v1:{project_id}:{run_id}:{node_id}:{attempt_id}`
- `blocked_projection.v1:{project_id}:{run_id}:{node_id}:{blocked_sequence}`
- `artifacts_index.v1:{project_id}:{artifact_id}`
- `lane_record.v1:{project_id}:{lane_id}`
- `lane_projection.v1:{project_id}:{lane_id}`
- `worktree_record.v1:{project_id}:{worktree_id}`
- `worktree_projection.v1:{project_id}:{worktree_id}`
- `concern_record.v1:{project_id}:{concern_id}`
- `project_summary.v1:{project_id}`
- `project_attention_item.v1:{project_id}:{attention_item_id}`
- `account_pressure_episode.v1:{provider_id}:{account_id}:{episode_id}`
- `account_switch_event.v1:{provider_id}:{event_id}`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Multi-Account.md

Required identity and attribution fields across runtime-linked record families include:
- `project_id`
- `run_id`
- `node_id?`
- `attempt_id?`
- `blocked_sequence?`
- `feature_seam_id?`
- `work_package_id?`
- `lane_id?`
- `worktree_id?`
- `execution_role?`
- `requested_account_policy?`
- `requested_account_id?`
- `requested_account_binding?`
- `effective_account_id?`
- `account_switch_reason?`
- `provider_attempt_ref?`
- `usage_event_ref?`
- `operational_identity?`

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md

Projection-state families must expose both freshness and health:
- `projection_freshness`: `current | refreshing | stale`
- `projection_health`: `healthy | degraded | unavailable`

Rules:
- stale and degraded are different states and must not collapse into one generic trust field
- mutating actions must revalidate or gate when projections are stale, degraded, or unavailable
- record-backed inspection in History and Ledger remains available even when summary projections lose trust

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FinalGUISpec.md

Historical restore and preview identities remain subject-first:
- `doc:<document_id>`
- `artifact:<artifact_id>`

Rules:
- `resume_url` persists serialized transport only
- route restoration resolves through canonical record identity, not through feature-local ad hoc payloads
- `tier_runtime_record` may survive only as a derived compatibility projection; it is not canonical runtime identity

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/Contracts_V0.md
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

