# CRITIQUE — V8-BIO-AMEND-T-L independent candidate flash critique

Fresh-context candidate critique of the frozen `inputs/PROPOSAL.md` (sha256 `0294200a…`) against `inputs/BRIEF.md`, `inputs/THIN_PLAN.md`, `inputs/METHOD.md`, `inputs/UNRESOLVED_LEADS.md`, and independently re-retrieved public sources. This is **not** evaluator feedback and **not** a replacement proposal. No test, fixture, or script was executed in this stage; all arithmetic below is hand derivation. Per METHOD.md, the critique is organized around the **three highest-consequence warranted amendments**, followed by additional consequential notes and per-question/per-obligation verdicts.

## 0. Verification method and provenance

All sources below were re-fetched 2026-10-03 by this case's admitted public-capture tool and inspected directly (spec page read in full across all 163,120 bytes; diffs and API JSON read in full). Capture sha256 correspondence with the proposal's §1 register:

| Proposal source | Proposal capture sha256 (prefix) | Independent re-fetch result |
|---|---|---|
| S1 NGFF 0.4 page | `ca4780a3` | **Exact byte match** (`ca4780a3…`, 163,120 B) |
| S2 ome-zarr-py #403 | `2a813b45` | **Exact byte match** (`2a813b45…`, via issues API) |
| S3 PR #590 | `7598661a` (files page) | Content verified via `.diff` (`f0aa7ce9…`) **and** pulls API (`2b797ae5…`); all locator claims confirmed (below) |
| S4 vizarr PR #261 | `aa41af49` (files page) | Content verified via `.diff` (`22066be8…`) **and** pulls API (`2b72f725…`) |
| S5 vizarr #271/#297 | `cdcd7203` (search capture) | Verified individually via issues API (`038a3d5c…`, `8ce524d0…`) |
| S6 vizarr package.json | `bddde203` | **Exact byte match** (`bddde203…`) |
| S7 napari-ome-zarr v0.10.0 release | `4ba4287c` | **Exact byte match** (`4ba4287c…`, via releases API) |
| S8 v0.10.0 `ome_zarr_reader.py` | `255ca2c5` | **Exact byte match** (`255ca2c5…`) |

New captures introduced by this critique (independently retrieved, locators given inline): PR #590 API record (`2b797ae5…`), PR #261 API record (`2b72f725…`), ome-zarr-py releases list (`585da153…`, 3 latest; `2c359864…`, 10 latest).

**Headline verdict**: the proposal's source basis is sound. Every checked spec claim in §3 reproduces the S1 text at the claimed normative force; the Q3 chain (issue → fix → test) is fully confirmed at cited locators; F2/F3 fixture arithmetic checks out by hand. Three warranted corrections follow; none overturns the recommendation (napari + own strict-0.4 calibration layer), but two fix factual misdescriptions of cited reader code and one closes the proposal's own top unresolved lead.

---

## Amendment 1 (highest consequence) — §2, Component B bullet: label layers do **not** receive the parent image's transforms in the plain 0.4 read path

**Affected passage (PROPOSAL.md §2, Component B, second bullet, second sub-item)**:
> "Discovers labels via the image's `labels` group (`labels` list → `image-label` groups that must also be multiscales) and gives each label layer the **parent image transforms** ("Label inherits parent transforms … to transform it to same space as parent image")."

**Why it is wrong [SRC S8, capture `255ca2c5…`, napari-ome-zarr v0.10.0 `napari_ome_zarr/ome_zarr_reader.py`]**: the quoted comment is real, but the mechanism it labels inherits only `self.parent_transforms`:

- `Multiscales.children()`: `for transf in self.parent_transforms: label_image.add_parent_transform(transf, ch_axis)`.
- `Spec.__init__` initializes `self.parent_transforms: List[...] = []`, and the **only** code path that populates it is `Scene.iter_nodes()` (`ms_image.parent_transforms = trans_list`), i.e. the v0.6-style `scene` coordinate-system graph. `Scene.matches` requires a `"scene"` key.
- For a plain 0.4 store (the brief's input), `parent_transforms` is empty, so the label layer's affine comes from `Label.metadata()` → `Multiscales.metadata()` → the **label's own** `multiscales[0].datasets[0].coordinateTransformations[0]` (first entry only).

The proposal's sentence therefore attributes to the reader an image→label transform inheritance that does not occur for this input class. The discovery half of the sentence (labels list → `image-label` groups that must also be multiscales) is correct and matches `Label.matches` and S1 §3.7.

**Concrete replacement**:
> "Discovers labels via the image's `labels` group (`labels` list → `image-label` groups that must also be multiscales) and builds each label layer's affine from the **label's own** `multiscales[0].datasets[0].coordinateTransformations[0]`. The source comment 'Label inherits parent transforms … to transform it to same space as parent image' applies only to `parent_transforms`, which are populated solely by the `Scene` (v0.6-style coordinate-system graph) reader path and are empty for plain 0.4 stores — nothing in the v0.10.0 plain-0.4 path copies the parent image's dataset transforms onto the label."

**Discriminating check**: extend F4 with a mis-declared-label variant (label's own scale `1.0,1.0` vs image `0.5,0.5`, everything else conformant). Under the corrected mechanism the label renders at the wrong physical scale unless the prototype compares **each pyramid's own transforms** — which is exactly S5's per-level bbox comparison. The check flips: the proposal's current wording predicts reader-side inheritance (overlay looks aligned); the code predicts misalignment. This strengthens S5's design; the correction is to the description, not the design.

**Consequence**: B3 justification text and the F4 interpretation; prevents the correction stage from claiming the reader precedent "handles" image/label alignment.

---

## Amendment 2 — §8/UNRESOLVED_LEADS U1: the fix **is released** — ome-zarr-py v0.18.0 (2026-06-17) contains PR #590

**Affected passages**: PROPOSAL.md §8 (handoff) and `inputs/UNRESOLVED_LEADS.md` item 1:
> "PR #590 … is verified only at commit `db3d40e8…` … No release containing it was identified. Lead: pin the commit or identify the first release…"

**Why it is now closable [SRC, ome-zarr-py releases API capture `2c359864…`]**: release **v0.18.0**, `published_at 2026-06-17T16:21:34Z` (26 minutes after the PR merge at 15:55:02Z), body lists "* Include translations in multiscales by @will-moore in https://github.com/ome/ome-zarr-py/pull/590". The PR API record (`2b797ae5…`) additionally confirms: `merged_at 2026-06-17T15:55:02Z`, head `db3d40e8f4596e39a38cabb355f871aa29bce3e2`, 3 changed files, and body "**Fixes #403**" — making the issue→fix linkage explicit upstream, not just inferred from titles. Later releases (v0.19.0 2026-09-02, v0.19.1, v0.19.2) do not list #590 because it predates their changelog window (v0.18.0…v0.19.0 diff base).

**Concrete replacement**: U1 changes from "unresolved" to **resolved with a pin**: implementation targets `ome-zarr-py >= 0.18.0` (first release with per-level scale+translation generation); §4's "pre-fix style" fixture (F3 variant A) is thereby anchored to `< 0.18.0` writer behavior. The commit pin remains valid as an exact-locator citation, but is no longer the only supported reference.

**Discriminating check**: a reader-side fixture written by `ome-zarr-py` 0.17.0 vs 0.18.0 must differ exactly in the presence of the `translation` entry per dataset (assert `len(cts) == 1` vs `== 2` at the metadata level — mirroring the upstream test delta verified in the S3 diff). Not executed here; proposed only.

**Consequence**: B4 chain completeness (issue → fix → test → **release**), and it retires the proposal's own implementation-freeze precondition.

---

## Amendment 3 — §7 S2 (B1): no defined behavior for more than one entry in `multiscales`, which S1 §3.4 explicitly contemplates

**Affected passage (PROPOSAL.md §7, step S2)**:
> "**S2 Contract validation (B1)**: accept exactly: one image group with `multiscales[0]` having `version` `"0.4"` … `datasets` of length exactly 2 …"

**Why it is a gap [SRC S1, capture `ca4780a3…`, §3.4]**: the 0.4 text treats `multiscales` as a **list** and prescribes default behavior for multiples: "If only one multiscale is provided, use it. Otherwise, the user can choose by name, using the first multiscale as a fallback." A conformant input may therefore carry `len(multiscales) > 1` (the spec's own Python example selects by name `"3D"` with first-entry fallback). S2 silently reads index 0 and never states this — a silent choice for a spec-legal input, in tension with the proposal's own "unsupported input ⇒ single clear state" and the brief's B1 "behavior for … unsupported input".

**Concrete replacement (add to S2)** [CHOICE, consistent with S1 §3.4 fallback guidance]:
> "If `multiscales` has more than one entry: render entry 0 and show a persistent status note `N multiscales entries present; using the first (0.4 fallback)`. Do not treat multiple entries as unsupported."

**Discriminating check (new fixture F9)**: image group with two multiscales entries (first: the 2-level 2D yx image; second: a differently named entry). Expect: normal render + visible fallback note; rejection would be wrong, silence would be wrong. None of F1–F8 covers this.

**Consequence**: B1 completeness against a spec-legal input class; closes the only silent-behavior hole found in the contract.

---

## Additional consequential notes (explicitly appended per METHOD.md; below amendment rank)

1. **§2 vizarr gloss imprecision + napari entry-[0]-only mechanism [SRC S4 diff `22066be8…`, S8]**. The vizarr bullet's gloss "i.e. one transform per layer, not per level" is loose: `coordinateTransformationsToMatrix()` iterates the **entire** `multiscales[0].datasets[0].coordinateTransformations` list ("Apply each transformation sequentially and in order…" comment verified verbatim), so the first dataset's scale **and** translation are composed; it is the other levels' transforms that are ignored. By contrast, napari-ome-zarr v0.10.0 appends only `ds_transforms[0]` — for a PR #590-style `[scale, translation]` list the translation entry is **dropped even for dataset 0** (harmless there, since PR #590 yields t₀ = s₀/2 − s₀/2 = 0, but lossy for arbitrary nonzero t₀ as in F2). §4's reader-side lesson ("cannot honor per-level translations") remains true; the correction stage should state the two mechanisms distinctly.
2. **vizarr PR #261 introduces an apparent vertical-fit typo [SRC S4 diff `22066be8…`, `src/utils.ts`]**: `fitImageToViewport` computes the vertical fit as `availableHeight / (maxY - minX)` — `minX` where `minY` is expected. Relevant to non-square fit (cf. S5 #288) and adds a concrete code-level datum to the case against embedding vizarr. Static code reading only; no runtime execution claimed.
3. **F3 hand-check passes; two wording precisions [INFER; hand derivation, nothing executed]**. Verified: t₁ = s₁/2 − s₀/2 = 0.25 µm; level-1 center index (250,250) → 1.0·250 + 0.25 = 250.25 µm; center-bbox inset = (s₁ − s₀)/2 = 0.25 µm per side (L0 centers span [0, 499.5]; L1-B centers [0.25, 499.25]); marker L0 (501,300) → (250.5, 150.0) µm → L1-B continuous (250.25, 149.75), floored (250,149). Precisions: (a) 250.25 µm is a **block center** in continuous coordinates (level-0 index 500.5), not a level-0 pixel-center value, so "equals level0 physical point" holds only continuously; (b) variant A's marker displacement is 0.25 coarse px (= 0.5 fine px), or one coarse pixel in the floored y-index and zero in x — "one-half-to-one coarse pixel off" overstates/misstates. F3 does discriminate A vs B (cursor at (250,250) reads 250.0 vs 250.25; insets 0/0.5 vs 0.25/0.25).
4. **PR #590 formula bases differ across the diff [SRC S3 diff `f0aa7ce9…`]**: `format.py` uses relative scales (`scale0 = [1.0] * len(data_shape)`, so translation = s/2 − 0.5), while `classes/image.py` and `tests/test_writer.py` use physical level-0 scales (`scale0 = TRANSFORMATIONS[0][0]["scale"]`). Same formula, different basis; worth a one-line footnote so F3's derivation states which basis it assumes (physical).
5. **Conformance nuance supporting U4 [SRC S1 `ca4780a3…`, Conformance section]**: the page states RFC-2119 words "do not appear in all uppercase letters in this specification" — so lowercase "should" alone cannot establish informality. U4's classification of the §2.1 label-dimension note ("should be either the same as the corresponding dimension of the image, or 1") as illustrative is nonetheless correct, because the note sits inside the §2.1 ASCII layout illustration, which the page frames as an example layout ("The following layout describes the expected Zarr hierarchy… For this example we assume…"). The correction stage should keep the placement argument, not a case-based one. All other checked spec claims reproduced verbatim at claimed force, including: §2 Zarr-v2 storage MUST; §3.1 name MUST / type-unit SHOULD / custom-type MAY / axes-length MUST; §3.3 "applied sequentially and in order"; §3.4 2–5 axes, 2–3 space MUST, time→channel/custom→space ordering MUST, `zyx` SHOULD, largest→smallest MUST, exactly-one-scale MUST with level-relative default 1.0, translation-after-scale MUST, lengths MUST, multiscales-level transforms "applied after" (MAY); §3.5 omero optional with channels/color/window MUSTs; §3.6 "Unlisted groups MAY be labels"; §3.7 same-dataset-count MUST, colors SHOULD with unique-integer `label-value` MUST and last-entry SHOULD, properties MAY, `source.image` relative-path MUST with `"../../"` default, version SHOULD; §5 "purely client-side" vizarr and ome-zarr-py as "A napari plugin for reading ome-zarr files"; §7 history 0.4.0 2022-02-08 / 0.4.1 2022-09-26; header "This is the 0.4 release of this specification" and "1 October 2026" date.
6. **Verified upstream process facts**: issue #403 created 2024-11-06T14:04:14Z, closed 2026-06-17T15:55:03Z (state completed), citing `format.py#L260-L271` at `56f72b0` — all exact; PR #261 merged 2025-03-06T17:05:28Z, 9 changed files, **no test files** — exact; issues #271 (open, 2025-04-03, "Previously … ignored", labels-scaling note) and #297 (closed 2025-09-03, `isOmeMultiscales` omero-gating) — exact; S6 deps (viv ~0.19.0, zarrita ~0.6.0, deck.gl ~9.1.0, vitest run, version 0.3.0) — exact; S8 `# zarr v3` header, datasets[0]-only affine, units-forwarding comment incl. "Inconsistent units across layers" warning quote, axis-labels/units forwarding (PR #149 v0.10.0, published 2026-08-12) — exact. The proposal's U3 remains correctly open (my PR #261 capture shows `isOmeMultiscales` still required `"omero" in attrs` at that merge, consistent with the later #297 fix whose released state is still unverified).

## Assessment of the three questions and five obligations (against the actual proposal)

- **Q1 (two components, version-specific)**: PASS with Amendments 1–2 precision fixes. Both components verified at cited versions; comparison and [CHOICE] recommendation with concrete tradeoff are properly labeled.
- **Q2 (format requires/permits)**: PASS. All normative-force claims verified against S1; "declaration ≠ alignment guarantee" is correctly labeled [INFER] and is supported — 0.4 has no orientation/registration metadata (checked: none in §2–§3.7).
- **Q3 (issue → fix → test)**: PASS, strengthened: chain verified end-to-end including test deltas (`len(cts) == 1` → `== 2` in four test sites plus formula additions in four more) and now the release (Amendment 2).
- **B1**: PASS with Amendment 3 gap (multiscales > 1); contract, version checks, read-only boundary, unsupported states otherwise concrete and MUST-anchored.
- **B2**: PASS. Units SHOULD/absent fallback consistent with §3.1; napari unit-consistency condition quoted verbatim from S8; p = s·i + t clearly [INFER] following §3.3/§3.4 order semantics.
- **B3**: PASS with Amendment 1 correction (description only); MUST same-dataset-count precondition verified; refusal states and nearest-neighbor sampling are explicit [CHOICE].
- **B4**: PASS. Observed upstream vs inference vs choice are separated; the two §2 corrections above are the only misattributions found.
- **B5**: PASS. Steps cover B1–B4 with visible limits; F1–F8 are discriminating as claimed (F3 pair flips the assertion; F2 offsets and ratio consistent; F5/F7/F8 name violated rules correctly); "nothing executed" is stated and respected. Proposed F9 (Amendment 3) and the F4 mis-declared-label variant (Amendment 1) extend coverage.

**Unresolved obligations remaining (unchanged or narrowed)**: U2 (napari per-level limitation is inferred, not napari-docs-verified), U3 (vizarr released-artifact state of the #297 fix), U4 (validator behavior on the §2.1 note), U5 (Zarr v2 store through zarr-python v3 conformance fixture), U6 (vizarr #271 resolution if `coordinateTransformationsToMatrix` is ever reused — now also covering note 2's fit typo), U7 (mixed-unit scale bar). U1 is closed by Amendment 2. No evaluator, sibling, or prior-reasoning content was used; no execution receipts exist for anything in this file.
