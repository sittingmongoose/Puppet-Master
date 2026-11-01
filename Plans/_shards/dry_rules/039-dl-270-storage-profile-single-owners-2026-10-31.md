# Shard 039: DL-270 storage profile single owners - 2026-10-31

Source: `Plans/DRY_Rules.md`

Source lines: L4902-L5050

Source SHA256: `eff67b42326af9f8db77404ad46ca47c8f27c4eab707ad1f51be345cd095044a`

---

## DL-270 storage profile single owners - 2026-10-31

DL-270 gives each storage rule one owning unit, and a few numbers appear in more than one of them. This table routes each rule to its owner so that every other document points instead of copying.

| Rule | Single owner | What only the owner states | Known consumers (point only) |
|---|---|---|---|
| Sealed-segment compression | `Plans/storage-plan.md` SP-335 | zstd level 3 in about 256 KiB blocks, level 9 in 1 MiB blocks, the ceiling of level 9, the active segment's `flags=0`; SP-346 owns the sealed container bytes and the reserved compression descriptor (amended 2026-11-01, DL-270) | `Plans/Contracts_V0.md` (frame wire form), RAS-016 (cites the ceiling), SP-337 (cites the level for text payloads) |
| Durability | SP-336 | one data sync per ordinary group, the barrier-class events, the three full-flush calls and F_BARRIERFSYNC, batching of streamed output, atomic store creation, redb quick repair | `Plans/Executor_Protocol.md` final flush, SP-236, SP-286 |
| Payloads | SP-337 | the 16 KiB inline cap, the BLAKE3 id, pack files, the base64 admission error, reference counts, garbage collection holds | `Plans/Tools.md` (T-168), `Plans/Contracts_V0.md` web payloads, `Plans/Prompt_Pipeline.md` (PP-070), `Plans/Project_Output_Artifacts.md`, SP-331 background images, SP-343 media |
| Chat pages | SP-338 (store, page limits, open-path gate numbers) and `Plans/assistant-chat-design.md` ACD-242 (load-older paging in the chat) | 50-item pages of at most 256 KiB, thread_head, hot tail, first page 150 ms at p95, warm or cold, at most 2 MiB read | `Plans/FinalGUISpec.md` F3-416, DR-052, SP-344 |
| JSON copies and read paths | SP-339 (what is retired, what stays a file) and DR-083 (the one read path) | the retired files, the kept files, the four read commands | `Plans/usage-feature.md`, FileSafe, Scout, Backup |
| redb families | SP-340 (its storage registry rows are a pending companion) | the 16 KiB value maximum, canonical or derived file, disk budget, compaction trigger | Back_Seat_Driver, LSPSupport, Permissions_System, Working_Notebook, Tools rollups, FileManager glossary |
| Analytics archive | SP-341 | Parquet by family and month at seal, DuckDB embedded, on demand, read-only, the Scout split | `Plans/usage-feature.md`, Scout |
| Usage history | `Plans/usage-feature.md` UF-108, with its policy row in `Plans/storage_value_registry.json#/retention_policies` | detailed usage records follow the existing `ai.usage.usage-retention` setting (90 days by default); daily totals per account, provider and model are kept forever whatever it says | SP-341, the storage-plan retention table, usage-feature Problem 5 |
| Engine requirements | SP-342 and `Plans/Spec_Lock.json` `forbid_sqlite` | the four requirements, commit confirmation p99 at most 50 ms, no storage-caused UI stall over 50 ms, the SQLite ban and its two exceptions | SP-344 |
| Remote transport | `Plans/Remote_Access_System.md` RAS-016 | zstd level 3, 1 MiB window, brotli and permessage-deflate fallback, uncompressed in-app UI | none |
| Media | SP-343 | lossless WebP, pixel-identical check, evidence keeps exact bytes, AV1 or HEVC recordings | SP-337 |
| Release gates | SP-344 (suite shape and OS list only) | 20 producer streams, 100k-event paging, a backup and maintenance run, the crash cases; the thresholds stay SP-338's and SP-342's | CI |
| Placement | SP-345 (rule) and SP-015 (exact paths) | `.noindex` on macOS, AppData on Windows, XDG data on Linux, few large pack files | storage-plan OS indexer notes |
| Backup capture | `Plans/Backup_Restore_System.md` BRS-031, on BRS-005's barrier | brief capture barrier, background incremental copy, derived families not backed up, the shown loss window | BRS-008, section 4.2 |
| Sizes and times shown | DR-044's one shared formatter and time-zone implementation | byte sizes, durations and times in storage health, the backup loss window and the inspector | every storage surface |

### DR-082 - One Owner For Each DL-270 Storage Rule

```yaml
plan_unit_id: DR-082
unit_type: ssot_rule
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Each rule of the DL-270 storage profile (Jared, 2026-10-31) has exactly one owning unit, named in the table above,
  and every other document points to it by unit id and restates none of its fields, lists or thresholds. This file
  owns the routing and never the values. A number, level, cap, window or budget is stated by its owner. Where a
  gate or a sentence needs the number to be read alone, the copy equals the owner's, and when the two differ the
  owner wins and the copy is corrected in the same change. Retention windows and per-family limits are machine
  values to be held in Plans/storage_value_registry.json (its retention_policies catalog and its family rows), a
  registry companion DL-270 lists as pending; until it lands, UF-108 and SP-340 are the owners, and no consumer
  carries its own copy. A plan that persists state says which of seglog events, redb
  families, payload-store references, render-page store pages, Parquet archive files or Tantivy indexes it uses and
  cites the owning unit. A store, cache, blob directory, mirror file or compression setting that duplicates one of
  these owners is a DRY failure, not a peer option: large and identical bodies are kept only in the payload store
  (SP-337), the stored chat page form is only the render-page store (SP-338), and the analytics copy is only the
  Parquet archive (SP-341). The render-page store is a derived, rebuildable projection of the one transcript store,
  never a second authority over it. A hash-addressed ref with its own time to live is a cache-eligibility rule over
  a payload-store entry and not a separate store.
gui_related: false
gui_classification_reason: "Routes storage rules to their owners; no visible surface."
split_recommended: false
depends_on: [DL-270, SP-335, SP-336, SP-337, SP-338, SP-339, SP-340, SP-341, SP-342, SP-343, SP-344, SP-345, ACD-242, UF-108, BRS-031, RAS-016, DR-044]
unblocks: []
acceptance_criteria:
  - "Every row of the table names one owner unit that exists, and no value in the table's second column is owned by a second unit."
  - "A value restated outside its owner equals the owner's value."
  - "No document outside Plans/storage-plan.md defines its own payload, chat page, compression, durability or redb-limit rule."
  - "No second store for large bodies, no second page form for a chat thread and no second analytics copy exists."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: storage_owner_drift
reasoning_tier: high
context_scope: dl270_storage_profile_owners
implementation_surfaces:
  - "Plans/DRY_Rules.md"
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "Plans/storage-plan.md#SP-335"
  - "Plans/storage-plan.md#SP-345"
preserved_exact_tokens:
  - "BLAKE3"
  - "Parquet"
  - "zstd"
negative_constraints:
  - "Do not restate a DL-270 threshold, cap or list in a consumer; cite the owner unit."
  - "Do not give DRY_Rules.md ownership of a storage value."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - "Plans/DRY_Rules.md"
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-270, ContractName:Plans/storage-plan.md#SP-335, ContractName:Plans/storage-plan.md#SP-337, ContractName:Plans/storage-plan.md#SP-338, ContractName:Plans/storage-plan.md#SP-340, ContractName:Plans/usage-feature.md#UF-108

### DR-083 - One Read Path For Stored State And One Storage Health

```yaml
plan_unit_id: DR-083
unit_type: ssot_rule
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Stored state is read through one set of commands and one viewer, never through files kept up to date for the
  purpose (DL-270, SP-339). pm db dump, pm inspect, pm tail and pm export are the command-line reads and the in-app
  record inspector is the one viewer; the commands and the inspector call the same read handlers, each with one
  canonical command identity and one sole handler (DR-041). Their ids belong to UI_Command_Catalog and
  Commands_System and are not defined here. JSON and JSONL are written only by pm export, on request, and a SQLite
  file only by the optional pm export --sqlite (SP-342). No projector, debug dump or compatibility step writes a JSON
  or JSONL copy of canonical state while Puppet Master runs. The files SP-339 keeps stay files and the inspector does
  not replace them. The inspector and pm export apply the storage owner's redaction and no scrubber of their own.
  Storage health has one data owner, SP-340 (usage, budget, reclaimable bytes and the last compaction per family),
  and one verified reclaim action, the existing cmd.storage.compaction.request (one action for the whole storage instance, results shown per group), run under the maintenance lease. The backup screen's last
  verified backup and its shown loss window belong to BRS-031. Sizes, durations and times on all of them come from
  the app's one shared formatter and time-zone implementation (DR-044).
gui_related: true
gui_classification_reason: "Fixes one viewer, one set of read commands and one storage health for stored state."
split_recommended: false
depends_on: [DL-270, SP-339, SP-340, SP-342, BRS-031, DR-041, DR-044, DR-071]
unblocks: []
acceptance_criteria:
  - "pm db dump, pm inspect, pm tail, pm export and the record inspector each resolve to one handler, shared by the command line and the app."
  - "No file under storage/jsonl, .puppet-master/state/*.json, active-agents.json, agent-messages.json, filesafe-events.jsonl, usage.jsonl or a Scout per-item file is written while Puppet Master runs."
  - "Storage health and the backup loss window format sizes and times with DR-044's formatter."
  - "Storage health has no second reclaim action and no second compaction trigger."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: duplicate_read_path_or_health_owner
reasoning_tier: high
context_scope: dl270_stored_state_read_path
implementation_surfaces:
  - "Plans/DRY_Rules.md"
  - "Plans/UI_Command_Catalog.md"
  - "Plans/Commands_System.md"
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "Plans/storage-plan.md#SP-339"
  - "Plans/storage-plan.md#SP-340"
preserved_exact_tokens:
  - "pm db dump"
  - "pm inspect"
  - "pm tail"
  - "pm export"
negative_constraints:
  - "Do not add a mirror file, debug dump or projector that writes JSON or JSONL of canonical state."
  - "Do not define a second formatter, scrubber, reclaim action or inspector."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - "Plans/DRY_Rules.md"
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-270, ContractName:Plans/storage-plan.md#SP-339, ContractName:Plans/storage-plan.md#SP-340, ContractName:Plans/DRY_Rules.md#DR-041, ContractName:Plans/DRY_Rules.md#DR-044
