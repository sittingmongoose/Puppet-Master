> Exported evaluator review. Original SHA-256: `17dae4c5bac2decba27f845a443a3e1025d2f7a579bc9e1c2d2f1eed541380a8`. Source locators and hashes below identify original artifacts; `artifact:` identifiers are nonclickable identities and do not imply included payloads. Declared transformations are in [the reviewer export receipt](reviewer-export-receipt.json). Original private/provisional wording is preserved as historical review context.

# Independent J11 consequential fact and scope review

Selected claims are corroborated, with existing container/default scope holds preserved. The useful narrow additions are **signed calibrated time for CR04** and **checked stride/offset/logical-byte arithmetic for CR10**. They are participant-authored refinements of existing correctness/resource obligations, not new feature approvals.

Native notes SHA-256 `abb59a5fd76aa0fc31550a3decc3d1c0c9fe4b88dc18b70b714da3b35b04c7a1`; 213 lines. Review used captured source/metadata/PR text, hash checks, scalar arithmetic and a reparse of the17already retained CSVs. No new corpus acquisition or viewer,decoder,upstream or schema execution occurred.

## B11-1 — Signed physical time is a supported narrow CR04 refinement

J11 notes lines 28, 30, 199. Status: corroborated_source_plus_arithmetic.

TimeStampTool formatTimeHhMmSs clamps seconds<0 to0 at S00088:14–16; formatTimeWithUnits clamps value<0 to0 at58–60. draw obtains timeline physical time/units at93–101; MultiscaleDims derives time scale/units atS00044:285–287. The full NGFF transform mapping permits negative translation, so scale2seconds/translation−5seconds gives−5 atindex0 and−3 atindex1. These are correct scalar arithmetic and a source-level formatter condition, not an observed AGAVE or Slide Scout negative-time rendering defect. The existing parser/Timeline path was not shown to supply those negative values end-to-end.

CR04 may explicitly preserve signed calibrated time in existing details, with nativeJ11 −5/−3 acceptance. Keep missing units unspecified and the canvas clock overlay optional. This refines existing transform/unit correctness rather than adding a timestamp UI or independent finding family.

Source identities: J11-S00003, J11-S00044, J11-S00088. Exact retained paths, URLs, hashes and passages are in the JSON companion.

## B11-2 — Checked size arithmetic is a supported narrow CR10 refinement

J11 notes lines 58, 62, 195, 197. Status: corroborated_native_proposal_with_source_limits.

J11 itself proposes checked shape/stride/byte-count/index-offset arithmetic, preallocation/upload bounds, >4GiB logical extents with small requested regions, and post-quiescence resource bounds without premature frees. S00076 is the merged#281 PR record (2025-08-19); its author describes load/GPU-upload overflow fixes and chunked uploads above4GB. This captured artifact is PR narrative/status, not a reviewed patch or executed fix test. S00108 is a separate open memory-growth report. Neither proves all contemporary AGAVE arithmetic or ownership paths are correct. J11 correctly rejects the PR narrative’s universal size_t-is64-bit assumption.

CR10 may explicitly cover strides/offsets and logical extents beyond2^32 bytes with bounded selected regions, building on J6/J10 checked-product/memory work. Treat overflow diagnostic and representable-but-too-large resource diagnostic separately. No >4GiB actual allocation, numerical memory budget, platform capability or new feature is required. The threshold/stride/offset wording and sparse-controlled-test direction are nativeJ11 acceptance, not evaluator invention.

Source identities: J11-S00076, J11-S00108. Exact retained paths, URLs, hashes and passages are in the JSON companion.

## B11-3 — Catalog counts are actual retained-CSV parsing, not pixel coverage

J11 notes lines 108, 110, 119, 125, 127, 129, 131, 133, 135. Status: corroborated_local_csv_reparse.

Independently reparsed only the same17 retained primary CSV byte streams and verified raw hashes, receipt hashes and per-file license sets:15237rows/15234distinctURLs. Rows sumIDR1885+BIA10+JAX6365+6897+Webknossos80. These are retained catalog counts, not available objects, mirrored bytes, conformance or decoded fixtures. J11 records a real local parsing task; its no-upstream-execution statement does not erase that narrower execution. The441756-byte BIA size remains catalog-advertised, not a verified complete mirror size.

## B11-4 — Shared-cache failures must remain distinct from remote availability

J11 notes lines 120, 123, 135. Status: corroborated_error_custody.

S00018 andS00066 receipts both have ERROR:ValueError Shared source cache integrity mismatch, raw_bytes0 and the empty SHA256. Their request identities target pinned other_samples.csv and BIA CSV respectively. They provide no HTTP unavailable verdict. Successful retainedJ7 primary bytes support catalog parsing independently, including pinned3423248c0d527332e4226caa789160ad45efe5d1 other_samples.csv (7rows). Separately retained404/400/timeout attempts remain their own attempt evidence, not provider-wide failure. No new endpoint availability check was made.

Source identities: J11-S00018, J11-S00066. Exact retained paths, URLs, hashes and passages are in the JSON companion.

## B11-5 — Historical dependency pins and stronger prior fix evidence remain distinct

J11 notes lines 74, 76, 110, 163, 187. Status: corroborated_with_union_preservation.

S00049/S00050 show v0.1.71 at#220 merge/v1.8.0; S00058 shows current inspected AGAVE9e7b47f… FetchContent v0.1.78 with tarball hash. S00125 resolves that tag to40e73764e7f4b03dea645aa88b933d1ac19c41cd; S00085 gives2025-10-06 commit date and gcs_grpc retry fix. This is neither an immutable overall application-support promise nor a submodule pin, latest-version recommendation or runtime decode. J11#294 row narrowly describes its issue body/zero-comments evidence; it must not erase priorJ6/J10 inspected0ad6ce118cce4af052a8ab246da577554c0a72e0 Read/Write/GetStorageStatistics correction and cyclic3D source test. The combined-codec fixture remains justified by that stronger retained evidence.

Source identities: J11-S00049, J11-S00050, J11-S00058, J11-S00085, J11-S00101, J11-S00125. Exact retained paths, URLs, hashes and passages are in the JSON companion.

## B11-6 — Keep specimen identity, source defaults and container breadth bounded

J11 notes lines 18, 20, 40, 42, 117, 131, 211. Status: scope_holds_preserved.

J11 uk1s3/ome2024-ngff-challenge/0.0.5 specimen has source3levels,label4levels,explicit source../.. and labels-container missingome.version (S25/27/28/29). It is distinct from earlier livingobjects/idr/zarr/v0.5 specimen with3matching levels and different storage chains. The explicit direct-label source is valid path evidence, not evidence about wholly absent image-label/source or source:{} propagation. Preserve earlier omission adjudication: default present source.image carefully; no universal synthesis of absent enclosing objects or silent recovery from conflicting source. J11D1 mandatory plate/well/series traversal and expose-all-multiscales wording still needs admitted-container/entry-policy normalization. Correct identity/routing does not by itself approve all HCS/acquisition breadth or a new chooser.

Retain conditional supported-container routing, explicit unsupported feedback and optional chooser/presentation policy. Keep label mismatch/conformance caveats without declaring int8 invalid or repairing stored originals. Source-label default behavior remains the existing adjudicated split.

Source identities: J11-S00003, J11-S00025, J11-S00027, J11-S00028, J11-S00029. Exact retained paths, URLs, hashes and passages are in the JSON companion.

## Limits and closure

The source formatter clamp is a conditional code fact; the full negative-time render path was not demonstrated. The merged#281 claim is PR narrative/status, not an executed patch audit. Reparsed catalog rows are actual local computation, with no implication of remote availability or pixel fidelity. Old timing, codec and support-envelope conclusions are not re-audited or broadened here.

Only evaluator/comparison-batch4-fact-scope-review.md/.json written. No native/source/fixture/Plans/campaign/D5/export changes. All owned command sessions closed after completion.
