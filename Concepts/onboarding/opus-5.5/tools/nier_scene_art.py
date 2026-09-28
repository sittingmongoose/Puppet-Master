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
                    out.append(line(p[0] + d[0] * t, p[1] + d[1] * t, p[0] + d[0] * e, p[1] + d[1] * e))
                    t = e + dash[1] * (0.5 + (rng.random() if rng else 0.5))
            else:
                out.append(line(p[0] + d[0] * t0, p[1] + d[1] * t0, p[0] + d[0] * t1, p[1] + d[1] * t1))
        k += gap
    return ''.join(out)


# ---------- the document ------------------------------------------------------------------------------------------------
def num(v: float) -> str:
    """An attribute number: up to two decimals, no leading zero, no trailing zeros."""
    s = f'{v:.2f}'.rstrip('0').rstrip('.')
    return s[1:] if s.startswith('0.') else s


class Scene:
    """Paths in drawing order (back to front). Strokes inherit the root's ink and width; `f` paths are solid ink; `k`
    paths are stroked and filled with the ground colour (class k), so a nearer object hides what lies behind it."""

    def __init__(self, key: str, title: str):
        self.key, self.title = key, title
        self.items: list[str] = []

    @staticmethod
    def _a(w=None, op=None, cls=None, fill=False):
        a = ''
        if cls:
            a += f' class="{cls}"'
        if fill:
            a += ' fill="currentColor" stroke="none"'
        if w is not None:
            a += f' stroke-width="{num(w)}"'
        if op is not None:
            a += f' opacity="{num(op)}"'
        return a

    def s(self, d: str, w=None, op=None, cls=None):
        """A stroked path; w is the stroke width in screen pixels (the layer draws non-scaling strokes)."""
        if d:
            self.items.append(f'<path{self._a(w, op, cls)} d="{d}"/>')

    def f(self, d: str, op=None, cls=None):
        """A solid ink shape."""
        if d:
            self.items.append(f'<path{self._a(None, op, cls, fill=True)} d="{d}"/>')

    def k(self, d: str, w=None, op=None):
        """An outline filled with the ground colour, hiding what is behind it."""
        if d:
            self.items.append(f'<path{self._a(w, op, "k")} d="{d}"/>')

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
        for dc in range(rng.randint(1, 3)):
            for dr in range(rng.randint(2, 4)):
                if rng.random() < .75 and c0 + dc < cols:
                    yy = base - (r0 + dr) * fh
                    if yy - fh * .7 > crown():
                        voids += rect(x + (c0 + dc) * cw + cw * .22, yy - fh * .7, cw * .56, fh * .5)
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
    sc.k(far, w=.7, op=.55)
    sc.s(haze, w=.6, op=.35)

    # 2. back towers
    c_crown, _ = tower(sc, rng, 590, G, 96, 405, tilt=-3, floors=21, skeleton_from=.72, clusters=1)
    d_crown, _ = tower(sc, rng, 868, G, 128, 300, floors=15, bite=('r', .52, .7, 38), clusters=2)
    e_crown, _ = tower(sc, rng, 1060, G, 118, 250, tilt=1.5, floors=12, clusters=1)
    g_crown, _ = tower(sc, rng, 1380, G, 150, 228, floors=11, skeleton_from=.38, clusters=1, side_hatch=False)

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
        shade += rect(x0 + 4, deck + dh, x1 - x0 - 8, 4)
        rail += hline(x0, deck - 9, x1 - x0)
        xx = x0 + 6
        while xx < x1:
            rail += vline(xx, deck - 9, 9)
            xx += 18
    sc.k(deckp)
    sc.f(shade, op=.9)
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
    b_crown, _ = tower(sc, rng, 270, G, 92, 300, floors=15, clusters=1)
    a_crown, _ = tower(sc, rng, 60, G, 158, 462, tilt=4.5, floors=24, bite=('l', .36, .5, 32), clusters=2)
    f_crown, _ = tower(sc, rng, 1236, G, 100, 432, tilt=-11.5, floors=22, clusters=2, broken=True)
    h_crown, _ = tower(sc, rng, 1520, G, 118, 360, tilt=-1.5, floors=18, clusters=1)

    # vines from the crowns, a creeper up the leaning tower, trees rooted on the roofs
    hang_vines(sc, rng, along(a_crown, rng, 6), (70, 250))
    hang_vines(sc, rng, along(f_crown, rng, 4), (60, 200))
    hang_vines(sc, rng, along(c_crown, rng, 2) + along(e_crown, rng, 3) + along(h_crown, rng, 4) + along(b_crown, rng, 2), (30, 150))
    for crown, at, r in ((a_crown, .45, 18), (e_crown, .35, 14), (h_crown, .55, 15), (b_crown, .7, 10)):
        px, py = crown[int(len(crown) * at)]
        sc.k(canopy(px, py - r * .6, r * 1.2, r * .7, rng, ps=crown_pts(px, py - r * .6, r * 1.2, r * .7, rng)), w=.9)

    # 5. the street: trees, a car, a bent lamp, rubble, grass
    tree(sc, rng, 470, G, 70, 30)
    tree(sc, rng, 1112, G, 84, 34, lean=-6)
    tree(sc, rng, 1346, G, 50, 22)
    tree(sc, rng, 26, G, 58, 26)
    tree(sc, rng, 1476, G, 64, 36, solid=True, lean=4)
    car = poly([(505, G), (508, G - 14), (522, G - 16), (534, G - 27), (566, G - 27), (578, G - 16), (596, G - 13), (598, G)])
    sc.k(car)
    sc.s(poly([(538, G - 24), (548, G - 24), (548, G - 16), (531, G - 16)]) + poly([(552, G - 24), (563, G - 24), (572, G - 16), (552, G - 16)])
         + circle_path(522, G - 1, 6) + circle_path(583, G - 1, 6), w=.9)
    sc.s(f'M1206 {G}v-92q0-18 16-22l22-5', w=1.1)
    sc.f(poly([(1242, 422), (1256, 419), (1254, 425), (1243, 428)]))
    for bx, bw, bh in ((96, 70, 26), (238, 44, 18), (352, 60, 22), (640, 90, 30), (905, 70, 22), (1030, 56, 20),
                       (1262, 80, 28), (1430, 50, 18), (1560, 90, 30)):
        bush(sc, rng, bx, G, bw, bh)
    ln, so = rubble(0, W, G, rng, count=36)
    sc.s(ln, w=.8)
    sc.f(so, op=.9)
    sc.s(line(0, G, W, G), w=.9)
    cracks = ''
    for _ in range(8):
        cx = rng.uniform(40, W - 40)
        cracks += f'M{n(cx)} {n(G + 5)}l{n(rng.uniform(8, 20))} {n(rng.uniform(3, 7))}l{n(rng.uniform(6, 14))} {n(rng.uniform(-2, 5))}'
    sc.s(cracks, w=.75, op=.8)
    sc.s(grass_run(0, W, G, rng, density=.18, h=8), w=.75)

    # 6. the sky: a few birds over the gap
    sc.s(birds([(760, 150), (781, 141), (799, 156), (1010, 96), (1027, 106)], rng, size=5), w=.9)
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


def bunker() -> Scene:
    sc = Scene('bunker', 'The Bunker')
    rng = random.Random(4242)
    # the planet: a great circle whose limb arcs across the lower picture
    PX, PY, PR = 940, 2960, 2600
    top_y = lambda x: PY - math.sqrt(max(PR * PR - (x - PX) ** 2, 0))
    ang = lambda x: math.degrees(math.atan2(-math.sqrt(max(PR * PR - (x - PX) ** 2, 0)), x - PX))
    a_l, a_r = ang(-40), ang(1640)
    # stars first, so the planet and the station hide those behind them
    stars = ''
    for _ in range(30):
        x, y = rng.uniform(20, 1580), rng.uniform(60, 360)
        if y > top_y(x) - 40:
            continue
        k = rng.uniform(1.6, 3.4)
        stars += f'M{n(x - k)} {n(y)}h{n(2 * k)}M{n(x)} {n(y - k)}v{n(2 * k)}' if rng.random() < .4 else f'M{n(x)} {n(y)}h.1'
    sc.s(stars, w=.9, op=.8)
    limb = arc_pts(PX, PY, PR, PR, a_l, a_r, 56)
    sc.k(poly(limb + [(1640, 600), (-40, 600)]))
    sc.s(arc_path(PX, PY, PR + 7, a_l, a_r) + arc_path(PX, PY, PR + 17, a_l + .4, a_r - .6), w=.7, op=.6)
    sc.s(arc_path(PX, PY, PR + 32, a_l + 3, a_r - 3), w=.6, op=.3)
    # cloud bands along the curve
    clouds = ''
    for d, span in ((12, (a_l + 1, a_l + 12)), (20, (a_l + 15, a_r - 16)), (38, (a_l + 4, a_l + 20)), (46, (a_l + 24, a_r - 6)),
                    (70, (a_l + 8, a_l + 30)), (96, (a_l + 20, a_r - 12)), (128, (a_l + 2, a_r - 22)), (160, (a_l + 10, a_r - 30))):
        a0, a1 = span
        while a0 < a1:
            seg = rng.uniform(2.5, 7.5)
            clouds += arc_scallops(PX, PY, PR - d - rng.uniform(-4, 4), a0, min(a0 + seg, a1), rng, bump=(6, 16))
            a0 += seg + rng.uniform(1.2, 4.5)
    sc.s(clouds, w=.8, op=.85)
    # two continents seen flat on the curve: wobbling outlines with bays, their land hatched in broken strokes
    for ca, cw, cd, ch, seed in ((a_l + 29, 12, 70, 62, 3), (a_l + 17.5, 5, 44, 30, 7)):
        lr = random.Random(seed)
        land = []
        for i in range(40):
            t = 2 * math.pi * i / 40
            wob = 1 + .16 * math.sin(3 * t + lr.uniform(0, 6)) + .1 * math.sin(5 * t + lr.uniform(0, 6)) + lr.uniform(-.05, .05)
            aa = ca + cw / 2 * math.cos(t) * wob
            rr = PR - cd - ch / 2 * math.sin(t) * wob
            land.append((PX + rr * math.cos(math.radians(aa)), PY + rr * math.sin(math.radians(aa))))
        sc.s(smooth(land, close=True), w=.8, op=.75)
        sc.s(hatch(land, 14, 7, rng, keep=.6, inset=4, dash=(8, 7)), w=.55, op=.45)
    # the night side: the terminator's dusk in broken arcs
    nh = ''
    for i in range(10):
        r = PR - 8 - i * 14
        a0 = ang(1210 + i * 26 + rng.uniform(-10, 10))
        nh += arc_path(PX, PY, r, a0, a_r)
    sc.s(nh, w=.6, op=.5)
    # the station's orbit, a dashed ellipse arc sweeping past it
    orb = arc_pts(760, 420, 980, 150, 196, 338, 90)
    od = ''
    for i in range(0, len(orb) - 1, 2):
        od += line(*orb[i], *orb[i + 1])
    sc.s(od, w=.6, op=.55)

    # the station, tilted in orbit over the limb
    cx, cy = 600, 262
    sc.open(f'transform="rotate(-8 {cx} {cy})"')
    # the ring's far half, behind everything
    sc.s(smooth(arc_pts(cx, cy, 120, 26, 180, 360, 36)) + smooth(arc_pts(cx, cy, 110, 21, 180, 360, 36)), w=.85)

    def truss(x0, x1, y0, y1):
        d = poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)])
        k = ''
        step = 13 if x1 > x0 else -13
        x, up = x0, True
        while (x1 - x) * step > 0:
            nx = x + step if (x1 - x - step) * step >= 0 else x1
            k += line(x, y1 if up else y0, nx, y0 if up else y1)
            up = not up
            x = nx
        return d, k
    arms_o, arms_k = '', ''
    for sgn, ln_ in ((-1, 390), (1, 420)):
        d, k = truss(cx + sgn * 30, cx + sgn * ln_, cy - 6, cy + 6)
        arms_o += d
        arms_k += k
    # a second, shorter spar under the main one, carrying the solar wings
    for sgn, ln_ in ((-1, 300), (1, 330)):
        d, k = truss(cx + sgn * 150, cx + sgn * ln_, cy + 34, cy + 42)
        arms_o += d + line(cx + sgn * 160, cy + 6, cx + sgn * 160, cy + 34) + line(cx + sgn * (ln_ - 10), cy + 6, cx + sgn * (ln_ - 10), cy + 34)
        arms_k += k
    sc.k(arms_o)
    sc.s(arms_k, w=.65, op=.85)
    # solar wings hanging from the lower spar, hatched as cells
    wings = ''
    wh = ''
    for sgn, x0 in ((-1, 170), (1, 180)):
        for i in range(2):
            wx = cx + sgn * (x0 + i * 72) - (60 if sgn < 0 else 0)
            wing = [(wx, cy + 48), (wx + 60, cy + 48), (wx + 60, cy + 120), (wx, cy + 120)]
            wings += poly(wing) + line(wx + 30, cy + 42, wx + 30, cy + 48)
            wh += hatch(wing, 90, 7.5, rng, inset=1) + hline(wx, cy + 72, 60) + hline(wx, cy + 96, 60)
    sc.k(wings, w=.85)
    sc.s(wh, w=.5, op=.7)
    # modules along the main arms, with hexagonal ports
    mods, md = '', ''
    for sgn in (-1, 1):
        for off, mw, mh in ((74, 44, 30), (230, 58, 38), (330, 34, 24)):
            mx = cx + sgn * off - mw / 2
            mods += rect(mx, cy - mh / 2, mw, mh)
            if mw > 40:
                md += hline(mx + 4, cy - mh / 2 + 6, mw - 8) + hline(mx + 4, cy + mh / 2 - 6, mw - 8)
                for i in range(3):
                    md += poly(hexagon(mx + mw * (i + 1) / 4, cy, 4.5))
    sc.k(mods)
    sc.s(md, w=.65, op=.85)
    # radiator fins at the ends
    fins, fh = '', ''
    for sgn, ln_ in ((-1, 390), (1, 420)):
        for i in range(3):
            fx = cx + sgn * (ln_ + 10 + i * 20)
            f = [(fx - 7, cy - 64), (fx + 7, cy - 64), (fx + 7, cy + 50), (fx - 7, cy + 50)]
            fins += poly(f)
            fh += hatch(f, 0, 6, rng, inset=1.5)
        fins += line(cx + sgn * ln_, cy, cx + sgn * (ln_ + 57), cy)
    sc.k(fins, w=.85)
    sc.s(fh, w=.5, op=.7)
    # the core: an octagonal tower with lit ports, spires above and below
    core = [(cx - 22, cy - 96), (cx + 22, cy - 96), (cx + 32, cy - 78), (cx + 32, cy + 78), (cx + 22, cy + 96),
            (cx - 22, cy + 96), (cx - 32, cy + 78), (cx - 32, cy - 78)]
    sp = line(cx, cy - 96, cx, cy - 176) + line(cx, cy + 96, cx, cy + 150)
    for yy, ww in ((-120, 16), (-140, 12), (-160, 8), (118, 10), (136, 7)):
        sp += line(cx - ww, cy + yy, cx + ww, cy + yy)
    sc.s(sp, w=.9)
    sc.f(poly(hexagon(cx, cy - 180, 4)))
    sc.k(poly(core))
    cd = line(cx - 11, cy - 96, cx - 11, cy + 96) + line(cx + 11, cy - 96, cx + 11, cy + 96)
    for yy in (-64, -34, 34, 64):
        cd += line(cx - 32, cy + yy, cx + 32, cy + yy)
    sc.s(cd, w=.7, op=.85)
    sc.s(hatch([(cx + 11, cy - 96), (cx + 22, cy - 96), (cx + 32, cy - 78), (cx + 32, cy + 78), (cx + 22, cy + 96), (cx + 11, cy + 96)], 90, 3.4, rng, inset=1), w=.55, op=.75)
    sc.f(''.join(rect(cx - 3, cy + yy - 3, 6, 6) for yy in (-80, -50, 50, 80)))
    # the ring's near half, a band across the core, with its spokes
    sc.k(poly(arc_pts(cx, cy, 120, 26, 0, 180, 36) + list(reversed(arc_pts(cx, cy, 110, 21, 0, 180, 36)))), w=.9)
    tk = ''
    for i in range(1, 14):
        a = 180 * i / 14
        tk += line(cx + 110 * math.cos(math.radians(a)), cy + 21 * math.sin(math.radians(a)), cx + 120 * math.cos(math.radians(a)), cy + 26 * math.sin(math.radians(a)))
    sc.s(tk, w=.55, op=.8)
    sc.close()

    # a far satellite and a supply shuttle crossing
    s2 = rect(1318, 150, 18, 12) + line(1300, 156, 1318, 156) + line(1336, 156, 1354, 156) + rect(1286, 148, 14, 16) + rect(1354, 148, 14, 16)
    sc.k(s2, w=.8)
    sc.k('M1110 330l30 -7l9 5l-9 5Z', w=.8)
    sc.s('M1100 331h-50M1094 334h-26', w=.6, op=.5)

    # the great window: a rounded aperture; the frame around it paved with hexagonal panels, deeper at the corners
    L, Rt, B, CR = 46, W - 46, H - 30, 200

    def outside(x, y, pad=0.0):
        if x < L - pad or x > Rt + pad or y > B + pad:
            return True
        for ccx in (L + CR, Rt - CR):
            ccy = B - CR
            if (x - ccx) * (1 if ccx > W / 2 else -1) > 0 and y > ccy and math.hypot(x - ccx, y - ccy) > CR + pad:
                return True
        return False
    R = 19
    hx, hy = R * 1.5, R * math.sqrt(3)
    frame, solid, inner = '', '', ''
    for col in range(int(W / hx) + 2):
        for row in range(int(H / hy) + 2):
            x = col * hx
            y = H + 6 - row * hy - (hy / 2 if col % 2 else 0)
            if y < 250 or not outside(x, y, pad=R * .55):
                continue
            frame += poly(hexagon(x, y, R - 1.5))
            r = rng.random()
            if r < .12:
                solid += poly(hexagon(x, y, R - 6.5))
            elif r < .36:
                inner += poly(hexagon(x, y, R - 7))
    # the rim: the aperture's outline twice, a gasket between
    def rim(off):
        ps = [(L - off, 250)]
        ps += arc_pts(L + CR, B - CR, CR + off, CR + off, 180, 90, 20)
        ps += arc_pts(Rt - CR, B - CR, CR + off, CR + off, 90, 0, 20)
        ps += [(Rt + off, 250)]
        return ps
    sc.k(poly(rim(9) + list(reversed(rim(-3)))), w=1)
    sc.s(smooth(rim(3)), w=.55, op=.7)
    sc.k(frame, w=.85)
    sc.s(inner, w=.55, op=.75)
    sc.f(solid, op=.85)
    return sc


SCENES = {'city': city, 'bunker': bunker}


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
