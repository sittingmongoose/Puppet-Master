"""NieR Mode scene art: draws the six ink panoramas in src/settings/nier/scenes/*.svg.

Original compositions that evoke places in NieR: Automata (no game art, screenshots or assets were traced or copied).
Each scene is a wide bottom-anchored panorama (viewBox 0 0 1600 560) in one ink, `currentColor`: strokes with sparse
hatching and a few solid silhouettes, dense at the ground and thinning out upward. Plain paths and rects only (no
filters, masks, clip paths, gradients or raster images), so each maps onto Slint `Path` elements one to one; tilted
objects use a group `rotate()`, which is Slint's `transform-rotation`.

The drawing is seeded and deterministic: `python3 tools/nier_scene_art.py --write` redraws every SVG byte for byte,
`--check` fails when an SVG differs from what this file draws, `--only city,park` limits either. The SVG files are
what the build reads (tools/nier_scenes.py composes them into kit.d/21-nier-scenes.js); this file is how they were
drawn, so a change to a scene is made here and redrawn.
"""
from __future__ import annotations

import argparse
import math
import random
import re
import sys
from pathlib import Path

PKG = Path(__file__).resolve().parent.parent
OUT = PKG / 'src' / 'settings' / 'nier' / 'scenes'
W, H = 1600, 560


# ---------- numbers and path strings -----------------------------------------------------------------------------------
PREC = 0


def n(v: float) -> str:
    """A coordinate rounded to PREC decimals (whole pixels by default) with no trailing zeros."""
    r = round(v, PREC)
    if r == int(r):
        return str(int(r))
    s = f'{r:.1f}'
    return s.replace('0.', '.', 1) if s.startswith('0.') else s.replace('-0.', '-.', 1)


def pts(ps) -> str:
    return ' '.join(f'{n(x)} {n(y)}' for x, y in ps)


def poly(ps, close=True) -> str:
    if not ps:
        return ''
    head = f'M{n(ps[0][0])} {n(ps[0][1])}'
    body = ''.join(f'L{n(x)} {n(y)}' for x, y in ps[1:])
    return head + body + ('Z' if close else '')


def line(x1, y1, x2, y2) -> str:
    return f'M{n(x1)} {n(y1)}L{n(x2)} {n(y2)}'


def rline(x1, y1, x2, y2) -> str:
    """A segment as a move and a relative step (the rounded end point is kept exact)."""
    a, b = round(x1, PREC), round(y1, PREC)
    return f'M{n(a)} {n(b)}l{n(round(x2, PREC) - a)} {n(round(y2, PREC) - b)}'


def hline(x, y, length) -> str:
    return f'M{n(x)} {n(y)}h{n(length)}'


def vline(x, y, length) -> str:
    return f'M{n(x)} {n(y)}v{n(length)}'


def rect(x, y, w, h) -> str:
    return f'M{n(x)} {n(y)}h{n(w)}v{n(h)}h{n(-w)}Z'


def rot(p, c, deg):
    a = math.radians(deg)
    x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + x * math.cos(a) - y * math.sin(a), c[1] + x * math.sin(a) + y * math.cos(a))


def circle_path(cx, cy, r) -> str:
    return f'M{n(cx - r)} {n(cy)}a{n(r)} {n(r)} 0 1 0 {n(2 * r)} 0a{n(r)} {n(r)} 0 1 0 {n(-2 * r)} 0Z'


def arc_pts(cx, cy, rx, ry, a0, a1, steps):
    return [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / steps)),
             cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / steps))) for i in range(steps + 1)]


def smooth(ps, close=False) -> str:
    """A Catmull-Rom curve through the points, as relative cubic Beziers."""
    if len(ps) < 3:
        return poly(ps, close)
    P = ps + ps[:3] if close else [ps[0]] + ps + [ps[-1]]
    ps = [(round(x, PREC), round(y, PREC)) for x, y in P]
    out = f'M{n(ps[1][0])} {n(ps[1][1])}c'
    parts = []
    for i in range(1, len(ps) - 2):
        p0, p1, p2, p3 = ps[i - 1], ps[i], ps[i + 1], ps[i + 2]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6 - p1[0], p1[1] + (p2[1] - p0[1]) / 6 - p1[1])
        c2 = (p2[0] - (p3[0] - p1[0]) / 6 - p1[0], p2[1] - (p3[1] - p1[1]) / 6 - p1[1])
        parts.append(f'{n(c1[0])} {n(c1[1])} {n(c2[0])} {n(c2[1])} {n(p2[0] - p1[0])} {n(p2[1] - p1[1])}')
    return (out + ' '.join(parts)).replace(' -', '-') + ('Z' if close else '')


# ---------- clipping lines to polygons (hatching) -----------------------------------------------------------------------
def clip_segments(poly_pts, p, d):
    """Parameters t where the infinite line p + t*d crosses the polygon, sorted: pairs are inside spans."""
    ts = []
    m = len(poly_pts)
    for i in range(m):
        a, b = poly_pts[i], poly_pts[(i + 1) % m]
        ex, ey = b[0] - a[0], b[1] - a[1]
        den = d[0] * ey - d[1] * ex
        if abs(den) < 1e-9:
            continue
        t = ((a[0] - p[0]) * ey - (a[1] - p[1]) * ex) / den
        u = ((a[0] - p[0]) * d[1] - (a[1] - p[1]) * d[0]) / den
        if 0 <= u < 1:
            ts.append(t)
    ts.sort()
    return [(ts[i], ts[i + 1]) for i in range(0, len(ts) - 1, 2)]


def hatch(poly_pts, angle, gap, rng=None, jitter=0.0, keep=1.0, inset=0.0, dash=None) -> str:
    """Parallel strokes at `angle` degrees, `gap` apart, inside the polygon; `keep` drops a share at random, `inset`
    shortens each end, `dash` = (on, off) breaks each stroke."""
    a = math.radians(angle)
    d = (math.cos(a), math.sin(a))
    nrm = (-d[1], d[0])
    xs = [q[0] for q in poly_pts]
    ys = [q[1] for q in poly_pts]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    R = math.hypot(max(xs) - min(xs), max(ys) - min(ys)) / 2 + 2
    out = []
    k = -R
    while k <= R:
        off = k + (rng.uniform(-jitter, jitter) if rng and jitter else 0)
        p = (cx + nrm[0] * off, cy + nrm[1] * off)
        for t0, t1 in clip_segments(poly_pts, p, d):
            t0, t1 = t0 + inset, t1 - inset
            if t1 - t0 < 2:
                continue
            if rng and keep < 1 and rng.random() > keep:
                continue
            if dash:
                t = t0
                while t < t1:
                    e = min(t + dash[0] * (0.6 + 0.8 * (rng.random() if rng else 0.5)), t1)
                    out.append(rline(p[0] + d[0] * t, p[1] + d[1] * t, p[0] + d[0] * e, p[1] + d[1] * e))
                    t = e + dash[1] * (0.5 + (rng.random() if rng else 0.5))
            else:
                out.append(rline(p[0] + d[0] * t0, p[1] + d[1] * t0, p[0] + d[0] * t1, p[1] + d[1] * t1))
        k += gap
    return ''.join(out)


# ---------- the document ------------------------------------------------------------------------------------------------
def num(v: float) -> str:
    """An attribute number: up to two decimals, no leading zero, no trailing zeros."""
    s = f'{v:.2f}'.rstrip('0').rstrip('.')
    return s[1:] if s.startswith('0.') else s


MIN_W = .7  # the thinnest line drawn: finer strokes read fainter at 1x than at 2x, so lightness comes from alpha instead


class Scene:
    """Paths in drawing order (back to front). Strokes inherit the root's ink and width; `f` paths are solid ink; `k`
    paths are stroked and filled with the ground colour (class k), so a nearer object hides what lies behind it.
    Lightness is stroke-opacity / fill-opacity on the path (never group opacity, so a knock-out stays opaque).
    `plane(a)` sets the alpha of a depth plane (far .42, mid .72, near 1) for everything drawn until the next call."""

    def __init__(self, key: str, title: str):
        self.key, self.title = key, title
        self.items: list[str] = []
        self.depth = 1.0

    def plane(self, a: float):
        self.depth = a

    def _a(self, w=None, op=None, cls=None, fill=False):
        a = ''
        if cls:
            a += f' class="{cls}"'
        if fill:
            a += ' fill="currentColor" stroke="none"'
        alpha = (1.0 if op is None else op) * self.depth
        if w is not None and w < MIN_W:
            alpha *= w / MIN_W
            w = MIN_W
        if w is not None:
            a += f' stroke-width="{num(w)}"'
        if alpha < .995:
            a += f' {"fill" if fill else "stroke"}-opacity="{num(max(alpha, .05))}"'
        return a

    def s(self, d: str, w=None, op=None, cls=None):
        """A stroked path; w is the stroke width in screen pixels (the layer draws non-scaling strokes)."""
        if d:
            self.items.append(f'<path{self._a(w, op, cls)} d="{d}"/>')

    def f(self, d: str, op=None, cls=None):
        """A solid ink shape (kept small: a solid mass reads as a blob at low opacity, and as the brightest thing in
        dark mode)."""
        if d:
            self.items.append(f'<path{self._a(None, op, cls, fill=True)} d="{d}"/>')

    def k(self, d: str, w=None, op=None, stroke=True):
        """An outline filled with the ground colour, hiding what is behind it (stroke=False: the fill alone)."""
        if d:
            self.items.append(f'<path{self._a(w, op, "k")}{"" if stroke else " stroke=\"none\""} d="{d}"/>')

    def kgroup(self, ds, w=None, op=None):
        """Several ground-filled outlines that share their look, drawn in order inside one group."""
        ds = [d for d in ds if d]
        if ds:
            self.items.append(f'<g{self._a(w, op, "k")}>' + ''.join(f'<path d="{d}"/>' for d in ds) + '</g>')

    def open(self, attrs: str):
        self.items.append(f'<g {attrs}>')

    def close(self):
        self.items.append('</g>')

    def svg(self) -> str:
        head = (f'<svg xmlns="http://www.w3.org/2000/svg" class="o55-nier-art" viewBox="0 0 {W} {H}" '
                f'preserveAspectRatio="xMidYMax slice" fill="none" stroke="currentColor" stroke-width="1.15" '
                f'stroke-linecap="round" stroke-linejoin="round" data-scene="{self.key}">')
        return head + f'<title>{self.title}</title>\n' + '\n'.join(self.items) + '\n</svg>\n'


# ---------- shared motifs -----------------------------------------------------------------------------------------------
def leaf_ticks(ps, rng, every=7, size=3.2, keep=.8):
    """Small alternating leaf strokes along a polyline (vines, creepers)."""
    out = []
    side = 1
    acc = 0.0
    for (x0, y0), (x1, y1) in zip(ps, ps[1:]):
        seg = math.hypot(x1 - x0, y1 - y0)
        if seg == 0:
            continue
        ux, uy = (x1 - x0) / seg, (y1 - y0) / seg
        t = every - acc
        while t < seg:
            if rng.random() < keep:
                x, y = x0 + ux * t, y0 + uy * t
                s = size * (0.7 + 0.6 * rng.random())
                # leaf: short stroke angled away from the stem, drooping
                lx, ly = -uy * side, ux * side
                out.append(f'M{n(x)} {n(y)}q{n(lx * s * .6 + ux * s * .2)} {n(ly * s * .6 + uy * s * .2)} {n(lx * s + ux * s * .6)} {n(ly * s + uy * s * .6)}')
            side = -side
            t += every
        acc = (acc + seg) % every
    return ''.join(out)


def vine(x, y, length, rng, sway=6, step=16):
    """A hanging vine from (x, y): a wavering stem and its leaf ticks."""
    ps = []
    ph = rng.random() * 6.28
    k = 0
    yy = y
    while yy < y + length:
        ps.append((x + math.sin(ph + k * .95) * sway * (0.4 + (yy - y) / max(length, 1)), yy))
        yy += step
        k += 1
    ps.append((x + math.sin(ph + k * .95) * sway, y + length))
    return smooth(ps), leaf_ticks(ps, rng, every=7.5, size=3.6, keep=.7)


def crown_pts(cx, cy, rx, ry, rng, lumps=None):
    """The rim of a clumpy crown: an ellipse whose radius swells and dips in a few big lobes."""
    lumps = lumps or rng.randint(3, 5)
    ph = [rng.uniform(0, 6.28) for _ in range(3)]
    ps = []
    steps = max(10, int((rx + ry) / 4))
    for i in range(steps):
        a = 2 * math.pi * i / steps
        k = 1 + .16 * math.sin(lumps * a + ph[0]) + .07 * math.sin((lumps * 2 + 1) * a + ph[1])
        if math.sin(a) > .35:
            k *= .92 + .08 * math.cos(3 * a + ph[2])  # a flatter underside
        ps.append((cx + rx * k * math.cos(a), cy + ry * k * math.sin(a)))
    return ps


def canopy(cx, cy, rx, ry, rng, bumps=None, top_only=False, ps=None):
    """A leafy crown: small scallops of varying size along a clumpy rim."""
    ps = ps or crown_pts(cx, cy, rx, ry, rng)
    out = f'M{n(ps[0][0])} {n(ps[0][1])}'
    for i in range(len(ps)):
        a, b = ps[i], ps[(i + 1) % len(ps)]
        mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        ox, oy = mx - cx, my - cy
        L = math.hypot(ox, oy) or 1
        bulge = math.hypot(b[0] - a[0], b[1] - a[1]) * rng.uniform(.3, .65)
        out += f'Q{n(mx + ox / L * bulge)} {n(my + oy / L * bulge)} {n(b[0])} {n(b[1])}'
    return out + 'Z'


def scallop_line(x0, x1, y, rng, r=(6, 12), up=True, jitter=4):
    """An open run of bumps along y (a canopy edge, bushes, cloud tops)."""
    out = f'M{n(x0)} {n(y)}'
    x = x0
    while x < x1:
        w = rng.uniform(*r) * 2
        nx = min(x + w, x1)
        yy = y + rng.uniform(-jitter, jitter)
        h = (nx - x) * rng.uniform(.45, .7) * (-1 if up else 1)
        out += f'Q{n((x + nx) / 2)} {n(yy + h)} {n(nx)} {n(yy)}'
        x = nx
    return out


def tuft(x, y, rng, h=7, blades=4):
    out = ''
    for i in range(blades):
        dx = rng.uniform(-3, 3)
        hh = h * rng.uniform(.6, 1.2)
        out += f'M{n(x + i * 1.6 - blades * .8)} {n(y)}q{n(dx * .3)} {n(-hh * .6)} {n(dx)} {n(-hh)}'
    return out


def grass_run(x0, x1, y, rng, density=.25, h=7):
    out = ''
    x = x0
    while x < x1:
        if rng.random() < density:
            out += tuft(x, y + rng.uniform(-1, 1), rng, h=h * rng.uniform(.7, 1.3), blades=rng.randint(2, 5))
        x += rng.uniform(5, 12)
    return out


def rubble(x0, x1, y, rng, count=10, size=(3, 9)):
    """Broken concrete along the ground: returns (outlines, a few solid chunks)."""
    lines_, solids = '', ''
    for _ in range(count):
        cx = rng.uniform(x0, x1)
        s = rng.uniform(*size)
        k = rng.randint(4, 6)
        ps = []
        for i in range(k):
            a = math.pi * (1 + i / (k - 1))  # upper half polygon sitting on the ground
            r = s * rng.uniform(.6, 1.1)
            ps.append((cx + math.cos(a) * r * 1.3, y - 0.2 + math.sin(a) * r * .8 * (1 if i not in (0, k - 1) else 0)))
        if rng.random() < .3:
            solids += poly(ps)
        else:
            lines_ += poly(ps)
    return lines_, solids


def birds(spots, rng, size=5):
    out = ''
    for x, y in spots:
        s = size * rng.uniform(.7, 1.2)
        tilt = rng.uniform(-1.5, 1.5)
        out += f'M{n(x - s)} {n(y - s * .25 + tilt)}q{n(s * .55)} {n(-s * .55)} {n(s)} {n(s * .25 - tilt)}q{n(s * .45)} {n(-s * .8 - tilt)} {n(s)} {n(-s * .3)}'
    return out


def rebar(x, y, rng, count=3, length=10, down=True):
    out = ''
    for _ in range(count):
        dx = rng.uniform(-length, length) * .5
        dy = length * rng.uniform(.5, 1.1) * (1 if down else -1)
        out += f'M{n(x + rng.uniform(-3, 3))} {n(y)}q{n(dx * .3)} {n(dy * .6)} {n(dx)} {n(dy)}'
    return out


# ---------- a building ---------------------------------------------------------------------------------------------------
def tower(sc: Scene, rng, x, base, w, h, *, tilt=0.0, broken=True, floors=20, cols=None, clusters=2, sills=.22,
          floor_every=3, side_hatch=True, skeleton_from=None, bite=None, far=False, rebars=True):
    """A concrete tower standing on `base`, `w` wide and `h` tall, rotated `tilt` degrees about its base centre, drawn
    as a ground-filled outline (it hides what stands behind it). Every few floors a faint slab line; a few scattered
    sills; one or two clusters of blown-out windows in solid ink; the shaded side hatched; a broken crown jagged, with
    rebar. `skeleton_from` (0..1) strips the walls above that height to columns and slabs; `bite` = (side, y0, y1,
    depth) tears a chunk out of one side and shows the slabs inside. Returns the rotated crown points."""
    cx = x + w / 2
    top = base - h
    fh = h / floors
    if broken:
        k = rng.randint(4, 6)
        jag = [(x + w * i / k + (rng.uniform(-w / k / 4, w / k / 4) if 0 < i < k else 0), top + rng.uniform(0, fh * 2.4)) for i in range(k + 1)]
        jag[0] = (x, top + rng.uniform(fh * .8, fh * 2.5))
        jag[-1] = (x + w, top + rng.uniform(0, fh * 1.4))
    else:
        jag = [(x, top), (x + w, top)]
    left, right = [(x, base)], [(x + w, base)]
    bite_box = None
    if bite:
        side, by0, by1, depth = bite
        yb0, yb1 = base - h * by1, base - h * by0
        bite_box = (side, yb0, yb1, depth)
        if side == 'r':
            right = [(x + w, base), (x + w, yb1), (x + w - depth * .55, yb1 - fh * .6), (x + w - depth, (yb0 + yb1) / 2 + fh * .3),
                     (x + w - depth * .75, yb0 + fh * .8), (x + w, yb0)]
        else:
            left = [(x, base), (x, yb1), (x + depth * .6, yb1 - fh * .5), (x + depth, (yb0 + yb1) / 2), (x + depth * .8, yb0 + fh * .7), (x, yb0)]
    skel_y = base - h * skeleton_from if skeleton_from else None
    if skel_y:
        # walls stop at the skeleton line; above it only the frame stands
        jag = [(x, skel_y), (x + w, skel_y)]
    outline = left + jag + list(reversed(right))
    sc.open(f'transform="rotate({num(tilt)} {n(cx)} {n(base)})"' if tilt else 'data-part="tower"')
    sc.k(poly(outline), w=.85 if far else None)
    cols = cols or max(3, int(w / 14))
    cw = w / cols
    crown = lambda: max(py for (_, py) in jag)
    # slab lines every few floors, broken in places
    slab = ''
    for fi in range(floor_every, floors, floor_every):
        yy = base - fi * fh
        if yy < crown() + fh:
            break
        xa = x + 3
        while xa < x + w - 6:
            seg = rng.uniform(w * .25, w * .9)
            xb = min(xa + seg, x + w - 3)
            if bite_box and bite_box[1] < yy < bite_box[2]:
                if bite_box[0] == 'r':
                    xb = min(xb, x + w - bite_box[3] - 3)
                else:
                    xa = max(xa, x + bite_box[3] + 3)
            if xb - xa > 4:
                slab += hline(xa, yy, xb - xa)
            xa = max(xa, xb) + rng.uniform(6, 22)
    sc.s(slab, w=.7, op=.75)
    # scattered sills and clusters of blown-out windows
    marks, voids = '', ''
    for fi in range(1, floors):
        yy = base - fi * fh
        if yy < crown() + fh * 1.2:
            break
        for ci in range(cols):
            if rng.random() < sills * (.6 if far else 1):
                marks += hline(x + ci * cw + cw * .25, yy - fh * .2, cw * .5)
    for _ in range(clusters):
        c0, r0 = rng.randrange(cols), rng.randint(2, max(3, floors - 5))
        for dc in range(rng.randint(1, 2)):
            for dr in range(rng.randint(1, 3)):
                if rng.random() < .6 and c0 + dc < cols:
                    yy = base - (r0 + dr) * fh
                    if yy - fh * .7 > crown():
                        voids += rect(x + (c0 + dc) * cw + cw * .3, yy - fh * .64, cw * .4, fh * .38)
    sc.s(marks, w=.7, op=.7)
    sc.f(voids, op=.85 if not far else .5)
    # the bite: slabs inside the torn corner
    if bite_box:
        side, yb0, yb1, depth = bite_box
        ins = ''
        yy = yb0 + fh
        while yy < yb1 - 2:
            if side == 'r':
                ins += hline(x + w - depth * .8, yy, depth * .8 + rng.uniform(-2, 6))
            else:
                ins += hline(x - rng.uniform(-2, 6), yy, depth * .85)
            yy += fh * 1.3
        sc.s(ins, w=.8)
        sc.s(rebar(x + w if side == 'r' else x, yb1 - 2, rng, 2, 10) if rebars else '', w=.7)
    # a skeleton crown: columns and slabs, no walls
    if skel_y:
        sk = ''
        for ci in range(cols + 1):
            if 0 < ci < cols and rng.random() < .3:
                continue
            xx = x + ci * cw
            sk += line(xx, skel_y, xx, top + rng.uniform(0, fh * 4))
        yy = skel_y - fh * 1.4
        while yy > top + fh * 1.5:
            a = rng.uniform(x, x + w)
            sk += line(x, yy, max(x, a - rng.uniform(4, 16)), yy)
            if rng.random() < .55:
                sk += line(min(x + w, a + rng.uniform(4, 16)), yy + rng.uniform(0, 3), x + w, yy)
            yy -= fh * 1.4
        sc.s(sk)
    # the shaded side
    if side_hatch:
        ty = jag[-1][1] if not skel_y else skel_y
        sh = [(x + w * .82, base), (x + w, base), (x + w, ty + 3), (x + w * .82, ty + 6)]
        sc.s(hatch(sh, 75, 5 if not far else 7, rng, jitter=.8, keep=.9, inset=1.5), w=.65, op=.75)
    if broken and not far and not skel_y and rebars:
        rb = ''
        for (px, py) in jag[1:-1]:
            if rng.random() < .5:
                rb += rebar(px, py, rng, count=2, length=8, down=False)
        sc.s(rb, w=.7)
    sc.close()
    return [rot(p, (cx, base), tilt) for p in jag], (cx, base)


def hang_vines(sc, rng, anchors, span, sway=(3, 7), w=.85):
    vs, ls = '', ''
    for (px, py) in anchors:
        stem, leaves = vine(px, py, rng.uniform(*span), rng, sway=rng.uniform(*sway))
        vs += stem
        ls += leaves
    sc.s(vs, w=w)
    sc.s(ls, w=.75)


def along(jag, rng, count):
    """Random points along a crown polyline."""
    out = []
    for _ in range(count):
        i = rng.randrange(len(jag) - 1)
        t = rng.random()
        out.append((jag[i][0] + (jag[i + 1][0] - jag[i][0]) * t, jag[i][1] + (jag[i + 1][1] - jag[i][1]) * t + 2))
    return out


def tree(sc, rng, x, g, h, r, solid=False, lean=0.0):
    """A broadleaf tree: a clumpy crown with its underside hatched in shadow, over a forked trunk."""
    top = (x + lean, g - h)
    rim = crown_pts(top[0], top[1], r * 1.2, r * .78, rng)
    side = crown_pts(top[0] + r * .95 * (1 if rng.random() < .5 else -1), top[1] + r * .38, r * .55, r * .42, rng)
    trunk = (f'M{n(x - 3)} {n(g)}C{n(x - 2)} {n(g - h * .4)} {n(x - 2 + lean * .6)} {n(g - h * .6)} {n(top[0] - r * .35)} {n(top[1] + r * .5)}'
             f'M{n(x + 3)} {n(g)}C{n(x + 2)} {n(g - h * .45)} {n(x + 2 + lean * .6)} {n(g - h * .6)} {n(top[0] + r * .4)} {n(top[1] + r * .45)}')
    if solid:
        sc.f(canopy(0, 0, 0, 0, rng, ps=side) + canopy(top[0], top[1], 0, 0, rng, ps=rim)
             + poly([(x - 3.5, g), (x - 1 + lean * .7, g - h * .7), (x + 1 + lean * .7, g - h * .7), (x + 3.5, g)]))
        return
    sc.s(trunk, w=.95)
    sc.k(canopy(0, 0, 0, 0, rng, ps=side), w=.9)
    sc.k(canopy(top[0], top[1], 0, 0, rng, ps=rim))
    under = [p for p in rim if p[1] > top[1] + r * .12]
    if len(under) > 2:
        sc.s(hatch(under, 118, 4.2, rng, keep=.85, inset=2.5), w=.6, op=.8)


def bush(sc, rng, x, g, w, h):
    """A low mass of shrubs at a wall's foot, ground-filled, its underside hatched."""
    rim = crown_pts(x, g - h * .45, w / 2, h * .6, rng, lumps=rng.randint(3, 6))
    rim = [(px, min(py, g)) for px, py in rim]
    sc.k(canopy(x, g - h * .45, w / 2, h * .6, rng, ps=rim), w=.85)
    low = [p for p in rim if p[1] > g - h * .5]
    if len(low) > 2:
        sc.s(hatch(low, 118, 4.5, rng, keep=.8, inset=2), w=.55, op=.75)


def machine(sc, x, g, s=1.0, pose='stand', look=(0, 0), face=1):
    """A small machine lifeform (an original design): a round head with two round eyes over a barrel body on stubby
    legs; pose 'stand' on the ground at g, or 'sit' on a ledge at g with its legs hanging. Drawn as a ground-filled
    silhouette with tiny solid eyes."""
    hd = 7.5 * s
    if pose == 'sit':
        body_b, legs = g, f'M{n(x - 3.5 * s)} {n(g)}l{n(1 * s * face)} {n(9 * s)}M{n(x + 3.5 * s)} {n(g)}l{n(2 * s * face)} {n(8 * s)}'
    else:
        body_b, legs = g - 7 * s, f'M{n(x - 3.8 * s)} {n(g)}v{n(-7.5 * s)}M{n(x + 3.8 * s)} {n(g)}v{n(-7.5 * s)}'
    top = body_b - 14 * s
    body = (f'M{n(x - 8 * s)} {n(body_b)}v{n(-10 * s)}q0 {n(-4 * s)} {n(4 * s)} {n(-4 * s)}h{n(8 * s)}q{n(4 * s)} 0 {n(4 * s)} {n(4 * s)}v{n(10 * s)}Z')
    arms = f'M{n(x - 8 * s)} {n(body_b - 9 * s)}l{n(-3 * s)} {n(6 * s)}M{n(x + 8 * s)} {n(body_b - 9 * s)}l{n(3 * s)} {n(6 * s)}'
    hy = top - hd + 1.5 * s
    sc.s(legs + arms, w=1.6 * s if s > .8 else 1.2)
    sc.k(body + circle_path(x, hy, hd), w=1.0)
    ex, ey = look
    sc.f(circle_path(x - 3 * s + ex * s, hy + ey * s, 1.5 * s) + circle_path(x + 3 * s + ex * s, hy + ey * s, 1.5 * s))
    return hy - hd


def ivy(cx, cy, w, h, rng, n_=40):
    """A patch of creeper on a wall: leaf ticks scattered in a loose oval, thickest at its heart."""
    out = ''
    for _ in range(n_):
        a = rng.uniform(0, 2 * math.pi)
        r = math.sqrt(rng.random())
        x, y = cx + math.cos(a) * w / 2 * r, cy + math.sin(a) * h / 2 * r
        sz = rng.uniform(2.2, 3.8)
        t = rng.uniform(0, 2 * math.pi)
        out += f'M{n(x)} {n(y)}q{n(math.cos(t) * sz * .6 - math.sin(t) * sz * .4)} {n(math.sin(t) * sz * .6 + math.cos(t) * sz * .4)} {n(math.cos(t) * sz)} {n(math.sin(t) * sz)}'
    return out


# =====================================================================================================================
# City Ruins: a street of broken towers, one leaning on its neighbour, a severed elevated highway, the city reclaimed by
# vines and trees.
# =====================================================================================================================
def city() -> Scene:
    sc = Scene('city', 'City Ruins')
    rng = random.Random(9031)
    G = 540

    # 1. the far city: low faint silhouettes, stepped, leaning or snapped, some hatched in vertical haze
    far = ''
    haze = ''
    x = -10
    while x < W:
        w = rng.uniform(34, 86)
        h = rng.uniform(110, 240)
        t = G - 90 - h
        kind = rng.random()
        if kind < .3:      # stepped crown
            s1 = rng.uniform(.3, .6)
            top = [(x, t + 26), (x + w * s1, t + 26), (x + w * s1, t), (x + w, t)]
        elif kind < .6:    # snapped
            top = [(x, t + rng.uniform(10, 30)), (x + w * .35, t + rng.uniform(0, 18)), (x + w * .6, t + rng.uniform(14, 36)), (x + w, t + rng.uniform(0, 10))]
        elif kind < .75:   # a mast on a flat roof
            top = [(x, t), (x + w * .5, t), (x + w * .5, t - 34), (x + w * .5 + 2, t), (x + w, t)]
        else:
            top = [(x, t), (x + w, t)]
        lean = rng.uniform(-5, 5) if rng.random() < .3 else 0
        top = [(px + lean * (G - 60 - py) / 60, py) for px, py in top]
        ps = [(x, G - 60)] + top + [(x + w, G - 60)]
        far += poly(ps)
        if rng.random() < .45:
            haze += hatch(ps, 90, 9, rng, keep=.7, inset=4)
        x += w + rng.uniform(4, 40)
    sc.plane(.42)
    sc.k(far, w=.8)
    sc.s(haze, w=.7, op=.7)

    # 2. back towers, a plane nearer
    sc.plane(.7)
    c_crown, _ = tower(sc, rng, 590, G, 96, 405, tilt=-3, floors=21, skeleton_from=.72, clusters=0)
    d_crown, _ = tower(sc, rng, 868, G, 128, 300, floors=15, bite=('r', .52, .7, 38), clusters=1)
    e_crown, _ = tower(sc, rng, 1060, G, 118, 250, tilt=1.5, floors=12, clusters=1)
    g_crown, _ = tower(sc, rng, 1380, G, 150, 228, floors=11, skeleton_from=.38, clusters=0, side_hatch=False)
    hang_vines(sc, rng, along(c_crown, rng, 2) + along(e_crown, rng, 3) + along(d_crown, rng, 2), (30, 150))
    sc.plane(.86)

    # 3. the elevated highway, broken in two, one span fallen to the street
    deck, dh = 356, 15
    spans = [(150, 626), (872, 1250)]
    piers = ''
    for px in (236, 420, 590, 964, 1172):
        piers += poly([(px - 15, deck + dh + 5), (px + 15, deck + dh + 5), (px + 9, deck + dh + 20), (px + 9, G), (px - 9, G), (px - 9, deck + dh + 20)])
    sc.k(piers)
    sc.s(''.join(hatch([(px + 2, deck + 42), (px + 8, deck + 42), (px + 8, G - 3), (px + 2, G - 3)], 90, 3.2, rng, keep=.9, inset=1)
                 for px in (236, 420, 590, 964, 1172)), w=.6, op=.75)
    deckp = ''
    rail = ''
    shade = ''
    for x0, x1 in spans:
        l = [(x0, deck), (x1, deck), (x1, deck + dh), (x0, deck + dh)]
        if x1 == 626:
            l = [(x0, deck), (x1, deck), (x1 + 7, deck + 5), (x1 + 2, deck + 10), (x1 + 8, deck + dh), (x0, deck + dh)]
        if x0 == 872:
            l = [(x0, deck), (x1, deck), (x1, deck + dh), (x0 - 6, deck + dh), (x0 - 1, deck + 10), (x0 - 7, deck + 5)]
        deckp += poly(l)
        shade += ''.join(hline(x0 + 4, deck + dh + 1.5 + i * 1.7, x1 - x0 - 8) for i in range(3))
        rail += hline(x0, deck - 9, x1 - x0)
        xx = x0 + 6
        while xx < x1:
            rail += vline(xx, deck - 9, 9)
            xx += 18
    sc.k(deckp)
    sc.s(shade, w=.75, op=.8)
    sc.s(rail, w=.75)
    sc.s(rebar(630, deck + dh, rng, 4, 16) + rebar(868, deck + dh, rng, 3, 13), w=.75)
    fallen = [(716, G - 1), (848, deck + 34), (860, deck + 46), (731, G + 3)]
    sc.k(poly(fallen))
    sc.s(hatch(fallen, 22, 5, rng, keep=.85, inset=2), w=.6, op=.7)
    fr = line(713, G - 11, 844, deck + 24)
    for i in range(1, 8):
        t = i / 8
        fr += line(713 + 131 * t, G - 11 + (deck + 24 - G + 11) * t, 716 + 131 * t, G - 1 + (deck + 34 - G + 1) * t)
    sc.s(fr, w=.75)
    sc.s(grass_run(150, 626, deck - 1, rng, density=.2, h=6) + grass_run(872, 1250, deck - 1, rng, density=.2, h=6), w=.75)
    hang_vines(sc, rng, [(rng.uniform(x0 + 10, x1 - 10), deck + dh + 4) for x0, x1 in spans for _ in range(int((x1 - x0) / 70))], (18, 80), sway=(2, 4))

    # 4. front towers: the tall left tower, the one leaning onto its neighbour, the right edge
    # the machine sitting on the broken deck's edge, legs hanging, watching the street
    machine(sc, 598, deck, 1.15, 'sit', look=(-.6, .6), face=-1)
    sc.plane(1)
    b_crown, _ = tower(sc, rng, 270, G, 92, 300, floors=15, clusters=1)
    a_crown, _ = tower(sc, rng, 60, G, 158, 462, tilt=4.5, floors=24, bite=('l', .36, .5, 32), clusters=1)
    f_crown, _ = tower(sc, rng, 1236, G, 100, 432, tilt=-11.5, floors=22, clusters=1, broken=True)
    h_crown, _ = tower(sc, rng, 1520, G, 118, 360, tilt=-1.5, floors=18, clusters=1)
    hang_vines(sc, rng, [(96, 250), (150, 300), (128, 380), (1262, 300), (1288, 360), (1556, 330), (300, 300)], (40, 130), sway=(2, 5))

    # vines from the crowns, a creeper up the leaning tower, trees rooted on the roofs
    hang_vines(sc, rng, along(a_crown, rng, 6), (70, 250))
    hang_vines(sc, rng, along(f_crown, rng, 4), (60, 200))
    hang_vines(sc, rng, along(h_crown, rng, 4) + along(b_crown, rng, 2), (30, 150))
    for crown, at, r in ((a_crown, .45, 18), (e_crown, .35, 14), (h_crown, .55, 15), (b_crown, .7, 10)):
        px, py = crown[int(len(crown) * at)]
        sc.k(canopy(px, py - r * .6, r * 1.2, r * .7, rng, ps=crown_pts(px, py - r * .6, r * 1.2, r * .7, rng)), w=.9)

    # 5. the street: trees, a car, a bent lamp, rubble, grass
    tree(sc, rng, 470, G, 70, 30)
    tree(sc, rng, 1112, G, 84, 34, lean=-6)
    tree(sc, rng, 1346, G, 50, 22)
    tree(sc, rng, 26, G, 58, 26)
    tree(sc, rng, 1478, G, 70, 38, lean=4)
    car = poly([(505, G), (508, G - 14), (522, G - 16), (534, G - 27), (566, G - 27), (578, G - 16), (596, G - 13), (598, G)])
    sc.k(car)
    sc.s(poly([(538, G - 24), (548, G - 24), (548, G - 16), (531, G - 16)]) + poly([(552, G - 24), (563, G - 24), (572, G - 16), (552, G - 16)])
         + circle_path(522, G - 1, 6) + circle_path(583, G - 1, 6), w=.9)
    sc.s(f'M1206 {G}v-92q0-18 16-22l22-5', w=1.1)
    sc.f(poly([(1242, 422), (1256, 419), (1254, 425), (1243, 428)]))
    for bx, bw, bh in ((96, 70, 26), (238, 44, 18), (352, 60, 22), (640, 90, 30), (905, 70, 22), (1030, 56, 20),
                       (1262, 80, 28), (1430, 50, 18), (1560, 90, 30)):
        bush(sc, rng, bx, G, bw, bh)
    machine(sc, 656, G, 1.3, 'stand', look=(1.2, -1.4))
    ln, so = rubble(0, W, G, rng, count=26)
    sc.s(ln, w=.8)
    sc.f(so, op=.9)
    sc.s(line(0, G, W, G), w=.9)
    cracks = ''
    for _ in range(8):
        cx = rng.uniform(40, W - 40)
        cracks += f'M{n(cx)} {n(G + 5)}l{n(rng.uniform(8, 20))} {n(rng.uniform(3, 7))}l{n(rng.uniform(6, 14))} {n(rng.uniform(-2, 5))}'
    sc.s(cracks, w=.75, op=.8)
    sc.s(grass_run(0, W, G, rng, density=.18, h=8), w=.75)

    # 6. the sky: a few birds over the gap (they drift when the scene may move)
    sc.open('class="a-birds" data-box="720 70 340 110"')
    sc.s(birds([(760, 150), (781, 141), (799, 156), (1010, 96), (1027, 106)], rng, size=5), w=.9)
    sc.close()
    return sc


# =====================================================================================================================
# The Bunker: the orbital station hanging over the Earth's curve, seen through the great window's hexagonal panels.
# =====================================================================================================================
def arc_scallops(cx, cy, r, a0, a1, rng, bump=(8, 18), up=True):
    """Cloud tops along a circle arc (angles in degrees, 270 = the top)."""
    out = ''
    a = a0
    first = True
    while a < a1:
        da = math.degrees(rng.uniform(*bump) * 2 / r)
        b = min(a + da, a1)
        p0 = (cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
        p1 = (cx + r * math.cos(math.radians(b)), cy + r * math.sin(math.radians(b)))
        m = math.radians((a + b) / 2)
        h = r + (rng.uniform(.5, 1.1) * (b - a) * math.pi / 180 * r * .45) * (1 if up else -1)
        c = (cx + h * math.cos(m), cy + h * math.sin(m))
        if first:
            out += f'M{n(p0[0])} {n(p0[1])}'
            first = False
        out += f'Q{n(c[0])} {n(c[1])} {n(p1[0])} {n(p1[1])}'
        a = b
    return out


def arc_path(cx, cy, r, a0, a1, steps=None) -> str:
    steps = steps or max(8, int(abs(a1 - a0) * r / 900))
    return smooth(arc_pts(cx, cy, r, r, a0, a1, steps))


def hexagon(cx, cy, r):
    return [(cx + r * math.cos(math.radians(60 * i)), cy + r * math.sin(math.radians(60 * i))) for i in range(6)]


def inside(poly_pts, x, y):
    """Point in polygon (even-odd)."""
    c = False
    for (x0, y0), (x1, y1) in zip(poly_pts, poly_pts[1:] + poly_pts[:1]):
        if (y0 > y) != (y1 > y) and x < x0 + (y - y0) * (x1 - x0) / (y1 - y0):
            c = not c
    return c


def bunker() -> Scene:
    sc = Scene('bunker', 'The Bunker')
    rng = random.Random(4242)
    # far: stars, a pair of flight units far off, the orbit
    sc.plane(.42)
    stars = ''
    for _ in range(34):
        x, y = rng.uniform(20, 1580), rng.uniform(40, 300)
        k = rng.uniform(1.6, 3.4)
        stars += f'M{n(x - k)} {n(y)}h{n(2 * k)}M{n(x)} {n(y - k)}v{n(2 * k)}' if rng.random() < .4 else f'M{n(x)} {n(y)}h.1'
    sc.s(stars, w=.9)
    sc.s('M1300 118l18 -4l-6 4l6 4ZM1334 132l14 -3l-5 3l5 3Z', w=.9)
    # the planet: a dome whose limb curves away behind the window frame at both ends
    PX, PY, PR = 800, 1480, 1150
    ang = lambda x: math.degrees(math.atan2(-math.sqrt(max(PR * PR - (x - PX) ** 2, 0)), x - PX))
    a_l, a_r = ang(40), ang(1560)
    sc.plane(.62)
    for d, op in ((34, .35), (20, .6), (9, .85)):
        sc.s(arc_path(PX, PY, PR + d, ang(40 - d), ang(1560 + d)), w=.8, op=op)
    sc.plane(1)
    sc.k(poly(arc_pts(PX, PY, PR, PR, a_l, a_r, 60) + [(1560, 600), (40, 600)]))
    # cloud bands along the curve, a continent, the night side in broken arcs
    clouds = ''
    for d, span in ((10, (a_l + 4, a_l + 18)), (18, (a_l + 22, a_r - 20)), (34, (a_l + 8, a_l + 26)), (44, (a_l + 30, a_r - 8)),
                    (66, (a_l + 12, a_l + 36)), (90, (a_l + 24, a_r - 16)), (120, (a_l + 6, a_r - 26)), (156, (a_l + 16, a_r - 34))):
        a0, a1 = span
        while a0 < a1:
            seg = rng.uniform(2.5, 6.5)
            clouds += arc_scallops(PX, PY, PR - d - rng.uniform(-3, 3), a0, min(a0 + seg, a1), rng, bump=(5, 13))
            a0 += seg + rng.uniform(1.2, 4)
    sc.s(clouds, w=.8, op=.8)
    for ca, cw, cd, ch, seed in ((a_l + 44, 16, 74, 70, 3), (a_l + 25, 6, 50, 34, 7)):
        lr = random.Random(seed)
        land = []
        for i in range(40):
            t = 2 * math.pi * i / 40
            wob = 1 + .16 * math.sin(3 * t + lr.uniform(0, 6)) + .1 * math.sin(5 * t + lr.uniform(0, 6))
            aa = ca + cw / 2 * math.cos(t) * wob
            rr = PR - cd - ch / 2 * math.sin(t) * wob
            land.append((PX + rr * math.cos(math.radians(aa)), PY + rr * math.sin(math.radians(aa))))
        sc.s(smooth(land, close=True), w=.8, op=.75)
        sc.s(hatch(land, 14, 6.5, rng, keep=.6, inset=4, dash=(8, 7)), w=.7, op=.4)
    nh = ''
    for i in range(12):
        r = PR - 6 - i * 13
        nh += arc_path(PX, PY, r, ang(1150 + i * 22 + rng.uniform(-8, 8)), ang(1600))
    sc.s(nh, w=.7, op=.45)
    sc.plane(.5)
    orb = arc_pts(800, 470, 900, 190, 190, 350, 90)
    sc.s(''.join(line(*orb[i], *orb[i + 1]) for i in range(0, len(orb) - 1, 2)), w=.75)
    sc.plane(1)

    # the station: a monolithic faceted diamond, its shadowed faces hatched, girdled by a hexagonal platform whose
    # blades reach out left and right; spires above and below, four short diagonal vanes
    cx, cy = 640, 222
    T = lambda pts_: [(cx + x, cy + y) for x, y in pts_]
    P = lambda x, y: (cx + x, cy + y)
    sc.open(f'transform="rotate(-6 {cx} {cy})"')
    sp = line(*P(0, -126), *P(0, -196)) + line(*P(0, 118), *P(0, 176))
    for y, w in ((-150, 12), (-170, 7), (140, 9), (158, 5)):
        sp += line(*P(-w, y), *P(w, y))
    sc.s(sp, w=.85)
    vanes = ''
    vh = ''
    for sx, sy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        v = T([(sx * 22, sy * 56), (sx * 100, sy * 122), (sx * 46, sy * 30)])
        vanes += poly(v)
        if sx > 0:
            vh += hatch(v, 90, 3.4, rng, inset=.8)
    sc.k(vanes, w=.9)
    sc.s(vh, w=.7, op=.55)
    # blades: long thin wedges from the platform out to points
    blades = poly(T([(186, -12), (360, -3), (372, 0), (360, 3), (186, 6)])) + poly(T([(-186, -12), (-340, -3), (-352, 0), (-340, 3), (-186, 6)]))
    sc.k(blades, w=.9)
    sc.s(hatch(T([(186, 0), (360, 0), (360, 3), (186, 6)]), 0, 2.5, rng) + hatch(T([(-186, 0), (-340, 0), (-340, 3), (-186, 6)]), 0, 2.5, rng)
         + ''.join(line(*P(x, -9), *P(x, 5)) for x in (230, 280, 320, -230, -280)), w=.7, op=.7)
    core = T([(0, -126), (48, -4), (0, 118), (-48, -4)])
    sc.k(poly(core))
    sc.s(hatch(T([(0, -126), (48, -4), (0, 118), (4, -4)]), 72, 3, rng, inset=1), w=.7, op=.6)
    sc.s(line(*P(0, -126), *P(0, 118)) + line(*P(-30, -50), *P(30, -50)) + line(*P(-22, 58), *P(22, 58)), w=.75, op=.8)
    plat = T([(-192, -10), (-150, -26), (150, -26), (192, -10), (150, 10), (-150, 10)])
    sc.k(poly(plat))
    sc.s(hatch(T([(-192, -10), (192, -10), (150, 10), (-150, 10)]), 60, 3.2, rng, inset=1), w=.7, op=.55)
    sc.s(line(*P(-150, -18), *P(150, -18)), w=.7, op=.8)
    sc.k(''.join(poly(hexagon(*P(x, -1), 4.6)) for x in range(-140, 150, 28) if abs(x) > 20), w=.75)
    sc.f(''.join(rect(*P(x - 1.8, y - 1.8), 3.6, 3.6) for x, y in ((0, -90), (0, -66), (0, 84))))
    sc.close()

    # the great window: a flat-bottomed hexagonal porthole, a bolted frame, the wall around it paved with panels
    ap = [(262, 498), (1338, 498), (1576, 150), (1600, 150), (1600, 560), (0, 560), (0, 150), (24, 150)]
    aperture = [(24, 150), (262, 498), (1338, 498), (1576, 150)]
    frame_out = [(-4, 150), (250, 516), (1350, 516), (1604, 150)]
    wall = frame_out + [(1604, 600), (-4, 600)]
    band = aperture + list(reversed(frame_out))
    R = 21
    hx, hy = R * 1.5, R * math.sqrt(3)
    panels, inner, shade = '', '', ''
    for col in range(int(W / hx) + 2):
        for row in range(int(H / hy) + 2):
            x = col * hx
            y = H + 8 - row * hy - (hy / 2 if col % 2 else 0)
            if y < 140 or not inside(wall, x, y) or inside(band + [], x, y):
                continue
            if not all(inside(wall, px, py) for px, py in hexagon(x, y, R * .8)):
                continue
            panels += poly(hexagon(x, y, R - 1.3))
            r = rng.random()
            if r < .14:
                shade += hatch(hexagon(x, y, R - 6), 45, 3.2, rng, inset=.5)
            elif r < .4:
                inner += poly(hexagon(x, y, R - 6))
    sc.k(poly(wall), stroke=False)
    sc.k(panels, w=.8)
    sc.s(inner, w=.7, op=.7)
    sc.s(shade, w=.7, op=.55)
    sc.k(poly(band), w=1.2)
    sc.s(smooth([(12, 150), (256, 507), (1344, 507), (1590, 150)]) if False else poly([(12, 150), (256, 507), (1344, 507), (1590, 150)], close=False), w=.75, op=.8)
    bolts = ''
    for (x0, y0), (x1, y1) in zip([(12, 150), (256, 507), (1344, 507)], [(256, 507), (1344, 507), (1590, 150)]):
        L = math.hypot(x1 - x0, y1 - y0)
        k = int(L / 56)
        for i in range(1, k):
            bolts += circle_path(x0 + (x1 - x0) * i / k, y0 + (y1 - y0) * i / k, 1.8)
    sc.s(bolts, w=.75)
    sc.s(hatch([(262, 498), (1338, 498), (1332, 506), (268, 506)], 90, 5, rng, inset=.5), w=.7, op=.5)

    # a flight unit crossing (it glides across when the scene may move)
    sc.open('class="a-shuttle" data-box="1040 300 200 50"')
    sc.k('M1140 326l30 -8l-8 6l12 2l-12 2l8 6Z', w=.85)
    sc.s('M1130 327h-50M1124 330h-26', w=.75, op=.5)
    sc.close()
    return sc


# =====================================================================================================================
# Desert: long dunes burying apartment blocks, a great pipe arching out of the sand, heat shimmering over it all.
# =====================================================================================================================
def dune_profile(x0, x1, base, crests, rng, step=16):
    """A dune line: smooth swells with sharper crests. crests = [(x, height, width)]; returns points."""
    ps = []
    x = x0
    while x <= x1 + step:
        y = base
        for cx_, ch_, cw_ in crests:
            d = (x - cx_) / cw_
            # windward side long and gentle (left), lee side short and steep (right)
            y -= ch_ * (math.exp(-d * d * 2.2) if d < 0 else math.exp(-d * d * 6.5))
        y += math.sin(x * .013 + base) * 2.5
        ps.append((x, y))
        x += step
    return ps


def lee_hatch(ps, crests, rng, gap=5.0, depth=26, angle=112):
    """Shade the steep side just past each crest with short slanted strokes."""
    out = ''
    for cx_, ch_, cw_ in crests:
        span = [p for p in ps if cx_ + 2 < p[0] < cx_ + cw_ * .55]
        if len(span) < 2:
            continue
        poly_ = span + [(p[0], p[1] + depth * (1 - (p[0] - cx_) / (cw_ * .55))) for p in reversed(span)]
        out += hatch(poly_, angle, gap, rng, keep=.85, inset=1.2)
    return out


def ripples(x0, x1, y0, y1, rng, count):
    out = ''
    for _ in range(count):
        x, y = rng.uniform(x0, x1), rng.uniform(y0, y1)
        L = rng.uniform(10, 26)
        out += f'M{n(x)} {n(y)}q{n(L / 2)} {n(-rng.uniform(1.5, 3))} {n(L)} 0'
    return out


def ripple_patch(prof, x0, x1, rng, rows=4, gap=5.5, start=7):
    """Sand ripples: a few strokes following the dune's line just below it, broken and wavering."""
    out = ''
    pts_ = [p for p in prof if x0 <= p[0] <= x1]
    if len(pts_) < 2:
        return ''
    for r in range(rows):
        off = start + r * gap + rng.uniform(-1, 1)
        seg = [(x, y + off + math.sin(x * .09 + r) * 1.2) for x, y in pts_]
        i = rng.randrange(0, 2)
        while i < len(seg) - 1:
            j = min(len(seg), i + rng.randint(2, 5))
            if j - i >= 2:
                out += smooth(seg[i:j]) if j - i >= 3 else poly(seg[i:j], close=False)
            i = j + rng.randint(1, 2)
    return out


def drift(x, yb, w, h, rng):
    """A sand drift banked against something: a short steep windward face, a long lee tail."""
    ps = [(x - w * .9, yb + 2), (x - w * .45, yb - h * .55), (x - w * .1, yb - h), (x + w * .4, yb - h * .8), (x + w * 1.1, yb - h * .35), (x + w * 1.8, yb + 2)]
    return ps


def desert() -> Scene:
    sc = Scene('desert', 'Desert')
    rng = random.Random(1717)
    yat = lambda prof, x: interp(prof, x)
    # far: the sun behind haze, the heat high up, a mesa and a line of drowned towers
    sc.plane(.5)
    sc.s(circle_path(1210, 206, 46), w=.9)
    sc.s(hline(1150, 194, 120) + hline(1158, 214, 104) + hline(1172, 232, 76), w=.75, op=.8)
    heat, heat_low = '', ''
    for i in range(22):
        x = rng.uniform(40, 1560)
        y = rng.uniform(270, 336) if i < 15 else rng.uniform(170, 260)
        L = rng.uniform(24, 64)
        k = max(2, int(L / 9))
        path_ = f'M{n(x)} {n(y)}' + ''.join(f'q{n(4.5)} {n(-2 if j % 2 else 2)} 9 0' for j in range(k))
        if i < 15:
            heat_low += path_
        else:
            heat += path_
    sc.s(heat, w=.75, op=.8)
    sc.plane(.42)
    far = [(-10, 358), (120, 355), (150, 336), (178, 337), (196, 356), (420, 354), (1310, 354), (1350, 306), (1470, 302),
           (1512, 354), (1610, 356)]
    sc.k(poly(far + [(1610, 380), (-10, 380)]), stroke=False)
    sc.s(poly(far, close=False), w=.8)
    sc.s(hatch([(1350, 306), (1470, 302), (1512, 354), (1310, 354)], 90, 7, rng, keep=.8, inset=3), w=.7, op=.7)
    towers, th = '', ''
    for tx, tw, tt, lean in ((520, 26, 210, 0), (558, 18, 262, 3), (600, 30, 236, -4), (1030, 22, 196, 6), (1060, 34, 250, 0)):
        pts_ = [(tx, 356), (tx + lean, tt + rng.uniform(0, 10)), (tx + tw * .5 + lean, tt + rng.uniform(4, 18)), (tx + tw + lean, tt + rng.uniform(0, 8)), (tx + tw, 356)]
        towers += poly(pts_)
        th += hatch(pts_, 90, 5, rng, keep=.7, inset=2)
    sc.k(towers, w=.8)
    sc.s(th, w=.7, op=.7)

    # the back dune, telephone poles marching over it, a block nearly swallowed by a drift
    sc.plane(.66)
    d1c = [(240, 70, 260), (820, 50, 300), (1380, 80, 280)]
    d1 = dune_profile(-20, 1620, 420, d1c, rng)
    sc.k(poly(d1 + [(1620, 600), (-20, 600)]), stroke=False)
    sc.s(smooth(d1), w=.9)
    sc.s(lee_hatch(d1, d1c, rng, gap=6, depth=22), w=.7, op=.7)
    sc.s(ripple_patch(d1, 60, 220, rng, 3) + ripple_patch(d1, 600, 790, rng, 3), w=.7, op=.7)
    poles, tops = '', []
    for i, px in enumerate((1250, 1318, 1380, 1438, 1492, 1546, 1596)):
        hh = 90 - i * 9
        gy = yat(d1, px) + 4
        lean = (-3, 2, -1, 4, -2, 6, 1)[i]
        tops.append((px + lean, gy - hh))
        poles += line(px, gy, px + lean, gy - hh) + line(px + lean - 9 + i, gy - hh + 7, px + lean + 9 - i, gy - hh + 7)
    wires = ''
    for (x0, y0), (x1, y1) in zip(tops, tops[1:]):
        for dy in (7, 10):
            wires += f'M{n(x0)} {n(y0 + dy)}Q{n((x0 + x1) / 2)} {n((y0 + y1) / 2 + dy + 13)} {n(x1)} {n(y1 + dy)}'
    sc.s(poles, w=.9)
    sc.s(wires, w=.75, op=.85)
    fbx, fby = 1330, yat(d1, 1360) + 8
    sc.open(f'transform="rotate(-8 {fbx + 30} {n(fby)})"')
    sc.k(poly([(fbx, fby), (fbx, fby - 62), (fbx + 58, fby - 62), (fbx + 58, fby)]), w=.9)
    sc.s(''.join(vline(fbx + 8 + c * 13 + j * 2.5, fby - 54 + r * 15, 7) for c in range(4) for r in range(3) for j in range(2) if (c + r) % 3), w=.75, op=.8)
    sc.close()
    dr = drift(fbx + 18, fby + 2, 40, 30, rng)
    sc.k(smooth(dr) + 'Z', w=.9)
    sc.s(ripple_patch(dr, fbx - 10, fbx + 80, rng, 2, 5, 5), w=.7, op=.7)

    # the colossus: a machine as big as a house, sunk to its brow, one great dead eye, one arm reaching out
    sc.plane(.82)
    HX, HY = 820, 490
    head = arc_pts(HX, HY, 116, 112, 180, 360, 36)
    sc.k(poly(head))
    sc.s(line(HX - 110, HY - 34, HX + 110, HY - 34) + line(HX - 104, HY - 50, HX + 104, HY - 50), w=.9)
    sc.s(''.join(circle_path(HX - 100 + i * 20, HY - 42, 1.6) for i in range(11)), w=.75)
    sc.s(hatch([(HX + 40, HY - 108), (HX + 116, HY), (HX + 60, HY), (HX + 20, HY - 50)], 70, 3.6, rng, inset=1.5), w=.7, op=.7)
    sc.k(circle_path(HX - 32, HY - 78, 21) + circle_path(HX + 30, HY - 80, 10), w=1)
    sc.s(hatch(arc_pts(HX - 32, HY - 78, 14, 14, 0, 360, 16), 45, 2.6, rng) + circle_path(HX - 32, HY - 78, 15), w=.75)
    sc.s(line(HX + 20, HY - 90, HX + 40, HY - 70) + line(HX - 60, HY - 104, HX - 44, HY - 94), w=.9)
    # its arm, out of the sand beside it, segment by segment, the hand open to the sky
    arm = [(HX + 150, HY - 10), (HX + 172, HY - 86), (HX + 196, HY - 150), (HX + 170, HY - 204)]
    segs = ''
    for (x0, y0), (x1, y1), r in zip(arm, arm[1:], (19, 16, 13)):
        dx, dy = x1 - x0, y1 - y0
        L = math.hypot(dx, dy)
        nx_, ny_ = -dy / L * r, dx / L * r
        segs += poly([(x0 + nx_, y0 + ny_), (x1 + nx_ * .85, y1 + ny_ * .85), (x1 - nx_ * .85, y1 - ny_ * .85), (x0 - nx_, y0 - ny_)])
    sc.k(segs)
    sc.s(hatch([(arm[0][0] + 6, arm[0][1]), (arm[1][0] + 6, arm[1][1]), (arm[1][0] + 15, arm[1][1] + 3), (arm[0][0] + 19, arm[0][1] + 3)], 70, 3.4, rng, inset=1), w=.7, op=.7)
    sc.k(''.join(circle_path(x, y, 12) for x, y in arm[1:3]), w=.9)
    hx_, hy_ = arm[-1]
    palm = [(hx_ - 13, hy_ + 4), (hx_ + 13, hy_ + 4), (hx_ + 10, hy_ - 12), (hx_ - 10, hy_ - 12)]
    fingers = ''
    for bx, ax_, ay_ in ((-9, -26, -32), (0, -4, -44), (9, 20, -34)):
        fingers += poly([(hx_ + bx - 4, hy_ - 11), (hx_ + ax_ * .55 - 4, hy_ + ay_ * .6), (hx_ + ax_, hy_ + ay_), (hx_ + ax_ * .55 + 4, hy_ + ay_ * .6 + 2), (hx_ + bx + 4, hy_ - 11)])
    sc.k(poly(palm) + fingers, w=1)

    # the great pipe out of the sand and back in, ringed at its joints
    sc.plane(.88)
    PX, PY, PRo, PRi = 470, 520, 160, 132
    outer = arc_pts(PX, PY, PRo, PRo * .92, 180, 360, 44)
    inner = arc_pts(PX, PY, PRi, PRi * .91, 180, 360, 44)
    sc.k(poly(outer + list(reversed(inner))))
    rings = ''
    for a_ in (200, 226, 254, 284, 314, 340):
        ca, sa = math.cos(math.radians(a_)), math.sin(math.radians(a_))
        p0 = (PX + PRo * ca, PY + PRo * .92 * sa)
        p1 = (PX + PRi * ca, PY + PRi * .91 * sa)
        q0 = (PX + (PRo + 4) * ca, PY + (PRo + 4) * .92 * sa)
        rings += line(*p0, *p1) + line(*q0, p1[0] + (q0[0] - p0[0]) * 1.2, p1[1] + (q0[1] - p0[1]) * 1.2)
    sc.s(rings, w=.85)
    sh = [p for p in inner if p[0] > PX + 20] + list(reversed([p for p in outer if p[0] > PX + 20]))
    sc.s(hatch(sh, 62, 4.4, rng, keep=.88, inset=1.5), w=.7, op=.75)
    # the mid dunes, over the pipe's feet and the colossus's jaw
    d2c = [(120, 46, 220), (300, 30, 160), (640, 44, 200), (980, 58, 240), (1480, 44, 220)]
    d2 = dune_profile(-20, 1620, 494, d2c, rng)
    sc.k(poly(d2 + [(1620, 600), (-20, 600)]), stroke=False)
    sc.s(smooth(d2), w=1)
    sc.s(lee_hatch(d2, d2c, rng, gap=5.5, depth=24), w=.7, op=.72)
    sc.s(ripple_patch(d2, 420, 600, rng, 3) + ripple_patch(d2, 820, 960, rng, 4) + ripple_patch(d2, 1300, 1460, rng, 3), w=.7, op=.72)
    # a broken pipe standing out of the sand, its mouth dark
    sc.open('transform="rotate(26 1452 492)"')
    sc.k(poly([(1434, 492), (1434, 372), (1470, 372), (1470, 492)]))
    sc.k('M1434 372a18 7 0 1 0 36 0a18 7 0 1 0 -36 0Z', w=.9)
    sc.s(hatch(arc_pts(1452, 372, 13, 4.5, 0, 360, 12), 90, 2.2, rng) + hline(1434, 408, 36) + hline(1434, 413, 36) + hline(1434, 460, 36), w=.75)
    sc.s(hatch([(1458, 378), (1470, 378), (1470, 492), (1458, 492)], 90, 3.4, rng, inset=1), w=.7, op=.75)
    sc.close()

    # the near: two apartment blocks sinking into the front dunes, their windows dark hatched hollows
    sc.plane(1)

    def block(x, base, w, h, tilt, floors, cols, seed):
        br = random.Random(seed)
        sc.open(f'transform="rotate({num(tilt)} {n(x + w / 2)} {n(base)})"')
        top = base - h
        sc.k(poly([(x, base), (x, top + 6), (x + w * .3, top), (x + w * .55, top + 10), (x + w * .8, top + 4), (x + w, top + 8), (x + w, base)]))
        fh, cw = h / floors, w / cols
        slabs, wins = '', ''
        for f in range(1, floors):
            yy = base - f * fh
            slabs += hline(x - 4, yy, w + 8) + hline(x - 4, yy + 3, w + 8)
            for c in range(cols):
                if br.random() < .62:
                    wx, wy, ww, wh = x + c * cw + cw * .24, yy - fh * .7, cw * .52, fh * .48
                    wins += ''.join(vline(wx + 1.5 + j * 3, wy, wh) for j in range(int(ww / 3)))
        sc.s(slabs, w=.8, op=.85)
        sc.s(wins, w=.75, op=.8)
        sc.s(hatch([(x + w * .84, base), (x + w, base), (x + w, top + 8), (x + w * .84, top + 6)], 75, 4.2, rng, keep=.9, inset=1), w=.7, op=.7)
        sc.close()
    block(110, 548, 188, 262, 7, 9, 6, 3)
    block(1098, 548, 158, 216, -13, 7, 5, 5)
    # a small machine sits by the colossus, half sunk in its own drift
    mx, my = 1000, 532
    machine(sc, mx, my, 1.2, 'stand', look=(-1.4, -.6))
    md = drift(mx + 2, my + 3, 22, 16, rng)
    sc.k(smooth(md) + 'Z', w=.9)
    # the front dunes over the blocks' lower floors; sand blowing off the crests; ripples on the windward faces
    d3c = [(230, 78, 240), (720, 30, 260), (1180, 90, 250), (1560, 40, 200)]
    d3 = dune_profile(-20, 1620, 552, d3c, rng)
    sc.k(poly(d3 + [(1620, 600), (-20, 600)]), stroke=False)
    sc.s(smooth(d3), w=1.15)
    sc.s(lee_hatch(d3, d3c, rng, gap=4.6, depth=32), w=.75, op=.75)
    sc.s(ripple_patch(d3, 20, 200, rng, 4, 6) + ripple_patch(d3, 520, 700, rng, 4, 6) + ripple_patch(d3, 960, 1150, rng, 4, 6) + ripple_patch(d3, 1400, 1540, rng, 3, 6), w=.75, op=.75)
    wisps = ''
    for prof, cr in ((d1, d1c), (d2, d2c), (d3, d3c)):
        for cx_, ch_, cw_ in cr:
            cy_ = yat(prof, cx_)
            for j in range(3):
                L = rng.uniform(18, 40)
                wisps += f'M{n(cx_ + 2)} {n(cy_ - 1 - j * 2)}q{n(L * .5)} {n(-4 - j * 2)} {n(L)} {n(-2 - j * 3)}'
    sc.s(wisps, w=.7, op=.55)
    shrub = ''
    for i in range(7):
        a_ = math.radians(-160 + i * 22)
        shrub += f'M640 {n(yat(d3, 640) + 2)}q{n(math.cos(a_) * 6)} {n(math.sin(a_) * 9)} {n(math.cos(a_) * 14)} {n(math.sin(a_) * 16)}'
    sc.s(shrub, w=.8)
    # the heat low over the dunes (it shimmers when the scene may move)
    sc.plane(.5)
    sc.open('class="a-heat" data-box="0 256 1600 90"')
    sc.s(heat_low, w=.75, op=.8)
    sc.close()
    sc.plane(1)
    return sc

# =====================================================================================================================
# Forest Castle: a castle of pointed towers on a rocky hill, a viaduct to its gate, rising out of a deep forest.
# =====================================================================================================================
def canopy_band(x0, x1, base, rng, r=(10, 22), lift=0.0, wave=(0, 0, 0), big=.18):
    """The top edge of a forest seen from above: overlapping crowns as bumps of mixed sizes along an undulating line
    (now and then a big clump). Returns the edge path, the bumps [(cx, top, r)] and the edge points."""
    amp, freq, ph = wave
    by = lambda xx: base + amp * math.sin(xx * freq + ph)
    x = x0
    out = f'M{n(x0)} {n(by(x0))}'
    bumps, edge = [], [(x0, by(x0))]
    while x < x1:
        rr = rng.uniform(*r) * (rng.uniform(1.5, 2.1) if rng.random() < big else 1)
        nx = min(x + rr * 2 * rng.uniform(.7, 1.0), x1)
        y0, y1 = by(x) + rng.uniform(-3, 5), by(nx) + rng.uniform(-3, 5)
        h = rr * rng.uniform(.75, 1.2) + lift
        top = min(y0, y1) - h
        # the crown's rim as a few small leafy scallops round a half ellipse
        ecx, ecy, erx, ery = (x + nx) / 2, max(y0, y1), (nx - x) / 2, max(y0, y1) - top
        k = 3 if rr < 14 else 4 if rr < 24 else 5
        ang = [180 + 180 * i / k + (rng.uniform(-8, 8) if 0 < i < k else 0) for i in range(k + 1)]
        ps = [(ecx + erx * math.cos(math.radians(a_)), ecy + ery * math.sin(math.radians(a_))) for a_ in ang]
        ps[0], ps[-1] = (x, y0), (nx, y1)
        for (ax, ay), (bx, by_), a_ in zip(ps, ps[1:], ang[1:]):
            mx, my = (ax + bx) / 2, (ay + by_) / 2
            am = math.radians(a_ - 90 / k)
            bl = math.hypot(bx - ax, by_ - ay) * rng.uniform(.28, .5)
            out += f'Q{n(mx + math.cos(am) * bl)} {n(my + math.sin(am) * bl * 1.1)} {n(bx)} {n(by_)}'
        bumps.append(((x + nx) / 2, top + h * .05, rr))
        edge += [((x + nx) / 2, top), (nx, y1)]
        x = nx
    return out, bumps, edge


def crown_marks(bumps, rng, keep=.55, n_=3):
    """Shade on the lee of each crown: a few short slanted strokes low on its right side."""
    out = ''
    for cx_, top, rr in bumps:
        if rng.random() > keep:
            continue
        for j in range(n_):
            x = cx_ + rr * (.05 + .22 * j)
            y = top + rr * (.75 + .15 * j) + rng.uniform(-1, 1)
            L = rr * rng.uniform(.35, .55)
            out += f'M{n(x)} {n(y)}l{n(-L * .45)} {n(L)}'
    return out


def pine(x, g, h, rng, solid=False):
    """A conifer: a narrow spire of drooping tiers."""
    tiers = max(4, int(h / 11))
    pts_l, pts_r = [], []
    for i in range(tiers + 1):
        t = i / tiers
        y = g - h + h * t
        w = 2 + h * .2 * t
        pts_l.append((x - w, y + (5 if i else 0)))
        pts_r.append((x + w, y + (5 if i else 0)))
        if i < tiers:
            yn = g - h + h * (i + 1) / tiers
            wn = (2 + h * .2 * (i + 1) / tiers) * .55
            pts_l.append((x - wn, yn))
            pts_r.append((x + wn, yn))
    shape = [(x, g - h - 6)] + pts_r + list(reversed(pts_l))
    return rpoly(shape)


def interp(ps, x):
    """y on a polyline at x (clamped at its ends)."""
    if x <= ps[0][0]:
        return ps[0][1]
    for (x0, y0), (x1, y1) in zip(ps, ps[1:]):
        if x0 <= x <= x1:
            return y0 + (y1 - y0) * (x - x0) / ((x1 - x0) or 1)
    return ps[-1][1]


def rpoly(ps, close=True) -> str:
    """A polyline in relative steps (short numbers, small files)."""
    q = [(round(x, PREC), round(y, PREC)) for x, y in ps]
    out = f'M{n(q[0][0])} {n(q[0][1])}l' + ' '.join(f'{n(b[0] - a[0])} {n(b[1] - a[1])}' for a, b in zip(q, q[1:]))
    return out.replace(' -', '-') + ('Z' if close else '')


def leafy_crown(cx, by, rx, ry, rng, leaf=(6, 13)):
    """A tree crown: a lumpy dome (two or three lobes) whose rim is made of small round leaf clusters of varied size,
    closed beneath where nearer crowns hide it. Returns (path in relative curves, rim points)."""
    lobes = rng.randint(2, 3)
    ph = rng.uniform(0, 6.28)
    rim = []
    steps = 60
    for i in range(steps + 1):
        a = math.pi + math.pi * i / steps
        k = 1 + .16 * math.sin(lobes * 2 * a + ph) + .05 * math.sin(7 * a + ph * 2)
        rim.append((cx + rx * k * math.cos(a), by + ry * k * math.sin(a)))
    # walk the rim, dropping leaf-cluster boundaries at random spacing
    cum = [0.0]
    for p0, p1 in zip(rim, rim[1:]):
        cum.append(cum[-1] + math.hypot(p1[0] - p0[0], p1[1] - p0[1]))
    marks_, t = [0.0], 0.0
    while t < cum[-1]:
        t += rng.uniform(*leaf)
        marks_.append(min(t, cum[-1]))
    def at(d):
        for i in range(1, len(cum)):
            if cum[i] >= d:
                u = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) or 1)
                return (rim[i - 1][0] + (rim[i][0] - rim[i - 1][0]) * u, rim[i - 1][1] + (rim[i][1] - rim[i - 1][1]) * u)
        return rim[-1]
    pts_ = [at(d) for d in marks_]
    q = [(round(x, PREC), round(y, PREC)) for x, y in pts_]
    out = f'M{n(q[0][0])} {n(q[0][1])}q'
    parts = []
    for (x0, y0), (x1, y1) in zip(q, q[1:]):
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        ox, oy = mx - cx, my - by
        L = math.hypot(ox, oy) or 1
        h = math.hypot(x1 - x0, y1 - y0) * rng.uniform(.35, .6)
        parts.append(f'{n(mx + ox / L * h - x0)} {n(my + oy / L * h - y0)} {n(x1 - x0)} {n(y1 - y0)}')
    out += ' '.join(parts).replace(' -', '-')
    out += f'Q{n(cx)} {n(by + ry * 1.1 + 70)} {n(q[0][0])} {n(q[0][1])}Z'
    return out, pts_


def woodland(sc, rng, x0, x1, by, r, rows=2, wave=(0, 0, 0), shade=.8, dy=20, kinds=(.5, .25, .25), leaf=(6, 13), gap=(1.1, 1.6), marks=True):
    """Rows of tree crowns of mixed size and kind (round, tall, spreading), back row first, each hiding the ones behind;
    their undersides hatched in shadow, a few leaf marks on their lit side (hatching and marks merged per row)."""
    amp, freq, ph = wave
    for row in range(rows):
        x = x0 - rng.uniform(0, r[1])
        hat, mk, crowns = '', '', []
        while x < x1 + r[1]:
            rr = rng.uniform(*r)
            kind = rng.random()
            if kind < kinds[0]:
                rx, ry = rr, rr * rng.uniform(.7, .95)
            elif kind < kinds[0] + kinds[1]:
                rx, ry = rr * .6, rr * rng.uniform(1.3, 1.7)
            else:
                rx, ry = rr * 1.4, rr * .58
            b = by + row * dy + amp * math.sin(x * freq + ph) + rng.uniform(-8, 8)
            d, pts_ = leafy_crown(x, b, rx, ry, rng, leaf)
            crowns.append(d)
            low = [p for p in pts_ if p[1] > b - ry * .3]
            if len(low) > 2 and shade:
                hat += hatch(low + [(x + rx * .6, b + 6), (x - rx * .6, b + 6)], 62, 5.2 if row == rows - 1 else 5.6, rng, keep=.6 if row == rows - 1 else .5, inset=2)
            if marks and row == rows - 1:
                for _ in range(int(rr / 14)):
                    mx, my = x + rng.uniform(-rx * .55, rx * .2), b - ry * rng.uniform(.3, .7)
                    mk += f'M{n(mx - 4)} {n(my)}q2 -3 4 0q2 -3 4 0'
            x += rx * rng.uniform(*gap)
        sc.kgroup(crowns, w=1.0 if row == rows - 1 else .9)
        sc.s(hat, w=.7, op=shade)
        sc.s(mk, w=.75, op=.55)


def dead_tree(x, g, h, rng):
    """A bare tree: a trunk forking into thinning branches."""
    out = ''

    def br(x0, y0, a, L, d):
        nonlocal out
        x1, y1 = x0 + math.cos(a) * L, y0 + math.sin(a) * L
        out += line(x0, y0, x1, y1)
        if d > 0:
            for da in (-.45 - rng.uniform(0, .25), .35 + rng.uniform(0, .25)):
                br(x1, y1, a + da, L * rng.uniform(.55, .7), d - 1)
    br(x, g, -math.pi / 2 + rng.uniform(-.1, .1), h * .42, 3)
    return out


def forest() -> Scene:
    sc = Scene('forest', 'Forest Castle')
    rng = random.Random(2525)
    # a pale moon; crows wheeling round the high tower
    sc.s('M1382 112a30 30 0 1 0 24 48a24 24 0 1 1 -24 -48Z', w=.9, op=.75)
    crows = birds([(1110, 64), (1136, 52), (1162, 70), (1236, 96), (1256, 88)], rng, size=5)

    # the far forest, rising in soft hills on either side, faint
    far, fb, fe = canopy_band(-20, 1640, 404, rng, r=(13, 24), wave=(24, .006, 1.1), big=.1)
    sc.plane(.42)
    sc.k(poly([(222, 400), (222, 316), (230, 310), (236, 322), (244, 304), (252, 318), (258, 312), (258, 396)]) + 'M231 346v-10a3 3 0 0 1 6 0v10Z', w=.8)
    sc.k(far + 'L1640 600L-20 600Z', w=.8)
    sc.s(crown_marks(fb, rng, .3, 2), w=.7, op=.7)
    sc.plane(.86)

    # the crag: an uneven rock mass, a sheer cliff on its right
    crag = [(760, 480), (800, 440), (832, 420), (858, 396), (884, 384), (930, 378), (962, 366), (1010, 362), (1060, 360),
            (1150, 356), (1210, 352), (1262, 350), (1300, 348), (1318, 356), (1326, 392), (1340, 418), (1360, 432),
            (1400, 446), (1450, 470), (1500, 490)]
    sc.k(poly(crag + [(1500, 600), (760, 600)]))
    rock = ''
    for x0 in range(800, 1470, 22):
        yy = interp(crag, x0) + rng.uniform(10, 24)
        rock += f'M{n(x0)} {n(yy)}l{n(rng.uniform(-5, 5))} {n(rng.uniform(12, 26))}l{n(rng.uniform(3, 9))} {n(rng.uniform(6, 12))}'
    sc.s(rock, w=.7, op=.75)
    sc.s(hatch([(1300, 350), (1318, 356), (1326, 392), (1340, 418), (1360, 432), (1360, 480), (1300, 480)], 96, 3.4, rng, keep=.9, inset=1.5), w=.55, op=.7)

    # the stone bridge to the gate, on round arches
    deck = lambda x: 402 - (x - 540) * .06
    br = poly([(548, deck(548) - 12), (884, deck(884) - 12), (884, deck(884) + 6), (560, deck(560) + 6), (553, deck(553) + 1), (556, deck(556) - 4), (544, deck(544) - 6)])
    piers, arches = '', ''
    xs = [650, 744, 838]
    for i, px in enumerate(xs):
        piers += poly([(px - 9, deck(px) + 6), (px + 9, deck(px) + 6), (px + 11, 540), (px - 11, 540)])
        if i < len(xs) - 1:
            qx = xs[i + 1]
            r_ = (qx - px - 18) / 2
            arches += f'M{n(px + 9)} {n(deck(px) + 30)}a{n(r_)} {n(r_ * .9)} 0 0 1 {n(2 * r_)} 0'
    sc.k(piers, w=.9)
    sc.k(br)
    sc.s(arches + ''.join(line(x, deck(x) - 12, x, deck(x) - 18) for x in range(558, 884, 12)) + line(556, deck(556) - 18, 884, deck(884) - 18)
         + line(552, deck(552) - 3, 884, deck(884) - 3) + f'M{n(572)} {n(deck(572) + 30)}a{n(29)} {n(26)} 0 0 1 {n(69)} 0'
         + rebar(556, deck(556) + 6, rng, 3, 12), w=.7, op=.85)
    sc.s('M548 420l-6 10l5 2ZM536 448l-5 8l6 1Z', w=.7, op=.8)

    # the castle: a barbican, a curtain wall, the great hall with its buttresses and rose window, the high keep,
    # a tower broken open to the sky
    body, detail, dark, roofs, roofh = '', '', '', '', ''

    def gothic(x, y, w, h):
        return f'M{n(x)} {n(y + h)}v{n(-h + w)}q0 {n(-w * .9)} {n(w / 2)} {n(-w * 1.4)}q{n(w / 2)} {n(w * .5)} {n(w / 2)} {n(w * 1.4)}v{n(h - w)}Z'

    def spire(x, w, top, rh, finial=True):
        nonlocal roofs, roofh
        roofs += poly([(x - 4, top), (x + w / 2, top - rh), (x + w + 4, top)])
        roofh += hatch([(x + w / 2, top - rh), (x + w + 4, top), (x + w / 2 + 1, top)], 98, 3.2, rng, inset=1)
        if finial:
            roofs += f'M{n(x + w / 2)} {n(top - rh)}v-12'
    # barbican
    body += poly([(884, 386), (884, 256), (918, 256), (918, 380)])
    spire(884, 34, 256, 84)
    detail += hline(884, 264, 34)
    dark += gothic(897, 300, 8, 22) + gothic(897, 336, 8, 20)
    # curtain wall
    wall = [(918, 378), (918, 322)]
    x = 918
    while x < 1004:
        wall += [(x, 316), (x + 7, 316), (x + 7, 322), (min(x + 14, 1004), 322)]
        x += 14
    wall += [(1004, 316), (1004, 364)]
    body += poly(wall)
    # the great hall
    body += poly([(1004, 364), (1004, 236), (1150, 236), (1150, 356)])
    roofs += poly([(996, 236), (1077, 164), (1158, 236)])
    roofh += hatch([(1077, 164), (1158, 236), (1080, 236)], 98, 3.6, rng, inset=1)
    dark += ''.join(gothic(1016 + i * 32, 262, 9, 40) for i in range(5) if i != 2)
    detail += gothic(1066, 300, 22, 64) + circle_path(1077, 212, 9) + hatch(arc_pts(1077, 212, 8, 8, 0, 360, 12), 45, 2.8, rng) + hatch([(1067, 364), (1067, 330), (1077, 302), (1087, 330), (1087, 364)], 90, 2.8, rng)
    detail += circle_path(1077, 212, 14) + hline(1004, 244, 146) + hline(1004, 318, 146)
    for bx in (1004, 1150):
        sgn = -1 if bx == 1004 else 1
        detail += line(bx, 270, bx + sgn * 26, 330) + line(bx + sgn * 26, 330, bx + sgn * 26, 366) + line(bx + sgn * 20, 318, bx + sgn * 32, 318)
    # the high keep, a tattered banner hanging from it
    body += poly([(1158, 354), (1158, 138), (1200, 138), (1200, 352)])
    spire(1154, 50, 138, 96)
    detail += hline(1154, 146, 50) + hline(1154, 150, 50) + poly([(1150, 196), (1208, 196), (1208, 204), (1150, 204)])
    dark += gothic(1173, 162, 12, 24) + gothic(1174, 224, 10, 30) + gothic(1174, 282, 10, 30)
    detail += 'M1204 212h10v52l-4 -8l-3 10l-3 -6Z'
    # the broken tower
    body += poly([(1232, 350), (1232, 228), (1240, 222), (1246, 236), (1254, 214), (1262, 232), (1270, 226), (1270, 348)])
    dark += gothic(1245, 262, 10, 26)
    # the wall to the cliff's edge
    body += poly([(1270, 348), (1270, 318), (1306, 318), (1306, 348)])
    sc.k(body)
    sc.s(detail, w=.7, op=.85)
    # the windows as drawn arches with a mullion: a solid slit would be the brightest mark on the page in dark mode
    sc.s(dark, w=.85)
    sc.s(''.join(vline(float(a_) + float(w_) / 2, float(b_) - 2, -float(h_) * .7) for a_, b_, h_, w_ in re.findall(r'M(-?[\d.]+) (-?[\d.]+)v-(-?[\d.]+)q0 -?[\d.]+ (-?[\d.]+)', dark)), w=.75, op=.8)
    sc.k(roofs)
    sc.s(roofh, w=.55, op=.75)
    sc.s(hatch([(1188, 352), (1200, 352), (1200, 154), (1188, 154)], 90, 3.2, rng, inset=1) +
         hatch([(1136, 356), (1150, 356), (1150, 248), (1136, 248)], 90, 3.4, rng, inset=1) +
         hatch([(906, 380), (918, 380), (918, 268), (906, 268)], 90, 3.4, rng, inset=1), w=.55, op=.7)
    hang_vines(sc, rng, [(924, 324), (960, 324), (1010, 246), (1140, 246), (1162, 154), (1236, 232), (1264, 234), (1290, 320)], (24, 90), sway=(2, 5))

    # the mid forest closing round the crag's foot: foliage masses of every size and kind, pines and two dead trees
    # standing out of them
    sc.plane(.92)
    pines = ''
    for px, ph_ in ((110, 124), (160, 96), (404, 146), (452, 106), (1488, 136), (1534, 160), (1586, 112), (700, 104)):
        pines += pine(px, 476, ph_, rng)
    sc.k(pines, w=.9)
    sc.s(dead_tree(620, 470, 150, rng) + dead_tree(1440, 476, 130, rng), w=.9)
    woodland(sc, rng, -20, 1620, 458, (26, 50), rows=2, wave=(8, .011, .3), shade=.7, dy=28, leaf=(9, 17), marks=False, kinds=(.6, .3, .1), gap=(.95, 1.3))
    # the near forest: great crowns along the bottom, cropped by the frame
    sc.plane(1)
    woodland(sc, rng, -40, 1640, 544, (48, 84), rows=1, wave=(6, .017, 2), shade=.8, kinds=(.7, .1, .2), leaf=(12, 22), gap=(1.0, 1.35))
    # crows round the high tower (they wheel when the scene may move)
    sc.open('class="a-birds" data-box="1090 36 190 76"')
    sc.s(crows, w=.85)
    sc.close()
    return sc

# =====================================================================================================================
# Amusement Park: a Ferris wheel over the empty park, a roller coaster that ends in the air, a circus tent strung
# with pennants, faint fireworks nobody is watching.
# =====================================================================================================================
def offset_line(ps, d):
    """A polyline moved sideways by d (left of the direction of travel)."""
    out = []
    for i, (x, y) in enumerate(ps):
        a = ps[max(i - 1, 0)]
        b = ps[min(i + 1, len(ps) - 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dy) or 1
        out.append((x - dy / L * d, y + dx / L * d))
    return out


def resample(ps, step):
    """Points every `step` along a polyline."""
    out = [ps[0]]
    acc = 0.0
    for (x0, y0), (x1, y1) in zip(ps, ps[1:]):
        seg = math.hypot(x1 - x0, y1 - y0)
        t = step - acc
        while t <= seg:
            out.append((x0 + (x1 - x0) * t / seg, y0 + (y1 - y0) * t / seg))
            t += step
        acc = (acc + seg) % step
    return out


def bezier_pts(p0, p1, p2, p3, steps=24):
    out = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        out.append((u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0],
                    u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1]))
    return out


def burst(cx, cy, r, rng, rays=16):
    out = ''
    for i in range(rays):
        a = 2 * math.pi * i / rays + rng.uniform(-.08, .08)
        r0, r1 = r * .3, r * rng.uniform(.8, 1.05)
        # each ray drawn in two dashes, drooping a little at its end
        m = (r0 + r1) / 2
        out += line(cx + math.cos(a) * r0, cy + math.sin(a) * r0, cx + math.cos(a) * (m - 3), cy + math.sin(a) * (m - 3))
        out += f'M{n(cx + math.cos(a) * (m + 2))} {n(cy + math.sin(a) * (m + 2))}Q{n(cx + math.cos(a) * r1)} {n(cy + math.sin(a) * r1)} {n(cx + math.cos(a) * r1 * 1.02)} {n(cy + math.sin(a) * r1 + 4)}'
    return out


def park() -> Scene:
    sc = Scene('park', 'Amusement Park')
    rng = random.Random(6060)
    G = 540
    # far: fireworks nobody is watching (in their own group: they may fade in and out), a drop tower, the far side of
    # the park (a carousel dome with its flag, a second coaster's lift hill, a line of trees)
    sc.plane(.42)
    sc.open('class="a-fireworks" data-box="700 40 700 200"')
    sc.s(burst(770, 132, 42, rng) + burst(922, 86, 30, rng, 12) + burst(1330, 150, 36, rng, 14), w=.75, op=.9)
    sc.close()
    sc.k(poly([(1452, 470), (1458, 112), (1470, 112), (1476, 470)]), w=.8)
    sc.s(rect(1446, 300, 36, 16) + ''.join(line(1458, 130 + i * 24, 1470, 142 + i * 24) for i in range(14)), w=.75, op=.8)
    sc.k(poly([(1440, 112), (1464, 88), (1488, 112)]), w=.8)
    lift = bezier_pts((1060, 470), (1110, 420), (1160, 330), (1200, 322), 12) + bezier_pts((1200, 322), (1230, 318), (1250, 380), (1290, 470), 10)[1:]
    sc.s(smooth(lift) + smooth(offset_line(lift, 4)) + ''.join(line(x, y + 4, x, 470) for x, y in resample(lift, 26)[1:-1]), w=.8)
    sc.k(poly(arc_pts(1380, 470, 50, 52, 180, 360, 16)) + 'M1380 418v-26', w=.8)
    sc.s(''.join(line(1380, 418, 1380 + 50 * math.cos(math.radians(a_)), 470 + 52 * math.sin(math.radians(a_))) for a_ in (205, 240, 300, 335)), w=.75, op=.7)
    sc.f(poly([(1380, 392), (1394, 396), (1380, 400)]))
    trees_far, tb, te = canopy_band(-20, 1640, 470, rng, r=(8, 16), wave=(6, .01, 2), big=.1)
    sc.k(trees_far + 'L1640 600L-20 600Z', w=.8)
    sc.plane(.75)

    # the roller coaster: a lift hill, a drop, a loop, and a span that ends in the air
    track = bezier_pts((600, 520), (660, 470), (760, 250), (812, 240), 20)
    track += bezier_pts((812, 240), (850, 232), (866, 300), (900, 470), 16)[1:]
    track += bezier_pts((900, 470), (924, 520), (1010, 520), (1060, 430), 14)[1:]
    track += arc_pts(1010, 400, 58, 62, 30, -300, 40)[1:]
    track += bezier_pts(track[-1], (1080, 470), (1180, 300), (1262, 292), 20)[1:]
    track += bezier_pts((1262, 292), (1300, 290), (1320, 300), (1334, 318), 8)[1:]
    # supports under the track (not under the loop), braced in pairs
    sup = ''
    posts = [p for p in resample(track, 34) if p[1] < 500 and not (950 < p[0] < 1075 and p[1] < 470)]
    for i, (x, y) in enumerate(posts):
        sup += line(x, y + 4, x, G)
        if i % 2 and abs(posts[i - 1][0] - x) < 60:
            px_, py_ = posts[i - 1]
            yy = max(y, py_) + 14
            while yy < G - 10:
                sup += line(px_, yy, x, min(yy + 30, G)) + line(px_, min(yy + 30, G), x, yy)
                yy += 58
    sc.s(sup, w=.7, op=.85)
    rail_a, rail_b = offset_line(track, 3.5), offset_line(track, -3.5)
    sc.k(poly(rail_a + list(reversed(rail_b))), w=.9)
    ties = ''
    for (x0, y0), (x1, y1) in zip(resample(rail_a, 11), resample(rail_b, 11)):
        ties += line(x0, y0, x1, y1)
    sc.s(ties, w=.55, op=.8)
    sc.s(rebar(1334, 318, rng, 3, 14), w=.7)
    hang_vines(sc, rng, [track[k_] for k_ in (6, 17, 30, 44, 96, 104)], (18, 64), sway=(2, 4))
    # one car stranded on the lift hill
    cx_, cy_ = track[12]
    sc.k(poly([(cx_ - 12, cy_ - 4), (cx_ + 10, cy_ - 14), (cx_ + 14, cy_ - 6), (cx_ - 8, cy_ + 4)]), w=.9)

    # the circus tent, strung with pennants (the near plane from here)
    sc.plane(1)
    tent_c, tent_top, tent_eave, tw = 1188, 372, 470, 132
    pen = ''
    tri = ''
    for ex, ey in ((968, 468), (1410, 470)):
        pts_ = bezier_pts((tent_c, tent_top + 4), ((tent_c + ex) / 2, tent_top + 70), ((tent_c + ex) / 2, ey - 10), (ex, ey - 2), 20)
        pen += smooth(pts_)
        for (x, y) in resample(pts_, 16)[1:-1]:
            tri += poly([(x - 4, y), (x + 4, y), (x, y + 9)])
        pen += line(ex, ey - 4, ex, G)
    sc.s(pen, w=.7, op=.85)
    sc.s(tri, w=.6, op=.8)
    roof = [(tent_c - tw, tent_eave), (tent_c - 20, tent_top + 18), (tent_c, tent_top), (tent_c + 20, tent_top + 18), (tent_c + tw, tent_eave)]
    walls = [(tent_c - tw + 10, tent_eave), (tent_c - tw + 10, G), (tent_c + tw - 10, G), (tent_c + tw - 10, tent_eave)]
    sc.k(poly(walls))
    sc.k(smooth(roof) + f'L{n(tent_c + tw)} {n(tent_eave)}Z')
    stripes = ''
    for i in range(-3, 4):
        x_e = tent_c + i * tw / 3.5
        stripes += line(tent_c + i * 3, tent_top + 6, x_e, tent_eave)
    sc.s(stripes, w=.7, op=.85)
    for i in range(-3, 3, 2):
        x0_, x1_ = tent_c + i * tw / 3.5, tent_c + (i + 1) * tw / 3.5
        sc.s(hatch([(tent_c + i * 3, tent_top + 8), (tent_c + (i + 1) * 3, tent_top + 8), (x1_, tent_eave), (x0_, tent_eave)], 90, 4, rng, inset=2), w=.55, op=.7)
    val = ''
    x = tent_c - tw
    while x < tent_c + tw - 1:
        val += f'M{n(x)} {n(tent_eave)}q{n(tw / 14)} 12 {n(tw / 7)} 0'
        x += tw / 7
    sc.s(val, w=.8)
    sc.s(''.join(vline(tent_c - tw + 10 + i * (2 * tw - 20) / 8, tent_eave + 12, G - tent_eave - 12) for i in range(1, 8)), w=.55, op=.6)
    sc.k(f'M{n(tent_c - 18)} {G}v-30q18 -22 36 0v30Z', w=.9)
    sc.s(hatch([(tent_c - 17, G), (tent_c - 17, G - 30), (tent_c, G - 44), (tent_c + 17, G - 30), (tent_c + 17, G)], 90, 2.8, rng, inset=1), w=.75, op=.85)
    hang_vines(sc, rng, [(tent_c - tw + 12, tent_eave + 8), (tent_c - tw + 60, tent_eave + 6), (tent_c + tw - 30, tent_eave + 8)], (20, 60), sway=(2, 4))
    sc.s(f'M{tent_c} {tent_top}v-34', w=.9)
    sc.f(poly([(tent_c, tent_top - 34), (tent_c + 16, tent_top - 29), (tent_c, tent_top - 24)]))

    # a ticket booth with a striped awning, balloons still tied to it
    sc.k(rect(566, 470, 54, 70))
    sc.k(poly([(558, 470), (628, 470), (620, 456), (566, 456)]), w=.9)
    sc.s(''.join(line(566 + i * 9, 456, 562 + i * 10.5, 470) for i in range(1, 7)) + rect(576, 482, 34, 22), w=.6, op=.85)
    sc.s(hatch([(580, 486), (606, 486), (606, 500), (580, 500)], 45, 3, rng), w=.75, op=.8)
    bl = ''
    for bx, by, br_ in ((600, 392, 11), (618, 380, 9), (586, 404, 8)):
        bl += circle_path(bx, by, br_) + f'M{n(bx)} {n(by + br_)}q{n(rng.uniform(-6, 6))} 30 {n(650 - bx)} {n(G - 26 - by - br_)}'
    sc.k(bl, w=.8)
    # the small machine holding them, waiting by the booth
    machine(sc, 642, G, 1.25, 'stand', look=(-1.2, -1.6))

    # the park's gate on the left: two pillars, an arch of bulbs, a blank sign hanging askew
    gate = rect(40, 404, 26, 136) + rect(170, 404, 26, 136)
    sc.k(gate)
    sc.k(poly([(34, 404), (72, 404), (72, 396), (34, 396)]) + poly([(164, 404), (202, 404), (202, 396), (164, 396)]), w=.9)
    sc.s('M66 420Q118 350 170 420M66 432Q118 364 170 432' + ''.join(circle_path(66 + t * 104, 420 - math.sin(t * math.pi) * 36, 2.2) for t in (.1, .25, .4, .55, .7, .85)), w=.8)
    sc.k('M92 388l-2 -18M144 386l2 -18M84 370h68l-4 26h-60Z', w=.9)
    sc.s(hatch([(56, 406), (66, 406), (66, 540), (56, 540)], 90, 3.4, rng, inset=1) + hatch([(186, 406), (196, 406), (196, 540), (186, 540)], 90, 3.4, rng, inset=1), w=.55, op=.7)
    hang_vines(sc, rng, [(70, 424), (96, 396), (140, 398), (168, 426), (44, 406), (192, 406)], (20, 70), sway=(2, 4))
    # the Ferris wheel: its legs and platform are fixed; the wheel itself is one group, round capsules on its rim,
    # so it can turn without tilting anything
    WX, WY, WR = 380, 292, 168
    legs = poly([(WX - 6, WY), (WX - 86, G), (WX - 72, G), (WX, WY + 18)]) + poly([(WX + 6, WY), (WX + 86, G), (WX + 72, G), (WX, WY + 18)])
    sc.k(legs)
    br = ''
    for t in (.35, .6, .82):
        y = WY + (G - WY) * t
        br += line(WX - 80 * t, y, WX + 80 * t, y)
    sc.s(br + line(WX - 50, WY + 150, WX + 30, WY + 222) + line(WX + 50, WY + 150, WX - 30, WY + 222), w=.7, op=.85)
    sc.k(rect(WX - 110, G - 26, 220, 10))
    sc.s(''.join(line(WX - 110 + i * 22, G - 16, WX - 110 + i * 22, G) for i in range(11)), w=.6, op=.8)
    hang_vines(sc, rng, [(WX - 40, WY + 120), (WX + 52, WY + 160), (WX - 64, WY + 200)], (20, 70), sway=(2, 4))
    # the capsule that fell, lying in the grass
    sc.k(circle_path(WX + 128, G - 11, 11), w=.9)
    sc.s(circle_path(WX + 128, G - 11, 6.5) + tuft(WX + 118, G, rng, 8, 4) + tuft(WX + 138, G, rng, 7, 3), w=.6)

    # a lamp post with a sagging string of bulbs; the ground, grass pushing through
    sc.s(f'M{880} {G}v-96M872 {G - 96}h16M{880} {G - 94}Q{930} {G - 60} {968} {G - 66}', w=.85)
    sc.s(''.join(circle_path(880 + t * 88, G - 94 + (math.sin(t * math.pi) * 24) + t * 28, 2.2) for t in (.2, .4, .6, .8)), w=.6)
    for bx, bw, bh in ((250, 60, 20), (520, 46, 16), (720, 70, 22), (1040, 50, 16), (1470, 80, 24), (1580, 60, 18)):
        bush(sc, rng, bx, G, bw, bh)
    sc.s(line(0, G, W, G), w=.9)
    sc.s(grass_run(0, W, G, rng, density=.3, h=9) + grass_run(0, W, G + 12, rng, density=.12, h=6), w=.7)
    ln, so = rubble(0, W, G, rng, count=16, size=(3, 6))
    sc.s(ln, w=.7)
    # the wheel last: it is lifted into its own layer when it turns, so it sits on top either way
    sc.open(f'class="a-wheel" data-box="{WX - WR - 16} {WY - WR - 16} {2 * WR + 32} {2 * WR + 32}"')
    rim = circle_path(WX, WY, WR) + circle_path(WX, WY, WR - 7) + circle_path(WX, WY, WR * .42)
    spokes = ''
    for i in range(18):
        a = 2 * math.pi * i / 18
        spokes += line(WX + math.cos(a) * 10, WY + math.sin(a) * 10, WX + math.cos(a) * (WR - 7), WY + math.sin(a) * (WR - 7))
        b = 2 * math.pi * (i + .5) / 18
        spokes += line(WX + math.cos(a) * (WR - 7), WY + math.sin(a) * (WR - 7), WX + math.cos(b) * WR * .42, WY + math.sin(b) * WR * .42)
    sc.s(rim, w=.95)
    sc.s(spokes, w=.6, op=.85)
    caps, capw = '', ''
    for i in range(12):
        if i == 7:
            continue  # one capsule gone
        a = 2 * math.pi * i / 12 + .13
        x, y = WX + math.cos(a) * (WR + 2), WY + math.sin(a) * (WR + 2)
        caps += circle_path(x, y, 12)
        capw += circle_path(x, y, 7)
    sc.k(caps, w=.9)
    sc.s(capw, w=.6, op=.8)
    sc.k(circle_path(WX, WY, 12), w=.9)
    sc.f(circle_path(WX, WY, 4))
    sc.close()
    return sc

# =====================================================================================================================
# Flooded City: towers standing tilted in still water, their reflections broken into horizontal strokes, a drowned
# street's last signs showing above the surface.
# =====================================================================================================================
def reflect_strokes(outline, water_y, rng, gap=5.5, depth=1.0, keep=.8):
    """The reflection of a shape standing on the water line: its mirror image cut into broken horizontal strokes that
    thin out with depth."""
    mirror = [(x, 2 * water_y - y) for x, y in outline]
    ys = [p[1] for p in mirror]
    y0, y1 = water_y + 3, min(max(ys), water_y + (max(ys) - water_y) * depth, H - 2)
    out = ''
    y = y0
    while y < y1:
        t = (y - y0) / max(y1 - y0, 1)
        for a, b in clip_segments(mirror, (-100, y), (1, 0)):
            xa, xb = -100 + a, -100 + b
            if xb - xa < 3:
                continue
            x = xa + rng.uniform(0, 3)
            while x < xb - 2:
                L = rng.uniform(6, 26) * (1 - t * .55)
                e = min(x + L, xb)
                if rng.random() < keep * (1 - t * .5):
                    out += hline(x + rng.uniform(-2, 2) * t, y, e - x)
                x = e + rng.uniform(3, 10) * (1 + t * 1.4)
        y += gap * (1 + t * .5)
    return out


def ruin_outline(x, wl, w, h, kind, rng):
    """A drowned building's outline standing on the water line, by kind: broken, stepped, mast, leaning, notched."""
    t = wl - h
    if kind == 'stepped':
        s1 = rng.uniform(.35, .6)
        top = [(x, t + h * .22), (x + w * s1, t + h * .22), (x + w * s1, t), (x + w * .85, t + rng.uniform(0, 8)), (x + w, t + 10)]
    elif kind == 'mast':
        top = [(x, t), (x + w * .45, t), (x + w * .45, t - h * .45), (x + w * .5, t - h * .45), (x + w * .5, t), (x + w, t + 3)]
    elif kind == 'notched':
        top = [(x, t + 6), (x + w * .3, t), (x + w * .55, t + h * .3), (x + w * .72, t + h * .12), (x + w, t + 4)]
    else:
        k = rng.randint(3, 5)
        top = [(x + w * i / k, t + rng.uniform(0, h * .22)) for i in range(k + 1)]
    ps = [(x, wl + 4)] + top + [(x + w, wl + 4)]
    if kind == 'leaning':
        lean = rng.choice((-1, 1)) * rng.uniform(4, 10)
        ps = [(px + lean * (wl - py) / max(h, 1), py) for px, py in ps]
    return ps


def ripple_rings(cx, y, w, rng, rings=3):
    out = ''
    for i in range(rings):
        rx, ry = w / 2 + 10 + i * 15, 2.5 + i * 2
        a0, a1 = rng.uniform(8, 30), rng.uniform(150, 172)
        out += smooth(arc_pts(cx, y, rx, ry, a0, a1, 10))
    return out


def flooded() -> Scene:
    sc = Scene('flooded', 'Flooded City')
    rng = random.Random(8484)
    WL = 404  # the water line at the horizon
    # far: long quiet clouds, the drowned skyline (broken, stepped, masts, leaning, notched, some hazed), mist on the
    # water at its foot
    sc.plane(.42)
    sc.s(hline(120, 150, 260) + hline(180, 160, 160) + hline(1080, 120, 300) + hline(1160, 131, 180), w=.75, op=.9)
    far, haze, refl = '', '', ''
    x = -10
    while x < W:
        w = rng.uniform(22, 64)
        h = rng.uniform(28, 118)
        kind = rng.choice(('broken', 'broken', 'stepped', 'mast', 'leaning', 'notched', 'plain'))
        ps = ruin_outline(x, WL, w, h, kind, rng)
        far += poly(ps)
        if rng.random() < .4:
            haze += hatch(ps, 90, 6, rng, keep=.7, inset=3)
        refl += reflect_strokes(ps, WL, rng, gap=6, depth=.45, keep=.45)
        x += w + rng.uniform(6, 40)
    sc.s(refl, w=.7, op=.7)
    sc.k(far, w=.8)
    sc.s(haze, w=.7, op=.7)
    mist = ''.join(hline(rng.uniform(-60, 1500), WL - rng.uniform(2, 14), rng.uniform(120, 420)) for _ in range(9))
    sc.s(mist, w=.75, op=.8)

    # mid: ruins half a mile off: a broken dome, a bare frame, a stepped block, a radio mast, broken towers
    sc.plane(.7)
    mid = [(478, 420, 58, 140, 'frame'), (862, 424, 130, 70, 'dome'), (1082, 426, 58, 118, 'stepped'), (1398, 422, 40, 150, 'mast'),
           (214, 418, 62, 150, 'broken'), (1560, 420, 60, 130, 'notched'), (700, 416, 44, 96, 'leaning')]
    for x, wl, w, h, kind in sorted(mid, key=lambda t: t[1]):
        if kind == 'dome':
            cx = x + w / 2
            ps = arc_pts(cx, wl + 4, w / 2, h, 180, 360, 24)
            ps = [(px, py + (10 if 250 < 180 + (i * 180 / 24) < 280 and py < wl - h * .8 else 0)) for i, (px, py) in enumerate(ps)]
            sc.s(reflect_strokes(ps, wl, rng, gap=5.2, depth=.7, keep=.75), w=.75, op=.8)
            sc.k(poly(ps))
            ribs = ''.join(smooth([(cx + (w / 2) * f * math.cos(math.radians(a_)), wl + 4 - h * math.sin(math.radians(a_))) for a_ in range(0, 91, 15)]) for f in (-.6, -.25, .25, .6))
            sc.s(ribs + hline(x + 6, wl - h * .35, w - 12), w=.75, op=.8)
            sc.s(hatch(arc_pts(cx - 8, wl - h * .78, 16, 9, 0, 360, 12), 90, 2.8, rng), w=.75)
            continue
        if kind == 'frame':
            ps = [(x, wl + 4), (x, wl - h), (x + w, wl - h + 16), (x + w, wl + 4)]
            sc.s(reflect_strokes(ps, wl, rng, gap=5.2, depth=.7, keep=.6), w=.75, op=.8)
            fr = ''.join(vline(x + i * w / 3, wl - h + (6 if i else 0) + i * 5, h - i * 5 + 4) for i in range(4))
            fr += ''.join(hline(x, wl - h + 18 + j * 24, w) for j in range(int(h / 24)))
            sc.s(fr, w=.9)
            continue
        ps = ruin_outline(x, wl, w, h, kind, rng)
        sc.s(reflect_strokes(ps, wl, rng, gap=5.2, depth=.7, keep=.75), w=.75, op=.8)
        sc.k(poly(ps))
        sc.s(''.join(hline(x + 4, wl - 16 - j * 18, w - 8) for j in range(int((h - 20) / 18)) if rng.random() < .6), w=.75, op=.7)
        if kind == 'mast':
            sc.s(line(x + w * .47, wl - h * 1.45, x - 30, wl) + line(x + w * .47, wl - h * 1.45, x + w + 34, wl), w=.75, op=.7)

    # near: the towers standing tilted in the water, overgrown, their reflections deep
    sc.plane(1)
    specs = [(80, 132, 420, -5, 494, None), (300, 86, 250, 8, 448, None), (378, 74, 290, -3, 444, None),
             (1004, 58, 232, 4, 434, 'dark'), (1150, 64, 170, -9, 426, None), (1226, 158, 404, 4, 504, None),
             (1470, 90, 176, -2, 440, None)]
    rings = ''
    for (x, w, h, tilt, wl, kind) in sorted(specs, key=lambda t: t[4]):
        cx = x + w / 2
        top = wl - h
        k = rng.randint(3, 5)
        jag = [(x + w * i / k, top + rng.uniform(0, 22)) for i in range(k + 1)]
        outline = [(x, wl + 6)] + jag + [(x + w, wl + 6)]
        rot_out = [rot(p, (cx, wl), tilt) for p in outline]
        sc.s(reflect_strokes(rot_out, wl, rng, gap=4.8, depth=.9, keep=.85), w=.75, op=.75)
        sc.open(f'transform="rotate({num(tilt)} {n(cx)} {n(wl)})"')
        sc.k(poly(outline))
        if kind == 'dark':
            face = [(x + 2, wl), (x + 2, jag[0][1] + 4)] + [(px, py + 4) for px, py in jag[1:-1]] + [(x + w - 2, jag[-1][1] + 4), (x + w - 2, wl)]
            sc.s(hatch(face, 90, 3.6, rng, inset=1), w=.75, op=.6)
            sc.k(''.join(rect(x + 10 + c * 18, wl - h + 40 + r * 26, 8, 12) for c in range(int((w - 16) / 18)) for r in range(int((h - 60) / 26)) if rng.random() < .35), stroke=False)
        else:
            fl = ''
            yy = wl - 22
            while yy > top + 26:
                fl += hline(x + 4, yy, w - 8) if rng.random() < .55 else hline(x + 4 + rng.uniform(0, w * .4), yy, w * rng.uniform(.2, .5))
                yy -= 22
            sc.s(fl, w=.7, op=.75)
            sc.f(''.join(rect(x + 10 + c * 16, wl - h + 38 + r * 22, 5, 7) for c in range(int((w - 12) / 16)) for r in range(int((h - 56) / 22)) if rng.random() < .1), op=.8)
            sc.s(hatch([(x + w * .8, wl), (x + w, wl), (x + w, jag[-1][1] + 3), (x + w * .8, jag[-2][1] + 6)], 75, 5, rng, keep=.9, inset=1), w=.7, op=.7)
        sc.close()
        wlx0, wlx1 = rot((x, wl), (cx, wl), tilt)[0], rot((x + w, wl), (cx, wl), tilt)[0]
        sc.s(f'M{n(wlx0 - 12)} {n(wl + 2)}h{n(wlx1 - wlx0 + 24)}', w=.85)
        rings += ripple_rings((wlx0 + wlx1) / 2, wl + 4, wlx1 - wlx0, rng, 2 if h < 300 else 3)
        hang_vines(sc, rng, along([rot(p, (cx, wl), tilt) for p in jag], rng, 3), (30, 110), sway=(2, 5))
        if h > 400:
            px, py = rot(jag[len(jag) // 2], (cx, wl), tilt)
            sc.k(canopy(px, py - 12, 26, 14, rng, ps=crown_pts(px, py - 12, 26, 14, rng)), w=.9)
    sc.s(rings, w=.75, op=.55)
    # the water: long calm strokes, fine and close toward the horizon, wider apart and longer near
    wat = ''
    y = WL + 5
    while y < H:
        t = (y - WL) / (H - WL)
        for _ in range(int(2 + 4 * (1 - t))):
            wat += hline(rng.uniform(-60, 1600), y, rng.uniform(60, 260) * (0.5 + t))
        y += 7 + t * 18
    sc.s(wat, w=.75, op=.4)
    # a drowned overpass: its deck slanting into the water, railings still standing
    ov = [(560, 452), (820, 424), (822, 434), (562, 464)]
    sc.s(reflect_strokes(ov + [(560, 470)], 466, rng, gap=5, depth=.9), w=.75, op=.6)
    sc.k(poly(ov))
    sc.s(line(560, 443, 820, 415) + ''.join(line(566 + i * 16, 451 - i * 1.72, 566 + i * 16, 442 - i * 1.72) for i in range(16)), w=.75)
    sc.s(rebar(822, 430, rng, 3, 12), w=.75)
    hang_vines(sc, rng, [(600, 461), (680, 452), (760, 444)], (10, 30), sway=(1, 3))
    # what shows above the surface: a sign, a lamp post, a bus roof
    sc.s('M902 500v-46M890 454h24v14h-24ZM902 502h-10M902 502h12', w=.85)
    sc.s(reflect_strokes([(890, 502), (890, 454), (914, 454), (914, 502)], 502, rng, gap=5, depth=.8), w=.75, op=.6)
    sc.s('M960 470v-80q0-10 10-12l12-2', w=.9)
    sc.s(reflect_strokes([(958, 470), (958, 392), (962, 392), (962, 470)], 470, rng, gap=5, depth=.6), w=.75, op=.5)
    sc.k('M1400 530l6 -12h96l6 12Z', w=.9)
    sc.s(''.join(rect(1416 + i * 16, 521, 10, 6) for i in range(5)) + 'M1390 534h130', w=.75, op=.8)
    # a drifting boat; a small machine sits in it, fishing, its line making rings on the still water
    machine(sc, 718, 512, 1.05, 'sit', look=(1.2, .6))
    sc.s('M728 500l40 -40M768 460q14 20 18 58', w=.8)
    sc.s(ripple_rings(786, 520, 4, rng, 3) + 'M786 516v4', w=.75, op=.7)
    sc.k('M690 516q30 10 62 0l-6 -9h-50Z', w=.95)
    sc.s('M692 522h58M700 526h40', w=.75, op=.7)
    sc.s(birds([(652, 176), (670, 168), (688, 182)], rng, size=5), w=.85)
    # glints on the water, twinkling when the scene may move
    gl = ''
    for _ in range(18):
        x, y = rng.uniform(40, 1560), rng.uniform(WL + 10, H - 10)
        gl += hline(x, y, rng.uniform(4, 9))
    sc.open('class="a-glints" data-box="0 400 1600 160"')
    sc.s(gl, w=.9)
    sc.close()
    return sc


SCENES = {'city': city, 'bunker': bunker, 'desert': desert, 'forest': forest, 'park': park, 'flooded': flooded}


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--write', action='store_true')
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--only', default='')
    a = ap.parse_args(argv)
    keys = [k for k in (a.only.split(',') if a.only else SCENES) if k]
    bad = 0
    for k in keys:
        svg = SCENES[k]().svg()
        path = OUT / f'{k}.svg'
        if a.check:
            if not path.exists() or path.read_text(encoding='utf-8') != svg:
                print(f'{path.relative_to(PKG)} differs from what tools/nier_scene_art.py draws')
                bad += 1
            continue
        if a.write:
            OUT.mkdir(parents=True, exist_ok=True)
            path.write_text(svg, encoding='utf-8')
        print(f'{k}: {len(svg.encode()) / 1024:.1f} KB, {svg.count("<path")} paths')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
