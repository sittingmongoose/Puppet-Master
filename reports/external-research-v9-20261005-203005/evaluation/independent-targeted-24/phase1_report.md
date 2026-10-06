# Independent targeted 24 — D-V09-A current critic partial-source review

The observable role delivery is INCOMPLETE: R1's `out/critique/source.md`, R2's `out/critique/implementation.md`, and R3's `out/critique/review.md` are all absent in the frozen dispatch. Critic semantic quality, designated-final quality, and full-pipeline quality are UNASSESSED. Downstream resolve_final is UNSTARTED. These three aliases are role views; they are not three independent arms. No winner, effect, quality equivalence, or repair credit follows from the shared absence of reports.

This is a narrow source-artifact assessment. R1 and R2 have no partial body. R3 has a documentation line map and five Java source captures. Their availability demonstrates source/locator working material only. They do not contain a useful critic judgment, candidate correction, preservation decision, false rejection, issue/fix/test chain, executed behavior witness, or a standalone final. The exact stage overrides require the critic paths above; I have not imposed the four final-delivery paths on these roles.

## Criteria and role coverage

The exact supplied inventory is A01–A12, Q1–Q8, A-P1–A-P5, and D-V09-A-P1–P3, plus the three diagnostic obligations. All semantic coverage remains UNASSESSED. In particular, no report enables assessment of correct cross-boundary corrections, preservation of supported unrelated claims, or the candidate's resolution of the critics' evidence. The public files are useful material but cannot be counted as a completed mechanism or independent candidate discovery. The full rows and precise source locators are in `phase1_judgement.json`.

## Independently checked source facts

SF01: the map's 411 contiguous text lines reconstruct its declared input hash exactly, without a trailing LF. The document title identifies QuPath 0.7.0, while its metadata identifies a stable documentation slug. This is internal mapped-byte verification; the original source_context capture receipt is not separately supplied.

SF02: the five Java files exactly match public QuPath v0.7.0 tag bytes. Retrieval URLs, access clocks, full hashes and local read-only captures are pinned in `evaluator_public_captures/source_identity_checks.json`. These are upstream source captures rather than candidate-authored QuPath implementation changes.

SF03: the mapped documentation specifies full-resolution pixel coordinates and a top-left origin for shape export. QP delegates object export to PathIO, whose Gson route reaches the PathObject and ROI adapters. The inspected coordinate serializer emits x/y with a default two-decimal setting; that route does not itself apply physical calibration or display downsampling. This is a static route fact, not a complete transform/UI or pixel-center claim. Primary code: [QP v0.7.0](https://raw.githubusercontent.com/qupath/qupath/v0.7.0/qupath-core-processing/src/main/java/qupath/lib/scripting/QP.java), [ROITypeAdapters v0.7.0](https://raw.githubusercontent.com/qupath/qupath/v0.7.0/qupath-core/src/main/java/qupath/lib/io/ROITypeAdapters.java).

SF04: FEATURE_COLLECTION selects a FeatureCollection wrapper; otherwise PathIO chooses a single object for one item and a list for other cardinalities. PRETTY_JSON and EXCLUDE_MEASUREMENTS have their own formatting/exclusion branches. These options are not coordinate-calibration instructions. Primary code: [PathIO v0.7.0](https://raw.githubusercontent.com/qupath/qupath/v0.7.0/qupath-core/src/main/java/qupath/lib/io/PathIO.java).

SF05: a nondefault ROI plane is serialized as a foreign member with c/z/t, and the ROI-reader branch reads it. The separate bare-geometry import branch creates an annotation on the default plane. These branches must not be collapsed into a universal loss-or-preservation claim. Primary code: [GsonTools v0.7.0](https://raw.githubusercontent.com/qupath/qupath/v0.7.0/qupath-core/src/main/java/qupath/lib/io/GsonTools.java), [ROITypeAdapters v0.7.0](https://raw.githubusercontent.com/qupath/qupath/v0.7.0/qupath-core/src/main/java/qupath/lib/io/ROITypeAdapters.java).

SF06: the documentation describes polygonal GeoJSON ellipses. QuPath's ROI adapter additionally writes an isEllipse foreign member and reconstructs an ellipse from the envelope when reading it. This is a QuPath-specific route, not universal exact losslessness in external consumers. Primary documentation: [Exporting annotations](https://qupath.readthedocs.io/en/stable/docs/advanced/exporting_annotations.html).

No behavior witness was executed, and no candidate behavioral retest, native Goal, or feedback was performed. Public-byte retrieval and static identity/route checks are evaluator work, not candidate execution evidence. The seed proposal and semantic critic reports are absent from this packet, so these source facts establish no actual candidate error or successful correction.

## Integrity, blinding and clock limits

I checked only exact admitted packet files and these bounded public source identities. Input copies, manifest, captures, judgment and report are read-only before key release. The frozen integrity proof reports all original five quiet flags and exact host-unit/cgroup/PID matches. R2's outer release is absent by design; no new aggregate-release profile is invented. Native histories, statuses, model identity, economics and membership key remain held in P1.

Exact RoleTasks reveal whole versus complementary critic mechanisms, so perfect blinding is not claimed. Role-to-original membership remains gated. The actual source start is recorded in `source_start_receipt.json`; reservation/preparation was separate. P2 is a literal 600-second interval from the immutable P1 freeze and includes key wait, key inspection, report and all mandatory handoffs within the single 1800-second whole interval. There is no clock reset.
