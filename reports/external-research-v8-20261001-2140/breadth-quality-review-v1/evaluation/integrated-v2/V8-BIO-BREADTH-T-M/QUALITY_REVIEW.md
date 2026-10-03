# Artifact/source quality review — V8-BIO-BREADTH-T-M

Disposition: **FAILED_SCREEN**. This is an early decisive screen, not a whole-case PASS or a numeric zero for unassessed facets.

The final proposal's B3 step 4 (FINAL_PROPOSAL.md:159–160) shows the overlay whenever per-level scale and translation equal those of the image. F4/C4 and S4 repeat this decision (lines 176, 185, 197). This gate omits each image/label multiscales-level coordinateTransformations. The independently fetched OME-NGFF 0.4.1 source allows those transforms and requires applying them after each level's transforms (index.bs:376–378). Labels must have their own multiscales metadata (462–463). Association and level-count equality do not replace that composition.

A decisive in-scope counterexample uses y,x micrometer axes, equal two-level shapes, equal level scales [1,1]/[2,2], equal per-level translations [0,0], and a label whose source.image resolves to the open image. The image group transform is scale [1,1], translation [0,0]; the label group transform is scale [1,1], translation [10,0]. Both transforms obey the specified order and dimensionality. The written gate returns SHOW, yet level-0 index (20,20) maps to image world (20,20) and label world (30,20), a 10 micrometer y displacement. A separately transforming renderer could position it correctly, but the written pipeline never requires that behavior and claims declared-geometry equality from insufficient checks. The proposal needs a composed-geometry comparison or an explicit refusal for unequal group transforms.

This is an independent evaluator arithmetic diagnostic of the written rule. No candidate fixture, candidate implementation or upstream regression test was executed. The diagnostic is not a product run receipt.

## Coverage and stopping rule

| Facet | Disposition | Scope |
|---|---|---|
| Q1 components | UNASSESSED | Whole version-specific comparison not adjudicated after decisive screen. |
| Q2 format/calibration/association | FAILED_SCREEN (partial assessment) | Group-transform composition and overlay alignment only; remaining Q2 claims UNASSESSED. |
| Q3 issue→fix→test | UNASSESSED | Read but not independently fully adjudicated. |
| B1 input/read-only | UNASSESSED | Read; no whole-obligation grade. |
| B2 cursor/scale | UNASSESSED | Read; no whole-obligation grade. |
| B3 overlay/switch | FAILED_SCREEN (partial assessment) | Explicit unsafe overlay admission; remaining B3 claims UNASSESSED. |
| B4 precedents/history | UNASSESSED | No complete primary implementation/history audit. |
| B5 steps/validation/limits | UNASSESSED | Read; B3 defect propagates to S4/F4/C4 but no whole B5 grade. |

All initial PROPOSAL.md, initial UNRESOLVED_LEADS.md, CRITIQUE.md, final FINAL_PROPOSAL.md and final UNRESOLVED_LEADS.md were read. The input BRIEF.md and THIN_PLAN.md and scoring-only evaluation-scope.json were read. Actual artifact hashes match PUBLIC_ARTIFACT_FREEZE projections for all stages. The final's arithmetic correction replaces the initial C2 value (11.5,3.65) with (11.5,16.25); correction is not treated as a preservation failure. The initial gate already had this B3 omission (PROPOSAL.md:136), the critic called B3 satisfied (CRITIQUE.md:82), and the final preserved it (159). Therefore the defect survived initial→critic→final. Other preservation facets remain UNASSESSED at this freeze.

## Primary source dependency

URL: https://raw.githubusercontent.com/ome/ngff/0.4.1/0.4/index.bs
Version: ome/ngff tag 0.4.1, source file 0.4/index.bs.
Assigned capture and independently fetched response are byte-identical: 40,372 bytes, SHA-256 592413727ee8d42916bd98007262f48c6139273cb373839c6d285a0ba20b6406. Relevant source ranges: 331–348; 358–378; 457–484. HTTP fetch 200, owned raw response is in raw-external/592413727ee8d42916bd98007262f48c6139273cb373839c6d285a0ba20b6406.body.

Allowed supporting excerpt (23 words; only source quotation published in this review): [third-party verbatim source excerpt omitted; original locator/hash/range retained]

## Blindness and boundaries at quality freeze

METHOD.md, TASK.md, case manifest identity, native receipts and cost were not read before this quality disposition. The candidate artifacts necessarily reveal the case identifier and phrases mentioning METHOD and a bounded shortlist; that limited leakage cannot be undone. The artifact family/model/account are known from parent assignment but did not determine the quality grade. No sibling answer, evaluator key or other case outcome was read.

An initial recursive rg --files inventory accidentally emitted private-runtime filenames from the assigned run (truncated); no private file contents were opened. Subsequent discovery used only exact assigned workspace directory names. No private SDK/auth/profile/canon/Git/ledger/native journal/raw stream content was read. Host receipt/artifact metadata was projected through explicit allowlists. Credential/account/ledger claims will rely on parent attestation.

Source hash/capture does not demonstrate frontend semantic acquisition. Delivery/range receipts and method/provenance will be assessed separately after this immutable quality freeze; acquisition beyond those receipts remains UNKNOWN.
