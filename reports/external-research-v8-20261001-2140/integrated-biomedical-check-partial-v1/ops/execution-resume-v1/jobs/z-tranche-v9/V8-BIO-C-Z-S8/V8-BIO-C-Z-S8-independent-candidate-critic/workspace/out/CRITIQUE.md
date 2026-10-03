# Independent candidate critique — V8-BIO-C-Z-S8 (`inputs/PROPOSAL.md`, frozen)

Fresh-context candidate-family critique, 2026-10-03. Not evaluator feedback. All sources below were
independently retrieved by this critique from permitted public endpoints and checked at the cited
version/locator. Spec capture: https://ngff.openmicroscopy.org/0.4/ (sha256 `ca4780a3…`, 2026-10-03).
GitHub checks via api.github.com for ome/ome-zarr-py (#403, #590+files, #652, releases),
napari/napari (#6633+files, #8814+comments, release v0.9.2), hms-dbmi/vizarr (#261, #271, #297,
#298+files, #299, tags). No evaluator material, sibling cases, or prior candidate reasoning used.

## Verdict

The proposal is substantially sound. Every consequential [SPEC] and [OBS] claim I checked reproduces
against its cited source, including all quoted strings, dates, merge commits, file lists, and the
PR #590 translation formula. All three research questions and all five obligations (B1–B5) are
present with real content, and B5 correctly disclaims execution. I found **one substantive gap**
(unstated interpretation of the 0.4 relative-vs-absolute scale convention, untested by any fixture),
**three factual/attribution corrections**, and **several internal inconsistencies in the §3.3/§3.5
examples and F1/F9 fixture wording** that the final correction stage should fix. None of these
invalidate the recommendation or the issue→fix→test chains.

## Q1 — component precedents (§2): verified, recommendation survives

Confirmed against captures: the 0.4 spec §5 lists exactly "ome-zarr-py — A napari plugin for reading
ome-zarr files.[verbatim excerpt omitted; original artifact/source locator retained]vizarr — A minimal, purely client-side program for viewing Zarr-based images
with Viv & ImJoy." Version-specific behaviors all check out:

- ome-zarr-py #403: title, opened 2024-11-06, closed 2026-06-17, quoted text, and the
  `format.py#L260-L271` link at commit `56f72b0…` — all exact.
- PR #590: merged 2026-06-17; exactly 3 files (`ome_zarr/format.py`, `ome_zarr/classes/image.py`,
  `tests/test_writer.py`); translation formula is literally `s / 2 - s0 / 2` per axis vs level 0,
  as quoted; the diff updates exactly the eight named test functions; shipped in v0.18.0
  (2026-06-17) whose notes say [verbatim excerpt omitted; original artifact/source locator retained].
- PR #652 (v0.19.2, 2026-09-08): body confirms levels named `0,1,2` vs `s0,s1,s2` and that the
  writer updated `datasets.path` but not `datasets > coordinateTransformations > input > path`,
  with a test — exactly as §2.1 states.
- napari PR #6633: merged 2024-02-01, milestone 0.4.19, single file `napari/_vispy/layers/base.py`
  in `_on_matrix_change`, no test file in the diff — as stated.
- napari #8814: created 2026-03-26, closed 2026-03-27; environment napari 0.7.1.dev5 + napari-ome-zarr
  0.7.2; title and [verbatim excerpt omitted; original artifact/source locator retained] subject as stated (correction C2 on attribution).
- napari v0.9.2: published 2026-09-29; notes contain "Add multiscale level extraction as a
  `LayerList` action (#9495)" under New Features — as stated.
- vizarr #261 merged 2025-03-06; #271 open (title [verbatim excerpt omitted; original artifact/source locator retained],
  created 2025-04-03, both quoted sentences verbatim); #297 opened 2025-09-02 with the
  `isOmeMultiscales()`/`omero` gate in its title and a negative-scale flip that vizarr ignored;
  PR #298 merged 2025-09-03 at merge commit `ec7d738…`, 2 files (`src/io.ts`, `src/ome.ts`),
  +9/−3, **no test files** — as stated; tags list tops out at v0.3.0 — as stated.

The two-precedent comparison and the napari-host + own-interpreter [CHOICE] are legitimate product
decisions with the tradeoff stated concretely (§2.3). B4's [verbatim excerpt omitted; original artifact/source locator retained] is
honored via labels.

## Q2 — format interpretation (§3): normative claims verified; one unstated assumption (C1)

Verified verbatim against the 0.4 capture: §2 (Zarr v2 MUST, attributes); §1.3 (RFC 2119);
§2.1 ([verbatim excerpt omitted; original artifact/source locator retained]; label-dimension lowercase [verbatim excerpt omitted; original artifact/source locator retained]; integer
values); §3.1 (name MUST/unique; type and unit SHOULD, UDUNITS-2, `micrometer`; axes length MUST
equal dims); §3.3 (identity default; [verbatim excerpt omitted; original artifact/source locator retained]); §3.4 (axes MUST 2–5 with
type ordering time→channel/custom→space; `datasets` paths MUST be ordered largest→smallest; per-dataset
`coordinateTransformations` MUST with only scale/translation, **exactly one scale** ("pixel size in
physical units[verbatim excerpt omitted; original artifact/source locator retained]factor vs first resolution, defaulting to 1.0" fallback clause, **translation
MAY/exactly-one and listed after scale**, vector lengths MUST equal `len(axes)`, group-level
`coordinateTransformations` MAY [verbatim excerpt omitted; original artifact/source locator retained] the dataset ones; version/name SHOULD; first-multiscale
fallback); §3.5 (omero optional/transitional; channels/color/window MUSTs); §3.6 (`labels` list;
[verbatim excerpt omitted; original artifact/source locator retained]); §3.7 ("the two 'datasets' series MUST have the same number of
entries"; colors/label-value rules incl. keep-last; `source.image` default `"../../"`); §7 (0.4.0,
2022-02-08, [verbatim excerpt omitted; original artifact/source locator retained]). The B3 crux —
level-count parity is MUST, but axes/units/transform equality between image and label is nowhere
guaranteed — is correctly derived: nothing in §3.6/§3.7 constrains label transforms.

**C1 (substantive).** §3.2's [INFER] formula and §6 treat every per-level `scale` as the level's own
absolute pixel size. The cited §3.4 sentence itself creates a second, conforming-by-text reading:
where [verbatim excerpt omitted; original artifact/source locator retained], the scale value MUST
be the **factor vs level 0** (default 1.0). For a level ℓ>0 value such as `2.0` on an axis of
level-0 scale 0.5 µm, the absolute reading gives 2.0 µm/px and the factor reading gives 1.0 µm/px —
cursor readout and extents differ by 2×, and the numeric metadata alone cannot distinguish. The
proposal never states which reading it implements, §5.5's validation would not flag it, and no
fixture (F1–F10) exercises it because the fixtures hand-write absolute scales. Fix: add an explicit
[CHOICE] ("interpret level>0 scale on a unit-bearing space axis as absolute; if `S_ℓ×shape_ℓ` is
inconsistent with `S_0×shape_0` geometry, show a 'scale convention ambiguous' state or add to
UNRESOLVED_LEADS") — at minimum promote this to a numbered unresolved lead. This is exactly the
class of [verbatim excerpt omitted; original artifact/source locator retained] that brief B2 requires making explicit.

**C2 (minor formula gap).** The §3.2 formula applies only a group-level *scale* (`G_scale`), but §3.4
permits a group-level `coordinateTransformations` **list** following the same type/order rules — i.e.
a group-level `translation` is legal and the formula silently drops it. Compose the full ordered
group-level list instead.

## Q3 — issue→fix→test chains (§4): verified; two attribution/date corrections

The #403 → #590 → eight tests → v0.18.0 chain is verified end-to-end (see Q1), including the
[verbatim excerpt omitted; original artifact/source locator retained] arithmetic (2024-11-06→2026-06-17 ≈ 19.4 months). The vizarr #297 → #298 → #299
chain is verified, including [verbatim excerpt omitted; original artifact/source locator retained] and the follow-up contrast-limit regression
(PR #299: [verbatim excerpt omitted; original artifact/source locator retained], fixing a regression "introduced in
#298" that loaded the *highest* resolution for contrast limits).

- **C3 (date).** §2.2/§11 say the #299-related issue was [verbatim excerpt omitted; original artifact/source locator retained]. Captured facts: PR #299
  merged 2025-09-09; issue #297 (where the regression was reported and investigated) closed
  2025-09-03. No retrieved source supports 2025-09-12; correct or drop the date.
- **C4 (attribution).** §2.1/§4.3 say "maintainers and the reporter reproduced … and localized the
  fault to the ome-zarr-py writer". The captured thread shows the maintainers (brisvag,
  psobolewskiPhD) *asked diagnostic questions*; the **reporter** then did the numpy-pyramid
  reproduction and the ImageJ-export cross-check and concluded "it might be the problem with the
  library ome-zarr-py … downscaled images were cropped". Also keep the two BigDataViewer mentions
  distinct: the original body reports the *same misalignment also occurs* in BigDataViewer/N5, while
  the exonerating cross-check was an ImageJ **export** opened in napari. The lesson drawn (F10,
  triangulate before blaming your interpreter) survives unchanged.

## B1–B5 obligations

- **B1** (§5): input contract, v2/v3 detection, per-check visible states, absent-labels as normal
  state, read-only boundary with F8 byte-level proof — complete and consistent with the spec's
  MUST/SHOULD levels. Note §5.3's [verbatim excerpt omitted; original artifact/source locator retained] is a product rule over a spec SHOULD and
  is labeled as such — acceptable.
- **B2** (§3.2/§3.3/§6): version/conditions/metadata-scope/units/fallbacks are all addressed, per-axis
  unequal scales and offsets are correctly ordinary. Two fixes: C1 above, and **C5** — the §3.3
  example line [verbatim excerpt omitted; original artifact/source locator retained] contradicts the adjacent [CHOICE] to display the stored UDUNITS-2 string
  verbatim ([verbatim excerpt omitted; original artifact/source locator retained]). Either print the stored string in the example or amend the choice to "small
  known-string mapping with explicit fallback". Also state the mixed-unit case (x has `unit`, y does
  not) — §6 only defines the all-absent fallback.
- **B3** (§3.4/§3.5/§7): association/transform/sampling assumptions are explicit; refusal state is
  actionable and leaves the image viewable. Two example-level fixes: **C6** — the §3.5 refusal
  example ([verbatim excerpt omitted; original artifact/source locator retained]) sits exactly on the stated tolerance (0.5 × coarser scale, if that
  scale is 1 µm); under [verbatim excerpt omitted; original artifact/source locator retained] (≤) this case is *permitted*, so the example cannot
  occur as a refusal. Make the boundary strict (`<`) explicitly and move the example off the boundary
  (e.g. 512.0 vs 511.0 µm). **C7** — the [verbatim excerpt omitted; original artifact/source locator retained] wording for PR #590 is ambiguous: the formula
  is (s−s0)/2, which for factor-2 downsampling is 0.25 × the coarser voxel. Tolerances still work
  (0.25 < 0.5), but note the worst case for cropped odd levels (the #8814 situation) reaches exactly
  0.5 × the coarser scale in anchored-extent comparison — i.e. the a-priori constant sits on the
  decision boundary; feed this into lead L3's calibration instead of asserting the constant.
- **B4**: satisfied (two implementations, concrete tradeoff, verified chain, labeled separation).
- **B5** (§8/§9/§10 + UNRESOLVED_LEADS): steps cover B1–B4, limits are visible, "planned — not
  executed" is explicit, and the six leads are genuinely consequential (L1/L2 correctly flag the
  zarr-v2-on-0.9.2 and layer-transform risks; the #8814 reporter's `ZARR_VERSION=2` comment is
  accurately quoted in L1).

## Witness recipes (F1–F10): arithmetic and discrimination

- F1: cursor at voxel (0,0) of level 1 = `T_1` under the §3.2 composition — arithmetic correct.
  **C8**: [verbatim excerpt omitted; original artifact/source locator retained] is ill-posed for a single (horizontal) bar; reword to
  [verbatim excerpt omitted; original artifact/source locator retained].
- F2/F4/F6/F7/F8: expectations follow from §3.2/§3.7/§3.4/[CHOICE] as stated; no errors found.
- F5: [verbatim excerpt omitted; original artifact/source locator retained] is right given C6's boundary fix; banner content matches §3.5.
- F9: **C9** — as written ([verbatim excerpt omitted; original artifact/source locator retained]) the test
  is near-tautological: for any per-level transforms, corresponding voxels chosen to satisfy
  [inline excerpt omitted; original artifact pin retained] produce identical readouts by construction. What it actually guards is (a)
  readout recomputed from each level's own transforms on switch, and (b) the fixture encoding a
  *mutually consistent* pyramid. Specify the correspondence (fixed world point mapped through each
  layer's transform) and add one fixture with deliberately inconsistent level transforms so the
  extent-verification path fires (currently only F5 does, at level 1 only).
- F10: differential second-viewer check is well-motivated by the (corrected) #8814 history.
- Discrimination gap: no fixture exercises the absolute-vs-factor scale convention (C1) — the one
  stated assumption no example can falsify today.

## Unresolved obligations

None outstanding at the plan level: B1–B5 all survive into the proposal, tests are correctly
unclaimed, and leads L1–L6 are explicit. Residual items the correction stage should carry: C1 (add
the scale-convention choice/lead), C3 (fix the #299 date), C4 (fix #8814 attribution wording),
C5–C9 (example/fixture consistency). The napari-0.9.2/zarr-v2 read path (L1) and layer-transform
semantics (L2) remain genuinely unverified by any captured source and must stay flagged.

## Claim-label hygiene

Labels are used honestly throughout; checked quotes are verbatim; conditions and SHOULD/MUST force
are preserved (notably the §2.1 lowercase [verbatim excerpt omitted; original artifact/source locator retained] and the omero transitional optionality). [FIX]
is defined but unused — harmless. The proposal's distinction between metadata *declaration* and
*alignment guarantee* (§3.5) is well-supported by §3.6/§3.7 as captured.
