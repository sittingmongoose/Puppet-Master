# I01 current-output evaluation

The available anonymous final **B fails the screen**. It contains useful source-backed research and three real candidate executions, but it misses three required catalogs and has consequential source/applicability and witness defects. Anonymous A has no designated final: its operational failure and **UNASSESSED quality** are separate. This is an incomplete pair, with no paired winner or quality-equivalence claim.

The immutable Phase 1 judgment was saved at **2026-10-05 22:09:00 UTC**, before opening candidate stage history or economics, at `current_output_judgment.json` SHA-256 `9a3d2bcbabfca57057131b83a8545e06d933202f79fc950e2e1575881f5c3ff9`. Assessment began at 21:59:32 UTC under the original 1,200-second screen target and 1,800-second total limit. The exact proposal pin is `f0022e3e23d4156b7816b24dd7a57e2676e9b00d73511a3c00d817a13571ed65`.

## Decisive findings

| Defect | Exact proposal location | Finding and consequence |
|---|---|---|
| I01-B-D01 | Lines 6, 277–288 | `sources.json`, `witnesses.json` and `leads.json` were required but absent. The proposal directs the reader to them for full pins, receipts and deferred leads. Its delivered artifact set cannot satisfy the standalone reproducibility contract. Their absence does **not** prove that research or execution never occurred. |
| I01-B-D02 | Line 124 | The affected-version interval includes tifffile 2026.2.20, which the original issue uses as the unaffected baseline. This changes version applicability and pinning advice. Preserve the genuine issue/fix/test chain while limiting its demonstrated scope. [Primary issue](https://github.com/cgohlke/tifffile/issues/319). |
| I01-B-D03 | Line 52 | The proposal applies general transform vocabulary to the more restrictive NGFF multiscales contract. In the cited commit, multiscales permits scale/translation; `path` is a field, and identity is not an admitted multiscales transform type. Incorrect accepted types threaten interchange conformance. [Pinned specification, multiscales clauses](https://github.com/ome/ngff-spec/blob/d9164040/index.bs#L314-L320). |
| I01-B-D04 | Lines 135, 150, 201 | The proposed TIFF support includes strips, but the claimed allocation bound assumes only small viewport tiles materialize. The pinned reader uses actual strip/tile geometry and decodes a complete chunk; a full-height compressed strip can be an entire plane. A cache limit cannot cap the preceding decode allocation. This needs a qualified support boundary or decode-size rule. [Chunk geometry](https://github.com/cgohlke/tifffile/blob/v2026.9.20/tifffile/tifffile.py#L8251), [store initialization and decoding](https://github.com/cgohlke/tifffile/blob/v2026.9.20/tifffile/zarr.py#L779). |
| I01-B-D05 | Line 242; W3 code | W3 compares the post-save/post-append file against a hash from an earlier project version. Its Boolean is already true before the whitespace append. Removing the purported tested change produces the same result, so that subcheck cannot discriminate byte-change sensitivity. This is a witness-design defect; SHA-256 itself is not alleged broken. Exact candidate code/receipt and the evaluator-only counterfactual are pinned in the report. |

## Supported work retained

The investigation established a real calibration issue linked to an implementation fix and regression test. The fix's parent is the test commit; source code and test assertions support the causal lesson. The incorrect version interval does not erase that useful discovery. [Fix](https://github.com/cgohlke/tifffile/commit/edede6002c817f056d75125ade0b20332d549cca), [regression test](https://github.com/cgohlke/tifffile/commit/7d9eaeddc710af068f9e8c2cf30b10a7d0e5c938).

At least napari's display/lazy-array mechanism and tifffile's region-access mechanism are useful, distinct implementation precedents. All twelve brief-obligation topics were inspected: the proposal includes workflow, coordinate/annotation scopes, display/data separation, portability/recovery, resource targets, styles/undo/keyboard feedback, opportunities and alternatives. Topic coverage is not complete semantic certification. [napari image documentation](https://github.com/napari/docs/blob/main/docs/howtos/layers/image.md), [pinned tifffile README](https://github.com/cgohlke/tifffile/blob/v2026.9.20/README.rst).

Actual anonymous receipts confirm **candidate-executed W1–W3**, each exit 0. W1 quantizes both coordinate and calibration to float32; its reported physical error agrees with that code. W2 gives a valid isolated transform-order counterexample. W3 genuinely observes old-file preservation for its simulated pre-replacement exception and an orphan temp file, although its hash subcheck is confounded. These are component checks, not full-application, NFS or crash-durability tests. V1–V8 are correctly labeled proposed/UNEXECUTED and receive no execution credit.

## Coverage and limits

The same five predeclared checks were considered for both aliases. For B: A-P1 found useful precedents and the real chain plus the applicability error; A-P2 found the normative/allocation defects; A-P3 assessed all three claimed executions; A-P4 assessed current errors and missing delivery while history-dependent preservation stayed unassessed; A-P5 inspected all twelve actual obligation topics. Every corresponding A check is UNASSESSED because its current artifact is missing.

The screen assessed fourteen consequential claim groups completely and left ten groups partial or unassessed, explicitly listed in the judgment/report. Remaining scope includes all QuPath changelog/layout assertions, broad dependency/interoperability support, exact release/fixture claims, multi-file recovery, and stage-history preservation. No whole-case PASS or comprehensive audit is claimed. Optional adoption stays optional; legitimate proposed validation and qualified uncertainty are retained.

Blinding was partial. Coordination disclosed candidate family/model and which arm was expected to supply the final before assessment; anonymous filenames cannot undo that. The final itself includes a critique-resolution summary, which was judged as current text rather than independently verified history. Economics, private alias mapping, prior current grades and actual stage semantics were withheld until the Phase 1 snapshot. Requested evaluator configuration is GPT 6.1 Sol xhigh; observed configuration remains unverified unless the coordinator supplies a platform receipt.

Evaluator-only arithmetic, identity and strip-size counterexamples are distinguished from candidate execution. An initial private arithmetic check held calibration fixed; after reading W1 code, the evaluator recorded the different assumption and assigned **no W1 arithmetic defect**. No findings or expected answers were supplied to candidate inputs or prospective successors.

## Post-judgment operation and economics

The separately pinned projection was opened after the Phase 1 snapshot. It records GLM 5.3 Flash with observed `max` effort on all four native stages. Control research and critique completed; its final stage capped after producing an actual proposal, while three required catalogs were absent. Treatment research capped despite producing its research artifacts, so its dependent critic/final never started. All four stage jobs were reported quiescent. Neither whole pipeline qualifies as operationally completed; the treatment research output was not substituted for a final.

| Recorded stages | Native starts | Sum of disjoint stage elapsed time | Known provider total field |
|---|---:|---:|---:|
| Control research/critique/final | 3 | 2,432.43 s | 6,201,874 tokens |
| Treatment research only | 1 | 1,175.77 s | 1,790,311 tokens |

The failure-inclusive stage elapsed sum is 3,608.20 seconds; it is occupied stage time, not a pair critical path. Known exported provider totals sum to 7,992,185 tokens. Reported input/total already include cached input, so cache-read is not added again; UI counters are a different accounting view and are not summed with provider attempts. Cancelled partial usage, unexposed child/HTTP cost, billed dollars and evaluator token counters remain unknown. These figures do not support accepted-output economics, an efficiency winner or a speedup claim. The report's measured evaluation wall time was within the original screen target and total limit.

Actual cross-stage preservation, repair/detection and false-rejection rates remain UNASSESSED. The final's own resolution record is insufficient to establish those rates without the withheld prior semantics; no such history review is claimed by this failed screen.
