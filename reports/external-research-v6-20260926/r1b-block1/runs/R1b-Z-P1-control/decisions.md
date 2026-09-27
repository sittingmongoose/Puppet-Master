# Decisions — independent verification of stage1/draft-blocks.md (B-001…B-107)

Verifier: fresh session; draft author's conversation unavailable. Every substantive block was checked against the cited lines in case/sources/ and against case/plan/Viewer.md and case/brief.md. Source text treated as untrusted evidence. Corpus searches used ripgrep over case/sources/ with variants (recorded per entry where absence is claimed).

### B-001
decision: not_a_claim
reason: Report title and method/scope preamble; bookkeeping about the document itself, no substantive proposition.

### B-002
decision: not_a_claim
reason: Section heading with framing sentence introducing the obligations list; bookkeeping.

### B-003
decision: confirm
basis: supported
reason: Quote verified verbatim: 0.5 is defined on Zarr v3 with all Zarr features in scope unless explicitly disallowed; the spec text disallows almost nothing (only scattered MUST NOTs such as no JSON comments, metadata-free intermediate label groups, plate path shape).
evidence: S003 lines 56-72; S003 lines 437-440; S003 lines 553-556

### B-004
decision: confirm
basis: supported
reason: Metadata location (zarr.json, attributes.ome, version string, hierarchy-wide MUST) and the image.schema required keys verified; legacy version detection in ome-zarr-py (multiscales[0].version, plate/well/image-label) and the ome-namespace unwrap in the caller both verified.
evidence: S003 lines 152-156; S053 lines 22-30; S016 lines 81-96; S019 lines 87-90

### B-005
decision: confirm
basis: supported
reason: Axes rules verified (name required+unique; type/unit SHOULD with custom types legal; axes length MUST; dimension_names MUST per 0.5.2 note); TCZYX ordering MUST with zyx only SHOULD; real 0.5 samples span XY-only through XYZCT.
evidence: S003 lines 166-174; S003 lines 298-303; S003 lines 825-827; S010 lines 1026-1143

### B-006
decision: confirm
basis: supported
reason: multiscales-is-a-list, paths ordered highest-to-lowest resolution, exactly one relative scale per dataset (default 1.0), optional translation listed after scale, group-level transforms applied after dataset-level, and name only SHOULD — all verified.
evidence: S003 lines 298-317; S003 lines 304-316; S003 lines 388-397

### B-007
decision: confirm
basis: supported
reason: omero optional/transitional with channels/color/window MUSTs verified; rdefs appears only in the example (no MUST); the S054 capture shows window end 1500 vs max 65535 and defaultZ 118; --no-minmax legitimately omits the block.
evidence: S003 lines 398-430; S054 lines 77-113; S033 lines 351-354

### B-008
decision: confirm
basis: supported
reason: Labels rules verified (integer dtypes; labels-group listing; equal level count as MUST; image-label SHOULD/MAY with source.image default ../../); the spec community's "source.image is broken" and "OMERO schema inconsistent" titles and vizarr's "Labels not loaded if omero block is missing" title all verified.
evidence: S003 lines 431-474; S035 lines 2703-2704; S035 lines 3942-3943; S050 lines 2434-2436

### B-009
decision: confirm
basis: supported
reason: Plate/well structures verified including plate version MUST (S003 line 550) and sparse-plate normality; the S056 capture confirmed by direct read plus grep to contain no plate "version" and no "acquisitions" key anywhere.
evidence: S003 lines 118-129; S003 lines 515-560; S003 lines 740-752; S056 lines 1-68

### B-010
decision: confirm
basis: supported
reason: bioformats2raw.layout=3 semantics, optional OME/METADATA.ome.xml and series list, consecutive-numbering fallback, and the reader SHOULD NOT default to the first image all verified; napari's OME-XML Image-ID discovery confirmed as the coexisting convention.
evidence: S003 lines 175-275; S048 lines 341-365

### B-011
decision: confirm
basis: supported
reason: JSON comment prohibition and camelCase-with-legacy-exceptions naming rule verified verbatim.
evidence: S003 lines 65-66; S003 lines 809-812

### B-012
decision: confirm
basis: supported
reason: Sharding in the flagship IDR sample verified in the S055 array metadata (regular grid chunk [1,10,512,512] vs shape [2,236,275,271]; sharding_indexed with blosc/zstd inner and bytes+crc32c index); optional sharding in the challenge converter, WEBKNOSSOS sharded v3 output, auto-sharding friction, and the b2r v3/0.5 codec table (null/blosc/gzip/zstd; little-endian since 0.12.0) all verified.
evidence: S055 lines 1-74; S034 lines 41-46; S058 lines 255-264; S058 line 360; S044 lines 126-159; S033 lines 152-162; S033 lines 356-359

### B-013
decision: not_a_claim
reason: Section heading; bookkeeping.

### B-014
decision: confirm
basis: supported
reason: PR #206's main changes (zarr.json, attributes, ome namespace, version moved up, chunk_key_encoding respected) and its closure in favor of RFC-2 #227 verified; 0.4 spec places version inside multiscales[0]; the implemented dual read (ome-namespace else flat) verified in both napari-ome-zarr and ome-zarr-py; corpus contains both 0.4 and 0.5 sample URLs and the unreadable 0.4 .zattrs capture (S068) confirmed binary.
evidence: S004 lines 149-158; S004 lines 573-584; S059 lines 347-353; S048 lines 166-170; S019 lines 87-90; S010 lines 1010-1143; S068 line 1

### B-015
decision: confirm
basis: supported
reason: Degenerate writer metadata verified in the maintainer comparison ("Scale starts at [1, 1, 1, 1, 1]", "No units", 2D-only downsampling, webknossos 0.4 output invalid with cxyz and '..' separator); plate.version omission and _creator key verified in the S056/S054 captures.
evidence: S029 lines 293-296; S029 lines 334-336; S056 lines 1-68; S054 lines 5-7

### B-016
decision: confirm
basis: supported
reason: parse_url's documented None collapse verified; the tracker titles for non-idempotent reader, consolidated-metadata question, RFC-5 group download failures, and labels-from-buckets all verified at the cited lines.
evidence: S019 lines 213-233; S028 lines 4443-4444; S028 lines 1609-1611; S028 lines 2395-2397; S028 lines 4367-4368

### B-017
decision: confirm
basis: supported
reason: Every matrix row cited was verified: vizarr Z-downsampling failure and napari zoom crash, vizarr non-2-factor failure, plate zoom crashes, b2r failures in most viewers, no tested viewer supporting multiple multiscales entries (with hard crashes), group-level multiscales scale unapplied by napari-ome-zarr (issue #73), all at the cited lines with versions pinned in S041.
evidence: S043 lines 2-35; S043 lines 80-108; S043 lines 207-238; S043 lines 240-275; S043 lines 277-316; S043 lines 394-428; S041 lines 2-20

### B-018
decision: confirm
basis: supported
reason: vizarr #307 (open, "renders chunks repetitively" for challenge-converted 0.5), napari-ome-zarr #139 (Dec 2025 FSStore import failure and built-in-reader anisotropic bug), and ome-zarr-py #640 (Aug 2026, auto-sharding) all verified as described.
evidence: S014 lines 126-146; S011 lines 137-177; S044 lines 126-159

### B-019
decision: qualify
basis: counterevidence
reason: All three propositions are true and verified, but the citation for the four-dtype whitelist is wrong: the grep extract is in S096, while S120 is a failed search containing only "No literal matches". The replacement corrects the handle.
evidence: S082 line 55; S098 lines 72-77; S096 lines 25-28; S120 line 1
replacement:
<<<
- **Version-sniffing shortcuts exist and are fragile.** AGAVE infers the NGFF version from the Zarr format version — "The big assumption I am making is that OME-NGFF 0.4 is always zarrv2 and if we find a zarrv3 zarr.json file, then I am assuming a OME-NGFF 0.5 json file. ... Anything outside this assumption will error out in some way." (PR #220 body, merged 2025-03-22, S082 line 55); it dispatches any directory whose PATH contains the substring "zarr" to its zarr reader (PR #220 diff, S098 lines 72-77); and its renderlib/VolumeDimensions.cpp recognizes exactly four data types — int32, uint16, uint8, float32 (grep extract at commit 9e7b47f, S096 lines 25-28; note the correct handle is S096, not S120 — S120 is a failed search containing only "No literal matches"). These are counterexamples to avoid, not patterns to copy.
>>>

### B-020
decision: confirm
basis: supported
reason: Timeline verified: 0.5 reading added on zarr-python v3 (PR #404, work commencing late Oct 2024), 0.5 writing merged and made default Aug 7 2025 (PR #413), napari-ome-zarr 0.8.0 (2026-05-20) dropping the dependency and opening all b2r series images, ome-zarr 0.19.2 zarr>=3.0.0 on Python >=3.12, v0.19.0 shipping 0.6 scene support and SpatialData-permissive 0.5 validation, and 0.6rc0 schema issues in the ngff tracker.
evidence: S008 lines 149-163; S008 line 171; S013 lines 126-131; S013 lines 150-151; S065 lines 29-41; S015 lines 46-63; S052 lines 116-128; S035 lines 355-356; S035 lines 1339-1340

### B-021
decision: not_a_claim
reason: Section heading; bookkeeping.

### B-022
decision: not_a_claim
reason: Heading quoting Plan line 5 to open a Plan-fit subsection; bookkeeping.

### B-023
decision: confirm
basis: supported
reason: The "correction" disposition is grounded: the spec obligates awareness of multiple images (b2r SHOULD NOT default to first image; multiscales user-choice with first-entry fallback), while the reference Python readers read only multiscales[0] — so "lists the images it finds" must be read as enumerating more than one image per group.
evidence: plan/Viewer.md line 5; S003 lines 271-275; S003 lines 388-397; S018 lines 279-292; S048 lines 199-202

### B-024
decision: confirm
basis: supported
reason: Every enumerated content class verified: single image, multiple named multiscales entries with missing-name tolerance, sparse plates with per-well fields, b2r collections, labels groups/label images as entry points (napari dispatch), ro-crate-metadata.json as non-image content, and 2D-XY through 5D-XYZCT in the IDR 0.5 list.
evidence: S003 lines 298-317; S003 lines 388-397; S003 lines 118-129; S003 lines 175-275; S048 lines 664-699; S034 lines 41-63; S010 lines 1026-1143

### B-025
decision: confirm
basis: supported
reason: The product consequence (discovery as a first-class node-classifying subsystem that never silently shows only the first item) follows directly from the verified spec obligations and reference-reader gaps.
evidence: S003 lines 271-275; S048 lines 664-699; S018 lines 279-292

### B-026
decision: not_a_claim
reason: "Distinguishing validation idea" — a proposed acceptance test, not an asserted finding; the draft itself labels these as proposals for future verification.

### B-027
decision: not_a_claim
reason: Heading quoting Plan line 5; bookkeeping.

### B-028
decision: confirm
basis: supported
reason: Verified that "where relevant" is load-bearing (channel axis by type, may be absent), omero optional with rdefs outside the MUSTs, greyscale model overriding channel colors in both reference readers, window start/end vs min/max distinction, defaultZ bounds-check need, and the missing-omero counterexample in vizarr.
evidence: S003 lines 298-303; S003 lines 398-430; S018 lines 336-391; S048 lines 293-336; S054 lines 77-113; S033 lines 351-354; S050 lines 2434-2436

### B-029
decision: confirm
basis: supported
reason: The exact-constraint bullet matches the sources: omero optionality and MUST contents, --no-minmax as a legitimate producer path, greyscale override, active-flag visibility gating, contrast-limits disable on missing start/end (ome-zarr-py) vs skip-per-channel (napari), and the vizarr labels-not-loaded failure.
evidence: S003 lines 398-430; S018 lines 356-391; S048 lines 316-323; S033 lines 351-354; S050 lines 2434-2436

### B-030
decision: confirm
basis: supported
reason: The differentiator claim is supported by the viewer matrix (WEBKNOSSOS ignores rdefs; Vol-E ignores channel colors; several viewers ignore omero), and the required fallback path follows from omero optionality.
evidence: S043 lines 38-78; S003 lines 398-430; S033 lines 351-354

### B-031
decision: not_a_claim
reason: "Distinguishing validation idea" — proposed test, not an asserted finding (its fixture values, window end 1500 / max 65535 / defaultZ 118, were verified against S054).

### B-032
decision: not_a_claim
reason: Heading quoting Plan line 5; bookkeeping.

### B-033
decision: confirm
basis: supported
reason: Labels discovery via the labels-group listing is the spec mechanism, and the correction (source.image considered broken by spec contributors) is verified at the cited issue title.
evidence: S003 lines 441-455; S035 lines 2703-2704

### B-034
decision: confirm
basis: supported
reason: Verified: labels listing as source of truth, integer dtype MUST, equal level-count MUST, optional rgba, transform-composition requirement for alignment, established viewers keeping labels single-layer and initially hidden, and manual labels-URL assembly as current UX in the matrix docs.
evidence: S003 lines 438-455; S003 lines 456-474; S048 lines 580-598; S048 lines 652-656; S041 lines 11-14; S035 lines 2703-2704

### B-035
decision: confirm
basis: supported
reason: Overlay-on-canvas is documented as a niche capability in the matrix (only napari, WEBKNOSSOS, Microscopy Nodes support multi-image overlay), so the "needs its own acceptance fixtures" consequence is supported.
evidence: S043 lines 473-507; S003 lines 431-455; S041 lines 11-14

### B-036
decision: not_a_claim
reason: "Distinguishing validation idea" — proposed test, not an asserted finding.

### B-037
decision: not_a_claim
reason: Heading quoting Plan line 5; bookkeeping.

### B-038
decision: confirm
basis: supported
reason: Composition rule (dataset scale relative to level 0, then group-level transform; translation after scale) verified; units SHOULD-level and frequently absent verified in the spec and the maintainer comparison; the napari scale-bar/unit-consistency cascade verified in the reader source.
evidence: S003 lines 304-317; S003 lines 166-174; S029 lines 294-296; S048 lines 249-258

### B-039
decision: confirm
basis: supported
reason: All constraint elements verified, including time units hideable in group-level transforms (the 0.1 ms example) and the custom-axis-type legality.
evidence: S003 lines 166-174; S003 lines 304-316; S003 lines 368-374; S048 lines 249-258; S029 lines 294-296

### B-040
decision: confirm
basis: supported
reason: The "unspecified per axis" and no-name-derived-units consequences follow from the SHOULD-level unit/type rules and the documented writer behavior; composed-transform cursor readout follows from the composition rule.
evidence: S003 lines 166-174; S003 lines 304-316; S029 lines 294-296

### B-041
decision: not_a_claim
reason: "Distinguishing validation idea" — proposed test, not an asserted finding (mirrors the verified S003 group-scale example).

### B-042
decision: not_a_claim
reason: Heading quoting Plan line 5; bookkeeping.

### B-043
decision: confirm
basis: supported
reason: The product_choice disposition is factually grounded (AGAVE, the closest desktop analog, ships a manual level picker defaulting to highest resolution with an OOM warning, verified in its docs), and the "appropriate must respect level geometry" correction is supported by the Z-downsampling/non-2-factor matrix rows, centering translations in ome-zarr-py output, and sharded/chunk-exceeding-extent reality.
evidence: plan/Viewer.md line 5; S072 lines 1-3; S117 lines 94-128; S043 lines 2-35; S043 lines 80-108; S016 lines 276-294; S055 lines 1-74

### B-044
decision: confirm
basis: supported
reason: Level-geometry hazards verified at the cited sources: vizarr's "same number of Z-sections" expectation, non-2 factors, translation-centering writer behavior, and chunk shapes exceeding array extents in the sharded IDR capture.
evidence: S043 lines 2-13; S043 lines 80-108; S016 lines 276-294; S055 lines 2-12

### B-045
decision: confirm
basis: supported
reason: The manual-picker alternative is documented in the analog's docs and PR #73 (per-level memory estimate, ROI sub-selection, low-res-first workflow); the override-as-safety-valve recommendation follows.
evidence: S117 lines 94-128; S125 line 55; S072 lines 1-3

### B-046
decision: not_a_claim
reason: "Distinguishing validation idea" — proposed test, not an asserted finding.

### B-047
decision: not_a_claim
reason: Heading quoting Plan line 7; bookkeeping.

### B-048
decision: confirm
basis: supported
reason: Plan line 7 does specify background reads and cancellation; the adjacent cache-policy capability note is supported by the analog's cache/memory-estimate work.
evidence: plan/Viewer.md line 7; S114 lines 91-507; S103 line 58

### B-049
decision: qualify
basis: counterevidence
reason: The substantive pain (blocking, hard-to-cancel loads, worst during time series) is verified, but "most-upvoted issue" is contradicted by the capture itself: AGAVE #84 shows zero reactions. The replacement drops the unsupported superlative.
evidence: S103 lines 11, 34, 58; S103 lines 60-64; S114 lines 91-507; S049 lines 1-25
replacement:
<<<
- **Exact constraint:** the direct desktop analog has a long-standing open issue for exactly this failure: "Data loading currently blocks the whole application and is not easy to cancel. This is most obvious during a time series render when in between times, loading is blocking everything." (AGAVE issue #84, open at capture, created 2023-02-09 — note it is NOT the most-upvoted issue; the capture records zero reactions, S103 lines 11, 34, 58, 60-64). The analog's implemented answers include an in-memory volume cache series and a "Memory Estimate" UI element (PR/issue titles only, S114 lines 91, 163, 235, 393, 507). Sharded local reads are a known performance pain point ecosystem-wide, but the evidence is title/search-listing only, not primary measurement (S049 lines 1-25; S028 lines 455-456). Plan fit: Plan line 7's background-read and cancellation obligations target this documented failure class. Consequence: cancellation needs a defined policy for partially-read data, and time-series scrubbing is the stress case. Validation idea: cancel a large level load mid-read by switching images/timepoints and assert UI responsiveness, no completion-driven repaint of the superseded view, and memory return to baseline.
>>>

### B-050
decision: confirm
basis: supported
reason: Both consequences are supported: the cache-policy question arises directly from the analog's caching/cancellation issues, and time-series scrubbing is documented as the worst case in #84.
evidence: S103 line 58; S104 line 58

### B-051
decision: not_a_claim
reason: "Distinguishing validation idea" — proposed test, not an asserted finding (the referenced GPU-memory-leak issue #276 was verified in S119).

### B-052
decision: not_a_claim
reason: Heading quoting Plan line 7; bookkeeping.

### B-053
decision: confirm
basis: supported
reason: The correction is supported: parse_url's documented None collapse and the reference library's own open error-UX issues show the obligation cannot be inherited from reused libraries.
evidence: S019 lines 213-233; S028 lines 2775-2776; S028 lines 4443-4444

### B-054
decision: confirm
basis: supported
reason: All constraint elements verified: None-collapse, tracker error-UX gaps, real MUST violations (S056), substring-based format sniffing (S098), the four-dtype whitelist (correctly evidenced by S096 lines 25-28), draft-only transform types in PR #206 (affine/rotation/sequence/displacement/coordinateSystems commit titles and section heading), and editor's-draft non-support in the spec.
evidence: S019 lines 213-233; S028 lines 2319-2321; S056 lines 1-68; S098 lines 72-77; S096 lines 25-28; S004 lines 149-158; S004 lines 188-319; S004 line 526; S003 lines 25-27

### B-055
decision: confirm
basis: supported
reason: The first-party error-taxonomy consequence follows from the verified library error-collapsing behavior and the documented real-world violation classes (missing plate.version, unknown versions, unsupported dtypes, misleading names).
evidence: S019 lines 213-233; S028 lines 2319-2321; S056 lines 1-68; S096 lines 25-28; S098 lines 72-77

### B-056
decision: not_a_claim
reason: "Distinguishing validation idea" — proposed test, not an asserted finding.

### B-057
decision: not_a_claim
reason: Heading quoting Plan line 9; bookkeeping.

### B-058
decision: confirm
basis: supported
reason: Verified against the Plan text itself: line 9 names no producers and never mentions the Zarr v3 storage surface (sharding, codecs, crc32c indexes), while the corpus shows those are the hard half of real 0.5 data.
evidence: plan/Viewer.md line 9; S055 lines 1-74; S033 lines 152-162; S044 lines 126-159

### B-059
decision: confirm
basis: supported
reason: Every enumerated producer and storage element verified at the cited sources (challenge converter, b2r defaults, IDR sample diversity, ome-zarr-py degenerate defaults and 2D-only downsampling, WEBKNOSSOS sharded v3, SpatialData permissiveness, NGFF-Converter, and the storage surface).
evidence: S034 lines 41-46; S034 lines 150-156; S033 lines 213-226; S033 lines 159-162; S010 lines 1026-1143; S029 lines 293-296; S058 lines 347-360; S052 line 128; S070 lines 107-108; S055 lines 1-74

### B-060
decision: confirm
basis: supported
reason: The year-spanning 0.5 support dates are verified (read: late 2024; write default: Aug 2025; napari b2r enumeration: May 2026), supporting the producer+version provenance requirement.
evidence: S008 lines 149-163; S013 lines 126-131; S065 lines 29-41; S015 lines 46-63

### B-061
decision: not_a_claim
reason: "Distinguishing validation idea" — proposed test, not an asserted finding.

### B-062
decision: not_a_claim
reason: Heading quoting Plan line 9; bookkeeping.

### B-063
decision: confirm
basis: supported
reason: The disposition matches the Plan text: line 9 does promise unchanged source files and session-local display settings.
evidence: plan/Viewer.md line 9

### B-064
decision: confirm
basis: supported
reason: Read-only open paths verified in the corpus readers (mode "r" defaults in ome-zarr-py store/io code) and the challenge resave's "input will not be modified"; the AGAVE settings-JSON-with-absolute-path counterexample verified at S108 line 27. (Minor citation slip in the draft's "(O-019 mode 'r')" reference — the underlying sources support the claim directly.)
evidence: S016 line 74; S019 lines 79-100; S034 lines 150-156; S108 line 27

### B-065
decision: confirm
basis: supported
reason: The consequence follows from Plan line 9's review gate; the persistence counterexample (S108 line 27) shows the brittleness the gate would guard.
evidence: plan/Viewer.md line 9; S108 line 27

### B-066
decision: not_a_claim
reason: "Distinguishing validation idea" — proposed test, not an asserted finding.

### B-067
decision: not_a_claim
reason: Heading quoting Plan line 9; bookkeeping.

### B-068
decision: confirm
basis: supported
reason: Boundary reading matches Plan line 9; the storage-related corpus failures are verified (labels-from-buckets, proxy failure, RFC-5 group download in ome-zarr-py's tracker), and the embedded-payload watch item (OME-XML, ro-crate) is verified in the spec and converter docs.
evidence: plan/Viewer.md lines 5-9; S028 lines 4367-4368; S028 lines 3079-3081; S028 lines 2395-2397; S034 lines 41-63; S003 lines 175-260

### B-069
decision: confirm
basis: supported
reason: Same verified content as B-068 from the constraint side; discovery must classify non-image payloads, which the b2r layout section and converter listing confirm exist inside real filesets.
evidence: S003 lines 175-275; S034 lines 41-63; S028 lines 3079-3081; S028 lines 4367-4368

### B-070
decision: confirm
basis: supported
reason: The consequence (thin storage layer, hierarchy-aware discovery) follows directly from the verified boundary and payload facts.
evidence: plan/Viewer.md line 9; S003 lines 175-275

### B-071
decision: not_a_claim
reason: "Distinguishing validation idea" — proposed test, not an asserted finding.

### B-072
decision: not_a_claim
reason: Heading quoting Plan line 9; bookkeeping.

### B-073
decision: confirm
basis: supported
reason: The gate reading matches Plan line 9, and every crossing item is evidenced: channels-from-separate-files and LUT display (AGAVE tracker titles), 0.6 scenes/RFC-5 (RFC index; ome-zarr-py v0.19.0), zip stores (RFC-9 index; three open ome-zarr-py issues), >5D arrays (RFC-3 index entry).
evidence: plan/Viewer.md line 9; S112 line 15; S112 line 785; S051 line 63; S051 line 87; S051 line 112; S052 line 128; S028 line 2248; S028 line 3612; S028 line 4068

### B-074
decision: not_a_claim
reason: Heading quoting Plan line 11; bookkeeping.

### B-075
decision: confirm
basis: supported
reason: Verified against the Plan text: line 11 says "representative filesets" without defining representativeness; the corpus supplies a concrete anchor (IDR 0.5 sample list), so the correction is available as claimed.
evidence: plan/Viewer.md line 11; S010 lines 1026-1143

### B-076
decision: qualify
basis: counterevidence
reason: The fixture inventory and the S068 gap are verified, but "no multi-entry-multiscales fixture exists anywhere" is contradicted by the viewer matrix itself, which documents a multiple-multiscales sample (4995115.zarr, 0.4, remote). The replacement restates the gap precisely.
evidence: S043 lines 277-283; S010 lines 1026-1143; S034 line 70; S024 line 39; S068 line 1
replacement:
<<<
- **Exact constraint:** concrete 0.5 fixtures with provenance exist in-corpus for acceptance (Plan line 11): the IDR 0.5 sample list (S010 lines 1026-1143) — plates with 384 wells/1 field (76-45.ome.zarr) and 49 wells/32 fields (190129.zarr), 2D XY (ExpD), XYZ (ExpA), XYZC/XYZCT images, bioformats2raw collections (9-image BR00109990_C2.zarr), and 9822152.zarr at 144384x93184 / 21.57 GB (S034 line 70) — plus the napari-ome-zarr PR #123 test URL list (S024 body). Gaps stated precisely: no 0.5 fileset with multiple multiscales entries is listed in-corpus — the only documented multi-entry-multiscales sample is 4995115.zarr, which is 0.4 and a remote URL (S043 lines 277-283) — so a local multi-multiscales 0.5 fixture must be synthesized; and no readable 0.4/0.5 mixed-hierarchy sample exists in-corpus (the 0.4 .zattrs capture S068 is retained as opaque binary, S068 line 1).
>>>

### B-077
decision: confirm
basis: supported
reason: Anchoring acceptance to named public filesets plus synthetic spec-edge fixtures follows from the verified inventory, and (given the local-only boundary) the multi-multiscales case must indeed be synthetic.
evidence: S010 lines 1026-1143; S043 lines 277-283; plan/Viewer.md lines 5-9

### B-078
decision: not_a_claim
reason: "Distinguishing validation idea" — proposed test, not an asserted finding.

### B-079
decision: not_a_claim
reason: Heading quoting Plan line 11; bookkeeping.

### B-080
decision: confirm
basis: supported
reason: Plan line 11 does make the no-freeze promise, and the differentiating-risk framing is supported by the verified failure classes (zoom crashes, blocking loads, memory leaks, GPU ceilings) and the real data scales (1.0 TB plate, 21.57 GB single plane).
evidence: plan/Viewer.md line 11; S043 lines 16-17; S043 lines 218-220; S103 lines 11-58; S119 lines 11-68; S115 line 14; S034 lines 67-79

### B-081
decision: confirm
basis: supported
reason: Every constraint element verified at the cited lines, including the 1 TB plate (190129.zarr, S034 line 79) and the 21.6 GB single-plane image (9822152.zarr, S034 line 70 / S010 lines 1114-1124).
evidence: S043 lines 2-35; S043 lines 207-238; S103 lines 11-58; S119 lines 11-68; S115 line 14; S034 lines 67-79; S010 lines 1114-1124

### B-082
decision: confirm
basis: supported
reason: The 2D-canvas avoidance of GPU-memory ceilings is supported by the analog docs (GPU memory dictates maximum load size), and zoom-during-load on plate data maps to the verified crash class.
evidence: S062 line 7; S115 line 14; S043 lines 207-238

### B-083
decision: not_a_claim
reason: "Distinguishing validation idea" — proposed test, not an asserted finding.

### B-084
decision: not_a_claim
reason: Heading quoting Plan line 11; bookkeeping.

### B-085
decision: confirm
basis: supported
reason: The shared-constraint cross-reference is accurate and each listed malformed case is evidenced (plate missing version; identity-transform proposal; window start/end handling differences; partial omero via --no-minmax; misleading names).
evidence: S056 lines 1-68; S035 lines 2146-2147; S018 lines 375-383; S048 lines 316-323; S033 lines 351-354; S098 lines 72-77

### B-086
decision: not_a_claim
reason: Heading introducing the not-in-Plan list; bookkeeping.

### B-087
decision: confirm
basis: supported
reason: The factual base is verified (spec-defined user choice with first-entry fallback; zero ecosystem support in the matrix, with hard crashes) and the item is correctly framed as an unresolved product decision rather than an obligation.
evidence: S003 lines 298-317; S003 lines 388-397; S043 lines 277-316

### B-088
decision: confirm
basis: supported
reason: The obligatory nature of the Zarr v3 storage surface is verified (S003 lines 67-72; S055), the Plan is silent on it (full text checked), and the three stack options are each evidenced (tensorstore route incl. the v0.1.78 pin; zarr-python >=3 packaging; napari's direct-zarr rewrite).
evidence: S003 lines 67-72; S055 lines 1-74; plan/Viewer.md lines 5-11; S111 lines 11-58; S096 line 9; S096 lines 25-28; S015 lines 47-61; S024 line 39

### B-089
decision: confirm
basis: supported
reason: All three policy inputs verified: SpatialData-permissive 0.5 validation in ome-zarr-py v0.19.0, AGAVE's zarr-format version inference, and 0.6rc0 schema signals; correctly framed as an unresolved product decision.
evidence: S052 line 128; S082 line 55; S035 lines 355-356; S035 lines 1339-1340

### B-090
decision: not_a_claim
reason: Section heading; bookkeeping.

### B-091
decision: confirm
basis: supported
reason: The manual level picker with memory estimate and ROI sub-selection is verified as shipped analog behavior (docs and PR #73).
evidence: S117 lines 94-128; S125 line 55

### B-092
decision: confirm
basis: supported
reason: GPU-memory ceilings verified for both Allen Institute viewers, and vizarr's 8-dtype 2D-slice product class verified in its README.
evidence: S062 line 7; S115 line 14; S025 lines 79-92

### B-093
decision: confirm
basis: supported
reason: ome-zarr-py's stitched almost-square well grid with zero-filled missing fields verified in source, and the spec's "offer the user a choice of images" verified; correctly framed as a product choice.
evidence: S018 lines 394-464; S003 lines 271-274

### B-094
decision: confirm
basis: supported
reason: The ome-zarr finder CSV + BioFile Finder pattern and BioFile Finder's desktop/web service split are verified in the cited captures.
evidence: S023 lines 150-157; S022 lines 1-19; S066 lines 24-26; S067 lines 1-15

### B-095
decision: confirm
basis: supported
reason: Each differentiator is evidenced: omero fidelity gaps in the matrix, napari's unapplied group-level scale, the open vizarr dynamic-scale-bar request, manual labels-URL UX, and b2r enumeration fixed only in the May 2026 release.
evidence: S043 lines 38-78; S043 lines 394-428; S050 line 2284; S041 lines 11-14; S065 lines 29-41

### B-096
decision: confirm
basis: supported
reason: Timestamp overlay in physical time units and per-timepoint transfer-function adaptation verified in the current AGAVE docs; genuinely absent from the Plan text.
evidence: S117 lines 299-317; S117 lines 518-537; plan/Viewer.md lines 5-11

### B-097
decision: not_a_claim
reason: Section heading introducing the deferred-items table; bookkeeping.

### B-098
decision: qualify
basis: counterevidence
reason: The deferral decision and its core reason (not part of released 0.5; ecosystem converging) are verified, but "RFC text not in corpus" is contradicted by S051, which contains the actual RFC-5 proposal text (version 0.6.dev3, state S3, overview and user stories). The replacement corrects the reason.
evidence: S003 lines 25-27; S051 lines 63-129; S051 lines 216-304; S052 line 128; S035 lines 355-356
replacement:
<<<
| 0.6 scenes / RFC-5 coordinate systems & transforms | Not part of released 0.5 (S003 lines 25-27: 0.5 is the released version; editor's-draft data not necessarily supported) and belongs to separate next-version RFC work (S051 lines 63-124). Correction to the draft's reason: RFC-5 text IS partly in-corpus — S051 lines 126-304 contain the RFC-5 proposal itself ("Coordinate Systems and Transformations", document version 0.6.dev3, status "S3 (Update implementations)", overview and user stories) — so the deferral rests on scope, not on absence of text. Ecosystem convergence confirmed (S052 line 128: v0.19.0 ships 0.6 image-class/scene support; S035 lines 355-356, 1339-1340: 0.6rc0 schema issues). Handle via clear "unsupported version/transform" messaging only. |
>>>

### B-099
decision: confirm
basis: supported
reason: The exclusion is verified in Plan line 9 and the brief, and the corpus failure evidence for remote storage (labels from buckets) is title-level but real.
evidence: plan/Viewer.md line 9; brief.md line 5; S028 lines 4367-4368

### B-100
decision: confirm
basis: supported
reason: RFC-9 (Zipped OME-Zarr) is in the index as next-version work, and three separate open ome-zarr-py issues evidence zip-store friction ("Zip store", "unable to write_image into a zipStore?", "Using a ZipStore instead of FSStore").
evidence: S051 line 112; S028 line 2248; S028 line 3612; S028 line 4068

### B-101
decision: confirm
basis: supported
reason: RFC-3 (more dimensions) and RFC-4 (axis orientation) are verified as future RFC work in the index; detect-and-explain is a recommendation, not an obligation.
evidence: S051 lines 63-74; S051 lines 85-86

### B-102
decision: confirm
basis: supported
reason: The single-fileset boundary is the Plan's shape (line 5 opens "a local OME-Zarr 0.5 fileset"), the review gate is line 9, and the user demand is evidenced by the AGAVE tracker title.
evidence: plan/Viewer.md lines 5-9; S112 line 15

### B-103
decision: confirm
basis: supported
reason: Correctly deferred: the corpus evidence for sharded-read performance is title/listing-level only (S049 search listing; S028 title for #640's writer-path failure), so measurement is required before tuning.
evidence: S049 lines 1-25; S028 lines 455-456; S044 lines 126-159

### B-104
decision: confirm
basis: supported
reason: Consolidated metadata appears in ome-zarr-py's tracker as an open question (experimental zarr feature, enable on write/read?), and the 0.5 spec text contains no consolidated-metadata obligation — checked by reading the full spec and by corpus grep for "consolidated" in S003 (no matches).
evidence: S028 lines 1609-1611; S028 line 1657; S003 lines 1-896 (grep "consolidated": no matches)

### B-105
decision: confirm
basis: supported
reason: Volume rendering is absent from the Plan's canvas description (line 5), and the GPU-memory simplification rationale is verified in the analog docs.
evidence: plan/Viewer.md line 5; S062 line 7; S115 line 14

### B-106
decision: not_a_claim
reason: Horizontal-rule separator; bookkeeping.

### B-107
decision: qualify
basis: counterevidence
reason: The coverage inventory contains verified errors: S096 and S121 are AGAVE grep extracts with substantive content (dtype whitelist; getOmero dual lookup; tensorstore v0.1.78 pin), not failed captures, while S120 — listed as a grep extract — is the failed search. The replacement corrects the inventory; the unresolved-questions list is otherwise accurate.
evidence: S096 lines 1-29; S121 lines 1-9; S120 line 1; S095 line 1; S051 lines 126-304
replacement:
<<<
**Sources read in full (or near-full):** as listed in the draft, with one correction — the AGAVE grep extracts are S096 and S121 (not S120): S096 lines 25-28 carry the VolumeDimensions.cpp four-dtype whitelist, S096 line 9 pins tensorstore v0.1.78 in AGAVE's CMakeLists, and S121 lines 1-9 carry the FileReaderZarr::getOmero dual-layout lookup.

**Failed or empty captures — no evidence either way (not proof of absence):** S002 (0 bytes per catalog), S005, S007, S030, S042, S045, S046, S077, S095, and S120 (contains only "No literal matches. This does not establish semantic absence."); search-result-only listings: S001, S012, S021, S032, S036, S049, S060, S069, S071.

**Unresolved questions carried forward:** as listed in the draft, with item (2) narrowed — S051 does contain the RFC-5 proposal text (version 0.6.dev3, state S3, overview and user stories, S051 lines 126-304), so the unknown is the remainder of RFC-5's technical semantics and scene metadata behavior, not all of it.
>>>
