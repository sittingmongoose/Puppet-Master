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

#### 2.2.1 Mandatory CRC32 per record

Every seglog record MUST include a CRC32 checksum computed over the record payload. This is a mandatory correctness requirement, not an optional enhancement.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md

On read, CRC32 MUST be validated before the record is processed. If validation fails:
- the corrupt record is skipped
- PM emits a recovery/integrity event including record offset and expected vs observed CRC
- projectors resume from the last known-good checkpoint rather than replaying the corrupt record

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Runtime_Artifacts_Panel.md

#### 2.2.2 Concrete wire format

Seglog uses a length-prefixed binary record stream. The canonical payload codec is MessagePack; mirrors and diagnostics may expose the same envelope in JSON, but JSON is not the on-disk authority.

Canonical record structure:
```text
SeglogRecord {
  header: SeglogHeader,
  payload: bytes
}
```

Canonical header fields:
```text
SeglogHeader {
  version: u8,
  segment_generation: u32,
  event_type: string,
  sequence_id: u64,
  source_timestamp_ns?: u64,
  observed_timestamp_ns: u64,
  session_id?: string,
  project_id?: string,
  payload_length: u32,
  checksum_crc32: u32,
  compression: "none" | "lz4"
}
```

Wire-format rules:
- `payload` is the encoded event payload after any payload-only compression step.
- `checksum_crc32` is computed over the stored payload bytes.
- readers validate `payload_length`, then checksum, then decode.
- a single append operation produces exactly one record; record order is the canonical event order.
- `source_timestamp_ns?` preserves upstream/authored time when the source provides it; `observed_timestamp_ns` is always populated by the seglog writer.

#### 2.2.3 Deterministic rotation

Seglog rotation is deterministic and generation-aware.

Rules:
- there is exactly one active writable segment per seglog generation
- active segment path: `storage/seglog/seg-{generation:06}-{start_seq:020}.active`
- closed segment path: `storage/seglog/seg-{generation:06}-{start_seq:020}-{end_seq:020}.seglog`
- rotate on size threshold, clean shutdown, explicit maintenance, or schema-generation change
- closed segments are immutable; no in-place rewrite is allowed
- projectors and rebuild tools consume closed segments in lexicographic order, then the active segment tail when present

#### 2.2.4 Replay and rebuild rules

Replay/rebuild rules:
- redb projections, JSONL mirror files, and Tantivy indices are rebuildable from seglog plus stable checkpoints; none of them outrank seglog as authority
- on restart, replay begins from the last committed checkpoint `{ segment_generation, segment_name, byte_offset, last_seq }`
- if the active segment ends with a partial/corrupt tail, rebuild truncates only after the last verified record and records the recovery action
- rebuild MUST preserve `sequence_id` ordering; regenerated mirrors or indices may differ in file timestamps but not in semantic event order

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

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

Web-operation child payload extension:

```text
web_operation_payload {
  web_operation: "webextract" | "webresearch" | "webcrawl" | "webmap",
  web_input: {
    url: string?,                  // target URL (for extract/crawl/map)
    query: string?,                // search query (for research)
    domain_scope: string?,         // domain restriction
    depth_limit: u32?,             // crawl depth limit (for crawl/map)
  },
  support_tier: "built_in" | "mcp_backed" | "provider_native",
  result_summary: {
    pages_fetched: u32,
    content_length_bytes: u64,
    extraction_quality: "full" | "partial" | "failed",
  },
}
```

Rules:
- this payload is additive child-run / child-attempt metadata for web-capable executions
- `web_input.url` is used for extract, crawl, and map operations; `web_input.query` is used for research operations
- `support_tier` records whether the operation came from built-in PM support, MCP backing, or a provider-native surface
- `result_summary` is persisted only after the operation completes or fails with partial results

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
- `attempt_record.v1:{project_id}:{node_id}:{attempt_number}`
- `blocked_projection.v1:{project_id}:{node_id}`
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
- `debug_investigation_record.v1:{project_id}:{investigation_id}`
- `gha_panel_state.v1:{project_id}`
- `bundle_registry.v1:{project_id}:{bundle_id}`
- `note_record.v1:{bundle_id}:{note_id}`
- `revision_run.v1:{bundle_id}:{revision_id}`
- `composer_prep_state.v1:{thread_id}`
- `preview_state.v1:{project_id}:{preview_id}`
- `browser_session_state.v1:{session_id}`
- `browser_profile_state.v1:{profile_name}`

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/Skills_System.md

Canonical key reconciliation notes:
- `attempt_record.v1:{project_id}:{node_id}:{attempt_number}` is the canonical attempt key. `project_id` is required for cross-project queries, retention, and cleanup; `run_id` and `attempt_id` remain stored fields on the record but are not key components.
- `blocked_projection.v1:{project_id}:{node_id}` is the canonical blocked-state key. The value includes `{ blocked_reason_code, blocked_at, blocked_family, approval_scope_key?, allowed_action_ids[] }`.
- older 3-component or run-scoped variants are superseded by the canonical forms above and remain migration-read aliases only.

GitHub Actions panel state:

```text
gha_panel_state.v1:{project_id} {
  pinned_workflows: string[],      // workflow IDs pinned to panel header
  filter_status: "all" | "failed" | "running" | "success",
  auto_refresh_interval_ms: u64,   // default: 30000
  collapsed_sections: string[],    // collapsed workflow groups
  last_viewed_run_id: string?,
  notification_prefs: {
    notify_on_failure: bool,       // default: true
    notify_on_success: bool,       // default: false
  },
}
```

Document bundle registry persistence:

```text
bundle_registry.v1:{project_id}:{bundle_id} {
  bundle_id: string,
  project_id: string,
  created_at: ISO8601,
  status: "draft" | "in_review" | "approved" | "rejected" | "merged",
  files: BundleFile[],
  review_gate: {
    required_approvals: u32,
    current_approvals: u32,
    auto_merge: bool,
  },
  notes: NoteRecord[],
}

note_record.v1:{bundle_id}:{note_id} {
  note_id: string,
  bundle_id: string,
  file_path: string,
  line_range: [u32, u32],
  content: string,
  author: "user" | "agent",
  created_at: ISO8601,
  resolved: bool,
  resolution: string?,
}
```

Targeted revision persistence:

```text
revision_run.v1:{bundle_id}:{revision_id} {
  revision_id: string,
  bundle_id: string,
  trigger: "note_reply" | "resubmit" | "auto_fix",
  note_reply_index: NoteReplyRef[],  // which notes triggered this revision
  status: "pending" | "running" | "completed" | "failed",
  changes: FileChange[],
  created_at: ISO8601,
}

composer_prep_state.v1:{thread_id} {
  draft_text: string,
  attachments: AttachmentRef[],
  mode_overlay: ModeOverlay?,
  persona_id: string?,
  saved_at: ISO8601,
}
```

Preview and browser persistence:

```text
preview_state.v1:{project_id}:{preview_id} {
  preview_id: string,
  preview_type: "web" | "markdown" | "component",
  source_file: string,
  port: u16?,
  status: "starting" | "running" | "stopped" | "error",
  last_refresh: ISO8601,
}

browser_session_state.v1:{session_id} {
  url: string,
  viewport: { width: u32, height: u32 },
  scroll_position: { x: f64, y: f64 },
  zoom_level: f64,
  dev_tools_open: bool,
}

browser_profile_state.v1:{profile_name} {
  user_agent: string?,
  cookies_enabled: bool,
  javascript_enabled: bool,
  custom_headers: Record<string, string>,
}
```

Related events:
- `preview.session.started`
- `preview.session.stopped`
- `preview.session.refreshed`
- `browser.session.navigated`
- `browser.session.resized`

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

### Canonical terminal persistence decomposition

Storage-plan is the canonical source for terminal persistence keys. The terminal surface persists as the following decomposed key families:

1. `terminal_session.v1:{terminal_session_id}` — PTY session state
2. `terminal_layout.v1:{project_id}` — terminal panel layout
3. `terminal_history.v1:{terminal_session_id}` — command history
4. `terminal_profile.v1:{profile_name}` — shell profile config
5. `terminal_env.v1:{project_id}` — environment variable overrides
6. `terminal_cwd.v1:{terminal_session_id}` — working directory
7. `terminal_scroll.v1:{terminal_session_id}` — scroll buffer state
8. `terminal_font.v1:global` — terminal font settings
9. `terminal_color.v1:global` — terminal color scheme

FinalGUISpec §15.1 references `terminal_state:v1` as a subset alias. The canonical keys above provide the full decomposition.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md
### Naming and migration rules
Storage migrations are forward-only and monotonic.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Required rules:
- New fields must be additive first; destructive renames require a migration note in the same section that introduces them.
- Keys MUST keep stable semantic names across runtime, persistence, and events unless this plan explicitly defines a translation layer.
- `session_id`, `thread_id`, `run_id`, `message_id`, `step_id`, `tool_call_id`, `approval_id`, `provider_session_id`, `terminal_session_id`, and `dev_session_id` keep their existing meanings everywhere they appear.
- If two subsystems need different terminology, the owner doc must define the mapping explicitly rather than silently overloading a shared field name.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

#### Storage-owned rewrite contract
All non-append durable-store rewrites MUST use same-directory temporary files and atomic promotion.
- Replacement writes for state files, manifests, checkpoints, segment rewrites, or similar durable storage artifacts MUST create `<target>.tmp.<random>` in the target directory, write the full replacement payload there, `fsync` the temp file, and then rename/promote it into place.
- Append-only seglog/event writers are exempt from temp-rename promotion, but they remain subject to durable flush and corruption-detection rules.
- Per-session temp directories MAY hold scratch artifacts or janitor-managed work files, but they MUST NOT be used for replacement writes that rely on same-filesystem atomic rename.
- Failure to create the temp file, `fsync` it, or rename/promote it is a hard error; PM MUST NOT silently fall back to direct overwrite.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md

Storage root selection order:
1. Explicit user-configured storage root (if valid and permitted).
2. Project-scoped durable root when the feature is project-owned.
3. App-level durable root for cross-project state.
4. Session temp root only for explicitly temporary data.

Selection rules:
- A feature may write to a session temp root only if its contract explicitly classifies the artifact as temporary or disposable.
- Durable state MUST survive process restart unless the owning contract explicitly says otherwise.
- Remote-mode projects keep durable storage colocated with the owning authority defined by `Plans/GitHub_Integration.md`; temp mirrors are not durable ownership transfers.

Durable-store safety rules:
- Never rewrite durable files via cross-filesystem temp paths when the final correctness contract depends on atomic rename.
- Janitor cleanup MAY remove abandoned temp files, but it MUST NOT touch active durable targets or preserved checkpoints.
- When a durable store is unavailable, writers fail closed and surface a structured error instead of downgrading silently to temp-only persistence.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md

#### Active durable-store lock identity
The active durable-store lock is keyed by `(storage_root, authority_scope, store_family)`.
- Session or run ids are not sufficient durable-store lock identities by themselves.
- Store families that require independent recovery or retention policies must not share a lock identity merely because they live under the same root.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md

#### Concrete bounded collections
Live storage-managed collections MUST have explicit bounds or retention contracts.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/LSPSupport.md

| Collection / family | Bound type | Bound source | Notes |
|---|---|---|---|
| Active assistant and child-session state maps | Max cardinality | Active run envelope plus `max_total_active_agents` | Historical data moves to durable history/checkpoints instead of staying in live maps. |
| MCP connection and auth-handle caches | Max cardinality | Registered server count x active auth scopes | Superseded or idle handles are evicted instead of accumulating indefinitely. |
| LSP session and host/root attachment maps | Max cardinality | Open project/worktree roots x configured servers | Restart/rebind replaces prior attachments instead of widening the map. |
| Projector and analytics work queues | Max queue depth | Per-projector batch limits plus checkpoint/resume contract | Excess work spills via checkpointed resume rather than unbounded in-memory growth. |
| Safe points, snapshot metadata, and undo indexes | TTL + cardinality | Session/run lineage plus configured retention window | Preserved or legal-hold items opt out explicitly; ordinary session artifacts age out. |
| Temp artifacts and stale rewrite remnants | TTL | Janitor sweep plus configured max age | `.tmp.*` rewrite remnants and abandoned scratch artifacts are cleaned deterministically. |

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/LSPSupport.md

### 2.4 Projector pipeline: consumption, JSONL mirror, Tantivy, checkpoints
**Consumption model:** Each projector advances in canonical seglog order:

1. Read checkpoint from redb (`segment_generation`, `segment_name`, `byte_offset`, `last_seq`).
2. Open seglog at that location and read records in order.
3. For each event, update only the projections that own it (JSONL mirror, Tantivy, redb snapshot/projector state, analytics enqueue, etc.).
4. Commit the new checkpoint only after the owned projection writes are durable.

**JSONL mirror policy:**
- JSONL mirror is derived, human-readable, and rebuildable. It is never authoritative over seglog.
- The mirror preserves the canonical event envelope in sequence order; projector-local metadata may exist in file naming or side metadata, but not as a semantic fork of the event payload.
- Mirror files rotate deterministically with seglog generations/segments so replay, diffing, and corruption recovery stay explainable.
- A missing or stale mirror file is repaired by replaying the corresponding seglog range; PM MUST NOT backfill seglog from JSONL.
- Mirror retention follows the source seglog retention/preservation decision. A preserved or legal-hold seglog range keeps its mirror unless the mirror is explicitly regenerated in place from the same source range.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md

**Tantivy/index rebuild rules:**
- Tantivy indices, analytics rollups, and other projections rebuild from seglog or the canonical source range chosen by the owning projector.
- Projector checkpoints are durable ownership boundaries; partial projection writes do not advance checkpoints.
- Rebuild after schema-version change clears only the derived projection state being regenerated; the canonical seglog and unrelated redb families remain untouched.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

**Checkpoint guarantees:**
- checkpoints encode enough information to resume without duplicate semantic writes
- sequence order, not file mtime, is the source of truth for replay ordering
- checkpoint advancement is atomic with projector durability, not with UI refresh timing
- projector checkpoints are not a substitute for runtime recovery checkpoint markers. Runtime/executor-owned checkpoint marker events and safe-point lineage records MUST be durably emitted to seglog before mutation-capable execution resumes or restore flows continue.
- recovery resume logic uses the canonical runtime checkpoint marker stream plus projector checkpoints; projector checkpoints alone are insufficient for mutation/recovery replay.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Runtime_Artifacts_Panel.md

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
- [ ] **Define event type schemas** for `chat.message`, `chat.thread_created`, `run.started`, `run.completed`, `usage.event`, `tool.invoked` (include optional `success`, `error`, `thread_id` per Plans/Tools.md §8.0), optional `tool.denied`, runtime checkpoint-marker events, and any editor lifecycle events per FileManager.md.
- [ ] **Implement redb schema + migrations:** namespaces (settings, sessions, runs, checkpoints, editor, rollups, review_rules); key patterns as in §2.3; migration runner and version bump.
- [ ] **Implement projector: seglog -> JSONL mirror** (tail, checkpoint, write mirror).
- [ ] **Implement projector: seglog -> Tantivy** (chat index; optional docs/logs); incremental index updates; checkpoint.
- [ ] **Persist projector checkpoints** in redb under `checkpoints` namespace.
- [ ] **Emit runtime checkpoint-marker events:** before mutation-capable execution resumes, before safe-point restore continues, and when recovery resumes from a stored runtime checkpoint; persist the marker lineage needed for replay.
- [ ] **Implement analytics scan:** scan seglog (or JSONL) for usage/tool/run events; compute 5h/7d, tool latency, and **tool_usage** (per-tool count, p50/p95, error_count) rollups; write to redb `rollups` (including `tool_usage.{window}` per Plans/Tools.md §8.4); store scan checkpoint.
- [ ] **Wire chat persistence:** thread list and thread content write to seglog; read from redb (session metadata) and seglog or redb snapshots for full thread load (per assistant-chat-design.md).
- [ ] **Wire editor state:** open tabs, active tab, scroll/cursor per FileManager.md §2.9 into redb `editor` namespace.
- [ ] **Wire Usage/dashboard:** read 5h/7d and rollups from redb; trigger analytics scan on interval or when Usage view opens (per usage-feature.md).
- [ ] **Emit usage.event with thread_id and parent lineage:** When recording usage for Assistant or Interview runs, include `thread_id`, `parent_run_id` when applicable, and the canonical attribution fields needed for per-thread and parent-rollup aggregation.
- [ ] **Emit usage.event for hidden/background model work:** title generation, summaries, compaction helpers, tool-triggered model calls, and other helper invocations still write canonical `usage.event` records even when not directly user-visible.
- [ ] **Emit run.completed with optional usage snapshot:** When a run finishes, include optional `usage` in the `run.completed` payload using the canonical usage field set (`input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`, `reasoning_tokens`, `total_tokens`, `cost_microdollars`, `provider_id`, `model_id`, `account_id?`, `billing_entity_id?`, `entitlement_class?`, `thread_id`, `parent_run_id?`, `cache_hit?`, `cache_strategy?`). Canonical per-request data remains `usage.event`.

## 4. Impact on chat (Assistant / Interview)

Assistant and Interview surfaces persist thread-local state, activity traces, and reviewable history, but they do not become the canonical owner of runtime identity.

### 4.1 Shared runtime identity consumption

Shared runtime identity projection is consumed across chat, widgets, audit, and delegated execution. Storage keeps the canonical field names and their meanings aligned.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Personas.md

| Field | Meaning |
|---|---|
| `requested_persona` | Persona requested for the run. |
| `effective_persona` | Persona actually in effect. |
| `requested_account_binding` | Requested account or provider binding before routing and policy resolution. |
| `operational_identity` | Stable runtime identity used for execution and audit. |
| `effective_account_label` | Human-readable effective account label shown to the user. |
| `effective_provider_identity` | Effective provider/account pair used after routing. |
| `effective_project_id` | Project identity bound to the execution context. |

Storage rules:
- these fields are additive and do not replace the existing requested/effective vocabulary
- `_id` aliases such as `requested_persona_id` are not canonical runtime snapshot fields
- chat and GUI surfaces consume the same stored field names rather than projecting local variants
### 4.2 Question and clarification state
This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Question schema canonical names and enums are locked, including QuestionItem fields, canonical freeform and multi-select field names, and answer source metadata.

Labels and values:
- questionnaire
- single_question
- unavailable
- dismissed

Rules:
- question_id
- question
- allow_freeform
- multi_select
- default_values?: string[]
- draft_value?: string
- response_kind
- validation_state
### 4.3 Plan and TODO state
This section defines the canonical contract for this surface.

Core rules:
- Plan and Deep Plan must both project to a normalized TODO list, with a named Q&A loop before Deep Plan execution and a locked TODO item schema/status set.
- Plan/TODO persistence is locked to explicit revision states, structural-edit gating after approval, bounded revision history, and emission of `chat.plan_todo_updated` for durable TODO mutations.
- TODO tool behavior is locked so todowrite and todoread use the normalized TODO schema, todowrite is not blanket auto-denied in ask/plan mode, and Deep Plan edits must resync the TODO projection before execution.
- `chat.plan_todo_updated` must have an explicit owner-contract definition for durable normalized TODO mutation, and `todoread` must not survive as a `source_surface` mutation source.

Fields:
- Q&A loop
- todo_id
- title
- summary
- status
- dependencies[]
- owner_hint
- verification_hint
- pending | in_progress | completed | blocked | skipped
- superseded
- draft
- approved
- executing
- completed
- blocked
- Structural edits = adding / removing / reordering TODO items
- chat.plan_todo_updated
- todowrite
- todoread
- todowrite can create, reorder, update statuses/notes
- todoread returns current normalized list for active thread/run
- Remove `todowrite` from blanket `ask/plan` mode auto-deny
- editing Deep Plan markdown (the rich artifact) MUST update the normalized TODO projection BEFORE execution begins
ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3 Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events

Labels and values:
- Plan
- Deep Plan
### 4.4 Activity transparency payloads
This section defines the canonical contract for this surface.

ContractRef: Plans/Contracts_V0.md#3.4A Web error taxonomy and applicability

Core rules:
- Preserve the Firecrawl-specific audit payload keys as exact contract-owned fields.
- The Firecrawl webextract mapping must preserve structured extraction modes and option surface, not a thin single-URL summary.
- The Firecrawl owner section must either preserve `changeTracking` with its structured output shape or explicitly retire it as out of scope; it must not disappear silently.
- PM must not silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl, and deployment-mode disclosure must remain visible.
- Batch audit/event canon must preserve a parent audit event for the batch plus child audit events per URL.
- The Firecrawl owner section must preserve shared routing/audit disclosure for requested/effective provider selection, fallback visibility, denied-web projection, and canonical web error taxonomy linkage.
- The per-contract web error applicability table remains required canon and must stay aligned with provider-to-PM error mapping.
- All web tools share a common output field set that includes provider identity, routing reason, timing, cache status, and standard error or warning fields.
- Activity transparency payloads must preserve adapter-selection and projection fields used for routing and audit disclosure.

Fields:
- firecrawl_credits_used
- firecrawl_cache_state
- firecrawl_scrape_id
- webextract
- JSON Schema support
- prompt-driven extraction behavior
- URL wildcards
- enableWebSearch
- changeTracking.status
- changeTracking.previous_content_ref
- changeTracking.diff_summary_ref
- changeTracking.checked_at_utc
- parent audit event for the batch
- child audit events per URL
- tool.invoked
- continue_on_error
- `tool_use_id`
- `adapter_id`
- `adapter_selection_reason`
- `duration_ms`
- `timestamp`
- `cached`
- `error_code?`
- `error_message?`
- `warnings?`
- `provenance_badge?`
- requested_adapter_id
- effective_adapter_id
- adapter_selection_reason
- provider_fallback_summary
- warnings_count
- error_code
- projection_freshness
- projection_health

Rules:
- changeTracking { status: changed | unchanged | no_previous_version, previous_content_ref?, diff_summary_ref?, checked_at_utc }
- change_status: 'new' | 'same' | 'changed' | 'removed'
- pages[].change_status
- change_summary
- explicit out-of-scope retirement if `changeTracking` is not MVP
- no silent disappearance of the capability
- PM MUST NOT silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl
ContractRef: ContractName:Plans/Contracts_V0.md#3.4A Web error taxonomy and applicability, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/FinalGUISpec.md#15.3 Web and diff operation card widget
- no silent switch between self-hosted Firecrawl and hosted/cloud Firecrawl
- deployment-mode disclosure remains visible
- self-hosted Firecrawl does not use hosted credit billing
- tool.denied
- adapter_unavailable
- unsupported_operation
- content_blocked
- content_not_found
- unsupported_source
- extraction_schema_mismatch
- autonomous_budget_exceeded
- no_previous_version
- blocked_reason_code
- allowed_action_ids[]
- denial_reason_code
- denial_source
- suggested_recovery_action
- adapter_id
- blocked responses must be machine-actionable through `allowed_action_ids[]`
- error naming aligns to `adapter_unavailable`

#### Long-running `progress_event` payload

This section defines the canonical contract for this surface.

ContractRef: Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/FinalGUISpec.md#15.3 Web and diff operation card widget

Core rules:
- The Firecrawl async contract must preserve timeout behavior tied to timeout_ms and partial-result survival on timeout.
- Long-running web operations must preserve the structured progress_event payload and cancellation-with-partial-results contract.
- The Firecrawl async contract must preserve the exact poll ladder and status family already restored in the owner section.

Fields:
- timeout_ms
- timeout when polling exceeds `timeout_ms`
- partial results survive timeout if already materialized
- progress_event
- tool_use_id
- operation
- phase
- detail
- pages_completed
- pages_total
- elapsed_ms
- estimated_remaining_ms
- cancelled: true
- 2s, 4s, 8s, 15s, 30s
- scraping
- processing
- completed
- failed
- cancelled
### 4.5 Inline visualizer persistence

Inline visualizer persistence stores only PM-managed source, metadata, and PM-owned outputs.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

Persistence rules:
- persisted fields include source fragment, title, kind, version, and PM-managed output or draft values
- arbitrary JS heap state is not persisted
- replay or reload re-renders from the persisted source plus metadata
- visible fallback and error state are persisted as PM-owned display state, not as arbitrary client script state
## 5. Gaps and how we address them

The remaining persistence gaps for the rewrite shell are addressed by explicit owner-aligned state instead of feature-local ad hoc blobs.

### 5.1 Unsaved editor recovery is required, not optional
Rules:
- recover-unsaved is required MVP behavior for local and remote-backed buffers
- recovery snapshots store local buffer state, capture metadata, host/path identity, and write availability at capture time
- remote-backed recovery banners must say `Recovered local edits — remote destination not yet synchronized`
- save success is only claimed after the effective destination confirms the write

Implementation spec:
- key: `editor_state.v1:{project_id}:{file_path_hash}`
- stores: cursor position, scroll offset, selection ranges, undo stack reference, and unsaved changes flag
- recovery trigger: on session restore, reload each open editor's state before restoring focus
- conflict handling: if the file changed on disk since the last save, show a diff and let the user choose how to resolve the mismatch

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md

### 5.2 Requested vs effective runtime state must remain visible
The persistence model stores enough context to reconstruct effective behavior honestly after restart.

Required stored distinctions:
- requested vs effective browser runtime/capabilities
- requested vs effective LSP enablement and attached-server set
- freshness vs health vs write availability for remote-backed projections
- restore outcome for historical Search, LSP, browser, and editor recovery surfaces

Implementation spec:
- key patterns: `{resource_type}_requested.v1:{scope}:{id}` and `{resource_type}_effective.v1:{scope}:{id}`
- requested state is what the user or system asked for; effective state is what actually applies after resolution
- projection freshness is persisted as `current`, `refreshing`, or `stale`
- `current` means just resolved, `refreshing` means re-resolution is in progress, and `stale` means the projection needs refresh before it should be treated as current

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md

### 5.3 Search and Source Control keep separate projection state
Rules:
- Search state stores text query intent and query snapshots
- Source Control state stores repo projections, compare origins, and review context
- diff-local search does not get persisted as project Search state
- editor markers consume Source Control/LSP projections but do not become a substitute owner

Implementation spec:
- keys: `search_projection.v1:{project_id}` and `sc_projection.v1:{project_id}`
- Search projection stores last query, results, filter state, and scope
- Source Control projection stores branch, diff state, staged files, and commit message draft
- editor markers consume these projections but do not own them

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md

### 5.4 Host-aware LSP persistence and restart behavior
Rules:
- LSP lifecycle and restart budgets are persisted by host-aware session key
- restart/reconnect preserves enough state to disclose whether a projection is current, refreshing, stale, degraded, or unavailable
- remote-mode projects never restore into a silent local fallback path

Implementation spec:
- key: `lsp_server_state.v1:{host_id}:{server_id}:{root_hash}`
- stores: server config, capabilities snapshot, last known status, and restart count
- recovery path: on session restore, restart LSP servers using the persisted config
- persisted restart counts survive reconnects so budget enforcement and degraded-state disclosure remain stable after restart

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md

## 6. Potential problems and solutions

| Problem | Solution |
|---------|----------|
| **seglog corruption or partial write** | Append-only with flush and last-complete-record recovery. CRC32 per record is mandatory; validate on every read; corrupt record -> skip + recovery event. |
| **redb corruption** | Restore from backup or rebuild projections from canonical seglog. |
| **Projector falls behind** | Buffer events in bounded batches and checkpoint only after a successful commit. |
| **Analytics scan blocks UI** | Run analytics scans in the background; UI shows last committed rollup plus freshness state. |
| **Disk full / storage I/O** | Surface a user-facing error, stop unsafe writes, and retry only per storage I/O policy. |
| **Migration failure** | Leave previous version intact; do not open a half-migrated store. |
| **Multiple app instances** | Acquire exclusive flock on the active durable-store lock path derived from the selected logical storage root or safe-local fallback before any writes. If the lock is held, enter read-only/viewer mode and notify the user. |

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

| Problem | Solution |
|---------|----------|
| **Checkpoint lost** | Rebuild from seglog / last retained segment. |
| **API contract (caller handling errors)** | `append()` / redb write operations return structured `Result`; no silent swallow. |
| **Projector panic or crash** | Do not advance checkpoint; restart from last good checkpoint. |
| **File record LRU eviction** | Cap in-memory file records at 10,000 entries and rebuild lazily on access. |
| **Boot-time janitor** | After active durable-store lock acquisition, sweep stale `.tmp.*` artifacts, validate lock freshness, and emit a `storage.boot_recovery` event if cleanup was required. |
| **DB / redb shutdown hygiene** | Close the DB handle in the shutdown sequence before process exit. |

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileSafe.md

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

**Startup order:**
1. Resolve the app data root (environment override optional).
2. Probe the selected storage root for durable-store safety and establish any required safe local fallback before durable stores are opened.
3. Derive the active durable-store root and its lock path, then acquire exclusive lock ownership before any writer opens durable state. If the lock is already held, PM enters read-only/viewer mode and stops before writer startup.
4. Create `storage/seglog`, `storage/redb`, `storage/jsonl`, `storage/tantivy` if missing.
5. Open redb and run migrations.
6. Open the seglog writer.
7. Start projectors that tail seglog and write JSONL/Tantivy/checkpoints.
8. Start optional analytics schedulers and per-project index services.

If durable-store fallback is active, PM routes lock files, durable DB state, and session snapshot metadata to the safe local fallback while preserving the selected logical storage root for lineage and user-visible diagnostics.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md

**Regex-index startup recovery:** After a project context is known and before the first indexed `grep` or Search-panel regex query for that project:
1. Scan the relevant `regex_index/` directory.
2. Pick the highest valid `gen-{N}/` candidate.
3. Validate `index_meta.json`, per-file xxh3 checksums, and `lookup.bin` sizing / offsets before mmap.
4. For Git-backed caches, verify `anchor_sha` is still reachable (`git cat-file -t {anchor_sha}`). Unreachable anchors invalidate the snapshot and trigger rebuild from current HEAD.
5. If a valid snapshot exists, create `IndexSnapshot`, mmap `lookup.bin`, and mark the project `ready`.
6. If no valid snapshot exists, mark the project `no_index` and transparently serve raw ripgrep until the background full build completes.
7. Delete orphaned or partial generations opportunistically during this recovery path.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Architecture_Invariants.md

**Shutdown:**
1. Signal projectors to stop and flush outputs.
2. Cancel in-flight regex builds and wait briefly for partial-generation cleanup.
3. Flush and close the seglog writer.
4. Close redb.
5. Release the active durable-store lock after the final writer flush completes.
6. Leave the last valid regex snapshot and any reusable remote cache state in place; ordinary shutdown does not evict caches.

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

Canonical note:
- `blocked_projection.{run_id}.{node_id}.{blocked_sequence}` is superseded by canonical `blocked_projection.v1:{project_id}:{node_id}`
- canonical blocked-projection values include `{ blocked_reason_code, blocked_at, blocked_family, approval_scope_key?, allowed_action_ids[] }`

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
- `attempt_count` is the ground-truth count of started attempts for a node in a run, including the first attempt.
- `retry_count` is derived display data only: `max(attempt_count - 1, 0)`.
- sub-counter decomposition is additive attribution, not a replacement for `attempt_count`: `attempt_count = initial_attempts + retry_attempts + resume_attempts + remediation_retry_attempts`.
- permission, auth, approval, safe-point, or revalidation changes produce new attempt snapshots/records; they do not mutate prior attempt counters in place.
- projections that need lineage MUST join through `attempt_id` and the immutable attempt snapshot, not infer history from `retry_count` alone.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md

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
- `blocked_projection`: canonical key = `project_id`, `node_id`; older `run_id`, `node_id`, `blocked_sequence` variants are superseded
- `attempt_record`: canonical key = `project_id`, `node_id`, `attempt_number`; older `run_id`, `node_id`, `attempt_id` variants are superseded
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

`attempt_id?` and `thread_id?` remain fields on `blocked_projection` and are not primary-key components. Canonical blocked-projection values include `{ blocked_reason_code, blocked_at, blocked_family, approval_scope_key?, allowed_action_ids[] }`.

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

Receipt extensions by operational domain:

```text
scm_receipt_ext {
  commits_created: string[],       // commit SHAs
  branches_created: string[],
  files_modified: string[],
  merge_conflicts: bool,
}

actions_receipt_ext {
  workflow_runs_triggered: string[],
  artifacts_downloaded: string[],
  logs_fetched: string[],
}

docker_receipt_ext {
  images_built: string[],
  containers_started: string[],
  containers_stopped: string[],
  volumes_created: string[],
}

k8s_receipt_ext {
  resources_applied: string[],
  pods_created: string[],
  deployments_scaled: { name: string, from: u32, to: u32 }[],
}
```

These are additive receipt-domain extensions and do not replace the canonical minimum receipt fields.

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Orchestrator_Page.md

### Canonical records

Canonical records for this feature set must support rebuild, resume, auditability, and UI reconstruction without hidden side stores.

Required canonical records include:
- child runs and attempts
- child batch and subgroup structure
- crew and crew-board state
- planning-output projections derived from plan-mode children
- context-shaping state tied to stable block refs
- requested/effective runtime snapshots for child launches
- blocked-episode and awaiting-parent correlation metadata
- `debug_investigation_record`
- `permission_snapshot_record`
- cross-surface receipt records and their domain extensions

**Debug investigation record (superseding earlier thin examples):**
```text
debug_investigation_record.v1:{project_id}:{investigation_id} {
  project_id: string,
  investigation_id: string,
  thread_id: string,
  run_id?: string,
  debug_target_kind: string,
  primary_target_summary: string,
  state: string,
  investigation_phase: string,
  verification_state?: string,
  attention_reason_code?: string,
  blocked_reason_code?: string,
  revalidation_reason_code?: string,
  requested_mode_overlay: "debug",
  effective_mode_overlay: "debug",
  worktree_id?: string,
  target_ref?: string,
  active_instrumentation_refs: string[],
  evidence_refs: string[],
  artifact_bundle_ref?: string,
  retention_class: "durable" | "session_bounded" | "ephemeral_view",
  preservation_reason?: "legal_hold" | "user_preserve" | "linked_bundle" | "compliance_export",
  source_timestamp_utc?: ISO8601,
  observed_at_utc: ISO8601,
  persisted_at_utc: ISO8601,
  last_updated_at_utc: ISO8601,
  closed_at_utc?: ISO8601
}
```

**Retention and preservation classes:**
- `durable` — retained until the owning cleanup policy or explicit user deletion says otherwise.
- `session_bounded` — retained for the active session/window plus bounded restart recovery, then eligible for cleanup.
- `ephemeral_view` — UI convenience state that may be regenerated and may be dropped aggressively.
- `preservation_reason` freezes ordinary TTL/cardinality cleanup. Legal-hold or export preservation affects canonical records and their derived projections together; cleanup MUST NOT delete a preserved canonical record while leaving only a mirror or index fragment behind.
ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md

**Canonical time-source precedence:**
- `source_timestamp_utc` (upstream/authored time) wins for semantic ordering when present and trustworthy.
- otherwise use `observed_at_utc` (when PM received/observed the event).
- `persisted_at_utc` is durability metadata and MUST NOT silently replace the authored/observed event time in UI ordering or lineage logic.
- when source and observed times diverge materially, keep both and mark the record as skewed rather than rewriting one onto the other.

Canonical truth exclusions:
- `.puppet-master/memory/*` is not canonical child or crew continuity storage.
- `active-agents.json` and `active-subagents.json` are not canonical live-state stores.
- provider-native session trees are correlation data, not PM identity.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/orchestrator-subagent-integration.md
### Counter rule
- `attempt_count` is the total started-attempt count for the node in the run and is the canonical policy/input counter.
- `automatic_retry_count`, `prerequisite_resume_count`, `manual_resume_count`, and `remediation_retry_count` remain independent stored attribution counters.
- `retry_count` is derived convenience/display data only and MUST NOT drive scheduling, permission, or resume policy.
- canonical model: `attempt_count` starts at `1` for the first attempt and increases only when a new immutable attempt snapshot is created.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md

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

`Plans/storage-plan.md` owns only the durable storage binding for permission snapshots. `Plans/Permissions_System.md` owns the snapshot schema, enums, approval-surface expectations, and blocked-action semantics.

**Canonical storage binding:**
- durable family: `permission_snapshot_record.v1:{project_id}:{snapshot_id}`
- immutable link from attempt state: `attempt_record.permission_snapshot_id`
- projector/query fields MAY cache `blocked_family`, `approval_scope_key`, `approval_target_ref`, and `revalidation_required` for indexing, but they MUST NOT redefine the nested snapshot schema locally

**Rules:**
1. The snapshot record is written before the corresponding attempt becomes durable/dispatchable.
2. The snapshot payload is immutable after creation. Later approval or policy changes create a new snapshot and a new attempt lineage entry; they do not rewrite the old one.
3. Snapshot retention follows attempt lineage and any stronger preservation/hold rule.
4. storage-plan MUST reference the owner-doc schema instead of embedding a competing schema copy.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md

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
- New optional field: `owner_thread_id?` alongside existing `owner_run_id?` and `owner_node_id?`
- Owner semantics: exactly one of `owner_thread_id`, `owner_run_id/owner_node_id`, or neither (manual) is set

## 8. Web content caching persistence
This section consumes the linked owner contract and stays aligned with it.

Core rules:
- The PM-owned web cache contract must preserve two-phase lookup, state vocabulary, and per-project cache sizing.
- Cache routing must skip read-time cache for requests with actions, may still store the post-action result, and must preserve PM-cache precedence over Firecrawl cache with diff-reuse audit states.

Fields:
- hit
- miss
- bypassed
- expired_used_for_diff
- normalized_url
- formats_hash
- adapter_id
- 500 MB

Rules:
- If request includes `actions`, skip cache entirely (always fresh-execute)
- Cache STORE still applies to the final result after actions execute
- PM cache takes precedence for serving cached content
- Firecrawl cache serves as provider-side optimization only
- `cache_state: "hit" | "miss" | "bypassed" | "expired_used_for_diff"`
