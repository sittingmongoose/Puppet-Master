"""Performance walk of the onboarding and the Guided Tour, per theme: opening, every screen at rest and changing,
typing a name, the tour's steps, Show Me and Skip, and the look picker.
python3 perf.py <page.html> <out.json> [--themes basic-dark,...] [--size 1600x1000] [--quick] [--headful] [--tracefps]
                [--only open,idle,...] [--port 9341] [--trace]
Default metrics: requestAnimationFrame gaps (60 Hz budget), Long Animation Frames and CDP Performance deltas (style,
layout, script, task time). The rAF loop makes the page render a frame every vsync, which on this page costs a full
layerize pass, so for compositor-driven motion use --tracefps: frames the display compositor actually drew
(Display::DrawAndSwap) and main-thread frames, read from a trace, with nothing added to the page.
Runs on Windows (ANGLE on Vulkan: GPU raster from an SSH session, where D3D11 cannot present) and on Linux (software;
use xvfb-run with --headful, since headless Chrome redraws the whole frame each time). Outputs go where you point
them, never into the repository; Chrome profiles are deleted on exit."""
import json, os, sys, time, threading
from cdp import Browser

args = sys.argv[1:] if __name__ == '__main__' else ['x', 'y']
page_file = os.path.abspath(args[0]); out_file = args[1]
opt = lambda k, d=None: args[args.index('--' + k) + 1] if '--' + k in args else d
THEMES = opt('themes', 'basic-dark,basic-light,friendly-dark,friendly-light,glass-dark,glass-light,retro-dark,retro-light').split(',')
W, H = map(int, opt('size', '1920x1080').split('x'))
TRACE = '--trace' in args
ONLY = set(opt('only', '').split(',')) - {''}
EXTRA = ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--use-angle=vulkan', '--enable-features=Vulkan'] if os.name == 'nt' else ['--disable-gpu']

REC = r"""
(() => {
  if (window.__pp) return true;
  const R = window.__pp = { frames: [], loaf: [], on: false };
  let raf = 0;
  const loop = (t) => { if (!R.on) return; R.frames.push(t); raf = requestAnimationFrame(loop); };
  try {
    new PerformanceObserver((l) => {
      if (!R.on) return;
      for (const e of l.getEntries()) R.loaf.push({ s: e.startTime, d: e.duration, b: e.blockingDuration, rs: e.renderStart, sls: e.styleAndLayoutStart,
        scripts: (e.scripts || []).map((s) => ({ inv: s.invoker, it: s.invokerType, fn: s.sourceFunctionName, cp: s.sourceCharPosition, d: s.duration, fsl: s.forcedStyleAndLayoutDuration })) });
    }).observe({ type: 'long-animation-frame', buffered: false });
  } catch (e) { R.noLoaf = String(e); }
  R.start = () => { R.frames = []; R.loaf = []; R.on = true; R.t0 = performance.now(); raf = requestAnimationFrame(loop); return true; };
  R.stop = () => {
    R.on = false; cancelAnimationFrame(raf); const t1 = performance.now();
    const f = R.frames, d = []; for (let i = 1; i < f.length; i++) d.push(f[i] - f[i - 1]);
    const s = d.slice().sort((a, b) => a - b), q = (p) => s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : 0;
    const dropped = d.reduce((a, x) => a + Math.max(0, Math.round(x / 16.667) - 1), 0);
    const loafTot = R.loaf.reduce((a, e) => a + e.d, 0), block = R.loaf.reduce((a, e) => a + e.b, 0);
    const byFn = {};
    for (const e of R.loaf) for (const sc of e.scripts) { const k = (sc.fn || '?') + '@' + sc.cp + ' ' + (sc.inv || '').slice(0, 60); byFn[k] = byFn[k] || { d: 0, n: 0, fsl: 0 }; byFn[k].d += sc.d; byFn[k].n++; byFn[k].fsl += sc.fsl || 0; }
    const render = R.loaf.reduce((a, e) => a + Math.max(0, e.s + e.d - (e.rs || e.s + e.d)), 0);
    return { ms: +(t1 - R.t0).toFixed(0), frames: f.length, fps: +(1000 * (f.length - 1) / Math.max(1, f[f.length - 1] - f[0])).toFixed(1),
      p50: +q(0.5).toFixed(1), p95: +q(0.95).toFixed(1), max: +(s[s.length - 1] || 0).toFixed(1), jank25: d.filter((x) => x > 25).length, jank50: d.filter((x) => x > 50).length, dropped,
      loaf: R.loaf.length, loafMs: +loafTot.toFixed(0), blockMs: +block.toFixed(0), renderMs: +render.toFixed(0),
      top: Object.entries(byFn).sort((a, b) => b[1].d - a[1].d).slice(0, 6).map(([k, v]) => [k, +v.d.toFixed(0), v.n, +v.fsl.toFixed(0)]) };
  };
  return true;
})()
"""

METRICS = ['TaskDuration', 'ScriptDuration', 'RecalcStyleDuration', 'LayoutDuration', 'RecalcStyleCount', 'LayoutCount', 'Nodes', 'JSHeapUsedSize']
TRACE_CATS = 'devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.frame,blink,cc,viz,gpu,benchmark,rail,loading'


FPS_CATS = ['viz', 'cc', 'benchmark', 'devtools.timeline']


def frame_trace(ev, secs):
    """Frames the display compositor actually drew (Display::DrawAndSwap) and main-thread work, from a trace; nothing
    in the page is touched, so compositor-only animation is measured as it runs for a person."""
    names = {}
    for e in ev:
        if e.get('ph') == 'M' and e.get('name') == 'thread_name': names[(e['pid'], e['tid'])] = e['args']['name']
    viz = {k for k, v in names.items() if v == 'VizCompositorThread'}
    main = {k for k, v in names.items() if v == 'CrRendererMain'}
    draws = sorted(e['ts'] for e in ev if (e.get('pid'), e.get('tid')) in viz and e.get('name') == 'Display::DrawAndSwap' and e.get('ph') in ('X', 'B'))
    gaps = [(b - a) / 1000 for a, b in zip(draws, draws[1:])]
    sg = sorted(gaps)
    q = lambda f: round(sg[min(len(sg) - 1, int(f * len(sg)))], 1) if sg else 0
    busy = sum(e.get('dur', 0) for e in ev if (e.get('pid'), e.get('tid')) in main and e.get('ph') == 'X' and e.get('name') in ('RunTask', 'ThreadControllerImpl::RunTask')) / 1000
    bmf = sum(1 for e in ev if (e.get('pid'), e.get('tid')) in main and e.get('name') == 'ProxyMain::BeginMainFrame' and e.get('ph') == 'X')
    lay = sum(e.get('dur', 0) for e in ev if (e.get('pid'), e.get('tid')) in main and e.get('name') == 'Layerize' and e.get('ph') == 'X') / 1000
    return {'fps': round(len(draws) / secs, 1), 'p50': q(0.5), 'p95': q(0.95), 'max': round(max(gaps), 1) if gaps else 0, 'jank25': sum(1 for g in gaps if g > 25),
            'dropped': sum(max(0, round(g / 16.667) - 1) for g in gaps), 'mainFrames': bmf, 'mainBusyPct': round(100 * busy / (secs * 1000), 1), 'layerizeMs': round(lay, 0)}


class Tracer:
    def __init__(self, page):
        self.p = page; self.events = []; self.done = threading.Event()
        page.on('Tracing.dataCollected', lambda prm: self.events.extend(prm.get('value', [])))
        page.on('Tracing.tracingComplete', lambda prm: self.done.set())

    def start(self):
        self.events = []; self.done.clear()
        self.p.b.send('Tracing.start', {'traceConfig': {'includedCategories': TRACE_CATS.split(','), 'recordMode': 'recordAsMuchAsPossible'}, 'transferMode': 'ReportEvents'}, self.p.s)

    def stop(self):
        self.p.b.send('Tracing.end', {}, self.p.s); self.done.wait(60)
        return summarize_trace(self.events)


def summarize_trace(ev):
    names = {}
    for e in ev:
        if e.get('ph') == 'M' and e.get('name') == 'thread_name':
            names[(e['pid'], e['tid'])] = e['args']['name']
    main = [k for k, v in names.items() if v == 'CrRendererMain']
    comp = [k for k, v in names.items() if v == 'Compositor']
    gpu = [k for k, v in names.items() if v in ('CrGpuMain', 'VizCompositorThread')]
    raster = [k for k, v in names.items() if v.startswith('CompositorTileWorker')]
    def tot(keys, which):
        agg = {}
        for e in ev:
            if (e.get('pid'), e.get('tid')) in keys and e.get('ph') == 'X' and 'dur' in e:
                n = e['name']
                if which and n not in which: continue
                a = agg.setdefault(n, [0.0, 0]); a[0] += e['dur'] / 1000; a[1] += 1
        return {k: [round(v[0], 1), v[1]] for k, v in sorted(agg.items(), key=lambda kv: -kv[1][0])[:18]}
    MAIN = {'RunTask', 'UpdateLayoutTree', 'Layout', 'Paint', 'PrePaint', 'Layerize', 'Commit', 'FunctionCall', 'TimerFire', 'FireAnimationFrame',
            'RunMicrotasks', 'EvaluateScript', 'ParseHTML', 'HitTest', 'UpdateLayer', 'PaintImage', 'Decode Image', 'ScrollLayer', 'v8.callFunction',
            'LocalFrameView::RunPostLifecycleSteps', 'IntersectionObserverController::computeIntersections', 'Document::updateStyleAndLayout',
            'ProxyMain::BeginMainFrame', 'UpdateLifecycle', 'Animation', 'ProcessMainThreadAnimations', 'MajorGC', 'MinorGC', 'V8.GC_SCAVENGER', 'BlinkGC.AtomicPhase'}
    run = sum(e['dur'] for e in ev if (e.get('pid'), e.get('tid')) in main and e.get('ph') == 'X' and e.get('name') in ('RunTask', 'ThreadControllerImpl::RunTask') and 'dur' in e) / 1000
    states = {}
    for e in ev:
        if e.get('name') == 'PipelineReporter' and e.get('ph') in ('b', 'X'):
            st = ((e.get('args') or {}).get('chrome_frame_reporter') or {}).get('state')
            if st: states[st] = states.get(st, 0) + 1
    span = [e['ts'] for e in ev if 'ts' in e and e.get('ph') == 'X']
    return {'spanMs': round((max(span) - min(span)) / 1000, 0) if span else 0, 'mainRunTaskMs': round(run, 1), 'main': tot(main, MAIN), 'compositor': tot(comp, None),
            'raster': tot(raster, None), 'viz_gpu': tot(gpu, None), 'frames': states}


def main():
    b = Browser(port=int(opt('port', '9341')), width=W, height=H, extra=EXTRA, headless='--headful' not in args)
    info = b.send('SystemInfo.getInfo')['gpu']
    results = {'page': page_file, 'size': f'{W}x{H}', 'chrome': b.version.get('Browser'), 'gpu': info['auxAttributes'].get('glRenderer'),
               'featureStatus': {k: info['featureStatus'].get(k) for k in ('gpu_compositing', 'rasterization')}, 'themes': {}}
    try:
        for theme in THEMES:
            fam, mode = theme.split('-')
            p = b.new_page(W, H)
            p.send('Performance.enable', {'timeDomain': 'timeTicks'})
            p.send('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-color-scheme', 'value': mode}]})
            tracer = Tracer(p) if TRACE else None
            url = 'file:///' + page_file.replace('\\', '/') + '?o55=off'
            if '--debug' in args: print('goto', url, flush=True)
            p.goto(url); time.sleep(2.5)
            if '--debug' in args: print('loaded', flush=True)
            p.eval("localStorage.clear(); window.PM_THEME.setFamily(%s, {persist:false}); window.PM_THEME.setMode(%s, {persist:false}); true" % (json.dumps(fam), json.dumps(mode)))
            time.sleep(1.5)
            p.eval(REC)
            res = results['themes'][theme] = {'moments': []}

            def metrics():
                return {m['name']: m['value'] for m in p.send('Performance.getMetrics')['metrics'] if m['name'] in METRICS}

            def moment(name, js, secs, pre_wait=0.0):
                if '--debug' in args: print('  >', name, flush=True)
                if ONLY and name.split(':')[0] not in ONLY:
                    if js:
                        try: p.eval(js)
                        except Exception as e: print('  ! ', name, str(e)[:120], flush=True)
                    time.sleep(secs); return
                if pre_wait: time.sleep(pre_wait)
                m0 = metrics()
                tfps = '--tracefps' in args
                if tfps:
                    tev = []; tdone = threading.Event()
                    offd = p.on('Tracing.dataCollected', lambda prm: tev.extend(prm.get('value', [])))
                    offc = p.on('Tracing.tracingComplete', lambda prm: tdone.set())
                    p.b.send('Tracing.start', {'traceConfig': {'includedCategories': FPS_CATS, 'recordMode': 'recordContinuously'}, 'transferMode': 'ReportEvents'}, p.s)
                elif tracer: tracer.start()
                if not tfps: p.eval('window.__pp.start()')
                t0 = time.time()
                err = None
                if js:
                    try:
                        v = p.eval(js, timeout=25)
                        if isinstance(v, str) and v.startswith('ERR'): err = v
                    except Exception as e: err = str(e)[:200]
                rest = secs - (time.time() - t0)
                if rest > 0: time.sleep(rest)
                if tfps:
                    p.b.send('Tracing.end', {}, p.s); tdone.wait(60); offd(); offc()
                    r = frame_trace(tev, time.time() - t0)
                    r['loafMs'] = 0
                else:
                    r = p.eval('window.__pp.stop()', timeout=25)
                m1 = metrics()
                r['cdp'] = {k: round((m1.get(k, 0) - m0.get(k, 0)) * (1000 if k.endswith('Duration') else 1), 1) for k in METRICS if k not in ('Nodes', 'JSHeapUsedSize')}
                r['nodes'] = m1.get('Nodes'); r['name'] = name
                if err: r['error'] = err
                if tracer: r['trace'] = tracer.stop()
                res['moments'].append(r)
                extra = f" mainFrames {r['mainFrames']:4d} busy {r['mainBusyPct']:5.1f}% layerize {r['layerizeMs']:5.0f}" if tfps else f" loaf {r['loafMs']:5d}ms"
                print(f"{theme:15s} {name:22s} fps {r['fps']:5.1f} p95 {r['p95']:5.1f} max {r['max']:6.1f} drop {r['dropped']:3d}{extra} style {r['cdp']['RecalcStyleDuration']:6.1f} layout {r['cdp']['LayoutDuration']:6.1f} script {r['cdp']['ScriptDuration']:6.1f} task {r['cdp']['TaskDuration']:7.1f}", flush=True)

            try:
                # app baseline, onboarding closed
                moment('app-idle', None, 3.0)
                moment('open', "window.O55.store.clear('onboarding'); window.O55.ui.open({fresh:true}); true", 2.4)
                moment('idle:welcome', None, 3.0)
                for sc in (['where', 'begin', 'name', 'safe', 'review', 'ready'] if '--quick' in args else ['where', 'begin', 'name', 'like', 'safe', 'away', 'nas-find', 'review', 'creating', 'ready']):
                    moment('go:' + sc, "(() => { try { window.O55.ui.go(%s); return true; } catch (e) { return 'ERR ' + String(e).slice(0, 120); } })()" % json.dumps(sc), 1.8)
                    moment('idle:' + sc, None, 2.5)
                    if sc == 'name':
                        moment('type:name', r"""(async () => { const el = document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-bind]'); if (!el) return 'nofield'; el.focus(); for (const ch of 'Book club site') { el.value += ch; el.dispatchEvent(new Event('input', {bubbles: true})); await new Promise(r => setTimeout(r, 140)); } return true; })()""", 3.0)
                moment('back', "window.O55.ui.go(window.O55.S.sess.history[window.O55.S.sess.history.length-1] || 'welcome', {dir:'back', noHistory:true}); true", 1.8)
                moment('close', "window.O55.ui.close('close'); true", 1.5)
                # tour
                moment('tour:start', "window.O55.tour.start({fresh:true}); true", 2.4)
                moment('tour:idle0', None, 3.0)
                for i in range(1, 4 if '--quick' in args else 5):
                    moment('tour:next%d' % i, "(() => { const b = document.querySelector('#pm-o55-tour [data-o55t=\"next\"], #pm-o55-tour [data-o55t=\"skipStep\"]'); if (b) b.click(); else window.O55.tour.go(window.O55.tour.defs[Math.min(window.O55.tour.defs.length-1, window.O55.tour.defs.findIndex(d => d.id === window.O55.tour.state().step) + 1)].id); return true; })()", 2.0)
                    moment('tour:idle%d' % i, None, 2.0)
                moment('tour:showme', "(() => { const b = document.querySelector('#pm-o55-tour [data-o55t=\"showMe\"]'); if (b) b.click(); return !!b; })()", 5.0)
                moment('tour:skip', "window.O55.tour.skip(); true", 2.0)
                # the look page, a real pick (theme change + reveal), then the same screens again to see what the pick leaves behind
                moment('reopen', "window.O55.ui.open({fresh:true}); true", 2.0)
                moment('go:look', "window.O55.ui.go('look'); true", 1.8)
                moment('idle:look', None, 2.5)
                other = {'basic': 'friendly', 'friendly': 'glass', 'glass': 'retro', 'retro': 'basic'}[fam]
                box = p.eval(r"""(() => { const t = document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-tile[data-arg="%s"]'); const r = t.getBoundingClientRect(); return {x: r.left + r.width/2, y: r.top + r.height/2}; })()""" % other)
                m0 = metrics(); p.eval('window.__pp.start()')
                if tracer: tracer.start()
                p.click_xy(box['x'], box['y']); time.sleep(2.5)
                r = p.eval('window.__pp.stop()'); m1 = metrics()
                r['cdp'] = {k: round((m1.get(k, 0) - m0.get(k, 0)) * (1000 if k.endswith('Duration') else 1), 1) for k in METRICS if k not in ('Nodes', 'JSHeapUsedSize')}
                r['name'] = 'pick:' + other
                if tracer: r['trace'] = tracer.stop()
                res['moments'].append(r)
                print(f"{theme:15s} {'pick:' + other:22s} fps {r['fps']:5.1f} p95 {r['p95']:5.1f} max {r['max']:6.1f} drop {r['dropped']:3d} style {r['cdp']['RecalcStyleDuration']:6.1f}", flush=True)
                moment('idle:look-after', None, 2.5)
                moment('pick:back', "window.PM_THEME.setFamily(%s, {persist:false}); window.PM_THEME.setMode(%s, {persist:false}); true" % (json.dumps(fam), json.dumps(mode)), 2.5)
                moment('go:where-after', "window.O55.ui.go('where'); true", 1.8)
                moment('idle:where-after', None, 2.5)
                moment('close2', "window.O55.ui.close('close'); true", 1.5)
                moment('app-idle-after', None, 2.5)
            except Exception as e:
                print(theme, 'ABORTED', str(e)[:200], flush=True); res['aborted'] = str(e)[:300]
            res['errors'] = p.errors[:20]
            p.close()
            with open(out_file, 'w') as f: json.dump(results, f, indent=1)
    finally:
        with open(out_file, 'w') as f: json.dump(results, f, indent=1)
        b.close()


if __name__ == '__main__':
    main()
