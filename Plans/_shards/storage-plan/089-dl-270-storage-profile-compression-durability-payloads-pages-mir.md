# Shard 089: DL-270 storage profile: compression, durability, payloads, pages, mirrors, analytics, engines, media, gates and placement (2026-10-31)

Source: `Plans/storage-plan.md`

Source lines: L28057-L30588

Source SHA256: `7c617767338b5d1043e6b1162392292f6e30e8dca30e9a83e7cde79fc1906627`

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
canonical_text: |-
  DL-270 card 3. An EventRecord carries at most 16 KiB of inline body. Larger tool output, file reads, images and other payloads go to a content-addressed payload store, and the record carries a reference: BLAKE3 id, byte size and media type. Base64 payloads are decoded to binary at ingest, and a base64 body inline in a record is an admission error. Payloads live in append-only pack files, not one file per payload. Identical payloads are stored once and reference-counted; garbage collection honours retention holds, legal holds and backups. Forks, summaries and conversation compaction keep parent record/payload references. Approved N13 chat conversion is the precise exception to the former universal no-event-copy move rule: preserve immutable source events/results/Usage, seal the source conversation for Undo, and materialize full destination-owned conversation records with explicit origin lineage. Same-store records share payload refs; cross-Server transfer verifies exact payload bytes before cutover. A destination copy is not a new execution, billing event or rewritten historical source. Independent Goal/Plan/Crew/schedule/permission custody follows its own source/hold/backup rules beyond chat Undo expiry. A payload's bytes and index entry are durable before any record that references it is acknowledged: the group either syncs the pack first or carries the new bytes in its own segment frames and moves them into packs at seal, so a crash never leaves a reference to missing bytes, and pack bytes no durable record references are dropped once no hold applies. Deleting content releases its references at once, and payload bytes that no live record or hold still references are physically removed within the deleting owner's deadline, 24 hours for a deleted thread, by rewriting the packs that hold them; a removal that fails is disclosed and retried. Text payloads are compressed with zstd level 3; already-compressed media is stored as is. Content-defined chunking is used only for large files that change and for safe-point snapshots. This sets SP-227's ManagedOutputRef cap at 16 KiB. Evidence: images were 1.4 GB, 46% of one T3 Code user's database within a week; six Codex subagent files reached 62.8 GB, 97.8% of it repeated records; base64 was 53-67% of session bytes in this machine's samples.
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
- Plans/Decision_Log.md#DL-270
- /mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 05aa90cf844b3b65b0bad394fc43136669d2f228b2cccfe7a7acdfe80c22efe4
  (decision packet)
- /mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c
  (card text and options)
- /mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637
  (Jared's answers)
- /mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/opus/REPORT.md, SHA-256 0af8522bf4ff4d5deb44346305c7e93d6c0aeb0dcf03905f6e008980cb562155
  (base64 share of session bytes)
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-work-packages;
  /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md; C-F04,D-F06,E-F11
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
canonical_text: |-
  DL-270 card 6. Every redb family declares a maximum value size, at most 16 KiB; larger values go to the payload store (SP-337). Canonical, non-rebuildable families and derived, rebuildable families live in two separate redb files, so the derived file can be deleted and rebuilt without touching canonical state. Each database sets an explicit cache size and opens with quick repair on. New stores are created atomically (SP-336). Store compaction runs under the maintenance lease when fragmentation telemetry, file bytes against live bytes, passes a threshold, and only while PM is idle. redb's compact() needs exclusive access, so it never runs on a busy store: a derived file is rebuilt instead, and a canonical file is compacted by copying its live records into a new file that is swapped in during a brief pause within SP-342's limits. Families that keep a whole document under one key, such as settings:v1 and config:v1, split it into per-key rows or store it by reference; the storage registry's storage_profile records which. Each storage family has a disk budget. Budgets, the fragmentation threshold and cache sizes are fixed owner values, shown read-only, not settings. Storage health (F3-457) shows usage, budget, reclaimable bytes and the last store compaction, with a verified reclaim action that sends the existing cmd.storage.compaction.request with the current retention policy reference. Derived families are held within their budgets by eviction and rebuild. Canonical budgets are advisory: a canonical family at or over its budget raises a notice and offers reclaim within one maintenance cycle, and PM never refuses a write or prunes canonical history because of a budget. Daily usage totals are a canonical family (UF-108). The storage registry's storage_profile holds the values: each family's redb file, storage group and value limit, and twelve storage groups with advisory canonical and hard derived budgets. Measured: 128-130 of 301 redb families stored JSON text; redb held 1-8 KiB values at 1.56 times their size; deleting half a store returned no space until compact(); compacting a 3 GB store took 21.7 s with 328 MB of RAM and no extra disk, against 109.6 s for SQLite VACUUM, whose disk use peaked at 4.71 GB, 1.5 times the database. The stated Project key/schema/codec is the preserved Project edition. For an owner-admitted app record, SP-349/351/352 and CV-366 select a distinct application family/key/source graph; they do not relax this edition or imply that every family named here is app-capable. Actual Project-native SCM, WorkNode, PRD, Wizard and Orchestrator records remain Project-bound. Same canonical-versus-derived classification, limits, holds, writer/maintenance leases and coherent backup apply; no empty Project or focus/main fallback.
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
- Plans/Decision_Log.md#DL-270
- /mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 05aa90cf844b3b65b0bad394fc43136669d2f228b2cccfe7a7acdfe80c22efe4
  (decision packet)
- /mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c
  (card text and options)
- /mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637
  (Jared's answers)
- /mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/vm-media-REPORT.md, SHA-256 bb27abc69a8204a6598ffea1bad173c490836d9cc6a16ca4d0b60deb7c5666bd
- /mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/tests/vm-crash-REPORT.md, SHA-256 8b0b9d24c5351baf9fb19f4c64ea4ea44f6483a22b3afe3e424c9c307a83c0cd
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-work-packages;
  /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md; A-F08,B-F06,B-F07,B-F08,B-F09,B-F10,B-F11,C-F01,C-F04,C-F05,C-F06,C-F07,C-F08,C-F09,C-F10,E-F11,D-F06
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


### SP-348 - Sparse Settings Levels Writers History And Join Custody

```yaml
plan_unit_id: SP-348
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  SSYS-002/059/060 own semantics. This unit alone freezes physical Settings level keys: config:everywhere; config:computer:server:{hex(server_id)}; config:computer:execution_host:{hex(execution_host_id)}; config:device:{hex(client_id)}; config:project:{hex(project_id)}. Hex is lowercase complete UTF-8 identity; tagged Server/Execution Host domains never collide. Level keys identify sparse own values, not an Execution Environment level. The Everywhere writer is the explicitly chosen settings home; Server/Host Computer levels have their exact owning connection/writer; Device uses its actual Client without a fake writer_server_id; Project own values remain its Vault. Stored paths are values tied to actual Host, never route/identity authority.
  Per-setting canonical values use settings_own.v1:{hex(level_key)}:{hex(setting_id)}, family settings_own, with selected own value, source, actor/time, setting_revision, inventory/version, owner validation and immutable operation/result refs. A level head settings_level_head.v1:{hex(level_key)} contains writer/role generation, level revision and bounded payload refs for revision/index metadata, not a second value store. Per-setting CAS detects same-setting races while independent edits remain possible; theme_pair commits both halves together at one writer. Defaults stay bundled, own values to-default remain distinguishable from absence. General settings:v1/config:v1 whole-document keys are historical read/coordinator inputs, never simultaneous live writers; preserve SP-340 per-setting/section split and at most 16 KiB values.
  pm.settings_level_snapshot.v1, pm.project_settings_snapshot.v2, pm.settings_effective_value.v1 and pm.settings_differences_index.v1 are exact logical contracts at Settings_System; snapshots are point-in-time sparse reads over canonical rows with identical value/source/revision key sets and immutable hashes, not a second mutable writer. Larger manifests/maps use SP-337 refs. Differences, follower mirrors and client caches are redacted bounded read-only derived records with source revision/as-of/last verified freshness; absence/offline/index staleness never becomes write success. Secret/key/profile/pairing/memory/notebook bodies are excluded from values, caches, event/index/preview/history/export. Normal Settings history keeps its current owner retention; no new invented duration. One multi-Computer operation reports done/not_reached/refused and queues nothing.
  Settings-home role/trust generation and move/join custody are canonical exact Server/Settings owner records. Only verified copy/readback with old-writer fence can switch the home role once; home loss elects nobody, stale-copy acknowledgement cannot prove fencing. Join operation uses settings_join.v1:{hex(home_server_id)}:{hex(join_id)} and immutable preimages/difference/choice/result manifest under the settings home. The accepted Undo window is 30 days, plus independent references/holds; inverse checks current setting/owner revisions and reports changed-since exclusions. Ordinary change Undo remains under its owner policy. No join copies executable trust, installation, credentials or another Project’s records as authority.
  settings.layer.changed is application-only (registered by DL-300), carrying level/key/changed IDs/revisions/hash/redacted summary and receipt refs; a Project level is metadata, not a second scope envelope. Legacy settings.updated is not inferred as an alias and stays owner_contract_missing until separately resolved. Full Server Backup includes home/Everywhere/Computer canonical values/history/join and referenced assets; Project Backup includes only Project own values/assets and converted canonical records. Device writer/caches preserve their own policy. Registry entries must bind exact schemas/encoding/retention/disk budgets/writer/backup before production; no native availability follows from this prose.
gui_related: false
gui_classification_reason: Defines data, identity, custody, version or source contracts; no presentation ownership.
depends_on:
- SSYS-059
- SSYS-060
- SP-340
- SP-337
unblocks: []
acceptance_criteria:
- Tagged level keys and exact one writer/role distinguish Server/Host/Device/Project.
- Sparse row/head/snapshot/mirror/index storage has one value authority and same-key revision maps.
- Join Undo/backup/retention is explicit and contains no secrets or offline writes.
validation_surfaces:
- 'Phase 2: focused owner/companion semantic fixtures and scripts/pm-projects-refresh-contracts.py'
- 'Phase 2: python3 scripts/pm-plan-index.py validate'
risk_class: scope_authority_and_custody_drift
reasoning_tier: high
context_scope: projects_refresh_application_workflows
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-F01
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-F03
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-F08
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F02
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F03
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F02
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/E-requests.md#E-F05
preserved_exact_tokens:
- config:everywhere
- config:computer:server:{hex(server_id)}
- config:computer:execution_host:{hex(execution_host_id)}
- config:device:{hex(client_id)}
- config:project:{hex(project_id)}
- pm.settings_level_snapshot.v1
- pm.project_settings_snapshot.v2
- pm.settings_differences_index.v1
- settings.layer.changed
- 30 days
negative_constraints:
- No global/Project collapsed snapshot, live JSON mirror, automatic failover or credential/content export.
- Acceptance does not prove native handlers, Event Authority admission, durability, readiness or governance certification.
owner_hints:
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-365


### SP-349 - App Chat Root Everyday Runtime Recovery And UI Custody

```yaml
plan_unit_id: SP-349
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Application work uses the same seglog, two redb files, payload packs, render pages/index engines and storage lock/maintenance/backup owners as Project counterparts, under SP-345’s app-data root and actual Server. App scope is not a Project Vault and holds no project_home_server_id before conversion. The attached table is the exclusive physical app key map for ordinary chat/root/recovery/UI/notebook/browser/runtime records; version/schema/source selection is CV-366. Raw missing Project interpolation, main-root fallback, per-thread infinite app buckets and new live JSON are forbidden. Source/context authority uses exact Host/Environment/roots, not the configured display path alone.
  Place/folder records bind actual Server/Host/Environment and canonical path identity/currentness, draft_id before first message and thread_id thereafter. Concurrent first save/command adopts one folder exactly once. Visible chat folders live outside PM data in the Computer’s configured no-project chat root; no talk-only folder, rename relocation or implicit delete. Disconnected chat metadata remains named/read-only; continuation needs the real current writer. Request/outbox continuity remains the existing thread owner; facade preview is local and does not create its own storage family. Client close does not stop the Server’s admitted work.
  One app Server-wide counterpart bucket per family supplies the same limits, budget/TTL/retention/holds and backup classification as the Project bucket, not a reset per chat. An app family with a Project counterpart takes that counterpart's storage tier (Jared, 2026-11-04). Restore points share one 2,048 cap with the exact 7,776,000-second reference-release threshold, oldest eligible pressure and every descendant/application/preserve/legal/source/rollback/maintenance/backup hold; states/results remain available|expired|deleted|corrupt and branched|refused|failed. Web cache shares the 500 MB default with owner TTL/LRU. No other numeric cap is invented. Families whose counterpart has no hard cap retain that explicit disposition plus mandatory disk budget; unknown policy cannot be treated as unlimited. A table token owner_*_counterpart is a required F-d resolution to the existing named policy/anchor, never a new policy ID or a production registration.
  One app index builder/publication slot and source token/checkpoint domain preserve exact Server/thread/root/generation. Source read, compaction, restore/revert and FileSafe use actual absolute Host/root and all canonical source/currentness/permission/writer/Stop/recovery gates; replay rebuilds only derived views, never canonical authority. App notebook keeps its five existing parent kinds and 16 KiB inline/64 KiB request, 512-token/2 KiB capsule, 1,024-token/4 KiB combined injection limits. Memory stays thread-private with 350-token capsule and existing verification/evidence; public_safe taught rules remain distinct. Cross-read grants never authorize notebook/private-memory access.
  Browser creation/reset, Eval, terminal and layout adopt their whole app CV-366 source graphs or remain unavailable. Protected auth is not app browser automation, capture, restore or export content. Live PTY/process/kernel/controller/ports remain on original Computer through conversion; future sessions re-resolve. App Home/panels/boards use exact Server/app/workspace keys, named layouts/presets stay per person, board snapshots match saved scope/Server only, and converted Project UI loads independently. Canonical app records/held payloads join coherent Full Server Backup, derived pages/indexes rebuild; counterpart source/dedupe/rollback/retention and deletion deadlines remain. Chat Undo expiry cannot purge independently retained notebook/checkpoint/task/audit authority.
  Developer-session application families are dev_session_record_application and eval_session_record_application, using DebugSessionRecordStorageApplicationV1 and EvalSessionRecordStorageApplicationV1 in Plans/developer_session_application_contracts.schema.json. They inherit the Project counterpart tier later_gui_or_feature_projection, RP-DEBUG-30D, mandatory canonical backup/restore and independent holds. The source graph selects the actual debugger/evaluator broker for lifecycle, source/lease/generation, read/checkpoint and retention. BRS-033 restores exact history/session metadata as stopped or reconciliation-required, never a live adapter/kernel/lease or current permission grant. No browser family is their custody and no second engine is introduced.
gui_related: false
gui_classification_reason: Defines data, identity, custody, version or source contracts; no presentation ownership.
depends_on:
- CV-365
- CV-366
- SP-337
- SP-340
- SP-338
- SP-345
unblocks: []
acceptance_criteria:
- Every admitted app row uses its exact key/schema/source/writer/read/backup/retention disposition.
- App buckets match counterpart bounds; held canonical source never evicts as a cache.
- No root/Host/thread aliasing, canonical reconstruction or unsupported native-source fallback.
validation_surfaces:
- 'Phase 2: focused owner/companion semantic fixtures and scripts/pm-projects-refresh-contracts.py'
- 'Phase 2: python3 scripts/pm-plan-index.py validate'
risk_class: scope_authority_and_custody_drift
reasoning_tier: high
context_scope: projects_refresh_application_workflows
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F04
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F07
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F08
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F09
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F10
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F11
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F12
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F02
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F05
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F10
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F11
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/E-requests.md#E-F11
preserved_exact_tokens:
- scope_partition=app
- restore_point_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(restore_point_id)}
- 2,048
- 7,776,000 seconds
- 500 MB
- 16 KiB
- BLAKE3
negative_constraints:
- No fake Project/Vault, empty key, second engine/board/database, private-memory merge or per-chat cache reset.
- Acceptance does not prove native handlers, Event Authority admission, durability, readiness or governance certification.
owner_hints:
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-365


**SP-349 exact application physical rows**

Every application key begins with its distinct versioned family prefix and actual `hex(storage_instance_id):hex(server_id)`; hex is lowercase encoding of the complete UTF-8 scalar identity, without normalization or truncation. This is separate from EventRecord’s unchanged `app` partition and `project~` encoding. Logical record references use CV-366 selected roots. The closed physical wrapper requires schema_id, schema_version=1.0.0, storage_instance_id, server_id, scope=WorkflowScopeV2(application), record; key/value/record scope and identities must agree. The physical wrapper schema_id for family `f_application` is `pm.storage_value.f.application.v1`, at `Plans/application_workflow_contracts.schema.json#/$defs/<PascalCase(f)>StorageApplicationV1`. No extra fields or self-hash are stored. Canonical rows use the canonical redb file, derived rows the derived redb file. All use CV-366’s app MessagePack physical codec, at most 16 KiB per value with larger content in SP-337 payload refs. Missing mandatory policy/disk-budget/writer/source/backup registration leaves a family unavailable; it never inherits unlimited space.

| Existing counterpart / new app family | Exact key_shape | Retention and custody |
|---|---|---|
| `chat_place` → `chat_place_application` | `chat_place.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}` | canonical; `RP-GOAL-THREAD-LIFETIME` |
| `chat_draft_place` → `chat_draft_place_application` | `chat_draft_place.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(client_id)}:{hex(draft_id)}` | canonical draft, adopted once; owner draft lifetime; `owner_draft_lifetime` |
| `chat_folder_binding` → `chat_folder_binding_application` | `chat_folder_binding.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}` | canonical; no talk-only folder; `RP-GOAL-THREAD-LIFETIME` |
| `thread_head` → `thread_head_application` | `thread_head.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}` | canonical head/source refs; renderer pages derived; `owner_thread_lifetime` |
| `chat_render_page` → `chat_render_page_application` | `chat_render_page.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(generation)}:{hex(page_id)}` | derived 50-item page; rebuilding is not lost history; `RP-PROJECTION-3GEN` |
| `thread_detail` → `thread_detail_application` | `thread_detail.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(generation)}` | derived; logical detail identity app:thread:generation; `RP-PROJECTION-3GEN` |
| `thread_attempt_record` → `thread_attempt_record_application` | `thread_attempt_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(run_id)}:{hex(attempt_id)}` | canonical actual attempt, no node fabricated; `RP-RUNTIME-365D` |
| `thread_blocked_record` → `thread_blocked_record_application` | `thread_blocked_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(run_id)}:{hex(blocked_identity)}` | canonical permission/blocked source plus derived views; `RP-AUTHORITY-INDEFINITE` |
| `requested_effective_runtime` → `requested_effective_runtime_application` | `requested_effective_runtime.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(snapshot_id)}:{snapshot_sha256}` | canonical immutable run activation; `RP-AUTHORITY-INDEFINITE` |
| `runtime_artifact_index` → `runtime_artifact_index_application` | `runtime_artifact_index.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(artifact_id)}` | derived index; artifact body follows original owner; `RP-PROJECTION-3GEN` |
| `todo_work_binding` → `todo_work_binding_application` | `todo_work_binding.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(todo_list_id)}:{hex(binding_id)}` | canonical exact owner binding; `RP-AUTHORITY-INDEFINITE` |
| `restore_point_record` → `restore_point_record_application` | `restore_point_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(restore_point_id)}` | canonical; shared Server app 2,048 bucket; `RP-RESTOREPOINT-90D-AFTER-RELEASE` |
| `restore_point_creation_commit` → `restore_point_creation_commit_application` | `restore_point_creation_commit.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(restore_point_id)}` | canonical source/append settlement; `RP-RESTOREPOINT-90D-AFTER-RELEASE` |
| `restore_point_create_result` → `restore_point_create_result_application` | `restore_point_create_result.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(command_instance_id)}` | canonical original result survives lawful point purge; `RP-AUTHORITY-INDEFINITE` |
| `restore_point_expiry_commit` → `restore_point_expiry_commit_application` | `restore_point_expiry_commit.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(restore_point_id)}` | canonical original lifecycle; `RP-RESTOREPOINT-90D-AFTER-RELEASE` |
| `restore_point_deletion_commit` → `restore_point_deletion_commit_application` | `restore_point_deletion_commit.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(restore_point_id)}` | canonical original lifecycle; `RP-RESTOREPOINT-90D-AFTER-RELEASE` |
| `restore_point_delete_result` → `restore_point_delete_result_application` | `restore_point_delete_result.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(command_instance_id)}` | canonical original result; `RP-AUTHORITY-INDEFINITE` |
| `restore_point_retention_summary` → `restore_point_retention_summary_application` | `restore_point_retention_summary.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(restore_point_id)}` | canonical independent retirement authority; `RP-RESTOREPOINT-90D-AFTER-RELEASE` |
| `restore_point_created_checkpoint` → `restore_point_created_checkpoint_application` | `restore_point_created_checkpoint.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(consumer_id)}` | derived atomic projection/checkpoint; `RP-PROJECTION-3GEN` |
| `restore_point_expired_checkpoint` → `restore_point_expired_checkpoint_application` | `restore_point_expired_checkpoint.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(consumer_id)}` | derived atomic projection/checkpoint; `RP-PROJECTION-3GEN` |
| `restore_point_deleted_checkpoint` → `restore_point_deleted_checkpoint_application` | `restore_point_deleted_checkpoint.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(consumer_id)}` | derived atomic projection/checkpoint; `RP-PROJECTION-3GEN` |
| `context_compaction` → `context_compaction_application` | `context_compaction.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(operation_id)}` | canonical exact completion/source/replay; `owner_compaction_counterpart` |
| `safe_point` → `safe_point_application` | `safe_point.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(run_id)}:{hex(attempt_id)}:{hex(safe_point_id)}` | canonical real absolute Host/root identity, distinct sp:/rp:; `owner_safe_point_counterpart` |
| `working_notebook_record` → `working_notebook_record_application` | `working_notebook_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(notebook_id)}` | canonical actual admitted parent only; `RP-AUTHORITY-INDEFINITE` |
| `working_notebook_entry_record` → `working_notebook_entry_record_application` | `working_notebook_entry_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(notebook_id)}:{hex(entry_id)}` | canonical original revisions/restrictions; `RP-AUTHORITY-INDEFINITE` |
| `notebook_checkpoint_record` → `notebook_checkpoint_record_application` | `notebook_checkpoint_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(notebook_id)}:{hex(checkpoint_id)}` | canonical checkpoint under independent holds; `RP-AUTHORITY-INDEFINITE` |
| `assistant_memory` → `assistant_memory_application` | `assistant_memory.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(memory_id)}` | canonical per-thread; no app shared corpus; `owner_memory_counterpart` |
| `home_workspace_layout` → `home_workspace_layout_application` | `home_workspace_layout.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(workspace_tab_id)}` | canonical app layout; same invariant/custody split; `RP-CONFIG-CURRENT` |
| `widget_layout` → `widget_layout_application` | `widget_layout.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(board_id)}` | canonical app board; never merged into Project; `RP-CONFIG-CURRENT` |
| `panel_state` → `panel_state_application` | `panel_state.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(panel_kind)}:{hex(workspace_tab_id)}` | current UI value; no runtime authority; `RP-CONFIG-CURRENT` |
| `editor_workspace_state` → `editor_workspace_state_application` | `editor_workspace_state.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(workspace_tab_id)}` | canonical workspace tabs, no unsaved body; `owner_editor_counterpart` |
| `editor_state` → `editor_state_application` | `editor_state.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(execution_host_id)}:{file_identity_sha256}` | canonical unsaved recovery, no reset-to-empty; `owner_editor_counterpart` |
| `filetree_state` → `filetree_state_application` | `filetree_state.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(root_id)}` | current app picker/tree UI; `RP-CONFIG-CURRENT` |
| `discovery_index` → `discovery_index_application` | `discovery_index.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(root_id)}:{hex(index_generation)}` | derived actual Host/root; one app builder slot; `owner_index_counterpart` |
| `web_cache` → `web_cache_application` | `web_cache.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{cache_key_sha256}` | derived cache one Server-wide 500 MB default bucket; `owner_web_cache_ttl_lru` |
| `terminal_session_record` → `terminal_session_record_application` | `terminal_session_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(terminal_session_id)}` | canonical session stays original Computer; `RP-TERMINAL-SESSION-90D` |
| `terminal_command_block` → `terminal_command_block_application` | `terminal_command_block.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(terminal_session_id)}:{hex(command_block_id)}` | canonical observed command source; no live PTY migration; `owner_terminal_counterpart` |
| `browser_workspace` → `browser_workspace_application` | `browser_workspace.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(profile_id)}:{hex(workspace_id)}` | canonical normal browser; protected auth excluded; `owner_browser_counterpart` |
| `browser_session` → `browser_session_application` | `browser_session.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(profile_id)}:{hex(session_id)}` | canonical actual controller/session; `owner_browser_counterpart` |
| `browser_workspace_created_index_checkpoint` → `browser_workspace_created_index_checkpoint_application` | `browser_workspace_created_index_checkpoint.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(consumer_id)}` | derived app exact source/append/index; `RP-PROJECTION-3GEN` |
| `browser_workspace_reset_index_checkpoint` → `browser_workspace_reset_index_checkpoint_application` | `browser_workspace_reset_index_checkpoint.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(consumer_id)}` | derived app exact reset/read; `RP-PROJECTION-3GEN` |
| `dev_session_record` → `dev_session_record_application` | `dev_session_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(dev_session_id)}` | canonical exact DAP adapter/target/lease; `RP-DEBUG-30D` |
| `eval_session_record` → `eval_session_record_application` | `eval_session_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(eval_session_id)}` | canonical isolated runtime/kernel/variables; `RP-DEBUG-30D` |
| `visualizer_state` → `visualizer_state_application` | `visualizer_state.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(message_id)}:{hex(visualizer_id)}` | canonical owner state/output refs; existing trust; `owner_visualizer_counterpart` |
| `application_history_projection` → `application_history_projection_application` | `application_history_projection.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(generation)}` | derived owner result view, no authority; `RP-PROJECTION-3GEN` |
| `application_attention_projection` → `application_attention_projection_application` | `application_attention_projection.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(generation)}` | derived exact work refs/freshness; `RP-PROJECTION-3GEN` |


### SP-350 - Conversion Cutover Sealed Source Undo And Payload Custody

```yaml
plan_unit_id: SP-350
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  CV-367 owns the exhaustive semantic manifest; this unit owns its durable operation and writer custody. Canonical family chat_move_operation uses chat_move_operation.v1:{hex(storage_instance_id)}:{hex(source_server_id)}:{hex(conversion_id)}. chat_move_manifest.v1 at the same identity plus {manifest_sha256} retains the immutable selected preview/source-target/owner/permission/currentness/family map in payload refs within 16 KiB. chat_move_cutover.v1 at conversion identity keeps exact source/destination writer claim generations, verified-copy boundary, committed target identity and one cutover outcome. chat_move_lineage.v1:{hex(storage_instance_id)}:{hex(thread_id)}:{hex(conversion_id)} preserves immutable source/destination binding, record map and inverse/retention/tombstone pointers. Sealed source content stays in its original canonical store, never reencoded as another Project event or a live JSON history.
  Create/check owner reservations and transfer exact selected content, including independently held payloads, before acquiring/finalizing cutover under current source/destination writer and backup/maintenance fences. Destination new Project is listed before moving its chat; destination adoption is one generation-bound publication and source live index/writer is fenced. Two physical stores may retain verified copies but never two writable thread histories. Every source/destination validates its own actual claim and refuses stale delayed work. Unknown/partial copy, owner/Stop or receipt state is paused/recovery_required; Resume/Cancel revalidate both Servers and never repeat a settled owner effect or speculate deletion. Same-store payload refs share; cross-store verified copies retain exact bytes/hash/ref lineage and all independent holds.
  Goal/Plan/Crew linked births, notebook Vault adoption, permission snapshots, timer target replacements and destination indexes use their owner subtransactions with exact result refs; conversion writes no domain body or certification itself. Pending source schedules are explicitly held/invalidated and future targets re-admitted; source occurrences and accepted audit remain. New destination records preserve original source link, not forged original operation or completion. Layout/board state is loaded from the chosen Project, never merged from app. Auth/profile/credentials/routes and Stop grants do not transfer.
  Undo basis is chat_move_undo.v1:{hex(storage_instance_id)}:{hex(source_server_id)}:{hex(conversion_id)} with created-at deadline, first-new-work fence, exact inverse preimages and owner refs. It lasts until first new work or seven days. Same-store CAS or cross-Server verified inverse needs current actual targets and both Servers; it affects only unchanged eligible effects, uses list-only Remove for a newly created Project, and never deletes remote repository/branch/backup or modified work. Do not clear source/destination pause/run latches or auto-resume on Undo. Sealed conversation content follows its existing purge/24-hour deletion deadline once released; independent canonical Goal/Plan/Crew/notebook/permission/schedule/receipt/hold/payload custody remains until its own anchor/reference policy permits deletion. Backup restores lineage/tombstone/cutover coherently and refuses activation of an obsolete source. Operation/result/replay audit is canonical non-rebuildable under existing RP-AUTHORITY-INDEFINITE; no new generic receipt engine is introduced.
gui_related: false
gui_classification_reason: Defines data, identity, custody, version or source contracts; no presentation ownership.
depends_on:
- CV-367
- SP-349
- SP-337
- SP-321
unblocks: []
acceptance_criteria:
- Operation/manifest/cutover/lineage/inverse have exact bounded canonical custody and one writer.
- Failure/restart/resume/cancel/Undo preserve settled effects, original source and target authority.
- Backups and retention avoid dual-live restoration or early independent authority purge.
validation_surfaces:
- 'Phase 2: focused owner/companion semantic fixtures and scripts/pm-projects-refresh-contracts.py'
- 'Phase 2: python3 scripts/pm-plan-index.py validate'
risk_class: scope_authority_and_custody_drift
reasoning_tier: high
context_scope: projects_refresh_application_workflows
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F04
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F07
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F08
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F09
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F07
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F09
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F11
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/E-requests.md#E-F01
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/E-requests.md#E-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/E-requests.md#E-F11
preserved_exact_tokens:
- chat_move_operation.v1
- chat_move_manifest.v1
- chat_move_cutover.v1
- chat_move_lineage.v1
- chat_move_undo.v1
- seven days
- thread_id
negative_constraints:
- No event rewrite, duplicated billing, two live source/destination writers, automatic resume or destructive Undo.
- Acceptance does not prove native handlers, Event Authority admission, durability, readiness or governance certification.
owner_hints:
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-365


### SP-351 - Application Goal Crew Coordination Source And Backup Custody

```yaml
plan_unit_id: SP-351
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  The attached rows are app siblings in the existing canonical/derived engines, not a second Goal store, coordination database or message board. GRS-086/CWR-045/OSI-440 own semantics and CV-366 freezes exact logical/source/method/hash selections. Preserve every Project family/key/source resource and original semantic/physical byte domain unchanged. App bodies retain exactly eleven fields with project_id required null; scope and Server/Host/roots are in the wrapper/context. Objective revision/origin/control/receipt remain separately typed and keep original exact scalar/text bounds and independent content/audit lifetimes. New app Goal currentness uses the CV-366 goal_body_currentness domain, never a Project hash with app substituted for project_id.
  Original Goal start joins independently accepted app intent, original source, canonical body/origin/control and content-free command custody, actual append/first receipt and SIR original terminal result. Update joins original direct Save or approved complete agent proposal, shared app body reservation/commit, progress, event/receipt and immutable terminal audit; Cancel latches real host Stop first, retains source/Stop/partial effects and hidden control, then its actual content-free fact and original result. Each family’s role/current versus retained reader follows CV-366, never event-derived objective or late recapture. Every live writer/read/cancel/backup/restore/retention edge adopts its app graph together or is unavailable. Historical-only and Project Workflow/certified graphs remain closed; ordinary app dispatch never invents WorkNode evidence. A canonical completion receipt is non-rebuildable and cannot be reconstructed from events or a disposable projection.
  Crew definition/config/team/run/participant/transcript/messages/questions/artifacts and exact requested/effective snapshots use the existing four protocols and parent ceilings. App Crew Auto is a real thread configuration with revision1, separate from Project commit or thread override-only check. Application coordination uses one sole coordinator/appender, seven actual agent families only when admitted, exact AgentMessage app definition at both canonical producer/consumer sites, 16 KiB inline and BLAKE3 refs. Agent/file/operation/snapshot/board/checkpoint keys preserve actual Server/thread/crew/run/root/Host. Read tokens/checkpoints are from their full original source and current publication, never copied authority or JSON files. Same path on another Host/root/crew does not alias.
  App Goal bodies/history/origin/control keep RP-GOAL-THREAD-LIFETIME; immutable command/update/cancel/association/permission/receipt audit keeps RP-AUTHORITY-INDEFINITE, matching original rows. Coordination events keep RP-COORDINATION-180D and derived views/checkpoints RP-PROJECTION-3GEN with complete source holds/coverage. The app bound is one Server counterpart bucket, not one per chat. No new numeric Goal/Crew cap is invented; existing explicit none plus disk budget/refuse policy remains. Full Server Backup captures canonical body/control/accepted source/Stop/receipt/association/coordination parent records and referenced payloads coherently under BRS-033, with actual app source/native replay obligations; derived projections rebuild from genuine sources only. Restore never clears a newer Stop or revives a source fenced by conversion. Linked destination records and fresh admission follow CV-367/SP-350; ordinary mutation cannot change immutable bindings or run scope. Canonical source/receipt/held payload lifetime does not end with chat Undo.
gui_related: false
gui_classification_reason: Defines data, identity, custody, version or source contracts; no presentation ownership.
depends_on:
- CV-366
- CV-367
- SP-287
- SP-294
- SP-299
- SP-304
- SP-305
- SP-320
unblocks: []
acceptance_criteria:
- All app source/body/control/append/result/read/coordination/backup edges use exact new editions or unavailable
  disposition.
- Original Project/historical/certified graph remains unchanged and ordinary bindings immutable.
- Canonical task/audit and Stop survive moves, restore and chat Undo expiry with counterpart limits.
validation_surfaces:
- 'Phase 2: focused owner/companion semantic fixtures and scripts/pm-projects-refresh-contracts.py'
- 'Phase 2: python3 scripts/pm-plan-index.py validate'
risk_class: scope_authority_and_custody_drift
reasoning_tier: high
context_scope: projects_refresh_application_workflows
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F07
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F10
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-F07
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/E-requests.md#E-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/E-requests.md#E-F11
preserved_exact_tokens:
- GoalRecordApplicationV1
- project_id=null
- owner.goal.body.mutation.application@1.0.0
- RP-GOAL-THREAD-LIFETIME
- RP-AUTHORITY-INDEFINITE
- 16 KiB
- BLAKE3
negative_constraints:
- No Goal reconstruction from events, copied source/certification/checkpoint authority, second board or live JSON.
- Acceptance does not prove native handlers, Event Authority admission, durability, readiness or governance certification.
owner_hints:
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-365


**SP-351 exact application physical rows**

Every application key begins with its distinct versioned family prefix and actual `hex(storage_instance_id):hex(server_id)`; hex is lowercase encoding of the complete UTF-8 scalar identity, without normalization or truncation. This is separate from EventRecord’s unchanged `app` partition and `project~` encoding. Logical record references use CV-366 selected roots. The closed physical wrapper requires schema_id, schema_version=1.0.0, storage_instance_id, server_id, scope=WorkflowScopeV2(application), record; key/value/record scope and identities must agree. The physical wrapper schema_id for family `f_application` is `pm.storage_value.f.application.v1`, at `Plans/application_workflow_contracts.schema.json#/$defs/<PascalCase(f)>StorageApplicationV1`. No extra fields or self-hash are stored. Canonical rows use the canonical redb file, derived rows the derived redb file. All use CV-366’s app MessagePack physical codec, at most 16 KiB per value with larger content in SP-337 payload refs. Missing mandatory policy/disk-budget/writer/source/backup registration leaves a family unavailable; it never inherits unlimited space.

| Existing counterpart / new app family | Exact key_shape | Retention and custody |
|---|---|---|
| `goal_body_record` → `goal_body_record_application` | `goal_body_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}` | canonical; `RP-GOAL-THREAD-LIFETIME` |
| `goal_objective_revision` → `goal_objective_revision_application` | `goal_objective_revision.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{revision_decimal}` | canonical; `RP-GOAL-THREAD-LIFETIME` |
| `goal_objective_origin` → `goal_objective_origin_application` | `goal_objective_origin.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}` | canonical; `RP-GOAL-THREAD-LIFETIME` |
| `goal_body_control` → `goal_body_control_application` | `goal_body_control.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}` | canonical; `RP-GOAL-THREAD-LIFETIME` |
| `goal_body_mutation_receipt` → `goal_body_mutation_receipt_application` | `goal_body_mutation_receipt.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(operation_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_start_command_custody` → `goal_start_command_custody_application` | `goal_start_command_custody.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(operation_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_update_source_audit` → `goal_update_source_audit_application` | `goal_update_source_audit.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(operation_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_update_input_content` → `goal_update_input_content_application` | `goal_update_input_content.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(operation_id)}` | canonical; `RP-GOAL-THREAD-LIFETIME` |
| `goal_update_progress` → `goal_update_progress_application` | `goal_update_progress.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(operation_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_update_terminal_audit` → `goal_update_terminal_audit_application` | `goal_update_terminal_audit.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(operation_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_cancel_source_audit` → `goal_cancel_source_audit_application` | `goal_cancel_source_audit.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(operation_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_host_stop_control` → `goal_host_stop_control_application` | `goal_host_stop_control.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}` | canonical; `RP-GOAL-THREAD-LIFETIME` |
| `goal_cancel_stop_receipt` → `goal_cancel_stop_receipt_application` | `goal_cancel_stop_receipt.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(operation_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_cancel_receipt` → `goal_cancel_receipt_application` | `goal_cancel_receipt.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(operation_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_cancel_progress` → `goal_cancel_progress_application` | `goal_cancel_progress.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(operation_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_cancel_control_publication` → `goal_cancel_control_publication_application` | `goal_cancel_control_publication.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(operation_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_cancel_terminal_audit` → `goal_cancel_terminal_audit_application` | `goal_cancel_terminal_audit.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(operation_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_execution_writer_domain` → `goal_execution_writer_domain_application` | `goal_execution_writer_domain.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_execution_writer_domain_head` → `goal_execution_writer_domain_head_application` | `goal_execution_writer_domain_head.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_execution_binding_revision` → `goal_execution_binding_revision_application` | `goal_execution_binding_revision.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(binding_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_execution_binding_origin` → `goal_execution_binding_origin_application` | `goal_execution_binding_origin.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(binding_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_plan_binding` → `goal_plan_binding_application` | `goal_plan_binding.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(binding_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_execution_binding_control` → `goal_execution_binding_control_application` | `goal_execution_binding_control.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(binding_id)}` | canonical; `RP-GOAL-THREAD-LIFETIME` |
| `goal_execution_binding_pending_resolution` → `goal_execution_binding_pending_resolution_application` | `goal_execution_binding_pending_resolution.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(operation_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_cancel_binding_selection` → `goal_cancel_binding_selection_application` | `goal_cancel_binding_selection.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(operation_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_cancel_assignment_audit` → `goal_cancel_assignment_audit_application` | `goal_cancel_assignment_audit.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(operation_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_receipt` → `goal_receipt_application` | `goal_receipt.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(operation_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `goal_runtime_lineage_record` → `goal_runtime_lineage_record_application` | `goal_runtime_lineage_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `collaboration_definition` → `collaboration_definition_application` | `collaboration_definition.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(definition_id)}` | canonical; `RP-CONFIG-CURRENT` |
| `collaboration_run` → `collaboration_run_application` | `collaboration_run.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(collaboration_run_id)}` | canonical; `RP-RUNTIME-365D` |
| `collaboration_participant` → `collaboration_participant_application` | `collaboration_participant.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(collaboration_run_id)}:{hex(participant_id)}` | canonical; `RP-RUNTIME-365D` |
| `collaboration_transcript` → `collaboration_transcript_application` | `collaboration_transcript.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(collaboration_run_id)}:{hex(participant_id)}:{hex(item_id)}` | canonical; `RP-RUNTIME-365D` |
| `crew_auto` → `crew_auto_application` | `crew_auto.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}` | canonical; `RP-CONFIG-CURRENT` |
| `crew_board_message` → `crew_board_message_application` | `crew_board_message.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(crew_id)}:{hex(run_id)}:{hex(message_id)}` | canonical; `RP-COORDINATION-180D` |
| `coordination_agent` → `coordination_agent_application` | `coordination_agent.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(crew_id)}:{hex(run_id)}:{hex(agent_id)}` | derived; `RP-PROJECTION-3GEN` |
| `coordination_file` → `coordination_file_application` | `coordination_file.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(crew_id)}:{hex(run_id)}:{hex(execution_host_id)}:{root_identity_sha256}:{path_identity_sha256}` | derived; `RP-PROJECTION-3GEN` |
| `coordination_operation` → `coordination_operation_application` | `coordination_operation.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(crew_id)}:{hex(run_id)}:{hex(operation_id)}` | derived; `RP-PROJECTION-3GEN` |
| `coordination_snapshot` → `coordination_snapshot_application` | `coordination_snapshot.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(crew_id)}:{hex(run_id)}:{hex(publication_id)}` | derived; `RP-PROJECTION-3GEN` |
| `coordination_checkpoint` → `coordination_checkpoint_application` | `coordination_checkpoint.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(crew_id)}:{hex(run_id)}:{hex(consumer_id)}` | derived; `RP-PROJECTION-3GEN` |
| `goal_run_started_projection` → `goal_run_started_projection_application` | `goal_run_started_projection.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(run_id)}` | derived; `RP-PROJECTION-3GEN` |
| `goal_run_started_checkpoint` → `goal_run_started_checkpoint_application` | `goal_run_started_checkpoint.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(consumer_id)}` | canonical; `RP-PROJECTION-3GEN` |
| `goal_run_started_cancelled_projection` → `goal_run_started_cancelled_projection_application` | `goal_run_started_cancelled_projection.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}:{hex(run_id)}` | derived; `RP-PROJECTION-3GEN` |
| `goal_run_started_cancelled_checkpoint` → `goal_run_started_cancelled_checkpoint_application` | `goal_run_started_cancelled_checkpoint.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(consumer_id)}` | canonical; `RP-PROJECTION-3GEN` |


### SP-352 - Application Plan Schedule Cancel And Pause Physical Editions

```yaml
plan_unit_id: SP-352
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  APR-073/074, PLS-024/PDS-023 and SQR-019/020 own logical app Plan/Deep Plan/scheduling. The attached exact physical app rows cover aggregate/immutable revisions/current-thread slot, PlanRun/adherence/To-Dos/ledger/bundle, schedule/message/window/consent/occurrence and original cancellation/result/retirement source. CV-366/368 freeze selected logical/source/hash versions, not a nullable rewrite of SP-306/307’s exact original Project ten-family/cancel/anchor graph. The app PlanRun’s own logical semantics/field count and real original run_completion_anchor are preserved; an app wrapper never mints a completion from history. Exact approved Plan ID/version/hash/steps, actual app Computer/roots/runtime/permission/Goal/Crew/source and schedule frozen targets remain bound throughout original dispatch/cancel/result/replay/read/backup. DeepPlan profile assistant_deep_plan is not the EventRecord scope. No product Plans/NamedPlan/WorkNode/Orchestrator records are created.
  One current unfinished Plan slot per retained thread is checked across original/destination binding through the conversion lineage, not separately per new key. schedule_build writes exact version/hash/topology/team and window together with no run/provider attempt yet. Timers, occurrence dedupe and quota consent stay on the named owning Server across Client close and Project switching. Hold/invalidate source authority during conversion and explicitly re-admit each exact replacement under fresh consent/task+scope Stop/pause/permission/writer/source/currentness; never latest substitution, backlog or double occurrence. Original Project keys/hash/replay remain exact. RP-AUTHORITY-INDEFINITE audit/source rows and RP-RUNTIME-365D runs retain original anchors/holds; app scopes use the same Server-wide counterpart capacities, not a new numeric schedule/Plan cap or per-chat bucket. Full Server Backup includes canonical graph and payloads coherently; converted destination records join Project Backup. Source accepted Plan/schedule/cancel audit survives chat Undo expiry.
  The independent app pause family is application_automation_pause. Its exact key is application_automation_pause.v1:{hex(storage_instance_id)}:{hex(server_id)}, schema_id pm.storage_value.application_automation_pause.v1 version1.0.0, physical codec pm.application.physical_messagepack.v1. The closed wrapper requires schema_id/schema_version/storage_instance_id/server_id/scope=WorkflowScopeV2(application)/record=CV-368 ApplicationAutomationPauseRecord, with exact key/Server/null Project joins and at most 16 KiB. It uses existing RP-AUTHORITY-INDEFINITE@1.0.0 and canonical redb, one record for every app automation on that Server. Project_automation_pause and its original physical key/value stay unchanged. App pause is never Settings/Everywhere or a missing-as-off migration.
  Fresh application authority birth may create revision0/epoch0/off only with genuine never-born proof bound to the actual storage instance/Server birth operation and current writer lease. Already initialized, missing/corrupt/unsupported custody is app_automation_pause_unavailable; restore from coherent mandatory backup preserves any newer latch/epoch rather than resetting it. User desired-value changes use internal whole-value CAS and original operation/result custody. Only transition false→true advances user_stop_epoch once with the value and actor/time/revision; idempotent same-value and true→false do not advance, and false clears no task latch. No automatic actor or YOLO clears it. Every eligibility check captures the target’s own and this app scope epoch and rechecks them under the final owner fence. Conversion checks source app and destination Project pause/Stop, never resumes/clears either. runtime.automation_pause_changed remains non-emitting with missing_event_registration until complete family-specific adoption. The pause write/result and event are separate obligations; no source-built off state or fake EventRecord is admitted.
gui_related: false
gui_classification_reason: Defines data, identity, custody, version or source contracts; no presentation ownership.
depends_on:
- CV-368
- SP-306
- SP-307
- SP-323
- SP-350
unblocks: []
acceptance_criteria:
- App Plan/schedule/cancel/current-slot storage keeps complete source and exact targets with counterpart retention.
- Pause physical birth/key/wrapper/CAS/epochs/read/backup/refusal are coherent and separate from Project.
- Stop/conversion/timer/restore races cannot double-run or clear a newer latch.
validation_surfaces:
- 'Phase 2: focused owner/companion semantic fixtures and scripts/pm-projects-refresh-contracts.py'
- 'Phase 2: python3 scripts/pm-plan-index.py validate'
risk_class: scope_authority_and_custody_drift
reasoning_tier: high
context_scope: projects_refresh_application_workflows
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F08
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F09
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F10
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-F08
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/E-requests.md#E-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/E-requests.md#E-F11
preserved_exact_tokens:
- application_automation_pause
- application_automation_pause.v1:{hex(storage_instance_id)}:{hex(server_id)}
- pm.storage_value.application_automation_pause.v1
- RP-AUTHORITY-INDEFINITE
- user_stop_epoch
- app_automation_pause_unavailable
negative_constraints:
- No Settings seed, fake Project/thread for Server-wide pause, missing-as-off, source recapture or automatic resume.
- Acceptance does not prove native handlers, Event Authority admission, durability, readiness or governance certification.
owner_hints:
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-365


**SP-352 exact application physical rows**

Every application key begins with its distinct versioned family prefix and actual `hex(storage_instance_id):hex(server_id)`; hex is lowercase encoding of the complete UTF-8 scalar identity, without normalization or truncation. This is separate from EventRecord’s unchanged `app` partition and `project~` encoding. Logical record references use CV-366 selected roots. The closed physical wrapper requires schema_id, schema_version=1.0.0, storage_instance_id, server_id, scope=WorkflowScopeV2(application), record; key/value/record scope and identities must agree. The physical wrapper schema_id for family `f_application` is `pm.storage_value.f.application.v1`, at `Plans/application_workflow_contracts.schema.json#/$defs/<PascalCase(f)>StorageApplicationV1`. No extra fields or self-hash are stored. Canonical rows use the canonical redb file, derived rows the derived redb file. All use CV-366’s app MessagePack physical codec, at most 16 KiB per value with larger content in SP-337 payload refs. Missing mandatory policy/disk-budget/writer/source/backup registration leaves a family unavailable; it never inherits unlimited space.

| Existing counterpart / new app family | Exact key_shape | Retention and custody |
|---|---|---|
| `assistant_plan_record` → `assistant_plan_record_application` | `assistant_plan_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(assistant_plan_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `assistant_plan_document_revision` → `assistant_plan_document_revision_application` | `assistant_plan_document_revision.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(assistant_plan_id)}:{revision_decimal}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `assistant_plan_current_slot` → `assistant_plan_current_slot_application` | `assistant_plan_current_slot.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `assistant_plan_run` → `assistant_plan_run_application` | `assistant_plan_run.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(assistant_plan_id)}:{hex(plan_run_id)}` | canonical; `RP-RUNTIME-365D` |
| `assistant_plan_adherence` → `assistant_plan_adherence_application` | `assistant_plan_adherence.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(plan_run_id)}:{hex(step_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `assistant_deep_plan_ledger` → `assistant_deep_plan_ledger_application` | `assistant_deep_plan_ledger.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(assistant_plan_id)}:{hex(ledger_session_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `assistant_deep_plan_bundle` → `assistant_deep_plan_bundle_application` | `assistant_deep_plan_bundle.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(assistant_plan_id)}:{plan_revision_decimal}:{bundle_sha256}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `execution_schedule` → `execution_schedule_application` | `execution_schedule.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(schedule_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `scheduled_message` → `scheduled_message_application` | `scheduled_message.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(scheduled_message_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `quota_resume_consent` → `quota_resume_consent_application` | `quota_resume_consent.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(run_id)}:{hex(provider_id)}:{hex(account_id)}:{hex(consent_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `execution_schedule_run_binding` → `execution_schedule_run_binding_application` | `execution_schedule_run_binding.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(schedule_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `execution_occurrence` → `execution_occurrence_application` | `execution_occurrence.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(schedule_id)}:{hex(occurrence_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `schedule_quota_cancel_effect` → `schedule_quota_cancel_effect_application` | `schedule_quota_cancel_effect.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(plan_run_id)}:{hex(cancellation_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `assistant_plan_cancel_result` → `assistant_plan_cancel_result_application` | `assistant_plan_cancel_result.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(plan_run_id)}:{hex(cancellation_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |
| `assistant_plan_run_retirement` → `assistant_plan_run_retirement_application` | `assistant_plan_run_retirement.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(plan_run_id)}` | canonical; `RP-AUTHORITY-INDEFINITE` |


### SP-353 - Permission And Project Build Authority Durable Bindings

```yaml
plan_unit_id: SP-353
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Permissions PS-144–148 and HITL-038 own meaning; storage owns only durable key/wrapper/encoding/CAS/retention/source/backup joins. Original permission_snapshot_record.v1:{project_id}:{snapshot_id} and all original-permission-snapshot/cancellation/Goal source resources remain byte/hash exact. App snapshot family permission_snapshot_record_application uses permission_snapshot_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(snapshot_id)} and pm.storage_value.permission_snapshot_record.application.v1 1.0.0 referencing CV-366 ApplicationPermissionSnapshot. App tool approval source/result is chat_tool_approval_application at chat_tool_approval.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(request_id)}, selected ChatToolApprovalApplicationV1; it never null-fills an Orchestrator node/blocked_sequence record. Canonical records use CV-366’s app wrapper/codec and exact operation/currentness; RP-AUTHORITY-INDEFINITE protects immutable audit and owner holds. Existing permission evidence, actual root/Host/target/Stop and source account/ceiling remain required; no current Settings rebuild of history.
  Project BuildGrant is a canonical Permissions record, family build_grant, key build_grant.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(grant_id)}, value pm.storage_value.build_grant.v1 1.0.0. created_resource_manifest uses created_resource_manifest.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(grant_id)} and pm.storage_value.created_resource_manifest.v1; grant_revocation uses grant_revocation.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(grant_id)}:{revision_decimal} and pm.storage_value.grant_revocation.v1. All wrappers close to schema/version/storage_instance_id/project_id/record with selected PS-147/automation_authority_contracts logical refs and existing Project physical codec, never a new JSON action log. Grant absent/revision CAS, exact Plan/version/hash/run/task/targets/permission/revocation/Stop and verified created UID/generation must match. Immutable action results remain the actual existing run/owner/ObservableWork/History receipt families; manifests keep refs, not duplicate outcomes or an invented build.* stream.
  Computer permission rules use permission_rule.computer.v1:{hex(storage_instance_id)}:{computer_domain}:{hex(computer_id)}:{hex(rule_id)}, computer_domain=server|execution_host with exact owner-tagged identity; user rule source config/YAML is compatibility/export only, never a second live writer. Everywhere path patterns remain forbidden. Repository-origin acceptance/trust and Always are separate human authority with exact source/revision/target, not copied Settings or mode. Grant/rule/snapshot tables use the same 16 KiB cap and SP-337 refs for large manifests, RP-AUTHORITY-INDEFINITE plus independent recovery/source/Stop holds and coherent Project Backup or Full Server app backup. Restore grants/rules as historical evidence until fresh current admission; restored stale/revoked grants cannot dispatch. Cutover and chat Undo expiry neither transfer nor purge these independent authorities. Missing/dedupe/custody/integrity/recovery failures stay zero-effect unavailable; approval/grant cannot clear Storage/FileSafe holds.
gui_related: false
gui_classification_reason: Defines data, identity, custody, version or source contracts; no presentation ownership.
depends_on:
- CV-365
- CV-366
- PS-144
- PS-145
- PS-147
- PS-148
- SP-340
unblocks: []
acceptance_criteria:
- App permission/source/tool approval and Project grant/manifest/revocation have one exact canonical writer/key/retention/backup.
- Restore/conversion preserves old evidence without transferring authority or clearing Stop/holds.
- Action list reads existing receipts and no new live JSON/event engine.
validation_surfaces:
- 'Phase 2: focused owner/companion semantic fixtures and scripts/pm-projects-refresh-contracts.py'
- 'Phase 2: python3 scripts/pm-plan-index.py validate'
risk_class: scope_authority_and_custody_drift
reasoning_tier: high
context_scope: projects_refresh_application_workflows
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F01
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F02
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F03
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F04
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F05
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F04
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F06
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-F09
preserved_exact_tokens:
- ApplicationPermissionSnapshot
- BuildGrant
- CreatedResourceManifest
- permission_snapshot_record.v1:{project_id}:{snapshot_id}
- permission_snapshot_record.application.v1
- build_grant.v1
- created_resource_manifest.v1
- grant_revocation.v1
- RP-AUTHORITY-INDEFINITE
negative_constraints:
- No agent self-grant, forged human approval, duplicated action log, null Project sentinel or early evidence purge.
- Acceptance does not prove native handlers, Event Authority admission, durability, readiness or governance certification.
owner_hints:
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-365

### SP-660 - alert.acknowledged original custody and history

```yaml
plan_unit_id: SP-660
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Newly authored technical custody binding: original_command is the complete closed normalized accepted command context with every candidate payload field except schema_id, schema_version and result_* fields. It retains the original subject/source reference, actor, prior revision/state, currentness, options, correlation, idempotency key and original ts; optional fields retain original presence. This private snapshot does not expand the public command signature. request_digest is lowercase SHA-256 of canonical MessagePack {original_command: operation.original_command, candidate_payload: operation.payload}; every field and optional presence participates, with no Storage-assigned metadata. Both owner snapshots join Project, subject, immutable source, revision and lifecycle state to the frozen command/payload; unchanged fields agree with the prior snapshot and only the specified action effects differ. No supplied digest or snapshot copy grants authority. Newly authored owner contract for alert.acknowledged 1.0.0 under DL-045; prepared without admission.\
  \ Only cmd.alert.acknowledge, handled by handlers::alert::acknowledge, produces this exact family. Existing closed\
  \ payload is Plans/event_payloads/attention/alert_acknowledged.schema.json (pm.attention_event.alert_acknowledged.schema.v1);\
  \ no sibling admission. Semantic owner is F3-700, payload route CV-680, storage route SP-660. Transition: unacknowledged\
  \ or snoozed -> acknowledged; clear unread only; never resolve the underlying condition. Current owner must prove\
  \ the action is allowed, including permission, current subject revision and currentness_basis_ref. Mute/snooze\
  \ cannot suppress blocking confirmations or security-sensitive failures; dismissal cannot clear a blocker. A refusal,\
  \ stale result, no change, rollback or failed persistence produces no event.\n\nIdentity is Project-scoped EventRecord\
  \ v2, scope_partition project~base64url_no_pad(UTF8(project_id)); envelope project_id equals payload project_id,\
  \ actor_ref/correlation_id/idempotency_key/occurred_at_utc equal the payload fields (ts for occurrence); thread/run/node/attempt\
  \ and parent/causation refs are null unless an authentic caller supplies the corresponding original linkage, never\
  \ ambient defaults. Let H be lowercase SHA-256 of canonical MessagePack of the array [storage_instance_id, project_id,\
  \ \"alert.acknowledged\", idempotency_key]. event_id is evt_alert_acknowledged_ followed by H; operation_digest\
  \ is H. The idempotency key is the original accepted command key, not reminted on recovery. Request digest covers\
  \ the full admitted command, subject alert_id, actor, current revision and exact candidate payload. Same key with\
  \ unequal digest fails conflict before effects. The command's original revision and subject ref must equal the\
  \ independently read owner record, and result_revision equals prior_revision + 1. Server-side secret screening\
  \ rejects secret-bearing strings even if the lexical schema accepts them.\n\nOrdering: under the original Project\
  \ permission/currentness/owner mutation fence, validate exact registry membership FIRST; currently absent means\
  \ deny before journal/body/effect/checkpoint. On future admission, freeze original payload and identity in alert_acknowledged_operation.v1:{project_id}:{operation_digest}\
  \ before mutation. State prepared has all four result/commit/receipt refs null. CAS the exact subject revision\
  \ and commit its candidate owner state together with the committed operation in one owner-coordinated transaction;\
  \ committed has original owner_commit_ref, result_ref and dispatch_receipt_ref, with original_append_result_ref\
  \ null. If that atomic boundary cannot be established, the action remains unavailable. The shared alert store\
  \ stays F3-453's one store, with no per-surface copy. Append only after authenticated owner commit/readback. Explicitly\
  \ adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2 including its full-value v2 successor, genuine original\
  \ eleven-field first AppendReceipt, retained four-field original_append_result and actual original EventRecord.\
  \ Exact identity, semantic payload, Storage instance, sequence, segment/offset and durability must all join independently.\
  \ Only then set settled with all four refs nonnull and publish terminal success. An uncertain append fences later\
  \ writes to that subject; recovery resolves the ORIGINAL identity, never reruns the command or fabricates a receipt.\
  \ Prepared with no commit may abandon only after original absence proof; ambiguous state fences. Committed retries\
  \ recover append with frozen semantics; settled retries return original result/receipt. No wall clock renewal.\n\
  \nOriginal operation custody is canonical and non-rebuildable; its schema is Plans/alert_event_contracts/alert_acknowledged_operation.schema.json.\
  \ The owner commit ref resolves original shared alert state, never a current replacement with the same revision.\
  \ Backup/restore must include coherent original operation, shared alert/rule state, Storage source and first/full-value\
  \ receipt custody and source/deletion dependencies under one verified recovery boundary. Missing/mixed instances\
  \ or missing original evidence fence mutation and disclose unavailable. History cannot recreate deleted source\
  \ bodies. Reads authenticate current Project membership, source access and deletion tombstones at disclosure,\
  \ including after every returning helper; IDs/hashes/refs confer no access. No raw alert text, private rationale\
  \ or source content is copied into the event or custody.\n\nNewly authored projector.alert_acknowledged.history@1.0.0\
  \ and reader.alert_acknowledged.history@1.0.0 expose this family's passive History audit refs; GUI inbox state\
  \ is independently read from F3-453, never inferred as mutation authority from History. Checkpoint key alert_acknowledged_checkpoint.v1:{project_id}:{storage_instance_id},\
  \ schema Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json. Explicitly adopt SP-278 and DL-076:\
  \ CURRENT-selected complete generic EventRecord index, whole nine-field durable index_read_token (no persisted\
  \ redb_snapshot_id); live snapshot id is rejoined and authenticated on each scan/read/advance. Scan every source\
  \ sequence through the captured frontier, filter exact Project and alert.acknowledged, validate each matching\
  \ EventRecord/payload and atomically CAS the whole prior checkpoint to the verified frontier in ONE derived-redb\
  \ transaction. The checkpoint stores only this constant-count token/frontier/last-match value, never an event_refs\
  \ array, page list or retained-history manifest. through_sequence_id is the complete scanned frontier, not merely\
  \ the last match; last_event_id is the final matching event id or null for no matches. Never skip corrupt/unknown\
  \ source or advance past an inadmissible event. Reader requires current publication/state, exact scope/instance\
  \ and adequate verified frontier or returns unavailable, never empty success. No checkpoint may advance while\
  \ this family is absent. Lost ack/replay never dispatches an owner command. Rebuild stages a separate publication\
  \ from retained CURRENT-selected source, verifies complete coverage, then atomically withdraws old and publishes\
  \ new; pruning, source-generation or schema change requires rebuild rather than zeroing a live cursor. Legal source\
  \ deletion rebuilds only retained refs, never resurrects deleted content.\n\nCompatibility/withdrawal: only payload\
  \ 1.0.0 and the explicit value schema versions are readable; unknown versions fence without coercion. No historical\
  \ write is claimed. StorageMigrationCoordinator must install these exact value schemas before activation; no invented\
  \ store version. Withdrawal first closes writer admission and fences subject mutations, settles every original\
  \ in-flight obligation under its original evidence, then marks this checkpoint withdrawn under whole-value CAS.\
  \ Readers refuse withdrawn/staged publications; a future version requires its own contract/admission and verified\
  \ rebuild, not an alias or in-place event rewrite. Source custody remains subject to holds and its own lifetime.\n\
  \nretention_policy_ref: PENDING_RETENTION_DECISION for this event, its operation and its History checkpoint. Case\
  \ L-3 (SP-026 retention section) offers audit-authority/receipt RP-AUTHORITY-INDEFINITE versus ordinary telemetry\
  \ ordinary telemetry class (policy identifier not assigned here) for event history; RP-PROJECTION-3GEN is a checkpoint\
  \ candidate only. No existing text names alert.acknowledged in a decided class. RT must decide/confirm exact assignment\
  \ and dependent body deletion; do not choose by prefix or expire anything pending that decision. Native execution\
  \ NOT_RUN. Static validation: python3 scripts/pm-alert-event-contracts-check.py.\n Original shared state for this\
  \ family is shared_alert_state.v1:{project_id}:{alert_id}, closed schema Plans/alert_event_contracts/shared_alert_state.schema.json.\
  \ This is a newly authored technical representation of F3-453 existing behavior, reused by each exact handler,\
  \ not another UI store. prior_owner_state and candidate_owner_state are complete frozen original bytes in this\
  \ family operation; exact key/Project/subject/source identity must agree with payload and both snapshots. Candidate\
  \ revision is prior + 1; source_record_ref is unchanged. CAS compares the full prior value, not revision alone,\
  \ and atomically writes candidate plus committed operation before append. No prepared operation may authorize\
  \ mutation without exact family admission. Acknowledge clears unread and preserves presentation/source truth;\
  \ dismiss clears inbox_visible only and preserves source truth; snooze sets original snooze_until and hides until\
  \ the deadline without deleting; mute changes only exact rule state/deadline. Fields unrelated to the exact action\
  \ remain byte-equal. Expiry/read projection is the existing owner behavior and creates no fabricated action event.\
  \ Original immutable owner_commit_ref resolves the operation candidate snapshot even after later revisions. Shared\
  \ state backup is canonical and mandatory; its retention remains PENDING_RETENTION_DECISION independently of the\
  \ source record.\n\nBounded History read-through (newly authored technical binding): reader.alert_acknowledged.history@1.0.0\
  \ reads the exact published checkpoint and its nine-field durable token through SP-278 reader.storage.event_record_index.\
  \ Request carries publication_id, the entire durable token and after_sequence_id (0 initially; unsigned 64-bit).\
  \ These are untrusted resumable read inputs, never new persisted state. Authenticate the original token and join\
  \ its Storage instance to both checkpoint and source_selection; rejoin the actual live redb snapshot on every\
  \ call. Source generation/selection must still validate under SP-278; do not silently substitute a fresh token\
  \ into an old continuation. Changed source needs SP-278 verified translation or a new verified publication and\
  \ a restarted traversal, otherwise unavailable. Scan in canonical sequence order only through the checkpoint's\
  \ through_sequence_id, at most 256 source sequences per response; return at most 64 authenticated exact-family/Project\
  \ event refs and at most 16384 canonical MessagePack response bytes. Stop before the first ref that would exceed\
  \ either response bound. An individual ref or token that cannot fit is invalid source/metadata, never silently\
  \ dropped. A continuation repeats publication_id and the complete token and advances after_sequence_id to the\
  \ last actually examined source sequence; it must not advance past an unreturned match. Empty filtered pages carry\
  \ continuation until complete=true at the frontier. Complete=true with zero matches is empty History only after\
  \ full verified coverage, never because a scan budget expired. Reader holds/revalidates publication, original\
  \ source access, deletion and withdrawal at disclosure; invalid/withdrawn publication or a cursor beyond frontier\
  \ returns unavailable. No History read dispatches an action or changes the checkpoint. Rebuild/withdrawal fences\
  \ apply equally to every continuation. This bounds a read, not retention: all retained History remains reachable\
  \ through repeated calls.\n\nSP-340 physical binding: alert_acknowledged_operation is canonical MessagePack in\
  \ the canonical redb file, coordination_and_storage group (advisory canonical budget); alert_acknowledged_checkpoint\
  \ is canonical MessagePack in the derived redb file, event_log group (hard derived budget with eviction/rebuild).\
  \ Each value is at most 16384 encoded bytes, measured before CAS. F3-453 shared_alert_state/shared_alert_rule_state\
  \ use canonical MessagePack in canonical redb, settings_and_layout group, same maximum. Their original snapshots\
  \ remain in this family's canonical operation. Budget pressure never refuses canonical history or prunes it; derived\
  \ eviction makes History unavailable until verified rebuild. Metadata/ref values exceeding the physical maximum\
  \ are invalid and cannot commit; no accumulating history/body is placed in them. No duration, history-count cap\
  \ or retention assignment is added. Size-boundary and 1000-match read-through oracles are in this family's fixture.\
  \ The unadmitted earlier draft's event_refs checkpoint is not a current schema; if encountered as an installation\
  \ input it requires a governed rebuild, never truncation or in-place relabeling.\n\nCurrent append and original retry select replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and must fail replay_only_not_appendable before any canonical write or effect. EventRecord inline bodies at most 16 KiB; above that use the SP-337 BLAKE3/size/media-type payload_ref, never base64 body stuffing. This does not relax the 16384-byte closed operation/checkpoint maximum: oversized metadata is refused before effects. Identifier patterns require full-string matching, including rejection of a trailing LF; no trimming or normalization. History response is exactly the closed object {publication_id, index_read_token, after_sequence_id, event_refs, complete}; index_read_token is the full nine-field durable token. Measure canonical MessagePack of that entire object for every candidate response, including an empty completion/continuation. Metadata or one matching ref that cannot individually fit returns unavailable without advancing past the match. Static large-valid-token, exact-response-boundary, unpageable-metadata and replay-only negatives do not replace native authorization/byte/CAS proofs."
gui_related: false
gui_classification_reason: Storage/event contract, no new UI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- alert.acknowledged is denied until its own admission; exact identity, custody, recovery and negative paths are
  checked.
- Retention remains PENDING_RETENTION_DECISION; native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-alert-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: alert_acknowledged
implementation_surfaces:
- Plans/event_payloads/attention/alert_acknowledged.schema.json
- Plans/storage-plan.md#SP-660
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/FinalGUISpec.md#F3-453
preserved_exact_tokens:
- alert.acknowledged
- PENDING_RETENTION_DECISION
negative_constraints:
- No append, native activation, checkpoint advance or admission from this preparation.
```

### SP-661 - alert.dismissed original custody and history

```yaml
plan_unit_id: SP-661
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Newly authored technical custody binding: original_command is the complete closed normalized accepted command context with every candidate payload field except schema_id, schema_version and result_* fields. It retains the original subject/source reference, actor, prior revision/state, currentness, options, correlation, idempotency key and original ts; optional fields retain original presence. This private snapshot does not expand the public command signature. request_digest is lowercase SHA-256 of canonical MessagePack {original_command: operation.original_command, candidate_payload: operation.payload}; every field and optional presence participates, with no Storage-assigned metadata. Both owner snapshots join Project, subject, immutable source, revision and lifecycle state to the frozen command/payload; unchanged fields agree with the prior snapshot and only the specified action effects differ. No supplied digest or snapshot copy grants authority. Newly authored owner contract for alert.dismissed 1.0.0 under DL-045; prepared without admission.\
  \ Only cmd.alert.dismiss, handled by handlers::alert::dismiss, produces this exact family. Existing closed payload\
  \ is Plans/event_payloads/attention/alert_dismissed.schema.json (pm.attention_event.alert_dismissed.schema.v1);\
  \ no sibling admission. Semantic owner is F3-701, payload route CV-681, storage route SP-661. Transition: unacknowledged,\
  \ acknowledged or snoozed -> dismissed; rationale required; remove inbox presentation only; no approval, denial,\
  \ resolution or source deletion. Current owner must prove the action is allowed, including permission, current\
  \ subject revision and currentness_basis_ref. Mute/snooze cannot suppress blocking confirmations or security-sensitive\
  \ failures; dismissal cannot clear a blocker. A refusal, stale result, no change, rollback or failed persistence\
  \ produces no event.\n\nIdentity is Project-scoped EventRecord v2, scope_partition project~base64url_no_pad(UTF8(project_id));\
  \ envelope project_id equals payload project_id, actor_ref/correlation_id/idempotency_key/occurred_at_utc equal\
  \ the payload fields (ts for occurrence); thread/run/node/attempt and parent/causation refs are null unless an\
  \ authentic caller supplies the corresponding original linkage, never ambient defaults. Let H be lowercase SHA-256\
  \ of canonical MessagePack of the array [storage_instance_id, project_id, \"alert.dismissed\", idempotency_key].\
  \ event_id is evt_alert_dismissed_ followed by H; operation_digest is H. The idempotency key is the original accepted\
  \ command key, not reminted on recovery. Request digest covers the full admitted command, subject alert_id, actor,\
  \ current revision and exact candidate payload. Same key with unequal digest fails conflict before effects. The\
  \ command's original revision and subject ref must equal the independently read owner record, and result_revision\
  \ equals prior_revision + 1. Server-side secret screening rejects secret-bearing strings even if the lexical schema\
  \ accepts them.\n\nOrdering: under the original Project permission/currentness/owner mutation fence, validate\
  \ exact registry membership FIRST; currently absent means deny before journal/body/effect/checkpoint. On future\
  \ admission, freeze original payload and identity in alert_dismissed_operation.v1:{project_id}:{operation_digest}\
  \ before mutation. State prepared has all four result/commit/receipt refs null. CAS the exact subject revision\
  \ and commit its candidate owner state together with the committed operation in one owner-coordinated transaction;\
  \ committed has original owner_commit_ref, result_ref and dispatch_receipt_ref, with original_append_result_ref\
  \ null. If that atomic boundary cannot be established, the action remains unavailable. The shared alert store\
  \ stays F3-453's one store, with no per-surface copy. Append only after authenticated owner commit/readback. Explicitly\
  \ adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2 including its full-value v2 successor, genuine original\
  \ eleven-field first AppendReceipt, retained four-field original_append_result and actual original EventRecord.\
  \ Exact identity, semantic payload, Storage instance, sequence, segment/offset and durability must all join independently.\
  \ Only then set settled with all four refs nonnull and publish terminal success. An uncertain append fences later\
  \ writes to that subject; recovery resolves the ORIGINAL identity, never reruns the command or fabricates a receipt.\
  \ Prepared with no commit may abandon only after original absence proof; ambiguous state fences. Committed retries\
  \ recover append with frozen semantics; settled retries return original result/receipt. No wall clock renewal.\n\
  \nOriginal operation custody is canonical and non-rebuildable; its schema is Plans/alert_event_contracts/alert_dismissed_operation.schema.json.\
  \ The owner commit ref resolves original shared alert state, never a current replacement with the same revision.\
  \ Backup/restore must include coherent original operation, shared alert/rule state, Storage source and first/full-value\
  \ receipt custody and source/deletion dependencies under one verified recovery boundary. Missing/mixed instances\
  \ or missing original evidence fence mutation and disclose unavailable. History cannot recreate deleted source\
  \ bodies. Reads authenticate current Project membership, source access and deletion tombstones at disclosure,\
  \ including after every returning helper; IDs/hashes/refs confer no access. No raw alert text, private rationale\
  \ or source content is copied into the event or custody.\n\nNewly authored projector.alert_dismissed.history@1.0.0\
  \ and reader.alert_dismissed.history@1.0.0 expose this family's passive History audit refs; GUI inbox state is\
  \ independently read from F3-453, never inferred as mutation authority from History. Checkpoint key alert_dismissed_checkpoint.v1:{project_id}:{storage_instance_id},\
  \ schema Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json. Explicitly adopt SP-278 and DL-076:\
  \ CURRENT-selected complete generic EventRecord index, whole nine-field durable index_read_token (no persisted\
  \ redb_snapshot_id); live snapshot id is rejoined and authenticated on each scan/read/advance. Scan every source\
  \ sequence through the captured frontier, filter exact Project and alert.dismissed, validate each matching EventRecord/payload\
  \ and atomically CAS the whole prior checkpoint to the verified frontier in ONE derived-redb transaction. The\
  \ checkpoint stores only this constant-count token/frontier/last-match value, never an event_refs array, page\
  \ list or retained-history manifest. through_sequence_id is the complete scanned frontier, not merely the last\
  \ match; last_event_id is the final matching event id or null for no matches. Never skip corrupt/unknown source\
  \ or advance past an inadmissible event. Reader requires current publication/state, exact scope/instance and adequate\
  \ verified frontier or returns unavailable, never empty success. No checkpoint may advance while this family is\
  \ absent. Lost ack/replay never dispatches an owner command. Rebuild stages a separate publication from retained\
  \ CURRENT-selected source, verifies complete coverage, then atomically withdraws old and publishes new; pruning,\
  \ source-generation or schema change requires rebuild rather than zeroing a live cursor. Legal source deletion\
  \ rebuilds only retained refs, never resurrects deleted content.\n\nCompatibility/withdrawal: only payload 1.0.0\
  \ and the explicit value schema versions are readable; unknown versions fence without coercion. No historical\
  \ write is claimed. StorageMigrationCoordinator must install these exact value schemas before activation; no invented\
  \ store version. Withdrawal first closes writer admission and fences subject mutations, settles every original\
  \ in-flight obligation under its original evidence, then marks this checkpoint withdrawn under whole-value CAS.\
  \ Readers refuse withdrawn/staged publications; a future version requires its own contract/admission and verified\
  \ rebuild, not an alias or in-place event rewrite. Source custody remains subject to holds and its own lifetime.\n\
  \nretention_policy_ref: PENDING_RETENTION_DECISION for this event, its operation and its History checkpoint. Case\
  \ L-3 (SP-026 retention section) offers audit-authority/receipt RP-AUTHORITY-INDEFINITE versus ordinary telemetry\
  \ ordinary telemetry class (policy identifier not assigned here) for event history; RP-PROJECTION-3GEN is a checkpoint\
  \ candidate only. No existing text names alert.dismissed in a decided class. RT must decide/confirm exact assignment\
  \ and dependent body deletion; do not choose by prefix or expire anything pending that decision. Native execution\
  \ NOT_RUN. Static validation: python3 scripts/pm-alert-event-contracts-check.py.\n Original shared state for this\
  \ family is shared_alert_state.v1:{project_id}:{alert_id}, closed schema Plans/alert_event_contracts/shared_alert_state.schema.json.\
  \ This is a newly authored technical representation of F3-453 existing behavior, reused by each exact handler,\
  \ not another UI store. prior_owner_state and candidate_owner_state are complete frozen original bytes in this\
  \ family operation; exact key/Project/subject/source identity must agree with payload and both snapshots. Candidate\
  \ revision is prior + 1; source_record_ref is unchanged. CAS compares the full prior value, not revision alone,\
  \ and atomically writes candidate plus committed operation before append. No prepared operation may authorize\
  \ mutation without exact family admission. Acknowledge clears unread and preserves presentation/source truth;\
  \ dismiss clears inbox_visible only and preserves source truth; snooze sets original snooze_until and hides until\
  \ the deadline without deleting; mute changes only exact rule state/deadline. Fields unrelated to the exact action\
  \ remain byte-equal. Expiry/read projection is the existing owner behavior and creates no fabricated action event.\
  \ Original immutable owner_commit_ref resolves the operation candidate snapshot even after later revisions. Shared\
  \ state backup is canonical and mandatory; its retention remains PENDING_RETENTION_DECISION independently of the\
  \ source record.\n\nBounded History read-through (newly authored technical binding): reader.alert_dismissed.history@1.0.0\
  \ reads the exact published checkpoint and its nine-field durable token through SP-278 reader.storage.event_record_index.\
  \ Request carries publication_id, the entire durable token and after_sequence_id (0 initially; unsigned 64-bit).\
  \ These are untrusted resumable read inputs, never new persisted state. Authenticate the original token and join\
  \ its Storage instance to both checkpoint and source_selection; rejoin the actual live redb snapshot on every\
  \ call. Source generation/selection must still validate under SP-278; do not silently substitute a fresh token\
  \ into an old continuation. Changed source needs SP-278 verified translation or a new verified publication and\
  \ a restarted traversal, otherwise unavailable. Scan in canonical sequence order only through the checkpoint's\
  \ through_sequence_id, at most 256 source sequences per response; return at most 64 authenticated exact-family/Project\
  \ event refs and at most 16384 canonical MessagePack response bytes. Stop before the first ref that would exceed\
  \ either response bound. An individual ref or token that cannot fit is invalid source/metadata, never silently\
  \ dropped. A continuation repeats publication_id and the complete token and advances after_sequence_id to the\
  \ last actually examined source sequence; it must not advance past an unreturned match. Empty filtered pages carry\
  \ continuation until complete=true at the frontier. Complete=true with zero matches is empty History only after\
  \ full verified coverage, never because a scan budget expired. Reader holds/revalidates publication, original\
  \ source access, deletion and withdrawal at disclosure; invalid/withdrawn publication or a cursor beyond frontier\
  \ returns unavailable. No History read dispatches an action or changes the checkpoint. Rebuild/withdrawal fences\
  \ apply equally to every continuation. This bounds a read, not retention: all retained History remains reachable\
  \ through repeated calls.\n\nSP-340 physical binding: alert_dismissed_operation is canonical MessagePack in the\
  \ canonical redb file, coordination_and_storage group (advisory canonical budget); alert_dismissed_checkpoint\
  \ is canonical MessagePack in the derived redb file, event_log group (hard derived budget with eviction/rebuild).\
  \ Each value is at most 16384 encoded bytes, measured before CAS. F3-453 shared_alert_state/shared_alert_rule_state\
  \ use canonical MessagePack in canonical redb, settings_and_layout group, same maximum. Their original snapshots\
  \ remain in this family's canonical operation. Budget pressure never refuses canonical history or prunes it; derived\
  \ eviction makes History unavailable until verified rebuild. Metadata/ref values exceeding the physical maximum\
  \ are invalid and cannot commit; no accumulating history/body is placed in them. No duration, history-count cap\
  \ or retention assignment is added. Size-boundary and 1000-match read-through oracles are in this family's fixture.\
  \ The unadmitted earlier draft's event_refs checkpoint is not a current schema; if encountered as an installation\
  \ input it requires a governed rebuild, never truncation or in-place relabeling.\n\nCurrent append and original retry select replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and must fail replay_only_not_appendable before any canonical write or effect. EventRecord inline bodies at most 16 KiB; above that use the SP-337 BLAKE3/size/media-type payload_ref, never base64 body stuffing. This does not relax the 16384-byte closed operation/checkpoint maximum: oversized metadata is refused before effects. Identifier patterns require full-string matching, including rejection of a trailing LF; no trimming or normalization. History response is exactly the closed object {publication_id, index_read_token, after_sequence_id, event_refs, complete}; index_read_token is the full nine-field durable token. Measure canonical MessagePack of that entire object for every candidate response, including an empty completion/continuation. Metadata or one matching ref that cannot individually fit returns unavailable without advancing past the match. Static large-valid-token, exact-response-boundary, unpageable-metadata and replay-only negatives do not replace native authorization/byte/CAS proofs."
gui_related: false
gui_classification_reason: Storage/event contract, no new UI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- alert.dismissed is denied until its own admission; exact identity, custody, recovery and negative paths are checked.
- Retention remains PENDING_RETENTION_DECISION; native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-alert-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: alert_dismissed
implementation_surfaces:
- Plans/event_payloads/attention/alert_dismissed.schema.json
- Plans/storage-plan.md#SP-661
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/FinalGUISpec.md#F3-453
preserved_exact_tokens:
- alert.dismissed
- PENDING_RETENTION_DECISION
negative_constraints:
- No append, native activation, checkpoint advance or admission from this preparation.
```

### SP-662 - alert.rule_muted original custody and history

```yaml
plan_unit_id: SP-662
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Newly authored technical custody binding: original_command is the complete closed normalized accepted command context with every candidate payload field except schema_id, schema_version and result_* fields. It retains the original subject/source reference, actor, prior revision/state, currentness, options, correlation, idempotency key and original ts; optional fields retain original presence. This private snapshot does not expand the public command signature. request_digest is lowercase SHA-256 of canonical MessagePack {original_command: operation.original_command, candidate_payload: operation.payload}; every field and optional presence participates, with no Storage-assigned metadata. Both owner snapshots join Project, subject, immutable source, revision and lifecycle state to the frozen command/payload; unchanged fields agree with the prior snapshot and only the specified action effects differ. No supplied digest or snapshot copy grants authority. Newly authored owner contract for alert.rule_muted 1.0.0 under DL-045; prepared without admission.\
  \ Only cmd.alert.mute_rule, handled by handlers::alert::mute_rule, produces this exact family. Existing closed\
  \ payload is Plans/event_payloads/attention/alert_rule_muted.schema.json (pm.attention_event.alert_rule_muted.schema.v1);\
  \ no sibling admission. Semantic owner is F3-702, payload route CV-682, storage route SP-662. Transition: unmuted\
  \ or expired -> muted for the exact Project rule; keep the issue visible in its owning surface; expiry follows\
  \ the original explicit deadline, never retry time. Current owner must prove the action is allowed, including\
  \ permission, current subject revision and currentness_basis_ref. Mute/snooze cannot suppress blocking confirmations\
  \ or security-sensitive failures; dismissal cannot clear a blocker. A refusal, stale result, no change, rollback\
  \ or failed persistence produces no event.\n\nIdentity is Project-scoped EventRecord v2, scope_partition project~base64url_no_pad(UTF8(project_id));\
  \ envelope project_id equals payload project_id, actor_ref/correlation_id/idempotency_key/occurred_at_utc equal\
  \ the payload fields (ts for occurrence); thread/run/node/attempt and parent/causation refs are null unless an\
  \ authentic caller supplies the corresponding original linkage, never ambient defaults. Let H be lowercase SHA-256\
  \ of canonical MessagePack of the array [storage_instance_id, project_id, \"alert.rule_muted\", idempotency_key].\
  \ event_id is evt_alert_rule_muted_ followed by H; operation_digest is H. The idempotency key is the original\
  \ accepted command key, not reminted on recovery. Request digest covers the full admitted command, subject alert_rule_id,\
  \ actor, current revision and exact candidate payload. Same key with unequal digest fails conflict before effects.\
  \ The command's original revision and subject ref must equal the independently read owner record, and result_revision\
  \ equals prior_revision + 1. Server-side secret screening rejects secret-bearing strings even if the lexical schema\
  \ accepts them.\n\nOrdering: under the original Project permission/currentness/owner mutation fence, validate\
  \ exact registry membership FIRST; currently absent means deny before journal/body/effect/checkpoint. On future\
  \ admission, freeze original payload and identity in alert_rule_muted_operation.v1:{project_id}:{operation_digest}\
  \ before mutation. State prepared has all four result/commit/receipt refs null. CAS the exact subject revision\
  \ and commit its candidate owner state together with the committed operation in one owner-coordinated transaction;\
  \ committed has original owner_commit_ref, result_ref and dispatch_receipt_ref, with original_append_result_ref\
  \ null. If that atomic boundary cannot be established, the action remains unavailable. The shared alert store\
  \ stays F3-453's one store, with no per-surface copy. Append only after authenticated owner commit/readback. Explicitly\
  \ adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2 including its full-value v2 successor, genuine original\
  \ eleven-field first AppendReceipt, retained four-field original_append_result and actual original EventRecord.\
  \ Exact identity, semantic payload, Storage instance, sequence, segment/offset and durability must all join independently.\
  \ Only then set settled with all four refs nonnull and publish terminal success. An uncertain append fences later\
  \ writes to that subject; recovery resolves the ORIGINAL identity, never reruns the command or fabricates a receipt.\
  \ Prepared with no commit may abandon only after original absence proof; ambiguous state fences. Committed retries\
  \ recover append with frozen semantics; settled retries return original result/receipt. No wall clock renewal.\n\
  \nOriginal operation custody is canonical and non-rebuildable; its schema is Plans/alert_event_contracts/alert_rule_muted_operation.schema.json.\
  \ The owner commit ref resolves original shared alert state, never a current replacement with the same revision.\
  \ Backup/restore must include coherent original operation, shared alert/rule state, Storage source and first/full-value\
  \ receipt custody and source/deletion dependencies under one verified recovery boundary. Missing/mixed instances\
  \ or missing original evidence fence mutation and disclose unavailable. History cannot recreate deleted source\
  \ bodies. Reads authenticate current Project membership, source access and deletion tombstones at disclosure,\
  \ including after every returning helper; IDs/hashes/refs confer no access. No raw alert text, private rationale\
  \ or source content is copied into the event or custody.\n\nNewly authored projector.alert_rule_muted.history@1.0.0\
  \ and reader.alert_rule_muted.history@1.0.0 expose this family's passive History audit refs; GUI inbox state is\
  \ independently read from F3-453, never inferred as mutation authority from History. Checkpoint key alert_rule_muted_checkpoint.v1:{project_id}:{storage_instance_id},\
  \ schema Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json. Explicitly adopt SP-278 and DL-076:\
  \ CURRENT-selected complete generic EventRecord index, whole nine-field durable index_read_token (no persisted\
  \ redb_snapshot_id); live snapshot id is rejoined and authenticated on each scan/read/advance. Scan every source\
  \ sequence through the captured frontier, filter exact Project and alert.rule_muted, validate each matching EventRecord/payload\
  \ and atomically CAS the whole prior checkpoint to the verified frontier in ONE derived-redb transaction. The\
  \ checkpoint stores only this constant-count token/frontier/last-match value, never an event_refs array, page\
  \ list or retained-history manifest. through_sequence_id is the complete scanned frontier, not merely the last\
  \ match; last_event_id is the final matching event id or null for no matches. Never skip corrupt/unknown source\
  \ or advance past an inadmissible event. Reader requires current publication/state, exact scope/instance and adequate\
  \ verified frontier or returns unavailable, never empty success. No checkpoint may advance while this family is\
  \ absent. Lost ack/replay never dispatches an owner command. Rebuild stages a separate publication from retained\
  \ CURRENT-selected source, verifies complete coverage, then atomically withdraws old and publishes new; pruning,\
  \ source-generation or schema change requires rebuild rather than zeroing a live cursor. Legal source deletion\
  \ rebuilds only retained refs, never resurrects deleted content.\n\nCompatibility/withdrawal: only payload 1.0.0\
  \ and the explicit value schema versions are readable; unknown versions fence without coercion. No historical\
  \ write is claimed. StorageMigrationCoordinator must install these exact value schemas before activation; no invented\
  \ store version. Withdrawal first closes writer admission and fences subject mutations, settles every original\
  \ in-flight obligation under its original evidence, then marks this checkpoint withdrawn under whole-value CAS.\
  \ Readers refuse withdrawn/staged publications; a future version requires its own contract/admission and verified\
  \ rebuild, not an alias or in-place event rewrite. Source custody remains subject to holds and its own lifetime.\n\
  \nretention_policy_ref: PENDING_RETENTION_DECISION for this event, its operation and its History checkpoint. Case\
  \ L-3 (SP-026 retention section) offers audit-authority/receipt RP-AUTHORITY-INDEFINITE versus ordinary telemetry\
  \ ordinary telemetry class (policy identifier not assigned here) for event history; RP-PROJECTION-3GEN is a checkpoint\
  \ candidate only. No existing text names alert.rule_muted in a decided class. RT must decide/confirm exact assignment\
  \ and dependent body deletion; do not choose by prefix or expire anything pending that decision. Native execution\
  \ NOT_RUN. Static validation: python3 scripts/pm-alert-event-contracts-check.py.\n Original shared state for this\
  \ family is shared_alert_rule_state.v1:{project_id}:{alert_rule_id}, closed schema Plans/alert_event_contracts/shared_alert_rule_state.schema.json.\
  \ This is a newly authored technical representation of F3-453 existing behavior, reused by each exact handler,\
  \ not another UI store. prior_owner_state and candidate_owner_state are complete frozen original bytes in this\
  \ family operation; exact key/Project/subject/source identity must agree with payload and both snapshots. Candidate\
  \ revision is prior + 1; source_record_ref is unchanged. CAS compares the full prior value, not revision alone,\
  \ and atomically writes candidate plus committed operation before append. No prepared operation may authorize\
  \ mutation without exact family admission. Acknowledge clears unread and preserves presentation/source truth;\
  \ dismiss clears inbox_visible only and preserves source truth; snooze sets original snooze_until and hides until\
  \ the deadline without deleting; mute changes only exact rule state/deadline. Fields unrelated to the exact action\
  \ remain byte-equal. Expiry/read projection is the existing owner behavior and creates no fabricated action event.\
  \ Original immutable owner_commit_ref resolves the operation candidate snapshot even after later revisions. Shared\
  \ state backup is canonical and mandatory; its retention remains PENDING_RETENTION_DECISION independently of the\
  \ source record.\n\nBounded History read-through (newly authored technical binding): reader.alert_rule_muted.history@1.0.0\
  \ reads the exact published checkpoint and its nine-field durable token through SP-278 reader.storage.event_record_index.\
  \ Request carries publication_id, the entire durable token and after_sequence_id (0 initially; unsigned 64-bit).\
  \ These are untrusted resumable read inputs, never new persisted state. Authenticate the original token and join\
  \ its Storage instance to both checkpoint and source_selection; rejoin the actual live redb snapshot on every\
  \ call. Source generation/selection must still validate under SP-278; do not silently substitute a fresh token\
  \ into an old continuation. Changed source needs SP-278 verified translation or a new verified publication and\
  \ a restarted traversal, otherwise unavailable. Scan in canonical sequence order only through the checkpoint's\
  \ through_sequence_id, at most 256 source sequences per response; return at most 64 authenticated exact-family/Project\
  \ event refs and at most 16384 canonical MessagePack response bytes. Stop before the first ref that would exceed\
  \ either response bound. An individual ref or token that cannot fit is invalid source/metadata, never silently\
  \ dropped. A continuation repeats publication_id and the complete token and advances after_sequence_id to the\
  \ last actually examined source sequence; it must not advance past an unreturned match. Empty filtered pages carry\
  \ continuation until complete=true at the frontier. Complete=true with zero matches is empty History only after\
  \ full verified coverage, never because a scan budget expired. Reader holds/revalidates publication, original\
  \ source access, deletion and withdrawal at disclosure; invalid/withdrawn publication or a cursor beyond frontier\
  \ returns unavailable. No History read dispatches an action or changes the checkpoint. Rebuild/withdrawal fences\
  \ apply equally to every continuation. This bounds a read, not retention: all retained History remains reachable\
  \ through repeated calls.\n\nSP-340 physical binding: alert_rule_muted_operation is canonical MessagePack in the\
  \ canonical redb file, coordination_and_storage group (advisory canonical budget); alert_rule_muted_checkpoint\
  \ is canonical MessagePack in the derived redb file, event_log group (hard derived budget with eviction/rebuild).\
  \ Each value is at most 16384 encoded bytes, measured before CAS. F3-453 shared_alert_state/shared_alert_rule_state\
  \ use canonical MessagePack in canonical redb, settings_and_layout group, same maximum. Their original snapshots\
  \ remain in this family's canonical operation. Budget pressure never refuses canonical history or prunes it; derived\
  \ eviction makes History unavailable until verified rebuild. Metadata/ref values exceeding the physical maximum\
  \ are invalid and cannot commit; no accumulating history/body is placed in them. No duration, history-count cap\
  \ or retention assignment is added. Size-boundary and 1000-match read-through oracles are in this family's fixture.\
  \ The unadmitted earlier draft's event_refs checkpoint is not a current schema; if encountered as an installation\
  \ input it requires a governed rebuild, never truncation or in-place relabeling.\n\nCurrent append and original retry select replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and must fail replay_only_not_appendable before any canonical write or effect. EventRecord inline bodies at most 16 KiB; above that use the SP-337 BLAKE3/size/media-type payload_ref, never base64 body stuffing. This does not relax the 16384-byte closed operation/checkpoint maximum: oversized metadata is refused before effects. Identifier patterns require full-string matching, including rejection of a trailing LF; no trimming or normalization. History response is exactly the closed object {publication_id, index_read_token, after_sequence_id, event_refs, complete}; index_read_token is the full nine-field durable token. Measure canonical MessagePack of that entire object for every candidate response, including an empty completion/continuation. Metadata or one matching ref that cannot individually fit returns unavailable without advancing past the match. Static large-valid-token, exact-response-boundary, unpageable-metadata and replay-only negatives do not replace native authorization/byte/CAS proofs."
gui_related: false
gui_classification_reason: Storage/event contract, no new UI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- alert.rule_muted is denied until its own admission; exact identity, custody, recovery and negative paths are checked.
- Retention remains PENDING_RETENTION_DECISION; native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-alert-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: alert_rule_muted
implementation_surfaces:
- Plans/event_payloads/attention/alert_rule_muted.schema.json
- Plans/storage-plan.md#SP-662
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/FinalGUISpec.md#F3-453
preserved_exact_tokens:
- alert.rule_muted
- PENDING_RETENTION_DECISION
negative_constraints:
- No append, native activation, checkpoint advance or admission from this preparation.
```

### SP-663 - alert.snoozed original custody and history

```yaml
plan_unit_id: SP-663
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Newly authored technical custody binding: original_command is the complete closed normalized accepted command context with every candidate payload field except schema_id, schema_version and result_* fields. It retains the original subject/source reference, actor, prior revision/state, currentness, options, correlation, idempotency key and original ts; optional fields retain original presence. This private snapshot does not expand the public command signature. request_digest is lowercase SHA-256 of canonical MessagePack {original_command: operation.original_command, candidate_payload: operation.payload}; every field and optional presence participates, with no Storage-assigned metadata. Both owner snapshots join Project, subject, immutable source, revision and lifecycle state to the frozen command/payload; unchanged fields agree with the prior snapshot and only the specified action effects differ. No supplied digest or snapshot copy grants authority. Newly authored owner contract for alert.snoozed 1.0.0 under DL-045; prepared without admission.\
  \ Only cmd.alert.snooze, handled by handlers::alert::snooze, produces this exact family. Existing closed payload\
  \ is Plans/event_payloads/attention/alert_snoozed.schema.json (pm.attention_event.alert_snoozed.schema.v1); no\
  \ sibling admission. Semantic owner is F3-703, payload route CV-683, storage route SP-663. Transition: unacknowledged\
  \ or acknowledged -> snoozed until snooze_until, strictly after ts; keep original deadline on replay; never suppress\
  \ blocking confirmations or security-sensitive failures. Current owner must prove the action is allowed, including\
  \ permission, current subject revision and currentness_basis_ref. Mute/snooze cannot suppress blocking confirmations\
  \ or security-sensitive failures; dismissal cannot clear a blocker. A refusal, stale result, no change, rollback\
  \ or failed persistence produces no event.\n\nIdentity is Project-scoped EventRecord v2, scope_partition project~base64url_no_pad(UTF8(project_id));\
  \ envelope project_id equals payload project_id, actor_ref/correlation_id/idempotency_key/occurred_at_utc equal\
  \ the payload fields (ts for occurrence); thread/run/node/attempt and parent/causation refs are null unless an\
  \ authentic caller supplies the corresponding original linkage, never ambient defaults. Let H be lowercase SHA-256\
  \ of canonical MessagePack of the array [storage_instance_id, project_id, \"alert.snoozed\", idempotency_key].\
  \ event_id is evt_alert_snoozed_ followed by H; operation_digest is H. The idempotency key is the original accepted\
  \ command key, not reminted on recovery. Request digest covers the full admitted command, subject alert_id, actor,\
  \ current revision and exact candidate payload. Same key with unequal digest fails conflict before effects. The\
  \ command's original revision and subject ref must equal the independently read owner record, and result_revision\
  \ equals prior_revision + 1. Server-side secret screening rejects secret-bearing strings even if the lexical schema\
  \ accepts them.\n\nOrdering: under the original Project permission/currentness/owner mutation fence, validate\
  \ exact registry membership FIRST; currently absent means deny before journal/body/effect/checkpoint. On future\
  \ admission, freeze original payload and identity in alert_snoozed_operation.v1:{project_id}:{operation_digest}\
  \ before mutation. State prepared has all four result/commit/receipt refs null. CAS the exact subject revision\
  \ and commit its candidate owner state together with the committed operation in one owner-coordinated transaction;\
  \ committed has original owner_commit_ref, result_ref and dispatch_receipt_ref, with original_append_result_ref\
  \ null. If that atomic boundary cannot be established, the action remains unavailable. The shared alert store\
  \ stays F3-453's one store, with no per-surface copy. Append only after authenticated owner commit/readback. Explicitly\
  \ adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2 including its full-value v2 successor, genuine original\
  \ eleven-field first AppendReceipt, retained four-field original_append_result and actual original EventRecord.\
  \ Exact identity, semantic payload, Storage instance, sequence, segment/offset and durability must all join independently.\
  \ Only then set settled with all four refs nonnull and publish terminal success. An uncertain append fences later\
  \ writes to that subject; recovery resolves the ORIGINAL identity, never reruns the command or fabricates a receipt.\
  \ Prepared with no commit may abandon only after original absence proof; ambiguous state fences. Committed retries\
  \ recover append with frozen semantics; settled retries return original result/receipt. No wall clock renewal.\n\
  \nOriginal operation custody is canonical and non-rebuildable; its schema is Plans/alert_event_contracts/alert_snoozed_operation.schema.json.\
  \ The owner commit ref resolves original shared alert state, never a current replacement with the same revision.\
  \ Backup/restore must include coherent original operation, shared alert/rule state, Storage source and first/full-value\
  \ receipt custody and source/deletion dependencies under one verified recovery boundary. Missing/mixed instances\
  \ or missing original evidence fence mutation and disclose unavailable. History cannot recreate deleted source\
  \ bodies. Reads authenticate current Project membership, source access and deletion tombstones at disclosure,\
  \ including after every returning helper; IDs/hashes/refs confer no access. No raw alert text, private rationale\
  \ or source content is copied into the event or custody.\n\nNewly authored projector.alert_snoozed.history@1.0.0\
  \ and reader.alert_snoozed.history@1.0.0 expose this family's passive History audit refs; GUI inbox state is independently\
  \ read from F3-453, never inferred as mutation authority from History. Checkpoint key alert_snoozed_checkpoint.v1:{project_id}:{storage_instance_id},\
  \ schema Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json. Explicitly adopt SP-278 and DL-076:\
  \ CURRENT-selected complete generic EventRecord index, whole nine-field durable index_read_token (no persisted\
  \ redb_snapshot_id); live snapshot id is rejoined and authenticated on each scan/read/advance. Scan every source\
  \ sequence through the captured frontier, filter exact Project and alert.snoozed, validate each matching EventRecord/payload\
  \ and atomically CAS the whole prior checkpoint to the verified frontier in ONE derived-redb transaction. The\
  \ checkpoint stores only this constant-count token/frontier/last-match value, never an event_refs array, page\
  \ list or retained-history manifest. through_sequence_id is the complete scanned frontier, not merely the last\
  \ match; last_event_id is the final matching event id or null for no matches. Never skip corrupt/unknown source\
  \ or advance past an inadmissible event. Reader requires current publication/state, exact scope/instance and adequate\
  \ verified frontier or returns unavailable, never empty success. No checkpoint may advance while this family is\
  \ absent. Lost ack/replay never dispatches an owner command. Rebuild stages a separate publication from retained\
  \ CURRENT-selected source, verifies complete coverage, then atomically withdraws old and publishes new; pruning,\
  \ source-generation or schema change requires rebuild rather than zeroing a live cursor. Legal source deletion\
  \ rebuilds only retained refs, never resurrects deleted content.\n\nCompatibility/withdrawal: only payload 1.0.0\
  \ and the explicit value schema versions are readable; unknown versions fence without coercion. No historical\
  \ write is claimed. StorageMigrationCoordinator must install these exact value schemas before activation; no invented\
  \ store version. Withdrawal first closes writer admission and fences subject mutations, settles every original\
  \ in-flight obligation under its original evidence, then marks this checkpoint withdrawn under whole-value CAS.\
  \ Readers refuse withdrawn/staged publications; a future version requires its own contract/admission and verified\
  \ rebuild, not an alias or in-place event rewrite. Source custody remains subject to holds and its own lifetime.\n\
  \nretention_policy_ref: PENDING_RETENTION_DECISION for this event, its operation and its History checkpoint. Case\
  \ L-3 (SP-026 retention section) offers audit-authority/receipt RP-AUTHORITY-INDEFINITE versus ordinary telemetry\
  \ ordinary telemetry class (policy identifier not assigned here) for event history; RP-PROJECTION-3GEN is a checkpoint\
  \ candidate only. No existing text names alert.snoozed in a decided class. RT must decide/confirm exact assignment\
  \ and dependent body deletion; do not choose by prefix or expire anything pending that decision. Native execution\
  \ NOT_RUN. Static validation: python3 scripts/pm-alert-event-contracts-check.py.\n Original shared state for this\
  \ family is shared_alert_state.v1:{project_id}:{alert_id}, closed schema Plans/alert_event_contracts/shared_alert_state.schema.json.\
  \ This is a newly authored technical representation of F3-453 existing behavior, reused by each exact handler,\
  \ not another UI store. prior_owner_state and candidate_owner_state are complete frozen original bytes in this\
  \ family operation; exact key/Project/subject/source identity must agree with payload and both snapshots. Candidate\
  \ revision is prior + 1; source_record_ref is unchanged. CAS compares the full prior value, not revision alone,\
  \ and atomically writes candidate plus committed operation before append. No prepared operation may authorize\
  \ mutation without exact family admission. Acknowledge clears unread and preserves presentation/source truth;\
  \ dismiss clears inbox_visible only and preserves source truth; snooze sets original snooze_until and hides until\
  \ the deadline without deleting; mute changes only exact rule state/deadline. Fields unrelated to the exact action\
  \ remain byte-equal. Expiry/read projection is the existing owner behavior and creates no fabricated action event.\
  \ Original immutable owner_commit_ref resolves the operation candidate snapshot even after later revisions. Shared\
  \ state backup is canonical and mandatory; its retention remains PENDING_RETENTION_DECISION independently of the\
  \ source record.\n\nBounded History read-through (newly authored technical binding): reader.alert_snoozed.history@1.0.0\
  \ reads the exact published checkpoint and its nine-field durable token through SP-278 reader.storage.event_record_index.\
  \ Request carries publication_id, the entire durable token and after_sequence_id (0 initially; unsigned 64-bit).\
  \ These are untrusted resumable read inputs, never new persisted state. Authenticate the original token and join\
  \ its Storage instance to both checkpoint and source_selection; rejoin the actual live redb snapshot on every\
  \ call. Source generation/selection must still validate under SP-278; do not silently substitute a fresh token\
  \ into an old continuation. Changed source needs SP-278 verified translation or a new verified publication and\
  \ a restarted traversal, otherwise unavailable. Scan in canonical sequence order only through the checkpoint's\
  \ through_sequence_id, at most 256 source sequences per response; return at most 64 authenticated exact-family/Project\
  \ event refs and at most 16384 canonical MessagePack response bytes. Stop before the first ref that would exceed\
  \ either response bound. An individual ref or token that cannot fit is invalid source/metadata, never silently\
  \ dropped. A continuation repeats publication_id and the complete token and advances after_sequence_id to the\
  \ last actually examined source sequence; it must not advance past an unreturned match. Empty filtered pages carry\
  \ continuation until complete=true at the frontier. Complete=true with zero matches is empty History only after\
  \ full verified coverage, never because a scan budget expired. Reader holds/revalidates publication, original\
  \ source access, deletion and withdrawal at disclosure; invalid/withdrawn publication or a cursor beyond frontier\
  \ returns unavailable. No History read dispatches an action or changes the checkpoint. Rebuild/withdrawal fences\
  \ apply equally to every continuation. This bounds a read, not retention: all retained History remains reachable\
  \ through repeated calls.\n\nSP-340 physical binding: alert_snoozed_operation is canonical MessagePack in the\
  \ canonical redb file, coordination_and_storage group (advisory canonical budget); alert_snoozed_checkpoint is\
  \ canonical MessagePack in the derived redb file, event_log group (hard derived budget with eviction/rebuild).\
  \ Each value is at most 16384 encoded bytes, measured before CAS. F3-453 shared_alert_state/shared_alert_rule_state\
  \ use canonical MessagePack in canonical redb, settings_and_layout group, same maximum. Their original snapshots\
  \ remain in this family's canonical operation. Budget pressure never refuses canonical history or prunes it; derived\
  \ eviction makes History unavailable until verified rebuild. Metadata/ref values exceeding the physical maximum\
  \ are invalid and cannot commit; no accumulating history/body is placed in them. No duration, history-count cap\
  \ or retention assignment is added. Size-boundary and 1000-match read-through oracles are in this family's fixture.\
  \ The unadmitted earlier draft's event_refs checkpoint is not a current schema; if encountered as an installation\
  \ input it requires a governed rebuild, never truncation or in-place relabeling.\n\nCurrent append and original retry select replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and must fail replay_only_not_appendable before any canonical write or effect. EventRecord inline bodies at most 16 KiB; above that use the SP-337 BLAKE3/size/media-type payload_ref, never base64 body stuffing. This does not relax the 16384-byte closed operation/checkpoint maximum: oversized metadata is refused before effects. Identifier patterns require full-string matching, including rejection of a trailing LF; no trimming or normalization. History response is exactly the closed object {publication_id, index_read_token, after_sequence_id, event_refs, complete}; index_read_token is the full nine-field durable token. Measure canonical MessagePack of that entire object for every candidate response, including an empty completion/continuation. Metadata or one matching ref that cannot individually fit returns unavailable without advancing past the match. Static large-valid-token, exact-response-boundary, unpageable-metadata and replay-only negatives do not replace native authorization/byte/CAS proofs."
gui_related: false
gui_classification_reason: Storage/event contract, no new UI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- alert.snoozed is denied until its own admission; exact identity, custody, recovery and negative paths are checked.
- Retention remains PENDING_RETENTION_DECISION; native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-alert-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: alert_snoozed
implementation_surfaces:
- Plans/event_payloads/attention/alert_snoozed.schema.json
- Plans/storage-plan.md#SP-663
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/FinalGUISpec.md#F3-453
preserved_exact_tokens:
- alert.snoozed
- PENDING_RETENTION_DECISION
negative_constraints:
- No append, native activation, checkpoint advance or admission from this preparation.
```

### SP-664 - panel.redocked current chat-only audit and history

```yaml
plan_unit_id: SP-664
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored owner contract for panel.redocked 2.0.0 under DL-045, prepared without admission.
  CV-361, SP-330, UCC-203 and F3-637 already govern the product: only the desktop chat can pop out and return, the
  web client has no Pop out, and restart puts chat in its column without dispatching redock. cmd.panel.redock, handled
  by handlers::panel::redock in the shared panel shell, is this family''s sole producer. Successful transition is
  detached_window -> chat_column for panel_id=chat and the same window_id. A redock must name the currently detached
  window; an undock must verify the actual newly settled window for this command. Refusal, stale session/revision,
  wrong target, web unsupported, no change, preview, cancellation, failed persistence or rollback emits nothing.
  Neither event advances a Home layout revision, saves popped-out state, writes a host into the Home record or co-emits
  workspace.layout_changed. persisted=true describes the audit event; host_state_persisted=false is mandatory. The
  existing expected_layout_revision command input remains a checked original Home-context precondition where supplied,
  never a host revision or an instruction to advance layout. The current payload is Plans/event_payloads/panel_redocked_v2.schema.json,
  schema pm.event.panel_redocked.v2; semantic route F3-704, payload route CV-684.


  Identity: EventRecord v2 uses actual original project_id and project~base64url_no_pad(UTF8(project_id)) when Project-scoped;
  a global_shell invocation without a Project uses null project_id and the unchanged app partition, with actual
  storage_instance_id/server_id under CV-366. A home_workspace origin requires original Project/workspace_tab_id.
  No focus/main/empty-Project fallback. Envelope scope, actor_ref, correlation_id, idempotency_key and occurred_at_utc
  join the frozen payload (settled_at_utc); thread/run/node/attempt/parent/causation are null unless independently
  authenticated original linkage exists. app_session_id is a fresh opaque identity issued by the shell once per
  process lifetime and shared by its chat column/window, never a Home tab or a restored identifier. Host revision
  starts at zero for that session; compare the entire in-memory prior snapshot and advance exactly one for a settled
  move. Let H be lowercase SHA-256 of canonical MessagePack [storage_instance_id, server_id, scope_partition, app_session_id,
  "panel.redocked", idempotency_key]. event_id=evt_panel_redocked_H and operation_digest=H. Request digest is lowercase SHA-256 of canonical MessagePack of the exact closed preimage {original_command: operation.original_command, candidate_payload: operation.payload}. Both values are the complete frozen closed objects, with every field including settled_at_utc and interaction_transaction_id; omit, normalize or regenerate nothing. original_command retains actor, actual scope/session/window and original expected revisions. Neither changed payload nor changed command may reuse the original digest. Same key with unequal command/digest is conflict before any effect. Session/scope/window
  joins must match the independently read shell owner, not caller claims.


  Producer ordering: validate exact event registry membership before journal, window effect, append or checkpoint;
  currently absent is deny. On future admission, under original permission/currentness/session and single-chat-host
  fence, freeze original command/payload and prior/candidate snapshots into panel_redocked_operation.v1:{storage_instance_id}:{scope_partition}:{app_session_id}:{operation_digest},
  schema Plans/panel_event_contracts/panel_redocked_operation.schema.json. A prepared journal has null commit/result/receipt
  refs. The shell may then perform this single host move and verify the actual OS/shell settled state for the same
  session/window, holding all other host moves. Persist the authenticated original outcome and immutable candidate
  snapshot as the committed operation with nonnull owner_commit_ref, result_ref and dispatch_receipt_ref, before
  append. These refs resolve that operation''s original immutable evidence, never live host state after another
  move. If the effect cannot be proven or the commit fails, keep the operation fenced; terminal success is unavailable.
  Transient OS/shell state and redb are not claimed to share a transaction. The journal''s durable commit records
  evidence that the transient move really settled; it is never a saved layout and never instructs restart to restore
  it.


  Explicitly adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2, including the full-value v2 successor,
  genuine original eleven-field first AppendReceipt, retained four-field original_append_result and actual original
  EventRecord. Append only the frozen exact event after durable original commit/readback; independently join instance,
  identity, semantic payload, sequence, segment/offset and durability. Only then CAS committed -> settled with original_append_result_ref
  nonnull and publish terminal success. An uncertain append fences later host mutations. Committed/settled retries
  recover/return the original result and receipt without opening/closing/moving a window or renewing a timestamp.
  Prepared ambiguity remains fenced while the session lives. After verified old-process termination, no transient
  host survives: a prepared operation may become abandoned_uncommitted only with original durable-commit and append
  absence proofs; never infer absence just from a missing window. A committed operation after restart still owes
  append recovery under its original identity, but never restores its candidate host or dispatches a command. A
  settled old-session result is historical evidence, never proof of a current popped-out host. No restart redock
  event is fabricated.


  Custody: the operation is canonical non-rebuildable original audit evidence; it retains frozen prior/candidate
  host observations, immutable result/dispatch refs and first/full-value receipt custody. No raw chat text, title,
  window geometry, credentials, account material or absolute local path enters payload/journal; server-side secret
  screening applies to all strings. Refs grant no access. Disclosure requires current scope membership/source access,
  deletion checks and current host/session proof for any action after returning helpers. Coherent mandatory backup
  includes operations, source EventRecords and genuine original receipts under the same Storage recovery boundary.
  Restored journals are historical evidence only and never input to host restoration. Missing/mixed originals fence
  mutations and disclose unavailable. No event reader can reconstruct deleted chat bodies.


  Newly authored projector.panel_redocked.history@1.0.0 and reader.panel_redocked.history@1.0.0 expose passive record-backed
  History audit only; current host is independently read from the running shell. Checkpoint key panel_redocked_checkpoint.v1:{storage_instance_id}:{scope_partition},
  schema Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json. Explicitly adopt SP-278/DL-076: complete
  CURRENT-selected generic EventRecord index, full nine-field durable token, no persisted redb_snapshot_id; rejoin/authenticate
  actual live snapshot each scan/read/advance. Scan every source sequence through captured frontier, authenticate
  each exact panel.redocked/scope match, and whole-value CAS prior token/publication/state/frontier/last_event_id
  in one derived-redb transaction. Checkpoint is bounded frontier only, never an all-history event_refs array. through_sequence_id
  is complete scanned coverage; last_event_id is last matching event or null. Corrupt/unknown/inadmissible source
  cannot be skipped. Registry absence forbids advance.


  Reader request binds publication_id, complete durable token and unsigned after_sequence_id (0 initially), all
  authenticated as untrusted inputs. Verify Storage instance, server/scope and Project joins, live SP-278 source
  selection and publication state before reading and at disclosure. At most 256 source sequences, 64 exact matching
  refs and 16384 canonical MessagePack response bytes per page; measure the complete response, stopping before an
  unreturned match. A single oversized ref/token is invalid metadata, never silently dropped. Continuation repeats
  exact publication/token and last actually scanned sequence; empty filtered page is incomplete until frontier is
  reached. No history-count or duration cap is added. Invalid/withdrawn token, cursor beyond frontier or missing
  coverage returns unavailable, never empty success. A changed generation needs verified SP-278 translation or a
  verified new publication and restart; no silent substitution. No History call performs a shell action. Rebuild
  stages a separate publication from verified retained CURRENT-selected source, proves coverage then atomically
  withdraws old/publishes new. Source deletion rebuilds retained coverage only. Derived eviction makes History unavailable
  until rebuild; it cannot erase canonical audit.


  Compatibility and withdrawal: immutable Plans/event_payloads/panel_redocked.schema.json is the original 1.0.0
  reader only. Its generic hosts, durable settled_panel_state_ref, layout revisions and optional co-emission are
  historical interpretation, never current chat authority or a new writer. Dispatch reads by the stored payload
  schema id/version, without rewriting events or treating v1 as v2; unknown versions and unverifiable historical
  originals remain unavailable. Current writes require only the exact 2.0.0 schema/contract and their own future
  admission. StorageMigrationCoordinator must install exact new value schemas before activation, with no invented
  store version. Withdrawal closes writer admission first, fences host moves, settles original in-flight obligations
  without repeating OS effects, then CAS marks checkpoint withdrawn. Readers refuse staged/withdrawn publications
  and stale continuations; successor versions require own contract/admission and verified rebuild, never layout
  aliasing.


  SP-340 physical binding: panel_redocked_operation uses canonical MessagePack in canonical redb, settings_and_layout
  advisory canonical budget, maximum 16384 encoded bytes checked before effect/commit; panel_redocked_checkpoint
  uses canonical MessagePack in derived redb, event_log hard derived budget, same maximum. The operation is one
  bounded original receipt, not an accumulating host/history store; oversized metadata is invalid before effects.
  Budget pressure never prunes canonical audit or refuses a canonical write; derived pressure evicts/rebuilds. Retention
  remains PENDING_RETENTION_DECISION independently for event, operation and checkpoint. Case L-3 audit-authority/receipt
  versus telemetry and RP-PROJECTION-3GEN are candidates, not assignments; the saved-layout class is not silently
  applied to this restart-unsaved host transition. No deletion policy is invented. Fixtures Plans/panel_event_contracts/panel_redocked.fixtures.json
  and python3 scripts/pm-panel-event-contracts-check.py supply this family''s positive/negative schema, identity,
  retry, original-custody, history boundary and withdrawal oracles. Native OS/storage atomicity, receipt authenticity,
  SP-278 source proof, crash/recovery, permissions and backup tests remain NOT_RUN.

  Current append and original retry select replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and must fail replay_only_not_appendable before any canonical write or effect. EventRecord inline bodies at most 16 KiB; above that use the SP-337 BLAKE3/size/media-type payload_ref, never base64 body stuffing. This does not relax the 16384-byte closed operation/checkpoint maximum: oversized metadata is refused before effects. Identifier patterns require full-string matching, including rejection of a trailing LF; no trimming or normalization. History response is exactly the closed object {publication_id, index_read_token, after_sequence_id, event_refs, complete}; index_read_token is the full nine-field durable token. Measure canonical MessagePack of that entire object for every candidate response, including an empty completion/continuation. Metadata or one matching ref that cannot individually fit returns unavailable without advancing past the match. Static large-valid-token, exact-response-boundary, unpageable-metadata and replay-only negatives do not replace native authorization/byte/CAS proofs.

  For an application-scope invocation, CV-366 idempotency_key is exactly application@1:{hex(server_id)}:{hex(interaction_transaction_id)}. interaction_transaction_id is the original shell owner operation identity, not a retry timestamp; hex encodes the exact UTF-8 bytes in lowercase. An arbitrary caller key is refused. Project-scope original keys retain their existing format.'
gui_related: false
gui_classification_reason: Event custody and validation, no new UI.
split_recommended: false
depends_on:
- CV-361
- SP-330
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- SP-664 binds only its explicitly named exact family, prepared without admission; native execution NOT_RUN.
- Exact event admission precedes effects; retention remains PENDING_RETENTION_DECISION.
validation_surfaces:
- python3 scripts/pm-panel-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: chat_panel_event_authority
implementation_surfaces:
- Plans/storage-plan.md
- Plans/panel_event_contracts/
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Contracts_V0.md#CV-361
- Plans/storage-plan.md#SP-330
preserved_exact_tokens:
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
negative_constraints:
- No event admission, saved pop-out host, Home revision advance, replayed OS window effect, retention decision or
  native execution proof.
```

### SP-665 - panel.undocked current chat-only audit and history

```yaml
plan_unit_id: SP-665
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored owner contract for panel.undocked 2.0.0 under DL-045, prepared without admission.
  CV-361, SP-330, UCC-203 and F3-637 already govern the product: only the desktop chat can pop out and return, the
  web client has no Pop out, and restart puts chat in its column without dispatching redock. cmd.panel.undock, handled
  by handlers::panel::undock in the shared panel shell, is this family''s sole producer. Successful transition is
  chat_column -> detached_window for panel_id=chat and the same window_id. A redock must name the currently detached
  window; an undock must verify the actual newly settled window for this command. Refusal, stale session/revision,
  wrong target, web unsupported, no change, preview, cancellation, failed persistence or rollback emits nothing.
  Neither event advances a Home layout revision, saves popped-out state, writes a host into the Home record or co-emits
  workspace.layout_changed. persisted=true describes the audit event; host_state_persisted=false is mandatory. The
  existing expected_layout_revision command input remains a checked original Home-context precondition where supplied,
  never a host revision or an instruction to advance layout. The current payload is Plans/event_payloads/panel_undocked_v2.schema.json,
  schema pm.event.panel_undocked.v2; semantic route F3-705, payload route CV-685.


  Identity: EventRecord v2 uses actual original project_id and project~base64url_no_pad(UTF8(project_id)) when Project-scoped;
  a global_shell invocation without a Project uses null project_id and the unchanged app partition, with actual
  storage_instance_id/server_id under CV-366. A home_workspace origin requires original Project/workspace_tab_id.
  No focus/main/empty-Project fallback. Envelope scope, actor_ref, correlation_id, idempotency_key and occurred_at_utc
  join the frozen payload (settled_at_utc); thread/run/node/attempt/parent/causation are null unless independently
  authenticated original linkage exists. app_session_id is a fresh opaque identity issued by the shell once per
  process lifetime and shared by its chat column/window, never a Home tab or a restored identifier. Host revision
  starts at zero for that session; compare the entire in-memory prior snapshot and advance exactly one for a settled
  move. Let H be lowercase SHA-256 of canonical MessagePack [storage_instance_id, server_id, scope_partition, app_session_id,
  "panel.undocked", idempotency_key]. event_id=evt_panel_undocked_H and operation_digest=H. Request digest is lowercase SHA-256 of canonical MessagePack of the exact closed preimage {original_command: operation.original_command, candidate_payload: operation.payload}. Both values are the complete frozen closed objects, with every field including settled_at_utc and interaction_transaction_id; omit, normalize or regenerate nothing. original_command retains actor, actual scope/session/window and original expected revisions. Neither changed payload nor changed command may reuse the original digest. Same key with unequal command/digest is conflict before any effect. Session/scope/window
  joins must match the independently read shell owner, not caller claims.


  Producer ordering: validate exact event registry membership before journal, window effect, append or checkpoint;
  currently absent is deny. On future admission, under original permission/currentness/session and single-chat-host
  fence, freeze original command/payload and prior/candidate snapshots into panel_undocked_operation.v1:{storage_instance_id}:{scope_partition}:{app_session_id}:{operation_digest},
  schema Plans/panel_event_contracts/panel_undocked_operation.schema.json. A prepared journal has null commit/result/receipt
  refs. The shell may then perform this single host move and verify the actual OS/shell settled state for the same
  session/window, holding all other host moves. Persist the authenticated original outcome and immutable candidate
  snapshot as the committed operation with nonnull owner_commit_ref, result_ref and dispatch_receipt_ref, before
  append. These refs resolve that operation''s original immutable evidence, never live host state after another
  move. If the effect cannot be proven or the commit fails, keep the operation fenced; terminal success is unavailable.
  Transient OS/shell state and redb are not claimed to share a transaction. The journal''s durable commit records
  evidence that the transient move really settled; it is never a saved layout and never instructs restart to restore
  it.


  Explicitly adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2, including the full-value v2 successor,
  genuine original eleven-field first AppendReceipt, retained four-field original_append_result and actual original
  EventRecord. Append only the frozen exact event after durable original commit/readback; independently join instance,
  identity, semantic payload, sequence, segment/offset and durability. Only then CAS committed -> settled with original_append_result_ref
  nonnull and publish terminal success. An uncertain append fences later host mutations. Committed/settled retries
  recover/return the original result and receipt without opening/closing/moving a window or renewing a timestamp.
  Prepared ambiguity remains fenced while the session lives. After verified old-process termination, no transient
  host survives: a prepared operation may become abandoned_uncommitted only with original durable-commit and append
  absence proofs; never infer absence just from a missing window. A committed operation after restart still owes
  append recovery under its original identity, but never restores its candidate host or dispatches a command. A
  settled old-session result is historical evidence, never proof of a current popped-out host. No restart redock
  event is fabricated.


  Custody: the operation is canonical non-rebuildable original audit evidence; it retains frozen prior/candidate
  host observations, immutable result/dispatch refs and first/full-value receipt custody. No raw chat text, title,
  window geometry, credentials, account material or absolute local path enters payload/journal; server-side secret
  screening applies to all strings. Refs grant no access. Disclosure requires current scope membership/source access,
  deletion checks and current host/session proof for any action after returning helpers. Coherent mandatory backup
  includes operations, source EventRecords and genuine original receipts under the same Storage recovery boundary.
  Restored journals are historical evidence only and never input to host restoration. Missing/mixed originals fence
  mutations and disclose unavailable. No event reader can reconstruct deleted chat bodies.


  Newly authored projector.panel_undocked.history@1.0.0 and reader.panel_undocked.history@1.0.0 expose passive record-backed
  History audit only; current host is independently read from the running shell. Checkpoint key panel_undocked_checkpoint.v1:{storage_instance_id}:{scope_partition},
  schema Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json. Explicitly adopt SP-278/DL-076: complete
  CURRENT-selected generic EventRecord index, full nine-field durable token, no persisted redb_snapshot_id; rejoin/authenticate
  actual live snapshot each scan/read/advance. Scan every source sequence through captured frontier, authenticate
  each exact panel.undocked/scope match, and whole-value CAS prior token/publication/state/frontier/last_event_id
  in one derived-redb transaction. Checkpoint is bounded frontier only, never an all-history event_refs array. through_sequence_id
  is complete scanned coverage; last_event_id is last matching event or null. Corrupt/unknown/inadmissible source
  cannot be skipped. Registry absence forbids advance.


  Reader request binds publication_id, complete durable token and unsigned after_sequence_id (0 initially), all
  authenticated as untrusted inputs. Verify Storage instance, server/scope and Project joins, live SP-278 source
  selection and publication state before reading and at disclosure. At most 256 source sequences, 64 exact matching
  refs and 16384 canonical MessagePack response bytes per page; measure the complete response, stopping before an
  unreturned match. A single oversized ref/token is invalid metadata, never silently dropped. Continuation repeats
  exact publication/token and last actually scanned sequence; empty filtered page is incomplete until frontier is
  reached. No history-count or duration cap is added. Invalid/withdrawn token, cursor beyond frontier or missing
  coverage returns unavailable, never empty success. A changed generation needs verified SP-278 translation or a
  verified new publication and restart; no silent substitution. No History call performs a shell action. Rebuild
  stages a separate publication from verified retained CURRENT-selected source, proves coverage then atomically
  withdraws old/publishes new. Source deletion rebuilds retained coverage only. Derived eviction makes History unavailable
  until rebuild; it cannot erase canonical audit.


  Compatibility and withdrawal: immutable Plans/event_payloads/panel_undocked.schema.json is the original 1.0.0
  reader only. Its generic hosts, durable settled_panel_state_ref, layout revisions and optional co-emission are
  historical interpretation, never current chat authority or a new writer. Dispatch reads by the stored payload
  schema id/version, without rewriting events or treating v1 as v2; unknown versions and unverifiable historical
  originals remain unavailable. Current writes require only the exact 2.0.0 schema/contract and their own future
  admission. StorageMigrationCoordinator must install exact new value schemas before activation, with no invented
  store version. Withdrawal closes writer admission first, fences host moves, settles original in-flight obligations
  without repeating OS effects, then CAS marks checkpoint withdrawn. Readers refuse staged/withdrawn publications
  and stale continuations; successor versions require own contract/admission and verified rebuild, never layout
  aliasing.


  SP-340 physical binding: panel_undocked_operation uses canonical MessagePack in canonical redb, settings_and_layout
  advisory canonical budget, maximum 16384 encoded bytes checked before effect/commit; panel_undocked_checkpoint
  uses canonical MessagePack in derived redb, event_log hard derived budget, same maximum. The operation is one
  bounded original receipt, not an accumulating host/history store; oversized metadata is invalid before effects.
  Budget pressure never prunes canonical audit or refuses a canonical write; derived pressure evicts/rebuilds. Retention
  remains PENDING_RETENTION_DECISION independently for event, operation and checkpoint. Case L-3 audit-authority/receipt
  versus telemetry and RP-PROJECTION-3GEN are candidates, not assignments; the saved-layout class is not silently
  applied to this restart-unsaved host transition. No deletion policy is invented. Fixtures Plans/panel_event_contracts/panel_undocked.fixtures.json
  and python3 scripts/pm-panel-event-contracts-check.py supply this family''s positive/negative schema, identity,
  retry, original-custody, history boundary and withdrawal oracles. Native OS/storage atomicity, receipt authenticity,
  SP-278 source proof, crash/recovery, permissions and backup tests remain NOT_RUN.

  Current append and original retry select replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and must fail replay_only_not_appendable before any canonical write or effect. EventRecord inline bodies at most 16 KiB; above that use the SP-337 BLAKE3/size/media-type payload_ref, never base64 body stuffing. This does not relax the 16384-byte closed operation/checkpoint maximum: oversized metadata is refused before effects. Identifier patterns require full-string matching, including rejection of a trailing LF; no trimming or normalization. History response is exactly the closed object {publication_id, index_read_token, after_sequence_id, event_refs, complete}; index_read_token is the full nine-field durable token. Measure canonical MessagePack of that entire object for every candidate response, including an empty completion/continuation. Metadata or one matching ref that cannot individually fit returns unavailable without advancing past the match. Static large-valid-token, exact-response-boundary, unpageable-metadata and replay-only negatives do not replace native authorization/byte/CAS proofs.

  For an application-scope invocation, CV-366 idempotency_key is exactly application@1:{hex(server_id)}:{hex(interaction_transaction_id)}. interaction_transaction_id is the original shell owner operation identity, not a retry timestamp; hex encodes the exact UTF-8 bytes in lowercase. An arbitrary caller key is refused. Project-scope original keys retain their existing format.'
gui_related: false
gui_classification_reason: Event custody and validation, no new UI.
split_recommended: false
depends_on:
- CV-361
- SP-330
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- SP-665 binds only its explicitly named exact family, prepared without admission; native execution NOT_RUN.
- Exact event admission precedes effects; retention remains PENDING_RETENTION_DECISION.
validation_surfaces:
- python3 scripts/pm-panel-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: chat_panel_event_authority
implementation_surfaces:
- Plans/storage-plan.md
- Plans/panel_event_contracts/
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Contracts_V0.md#CV-361
- Plans/storage-plan.md#SP-330
preserved_exact_tokens:
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
negative_constraints:
- No event admission, saved pop-out host, Home revision advance, replayed OS window effect, retention decision or
  native execution proof.
```

### SP-666 - concern.created authorized original creation and History custody

```yaml
plan_unit_id: SP-666
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored owner contract for concern.created 1.0.0 under DL-045, prepared without admission.
  Semantic authority remains Orchestrator_Page OP-002/OP-004 and Executor_Protocol: runtime, package overseer, seam
  overseer, corroboration outcome and graph-patch logic may create canonical concerns. Workers nominate; they cannot
  directly mint concern records. The owner labels User, External Resource and Recovery do not grant direct creation.
  This contract adds no creator and decides none of the six stopped action/confirmation questions. Only cmd.concern.create
  through handlers::concern::create commits this family, after independently authenticating one of those five creator
  identities, its actual scope and current source/authority/permission evidence. A nomination is source evidence
  until an already authorized creator accepts it; acceptance does not grant the nominator a creator role. UI navigation/acknowledge/dismiss
  and true HITL rules remain OP-002''s narrow GUI/runtime split.


  Payload route CV-686 selects the existing closed Plans/event_payloads/concern/concern_created.schema.json, pm.concern_event.concern_created.schema.v1,
  version 1.0.0. Birth is absent -> active at concern_revision=1, never acknowledged/resolved/dismissed, never a
  source-event or projection rewrite. Creator is distinct from accountable owner and resolver. Existing active/acknowledged
  concerns with the same subject/category/owner follow the existing update rule; do not mint another birth to evade
  it. The corresponding update event/action remains stopped pending its own authority contract. A duplicate original
  key returns its original result, not an update or another birth. Refusal, missing permission/currentness, stale
  source, conflict, existing concern key, no change or failed persistence emits nothing. A source sighting is not
  itself concern.created.


  Identity: Project-only EventRecord 2.0.0, scope_kind=project, envelope project_id equals payload and original
  command project_id; the exact reversible partition is project~base64url_no_pad(UTF8(project_id)). No application/default/focus
  Project fallback is added. H is lowercase SHA-256 of canonical MessagePack [storage_instance_id, project_id, "concern.created",
  idempotency_key]. operation_digest=H, event_id=evt_concern_created_H, and the originally allocated concern_id=concern_H.
  Persist that identity once; no retry clock/randomness can remint it. concern_record_ref is exactly pmref:concern_record:{project_id}/{concern_id}/r1
  and resolves the immutable original revision-one snapshot, not a later current value. Payload actor_ref=created_by_ref=the
  original authenticated creator; ts is original accepted creation time. Envelope actor/correlation/idempotency/occurred_at
  joins payload, ts for occurrence. Thread/run/node/attempt/account/parent/causation joins use independently authenticated
  original context or explicit null; do not infer envelope run_id by parsing an opaque run_ref. Redaction profile
  is secret_refs_only; current writer/retry selects replay_policy=dedupe_by_idempotency_key. projector_replay_only
  is compatibility-reader-only and is refused as replay_only_not_appendable before any write or effect.


  Frozen operation schema Plans/concern_created_contracts/concern_created_operation.schema.json closes the original
  normalized owner command, complete candidate payload, prior_record=null and complete candidate_record. The normalized
  original_command retains cmd.concern.create''s exact project/severity/category/source_refs/idempotency key and
  a title_ref resolving its exact original title bytes, plus the authenticated creator/authority/permission/currentness
  and already resolved owner/classification context. This is private owner custody, not an expanded public command
  signature or a new authority policy. title_ref and record.summary resolve the same original bounded/ref-only summary
  source; no lossy title normalization or mutable source replacement. Every ref is authenticated and commits to
  immutable original body identity, including SP-337 BLAKE3 id/byte size/media type for packed detail. Request digest
  is lowercase SHA-256 of canonical MessagePack of the exact closed preimage {original_command: operation.original_command,
  candidate_payload: operation.payload, candidate_record: operation.candidate_record}. Every field participates.
  Same scoped event/idempotency identity with any unequal original command, payload, record or digest is idempotency_conflict
  before effects; authoritative dedupe unavailable is dedupe_unavailable with zero effect. Identity joins cannot
  be repaired by hashing another actor''s evidence.


  Ordering: authenticate the exact event-family registry admission FIRST under original Project permission/currentness
  and owner single-writer fences. This family is currently absent: deny before journal, record/body write, append
  or checkpoint advance. On future admission, resolve immutable original source and accepted command, secret-screen
  all strings and verify key absence plus the existing same-subject rule. Freeze the prepared original in concern_created_operation.v1:{project_id}:{operation_digest};
  all four commit/result/receipt refs are null. Full absence CAS creates concern_record.v1:{project_id}:{concern_id}
  at revision one and commits its complete candidate snapshot plus committed operation in ONE canonical-redb owner
  transaction under the same source/permission fence. committed has nonnull owner_commit_ref, result_ref and dispatch_receipt_ref,
  with original_append_result_ref=null. If body dependencies are needed, durably commit/authenticate them before
  that atomic owner transaction; unreachable orphan body cleanup is Storage-owned and no event success follows.
  If the atomic boundary cannot be provided, creation stays unavailable. Commit evidence authenticates the original
  immutable revision-one record and original command result; a later concern revision cannot substitute for it.


  Explicitly adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2, including the full-value v2 successor,
  genuine original eleven-field first AppendReceipt, retained four-field original_append_result and actual original
  EventRecord. Append the frozen candidate only after authenticated original owner commit/readback. Independently
  join Storage instance, identity, semantic digest/payload, sequence, segment/offset and durability. Only then whole-value
  CAS committed -> settled with all four original refs nonnull and publish terminal success. Uncertain append fences
  related mutations; recovery resolves the ORIGINAL receipt/identity and never recreates the record, changes owner/severity,
  executes a sibling action, reaccepts a nomination or renews ts. Prepared may abandon only after authenticated
  original commit/append absence proofs; ambiguity remains fenced. Committed retries recover append; settled retries
  return the original record ref/result/receipt. Replay and History never dispatch cmd.concern.create.


  The formerly deferred concern_record key keeps its existing identity. Its newly authored complete encoding is
  Plans/concern_created_contracts/concern_record.schema.json, pm.storage_value.concern_record.v1, 1.0.0. It carries
  the shared record envelope/minimum concern fields with a ref-valued summary, source/evidence/artifact/lineage
  refs, subject/run/scope, severity/category/status, visibility/attention/chatworthy/blocking-effect context, and
  separate creator/owner/resolver fields. The original command''s owner context supplies these values; this technical
  materialization assigns no new roles, severity consequences, confirmation policy or user-visible behavior. concern_category
  joins payload category; creator_ref and created_by_ref join the original creator; source_event_refs join source_refs;
  created_at=updated_at=payload ts for birth. resolution_kind/resolver_ref/resolved_at are null at birth. OP-004''s
  four status values and eight resolution_kind values remain authoritative; no fifth lifecycle state is added from
  stale consumer prose. Later action schemas still need their own settled owner/authority contracts; this encoding
  grants none. concern_source_event_ref/source_event_refs, canonical record and concern_projection stay distinct.
  A current Orchestrator action reads/revalidates the actual canonical concern record and current source/permissions,
  never a History row or page-local status.


  Custody: canonical record and original operation are non-rebuildable original authority. Preserve immutable original
  candidate, source/detail dependencies, accepted command and genuine first/full-value receipt custody. Coherent
  mandatory backup/restore includes all of them with the original Storage source under one verified recovery boundary.
  Missing/mixed-instance originals fence creation and disclose unavailable; a projection cannot recreate lost authority.
  Refs/IDs/digests grant no access. At read/disclosure and after returning helpers, revalidate current Project membership,
  source/body permission, deletion tombstones, original source selection and withdrawal. Never resurrect deleted
  source content from a History ref. No raw title, private rationale, source text, credentials, account material
  or absolute local path is copied into event/journal/checkpoint; ref resolution remains owner-governed.


  Newly authored projector.concern_created.history@1.0.0 and reader.concern_created.history@1.0.0 expose passive
  record-backed History audit refs for this exact family only. Checkpoint concern_created_checkpoint.v1:{project_id}:{storage_instance_id},
  schema Plans/concern_created_contracts/concern_created_checkpoint.schema.json. Explicitly adopt SP-278/DL-076:
  complete CURRENT-selected generic EventRecord index and full nine-field durable index_read_token, no persisted
  redb_snapshot_id. Authenticate/rejoin actual live redb snapshot and Storage/source_selection instance each scan/read/advance.
  Scan every source sequence through the captured frontier, authenticate each exact Project/concern.created payload
  and original receipt, and whole-value CAS prior token/publication/state/frontier/last_event_id to verified coverage
  in ONE derived-redb transaction. through_sequence_id is complete scanned coverage, last_event_id is last match
  or null. No event_refs array or accumulating manifest is persisted; registry absence forbids advance. Corrupt,
  unknown-version or inadmissible source is unavailable, never skipped.


  History request contains exact publication_id, complete durable token and unsigned after_sequence_id (0 initially).
  Return the exact closed object {publication_id, index_read_token, after_sequence_id, event_refs, complete}. Authenticate
  original publication/token, exact scope/Storage/source-generation, source access/deletion and live snapshot before
  read and at disclosure. Scan at most 256 source sequences and return at most 64 matching refs and 16384 canonical
  MessagePack bytes of the COMPLETE response. Stop before an unreturned match; an individually unpageable ref or
  metadata value returns unavailable with no skipped match. Empty filtered pages continue with last actually scanned
  sequence until complete=true at verified frontier, never empty success merely because a budget expired. Cursor
  beyond frontier, stale/withdrawn publication or missing coverage is unavailable. Source-generation change requires
  SP-278 verified translation or verified new publication and restarted traversal, never silent token substitution.
  This bounds each response, not retained History. Readers perform no mutation/dispatch and do not advance the persisted
  checkpoint.


  Rebuild stages a separate publication from retained verified CURRENT-selected source and proves complete coverage
  before atomically withdrawing old/publishing new. Legal source deletion rebuilds retained refs only. Withdrawal
  closes this family''s writer admission, fences new creations, settles original in-flight obligations under original
  evidence without redoing creation, then CAS marks its checkpoint withdrawn. Readers refuse staged/withdrawn publications
  and stale continuations. Compatibility: only the exact current payload 1.0.0 and declared value schemas are selected;
  unknown/old unversioned/deferred placeholder values are unavailable until StorageMigrationCoordinator''s governed
  validation/recovery, never guessed upgraded. It installs these exact schemas before activation, without an invented
  store version. Any future event version needs its own contract/admission and verified rebuild; no sibling or alias
  admission, historical rewrite or automatic retention/deletion follows.


  SP-340 physical binding: concern_created_operation uses canonical MessagePack in canonical redb, coordination_and_storage
  advisory budget. concern_record preserves its existing canonical-redb/runs_and_goals profile, 16384-byte maximum
  and unchanged group budget. concern_created_checkpoint uses derived redb/event_log hard budget. Each complete
  value is at most 16384 encoded bytes before journal/CAS/commit; unpageable metadata is invalid, never truncated.
  Body content above EventRecord''s 16 KiB inline cap uses SP-337 payload_ref (BLAKE3 id, byte size, media type),
  never inline base64. Original title/detail refs retain the same immutable bytes; canonical budget pressure neither
  prunes authority nor authorizes loss, derived eviction makes History unavailable until rebuild. Existing concern_record
  retention_policy_ref=RP-AUTHORITY-INDEFINITE and linked-source/blocked-episode holds are preserved from its current
  registry row; this is no extension to a different event. Event, original operation and History checkpoint remain
  independently PENDING_RETENTION_DECISION, with Case L-3 audit-authority/ordinary telemetry and RP-PROJECTION-3GEN
  only candidates for RT. No expiration/deletion decision is invented. Identifier patterns match entire strings
  including trailing-LF refusal, with no trimming. Fixtures Plans/concern_created_contracts/concern_created.fixtures.json
  and python3 scripts/pm-concern-created-contracts-check.py cover the exact family. Native source/creator/permission
  authentication, atomic create/commit/CAS, genuine append/receipts, crash recovery, rebuild/withdrawal and coherent
  backup/deletion remain NOT_RUN. Nothing here admits an event or makes a native writer available.'
gui_related: false
gui_classification_reason: Event identity, authority, custody and storage contract; existing GUI action model is
  preserved.
split_recommended: false
depends_on:
- OP-002
- OP-004
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- concern.created is prepared without admission; no writer/checkpoint/effect while absent.
- No additional creator or sibling action authority; retention pending and native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-concern-created-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: concern_created
implementation_surfaces:
- Plans/concern_created_contracts/
- Plans/event_payloads/concern/concern_created.schema.json
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Orchestrator_Page.md#OP-002
- Plans/Orchestrator_Page.md#OP-004
- Plans/Executor_Protocol.md
- Plans/UI_Command_Catalog.md#UCC-147
preserved_exact_tokens:
- concern.created
- SP-278
- SP-286
- PENDING_RETENTION_DECISION
negative_constraints:
- No creator expansion, worker direct creation, admission, sibling action grants, retention decision or native proof.

```
