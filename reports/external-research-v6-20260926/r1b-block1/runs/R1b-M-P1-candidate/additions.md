# Additions (independent verification)

## 1. Material observations the draft lost

Restated from stage1/observations.md with sources. Each is supported by the cited source text I re-checked.

- L1. ome-zarr-py builds the full dask pyramid eagerly at open (one dask array per resolution appended to node.data, S018 lines 298-313) and attaches any labels group as a hidden child. The eager-pyramid part never made it into the draft; it is the reference reader's memory model and the baseline Slide Scout's lazy/bounded loading (F7) must beat. (From O-019.)
- L2. Early-0.5-era reads were validated against a small set of challenge conversions, so read-path edge cases (codecs, sharding, translations, multi-multiscales) may be under-tested even in reference code (O-061 implication; PR404 tested against IDR/challenge examples, S008 lines 154-160). The draft cites PR404 only for timeline (P8), losing this caution. It strengthens the F12 matrix argument.
- L3. MoBIE records supported:yes for HCS plates with no pattern detail (S043 lines 223-224). The draft's P17 ("exactly one proven low-risk pattern") drops this second supporting viewer; my B-022 replacement restores it. (From O-031 context.)
- L4. OMERO's multi-multiscales entry records no supported verdict and notes "All images imported but sample image is corrupted" (S043 lines 311-313). The draft's "no surveyed viewer opens beyond multiscales[0]" drops this exception; my B-021 replacement restores it. (From O-032 context.)
- L5. When plate metadata is present, matching series metadata SHOULD still be provided for plate-unaware tools (S003 lines 261-263). The draft's P6/F1 precedence omits this SHOULD, which matters for a viewer choosing which list to trust when both exist. (From O-014 context.)
- L6. AGAVE shows a scene-selection dialog for multi-scene data (re-open to switch scenes) and an error dialog with the reason in the AGAVE log when data cannot load (S117 lines 63-70). The draft's AGAVE portrait (P11) covers the Load Settings dialog but loses the multi-scene and error-dialog precedents, both directly relevant to F1/F8. (Found in O-052's source during verification.)
- L7. bioformats2raw 0.3.0+ writes reflect layout version 3 (OME/METADATA.ome.xml inside an OME dir), and plate/series groups follow the 0.2-era conventions before converter 0.5.0 (S033 lines 339-345). The draft's converter portrait (P12) loses this lineage detail, which dates the layout-3 population. (From O-055 context.)
- L8. The omero-reader support row was never summarized: vizarr, napari, and WEBKNOSSOS (except rdefs) apply omero rendering metadata, while Vol-E, BigDataViewer, MoBIE, neuroglancer, vtk-itk-viewer, OMERO, and Microscopy Nodes do not (S043 lines 38-78, incl. "rdefs are not supported" at line 70). The draft's F3/F4 lean on omero/rdefs defaults without noting most surveyed viewers ignore them. (From O-033/O-035 context; see also N5 below.)

## 2. New supported findings

Found during verification reads outside the O-block citations. All are supported by the quoted source text.

- N1. Resave chunk/shard defaults: resave's default shard shape is the full image-array shape, and shards over 100,000,000 pixels require an explicit --output-shards value (applied to all resolutions, with matching --output-chunks when chunk shapes vary per level); per-resolution tuning goes through a JSON details file (S034 lines 291-315). Consequence for F9/F2: converted 0.5 filesets may carry whole-array shards, so shard-shape handling is not an edge case. Validation: open a default-resave fixture and a tuned-shard fixture and compare tile-fetch counts at one zoom step.
- N2. Plate metadata-request amplification: a vizarr feature issue reports row x col .zarray requests before any pixel data for plates (e.g. 394 x 5 = 1970 requests for a 0.1 plate) and proposes reusing the first image's array metadata for the rest (S050 lines 3644, 3691). Caveat: v2-era (.zarray) report; the concern carries to v3 (one zarr.json per array) but the fix's validity for heterogeneous 0.5 arrays is unproven. Consequence for F7: plate opening needs a metadata-fetch budget, not just a pixel budget. Validation: count metadata requests when opening the sparse-plate fixture.
- N3. Napari post-PR123 transform narrowing: for non-scene images the code takes only the first dataset transform plus the first intrinsic-matching top-level transform (S048 lines 260-283), which for plain 0.5 data means a dataset-level translation at index 1 is dropped even though the matrix credits napari with translation support (S043 lines 370-371). This internal contradiction is why R4 stays unresolved; see B-112. Consequence for F6: do not cite "napari applies translation" without a version pin.
- N4. Second hidden-by-default precedent: ome-zarr-py attaches the labels child with visibility=False (S018 lines 315-318), matching napari's visible:False for label layers (S048 lines 652-654). Strengthens the F5 default. Validation: none needed beyond the two code cites.
- N5. Reader-architecture drift signal: a 2025 ome-zarr-py issue thread proposes deprecating ome-zarr-py's reading/graph-traversal role in favor of ngff-zarr (writing) and ome-zarr-models-py (validation), keeping only simple first-dataset reads plus napari's reworked traversal (S028 line 3051). Caveat: single issue thread in a large dump, proposal not decision. Consequence: Slide Scout should depend on specified behavior (S003/S053), not on ome-zarr-py reader internals that its own maintainers propose to retire.
- N6. WEBKNOSSOS label-dimension tolerance: each label dimension should equal the image's or be 1 when irrelevant (S058 lines 333-337). The 0.5 spec says label images are "usually" same-dimensions (S003 lines 432-433) without this rule; a converter/consumer doc stating singleton-tolerance is a genuine interop nuance for F5 alignment. Validation: overlay a singleton-dimension label fixture and check broadcast behavior.

## 3. Correct non-findings

Absence claims I checked with bounded searches. Each states its scope so it can be re-run.

- NF1. No Scene/coordinateSystems obligation in 0.5: regex search for `scene|coordinateSystem` over case/sources/S003.txt returns no hits. Supports U3 (B-106).
- NF2. No read-path `compressor`-on-v3 evidence: regex search for `compressor` over case/sources returns only the S013 write-path rejection plus v2-era/write contexts (S017, S028, S029) and one unrelated vizarr-notebook hit (S050). Supports R3 staying unresolved (B-111).
- NF3. Napari plate.py content absent: only the tree listing (S047 lines 199-206, blob metadata, no code) and S048's import/call sites exist in the corpus. Supports the B-050 qualification.
- NF4. Validator coverage unknown: S031 is 16 lines (page, samples link, schemas override); no rule list in the corpus. Supports R7 (B-115).
- NF5. No PR594 rule detail: both v0.19.0 bodies carrying the "more permissive with version 0.5" title (S052 lines 128, 171) give PR numbers only, no acceptance rules. Supports R2 (B-110).
- NF6. No labels key inside the 0.5 multiscales group: regex search for `labels` over S003 shows the listing only in the labels-group zarr.json (lines 102-112, 441-450) and prose. Supports the B-109 resolution.

## 4. Grouped product decisions for the user

Evidence informs but does not settle these. Recommended defaults are marked where the corpus leans; the rest are neutral.

### G1. Navigation and discovery

- Plate navigation model (P-C1, B-098): overview-plus-drill-down (vizarr pattern, S043 lines 213-215) vs stitched canvas (zero-fill precedent, S018) vs flat field list. Recommended: overview plus drill-down; it is the only corpus-detailed low-risk pattern.
- Multi-multiscales choice UI (O-C3, B-091): implement spec user-choice-by-name (S003 lines 388-397) vs first-only like all surveyed viewers (S043 lines 277-316). Recommended: first-by-default with an explicit switcher; it satisfies the spec without breaking the common single-multiscale case.
- Finder-style collection browsing (O-C7, B-095): adopt traversal-plus-served-browsing (S023 lines 150-154) or keep single-fileset open only. Neutral; depends on whether users hold folders of filesets.
- Raw-array fallback view (O-C2, B-090): pixels-plus-notice for decodable non-NGFF arrays (S018 lines 593-600) vs hard refusal. Recommended: fallback with notice; silent ignore is an attested bad behavior.

### G2. Rendering and calibration

- Channel rendering (P-C2, B-099): split per-channel layers (S048 lines 204-213) vs blended composite (S025 lines 81-83). Neutral; affects toggle semantics and color fidelity.
- Pyramid UX (P-C3, B-100): fully automatic level choice (Plan L5) vs explicit choice with memory estimate (S117 lines 94-135) vs hybrid low-res-first. Recommended: hybrid (auto with a visible cap/override) for TB-scale safety.
- Overlay scope (P-C5, B-102): labels-only (recommended; only 3/11 viewers do general overlay, S043 lines 473-507) vs general multi-image overlay. Recommended: labels-only per brief.
- Translation handling (O-C4, B-092): napari-style alignment vs ignore-with-notice. Neutral, but ignore-silently is disallowed by the vizarr/WEBKNOSSOS failure modes (S043 lines 361-365, 383-386).
- Rotation/affine/sequence tolerance (O-C5, B-093): compose (S048 lines 81-126) vs warn-and-skip vs reject. Recommended: compose where the math is total, else warn-and-skip; never crash.
- Scalebar/coordinate display (from O-033's lost open question): per-axis pixel size plus calibrated cursor readout is the F6 minimum; scalebar styling and unit-mismatch rules need an explicit decision. Neutral.

### G3. Correctness posture and errors

- Strictness (P-C4, B-101): strict schema rejection (S053) vs permissive-with-notice (v0.19 spatial-data precedent, S052 line 128). Neutral; pick per acceptance matrix row.
- Contrast degradation: per-channel fallback with notice (napari behavior, S048 lines 316-323) vs wipe-all-limits (ome-zarr-py behavior, S018 lines 379-383). Recommended: per-channel; the draft's F3 already takes this position.
- Units display rule: state the rule for missing/inconsistent units (napari hides units with a warning, S048 lines 249-254). Neutral on the exact rule; having none is disallowed.
- Failure taxonomy verbosity (F8, B-065): node-plus-rule-plus-recovery messages per row. Recommended as specified; silent states are attested bad behaviors.

### G4. Scope and acceptance

- RO-Crate display (O-C1, B-089) and label-properties inspect (O-C6, B-094): adopt or defer; both have clean validation fixtures (S034 lines 201-204; S003 lines 467-474 with S048 lines 628-650). Neutral.
- Transfer-function rendering and ROI clipping (O-C8, B-096): adopt or defer (S108 lines 13-30). Neutral; beyond brief minimum.
- (dtype, codec, layout) support matrix (F9, B-070): which cells Slide Scout claims. The corpus fixes the label dtype row (all 8 int types, S003 lines 438-439) and the converter codec rows (S033 lines 157-200); the rest is a capacity decision.
- Acceptance large-case threshold (F12, B-085): size in GB/pixels/chunks (corpus spans 589 MB to 1.0 TB, S034 lines 67-83). Neutral on the number; leaving it unsized is disallowed.

## 5. Unresolved and unchecked items

### U-A. Standing unresolved (see decisions B-110..B-115)

- R2: what permissive-0.5 (PR594) accepts beyond strict 0.5 (B-110, NF5).
- R3: whether v3 read paths must accept `compressor` and `codecs` spellings (B-111, NF2).
- R4: which transform combinations the current napari reader applies (B-112, N3).
- R5: real-world frequencies of translations, top-level transforms, multi-multiscales groups, custom hierarchies, non-bioformats2raw pyramids, dtype histograms (B-113).
- R6: napari PR123 TODOs in releases, vizarr #307 root cause, neuroglancer v3/shard support, Vol-E 0.5 support, AGAVE out-of-switch dtypes (B-114).
- R7: validator metadata-only vs codec/shard coverage (B-115, NF4).
- R1 is settled as actionable (B-109, NF6).

### U-B. Open questions the draft dropped (still open)

- How should the viewer report mixed-version hierarchies (O-002), and how do readers treat groups mixing namespaced and flat keys (O-018)?
- Do existing 0.5 writers always emit dimension_names, and what should mismatch do (O-004)?
- How common are custom/null axis types and 2D/3D/4D images; does AGAVE validate axes against its dimorder (O-003, O-053)?
- Do real 0.5 filesets use top-level multiscales transforms and translations, and do any contain rotation/affine/sequence (O-005, O-064)?
- Do filesets use non-numeric dataset paths, non-default scale-format layouts, or disagreeing plate path/index pairs (O-006, O-012, O-039)?
- What fraction of labels use intermediate groups, omit listing, or lack image-label colors/version; what survives multi-channel label squeeze (O-009, O-010, O-062)?
- Must Slide Scout expose plate/well/acquisition navigation or flatten fields; what is the largest plate it must open (O-011, O-013, O-023)?
- How many filesets still use bioformats2raw.layout, what does napari do without OME-XML, and which bioformats2raw version first wrote 0.5 (O-014, O-027, O-038)?
- Should Slide Scout detect-and-explain 0.4 or treat non-0.5 as generic malformed input (O-015)?
- Does ome-zarr-py validate top-level transforms like dataset transforms, and what read-path error do mixed-format opens produce (O-017, O-046)?
- Does any 0.5 tool expose non-first multiscales; are multi-multiscales groups present in 0.5 data (O-019, O-032)?
- Which codecs beyond the bioformats2raw table (zlib? others) and which dtypes appear in real 0.5 arrays (O-022, O-028, O-037)?
- Should RO-Crate surface in the details panel, and what acceptance size threshold applies (O-024, O-025)?
- Split-channel vs composite rendering; which napari PR123 TODOs remain (O-026, O-049)?
- Do filesets use translations for label/image alignment; how often top-level scale (O-034, O-035)?
- Label overlay: reuse image levels or independent label levels (O-036)?
- What chunk/shard shapes do local 0.5 filesets use; does the store.root walk-up work for v3/remote stores (O-041, O-063)?
- How does AGAVE render out-of-switch dtypes; does Vol-E support 0.5; does WEBKNOSSOS read local filesets (O-051, O-058, O-040)?
- Which bioformats2raw 0.5 layout details differ; what non-bioformats2raw pyramid shapes exist (O-038, O-056)?
- Is QuPath slowness per-chunk requests, missing pyramid use, or decompression (O-057)?
- Does the validator enforce schema plus prose MUSTs; should raw fallback apply to unknown codecs (O-066, O-068)?
- Single bad channel window: disable all contrast or just that channel (O-067; draft F3 recommends per-channel)?

### U-C. Unchecked by this verifier

- Large issue/API dumps: S015, S026, S028 (beyond two targeted hits), S035, S050 (beyond two targeted hits), S073, S078-S080, S087, S089-S091, S097, S100-S101, S109, S112, S114, S118-S125 and S024, S063-S065, S075-S076, S081-S086, S088, S092-S094, S102-S107, S110-S111, S113, S116 — not read; stage-1 D1/D3 stands except where my targeted searches touched them.
- Sample/version context: S010 catalog, S059 (0.4 spec), S051 (RFCs) beyond stage-1 sampling; S020, S029, S040, S057 remainders.
- No live fetching, rendering, or code execution was performed (case rules); all validation ideas in decisions and draft remain unexecuted proposals.

## 6. Coverage

### What I verified and how

- Read fully: S003 (0.5 spec, 896 lines), S043 (features matrix, 567 lines), S053 (image schema, 269 lines), S048 (napari reader, 723 lines), S018 (ome-zarr-py reader, 611 lines), S016 (format.py validation + FormatV05), S044 (auto-shard issue), S056 (plate wells listing, 49 paths counted), S054/S055 (IDR image/array examples), plan/Viewer.md, brief.md.
- Read in targeted windows or via the evidence bundle with follow-up context: S004, S008, S011, S013, S014, S019, S023, S025, S027, S031, S033 (codec table, formatting, usage changes), S034 (challenge, resave, chunk/shard tuning), S038, S052 (release bodies incl. v0.12.0/v0.15/v0.16/v0.19.x), S058, S061, S062, S072, S096, S098, S108, S117, S047, plus S002/S005/S007-class empty/stub captures via O-065.
- Corpus searches (muse.search, regex): `compressor` over case/sources; `scene|coordinateSystem` over S003; `labels` over S003; `get_pyramid_lazy|get_first_well|plate\.py` over case/sources; `merged|20(24|25)|...` date checks over S008/S013/S023/S027; `v0\.(12|15|16|19)|sharding|permissive|...` over S052; dimorder/driver over S098; resave/modify over S034; compressor-option flags over S033; plate title over S050. Scopes and hit sets are recorded in decisions B-106, B-109..B-115 and non-findings NF1-NF6.
- Quote-locator results in stage1/evidence-bundle.md were treated as retrieval hints only; every decided claim was checked against the underlying source lines, and not_located quotes (O-003..O-006, O-008, O-009, O-014, O-017..O-024, O-027, O-032, O-035, O-037..O-039, O-048, O-050, O-053, O-062, O-064..O-068) were verified by reading the cited windows, not by lookup success.

### Decision tally

- 129 blocks decided: 78 confirm, 10 qualify (B-009, B-014, B-015, B-019, B-021, B-022, B-026, B-030, B-050, B-109, each with a stand-alone replacement), 0 reject, 6 unresolved (B-110..B-115), 35 not_a_claim (headings, validation-idea proposals, and stage-1 process records in B-116..B-128).
- No block left undecided; grouped ranges cover only contiguous bookkeeping blocks (B-002..B-003, B-116..B-121, B-122..B-128).

### Limits

- Verification is textual only: I compared draft claims against pinned source text and the Plan. I did not open filesets, run readers, render images, or fetch live sources.
- Absence findings (NF1-NF6) are bounded by the stated search scopes; re-running the recorded patterns is the check.
- Deferred stage-1 sources (U-C) could still move R5/R6 and several U-B questions; nothing in them was assumed.
