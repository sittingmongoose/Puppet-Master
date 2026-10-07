/* O55.nierFx — NieR Mode's shared effects for the onboarding window and the Guided Tour (styles: src/css/05-nier-fx.css,
   words: src/copy.d/10-nier-fx.json). The window's skin, the look screen and the tour call these; nothing here runs by
   itself.

     decode(el, { text?, ms?, sound? })      -> Promise  the first text node of el resolves from scrambled glyphs   [decode]
     slice(el, { ms? })                      -> Promise  el opens from a 1px line, two ink edges riding the opening [slice]
     wipe(el, { ms? })                       -> Promise  a ruled band covers el and steps off to the right          [wipe]
     glitch(el)                              -> Promise  a short tear: el jitters, two ink strips slip               [glitch]
     alert(el)                               -> Promise  the tear, a scan line down el [+sweep], ink shards [+particles] [glitch]
     brackets(el, on)                        -> element  four ink corners locked on el (call again to re-place)     [brackets]
     cursor(el, on)                          -> element  the menu cursor: el becomes an ink bar, a square steps beside it [cursor]
     banner({ kicker?, title, sub?, ms?, within?, sound? }) -> Promise  a wide quest band ("Goal updated")        [quests]
     band(text, ms?, { kicker?, within?, sound? })          -> Promise  a reboot band: a status line types on, ticks fill [reboot]
     pod.say(text, { lead?, anchor?, side?, ms?, sound? })  -> Promise  Pod 042 and its speech strip near anchor   [pod / voice]
     pod.chirp() -> bool   pod.hush()        the Pod's signal and sound; send the Pod away now
     enabled(name) -> bool   clear(host?)   version   demo(host) -> { el, names, run(name), runAll(), dispose() }

   Sounds (O55.sound, so the window's mute governs them; each pairs with the visual that plays it): banner plays
   'quest', band 'reboot', pod.say and pod.chirp 'pod' (opts.sound: false silences one, a string picks another event);
   decode plays 'decode' only when asked (opts.sound: true). The other effects are silent: their callers own the sound.
   Pod 042 is one character: while pod.say speaks, the app's corner Pod (#o55np-pod, shown in the tour and the app)
   steps away and this one flies out from its place and back. In the onboarding window it stays inside the window.

   Rules every effect keeps:
   - It is a no-op (a resolved promise, false) unless NieR Mode is painted (html[data-o55-nier="on"], live or the
     onboarding preview) and its part is installed (html[data-o55-nier-parts] / PM_NIER.has). decode(el, { text }) still
     writes the words: that is its end state.
   - Reduced Motion (O55.motion.reduced: html[data-motion="reduced"] or the system setting) gives the end state at once:
     the words, the brackets, the ink bar and the Pod's words without motion; slice, wipe, glitch, alert and band
     draw nothing; a banner stands still for its time.
   - Everything is drawn in a layer of the surface that owns the element: #pm-o55-onboarding (above the window, even
     while html[data-o55-open] switches the page-wide NieR parts off), #pm-o55-tour (above the callout and the bar,
     under the Show Me pointer), else a page layer. A call without an element (banner, band, pod.say without anchor)
     uses the open onboarding window, else the running tour, else the page.
   - No layout moves: overlays are absolutely placed and never take a click; the element itself is only clipped
     (clip-path), nudged by the separate `translate` property, or painted (the cursor's ink bar). Its own `transform`
     is never touched, so callers may position with it (the tour callout does). decode holds its text box at its size.
   - Motion is transform and opacity, stepped (steps()), as Web Animations; the only loops (Pod hover, cursor nudge,
     band caret) are CSS on transform/opacity and stop under Reduced Motion. Timers run on the motion clock
     (O55.motion.after: slowed for filming, held at time-scale 0). Ink and parchment only: every colour is a NieR token.
   - It cleans up after itself: nodes go when their motion ends; followers (brackets, cursor, Pod) leave when their
     element leaves, its screen goes, its surface closes, NieR Mode goes off or their part is removed; the shared poll
     and listeners exist only while something follows. */
(function () {
  'use strict';
  const O55 = window.O55, U = O55.util, M = O55.motion;
  const html = document.documentElement;
  const FX = O55.nierFx = { version: '1.0.0' };
  const T = (k, v) => O55.t('nierFx.' + k, v);
  const esc = U.esc;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const no = () => Promise.resolve(false);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* ------------------------------------------------------------------ gates */
  /* the part each effect needs (alert's scan and shards also ask for sweep and particles, as in the 5.6 Pro chat) */
  const PART = { decode: 'decode', slice: 'slice', wipe: 'wipe', glitch: 'glitch', alert: 'glitch', brackets: 'brackets', cursor: 'cursor',
    banner: 'quests', band: 'reboot', pod: 'pod', voice: 'voice', scan: 'sweep', shards: 'particles' };
  const painted = () => html.getAttribute('data-o55-nier') === 'on';
  /* The painted attributes are the truth (they are what the CSS reads, and the onboarding preview paints them too);
     PM_NIER.has is asked as well so a store that is ahead of its paint still counts. */
  function has(key) {
    if (!painted()) return false;
    if ((' ' + (html.getAttribute('data-o55-nier-parts') || '') + ' ').indexOf(' ' + key + ' ') >= 0) return true;
    const N = window.PM_NIER;
    try { return !!(N && typeof N.has === 'function' && N.has(key)); } catch (_) { return false; }
  }
  const still = () => { try { return !!M.reduced(); } catch (_) { return false; } };
  /* enabled('slice') -> would slice() draw (NieR painted and its part installed)? Reduced Motion is not counted. */
  FX.enabled = (name) => has(PART[name] || name) || (name === 'pod' && has('voice'));

  const play = (ev) => { try { return !!(ev && O55.sound && O55.sound.play && O55.sound.play(ev)); } catch (_) { return false; } };
  const zoom = () => { const z = document.body && Number.parseFloat(document.body.style.zoom); return Number.isFinite(z) && z > 0 ? z : 1; };
  const ended = (a) => (a && a.finished ? a.finished.then(() => true, () => false) : Promise.resolve(false));
  function rectOf(el) {
    if (!el || !el.isConnected || typeof el.getBoundingClientRect !== 'function') return null;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.right < 0 || r.top > innerHeight || r.left > innerWidth) return null;
    return r;
  }

  /* ------------------------------------------------------------------ hosts and layers */
  const ROOTS = '#pm-o55-onboarding, #pm-o55-tour';
  function openRoot() {
    const onb = document.getElementById('pm-o55-onboarding');
    if (onb && !onb.hidden && html.hasAttribute('data-o55-open')) return onb;
    const tour = document.getElementById('pm-o55-tour');
    if (tour && !tour.hidden && html.hasAttribute('data-o55-tour')) return tour;
    return null;
  }
  /* the surface that owns el: its onboarding window or tour root, else the open one (a tour target lives in the app,
     and its effects belong over the tour's scrim), else the page */
  function hostOf(el) {
    const r = el && el.closest ? el.closest(ROOTS) : null;
    return r || openRoot() || document.body;
  }
  const closed = (host) => host !== document.body && (!host.isConnected || host.hidden);
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
  /* the colour el is drawn on (the first opaque background above it), so a wipe or a cut matches the surface */
  function groundOf(el) {
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const c = getComputedStyle(e).backgroundColor;
      if (c && c !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(c)) return c;
    }
    return '';
  }

  /* running one-shot effects, so clear() can stop them */
  const running = new Set();
  function run(host, stop) { const e = { host, stop }; running.add(e); return e; }
  const finish = (e) => running.delete(e);

  /* ------------------------------------------------------------------ followers: brackets, cursor, Pod */
  /* A follower keeps an overlay on its element: placed from the element's rect on the shared poll (250 ms on the
     motion clock, writing only when the rect moved), on resize, and 140 ms after a scroll (it steps aside while the
     page scrolls). It hides while its element is outside its scroll box or hidden, and leaves for good when the
     element or its screen goes or the surface closes. */
  const followers = new Set();
  let pollT = null, scrollT = null, wired = false;
  function scrollBox(el, host) {
    for (let p = el.parentElement; p && p !== host && p !== document.body; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (/(auto|scroll|hidden|clip)/.test(cs.overflowX + ' ' + cs.overflowY)) return p;
    }
    return null;
  }
  function follow(el, node, host, put, leave) {
    const f = { el, node, host, port: scrollBox(el, host), last: '', gone: null, force: false };
    const gone = (g) => { if (f.gone === g) return; f.gone = g; node.toggleAttribute('data-gone', g); };
    f.place = () => {
      if (!el.isConnected || !node.isConnected || closed(host) || el.closest('.o55-out, [hidden]')) { f.off(); return; }
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
    f.place();
    return f;
  }
  function poll() {
    pollT = null;
    if (!document.hidden) followers.forEach((f) => f.place());
    if (followers.size) pollT = M.after(250, poll);
  }
  function onScroll() {
    followers.forEach((f) => f.hide());
    if (scrollT) scrollT.cancel();
    scrollT = M.after(140, () => { scrollT = null; followers.forEach((f) => f.place()); });
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

  /* ================================================================== decode */
  const GLYPH = { upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ', lower: 'abcdefghjkmnopqrstuvwxyz', digit: '0123456789', mark: '#%&*+=/<>' };
  const decoding = new WeakMap();
  function glyph(ch) {
    const set = /[A-Z]/.test(ch) ? GLYPH.upper : /[a-z]/.test(ch) ? GLYPH.lower : /[0-9]/.test(ch) ? GLYPH.digit : GLYPH.mark;
    return set[(Math.random() * set.length) | 0];
  }
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
  /* hold the box that lays the words out at its size while glyphs of other widths pass through it (a heading's
     height, a button label's width), so nothing around it moves */
  function hold(node, el) {
    let b = node.parentElement;
    while (b && b !== el && getComputedStyle(b).display === 'inline') b = b.parentElement;
    if (!b) return null;
    const cs = getComputedStyle(b);
    if (cs.display === 'inline' || cs.display === 'contents' || !/px$/.test(cs.width) || !/px$/.test(cs.height)) return null;
    const h = { b, w: b.style.width, h: b.style.height, sw: cs.width, sh: cs.height };
    b.style.width = h.sw; b.style.height = h.sh;
    return h;
  }
  function unhold(h) {
    if (!h) return;
    if (h.b.style.width === h.sw) h.b.style.width = h.w;
    if (h.b.style.height === h.sh) h.b.style.height = h.h;
  }
  FX.decode = function decode(el, o) {
    o = o || {};
    const node = textNodeOf(el);
    if (!node) return no();
    const prev = decoding.get(node); if (prev) prev.stop(true);
    const text = o.text != null ? String(o.text) : node.nodeValue;
    if (!has('decode') || still() || document.hidden || !text.trim() || text.length > 140) {
      if (node.nodeValue !== text) node.nodeValue = text;
      return no();
    }
    if (node.nodeValue !== text) node.nodeValue = text; /* measured with its final words */
    const held = hold(node, el);
    const ms = clamp(o.ms || 420, 140, 2400), dt = 35, n = Math.max(4, Math.round(ms / dt)), len = text.length;
    /* each character resolves on its own step: left to right, a little out of order, all by the last step */
    const at = [];
    for (let k = 0; k < len; k++) at.push(/\s/.test(text[k]) ? 0 : Math.min(n, 1 + Math.floor((n - 1) * (0.7 * k / Math.max(1, len - 1) + 0.3 * Math.random()))));
    let i = 0, last = '', timer = null, stopped = false, res;
    const p = new Promise((r) => { res = r; });
    const frame = () => { let out = ''; for (let k = 0; k < len; k++) out += i >= at[k] ? text[k] : glyph(text[k]); return out; };
    const job = run(el.nodeType === 1 ? hostOf(el) : null, () => stop(true));
    function stop(restore) {
      if (stopped) return;
      stopped = true; if (timer) timer.cancel(); timer = null;
      decoding.delete(node); finish(job);
      /* if anything else wrote the words meanwhile (the window's refresh), that write stands */
      if (restore && node.isConnected && node.nodeValue === last) node.nodeValue = text;
      unhold(held);
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

  /* ================================================================== slice */
  /* The surface is clipped to its middle line while a hairline with square caps draws across it, then opens in four
     steps with an ink edge riding the top and bottom of the opening; the edges blink out. Only clip-path is animated
     on the element (never its transform), so a surface placed by transform (the tour callout) slices in place. */
  const slicing = new WeakMap();
  FX.slice = function slice(el, o) {
    o = o || {};
    if (!el || typeof el.animate !== 'function' || !has('slice') || still() || document.hidden) return no();
    const r = rectOf(el); if (!r) return no();
    const prev = slicing.get(el); if (prev) prev();
    const ms = clamp(o.ms || 240, 140, 900), host = hostOf(el), L = layerOf(host);
    const shut = 'inset(50% -40px 50% -40px)', open = 'inset(-40px -40px -40px -40px)';
    const a = el.animate([
      { clipPath: shut, offset: 0 },
      { clipPath: shut, offset: 0.3, easing: 'steps(4, end)' },
      { clipPath: open, offset: 0.82 },
      { clipPath: open, offset: 1 }
    ], { duration: ms });
    const b = box(L, r, 'o55fx-slice', '<i></i><i></i>');
    const half = Math.max(1, r.height / zoom() / 2);
    const lines = Array.from(b.children).map((line, k) => line.animate([
      { transform: 'translateY(0) scaleX(0)', opacity: 1, offset: 0, easing: 'steps(3, end)' },
      { transform: 'translateY(0) scaleX(1)', opacity: 1, offset: 0.3, easing: 'steps(4, end)' },
      { transform: `translateY(${k ? half : -half}px) scaleX(1)`, opacity: 1, offset: 0.82, easing: 'step-end' },
      { transform: `translateY(${k ? half : -half}px) scaleX(1)`, opacity: 0.25, offset: 0.9, easing: 'step-end' },
      { transform: `translateY(${k ? half : -half}px) scaleX(1)`, opacity: 0, offset: 1 }
    ], { duration: ms, fill: 'forwards' }));
    let done = false;
    const end = () => { if (done) return; done = true; finish(job); if (slicing.get(el) === cancel) slicing.delete(el); drop(b); };
    const cancel = () => { a.cancel(); lines.forEach((x) => x.cancel()); end(); };
    const job = run(host, cancel);
    slicing.set(el, cancel);
    return ended(a).then((ok) => { end(); return ok; });
  };

  /* ================================================================== wipe */
  /* A band of the surface's own ground, ruled faintly, with an ink leading edge and square caps, covers the container
     and steps off to the right, so what was drawn under it is revealed (a page change). */
  FX.wipe = function wipe(el, o) {
    o = o || {};
    if (!el || !has('wipe') || still() || document.hidden) return no();
    const r = rectOf(el); if (!r) return no();
    const ms = clamp(o.ms || 380, 160, 1200), host = hostOf(el), L = layerOf(host);
    const b = box(L, r, 'o55fx-wipe', '<i><b></b></i>');
    const ground = groundOf(el); if (ground) b.style.setProperty('--o55fx-ground', ground);
    const a = b.firstElementChild.animate([
      { transform: 'translateX(0)', offset: 0 },
      { transform: 'translateX(0)', offset: 0.16, easing: 'steps(8, end)' },
      { transform: 'translateX(101%)', offset: 1 }
    ], { duration: ms, fill: 'forwards' });
    const job = run(host, () => a.cancel());
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
      if (has('sweep')) anims.push(scan(L, r));
      if (has('particles')) anims.push(...shards(L, r));
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
    if (cur) { cur.f.force = true; cur.f.place(); return cur.node; }
    const host = hostOf(el), L = layerOf(host);
    const node = document.createElement('div');
    node.className = 'o55fx-brk'; node.innerHTML = '<i></i><i></i><i></i><i></i>';
    L.appendChild(node);
    const GAP = 4;
    const put = (r, first) => {
      node.toggleAttribute('data-jump', first);
      node.style.transform = `translate(${z1(r.left) - GAP}px, ${z1(r.top) - GAP}px)`;
      node.style.width = `${z1(r.width) + GAP * 2}px`; node.style.height = `${z1(r.height) + GAP * 2}px`;
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
        if (still() || !node.isConnected) { leave(); return; }
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
  FX.cursor = function cursor(el, on) {
    if (!el) return null;
    const host = hostOf(el), c = cursors.get(host);
    if (on === false) { if (c && c.el === el) cursorOff(host); return null; }
    if (!has('cursor')) { if (c) cursorOff(host); return null; }
    if (c && c.el === el) { c.f.force = true; c.f.place(); return c.node; }
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
       row's own CSS animations and transitions are left alone */
    if (!still() && typeof el.animate === 'function') {
      try {
        el.animate([{ '--o55fx-cur': '0%', '--o55fx-cur-fg': 'var(--text-primary)' }, { '--o55fx-cur': '100%', '--o55fx-cur-fg': 'var(--o55-nier-on-ink)' }],
          { duration: 200, easing: 'steps(4, end)' });
      } catch (_) { /* no custom property animation: the bar is simply there */ }
    }
    cur.mo = new MutationObserver(() => { if (cur.el === el && !el.hasAttribute(CUR)) el.setAttribute(CUR, ''); });
    cur.mo.observe(el, { attributes: true, attributeFilter: [CUR] });
    const node = cur.node;
    const put = (r, again) => {
      /* beside the row's left edge; right of it when the row starts at the surface's edge */
      if (again && node.getAttribute('data-gone') != null) node.setAttribute('data-jump', '');
      let x = z1(r.left) - 14, side = 'left';
      if (r.left < 16) { x = z1(r.right) + 5; side = 'right'; }
      node.style.transform = `translate(${x}px, ${Math.round(z1(r.top + r.height / 2) - 4.5)}px)`;
      if (node.dataset.side !== side) node.dataset.side = side;
      if (node.hasAttribute('data-jump')) M.release(() => node.removeAttribute('data-jump'));
    };
    cur.f = follow(el, node, host, put, () => { if (cursors.get(host) === cur && cur.el === el) cursorOff(host); });
    return node;
  };

  /* ================================================================== Pod 042 */
  /* PMConcept7's original ink-line Pod (kit.d/19-nier-parts.js): a chamfered box with a sensor slit, two side arms
     and a skirt; a shadow dash below. Beside it a speech strip: the POD 042 band and a lead (Report, Proposal,
     Alert, Query). It finds a side of its anchor where it covers no control, turns toward it and sends three
     signals; it hovers in steps and leaves on its own after its time. */
  const POD_SVG = '<svg viewBox="0 0 40 52" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="miter" stroke-linecap="square" aria-hidden="true">'
    + '<path class="o55fx-pod-fill" d="M3.5 13.5H8.5V30.5H3.5Z M31.5 13.5H36.5V30.5H31.5Z"/><path d="M3.5 13.5H8.5V30.5H3.5Z M31.5 13.5H36.5V30.5H31.5Z M8.5 18H9.5 M30.5 18H31.5 M6 10.5V13.5 M34 10.5V13.5"/>'
    + '<path class="o55fx-pod-fill" d="M12.5 6.5H27.5L30.5 9.5V33.5L26.5 37.5H13.5L9.5 33.5V9.5Z"/><path d="M12.5 6.5H27.5L30.5 9.5V33.5L26.5 37.5H13.5L9.5 33.5V9.5Z M11 12.5H29 M13 27.5H27 M13 30.5H27 M15.5 37.5L17 41.5H23L24.5 37.5"/>'
    + '<path class="o55fx-pod-ink" stroke="none" d="M15 18H25V21H15Z"/><path class="o55fx-pod-ink" stroke="none" d="M22 18H25V21H22Z" opacity=".35"/></svg>';
  const POD_SHADOW = '<svg viewBox="0 0 40 52" aria-hidden="true"><path class="o55fx-pod-ink" d="M13 47.3H27V48.7H13Z" opacity=".32"/></svg>';
  const LEADS = ['report', 'proposal', 'alert', 'query', 'analysis'];
  const CONTROL = 'button, a[href], summary, input, select, textarea, [role="button"], [role="radio"], [role="checkbox"], [role="switch"], [role="tab"], [role="menuitem"], [role="option"]';
  const pods = new Map(); /* host -> P */
  /* The app's own Pod (kit.d/19-nier-parts.js, #o55np-pod) hovers by the bottom-right corner wherever the onboarding
     window is not open (the tour, the app). It is the same Pod: while this one speaks, that one steps away
     (html[data-o55fx-pod]) and this one flies out from its place and back to it. */
  function home() {
    const e = document.getElementById('o55np-pod');
    if (!e || html.hasAttribute('data-o55fx-pod')) return null;
    const r = e.getBoundingClientRect();
    return r.width > 4 && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' ? r : null;
  }
  const homeSync = () => html.toggleAttribute('data-o55fx-pod', pods.size > 0);

  function anchorRect(a) {
    if (!a) return null;
    if (a.nodeType === 1) return rectOf(a);
    if (typeof a === 'object' && Number.isFinite(a.left != null ? a.left : a.x)) {
      const left = a.left != null ? a.left : a.x, top = a.top != null ? a.top : a.y, w = a.width || 0, h = a.height || 0;
      return { left, top, width: w, height: h, right: left + w, bottom: top + h };
    }
    return null;
  }
  /* would a box at (x, y, w, h) cover a control of the page? (the Pod's layer takes no pointer, so it is not hit) */
  function covers(x, y, w, h, anchor) {
    const z = zoom();
    for (const fx of [0.12, 0.5, 0.88]) for (const fy of [0.15, 0.5, 0.85]) {
      const t = document.elementFromPoint((x + w * fx) * z, (y + h * fy) * z);
      const c = t && t.closest ? t.closest(CONTROL) : null;
      if (c && !(anchor && anchor.nodeType === 1 && (anchor === c || anchor.contains(c)))) return true;
    }
    return false;
  }
  /* where the Pod may stand: inside the onboarding window (it is a bounded modal), else the viewport */
  function podBounds(P) {
    const z = zoom(), win = P.host.id === 'pm-o55-onboarding' ? rectOf(P.host.querySelector('.o55-win')) : null;
    return win ? { l: win.left / z + 8, t: win.top / z + 8, r: win.right / z - 8, b: win.bottom / z - 8 } : { l: 8, t: 8, r: innerWidth / z - 8, b: innerHeight / z - 8 };
  }
  function podPlace(P, first) {
    const n = P.node, z = zoom(), B = podBounds(P), GAP = 12;
    const ar = anchorRect(P.anchor);
    /* a side is possible when the Pod fits beside the anchor along that side's axis (the other axis slides within the
       bounds); the first possible side that covers no control wins, else the first possible one stands back (shy) */
    let pick = null, last = null;
    const order = P.side ? [P.side, 'right', 'left', 'top', 'bottom'] : ['right', 'left', 'top', 'bottom'];
    const sides = ar ? order.filter((s, i) => order.indexOf(s) === i) : ['dock'];
    for (const side of sides) {
      if (n.dataset.side !== side) n.dataset.side = side;
      const w = n.offsetWidth, h = n.offsetHeight;
      const a = ar ? { l: ar.left / z, t: ar.top / z, r: ar.right / z, b: ar.bottom / z, cx: (ar.left + ar.width / 2) / z, cy: (ar.top + ar.height / 2) / z } : null;
      let x, y;
      if (side === 'right') { x = a.r + GAP; y = a.cy - h / 2; }
      else if (side === 'left') { x = a.l - GAP - w; y = a.cy - h / 2; }
      else if (side === 'bottom') { x = a.cx - w / 2; y = a.b + GAP; }
      else if (side === 'top') { x = a.cx - w / 2; y = a.t - GAP - h; }
      else { x = B.r - w - 10; y = B.b - h - (P.host.id === 'pm-o55-onboarding' ? 72 : 56); }
      const fits = side === 'dock' || (side === 'left' || side === 'right' ? x >= B.l && x + w <= B.r : y >= B.t && y + h <= B.b);
      x = clamp(x, B.l, Math.max(B.l, B.r - w)); y = clamp(y, B.t, Math.max(B.t, B.b - h));
      const spot = { side, x: Math.round(x), y: Math.round(y), w, h, fits };
      if (!fits) { if (!last) last = spot; continue; }
      if (!pick) pick = spot;
      if (!covers(x, y, w, h, P.anchor)) { pick = spot; pick.clear = true; break; }
    }
    /* nowhere beside it: the side with the most room, slid inside the bounds */
    if (!pick) pick = last || { side: 'dock', x: Math.round(B.l), y: Math.round(B.t) };
    if (n.dataset.side !== pick.side) n.dataset.side = pick.side;
    n.toggleAttribute('data-jump', !!first);
    n.style.transform = `translate(${pick.x}px, ${pick.y}px)`;
    /* nowhere clear: it stands back so the control shows through (the 5.6 Pro Pod's shyness) */
    n.toggleAttribute('data-shy', !pick.clear);
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
  function podGo(host, now) {
    const P = pods.get(host); if (!P) return;
    pods.delete(host);
    if (P.timer) P.timer.cancel();
    if (P.f) { followers.delete(P.f); unwire(); }
    const end = () => { drop(P.node); P.res(true); homeSync(); };
    if (now || still() || !P.node.isConnected || document.hidden) { end(); return; }
    const strip = P.node.querySelector('.o55fx-pod-strip'), unit = P.node.querySelector('.o55fx-pod-unit');
    strip.animate([{ transform: 'scaleY(1)', opacity: 1 }, { transform: 'scaleY(.04)', opacity: 1, offset: 0.7 }, { transform: 'scaleY(.04)', opacity: 0 }], { duration: 180, easing: 'steps(3, end)', fill: 'forwards' });
    let a;
    if (P.home && P.home.isConnected && getComputedStyle(P.home).display !== 'none') {
      /* back to its place by the corner, where the app's Pod takes over */
      const u = unit.getBoundingClientRect(), h = P.home.getBoundingClientRect(), z = zoom();
      a = unit.animate([{ translate: '0px 0px' }, { translate: `${Math.round((h.left - u.left) / z)}px ${Math.round((h.top - u.top) / z)}px` }], { duration: 360, delay: 120, easing: 'steps(6, end)', fill: 'forwards' });
    } else {
      a = unit.animate([{ opacity: 1 }, { opacity: 0.2, offset: 0.4 }, { opacity: 0.7, offset: 0.6 }, { opacity: 0 }], { duration: 220, delay: 80, easing: 'step-end', fill: 'forwards' });
    }
    ended(a).then(end);
  }
  function podSay(text, o) {
    o = o || {};
    const unitOn = has('pod'), voice = has('voice');
    let words = String(text == null ? '' : text).trim();
    if ((!unitOn && !voice) || !words || document.hidden) return no();
    let lead = o.lead ? String(o.lead).replace(/:$/, '').toLowerCase() : '';
    const m = /^(report|proposal|alert|query|analysis)\s*:\s*/i.exec(words);
    if (m) { if (!lead) lead = m[1].toLowerCase(); words = words.slice(m[0].length); }
    if (LEADS.indexOf(lead) < 0) lead = 'report';
    const anchor = o.anchor || null;
    const host = anchor && anchor.nodeType === 1 ? hostOf(anchor) : hostOf(null);
    const ms = clamp(o.ms || 1700 + words.length * 45, 1600, 12000);
    let P = pods.get(host);
    const fresh = !P;
    if (P) { if (P.timer) P.timer.cancel(); if (P.f) { followers.delete(P.f); unwire(); P.f = null; } P.res(true); }
    else {
      const node = document.createElement('div');
      node.className = 'o55fx-pod';
      node.innerHTML = `<div class="o55fx-pod-unit"><div class="o55fx-pod-shadow">${POD_SHADOW}</div><div class="o55fx-pod-bob"><div class="o55fx-pod-body">${POD_SVG}</div></div>`
        + '<i class="o55fx-pod-sig"></i><i class="o55fx-pod-sig"></i><i class="o55fx-pod-sig"></i></div>'
        + `<div class="o55fx-pod-strip"><div class="o55fx-pod-head"><i></i><i></i><i></i><span>${esc(T('pod.name'))}</span></div><p class="o55fx-pod-text"><b></b><span></span></p></div>`;
      layerOf(host).appendChild(node);
      P = { host, node, from: unitOn ? home() : null, home: document.getElementById('o55np-pod') };
      pods.set(host, P);
      homeSync();
    }
    const node = P.node;
    node.toggleAttribute('data-unit', unitOn);
    node.toggleAttribute('data-voice', voice);
    node.setAttribute('data-lead', lead);
    node.querySelector('.o55fx-pod-text > b').textContent = voice ? T('pod.leads.' + lead) : '';
    const span = node.querySelector('.o55fx-pod-text > span'), strip = node.querySelector('.o55fx-pod-strip');
    span.textContent = words;
    P.lock = null; strip.style.width = ''; strip.style.height = '';
    P.anchor = anchor; P.side = o.side || null;
    const p = new Promise((r) => { P.res = r; });
    let placed = false;
    if (anchor && anchor.nodeType === 1) P.f = follow(anchor, node, host, () => { podPlace(P, fresh && !placed); placed = true; }, () => podGo(host, false));
    if (!placed) podPlace(P, fresh);
    const side = node.dataset.side;
    if (!still()) {
      if (fresh) {
        const unit = node.querySelector('.o55fx-pod-unit');
        if (P.from) {
          /* out from its place by the corner to its anchor */
          const u = unit.getBoundingClientRect(), z = zoom();
          unit.animate([{ translate: `${Math.round((P.from.left - u.left) / z)}px ${Math.round((P.from.top - u.top) / z)}px` }, { translate: '0px 0px' }], { duration: 360, easing: 'steps(6, end)' });
        } else {
          const dx = side === 'left' ? -10 : side === 'right' ? 10 : 0, dy = side === 'top' ? -8 : side === 'bottom' ? 8 : 0;
          unit.animate([{ translate: `${dx}px ${dy}px`, opacity: 0 }, { translate: '0px 0px', opacity: 1 }], { duration: 200, easing: 'steps(4, end)' });
        }
      }
      strip.animate([{ transform: 'scaleY(.04)', opacity: 0, offset: 0 }, { transform: 'scaleY(.04)', opacity: 1, offset: 0.25, easing: 'steps(4, end)' },
        { transform: 'scaleY(1)', opacity: 1, offset: 0.8, easing: 'step-end' }, { transform: 'scaleY(1)', opacity: 0.4, offset: 0.88, easing: 'step-end' }, { transform: 'scaleY(1)', opacity: 1 }],
      { duration: 280, delay: fresh ? (P.from ? 300 : 90) : 0, fill: 'backwards' });
      /* the strip holds its size while its words decode (glyphs of other widths would rewrap it) */
      const lock = P.lock = {};
      strip.style.width = `${strip.offsetWidth}px`; strip.style.height = `${strip.offsetHeight}px`;
      FX.decode(span, { ms: clamp(260 + words.length * 6, 380, 900) }).then(() => { if (P.lock === lock) { strip.style.width = ''; strip.style.height = ''; } });
      podTurn(P);
    }
    if (o.sound !== false) play(typeof o.sound === 'string' ? o.sound : 'pod');
    if (o.announce) U.announce((voice ? T('pod.leads.' + lead) + ' ' : '') + words, host === document.body ? null : host);
    P.timer = M.after(ms, () => { if (pods.get(host) === P) podGo(host, false); });
    return p;
  }
  FX.pod = {
    say: podSay,
    /* the Pod's signal: it turns toward its anchor and sends three signals, with its chirp (a Pod on screen, or the
       sound alone when none is; the sound pairs with the Pod's words that called for it) */
    chirp() {
      if (!has('pod') && !has('voice')) return false;
      pods.forEach((P) => podTurn(P));
      play('pod');
      return true;
    },
    hush() { Array.from(pods.keys()).forEach((h) => podGo(h, false)); }
  };

  /* ================================================================== quest banner */
  /* A wide ink band across the surface: it draws as a line, opens in steps, its words flicker on (the title decodes),
     holds, and folds back to a line. Kicker words: copy nierFx.banner.kickers.* (Goal updated by default). */
  const banners = new Map();
  function spanOf(host, within) {
    const z = zoom();
    const el = within && within.nodeType === 1 ? within : (host.id === 'pm-o55-onboarding' ? host.querySelector('.o55-win') : null);
    const r = el ? rectOf(el) : null;
    return r ? { top: r.top / z, height: r.height / z, left: within ? r.left / z : 0, width: within ? r.width / z : innerWidth / z }
      : { top: 0, height: innerHeight / z, left: 0, width: innerWidth / z };
  }
  FX.banner = function banner(o) {
    o = o || {};
    const title = String(o.title == null ? '' : o.title);
    if (!has('quests') || !title || document.hidden) return no();
    const host = o.within && o.within.nodeType === 1 ? hostOf(o.within) : hostOf(null);
    const prev = banners.get(host); if (prev) prev(true);
    const L = layerOf(host), s = spanOf(host, o.within);
    const ms = clamp(o.ms || 1800, 900, 8000);
    const kicker = o.kicker != null ? String(o.kicker) : T('banner.kickers.goalUpdated');
    const el = document.createElement('div');
    el.className = 'o55fx-banner';
    const H = 96;
    el.style.cssText = `left:${Math.round(s.left)}px;width:${Math.round(s.width)}px;top:${Math.round(s.top + s.height * (host.id === 'pm-o55-tour' ? 0.23 : 0.3) - H / 2)}px;height:${H}px`;
    el.innerHTML = '<div class="o55fx-bn-band"></div><div class="o55fx-bn-copy"><span class="o55fx-bn-mark"></span>'
      + `<span class="o55fx-bn-kicker"><i></i><i></i><i></i><span>${esc(kicker)}</span></span><span class="o55fx-bn-title">${esc(title)}</span>`
      + (o.sub ? `<span class="o55fx-bn-sub">${esc(o.sub)}</span>` : '') + '</div>';
    L.appendChild(el);
    const band = el.firstElementChild, copy = el.lastElementChild, mark = copy.firstElementChild;
    let res, timer = null, gone = false;
    const p = new Promise((r) => { res = r; });
    const end = () => { if (gone) return; gone = true; if (timer) timer.cancel(); finish(job); if (banners.get(host) === stop) banners.delete(host); drop(el); res(true); };
    function stop(now) {
      if (gone) return;
      if (now || still() || !el.isConnected) { end(); return; }
      if (timer) { timer.cancel(); timer = null; }
      copy.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'steps(3, end)', fill: 'forwards' });
      const a = band.animate([{ transform: 'scaleY(1)', opacity: 1 }, { transform: 'scaleY(.012)', opacity: 1, offset: 0.75, easing: 'step-end' }, { transform: 'scaleY(.012)', opacity: 0 }],
        { duration: 260, delay: 80, easing: 'steps(4, end)', fill: 'forwards' });
      ended(a).then(end);
    }
    const job = run(host, () => stop(true));
    banners.set(host, stop);
    if (!still()) {
      band.animate([{ transform: 'scale(0, .012)', offset: 0, easing: 'steps(3, end)' }, { transform: 'scale(1, .012)', offset: 0.4, easing: 'steps(4, end)' }, { transform: 'scale(1, 1)', offset: 1 }],
        { duration: 300, fill: 'backwards' });
      copy.animate([{ opacity: 0, easing: 'step-end' }, { opacity: 1, offset: 0.3, easing: 'step-end' }, { opacity: 0.25, offset: 0.5, easing: 'step-end' }, { opacity: 1, offset: 0.7 }, { opacity: 1 }],
        { duration: 300, delay: 240, fill: 'backwards' });
      mark.animate([{ transform: 'rotate(-45deg) scale(.4)' }, { transform: 'rotate(45deg) scale(1)' }], { duration: 240, delay: 240, easing: 'steps(3, end)', fill: 'backwards' });
      M.after(250, () => { if (!gone) FX.decode(copy.querySelector('.o55fx-bn-title'), { ms: 420 }); });
    }
    if (o.sound !== false) play(typeof o.sound === 'string' ? o.sound : 'quest');
    if (o.announce) U.announce([kicker, title, o.sub].filter(Boolean).join('. '), host === document.body ? null : host);
    timer = M.after(Math.max(500, ms - 340), () => { timer = null; stop(false); });
    return p;
  };

  /* ================================================================== reboot band */
  /* A full-width ink band: a line draws across and opens, the kicker (small squares, the unit's name, a rule) shows,
     the status line types on behind a block caret while a row of thirty-two ticks fills in steps, OK lands, and the
     band flickers out. A key or a press anywhere ends it at once (it never takes the press). */
  const bands = new Map();
  FX.band = function band(text, ms, o) {
    o = o || {};
    const words = String(text == null ? '' : text).trim();
    if (!has('reboot') || !words || still() || document.hidden) return no();
    const host = o.within && o.within.nodeType === 1 ? hostOf(o.within) : hostOf(null);
    const prev = bands.get(host); if (prev) prev(true);
    const L = layerOf(host), s = spanOf(host, o.within);
    const total = clamp(ms || 1500, 900, 6000), H = 108;
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
    let res, gone = false, closing = false;
    const timers = [];
    const later = (t, fn) => { const h = M.after(t, () => { if (!gone) fn(); }); timers.push(h); return h; };
    const p = new Promise((r) => { res = r; });
    const skip = () => stop(true);
    const end = () => {
      if (gone) return; gone = true;
      timers.forEach((t) => t.cancel());
      document.removeEventListener('keydown', skip, true); document.removeEventListener('pointerdown', skip, true);
      finish(job); if (bands.get(host) === stop) bands.delete(host);
      drop(el); res(true);
    };
    function stop(now) {
      if (gone || closing) { if (now) end(); return; }
      closing = true;
      if (now || !el.isConnected) { end(); return; }
      const a = el.animate([{ opacity: 1 }, { opacity: 0, offset: 0.2 }, { opacity: 0.8, offset: 0.36 }, { opacity: 0, offset: 0.52 }, { opacity: 0.35, offset: 0.68 }, { opacity: 0, offset: 0.84 }, { opacity: 0 }],
        { duration: 300, easing: 'step-end', fill: 'forwards' });
      ended(a).then(end);
    }
    const job = run(host, () => stop(true));
    bands.set(host, stop);
    document.addEventListener('keydown', skip, true); document.addEventListener('pointerdown', skip, true);
    /* timeline: line + open 280 ms, typing to 55 %, ticks from 300 ms to 82 %, OK at 84 %, flicker out in the last 300 ms */
    const openMs = 280, outMs = 300, tickMs = Math.max(320, total * 0.82 - openMs), typeMs = Math.max(180, total * 0.55 - openMs);
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

  /* ================================================================== teardown */
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

  /* ================================================================== test bench */
  /* demo(host): every effect on sample elements drawn in host (tests only): { el, run(name), runAll(), dispose() } */
  FX.demo = function demo(host) {
    if (!host) return null;
    const D = (k) => esc(T('demo.' + k));
    const el = document.createElement('div');
    el.className = 'o55fx-demo';
    el.innerHTML = `<p class="o55fx-demo-kicker">${D('kicker')}</p><h2 class="o55fx-demo-title" data-o55fx-demo="decode">${D('title')}</h2>`
      + '<div class="o55fx-demo-grid">'
      + `<div class="o55fx-demo-card" data-o55fx-demo="slice"><b>${D('slice')}</b><span>${D('sliceSub')}</span></div>`
      + `<div class="o55fx-demo-card" data-o55fx-demo="wipe"><b>${D('wipe')}</b><span>${D('wipeSub')}</span></div>`
      + `<div class="o55fx-demo-card" data-o55fx-demo="glitch"><b>${D('glitch')}</b><span>${D('glitchSub')}</span></div>`
      + `<div class="o55fx-demo-card" data-o55fx-demo="alert"><b>${D('alert')}</b><span>${D('alertSub')}</span></div>`
      + '</div><div class="o55fx-demo-rows" role="listbox">'
      + `<div class="o55fx-demo-row" role="option" data-o55fx-demo="cursor">${D('rowA')}</div><div class="o55fx-demo-row" role="option" data-o55fx-demo="cursor2">${D('rowB')}</div>`
      + `<div class="o55fx-demo-row" role="option" data-o55fx-demo="brackets">${D('rowC')}</div></div>`
      + `<button type="button" class="o55fx-demo-btn" data-o55fx-demo="pod">${D('podButton')}</button>`;
    host.appendChild(el);
    const at = (k) => el.querySelector(`[data-o55fx-demo="${k}"]`);
    const RUN = {
      decode: () => FX.decode(at('decode')),
      slice: () => FX.slice(at('slice')),
      wipe: () => FX.wipe(at('wipe')),
      glitch: () => FX.glitch(at('glitch')),
      alert: () => FX.alert(at('alert')),
      brackets: () => Promise.resolve(!!FX.brackets(at('brackets'), true)),
      cursor: () => Promise.resolve(!!FX.cursor(at('cursor'), true)),
      cursor2: () => Promise.resolve(!!FX.cursor(at('cursor2'), true)),
      pod: () => FX.pod.say(T('demo.podLine'), { anchor: at('pod'), lead: 'proposal' }),
      banner: () => FX.banner({ title: T('demo.bannerTitle'), sub: T('demo.bannerSub') }),
      band: () => FX.band(T('band.lines.setupStart'))
    };
    const runOne = (name) => (RUN[name] ? RUN[name]() : no());
    return {
      el,
      names: Object.keys(RUN),
      run: runOne,
      runAll() { return Promise.all(['decode', 'slice', 'wipe', 'glitch', 'alert', 'brackets', 'cursor', 'pod'].map(runOne)); },
      dispose() {
        FX.brackets(at('brackets'), false); FX.cursor(at('cursor'), false); FX.cursor(at('cursor2'), false);
        FX.pod.hush();
        el.remove();
      }
    };
  };
})();
