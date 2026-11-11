# DFM — sweep part 2B (CV-1101 date-time, SP-1101 retained dispatch)

Branch `plans/ea-w2-filemanager-20261104`; start: part 2A head `32f302f600`. Gated NUMRULE merge `dfd845d641`: exactly `58c2816ff3`, `--no-ff`, clean with no conflict. It adds only the seven date-time files (`scripts/pm_event_datetime*.py`, `scripts/pm_event_datetime_mutations.json`, `scripts/pm_event_datetime_node_controls.json`, `reports/event-authority-20261104/NUMRULE.md`). The number-scope files at `58c2816ff3` are byte-identical to the `a16f67c1ef` merged in part 2A, and each merged file equals `git show 58c2816ff3:<path>`. No NUMRULE file is edited, so neither addendum-1 resolution was needed. No rebase. Implementation commits: `47c4e3464f` (checker, tables, builder, fixtures, witnesses), `3cb373f91f` (CV-560, ATS-280, shards, index), `9c5c93a17e` (registry-regression harness). The report commit is in the external `HEAD.txt`.

**All twelve families keep their grades: 108 PASS / 24 PARTIAL / 12 ABSENT.** Every DFM timestamp field now goes through the shared CV-1101 predicate `pm_event_datetime.date_time`, with its profile named per field in the table below. My timestamp review is **no longer interim** for those fields. SWEEP-12 is closed: the 108 malformed timestamps the cycle-7 diagnostic found accepted (9 forms × 12 families) now refuse, together with 4 more malformed forms (48 witnesses). SP-1101 retained dispatch goes through the shared `RetainedDispatcher`.

`positive_negative_oracles` stays PARTIAL in every family, but timestamps and SP-1101 are no longer among its reasons. It stays PARTIAL because:
- schema keywords are verdict rows, not cut one by one;
- IS02, QJ03 and OD03 are unprovable by construction;
- the shared `datetime_validator` and the whole-`Plans/` inventory gate fail closed in this lane tree on content drift from the lane's Plans edits, so they run at batch-2 integration (addendum 2).

Membership stays ABSENT, retention PARTIAL, native execution NOT_RUN. **Readiness: NOT_READY** (prepared for the batch-2 Sol max and Astra max review; READY stays false).

## Sweep part 2B: findings and responses

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **Merge the gated NUMRULE head** | Merged `58c2816ff3` exactly with `--no-ff` as `dfd845d641`, from the part 2A head `32f302f600`. No conflict. Seven files: the date-time code, its mutation set, its node controls and `NUMRULE.md`. No derived file was touched, so no regeneration was owed for the merge. Neither addendum-1 resolution was needed. | merge `dfd845d641` | `git diff --stat dfd845d641^1 dfd845d641` lists 7 files; each equals `git show 58c2816ff3:<path>` (blob compare, all 7 same); `git merge-base 32f302f600 58c2816ff3` = `a16f67c1ef`. |
| **SWEEP-12 / CV-1101 at every DFM timestamp** (fixed, `47c4e3464f`) | Every schema verdict now passes the shared `pm_event_datetime.format_checker(profile=EVENT_RECORD)`, so `date_time` runs at every `format: date-time` (18 schema sites). Before, a bare `jsonschema.FormatChecker()` registered no date-time checker in this environment. The Storage registry verdict passed no format checker at all; it now passes the same one, so `generated_at_utc` is enforced. No lane-local grammar or regex was added. | `scripts/pm-filemanager-event-contracts.py:228` (`DATE_TIME_FORMAT`), `:306` (`validate_shape`), `:1687` (`validate_registry_contracts`); `scripts/pm-filemanager-number-corpus.py` (`schema_accepts`, the corpus's outside oracle) | Witnesses `<family>:p2b:ts-<form>` cover the 13 malformed forms with every copy moved: 156 negatives refuse at their family's PYnn row. The SWEEP-12 nine (non-date, missing zone, space separator, month 13, November 31, hour 24, trailing LF, empty fraction, double fraction) are 108 of them; the cycle-7 diagnostic found all 108 accepted. The other four: minute 60, a false leap second, offset hour 24, and February 29 in a common year. |
| **DFM's recorded leak: "no date-time format support in its environment"** (fixed, same commit) | The shared predicate is installed explicitly, so the environment's missing `rfc3339-validator` no longer matters. Negatives go through the validator, as CV-1101 requires ("Negatives must demonstrate that the installed predicate runs through the validator"). | as above | `"garbage"`-class witnesses `…:p2b:ts-non-date` refuse at PYnn; registry witnesses `integrity/registry-generated-at-no-zone` and `-lf` refuse at RG01; `integrity/control/registry-generated-at-offset` is accepted. |
| **CV-253 `storage_utc_z` at EventRecord Storage fields** (fixed, same commit) | `observed_at_utc` and `persisted_at_utc` of every EventRecord a verdict applies take `date_time(..., profile=STORAGE_UTC_Z)` inside that verdict row. Sites are found by resource identity: the instance paths where the validated schema reaches the installed `event_record.schema.json` root or its frozen 1.0.0 reader, following `$ref`, `allOf`/`anyOf`/`oneOf`/`then`/`else`, properties and items. That gives `operation_custody.complete_event` (OC01), `full_value_request.event` (FQ01), the retry event itself (ER01), and the physical `operation_custody_value` and document-root unions. A `$ref` that declares `$schema` drops a jsonschema keyword override (`evolve` re-selects the stock class), so the overlay was built this way instead. The format checker survives that re-selection. | `:235` (`event_record_nodes`), `:241` (`event_record_sites`), `:281` (`storage_timestamp_error`), `:306` | Witnesses `…:p2b:event-{observed,persisted}-{plus-zero,minus-zero,lowercase-z,offset}` (OC01), `…:p2b:retry-observed-plus-zero` and `retry-persisted-lowercase-z` (ER01), `…:p2b:rule-request-observed-plus-zero` (FQ01), `…:p2b:rule-event-persisted-offset` (ER01). Controls: uppercase-`Z` long fraction and a real leap second accepted, current and retained. |
| **Companion, receipt, settlement and noncompletion timestamps** (same commit) | Each is covered by the shared check through its own verdict: OC01 on the route, plus isolated one-edit witnesses at CV01, FR01 and RO01. | — | `…:p2b:accepted-at-*` (OC01), `…:p2b:receipt-acknowledged-missing-zone` (OC01), `…:p2b:rule-custody-acknowledged-space` (CV01), `…:p2b:rule-result-acknowledged-month-13` (FR01), `…:p2b:rule-settlement-settled-trailing-lf` and `rule-noncompletion-settled-hour-24` (RO01); offset and leap-second controls accepted. |
| **SP-1101 retained dispatch** (DFM's SP-1101 item; fixed, same commit) | `validate_original_models` with `historical=True` now calls `dispatch_retained_original`. It makes one shared `RetainedDispatcher.resolve` call, with `DfmOriginalOwner` over the custody model's sealed `original_custody` record and the exact installed `RecipeTuple → FrozenRecipe` map.<br>**The record:** the finite fixture's independent sealed lookup per SP-1101, keyed by the original's append custody key. It holds the write-time edition and the SHA-256 manifest of the five frozen resource files the original was written against.<br>**The tuple:** the original's own immutable discriminators (envelope `pm.event.v0`/`2.0.0`, payload schema id/version) plus the sealed edition and manifest. The map is built from this head's resource bytes at composition.<br>**No request input:** no override, no request field, and no current-then-legacy probing.<br>**Frozen verifier:** `validate_historical_operation` with the same CV-1101/CV-253 profiles. It never runs `validate_writer` or a live-state guard.<br>**Refusals:** a missing or malformed record refuses OD01 `original_unavailable`; an unknown edition or replaced resource refuses OD02 `recipe_unsupported`; any other dispatcher refusal is OD03, alone in its own table.<br>**Fixture data:** each family's custody model records its original's custody (no restamp; the one-off writer refuses an existing record). `synchronize_fixture` and `fixture_event` move the record with the append custody key.<br>**Limits:** owner and reader read the same original in this static model, so the binding equality is structural; native custody is NOT_RUN. The twelve families were never admitted, so there is one edition, `DFM-prepared-v1`. | `:1320` (call site), `:1338`–`:1433` (`DFM_EDITIONS`, `resource_manifest`, `recipe_tuple`, `installed_recipes`, `append_custody_key`, `original_binding`, `DfmOriginalOwner`, `dispatch_retained_original`), `:496` (`move_original_custody`); rows `scripts/pm-filemanager-table-generate.py:393`, `:407`; `Plans/filemanager_event_contract_fixtures.json` (`custody_model.original_custody`, 12 rows) | Witnesses `…:p2b:dispatch-custody-missing`, `-custody-other-original` and `-custody-malformed-manifest` (OD01); `…:p2b:dispatch-edition-unknown` and `-resource-replaced` (OD02); controls `…:p2b:dispatch-request-recipe-ignored-control` (trace recipe fields ignored, retained route accepted) and `…:p2b:dispatch-current-route-no-custody-read-control`. Every existing retained witness (original-location, historical-policy, live-state) keeps its outcome (differential). |
| **Retained timestamps under the frozen profile** (same commit) | Valid lowercase, offset, leap-second, long-fraction and year-0000 originals stay readable on the retained route, with exact strings. Malformed and Storage-offset originals refuse there, so a skipped past format check never admits an invalid original (CV-1101, SP-1101). | — | `…:p2b:ts-*-history-control` (9 forms × 12 accepted); `…:p2b:ts-{missing-zone,trailing-lf,false-leap-second}-history` (PYnn); `…:p2b:event-observed-plus-zero-history` and `-persisted-lowercase-z-history` (OC01); `…:p2b:event-*-history-control` accepted. |
| **Owner and test text** (`3cb373f91f`) | CV-560 gains a "Timestamps follow CV-1101 beside CV-253" paragraph: the profiles per field, the exact-string joins, and SP-1101 dispatch from sealed custody, where unavailable or unsupported refuse without trying the current recipe. ATS-280 names the date-time overlay, the dispatch, the part 2B witnesses and the shared date-time suite. | `Plans/Contracts_V0.md:24662`, `Plans/Automated_Testing_System.md:7266` | Shards and index regenerated: only `contracts_v0` (66) and `automated_testing_system` (51) shard files and those two documents' index rows change; acceptance units CV-560 and ATS-280. |
| **Number scope (DFM did it in part 2A)** | Unchanged and re-run: the corpus still has 0 disagreements and the number self-test passes. | — | `python3 scripts/pm-filemanager-number-corpus.py`: exit 0, 6,888 route runs, 0 disagreements, same per-route counts as part 2A. `--self-test --scope numbers`: exit 0, `pass`, 580/580. |

**Disputed:** none. **Stopped for Jared:** none. **IDs used:** none new. No PlanUnit, Decision Log entry, admission or family ID was minted; CV-560 and ATS-280 change in place. New witness IDs are the `…:p2b:…` case names in `Plans/filemanager_event_p2a_cases.json`, plus three integrity witness names. New guard rows OD01–OD03 are lane-local table rows, not PlanUnit IDs.

**Lane harness fixed (`9c5c93a17e`).**
- **Where:** `scripts/pm-filemanager-registry-regression.py:55`.
- **Why it broke:** part 2A (`3d26ae2982`) made the registry refusal a `TableRefusal` (row RF01), but the part-1 B4 harness still caught only `AssertionError`, so it has exited 1 since part 2A.
- **Fix:** catch the table refusal and require RF01 plus the same 28 pinned failures. It passes now.

**"What Astra keeps finding", probed for this pass.**
1. Forged inputs: identities, keys, commitments and the producer digest are still recomputed by derivation. The SP-1101 tuple is built from the original's own discriminators and the sealed record, never from request data. A request-side recipe field is ignored (control).
2. Storage-assigned metadata: `observed_at_utc` and `persisted_at_utc` take CV-253's profile wherever an EventRecord is validated, the retry event included. Retry equality still excludes them (CV-339).
3. Historical readers: valid broad-profile retained originals are accepted. Malformed ones, Storage-offset ones and unknown or replaced recipes refuse. The writer rows never run on the retained route (`dispatch_retained_original` replaces the shared call only when `historical=True` and no candidate is passed).
4. One field read two ways: timestamps are never parsed, normalized or ordered. Validation returns the string unchanged, and the joins compare exact strings.
5. Unresolved references: SR01 is unchanged. The site walker follows only references that `validate_schema_graph` has already resolved.
6. Size limits: no change.
7. Custody: every retained route resolves through the dispatcher before the complete frozen verification.
8. Masked negatives: tool result above. Every part 2B negative is built from its family's valid row with one source change and every copy moved; the builder keeps it only when the complete checker refuses it at exactly its row.
9. Grades: unchanged. The oracle cell stays PARTIAL.
10/10a. The number scope is unchanged. The stricter date-time check reads retained originals through the one recorded edition, and that edition's profile is the owner profile (CV-1101: "Accidental past acceptance by a validator that skipped format is not an owner-valid legacy grammar"). No genuine older format edition exists to preserve: the families were never admitted.
11. Types: a non-string timestamp is left to the schema `type` keyword. The 13 existing `ts: null` and `generated_at_utc: null` schema-rule cases keep their exact `type` diagnostic (differential: 0 changes).
12. Formats: closed for date-time by this pass. No DFM schema declares another format.

## Timestamp fields and the shared check that covers each

Every field is checked by `pm_event_datetime.date_time`, installed explicitly as the format checker. The first row of each verdict that reaches the field refuses. No timestamp string is rewritten; CE06 (`occurred_at_utc` = payload `ts`) and SI05 (`settled_at_utc` = `ts`) stay exact-string joins. The frozen SP-1101 verifier of the one write-time edition `DFM-prepared-v1` applies the same profiles to retained originals.

| Field | Schema site | Owner of the profile | Shared check and profile | Verdict rows that run it |
|---|---|---|---|---|
| payload `ts` | `Plans/event_payloads/file_manager/*.schema.json` `properties.ts` (12) | F-150..F-161 payload schemas, CV-1101 ("broad family ts fields") | `date_time`, `event_record` profile | PY01..PY12 (current and retained), OC01 (settled payload copy) |
| `accepted_command.accepted_at_utc` | `Plans/filemanager_operation_contracts.schema.json` `$defs/accepted_command` | CV-560/SP-560 companion (`format: date-time`) | `date_time`, `event_record` profile | OC01, RO01 (rule) |
| `settlement.settled_at_utc` | same file, `$defs/settlement` | CV-560/SP-560 companion; equals `ts` (SI05) | `date_time`, `event_record` profile | OC01, RO01 (rule) |
| `noncompletion.settled_at_utc` | same file, `$defs/noncompletion` | CV-560/SP-560 companion | `date_time`, `event_record` profile | OC01 (no_event_settled rows), RO01 (rule) |
| EventRecord `occurred_at_utc` | `Plans/event_record.schema.json` `$defs/date_time_string` | CV-317/CV-1101; equals `ts` (CE06) | `date_time`, `event_record` profile | OC01 (`complete_event`), FQ01 (`request.event`), ER01 (retry event), RE01 (rule) |
| EventRecord `observed_at_utc`, `persisted_at_utc` | same, root and frozen 1.0.0 compatibility reader | CV-253 (Storage-assigned) | `date_time`, `event_record` profile **and** `date_time(..., profile=STORAGE_UTC_Z)` at every EventRecord the verdict applies, found through the owner schemas' `$ref` graph | OC01, FQ01, ER01, RE01 |
| AppendReceipt `acknowledged_at_utc` | `Plans/event_append_receipt_contracts.schema.json` `$defs/AppendReceipt` | receipt schema `format: date-time` (CV-339/SP-286 receipt); CV-253 does not name it | `date_time`, `event_record` profile | OC01 (`first_append_receipt`), CV01 (`custody_v2`), FR01 (`full_value_result`), RR01 (rule) |
| registry `generated_at_utc` | `Plans/storage_value_registry.schema.json` `properties.generated_at_utc` | Storage registry schema `format: date-time` | `date_time`, `event_record` profile (RFC 3339 5.6/5.7) | RG01 (newly enforced: the registry verdict passed no format checker before) |

The `event_record` profile is RFC 3339 5.6/5.7 as CV-1101 states it: `T`/`t`, `Z`/`z` or a signed offset, any fraction length, real leap seconds only, year 0000. `STORAGE_UTC_Z` adds "terminal uppercase `Z` only". Per CV-253, `observed_at_utc` and `persisted_at_utc` are the only DFM fields with a stricter owner profile. No DFM field uses `coordination_utc_z` or `legacy_normalization_output`.

## Guard-table result (rerun on the gated tool `004bdedd63`)

The adoption changed guarded predicates in two ways:
- every schema verdict now derives its fact through the shared date-time predicate;
- the SP-1101 rows are new.

So the gated tool was rerun over **every** table, not only the affected suites. Credit is the tool's own `rows[].proved`.

**Result: 117 tables, 237 rows, 234 proved, 0 findings, 0 lane-matrix problems, 0 masked, 0 unrelated changes.** Part 2A had 115 tables, 234 rows and 232 proved. The run covered 283 distinct single-row negatives (7,626 further witnesses with an identical observation ride as aliases) and 3,972 tool evaluations. The tool exits 1 only for the three tables of rows that are unprovable by construction: they have no negative and get no tool run. Collection took 558 s; the whole run took 895 s, with pauses at the tool's own MemoryGate (pause below 10 GiB, resume at 11 GiB).

| Checker area | Tables | Rows | Proved | Unproved (reason) | Cut: own flips / own | Cut: stays | Unrelated changes | Masked |
|---|---:|---:|---:|---|---:|---:|---:|---:|
| Schema verdicts (one row per occurrence) and schema document admission | 28 | 28 | 28/28 | none | 28/28 | 0 | 0 | 0 |
| Numbers: CV-1100 qualified JCS, current integer slots, SP-1100 EVENT_VALUE | 5 | 7 | 5/7 | IS02_integer_range, QJ03_jcs_other (by construction) | 5/5 | 4 | 0 | 0 |
| SP-337/SP-339/SP-340 transport, encoding and profiles | 11 | 18 | 18/18 | none | 22/22 | 38 | 0 | 0 |
| Current writer replay policy | 1 | 2 | 2/2 | none | 2/2 | 2 | 0 | 0 |
| Path custody: coverage, joins, accepted locations | 3 | 10 | 10/10 | none | 10/10 | 28 | 0 | 0 |
| Represented subjects (create/copy/move/export/rename/delete) | 7 | 19 | 19/19 | none | 19/19 | 62 | 0 | 0 |
| Complete original EventRecord joins | 3 | 9 | 9/9 | none | 14/14 | 42 | 0 | 0 |
| Operation custody transitions (validate_operation_transition) | 10 | 24 | 24/24 | none | 24/24 | 52 | 0 | 0 |
| Family control transitions (validate_control_transition) | 8 | 22 | 22/22 | none | 30/30 | 64 | 0 | 0 |
| Original operation custody (validate_original_models) | 6 | 11 | 11/11 | none | 16/16 | 14 | 0 | 0 |
| **SP-1101 retained dispatch (dispatch_retained_original), new** | 2 | 3 | 2/3 | OD03_dispatch_other (by construction) | 2/2 | 2 | 0 | 0 |
| Retained original custody (validate_historical_operation) | 15 | 39 | 39/39 | none | 39/39 | 110 | 0 | 0 |
| Family identity recipe (identity) | 2 | 7 | 7/7 | none | 27/27 | 102 | 0 | 0 |
| Current boundary trace (validate_case) | 9 | 24 | 24/24 | none | 31/31 | 86 | 0 | 0 |
| Checker integrity (main) | 7 | 14 | 14/14 | none | 14/14 | 24 | 0 | 0 |
| **All** | **117** | **237** | **234/237** | 3 | **283/283** | **630** | **0** | **0** |

**Rows proved by each family's own witnesses.** file.copied 186, file.created 189, file.deleted 180, file.exported 181, file.moved 181, file.renamed 183, folder.copied 182, folder.created 189, folder.deleted 181, folder.exported 182, folder.moved 181, folder.renamed 184, shared 17. Each family gains 2 over part 2A (OD01, OD02); file.created and folder.created gain 4.

**The new date-time negatives.** Every part 2B date-time negative refuses at an existing schema verdict row, so each lands as an alias of that row's single-defect observation (`schema_valid` false). Totals: PY01..PY12 79 aliases each, OC01 345, ER01 72, FQ01 27, CV01, FR01, RO01, RG01 2. The lane matrix finds no negative refused by a second row of its table.

**Lane evidence beyond the tool.** Each refused witness was re-run through the complete checker with only its refusing row cut: 6,836 are then accepted and 1,073 are refused later. The new later-refusal groups are three:
- **The same timestamp invariant at its copies:** a cut PYnn reaches OC01 through the settled payload, `occurred_at_utc` or `settled_at_utc` (16 per family). A cut OC01 reaches FQ01 or FR01 through the request or result copy.
- **The HM01 type cut:** a truthy non-boolean `historical` mode now reaches the dispatcher. It refuses OD01 there, because the API case's embedded trace has no sealed custody record.
- **Unchanged groups:** part 2A's groups are unchanged.

**Unprovable rows, each with its proof.**
- **IS02_integer_range** (`scripts/pm-filemanager-table-generate.py:647`, table `integer_slot_range`). Every slot's bounds are read from the owner schema whose verdict row runs first on every current write. Proved site by site on 17 coherent witnesses (`unprovable-evidence.json`):
  - cutting the payload schema row alone leaves IS02 refusing;
  - cutting IS02 alone leaves the schema row refusing;
  - cutting both leaves OC01 refusing;
  - cutting all three accepts, and restoration repeats the baseline.
- **QJ03_jcs_other** (`scripts/pm-filemanager-table-generate.py:489`, table `producer_jcs_other`). 48 preemption probes per run (lone surrogates, NaN, infinity): 0 reach QJ03, and every one is refused first by RV01 (`scripts/pm-filemanager-event-contracts.py:355`, `redb_bytes`).
- **OD03_dispatch_other** (`scripts/pm-filemanager-table-generate.py:407`). The other dispatcher refusals cannot be reached alone:
  - `caller_recipe_override` and `original_query`: the reader passes no override and the schema-valid append custody key (`scripts/pm-filemanager-event-contracts.py:1427`–`:1428`).
  - `original_authority`: the owner always returns an `OriginalCustody` (`:1409`–`:1412`).
  - `original_binding` and `original_scope`: the binding is projected on both sides from the same original, from fields the OC01 verdict guarantees (`:1382`).
  - `recipe_selection`, and a `RecipeTuple` field refusal from an empty or mistyped discriminator: refused first by OC01's `const` and type rules (`Plans/event_record.schema.json:39`, `:43`, the `schema_id`/`schema_version` consts).
  - `original_bytes_type`: the record bytes are EVENT_VALUE of an event RV01 already proved encodable, and the settlement and receipt bytes are SP-339 bytes of the already-encoded operation row (`:1410`–`:1412`).
  - `original_verification`: the frozen verifier returns True or raises its own table refusal (`:1417`–`:1424`).
  - `current_disclosure`: disclosure is the existing trace and control rows (`:1428`).
  - Lane evidence (`od03-evidence.json`): 204 probes (17 per family, one aimed at each reason) reach OD03 0 times; each is refused first by OC01 or RV01. With OC01 and RV01 both cut, the binding and tuple probes reach OD03, which shows it is a live later site of the same invariants. With RV01 cut, the bytes probes reach derivations that need the cut row, as in part 2A. The trace-side recipe fields are ignored (accepted).

By-construction rows each stay alone in their own table, so the reachable rows keep their credit.

## Fixture expectations

**No fixture expectation changed.**
- **Differential:** the merged pre-change checker at `dfd845d641` against the implementation head, over all 7,246 fixture witnesses: 0 result changes, 0 message changes, 0 schema-attribute changes.
- **Pre-change baseline:** byte-identical to part 2A's archived final witnesses.
- **Part 2A witnesses:** all 680 are byte-identical in the witness file (only `fixture_sha256` moved).
- **Why nothing moved:** every existing fixture timestamp is an uppercase-`Z` RFC 3339 value. That covers `ts`, `occurred_at_utc`, `observed_at_utc`, `persisted_at_utc`, `accepted_at_utc`, `settled_at_utc`, `acknowledged_at_utc` and `generated_at_utc`. The 13 schema-rule cases that set `ts` or `generated_at_utc` to `null` keep their exact `type` diagnostic.
- **What the fixture file gains:** only `custody_model.original_custody` (12 records, +72 lines). They were written once by `add-original-custody.py`, which refuses to overwrite an existing record.

**Integration note (not a stop).** Each recorded manifest pins five resource files per family:
- `filemanager_operation_contracts.schema.json`
- `event_record.schema.json`
- `event_append_receipt_contracts.schema.json`
- `storage_value_registry.schema.json`
- the family's own payload schema

None of them changed on `main` since the lane base `d5ec2f70c0` (checked against origin/main `77bae0c636`). If one changes at batch-2 integration, the retained route refuses OD02 (`recipe_unsupported`, fail closed) until an edition with those frozen resources is installed. Per SP-1101 the record is never restamped.

## Date-time inventory gate and the combined self-test in this lane tree

Addendum 2 applies. In this tree the date-time inventory gate fails closed and `datetime_validator` would raise. Neither is called by the DFM checker, and the inventory and exclusions files are not edited (they are NUMRULE files).

Recorded results, with only the locally copied, git-ignored currentness edition held outside the tree:
- **`python3 scripts/pm_event_datetime_inventory.py`: exit 1.** Status `fail`, 221 failures:
  - 130 `unclassified_mentioning_container`;
  - 48 `stale_scan_exclusion`;
  - 43 `unreadable_mentioning_container`.

  Node counts: 233 nodes, 133 Storage, 89 other-owner, 3 `wildcard_non_timestamp`, 8 role, 0 unclassified. There is no `inventory_node_changed` row.
- **Attribution:** every failure row names a file that differs from `58c2816ff3`. None names a file unchanged from it.
- **This pass's delta:** the same gate script run on the merge commit `dfd845d641` (part 2A plus the gated files, before any part 2B edit) reports 220 rows. The head changes four of them:
  - **1 new row:** `unclassified_mentioning_container` on `Plans/filemanager_event_p2a_cases.json`. The part 2B witnesses name `observed_at_utc` and `persisted_at_utc`.
  - **3 rows at the same place with a new content hash:**
    - `Plans/.plan_index/plan_units.jsonl` lines 1349 and 1557 (the CV-1101 and CV-318 rows; every Contracts_V0 unit row carries the regenerated document hash);
    - `Plans/filemanager_event_contract_fixtures.json` (it gains the custody records).
  - **217 rows unchanged.** They predate this pass and come from the lane's Plans edits since the NUMRULE base: `.plan_migration` snapshots, regenerated index lines, `Decision_Log` and its shards, and Contracts_V0's CV-318 fence, which earlier lane edits moved from line 20988 to 21002.
- **`python3 scripts/pm_event_numbers.py --self-test` (the combined self-test, scope all): exit 1.** `case_execution: NOT_RUN_ADMISSION_REFUSED`, 0 of 13,626 cases run, the same 221 inventory failures. It refuses before any case, as addendum 2 says.
- **`python3 scripts/pm_event_numbers.py --self-test --scope numbers`: exit 0,** `"status": "pass"`, 580 of 580.
- **`python3 scripts/pm_event_datetime.py --self-test`: exit 0 with no output.** It has no entry point, so it is not counted (addendum 2 correction).
- **At batch-2 integration:** the integration worker reviews the four rows above (the three DFM data and index files) under CV-1101 with the others, then runs `datetime_validator`, the full gate and the combined self-test on the merged tree.

**A run I discarded.** The first gate run in my verification chain wrongly held all of `Plans/.audits` outside the tree, tracked files included. Its rows were wrong (missing-file citations), so I discarded them and ran the gate again as above. After the restore I checked the tree: `git status` was clean and all 2,384 tracked `Plans/.audits` files were present.

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. "Before" is the part 2A self-grade at `62615d46d2`; "after" is `DFM.self-grade.json` at the implementation head.

| Family | Own unit | Before → after |
|---|---|---|
| `file.copied` | F-150 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `file.created` | F-151 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `file.deleted` | F-152 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `file.exported` | F-153 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `file.moved` | F-154 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `file.renamed` | F-155 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `folder.copied` | F-156 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `folder.created` | F-157 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `folder.deleted` | F-158 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `folder.exported` | F-159 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `folder.moved` | F-160 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `folder.renamed` | F-161 | 9P / 2Q / 1A → 9P / 2Q / 1A |

**108 PASS / 24 PARTIAL / 12 ABSENT, unchanged.**

**`positive_negative_oracles` (PARTIAL in each family).** Timestamps were one reason for PARTIAL. They no longer are: every timestamp field now runs the shared predicate with its owner profile, the 108 SWEEP-12 inputs refuse, and the profile controls accept on the current and retained routes. SP-1101 dispatch is no longer a reason either. The cell stays PARTIAL for three reasons:
- schema keywords are verdict rows, not cut one by one;
- IS02, QJ03 and OD03 are unprovable by construction;
- `datetime_validator` and the inventory gate have not run on this tree.

**`compatibility_withdrawal` (stays PASS).** Its finding now cites the SP-1101 composition.

**`retention` (stays PARTIAL)** as PENDING_RETENTION_DECISION. **`membership_version` (stays ABSENT).**

## Commands and evidence

Heavy runs went one at a time, each started only at 13.5 GiB available or more (`memgate.sh` inside long-jobs); the guard tool kept its own MemoryGate. Other VM work held the VM at 8–13 GiB for long stretches, so starts waited, and one differential I started at 12 GiB was stopped and restarted behind the gate. No browser was used, no subagent was started, and no NUMRULE file was edited.

**Commits:**
- `dfd845d641`: the merge.
- `47c4e3464f`: checker, tables, builder, runner, corpus oracle, fixtures and witnesses.
- `3cb373f91f`: CV-560, ATS-280, shards and index. This is the implementation head the checks ran on.
- `9c5c93a17e`: the registry-regression harness fix.
- Then the report commit.

**Evidence:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/sweep-p2b/`. Every file's SHA-256 is in `SHA256SUMS`; large files are gzipped.

| Command | Exit | Outcome |
|---|---:|---|
| `git merge --no-ff 58c2816ff3` | 0 | clean; 7 files, each equal to `git show 58c2816ff3:<path>` |
| `python3 scripts/pm-filemanager-p2a-cases.py` / `--check` | 0 / 0 | 1,556 witnesses (680 part 2A, 876 part 2B), 1,112 negatives, 444 controls, 0 dropped, file current |
| `python3 scripts/pm-filemanager-table-generate.py --check` | 0 | 117 tables, 237 rows |
| differential: pre-change checker at `dfd845d641` vs head | 0 | 7,246 witnesses: 0 result, message or schema-attribute changes; pre-change baseline byte-identical to part 2A's |
| `python3 scripts/pm-filemanager-event-contracts.py --family F` (12 families, serial) | 0 ×12 | `pass` each; 7,246 oracle cases, 1,556 part 2A/2B witnesses, 24 integrity witnesses per run |
| `python3 scripts/pm-filemanager-guard-tables.py --out … --save-collection …` | 1 | 114 suites PASS; 234/237 rows proved; exit 1 only for the 3 tables of unprovable rows; 0 findings, 0 lane-matrix problems, 0 masked |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `pass`, 580/580 |
| `python3 scripts/pm_event_numbers.py --self-test` (scope all) | 1 | refuses before any case: inventory stale in this tree (addendum 2) |
| `python3 scripts/pm_event_datetime_inventory.py` | 1 | 221 rows: 220 at the merge commit, plus 1 new from this pass and 3 rows with new content (section above) |
| `python3 scripts/pm_event_datetime.py --self-test` | 0 | no entry point; not counted |
| `python3 scripts/pm-filemanager-number-corpus.py --json …` | 0 | 6,888 route runs, 0 disagreements (same per-route counts as part 2A) |
| unprovable-row evidence (`unprovable-evidence.py`, `od03-evidence.py`) | 0 / 0 | IS02 proved site by site on 17 witnesses; QJ03 0 of 48 probes; OD03 0 of 204 probes |
| `python3 scripts/pm-filemanager-registry-regression.py` | 0 | after `9c5c93a17e`: control 1,134 cases; 28 pinned reference failures refused at RF01; restoration 0 failures. Before the fix it exited 1, stale since part 2A (it caught only `AssertionError`) |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | `pass`; only `Plans/_shards/contracts_v0/` (66) and `Plans/_shards/automated_testing_system/` (51) changed |
| `python3 scripts/pm-plan-index.py generate` (15 currentness files hash-verified first, same edition as part 2A) | 0 | `pass`; only Contracts_V0 and Automated_Testing_System unit rows changed; acceptance units CV-560 and ATS-280 |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `pass` |
| `python3 scripts/pm-plan-index.py validate` (origin/main `77bae0c636`) | 1 | top-level `fail`, 60 rows: 21 `plan_unit_removal_ledger_invalid` in existing ledgers and 39 `plan_unit_removed_without_ledger_decision` for units added on main after the lane base `d5ec2f70c0`. None names a DFM unit; the integration rebase owns them |
| `git diff --check be2c930bcc HEAD -- scripts Plans/*.md Plans/filemanager_event_p2a_cases.json` | 0 | clean |
| self-grade quote recheck (`relocate.py`) | 0 | 456 quotes: 312 at their line, 60 relocated, 84 new; 0 missing |

---

# DFM — sweep part 2A (guard tables on the gated tool) and part 2B numbers (earlier report; its "Timestamp fields — interim only" and "Part 2B items" are superseded by part 2B above)

Branch `plans/ea-w2-filemanager-20261104`; start `be2c930bcc`; gated tool merge `a8d9fa6853` (tool `004bdedd63`, eleven files, none edited); gated NUMRULE number-scope merge `0e9f24b5bc` (exact commit `a16f67c1ef`, never the branch head); implementation head `62615d46d2`. The delivery head is in the external `HEAD.txt`. No rebase onto main this round. Both merges brought no main commit into the lane (the NUMRULE merge base `fb441b27fd` is already in the lane).

**All twelve families keep their part-1 grades (108 PASS / 24 PARTIAL / 12 ABSENT).** Part 2A closes SWEEP-GUARD: every product refusal of `scripts/pm-filemanager-event-contracts.py` is one named row of a Method B guard table, and the gated tool proves **232 of 234 rows** in 115 tables, with 0 masked negatives and 0 unrelated changes. The other 2 rows (IS02, QJ03) cannot be refused alone by any input; each sits in its own table with its reason, so the other rows keep their credit. Part 2B numbers closes the number half of SWEEP-NUM with the shared CV-1100/SP-1100 calls; the part-1 2^60 counterexample is now refused. `positive_negative_oracles` stays PARTIAL in every family (schema keywords are verdict rows, not cut one by one; the timestamp items and SP-1101 dispatch are part 2B). Membership stays ABSENT, retention PARTIAL, native execution NOT_RUN. Sol and Astra review the lane once, after part 2B's timestamp items.

## Sweep part 2A: findings and responses

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **Take the gated tool** | Merged `004bdedd63` with `--no-ff` as `a8d9fa6853`: exactly the eleven tool files, no conflict, none edited. | `scripts/pm_guard_isolation*.py`, `scripts/guard-isolation/README.md`, `Plans/guard_isolation_traps.json`, GUARDTOOL reports | `git diff --stat a8d9fa6853^1 a8d9fa6853` lists 11 files; `git diff 004bdedd63 HEAD -- scripts/pm_guard_isolation.py` is empty; every tool report carries `tool_sha256` `e8038992…c0b8`, the gated file's hash. |
| **SWEEP-GUARD — guard tables** (fixed, `3d26ae2982`) | The checker derives the observation of the phase it is about to evaluate (recomputed keys, identities and digests, exact types, resolved rows, presence) and refuses only through `refuse()`, which raises the first refusing row of that phase's table (`TableRefusal`, a `ValueError` carrying phase, row, code and the legacy message). The tables are generated from one row spec. Compound `or` refusals and fixed field loops are split into one row per predicate; a later row's fact is computed only when an earlier row on the same field passes (None otherwise), so a type defect never doubles as a value defect. Whole-record typed equalities (`same_value` of a selected row, `backup_binding`) stay one row each. | `scripts/pm-filemanager-event-contracts.py:45` (`TableRefusal`), `:69` (`table_refusals`), `:87` (`refuse`); row spec `scripts/pm-filemanager-table-generate.py`; tables `scripts/pm_filemanager_table_*.py` | `python3 scripts/pm-filemanager-table-generate.py --check` (115 tables, 234 rows; no stale or extra module). |
| **Untracked refusals became rows** (`3d26ae2982`) | Six refusal sites raised `KeyError` and one an uncaught `SchemaError`: the missing operation, control and append custody rows (OW01, CL01, AR01), a missing SP-337 referent (PV01), a missing SP-340 profile (SF01) and the 2020-12 meta-schema check (SM01). Each is now a row; the `KeyError` rows keep their exact legacy message (`repr(key)`), so no fixture expectation changed. The codec's domain errors (float, out-of-range integer, unsupported type) became RV01. | `:121` (`check_schema_document`), `:259` (`redb_bytes`), `:288` (`resolve_payload`), `:329` (`validate_profile`), `:1180` (`validate_original_models`), `:1214` (`validate_historical_operation`) | Differential below. |
| **Schema verdicts** (`3d26ae2982`) | Every `jsonschema` verdict is one row per schema occurrence: the twelve family payload roots, `operation_custody`, `family_control`, both reference branches, `full_value_request`, `full_value_result`, `custody_v2`, the EventRecord root, the Storage registry, and one row per document group for the isolated schema-rule witnesses. `str(error)` and the error's validator/path are kept, so the fixtures' `expected_schema` oracle still checks the exact keyword. The routing of each witness's (document, definition) to its row is `schema_phase`. | `:207` (`schema_phase`), `:214` (`validate_shape`), `:1408` (`check_negative_reason`) | Schema rows prove 28/28. |
| **Checker integrity rows** (`3d26ae2982`) | `main()`'s integrity checks (twelve-family fixture set, owner unit and adoption tokens, registry/schema drift, registered custody, embedded `$defs`, aggregate Storage registry data) are rows too. 21 in-memory witnesses change one fact of a deep copy (one control per route) and `main()` runs them. | `:1449`, `:1455`, `:1463`, `:1501` (`integrity_witnesses`) | 14/14 integrity rows proved. |
| **Behaviour preserved** (`3d26ae2982`, `55fd84534e`) | A per-witness differential ran the merged pre-change checker and each restructured head over all 7,246 fixture witnesses. | `differential/` | Part 2A head and number head: 0 result changes, 0 message changes, 0 schema-attribute changes; every refusal is a table refusal. |
| **Adapter and runner** (`e810914e8e`) | Suites come from the complete checker's own witnesses run once under the observation recorder (12 family positives, 2,051 negatives, 671 transitions, 4,512 boundary cases, 680 part 2A witnesses, 21 integrity witnesses). Passing observations are controls; a refused witness's first refusal is a negative targeted at its refusing row. A result that differs from its fixture expectation, or a non-table refusal, is reported, never relabelled: the final collection has none. | `scripts/pm_filemanager_guard_suites.py:55` (`witnesses`), `:102` (`collect`), `:143` (`complete_boundary_flip`), `:162` (`lane_matrix`), `:193` (`suite_for`); `scripts/pm-filemanager-guard-tables.py` | `python3 scripts/pm-filemanager-guard-tables.py --out <dir>` (`--save-collection`/`--load-collection`, `--phase`). |
| **Two-defect negatives** | The lane matrix (every row on every case) found **none**: no negative is refused by two rows of one table. Two rows needed a precedence fact so that a negative could exist at all: CD02 reads `reader_enabled` only past `prepared` (a schema-valid prepared control always has its reader off), and CE03 joins the Project only for a project-scoped event (an application event is CE04's). | `scripts/pm-filemanager-table-generate.py` rows CD02, CE03; `:1275` | Lane matrix: 0 problems in every table; tool: 0 masked. |
| **Missing negatives** (fixed, `f7ab7967a5`, `e4d1d0ad7d`) | The first collection left 53 of 234 rows with no single-defect negative. `Plans/filemanager_event_p2a_cases.json` holds 680 witnesses (584 negatives, 96 controls) written by `scripts/pm-filemanager-p2a-cases.py` from named specs: each starts from its own family's valid row, makes one change and moves every copy with the checker's own fixture constructors (`synchronize_fixture`, `fixture_event`, `fixture_copies`, recomputed custody keys; new scenarios `p2a` and `p2a-terminal`). The builder keeps a negative only when the complete checker refuses it at exactly its target row, and `main()` re-checks the row. One witness defect was found by the flip evidence and fixed in `e4d1d0ad7d`: the PJ03 witness left its `final_operation` copy stale. | `scripts/pm-filemanager-event-contracts.py:512` (`apply_p2a_steps`), `:553`, `:1597` (`run_p2a_case`); `scripts/pm-filemanager-p2a-cases.py:79` (`specs`) | `python3 scripts/pm-filemanager-p2a-cases.py --check` (680 witnesses, 0 dropped, file current). |
| **Rows unprovable by construction** (`f7ab7967a5`) | IS02 (integer slot range) and QJ03 (other qualified-JCS refusals) have no input that reaches them alone; each sits in its own table so the tool credits the rest. They stay as checks and earn no credit. Reasons and lane evidence below. | tables `integer_slot_range`, `producer_jcs_other` (`scripts/pm-filemanager-table-generate.py:628`, `:470`) | `DFM.guard-tables.json` `totals.unproved`. |
| **Owner and test text** (`62615d46d2`) | ATS-280 names the guard tables, the gated-tool runner and the number corpus as checks and lists both commands as validation surfaces. | `Plans/Automated_Testing_System.md:7257` | Shards and index regenerated; only `Automated_Testing_System` and `Contracts_V0` outputs changed. |
| **Part 2 items from part 1** | SWEEP-GUARD fixed (above). The seven restored non-string `schema_id` cases keep their exact `type` diagnostic through the EventRecord verdict row; the retired const-only removal table stays historical (`DFM.guard-table.json`) and is superseded by `DFM.guard-tables.json`. SWEEP-NUM: number half fixed (next section); SP-1101 dispatch is part 2B. SWEEP-12 is a timestamp item: part 2B. | — | — |

**Disputed:** none. **Stopped for Jared:** none. **IDs used:** no new PlanUnit, Decision Log or admission ID; CV-560 and ATS-280 change in place. New witness IDs are the case names in `Plans/filemanager_event_p2a_cases.json`.

## Guard-table result

The gated tool ran **113 table suites: 232 rows proved, 0 failed suites**; the 2 tables of unprovable rows have no negative and get no tool run. 281 distinct single-row negatives (7,098 further witnesses with an identical observation ride as aliases), 3,951 tool evaluations. Lane-matrix problems: 0. Open collection findings: 0. Credit is the tool's own `rows[].proved`.

Each cut swaps one table row to always-pass; the tool then runs every control and negative, checks the guard-call trace against the uncut baseline and runs a fresh restoration. Own negatives must be accepted after the cut ("flips"); every other negative must keep its exact refusal ("stays"). Most tables have one distinct control observation (their facts are booleans); the lane matrix checks every control and negative directly.

| Checker area | Tables | Rows | Proved | Unproved (reason) | Cut: own flips / own | Cut: stays | Unrelated changes | Masked |
|---|---:|---:|---:|---|---:|---:|---:|---:|
| Schema verdicts (one row per occurrence) and schema document admission | 28 | 28 | 28/28 | none | 28/28 | 0 | 0 | 0 |
| Numbers: CV-1100 qualified JCS, current integer slots, SP-1100 EVENT_VALUE | 5 | 7 | 5/7 | IS02_integer_range (by construction; below), QJ03_jcs_other (by construction; below) | 5/5 | 4 | 0 | 0 |
| SP-337/SP-339/SP-340 transport, encoding and profiles | 11 | 18 | 18/18 | none | 22/22 | 38 | 0 | 0 |
| Current writer replay policy | 1 | 2 | 2/2 | none | 2/2 | 2 | 0 | 0 |
| Path custody: coverage, joins, accepted locations | 3 | 10 | 10/10 | none | 10/10 | 28 | 0 | 0 |
| Represented subjects (create/copy/move/export/rename/delete) | 7 | 19 | 19/19 | none | 19/19 | 62 | 0 | 0 |
| Complete original EventRecord joins | 3 | 9 | 9/9 | none | 14/14 | 42 | 0 | 0 |
| Operation custody transitions (validate_operation_transition) | 10 | 24 | 24/24 | none | 24/24 | 52 | 0 | 0 |
| Family control transitions (validate_control_transition) | 8 | 22 | 22/22 | none | 30/30 | 64 | 0 | 0 |
| Original operation custody (validate_original_models) | 6 | 11 | 11/11 | none | 16/16 | 14 | 0 | 0 |
| Retained original custody (validate_historical_operation) | 15 | 39 | 39/39 | none | 39/39 | 110 | 0 | 0 |
| Family identity recipe (identity) | 2 | 7 | 7/7 | none | 27/27 | 102 | 0 | 0 |
| Current boundary trace (validate_case) | 9 | 24 | 24/24 | none | 31/31 | 86 | 0 | 0 |
| Checker integrity (main) | 7 | 14 | 14/14 | none | 14/14 | 24 | 0 | 0 |
| **All** | **115** | **234** | **232/234** | 2 | **281/281** | **628** | **0** | **0** |

Rows each family's own witnesses prove (shared rows are proved by every family that reaches them, family-specific rows only by their family):

| Family | Rows proved by its own witnesses |
|---|---:|
| `file.copied` | 184 |
| `file.created` | 185 |
| `file.deleted` | 176 |
| `file.exported` | 177 |
| `file.moved` | 177 |
| `file.renamed` | 179 |
| `folder.copied` | 178 |
| `folder.created` | 185 |
| `folder.deleted` | 177 |
| `folder.exported` | 178 |
| `folder.moved` | 177 |
| `folder.renamed` | 180 |
| `shared` | 17 |

**Unprovable rows, with lane evidence.**
- **IS02_integer_range.** Every slot's bounds are read from the same owner schema whose verdict row runs first on every current write, so an out-of-range exact integer is always refused by that schema row. This is the same invariant at two sites (defense in depth), proved site by site outside the tool on coherent witnesses (`unprovable-evidence.json`): on all 17 witnesses (every family's `path_snapshot_revision` at 2^53, and `descendant_count` one above its maximum where declared), cutting the payload schema row alone leaves the witness refused by IS02 for the same defect, and cutting IS02 alone leaves it refused by the payload schema row; cutting both, the operation custody verdict OC01 refuses it, because its `settled_payload` reuses the same family payload bound (a third site of the same bound, inside a compound verdict row); cutting all three accepts it, and restoration repeats the baseline.
- **QJ03_jcs_other.** Every qualified-JCS refusal other than binary64/decimal (a lone surrogate, a non-finite float, an unsupported kind) of an EventRecord inside operation custody is refused first by RV01 (the SP-339 closed domain) or by the EventRecord schema. Preemption probes per family (lone surrogate in `actor_ref` and in `migration.migration_id`, NaN and infinite `producer_sequence_id`): 48 probes, 0 reach QJ03, every one refused first by RV01.

**Phase boundary.** Tables are extracted observation boundaries (tool boundary `synthetic`), as in DC, DX, DR and DG6B. The complete path is the full checker, which reaches every refusal through the same rows. As lane evidence beyond the tool, each refused witness was re-run through the whole checker with only its refusing row cut: 6,690 are then accepted and 689 are refused later. The groups: a cut presence or type row whose derivation then reads the refused value (`derivation_requires_cut_row`, for example a cut identity-string row then hashing a non-string); the operation CAS edge and revision re-checked by the terminal edge (OE01→OT01, OE02→OT02: the same predicate at two sites, each row proved alone by its own witnesses in the tool); a cut drain-list row reaching the key grammar; a cut float-slot row reaching the SP-339 domain (IS01→RV01); a cut producer-JCS row then comparing no digest (QJ01/QJ02→VR03); and single distinct invariants on the same source fact (PS01→OS01, OS02→CE08, CD01→CX02, OT01→TL01, SR01→RX01, OU01→OA01, RD02/RD03/RC01→RF01). None reaches a second row of its own table, so each stays a single-row negative for the tool.

**What Astra keeps finding, probed for this pass.** (1) Identities, keys, receipt refs, commitments and the producer digest are recomputed in derivation and compared by rows (OK01, OK02, CU01, CN01, CE08, VR02, VR03); forged copies are the negatives. (2) Storage-assigned fields are compared with Storage's own rows (CU02–CU06, IR01–IR04, CB01–CB05); retry compares only the caller semantic body (RT02). (3) The writer rows (WR01, WR02) never run on a retained original (`historical=True` skips them); retained `projector_replay_only` and compatibility history stay accepted (the existing historical-policy cases), withdrawn, foreign or forged originals refuse. (4) Joins keep typed equality (`same_value`) where they did; no field is read two ways by the restructure (0 differential changes). (5) SR01 resolves every `$ref` per document, dormant definitions included, and has its own registry witness. (6) EB01–EB04 and VS01/VS02 measure every stored part; the event body uses SP-1100 bytes. (7) Every current append, retry and terminal route runs the full original custody chain; the terminal reader route now has direct witnesses (OT01, OT02). (8) Masked negatives: tool `masked` empty on every row; the complete-boundary re-runs above; one stale-copy witness found and fixed. (9) Grades unchanged; the oracle cell stays PARTIAL. (10, 10a) The number pass below; the retained reader never runs slot admission. (11) Type rows test the exact type name (`tname`) and identity with `True`/`False`; the existing exact-type fixtures (string, float, null, list, object) all still refuse at their rows. (12) Timestamp formats: part 2B; interim review below.

## Sweep part 2B numbers: findings and responses

The number scope was merged as the exact gated commit and adopted through the shared helper only: no NUMRULE file is edited and no date-time code is imported (`pm_event_datetime*` is used nowhere in the DFM checker, adapter, builder or corpus runner). DFM's recipe IDs, identity preimage, tuple positions, key and receipt-ref recipes are unchanged.

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **SWEEP-NUM — producer digest** (fixed, `55fd84534e`) | All three sites use the shared `producer_semantic_digest` (the unchanged CV-317 projection under CV-1100 qualified JCS): fixture construction (`synchronize_fixture`, `fixture_event` via `fixture_producer_digest`) and retained verification (`validate_historical_operation`). New rows QJ01 `jcs_binary64` and QJ02 `jcs_decimal` refuse before the digest comparison VR03. The part-1 counterexample is closed: 2^60 at `producer_sequence_id` refuses QJ02, 2^53+1 refuses QJ01, 2^53 is accepted. For every existing fixture the shared digest equals the old surrogate's, so no stored digest changed. | `scripts/pm-filemanager-event-contracts.py:427`, `:1244` | Witnesses `…:p2a:producer-2^60`, `…:p2a:producer-2^53+1`, `…:p2a:producer-2^53-control`. |
| **SWEEP-NUM — identity** (fixed, `55fd84534e`) | The schema-proven string-array preimage is kept exactly (compact UTF-8 JSON, as the F units' RFC 8785 recipe requires for strings). New row IT05 requires it to equal the shared `qualified_jcs` bytes, so non-ASCII strings are checked rather than assumed: five conformance controls (Latin-1, CJK, an astral emoji, U+2028, a control character) are accepted with an unchanged digest recipe, and a lone surrogate refuses at IT05 instead of raising `UnicodeEncodeError`. The epoch row reads `current_integer(minimum=0)`. | `:1298` (`identity`), `:1320` | Witnesses `…:p2a:identity-non-ascii-*`, `…:p2a:identity-lone-surrogate`. |
| **CV-1100 current integer slots** (fixed, `55fd84534e`) | `current_integer` runs at every declared schema integer slot of a current write: payload slots read from each family schema (`path_snapshot_revision`; `descendant_count` where declared), operation `recovery_epoch`, `revision` and every `path_snapshot_revision`, control `control_revision`, `last_admitted_sequence` and nullable `writer_cutoff_sequence`. No blanket walk. The retained reader never runs it. An integral float that JSON Schema's `integer` type admits (`0.0`) was previously accepted at the payload slot; it now refuses IS01 on the current route, and the retained reader refuses it at RV01 (SP-339 domain), never at a slot row. The trace sequence, issued sequence and identity epoch rows read `current_integer`'s reason (same outcomes). | `:892` (`integer_refusal`), `:902` (`payload_slots`), `:917` (`OPERATION_SLOTS`), `:937` (`admit_slots`), `:1343` | Witnesses `…:p2a:payload-revision-float`, `…:p2a:payload-revision-float-history`; corpus routes payload-slot and history-slot. |
| **SP-1100 physical bytes** (fixed, `55fd84534e`) | EventRecord bodies are measured and referenced with `storage_value_bytes(profile=EVENT_VALUE)` (rows EV01 `physical_integer_range`, EV02 other); `full_value_commitment` uses the shared CV-339 recipe inside DFM's commitment record. SP-339 redb values (operation custody, family control) keep the repository encoder, now refused through RV01 outside its closed domain. Every existing body, reference and commitment is byte-identical (differential: 0 changes). | `:249`, `:259`, `:308`, `:859` | Witnesses `…:p2a:event-body-uint64-overflow`, `…:p2a:event-body-lone-surrogate`. |
| **Long integers** (fixed, `55fd84534e`) | The corpus run found a real lane crash: a valid 4,400-digit integer (CV-1100 allows no global cap) made `jsonschema` raise `ValueError` while rendering its error message, and the identity recipe's `str(epoch)` would too. Schema verdicts and the epoch text now render integers exactly under a scoped, restored `int_max_str_digits(0)`; no integer value is changed. | `:102` (`exact_integer_text`), `:214`, `:1298` | Corpus run: 0 untracked results. |
| **Fixture expectations** | **None changed.** Unlike DX, no existing case's expected result moved under the shared rule: no fixture carries an integer above 2^53 in a producer field, a non-ASCII identity string or an integral float at a schema slot. The new behaviour is pinned by the new witnesses above. | — | Differential: 0 result changes on 7,246 witnesses. |
| **Owner text** (`62615d46d2`) | CV-560 states how the twelve routes follow CV-1100/SP-1100/SP-1101 beside CV-317, CV-339, SP-236, SP-286, SP-337 and SP-339. | `Plans/Contracts_V0.md:24650` | Index regenerated; CV-560 acceptance unit changed. |
| **Shared corpus through the complete checker** (`55fd84534e`) | `scripts/pm-filemanager-number-corpus.py` places every number value of the corpus's number scope (82 values: typed values and the values of raw spellings `loads_current_json` admits; bare and non-finite `Decimal`s are not JSON values and are excluded) on seven routes in each family, every copy moved: the current payload slot, the same original through the retained reader, the trace sequence, the identity epoch, the control issued sequence, the complete event's `producer_sequence_id` and an EventRecord body. The expected outcome is composed outside the checker from the shared helpers, the owner schema verdict and the SP-339 domain; the history route asserts no slot row is ever reached. | `scripts/pm-filemanager-number-corpus.py:131` (`run`) | Exit 0: 6,888 route runs, 0 disagreements (event-body 528 accepted / 456 refused, history-slot 168 accepted / 816 refused, identity-epoch 312 accepted / 672 refused, issued 228 accepted / 756 refused, payload-slot 168 accepted / 816 refused, producer 180 accepted / 804 refused, trace-sequence 252 accepted / 732 refused). |
| **Number self-test** | `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | — | Exit 0, `"status": "pass"`, 580 of 580 cases. Credited exactly as reported. Environment: Python 3.14.4; msgpack 1.2.4 (the guide names 1.1.2), rfc8785 0.1.4, blake3 1.0.11, jsonschema 4.19.2. |

`storage_uint64` is not used: no DFM field is declared uint64 by its owner (the AppendReceipt `sequence_id` slot declares only `minimum: 0`).

## Timestamp fields — interim only

This is my own review of the DFM timestamp fields, and it is **interim only** (pm7-build, 2026-11-05 16:50Z), not a certification. No date-time code from NUMRULE is adopted, and no timestamp rule changed in this pass. What the checker does today:
- **Declared formats.** Payload `ts` (each family schema), companion `accepted_at_utc` and `settled_at_utc` (`accepted_command`, `settlement`, `noncompletion`), the EventRecord's `occurred_at_utc`, `observed_at_utc` and `persisted_at_utc` (through `operation_custody.complete_event` and the retry event) and the receipt's `acknowledged_at_utc` are `format: date-time`.
- **Enforcement.** `validate_shape` passes `jsonschema.FormatChecker()`, but in this environment (no `rfc3339-validator`) that checker registers no `date-time` format, so a malformed timestamp passes schema validation (checked: `"garbage"` conforms). This is item 12 and SWEEP-12; it is not fixed here.
- **Joins.** The checker compares timestamps as exact strings: CE06 (`occurred_at_utc` equals payload `ts`) and SI05 (`settled_at_utc` equals `ts`). Retry equality excludes the Storage-assigned `observed_at_utc`/`persisted_at_utc` (CV-339). No timestamp is parsed, normalized or ordered.
- **Profiles.** CV-253 would require `storage_utc_z` (uppercase `Z`, no offsets) for `observed_at_utc`/`persisted_at_utc`; nothing enforces it here.

## Part 2B items

Timestamp items only; each needs the CV-1101 date-time gate, which has not passed, and is left exactly as it was:
- **SWEEP-12 / CV-1101 at the DFM boundaries.** `scripts/pm-filemanager-event-contracts.py:214` (`validate_shape`, format checker), `:1463` (registry validator); payload `ts` in `Plans/event_payloads/file_manager/*.schema.json` (`properties.ts`); `Plans/filemanager_operation_contracts.schema.json` `accepted_command.accepted_at_utc`, `settlement.settled_at_utc`, `noncompletion.settled_at_utc`; EventRecord fields through `operation_custody.complete_event` and the retry event. Adopt `datetime_validator` with the closed registry at the complete outer boundary, `storage_utc_z` for `observed_at_utc`/`persisted_at_utc`, the owner profile for `ts` and the companion fields, and negatives from the shared battery (zone, separators, calendar, trailing LF, fraction, leap second), keeping CE06/SI05 as exact-string joins.
- **SP-1101 authenticated retained dispatch.** `validate_original_models` (`:1180`, `historical=True`) → `validate_historical_operation` (`:1214`): resolve the original through `RetainedDispatcher` with the authenticated write-time `RecipeTuple` (identity recipe, CV-317/CV-1100 producer recipe, EVENT_VALUE and SP-339 profiles, frozen resource manifest) instead of today's resources. It is listed here, as DMEM listed its S3, because the frozen verifier pins the payload, EventRecord and companion schema resources, and those carry the `format: date-time` fields above; NUMRULE-ADOPTION.md assigns a retained verifier that selects a date-time profile to the date-time suite. For numbers alone there is no second edition to select: the twelve families were never admitted, so every DFM original is written under the current recipe.
- **Date-time inventory gate.** `python3 scripts/pm_event_datetime_inventory.py` over `Plans/filemanager_event_contract_fixtures.json` (it holds EventRecord copies with `observed_at_utc`/`persisted_at_utc`) when CV-1101 is adopted; the part 2A witness file holds no Storage timestamp field.

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. Before is the part 1 self-grade at `acbb0d2a4a`; after is `DFM.self-grade.json` at the implementation head `62615d46d2`.

| Family | Own unit | Before → after |
|---|---|---|
| `file.copied` | F-150 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `file.created` | F-151 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `file.deleted` | F-152 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `file.exported` | F-153 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `file.moved` | F-154 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `file.renamed` | F-155 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `folder.copied` | F-156 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `folder.created` | F-157 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `folder.deleted` | F-158 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `folder.exported` | F-159 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `folder.moved` | F-160 | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `folder.renamed` | F-161 | 9P / 2Q / 1A → 9P / 2Q / 1A |

**108 PASS / 24 PARTIAL / 12 ABSENT → the same totals.** Only the `positive_negative_oracles` cell text and evidence changed; its status stays PARTIAL (schema keywords are verdict rows, IS02/QJ03 unprovable, timestamps and SP-1101 dispatch part 2B). Every self-grade evidence quote was rechecked at the implementation head with zero misses: 324 prior quotes (228 in place, 84 moved line, 12 re-quoted because the registry-failure line was rewritten) plus 5 new quotes per family (`refuse`, the registry call, the shared producer digest, the ATS-280 and CV-560 paragraphs); 372 in total. No admission or retention decision is claimed.

## Commands and evidence

Heavy runs went one at a time behind a memory gate (start at 13.5 GB available, pause below 10 GB, resume at 11 GB; the tool's own MemoryGate behind it). The gate held some starts for a few minutes while other work used memory; PM7 work was not waited on or touched. No browser was used. Commits: `a8d9fa6853` (tool merge), `0e9f24b5bc` (NUMRULE number-scope merge), `3d26ae2982` (tables), `e810914e8e` (adapter, runner), `55fd84534e` (numbers), `f7ab7967a5` (witnesses, table adjustments), `e4d1d0ad7d` (PJ03 witness copies), `62615d46d2` (CV-560, ATS-280, shards, index), then the report commit. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/sweep-p2a/` (SHA-256 of every file in `SHA256SUMS`; large files gzipped).

| Command | Exit | Outcome |
|---|---:|---|
| `git merge --no-ff 004bdedd63` | 0 | clean; 11 tool files, none edited |
| `git merge --no-ff a16f67c1ef` | conflicts in generated files only | 163 conflicts in `Plans/_shards/contracts_v0` (66), `Plans/_shards/storage-plan` (91) and `Plans/.plan_index` (6), resolved by regenerating (shard generate, index generate with the 15 currentness files hash-verified, shard check pass), never by hand; no other path conflicted |
| differential: merged pre-change checker vs each restructured head | 0 | 7,246 witnesses: 0 result, message or schema-attribute changes at `3d26ae2982`, `55fd84534e` and `62615d46d2` |
| `python3 scripts/pm-filemanager-table-generate.py --check` | 0 | 115 tables, 234 rows |
| `python3 scripts/pm-filemanager-p2a-cases.py --check` | 0 | 680 witnesses, 0 dropped, file current |
| `python3 scripts/pm-filemanager-event-contracts.py --family F` (12 families, serial) | 0 | `pass` each; 7,246 oracle cases, 680 part 2A witnesses, 21 integrity witnesses per run (`cli/`) |
| `python3 scripts/pm-filemanager-guard-tables.py --out ... --save-collection ...` (long-job `dfm-p2a-final`, at `62615d46d2`) | 1 | 113 suites PASS, 232/234 rows proved; exit 1 only for the 2 tables of unprovable rows (no negative); 0 findings, 0 lane-matrix problems (`tool/`) |
| first full run (long-job `dfm-p2a-tool1`, at `f7ab7967a5`) | 1 | same credit; its flip evidence found the PJ03 stale copy fixed in `e4d1d0ad7d` |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `pass`, 580/580 |
| `python3 scripts/pm-filemanager-number-corpus.py --json ...` | 0 | 6,888 route runs, 0 disagreements |
| unprovable-row evidence (`helpers/unprovable-evidence.py`) | 0 | IS02 proved site by site on 17 witnesses; QJ03 unreachable in 48 probes |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | `pass`; only `Plans/_shards/automated_testing_system/` and `Plans/_shards/contracts_v0/` changed |
| `python3 scripts/pm-plan-index.py generate` (15 currentness files hash-verified first) | 0 | `pass`; only Automated_Testing_System and Contracts_V0 units changed (acceptance units ATS-280, CV-560) |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `pass` |
| `python3 scripts/pm-plan-index.py validate` (origin/main `f7764a650e`) | 1 | top-level `fail`, 30 failures: 21 `plan_unit_removal_ledger_invalid` in existing ledgers and 9 `plan_unit_removed_without_ledger_decision` (DL-333, DL-335..340, DL-349, UCC-230, added on main after this branch's base `d5ec2f70c0`); the identical set DC, DR and DX recorded; none names a DFM file. Integration rebase owns them. |
| `git diff --check be2c930bcc HEAD -- scripts Plans/*.md Plans/filemanager_event_p2a_cases.json` | 0 | clean |

---

# DFM — sweep part 1: B4 repaired; part 2 remains open (earlier report, unchanged)

Branch `plans/ea-w2-filemanager-20261104`; tested implementation `acbb0d2a4aedce8d015b3f31a9748608c8d5dccb`. Incoming reviewed head `68fe8e3479b376d0165a67c18eded0b9e02d7d15`; rebase base `origin/main` at `d5ec2f70c0`. **NOT_READY: shared part-2 work and its reviews remain required.** Membership is ABSENT, event-history retention is PARTIAL / PENDING_RETENTION_DECISION, native execution and native filesystem-alias authentication are NOT_RUN.

## Sweep part 1: findings and responses

- **Cycle-8 B4 — fixed (`acbb0d2a4aedce8d015b3f31a9748608c8d5dccb`).** Where: `Plans/event_record.schema.json:40`, `scripts/pm-filemanager-event-contracts.py:1196`, and `scripts/pm-implementation-readiness.py:793`. Why: removing `schema_id.type` changed the exact bytes pinned by the goal realm, and the DFM family filter hid its 28 unresolved references. Fix: restore the complete original file, SHA-256 `bda87b247d841e058758136731734e515ae947f2261b5f90370015603d3bd353`, and enforce every aggregate registry failure. The removal existed only for redundant assertion accounting; no DFM schema/resource replacement is needed. The two existing goal-realm pins and their owner contracts are unchanged.
- **B4's filtered count diagnostics — fixed in the same commit.** Where: `scripts/pm-implementation-readiness.py:795`. The lane already has exactly two SP-560 companion values, both materialized and later_gui_or_feature_projection. Strict expected counts now match them: families 344 → 346, materialized 320 → 322, later tier 273 → 275. No row is added by this sweep, no check is bypassed, and no Event registry membership is changed. Before: 31 failures (28 reference failures plus these three stale count expectations). After: zero aggregate registry-data failures. The readiness self-tests pass, including census-drift refusal cases.
- **B4 regression — fixed in the same commit.** Where: `scripts/pm-filemanager-registry-regression.py:19`. Verify with `python3 scripts/pm-filemanager-registry-regression.py` in a Python environment containing `blake3` and `jsonschema`. The unchanged full family checker accepts its valid control (1,134 cases). An in-memory byte substitution removes only the original `schema_id.type` line, restoring the exact bad hash `8a744b68f3bb1c1c4235c060fdbf7d906ddbcd5edf47eb7f40dae0d14cdfbf2b`. The actual resolver emits exactly 28 goal_cancel_progress reference failures, and the full checker refuses all 28. Restoration gives zero failures. Resource pins and registry rows stay fixed; every instance validator remains enabled.
- **Restored-schema diagnostic fixtures — fixed in the same commit.** Where: `Plans/filemanager_event_contract_fixtures.json:37028` and the six corresponding wrong-type variants. Seven non-string schema_id fixtures now expect the restored schema's first `type` diagnostic. Their inputs and valid controls are preserved. Const/type assertion proof accounting remains part 2; the historical table is explicitly marked HISTORICAL_PART2_REQUIRED.
- **Astra 2 B1/B2/B3 — already fixed; reverified.** The existing settlement joins, represented-location relation and exact drain-domain/reader fences remain intact. The unmodified cycle-8 driver executes 478 control/refusal/removal/restoration witnesses with zero failures at this implementation. All twelve complete suites pass. No other non-number, non-proof blocker remains listed in cycle 8.
- **Deck-2 items — none assigned to DFM in this task.** No Decision Log answer is extended. The rebase includes the landed DL-400..452 answers. DL-045's existing scope and SP-310's exact hash-pinned reference rule are preserved; the current SP-560 rows still explicitly leave event-history retention pending.

## Family grades before and after

Before is the binding cycle-8 independent grade. Counts are PASS / PARTIAL / ABSENT. Q remains PARTIAL because part 2 is unfinished; B4 closure alone does not make a lane READY. The other 132 statuses retain their current support. The twelve F units and SP-560/CV-560/ATS-280 are byte-identical to the reviewed head; 324 current citations are rechecked and relocated in the self-grade.

| Family | Own unit | Before | After | Passing family cases |
|---|---|---|---|---:|
| file.copied | F-150 | 9 / 2 / 1 | 9 / 2 / 1 | 1134 |
| file.created | F-151 | 9 / 2 / 1 | 9 / 2 / 1 | 549 |
| file.deleted | F-152 | 9 / 2 / 1 | 9 / 2 / 1 | 540 |
| file.exported | F-153 | 9 / 2 / 1 | 9 / 2 / 1 | 554 |
| file.moved | F-154 | 9 / 2 / 1 | 9 / 2 / 1 | 557 |
| file.renamed | F-155 | 9 / 2 / 1 | 9 / 2 / 1 | 549 |
| folder.copied | F-156 | 9 / 2 / 1 | 9 / 2 / 1 | 562 |
| folder.created | F-157 | 9 / 2 / 1 | 9 / 2 / 1 | 548 |
| folder.deleted | F-158 | 9 / 2 / 1 | 9 / 2 / 1 | 555 |
| folder.exported | F-159 | 9 / 2 / 1 | 9 / 2 / 1 | 569 |
| folder.moved | F-160 | 9 / 2 / 1 | 9 / 2 / 1 | 569 |
| folder.renamed | F-161 | 9 / 2 / 1 | 9 / 2 / 1 | 560 |

**108 PASS / 24 PARTIAL / 12 ABSENT → 108 PASS / 24 PARTIAL / 12 ABSENT.** No admission or retention decision is claimed.

## Part 2 items

- **SWEEP-NUM:** `scripts/pm-filemanager-event-contracts.py:228`, `:275`, `:945`, identity `:981`/`:1001`, and historical entrypoints `:876`/`:911`. Adopt shared CV-1100/CV-1101 and SP-1100/SP-1101 plus the shared helper across producer digests, identity inputs and authenticated write-time recipe dispatch. Preserve Storage uint64, physical float bytes and signed zero. Add no lane-local cap or serializer. The prior 2**60 counterexample remains open; it is not retested or claimed repaired here.
- **SWEEP-12:** `scripts/pm-filemanager-event-contracts.py:80`, `Plans/event_payloads/file_manager/file_copied.schema.json:94` and each sibling's ts field; companion formats at `Plans/filemanager_operation_contracts.schema.json:185`, `:254`, `:730`. Enforce the owner's date-time grammar or an asserted available format checker. Cover zone/separator/calendar/LF/fraction/leap-second boundaries and supported authenticated history. No malformed-date repair or PASS is claimed here.
- **SWEEP-GUARD:** `reports/event-authority-20261104/DFM.guard-table.json`, existing lane proof drivers, and especially `Plans/event_record.schema.json#/properties/schema_id/type` / `#/properties/schema_id/const`. Adopt `scripts/pm_guard_isolation.py` and named guard tables after the shared tool passes. The seven restored non-string cases cannot use their old const-only removal witnesses. Their old table is retained as historical evidence, not restamped as current proof. No proof driver or guard-table refactor is implemented in part 1.
- **Review boundary:** Sol and Astra review after part 2, as SWEEP-P1 requires. This report does not downgrade an Astra NOT_READY.

## Verification and integration

| Check | Result |
|---|---|
| Full family checker, serial, all twelve | 12 exits 0; 7,246 cases = 468 positives + 6,778 negatives |
| B4 complete-checker byte regression | Exit 0; 28 bad references refused; restoration zero failures |
| Existing cycle-8 B1/B2/B3 driver | Exit 0; 478 witnesses, zero failures |
| Readiness self-tests | Exit 0; top-level pass, no failures |
| Shard generation / check | Exit 0 / 0; expected DFM owner/schema/registry groups only |
| Plan-index generation / validation | Exit 0 / 0; top-level pass, zero failures |
| Source citations / unchanged reviewed owner units | 324 exact citations / 15 identical units |
| git diff --check | Exit 0 |

The rebase resolved generated-artifact conflicts by deferring their bodies to regeneration; canonical owner text merged without conflict. Regeneration touches only the four DFM Markdown owner groups, restored EventRecord schema and Storage registry group. No unrelated owner is repaired. The first regeneration scope assertion misspelled the expected event_record.schema directory; inspecting the actual source/group mapping cleared that setup error before the checks continued. Currentness edition: 15 files copied from the prescribed shared edition and SHA-256 matched before index generation. Its index result is passing; node readiness still says blocked_runtime_certification_incomplete. No full governance/landing gate or standalone all-profile aggregate was run or claimed.

Initial disk availability was 499 GB; available memory 11 GiB at preflight. Recorded serial-check availability stayed at or above 13 GiB. No memory pause was needed. Heavy jobs ran one at a time. The two briefing memory files were absent from the prescribed Nas1 paths and were not found locally; no ID allocation depended on them because no IDs were minted.

## Scope, IDs and evidence

**IDs retained:** F-150–F-161, SP-560, CV-560, ATS-280. **New IDs / bindings / PlanUnits:** none. No canonical Markdown is changed by the part-1 fix itself; the four existing lane owner additions are preserved through rebase. No event registry append, admission, Decision Log edit, ignore edit, Spec Lock, auto-decision, frozen validator or governance reseal is performed. No pm-mail, subagent, main push, browser or server is used.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/sweep-p1/evidence-manifest.json`, SHA-256 `9ec703a0f62d37fa9329e7a6cf3b92301cdeda9b1c2d82c28238e82321413f69`. It pins the serial commands/results, exact source and currentness hashes, B4 before/after regression, unchanged owner units, fixture diagnostic list and reproduction helpers. The self-grade and historical guard table are report artifacts in this branch; publication copies and final head are pinned separately in publication.json. The worktree and temporary Python environment are removed after publication.
