#!/usr/bin/env python3
"""Rail motion performance on the VM's GPU (Quadro P1000; Jared's 60 fps target).

  python3 Concepts/leftrail-redesign/tools/rail_perf.py <page.html> <out.json> \
      [--concepts d,current] [--themes basic-dark,glass-dark,retro-light] [--size 1600x1000] [--port 9351]

Skin concepts (d and current, SKIN_CONCEPTS) are measured on all nine rail panels in the order the rail is used: idle on
Files, then for each panel its activity-bar switch (bar-switch), its first expander (expand) where it has one, its first
menu (menu-open) where it has one, and its second tab (tab) where it has tabs; the panel's default tab is put back before
the next panel. View concepts (a, b, c) keep their own moments (MOMENTS). A fresh page is loaded for every theme x
concept, so expander and tab states start the same for both skin concepts. Each run record has theme, concept, name (the
moment kind), panel (the rail panel; null for a view concept's own moments), fps, p95, max, dropped, mainFrames,
mainBusyPct, and error when the moment's target was missing.

Headful Chrome on the VM's NVIDIA desktop: --enable-gpu plus env DISPLAY=:0 and XAUTHORITY=/home/sittingmongoose/.Xauthority
(without both, every Chrome variant silently renders on the CPU); the --disable-gpu and swiftshader flags are forbidden.
Once per run, before the first moment, the WebGL UNMASKED_RENDERER_WEBGL must name the real GPU or the run aborts with a
failing check. Frames are counted from a trace: frames the display compositor actually drew (Display::DrawAndSwap), with
nothing added to the page (a rAF loop would force a full rendering pass). Each moment fires one rail motion and records
about 1.2 s. The CDP client and frame counter are the opus-5.5 perf tools: PM_PERF_TOOLS names their directory (default:
Concepts/onboarding/opus-5.5/tools/perf of this repository). On the VM, copy this file into the lane directory and run
it there with PM_PERF_TOOLS=$HOME/src/PuppetMaster/Concepts/onboarding/opus-5.5/tools/perf. Outputs go where you point
them, never into the repository; the Chrome profile is deleted on exit.
"""
import json
import os
import re
import sys
import threading
import time

HERE = os.path.dirname(os.path.abspath(__file__))
PERF_TOOLS = os.environ.get('PM_PERF_TOOLS') or os.path.join(HERE, '..', '..', 'onboarding', 'opus-5.5', 'tools', 'perf')
sys.path.insert(0, PERF_TOOLS)
from cdp import Browser  # noqa: E402
import perf as opus_perf  # noqa: E402  (frame_trace, FPS_CATS)

args = sys.argv[1:]
opt = lambda k, d=None: args[args.index('--' + k) + 1] if '--' + k in args else d
PAGE = os.path.abspath(args[0])
OUT = args[1]
CONCEPTS = opt('concepts', 'd,current').split(',')
THEMES = opt('themes', 'basic-dark,glass-dark,retro-light').split(',')
W, H = map(int, opt('size', '1600x1000').split('x'))
PORT = int(opt('port', '9351'))

ALL_PANELS = ['files', 'search', 'source', 'git', 'docker', 'testing', 'run', 'agents', 'artifacts']  # activity-bar order
SKIN_CONCEPTS = ('d', 'current')   # the shell's own panels are the view (rail_boot's skin concepts)
VISIBLE = "const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.top >= 0 && r.bottom <= innerHeight; };"
MENU_TRIGGER = '.pm6-tb-menu-trigger'
EXPANDER = '.sh-shelf[data-acc] > .sh-head'

CLICK_NAV = """(() => { const vis = [...document.querySelectorAll('.pmr-view [data-pmr-nav="%s"], #pmr-overlay [data-pmr-nav="%s"]')]
  .filter(e => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.top >= 0 && r.bottom <= innerHeight; });
  const e = vis[Math.min(%d, vis.length - 1)]; if (!e) return 'ERR none'; e.click(); return true; })()"""
PANEL = "(() => { const s = document.getElementById('sidePanelSlot'), o = document.getElementById('panel-%s'); if (!(o.classList.contains('active') && !s.classList.contains('hidden'))) document.querySelector('#activityBar .icon[data-target=\"panel-%s\"]').click(); return true; })()"
MENU = "(() => { const t = [...document.querySelectorAll('.pmr-view .pmr-trigger')].find(e => e.getBoundingClientRect().height > 2); if (!t) return 'ERR none'; t.click(); return true; })()"
CLOSE = "(() => { window.PMR.menu.closeAll(); return true; })()"
KEY_DOWN = "(() => { const a = document.activeElement || document.body; a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true })); return true; })()"
BACK = "(() => { const b = [...document.querySelectorAll('.pmr-view [data-pmr-nav=\"back\"]')].find(x => x.getBoundingClientRect().height > 2); if (!b) return 'ERR none'; b.click(); return true; })()"
# For a view concept RESET re-renders the concept and restores the active shell panel's first visible tab
RESET = ("(() => { window.PMR.menu.closeAll(); window.PMR.host.setConcept(window.PMR.concepts.current(), { force: true });"
         " const s = document.getElementById('sidePanelSlot'), act = s && s.querySelector('.side-panel-view.active');"
         " if (act && document.documentElement.hasAttribute('data-rail-skin')) {"
         "   const t = [...act.querySelectorAll('[data-tab]')].find(e => e.getBoundingClientRect().height > 2);"
         "   if (t && !t.classList.contains('active')) t.click(); }"
         " return true; })()")
GPU_JS = "(() => { const g = document.createElement('canvas').getContext('webgl'); if (!g) return 'no webgl'; const x = g.getExtension('WEBGL_debug_renderer_info'); return g.getParameter(x ? x.UNMASKED_RENDERER_WEBGL : g.RENDERER); })()"

# skin concepts: a click on the index-th visible element of a rail panel (ERR none when there is none)
IN_PANEL = "(() => { " + VISIBLE + " const e = [...document.querySelectorAll('#panel-%s %s')].filter(vis)[%d]; if (!e) return 'ERR none'; e.click(); return true; })()"
# run before a probe, outside any moment window: an expander that opens scrolls the panel (D reveals the shelf), which can
# move the next target above the fold, so a target that is off screen is scrolled back into view first; returns
# 'scrolled' (wait for the scroll to settle), 'in view', or 'ERR none' when the panel shows no such element
SCROLL_TO = ("(() => { const e = [...document.querySelectorAll('#panel-%s %s')].find(e => e.getBoundingClientRect().width > 2); if (!e) return 'ERR none';"
             " const r = e.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) { e.scrollIntoView({ block: 'center' }); return 'scrolled'; } return 'in view'; })()")
# what a panel offers in its current state (its own tabs, expanders and menu triggers that are on screen)
PROBE = "(() => { " + VISIBLE + " const p = document.getElementById('panel-%s'); const n = (sel) => [...p.querySelectorAll(sel)].filter(vis).length;" \
        " return { tabs: n('[data-tab]'), expanders: n('" + EXPANDER + "'), menus: n('" + MENU_TRIGGER + "') }; })()"
DEFAULT_TABS = ("(() => { const o = {}; for (const id of %s) { const a = document.querySelector('#panel-' + id + ' [data-tab].active');"
                " if (a) o[id] = a.getAttribute('data-tab'); } return o; })()")
GPU_CHECK_FAILED = 'rail perf: FAIL not on the GPU: %s'
MOMENTS = {
    'a': [('tab', 'source', CLICK_NAV % ('tab', 'tab', 1)), ('expand', 'source', CLICK_NAV % ('expand', 'expand', 1))],
    'b': [('drill', 'source', CLICK_NAV % ('drill', 'drill', 0)), ('back', None, BACK)],
    'c': [('lens-open', 'docker', CLICK_NAV % ('select', 'select', 2)), ('lens-follow', None, KEY_DOWN), ('tab', 'source', CLICK_NAV % ('tab', 'tab', 1))],
}


def reset_tab(panel, tab):
    """put a panel's default tab back (a silent click on the tab that is active when the page loads)"""
    return ("(() => { const t = [...document.querySelectorAll('#panel-%s [data-tab]')].find(e => e.getAttribute('data-tab') === %s);"
            " if (t && !t.classList.contains('active')) t.click(); return true; })()") % (panel, json.dumps(tab))


def moment(p, results, theme, concept, name, js, secs=1.2, panel=None):
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
    r.update({'theme': theme, 'concept': concept, 'name': name, 'panel': panel})
    if err:
        r['error'] = err
    results['runs'].append(r)
    print(f"{theme:14s} {concept:7s} {name:12s} {(panel or '-'):10s} fps {r['fps']:5.1f} p95 {r['p95']:5.1f} max {r['max']:6.1f} drop {r['dropped']:3d} "
          f"mainFrames {r['mainFrames']:4d} busy {r['mainBusyPct']:5.1f}%" + (f"  {err}" if err else ''), flush=True)


def escape(p):
    """a real Escape key press (closes a shell menu, which closeAll() does not)"""
    for kind in ('keyDown', 'keyUp'):
        p.send('Input.dispatchKeyEvent', {'type': kind, 'key': 'Escape', 'code': 'Escape', 'windowsVirtualKeyCode': 27})


def skin_moments(p, results, theme, concept):
    defaults = p.eval(DEFAULT_TABS % json.dumps(ALL_PANELS))
    p.eval(PANEL % ('files', 'files')); time.sleep(0.8)
    moment(p, results, theme, concept, 'idle', None, 1.5, 'files')
    for panel in ALL_PANELS[1:] + ['files']:   # every panel is switched into from another one
        moment(p, results, theme, concept, 'bar-switch', PANEL % (panel, panel), 1.2, panel)
        time.sleep(0.6)
        # each moment is picked from what is on screen right then: an expander that opens can move a menu off screen
        if p.eval(PROBE % panel)['expanders']:
            moment(p, results, theme, concept, 'expand', IN_PANEL % (panel, EXPANDER, 0), 1.2, panel)
            time.sleep(0.6)
        if p.eval(SCROLL_TO % (panel, MENU_TRIGGER)) == 'scrolled':
            time.sleep(0.6)
        if p.eval(PROBE % panel)['menus']:
            moment(p, results, theme, concept, 'menu-open', IN_PANEL % (panel, MENU_TRIGGER, 0), 1.2, panel)
            p.eval(CLOSE); escape(p); time.sleep(0.6)
        if p.eval(SCROLL_TO % (panel, '[data-tab]')) == 'scrolled':
            time.sleep(0.6)
        if p.eval(PROBE % panel)['tabs'] >= 2:
            moment(p, results, theme, concept, 'tab', IN_PANEL % (panel, '[data-tab]', 1), 1.2, panel)
            p.eval(reset_tab(panel, defaults.get(panel))); time.sleep(0.6)


def view_moments(p, results, theme, concept):
    p.eval(PANEL % ('files', 'files')); time.sleep(0.8)
    moment(p, results, theme, concept, 'idle', None, 1.5, 'files')
    moment(p, results, theme, concept, 'bar-switch', PANEL % ('docker', 'docker'), 1.2, 'docker')
    moment(p, results, theme, concept, 'menu-open', MENU, 1.2, 'docker')
    p.eval(CLOSE); time.sleep(0.5)
    for name, panel, js in MOMENTS.get(concept, []):
        if panel:
            p.eval(RESET); time.sleep(0.6)
            p.eval(PANEL % (panel, panel)); time.sleep(0.8)
        moment(p, results, theme, concept, name, js, 1.2, panel)
    p.eval(RESET); time.sleep(0.5)


def main():
    # Chrome must ride the VM GPU: --enable-gpu plus the NVIDIA desktop's DISPLAY/XAUTHORITY (guide: without both,
    # every variant silently renders on the CPU). The --disable-gpu and swiftshader flags are forbidden.
    os.environ.setdefault('DISPLAY', ':0')
    os.environ.setdefault('XAUTHORITY', '/home/sittingmongoose/.Xauthority')
    b = Browser(port=PORT, width=W, height=H, extra=['--enable-gpu'], headless=False)
    results = {'page': PAGE, 'size': f'{W}x{H}', 'chrome': b.version.get('Browser'), 'gpu': None, 'runs': []}
    try:
        for theme in THEMES:
            fam, mode = theme.split('-')
            for concept in CONCEPTS:
                p = b.new_page(W, H)
                p.goto('file://' + PAGE + '?o55=off')
                time.sleep(3.0)
                if results['gpu'] is None:  # once per run: frame numbers are only meaningful on the GPU
                    results['gpu'] = p.eval(GPU_JS)
                    if not isinstance(results['gpu'], str) or re.search('SwiftShader|llvmpipe', results['gpu'], re.I):
                        print(GPU_CHECK_FAILED % results['gpu'], flush=True)
                        sys.exit(1)
                p.eval("localStorage.clear(); window.PM_THEME.setFamily(%s, {persist:false}); window.PM_THEME.setMode(%s, {persist:false}); true" % (json.dumps(fam), json.dumps(mode)))
                time.sleep(1.5)
                p.eval("window.PMR.concepts.set(%s); true" % json.dumps(concept))
                time.sleep(1.0)
                if concept in SKIN_CONCEPTS:
                    skin_moments(p, results, theme, concept)
                else:
                    view_moments(p, results, theme, concept)
                p.close()
    finally:
        b.close()
    with open(OUT, 'w') as fh:
        json.dump(results, fh, indent=1)
    worst = min((r['fps'] for r in results['runs'] if r['name'] != 'idle'), default=0)
    print('rail perf: worst moment fps', worst)


if __name__ == '__main__':
    main()
