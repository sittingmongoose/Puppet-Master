> Exported evaluator review. Original SHA-256: `68b14a374c1c467a5eca414c66667da42d8d565d933bc7a6863b5b39c0d77180`. Source locators and hashes below identify original artifacts; `artifact:` identifiers are nonclickable identities and do not imply included payloads. Declared transformations are in [the reviewer export receipt](reviewer-export-receipt.json). Original private/provisional wording is preserved as historical review context.

# J8 comparison fact and scope review

Status: selected evaluator review complete; final union and independent derivative review pending. Preserve five native repair proposal groups and four held optional proposal groups. No score, landing, candidate-register change or derivative change. Only this report was written.

Scope: sole parent L-80240e08616c; final J8 report read in full against the exact frozen 214-word Viewer Plan and 126-word brief. J8 received J2/J3/J4 reports and twelve transported children, not J5/J6/J7. Weaker coverage beyond those actual inputs is not an automatic contradiction. Selected primary passages were inspected; already verified rank, calibration, dtype, error and backend findings were reused rather than re-audited wholesale.

## Findings and derivative dispositions

### C1 — R1 recognition/path correctness is supported; coverage breadth needs an explicit boundary

R1 notes lines 26–44 use existing image-finding/navigation intent to motivate metadata-driven admission, stable image identity, exact relative dataset paths and meaningful partial-discovery errors. These are well supported by the frozen owners at Viewer.md:5/:7/:11 and previous AGAVE/BFF checks. BFF's classification patch does not support stripping a supplied subpath or alleging a new local decoder defect.

R1 line 34 also mandates plate/collection enumeration and bounded generic-hierarchy traversal; R5 lines 113/119 require positive real-producer collection/plate fixtures. These are useful native proposals, but the frozen boundary leaves capability breadth to an explicit decision. Separate correctness of recognizing/admitting declared structures from promising positive support for every container. In particular, generic recursive traversal is explicitly identified by J8 line 36 as a proposed discovery strategy, not a format MUST. Do not silently turn it into a universal directory-crawling obligation or infer complete discovery after a cancelled/bounded/unreadable scan.

Narrow remedy: retain R1's format/role/version and selected-path contracts; identify admitted container classes and traversal bounds, then require correct declared image paths and truthful completeness within them. Until that boundary is adopted, hold unconditional plate/collection/generic-root positive coverage. Explain unsupported containers and preserve direct usable image selection where applicable. A plate-shaped UI, arbitrary custom collection conventions and broad legacy support are separate choices. This is not a rejection of R1 or the parent.

The acquired collection specification supports numeric layout 3 in examples, conditional numbered fallback and plate precedence. The prose's quoted 3 does not justify a string-only parser. [OME-Zarr specification](https://ngff.openmicroscopy.org/0.5/), J8 S00005 lines 175–275.

### C2 — R2 arithmetic and representation limits are sound acceptance candidates

R2 notes lines 46–64 correctly distinguishes axis identity from anatomical orientation, preserves per-axis units and composes the dataset mapping before the enclosing mapping. Independent arithmetic: 3*(2*4+10)-5 = 49; changing dataset scale/index to 4/2 still gives 49 if translations and enclosing mapping remain unchanged. 2 centiseconds * 25 = 0.5 seconds. These were arithmetic checks only, not image/GUI tests.

Keep translation-first as negative metadata, not a valid 0.5 incompatibility. The fixed-rank-five failure remains withdrawn under previously verified TensorStore alignment. S00005 lines 276–315 gives the transform representation/order basis. R2 line 56 leaves transform-path support to the compatibility matrix and requests explicit unsupported feedback; it does not establish a complete path decoder or fixture oracle. Coordinate details may remain in index space when physical calibration is unknown; no unit label substitution can create calibration. An admitted path representation needs a concrete storage/value/reference fixture before acceptance.

### C3 — R3 nested source-default ambiguity: narrow hold and precise remedy

R3 notes lines 74/78 combines nesting with optional image-label/source omission and warns against blindly applying ../../ for deeper labels. Its exact integer identity, dataset-path and physical-alignment checks are useful. Its unconditional nested omission positive case needs refinement. This is an unresolved interpretation/scope issue, not a proven factual error: the passage does not fully establish default propagation across absent parent objects. A separate bounded primary-spec/schema adjudication requested by the root evaluator is pending; this report does not preempt it.

The precise acquired primary scope is S00005 lines 456–474: image-label is SHOULD; it MAY contain source; source is an object; that object MAY contain image, a relative path to a Zarr image group. Immediately afterward the source says: **“The default value is ../../”**. It explains this by the usual direct labels nesting. The passage does not separately specify propagation of that default when the entire image-label object is absent, when source is absent, and when source exists without image. Intermediate groups are independently allowed at lines 437–440. [Label specification](https://ngff.openmicroscopy.org/0.5/#labels-md).

Concrete case: /A/labels/original/0 resolves ../../ to /A/labels, which is a label container rather than image /A. Inferring /A from registration is not the same operation as applying that relative default. J8's proposed nesting fallback cannot silently become a replacement normative default.

Narrow derivative remedy (evaluator wording): distinguish (a) absent image-label, (b) absent source, and (c) source object without image. Honor an explicit reference and any applicable default, compare the target with registration context, and diagnose a conflicting/non-image/unresolvable target. Preserve optional-omission acceptance where association is unambiguous. If nesting-only fallback is adopted for an otherwise unresolved case, label it as a documented compatibility interpretation, validate alignment, and preserve source metadata unchanged. Otherwise explain why this overlay is unavailable while retaining the base image.

Split acceptance into ordinary direct nesting without optional source; deeper nesting with explicit ../../../ reference; and deeper nesting with an omitted/default-conflicting source. The last requires a documented interpretation or diagnostic outcome, not unconditional attachment. Do not impose a global image-label/source requirement. No whole-lead rejection follows.

R3's 1, 65537, 16777217 and supported adjacent uint64 IDs above 2^53 are discriminating identity checks. Preserve supported IDs without floating-point loss or intensity remapping and distinguish unsupported integer types. Discrete sampling/coordinate alignment are required for a correct displayed overlay; no high-ID renderer acceptance has run. J6 sparse-allocation/scalability evidence may strengthen the later union without being attributed to J8's inputs.

### C4 — R4 provides concrete failure/state checks; thresholds remain open

R4 notes lines 83–103 makes background/cancellation requirements observable through view identity, stale-result rejection, bounded work/buffers and failed-selection state coherence. The delayed A / completed B test is useful: old successes, errors or partial buffers cannot overwrite B's pixels, details or controls. Cancellation is correctly qualified when one disk operation cannot abort immediately. The source-tree hash check preserves content/read-only behavior; it does not promise unchanged OS access timestamps.

The proposed request-region tracing, first-useful-view latency, event-loop delays and peak memory measurements are not completed measurements. No target machine or numerical budget has been chosen. Keep a bounded low-resolution working set in the planned over-RAM full-resolution test. Neither a 100 MB cache setting nor moving a full-volume read to a worker proves bounded interactive behavior. Failure variants and fill-vs-read-error checks refine existing requirements; do not count every injected error as a new independent feature.

### C5 — R5 is a traceable acceptance proposal, not a validated corpus

J8 S00019/S00020 were independently parsed: CZYX metadata, paths 0/1/2; uint16 shape [2,236,275,271], matching outer shard shape, inner chunks [1,1,275,271], bytes/blosc(zstd) data codecs and bytes/crc32c index codecs. This establishes declarations only. [Image metadata](https://uk1s3.embassy.ebi.ac.uk/idr/share/ome2024-ngff-challenge/0.0.5/6001240.zarr/zarr.json), [array metadata](https://uk1s3.embassy.ebi.ac.uk/idr/share/ome2024-ngff-challenge/0.0.5/6001240.zarr/0/zarr.json).

The manifest and slice/calibration/label oracles clarify Viewer.md:11. Licenses, local mirroring, reference pixels and application/platform results remain open. J8 correctly limits its acquisition to one image/array metadata pair; its rejected other_samples fetch proves no seven-row inventory. J7's successful broader inventory is additional union evidence rather than an omission falsely attributable to J8.

R5 line 121's compatibility matrix must state the admitted scope. Correctness within supported dtypes/codecs does not prove all extensions work, and unsupported feedback must not silently reinterpret values. Resolve initial capability breadth explicitly rather than turning an extensible format into an unlimited decoder promise. Numeric dtype/constant/nonfinite checks remain useful acceptance candidates without adding scientific measurement/export features.

### C6 — P1–P4 remain held proposals; selected new P3 source check is corroborated

P1 offers a stack prototype without choosing production C++/Qt/TensorStore or pin. P2 chooses saved display defaults/preservation/fallback policy. P3 compares public automation with internal hooks and does not authorize a listener. P4 proposes advanced controls/preload while automatic level selection remains existing intent. None is approved merely because its benefits/tradeoffs are concrete. Internal test instrumentation or bounded caches can support existing acceptance without adopting those product interfaces.

P3 notes line 166 adds a valid selected metadata warning: inspected S00008 lines 433–440 picks the last multiscales level for loadDimensions; S00038 lines 679–681 gets those dimensions separately from the selected load and lines 725–741 returns them as volume_dimensions. Nested dimensions therefore cannot automatically serve as the selected level/ROI oracle. This is source-level consistency risk, not a reproduced server reply. [Reader](https://github.com/AllenCell/agave/blob/9e7b47f7e64f56a5f7cffb317e72486aeb7ebfe3/renderlib/io/FileReaderZarr.cpp#L428), [command](https://github.com/AllenCell/agave/blob/9e7b47f7e64f56a5f7cffb317e72486aeb7ebfe3/renderlib/command.cpp#L679).

## Execution, union and integrity limits

Participant work includes actual Plan reads/searches, source/spec/code/metadata acquisition and artifact verification. R1–R5/P1–P4 application checks are proposals, not performed tests. This evaluator executed exact-hash checks, selected JSON parsing and arithmetic. No AGAVE build/run, TensorStore decode, image-chunk fetch, local mirror, GUI or server acceptance was performed. Do not describe data-only execution as either viewer runtime proof or no execution at all.

Retain stronger later union evidence J8 did not receive: J6's 0ad6ce1 post-pin Read/Write/GetStorageStatistics transpose+sharding fix and J7's v0.1.71 historical pin/larger CSV inventory. J8 deferral is a job-local limit. Reuse reconcile-batch3/4-fact-check.md without duplicate source audit. This review adds no score for that coverage difference.

The live specification opened during review reports September 9; participant receipts preserve their earlier acquired bytes. Source hashes, not a changing rendered date, identify its evidence. Selected primary raw hashes matched receipts; normalized text hashes matched where the acquisition type supplies that field, and all inspected text hashes are recorded below. No full-source/schema/extension or runtime certification is claimed.

Only this named review was written. No participant feedback, collector, workflow/input/Plans edits, candidate/derivative edit or D5 activity. All owned sessions closed. Final union and independent derivative review remain pending.

## Input SHA256

Paths relative to J0008-compare/workspace except evaluator references. Frozen initial and final Plan bytes match.

| Input | SHA256 |
| --- | --- |
| notes.md | `576b86ea608a1c16366b4d88d336e91d456896832f6f7d03ab88c5b5bf69833b` |
| brief.md | `f4f88faef06f7cc95c6935e2e43afe562bbdfc29ee85d984f8c59f0232c8556a` |
| evidence-index.md | `69830a00ccef8ce809bb139b90db8cca97274152c07abbb09b056f2484badea6` |
| research-evidence/sources/S00001/text.txt | `5f4d4db8e1f07c16278f15c9fd6bf827360867e61a56d917367e7e3b551d222d` |
| research-evidence/sources/S00005/text.txt | `5d8b240877ed2cf9596566187bcb3779ea011d5319807134c65e2e7dc2ae82de` |
| research-evidence/sources/S00008/text.txt | `411e4f466692c37f89c9111b8fdc0662f0a3072e42a03b08dabd8bc7ced26feb` |
| research-evidence/sources/S00019/text.txt | `aded9e3b47ca95ea01c4304a56a9b94a7c1844f8ec2f92347a872b21795ef761` |
| research-evidence/sources/S00020/text.txt | `2e234a1b14ebda2d0cb76e29ca7c3bcd1acb6e887010f8f4c5dfd16bfb1e6db3` |
| research-evidence/sources/S00038/text.txt | `1f577912b6c2a262383cb19fd628905b834d7d16c94f7a395f5605b810157f1e` |
| research-evidence/sources/S00068/text.txt | `5f4d4db8e1f07c16278f15c9fd6bf827360867e61a56d917367e7e3b551d222d` |
| evaluator/reconcile-batch3-fact-check.md (reused) | `952a57eeec7aeef2ee2de93c195edc23c25959b9af817ba817b9a4e8021e118e` |
| evaluator/reconcile-batch4-fact-check.md (reused) | `39342564aae9e45676c1a8d3cfb70a202c9cec50cef8a2ed1ece936cd5a5c289` |
