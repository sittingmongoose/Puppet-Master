# Shard 039: DL-270 storage profile single owners - 2026-10-31

Source: `Plans/DRY_Rules.md`

Source lines: L4744-L5370

Source SHA256: `dd347352cddb25f2be08d51b81df50cec81d13a55f6543ff71176a198f390d58`

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

### DR-084 - One Settings Resolver

```yaml
plan_unit_id: DR-084
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: |-
  Every ordinary value, origin, requested/effective result, Changed, Varies, managed explanation and first-paint value comes from pm.settings_effective_value.v1 for the exact Project/Computer/tagged Host/Device/thing/thread/run context. SSYS-059 classifies rows; SSYS-060 owns writer/mirror/currentness and SSYS-063 owns presentation. Existing owner ladders are inputs, not peer resolvers. No project skips only Project. More-careful/custom fallback, Computer ceilings, theme_pair and Reduce motion/OS combinations remain declared, not guessed by a consumer. Rows, Details, search, hosted controls, Usage, terminal/editor, managers, copy, Doctor, first paint and agents consume the same result and as-of state. They cannot read layer records to reconstruct precedence or store a last-painted value. Models and account owners retain their own selection/merge semantics and frozen audit editions.
gui_related: false
gui_classification_reason: This unit defines decision history, vocabulary, owner boundaries or data-contract acceptance,
  not visual implementation.
depends_on:
- DL-281
unblocks: []
acceptance_criteria:
- Every named consumer references the sole owner and selected edition rather than recreating its engine.
- Positive app/Project behavior and wrong-scope/currentness/owner negatives are specified together.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: duplicate_owner_or_scope_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/DRY_Rules.md
- Plans/Settings_System.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#DR-084
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- pm.settings_effective_value.v1
- Changed
- Varies
- theme_pair
negative_constraints:
- Do not create a peer resolver, runtime, storage, writer, command, event, native proof or unbounded bucket.
owner_hints:
- Plans/Settings_System.md#SSYS-059
- Plans/Settings_System.md#SSYS-060
- Plans/Settings_System.md#SSYS-063
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-059, ContractName:Plans/Settings_System.md#SSYS-060, ContractName:Plans/Settings_System.md#SSYS-063


### DR-085 - One Detached Settings Copy Engine

```yaml
plan_unit_id: DR-085
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: |-
  Onboarding, New Project, duplicate_configuration, Saved setups, Transfer, promotion, import and explicit join use the same Settings preview/apply/rollback engine and exact disjoint selector ID sets, including project_only_rows. Use settings from is one concept with new-Project and existing-Project routes. Own values are the default; effective_values/Keep them fixed is explicit. Manager things, profiles, commands and account choices contribute owner subtransactions with source/destination identities, expected revisions, truthful readback and eligible compensation. Settings never directly writes their records, installs tools, transfers keys/trust, merges fields against owner semantics or keeps a live link to the source. New-registry copy is committed only after real Project reservation/rebind; opening an already registered Project, Later and connect-only do not perform it. Failure and multi-Computer done/not_reached/refused outcomes stay honest and queue nothing. Custom commands use CS-081's existing commands.* local actions; no cmd.commands.custom.* peer family is admitted.
gui_related: false
gui_classification_reason: This unit defines decision history, vocabulary, owner boundaries or data-contract acceptance,
  not visual implementation.
depends_on:
- DL-284
unblocks: []
acceptance_criteria:
- Every named consumer references the sole owner and selected edition rather than recreating its engine.
- Positive app/Project behavior and wrong-scope/currentness/owner negatives are specified together.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: duplicate_owner_or_scope_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/DRY_Rules.md
- Plans/Settings_System.md
- Plans/Project_System.md
- Plans/Commands_System.md
- Plans/Multi-Account.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#DR-085
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- Use settings from
- project_only_rows
- effective_values
- commands.*
negative_constraints:
- Do not create a peer resolver, runtime, storage, writer, command, event, native proof or unbounded bucket.
owner_hints:
- Plans/Settings_System.md#SSYS-062
- Plans/Project_System.md#PJCT-009
- Plans/Commands_System.md#CS-081
- Plans/Multi-Account.md#MA-074
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-062, ContractName:Plans/Project_System.md#PJCT-009, ContractName:Plans/Commands_System.md#CS-081, ContractName:Plans/Multi-Account.md#MA-074


### DR-086 - One Reviewed Setup Draft Engine

```yaml
plan_unit_id: DR-086
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: |-
  PJCT-009 owns one reviewed setup draft, its applicability, currentness, commit, phase receipts and remote-create recovery. PWIZ-037's Onboarding/New Project and ACD-510's conversion-to-new render that owner; no second form engine, repository-create wrapper, success boolean or timer-driven progress is added. Current answers determine valid Back/Edit/forward/resume history, invalidate discarded branches and require fresh Review. Intake uses real source Computer/transport/read evidence before Project reservation. Exact per-forge create/fork/source/Settings/registry receipts control handoff and replay/resume; unknown remote effect reconciles before retry. Necessary source auth, protected trust, Backup and Settings rebind remain with their owners. N15 Later performs its explicit app setup without a fake Project. Existing FO-22, DL-273 and exact return fences remain product requirements; O55/PJX concept APIs are source history only.
gui_related: false
gui_classification_reason: This unit defines decision history, vocabulary, owner boundaries or data-contract acceptance,
  not visual implementation.
depends_on:
- DL-293
- DL-294
unblocks: []
acceptance_criteria:
- Every named consumer references the sole owner and selected edition rather than recreating its engine.
- Positive app/Project behavior and wrong-scope/currentness/owner negatives are specified together.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: duplicate_owner_or_scope_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/DRY_Rules.md
- Plans/Project_System.md
- Plans/Planning_Wizard.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#DR-086
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- PJCT-009
- FO-22
- DL-273
negative_constraints:
- Do not create a peer resolver, runtime, storage, writer, command, event, native proof or unbounded bucket.
owner_hints:
- Plans/Project_System.md#PJCT-009
- Plans/Project_System.md#PJCT-010
- Plans/Planning_Wizard.md#PWIZ-037
```

ContractRef: ContractName:Plans/Project_System.md#PJCT-009, ContractName:Plans/Project_System.md#PJCT-010, ContractName:Plans/Planning_Wizard.md#PWIZ-037


### DR-087 - One Chat Conversion Engine

```yaml
plan_unit_id: DR-087
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: |-
  ACD-510/511 owns one conversion manifest and preview/apply/resume/cancel/Undo engine for new or existing destinations, local or cross-Server, person Regular or guarded YOLO. It calls Project for registration, PSB for fenced copy/check/cutover, Settings and every content/Goal/Crew/Plan/notebook/scheduler owner for their exact subtransactions; it cannot privately rewrite immutable associations or copied approval as authority. Each family has an explicit moved/stayed/held/recreated disposition, including active tasks, full history and independently retained custody. New Project listing precedes cutover; source and destination have one live writer/index. N25 defaults linked new records; a rebind needs its complete separate owner contract. Timers stop/fence and exact replacements are explicitly re-admitted. Undo ends at first new work or seven days, revalidates both Computers, never deletes remote/changed work and does not clear Stop or independent retention. Project-to-Project chat movement remains later.
gui_related: false
gui_classification_reason: This unit defines decision history, vocabulary, owner boundaries or data-contract acceptance,
  not visual implementation.
depends_on:
- DL-291
unblocks: []
acceptance_criteria:
- Every named consumer references the sole owner and selected edition rather than recreating its engine.
- Positive app/Project behavior and wrong-scope/currentness/owner negatives are specified together.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: duplicate_owner_or_scope_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/DRY_Rules.md
- Plans/assistant-chat-design.md
- Plans/Project_Sync_and_Backbone.md
- Plans/Goal_Runtime_System.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#DR-087
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- N25
- Undo
- seven days
negative_constraints:
- Do not create a peer resolver, runtime, storage, writer, command, event, native proof or unbounded bucket.
owner_hints:
- Plans/assistant-chat-design.md#ACD-510
- Plans/assistant-chat-design.md#ACD-511
- Plans/Project_Sync_and_Backbone.md#PSB-007
- Plans/Goal_Runtime_System.md#GRS-087
- Plans/Assistant_Plan_Runtime.md#APR-074
- Plans/Scheduling_and_Quota_Resume.md#SQR-019
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-510, ContractName:Plans/assistant-chat-design.md#ACD-511, ContractName:Plans/Project_Sync_and_Backbone.md#PSB-007, ContractName:Plans/Goal_Runtime_System.md#GRS-087, ContractName:Plans/Assistant_Plan_Runtime.md#APR-074, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-019


### DR-088 - One Read Coverage Object And Formatter

```yaml
plan_unit_id: DR-088
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: |-
  All admitted explicit Project/chat list/search/read tools and their UI/answer surfaces consume the same coverage object and quiet expandable formatter: requested, looked_in, not_looked_in with reason, and partial with missing range/cursor/index coverage. Every requested source is accounted for subject to redaction of existence the person cannot access. Empty, filtered, partial, offline, denied, archived-skipped or missing/rebuilding-index results never collapse to an unqualified none. Source-Computer custody, per-read authority, source switch, currentness and provider exposure remain checked by Tools/Permissions. Bounded authorized result merging is the only cross-project exception; no physical index merge, ambient retrieval, private-memory/notebook read or current-focus fallback is admitted. The formatter owns disclosure only, not a second search engine, permission resolver, event stream or message transport.
gui_related: false
gui_classification_reason: This unit defines decision history, vocabulary, owner boundaries or data-contract acceptance,
  not visual implementation.
depends_on:
- DL-289
unblocks: []
acceptance_criteria:
- Every named consumer references the sole owner and selected edition rather than recreating its engine.
- Positive app/Project behavior and wrong-scope/currentness/owner negatives are specified together.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: duplicate_owner_or_scope_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/DRY_Rules.md
- Plans/Tools.md
- Plans/assistant-chat-design.md
- Plans/Permissions_System.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#DR-088
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- requested
- looked_in
- not_looked_in
- partial
negative_constraints:
- Do not create a peer resolver, runtime, storage, writer, command, event, native proof or unbounded bucket.
owner_hints:
- Plans/Tools.md#T-185
- Plans/assistant-chat-design.md#ACD-509
- Plans/Permissions_System.md#PS-145
```

ContractRef: ContractName:Plans/Tools.md#T-185, ContractName:Plans/assistant-chat-design.md#ACD-509, ContractName:Plans/Permissions_System.md#PS-145


### DR-089 - One Destination Account Readiness List

```yaml
plan_unit_id: DR-089
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: |-
  Copy, onboarding AI, Set up AI here like, managers and model/Usage pickers resolve the same explicitly chosen provider/account ID on the same actual work Computer through MA-074/MACS-006. The one readiness list is ready_here, check_there, sign_in_there, key_needed, not_installed, expired, cannot_move. Installed, authenticated and ready are distinct. The destination resolves its own credential_ref/profile_ref and current Host/Environment/connection proof; matching labels or another host's sign-in cannot establish readiness. Same-Computer reuse requires the account choice. Keys, CLI profile bytes, pairings, executable trust and provider-native history never travel. Missing readiness is an honest action, not auto-install, guessed replacement or second account store. Protected sign-in retains its human-only owner and exact initiating Client/operation/return; app setup uses the deliberate app binding.
gui_related: false
gui_classification_reason: This unit defines decision history, vocabulary, owner boundaries or data-contract acceptance,
  not visual implementation.
depends_on:
- DL-284
unblocks: []
acceptance_criteria:
- Every named consumer references the sole owner and selected edition rather than recreating its engine.
- Positive app/Project behavior and wrong-scope/currentness/owner negatives are specified together.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: duplicate_owner_or_scope_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/DRY_Rules.md
- Plans/Multi-Account.md
- Plans/Multi-Account_Connection_Spec.md
- Plans/Settings_System.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#DR-089
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- ready_here
- check_there
- sign_in_there
- key_needed
- not_installed
- expired
- cannot_move
- credential_ref
- profile_ref
negative_constraints:
- Do not create a peer resolver, runtime, storage, writer, command, event, native proof or unbounded bucket.
owner_hints:
- Plans/Multi-Account.md#MA-074
- Plans/Multi-Account_Connection_Spec.md#MACS-006
- Plans/Settings_System.md#SSYS-062
```

ContractRef: ContractName:Plans/Multi-Account.md#MA-074, ContractName:Plans/Multi-Account_Connection_Spec.md#MACS-006, ContractName:Plans/Settings_System.md#SSYS-062


### DR-090 - One Automation Permission Admission

```yaml
plan_unit_id: DR-090
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: |-
  Permissions alone composes human, mode and build_grant authority, actual task/target/resource ownership, current Plan/permission/account/capability/Stop/revocation and parent/receiver ceilings through final dispatch. UI/domain wrappers consume that result; they cannot add a second ordinary YOLO publication yes, claim human_confirmed=true for automation, mint durable Always/trust, bypass protected auth/secrets or expand another scope's authority. PS-147's verified created-resource identity is required for grant cleanup; a named pre-existing or replaced resource is not created ownership, and Y1 never permits main/default/protected force-push. One existing run-owner Stop fences children before new work. What the build did uses the shared ObservableWork/History receipt projection; no private action log, runner, grant engine or generic build.* event is created. True Undo/compensation and No safe Undo are distinguished by the actual effect owner.
gui_related: false
gui_classification_reason: This unit defines decision history, vocabulary, owner boundaries or data-contract acceptance,
  not visual implementation.
depends_on:
- DL-285
- DL-298
- DL-299
unblocks: []
acceptance_criteria:
- Every named consumer references the sole owner and selected edition rather than recreating its engine.
- Positive app/Project behavior and wrong-scope/currentness/owner negatives are specified together.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: duplicate_owner_or_scope_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/DRY_Rules.md
- Plans/Permissions_System.md
- Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#DR-090
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- human
- mode
- build_grant
- human_confirmed=true
- No safe Undo
negative_constraints:
- Do not create a peer resolver, runtime, storage, writer, command, event, native proof or unbounded bucket.
owner_hints:
- Plans/Permissions_System.md#PS-144
- Plans/Permissions_System.md#PS-146
- Plans/Permissions_System.md#PS-147
- Plans/Permissions_System.md#PS-148
- Plans/Shared_Integration_Runtime.md#SIR-055
```

ContractRef: ContractName:Plans/Permissions_System.md#PS-144, ContractName:Plans/Permissions_System.md#PS-146, ContractName:Plans/Permissions_System.md#PS-147, ContractName:Plans/Permissions_System.md#PS-148, ContractName:Plans/Shared_Integration_Runtime.md#SIR-055


### DR-091 - One Scope Model For Application Workflows

```yaml
plan_unit_id: DR-091
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: |-
  No-project chat, Goals, all admitted collaboration kinds including Crew, Assistant Plan/Deep Plan and scheduled messages/tasks use real application scope under CV-365/366/368: project_id=null with actual Server/thread/Computer/roots and the exact admitted owner binding. They reuse existing runtime, coordination/board, custody, quota, backup, recovery, permission and Stop owners. One counterpart bucket per owning Server/family has the same limits and retention/hold rules, including a counterpart's explicit no-cap policy; no per-chat cap reset or invented infinite bucket. Only Planning Wizard, PRD Builder and Orchestrator retain no-project workflow gates; actual Project-target operations remain separately checked. Source/version/codec/hash/key/append/read/backup graphs must be selected coherently or that edge stays unavailable. Historical Project records remain exact, retired Goal events remain historical-only and conversion uses DR-087's linked birth or complete owner rebind. A null field does not prove a native app writer or Project workflow certification.
gui_related: false
gui_classification_reason: This unit defines decision history, vocabulary, owner boundaries or data-contract acceptance,
  not visual implementation.
depends_on:
- DL-287
- DL-292
unblocks: []
acceptance_criteria:
- Every named consumer references the sole owner and selected edition rather than recreating its engine.
- Positive app/Project behavior and wrong-scope/currentness/owner negatives are specified together.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: duplicate_owner_or_scope_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/DRY_Rules.md
- Plans/Contracts_V0.md
- Plans/Goal_Runtime_System.md
- Plans/Collaborative_Workflows.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#DR-091
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- project_id=null
- application scope
- historical-only
negative_constraints:
- Do not create a peer resolver, runtime, storage, writer, command, event, native proof or unbounded bucket.
owner_hints:
- Plans/Contracts_V0.md#CV-365
- Plans/Contracts_V0.md#CV-366
- Plans/Contracts_V0.md#CV-368
- Plans/Goal_Runtime_System.md#GRS-086
- Plans/Collaborative_Workflows.md#CWR-045
- Plans/Assistant_Plan_Runtime.md#APR-073
- Plans/Scheduling_and_Quota_Resume.md#SQR-019
```

ContractRef: ContractName:Plans/Contracts_V0.md#CV-365, ContractName:Plans/Contracts_V0.md#CV-366, ContractName:Plans/Contracts_V0.md#CV-368, ContractName:Plans/Goal_Runtime_System.md#GRS-086, ContractName:Plans/Collaborative_Workflows.md#CWR-045, ContractName:Plans/Assistant_Plan_Runtime.md#APR-073, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-019


### DR-092 - One Scheduler And Dispatch Eligibility Predicate

```yaml
plan_unit_id: DR-092
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: |-
  App and Project scheduled messages/tasks, Build At, execution windows and quota resumes use the one Scheduling owner, SQR-019/020. The task's named Server owns timers; no Client timer, second app scheduler, silent Computer fallback or backlog burst exists. Commit freezes exact text/attachments/destination or exact target version/hash/topology/team, modes/account/runtime, zone/DST/missed/grace policy and original source/cancel custody. Build At performs one atomic schedule_build/window write and creates no run yet. Occurrence idempotency and twice-checked dispatch revalidate actual scope/roots/targets/permissions/capability/writer/consent and task/scope Stop epochs. App and Project pause are independent operational records with user-only clear, never Settings defaults. Conversion fences old authority and explicitly re-admits exact mapped targets without latest substitution, consent transfer, double dispatch or clearing Stop. Goal continuation/Crew Auto remain distinct kinds of automation and goal.scheduled stays historical-only.
gui_related: false
gui_classification_reason: This unit defines decision history, vocabulary, owner boundaries or data-contract acceptance,
  not visual implementation.
depends_on:
- DL-292
- DR-091
unblocks: []
acceptance_criteria:
- Every named consumer references the sole owner and selected edition rather than recreating its engine.
- Positive app/Project behavior and wrong-scope/currentness/owner negatives are specified together.
validation_surfaces:
- Phase-2 owner/companion semantic checks after the interface freeze; not execution evidence.
risk_class: duplicate_owner_or_scope_drift
reasoning_tier: high
context_scope: projects_refresh_pass2_20261103
implementation_surfaces:
- Plans/DRY_Rules.md
- Plans/Scheduling_and_Quota_Resume.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#DR-092
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#approved-2026-11-03
preserved_exact_tokens:
- Build At
- schedule_build
- Stop
- goal.scheduled
negative_constraints:
- Do not create a peer resolver, runtime, storage, writer, command, event, native proof or unbounded bucket.
owner_hints:
- Plans/Scheduling_and_Quota_Resume.md#SQR-019
- Plans/Scheduling_and_Quota_Resume.md#SQR-020
- Plans/Assistant_Plan_Runtime.md#APR-074
- Plans/Contracts_V0.md#CV-368
```

ContractRef: ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-019, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-020, ContractName:Plans/Assistant_Plan_Runtime.md#APR-074, ContractName:Plans/Contracts_V0.md#CV-368
