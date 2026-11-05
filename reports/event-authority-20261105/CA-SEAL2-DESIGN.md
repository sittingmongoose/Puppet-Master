# CA-SEAL2 design — stopped for certification-scope decision

**Status: STOPPED BEFORE IMPLEMENTATION.** Worker CA-SEAL2 (Codex), stream E, 2026-11-05. This is a design/decision-return document, not an implemented fourth change, change receipt, seal or admission.

Branch: `plans/ea-seal-check-recount-20261105`, based on CA-SEAL `17c842445a2623bb0334ba8d6932e7a6bf088967`. The unchanged validator SHA-256 is `319f6bffddb07a36e633fd949146e4ce9149819ea5e817b13897a74314163a91`.

## The design in five lines

1. **Selection is unresolved:** return the question below before choosing what a final seal run certifies or whether both snapshots must pass.
2. **Recount custody:** a future implementation must bind the exact recount receipt and 249-name list, recompute every named source-file fingerprint against its frozen source, and reject any missing, changed or mismatched input.
3. **Snapshot separation:** preserve August's list, fingerprints and freeze digest at their existing paths; never present an August fingerprint as proof of recount membership.
4. **Fourth-change receipt:** record the precise delta, unchanged requirements, before/after validator hashes, DL-451 section pin, recount receipt/list pins, author and actual lander; determine its final byte-anchor entry only after a complete authorized design exists.
5. **Preserved requirements:** retain per-name decisions, complete saved/admission records, twelve-criterion depth and all other approval conditions; the change grants no definition-writing, registration, app recording or final approval.

## Exact stopped question

> Must the final Event Authority approval require the existing August checks and complete per-name outcomes for the separately frozen 249-name recount to pass together, or may runs certify one explicitly selected snapshot separately? If separate snapshot certifications are allowed, which certification or combination is required for final approval, and how must each result identify its scope?

No option is selected by this worker. In particular, an optional recount reader with an August-only overall `pass`, a new mandatory recount gate, and a selector that substitutes the recount for August would make different approval claims. The approval text permits the new input and preserves existing requirements; it does not explicitly specify that selection/aggregation rule. A mechanical source-integrity success cannot decide that rule.

The lane explicitly requires: "If the design needs a choice the 9.b text does not give (for example which list a given seal run certifies, or whether both must pass), stop and write the exact question." This document takes that branch of the instruction. There is no executable or spec edit, new change receipt or Spec Lock entry template in this result.

## Approved authority, unchanged

Jared's recorded answer is **"i approve all of it"**, selecting A on the unchanged deck, whose SHA-256 is `6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30`.

Item 9.b option A, verbatim:

> Approve a fourth recorded change so the final approval check can read the separately frozen recount and verified proof of its source files. Review the change before and after; keep a saved change record (“receipt”) stating exactly what changed and which requirements remain. Preserve August’s list and fingerprints as history. Keep every per-name decision, complete saved-record requirement and other approval condition. This permits checking the new list; it grants no definition-writing permission, registers no event, enables no app recording and awards no final approval.

Its Sources line, verbatim:

**Sources:** `COUNT:reports/event-authority-20261104/census-recount-20261104/REPORT.md:46-62`; `COUNT:reports/event-authority-20261104/census-recount-20261104/REPORT.md:315-331`; `COUNT:reports/event-authority-20261104/census-recount-20261104/REPORT.md:413-428`; `evidence:reviews/CA-COUNT-sol/REVIEW.md:91-103`; `evidence:reviews/CA-COUNT-sol/REVIEW-cycle2.md:108-112`; `ANS:Plans/Decision_Log.md:4640-4645`; `MAIN:Plans/Decision_Log.md:419-424`; `evidence:reviews/CA-COUNT-sol/REVIEW-astra.md:1-8`; `evidence:reviews/CA-COUNT-sol/REVIEW-astra.md:126-131`; `evidence:reviews/CA-COUNT-sol/REVIEW-astra-2.md:1-12`.

The answer and as-presented deck are under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/`. The exact stop instruction is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/CA-SEAL2.md`, Do item 2.

## Why selection affects the approval contract

At the pinned CA-SEAL base, the validator's `DENOM` is the August `FRESH_CENSUS_DENOMINATOR.json` (line 30). `main()` requires and loads the August census, ledgers and freeze (lines 793–839). Its pre-seal prerequisite, denominator, depth and overall-pass predicates (lines 1888–1927) compute one result, and `build_receipt()` (lines 2000–2030) has no certified-snapshot selection. The spec calls the August denominator the sole fresh denominator contract. Reading another list without defining how that list participates in these predicates would leave the approval claim ambiguous.

The recount at `c53e4199ae94ca853a197354f3f9e7f296cf1efc` is explicitly separate discovery/adjudication evidence, not an admitted denominator. Its 249 names exclude August and then-live registered names. Its `main_sha` is `16acf7594a3fe8559af89491b895f440b314b99e`; its receipt declares `closure_claim=false`. CA-COUNT's final Astra review confirms that the old validator never opens this list and that neither recount evidence nor the third amendment supplies denominator authority. Item 9.b supplies the fourth input-change authority; the lane still reserves the scope choice if needed.

CA-SEAL's FIX8 contract supplies the strict-parser and anchoring model for a later implementation. Duplicate keys, non-finite numbers, BOM, trailing data and wrong selected types must fail closed. Existing receipt bytes and judgments must be preserved; the new executable requires a truthful byte chain through the third change without rewriting that third receipt. None of that is implemented or claimed here.

## Resume and landing constraints

Resume only after the exact scope question is answered. Re-read that answer and the current owner authority, complete this design, then implement and test the bounded fourth change. Do not infer a new answer from this stopped report.

CA-SEAL and a completed CA-SEAL2 must be assembled as one reviewed landing after their decision dependencies; the third change precedes the fourth in the byte chain. The actual lander fills the respective new author/lander slots as authorized; `claude-projects-refresh` supplies any required final receipt byte anchors at the same landing. CA-SEAL's final DL-412 anchor template and FIX8 receipt remain untouched by this result. No landing of the literal preparation stack is authorized here.

The seal applier must exclude the author, actual lander, stream lead `claude-opus-5.5:pm-ea-lead` (session `b29da1b5-9877-474f-8a4c-e7a57ab7f899`), CA-SEAL, CA-SEAL-FIX1 through CA-SEAL-FIX8, CA-SEAL2 (Codex), and every other fix worker on these amendments. This is a procedural exclusion, not a rewrite of any existing receipt's checked list.
