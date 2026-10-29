"""Build one self-contained HTML for the share folder: PMConcept7.html with the background-activity layer inlined.
Opened from a file (no server), so no fetch and no iframe: the layer boots inside the page itself, the way host.js
injected it (same readiness test, same <style>/<script> elements). First-run onboarding defaults to off (?o55=off).

Run from Concepts/:
  python3 -I -B background-activity/opus-5.5/tools/build_standalone.py background-activity/opus-5.5 PMConcept7.html OUT.html
"""
import json, sys, pathlib
concept, pm7, out = map(pathlib.Path, sys.argv[1:4])
html = pm7.read_text(encoding='utf-8')
PATCHES = [
    ("var o55sw = new URLSearchParams(location.search).get('o55') || ''", "var o55sw = new URLSearchParams(location.search).get('o55') || 'off'"),
    ("const sw = q.get('o55') || '';", "const sw = q.get('o55') || 'off';"),
]
for a, b in PATCHES:
    n = html.count(a)
    if n != 1: sys.exit(f'patch target found {n} times: {a}')
    html = html.replace(a, b)
src = concept / 'src'
css = (src / 'rw.css').read_text(encoding='utf-8')
js = '\n;\n'.join((src / f).read_text(encoding='utf-8') for f in ['rw-data.js', 'rw-glyphs.js', 'rw-thread.js', 'rw-platform.js', 'rw-lab.js'])
def lit(s): return json.dumps(s).replace('</', '<\\/').replace('<!--', '<\\!--')
boot = f"""<script id="rw-boot">
/* Background activity concept (Opus 5.5), standalone copy: the layer from Concepts/background-activity/opus-5.5/src,
   inlined. #thread opens the chat's Processes view, #platform the status bar panel. */
(function () {{
  'use strict';
  var CSS = {lit(css)}, JS = {lit(js)};
  var h = (location.hash || '').slice(1), open = h === 'thread' || h === 'platform' ? h : 'both';
  var t = setInterval(function () {{
    var d = document;
    if (d.getElementById('rw-css')) {{ clearInterval(t); return; }}
    if (!window.PMG || !d.getElementById('pm7GlobalStatusBar') || !d.querySelector('.pm56-activity-bar')) return;
    clearInterval(t);
    var st = d.createElement('style'); st.id = 'rw-css'; st.textContent = CSS; d.head.appendChild(st);
    var sc = d.createElement('script'); sc.id = 'rw-js'; sc.textContent = 'window.RW_OPEN=' + JSON.stringify(open) + ';\\n' + JS; d.body.appendChild(sc);
  }}, 300);
}})();
</script>
"""
i = html.rfind('</body>')
if i < 0: sys.exit('no </body>')
html = html[:i] + boot + html[i:]
html = html.replace('<title>', '<title>Background activity concept (Opus 5.5) · ', 1)
out.write_text(html, encoding='utf-8')
print(out, len(html.encode('utf-8')))
