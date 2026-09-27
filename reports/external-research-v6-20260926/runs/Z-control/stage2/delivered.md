# Delivered verification result — Slide Scout / OME-Zarr 0.5 research (stage1)

Independent verifier report on `stage1/draft.md` against the fixed corpus `case/sources/S001–S125`
(`case/catalog.json`), the Plan (`case/plan/Viewer.md`, cited as Plan L1–L11) and the brief
(`case/brief.md`). Every consequential claim in the draft was re-checked against the cited source
lines, plus all **seven** observations the draft omitted entirely (O-013, O-020, O-021, O-026,
O-027, O-040, O-057) — exceeding the required three deferred/omitted/unsupported observations.
Per-check detail with verdicts is in `out/checks.md` (C01–C66). This document stands alone.

**Bottom line.** The draft is substantively accurate. All 13 propositions (P1–P13), all 8
counterexamples, all 18 plan-fit rows, all 9 plan gaps and all 7 deferred items check out against
the corpus at the cited lines, including the subtle claims (napari-main's conditional group-level
transform handling, AGAVE's 0.5 heuristic and release dates, the sharded IDR sample's exact codec
stack, the challenge plate's missing `plate.version`). Verification found **eight findings (F1–F8)**: two factual slips in the draft (an unsupported
"21.6 GB" figure; a "12-viewer" count that is 11), one citation slip on the zip-store deferral, a
set of editorial bookkeeping errors in the coverage section, one genuinely material omitted
observation (O-020, transform-order tolerance), two minor omitted observations now recovered
(O-026, O-040), and one disposition quality note (row A is a product choice, not a correction). No false
"covered" decisions, no unsupported disposition labels, and no not-applicable claims were found.

---

## 1. Findings (each with one disposition)

### F1 — Unsupported figure "21.6 GB" in the row-H validation idea — **correction**
- Where: draft L121 (row H), citing "O-034/S010".
- Condition: draft proposes validating responsiveness on "a 9822152-like array, 21.6 GB".
- Evidence: S010 (IDR samples catalog) lists 9822152.zarr as 144384×93184×1×1×1 (0.1/0.4/0.5
  versions, lines 324–345, 797–805, 1114–1122) and contains **no byte-size column**; no corpus
  source states 21.6 GB (≈12.5 GiB at uint8 from the dims). O-034 rests on title-level search
  output only (S049 L7–13) and never mentions this array or size.
- Consequence: low — the number decorates a validation idea, not a claim, but it would propagate
  into test planning as a fake datum.
- Validation idea: drop the figure or derive it from dims×dtype (and note the same for the row-G
  "9846318 (÷3 factors)" — S043 L81 states only "not equal to 2"; the ÷3 is unverified).

### F2 — "12-viewer community matrix" is an 11-viewer matrix — **correction**
- Where: draft L38–39 (P4).
- Condition: P4 says "a 12-viewer community matrix records that NO viewer opens beyond the first
  entry".
- Evidence: S043 (features.yml) has 11 viewer columns: avivator, vizarr, Vol-E, napari,
  BigDataViewer, MoBIE, neuroglancer, vtk-itk-viewer, WEBKNOSSOS, OMERO, Microscopy Nodes. The
  substantive claim (all `supported: no` on 4995115.zarr; BigDataViewer/MoBIE crash) is confirmed
  at S043 L277–316.
- Consequence: cosmetic; fix the count.
- Validation idea: editorial only — no runtime test needed; re-count the viewer columns in S043
  (11: avivator, vizarr, Vol-E, napari, BigDataViewer, MoBIE, neuroglancer, vtk-itk-viewer,
  WEBKNOSSOS, OMERO, Microscopy Nodes) and correct P4's wording.

### F3 — Coverage-section bookkeeping errors — **correction** (editorial)
- Where: draft L5, L9–10, §4 (L169–182).
- Exact errors, each verified:
  1. L5 says evidence lives in `out/observations.md`; the file is `stage1/observations.md`.
  2. L5 says "O-001…O-076, O-060 unused" — O-060 does not exist in observations.md (it jumps
     O-059 → O-061).
  3. L181 lists S031 among "Known-unreadable … failed captures (O-032)" — S031 is readable text
     and was in fact read and quoted (its custom-schemas text matches S031 L10–14, O-040).
  4. S098 is listed twice (L174–175 "targeted extraction" and L177 "not read at all"); S099 is
     listed twice (L170–173 "read in full" and L175 "targeted extraction").
  5. S124 (api.github.com AllenCell/agave PRs/281 capture, catalog lines 2356–2371) is not
     accounted for in any coverage bucket.
- Consequence: low for conclusions, but these errors undermine auditability of the coverage claim
  ("An unread source is not evidence of absence"), which is the draft's own standard.
- Validation idea: editorial only — no runtime test needed; re-derive §4's buckets from
  `case/catalog.json` handle-by-handle (every handle S001–S125 in exactly one bucket) and fix the
  five items listed above; fix the path to `stage1/observations.md` and drop the "O-060" mention.

### F4 — Omitted observation O-020: transform-order tolerance is a lost interop decision —
**optional_capability**
- Where: O-020 (stage1/observations.md L158–164), source S016 L296–342; the draft never cites it.
- Exact condition: the 0.5 JSON schema (S053, `coordinateTransformations` def) imposes **no
  ordering** between the exactly-one `scale` and the optional `translation`; the 0.5 prose requires
  translation "listed after scale" (S003 L311). ome-zarr-py's writer-side validation
  (`validate_coordinate_transformations`, S016 L324–330) raises `ValueError("First
  coordinate_transformations must be 'scale'")` — i.e., a schema-**valid** translation-first fileset
  is rejected by the reference library.
- Why it matters: draft P3 (L34–35) correctly notes the schema is looser than the prose, and row J
  proposes malformed fixtures from schema violations — but the distinct case "schema-valid, yet
  rejected by ome-zarr-py" and O-020's proposed acceptance fixture were lost.
- Consequence: moderate if such a fileset appears (hard validation would refuse a conforming file;
  the ecosystem's own stance is rejection, so silently accepting is a deliberate divergence).
- Validation idea: add a translation-first per-dataset transform fixture; assert defined behavior
  (render, or explicit message naming the ordering rule); cross-check against ome-zarr-py raising.

### F5 — Omitted observation O-026: opening *at* a labels group / unknown root —
**optional_capability**
- Where: O-026, source S048 L664–699 (verified: napari walks up from a `labels`/label-image group
  to the parent image; unknown roots print "No matching spec" and return no layers).
- Why it matters: the draft covers `image-label.source.image` resolution (row E) and silent no-op
  discovery (row J via O-019), but not the entry-point case "user selects the labels/ subfolder in
  the fileset picker".
- Consequence: low-moderate UX; a picked-subfolder flow should navigate up (napari-style) or show
  "this is a label overlay of <image>".
- Validation idea: open a fileset at `…/labels/<name>/` and at an empty group; assert defined
  behavior in both cases.

### F6 — Omitted observation O-040: validator custom-schema mechanism — **optional_capability**
- Where: O-040, source S031 L1–15 (verified: `schemas` query parameter loads branch schemas; the
  example branch is 0.6-draft material).
- Why it matters: rows J/O derive malformed fixtures from the published schema (O-012) but dropped
  the free cross-check against the community validator and the confirmation that 0.6-draft schemas
  circulate separately from released 0.5.
- Consequence: low; strengthens the acceptance-fixture pipeline if adopted.
- Validation idea: when building the row-J/O fixture set, pair each malformed local fixture with a
  validator run using its `schemas` query parameter (S031 L10–14) and assert Slide Scout's message
  identifies the same violation the validator reports; separately note that draft-0.6 schemas load
  via a branch URL, confirming the S6 warn-and-degrade stance.

### F7 — Row A disposition "correction" is better classed **product_choice**
- Where: draft L114 (row A).
- Condition: the draft marks "0.5-only scope" a **correction** because local corpora include
  0.1–0.4 filesets and version policy should be explicit.
- Evidence: the factual base is confirmed (0.1–0.4 filesets in active service: S010 L602–631,
  L1017–1026; 0.4 metadata ≈ 0.5: S059 L129–150, L347; dual-format reference reader: S016
  L24–46/S019 L87–89). But Plan L7 already requires "Opening failures explain which image or data
  could not be displayed", so refusing a 0.4 fileset with a version-naming message is **covered by
  the Plan as written**; what remains is an explicit scope/policy decision (read 0.4 vs refuse),
  which is a product choice, not a required plan correction. Consistent with the rule that
  covered-in-Plan is not implemented and an optional capability is not a required correction.
- Consequence: low; reclassifying avoids inflating the correction count.
- Validation idea: editorial only for the classification itself; the decision it surfaces is covered
  by row A's existing test — open a local copy of a 0.4 IDR sample (e.g., 6001240.zarr, S010
  L923–932) and a 0.6-draft scene fileset and assert the *defined* read-or-refuse behavior with a
  version-naming message (Plan L7).

### F8 — Deferred-item citation slip on zip stores — **correction** (citation only)
- Where: draft L158–159 ("Zipped OME-Zarr (`.ozx`, RFC-9) and zip stores: spec draft + open
  library issues (O-062, O-070)").
- Evidence: O-062 (S051 L112, RFC-9) is correct; O-070's quotes contain nothing about zip stores.
  Actual corpus support: S035 L4500 (".ozx technology compatibility kit") and S052 v0.19.0 body
  (#619 "Spatialdata and zipstores" — zip-store support has already landed in the reference
  library, which the draft does not mention).
- Consequence: none on the deferral conclusion (RFC-9 is unreleased, so staying out of scope is
  right); fix the citation and optionally note #619.
- Validation idea: editorial only — no runtime test needed; re-cite S035 L4500 (".ozx technology
  compatibility kit") and S052 v0.19.0 #619 ("Spatialdata and zipstores") in place of O-070, and
  re-read the deferral sentence to confirm the conclusion is unchanged.

### F9 — Preserved unresolved items, re-confirmed as unresolved — **unresolved** (not new work)
- Group-level `coordinateTransformations` and `path`-referenced transforms: verified spec-legal
  (S003 L282–289, L314–315) and **absent from every captured real fileset** (S054 root group: none;
  S055 level-0 array: none; S056 plate: none). The draft's row-F composition "correction" remains
  justified by spec conformance and the brief's "read correctly calibrated coordinates"; its
  real-world frequency stays unknown (the draft never ran the corpus-wide grep; neither did this
  verification, which checked the three captured filesets).
- Likewise re-confirmed unresolved: per-level sharding identity (only level 0 captured, S055);
  6001240_labels.zarr's inner hierarchy (only its root zarr.json is captured; note S010
  L1069–1076 lists it *without* a "labels" keyword, which additionally supports gap S4 — in 0.5
  only a parent's `labels` list identifies label images, S035 L5043); 2026 viewer-matrix results
  (S041 dates the matrix to the 2025 reader generation); pinned-commit provenance (inference is
  consistent: S017 CHANGELOG head = 0.11.1, S052 shows v0.12.0 followed); currency of zarr-python
  sharding performance (S049 is title-level only).
- One new corpus-level anomaly, no claim impact: S042/S045 file contents appear swapped relative to
  catalog byte counts (S042=36 B catalog vs ~207-char message read and vice versa); both are
  failed-capture error placeholders either way.
- Validation idea: these stay unresolved until the corpus or tooling allows it — run the corpus-wide
  grep for group-level/`path`-referenced `coordinateTransformations` over the large JSON captures
  (resolves item 1), fetch the remaining 6001240_labels pyramid levels' zarr.json (items 2–3), and
  re-run the S043 matrix samples on 2026 readers (item 4); no Slide Scout runtime test is blocked by
  any of them.

---

## 2. Correct non-findings (checked, confirmed, no action)

- **Format obligations (P1–P3, P5, P6)**: verified verbatim in S003 (L60–77, L120–174, L276–318,
  L388–474) and S053; the sharded IDR level-0 array matches O-028's every figure (S055). The
  published schema is indeed looser than the prose on ordering and `name` optionality.
- **Reference-reader behaviors (P4, P9, P12 and O-015..O-019)**: ome-zarr-py reads only
  `multiscales[0]` (S018 L279–284), ignores group-level transforms (L293–295), degrades gracefully
  on partial omero (L330–391), silently yields nothing for unrecognized groups (L583–600), and
  serves 0.1–0.5 via `ome`-namespace unwrap + format detection (S019 L87–89, S016 L35–46/L81–96).
- **Ecosystem recency (P10)**: every date verified — ome-zarr-py v0.12.0 (2025-08-18, #413),
  v0.12.1 read-only fix, v0.15.0 deprecations + #594 permissiveness, v0.16.0 sharding (#534),
  v0.19.0 scenes/0.6 classes; napari-ome-zarr v0.7.0 (2026-03-16, ome-zarr≥0.13) and v0.8.0
  (2026-05-20, drops ome-zarr, opens b2r series); AGAVE PR#220 merged 2025-03-22 with the
  zarr.json⇒0.5 heuristic, releases v1.8.0 2025-05-22 / v1.10.0 2026-07-13 (S091); vizarr #307
  open since 2025-10-08.
- **Wild counterexamples (§1.2)**: challenge plate missing `plate.version` (S056), nameless
  multiscales + anisotropy + `defaultZ: 118` (S054), `>u1`/non-2× and Z-downsample failures
  (S043), ngff#207 still Open (S004), `shards:"auto"` crash (S044), write-mode wipe + fix
  (S008/S052), stale docstring (S016 vs S013/S052).
- **Plan-fit rows B–N and P–R**: all dispositions sound; corrections are anchored in normative spec
  text (omero optional; group-level transforms applied after dataset-level; per-level shapes) or
  demonstrated wild violations; optional capabilities (rdefs defaults, memory-estimate picker,
  time-unit display, multi-multiscales chooser, resource lifecycle) are consistently *not*
  presented as requirements.
- **AGAVE prior art (P13)**: memory-estimate/ROI load dialog (S125), ≤4 channels + irreversible
  channel exclusion + physical-unit timestamps + Labels mode (S117), progressive refinement (S115),
  settings-JSON-with-absolute-paths contrast (S108), blocking-loads still open (S103), time-series
  slowness open (S104), double-cache closed (S105), GPU leak open (S119), QuPath "too slow" (S061).
  (Minor note: the BioFile Finder "local reads via HTTP service" point rests on a dev-docs page,
  S066/S067 — direction supported, phrasing slightly stronger than the page alone.)
- **Corpus integrity**: the 8 failed captures, binary placeholder S068, empties S002/S057, and
  artifacts S088/S120 were individually confirmed; no draft claim rests on them, and the title-level
  hedging of search-discovery sources (S001-class, e.g. S049) is correct.

## 3. Product decisions grouped for the user (all currently open; evidence verified)

1. **Version scope policy** — read 0.4 (cheap: metadata identical modulo `.zattrs`/namespace,
   S059/S016) vs refuse with a version-naming message (Plan L7 messaging); either way, never
   silently misparse; 0.6-draft data gets warn+degrade at minimum. (Was row A; F7.)
2. **HCS plates** — full navigation vs detect-and-list ("plate fileset, N wells"); peers crash or
   degrade (S043 L207–238); canonical 0.5 plates exist as fixtures (S010 L1027–1047, S056).
3. **Storage library** — zarr-python ≥3 (Python ≥3.11 floor, S008 L207; sharding-perf risk is
   title-level only, S049) vs tensorstore (AGAVE's pin v0.1.78, "pretty heavy" build S125, open
   rectilinear-grid/codec-merge gaps S122/S123).
4. **Dtype support matrix** — spec allows all Zarr dtypes (S003 L70–72); peers restrict (AGAVE 4,
   S096; vizarr 8, S025); labels must be integer (S003 L438–440); decide + document + message.
5. **Colorless-label fallback** — default colormap vs "no colors metadata" hint (S048 L657–659;
   spec constraint itself under debate, S035 L5129).
6. **Honor `rdefs.defaultT/defaultZ`** — differentiator (WEBKNOSSOS ignores them, S043 L70);
   optional capability.
7. **Pyramid-level UX** — silent auto-selection vs AGAVE-style level picker with memory estimate
   and XYZ ROI (S125); optional capability.
8. **Single-scale groups** — render with default scale vs explicit "no multiscales metadata"
   message (ngff#207 open, S004; ome-zarr-py renders raw arrays, S018 L593–596).
9. **Label-vs-image marking in the image list** — only the parent `labels` list identifies label
   images in 0.5 (S035 L5043); IDR's own catalog does not flag 6001240_labels.zarr (S010).
10. **Deferred by the draft, concur**: multi-multiscales chooser, plate navigation UI depth,
    `.ozx`/zip stores, consolidated metadata, group-level transform-by-`path` (all evidenced in §G5
    of checks.md).

## 4. Unresolved items (carried forward, with reason)

1. Whether any admitted 0.5 sample uses group-level `coordinateTransformations` or `path`-referenced
   transforms — none found in the three captured filesets; the large JSON dumps were not exhaustively
   grepped by the draft nor by this verification.
2. Whether the three IDR 6001240_labels pyramid levels shard identically — only level 0 captured.
3. The inner hierarchy of 6001240_labels.zarr beyond its root zarr.json.
4. Current (2026) viewer-matrix behavior — S043/S041 describe the 2025 reader generation.
5. Exact ome-zarr-py pinned-commit provenance — inference (post-#413, pre-0.12.0) is consistent
   with S016/S017/S052 but not directly recorded.
6. Whether zarr-python sharding slowness (#1343/#2710, titles only) still applies to current
   zarr-python.
7. All product decisions in §3.
8. New: S042/S045 catalog-bytes vs content anomaly (no claim impact).

## 5. Unchecked items (outside this verification's scope)

- Contents of sources the draft also did not substantively use, sampled only at catalog/title level
  here or not at all: S015, S020, S024, S026 (tag scan only), S037, S039, S040, S047, S050,
  S063, S072–S080, S083, S085–S087, S089–S090, S092–S093, S096–S097 (grep/title views),
  S098–S101, S106–S113, S116, S118, S124. No draft claim relies on them beyond what was verified
  (notably S091/S094 were verified in full for the AGAVE dates/merge).
- Live behavior of any tool or service (no network access; corpus is capture-only).
- The draft's validation ideas (§2 table) are proposals; none was executed.

## 6. Coverage and limitations

- **Checks run**: 66 verdicts (out/checks.md) spanning every draft section: 13 propositions, 8
  counterexamples, 18 plan-fit rows, 9 gaps, 7 deferred items, 7 draft-omitted observations, and the
  corpus-integrity/coverage claims. Every verdict re-read the cited source lines directly; large
  JSON captures were read at the cited line ranges plus targeted greps for issue titles.
- **Strength**: the draft's quantitative and quote-level claims proved unusually accurate — of its
  dozens of specific figures (dates, version numbers, chunk shapes, viewer-matrix cells, issue
  numbers), only two could not be reproduced from the corpus (F1, F2).
- **Limitations**: (a) verification is corpus-bound — "no evidence in corpus" ≠ absence in the
  world, and several draft claims about the wider ecosystem rest on single captured issues; (b) the
  2025-dated viewer matrix cannot be refreshed from the corpus; (c) failed/empty sources
  (S005/S007/S030/S042/S045/S046/S057/S068/S077/S088/S095/S120/S002) bound what anyone can claim
  from this corpus; (d) O-069's `.ozx` line cite (S035 L5301 → actually L4500) and the S042/S045
  byte-count anomaly are recorded but immaterial to any conclusion.
- **Deliverable status**: `out/checks.md` (per-check verdicts) and this `out/delivered.md` are
  complete; the draft requires only the editorial/citation corrections in F1–F3 and F8, and gains
  two recoverable capabilities (F4–F6) plus one disposition reclassification (F7).
