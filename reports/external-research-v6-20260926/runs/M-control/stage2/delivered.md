# Slide Scout 0.5 — verified research result (standalone)

Scope: local read-only desktop browser for OME-Zarr 0.5 (brief.md). Plan: case/plan/Viewer.md (thin snapshot; a Plan passage is specified coverage, not implementation). Corpus: fixed case/sources/*.txt only; no live fetching, no execution. This file stands alone; no reader must union earlier notes. Validation ideas are checks to run, not passed tests. "0.5" means S003 specification version 0.5 (S003 L25/L832-833; S053 image.schema); "0.4" means S059 (Zarr v2, .zattrs/.zgroup).

## Findings (one disposition each)

### F1. Discovery must be version- and hierarchy-aware — correction
Conditions: 0.5 local filesets; plates, bioformats2raw collections, labels, multi-multiscales; 0.4 negatives. Sources: S003 L68-72/L152-156/L204-206/L261-275/L305-306/L388-397/L441-450/L530-560/L744-752 (O-001/O-002/O-006/O-007/O-011/O-012/O-013/O-014); S059 L132/L147-148/L223 (O-015); S058 L310-329 (O-040); S013 L150-157 (O-046); S027 L269-270 + S048 L558-579 (O-050); S048 L672-699 (O-063). Plan Viewer.md L5 "opens a local 0.5 fileset and lists the images".
Constraint: branch on store markers (0.5 zarr.json attributes.ome.version=="0.5" vs 0.4 .zattrs; mixed invalid), then follow plate>well>field lists, layout precedence (plate, else OME series, else numbered 0,1,2...), labels-listing UNION directory probing, first-multiscales default with no-crash on multi-multiscales, Labels/Label parent walk-up (only walk-up evidenced). Note: bioformats2raw.layout value type is ambiguous (S003 L256 "3" vs examples numeric 3).
Consequence: flat image list is wrong for plates/collections; present fileset > plate/well/field or series > image > labels, with version-aware errors.
Validation: open plain image, sparse plate (S056-shape), multi-series collection, unlisted-labels group, 0.4 fileset; check tree + 0.4 message vs validator.

### F2. Pyramid level choice must be scale-aware with a v3 decode stack — correction
Conditions: 0.5 multiscales; arbitrary paths/codecs/chunks; Z-downsampled and non-2 pyramids. Sources: S003 L305-312/L314-315 (O-005/O-006); S054 L31-73 (O-021); S055 codecs/shape (O-022); S034 L43-46 (O-024); S043 L2-12/L80-89 (O-029/O-030, v0.4 samples, behavior extrapolated); S033 L157-196 (O-037); S058 L387-389 (O-041); S033 L107-123 (O-056). Plan L5 pan/zoom + auto level.
Constraint: order = datasets[] order (never numeric sort); pixel size = that level's scale (never assume factor 2); z-size may vary; decode sharding_indexed + blosc/gzip/zstd/null + arbitrary grids (S055 uses blosc with cname=zstd + crc32c index).
Consequence: renderer needs per-level shapes/plane counts and v3 shard/codec stack; uniform-2x y/x-only assumption breaks real data.
Validation: render Z-downsampled + non-2 pyramids beside known-good views; compare shapes/scale/tiles at three zooms.

### F3. Channel defaults and fallbacks are missing from the Plan — correction
Conditions: images with full omero, without omero, with one broken window. Sources: S003 L398-430 + S053 L75-125 + S054 L77-113 (O-008); S018 L335-349/L356-388 (O-067: silent early-exit + whole-list contrast wipe on one bad window); S048 L204-213 split-layers (O-026); S072 L3 + S096 L25-28 + S117/S108 (O-051/O-052, AGAVE precedents). Plan L5 "channel visibility controls" (controls covered; defaults not specified).
Constraint: when omero present, initial visibility/label/color/window from channels (color 6-hex; window start/end; greyscale whitens; rdefs/model/active/label are optional example fields, not MUST); absent omero needs deterministic fallbacks; one bad channel must degrade per-channel with notice, never silently reset all.
Consequence: controls work without omero and match omero when present.
Validation: open full-omero, no-omero, single-broken-window fixtures; record visibility/names/colors/limits per channel.

### F4. Time/plane selectors must be axes-driven with per-level remap — correction
Conditions: 2-5D, time/channel/space/custom order, Z-downsampled pyramids. Sources: S003 L299-303/L173-174 (O-003/O-004); S003 L419-423 rdefs (O-008); S043 Z (O-029, v0.4); S098 L206-220 version branch (O-053; fixed-order risk noted); S033 L335-337 TCZYX default (O-055). Plan L5 "time-point and plane selection where relevant".
Constraint: selector presence from axes (not fixed tczyx); plane counts from active level shape; initial positions from rdefs defaultT/defaultZ when present.
Consequence: 2D/3D/4D/custom show only applicable selectors; level switch remaps plane indices.
Validation: open 2D/3D/4D-no-t/5D/custom fixtures; check selectors, rdefs defaults, plane counts across two levels.

### F5. Label overlay must be label-specific, aligned, and explicit — correction
Conditions: listed + unlisted + plate labels; missing colors. Sources: S003 L437-474 (O-009/O-010); S048 L653-654 hidden, L709-716 channel-strip, L608-650 colors/properties, L543-555 PlateLabels first-well proxy, L558-579 listing-only iteration (O-062/O-050); S048 L204-213 vs S025 (O-026); S043 L473-507 overlay minority (O-036). Plan L5 "optional overlays".
Constraint: discover by listing UNION probing; require integer dtype + same level count; align level-to-level (proposal; spec says same coordinate system usually S003 L432-433); default hidden + toggle; colors from image-label (invent colormap only if absent, with notice); strip channel axis; plate labels at least first-well proxy (per-well derivation unevidenced).
Consequence: overlay is aligned label layer, not general fusion; misalignment/missing colors produce notices, not silent offsets/invisible labels.
Validation: overlay at two levels, screenshot-diff boundaries vs source; repeat missing-colors + plate-labels fixtures.

### F6. Details panel must compute calibrated coordinates from combined transforms — correction
Conditions: dataset-only scale; dataset+top-level; translation present; UDUNITS units. Sources: S003 L170-174/L276-293/L308-315 (O-003/O-004/O-005); S054 units/scales (O-021); S043 L318-350/L352-428 scale/translation/top-level (O-033/O-034/O-035, v0.4); S011 L159 default-reader ignore (O-044). Plan L5 "details panel shows dimensions, units and coordinates".
Constraint: coordinates = per-dataset scale/translation composed with top-level multiscales transforms, in axes order, UDUNITS space/time (channel usually unitless); dimension_names must match axes; translation must at minimum not break rendering; state rule for missing/inconsistent units.
Consequence: panel shows per-axis pixel size/units + calibrated cursor from active level; ignoring top-level/translation repeats known bugs.
Validation: hand-compute three cursor positions from JSON vectors for three fixtures; compare with panel.

### F7a. Background reads with cancel — covered
Conditions: large images/plates. Sources: Plan L7 states it; sizes S034 L67-83 (O-025). Consequence: keep Plan behavior; cancel must observably drop stale tiles. Validation: profile latency/memory during pan/zoom/flips; verify stale requests drop.

### F7b. Large-data bounding rule is still required — correction
Conditions: 21-66GB images, 485GB-1TB plates (S034). Sources: S018 stitching cost (O-020); S043 vizarr-overview vs napari-zoom-crash (O-031, v0.4); S117 L102-128 explicit level/channel/subregion + GPU estimate (O-052); S061 L39 chunk/request cost warning (O-057, remote v0.4). Plan L7 background/cancel alone can still OOM.
Constraint: add bounding (auto low-res-first and/or explicit choice with estimate) so acceptance large case cannot OOM. Strategy itself is product choice P-C3.
Validation: open largest acceptance fileset under memory cap; pan/zoom must stay responsive.

### F8. Failures must name node + rule + next action — correction
Conditions: local 0.5 + negatives/malformed. Sources: S003 version/consistency (O-002); S059/S003 break (O-015); S058 contrast (O-040); S014 repetitive chunks (O-042); S013 mixed-write throws + compressor ValueError (O-046/O-047; read-path mixed error is proposal); S038 no-metadata/silent-no-chunks (O-048); S048 L698-699/S018 L598-600 no-match ignore (O-063); S053/S016 schema/validation (O-066/O-017). Plan L7 "explain which image/data + choose another".
Constraint: taxonomy at least: 0.4-in-0.5, mixed/inconsistent version, absent multiscales/plate/well keys, schema count/key/vector violations, dimension_names mismatch, unsupported codec/shard/dtype, transform violations, missing wells/fields, unlisted-vs-unreadable labels, non-NGFF entry. Silent ignore / silent no-chunks are known bad modes.
Consequence: every failure names node + violated rule + recovery (pick item/level); browser stays usable.
Validation: one malformed fixture per row; check message + usability.

### F9. Interop requires a published codec/dtype/layout matrix — correction
Conditions: real 0.5 tools 2024-2026. Sources: S055 sharding (O-022); S034 heterogeneity (O-024); S025/S096 dtype bounds vs S003 labels 8-set + open image dtypes (O-028/O-051); S033 table/options/quirks (O-037/O-039/O-056); S058 tuning (O-041); S013 v3 codec pipeline (O-047); S052 drift incl. permissive-0.5/plain-string-codec (O-054). Plan L9 "interoperate with real 0.5 tools".
Constraint: publish supported/unsupported matrix (codecs x dtypes x layouts incl. converter quirks like custom %d/%d hierarchies, dropped OME/root markers); outside-matrix fails loudly citing the row. Note: bioformats2raw zlib-no (S033 L159-162) is converter-specific, not a format promise (S003 L70-72 allows all codecs).
Consequence: interop is tested, not assumed.
Validation: one fixture per claimed cell; record open/render/explain.

### F10. Read-only session behavior — covered
Conditions: local viewing sessions. Sources: brief + Plan L9 state it; absolute-path trap S108 L27 (O-058). (S034/S031 citations do not prove read-only; disposition rests on brief+Plan.) Consequence: enforce read-only handles + session-scoped settings. Validation: hash fileset tree before/after scripted session; any delta fails.

### F11. Excluded work stays excluded — covered
Conditions: editing/export/remote/interpretation requests. Sources: brief + Plan L9 exclude; S061 L39 remote (O-057) correctly out of scope. Consequence: refuse with scope message; leave local browsing intact. Validation: remote-URL + export attempts refuse cleanly.

### F12. Acceptance must be a fixture matrix with oracles — correction
Conditions: representative + large + malformed. Sources: S034 sizes/catalog (O-025); S031 validator + S008 L158 validator-first (O-059); omero/samples context (O-008). Plan L11 "representative filesets ... large ... malformed".
Constraint: span plain image 2D-5D, sparse plate, bioformats2raw collection, labels (listed/unlisted/plate/missing-colors), Z-downsampled + non-2, translations, top-level transforms, multi-multiscales no-crash, sharded + each claimed codec, 0.4 negative, malformed battery; each pre-checked in validator where applicable; large case sized in GB/pixels/chunks. Note: multi-multiscales oracle S043 is v0.4; some fixtures' real-world existence unresolved (R5).
Consequence: acceptance is per-cell oracle (validator + known-good view), not one happy path.
Validation: publish matrix; any cell without oracle/threshold fails the acceptance definition.

## Correct non-findings (do not treat as required)

- N1. General multi-image fusion on one canvas: minority viewer capability (S043 L473-507 napari/WEBKNOSSOS/Microscopy Nodes only), not a 0.5 obligation. Scope overlay to labels (F5). Disposition: unsupported.
- N2. Remote storage, export, editing, clinical interpretation: explicitly out of brief + Plan L9. Disposition: unsupported.
- N3. Scene/coordinateSystems graph traversal: in napari code (S048 L402+) but absent from 0.5 spec contents/metadata (S003 L29-44/L166-808); v0.6-era. Disposition: unsupported for 0.5.
- N4. zlib "unsupported for 0.5" as framed in draft is wrong: converter-table absence (S033 L159-162) does not remove generic 0.5 codec tolerance (S003 L70-72). Handle via F9 matrix + explicit unsupported-codec error. Disposition: unresolved (matrix row), not unsupported.
- N5. Multi-multiscales choice UI is not a required correction: spec "can choose ... first as fallback" (S003 L388-397) is permissive; zero surveyed viewers support it (S043 L277-316). Required: first-default + no-crash (F1). Choice UI is optional O-C3. Disposition: optional_capability.
- N6. Translation rendering alignment vs panel math: panel must combine translation (F6); pixel-level overlay alignment may be napari-style or ignore-with-notice (O-C4). Do not conflate. Dispositions: F6 correction; O-C4 optional_capability.
- N7. F3/F7 "covered with ..." double dispositions are corrected above: F3 correction, F7a covered + F7b correction + P-C3 choice.

## Optional capabilities (adopt only with review)

- O-C1 RO-Crate panel fields (S034 L45-46): richer details for challenge data; fallback when absent.
- O-C2 raw-array fallback + explicit non-NGFF notice (S018 L593-596): pixels plus notice vs bare failure.
- O-C3 multi-multiscales choice UI (S003 L388-397; S043 L277-316): open sample without crashing + offer choice.
- O-C4 translation-aware visual alignment (S043 L352-392): aligned overlay or documented ignore-with-notice.
- O-C5 rotation/affine/sequence warn-skip/compose (S048 L81-122; beyond 0.5 S003 L309): no-crash + message each type.
- O-C6 label properties hover/inspect incl. index (S003 L467-471; S048 L628-650).
- O-C7 finder-style multi-fileset browsing: traversal + CSV/Folders tree + thumbnails + copy-URL (S023 L150-154).
- O-C8 transfer-function/ROI clipping beyond toggles (S108 L15/L25; S062 Vol-E URL pattern).

## Grouped product decisions for the user

- D-A plate navigation (P-C1): vizarr low-res overview + drill-down (S043 L214-215) vs stitched canvas (S018 zeros; napari zoom crash L219-220) vs flat field list. Measure time-to-first-field + zoom stability on sparse-plate fixture. Recommendation: overview + drill-down; avoid full-res stitched default.
- D-B channel rendering (P-C2): split layers (S048) vs blended composite (S025 L81-82). Compare fidelity + toggles on 3-channel uint16 fixture.
- D-C pyramid UX (P-C3): auto (Plan) vs explicit + memory estimate (S117) vs hybrid low-res-first. Test large open under memory cap per mode.
- D-D strictness (P-C4): strict schema reject (S053/S016) vs permissive-with-notice (S052 PR594 spatial-data). Test spatial-data-style edge fixture under both; R2 stays unresolved until PR594 scope known.
- D-E overlay scope (P-C5): labels-only (recommended; brief) vs general multi-image (3/11 viewers). Confirm scoped refusal or supported path.

## Unresolved and unchecked items

- R1 labels-registration move adopted/reverted (S004 L156 proposal vs S003 L441-450 released): unresolved; follow S003 as authority.
- R2 permissive-0.5 acceptance set (S052 L128 title only): unresolved.
- R3 v3 read spellings compressor vs codecs (S013 write-path only): unresolved; reader should at least error explicitly.
- R4 fixed-napari transform combos (dataset+top-level; S011 L159 + S048 compose): unresolved.
- R5 real-world frequencies (translations, top-level, multi-multiscales, custom hierarchies, pyramid shapes, dtype histogram): unresolved; no corpus histogram.
- R6 deferred gaps: PR123 TODOs in releases (S027 L175-178), vizarr #307 root cause (S014), neuroglancer v3/shard later status (S038), Vol-E 0.5 support (S062), AGAVE out-of-switch dtypes (S096 L25-28 no else): unresolved on current reads.
- R7 validator rule coverage metadata vs codec/shard (S031 L1-15 only): unresolved.
- U1 bioformats2raw.layout value type string "3" vs number 3 (S003 L256 vs L200/L213): unresolved; accept both, warn on mismatch.
- U2 S055 exact codec wording: blosc(cname=zstd)+crc32c sharding, not standalone zstd; S056 exact well count (~50 uncounted): qualify, recount from S056 if used as acceptance numbers.
- Unchecked inside corpus: S026 napari releases (could resolve PR123 TODOs), S015/S028/S035/S050/S073/S078-S080/S087/S089-S091/S097/S100-S101/S109/S112/S114 large dumps, S033-rest/S058-rest remainders (--no-ome-meta-export detail), S010 full sample catalog, tensorstore/API dumps, S024/S040/S047/S051/S057/S063-S065/S075-S076/S081-S086/S088/S092-S094/S102-S107/S110-S111/S113/S115-S116/S118-S125. Draft D1-D5 deferral stands; R5/R6/R7/X-items mark the residue. Empty/stub captures (S002 0 bytes etc., O-065) are absence of evidence, not evidence of absence.

## Coverage and limitations

- Reread for this verification: S003 (full 0.5 spec), S059 (0.4 contrast head + targeted), S053 schema, S016/S018/S019 (format/reader/io), S048 (napari reader: channels/labels/plates/entry/transforms/scene), S043 features matrix (Z/non-2/plate/multi/omero/scale/translation/overlay blocks), S054/S055/S056 examples, S034 challenge, S033 bioformats2raw (codecs/pyramids/order/quirks), S025 vizarr dtypes, S014 vizarr issue, S011 napari issue, S023 finder, S013 PR413, S038 neuroglancer, S027 PR123, S004 PR206, S008 PR404, S031 validator, S044 auto-shard, S052 releases (v0.12/v0.15/v0.16/v0.19), S058 WEBKNOSSOS structure/tuning, S061 QuPath, S062 Vol-E, S072/S096/S098/S108/S117 AGAVE set, S070 head, S062/S108 portability. See out/checks.md for line-level verdicts.
- Not visited or only searched: items listed under Unchecked above; no live fetching/rendering/execution per case rules, so all validation ideas are unexecuted by design.
- Version caveat: S043 viewer-behavior evidence is v0.4 samples; applied to 0.5 as behavioral extrapolation where the mechanism (pyramid math, transform handling, stitching cost) is version-independent, flagged per finding.
- Build order implied: (1) F1 discovery + F8 errors; (2) F9 decode matrix gated by validator; (3) F2-F6 navigation/calibration; (4) F7b bounding sized by F12; (5) optionals/decisions only after review.
