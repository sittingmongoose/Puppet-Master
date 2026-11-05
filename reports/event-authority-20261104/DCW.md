# DCW — fix round 8, Event Authority

Branch `plans/ea-w2-chain-wizard-20261104`; implementation `77ef39ba6630838ed5839f4e4f35d1952858a785`; Astra 3 reviewed `cdc9d4a94878868c9a2c67439bdf28ea5e5168f0`. **0/6 prepared static passes before Astra 3 → 6/6 after this repair.** Membership ABSENT, retention PENDING_RETENTION_DECISION, native execution NOT_RUN. `wizard.blocked` and `wizard.unblocked` remain held for Jared.

## Review round 8: findings and responses

- **F1 — fixed (77ef39ba6630838ed5839f4e4f35d1952858a785). Where:** `scripts/pm_dcw_event_oracles.py:353`, `:785`, `:864`; every family’s `positive.index`/`positive.reader` in `Plans/dcw_event_contract_fixtures.json`; `scripts/pm_dcw_index_cases.py`. **Why:** the old readers used an unrelated generic fixture and compared supplied digests/tokens without authenticating its rows to the returned event. **Fix:** every read, rebuild and compatibility read verifies the actual captured complete source: exact canonical source/control bytes, Project partition, row keys/values, source/publication locators, payload and semantic digests, row-set binding, generation/anchor/frontier hashes, source coverage and boundary, snapshot/transaction and recovery epoch. The exact returned original joins that same source; its full event/receipt custody is independently mandatory before disclosure. All six positives now contain their genuine events and retained predecessors. Astra’s **54/54** substitutions refuse; fresh rehashed foreign Project, swapped row, stale digest, wrong-family, absent/out-of-boundary and source/token forgeries refuse. Rehashed cases expose the source join independently of the row-set hash. Verify the six full CLIs, independent probes and complete guard table.
- **S1 — fixed (77ef39ba6630838ed5839f4e4f35d1952858a785); item 12 applies this round. Where:** `scripts/pm_dcw_event_oracles.py:688` and `:709`. **Why:** optional `date-time` support was absent despite a FormatChecker object. **Fix:** mandatory local full-match RFC3339 shape plus calendar/range validation, without an optional package. Missing zones, separators, impossible dates/times, LF, invalid offsets, leap seconds and empty fractions refuse. Valid calendar dates, arbitrary nonempty decimal fractions and RFC3339 envelope zones/spellings remain exact; family payload UTC-Z rules still apply. **1,296** malformed full-composition timestamp cases cover shared observed/persisted fields and one current payload/result timestamp fact with its required original copies, on all six operations. Astra’s **24/24** cases refuse. The six unadmitted candidate families have no admitted earlier edition: no historic recipe is invented, tightened silently, or selected through a caller-controlled downgrade. Retained valid originals still survive live writer changes; forged earlier editions refuse.

The complete separately owned opened-source validator from round 7 is preserved. Every previous authored case ID, operation, expected result and non-index semantic mutation remains; immutable owner/schema/registry text, native obligations and original-custody functions are unchanged. Existing witnesses now reissue only their captured index observations when their original event or recovery epoch changes. Production readers never construct or repair an index from a requested event. Storage receipt/scope/sequence/semantic authentication remains in `original_receipt`; exact frame equality joins that already verified custody transitively.

## Family grades before and after

| Family | Before (Astra 3) | After |
|---|---|---|
| `bundle.revision_requested` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `bundle.revision_started` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `bundle.revision_completed` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `bundle.revision_interrupted` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `wizard.blocked` | 6 PARTIAL / 6 ABSENT | unchanged; held for Jared |
| `wizard.deferred_payload.loaded` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `wizard.opened` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `wizard.unblocked` | 6 PARTIAL / 6 ABSENT | unchanged; held for Jared |

Precisely `consumers_checkpoints` and `positive_negative_oracles` recover PARTIAL → PASS for each prepared family: twelve cells. All 96 cells retain current evidence; 298 exact quotations are rechecked. Prepared PASS is a static contract judgment, with no admission or native execution inferred.

## Eleven standing checks and guard table

| Check | How the class is ruled out for all six families |
|---|---|
| 1 Replay-only writers | Every valid append/publish/retry variant has its independent policy-negative control; passive retained source interpretation never enables append. |
| 2 Application keys | Exact CV-366 application keys and malformed keys both refuse these Project-only writers; no application support claimed. |
| 3 Project scope | `project~` is recomputed from the actual UTF-8 Project; raw/foreign partitions and rehashed foreign Project rows refuse. |
| 4 Full byte limits | Independent source and event MessagePack limits, inline 16,384/16,385 boundaries, verified SP-337 packs and restore inventories remain mandatory. Fresh UTF-8 expansion controls refuse. |
| 5 Full matches | Exact identifier/digest comparisons and source/row-key LF cases refuse; the date-time grammar also uses fullmatch. |
| 6 Retry body | Caller-semantic-only comparison remains unchanged; Storage metadata authenticates separately against the original. |
| 7 Actual checkpoint joins | All actual rows/source bytes, complete frontier, Project/family/event identity and selected original/receipt join the same snapshot; Astra’s 54 counterexamples and rehashed variants refuse. |
| 8 Failure exits | The real family CLI rejects a false success outcome; weakening only its exact expectation assertion returns success. |
| 9 Eager references | Unused local/external source and payload dangling references fail the full CLI; only the exact preflight mutant flips. |
| 10 History | Live write CAS, cutoff, effect state and write permission do not invalidate retained originals. Withdrawal, forged originals, missing custody and fake older editions still refuse. |
| 11 Isolation | Every negative flips under its exact guard/set; all other negatives retain their own invariant. Complete JSON lists exact flips, rejected complements and named duplicates. |

**146/146 require sites; 4,656/4,656 negatives; 1152 configurations; 906,471 comparisons; zero unrelated acceptances or unrelated refusal changes.** The [complete guard table](DCW.guard-removal.md) names every guard, duplicate schema keyword/set, sample flipping IDs and exact rejected-ID complements. Six family exports remain explicitly partial until the strict aggregate proves the entire lane. Legacy: 15 assertions, 182 negatives, 8,356 comparisons; no unrelated acceptances. No full validator, schema, source chain or verify call is bypassed.

## Recurring Astra classes — fresh probes and limits

| Item | Result and evidence |
|---|---|
| 1 Forged/contradictory input | Astra’s exact row substitutions plus independently rehashed Project/family/digest, swapped/missing rows, source and generation/frontier mutants refuse. Every binding is recomputed from its source. |
| 2 Storage-assigned metadata | Fresh valid-shaped original Storage timestamp and numeric-sequence substitutions refuse exact original-value authentication; removing only the named authenticity guard/set flips them. |
| 3 Historical readers | Fresh read/rebuild/compatibility controls survive all live writer changes; withdrawn or forged history still refuses. |
| 4 Multiple readings | Fresh uppercase payload hashes remain invalid after coherent hash reissue; exact typed/canonical comparisons prevent reinterpretation. |
| 5 Unvisited refs | Full CLI unused-definition local/external source/payload mutations reject, with exact preflight controls. |
| 6 Partial sizes | Fresh complete source byte-boundary and one UTF-8-scalar expansion controls exercise the real size predicate. Event/source packs remain independent. Earlier contradictory owner prose stays removed. |
| 7 Custody on every path | Fresh missing-original custody refuses with its frozen-original ablation control. The complete opened source/receipt/restore chain remains enforced on all six loaded operations. |
| 8 Masked negatives | The whole-pool table proves every own negative and complete rejected complement; current payload timestamp probes change only that result fact and its required copies. Integrity audit rejects omitted guards/cases. |
| 9 Inflated grades | Twelve cells recover only after full current proofs; integrity mutations reject fabricated PASS counts, held-family promotion and incomplete evidence. |
| 10 Number spellings | Fresh 1/1.0/1e0/-0/01 canonical-domain probes and full-reader integral-float original substitutions enforce the existing integer recipe without new identities. |
| 11 Wrong types | Fresh array-valued withdrawal controls refuse with their exact guard-removal control; the retained numeric/type corpus covers string booleans/numbers, null, arrays, nested objects and bool/float aliases. |
| 12 Skipped formats | Required date-time validator is the local mandatory function; package absence cannot disable it. All 1,296 malformed cases plus 24 independent review cases refuse; fraction/calendar/zone positives remain. |
| 10a History recipes | No admitted earlier edition exists for these prepared candidates. Authentic v1 retained controls survive writer changes; coherent forged earlier editions refuse. No caller-selected weak recipe, reissued native history or product migration is introduced. |

## Questions for Jared — card-ready, no answer applied



**Q1a — wizard.blocked / current subject and emission predicate.** Under `Plans/Contracts_V0.md:14896` (CV-233) and `Plans/Contracts_V0.md:2686`, which exact existing PlanningRun or topic owner identity must `wizard_id` identify, and which existing blocked/remediation predicate emits this observation, including the current source of `round_count`? PWIZ-002 owns the current aggregate/topic model; shared route_target/blocked identity does not decide that subject or predicate.

**Review recommendation, unapplied:** retain an observation of the existing Planning Wizard blocked/remediation episode after Jared confirms its actual current subject/trigger. Use current route/blocked identity; do not resurrect a three-round threshold or separate wizard_status state machine. Subsequent identity/schema/checkpoint work is technical.

**Q1b — wizard.unblocked / matching current resolution predicate.** Under `Plans/Contracts_V0.md:14944` (CV-234), for that same confirmed current subject and blocked/remediation episode, which existing authorized resolution transition emits the corresponding observation, and how does `resolution_source` identify that actual resolution and preserve causality?

**Review recommendation, unapplied:** the corresponding observation when that same owner episode clears through an existing authorized resolution, preserving subject and causality. Confirm with Q1a; a route-open or replay never counts as resolution.

Current supporting evidence: `Plans/assistant-chat-design.md:3524`; `Plans/Planning_Wizard.md:116`. These holds do not reopen already-decided intake action existence or choose retirement/historical-only disposition. **Jared's answers: PENDING.**





## Scope, resources and IDs

No owner Markdown, payload/source schema, registry, Decision Log, admission, exclusion/application record, Spec Lock, governance evidence/auto-decision, frozen validator, test file or .gitignore change. No new product behavior, retention/deletion answer or PlanUnit. Existing IDs only: **CV-590–595, SP-575–579, ACD-571–574, PWIZ-097/098** (17); **no new IDs**. The canonical DL-045/current owner, SP-278/DL-076 and SP-286/CV-339 premises remain unchanged. No owner Markdown changed, so no shard/index regeneration was needed; the shard body/path check still passes. The currentness edition’s 15 files were copied and SHA-matched before index validation.

Final proofs ran one family/checker at a time, and one guard or named duplicate set at a time, checking available memory before every checker. The 6 GB memory floor and 50 GB disk floor were respected. One early overlapping proof attempt was cancelled and excluded; all final exports are serial. One read-only startup mailbox check overlapped the initial brief read; after its prohibition was read there was no further mailbox use, registration or sending. No subagents, browsers or servers. Push only the assigned branch, copy report/grade/table to drafts/DCW, remove the literal detached sparse worktree after the final push. No main push, landing lock or reseal.

This is synthetic static composition. Native CURRENT/manifest codecs, frame CRC, real redb snapshots/CAS/fences and source authentication remain NOT_RUN. Direct verified source/rebuild snapshots are exercised; a translation-dependent capture requires its actual owner proof or governed rebuild, never an opaque locator. No native adapter authenticity is inferred from a self-consistent synthetic capture.

## Commands and results

| Check | Exit | Result |
|---|---:|---|
| Six sequential full family CLIs | 0 | 5,169 full / 5,348 total static cases |
| Six sequential standing checks | 0 | 1,328 outcomes; 66/66 family/check cells |
| Six isolation exports plus strict merge | 0 | 146 guards; 4,656 negatives; 906,471 comparisons |
| Four fixed legacy proofs | 0 | 15 assertions; 182 negatives; 8,356 comparisons |
| Six independent probes | 0 | 150 outcomes, including all 54 F1 and 24 S1 review cases; 36 fresh ablation controls |
| Storage recovery self-test | 0 | top-level pass |
| Shard check | 0 | top-level pass |
| Plan index validate | 1 | top-level fail; 22 diagnostics; 0 added versus reviewed index evidence |
| Preservation / quotation / integrity audit; diff check | 0 | Old cases, native obligations, owner text, protected custody functions and both holds preserved |

Index diagnostics are classified in `index-comparison.json`; they are reported without weakening a guard, editing a baseline, regenerating unrelated documents or resealing governance.

## Evidence

External evidence directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/fix8`. Every raw output remains outside the repository. Source closure binds every checker/builder plus fixtures; the complete guard JSON binds every flip/reject complement.

| Evidence | SHA-256 |
|---|---|
| `isolation-final.json` | `205a0772af02c87359227397be8f36e089b3877fdea04b66159efdb8b4b31677` |
| `legacy-summary.json` | `82d4c22b960afda8811631d7c9511c3d6eef6e561eb8d08f05303154424ba907` |
| `independent-summary.json` | `4dc2a484f0287095b4ca1de5c6b9ea7b76a9973ce77c3a73e40c760af013f722` |
| `source-closure.json` | `2bb6989e38ce5d3330c85fb54be613ae8bc8812778c4ebd5a3ff604b2b23d610` |
| `preservation.json` | `640f6189fcb93c7d9bde8776aeaf4ee3550dc68d7be37be77e6718b381451e9a` |
| `currentness-sha256.json` | `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c` |
| `index-comparison.json` | `1b1ac10a12e00c6316c4ada10b2cc7af128d1e680bd783280024d04f20cefdeb` |
| `storage-check.log` | `e56e543c18588569abd7a299f25004750f6954e919c5571c6a669b38668eca1a` |
| `shard-check.log` | `353b434b8f99c23e82801aee68941ecef36e9fc71638a6bce463523cd6b01ade` |
| `index-validate.log` | `a3a574555012a1823bca20b76e4b0c4d23292b4dbf01eee3d90c9f6aaddce0ab` |
| `integrity-controls.json` | `cd47c400ff182d779b2ad7971958953f416a55c0860b00914129d54d4b08fa40` |
