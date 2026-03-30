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
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

- `workspace_tab_id`
- `window_id`
- `browser_tab_id`
- `preview_session_id`
- `terminal_section_id`
- `terminal_tab_id`
- `terminal_pane_id`
- `terminal_session_id`
- `dev_session_id`
- `branch_id` for branched conversation/session lineage

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

Identity rules:
- `project_id` is stable across path rebinding and restore operations; raw path is not the canonical identity
- `workspace_tab_id` is distinct from `project_id`
- `browser_tab_id` is distinct from `preview_session_id`
- `terminal_section_id` owns presentation continuity and dock or detach realization
- `terminal_tab_id` owns tab continuity, label, pin state, and order within a terminal section
- `terminal_pane_id` owns split-tree slot continuity and visible binding location
- `terminal_session_id` owns exact PTY continuity
- `dev_session_id` owns higher-level dev workflow continuity and MUST NOT replace `terminal_session_id` when exact shell reuse is required
- detached windows and ephemeral automation/auth sessions have separate persistence scope from workspace-tab shell state

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md

Additional terminal identity rule:
- command-block and transcript metadata may reference stable per-session command-block identifiers, but command-block identity is subordinate to `terminal_session_id` rather than a peer replacement for it

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md
## 2. How we're going to do it

### 2.1 File locations and directory layout

All storage lives under a single **app data root** (for example `~/.puppet-master/`, `$XDG_DATA_HOME/puppet-master/`, `%APPDATA%/puppet-master`, or `~/Library/Application Support/puppet-master`). Project-scoped runtime state still lives under `.puppet-master/` inside the workspace when the feature is inherently project-local.

| Path (relative to app data root) | Purpose |
|----------------------------------|---------|
| `storage/seglog/` | Append-only seglog segments or rolling event log files |
| `storage/redb/` | redb database files for settings, checkpoints, snapshots, and rollups |
| `storage/jsonl/` | Human-readable JSONL mirror emitted by projectors |
| `storage/tantivy/projects/{project_id}/` | Per-project Tantivy indices (`chat`, `code`, `logs`, optional `docs`) |
| `storage/blobs/` | Blob store for large secrets-scrubbed payloads referenced by `blob_ref` |
| `storage/backups/` | Optional point-in-time recovery copies |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md

#### Local project regex-index layout

| Path (relative to project root) | Purpose |
|----------------------------------|---------|
| `.puppet-master/project/state/regex_index/` | Root directory for the per-project sparse n-gram index |
| `.puppet-master/project/state/regex_index/frequency_table.bin` | Project-specific blended frequency table (256x256 `u16`) used by both build and query |
| `.puppet-master/project/state/regex_index/gen-{N}/` | Generation-numbered snapshot directory (`u64`) |
| `.puppet-master/project/state/regex_index/gen-{N}/postings.bin` | Roaring Bitmap posting lists keyed by xxh3 hash |
| `.puppet-master/project/state/regex_index/gen-{N}/lookup.bin` | Sorted mmap-friendly hash-to-offset table |
| `.puppet-master/project/state/regex_index/gen-{N}/file_map.bin` | `u32 file_id -> relative path` mapping, forward-slash normalized |
| `.puppet-master/project/state/regex_index/gen-{N}/index_meta.json` | Snapshot metadata: anchor, schema version, checksums, generation, compatibility flags |

ContractRef: ContractName:Plans/Tools.md, Invariant:INV-002, ContractName:Plans/Architecture_Invariants.md

#### Remote Git project regex-index cache layout

| Path (relative to app data root) | Purpose |
|----------------------------------|---------|
| `.puppet-master/cache/r/{hash8}/` | Remote project cache root (`hash8` = first 8 chars of xxh3(project_id)) |
| `.puppet-master/cache/r/{hash8}/git/` | Bare Git clone for the primary repository |
| `.puppet-master/cache/r/{hash8}/git/m/{sub_hash8}/` | Bare Git clones for submodules (recursive, max depth 5) |
| `.puppet-master/cache/r/{hash8}/dirty/` | Local staging area for remote dirty-file content used by verification and re-anchor merge |
| `.puppet-master/cache/r/{hash8}/regex_index/` | Same snapshot layout as local projects (`frequency_table.bin` + `gen-{N}/...`) |
| `.puppet-master/cache/r/{hash8}/manifest.json` | `hash8 -> project_id/submodule_path` mapping for recovery, MAX_PATH mitigation, and cleanup |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/BinaryLocator_Spec.md

#### Remote non-Git project regex-index cache layout

| Path (relative to app data root) | Purpose |
|----------------------------------|---------|
| `.puppet-master/cache/r/{hash8}/` | Remote project cache root |
| `.puppet-master/cache/r/{hash8}/regex_index/` | Transferred sparse n-gram snapshot built on the remote host |
| `.puppet-master/cache/r/{hash8}/regex_index/frequency_table.bin` | Remotely computed blended frequency table copied to local cache |
| `.puppet-master/cache/r/{hash8}/regex_index/gen-{N}/postings.bin` | Transferred postings snapshot |
| `.puppet-master/cache/r/{hash8}/regex_index/gen-{N}/lookup.bin` | Transferred lookup snapshot |
| `.puppet-master/cache/r/{hash8}/regex_index/gen-{N}/file_map.bin` | Transferred file map snapshot |
| `.puppet-master/cache/r/{hash8}/regex_index/gen-{N}/index_meta.json` | Transferred metadata snapshot |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/Tools.md

Total local footprint for a remote project: Git cache (varies by clone depth and history size) + sparse n-gram index (~1-10% of source size). Shallow and partial clone settings reduce the Git cache portion; index size scales with current source tree size, not repository history depth.

#### Binary file contracts

All binary index files use **little-endian** byte order with no inter-field padding.

- **`file_map.bin`:** header `PMFM` + `schema_version:u32` + `entry_count:u32`. Entries are `path_byte_length:u32` + UTF-8 path bytes. File IDs are generation-local only and MUST NOT be treated as stable across builds or across snapshot generations.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md

- **`lookup.bin`:** header `PMLK` + `schema_version:u32` + `entry_count:u32`. Entries are sorted `(xxh3_hash:u64, postings_offset:u64)` pairs. `lookup.bin` remains a separate mmap file from offset 0; if a future packed format combines files, the lookup region MUST begin at a 64 KB-aligned offset for Windows `MapViewOfFile` compatibility. Startup validation checks both `12 + entry_count * 16` sizing and every referenced postings offset before mmap. When two distinct n-grams produce the same xxh3 64-bit hash, their posting lists are merged at index time (Roaring union); the lookup table has exactly one entry per unique hash. Collisions broaden candidates but never affect correctness.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Architecture_Invariants.md

- **`postings.bin`:** header `PMPL` + `schema_version:u32`. Entries are `bitmap_byte_length:u32` + portable-format Roaring Bitmap bytes. Postings store `u32` file IDs only; line-level precision always comes from ripgrep verification on candidate files.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md

- **`index_meta.json`:** metadata object with these required fields: `anchor_sha: string | null`, `build_timestamp_utc: string`, `schema_version: u32`, `file_count: u32`, `generation: u64`, `checksums: { file_map, lookup, postings }`, `case_sensitive_fs: bool`, and `roaring_format: "portable"`. Dirty-layer state is NOT persisted in `index_meta.json`; it is reconstructed as needed because the index is a cache.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md, Invariant:INV-002

#### Frequency table, path compatibility, and validation rules

- **Base table source:** `frequency_table.bin` is derived from a shipped 256x256 `u16` base matrix built from The Stack Smol, counted on CRLF-stripped ASCII-lowercased bytes. The base table is compiled into the PM binary as a `static` constant (`[u16; 65536]`, ~128 KB); it is not shipped as a separate file.
- **Blend rule:** Local and remote full builds compute per-project counts on the same normalized byte stream and blend them with the base table using `effective[a][b] = 0.5 * base[a][b] + 0.5 * project[a][b]`.
- **Stability rule:** `frequency_table.bin` is shared by both build and query logic and is recomputed only on full rebuilds. Incremental rebuilds reuse the current stored table.
- **Boundary-failure fallback:** When weighting cannot place sparse boundaries for a segment of length >= 3, the builder and query path fall back to fixed-width 3-gram extraction for that segment.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md

- **Path normalization:** `file_map.bin` stores forward-slash relative paths on every platform. Conversion to native separators happens only at I/O time.
- **Filesystem compatibility:** `case_sensitive_fs` records whether the snapshot was built on a case-sensitive filesystem. On case-insensitive filesystems, bare-clone path enumeration deduplicates by lowercase path and logs collisions.
- **Startup validation:** snapshot load validates the per-file xxh3 checksums, the lookup-table size and offsets, and (for Git snapshots) whether `anchor_sha` is still reachable. Unreachable anchors or invalid metadata invalidate the generation and force rebuild.
- **Windows MAX_PATH mitigation:** In addition to the `hash8` short-path scheme for cache directories, the PM Windows app manifest declares `<longPathAware>true</longPathAware>` as defense-in-depth against MAX_PATH limits.
- **OS indexer exclusion:** regex-index directories use OS-specific indexer exclusions (`FILE_ATTRIBUTE_NOT_CONTENT_INDEXED` on Windows, `.metadata_never_index` on macOS; none required on Linux) to reduce contention.
ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Tools.md

#### Index sizing guidance

Sparse n-gram index is typically 1-10% of source code size: 50 MB source produces ~0.5-5 MB index, 500 MB → ~5-50 MB, 1 GB → ~50-100 MB, 50 GB → ~2-5 GB. Only the hash lookup table is mmap'd in process memory; the OS pages in what is needed per query. Peak RSS contribution is typically <500 MB even for large repositories.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md

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
  **Producer:** A file-watcher + indexer (can be implemented as a "projector" even though the source is filesystem change events rather than seglog). The indexer must respect `.gitignore` by default and apply FileSafe-style sensitive-path exclusions (see below).
  **Chunking:** Index large files as chunks so results return tight snippets (e.g. 4–16 KiB chunks with `chunk_id` and byte/line range metadata).
  **Fields (minimum):** `project_id`, `path`, `chunk_id`, `content`, `language?`, `mtime` (or `content_hash`).
  **Use:** `codesearch` tool and auto-retrieval for code grounding. LSP symbol search remains complementary (symbol-aware), not a replacement.

- **logs (required, MVP):** A project-scoped logs/search index based on **log summaries** with pointers to full payload.
  **Producers:** seglog projectors that consume `tool.invoked`, `tool.denied`, `run.*`, `bash.*`, and error events and emit index documents.
  **Index the summary, not the blob:** Store only compact summaries/snippets in Tantivy; store full (secrets-scrubbed) payload as a blob/file under `storage/blobs/…` referenced by `blob_ref` (or event id) so log search stays fast and storage remains bounded.
  **Fields (minimum):** `project_id`, `ts`, `thread_id?`, `run_id?`, `tool_name?`, `level?`, `summary`, `blob_ref` (or `event_id`).
  **Use:** `logsearch` tool, auto-retrieval for "why did this fail," and UI debugging surfaces.

- **docs (optional):** Index selected long-form docs or generated artifacts if needed for retrieval ("teach" mode, doc lookup). Prefer indexing doc summaries/pointers rather than full bodies when possible.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md

**File watcher: dual-consumer model (Tantivy + sparse n-gram index):**

The project file watcher is a shared event source with two independent consumers:
1. **Tantivy code indexer** — receives file-change events, re-indexes affected chunks in the per-project Tantivy code index.
2. **Sparse n-gram indexer** — receives the same file-change events, adds changed paths to the dirty layer (HashMap with generation stamps). PM-mediated writes (agent/tool writes) update the dirty layer synchronously (before returning to caller) and do NOT rely on the file watcher for freshness. The file watcher serves as backup/dedup for PM-mediated writes and as the primary notification path for external changes (user edits in other tools, git operations).

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md

File watcher overflow handling (applies to both consumers): When the OS emits an overflow/rescan event (inotify `IN_Q_OVERFLOW`, FSEvents "must scan", Windows RDCW buffer overflow): Tantivy triggers a full re-index of the code domain. Sparse n-gram indexer marks ALL indexed files as dirty (invalidating the dirty layer), which triggers the >1000-file re-anchor threshold immediately. Windows: use a generous watcher buffer size (64 KB) to reduce overflow frequency.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md

**Sensitive indexing + persistence guards (chat + code + logs + regex n-grams):**
- **PolicyRule:no_secrets_in_storage / INV-002 (mandatory):** Any text persisted to seglog/redb/Tantivy/blob files/sparse n-gram index MUST be passed through a strict secrets scrubber that removes tokens/credentials/private keys. This mandatory scrub is always-on and not user-configurable. For the sparse n-gram index, scrubbing occurs before n-gram extraction — n-grams are extracted from scrubbed content.
- **Path-based exclusions (mandatory):** Default deny indexing of `.env` and `.env.*` while allowing `.env.example` (align with Permissions_System default `.env` deny semantics). Exclude common key/cert paths (e.g. `*.pem`, `*.key`, `id_rsa*`) from indexing and from log/blob persistence when detected.
- **Additional heuristic redaction (optional; default OFF):** `retrieval.redaction.secretish_enabled` MAY apply an additional aggressive heuristic redaction pass (on top of the mandatory scrub) to log-summary indexing, snippet display, and retrieved-context injection.

ContractRef: Invariant:INV-002, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Permissions_System.md

**Byte-level operation constraint:**

N-gram extraction and frequency-table counting operate on raw bytes (`u8`). Implementers MUST NOT decode content to Unicode at any point in the indexing or query pipeline. The only byte transformation is ASCII-only lowercasing (`u8::to_ascii_lowercase`: bytes 0x41-0x5A map to 0x61-0x7A; all other bytes pass through unchanged) applied after CRLF stripping.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Architecture_Invariants.md

**Blob refs (logs):**
- Store log payload blobs under `storage/blobs/projects/{project_id}/logs/` with a deterministic filename (e.g. `{event_id}.json` or `{content_hash}.json`).
- `blob_ref` is a stable identifier that resolves to this blob path; `logread` reads the blob and returns the secrets-scrubbed content (bounded by size caps).

**Schema per index:** Define fields (text, keyword, date) and build documents from event payloads / filesystem scanner output. Index is written incrementally (add/update documents) and periodically committed.

**Checkpoints:** Stored in redb under `checkpoints` namespace. Value encodes enough to resume: e.g. `{ "segment": "events_2026-02-21.ndjson", "offset": 123456 }` or `{ "seq": 99999 }`. On startup, projector reads checkpoint, opens seglog from that position, and continues. Code indexer maintains its own checkpoint (e.g. last scan watermark / file mtime map) and supports a full rebuild when schema changes. Sparse n-gram indexer maintains its own checkpoint via `index_meta.json` (anchor SHA, generation number) — rebuilt automatically on schema version mismatch.

**Regex index build lifecycle and publication:**

Per-project lifecycle states are `no_index`, `building_full`, `ready`, `rebuilding_incremental`, `error`, and `cancelling`.
- Build queue rule: one active build slot per project. New triggers during a build supersede the in-flight build; the current build observes cancellation between file iterations, cleans partial `gen-{N}` output, and then the newest queued build starts.
- Build thread resource management: projects share a common build thread pool. When the pool is saturated, pending builds queue FIFO. Build threads use `thread-priority` crate (`ThreadPriority::Min` on all platforms; additionally `QOS_CLASS_UTILITY` on macOS Apple Silicon via `pthread_set_qos_class_self_np`) to prevent editor starvation.
- Project-ready gate: the first build waits for project-ready (file watcher established; project context resolved; other per-project services initialized) so changes are not missed during initial indexing.
ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Tools.md

Build triggers:
- project open -> validate or full build
- schema/version mismatch -> full rebuild
- explicit rebuild command or settings action -> full rebuild
- remote fetch or local HEAD advance -> dirty-mark + incremental rebuild
- dirty-layer threshold >1000 files -> re-anchor / incremental rebuild
- remote non-Git degraded watcher -> periodic 30-minute rebuild while the project remains open
ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md

Build and publish path:
1. Resolve the new anchor (`HEAD` for Git, current remote/local snapshot boundary for non-Git).
2. Reuse the stored `frequency_table.bin` unless a full rebuild is required.
3. Read changed files from filesystem, bare-clone objects, or the remote indexer feed; scrub and normalize before extraction.
4. Extract sparse n-grams and build postings in memory or on streaming buffers.
5. Serialize a full new snapshot into `gen-{N+1}/` (`postings.bin`, `lookup.bin`, `file_map.bin`, `index_meta.json`).
6. `sync_all()` every file before publication.
7. Publish the new `IndexSnapshot` via `ArcSwap<Arc<IndexSnapshot>>`.
8. Retain old generations until no in-flight reader still holds them.
- Platform-specific mmap safety: on Windows, `memmap2` file handles are opened with `share_mode(0x7)` (`FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE`) as defense-in-depth for concurrent generation access. On Linux and macOS, mmap'd file deletion is safe via inode-by-fd semantics; generation directories eliminate the need for rename-while-mapped.
9. On disk full, checksum failure, or cancellation: delete the partial generation and keep serving the last valid snapshot (or raw ripgrep if none exists).
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Architecture_Invariants.md

**Dirty-layer concurrency and freshness contract:**

- DirtyLayer is a generation-aware map keyed by path with deleted-state tracking. Remote staged file content is an adjunct verification cache, not the canonical dirty-layer model.
- PM-mediated writes insert the dirty record synchronously before returning success; file-watcher notifications are the backup and dedup path for PM writes and the primary path for external changes.
- Every dirty path is added to query candidate verification, and every deleted dirty path suppresses stale base-index hits.
- Re-anchor records `build_generation` and clears only dirty entries with `generation <= build_generation` so changes made during a long-running build survive into the next cycle.
- Dirty-layer state is in-memory only; crash recovery may lose it because the index is a cache rather than the source of truth.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md

**Incremental rebuild and degradation rules:**

- Incremental rebuild means incremental extraction of changed files, not patch-in-place posting mutation. Snapshot serialization is always a full rewrite of `postings.bin`, `lookup.bin`, and `file_map.bin`.
- `frequency_table.bin` is never recomputed during incremental updates because that would invalidate existing n-gram hashes.
- A stale but valid snapshot remains queryable while background refresh runs. There is no stale-threshold rule that disables the index once it exists.
- The file-watcher overflow path described above is the all-dirty / immediate re-anchor path for the regex index; Windows uses a 64 KB watcher buffer to reduce overflow frequency.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md

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
- [ ] **Emit usage.event with thread_id:** When recording usage for Assistant or Interview runs, include **thread_id** in the event payload so per-thread usage (context circle, thread-scoped Context Detail Pane) can be aggregated from seglog or usage.jsonl (usage-feature.md §5, assistant-chat-design §12).
- [ ] **Emit run.completed with optional usage snapshot:** When a run finishes, include optional **usage** in the `run.completed` payload (tokens_in, tokens_out, cost, thread_id) so dashboards and the thread-scoped Context Detail Pane can use run-level usage without scanning usage.event. Canonical per-request data remains usage.event.

---

## 4. Impact on chat (Assistant / Interview)

Assistant and Interview surfaces persist thread-local state, activity traces, and reviewable history, but they do not become the canonical owner of runtime identity.

### 4.1 Shared runtime identity consumption
Chat, activity, question, todo, and thread-context-detail projections may display runtime identity, but the canonical requested/effective snapshot comes from the owner docs.

Rules:
- thread and activity projections consume frozen requested/effective runtime snapshots captured for the execution
- the shared snapshot now includes workflow-overlay and runtime-posture fields rather than forcing chat to reconstruct planning identity from local heuristics
- chat and thread-context-detail projections must not recompute historical runtime state from current settings
- assistant/chat-local state may reference runtime snapshots, but it must not rename or re-own the shared schema
- earlier references in this document to a `thread Usage tab` or equivalent per-thread usage tab now refer to the thread-scoped Context Detail Pane/editor-tab surface

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md

Thread Context Detail Pane projections consume at minimum:
- `chat.message` records and any stored message usage snapshots
- `usage.event` records with `thread_id`
- `run.completed.usage` snapshots when present
- persisted tool or activity payloads needed for per-message inspection and raw views

Rules:
- compact chat surfaces may derive display labels such as `Ask`, `Agent`, `Plan`, and `Deep Plan`, but only from frozen shared fields
- thread-scoped cost remains an estimated or provider-authoritative value according to the canonical usage pipeline; the detail pane does not invent a second cost model
- raw per-message views may expose provider/runtime metadata needed for audit and debugging without reclassifying those fields as chat-facing compact copy

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md
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

Activity transparency payloads must support the parent thread child-card UX and crew inspection surfaces.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Required activity projections:
- child started
- child progress / work / thought deltas
- child blocked / awaiting-parent / failed / cancelled
- child completed
- batch rollups and subgroup rollups
- crew-board message summaries when crew mode is active
- context-shrunk / context-rehydrated disclosures when relevant to the child

Expanded child-panel payload minimums:
- status
- work stream
- thought stream
- current state reason when non-happy-path
- result summary when finished
- provider/model/effort metadata for hover or details surfaces

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md
## 5. Gaps and how we address them

The remaining persistence gaps for the rewrite shell are addressed by explicit owner-aligned state instead of feature-local ad hoc blobs.

### 5.1 Unsaved editor recovery is required, not optional
Rules:
- recover-unsaved is required MVP behavior for local and remote-backed buffers
- recovery snapshots store local buffer state, capture metadata, host/path identity, and write availability at capture time
- remote-backed recovery banners must say `Recovered local edits — remote destination not yet synchronized`
- save success is only claimed after the effective destination confirms the write

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md

### 5.2 Requested vs effective runtime state must remain visible
The persistence model stores enough context to reconstruct effective behavior honestly after restart.

Required stored distinctions:
- requested vs effective browser runtime/capabilities
- requested vs effective LSP enablement and attached-server set
- freshness vs health vs write availability for remote-backed projections
- restore outcome for historical Search, LSP, browser, and editor recovery surfaces

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md

### 5.3 Search and Source Control keep separate projection state
Rules:
- Search state stores text query intent and query snapshots
- Source Control state stores repo projections, compare origins, and review context
- diff-local search does not get persisted as project Search state
- editor markers consume Source Control/LSP projections but do not become a substitute owner

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md

### 5.4 Host-aware LSP persistence and restart behavior
Rules:
- LSP lifecycle and restart budgets are persisted by host-aware session key
- restart/reconnect preserves enough state to disclose whether a projection is current, refreshing, stale, degraded, or unavailable
- remote-mode projects never restore into a silent local fallback path

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md

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

**Startup order:** (1) Resolve app data root (env override optional). (2) Create `storage/seglog`, `storage/redb`, `storage/jsonl`, `storage/tantivy` if missing. (3) Open redb and run migrations. (4) Open the seglog writer. (5) Start projectors that tail seglog and write JSONL/Tantivy/checkpoints. (6) Start optional analytics schedulers and per-project index services.

**Regex-index startup recovery:** After a project context is known and before the first indexed `grep` or Search-panel regex query for that project:
1. Scan the relevant `regex_index/` directory.
2. Pick the highest valid `gen-{N}/` candidate.
3. Validate `index_meta.json`, per-file xxh3 checksums, and `lookup.bin` sizing / offsets before mmap.
4. For Git-backed caches, verify `anchor_sha` is still reachable (`git cat-file -t {anchor_sha}`). Unreachable anchors invalidate the snapshot and trigger rebuild from current HEAD.
5. If a valid snapshot exists, create `IndexSnapshot`, mmap `lookup.bin`, and mark the project `ready`.
6. If no valid snapshot exists, mark the project `no_index` and transparently serve raw ripgrep until the background full build completes.
7. Delete orphaned or partial generations opportunistically during this recovery path.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Architecture_Invariants.md

**Shutdown:** (1) Signal projectors to stop and flush outputs. (2) Cancel in-flight regex builds and wait briefly for partial-generation cleanup. (3) Flush and close the seglog writer. (4) Close redb. (5) Leave the last valid regex snapshot and any reusable remote cache state in place; ordinary shutdown does not evict caches.
ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

**Concurrency and single-writer rules:** Seglog remains a single-writer stream. Regex-index publication is likewise single-writer per project: one build path publishes snapshots, while readers use lock-free `ArcSwap` snapshots and never observe partially-written generations.
ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

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

### Projection rules (reconciled)
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
- `workspace_preview` restores by project and workspace tab
- `detached_preview` restores with its originating normal browsing session when supported
- `automation_session` and `auth_session` do not silently resume active live work after restart
- terminal sessions and dev sessions restore as records of prior state; a live process is not presumed healthy after restart without verification

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md

Terminal restore guarantees:
- section, tab, pane, label, pin state, selected focus, and linked dev-session refs are `guaranteed_durable`
- bounded transcript snapshots, command-block metadata, cwd snapshots, shell-integration hints, and derived output or ports linkage are `best_effort_durable`
- live PTY continuity, unlimited scrollback, active alternate-screen TUI content, and in-flight selection or search highlights are `transient_only`

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Glossary.md, ContractName:Plans/FinalGUISpec.md

Canonical restore outcomes are:
- `restored_live`
- `restored_exited`
- `restored_disconnected`
- `restored_without_history`

ContractRef: ContractName:Plans/Glossary.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md

Browser recovery rules:
- browser crash or runtime loss preserves recoverable metadata and any completed evidence artifacts when possible
- reopened automation/auth sessions return as stopped or attention-required rather than as silently running live sessions
- `Reopen`, `Retry`, and `Keep Closed` are the canonical recovery actions for failed browser sessions
- promotion from paused automation into normal browsing copies/promotes eligible state into a normal browser profile and changes future restore behavior accordingly

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Wiring_Matrix.md

Project-switch rule:
- switching projects recalculates effective tool, MCP, Persona, browser capability, and terminal capability state for the new project context
- background activity from the previous project remains queryable and visible through its own project and workspace identities rather than being collapsed into the new active project
- browser and terminal requested/effective state snapshots remain frozen per runtime record and MUST NOT be recomputed from current settings

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/usage-feature.md
### Canonical keys
- `scheduler_pass_record`: key = `run_id`, `scheduler_pass_id`
- `blocked_projection`: key = `run_id`, `node_id`, `blocked_sequence`
- `attempt_record`: key = `run_id`, `node_id`, `attempt_id`
- `usage_record`: key = `run_id`, `attempt_id?`, `usage_sequence`
- `evidence_record`: key = `run_id`, `node_id?`, `evidence_id`
- `wizard_runtime_state`: key = `wizard_id`
- `safe_point_restore_record`: key = `safe_point_id`, `restore_sequence`
- `thread_blocked_notice`: key = `thread_id`, `blocked_sequence`
- `terminal_workspace_state`: key = `project_id`, `workspace_tab_id`
- `terminal_section_record`: key = `project_id`, `terminal_section_id`
- `terminal_tab_record`: key = `project_id`, `terminal_tab_id`
- `terminal_pane_record`: key = `project_id`, `terminal_pane_id`
- `terminal_session_record`: key = `project_id`, `terminal_session_id`
- `terminal_command_block`: key = `project_id`, `terminal_session_id`, `command_block_id`
- `dev_session_record`: key = `project_id`, `dev_session_id`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md

`attempt_id?` and `thread_id?` remain fields on `blocked_projection` and are not primary-key components.

Rules:
- terminal workspace containers use stable terminal section, tab, and pane keys even when their bound sessions are replaced
- command-block identity is subordinate to the owning `terminal_session_id`
- `dev_session_record` is workflow-scoped and may link multiple terminal sessions without collapsing them into one key family

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md
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

Canonical records for this feature set must support rebuild, resume, auditability, and UI reconstruction without hidden side stores.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/orchestrator-subagent-integration.md

Required canonical records:
- child runs and attempts
- child batch and subgroup structure
- crew and crew-board state
- planning-output projections derived from plan-mode children
- context-shaping state tied to stable block refs
- requested/effective runtime snapshots for child launches
- blocked-episode and awaiting-parent correlation metadata

Canonical truth exclusions:
- `.puppet-master/memory/*` is not canonical child or crew continuity storage.
- `active-agents.json` and `active-subagents.json` are not canonical live-state stores.
- provider-native session trees are correlation data, not PM identity.

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/WorktreeGitImprovement.md
### Counter rule
- `attempt_count` is the total started attempts for the node in the run
- `automatic_retry_count`, `prerequisite_resume_count`, `manual_resume_count`, and `remediation_retry_count` remain independent stored counters
- `retry_count` is derived display data only and MUST NOT drive policy

### Restart and stale history
Attempts from older generations, or in-flight attempts that cannot resume after restart, transition to `stale_historical`. They remain queryable but are never resumable.

### Identity and field-name rules
Canonical naming and identity rules:
- persisted requested/effective runtime base fields keep the names defined in `Plans/Contracts_V0.md`
- additive runtime disclosure fields MAY extend those snapshots but MUST NOT rename or shadow them
- canonical persisted references use stable `*_id` or `*_ref` fields; user-facing labels remain additive disclosure fields only
- `account_id` identifies account-backed runtime subjects
- `connection_profile_id` identifies server-profile-backed runtime subjects
- `terminal_session_id` remains PTY continuity identity
- `terminal_workgroup_id`, `terminal_leaf_pane_id`, and `editor_terminal_panel_id` identify the terminal layout objects introduced by the updated bottom-terminal/editor model

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md

Additional runtime-field rules:
- `requested_platform` and `effective_platform` identify the concrete provider entry/runtime surface used for execution.
- `provider_family_id` is additive and groups pooled or related runtime surfaces without replacing the concrete provider entry fields.
- `requested_runtime_platform_id`, `effective_runtime_platform_id`, `requested_model_provider_id`, `effective_model_provider_id`, and billing/entity fields are additive disclosure fields only.
- `selectable_unit_id` remains diagnostic/scheduler data and MUST NOT become a canonical persisted runtime identity field.
- terminal historical records MUST preserve the effective restore outcome and capability degradation state captured for that record; the UI MUST NOT infer those values later from current local capabilities.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md
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

## Assistant Worktree Binding Storage Addendum

This addendum defines storage additions for the assistant thread-to-worktree binding feature.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/WorktreeGitImprovement.md

### New redb key families

**Thread worktree binding:**
- Key pattern: `thread_state:{thread_id}:worktree_binding`
- Value: JSON `{ "worktree_id", "branch_name", "worktree_path", "bound_at_utc", "binding_origin" ("manual"|"auto_create"), "temp_branch_name" }`
- Projection source: seglog events `chat.thread_worktree_bound` / `chat.thread_worktree_unbound`
- Rebuild: replay bound/unbound events in sequence order; last event per thread_id determines current state

**Reverse lookup (1:1 enforcement):**
- Key pattern: `worktree_binding_reverse:{worktree_id}`
- Value: `thread_id`
- Projection source: same seglog events
- Purpose: fast check whether a worktree is already bound to another thread

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/DRY_Rules.md

**Worktree record extension:**
- Existing key: `worktree_record.v1:{project_id}:{worktree_id}`
- New optional field: `owner_thread_id?` alongside existing `owner_run_id?` and `owner_tier_id?`
- Owner semantics: exactly one of `owner_thread_id`, `owner_run_id/owner_tier_id`, or neither (manual) is set

### New seglog event types (11 total)

| Event type | Fields | Description |
|------------|--------|-------------|
| `chat.thread_worktree_bound` | `thread_id`, `worktree_id`, `branch_name`, `worktree_path`, `binding_origin` | Thread bound to worktree |
| `chat.thread_worktree_unbound` | `thread_id`, `worktree_id`, `reason` (`user_unbind`\|`user_remove`\|`thread_delete`\|`path_missing`) | Thread unbound |
| `chat.thread_worktree_renamed` | `thread_id`, `worktree_id`, `old_branch_name`, `new_branch_name` | Branch renamed after title gen |
| `chat.thread_worktree_create_failed` | `thread_id`, `error`, `binding_origin` | Creation failed |
| `chat.thread_worktree_merged` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `strategy`, `result_commit_sha` | Merge completed |
| `chat.thread_worktree_merge_failed` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `strategy`, `error`, `has_conflicts` | Merge failed |
| `chat.thread_worktree_pr_created` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `pr_url`, `pr_number` | PR created |
| `chat.thread_worktree_pr_failed` | `thread_id`, `worktree_id`, `branch_name`, `error`, `phase` (`push`\|`api`) | PR failed |
| `chat.thread_worktree_pre_merge_test_started` | `thread_id`, `worktree_id`, `command`, `test_target`, `strategy` | Test started |
| `chat.thread_worktree_pre_merge_test_passed` | `thread_id`, `worktree_id`, `command`, `duration_ms`, `strategy` | Tests passed |
| `chat.thread_worktree_pre_merge_test_failed` | `thread_id`, `worktree_id`, `command`, `exit_code`, `duration_ms`, `strategy`, `user_override` | Tests failed |

Naming convention: underscore-separated `chat.thread_worktree_*` matching existing `chat.thread_created` convention.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Wiring_Matrix.md

### New settings keys (10 total)

| Key pattern | Type | Default |
|-------------|------|---------|
| `config:project:{pid}:branching.assistant_auto_worktree` | bool | `false` |
| `config:project:{pid}:branching.assistant_worktree_cleanup_default` | enum | `ask` |
| `config:project:{pid}:branching.assistant_worktree_base_ref` | string | `""` |
| `config:project:{pid}:file_manager.worktree_follow_thread` | bool | `true` |
| `config:project:{pid}:branching.worktree_warning_threshold` | int | `10` |
| `config:project:{pid}:branching.worktree_create_timeout_s` | int | `30` |
| `config:project:{pid}:branching.assistant_worktree_pre_merge_test` | bool | `true` |
| `config:project:{pid}:branching.assistant_worktree_pre_merge_cmd` | string | `""` |
| `config:project:{pid}:branching.worktree_pre_merge_test_timeout_s` | int | `300` |
| `config:project:{pid}:branching.assistant_worktree_pre_merge_test_target` | enum | `merged_result` |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md

### Accordion and filter persistence keys

| Key pattern | Type | Default |
|-------------|------|---------|
| `config:project:{pid}:source_control.accordion_state` | JSON object | `{"Changes":true,"Worktrees":false,"Branches/Stash":false,"History":false,"Graph":false}` |
| `config:project:{pid}:source_control.worktree_filter` | string enum | `All` |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md
