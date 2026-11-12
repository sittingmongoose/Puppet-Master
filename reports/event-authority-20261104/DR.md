# DR — Sweep part 2B: shared date-time check and shared number rules

Branch `plans/ea-w2-runtime-artifacts-20261104`; part 2A head `78bc525d65`; gated NUMRULE merge `2d13c3718e` (exact `58c2816ff3`); fix round DR-P2B-FIX1 commits `7788f9ba35`, `32a2a9dde5` and `b430830f44`; delivery head in the external sweep `HEAD.txt`. No rebase this round.

**All 19 families keep 10 PASS / 1 PARTIAL / 1 ABSENT.** Part 2B closes N2 (shared number and recipe rules) and S1 (date-time formats): every timestamp field DR owns is now checked by the shared CV-1101/CV-253 check, and the lane's number surrogates are replaced by the shared CV-1100/SP-1100/SP-1101 calls. The timestamp review is **no longer interim**: the table below names the shared check covering each field. `positive_negative_oracles` stays PARTIAL for one reason only: the shared date-time inventory gate refuses admission on this tree (T199), so the shared suite `pm_event_numbers.py --self-test` does not pass here until batch-2 integration reviews the inventory. Membership stays ABSENT; native execution is NOT_RUN. Sol max and Astra max review the lane in batch 2.

## Sweep part 2B: findings and responses

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **Step 1 — merge the gated head** | Merged exactly `58c2816ff33365384d4039553f5efdb5370930e6` with `--no-ff` as `2d13c3718e`. 163 conflicts, all in `Plans/_shards/**` and `Plans/.plan_index/**`, resolved by regenerating (shard generate, index generate with the 15 hash-verified currentness files, shard check `pass`). **No non-derived conflict**; neither addendum resolution was needed (DR held no early NUMRULE copy and no shared owner unit). The 22 NUMRULE non-Markdown files are byte-identical to `58c2816ff3`; `Contracts_V0.md` and `storage-plan.md` carry exactly NUMRULE's 75 and 80 changed lines. Regeneration changed only those two documents' shards and units (4 units added: CV-1100, CV-1101, SP-1100, SP-1101). | merge commit `2d13c3718e` | `git diff --name-only fb441b27fd 58c2816ff3` minus derived paths equals the merge's non-derived paths; `git rev-parse 2d13c3718e:<path>` equals `58c2816ff3:<path>` for the 22 files; `merge-proof.json`. |
| **S1 — shared date-time check** (fixed, `4e0696376a`) | New row **S08_date_time** runs `pm_event_datetime.datetime_validator` on every adopted schema occurrence (EventRecord, receipt, custody, result, checkpoint, every payload schema, toy schemas), current and historical, over a closed preloaded registry (event record, receipt contracts, checkpoint, shared integration runtime; nothing retrieved). S07 keeps every other format (`stock_format_checker` drops only `date-time`), so a date-time defect is S08's alone. | `scripts/pm-runtime-artifact-event-drafts.py:416` (`DATETIME_RESOURCES`), `:426`, `:439` (`shared_datetime_validator`), `:492`; `scripts/pm_runtime_artifact_table_schema.py:20` (`S08_date_time`) | Witnesses below; route checks `S08_route_*` and `S08_history_*` in every family. |
| **S1 — lane leaks other lanes found** | Each now refuses through S08 with a test in every family: `24:00:00Z` (`*_hour_24` at occurred/observed/persisted, receipt and route), trailing LF (`*_trailing_lf`), missing zone, space separator, Feb 30, false leap second, `+24:00` offset, empty fraction; on Storage fields `+00:00`, `-00:00`, lowercase `z`, nonzero offsets. Lowercase `t`/`z`, offsets, long fractions and real leap seconds are kept with their exact spelling on `occurred_at_utc` (CV-1101 broad profile). DR had no date-time support before (stock `FormatChecker()` skipped `date-time`: part 2A report). | `scripts/pm_runtime_artifact_round10_cases.py:16-48` (value sets), `:77-110`; `scripts/pm-runtime-artifact-event-drafts.py:1568` (`part2b_oracles`) | Full checker `S08_route_*` checks; guard-tool S08 rows. |
| **N2 — integer slots** (fixed, `4e0696376a`) | **N01_integer_slots** replaces the blanket `canonical_numbers` walk: a second Draft 2020-12 validator whose only change is the `integer` type, defined by the shared `current_integer`, runs after the stock pass on current-writer occurrences; field bounds stay the schema's. Untyped values and number slots are not walked (CV-1100 / guide: no blanket walk). | `:296` (`integer_refusal`), `:305` (`current_integer_slot`), `:411` (`INTEGER_SLOT_VALIDATOR`), `:495`; `pm_runtime_artifact_table_schema.py:32` | Round-6 N01 witnesses at EventRecord, receipt, custody, result and checkpoint integer slots still refuse, now at N01_integer_slots. |
| **N2 — physical bytes** (fixed) | `value_bytes` is the shared `storage_value_bytes(..., profile=EVENT_VALUE)`; codec rows read its refusal reason: I02 non-finite, I03 type/key type, **I04 integer outside −2^63..2^64−1**, **I05 lone surrogate**. The CV-339 commitment uses the shared `full_value_commitment`. The lane MessagePack surrogate (`packed_value`, `codec_observation`) is removed; every positive's bytes, digest and commitment are unchanged (`shared_full_value_commitment_agrees`, `shared_producer_digest_agrees`, known answers). | `:594` (`physical_bytes`), `:602`, `:621`; `pm_runtime_artifact_table_codec_value.py:16-28` | Shared checks plus `I04`/`I05` witnesses. |
| **N2 — JCS routes** (fixed) | Pack bodies (`storage_form`, row **J01s**), inline sizes (`canonical_size`, rows **D04q**/**V05q**, split from D04/V05 so size and qualification are separate predicates), pack canonical bytes (D10b) and the producer digest (`semantic_digest` = shared `producer_semantic_digest`, rows **A08** in append and **F14** in full value; F09/A04/A05 now read only a present digest) use `qualified_jcs`: 2^53+1 refuses `jcs_binary64`, 2^60 `jcs_decimal`, a lone surrogate `unicode_scalar`, before any effect. Pack bodies parse integers exactly (`JsonNumber(...).exact()`). | `:582`, `:624-639`, `:667`; tables `codec_storage:16`, `decode_envelope:36`, `stored:36`, `append_dedupe:16`, `full_value_ids_b:32` | Witnesses `J01`, `D04`/`V05` (lone surrogate in every family; 2^60 in screenshot/browser/cost payload slots), `A08`, `F14`. |
| **N2 — authenticated historical recipe selection** (fixed) | Retained history and the restore-point predecessor resolve through the shared `RetainedDispatcher`. `SourceOwner` returns the binding (Storage, scope, Server, Project, family, event identity, owner operation, value commitment) and the `RecipeTuple` recorded by the authenticated source adapter (`recorded_decoder`), with a resource manifest over the frozen schema bytes; the map from tuple to `frozen_verifier` is installed from this head's resources for the editions each route supports (history: historical v1; predecessor: current writer and historical v1). The verifier decodes the custody bytes with `decode_storage_value` and re-derives dispatch, joins, identity, commitment and digest; the request never selects a recipe. Rows: **H05c** caller override, **H05b**/**O14** foreign binding, **H05**/**O12** unknown or absent recorded edition. `resolve_history` no longer takes a `decoder` argument. Modelling assumption, stated: the static model has one Server and no native owner-operation id, so a request names two fixed constants, while the sealed source adapter reports the Server and owner operation holding its authenticated original (FIX1, below); it records this head's schema bytes as each edition's frozen resources. | `:828-967` (`STATIC_SERVER_ID` `:859`, `original_binding` `:867`, `SourceOwner` `:888`, `dispatch_original` `:928`, `resolve_history` `:944`), `:1712`; tables `history:16-24`, `observation_recipe:16-20` | History checks `S10_older_original_*` (now with `None`, `caller_recipe`, `foreign_binding`, `foreign_server`, `foreign_owner_operation`) and `S10_original_custody_*`, witnesses H05/O14. |
| **N2 — Python-equality joins over numbers** | Kept: they compare values both already admitted by the integer-slot row and the physical codec, and the observation ordinal (O08) is computed only from an admitted integer. No change needed. | `:1734` (`expected_ordinal`) | Unchanged O08 witnesses. |
| **N2 — excluded two-row number witnesses** (fixed, `1084c90c18`) | The 144 O03 `0.0`/`1.0` owner-snapshot witnesses are now single-row S07 witnesses (N01 no longer reads boolean slots) and leave the exclusion list; S07 boolean-type witnesses add `0.0`/`1.0`. | `scripts/pm_runtime_artifact_guard_suites.py` (`EXCLUDED_PATTERNS`), `pm_runtime_artifact_round6_cases.py` | Guard tool O03/S07 suites. |
| **4,400-digit integer crash** (fixed, `4e0696376a`) | **Found at the part 2A head** (probe `long-integer-probe-2a.txt`): a schema-valid `sequence_id` ≥ 2^64 and a receipt offset past uint64 crashed with msgpack `OverflowError`; a 4,400-digit producer ordinal or restore revision crashed with Python's 4,300-digit `ValueError`; a 2^60 producer ordinal crashed append with rfc8785 `IntegerDomainError`; a 4,400-digit payload width was refused under the wrong row (D04 "oversized inline"). Now each refuses through a row (`long-integer-probe-2b.txt`): append `invalid` (I04 or A08), payload D04q, identity rendered exactly under a scoped, restored `int_max_str_digits(0)`. Joins and the append model turn a codec refusal into a refusal, never an escaping exception. | `:282` (`exact_digits`), `:567`, `:756` (`codec_refusal_is_false`), `:1005` | `N2_4400_digit_*` checks in every family; corpus runner 0 untracked. |
| **Shared corpus through the complete checker** (`4485e4583f`) | `scripts/pm-runtime-artifact-number-corpus.py` places every number of the shared corpus's number scope (45 values, 5 of them refused at parse) plus three 4,400-digit integers at the Storage sequence, the producer ordinal (the restore revision, with its identity rebound), the receipt byte offset and screenshot `width`, and runs fresh append plus exact retry; the expectation is composed from `current_integer` (owner bounds), `qualified_jcs` and `storage_value_bytes` alone. | `scripts/pm-runtime-artifact-number-corpus.py` | `pass` at the FIX1 head: 45 values (5 parse refusals), 2,320 route runs, 517 accepted / 1,803 refused, 0 disagreements, 0 untracked; byte-identical to the run before FIX1. |
| **Number self-test** | `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | — | Exit 0, `"status": "pass"`, 580/580 cases (276 positives, 304 negatives). Credited exactly as reported. |
| **Date-time self-test and inventory gate** | `python3 scripts/pm_event_datetime.py --self-test` (the brief's command) exits 0 but runs nothing: the module has no CLI (T200). The date-time suite, `python3 scripts/pm_event_numbers.py --self-test`, exits 1 with `NOT_RUN_ADMISSION_REFUSED`, because `python3 scripts/pm_event_datetime_inventory.py` fails on this tree: exit 1, `fail`, 341 failures (172 unclassified_mentioning_container, 121 unreadable_mentioning_container, 48 stale_scan_exclusion). The merge-head run had 340; ATS-260's edit (`2b68e18d66`) changed its fence and shard hashes and added one regenerated `plan_units` row. FIX1 changed none: same set as the run before it. Classification of the merge-head run is in `inventory-classification.json` (DR's own fixtures and owner-unit fences, main-age drift, regenerated derived files, the ignored currentness copy). Credited exactly as reported; no NUMRULE file edited (T199). | `selftest-all-final.stdout`, `inventory-final.stdout`, `inventory-classification.json` | — |
| **Fixture expectation changes** (`1084c90c18`) | No fixture JSON changed. Witness-pair expectations that the shared rule changes: 76 `N01/<family>/<form>_open_map` and 152 `N01/<family>/<form>_storage_form_{inline,packed}` pairs (forms `1.0`, `1e0`, `0.0`, `-0.0`) expected refusal (rows `N01_canonical_numbers`, `N01s_storage_numbers`) and are now **accepted**: an untyped value and a storage_form input have no integer slot, CV-1100 forbids a blanket walk, and their JCS/physical encodings are exact. They are now the 12 shared checks `numrule_float_*_accepted`. 144 O03 witnesses keep refusal with one row instead of two (above). | `scripts/pm-runtime-artifact-event-drafts.py:1768` | `numrule-flips.json`. |
| **ATS-260** (fixed, `2b68e18d66`) | The numeric paragraph now states the shared number, recipe and date-time rules and the corpus runner; `depends_on` and `source_lineage` cite CV-1100, CV-1101, SP-1100, SP-1101; validation surfaces add the corpus runner and the number self-test. | `Plans/Automated_Testing_System.md:7250` | Shards and index regenerated; only Automated_Testing_System outputs changed; shard check `pass`. |
| **Pinned environment** (`80e206f44e`) | `scripts/requirements-runtime-artifact-drafts.txt` now pins what the runs used: jsonschema 4.23.0, referencing 0.36.2, attrs 25.4.0, rfc8785 0.1.4, blake3 1.0.11, msgpack 1.1.2, markdown-it-py 3.0.0. | requirements file | — |
| **SP-1101 deferred items (step 4)** | None assigned to DR (DCH, DMEM, DS15, DFM, DF only). DR's own retained dispatch is the N2 item above. | — | — |

**Disputed:** none. **Stopped for Jared:** none. **IDs used:** zero new; ATS-260 changes in place.

## Fix round DR-P2B-FIX1: the S10a stop and its fix

**The stop (2026-11-11, before this fix, at `d947359b1b`).** Every check passed except one standing trial. `S10a_ignore_authenticated_binding` cuts `H05b_original_binding` (SP-1101: the authenticated original's binding equals the requested original). With that row cut, the complete checker still passed over the four standing families (`standing-checks.before-fix1.json`: 6 of 7 trials caught, `status: fail`). No negative in the checker corpus was refused by H05b alone. The guard tool proved H05b at its own table (`history`), so the gap was in complete-checker coverage only.

**Why.** `resolve_history` sends the requested original through the shared `RetainedDispatcher`. When the dispatch row is cut, it goes on to `full_value_matches(requested event, authenticated original, requested result, requested custody)`. That function compares the requested event and custody with the authenticated original byte for byte (`F02_candidate_bytes`, `F13_custody_bytes`). Seven of the nine binding fields (Storage instance, scope, Project, event type, event id, idempotency key, value commitment) live in those bytes. The other two, Server and original owner operation, were fixed constants on the request and the authenticated side alike. So every H05b negative also changed bytes that F02 compares. The existing `foreign_binding` negative (another event id) was refused later by `F02_candidate_bytes` once H05b was cut.

**The fix (`7788f9ba35`).** SP-1101 binds the selection to "the Storage instance, exact scope/Server/Project, event type and original event/idempotency identity, original owner operation and original value/source commitment" (`Plans/storage-plan.md:22489`). The Server and the owner operation are the binding facts that no stored byte carries. The sealed source adapter now reports the Server and owner operation that hold its authenticated original (`history_source_for`, `scripts/pm-runtime-artifact-event-drafts.py:1654`). `SourceOwner` builds the authenticated binding from them (`:888`). A request still names the static model's single Server and owner operation (`STATIC_SERVER_ID`, `:859`; `dispatch_original`, `:928`). An absent or empty adapter fact makes no binding, so the dispatcher refuses it as `original_binding` (`original_binding`, `:867`). No row, table module, fixture JSON, NUMRULE file or guard-tool file changed; the history table still reads only `dispatch_refusal`.

**New single-defect negatives.** Each starts from a valid retained original. The only change is the adapter's Server (`dr-other-server`) or owner operation (`dr-other-owner-operation`); the bytes equal the requested original. Each is refused first by `H05b_original_binding` with `unavailable`, and no earlier row refuses it. With H05b cut, the complete route accepts it.

| Family | H05b negatives | Where |
|---|---:|---|
| `cost_usage`, `tool_llm_trace` | 12 each | first original (2); historical originals `inline`, `packed`, `numeric_inline`, `numeric_packed` (2 each, 8); round-10 witnesses `S11_H05_foreign_server`, `S11_H05_foreign_owner_operation` (2) |
| the other 17 families, including `document`, `restore_point` and `screenshot` | 8 each | first original (2); historical originals `numeric_inline`, `numeric_packed` (4); round-10 witnesses (2) |

That is 160 H05b negatives over all 19 families: every family reaches H05b through `resolve_history`. The checker adds `S10_original_custody_foreign_{server,owner_operation}_refused` (`:1421`) and `S10_older_original_<route>_foreign_{server,owner_operation}_refused` (`:1450`). The witnesses are in `scripts/pm_runtime_artifact_round10_cases.py:173`. `restore_point` also gets two O14 negatives of the same kind for the observation predecessor (`predecessor_foreign_server`, `predecessor_foreign_owner_operation`, `:215`), refused first by `O14_predecessor_binding` and accepted with O14 cut. The full checker gains 202 assertions: 160 H05b negatives, 2 O14 negatives and 40 witness positives.

**Trial targets (`32a2a9dde5`).** Both SP-1101 trials now target every family. The provider-hash exclusion was written before `efbeecc654` gave `cost_usage` and `tool_llm_trace` their own H05b/H05c witnesses, so `S10a_ignore_authenticated_binding` and `S10a_caller_selects_retained_recipe` now need a caught negative in `cost_usage` too. **Standing-check memory gate (`b430830f44`).** The first rerun aborted after four trials when other work on the machine dropped available memory to 7 GB; the script's gate raised instead of pausing (`aborted-fix1/`). It now pauses below 10 GB and resumes at 11 GB. The trials are unchanged.

**Standing trials before and after** (7 trials over `cost_usage`, `document`, `restore_point`, `screenshot`; failing negatives per family):

| Trial | Before (`d947359b1b`, checker `2155d01e`) | After (`b430830f44`, checker `fb6b914b`) |
|---|---|---|
| `S11_remove_historical_decoder_selection` | caught (13 / 7 / 7 / 7) | caught (13 / 7 / 7 / 7) |
| `S12_remove_shared_datetime_check` | caught (105 / 102 / 106 / 102) | caught (105 / 102 / 106 / 102) |
| `S12_stock_format_checker_skips_date_time` | caught (36 / 33 / 37 / 33) | caught (36 / 33 / 37 / 33) |
| `S10_remove_integer_slot_rule` | caught (22 / 22 / 26 / 22) | caught (22 / 22 / 26 / 22) |
| `S10_remove_producer_jcs_qualification` | caught (1 / 1 / 1 / 1) | caught (1 / 1 / 1 / 1) |
| `S10a_caller_selects_retained_recipe` | caught (5 / 3 / 3 / 3) | caught (5 / 3 / 3 / 3), now targeting every family |
| `S10a_ignore_authenticated_binding` | **SURVIVED** (0 failures) | **caught (12 / 8 / 8 / 8)**: exactly the new `foreign_server` and `foreign_owner_operation` negatives |
| **Result** | 6/7, `status: fail` | **7/7, `status: pass`** |

Order in each cell: cost_usage / document / restore_point / screenshot.

**Reruns at the fix head.**
- **Full checker:** `pass`, 26,165 assertions, 0 failures (before: 25,963). The new assertions break down as +10 per family and +14 for cost_usage, tool_llm_trace and restore_point.
- **Corpus runner:** `pass`, byte-identical to the pre-fix result: 45 values (5 parse refusals), 2,320 route runs, 517 accepted / 1,803 refused, 0 disagreements, 0 untracked.
- **Number self-test:** exit 0, `"status": "pass"`, 580/580 cases (276 positives, 304 negatives), unchanged.
- **Guard tool:** all 19 families and `--family shared` rerun at checker `fb6b914b`: **785 suites, 3,042/3,042 row cells proved**, 0 failed suites, 0 unproved rows, 0 masked negatives, 0 lane-matrix problems, 0 open findings. Before the fix the counts were the same at checker `2155d01e`. The new witnesses reach their first refusal with the same observation as the existing H05b negative (`{"dispatch_refusal": "original_binding"}`), so the tool keeps them as aliases of that negative. The only differences are aliases +2 per family (+4 in restore_point, with O14) and complete-boundary flips accepted +2 per family (+4): from 7,474 to 7,514 accepted, with 1,742 refused later before and after. In every family's `history` suite the H05b negative now flips to accepted. The two refused-later flips there are the pre-existing `foreign_authenticated_binding` witness (another event id, refused later by `F02_candidate_bytes`) and the H05 decoder witness (refused later by `S06_validation_profile`, the fallback edition, which `S11_remove_historical_decoder_selection` pairs with its source cut). In restore_point's `observation_recipe` suite, accepted flips went from 0 to 2 (`tool-before-after.json`, `fix1-facts.json`).
- **Memory gates for the reruns.** Each heavy step started only at 13.5 GB available, one at a time. One exception, under the lead's stream E rule of 2026-11-11 23:22Z: a run whose own gate caps each step's RSS at 2 GB or less and pauses below 10 GB may start or resume at 11 GB. The first five guard-tool families (api_web_call, artifact_version, before_after_snapshot, browser_recording, code_diff) ran under the wrapper's 13.5 GB start, with the driver's default `--max-rss 4096`. The rest ran with `--max-rss 2048 --pause-when-low 10 --resume-at 11` and the wrapper's wait between families lowered to 11 GB. The job was idle in that wait when it was stopped and restarted, and the per-family markers kept the five finished families. Measured peak RSS per family is about 280 MiB. The cap is a gate only and does not change what the tool computes. Reason: about ten workers keep the VM at 10-11 GB available, so a 13.5 GB gate starves.

## Timestamp fields and the shared check covering each

| Field (owner schema) | Profile | Shared check |
|---|---|---|
| `occurred_at_utc` (`Plans/event_record.schema.json` `$defs/date_time_string`) | CV-1101 `event_record` (broad RFC 3339) | S08: `datetime_validator` registered checker, current and historical validators |
| `observed_at_utc`, `persisted_at_utc` (EventRecord) | CV-253 `storage_utc_z` | S08: inventory-selected Storage composition (node `Plans/event_record.schema.json` root, `storage_utc_z`), current and historical |
| `acknowledged_at_utc` (`event_append_receipt_contracts` `AppendReceipt`; also inside custody and result `first_append_receipt`) | CV-1101 broad (schema `format: date-time`) | S08 on RECEIPT, CUSTODY and RESULT validators |
| `first_prepared_at_utc`, `activated_at_utc`, `retired_at_utc`, `frontier.indexed_at_utc` (`event_record_index_checkpoint` generation/frontier) | CV-1101 broad (schema `format: date-time`) | S08 on the checkpoint validator |
| `created_at_utc`, `type_payload.retention.expires_at_utc` (`runtime_artifact_restore_point` `$defs/date_time`) | CV-1101 broad (schema `format: date-time`) | S08 on the restore-point payload validator |
| event_record_index row `persisted_at_utc` (checkpoint dataset) | CV-253 `storage_utc_z` (inventory node family 8) | Built from the event's S08-checked `persisted_at_utc` and compared byte for byte (C12) |
| Unformatted payload timestamp strings: `created_at_utc` in the other 18 payload schemas, `captured_at_utc`, `decided_at_utc`, hitl `expires_at_utc`, `started/ended/completed_at_utc`, `failed_at_utc`, `generated_at_utc`, WebOperationJob times, trace lifecycle times, browser `PageRepresentation.observed_at_utc` and cost_usage `authorityFields.observed/settled/adjusted_at_utc` | owner schema (`type: string`; the two `observed_at_utc` nodes are inventory `other_owner_observation`, `profile: owner_schema`) | No timestamp predicate, by CV-1101/NUMRULE ("unformatted source fields retain their original types"). Every payload `created_at_utc` equals the S08-checked `occurred_at_utc` through the D15 join on every decode route. |

Integration note (not decided here): SP-347's commit frame says `acknowledged_at_utc` is "RFC 3339 UTC with milliseconds"; the receipt schema says only `format: date-time`, and NUMRULE has no such profile. DR applies the receipt schema's owner profile and adds no local regex (CV-1101).

## Guard-table result

The gated tool `004bdedd63` (unchanged) ran **785 suites** (one per phase table per family, plus the shared-only phases): **3042/3042 row cells proved**, 0 failed suites, 5670 single-row negatives (sum over suites), lane matrix problems 0, masked negatives 0, open collection findings 0. 230 distinct rows in 63 tables. Unproved rows: 0. Credit is the tool's own `rows[].proved`.

All suites were rerun, not only the affected ones: the date-time and integer-slot rows sit in the schema phase every family reaches. They ran again at the FIX1 head, because the checker file changed (see the fix-round section for what moved: only aliases and complete-boundary flips in `history` and `observation_recipe`).

| Family | Suites | Row cells proved | Negatives | Failed suites | Rows without negative |
|---|---:|---:|---:|---|---|
| `runtime_artifact.api_web_call` | 40 | 156/156 | 292 | none | none |
| `runtime_artifact.artifact_version` | 40 | 156/156 | 292 | none | none |
| `runtime_artifact.before_after_snapshot` | 40 | 156/156 | 292 | none | none |
| `runtime_artifact.browser_recording` | 41 | 163/163 | 304 | none | none |
| `runtime_artifact.code_diff` | 40 | 156/156 | 292 | none | none |
| `runtime_artifact.context_snapshot` | 40 | 156/156 | 292 | none | none |
| `runtime_artifact.cost_usage` | 47 | 181/181 | 317 | none | none |
| `runtime_artifact.document` | 40 | 156/156 | 292 | none | none |
| `runtime_artifact.evidence` | 40 | 156/156 | 292 | none | none |
| `runtime_artifact.failed_attempts` | 40 | 156/156 | 292 | none | none |
| `runtime_artifact.hitl_approval` | 40 | 156/156 | 292 | none | none |
| `runtime_artifact.implementation_plan` | 40 | 156/156 | 292 | none | none |
| `runtime_artifact.reasoning_summary` | 40 | 156/156 | 292 | none | none |
| `runtime_artifact.restore_point` | 49 | 181/181 | 354 | none | none |
| `runtime_artifact.screenshot` | 40 | 156/156 | 292 | none | none |
| `runtime_artifact.subagent_lineage` | 40 | 156/156 | 292 | none | none |
| `runtime_artifact.suggested_next_steps` | 40 | 156/156 | 292 | none | none |
| `runtime_artifact.tool_llm_trace` | 46 | 175/175 | 312 | none | none |
| `runtime_artifact.validation_test` | 40 | 156/156 | 292 | none | none |
| `shared` | 2 | 2/2 | 3 | none | none |

Rows added or changed in part 2B, and where the tool proved them:

| Row | Phase | Families where proved |
|---|---|---|
| `S08_date_time` | `schema.case` | 19: all 19 |
| `N01_integer_slots` | `schema.case` | 19: all 19 |
| `I01a_revision_integer` | `codec_identity` | 1: restore_point |
| `I01b_revision_nonnegative` | `codec_identity` | 1: restore_point |
| `I02_finite_float` | `codec_value` | 19: all 19 |
| `I03_supported_type` | `codec_value` | 19: all 19 |
| `I04_integer_range` | `codec_value` | 19: all 19 |
| `I05_unicode_scalar` | `codec_value` | 19: all 19 |
| `J01s_storage_jcs` | `codec_storage` | 1: shared |
| `D04q_inline_jcs` | `decode_envelope` | 19: all 19 |
| `D04_inline_size` | `decode_envelope` | 19: all 19 |
| `V05q_inline_jcs` | `stored` | 19: all 19 |
| `V05_inline_size` | `stored` | 19: all 19 |
| `A08_producer_jcs` | `append_dedupe` | 19: all 19 |
| `A04_global_conflict` | `append_dedupe` | 19: all 19 |
| `A05_scoped_conflict` | `append_dedupe` | 19: all 19 |
| `F14_producer_jcs` | `full_value_ids_b` | 19: all 19 |
| `F09_semantic_digest` | `full_value_ids_b` | 19: all 19 |
| `H05c_no_caller_recipe` | `history` | 19: all 19 |
| `H05b_original_binding` | `history` | 19: all 19 |
| `H05_decoder` | `history` | 19: all 19 |
| `O12_recorded_recipe` | `observation_recipe` | 1: restore_point |
| `O14_predecessor_binding` | `observation_recipe` | 1: restore_point |

Witness pairs excluded from the table proof (kept in the full checker): 90 distinct pairs (part 2A: 234). The per-run sum is 180, because the `--family shared` run collects every family's witness pairs and lists the same pairs again. The 144 O03 0.0/1.0 witnesses left the list (they are single-row S07 witnesses now), so 234 - 144 = 90; the C04, H07, cost_usage refs and restore_point forged-receipt exclusions are unchanged, with the reasons in `scripts/pm_runtime_artifact_guard_suites.py`.

## What Astra keeps finding, probed for part 2B

(1) Identities, digests and commitments are recomputed with the shared helpers and compared by rows; forged copies stay the negatives. (2) Storage-assigned fields stay outside the producer digest; Storage timestamps take CV-253's strict profile. (3) Historical routes: the authenticated recorded edition selects the frozen verifier; current-writer rules (integer slots, provider overlay) never run on a historical original; older originals keep owner-valid offset/lowercase source times (`S08_history_*`), and a sealed Storage offset or invalid date never reads. (4) One field read two ways: integers are admitted by `current_integer` and encoded by the shared codec everywhere they are read; pack bodies parse integers exactly. (5) S01 and the preflight still walk every `$ref`; the date-time registry is closed. (6) Inline size is the qualified JCS length on decode and stored copies. (7) Every append, retry, history and observation path still runs the full-value phases; history first runs SP-1101 dispatch. (8) Masked negatives: see the guard-table result; the standing trial found one H05b gap in the complete checker, closed in FIX1 with binding-only negatives. (9) Oracle cells stay PARTIAL (inventory admission). (10, 10a) Numbers: shared rule, history keeps the recorded recipe (38 frozen integral-float originals still read and still refuse current writes). (11) Type rows unchanged. (12) Formats: the shared registered date-time checker replaces the skipped stock format.

## Part 2B items closed; remaining

- **Closed:** N2 (all four sub-items), S1, the excluded O03 number witnesses, the 4,400-digit crash.
- **Remaining (integration, not lane-fixable):** T199 inventory admission on lane trees; T200 the brief's no-op `pm_event_datetime.py --self-test` command.

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. Before is the part 2A self-grade at `78bc525d65`. After is this part 2B self-grade at the FIX1 code head `b430830f44`.

| Exact family | Before → after | Oracle cell |
|---|---|---|
| `runtime_artifact.api_web_call` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.artifact_version` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.before_after_snapshot` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.browser_recording` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.code_diff` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.context_snapshot` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.cost_usage` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.document` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.evidence` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.failed_attempts` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.hitl_approval` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.implementation_plan` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.reasoning_summary` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.restore_point` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.screenshot` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.subagent_lineage` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.suggested_next_steps` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.tool_llm_trace` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |
| `runtime_artifact.validation_test` | 10P / 1Q / 1A → 10P / 1Q / 1A | PARTIAL → PARTIAL; reason now only the refused inventory admission (N2 and S1 closed) |

190 PASS / 19 PARTIAL / 19 ABSENT / 0 CONFLICT → the same totals. Timestamps were one of the two reasons each oracle cell was PARTIAL; the shared check now covers every timestamp field (table above), and the shared number rules cover N2. The remaining reason is the shared inventory gate, which DR cannot clear on its own tree (T199). Every cited quote was re-verified at its line in this tree (regrade at `b430830f44`: of the 743 earlier quotes, 334 were at their line, 370 moved inside their own unit and 39 were re-pointed from removed number code to the shared-rule code making the same claim; 0 missing. 133 part 2B oracle quotes were added. All 876 quotes were re-checked at their lines, 0 off. The oracle findings and `static_verification.fix_round_dr_p2b_fix1` record the FIX1 stop, fix and standing results).

## Readiness

**NOT_READY_REVIEW_PENDING for all 19 families** (190 PASS / 19 PARTIAL / 19 ABSENT). Part 2B, including fix round DR-P2B-FIX1, is complete in the lane: the shared date-time and number rules are adopted, the full checker passes, the guard tool proves every row, and all 7 standing trials are caught. Two things remain, both outside the lane: the date-time inventory admission at batch-2 integration (T199; `datetime_validator` and the inventory gate run there), and the batch-2 Sol max and Astra max reviews. Membership ABSENT; native execution NOT_RUN.

## Commands and evidence

Heavy runs went one at a time. Each started at 13.5 GB available, except the guard-tool families after code_diff, which started at 11 GB under the lead's 23:22Z rule (fix-round section). PM7 work was not waited on or touched. Commits: `2d13c3718e` (merge), `4e0696376a`, `1084c90c18`, `4485e4583f`, `2b68e18d66`, `80e206f44e`, `931fbba625`, `28114fc7d8`, `efbeecc654`, `d947359b1b`, then FIX1 `7788f9ba35`, `32a2a9dde5`, `b430830f44`, then the report commit. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/sweep-p2b/` (SHA-256 of every file in `SHA256SUMS`).

| Command | Exit | Outcome |
|---|---:|---|
| `git merge --no-ff 58c2816ff33365384d4039553f5efdb5370930e6` | 1, then committed | 163 conflicts, all derived; regenerated; `2d13c3718e`; `merge-proof.json` |
| `python3 scripts/pm-shard-plans.py --generate`, `pm-plan-index.py generate`, `pm-shard-plans.py --check` (merge, then ATS-260) | 0 | `pass`, 3,104 shards; only NUMRULE's two documents, then only Automated_Testing_System outputs, changed. FIX1 edited no `Plans/*.md`. |
| `python3 scripts/pm-runtime-artifact-event-drafts.py` (full checker) before FIX1 | 0 | `pass`, 25,963 assertions, 0 failures (`full-checker.before-fix1.stdout`) |
| the same at the FIX1 head (checker `fb6b914b`) | 0 | **`pass`, 26,165 assertions, 0 failures**, 25 min 07 s, peak RSS 293 MB (`full-checker.stdout`) |
| `python3 scripts/pm-runtime-artifact-standing-checks.py --family <4 families> --case S11_remove_historical --case S12_ --case S10_remove_integer --case S10_remove_producer --case S10a_` before FIX1 | 1 | `fail`: 6/7 caught, `S10a_ignore_authenticated_binding` SURVIVED (`standing-checks.before-fix1.json`) |
| the same at the FIX1 head | 0 | **`pass`: 7/7 caught**, 66 min, peak RSS 430 MB (`standing-checks.json`); the first FIX1 attempt stopped on its own memory raise after four trials (`aborted-fix1/`) |
| `python3 scripts/pm-runtime-artifact-number-corpus.py` | 0 | `pass`: 45 values, 2,320 route runs, 0 disagreements, 0 untracked (`corpus.stdout`) |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `pass`, 580/580 (`selftest-numbers-final.stdout`) |
| `python3 scripts/pm_event_numbers.py --self-test` (scope all) | 1 | `NOT_RUN_ADMISSION_REFUSED`: the inventory gate refuses on this tree (T199) (`selftest-all-final.stdout`) |
| `python3 scripts/pm_event_datetime_inventory.py` | 1 | 341 failures, classified above (`inventory-final.stdout`) |
| `python3 scripts/pm_event_datetime.py --self-test` | 0 | runs nothing: no CLI (T200); not counted |
| `python3 scripts/pm-runtime-artifact-guard-tables.py --family <f> --out tool/<f>` ×19, then `--family shared` (tool `004bdedd63`, unchanged) | 0 ×20 | 785 suites `PASS`, 3,042/3,042 row cells proved (`tool/<family>/summary.json`, `tool-aggregate.json`, `tool-before-after.json`) |
| long-integer probes at the part 2A head and at part 2B | — | crashes at 2A, refusals through rows at 2B (`long-integer-probe-2a.txt`, `long-integer-probe-2b.txt`) |

---

# DR — Sweep part 2A (earlier report, unchanged): guard tables on the gated guard tool

Branch `plans/ea-w2-runtime-artifacts-20261104`; delivery head in the external sweep `HEAD.txt`. Part 2A start `5ea37cbd70`; gated tool merge `da7ef0f27d` (tool `004bdedd63`, eleven files, unchanged). No rebase onto main this round.

**All 19 families keep 10 PASS / 1 PARTIAL / 1 ABSENT.** Part 2A closes P1 (shared proof machinery and guard tables). `positive_negative_oracles` stays PARTIAL because N2 (shared number rule) and S1 (date-time formats) are part 2B. Membership stays ABSENT; native execution is NOT_RUN. Sol and Astra review the lane once, after part 2B.

## Sweep part 2A: findings and responses

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **Take the gated tool** | Merged `004bdedd63` with `--no-ff` as `da7ef0f27d`: exactly the eleven tool files, no conflict, none edited. | `scripts/pm_guard_isolation*.py`, `scripts/guard-isolation/README.md`, `Plans/guard_isolation_traps.json`, GUARDTOOL reports | `git diff --stat da7ef0f27d^1 da7ef0f27d` lists 11 files; `git diff da7ef0f27d HEAD -- scripts/pm_guard_isolation.py` is empty. |
| **P1 — guard tables** (fixed, `6aa7b1c0d3`, `11ba1a552f`) | Every product refusal of the checker is one named row in one of 63 phase tables (220 rows), reached only through `table_refusal`. Derivation computes observations (canonical-byte digests, routes, presence, recomputed identities) and decides nothing. Reused boundaries are phases of their callers. Or-chains are split into one row per predicate; chain equalities compare each copy with the authority. | `scripts/pm-runtime-artifact-event-drafts.py:59` (`TABLE_PHASES`), `:121` (`table_refusal`), `:144` (`table_order_errors`); `scripts/pm_runtime_artifact_table_*.py` | Full checker `pass`, 0 failures, including `shared:table_require_order` (each factory requires its rows in table order). |
| **P1 — retired machinery** (fixed, `6aa7b1c0d3`) | Removed the AST/mutation proof `scripts/pm-runtime-artifact-guard-isolation.py`. The standing-check witness now cuts named table rows in its trial module (`cut(...)`) instead of rewriting source text; its fixture and configuration trials are unchanged. | `scripts/pm-runtime-artifact-standing-checks.py:36` (`cut`) | See the standing-check run in the commands table. |
| **P1 — adapter and runner** (fixed, `2fc7429ff8`, `11ba1a552f`) | Suites are built from the existing causal witness pairs: valid invocations give controls, each single-defect invocation gives the observation of its first refusal, targeted at the refusing row. Pairs refused outside their label, untracked refusals and two-row witnesses are reported, never relabelled. | `scripts/pm_runtime_artifact_guard_suites.py`, `scripts/pm-runtime-artifact-guard-tables.py` | `python3 scripts/pm-runtime-artifact-guard-tables.py --family <f> --out <dir>` (one process per family). |
| **Two-defect negatives the tool/lane matrix reported** (fixed, `6aa7b1c0d3`) | `shipped_wrong_frontier` kept a stale token revision *and* frontier digest: it now keeps only the revision (C05e). The other two-row witnesses cannot be single-row by construction and are excluded from the proof with their reason (next section); their single-row equivalents prove each row. | `scripts/pm-runtime-artifact-event-drafts.py:1128` (`wrong_frontier` in `checkpoint_negative`), `scripts/pm_runtime_artifact_guard_suites.py:55`, `:66` (`EXCLUDED`, `EXCLUDED_PATTERNS`) | Lane matrix: 0 problems over all suites; tool: no masked negative. |
| **Missing negatives for unproved rows** (fixed, `6aa7b1c0d3`) | New round-9 witnesses for every row the earlier pairs never reached: application scope (D03a, V02a), missing pack (D07a), non-UTF-8 and non-JSON packs (D10u, D10j), missing provider source (B02a), unknown decoder (H05, non-provider families), node presence/state/uniqueness (C04x/b/c), live selection store (C04d), token key/generation/anchor/dataset (C03b, C05a/c/d/g/j), source digest and segment generation (C07c/e), manifest values and selection digests (C08g–p), anchor and coverage fields (C09a–n), segment count and fields (C10c, C11*), frame end and durable bound (C11g/h), cost_usage body copies. Each rebinds every observation that watches the changed fact. | `scripts/pm_runtime_artifact_round9_cases.py` | Every row of every suite has at least one negative (`rows_without_negative` empty in every summary). |
| **Rows dropped as already decided** (P1, `6aa7b1c0d3`) | Not repeated because an earlier row or the closed schema decides the same predicate on the same values: checkpoint schema-pointer target (C01b fixes the ref); read-token storage/key/selection/snapshot bytes (C03b, C03d, C04g, C04i) and field set (closed `read_token` schema); custody partition (F03 inside the preceding full-value call); `complete_to_captured_boundary` (schema const true); `empty_retained_source` (schema forces count 0, refused by C09h); segment `scan_start_offset` (schema const 0 plus C10b). Each is commented in place. No other refusal was removed. | `scripts/pm-runtime-artifact-event-drafts.py` `checkpoint_matches` comments | Reviewer check: each named schema clause in `Plans/event_record_index_checkpoint.schema.json`. |
| **ATS-260 legacy proof claim** (fixed, `70ba0ac826`) | The proof sentence and validation command name the guard tables and the shared tool; the number-rule sentence is unchanged (2B). | `Plans/Automated_Testing_System.md:7249`, `:7251`, `:7261` | Shards and index regenerated; only Automated_Testing_System outputs changed; shard check pass. |
| **N2 — shared number rule** | Part 2B (needs NUMRULE gates). | Listed below | — |
| **S1 — date-time format sweep** | Part 2B. Interim only (see below). | Listed below | — |

**Disputed:** none. **Stopped for Jared:** none. **IDs used:** zero new; ATS-260's text and validation command change in place (no new units).

## Guard-table result

The gated tool ran **803 suites** (one per phase table per family, plus the shared helper phases): **2888/2888 row cells proved**, 0 failed suites, 5517 distinct single-row negatives. 220 distinct rows in 63 tables. Lane matrix problems: 0. Open collection findings: 0. Excluded witness pairs (kept in the full checker, listed below): 234. Credit is the tool's own `rows[].proved`.

Each cut swaps one table row to always-pass; the tool then runs every control and negative, checks the guard-call trace against the uncut baseline and runs a fresh restoration. "Own" negatives must be accepted after the cut ("flips"); every other negative must keep its exact refusal ("stays").

| Checker | Tables | Rows | Row cells proved | Unproved (reason) | Cut: own flips / own | Cut: stays | Unrelated changes | Masked |
|---|---:|---:|---:|---|---:|---:|---:|---:|
| Exact validator (every schema occurrence) | 2 | 5 | 78/78 | none | 79/79 | 231 | 0 | 0 |
| Codec, identity, profile, oracle, references | 6 | 8 | 98/98 | none | 100/100 | 42 | 0 | 0 |
| decode | 9 | 30 | 501/501 | none | 881/881 | 3692 | 0 | 0 |
| stored_event_valid | 1 | 6 | 114/114 | none | 114/114 | 570 | 0 | 0 |
| inspect | 3 | 8 | 152/152 | none | 1084/1084 | 4375 | 0 | 0 |
| full_value_matches | 3 | 14 | 266/266 | none | 384/384 | 1380 | 0 | 0 |
| resolve_history | 1 | 1 | 19/19 | none | 19/19 | 0 | 0 | 0 |
| AppendModel.append | 4 | 7 | 133/133 | none | 722/722 | 1292 | 0 | 0 |
| policies_match | 1 | 3 | 57/57 | none | 57/57 | 114 | 0 | 0 |
| checkpoint_matches | 17 | 74 | 1406/1406 | none | 1976/1976 | 7144 | 0 | 0 |
| observation_admissible (restore_point) | 8 | 21 | 21/21 | none | 52/52 | 116 | 0 | 0 |
| Source agreement (browser_recording, cost_usage, tool_llm_trace) | 8 | 43 | 43/43 | none | 49/49 | 226 | 0 | 0 |

Per family (all phase suites that family reaches; shared toy-schema, codec and oracle witnesses ride with each family):

| Family | Suites | Row cells proved | Distinct negatives | Failed suites |
|---|---:|---:|---:|---|
| `runtime_artifact.api_web_call` | 41 | 148/148 | 284 | none |
| `runtime_artifact.artifact_version` | 41 | 148/148 | 284 | none |
| `runtime_artifact.before_after_snapshot` | 41 | 148/148 | 284 | none |
| `runtime_artifact.browser_recording` | 42 | 155/155 | 296 | none |
| `runtime_artifact.code_diff` | 41 | 148/148 | 284 | none |
| `runtime_artifact.context_snapshot` | 41 | 148/148 | 284 | none |
| `runtime_artifact.cost_usage` | 48 | 173/173 | 309 | none |
| `runtime_artifact.document` | 41 | 148/148 | 284 | none |
| `runtime_artifact.evidence` | 41 | 148/148 | 284 | none |
| `runtime_artifact.failed_attempts` | 41 | 148/148 | 284 | none |
| `runtime_artifact.hitl_approval` | 41 | 148/148 | 284 | none |
| `runtime_artifact.implementation_plan` | 41 | 148/148 | 284 | none |
| `runtime_artifact.reasoning_summary` | 41 | 148/148 | 284 | none |
| `runtime_artifact.restore_point` | 50 | 172/172 | 347 | none |
| `runtime_artifact.screenshot` | 41 | 148/148 | 284 | none |
| `runtime_artifact.subagent_lineage` | 41 | 148/148 | 284 | none |
| `runtime_artifact.suggested_next_steps` | 41 | 148/148 | 284 | none |
| `runtime_artifact.tool_llm_trace` | 47 | 167/167 | 304 | none |
| `runtime_artifact.validation_test` | 41 | 148/148 | 284 | none |
| `shared` | 1 | 1/1 | 1 | none |

Every row of every table and its per-family cut result is in `aggregate.json` and the per-suite tool reports under the evidence directory (`tool/<family>/<phase>__<family>.json.gz`).

**Witnesses excluded from the table proof (kept as refused negatives in the full checker).** O03 owner-snapshot `0.0`/`1.0` booleans (144): a float where a boolean is required violates both the type row (S07) and the number row (N01); the integer, string, null and container variants prove S07 alone. C04 live-selection type variants (57): a change to the live selection contradicts both its frontier copy (C04f) and its token copy (C04g); `wrong_frontier_store` and `wrong_token_source_store` prove each row alone. H07 `deleted_body_refs` (19): a deleted body yields `metadata_only`, a reader result, not a refusal. cost_usage `refs_usage_{event_ref,record_id}` (10): `refs.<field>` is compared with both the root and the body copy; `root_<field>` and `body_<field>` prove each row. restore_point `numeric_*_forged_first_receipt` (4): a forged predecessor receipt is carried by both supplied copies, so F12 and F13 refuse together; `original_result`, `original_custody` and `receipt_copy` prove each row.

**Phase boundary.** Tables are extracted observation boundaries (tool boundary `synthetic`). The complete path is the full checker, which reaches every refusal through the same rows. As lane evidence beyond the tool, each negative was re-run through its whole witness with only its refusing row cut: of 7,639 witness pairs, 6,217 are accepted. The rest are refused later by a distinct invariant or by derivation that relied on the cut row: owner-snapshot type variants also fail the encoded snapshot join O03b (688); wrong-type CURRENT/manifest counters also differ in value (C08g–j, 513); a cut row guarded derivation (D05, D07a, V07, C04x: 80); an undecodable pack body leaves no payload for the schema rows (S07, 38); the anchor copy shares the live-store fact (C09a, 38); an unknown decoder is also an unknown profile (S06, 23); an application envelope also fails the Project join (D13, 19); projector_replay_only is also not dedupe_by_idempotency_key (A03b, 19); a forged predecessor event also changes its commitment (F08a, 4). None of these reaches a row of its own phase, so each stays a single-row negative for the tool.

**Shared tool limits met.** Cost grows steeply with rows per table (a 10-row prototype ran 341 evaluations in 33 s; 20 rows, 1,281 in 549 s), so phases hold at most seven rows and read only their declared `FIELDS`. Each table module is prescanned from its text before use. No `NonGuard` other than the `return g.Case(table, check, context)` plumbing return was needed.

**What Astra keeps finding, probed for part 2A.** (1) identities and digests are still recomputed from source in derivation and compared by rows (F08a, F09, C05a, C05d, C05f, C14, D17); forged copies are the negatives. (2) Storage-assigned fields stay outside the semantic digest; receipt sequence bytes are compared (F06). (3) Historical routes keep their recorded recipe: the overlay, provider digest and number rows apply only to the current-writer profile; all S10 history checks pass. (4) Byte-level joins use SHA-256 of canonical bytes for both sides; scalar joins keep their original operator. (5) S01 and the preflight still walk every `$ref`. (6) Inline size is checked on decode and stored copies (D04, V05). (7) Every append, retry, history and observation path still runs the full-value phases. (8) Masked negatives: tool `masked` is empty on every row; the complete-boundary re-run above is reported. (9) Oracle cells stay PARTIAL. (10, 10a, 12) are part 2B. (11) Type rows are separate rows (`is not True/False`, exact `int`, exact `bytes`), with wrong-type negatives.

**Timestamp fields — interim only.** This is my own interim review of the timestamp fields (pm7-build, 2026-11-05 16:50Z), not a certification. In the pinned environment `FormatChecker()` has no `date-time` checker (`not-a-date` conforms), so `date-time` formats in EventRecord, receipt, checkpoint and runtime-artifact schemas are not enforced; `uuid` is. Part 2A adds no date-time rule and changes no timestamp field.

## Part 2B items

- **N2 — shared number rule (CV-1100/1101, SP-1100/1101, shared helper).** `scripts/pm-runtime-artifact-event-drafts.py:276` `canonical_numbers` (the N01 observation), `:421` (`number_errors` in `TableValidator.refusal`), `:532` `value_bytes` / `:538` `packed_value` (canonical MessagePack codec), `:569` `storage_form` (N01s), `scripts/pm_runtime_artifact_table_schema.py` `N01_canonical_numbers`, `scripts/pm_runtime_artifact_table_codec_storage.py` `N01s_storage_numbers`; witnesses `scripts/pm_runtime_artifact_round6_cases.py:128-153` and `scripts/pm_runtime_artifact_round8_cases.py:107`; `Plans/Automated_Testing_System.md:7250` (ATS-260 numeric paragraph).
- **N2 — authenticated historical recipe selection.** `scripts/pm-runtime-artifact-event-drafts.py:753` `resolve_history` (`validation=decoder`, `:763-765`) and `:1395-1403` (`recorded_decoder` in `observation_admissible`); adopt the shared write-time recipe selection.
- **N2 — Python-equality value joins over numbers.** `scripts/pm-runtime-artifact-event-drafts.py:1417` (`expected_ordinal`, O08) and the checkpoint scalar joins (C07e, C08g–j, C09c–n, C11*) keep their original `!=`; the shared rule decides spelling and range.
- **N2 — excluded two-row number witnesses.** The 144 O03 `0.0`/`1.0` owner-snapshot witnesses (type and number rows together).
- **S1 — date-time formats.** `scripts/pm-runtime-artifact-event-drafts.py:403` (`FormatChecker()` without a date-time checker), `scripts/requirements-runtime-artifact-drafts.txt` (no RFC 3339 validator), every `format: date-time` field of `Plans/event_record.schema.json`, `Plans/event_append_receipt_contracts.schema.json`, `Plans/event_record_index_checkpoint.schema.json` and the nineteen `Plans/runtime_artifact_*.schema.json`. Interim review only.

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. Before is the part-1 self-grade (cycle-8 reviewer grade carried). After is this part 2A self-grade at the delivery head.

| Exact family | Before → after |
|---|---|
| `runtime_artifact.api_web_call` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.artifact_version` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.before_after_snapshot` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.browser_recording` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.code_diff` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.context_snapshot` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.cost_usage` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.document` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.evidence` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.failed_attempts` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.hitl_approval` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.implementation_plan` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.reasoning_summary` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.restore_point` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.screenshot` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.subagent_lineage` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.suggested_next_steps` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.tool_llm_trace` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.validation_test` | 10P / 1Q / 1A → 10P / 1Q / 1A |

190 PASS / 19 PARTIAL / 19 ABSENT / 0 CONFLICT → the same totals. No owner unit other than ATS-260 changed; every cited quote was re-verified at its line in this tree.

## Commands and evidence

Heavy checkers (full checker, guard-tool runs, standing-check trials) ran one at a time with at least 10 GB available (the tool MemoryGate paused below 10; the per-family loop waited below 11); the read-only aggregation of the tool reports overlapped the flip count and the index validate. PM7 work was not waited on or touched. Commits: `da7ef0f27d` (tool merge), `6aa7b1c0d3`, `2fc7429ff8`, `70ba0ac826`, `11ba1a552f`, `9c23caed78`, `2aecbc6bd8`, `80f440e078` (row-spec generator; checker unchanged), then the report commit. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/sweep-p2a/` (SHA-256 of every file in `MANIFEST.json`).

| Command | Exit | Outcome |
|---|---:|---|
| `git merge --no-ff 004bdedd63` | 0 | clean; 11 tool files |
| `python3 scripts/pm-runtime-artifact-event-drafts.py` (full checker, implementation `2aecbc6bd8`) | 0 | `pass`, 22,375 assertions (was 20,564), 0 failures, 4 min 01 s, peak RSS 296 MB (`full-checker.stdout`) |
| `python3 scripts/pm-runtime-artifact-guard-tables.py --family <f> --out tool/<f>` ×19, then `--family shared` | 0 ×20 | 803 suites `PASS`; `tool/<family>/summary.json`, `tool/aggregate.json` |
| complete-boundary flip count (`flips.json`, lane evidence) | 0 | 7,639 pairs: 6,217 accepted, 1,422 refused later (reasons above) |
| `python3 scripts/pm-runtime-artifact-standing-checks.py --case ...` (13 trials) | 0 | `pass`: all 13 caught. These are every trial whose mechanism the port changed (12 row cuts, 1 source-text change); each runs the complete checker over all nineteen families. The 33 fixture/configuration trials were not re-run in part 2A (`standing-checks.json`). |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | `pass`; only `Plans/_shards/automated_testing_system/` changed |
| `python3 scripts/pm-plan-index.py generate` (15 currentness files hash-verified first) | 0 | `pass`; only Automated_Testing_System units changed |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `pass`, 3,104 shards |
| `python3 scripts/pm-plan-index.py validate` (origin/main `5cbb92a5aa`) | 1 | top-level `fail`, 30 failures: 21 `plan_unit_removal_ledger_invalid` in existing ledgers (carried from part 1) and 9 `plan_unit_removed_without_ledger_decision` for DL-333, DL-335..340, DL-349 and UCC-230, which main added after this branch's base `d5ec2f70c0`; none names a DR file. Integration rebase owns them. |

---

# DR — Sweep part 1 (earlier report, unchanged): quota and checkpoint negatives

Branch `plans/ea-w2-runtime-artifacts-20261104`; implementation `bcf623e86b82f28f12ccc530049c6e1dd6d99c27`. Reviewed head `8db97f0f445691d974755e5a3636f5a6000d3774`; rebased first onto main `d5ec2f70c0d69c469796eea9b9cfdae30f281f42`. Delivery head is recorded in the external sweep `HEAD.txt`.

**C8-B1 and C8-B2 are fixed locally. All nineteen families remain NOT_READY pending part 2.** This report supersedes the round-8 claim of 19/19 prepared: the cycle-8 review graded 0/19 ready, and sweep part 1 does not upgrade that verdict. Membership stays ABSENT; native execution is NOT_RUN.

## Sweep part 1: findings and responses

| Item | Disposition and exact change | Verification |
|---|---|---|
| **Deck-2 assignments** | None assigned to DR in this task; no decision applied or extended. Main's DL-400..452 stay intact. | `rebase-audit.json`; no Decision Log diff. |
| **C8-B1** | **Fixed (`bcf623e86b82f28f12ccc530049c6e1dd6d99c27`).** Where: `scripts/pm_runtime_artifact_round6_cases.py:227`, RAP-117/CV-537's already implemented quota rule at `scripts/pm-runtime-artifact-event-drafts.py:241`. Why: all old controls left quota sources absent/null. Fix: quota-present valid parents for each independent source, with only `flags.quota_observed` changed to false or null. | 20 pairs: schema plus inline/packed decode and fresh append. Every parent passes, every negative refuses. Removing only the quota predicate makes all 20 authored negative expectations fail, across all nineteen full family invocations. |
| **C8-B2** | **Fixed (`bcf623e86b82f28f12ccc530049c6e1dd6d99c27`).** Where: `scripts/pm_runtime_artifact_guard_cases.py:186`, `:196`, `:207`; existing `checkpoint_matches` predicates at lines 607 and 656. Why: neither leaf predicate had an authored negative. Fix: every family's own valid checkpoint now supplies a wrong selected-node generation copy and a count of 2 against its verified one-event source. | 38 pairs, two per exact family. The count case recomputes only the non-target token anchor digest; the generation case keeps its correct independent map key/token/dataset. Each predicate removed alone makes exactly its nineteen authored negative expectations fail; every other expectation stays satisfied. |
| **N1 integration** | Rebased onto current main before fixture work; DL-302 and PLS-025 are present. Regenerated shards and index with all fifteen hash-verified currentness files. No unrelated ledger or governance repair. | Original index validator: exit 1, top-level `fail`, 22 failures: `{'plan_unit_removal_ledger_invalid': 21, 'plan_unit_removed_without_ledger_decision': 1}`. Raw failures remain in `index-validate.stdout`. During verification origin/main advanced to `2989975e8f8a4a1e49235e8ae2095b3df7ea0321`; DL-336 is a later-main branch-age finding, with no Decision Log lane diff. Retain it at the next integration rebase (`main-advance.json`). |

**Disputed:** none. **Stopped for Jared:** none. **IDs used:** zero new; existing RAP-100..118 / SP-520..538 / CV-520..538 / ATS-260 remain the 58 lane units.

## Negative handoff for part-2 guard tables

The labels B01/C04/C09 below are inherited diagnostic row labels, not duplicate sets. The part-1 verification cuts the exact named predicate alone, keeping every peer clause and schema rule. The complete 58-name inventory is `reports/event-authority-20261104/DR.sweep-p1-guards.json`.

| Actual guard | Authored negatives | Own cut flips | Other new negatives stay refused |
|---|---|---:|---:|
| `trace_quota_observed` — quota source implies flag true | B01: `quota_quota_artifact_ref_{false,null}_{schema,inline_decode,inline_append,packed_decode,packed_append}`; identical five-route list for `quota_quota_refs_{false,null}`. Trace only. | 20/20 | 38/38 |
| `checkpoint_node_generation_copy` — selected node copy equals root generation key | C04: `node_generation_copy`, separately for every one of the nineteen exact families. | 19/19 | 39/39 |
| `checkpoint_anchor_retained_event_count` — anchor count equals verified one-event source count | C09: `anchor_retained_event_count`, separately for every one of the nineteen exact families. | 19/19 | 39/39 |

The focused audit reads the actual witness closures. Quota logical payloads differ at exactly one field; structural schema accepts both, and each pack's digest/size/reference matches its actual bytes. Generation bundles differ at exactly the node copy. Count bundles differ only at the semantic count and its recomputed observing token digest; the source, frontier coverage and dataset remain the valid one-event truth. Row, event and original receipt/custody are unchanged on both checkpoint routes. All 58 valid controls accept after each of the three individual cuts. No product guard, schema, expected answer, source truth or historical original is weakened on the branch.

The full checker executes **20,564 distinct assertions** across nineteen sequential family invocations, with the identical shared assertions counted once. The pre-fix count was 20,448; the 58 added pairs contribute 116 assertions. The complete existing pair inventory grows 6,910 → **6,968**. Each deletion run evaluates that same whole lane: exactly the 20/19/19 relevant negative expectations fail, and no unrelated expectation fails. Immutable file reads alone are reused and fingerprint-verified; schema, codec, acceptance and checker outcomes are executed without result caches. This is targeted causal evidence for three review predicates, not certification of the legacy 96-row proof inventory.

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. Before is the cycle-8 reviewer grade. Every family's checkpoint witnesses execute against its own original event/receipt/custody/source/checkpoint. `positive_negative_oracles` remains PARTIAL for P1/N2 and carried S1; membership remains ABSENT. Native NOT_RUN does not by itself lower a grade.

| Exact family | Before → after |
|---|---|
| `runtime_artifact.api_web_call` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.artifact_version` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.before_after_snapshot` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.browser_recording` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.code_diff` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.context_snapshot` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.cost_usage` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.document` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.evidence` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.failed_attempts` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.hitl_approval` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.implementation_plan` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.reasoning_summary` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.restore_point` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.screenshot` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.subagent_lineage` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.suggested_next_steps` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.tool_llm_trace` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.validation_test` | 10P / 1Q / 1A → 10P / 1Q / 1A |

**190 PASS / 19 PARTIAL / 19 ABSENT / 0 CONFLICT → the same totals.** The 743 exact current citations are checked inside their named owner units/functions, with line references refreshed after rebase. Fifty-seven lane owner units remain byte-identical to the reviewed head; ATS-260 adds only explicit part-1 fixture coverage and the part-2 qualification.

## Part 2 items

- **N2 — shared number/recipe adoption.** `scripts/pm-runtime-artifact-event-drafts.py:159` (`canonical_numbers`), `:296` (`validator`), semantic/physical codecs and authenticated historical profile selection; `Plans/Automated_Testing_System.md:7250` ATS-260's numeric paragraph. Adopt CV-1100/SP-1100/SP-1101 and the shared helper after NUMRULE passes. No new local number helper, cap, serializer, physical-float normalization or signed-zero erasure was added. The count-2 fixture is a plain valid integer and isolates an ordinary semantic contradiction.
- **P1 — shared proof machinery and guard tables.** `scripts/pm-runtime-artifact-guard-isolation.py`, especially D01:134 / D12:145 / C03:193 / C04:196 / O03:212 / O12:223 and forwarded aliases, plus ATS-260's legacy proof claim. Adopt the reviewed `scripts/pm_guard_isolation.py`, expose actual named predicates in tables, and prove each duplicated same-field/same-predicate site alone, then all sites together. Compound rules/refusal codes do not define duplicate sets. Use the exact per-guard negatives above. No local proof tool was rebuilt or guard-table restructure attempted in this part.
- **S1 — carried, outside the assigned C8-B1/C8-B2 work.** `validator:296`, `scripts/requirements-runtime-artifact-drafts.txt`, and EventRecord/receipt/checkpoint/runtime-artifact date-time schema fields. Cycle 8's pinned isolated environment silently skipped date-time validation. The existing UTC Z grammar and historical-recipe preservation still need their previously requested format sweep. This item remains open; no READY claim hides it.

The shared tools and the later Sol/Astra review remain required. The original full legacy guard-removal, numeric/type and format campaigns were not rerun or re-certified here. The inherited `DR.guard-removal.json` describes earlier diagnostic evidence and is not the current part-1 guard handoff.

## Commands and evidence

DR heavyweight commands run one at a time, proceeding at 6 GB available or higher. Running commands pause below 6 GB and resume at 7 GB. The initial wrapper incorrectly waited for unrelated VM jobs; it was cancelled before its queued command started, then corrected after the user clarified per-lane serialization. Other workers are not waited on. Command JSON records preserve argv, exits, duration and memory samples. Initial disk availability was 129 GB. Shard regeneration changes only the four DR owner directories; index outputs are regenerated normally. No Spec Lock, governance evidence, auto-decisions, registry/admission, frozen validator, test file, mailbox, subagent, landing lock or main push was used.

| Command/evidence name | Exit | Outcome |
|---|---:|---|
| `shard-generate` | 0 | pass; 0 failures |
| `index-generate` | 0 | pass; 0 failures |
| `focused` | 0 | pass; 58 new pairs |
| `baseline` | 0 | pass; 20564 assertions |
| `trace_quota_observed` | 1 | fail; 20564 assertions |
| `checkpoint_node_generation_copy` | 1 | fail; 20564 assertions |
| `checkpoint_anchor_retained_event_count` | 1 | fail; 20564 assertions |
| `runtime-schemas` | 0 | pass; 0 failures |
| `shard-check` | 0 | pass; 0 failures |
| `index-validate` | 1 | fail; 22 failures |

Mutation exits 1 are the required caught defects; the baseline exits 0. `index-validate` is parsed at its top-level status and is never relabelled a pass. The currentness copy and rebase audit are read-only companions to the recorded checks. Two retained execution-driver editions differ only by per-family progress logging; `execution-driver-editions.json` identifies the edition for every run.

All evidence below is under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/sweep-p1/`.

| Evidence file | SHA-256 |
|---|---|
| `focused.stdout` | `b3160671efbe51847074f188c54712894b34e5a6603b4a8a4e5b727ace94e197` |
| `baseline.stdout` | `f1e4a98a63d0fed34e7d6f5dc21aaa611d34c642561f8d4ae85e54c031a7aa46` |
| `trace_quota_observed.stdout` | `e72134830f1c56f55482e7caeff44b968e912cabd8d1cd7146f1625c8bf4f97e` |
| `checkpoint_node_generation_copy.stdout` | `c332e4dae38292ed68867beb4191430a2f940d8b457b4547f00f8fc89e1f84b3` |
| `checkpoint_anchor_retained_event_count.stdout` | `ace8f2afef9eebc351d05286ed75dba13af3a070bae7aebb643d1689f50c0a5b` |
| `index-validate.stdout` | `9e6500ef5a4ccd3b75a281ef38da39ee501308801745e288484060c5052eaa23` |
| `grade-citations.json` | `94b4d0a35f1fd6d1cdcb267262760d7db2a5ccc2dd7f7be2b9705a5a701ec9a7` |
| `rebase-audit.json` | `8c2507700410a3cc2f740b19f575813ff01a94b266441cb4299f4296e28114d5` |
| `currentness-copy.json` | `9786e95661f33a7839e40e4e8e5bc936e47aa812142f30724b22ab29ddccb1ab` |
| `main-advance.json` | `13e671cc9589c36f5886aa925b4bff00f400f0c5b58f9e455642aac540dc1789` |

The report, self-grade, negative handoff, command outputs and final HEAD are copied there. The detached sparse worktree and task scratch/venv are removed after the lane branch is pushed; external `cleanup.json` records completion. No other worker's process or file is removed.
