# FINAL PROPOSAL (corrected) — Local calibrated 2D OME-NGFF 0.4 image/label viewer, read-only prototype

Case **V8-BIO-BREADTH-T-M**, final-correction stage. This document is the complete corrected research-to-plan artifact: it resolves `inputs/CRITIQUE.md` against the frozen `inputs/PROPOSAL.md`, revises `inputs/THIN_PLAN.md` per `inputs/BRIEF.md` and `inputs/METHOD.md`, and answers all three research questions (Q1 §2, Q2 §3, Q3 §4) and all five product obligations (B1–B4 §5, B5 §6). It supersedes the frozen proposal; every critique repair was applied after direct re-verification against primary sources (§1). Supported findings are preserved unchanged and marked as such.

Labels: **[SRC]** source fact with exact locator and normative force (RFC 2119 keywords carry their defined force); **[EX]** example or optional behavior shown in a source; **[INFER]** engineering inference from sources; **[CHOICE]** product decision for this prototype (reasons resting on uncaptured general knowledge are explicitly marked); **[CORR]** supported correction — of the thin plan, an upstream assumption, or the prior proposal. **No test, fixture, check, or arithmetic in this document has been executed in any stage of this case; no execution receipt exists or is claimed.** Hand-derived expected values in §6 are stated as arithmetic, not as run results.

---

## 0. Sources independently discovered and cited (no evaluator list was supplied)

| ID | Locator | Version/status | Capture evidence |
|---|---|---|---|
| S1 | OME-NGFF 0.4 specification: rendered `https://ngff.openmicroscopy.org/0.4/` ("Status Text: This is the 0.4 release of this specification"); normative source GitHub `ome/ngff` tag **0.4.1**, file `0.4/index.bs` (40,372 bytes) | 0.4.1 (2022-09-26); commit `106c3010dcb4079eb0a69868a11cc5943f942fdf` | sha256 `592413727ee8d42916bd98007262f48c6139273cb373839c6d285a0ba20b6406` — **re-captured this stage, byte-identical** (2026-10-03T02:41Z); tag→commit chain and rendered-page `Last-Modified: Thu, 01 Oct 2026` verified by the critique's own captures (CRITIQUE §1) |
| S2 | `ome/ngff` 0.4.1 `0.4/examples/multiscales_strict/multiscales_example.json` | 0.4.1 strict example | sha256 `983ccd363c1ca812d9127e9a96f19f822099b5289ab2b729a31f577816199534` — **re-captured this stage, byte-identical**; full content re-read this stage |
| S3 | GitHub API `ome/ome-zarr-py/releases/latest` | **v0.19.2**, published 2026-09-08T20:23:20Z; body: "bug: correctly normalize resolution level paths by @jo-mueller in …pull/652" | sha256 `1085265c47e71e3e0cb90cfda90877fbdfdf516774a7060eac5fbee2efe6549e` (this stage) |
| S4 | `ome/ome-zarr-py` **issue #403** "`coordinateTransformations` generated for 0.4 are scale-only" (opened by d-v-b 2024-11-06; closed 2026-06-17 "completed") + comments | 2 comments: `issuecomment-2501254366` (will-moore, MEMBER, 2024-11-26T16:03:39Z); `issuecomment-2501272022` (d-v-b, 2024-11-26) | comments capture sha256 `bc52b5cd0e37663238e3ab092b340dfb8685ce2f1a2584f3ce995f52ecf75c2f` (this stage); issue body verified by critique's capture |
| S5 | `ome/ome-zarr-py` **PR #652** (merged 2026-09-08T15:31:11Z; merge commit `94eaf20aa096b4a034fc0c636e31d5d64953d6ad`; head `ad8e3250ce7fe310927b0173f680306281c1409a`) + files API | `ome_zarr/classes/image.py` +17/−4; `tests/test_writer.py` +69/−1 (test `TestWriter::test_normalize_resolution_level_paths`) | files API sha256 `66900c97b442e2f804930a499c941c9fc2d56cafa52705a05d2b284e7e4c2f88` — **re-captured this stage, byte-identical**; patch text re-read this stage |
| S6 | GitHub API `napari/napari/releases/latest` | **v0.9.2**, published 2026-09-29T22:18:39Z; "built on top of Qt (for the GUI), vispy (for performant GPU-based rendering), and the scientific Python stack"; "Add multiscale level extraction as a `LayerList` action (#9495)"; "Performance: Avoid redundant unit conversion when aggregating layer extents (#9411)" | sha256 `5ebdf745d7533c61c59f8980970f19ece1de00697f678c4f00d3f3b089670782` (this stage) |
| S7 | GitHub API `hms-dbmi/viv/releases/latest` | **@hms-dbmi/viv@0.16.1**, published 2024-03-13T03:15:38Z | sha256 `f94a482e18e150ab5b0f9fe3e764ddcbe903229d71811059a25d767e69275963` (this stage) |
| S8 | `raw.githubusercontent.com/hms-dbmi/vizarr/main/package.json`; repo has no GitHub `/releases/latest` (404, per critique's capture) | `@hms-dbmi/vizarr` **0.3.0**; depends `"@hms-dbmi/viv": "~0.19.0"`, `"@vivjs/types": "~0.19.0"`, `zarrita ~0.6.0`, `deck.gl ~9.1.0` | sha256 `bddde203696567259721c7f04f6ca8ff0bed44d30203106346efc42fdd7d2cb5` — **re-captured this stage, byte-identical** |
| S9 | GitHub API `openseadragon/openseadragon/releases/latest` | **v6.1.1**, published 2026-09-09T17:00:56Z; notes: TypeScript declarations (#2949), IIIF empty-sizes fix (#2963), DataTypeConverter memory leak (#2971), test tooling | sha256 `b65c763fc3ee342745b3c19e2d0dc20cc94d90e369b5e4536bfe483c1dc2113e` (this stage) |
| S10 | S1 §"Implementations" registry (verified verbatim in this stage's S1 recapture): `ome-zarr-py` — "A napari plugin for reading ome-zarr files."; `vizarr` — "A minimal, purely client-side program for viewing Zarr-based images with Viv & ImJoy."; `bigdataviewer-ome-zarr` — "Fiji-plugin for reading OME-Zarr." | Bounds the shortlist to spec-acknowledged implementations | part of S1 |

Discovery method (unchanged): spec landing page → `ome/ngff` git tags → normative `index.bs` → GitHub API releases/issues/pulls/files for components and the failure history. Sub-page URLs such as `ngff.openmicroscopy.org/0.4/multiscales.html` return 404 (reproduced by the critique); the whole 0.4 document is the single `index`/`index.bs` source. All fetches this stage: 2026-10-03T02:41–02:43 UTC via the case's public-HTTPS capture path.

---

## 1. Critique resolution — which critique points changed the plan and why

Every critique correction was checked against primary sources before acceptance. **All were accepted; none was rejected.** Dispositions:

| # | Critique point (severity) | Verification this stage | Disposition and change |
|---|---|---|---|
| 1 | C2's only numeric witness value was wrong: "(11.5, 3.65)" for F2 at index (10, 20) (high) | Re-derived independently: F2 level 0, axes (y, x), translation [7.5, 3.25], scale [0.4, 0.65] ⇒ y = 7.5 + 0.4×10 = 11.5; x = 3.25 + 0.65×20 = 16.25. No pairing of F2's numbers yields 3.65 at index 20 | **[CORR] Accepted.** Corrected to **(11.5, 16.25)** with axis order stated (§6 C2, §5 B2). The old value is withdrawn. Change reason: a wrong expected value would fail a correct implementation or enshrine a bug |
| 2 | F2 named one translation and no level-1 entry, so C3 (switch invariance) could not discriminate translation-reuse (medium) | Accepted as a specification defect; the repair's arithmetic checked: (0.8−0.4)/2 = 0.2 (y), (1.3−0.65)/2 = 0.325 (x) ⇒ level-1 translation [7.7, 3.575] | **[CORR] Accepted.** F2 now defines both `datasets[]` entries (§6 F2) and C3 now has discriminating hand-derived values: level-1 index (5, 10) → correct (11.7, 16.575) vs translation-reuse bug (11.5, 16.25) (§6 C3) |
| 3 | PR #652's regression test is Zarr-v3/NGFF-0.6-shaped, not 0.4-shaped; §3's relevance claim overstated carry-over (medium) | **Verified directly from the S5 files-API patch (re-read this stage):** `zarr.open_group(path_v3, mode="w", zarr_format=3)`; `root_v3.attrs["ome"] = {"version": "0.6", "multiscales": [{"coordinateSystems": […]}]}`; transforms carry `"input": {"path": …}` and `"output": {"name": "physical"}`. None of these fields exists in 0.4 (its transform entries admit only `type`/`scale`/`translation`); the fix code likewise manipulates `transform.input` model objects | **[CORR] Accepted.** §4 rewritten: the chain is real and correctly described, but the verified test artifact exercises 0.6/Zarr-v3 metadata; what transfers to this 0.4 prototype is (a) the PR/test-docstring demonstration that third-party stores use non-canonical level names, (b) the 0.4 arbitrary-name rule, (c) the record-atomicity lesson — by analogy; F7/C6 are the 0.4-shaped read-path complement |
| 4 | F8 did not state its axes, so "readout unchanged (2D)" did not follow (low) | Checked against the S2 pattern: its group-level scale `[0.1, 1.0, 1.0, 1.0, 1.0]` leaves spatial components at 1.0 | **[CORR] Accepted.** F8 now specifies axes `t,y,x`, per-level scales `[1.0, 0.5, 0.5]`, group-level scale `[0.1, 1.0, 1.0]` (§6 F8) |
| 5 | B3's float tolerance ("after normalize") undefined, so C4 not testable (low) | Product decision, no source needed | **[CORR] Accepted.** Tolerance defined in §5 B3: JSON ints coerced to 64-bit float; NaN/inf rejected; exact `==` equality per axis value; any difference ⇒ withhold `LABEL_GEOMETRY_MISMATCH` |
| 6 | Withholding differing-but-world-consistent label geometry should be a visible limit (low) | Follows from 0.4 permitting a label multiscale with its own per-level transforms (only level-count equality is a MUST) | **[CORR] Accepted.** Visible limit 6 added (§6) |
| 7 | Force/labeling precisions ×4 (low): (a) 2–5-axes bound uses lowercase *must*; (b) identity-default note is normative-table text, not [EX]; (c) preserve will-moore's hedges; (d) S2's JSON comments must not be copied into fixtures | All four verified verbatim in this stage's S1/S2/S4 captures: (a) "The length of \"axes\" **must** be between 2 and 5 and MUST be equal to the dimensionality…" — lowercase *must* on the numeric bound, RFC-2119 MUST on the equality clause; (b) "identity transformation, is the default transformation and is typically not explicitly defined" sits in the §"coordinateTransformations" table; (c) "I'm assuming that this is the centre of the pixel at `[0, 0]`" / "That seems to be what …ngff-zarr is doing"; d-v-b: "yep that's basically it for the most common types of downsampling methods"; (d) S2 contains `//` comments while §"Document conventions" says comments "MUST NOT be included in JSON objects" | **[CORR] Accepted.** Applied in §3 (force labels), §4 (hedged anchoring note), §6 (fixtures F1–F9 use comment-free JSON) |
| 8 | Choice-labeling: bigdataviewer rejection reason and napari "unit-aware" recommendation clause outran captures (choice-comment) | S10 gives only "Fiji-plugin for reading OME-Zarr."; S6's notes document units/multiscale handling only via #9411/#9495 titles, not cursor behavior | **Accepted.** §2.1 item 3 now marks the volumetric-navigation reason as uncaptured general knowledge; §2.2 clause (i) weakened to "release-note evidence of units and multiscale handling", with the B2 guarantee explicitly attributed to the prototype's own gate-layer composition |

**Preserved (unchanged, still supported):** the full 0.4 normative reading (§3 — the critique verified every consequential quote verbatim against its own byte-identical S1 capture, and this stage re-read the decisive passages); the component recommendation and tradeoff (§2.2, with the wording weakening above); the B1 refusal table; the issue→fix→test chain facts (§4, with the scoping qualification); the fixture/check skeleton; the corrections register items A1–A5 (§7). Unresolved leads L1–L5 remain open (`out/UNRESOLVED_LEADS.md`, updated).

---

## 2. Question 1 — Component precedents and minimal choice (B1, B4)

### 2.1 Bounded shortlist (METHOD: 3–4 plausible components incl. one analogy)

1. **napari v0.9.2 + ome-zarr-py v0.19.2 (reader path)** [SRC S3, S6, S10] — desktop Python viewer on Qt + vispy (S6 release body, quoted in §0); ome-zarr-py is the spec's own listed napari reader plugin (S10). Version-specific evidence: v0.9.2 ships "Add multiscale level extraction as a `LayerList` action (#9495)" and "Performance: Avoid redundant unit conversion when aggregating layer extents (#9411)" [SRC S6] — release-note evidence of multiscale and unit handling in the layer model. These notes do **not** document cursor physical-coordinate behavior; no stronger claim is made here [CORR per critique #8].
2. **vizarr 0.3.0 / Viv (@hms-dbmi/viv)** [SRC S7, S8, S10] — "minimal, purely client-side" Zarr viewer per the spec registry (S10). **Version-specific constraint [SRC]:** vizarr `main` pins `@hms-dbmi/viv ~0.19.0` (S8) while viv's latest GitHub release is `0.16.1` (S7) — the viv version delivered through vizarr's dependency graph is not identifiable from GitHub releases alone; both captures re-confirmed byte-identical this stage. Pinning this stack reproducibly requires resolving npm-side provenance (lead L2).
3. **bigdataviewer-ome-zarr** [SRC S10] — spec-listed Fiji-plugin reader. **Rejected [CHOICE].** In-case evidenced grounds: Java/Fiji runtime is the heaviest for a "small desktop prototype", and S10's one-line description gives no 2D-calibrated-readout evidence. Partially resting on **uncaptured general knowledge** (marked per critique #8): the characterization of BigDataViewer's display model as volumetric-navigation-centered is not evidenced by this case's captures.
4. **OpenSeadragon v6.1.1 — the analogy (neighboring use case: whole-slide/deep-zoom imaging)** [SRC S9]. **Retained only as an interaction-design reference; rejected as a core component [CHOICE].** What transfers [INFER]: pyramid level-selection UX for a two-level stack. What does not transfer [INFER, supported by absence of any axis/unit/label metadata-model feature in S9's release notes]: physical axis calibration, unit display, label-image association semantics — OpenSeadragon's model is pixel/viewport based. Per METHOD, the analogy does not guarantee NGFF behavior; recorded explicitly.

### 2.2 Comparison and recommendation (≥2 options, concrete tradeoff) — B4

| Criterion | (a) napari + ome-zarr-py | (b) vizarr / Viv |
|---|---|---|
| Runtime for desktop prototype | Native Python desktop app (Qt/vispy) [SRC S6] | Web component; desktop use needs an embedded webview [INFER] |
| Calibrated physical coordinates | Units/multiscale handling evidenced in release notes [SRC S6 #9411/#9495]; cursor world-coordinate behavior itself not re-verified from docs in this case [INFER, lead L4] | Not verified in captured sources [INFER: unknown; lead L1] |
| Multiscale + labels layers | Native image + labels layer types; multiscale level extraction action in v0.9.2 [SRC S6] | Multiscale viewing is the primary use case [SRC S10] |
| Version pinning risk | Releases cut from `ome/ome-zarr-py` tags (v0.19.2, 2026-09-08) [SRC S3] | **viv drift: GitHub release 0.16.1 vs vizarr pin `~0.19.0`** [SRC S7, S8] |
| Issue→fix→test transparency | Public chain verified (§4) [SRC S4, S5] | Not investigated (time-boxed) |
| Conformance coverage | Reader for 0.1–0.5-style inputs — narrowed by the B1 gate (§5 B1) | NGFF-focused; subset behaviors unverified here |

**Recommendation [CHOICE]:** napari **v0.9.2** + ome-zarr-py **v0.19.2** (reader path only), wrapped by the conformance/withholding gate of §5 B1. **Concrete tradeoff:** accept a heavier dependency chain (Qt + vispy + zarr-python) and napari-plugin version coupling in exchange for (i) release-note evidence of unit- and multiscale-aware layer handling [SRC S6 — deliberately not claimed as verified cursor behavior; the B2 guarantee is carried by this prototype's own gate-layer composition, §5 B2], (ii) exact pinned version-locatable behavior, and (iii) a public failure-history trail to design regression tests against (§4). The Viv/vizarr stack would minimize code size but shifts unverified calibration behavior and a version-provenance risk into the critical path. Bounded to the 2D/one-dataset/0.4 scope; not a claim that napari is better in general. Analogy (OpenSeadragon) retained for interaction design only; bigdataviewer rejected for runtime weight (§2.1 item 3).

---

## 3. Question 2 — What OME-NGFF 0.4 requires and permits (B1, B2, B3)

All locators: S1 = `ome/ngff` tag 0.4.1 (commit `106c3010…`), file `0.4/index.bs`, capture sha256 `5924137…` (byte-identical recapture this stage); section names as in the source. RFC 2119 keywords per S1 §"Document conventions" [SRC]. S2 = strict example [EX].

### 3.1 Axis / calibration interpretation

- **[SRC]** `axes` entries **MUST** contain `name` (unique across entries); **SHOULD** contain `type` (one of `space`/`time`/`channel`, **MAY** be custom); **SHOULD** contain `unit` from the listed UDUNITS-2 strings (space includes `micrometer`, `nanometer`; time includes `millisecond`, `second`). If part of `multiscales`, axes length **MUST** equal the array dimension count (§"axes" metadata). ⇒ *Units are optional in 0.4; absence is conformant* — the prototype cannot require them.
- **[SRC, force-precise per critique #7a]** §"multiscales" metadata: "The length of \"axes\" **must** be between 2 and 5 and MUST be equal to the dimensionality of the zarr arrays storing the image data." The numeric **2–5 bound is lowercase descriptive *must*** in the source; the equality clause is RFC-2119 MUST. The 2–3 `type:space` requirement and time/channel MAYs are RFC-2119 MUST/MAY [SRC]. Entries **MUST** be ordered time → channel/custom → space; anisotropic `zyx` **SHOULD** (§"multiscales" metadata).
- **[SRC]** Per-resolution `datasets[].coordinateTransformations`: **MUST** contain exactly one `scale`; **MAY** contain exactly one `translation`; "If `translation` is given it MUST be listed after `scale` to ensure that it is given in physical coordinates." Only `translation`/`scale` types allowed; array lengths **MUST** equal axes length (§"multiscales" metadata; types defined in §"coordinateTransformations" metadata, "applied sequentially and in order").
- **[SRC]** Scale fallback: "If scaling information is not available or applicable for one of the axes, the value MUST express the scaling factor between the current resolution and the first resolution for the given axis, defaulting to 1.0 if there is no downsampling along the axis." ⇒ per-level `scale` is a *metadata requirement*, not a guarantee the author knew absolute sizes; level-1 scale `2.0` may mean "2× coarser than level 0, absolute size unknown" [INFER] (lead L5).
- **[SRC]** A `multiscales`-level `coordinateTransformations` **MAY** exist, applies to **all** levels, same rules, "applied after them" (§"multiscales" metadata). S2 demonstrates a group-level time scale `[0.1, 1.0, 1.0, 1.0, 1.0]` [EX].
- **[SRC, label per critique #7b]** §"coordinateTransformations" table: `identity` — "identity transformation, is the default transformation and is typically not explicitly defined." This is **normative-table text [SRC]**, not a mere example; absent transforms default to identity.
- **[SRC]** `datasets[].path` values "**MUST** be ordered from largest (i.e. highest resolution) to smallest"; array names arbitrary — layout: "The name of the array is arbitrary with the ordering defined by the 'multiscales' metadata" ("often a sequence starting at 0"). S2 uses `0,1,2` [EX]; ome-zarr-py normalizes to `s0,s1,…` (S5 test docstring/patch). **[CORR]** never infer level meaning from directory names; resolve ordering and geometry only via `datasets[]`.

### 3.2 Physical cursor coordinates

- **[SRC→INFER]** Composition licensed by 0.4: per dataset `world = translation + scale × index` (translation listed after scale ⇒ physical), then multiscale-level transformations applied after; absent transforms = identity (§3.1). For level *L*, axis *a*: `world(a) = (t_L(a) + s_L(a)·i_a)` then group-level scale/translation composed in order. Display resampling is a viewer-internal quantity that must not leak into the readout [INFER].
- **[SRC, hedged working note — force preserved per critique #7c]** ome-zarr-py#403, will-moore (MEMBER) `issuecomment-2501254366`, 2024-11-26: quoting the spec's translation-after-scale MUST, then: "When mapping to physical coordinates, **I guess** the `translation` needed after scaling depends on where the 'anchor' is when you're scaling. **I'm assuming** that this is the centre of the pixel at `[0, 0]`." Deriving translations 0 / 0.5 / 1.5 / 3.5 for scales 1 / 2 / 4 / 8, i.e. `(physical-pixel-size-at-resolution-N - physical-pixel-size-at-resolution-0) / 2`, and: "**That seems** to be what https://github.com/thewtex/ngff-zarr is doing when it generates translations." The issue author (d-v-b) endorsed: "yep that's basically it **for the most common types of downsampling methods**" (`issuecomment-2501272022`). **Status: a member's working assumption endorsed by the author — not a spec requirement, not verified ome-zarr-py writer behavior.** The prototype uses this convention only in fixtures and as the default per-level translation *expectation*, never as an input assumption [CHOICE].
- **[CORR per critique #1]** Worked readout (arithmetic, not executed): F2 level 0, axes (y, x), translation [7.5, 3.25], scale [0.4, 0.65], index (y=10, x=20) ⇒ world **(11.5, 16.25)**. The frozen proposal's "(11.5, 3.65)" was arithmetically wrong and is withdrawn (§1 item 1).
- **Units display [CHOICE]:** `value + unit-string` verbatim when `unit` present; `<axis> (unitless)` when absent; no UDUNITS-2 conversion (visible limit, not silent behavior). Unequal axis scales and nonzero offsets fall out of the per-axis formula with no special casing [INFER].
- **Withheld state [CHOICE]:** if any spatial axis lacks `scale` (violating the MUST) or transforms are structurally invalid ⇒ physical readout withheld, raw-index readout shown with reason code `CALIBRATION_INVALID`.

### 3.3 Resolution switching

- **[CHOICE + SRC]** Exactly two levels by product contract: the first two entries of `datasets[]` (order largest→smallest, MUST). Switching = selecting a `datasets[]` entry and loading its `path`; every switch recomputes cursor/overlay composition from *that entry's* transforms [INFER, grounded in §4's failure history].
- **[SRC/EX]** Multiple `multiscales` entries: the spec's guidance is user choice by `name`, first as fallback (code sample at end of §"multiscales" metadata). **[CHOICE]** the prototype accepts single-entry `multiscales` only, else refuses `MULTIPLE_MULTISCALES`.
- **[CORR]** "Switch between two resolutions" is supported by the format only as *metadata selection*; nothing is promised about visual continuity (downsampling method is only a SHOULD-report `type`/`metadata` field). Switching claims "same world-coordinates window" (what per-level scale/translation preserve), never "same field of view" [INFER].

### 3.4 Image / label association — declaration vs. alignment guarantee

- **[SRC]** Association: image group may contain a `labels` group listing label paths under key `"labels"`; "Unlisted groups MAY be labels" (§"labels" metadata). Each label group carries `"image-label"` metadata; optional `source.image` **MAY** give the image group's relative path, default `"../../"` (§"image-label" metadata).
- **[SRC]** "`image-label` groups **MUST** also contain `multiscales` metadata and the two `datasets` series **MUST** have the same number of entries." ⇒ label level count must equal image level count.
- **[SRC, advisory only]** Layout note: each label dimension "**should** be either the same as the corresponding dimension of the image, or `1`" (lowercase *should*, descriptive). ⇒ **No normative alignment guarantee**: 0.4 declares association (a path) and level-count equality, but does not require equal per-level `scale`/`translation` and defines no geometric registration. **[CORR]** the thin plan's implied "a conformant label overlays correctly" is unsupported; overlay must be justified per dataset.
- **[SRC]** Label rendering metadata: `colors[]` entries **MUST** have `label-value`, `rgba` **MAY**; "All `label-value`s must be unique. Clients who choose to not throw an error should ignore all except the _last_ entry." [EX of permitted client behavior]; overlap sentinel "for example the highest integer available in the pixel range" [EX]; `properties` keys arbitrary ("Not all label values must share the same key-value pairs"); label arrays support "only integer values" (§"Images" layout) [SRC].

### 3.5 Declaration vs. guarantee (Q2 conclusion — unchanged, preserved)

0.4 *requires* per-level scale (+optional translation) metadata, axis naming/order, level ordering, label level-count equality, and *permits* units, translations, group-level transforms, label association by path. It *guarantees* none of: absolute-size correctness (relative-only factors are conformant), cross-level visual anchoring, or label/image geometric alignment. The withholding logic (§5 B3) exists because of this asymmetry.

**S2/fixture caveat [CORR per critique #7d]:** §"Document conventions" states comments "MUST NOT be included in JSON objects", yet S2 itself contains `//` comments and is not valid JSON verbatim. Fixtures F1–F9 are written comment-free.

---

## 4. Question 3 — Real issue → fix → test chain (B4), with version-shape scoping [CORR per critique #3]

**Chain: ome-zarr-py resolution-level path normalization (S3/S4/S5).**

- **Failure context:** 0.4-conformant stores may use arbitrary level names (S2 uses `0,1,2`). ome-zarr-py's write-back normalizes stored paths to `s0,s1,s2`, but before the fix it updated only `datasets[].path`, leaving `datasets[].coordinateTransformations[…].input.path` pointing at the old names — the per-level transform metadata referenced levels that no longer existed under those names. Reported in PR #652's description ("the writer only updates the `path` field in the `datasets` field, but not the `datasets > coordinateTransformations > input > path` field"), labeled `bug` [SRC S5; PR body verified by critique's capture].
- **Fix:** `ome_zarr/classes/image.py` (`to_ome_zarr`), +17/−4: per level, rewrite both the dataset `path` (`s{idx}`) and `transform.input.path`, raising `ValueError` if `transform.input is None` [SRC S5 patch, re-read this stage].
- **Test:** `tests/test_writer.py::TestWriter::test_normalize_resolution_level_paths`, +69/−1 (the −1 repoints the file's `__main__` pytest runner at the new test): builds a 3-level store at paths `0,1,2` with per-level scale `[2**level, 2**level]` and explicit `input.path`/`output.name`, writes back, then asserts `s{i}` present, `datasets[i].path == s{i}`, and `coordinateTransformations[0].input.path == s{i}` [SRC S5 patch].
- **Version shape of the verified artifacts [CORR, verified this stage]:** the test stores metadata as `zarr.open_group(…, zarr_format=3)` → `root_v3.attrs["ome"] = {"version": "0.6", "multiscales": [{"coordinateSystems": [{"name": "physical", "axes": […]}], "datasets": […]}]}` with transforms carrying `input.path`/`output.name`. **This is Zarr-v3/NGFF-0.6 metadata; no counterpart field exists in 0.4** (0.4 transforms admit only `type`/`scale`/`translation`; the fix's `transform.input` model is likewise 0.6-shaped). The chain is therefore real and correctly described *as ome-zarr-py history*, but the verified test artifact does **not** exercise 0.4 metadata.
- **What transfers to this 0.4 prototype:** (a) the PR/test-docstring demonstration that third-party stores use non-canonical level names ("Some tools write resolution levels as, for instance, 0, 1, 2 instead of s0, s1, s2") [SRC S5]; (b) the 0.4 arbitrary-name rule (§3.1) [SRC]; (c) the discipline that `datasets[i].path` and its `coordinateTransformations` form **one atomic record** [INFER]. Transfer is **by analogy**; F7 is the 0.4-shaped complement fixture and C6 mirrors the test's assertion logic on 0.4 metadata.
- **Corroborating calibration history (same class):** issue **#403** "`coordinateTransformations` generated for 0.4 are scale-only" (opened 2024-11-06; closed 2026-06-17 "completed"): scale-only transforms "will be incorrect for almost all multiscale pyramids" [SRC S4 body, per critique's capture]; the hedged per-level translation derivation is quoted in §3.2 [SRC S4 comments, this stage's capture]. **Scoping honesty (preserved + sharpened):** no dedicated closing commit/test for #403 was identified (lead L3, still open), and the test-verified member of this failure class (PR #652) is 0.6-shaped.

**Scoped engineering lesson [INFER]:** treat `datasets[i].path` + `datasets[i].coordinateTransformations` as one atomic record; any code that renames, moves, or re-levels a store must rewrite every reference inside that record; readers must resolve levels via metadata, never by directory names; and geometry consistency must be validated before use — a `"0.4"` version string proves nothing about geometry.
**Validation that follows [CHOICE, not executed]:** F7 fixture pair (`0,1` vs `s0,s1` naming ⇒ identical rendering, cursor values, overlay decisions) and metadata round-trip check C6 mirroring the PR #652 assertions on 0.4 metadata.

---

## 5. Product obligations → concrete design (B1–B4)

### B1 — Local input contract, support checks, read-only boundary

**Contract [CHOICE]:** input is a local filesystem path to one Zarr v2 group directory. **[SRC]** 0.4 mandates Zarr v2: "Arrays MUST be defined and stored … as defined by the version 2 of the Zarr specification"; metadata in group `.zattrs` (S1 §"On-disk layout"). Opened read-only; the prototype writes nothing (contrast: the S5 bug lived in the write-back path).

Version/support gate — visible refusal states, each with a reason code and one-line human explanation [CHOICE]; every "Basis" row maps to a verified MUST/SHOULD in S1:

| Check | Basis [SRC] | Failure behavior |
|---|---|---|
| `multiscales` present, exactly 1 entry | §"multiscales" | refuse `NO_MULTISCALES` / `MULTIPLE_MULTISCALES` |
| `axes` length == array ndim; exactly 2 `space` axes for this 2D scope (t/c axes, if present, fixed to first slice) | axes-length equality is MUST (§"axes"/§"multiscales"); 2-space-axis scope is this brief [CHOICE] | refuse `AXES_UNSUPPORTED` |
| `multiscales[].version` string | version is **SHOULD** ("current version is 0.4") | warn-and-continue if absent; refuse if not `"0.4"` → `VERSION_UNSUPPORTED` |
| every dataset has exactly one `scale` (+ ≤1 `translation` listed after it; only these types; lengths == axes length) | §"multiscales" MUSTs | refuse `TRANSFORM_INVALID` |
| exactly 2 entries in `datasets[]`, ordered largest→smallest | brief scope [CHOICE]; ordering MUST [SRC] | refuse `LEVEL_COUNT_UNSUPPORTED` |
| labels optional: `labels` key present? each listed label resolvable with `image-label` + `multiscales` + same dataset-entry count | §"labels"/§"image-label" MUSTs | no labels → overlay control disabled with reason "no labels group"; malformed label → overlay withheld `LABEL_INVALID` (image still shown) |

Absence of optional labels is a **normal state** [SRC — labels are optional in the layout], not an error. Unsupported input never renders partially without an explanation [CHOICE].

### B2 — Physical cursor coordinates and calibrated scale indication

- Readout per §3.2 composition: `x, y` world values at cursor + unit string per axis (`"(unitless)"` marker when `unit` absent); a fixed scale indicator showing the current level's per-axis pixel size `s_L(a) (unit)` and the level's translation when nonzero [CHOICE].
- Conditions it depends on [SRC]: units SHOULD (absence allowed); per-level `scale` MUST, `translation` MAY after scale; group-level transforms MAY, applied after per-dataset ones; identity default (§3.1, normative-table note). Fallbacks: unitless marker; `CALIBRATION_INVALID` + raw-index readout when required `scale` invalid/absent. No unit conversion; UDUNITS-2 strings verbatim [CHOICE, visible limit].
- **Corrected worked example [CORR per critique #1; arithmetic, not executed]:** F2 level 0 (axes y,x; translation [7.5, 3.25]; scale [0.4, 0.65]) at index (y=10, x=20) ⇒ world **(11.5, 16.25)**.
- The composition is implemented in the gate layer as a standalone function over `(axes, datasets[i], group-transforms)`, not taken on faith from the viewer, so it is unit-testable independently of rendering [INFER; guarantees B2 regardless of the viewer's internal cursor semantics — the recommendation's clause (i) makes no such claim, per critique #8].

### B3 — Resolution switching and optional categorical label overlay

- Switching: two-level selector = `datasets[1]` (coarse) / `datasets[0]` (fine); each switch recomputes cursor and overlay composition from that level's transforms (§4 lesson). Level names never parsed for meaning [SRC+INFER].
- Overlay pipeline on request: (1) resolve the `labels` list → candidate label groups; (2) keep those whose `image-label.source.image` (default `"../../"`) resolves to the open image group [SRC]; (3) verify label level count == image level count (MUST) else withhold `LABEL_LEVEL_MISMATCH`; (4) compare per-level `scale` **and** `translation`, label vs image ⇒ identical ⇒ overlay shown; any difference ⇒ withhold `LABEL_GEOMETRY_MISMATCH` (image still readable). This is the actionable refusal state, because 0.4 guarantees no alignment even for conformant pairs (§3.4).
- **Tolerance (defined per critique #5) [CHOICE]:** for each axis and level, parse each metadata number as a 64-bit float (JSON ints coerced; non-numeric ⇒ `TRANSFORM_INVALID`); reject NaN/inf; compare with exact `==`. Equal ⇒ equal; any inequality ⇒ withhold. Exact equality is deliberate: declared geometry is the only alignment evidence 0.4 offers.
- Sampling: categorical label rendered nearest-neighbor (label values are object identities; interpolation would fabricate categories) [CHOICE]. No registration, resampling, or transform estimation — out of scope per brief [CHOICE]. Colors from `image-label.colors` rgba when present, else default palette; duplicate `label-value`s → keep last entry (the spec's stated non-throwing client behavior) [SRC/EX].

### B4 — summary

Comparison and recommendation: §2.2. Issue→fix→test: §4 (with the version-shape scoping correction). Observed upstream behavior is separated from inference [INFER] and product choices [CHOICE] throughout, with uncaptured-general-knowledge reasons marked [CHOICE, general knowledge].

---

## 6. B5 — Revised concrete steps, discriminating validation, visible limits

**Steps (research-backed revisions of thin-plan steps 1–4):**

- **S1 — Reader + gate:** implement the B1 gate (pure metadata validation, no rendering) on zarr-python v2 groups; pin `napari==0.9.2`, `ome-zarr-py==0.19.2`. Acceptance: every refusal row reachable from a fixture.
- **S2 — Calibrated model:** implement the §3.2 world-coordinate composition as a standalone function; wire to cursor and scale indicator. Acceptance: C2.
- **S3 — Level switching:** two-entry selector bound to `datasets[]` order; cursor/overlay recompute per switch; no name-based level logic. Acceptance: C3 + C6/F7.
- **S4 — Overlay decision:** implement the B3 four-step pipeline with the two withhold reasons and the §5 B3 tolerance; nearest-neighbor rendering. Acceptance: C4.
- **S5 — Fixtures + checks:** fixture set F1–F9, all synthetic, comment-free JSON, 0.4.1-conformant except where the test *is* nonconformity.
- **S6 — Visible limits in UI:** unitless markers, withheld-overlay reason banner, refusal dialogs with reason codes, help panel stating the six limits below.

**Fixture set (discriminating; none executed):**

- **F1 canonical 2-level:** axes `y,x` (`micrometer`), scales `[0.5,0.5]`→`[1.0,1.0]`, no labels ⇒ overlay disabled with "no labels group" reason (B1).
- **F2 offset+anisotropic, per-level explicit [CORR per critique #2]:** axes `y,x` (`micrometer`). `datasets[0]`: path `"0"`, scale `[0.4, 0.65]`, translation `[7.5, 3.25]`. `datasets[1]`: path `"1"`, scale `[0.8, 1.3]`, translation `[7.7, 3.575]` — the level-1 translation applies the (s_N − s_0)/2 anchoring convention of the hedged #403 member note (0.2 in y, 0.325 in x; a fixture design choice, not a spec requirement). Expected (derived arithmetic): level-0 index (10, 20) → world (11.5, 16.25); level-1 index (5, 10) → world (11.7, 16.575) (B2/C2, C3).
- **F3 unitless:** axes without `unit` ⇒ `"(unitless)"` markers, still calibrated (B2 fallback).
- **F4 aligned labels:** label group, level count 2, per-level scale/translation exactly equal to the image's ⇒ overlay shown (B3).
- **F5 shifted labels:** label level-1 translation ≠ image's ⇒ withheld `LABEL_GEOMETRY_MISMATCH`, image still readable (B3).
- **F6 label level-count 1 vs image 2 ⇒** withheld `LABEL_LEVEL_MISMATCH` (spec MUST, B3).
- **F7 name-discrimination pair:** the same store expressed with level paths `0,1` (S2 style) vs `s0,s1` (ome-zarr-py style) ⇒ identical rendering, cursor values, overlay decisions (§4 lesson; the 0.4-shaped read-path complement to the 0.6-shaped PR #652 test).
- **F8 group-level transform, axes stated [CORR per critique #4]:** axes `t,y,x`; per-level `datasets[].coordinateTransformations` scale `[1.0, 0.5, 0.5]` on both levels; multiscales-level `coordinateTransformations` scale `[0.1, 1.0, 1.0]` (S2 pattern). Expected: y/x readout identical to the same store without the group transform (its spatial components are 1.0); the time component composes per the formula (§3.1).
- **F9 refusals:** missing `scale` on a dataset; 3 levels; 2 multiscales entries; missing axes ⇒ `TRANSFORM_INVALID`, `LEVEL_COUNT_UNSUPPORTED`, `MULTIPLE_MULTISCALES`, `AXES_UNSUPPORTED` (B1).

**Proposed checks (none executed; no receipt exists):**

- **C1** gate unit tests per B1 refusal row.
- **C2 [CORR per critique #1]** cursor composition vs hand-derived values on F2: level 0, index (y=10, x=20) ⇒ world **(11.5, 16.25)** (axis order stated: y first, x second). The prior value "(11.5, 3.65)" is withdrawn as arithmetically wrong.
- **C3 [CORR per critique #2]** switch invariance, now genuinely discriminating: (i) F2 level-1 index (5, 10) must read world **(11.7, 16.575)**; an implementation that reuses level-0's translation computes (11.5, 16.25) — the values differ, so translation-reuse is detected; (ii) the same world point (11.5, 16.25) corresponds to level-0 index (10, 20) and level-1 index (4.75, 9.75); both must map to identical world coordinates.
- **C4** overlay decision matrix over F4–F6 using the §5 B3 tolerance (now defined).
- **C5** read-only assertion [CHOICE, strengthened per critique note]: snapshot of file inventory + byte sizes (+ inodes/mtimes where available) before/after a session, over all fixtures — stricter than mtime-only watching.
- **C6** F7 pair equivalence (rendering, cursor values, overlay decisions identical across the naming pair).

**Visible limits (shown to the user and true of this design):** (1) no unit conversion — UDUNITS-2 strings verbatim; (2) physical readout is only as good as the file's declared scale — relative-only factors are conformant and undetectable (§3.1, lead L5); (3) overlay alignment is verified only as declared-geometry equality, not content registration; (4) single 2D slice; no 3D, time navigation, cloud stores, authoring, or conversion; (5) nearest-neighbor labels only; (6) **[CORR per critique #6]** differing-but-world-consistent label geometry is withheld — 0.4 permits a label multiscale with its own per-level transforms, so a label whose declared geometry differs from the image's (even if world-consistent) is refused; loosening this would require composing the label's own transforms and is deferred as out of prototype scope.

---

## 7. Corrections register (explicit)

**A. Thin-plan / upstream corrections (preserved from the frozen proposal; all remain supported):**
1. **[CORR]** switching resolutions is not sufficient for correct inspection — each level carries its own scale/translation and cursor/overlay state must be recomputed per level (S1 + S4/S5 history).
2. **[CORR]** an aligned label overlay is not generally available — 0.4 provides association and a level-count MUST but no geometric alignment guarantee; per-dataset justification + refusal state required (S1 §"image-label"/§"Images").
3. **[CORR]** level directory names are arbitrary; resolve only via `datasets[].path` (S1 layout; S2 `0,1,2`; S5 `s0,s1`).
4. **[CORR]** "two resolutions" is a product condition; the format permits 1–n levels and does not special-case two (S1; 2–5 bound lowercase *must*, §3.1).
5. **[CORR]** unitless calibration is normal, conformant input (units SHOULD-level), not corruption (S1 §"axes").

**B. Critique-driven corrections applied to the prior proposal (this stage; dispositions in §1):**
1. C2 witness value corrected to (11.5, 16.25); "(11.5, 3.65)" withdrawn (high severity).
2. F2 completed with both per-level entries and an anchor-convention level-1 translation; C3 given discriminating values (11.7, 16.575) vs (11.5, 16.25).
3. §4's chain-relevance claim qualified: the verified PR #652 test (and fix) are Zarr-v3/NGFF-0.6-shaped; 0.4 transfer is by analogy via PR body + spec rule + F7/C6.
4. F8 axes/group-scale stated so its expectation follows.
5. B3 float tolerance defined (exact 64-bit equality after finite-check/int→float coercion); C4 now testable.
6. Visible limit 6 added (differing-but-consistent label geometry withheld).
7. Normative-force precisions: 2–5 bound lowercase *must*; identity-default note is [SRC] normative-table text, not [EX]; will-moore's hedges quoted verbatim and preserved; fixtures use comment-free JSON (spec forbids JSON comments; S2 itself contains them).
8. Choice-labeling: bigdataviewer's volumetric-navigation reason marked as uncaptured general knowledge; napari recommendation clause weakened to release-note evidence, with B2's guarantee attributed to the prototype's own gate-layer composition.

---

## 8. Unresolved consequential leads

`out/UNRESOLVED_LEADS.md` (updated this stage) records L1–L5: L1 JS-stack calibrated-coordinate behavior (confined to the rejected/secondary path); L2 viv version provenance (re-confirmed real this stage by byte-identical recaptures); L3 no named fix/test artifact for ome-zarr-py#403 — strengthened by the finding that PR #652's test is 0.6-shaped, so even the path-normalization half lacks a 0.4-shaped artifact; L4 napari × ome-zarr-py integration specifics (inherently execution-dependent; resolved by running C2–C4 with the corrected expectations); L5 relative-only scale detection (inherent 0.4 format limit). None blocks the bounded component choice; all remain visibly unresolved, and no proposed test has been executed.
