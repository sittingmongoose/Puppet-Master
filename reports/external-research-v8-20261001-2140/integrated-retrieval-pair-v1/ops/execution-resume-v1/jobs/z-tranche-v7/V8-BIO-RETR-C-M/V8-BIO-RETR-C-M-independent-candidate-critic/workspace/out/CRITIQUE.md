# CRITIQUE — independent candidate check of V8-BIO-RETR-C-M frozen proposal

Fresh same-family candidate critique (per `inputs/TASK.md` §"Independent candidate flash critique").
No evaluator rulings, sibling cases, or prior candidate reasoning were used. All checks below were
re-derived on 2026-10-03 by fetching the cited public sources directly (GitHub REST/raw,
patch-diff, ngff.openmicroscopy.org) and reading the exact bytes. Where the proposal cited a
sha256 that I could re-derive, I state the match; capture hashes for this critique's own fetches
are named so the host can correlate them.

## Verdict summary

The proposal is substantially accurate. Every load-bearing normative claim in Q2, every
version/behavior claim in Q1, and the full issue → fix → test chain in Q3 were confirmed at the
cited versions, including byte-identical matches for all re-derivable cited hashes (spec
`ca4780a3…`, ome-zarr-py repo `b301149c…` / changelog `4015dace…` / reader.py `c46ba936…` / PR #652
diff `50b0c983…`, vizarr package.json `bddde203…` / PR #261 diff `22066be8…` / PR #298 diff
`f7a8b462…`). I found **no substantive factual error**, but I record one broken hash locator, two
locator/quote precision defects, one unpreserved spec condition with prototype impact (`path`-form
transforms), one fixture-labeling counterexample (F4 vs the actual #288 ratios), and one
validation gap (no fixture exercises the B2 ambiguity badge). All remain correctable without
changing the recommendation.

## Q1 — components, versions, behaviors: CONFIRMED

- **ome-zarr-py**: default branch `master` confirmed (repo API, sha256 `b301149c…` — matches
  proposal). `CHANGELOG.md@master` (sha256 `4015dace…` — matches): latest **0.11.1 (April 2025)**;
  NGFF 0.4 support in **0.3.0 (Feb 2022)** via #124/#159/#162; **0.10.2 (November 2024)** "pin zarr
  at < 3". No later entry unpins zarr, so the proposal's "pinned < 3" as a current constraint is a
  fair inference [I], correctly used.
- `ome_zarr/reader.py@master` (sha256 `c46ba936…` — matches): `Multiscales.matches` is
  `bool(zarr.zgroup) and "multiscales" in zarr.root_attrs` (no `omero` requirement — matches spec
  §3.5 "The 'omero' metadata is optional"); `__init__` reads `multiscales[0]`, version fallback
  `"0.1"` via `format_from_version`, `Axes(axes, fmt=fmt)` with "Raises ValueError if not valid";
  `node.metadata["coordinateTransformations"]` is built only from per-dataset
  `datasets[].coordinateTransformations` — **group-level §3.4 transforms are not surfaced**, as the
  proposal states. `Labels`/`Label` behaviors (list expansion, `image-label.source.image`,
  `colors`/`properties`) confirmed. Precision note (C6 below): the proposal omitted the `zgroup`
  conjunct.
- **vizarr**: default branch `main` confirmed; releases API returns `[]` (fact confirmed; see C2 on
  the cited hash). `package.json` **on branch `master`** exists (sha256 `bddde203…` — matches):
  version **0.3.0**, deps `@hms-dbmi/viv ~0.19.0`, `zarrita ~0.6.0`, test runner `vitest`
  (`"test": "vitest run"`). README (master): interfaces are the standalone web app and an anywidget
  Python API — the "web, not desktop" distribution constraint is confirmed.
- **napari**: release **v0.9.2** published **2026-09-29** (releases/tags/v0.9.2 API) with New
  Feature "Add multiscale level extraction as a `LayerList` action ([#9495])" — exact match; notes
  confirm Qt (GUI) + vispy (rendering), supporting the desktop-window characterization.

Recommendation and tradeoff (napari 0.9.2 + ome-zarr-py 0.11.x + own calibration module): the
stated facts check out; the choice itself is a legitimate product decision [P] with the tradeoff
(heavy install; reader surfaces only datasets-level transforms) correctly separated from observed
upstream behavior.

## Q2 — NGFF 0.4 normative claims: CONFIRMED with two precision defects

All checked against https://ngff.openmicroscopy.org/0.4/index.html (sha256 `ca4780a3…` — identical
to the proposal's cited capture, so we read the same bytes):

- §1.3 RFC 2119 conventions; §2 Zarr-v2/.zattrs MUSTs; §3.1 axes (MUST unique `name`; SHOULD
  `type` — space/time/channel, custom MAY; SHOULD `unit`, UDUNITS-2 enumerated lists; length MUST
  equal array dimensionality); §3.4 axis ordering (time → channel/custom → space MUST; `zyx` SHOULD
  for three spatial axes); `datasets[].path` MUST be ordered largest → smallest resolution; exactly
  one `scale` MUST; `translation` MAY and "If `translation` is given it MUST be listed after
  `scale`"; scale/translation length MUST equal `axes`; multiscales-level `coordinateTransformations`
  MAY, same type rules, "applied after" the datasets-level ones; `version` SHOULD "0.4"; datasets-level
  transform "MUST only be of type `translation` or `scale`" — **all confirmed verbatim**.
- Relative-scale fallback (see C3 for quote precision): "If scaling information is not available or
  applicable for one of the axes, the value MUST express the scaling factor between the current
  resolution and the first resolution **for the given axis**, defaulting to 1.0 **if there is no
  downsampling along the axis**." The proposal's dual-reading flag is warranted; normative force
  (MUST, per-axis, conditional default) preserved.
- Multiple multiscales entries: quote "If only one multiscale is provided, use it. Otherwise, the
  user can choose by name, using the first multiscale as a fallback" confirmed — note it is
  guidance with example code, not an RFC-2119 sentence; the proposal quotes it without upgrading
  its force, which is correct.
- §3.5 omero (transitional): optional; `channels` MUST; per-channel `color` and `window` MUST;
  window `min`/`max`/`start`/`end` MUST — confirmed. §3.6: "Unlisted groups MAY be labels." —
  verbatim. §3.7: `image-label` groups "MUST also contain `multiscales` metadata and the two
  'datasets' series MUST have the same number of entries"; `colors` SHOULD present, `label-value`
  MUST be an integer and all values MUST be unique; "Clients who choose to not throw an error
  SHOULD ignore all except the _last_ entry"; `rgba` MAY; `source` MAY, `image` MUST be a string if
  present, default `"../../"` — all confirmed.
- §2.1 label-dimension note ("should be either the same as the corresponding dimension of the
  image, or `1`") is inside the ASCII layout `pre` block, lowercase "should", non-normative — the
  proposal's "declaration vs. alignment guarantee" correction [C] is **supported**: nothing in
  §3.6/§3.7 requires the label series' axes/scales/translations to correspond to the image's
  beyond level count.
- §2 front matter: "This is the 0.4 release of this specification… Data written with the latest
  version (an 'editor's draft') will not necessarily be supported." — confirmed, but see C1: it is
  in the front-matter "Status of this document" block, **not §1.3**.

## Q3 — issue → fix → test chains: CONFIRMED at diff level

- **PR #652** (ome/ome-zarr-py), "bug: correctly normalize resolution level paths", bug-labeled,
  merged **2026-09-08** — confirmed via PR API. Diff (sha256 `50b0c983…` — matches): fix in
  `ome_zarr/classes/image.py`, `to_ome_zarr`, hunk at line ~394, now rewriting
  `coordinateTransformations[0].input.path` alongside `datasets[].path` and raising `ValueError`
  when `transform.input is None`; new test
  `tests/test_writer.py::TestWriter::test_normalize_resolution_level_paths` (≈68 added lines):
  3 levels at paths `0/1/2`, per-level scales `2**level`, round-trip
  `OMEZarrMultiscale.from_ome_zarr` → `to_ome_zarr`, asserts `path` **and**
  `coordinateTransformations[0]["input"]["path"]` normalize to `s{i}`. The proposal's scope
  condition is **confirmed and load-bearing**: the test writes `zarr_format=3`, `"ome"` key,
  version `"0.6"`, `input`/`output` transform objects — i.e., not the 0.4 dict form; the transfer
  of the *lesson* to the 0.4 path is inference and the proposal labels it [I]. Correctly handled.
- **vizarr #261** (merged 2025-03-06, title/dates confirmed via PR API; diff sha256 `22066be8…` —
  matches): `coordinateTransformationsToMatrix` reads **`multiscales[0].datasets[0]` only**,
  throws on scale/translation length ≠ axes length, carries the comment "Apply each transformation
  sequentially and in order according to the OME-NGFF v0.4 spec", wired in `ome.ts
  loadOmeMultiscales` as `model_matrix` only when no URL matrix is given. `fitImageToViewport`
  computes `zoom` with `availableHeight / (maxY - minX)` — the `minX`-for-`minY` oddity is present
  verbatim in the merged diff (with a `// scaleY` comment); the proposal's no-runtime-claim framing
  is appropriate. No test files in the diff.
- **#271** "3D translation causes images to disappear" — open (state `open` as of my 2026-10-03
  capture), created 2025-04-03; body confirms the regression followed #261 and that the
  transformations support "was needed for scaling Labels to match parent Images".
- **#288** "Problem displaying non square datasets" — created 2025-07-24, closed 2025-09-12
  (closed by the reporter; 7 comments). Maintainer diagnosis comment quotes the ngff-zarr-produced
  `.zattrs`: `scale5` `[793, 25376, 25376]` → `scale6` `[793, 50752, 25376]`, and states "I don't
  think that vizarr is taking the `dataset/scale` into account." — quote and values confirmed.
  No fix PR is cross-referenced in the thread; the workable fix there was deleting the last level
  from the JSON. See C5 on the F4 ratios.
- **#297 → #298**: #297 "isOmeMultiscales() shouldn't check for `omero` metadata" created
  2025-09-02 (user's negative-scale flip ignored by vizarr while napari rendered it correctly);
  #298 "Use defaultMeta in loadOmeMultiscales if no omero" merged 2025-09-03, "Fixes #297"; diff
  (sha256 `f7a8b462…` — matches) changes `io.ts` to `utils.isMultiscales(attrs)` and adds the
  `defaultMeta` fallback in `ome.ts`. Additions total 9 over 2 files, neither a test file — the
  claim "no automated tests in the #261/#298 diffs; verification was a deploy-preview URL" is
  confirmed (PR body: "Deployed at https://deploy-preview-298--vizarr.netlify.app/").
- Cross-check of UNRESOLVED_LEADS #2: `reader.py@master` as of 2026-10-03 still surfaces only
  datasets-level transforms, so that lead remains open (not resolved by #652, which touched the
  writer/class API only).

## Supported corrections and counterexamples

- **C1 (locator error, correct the citation).** "This is the 0.4 release" is in the front-matter
  "Status of this document" block (unnumbered, before §1), not in §1.3. §1.3 contains the RFC 2119
  conventions and the "Transitional" definition. Fix the evidence-base line; the fact it supports
  (0.4 is the release; editor's-draft data not necessarily supported) stands.
- **C2 (broken hash locator, fact stands).** The proposal cites sha256 `db217bf1…` for the vizarr
  releases API "returned `[]`". The two-byte body `[]` has sha256
  `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` (re-captured 2026-10-03);
  `db217bf1…` cannot be the hash of that response. The underlying fact (no GitHub releases) is
  confirmed; the cited locator is wrong or points at a different capture and must not be relied on.
- **C3 (quote truncation weakens a condition).** The proposal's ellipsis of the §3.4 relative-scale
  sentence drops "for the given axis" and "if there is no downsampling along the axis". The full
  sentence (captured §3.4) is: "…the value MUST express the scaling factor between the current
  resolution and the first resolution for the given axis, defaulting to 1.0 if there is no
  downsampling along the axis." The B2 badge design should quote the full conditional; as written,
  the 1.0 default's applicability condition is under-specified.
- **C4 (unpreserved spec condition with prototype impact — correction).** §3.3's table permits
  `scale` and `translation` entries to carry their vectors as `"path": str` ("binary data at a
  location in this container") instead of inline float lists. The proposal's B1 refusal condition
  ("a dataset missing its MUST `scale`") and B2 composition formula (`physical = translation_L +
  scale_L ∘ index`) presuppose inline arrays. Counterexample: a spec-conformant input whose
  per-level `scale` uses only `{"type": "scale", "path": "…"}` satisfies §3.4 (exactly one `scale`
  present) yet falls outside every B1/B2 state the proposal defines — it would be neither accepted
  with correct calibration nor refused with the reasons the proposal enumerates. Required fix: B1
  must detect `path`-form transforms and refuse with an explicit "transform vectors stored
  externally (`path` form) not supported" reason (or implement loading). This preserves the spec's
  permitted forms without expanding scope.
- **C5 (fixture-labeling counterexample).** F4 says "anisotropic level 1 (y ×4, x ×2; the #288
  shape class)". The actual #288 final-level anisotropy is y ×2 / x ×1 (25376→50752 in y, unchanged
  x), on 3-length (3D) scale vectors. F4 remains a valid — indeed stronger — discriminator of
  per-level anisotropy, but it does not replicate the cited shape class; relabel as "inspired by
  #288 (stronger anisotropy, 2D)" or adjust ratios to match the cited case.
- **C6 (precision).** `Multiscales.matches` is `bool(zarr.zgroup) and "multiscales" in
  zarr.root_attrs` (reader.py `c46ba936…`); the proposal's "triggers on `"multiscales" in
  zarr.root_attrs`" drops the zgroup conjunct. No conclusion changes; cite the full condition when
  reusing the detection logic (it matters for B1's own gate, which should likewise require a Zarr
  group).
- **C7 (normative-force precision).** F3 is labeled "spec-permitted" for negative scale. §3.4 says
  scale "specifies the pixel size in physical units" and constrains `type`/length/order; it nowhere
  states positivity, but it also nowhere authorizes negative values. Precise status: "not
  forbidden by 0.4" (absence of constraint), an inference [I], not a positive permission. The
  fixture itself remains well posed (napari rendered #297's negative scale correctly).
- **C8 (validation gap).** No fixture among F1–F8 exercises B2's "calibration semantics unverified"
  badge. The badge fires only on the all-1.0-at-level-0 relative-factor pattern, which F1
  (absolute 0.5/0.25) does not produce. Add a fixture with level-0 scale `[1.0, 1.0]` and level-1
  `[2.0, 2.0]` (both readings consistent, metadata ambiguous) so the badge state and its reason
  string are discriminated, else B2's fallback behavior ships untested.
- **C9 (residual, adequately caveated).** F7 (round-trip integrity) is framed as "the #652
  lesson", but in the 0.4 dict form there is no `input.path` to drift, and F7 checks composed
  extents, not path normalization. The proposal already scopes this ("the failure mode… transfers,
  the code does not"), and F7 tests our module's serialization fidelity, which is a reasonable
  product choice — keep the caveat attached to F7 in B5 so the correspondence is not overstated.

## Witness recipes — value/calculation and discrimination checks

- **F1**: unequal base scales (y=0.5, x=0.25) plus nonzero per-level translations do discriminate
  the per-axis scale indication and translation-aware cursor math (±1e-9 catches translation- or
  axis-conflating implementations). Consistent internally; note (C8) it cannot surface the
  ambiguity badge, as intended.
- **F2**: F1-minus-unit cleanly discriminates the "px (no unit declared)" fallback and scale-bar
  suppression; matches §3.1 unit being SHOULD.
- **F3**: negative-x scale with no `omero` discriminates detection independence from optional keys
  (the #297 lesson) and flip-aware cursor ordering; labeling per C7.
- **F4**: discriminates per-level anisotropy at switch time; labeling per C5.
- **F5 (a–d)**: (a) one-level label → §3.7 MUST level-count refusal — correct force; (b) tolerance
  refusal with Δ — tolerance is declared [P]; (c) missing declared path; (d) undeclared sibling
  listed-not-attached — correct per §3.6 "Unlisted groups MAY be labels". Each sub-case tests a
  distinct refusal state; discriminating.
- **F6**: missing per-level `scale` violates a §3.4 MUST ("MUST contain… exactly one `scale`");
  refusal + acknowledged pixel fallback is consistent with B1. See C4 for the `path`-form variant
  F6 does not cover.
- **F7**: self-consistency check on our module (see C9); not a product-path test; fine as
  validation, not as upstream replication.
- **F8**: two-multiscales picker with first-entry fallback matches §3.4's (non-MUST) guidance and
  example; discriminates the fallback ordering.
- No fixture's stated expectation requires arithmetic beyond trivial composition; the one place
  the proposal states numeric expectations (F1 ±1e-9) is well-formed. Nothing in B5 claims
  execution, consistent with the stage rule: **no test has been executed in this stage and no pass
  is claimed.**

## Obligation assessment (against `inputs/BRIEF.md`)

- **B1 — covered**, with the C4 gap (add a `path`-form-transform refusal) and C6 (require a Zarr
  group in the detection gate). Version checks, read-only boundary (`mode='r'`, no sidecars),
  absent-label state, and unsupported-input states are specified.
- **B2 — covered**, with C3 (quote the full conditional in the badge rationale) and C8 (missing
  discriminating fixture for the badge). Units/fallback semantics otherwise match the captured
  spec text; conditions of validity (axis-aligned scale/translation only) correctly cite §3.4's
  type restriction.
- **B3 — covered.** Association priority, provenance display, alignment gate, nearest-neighbor
  sampling, and six actionable refusal states are specified; the §3.7 MUSTs are cited with correct
  force. F4 relabeling per C5. The napari labels-rendering assumption remains an open lead (see
  below) and is properly marked unresolved rather than asserted.
- **B4 — covered.** Two independently discovered components with version-specific behaviors and a
  concrete tradeoff; observed upstream behavior is separated from inference and product choices;
  the issue → fix → test chain is verified at diff level (including its scope condition).
- **B5 — covered.** Concrete steps, discriminating fixtures, visible limits, unresolved leads, and
  no execution claims. Apply C4/C5/C8 when revising.

## Unresolved obligations / leads (explicit)

No obligation fails outright, but the following remain open and are correctly flagged in
`inputs/UNRESOLVED_LEADS.md`; my checks did not resolve them: (1) napari plugin transform mapping
outside `reader.py` (uncaptured); (2) reader-side group-level transform support — still absent in
`reader.py@master` as of 2026-10-03 (partially re-confirmed, lead stays open); (3) vizarr snapshot
pinning (no releases — re-confirmed); (4) #271 still open at capture time (re-confirmed);
#288 closed without a linked fix (re-confirmed via thread); (5) napari labels sampling at pyramid
levels (unverified); (6) unit conversion scope; (7) relative-vs-absolute scale ambiguity
(spec-level, unresolved; C3 sharpens its wording). A whole-case pass should not treat the
obligation coverage map as establishing truth of the unexecuted validations.

## Provenance note for this critique

Fetches (all 2026-10-03 UTC, response-body sha256): spec index.html `ca4780a3…`; ome-zarr-py repo
`b301149c…`, CHANGELOG `4015dace…`, reader.py `c46ba936…`, issues/172 `122712ce…`, PR/652
`856e3419…` + diff `50b0c983…`; vizarr repo `e2a29c19…`, releases `4f53cda1…`, package.json
`bddde203…`, README `e2b6135a…`, issues/271 `038a3d5c…`, issues/288 `5d061b27…` + comments
`6a6eb50e…`, issues/297 `8ce524d0…`, PR/298 `3fa66f82…` + diff `f7a8b462…`, PR/261 `2b72f725…` +
diff `22066be8…`; napari releases/tags/v0.9.2 `f5bae88a…`. Timeline-endpoint hashes cited by the
proposal (`fad36471…`, `9b5b1545…`) and the napari releases-list hash (`ac2b91f2…`) were not
re-derived (I verified the underlying facts via issue/PR/tag endpoints instead); no cited hash
that I re-derived mismatched except C2. This critique executed no prototype tests.
