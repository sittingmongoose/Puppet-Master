# Shard 089: DL-270 storage profile: compression, durability, payloads, pages, mirrors, analytics, engines, media, gates and placement (2026-10-31)

Source: `Plans/storage-plan.md`

Source lines: L28194-L28848

Source SHA256: `ca68ac358108653694afff0c685514c0b2d893fd5edc0e7344b19960a4d384b6`

---

## DL-270 storage profile: compression, durability, payloads, pages, mirrors, analytics, engines, media, gates and placement (2026-10-31)

Jared answered the storage review's 13 decision cards on 2026-10-31 and chose the recommended option on each (Plans/Decision_Log.md#DL-270). SP-335 to SP-345 own the resulting storage rules; ACD-242, UF-108, BRS-031 and RAS-016 own the chat, usage, backup and transport parts. Where earlier text in this document conflicts, these units win; the dated notes at SP-026, SP-236, SP-023, section 2.1, the frequency-table rules, the Case L admission order, the implementation checklist and the Shared Integration Runtime mapping point here. The sweep of the remaining mentions, the exact SeglogFrameV2 codec and dictionary fields, and the registry, schema and fixture companions are pending.

### SP-335 - Seglog Compression Profile And Seal-Time Repack

```yaml
plan_unit_id: SP-335
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DL-270 card 1. SeglogFrameV2 admits a compression profile now, before any writer ships: a flags bit that marks a
  compressed payload, a codec id and a dictionary id, so compression can be switched on later without a format
  migration. The active segment keeps the Case L-2 flags=0 uncompressed profile, so recovering the live segment
  never depends on a dictionary. When a segment closes, a background job repacks it into seekable zstd level 3
  blocks of about 256 KiB with a sequence and thread index, verifies that the repacked copy decodes to the same
  EventRecord bytes, sequence and order, and only then retires the uncompressed bytes. Cold segments use zstd
  level 9 in seekable 1 MiB frames; deep archives, exports and backups may use zstd long-distance matching with a
  2^27 window. PM never compresses above level 9: level 19 measured 3-11% smaller for about 40 times the CPU.
  Repacking and compression run only on sealed data, never on the commit path and never under the aggregate
  canonical-store lock. Write-time compression with trained dictionaries may be enabled later behind the same
  flag. OpenZL is a cold-tier prototype only, behind its own codec id, revisited at OpenZL 1.0. Measured on real
  Codex and Claude Code history: 3.4-7.2 times smaller at 64 KB-1 MiB block granularity, a 50-message page still
  opening in under 1 ms, for about 25-40 ms of one idle core per MB repacked. The exact codec and dictionary byte
  fields are a schema and fixture companion of this unit.
gui_related: false
gui_classification_reason: "Defines the event log's stored byte profile and background repack; no visible surface."
split_recommended: false
depends_on: [SP-026, SP-236]
unblocks: []
acceptance_criteria:
  - "A repacked sealed segment decodes to the same EventRecord bytes, sequence IDs and order as before the repack."
  - "Recovering an active segment needs no dictionary."
  - "No compression or repack work runs on the commit path or under the aggregate canonical-store lock."
  - "No stored tier uses a zstd level above 9."
  - "The uncompressed bytes of a sealed segment are retired only after its repacked copy verifies."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: seglog_compression_profile_drift
reasoning_tier: high
context_scope: dl270_storage_profile
implementation_surfaces:
  - "Plans/storage-plan.md"
  - "Plans/Contracts_V0.md"
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 377105f30d488726efdc246c00004cf5a87fb8585f2d50984a21c66de8190eca (decision packet)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c (card text and options)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637 (Jared's answers)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/vm-media-REPORT.md, SHA-256 bb27abc69a8204a6598ffea1bad173c490836d9cc6a16ca4d0b60deb7c5666bd"
preserved_exact_tokens:
  - "SeglogFrameV2"
  - "flags=0"
  - "zstd"
negative_constraints:
  - "Do not compress the active segment until write-time compression is enabled behind the flag."
  - "Do not run compression or repack under the aggregate canonical-store lock."
owner_hints:
  - "Plans/storage-plan.md"
```

### SP-336 - One Data Sync Per Commit Group, Full Flush For Barrier Events, Atomic Store Creation

```yaml
plan_unit_id: SP-336
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DL-270 card 2 and the 2026-10-30 crash tests. A commit group is acknowledged after one data sync of its segment
  bytes. The durable watermark is carried in the segment's own frames, so recovery finds it by validating frames
  forward from the last manifest checkpoint; the manifest is written and synced only at segment creation, rotation
  and other structural changes, not once per group, and parent-directory durability stays with those structural
  changes. Barrier-class events, the approvals, safe points and receipts the UI waits on, get a full flush:
  F_FULLFSYNC on macOS, FlushFileBuffers on Windows and fdatasync on Linux. Ordinary groups on macOS use
  F_BARRIERFSYNC: they survive app and operating-system crashes, and a sudden power loss can drop only the most
  recent ordinary groups, never reorder or corrupt them. Streamed model output is batched into commit groups and
  never written one frame per token. New stores, redb files, seglog roots and payload packs alike, are created
  atomically: built in <name>.creating/, synced, renamed into place, then the parent directory synced. A crash in
  the first 25 ms of creating a store left 38 of 200 redb and 34 of 200 fjall stores unopenable in testing,
  against 0 of 200 for SQLite and the seglog prototype. redb opens with quick repair enabled, which cut recovery
  from 93/194 ms to 3/20 ms p50/p99. Measured: F_FULLFSYNC p50 2.9 ms and p99 3.9 ms, F_BARRIERFSYNC 0.41 ms and a
  32-event group with a barrier 0.62 ms on a MacBook Air; FlushFileBuffers p50 0.48 ms and p99 0.88 ms on Windows;
  0 of 134,423 acknowledged commits lost, duplicated or corrupted across 4,250 kills, LazyFS power cuts and torn
  writes. This amends SP-236's acknowledgement rule; SP-286 first-receipt custody keeps its own durability, and
  its exact interplay with in-segment watermarks is a companion of this unit.
gui_related: false
gui_classification_reason: "Defines commit durability and store creation; no visible surface."
split_recommended: false
depends_on: [SP-236, SP-286]
unblocks: []
acceptance_criteria:
  - "An ordinary commit group is acknowledged after exactly one data sync of its segment bytes."
  - "The manifest is not synced once per group; it is synced at creation, rotation and structural changes."
  - "Approvals, safe points and receipts the UI waits on are acknowledged only after a full flush."
  - "A crash at any point while creating a store leaves either no store or a complete, openable one."
  - "No acknowledged group is lost, duplicated or corrupted after kill -9, simulated power cuts or torn writes, except that a power loss on macOS may drop the most recent ordinary groups without reordering them."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: commit_durability_profile_drift
reasoning_tier: high
context_scope: dl270_storage_profile
implementation_surfaces:
  - "Plans/storage-plan.md"
  - "Plans/Architecture_Invariants.md"
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 377105f30d488726efdc246c00004cf5a87fb8585f2d50984a21c66de8190eca (decision packet)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c (card text and options)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637 (Jared's answers)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/vm-crash-REPORT.md, SHA-256 8b0b9d24c5351baf9fb19f4c64ea4ea44f6483a22b3afe3e424c9c307a83c0cd"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/mac-REPORT.md, SHA-256 d697785c0131d449a4ba6162d7cd8f91cb84515db4bd1afe80285e057f21e319"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/win-REPORT.md, SHA-256 aee9a79954085e5207f76abe798ad5a24f0984ca5e200b0e9b98289499811153"
preserved_exact_tokens:
  - "F_FULLFSYNC"
  - "F_BARRIERFSYNC"
  - "FlushFileBuffers"
  - "fdatasync"
  - "<name>.creating/"
negative_constraints:
  - "Do not write one frame per streamed token."
  - "Do not acknowledge a barrier-class event before its full flush."
owner_hints:
  - "Plans/storage-plan.md"
```

### SP-337 - Store-Once Payloads In Content-Addressed Packs

```yaml
plan_unit_id: SP-337
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DL-270 card 3. An EventRecord carries at most 16 KiB of inline body. Larger tool output, file reads, images and
  other payloads go to a content-addressed payload store, and the record carries a reference: BLAKE3 id, byte size
  and media type. Base64 payloads are decoded to binary at ingest, and a base64 body inline in a record is an
  admission error. Payloads live in append-only pack files, not one file per payload. Identical payloads are
  stored once and reference-counted; garbage collection honours retention holds, legal holds and backups. Forks,
  summaries and compaction point at the parent's records and payloads instead of copying them. Text payloads are
  compressed with zstd level 3; already-compressed media is stored as is. Content-defined chunking is used only
  for large files that change and for safe-point snapshots. This sets SP-227's ManagedOutputRef cap at 16 KiB.
  Evidence: images were 1.4 GB, 46% of one T3 Code user's database within a week; six Codex subagent files reached
  62.8 GB, 97.8% of it repeated records; base64 was 53-67% of session bytes in this machine's samples.
gui_related: false
gui_classification_reason: "Defines payload storage and references; no visible surface."
split_recommended: false
depends_on: [SP-227]
unblocks: []
acceptance_criteria:
  - "No stored EventRecord carries more than 16 KiB of inline body."
  - "Writing a record with an inline base64 body fails admission."
  - "Two identical payloads are stored once."
  - "A fork or compaction adds references, not copies of the parent's payloads."
  - "Garbage collection never deletes a payload that a hold, a backup or a live record still reaches."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: payload_duplication_and_inline_bloat
reasoning_tier: high
context_scope: dl270_storage_profile
implementation_surfaces:
  - "Plans/storage-plan.md"
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 377105f30d488726efdc246c00004cf5a87fb8585f2d50984a21c66de8190eca (decision packet)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c (card text and options)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637 (Jared's answers)"
preserved_exact_tokens:
  - "16 KiB"
  - "BLAKE3"
  - "ManagedOutputRef"
negative_constraints:
  - "Do not store base64 inline in records."
  - "Do not store one file per payload."
owner_hints:
  - "Plans/storage-plan.md"
```

### SP-338 - Render-Ready Chat Pages And The Open-Path Gate

```yaml
plan_unit_id: SP-338
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DL-270 card 4. Each thread has a derived, rebuildable render-page store: a thread_head record (counts, the
  newest page and display state), sealed pages of 50 items stored as zstd-compressed blocks of at most 256 KiB,
  and a hot tail of unsealed items. Each item in a page carries a display header: role, kind, timestamps, a short
  summary, summaries of collapsed sections, and references to attachments and payloads. The chat renders from
  headers and loads full bodies from the event log or payload store only when they are expanded or scrolled to.
  Opening a thread reads thread_head, the hot tail and the newest page, and never replays the thread's events. The
  pages are a registry-declared derived family rebuilt from seglog when their format changes. ACD-242 makes
  load-older paging mandatory over these pages. A CI benchmark that fails the build gates the open path on a
  100k-event thread: first page p95 at most 150 ms warm and 500 ms cold, reading at most 2 MiB. Measured: a
  prototype opened the newest 50 of 100k real Codex events in 5.9-6.7 ms, reading about 200 KB, against 2.3 s to
  replay; full records in place of display headers overflowed 99 of 2,000 pages.
gui_related: true
gui_classification_reason: "Determines how fast a long chat opens and how older messages page in."
split_recommended: false
depends_on: [SP-026, ACD-242]
unblocks: []
acceptance_criteria:
  - "Opening a thread never replays its events."
  - "A 100k-event thread shows its first page within 150 ms p95 warm and 500 ms p95 cold, reading at most 2 MiB, in CI."
  - "Pages rebuild from seglog after a format change, and losing them loses no canonical data."
  - "A page holds display headers and references, not full bodies."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: long_chat_open_latency
reasoning_tier: high
context_scope: dl270_storage_profile
implementation_surfaces:
  - "Plans/storage-plan.md"
  - "Plans/assistant-chat-design.md"
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 377105f30d488726efdc246c00004cf5a87fb8585f2d50984a21c66de8190eca (decision packet)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c (card text and options)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637 (Jared's answers)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/vm-media-REPORT.md, SHA-256 bb27abc69a8204a6598ffea1bad173c490836d9cc6a16ca4d0b60deb7c5666bd"
preserved_exact_tokens:
  - "thread_head"
  - "50 items"
  - "256 KiB"
negative_constraints:
  - "Do not replay a thread's events to open it."
  - "Do not treat render pages as canonical history."
owner_hints:
  - "Plans/storage-plan.md"
  - "Plans/assistant-chat-design.md"
```

### SP-339 - No Always-On JSON Copies; Dump, Inspect, Tail And Export

```yaml
plan_unit_id: SP-339
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DL-270 card 5. PM writes no always-on JSONL mirror and no JSON mirror files of canonical state. The
  storage/jsonl mirror that projectors emitted, the state JSON files under .puppet-master/state/,
  active-agents.json, agent-messages.json, filesafe-events.jsonl, usage.jsonl and Scout's one file per item are
  retired as live files. redb families whose values are JSON text move to MessagePack or typed fields. People read
  stored state through commands, pm db dump, pm inspect, pm tail and pm export (JSONL or JSON on request), and an
  in-app record inspector. These stay files: interop and configuration that people or other tools edit, such as
  plugin manifests, .mcp.json and user-editable settings; git-committed project deliverables; bootstrap and
  recovery manifests such as index_meta.json and the seglog CURRENT and manifest; storage integrity findings,
  which must be writable when the main store is broken; and exports. Measured: 5,000 small JSON files took 64
  times the write time and 2.3 times the space of one appended file, and on Windows Defender added 4.2-5.4 ms to
  the first read of every new file. Jared, 2026-10-30: "We also should likely not be using a bunch of json files,
  that seems worse than a well structured DB."
gui_related: true
gui_classification_reason: "Removes mirror files people could open and adds the inspect, dump, tail and export commands and an in-app inspector."
split_recommended: false
depends_on: [SP-015, SP-026]
unblocks: []
acceptance_criteria:
  - "No projector writes a continuous JSONL or JSON mirror of canonical state."
  - "pm db dump, pm inspect, pm tail and pm export read the same records the stores hold."
  - "No redb family stores JSON text as its value encoding."
  - "Storage integrity findings can still be written when the main store cannot open."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: json_mirror_bloat
reasoning_tier: high
context_scope: dl270_storage_profile
implementation_surfaces:
  - "Plans/storage-plan.md"
  - "Plans/usage-feature.md"
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 377105f30d488726efdc246c00004cf5a87fb8585f2d50984a21c66de8190eca (decision packet)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c (card text and options)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637 (Jared's answers)"
preserved_exact_tokens:
  - "pm db dump"
  - "pm inspect"
  - "pm tail"
  - "pm export"
  - "usage.jsonl"
negative_constraints:
  - "Do not reintroduce an always-on mirror as a debugging aid."
  - "Do not move integrity findings into the main store."
owner_hints:
  - "Plans/storage-plan.md"
```

### SP-340 - redb Value Limits, Two Files, Quick Repair And Scheduled Compaction

```yaml
plan_unit_id: SP-340
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DL-270 card 6. Every redb family declares a maximum value size, at most 16 KiB; larger values go to the payload
  store (SP-337). Canonical, non-rebuildable families and derived, rebuildable families live in two separate redb
  files, so the derived file can be deleted and rebuilt without touching canonical state. Each database sets an
  explicit cache size and opens with quick repair on. New stores are created atomically (SP-336). A maintenance
  job under the maintenance lease runs compact() when PM is idle and when fragmentation telemetry, file bytes
  against live bytes, passes a threshold. Each storage family has a disk budget, and storage health shows usage,
  budget, reclaimable bytes and the last compaction, with a verified reclaim action. Measured: 128-130 of 301 redb
  families stored JSON text; redb held 1-8 KiB values at 1.56 times their size; deleting half a store returned no
  space until compact(); compacting a 3 GB store took 21.7 s with 328 MB of RAM and no extra disk, against 109.6 s
  and 4.71 GB of extra disk for SQLite VACUUM.
gui_related: true
gui_classification_reason: "Storage health shows usage, budgets, reclaimable bytes and a reclaim action."
split_recommended: false
depends_on: [SP-015, SP-337]
unblocks: []
acceptance_criteria:
  - "Writing a redb value over its family's declared limit fails."
  - "Deleting the derived redb file and restarting rebuilds it with no canonical loss."
  - "Compaction runs only under the maintenance lease and reports the space it returned."
  - "Storage health shows each family's usage against its budget and its reclaimable bytes."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: redb_bloat_and_fragmentation
reasoning_tier: high
context_scope: dl270_storage_profile
implementation_surfaces:
  - "Plans/storage-plan.md"
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 377105f30d488726efdc246c00004cf5a87fb8585f2d50984a21c66de8190eca (decision packet)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c (card text and options)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637 (Jared's answers)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/vm-media-REPORT.md, SHA-256 bb27abc69a8204a6598ffea1bad173c490836d9cc6a16ca4d0b60deb7c5666bd"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/vm-crash-REPORT.md, SHA-256 8b0b9d24c5351baf9fb19f4c64ea4ea44f6483a22b3afe3e424c9c307a83c0cd"
preserved_exact_tokens:
  - "compact()"
  - "quick repair"
negative_constraints:
  - "Do not let canonical and derived families share one redb file."
owner_hints:
  - "Plans/storage-plan.md"
```

### SP-341 - Parquet Archive, DuckDB On Demand And Kept Usage History

```yaml
plan_unit_id: SP-341
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DL-270 card 7 and Jared's card 7 note. When a segment seals, PM writes its events to Parquet files by family and
  month, an analytics archive. DuckDB runs embedded, on demand and read-only over that archive for ad-hoc SQL over
  the user's own history, offline. The archive and anything DuckDB builds are derived from seglog and never
  authoritative. Scout's fetched pages go to the payload store, stored once across plans; passages and judgments
  go to Parquet plus Tantivy, with no file per item. Usage, per Jared's note: the Usage page and widgets keep
  reading redb rollups updated as each usage.event lands, and never scan raw history. usage.event records are
  exempt from raw-event pruning: they stay in seglog's cold tier and in the Parquet archive, and daily usage
  totals per account, provider and model are kept forever. UF-108 amends usage-feature's 90-day raw-event window
  to match. The Scout pilot had already reached 12-13k JSON files.
gui_related: true
gui_classification_reason: "Adds SQL over the user's history and keeps usage history fast and complete."
split_recommended: false
depends_on: [SP-026]
unblocks: []
acceptance_criteria:
  - "The Parquet archive and DuckDB state rebuild from seglog with no canonical loss."
  - "The Usage page and widgets read rollups and never scan raw events."
  - "No usage.event is pruned, and daily usage totals are kept forever."
  - "Scout stores no file per item."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: analytics_and_usage_history_loss
reasoning_tier: high
context_scope: dl270_storage_profile
implementation_surfaces:
  - "Plans/storage-plan.md"
  - "Plans/usage-feature.md"
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 377105f30d488726efdc246c00004cf5a87fb8585f2d50984a21c66de8190eca (decision packet)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c (card text and options)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637 (Jared's answers)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answer-replies-2026-10-31.json, SHA-256 c51138b79bba5efa55662f3cd7ef04bd67f8afc6c9dc76fb34e42d1de99d0db4 (the reply to the card 7 note)"
preserved_exact_tokens:
  - "Parquet"
  - "DuckDB"
  - "usage.event"
negative_constraints:
  - "Do not make the Parquet archive or DuckDB authoritative."
  - "Do not prune usage.event records."
owner_hints:
  - "Plans/storage-plan.md"
  - "Plans/usage-feature.md"
```

### SP-342 - Storage Engine Requirements And The SQLite Ban

```yaml
plan_unit_id: SP-342
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DL-270 card 9. Jared's reasons for the SQLite ban become four requirements that every PM-owned store, seglog,
  redb, the payload packs, Tantivy, the Parquet archive and any engine adopted later, must pass on Windows, macOS
  and Linux. Fast: no stall on the commit path, with commit confirmation p99 at most 50 ms and no checkpoint or
  compaction in that path. No contention or lock-ups: one writer with group commit, readers on snapshots that
  never wait for the writer, maintenance that never holds the writer lock for long, and no storage-caused UI stall
  over 50 ms. No corruption: no lost, duplicated or corrupted acknowledged event after kill -9, simulated power
  cuts, torn writes or a crash while a store is created, with bounded recovery. No bloat: space comes back on
  purpose, under budgets, without an exclusive rewrite that blocks PM or needs a second full copy of the data.
  SP-344 turns them into release gates. SQLite and SQLite-format engines such as libSQL and Turso stay banned for
  PM-owned stores. Measured: SQLite checkpoint stalls of 48-78 ms p99 on the commit path; VACUUM of a 3 GB store
  took 109.6 s and 4.71 GB of extra disk; Turso 0.8.3 was slower than SQLite on every measure, with BEGIN
  CONCURRENT commits stalling 1.35-1.81 s at p99. Two narrow exceptions: PM may read other tools' SQLite files,
  such as Codex, T3 Code, Cursor and OpenCode history, for import, only through a read-only connection or a copy,
  never writing to them; and a user may run an optional pm export --sqlite. Spec_Lock's forbid_sqlite is
  unchanged. Jared, 2026-10-30: "I banned sqlite because it is slow, has serious contention and lock issues, and I
  have seen them corrupt frequently. I have used so many programs that have been completely ruined because they
  use sqlite. For example, plex is very very held back by its DB."
gui_related: false
gui_classification_reason: "States engine policy and its requirements; no visible surface."
split_recommended: false
depends_on: [SP-236]
unblocks: []
acceptance_criteria:
  - "Every PM-owned store passes the four requirements in SP-344's gates on all three OSes."
  - "No PM-owned store uses SQLite or a SQLite-format engine."
  - "Imports never write to another tool's SQLite file."
  - "Jared's words are quoted verbatim; the four requirements are the review's wording of them."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: storage_engine_policy_drift
reasoning_tier: high
context_scope: dl270_storage_profile
implementation_surfaces:
  - "Plans/storage-plan.md"
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 377105f30d488726efdc246c00004cf5a87fb8585f2d50984a21c66de8190eca (decision packet)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c (card text and options)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637 (Jared's answers)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/vm-media-REPORT.md, SHA-256 bb27abc69a8204a6598ffea1bad173c490836d9cc6a16ca4d0b60deb7c5666bd"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/mac-REPORT.md, SHA-256 d697785c0131d449a4ba6162d7cd8f91cb84515db4bd1afe80285e057f21e319"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/win-REPORT.md, SHA-256 aee9a79954085e5207f76abe798ad5a24f0984ca5e200b0e9b98289499811153"
preserved_exact_tokens:
  - "forbid_sqlite"
  - "pm export --sqlite"
  - "I banned sqlite because it is slow, has serious contention and lock issues, and I have seen them corrupt frequently. I have used so many programs that have been completely ruined because they use sqlite. For example, plex is very very held back by its DB."
negative_constraints:
  - "Do not admit a SQLite or SQLite-format engine for a PM-owned store."
  - "Do not write to another tool's SQLite file during import."
owner_hints:
  - "Plans/storage-plan.md"
```

### SP-343 - Lossless WebP Screenshots And Exact Evidence Media

```yaml
plan_unit_id: SP-343
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DL-270 card 11. Screenshots are stored as lossless WebP, transcoded in the background after capture; a transcode
  is kept only when its pixels match the original exactly, otherwise the original stays. Evidence-class media
  keeps its exact original bytes. Recordings use hardware AV1 or HEVC encoding, with thumbnails for lists. All of
  it lives in the payload store (SP-337). Measured on 80 real screenshots: lossless WebP was 1.79 times smaller
  than PNG (median 2.01), pixel-identical, decoding in 17 ms; lossless JPEG XL reached 1.51 times at 220 ms to
  decode; lossless AVIF came out larger than PNG.
gui_related: false
gui_classification_reason: "Defines how images and recordings are stored; no visible change."
split_recommended: false
depends_on: [SP-337]
unblocks: []
acceptance_criteria:
  - "A stored screenshot transcode decodes to exactly the original pixels."
  - "Evidence-class media is stored byte for byte as captured."
  - "Transcoding never runs on the capture or commit path."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: media_storage_bloat
reasoning_tier: high
context_scope: dl270_storage_profile
implementation_surfaces:
  - "Plans/storage-plan.md"
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 377105f30d488726efdc246c00004cf5a87fb8585f2d50984a21c66de8190eca (decision packet)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c (card text and options)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637 (Jared's answers)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/vm-media-REPORT.md, SHA-256 bb27abc69a8204a6598ffea1bad173c490836d9cc6a16ca4d0b60deb7c5666bd"
preserved_exact_tokens:
  - "lossless WebP"
  - "AV1"
  - "HEVC"
negative_constraints:
  - "Do not transcode evidence-class media."
owner_hints:
  - "Plans/storage-plan.md"
```

### SP-344 - Storage Release Gates On Every OS

```yaml
plan_unit_id: SP-344
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DL-270 card 12. Every release is gated on Windows, macOS and Linux by a storage test suite that fails the build:
  20 producer streams writing while a 100k-event thread pages, a backup runs and maintenance compacts; first page
  p95 at most 150 ms warm and 500 ms cold; commit confirmation p99 at most 50 ms; no storage-caused UI stall over
  50 ms; no lost, duplicated or corrupted acknowledged event after kill -9, simulated power cuts, torn writes and
  crashes while a store is created; and every family within its disk budget. These are SP-342's four requirements
  as pass or fail tests. The 2026-10-30 crash tests found the store-creation bug that SP-336 fixes, which this
  suite keeps from coming back.
gui_related: false
gui_classification_reason: "Defines release gates; no visible surface."
split_recommended: false
depends_on: [SP-336, SP-338, SP-342]
unblocks: []
acceptance_criteria:
  - "A release build fails if any gate fails on any of the three OSes."
  - "The suite includes crashes during store creation."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: storage_requirements_unproven
reasoning_tier: high
context_scope: dl270_storage_profile
implementation_surfaces:
  - "Plans/storage-plan.md"
  - "Plans/Automated_Testing_System.md"
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 377105f30d488726efdc246c00004cf5a87fb8585f2d50984a21c66de8190eca (decision packet)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c (card text and options)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637 (Jared's answers)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/vm-crash-REPORT.md, SHA-256 8b0b9d24c5351baf9fb19f4c64ea4ea44f6483a22b3afe3e424c9c307a83c0cd"
preserved_exact_tokens:
  - "20 producer streams"
  - "100k-event"
negative_constraints:
  - "Do not release with a storage gate skipped on any OS."
owner_hints:
  - "Plans/storage-plan.md"
```

### SP-345 - Data Placement Away From Desktop Indexers

```yaml
plan_unit_id: SP-345
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DL-270 card 13. On macOS every PM store directory sits inside a directory whose name ends in .noindex, which
  Spotlight skips. On Windows, PM data lives under the user's AppData, outside Windows Search's default scope. On
  Linux it stays in the XDG data directory. Stores keep their data in a few large pack files rather than many
  small files, so Defender scans rarely. The .metadata_never_index marker and FILE_ATTRIBUTE_NOT_CONTENT_INDEXED
  may still be set, but nothing relies on them: measured, Spotlight indexed 5,000 of 5,000 files despite
  .metadata_never_index, using 19 CPU seconds, and a .noindex folder cut that to 0; Windows Search used 33 CPU
  seconds per 5,000 files with or without the flag; Defender added 4.2-5.4 ms to the first read of every new file.
  PM changes no system setting and asks for no Defender exclusion. The exact paths are a companion change in
  SP-015 and the documents that name them.
gui_related: false
gui_classification_reason: "Defines where data is stored; no visible surface."
split_recommended: false
depends_on: [SP-015, SP-023]
unblocks: []
acceptance_criteria:
  - "On macOS no PM store directory is outside a directory ending in .noindex."
  - "On Windows PM data is under the user's AppData."
  - "PM never changes Defender, Spotlight or Windows Search settings."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: indexer_cpu_and_scan_overhead
reasoning_tier: high
context_scope: dl270_storage_profile
implementation_surfaces:
  - "Plans/storage-plan.md"
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 377105f30d488726efdc246c00004cf5a87fb8585f2d50984a21c66de8190eca (decision packet)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c (card text and options)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637 (Jared's answers)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/mac-REPORT.md, SHA-256 d697785c0131d449a4ba6162d7cd8f91cb84515db4bd1afe80285e057f21e319"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/win-REPORT.md, SHA-256 aee9a79954085e5207f76abe798ad5a24f0984ca5e200b0e9b98289499811153"
preserved_exact_tokens:
  - ".noindex"
  - ".metadata_never_index"
  - "FILE_ATTRIBUTE_NOT_CONTENT_INDEXED"
  - "AppData"
negative_constraints:
  - "Do not rely on .metadata_never_index or the not-content-indexed flag."
  - "Do not change system indexer or antivirus settings."
owner_hints:
  - "Plans/storage-plan.md"
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-270, ContractName:Plans/storage-plan.md#SP-026, ContractName:Plans/storage-plan.md#SP-236, ContractName:Plans/assistant-chat-design.md#ACD-242, ContractName:Plans/usage-feature.md#UF-108, ContractName:Plans/Backup_Restore_System.md#BRS-031, ContractName:Plans/Remote_Access_System.md#RAS-016
