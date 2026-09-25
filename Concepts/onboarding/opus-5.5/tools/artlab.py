#!/usr/bin/env python3
"""Art lab: a light page (outside the repo) that renders scenes for fast visual iteration.

Usage: python3 tools/artlab.py [out-dir=/tmp/o55/artlab] [scene:beat,scene:beat@{"params":1},...]  (rows split on ';' when any
has parameters, else on ',')
Writes one page per family (<family>.html: dark and light columns, one row per scene/beat) plus all.html.
Uses the base concept's real theme tokens and the O55 art/motion sources; nothing else from the app.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
PKG = TOOLS.parent
SRC = PKG / 'src'
BASE = PKG.parents[1] / 'TestPMConcept.html'

DEFAULT_ROWS = ['hero:default', 'route:default', 'nas:find', 'nas:identity', 'nas:keys', 'nas:install', 'nas:verified', 'nas:folder']
ART_JS = ['00-namespace.js', '05-util.js', '10-motion.js', '50-art-core.js', '51-art-basic.js', '52-art-friendly.js',
          '53-art-glass.js', '54-art-retro.js', '55-scenes.js']


def theme_css() -> str:
    lines = BASE.read_text(encoding='utf-8').split('\n')
    start = next(i for i, l in enumerate(lines) if l.strip() == ':root {')
    end = next(i for i, l in enumerate(lines) if l.strip().startswith('[data-theme="friendly-light"]'))
    depth, j = 0, end
    while True:
        depth += lines[j].count('{') - lines[j].count('}')
        if depth <= 0 and j > end:
            break
        j += 1
    return '\n'.join(lines[start:j + 1])


def page(families, rows, title):
    js = '\n'.join((SRC / 'js' / name).read_text(encoding='utf-8') for name in ART_JS if (SRC / 'js' / name).exists())
    extra = [p for p in sorted((SRC / 'js').glob('5[6-9]-*.js'))]
    js += '\n' + '\n'.join(p.read_text(encoding='utf-8') for p in extra)
    css = '\n'.join(p.read_text(encoding='utf-8') for p in sorted((SRC / 'css').glob('*.css')))
    copy = (SRC / 'copy.json').read_text(encoding='utf-8') if (SRC / 'copy.json').exists() else '{}'
    return f"""<!doctype html><html data-theme="basic-dark"><head><meta charset="utf-8"><title>{title}</title>
<style>{theme_css()}</style><style>{css}</style>
<style>
 body{{margin:0;background:#0b0b0e;color:#ddd;font:12px system-ui}}
 .grid{{display:grid;grid-template-columns:repeat({len(families) * 2},var(--cw,300px));gap:10px;padding:10px}}
 .cell{{position:relative;width:var(--cw,300px);height:calc(var(--cw,300px)*1.54);border-radius:10px;overflow:hidden;background:var(--background)}}
 .cap{{position:absolute;left:6px;top:4px;z-index:3;font:600 10px/1.2 ui-monospace,monospace;color:#fff;background:rgba(0,0,0,.55);padding:2px 5px;border-radius:4px}}
 .o55-scene-host{{position:absolute;inset:0}}
</style></head><body><div class="grid" id="grid"></div>
<script>window.O55_COPY={copy};</script><script>{js}</script>
<script>
(function(){{
  const families={json.dumps(families)}, rows={json.dumps(rows)};
  const grid=document.getElementById('grid');
  const settle=new URLSearchParams(location.search).has('settle');
  for(const row of rows){{
    /* a row may carry sample parameters: scene:beat@{{"json":"params"}} (a sign's name, keys found, extras chosen) */
    const at=row.indexOf('@'), [scene,beat]=(at>=0?row.slice(0,at):row).split(':'), params=at>=0?JSON.parse(row.slice(at+1)):{{}};
    for(const fam of families) for(const mode of ['dark','light']){{
      const cell=document.createElement('div'); cell.className='cell'; cell.setAttribute('data-theme',fam+'-'+mode);
      cell.innerHTML='<div class="cap">'+fam+'-'+mode+' · '+row+'</div><div class="o55-scene-host" data-family="'+fam+'"></div>';
      grid.appendChild(cell);
      const host=cell.querySelector('.o55-scene-host');
      O55.art.mount(host, scene, {{family:fam, mode, beat, tok:O55.art.tokens(cell), params, instance:row}});
    }}
  }}
  if(settle) document.body.setAttribute('data-o55-ambient','off');
  window.__artlabReady=true;
}})();
</script></body></html>"""


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/o55/artlab')
    rows = (sys.argv[2].split(';') if '@' in sys.argv[2] else sys.argv[2].split(',')) if len(sys.argv) > 2 else DEFAULT_ROWS
    out.mkdir(parents=True, exist_ok=True)
    for fam in ['basic', 'friendly', 'glass', 'retro']:
        (out / f'{fam}.html').write_text(page([fam], rows, f'artlab {fam}'), encoding='utf-8')
    (out / 'all.html').write_text(page(['basic', 'friendly', 'glass', 'retro'], rows, 'artlab all'), encoding='utf-8')
    print(out)


if __name__ == '__main__':
    main()
