#!/usr/bin/env python3
"""warm_catalog.py <harvest.json>: rewrite the shader warm-up catalog inside glass.js (between WARM-CATALOG markers) from a
paint-signature harvest (/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-glass-bake-20261016/scripts/harvest.mjs, run against
the built page in Basic Dark and Glass Dark: every distinct corner shape, box-shadow layer kind, border,
outline, background kind, filter, backdrop-filter and blend the app paints, each with the clips it sits in). Each entry
keeps only the paint styles that differ from a plain box, so the catalog stays small. Run it after a UI change adds new
kinds of painted boxes, then rebuild the pages."""
import json, pathlib, re, sys

SRC = pathlib.Path(__file__).resolve().parents[1] / 'src' / 'glass.js'
DEFAULT = {'boxShadow': 'none', 'borderTopWidth': '0px', 'borderRightWidth': '0px', 'borderBottomWidth': '0px', 'borderLeftWidth': '0px',
           'outlineWidth': '0px', 'outlineStyle': 'none', 'backgroundColor': 'rgba(0, 0, 0, 0)', 'backgroundImage': 'none',
           'backgroundSize': 'auto', 'backgroundPosition': '0% 0%', 'backgroundRepeat': 'repeat', 'filter': 'none',
           'backdropFilter': 'none', 'mixBlendMode': 'normal', 'opacity': '1', 'textShadow': 'none', 'outlineOffset': '0px'}
CSS = {'boxShadow': 'box-shadow', 'borderTopLeftRadius': 'border-top-left-radius', 'borderTopRightRadius': 'border-top-right-radius',
       'borderBottomRightRadius': 'border-bottom-right-radius', 'borderBottomLeftRadius': 'border-bottom-left-radius',
       'borderTopWidth': 'border-top-width', 'borderRightWidth': 'border-right-width', 'borderBottomWidth': 'border-bottom-width',
       'borderLeftWidth': 'border-left-width', 'borderTopStyle': 'border-top-style', 'borderRightStyle': 'border-right-style',
       'borderBottomStyle': 'border-bottom-style', 'borderLeftStyle': 'border-left-style', 'borderTopColor': 'border-top-color',
       'borderRightColor': 'border-right-color', 'borderBottomColor': 'border-bottom-color', 'borderLeftColor': 'border-left-color',
       'outlineWidth': 'outline-width', 'outlineStyle': 'outline-style', 'outlineColor': 'outline-color', 'outlineOffset': 'outline-offset',
       'backgroundColor': 'background-color', 'backgroundImage': 'background-image', 'backgroundSize': 'background-size',
       'backgroundPosition': 'background-position', 'backgroundRepeat': 'background-repeat', 'filter': 'filter',
       'backdropFilter': 'backdrop-filter', 'mixBlendMode': 'mix-blend-mode', 'opacity': 'opacity', 'textShadow': 'text-shadow', 'color': 'color'}


COLOR = re.compile(r'rgba?\(\s*[\d.]+,\s*[\d.]+,\s*[\d.]+(?:,\s*([\d.]+))?\s*\)|color\(srgb\s+[\d.]+\s+[\d.]+\s+[\d.]+(?:\s*/\s*([\d.]+))?\s*\)')


def norm_colors(v):
    """one grey per colour, keeping whether it is opaque, translucent or clear: the GPU program does not depend on the hue"""
    def sub(m):
        a = m.group(1) or m.group(2)
        a = 1.0 if a is None else float(a)
        return 'rgba(128,128,128,0)' if a == 0 else ('rgb(128,128,128)' if a >= 1 else 'rgba(128,128,128,0.5)')
    return COLOR.sub(sub, v)


def compact(decl):
    """shorthands where all four sides agree, and no outline width without an outline"""
    d = dict(x.split(':', 1) for x in decl)
    sides = ('top', 'right', 'bottom', 'left')
    if d.get('outline-style', 'none') == 'none':
        for k in ('outline-width', 'outline-color', 'outline-offset'):
            d.pop(k, None)
    radii = [d.get('border-%s-radius' % c) for c in ('top-left', 'top-right', 'bottom-right', 'bottom-left')]
    if all(radii) and len(set(radii)) == 1:
        for c in ('top-left', 'top-right', 'bottom-right', 'bottom-left'):
            d.pop('border-%s-radius' % c)
        d['border-radius'] = radii[0]
    for part in ('width', 'style', 'color'):
        vals = [d.get('border-%s-%s' % (s, part)) for s in sides]
        if all(vals) and len(set(vals)) == 1:
            for s in sides:
                d.pop('border-%s-%s' % (s, part))
            d['border-' + part] = vals[0]
    return ['%s:%s' % kv for kv in d.items()]


def entry(s):
    st = s['style']
    has_border = any(st.get(k) not in (None, '0px') for k in ('borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'))
    decl = []
    for k, prop in CSS.items():
        v = st.get(k)
        if v is None or DEFAULT.get(k) == v:
            continue
        if 'border' in k and ('Style' in k or 'Color' in k) and not has_border:
            continue
        if k.startswith('outline') and k != 'outlineWidth' and st.get('outlineStyle') in (None, 'none'):
            continue
        if k == 'color' and not s.get('text') and 'currentcolor' not in json.dumps(st).lower():
            continue
        if 'Radius' in k and v == '0px':
            continue
        v = norm_colors(v.replace('linear-gradient(transparent, transparent)', 'var(--lg-warm-img)'))
        decl.append('%s:%s' % (prop, v))
    decl = compact(decl)
    clips = [[c.get('r', '0px'), min(int(c.get('w', 0)), 420), min(int(c.get('h', 0)), 420), c.get('clip', '')]
             for c in (s.get('clips') or []) if 'inset(100%' not in (c.get('clip') or '')]
    return [';'.join(decl), min(int(s['w']), 400), min(int(s['h']), 400), 1 if s.get('text') else 0, clips]


def main():
    sigs = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding='utf-8'))
    rows = []
    seen = set()
    for s in sigs:
        e = entry(s)
        key = json.dumps(e)
        if key in seen or not e[0]:
            continue
        seen.add(key)
        rows.append(e)
    body = 'var WARM_CATALOG = ' + json.dumps(rows, separators=(',', ':')) + ';'
    src = SRC.read_text(encoding='utf-8')
    new, n = re.subn(r'(/\* WARM-CATALOG:START[^*]*\*/\n).*?(\n\s*/\* WARM-CATALOG:END \*/)', lambda m: m.group(1) + '  ' + body + m.group(2), src, flags=re.S)
    if n != 1:
        sys.exit('WARM-CATALOG markers not found in glass.js')
    SRC.write_text(new, encoding='utf-8')
    print('%d entries, %d bytes' % (len(rows), len(body)))


if __name__ == '__main__':
    main()
