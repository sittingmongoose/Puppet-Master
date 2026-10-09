#!/usr/bin/env python3
"""Build PM Symbols: the page's symbol glyphs (arrows, check marks, triangles, math signs, box lines), drawn as SVG.

None of the embedded text faces (src/fonts) carries these characters, so without this font each machine drew them
from its own fonts. Each glyph is an SVG drawing in src/fonts/symbols/svg/<style>/<weight>/uXXXX.svg:

  style   sans (proportional, beside Inter, Poppins, Nunito, PM NieR Sans, Georgia) or
          mono (600 units wide, beside IBM Plex Mono, PM NieR Mono and the platform monospace stack)
  weight  400 and 700, two masters of one variable font (wght 400-700): same paths, same commands, only the
          coordinates differ, so every weight in between interpolates.

SVG coordinates are font units (1000 per em), y pointing down, baseline at y=0: viewBox="0 -800 <advance> 1000".
Only <path d> elements with fills; no strokes, transforms, groups or arc commands (arcs split into a different
number of curves per master). Holes wind opposite to their outer contour.

Usage (needs fontTools and brotli; the scratch venv in SOURCE.md has them):
  symbols_font.py --write                 build src/fonts/pm-symbols-{sans,mono}.woff2 (fails on any problem)
  symbols_font.py --check                 rebuild in memory and compare with the committed woff2 files
  symbols_font.py --preview DIR [--lenient]  build into DIR and write DIR/preview.html (lenient skips bad glyphs)
"""
from __future__ import annotations

import argparse
import io
import re
import sys
from pathlib import Path

from fontTools.cu2qu.cu2qu import curves_to_quadratic
from fontTools.designspaceLib import AxisDescriptor, DesignSpaceDocument, SourceDescriptor
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.svgLib.path import SVGPath
from fontTools.ttLib import TTFont
from fontTools import varLib

TOOLS = Path(__file__).resolve().parent
PKG = TOOLS.parent
SVG_DIR = PKG / 'src' / 'fonts' / 'symbols' / 'svg'
OUT_DIR = PKG / 'src' / 'fonts'
STYLES = {'sans': 'PM Symbols', 'mono': 'PM Symbols Mono'}
WEIGHTS = (400, 700)
MONO_ADVANCE = 600
UPM = 1000
ASCENT, DESCENT = 800, 200

# The characters the page uses that no embedded face carries (scan of Concepts/PMConcept7.html, 2026-10-09).
GLYPHS = {
    0x2192: 'arrowright', 0x2194: 'arrowleftright', 0x21B3: 'arrowdownright', 0x279C: 'arrowheavyround',
    0x25B6: 'triangleright', 0x25B8: 'trianglerightsmall', 0x25BC: 'triangledown', 0x2304: 'arrowheaddown',
    0x2713: 'checkmark', 0x2715: 'multiply', 0x2716: 'multiplyheavy', 0x26A0: 'warning',
    0x25CF: 'circleblack', 0x25A0: 'squareblack',
    0x2264: 'lessequal', 0x2248: 'approxequal', 0x0394: 'Delta', 0x2318: 'command',
    0x2500: 'boxlighthorizontal', 0x2502: 'boxlightvertical', 0x2550: 'boxdoublehorizontal',
}
UNICODE_RANGE = ', '.join(f'U+{cp:04X}' for cp in sorted(GLYPHS))


class GlyphError(ValueError):
    pass


def read_svg(path: Path) -> tuple[int, RecordingPen]:
    text = path.read_text(encoding='utf-8')
    vb = re.search(r'viewBox="\s*0\s+-800\s+(\d+(?:\.\d+)?)\s+1000\s*"', text)
    if not vb:
        raise GlyphError(f'{path.name}: viewBox must be "0 -800 <advance> 1000"')
    for bad, why in ((r'<(?!path\b|svg\b|/|\?xml|!--)\w+', 'only <path> elements'), (r'\bstroke(?:-width)?\s*=', 'no strokes'),
                     (r'\btransform\s*=', 'no transforms'), (r'\bd="[^"]*[Aa]', 'no arc commands')):
        if re.search(bad, text):
            raise GlyphError(f'{path.name}: {why}')
    rec = RecordingPen()
    SVGPath.fromstring(text.encode('utf-8')).draw(TransformPen(rec, (1, 0, 0, -1, 0, 0)))  # y down -> y up
    if not rec.value:
        raise GlyphError(f'{path.name}: no outline')
    return round(float(vb.group(1))), rec


def structure(rec: RecordingPen) -> list[tuple[str, int]]:
    return [(op, len(args)) for op, args in rec.value]


def to_quadratic(recs: list[RecordingPen]) -> list[RecordingPen]:
    """Convert the masters' cubics to quadratics together, so every master gets the same number of points."""
    outs = [RecordingPen() for _ in recs]
    cur = [None] * len(recs)
    for i, (op, _) in enumerate(recs[0].value):
        args = [r.value[i][1] for r in recs]
        if op == 'curveTo':
            if any(len(a) != 3 for a in args):
                raise GlyphError('a curve with more than one cubic segment per command')
            curves = [(cur[k],) + tuple(args[k]) for k in range(len(recs))]
            quads = curves_to_quadratic(curves, [1.0] * len(recs))
            for k, q in enumerate(quads):
                outs[k].qCurveTo(*q[1:])
                cur[k] = q[-1]
        elif op == 'qCurveTo':
            for k in range(len(recs)):
                outs[k].qCurveTo(*args[k])
                cur[k] = args[k][-1]
        else:
            for k in range(len(recs)):
                getattr(outs[k], op)(*args[k])
                if op in ('moveTo', 'lineTo'):
                    cur[k] = args[k][0]
    return outs


def load_style(style: str, lenient: bool) -> tuple[dict, list[str]]:
    """{codepoint: (advance, [quadratic pen per weight])} for one style, and the problems found."""
    glyphs, problems = {}, []
    for cp in sorted(GLYPHS):
        files = [SVG_DIR / style / str(w) / f'u{cp:04X}.svg' for w in WEIGHTS]
        try:
            missing = [f for f in files if not f.is_file()]
            if missing:
                raise GlyphError(f'missing {", ".join(str(f.relative_to(SVG_DIR)) for f in missing)}')
            masters = [read_svg(f) for f in files]
            advances = {a for a, _ in masters}
            if len(advances) != 1:
                raise GlyphError(f'advance differs between weights: {sorted(advances)}')
            if style == 'mono' and advances != {MONO_ADVANCE}:
                raise GlyphError(f'mono advance must be {MONO_ADVANCE}, is {advances.pop()}')
            shapes = [structure(r) for _, r in masters]
            if any(s != shapes[0] for s in shapes):
                raise GlyphError('the 400 and 700 drawings are not compatible (same commands in the same order needed)')
            glyphs[cp] = (masters[0][0], to_quadratic([r for _, r in masters]))
        except (GlyphError, ValueError) as e:
            problems.append(f'{style} U+{cp:04X} {GLYPHS[cp]}: {e}')
    if problems and not lenient:
        raise GlyphError('\n'.join(problems))
    return glyphs, problems


def master_font(style: str, glyphs: dict, k: int, weight: int) -> TTFont:
    order = ['.notdef'] + [GLYPHS[cp] for cp in sorted(glyphs)]
    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap({cp: GLYPHS[cp] for cp in glyphs})
    outlines, metrics = {}, {}
    pen = TTGlyphPen(None)
    outlines['.notdef'] = pen.glyph()
    metrics['.notdef'] = (500, 0)
    for cp, (adv, pens) in glyphs.items():
        pen = TTGlyphPen(None)
        pens[k].replay(pen)
        g = pen.glyph()
        outlines[GLYPHS[cp]] = g
        metrics[GLYPHS[cp]] = (adv, 0)
    fb.setupGlyf(outlines)
    for name, g in outlines.items():
        g.recalcBounds(fb.font['glyf'])
        metrics[name] = (metrics[name][0], getattr(g, 'xMin', 0))
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=ASCENT, descent=-DESCENT)
    family = STYLES[style]
    fb.setupNameTable({'familyName': family, 'styleName': 'Regular' if weight == 400 else 'Bold',
                       'version': 'Version 1.000', 'copyright': 'Drawn for the Puppet Master concepts, 2026'})
    fb.setupOS2(sTypoAscender=ASCENT, sTypoDescender=-DESCENT, sTypoLineGap=0, usWinAscent=ASCENT, usWinDescent=DESCENT,
                usWeightClass=weight, fsType=0)
    fb.setupPost()
    return fb.font


def build_style(style: str, lenient: bool = False) -> tuple[bytes, list[str], list[int]]:
    glyphs, problems = load_style(style, lenient)
    if not glyphs:
        raise GlyphError(f'{style}: no usable glyphs\n' + '\n'.join(problems))
    doc = DesignSpaceDocument()
    axis = AxisDescriptor()
    axis.tag, axis.name, axis.minimum, axis.default, axis.maximum = 'wght', 'Weight', 400, 400, 700
    doc.addAxis(axis)
    for k, w in enumerate(WEIGHTS):
        src = SourceDescriptor()
        src.font = master_font(style, glyphs, k, w)
        src.location = {'Weight': w}
        src.name = f'{style}-{w}'
        doc.addSource(src)
    vf, _, _ = varLib.build(doc, exclude=['MVAR', 'HVAR', 'STAT'])
    vf.flavor = 'woff2'
    buf = io.BytesIO()
    vf.save(buf, reorderTables=False)
    return buf.getvalue(), problems, sorted(glyphs)


def out_path(style: str) -> Path:
    return OUT_DIR / f'pm-symbols-{style}.woff2'


PREVIEW = """<!doctype html><meta charset="utf-8"><title>PM Symbols preview</title>
<style>
@font-face {{ font-family: 'PMS'; src: url(pm-symbols-sans.woff2) format('woff2'); font-weight: 100 900; }}
@font-face {{ font-family: 'PMS Mono'; src: url(pm-symbols-mono.woff2) format('woff2'); font-weight: 100 900; }}
@font-face {{ font-family: 'Inter'; src: url({fonts}/inter-latin-100-900-normal.woff2); font-weight: 100 900; }}
@font-face {{ font-family: 'Poppins'; src: url({fonts}/poppins-latin-400-normal.woff2); font-weight: 400; }}
@font-face {{ font-family: 'Poppins'; src: url({fonts}/poppins-latin-700-normal.woff2); font-weight: 700; }}
@font-face {{ font-family: 'Plex'; src: url({fonts}/ibm-plex-mono-latin-400-normal.woff2); font-weight: 400; }}
@font-face {{ font-family: 'Plex'; src: url({fonts}/ibm-plex-mono-latin-700-normal.woff2); font-weight: 700; }}
@font-face {{ font-family: 'NieR Sans'; src: url({nier}/mplus1-latin-var.woff2); font-weight: 100 900; }}
body {{ margin: 16px; background: #fff; color: #111; font: 14px 'Inter', sans-serif; }}
table {{ border-collapse: collapse; }} td, th {{ padding: 4px 10px; border-bottom: 1px solid #ddd; vertical-align: baseline; white-space: nowrap; }}
th {{ font-weight: 600; text-align: left; color: #555; }}
.big {{ font-size: 64px; line-height: 1.1; }} .big span {{ outline: 1px solid rgba(255,0,0,.35); }}
.sys {{ font-family: 'DejaVu Sans', sans-serif; color: #999; }}
.dark {{ background: #1b1b1f; color: #eee; }}
</style>
<h1 style="font-size:16px">PM Symbols preview: {count} glyphs{skipped}</h1>
<table>
<tr><th>U+</th><th>64px sans 400 / 700</th><th>64px mono 400 / 700</th><th>system (reference)</th>
<th>Inter 13px 400 / 700</th><th>Poppins 14px</th><th>Plex Mono 13px</th><th>NieR Sans 14px</th><th>dark 12px</th></tr>
{rows}
</table>
<p style="font: 15px 'PMS', 'Inter'">Running text: Plan → Build → Test → Audit → Deliver · completed ✓ · ↳ art-op-web-r1 · Details ≤ 32 KiB · ≈ 4 s · Δ 12 · ⌘ K · ▸ Section · ▼ ▶ ⌄ · ● live · ■ stop · ✕ close · ⚠ blocked</p>
<p style="font: 600 15px 'PMS', 'Inter'">Bold: Plan → Build → Test · completed ✓ · ⚠ Impacted · Accept topic ✓</p>
<pre style="font: 13px/1.45 'PMS Mono', 'Plex', monospace; background:#111; color:#ddd; padding:10px">  ➜  Local:   http://localhost:3000/
✓ 1842 modules transformed.
✖ 1 problem (0 errors, 1 warning)
dist/assets/index-abc123.js     412.18 kB │ gzip: 128.4 kB
──────────────────────────────
══════════════════════════════
│ a │ b │</pre>
"""


def preview(out: Path, lenient: bool) -> int:
    out.mkdir(parents=True, exist_ok=True)
    rows, skipped, count, have = [], [], 0, {}
    for style in STYLES:
        try:
            data, problems, built = build_style(style, lenient)
        except GlyphError as e:  # nothing usable yet in this style
            data, problems, built = None, [str(e)], []
        if data:
            (out / f'pm-symbols-{style}.woff2').write_bytes(data)
        skipped += problems
        have[style] = set(built)
        count = max(count, len(built))
    for cp in sorted(GLYPHS):
        c = chr(cp)
        if cp not in have['sans'] or cp not in have['mono']:  # never let a system fallback pass for a drawing
            rows.append(f'<tr><td>{cp:04X}<br><small>{GLYPHS[cp]}</small></td><td colspan="8" style="color:#b00">'
                        f'missing or invalid: sans {"ok" if cp in have["sans"] else "NO"}, mono '
                        f'{"ok" if cp in have["mono"] else "NO"} (see SKIPPED lines)</td></tr>')
            continue
        rows.append(
            f'<tr><td>{cp:04X}<br><small>{GLYPHS[cp]}</small></td>'
            f'<td class="big" style="font-family:PMS"><span>{c}</span><span style="font-weight:700">{c}</span></td>'
            f'<td class="big" style="font-family:\'PMS Mono\'"><span>{c}</span><span style="font-weight:700">{c}</span></td>'
            f'<td class="big sys">{c}</td>'
            f'<td style="font:13px PMS,Inter">Hx{c}xH <b style="font-weight:700">Hx{c}xH</b></td>'
            f'<td style="font:14px PMS,Poppins">Hx{c}xH <b style="font-weight:700">Hx{c}xH</b></td>'
            f'<td style="font:13px \'PMS Mono\',Plex">Hx{c}xH <b style="font-weight:700">Hx{c}xH</b></td>'
            f'<td style="font:14px PMS,\'NieR Sans\'">Hx{c}xH</td>'
            f'<td class="dark" style="font:12px PMS,Inter">ok {c} 12</td></tr>')
    fonts = (OUT_DIR).as_uri()
    nier = (PKG / 'src' / 'settings' / 'nier' / 'fonts').as_uri()
    (out / 'preview.html').write_text(PREVIEW.format(fonts=fonts, nier=nier, rows='\n'.join(rows), count=count,
                                                     skipped=f' ({len(skipped)} skipped)' if skipped else ''), encoding='utf-8')
    for p in skipped:
        print('SKIPPED', p, file=sys.stderr)
    print(out / 'preview.html')
    return 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument('--write', action='store_true')
    g.add_argument('--check', action='store_true')
    g.add_argument('--preview', metavar='DIR')
    ap.add_argument('--lenient', action='store_true')
    a = ap.parse_args(argv)
    try:
        if a.preview:
            return preview(Path(a.preview), a.lenient)
        bad = 0
        for style in STYLES:
            data, _, built = build_style(style)
            if a.write:
                out_path(style).write_bytes(data)
                print(f'{out_path(style).relative_to(PKG)}: {len(built)} glyphs, {len(data)} bytes')
            elif not out_path(style).is_file() or out_path(style).read_bytes() != data:
                print(f'{out_path(style).relative_to(PKG)} is stale; run tools/symbols_font.py --write', file=sys.stderr)
                bad = 1
        return bad
    except GlyphError as e:
        print(e, file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
