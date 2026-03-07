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

**Schema:** redb uses **namespaces** (tables) and **key-value** pairs. Keys and values are bytes; we define a **key encoding** (e.g. string prefix + project_id + id) and **value encoding** (e.g. bincode or JSON) per namespace.

**Namespaces (tables) and key patterns:**

| Namespace | Key pattern | Value | Purpose |
|-----------|-------------|--------|---------|
| `settings` | `app.{key}` | JSON or bincode | App-level settings (theme, max_tabs, etc.) |
| `settings` | `project.{project_id}.{key}` | JSON | Per-project settings |
| `sessions` | `thread.{thread_id}` | Thread metadata (title, created, project_id) | Chat thread list |
| `sessions` | `thread_list.{project_id}` | List of thread_ids | Order of threads per project |
| `runs` | `run.{run_id}` | Run metadata + status | Run lookup |
| `checkpoints` | `projector.app_global.{projector_name}` | `{ seglog_path, offset_or_seq }` | Projector resume position for the app-global seglog |
| `checkpoints` | `projector.project_local.{project_id}.{projector_name}` | `{ seglog_path, offset_or_seq }` | Projector resume position for one project's local seglog |
| `checkpoints` | `thread_checkpoint.{thread_id}` | `{ selected_restore_point_id, anchor_message_id, anchor_seq, updated_at }` | Selected restore pointer for resume/rewind |
| `editor` | `tabs.{project_id}` | Ordered list of paths | FileManager.md §2.9 |
| `editor` | `active_tab.{project_id}` | Active tab index | |
| `editor` | `scroll_cursor.{project_id}.{path_hash}` | Scroll/cursor state | |
| `editor` | `max_tabs` | u32 | App-level |
| `editor` | `session.{project_id}.{session_id}` | Session-scoped view state | |
| `rollups` | `usage_5h.{platform}` | Aggregated 5h usage | Usage/dashboard |
| `rollups` | `usage_7d.{platform}` | Aggregated 7d usage | |
| `rollups` | `tool_latency.{window}` | Tool latency distribution | Analytics |
| `rollups` | `tool_usage.{window}` | Per-tool stats (count, p50/p95 ms, error_count) for Usage tool widget | Plans/Tools.md §8.4; analytics scan aggregates `tool.invoked` into this key. |
| `rollups` | `tool_usage_meta.{window}` | Freshness metadata (`computed_at`, `window_started_at`, `window_ended_at`) for the tool usage widget | Lets Usage show a deterministic "Last updated" timestamp without scanning seglog. |
| `rollups` | `thread_usage.{thread_id}` | Optional per-thread usage rollup (context circle, thread Usage tab) | Overwritten by projector or analytics; keys for archived/deleted threads can be removed or left to retention. |
| `sessions` | `queue.{thread_id}` | Queue state (items, order) for thread | Restored on load; written when queue events applied. |
| `sessions` | `plan_todo.{thread_id}` | Plan and todo state for thread | Restored on load; written when plan_todo events applied. |
| `sessions` | `context_overlay.{thread_id}` | JSON `context_overlay_state.v1` | Thread-local Context Lens overlay state (mute/focus/subcompact) + Auto Retrieval override (assistant-chat-design.md §17.5–§17.6). |
| `editor` | `file_tree_expanded.{project_id}` | Expanded paths in file tree | Optional; value: list of path_hashes or paths. |
| `editor` | `layout.{project_id}` (optional) | Split sizes, panel visibility | Optional; value: layout blob. |
| `editor` | `recent_files.{project_id}` (optional) | Recently opened file paths | Optional; value: ordered list. |
| `checkpoints` | `run.{run_id}` | Run resume position (segment + offset or seq) | Replay or resume run; cleanup when run is discarded. |
| `checkpoints` | `interview_session.{interview_id}` | Interview session state | Restore interview UI. |
| `checkpoints` | `interview_checkpoint.{interview_id}` | Interview projector/phase position | Resume interview pipeline. |
| `checkpoints` | `hitl.{run_id}` | HITL pending state (e.g. approval_requested) | Restore HITL prompt after crash; clear on approved/rejected. |
| `runs` | `background.{run_id}` | JSON background-run record | Queue/recovery state for background and async runs. |
| `runs` | `background_queue.{project_id}` | JSON ordered queue entries | Durable bounded queue per project. |
| `runs` | `tier_runtime.{run_id}.{tier_id}` | JSON requested/effective Persona/runtime + config-validation snapshot | Restore/run inspection surfaces. |
| `runs` | `crew.{crew_id}` | JSON crew metadata + lifecycle state | Crew coordination/replay. |
| `runs` | `crew_board.{crew_id}` | JSON ordered message board summary / index | Durable shared-messaging projection for crews. |
| `review_rules` | `app` or `project.{project_id}` | YAML review rules blob | FileManager.md §10.8 |
| `editor` | `snippets.global` / `snippets.project.{project_id}` | Snippet collections and template metadata | FileManager.md §10.9 |
| `restore_points` | `point.{project_id}.{restore_point_id}` | JSON: `{ turn_id, timestamp, file_snapshots: [{ path, content_hash, blob_ref }] }` | Restore-point metadata and blob references for rollback (newfeatures.md §8). Blobs may be inline (small) or file-referenced. |
| `restore_points` | `index.{project_id}` | JSON: ordered list of `restore_point_id` | Fast listing for "History" / "Restore to…" UI. Pruned when retention exceeded. |
| `restore_points` | `index_thread.{thread_id}` | JSON: ordered list of `{ restore_point_id, anchor_message_id, anchor_seq, created_at }` | Thread-local restore history for rewind menus and recovery |

**Value encoding (per namespace):** Keys are UTF-8 or fixed encoding; values are namespace-specific. Use **JSON** for human-inspectable or cross-version flexibility (settings, thread metadata, checkpoints, queue, plan_todo, rollups for dashboard). Use **bincode** (or redb native types) where compact and fast read/write matter (e.g. editor scroll_cursor, large blobs). Document the choice per namespace in code.

- **settings:** JSON (app and project keys).
- **sessions:** `thread.{id}` → JSON `{ title, created_ts, project_id, archived? }`; `thread_list.{project_id}` → JSON array of thread_id; `queue.{thread_id}`, `plan_todo.{thread_id}`, `context_overlay.{thread_id}` → JSON (structure per assistant-chat-design §11).
- **runs:** JSON `{ status, started_ts, ... }`.
- **checkpoints:** JSON `{ segment, offset }` or `{ seq }` for projectors; run/interview/hitl checkpoints as JSON with enough to resume.
- **HITL checkpoint shape:** `checkpoints -> hitl.{run_id}` stores at minimum `{ request_id, run_id, tier_id, tier_type, request_kind, message, allowed_actions, status, created_at, resolved_at?, rationale?, reject_resolution? }`.
- **background run state:** `runs -> background.{run_id}` stores the durable queue/lifecycle record for background or async runs; `background_queue.{project_id}` stores the ordered pending queue for restart recovery.
- **tier runtime snapshots:** `runs -> tier_runtime.{run_id}.{tier_id}` stores the frozen requested/effective Persona/runtime/config-validation record used by Orchestrator history, Current Task UI, and resume.
- **crew state:** `runs -> crew.{crew_id}` and `crew_board.{crew_id}` are projections of seglog crew lifecycle and message-board events; JSON files under `.puppet-master/state/` are derived mirrors only, never canonical state.
- **restore_points:** JSON for metadata and index; blob references point to app-data files or inline bincode for small snapshots. Pruning deletes both redb key and referenced blob file.
- **editor:** Tabs and lists as JSON; scroll_cursor and binary blobs as bincode if desired.
- **rollups:** JSON: `usage_5h/7d` → `{ platform, tokens_in, tokens_out, ... }`; `tool_usage.{window}` → `{ tool_name, count, p50_ms, p95_ms, error_count }`; `tool_usage_meta.{window}` → `{ computed_at, window_started_at, window_ended_at }`; `thread_usage.{thread_id}` → same shape as usage rollup for one thread.
- **review_rules:** UTF-8 YAML text persisted as the canonical editable format; validation metadata may be cached separately if needed.
- **editor snippets:** JSON for snippet collections (`name`, `prefixes`, `body`, `description`, `scope`, `source`).

**Migrations:** Use redb's schema version or a custom `schema_version` key in a `meta` namespace. On open, check version; if older, run migration functions (e.g. create new namespaces, copy/transform data, bump version). Document each migration (version N → N+1) and keep migrations reversible where possible (e.g. add column, don't drop until next major).

#### 2.3.0 Thread checkpoint restoration contract

- `thread_checkpoint.{thread_id}` stores the currently selected restore pointer for that thread, not the full restore history.
- The full per-thread restore history is sourced from `restore_points.index_thread.{thread_id}` plus canonical restore-point records under `restore_points.point.{project_id}.{restore_point_id}`.
- `restore_point.created` events MUST include `thread_id`, `anchor_message_id`, `anchor_seq`, `restore_point_id`, and `project_id` so thread checkpoint state can be rebuilt deterministically from seglog.
- Checkpoint keys MUST store only pointers/cursors/IDs, not snapshot bodies.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md#EventRecord

#### Additions: Document bundle registry + inline notes persistence

Document-generation bundles (Requirements Doc Builder bundles and Interview bundles) must persist enough state to:
- restore the Embedded Document Pane doc list + selection after restart
- restore inline notes and their lifecycle state
- enforce final-review gating (all docs approved + no open notes)
- support clean discard semantics for final review Reject

**Recommended redb placement:**
- Store durable bundle state in `runs` and/or `checkpoints` namespaces as JSON blobs keyed by `bundle_id` / `run_id`.

**Key patterns (add rows to the table above):**
- `runs` → `bundle.{bundle_id}` → JSON `{ bundle_id, run_id, page_context, bundle_state, created_at, updated_at }`
- `runs` → `doc_registry.{bundle_id}` → JSON `document_registry.v1`
- `runs` → `notes_index.{bundle_id}` → JSON `{ note_ids: [note_id...], open_count, addressed_count, resolved_count }`
- `runs` → `note.{bundle_id}.{note_id}` → JSON `note_record.v1`
- `runs` → `review_findings_summary.{bundle_id}.{review_run_id}` → JSON `review_findings_summary.v1`
- `checkpoints` → `document_pane_state.{bundle_id}` → JSON `document_pane_state.v1`
- `checkpoints` → `final_review_output.{bundle_id}` → JSON `{ artifact_set_ref, created_at, status }` (separate artifact set so Reject discards cleanly)

**Schema notes (must align with workflow contracts):**
- `document_registry.v1` fields: `{ bundle_id, docs[]: { doc_id, path, display_name, created_by, status, updated_at } }`.
- `bundle_state.v1` fields: `{ bundle_id, run_id, page_context, state, selected_doc_id, final_review: { status, review_run_id?, findings_summary_ref?, gate_ready }, open_note_count, approved_doc_count, created_at, updated_at }`.
- `document_pane_state.v1` fields: `{ bundle_id, selected_doc_id, selected_view, follow_active_doc, scroll_state, filter_state, history_selection }`.
- `review_findings_summary.v1` fields: `{ bundle_id, review_run_id, scope, per_doc_counts: [{ doc_id, gaps, consistency_issues, missing_information, unresolved_items }], applied_changes_summary, unresolved_items, revised_artifact_ref?, created_at, updated_at }`.
- `final_review_output.v1` fields: `{ bundle_id, review_run_id, findings_summary_ref, artifact_set_ref, created_at, status }`.
- `note_record.v1` includes both selector types:
  - `anchor.text_position` `{ start, end }`
  - `anchor.text_quote` `{ exact, prefix, suffix }` with default prefix/suffix length 32 chars (clamped).
- Notes kind + lifecycle rules are enforced at write time:
  - kind inference: `question` if ends with `?` or starts with `Q:`, else `change_request`; allow user override and `both`.
  - lifecycle: `open` → `addressed` → `resolved` (user controls resolved).

**Seglog vs redb:**
- redb is the durable snapshot store for UI restoration and gating decisions.
- Required persisted events for replay-safe workflow state: `bundle.created`, `bundle.state_changed`, `bundle.doc_status_changed`, `bundle.note_created`, `bundle.note_status_changed`, `bundle.final_review_started`, `bundle.final_review_completed`, and `bundle.final_gate_decided`.
- Projectors MUST be able to deterministically rebuild `bundle_state`, `document_registry`, `notes_index`, `note_record`, `review_findings_summary`, and `final_review_output` from those events plus canonical artifact references.

ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/FinalGUISpec.md

#### Additions: Targeted revision persistence + event contract

Targeted revision runs ("Resubmit with Notes") must persist enough state to support interruption + resume, deterministic replay, note-thread reply rendering, and final-review gating derived from note status.

**Recommended redb placement (add rows to the table above):**
- `runs` → `revision_run.{bundle_id}.{revision_id}` → JSON `{ bundle_id, revision_id, status, selected_doc_ids, selected_note_ids, started_at, completed_at?, interrupted_at?, resumed_from_revision_id? }`
- `runs` → `note_reply_index.{bundle_id}.{note_id}` → JSON `{ replies: [{ author, created_at, body, revision_id? }] }`

**`note_record.v1` minimum additions:**
- `addressed_explanation?`
- `last_revision_id?`
- `last_reanchor_result?` = `position_match | quote_match | anchor_not_found`
- `updated_anchor?`
- `reopened_count`

**Required seglog events (minimum set):**
- `bundle.revision_started`
- `bundle.revision_completed`
- `bundle.revision_interrupted`
- `bundle.note_replied`

ContractRef: ContractName:Plans/chain-wizard-flexibility.md#5.5.2, ContractName:Plans/interview-subagent-integration.md


#### Additions: Auto Retrieval + Context Lens persistence (Assistant chat)

The Assistant chat context pipeline requires durable per-thread state for Auto Retrieval override and Context Lens overlays (mute/focus/subcompact) so resume/rewind remains consistent across restarts.

**Recommended redb placement (add rows to the table above):**
- `sessions` → `context_overlay.{thread_id}` → JSON `context_overlay_state.v1`

**context_overlay_state.v1 (keys only; deterministic):**
- `auto_retrieval_enabled: boolean` (default `true`)
- `muted_message_ids: string[]`
- `focused_message_ids: string[]`
- `subcompacts: { subcompact_id: string, message_ids: string[], summary_text?: string, summary_blob_ref?: string, created_ts: string }[]`

Rule: Any persisted overlay summaries and any indexed/log payloads MUST comply with PolicyRule:no_secrets_in_storage / INV-002 (secrets stripped/redacted before persistence).
ContractRef: ContractName:Plans/assistant-chat-design.md#17-context-truncation, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002
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

