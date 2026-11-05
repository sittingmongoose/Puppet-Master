# CA-SEAL2 — fourth recorded seal-check input change

**IMPLEMENTED; PREPARATION ONLY.** Worker CA-SEAL2 (Codex), stream E, VM, 2026-11-05. Branch `plans/ea-seal-check-recount-20261105`, resumed from `5764ca809c0dcc8a161d4fcd45770abf6355f746` on the CA-SEAL FIX8 stack `17c842445a2623bb0334ba8d6932e7a6bf088967`. Final pushed head and worktree cleanup are recorded in the external `DELIVERY.json`. The literal preparation head is not ready for standalone landing or final approval.

## Design in five lines

1. **Combined approval:** one run requires the unchanged August computation and complete outcomes for every one of the 249 frozen recount names; single-snapshot results are diagnostic only.
2. **Recount custody:** strictly byte-pin/parse the original receipt/list and recompute all 597 original source fingerprints and byte counts at their own frozen revisions or exact saved locations.
3. **Separate snapshots:** every receipt identifies both snapshots by their own receipt and fingerprints; no August pin is substituted for recount membership.
4. **Fourth receipt:** pin the validator before/after, DL-451, prior unchanged third receipt, frozen recount receipt/list, author and actual lander through its own exact Spec Lock byte anchor.
5. **Unchanged conditions:** retain per-name decisions, full admission records, twelve-cell depth, unresolved-card blocking and all August gates; stop on any demonstrated canon-drift impossibility without re-stamping.

## Ruling recorded with its actual attribution

The lane's final “Ruling on the stopped question” (2026-11-05 05:00Z, mail `1105050013-eb00`) is **pm7-build's reading of 9.b, not Jared's words**. Final approval requires one combined run; a single-snapshot result cannot supply final approval. This resolves the exact earlier question preserved in the design. Jared's verbatim answer remains “i approve all of it” to the presented deck, SHA-256 `6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30`. No new card or owner answer is invented. DL-451's dependency section pin is `34d27e732c56b5a2d33204f22f4131eb54bd6e7a7f79c762a46ceee46ed78e74`.

## Change record

**Validator before SHA-256:** `319f6bffddb07a36e633fd949146e4ce9149819ea5e817b13897a74314163a91`. **After SHA-256:** `de9d85130aafed77f87bc365d94218db3992691a7e95285739b2c7c802e24321`. CRLF is preserved. The new receipt is `reports/event-authority-20261105/seal-check-recount-receipt.json`; the audit spec gains only its DL-451 section. No earlier receipt or record is rewritten.

The new input reader verifies the exact reviewed `RECEIPT.json` (`1d0ef48f472f2a6c521c6879e4c0b6ab0da98467dfe5b1a7546b3dbcef09a709`) and 249-name `NEW-LIST.json` (`2515ae5af31178a7d7a93581e982977bfb803d4494d779c72bebad9e7700376c`). Relative source inputs are read from Git at `16acf7594a3fe8559af89491b895f440b314b99e`; explicit Git lineage inputs retain their own full revision. Absolute and ignored historical evidence may use an explicit strict location map, but every mapped byte still must match the original source fingerprint and length. The map and resolved locations are pinned in the diagnostic result. Nothing trusts a copied pass flag.

The new audit-side `recount/OUTCOMES.json` reader preserves the existing close path. Each exact name has its own registered, excluded or decision-card outcome. Registration reuses the unchanged complete DL-077/DL-412 admission judgment. Exclusion uses `RECLASSIFY_TO_EXCLUDED`, its own pinned decision naming the exact name, rationale and individually hashed Plans citation spans. Complete saved cards remain unresolved and block final approval. This worker writes no real outcome record. Mechanical pins/name coverage do not replace independent semantic review of decisions and exclusions, just as the old admission predicate does not adjudicate its cited section's meaning.

Only the executable-byte observation traverses the new anchored fourth link; the old DL-412 anchor and independent semantic predicate remain. The entire original August main computation prefix is AST-identical. All original functions except `multi_family_receipt_state`, `post_august_validator_pin`, `main` and `build_receipt` are AST-identical; the first two change only the executable-byte observer. New JSON parsing rejects duplicate keys, non-finite and overflow numbers, BOM, trailing data, wrong roots and selected types. Selected counts/spans require exact integer types. No new number caps, serializers or runtime product contract are introduced.

## Source custody: 597/597 verified, without a re-stamp

The direct initial check found 580 matching inputs, two changed external briefs and 15 ignored currentness files absent from Git. Exact saved editions supplied the 15 files. The original BRIEF-DRAFT prefix and FIX-ROUND text before later additions were recovered and accepted only when complete SHA-256 **and** original byte count matched the receipt: BRIEF-DRAFT `18751f47f1daa8f922fe97655528389f72be7d926e8713ad1baa90551dbe0b03`, 11,421 bytes; FIX-ROUND `4298583e2a69a3a6f6950ff94900b1a4d62b9e35bd151d55df227a27dda032e4`, 8,538 bytes. No original file was edited.

All 15 ignored files and all 11 absolute evidence inputs are preserved as exact bytes in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/resume/recovered-source-bytes/`. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/resume/source-locations.json` is the explicit 26-entry map used by the actual new reader's positive. The remaining 571 inputs retain Git custody. All 597 fingerprints verify. These are saved original sources, not regenerated outputs or a newer edition relabeled as history.

## Tests and limits

| Check | Result |
|---|---|
| Fresh external `CA-SEAL2-checks.py` | **68/68 pass**, exit 0. Actual frozen receipt/list and all 597 sources verify; no final approval is claimed. |
| August own snapshot | Preserved inventory/denominator digest equality and original receipt/source byte identity pass. The unchanged DL-077 predicate passes through synthetic trusted third/fourth anchors. This is diagnostic history verification. |
| Required one-defect negatives | Pass: one list whitespace byte with unchanged size; one source byte; missing fingerprint; mismatched fingerprint; August fingerprint with recount membership; wrong validator in an otherwise correctly anchored fourth receipt; stale DL-451 section pin under an otherwise correct anchor. |
| Additional controls | Pass: strict JSON forms and types; absent/duplicate fourth anchors; scope/author/lander/flag faults; missing/extra/duplicate/mixed outcomes; absent complete admission; unresolved saved card; own exclusion evidence/decision/span/contradiction faults; single-snapshot approval refusals. |
| Original August differential | Pass: original computation prefix, original named checks, original input pins and ordered failures are unchanged. Original run exits 1 with 10 failures; changed run exits 1 with the same 10 plus 2 new pending-input/receipt failures. |
| Real full combined approval | **Not earned.** The preparation stack lacks the landing dependencies, actual lander/anchors and real recount outcomes; August closure/depth work remains unfinished. No all-green full August run or full combined run is claimed. |
| Shard verification | Exit 0, status pass: 99 sources / 3,092 shards. |
| Index validation | Exit 1, parsed top-level fail: **23 findings** with and without the prescribed copied/hash-verified edition: 21 ledger record-shape errors, newer-main-only `DL-302`, one stale untouched readiness artifact. No indexed owner doc, shard or index artifact changed in this amendment. These remain integration findings; no overall repository pass is claimed. |
| Whitespace | Plain `git diff --check` reports preserved CRLF as whitespace; `git -c core.whitespace=cr-at-eol diff --check` exits 0. |
| Full governance/landing gates | Not run; no landing or governance edit is authorized. |

No `tests/` file was added or edited. The regression harness and fixtures execute externally; its exact retained path is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/resume/CA-SEAL2-checks.py`. Reproduce with `python3 -B <that-script> --repo <fresh-branch-checkout> --source-map /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/resume/source-locations.json --out <external-result.json>`. Runtime fixture directories clean themselves up. The compact check results are committed beside this report. No unnamed test-file allowance is used.

**Guard isolation:** each required negative starts from a passing fixture and changes one invariant; receipt semantic controls refresh their fixture byte anchor to isolate the semantic fault. A full site-by-site guard-removal inventory is **not claimed**. Under the 04:45Z shared-tool ruling, adoption of `scripts/pm_guard_isolation.py` and its full proof inventory remain a cross-lane sweep item; there is no lane-local proof engine. Review must still reject a masked fixture, a missing real-guard negative or an accepting product guard.

Astra recurring classes exercised here are digest/source recomputation, joined snapshot identity, historical snapshot preservation, strict representations/types, whole-file byte counts, custody before outcomes and no source-only approval. Storage-assigned metadata, payload externalization, schema reference graphs and formatted time/URI/UUID fields are not introduced by this change. No family PASS grade is manufactured from these checker tests.

## Landing order and exact receipt anchor

1. Land the answered-card authority/test allowances and frozen recount dependencies as required by stream E. Re-read the DL-451 section and frozen input bytes on the assembled tree. Preserve the two snapshots and every earlier record.
2. Assemble **CA-SEAL before CA-SEAL2 in the same final reviewed E landing**. Fill CA-SEAL's authorized actual lander/receipt first, keeping its prior history and required DL-412 anchor contract.
3. The actual lander runs `python3 -I -B reports/event-authority-20261105/write_recount_receipt.py <landing-tree> --lander <actual-lander-task>`. This writes only the new fourth receipt, pinning the actual final third-receipt bytes and live validator/DL-451 section.
4. **claude-projects-refresh** supplies the exact third and fourth receipt entries in `canonical_ssot_hashes.files` at that same landing. The pending fourth receipt's null lander and its pending digest are not final anchors. This worker does not edit Spec Lock.
5. Apply the named fixture companion in its authorized integration step and perform independent Sol/Astra reviews before and after, plus the prescribed landing checks. The unanchored preparation tree must not be merged alone. Real outcome/depth work and every existing approval condition remain required before final approval.

Exact **new fourth-receipt** entry template:

```json
{
  "path": "reports/event-authority-20261105/seal-check-recount-receipt.json",
  "sha256": "<SHA-256 of complete final receipt after actual lander and prior-receipt pins are filled>"
}
```

The existing DL-412 entry/template remains separately required exactly as CA-SEAL specifies; there is no new DL-077 entry. Later changes to the new receipt require its authorized byte anchor to follow the final bytes.

**Seal-applier exclusion:** the author, actual lander, stream lead `claude-opus-5.5:pm-ea-lead` (session `b29da1b5-9877-474f-8a4c-e7a57ab7f899`), CA-SEAL, CA-SEAL-FIX1 through FIX8, CA-SEAL2 (Codex), and every other fix worker are barred. The checked new receipt list contains author and actual lander; broader exclusions stay procedural.

## Scope, resources and open items

No admission, registry change, real outcome record, August list/fingerprint/freeze edit, earlier receipt/record edit, Decision Log edit, Spec Lock edit, `.evidence` edit, auto-decision edit, `.gitignore` edit, seal, main push, mailbox action or subagent occurred. No PlanUnit IDs, families or product bindings were minted. The audit specification is outside the configured 99 indexed/sharded owner sources; no indexed owner document or generated artifact was edited or regenerated.

Before worktree creation: 64 GB free disk, 19 GB available memory; lowest sampled available memory was 8 GB, so the under-6 pause was never triggered. One 0.96-second legacy-differential invocation overlapped the index-with-edition rerun; subsequent checks were sequential. This scheduling deviation is recorded rather than claiming every checker was sequential. No browser or server was started.

**Stopped question: none.** The earlier certification-scope question is resolved by the supplied ruling. No observed August failure demonstrates an impossible predicate caused by canon moving since August. Its current failures remain visible, not waived. The actual outcomes, legacy unfinished prerequisites, coordinated landing assembly, independent reviews, shared guard-isolation sweep and the 23 index findings remain open integration work. This report awards no final approval.

## Retained evidence

All files below are under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/resume/`; each reference is by that full directory plus filename and SHA-256.

| File | SHA-256 |
|---|---|
| `CA-SEAL2-checks.py` | `ce2e04b8e7ef6e91afcca8caf73a2f6eef0467eaa45ff46263daee265e8617e0` |
| `check-results.json` | `fb5375109e14ca1ff8976a0e2f6a71ba40a1a8cdc45429356d9862efd24230a9` |
| `source-locations.json` | `154b4a3f4f89faa79d96b08b3600a9d947ea741004d58c3107aa005bca25360a` |
| `recount-source-verification.json` | `6956c8bd486657aacbe1bd48e16299316fa434a0c8224156f2f5eef0df3e0ab5` |
| `legacy_differential.py` | `35f3d2cf3548c2bd132a268d5ae7ea2add29595961998b3be9001495725987f0` |
| `legacy-differential.json` | `a240796ec237f42f8d457d64a6eea8455f97f5f38a9cc707773c29cde88448e0` |
| `shard-check.json` | `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21` |
| `index-validate.json` | `5700eb94f8e49e61f8df5b750185b3a09d59208e1c4cc733de1a9d3c403ff860` |
| `index-validate-with-edition.json` | `c81f7ee63045fb6d4d008be50c4ed3c792d4ffac0d0d636ed2148e6ff6e7c082` |
| `currentness-edition-copy.json` | `daf80cdc1395935c791eed463d54ff4d0405f90ce97f39f12e10fbb0a547f8ac` |
