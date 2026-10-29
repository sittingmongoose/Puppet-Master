#!/usr/bin/env python3
"""The glyph layer: puts the Puppet Master glyph system into PMConcept7 (build.py step 5, after the left rail).

Jared approved the catalog on 2026-10-10 (D44: GLY-0..3 as recommended). This layer is the rollout's foundation: it
adds the 5.6 Pro neon renderer, the PMG registry and its families, and the PM7 bridge to the built page, and changes
nothing that is already drawn. A surface adopts the set in its own source by calling PMG.icon(name, size) or
PMG.status(key, size); until it does, the page renders exactly as before (neon CSS styles only svg.nx and .nx-st).

What it adds, between <!-- GLYPHS:START --> and <!-- GLYPHS:END --> just before </head>:
  <style id="pm-glyph-css">  pm7-glyph-inks.css, pm7-bridge.css, neon-icons.css, pm7-retro-phosphor.css,
                             pm7-hover-bridge.css (the ignite under PMH)
  <script id="pm-glyph-js">  neon-icons.js, src/registry/*.js, src/registry/families/*.js
The script is in the head so window.PMG exists before any body script draws. pm7-looks.css is the catalog's copy of
PM7's own tokens and is never added (the page has the real ones).

The neon CSS keys light and dark on body[data-theme]; PMConcept7 writes data-theme on <html> only, so those selectors
are rewritten to html[data-theme...] body (same meaning, one element more specific). The rewrite is checked: no
body[data-theme survives.

Surface 4 (toasts and notifications, TOASTS.md): PATCHES adopts the set in the title-bar notify, through
replace-exactly-once on the pinned base's text (the build.py discipline). The kind dot becomes a lit-and-still
PMG.status mark (success->complete, warn->warning, error->failed, else info), the text × becomes
PMG.icon('close') in the same button, and the empty bell becomes PMG.icon('bell'); without window.PMG every site
draws exactly as before.
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
CONCEPTS = ROOT.parents[1]
sys.path.insert(0, str(CONCEPTS / 'onboarding' / 'opus-5.5' / 'tools'))
import base_source  # noqa: E402

SRC = ROOT / 'src'
NEON = CONCEPTS / 'chat-assistant-concepts' / '5.6 Pro'
START, END = '<!-- GLYPHS:START -->', '<!-- GLYPHS:END -->'


def _read(p: Path) -> str:
    t = base_source.read_text_source(p)
    low = t.lower()
    if '</script' in low or '</style' in low:
        raise SystemExit(f'{p}: contains a closing </script> or </style>')
    return t


def html_theme(css: str) -> str:
    """body[data-theme...] -> html[data-theme...] body, keeping any html[...] prefix the selector already had."""
    def sub(m):
        pre, attrs, theme = m.group(1), m.group(2) or '', m.group(3)
        return f'html{attrs}{theme} body' if pre else f'html{theme} body'
    return re.sub(r'(html((?:\[[^\]]+\])*)\s+)?body(\[data-theme[^\]]*\])', sub, css)


def css_parts():
    parts = [SRC / 'bridge' / 'pm7-glyph-inks.css', SRC / 'bridge' / 'pm7-bridge.css', NEON / 'neon-icons.css']
    after = [SRC / 'bridge' / n for n in ('pm7-retro-phosphor.css', 'pm7-hover-bridge.css', 'pm7-beat.css')]
    return parts + [p for p in after if p.exists()] + LOGO_CSS


# The Pip kit and the head modules built on it (PM7 build, lane found, 2026-10-29): Pip's drawing kit, the system
# loader, the Pip parts registry and the work projection. They ride in this head block, not in registry/families/ (Pip is not a glyph family),
# so the title bar's mark and every body script find window.PMLogo, PM_PIP_LOADER, PM_PIP_PARTS and PM_WORK already there.
LOGO_CSS = [SRC / 'logo' / 'pm-logo.css', SRC / 'logo' / 'pm-loader.css']
LOGO_JS = [SRC / 'logo' / 'pm-logo.js', SRC / 'logo' / 'pm-loader.js', SRC / 'logo' / 'pm-pip-parts.js']


def js_parts():
    return ([NEON / 'neon-icons.js'] + sorted((SRC / 'registry').glob('*.js')) + sorted((SRC / 'registry' / 'families').glob('*.js'))
            + LOGO_JS + sorted((SRC / 'work').glob('*.js')))


def block() -> str:
    css = '\n'.join(f'/* {p.relative_to(CONCEPTS).as_posix()} */\n' + html_theme(_read(p)) for p in css_parts())
    js = '\n'.join(f'/* {p.relative_to(CONCEPTS).as_posix()} */\n' + _read(p) for p in js_parts())
    return (f'{START}\n<style id="pm-glyph-css">\n{css}\n</style>\n'
            f'<script id="pm-glyph-js">\n{js}\n</script>\n{END}\n')


# Surface 4 (toasts and notifications): (old text, new text, label). Anchors are the pinned base's title-bar
# notify code; each must occur exactly once (the build.py replace_once discipline).
PATCHES = [
    # The kind-mark and dismiss helpers, beside the severity-class helper they follow.
    ("    function sevClass(s) { return 'n-sev-' + (s || 'info'); }",
     "    function sevClass(s) { return 'n-sev-' + (s || 'info'); }\n"
     "    /* pm7-glyphs surface 4 (toasts): the kind mark and dismiss through PMG; without window.PMG the base draws exactly as before. */\n"
     "    function pmgSev(s) { return s === 'success' ? 'complete' : s === 'warn' ? 'warning' : s === 'error' ? 'failed' : 'info'; }\n"
     "    function pmgMark(s) { return window.PMG ? window.PMG.status(pmgSev(s), 16, 'nx-still') : '<span class=\"n-sev-dot\" aria-hidden=\"true\"></span>'; }\n"
     "    function pmgX() { return window.PMG ? window.PMG.icon('close', 14, 'nx-r-control') : '×'; }",
     'toast kind-mark helpers'),
    # The stack cards (renderStackNow): the dot becomes the kind mark, the × the close glyph.
    ("        card.innerHTML =\n"
     "          '<span class=\"n-sev-dot\" aria-hidden=\"true\"></span>' +\n"
     "          '<span class=\"n-title\"></span>' +\n"
     "          '<button type=\"button\" class=\"n-x\" aria-label=\"Dismiss\">×</button>';",
     "        card.innerHTML =\n"
     "          pmgMark(it.severity) +\n"
     "          '<span class=\"n-title\"></span>' +\n"
     "          '<button type=\"button\" class=\"n-x\" aria-label=\"Dismiss\">' + pmgX() + '</button>';",
     'toast stack card marks'),
    # The inbox rows (fillPanelContent): same marks beside the meta, never replacing the text.
    ("        top.innerHTML =\n"
     "          '<span class=\"n-sev-dot\" aria-hidden=\"true\"></span>' +\n"
     "          '<div class=\"meta\">' +",
     "        top.innerHTML =\n"
     "          pmgMark(it.severity) +\n"
     "          '<div class=\"meta\">' +",
     'toast inbox row kind mark'),
    ("          '</div>' +\n"
     "          '<button type=\"button\" class=\"n-x\" aria-label=\"Dismiss\">×</button>';\n"
     "        top.querySelector('.kind-tag').textContent = it.kind || 'advisory';",
     "          '</div>' +\n"
     "          '<button type=\"button\" class=\"n-x\" aria-label=\"Dismiss\">' + pmgX() + '</button>';\n"
     "        top.querySelector('.kind-tag').textContent = it.kind || 'advisory';",
     'toast inbox row dismiss'),
    # The arriving toasts (stageToast): the row's dot and ×, over the untouched body.
    ("      card.innerHTML =\n"
     "        '<div class=\"n-row\">' +\n"
     "          '<span class=\"n-sev-dot\" aria-hidden=\"true\"></span>' +\n"
     "          '<span class=\"n-title\"></span>' +\n"
     "          '<button type=\"button\" class=\"n-x\" aria-label=\"Dismiss\">×</button>' +\n"
     "        '</div><div class=\"n-body\"></div>';",
     "      card.innerHTML =\n"
     "        '<div class=\"n-row\">' +\n"
     "          pmgMark(msg.severity) +\n"
     "          '<span class=\"n-title\"></span>' +\n"
     "          '<button type=\"button\" class=\"n-x\" aria-label=\"Dismiss\">' + pmgX() + '</button>' +\n"
     "        '</div><div class=\"n-body\"></div>';",
     'toast stage marks'),
    # The empty bell: one element keeps its rs-empty-bell CSS under the PMG drawing.
    ("      booted = true;\n"
     "      stackEl.addEventListener('mouseenter', function () { if (items.length) scheduleStack(); });",
     "      booted = true;\n"
     "      /* pm7-glyphs surface 4: the empty bell through PMG (one element keeps its rs-empty-bell CSS); without window.PMG the base svg stays. */\n"
     "      try {\n"
     "        var bellSvg = stackEl.querySelector('.rs-empty-bell');\n"
     "        if (bellSvg && window.PMG) bellSvg.outerHTML = window.PMG.icon('bell', 16).replace('class=\"nx ', 'class=\"rs-empty-bell nx ');\n"
     "      } catch (eBell) {}\n"
     "      stackEl.addEventListener('mouseenter', function () { if (items.length) scheduleStack(); });",
     'toast empty bell'),
    # The PMG dismiss sits on the button's box, not the text baseline (same 18 px box the × had).
    ("    .rs-card .n-x { opacity: .72; } /* always visible (#4) */",
     "    .rs-card .n-x { opacity: .72; } /* always visible (#4) */\n"
     "    /* pm7-glyphs surface 4: the PMG dismiss sits on the button's box, not the text baseline. */\n"
     "    .n-card .n-x > svg.nx { display: block; }",
     'toast dismiss seating'),
]

# One probe of the new text per patch label: each must appear exactly once in the built page.
PATCH_PROBES = {
    'toast kind-mark helpers': 'function pmgMark(s) {',
    'toast stack card marks': "card.innerHTML =\n          pmgMark(it.severity)",
    'toast inbox row kind mark': "top.innerHTML =\n          pmgMark(it.severity)",
    'toast inbox row dismiss': "'<button type=\"button\" class=\"n-x\" aria-label=\"Dismiss\">' + pmgX() + '</button>';\n        top.querySelector",
    'toast stage marks': 'pmgMark(msg.severity)',
    'toast empty bell': 'bellSvg.outerHTML',
    'toast dismiss seating': '.n-card .n-x > svg.nx { display: block; }',
}


def replace_once(text: str, old: str, new: str, label: str, need) -> str:
    count = text.count(old)
    need(count == 1, f'glyph patch "{label}": anchor found {count} times (need exactly 1)')
    return text.replace(old, new, 1)


def apply_published(text: str, need) -> tuple[str, dict]:
    need(START not in text and END not in text, 'glyph layer markers already present')
    need(text.count('</head>') >= 1, 'no </head> for the glyph layer')
    b = block()
    text = text.replace('</head>', b + '</head>', 1)
    for old, new, label in PATCHES:
        text = replace_once(text, old, new, label, need)
    return text, {'bytes': len(b.encode('utf-8')), 'css': [str(p.relative_to(CONCEPTS)) for p in css_parts()],
                  'js': len(js_parts()), 'patches': [label for _, _, label in PATCHES]}


def published_problems(built: str) -> list[str]:
    out = []
    for m in (START, END, 'id="pm-glyph-css"', 'id="pm-glyph-js"'):
        if built.count(m) != 1:
            out.append(f'glyph layer: {m} appears {built.count(m)} times')
    i, j = built.find(START), built.find(END)
    if i >= 0 and j > i and re.search(r'body\[data-theme', built[i:j]):
        out.append('glyph layer: a body[data-theme selector survived the html rewrite')
    if i >= 0 and built.find('</head>') < i:
        out.append('glyph layer: block is not in the head')
    labels = [label for _, _, label in PATCHES]
    if sorted(labels) != sorted(PATCH_PROBES):
        out.append('glyph layer: a patch label has no published_problems probe')
    for label, probe in PATCH_PROBES.items():
        if built.count(probe) != 1:
            out.append(f'glyph layer: patch "{label}" probe appears {built.count(probe)} times')
    out.extend(syntax_problems(built))
    return out


def syntax_problems(built: str) -> list[str]:
    """node --check the head script this layer writes (build.py's syntax_check names only the other scripts)."""
    import subprocess
    import tempfile
    m = re.search(r'<script id="pm-glyph-js">\n(.*?)\n</script>', built, re.S)
    if not m:
        return ['glyph layer: script pm-glyph-js missing']
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as fh:
        fh.write(m.group(1))
        path = fh.name
    try:
        r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
    finally:
        Path(path).unlink(missing_ok=True)
    return [f'glyph layer: syntax error in pm-glyph-js: ' + ' | '.join(r.stderr.strip().splitlines()[-4:])[:600]] if r.returncode else []


if __name__ == '__main__':
    b = block()
    left = re.findall(r'body\[data-theme[^\]]*\]', b)
    print(f'glyph layer block: {len(b.encode("utf-8")):,} bytes; body[data-theme left: {len(left)}')
    for m in re.finditer(r'html[^{,]*\[data-theme[^{,]*body', b):
        print('  ', m.group(0)[:110])
