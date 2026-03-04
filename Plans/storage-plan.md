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

Chat persistence and search are implemented on top of this storage stack; the chat UX plan (assistant-chat-design.md) does not assume a specific backend, but implementation should align as follows.

| Chat requirement | Storage implementation |
|------------------|------------------------|
| **Thread list + per-thread metadata** (§11) | **redb** `sessions`: `thread.{thread_id}`, `thread_list.{project_id}`. |
| **Full thread content** (messages, thought streams, code blocks, plan/todo, queue state) (§11) | Canonical: **seglog** (`chat.message` and related events). Projectors can materialize thread state or slices into redb for fast load; full history replayable from seglog. |
| **Chat history search -- human** (§10) | **Tantivy** chat index; UI search queries Tantivy. |
| **Chat history search -- agent** (§10) | Same Tantivy index or API over it; context pipeline or MCP/tool queries the index. |
| **Resume / rewind** (§11) | **redb** `checkpoints`: `thread_checkpoint.{thread_id}`; replay or slice from seglog as needed. |
| **Virtualization / load older** (§24) | UI fetches slices; backend pages from redb projections or seglog-derived views. |
| **Context usage / rate limits** (§12) | **redb** rollups (analytics scan) for dashboard and chat header. |
| **Per-thread usage (context circle + thread Usage tab)** (§12, usage-feature.md §5) | **seglog** `usage.event` includes **`thread_id`** so per-thread usage can be aggregated (tokens, cost). Optional: projector materializes per-thread rollup into redb (e.g. `rollups.thread_usage.{thread_id}`) for fast context circle and thread Usage tab; or UI aggregates from seglog/JSONL filtered by thread_id. |

---

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

- **Compaction:** Periodically merge seglog segments into fewer, larger files (with re-read-only pass) to reduce file count; update projectors to read compacted segments. Optional for MVP.
- **Backup/restore:** Scheduled backup of redb and seglog (e.g. to `storage/backups/`); restore UI or CLI to restore from backup.
- **Export:** Export thread or run history to JSONL/JSON for user (e.g. from seglog or JSONL mirror filtered by thread_id).
- **Read replicas:** Not applicable for embedded redb; if we move to a server-backed store later, read replicas can serve dashboard/Usage reads.
- **Per-project seglog:** Option to store seglog under `.puppet-master/` per project for isolation (e.g. enterprise or multi-tenant); default remains app-global.
- **Event schema registry:** Central registry (code or config) of event types and payload schemas; generate docs or validation from it.
- **Streaming projector:** Projector pushes updates to UI (e.g. new message indexed → invalidate search cache or notify chat view) instead of only tail polling; optional for richer UX.

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
