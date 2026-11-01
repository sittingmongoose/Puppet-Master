# Shard 089: DL-270 storage profile: compression, durability, payloads, pages, mirrors, analytics, engines, media, gates and placement (2026-10-31)

Source: `Plans/storage-plan.md`

Source lines: L28317-L29215

Source SHA256: `4c20fece81a7639df6076c086b49200a5fa865fb4a53a528df8ba930133370de`

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
  DL-270 card 1. SeglogFrameV2 reserves a compression descriptor now, before any writer ships: a flags bit that
  marks a compressed payload, a codec id and a dictionary id (SP-346), so compression can be switched on later
  without a format migration; until a later decision admits it, a frame with that bit set is unsupported. The
  active segment keeps the Case L-2 flags=0 uncompressed profile, so recovering the live segment never depends on
  a dictionary. When a segment closes, a background job repacks it into a sealed container (SP-346) of seekable
  zstd level 3 blocks of about 256 KiB with a sequence and thread index, verifies that the repacked copy decodes
  to the same EventRecord bytes, sequence and order, and only then retires the uncompressed bytes. Cold segments
  use zstd level 9 in seekable 1 MiB frames; deep archives, exports and backups may use zstd long-distance
  matching with a 2^27 window. PM never compresses above level 9: level 19 measured 3-11% smaller for about 40
  times the CPU. Repacking and compression run only on sealed data, never on the commit path and never under the
  aggregate canonical-store lock. Write-time compression with trained dictionaries may be enabled later behind the
  same flag. OpenZL is a cold-tier prototype only, behind its own codec id, revisited at OpenZL 1.0. Measured on
  real Codex and Claude Code history: 3.4-7.2 times smaller at 64 KB-1 MiB block granularity, a 50-message page
  still opening in under 1 ms, for about 25-40 ms of one idle core per MB repacked. SP-346 defines the exact
  descriptor and container bytes.
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
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 05aa90cf844b3b65b0bad394fc43136669d2f228b2cccfe7a7acdfe80c22efe4 (decision packet)"
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
  writes. This amends SP-236's acknowledgement rule and SP-286's two source barriers; acknowledgement waits only
  for the segment sync, plus SP-337's pack sync when the group writes new payload bytes to packs. Publication and
  recovery for an ordinary group: the writer appends the group's frames and then a commit frame carrying every
  member's receipt fields, with acknowledged_at_utc chosen once when the group is sealed, and from then on those
  fields are immutable; one data sync of the segment makes the commit frame durable, and that is the issuance
  boundary, so the group is issued exactly when its commit frame is durable; receipts are exposed only after that
  sync; the receipt-custody rows are then committed in redb without a sync of their own and become durable at the
  next durability checkpoint. Recovery first makes the active segment and recent packs durable with a full flush,
  because a frame can survive a process crash without its sync having returned, then scans from the last manifest
  checkpoint: a group whose valid commit frame lies within the durable tail is issued, and its missing custody
  rows are rebuilt from that frame, identical to the ones exposed; a group without a valid commit frame after that
  flush is treated as never issued, and Case L-2 truncates its tail; on macOS that includes an ordinary group
  acknowledged and then lost to a power cut within its class, which recovery cannot tell apart, and because
  nothing durable and nothing barrier-class can refer to such a group, its identities are released and a retry
  under one of its keys is new work; custody rows without a durable commit frame are corruption and fence, within
  the range recovery scans; rows for groups before the manifest's latest publication, including lawfully retired
  or compacted source (Case L-3), replay from the rows alone. A barrier-class group also takes a full flush and
  commits its custody rows durably before acknowledging. The manifest is promoted only at creation, rotation and
  structural changes. Restoring a backup rebuilds custody rows beyond its redb snapshot from the restored
  segments' commit frames. A durability checkpoint, a full flush of the active segment and of packs written since
  the last one followed by a durable redb commit, starts within 1 s of the first acknowledgement it would cover,
  and once 8 MiB of acknowledged segment bytes or 64 MiB of non-durable redb writes are outstanding, so a backlog
  passes those amounts only by the transaction in flight, before every manifest publication and at clean shutdown;
  these are fixed owner values in the storage registry's storage_profile. Every durable redb commit, in either
  redb file, follows a full flush of the segments and packs written since the last one, so no durable row outlives
  the frames it depends on, and an ordinary group lost on macOS leaves no durable trace; each such commit holds
  the group gate from its flush until it returns, so no group is acknowledged in between. On macOS the checkpoint
  bounds what a power loss can drop to about the last second of ordinary groups; on every OS it bounds redb's
  non-durable backlog. These are healthy-operation targets: while a checkpoint is overdue, running late or
  failing, new acknowledgements wait for it, so slow or failing I/O stretches the window only by the stall; a
  failed checkpoint is an I/O failure that storage health shows, retried until it succeeds. This sequence
  supersedes Case L's per-group manifest promotion and its redb-commit issuance boundary; storage-plan's First
  append receipt custody section and CV-339 follow it, and SP-347 defines the commit frame. Pinned contract
  snapshots that still describe the earlier sequence, such as
  goal_certified_event_coordinator_contracts/protocol.md (F5b, F5c and its post-append prerequisite), keep their
  bytes until their owners recertify them; SP-336 governs where they differ, and the routes they describe are not
  built as written: an implementation follows SP-336 and the profile is recertified before that route is enabled.
  On Linux and Windows every acknowledged group survives power loss.
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
  - "After kill -9, torn writes or a crash while a store is created, no acknowledged group is lost, duplicated or corrupted."
  - "After a simulated power cut nothing is reordered or corrupted, no barrier-class group is lost, and only on macOS may ordinary groups after the last full flush be missing."
  - "Receipt-custody rows rebuilt after a crash are identical to the ones exposed before it."
  - "A group is issued exactly when its commit frame is durable, by the writer's sync or by recovery's flush: one whose frame survives is issued with the receipts sealed in it, and one whose frame does not survive is treated as never issued, which on macOS can include an acknowledged ordinary group lost within its class."
  - "In healthy operation on macOS a checkpoint starts within 1 s of the first acknowledgement it covers and once 64 MiB of non-durable redb writes accumulate; while one is overdue or failing, no new acknowledgement is given."
  - "After a macOS power loss no durable row refers to a missing ordinary group."
  - "A durable redb commit never persists a row that depends on a group acknowledged after its full flush, in either redb file."
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
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 05aa90cf844b3b65b0bad394fc43136669d2f228b2cccfe7a7acdfe80c22efe4 (decision packet)"
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
  summaries and conversation compaction point at the parent's records and payloads instead of copying them, and
  moving a thread to another project or scope re-points its references and writes a lineage record, without
  copying stored events or payloads or rewriting their history. A payload's bytes and index entry are durable
  before any record that references it is acknowledged: the group either syncs the pack first or carries the new
  bytes in its own segment frames and moves them into packs at seal, so a crash never leaves a reference to
  missing bytes, and pack bytes no durable record references are dropped once no hold applies. Deleting content
  releases its references at once, and payload bytes that no live record or hold still references are physically
  removed within the deleting owner's deadline, 24 hours for a deleted thread, by rewriting the packs that hold
  them; a removal that fails is disclosed and retried. Text payloads are compressed with zstd level 3;
  already-compressed media is stored as is. Content-defined chunking is used only for large files that change and
  for safe-point snapshots. This sets SP-227's ManagedOutputRef cap at 16 KiB. Evidence: images were 1.4 GB, 46%
  of one T3 Code user's database within a week; six Codex subagent files reached 62.8 GB, 97.8% of it repeated
  records; base64 was 53-67% of session bytes in this machine's samples.
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
  - "A crash between writing payload bytes and the referencing record never leaves a reference to missing bytes."
  - "Unheld, unreferenced payload bytes of deleted content are physically gone within the owner's deadline."
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
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 05aa90cf844b3b65b0bad394fc43136669d2f228b2cccfe7a7acdfe80c22efe4 (decision packet)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c (card text and options)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637 (Jared's answers)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/opus/REPORT.md, SHA-256 0af8522bf4ff4d5deb44346305c7e93d6c0aeb0dcf03905f6e008980cb562155 (base64 share of session bytes)"
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
  newest page and display state), one small page-index row per sealed page (its sequence range and item count),
  sealed pages of 50 items stored as zstd-compressed blocks of at most 256 KiB, split into chunk rows of at most
  16 KiB that one range scan reads back (SP-340), and a hot tail of unsealed items. Each item in a page carries a
  display header: role, kind, timestamps, a short summary, summaries of collapsed sections, and references to
  attachments and payloads. The chat renders from headers and loads full bodies from the event log or payload
  store only when they are expanded or scrolled to. Opening a thread reads thread_head, the hot tail and the
  newest page, and never replays the thread's events. Run views and agent transcripts that show a thread's items
  read the same pages. The pages are a registry-declared derived family rebuilt from seglog when their format
  changes. ACD-242 makes load-older paging mandatory over these pages. A CI benchmark that fails the build gates
  the open path on a 100k-event thread: first page within 150 ms at p95, warm or cold, reading at most 2 MiB, as
  card 4 says. A jump to an older item resolves its page from the page-index rows and loads a bounded window
  around it; sequential load-older is for adjacent scrolling. Measured: a prototype opened the newest 50 of 100k
  real Codex events in 5.9-6.7 ms, reading about 200 KB, against 2.3 s to replay; full records in place of display
  headers overflowed 99 of 2,000 pages.
gui_related: true
gui_classification_reason: "Determines how fast a long chat opens and how older messages page in."
split_recommended: false
depends_on: [SP-026, ACD-242]
unblocks: []
acceptance_criteria:
  - "Opening a thread never replays its events."
  - "A 100k-event thread shows its first page within 150 ms at p95, warm or cold, reading at most 2 MiB, in CI."
  - "Pages rebuild from seglog after a format change, and losing them loses no canonical data."
  - "A page holds display headers and references, not full bodies."
  - "A jump to any item reads a bounded number of pages, however far back it is."
  - "No render-page value, thread_head, page-index row or page chunk, exceeds 16 KiB."
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
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 05aa90cf844b3b65b0bad394fc43136669d2f228b2cccfe7a7acdfe80c22efe4 (decision packet)"
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
  in-app record inspector. SP-339 owns the pm verbs and what they read: they never write to PM's stores (pm export
  writes only the output the user names), they mask sensitive metadata unless asked for a fuller profile, and
  while PM runs they ask the running server instead of opening its stores; Release_Supply_Chain packages the pm
  program, and the command catalog records that they are not cmd.* commands. The in-app inspector opens a record
  through cmd.storage.open_value, can copy the shown, redacted record as JSON, and leaves bulk export to pm
  export. These stay files: interop and configuration that people or other tools edit, such as plugin manifests,
  .mcp.json and user-editable settings; git-committed project deliverables; bootstrap and recovery manifests such
  as index_meta.json and the seglog CURRENT and manifest; storage integrity findings, which must be writable when
  the main store is broken; and exports. Measured: 5,000 small JSON files took 64 times the write time and 2.3
  times the space of one appended file, and on Windows the first read of every new file cost 4.2-5.4 ms more,
  which the test attributes to Defender (inferred; no A/B test was possible). Jared, 2026-10-30: "We also should
  likely not be using a bunch of json files, that seems worse than a well structured DB."
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
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 05aa90cf844b3b65b0bad394fc43136669d2f228b2cccfe7a7acdfe80c22efe4 (decision packet)"
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
  explicit cache size and opens with quick repair on. New stores are created atomically (SP-336). Store compaction
  runs under the maintenance lease when fragmentation telemetry, file bytes against live bytes, passes a
  threshold, and only while PM is idle. redb's compact() needs exclusive access, so it never runs on a busy store:
  a derived file is rebuilt instead, and a canonical file is compacted by copying its live records into a new file
  that is swapped in during a brief pause within SP-342's limits. Families that keep a whole document under one
  key, such as settings:v1 and config:v1, split it into per-key rows or store it by reference; the storage
  registry's storage_profile records which. Each storage family has a disk budget. Budgets, the fragmentation
  threshold and cache sizes are fixed owner values, shown read-only, not settings. Storage health (F3-457) shows
  usage, budget, reclaimable bytes and the last store compaction, with a verified reclaim action that sends the
  existing cmd.storage.compaction.request with the current retention policy reference. Derived families are held
  within their budgets by eviction and rebuild. Canonical budgets are advisory: a canonical family at or over its
  budget raises a notice and offers reclaim within one maintenance cycle, and PM never refuses a write or prunes
  canonical history because of a budget. Daily usage totals are a canonical family (UF-108). The storage
  registry's storage_profile holds the values: each family's redb file, storage group and value limit, and twelve
  storage groups with advisory canonical and hard derived budgets. Measured: 128-130 of 301 redb families stored
  JSON text; redb held 1-8 KiB values at 1.56 times their size; deleting half a store returned no space until
  compact(); compacting a 3 GB store took 21.7 s with 328 MB of RAM and no extra disk, against 109.6 s for SQLite
  VACUUM, whose disk use peaked at 4.71 GB, 1.5 times the database.
gui_related: true
gui_classification_reason: "Storage health shows usage, budgets, reclaimable bytes and a reclaim action."
split_recommended: false
depends_on: [SP-015, SP-337]
unblocks: []
acceptance_criteria:
  - "Writing a redb value over its family's declared limit fails."
  - "Deleting the derived redb file and restarting rebuilds it with no canonical loss."
  - "Store compaction runs only under the maintenance lease while PM is idle, never stalls commits beyond SP-342's limits, and reports the space it returned."
  - "Storage health shows each family's usage against its budget and its reclaimable bytes."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-storage-profile-check.py"
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
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 05aa90cf844b3b65b0bad394fc43136669d2f228b2cccfe7a7acdfe80c22efe4 (decision packet)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c (card text and options)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637 (Jared's answers)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/vm-media-REPORT.md, SHA-256 bb27abc69a8204a6598ffea1bad173c490836d9cc6a16ca4d0b60deb7c5666bd"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/vm-crash-REPORT.md, SHA-256 8b0b9d24c5351baf9fb19f4c64ea4ea44f6483a22b3afe3e424c9c307a83c0cd"
preserved_exact_tokens:
  - "compact()"
  - "cmd.storage.compaction.request"
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
  go to Parquet plus Tantivy, with no file per item. Usage, per Jared's note and his follow-up answer: the Usage
  page and widgets read redb rollups updated as each usage.event lands, and their totals, windows and charts never
  scan raw history. Detailed usage records follow the existing Keep usage history for setting,
  ai.usage.usage-retention (90 days by default), in the event log and the Parquet archive alike, and daily usage
  totals per account, provider and model are canonical records, backed up and never rebuilt from events, kept
  whatever it says (UF-108). The Scout pilot had already reached 12-13k JSON files.
gui_related: true
gui_classification_reason: "Adds SQL over the user's history and keeps usage history fast and complete."
split_recommended: false
depends_on: [SP-026]
unblocks: []
acceptance_criteria:
  - "The Parquet archive and DuckDB state rebuild from seglog with no canonical loss."
  - "The Usage page and widgets read rollups and never scan raw events."
  - "Detailed usage records follow ai.usage.usage-retention in the event log and the archive, and daily usage totals are never pruned."
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
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 05aa90cf844b3b65b0bad394fc43136669d2f228b2cccfe7a7acdfe80c22efe4 (decision packet)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c (card text and options)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637 (Jared's answers)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answer-replies-2026-10-31.json, SHA-256 c51138b79bba5efa55662f3cd7ef04bd67f8afc6c9dc76fb34e42d1de99d0db4 (the reply to the card 7 note)"
preserved_exact_tokens:
  - "Parquet"
  - "DuckDB"
  - "ai.usage.usage-retention"
negative_constraints:
  - "Do not make the Parquet archive or DuckDB authoritative."
  - "Do not prune daily usage totals."
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
  over 50 ms. No corruption: no lost, duplicated or corrupted acknowledged event after kill -9, torn writes or a
  crash while a store is created, and after a power cut nothing reordered or corrupted and nothing lost beyond
  what SP-336's durability classes allow; recovery is bounded. No bloat: space comes back on purpose, under
  budgets, without blocking PM: store compaction runs while idle, rebuilds derived files or copies live records
  into a new file, and never rewrites a busy store exclusively. SP-344 turns them into release gates. SQLite and
  SQLite-format engines such as libSQL and Turso stay banned for PM-owned stores. Measured: SQLite checkpoint
  stalls of 48-78 ms p99 on the commit path; VACUUM of a 3 GB store took 109.6 s with disk use peaking at 1.5
  times the database; Turso 0.8.3 read single rows 12-19 times slower than SQLite, took 3.3 times as long to
  VACUUM, and its BEGIN CONCURRENT commits stalled 1.35-1.81 s at p99. Two narrow exceptions: PM may read other
  tools' SQLite files, such as Codex, T3 Code, Cursor and OpenCode history, for import, only through a read-only
  connection or a copy, never writing to them; and a user may run an optional pm export --sqlite. Spec_Lock's
  forbid_sqlite is unchanged. Jared, 2026-10-30: "I banned sqlite because it is slow, has serious contention and
  lock issues, and I have seen them corrupt frequently. I have used so many programs that have been completely
  ruined because they use sqlite. For example, plex is very very held back by its DB."
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
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 05aa90cf844b3b65b0bad394fc43136669d2f228b2cccfe7a7acdfe80c22efe4 (decision packet)"
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
  is kept only when its pixels match the original exactly, otherwise the original stays. Evidence-class media, any
  capture cited by a receipt, Goal evidence or a test run, keeps its exact original bytes. Recordings use hardware
  AV1 or HEVC encoding, with thumbnails for lists. All of it lives in the payload store (SP-337). Measured on 80
  real screenshots: lossless WebP was 1.79 times smaller than PNG (median 2.01), pixel-identical, decoding in 17
  ms; lossless JPEG XL reached 1.51 times at 220 ms to decode; lossless AVIF came out larger than PNG.
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
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 05aa90cf844b3b65b0bad394fc43136669d2f228b2cccfe7a7acdfe80c22efe4 (decision packet)"
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
  within 150 ms at p95, warm or cold; commit confirmation p99 at most 50 ms; no storage-caused UI stall over 50
  ms; no lost, duplicated or corrupted acknowledged event after kill -9, torn writes and crashes while a store is
  created; after simulated power cuts, including cuts between pack, segment and redb writes, nothing reordered or
  corrupted, no reference to missing payload bytes and no loss beyond SP-336's durability classes; derived
  families within their budgets; and any canonical family over its budget raising the notice and reclaim offer
  within one maintenance cycle. These are SP-342's four requirements as pass or fail tests. The 2026-10-30 crash
  tests found the store-creation bug that SP-336 fixes, which this suite keeps from coming back.
gui_related: false
gui_classification_reason: "Defines release gates; no visible surface."
split_recommended: false
depends_on: [SP-336, SP-338, SP-342]
unblocks: []
acceptance_criteria:
  - "A release build fails if any gate fails on any of the three OSes."
  - "The suite includes crashes during store creation."
  - "The suite cuts power between pack, segment and redb writes and checks SP-336's durability classes."
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
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 05aa90cf844b3b65b0bad394fc43136669d2f228b2cccfe7a7acdfe80c22efe4 (decision packet)"
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
  may still be set, but nothing relies on them: measured, Spotlight still indexed all 5,000 test files in a folder
  holding .metadata_never_index, using 9.8-15.3 CPU seconds against 19.3-21.1 in a plain folder, while a .noindex
  folder kept it to 0.18-0.26; Windows Search used 33 CPU seconds per 5,000 files with or without the flag; and
  the first read of every new file cost 4.2-5.4 ms more, which the Windows test attributes to Defender (inferred).
  This covers the app data root and every store under it, including project-scoped stores, which live under the
  app data root keyed by project (SP-015); PM adds no .noindex directory or other marker inside a user's project
  folder. PM changes no system setting and asks for no Defender exclusion. SP-015 names the exact roots:
  ~/Library/Application Support/puppet-master.noindex/ on macOS, %LOCALAPPDATA%/puppet-master/ on Windows and
  $XDG_DATA_HOME/puppet-master/ on Linux, with project-scoped stores under <data root>/projects/<project_id>/.
gui_related: false
gui_classification_reason: "Defines where data is stored; no visible surface."
split_recommended: false
depends_on: [SP-015, SP-023]
unblocks: []
acceptance_criteria:
  - "On macOS no store under the app data root sits outside a directory ending in .noindex."
  - "On Windows the app data root is under the user's AppData."
  - "PM never changes Defender, Spotlight or Windows Search settings."
  - "PM adds no .noindex directory or other marker inside a user's project folder."
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
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 05aa90cf844b3b65b0bad394fc43136669d2f228b2cccfe7a7acdfe80c22efe4 (decision packet)"
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

### SP-346 - Frame Compression Descriptor And The Sealed Segment Container

```yaml
plan_unit_id: SP-346
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DL-270 card 1 companion: the exact byte fields. Per-frame descriptor, reserved now and admitted later: in the
  48-byte SeglogFrameV2 prefix, flags bit 0 (0x01) marks a compressed payload; byte +44 is payload_codec (1 =
  zstd; 0 and 2-255 unassigned), byte +45 is reserved and 0, and bytes +46 to +47 are dictionary_id, an unsigned
  little-endian 16-bit id (0 = no dictionary; 1-65535 name trained dictionaries kept durable in the store's
  dictionary table and never reused). With bit 0 clear, bytes +44 to +47 stay 0 as today. With bit 0 set,
  payload_length and payload_crc32 cover the stored compressed bytes, and decoding yields the canonical
  MessagePack EventRecord within the existing caps. Until a later decision admits a write-time compression
  profile, a frame with bit 0 set is unsupported_flags, so first-profile writers and readers are unchanged. Sealed
  segment container: when a segment closes, segment repack writes <segment>.pmz with a 96-byte little-endian
  header: magic PMSEGZ1 followed by a zero byte at 0; container_version 1 at 8; codec 1 (zstd) at 9; level at 10,
  3 warm or 9 cold; container_flags at 11, bit 0 marking the archive form; block_target_bytes (u32) at 12, 262,144
  warm or 1,048,576 cold; dictionary_id (u16) at 16; reserved u16 0 at 18; block_count (u32) at 20;
  segment_generation (u64) at 24; source_length (u64) at 32; source_sha256 (32 bytes) at 40; index_offset (u64) at
  72; header_crc32 (u32) at 80, over the header with bytes 80 to 83 zeroed; and 12 reserved zero bytes at 84. Then
  come block_count complete zstd frames, each with content size and checksum and each decompressing to a byte
  range of the source segment that starts and ends on frame boundaries, and at index_offset the block index: a
  canonical MessagePack array of [source_offset, source_length, block_offset, block_length, first_sequence,
  last_sequence, thread_ids], followed by its CRC-32, the zlib (ISO-HDLC) CRC of the index bytes stored
  little-endian, which ends the file. Repack verifies that the blocks decompress, in order, to exactly
  source_length bytes whose SHA-256 is source_sha256 and that every frame re-validates, and rebuilds the block
  index from the decoded frames, requiring every entry's offsets, lengths, sequence range and thread set to equal
  the written index; only then does it rename the container into place, sync the parent directory and retire the
  source. Frames inside a container keep their original bytes, so flags stay 0 apart from commit frames (SP-347).
  Cold repack rewrites a container at level 9 with 1 MiB blocks. The archive form (container_flags bit 0) is one
  long-distance zstd stream with a 2^27 window and no block index, for exports and backups only, never a live read
  path: its header has block_count 1, block_target_bytes 0 and index_offset 0, and the single zstd frame, with
  content size and checksum, runs from byte 96 to the end of the file. Readers find a sequence or a thread through
  the block index and decompress only those blocks; the sealed_segment_index planned family caches that index.
  Plans/seglog_frame_v2_wire_fixtures.json container_cases hold warm, cold and archive containers of the group
  fixture's segment; compressed bytes depend on the zstd version, so readers verify the header, index, CRCs and
  decompressed SHA-256, never compressed-byte equality.
gui_related: false
gui_classification_reason: "Defines stored byte layouts; no visible surface."
split_recommended: false
depends_on: [SP-335, SP-236]
unblocks: []
acceptance_criteria:
  - "A frame with flags bit 0 set is unsupported_flags until a write-time compression profile is admitted."
  - "With flags bit 0 clear, prefix bytes +44 to +47 are zero, as the existing reserved fixture proves."
  - "A container's blocks decompress, in order, to bytes whose SHA-256 equals source_sha256 before the source segment is retired."
  - "No block splits a frame, and every frame in a container re-validates byte for byte."
  - "The archive form is never opened on a live read path."
  - "A container whose block index disagrees with its decoded frames never replaces its source."
  - "An archive container's header has block_count 1, block_target_bytes 0 and index_offset 0."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: seglog_container_format_drift
reasoning_tier: high
context_scope: dl270_frame_companions
implementation_surfaces:
  - "Plans/storage-plan.md"
  - "Plans/Contracts_V0.md"
  - "Plans/seglog_frame_v2_wire_fixtures.json"
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "Plans/storage-plan.md#SP-335"
  - "Plans/storage-plan.md#SP-336"
preserved_exact_tokens:
  - "PMSEGZ1"
  - "payload_codec"
  - "dictionary_id"
  - "source_sha256"
  - "unsupported_flags"
negative_constraints:
  - "Do not admit flags bit 0 without a later decision admitting a write-time compression profile."
  - "Do not retire a source segment before its container verifies."
owner_hints:
  - "Plans/storage-plan.md"
```

### SP-347 - The Group Commit Control Frame

```yaml
plan_unit_id: SP-347
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DL-270 card 2 companion: the commit frame of SP-336's publication sequence. A commit group ends with a control
  frame: a SeglogFrameV2 frame with flags bit 1 (0x02) whose header is [1, event_id, "pm.seglog.group_commit",
  "pm.seglog.control.v1", "1.0.0", "pm.seglog.group_commit.v1", "application", null], with event_id
  seglog_commit:<segment_generation>:<last_sequence>. Its sequence_id equals the sequence of the group's last
  member: the strictly-greater rule applies between EventRecord frames, and a control frame carries exactly the
  sequence of the frame before it. Its payload is canonical MessagePack of a map with commit_group_id,
  segment_name, segment_generation, manifest_generation (the manifest generation current at seal),
  durability_class (ordinary or barrier), acknowledged_at_utc (selected once at seal, RFC 3339 UTC with
  milliseconds), first_sequence, last_sequence members, an array of [event_id, sequence_id, byte_offset] in
  sequence order, and restore_admission, null or CV-339's closed object for a group published through a restore
  occurrence's fresh-operation admission. Each member's eleven AppendReceipt fields follow from it: the group
  fields, the member triple, durability_state synced (CV-339), and durable_end_offset, the end of the group's last
  member frame, where the commit frame begins. A frame with bit 1 and any other header is control_header_mismatch;
  bits 0 and 1 together are unsupported_flags while bit 0 is unadmitted. Readers skip control frames when
  replaying EventRecords and use them for issuance, receipts and recovery only; a valid commit frame within the
  durable tail marks its group issued (SP-336). CV-339's group_digest is unchanged: its members tile the span from
  durable_start_offset, the first member frame's offset, to durable_end_offset, and the commit frame, which is not
  a member, begins exactly at durable_end_offset; the commit frame does not store the digest, its own CRCs protect
  its bytes, and every custody row must equal its terms. The segment's durable watermark is the end of its last
  valid commit frame. Plans/seglog_frame_v2_wire_fixtures.json group_cases hold a one-member group with its commit
  frame, the receipts it yields and its group digest, plus a torn and a missing commit frame that leave the group
  unissued; it is a wire and recovery vector, a one-member barrier group built from the schema-only base event,
  and complete custody rows are rebuilt by their own recipes.
gui_related: false
gui_classification_reason: "Defines a stored control frame; no visible surface."
split_recommended: false
depends_on: [SP-336, SP-286]
unblocks: []
acceptance_criteria:
  - "Every member's eleven AppendReceipt fields rebuild identically from its group's commit frame."
  - "A commit frame's sequence equals the sequence of the frame before it, and EventRecord sequences stay strictly increasing."
  - "A frame with flags bit 1 and a non-control header fails as control_header_mismatch."
  - "Replay of EventRecords skips control frames."
  - "A group published through restore admission carries its restore_admission in its commit frame, and every group's group_digest recomputes from its own frames."
  - "The fixture group's receipts and group digest reproduce from its bytes."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: group_commit_frame_drift
reasoning_tier: high
context_scope: dl270_frame_companions
implementation_surfaces:
  - "Plans/storage-plan.md"
  - "Plans/Contracts_V0.md"
  - "Plans/seglog_frame_v2_wire_fixtures.json"
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "Plans/storage-plan.md#SP-335"
  - "Plans/storage-plan.md#SP-336"
preserved_exact_tokens:
  - "pm.seglog.group_commit"
  - "pm.seglog.control.v1"
  - "control_header_mismatch"
  - "acknowledged_at_utc"
negative_constraints:
  - "Do not give a control frame its own EventRecord sequence."
  - "Do not replay a control frame as an EventRecord."
owner_hints:
  - "Plans/storage-plan.md"
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-270, ContractName:Plans/storage-plan.md#SP-026, ContractName:Plans/storage-plan.md#SP-236, ContractName:Plans/assistant-chat-design.md#ACD-242, ContractName:Plans/usage-feature.md#UF-108, ContractName:Plans/Backup_Restore_System.md#BRS-031, ContractName:Plans/Remote_Access_System.md#RAS-016
