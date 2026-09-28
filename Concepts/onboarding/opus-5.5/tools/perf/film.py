"""Slow-motion films of the onboarding and the tour, per theme (Windows GPU raster via ANGLE on Vulkan, or Linux).
python film.py <page.html> <outdir> [--themes a,b] [--rate 0.1] [--scenes open,next,...] [--solid 0|1]
CSS and Web Animations are slowed through CDP Animation.setPlaybackRate, JS motion through O55.motion.setTimeScale;
one JPEG per 16.667 ms of motion time. frames.json per film. The frames are scratch: review them as contact sheets
(ffmpeg tile) and delete them when done (Jared, 2026-09-24)."""
import base64, json, os, sys, time
from cdp import Browser
import perf as P
args = sys.argv[1:]
page = os.path.abspath(args[0]); out = os.path.abspath(args[1])
opt = lambda k, d=None: args[args.index('--' + k) + 1] if '--' + k in args else d
THEMES = opt('themes', 'basic-dark,basic-light,friendly-dark,friendly-light,glass-dark,glass-light,retro-dark,retro-light').split(',')
RATE = float(opt('rate', '0.1')); STEP = 16.667 / RATE
SOLID = opt('solid', '0')
WIN = "(() => { const el = document.querySelector('#pm-o55-onboarding .o55-win'); let r = el && el.getBoundingClientRect(); if (!r || !r.width) { const w = Math.min(1080, innerWidth - 48), h = Math.min(720, innerHeight - 48); r = { left: (innerWidth - w) / 2, top: (innerHeight - h) / 2, width: w, height: h }; } return { x: Math.max(0, r.left - 16), y: Math.max(0, r.top - 16), width: Math.min(innerWidth, r.width + 32), height: Math.min(innerHeight, r.height + 32) }; })()"
FULL = "({ x: 0, y: 0, width: innerWidth, height: innerHeight })"
TOURSTEP = "(() => { const i = window.O55.tour.defs.findIndex(d => d.id === window.O55.tour.state().step); window.O55.tour.go(window.O55.tour.defs[i + 1].id); return true; })()"
SCENES = {
  'open': {'frames': 80, 'setup': ["window.O55.store.clear('onboarding'); if (window.O55.S.open) window.O55.ui.close('close'); true"], 'wait': 2.0, 'clip': WIN, 'trigger': "window.O55.ui.open({fresh:true}); true"},
  'next-rig': {'frames': 90, 'setup': ["window.O55.ui.open({fresh:true}); window.O55.ui.go('where', {silent:true}); true"], 'wait': 3.0, 'clip': WIN, 'trigger': "window.O55.ui.go('begin'); true"},
  'name-type': {'frames': 70, 'setup': ["window.O55.ui.open({fresh:true}); window.O55.ui.go('name', {silent:true}); true"], 'wait': 3.0, 'clip': WIN,
                'trigger': "(() => { const el = document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-bind]'); el.focus(); el.value = 'Book'; el.dispatchEvent(new Event('input', {bubbles: true})); return true; })()"},
  'review-idle': {'frames': 60, 'setup': ["window.O55.ui.open({fresh:true}); window.O55.ui.go('review', {silent:true}); true"], 'wait': 3.0, 'clip': WIN, 'trigger': "true"},
  'tour-step': {'frames': 80, 'setup': ["if (window.O55.S.open) window.O55.ui.close('close'); window.O55.tour.start({fresh:true}); true"], 'wait': 3.0, 'clip': FULL, 'trigger': TOURSTEP},
  'tour-showme': {'frames': 110, 'setup': ["if (window.O55.S.open) window.O55.ui.close('close'); window.O55.tour.start({fresh:true}); true", "window.O55.tour.go(window.O55.tour.defs[3].id); true"], 'wait': 3.0, 'clip': FULL,
                  'trigger': "(() => { const b = document.querySelector('#pm-o55-tour [data-o55t=showMe]'); if (b) b.click(); return !!b; })()"},
}
scenes = opt('scenes', ','.join(SCENES)).split(',')
b = Browser(port=9481, width=1600, height=1000, extra=P.EXTRA, headless=False)
summary = []
try:
    for theme in THEMES:
        fam, mode = theme.split('-')
        p = b.new_page(1600, 1000)
        p.send('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-color-scheme', 'value': mode}]})
        p.goto('file:///' + page.replace('\\', '/') + '?o55=off'); time.sleep(2.5)
        p.eval("localStorage.clear(); window.PM_THEME.setFamily(%s, {persist:false}); window.PM_THEME.setMode(%s, {persist:false}); true" % (json.dumps(fam), json.dumps(mode)))
        if SOLID in ('0', '1') and p.eval("!!window.O55.solid"): p.eval("window.O55.solid.set(%s); true" % ('true' if SOLID == '1' else 'false'))
        time.sleep(1.2)
        p.send('Page.bringToFront'); p.send('Animation.enable')
        for name in scenes:
            sc = SCENES[name]
            d = os.path.join(out, theme, name); os.makedirs(d, exist_ok=True)
            try:
                p.eval("window.O55.tour && window.O55.tour.running && window.O55.tour.skip(); true"); time.sleep(0.8)
                for js in sc['setup']:
                    p.eval(js); time.sleep(1.0)
                time.sleep(sc['wait'])
                clip = p.eval(sc['clip'])
                p.send('Animation.setPlaybackRate', {'playbackRate': RATE})
                p.eval('window.O55.motion.setTimeScale(%s); true' % RATE)
                t0 = time.time(); frames = []
                p.eval(sc['trigger'])
                for i in range(sc['frames']):
                    target = t0 + i * STEP / 1000; w = target - time.time()
                    if w > 0: time.sleep(w)
                    before = time.time()
                    p.screenshot(os.path.join(d, 'f%03d.jpg' % i), clip=clip, quality=82)
                    frames.append({'i': i, 'motionMs': round((before - t0) * 1000 * RATE, 1)})
                p.send('Animation.setPlaybackRate', {'playbackRate': 1}); p.eval('window.O55.motion.setTimeScale(1); true')
                json.dump({'theme': theme, 'scene': name, 'rate': RATE, 'frames': frames}, open(os.path.join(d, 'frames.json'), 'w'))
                summary.append([theme, name, len(frames), frames[-1]['motionMs']])
                print(theme, name, len(frames), 'last', frames[-1]['motionMs'], flush=True)
            except Exception as e:
                p.send('Animation.setPlaybackRate', {'playbackRate': 1})
                print(theme, name, 'FAILED', str(e)[:200], flush=True)
        summary.append([theme, 'errors', p.errors[:5]])
        p.close()
finally:
    json.dump(summary, open(os.path.join(out, 'film.json'), 'w'), indent=1)
    b.close()
