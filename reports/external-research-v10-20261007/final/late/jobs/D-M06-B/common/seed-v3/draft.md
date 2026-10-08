# D-M06-B seed draft — affine raster coordinates and inverse applicability

**Legitimate test input — untrusted proposed algorithm.** Authored fresh from the frozen sources
listed in sources.json (GDAL 3.9.0 geotransforms tutorial; gcore/gdal_misc.cpp). Nothing here has
been executed or checked against a root-qualified witness; every claim is tentative and carries its
stated conditions and uncertainty. **Witnessed** = stated by the frozen source text; **proposed** =
this draft asserts it on its own authority.

## Preliminary algorithm (unexecuted pseudocode)

Forward, pixel/line to georeferenced (binding witnessed at geotransform.rst lines 27–28):

```
forward(gt, p, l):
    X = gt[0] + p*gt[1] + l*gt[2]
    Y = gt[3] + p*gt[4] + l*gt[5]
    return (X, Y)
```

Proposed inverse, obtained here by independently solving the 2x2 linear system (algebraic
elimination/adjugate), not by inverting or reusing a forward routine:

```
invertible(gt, tol):
    det = gt[1]*gt[5] - gt[2]*gt[4]
    return abs(det) > tol            # tol proposed, not witnessed

inverse(gt, X, Y):
    require invertible(gt, tol)
    det = gt[1]*gt[5] - gt[2]*gt[4]
    dp = ( gt[5]*(X - gt[0]) - gt[2]*(Y - gt[3]) ) / det
    dl = (-gt[4]*(X - gt[0]) + gt[1]*(Y - gt[3]) ) / det
    return (dp, dl)
```

Corner vs center: (p, l) is continuous pixel space whose origin is the top-left corner of the
top-left pixel. A caller holding integer indices (col, row) that mean pixel centers must first map
to (p, l) = (col + 0.5, row + 0.5) before calling forward. Units: gt coefficients carry
georeferenced CRS units (metres or degrees); p, l are unitless pixel/line offsets.

## Claims

**C1 — Coefficient order, units, and origin (witnessed binding).** Order is GT(0) x-origin,
GT(1) w-e pixel width, GT(2) row rotation, GT(3) y-origin, GT(4) column rotation, GT(5) n-s pixel
height, negative for a north-up image (geotransform.rst lines 15–20); gt[0], gt[3] locate the
top-left corner of the top-left pixel. *Condition:* holds for any geotransform consumed under this
six-coefficient convention. *Uncertainty:* a candidate draft indexing coefficients 1-based (as
world-file text lines are numbered) rather than 0-based silently transposes the matrix; the basis
must be confirmed before any comparison.

**C2 — Corners vs centers (witnessed distinction; proposed caller duty).** The tutorial fixes
(0,0) at the top-left corner of the top-left pixel and (0.5,0.5) at that pixel's center (lines
30–32). *Witnessed corroboration:* gdal_misc.cpp lines 2190–2193 shift a world-file transform by
half a pixel in each axis precisely to convert a pixel-center convention to the corner origin.
*Proposed:* a draft or fixture feeding integer indices without the +0.5 mapping is testing the
corner grid, not pixel centers. *Uncertainty:* which convention a candidate intended is not
recoverable from coefficients alone.

**C3 — Rotation/shear is the general case; north-up is special (witnessed).** GT(2) and GT(4) are
first-class rotation/shear terms, marked only "typically zero"; north-up (both zero) is a named
special case (geotransform.rst lines 17, 19, 34–38). *Proposed:* any draft must be assessed on the
general affine form; one that hard-codes GT(2) = GT(4) = 0 fails rotated/sheared inputs by
construction. *Uncertainty:* separating rotation from shear requires inspecting the whole 2x2
block gt[1], gt[2], gt[4], gt[5], not the sign of GT(2) alone.

**C4 — Invertibility and numerical tolerance (proposed; singular case witnessed only as hazard).**
The inverse exists iff det = gt[1]*gt[5] - gt[2]*gt[4] is nonzero; the brief's singular examples
drive it to exactly zero, and near-singular inputs are unstable because the inverse scales with
1/det. *Proposed conditions:* reject abs(det) <= tol, with tol expressed in squared CRS units per
pixel and accompanied by a scale-relative test against abs(gt[1]*gt[5]) + abs(gt[2]*gt[4]), since
an absolute tolerance alone misjudges very large or very small pixel sizes. *Uncertainty:* the
sources witness no tolerance value; any figure is provisional and must be justified per dataset.

**C5 — Independent derivation, not paired self-test (proposed method; witnessed control exists).**
A forward routine and its inverse can be consistently wrong together (the same transposed matrix in
both), so mutual round-tripping is weak evidence. *Proposed controls:* (a) derive the inverse by
hand from the two forward equations, as above; (b) use a trusted independent operation as an
orthogonal witness — the sources show GDALGCPsToGeoTransform call sites fitting a geotransform from
ground control points (gdal_misc.cpp lines 1811, 2006); (c) hand-computed single-point checks.
*Uncertainty:* whether a reviewed module may invoke such controls is outside this draft's scope.

**C6 — Witnessed vs proposed separation and applicability (proposed discipline).** Witnessed here:
the six-coefficient binding, forward equations, corner/center text, north-up special case, the
world-file half-pixel shift, and the existence of GCP-fit controls, each cited above. Proposed
here: invertibility thresholds, the caller-side center mapping duty, and all pseudocode.
*Applicability:* valid for six-coefficient GDAL-style geotransforms in any CRS; not applicable to
polynomial or RPC georeferencing; untested against any executed implementation by design of this
module.
