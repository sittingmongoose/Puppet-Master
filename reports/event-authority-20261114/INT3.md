# INT3 — batch-3 Event Authority integration (stream E)

Branch `plans/ea-batch3-int-20261114`, full worktree `/home/sittingmongoose/pm-worktrees/int3` (kept). No landing, landing lock, `main` push, reseal, registry append, admission or admission Decision Log entry. Native execution stays NOT_RUN everywhere; every result below is synthetic oracle or planning evidence.

## Base

- **Start:** `origin/main` `87793bb7fd442b2a1c7650d4c7e5d3407ed683fc` (fetched 2026-11-14 about 03:10Z), carrying batch 2.
- **Main update merges:** `main` moved twice while the branch was built, only under `Concepts/` and then `Plans/.audits/`. Merged as `a0e7b6703d` (`69a5f383b7`, 86 Concepts-only commits) and `ee101a86b8` (`65f5bba1f5`, 9 `Plans/.audits` paths). No other path changed on `main`.
- **Content head of the dry landing check:** `ee101a86b87941bc35477e8e5441bd1114f6c174`. Later commits add only `reports/` (this report and W3B's self-grade gaps) unless the DG-INT section says otherwise.

## Merges

Each merge is `git merge --no-ff` at the exact SHA, with the remote head checked equal first.

| # | Item | Head | Merge commit |
|---|---|---|---|
| 1 | DG integration | `65ddd80e5c43d79a234fdcf6f645722ea35bea1f` | `033972a6c0` |
| 2 | W3A Forge | `4dba25103b684bcf7c440e77df47957ab9681cba` | `4cf6dc840e` |
| 3 | W3B Source Control | `9ac79bf91b6b4d29668832c9221e785156b74ff7` | `efafe0ce1f` |
| 4 | W3C test capture | `f61865d809d9e2cdc856e6d6b8bc7e19af55557a` | `392532e5fe` |
| 5 | W3E server, remote, backup | `3755f0b0f91aa3746ab41c90449366542d93a24c` | `2cfdaebbca` |
| 6 | W3F discovery and prompts | `dafe3513e149f6a63a95b1bb9e3ceb66c46e81a4` | `08cc3ff663` |
| 7 | W3G plan, research, notebook | `3d9af182f86903d19cb8b692a47399f5e81a8583` | `6526c50334` |
| 8 | W3H 4b names | `05719d8e39402d996a5b8519930d036324cc8d96` | `608038f43c` |
| 9 | W3I continuity and HITL | `a5255e13e84613ecd3142127bda34888c9a00c4b` | `cf5b23e10d` |
| 10 | W3D Back Seat Driver (lead, after recheck 2 CLEAN_WITH_NOTES) | `030678268ae9dd4992cf04c459fecc77afb89c28` | `de37a048d6` |

**Gated tools unchanged:** `scripts/pm_guard_isolation.py`, `scripts/pm_guard_isolation_traps.py`, `scripts/pm_guard_isolation_dg6b_example.py`, `scripts/guard-isolation/README.md` and `Plans/guard_isolation_traps.json` are byte-identical to `004bdedd63` and to `main`. Every NUMRULE file of `58c2816ff3` is identical to `main` at the merged head (main carries the gated nested-binding fix `f304bfaf64` and batch 2's sanctioned T198 data on top of `58c2816ff3`). The only NUMRULE files this branch changes are the four T198 data files below.

### Conflicts resolved

| Rule | Count | Result |
|---|---:|---|
| Derived `Plans/_shards/**`, `Plans/.plan_index/**`: take `main`'s side (one path absent on `main` removed in merges 1 and 9), regenerate once after all merges | 6,702 paths | Regenerated; never hand-merged |
| Owner-document append/append at the end of the base: `main`'s text first, then each item in merge order | 40 file-merges | 0 residual conflicts. Files: ATS (10 merges), Contracts_V0 (8), storage-plan (10), Executor_Protocol (2), Goal_Runtime_System (2), Shared_Integration_Runtime, Source_Control_System, Permissions_System, Assistant_Plan_Runtime, Commands_System, Containers_Registry_and_Unraid, Scheduling_and_Quota_Resume (1 each) |
| Same-point insertion inside a document (not at its end): main first, then the lane | 1 (W3A, Contracts_V0 before section 1.3) | `main`'s 1.2.1 block, then W3A's envelope bindings, then 1.3 |
| `Plans/storage_value_registry.json` merged by key (`family_id`, `policy_id`, `disposition_id`), rendered exactly as `main` renders it (indent 2, literal Unicode) | 6 merges (DG-INT, W3A, W3E, W3F, W3H, W3I) | 0 duplicate-key conflicts; W3H's Chat policy object hunk resolved to `main`'s identical value |
| Census pins | — | Re-pinned once (item list below) |
| `Plans/UI_Command_Catalog.md` | — | Not touched by any item |

After every merge: PlanUnit ids unique (0 duplicates across all `Plans/**/*.md`; 8,691 units at merge 10), and CV-1100, CV-1101, SP-1100 and SP-1101 each one copy. Every changed JSON and JSONL file parses.

The merge tooling is in `drafts/INT3/tools/` (`merge3.py`, `json3.py`, `do_merge.py`); the per-merge record is `drafts/INT3/conflicts.jsonl`.

## Integration items

| # | Item | Status |
|---|---|---|
| 1 | Receipt time profile (E5-2 = A) | Done |
| 2 | T198 date-time inventory refresh | Done; one tool false refusal routed (T215) |
| 3 | Policy objects; W3E's 60 pending rows; registry diagnostics 0 | Done, with lead decision B for six rows and lead decision A for W3A's token rows |
| 4 | Retention deck 6 (W3B's 19 source facts) | Done (DL-510) |
| 5 | W3E `source_custody_ref` | Done: registry and schemas agree |
| 6 | Record-only items | Recorded below |
| 7 | W3I recheck-3 editorial notes | N1, N2 fixed; N3 recorded |

### 1. Receipt time profile (Jared, E5-2 = A)

The AppendReceipt `acknowledged_at_utc` takes the EventRecord profile. Commits `ff3e81e0c9` and `0d8bed4ea2`.

| Checker | Change | Witnesses | Tables | Checker | Guard tool |
|---|---|---|---|---|---|
| W3A RC16 (`scripts/pm_w3a_forge_events.py`) | `clock_ok(..., EVENT_RECORD)` | positives `settle/receipt-ack-offset` (`-05:00`) and `settle/receipt-ack-lowercase-z`; RC16 negatives now missing zone and hour 24 (the old `+00:00` negative is owner-valid) | `receipt__04` regenerated | pass, 1,120 positives / 21,969 negatives (lane 980 / 21,829) | `receipt__04` PASS 4/4 |
| W3G TM04 (`scripts/pm_w3g_events.py`, map `TIMESTAMP_FIELDS`) | `clock(..., EVENT_RECORD)`, map profile EVENT_RECORD | `extra/<f>/<s>/append/ack-offset` and `ack-lowercase-z` accepted | `tm` regenerated | pass, 8,822 cases (648 / 8,174; lane 582 / 8,174) | `tm` PASS 4/4; 205 other table reports reused (module SHA-256 and suite digests identical); 6 entailed single-row tables have no tool run |
| W3H JR08 (`scripts/pm_w3h_events.py`, `timestamp_inventory` map) | `clock(..., EVENT_RECORD)`, map profile EVENT_RECORD | the four former negatives `+00:00`, `-00:00`, lowercase z and a nonzero offset are now accepted witnesses (`verify/<f>/<scope>/settled/receipt-ack-*`, Storage's issued receipt moved with them so ST06 still joins); negatives kept: trailing LF, hour 24, no zone, 30 February | `jr` regenerated | pass, 8,274 cases (1,397 / 6,877; lane 1,181 / 7,005) | `jr` PASS 8/8; other tables reused |
| `main`'s DM RS23 (`scripts/pm-small-owner-events.py` `bound_profile`, generator `:122`, `pm_small_owner_table_resolve.py`) | both DM recipes bind `ack` to EVENT_RECORD | checker asserts `-00:00`, `-05:00` and lowercase z accepted, hour 24 and no zone refused | RS23 moved to `pm_small_owner_table_resolve_entailed.py` (see below) | PASS, 55,631 assertions (55,599 + 32) | `resolve` PASS 25/25; `resolve_entailed` has RS23 alone, no negative |

**DM RS23 is entailed.** Under the EventRecord profile, RS01 (`custody_valid`: `custody_v2` validated with `format_checker(EVENT_RECORD)`) refuses first every value RS23 would refuse. So the old RS23 p2a witness becomes `RS01-ack-clock-event-record` (hour 24, refused at RS01). Kept inside the resolve table, RS23 had no negative and the gated tool then credited none of the 26 rows (FAIL, `unproved_guards`, 0/26). RS23 now sits in its own single-row table, evaluated right after `resolve`, as W3E's `entailed_receipt_ack_profile`. Checker acceptance is unchanged. Commit `scripts: DM RS23 moves to its own entailed table` (on the branch before `ee101a86b8`).

**Confirmed on the EventRecord profile already:** W3B (`pm_w3b_event_oracles.py:518`), W3C (`pm_w3c_event_oracles.py:89`), W3D (`pm_w3d_bsd_events.py:1152`, with offset and lowercase-z positives), W3E (`RECEIPT_ACK_PROFILE = EVENT_RECORD`), W3F (`pm_w3f_event_oracles.py:129`), W3I (`pm_w3i_continuity_oracles.py:2620`).

### 2. T198 date-time inventory refresh

Run with the tool's own refresh path, as INT2 did, on a tree of tracked files only (`git archive`), because the scan walks every file under `Plans/`. Commit `c1cd4cb8c5`.

- **Prune:** 38 obsolete snapshot exclusions (removed migration run, renamed shards).
- **Relocate:** 0 registry pointer moves (every new registry row was appended after `main`'s rows).
- **Projection:** 3 hash-only rows, from `main`'s `Plans/settings_system_contracts.schema.json` (`/$defs/setting_value/oneOf/5`, `/$defs/values_by_setting_id`, `/$defs/source_by_setting_id`).
- **Classify:** 36 new nodes. 32 W3H `external_prepared_event` nodes are Storage-classified (EventRecord, `storage_utc_z` on observed/persisted). 2 DG `GenericIndexRow` nodes are Storage-classified (see the supplement). 2 DG `OriginalBoundary` safestop sources are `other_owner_observation`. W3A, W3B, W3C, W3D, W3E, W3F, W3G and W3I add no inventory node; their data files and prose are container exclusions.
- **Exclusions:** 621 → 1,337 (333 stale content pins renewed, 1,049 added: 263 code containers, 67 registry shard fragments, 673 data containers, plus renewals).
- **Inventory gate (`pm_event_datetime_inventory.py`, tracked tree at the branch head):** pass, 290 nodes, 175 Storage, 104 other-owner, 0 unclassified, 0 failures. It still passes after the main merges and the EP-1460 reflow.
- **`datetime_validator` probe** (EventRecord schema, EVENT_RECORD profile): `occurred_at_utc` `+00:00` accepted; `observed_at_utc` and `persisted_at_utc` `+00:00` refused (`'Z(?![\s\S])'`).
- **The 4,400-digit fixture (T212, T213):** `json-syntax` and the usage validator need `PYTHONINTMAXSTRDIGITS=0`. The dry landing check ran with it; the fixture is unchanged.

**NUMRULE data supplement (lead decisions 3 and 4, data only, no tool code).** This is an integration repair to NUMRULE data, for the batch-3 pair to check.

1. **35 CV-1101 owner-statement line pins** in `scripts/pm_event_datetime_mutations.json`. W3A's block before Contracts section 1.3 moved CV-1101 by 3,493 lines. Each statement and source is byte-identical at its new line (asserted by the supplement against `mutations.owner_statements`). Old → new: 1167→4660 (`canonical_text:1.1`–`1.9`, `2.1`–`2.4` and the other `canonical_text` statements on that line), 1168→4661, 1169→4662, 1170→4663, 1171→4664, 1172→4665, 1181→4674, 1182→4675, 1183→4676, 1184→4677, 1185→4678, 1213→4706, 1214→4707 (`acceptance_criteria` and `negative_constraints` statements). The full per-id list is in `drafts/INT3/t198/supplement.json`.
2. **Two DG `GenericIndexRow` nodes take `event_record_index`** (not the classify heuristic's EventRecord). This is only because their `node_sha256` equals `main`'s `Plans/goal_run_cancelled_consumer_contracts/consumer.schema.json#/$defs/GenericIndexRow`. Both hashes are `3bbf2867e5011b64dc3bc0960e11db3f39def0d82e3b398197668e2f154825f8`. Owner and citation follow that main row, pointing at their own path.
3. **34 node controls** in `scripts/pm_event_datetime_node_controls.json`:
   - The 2 DG nodes reuse `main`'s existing control for the identical node (`cebf464ad368…`; source `Plans/event_index_consumer_adoption_fixtures.json` `/positive/both_full_owner_joins/…`).
   - Each of the 32 W3H nodes gets its family's settled external `prepared_event` from W3H's own checker world. Source is recorded as `scripts/pm_w3h_events.py`, origin `build_world`, pointer `<family>/project/settled/external/publication/prepared_event`. That world is one of W3H's `verify_positives`, accepted by W3H's complete checker.
   - **Negatives per new node kind** (`drafts/INT3/t198/negatives-head-preloaded.json`): for W3H `external_prepared_event` and DG `GenericIndexRow`, `not-a-time` and `+00:00` at each Storage field are refused at exactly that field (`date_time_syntax`, `Z(?![\s\S])`), and each control is accepted.

**Combined self-test (`pm_event_numbers.py --self-test`, scope all) on the committed branch tree: exit 1.** The corpus passes 13,626/13,626, inventory pass. Exactly 32 integration checks fail, one `datetime_node_*` per W3H `external_prepared_event` node.

**These 32 are a tool false refusal on real, owner-valid controls.** `_node_validator` (`scripts/pm_event_datetime_selfcheck.py:4064-4077`) preloads only the node's own resource. W3H's node takes 27 fields by `$ref` to `https://puppetmaster.local/schemas/event_record/2.0.0/event_record.schema.json`, so `datetime_validator` raises `DatetimeAdmissionError(datetime_resource_not_preloaded)` before reading any control. With EventRecord preloaded, every control is accepted and its negatives are refused at the exact fields. This is the same class as INT2's STOP-T198 and `f304bfaf64`. Filed as **TOOL-ISSUES T215** for the NUMRULE owner; no tool code is changed. The supplement removed four other failures: the rules-table check, the controls-complete check and both DG node checks. W3H's `$ref` to EventRecord is kept (lead: inlining 27 fields × 32 schemas would be drift-prone copies).

### 3. Policy objects, W3E's 60 rows, registry diagnostics

- **Policies resolve on the merged tree:** `RP-CHAT-THREAD-LIFETIME@1.0.0` (DL-456) and `RP-QUESTION-BUDGET-APPLICATION-2555D@1.0.0` (DL-457) are in `retention_policies`, and W3F binds them in owner text. The DL-454/455 application policies (`RP-ROUTINE-OBSERVATION-APPLICATION-90D`, `RP-OPERATIONAL-SECURITY-APPLICATION-2555D`) are present. The Project first-save anchor adapter is in `Plans/storage-plan.md` ("Project first-save anchor adapter for RP-OPERATIONAL-2555D@1.0.0", DL-455, DL-457).
- **W3E's 54 single-policy rows** take the policies W3E's "Retention cells" table names: DL-453 `RP-AUTHORITY-INDEFINITE` (18 rows), DL-454 `RP-ROUTINE-OBSERVATION-APPLICATION-90D` (21), DL-455 `RP-OPERATIONAL-SECURITY-APPLICATION-2555D` (15). Each row's `retention_compaction` names its decision.
- **Integration repair, lead decision B (DL-455; SP-1401, SP-1410; main's precedent):** the six backup/restore rows held both scopes in one row, but SP-1401 and SP-1410 give two policies.
  - `main` keeps one row per edition where policies differ: 46 `*_application` families, for example `restore_point_record_application` and `dt_usage_event_application_source`.
  - So each row is split into a Project row and an application row:
    - The Project rows `w3e_{backup,restore}_state_changed_{custody,history,checkpoint}` take `RP-OPERATIONAL-2555D`, under the Project first-save anchor adapter.
    - The new `…_application` rows take `RP-OPERATIONAL-SECURITY-APPLICATION-2555D`, keyed `w3e_<family>_<kind>.application.v1:{hex(storage_instance_id)}:{hex(server_id)}[:{hex(owner_operation_id)}]`.
  - Both editions keep the one owner value schema. `main` already shares a `value_schema_id` across rows (`pm.storage.boot_history_floor.v1`, `pm.storage.seglog_manifest.v1`), so W3E's schemas, checker and tables are unchanged. The application history and checkpoint rows name the application custody row as their recovery source.
  - SP-1401 and SP-1410 now list the six rows and both key shapes. Six `storage_profile.family_profiles` entries are added. The 66 W3E profile notes drop "retention pending".
  - (The decision mail cited SP-1414; restore is SP-1410.)
- **Integration repair, lead decision A (W3A, gate `storage_value_secret_material_key`):** W3A's 35 `forge_*_checkpoint` rows carried `generations[].core.generic_token`.
  - The readiness gate (`scripts/pm-implementation-readiness.py` `SECRET_MATERIAL_KEY_RE` `:1115` and the SP-278 exemption `storage_value_is_canonical_read_token` `:2350`) refuses token-named keys unless they are named `read_token` / `*_read_token` and hold exactly the SP-278 read token or its nine-field durable projection.
  - The field is now `generic_read_token` in `Plans/forge_event_storage_contracts.schema.json`, the 35 registry rows, the checker and the number corpus. No other lane's or `main`'s `generic_token` is touched; W3B's own copy stays.
  - `DurableGenericToken` is now exactly the shared durable projection, and the checker refuses to load if it drifts. W3A's lane copy had used `(?![\s\S])` patterns.
  - W3A's trailing-LF refusal is now its own row, `CP16_token_full_match`: every pattern-bearing token string must `re.fullmatch` its SP-278 pattern. Witnesses (a hash + `\n`, the generation id + `\n`, the anchor hash + `\n`) are refused at CP16, not at CP01.
  - Guard: `checkpoint__04` PASS 4/4. W3A owner prose has no `generic_token`. `W3A-phase2-guard-map.json` predates CP16, which also realizes each family's `token` plan guard.
  - No change to `pm-implementation-readiness.py`.
- **Registry diagnostics** (`storage_value_registry_data_failures`): 98 before the items (60 W3E pending, 35 W3A token keys, 3 census counts); **0 after**.

### 4. Retention deck 6 (Jared, E6-1 = A, "Same as the history")

- **DL-510** "Source Control source records (retention deck 6, E6-1)" is appended to `Plans/Decision_Log.md`. DL-510 is the next free id: the highest DL id in `Plans/Decision_Log.md` across `main` and all 834 `origin` branches is DL-509. The entry quotes "Same as the history" verbatim. Its `source_lineage` cites `decision-answers/ANSWERS_E-CARDS-6_20261114.md` (SHA-256 `980b44d2…3da2da`), pm7-build mail `1114034303-dce3`, and `streams/E-CARDS-6.md`.
- **The 19 source facts** in `Plans/source_control_event_storage_rows.json` take their family's history policy:
  - DL-453 `RP-AUTHORITY-INDEFINITE`: 9 families.
  - DL-454 `RP-TELEMETRY-90D`: 4 families.
  - DL-455 `RP-OPERATIONAL-2555D` under the Project first-save anchor adapter: the six `remote.*` families.
  - All 19 families are Project-only, so no application edition exists.
- **Pending text superseded,** as DL-507 did:
  - SCS-1250..1268 C7 and SP-1250..1268 now state the binding and DL-510. Each unit's `preserved_exact_tokens` swaps `PENDING_RETENTION_DECISION` for `DL-510`, and every token still appears in its text.
  - `Plans/source_control_event_preparation.json` carries `source_fact_retention_policy_ref`, `source_fact_retention_decision`, and `source_fact_retention_question: null`.
  - In the storage rows, `retention_compaction`, `deferred_reason` and `reopen_condition` drop the pending retention.
- **W3B criterion 7 re-graded PARTIAL → PASS** for all 19 families, with 76 exact quotes pinned at current lines and hashes. Remaining-gap entries now say the question is resolved. Registry diagnostics stay 0, and W3B's checker passes after the change (below).

### 5. W3E `source_custody_ref`

On the merged tree:
- **Payload and history:** each of the 20 payload schemas has `source_custody_ref` maxLength 2,048, at both the payload and `$defs/history`.
- **Registry:** each of the 20 history registry rows has 2,048.
- **Copies match:** all 60 (now 66) W3E registry `value_schema` values equal their payload `$defs`.
- **Direction:** the change was a widening, 256 → 2,048 (W3E report, "history `source_custody_ref` narrowed" row), not the narrowing the brief describes.

### 6. Record only

- **W3B N1:** the shared EventRecord `payload_ref` string-versus-object gap.
- **W3E:** 9 payload fields in 6 families have no owner-manifest source (schema-checked only).
- **W3I recheck 3 (outside its scope):** the frozen verifier does not compare the receipt's `event_type`, `idempotency_key` and `first_append_receipt.event_id` with the original.
- **W3G:** 478 implied schema sites (string-enum type, pattern-covered minLength, pack root type) are outside the tables, with proofs and witnesses. W3G's checker reports `schema_sites_implied: 478`.
- **Stale `full_thread_runtime_contracts.schema.json` pins on `main`** (`5fa07b1e…` versus `926b1216…`): not E's; untouched; pm7-build has the note.
- **W3D:**
  - three `frozen_verify` binding clauses have no witness (event type, settle-row operation id, custody event id);
  - AD09/AD11 dropped an integer-type check (RT07, WD04 and WD05 are the same);
  - criterion 12 stays PARTIAL.

### 7. W3I recheck-3 notes

- **N1 (fixed, commit `ff3e81e0c9`):** the `retained_resolved` proof now reads "whenever the verifier decodes a record that carries replay_policy" instead of "whenever the verifier runs".
- **N2 (fixed, same commit):** "identity (:212)" now names `scripts/pm_w3i_continuity_oracles.py:212`.
- **Effect of N1 and N2:** the entailed table module regenerates (docstring only). The checker string keeps its line count, and line 212 is still `def identity`.
- **N3 (not edited):** "byte-identical" in `W3I.md:570` should read "value-identical" (suites are equal by value; case ids shift). W3I's report is a lane record, so the correction stands here.

## Census

Re-pinned once for merges 1–9 and confirmed after W3D, which adds no Storage family. The pins are in `scripts/pm-implementation-readiness.py` and the storage-plan Census bullet:
- **Families:** 678 = 496 + 182 added.
  - By item: DG-INT 6, W3A 70, W3E 66 (including the six `*_application` editions), W3F 2, W3H 32, W3I 6.
  - W3B, W3C, W3D and W3G add none.
  - Every added row is materialized `later_gui_or_feature_projection`.
- **Retention policies:** 41 (unchanged).
- **Status:** 647 materialized, 30 deferred, 1 alias.
- **Tier:** 79 tier-0, 589 later, 10 migration-only.

## Integration repair from the dry landing check

The second dry landing attempt (head `a0e7b6703d`) blocked twice on `event_record_consumer_local_definition` at `Plans/Executor_Protocol.md:12548` (run-gates and audit-governance). W3F's EP-1460 "Scope and identity" paragraph names EventRecord and six field tokens on one physical line. The line-based heuristic in `pm-implementation-readiness.py` (`event_record_consumer_local_definition_failures`, `:1978`) reads that as a locally defined tuple, but the paragraph only adopts EventRecord by name. It is split into three lines at sentence boundaries with no word changed (`f812600db2`), shards and index regenerated. The gate function now returns no failure for the file.

## Regeneration

- **Commands:** `pm-shard-plans.py --generate`, then `pm-plan-index.py generate` (currentness edition copied in from the shared checkout, identical per `diff -rq`), then `pm-shard-plans.py --check`: pass (4166 shard files, 99 sources).
- **When:** after merges 1–9, after W3D, and after the EP-1460 reflow.
- **Scope:** only shard directories whose source documents the merged items changed moved (15, then 3, then `executor_protocol`).
- **PlanUnits:** 8,745 after merges 1–9.

## Per-lane checks on the merged tree

Each command ran once, serially. Checkers ran under `MemoryMax=2G`, `MemorySwapMax=0`, each started at 12 GiB or more available. Guard drivers ran uncapped behind the tool's own MemoryGate, never more than 4 tool processes at once. Logs, exit codes and SHA-256 are in `drafts/INT3/checks/`.

| Lane | Check | Exit | Result (lane's own report) |
|---|---|---:|---|
| shared | `pm_event_numbers.py --self-test --scope numbers` | 0 | pass, 276 positives |
| W3A | complete checker | 0 | pass, 35 families, 1,120 / 21,969 (lane 980 / 21,829; +2 positives and +2 negatives per family and scope from items 1 and 3) |
| W3A | `pm-w3a-table-generate.py --check`; number corpus | 0; 0 | 592 tables, 2,102 rows (lane 2,101 + CP16); pass |
| W3A | guard tool (collect, compare with lane slots and reports, rerun changed) | collect 0, run 0, summary 1 | Reran exactly `receipt__04` (module changed) and `checkpoint__04` (module and slot changed), both PASS 4/4. 590 reused (slot and module identical). 2,101/2,102 proved; summary exit 1 only for the lane's entailed `pack_media_entailed/PM01` (same as lane) |
| W3B | checker; `cases --check --coverage`; tables; mutation proof; number corpus; timestamp fields | 0 each | 18,945 cases, 0 errors (=); 492 / 18,251 / 272 receipts (=); 76 / 449; 29/29 killed (=); pass; 6 fields |
| W3C | checker; cases; tables; mutations; number corpus | 0 each | 18,893 cases (=); 723/723 plan entries; 70 / 390; 20/20 killed (=); pass |
| W3D | checker (`--skip-inventory`, as the lane's final; inventory run separately above); tables; mutation proof | 0 each | 235 / 4,738, 4,723 single-row, 0 mismatches (=); 257 / 1,730 (=); table-site 12/12, duplicate 2/2, recheck 15/15, own 10/10 (=) |
| W3D | chunked guard runner, `--reuse-dir` lane reports, 4 at a time | 0 | 233/233 PASS, 1,706/1,706 proved, 0 masked (=). The runner reused 4 and reran 229 whose suite digests differed from the lane's archived reports; every rerun PASSed |
| W3E | checker; tables; mutations | 0 each | 305 rows, 60 tables, 307 controls, 19,405 negatives, `receipt_ack_profile` event_record (=); 60 / 305 (=); 42/42 killed (=) |
| W3F | checker; cases; tables; number corpus | 0 each | 9,628 cases (=); 332 / 9,296 / 379 (=); 50 / 288 (=); pass |
| W3G | checker; tables; guard tool (`--resume` over the lane's reports) | 0 each | 8,822 cases, 0 failures, 478 implied sites; 212 / 1,527; `tm` rerun PASS, 1,521/1,527 proved, 6 entailed, 0 findings (=) |
| W3H | checker; tables; guard tool (collection compared with lane reports) | 0 each | 8,274 cases, 0 failures; tables match; `jr` rerun PASS 8/8, every other phase reused |
| W3I | tables; checker; mutations | 0 each | 41 / 217; pass, 52 controls, 1,639 negatives (=); 43/43 killed (=) |
| DM (main) | checker; table regeneration diff; guard tool (`resolve`, `resolve_entailed`) | 0 each | PASS 55,631; tables match; resolve 25/25, RS23 entailed |

No lane check has a new failure; the two integration defects the checks and the dry run found are fixed and listed above (DM RS23 table, EP-1460 reflow).

### DG-INT checks

Every command in DG-INT's `checks-final.json` that lives in the repository ran once on the merged tree, serially. DG-INT's two scratch recheck scripts live outside the repository and were not needed: every full corpus below passes on its own. Capped runs used `MemoryMax=2G`; the five heavy corpora ran uncapped behind a 13.5 GiB start gate, as DG-INT ran them.

| Check | Exit | Result | DG-INT's own report |
|---|---:|---|---|
| dg-u | 0 | 21 / 480, 0 failures | 21 / 480 |
| dg-s | 0 | 46 / 154 | 46 / 154 |
| dg-r (full, uncapped, 3,684 s) | 0 | 46 / 274, 0 failures (R1 4/44, R2 11/128, R3 5/25, R4 12/28, R5 6/17, R6 8/32) | full run exit 1; 46 / 274 effective after the focused recheck |
| dg-cf1 | 0 | 6 / 196 | 6 / 196 |
| dg-cf2 | 0 | 11 / 90 | 11 / 90 |
| dg-cf3 | 0 | 23 / 150 | 23 / 150 |
| dg-ca | 0 | 32 / 388 | 32 / 388 |
| dg-cb | 0 | 46 / 181 | 46 / 181 |
| dg-ca3 | 0 | 21 / 205 | 21 / 205 |
| dg-int (full, uncapped) | 0 | 9 / 33, 0 failures | full run exit 1; 9 / 33 effective after the recheck |
| dg-c3-full (uncapped) | 0 | 32 cases, 0 failures | 22 / 10 |
| dg-v7-bounds (uncapped) | 0 | 11 / 131 | 11 / 131 |
| dg-v7-faults (uncapped) | 0 | 43 cases, 0 failures | 20 / 23 |
| dg-stop-history | 0 | 5 cases, 0 failures | 1 / 4 |
| adapter-selftest, adapter-reopen, numrule, demo-r1, demo-cf01, own-c, goal-lineage, w12-successor, w34b-qualify, w5-projection | 0 each | pass | pass |
| own-c-source; w12b | 0; 0 | 112 / 181; 241 / 306 | same |
| w34-reference, w34a, w5-successor, w5 | 2 each | the expected component-only NOT_COMPLETE result | exit 2, the same expected result |
| dg-current; dg-stop-block; dg-lifecycle; dg-history | 0 each | 931; 478; 514; 6,143 cases, guard tables pass | same |

No DG check has a new failure on the merged tree. DG-INT's K(s) files and adapter files are untouched by any later item. Native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.

## Dry landing check

`python3 scripts/pm-landing-check.py --base origin/main --json --keep-check-reports <dir> --readiness-audit-root Plans/.audits/event-authority-2026-08-13-currentness`. It ran in a separate full worktree (`/home/sittingmongoose/pm-worktrees/int3-dry`) with the ignored inputs `reports/landing-checks/README.md` names, `PYTHONINTMAXSTRDIGITS=0`, under `MemoryMax=2G` with a 2-hour limit, as a long-job.

| Attempt | Head / base | Exit | Blocking | Note |
|---|---|---:|---:|---|
| 1 | `a0e7b6703d` / `69a5f383b7` | 3 | — | Local currentness copy needs `--readiness-audit-root` |
| 2 | `a0e7b6703d` / `69a5f383b7` | 2 | 2 | EP-1460 `event_record_consumer_local_definition` (fixed, `f812600db2`) |
| 3 | `f812600db2` / `65f5bba1f5` | stopped | — | `main` moved under `Plans/.audits`; merged first |
| **4** | **`ee101a86b8` / `65f5bba1f5`** | **1** | **0** | 0 infrastructure, baseline current (`4c8099d756`, 0.25 days, ancestor) |

**Final result: exit 1, 0 blocking, 0 infrastructure timeouts.**
- **Totals:** run-gates 6,605 and audit-governance 6,605 (baseline 6,325 / 6,324); plan-migration-validate 18,969.
- **On-branch rows:** all 19,281 are governance staleness.
- **New but off-branch:** two non-stale rows, `historical_successor_terminal_current_snapshot_invalid` (run-gates and audit-governance, `Plans/.plan_migration/pds-20260611-002-atomize-planunits/…`). They name no branch file and do not block; the same two rows were on batch 2's dry run. Reported to Jared.
- **Resolved buckets:** the run with `PYTHONINTMAXSTRDIGITS=0` resolves the T212/T213 4,400-digit buckets. The copied audit inputs resolve the audit-status-index and `00-plans-index.md` rows.
- **The 32 W3H node checks (T215) do not appear in the landing check** (its subchecks are audit_closure, evidence, implementation_readiness, plan_graph, plan_migration and spec_lock), so they do not block it. They show only in the scope-all self-test.

## Reseal request (for Jared; nothing resealed here)

Governance staleness on the branch's files, grouped:

- **Spec Lock `stale_hash` (10 entries):**
  - `Plans/Automated_Testing_System.md`, `Commands_System.md`, `Contracts_V0.md`, `Executor_Protocol.md`, `Goal_Runtime_System.md`, `Working_Notebook.md`, `orchestrator-subagent-integration.md`, `storage-plan.md`, `storage_value_registry.json`;
  - `scripts/pm-implementation-readiness.py`;
  - plus `storage_value_registry_spec_lock_hash_stale`, `event_record_spec_lock_hash_stale` and `non_executable_closure_spec_lock_hash_stale`.
- **Evidence artifact hashes:** `artifact_hash_stale` grew 2,973 → 3,010 per subcheck in `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json`, plus 30 on-branch rows per aggregate.
- **Readiness:**
  - `event_authority_currentness_source_drift` (26 owner documents per aggregate; bucket 90 → 100);
  - `pnc019_source_hash_stale` (4 per aggregate);
  - `buildability_gate_report_stale_or_not_canonical` (1 per aggregate).
- **Plan migration:**
  - current snapshot stale (`current_snapshot_*`: 15,039 span metadata, 2,233 coverage, 1,481 span SHA, 50 each for live bytes, lines and SHA, 25 batch docs);
  - `stale_batch_report_sha256_after` (60 per aggregate, 25 in validate) on run `pds-20260611-002-atomize-planunits`;
  - `audit_closure_validator_error` (42 / 16).
- **DG-INT's own reseal items:** GRS-1132, GRS-1136, SP-1134, EP-1130 (from the DG integration).
- **Snapshot and baseline refresh at landing:** the landing agent refreshes the run named in `current_run.json` with `snapshot-current` and re-records the baseline, as `.claude/CLAUDE.md` says. That is separate from the reseal.

## Admission readiness (no admissions)

Grades are each lane's self-grade cells at the merged head: PASS / PARTIAL / ABSENT over 12 criteria. Membership (criterion 1) is ABSENT by design for every prepared family. Native execution is NOT_RUN for all.

| Item | Families | Grade per family | What stands between it and admission |
|---|---:|---|---|
| W3A Forge | 35 | 11 / 0 / 1 | Separate admission DL quoting Jared; command-specific adoption; runtime disabled |
| W3B Source Control | 19 | 11 / 0 / 1 (criterion 7 now PASS, DL-510) | Separate admission; batch-3 review pair |
| W3C test capture | 21 | 11 / 0 / 1 | Separate event and physical family registration and admission; `testing.receipt.recorded` owner question stays open (outside the 21) |
| W3D Back Seat Driver | 15 | 3 / 8 / 1 | Criterion 12 PARTIAL (finite derivation sample, five number routes); three `frozen_verify` clauses without witness; AD09/AD11 integer-type gap; independent review before admission |
| W3E server, remote, backup | 20 | 10 / 1 / 1 | Criterion 12 PARTIAL (gaps in W3E's report); separate admission |
| W3F discovery and prompts | 15 | 11 / 0 / 1 | Separate admission |
| W3G plan, research, notebook | 19 | 11 / 0 / 1 | Separate admission; review sampling of 478 implied sites |
| W3H 4b names | 32 | 11 / 0 / 1 | Separate admission; T215 tool fix for its 32 date-time node checks |
| W3I continuity and HITL | 4 | 10 / 1 / 1 | Criterion 12 PARTIAL (no source-frame relocation or held retention/restore cases; flag models); frozen-verifier receipt field comparisons; separate admission |
| DG (`goal.updated`, `goal.cancelled`, `goal_run.started`, `goal_run.cancelled`, `goal_run.certified`) | 5 | 41/41 judged groups COMPLETE (TEST_ONLY); families already registered at their earlier revisions | Admission of the successor current writers by a DL quoting Jared; native evidence NOT_RUN; reseal items GRS-1132, GRS-1136, SP-1134, EP-1130; follow-ups in DG-INT's report (CB M8 backup/restore, CA3 late-append crash matrix and coverage rows) |

Per-family rows: `drafts/INT3/admission-readiness.json`.

## Evidence

`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/INT3/` holds this report, `conflicts.jsonl`, the T198 records (`t198/`), the check results and logs (`checks/`), the guard summaries (`guard/`), the dry landing report (`dry/`), the tools used, and `SHA256SUMS`.

## Left

W3D (merged) and retention deck 6 (DL-510) are both done. Still open:
- **The batch-3 review pair** (Wonder or Sol 6.1 max, then Astra max).
- **The T215 tool fix** for the 32 W3H node checks.
- **The landing:** the reseal request above and the snapshot/baseline refresh.
