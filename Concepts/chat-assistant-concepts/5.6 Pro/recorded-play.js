/* recorded-play.js -- the player the recorded examples share (2026-10-22).
 *
 * Jared (2026-10-21, then for every other Demo Studio example on 2026-10-22): recorded examples play on their own after
 * you press Start. An example hands the player a script: next() reads the example's own state and names the next beat,
 * or nothing while the example waits for you (an approval, a confirm, a decision the run is waiting on) or has ended.
 * The player runs one beat at a time on PM56_CLOCK (motion time), so every moment stays on screen long enough to read:
 *   - a beat waits its `wait` (motion ms since the last beat ran) before it runs;
 *   - press() plays your part on the product's own control: the control is lit where a finger would land, then it is
 *     clicked, so it does exactly what your click would (the app's own handler runs);
 *   - type() types into the message box, a few letters at a time, the way a person would;
 *   - choose() sets a field (a select or an input) the same visible way.
 * The player never waits on the guide: the guide narrates what is happening and what comes next (steady() keeps each
 * sentence on screen for at least HOLD_SAY). It holds, without losing its place, while another chat is shown, while a
 * sheet or menu the next beat doesn't expect is open (Demo Studio included) and while the window is hidden; after a hold
 * it waits a beat (RESUME) before it goes on. If you do a step yourself, next() sees it in the state and moves past it.
 * Replay, Close, Reset all and another example's Start stop it for good (stop()).
 * Nothing here calls a model, a provider or a native command: a beat only does what the example's own controls do. */
(function () {
  'use strict';
  var E = window.PM56_EXT;
  var HOLD_SAY = 2200, RESUME = 1400, POLL = 300, AIM = 560, PRESS = 150, TRIES = 40;
  var players = Object.create(null);

  function K() { return window.PM56_CLOCK; }
  function now() { var k = K(); return k && k.now ? k.now() : performance.now(); }
  function after(ms, fn) { var k = K(); return k && k.after ? k.after(ms, fn) : { t: setTimeout(fn, ms), plain: true }; }
  function cancel(h) { if (!h) return; var k = K(); if (h.plain) clearTimeout(h.t); else if (k && k.cancel) k.cancel(h); }
  function wait(ms) { return new Promise(function (r) { after(ms, r); }); }
  function reduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function ctx() { return E && E.ctx ? E.ctx() : null; }

  /* ------------------------------------------------------------------ the visible press */
  function shown(el) { return !!(el && el.isConnected && el.getClientRects().length && !el.disabled && !el.closest('.pmx-ghost')); }
  function find(t) {
    if (!t) return null;
    if (typeof t === 'function') t = t();
    if (typeof t === 'string') { var list = document.querySelectorAll(t); for (var i = 0; i < list.length; i++) if (shown(list[i])) return list[i]; return null; }
    if (t && t.length != null && typeof t !== 'string' && !t.nodeType) { for (var j = 0; j < t.length; j++) if (shown(t[j])) return t[j]; return null; }
    return shown(t) ? t : null;
  }
  /* the recording's finger: one fixed box outside #pmRoot (a render never removes it) that rings the control it is about
     to press, follows it if the layout moves, dips as it presses and fades */
  var ring = null, ringRaf = 0, ringEl = null;
  function ringNode() {
    if (ring && ring.isConnected) return ring;
    ring = document.createElement('div'); ring.className = 'rec-tap'; ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring); return ring;
  }
  function place() {
    ringRaf = 0; if (!ring || !ringEl) return;
    if (!ringEl.isConnected) { ring.setAttribute('data-state', 'off'); return; }
    var r = ringEl.getBoundingClientRect();
    ring.style.left = (r.left - 4) + 'px'; ring.style.top = (r.top - 4) + 'px'; ring.style.width = (r.width + 8) + 'px'; ring.style.height = (r.height + 8) + 'px';
    if (ring.getAttribute('data-state') !== 'off') ringRaf = requestAnimationFrame(place);
  }
  function light(el, state) {
    var n = ringNode(); ringEl = el; n.setAttribute('data-state', state || 'aim');
    if (!ringRaf) place();
  }
  function dark() { if (ring) ring.setAttribute('data-state', 'off'); ringEl = null; }
  function bring(el) { try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { } }

  /* reveal(css): show controls that only appear on hover (a message's Copy and More row) while the finger is on them,
     the way the pointer resting there would; a style rule, so a render in between doesn't take it away */
  var veil = null;
  function reveal(css) {
    if (!veil || !veil.isConnected) { veil = document.createElement('style'); veil.id = 'rec-reveal'; document.head.appendChild(veil); }
    veil.textContent = css ? css + '{opacity:1!important;visibility:visible!important;transform:none!important;transition:none!important}' : '';
  }
  /* press(target, {aim, via, reveal}): light the control, then press it. target is a selector, an element, a list or a function
     returning one; a render may replace the element while it is lit, so it is found again before the click. Resolves
     true once pressed, false when no such control is on screen (the beat then stays to do, and is tried again). */
  function press(t, o) {
    o = o || {};
    reveal(o.reveal || '');
    var el = find(t); if (!el) { if (o.reveal) reveal(''); return Promise.resolve(false); }
    bring(el); light(el, 'aim');
    return wait(reduced() ? 240 : (o.aim || AIM)).then(function () {
      var x = shown(el) ? el : find(t); if (!x) { dark(); if (o.reveal) reveal(''); return false; }
      light(x, 'press');
      return wait(PRESS).then(function () {
        var y = shown(x) ? x : find(t); if (!y) { dark(); if (o.reveal) reveal(''); return false; }
        if (o.via) o.via(y); else y.click();
        after(260, function () { if (ringEl === y || !ringEl || !ringEl.isConnected) dark(); if (o.reveal && !o.keep) reveal(''); });
        return true;
      });
    });
  }
  /* hover(target, {reveal}): rest the finger on something that shows more on hover (a reply's ticks): it is ringed and
     its hover-only row stays shown until rest() or the next press. Resolves false when it isn't on screen. */
  function hover(t, o) {
    o = o || {};
    if (o.reveal) reveal(o.reveal);
    var el = find(t); if (!el) { if (o.reveal) reveal(''); return Promise.resolve(false); }
    bring(el); light(el, 'aim'); return Promise.resolve(true);
  }
  function rest() { dark(); reveal(''); }
  /* choose(target, value): set a select or an input as a person would (lit, then changed; input and change fire) */
  function choose(t, value, o) {
    o = o || {};
    var el = find(t); if (!el) return Promise.resolve(false);
    bring(el); light(el, 'aim');
    return wait(reduced() ? 240 : (o.aim || AIM)).then(function () {
      var x = shown(el) ? el : find(t); if (!x) { dark(); return false; }
      light(x, 'press'); x.value = value;
      x.dispatchEvent(new Event('input', { bubbles: true })); x.dispatchEvent(new Event('change', { bubbles: true }));
      after(300, dark); return true;
    });
  }
  /* type(text, {into, cps}): type into the message box (or another field) a few letters at a time. The field is lit
     while it types; it takes focus only when nothing else has it, so it never pulls focus from what you are doing. */
  var COMPOSER = 'textarea[data-input="composer"]';
  function type(text, o) {
    o = o || {};
    var sel = o.into || COMPOSER, el = find(sel); if (!el) return Promise.resolve(false);
    bring(el); light(el, 'aim');
    var a = document.activeElement; if (!a || a === document.body) { try { el.focus({ preventScroll: true }); } catch (e) { } }
    var i = Number(o.from) || 0, cps = o.cps || 34, step = reduced() ? text.length : 1;
    return new Promise(function (done) {
      function next() {
        var f = shown(el) ? el : find(sel); if (!f) { dark(); done(false); return; }
        el = f; i = Math.min(text.length, i + step + (Math.random() < 0.3 ? 1 : 0));
        f.value = text.slice(0, i); f.dispatchEvent(new Event('input', { bubbles: true }));
        try { f.setSelectionRange(i, i); } catch (e) { }
        if (i >= text.length) { after(240, function () { dark(); done(true); }); return; }
        /* a short pause after a word or a comma reads like typing, not like a printer */
        var ch = text.charAt(i - 1), gap = 1000 / cps * (/[ ,.]/.test(ch) ? 1.8 : 1);
        after(gap, next);
      }
      after(reduced() ? 0 : 220, next);
    });
  }

  /* viaWand(key, group, rowSel, o): the beat that reaches a row of the composer's wand menu the way a person does: the
     wand, its group (Assist, Schedule, ...) when the row lives in one, then the row. o.wait (before the wand), o.step
     (between the presses). Returns null once nothing is left to press here (the row was pressed: its sheet is open). */
  function viaWand(key, group, rowSel, o) {
    o = o || {}; var c = ctx(), m = c && c.state.menu;
    if (find(rowSel)) return { id: key + ':row', menu: true, wait: o.step || 1300, run: function () { return press(rowSel); } };
    if (m && m.type === 'wand' && group && c.state.polishWandGroup !== group) {
      var g = '[data-action="polish-wand-group"][data-group="' + group + '"]';
      return { id: key + ':group', menu: true, wait: o.step || 1300, run: function () { return press(g); } };
    }
    if (m && m.type === 'wand') return { id: key + ':row', menu: true, wait: o.step || 1300, run: function () { return press(rowSel); } };
    return { id: key + ':wand', wait: o.wait == null ? 1000 : o.wait, run: function () { return press('.composer [data-menu-anchor="wand"]'); } };
  }

  /* ------------------------------------------------------------------ the guide's sentences */
  /* steady(store, text, urgent, rerender): the sentence to show now. A new sentence replaces the one on screen only once
     that one has been up HOLD_SAY; your move and the end (urgent) show at once. store is the example's session (it keeps
     .say and .sayTimer); rerender is called when a held sentence may change. */
  function steady(store, text, urgent, rerender) {
    if (!store) return text;
    var t = now(), say = store.say;
    if (!say || say.text === text || urgent || say.urgent || t - say.at >= HOLD_SAY) {
      if (!say || say.text !== text) store.say = { text: text, at: t, urgent: !!urgent };
      return text;
    }
    if (!store.sayTimer) store.sayTimer = after(HOLD_SAY - (t - say.at) + 30, function () { store.sayTimer = null; if (rerender) rerender(); });
    return say.text;
  }

  /* ------------------------------------------------------------------ the player */
  /* play(o): o.key (one player per key; a new play() stops the old one), o.live() (false ends it), o.threads() (the
     example's chat ids; it holds while another is shown), o.next() -> beat | null, o.first (motion ms before the first
     beat; well inside 2 s so nothing sits still after Start), o.render (called after a beat that changed nothing visible
     by itself). A beat is {id, wait, run, dialog, menu}: id names it once (a beat that ran is never run again), wait is
     its time on screen after the previous beat, run() does it (returns false or a promise of false when its control
     isn't on screen yet: it is tried again), dialog/menu say the beat expects that sheet (a type string, true for any)
     or menu to be open, so the player doesn't hold for it. */
  function play(o) {
    /* one recording plays at a time: a new one ends the others (each hears superseded(), and lets its example go) */
    Object.keys(players).forEach(function (k) { var q = players[k]; q.stop(); if (k !== o.key && q.o.superseded) q.o.superseded(); });
    var p = { key: o.key, o: o, done: Object.create(null), log: [], errors: [], tries: Object.create(null), timer: null, busy: false, stopped: false, held: false, last: now(), started: now(), ended: false };
    players[o.key] = p;
    function holdReason(b) {
      var c = ctx(); if (!c) return 'no app';
      if (document.hidden) return 'hidden';
      var ids = o.threads ? [].concat(o.threads()) : null;
      if (ids && ids.indexOf(c.state.selectedThread) < 0) return 'another chat';
      var d = c.state.dialog;
      if (d && !(b && b.dialog && (b.dialog === true || b.dialog === d.type || (b.dialog.test && b.dialog.test(d.type))))) return 'sheet';
      if (c.state.menu && !(b && b.menu)) return 'menu';
      return '';
    }
    function arm(ms) { cancel(p.timer); if (!p.stopped) p.timer = after(Math.max(0, ms), tick); }
    function tick() {
      p.timer = null; if (p.stopped) return;
      if (o.live && !o.live()) { p.stop(); return; }
      if (p.busy) { arm(POLL); return; }
      var b = null;
      try { b = o.next(); } catch (e) { fail(e); return; }
      while (b && p.done[b.id]) b = null;
      /* the beat coming next changed by itself (the example moved on, or you did a step): the guide says so now */
      var upId = b ? b.id : null;
      if (upId !== p.upId) { var first = p.upId === undefined; p.upId = upId; if (!first && o.render) o.render(); }
      if (!b) { p.waiting = true; arm(POLL); return; }
      p.waiting = false;
      var why = holdReason(b);
      if (why) { if (!p.held) { p.held = why; } arm(POLL); return; }
      if (p.held) { p.held = false; p.last = Math.max(p.last, now() - Math.max(0, (b.wait || 0) - RESUME)); }
      /* notBefore: an absolute motion time a beat may not run before (a moment the product reached by itself, held long
         enough to read, however long ago the last beat ran) */
      var due = Math.max(p.last + (b.wait || 0), b.notBefore || 0) - now();
      if (due > 12) { arm(due); return; }
      p.busy = true; p.current = b.id;
      var out;
      try { out = b.run(); } catch (e) { p.busy = false; fail(e); return; }
      Promise.resolve(out).then(function (ok) {
        p.busy = false; p.current = null; if (p.stopped) return;
        if (ok === false) {
          p.tries[b.id] = (p.tries[b.id] || 0) + 1;
          if (p.tries[b.id] >= TRIES) { fail(new Error('recorded step ' + b.id + ' found no control to press')); return; }
          arm(POLL * 2); return;
        }
        p.done[b.id] = 1; p.last = now(); p.log.push({ id: b.id, at: Math.round(now() - p.started) });
        if (o.render) o.render();
        arm(60);
      }, function (e) { p.busy = false; fail(e); });
    }
    function fail(e) { p.errors.push(String(e && e.message || e)); p.stop(); if (o.render) o.render(); if (o.onError) o.onError(e); }
    p.stop = function () { p.stopped = true; cancel(p.timer); p.timer = null; if (players[p.key] === p) delete players[p.key]; dark(); reveal(''); };
    /* upcoming(): the beat that comes next (for the guide's "Next: ..."), or null while the example waits for you */
    p.upcoming = function () { if (p.stopped) return null; var b = null; try { b = o.next(); } catch (e) { } return b && !p.done[b.id] ? b : null; };
    p.ran = function (id) { return !!p.done[id]; };
    /* stepNow(): run the next beat at once, without its wait (a harness walking a held recording a step at a time) */
    p.stepNow = function () {
      if (p.stopped || p.busy) return Promise.resolve(false);
      var b = null; try { b = o.next(); } catch (e) { return Promise.resolve(false); }
      if (!b || p.done[b.id]) return Promise.resolve(false);
      p.busy = true;
      return Promise.resolve().then(b.run).then(function (ok) {
        p.busy = false; if (ok === false) return false;
        p.done[b.id] = 1; p.last = now(); p.log.push({ id: b.id, at: Math.round(now() - p.started), step: true }); if (o.render) o.render(); return true;
      }, function (e) { p.busy = false; p.errors.push(String(e && e.message || e)); return false; });
    };
    /* a lint harness that drives an example through its own QA hooks (tests/pmx-surfaces) sets PM56_RECPLAY_HOLD: the
       recording then holds from the start (the guide still narrates the state the harness reaches), never racing it */
    if (window.PM56_RECPLAY_HOLD) { p.held = 'harness'; return p; }
    /* progress(): the dwell before the next beat, in real ms ({ms, at}: its length and how far in), for the guide's
       next-step line; null while it waits for you, holds, or a beat is running */
    p.progress = function () {
      if (p.stopped || p.busy || p.held) return null; var b = p.upcoming(); if (!b) return null;
      var t = now(), from = b.notBefore && b.notBefore > p.last + (b.wait || 0) ? b.since || p.last : p.last, to = Math.max(p.last + (b.wait || 0), b.notBefore || 0); if (to - t < 200) return null;
      var k = K(), real = function (v) { return k && k.ms ? k.ms(v) : v; };
      return { ms: Math.round(real(to - from)), at: Math.round(real(t - from)) };
    };
    arm(o.first == null ? 900 : o.first);
    return p;
  }
  /* seen(store, key): the motion time store first saw key (a moment the product reached by itself), for notBefore */
  function seen(store, key) { store.__seen = store.__seen || {}; if (store.__seen[key] == null) store.__seen[key] = now(); return store.__seen[key]; }
  function stopAll(why) { Object.keys(players).forEach(function (k) { var q = players[k]; q.stop(); if (why && q.o.superseded) q.o.superseded(); }); reveal(''); }
  /* step(): the held recording's next beat, now (tests/pmx-surfaces drive()); resolves true when one ran */
  function step() { var k = Object.keys(players)[0]; return k ? players[k].stepNow() : Promise.resolve(false); }
  function snapshot() { var out = {}; Object.keys(players).forEach(function (k) { var p = players[k]; out[k] = { log: p.log.slice(), errors: p.errors.slice(), waiting: !!p.waiting, held: p.held || '', current: p.current || null }; }); return out; }

  if (E && E.chainAction) E.chainAction('reset-all', function () { stopAll('reset'); return false; });
  /* a Start in Demo Studio (any example's, including the ones that don't use this player) ends the recording playing now;
     capture phase, so it runs before the new example's own Start */
  document.addEventListener('click', function (e) { var t = e.target && e.target.closest && e.target.closest('.demo-dialog .demo-trigger'); if (t) stopAll('another example'); }, true);
  window.PM56_RECPLAY = { play: play, step: step, seen: seen, viaWand: viaWand, press: press, reveal: reveal, hover: hover, rest: rest, choose: choose, type: type, steady: steady, find: find, shown: shown, wait: wait, after: after, cancel: cancel, now: now, stopAll: stopAll, snapshot: snapshot, players: players, HOLD_SAY: HOLD_SAY, COMPOSER: COMPOSER };
})();
