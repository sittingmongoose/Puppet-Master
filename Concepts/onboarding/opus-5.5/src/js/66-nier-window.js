/* O55.nierWindow — NieR Mode's skin of the onboarding window (styles: src/css/11-window-nier.css, words:
   src/copy.d/45-nier-window.json). 60-ui-core.js calls these hooks through O55.ui.skin(name, a, b) at the window's
   moments; 62-flow.js calls op. Every hook answers only while NieR Mode is painted (html[data-o55-nier="on"], live or
   the onboarding preview), and every effect is drawn by O55.nierFx (16-nier-fx.js), so each one is gated by its
   installed part and Reduced Motion gives its end state. A hook that answers true has drawn the moment its own way
   (the window then skips its default). With NieR Mode off nothing here runs and nothing it made stays in the window.

     stepped()                 -> true while painted: a sheet that just opened scrolls into view at once
     open({ resumed, shown })  the window opens: the reboot band [reboot + boot], then Pod's first line
     screen(layer, dir)        a real screen change, after its release: a page wipe on a chapter change (mirrored
                               for Back) or the content slicing open, the title decoding, a quest banner when a chapter
                               is complete, target brackets on the chosen card, then Pod's line for the screen
     refresh(layer)            a quiet in-screen update: brackets follow the choice, the block meter, an error that
                               just appeared (alert + Pod), the Project-created banner, a changed title decodes
     refused(el)               a press on a disabled control: a short glitch instead of the shake
     shake(field)              an entry that was not taken: the alert tear instead of the shake, and Pod's Alert line
     op(key, state)            an operation finished on the screen that shows it: Pod reports
     close(reason, handoff)    the window closes: what follows its screens goes; setup done hands over with a band

   The window keeps its own parts in two places it owns: a stage overlay over the art panel (.o55nw-stage: Pod 042 at
   its corner, drifting ink motes, map rulers, a scan line) and the brand's kicker and Setup counter. The menu cursor
   rides cards, tiles and switches on hover and focus (the page-wide NieR cursor already inks options and menu items,
   so there is never a second cursor). Timers run on the motion clock and belong to the screen that started them. */
(function () {
  'use strict';
  const O55 = window.O55, M = O55.motion;
  const html = document.documentElement;
  const T = (k, v) => O55.t('nierWindow.' + k, v);
  const painted = () => html.getAttribute('data-o55-nier') === 'on';
  const has = (key) => painted() && (' ' + (html.getAttribute('data-o55-nier-parts') || '') + ' ').indexOf(' ' + key + ' ') >= 0;
  const fx = () => (painted() && O55.nierFx && O55.nierFx.enabled ? O55.nierFx : null);
  const reduced = () => M.reduced();
  /* One low-resource rule for both directions, O55.nierFx's: the heavy one-shots (the page wipe, the slice) are end
     states under Reduced Motion and on a low-resource computer, forward and Back alike; the overlay's loops stop
     there too (11-window-nier.css) */
  const calm = () => M.reduced() || !!M.lowResource;
  const rootEl = () => (O55.S && O55.S.root) || null;
  const shown = () => { const s = O55.S; return !!(s && s.open && s.root && !s.root.hidden); };
  const layerNow = () => { const r = rootEl(); return r ? r.querySelector('.o55-pane > .o55-layer:not(.o55-out)') : null; };
  const camel = (id) => String(id).replace(/-([a-z0-9])/g, (m, c) => c.toUpperCase());
  const two = (n) => String(n).padStart(2, '0');
  const line = (key) => { const v = O55.tx('nierWindow.' + key); return typeof v === 'string' ? v : null; };

  /* ------------------------------------------------------------------ the run and the screen's timers */
  /* What this run has shown already (chapters whose banner played, screens Pod spoke on); a new run (Start over, Run
     Onboarding Again) starts clean. */
  let run = null;
  function runState() {
    const s = O55.S, id = s && s.sess ? (s.sess.started || '') + '|' + (s.epoch || 0) : '';
    if (!run || run.id !== id) run = { id, chapters: new Set(), spoken: new Set(), idx: -1, chapter: null, title: '', errs: new Set(), commit: null, ops: 0, layer: null, marksAt: 0 };
    return run;
  }
  /* timers belong to the screen that set them: a screen change, the window closing or NieR Mode going cancels them */
  let token = 0;
  const timers = new Set();
  function later(ms, fn) {
    const t = token;
    const h = M.after(ms, () => { timers.delete(h); if (t === token && shown() && painted()) fn(); });
    timers.add(h);
    return h;
  }
  function cancelAll() { token++; timers.forEach((h) => h.cancel()); timers.clear(); pending = null; }

  /* ------------------------------------------------------------------ the stage overlay and the brand */
  /* PMConcept7's ink-line Pod (the same drawing as kit.d/19-nier-parts.js and O55.nierFx), resting by the art panel's
     top corner; O55.nierFx's Pod lands exactly on it to speak, and this one steps away meanwhile */
  const POD = '<svg viewBox="0 0 40 52" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="miter" stroke-linecap="square" aria-hidden="true">'
    + '<path class="o55nw-pod-fill" d="M3.5 13.5H8.5V30.5H3.5Z M31.5 13.5H36.5V30.5H31.5Z"/><path d="M3.5 13.5H8.5V30.5H3.5Z M31.5 13.5H36.5V30.5H31.5Z M8.5 18H9.5 M30.5 18H31.5 M6 10.5V13.5 M34 10.5V13.5"/>'
    + '<path class="o55nw-pod-fill" d="M12.5 6.5H27.5L30.5 9.5V33.5L26.5 37.5H13.5L9.5 33.5V9.5Z"/><path d="M12.5 6.5H27.5L30.5 9.5V33.5L26.5 37.5H13.5L9.5 33.5V9.5Z M11 12.5H29 M13 27.5H27 M13 30.5H27 M15.5 37.5L17 41.5H23L24.5 37.5"/>'
    + '<path class="o55nw-pod-ink" stroke="none" d="M15 18H25V21H15Z"/><path class="o55nw-pod-ink" stroke="none" d="M22 18H25V21H22Z" opacity=".35"/></svg>';
  const SHADOW = '<svg viewBox="0 0 40 52" aria-hidden="true"><path class="o55nw-pod-ink" d="M13 47.3H27V48.7H13Z" opacity=".32"/></svg>';
  function stage(on) {
    const r = rootEl(); if (!r) return null;
    let L = r.querySelector(':scope .o55-body > .o55nw-stage');
    if (!on) { if (L) L.remove(); return null; }
    if (L) return L;
    const body = r.querySelector('.o55-body'); if (!body) return null;
    L = document.createElement('div');
    L.className = 'o55nw-stage'; L.setAttribute('aria-hidden', 'true');
    L.innerHTML = '<i class="o55nw-sweep"></i>' + '<i class="o55nw-mote"></i>'.repeat(8)
      + '<i class="o55nw-ruler o55nw-ruler-y"></i><i class="o55nw-ruler o55nw-ruler-x"></i>'
      + `<div class="o55nw-pod"><div class="o55nw-pod-shadow">${SHADOW}</div><div class="o55nw-pod-bob">${POD}</div></div>`;
    body.appendChild(L);
    return L;
  }
  /* the brand's kicker squares and its Setup counter (02/05): shown by the CSS while YoRHa headers is installed */
  function brand(on) {
    const r = rootEl(), b = r && r.querySelector('.o55-brand'); if (!b) return;
    let k = b.querySelector(':scope > .o55nw-kick'), sub = b.querySelector(':scope > .o55nw-sub');
    if (!on) { if (k) k.remove(); if (sub) sub.remove(); return; }
    if (!k) { k = document.createElement('span'); k.className = 'o55nw-kick'; k.innerHTML = '<i></i><i></i><i></i>'; b.insertBefore(k, b.firstChild); }
    if (!sub) { sub = document.createElement('span'); sub.className = 'o55nw-sub'; b.appendChild(sub); }
    const s = O55.S, def = s && s.sess && O55.screens.defs[s.sess.screen];
    if (!def) return;
    const pr = O55.stages.progress(s, def), text = T('brand.sub', { n: two(pr.index + 1), total: two(pr.chapters.length) });
    if (sub.textContent !== text) sub.textContent = text;
  }

  /* ------------------------------------------------------------------ Pod 042 */
  /* Pod is the narrator, and the narrator never covers an actor, a hung sign or card, or the stage kicker (hero spec
     section 1 rule 8). Its strip speaks in one of two lanes of the art panel:
       'bar' just below the control bar's line (the sky between the bar and the heads);
       'lip' low over the stage lip (in front of the slab, under the actors' feet).
     anchor(o) takes the first lane, then the first place along it (by the resting Pod's corner, then the far side,
     then the middle), whose strip crosses none of those rects; o.lane asks for one lane first. When neither lane is
     clear it looks down the panel for any clear band, then takes the place that covers the least (an actor counts
     most). On the narrow window's short band the strip is one compact row (11-window-nier.css), so it fits a lane.
     The geometry is read once per line, at the start of a frame, never between frames (README Performance rule 3).
     One line at a time: a line asked for while another is still being read waits for it (an alert does not wait); a
     later line replaces a waiting one. Its dwell is its reading time, and both clocks (this queue and the strip's own
     timer in O55.nierFx) use the same number, so the words stay exactly as long as they take to read. */
  let podUntil = 0, pending = null, lastLine = '', lastAt = 0, podFrame = 0;
  const readMs = (text) => Math.round(Math.min(5600, Math.max(2400, 1500 + String(text).length * 40)));
  /* what the narrator must not cover: props it is not ('stage' the slab, 'bar' the control bar is the lane's own edge,
     the operator's 'link' and the 'dim' rule, the 'curtain' cloth, the sparks 'sp<n>' and the review's routes are set
     dressing it may pass over), the actors (weighted most), and the stage kicker; plus a card or banner hung in it */
  const SET = /^(stage|bar|link|dim|curtain|sp\d+|path\d+)$/;
  function stageMap(r) {
    const st = r.querySelector('.o55-stage'), sr = st ? st.getBoundingClientRect() : null;
    if (!sr || sr.width < 80 || sr.height < 60) return null;
    const wrap = st.querySelector(':scope > .o55-scene-wrap:not(.o55-out)');
    const box = (e) => { const b = e.getBoundingClientRect(); return b.width > 1 && b.height > 1 ? { l: b.left, t: b.top, r: b.right, b: b.bottom } : null; };
    const avoid = [];
    let bar = null, lowest = -Infinity;
    if (wrap) {
      const b = wrap.querySelector('.o55-nier-bar'); if (b) { bar = box(b); if (bar) avoid.push(Object.assign({}, bar, { w: 2 })); }
      wrap.querySelectorAll('.o55-nier-unit, .o55-nier-you, .o55-nier-mach').forEach((e) => { const x = box(e); if (x) { avoid.push(Object.assign(x, { w: 4 })); lowest = Math.max(lowest, x.b); } });
      const k = wrap.querySelector('.o55-nier-kicker'); if (k) { const x = box(k); if (x) avoid.push(Object.assign(x, { w: 3 })); }
      wrap.querySelectorAll('.o55-it').forEach((it) => {
        const key = it.getAttribute('data-key') || '';
        if (SET.test(key) || it.querySelector('.o55-nier-unit, .o55-nier-you, .o55-nier-mach')) return;
        const x = box(it); if (x) avoid.push(Object.assign(x, { w: /sign|ok|ready/.test(key) ? 3 : 1.5 }));
      });
    }
    r.querySelectorAll(':scope > .o55fx-layer :is(.o55fx-banner, .o55fx-band)').forEach((e) => { const x = box(e); if (x) avoid.push(Object.assign(x, { w: 3 })); });
    /* the panel's own furniture: the rulers along its left and bottom edges, the resting Pod's corner */
    const narrow = sr.height < 220;
    return { s: { l: sr.left + 22, t: sr.top + (narrow ? 6 : 10), r: sr.right - 12, b: sr.bottom - 18 }, bar, lowest, avoid, narrow };
  }
  /* the strip's box before it is drawn (unit + gap + strip): 11-window-nier.css caps the strip's width (280 px, 196
     slim; the narrow window's compact row up to 520 px with its head inline) and its height follows its lines */
  function stripSize(text, narrow, slim) {
    const n = String(text).length, cw = 6.8;
    if (narrow) {
      const sw = Math.min(520, 124 + n * cw), lines = Math.ceil((n * cw) / (sw - 124));
      return { w: 25 + 8 + sw, h: Math.max(34, lines * 17.5 + 17) };
    }
    const sw = slim ? 196 : 280, lines = Math.ceil(n / ((sw - 24) / cw));
    return { w: 40 + 12 + sw, h: 20 + lines * 18.75 + 20 };
  }
  const cross = (a, o) => Math.max(0, Math.min(a.r, o.r) - Math.max(a.l, o.l)) * Math.max(0, Math.min(a.b, o.b) - Math.max(a.t, o.t));
  function anchor(text, o) {
    const r = rootEl(); if (!r) return null;
    const m = stageMap(r); if (!m) return null;
    const P = m.s, GAP = 8;
    const fits = (box) => box.t >= P.t && box.b <= P.b && box.l >= P.l - 1 && box.r <= P.r + 1;
    const score = (box) => m.avoid.reduce((t, a) => t + cross(box, a) * a.w, 0);
    let best = null;
    /* along a lane: by the resting Pod's corner (right), the far side, the middle */
    const tryAt = (lane, top, size, slim) => {
      const xs = [P.r - size.w, P.l, Math.round((P.l + P.r - size.w) / 2)];
      for (const x of xs) {
        const box = { l: x, t: top, r: x + size.w, b: top + size.h };
        if (!fits(box)) continue;
        const c = score(box);
        if (!best || c < best.c) best = { c, box, lane, slim, side: x === xs[0] ? 'left' : 'right' };
        if (c === 0) return true;
      }
      return false;
    };
    const lanes = {
      bar: () => (m.bar ? Math.max(P.t, m.bar.b + GAP) : P.t + (m.narrow ? 0 : 30)),
      lip: (size) => (m.narrow || m.lowest < 0 ? P.b - size.h : Math.min(P.b - size.h, m.lowest + GAP))
    };
    const order = o && o.lane === 'lip' ? ['lip', 'bar'] : ['bar', 'lip'];
    const sizes = m.narrow ? [[stripSize(text, true), false]] : [[stripSize(text, false), false], [stripSize(text, false, true), true]];
    let done = false;
    for (const lane of order) {
      for (const [size, slim] of sizes) if (tryAt(lane, Math.round(lanes[lane](size)), size, slim)) { done = true; break; }
      if (done) break;
    }
    /* neither lane is clear: any clear band down the panel */
    if (!done) scan: for (const [size, slim] of sizes) for (let y = P.t; y + size.h <= P.b; y += 8) if (tryAt('band', y, size, slim)) break scan;
    if (!best) return null;
    /* O55.nierFx places the strip beside a point: to its right (side 'right') from the left edge of the box, or to
       its left (side 'left') ending at the box's right edge, centred on the point's height */
    const b = best.box, cy = Math.round(b.t + (b.b - b.t) / 2) - 1;
    const point = best.side === 'right' ? { left: b.l - 14, top: cy, width: 2, height: 2 } : { left: b.r + 12, top: cy, width: 2, height: 2 };
    return { point, side: best.side, lane: best.lane, slim: best.slim, box: b, clear: best.c === 0, avoid: m.avoid };
  }
  function say(text, o) {
    o = o || {};
    const F = fx(); if (!F || !text || !(F.enabled('pod') || F.enabled('voice'))) return;
    const now = M.now();
    if (text === lastLine && now - lastAt < 2500) return; /* the same words twice in a row is noise */
    if (!o.now && now < podUntil) {
      if (pending) pending.cancel();
      const wait = podUntil - now;
      pending = later(wait, () => { pending = null; say(text, Object.assign({}, o, { now: true })); });
      return;
    }
    lastLine = text; lastAt = now;
    const ms = readMs(text);
    podUntil = now + ms;
    /* placed at the start of the next frame, when the screen's style and layout are already computed */
    const t = token, f = ++podFrame;
    M.real.raf(() => {
      if (t !== token || f !== podFrame || !shown() || !painted()) return;
      const a = anchor(text, o), r = rootEl();
      if (!a || !r) return;
      if (r.hasAttribute('data-o55nw-slim') !== !!a.slim) r.toggleAttribute('data-o55nw-slim', !!a.slim);
      F.pod.say(text, { anchor: a.point, side: a.side, lead: o.lead, ms, lane: a.lane, avoid: a.avoid });
    });
  }
  function podScreen(def) {
    const R = runState(), s = O55.S, id = def.id;
    if (R.spoken.has(id)) return;
    let key = 'pod.screens.' + camel(id);
    const cm = s.sess.commit || {}, later_ = (s.sess.drafts && s.sess.drafts.main && s.sess.drafts.main.project_mode) === 'later';
    if (id === 'creating' && cm.state === 'done') key = later_ ? 'pod.creatingDoneLater' : 'pod.creatingDone';
    else if (id === 'creating' && cm.state === 'failed') key = 'pod.alert';
    else if (id === 'ready' && (later_ || cm.state !== 'done')) key = 'pod.readyLater';
    const words = line(key); if (!words) return;
    R.spoken.add(id);
    say(words);
  }
  /* the words of an error surface, when they are one short sentence (Pod reads them behind its Alert lead); otherwise
     Pod's own alert line */
  function alertWords(el, fallbackKey) {
    const span = el.querySelector(':scope > span:not(.o55-sg)') || el;
    const t = (span.textContent || '').replace(/\s+/g, ' ').trim();
    return t && t.length <= 110 ? t : line(fallbackKey || 'pod.alert');
  }

  /* ------------------------------------------------------------------ choices: brackets and the menu cursor */
  /* the chosen card or tile (and the look screen's NieR row while it is on) wears target brackets; they move with the
     choice and let go when it changes */
  const locked = new Set();
  function marks(layer) {
    const F = fx(), want = new Set();
    if (F && F.enabled('brackets') && layer && layer.isConnected && shown() && !covered()) layer.querySelectorAll('.o55-card.o55-on, .o55-tile.o55-on, .o55-nierlook[data-on="true"]').forEach((el) => want.add(el));
    locked.forEach((el) => { if (!want.has(el)) { locked.delete(el); if (O55.nierFx) O55.nierFx.brackets(el, false); } });
    want.forEach((el) => { if (!locked.has(el)) { locked.add(el); F.brackets(el, true); } });
  }
  /* LOOK's Adjust NieR look panel (.o55-nierpanel) lies over the window's interior: the screen's brackets and cursor
     stand down while it is there (they follow elements it covers), and come back when it closes */
  const covered = () => { const r = rootEl(); return !!(r && r.querySelector(':scope .o55-win > .o55-nierpanel')); };
  /* the menu cursor: the card, tile or switch under the pointer (or holding focus) becomes an ink bar with the square
     cursor stepping beside it, with the cursor's tick (O55.sound 'hover', silent outside the NieR kit) */
  const CHOICE = '.o55-card:not([aria-disabled="true"]), .o55-tile, .o55-toggle, .o55-nierlook';
  let cur = null, tick = 0;
  function point(el) {
    if (el === cur) return;
    const F = fx();
    if (cur && O55.nierFx) O55.nierFx.cursor(cur, false);
    cur = null;
    if (!el || !F || !F.enabled('cursor')) return;
    curNode = F.cursor(el, true); cur = el;
    tint();
    const now = performance.now();
    if (now - tick > 80) { tick = now; O55.sound.play('hover'); }
  }
  /* the cursor's square on a choice that is not chosen is drawn in ink (the choice is tinted, not inverted) */
  let curNode = null;
  const chosen = (el) => el.classList.contains('o55-on') || el.getAttribute('data-on') === 'true';
  function tint() {
    if (!cur || !curNode || !curNode.isConnected) return;
    const t = !chosen(cur);
    if (curNode.hasAttribute('data-o55nw-tint') !== t) curNode.toggleAttribute('data-o55nw-tint', t);
  }
  const choiceOf = (t) => { const c = t && t.closest ? t.closest(CHOICE) : null; return c && !c.closest('.o55-out') ? c : null; };
  const wired = new WeakSet();
  function wire() {
    const r = rootEl(); if (!r || wired.has(r)) return;
    wired.add(r);
    r.addEventListener('pointerover', (e) => { if (!painted() || e.pointerType === 'touch') return; const c = choiceOf(e.target); if (c) point(c); });
    const win = r.querySelector('.o55-win');
    if (win) new MutationObserver(() => { if (!painted() || !shown()) return; if (covered()) point(null); marks(layerNow()); }).observe(win, { childList: true });
    r.addEventListener('pointerout', (e) => {
      if (!cur || !painted()) return;
      const to = e.relatedTarget;
      if (to && cur.contains(to)) return;
      if (choiceOf(e.target) === cur && document.activeElement !== cur) point(null);
    });
    r.addEventListener('focusin', (e) => { if (painted()) { point(choiceOf(e.target)); M.release(reticle); } });
    /* a scroll checks the reticle once per frame (at the frame's start, never forcing a layout between frames) and
       once more when the scrolling has stopped: one pending frame and one pending timer, however many events */
    let scrollRaf = 0, scrollT = null;
    r.addEventListener('scroll', () => {
      if (!painted()) return;
      if (!scrollRaf) scrollRaf = M.real.raf(() => { scrollRaf = 0; reticle(); });
      if (scrollT) scrollT.cancel();
      scrollT = M.after(200, () => { scrollT = null; M.real.raf(reticle); });
    }, { capture: true, passive: true });
  }
  /* The page-wide focus reticle (Target brackets) frames what holds focus, and after a scroll it comes back to it. In
     the window a heading or card the pane has scrolled out of view would leave the reticle drawn over the header or
     the footer: it stands aside while its target is not wholly inside the pane's scroll box. */
  const SCROLLER = '.o55-scroll, .o55-treelist, .o55-nierpanel-scroll';
  function reticle() {
    const ret = document.getElementById('o55np-reticle'); if (!ret) return;
    const r = rootEl(), a = document.activeElement;
    let hide = false;
    if (r && shown() && painted() && a && r.contains(a)) {
      const box = a.closest(SCROLLER);
      if (box) { const A = a.getBoundingClientRect(), B = box.getBoundingClientRect(); hide = A.top < B.top - 2 || A.bottom > B.bottom + 2 || A.left < B.left - 2 || A.right > B.right + 2; }
    }
    if (ret.hasAttribute('data-o55nw-hide') !== hide) ret.toggleAttribute('data-o55nw-hide', hide);
  }

  /* ------------------------------------------------------------------ block progress */
  /* A phase list (C.phases) gets a row of ink cells above it: one cell per phase, the finished ones filled, the one
     working blinking, a failed one in the error ink, and a mono count. The CSS draws it from three numbers. */
  function meter(layer) {
    if (!layer) return;
    const on = has('blocks');
    layer.querySelectorAll('.o55-phases').forEach((ol) => {
      const items = ol.querySelectorAll(':scope > .o55-ph'), n = items.length;
      if (!on || n < 2) { if (ol.hasAttribute('data-o55nw-meter')) { ol.removeAttribute('data-o55nw-meter'); ol.style.removeProperty('--o55nw-n'); } return; }
      let done = 0, at = -1;
      items.forEach((li, i) => { if (li.classList.contains('o55-ph-done')) done++; if (at < 0 && (li.classList.contains('o55-ph-active') || li.classList.contains('o55-ph-failed'))) at = i; });
      ol.setAttribute('data-o55nw-meter', '');
      ol.style.setProperty('--o55nw-n', String(n)); ol.style.setProperty('--o55nw-k', String(done)); ol.style.setProperty('--o55nw-a', String(at));
      ol.style.setProperty('--o55nw-count', JSON.stringify(T('meter', { done: two(done), total: two(n) })));
    });
  }

  /* ------------------------------------------------------------------ errors and the Project's creation */
  const ERR = '.o55-ph-failed, .o55-banner-warn, .o55-hint.o55-err, .o55-pill-fail';
  const errKey = (el) => (el.getAttribute('data-key') || el.className) + '|' + (el.textContent || '').trim().slice(0, 80);
  const hurt = new WeakMap(); /* element -> when its alert last played (a refresh and a shake can name the same one) */
  function alertOn(el) {
    const F = fx(); if (!F || !el) return false;
    const t = M.now(); if (t - (hurt.get(el) || -1e9) < 500) return true;
    hurt.set(el, t);
    F.alert(el);
    return F.enabled('glitch') && !reduced();
  }
  function errors(layer) {
    const R = runState(), fresh = [];
    layer.querySelectorAll(ERR).forEach((el) => { const k = errKey(el); if (!R.errs.has(k)) { R.errs.add(k); fresh.push(el); } });
    if (!fresh.length) return;
    const el = fresh[0], box = el.closest('.o55-ph, .o55-field, .o55-banner, .o55-row, .o55-provider') || el;
    alertOn(box);
    const words = el.classList.contains('o55-ph-failed') ? line('pod.alert') : alertWords(el);
    later(280, () => say(words, { now: true, lead: 'alert' }));
  }
  function created() {
    const s = O55.S, R = runState(), cm = s.sess.commit || {}, was = R.commit;
    R.commit = cm.state;
    if (s.sess.screen !== 'creating' || cm.state !== 'done' || was === 'done' || was == null) return;
    const F = fx(); if (!F) return;
    const d = s.sess.drafts.main || {}, laterMode = d.project_mode === 'later';
    R.spoken.add('creating');
    later(320, () => {
      /* the line about creating it goes with the banner that says it is made; Pod's report follows the banner */
      if (F.pod) F.pod.hush();
      podUntil = 0;
      const go = F.enabled('banner')
        ? F.banner({ kicker: O55.t('nierFx.banner.kickers.goalComplete'), title: T(laterMode ? 'banner.serverReady' : 'banner.created'), sub: laterMode ? '' : (d.project_name || ''), ms: 1800 })
        : Promise.resolve(false);
      const t = token;
      go.then(() => { if (t === token) later(160, () => say(line(laterMode ? 'pod.creatingDoneLater' : 'pod.creatingDone'))); });
    });
  }

  /* ------------------------------------------------------------------ Back's page wipe (O55.nierFx.wipe steps off to the right) */
  /* the same ruled band in the pane, mirrored: it steps off to the left, so Back reads as going back */
  function wipeBack(pane) {
    const F = fx(); if (!F || !F.enabled('wipe') || calm() || !pane) return;
    const b = document.createElement('div');
    b.className = 'o55fx-wipe o55nw-wipe'; b.setAttribute('aria-hidden', 'true'); b.innerHTML = '<i><b></b></i>';
    const win = pane.closest('.o55-win'), ground = win ? getComputedStyle(win).backgroundColor : '';
    if (ground) b.style.setProperty('--o55fx-ground', ground);
    pane.appendChild(b);
    const a = b.firstElementChild.animate([{ transform: 'translateX(0)', offset: 0 }, { transform: 'translateX(0)', offset: 0.16, easing: 'steps(8, end)' }, { transform: 'translateX(101%)', offset: 1 }],
      { duration: 380, fill: 'forwards' });
    const end = () => b.remove();
    a.finished.then(end, end);
  }

  /* ------------------------------------------------------------------ keeping the overlay true to the look */
  function sync() {
    const on = painted() && !!rootEl();
    stage(on); brand(on);
    if (on) wire();
    if (!on) { cancelAll(); point(null); marks(null); podUntil = 0; reticle(); }
  }
  /* NieR Mode turned on or off, or a part installed or removed, while the window is open (the look screen's preview) */
  new MutationObserver(() => {
    if (!rootEl()) return;
    sync();
    if (!painted() || !shown()) return;
    const L = layerNow(); if (!L || L.classList.contains('o55-hold')) return;
    /* NieR Mode arrived on a screen already showing: the screen is taken as it is, without its entrance effects */
    const R = runState();
    if (R.layer !== L) { const s = O55.S, def = O55.screens.defs[s.sess.screen]; if (def) adopt(L, def); R.marksAt = 0; }
    marks(L); meter(L); brand(true);
    if (cur && !has('cursor')) point(null);
  }).observe(html, { attributes: true, attributeFilter: ['data-o55-nier', 'data-o55-nier-parts'] });
  /* the screen this skin is drawing: its chapter, heading, errors already shown and the Project's state */
  function adopt(layer, def) {
    const s = O55.S, R = runState(), pr = O55.stages.progress(s, def), h = layer.querySelector('#o55-h');
    R.idx = pr.index; R.chapter = pr.current; R.title = h ? h.textContent : ''; R.layer = layer;
    R.commit = (s.sess.commit || {}).state || null;
    R.errs = new Set(); layer.querySelectorAll(ERR).forEach((el) => R.errs.add(errKey(el)));
    return pr;
  }

  /* ------------------------------------------------------------------ a screen's entrance under NieR Mode */
  function draw(layer, dir, def, pr, prevIdx, prevChapter, F) {
    const R = runState(), pane = layer.parentElement, h = layer.querySelector('#o55-h');
    const chapterMove = dir !== 'open' && prevChapter && prevChapter !== pr.current;
    /* 1. the reveal: a page wipe when the chapter changes (mirrored going back), else the content slices open */
    if (!calm()) {
      if (chapterMove && F.enabled('wipe')) { if (dir === 'back') wipeBack(pane); else F.wipe(pane); }
      else if (dir !== 'open') F.slice(layer.querySelector('.o55-scroll'));
    }
    /* 2. the title resolves from scrambled glyphs, with its decode chatter under the screen change */
    if (h) F.decode(h, { sound: true });
    /* 3. what comes next: the opening band, or a chapter finished, then Pod's line for the screen */
    let wait = 760;
    const t = token, then = (fn) => () => { if (t === token) fn(); };
    const podNext = () => (dir === 'open' && opening === 'resume' ? say(line('pod.resumed')) : podScreen(def));
    if (dir === 'open') {
      const kind = opening; opening = null;
      if (kind && has('boot') && F.enabled('band') && !reduced()) {
        wait = -1;
        later(260, () => F.band(kind === 'resume' ? T('band.resume') : O55.t('nierFx.band.lines.setupStart'), 1500)
          .then(then(() => later(220, podNext))));
      }
    } else if (dir === 'fwd' && prevIdx >= 0 && pr.index > prevIdx && prevChapter && !R.chapters.has(prevChapter) && F.enabled('banner')) {
      R.chapters.add(prevChapter);
      wait = -1;
      later(reduced() ? 120 : 420, () => F.banner({ kicker: O55.t('nierFx.banner.kickers.chapterDone'), title: O55.t('chapters.' + prevChapter),
        sub: T('banner.next', { chapter: O55.t('chapters.' + pr.current) }), ms: 1700 }).then(then(() => later(180, podNext))));
    }
    if (wait >= 0) later(wait, podNext);
    /* 4. brackets lock on to the chosen card once the entrance has settled (its blocks have stopped arriving), at the
       start of a frame */
    M.settled(layer, { fallback: 2600 }).then(() => {
      if (t !== token) return;
      M.real.raf(() => { if (t === token && layer.isConnected && shown() && painted()) { R.marksAt = 0; marks(layer); } });
    });
  }

  /* ================================================================== the hooks */
  let opening = null; /* the band the window opens with: 'start' or 'resume' */
  O55.nierWindow = {
    stepped() { return painted(); },

    open(o) {
      opening = o && o.resumed ? 'resume' : 'start';
      const R = runState(); R.idx = -1; R.chapter = null;
      cancelAll(); podUntil = 0;
      return false;
    },

    /* a screen change begins (the click, two frames before the new screen is released): what the skin follows on the
       old screen lets go now, so no bracket, cursor or Pod line is left over the pane once the old screen has gone;
       the old screen's words go with it */
    leaving() {
      if (!painted()) return false;
      point(null); marks(null);
      cancelAll(); podUntil = 0;
      if (O55.nierFx && O55.nierFx.pod) O55.nierFx.pod.hush();
      return false;
    },

    screen(layer, dir) {
      sync();
      if (!painted() || !layer || !layer.isConnected) return false;
      const s = O55.S, def = O55.screens.defs[s.sess.screen]; if (!def) return false;
      point(null);
      cancelAll();
      if (O55.nierFx && O55.nierFx.pod) O55.nierFx.pod.hush(); /* none left after leaving(); the opening has no old screen */
      podUntil = 0;
      const R = runState(), prevIdx = R.idx, prevChapter = R.chapter;
      /* error surfaces already on the new screen are part of it, not news */
      const pr = adopt(layer, def);
      /* the brackets wait for the entrance to settle (step 4) */
      R.at = M.now(); R.marksAt = Infinity;
      meter(layer); brand(true);
      const F = fx(); if (!F) return false;
      /* The effects start at the next frame. This frame (the release) styles and lays out the new screen once; the
         effects' measurements (the wipe's and the slice's rects, the title's box, the ground) then read a finished
         layout instead of forcing it again in the middle of it (films M1: those forced passes made every NieR screen
         change a long task and switched the window into low-resource mode). Nothing shows early: the entrance's
         blocks are still unseen for their first steps, and the old screen still holds for its first step. */
      const t = token;
      M.real.raf(() => { if (t === token && layer.isConnected && !layer.classList.contains('o55-out') && shown() && painted()) draw(layer, dir, def, pr, prevIdx, prevChapter, F); });
      return true;
    },

    refresh(layer) {
      sync();
      if (!painted() || !layer || !shown()) return false;
      const R = runState();
      meter(layer);
      /* a screen's own first render (its mounted() refreshes it while it is still held) is the screen hook's to draw */
      if (R.layer !== layer) return false;
      /* brackets wait for the screen's entrance (until then the cards are still arriving) */
      if (M.now() >= (R.marksAt || 0)) marks(layer);
      tint(); /* a pick under the cursor turns its tint into the chosen inversion */
      brand(true);
      /* the heading's words changed in place (Creating finished, a retry): they decode */
      const h = layer.querySelector('#o55-h'), title = h ? h.textContent : '';
      if (h && R.title && title !== R.title) { const F = fx(); if (F) F.decode(h); }
      R.title = title;
      errors(layer);
      created();
      return false;
    },

    refused(el) {
      const F = fx(); if (!F || !el || !F.enabled('glitch') || reduced()) return false;
      F.glitch(el);
      return true;
    },

    shake(field) {
      if (!painted() || !field) return false;
      const drawn = alertOn(field);
      const hint = field.querySelector('.o55-hint.o55-err');
      if (hint) runState().errs.add(errKey(hint));
      later(240, () => say(hint ? alertWords(hint, 'pod.alertField') : line('pod.alertField'), { now: true, lead: 'alert' }));
      return drawn;
    },

    op(key) {
      if (!painted()) return false;
      const s = O55.S, cm = s.sess.commit || {};
      if (key === cm.key) return false; /* the Project's creation has its own banner and line */
      const lines = O55.tx('nierWindow.pod.ops'); if (!Array.isArray(lines) || !lines.length) return false;
      const R = runState();
      /* the checks a screen runs by itself on arrival are part of the screen (its own line covers them); Pod reports
         the operations the person set going */
      if (M.now() - (R.at || 0) < 2600) return false;
      const words = lines[R.ops++ % lines.length];
      later(380, () => say(words));
      return true;
    },

    close(reason, handoff) {
      cancelAll(); point(null); marks(null); podUntil = 0; opening = null;
      const ret = document.getElementById('o55np-reticle'); if (ret) ret.removeAttribute('data-o55nw-hide');
      if (O55.nierFx && O55.nierFx.pod) O55.nierFx.pod.hush();
      if (painted() && reason === 'done') handover(!!handoff);
      return false;
    }
  };

  /* Setup is done: a "Setup complete" band. Into the Guided Tour (handoff) it plays over the tour, unless the tour opens
     with a band of its own (its opening band is the same moment); into the app it plays once the window has gone. */
  function handover(handoff) {
    const F = fx(); if (!F || !has('boot') || !F.enabled('band') || reduced()) return;
    const text = O55.t('nierFx.band.lines.setupDone');
    let tries = 0;
    const go = () => {
      if (!painted()) return;
      const tour = document.getElementById('pm-o55-tour');
      const touring = tour && !tour.hidden && html.hasAttribute('data-o55-tour');
      if (handoff && touring) { if (!tour.querySelector('.o55fx-band')) F.band(text, 1400, { within: tour }); return; }
      if (html.hasAttribute('data-o55-open')) { if (++tries < 12) M.after(120, go); return; }
      F.band(text, 1400);
    };
    M.after(handoff ? 140 : 360, go);
  }

})();
