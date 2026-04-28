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

#### Canonical records baseline
- Canonical records are the single source of truth for run, node, lane, and execution state.
- Canonical records are immutable once committed; corrections require a new record with explicit lineage.
- All canonical records include `created_at_utc`, `updated_at_utc`, and `created_by` for audit.

### Concern record and lifecycle canon
- Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request.
- Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata.
- Create one canonical concern-lifecycle owner section with explicit active/acknowledged/resolved/dismissed semantics.
- Carry resolution_kind including accepted_risk and a concern-action confirmation matrix into that owner section.
- Storage persists concern_record separately from concern_projection and blocked_episode linkage so lifecycle ownership stays durable and queryable.

#### Required redb keys baseline
- `run:<run_id>`: Run context and policy.
- `node:<node_id>`: Node definition and execution state.
- `lane:<lane_id>`: Lane lifecycle and worktree allocation.
- `execution_unit:<execution_unit_id>`: Execution unit context and identity.
- `receipt:<receipt_id>`: Execution receipt and artifact linkage.

### Historical semantic consistency
- Define shared historical vocabulary: historical, stale_historical, superseded, revoked, reopened, archived, removed.
- Keep family-local workflow states distinct and reconcile remediation.resolved enum conflict.
- Historical terms stay shared across concern, receipt, artifact, worktree, and usage families without collapsing family-local workflow states.

#### Cross-surface receipt record baseline
- Receipt records bind execution results to canonical run, node, and lane identity.
- Receipts include `execution_unit_id`, `result_summary`, `artifacts`, and `evidence_ref`.
- Dashboard, CLI, and API surfaces query receipt records to display execution results.

#### Projection freshness, health, and startup rehydration baseline
- Projections are derived from canonical records and events.
- Projection freshness is tracked per projection type; stale projections are recomputed at startup.
- Startup rehydration restores projections from seglog and redb canonical records.

#### Account pressure, history, and runtime attribution baseline
- Account pressure metrics are stored per account and updated at node/lane boundaries.
- History records (account-level and execution-level) are immutable and linked to canonical run/node identity.
- Runtime attribution tracks which actor/role executed each node or phase.

#### Artifacts index, export manifests, and route/open linkage baseline
- Artifacts are indexed by artifact ID and linked to run, node, and receipt records.
- Export manifests bind artifact collections to project deliverables.
- Route/open linkage documents which route args and open contracts were active during execution.

#### Worktree/lane lifecycle, handshake, and cleanup lineage baseline
- Worktree lifecycle records track allocation, usage, and reclamation events.
- Handshake records document the Source Control → Orchestrator worktree allocation contract.
- Cleanup lineage ensures stale worktrees are eventually removed and audited.

#### Naming and migration rules baseline
- Schema keys follow `entity_type:entity_id:sub_key` patterns for consistency.
- Migrations are versioned and idempotent; old schema versions must be supported for at least one major release.
- Deprecation is explicit and documented in migration notes.

### Fidelity recovery order
- Apply owner-doc corrections before consumer and mirror cleanup.
- Rerun fidelity audit only after owner and consumer corrections are in place.
- Storage-owner sequencing follows the same order: canonical owner records first, dependent projections and mirrors second, and fidelity rerun evidence only after both are complete.

### Canonical records (runtime/storage families)
Storage owns one shared record envelope with canonical lineage refs plus artifact/evidence refs. Record objects remain distinct from rendered views, mirrors, exports, and summaries.

Required record families include:
- `attempt_record.v1:{project_id}:{node_id}:{attempt_number}`
- `blocked_projection.v1:{project_id}:{node_id}`
- `concern_record.v1:{project_id}:{concern_id}`
- `worktree_record.v1:{project_id}:{worktree_id}`
- `worktree_projection.v1:{project_id}:{worktree_id}`
- `lane_record.v1:{project_id}:{lane_id}`
- `lane_projection.v1:{project_id}:{lane_id}`
- `project_summary.v1:{project_id}`
- `project_attention_item.v1:{project_id}:{attention_item_id}`
- `account_pressure_episode.v1:{provider_id}:{account_id}:{episode_id}`
- `account_switch_event.v1:{provider_id}:{event_id}`

Concern canon:
- concern is a first-class durable record distinct from review findings, annotations, blocked episodes, and graph patch requests
- lifecycle states are `active`, `acknowledged`, `resolved`, and `dismissed`
- `resolution_kind` values are `fixed`, `accepted_risk`, `superseded`, `merged`, `split`, `invalidated`, `obsoleted_by_patch`, and `obsoleted_by_recovery`
- source-event refs, concern records, and concern projections are separate structural layers rather than one collapsed object

Historical vocabulary stays explicit: `historical`, `stale_historical`, `superseded`, `revoked`, `reopened`, `archived`, and `removed` are shared storage terms, while family-local workflow states remain family-local.

### Required redb keys (project/runtime families)
- `artifacts_index.v1:{project_id}:{artifact_id}`
- `artifacts_project_state.v1:{project_id}`
- `projector.checkpoint.runtime_artifacts:{project_id}`
- `attempt_record.v1:{project_id}:{node_id}:{attempt_number}`
- `blocked_projection.v1:{project_id}:{node_id}`
- `concern_record.v1:{project_id}:{concern_id}`
- `project_summary.v1:{project_id}`
- `project_attention_item.v1:{project_id}:{attention_item_id}`
- `worktree_record.v1:{project_id}:{worktree_id}`
- `worktree_projection.v1:{project_id}:{worktree_id}`
- `lane_record.v1:{project_id}:{lane_id}`
- `lane_projection.v1:{project_id}:{lane_id}`
- `account_pressure_episode.v1:{provider_id}:{account_id}:{episode_id}`
- `account_switch_event.v1:{provider_id}:{event_id}`

### Cross-surface receipt record (required fields)
Required fields:
- `attempt_id`
- `provider_attempt_ref`
- `usage_event_ref`
- `workflow_refs`
- `docker_refs`
- `kubernetes_refs`
- `validation_pass_report`
- `workflow_run_id`
- `run_id`
- `pass_verdict`
- `phase_plan_ref`
- `requirements_quality_report_ref`

Rules:
- `attempt_id` is the primary local anchor.
- `provider_attempt_ref` is the provider/runtime bridge, `usage_event_ref` is the usage bridge, and receipt refs are the external side-effect lineage bridge; none of them replace the local key.
- Runtime artifacts are attempt-native by default and stay joinable to receipts, usage, workflow, and validation lineage.
- Artifact open flows resolve by `artifact_id` first and then by linked envelope refs.

### Scope split (durable store boundaries)
| Scope | Store | What belongs here |
|---|---|---|
| Secret | OS credential store only | GitHub API tokens, Docker PATs, browser-login derived credentials, registry/helper secrets |
| Global app state | redb | shared Source Control defaults, Actions defaults, Docker Manager defaults, hidden-subview policy |
| Project state | redb | selected repo/worktree, panel subviews, pinned workflows, selected runtime/context, requested auth mode, template repo state |
| Event ledger | seglog | auth validation, blocked/recovery outcomes, workflow actions, publish results, runtime receipts, cross-surface linkage |

### Projection freshness, health, and startup rehydration (operational rules)

Required rules:
- Use active_run_id/focused_run_id with focus_mode = live | historical
- Keep cross-tab deep links and search pivots coherent on the focused run
- Split projection_freshness from projection_health
- Reserve trust_tier for preview/browser semantics and tie action gating to both axes

Canonical storage rules:
- Project state stores `active_run_id`, `focused_run_id`, and `focus_mode = live | historical` so live dashboards, historical inspectors, and restart rehydration all resolve the same focused run.
- Cross-tab deep links and search pivots MUST target the focused run context; switching tabs or reopening the app does not silently retarget links back to the active run when `focus_mode = historical`.
- `projection_freshness` remains the recency axis and `projection_health` remains the integrity/availability axis; storage and consumers MUST NOT collapse them into a single trust field.
- Sensitive action gating evaluates both axes together: stale-but-healthy projections can require refresh, degraded projections can fall back to canonical record reads, and unavailable projections block projection-dependent actions.
- `trust_tier` is retired as canonical projection vocabulary and is reserved only for preview/browser semantics where UI transport trust must still be disclosed without replacing freshness or health.

### Account pressure, history, and runtime attribution (ownership split)

Required rules:
- Introduce execution_unit_context as canonical runtime-facing context object
- Demote TierContext to a derived or compatibility-only selection/decomposition helper
- Anchor worker spawn, recovery, remediation, coordination, and UI inspection to execution_unit_context
- Let Contracts_V0 own cross-family attribution packet shape
- Let storage-plan own persistence and projection of attempt/usage/receipt/artifact joins

Canonical ownership split:
- `execution_unit_context` is the canonical runtime-facing context object persisted with account pressure episodes, switch history, runtime artifacts, receipts, and usage joins.
- Any `TierContext` or `tier_id` decomposition is compatibility-only derived metadata for legacy selection helpers and MUST NOT own runtime canon, storage keys, or join identity.
- Worker spawn, recovery, remediation, coordination, and UI inspection all resolve runtime identity from `execution_unit_context` so restart flows and inspectors reuse the same run/node/attempt/account anchors.
- Contracts_V0 owns the cross-family attribution packet shape, including run/attempt/thread/node/artifact/provider/usage anchors plus execution/runtime identity.
- storage-plan owns persistence and projection of the attempt/usage/receipt/artifact joins that materialize that packet for history, audit, and inspector consumers.

### Artifacts index, export manifests, and route/open linkage (ownership split)
- Make runtime artifacts attempt-native by default with artifact identity, routing refs, content refs, and provider/usage linkage.
- Resolve artifact open flows by artifact_id and then by linked envelope refs.
- Let Contracts_V0 own canonical route_target and OpenSubject contracts.
- Keep Crosswalk limited to primitive boundary ownership and FileManager OpenFile narrow and path-based.
- Export manifests and artifact indices carry route/open linkage by reference rather than redefining route payload shapes locally.

### Worktree/lane lifecycle, handshake, and cleanup lineage (ownership split)
- Keep Orchestrator as lane-pool operational truth and Source Control as concrete repo/worktree operator.
- Show owning package/lane/run refs plus lifecycle and blocked/recovery state on worktree rows.
- Register worktree_record/worktree_projection and lane_record/lane_projection families.
- Use worktree_id as durable filesystem/git identity and lane_id as operational lineage identity.
- Keep package/work-package linkage and cleanup/archive lineage explicit in lane_record and lane_projection families.
- Handshake and cleanup history remain lineage-bearing storage records instead of ad hoc UI-only summaries.

### Naming and migration rules (forward-only storage policy)
Storage migrations are forward-only and monotonic.

Required rules:
- new fields are additive first; destructive renames require a migration note in the same section that introduces them
- stable semantic names stay aligned across runtime, persistence, and events unless an explicit translation layer is defined
- account/profile-backed runtime records and server-profile-backed runtime records stay distinct durable shapes even when surfaced through one GUI ontology
- consumer docs follow owner-first reconciliation order: owner correction here first, then consumer propagation, then fidelity audit rerun

### Canonical records (owner reconciliation)
Storage owns discoverable record families for runtime, receipt, and projection truth.

### Required redb keys (owner reconciliation)
- `artifacts_index.v1:{project_id}:{artifact_id}`
- `artifacts_project_state.v1:{project_id}`
- `projector.checkpoint.runtime_artifacts:{project_id}`
- `worktree_record.v1:{project_id}:{worktree_id}`
- `lane_record.v1:{project_id}:{lane_id}`
- `worktree_projection.v1:{project_id}:{worktree_id}`
- `lane_projection.v1:{project_id}:{lane_id}`
- `orchestrator.project_state.{project_id}`

### Cross-surface receipt record (storage rules)
Required fields:
- `attempt_id`
- `provider_attempt_ref`
- `usage_event_ref`
- `workflow_refs`
- `docker_refs`
- `kubernetes_refs`
- `validation_pass_report`
- `workflow_run_id`
- `run_id`
- `pass_verdict`
- `phase_plan_ref`
- `requirements_quality_report_ref`

Rules:
- Receipt fields remain lineage-bearing rather than summary prose.
- Runtime artifacts, worktree records, lane records, and project-state keys stay storage owned.

### Scope split (owner reconciliation)

| Scope | Store | What belongs here |
|---|---|---|
| Secret | OS credential store only | GitHub API tokens, Docker PATs, browser-login derived credentials, registry/helper secrets |
| Global app state | redb | shared Source Control defaults, Actions defaults, Docker Manager defaults, hidden-subview policy |
| Project state | redb | selected repo/worktree, panel subviews, pinned workflows, selected runtime/context, requested auth mode, template repo state |
| Event ledger | seglog | auth validation, blocked/recovery outcomes, workflow actions, publish results, runtime receipts, cross-surface linkage |

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/newtools.md, PolicyRule:no_secrets_in_storage

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

**runtime artifact index** authoritative record families:

```text
artifacts_project_state.v1:{project_id} {
  project_id: string,
  projection_freshness: "current" | "refreshing" | "stale",
  projection_health: "healthy" | "degraded" | "unavailable",
  artifacts: [{
    artifact_id: string,
    artifact_type: string,
    run_id?: string,
    thread_id?: string,
    node_id?: string,
    attempt_id?: string,
    worktree_id?: string,
    lane_id?: string,
    repo_id?: string,
    path_ref?: string,
    branch_ref?: string,
    baseline_ref?: string
  }]
}

projector.checkpoint.runtime_artifacts:{project_id} {
  project_id: string,
  projection_freshness: "current" | "refreshing" | "stale",
  projection_health: "healthy" | "degraded" | "unavailable"
}
```

**worktree record** and **lane record** authoritative fields:

```text
worktree_record.v1:{project_id}:{worktree_id} {
  project_id: string,
  worktree_id: string,
  lane_id?: string,
  repo_id?: string,
  path_ref?: string,
  branch_ref?: string,
  baseline_ref?: string
}

lane_record.v1:{project_id}:{lane_id} {
  project_id: string,
  lane_id: string,
  worktree_id?: string,
  repo_id?: string,
  path_ref?: string,
  branch_ref?: string,
  baseline_ref?: string
}

worktree_projection.v1:{project_id}:{worktree_id} {
  project_id: string,
  worktree_id: string,
  projection_freshness: "current" | "refreshing" | "stale",
  projection_health: "healthy" | "degraded" | "unavailable"
}

lane_projection.v1:{project_id}:{lane_id} {
  project_id: string,
  lane_id: string,
  projection_freshness: "current" | "refreshing" | "stale",
  projection_health: "healthy" | "degraded" | "unavailable"
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

ContractRef: Plans/Runtime_Artifacts_Panel.md#4. redb key and projector, Plans/WorktreeGitImprovement.md#4.1 Assistant-created worktree lifecycle

### Runtime artifact and projection storage scope

Required fields:
- artifact_type
- repo_id
- path_ref
- branch_ref
- baseline_ref

Canonical terms and values:
- artifacts_project_state.v1:{project_id}
- projector.checkpoint.runtime_artifacts:{project_id}

Labels:
- runtime artifact index
- worktree record
- lane record

Behavioral rules:
- Runtime-artifact indexing and durable worktree/lane identity are storage-owned families.
- Projection state and projector checkpoints must be first-class rather than panel-owned leftovers.

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

### Naming and migration rules (terminal/storage keys)
Storage migrations are forward-only and monotonic.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Required rules:
- New fields must be additive first; destructive renames require a migration note in the same section that introduces them.
- Keys MUST keep stable semantic names across runtime, persistence, and events unless this plan explicitly defines a translation layer.
- `session_id`, `thread_id`, `run_id`, `message_id`, `step_id`, `tool_call_id`, `approval_id`, `provider_session_id`, `terminal_session_id`, and `dev_session_id` keep their existing meanings everywhere they appear.
- If two subsystems need different terminology, the owner doc must define the mapping explicitly rather than silently overloading a shared field name.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### Storage-owned rewrite contract
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

