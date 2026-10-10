#!/usr/bin/env python3
"""Fit the glyph inks: one ink per tone per look that reads at least 3:1 (the brief's gate) on every field a glyph sits
on in that look, keeping the look's own hue. Writes src/bridge/pm7-glyph-inks.css (literal colours: neon-icons.css
forbids color-mix) and prints the before/after table that the catalog shows.

Source tokens come from src/bridge/pm7-looks.css (tools/extract_looks.py). A tone whose PM7 token already passes keeps
it exactly; one that fails moves in HSL lightness only (darker on light looks, lighter on dark ones) in 0.5 % steps
until the lowest contrast over the fields reaches TARGET. Glass fields are translucent: they are composited over the
look's --background, the catalog's stand-in for the wallpaper (the real wallpaper is checked in the GPU film).
"""
from __future__ import annotations
import colorsys
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOOKS_CSS = HERE.parent / 'src' / 'bridge' / 'pm7-looks.css'
OUT = HERE.parent / 'src' / 'bridge' / 'pm7-glyph-inks.css'
REPORT = HERE.parent / 'src' / 'data' / 'ink-report.json'
TARGET = 3.1          # 3:1 gate plus a little room for antialiasing at 12 px
FIELDS = ('--background', '--surface', '--surface-elevated', '--surface-alt')
# tone -> the PM7 token it starts from (neon tone: blocked=danger, attention=warning, working=accent,
# changed=accent-2, done=positive, paused=muted, idle=subtle; concept = the default ink for concept glyphs)
TONES = {
    'blocked': '--accent-error', 'attention': '--accent-warning', 'working': '--accent-blue',
    'changed': '--accent-magenta', 'done': '--accent-lime', 'paused': '--text-secondary', 'idle': '--text-muted',
}


# Designed starting inks where a PM7 token would make two tones one colour (pm7-glyphs, 2026-10-10). "changed" is the
# violet second accent in every look (Friendly and Glass already are; the chat's changed is its second accent too):
# Basic Light's magenta token is red like blocked, Retro Dark's is the warning gold, and NieR's is the rust; NieR takes
# its secondary ink, as the chat's NieR Mode does. The tuner still fits each to the contrast gate.
DESIGNED = {
    'basic-light': {'changed': '#6f42c1'},
    'basic-dark': {'changed': '#b79cff'},
    'retro-dark': {'changed': '#c3a0d8'},
    'nier-light': {'changed': '#454138'},
    'nier-dark': {'changed': '#b5b096'},
}
LIVE = ('blocked', 'attention', 'working', 'changed', 'done')
MIN_DE = 20.0         # CIE76 between any two live tones in one look
# NieR is the game's near-monochrome palette on purpose (ink, rust, olive, ochre): its tones separate by shape, which
# the status vocabulary guarantees (one shape per meaning), so its close pairs are reported, not failed.
DE_EXEMPT = ('nier-light', 'nier-dark')


def lab(c):
    def f(x):
        x /= 255
        return x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4
    r, g, b = map(f, c)
    X = (.4124 * r + .3576 * g + .1805 * b) / .95047
    Y = .2126 * r + .7152 * g + .0722 * b
    Z = (.0193 * r + .1192 * g + .9505 * b) / 1.08883
    g3 = lambda t: t ** (1 / 3) if t > .008856 else 7.787 * t + 16 / 116
    fx, fy, fz = g3(X), g3(Y), g3(Z)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)


def de(a, b):
    return sum((x - y) ** 2 for x, y in zip(lab(a), lab(b))) ** .5


def parse_looks() -> dict:
    out = {}
    for sel, body in re.findall(r'^(html\[[^{]+)\{(.*)\}$', LOOKS_CSS.read_text(), flags=re.M):
        nier = 'data-o55-nier' in sel
        look = re.search(r'data-theme="([\w-]+)"', sel).group(1)
        key = ('nier-' + look.split('-')[1]) if nier else look
        out[key] = dict((k, v.strip()) for k, v in re.findall(r'(--[\w-]+):\s*([^;]+);', body))
    return out


def num(v: str, t: dict, depth=0) -> float:
    """A number that may be calc() over var()s: resolve the vars, then evaluate plain arithmetic."""
    v = v.strip()
    for _ in range(8):
        v2 = re.sub(r'var\((--[\w-]+)(?:,\s*([^()]+))?\)', lambda m: t.get(m.group(1), m.group(2) or '1'), v)
        if v2 == v:
            break
        v = v2
    v = v.replace('calc', '')
    if not re.fullmatch(r'[\d.\s*+/()-]+', v):
        raise ValueError(v)
    return float(eval(v, {'__builtins__': {}}))


def rgba(v: str, t: dict, depth=0):
    v = v.strip()
    m = re.match(r'var\((--[\w-]+)(?:,\s*(.+))?\)$', v)
    if m and depth < 8:
        return rgba(t.get(m.group(1), m.group(2) or '#000'), t, depth + 1)
    if v.startswith('#'):
        h = v[1:]
        h = ''.join(c * 2 for c in h) if len(h) in (3, 4) else h
        a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)), a
    m = re.match(r'rgba?\((.*)\)$', v)
    if m:
        p = [x.strip() for x in re.split(r'[,/]', m.group(1)) if x.strip()]
        a = num(p[3], t) if len(p) > 3 else 1.0
        return tuple(num(x, t) for x in p[:3]), a
    raise ValueError(v)


def over(c, a, bg):
    return tuple(c[i] * a + bg[i] * (1 - a) for i in range(3))


def lum(c):
    f = lambda x: (x / 255) / 12.92 if x / 255 <= .03928 else ((x / 255 + .055) / 1.055) ** 2.4
    r, g, b = map(f, c)
    return .2126 * r + .7152 * g + .0722 * b


def ratio(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + .05) / (min(la, lb) + .05)


def hexs(c):
    return '#%02x%02x%02x' % tuple(max(0, min(255, round(x))) for x in c)


def fields(t: dict):
    bg, _ = rgba(t['--background'], t)
    out = {'--background': bg}
    for f in FIELDS[1:]:
        if f in t:
            c, a = rgba(t[f], t)
            out[f] = over(c, a, bg)
    return out


def worst(c, fs):
    return min(ratio(c, f) for f in fs.values())


def fit(c, fs, light: bool):
    if worst(c, fs) >= TARGET:
        return c, 0
    h, l, s = colorsys.rgb_to_hls(*(x / 255 for x in c))
    for step in range(1, 200):
        l2 = l - step * .005 if light else l + step * .005
        if not 0 <= l2 <= 1:
            break
        c2 = tuple(x * 255 for x in colorsys.hls_to_rgb(h, l2, s))
        if worst(c2, fs) >= TARGET:
            return c2, step
    return c, None


# The quiet order (5.6 Pro 3E2, kept for PM7): idle reads just over the gate and paused a step above it, so a ready or
# paused row never outshouts a working one. Live tones also carry saturation and their lit halo; the quiet tones are
# unlit greys, so where a live tone sits near the gate (Friendly Light) the order still holds by salience.
# (lo, hi) contrast windows.
QUIET = {'idle': (3.1, 3.6), 'paused': (3.7, 4.6)}


def fit_window(c, fs, lo: float, hi: float):
    """The smallest lightness move that lands the worst contrast in [lo, hi]; None when nothing does."""
    h, l, s = colorsys.rgb_to_hls(*(x / 255 for x in c))
    best = None
    for step in range(-200, 201):
        l2 = l + step * .0025
        if not 0 <= l2 <= 1:
            continue
        c2 = tuple(x * 255 for x in colorsys.hls_to_rgb(h, l2, s))
        w = worst(c2, fs)
        if lo <= w <= hi and (best is None or abs(step) < abs(best[1])):
            best = (c2, step)
    return best if best else (c, None)


def main() -> int:
    looks = parse_looks()
    css = ['/* GENERATED by tools/tune_inks.py: do not edit by hand. Glyph inks per look, each >= %.1f:1 on every field. */' % TARGET]
    report = {}
    failed = []
    notes = []
    for look, t in looks.items():
        light = look.endswith('-light')
        fs = fields(t)
        rows = {}
        decl = []
        for tone, tok in TONES.items():
            c, a = rgba(DESIGNED.get(look, {}).get(tone, t[tok]), t)
            c = over(c, a, fs['--surface'] if '--surface' in fs else fs['--background'])
            before = worst(c, fs)
            c2, moved = fit(c, fs, light)
            if tone in QUIET:
                c2, moved = fit_window(c, fs, *QUIET[tone])
            after = worst(c2, fs)
            rows[tone] = {'token': tok, 'pm7': t[tok], 'designed': DESIGNED.get(look, {}).get(tone, ''), 'before': round(before, 2), 'ink': hexs(c2), 'after': round(after, 2), 'moved': moved}
            if moved is None:
                failed.append(f'{look} {tone}')
            decl.append(f'--pmg-ink-{tone}: {hexs(c2)};')
        report[look] = rows
        inks = {k: rgba(rows[k]['ink'], t)[0] for k in LIVE}
        for i, x in enumerate(LIVE):
            for y in LIVE[i + 1:]:
                d = de(inks[x], inks[y])
                if d < MIN_DE:
                    (notes if look in DE_EXEMPT else failed).append(f'{look} {x}~{y} dE {d:.0f}')
        sel = f'html[data-o55-nier][data-theme="basic-{look[5:]}"]' if look.startswith('nier') else f'html[data-theme="{look}"]'
        css.append(f'{sel} {{ ' + ' '.join(decl) + ' }')
    OUT.write_text('\n'.join(css) + '\n')
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps({'target': TARGET, 'min_de': MIN_DE, 'looks': report}, indent=1) + '\n')
    print('look'.ljust(15) + ''.join(t[:9].rjust(16) for t in TONES))
    for look, rows in report.items():
        print(look.ljust(15) + ''.join(f"{r['before']:.2f}>{r['after']:.2f}{' ' if not r['moved'] else '*'}".rjust(16) for r in rows.values()))
    if notes:
        print('ACCEPTED (shape carries it):', ', '.join(notes))
    if failed:
        print('PROBLEMS:', ', '.join(failed))
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
