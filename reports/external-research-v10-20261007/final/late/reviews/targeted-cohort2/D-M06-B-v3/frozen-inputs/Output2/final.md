# D-M06-B final — affine raster coordinates and inverse applicability (GDAL 3.9.0)

**Recommendation.** Treat a GDAL geotransform as a general six-coefficient affine map from continuous
corner-origin pixel/line space to CRS coordinates, evaluate invertibility by the 2x2 determinant with a
scale-relative margin test, and never accept an inverse on forward/inverse roundtrip evidence alone. All
eight findings below were reconciled against a sandboxed witness run (`witness-receipt.json`,
`process_exit=0`, namespace+seccomp isolation, code_sha256 37db1bae…, input_sha256 dde69e39…) that passed
9/9 correct controls and detected 4/4 plausible-wrong controls. **Witnessed** = stated by the frozen GDAL
3.9.0 source bytes or produced by that run; **proposed** = asserted here on our own authority.

## Material findings

**F1 — Coefficient order, units, origin (witnessed; accepted).** The array is 0-based:
X_geo = GT(0) + p·GT(1) + l·GT(2), Y_geo = GT(3) + p·GT(4) + l·GT(5) (geotransform.rst lines 15-20, 27-28).
GT(1)/GT(5) are pixel resolutions and GT(2)/GT(4) rotation terms in CRS units (metres or degrees); p, l
are unitless pixel/line offsets. gt[0], gt[3] locate the top-left **corner** of the top-left pixel. The
1-based hazard is real: the released world-file loader maps file lines 1-6 to GT(1),GT(4),GT(2),GT(5),
GT(0),GT(3) (gdal_misc.cpp lines 2182-2187), so world-file line numbers are not GT indexes. Witness:
fixed-point identity 8/8 fixtures, 8/8 hand determinants (`witness-receipt.json`).

**F2 — Corners vs centers (witnessed; caller duty corroborated).** The continuous space runs
(0.0,0.0) top-left corner to (width,height) bottom-right corner; the top-left pixel center is (0.5,0.5)
(geotransform.rst lines 30-32). GDAL itself converts center→corner by subtracting half a pixel per axis
(gdal_misc.cpp lines 2190-2193). A caller holding integer (col,row) indices meaning centers must map to
(col+0.5, row+0.5) first — corroborated by center identities and the half-pixel-shift control on 8/8
fixtures; corner/center conflation is detected wherever tested (`witness-receipt.json`).

**F3 — Rotation/shear is the general case (witnessed; accepted).** GT(2)/GT(4) are first-class rotation
terms, only "typically zero"; north-up is the named special case (geotransform.rst lines 17, 19, 34-38).
The witness classified the 2x2 blocks: the rotated fixture has orthogonal equal-norm columns (dot=0 —
pure rotation+scale), the sheared fixture is non-orthogonal (dot=1) (`witness-receipt.json`). Any
implementation or test that assumes north-up fails rotated/sheared inputs by construction: forcing
GT(2)=GT(4)=0 was detected on both such fixtures.

**F4 — Transposition is invisible without shear/rotation coverage (witnessed run; consequence proposed).**
Swapping GT(2)↔GT(4) changes no forward output on any north-up fixture, while being detected on rotated
and sheared ones (transposed inverse returned (2.2, 0.4) against oracle (1, 2)) (`witness-receipt.json`).
Proposed consequence: coefficient-order reviews and test suites MUST include rotated/sheared cases;
north-up-only coverage cannot catch order bugs.

**F5 — Invertibility and tolerance (det condition witnessed; test form amended; threshold proposed).**
The forward map is invertible iff det = GT(1)·GT(5) − GT(2)·GT(4) ≠ 0 (derived from lines 27-28; witness:
both degenerate fixtures produce no finite inverse, and non-injectivity is proven by collisions —
rank-1 maps (2,3) and (5,0) both to (15,25); zero-scale maps everything to (10,20)). An absolute
|det| ≤ tol test alone misjudges scale: the degrees fixture is healthy at |det|=1e-6 while the
near-singular fixture is treacherous at |det|≈2e-6. The discriminating test is the scale-relative margin
|det| / (|GT(1)·GT(5)| + |GT(2)·GT(4)|): healthy fixtures ≈ 0.83–1.0, near-singular ≈ 1.0e-6 (witnessed,
control C9). The 1e-5 rejection threshold is proposed; the sources witness no tolerance figure, so any
production value must be justified per dataset.

**F6 — Independent derivation required; roundtrip evidence is insufficient (witnessed; accepted).**
A mutually paired forward/inverse can be consistently wrong together: the witness built a wrong pair
(transposed forward + its own adjugate inverse) that roundtrips to max error 1.1e-10 on every invertible
fixture yet violates hand-derived oracles on rotated and sheared inputs (`witness-receipt.json`). Valid
controls are oracles independent of the pair: fixed points, the half-pixel center identity, 22
hand-computed points, hand-expanded determinants, translation metamorphics (48/48 exact shifts),
geometry classification, and singular rejections. The adjugate inverse used here
(dp = (GT(5)(X−GT(0)) − GT(2)(Y−GT(3)))/det, dl = (−GT(4)(X−GT(0)) + GT(1)(Y−GT(3)))/det) matched all 22
hand oracle points where invertible.

**F7 — External trusted-operation control: unresolved.** Fitting a geotransform from ground control
points (GDALGCPsToGeoTransform, call sites witnessed at gdal_misc.cpp lines 1811 and 2006) would be an
orthogonal trusted operation, but its body is outside the mapped frozen corpus and this arm's qualified
primitive executes offline stdlib Python only, so it remains unevaluated here. Do not claim it as a
witness without executing it under an equivalent qualification.

**F8 — Applicability and witnessed/proposed boundary (accepted; amended).** Witnessed: the coefficient
binding, forward equations, corner/center text, north-up special case, world-file remap and half-pixel
shift, GCP call-site existence, and every control outcome in `witness-receipt.json`. Proposed: the 1e-5
margin threshold, production tolerances, and the +0.5 mapping as an API contract for integer-index
consumers. Applicability: six-coefficient GDAL-style affine geotransforms in any CRS, v3.9.0 frozen
bytes; NOT applicable to polynomial or RPC georeferencing; untested against GDAL's executed binaries by
design of this module.

## Conditions, uncertainty, proposed checks

Conditions: apply F1-F6 only under the six-coefficient convention with corner-origin continuous p/l;
bind units before comparing datasets. Uncertainty: tolerance figures (F5) and the GCP control (F7) remain
open. Proposed checks before production use: (a) rerun the witness controls on target geotransforms,
always including rotated/sheared and degenerate cases (F4); (b) test invertibility with the
scale-relative margin, rejecting below a justified threshold (F5); (c) validate any inverse against
hand-derived points or a separately executed trusted fit, never roundtrip alone (F6); (d) verify callers'
integer indices receive the +0.5 center mapping (F2).

Sources: geotransform.rst (GDAL 3.9.0, sha256 5b9c3093…, locators above); gdal_misc.cpp (GDAL 3.9.0,
sha256 9a06b018…, locators above); seed fixtures sha256 0856a17a…; full method evidence in `report.md`,
identities in `sources.json`, execution record in `witness-receipt.json`.
