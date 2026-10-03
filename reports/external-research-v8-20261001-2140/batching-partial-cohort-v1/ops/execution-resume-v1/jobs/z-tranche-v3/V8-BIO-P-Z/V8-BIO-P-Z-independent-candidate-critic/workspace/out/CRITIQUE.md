# CRITIQUE — V8-BIO-P-Z independent candidate critic (Z2)

Fresh-context critique of the frozen `inputs/PROPOSAL.md` against `inputs/BRIEF.md`, `inputs/THIN_PLAN.md`,
`inputs/METHOD.md`, and independently re-retrieved public primary sources (2026-10-02). No evaluator
feedback, prior candidate reasoning, sibling-case or campaign material was used.

**Execution status (binding).** This stage executed no arithmetic and no tests. Every numeric statement
below tagged `[review-check]` is reviewer-side paper verification of the proposal's printed values, not a
runtime result; all proposed validations remain UNEXECUTED exactly as the proposal's §9.3 states.

---

## 1. Independent source re-verification

I re-retrieved the proposal's cited sources myself. Where the host returned the identical HTTP response
body, its sha256 matches the 12-char prefix the proposal cites — confirming we audited the same bytes.

| Source (proposal locator) | Re-retrieved URL | Hash match | Content check |
|---|---|---|---|
| S1 NGFF 0.4 spec (`ca4780a33f95`) | https://ngff.openmicroscopy.org/0.4/ | ✔ `ca4780a33f95…` | Header: "Final Community Group Report, 1 October 2026" ✔. Single page (canonical `…/0.4/`) ✔. §1.3 RFC 2119 ✔. §2: arrays MUST be Zarr v2, metadata MUST be Zarr group attributes ✔. Conformance: "All of the text … is normative except sections explicitly marked as non-normative, examples, and notes" ✔. §3.4 dataset rules (largest→smallest MUST; exactly one `scale` MUST; `translation` MAY, MUST be listed after scale; vector lengths MUST equal axes length; relative-factor default 1.0; "MUST only be of type translation or scale"; multiscales-level CT MAY, "applied after them"; `version` SHOULD, "current version is 0.4") ✔ all verbatim. §3.3: "The transformations in the list are applied sequentially and in order" ✔; table contains `identity` — "identity transformation, is the default transformation" ✔. §3.6 "Unlisted groups MAY be labels" ✔. §3.7: `image-label` groups "MUST also contain `multiscales`" and "the two 'datasets' series MUST have the same number of entries" ✔; `source` MAY, `image` value MUST be a string relative path, default "../../" ✔; colors `label-value` MUST be unique, non-throwing clients SHOULD keep the last entry ✔. §2.1 label-dimensions "should be either the same … or 1" appears only as diagram commentary — correctly treated by the proposal as non-normative ✔. §7 history: "0.2.0, 2021-03-29, Change chunk dimension separator to '/'" ✔. §5 implementations list ✔. |
| S2 napari v0.9.2 release (`b762b942da36`) | https://api.github.com/repos/napari/napari/releases/tags/v0.9.2 | ✔ `b762b942da36…` | tag v0.9.2, published 2026-09-29 ✔. Notes contain "Add multiscale level extraction as a `LayerList` action (#9495)" and "Performance: Avoid redundant unit conversion when aggregating layer extents (#9411)" ✔ — but see C2 on the proposal's quoting of #9495. |
| S3 cursor.py @ v0.9.2 (`9713fd652a81`) | https://raw.githubusercontent.com/napari/napari/v0.9.2/src/napari/components/cursor.py | ✔ `9713fd652a81…` | `position : tuple of float — Position of the cursor in world coordinates.` verbatim ✔. |
| S4 PR #9065 files (`2f37973c4ff6`) | https://api.github.com/repos/napari/napari/pulls/9065/files | ✔ `2f37973c4ff6…` | Patch replaces the `downsample_factors[-1]` (coarsest-level) offset with `downsample_factors[data_level]` and `translate += (displayed_downsample - 1) / 2 * layer_scale` ✔ (exact match to PROPOSAL §4). Adds `test_3d_multiscale_half_voxel_uses_rendered_level` (+38 lines, test file `src/napari/_vispy/_tests/test_vispy_image_layer.py`) asserting rendered level-0 offset `[0,0,0]` and coarsest (factor 4) `(4−1)/2 = 1.5` ✔. Merge commit `2c7d1cf8fbbad61f…` appears in the file blob URLs ✔. Merge date 2026-06-23 / milestone 0.8.0 are *not* in this capture (see C6). |
| S5 issue #6320 (`b61597288227`) | https://api.github.com/repos/napari/napari/issues/6320 | ✔ `b61597288227…` | Title ✔; state **open** ✔; created 2023-10-09, updated 2025-07-16 ✔; quote "this effect occurs whenever `scale` is used and becomes noticeable when scale values approach the same order of magnitude as dimensions of a layer" verbatim ✔; reproducer toggles 2D/3D on multiscale labels ✔; body confirms 2D shows highest, 3D lowest resolution ✔ (supports the "single-level display masks the bug" inference). |
| S6 merged-PR search (`20c7f497d426`) | (search page; I verified the two named PRs directly) | n/a | PR #9142 "Use level-0 extent for multiscale bounding box overlay": merged 2026-07-07 ✔, body "always compute bounds from level-0 extent rather than the currently-displayed data level", with an updated bounding-box test ✔. PR #9495 corroborated only via the v0.9.2 release note (inclusion in 0.9.2) ✔; its own merge date (2026-09-25) not independently re-verified (see C6). |
| S7 npm itk-vtk-viewer latest (`2f25c6723603`) | https://registry.npmjs.org/itk-vtk-viewer/latest | ✔ `2f25c6723603…` | `"version": "14.51.0"` ✔; `_npmOperationalInternal.tmp` embeds epoch 1719004544204 = 2024-06-21 ✔, matching the proposal's publish-metadata date. Repository: `github.com/kitware/itk-vtk-viewer` ✔. |
| S8 README @ master (`4387d35e510d`) | (not re-retrieved; low-stakes: browsers/Node support table) | — | Unverified this stage; not load-bearing for any proposition. |
| S9 index.d.ts @ v14.51.0 (`51d71e0614a0`) | https://raw.githubusercontent.com/kitware/itk-vtk-viewer/v14.51.0/src/index.d.ts | ✔ `51d71e0614a0…` | Full file (1,141 bytes) inspected: `ViewerOptions.image?`, `ViewerOptions.labelImage?`, `LoadableImage = URL \| Image \| Store \| ndarray` ✔; **no** axis/unit/spacing/NGFF-metadata surface anywhere in the file ✔ — the proposal's "no calibration API" claim is exact, not merely absence-of-evidence. |
| S10 PR #391 search (`f3f203d86249`) | (not re-retrieved) | — | Zarr-store support merged 2021-03-09 not independently re-verified; supporting only. |

Conclusion: the proposal's cited capture hashes and its verbatim quotes are faithful; the normative-force
assignments (MUST/SHOULD/MAY) in PROPOSAL §3 match the spec text I read. The corrections below are
refinements, not undermining findings.

---

## 2. Assessment of the three research questions

**RQ1 (two components, version-specific precedents) — adequately answered.** napari v0.9.2 and
itk-vtk-viewer 14.51.0 both exist at the cited locators; the version-specific behaviors quoted (world-
coordinate cursor [SRC, S3]; #9411 unit-conversion note and #9495 multiscale extraction in the 0.9.2
notes [SRC, S2]; itk-vtk-viewer's `LoadableImage`/`labelImage` surface and absence of any calibration API
[SRC, S9]) are verified. The heavy-stack cost of napari is fairly labeled `[INF]` and the recommendation is
explicitly `[CHOICE]` with a concrete tradeoff and a flip condition (embeddable web mandate) — meets B4a.

**RQ2 (format requires/permits; declaration vs guarantee) — adequately answered.** The per-level mapping
`phys = t_i + s_i·idx` with multiscales-level transforms applied after is grounded in verified §3.4 text;
the proposal correctly does NOT claim an alignment guarantee from the format (equal level **count** is the
only label-side MUST, §3.7; `source` is MAY). The unit fallback (axes `unit` is SHOULD-level, §3.1) is
correctly carried into B2's withheld states. One formula defect in the inverse mapping — C1 below — and
one locator misattribution — C3 below.

**RQ3 (real issue → fix → test) — adequately answered, verified end-to-end.** #6320 (open, center-vs-corner
multiscale shift) → #9065 (fix uses the rendered level's factors, maps data offset through layer scale)
→ in-PR regression test with printed numbers. All three legs verified at the cited captures. The scoped
lesson ("level-indexed quantities must be computed from the rendered level") is legitimate `[INF]`, and the
#9142 corroboration (mirror-image error, also test-updated) is real.

---

## 3. Assessment of the five brief obligations

| Obligation | Status | Evidence |
|---|---|---|
| B1 input contract, version/support checks, read-only | Met, with C3 correction | PROPOSAL §5: Zarr-v2 group check (§2 MUST verified), per-dataset transform checks (§3.4 MUSTs verified), `W-VERSION` on SHOULD-level version, `E-*` refusal states, absent-label behavior, read-only boundary with T4. `E-AXES` trigger needs the §3.4 locator and a conformant-input decision (C3). |
| B2 physical cursor + calibrated display | Met, with C1 correction | §6 definition, per-axis units, unitless fallback, relative-only fallback; substrate verified (S3 world coordinates; S2 units-aware extents note). Inverse formula wrong when a multiscales-level transform exists (C1). |
| B3 resolution switching + optional label overlay with justified assumptions and refusal states | Met | §7: association gate (§3.7 MAY `source`, default "../../" — verified), conformance gate on the verified §3.7 equal-count MUST, covership check `[CHOICE]`, nearest-neighbor sampling, declared voxel-center convention, named `R-*` states. Locator nit C4. |
| B4 two implementations compared, one bounded recommendation, real issue→fix→test chain | Met | §2 comparison with pinned versions and tradeoff; §4 chain verified above. Quote-hygiene correction C2. |
| B5 revised concrete steps, discriminating validation, visible limits, unresolved leads, no execution claims | Met | §9 steps 1–5, T1–T5 all marked UNEXECUTED; §9.3 binding no-execution statement; §10 leads are genuinely consequential (unit-formatting API, web-variant probe, center-vs-corner, compressor matrix). The proposal nowhere claims a runtime pass — correct per METHOD. |

All three questions and all five obligations survive into the proposal; no obligation is missing. The
remaining corrections below should be applied in the final correction stage but none invalidates a
proposition.

---

## 4. Witness W — values, arithmetic, and discrimination (`[review-check]`, no execution)

**Fixture arithmetic (paper check of the proposal's printed values):**
- A (spec mapping): `idx = ((30−10)/2, (15−5)/2) = (10, 5)` ✔; level-0 `((30−10)/1, (15−5)/1) = (20, 10)` ✔;
  centers: level-1 `(10·2+10, 5·2+5) = (30, 15)`, level-0 `(20·1+10, 10·1+5) = (30, 15)` — the printed
  consistency holds ✔.
- B (translation-as-index-space): inverse `idx = (30/2−10, 15/2−5) = (5, 2.5)` ✔; that voxel's center under
  the spec mapping is `(5·2+10, 2.5·2+5) = (20, 10)` µm → displacement (−10, −5) µm ✔ as printed.
- C (level-0 scale reused at level 1): `idx = ((30−10)/1, (15−5)/1) = (20, 10)` ✔; center
  `(20·2+10, 10·2+5) = (50, 25)` µm → displacement (+20, +10) µm ✔; `(20,10)` is in-bounds for shape
  (32,32), so the failure is silent ✔ — faithful to the #9065 failure class.
- Content discrimination: with level-1 defined as the 2×2 block mean, `L1[10,5] ← L0[20:22,10:12] = 8`,
  `L1[5,2] ← L0[10:12,4:6] = 3`, `L1[20,10] ← L0[40:42,20:22] = 5`; the three blocks are disjoint and the
  three probe outcomes (8/3/5) are distinct, so the fixture does discriminate the three interpretations ✔.

**W1 `[CORRECTION]` — case B's assertion depends on an unstated rounding rule.** B's `idx_x = 2.5`; the
proposed assertion `value(L1[5,2]) == 3` holds only for floor (or round-half-even). Round-half-up selects
`L1[5,3] ← L0[10:12,6:8]`, a block the fixture never assigns, so the probe outcome would be an
unspecified value rather than 3. Fix: pin floor in the assertion, or weaken it to `≠ 8 and ≠ 5` (which is
the discriminating content anyway), or define `L0[10:12,6:8]`.

**W2 `[CORRECTION]` — the cross-level "✔ consistent" claim is convention-relative.** It holds under the
declared affine + voxel-center convention. With level-1 defined as the 2×2 block mean, the affine image of
an L1 voxel center coincides with the *corner* (L0 index 20) of its source block, not the block's sampled
center (20.5) — precisely the center-vs-corner ambiguity that is open upstream (#6320, S5) and declared as
lead 3. The proposal declares its convention (PROPOSAL §7.3), so this is not an error, but the witness
must not be cited as evidence of physical registration across levels; T3e can only test self-consistency
of the declared convention.

**W3 — discrimination adequacy: met.** The witness separates the spec mapping from both named failure
modes with distinct, disjoint fixture content, and case C reproduces the silent in-bounds character of the
upstream bug. The B/C shifts (10/5 µm and 20/10 µm) are correctly computed.

**W4 — note.** The fixture contains no multiscales-level `coordinateTransformations`, so W does not exercise
the `(S, T)` term of PROPOSAL §6's mapping — the same term whose inverse is wrong per C1. If the final
proposal keeps the general `(S, T)` mapping, add a W-variant with a multiscales-level scale (e.g. `S = 2`)
or state that the contract refuses multiscales-level transforms.

---

## 5. Cited corrections and counterexamples

**C1 `[CORRECTION]` (consequential, B2) — inverse cursor formula is wrong when a multiscales-level
transform exists.** PROPOSAL §6 prints the probe inverse as `idx = (phys − T − t_i) / s_i`. The forward
mapping is `phys = T + S·(t_i + s_i·idx)` (correct per §3.4 "applied after them"); its inverse is
`idx = ((phys − T)/S − t_i) / s_i` element-wise. Counterexample: multiscales-level `scale = 2`, `T = 0`,
`t_i = 10`, `s_i = 1`, probe `phys = 30` → forward gives `idx = 5`; the printed inverse gives
`(30 − 0 − 10)/1 = 20`. The proposal's own contract (§5.1) accepts a first multiscales entry that may carry
a multiscales-level CT (MAY, §3.4), so this path is reachable. Fix the formula or have the contract refuse
a multiscales-level CT with a named state.

**C2 `[CORRECTION]` (citation hygiene, B4/RQ1) — #9495 quote is not verbatim at its cited locator.** S2's
v0.9.2 release note reads "Add multiscale level extraction as a `LayerList` action (#9495)". PROPOSAL §2
quotes "…`LayerList` action … with `scale` and `translate` corrections" — the tail is not in S2 and was not
shown at any S6 locator. Keep the verbatim release-note text and move "scale/translate corrections" to
paraphrase, or add the #9495 PR locator.

**C3 `[CORRECTION]` (normative-force locator, B1) — the "type: space" MUST is §3.4's, not §3.1's.**
PROPOSAL §5 item 3 attaches "(§3.1 MUST)" to a bullet requiring "both `type: "space"`". Verified text: §3.1
makes `type` SHOULD-level ("SHOULD contain the field 'type'. It SHOULD be one of 'space', 'time' or
'channel', but MAY take other string values for custom axis types") and `unit` SHOULD-level; §3.1's only
MUSTs are `name` presence and uniqueness. The strict requirement "The 'axes' MUST contain 2 or 3 entries of
'type:space'" sits in §3.4 (multiscales context). Counterexample: a 2D store with
`axes: [{"name": "y"}, {"name": "x"}]` (no `type`, no `unit`) satisfies every §3.1 MUST; if `E-AXES` fires
on a missing `type` field, the prototype refuses a plausibly conformant input. Decide explicitly: accept
absent `type` as space (with a notice), or keep the strict gate citing §3.4 and label it a documented
contract narrowing; also note §3.4's own "MAY contain one additional entry of … a null / custom type"
tension. `unit` absence is already handled by the B2 fallback — no change needed there.

**C4 `[CORRECTION]` (locator precision, B3) — the per-dataset axis-aligned guarantee is §3.4's.** §7 item 2
grounds "the label's mapping to be axis-aligned scale/translation" in "§3.3's allowed types". §3.3 is the
general transformation vocabulary and also admits `identity`; the dataset-level restriction "The
transformation MUST only be of type `translation` or `scale`" is §3.4 text. Cite §3.4 (conclusion
unchanged — `identity` is trivially axis-aligned).

**C5 (labeling nit, RQ2) — "Non-normative color/properties detail" mislabels normative text.** The §3.7
`colors`/`properties` sentences the proposal cites carry MUST/SHOULD force (verified: "All the values under
the `label-value` key MUST be unique. Clients who choose to not throw an error SHOULD ignore all except the
_last_ entry."). They are irrelevant-to-prototype, not non-normative; likewise the unit enumeration is
"SHOULD be one of the following strings … valid units according to UDUNITS-2" — a closed list, so a valid
UDUNITS-2 string outside it (e.g. "µm") is not covered by the SHOULD. B2 should state its behavior for
out-of-enumeration unit strings.

**C6 (unverified-at-cited-locator; not contradicted) — PR metadata.** #9065's merge date (2026-06-23) and
milestone 0.8.0, and #9495's merge date (2026-09-25), are not evidenced in the captures I re-retrieved
(the #9065 files capture evidences only merge commit `2c7d1cf8…`; the v0.9.2 release evidences #9495's
inclusion, not its merge date). Add the PR-detail locators in the final stage or mark these fields
as from the PR pages. S8 (README) and S10 (PR #391) were not re-verified this stage; neither is
load-bearing.

**C7 (confirmations, for the record).** Verified correct and correctly force-labeled: the §3.4
largest→smallest ordering MUST; exactly-one-scale MUST; translation-after-scale MUST; relative-factor
default-1.0 exception (verbatim); vector-length MUSTs; `version` SHOULD; "applied sequentially and in
order"; multiscales-level CT "applied after them"; §3.6 "Unlisted groups MAY be labels"; §3.7 equal-count
MUST and `source`/`"../../"` default; §2.1 label-dimensions remark as non-normative diagram commentary;
identity-as-default (§3.3 table); §7 dimension-separator history; #9065 patch and test numbers
(`(4−1)/2 = 1.5`); #6320 open state and verbatim trigger quote; #9142 title/date/level-0-extent fix;
napari 0.9.2 publication date; #9411 note; itk-vtk-viewer 14.51.0 and 2024-06-21 publish metadata; the
complete absence of any calibration surface in v14.51.0's `index.d.ts`. The three `[CORRECTION]`s the
proposal itself records (unversioned component choice rejected; "format guarantees label alignment"
rejected; "level switching is display-only" rejected) are each supported by the verified sources.

---

## 6. Unresolved obligations / leads (explicit)

None of B1–B5 is missing. Remaining open items, all already declared by the proposal and confirmed
consequential but non-blocking here: (i) C1 must be fixed before implementation; (ii) the napari v0.9.2
unit-formatting API for the B2 readout string is uncaptured (lead 1) — B2's display string is therefore a
`[CHOICE]` pending that pin; (iii) the voxel center-vs-corner convention is open upstream (lead 3), so all
overlay-registration claims hold only under the declared convention (reinforced by W2); (iv) the Zarr v2
compressor matrix is unpinned (lead 4); (v) itk-vtk-viewer's calibration surface is unprobed pending any
product flip (lead 2). All proposed tests T1–T5 and witness W remain UNEXECUTED; no pass may be claimed
for them in this stage, and none is claimed here.

## 7. Verdict

The frozen proposal is source-faithful at every locator I could re-retrieve (7/10 capture hashes matched
exactly; the 3 others were supporting or unverifiable, none contradicted), its normative-force assignments
are overwhelmingly correct, its issue→fix→test chain is genuine and verified, and its witness discriminates
the stated interpretations. Apply C1 (inverse formula), C3 (E-AXES locator/decision), C2 (quote hygiene),
C4–C5 (locators/labels), and the W1/W4 witness hardening in the final correction stage.
