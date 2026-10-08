/* O55.nierFx — NieR Mode's shared effects for the onboarding window and the Guided Tour (styles: src/css/05-nier-fx.css,
   words: src/copy.d/10-nier-fx.json; a bench that plays every effect: tools/nier_fx_bench.js, loaded by tests only).
   The window's skin, the look screen and the tour call these; nothing here runs by itself.

   Words (rule 4: words arrive readable)
     type(el, { text?, perLetter = 18, cap = 500, caret = true, delay?, sound?, part? }) -> Promise<bool>
         the words type on, left to right, behind a block caret, about 18 ms a letter and never longer than cap. The
         whole string is laid out from the first frame (the untyped letters are drawn transparent), so nothing
         reflows, and the real words stay in the text (and in aria-label) throughout. [part, default decode]
     decode(el, { text?, ms?, sound? }) -> Promise<bool>
         a label of 8 characters or fewer resolves from scrambled glyphs left to right inside a held, clipped box;
         anything longer types on (type)                                                                   [decode]
   Surfaces (they open from a line and close to a line, rule 2)
     slice(el, { ms?, from? })        el opens from its middle line, or from `from` (a line element or a rect), whose
                                      line it then takes away                                            [slice]
     wipe(el, { ms?, dir? })          a ruled band covers el and steps off to the right (dir 'back': the left) [wipe]
     fold(el, { ms = 260 }) -> Promise<line|null>   el collapses to a 2 px ink line at its centre in 4 steps; the
                                      line is a page-level .o55fx-line that outlives el (el stays folded until it is
                                      sliced open again, unfold(el), or its surface is hidden)            [slice]
     unfold(el)                       a folded el shows again at once
     lineTo(line, rect|el, { ms = 280, edge = 'top' }) -> Promise   the line steps (5) to the rect's top edge (or
                                      'middle', 'bottom') and takes its width
     lineHold(line) -> bool           the line blinks where it is until it is moved or used
     lineDrop(line)                   the line goes
     trail(x, y, { ms?, layer? }) -> Promise   a 3 px ink square left behind by a held hop, gone in 2 steps   [pod]
     hops(el, to, { n = 9, ms = 540, arc?, trail = true }) -> Promise   el travels in n held hops (its translate
                                      property), each leaving a trail square: the Pod's flights                 [pod]
   Moments
     bootlog(host, [{ text, stamp? }], { kicker?, lineMs = 210, meterCells = 16, sound = true, at?, delay?, part? })
         -> { el, stamps: Promise[], done: Promise, hold(text, { at? }) -> { cancel }, close({ to?, edge? }) ->
            Promise, snap(), cancel() }
         a boot log over host (or at `at`): a kicker, then each line is revealed by a paper block stepping across it
         (8 steps) with a dot leader and a right-aligned stamp that blinks in, and a meter fills underneath. Every
         animation is created at the call (Web Animations with delays), so it runs on through a long frame. stamps[i]
         resolves on the frame line i's stamp shows (with sound, a 'move' tick plays there). hold() shows a line with a
         blinking caret (in the slot kept free for it). close() folds the log onto its underline in 3 steps, then
         slides that line in 4 steps onto `to` (the eyebrow rule).                                          [boot]
     banner({ kicker?, title, sub?, ms?, at?, within?, inset?, hang?, onLand?, layer?, sound?, announce? }) -> Promise
         a quest band; its title types on. hang: two hairline strings grow down from within's top edge (the viewport
         top for the tour root) in 3 steps, the card is lowered onto them in 6, lands with a 2-step settle (onLand()
         runs on that frame), hangs, and is hauled up in 5 as its strings retract. inset narrows the card inside
         within (a fraction of its width each side); at places its centre (a fraction of within's height). Inside the
         onboarding window with no within it spans the window, never the page; it never covers the tour's callout or
         bar or the screen's heading block.                                                                [quests]
     band(text, ms?, { kicker?, within?, layer?, sound? }) -> Promise   a reboot band: a status line types on, ticks
         fill, OK lands, and it folds away to a line (also band(text, { ms, ... }))                       [reboot]
   Followers
     brackets(el, on) -> element      four ink corners locked on el (call again to re-place)             [brackets]
     cursor(el, on) -> element        the menu cursor: el becomes an ink bar, a square steps beside it      [cursor]
     glitch(el) / alert(el)           a short tear / the tear, a scan line [sweep] and ink shards [particles] [glitch]
   Pod 042
     pod.say(text, { lead?, anchor?, side?, stage?, lane?, avoid?, ms?, sound?, layer?, announce? }) -> Promise
         Pod 042 and its speech strip; its words type on. With stage (the window's art panel) the strip takes the
         first of two lanes, just below the control bar's line ('bar') or low over the stage lip ('lip'; lane: 'lip'
         tries it first), that crosses no actor, hung sign or card, or the stage kicker (rule 8).        [pod / voice]
     pod.lanes(stage, { w?, h?, lane?, avoid? }) -> { stage, lanes, obstacles, props, pick: { lane, x, y, clear } }
         that choice, for the window and tests (on a short stage, the 760 px band, the strip is compact: one or two
         lines without the name band, and the bar's lane is the band's top edge when the bar is cropped above it)
     pod.chirp() -> bool   pod.hush(now?)   the Pod's signal and sound; send the Pod away (now: in this frame)
   Shared
     has(key) -> bool      a NieR part is painted (the onboarding preview's parts first)
     enabled(name) -> bool would the effect `name` draw (NieR painted and its part installed)
     podSvg(cls, { part?, fill?, ink? }) -> string   the one Pod 042 drawing (part 'body' or 'shadow'); its fill and ink
                           paths carry `${cls}-fill` / `${cls}-ink` (or the classes given)
     snap(host?)           running words, logs, slices and lines jump to their end state (a key or press)
     clear(host?)          stop every effect (in host, or everywhere) and send every follower and Pod away now
     version

   Sounds (O55.sound, so the window's mute governs them; each pairs with the visual that plays it): banner plays
   'quest', band 'reboot', pod.say and pod.chirp 'pod', bootlog a 'move' at each stamp (opts.sound: false silences
   one, a string picks another event); type plays 'type' ticks (every 120 ms) and a short decode 'decode' only when
   asked (opts.sound: true). The other effects are silent: their callers own the sound.
   Pod 042 is one character: while pod.say speaks, the app's corner Pod (#o55np-pod) and the window's resting Pod
   (.o55nw-pod) step away, marked on themselves (#o55np-pod[data-o55fx-away], #pm-o55-onboarding[data-o55fx-pod]),
   never on <html>, so a Pod line restyles only those, and this one flies out from that place and back.

   Where banners, bands and Pods are drawn, and the hand-over. opts.layer: 'page' (or within: document.body) draws in
   the page layer, above the window and the tour; within: el draws in el's surface across el's box; with neither, the
   open window (across the window's own box), else the running tour, else the page. A surface that is going (the
   window's close() adds o55-closing, the tour's end adds o55t-closing) is never chosen. When the surface of a running
   banner or band starts to go, the banner or band moves into the page layer, keeps its place and finishes there; a
   Pod in that surface leaves at once and resolves false.

   Screen readers: type and decode keep the real words in the text and lend them as aria-label to the element that is
   named by them (a heading such as the window's #o55-h, which labels its dialog; a button; an option; anything named
   through aria-labelledby), and let go after. Effects overlays sit in aria-hidden layers. opts.announce on banner and
   pod.say reads their words through the window's live region.

   Rules every effect keeps:
   - It is a no-op (a resolved promise, false) unless NieR Mode is painted (html[data-o55-nier="on"], live or the
     onboarding preview) and its part is installed. The painted html[data-o55-nier-parts] is the only source while it
     is there; only while it is absent is PM_NIER.previewing(), then PM_NIER.has, asked. type/decode with text still
     write the words: that is their end state.
   - Reduced Motion gives the end state at once: the words, the brackets, the ink bar and the Pod's words without
     motion; slice, wipe, fold, glitch, alert, band, bootlog and trail draw nothing; a banner stands still for its time
     (a hung card stands in place and onLand runs at once). A low-resource computer (O55.motion.lowResource) gets the
     same end states for the main-thread effects (slice's clip, the scan line, the shards) and a Pod that does not
     hover; the wipe and the fold are compositor transforms and play in both directions.
   - No flashes (rule 3): nothing larger than 340x256 reverses its opacity more than once a second. Large surfaces
     leave one way (a fold to a line, slats, a 2-step fade); only small things blink (carets, stamps, ticks, the Pod).
     Multi-step flickers put their step easing on each keyframe, never on the whole iteration.
   - No layout moves: overlays are absolutely placed and never take a click; the element itself is only clipped
     (clip-path), scaled or nudged by the separate `scale` / `translate` properties, or painted (the cursor's ink bar).
     Its own `transform` is never touched, so callers may position with it (the tour callout does).
   - Reads come before writes: geometry is read in one batch (a follower's in an animation frame, so it costs no extra
     style pass), and the Pod measures itself once. The NieR choreography marks itself as an expected heavy moment
     (O55.motion.quiet), so it never switches the window to low-resource mode.
   - Motion is transform and opacity, stepped (steps()), as Web Animations; the only loops (Pod hover, cursor nudge,
     carets, a held line) are on transform/opacity and stop under Reduced Motion. Timers run on the motion clock
     (O55.motion.after: slowed for filming, held at time-scale 0). Ink and parchment only: every colour is a NieR token.
   - It cleans up after itself: nodes go when their motion ends; followers (brackets, cursor, Pod) leave when their
     element leaves, its screen goes, its surface closes, NieR Mode goes off or their part is removed; the shared poll
     and listeners exist only while something follows. */
(function () {
  'use strict';
  const O55 = window.O55, U = O55.util, M = O55.motion;
  const html = document.documentElement;
  const FX = O55.nierFx = { version: '2.0.0' };
  const T = (k, v) => O55.t('nierFx.' + k, v);
  const esc = U.esc;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const no = () => Promise.resolve(false);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const raf = (fn) => ((M.real && M.real.raf) || window.requestAnimationFrame)(fn);
  const quiet = (ms) => { try { if (M.quiet) M.quiet(ms); } catch (_) { /* no long-task watch */ } };

  /* ------------------------------------------------------------------ gates */
  /* the part each effect needs (alert's scan and shards also ask for sweep and particles, as in the 5.6 Pro chat) */
  const PART = { decode: 'decode', type: 'decode', slice: 'slice', fold: 'slice', line: 'slice', wipe: 'wipe', glitch: 'glitch', alert: 'glitch',
    brackets: 'brackets', cursor: 'cursor', banner: 'quests', hang: 'quests', band: 'reboot', bootlog: 'boot', pod: 'pod', voice: 'voice',
    trail: 'pod', scan: 'sweep', shards: 'particles' };
  const painted = () => html.getAttribute('data-o55-nier') === 'on';
  /* The painted attributes are the truth: they are what the CSS reads, and the onboarding preview paints them while
     the stored parts stay as they were (a part removed in the preview, or a Quiet / Still / Colors only preset chosen
     there, must not fire). So while html carries data-o55-nier-parts it is the only source. Only while it is absent
     (a transition repainting) is the preview asked, then PM_NIER.has. */
  function partsNow() {
    const a = html.getAttribute('data-o55-nier-parts');
    if (a != null) return a;
    const N = window.PM_NIER;
    try {
      const pv = N && typeof N.previewing === 'function' ? N.previewing() : null;
      if (pv && Array.isArray(pv.parts)) return pv.parts.join(' ');
    } catch (_) { /* no preview: ask has() below */ }
    return null;
  }
  function has(key) {
    if (!painted()) return false;
    const a = partsNow();
    if (a != null) return (' ' + a + ' ').indexOf(' ' + key + ' ') >= 0;
    const N = window.PM_NIER;
    try { return !!(N && typeof N.has === 'function' && N.has(key)); } catch (_) { return false; }
  }
  FX.has = (key) => has(String(key || ''));
  const still = () => { try { return !!M.reduced(); } catch (_) { return false; } };
  /* a software-rendered or struggling computer (O55.motion.lowResource, html[data-o55-lowres]): the effects the main
     thread has to draw every frame (slice's clip, the scan line, the shards) go straight to their end state, as under
     Reduced Motion; the wipe and the fold are compositor transforms and still play */
  const heavy = () => still() || !!M.lowResource;
  /* enabled('slice') -> would slice() draw (NieR painted and its part installed)? Reduced Motion is not counted. */
  FX.enabled = (name) => has(PART[name] || name) || (name === 'pod' && has('voice'));
  /* a caller's part: undefined -> the effect's own, null -> already gated by the caller (NieR painted is enough) */
  const gate = (part, own) => (part === null ? painted() : has(part === undefined ? own : part));

  const play = (ev) => { try { return !!(ev && O55.sound && O55.sound.play && O55.sound.play(ev)); } catch (_) { return false; } };
  const zoom = () => { const z = document.body && Number.parseFloat(document.body.style.zoom); return Number.isFinite(z) && z > 0 ? z : 1; };
  const ended = (a) => (a && a.finished ? a.finished.then(() => true, () => false) : Promise.resolve(false));
  function rectOf(el) {
    if (!el || !el.isConnected || typeof el.getBoundingClientRect !== 'function') return null;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.right < 0 || r.top > innerHeight || r.left > innerWidth) return null;
    return r;
  }
  /* an element's rect, or a rect-like { left|x, top|y, width, height } */
  function toRect(a) {
    if (!a) return null;
    if (a.nodeType === 1) return rectOf(a);
    const left = a.left != null ? a.left : a.x, top = a.top != null ? a.top : a.y;
    if (!Number.isFinite(left) || !Number.isFinite(top)) return null;
    const w = a.width || 0, h = a.height || 0;
    return { left, top, width: w, height: h, right: left + w, bottom: top + h };
  }

  /* ------------------------------------------------------------------ hosts and layers */
  const ROOTS = '#pm-o55-onboarding, #pm-o55-tour';
  /* a surface that is going: hidden, gone, or playing its way out (the window's close() adds o55-closing at once and
     hides the root up to 0.7 s later; the tour's end adds o55t-closing and hides its root 360 ms later) */
  function closing(host) {
    if (!host || host === document.body) return false;
    if (!host.isConnected || host.hidden || host.classList.contains('o55-closing') || host.classList.contains('o55t-closing')) return true;
    if (host.id === 'pm-o55-onboarding') return !html.hasAttribute('data-o55-open');
    if (host.id === 'pm-o55-tour') return !html.hasAttribute('data-o55-tour');
    return false;
  }
  function openRoot() {
    const onb = document.getElementById('pm-o55-onboarding');
    if (onb && !closing(onb)) return onb;
    const tour = document.getElementById('pm-o55-tour');
    if (tour && !closing(tour)) return tour;
    return null;
  }
  /* the surface that owns el: its onboarding window or tour root, else the open one (a tour target lives in the app,
     and its effects belong over the tour's scrim), else the page */
  function hostOf(el) {
    const r = el && el.closest ? el.closest(ROOTS) : null;
    return r || openRoot() || document.body;
  }
  /* where a banner, band or Pod without an element of its own is drawn: { layer: 'page' } or within: document.body
     is the page layer; within: el is el's surface; else the open window, else the running tour, else the page.
     A surface that is already going is never chosen: the page layer takes it. */
  const PAGE = (o) => !!o && (o.layer === 'page' || o.within === document.body || o.within === html);
  function flyHost(o, el) {
    if (PAGE(o)) return document.body;
    const h = el && el.nodeType === 1 ? hostOf(el) : hostOf(null);
    return closing(h) ? document.body : h;
  }
  /* A banner, band or Pod watches its surface: when the surface starts to go, onGo() runs once (banners and bands
     move into the page layer and finish there; a Pod leaves). One observer serves them all, only while one lives. */
  const flyers = new Set();
  let flyMo = null;
  function flyCheck() { Array.from(flyers).forEach((f) => { if (closing(f.host)) { flyers.delete(f); try { f.onGo(); } catch (_) {} } }); flyIdle(); }
  function flyIdle() { if (!flyers.size && flyMo) { flyMo.disconnect(); flyMo = null; } }
  function flyWatch(host, onGo) {
    if (host === document.body) return () => {};
    const f = { host, onGo };
    flyers.add(f);
    if (!flyMo) { flyMo = new MutationObserver(flyCheck); flyMo.observe(html, { attributes: true, attributeFilter: ['data-o55-open', 'data-o55-tour'] }); }
    flyMo.observe(host, { attributes: true, attributeFilter: ['class', 'hidden'] });
    return () => { flyers.delete(f); flyIdle(); };
  }
  /* move a flying node into the page layer, where it keeps its place (every root and the page layer cover the
     viewport) and its running animations */
  function toPage(node) {
    const from = node.parentElement, L = layerOf(document.body);
    if (from === L) return;
    L.appendChild(node);
    prune(from);
  }
  function layerOf(host) {
    for (const c of host.children) if (c.classList.contains('o55fx-layer')) return c;
    const L = document.createElement('div');
    L.className = 'o55fx-layer' + (host === document.body ? ' o55fx-page' : '');
    L.setAttribute('aria-hidden', 'true');
    host.appendChild(L);
    return L;
  }
  function prune(L) { if (L && L.isConnected && !L.firstElementChild) L.remove(); }
  function drop(node) { if (!node) return; const L = node.parentElement; node.remove(); prune(L); }
  /* a one-shot box over a rect, in the layer's coordinates */
  function box(L, r, cls, inner) {
    const b = document.createElement('div'), z = zoom();
    b.className = cls;
    b.style.cssText = `left:${Math.round(r.left / z)}px;top:${Math.round(r.top / z)}px;width:${Math.round(r.width / z)}px;height:${Math.round(r.height / z)}px`;
    if (inner) b.innerHTML = inner;
    L.appendChild(b);
    return b;
  }
  /* the colour el is drawn on (the first opaque background above it), so a wipe, a cut or a log's paper block matches
     the surface; kept per element while the look stays the same (the climb reads computed styles) */
  const grounds = new WeakMap();
  const lookKey = () => (html.getAttribute('data-theme') || '') + '|' + (html.getAttribute('data-o55-nier') || '') + '|' + (html.getAttribute('data-o55-nier-mode') || '');
  function groundOf(el) {
    if (!el || el.nodeType !== 1) return '';
    const key = lookKey(), hit = grounds.get(el);
    if (hit && hit.key === key) return hit.c;
    let c = '';
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const v = getComputedStyle(e).backgroundColor;
      if (v && v !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(v)) { c = v; break; }
    }
    grounds.set(el, { key, c });
    return c;
  }

  /* ------------------------------------------------------------------ the read phase */
  /* Geometry is read where the frame has just computed it: in a ResizeObserver callback, which the browser runs after
     the frame's own style and layout and before its paint. measure(fn) queues fn there (a hidden 1 px probe under
     <html> is observed again, so the next frame's observer step calls back): a read there costs no style pass of its
     own, whatever another script left dirty is never paid inside an effect, and what fn writes is drawn in that same
     frame. Called during an animation-frame callback (the window's skin places its Pod and draws a screen there) fn
     runs later in that frame; from a timer, in the next one. Nothing is re-observed inside an observer callback (a
     queue made there is armed in the next animation frame), so the browser's resize loop never skips a notification. */
  const reads = [];
  let probe = null, probeObs = null, probeArmed = false, probeT = null, inRead = false;
  const report = (e) => { try { (window.reportError || console.error)(e); } catch (_) { /* nowhere to report */ } };
  function flush() {
    if (!probeArmed) return;
    probeArmed = false;
    probeObs.unobserve(probe);
    if (probeT != null) { M.real.clearTimeout(probeT); probeT = null; }
    const list = reads.splice(0);
    inRead = true;
    for (const fn of list) { try { fn(); } catch (e) { report(e); } }
    inRead = false;
    portRects.clear();
    if (reads.length) raf(arm); else probe.remove();
  }
  function arm() {
    if (probeArmed || !reads.length) return;
    probeArmed = true;
    if (!probe) {
      probe = document.createElement('i');
      probe.setAttribute('aria-hidden', 'true');
      probe.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;visibility:hidden;pointer-events:none;contain:strict';
      probeObs = new ResizeObserver(flush);
    }
    if (!probe.isConnected) html.appendChild(probe);
    probeObs.observe(probe);
    /* a frame that never comes (a hidden page): read anyway */
    probeT = M.real.setTimeout(() => { probeT = null; flush(); }, 500);
  }
  function measure(fn) {
    reads.push(fn);
    if (typeof ResizeObserver !== 'function') { if (reads.length === 1) raf(() => reads.splice(0).forEach((f) => { try { f(); } catch (e) { report(e); } })); return; }
    if (inRead || inObserver) raf(arm); else arm();
  }
  /* the scroll boxes' rects, read once per read phase (the followers of one pane share one) */
  const portRects = new Map();
  function portRect(p) { let r = portRects.get(p); if (!r) { r = p.getBoundingClientRect(); if (inRead) portRects.set(p, r); } return r; }

  /* running one-shot effects, so clear() can stop them and snap() can finish them */
  const running = new Set();
  function run(host, stop, snap) { const e = { host, stop, snap }; running.add(e); return e; }
  const finish = (e) => running.delete(e);

  /* ------------------------------------------------------------------ followers: brackets, cursor, Pod */
  /* A follower keeps an overlay on its element: placed from the element's rect in an animation frame (so the read
     costs no extra style pass: the frame computes style once anyway), again on the shared poll (every 250 ms on the
     motion clock, writing only when the rect moved), on resize, and 140 ms after a scroll (it steps aside while the
     page scrolls). It hides while its element is outside its scroll box or hidden, and leaves for good when the
     element or its screen goes or the surface closes. */
  const followers = new Set();
  let pollT = null, pollRaf = false, scrollT = null, wired = false;
  function scrollBox(el, host) {
    for (let p = el.parentElement; p && p !== host && p !== document.body; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (/(auto|scroll|hidden|clip)/.test(cs.overflowX + ' ' + cs.overflowY)) return p;
    }
    return null;
  }
  /* o.now: place at once (the Pod, which speaks this frame); else in the next animation frame, hidden until then */
  function follow(el, node, host, put, leave, o) {
    const f = { el, node, host, port: undefined, last: '', gone: null, force: false };
    const gone = (g) => { if (f.gone === g) return; f.gone = g; node.toggleAttribute('data-gone', g); };
    f.place = () => {
      if (!el.isConnected || !node.isConnected || closing(host) || el.closest('.o55-out, [hidden]')) { f.off(); return; }
      /* inside a folded surface (the window folding to its line) it stays aside until the surface opens again */
      for (const fe of folds.keys()) if (fe.contains(el)) { gone(true); return; }
      if (f.port === undefined) f.port = scrollBox(el, host);
      const r = rectOf(el);
      const p = f.port && f.port.isConnected ? f.port.getBoundingClientRect() : null;
      const inside = r && (!p || (r.top >= p.top - 2 && r.bottom <= p.bottom + 2 && r.left >= p.left - 2 && r.right <= p.right + 2));
      if (!inside) { gone(true); return; }
      const key = `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)},${Math.round(r.height)}`;
      /* back from hidden (or new): the overlay arrives again (brackets lock on again) */
      const again = f.gone !== false;
      if (key !== f.last || f.force || again) { f.last = key; f.force = false; put(r, again); }
      gone(false);
    };
    f.hide = () => gone(true);
    f.off = () => { if (!followers.has(f)) return; followers.delete(f); unwire(); try { leave(); } catch (_) {} };
    followers.add(f); wire();
    if (o && o.now) f.place();
    else { gone(true); f.gone = null; raf(() => { if (followers.has(f)) f.place(); }); }
    return f;
  }
  function poll() {
    pollT = null;
    if (!followers.size) return;
    if (!pollRaf) {
      pollRaf = true;
      raf(() => { pollRaf = false; if (!document.hidden) followers.forEach((f) => f.place()); if (followers.size && !pollT) pollT = M.after(250, poll); });
    }
  }
  function onScroll() {
    followers.forEach((f) => f.hide());
    if (scrollT) scrollT.cancel();
    scrollT = M.after(140, () => { scrollT = null; raf(() => followers.forEach((f) => f.place())); });
  }
  function onResize() { followers.forEach((f) => f.place()); }
  function wire() {
    if (!wired) { wired = true; window.addEventListener('scroll', onScroll, { capture: true, passive: true }); window.addEventListener('resize', onResize, { passive: true }); }
    if (!pollT) pollT = M.after(250, poll);
  }
  function unwire() {
    if (followers.size) return;
    if (wired) { wired = false; window.removeEventListener('scroll', onScroll, { capture: true }); window.removeEventListener('resize', onResize); }
    if (pollT) { pollT.cancel(); pollT = null; }
    if (scrollT) { scrollT.cancel(); scrollT = null; }
  }
  const z1 = (v) => Math.round(v / zoom());

  /* ================================================================== words: type and decode */
  /* the first text node with words, skipping icons (svg, aria-hidden, .o55-ico) */
  function textNodeOf(el) {
    if (!el) return null;
    if (el.nodeType === 3) return el.nodeValue.trim() ? el : null;
    if (el.nodeType !== 1) return null;
    const skip = (n) => {
      for (let p = n.parentElement; p && p !== el; p = p.parentElement) {
        if (p.namespaceURI === SVG_NS || p.getAttribute('aria-hidden') === 'true' || p.classList.contains('o55-ico')) return true;
      }
      return !!(n.parentElement && n.parentElement.namespaceURI === SVG_NS);
    };
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) if (n.nodeValue.trim() && !skip(n)) return n;
    return null;
  }
  /* The real words are always in the text (type keeps them whole; decode scrambles a label of eight characters at
     most), and whatever takes its accessible name from them (the heading the window's dialog is labelled by, a button,
     an option) holds them as aria-label meanwhile, then lets go. The carrier is the nearest element, from the text's
     parent up, that takes its name from its content (h1-h6, button, a[href], summary, or a role such as heading,
     button, option, tab, treeitem) or is named by aria-labelledby or aria-describedby; the climb stops at a container
     its author names (dialog, group, list ...) and at the surface. An element that already has an aria-label is left
     as it is; text under aria-hidden needs nothing. */
  const NAME_ROLE = /^(heading|button|link|option|menuitem|menuitemcheckbox|menuitemradio|tab|radio|checkbox|switch|treeitem|cell|gridcell|columnheader|rowheader|tooltip)$/;
  const NAME_TAG = /^(H[1-6]|BUTTON|SUMMARY)$/;
  const named = new WeakMap(); /* carrier -> { n, value } */
  function referenced(e) {
    if (!e.id) return false;
    const id = e.id.replace(/["\\]/g, '\\$&');
    try { return !!document.querySelector(`[aria-labelledby~="${id}"], [aria-describedby~="${id}"]`); } catch (_) { return false; }
  }
  function carrierOf(node) {
    const p = node.parentElement;
    if (!p || p.closest('[aria-hidden="true"]')) return null;
    for (let e = p; e && e !== document.body && e !== html && !e.matches(ROOTS); e = e.parentElement) {
      const role = (e.getAttribute('role') || '').trim().split(/\s+/)[0];
      if (role ? NAME_ROLE.test(role) : (NAME_TAG.test(e.tagName) || (e.tagName === 'A' && e.hasAttribute('href')))) return e;
      if (referenced(e)) return e;
      if (role && role !== 'none' && role !== 'presentation' && role !== 'generic') return null;
    }
    return null;
  }
  /* the words a carrier reads (its visible text, icons and aria-hidden parts left out) */
  function wordsOf(c) {
    let s = '';
    const w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      let skip = false;
      for (let q = n.parentElement; q && q !== c.parentElement; q = q.parentElement) {
        if (q.namespaceURI === SVG_NS || q.getAttribute('aria-hidden') === 'true' || q.hidden) { skip = true; break; }
      }
      if (!skip) s += n.nodeValue;
    }
    return s.replace(/\s+/g, ' ').trim();
  }
  function nameHold(node) {
    const c = carrierOf(node); if (!c) return null;
    const rec = named.get(c);
    if (rec) { rec.n++; return c; }
    if (c.hasAttribute('aria-label')) return null;
    const value = wordsOf(c); if (!value) return null;
    c.setAttribute('aria-label', value);
    named.set(c, { n: 1, value });
    return c;
  }
  function nameFree(c) {
    const rec = c && named.get(c); if (!rec) return;
    if (--rec.n > 0) return;
    named.delete(c);
    if (c.getAttribute('aria-label') === rec.value) c.removeAttribute('aria-label');
  }

  /* ---- type: the text node is swapped for <span.o55fx-ty><span.o55fx-ty-on>typed</span><span.o55fx-ty-off>rest</span>
     </span>. Both halves are laid out as one paragraph (the same words, so the same line breaks from the first frame),
     the rest is drawn transparent, and the caret is the rest's first 0.62 em painted in the text's own colour (a
     background on the inline, so it takes no room and follows the words across lines). At the end the original text
     node comes back with the whole words. Slint: a Text whose string is a Timer's substring. */
  const typing = new Map(); /* wrapper span -> job */
  function typeJobIn(el) {
    if (!el) return null;
    for (const [w, j] of typing) if (el === w || (el.nodeType === 1 && el.contains(w)) || (el.nodeType === 3 && j.node === el)) return j;
    return null;
  }
  FX.type = function type(el, o) {
    o = o || {};
    const prev = typeJobIn(el); if (prev) prev.stop(true);
    const dec = el && decoding.get(textNodeOf(el)); if (dec) dec.stop(true);
    const node = textNodeOf(el);
    if (!node || !node.parentNode) return no();
    const text = o.text != null ? String(o.text) : node.nodeValue;
    const chars = Array.from(text), len = chars.length;
    if (!gate(o.part, 'decode') || still() || document.hidden || !text.trim() || len > 600) {
      if (node.nodeValue !== text) node.nodeValue = text;
      return no();
    }
    if (node.nodeValue !== text) node.nodeValue = text; /* named with its final words */
    const carrier = nameHold(node);
    const per = Math.max(3, Math.min(Number(o.perLetter) || 18, (Number(o.cap) || 500) / len));
    const wrap = document.createElement('span'), on = document.createElement('span'), off = document.createElement('span');
    wrap.className = 'o55fx-ty'; on.className = 'o55fx-ty-on'; off.className = 'o55fx-ty-off';
    const onT = document.createTextNode(''), offT = document.createTextNode(text);
    on.appendChild(onT); off.appendChild(offT); wrap.append(on, off);
    node.parentNode.replaceChild(wrap, node);
    let k = 0, t0 = 0, timer = null, stopped = false, lastSnd = -1e9, res;
    const p = new Promise((r) => { res = r; });
    const job = { node, stop };
    const entry = run(hostOf(wrap), () => stop(true), () => stop(true));
    typing.set(wrap, job);
    function write(n) { k = n; const a = chars.slice(0, n).join(''); onT.data = a; offT.data = text.slice(a.length); }
    function stop(whole) {
      if (stopped) return;
      stopped = true; if (timer) timer.cancel(); timer = null;
      typing.delete(wrap); finish(entry);
      const ok = wrap.isConnected;
      /* the words come back whole in their own text node (also when stopped early: that is the end state); if
         something else rewrote the element meanwhile, that write stands */
      if (ok) wrap.replaceWith(node);
      nameFree(carrier);
      res(ok && whole !== false);
    }
    const tick = () => {
      timer = null; if (stopped) return;
      if (!wrap.isConnected) { stop(false); return; }
      const n = Math.min(len, Math.floor((M.now() - t0) / per) + 1);
      if (n !== k) write(n);
      if (o.sound && M.now() - lastSnd >= 120) { lastSnd = M.now(); play(o.sound === true ? 'type' : o.sound); }
      if (n >= len) { stop(true); return; }
      timer = M.after(Math.max(16, Math.min(40, per)), tick);
    };
    const start = () => {
      timer = null; if (stopped) return;
      if (!wrap.isConnected) { stop(false); return; }
      if (o.caret !== false) off.setAttribute('data-caret', '');
      t0 = M.now(); tick();
    };
    if (o.delay > 0) timer = M.after(o.delay, start); else start();
    return p;
  };

  /* ---- decode: a label of eight characters or fewer (a kicker, a tag, OK, a counter) resolves from glyphs of its
     own kind (capitals for capitals, digits for digits), strictly left to right, inside its box held at its size and
     clipped, so a wider glyph can never wrap or print over its neighbour. Anything longer types on. */
  const GLYPH = { upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ', lower: 'abcdefghjkmnopqrstuvwxyz', digit: '0123456789', mark: '#%&*+=/<>' };
  const decoding = new WeakMap();
  function glyph(ch) {
    const set = /[A-Z]/.test(ch) ? GLYPH.upper : /[a-z]/.test(ch) ? GLYPH.lower : /[0-9]/.test(ch) ? GLYPH.digit : GLYPH.mark;
    return set[(Math.random() * set.length) | 0];
  }
  /* hold the box that lays the words out at its size, clipped, while glyphs of other widths pass through it */
  function hold(node, el) {
    let b = node.parentElement;
    while (b && b !== el && getComputedStyle(b).display === 'inline') b = b.parentElement;
    if (!b) return null;
    const cs = getComputedStyle(b);
    if (cs.display === 'inline' || cs.display === 'contents' || !/px$/.test(cs.width) || !/px$/.test(cs.height)) return null;
    const h = { b, had: b.hasAttribute('style'), w: b.style.width, h: b.style.height, ov: b.style.overflow, sw: cs.width, sh: cs.height };
    b.style.width = h.sw; b.style.height = h.sh; b.style.overflow = 'clip';
    return h;
  }
  function unhold(h) {
    if (!h) return;
    if (h.b.style.width === h.sw) h.b.style.width = h.w;
    if (h.b.style.height === h.sh) h.b.style.height = h.h;
    if (h.b.style.overflow === 'clip') h.b.style.overflow = h.ov;
    /* hold() made the style attribute: leave none behind */
    if (!h.had && !(h.b.getAttribute('style') || '').trim()) h.b.removeAttribute('style');
  }
  const SHORT = 8;
  FX.decode = function decode(el, o) {
    o = o || {};
    const node0 = textNodeOf(el);
    if (!node0) return no();
    const text = o.text != null ? String(o.text) : node0.nodeValue;
    if (Array.from(text.trim()).length > SHORT || typeJobIn(el)) {
      return FX.type(el, { text, part: 'decode', cap: Math.min(500, Number(o.ms) || 500), sound: o.sound ? (o.sound === true ? 'type' : o.sound) : false });
    }
    const node = node0;
    const prev = decoding.get(node); if (prev) prev.stop(true);
    if (!has('decode') || still() || document.hidden || !text.trim()) {
      if (node.nodeValue !== text) node.nodeValue = text;
      return no();
    }
    if (node.nodeValue !== text) node.nodeValue = text; /* measured (and named) with its final words */
    const held = hold(node, el);
    const carrier = nameHold(node); /* before the first scrambled frame */
    const ms = clamp(Number(o.ms) || 240, 120, 600), dt = 35, n = Math.max(3, Math.round(ms / dt)), len = text.length;
    /* each character resolves on its own step, strictly left to right, all by the last step */
    const at = [];
    for (let k = 0; k < len; k++) at.push(/\s/.test(text[k]) ? 0 : 1 + Math.floor((n - 1) * k / Math.max(1, len - 1)));
    let i = 0, last = '', timer = null, stopped = false, res;
    const p = new Promise((r) => { res = r; });
    const frame = () => { let out = ''; for (let k = 0; k < len; k++) out += i >= at[k] ? text[k] : glyph(text[k]); return out; };
    const job = run(el.nodeType === 1 ? hostOf(el) : null, () => stop(true), () => stop(true));
    function stop(restore) {
      if (stopped) return;
      stopped = true; if (timer) timer.cancel(); timer = null;
      decoding.delete(node); finish(job);
      /* if anything else wrote the words meanwhile (the window's refresh), that write stands */
      if (restore && node.isConnected && node.nodeValue === last) node.nodeValue = text;
      unhold(held);
      nameFree(carrier);
      res(true);
    }
    const tick = () => {
      timer = null; if (stopped) return;
      if (!node.isConnected || node.nodeValue !== last) { stop(false); return; }
      if (++i >= n) { last = text; node.nodeValue = text; stop(true); return; }
      last = frame(); node.nodeValue = last;
      timer = M.after(dt, tick);
    };
    decoding.set(node, { stop });
    last = frame(); node.nodeValue = last;
    timer = M.after(dt, tick);
    if (o.sound) play(o.sound === true ? 'decode' : o.sound);
    return p;
  };

  /* ================================================================== lines: fold, lineTo, lineHold, slice from */
  /* A line is a 2 px ink .o55fx-line in the page layer (above the window, the tour and the app), so it outlives the
     surface it came from: the window folds to it, it travels to the tour's first callout, and the callout slices open
     from it. Placed by left/top/width in the layer's coordinates; it moves by one stepped transform at a time. */
  const lineHolds = new WeakMap();
  const folds = new Map(); /* el -> { a, off } */
  function lineHoldOff(line) { const a = lineHolds.get(line); if (a) { a.cancel(); lineHolds.delete(line); } }
  function lineDrop(line) {
    if (!line) return;
    lineHoldOff(line);
    if (line.o55fxTimer) { line.o55fxTimer.cancel(); line.o55fxTimer = null; }
    drop(line);
  }
  FX.lineDrop = lineDrop;
  function newLine(r) {
    const line = box(layerOf(document.body), { left: r.left, top: r.top, width: Math.max(2, r.width), height: 2 }, 'o55fx-line');
    /* a line nobody takes goes by itself (a hand-over that never came) */
    line.o55fxTimer = M.after(9000, () => { line.o55fxTimer = null; lineDrop(line); });
    return line;
  }
  function unfoldNow(el) {
    const f = el && folds.get(el); if (!f) return;
    folds.delete(el);
    if (f.off) f.off();
    try { f.a.cancel(); } catch (_) {}
    raf(() => followers.forEach((x) => { if (el.contains(x.el)) x.place(); }));
  }
  FX.unfold = unfoldNow;
  /* el stays folded (a filled scale animation) until it opens again; its surface being hidden also restores it (the
     window is hidden right after the hand-over, so the next run opens it whole) */
  function foldWatch(el, done) {
    const root = el.closest ? el.closest(ROOTS) : null;
    if (!root) return () => {};
    const mo = new MutationObserver(() => { if (root.hidden || !root.isConnected) done(); });
    mo.observe(root, { attributes: true, attributeFilter: ['hidden'] });
    return () => mo.disconnect();
  }
  FX.fold = function fold(el, o) {
    o = o || {};
    if (!el || typeof el.animate !== 'function' || !has('slice') || still() || document.hidden) return Promise.resolve(null);
    const r = rectOf(el); if (!r) return Promise.resolve(null);
    unfoldNow(el);
    const ms = clamp(Number(o.ms) || 260, 80, 1200);
    quiet(ms + 600);
    const line = newLine({ left: r.left, top: r.top + r.height / 2 - 1, width: r.width });
    /* the surface squashes to its centre line in 4 held steps; on the last one it is gone and the line is there. The
       separate scale property applies outside el's own transform, so for an element placed by a translation (the
       tour callout) the squash is centred on where it stands (its origin, inside the animation only, is moved by that
       translation); any other transform closes with a clip to the same centre line instead */
    let kf = null;
    try {
      const t = getComputedStyle(el).transform, m = new DOMMatrixReadOnly(t && t !== 'none' ? t : undefined);
      if (m.is2D && m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1) {
        const origin = `${(el.offsetWidth / 2 + m.e).toFixed(1)}px ${(el.offsetHeight / 2 + m.f).toFixed(1)}px`;
        kf = [{ scale: '1 1', transformOrigin: origin }, { scale: '1 0', transformOrigin: origin }];
      }
    } catch (_) { /* no matrix: the clip below */ }
    if (!kf) kf = [{ clipPath: 'inset(0 -40px 0 -40px)' }, { clipPath: 'inset(50% -40px 50% -40px)' }];
    const a = el.animate(kf, { duration: ms, easing: 'steps(4, end)', fill: 'forwards' });
    const show = line.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: 'step-end', fill: 'both' });
    const rec = { a, off: null };
    folds.set(el, rec);
    /* what follows something inside it (brackets, the cursor) stands aside at once rather than squash with it */
    followers.forEach((f) => { if (el.contains(f.el)) f.hide(); });
    rec.off = foldWatch(el, () => { if (folds.get(el) === rec) unfoldNow(el); });
    const job = run(hostOf(el), () => { unfoldNow(el); lineDrop(line); }, () => { try { a.finish(); show.finish(); } catch (_) {} });
    return ended(a).then((ok) => { finish(job); if (!ok || !line.isConnected) { lineDrop(line); return null; } line.o55fxFrom = el; return line; });
  };
  FX.lineTo = function lineTo(line, target, o) {
    o = o || {};
    if (!line || !line.isConnected) return no();
    lineHoldOff(line);
    const t = toRect(target); if (!t) return no();
    const z = zoom(), x0 = parseFloat(line.style.left) || 0, y0 = parseFloat(line.style.top) || 0, w0 = Math.max(1, parseFloat(line.style.width) || 1);
    const edge = o.edge || 'top', ty = edge === 'bottom' ? t.bottom - 1 : edge === 'middle' ? t.top + t.height / 2 - 1 : t.top - 1;
    const x1 = Math.round(t.left / z), y1 = Math.round(ty / z), w1 = Math.max(2, Math.round(t.width / z));
    const commit = () => { line.style.left = x1 + 'px'; line.style.top = y1 + 'px'; line.style.width = w1 + 'px'; };
    if (still() || typeof line.animate !== 'function') { commit(); return Promise.resolve(true); }
    const ms = clamp(Number(o.ms) || 280, 60, 2000);
    quiet(ms + 300);
    const a = line.animate([{ transform: 'translate(0px, 0px) scaleX(1)' }, { transform: `translate(${x1 - x0}px, ${y1 - y0}px) scaleX(${(w1 / w0).toFixed(4)})` }],
      { duration: ms, easing: 'steps(5, end)', fill: 'forwards' });
    const job = run(document.body, () => a.cancel(), () => { try { a.finish(); } catch (_) {} });
    return ended(a).then((ok) => { finish(job); if (line.isConnected) { commit(); a.cancel(); } return ok; });
  };
  FX.lineHold = function lineHold(line) {
    if (!line || !line.isConnected || typeof line.animate !== 'function' || still()) return false;
    lineHoldOff(line);
    /* a small element's blink (2 px tall), so it may reverse; the step easing sits on each keyframe */
    lineHolds.set(line, line.animate([{ opacity: 1, offset: 0, easing: 'step-end' }, { opacity: 0.15, offset: 0.5, easing: 'step-end' }, { opacity: 1, offset: 1 }],
      { duration: 520, iterations: Infinity }));
    return true;
  };
  FX.trail = function trail(x, y, o) {
    o = o || {};
    if (!has('pod') || still() || document.hidden || !Number.isFinite(x) || !Number.isFinite(y)) return no();
    const b = box(layerOf(flyHost(o, null)), { left: x - 1.5, top: y - 1.5, width: 3, height: 3 }, 'o55fx-trail');
    const a = b.animate([{ opacity: 1, offset: 0, easing: 'step-end' }, { opacity: 0.45, offset: 0.5, easing: 'step-end' }, { opacity: 0, offset: 1 }],
      { duration: clamp(Number(o.ms) || 140, 40, 1000), fill: 'forwards' });
    return ended(a).then((ok) => { drop(b); return ok; });
  };

  /* hops(el, to, { n = 9, ms = 540, arc = 0, trail = true, fill = 'forwards' }) -> Promise<bool>: el (the Pod) travels
     to `to` (a { dx, dy } offset, or an element or rect whose centre it goes to) in n held hops along a line lifted by
     `arc` px at its middle, each hop leaving a trail square where it was. Moved by its separate translate property
     (never its transform); with fill 'forwards' it stays there until the caller places it (then cancel()s the
     returned promise's animation: el.getAnimations()). Reduced Motion: no travel (false), the caller jumps. [pod] */
  FX.hops = function hops(el, to, o) {
    o = o || {};
    if (!el || typeof el.animate !== 'function' || !has('pod') || still() || document.hidden) return no();
    const r = rectOf(el); if (!r) return no();
    const z = zoom();
    let dx, dy;
    if (to && Number.isFinite(to.dx)) { dx = to.dx; dy = to.dy || 0; }
    else { const t = toRect(to); if (!t) return no(); dx = (t.left + t.width / 2 - (r.left + r.width / 2)) / z; dy = (t.top + t.height / 2 - (r.top + r.height / 2)) / z; }
    const n = clamp(Math.round(Number(o.n) || 9), 1, 24), ms = clamp(Number(o.ms) || 540, 60, 4000), arc = Number(o.arc) || 0;
    const pt = (i) => { const f = i / n; return [Math.round(dx * f), Math.round(dy * f - arc * Math.sin(Math.PI * f))]; };
    const kf = [];
    for (let i = 0; i <= n; i++) { const [x, y] = pt(i); kf.push({ translate: `${x}px ${y}px`, offset: i / n, easing: 'step-end' }); }
    quiet(ms + 300);
    const a = el.animate(kf, { duration: ms, fill: o.fill || 'forwards' });
    const timers = [];
    if (o.trail !== false) {
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      for (let i = 0; i < n; i++) { const [x, y] = pt(i); timers.push(M.after(ms * (i + 1) / n, () => FX.trail(cx + x * z, cy + y * z, { layer: o.layer }))); }
    }
    const job = run(hostOf(el), () => { a.cancel(); timers.forEach((t) => t.cancel()); }, () => { try { a.finish(); } catch (_) {} });
    return ended(a).then((ok) => { finish(job); return ok; });
  };

  /* ================================================================== slice */
  /* The surface is clipped to a line while a hairline with square caps draws across it, then opens in four steps with
     an ink edge riding each side of the opening; the edges blink out. From a line (opts.from: a line element, which
     is taken away on the first frame, or a rect) it opens from that line's place and the hairline is already drawn.
     Only clip-path is animated on the element (never its transform), so a surface placed by transform (the tour
     callout) slices in place. A folded element opens whole again first. */
  const slicing = new WeakMap();
  FX.slice = function slice(el, o) {
    o = o || {};
    const fromLine = o.from && o.from.nodeType === 1 ? o.from : null;
    const fr = o.from ? toRect(o.from) : null;
    unfoldNow(el);
    if (!el || typeof el.animate !== 'function' || !has('slice') || heavy() || document.hidden) { lineDrop(fromLine); return no(); }
    const r = rectOf(el); if (!r) { lineDrop(fromLine); return no(); }
    const prev = slicing.get(el); if (prev) prev();
    const ms = clamp(Number(o.ms) || 240, 140, 900), host = hostOf(el), L = layerOf(host);
    const y = fr ? clamp((fr.top + fr.height / 2 - r.top) / r.height, 0, 1) : 0.5;
    const pc = (v) => (v * 100).toFixed(2) + '%';
    const shut = `inset(${pc(y)} -40px ${pc(1 - y)} -40px)`, open = 'inset(-40px -40px -40px -40px)';
    const drawn = fr ? 0 : 0.3; /* from a line: no hairline to draw first */
    const a = el.animate([
      { clipPath: shut, offset: 0 },
      { clipPath: shut, offset: drawn, easing: 'steps(4, end)' },
      { clipPath: open, offset: 0.82 },
      { clipPath: open, offset: 1 }
    ], { duration: ms });
    const b = box(L, r, 'o55fx-slice', '<i></i><i></i>');
    const H = r.height / zoom(), up = -y * H, down = (1 - y) * H;
    const lines = Array.from(b.children).map((line, k) => {
      line.style.top = pc(y);
      const d = k ? down : up;
      const kf = fr ? [] : [{ transform: 'translateY(0) scaleX(0)', opacity: 1, offset: 0, easing: 'steps(3, end)' }];
      kf.push({ transform: 'translateY(0) scaleX(1)', opacity: 1, offset: drawn, easing: 'steps(4, end)' },
        { transform: `translateY(${d.toFixed(1)}px) scaleX(1)`, opacity: 1, offset: 0.82, easing: 'step-end' },
        { transform: `translateY(${d.toFixed(1)}px) scaleX(1)`, opacity: 0.25, offset: 0.9, easing: 'step-end' },
        { transform: `translateY(${d.toFixed(1)}px) scaleX(1)`, opacity: 0, offset: 1 });
      return line.animate(kf, { duration: ms, fill: 'forwards' });
    });
    lineDrop(fromLine);
    let done = false;
    const end = () => { if (done) return; done = true; finish(job); if (slicing.get(el) === cancel) slicing.delete(el); drop(b); };
    const cancel = () => { a.cancel(); lines.forEach((x) => x.cancel()); end(); };
    const job = run(host, cancel, () => { try { a.finish(); lines.forEach((x) => x.finish()); } catch (_) {} });
    slicing.set(el, cancel);
    return ended(a).then((ok) => { end(); return ok; });
  };

  /* ================================================================== wipe */
  /* A band of the surface's own ground, ruled faintly, with an ink leading edge and square caps, covers the container
     and steps off to the right (dir 'back': mirrored, to the left, so Back reads as going back), so what was drawn
     under it is revealed (a page change). A compositor transform: it plays on a low-resource computer too. */
  FX.wipe = function wipe(el, o) {
    o = o || {};
    if (!el || !has('wipe') || still() || document.hidden) return no();
    const r = rectOf(el); if (!r) return no();
    const ms = clamp(Number(o.ms) || 380, 160, 1200), host = hostOf(el), L = layerOf(host);
    const b = box(L, r, 'o55fx-wipe', '<i><b></b></i>');
    if (o.dir === 'back') b.setAttribute('data-dir', 'back');
    const ground = groundOf(el); if (ground) b.style.setProperty('--o55fx-ground', ground);
    const a = b.firstElementChild.animate([
      { transform: 'translateX(0)', offset: 0 },
      { transform: 'translateX(0)', offset: 0.16, easing: 'steps(8, end)' },
      { transform: 'translateX(101%)', offset: 1 }
    ], { duration: ms, fill: 'forwards' });
    const job = run(host, () => a.cancel(), () => { try { a.finish(); } catch (_) {} });
    return ended(a).then((ok) => { finish(job); drop(b); return ok; });
  };

  /* ================================================================== glitch and alert */
  /* glitch: el jitters in five steps (the separate translate property), two ink strips slip across it and a strip of
     its ground cuts a line out of it. alert: the same tear, then a scan line steps down the box (sweep) and six ink
     shards are thrown off its top edge (particles), the 5.6 Pro chat's alert effects drawn in this surface. */
  /* [top, height, from, to (fractions of the width), slips, kind]: strips of different lengths, so it reads as a tear and
     never as a line through the words */
  const TEAR = [[0.22, 4, 0.06, 0.58, [0, 10, -6, 3, 0], 'o55fx-tear'], [0.46, 7, 0.3, 1.02, [0, -14, 9, -4, 0], 'o55fx-cut'],
    [0.7, 1, -0.02, 1.02, [0, -7, 5, -2, 0], 'o55fx-tear'], [0.84, 5, 0.66, 0.86, [0, 6, -9, 2, 0], 'o55fx-tear']];
  function tear(L, r, ground, ms) {
    const anims = [];
    TEAR.forEach(([at, h, x0, x1, xs, cls], n) => {
      const b = box(L, { left: r.left + r.width * x0, top: r.top + r.height * at, width: r.width * (x1 - x0), height: h }, cls);
      if (cls === 'o55fx-cut' && ground) b.style.setProperty('--o55fx-ground', ground);
      const a = b.animate(xs.map((x, i) => ({ transform: `translateX(${x}px)`, opacity: i === xs.length - 1 ? 0 : 1 })), { duration: ms, delay: n * 24, easing: 'steps(5, end)', fill: 'both' });
      anims.push(a); ended(a).then(() => drop(b));
    });
    return anims;
  }
  function scan(L, r) {
    const b = box(L, { left: r.left, top: r.top, width: r.width, height: 18 }, 'o55fx-scan');
    const a = b.animate([{ transform: 'translateY(-18px)', opacity: 0 }, { transform: 'translateY(-14px)', opacity: 1, offset: 0.12 },
      { transform: `translateY(${Math.round(r.height * 0.85 / zoom())}px)`, opacity: 1, offset: 0.85 }, { transform: `translateY(${Math.round(r.height / zoom())}px)`, opacity: 0 }],
    { duration: 520, easing: 'steps(8, end)', fill: 'both' });
    ended(a).then(() => drop(b));
    return a;
  }
  function shards(L, r) {
    const out = [];
    for (let i = 0; i < 6; i++) {
      const ang = (-150 + i * 24 + (i % 2 ? 6 : -6)) * Math.PI / 180, d = 26 + (i % 3) * 11, s = i % 3 === 1 ? 3 : 4;
      const b = box(L, { left: r.left + r.width * (0.18 + i * 0.13), top: r.top, width: s, height: s }, 'o55fx-shard');
      const a = b.animate([{ transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${Math.round(Math.cos(ang) * d)}px, ${Math.round(Math.sin(ang) * d)}px) rotate(${90 + i * 30}deg)`, opacity: 0 }],
      { duration: 560, delay: 60 + i * 18, easing: 'steps(6, end)', fill: 'both' });
      out.push(a); ended(a).then(() => drop(b));
    }
    return out;
  }
  function hurt(el, kind) {
    if (!el || !has('glitch') || still() || document.hidden) return no();
    const r = rectOf(el); if (!r) return no();
    const host = hostOf(el), L = layerOf(host), ground = groundOf(el);
    const anims = [];
    if (typeof el.animate === 'function') {
      anims.push(el.animate([{ translate: '0px 0px' }, { translate: '4px 0px' }, { translate: '-3px 0px' }, { translate: '2px 0px' }, { translate: '0px 0px' }],
        { duration: 240, easing: 'steps(5, end)' }));
    }
    anims.push(...tear(L, r, ground, 260));
    if (kind === 'alert') {
      if (has('sweep') && !heavy()) anims.push(scan(L, r));
      if (has('particles') && !heavy()) anims.push(...shards(L, r));
    }
    const job = run(host, () => anims.forEach((a) => a.cancel()));
    return Promise.all(anims.map(ended)).then(() => { finish(job); prune(L); return true; });
  }
  FX.glitch = (el) => hurt(el, 'glitch');
  FX.alert = (el) => hurt(el, 'alert');

  /* ================================================================== brackets */
  /* Four ink corners lock on to el (they step in from outside), follow it, and let go when asked or when it leaves. */
  const locks = new Map();
  FX.brackets = function brackets(el, on) {
    if (!el) return null;
    const cur = locks.get(el);
    if (on === false || !has('brackets')) { if (cur) cur.release(); return null; }
    if (cur) { cur.f.force = true; raf(() => cur.f.place()); return cur.node; }
    const host = hostOf(el), L = layerOf(host);
    const node = document.createElement('div');
    node.className = 'o55fx-brk'; node.innerHTML = '<i></i><i></i><i></i><i></i>';
    L.appendChild(node);
    const GAP = 4, EDGE = 2;
    const put = (r, first) => {
      node.toggleAttribute('data-jump', first);
      /* kept inside the layer, at least 2 px in from its edges (a target at the viewport's edge, the tour's Chat
         icon at left 0, still shows all four corners) */
      const Lr = node.parentElement, W = (Lr && Lr.clientWidth) || z1(innerWidth), H = (Lr && Lr.clientHeight) || z1(innerHeight);
      const x0 = clamp(z1(r.left) - GAP, EDGE, W - EDGE - 24), y0 = clamp(z1(r.top) - GAP, EDGE, H - EDGE - 24);
      const x1 = clamp(z1(r.right) + GAP, x0 + 24, W - EDGE), y1 = clamp(z1(r.bottom) + GAP, y0 + 24, H - EDGE);
      node.style.transform = `translate(${x0}px, ${y0}px)`;
      node.style.width = `${x1 - x0}px`; node.style.height = `${y1 - y0}px`;
      if (first && !still()) {
        Array.from(node.children).forEach((c, i) => {
          const sx = i % 2 ? 1 : -1, sy = i > 1 ? 1 : -1;
          c.animate([{ translate: `${sx * 10}px ${sy * 10}px`, opacity: 0 }, { translate: `${sx * 4}px ${sy * 4}px`, opacity: 1, offset: 0.66 }, { translate: '0px 0px', opacity: 1 }],
            { duration: 210, easing: 'steps(3, end)' });
        });
      }
    };
    let gone = false;
    const leave = () => { if (gone) return; gone = true; locks.delete(el); drop(node); };
    const item = {
      node,
      release() {
        if (gone) return;
        locks.delete(el);
        const f = item.f; followers.delete(f); unwire();
        if (still() || !node.isConnected || f.gone !== false) { leave(); return; }
        const anims = Array.from(node.children).map((c, i) => {
          const sx = i % 2 ? 1 : -1, sy = i > 1 ? 1 : -1;
          return c.animate([{ translate: '0px 0px', opacity: 1 }, { translate: `${sx * 8}px ${sy * 8}px`, opacity: 0 }], { duration: 140, easing: 'steps(2, end)', fill: 'forwards' });
        });
        Promise.all(anims.map(ended)).then(leave);
      }
    };
    locks.set(el, item);
    item.f = follow(el, node, host, put, leave);
    return node;
  };

  /* ================================================================== menu cursor */
  /* The row becomes an ink bar with paper words (05-nier-fx.css; the bar slides in from the left in four steps) and
     one square cursor beside it nudges in steps; moving the cursor to another row of the same surface hands the
     bar over and the square glides there. The row keeps its attribute through the window's re-renders (a small
     observer on that one row puts it back). */
  const CUR = 'data-o55fx-cursor';
  const cursors = new Map(); /* host -> { el, node, f, mo } */
  function barOff(c) {
    if (!c || !c.el) return;
    if (c.mo) { c.mo.disconnect(); c.mo = null; }
    if (c.f) { followers.delete(c.f); unwire(); c.f = null; }
    c.el.removeAttribute(CUR);
    c.el = null;
  }
  function cursorOff(host) {
    const c = cursors.get(host); if (!c) return;
    barOff(c);
    cursors.delete(host);
    drop(c.node);
  }
  /* Where the square goes. Beside the row's left edge when 16 px there are free (no neighbouring element, inside
     its scroll box and the viewport). Else (a tile in the second column of a grid, a row flush with its box) inside
     the ink bar, a paper square in its left padding beside the first line of words; with no padding for it, above
     the bar's left corner. (Read in the follower's animation frame, after the frame's layout.) */
  function roomLeft(el, r, port) {
    if (r.left < 16) return false;
    if (port && port.isConnected && r.left - port.getBoundingClientRect().left < 16) return false;
    const y = r.top + r.height / 2;
    for (const dx of [3, 15]) {
      const t = document.elementFromPoint(r.left - dx, y);
      if (t && !t.contains(el)) return false;
    }
    return true;
  }
  function curSpot(el, r, port) {
    if (roomLeft(el, r, port)) return { side: 'left', x: z1(r.left) - 14, y: Math.round(z1(r.top + r.height / 2) - 4.5) };
    let room = 0, mid = r.top + r.height / 2;
    const n = textNodeOf(el);
    if (n) {
      const rg = document.createRange(); rg.selectNodeContents(n);
      const line = rg.getClientRects()[0];
      if (line) { room = line.left - r.left; mid = line.top + line.height / 2; }
    }
    if (room >= 11 * zoom()) return { side: 'in', x: z1(r.left + (room - 7 * zoom()) / 2), y: Math.round(z1(mid) - 3.5) };
    return { side: 'top', x: z1(r.left), y: z1(r.top) - 13 };
  }
  FX.cursor = function cursor(el, on) {
    if (!el) return null;
    const host = hostOf(el), c = cursors.get(host);
    if (on === false) { if (c && c.el === el) cursorOff(host); return null; }
    if (!has('cursor')) { if (c) cursorOff(host); return null; }
    if (c && c.el === el) { c.f.force = true; raf(() => c.f && c.f.place()); return c.node; }
    let cur = c;
    if (cur) barOff(cur);
    else {
      const node = document.createElement('div');
      node.className = 'o55fx-cur'; node.setAttribute('data-jump', ''); node.innerHTML = '<i></i>';
      layerOf(host).appendChild(node);
      cur = { el: null, node, f: null, mo: null };
      cursors.set(host, cur);
    }
    cur.el = el;
    el.setAttribute(CUR, '');
    /* the bar slides in as a Web Animation of the registered --o55fx-cur (and the words turn paper half way), so the
       row's own CSS animations and transitions are left alone. Slint: an ink Rectangle whose width animates. */
    if (!still() && typeof el.animate === 'function') {
      try {
        el.animate([{ '--o55fx-cur': '0%', '--o55fx-cur-fg': 'var(--text-primary)' }, { '--o55fx-cur': '100%', '--o55fx-cur-fg': 'var(--o55-nier-on-ink)' }],
          { duration: 200, easing: 'steps(4, end)' });
      } catch (_) { /* no custom property animation: the bar is simply there */ }
    }
    cur.mo = new MutationObserver(() => { if (cur.el === el && !el.hasAttribute(CUR)) el.setAttribute(CUR, ''); });
    cur.mo.observe(el, { attributes: true, attributeFilter: [CUR] });
    const node = cur.node;
    let port;
    const put = (r, again) => {
      if (again && node.getAttribute('data-gone') != null) node.setAttribute('data-jump', '');
      if (port === undefined) port = scrollBox(el, host);
      const s = curSpot(el, r, port);
      node.style.transform = `translate(${s.x}px, ${s.y}px)`;
      if (node.dataset.side !== s.side) node.dataset.side = s.side;
      if (node.hasAttribute('data-jump')) M.release(() => node.removeAttribute('data-jump'));
    };
    cur.f = follow(el, node, host, put, () => { if (cursors.get(host) === cur && cur.el === el) cursorOff(host); });
    return node;
  };

  /* ================================================================== Pod 042 */
  /* PMConcept7's original ink-line Pod (kit.d/19-nier-parts.js): a chamfered box with a sensor slit, two side arms
     and a skirt; a shadow dash below. One drawing for every Pod of the onboarding and the tour (podSvg). Beside it a
     speech strip: the POD 042 band and a lead (Report, Proposal, Alert, Query). It finds a place by its anchor where
     it covers no control (or a lane of the window's stage, below), turns toward it and sends three signals; it hovers
     in steps and leaves on its own after its time. */
  const POD_PATHS = (f, k) => `<path class="${f}" d="M3.5 13.5H8.5V30.5H3.5Z M31.5 13.5H36.5V30.5H31.5Z"/><path d="M3.5 13.5H8.5V30.5H3.5Z M31.5 13.5H36.5V30.5H31.5Z M8.5 18H9.5 M30.5 18H31.5 M6 10.5V13.5 M34 10.5V13.5"/>`
    + `<path class="${f}" d="M12.5 6.5H27.5L30.5 9.5V33.5L26.5 37.5H13.5L9.5 33.5V9.5Z"/><path d="M12.5 6.5H27.5L30.5 9.5V33.5L26.5 37.5H13.5L9.5 33.5V9.5Z M11 12.5H29 M13 27.5H27 M13 30.5H27 M15.5 37.5L17 41.5H23L24.5 37.5"/>`
    + `<path class="${k}" stroke="none" d="M15 18H25V21H15Z"/><path class="${k}" stroke="none" d="M22 18H25V21H22Z" opacity=".35"/>`;
  const POD_STROKE = 'fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="miter" stroke-linecap="square"';
  FX.podSvg = function podSvg(cls, o) {
    o = o || {};
    const c = String(cls || 'o55fx-pod'), f = o.fill || c + '-fill', k = o.ink || c + '-ink';
    if (o.part === 'shadow') return `<svg viewBox="0 0 40 52" aria-hidden="true"><path class="${k}" d="M13 47.3H27V48.7H13Z" opacity=".32"/></svg>`;
    if (o.part === 'paths') return POD_PATHS(f, k);
    return `<svg viewBox="0 0 40 52" ${POD_STROKE} aria-hidden="true">${POD_PATHS(f, k)}</svg>`;
  };
  const LEADS = ['report', 'proposal', 'alert', 'query', 'analysis'];
  const CONTROL = 'button, a[href], summary, input, select, textarea, [role="button"], [role="radio"], [role="checkbox"], [role="switch"], [role="tab"], [role="menuitem"], [role="option"]';
  const pods = new Map(); /* host -> P */
  /* The app's own Pod (kit.d/19-nier-parts.js, #o55np-pod) hovers by the bottom-right corner wherever the onboarding
     window is not open (the tour, the app), and the window rests its own (.o55nw-pod) by the art panel's top corner.
     They are the same Pod: while this one speaks, those step away (the mark sits on them, never on <html>, so it
     restyles nothing else) and this one flies out from that place and back to it. */
  const RESTING = '.o55nw-pod';
  function home(host) {
    if (host && host.id === 'pm-o55-onboarding') {
      const e = host.querySelector(RESTING);
      if (e && !host.hasAttribute('data-o55fx-pod')) { const r = e.getBoundingClientRect(); if (r.width > 4) return { el: e, r }; }
      return null;
    }
    const e = document.getElementById('o55np-pod');
    if (!e || e.hasAttribute('data-o55fx-away')) return null;
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden') return null;
    const r = e.getBoundingClientRect();
    return r.width > 4 ? { el: e, r } : null;
  }
  function homeSync() {
    const away = pods.size > 0;
    const app = document.getElementById('o55np-pod');
    if (app && app.hasAttribute('data-o55fx-away') !== away) app.toggleAttribute('data-o55fx-away', away);
    const onb = document.getElementById('pm-o55-onboarding');
    if (onb && onb.hasAttribute('data-o55fx-pod') !== away) onb.toggleAttribute('data-o55fx-pod', away);
  }

  /* would a box at (x, y, w, h) cover a control of the page? (the Pod's layer takes no pointer, so it is not hit) */
  function covers(x, y, w, h, anchor) {
    const z = zoom();
    for (const [fx, fy] of [[0.12, 0.2], [0.88, 0.2], [0.5, 0.5], [0.12, 0.8], [0.88, 0.8]]) {
      const t = document.elementFromPoint((x + w * fx) * z, (y + h * fy) * z);
      const c = t && t.closest ? t.closest(CONTROL) : null;
      if (c && !(anchor && anchor.nodeType === 1 && (anchor === c || anchor.contains(c)))) return true;
    }
    return false;
  }
  /* reading text the Pod must not stand on either: the tour's callout and bar, the window's head (one that holds
     the anchor, or lies inside it, does not count) */
  const OBSTACLE = '.o55t-callout, .o55t-bar, .o55-head';
  function obstacles(anchor) {
    const z = zoom(), out = [], el = anchor && anchor.nodeType === 1 ? anchor : null;
    document.querySelectorAll(OBSTACLE).forEach((e) => {
      if (el && (e === el || e.contains(el) || el.contains(e))) return;
      const root = e.closest(ROOTS);
      if ((root && closing(root)) || e.closest('[hidden]')) return;
      const r = e.getBoundingClientRect();
      if (r.width >= 2 && r.height >= 2) out.push({ l: r.left / z, t: r.top / z, r: r.right / z, b: r.bottom / z });
    });
    return out;
  }
  const meets = (x, y, w, h, obs) => obs.some((o) => x < o.r && x + w > o.l && y < o.b && y + h > o.t);
  const overlap = (x, y, w, h, obs) => obs.reduce((s, o) => s + Math.max(0, Math.min(x + w, o.r) - Math.max(x, o.l)) * Math.max(0, Math.min(y + h, o.b) - Math.max(y, o.t)), 0);

  /* ---- the narrator's lanes (rule 8). On the window's stage the strip never covers an actor (the units, You, the
     machine), a hung sign or card, or the stage kicker. It has two lanes: just below the control bar's line, and low
     over the stage lip; in each it tries five places along the stage (its right end, its left end, the middle and the
     quarters). A place that crosses an actor, a sign, a card or the kicker is out; of the rest it takes the one that
     covers least of the scene's subject (the computer, the plan, the map's nodes: the stage's other props), the first
     lane winning a tie. With no place clear it takes the one that covers least and stands back. */
  const ACTORS = '.o55-nier-unit, .o55-nier-you, .o55-nier-mach, .o55-nier-kicker, .o55-it[data-key="sign"], .o55-it[data-key="ok"], .o55-it[data-key="ready"], [data-o55fx-avoid]';
  /* props that are set, light or ground rather than subject: the slab, the bar and its link, the sparks, the curtain */
  const SET = /^(stage|bar|link|dim|curtain|you|mach|sign|ok|ready|sp\d+|h\d+)$/;
  function lanesOf(stage, size, o) {
    o = o || {};
    const z = zoom(), S = rectOf(stage);
    if (!S) return null;
    const obs = [], soft = [];
    const add = (r, to) => { if (r && r.width >= 2 && r.height >= 2) (to || obs).push({ l: r.left / z, t: r.top / z, r: r.right / z, b: r.bottom / z }); };
    stage.querySelectorAll(ACTORS).forEach((e) => { if (!e.closest('.o55-out')) add(e.getBoundingClientRect()); });
    stage.querySelectorAll('.o55-it[data-key]').forEach((e) => { if (!SET.test(e.getAttribute('data-key')) && !e.closest('.o55-out')) add(e.getBoundingClientRect(), soft); });
    document.querySelectorAll('.o55fx-banner[data-hang] .o55fx-bn-card').forEach((e) => add(e.getBoundingClientRect()));
    (Array.isArray(o.avoid) ? o.avoid : o.avoid ? [o.avoid] : []).forEach((a) => add(toRect(a)));
    const bar = stage.querySelector('.o55-nier-bar'), slab = stage.querySelector('.o55-nier-stage');
    const br = bar ? bar.getBoundingClientRect() : null, sr = slab ? slab.getBoundingClientRect() : null;
    const s = { l: S.left / z, t: S.top / z, r: S.right / z, b: S.bottom / z };
    /* the bar's line; on the narrow band the scene is cropped from the top and the bar lies above it: its lane is then
       the band's own top edge */
    const barY = br && br.height > 1 ? Math.max(br.bottom / z, s.t - 4) : s.t + (s.b - s.t) * 0.24;
    const lipY = sr && sr.height > 1 ? sr.top / z : s.b - (s.b - s.t) * 0.12;
    const w = size.w, h = size.h, PAD = 8;
    const all = { bar: { name: 'bar', top: Math.round(barY + 10) }, lip: { name: 'lip', top: Math.round(lipY - 8 - h) } };
    const order = o.lane === 'lip' ? ['lip', 'bar'] : o.lane === 'bar' ? ['bar'] : ['bar', 'lip'];
    if (o.lane === 'bar') order.push('lip');
    const lanes = order.map((k) => Object.assign({}, all[k], { left: s.l, right: s.r, bottom: all[k].top + h }));
    const span = s.r - s.l - 2 * PAD - w;
    const xs = [1, 0, 0.5, 0.75, 0.25].map((f) => s.l + PAD + span * f);
    let pick = null, best = null;
    lanes.forEach((ln, rank) => {
      if (ln.top < s.t + 2 || ln.bottom > s.b - 2) return;
      xs.forEach((x0) => {
        const x = Math.round(clamp(x0, s.l + 2, Math.max(s.l + 2, s.r - 2 - w)));
        const hard = overlap(x, ln.top, w, h, obs), cover = overlap(x, ln.top, w, h, soft);
        /* the lane's rank weighs as a 20 x 20 px patch: a later lane wins only by covering clearly less */
        const score = cover + rank * 400;
        if (!hard) { if (!pick || score < pick.score) pick = { lane: ln.name, x, y: ln.top, clear: true, cover: Math.round(cover), score }; }
        else if (!best || hard * 10 + cover < best.cost) best = { lane: ln.name, x, y: ln.top, clear: false, cost: hard * 10 + cover };
      });
    });
    if (!pick) pick = best || { lane: 'lip', x: Math.round(s.r - PAD - w), y: Math.round(clamp(lipY - 8 - h, s.t, s.b - h)), clear: false };
    return { stage: s, lanes, obstacles: obs, props: soft, pick };
  }

  /* where the Pod may stand: inside the onboarding window (it is a bounded modal), else the viewport */
  function podBounds(P) {
    const z = zoom(), win = P.host.id === 'pm-o55-onboarding' ? rectOf(P.host.querySelector('.o55-win')) : null;
    return win ? { l: win.left / z + 8, t: win.top / z + 8, r: win.right / z - 8, b: win.bottom / z - 8 } : { l: 8, t: 8, r: innerWidth / z - 8, b: innerHeight / z - 8 };
  }
  /* The Pod's size is measured once per line (its strip's words decide it), and every place is then judged from rects
     read in one batch: nothing is written between the reads, so the page lays out at most once. */
  function podPlace(P, first) {
    const n = P.node, z = zoom(), GAP = 12;
    let pick = null;
    if (P.stage) {
      /* the window's stage: one of the narrator's two lanes; the strip to the left of the Pod */
      if (n.dataset.side !== 'left') n.dataset.side = 'left';
      const size = P.size || (P.size = { w: n.offsetWidth, h: n.offsetHeight });
      const L = lanesOf(P.stage, size, { lane: P.lane, avoid: P.avoid });
      if (L) { pick = { side: 'left', x: L.pick.x, y: L.pick.y, clear: L.pick.clear, lane: L.pick.lane }; }
    }
    if (!pick) {
      const B = podBounds(P), ar = toRect(P.anchor);
      /* a side is possible when the Pod fits beside the anchor along that side's axis; along the other axis it tries
         centred on the anchor, then lined up with the anchor's start, then its end (each slid inside the bounds). The
         first spot that meets no reading text (the callout, the bar, the window's head) and covers no control wins;
         else the first possible side stands back (shy) */
      const size = P.size || (P.size = { w: n.offsetWidth, h: n.offsetHeight });
      const w = size.w, h = size.h;
      let last = null;
      const order = P.side ? [P.side, 'right', 'left', 'top', 'bottom'] : ['right', 'left', 'top', 'bottom'];
      const sides = ar ? order.filter((s, i) => order.indexOf(s) === i) : ['dock'];
      const obs = obstacles(P.anchor);
      const spots = [];
      for (const side of sides) {
        const a = ar ? { l: ar.left / z, t: ar.top / z, r: ar.right / z, b: ar.bottom / z, cx: (ar.left + ar.width / 2) / z, cy: (ar.top + ar.height / 2) / z } : null;
        let x, y, slide = [];
        if (side === 'right') { x = a.r + GAP; slide = [a.cy - h / 2, a.t, a.b - h]; }
        else if (side === 'left') { x = a.l - GAP - w; slide = [a.cy - h / 2, a.t, a.b - h]; }
        else if (side === 'bottom') { y = a.b + GAP; slide = [a.cx - w / 2, a.l, a.r - w]; }
        else if (side === 'top') { y = a.t - GAP - h; slide = [a.cx - w / 2, a.l, a.r - w]; }
        else { x = B.r - w - 10; y = B.b - h - (P.host.id === 'pm-o55-onboarding' ? 72 : 56); slide = [null]; }
        const across = side === 'left' || side === 'right';
        const fits = side === 'dock' || (across ? x >= B.l && x + w <= B.r : y >= B.t && y + h <= B.b);
        for (const v of slide) {
          let sx = x, sy = y;
          if (v != null) { if (across) sy = v; else sx = v; }
          sx = Math.round(clamp(sx, B.l, Math.max(B.l, B.r - w))); sy = Math.round(clamp(sy, B.t, Math.max(B.t, B.b - h)));
          const spot = { side, x: sx, y: sy, fits };
          if (!fits) { if (!last) last = spot; break; }
          spots.push(spot);
        }
      }
      /* the hit tests run after every rect is read (layout is clean by then) */
      for (const s of spots) {
        if (!pick) pick = s;
        if (!meets(s.x, s.y, w, h, obs) && !covers(s.x, s.y, w, h, P.anchor)) { pick = Object.assign({}, s, { clear: true }); break; }
      }
      /* nowhere beside it: the side with the most room, slid inside the bounds */
      if (!pick) pick = last || { side: 'dock', x: Math.round(B.l), y: Math.round(B.t) };
    }
    if (n.dataset.side !== pick.side) n.dataset.side = pick.side;
    if (pick.lane) n.dataset.lane = pick.lane; else delete n.dataset.lane;
    n.toggleAttribute('data-jump', !!first);
    n.style.transform = `translate(${pick.x}px, ${pick.y}px)`;
    /* nowhere clear: it stands back so what it would cover shows through (the 5.6 Pro Pod's shyness) */
    n.toggleAttribute('data-shy', !pick.clear);
    P.at = pick;
    return pick;
  }
  function podTurn(P) {
    if (still() || !P.node.isConnected) return;
    const side = P.node.dataset.side, body = P.node.querySelector('.o55fx-pod-body');
    const lean = side === 'right' ? -12 : side === 'left' ? 12 : 0, dx = side === 'right' ? -1 : side === 'left' ? 1 : 0, dy = side === 'bottom' ? -1 : side === 'top' ? 1 : -0.4;
    body.animate([{ transform: 'rotate(0deg) translate(0, 0)' }, { transform: `rotate(${lean}deg) translate(${dx * 2}px, -3px)`, offset: 0.22 },
      { transform: `rotate(${lean}deg) translate(${dx * 2}px, -3px)`, offset: 0.7 }, { transform: 'rotate(0deg) translate(0, 0)' }], { duration: 900, easing: 'steps(6, end)' });
    P.node.querySelectorAll('.o55fx-pod-sig').forEach((s, i) => {
      s.animate([{ transform: 'translate(0, 0)', opacity: 0 }, { opacity: 1, offset: 0.15 },
        { transform: `translate(${Math.round(dx * (26 + i * 14))}px, ${Math.round(dy * (22 + i * 12))}px)`, opacity: 0 }],
      { duration: 480, delay: 160 + i * 80, easing: 'steps(6, end)', fill: 'backwards' });
    });
  }
  /* the Pod leaves (now: in this frame); its promise resolves ok (false when its surface went before it had finished) */
  function podGo(host, now, ok) {
    const P = pods.get(host); if (!P) return;
    pods.delete(host);
    if (P.timer) P.timer.cancel();
    if (P.f) { followers.delete(P.f); unwire(); }
    if (P.unwatch) P.unwatch();
    if (P.typed) { const j = typeJobIn(P.node); if (j) j.stop(true); }
    const end = () => { drop(P.node); P.res(ok !== false); homeSync(); };
    if (now || still() || !P.node.isConnected || document.hidden) { end(); return; }
    const strip = P.node.querySelector('.o55fx-pod-strip'), unit = P.node.querySelector('.o55fx-pod-unit');
    strip.animate([{ transform: 'scaleY(1)', opacity: 1 }, { transform: 'scaleY(.04)', opacity: 1, offset: 0.7 }, { transform: 'scaleY(.04)', opacity: 0 }], { duration: 180, easing: 'steps(3, end)', fill: 'forwards' });
    let a;
    const back = P.home && P.home.isConnected ? P.home.getBoundingClientRect() : null;
    if (back && back.width > 4 && P.node.getAttribute('data-unit') != null) {
      /* back to its place, where the resting Pod takes over */
      const u = unit.getBoundingClientRect(), z = zoom();
      a = unit.animate([{ translate: '0px 0px' }, { translate: `${Math.round((back.left - u.left) / z)}px ${Math.round((back.top - u.top) / z)}px` }], { duration: 360, delay: 120, easing: 'steps(6, end)', fill: 'forwards' });
    } else {
      /* a small element's flicker out: the step easing on each keyframe */
      a = unit.animate([{ opacity: 1, offset: 0, easing: 'step-end' }, { opacity: 0.2, offset: 0.4, easing: 'step-end' }, { opacity: 0.7, offset: 0.6, easing: 'step-end' }, { opacity: 0, offset: 1 }],
        { duration: 220, delay: 80, fill: 'forwards' });
    }
    ended(a).then(end);
  }
  function podSay(text, o) {
    o = o || {};
    const unitOn = has('pod'), voice = has('voice');
    let words = String(text == null ? '' : text).trim();
    if ((!unitOn && !voice) || !words || document.hidden) return no();
    if (o.anchor && o.anchor.nodeType === 1) { const r = o.anchor.closest(ROOTS); if (r && closing(r)) return no(); }
    const stage = o.stage && o.stage.nodeType === 1 && o.stage.isConnected ? o.stage : null;
    let lead = o.lead ? String(o.lead).replace(/:$/, '').toLowerCase() : '';
    const m = /^(report|proposal|alert|query|analysis)\s*:\s*/i.exec(words);
    if (m) { if (!lead) lead = m[1].toLowerCase(); words = words.slice(m[0].length); }
    if (LEADS.indexOf(lead) < 0) lead = 'report';
    const anchor = o.anchor || null;
    const host = flyHost(o, stage || anchor);
    const ms = clamp(Number(o.ms) || 1700 + words.length * 45, 1600, 12000);
    quiet(900);
    let P = pods.get(host);
    const fresh = !P;
    if (P) {
      if (P.timer) P.timer.cancel();
      if (P.f) { followers.delete(P.f); unwire(); P.f = null; }
      const j = typeJobIn(P.node); if (j) j.stop(true);
      P.res(true);
    } else {
      const node = document.createElement('div');
      node.className = 'o55fx-pod';
      node.innerHTML = `<div class="o55fx-pod-unit"><div class="o55fx-pod-shadow">${FX.podSvg('o55fx-pod', { part: 'shadow' })}</div><div class="o55fx-pod-bob"><div class="o55fx-pod-body">${FX.podSvg('o55fx-pod')}</div></div>`
        + '<i class="o55fx-pod-sig"></i><i class="o55fx-pod-sig"></i><i class="o55fx-pod-sig"></i></div>'
        + `<div class="o55fx-pod-strip"><div class="o55fx-pod-head"><i></i><i></i><i></i><span>${esc(T('pod.name'))}</span></div><p class="o55fx-pod-text"><b></b><span></span></p></div>`;
      /* read where it comes from before anything is written */
      const from = unitOn ? home(host) : null;
      layerOf(host).appendChild(node);
      P = { host, node, from: from ? from.r : null, home: from ? from.el : (host.id === 'pm-o55-onboarding' ? host.querySelector(RESTING) : document.getElementById('o55np-pod')) };
      pods.set(host, P);
      homeSync();
      /* its surface going (the window closing, the tour ending) sends it away at once, resolving false */
      P.unwatch = flyWatch(host, () => podGo(host, true, false));
    }
    const node = P.node;
    node.toggleAttribute('data-unit', unitOn);
    node.toggleAttribute('data-voice', voice);
    node.setAttribute('data-lead', lead);
    node.querySelector('.o55fx-pod-text > b').textContent = voice ? T('pod.leads.' + lead) : '';
    const span = node.querySelector('.o55fx-pod-text > span'), strip = node.querySelector('.o55fx-pod-strip');
    span.textContent = words;
    P.size = null; P.anchor = anchor; P.side = o.side || null; P.stage = stage; P.lane = o.lane || null; P.avoid = o.avoid || null;
    /* a short stage (the 760 px band): a compact strip, one or two lines without the name band, beside a smaller Pod,
       so it fits over the units' heads */
    const sr = stage ? rectOf(stage) : null, compact = !!(sr && sr.height / zoom() < 260);
    node.toggleAttribute('data-compact', compact);
    if (compact) node.style.setProperty('--o55fx-pod-max', `${Math.max(220, Math.round(sr.width / zoom() - 96))}px`); else node.style.removeProperty('--o55fx-pod-max');
    const p = new Promise((r) => { P.res = r; });
    let placed = false;
    if (!stage && anchor && anchor.nodeType === 1) P.f = follow(anchor, node, host, () => { podPlace(P, fresh && !placed); placed = true; }, () => podGo(host, false), { now: true });
    if (!placed) podPlace(P, fresh);
    const side = node.dataset.side;
    if (!still()) {
      const stripDelay = fresh ? (P.from ? 300 : 90) : 0;
      if (fresh) {
        const unit = node.querySelector('.o55fx-pod-unit');
        if (P.from) {
          /* out from its resting place to where it speaks (read once, after the placement's own reads) */
          const u = unit.getBoundingClientRect(), z = zoom();
          unit.animate([{ translate: `${Math.round((P.from.left - u.left) / z)}px ${Math.round((P.from.top - u.top) / z)}px` }, { translate: '0px 0px' }], { duration: 360, easing: 'steps(6, end)' });
        } else {
          const dx = side === 'left' ? -10 : side === 'right' ? 10 : 0, dy = side === 'top' ? -8 : side === 'bottom' ? 8 : 0;
          unit.animate([{ translate: `${dx}px ${dy}px`, opacity: 0 }, { translate: '0px 0px', opacity: 1 }], { duration: 200, easing: 'steps(4, end)' });
        }
      }
      /* it opens from a line; the small strip blinks once as it lands (a wide compact one never blinks: rule 3) */
      const blink = node.hasAttribute('data-compact') ? [] : [{ transform: 'scaleY(1)', opacity: 0.4, offset: 0.88, easing: 'step-end' }];
      strip.animate([{ transform: 'scaleY(.04)', opacity: 0, offset: 0, easing: 'step-end' }, { transform: 'scaleY(.04)', opacity: 1, offset: 0.25, easing: 'steps(4, end)' },
        { transform: 'scaleY(1)', opacity: 1, offset: 0.8, easing: 'step-end' }, ...blink, { transform: 'scaleY(1)', opacity: 1, offset: 1 }],
      { duration: 280, delay: stripDelay, fill: 'backwards' });
      /* the words type on once the strip is open (their layout is the final one from the first frame) */
      P.typed = true;
      FX.type(span, { text: words, part: null, delay: stripDelay + 240 });
      podTurn(P);
    }
    if (o.sound !== false) play(typeof o.sound === 'string' ? o.sound : 'pod');
    if (o.announce) U.announce((voice ? T('pod.leads.' + lead) + ' ' : '') + words, host === document.body ? null : host);
    P.timer = M.after(ms, () => { if (pods.get(host) === P) podGo(host, false); });
    return p;
  }
  FX.pod = {
    say: podSay,
    /* the lanes of a stage for a strip of size { w, h } (the default: the window's usual strip) */
    lanes(stage, o) {
      o = o || {};
      return stage ? lanesOf(stage, { w: o.w || 352, h: o.h || 76 }, o) : null;
    },
    /* the Pod's signal: it turns toward its anchor and sends three signals, with its chirp. A sound never plays
       without something to see: with none of our Pods out it is the app's corner Pod (#o55np-pod, the tour and the
       app) that turns; with neither on screen it is silent and returns false. */
    chirp() {
      if (!has('pod') && !has('voice')) return false;
      if (pods.size) { pods.forEach((P) => podTurn(P)); play('pod'); return true; }
      const at = has('pod') ? home(null) : null;
      const body = at && at.el.querySelector('.o55np-pod-body');
      if (!body || typeof body.animate !== 'function') return false;
      if (!still()) {
        body.animate([{ transform: 'rotate(0deg) translate(0, 0)' }, { transform: 'rotate(-12deg) translate(-2px, -3px)', offset: 0.22 },
          { transform: 'rotate(-12deg) translate(-2px, -3px)', offset: 0.7 }, { transform: 'rotate(0deg) translate(0, 0)' }], { duration: 900, easing: 'steps(6, end)' });
      }
      play('pod');
      return true;
    },
    /* hush(): every Pod leaves as it does at its end; hush(true): in this frame (a screen or the window closing) */
    hush(now) { Array.from(pods.keys()).forEach((h) => podGo(h, !!now)); }
  };

  /* ================================================================== quest banner */
  /* A wide ink band across its span: it draws as a line, opens in steps, its words come on in two steps and the title
     types on, it holds, and it folds back to a line. Kicker words: copy nierFx.banner.kickers.* (Goal updated by
     default). Its height follows its words (a long title takes two lines at a narrow width). Its span is within's box,
     else the onboarding window's box (never the page), else the viewport. Where it stands: opts.at (a fraction of the
     span's height, 0 top .. 1 bottom); else the first of 30 % (23 % in the tour), 62 %, 50 % and 80 % of the span
     where it covers neither the tour's callout nor its bar, nor the window's heading block. */
  const banners = new Map();
  function spanOf(host, within) {
    const z = zoom();
    const w = within && within.nodeType === 1 && within !== document.body && within !== html ? within : null;
    const el = w || (host.id === 'pm-o55-onboarding' ? host.querySelector('.o55-win') : null);
    const r = el ? rectOf(el) : null;
    return r ? { top: r.top / z, height: r.height / z, left: r.left / z, width: r.width / z }
      : { top: 0, height: innerHeight / z, left: 0, width: innerWidth / z };
  }
  /* the top of a band h tall in span s: the first place that covers neither the tour's callout nor its bar, nor the
     onboarding screen's heading block (its eyebrow, title and lead) */
  const HEADING = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) :is(.o55-eyebrow, .o55-title, .o55-lead)';
  function bandTop(s, h, ats) {
    const z = zoom(), obs = [];
    document.querySelectorAll('#pm-o55-tour .o55t-callout, #pm-o55-tour .o55t-bar').forEach((e) => {
      if (closing(e.closest(ROOTS))) return;
      const r = e.getBoundingClientRect();
      if (r.width >= 2 && r.height >= 2) obs.push({ l: r.left / z, t: r.top / z, r: r.right / z, b: r.bottom / z });
    });
    const onb = document.getElementById('pm-o55-onboarding');
    let hb = null;
    if (onb && !closing(onb)) {
      onb.querySelectorAll(HEADING).forEach((e) => {
        const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
        hb = hb ? { l: Math.min(hb.l, r.left / z), t: Math.min(hb.t, r.top / z), r: Math.max(hb.r, r.right / z), b: Math.max(hb.b, r.bottom / z) } : { l: r.left / z, t: r.top / z, r: r.right / z, b: r.bottom / z };
      });
      if (hb) obs.push(hb);
    }
    const at = (f) => Math.round(clamp(s.top + s.height * f - h / 2, s.top + 4, Math.max(s.top + 4, s.top + s.height - h - 4)));
    for (const f of ats) { const t = at(f); if (!meets(s.left, t, s.width, h, obs)) return t; }
    /* every place meets something: at least never the heading the person is reading */
    if (hb) for (const f of ats.concat([0.85, 0.15])) { const t = at(f); if (!meets(s.left, t, s.width, h, [hb])) return t; }
    return at(ats[0]);
  }
  const bannerCopy = (kicker, title, sub) => '<div class="o55fx-bn-band"></div><div class="o55fx-bn-copy"><span class="o55fx-bn-mark"></span>'
    + `<span class="o55fx-bn-kicker"><i></i><i></i><i></i><span>${esc(kicker)}</span></span><span class="o55fx-bn-title">${esc(title)}</span>`
    + (sub ? `<span class="o55fx-bn-sub">${esc(sub)}</span>` : '') + '</div>';
  FX.banner = function banner(o) {
    o = o || {};
    const title = String(o.title == null ? '' : o.title);
    if (!has('quests') || !title || document.hidden) return no();
    let host = flyHost(o, o.within);
    const prev = banners.get(host); if (prev) prev(true);
    const L = layerOf(host), s = spanOf(host, o.within);
    const ms = clamp(Number(o.ms) || 1800, 900, 8000);
    const kicker = o.kicker != null ? String(o.kicker) : T('banner.kickers.goalUpdated');
    const hang = !!o.hang;
    const inset = clamp(Number(o.inset) || 0, 0, 0.4);
    const el = document.createElement('div');
    el.className = 'o55fx-banner';
    let card = el, band, copy, strs = [];
    if (hang) {
      /* the span is the clip: the strings hang from its top edge and the card never leaves it */
      el.setAttribute('data-hang', '');
      el.style.cssText = `left:${Math.round(s.left)}px;top:${Math.round(s.top)}px;width:${Math.round(s.width)}px;height:${Math.round(s.height)}px`;
      const cw = Math.round(s.width * (1 - 2 * inset)), cx = Math.round(s.width * inset);
      el.innerHTML = '<i class="o55fx-bn-str"></i><i class="o55fx-bn-str"></i>'
        + `<div class="o55fx-bn-card" style="left:${cx}px;width:${cw}px;top:0">${bannerCopy(kicker, title, o.sub)}<i class="o55fx-bn-knot"></i><i class="o55fx-bn-knot"></i></div>`;
      card = el.querySelector('.o55fx-bn-card');
      strs = Array.from(el.querySelectorAll('.o55fx-bn-str'));
      strs.forEach((t, i) => { t.style.left = `${cx + Math.round(cw * (i ? 0.78 : 0.22))}px`; });
      card.querySelectorAll('.o55fx-bn-knot').forEach((k, i) => { k.style.left = `${Math.round(cw * (i ? 0.78 : 0.22))}px`; });
      /* a short stage (the 760 px band) takes the compact card: no sub line */
      if (s.height < 260) card.setAttribute('data-compact', '');
    } else {
      el.style.cssText = `left:${Math.round(s.left)}px;width:${Math.round(s.width)}px;top:0`;
      el.innerHTML = bannerCopy(kicker, title, o.sub);
    }
    L.appendChild(el);
    band = card.querySelector('.o55fx-bn-band'); copy = card.querySelector('.o55fx-bn-copy');
    const titleEl = copy.querySelector('.o55fx-bn-title'), mark = copy.querySelector('.o55fx-bn-mark');
    let H = card.offsetHeight || 96;
    if (hang && !card.hasAttribute('data-compact') && H > s.height * 0.62) { card.setAttribute('data-compact', ''); H = card.offsetHeight || H; }
    let top;
    if (hang) {
      /* at: where its centre hangs; else the first place clear of the tour's callout and bar (a stage: 36 %) */
      if (Number.isFinite(o.at)) top = Math.round(clamp(s.height * clamp(o.at, 0, 1) - H / 2, 6, Math.max(6, s.height - H - 4)));
      else top = Math.max(6, bandTop(s, H, host.id === 'pm-o55-tour' && (!o.within || o.within === host) ? [0.23, 0.62, 0.5, 0.8] : [0.36, 0.62, 0.5, 0.8]) - Math.round(s.top));
      card.style.top = `${top}px`;
      strs.forEach((t) => { t.style.height = `${top}px`; });
    } else {
      const ats = Number.isFinite(o.at) ? [clamp(o.at, 0, 1)] : [host.id === 'pm-o55-tour' ? 0.23 : 0.3, 0.62, 0.5, 0.8];
      el.style.top = `${bandTop(s, H, ats)}px`;
    }
    quiet(ms + 400);
    let res, timer = null, gone = false, landed = false;
    const anims = [];
    const p = new Promise((r) => { res = r; });
    const end = () => { if (gone) return; gone = true; if (timer) timer.cancel(); unwatch(); finish(job); if (banners.get(host) === stop) banners.delete(host); const j = typeJobIn(titleEl); if (j) j.stop(true); drop(el); res(true); };
    const land = () => {
      if (landed || gone) return; landed = true;
      if (typeof o.onLand === 'function') { try { o.onLand(); } catch (_) { /* the caller's beat never stops the card */ } }
    };
    function stop(now) {
      if (gone) return;
      if (now || still() || !el.isConnected) { land(); end(); return; }
      if (timer) { timer.cancel(); timer = null; }
      anims.forEach((a) => { try { a.finish(); } catch (_) {} });
      land();
      let a;
      if (hang) {
        /* hauled up in 5 steps, the strings retracting with it */
        const up = -(top + H + 8);
        a = card.animate([{ transform: 'translateY(0px)' }, { transform: `translateY(${up}px)` }], { duration: 260, easing: 'steps(5, end)', fill: 'forwards' });
        strs.forEach((t) => t.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 260, easing: 'steps(5, end)', fill: 'forwards' }));
      } else {
        copy.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'steps(3, end)', fill: 'forwards' });
        a = band.animate([{ transform: 'scaleY(1)', opacity: 1, offset: 0, easing: 'steps(3, end)' }, { transform: 'scaleY(.012)', opacity: 1, offset: 0.75, easing: 'step-end' }, { transform: 'scaleY(.012)', opacity: 0, offset: 1 }],
          { duration: 260, delay: 80, fill: 'forwards' });
      }
      ended(a).then(end);
    }
    const job = run(host, () => stop(true), () => { anims.forEach((a) => { try { a.finish(); } catch (_) {} }); });
    banners.set(host, stop);
    /* its surface going (setup handing over to the tour): it carries on in the page layer, in the same place */
    const unwatch = flyWatch(host, () => {
      if (gone) return;
      if (banners.get(host) === stop) banners.delete(host);
      const there = banners.get(document.body); if (there) there(true);
      host = job.host = document.body; banners.set(host, stop);
      toPage(el);
    });
    let landAt = 0;
    if (!still()) {
      if (hang) {
        /* the strings come down first (3 steps), then the card is lowered onto them (6 steps), lands on the knots and
           settles 4 px in 2 steps; the landing frame is the one onLand gets */
        const STR = 90, DROP = 230, SETTLE = 80;
        landAt = STR + DROP;
        strs.forEach((t) => anims.push(t.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: STR, easing: 'steps(3, end)', fill: 'backwards' })));
        const descent = card.animate([{ transform: `translateY(${-(top + H + 8)}px)` }, { transform: 'translateY(0px)' }], { duration: DROP, delay: STR, easing: 'steps(6, end)', fill: 'backwards' });
        anims.push(descent);
        anims.push(card.animate([{ translate: '0px 0px' }, { translate: '0px 4px', offset: 0.5 }, { translate: '0px 0px' }], { duration: SETTLE, delay: landAt, easing: 'steps(2, end)' }));
        strs.forEach((t) => anims.push(t.animate([{ scale: '1 1' }, { scale: `1 ${((top + 4) / Math.max(1, top)).toFixed(4)}`, offset: 0.5 }, { scale: '1 1' }], { duration: SETTLE, delay: landAt, easing: 'steps(2, end)' })));
        /* it hangs: one 0.6 degree tilt step as the strings settle, and back */
        anims.push(card.animate([{ rotate: '0deg' }, { rotate: '0.6deg', offset: 0.5 }, { rotate: '0deg' }], { duration: 220, delay: landAt + 540, easing: 'steps(2, end)' }));
        ended(descent).then(() => land());
        FX.type(titleEl, { text: title, part: null, delay: landAt + 40 });
      } else {
        anims.push(band.animate([{ transform: 'scale(0, .012)', offset: 0, easing: 'steps(3, end)' }, { transform: 'scale(1, .012)', offset: 0.4, easing: 'steps(4, end)' }, { transform: 'scale(1, 1)', offset: 1 }],
          { duration: 300, fill: 'backwards' }));
        /* the words come on one way, in two steps (a wide element never flickers) */
        anims.push(copy.animate([{ opacity: 0, offset: 0, easing: 'step-end' }, { opacity: 0.5, offset: 0.5, easing: 'step-end' }, { opacity: 1, offset: 1 }],
          { duration: 120, delay: 240, fill: 'backwards' }));
        anims.push(mark.animate([{ transform: 'rotate(-45deg) scale(.4)' }, { transform: 'rotate(45deg) scale(1)' }], { duration: 240, delay: 240, easing: 'steps(3, end)', fill: 'backwards' }));
        FX.type(titleEl, { text: title, part: null, delay: 300 });
      }
    } else land();
    if (o.sound !== false) play(typeof o.sound === 'string' ? o.sound : 'quest');
    if (o.announce) U.announce([kicker, title, o.sub].filter(Boolean).join('. '), host === document.body ? null : host);
    timer = M.after(Math.max(landAt + 500, ms - (hang ? 260 : 340)), () => { timer = null; stop(false); });
    return p;
  };

  /* ================================================================== reboot band */
  /* An ink band across its span (the onboarding window, within's box, or the viewport): a line draws across and opens,
     the kicker (small squares, the unit's name, a rule) shows, the status line types on behind a block caret while a
     row of thirty-two ticks fills in steps, OK lands, and the band folds back to its line, which retracts (one way:
     never a flicker of a wide surface). A key or a press anywhere ends it at once (it never takes the press).
     band(text, ms?, opts?) or band(text, opts) with opts.ms. */
  const bands = new Map();
  FX.band = function band(text, ms, o) {
    if (ms && typeof ms === 'object') { o = ms; ms = o.ms; }
    o = o || {};
    const words = String(text == null ? '' : text).trim();
    if (!has('reboot') || !words || still() || document.hidden) return no();
    let host = flyHost(o, o.within);
    const prev = bands.get(host); if (prev) prev(true);
    const L = layerOf(host), s = spanOf(host, o.within);
    const total = clamp(Number(ms) || 1500, 900, 6000), H = 108;
    quiet(total + 400);
    const el = document.createElement('div');
    el.className = 'o55fx-band';
    el.style.cssText = `left:${Math.round(s.left)}px;width:${Math.round(s.width)}px;top:${Math.round(s.top + s.height / 2 - H / 2)}px;height:${H}px`;
    el.innerHTML = '<div class="o55fx-bd-band"></div><div class="o55fx-bd-copy">'
      + `<div class="o55fx-bd-kicker"><i></i><i></i><i></i><span>${esc(o.kicker != null ? o.kicker : T('band.kicker'))}</span></div>`
      + `<div class="o55fx-bd-line"><span class="o55fx-bd-text"></span><i class="o55fx-bd-caret"></i><b class="o55fx-bd-ok">${esc(T('band.ok'))}</b></div>`
      + '<div class="o55fx-bd-ticks"><span class="o55fx-bd-empty"></span><span class="o55fx-bd-fill"><span></span></span></div></div>';
    L.appendChild(el);
    const bandEl = el.firstElementChild, copy = el.lastElementChild, out = el.querySelector('.o55fx-bd-text');
    const fill = el.querySelector('.o55fx-bd-fill'), fillIn = fill.firstElementChild;
    let res, gone = false, leaving = false;
    const timers = [];
    const later = (t, fn) => { const h = M.after(t, () => { if (!gone) fn(); }); timers.push(h); return h; };
    const p = new Promise((r) => { res = r; });
    const skip = () => stop(true);
    const end = () => {
      if (gone) return; gone = true;
      timers.forEach((t) => t.cancel());
      unwatch();
      document.removeEventListener('keydown', skip, true); document.removeEventListener('pointerdown', skip, true);
      finish(job); if (bands.get(host) === stop) bands.delete(host);
      drop(el); res(true);
    };
    function stop(now) {
      if (gone || leaving) { if (now) end(); return; }
      leaving = true;
      if (now || !el.isConnected) { end(); return; }
      /* it folds away: the words go in two steps, the band closes to its centre line in three, the line retracts */
      copy.animate([{ opacity: 1, offset: 0, easing: 'step-end' }, { opacity: 0.5, offset: 0.5, easing: 'step-end' }, { opacity: 0, offset: 1 }], { duration: 80, fill: 'forwards' });
      const a = bandEl.animate([{ transform: 'scale(1, 1)', offset: 0, easing: 'steps(3, end)' }, { transform: 'scale(1, .01)', offset: 0.55, easing: 'steps(3, end)' }, { transform: 'scale(0, .01)', offset: 1 }],
        { duration: 300, delay: 40, fill: 'forwards' });
      ended(a).then(end);
    }
    const job = run(host, () => stop(true));
    bands.set(host, stop);
    /* its surface going (setup handing over to the tour): it carries on in the page layer, in the same place, and
       resolves at its normal end */
    const unwatch = flyWatch(host, () => {
      if (gone) return;
      if (bands.get(host) === stop) bands.delete(host);
      const there = bands.get(document.body); if (there) there(true);
      host = job.host = document.body; bands.set(host, stop);
      toPage(el);
    });
    document.addEventListener('keydown', skip, true); document.addEventListener('pointerdown', skip, true);
    /* timeline: line + open 280 ms, typing to 55 %, ticks from 300 ms to 82 %, OK at 84 %, the fold in the last 340 ms */
    const openMs = 280, outMs = 340, tickMs = Math.max(320, total * 0.82 - openMs), typeMs = Math.max(180, total * 0.55 - openMs);
    bandEl.animate([{ transform: 'scale(0, .01)', offset: 0, easing: 'steps(4, end)' }, { transform: 'scale(1, .01)', offset: 0.5, easing: 'steps(3, end)' }, { transform: 'scale(1, 1)', offset: 1 }],
      { duration: openMs, fill: 'backwards' });
    copy.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: openMs - 40, fill: 'backwards' });
    fill.animate([{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }], { duration: tickMs, delay: openMs, easing: 'steps(32, end)', fill: 'both' });
    fillIn.animate([{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], { duration: tickMs, delay: openMs, easing: 'steps(32, end)', fill: 'both' });
    const per = clamp(typeMs / words.length, 14, 42);
    let k = 0;
    const type = () => { k++; out.textContent = words.slice(0, k); if (k < words.length) later(per, type); else el.setAttribute('data-typed', ''); };
    later(openMs, type);
    later(openMs + tickMs, () => el.setAttribute('data-ok', ''));
    later(total - outMs, () => stop(false));
    if (o.sound !== false) play(typeof o.sound === 'string' ? o.sound : 'reboot');
    return p;
  };

  /* ================================================================== boot log */
  /* Drawn in the surface's effects layer over host (the window's pane, whose content is held meanwhile) at its padding
     box, or at opts.at (an element or a rect: the title's place). Every line, its paper block and its stamp, and the
     meter are Web Animations created here with their delays, so the log runs on the compositor through a long frame.
     Line i's stamp lands at delay + lineMs * (i + 1); its paper block (with an ink block caret on its leading edge)
     steps across the line in 8 steps during the 80 % before that. A slot is kept free under the lines for hold(), so
     a held line never moves the meter. Slint: Rectangles (the blocks) whose x animates in floor(t * 8) / 8 steps. */
  FX.bootlog = function bootlog(host, lines, o) {
    o = o || {};
    const list = (Array.isArray(lines) ? lines : []).map((l) => (typeof l === 'string' ? { text: l } : l || {})).filter((l) => l.text);
    const nil = { el: null, stamps: list.map(() => no()), done: no(), hold: () => ({ cancel() {} }), close: () => no(), snap() {}, cancel() {} };
    if (!host || host.nodeType !== 1 || !list.length || !gate(o.part, 'boot') || still() || document.hidden) return nil;
    const at = toRect(o.at || host); if (!at) return nil;
    const surface = hostOf(host), L = layerOf(surface), z = zoom();
    const lineMs = clamp(Number(o.lineMs) || 210, 90, 900), cells = clamp(Math.round(Number(o.meterCells) || 16), 4, 40);
    const delay = Math.max(0, Number(o.delay) || 0);
    /* reads first: the place (host's padding box, or at), the ground the paper blocks are cut from */
    let left = at.left, top = at.top, width = at.width;
    if (!o.at) {
      const cs = getComputedStyle(host), pl = parseFloat(cs.paddingLeft) || 0, pr = parseFloat(cs.paddingRight) || 0, pt = parseFloat(cs.paddingTop) || 0;
      left += pl * z; top += pt * z; width -= (pl + pr) * z;
    }
    width = Math.min(width, (Number(o.maxWidth) || 560) * z);
    const ground = o.ground || groundOf(host);
    const kick = o.kicker != null ? String(o.kicker) : T('log.kicker');
    const el = document.createElement('div');
    el.className = 'o55fx-log';
    el.style.cssText = `left:${Math.round(left / z)}px;top:${Math.round(top / z)}px;width:${Math.round(width / z)}px;--o55fx-cells:${cells}`;
    if (ground) el.style.setProperty('--o55fx-ground', ground);
    el.innerHTML = `<div class="o55fx-log-body"><div class="o55fx-log-kick"><i></i><i></i><i></i><span>${esc(kick)}</span><i class="o55fx-log-mask"></i></div>`
      + '<ol class="o55fx-log-lines">'
      + list.map((l) => `<li class="o55fx-log-ln"><span class="o55fx-log-tx">${esc(l.text)}</span><span class="o55fx-log-ld"></span>`
        + `<b class="o55fx-log-st">${esc(l.stamp != null ? l.stamp : T('log.ok'))}</b><i class="o55fx-log-mask"></i></li>`).join('')
      + '<li class="o55fx-log-ln o55fx-log-slot"><span class="o55fx-log-tx"></span><i class="o55fx-log-caret"></i></li></ol>'
      + '<div class="o55fx-log-meter"><span class="o55fx-log-cells"></span><span class="o55fx-log-fill"><span></span></span></div></div>'
      + '<i class="o55fx-log-rule"></i>';
    L.appendChild(el);
    const body = el.firstElementChild, rule = el.lastElementChild, slot = el.querySelector('.o55fx-log-slot');
    const rows = Array.from(el.querySelectorAll('.o55fx-log-ln:not(.o55fx-log-slot)'));
    const anims = [];
    const kickRev = Math.min(140, lineMs * 0.66), rev = lineMs * 0.8;
    const stampAt = (i) => delay + lineMs * (i + 1);
    const lastAt = stampAt(list.length - 1);
    quiet(lastAt + 1200);
    /* the kicker, then each line: the paper block steps off to the right in 8 steps, its caret leading */
    const reveal = (mask, start, dur, n) => mask.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(101%)' }], { duration: dur, delay: start, easing: `steps(${n}, end)`, fill: 'both' });
    anims.push(reveal(el.querySelector('.o55fx-log-kick > .o55fx-log-mask'), delay, kickRev, 4));
    let gone = false, held = null, hushed = false;
    const stamps = rows.map((row, i) => {
      const mask = reveal(row.querySelector('.o55fx-log-mask'), stampAt(i) - rev, rev, 8);
      anims.push(mask);
      /* the stamp blinks in on its frame (a small element: two quick steps, the step easing on each keyframe) */
      anims.push(row.querySelector('.o55fx-log-st').animate([{ opacity: 1, offset: 0, easing: 'step-end' }, { opacity: 0, offset: 0.34, easing: 'step-end' }, { opacity: 1, offset: 0.67 }, { opacity: 1, offset: 1 }],
        { duration: 90, delay: stampAt(i), fill: 'both' }));
      /* its tick on the frame the stamp shows; stamps snapped to their end all at once make no sound */
      return ended(mask).then((ok) => { if (ok && !hushed && o.sound !== false && el.isConnected) play(typeof o.sound === 'string' ? o.sound : 'move'); return ok; });
    });
    /* the meter fills from the first line's block to the last stamp */
    const mFrom = stampAt(0) - rev, mDur = Math.max(120, lastAt - mFrom);
    const mf = el.querySelector('.o55fx-log-fill');
    anims.push(mf.animate([{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }], { duration: mDur, delay: mFrom, easing: `steps(${cells}, end)`, fill: 'both' }));
    anims.push(mf.firstElementChild.animate([{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], { duration: mDur, delay: mFrom, easing: `steps(${cells}, end)`, fill: 'both' }));
    const done = Promise.all(stamps).then((r) => r.every(Boolean));
    const t0 = M.now();
    function holdOff() { if (!held) return; held.anims.forEach((a) => a.cancel()); slot.removeAttribute('data-on'); slot.querySelector('.o55fx-log-tx').textContent = ''; held = null; }
    const finishAll = () => { hushed = true; anims.forEach((a) => { try { a.finish(); } catch (_) {} }); };
    const api = {
      el, stamps, done,
      /* hold(text, { at }): the slot under the lines reads text behind a blinking caret, from `at` ms after the log
         began (created now with its delay, so it shows through a long frame) or at once */
      hold(text, ho) {
        ho = ho || {};
        if (gone) return { cancel() {} };
        holdOff();
        slot.querySelector('.o55fx-log-tx').textContent = String(text || '');
        slot.setAttribute('data-on', '');
        const wait = Number.isFinite(ho.at) ? Math.max(0, ho.at - (M.now() - t0)) : 0;
        const h = { anims: [slot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: wait, fill: 'both' })] };
        slot.style.setProperty('--o55fx-hold-delay', `${Math.round(wait)}ms`);
        held = h;
        return { cancel() { if (held === h) holdOff(); } };
      },
      /* close({ to }): the lines fold down onto the underline in 3 steps, then the underline slides in 4 steps onto
         `to` (the eyebrow rule: an element or a rect; edge 'middle' for a hairline, 'bottom', or 'top'), and the log
         goes on the frame after it lands */
      close(co) {
        co = co || {};
        if (gone) return no();
        holdOff();
        finishAll();
        const t = toRect(co.to), rr = rule.getBoundingClientRect();
        const fold = body.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 120, easing: 'steps(3, end)', fill: 'forwards' });
        quiet(800);
        let slide = null;
        if (t && rr.width > 1) {
          const edge = co.edge || (t.height <= 6 ? 'middle' : 'bottom');
          const ty = edge === 'top' ? t.top : edge === 'bottom' ? t.bottom - 1 : t.top + t.height / 2 - 0.5;
          slide = rule.animate([{ transform: 'translate(0px, 0px) scaleX(1)' }, { transform: `translate(${Math.round((t.left - rr.left) / z)}px, ${Math.round((ty - rr.top) / z)}px) scaleX(${(t.width / rr.width).toFixed(4)})` }],
            { duration: 160, delay: 120, easing: 'steps(4, end)', fill: 'forwards' });
        } else {
          slide = rule.animate([{ transform: 'scaleX(1)', opacity: 1 }, { transform: 'scaleX(0)', opacity: 1 }], { duration: 120, delay: 120, easing: 'steps(3, end)', fill: 'forwards' });
        }
        const ok = Promise.all([ended(fold), ended(slide)]).then((r) => r[1]);
        return ok.then((v) => { if (!gone) { gone = true; finish(entry); M.release(() => drop(el)); } return v; });
      },
      /* a key or a press: every line, stamp and the meter jump to their end (stamps resolve now, without ticks) */
      snap() { if (!gone) finishAll(); },
      cancel() { if (gone) return; gone = true; hushed = true; holdOff(); anims.forEach((a) => { try { a.cancel(); } catch (_) {} }); finish(entry); drop(el); }
    };
    const entry = run(surface, () => api.cancel(), () => api.snap());
    return api;
  };

  /* ================================================================== teardown */
  /* snap(host?): words being typed or decoded, logs, slices, wipes and lines jump to their end state (a key or a press
     during a performance). Banners and Pods keep their time. */
  FX.snap = function snap(host) {
    Array.from(running).forEach((e) => { if ((!host || e.host === host) && e.snap) { try { e.snap(); } catch (_) {} } });
  };
  /* clear(host?): stop every effect (in host, or everywhere) and send every follower and Pod away now */
  FX.clear = function clear(host) {
    const mine = (h) => !host || h === host;
    Array.from(running).forEach((e) => { if (mine(e.host)) { try { e.stop(); } catch (_) {} } });
    Array.from(locks.entries()).forEach(([el, it]) => { if (mine(it.f && it.f.host)) { followers.delete(it.f); locks.delete(el); drop(it.node); } });
    unwire();
    Array.from(cursors.keys()).forEach((h) => { if (mine(h)) cursorOff(h); });
    Array.from(pods.keys()).forEach((h) => { if (mine(h)) podGo(h, true); });
    Array.from(banners.keys()).forEach((h) => { if (mine(h)) banners.get(h)(true); });
    Array.from(bands.keys()).forEach((h) => { if (mine(h)) bands.get(h)(true); });
    if (!host) { Array.from(folds.keys()).forEach(unfoldNow); document.querySelectorAll('.o55fx-line').forEach(lineDrop); }
    document.querySelectorAll('.o55fx-layer').forEach((L) => { if (mine(L.parentElement)) prune(L); });
  };
  /* NieR Mode off, or a part removed: what that part drew goes */
  function onNier() {
    if (!painted()) { FX.clear(); return; }
    if (!has('brackets')) Array.from(locks.values()).forEach((it) => it.release());
    if (!has('cursor')) Array.from(cursors.keys()).forEach(cursorOff);
    if (!has('pod') && !has('voice')) FX.pod.hush();
    if (!has('quests')) Array.from(banners.values()).forEach((s) => s(true));
    if (!has('reboot')) Array.from(bands.values()).forEach((s) => s(true));
  }
  /* the painted attributes are the truth (the onboarding preview paints them as well): watch those two on <html> only */
  new MutationObserver(onNier).observe(html, { attributes: true, attributeFilter: ['data-o55-nier', 'data-o55-nier-parts'] });
})();
