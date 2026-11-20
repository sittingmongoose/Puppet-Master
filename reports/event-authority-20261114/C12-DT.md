# C12-DT — criterion-12 closure

**Implementation:** `1dc60f1d5e3a49e5bc5015f23ce7fb8e458b7de3`. Branch `plans/ea-pnc-c12-dt-20261114`, base `7cf56368356da2b7a5ff25f6452cf753ce36bf45` (origin/main). Publication head is recorded in the external evidence bundle's HEAD.txt. All 17 static criterion-12 cells: **PARTIAL → PASS**. Other cells are unchanged; membership ABSENT, native execution NOT_RUN and independent reviews NOT_RUN.

## Fixed stopping bar

A tool finding stops this lane only when real inputs demonstrate false acceptance by a real check or a product bug. Other findings enter the shared tool-issues list for its scheduled batch. Only the exact prescribed refusal earns mutation credit. A different refusal is INVALID. Local clause probes are covering evidence, not independently gated whole-checker kills. This bar was written before review; no sub-agent or independent review was run.

## Result

| Check | Result |
|---|---|
| Original suite | Baseline 33,961 assertions; current **38,372**, 17 families, zero failures. Every original entry point remains. |
| Complete closure replay | 38,272 checks, zero failures. |
| Gated Method B | **250/251 rows proved**, 73 tables, maximum seven rows. The only unproved row is singleton SV19 with the implication below. |
| Guard collection | 108,031 complete-boundary calls; 73,236 refused; zero open lane-matrix problems and zero collection findings. |
| Schema coverage | 15,989 owner keyword/branch/ref occurrences, 498 distinct rule bodies; 693 clause witnesses and 184 explicit whole-definition covers. Zero rule bodies lack validated controls. |
| Exact-code mutation ledger | 5,384 kills plus 85 exact first-refusal schema-boundary kills and 1,223 complete required/source-shape kills; zero INVALID in these three complete-boundary ledgers. |
| Local clause proposals | 3,499 isolated clause observations; **406 INVALID** proposals listed separately. Neither category is counted as gated whole-checker kills. |
| Retained custody | **1046 reads**, accepted and refused; zero store changes, appends or external effects. |
| Numbers | Shared number self-test PASS, 580/580. The original complete suite runs all 55 corpus spellings through 17 family ingress/writer/retry paths, including 4,400-digit integers. |
| Date-time | Complete original timestamp checks and shared battery replay PASS. acknowledged_at_utc uses the EventRecord profile. Global inventory FAIL is disclosed below. |
| Generated files | Original shard check PASS; table generation check PASS. No Plans document, shard, index or governance artifact changed. |

## Location, cause and fix

- **Pre-schema source access:** source_steps read completed.envelope_context.scope_kind before validating the completed source, so a missing/malformed context could raise KeyError/TypeError. Selection now safely derives whether that scope exists and uses the existing SV07 refusal; the full original source schema still decides every remaining required member. complete_source_schema_checks at scripts/pm-dt-event-contracts.py:1347 proves all root required members and malformed scope/non-object cases through source_valid for every family and application-source variant. complete-source-required-checks.json is the exact-code ledger.

- **Retained reader:** historical_read decoded the sealed receipt but did not inspect its binding, schema or time. HR14–HR17 now require the actual sealed first receipt, its independent event/sequence copies, every frozen AppendReceipt keyword and the E5-2 EventRecord profile. Missing, ambiguous and foreign originals remain unavailable. Writer composition creates scenario receipts before reads; reads never create or repair one. Frozen schemas and contracts are independent copies. Missing or malformed inspected prepared/completed/event values now produce HR09/HR13 refusal observations without reaching an uncontrolled source-byte dereference, while preserving the sealed store.
- **Stage proof:** the earlier claim that SV12/SV13 were unreachable was false. A valid completed source in the prepared role reaches SV12; a valid prepared source in the completed role reaches SV13. Both now have complete-boundary witnesses in singleton tables.
- **Schema coverage:** the original full schemas and source/tool pins remain. The permitted whole-definition Method B route uses DTValidator without dropping keywords or flattening alternatives. Each source-hashed clause occurrence maps to a validated control, directed witness or explicit cover, and its actual row's gated negative/cut/restoration artifact in coverage-matrix.json. owner-predicate-matrix.json separately maps the non-schema producer, operation, lifecycle, copy, checkpoint, retention and custody predicates to each exact family and existing owner units. Directed probes name their intended keyword before observing any result. Invalid probes are separate.

E8-1 A adds 18 executable first-save/cutoff/store checks in scripts/pm-dt-event-contracts.py:2494 and :2517; usage-first-save-checks.json records every result. The full shared timestamp battery also runs through that cutoff boundary (usage-cutoff-corpus.json; reproduce with replay-e8-cutoff.py --root <worktree>). The finite sealed-receipt witness models the first-save instant; native Storage timestamp mapping and the existing Usage owner’s setting-to-cutoff adapter remain native NOT_RUN boundaries. No policy or calendar-year interpretation is added. The pre-E8 source at 5af5903d7236b3c542945452ae79edacb4b9bb60 also proved 250/251 rows (guards-before-e8/summary.json); the final source is separately replayed rather than reusing that proof.

The original main suite also replays source, envelope, operation/outcome, recovery, checkpoint, lifecycle, consumer, copy-join, numeric, timestamp, retained and standing-oracle cases. New receipt joins mutate receipt event and sequence independently of the EventRecord; existing source/result/checkpoint joins keep their independently held witnesses.

## Changed paths and verification

All implementation changes are present in tree `1dc60f1d5e3a49e5bc5015f23ce7fb8e458b7de3`; its history includes `5af5903d72` (schema/receipt/stage proof), `dea69a927a` (E8-1 A) and `1dc60f1d5e` (malformed source/retained boundaries).

| Item | Exact source | Replay |
|---|---|---|
| Sealed receipt, frozen schemas and independent copies | scripts/pm-dt-event-contracts.py:1179 and :1246; scripts/pm_dt_table_hr_receipt.py:16; scripts/pm_dt_table_hr_receipt_schema.py:16 | Original main; C12 closure; gated hr_receipt and hr_receipt_schema |
| Store snapshots and receipt/custody negatives | scripts/pm-dt-event-contracts.py:1332 and :1388 | C12 closure; retained-store-observations.json |
| Prepared/completed role witnesses | scripts/pm-dt-event-contracts.py:2572; scripts/pm_dt_table_src_prepared_stage.py:16; scripts/pm_dt_table_src_completed_stage.py:16 | Original main; gated src_prepared_stage/src_completed_stage |
| Complete schema inventory, directed proposals and covering | scripts/pm_dt_c12_schema.py:22, :141, :203 and :242 | C12 closure; coverage-matrix.json and schema-keyword-attempts.json |
| Source-pinned observation replay | scripts/pm-dt-guard-tables.py:35 | Collect with --collect-only --save-collection, then gated replay; a mismatched source pin refuses |

## Singleton proof

SV19_project_only_scope remains alone in src_project_only. Earlier SV08/SV09 enforce the captured source schema, and a missing selector fails SV07. On canonical project-only families, application scope either selects an absent application source definition (earlier SV07), or disagrees with the project-scoped captured source (earlier SV17). Any other scope spelling fails EventRecord SV02. Thus SV19 cannot be first. This was checked against the canonical family/source definitions and is not credited as a tool-proved row. See entailed-singleton.json with exact current citations.

## Usage retention

Jared's **E8-1 A** is preserved: usage.event follows **ai.usage.usage-retention from immutable first durable save**. Lane s4r binds it at `1a45a61125bafc7b122b5166f637b12128520fd4` on plans/ea-pnc-s4r-20261114. Signed answer SHA-256: `509def930988ce9c7ac793f95cbdd9082d708a72dc2f108a25a4c3c74eae518b`. No runtime/telemetry anchor, count eviction or new policy is substituted. The existing technical-adapter, deletion and admission fences remain; this lane does not regrade retention.

## Global date-time inventory limitation

The frozen global gate refuses because pm_event_datetime_exclusions.json cites the retired `Plans/.plan_migration/pds-20261114-002-current-planunit-snapshot/span_map.jsonl`, absent from this base's HEAD. It reports scan_exclusions_invalid followed by 290 inventory_node_missing rows. The initially omitted audit citation inputs were restored byte-for-byte before reproducing this result. No helper, classification, exclusion, owner schema or governance file was edited to suppress it. The issue is recorded in the shared TOOL-ISSUES.md under C12-DT. **No broad shared date-time-suite PASS is claimed.** The lane-specific inventory and complete boundary corpus results remain separately recorded.

## Per-family regrade

| Family | Before | After | Existing owners |
|---|---|---|---|
| `approval.requested` | PARTIAL | PASS | CV-600, SP-580, ATS-290 |
| `approval.granted` | PARTIAL | PASS | CV-601, SP-581, ATS-290 |
| `approval.denied` | PARTIAL | PASS | CV-602, SP-582, ATS-291 |
| `approval.timeout` | PARTIAL | PASS | CV-603, SP-583, ATS-291 |
| `config.migrated` | PARTIAL | PASS | CV-604, SP-584, ATS-292 |
| `gate.evaluation_started` | PARTIAL | PASS | CV-605, SP-585, ATS-292 |
| `gate.failed` | PARTIAL | PASS | CV-606, SP-586, ATS-293 |
| `gate.passed` | PARTIAL | PASS | CV-607, SP-587, ATS-293 |
| `requirements.clarification_requested` | PARTIAL | PASS | CV-608, SP-588, ATS-294 |
| `run.background_enqueued` | PARTIAL | PASS | CV-609, SP-589, ATS-294 |
| `tool.denied` | PARTIAL | PASS | CV-610, SP-590, ATS-295 |
| `tool.execution_completed` | PARTIAL | PASS | CV-611, SP-591, ATS-295 |
| `tool.execution_started` | PARTIAL | PASS | CV-612, SP-592, ATS-296 |
| `tool.invoked` | PARTIAL | PASS | CV-613, SP-593, ATS-296 |
| `usage.event` | PARTIAL | PASS | CV-614, SP-594, ATS-297 |
| `worktree.created` | PARTIAL | PASS | CV-615, SP-595, ATS-297 |
| `worktree.deleted` | PARTIAL | PASS | CV-616, SP-596, ATS-298 |

The delta assessment and quote-audit.json carry current exact quotations and line numbers. No other criterion is upgraded. Independent blind reviews, admission and integration remain with the lead.

## Evidence and replay

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/c12-dt`. SHA256SUMS pins every retained artifact. The compact repository delta is reports/event-authority-20261114/C12-DT-self-grade.json. Raw observations and captured outputs remain outside the repository.

- Full original suite: `python3 scripts/pm-dt-event-contracts.py`.
- Complete C12 replay: `python3 scripts/pm-dt-c12-closure.py --out <evidence-dir>`.
- Gated replay: `python3 scripts/pm-dt-guard-tables.py --out <guard-dir> --max-rss 1800 --pause-when-low 12 --resume-at 13`.
- Shared numbers: `python3 scripts/pm_event_numbers.py --self-test --scope numbers`.
- Global inventory: `python3 scripts/pm_event_datetime_inventory.py` (the disclosed refusal).

Run heavy commands through long-job in a systemd scope capped at 2G with no swap, after checking at least 12 GB available. The queued guard replay waits for guard capacity. The source-pinned observation cache contains no cached gated-proof verdicts and refuses mismatched source/family pins.

**For Jared:** no new product question. Shared inventory repair and independent review/integration are disclosed dependencies. The worktree is retained for the lead's merge, as C12-RUN/PNC019-RUN require; no main push, landing lock, reseal, browser or sub-agent.
