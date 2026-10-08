"""D-M06-B candidate witness: independent-oracle evaluation of geotransform claims.

Reads /input.bin (frozen oracle constants + fixtures). Implements the witnessed
forward equations and a hand-derived adjugate inverse, then checks every correct
control (must PASS against oracle constants) and every wrong control (must FAIL,
i.e. be detected). Exits 0 only if all correct controls pass and all wrong
controls are detected. No expected value is computed here at runtime; every
expectation comes from the input constants or stated metamorphic properties.
"""
import json
import sys


def fwd(gt, p, l):
    return (gt[0] + p * gt[1] + l * gt[2], gt[3] + p * gt[4] + l * gt[5])


def det2(gt):
    return gt[1] * gt[5] - gt[2] * gt[4]


def inv(gt, x, y):
    d = det2(gt)
    if d == 0.0:
        return None
    dp = (gt[5] * (x - gt[0]) - gt[2] * (y - gt[3])) / d
    dl = (-gt[4] * (x - gt[0]) + gt[1] * (y - gt[3])) / d
    return (dp, dl)


def close(a, b, tol):
    return abs(a - b) <= tol


def pair_close(got, exp, tol):
    return got is not None and close(got[0], exp[0], tol) and close(got[1], exp[1], tol)


def main():
    data = json.load(open('/input.bin', 'r'))
    fixtures = {f['id']: f['gt'] for f in data['fixtures']}
    queries = data['query_points']
    cc = data['correct_controls']
    wc = data['wrong_controls']
    results = {'correct': [], 'wrong': []}

    def rec(kind, cid, passed, detail):
        results[kind].append({'id': cid, 'status': 'pass' if passed else 'FAIL',
                              'detail': detail})

    # C1 fixed-point oracle: fwd(0,0) == (GT0, GT3), all fixtures
    bad = [fid for fid, gt in fixtures.items()
           if not pair_close(fwd(gt, 0.0, 0.0), (gt[0], gt[3]), 0.0)]
    rec('correct', 'C1_fixed_point_origin', not bad,
        'fwd(0,0)==(GT0,GT3) on %d/8 fixtures' % (8 - len(bad)))

    # C2 half-pixel center oracle: fwd(0.5,0.5) == (GT0+.5GT1+.5GT2, GT3+.5GT4+.5GT5)
    bad = []
    for fid, gt in fixtures.items():
        exp = (gt[0] + 0.5 * gt[1] + 0.5 * gt[2], gt[3] + 0.5 * gt[4] + 0.5 * gt[5])
        if not pair_close(fwd(gt, 0.5, 0.5), exp, 1e-12):
            bad.append(fid)
    rec('correct', 'C2_pixel_center_identity', not bad,
        'center identity holds on %d/8 fixtures' % (8 - len(bad)))

    # C3 hand-derived point oracles (constants frozen in input)
    fails = []
    for hp in cc['hand_points']:
        gt = fixtures[hp['fixture']]
        got = fwd(gt, hp['arg'][0], hp['arg'][1]) if hp['op'] == 'fwd' \
            else inv(gt, hp['arg'][0], hp['arg'][1])
        if not pair_close(got, tuple(hp['expect']), hp['tol']):
            fails.append(hp['id'])
    rec('correct', 'C3_hand_derived_points', not fails,
        '%d/%d hand oracle points matched' % (len(cc['hand_points']) - len(fails),
                                              len(cc['hand_points'])))

    # C4 hand determinants
    fails = []
    for fid, spec in cc['hand_det'].items():
        if fid not in fixtures:
            continue
        if not close(det2(fixtures[fid]), spec['expect'], spec['tol']):
            fails.append(fid)
    rec('correct', 'C4_hand_determinants', not fails,
        '%d/8 determinants matched' % (8 - len(fails)))

    # C5 translation metamorphic: GT0+=dx, GT3+=dy shifts outputs by (dx,dy)
    mt = cc['metamorphic_translation']
    n_ok, n_all, badf = 0, 0, []
    for fid, gt in fixtures.items():
        gt2 = [gt[0] + mt['dx'], gt[1], gt[2], gt[3] + mt['dy'], gt[4], gt[5]]
        for q in queries:
            n_all += 1
            a, b = fwd(gt, q['pixel'], q['line'])
            a2, b2 = fwd(gt2, q['pixel'], q['line'])
            if close(a2 - a, mt['dx'], mt['tol']) and close(b2 - b, mt['dy'], mt['tol']):
                n_ok += 1
            else:
                badf.append(fid)
    rec('correct', 'C5_translation_metamorphic', not badf,
        '%d/%d fixture-query shifts exact' % (n_ok, n_all))

    # C6 half-pixel-shift corroboration of gdal_misc.cpp 2190-2193 (center->corner)
    tol6 = cc['half_pixel_shift_corroboration']['tol']
    bad = []
    for fid, gt in fixtures.items():
        gts = [gt[0] + 0.5 * gt[1] + 0.5 * gt[2], gt[1], gt[2],
               gt[3] + 0.5 * gt[4] + 0.5 * gt[5], gt[4], gt[5]]
        if not pair_close(fwd(gts, 0.0, 0.0), fwd(gt, 0.5, 0.5), tol6):
            bad.append(fid)
    rec('correct', 'C6_half_pixel_shift_corroboration', not bad,
        'shifted-corner(0,0)==orig-center(0.5,0.5) on %d/8 fixtures' % (8 - len(bad)))

    # C7 geometric classification of the 2x2 block columns
    geo = cc['geometry']
    g = geo['rotated']
    c1, c2 = g['col1'], g['col2']
    dot = c1[0] * c2[0] + c1[1] * c2[1]
    n1, n2 = c1[0] ** 2 + c1[1] ** 2, c2[0] ** 2 + c2[1] ** 2
    ok7 = close(dot, g['dot_expect'], g['tol']) and close(n1, g['norm2_expect'][0], g['tol']) \
        and close(n2, g['norm2_expect'][1], g['tol'])
    g = geo['sheared']
    c1, c2 = g['col1'], g['col2']
    dot_s = c1[0] * c2[0] + c1[1] * c2[1]
    ok7 = ok7 and close(dot_s, g['dot_expect'], g['tol'])
    gt_ns = fixtures['near_singular']
    dot_ns = gt_ns[1] * gt_ns[2] + gt_ns[4] * gt_ns[5]
    cos_ns = abs(dot_ns) / ((gt_ns[1] ** 2 + gt_ns[4] ** 2) ** 0.5 * (gt_ns[2] ** 2 + gt_ns[5] ** 2) ** 0.5)
    ok7 = ok7 and cos_ns >= geo['near_singular']['cosine_min_parallel'] - geo['near_singular']['tol']
    gt_r1 = fixtures['degenerate_rank1']
    dot_r1 = gt_r1[1] * gt_r1[2] + gt_r1[4] * gt_r1[5]
    cos_r1 = dot_r1 / ((gt_r1[1] ** 2 + gt_r1[4] ** 2) ** 0.5 * (gt_r1[2] ** 2 + gt_r1[5] ** 2) ** 0.5)
    ok7 = ok7 and close(cos_r1, geo['degenerate_rank1']['cosine_expect'], geo['degenerate_rank1']['tol'])
    rec('correct', 'C7_block_geometry_classification', ok7,
        'rotated orthogonal (dot=%.3g) equal-norm; sheared dot=%.3g; near-sing cos=%.9f; rank1 cos=%.6f'
        % (dot, dot_s, cos_ns, cos_r1))

    # C8 singular rejection: det==0 -> no inverse; collisions prove non-injectivity
    sr = cc['singular_rejection']
    ok8 = all(inv(fixtures[fid], 1.0, 1.0) is None for fid in sr['fixtures'])
    f = fixtures[sr['rank1_collision'] and 'degenerate_rank1']
    a, b = sr['rank1_collision']['a'], sr['rank1_collision']['b']
    ok8 = ok8 and fwd(f, a[0], a[1]) == fwd(f, b[0], b[1])
    f = fixtures['degenerate_zero_scale']
    a, b = sr['zero_collision']['a'], sr['zero_collision']['b']
    ok8 = ok8 and fwd(f, a[0], a[1]) == fwd(f, b[0], b[1])
    rec('correct', 'C8_singular_rejection', ok8,
        'both degenerate fixtures rejected (no finite inverse); both collisions confirmed')

    # C9 near-singular: invertible but scale-relative margin below 1e-5
    ns = cc['near_singular_stability']
    gt = fixtures[ns['fixture']]
    d = det2(gt)
    margin = abs(d) / (abs(gt[1] * gt[5]) + abs(gt[2] * gt[4]))
    ok9 = close(margin, ns['scale_relative_margin'], ns['margin_tol']) and margin < ns['margin_expect_below'] \
        and inv(gt, 1.999999, 1.999999) is not None
    rec('correct', 'C9_near_singular_margin', ok9,
        'det=%.6g invertible but scale-relative margin=%.6g < %g (unstable)'
        % (d, margin, ns['margin_expect_below']))

    # W1 corner-center conflation must be detected
    w1 = wc['corner_center_conflation']
    detected = []
    for fid in w1['fixtures']:
        gt = fixtures[fid]
        wrong = fwd(gt, 0.0, 0.0)
        exp = fwd(gt, 0.5, 0.5)
        if not pair_close(wrong, exp, 1e-12):
            detected.append(fid)
    rec('wrong', 'W1_corner_center_conflation_detected', len(detected) == len(w1['fixtures']),
        'fwd(0,0)!=fwd(0.5,0.5) detected on %s' % detected)

    # W2 row/col swap (transposed 2x2 block) must be detected on rotated/sheared
    w2 = wc['rowcol_swap_transpose']
    detected, invisible = [], []
    for fid in w2['fixtures_must_detect'] + w2['fixtures_expected_invisible']:
        gt = fixtures[fid]
        gtt = [gt[0], gt[1], gt[4], gt[3], gt[2], gt[5]]
        q = queries[3]
        if pair_close(fwd(gtt, q['pixel'], q['line']), fwd(gt, q['pixel'], q['line']), 1e-9):
            invisible.append(fid)
        else:
            detected.append(fid)
    ip = w2['inverse_probe']
    gt = fixtures[ip['fixture']]
    gtt = [gt[0], gt[1], gt[4], gt[3], gt[2], gt[5]]
    got = inv(gtt, ip['arg'][0], ip['arg'][1])
    inv_detected = not pair_close(got, tuple(ip['oracle_expect']), ip['tol'])
    ok = all(f in detected for f in w2['fixtures_must_detect']) and inv_detected \
        and all(f in invisible for f in w2['fixtures_expected_invisible'])
    rec('wrong', 'W2_rowcol_swap_detected', ok,
        'transpose detected on %s; transposed inverse gave (%.4f,%.4f) vs oracle %s; invisible on north-up %s (expected)'
        % (detected, got[0], got[1], list(ip['oracle_expect']), invisible))

    # W3 north-up assumption (force GT2=GT4=0) must be detected
    w3 = wc['north_up_assumption']
    detected = []
    for fid, pt in w3['probe_points'].items():
        gt = fixtures[fid]
        gtn = [gt[0], gt[1], 0.0, gt[3], 0.0, gt[5]]
        if not pair_close(fwd(gtn, pt[0], pt[1]), fwd(gt, pt[0], pt[1]), 1e-9):
            detected.append(fid)
    rec('wrong', 'W3_north_up_assumption_detected', len(detected) == len(w3['probe_points']),
        'forcing GT2=GT4=0 detected on %s' % detected)

    # W4 self-consistent wrong pair roundtrips cleanly yet violates oracles
    w4 = wc['selfconsistent_wrong_roundtrip']
    max_rt = 0.0
    violates = []
    for fid, gt in fixtures.items():
        gtt = [gt[0], gt[1], gt[4], gt[3], gt[2], gt[5]]
        for q in queries:
            x, y = fwd(gtt, q['pixel'], q['line'])
            back = inv(gtt, x, y)
            if back is None:
                continue
            x2, y2 = fwd(gtt, back[0], back[1])
            max_rt = max(max_rt, abs(x2 - x), abs(y2 - y))
        if fid in w4['must_violate_oracle_on']:
            hp = [h for h in cc['hand_points'] if h['fixture'] == fid and h['op'] == 'fwd'][0]
            if not pair_close(fwd(gtt, hp['arg'][0], hp['arg'][1]), tuple(hp['expect']), hp['tol']):
                violates.append(fid)
    rec('wrong', 'W4_roundtrip_insufficient_documented', max_rt <= w4['roundtrip_tol'] and len(violates) == 2,
        'wrong transposed pair roundtrips to max err %.3g (roundtrip-only check PASSES) yet violates hand oracles on %s'
        % (max_rt, violates))

    all_ok = all(r['status'] == 'pass' for r in results['correct']) and \
        all(r['status'] == 'pass' for r in results['wrong'])
    results['summary'] = {
        'all_correct_controls_pass': all(r['status'] == 'pass' for r in results['correct']),
        'all_wrong_controls_detected': all(r['status'] == 'pass' for r in results['wrong']),
        'witness_scientifically_valid': all_ok,
        'n_correct': len(results['correct']),
        'n_wrong': len(results['wrong']),
    }
    print(json.dumps(results, separators=(',', ':')))
    sys.exit(0 if all_ok else 3)


if __name__ == '__main__':
    main()
