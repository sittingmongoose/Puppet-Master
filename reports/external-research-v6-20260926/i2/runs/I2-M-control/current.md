# Slide Scout 0.5 research report (CURRENT)

Scope: local read-only desktop browser for OME-Zarr 0.5 filesets (brief). Corpus: exactly the manifest-listed case/sources/*.txt captures. All validation proposals below are UNEXECUTED. No claim here is independently verified beyond the cited captures. Issue titles are leads, not consensus.

## 1. Format obligations the thin Plan must absorb (corrections)

### R-01 Zarr v3 store reading (zarr.json, codecs, chunk grids)
- Propositions [O-001, O-002, O-017, O-024, O-043]: 0.5 requires Zarr v3; metadata at zarr.json attributes.ome with hierarchy-consistent version; all Zarr features allowed unless disallowed; writers emit blosc/gzip/zstd/uncompressed and sharding_indexed; 0.5 has been the ome-zarr-py write default since v0.12.0 (Aug 2025).
- Conditions: 0.5 scope; challenge resave default shard is full array shape with 100M-pixel explicit-shape gate.
- Plan fit: Plan L5 ("opens a local OME-Zarr 0.5 fileset") and L9 ("interoperate with filesets from real OME-Zarr 0.5 tools") assume but do not state v3/sharded/codec requirements.
- Disposition: correction
- Constraint: reader MUST parse zarr.json/attributes/ome, MUST support sharded v3 arrays and v3 codecs (at least blosc, gzip, zstd, uncompressed), MUST check version consistency.
- Consequence: a v2-assuming or unsharded-only reader silently fails real 0.5 filesets.
- Validation proposal (UNEXECUTED): open S054/S055-shaped sharded uint16 fixture and a gzip/zstd-coded fixture in a v3-capable harness; compare against ome-ngff-validator verdicts (O-050).

### R-02 Axes and dimension_names agreement
- Propositions [O-003, O-004]: axes names unique, 2-5 axes with 2-3 space + at most one time + one channel/custom, strictly ordered t,c,space; axes length equals array ndim; array dimension_names MUST exist and match axes names.
- Conditions: 0.5 multiscales; zyx SHOULD order when anisotropic.
- Plan fit: Plan L5-L6 (details panel shows dimensions/units/coordinates; time/plane selection) presumes axis knowledge without stating ordering/validation rules.
- Disposition: correction
- Constraint: reader MUST validate ndim/axes/dimension_names agreement and MUST map navigation controls by axis type order, not by assumed 5D positions.
- Consequence: misordered or mismatched axes produce wrong plane/channel/time selection and miscalibrated coordinates.
- Validation proposal (UNEXECUTED): fixtures with 2D, 3D, 4D (c,z,y,x), 5D (t,c,z,y,x) axes plus a dimension_names-mismatch fixture; check control mapping and malformed-input message (Plan L11).

### R-03 Resolution-ordered datasets with per-level scale math
- Propositions [O-005, O-009, O-023, O-044]: dataset paths are arbitrary but resolution-ordered; each dataset has exactly one scale (+ optional one translation after scale), vectors sized to axes; viewers fail on non-2 factors and Z-downsampled pyramids.
- Conditions: 0.5; multiscale-level transforms MAY also apply after per-dataset ones.
- Plan fit: Plan L5 ("chooses an available pyramid level appropriate for the current view") omits scale-vector math and non-2/Z-downsample cases.
- Disposition: correction
- Constraint: level choice and zoom calibration MUST derive from datasets order + per-level scale vectors; MUST NOT assume path names, factor 2, or Z-constant pyramids.
- Consequence: assuming factor-2/Z-constant pyramids misrenders documented real pyramid shapes.
- Validation proposal (UNEXECUTED): non-2-factor and Z-downsampled fixtures (per O-023 samples); verify level selection and physical-size display against scale vectors.

### R-04 Calibrated scale application (not cosmetic)
- Propositions [O-005, O-020, O-044, O-047]: coordinateTransformations scales define physical size; default-reader scale ignorance causes incorrect anisotropic rendering (issue-139 allegation); established readers surface per-axis scale dicts + units with lazy dask access.
- Conditions: 0.5; scale vectors per level; units SHOULD be UDUNITS-2 space/time vocabularies.
- Plan fit: Plan L5 ("read correctly calibrated coordinates") and L11 acceptance ("calibrated coordinate display") cover the goal but not the transform pipeline.
- Disposition: correction
- Constraint: display MUST apply dataset scale (+ multiscale-level scale when present) with axis units for coordinates, scale bar, and aspect.
- Consequence: ignoring scales repeats a documented misrendering failure class.
- Validation proposal (UNEXECUTED): anisotropic fixture (e.g. S054 z 0.5002 vs y/x 0.3604 um); check rendered aspect, coordinates readout, and scale bar against validator scale math.

### R-05 Translation handling for origins and overlays
- Propositions [O-005, O-045]: translation MAY appear once after scale; only napari honors dataset translation in-matrix; vizarr 3D translation reportedly breaks rendering; multiscale-level transforms widely ignored.
- Conditions: 0.5 optional translation; 0.5-file frequency unknown (no corpus survey).
- Plan fit: Plan L5 (aligned label overlays; details coordinates) assumes alignment without naming translation.
- Disposition: correction
- Constraint: reader MUST apply translation offsets to origins and label overlays when present, and MUST surface unsupported-transform cases instead of silently ignoring them.
- Consequence: silent ignore misaligns overlays and coordinate readouts on translation-bearing filesets.
- Validation proposal (UNEXECUTED): translation-bearing fixture overlaid with its label image; measure overlay registration with and without translation applied.

### R-06 Label discovery, dtype, and level-count rules
- Propositions [O-007, O-036]: labels are integer-typed (uint8-int64 set) multiscale images under labels group, registered by path list, matching source level counts, metadata-free intermediate groups; image-label is SHOULD-level in 0.5, so image-label presence alone cannot distinguish image vs label groups (open dispute ngff#339).
- Conditions: 0.5 labels; colors/properties/source SHOULD-level display aids.
- Plan fit: Plan L5 ("optional overlays for associated label images", "aligned label overlays" L11) omits discovery/dtype/level-count/ambiguity rules.
- Disposition: correction
- Constraint: discovery MUST read the labels path list (not directory scan); MUST enforce integer dtype + level-count match; MUST resolve image-vs-label identity by labels-group membership/path context with explicit ambiguity UX.
- Consequence: float labels, unlisted groups, or level-count mismatches otherwise render wrongly or crash overlays.
- Validation proposal (UNEXECUTED): fixtures for unlisted label group, float-dtype label, level-count mismatch, and image-label-absent label; check discovery, messaging, and overlay behavior.

### R-07 Plate/well/sparse/acquisition navigation
- Propositions [O-007-adjacent plate/well MUST keys in S003, O-013, O-030, O-037, O-038]: plates define rows/columns/wells with index-aligned paths; wells list field paths + acquisition keys; real plates are sparse with large field counts and sometimes no acquisitions; readers zero-fill missing wells/fields and ignore acquisitions (open issue).
- Conditions: 0.5 HCS; sparse-well + missing-acquisition cases observed in S056.
- Plan fit: Plan L5 ("lists the images it finds") and L11 ("image discovery") do not address plate/well/acquisition structure.
- Disposition: correction
- Constraint: navigation MUST model plate row/column/well/field/acquisition hierarchy, MUST handle sparse wells and absent acquisitions, and MUST mark substituted/missing data instead of silent zero-fill.
- Consequence: flat image lists lose plate context; blind /0 defaulting breaks plates (O-037); acquisition-ignorant tiling misrepresents multiplexed data.
- Validation proposal (UNEXECUTED): sparse-plate fixture (S056 shape) + 2-acquisition well fixture; verify hierarchy display, missing-well marking, and acquisition selection.

### R-08 Series-collection discovery (bioformats2raw.layout)
- Propositions [O-008, O-021, O-040, O-049]: layout value 3 with OME/METADATA.ome.xml + series paths; plate takes precedence; readers SHOULD surface all images, not just the first; napari 0.8.0 opens all series images as reference behavior.
- Conditions: 0.5 transitional; series MAY be absent (then numbered groups 0..n).
- Plan fit: Plan L5 image listing omits collection-vs-image-vs-plate entry-point typing.
- Disposition: correction
- Constraint: opener MUST type-detect root (image vs plate vs series collection) before subpath defaulting and MUST present all series images for choice.
- Consequence: first-image-only defaulting violates the spec SHOULD and hides data.
- Validation proposal (UNEXECUTED): 3-series layout fixture + plate-with-layout fixture; verify type detection, series picker, and no blind /0 on plates.

### R-09 omero initial-rendering mapping with explicit fallback
- Propositions [O-006, O-012, O-016, O-023]: omero optional/transitional; when present, channels/color/window(min,max,start,end) required + rdefs defaults/model; two readers map color hex to colormap (white on greyscale), label/active to name/visibility, window start/end to contrast; several viewers ignore omero.
- Conditions: 0.5; channel-count-vs-c-dim mismatch behavior unlocated.
- Plan fit: Plan L5 (channel visibility controls; canvas) and L9 (display settings local) omit initial color/contrast/default-T/Z sourcing.
- Disposition: correction
- Constraint: initial channel colors, names, visibility, contrast limits, and default T/Z MUST derive from omero when present (greyscale model honored); absent/divergent omero MUST trigger a documented fallback.
- Consequence: without this, initial views are arbitrary and cross-tool inconsistent.
- Validation proposal (UNEXECUTED): omero-bearing fixture (S054) vs omero-absent twin; compare initial colors/contrast/selection against the two-reader mapping.

### R-10 Explicit unsupported/malformed-data messaging
- Propositions [O-014, O-018, O-026, O-027, O-029]: readers warn/skip unknown transform types; dtype support is bounded (vizarr 8, AGAVE 3 policies); AGAVE logs missing zarr.json/.zattrs/ome-namespace errors; .zattrs-only scans miss 0.5 filesets.
- Conditions: local 0.5 desktop scope; source files unchanged (brief/Plan L9).
- Plan fit: Plan L7 ("failures explain which image or data could not be displayed") and L11 (malformed input feedback) state the goal; these observations supply the case list.
- Disposition: correction
- Constraint: every bounded-limit encounter (unknown transform, unsupported dtype/codec, missing metadata, version mismatch, dimension/axes violation) MUST yield a which-data/why message with a next-item path; MUST NOT crash or silently substitute.
- Consequence: silent skips/zeros (O-013) become misinformation without this UX.
- Validation proposal (UNEXECUTED): matrix of malformed fixtures (bad version, missing dimension_names, unknown transform, float label, missing well); check message specificity and recovery path.

## 2. Compatibility failures and contradictions (kept visible)

- C-1 Schema/prose tension on coordinateTransformations [O-009, O-005]: prose allows scale|translation with inline-or-path forms; image.schema items allow only inline scale/translation arrays with exactly one scale. Unresolved scope: which writers emit path forms; reader MUST accept prose forms and SHOULD report schema divergence. (Disposition: unresolved.)
- C-2 image-label MUST-to-SHOULD change [O-007, O-036]: 0.4 required image-label; 0.5 only recommends it, alleged to erase image/label distinguishability (ngff#339, open, 16 uncaptured comments). Slide Scout MUST NOT treat image-label as the discriminator. (Disposition: unresolved dispute; see section 6.)
- C-3 Version-lookup legacy [O-010, O-011]: 0.5 versions live at ome.version, but the captured reader defaults per-multiscale version to 0.1 and reads only multiscales[0]; multi-multiscale name selection (S003) is unimplemented there and no in-matrix viewer opens beyond [0] (O-044), with two crashes. (Disposition: unresolved for current reader versions.)
- C-4 Transform-subset split [O-005, O-014, O-031]: 0.5 prose allows scale+translation only, but the napari reader accepts rotation/affine/sequence (0.6/RFC-5 direction) with warnings. Forward-tolerance vs strictness is undecided. (Disposition: product_choice; see R-14.)
- C-5 Vintage failure reports vs current fixes [O-019, O-035, O-037, O-038, O-049]: repetitive-chunk rendering (vizarr#307), single-shard no-chunks (neuroglancer#651), /0 plate breakage (ngff#274), acquisition mishandling (ome-zarr-py#225) are dated leads; napari-side series/plate-label fixes shipped in 0.8.0, but vizarr/neuroglancer/BIA resolutions are unlocated. Treat as validation leads, not established defects. (Disposition: unresolved.)

## 3. Optional capabilities (need explicit review per Plan L9)

- P-01 Read OME-Zarr 0.4 filesets [O-042, O-017, O-027]: dual-version detection precedent exists (zarr.json-then-.zattrs). Optional; brief bounds Slide Scout to 0.5. (Disposition: optional_capability.)
- P-02 Plate-overview stitching [O-013]: lazy dask stitching with zero-fill precedent. Optional; a well/field picker may serve better than a stitched overview. (Disposition: optional_capability.)
- P-03 Forward-tolerant rich transforms [O-014, O-031, O-040]: accept rotation/affine/sequence with warnings. Optional; 0.6/RFC-5 scope. (Disposition: optional_capability.)
- P-04 Validator/collection-browsing integration [O-021, O-050, O-052]: validator-first triage links; BioFile Finder-style indexed collection browsing. Optional workflow aids. (Disposition: optional_capability.)

## 4. Product choices (decisions Slide Scout must make)

- R-11 Memory-bounding UX [O-024, O-026, O-053, O-041]: TB-scale plates, full-shape default shards, AGAVE load-dialog + memory-estimate precedent vs transparent lazy loading; time-playback caching. Choice: gate large opens with resolution/subregion selection + estimates, or stream lazily with chunk budgets. Plan L7 responsiveness depends on it. (Disposition: product_choice.)
- R-12 Channel presentation [O-015]: split-per-channel layers vs blended composite; label axis retention conventions; unit-consistency for scale bar. (Disposition: product_choice.)
- R-13 Missing-data representation [O-013]: zero-fill vs explicit gap/placeholder for absent wells/fields/levels. Zero-fill precedent exists but risks misinformation; explicit marking preferred. (Disposition: product_choice.)
- R-14 Transform strictness [O-014, C-4]: strict 0.5 subset with errors vs warn-and-continue forward tolerance. (Disposition: product_choice.)
- R-15 Custom/null axis types and 2D data [O-004]: how channel/time/plane controls present nonstandard axes. (Disposition: product_choice.)
- R-16 Multi-multiscale selection [O-011, O-044]: name-based choice with first-as-fallback (spec sketch) vs first-only. (Disposition: product_choice.)
- R-17 Dtype/codec breadth [O-018, O-026, O-046]: narrow-explicit (à la AGAVE/HELP evolution) vs wide-with-fallbacks. Starting narrow is legitimate if messaged. (Disposition: product_choice.)

## 5. Covered items (thin Plan already states these)

- K-1 Background reads, cancel-on-navigate, no-freeze on large data (Plan L7, L11) [O-026, O-053, O-041 as supporting context]. (Disposition: covered.)
- K-2 Pan/zoom canvas with channel/time/plane controls and label overlays (Plan L5). (Disposition: covered.)
- K-3 Local-only, files-unchanged, session-local settings; no editing/export/remote/interpretation (Plan L9, brief). (Disposition: covered.)
- K-4 Understandable failure feedback over crashes (Plan L7, L11). (Disposition: covered.)

## 6. Unsupported and unresolved disputes (explicit, not discarded)

- U-1 (unsupported-as-requirement): "Support remote/affordable-streaming sources" — QuPath remote-perf lead (O-053) and viewer URL-entry patterns (O-051) do not create a Slide Scout requirement; brief bounds to local filesystem. Original proposition (remote support exists elsewhere) stands as fact; its applicability here is rejected with reason: out-of-scope per brief/Plan L9. Challenge preserved: if supplied filesets arrive via mounted paths only, no remote code is needed.
- U-2 (unresolved dispute): ngff#339 image/label indistinguishability (O-036) vs 0.5 SHOULD wording (O-007). Proposition: 0.5 groups cannot reliably signal image-vs-label. Challenge: labels-group membership/path context may suffice in practice. Status: unresolved; comment thread (16) and 0.6 milestone issue (S035 L5387) unvisited. Slide Scout MUST implement membership-based identification meanwhile (R-06).
- U-3 (unresolved): schema/prose coordinateTransformations divergence (C-1). Status: unresolved; path-form prevalence unknown.
- U-4 (unresolved): acquisition-aware plate/well reading design (O-038); current-reader behavior unvisited beyond S018 snapshot. Status: unresolved.

## 7. Deferred items with reasons

- D-1 0.6/RFC-5 features (named coordinate systems, scene graphs, rotation/affine-first-class): deferred as out of 0.5 normative scope [O-031]; revisit only as forward-tolerance choices (P-03/R-14).
- D-2 Auto-sharded-store reader validation [O-032]: deferred for lack of evidence that such stores circulate; writer-side single report only.
- D-3 Plate-overview performance tuning (chunk 32-128^3 guidance [O-041]) : deferred to implementation profiling; noted as input.
- D-4 Comment-thread archaeology (ngff#339 x16, ome-zarr-py#225 x14, neuroglancer#651 x9): deferred on finite budget; bodies not in captures.

## 8. Coverage

- Sources read in full or in stated windows: S001, S003 (all 896), S004 (1-500), S005-S008, S009, S010 (1-500), S011, S012, S013 (1-220), S014, S016, S017, S018, S019, S020 (targeted regex + windows), S021-S023, S025, S027 (targeted), S028 (title regex + issue-225 window), S029 (1-250), S030-S034, S035 (title regex + issues 274/339/338-adjacent windows), S038, S041, S043 (1-449), S044 (1-250), S048, S051 (1-250), S052 (targeted), S053-S056, S058, S059 (1-150), S061 (1-60), S062, S065-S068, S070, S072, S074, S098, S104, S108, S117 (1-250).
- Searched-only: S028/S035 title regexes for 0.5/shard/plate/label/axis/unit topics (O-048).
- Not visited (unresolved scope): S026, S036-S037, S039-S040, S042, S045-S047, S049-S050, S057, S060, S063-S064, S069, S071, S073, S075-S097 (except S082-title knowledge none), S099-S103, S105-S107, S109-S125 (except S104/S108/S117 read); S010 lines 500+; S013 lines 220+; S029 lines 250+; S044 lines 250+; S051 lines 250+; S059 lines 150+; S061 lines 60+; S117 lines 250+; all issue comment threads; S052 bodies above v0.12.0.
- Evidence limits: S002 empty; S005/S007/S030 failed captures; S068 binary placeholder [O-033]; search captures are discovery aids only [O-034, O-054]; large dumps read by regex/window only [O-048]. Absence assertions herein are bounded to the stated lines/searches; "not located in the specified search" governs all non-findings.
- Unknowns: real-0.5 corpus distribution (axes/codecs/shards/translations/acquisitions); current vizarr/0.5 rendering status; validator 0.5 schema details; 0.13-0.19 reader changes; Vol-E 0.5 status; well-level fixtures for S056 plate.
