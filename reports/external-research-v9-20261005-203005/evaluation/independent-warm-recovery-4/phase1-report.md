# Independent source review of the frozen actual partial artifacts

Evaluation: independent-warm-recovery-4. Pair: I-05-treatment-BLIND-SOURCE-FIDELITY-R001. Phase 1.

## Boundary and outcome

The designated final is null. The four canonical final artifacts are absent in the admitted packet. **Final scientific quality and whole-pipeline quality remain UNASSESSED.** This review assesses the actual frozen working proposal/catalogs and the candidate-authored critique report only. It does not promote working output, replace any original grade, establish fresh/matched/causal credit, or compare with another arm.

The critique report belongs to the same candidate native combined critique+repair Goal. Its own independent-audit wording denotes its candidate-authored audit of predecessors; it is not an independent Sol assessment. The report correctly discloses that predecessor wording/catalogs could not be accessed and that its text is a replacement proposal rather than a verified preservation delta. This evaluator likewise received no predecessor bodies and cannot establish semantic preservation.

Task, role, arm and requested-model hints were unavoidable in the assignment and actual task. No perfect blinding is claimed. Identity key, native conversation/status/history and economics were not read before this freeze. Physical model/provider are UNKNOWN.

## Independently checked useful partial content

1. The selected OME-NGFF 0.5 source pin and the ome-zarr-py 0.20.1 tag/commit are genuine. The spec supports the proposal's Zarr v3, dimension/order, sequential-transform and integer-label summaries. The pinned reader uses Dask arrays; ZarrLocation.load calls from_zarr. This is useful read-path evidence, with performance and complete interoperability explicitly unproved.
2. Pinned tifffile README confirms the TIFF/BigTIFF/OME-TIFF and strip/tile/page/series/pyramid mechanisms, version 2026.9.20, and codec dependencies. Its tag object resolves to the proposed commit. A restricted adapter and representative-file gates are justified; these sources do not establish the 3 GB target.
3. Napari's versioned Shapes/Labels descriptions and v0.9.2 release establish a separate viewer/annotation interaction precedent. It is independently useful relative to the two reader repositories. The application shell's durable coordinates, persistence and export responsibilities are product choices, not inherited guarantees.
4. The issue/fix/regression-test chain is real: issue #9072 reports the direction/orientation problem; merged PR #9389 names the issue and changes renderer/camera conversion; its patch contains orientation/angle property tests against a real VisPy camera and round-trip tests. The merge commit is an ancestor of the v0.9.2 release commit, and the release lists the PR. The proposal properly limits this lesson to rendering orientation. Neither the candidate nor this evaluator ran upstream tests.
5. The proposal covers the create/import/inspect/navigation/annotation/save/reopen/export plan, original-data immutability, display-versus-resampling distinction, scope metadata, unsupported-input feedback, styles, keyboard operation, undo/redo, reference-versus-portable bundles and qualified recovery. These are planned behaviors, not proved application capabilities.
6. W1's declared scale-then-translation arithmetic and inverse expectation are correct for its stated three-axis input. Code and stdout text hashes match their catalog entries. The nonidentity translation makes order observable. Execution receipts were not supplied in this source packet: actual execution is UNKNOWN, not never executed. W0 remains a declared setup failure. No candidate code was run or retested here. W1's narrow arithmetic scope and all proposed application checks are honestly labeled.
7. The useful follow-up inventory remains accessible in working/leads.json: representative 3 GB access; locked dependency/hardware interoperability; instrument axes/codecs; real-filesystem recovery; annotation/export round trips; optional immutable dataset exchange; the Qt slice-viewer alternative; and bounded future reader extension. None is credited as an adopted or executed capability.

## Source-grounded findings in the partial artifacts

**F1 — Unsupported categorical exclusion of OME-Zarr 0.5 writing (MEDIUM; Q2/Q3/Q4, A07/A10).** Proposal lines 9 and 37 and review lines 14 and 27 turn a historical FormatV05 docstring into a current pin-wide no-writing claim. The docstring does contain “writing not supported yet”; preserving that observation is valid. However, the same commit's writer.py has a current-format/Zarr-v3 write path, accepts version 0.5 in write_image, and writes namespaced metadata. The same commit's tests/test_writer.py parameterizes FormatV05, writes images/groups, checks v3 metadata, and invokes the v0.5 model validator. These are source contradictions to the categorical exclusion, not this evaluator's execution results or a universal compliance guarantee. Keep the product's read-only input policy and sidecar choice; qualify writer support using the applicable code/tests instead of inferring absence from that changelog comment. This false negative could improperly discard a useful export alternative.

**F2 — Incomplete declared transform/reader boundary (HIGH design dependency; Q1/Q2/Q3/Q5/Q7, A02/A03/A10).** Proposal lines 37, 46 and 50 speak of per-resolution scale/translation as the physical-coordinate mapping. The spec also permits multiscales-level transformations applied after dataset-level transformations. The inspected Multiscales reader exposes dataset transformations in node.metadata; its shown path does not expose the extra multiscales transform there. The partial proposal does not explicitly require its adapter to compose both levels or reject this valid input case. For a dataset identity mapping followed by group scale [2,3] and translation [10,20], index [4,5] maps to [18,35], not [4,5]. This is a source-derived arithmetic illustration, UNEXECUTED, not an application failure. The exact annotation reference resolution/dataset also needs an explicit contract when pyramid levels change. Generic “understood transforms” and raw metadata retention do not yet resolve which complete mapping drives stored/exported coordinates. The correction can preserve the narrow support choice: define the composition/reference resolution or expressly refuse the unsupported case before annotation. No blanket claim that the reader or proposed app always loses transforms is made.

**F3 — Critique source identifiers do not resolve to the supplied catalog (MEDIUM reproducibility; Q2/Q8, A07/A08/A12).** The report uses S3–S7 for ome-zarr compatibility, S8–S10 for TIFF, S11–S13 for viewer docs and S14–S17 for the issue chain. The actual catalog has only S1–S10: ome-zarr is S2, TIFF S3, viewer S4–S6, and the chain S7–S10. The proposal generally uses those correct identifiers. Repair report references while preserving the verified mechanisms; do not penalize the correct proposal claims as absent merely because its report's mapping is wrong.

**Evidence/delivery limitations, separated from source errors.** No independently authenticated W0/W1 execution receipt, original predecessor text, canonical final bundle receipt or canonical final body was admitted before freeze. The report's bundle-submission wording is candidate self-report and does not establish carrier commit or final delivery. Final absence is an actual delivery incompleteness boundary, not evidence that every partial scientific claim is false. No inference is made from absent receipts that an action never executed.

## Actual declared coverage

All 12 obligations, all eight common dimensions and all five important checks were considered in the actual partial scope. Every designated-final assessment remains UNASSESSED because no designated final exists. No weighted or aggregate score is invented.

| Obligation | Partial-artifact coverage / assessment |
|---|---|
| A01 | COMPLETE planned workflow and restricted imports; no final/application credit |
| A02 | PARTIAL: explicit axes/units/scopes, but F2 transform/reference-resolution dependency |
| A03 | PARTIAL: display/resampling/export provenance preserved; physical export depends on F2 |
| A04 | PARTIAL: bounded-access mechanisms and honest proposed 3 GB gates; cache budget and actual responsiveness not established |
| A05 | PARTIAL: digest status, relinking, reference/bundle tradeoff and qualified generation recovery; directory-store identity details and real-filesystem behavior remain open |
| A06 | COMPLETE textual styles/undo/redo/keyboard/accessibility plan; actual UX UNEXECUTED |
| A07 | PARTIAL: independently useful reader/viewer mechanisms verified; F1 source interpretation error; discovery process not independently audited |
| A08 | COMPLETE source-history chain with causal/release limits; upstream execution not claimed |
| A09 | COMPLETE useful optional exchange opportunity and plausible Qt alternative; adoption deferred |
| A10 | PARTIAL coherent bounded stack and honest integration unknowns; F1/F2 remain |
| A11 | PARTIAL correct narrow arithmetic expectation and honest proposed checks; execution UNKNOWN pending independent receipt |
| A12 | UNASSESSED final/preservation delta; useful leads remain accessible; F3 affects report reproducibility |

| Dimension | Partial assessment |
|---|---|
| Q1 | PARTIAL: substantial plan coverage with coordinate/persistence specifics still open |
| Q2 | PARTIAL: many pinned claims supported; F1/F2/F3 identified |
| Q3 | PARTIAL: justified separation and bounded choices; transform dependency unresolved |
| Q4 | PARTIAL: useful independent precedents/real failure chain; false writer exclusion and no novelty comparison |
| Q5 | PARTIAL: expectation correct; receipts UNKNOWN; proposed checks preserved |
| Q6 | UNASSESSED: original predecessors and designated current final absent |
| Q7 | COMPLETE in partial scope: explicit performance/integration/recovery/round-trip unknowns and honest narrow limits |
| Q8 | PARTIAL: readable working catalogs and matching W1 text hashes; report identifiers inconsistent; no final delivery proof |

| Important check | Partial scope result |
|---|---|
| A-P1 | PARTIAL: >=2 useful implementation mechanisms and issue/fix/test chain verified, with F1 and discovery-provenance boundary |
| A-P2 | PARTIAL: substantial supported contract; consequential F2 dependency and F1 exclusion |
| A-P3 | PARTIAL: arithmetic/input/expected/output text checked; execution receipts UNKNOWN |
| A-P4 | UNASSESSED final preservation; honest inaccessible-predecessor disclosure retained |
| A-P5 | COMPLETE textual minimum/opportunity/alternative coverage; application gates unexecuted |

The assignment's three targeted-check slots are NOT_APPLICABLE_INTEGRATED_FULL_BRIEF. The admitted dispatch has no targeted predeclared checks. No new three-part rubric or evaluator-selected answer key was constructed.

## Reproducible evidence

Candidate input and artifact paths/SHA-256 pins are in source-pins.json. Independent public URL/access/pin/capture records are in public-captures/manifest.json and followup-manifest.json. Their hashes are byte identity, not semantic proof. Dynamic GitHub PR/release/comparison responses may differ from earlier captures; commit/head/merge/tag fields and exact pinned implementation bytes were checked separately.

- NGFF: public-captures/ngff-index.body SHA-256 eb1db17835a6b01cfce3f23479575c63a300d7ee9ee4d3b0fb3ae55a4fe9a6a0; lines 46–57, 163–173, 244–284, 342–351. https://raw.githubusercontent.com/ome/ngff/8a0f886aac791060e329874b624126d3530c2b6f/0.5/index.bs
- Reader: public-captures/omezarr-reader.body SHA-256 c46ba936598885a0119bb23452d9ed74f87258a5169daee615d028373c6a88f4; lines 270–322. IO: omezarr-io.body SHA-256 1634671130537678bf72da5d8aab1ad2e32b540e53ee25b0ab7b3320c97cec22; lines 138–145. https://github.com/ome/ome-zarr-py/tree/0ac3207b12c6a5eb60b9fa4cab0b31bc2d1d35a7/ome_zarr
- Format: omezarr-format.body SHA-256 82b61d30f62d6eddd81ff63b43146fd4f7be93be767ae5561b74a99951c24eca; lines 368–387. Writer: omezarr-writer.body SHA-256 9ac51ec29f05bebe83f3b87d072390e237c7eee13e689ce1066147b52b436363; lines 248–262, 565–585, 675–685, 734–750, 1003–1025. Tests: omezarr-writer-tests.body SHA-256 2451038511aa0f8a6100c029c6b2bfa7c077be99350dc656ecbbb7ced75c4043; lines 57–69, 303–307, 324–342, 344–380. https://github.com/ome/ome-zarr-py/tree/0ac3207b12c6a5eb60b9fa4cab0b31bc2d1d35a7
- TIFF: npar-tifffile-readme.body SHA-256 cdd8ac84f44555750b8d61d04d46259ca9e2cb52b3d460b11a0323cad59e1a48; lines 7–31, 40, 67–84. https://raw.githubusercontent.com/cgohlke/tifffile/a14e516c4fa3c0c9ede980ebb3111260347dd213/README.rst
- Issue chain: napari-issue.body SHA-256 d5667c7055df935d3ed011b4a4854a469406c7f4df89ebeebc114ef382df466a; body; napari-pr.body SHA-256 c2232de4b008ad4dca7333d578a465232b74ba26fb05997f13e55d79a90f921a; body/head/merged/merge_commit_sha; napari-pr-files.body SHA-256 ce9d1a8587d00cfc2b0a0bf23d6817b06f0a23c96e35a2c75d415fa9349ae1bf; named camera test/code patches; napari-release-compare.body SHA-256 a3418c6384cf3df675c7ca4b06623a6fef635a48ffb8ccf59dc09db7996e1902; status/ahead_by/behind_by/merge_base_commit.sha; napari-release.body SHA-256 1f6b6075e4f3f8fb134e9f049a511dd2c29fd1d3ac9811d54c730838f909b520; tag/target/body PR #9389. https://github.com/napari/napari/issues/9072 and https://github.com/napari/napari/pull/9389

The review used public retrieval and static inspection only. No candidate/native/model test, browser, worker Goal, upstream test, application run or witness retest was performed. No private/native/old-grade/economics data entered Phase 1. Original SOURCE_START and budgets are in source-start.json; reservation time was not used as START or reset.
