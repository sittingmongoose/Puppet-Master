"""Resize-drag regression check: Home divider, Chat edge and Left Rail must track the pointer 1:1 without
long frames. python3 resize_perf.py <page.html> [--themes friendly-dark,...] [--port 9347]

Frame-by-frame method: an in-page sampler records, per requestAnimationFrame, the last pointer position and
the resized element's rendered edge, so lag is measured in pixels on the frames the compositor was offered.
The Left Rail assertion is the regression this file exists for: during a user widen-drag the narrow ladder
must not cap the slot back to its eased 240px (the width used to oscillate target <-> 240 mid-drag).

GPU: like perf.py this drives real Chrome over CDP, but resize cost is GPU-sensitive, so on the Linux VM it
keeps the GPU on (DISPLAY/XAUTHORITY + --enable-gpu, per the agent-browser guide) instead of perf.py's
--disable-gpu Linux default. Exits 1 when any assertion fails. Chrome profiles go to ~/pm-scratch."""
import json, os, sys, time
from cdp import Browser

args = sys.argv[1:]
page_file = os.path.abspath(args[0])
opt = lambda k, d=None: args[args.index('--' + k) + 1] if '--' + k in args else d
THEMES = opt('themes', 'friendly-dark').split(',')
PORT = int(opt('port', '9347'))
W, H = 1920, 1080

if os.name != 'nt':
    os.environ.setdefault('DISPLAY', ':0')
    xa = os.path.expanduser('~/.Xauthority')
    if os.path.exists(xa):
        os.environ.setdefault('XAUTHORITY', xa)
    EXTRA = ['--enable-gpu', '--ignore-gpu-blocklist', '--enable-gpu-rasterization']
else:
    EXTRA = ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--use-angle=vulkan', '--enable-features=Vulkan']

SAMPLER = r"""
(() => {
  if (window.__rz) return true;
  const R = window.__rz = { on: false, frames: [], marks: [], moves: [], lastX: 0, lastY: 0, el: null, kind: 'right', axis: 'x', raf: 0 };
  addEventListener('pointermove', (e) => { R.lastX = e.clientX; R.lastY = e.clientY; if (R.on) R.moves.push(performance.now()); }, { capture: true, passive: true });
  addEventListener('pointerdown', () => { if (R.on) R.marks.push(['down', performance.now()]); }, { capture: true, passive: true });
  addEventListener('pointerup', () => { if (R.on) R.marks.push(['up', performance.now()]); }, { capture: true, passive: true });
  function edge(r) {
    return R.kind === 'left' ? r.left : R.kind === 'cx' ? r.left + r.width / 2 : R.kind === 'cy' ? r.top + r.height / 2 : r.right;
  }
  const loop = (t) => { if (!R.on) return; const r = (R.el && R.el.isConnected) ? R.el.getBoundingClientRect() : null; R.frames.push([t, R.axis === 'y' ? R.lastY : R.lastX, r ? edge(r) : null, r ? r.width : null]); R.raf = requestAnimationFrame(loop); };
  R.start = (el, kind, axis) => { R.el = el; R.kind = kind; R.axis = axis || 'x'; R.frames = []; R.marks = []; R.moves = []; R.on = true; R.raf = requestAnimationFrame(loop); return true; };
  R.stop = () => { R.on = false; cancelAnimationFrame(R.raf); return { frames: R.frames, marks: R.marks, moves: R.moves }; };
  return true;
})()
"""

TARGET = r"""
(name) => {
  function vis(el) { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).display !== 'none'; }
  let h = null, el = null, kind = 'right', axis = 'x';
  if (name === 'left') { h = document.querySelector('#leftPanelResizer'); el = document.querySelector('#sidePanelSlot'); }
  else if (name === 'chat') { h = document.querySelector('#chatResizer'); el = document.querySelector('#chatPanel'); kind = 'left'; }
  else if (name === 'home') { h = [...document.querySelectorAll('.pmw-divider[data-dir="row"]')].find(vis); el = h; kind = 'cx'; }
  else { h = [...document.querySelectorAll('.pmw-divider[data-dir="col"]')].find(vis); el = h; kind = 'cy'; axis = 'y'; }
  if (!h || !vis(h) || !el) return null;
  window.__rz.start(el, kind, axis);
  const r = h.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
"""

SURFACES = [('left', 200, 0), ('chat', 150, 0), ('home', 200, 0), ('homecol', 0, 140)]


def sweep(p, x0, y0, dx, dy, leg_ms=1500):
    # Playwright-shaped mouse events. setInterceptDrags matters: without it Chrome starts a native HTML5
    # drag on the first pressed move (this page arms draggable tabs) and pointer capture is cancelled,
    # so the resizer sees one move and the gesture dies.
    def move(x, y, button='none', buttons=0):
        p.send('Input.dispatchMouseEvent', {'type': 'mouseMoved', 'button': button, 'buttons': buttons, 'x': x, 'y': y, 'modifiers': 0, 'force': 0.5 if buttons else 0})
    p.send('Input.setInterceptDrags', {'enabled': True})
    move(x0, y0); time.sleep(0.12)
    p.send('Input.dispatchMouseEvent', {'type': 'mousePressed', 'button': 'left', 'buttons': 1, 'x': x0, 'y': y0, 'modifiers': 0, 'clickCount': 1, 'force': 0.5})
    time.sleep(0.25)
    def leg(sx, sy, ex, ey):
        t0 = time.time()
        while True:
            k = min(1.0, (time.time() - t0) * 1000 / leg_ms)
            move(sx + (ex - sx) * k, sy + (ey - sy) * k, button='left', buttons=1)
            if k >= 1: break
            time.sleep(0.008)
    leg(x0, y0, x0 + dx, y0 + dy); time.sleep(0.25)
    leg(x0 + dx, y0 + dy, x0, y0); time.sleep(0.4)
    p.send('Input.dispatchMouseEvent', {'type': 'mouseReleased', 'button': 'left', 'buttons': 0, 'x': x0, 'y': y0, 'modifiers': 0, 'clickCount': 1})
    p.send('Input.setInterceptDrags', {'enabled': False})
    time.sleep(0.7)


def drag_oneway(p, x0, y0, dx, dy, leg_ms=1200):
    p.send('Input.setInterceptDrags', {'enabled': True})
    p.send('Input.dispatchMouseEvent', {'type': 'mouseMoved', 'button': 'none', 'buttons': 0, 'x': x0, 'y': y0, 'modifiers': 0, 'force': 0})
    time.sleep(0.12)
    p.send('Input.dispatchMouseEvent', {'type': 'mousePressed', 'button': 'left', 'buttons': 1, 'x': x0, 'y': y0, 'modifiers': 0, 'clickCount': 1, 'force': 0.5})
    time.sleep(0.25)
    t0 = time.time()
    while True:
        k = min(1.0, (time.time() - t0) * 1000 / leg_ms)
        p.send('Input.dispatchMouseEvent', {'type': 'mouseMoved', 'button': 'left', 'buttons': 1, 'x': x0 + dx * k, 'y': y0 + dy * k, 'modifiers': 0, 'force': 0.5})
        if k >= 1: break
        time.sleep(0.008)
    time.sleep(0.3)
    p.send('Input.dispatchMouseEvent', {'type': 'mouseReleased', 'button': 'left', 'buttons': 0, 'x': x0 + dx, 'y': y0 + dy, 'modifiers': 0, 'clickCount': 1})
    p.send('Input.setInterceptDrags', {'enabled': False})
    time.sleep(1.2)


def wide_both_check(b, url, fam, mode, failures):
    """User-sized columns win over the narrow ladder: rail widened by hand stays wide after release,
    chat can be widened past the old centre-960 wall at the same time, and a resizer double-click
    hands the rail back to the ladder."""
    p = b.new_page(W, H)
    p.goto(url); time.sleep(2.5)
    p.eval("localStorage.clear(); window.PM_THEME.setFamily(%s, {persist:false}); window.PM_THEME.setMode(%s, {persist:false}); true" % (json.dumps(fam), json.dumps(mode)))
    time.sleep(1.5)
    pt = lambda sel: p.eval("(()=>{const h=document.querySelector(%s);const r=h.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()" % json.dumps(sel))
    widths = lambda: p.eval("(()=>({rail:Math.round(document.querySelector('#sidePanelSlot').getBoundingClientRect().width),chat:Math.round(document.querySelector('#chatPanel').getBoundingClientRect().width)}))()")
    t = pt('#leftPanelResizer')
    drag_oneway(p, t['x'], t['y'], 200, 0)
    w = widths()
    print(f"wide-both after rail widen+release: {w}", flush=True)
    if w['rail'] < 400:
        failures.append(f"wide-both: user-widened rail did not stay wide after release ({w['rail']}px)")
    t = pt('#chatResizer')
    # -300, not -150: widening the rail first lets the ladder ease an unsized chat (600 -> ~466 at this
    # layout), so the proving gesture is one drag from wherever the ladder left it to the 760 cap.
    drag_oneway(p, t['x'], t['y'], -300, 0)
    w = widths()
    print(f"wide-both after chat widen+release: {w}", flush=True)
    if w['chat'] < 700:
        failures.append(f"wide-both: chat could not be widened past the old wall ({w['chat']}px)")
    if w['rail'] < 400:
        failures.append(f"wide-both: rail lost its user width when chat widened ({w['rail']}px)")
    t = pt('#leftPanelResizer')
    for count in (1, 2):
        p.send('Input.dispatchMouseEvent', {'type': 'mousePressed', 'button': 'left', 'buttons': 1, 'x': t['x'], 'y': t['y'], 'modifiers': 0, 'clickCount': count, 'force': 0.5})
        p.send('Input.dispatchMouseEvent', {'type': 'mouseReleased', 'button': 'left', 'buttons': 0, 'x': t['x'], 'y': t['y'], 'modifiers': 0, 'clickCount': count})
        time.sleep(0.12)
    time.sleep(1.2)
    w = widths()
    print(f"wide-both after rail double-click reset: {w}", flush=True)
    if w['rail'] >= 380:
        failures.append(f"wide-both: double-click did not hand the rail back to the ladder ({w['rail']}px)")
    p.close()


def q(vals, p):
    s = sorted(vals)
    return s[min(len(s) - 1, int(p * len(s)))] if s else 0.0


def idle_gap95(b, url, fam, mode):
    """The sampler-on floor: this page animates continuously (chat work rings, shimmer) and the sampler
    itself forces a frame per vsync, so even an untouched page shows a frame-gap p95 well above 16.7ms
    in this harness. Drag thresholds are judged against this measured floor, not against 60fps theory."""
    p = b.new_page(W, H)
    p.goto(url); time.sleep(2.5)
    p.eval("localStorage.clear(); window.PM_THEME.setFamily(%s, {persist:false}); window.PM_THEME.setMode(%s, {persist:false}); true" % (json.dumps(fam), json.dumps(mode)))
    time.sleep(1.5)
    p.eval(SAMPLER)
    p.eval("window.__rz.start(document.querySelector('#sidePanelSlot'), 'right', 'x')")
    time.sleep(2.5)
    raw = p.eval('window.__rz.stop()')
    p.close()
    frames = [f for f in raw['frames'] if f[2] is not None]
    gaps = [b_[0] - a[0] for a, b_ in zip(frames, frames[1:])]
    return q(gaps, 0.95)


def main():
    b = Browser(port=PORT, width=W, height=H, extra=EXTRA, headless=True)
    failures = []
    try:
        url = 'file:///' + page_file.replace('\\', '/') + '?o55=off'
        fam0, mode0 = THEMES[0].split('-')
        floor = idle_gap95(b, url, fam0, mode0)
        # p95 gaps land on the vsync grid (16.7ms steps); both the 2.5s floor sample and a single
        # drag's p95 (over ~70 frames) carry a step of noise each, so the budget allows two grid
        # steps above twice the floor. The pre-fix build read 133-283ms here, far above either form.
        gap_budget = max(50.0, floor * 2 + 34)
        print(f"idle floor gapP95 {floor:.1f}ms -> drag budget {gap_budget:.0f}ms", flush=True)
        for theme in THEMES:
            fam, mode = theme.split('-')
            for surf, dx, dy in SURFACES:
                p = b.new_page(W, H)
                p.goto(url); time.sleep(2.5)
                p.eval("localStorage.clear(); window.PM_THEME.setFamily(%s, {persist:false}); window.PM_THEME.setMode(%s, {persist:false}); true" % (json.dumps(fam), json.dumps(mode)))
                time.sleep(1.5)
                p.eval(SAMPLER)
                tgt = p.eval("(%s)(%s)" % (TARGET, json.dumps(surf)))
                if not tgt:
                    failures.append(f"{theme} {surf}: handle not visible"); p.close(); continue
                sweep(p, tgt['x'], tgt['y'], dx, dy)
                raw = p.eval('window.__rz.stop()')
                p.close()
                frames = [f for f in raw['frames'] if f[2] is not None]
                down = next((m[1] for m in raw['marks'] if m[0] == 'down'), 0)
                up = next((m[1] for m in raw['marks'] if m[0] == 'up'), float('inf'))
                drag = [f for f in frames if down <= f[0] <= up]
                gaps = [b_[0] - a[0] for a, b_ in zip(frames, frames[1:])]
                span = (frames[-1][0] - frames[0][0]) / 1000 if len(frames) > 1 else 0
                fps = (len(frames) - 1) / span if span else 0
                gap95 = q(gaps, 0.95)
                lags = []
                if len(drag) > 5:
                    off = drag[0][2] - drag[0][1]
                    lags = [abs((f[2] - f[1]) - off) for f, pf in zip(drag[1:], drag) if abs(f[1] - pf[1]) > 0.3]
                lag95 = q(lags, 0.95)
                edges = [f[2] for f in drag]
                rng = (max(edges) - min(edges)) if edges else 0
                # Input density: below ~0.15 moves/frame the gesture itself was starved and the run
                # measures the injector, not the page. Boundary gaps: the worst single gap around
                # pickup and release (reported; the p95 budget above can hide one long boundary frame).
                drag_moves = len([m for m in raw.get('moves', []) if down <= m <= up])
                mpf = drag_moves / len(drag) if drag else 0
                def max_gap(lo, hi):
                    gg = [b_[0] - a[0] for a, b_ in zip(frames, frames[1:]) if lo <= a[0] <= hi]
                    return max(gg) if gg else 0
                pickup_gap = max_gap(down - 50, down + 350)
                release_gap = max_gap(up - 50, up + 500)
                # Settle: after release the edge must be at its final position and stay there. A
                # transition chasing the pointer (the Glass rail defect) keeps it moving for ~360ms.
                after = [f for f in frames if f[0] > up]
                settle_ms = None
                if after:
                    final_edge = after[-1][2]
                    for f in after:
                        if abs(f[2] - final_edge) <= 0.5:
                            settle_ms = f[0] - up
                            break
                    if settle_ms is None:
                        settle_ms = after[-1][0] - up
                print(f"{theme:15s} {surf:8s} fps {fps:5.1f} gapP95 {gap95:6.1f}ms lagP95 {lag95:6.1f}px range {rng:5.0f}px moves/f {mpf:.2f} pickupGap {pickup_gap:5.0f}ms releaseGap {release_gap:5.0f}ms settle {settle_ms if settle_ms is None else round(settle_ms)}ms", flush=True)
                if drag and mpf < 0.15:
                    failures.append(f"{theme} {surf}: input starved ({mpf:.2f} moves/frame) — measurement invalid, rerun")
                if settle_ms is not None and settle_ms > 450:
                    failures.append(f"{theme} {surf}: edge still settling {settle_ms:.0f}ms after release (> 450ms)")
                if rng < 50:
                    failures.append(f"{theme} {surf}: drag barely moved the edge ({rng:.0f}px)")
                if surf == 'left':
                    # Oscillation = width back at the 240 cap while the pointer is still dragged out.
                    # The return leg legitimately ends at 240, so only frames with the pointer >80px
                    # past the grab point count.
                    start_px = drag[0][1] if drag else 0
                    fell_back = any(f[3] <= 245 for f in drag if f[1] - start_px > 80)
                    if fell_back:
                        failures.append(f"{theme} left: rail width fell back to the eased cap mid-drag (ladder fought the drag)")
                    if lag95 > 24:
                        failures.append(f"{theme} left: pointer-to-edge lag p95 {lag95:.0f}px > 24px")
                else:
                    if lag95 > 2:
                        failures.append(f"{theme} {surf}: pointer-to-edge lag p95 {lag95:.1f}px > 2px (1:1 canon)")
                if gap95 > gap_budget:
                    failures.append(f"{theme} {surf}: frame gap p95 {gap95:.0f}ms > budget {gap_budget:.0f}ms (2x idle floor)")
        wide_both_check(b, url, fam0, mode0, failures)
    finally:
        b.close()
    if failures:
        print('FAIL')
        for f in failures: print(' -', f)
        return 1
    print('PASS')
    return 0


if __name__ == '__main__':
    sys.exit(main())
