## 2. How we're going to do it

### 2.1 File locations and directory layout

All storage lives under a single **app data root** (e.g. `~/.puppet-master/` or `$XDG_DATA_HOME/puppet-master/` on Linux; `%APPDATA%/puppet-master` on Windows; `~/Library/Application Support/puppet-master` on macOS). Project-specific data (e.g. per-project seglog or redb) may live under **project root** (e.g. `.puppet-master/`) when we want isolation per repo; the plan below assumes **app-global** seglog/redb by default, with **project_id** or **project_path** in keys where needed.

| Path (relative to app data root) | Purpose |
|----------------------------------|---------|
| `storage/seglog/` | seglog segment files (or single `events.log`). Append-only. |
| `storage/redb/` | redb database file(s). One main DB (e.g. `state.redb`) for settings, sessions, checkpoints, rollups; schema versioned via migrations. |
| `storage/jsonl/` | Human-readable JSONL mirror of seglog (one file per day or one rolling file). Written by projector. |
| `storage/tantivy/` | Tantivy index directories (e.g. `chat`, `docs`, `logs`). Built by projectors. |
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

### 2.2 seglog: format, writer, rotation

**Event envelope (per record):** Each appended record is a single line or frame so we can tail easily. Recommended: **newline-delimited JSON** (NDJSON) with a common envelope, e.g.:

```json
{"ts": "2026-02-21T12:00:00Z", "seq": 12345, "type": "chat.message", "payload": { ... }}
```

- **ts:** ISO8601 timestamp (UTC).
- **seq:** Monotonically increasing sequence number (per writer or global). Used for ordering and checkpointing.
- **type:** Event type (e.g. `chat.message`, `run.started`, `run.completed`, `usage.event`, `tool.invoked`, `editor.file_opened`). Drives projector routing.
- **payload:** Type-specific JSON; schema per type (see below).

**Event types (minimum set for chat + usage + runs):**

| type | Purpose | payload (key fields) |
|------|---------|----------------------|
| `chat.message` | User or assistant message appended to a thread | `thread_id`, `role`, `content`, `message_id`, optional `attachments`, `model`. For **assistant** messages, optional **`usage`** (e.g. `tokens_in`, `tokens_out`, `cost`, `reasoning_tokens`) so per-thread usage can be derived from messages without querying usage.event; canonical usage remains `usage.event` with `thread_id`. |
| `chat.thread_created` | New thread | `thread_id`, `project_id`, `title` |
| `run.started` | Orchestrator or Assistant run started | `run_id`, `thread_id`, `platform`, `tier_id` |
| `run.completed` | Run finished (success or failure) | `run_id`, `status`, optional **`usage`** (summary for this run: e.g. `tokens_in`, `tokens_out`, `cost`, `thread_id`) so consumers can get run-level usage without scanning `usage.event`. Canonical per-request usage remains `usage.event`; `run.completed.usage` is a convenience snapshot for dashboards and thread Usage tab. |
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
| `hitl.approval_requested`, `hitl.approved`, `hitl.rejected` | HITL at tier boundary (human-in-the-loop.md) | `run_id`, `tier`, `timestamp`; approved/rejected: `outcome` |
| `editor.file_opened`, `editor.file_closed`, `editor.tab_switched`, `editor.buffer_saved`, `editor.buffer_reverted` | Editor lifecycle (FileManager.md §2.9) | `project_id`, `path` or `path_hash`, optional tab index / session_id |
| `restore_point.created` | Auto-snapshot before turn/tool mutation (newfeatures.md §8) | `restore_point_id`, `project_id`, `turn_id` or `iteration_id`, `timestamp`, `file_snapshots` list: `{ path, content_hash, blob_ref }` (or inline marker for small blobs) |
| `restore_point.pruned` | Retention cleanup of old restore points (§8) | `restore_point_id`, `project_id`, `reason` (e.g. `age_exceeded`, `count_exceeded`) |
| `rollback.requested` | Agent or user requests rollback (§8) | `restore_point_id`, `requester` (`agent` or `user`), `scope` (`narrow` or `broad`), optional `thread_id` |
| `rollback.confirmed` | User confirms rollback (§8) | `restore_point_id`, `conflicts` (list of conflicted files, may be empty) |
| `rollback.completed` | Rollback applied successfully (§8) | `restore_point_id`, `files_restored` (list of paths written back) |
| `rollback.cancelled` | User cancelled rollback (§8) | `restore_point_id`, optional `reason` |

**Writer API:** One module (e.g. `storage::seglog::Writer`) that:

1. Opens the current segment file in append mode (or creates it).
2. Serializes the event to the envelope format.
3. Appends the line (with newline); flushes so projectors can tail.
4. Optionally updates an in-memory or redb "last seq" for durability guarantees.

**Contract:** `append(event)` returns `Result<(), SeglogError>`. On failure (e.g. disk full, I/O error), no partial record is written; caller must handle the error (e.g. surface to user, stop appending, optional retry). redb open and write operations return Result; caller must handle open failure (e.g. corrupt DB → do not open; show error or offer recover-from-backup).

**Rotation:** When the current segment reaches a size limit (e.g. 64 MB) or a new day, close it and start a new file (e.g. `events_2026-02-21.ndjson`). Projectors and analytics scans must be able to list and read segments in order (by name or by embedded timestamp). **Retention:** Policy for deleting or archiving old segments (e.g. keep 90 days) so disk is bounded; document in §6.

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
| `checkpoints` | `projector.{projector_name}` | `{ seglog_path, offset_or_seq }` | Projector resume position |
| `checkpoints` | `thread_checkpoint.{thread_id}` | Restore point (message id or seq) | Resume/rewind |
| `editor` | `tabs.{project_id}` | Ordered list of paths | FileManager.md §2.9 |
| `editor` | `active_tab.{project_id}` | Active tab index | |
| `editor` | `scroll_cursor.{project_id}.{path_hash}` | Scroll/cursor state | |
| `editor` | `max_tabs` | u32 | App-level |
| `editor` | `session.{project_id}.{session_id}` | Session-scoped view state | |
| `rollups` | `usage_5h.{platform}` | Aggregated 5h usage | Usage/dashboard |
| `rollups` | `usage_7d.{platform}` | Aggregated 7d usage | |
| `rollups` | `tool_latency.{window}` | Tool latency distribution | Analytics |
| `rollups` | `tool_usage.{window}` | Per-tool stats (count, p50/p95 ms, error_count) for Usage tool widget | Plans/Tools.md §8.4; analytics scan aggregates `tool.invoked` into this key. |
| `rollups` | `thread_usage.{thread_id}` | Optional per-thread usage rollup (context circle, thread Usage tab) | Overwritten by projector or analytics; keys for archived/deleted threads can be removed or left to retention. |
| `sessions` | `queue.{thread_id}` | Queue state (items, order) for thread | Restored on load; written when queue events applied. |
| `sessions` | `plan_todo.{thread_id}` | Plan and todo state for thread | Restored on load; written when plan_todo events applied. |
| `editor` | `file_tree_expanded.{project_id}` | Expanded paths in file tree | Optional; value: list of path_hashes or paths. |
| `editor` | `layout.{project_id}` (optional) | Split sizes, panel visibility | Optional; value: layout blob. |
| `editor` | `recent_files.{project_id}` (optional) | Recently opened file paths | Optional; value: ordered list. |
| `checkpoints` | `run.{run_id}` | Run resume position (segment + offset or seq) | Replay or resume run; cleanup when run is discarded. |
| `checkpoints` | `interview_session.{interview_id}` | Interview session state | Restore interview UI. |
| `checkpoints` | `interview_checkpoint.{interview_id}` | Interview projector/phase position | Resume interview pipeline. |
| `checkpoints` | `hitl.{run_id}` | HITL pending state (e.g. approval_requested) | Restore HITL prompt after crash; clear on approved/rejected. |
| `review_rules` | `app` or `project.{project_id}` | Review rules blob | FileManager.md §10.8 |
| `restore_points` | `point.{project_id}.{restore_point_id}` | JSON: `{ turn_id, timestamp, file_snapshots: [{ path, content_hash, blob_ref }] }` | Restore-point metadata and blob references for rollback (newfeatures.md §8). Blobs may be inline (small) or file-referenced. |
| `restore_points` | `index.{project_id}` | JSON: ordered list of `restore_point_id` | Fast listing for "History" / "Restore to…" UI. Pruned when retention exceeded. |

**Value encoding (per namespace):** Keys are UTF-8 or fixed encoding; values are namespace-specific. Use **JSON** for human-inspectable or cross-version flexibility (settings, thread metadata, checkpoints, queue, plan_todo, rollups for dashboard). Use **bincode** (or redb native types) where compact and fast read/write matter (e.g. editor scroll_cursor, large blobs). Document the choice per namespace in code.

- **settings:** JSON (app and project keys).
- **sessions:** `thread.{id}` → JSON `{ title, created_ts, project_id, archived? }`; `thread_list.{project_id}` → JSON array of thread_id; `queue.{thread_id}`, `plan_todo.{thread_id}` → JSON (structure per assistant-chat-design §11).
- **runs:** JSON `{ status, started_ts, ... }`.
- **checkpoints:** JSON `{ segment, offset }` or `{ seq }` for projectors; run/interview/hitl checkpoints as JSON with enough to resume.
- **restore_points:** JSON for metadata and index; blob references point to app-data files or inline bincode for small snapshots. Pruning deletes both redb key and referenced blob file.
- **editor:** Tabs and lists as JSON; scroll_cursor and binary blobs as bincode if desired.
- **rollups:** JSON: `usage_5h/7d` → `{ platform, tokens_in, tokens_out, ... }`; `tool_usage.{window}` → `{ tool_name, count, p50_ms, p95_ms, error_count }`; `thread_usage.{thread_id}` → same shape as usage rollup for one thread.
- **review_rules:** JSON or bincode per FileManager.md.

**Migrations:** Use redb's schema version or a custom `schema_version` key in a `meta` namespace. On open, check version; if older, run migration functions (e.g. create new namespaces, copy/transform data, bump version). Document each migration (version N → N+1) and keep migrations reversible where possible (e.g. add column, don't drop until next major).

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
- `checkpoints` → `document_pane_state.{bundle_id}` → JSON `document_pane_state.v1`
- `checkpoints` → `final_review_output.{bundle_id}` → JSON `{ artifact_set_ref, created_at, status }` (separate artifact set so Reject discards cleanly)

**Schema notes (must align with workflow contracts):**
- `document_registry.v1` fields: `{ bundle_id, docs[]: { doc_id, path, display_name, created_by, status, updated_at } }`.
- `note_record.v1` includes both selector types:
  - `anchor.text_position` `{ start, end }`
  - `anchor.text_quote` `{ exact, prefix, suffix }` with default prefix/suffix length 32 chars (clamped).
- Notes kind + lifecycle rules are enforced at write time:
  - kind inference: `question` if ends with `?` or starts with `Q:`, else `change_request`; allow user override and `both`.
  - lifecycle: `open` → `addressed` → `resolved` (user controls resolved).

**Seglog vs redb:**
- redb is the durable snapshot store for UI restoration and gating decisions.
- Optional: emit note events (create/status/addressed) into seglog for audit; projectors can deterministically rebuild redb snapshots.

### 2.4 Projector pipeline: consumption, JSONL mirror, Tantivy, checkpoints

**Consumption model:** Each projector runs in a loop (or is triggered periodically):

1. Read **checkpoint** from redb (e.g. `projector.jsonl_mirror` → last seglog path + offset).
2. **Tail** seglog from that position (open file, seek to offset, read new lines; or list segments, read from last segment).
3. For each event: (a) write to JSONL mirror (if this projector owns the mirror), (b) update Tantivy index (if event type matches), (c) update redb snapshots if needed.
4. **Commit** new checkpoint to redb (and flush Tantivy) so we don't reprocess on restart.

**JSONL mirror:** Same envelope format as seglog; one file per day under `storage/jsonl/` (e.g. `events_2026-02-21.jsonl`) or one rolling file. Human-readable; useful for debugging and for analytics scan if we prefer scanning JSONL. Writer: single projector that reads seglog and appends to the mirror.

**Tantivy indices:** Separate index per domain, e.g.:

- **chat:** Documents from `chat.message` (and maybe `chat.thread_created`); fields: `thread_id`, `content`, `role`, `ts`, `message_id`. Used for chat history search (human and agent). **thread_id** is a keyword field so the UI can filter search results by thread (e.g. "search within this thread only") and so any feature that needs "messages or usage for this thread" can correlate with per-thread usage (context circle, thread Usage tab) via the same thread_id.
- **docs:** Optional; from events that reference doc content (e.g. PRD, AGENTS.md snippets).
- **logs:** Optional; from run/usage events for log-summary search.

Schema per index: define fields (text, keyword, date) and build documents from event payloads. Index is written incrementally (add document per event) and periodically committed.

**Checkpoints:** Stored in redb under `checkpoints` namespace. Value encodes enough to resume: e.g. `{ "segment": "events_2026-02-21.ndjson", "offset": 123456 }` or `{ "seq": 99999 }`. On startup, projector reads checkpoint, opens seglog from that position, and continues.

### 2.5 Analytics scan jobs

**Trigger:** Periodic (e.g. every 5 minutes) or on-demand (e.g. when Usage view is opened). Can run in a background task or a separate thread; must not block the main UI.

**Scan range:** Last N hours (e.g. 24h for 5h/7d rollups) or since last scan checkpoint. Read from seglog (or JSONL mirror) in order; filter by event type (`usage.event`, `run.completed`, `tool.invoked`).

**Compute:** For 5h/7d: aggregate `usage.event` by platform, sum tokens (or request count) in sliding 5h and 7d windows. For tool latency: collect `tool.invoked` latencies, compute percentiles (p50, p95). For error rates: count run failures / total runs in window. For **tool usage** (Usage tool widget, Plans/Tools.md §8.4): aggregate `tool.invoked` by `tool_name` over the window -- count, p50/p95 ms, error_count (using optional `success`/`error` on payload).

**Write:** Store results in redb under `rollups` namespace (e.g. `usage_5h.{platform}`, `usage_7d.{platform}`, `tool_latency.{window}`, **`tool_usage.{window}`**). Usage view and tool usage widget read from these keys; no direct seglog read for dashboard.

**Checkpoint:** Store "last scanned up to seq X" or "last scanned timestamp" in redb so the next run doesn't rescan from the beginning. Idempotent: recomputing the same window and writing the same keys is safe.

---

