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

Seglog is the canonical event source for child runs, crews, and context-shaping transitions.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md

Required event families for this feature set:
- child lifecycle events
- crew lifecycle and crew-board message events
- context-shrunk and context-rehydrated events
- requested/effective runtime selection events when surfaced as runtime changes
- blocked and awaiting-parent state transitions for child runs

Side files such as `active-agents.json` and `active-subagents.json` are not canonical event sources.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/usage-feature.md

Rotation and rebuild rules:
- seglog must contain enough lineage data to reconstruct child batches, subgroups, and crew membership.
- group/subgroup UI expansion state is not canonical.
- launch order, batch membership, subgroup membership, and parent-child lineage are canonical.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md
### 2.3 redb: schema, migrations, key patterns

redb projections must be strong enough to rebuild child-run, crew, and context-shaping state after restart without relying on ad hoc JSON side files.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/orchestrator-subagent-integration.md

Minimum canonical record families:
- `child_run`
- `child_attempt`
- `child_batch`
- `child_subgroup`
- `crew`
- `crew_member`
- `crew_message`
- `child_context_state`
- `planning_child_output_projection`

Minimum `child_run` fields:
- `child_run_id`, `parent_run_id`, `thread_id`
- `batch_id?`, `subgroup_id?`, launch order
- requested/effective Persona and runtime surface fields
- requested/effective effort fields
- required/optional dependency classification
- status, terminal reason, blocked reason, awaiting-parent reason
- provider correlation fields as additive metadata only

Minimum `child_attempt` fields:
- `attempt_id`
- retry count
- reroute history
- resumable handle when present
- requested/effective surface for that attempt

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md

Minimum context-state fields:
- stable block refs
- shrink generation
- current working-set refs
- Context Lens overlay refs
- rehydration-capable source refs
- compacted/rotated lineage markers where applicable

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/assistant-memory-subsystem.md
### Scope split

| Scope | Store | What belongs here |
|---|---|---|
| Secret | OS credential store only | GitHub API tokens, Docker PATs, browser-login derived credentials, registry/helper secrets |
| Global app state | redb | shared Source Control defaults, Actions defaults, Docker Manager defaults, hidden-subview policy |
| Project state | redb | selected repo/worktree, panel subviews, pinned workflows, selected runtime/context, requested auth mode, template repo state |
| Event ledger | seglog | auth validation, blocked/recovery outcomes, workflow actions, publish results, runtime receipts, cross-surface linkage |

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/newtools.md, PolicyRule:no_secrets_in_storage

### Required redb keys
The promoted provider/runtime rewrite and the updated terminal/editor model require durable record and projection families that preserve concrete runtime surfaces, account/profile identity, entitlement attribution, and terminal layout continuity.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md

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
- `provider_account_record.v1:{provider_id}:{account_id}`
- `provider_entitlement_context_record.v1:{provider_id}:{account_id}:{billing_entity_id}`
- `server_profile_record.v1:{provider_id}:{connection_profile_id}`
- `account_pressure_episode.v1:{provider_id}:{account_id}:{episode_id}`
- `account_switch_event.v1:{provider_id}:{event_id}`
- `terminal_workspace_state.v1:{project_id}:{workspace_tab_id}`
- `terminal_section_record.v1:{project_id}:{terminal_section_id}`
- `terminal_tab_record.v1:{project_id}:{terminal_tab_id}`
- `terminal_pane_record.v1:{project_id}:{terminal_pane_id}`
- `terminal_leaf_pane_record.v1:{project_id}:{terminal_leaf_pane_id}`
- `terminal_workgroup_record.v1:{project_id}:{terminal_workgroup_id}`
- `editor_terminal_panel_state.v1:{project_id}:{workspace_tab_id}:{editor_terminal_panel_id}`
- `terminal_session_record.v1:{project_id}:{terminal_session_id}`
- `terminal_command_block.v1:{project_id}:{terminal_session_id}:{command_block_id}`
- `dev_session_record.v1:{project_id}:{dev_session_id}`
- `mcp_server_record.v1:{mcp_server_id}`
- `mcp_runtime_availability.v1:{mcp_server_id}:{provider_id}:{runtime_subject_id}`
- `mcp_tool_record.v1:{mcp_server_id}:{tool_id}`
- `skill_record.v1:{skill_id}`
- `skill_runtime_readiness.v1:{skill_id}:{provider_id}:{runtime_subject_id}`

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/Skills_System.md

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
- `requested_platform?`
- `effective_platform?`
- `provider_family_id?`
- `requested_runtime_platform_id?`
- `effective_runtime_platform_id?`
- `requested_model?`
- `effective_model?`
- `requested_auth_mode?`
- `effective_auth_mode?`
- `requested_account_policy?`
- `requested_account_id?`
- `requested_billing_entity_id?`
- `effective_account_id?`
- `effective_billing_entity_id?`
- `effective_billing_entity_label?`
- `effective_entitlement_class?`
- `connection_profile_id?`
- `account_switch_reason?`
- `provider_attempt_ref?`
- `usage_event_ref?`
- `workspace_tab_id?`
- `terminal_section_id?`
- `terminal_tab_id?`
- `terminal_pane_id?`
- `terminal_leaf_pane_id?`
- `terminal_workgroup_id?`
- `editor_terminal_panel_id?`
- `terminal_session_id?`
- `dev_session_id?`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-chat-design.md

Projection-state families must expose both freshness and health:
- `projection_freshness`: `current | refreshing | stale`
- `projection_health`: `healthy | degraded | unavailable`

Rules:
- stale and degraded are different states and must not collapse into one generic trust field.
- account-backed runtime records and server-profile-backed runtime records remain distinct durable shapes even though the GUI presents them in one runtime ontology.
- usage attribution records store effective billing/entity context when it explains the active quota bucket, but they do not persist scheduler-only debug internals.
- GUI projection key `terminal_state:v1` may remain a GUI-facing projection name, but canonical ownership stays with terminal workspace, section, workgroup, tab, leaf-pane, panel, session, and command-block records.
- route restoration resolves through canonical record identity, not through feature-local ad hoc payloads.
- PM-generated CLI adapter config and projection files are derived artifacts and MUST NOT become the canonical ownership store for accounts, MCP state, instruction state, or skills.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/storage-plan.md
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

