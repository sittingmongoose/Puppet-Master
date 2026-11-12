# CA-SEAL2 design — combined certification under the supplied ruling

**Status: ROUND 1 FIXES IMPLEMENTED; PENDING RE-REVIEW AND COORDINATED LANDING.** Workers CA-SEAL2 and CA-SEAL2-FIX1 (Codex), stream E, VM, 2026-11-05. The supplied ruling resolves the earlier scope question. The bounded implementation and fresh checks are recorded in CA-SEAL2.md; no seal, admission or final approval is claimed.

Branch: `plans/ea-seal-check-recount-20261105`, based on CA-SEAL `17c842445a2623bb0334ba8d6932e7a6bf088967`. The predecessor validator SHA-256 is `319f6bffddb07a36e633fd949146e4ce9149819ea5e817b13897a74314163a91`; the implemented fourth-change SHA-256 is `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`.

## The design in five lines

1. **Combined scope:** final approval requires one run with every unchanged August predicate passing and complete per-name outcomes for all 249 recount names; a single-snapshot result is diagnostic only.
2. **Recount custody:** strictly parse and byte-pin the frozen receipt/list; recompute every named source fingerprint from its declared frozen revision or external evidence source before considering any outcome.
3. **Snapshot separation:** identify both snapshots by their own receipts and fingerprints in each result; preserve all August artifacts, and never attach an August fingerprint to recount membership.
4. **Fourth-change receipt:** bind the exact delta, unchanged conditions, validator before/after SHA-256, DL-451 section, recount receipt/list, author and actual lander; provide any final receipt Spec Lock template without editing Spec Lock.
5. **Preserved gates:** keep complete decisions, saved/admission records, twelve-criterion depth and every existing approval condition; stop if canon drift makes an August check impossible, without re-stamping or routing around it.

## Ruling and prerequisite stop boundary

The lane's final section, “Ruling on the stopped question”, dated 2026-11-05 05:00Z, mail `1105050013-eb00`, supplies **pm7-build's reading of 9.b, not Jared's words**. It requires one combined run and treats single-snapshot results as diagnostic only. This resolves the earlier question below; it is not a new owner answer or a new card.

Before implementing any fourth-change byte bridge or recount outcome path, run the unchanged CA-SEAL FIX8 validator with only its receipt output redirected outside the worktree. Inspect each August failure for an implementation defect, an unfinished prerequisite, or an incompatibility caused by canon moving since August. The latter requires an immediate stop and a precise owner question for pm7-build. Missing landing dependencies and unfinished outcome records must not be represented as passed. Existing receipts and every August list, source fingerprint and freeze digest remain untouched.

The unchanged validator ran with exit 1 and ten failures. The unanchored third-change bridge accounts for receipt, holding and dependent partition failures; the remaining rows are unfinished closure/depth prerequisites. No observed failure proves an August predicate impossible because canon moved. This is not a pass or a waiver.

The intended new path supplements the August computation. It must not substitute a source list, turn a source-integrity success into final approval, reuse a copied pass flag, or mask an August failure. That inspection permitted the bounded implementation. Actual landing receipt completion and final combined approval still require their own prerequisites.

## Detailed bounded input contract

**Source custody.** The new reader pins `reports/event-authority-20261104/census-recount-20261104/RECEIPT.json` and `NEW-LIST.json` to their reviewed complete byte digests. It strictly parses both, requires the exact 249 sorted unique names and frozen revision, and verifies all 597 receipt input fingerprints (SHA-256 and exact byte count). Relative tracked sources come from Git at the receipt's frozen `main_sha`; explicit `git:<revision>:<path>` lineage inputs use their own full revision. Absolute evidence paths are read at their recorded location. An optional, strictly parsed explicit location map may identify saved copies of historical bytes, including the 15 ignored currentness inputs; every mapped read still must match its own original fingerprint and length. No candidate name, digest or success flag comes from that map. Its own byte digest and resolved locations are included in the result. Missing or drifted bytes fail closed, without synthesizing or re-stamping a pin.

**Per-name outcomes.** A new audit-side `recount/OUTCOMES.json` input serializes the existing close-path outcomes; this worker writes no real outcome. Every entry identifies one exact recount name. A registered entry is accepted only through the existing complete DL-077/DL-412 admission check, including its own decision and twelve-cell assessment. An excluded entry uses the existing `RECLASSIFY_TO_EXCLUDED` vocabulary, its own Decision Log section naming the exact family, a nonempty rationale and individually hashed Plans citation spans containing that exact event token with `[A-Za-z0-9_.]` boundaries; a prefix, suffix or dotted sibling cannot satisfy it. A decision-card entry pins a saved report containing the exact name; it is visible as unresolved and blocks final approval, preserving the old unresolved gate. Missing, duplicate, extra, mixed, malformed or contradictory outcomes fail closed. Complete accounted cards are never converted into approval by the new reader.

**Byte chain.** The third receipt stays byte-identical. The fourth receipt pins the third receipt, the prescribed third validator after-hash as its before-hash, and this executable as its after-hash. A unique exact-path complete-byte Spec Lock anchor is required for the fourth bridge just as in FIX8. Only the old executable-byte observation is bridged: unchanged August predicates still run, and DL-412 keeps its independent semantic judgment. The fourth receipt's own authority, frozen inputs, author/lander and false authority flags are separately checked. No weaker receipt is accepted when a fourth link is broken.

**Historical receipt identity (R01).** August's `receipt_path` is qualified by fixed Git revision `17c842445a2623bb0334ba8d6932e7a6bf088967` and original SHA-256 `9c75a19775c29ef64cd49084543e11a1a706fcda376b2b176a905928b6fae38e`. The recount receipt is qualified by revision `c53e4199ae94ca853a197354f3f9e7f296cf1efc` and its original byte pin. These are historical identities; the current recount input digest is separately observed. The inherited default working-tree receipt path remains runtime output, and neither its current bytes nor a preceding combined result identifies August. No earlier receipt is moved or re-stamped. Two consecutive actual CLI runs use the unchanged default output and resolve both historical Git identities after each write.

**Aggregation.** `main()` always computes the old result and the new input/outcome checks in the same invocation. The old flags and seal prerequisites are ANDed with the verified recount outcomes, and every new failure blocks the combined result. No selector can produce final approval for one snapshot alone. The result always exposes both snapshot identities, including on missing-input exits. Standalone helpers/tests are diagnostic only. Source integrity alone cannot set a closure flag.

**Known custody finding before implementation.** A direct first pass verifies 580 of 597 receipt inputs. Two external brief files have changed and fifteen ignored currentness files are absent from Git. All 17 locations have now been resolved without changing any pin: 15 exact historical edition files were found in retained copies; the two brief versions were recovered by removing later additions and accepted only after both complete-byte SHA-256 and original byte count matched. With the explicit map, all 597 inputs verify. The reader must still report absence or mismatch rather than treating a generator rerun or a newer edition as the frozen original. This is a recount-source custody issue, not a new August decision.

## Earlier stopped question — resolved by the supplied ruling

> Must the final Event Authority approval require the existing August checks and complete per-name outcomes for the separately frozen 249-name recount to pass together, or may runs certify one explicitly selected snapshot separately? If separate snapshot certifications are allowed, which certification or combination is required for final approval, and how must each result identify its scope?

The following explains the earlier stop and is historical. At that point no option was selected by this worker. In particular, an optional recount reader with an August-only overall `pass`, a new mandatory recount gate, and a selector that substitutes the recount for August would make different approval claims. The approval text permits the new input and preserves existing requirements; it does not explicitly specify that selection/aggregation rule. A mechanical source-integrity success cannot decide that rule.

The lane explicitly requires: "If the design needs a choice the 9.b text does not give (for example which list a given seal run certifies, or whether both must pass), stop and write the exact question." The earlier report at `5764ca809c0dcc8a161d4fcd45770abf6355f746` took that stop branch and contained no implementation. The supplied ruling now resolves it; the current implementation, receipt and entry template are recorded in CA-SEAL2.md.

## Approved authority, unchanged

Jared's recorded answer is **"i approve all of it"**, selecting A on the unchanged deck, whose SHA-256 is `6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30`.

Item 9.b option A, verbatim:

> Approve a fourth recorded change so the final approval check can read the separately frozen recount and verified proof of its source files. Review the change before and after; keep a saved change record (“receipt”) stating exactly what changed and which requirements remain. Preserve August’s list and fingerprints as history. Keep every per-name decision, complete saved-record requirement and other approval condition. This permits checking the new list; it grants no definition-writing permission, registers no event, enables no app recording and awards no final approval.

Its Sources line, verbatim:

**Sources:** `COUNT:reports/event-authority-20261104/census-recount-20261104/REPORT.md:46-62`; `COUNT:reports/event-authority-20261104/census-recount-20261104/REPORT.md:315-331`; `COUNT:reports/event-authority-20261104/census-recount-20261104/REPORT.md:413-428`; `evidence:reviews/CA-COUNT-sol/REVIEW.md:91-103`; `evidence:reviews/CA-COUNT-sol/REVIEW-cycle2.md:108-112`; `ANS:Plans/Decision_Log.md:4640-4645`; `MAIN:Plans/Decision_Log.md:419-424`; `evidence:reviews/CA-COUNT-sol/REVIEW-astra.md:1-8`; `evidence:reviews/CA-COUNT-sol/REVIEW-astra.md:126-131`; `evidence:reviews/CA-COUNT-sol/REVIEW-astra-2.md:1-12`.

The answer and as-presented deck are under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/`. The exact stop instruction is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/CA-SEAL2.md`, Do item 2.

## Historical base: why the scope question mattered

At the pinned CA-SEAL base, the validator's `DENOM` is the August `FRESH_CENSUS_DENOMINATOR.json` (line 30). `main()` requires and loads the August census, ledgers and freeze (lines 793–839). Its pre-seal prerequisite, denominator, depth and overall-pass predicates (lines 1888–1927) compute one result, and `build_receipt()` (lines 2000–2030) has no certified-snapshot selection. The spec calls the August denominator the sole fresh denominator contract. Reading another list without defining how that list participates in these predicates would leave the approval claim ambiguous.

The recount at `c53e4199ae94ca853a197354f3f9e7f296cf1efc` is explicitly separate discovery/adjudication evidence, not an admitted denominator. Its 249 names exclude August and then-live registered names. Its `main_sha` is `16acf7594a3fe8559af89491b895f440b314b99e`; its receipt declares `closure_claim=false`. CA-COUNT's final Astra review confirms that the old validator never opens this list and that neither recount evidence nor the third amendment supplies denominator authority. Item 9.b supplies the fourth input-change authority; the supplied ruling now resolves how it participates in the combined approval.

CA-SEAL's FIX8 contract supplies the strict-parser and anchoring model used by this implementation. Duplicate keys, non-finite numbers, BOM, trailing data and wrong selected types must fail closed. Existing receipt bytes and judgments must be preserved; the new executable requires a truthful byte chain through the third change without rewriting that third receipt. The new helpers, preserved original computation and fresh checks implement those bounded requirements. They award no approval.

## Landing constraints

The scope question is answered by the supplied ruling above. The unchanged August prerequisite inspection completed before implementation, with its failures recorded and no demonstrated canon-drift impossibility. Any canon-drift incompatibility is returned to pm7-build; it is not repaired by this lane.

CA-SEAL and a completed CA-SEAL2 must be assembled as one reviewed landing after their decision dependencies; the third change precedes the fourth in the byte chain. The actual lander fills the respective new author/lander slots as authorized; `claude-projects-refresh` supplies any required final receipt byte anchors at the same landing. CA-SEAL's final DL-412 anchor template and FIX8 receipt remain untouched by this result. No landing of the literal preparation stack is authorized here.

The seal applier must exclude the author, actual lander, stream lead `claude-opus-5.5:pm-ea-lead` (session `b29da1b5-9877-474f-8a4c-e7a57ab7f899`), CA-SEAL, CA-SEAL-FIX1 through CA-SEAL-FIX8, CA-SEAL2 (Codex), CA-SEAL2-FIX1 (Codex), and every other fix worker on these amendments. This is a procedural exclusion, not a rewrite of any existing receipt's checked list.
