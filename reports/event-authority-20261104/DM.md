# DM — sweep parts 1, 2A and 2B numbers

Branch: `plans/ea-w2-small-owners-20261104`. Part-1 input: `7ef0eb9aad39c177750e10dcff5dc2b5d63353b8`, part-1 head `3edd05fee6d62cd285bd19f931a9688f25a75495`. Sweep 2A/2B-numbers base: that head plus tool merge `fd8dc29d5d` and NUMRULE number merge `3e70a4c92f`. **Part 2A guard tables and part 2B numbers pass; the lane remains NOT_READY pending part 2B timestamps (CV-1101) and its Sol/Astra review.** The prior Astra NOT_READY is not superseded by a self-grade. Native execution: **NOT_RUN**. Timestamp review in this pass is **interim only**.

Read SWEEP-P1.md, FIX-ROUND.md (including its correction), BRIEF-DRAFT.md, WAVE2.md, CARDS2-APPLY.md, Astra 4 and Sol cycle 9 in full. No deck-2 item is assigned to DM in this task or the application table. DL-420/1.f belongs to CA-RET2; no retention choice is extended here. Landed DL-408 at `Plans/Decision_Log.md:4598` still says: “Every Settings change, including the DRY guard, the memory switch and theme changes, is recorded only as `settings.layer.changed`.” This is the approved option's wording. Both retired Settings names and the disabled DRY guard remain governed by that entry.

## Sweep part 1: findings and responses

- **Astra-4 B1 — FIXED, `30310ba26833255573ad884ec256ef7e4a1277e3`. Where:** `scripts/pm-small-owner-events.py:541` (canonical closure predicate at 546), its full-checker assertions at 1064, and all eight `retry_extra_field_cases` blocks below. **Cause:** semantic retry selected named producer fields and validated only the stored envelope, so extra incoming keys disappeared from the comparison. **Fix:** derive allowed keys directly from canonical `Plans/event_record.schema.json` properties and refuse any incoming extension before original receipt resolution. Every family adds independent `unexpected`, `payload_schema_version` and `scope_partition` negatives. Each keeps all existing incoming facts, authentic original/result/receipt and digest unchanged; the canonical schema reports exactly one root `additionalProperties` error. The writer and retry both refuse. **Verify:** each complete family command below; `retry-closure-regressions.py` reproduces the 24 bypasses with the original input checker and verifies all 24 refuse here, alongside 88 preserved controls and 16 prior marker negatives.
- **Astra-4 N1 / Sol-9 N2 — FIXED, `aa535b3d56e47630ce983128db32599331e63f00`. Where:** `Plans/.plan_index/node_readiness_report.json` and the other generated indexes/shards. **Cause:** the old branch carried currentness/index drift. **Fix:** rebase onto the recorded current main, copy all 15 ignored currentness inputs with matching SHA-256, regenerate shards and then the index. Normal index validation exits 0 with top-level `pass`; shard body/path verification exits 0, `pass`. All changed shard manifests name owner docs changed by this branch. No hand merge of derived files or governance reseal was used. **Verify:** `index-validate.log`, `shard-check.log`, `currentness-copy.json`, `derived-owner-scope.json` and `DM-sweep-p1-checks.json`.
- **Sol-9 N1 — prior fix VERIFIED; live pins refreshed in this report/grade commit. Where:** `reports/event-authority-20261104/DM-self-grade.json`, own `PJCT-073` and `PP-152` citations. **Cause:** old repeated quotes could point to a sibling unit; rebase also moved current source lines/hashes. **Fix:** preserve `7ef0eb9aad`'s correct owner selection and resolve every live citation inside its declared PlanUnit or Python function. All **332** quotes/hashes verify; **132** old pins plus **16** new closure references are refreshed. No quote needed a changed owner meaning. **Verify:** `citation-refresh.json`; `refresh-grade.py` describes the bounded lookup, and the final read-only citation audit verifies its output.
- **Astra-4 N2 — qualification RETAINED. Where:** `Plans/.plan_index/coverage_report.json`, `dependencies.json`, `doc_cards.json`, `node_readiness_report.json`. Their generator clocks may change; readiness and other index content also legitimately changed during this rebase/regeneration. No literal whole-index byte-identity claim is made.
- **Astra-4 N3 / Sol-9 N3 — existing prerequisites RETAINED. Where:** Storage profile validation, the six pending family retention cells and later admissions/governance. The profile checker exits 1 with the same **41** missing-profile errors and exact output SHA-256 `89d47858adcab797033a9feca549351641cfb6a2f6ee5da75a2c62082b3d450b`. DL-408 itself is now landed on the rebase base. Six RT assignments, per-family admissions and designated governance/native work remain separate. No registry/profile is appended.
- **Other fixture defects — none open in the latest named reviews.** Prior Astra-3 B2 context pairs remain `integration_regression`, `check_11_credit=false`, with both distinct predicates named. All existing fixture facts are unchanged after removing only the new `retry_extra_field_cases` lists. Both ledger files preserve every current-main non-Settings row byte for byte, while both Settings row/ledger/census sets agree. Current owner quote text survives the rebase. The old Settings application record is historical at `7ef0eb9aad`: its whole-file hashes are preserved, not restamped to current main.

## Family grades before and after

P = PASS, p = PARTIAL, A = ABSENT. Before is Astra 4's independent regrade; after is this part-1 self-grade. Only the eight oracle cells improve PARTIAL → PASS for repaired B1. These are lane-local contract-cell grades, **not readiness**. Every family retains `NOT_READY_PENDING_PART_2`.

| Family | Before | After | Complete-suite assertions | Fixture line |
|---|---|---|---:|---:|
| `format.applied` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 6,792 | 10156 |
| `lsp.server.lifecycle_changed` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 6,846 | 20434 |
| `model.catalog_refreshed` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 7,008 | 33077 |
| `subagent.context_rehydrated` | 10 P / 1 p / 1 A | 11 P / 1 A | 7,217 | 45872 |
| `subagent.context_shrunk` | 10 P / 1 p / 1 A | 11 P / 1 A | 7,242 | 58693 |
| `project.added` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 6,746 | 68779 |
| `project.created` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 6,750 | 78876 |
| `git.clone.completed` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 6,819 | 89137 |

Candidate totals: **74 PASS / 14 PARTIAL / 8 ABSENT → 82 PASS / 6 PARTIAL / 8 ABSENT**. Both context families retain their explicit RP-RUNTIME-365D binding; the other six retain their pending RT cells. Both `settings.updated` and `settings.theme.updated` remain **EXCLUDED_CONFIRMED**, each 2 PASS / 1 ABSENT / 9 N/A. Including exclusions: **78 PASS / 14 PARTIAL / 10 ABSENT / 18 N/A → 86 PASS / 6 PARTIAL / 10 ABSENT / 18 N/A**.

## Checks and limits

All checker processes ran serially, one family at a time. Minimum sampled available RAM was **18 GiB**, with **zero** readings below 6 GiB and zero pauses. Entry disk availability was **124 GB**. The wrapper gates each job and can suspend its own process group below 6 GiB. The first regeneration wrapper used the wrong manifest adapter key (`source_doc`); it stopped after successful generation. The adapter was corrected to `source.path`, all changed owners were independently verified, and execution resumed at index generation. This was a harness correction, not an unrelated-owner change or a failed product check.

| Command / check | Result |
|---|---|
| `PM_DM_FAMILY=<exact family> python3 -B scripts/pm-small-owner-events.py` ×8 | 0 each; **55,420 summed assertions**, shared globals repeated |
| `python3 -B <evidence>/retry-closure-regressions.py` | 0; 24 differential repairs, 88 original controls, 16 prior markers; AST changes only `current_retry` and `main` |
| `python3 -B <evidence>/additional-input-probes.py` | 0; **1,186** fresh input observations, adapted from the Astra-4 probe source with guard-removal code removed |
| Shard generate → index generate → shard check → normal index validate | 0 each; parsed top-level `pass` |
| Existing Astra-4 failure-exit probes, rerun with the current root | 0; eight expected exit-1 children and eight real exit-0 validator-success children rejected by the failure oracle |
| Settings layering / Storage recovery `--self-test` / DRY consumer tests | 0 / 0 / 0; ten DRY tests |
| Storage profile check | 1; byte-identical known 41-error baseline |
| `git -c core.whitespace=cr-at-eol diff --check origin/main` | 0 |

**Standing checks 1–10:** the complete suites and fresh probes cover current replay-only refusal, exact CV-366 actual-Server keys, encoded `project~` partitions, 16 KiB/SP-337 body/descriptor/stored-event size, full-match identifiers, caller-only retry semantics, coherent checkpoint/source identities, existing failure-exit oracle behavior, eager resolution of unused references, and retained ordinary/replay-only reads/rebuilds after live-owner retirement. Metadata substitutions return only the original result/receipt. Retained producer integers through `2**64-1` remain usable. These controls do not certify shared number-rule adoption.

**Standing check 11 and recurring defects:** the new 24 negatives have exactly one extension defect and no stale dependent copy; schema error, digest equality and original immutability are asserted in the full checker. Existing genuine foreign context pairs have no isolated proof credit. Full predicate isolation, duplicate-site cuts and inventory completeness remain part 2; no private proof script or guard table was changed or recertified. The previous 458-row and selected 32-row proof summaries remain historical evidence only.

Fresh input probes exercise recurring classes **1/7** (forged ID/digest/contradictory originals and custody across paths), **2** (Storage metadata), **3** (retained/withdrawn history), **4/11** (representation and exact typed joins), **5** (unvisited refs), **6** (stored-part size and external custody), **8** (coherent checkpoint copies and the B1 one-defect witnesses), **9** (all grades and bounded citations), **10/10a** (old numeric/retained controls with S1 open), and **12** (UTC grammar/calendar negatives and valid leap-day/fraction controls). The checker, schema and historical/digest/number helpers are unchanged except the incoming-key boundary and its main-loop assertions. Protected Storage source authenticity remains a native NOT_RUN boundary.

## Part 2 items

1. **Astra-4 S1 / Sol SW-NUMRULE-DM — OPEN.** `scripts/pm-small-owner-events.py:80–120,276–342,496–570`; all eight payload numeric schemas; CV-620–627 and SP-600–607. Adopt CV-1100/SP-1100/SP-1101 and the shared helper, including authenticated write-time original recipe selection. Preserve full Storage uint64, physical float types/bytes and signed zero. No new local cap, serializer or normalization is added in part 1.
2. **Astra-4 S2 / Sol SW-GUARDTOOL-DM / C8C-B1 machinery — OPEN.** `scripts/pm-small-owner-guard-audit.py:76–85,111–112,139–144,289–314,355–369`, delivery-type cuts and historical broad claims. Adopt `scripts/pm_guard_isolation.py` after its review passes, expose predicates in guard tables and prove the entire inventory, including the new closure predicate at `pm-small-owner-events.py:546`. Do not treat whole validators/keywords or different predicates as duplicates. Part 1 creates no new proof machinery.
3. **SW7-1 / SW7-2 cross-reference:** these exact DM labels denote old truthiness and bool/int witness defects, **not number-domain deferrals**. They were already repaired at the input head (`is True` gates, `exact_value` at line 61 and witness comparison at 234). Their original wrong-type forms are rerun by the family suites and fresh probes. No accepting type guard is deferred; remaining full isolation proof is item 2.

No new product question was encountered or stopped. No new PlanUnit, consumer, checkpoint, storage or family ID is used. New fixture IDs per family are `retry_extra_unexpected`, `retry_extra_payload_schema_version`, `retry_extra_scope_partition`. No pm-mail, subagent, registry admission, Decision Log edit, governance artifact edit, native build, browser, landing or main push was used. The worktree is removed after the branch/report push; external completion records pin final head and cleanup.

## Evidence

Evidence directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/sweep-p1/`. `DM-sweep-p1-checks.json` records commands, exits, counts and log hashes; the report and self-grade are copied there. `evidence-manifest.json` pins every retained artifact. The old capture/application evidence is preserved at its declared revisions; current rebase checks below supply current claims.

| Artifact | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/sweep-p1/retry-closure-regressions.json` | `1d84ba6322d8839faeb3019b9741660109bed774922685bafe9a003c09675e51` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/sweep-p1/additional-input-probes.json` | `527a0ddbaa92b5215b242461c9b93104ecb8595a747158b6741288bc3d29a583` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/sweep-p1/citation-refresh.json` | `64c0f26be11bb09c66c7ece8b6afc7c02658acbe4fdacc0cb561746391bdb3fb` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/sweep-p1/contract-rebase-check.json` | `a8c5ba09c8e4d6f353964e728947bc26c445502aa6ce3ccb60ce01c9d73fe296` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/sweep-p1/settings-current-rebase.json` | `b6db3511f2c18998cb8c6b67c466f37daf5470a26d9326340a9fbd77897d051b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/sweep-p1/rebase-ledger-preservation.json` | `8969fefcce69ab7eb9bc4fddc3c5e56edefac7d1782dcde93d6394e0c25f48e6` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/sweep-p1/derived-owner-scope.json` | `034481f9872eec64d8c04e71f57025acc7f1eee7a9e4465c9a46243e023c1168` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/sweep-p1/currentness-copy.json` | `486bdf8f71b6496c7c122fc5ee5fd4621bfc1e04c7928bfa129a2005d414c8d3` |

Evidence addition: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/sweep-p1/exit-oracle-probes.json`, SHA-256 `15d5a84de3cb7c618241972f22a1b05e6f9bbf6c3121fdc05aa8741e48e3492a`.

Evidence addition: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/sweep-p1/final-verification.json`, SHA-256 `f7a4d600382973daf22917b55874dbf5c27e4aefd154a04968a28afc8da0f969`.

## Sweep part 2A: findings and responses

Tool merge: `fd8dc29d5d` merges gated guard tool `004bdedd632d9463f3535190a6ed5772338cdce1` (its 11 files only; none edited). No rebase.

- **Astra-4 S2 / Sol SW-GUARDTOOL-DM — FIXED, `1cace345d9` (checker + witnesses) and `01347e4328` (audit retirement). Where:** `scripts/pm-small-owner-events.py:72` (`refusal`), generated tables `scripts/pm_small_owner_table_*.py` from the row spec in [the table generator](/home/sittingmongoose/pm-worktrees/sweep-p2a-dm/scripts/pm-small-owner-table-generate.py), suites [pm_small_owner_guard_suites.py](/home/sittingmongoose/pm-worktrees/sweep-p2a-dm/scripts/pm_small_owner_guard_suites.py), coherent witnesses [pm_small_owner_p2a_cases.py](/home/sittingmongoose/pm-worktrees/sweep-p2a-dm/scripts/pm_small_owner_p2a_cases.py), runner [pm-small-owner-guard-tables.py](/home/sittingmongoose/pm-worktrees/sweep-p2a-dm/scripts/pm-small-owner-guard-tables.py). **Cause:** the private AST guard audit cut whole validators/keywords and merged distinct predicates; its inventory could not prove check 11 predicate by predicate. **Fix:** every DM boundary derives an observation from its complete input and refuses only through named table rows in declared order (writer, semantic, witness, payload, publication, receipt, resolve, fullvalue, retry including the part-1 closure row `RT01_closure_keys`, token, checkpoint, retained, reader, rebuild, settings, readfence, replay). Compound clauses are split per predicate; entailed facts are guarded by their precondition so each witness fails exactly one row. The AST mutant `main()` is retired with a pointer to the new runner; the catalogue witnesses still run in the ordinary checker via `normal_checks`. No checker outcome changed: all eight family suites reproduce their part-1 assertion counts (55,420 summed; collection ran every family `main()`). **Verify:** `python3 -B scripts/pm-small-owner-guard-tables.py --out <dir>` (collect 173,389 records; tool results below); `PM_DM_FAMILY=<family> python3 -B scripts/pm-small-owner-events.py` ×8.

### Guard-table result (gated tool `004bdedd63`, credited exactly as reported)

Two runs on the same checker source: run 2 (16 phases, negative limit 2) and run 3 (resolve only, adding the RS03 coherent witness). Every table **PASS**; **171/171 rows proved, 0 unproved**. One distinct all-true control observation exists per phase (observations are boolean fact vectors). 77 further collected observations fail more than one row (multi-fact fixture negatives); they are excluded from tool proof, stay refused in the complete checker, and every row they touch is proved by a single-row witness instead — no row needs an unprovable-rows table.

| Phase | Rows proved | Tool negatives / collected | Own flips | Stays rejected | Evaluations |
|---|---:|---:|---:|---:|---:|
| checkpoint | 5/5 | 5/6 | 5 | 20 | 96 |
| fullvalue | 5/5 | 5/9 | 5 | 20 | 96 |
| payload | 16/16 | 16/18 | 16 | 240 | 833 |
| publication | 28/28 | 28/34 | 28 | 756 | 2,465 |
| reader | 11/11 | 11/11 | 11 | 110 | 408 |
| readfence | 7/7 | 7/8 | 7 | 42 | 176 |
| rebuild | 15/15 | 15/15 | 15 | 210 | 736 |
| receipt | 2/2 | 2/2 | 2 | 2 | 21 |
| replay | 4/4 | 4/5 | 4 | 12 | 65 |
| resolve (run 3) | 21/21 | 21/32 | 21 | 420 | 1,408 |
| retained | 5/5 | 5/5 | 5 | 20 | 96 |
| retry | 9/9 | 9/11 | 9 | 72 | 280 |
| semantic | 4/4 | 4/5 | 4 | 12 | 65 |
| settings | 7/7 | 7/10 | 7 | 42 | 176 |
| token | 6/6 | 6/14 | 6 | 30 | 133 |
| witness | 1/1 | 1/1 | 1 | 0 | 8 |
| writer | 25/25 | 25/62 | 25 | 600 | 1,976 |

27 coherent part-2A witnesses were built for rows with no single-row negative (each from a valid complete input, one fact changed, copies moved): WR09, WR10, WR14, PB01, PB02, PB04, PL01, PL02, PL11, PL14, FV01, FV03, FV05, CP01, CP02, CP03, RD01, RT04, RT08, RS03, RS14, RE01, RB01, RP01, RP02, RF01, RF02. Schema validity enters as one structural observation row per root (envelope/custody/payload/token), as in DF; per-keyword schema cuts are not claimed. `delivery_types_valid` remains a derivation helper only; PB01/PB02 decide. Standing checks 1–10 and recurring defect classes 1–9, 11, 12 keep their part-1 coverage through the unchanged complete suites; classes 10/10a are closed by the number adoption below except timestamp profiles (**interim only**).

## Sweep part 2B numbers: findings and responses

Number merge: `3e70a4c92f` merges gated NUMRULE number scope `a16f67c1ef21796758f4209ff12c0f4d12b86ce9` (exact commit). Generated-file conflicts (163 paths in `Plans/_shards/**` and `Plans/.plan_index/**`) were resolved by regeneration, never by hand; no other conflict occurred. NUMRULE files are unedited. Date-time code is merged but **not adopted**: no `pm_event_datetime.datetime_validator`, `date_time` or inventory gate is called.

- **Astra-4 S1 / Sol SW-NUMRULE-DM — FIXED (numbers), `e1377c27ee` and owner text `01347e4328`. Where:** `scripts/pm-small-owner-events.py:159` (`decode_current_json` on the shared `current_integer_token`), `:198` (`current_producer_numbers`: `current_integer` at every producer integer leaf plus `producer_semantic_bytes` qualification; the lane 2^53 cap is deleted), `:387` (`canonical_fixture_msgpack` = DM subset fence + `storage_value_bytes(EVENT_VALUE)`, byte-identical on the golden preimage and every fixture body), `:410` (`producer_digest` = shared `producer_semantic_digest` over the unchanged producer projection; byte-identical digests on all eight positives, so no fixture restamp), `:418` (frozen `dm-retained-producer-v1` retained recipe beside SP-1101, selected only in `resolve_original`), `:585` (`storage_uint64` at stored/receipt/result sequence joins), corpus runner [pm-small-owner-number-corpus.py](/home/sittingmongoose/pm-worktrees/sweep-p2a-dm/scripts/pm-small-owner-number-corpus.py), owner citations in CV-620–627 and SP-600–607. Recipe IDs, preimages and tuple positions are unchanged; full Storage uint64, physical float bytes and signed zero are preserved; retained u64 history positives and alias negatives keep passing in every family suite. **Verify:** `python3 scripts/pm_event_numbers.py --self-test --scope numbers` exits 0 with `"status": "pass"` (credited exactly); `python3 -B scripts/pm-small-owner-number-corpus.py` exits 0: 59 corpus cases at DM slots, 57 agree, 2 DM-domain float-token refusals, 30 preservation-layer cases outside DM's boundary, 0 disagreements, 0 untracked.
- **4,400-digit integer crash (DX/DS15/DF class) — PRESENT and FIXED, `e1377c27ee`. Where:** `scripts/pm-small-owner-events.py:97` (`exact_integer_digits`, scoped restored `int_max_str_digits(0)`). **Cause:** `decode_current_json`, the retained digest and identity digest raised Python's 4,300-digit `ValueError` outside any refusal path. **Fix:** parse/render integers exactly under the scoped limit so a long integer reaches a refusal row; a stored original with one is still refused at full-value construction (`physical_integer_range`). Corpus long-integer routes: forged 4,400-digit `producer_sequence_id` → writer False, publication non-terminal, retry `identity_conflict_without_effect`, full-value None, retained digest computes exactly, token decodes — 0 untracked exceptions. No predicate uses `all(...)`/`any(...)` over a generator (T149): table predicates read single fields; derivation any/all sites were rewritten as list counts.
- **Grades:** unchanged from part 1 (candidates **82 PASS / 6 PARTIAL / 8 ABSENT**; with exclusions **86 / 6 / 10 / 18 N/A**). Oracle cells already PASS; the sweep strengthens their proof, it does not move a cell. Self-grade re-pinned at this head: 332/332 citations resolve inside their declared unit/function (112 + 12 re-pins; 12 `current_retry` quotes updated to the same clauses in table-fact form). Readiness: `NOT_READY_PART_2B_TIMESTAMPS_AND_REVIEW_PENDING`.
- **Derived files:** shard generate → index generate → shard check **pass** (3,100 shards); changed shard manifests name only `Contracts_V0.md` and `storage-plan.md`. `pm-plan-index.py validate` at `origin/main` `78a1fd64cd30468f21b450dc9b39583a6a1fbc8f` reports 53 failures (32 `plan_unit_removed_without_ledger_decision`, 21 `plan_unit_removal_ledger_invalid`), none naming a DM unit or DM path: ledger drift of current main against this un-rebased lane base (part-2A rule: no rebase), not a DM regression. Recorded, not fixed here.

## Part 2B items

Timestamp items only. The timestamp review in this pass is **interim only**.

1. **CV-1101 date-time adoption — OPEN.** `scripts/pm-small-owner-events.py:22` (`utc_datetime` format checker and its UTC-Z grammar), envelope/family/Storage timestamp fields in all eight families (CV-620–627, SP-600–607). Adopt `pm_event_datetime.datetime_validator`/`date_time` with the `event_record` and `storage_utc_z` (CV-253) profiles and the inventory gate once the date-time scope passes its gates; SP-1101 frozen selection for retained timestamp profiles. Not adopted here: the date-time gate has not passed.
2. **SP-1101 recipe-tuple dispatch for timestamps — OPEN (same item).** Number-recipe selection is frozen as `dm-retained-producer-v1`; timestamp profile selection joins it only with item 1.

No new product question was encountered or stopped. No new PlanUnit or family ID is used. New scripts: `pm-small-owner-table-generate.py`, `pm_small_owner_table_*.py` (17), `pm_small_owner_guard_suites.py`, `pm_small_owner_p2a_cases.py`, `pm-small-owner-guard-tables.py`, `pm-small-owner-number-corpus.py`. No pm-mail, subagent, registry admission, Decision Log edit, governance artifact edit, native build, browser, landing or main push was used.

## Evidence (sweep part 2)

Evidence directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/sweep-p2a/` (report, self-grade, `DM-sweep-p2-checks.json`, guard-tool `summary.json` + per-phase reports, number corpus + self-test outputs, `SHA256SUMS`).
