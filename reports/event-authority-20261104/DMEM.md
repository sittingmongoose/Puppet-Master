# DMEM fix round 8 — retained write recipes and enforced formats

Branch: `plans/ea-w2-memory-maintenance-20261104`. Assessed source commit: `ba3880b49cc9c0d6e2d89adfd40b3ca3a7550fd8`. Reviewed head: `e6703d144e85ddd7e566729848666656dfe6f14e`. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DMEM-sol/REVIEW-cycle7.md`.

Twelve exact families are prepared without admission, pending independent review. Membership remains ABSENT; retention PARTIAL; native execution NOT_RUN. The exact DL-402/DL-403 Card 1b application, original first-start custody gate, all earlier fixtures/failed snapshots and the report-only cutoff proposal remain unchanged. No cutoff is selected.

## Review round 8: findings and responses

- **B1 — fixed (`ba3880b49cc9c0d6e2d89adfd40b3ca3a7550fd8`). Where:** `scripts/pm_memory_maintenance_events.py` historical digest/envelope/operation/target paths, plus retained-original verification during current-writer retries and checkpoint joins; frozen schema definitions; each SP-630–639/CV-658–659 numeric paragraph and ATS-315. **Cause:** the strict current-number domain was applied to retained originals and their immutable operation witnesses. **Fix:** current writes and current identity inputs keep `safe-integer-write-v2`; both retained `pm.event.v0` envelope editions explicitly use frozen `integer-json-v1`. Current writes are a byte-identical subset of that encoding, so changing edition cannot choose weaker hashing. The reader has no caller recipe override; closed schemas reject unknown editions/recipe fields, and repeated edition joins remain. Original hashes/values are never repaired while reading. Frozen `historical_` operation/target definitions equal the actual cycle-6 source, including its int63 artifact bound. Lossless ingestion, exact Boolean types, custody, access and withdrawal stay enforced. Verify all twelve full checkers, 72 actual old-writer receipts (48 integer and 24 integral binary64), 192 four-mode large-integer histories, 96 retained old-binary64 controls, four old-domain rebuild artifacts, 48 verbatim old-writer retained controls, unchanged-commitment decimal/exponent controls, 72 actual old-receipt retry controls and their 216 isolated digest/flush/binding negatives, and forged-history guard rows.
- **Note 2 — integration item. Where:** index retention validation against newer `origin/main`. **Cause:** the branch predates current-main Decision Log additions. **Handling:** Decision_Log.md remains byte-preserved; actual index validation is `fail` with 22 failures. The untouched starting index reproduces the same failures. Preserve current-main decisions during the integration rebase and rerun validation; do not repair unrelated ledgers here.
- **Note 3 — accounted for. Where:** four generated index clock fields. **Cause:** the generator writes `generated_at_utc`. **Handling:** normal generation is committed; no literal byte-identity claim. Only edited owner documents have changed owner shards; schema and fixture inputs are committed directly.
- **Astra item 12 — fixed (`ba3880b49cc9c0d6e2d89adfd40b3ca3a7550fd8`). Where:** optional `FormatChecker` date-time registration on this VM. **Cause:** its installed checker silently lacks `date-time`, despite a format checker being passed. **Fix:** explicit full-input RFC3339 calendar/zone/fraction grammar and UUID grammar at every validator construction. Missing zones, wrong separators, invalid calendar/time/offset fields, trailing LF, unsupported leap seconds and empty fractional parts refuse; leap-day and permitted fractional controls pass without rewriting timestamp bytes. All 85 format declarations are visited, including frozen definitions and dormant checkpoint branches. Existing UTC-Z/type/length constraints remain. The declared format contract is enforced in both reader editions; no narrower historical format recipe is introduced.

## Family grades before and after

Before is the independent cycle-7 review. P/Q/A = PASS/PARTIAL/ABSENT. Compatibility/withdrawal and oracles upgrade PARTIAL → PASS after the new legacy-positive, forgery, format and complete-guard proofs. Other cells remain unchanged. Static preparation only.

| Exact family | Before P/Q/A | After P/Q/A |
|---|---:|---:|
| `memory.dedup_sweep.completed` | 8/3/1 | 10/1/1 |
| `memory.dedup_sweep.started` | 8/3/1 | 10/1/1 |
| `memory.index.lexical.rebuild.completed` | 8/3/1 | 10/1/1 |
| `memory.index.lexical.rebuild.started` | 8/3/1 | 10/1/1 |
| `memory.index.semantic.rebuild.completed` | 8/3/1 | 10/1/1 |
| `memory.index.semantic.rebuild.started` | 8/3/1 | 10/1/1 |
| `memory.monthly_summary.completed` | 8/3/1 | 10/1/1 |
| `memory.monthly_summary.started` | 8/3/1 | 10/1/1 |
| `memory.prune_archive.completed` | 8/3/1 | 10/1/1 |
| `memory.prune_archive.started` | 8/3/1 | 10/1/1 |
| `memory.verification_sweep.completed` | 8/3/1 | 10/1/1 |
| `memory.verification_sweep.started` | 8/3/1 | 10/1/1 |

Totals: **96 PASS / 36 PARTIAL / 12 ABSENT → 120 PASS / 12 PARTIAL / 12 ABSENT**. The self-grade has exact source citations at the assessed source commit. Absent membership, unresolved retention and native NOT_RUN remain explicit.

## Complete guard table

**114 named guards/duplicate sets; 23,450 negatives; 1,307,922 guard/case evaluations; 13,062 preserved custody-matrix cases.** Every guard runs once per applicable family, including zero-own-case complements, one family and one guard/duplicate set at a time. Every case has a passing control; own negatives flip, all complements keep their exact refusal, and restoration rechecks own negatives. No required-field exemption, evaluation-time input/hash/copy repair or whole-gate bypass.

The current-number and historical-integrality predicates are separate members of the named numeric duplicate set. Only current schemas retain the safe upper bound; frozen schemas retain their original bounds. The 480 former historical safe-range refusals are replaced by original-recipe positives; every current-writer/identity numeric refusal remains. Envelope schema removal also removes only its repeated historical schema_id/schema_version comparisons; its independent format guard stays enabled. Format removal names explicit format checks and UTC/end-of-input patterns on formatted leaves only; unrelated patterns, types, lengths, required fields and lower bounds stay enabled. Existing custody, producer, Boolean-fence and archive-memory duplicate sets are preserved.

Missing-byte/withdrawal witnesses use the actual custody gate. Other custody/legacy-history witnesses use complete entry points. Format, parser, schema, cap and reference witnesses use their actual predicate endpoints; the report does not claim physical receipt authentication or native transactions.

### maintenance checker

| Guard or named duplicate set | Flip | Stay rejected | Restored |
|---|---:|---:|---|
| `action` | 8 | 15,308 | yes |
| `admission` | 192 | 15,124 | yes |
| `artifacts` | 4 | 15,312 | yes |
| `boundary_acceptance` | 48 | 15,268 | yes |
| `boundary_payload` | 8 | 15,308 | yes |
| `boundary_receipts` | 144 | 15,172 | yes |
| `boundary_request` | 8 | 15,308 | yes |
| `boundary_scope` | 24 | 15,292 | yes |
| `boundary_snapshot` | 192 | 15,124 | yes |
| `boundary_terminal` | 4 | 15,312 | yes |
| `checkpoint_event` | 8 | 15,308 | yes |
| `checkpoint_key` | 8 | 15,308 | yes |
| `checkpoint_storage` | 8 | 15,308 | yes |
| `commitment_numbers` | 368 | 14,948 | yes |
| `custody_binding` | 4,806 | 10,510 | yes |
| `custody_digest` | 1,134 | 14,182 | yes |
| `custody_flush` | 1,038 | 14,278 | yes |
| `custody_presence` | 934 | 14,382 | yes |
| `custody_shape` | 958 | 14,358 | yes |
| `effect_count` | 4 | 15,312 | yes |
| `effect_once` | 16 | 15,300 | yes |
| `envelope_schema` | 296 | 15,020 | yes |
| `formats_enforced` | 2,488 | 12,828 | yes |
| `history_event` | 40 | 15,276 | yes |
| `inline_cap` | 8 | 15,308 | yes |
| `json_number_grammar` | 56 | 15,260 | yes |
| `operation_cas` | 8 | 15,308 | yes |
| `operation_receipt` | 8 | 15,308 | yes |
| `operation_result_digest` | 8 | 15,308 | yes |
| `operation_result_ref` | 8 | 15,308 | yes |
| `operation_schema` | 72 | 15,244 | yes |
| `original_input` | 8 | 15,308 | yes |
| `outcome` | 8 | 15,308 | yes |
| `partition` | 8 | 15,308 | yes |
| `payload_schema` | 40 | 15,276 | yes |
| `permission_or_withdrawal` | 2,218 | 13,098 | yes |
| `phase` | 8 | 15,308 | yes |
| `prior_selector` | 4 | 15,312 | yes |
| `producer_join` | 40 | 15,276 | yes |
| `references_resolve` | 8 | 15,308 | yes |
| `replay_policy` | 8 | 15,308 | yes |
| `request` | 8 | 15,308 | yes |
| `selected_target` | 4 | 15,312 | yes |
| `selector_cas` | 4 | 15,312 | yes |
| `selector_schema` | 4 | 15,312 | yes |
| `selector_scope` | 4 | 15,312 | yes |
| `source` | 8 | 15,308 | yes |
| `target_identity` | 4 | 15,312 | yes |
| `target_manifest` | 4 | 15,312 | yes |
| `target_order` | 4 | 15,312 | yes |
| `target_schema` | 4 | 15,312 | yes |
| `target_source` | 4 | 15,312 | yes |
| `terminal_custody` | 8 | 15,308 | yes |
### archive checker

| Guard or named duplicate set | Flip | Stay rejected | Restored |
|---|---:|---:|---|
| `action` | 4 | 8,130 | yes |
| `admission` | 100 | 8,034 | yes |
| `boundary_acceptance` | 24 | 8,110 | yes |
| `boundary_payload` | 4 | 8,130 | yes |
| `boundary_receipts` | 72 | 8,062 | yes |
| `boundary_request` | 4 | 8,130 | yes |
| `boundary_scope` | 12 | 8,122 | yes |
| `boundary_snapshot` | 96 | 8,038 | yes |
| `boundary_terminal` | 2 | 8,132 | yes |
| `checkpoint_event` | 4 | 8,130 | yes |
| `checkpoint_key` | 8 | 8,126 | yes |
| `checkpoint_storage` | 8 | 8,126 | yes |
| `commitment_numbers` | 184 | 7,950 | yes |
| `custody_digest` | 864 | 7,270 | yes |
| `custody_flush` | 442 | 7,692 | yes |
| `custody_presence` | 390 | 7,744 | yes |
| `custody_shape` | 398 | 7,736 | yes |
| `cutoff_commitment` | 4 | 8,130 | yes |
| `cutoff_record` | 4 | 8,130 | yes |
| `cutoff_reference` | 4 | 8,130 | yes |
| `cutoff_scope` | 8 | 8,126 | yes |
| `cutoff_unique` | 4 | 8,130 | yes |
| `cutoffs_unavailable` | 328 | 7,806 | yes |
| `effect_once` | 12 | 8,122 | yes |
| `envelope_schema` | 152 | 7,982 | yes |
| `evidence_preserved` | 4 | 8,130 | yes |
| `formats_enforced` | 1,244 | 6,890 | yes |
| `history_event` | 20 | 8,114 | yes |
| `inline_cap` | 4 | 8,130 | yes |
| `json_number_grammar` | 28 | 8,106 | yes |
| `memory_flags` | 352 | 7,782 | yes |
| `no_extra_memories` | 4 | 8,130 | yes |
| `no_prune_summary` | 2 | 8,132 | yes |
| `operation_cas` | 8 | 8,126 | yes |
| `operation_receipt` | 4 | 8,130 | yes |
| `operation_result_digest` | 4 | 8,130 | yes |
| `operation_result_ref` | 4 | 8,130 | yes |
| `operation_schema` | 40 | 8,094 | yes |
| `original_input` | 4 | 8,130 | yes |
| `originals_preserved` | 4 | 8,130 | yes |
| `outcome` | 4 | 8,130 | yes |
| `partition` | 8 | 8,126 | yes |
| `payload_schema` | 98 | 8,036 | yes |
| `permission_or_withdrawal` | 1,044 | 7,090 | yes |
| `phase` | 4 | 8,130 | yes |
| `pins_preserved` | 4 | 8,130 | yes |
| `references_resolve` | 8 | 8,126 | yes |
| `replay_policy` | 8 | 8,126 | yes |
| `request` | 8 | 8,126 | yes |
| `selected_archived` | 4 | 8,130 | yes |
| `selected_fields_preserved` | 12 | 8,122 | yes |
| `selection_exists` | 4 | 8,130 | yes |
| `selection_kind` | 2 | 8,132 | yes |
| `selection_pinned` | 4 | 8,130 | yes |
| `selection_unique` | 4 | 8,130 | yes |
| `semantic_binding` | 2,034 | 6,100 | yes |
| `source` | 8 | 8,126 | yes |
| `summary_provenance` | 2 | 8,132 | yes |
| `terminal_custody` | 8 | 8,126 | yes |
| `unselected_preserved` | 4 | 8,130 | yes |
| `versions_preserved` | 4 | 8,130 | yes |

## All eleven standing checks

| # | Evidence and limits |
|---|---|
| 1 | Fresh/retry replay-only writer refusals remain for every family; historical replay-only positives use the reader path. |
| 2 | Exact CV-366 Application attempts refuse; these prepared editions remain Project-only. |
| 3 | Encoded project~ positives and raw/foreign/padded partition negatives remain. |
| 4 | Whole payload and separate operation/terminal-reservation caps remain; old cap fixtures are byte-preserved. SP-337 remains authoritative for larger bodies. |
| 5 | Identifier full-input/length and trailing-LF negatives remain; new format grammar uses fullmatch. |
| 6 | Caller-only sequence/observed/persisted retry changes return the unchanged original; semantic conflicts refuse. Physical Storage authentication remains native. |
| 7 | Existing SP-278 checkpoint storage/key/event joins remain; UUID format is now dependency-independent. |
| 8 | Restored historical-number and skipped-format defects each make every complete checker exit 1 at its intended assertion (24/24). Failure is never counted as success. |
| 9 | Eager offline reference walk still covers all used schemas, frozen definitions and registry mirrors; dormant mutations remain. |
| 10 | All prior history suites plus 340 authentic old-recipe controls and 340 live-independent controls pass. New writes remain strict. Forged/withdrawn/foreign originals refuse. |
| 11 | Complete table above, including new legacy-history and format cases; no guard is weakened. |

## All Astra defect classes, including 10a and 12

| Item | Own mutation / disposition |
|---|---|
| 1 Forged/contradictory inputs | Independent coherently rehashed foreign identity refuses for each family; new old-recipe rehashed foreign-source/edition cases and preserved cutoff contradictions refuse. |
| 2 Storage metadata trusted from payload | Independent caller-only Storage sequence/observed/persisted changes return the original (36/36). Synthetic resolver authentication remains a native limitation. |
| 3 History in either direction | All four modes, current-live replacements and absent admission/cutoffs pass. The 72 actual old-writer receipts (48 integer and 24 integral binary64), large retained domains and all typed access/withdrawal/forgery controls pass. |
| 4 One field read two ways | Integer-for-hex, schema type, case/space/LF and exact numeric tests remain; decimal/exponent legacy controls keep the same stored commitment. No timestamp normalization changes hash bytes. |
| 5 Dormant refs | Independent unseen payload ref mutations refuse; whole-schema offline walking includes every new frozen definition. |
| 6 Partial sizes | Whole-value cap mutation refuses; operation/target/selector and terminal-reservation checks remain. No contradictory larger-inline route or owner sentence was added. |
| 7 Custody on every path | Independent succeeded/failed terminal advances with missing starts refuse; all 13,062 prior matrix cells remain. |
| 8 Masked negatives | Complete removal/restoration/complement table passes. Initial diagnostics exposed missing historical integrality and repeated edition comparisons; final tests prove the independent guard and precisely named duplicate constants. |
| 9 Inflated grades | All complete checkers, authentic old-writer controls, restored defects, full table and exact citations are required before upgrading the two cells. Retention/admission/native limits stay explicit. |
| 10 Numeric spellings | Current safe limits and out-of-range decimal/exponent/fraction controls remain; 1/1.0/1e0/-0 agree and 01 refuses. Large retained integers use the frozen domain. |
| 10a Tightening history | Fixed write-recipe map per envelope edition, frozen operation/target schemas, byte-identical current subset, unchanged old receipts and 480 isolated forged-history refusals. Unknown recipe fields/editions cannot select a weaker route. |
| 11 Type confusion | All prior wrong Boolean/number/string/null/array/object boundary cases and coherent input/output archive-flag cases remain in every complete suite and guard proof. |
| 12 Skipped formats | Explicit format implementation plus 3,732 negatives and 2,736 fractional/leap-day positives; all 85 format declarations are visited. No optional package can silently skip these formats. |

## Checks, preservation, resources and remaining work

- **Complete checkers:** 12/12 exit 0, each through --family. New controls: {"current_recipe_refusals": 144, "forged_old_recipe": 480, "format_declarations": 1020, "format_negatives": 3732, "format_positives": 2736, "legacy_binary64_controls": 96, "legacy_number_spellings": 480, "legacy_retry_negatives": 216, "live_independent_old_recipe": 340, "retained_old_recipe": 340}. All prior suites remain enabled; retained-original verification on writer retries uses the frozen recipe while the caller input remains strict.
- **Guard proof:** 114 sets / 23,450 negatives / 1,307,922 evaluations; sequential and no bypass. Full ids/complements are external; the committed compact table pins counts, examples and id-list hashes.
- **Restored defects and independent probes:** 24/24 complete checker failures at intended assertions; independent per-family probes cover existing forgery, Storage retry ownership, history/access, representation, dormant refs, cap, custody, numbers and exact types.
- **Derived files:** shard generation/check and index generation pass. Actual index validation is `fail`; the same failures reproduce from the untouched starting index. Currentness copy: 15/15 SHA-256 matches before generation. Generated clocks are qualified, not restamped.
- **Preservation:** all old fixtures, canonical histories, boundary fixtures, contracts, current operation/target definitions, registry values/profiles, Card 1b owner hunk, Decision Log and generic envelope schema are byte-preserved. Only 13 own numeric/format paragraphs change across the three owner docs. No PlanUnit id changes.
- **Resources:** sparse local worktree; initial disk 70 GB free and RAM 17 GiB available. Every family/guard enforces the 6 GiB gate. No parallel checker, subagent, pm-mail, browser, server, admission, landing lock, governance reseal or main push.
- **IDs:** no new PlanUnit ids. Existing edited ids: SP-630–639, CV-658–659, ATS-315. Existing AMS-100–107, CV-650–657 and ATS-316 remain references. New fixture schema id: pm.memory.write_recipe_fixtures.v1; recipe labels integer-json-v1 and safe-integer-write-v2 name preserved encoding and its strict writer subset.
- **Remaining:** independent review; current-main/index reconciliation at integration; per-family admission; pending operation/result retention and cited unlanded decisions/retention integration; Jared's cutoff choice; native receipt/transaction/flush/crash/backup/GUI/race proof. The dedup survivor/disposition question remains open.

## Evidence

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/check11.json` — SHA-256 `61d4f448bb7d44e56abdc7c6586efffc804fc595facdcbcec3815cb3e281efc7`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/family-summary.json` — SHA-256 `985c5501dd534f8195b732e9146c86789e220ffc581cadb05a5909b9d7304906`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/restored-defects.json` — SHA-256 `05fb37e02a1bf12ec04d540e98ae56661c079c9288d9a60c321785f55a9cc6b8`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/independent-probes.json` — SHA-256 `8faf23d47c629d4460d848866be85bbb48069f50aebc3c4ff514188763a2f6a6`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/scope-preservation.json` — SHA-256 `04f400843ed98ac5d3d5bf2a828b3d1ef4d001615c570c2345efb90446a2aa32`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/currentness-copy.json` — SHA-256 `d509feb987c108bc388c76e45560986cd3536255c35eb914a76f07977b982e84`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/shard-check.json` — SHA-256 `a471f4cd29bb5aeac3bf0eb27f14f6ee4baeec39bd3cb3a866aea09768adca69`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/index-validate.json` — SHA-256 `f9ecca138f783c040a0c537d89f3b4863a43d87b88e4c634a05b0b81eb3c3e6b`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix8/index-baseline-equivalence.json` — SHA-256 `0ffb28294c1b19fe46d66ee90a2fa30863ecf75943b2cf512c1cdbdaadbdea44`.

Report and self-grade copies are in drafts/DMEM/. Complete ids and complements remain in check11.json; unneeded run outputs and extracted old-source scratch are removed after verification. The worktree is removed after both commits are pushed.

---

Earlier source-pinned reports follow as lineage; the cutoff proposal is unchanged.

# DMEM fix round 7 — cycle-6 B1, S1 and S2

Branch: `plans/ea-w2-memory-maintenance-20261104`. Assessed source commit: `9646eb4e66bc7097068f1cb1588b8daac0cd2f9e`. Reviewed head: `77323e87d65908dbce2ea655ee344b6185a13ff1`. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DMEM-sol/REVIEW-cycle6.md`.

Twelve exact families prepared without admission, pending independent review. Membership remains ABSENT; retention PARTIAL; native execution NOT_RUN. The first-start custody gate, withdrawal choice, every `failed_terminal_saved` snapshot, Card 1b application and report-only cutoff proposal are preserved.

## Review round 7: findings and responses

- **B1 — fixed (`9646eb4e66bc7097068f1cb1588b8daac0cd2f9e`). Where:** `json_numbers`, `canonical_numbers`, the lane envelope/operation/target schemas and registry mirrors; own SP-630–639/CV-658–659 paragraphs and ATS-315. **Cause:** binary64 parsing rounded decimal/exponent spellings before normalization. **Fix:** decode decimal/exponent tokens exactly, normalize supported mathematical integers, and refuse fractions/nonfinite values or |n| > 9007199254740991. Existing nonnegative domains retain their lower bounds. Every identity/idempotency/result/target/full-value digest uses this same normalization; encoded-size inputs normalize too. The lane schema inherits all current and frozen compatibility-envelope rules without changing the generic envelope schema. Boundary cases cover ±(2^53−1), ±2^53, ±2^60, all review spellings, near-integer fractions, 1.0, 1e0, -0 and invalid 01. Two old cap fixtures are coherently rebuilt with safe byte lengths, preserving their encoded sizes and refusal targets. Verify the complete per-family checkers, `independent-probes.json`, restored numeric-parser defects and the `commitment_numbers` duplicate-set row.
- **S1 — fixed (`9646eb4e66bc7097068f1cb1588b8daac0cd2f9e`). Where:** `flag`, all writer/access/withdrawal and boundary receipt/source/acceptance conditions. **Cause:** truthiness granted authority to non-Boolean fields. **Fix:** exact Boolean type precedes value evaluation; strings, numeric 0/1, null, arrays and nested objects refuse. The same checks cover phase effects/recovery and reduced/canonical history; history still ignores current admission/cutoffs. Every malformed authority value has an intact typed control and a complete-entry guard witness. Verify each family's domain corpus and restored authority defect (12/12 nonzero checker exits).
- **S2 — fixed (`9646eb4e66bc7097068f1cb1588b8daac0cd2f9e`). Where:** `memory_flags`, `archive_candidate`, `archive_validate`. **Cause:** malformed pinned/archive values were used as memory state. **Fix:** validate every resolved input/output memory's exact Boolean fields before selection and post-state validation. All selected, unselected and pinned originals have wrong-type settlement cases; coherent before/after copies prove post-state refusal without a stale preservation copy. Typed pin/archive policy is unchanged. Verify the four per-family `memory_flags` rows and restored memory-type defects (4/4 nonzero exits).

No finding is disputed or stopped for a new product decision. The cutoff question remains only in the unchanged proposal below; DL-403 keeps those jobs unavailable until approved cutoff records exist.

## Family grades before and after

PASS/PARTIAL/ABSENT, static preparation only. The independent cycle-6 oracle grade is PARTIAL; only that cell upgrades to PASS.

| Exact family | Before P/Q/A | After P/Q/A |
|---|---:|---:|
| `memory.dedup_sweep.completed` | 9/2/1 | 10/1/1 |
| `memory.dedup_sweep.started` | 9/2/1 | 10/1/1 |
| `memory.index.lexical.rebuild.completed` | 9/2/1 | 10/1/1 |
| `memory.index.lexical.rebuild.started` | 9/2/1 | 10/1/1 |
| `memory.index.semantic.rebuild.completed` | 9/2/1 | 10/1/1 |
| `memory.index.semantic.rebuild.started` | 9/2/1 | 10/1/1 |
| `memory.monthly_summary.completed` | 9/2/1 | 10/1/1 |
| `memory.monthly_summary.started` | 9/2/1 | 10/1/1 |
| `memory.prune_archive.completed` | 9/2/1 | 10/1/1 |
| `memory.prune_archive.started` | 9/2/1 | 10/1/1 |
| `memory.verification_sweep.completed` | 9/2/1 | 10/1/1 |
| `memory.verification_sweep.started` | 9/2/1 | 10/1/1 |

Totals: **108 PASS / 24 PARTIAL / 12 ABSENT → 120 PASS / 12 PARTIAL / 12 ABSENT**. All 144 cells have exact source citations; 532 quotations resolve at the assessed commit. There is no admission or native execution claim.

## Complete guard table

**112 named guards/duplicate sets; 19,502 negatives; 1,068,648 guard/case evaluations; 13,062 preserved custody-matrix cases.** Each family runs in its own sequential process. Every guard for its checker is removed once in every family, including families where it has zero own cases; merging the per-family lists therefore preserves the complete lane complement. Every own negative flips, every other negative keeps its exact refusal, and restoration rechecks the own negatives. No parallel checker/guard jobs or whole-gate bypasses.

The numeric duplicate set names the actual canonical-number refusal/numeric preflights plus integer/safe-upper-bound schema enforcement. Required fields, structural and nonnumeric type checks and existing lower bounds remain enabled. JSON grammar removal suppresses only JSONDecodeError, retaining numeric-domain validation. Authority/receipt groups name flag's exact-type and Boolean-identity checks at every repeated fence site. Existing named custody/producer/schema duplicate sets are preserved. `memory_flags` names its input-selection and input/output-validation sites.

Presence/withdrawal witnesses use the actual common gate without manufacturing absent bytes. Complete phase/writer/boundary/reader entry points cover the other custody and authority cases. Numeric grammar/hash/schema preflight witnesses use their actual predicates: unsupported fractions receive no fabricated retained commitment. Supported numeric forms also run complete writers and all four historical readers. Physical custody, transaction/flush/race and native behavior remain NOT_RUN.

### maintenance checker

Corpus: 12,684 negatives.

| Guard or named duplicate set | Flip | Stay rejected | Restored |
|---|---:|---:|---|
| `action` | 8 | 12,676 | yes |
| `admission` | 192 | 12,492 | yes |
| `artifacts` | 4 | 12,680 | yes |
| `boundary_acceptance` | 48 | 12,636 | yes |
| `boundary_payload` | 8 | 12,676 | yes |
| `boundary_receipts` | 144 | 12,540 | yes |
| `boundary_request` | 8 | 12,676 | yes |
| `boundary_scope` | 24 | 12,660 | yes |
| `boundary_snapshot` | 192 | 12,492 | yes |
| `boundary_terminal` | 4 | 12,680 | yes |
| `checkpoint_event` | 8 | 12,676 | yes |
| `checkpoint_key` | 8 | 12,676 | yes |
| `checkpoint_storage` | 8 | 12,676 | yes |
| `commitment_numbers` | 688 | 11,996 | yes |
| `custody_binding` | 4,726 | 7,958 | yes |
| `custody_digest` | 1,054 | 11,630 | yes |
| `custody_flush` | 958 | 11,726 | yes |
| `custody_presence` | 934 | 11,750 | yes |
| `custody_shape` | 958 | 11,726 | yes |
| `effect_count` | 4 | 12,680 | yes |
| `effect_once` | 16 | 12,668 | yes |
| `envelope_schema` | 200 | 12,484 | yes |
| `history_event` | 40 | 12,644 | yes |
| `inline_cap` | 8 | 12,676 | yes |
| `json_number_grammar` | 56 | 12,628 | yes |
| `operation_cas` | 8 | 12,676 | yes |
| `operation_receipt` | 8 | 12,676 | yes |
| `operation_result_digest` | 8 | 12,676 | yes |
| `operation_result_ref` | 8 | 12,676 | yes |
| `operation_schema` | 8 | 12,676 | yes |
| `original_input` | 8 | 12,676 | yes |
| `outcome` | 8 | 12,676 | yes |
| `partition` | 8 | 12,676 | yes |
| `payload_schema` | 40 | 12,644 | yes |
| `permission_or_withdrawal` | 2,154 | 10,530 | yes |
| `phase` | 8 | 12,676 | yes |
| `prior_selector` | 4 | 12,680 | yes |
| `producer_join` | 40 | 12,644 | yes |
| `references_resolve` | 8 | 12,676 | yes |
| `replay_policy` | 8 | 12,676 | yes |
| `request` | 8 | 12,676 | yes |
| `selected_target` | 4 | 12,680 | yes |
| `selector_cas` | 4 | 12,680 | yes |
| `selector_schema` | 4 | 12,680 | yes |
| `selector_scope` | 4 | 12,680 | yes |
| `source` | 8 | 12,676 | yes |
| `target_identity` | 4 | 12,680 | yes |
| `target_manifest` | 4 | 12,680 | yes |
| `target_order` | 4 | 12,680 | yes |
| `target_schema` | 4 | 12,680 | yes |
| `target_source` | 4 | 12,680 | yes |
| `terminal_custody` | 8 | 12,676 | yes |

### archive checker

Corpus: 6,818 negatives.

| Guard or named duplicate set | Flip | Stay rejected | Restored |
|---|---:|---:|---|
| `action` | 4 | 6,814 | yes |
| `admission` | 100 | 6,718 | yes |
| `boundary_acceptance` | 24 | 6,794 | yes |
| `boundary_payload` | 4 | 6,814 | yes |
| `boundary_receipts` | 72 | 6,746 | yes |
| `boundary_request` | 4 | 6,814 | yes |
| `boundary_scope` | 12 | 6,806 | yes |
| `boundary_snapshot` | 96 | 6,722 | yes |
| `boundary_terminal` | 2 | 6,816 | yes |
| `checkpoint_event` | 4 | 6,814 | yes |
| `checkpoint_key` | 8 | 6,810 | yes |
| `checkpoint_storage` | 8 | 6,810 | yes |
| `commitment_numbers` | 344 | 6,474 | yes |
| `custody_digest` | 824 | 5,994 | yes |
| `custody_flush` | 402 | 6,416 | yes |
| `custody_presence` | 390 | 6,428 | yes |
| `custody_shape` | 398 | 6,420 | yes |
| `cutoff_commitment` | 4 | 6,814 | yes |
| `cutoff_record` | 4 | 6,814 | yes |
| `cutoff_reference` | 4 | 6,814 | yes |
| `cutoff_scope` | 8 | 6,810 | yes |
| `cutoff_unique` | 4 | 6,814 | yes |
| `cutoffs_unavailable` | 328 | 6,490 | yes |
| `effect_once` | 12 | 6,806 | yes |
| `envelope_schema` | 104 | 6,714 | yes |
| `evidence_preserved` | 4 | 6,814 | yes |
| `history_event` | 20 | 6,798 | yes |
| `inline_cap` | 4 | 6,814 | yes |
| `json_number_grammar` | 28 | 6,790 | yes |
| `memory_flags` | 352 | 6,466 | yes |
| `no_extra_memories` | 4 | 6,814 | yes |
| `no_prune_summary` | 2 | 6,816 | yes |
| `operation_cas` | 8 | 6,810 | yes |
| `operation_receipt` | 4 | 6,814 | yes |
| `operation_result_digest` | 4 | 6,814 | yes |
| `operation_result_ref` | 4 | 6,814 | yes |
| `operation_schema` | 8 | 6,810 | yes |
| `original_input` | 4 | 6,814 | yes |
| `originals_preserved` | 4 | 6,814 | yes |
| `outcome` | 4 | 6,814 | yes |
| `partition` | 8 | 6,810 | yes |
| `payload_schema` | 98 | 6,720 | yes |
| `permission_or_withdrawal` | 1,012 | 5,806 | yes |
| `phase` | 4 | 6,814 | yes |
| `pins_preserved` | 4 | 6,814 | yes |
| `references_resolve` | 8 | 6,810 | yes |
| `replay_policy` | 8 | 6,810 | yes |
| `request` | 8 | 6,810 | yes |
| `selected_archived` | 4 | 6,814 | yes |
| `selected_fields_preserved` | 12 | 6,806 | yes |
| `selection_exists` | 4 | 6,814 | yes |
| `selection_kind` | 2 | 6,816 | yes |
| `selection_pinned` | 4 | 6,814 | yes |
| `selection_unique` | 4 | 6,814 | yes |
| `semantic_binding` | 1,994 | 4,824 | yes |
| `source` | 8 | 6,810 | yes |
| `summary_provenance` | 2 | 6,816 | yes |
| `terminal_custody` | 8 | 6,810 | yes |
| `unselected_preserved` | 4 | 6,814 | yes |
| `versions_preserved` | 4 | 6,814 | yes |

## All eleven standing checks

| # | Evidence and limits |
|---|---|
| 1 | All twelve complete writer suites retain fresh/retry replay-only refusals. Historical replay-only positives remain separate. |
| 2 | Project-only editions refuse exact CV-366 Application attempts; no Application writer or bucket is invented. |
| 3 | Encoded project~ positives and raw/foreign/padded partition refusals remain. |
| 4 | Entire payload and separate operation cap checks remain; both existing size-only operation controls keep safe byte lengths and their original encoded sizes. SP-337 remains authoritative. |
| 5 | All original identifier cases are covered by the union of --family runs; full-input/LF guards and registry mirrors remain. |
| 6 | Three caller-only Storage metadata changes per family return the unchanged original; semantic conflicts remain. Independent probes reproduce 36/36. |
| 7 | Generic SP-278 storage/key/event identity joins remain, with actual matching storage UUIDs. Native inclusion is not claimed. |
| 8 | Restoring the lossy parser, truthiness authority or malformed-memory acceptance makes the actual complete checker exit 1 in 28/28 sequential processes, with the expected oracle assertion. |
| 9 | Eager offline walking now includes the inherited lane envelope document and every compatibility branch. Dormant reference mutations still fail. |
| 10 | All original 1,104 complete historical cases and reduced history remain; supported numeric forms add four-mode positives. Current live state/admission/cutoffs do not gate old originals; current access, withdrawal, custody and forgery still do. |
| 11 | Complete table above: own flips, exact complete complements and restoration; no missing-field exemptions, reconstructed inputs or whole-gate replacement. |

## All eleven Astra defect classes

| Item | Own mutation / disposition |
|---|---|
| 1 Forged/contradictory inputs | Independently rehashed foreign event ids refuse in every exact reader; the full earlier foreign/cutoff join corpus remains. |
| 2 Storage metadata from payload | Independent sequence/observed/persisted caller-only changes return the unchanged resolved original in 36/36 probes. Physical receipt authentication remains native. |
| 3 Historical readers both ways | All four modes survive unrelated live state and malformed ignored current admission; typed permission denial/withdrawal and forged/missing originals refuse. |
| 4 One field read two ways | Integer-for-hex payload probes refuse. Typed authority checks and exact decimal ingestion remove the two reported ambiguous interpretations. |
| 5 Dormant refs | Own unvisited payload ref mutations fail offline walking for every family; the new schema's inherited current/compatibility refs resolve eagerly. |
| 6 Partial sizes | Whole-value oversize probes refuse. The two rebuilt size fixtures preserve encoded lengths and target cap-only defects; no hidden oversize inline route is introduced. |
| 7 Custody on every path | Independent missing-start advances for succeeded and failed terminal rows refuse; all earlier full custody matrices remain. |
| 8 Masked negatives | Full guard proof removes exact predicates/declared numeric duplicates. Numeric/history type probes avoid stale or fictitious commitments; post-state flag copies are coherent before evaluation. |
| 9 Inflated grades | Only twelve oracle cells upgrade after all checkers, the whole guard table and restored-defect controls pass. Membership, retention and native limits remain explicit. |
| 10 Numeric spellings | Independent signed safe boundaries, exact large equivalent spellings, 2^60, near-integer fractions, 1.0/1e0/-0 and grammar controls reproduce the repaired result. |
| 11 Types confused | String booleans/numbers, 0/1, null, arrays and objects refuse across writer/boundary/four-mode history, plus every archive flag role. The new type guards have their own flipping negatives. |

## Checks, preservation, resources and remaining work

- **Complete family checkers:** 12/12 exit 0. New domain corpus: {'isolated_negative_cases': 4000, 'numeric_writer_cases': 312, 'numeric_reader_cases': 624, 'numeric_commitment_cases': 396}. All existing family suites remain enabled.
- **Restored defects:** 28/28 complete checker processes exit 1 for their intended assertions (12 numeric, 12 authority, 4 archive-memory).
- **Independent probes:** all twelve families pass; custody, writer Storage metadata, live historical independence, refs, cap, exact types and numeric boundaries are independently exercised.
- **Derived outputs:** shard generate/check and index generate pass; top-level statuses are parsed. Index validate exits 1 / top-level fail with 22 failures, all reproduced by the unmodified retention subcheck on the untouched starting revision's index against current origin/main; no PlanUnit ids changed. It reports the missing baseline DL-302 plus 21 pre-existing legacy ledger-record errors. No failure file was edited by this lane. See index-baseline-equivalence.json; this integration issue remains open. Only the edited owner documents' and registry's shards change; normal index clocks are regenerated. Currentness edition: 15/15 copied files SHA-256 matched before generation.
- **Preservation/scope:** `scope-preservation.json` verifies old states (including every failed_terminal_saved), archive fixtures/contracts, registry non-lane values/profiles, the unchanged cutoff proposal and all original per-family case/identifier coverage. No generic envelope schema, admission/event-family registry, Decision Log, .gitignore, Spec Lock, auto-decisions, generated governance evidence or frozen validator edit.
- **Resources:** sparse local worktree; initial disk 83 GB and RAM 9 GiB available. Every family/guard is sequential and checks the 6 GiB RAM gate. No threshold pause occurred. Setup made read-only inbox/who calls before reading the fix brief; no messages or later mailbox calls followed. No subagent, browser, server, landing or main push.
- **IDs:** no new PlanUnit ids. Edited existing SP-630–639, CV-658–659 and ATS-315; all other AMS/CV/ATS adoption ids and reservations are preserved. New companion schema/fixture ids are `https://puppetmaster.local/schemas/memory_maintenance/event_record.v1.schema.json` and `pm.memory.maintenance.boundary_fixtures.v1`.
- **Remaining:** reconcile the pre-existing current-main/index-retention mismatch at integration; independent review, per-family admission, pending operation/result retention and cited unlanded decision/retention integration, Jared's cutoff choice, native receipt/transaction/flush/crash/backup/GUI/race evidence. The original dedup survivor/disposition question stays open.

## Evidence

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/check11.json` — SHA-256 `0980fbb06a945e7d74c3fbc9f111e94b25f4a4005f03595cb0bd0e41e043768f`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/checker-summary.json` — SHA-256 `45fd02e4741c405f22fba34e42ef3ee5b5b895eae5fc38813520556e4b02e6aa`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/independent-probes.json` — SHA-256 `8faf23d47c629d4460d848866be85bbb48069f50aebc3c4ff514188763a2f6a6`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/restored-defects.json` — SHA-256 `347de583baba36240adbc3e1b36432e7528fbf1dd3889523ea06939d4176098a`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/scope-preservation.json` — SHA-256 `9decc18bc3bc8ea8abce941c9e9258e0760cbfaa10e0137d014bbf121743dc82`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/regrade-validation.json` — SHA-256 `390657dafadd7149a439b033e7116fad861196fe00e3ff93a9987de0f5652111`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/currentness-copy.json` — SHA-256 `bd97b1839000f89f22e7760affc41fc37fb11fb1d07382b3b8e7aa4595f8e8d1`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/shard-check.json` — SHA-256 `a471f4cd29bb5aeac3bf0eb27f14f6ee4baeec39bd3cb3a866aea09768adca69`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/index-validate.json` — SHA-256 `dfc2d23e60931bb1bbc4c954053981ee1d286f0b12b7db7f94b4ec3aa6f0b143`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/index-baseline-equivalence.json` — SHA-256 `457c201b8dab9d2ae4784d87f61c52b8c99bcd5afd58972c6cba416c58f631a4`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix7/verification-summary.json` — SHA-256 `ea558f0910566aaf7644b0bbf30c4ab8f4d97f3337578dfd06290c872cade965`.

Complete ids and complements are in check11.json; the committed compact table pins their counts, examples and id-list hashes. Final source/checker/evidence files are pinned by evidence-sha256.json. Report and self-grade copies are in the parent drafts/DMEM directory. The worktree is removed after both source and report commits are pushed.

---

Earlier source-pinned reports follow as lineage; the cutoff proposal is unchanged.

# DMEM fix round 6 — technical round 1 of 2

Branch: `plans/ea-w2-memory-maintenance-20261104`. Source head: `a997e62c4bb70ae858e9c7eee78cb8efc6018f94`. Reviewed base: `b50da70b3d7d4e382717c12135ccff26c8230c05`. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DMEM-sol/REVIEW-cycle5.md`.

This section supersedes earlier worker oracle grades and check-11 claims. **Twelve families prepared without admission**, pending independent review. No cutoff value is selected. The first-start gate, withdrawal fence choice, every `failed_terminal_saved` snapshot, Card 1b application and report-only cutoff proposal below are preserved. Retention remains PARTIAL; membership ABSENT; native execution NOT_RUN.

## Review round 6: findings and responses

- **B1 — fixed (`a997e62c4bb70ae858e9c7eee78cb8efc6018f94`). Where:** `scripts/pm_memory_guard_isolation.py:55`, archive fixture `family-rehashed` replacements. **Cause:** foreign starts omitted cutoff/month fields, and the proxy suppressed their required-field failures. **Fix:** derive each replacement from its own valid archive start, keep every own structural field, change the family and all derived family/identity/command/schema copies, and rehash. The proxy now removes only the named duplicate event/command constants. All sixteen complete-writer paths refuse normally, accept with binding plus those constants removed, and refuse after restoration; zero required-field errors are bypassed. Verify `b1-surgical.py` and the complete guard table.
- **B2 — fixed (`a997e62c4bb70ae858e9c7eee78cb8efc6018f94`). Where:** `scripts/pm_memory_maintenance_events.py:736`, `Plans/memory_canonical_history_fixtures.json`, both complete checkers. **Cause:** reduced phase-model equality could not admit complete retained EventRecords. **Fix:** the canonical history boundary validates full retained records against a resolved frozen write-time operation, through the same original-start custody rule. It selects the exact 2.0.0 or frozen 1.0.0 envelope-reader schema and accepts valid historical replay policy independently of current writers. All 1,104 cases run through the full checkers: authentic ordinary/replay-only/compatibility/compatibility-replay history survives arbitrary live operation, source, request, selector, counter, admission and cutoff changes; missing custody, malformed envelopes/bodies, forged/rehashed foreign values, access revocation and withdrawal refuse unchanged. Twenty-four independently corrupted positive/negative oracle expectations each exit 1.
- **B3 — fixed (`a997e62c4bb70ae858e9c7eee78cb8efc6018f94`). Where:** `scripts/pm_memory_archive_events.py:93`, SP-638/SP-639/CV-658/CV-659. **Cause:** the resolver lookup key was never joined to its returned record's own ref. **Fix:** lookup key = resolved self-ref = frozen operation ref, with no duplicate alias record; recomputed content hash and scope/job/Project agree with the operation and copied payloads. Each of four coherently rehashed contradictions first passes operation and original-start controls, then refuses the full settle entry point. Four duplicate-reference negatives independently refuse. Missing cutoffs still keep every current route unavailable under DL-403. No cutoff values are chosen.
- **Finding 4 — fixed (`a997e62c4bb70ae858e9c7eee78cb8efc6018f94`). Where:** `scripts/pm_memory_archive_events.py:138`. **Cause:** evidence/version and archived checks omitted the rest of a selected original. **Fix:** `selected_fields_preserved`, together with the independent evidence/version guards, compares the entire original except its permitted archived change. Twelve isolated kind/pinned/extra-field rewrites refuse; each flips only when its own preservation guard is removed.
- **Finding 5 — fixed (`a997e62c4bb70ae858e9c7eee78cb8efc6018f94`). Where:** ATS-315/ATS-316. **Cause:** an old hold sentence contradicted the four conditional payload definitions. **Fix:** route those families to ATS-316 and state their remaining admission, operation/result-retention and cutoff activation holds explicitly.
- **Finding 6 / Astra item 10 — fixed (`a997e62c4bb70ae858e9c7eee78cb8efc6018f94`). Where:** `scripts/pm_memory_maintenance_events.py:56` and all twelve oracles. **Cause:** compact JSON spelled equal integer-valued numbers differently. **Fix:** every synthetic hash recipe recursively canonicalizes mathematical integers; `1`, `1.0`, parsed `1e0` hash as `1`, and `-0` as `0`. Fractional/nonfinite numbers are refused and `01` fails JSON parsing. Sixty current-writer spelling probes and per-family historical spelling/forged-commitment cases run in the complete checkers. The number-rejection guard has its own removal row; no numeric payload or cutoff is invented.

No finding is disputed or stopped for a new Jared decision.

## Family grades before and after

Before is the independent cycle-5 review. P/Q/A = PASS/PARTIAL/ABSENT; only each family's oracle cell changes PARTIAL → PASS. These are static preparation grades.

| Exact family | Before P/Q/A | After P/Q/A |
|---|---:|---:|
| `memory.dedup_sweep.completed` | 9/2/1 | 10/1/1 |
| `memory.dedup_sweep.started` | 9/2/1 | 10/1/1 |
| `memory.index.lexical.rebuild.completed` | 9/2/1 | 10/1/1 |
| `memory.index.lexical.rebuild.started` | 9/2/1 | 10/1/1 |
| `memory.index.semantic.rebuild.completed` | 9/2/1 | 10/1/1 |
| `memory.index.semantic.rebuild.started` | 9/2/1 | 10/1/1 |
| `memory.monthly_summary.completed` | 9/2/1 | 10/1/1 |
| `memory.monthly_summary.started` | 9/2/1 | 10/1/1 |
| `memory.prune_archive.completed` | 9/2/1 | 10/1/1 |
| `memory.prune_archive.started` | 9/2/1 | 10/1/1 |
| `memory.verification_sweep.completed` | 9/2/1 | 10/1/1 |
| `memory.verification_sweep.started` | 9/2/1 | 10/1/1 |

Totals: **108 PASS / 24 PARTIAL / 12 ABSENT → 120 PASS / 12 PARTIAL / 12 ABSENT**. All 480 self-grade/disposition citations are exact and re-located at the source head.

## Complete guard table

**111 rows; 15,502 negative cases; 842,854 row/case evaluations.** Each case has an intact positive control. For each row, remove only its named predicate or explicit duplicate set, execute the complete checker corpus, require every own negative to pass and every other negative to preserve its exact refusal, restore, and recheck the own negatives. No required-field check is suppressed, and no input, receipt, hash, copy or post-state is repaired during evaluation.

The archive `semantic_binding` duplicate set is: caller envelope/payload semantic joins, retained-value binding, and only the repeated event_type/command_id constants at the start-custody payload-schema boundary. Required fields, shape, digest, full flush, cutoff, phase, access, withdrawal and replay restrictions stay enabled. Replay-policy removal also removes its repeated semantic equality; outcome removal also removes the matching schema status enum; envelope-schema removal covers the selected current or frozen compatibility schema. Other repeated sites implement the same named invariant. `DMEM-check11-guards.json` names these sites and pins the full ids/complements.

Presence and withdrawal witnesses use the actual common custody gate, with no fabricated absent bytes. All other custody and canonical-history witnesses execute their complete model entry point. Schema, size, reference and unsupported-number witnesses use their actual predicate endpoints. Physical custody/authentication, atomicity and races remain native NOT_RUN.

### maintenance checker

Corpus: 10,252 negatives.

| Guard or named duplicate set | Flip | Stay rejected | Restored |
|---|---:|---:|---|
| `action` | 8 | 10,244 | yes |
| `admission` | 16 | 10,236 | yes |
| `artifacts` | 4 | 10,248 | yes |
| `boundary_acceptance` | 4 | 10,248 | yes |
| `boundary_payload` | 8 | 10,244 | yes |
| `boundary_receipts` | 12 | 10,240 | yes |
| `boundary_request` | 8 | 10,244 | yes |
| `boundary_scope` | 24 | 10,228 | yes |
| `boundary_snapshot` | 16 | 10,236 | yes |
| `boundary_terminal` | 4 | 10,248 | yes |
| `checkpoint_event` | 8 | 10,244 | yes |
| `checkpoint_key` | 8 | 10,244 | yes |
| `checkpoint_storage` | 8 | 10,244 | yes |
| `commitment_numbers` | 24 | 10,228 | yes |
| `custody_binding` | 4,726 | 5,526 | yes |
| `custody_digest` | 1,054 | 9,198 | yes |
| `custody_flush` | 958 | 9,294 | yes |
| `custody_presence` | 934 | 9,318 | yes |
| `custody_shape` | 958 | 9,294 | yes |
| `effect_count` | 4 | 10,248 | yes |
| `effect_once` | 16 | 10,236 | yes |
| `envelope_schema` | 40 | 10,212 | yes |
| `history_event` | 40 | 10,212 | yes |
| `inline_cap` | 8 | 10,244 | yes |
| `json_number_grammar` | 32 | 10,220 | yes |
| `operation_cas` | 8 | 10,244 | yes |
| `operation_receipt` | 8 | 10,244 | yes |
| `operation_result_digest` | 8 | 10,244 | yes |
| `operation_result_ref` | 8 | 10,244 | yes |
| `operation_schema` | 8 | 10,244 | yes |
| `original_input` | 8 | 10,244 | yes |
| `outcome` | 8 | 10,244 | yes |
| `partition` | 8 | 10,244 | yes |
| `payload_schema` | 40 | 10,212 | yes |
| `permission_or_withdrawal` | 1,098 | 9,154 | yes |
| `phase` | 8 | 10,244 | yes |
| `prior_selector` | 4 | 10,248 | yes |
| `producer_join` | 40 | 10,212 | yes |
| `references_resolve` | 8 | 10,244 | yes |
| `replay_policy` | 8 | 10,244 | yes |
| `request` | 8 | 10,244 | yes |
| `selected_target` | 4 | 10,248 | yes |
| `selector_cas` | 4 | 10,248 | yes |
| `selector_schema` | 4 | 10,248 | yes |
| `selector_scope` | 4 | 10,248 | yes |
| `source` | 8 | 10,244 | yes |
| `target_identity` | 4 | 10,248 | yes |
| `target_manifest` | 4 | 10,248 | yes |
| `target_order` | 4 | 10,248 | yes |
| `target_schema` | 4 | 10,248 | yes |
| `target_source` | 4 | 10,248 | yes |
| `terminal_custody` | 8 | 10,244 | yes |

### archive checker

Corpus: 5,250 negatives.

| Guard or named duplicate set | Flip | Stay rejected | Restored |
|---|---:|---:|---|
| `action` | 4 | 5,246 | yes |
| `admission` | 12 | 5,238 | yes |
| `boundary_acceptance` | 2 | 5,248 | yes |
| `boundary_payload` | 4 | 5,246 | yes |
| `boundary_receipts` | 6 | 5,244 | yes |
| `boundary_request` | 4 | 5,246 | yes |
| `boundary_scope` | 12 | 5,238 | yes |
| `boundary_snapshot` | 8 | 5,242 | yes |
| `boundary_terminal` | 2 | 5,248 | yes |
| `checkpoint_event` | 4 | 5,246 | yes |
| `checkpoint_key` | 8 | 5,242 | yes |
| `checkpoint_storage` | 8 | 5,242 | yes |
| `commitment_numbers` | 12 | 5,238 | yes |
| `custody_digest` | 824 | 4,426 | yes |
| `custody_flush` | 402 | 4,848 | yes |
| `custody_presence` | 390 | 4,860 | yes |
| `custody_shape` | 398 | 4,852 | yes |
| `cutoff_commitment` | 4 | 5,246 | yes |
| `cutoff_record` | 4 | 5,246 | yes |
| `cutoff_reference` | 4 | 5,246 | yes |
| `cutoff_scope` | 8 | 5,242 | yes |
| `cutoff_unique` | 4 | 5,246 | yes |
| `cutoffs_unavailable` | 328 | 4,922 | yes |
| `effect_once` | 12 | 5,238 | yes |
| `envelope_schema` | 24 | 5,226 | yes |
| `evidence_preserved` | 4 | 5,246 | yes |
| `history_event` | 20 | 5,230 | yes |
| `inline_cap` | 4 | 5,246 | yes |
| `json_number_grammar` | 16 | 5,234 | yes |
| `no_extra_memories` | 4 | 5,246 | yes |
| `no_prune_summary` | 2 | 5,248 | yes |
| `operation_cas` | 8 | 5,242 | yes |
| `operation_receipt` | 4 | 5,246 | yes |
| `operation_result_digest` | 4 | 5,246 | yes |
| `operation_result_ref` | 4 | 5,246 | yes |
| `operation_schema` | 8 | 5,242 | yes |
| `original_input` | 4 | 5,246 | yes |
| `originals_preserved` | 4 | 5,246 | yes |
| `outcome` | 4 | 5,246 | yes |
| `partition` | 8 | 5,242 | yes |
| `payload_schema` | 98 | 5,152 | yes |
| `permission_or_withdrawal` | 484 | 4,766 | yes |
| `phase` | 4 | 5,246 | yes |
| `pins_preserved` | 4 | 5,246 | yes |
| `references_resolve` | 8 | 5,242 | yes |
| `replay_policy` | 8 | 5,242 | yes |
| `request` | 8 | 5,242 | yes |
| `selected_archived` | 4 | 5,246 | yes |
| `selected_fields_preserved` | 12 | 5,238 | yes |
| `selection_exists` | 4 | 5,246 | yes |
| `selection_kind` | 2 | 5,248 | yes |
| `selection_pinned` | 4 | 5,246 | yes |
| `selection_unique` | 4 | 5,246 | yes |
| `semantic_binding` | 1,994 | 3,256 | yes |
| `source` | 8 | 5,242 | yes |
| `summary_provenance` | 2 | 5,248 | yes |
| `terminal_custody` | 8 | 5,242 | yes |
| `unselected_preserved` | 4 | 5,246 | yes |
| `versions_preserved` | 4 | 5,246 | yes |

## All eleven standing checks

| Check | Static evidence and limit |
|---|---|
| 1 Replay | Every family retains fresh/retry replay-only writer refusals. Historical replay-only acceptance is a separate reader boundary. |
| 2 Application keys | Project-only editions refuse exact CV-366 Application attempts; no Application writer or invented bucket. |
| 3 Partitions | Encoded `project~` positives; raw, foreign and padded partitions refuse. |
| 4 Size | All twelve complete payload bounds are 2,734–5,002 MessagePack bytes; oversized whole payloads and separate operation values refuse. SP-337 remains the route for separately declared larger bodies. |
| 5 LF | Existing exact-length/full-input schema guards and per-family LF negatives remain; no schema or registry mirror is weakened. |
| 6 Retry | Thirty-six independent caller-only sequence/observed/persisted changes return the unmodified retained source; semantic changes conflict. Source-record authenticity remains native NOT_RUN. |
| 7 Checkpoints | Actual fixture storage UUIDs join positively; foreign storage/key/event identity refuses. No native inclusion/cursor proof is claimed. |
| 8 Failure exits | Twenty-four positive/negative canonical-history expectation mutations and twelve dormant-operation schema mutations exit 1. In-process events have no subprocess-success payload field. |
| 9 Refs | Eager offline resolution includes every schema branch, frozen compatibility definition and own registry mirrors. Twelve complete-process dormant mutations refuse. |
| 10 History | 1,104 full-record cases across all twelve families plus preserved reduced-model history; compatibility and live-state independence pass, forged/foreign/withdrawn cases refuse. |
| 11 Isolation | The complete table above passes; B1's sixteen cases independently pass the surgical witness without required-field suppression. |

## All ten Astra defect classes

The separate own-mutation audit has 316 observations across every exact family; the full checker/table supplies the wider corpus. This is static evidence, not physical Storage authentication.

| Class | Probe and disposition |
|---|---|
| 1 Forged/contradictory inputs | Rehashed forged event identities refuse per family. B3 self-ref and duplicate-ref mutations refuse at full entry points with intact operation and custody controls. |
| 2 Payload-supplied Storage metadata | Change only caller sequence/timestamps; the exact unmodified resolved source is returned in 36/36 probes. The model does not authenticate physical receipts. |
| 3 Historical readers | Ordinary, replay-only and both compatibility modes survive unrelated live state. Each mode also rejects forged/foreign/withdrawn values and missing start custody. |
| 4 One field read two ways | Integer-for-hex, uppercase, whitespace and trailing LF are refused. Numeric spelling is separately normalized below. |
| 5 Dormant refs | Per-family operation branches with unvisited dangling refs fail the eager walk and all twelve complete processes exit 1. |
| 6 Partial sizes / inline prose | Measure the whole encoded payload and separate operation value. Bounds remain below 16 KiB; no payload_ref-null rule is replaced or contradicted. |
| 7 Custody on every path | Preserved twelve-family matrices cover phases, retries, replay, recovery and writers; new full canonical history uses the same gate. Direct succeeded/failed terminal advances with missing starts refuse. |
| 8 Masked negatives | Whole-corpus removal/restoration and the surgical B1 witness pass. The table caught and repaired an initially masked new foreign-read fixture by supplying its intact lookup record; no guard was weakened. Producer/actor binding is factored separately from general custody binding. Canonical-reader probe ids are namespaced from the existing archive corpus, and duplicate ids fail before evaluation. |
| 9 Inflated grades | Oracle upgrades use executed full-reader, guard and failure-exit evidence; membership/retention/native limitations remain explicit. |
| 10 Numeric spellings | Nested digest recipes and current writer/history probes cover 1, 1.0, 1e0, -0 and invalid 01. Equal values commit once; spelling-sensitive forged hashes, fractional and nonfinite numbers refuse. |

## Checks, preservation and remaining boundaries

| Command / audit | Exit / result |
|---|---|
| `python3 scripts/pm_memory_maintenance_events.py` | 0 / pass, all prior suites plus 736 canonical-history and 40 numeric-writer cases |
| `python3 scripts/pm_memory_archive_events.py` | 0 / pass, all prior suites plus 368 canonical-history, 20 numeric-writer cases and new cutoff/preservation cases |
| `python3 scripts/pm_memory_guard_isolation.py --out <external-path>` | 0 / complete table above |
| Surgical B1 audit | 0 / 16 baseline refusals, 16 binding/const-only flips, 16 restored refusals |
| Full-checker positive/negative expectation mutations | 0 audit / 24 processes exit 1 |
| Full-checker dormant-operation mutations | 0 audit / 12 processes exit 1 |
| Own Astra-class mutations | 0 / 316 observations pass |
| Shared codec unit suite | 0 / 14 tests pass |
| Shard generate/check; index generate/validate | 0 / every top-level status pass; failures empty |
| Currentness input copy | 15/15 SHA-256 matches before index generation |
| Scope/preservation audit | 0 / 50 assertions; all older states, traces, writers, schemas, contracts and registry rows preserved |

Only the three edited owner documents have regenerated shards; index outputs are regenerated normally, including generated clocks. No admission, registry append, Decision Log edit, .gitignore, tests edit, Spec Lock, auto-decisions, governance reseal or main push. No mail, subagent, browser or server. No new consumer, command, checkpoint, scope or retention binding.

**IDs:** no new ids. Edited existing SP-638, SP-639, CV-658, CV-659, ATS-315 and ATS-316. Existing AMS-100–107, SP-630–637 and CV-650–657 remain owner/adoption references. Unused reservations stay unused.

**Remaining:** independent review; per-family admission; operation/result and other pending retention; the existing unlanded decision/retention dependencies; Jared's cutoff choice; native receipt/transaction/flush/crash/backup/GUI/race proof. The DL-403 jobs remain unavailable. The original eight's separate survivor/disposition question is not answered.

## Evidence

- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/check11.json` — SHA-256 `9e1ad6df7b81a5f8593dcec670e2f8442f521f2ff827b4c09d6115d805b579c2`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/b1-surgical.json` — SHA-256 `89707f09075174b377d45126e178a2eb5af170b0156a2cf158928a4c0455967d`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/astra-classes.json` — SHA-256 `108e10f78a173d9cd224d8b52250e2186ee491471d9ebc3058375748b24e57c2`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/full-checker-oracles.json` — SHA-256 `0c7e1ce64412f02733956bcdb1a27a3b5bcb0acc003f8e0cece4da6174a30dcb`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/dormant-full-process.json` — SHA-256 `049198decfb6d0d4d5197ade311d430c88d678d8d54dafea4ebaa5861a70ac32`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/maintenance.json` — SHA-256 `589792505044e78e34954e907760ccf4096a8f76b3715dc45cad1e5fe6e9d3ac`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/archive.json` — SHA-256 `655b5538028ab8f3c045bebe462d4fb6fc07f0c4bbb00d5b2f7909fb5c31decb`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/scope-audit.json` — SHA-256 `7c9b4f88de4e259cb8c25e43eb32cd4c64d5b21870d343e27a77cfa1c1058679`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/regrade-validation.json` — SHA-256 `2b84115d16a8d8705ec728d86a2a06f8c114d0a46154f6b2718c9027c6189a2b`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/checked-inputs.json` — SHA-256 `d02ec3fa4d3376c394632009bd96669daf5f3eeedb1cf8a43ba3e844b2c2799c`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/shard-check.json` — SHA-256 `a471f4cd29bb5aeac3bf0eb27f14f6ee4baeec39bd3cb3a866aea09768adca69`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/index-validate.json` — SHA-256 `b4b21bdb80f52bd611baad2179763184c85d7d6ee329e9c1d3e550661eb3553c`.

Audit scripts and remaining command outputs are pinned by `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix6/evidence-sha256.json`, SHA-256 `7f8aeb3c61439960289399a9931164bd658a9b53e201dae2b145e0c9fb8b3479`.

Report/self-grade copies are in `drafts/DMEM/`. The task worktree is removed after the branch and final report are pushed.

---

Earlier source-pinned reports follow as lineage; their cutoff proposal is unchanged.

# DMEM fix round 5 — standing check 11

Branch: `plans/ea-w2-memory-maintenance-20261104`. Source head: `5e1512a7da88d62a760e00f51d86cfbf637efa67`. Base: `bc4f6fef9f1d90bd469824b16eb863e7f19281b5`. Review: Sol cycle 4 at `dc4c46c58c7462f288684a6e672febdf134e3c89`.

This section supersedes the earlier worker check-11 claims and oracle grades below. It repairs B3 across the original eight families and extends the same proof to all four Card 1b families. All other review dispositions hold. The withdrawal fence, every `failed_terminal_saved` snapshot and the cutoff proposal are preserved.

## Review round 5: findings and responses

**B3 — fixed in `5e1512a7da88d62a760e00f51d86cfbf637efa67`. Where:** `Plans/memory_maintenance_event_fixtures.json:86846`, `Plans/memory_archive_event_fixtures.json:10016`, `scripts/pm_memory_maintenance_events.py:448`, and `scripts/pm_memory_guard_isolation.py:524`. **Cause:** one changed retained operation/body left an old commitment, so value binding and integrity failed independently. The Card 1b matrix also held the same compound prototype. **Fix:** start from an intact record, change one semantic value, update every affected operation identity/correlation/envelope copy, and recompute its commitment. Source, operation, storage identity, foreign started family and frozen time now have coherent retained records. A digest negative changes only its digest. The foreign-family witness uses a complete schema-valid start rather than an incomplete terminal body. Standalone changed-start-value retries now carry a fresh digest. Checkpoint storage negatives now keep an intact valid retained checkpoint and rebind the foreign operation, event identities, result commitments and lookup key coherently; key-only negatives use a valid foreign UUID key. ATS-315 describes the repaired inputs and executable proof.

**Verification:** the reviewer’s own terminal-advance witness now accepts in 8/8 families when only value binding is removed, refuses in 8/8 when only digest is removed, and refuses with both enabled. All twelve deliberately restored compound negatives are detected by the isolation oracle. The 400 earlier-finding probes still pass. Equivalent predicate factoring preserves all six original model suites and all 224 boundary outcomes against the pre-fix checker; schemas, contracts, registry rows, states and the withdrawal owner text are unchanged.

**Cycle-4 note 2 — accounted for. Where:** the four index JSON outputs with `generated_at_utc`. **Cause:** the existing generator writes the clock. **Handling:** normal regeneration is committed, including its timestamp changes; no all-byte-equality or hash-restamping claim. Only the edited Automated Testing owner has changed shards.

## Family grades at this source head

P/Q/A = PASS / PARTIAL / ABSENT. The first eight “before” grades are the independent cycle-4 verdict. The four Card 1b “before” grades are the existing worker grades, which had no independent cycle-4 verdict. Their oracle cells remain PASS after obtaining the new granular proof. Membership stays ABSENT, retention PARTIAL, native execution NOT_RUN. No admission or cutoff is selected.

| Exact family | Before P/Q/A | After P/Q/A |
|---|---:|---:|
| `memory.dedup_sweep.completed` | 9/2/1 (review) | 10/1/1 |
| `memory.dedup_sweep.started` | 9/2/1 (review) | 10/1/1 |
| `memory.index.lexical.rebuild.completed` | 9/2/1 (review) | 10/1/1 |
| `memory.index.lexical.rebuild.started` | 9/2/1 (review) | 10/1/1 |
| `memory.index.semantic.rebuild.completed` | 9/2/1 (review) | 10/1/1 |
| `memory.index.semantic.rebuild.started` | 9/2/1 (review) | 10/1/1 |
| `memory.monthly_summary.completed` | 10/1/1 (worker) | 10/1/1 |
| `memory.monthly_summary.started` | 10/1/1 (worker) | 10/1/1 |
| `memory.prune_archive.completed` | 10/1/1 (worker) | 10/1/1 |
| `memory.prune_archive.started` | 10/1/1 (worker) | 10/1/1 |
| `memory.verification_sweep.completed` | 9/2/1 (review) | 10/1/1 |
| `memory.verification_sweep.started` | 9/2/1 (review) | 10/1/1 |

Totals: **112 PASS / 20 PARTIAL / 12 ABSENT → 120 PASS / 12 PARTIAL / 12 ABSENT**. All 416 source quotations were located again and checked at the source head.

## Guard-removal proof

**13,062 custody matrix cells; 14,534 negatives in the combined checker corpora.** Every negative has an intact positive control. Each row removes only its named logical predicate across repeated sites, executes the entire corpus for that checker, requires its own negatives to accept, requires every other negative to retain its exact refusal, and restores the predicate. The table records 104 guard removals and 746,356 mutation/case evaluations.

Integrity, full flush, closed record fields, absence and semantic-value binding remain separate. In the archive checker, `semantic_binding` names the equivalent caller/retained producer and payload comparisons; the same full semantic value is checked at admission, retained custody and retry. These repeated value comparisons are removed together while digest, flush, shape, schema, replay, permission, cutoff, phase and CAS checks remain enabled. Normal refusal codes are preserved. The old whole-start-gate no-op was removed from the archive audit.

Missing-byte and withdrawal probes call the actual shared custody gate: a reader cannot return absent bytes, and the audit fabricates none. The other custody probes use the complete phase, canonical writer, boundary or history entry point. Schema and primitive witnesses call their actual predicate endpoints. This proves the static contract model; physical custody and atomicity remain native NOT_RUN.

“Flip” and “stay” below are counts of exact case ids. The full lists for every row, including every complement and restoration result, are in the SHA-pinned external `check11.json`; the compact committed `DMEM-check11-guards.json` records examples and list hashes.

### maintenance checker

Corpus: 9,620 negatives.

| Guard removed | Negatives that flip | Negatives that stay rejected |
|---|---:|---:|
| `action` | 8 | 9,612 |
| `admission` | 16 | 9,604 |
| `artifacts` | 4 | 9,616 |
| `boundary_acceptance` | 4 | 9,616 |
| `boundary_payload` | 8 | 9,612 |
| `boundary_receipts` | 12 | 9,608 |
| `boundary_request` | 8 | 9,612 |
| `boundary_scope` | 24 | 9,596 |
| `boundary_snapshot` | 16 | 9,604 |
| `boundary_terminal` | 4 | 9,616 |
| `checkpoint_event` | 8 | 9,612 |
| `checkpoint_key` | 8 | 9,612 |
| `checkpoint_storage` | 8 | 9,612 |
| `custody_binding` | 4,630 | 4,990 |
| `custody_digest` | 926 | 8,694 |
| `custody_flush` | 926 | 8,694 |
| `custody_presence` | 902 | 8,718 |
| `custody_shape` | 926 | 8,694 |
| `effect_count` | 4 | 9,616 |
| `effect_once` | 16 | 9,604 |
| `envelope_schema` | 8 | 9,612 |
| `history_event` | 8 | 9,612 |
| `inline_cap` | 8 | 9,612 |
| `operation_cas` | 8 | 9,612 |
| `operation_receipt` | 8 | 9,612 |
| `operation_result_digest` | 8 | 9,612 |
| `operation_result_ref` | 8 | 9,612 |
| `operation_schema` | 8 | 9,612 |
| `original_input` | 8 | 9,612 |
| `outcome` | 8 | 9,612 |
| `partition` | 8 | 9,612 |
| `payload_schema` | 8 | 9,612 |
| `permission_or_withdrawal` | 970 | 8,650 |
| `phase` | 8 | 9,612 |
| `prior_selector` | 4 | 9,616 |
| `producer_join` | 8 | 9,612 |
| `references_resolve` | 8 | 9,612 |
| `replay_policy` | 8 | 9,612 |
| `request` | 8 | 9,612 |
| `selected_target` | 4 | 9,616 |
| `selector_cas` | 4 | 9,616 |
| `selector_schema` | 4 | 9,616 |
| `selector_scope` | 4 | 9,616 |
| `source` | 8 | 9,612 |
| `target_identity` | 4 | 9,616 |
| `target_manifest` | 4 | 9,616 |
| `target_order` | 4 | 9,616 |
| `target_schema` | 4 | 9,616 |
| `target_source` | 4 | 9,616 |
| `terminal_custody` | 8 | 9,612 |

### archive checker

Corpus: 4,914 negatives.

| Guard removed | Negatives that flip | Negatives that stay rejected |
|---|---:|---:|
| `action` | 4 | 4,910 |
| `admission` | 12 | 4,902 |
| `boundary_acceptance` | 2 | 4,912 |
| `boundary_payload` | 4 | 4,910 |
| `boundary_receipts` | 6 | 4,908 |
| `boundary_request` | 4 | 4,910 |
| `boundary_scope` | 12 | 4,902 |
| `boundary_snapshot` | 8 | 4,906 |
| `boundary_terminal` | 2 | 4,912 |
| `checkpoint_event` | 4 | 4,910 |
| `checkpoint_key` | 8 | 4,906 |
| `checkpoint_storage` | 8 | 4,906 |
| `custody_digest` | 760 | 4,154 |
| `custody_flush` | 386 | 4,528 |
| `custody_presence` | 374 | 4,540 |
| `custody_shape` | 382 | 4,532 |
| `cutoff_commitment` | 4 | 4,910 |
| `cutoff_record` | 4 | 4,910 |
| `cutoff_scope` | 8 | 4,906 |
| `cutoffs_unavailable` | 328 | 4,586 |
| `effect_once` | 12 | 4,902 |
| `envelope_schema` | 8 | 4,906 |
| `evidence_preserved` | 4 | 4,910 |
| `history_event` | 4 | 4,910 |
| `inline_cap` | 4 | 4,910 |
| `no_extra_memories` | 4 | 4,910 |
| `no_prune_summary` | 2 | 4,912 |
| `operation_cas` | 8 | 4,906 |
| `operation_receipt` | 4 | 4,910 |
| `operation_result_digest` | 4 | 4,910 |
| `operation_result_ref` | 4 | 4,910 |
| `operation_schema` | 8 | 4,906 |
| `original_input` | 4 | 4,910 |
| `originals_preserved` | 4 | 4,910 |
| `outcome` | 4 | 4,910 |
| `partition` | 8 | 4,906 |
| `payload_schema` | 82 | 4,832 |
| `permission_or_withdrawal` | 420 | 4,494 |
| `phase` | 4 | 4,910 |
| `pins_preserved` | 4 | 4,910 |
| `references_resolve` | 8 | 4,906 |
| `replay_policy` | 8 | 4,906 |
| `request` | 8 | 4,906 |
| `selected_archived` | 4 | 4,910 |
| `selection_exists` | 4 | 4,910 |
| `selection_kind` | 2 | 4,912 |
| `selection_pinned` | 4 | 4,910 |
| `selection_unique` | 4 | 4,910 |
| `semantic_binding` | 1,930 | 2,984 |
| `source` | 8 | 4,906 |
| `summary_provenance` | 2 | 4,912 |
| `terminal_custody` | 8 | 4,906 |
| `unselected_preserved` | 4 | 4,910 |
| `versions_preserved` | 4 | 4,910 |

## Checks and preserved boundaries

| Check | Exit / result |
|---|---|
| `python3 scripts/pm_memory_guard_isolation.py --out <evidence-path>` | 0 / pass; complete table above |
| `python3 scripts/pm_memory_maintenance_events.py` | 0 / pass; all existing eight-family oracles |
| `python3 scripts/pm_memory_archive_events.py` | 0 / pass; four-family archive/cutoff/reader oracles and granular guard corpus |
| Cycle-4 reviewer isolation witness | 0 / binding alone flips 8/8; digest alone flips 0/8; failed snapshots still exactly reachable |
| Prior findings | 0 / 400 of 400 pass |
| Restored compound controls | 0 audit / all 12 defective coverage claims detected |
| Pre-fix/new checker equivalence | 0 / six full model suites and 224 boundaries equal |
| Shard generate/check; index generate/validate | 0 / every parsed top-level status is pass; no failures |
| Currentness edition | 15 of 15 SHA-256 matches before generation |
| Regrade | 0 / every quotation exact, at most 200 characters |

**Scope:** fixtures, equivalent named predicates, executable isolation audit, ATS-315, its generated shards/index and this report/self-grade. No schema, contract, registry, admission, Decision Log, cutoff, withdrawal protocol, storage owner, test file, Spec Lock, governance evidence or auto-decision is changed. No main push or landing. No new consumer/identity/checkpoint binding. The branch remains prepared without admission. Retention, native proof, the pending cutoff choice and independent review remain open as before.

**IDs used:** no new PlanUnit ids. Existing `ATS-315` is updated; `ATS-316`, `AMS-100–107`, `SP-630–639`, and `CV-650–659` remain the existing twelve-family owner/adoption ids.

## Evidence

Raw evidence: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix5`. Manifest: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix5/evidence-sha256.json`, SHA-256 `26d92413b374185c7e96562dd1b555cc7dc2823a0f7ba4da39b14c7cb0e3ac48`.

- Complete guard ids/complements: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix5/check11.json`, SHA-256 `b4bda65b2464b301eb5c24e241f991dcfdb86cb85e6236d7ac77d50bb83a191d`.
- Prior findings: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix5/prior-findings.json`, SHA-256 `33c7b31e763174c9d0f02acd8a8b45af6c1629457b4a302c56627fb6e8edb693`.
- Reviewer witness: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix5/isolation-witness.json`, SHA-256 `85d8ebf9d3392d758ee73459acd57597e29131b3ad606da06990f9c380c84e5a`.
- Equivalence: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix5/equivalence.json`, SHA-256 `332f188ca468eb6f5f623bf21d18987c9c0bd7cdefb4e91bf7f9686e00b6f2a3`.
- Restored compound controls: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix5/compound-controls.json`, SHA-256 `632e149ed9e307f206a577c305244d741722ea517ba3561044650d4b158e6076`.

Report and self-grade copies are in the parent `drafts/DMEM/` directory. The task worktree is removed after the final report push.

---

The earlier source-pinned report follows as lineage. Its cutoff proposal is unchanged.

# DMEM fix round 4 — 2026-11-04

Branch: `plans/ea-w2-memory-maintenance-20261104`. Assessed source head: `e850f298670855b745b0cfe6ee75acd3cf3518f8`. Reviewed head: `009027140a5c3ecab7df7d22214b78a92b7a4ae8` (Astra round 2). Gate redesign: `74995bb921`. Standing check 9: `e850f29867`. This report and the self-grade are a report-only follow-up; the source pin is exact. Earlier reports remain in Git history.

The program lead allowed one extra round: redesign the start-custody gate that failed three times (Astra round 1 B3, Sol cycle 3 B4, Astra round 2 B1) and fix Astra round 2 B2. Nothing else was changed.

## Outcome and family grades

**Worker result: 8/8 prepared**, up from Astra round 2's 0/8, pending independent review. Only the eight `positive_negative_oracles` cells change (PARTIAL → PASS). Membership stays ABSENT and retention PARTIAL. Native execution stays NOT_RUN. The four monthly-summary and prune/archive families stay held and ungraded; their contract rows are byte-identical.

| Exact family | Before P/Q/A | After P/Q/A |
|---|---|---|
| `memory.dedup_sweep.completed` | 9/2/1 | 10/1/1 |
| `memory.dedup_sweep.started` | 9/2/1 | 10/1/1 |
| `memory.index.lexical.rebuild.completed` | 9/2/1 | 10/1/1 |
| `memory.index.lexical.rebuild.started` | 9/2/1 | 10/1/1 |
| `memory.index.semantic.rebuild.completed` | 9/2/1 | 10/1/1 |
| `memory.index.semantic.rebuild.started` | 9/2/1 | 10/1/1 |
| `memory.verification_sweep.completed` | 9/2/1 | 10/1/1 |
| `memory.verification_sweep.started` | 9/2/1 | 10/1/1 |

Prepared totals move from **72 PASS / 16 PARTIAL / 8 ABSENT** to **80 PASS / 8 PARTIAL / 8 ABSENT**. Including the four preserved held rows, the file holds 84 / 16 / 44. All 392 citations were re-pinned to the source head; every quote is an exact substring of at most 200 characters.

## The start custody gate (one rule)

**Rule.** Every path of a memory-maintenance operation after first start admission must resolve and verify the exact original start record before it appends, CAS-publishes a row or selector, settles an effect, or returns or discloses an original. Paths covered: start-append retry, start-row advance, effect/prepare/swap/settle, terminal append, the effect_committed → completed advance, retry and replay of either original, recovery from every phase, canonical writer append/retry, boundary acceptance and the history reader. The start record is the SP-286/CV-339 retained full-value original of `memory.<op>.started@1.0.0` under the operation's canonical key, read through `resolve_full_value.v1`. Five things are verified:

- **Identity.** `event_id`/`idempotency_key` recompute from the started family's recipe.
- **Digest.** The full-value commitment recomputes.
- **Operation.** Correlation and payload fields equal the operation row.
- **Phase.** The event type is exactly the started type, and the row is `accepted` only before the receipt.
- **Receipt.** It is settled under full flush. The row's `started_event_id` and every later original's causation and `started_event_id` name exactly this record.

There must also be no withdrawal fence on either edition. Missing, corrupted, mismatched or withdrawn custody refuses with `start_receipt_missing` (or `permission_or_withdrawal` under a fence), with no append, CAS, effect or output. The operation stays at its last durable phase and is never reissued. The gate is checked on the prior durable state and again on the tentative result immediately before commit. A path that skips an earlier check, or a path added later, therefore still cannot complete without it. The only relaxation is the started family's first append from an accepted row with no receipt and no later original. Even then a record that is present is verified, and the append must leave a verified record.

**Where it is written.** Each family's own storage unit carries its own "Start custody gate for exactly <family>@1.0.0" paragraph, citing SP-286, CV-339 and its own AMS/CV/SP units (SP-630–SP-637, `Plans/storage-plan.md`). Each writer-boundary paragraph's old patched custody sentence now points to it. The checker asserts each paragraph and its citations exist.

**How it is enforced.**

- **Checker.** `scripts/pm_memory_maintenance_events.py` has one `start_custody_gate`. Every earlier custody check calls it, and it is evaluated again at the commit point of `transition` (all ops except `crash`, which only drops volatile state), `append_current`, `accept` and the new `read_history`.
- **Schemas.** The closed operation schemas already require an exact-format `started_event_id` in every phase after `accepted`, and every completed payload requires it. Round 4 adds null, foreign-identity and trailing-LF start-receipt cases for every later phase of all four operation definitions (42 cases).
- **Cross-document equality.** The retained record's equality with the row cannot be expressed in JSON Schema, so the gate carries it.

## Negative matrix

`start_custody_matrix` in `Plans/memory_maintenance_event_fixtures.json` is fixture-declared. Expected outcomes were written from the rule above, not taken from checker output. **938 paths, each run first as a positive control against its authored after-state and output. 9,248 negative cells. All 9,248 refuse exactly, with unchanged state and no output.**

| Model | Paths | Negative cells | What the paths are |
|---|---:|---:|---|
| Phase model (`transition`) | 616 | 6,088 | Every positive non-crash step of every unedited trace, plus retry and replay of every retained original, recovery from every phase, and both terminal advances (succeeded and failed). Ops covered: append_started, advance_started, prepare, swap, settle, append_completed, advance_completed, retry, replay, recover. |
| Canonical writer (`append_current`) | 76 | 812 | Every positive append/retry step. Started families add retries at started, completed and failed_completed. |
| History reader (`read_history`) | 200 | 2,000 | A read of every retained original in every state. |
| Boundary (`accept`) | 46 | 348 | Every positive boundary case, plus new positives at every later phase. |

**Defect kinds** (each applied to the reduced start record, and separately to the started writer's own canonical start):

- missing
- digest zeroed
- value changed without rehash
- other operation, rehashed
- foreign storage identity, rehashed
- wrong event type, rehashed
- changed payload (frozen time), rehashed
- unflushed receipt
- extra record field
- withdrawal fence

**Expected refusal.** `start_receipt_missing`. The one exception is retry/replay of the started event in the phase model, whose own requested-original check already reports `original_missing` first. A withdrawal fence gives `permission_or_withdrawal`, and the boundary gives `false`. Absence is skipped only for first start admission.

**Per family:**

| Family | Paths | Cells |
|---|---:|---:|
| dedup completed | 96 | 951 |
| dedup started | 98 | 956 |
| lexical completed | 136 | 1,351 |
| lexical started | 139 | 1,366 |
| semantic completed | 136 | 1,351 |
| semantic started | 139 | 1,366 |
| verification completed | 96 | 951 |
| verification started | 98 | 956 |

The checker also requires that each family covers every op, every lawful phase in the phase and reader models, and the writer phases, and that its declared cell count matches.

## Review round 4: findings and responses

### Astra round 2 B1 — fixed (`74995bb921`)

**Where:** `transition(op="advance_completed")` in the checker; SP-630–637.
**Cause:** the effect_committed → completed advance checked terminal custody and CAS but not the start record. Each earlier fix (Astra 1 B3 in `accept`, Sol cycle 3 B4 in `append_current`) patched one path and left this one open.
**Fix:** the one gate above, checked at the commit point of every path, plus an explicit call in `advance_completed`. The new `failed_terminal_saved` state adds the failed-outcome advance.
**Verify:**

- Astra's 64 invalid advances (4 defects × 2 outcomes × 8 families) all refuse `start_receipt_missing` with unchanged state; the 16 intact controls advance (`prior-findings.json`, `astra2-B1`).
- Astra's own harness, rerun at this head, reports `invalid_start_advances_accepted: 0` (was 64).
- Astra's added negative trace now passes the full checker (`custody-negative`).
- Restoring the defect (removing the gate from `advance_completed` and the commit point) makes the full checker exit 1 (`restored/astra2-B1-terminal-advance.py`).

### Astra round 2 B2 — fixed (`e850f29867`)

**Where:** `validator()` and `main()` in the checker.
**Cause:** `check_schema` checks syntax only, and instance validation resolves only the references a fixture reaches. Definitions were also validated outside their own document.
**Fix:** before any instance validation, `require_resolved_references()` walks every subschema of the five schema documents the checker uses and the six registry mirrors. It follows nested `$id` bases, resolves every `$ref`/`$dynamicRef` offline (no retrieval) and fails on any unresolved one. Definitions are now validated inside their own documents.

Each family has eight `reference_cases`:

- dormant missing reference
- active missing reference
- dormant resolving reference
- nested-`$id` base
- cross-document resolving reference
- cross-document missing reference
- unknown document
- dormant missing reference in its operation definition

**Verify:**

- Astra's dormant mutation now exits 1 for all eight families, through both Astra's harness and `fix4-audit.py`.
- Active, nested-base, operation-definition and flipped-expectation mutations also exit 1.
- With the walk removed (`restored/astra2-B2-no-reference-walk.py`), the same dormant mutation exits 0. That control shows the walk is what catches it.

### Earlier findings — rerun at this head

| Finding | Rerun result |
|---|---|
| Sol cycle 1 blocker 1 (target custody) | Prepared target required, unknown target field and wrong target identity rejected for all index definitions. Astra 2 harness: 0 target false accepts. |
| Sol cycle 1 blocker 2 (semantic oracles) | Changed terminal result rejected for all four completed families. Null completed start receipt fails the schema. |
| Astra 1 B1 (replay-only) | 16 replay-only refusals and 224 required-field deletions, all refused exactly. |
| Astra 1 B2 (recovery fences) | 32 denied or withdrawn recoveries refuse, succeeded and failed. Restored defect exits 1. |
| Astra 1 B3 (started boundary) | Four exact reproductions return false. Restored defect exits 1. |
| Sol cycle 3 B4 (terminal writer retry) | 20 missing-start writer retries refuse. Restored defect exits 1. |
| Sol cycle 3 N1 / Astra 2 note (timestamps) | Unchanged qualification: four index JSON files carry `generated_at_utc`. |

The reviewers' harnesses were copied unchanged except for their checkout and output paths, and run at this head:

| Harness | Result at this head |
|---|---|
| Sol cycle 2 `independent-probes.py` | 248/248 |
| Sol cycle 3 `cycle3-probes.py` | 665/673; 8 explained below |
| Fix 3 adapted probes | 665/673; same 8 |
| Fix 3 `prior-findings.py` | 180/180 |
| Sol cycle 1 `review-probes.py` | Exits 1 at its setup row (see below) |
| Astra round 2 `review_probes.py` | 444 direct probes with 0 false accepts; full-checker table below |

**The eight `cycle3-probes.py` failures** are all its `regression:old-states-and-traces` probe. That probe requires exact equality of the whole state map, and round 4 adds one state per family (`failed_terminal_saved`). Every older state and trace is unchanged (`scope-audit.json`), so this is an additive change, not a weakening.

**Sol cycle 1's `review-probes.py`** asserts that the defects exist, using a row shape that has lacked the required `started_occurred_at_utc` since fix round 1. It now exits 1 at that setup assertion. Its two findings are re-expressed at this head in `prior-findings.json` (`cycle1-B1`, `cycle1-B2`: 16/16).

**No finding is disputed, and no cell needs a Jared decision.**

## All ten standing checks

Every row is run through the complete checker, once per family. A corrupted expectation must make the process exit 1 with an AssertionError. Exit 0 fails the audit.

| Exact family | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | Gate |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `memory.dedup_sweep.completed` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.dedup_sweep.started` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.index.lexical.rebuild.completed` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.index.lexical.rebuild.started` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.index.semantic.rebuild.completed` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.index.semantic.rebuild.started` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.verification_sweep.completed` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.verification_sweep.started` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

Each cell is backed by three sources: `fix4-audit.py` (23 full-checker mutations per family, 184 in all), Astra round 2's own harness (13 per family, 104 in all; 96 exit 1, and the 8 `custody-negative` runs exit 0 because the added lost-start trace now passes), and the direct probes. `standing-checks.json` holds every exit code.

| # | Negative that must fail the full checker (each family) | Qualification |
|---|---|---|
| 1 | Fresh and retained-original `projector_replay_only` expected to succeed. | Replay-only is never a current writer policy. |
| 2 | Exact CV-366 Application key expected to succeed. | These contracts are Project-only; no Application writer is introduced. |
| 3 | Raw Project partition expected to succeed. | Positives use `project~cHJvamVjdC0x`. |
| 4 | 17,000-character body expected valid. | Bounded inline roots (2,348–2,649 MessagePack bytes); SP-337 stays authoritative for larger bodies. |
| 5 | Trailing-LF identifier expected valid. | 170 guarded pattern declarations unchanged. |
| 6 | Caller-semantic conflict expected to succeed; Storage-assigned sequence expected in the returned original. | |
| 7 | Foreign checkpoint storage expected to join. | Adopted SP-278 generic identity only. |
| 8 | Denied-permission negative expected to accept. | Checker failure propagation; these events have no process-exit field. |
| 9 | Dormant, active, nested-base and operation-definition missing references; flipped reference-case expectation. | |
| 10 | Withdrawn read expected to return; source-changed read expected to refuse; forged read expected to return. | History reader. |
| Gate | Refusal code flipped, cell count changed, a defect kind dropped, a control's after-state changed. | Astra's lost-start trace must pass (exit 0). |

**Restored defects**, one patched checker copy each under `restored/`. Each must make the suite fail:

| Restored defect (patched copy of this head's checker) | Exit | Where the suite fails |
|---|---:|---|
| Astra 2 B1: no gate in `advance_completed` and no commit point | 1 | Matrix `phase:advance_completed@terminal_appended`, missing start |
| Sol cycle 3 B4: writer gate after the original return, no commit point | 1 | `effect_committed-retry-start-missing` |
| Astra 1 B2: recovery without permission/withdrawal check | 1 | `completed-recovery-permission-refusal` |
| Astra 1 B3: boundary acceptance without the gate | 1 | `started-missing-original-start` |
| Gate made a no-op | 1 | `started-missing-original-start` |
| Astra 2 B2 control: reference walk and reference cases removed, dormant `$ref` added | 0 | Defect reproduced; the head exits 1 on the same mutation |

## Checks, scope and limits

| Command / check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_memory_maintenance_events.py` | 0 | 224 boundaries; 126 operation cases; 276 traces / 464 steps; 340 writer steps; 129 identifier cases; 32 checkpoint joins; 108 history cases; 64 reference cases; 6 registry mirrors reference-checked; matrix 938 controls / 9,248 negatives. Runs in about 12 s. |
| `fix4-audit.py` (in-process) | 0 | 400/400 direct probes of every earlier finding. |
| `fix4-audit.py` (full checker) | 0 | 190/190 subprocesses as required: 184 standing/gate mutations (176 exit 1; 8 `custody-negative` exit 0) and 6 restored defects. The first B1 restored copy had an empty `if` body; it was fixed and the restored rows rerun (`restored_rerun_note`). |
| Reviewer harness reruns | see above | 248/248; 665/673 twice (8 explained); 180/180; Astra 2: 444 direct probes, 0 false accepts. |
| Shard `--generate`, then index `generate` (each commit) | 0 / 0 | Parsed status pass. Only `automated_testing_system` and `storage-plan` shards and the index changed. |
| Shard `--check --config Plans/sharding_config.json` | 0 | Pass, failures empty; 99 sources / 3,107 shards. |
| `python3 scripts/pm-plan-index.py validate` | 0 | Parsed top-level pass; failures empty. |
| Scope and preservation audit | 0 | No forbidden or test path. No new PlanUnit id. Lane schemas, contracts and storage-value registry unchanged. Every older case, state, trace and expectation unchanged. Four held rows still `blocked_on_Jared`. |
| Regrade and quote check | 0 | 392 citations re-pinned; eight oracle upgrades only. |
| Currentness copy and owner premises | 0 | 15/15 edition files match. None of the owner documents changed on `origin/main` `16acf7594a` since the merge base. |
| `git diff --check 009027140a e850f29867` | 0 | No whitespace errors. |

**Paths touched.** `Plans/storage-plan.md` (SP-630–637 gate paragraphs), `Plans/Automated_Testing_System.md` (ATS-315), `Plans/memory_maintenance_event_fixtures.json` (additive), `scripts/pm_memory_maintenance_events.py`, and the generated shards and index.

**Not touched.** No test file, event-family registry append, admission, Decision Log, `.gitignore`, Spec Lock, `.evidence`, auto-decisions, frozen validator, landing lock or `main` push. No mail and no subagent. Aggregate landing checks are left to the landing agent.

**Resource gates.** Initial: 109 GB disk free and 16 GB RAM available. The sparse worktree uses `Plans scripts reports tests`.

## IDs and remaining work

**New IDs: none.** Existing lane IDs are retained: AMS-100–107, CV-650–657, SP-630–637 and ATS-315. Only SP-630–637 and ATS-315 prose changed this round. Unused reservations stay unused.

Still open after this round:

- Final independent review.
- Event, operation, selector and target retention (`PENDING_RETENTION_DECISION`). The gate selects no retention period.
- Admission.
- Native receipt, atomicity, flush, crash, backup and read-race proof.
- Applying DL-402/DL-403 to the four held families, which is separate work.

## Evidence and cleanup

Raw outputs and runnable audit scripts are outside the repository under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix4/`. Key files:

- `targeted-check.json`
- `prior-findings.json`
- `full-checker-mutations.json`
- `standing-checks.json`
- `restored/`
- `rerun/` (each reviewer harness with its `run.log` and outputs)
- `scope-audit.json`
- `premise-checks.json`
- `regrade-validation.json`
- `c1-*` and `c2-*` generate/check/validate outputs
- `currentness-sha256.txt`
- `author_fix4.py` and `owner_fix4.py` (the fixture and owner-text authoring scripts)

SHA-256 values are in `evidence-sha256.json`. The worktree `/home/sittingmongoose/pm-worktrees/DMEM-fix4` is removed with a literal-path `git worktree remove --force` after the report is pushed.


## Card 1b applied

**Source head:** `752d9d47fa28b8c615d6677b7b8eeb60a6e300a7`; base `dc4c46c58c7462f288684a6e672febdf134e3c89`. This section supersedes only this report's earlier statements that the four monthly-summary/prune families remain held. The eight other families are under separate review and their contracts, payload/operation definitions, fixture file, owner units and eight assessment row objects remain unchanged. The old top-level self-grade source pin still governs those eight; the four new rows carry their own exact source pin.

**Result:** four exact families prepared without admission. Each has its own full adoption unit, closed payload, phase-valid operation custody, identity recipe, exact writer/history reader, SP-278 checkpoint adoption, SP-286/CV-339 first-start custody, replay, compatibility/withdrawal and executed oracles. None can currently write. No cutoff exists, membership is ABSENT, and canonical operation/result retention is still pending. Native execution is NOT_RUN.

| Exact family | Before P/Q/A | After P/Q/A | Own unit |
|---|---|---|---|
| `memory.monthly_summary.completed` | 1/2/9 (held) | 10/1/1 | `SP-638` |
| `memory.monthly_summary.started` | 1/2/9 (held) | 10/1/1 | `SP-639` |
| `memory.prune_archive.completed` | 1/2/9 (held) | 10/1/1 | `CV-658` |
| `memory.prune_archive.started` | 1/2/9 (held) | 10/1/1 | `CV-659` |

The event-history retention cell now cites DL-401/G04's `RP-OPERATIONAL-2555D@1.0.0` (2,555 days, 2,000,000 per Project, refusal at cap, stronger holds/refs preserved) on **unlanded** `origin/plans/ea-retention-cards1-20261104` at `2663667e14346235daaa561d193e959422640b6e`, `Plans/storage-plan.md` G04 and “Memory maintenance (DL-402, DL-403)”. It remains PARTIAL because the canonical operation/result custody assignment is still open. No application bucket or app edition is selected.

### Decisions and premise checks

Jared's 2026-11-04 answer was “approve all except 4c B”. Apply **1b-i A** and **1b-ii A** exactly as presented in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md`, SHA-256 `578a6774525bc474ce7ee36da2bd22fae52520aaf940d33c99d0a3aeeb58d696`. DL-402/DL-403 are on unlanded `origin/plans/ea-cards1-answers-20261104` at `b6332f391a7870bad5f01a29a7e9d080050dac27`; this lane writes no decision entry.

- **DL-402:** both jobs only archive. Only the user deletes memories. Summary originals remain archived with every EvidenceRef and version. Neither job archives or merges a pin; verification, index rebuild and out-of-date marking still apply to pins.
- **DL-403:** automatic and Memory-panel invocation both refuse until cutoffs exist. Both buttons are unavailable and state why. A direct invocation, arbitrary policy argument or Boolean cannot bypass the same cutoff gate. This answer selects no values.
- **Current owner premise:** section 7.2 still names monthly Note consolidation and prune/archive; UCC-085 still names `cmd.chat.memory.summarize_monthly {project_id, month?}` and `cmd.chat.memory.prune_archive {project_id, policy?}`. The exact four names remain in DL-045's authorized list. AMS-054 separates app-thread memory, so these prepared editions stay Project-only. No prior answer is extended to a new scope or a duplicate-sweep policy. Per-family live-canon searches and negative evidence are in `DMEM-card1b-search.json`.
- **Narrow memory-owner edit:** only section 7.2 changes: archive-only/source/pin preservation with DL-402, and unavailable-until-cutoffs with DL-403. All memory-owner text outside that section is byte-identical. No AMS unit is minted or altered.

### Newly authored bindings and adoption

`SP-638` is monthly summary completed; `SP-639` is monthly summary started; `CV-658` is prune/archive completed; `CV-659` is prune/archive started. The last two are full storage/payload adoption contracts in Contracts, each with its own owner_doc; the reservations contain only two remaining SP and two remaining CV ids. Every family individually adopts the appropriate SP-636/SP-637 and CV-656/CV-657 pattern and replaces all exact names, command, schema, operation and reader identifiers. No sibling is treated as admission or as per-family search evidence.

Each exact emitter is `MemoryMaintenance.<job>.<phase>.v1@1.0.0`; each exact reader is `reader.memory.<job>.<phase>.history.v1@1.0.0`. The two new canonical value companions are `memory_monthly_summary_operation` and `memory_prune_archive_operation`, deferred with explicit pending operation retention and the existing canonical `coordination_and_storage` 16 KiB profile. The writer accepts only `dedupe_by_idempotency_key` and the exact new payload URI. Project partition is encoded; current app events are not adopted. Closed payloads and rows freeze cutoff ref/hash, and monthly payloads/rows freeze the exact optional month including null, so crash/retry cannot substitute a newer policy or month. No default-month rule is selected.

**Start custody:** same round-4 rule and predicates, including before/commit checks, full retained original identity/digest/operation/phase/flush checks and both-edition withdrawal fence. The new checker splits canonical schema, producer and payload comparisons into named invariant checks for guard-removal proof; it never repairs or substitutes retained proof. All four models (phase, writer, boundary, reader) exercise the original custody paths. A missing live cutoff refuses current writes/effects/recovery/retry with unchanged input state and no output; historical valid originals remain readable without today's cutoff. Archive post-state oracles preserve originals, evidence, versions, pins and unselected memories; summary provenance preserves all original refs.

`ATS-316` owns the new static suite. The old checker changes only its count of held rows from four to zero, with the newly prepared rows routed to `Plans/memory_archive_contracts.json`; its eight-family semantic code and fixture file are unchanged. The eight contracts/assessment rows and every prior storage value/profile are preserved by 38 assertions.

### Check 11: guard-removal table for all four

**938 negatives; 35 logical guard groups.** Every case first runs from its intact positive control. Remove one guard across its repeated sites, run the entire corpus, require its own negatives to accept, and require every other negative to retain its own exact expected refusal; then restore it. Requested-start custody is classified as start custody even at a requested-original check; terminal-original custody is separate. Canonical/row/payload/hash observational copies for the cutoff scope/commitment negatives are updated coherently, leaving one semantic defect. The table would fail on a masked negative or an unrelated changed refusal.

Exact full names for each row are in `reports/event-authority-20261104/DMEM-card1b-guards.json` and the full external `targeted-check.json` (including each complement). In the table, “other” is exactly the cases whose `guard` differs from that row; samples below are suffixes after the exact family prefix.

| Guard removed | Negatives that flip: count and samples | Other negatives keep exact refusal | Restored |
|---|---|---:|---|
| `admission` | 4; `not-admitted`; `not-admitted` | 934 | yes |
| `checkpoint_join` | 8; `checkpoint-storage_instance_id`; `checkpoint-checkpoint_key` | 930 | yes |
| `cutoff_commitment` | 4; `cutoff-changed-hash`; `cutoff-changed-hash` | 934 | yes |
| `cutoff_record` | 4; `cutoff-boolean-is-not-authority`; `cutoff-boolean-is-not-authority` | 934 | yes |
| `cutoff_scope` | 8; `cutoff-other-job`; `cutoff-other-project` | 930 | yes |
| `cutoffs_unavailable` | 328; `automatic-cutoffs-absent`; `memory-panel-cutoffs-absent` | 610 | yes |
| `effect_once` | 4; `repeated-effect`; `repeated-effect` | 934 | yes |
| `envelope_schema` | 4; `unknown-envelope-field`; `unknown-envelope-field` | 934 | yes |
| `evidence_preserved` | 4; `evidence-lost`; `evidence-lost` | 934 | yes |
| `no_extra_memories` | 4; `extra-memory`; `extra-memory` | 934 | yes |
| `no_prune_summary` | 2; `prune-invented-summary`; `prune-invented-summary` | 936 | yes |
| `operation_cas` | 4; `stale-cas`; `stale-cas` | 934 | yes |
| `operation_valid` | 4; `unknown-operation-field`; `unknown-operation-field` | 934 | yes |
| `original_custody` | 4; `history-forged-digest`; `history-forged-rehashed-payload` | 934 | yes |
| `originals_preserved` | 4; `original-deleted`; `original-deleted` | 934 | yes |
| `partition` | 4; `raw-project-partition`; `raw-project-partition` | 934 | yes |
| `payload_join` | 4; `payload-source`; `payload-source` | 934 | yes |
| `payload_schema` | 78; `payload-extra`; `payload-missing-schema_version` | 860 | yes |
| `permission_or_withdrawal` | 16; `no-permission`; `withdrawn` | 922 | yes |
| `pins_preserved` | 4; `pin-archived`; `pin-archived` | 934 | yes |
| `producer_join` | 4; `producer-actor`; `producer-actor` | 934 | yes |
| `references_resolve` | 4; `dormant-unresolved-ref`; `dormant-unresolved-ref` | 934 | yes |
| `replay_policy` | 4; `replay-only`; `replay-only` | 934 | yes |
| `request` | 4; `request-changed`; `request-changed` | 934 | yes |
| `selected_archived` | 4; `selected-not-archived`; `selected-not-archived` | 934 | yes |
| `selection_exists` | 4; `missing-selection`; `missing-selection` | 934 | yes |
| `selection_kind` | 2; `non-note-summary`; `non-note-summary` | 936 | yes |
| `selection_pinned` | 4; `pinned-selection`; `pinned-selection` | 934 | yes |
| `selection_unique` | 4; `duplicate-selection`; `duplicate-selection` | 934 | yes |
| `source` | 4; `source-changed`; `source-changed` | 934 | yes |
| `start_custody` | 390; `start-custody-missing`; `start-custody-digest` | 548 | yes |
| `summary_provenance` | 2; `summary-lost-evidence`; `summary-lost-evidence` | 936 | yes |
| `terminal_custody` | 4; `terminal-custody`; `terminal-custody` | 934 | yes |
| `unselected_preserved` | 4; `unselected-changed`; `unselected-changed` | 934 | yes |
| `versions_preserved` | 4; `version-lost`; `version-lost` | 934 | yes |

### Standing checks 1–11

1. Replay-only is refused by the current writer; only dedupe is selected. All four have their own refusal oracle.
2. Project-only editions introduce no Application writer or idempotency recipe. CV-366 remains the sole Application key authority; the unchanged adopted base suite also rejects its exact canonical Application case.
3. Writer positives use `project~cHJvamVjdC0x`; raw partitions fail.
4. Maximum MessagePack upper bounds, even with four-byte UTF-8 per allowed string character, are {'memory.monthly_summary.completed': 5002, 'memory.monthly_summary.started': 4091, 'memory.prune_archive.completed': 4959, 'memory.prune_archive.started': 4049}. Every one is below 16 KiB. Oversize inline and unknown success-exit fields fail the closed schema; SP-337 remains the larger-body owner.
5. Patterned identifiers use exact lengths/full-input guards. Trailing-LF negatives cover the new payload hashes and monthly month; no Python `$` loophole.
6. Storage-assigned sequence/observed/persisted fields are excluded from semantic retry comparison; unchanged original return is tested.
7. Checkpoint positives use the event's actual UUID storage instance throughout the source fixture; foreign storage/key negatives reject.
8. Unknown process-success fields reject. Eight full-checker mutations (wrong oracle and dormant operation ref, one of each per family) exit 1; no failure can be counted as a success.
9. All schema documents and the new value mirrors are walked offline, including dormant refs. Each family has an unresolved-ref negative; the four mutated operation definitions also fail the full checker.
10. Every exact reader returns retained valid originals after live source/request/counter changes and with cutoffs absent. Access denial, withdrawal, forged originals and corrupt start custody refuse.
11. The complete table above passes. No historical eight-family negative or expectation is edited.

### Cutoff proposals — report only, for Jared

No numeric proposal below is canonical, an approval, a setting, a selected default or permission to run. **Question: choose A/B/C separately for monthly summary and prune/archive.**

For both jobs, evaluate independently inside one Project, or inside only the calling application thread once that edition is separately bound. Never pool scopes. Proposed age means days since the later of `updated_at` and `last_access_at` (fall back to `created_at` when absent), so recent edits/use reset eligibility. Freeze the maintenance snapshot and use section 6.3's existing activation formula, including per-kind/Done half-lives and missing BM25/ANN scores equal to zero. Pins are excluded before scoring. No count cutoff or count-triggered archival is proposed.

| Job | A — recommended | B — more conservative | C |
|---|---|---|---|
| Monthly summary | Note originals idle at least **90 days AND activation < 0.10**, per exact scope and existing monthly grouping; no count threshold. Archive every original with all evidence refs. | **180 days AND activation < 0.05**, same scope and protections. | Keep disabled; Jared supplies different age/score values or asks for usage evidence first. |
| Prune/archive | Any eligible unpinned gist idle at least **180 days AND activation < 0.05**, per exact scope; no count threshold. Archive only. | **365 days AND activation < 0.02**, same scope and protections. | Keep disabled; Jared supplies different age/score values or asks for usage evidence first. |

**Reason from today's text:** section 7.2 distinguishes older low-activation Note consolidation from very-low-activation pruning. Section 9.2 gives Notes a 45-day half-life: 90/180 days are two/four such half-lives, while 180/365-day kinds decay much more slowly. Section 6.3 already includes access, recency, kind/status and retrieval signals, and Done accelerates decay. Using both age and score respects that distinction; no count trigger forces a recently used or high-value memory out. Card 1b-ii explicitly says there is no usage data yet, so A is a cautious proposal to review, not an inferred product default. The lack of cutoffs continues to disable both jobs after this draft.

### Checks and boundaries

| Check | Exit / status |
|---|---|
| `python3 scripts/pm_memory_archive_events.py` | 0 / pass; 938 negatives, 35 guard rows; 154 authored phase/writer steps, 22 positive boundaries, 16 historical controls each with and without cutoffs, plus all custody-path controls in the negative corpus. |
| `python3 scripts/pm_memory_maintenance_events.py` | 0 / pass; existing eight-family suite unchanged. |
| Full-checker failure propagation | 0 audit / all 8 child processes exit 1 as required. |
| New operation value rows against registry schema; mirrors/profiles | 0 / two schema-valid deferred rows, exact operation mirrors and existing profile adopted. |
| Shard generate / index generate | 0 / top-level pass. Currentness 15-file copy verified by SHA-256 first. |
| Shard check / index validate | 0 / parsed top-level pass, failures empty. |
| Scope/citation audit; `git diff --check` | 0 / 38 preservation assertions; 48 exact four-family citations; whitespace clean. |
| Storage-profile checker | 1 / 41 pre-existing unrelated errors, identical to base; zero new errors. The two missing profiles found during drafting were added before final generation. |
| Assistant contract inspector | 1 / `gaps_found`; `errors=[]`, `projects_refresh_static_failures=[]`, Browser successor check passes. Broader command/wiring/native gaps are outside this lane; no completeness claim. |

Shared-file hunks are additive SP-638/SP-639 in Storage, CV-658/CV-659 in Contracts, ATS-316 in Automated Testing, and two new operation rows/profiles in the storage value registry. Memory's only hunk is section 7.2. Shards changed only for those five edited owners; index regenerated. No `.gitignore`, test file, event-family registry, Decision Log, Spec Lock, auto-decisions, evidence bundle or frozen validator changed. No mail, subagent, landing lock, admission, governance reseal or main push.

**IDs used:** new `SP-638`, `SP-639`, `CV-658`, `CV-659`, `ATS-316`, checked unused across every fetched origin branch before authoring. Existing adoption IDs are reused as references only. No AMS or DL id is created.

**Remaining:** Jared's cutoff decision (proposals above); operation/result custody retention; merge the cited unlanded decisions/retention sources; independent review and per-family admission; native proof. The duplicate-sweep survivor/disposition policy stays open and all eight other family contracts stay under their separate review. All 12 worker rows now total 120 PASS / 12 PARTIAL / 12 ABSENT, without upgrading the old eight.

### Card 1b evidence

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/targeted-check.json` — SHA-256 `d08ad36a6e50c16f10b9e5c4f35170cebdfa5c1726d1d32d34ccdc0faf96caaa`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/eight-family-regression.json` — SHA-256 `c956b542368bed7b5f595aab773c2e1d54f3cb28a9cb33ab104759028fabdbca`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/scope-audit.json` — SHA-256 `080b76b2638d20ec7bd0253ca1e5e15fb39f5d1540311ba6c5067c0df64aaf5a`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/failure-propagation.json` — SHA-256 `39f9ef8aa728c463b92e0d80841b58330b50b60e9d1256209540ce7497c0c933`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/shard-check.json` — SHA-256 `a471f4cd29bb5aeac3bf0eb27f14f6ee4baeec39bd3cb3a866aea09768adca69`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/index-validate.json` — SHA-256 `a2e9a22f64bde0bb77a6117b9b2f225affcef2451ef0c578d934713bef2fe68d`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/storage-profile-baseline.json` — SHA-256 `475eee9e127101fe490e45ac871f90150d429e01e182961b07f85c7ade9b21be`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/operation-registry-schema.json` — SHA-256 `00406d31ac06235eac071d9d5cf0ca6f8ede472fa0727e7188e51f01f79d4757`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/currentness-sha256.json` — SHA-256 `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b/regrade-validation.json` — SHA-256 `4c7a0a634e989fc440347a5fb2c6bc7b285c4b5d40248618f3f171fc7a36fc1e`.

All raw authoring/probe outputs remain outside the repository at `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/card1b`. The lane report, self-grade, search and compact guard summary are copied to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/`. The task-specific sparse worktree is removed after the report commit is pushed; this does not land the branch.
