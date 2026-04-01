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

#### 2.2.1 Mandatory CRC32 per record

Every seglog record MUST include a CRC32 checksum computed over the record payload. This is a mandatory correctness requirement, not an optional enhancement.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md

On read, CRC32 MUST be validated before the record is processed. If validation fails:
- the corrupt record is skipped
- PM emits a recovery/integrity event including record offset and expected vs observed CRC
- projectors resume from the last known-good checkpoint rather than replaying the corrupt record

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Runtime_Artifacts_Panel.md

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

Storage migrations are forward-only and monotonic.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Contracts_V0.md

Required rules:
- the seglog schema version is persisted in the header / generation metadata
- migrations run only forward; downgrade migrations are unsupported
- backup happens before any destructive migration step
- migration failure leaves the previous durable state intact and prevents opening a half-migrated store

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

Resource-bounding contract:
- every persistent or long-lived collection MUST declare either a TTL, a max cardinality, or both
- file-record caches, rollups, projector queues, and recovery snapshots may not grow without a declared bound

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Architecture_Invariants.md

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

