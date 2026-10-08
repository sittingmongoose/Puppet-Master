"""ER10 D-M06-B candidate witness: affine raster coordinates and inverse applicability.

Executed ONLY inside the er10 mechanical sandbox (offline, single process, stdlib-only
/usr/bin/python3 -I -B), reading /input.bin. Process isolation is certified by the
sandbox; this code certifies nothing about itself - it reports per-check results and
labels the evidence class of each check:

  hand-expected   : expected values derived by hand from the frozen source text before
                    execution (independent of any code path used to produce them)
  algebraic       : an independent algebraic identity (transpose/det on an orthogonal
                    block; literal-formula vs matrix-form transcription control)
  weak_mutual     : forward/inverse round-trip - explicitly weak evidence, kept only
                    as corroboration
  guard           : refusal behavior on zero-determinant inputs

The adjugate inverse below is derived by elimination from the two forward equations
transcribed from geotransform.rst lines 27-28; it does not reuse any forward routine.
"""
import json
import math
import sys


def close(a, b, rel=1e-12, abs_tol=1e-12):
    return math.isclose(a, b, rel_tol=rel, abs_tol=abs_tol)


def forward_literal(gt, p, l):
    # Transcribed literally from geotransform.rst lines 27-28.
    x = gt[0] + p * gt[1] + l * gt[2]
    y = gt[3] + p * gt[4] + l * gt[5]
    return x, y


def forward_matrix(gt, p, l):
    # Same map written in matrix form; agreement with forward_literal is a
    # transcription control, not a scientific result.
    x = gt[0] + (gt[1] * p + gt[2] * l)
    y = gt[3] + (gt[4] * p + gt[5] * l)
    return x, y


def det2(gt):
    return gt[1] * gt[5] - gt[2] * gt[4]


def scale_relative_ratio(gt):
    s = abs(gt[1] * gt[5]) + abs(gt[2] * gt[4])
    d = abs(det2(gt))
    return d / s if s > 0 else (0.0 if d == 0 else math.inf)


def inverse_adjugate(gt, X, Y):
    # Derived by elimination from the two forward equations:
    #   p*gt1 + l*gt2 = X-gt0 ; p*gt4 + l*gt5 = Y-gt3
    # adj([[gt1,gt2],[gt4,gt5]]) = [[gt5,-gt2],[-gt4,gt1]].
    d = det2(gt)
    if d == 0.0:
        raise ZeroDivisionError("singular geotransform: det == 0")
    dp = (gt[5] * (X - gt[0]) - gt[2] * (Y - gt[3])) / d
    dl = (-gt[4] * (X - gt[0]) + gt[1] * (Y - gt[3])) / d
    return dp, dl


def frob(gt):
    return math.sqrt(gt[1] ** 2 + gt[2] ** 2 + gt[4] ** 2 + gt[5] ** 2)


def main():
    data = json.loads(open("/input.bin", "rb").read().decode("utf-8"))
    gts = {g["id"]: g["gt"] for g in data["geotransforms"]}
    queries = data["pixel_queries"]
    policy = data["invertibility_policy"]
    tol_rel = policy["tol_rel"]
    illcond = 1e-4
    checks = []

    def add(cid, kind, passed, detail):
        checks.append({"id": cid, "evidence_class": kind, "passed": bool(passed), "detail": detail})

    # 1) Transcription control: literal source formula vs matrix form.
    worst = 0.0
    for gid, gt in gts.items():
        for q in queries:
            a = forward_literal(gt, q["pixel"], q["line"])
            b = forward_matrix(gt, q["pixel"], q["line"])
            worst = max(worst, abs(a[0] - b[0]), abs(a[1] - b[1]))
    add("ctrl_transcription_literal_vs_matrix", "algebraic", worst == 0.0,
        "max |literal - matrix| = %g over 8 geotransforms x 6 queries" % worst)

    # 2) Hand-computed forward expectations (independent control).
    for i, e in enumerate(data["hand_computed_forward_expectations"]):
        gt = gts[e["gt_id"]]
        x, y = forward_literal(gt, e["pixel"], e["line"])
        ok = close(x, e["expected_xy"][0]) and close(y, e["expected_xy"][1])
        add("hand_forward_%02d_%s" % (i, e["gt_id"]), "hand_expected", ok,
            "computed (%.17g, %.17g) vs hand (%r, %r)" % (x, y, e["expected_xy"][0], e["expected_xy"][1]))

    # 3) Hand-computed inverse expectations (independent control).
    for i, e in enumerate(data["hand_computed_inverse_expectations"]):
        gt = gts[e["gt_id"]]
        p, l = inverse_adjugate(gt, e["world_xy"][0], e["world_xy"][1])
        ok = close(p, e["expected_pixel_line"][0]) and close(l, e["expected_pixel_line"][1])
        add("hand_inverse_%02d_%s" % (i, e["gt_id"]), "hand_expected", ok,
            "computed (%.17g, %.17g) vs hand (%r, %r)" % (p, l, e["expected_pixel_line"][0], e["expected_pixel_line"][1]))

    # 4) Adjugate vs transpose identity on the orthogonal rotated block.
    gt = gts["rotated"]
    a, b, c, d = gt[1], gt[2], gt[4], gt[5]
    orthogonal = close(a * c + b * d, 0.0, rel=1e-15)
    tr_inv = lambda X, Y: ((a * (X - gt[0]) + c * (Y - gt[3])) / (a * a + b * b),
                           (b * (X - gt[0]) + d * (Y - gt[3])) / (a * a + b * b))
    agree = all(close(p1, p2, rel=1e-9) and close(l1, l2, rel=1e-9)
                for p1, l1, p2, l2 in
                ((inverse_adjugate(gt, X, Y)[0], inverse_adjugate(gt, X, Y)[1],
                  tr_inv(X, Y)[0], tr_inv(X, Y)[1])
                 for X, Y in ((5.0, 5.0), (1.5, 0.5), (-3.25, 7.75))))
    add("ctrl_transpose_identity_rotated", "algebraic", orthogonal and agree,
        "block columns orthogonal=%s; adjugate inverse equals transpose/det at 3 sampled points=%s" % (orthogonal, agree))

    # 5) Weak mutual round-trip, labeled as weak evidence only.
    worst_rt, n = 0.0, 0
    for gid, gt in gts.items():
        if det2(gt) == 0.0:
            continue
        for q in queries:
            x, y = forward_literal(gt, q["pixel"], q["line"])
            p, l = inverse_adjugate(gt, x, y)
            worst_rt = max(worst_rt, abs(p - q["pixel"]), abs(l - q["line"]))
            n += 1
    add("weak_mutual_roundtrip", "weak_mutual", worst_rt < 1e-6,
        "max |recovered - original| = %.3g over %d round-trips; mutual round-tripping alone is weak evidence (a shared transposed matrix round-trips consistently) and is corroborated here only by the hand/algebraic controls above" % (worst_rt, n))

    # 6) Corner vs center: half-pixel displacement identity (witnessed shift pattern,
    #    gdal_misc.cpp lines 2189-2193) and distinctness for ordinary cases.
    ok_disp, worst_disp = True, 0.0
    for gid, gt in gts.items():
        cx, cy = forward_literal(gt, 0.0, 0.0)
        px, py = forward_literal(gt, 0.5, 0.5)
        ex, ey = 0.5 * (gt[1] + gt[2]), 0.5 * (gt[4] + gt[5])
        worst_disp = max(worst_disp, abs(px - cx - ex), abs(py - cy - ey))
    ok_disp = worst_disp < 1e-12
    add("corner_center_halfpixel_identity", "algebraic", ok_disp,
        "max |world(0.5,0.5)-world(0,0) - 0.5*(gt1+gt2, gt4+gt5)| = %.3g (matches the witnessed world-file center-to-corner shift)" % worst_disp)
    nonconstant = [gid for gid, gt in gts.items() if any(v != 0.0 for v in gt[1:3] + gt[4:6])]
    distinct = all(forward_literal(gts[gid], 0.0, 0.0) != forward_literal(gts[gid], 0.5, 0.5)
                   for gid in nonconstant)
    add("corner_vs_center_distinct", "hand_expected", distinct,
        "world(0,0) != world(0.5,0.5) for the %d geotransforms with a nonzero 2x2 block; degenerate_zero_scale is excluded because its constant map sends every pixel/line to (gt0,gt3), which is exactly why integer-index callers without the +0.5 mapping test the corner grid wherever the map is nonconstant" % len(nonconstant))

    # 7) Invertibility classification with the proposed scale-relative test.
    expected_class = {
        "identity_north_up": "invertible", "north_up_meters": "invertible",
        "geographic_degrees": "invertible", "rotated": "invertible",
        "sheared": "invertible", "near_singular": "invertible_ill_conditioned",
        "degenerate_rank1": "singular_refused", "degenerate_zero_scale": "singular_refused",
    }
    details, ok_class = [], True
    for gid, gt in gts.items():
        d = det2(gt)
        r = scale_relative_ratio(gt)
        if d == 0.0 or r <= tol_rel:
            got = "singular_refused"
        elif r <= illcond:
            got = "invertible_ill_conditioned"
        else:
            got = "invertible"
        ok_class = ok_class and (got == expected_class[gid])
        details.append("%s: det=%.17g r=%.6g -> %s" % (gid, d, r, got))
    add("invertibility_scale_relative_classification", "guard", ok_class,
        "; ".join(details))

    # 8) Ill-conditioning evidence on near_singular: inverse error amplification ~1/r.
    gt = gts["near_singular"]
    r = scale_relative_ratio(gt)
    amp = (frob(gt) ** 2) / abs(det2(gt))
    add("near_singular_amplification_reported", "guard", amp > illcond ** -1,
        "frobenius amp |A|*|A^-1| ~ %.6g (r=%.3g); formally invertible but numerically untrustworthy - any tolerance must be scale-relative" % (amp, r))

    # 9) Degenerate refusal: the guard must refuse, not emit numbers.
    refused = 0
    for gid in ("degenerate_rank1", "degenerate_zero_scale"):
        try:
            inverse_adjugate(gts[gid], 0.0, 0.0)
        except ZeroDivisionError:
            refused += 1
    add("degenerate_guards_refuse", "guard", refused == 2,
        "%d/2 zero-determinant fixtures refused by exact det==0 guard before any division" % refused)

    # 10) Out-of-extent totality: the affine map is total; extent is caller policy.
    finite = all(math.isfinite(v)
                 for gid in ("identity_north_up", "north_up_meters")
                 for q in (queries[4], queries[5])
                 for v in forward_literal(gts[gid], q["pixel"], q["line"]))
    add("out_of_extent_totality_note", "algebraic", finite,
        "affine forward defined and finite at (-1,-1) and (10.5,5.5); extent containment is caller policy, not part of the affine math")

    summary = {
        "schema": "pm.er10.d-m06-b.candidate-v3.witness-output.v1",
        "case_id": "D-M06-B",
        "python": "%d.%d.%d" % sys.version_info[:3],
        "environment": "er10 mechanical sandbox: offline, single process, seccomp+namespaces, stdlib only",
        "checks_total": len(checks),
        "checks_passed": sum(1 for c in checks if c["passed"]),
        "all_passed": all(c["passed"] for c in checks),
        "checks": checks,
        "witness_validity": ("valid_scientific_witness_of_proposed_tests" if all(c["passed"] for c in checks)
                             else "checks_failed"),
        "claim_scope": ("Process success (sandbox receipt) plus these executed checks support the "
                        "proposed algorithms on the tested fixtures only; GDAL itself was not executed, "
                        "tolerance values remain proposed-not-witnessed, and full forward/inverse claims "
                        "need the hand/algebraic controls, not the weak mutual round-trip alone."),
    }
    sys.stdout.write(json.dumps(summary))
    return 0 if summary["all_passed"] else 3


if __name__ == "__main__":
    sys.exit(main())
