# DT — Sweep part 2B: the gated shared number and date-time rules (2026-11-11)

**Task:** `lanes/SWEEP-P2B.md` with both addenda (two allowed merge resolutions; the date-time inventory gate in lane trees). **Branch:** `plans/ea-w2-tools-gates-approvals-20261104`, start head `b73fbd029e` (part 2A), no rebase. **Worker:** Opus 5.5, T3 delegate. **Evidence:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/sweep-p2b/` (`SHA256SUMS`). No Decision Log entry, registry append, admission, seal or reseal; `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/auto_decisions.jsonl`, `.gitignore`, the guard tool's files and every NUMRULE file (including the inventory and exclusions) are unchanged.

**Result.** The merge `14a090cde1` takes exactly `58c2816ff3`; it conflicted only in generated paths, which were regenerated, and DT's checker against the merged helpers is unchanged (27,775 checks). The adoption commit `892aa28242` puts every DT timestamp field on the shared CV-1101 predicate with its owner's profile, replaces the lane's number surrogates with the shared CV-1100/SP-1100 calls (closing **F16**: the current writer now qualifies the producer projection through the shared JCS route and refuses an unpreservable integer before append), fixes the **4,400-digit integer crash** DT had on five routes, and reads retained originals through SP-1101's `RetainedDispatcher` over sealed custody. `4de38999ba` cites the shared units in CV-600..616. The complete checker exits 0 with **{{CHECKS}} checks**; `--self-test --scope numbers` passes 580/580; the shared number corpus runs through the raw source ingress, writer and retry routes with **0 disagreements**. Guard tables: **{{TOOLLINE}}**. **Not run in this tree, by Addendum 2:** the date-time inventory gate fails (283 rows, recorded below) and `datetime_validator` cannot be built; both run at batch-2 integration. Family grades are unchanged: **166 PASS / 21 PARTIAL / 17 ABSENT / 0 CONFLICT**.

**Readiness:** READY stays **false** for all 17 families. What remains: the JSON Schema keyword cuts (SchemaCatalog port), the date-time inventory gate and `datetime_validator` at batch-2 integration, and the single Sol max and Astra max review over the lane after part 2B. Membership stays ABSENT; native execution NOT_RUN. This section and `DT-self-grade.json` supersede every status below.

## Sweep part 2B: findings and responses

### Step 1: the merge

`14a090cde1` merges exactly `58c2816ff33365384d4039553f5efdb5370930e6` (`--no-ff`; parents `b73fbd029e`, `58c2816ff3`), confirmed after `git fetch origin` that the branch head was the part 2A head `b73fbd029e`. DT had no copy of any NUMRULE file (`scripts/pm_event_numbers.py`, `scripts/pm_event_numbers_corpus.py`, `Plans/event_number_recipe_corpus.json` and `scripts/pm_event_datetime.py` were absent at `b73fbd029e`), so **neither addendum resolution was needed**: 22 NUMRULE files were added cleanly and `Plans/Contracts_V0.md` and `Plans/storage-plan.md` auto-merged.

| What | Result | Verify |
|---|---|---|
| Conflicts | 163, all generated: 66 `Plans/_shards/contracts_v0/**`, 91 `Plans/_shards/storage-plan/**`, 6 `Plans/.plan_index/**`. No other path conflicted; no `git merge --abort` was needed. | `conflict-paths.txt` |
| Resolution | Regenerated (`pm-shard-plans.py --generate`, then `pm-plan-index.py generate` with the currentness edition copied and `sha256`-matched, 15 files). Shards changed only for `contracts_v0` and `storage-plan`, the two documents the merge changes. | `merge-units.txt` |
| Plan units | 7,534 = ours 7,530 ∪ theirs 7,426 (theirs adds CV-1100, CV-1101, SP-1100, SP-1101). A field-wise three-way check against base `fb441b27fd`: every unit equals the expected side on every field but `source_doc_sha256`/`source_location`; 0 mismatches; no field changed on both sides. Theirs changed CV-317, CV-366, SP-026, SP-236, SP-278, SP-286 and SP-337, no DT unit. The readiness report changed only in counts for the four new units. | `merge-units.txt` |
| `pm-shard-plans.py --check` | exit 0, `pass`, 99 sources | `shard-check.txt` |
| `pm-plan-index.py validate` (at `origin/main` `4f828088ac`) | exit 1, 60 findings, all fork drift: 39 `plan_unit_removed_without_ledger_decision` for units that exist only on `origin/main` (none in ours or theirs) and 21 `plan_unit_removal_ledger_invalid` on ledgers the merge does not touch. None names a DT or NUMRULE unit. | `index-validate.json` |
| Checker at the merge, before any part 2B edit | exit 0, 17 families, **27,775 checks** (the part 2A count); DT imported nothing from NUMRULE before part 2B | `checker-merge.json` |

The merge was pushed alone first (`b73fbd029e..14a090cde1`, both push URLs).

### Step 2: the adoption guide

Read `reports/event-authority-20261105/NUMRULE-ADOPTION.md`: "Shared calls", "Number-only adoption", "Authority boundary", "### DT", "Validation and limits". The DT targets named there that no longer exist at `b73fbd029e` (`retained_schema`, `current_numbers_valid`, `pm-dt-guard-isolation.py:prove_family`) were removed in fix round 6 and part 2A; their successors are adopted below.

### Step 3: timestamps (every DT timestamp field on the shared check)

**The shared check now in force.** `DATE_TIME_FORMAT = pm_event_datetime.format_checker(profile=EVENT_RECORD)` is passed to every validator the lane builds (`lane_validator`, `scripts/pm-dt-event-contracts.py:{{L_LANE_VALIDATOR}}`), replacing every bare `FormatChecker()` (which has no `date-time` checker in this environment and accepted `not-a-date`). The EventRecord envelope verdict (`EventRecordValidator`, `:{{L_EVENT_VALIDATOR}}`) adds CV-253's `storage_utc_z` on the two Storage-assigned times. Every DT owner unit was searched for a stricter profile (CV-600..616, SP-580..596, ATS-290..298): none selects one, so every DT family field takes the broad EventRecord profile. The lane's own timestamp parse (`time_value`/`time_micros`, `datetime.fromisoformat`) is removed; exact instants (`exact_instant`, `:{{L_EXACT_INSTANT}}`) are computed only after the shared predicate accepts, as POSIX seconds with the signed offset applied, a leap-second flag and the complete fractional digits, so comparisons are exact (CV-1101: "compare offsets mathematically and complete fractional values").

| Field | Occurrences (`format: date-time`) | Owner | Shared check and profile |
|---|---:|---|---|
| `ts` (payload, source payload) | 60 in 38 definitions, 16 families | DT family (CV-600..616) | `format_checker`, EVENT_RECORD |
| `captured_at_utc` (sources) | 24, 17 families | DT source custody (SP-580..596) | same |
| `occurred_at_utc` (captured `envelope_context`) | 24, 17 families | EventRecord copy (CV-317/CV-1101) | same |
| `published_at_utc`, `withdrawn_at_utc` (checkpoints) | 17 + 17 | DT checkpoint (SP-580..596) | same |
| `ready_since_utc` | 12, three gate families | DT family | same |
| `observed_at_utc`, `settled_at_utc`, `adjusted_at_utc` (usage payload and sources) | 7 + 5 + 5 | DT usage.event (CV-614), the provider observation and settlement times, not Storage-assigned | same |
| `deadline_at_utc` (approval.timeout source) | 1 | DT approval.timeout (CV-603) | same; compared with `ts` as exact instants (AT2) |
| EventRecord `occurred_at_utc` | 1 (`Plans/event_record.schema.json:212`, the shared `date_time_string`) | EventRecord (CV-317/CV-1101) | `format_checker`, EVENT_RECORD |
| EventRecord `observed_at_utc`, `persisted_at_utc` | same definition | Storage (CV-253) | EVENT_RECORD through the schema, then `date_time(..., profile=STORAGE_UTC_Z)` (`EventRecordValidator`) |
| Retention inputs `now`, `run_completed_at`, `terminal_at` | not schema fields | DT retention model (SP-580..596 with SP-349) | `date_time`, EVENT_RECORD, then exact instants (RT05/RT06, RT02 in exact POSIX days) |

Unformatted strings (`pricing_effective_at`, `reset_at`, `cooldown_until`, declared `type: string` or nullable by their owner) keep their owner type and acquire no timestamp predicate, as the guide requires. The first-receipt `acknowledged_at_utc` is compared byte for byte with the frozen original (RC rows) and is not validated by DT.

**Witnesses** (`datetime_checks`, `:{{L_DATETIME_CHECKS}}`): for every populated date-time leaf of every family's payload, sources, checkpoint and positive variants, 7 accepted forms (lowercase `t`/`z`, `+05:30`, `-05:00`, `2016-12-31T23:59:60Z`, the same leap second at `+05:30`, a 21-digit fraction, year 0000) and 15 refused forms (`24:00:00Z`, trailing LF, `not-a-date`, space separator, basic `20261104T000000Z`, missing zone, `00:00:60Z` on a non-leap day, 29 February 2026, 30 February, `+24:00`, `+05:60`, comma fraction, empty fraction, leading space, a leap second at the wrong offset), each through the lane validator; EventRecord `occurred_at_utc` with the same batteries through `event_schema_errors` and the writer (`schema_refused`, SV02); both Storage times with 3 accepted and 6 refused forms (`+00:00`, `-00:00`, lowercase `z`, `+05:30`, `24:00:00Z`, trailing LF) through the envelope verdict and the writer, and a retained original sealed with each refused Storage form is `unavailable` (HR12); the whole occurrence closure rewritten in four other owner-valid spellings of the same instant is accepted by the writer and retained by the historical reader with its exact string; approval.timeout's AT2 on 12 exact-instant cases (equal instants at other offsets, a tenth-microsecond-early timeout that microsecond truncation accepted, inside and after a leap second, AT3/AT4 refusals); retention on 4 cases per eligible fixture (exactly the policy days at other offsets, a fraction short, RT05, RT06).

**Lane-local leaks, now refused through the shared check** (part 2A recorded them as interim): `not-a-date` and every malformed form at all 172 DT and the 1 EventRecord `format: date-time` occurrences (bare `FormatChecker()` skipped them); the space separator, `24:00:00Z` and the basic form `20261104T000000Z`, which `time_value` accepted; a missing zone, `23:59:60Z` on a non-leap day, `2026-02-30` and a trailing LF, which made AT2 and RT02 derivation raise a harness error, now refuse at AT3/AT4 or RT05/RT06 with a row code; lowercase `z` and real leap seconds, which `time_value` refused although the owner admits them, are now accepted at EventRecord-profile fields. The tenth-microsecond comparison above is the exactness leak.

**This lane's timestamp review is no longer interim.** Each field above is covered by the shared CV-1101 predicate with the named profile. What does not run in this tree is the inventory gate and the `datetime_validator` boundary (below).

**The date-time inventory gate and `datetime_validator`: recorded, run at batch-2 integration (Addendum 2).** `python3 scripts/pm_event_datetime_inventory.py` exits **1** in this tree (`inventory-gate-final.json`) with 235 failures: 117 `unclassified_mentioning_container`, 57 `unreadable_mentioning_container`, 48 `stale_scan_exclusion`, 13 `unclassified_schema_node`. By source:

| Source | Rows | Errors |
|---|---:|---|
| plan-migration snapshots 002..006 (regenerated copies) | 95 | 95 unclassified_mentioning_container |
| regenerated `storage_value_registry` shards (DT mirrors) | 85 | 46 unreadable_mentioning_container, 39 stale_scan_exclusion |
| plan index (regenerated) | 18 | 16 unclassified_mentioning_container, 2 stale_scan_exclusion |
| DT schema nodes: usage.event provider `observed_at_utc` | 13 | 13 unclassified_schema_node |
| other regenerated shards (`decision_log`, `contracts_v0`, `storage-plan`) | 6 | 4 unreadable_mentioning_container, 2 stale_scan_exclusion |
| git-ignored currentness edition (index input, not tracked) | 4 | 4 unclassified_mentioning_container |
| `Plans/Decision_Log.md`, `Plans/usage-feature.md` | 8 | 4 unreadable_mentioning_container, 4 stale_scan_exclusion |
| `Plans/Contracts_V0.md` CV-317/CV-318 fences (positions moved by the merge) | 2 | 1 unreadable_mentioning_container, 1 stale_scan_exclusion |
| DT contract and fixture files | 2 | 2 unclassified_mentioning_container |
| DT unit CV-614 (its identity names the provider `observed_at_utc`) | 1 | 1 unreadable_mentioning_container |
| `Plans/storage-plan.md` | 1 | 1 unreadable_mentioning_container |

 The DT-content rows are: 13 `unclassified_schema_node` for usage.event's provider `observed_at_utc` (7 nodes in `Plans/dt_event_contracts.schema.json` `/$defs/usage_event*`, 6 in their `Plans/storage_value_registry.json` mirrors, families 375 and 384), which need classification under CV-1101 as a DT family field (EVENT_RECORD profile here), not CV-253 Storage fields; and `unclassified_mentioning_container` rows in `Plans/dt_event_contracts.json` and `Plans/dt_event_contract_fixtures.json`. The rest are regenerated `Plans/_shards`, `.plan_index` and `.plan_migration` copies and stale scan exclusions, plus 4 rows from the git-ignored currentness edition the index generator needs (not tracked content). There is no `inventory_node_changed` row: DT edits no inventoried resource. My first CV-600..616 wording named the two Storage fields literally and added 34 mentioning-container rows; it was reworded before commit so the owner text adds none. Unlike DO's tree, `datetime_validator` **does construct** here (DT drifted no inventoried resource): over `Plans/event_record.schema.json` it agrees with the lane's `EventRecordValidator` on all **697** cases (17 families × the 41 occurrence and Storage-time forms above, 0 disagreements; `validator-agree.json`), and over DT's `usage_event` payload it refuses `DatetimeAdmissionError(datetime_schema_unclassified)`, the same unclassified nodes. As Addendum 2 directs, the checker relies on `date_time` with each field's profile, not on `datetime_validator`, which runs with the gate at batch-2 integration. `python3 scripts/pm_event_numbers.py --self-test` (scope all) exits **1**: `case_execution: NOT_RUN_ADMISSION_REFUSED`, the only failing check `datetime_inventory_complete_and_classified` (the same 235 gate rows; `selftest-all.json`). `python3 scripts/pm_event_datetime.py --self-test` exits 0 with no output (no entry point) and is not counted. None of this is a false pass; T198 already records the blocker, and nothing new was filed.

### Step 4: SP-1101 retained-record dispatch

Not one of the step-4 lanes (DCH, DMEM, DS15, DFM, DF), but DT's own part 2B item and the guide's DT adoption ("replace historical=True ... as the selector with authenticated original edition dispatch"):
- **Composition** (`install_original_custody`, `:{{L_INSTALL}}`, called by `checker_inputs` before any read): one frozen `RecipeTuple` per family edition and source scope (project `pm.dt.source.json.v1`, application `pm.application.physical_messagepack.v1`), its `resource_manifest_sha256` the SHA-256 of the frozen DT schema document and EventRecord schema, each mapped to a `FrozenRecipe`; the committed base original of every family sealed at its seglog ref (record = SP-236 EVENT_VALUE bytes, result = the source closure in its own local profile, receipt = the first receipt).
- **Resolution** (`resolve_original`, `historical_read`, `:{{L_HISTORICAL}}`): after disclosure (HR02..HR05), the reader computes the `OriginalBinding` from the record under inspection and asks the shared `RetainedDispatcher`; a refusal (`original_authority`, `original_binding`, `recipe_unknown`, `original_verification`) is the new row **HR13**. HR09..HR11 compare the record with the sealed original's decoded bytes; HR12 and the historical source chain use the frozen resources custody selected, not the caller's schemas. The frozen verifier recomputes the identity, the prepare commitment and every binding join from the sealed bytes.
- **Writer-built originals:** fixture positive variants reuse the base event identity with other closures (separate scenarios), so they, the replay-policy, payload-reference, decimal and invalid originals, and the timestamp and u64 originals are each sealed in their own world by the writer composition that reads them (`retained_world`); a case under check never seals anything.
- **What changed for witnesses:** the caller-supplied `authenticated_original` is gone from every context. `forged_original_storage_type` now seals an original whose Storage field has the wrong type and reads the fixture record (HR11); the HR09 witness changes the prepared stage under inspection only (the binding is unchanged, so custody resolves and HR09 alone refuses). New HR13 witnesses: no sealed original at the record's ref, and a key custody does not hold. Standing check 10 results are unchanged against the fixture-pinned oracle.
- **Recovery** (`recovery_flow`) keeps its fixture-frozen original adapter (`f['recovery_original']`, fixture data, not request data); routing native recovery custody through the dispatcher is an integration item with the native owner.

### Step 5: numbers (F16, the 4,400-digit crash, every number item)

| Item | Result | Where |
|---|---|---|
| **F16 producer digest** | `producer_semantic_bytes`/`_digest` are the shared calls over the unchanged CV-317 projection; the 17 pinned producer bytes and digests are unchanged. The current writer qualifies the projection before append (new row **SV36**, `number_domain`; historical reads exempt): 2^53 accepted; 2^53+1, 2^60, u64 max and 10^4399 at `producer_sequence_id` refused; a retry has no digest and refuses at AM02. The same retained originals (≤ u64) stay readable. The F16 diagnostic's 51 accepted exceptions are now 0: every case either digests or refuses with a code. | `:{{L_PRODUCER}}`, `number_checks` `:{{L_NUMBER_CHECKS}}` |
| **Integer slots** | Every schema integer slot (nested, nullable and alternative ones) goes through the shared `current_integer` via the validator's `integer` type (`DTValidator`), with the slot's own minimum/maximum in the owner schema; `number` slots keep JSON Schema's number. An integral float at an integer slot is refused. | `exact_integer_type`, `DTValidator` |
| **ID01 / identity** | `blocked_sequence` takes `current_integer(0..2^64-1)`; the identity spelling is the exact decimal string of any length (`int_text`). | `identity` |
| **WD3/WD4, CP27** | WD3/WD4 take `current_integer(0..2^64-1)` (the owner bounds); CP27 row sequence ids take `storage_uint64` (SP-1100). | `unsigned_integer_valid`, `storage_sequence_valid` |
| **Storage sequence_id** | The envelope verdict applies `storage_uint64` (2^64 refused, u64 max accepted, an integral float refused). | `EventRecordValidator` |
| **CV-366 app bytes and inline size** | `application_bytes` is `storage_value_bytes(..., APP_PHYSICAL)`; every application source commitment pinned in the fixtures is unchanged. SV05/SV06 now measure the inline body as SP-236 EVENT_VALUE bytes (the bytes the EventRecord stores) instead of CV-366 app bytes. | `application_bytes`, `inline_bytes` |
| **Source codec** | `pm.dt.source.json.v1` is unchanged as a local recipe; `decode_source` reads integer tokens through the shared `JsonNumber(token, True).exact()` and `canonical` writes ints of any length exactly. | `decode_source`, `canonical`, `int_text` |
| **Number comparisons in rows** | WD5, CP37 compare exact ints (the slots now admit only ints); CP30, GS1/GS2, UV1 keep their canonical-bytes joins (local recipe); AC02 uses the lane validator. | unchanged rows |
| **4,400-digit integer** | DT had the crash on five routes (`decode_source`, `canonical`, `source_valid` with a large `producer_sequence_id`, the producer digest, the identity), and jsonschema itself raises formatting an error message for it. Now it decodes and encodes exactly, refuses `jcs_binary64` (producer), `physical_integer_range` (physical), ID01 (identity), SV36 (writer) and `schema_refused` (negative, SV02), and a jsonschema error-message `ValueError` counts as the error it reports (`schema_error_count`). | `number_checks`, `long_int_probe` |

**Shared corpus through the complete checker** (`number_corpus_checks`, `:{{L_CORPUS}}`): every number-scope raw spelling and exact integer of `Plans/event_number_recipe_corpus.json` (55 distinct, including two 4,400-digit integers) is written as raw JSON text at the captured `producer_sequence_id` of both source stages, decoded by the lane's raw ingress, joined with the event and run through `source_valid` and `append_model`, for all 17 families. Expectations come from the shared helpers (`loads_current_json`, `current_integer(minimum=0)`, `producer_semantic_digest`) plus the owner's stated canonical-byte rule for `pm.dt.source.json.v1` (a spelling that is not the shortest decimal is refused). **935 route runs (55 spellings × 17 families): 102 accepted, 119 `number_domain` (SV36), 714 refused (646 at the raw ingress, 68 at the envelope or source schema); 289 retry runs on the decoded ones; 0 disagreements, 0 crashes** (`corpus-counts.json`). Two spellings the shared parser accepts (`"1\n"`, `" 1"`) are refused by the local codec's canonical-byte rule, as its owner text states.

**Self-test:** `python3 scripts/pm_event_numbers.py --self-test --scope numbers`: **exit 0, `"status": "pass"`, 580/580 cases (276 positives, 304 labelled negatives)**. Credited exactly: number recipes only.

**Witness and fixture expectations that changed.** No committed fixture file changed (`Plans/dt_event_contract_fixtures.json` and every pinned oracle, including standing check 10, still hold). In-checker witness expectations changed, each with its refusing row:

| Witness | Before | Now | Refusing row and reason |
|---|---|---|---|
| `table SV05 unencodable inline body` (an int below int64) | `schema_refused` (SV05) | `number_domain` | SV36: no exact JCS route, refused first; SV05's new witness is an exact decimal carrier with no EVENT_VALUE encoding |
| `exact u64 identity` 2^53+1 and u64 max (4 approval families) | `accepted` | `number_domain` | SV36 (F16); identities still exact; retained originals still `retained` |
| `schema-valid float integer source` (`blocked_sequence` 1.0) | `accepted` | `schema_refused` | SV09: CV-1100 integer slot |
| `equal integer representations have one identity` (1 vs 1.0) | equal | 1.0 refused | ID01 |
| `equal integer retry returns original`, `float integer canonical round trip` | asserted | removed | the float writer is refused before any retry or persistence |
| `large float integer source` (2^53.0, 2^64-2048.0) | `accepted` | `schema_refused` | SV09; equal canonical bytes still asserted; identity refused at ID01 |
| HR09 witness | forged caller-supplied original | forged prepared stage under inspection | HR09 (SP-1101: no caller original) |

### Step 6: guard tables

{{GUARD_SECTION}}

### Steps 7 and 8: grades

| Cell | Before (part 2A) | After | Why |
|---|---|---|---|
| `positive_negative_oracles`, all 17 | PARTIAL | **PARTIAL** | F16 and every number and timestamp item are closed, but the JSON Schema keyword cuts are not ported, three rows stay unprovable by construction, and the inventory gate and `datetime_validator` run at batch-2 integration. |
| `closed_payload_schema`, all 17 | PASS | PASS | Shared CV-1101 predicate and exact integer slots at every field, with batteries. |
| `scope_identity`, 4 approval families | PASS | PASS | 1.0 refused at ID01 instead of sharing an identity; exact u64 identity. |
| `replay_idempotency`, all 17 | PASS | PASS | Shared producer digest; SV36 before append; corpus and retry witnesses. |
| `compatibility_withdrawal`, all 17 | PASS | PASS | SP-1101 custody dispatch (HR13). |
| `transitions` (approval.timeout), `retention`, all 17 | PASS / PARTIAL (4 inherited) | unchanged | Exact-instant comparisons; the four PARTIAL retention cells stay PARTIAL for their inherited retention binding, not timestamps. |
| `membership_version`, all 17 | ABSENT | ABSENT | No admission. |
| other cells | PASS | PASS | Unchanged. |

Totals unchanged: **166 PASS / 21 PARTIAL / 17 ABSENT / 0 CONFLICT**. Timestamps were never the reason for a PARTIAL cell. Self-grade: `sweep_part2b` block, per-cell `prior`/`change`; all {{QUOTE_TOTAL}} evidence quotes re-found at their lines inside their own units ({{QUOTE_SPLIT}}, 0 missing).

{{FAMILY_TABLE}}

### Owner text

`Plans/Contracts_V0.md` CV-600..616: one closing paragraph per unit cites CV-1100, SP-1100, SP-1101 and CV-1101 beside the existing owners and states what changed in behaviour (exact integer slots, producer-route qualification before append, Storage uint64, CV-366 app bytes and the SP-236 inline size, the per-field date-time profiles with exact instants, SP-1101 custody dispatch); no recipe ID, preimage, field or schema range changes. Shards and plan index regenerated: only `Plans/_shards/contracts_v0/**` and the index changed (17 canonical texts, 16 `source_location` shifts, every unit's `source_doc_sha256`); shard check pass. Governance staleness for `Plans/Contracts_V0.md` is the expected consequence of editing canon before the next reseal.

### Checks, before and after

{{CHECKS_TABLE}}

### What Astra keeps finding, probed for part 2B

(1) Forged inputs: retained originals now come only from sealed custody; a forged id has no sealed original (HR13), a forged key fails the binding (HR13), a forged body fails HR09..HR11. (2) Storage metadata: Storage `sequence_id` is exact uint64 and stays out of the producer digest; Storage times take CV-253. (3) Historical readers: authentic broad-timestamp and large-integer originals stay readable; owner-invalid Storage times refuse; every replay policy still reads. (4) One field read two ways: one integer token grammar and one `int_text` spelling feed the codec, identity and digest; a value the validator accepts is the value every join reads. (9) Grades: the oracle cells stay PARTIAL. (10, 10a) Numbers: integral floats refused at integer slots; history read by custody's recipe. (11) Types: str subclasses refuse at the date-time predicate; booleans and floats refuse at integer slots. (12) Formats: the registered predicate runs through every validator, with negatives for every malformed form above.

**Stopped for Jared:** none. **IDs used:** none new (CV-600..616, SP-580..596, ATS-290..298 retained; new rows SV36, HR13, AT3, AT4, RT05, RT06 are checker row names, not plan IDs).

---

Earlier-round material below is superseded source lineage.

