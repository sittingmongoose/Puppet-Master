# V8-BIO-AMEND-C-L integrated review

**VERIFIED FAILED_SCREEN.** The actual three-stage pipeline completed. Its frozen final proposal is37,553 bytes, SHA-256 `06153823f21ec7518c17f57857b86a394268c15cdd9c72bd2f3df364c9571b0b`. Completion establishes artifact existence and closed execution; it does not establish research quality.

The dominant current-final defect is the overlay fallback in §7 B3 check5, line154. A label lacking dataset coordinateTransformations can be assigned a shared grid from an informative dimension-layout note. [Pinned NGFF0.4](https://raw.githubusercontent.com/ome/ngff-spec/a4c68004fdb8a8d822367205dc12f9574a32ddf8/index.md) lines375–385 require dataset transforms; lines472–475 require label multiscales. The informative layout lines176–179 supplies no physical origin or registration evidence. The fallback contradicts the plan’s own strict refusal elsewhere and fails the brief’s justify-or-withhold obligation. The final leads also expressly retain consequential cursor/API/group-transform/matching dependencies; identifying them does not close them.

A second applicability gap concerns native napari multiscale rendering. The independently captured [release0.9.2](https://github.com/napari/napari/releases/tag/v0.9.2) wheel matches SHA-256 `a67f7add584c8d2560096a0ae0b5322eceba046db42f4c130c8e622c5c72a04f`. Its layer scale/translate are layer-wide; its multiscale path derives level scale from array shapes and translation from crop corners. The final claims that the component supplies per-level transforms without specifying the adapter needed for arbitrary NGFF offsets. For its V1 input, the native default shape-based map places coarse index0 at0µm while the declared level map places it at+0.25 µm. This is source-and-arithmetic diagnosis of the written plan, not executed viewer behavior and not a claim that an adapter is impossible.

The raw-transform overlay gate also omits normalized units and complete group-plus-dataset map comparison. Matching numbers0.5 in micrometers and nanometers imply physical scales differing by1000x. The source itself describes unit-aware physical alignment across layers. B5 has no anisotropic-axis or group-transform fixture; group handling is explicitly open. B1’s concrete dimensionality gate remains the generic format2–5 bound rather than an explicit prototype2D check.

The issue→fix→test history is real and relevant: [ome-zarr-py403](https://github.com/ome/ome-zarr-py/issues/403) explicitly reports scale-only metadata, [PR590](https://github.com/ome/ome-zarr-py/pull/590) closes it, and its merged diff adds scale-derived translations in two implementation paths and changes writer/test assertions. No upstream test-suite execution is inferred. All eight cited primary-source bodies were independently recaptured and matched to the candidate hashes. Napari and stackview are distinct candidate-discovered precedents; stackview’s stated limitations are supported as README documentation absences, not exhaustive capability absences. The corrected V1+0.25, V3 inverse map and V5+1/508 values pass evaluator-owned Fraction arithmetic.

| Facet | Current outcome-level ruling | Findings |
|---|---|---|
| Q1 | ASSESSED_FAILED_APPLICABILITY | F2, F3 |
| Q2 | ASSESSED_FAILED_PROPAGATION | F1, F4 |
| Q3 | ASSESSED_BOUNDED_SOURCE_CHAIN_SUPPORTED | F6 |
| B1 | ASSESSED_WITH_PLAN_GAPS | F5 |
| B2 | ASSESSED_FAILED_COMPONENT_APPLICABILITY | F2, F3, F5 |
| B3 | ASSESSED_FAILED_ALIGNMENT_JUSTIFICATION | F1, F2, F3, F4 |
| B4 | ASSESSED_FAILED_COMPONENT_APPLICABILITY_CHAIN_SUPPORTED | F2, F6 |
| B5 | ASSESSED_FAILED_CONSEQUENTIAL_DEPENDENCIES | F1, F3, F5, F6 |

All three questions and five obligations were examined at final-plan outcome level. Individual remaining subfacets are explicitly UNASSESSED in REVIEW.json and quality-before-method.json. This is a decisive failed screen, not an exhaustive source-correctness PASS or a full-history regrade. No candidate fixture was executed. The generic prevalence and noninteger-resampling motivation remain unsupported beyond the traced implementation.

Original PROPOSAL, its ERRATA and leads, fresh CRITIQUE, and current FINAL_PROPOSAL/leads are preserved byte-for-byte. C1–C7 are carried into the final with supported corrections; false earlier values are properly replaced, not charged as preservation failures. The invalid no-transform overlay fallback is preserved as a current quality defect. Input transfer hashes match.

The quality ruling froze at2026-10-03T02:34:07.301720Z, before the first method-card read at02:34:33.946153Z. The frozen quality JSON SHA-256 is`013f26b33e29664d857ff9b178f615fbfb73f15b5ee5edddceaee692829f9f28`; its entire QUALITY_MANIFEST remains unchanged. Necessary final text had already disclosed simple-complete-control, so blinding was limited.

The exact method card is simple-complete-control, identical 473-byte content across all stages, SHA-256 `fbd9aa39f44f37d1e81b64f145c1ebe3434f8a1acdefd4e26612b6c2d5a91f2e`. Structural ordinary-pipeline uptake is observed. No special amendment, witness procedure, proposition table, batching schedule or retrieval waves are assigned; spontaneous ERRATA/arithmetic is ordinary control behavior. Its substantive source-accuracy duties remain unsatisfied for the frozen reasons above. No separate treatment effect or matched-pair comparison is inferred.

Three native activation/Goal receipts are distinct; all three stages use GLM-5.3-Flash/max, the root-attested same account, fresh sessions and positive own-group/cgroup quiescence followed by external stage/case/global-parent closure. Forty inventoried request attempts match provider/model/max and use only the four allowed MCP tools, with zero unexpected tool counts. Native source-deliveries arrays are empty; host capture and stdout byte-range flush receipts establish host delivery, while model reading is UNOBSERVED and semantic acquisition UNKNOWN. No auth/profile/private conversation inspection occurred.

Recorded case wall is2013.646116427 s, occupied stage leases2013.302515745 s, outside-native overhead5.301925008 s, below the original3600/5400/300s caps. Stage charge intervals811.971562143 s,660.289354475 s and540.389597803 s satisfy1200/1200/900s. Token counters are reported public metrics only; full generated usage and absent classes remain UNKNOWN, not zero. A faster failed case is not a quality-equivalent speedup.

The evaluator’s original birth1790994119.8633728 and deadline1790996519.8633728 (2026-10-03T03:01:59.863373Z) include all preparation, reads, fetches, writes, waits and verification; the clock was not reset. Actual evaluation end is recorded in FREEZE.json. Reports and captures stay in the exclusively owned external evaluation folder. Public source excerpts are bounded to25words per source; use source-excerpts-current.md for corrected locator rendering.
