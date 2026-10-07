# D-M06-B draft — affine raster coordinates and inverse applicability

**Legitimate test input — untrusted proposed algorithm.** This is a preliminary, good-faith candidate draft for review. It is not truth, not witnessed fact beyond the frozen sources, and not an evaluator judgment. No code was executed in this seed; every numeric threshold below is tentative. Conditions and uncertainty are stated per claim and summarized at the end.

## Bound conventions (witnessed)

Coefficient order, units, and origin follow the frozen GDAL 3.9.0 geotransform tutorial (`geotransform.rst`, sha256 5b9c…33cc):

```
X_geo = GT(0) + X_pixel * GT(1) + Y_line * GT(2)
Y_geo = GT(3) + X_pixel * GT(4) + Y_line * GT(5)
```

GT(1)/GT(5) are pixel width/height in georeferenced units (GT(5) negative for north-up); GT(2)/GT(4) are row/column rotation coefficients. Pixel/line coordinates run from (0,0) at the **top-left corner** of the top-left pixel to (width, height) at the bottom-right corner of the bottom-right pixel; the center of the top-left pixel is (0.5, 0.5).

## Proposed algorithm (pseudocode, unexecuted)

Treat the geotransform as offset **o** = (GT0, GT3) and 2×2 linear part **A** = [[GT1, GT2], [GT4, GT5]].

```
forward(gt, px, line):                      # px, line are continuous pixel/line coords
    X = gt[0] + px*gt[1] + line*gt[2]
    Y = gt[3] + px*gt[4] + line*gt[5]
    return (X, Y)

invert(gt):                                 # closed-form 2x2 inverse, derived independently
    det = gt[1]*gt[5] - gt[2]*gt[4]
    scale = |gt[1]*gt[5]| + |gt[2]*gt[4]|
    if det == 0 or |det| <= eps_rel * max(scale, floor):   # T2, tentative
        return SINGULAR                     # reject; do not divide
    inv = [[ gt[5], -gt[2]], [-gt[4], gt[1]]] / det
    return inv

inverse_point(gt, X, Y):
    inv = invert(gt)
    px   = inv[0][0]*(X - gt[0]) + inv[0][1]*(Y - gt[3])
    line = inv[1][0]*(X - gt[0]) + inv[1][1]*(Y - gt[3])
    return (px, line)

pixel_center(i, j): return (i + 0.5, j + 0.5)   # apply forward() to centers, not corners, for pixel values
```

The rejection predicate `|det| <= eps_rel * max(scale, floor)` is a **relative** singularity test: an absolute epsilon alone is scale-dependent. `eps_rel` and `floor` are deliberately unspecified here (T2).

## Material claims

- Claim 1 (order/units): The six coefficients bind exactly as the tutorial equations above; GT(1) and GT(5) carry georeferenced units per pixel, and a north-up image has GT(2)=GT(4)=0 with GT(5)<0. Condition: witnessed only for the tutorial text; applicability to a specific raster requires its own metadata.
- Claim 2 (corner vs center): (0,0) denotes the top-left **corner** of the top-left pixel; pixel centers sit at integer + 0.5. Any claim about "the value of pixel (i,j)" must transform the center (i+0.5, j+0.5), not (i,j). Condition: witnessed in the tutorial; mixing the two is a silent half-pixel error, not a failure the math will flag.
- Claim 3 (rotation/shear): Nonzero GT(2)/GT(4) encode rotation and/or shear; the affine equations apply to them unchanged, and north-up is only a special case. A draft that assumes GT(2)=GT(4)=0 is applicable solely to north-up rasters and must say so. Condition: model-level claim from the witnessed equations; magnitude limits of shear in real datasets are not witnessed here.
- Claim 4 (invertibility): The inverse exists iff det(A) = GT(1)·GT(5) − GT(2)·GT(4) ≠ 0; exactly singular or degenerate inputs (e.g., zero row or column) must be rejected before division, not silently inverted. Condition: standard linear algebra, proposed here without witness in the corpus, because `GDALInvGeoTransform`'s body is not among the frozen bytes (`gdal_misc.cpp` only calls it at line 2972).
- Claim 5 (tolerance): Singularity tests must be relative to coefficient magnitude; a fixed absolute epsilon rejects well-scaled small-extent rasters or accepts ill-scaled large ones. The concrete threshold is tentative (T2) and must be fixed by the later witness, not by this draft. Condition: numerical reasoning, unexecuted; no witnessed GDAL tolerance value exists in this corpus.
- Claim 6 (independent control): Round-trip agreement between a forward function and its own inverse is necessary but not sufficient — a shared symmetric error passes it. Controls must include at least one independent derivation (e.g., the closed-form 2×2 inverse above checked against adjugate/cofactor reasoning) or a trusted third operation (e.g., known corner coordinates of a north-up raster). Condition: proposed review criterion; which specific controls suffice is itself a review question.
- Claim 7 (witnessed vs proposed): Only the tutorial's coefficient semantics and the corner/center note are witnessed facts in this corpus. The inversion formula, tolerance, and controls above are proposed. The GCP-fitting code in `gdal_misc.cpp` (first-order fit from GCPs, composition via `GDALComposeGeoTransforms`) is witnessed as *existing code paths*, but its accuracy guarantees are not witnessed claims. Condition: corpus is frozen; nothing else may be promoted to witnessed without a listed primary source.
- Claim 8 (applicability): All claims hold only for first-order affine geotransforms. They do not extend to polynomial GCP warps, RPCs, or geolocation arrays; `gdal_misc.cpp`'s GCP path shows such fits are approximations flagged `bApproxOK`, distinct from exact affine inversion. Condition: scope boundary from the corpus; no claim is made about error magnitudes of GCP fits.

## Uncertainty summary (tentative)

T1: whether GDAL's own inverse uses a different rejection test than Claim 4/5 (its body is outside the frozen bytes). T2: the concrete `eps_rel`/`floor` values. T3: whether pixel-center rounding for integer pixel indexing needs a half-open rule at raster edges; untested here. All three remain open for the later root-qualified witness; this draft computes nothing.
