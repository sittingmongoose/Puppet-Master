#!/usr/bin/env python3
"""Rail motion performance on the CPU-only VM (Jared's 60 fps target without a GPU).

  xvfb-run -a -s "-screen 0 1920x1200x24" python3 Concepts/leftrail-redesign/tools/rail_perf.py <page.html> <out.json> \
      [--concepts a,b,c] [--themes basic-dark,glass-dark,retro-light] [--size 1600x1000]

Headful Chrome with --disable-gpu (headless redraws the whole frame each time), frames counted from a trace: frames the
display compositor actually drew (Display::DrawAndSwap), with nothing added to the page (a rAF loop would force a full
rendering pass). Uses the opus-5.5 perf tools' CDP client and frame counter. Each moment fires one rail motion and
records about 1.2 s. Outputs go where you point them, never into the repository; the Chrome profile is deleted on exit.
"""
import json
import os
import sys
import threading
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'onboarding', 'opus-5.5', 'tools', 'perf'))
from cdp import Browser  # noqa: E402
import perf as opus_perf  # noqa: E402  (frame_trace, FPS_CATS)

args = sys.argv[1:]
opt = lambda k, d=None: args[args.index('--' + k) + 1] if '--' + k in args else d
PAGE = os.path.abspath(args[0])
OUT = args[1]
CONCEPTS = opt('concepts', 'a,b,c').split(',')
THEMES = opt('themes', 'basic-dark,glass-dark,retro-light').split(',')
W, H = map(int, opt('size', '1600x1000').split('x'))

CLICK_NAV = """(() => { const vis = [...document.querySelectorAll('.pmr-view [data-pmr-nav="%s"], #pmr-overlay [data-pmr-nav="%s"]')]
  .filter(e => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.top >= 0 && r.bottom <= innerHeight; });
  const e = vis[Math.min(%d, vis.length - 1)]; if (!e) return 'ERR none'; e.click(); return true; })()"""
PANEL = "(() => { const s = document.getElementById('sidePanelSlot'), o = document.getElementById('panel-%s'); if (!(o.classList.contains('active') && !s.classList.contains('hidden'))) document.querySelector('#activityBar .icon[data-target=\"panel-%s\"]').click(); return true; })()"
MENU = "(() => { const t = [...document.querySelectorAll('.pmr-view .pmr-trigger')].find(e => e.getBoundingClientRect().height > 2); if (!t) return 'ERR none'; t.click(); return true; })()"
CLOSE = "(() => { window.PMR.menu.closeAll(); return true; })()"
KEY_DOWN = "(() => { const a = document.activeElement || document.body; a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true })); return true; })()"
BACK = "(() => { const b = [...document.querySelectorAll('.pmr-view [data-pmr-nav=\"back\"]')].find(x => x.getBoundingClientRect().height > 2); if (!b) return 'ERR none'; b.click(); return true; })()"
RESET = "(() => { window.PMR.menu.closeAll(); window.PMR.host.setConcept(window.PMR.concepts.current(), { force: true }); return true; })()"

MOMENTS = {
    'a': [('tab', 'source', CLICK_NAV % ('tab', 'tab', 1)), ('expand', 'source', CLICK_NAV % ('expand', 'expand', 1))],
    'b': [('drill', 'source', CLICK_NAV % ('drill', 'drill', 0)), ('back', None, BACK)],
    'c': [('lens-open', 'docker', CLICK_NAV % ('select', 'select', 2)), ('lens-follow', None, KEY_DOWN), ('tab', 'source', CLICK_NAV % ('tab', 'tab', 1))],
}


def main():
    b = Browser(port=int(opt('port', '9351')), width=W, height=H, extra=['--disable-gpu'], headless=False)
    results = {'page': PAGE, 'size': f'{W}x{H}', 'chrome': b.version.get('Browser'), 'runs': []}
    try:
        for theme in THEMES:
            fam, mode = theme.split('-')
            p = b.new_page(W, H)
            p.goto('file://' + PAGE + '?o55=off')
            time.sleep(3.0)
            p.eval("localStorage.clear(); window.PM_THEME.setFamily(%s, {persist:false}); window.PM_THEME.setMode(%s, {persist:false}); true" % (json.dumps(fam), json.dumps(mode)))
            time.sleep(1.5)

            def moment(concept, name, js, secs=1.2):
                tev, done = [], threading.Event()
                offd = p.on('Tracing.dataCollected', lambda prm: tev.extend(prm.get('value', [])))
                offc = p.on('Tracing.tracingComplete', lambda prm: done.set())
                p.b.send('Tracing.start', {'traceConfig': {'includedCategories': opus_perf.FPS_CATS, 'recordMode': 'recordContinuously'}, 'transferMode': 'ReportEvents'}, p.s)
                t0 = time.time()
                err = None
                if js:
                    try:
                        v = p.eval(js, timeout=20)
                        if isinstance(v, str) and v.startswith('ERR'):
                            err = v
                    except Exception as e:  # noqa: BLE001
                        err = str(e)[:160]
                rest = secs - (time.time() - t0)
                if rest > 0:
                    time.sleep(rest)
                p.b.send('Tracing.end', {}, p.s)
                done.wait(60)
                offd(); offc()
                r = opus_perf.frame_trace(tev, time.time() - t0)
                r.update({'theme': theme, 'concept': concept, 'name': name})
                if err:
                    r['error'] = err
                results['runs'].append(r)
                print(f"{theme:14s} {concept:7s} {name:12s} fps {r['fps']:5.1f} p95 {r['p95']:5.1f} max {r['max']:6.1f} drop {r['dropped']:3d} "
                      f"mainFrames {r['mainFrames']:4d} busy {r['mainBusyPct']:5.1f}%" + (f"  {err}" if err else ''), flush=True)

            for c in CONCEPTS:
                p.eval("window.PMR.concepts.set(%s); true" % json.dumps(c))
                time.sleep(1.0)
                p.eval(PANEL % ('files', 'files'))
                time.sleep(0.8)
                moment(c, 'idle', None, 1.5)
                moment(c, 'bar-switch', PANEL % ('docker', 'docker'))
                moment(c, 'menu-open', MENU)
                p.eval(CLOSE); time.sleep(0.5)
                for name, panel, js in MOMENTS.get(c, []):
                    if panel:
                        p.eval(RESET); time.sleep(0.6)
                        p.eval(PANEL % (panel, panel)); time.sleep(0.8)
                    moment(c, name, js)
                p.eval(RESET); time.sleep(0.5)
            p.close()
    finally:
        b.close()
    with open(OUT, 'w') as fh:
        json.dump(results, fh, indent=1)
    worst = min((r['fps'] for r in results['runs'] if r['name'] != 'idle'), default=0)
    print('rail perf: worst moment fps', worst)


if __name__ == '__main__':
    main()
