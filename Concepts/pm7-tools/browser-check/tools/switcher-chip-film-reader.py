#!/usr/bin/env python3
"""Read the switcher chip's painted edges in every film frame (FO-227 / FO-231 / FO-234, switcher-carry-steps).

    switcher-chip-film-reader.py --film run.mp4 --run <run folder> --dump <switcher-carry-steps --set dump= file> [--out f.json]

For each cell of the dump (look x strip) it takes the film from just before the cell's first press to after its last,
cropped to the strip's band (its items' boxes, 10 px above and below for the hop's lift), finds the chip's fill colour
(the commonest colour inside the chip box at rest before the first press) and in every frame the leftmost and rightmost
column (rail and Home strips are horizontal; topmost and bottommost row for a vertical one) holding at least 3 pixels of
that colour. A one-frame step is a frame whose edge move differs from the mean of its neighbours' moves by more than
--step px (default 4) on an edge, outside rest-to-rest. Frames are numbered from the film's first frame (ffmpeg's n),
and each cell maps the page clock to film time by the run's marks (summary.json 'at', +-0.05 s) and the dump's
pageMarks, joined in order. Needs ffmpeg (pure Python otherwise). Decoding only; it records nothing.
"""
import argparse, json, subprocess, sys
from collections import Counter

ap = argparse.ArgumentParser()
ap.add_argument('--film', required=True); ap.add_argument('--run', required=True); ap.add_argument('--dump', required=True)
ap.add_argument('--out'); ap.add_argument('--step', type=float, default=4.0); ap.add_argument('--fps', type=float, default=60.0)
a = ap.parse_args()

summ = json.load(open(a.run.rstrip('/') + '/summary.json'))
marks = summ.get('marks') or []
dump = json.load(open(a.dump))
cells, pmarks = dump['cells'], dump.get('pageMarks', [])
if len(marks) != len(pmarks):
    print(f'warning: {len(marks)} film marks, {len(pmarks)} page marks; joined by label order', file=sys.stderr)
pairs = [(p['pt'], m['at']) for p, m in zip(pmarks, marks) if p['label'] == m['label']]
SEL = {'rail': '#sidePanelSlot .pm-segtab', 'home': '.pmw-strip[data-tsm]', 'usage': '#pmuNav', 'settings': '#pm-settings-root .rail-scroll'}

def film_t(pt):
    best = min(pairs, key=lambda q: abs(q[0] - pt))
    return best[1] + (pt - best[0]) / 1000.0

def frames(t0, t1, crop):
    x, y, w, h = crop
    cmd = ['ffmpeg', '-v', 'error', '-ss', f'{max(0, t0):.3f}', '-i', a.film, '-t', f'{t1 - t0:.3f}', '-vf', f'crop={w}:{h}:{x}:{y}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    n = len(raw) // (w * h * 3)
    return [raw[i * w * h * 3:(i + 1) * w * h * 3] for i in range(n)]

out = []
for c in cells:
    sel = SEL[c['group']]
    rows = [r for r in c['smp']['rows'] if r['k'] == 'task' and sel in r['s'] and r['s'][sel]['items']]
    if not rows: continue
    its = rows[0]['s'][sel]['items']
    x0 = int(min(b[0] for b in its)) - 12; x1 = int(max(b[0] + b[2] for b in its)) + 12
    y0 = int(min(b[1] for b in its)) - 10; y1 = int(max(b[1] + b[3] for b in its)) + 6
    vertical = (max(b[1] for b in its) - min(b[1] for b in its)) > (max(b[0] for b in its) - min(b[0] for b in its))
    # (items parked off screen are left out; ffmpeg rounds a 4:2:0 crop to even sizes, so the crop is even already)
    its = [b for b in its if b[0] + b[2] > 0 and b[1] + b[3] > 0]
    x0 = int(min(b[0] for b in its)) - 12; x1 = int(max(b[0] + b[2] for b in its)) + 12
    ev = lambda v: v - (v % 2)
    crop = (ev(max(0, x0)), ev(max(0, y0)), ev(x1 - ev(max(0, x0)) + 1), ev(y1 - ev(max(0, y0)) + 1))
    cm = [p for p in pmarks if p['label'].startswith(c['tag'] + ' ')]
    if not cm: continue
    t0 = film_t(cm[0]['pt']) - 0.4; t1 = film_t(cm[-1]['pt']) + 1.6
    F = frames(t0, t1, crop)
    n0 = round(max(0, t0) * a.fps)
    # the chip's fill: the commonest colour inside the chip box at rest before the first press
    rest = [r for r in rows if r['now'] < cm[0]['pt'] and r['s'][sel]['chip']]
    cb = rest[-1]['s'][sel]['chip'] if rest else None
    if not cb: continue
    W, H = crop[2], crop[3]
    bx, by = int(cb[0] - crop[0]) + 2, int(cb[1] - crop[1]) + 2
    px = lambda fr, x, y: fr[(y * W + x) * 3:(y * W + x) * 3 + 3]
    cnt = Counter(bytes(px(F[0], x, y)) for y in range(by, by + int(cb[3]) - 4) for x in range(bx, bx + int(cb[2]) - 4))
    fill = list(cnt.most_common(1)[0][0])
    near = lambda q: abs(q[0] - fill[0]) <= 24 and abs(q[1] - fill[1]) <= 24 and abs(q[2] - fill[2]) <= 24
    per = []
    for fr in F:
        tally = [0] * (H if vertical else W)
        for y in range(H):
            row = fr[y * W * 3:(y + 1) * W * 3]
            for x in range(W):
                if near(row[x * 3:x * 3 + 3]): tally[y if vertical else x] += 1
        idx = [i for i, v in enumerate(tally) if v >= 3]
        per.append((idx[0], idx[-1]) if idx else None)
    steps = []
    for i in range(1, len(per) - 1):
        p, q, r = per[i - 1], per[i], per[i + 1]
        if not (p and q and r): continue
        for k in (0, 1):
            d1, d2 = q[k] - p[k], r[k] - q[k]
            # the move into frame i against its neighbours' (the move before it and the move after it)
            dp = p[k] - per[i - 2][k] if i >= 2 and per[i - 2] else d2
            ex = abs(d1 - (dp + d2) / 2)
            starts = abs(dp) <= 2 and d1 * d2 > 0   # leaving rest: the hop's first frames are its fastest
            stops = abs(d2) <= 2 and dp * d1 > 0     # arriving at rest
            back = d1 * d2 < 0 and d1 * dp < 0 and min(abs(d1), abs(d2)) >= 3   # one frame against the way it goes
            if (ex > a.step and abs(d1) > a.step and not starts and not stops) or back:
                steps.append({'frame': n0 + i, 'edge': 'left' if k == 0 else 'right', 'moves': [dp, d1, d2], 'excess': round(ex, 1)})
    out.append({'tag': c['tag'], 'crop': crop, 'vertical': vertical, 'fill': fill, 'firstFrame': n0, 'frames': len(F),
                'edges': [{'frame': n0 + i, 'e': e} for i, e in enumerate(per)], 'steps': steps})
    print(f"{c['tag']:<46} frames {n0}-{n0 + len(F) - 1} fill {fill} chip seen {sum(1 for e in per if e)}/{len(per)} one-frame steps {len(steps)}" + ''.join(f"\n    F{s['frame']} {s['edge']} moves {s['moves']} (excess {s['excess']} px)" for s in steps[:12]))
if a.out: json.dump(out, open(a.out, 'w'))
