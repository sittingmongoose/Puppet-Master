/* nier-parts.js — NieR Mode parts for the 5.6 Pro concept, the script half: Look, Motion, Sound & voice and Pointer.
 * OWNER: NieR Mode, steps N-A (2026-10-02: the Look parts) and N-B (2026-10-02: Motion, Sound & voice). The World parts
 * are nier-world.js, the scenes nier-scenes.js; the styles are nier-parts.css; the contract and window.PM_NIER are
 * nier.js. Ported from PMConcept7's kit.d/19-nier-parts.js (the same layer ids, timings, copy and synth), with the
 * concept's own surfaces.
 *
 * A part is live while PM_NIER.has(key); each part installs when its key arrives and removes everything it added when
 * the key goes (PM_NIER.onChange), so every part is silent while NieR Mode is off.
 *   square, headers, ground, diamonds, slice, pointer, icons   CSS only (the parts attribute)
 *   cursor     one shared cursor (#o55np-cursor) beside the hovered or keyboard-focused menu item, picker row, thread
 *              row or wand row, placed by transform on pointerover and focusin
 *   brackets   one reticle of four corners (#o55np-reticle) on keyboard focus, and for 1.2 s on a chosen thread or tab
 *   reboot     PM_NIER.setTransition: the plate grows from the pressed control in that look's NieR ground, the theme
 *              is picked under full cover, then a six-slat tear-out (and, turning off, slats close and the plate folds
 *              back). Demo Studio's theme row, PM_NIER.set, Play reboot moment (nier.js switchTo)
 *   decode     the thread title on a thread switch, the head of an arriving assistant turn or card, arriving toasts
 *   wipe       a band over the transcript while a switched-to thread draws, sliding off (#o55np-wipe)
 *   particles  twelve ink motes drifting over the transcript (#o55np-ground, CSS-anchored to it), and a burst of six
 *              thrown off an arriving alert
 *   sweep      one faint scan line down the window every 12 s (#o55np-sweep, a timer and a one-shot animation), and
 *              one across each arriving alert
 *   glitch     an arriving alert jitters in steps: a warning or error toast splits in two (clones in #o55np-fx), a
 *              refusal or a failed card tears (two ink strips in #o55np-fx)
 *   sounds     PMConcept7's small synth (ticks, select, confirm, cancel, the Pod's chirp, the alert, the reboot sweep),
 *              played through chat-sound.js (PM56_SOUND.synth), so its mute and gesture rules hold
 *   voice      CSS leads (Report / Alert / Proposal) and the POD 042 band; a toast's kind is written at arrival
 *   pod        #o55np-pod bobbing by CSS above the composer's corner; it turns toward each arriving toast, and fades back
 *              while a control lies under it (data-shy)
 * Alerts are warning and error toasts (by their words; the concept's toasts carry no severity), refusals (.pmx-refusal
 * appearing anywhere) and failed events (an arriving card in a failed, blocked or danger state; an Orbit step failing).
 * Arrivals are read from the concept's own afterRender observer slot (app.js: after every renderApp, renderOverlays and
 * work-tick patch), which hands this the state it just drew, so no observer watches the page.
 * Performance (PMConcept7's rules): no requestAnimationFrame loop, no MutationObserver; rects are read only on input
 * events or once per arrival, before any write; motion is CSS or a one-shot Web Animation of transform and opacity.
 * Every layer is a child of <body>, outside #pmRoot, so the app's DOM patch never meets it.
 */
(function () {
  'use strict';
  var html = document.documentElement;
  var N = function () { return window.PM_NIER || null; };
  var has = function (key) { var n = N(); try { return !!(n && n.has(key)); } catch (e) { return false; } };
  /* installed whether or not NieR Mode is painted (the reboot runs before the repaint when it turns on) */
  var installed = function (key) { var n = N(); try { return !!(n && n.parts().indexOf(key) >= 0); } catch (e) { return false; } };
  var still = function () {
    return html.getAttribute('data-motion') === 'reduced' || (document.body && document.body.classList.contains('pm56-reduced')) ||
      !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  var tone = function () { return /-light$/.test((document.body && document.body.getAttribute('data-theme')) || '') ? 'light' : 'dark'; };
  var frames = function (n) { return new Promise(function (res) { var step = function () { if (--n <= 0) res(); else window.requestAnimationFrame(step); }; window.requestAnimationFrame(step); }); };
  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  /* a fixed overlay layer on <body>; each part names its layer with a literal id (tests/orphan-gate.mjs reads id
     literals to match the stylesheet's #o55np-* rules) */
  function layer() {
    var e = document.createElement('div');
    e.setAttribute('aria-hidden', 'true');
    document.body.appendChild(e);
    return e;
  }

  /* ---------- the part registry ------------------------------------------------------------------------------------ */
  var PARTS = {};
  var live = {};
  function sync() {
    if (!document.body) return;
    Object.keys(PARTS).forEach(function (key) {
      var want = has(key);
      if (want === !!live[key]) return;
      live[key] = want;
      try { PARTS[key][want ? 'on' : 'off'](); } catch (e) { /* a part never breaks the app */ }
    });
    listen();
    if (fx && !live.glitch && !live.sweep && !live.particles) { fx.remove(); fx = null; }
  }

  /* ---------- sounds: PMConcept7's synth of the game's menu blips, through chat-sound.js ------------------------------ */
  var buses = typeof WeakMap !== 'undefined' ? new WeakMap() : null, lastTick = 0, sfxLog = [];
  function busFor(ctx, out) {
    /* the synth's own level (PMConcept7's 0.6) into chat-sound's master chain, one per audio context */
    var b = buses && buses.get(ctx);
    if (!b) { b = ctx.createGain(); b.gain.value = 0.6; b.connect(out); if (buses) buses.set(ctx, b); }
    return b;
  }
  function blip(c, bus, t, f, dur, gain, type, f2) {
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.03);
  }
  function sweepTone(c, bus, t, up) {
    var o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(up ? 98 : 196, t); o.frequency.exponentialRampToValueAtTime(up ? 196 : 98, t + 0.55);
    f.type = 'lowpass'; f.Q.value = 7; f.frequency.setValueAtTime(up ? 260 : 3400, t); f.frequency.exponentialRampToValueAtTime(up ? 3400 : 260, t + 0.5);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
    o.connect(f); f.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.66);
    blip(c, bus, t + (up ? 0.5 : 0.02), up ? 1760 : 880, 0.12, 0.03);
  }
  /* the world waking: A3, E4 and A4, two sawtooths each, detuned ±6 cents, through a low-pass that opens, plus one
     sine at 1318.5 Hz. About 1.6 s. Played on the reveal when NieR turns on or the moment is replayed, never after
     turning off (this concept has no family reveal sound). */
  function wakeChord(c, bus, t) {
    [220, 329.63, 440].forEach(function (f, i) {
      var lp = c.createBiquadFilter(), g = c.createGain(), peak = 0.016 - i * 0.003;
      lp.type = 'lowpass'; lp.Q.value = 0.7;
      lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(1500, t + 0.5);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.28);
      g.gain.setValueAtTime(peak, t + 0.9); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      lp.connect(g); g.connect(bus);
      [-6, 6].forEach(function (cents) {
        var o = c.createOscillator();
        o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = cents;
        o.connect(lp); o.start(t); o.stop(t + 1.65);
      });
    });
    blip(c, bus, t + 0.04, 1318.5, 1.1, 0.022);
  }
  var SFX = {
    tick: function (c, b, t) { blip(c, b, t, 2640, 0.026, 0.028); },
    select: function (c, b, t) { blip(c, b, t, 1480, 0.05, 0.045, 'triangle'); blip(c, b, t + 0.038, 2220, 0.07, 0.035); },
    confirm: function (c, b, t) { blip(c, b, t, 988, 0.08, 0.05, 'triangle'); blip(c, b, t + 0.07, 1480, 0.17, 0.05, 'triangle'); },
    cancel: function (c, b, t) { blip(c, b, t, 1318, 0.07, 0.045, 'triangle'); blip(c, b, t + 0.06, 880, 0.16, 0.045, 'triangle'); },
    pod: function (c, b, t) { blip(c, b, t, 1760, 0.05, 0.03); blip(c, b, t + 0.06, 2350, 0.05, 0.026); blip(c, b, t + 0.12, 1975, 0.09, 0.026); },
    alert: function (c, b, t) { blip(c, b, t, 523, 0.09, 0.05, 'triangle'); blip(c, b, t + 0.1, 523, 0.09, 0.05, 'triangle'); blip(c, b, t + 0.2, 392, 0.2, 0.05, 'triangle'); },
    sweepOn: function (c, b, t) { sweepTone(c, b, t, true); },
    sweepOff: function (c, b, t) { sweepTone(c, b, t, false); },
    wake: wakeChord
  };
  /* force: the reboot plays while NieR Mode is still off (turning on), so it asks for the installed part instead */
  function sfx(name, force) {
    if (!(force ? installed('sounds') : live.sounds) || !SFX[name]) return false;
    var S = window.PM56_SOUND; if (!S || typeof S.synth !== 'function') return false;
    var now = performance.now();
    if (name === 'tick') { if (now - lastTick < 45) return false; lastTick = now; }
    var ok = S.synth(function (c, out, t) { SFX[name](c, busFor(c, out), t); });
    if (ok) { sfxLog.push({ name: name, t: Math.round(now) }); if (sfxLog.length > 60) sfxLog.shift(); }
    return ok;
  }

  /* ---------- menu cursor ------------------------------------------------------------------------------------------- */
  /* the rows that become an ink bar (the same list as nier-parts.css) */
  var CURSOR_SEL = ['.menu-item', '.thread-row', '.model-row', '.effort-row', '.pm-tops-item', '.att-source-row', '.qs-mention-item'].join(',');
  /* threads and tabs a click chooses, where the brackets lock on (menu items close with their menu) */
  var CHOSEN_SEL = '.thread-row, .editor-tab, [role="tab"]';
  /* items in a horizontal strip: the cursor sits under them */
  var STRIP_SEL = '.editor-tab, [role="tab"]';
  var targetOf = function (e) { return e && e.target && e.target.closest ? e.target.closest(CURSOR_SEL) : null; };
  var cur = null, curT = null, curHide = 0;
  /* the bar's paper text is the class o55np-cur-over on the item the pointer rests on (pointer only, never focus), set
     and cleared in the same turn the pointer arrives or leaves (PMConcept7's curMark / curSyncHover / curAway) */
  var CUR_OVER = 'o55np-cur-over', curBar = null;
  function curMark(t) {
    if (t === curBar) return;
    if (curBar) curBar.classList.remove(CUR_OVER);
    curBar = t || null;
    if (curBar) curBar.classList.add(CUR_OVER);
  }
  /* a pointer already resting when the part turns on, or on an item a render replaced, sends no pointerover: read :hover
     once (the deepest hovered element; querySelector(':hover') would answer <html>) */
  function curSyncHover() {
    var n = null; try { var all = document.querySelectorAll(':hover'); n = all.length ? all[all.length - 1] : null; } catch (e) { n = null; }
    curMark(n && n.closest ? n.closest(CURSOR_SEL) : null);
  }
  /* leaving the window clears :hover and sends no pointerover: drop the class in that same turn */
  function curAway(e) { if (!e.relatedTarget) curMark(null); }
  /* the app's patch rewrites classes it does not know: after a render the hovered item gets the class back, and an item
     the render replaced is found again through :hover */
  function curReMark() {
    if (!cur) return;
    if (curBar && curBar.isConnected) { if (!curBar.classList.contains(CUR_OVER)) curBar.classList.add(CUR_OVER); }
    else if (curBar) { curBar = null; curSyncHover(); }
  }
  /* while the reboot cover is up the cursor does not point through it or tick for a hover the cover is hiding */
  var coverUp = false;
  function curPlace(t) {
    if (!cur) return;
    if (coverUp) { curOff(); return; }
    var r = t.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > window.innerHeight) { curOff(); return; }
    var x = r.left - 12, y = r.top + r.height / 2 - 4.5, side = 'left';
    if (t.matches(STRIP_SEL)) { x = r.left + r.width / 2 - 4.5; y = r.bottom + 3; side = 'below'; } else if (x < 2) { x = r.right + 5; side = 'right'; }
    var wasOn = cur.hasAttribute('data-on');
    if (!wasOn) { cur.setAttribute('data-jump', ''); frames(2).then(function () { if (cur) cur.removeAttribute('data-jump'); }); }
    cur.style.transform = 'translate(' + Math.round(x) + 'px, ' + Math.round(y) + 'px)';
    if (cur.dataset.side !== side) cur.dataset.side = side;
    if (!wasOn) cur.setAttribute('data-on', '');
  }
  function curOff() { curT = null; if (cur && cur.hasAttribute('data-on')) cur.removeAttribute('data-on'); }
  function curOver(e) {
    var t = targetOf(e);
    curMark(t);
    if (t === curT) { if (curHide) { window.clearTimeout(curHide); curHide = 0; } return; }
    if (!t) { if (!curHide && curT) curHide = window.setTimeout(function () { curHide = 0; curOff(); }, 90); return; }
    if (curHide) { window.clearTimeout(curHide); curHide = 0; }
    curT = t; curPlace(t);
    if (!coverUp) sfx('tick');
  }
  function curFocus(e) {
    var t = targetOf(e); if (!t) return;
    var fv = false; try { fv = e.target.matches(':focus-visible'); } catch (x) { fv = false; }
    if (fv) { curT = t; curPlace(t); if (!coverUp) sfx('tick'); }
  }
  PARTS.cursor = {
    on: function () {
      cur = layer(); cur.id = 'o55np-cursor'; cur.innerHTML = '<i></i>';
      document.addEventListener('pointerover', curOver, true);
      document.addEventListener('pointerout', curAway, true);
      document.addEventListener('focusin', curFocus, true);
      curSyncHover();
    },
    off: function () {
      document.removeEventListener('pointerover', curOver, true);
      document.removeEventListener('pointerout', curAway, true);
      document.removeEventListener('focusin', curFocus, true);
      curMark(null);
      if (curHide) window.clearTimeout(curHide); curHide = 0; curT = null;
      if (cur) cur.remove(); cur = null;
    }
  };

  /* ---------- target brackets ---------------------------------------------------------------------------------------- */
  var ret = null, retT = null, retLock = 0, retScroll = 0;
  var RET_GAP = 3, RET_S = 10;
  function retPlace(t) {
    if (!ret || !t || !t.isConnected || coverUp) { retOff(); return; }
    var r = t.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > window.innerHeight) { retOff(); return; }
    var l = r.left - RET_GAP, tp = r.top - RET_GAP, rt = r.right + RET_GAP - RET_S, b = r.bottom + RET_GAP - RET_S;
    var pos = [[l, tp, 1, 1], [rt, tp, -1, 1], [l, b, 1, -1], [rt, b, -1, -1]];
    var wasOn = ret.hasAttribute('data-on'), c = ret.children;
    if (!wasOn) { ret.setAttribute('data-jump', ''); frames(2).then(function () { if (ret) ret.removeAttribute('data-jump'); }); }
    pos.forEach(function (p, i) { c[i].style.transform = 'translate(' + Math.round(p[0]) + 'px, ' + Math.round(p[1]) + 'px) scale(' + p[2] + ', ' + p[3] + ')'; });
    if (!wasOn) {
      ret.setAttribute('data-on', '');
      if (!still()) pos.forEach(function (p, i) { c[i].animate([{ translate: (-p[2] * 9) + 'px ' + (-p[3] * 9) + 'px', opacity: 0 }, { translate: '0px 0px', opacity: 1 }], { duration: 210, easing: 'steps(3, end)' }); });
    }
  }
  function retOff() { retT = null; if (ret && ret.hasAttribute('data-on')) ret.removeAttribute('data-on'); }
  function retFocus(e) {
    var t = e.target; if (!(t instanceof Element)) return;
    var fv = false; try { fv = t.matches(':focus-visible'); } catch (x) { fv = false; }
    if (!fv) return;
    if (retLock) { window.clearTimeout(retLock); retLock = 0; }
    retT = t; retPlace(t);
  }
  function retBlur() {
    window.setTimeout(function () {
      if (retLock) return;
      var a = document.activeElement, fv = false;
      try { fv = !!a && a !== document.body && a.matches(':focus-visible'); } catch (x) { fv = false; }
      if (!fv) retOff(); else if (a !== retT) { retT = a; retPlace(a); }
    }, 0);
  }
  function retChoose(e) {
    var t = e.target && e.target.closest ? e.target.closest(CHOSEN_SEL) : null; if (!t) return;
    if (retLock) window.clearTimeout(retLock);
    /* the click re-renders the list (pmPatch keeps the row node); place after that render */
    window.setTimeout(function () { if (t.isConnected) { retT = t; retPlace(t); } }, 0);
    retLock = window.setTimeout(function () { retLock = 0; retBlur(); }, 1200);
  }
  function retKey(e) { if (retT && (e.key === 'Tab' || /^Arrow/.test(e.key)) && !retT.isConnected) retOff(); }
  PARTS.brackets = {
    on: function () {
      ret = layer(); ret.id = 'o55np-reticle'; ret.innerHTML = '<i></i><i></i><i></i><i></i>';
      document.addEventListener('focusin', retFocus, true);
      document.addEventListener('focusout', retBlur, true);
      document.addEventListener('click', retChoose, true);
      document.addEventListener('keydown', retKey, true);
    },
    off: function () {
      document.removeEventListener('focusin', retFocus, true);
      document.removeEventListener('focusout', retBlur, true);
      document.removeEventListener('click', retChoose, true);
      document.removeEventListener('keydown', retKey, true);
      if (retLock) window.clearTimeout(retLock); retLock = 0; retT = null;
      if (ret) ret.remove(); ret = null;
    }
  };

  /* scrolling or resizing moves what the cursor and the reticle point at: they step aside and come back after */
  function onScroll() {
    if (!cur && !ret) return;
    if (cur) curOff();
    if (ret && retT) {
      var t = retT; if (ret.hasAttribute('data-on')) ret.removeAttribute('data-on');
      if (retScroll) window.clearTimeout(retScroll);
      retScroll = window.setTimeout(function () { retScroll = 0; if (retT === t && t.isConnected) { retPlace(t); } }, 160);
    }
  }

  /* the scroll and resize listeners exist only while the cursor or the brackets are live */
  var listening = false;
  function listen() {
    var want = !!(live.cursor || live.brackets);
    if (want === listening) return;
    listening = want;
    if (want) { window.addEventListener('scroll', onScroll, { capture: true, passive: true }); window.addEventListener('resize', onScroll, { passive: true }); }
    else { window.removeEventListener('scroll', onScroll, { capture: true }); window.removeEventListener('resize', onScroll); }
  }

  /* ---------- drifting particles: twelve motes over the transcript ---------------------------------------------------- */
  /* PMConcept7's #o55np-ground layer (its still grid is the concept's .pm-shell ground, nier-parts.css), here holding the
     motes only. It is anchored to the transcript in CSS (anchor-name under the part's own attribute), so it follows the
     stage through every resize and layout change with no script. */
  var ground = null;
  PARTS.particles = {
    on: function () { ground = layer(); ground.id = 'o55np-ground'; ground.innerHTML = new Array(13).join('<i class="o55np-mote"></i>'); idle(); },
    off: function () { if (ground) ground.remove(); ground = null; }
  };
  /* a hidden tab holds every loop still */
  function idle() {
    var hidden = !!document.hidden;
    [ground, pod].forEach(function (e) { if (e && e.hasAttribute('data-idle') !== hidden) e.toggleAttribute('data-idle', hidden); });
  }
  document.addEventListener('visibilitychange', idle);

  /* ---------- scan sweep ------------------------------------------------------------------------------------------------ */
  var sweep = null, sweepTimer = 0;
  function sweepNext(ms) { if (sweepTimer) window.clearTimeout(sweepTimer); sweepTimer = window.setTimeout(sweepRun, ms); }
  function sweepRun() {
    sweepTimer = 0; if (!sweep) return;
    if (!document.hidden && !still()) {
      sweep.animate([{ transform: 'translateY(-72px)', opacity: 0 }, { opacity: 1, offset: 0.06 }, { opacity: 1, offset: 0.9 }, { transform: 'translateY(' + Math.round(window.innerHeight) + 'px)', opacity: 0 }], { duration: 2600, easing: 'linear' });
    }
    sweepNext(12000);
  }
  PARTS.sweep = {
    on: function () { sweep = layer(); sweep.id = 'o55np-sweep'; sweepNext(2600); },
    off: function () { if (sweepTimer) window.clearTimeout(sweepTimer); sweepTimer = 0; if (sweep) sweep.remove(); sweep = null; }
  };

  /* ---------- text decode ------------------------------------------------------------------------------------------------ */
  var GLYPH = { upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ', lower: 'abcdefghjkmnopqrstuvwxyz', digit: '0123456789', mark: '#%&*+=/<>' };
  var decoding = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  function scramble(text, shown) {
    var out = '';
    for (var k = 0; k < text.length; k++) {
      var ch = text[k];
      if (k < shown || /\s/.test(ch)) { out += ch; continue; }
      var set = /[A-Z]/.test(ch) ? GLYPH.upper : /[a-z]/.test(ch) ? GLYPH.lower : /[0-9]/.test(ch) ? GLYPH.digit : GLYPH.mark;
      out += set[(Math.random() * set.length) | 0];
    }
    return out;
  }
  /* a text node of at most 64 characters resolves from scrambled glyphs, left to right, in eight steps; if anything
     else writes it meanwhile (the app's patch restoring its words), it stops and leaves that write alone */
  function decodeNode(node) {
    if (!node || node.nodeType !== 3 || !node.isConnected || still() || !decoding) return false;
    var text = node.nodeValue;
    if (!text || !text.trim() || text.length > 64) return false;
    var prev = decoding.get(node); if (prev) prev.stop();
    var steps = 8, dt = Math.max(20, Math.min(40, (110 + text.length * 9) / steps));
    var i = 0, last = '', timer = 0, stopped = false;
    var stop = function () { if (stopped) return; stopped = true; window.clearTimeout(timer); decoding.delete(node); if (node.isConnected && node.nodeValue === last) node.nodeValue = text; };
    var tick = function () {
      if (stopped) return;
      if (!node.isConnected || node.nodeValue !== last) { stopped = true; decoding.delete(node); return; }
      if (++i >= steps) { node.nodeValue = text; last = text; stop(); return; }
      last = scramble(text, Math.floor(text.length * i / steps)); node.nodeValue = last;
      timer = window.setTimeout(tick, dt);
    };
    decoding.set(node, { stop: stop });
    last = scramble(text, 0); node.nodeValue = last;
    timer = window.setTimeout(tick, dt);
    return true;
  }
  /* an element whose words are one text node, or the last text node of a head that starts with an icon */
  function decode(el) {
    if (!el || !el.isConnected) return false;
    if (el.childNodes.length === 1 && el.firstChild.nodeType === 3) return decodeNode(el.firstChild);
    var t = el.lastChild; return t && t.nodeType === 3 && el.childNodes.length <= 3 ? decodeNode(t) : false;
  }
  PARTS.decode = { on: function () {}, off: function () {} };

  /* ---------- page wipe: a band over the transcript on a thread switch ---------------------------------------------------- */
  var wipe = null, wipeAnim = null;
  function threadWipe(r) {
    if (!document.body) return;
    if (!wipe) { wipe = layer(); wipe.id = 'o55np-wipe'; wipe.innerHTML = '<i></i>'; }
    wipe.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;display:block';
    if (wipeAnim) wipeAnim.cancel();
    var a = wipeAnim = wipe.firstChild.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(0)', offset: 0.2 }, { transform: 'translateX(101%)' }],
      { duration: 400, easing: 'cubic-bezier(.65, 0, .3, 1)', fill: 'both' });
    a.onfinish = function () { if (wipeAnim !== a) return; wipeAnim = null; if (wipe) wipe.style.display = 'none'; a.cancel(); };
  }
  PARTS.wipe = { on: function () {}, off: function () { if (wipeAnim) wipeAnim.cancel(); wipeAnim = null; if (wipe) wipe.remove(); wipe = null; } };

  /* ---------- alerts: glitch, scan and burst, in one effects layer ------------------------------------------------------- */
  var fx = null;
  function fxLayer() { if (!fx || !fx.isConnected) { fx = layer(); fx.id = 'o55np-fx'; } return fx; }
  function box(r, cls) {
    var b = document.createElement('div'); b.className = cls;
    b.style.cssText = 'left:' + Math.round(r.left) + 'px;top:' + Math.round(r.top) + 'px;width:' + Math.round(r.width) + 'px;height:' + Math.round(r.height) + 'px';
    fxLayer().appendChild(b);
    return b;
  }
  var drop = function (el, a) { var end = function () { el.remove(); }; a.onfinish = end; a.oncancel = end; };
  /* glitch: the element jitters in five steps; a toast (plain markup, top-level styles) splits into two clipped copies
     that slide apart, PMConcept7's slices; anything in the transcript tears with two ink strips (its styles live under
     the transcript, so a copy outside it would not look like it) */
  function glitch(el, r, split) {
    if (typeof el.animate === 'function') el.animate([{ translate: '0px 0px' }, { translate: '4px 0px' }, { translate: '-3px 0px' }, { translate: '2px 0px' }, { translate: '0px 0px' }], { duration: 240, easing: 'steps(5, end)' });
    if (split) {
      [['inset(0 0 54% 0)', [0, -8, 6, -3, 0]], ['inset(46% 0 0 0)', [0, 7, -5, 2, 0]]].forEach(function (s, n) {
        var b = box(r, 'o55np-glitch-slice'), c = el.cloneNode(true);
        c.removeAttribute('data-k'); c.querySelectorAll('[data-k]').forEach(function (x) { x.removeAttribute('data-k'); });
        b.appendChild(c); b.style.clipPath = s[0];
        drop(b, b.animate(s[1].map(function (x) { return { transform: 'translateX(' + x + 'px)' }; }), { duration: 260, delay: n * 30, easing: 'steps(5, end)', fill: 'both' }));
      });
    } else {
      [[0.28, 3, [0, 9, -6, 3, 0]], [0.66, 2, [0, -7, 5, -2, 0]]].forEach(function (s, n) {
        var b = box({ left: r.left, top: r.top + r.height * s[0], width: r.width, height: s[1] }, 'o55np-tear');
        drop(b, b.animate(s[2].map(function (x, i) { return { transform: 'translateX(' + x + 'px)', opacity: i === 4 ? 0 : 1 }; }), { duration: 260, delay: n * 40, easing: 'steps(5, end)', fill: 'both' }));
      });
    }
  }
  /* sweep across an alert: one scan line down its box */
  function alertScan(r) {
    var b = box({ left: r.left, top: r.top, width: r.width, height: 18 }, 'o55np-scan');
    drop(b, b.animate([{ transform: 'translateY(-18px)', opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 1, offset: 0.85 }, { transform: 'translateY(' + Math.round(r.height) + 'px)', opacity: 0 }], { duration: 520, easing: 'steps(8, end)' }));
  }
  /* particles from an alert: six ink squares thrown off its edge, in steps */
  function alertBurst(r) {
    for (var i = 0; i < 6; i++) {
      var ang = (-150 + i * 24 + (i % 2 ? 6 : -6)) * Math.PI / 180, d = 26 + (i % 3) * 10;
      var b = box({ left: r.left + r.width * (0.2 + i * 0.12), top: r.top + 2, width: 4, height: 4 }, 'o55np-shard');
      drop(b, b.animate([{ transform: 'translate(0, 0) rotate(0deg)', opacity: 1 }, { transform: 'translate(' + Math.round(Math.cos(ang) * d) + 'px, ' + Math.round(Math.sin(ang) * d) + 'px) rotate(' + (90 + i * 30) + 'deg)', opacity: 0 }],
        { duration: 560, delay: i * 18, easing: 'steps(6, end)', fill: 'backwards' }));
    }
  }
  function alertFx(el, split) {
    if (!el || !el.isConnected || still() || document.hidden) return;
    var r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > window.innerHeight) return;
    if (live.glitch) glitch(el, r, split);
    if (live.sweep) alertScan(r);
    if (live.particles) alertBurst(r);
  }
  PARTS.glitch = { on: function () {}, off: function () {} };

  /* ---------- Pod companion ------------------------------------------------------------------------------------------------ */
  /* PMConcept7's original ink-line Pod: a chamfered box with a sensor slit, two side arms and a skirt; a shadow dash below.
     It hovers above the composer's top-right corner (CSS anchor), and turns toward a toast arriving below it. */
  var POD_SVG = '<svg viewBox="0 0 40 52" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="miter" stroke-linecap="square" aria-hidden="true">'
    + '<path class="o55np-pod-fill" d="M3.5 13.5H8.5V30.5H3.5Z M31.5 13.5H36.5V30.5H31.5Z"/><path d="M3.5 13.5H8.5V30.5H3.5Z M31.5 13.5H36.5V30.5H31.5Z M8.5 18H9.5 M30.5 18H31.5 M6 10.5V13.5 M34 10.5V13.5"/>'
    + '<path class="o55np-pod-fill" d="M12.5 6.5H27.5L30.5 9.5V33.5L26.5 37.5H13.5L9.5 33.5V9.5Z"/><path d="M12.5 6.5H27.5L30.5 9.5V33.5L26.5 37.5H13.5L9.5 33.5V9.5Z M11 12.5H29 M13 27.5H27 M13 30.5H27 M15.5 37.5L17 41.5H23L24.5 37.5"/>'
    + '<path class="o55np-pod-ink" stroke="none" d="M15 18H25V21H15Z"/><path class="o55np-pod-ink" stroke="none" d="M22 18H25V21H22Z" opacity=".35"/></svg>';
  var POD_SHADOW = '<svg viewBox="0 0 40 52" aria-hidden="true"><path class="o55np-pod-ink" d="M13 47.3H27V48.7H13Z" opacity=".32"/></svg>';
  var pod = null;
  function podDeliver() {
    if (!pod || still() || document.hidden) return;
    var body = pod.querySelector('.o55np-pod-body');
    /* the toasts arrive at the top right, above the Pod: it turns up toward them and sends three signals (PMConcept7's
       own moves, whose notices sit the same way) */
    body.animate([{ transform: 'rotate(0deg) translate(0, 0)' }, { transform: 'rotate(-16deg) translate(-2px, -4px)', offset: 0.22 },
      { transform: 'rotate(-16deg) translate(-2px, -4px)', offset: 0.7 }, { transform: 'rotate(0deg) translate(0, 0)' }], { duration: 1000, easing: 'cubic-bezier(.3, .7, .3, 1)' });
    pod.querySelectorAll('.o55np-pod-signal').forEach(function (s, i) {
      s.animate([{ transform: 'translate(0, 0)', opacity: 0 }, { opacity: 1, offset: 0.15 }, { transform: 'translate(' + (-14 - i * 8) + 'px, ' + (-40 - i * 18) + 'px)', opacity: 0 }],
        { duration: 520, delay: 200 + i * 90, easing: 'steps(6, end)', fill: 'backwards' });
    });
  }
  /* The Pod steps back from a control (final review, 2026-10-03). Its resting place is clear of every fixed control (the
     jump chip, the bar, the queue, the decision panel and the composer yield to it, nier-parts.css), but transcript
     content scrolls past it, and a card's Resume or Open button could sit under it at some scroll positions. So while a
     button, link, summary or field lies under its box (a 5 x 5 grid of probe points; the Pod itself is pointer-events
     none, so elementsFromPoint never returns it) it fades back (data-shy, nier-parts.css) and the control shows
     through; it comes forward again once the control has passed. Checked on scroll and resize (the shared listener above is the cursor's,
     so this one is its own) and after every render the concept reports (afterRender, below). */
  var podShyT = 0, podClearAt = 0;
  var SHY_HOST = 'button, a[href], summary, [role="button"], input, select, textarea';
  var SHY_AT = [0.06, 0.27, 0.5, 0.73, 0.94];
  function podShy() {
    podShyT = 0;
    if (!pod || !pod.isConnected) return;
    var r = pod.getBoundingClientRect(), hit = false;
    if (r.width > 0 && r.height > 0) {
      for (var i = 0; i < 25 && !hit; i++) {
        var els = document.elementsFromPoint(r.left + r.width * SHY_AT[i % 5], r.top + r.height * SHY_AT[Math.floor(i / 5)]);
        for (var k = 0; k < els.length && !hit; k++) if (els[k].closest && els[k].closest(SHY_HOST)) hit = true;
      }
    }
    /* it fades back at once, and comes forward only after 350 ms with nothing under it, so it does not flicker while a
       column of buttons scrolls past */
    var now = Date.now();
    if (hit) { podClearAt = now + 350; if (!pod.hasAttribute('data-shy')) pod.setAttribute('data-shy', ''); return; }
    if (!pod.hasAttribute('data-shy')) return;
    if (now < podClearAt) { podShyT = window.setTimeout(podShy, podClearAt - now + 10); return; }
    pod.removeAttribute('data-shy');
  }
  function podShySoon() { if (pod && !podShyT) podShyT = window.setTimeout(podShy, 90); }
  PARTS.pod = {
    on: function () {
      pod = layer(); pod.id = 'o55np-pod';
      pod.innerHTML = '<div class="o55np-pod-shadow">' + POD_SHADOW + '</div><div class="o55np-pod-bob"><div class="o55np-pod-body">' + POD_SVG + '</div></div>' + new Array(4).join('<i class="o55np-pod-signal"></i>');
      idle();
      window.addEventListener('scroll', podShySoon, { capture: true, passive: true });
      window.addEventListener('resize', podShySoon, { passive: true });
      podShySoon();
    },
    off: function () {
      window.removeEventListener('scroll', podShySoon, { capture: true });
      window.removeEventListener('resize', podShySoon);
      if (podShyT) { window.clearTimeout(podShyT); podShyT = 0; }
      if (pod) pod.remove(); pod = null;
    }
  };

  PARTS.voice = { on: function () {}, off: function () {} };

  /* ---------- menu sounds: select, confirm and cancel by delegation (ticks come with the cursor) -------------------- */
  /* Send has its own sound in chat-sound.js; it is left to it. */
  var CONFIRM_SEL = '.primary-button:not([data-action="send"]), button[type="submit"], [data-action="approve-plan"]';
  var CANCEL_SEL = '[data-action="close-dialog"], [data-action="close-decision"], [data-action="close-editor"], [data-action="close-context-details"], [data-action="close-history"], [data-action="close-activity"], [data-action^="cancel-"], [data-action="dismiss-event"], .pmx-close, [aria-label="Close"], [aria-label="Dismiss"]';
  var TOGGLE_SEL = '[role="switch"], [role="checkbox"], [role="radio"], input[type="checkbox"], input[type="radio"], .selector-button, .editor-tab, .demo-trigger';
  function soundClick(e) {
    var t = e.target; if (!t || !t.closest) return;
    if (t.closest(CANCEL_SEL)) sfx('cancel');
    else if (t.closest(CONFIRM_SEL)) sfx('confirm');
    else if (t.closest(CURSOR_SEL) || t.closest(TOGGLE_SEL)) sfx('select');
  }
  function soundKey(e) { if (e.key === 'Escape') sfx('cancel'); else if (e.key === 'Enter' && e.target && e.target.closest && e.target.closest(CURSOR_SEL)) sfx('select'); }
  PARTS.sounds = {
    on: function () { document.addEventListener('click', soundClick, true); document.addEventListener('keydown', soundKey, true); },
    off: function () { document.removeEventListener('click', soundClick, true); document.removeEventListener('keydown', soundKey, true); }
  };

  /* ---------- reboot moment ---------------------------------------------------------------------------------------------- */
  /* The page plate (PMConcept7's rebootPlate, page staging). It grows from the control just pressed, in NieR's ground
     of that look's tone, types a check list through the repaint and tears out as six slats. Turning off, the slats
     close in and the plate folds back into the control. No large surface reverses its brightness: only the slats move.
     Reduced motion, the reboot part off, or a hidden tab repaints at once. No requestAnimationFrame loop and no
     MutationObserver: the waits are one-shot animations. */
  var speed = function () { return 1; };
  function tl() {
    return document.timeline && typeof document.timeline.currentTime === 'number' ? document.timeline.currentTime : performance.now();
  }
  function since(t0) { return (tl() - t0) / speed(); }
  function rbWait(el, ms) {
    return new Promise(function (res) {
      var a = null, dur = Math.max(0, ms);
      try { a = el.animate(null, { duration: dur }); } catch (e) { a = null; }
      if (!a) { window.setTimeout(res, dur); return; }
      a.onfinish = function () { res(); };
      a.oncancel = function () { res(); };
      window.setTimeout(res, dur * speed() * 30 + 2000);
    });
  }
  function rbAt(el, t0, T) { return rbWait(el, T - since(t0)); }
  function settled(a) {
    return a && a.finished ? a.finished.then(function () { return true; }, function () { return false; }) : Promise.resolve(false);
  }
  function settledStart(anims) {
    return Promise.race([
      Promise.all(anims.map(function (a) { return a.ready.catch(function () { return null; }); })),
      new Promise(function (res) { window.setTimeout(res, 250); })
    ]).then(function () { return frames(2); });
  }
  function rbStart(a, fallback) {
    return Promise.resolve(a && a.ready).then(function () {
      return a && typeof a.startTime === 'number' ? a.startTime : fallback;
    }, function () { return fallback; });
  }
  function RB(fallback, vars) {
    return String(fallback).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? String(vars[k]) : m; });
  }
  function familyName() {
    var theme = (document.body && document.body.getAttribute('data-theme')) || 'basic';
    var f = String(theme).split('-')[0];
    if (html.getAttribute('data-o55-nier') === 'on') {
      try {
        var fam = window.PM_THEME && window.PM_THEME.getFamily && window.PM_THEME.getFamily();
        if (fam) f = String(fam);
      } catch (e) { /* the painted one */ }
    }
    if (!f) f = 'basic';
    return f.charAt(0).toUpperCase() + f.slice(1);
  }
  function rbLines(info, kind) {
    var ok = 'OK';
    if (info && Array.isArray(info.lines) && info.lines.length) {
      return info.lines.slice(0, 5).map(function (l) {
        return { text: String(l && typeof l === 'object' ? l.text : l), stamp: String(l && typeof l === 'object' && l.stamp != null ? l.stamp : ok) };
      });
    }
    var fam = familyName();
    var last = installed('pod') || installed('voice') ? { text: 'Pod 042', stamp: 'Online' }
      : installed('sounds') ? { text: 'Menu sounds', stamp: ok } : { text: 'Ready', stamp: ok };
    var keep = { text: RB('Keeping {family} for later', { family: fam }), stamp: ok };
    var ink = { text: 'Ink and parchment', stamp: ok };
    var restore = { text: RB('Restoring {family}', { family: fam }), stamp: ok };
    var boot = { text: 'Rebooting the interface', stamp: ok };
    if (kind === 'pageOff') return [{ text: 'Shutting down the unit', stamp: ok }, restore];
    if (kind === 'replay') return [boot, ink, last, { text: 'All parts reinstalled', stamp: ok }];
    return [boot, keep, ink, last];
  }
  function rbPlan(n, folding) {
    var P = folding ? { first: 700, last: 850, meter: [560, 870], sync: 920 } : { first: 600, last: 1050, meter: [480, 1080], sync: 1100 };
    var gap = n > 1 ? Math.min(150, (P.last - P.first) / (n - 1)) : 0;
    P.stamps = [];
    for (var i = 0; i < n; i++) P.stamps.push(Math.round(P.first + i * gap));
    P.done = n ? Math.max(P.meter[1], P.stamps[n - 1] + 90) : P.meter[1];
    return P;
  }
  function rbShift(plan, now) {
    var late = Math.max(0, now + 30 - Math.min(plan.stamps[0] - 120, plan.meter[0]));
    if (!late) return plan;
    return {
      first: plan.first, last: plan.last,
      stamps: plan.stamps.map(function (x) { return x + late; }),
      meter: plan.meter.map(function (x) { return x + late; }),
      sync: plan.sync + late, done: plan.done + late, late: late
    };
  }
  function rbLog(lines) {
    var log = document.createElement('div');
    log.className = 'o55np-log';
    log.innerHTML = '<div class="o55np-kick"><i></i><i></i><i></i><span class="o55np-kick-t">' + esc('NieR Mode') + '</span></div>'
      + '<div class="o55np-lns">' + lines.map(function (l) {
        return '<div class="o55np-ln"><span class="o55np-ln-t">' + esc(l.text) + '</span><span class="o55np-ln-dots"></span><b class="o55np-stamp">' + esc(l.stamp) + '</b><i class="o55np-ln-mask"></i></div>';
      }).join('') + '</div>'
      + '<div class="o55np-meter"><i></i></div>'
      + '<div class="o55np-ln o55np-sync"><span class="o55np-ln-t">' + esc('Synchronising') + '</span><i class="o55np-caret"></i><span class="o55np-ln-dots"></span><b class="o55np-stamp">' + esc('OK') + '</b></div>';
    return log;
  }
  function rbType(log, plan, now) {
    var anims = [];
    var A = function (el, kf, o) {
      var opt = { fill: 'backwards' };
      Object.keys(o).forEach(function (k) { opt[k] = o[k]; });
      var a = el.animate(kf, opt);
      anims.push(a);
      return a;
    };
    var d = function (t) { return Math.max(0, t - now); };
    Array.prototype.forEach.call(log.querySelectorAll('.o55np-lns > .o55np-ln'), function (ln, i) {
      var st = plan.stamps[i];
      A(ln.querySelector('.o55np-ln-mask'), [{ transform: 'translateX(0)' }, { transform: 'translateX(calc(100% + 10px))' }],
        { duration: 120, delay: d(st - 120), easing: 'steps(8, end)' });
      A(ln.querySelector('.o55np-stamp'), [
        { opacity: 0, easing: 'step-end' }, { opacity: 1, offset: 0.34, easing: 'step-end' },
        { opacity: 0, offset: 0.67, easing: 'step-end' }, { opacity: 1 }
      ], { duration: 120, delay: Math.max(0, d(st) - 40) });
    });
    A(log.querySelector('.o55np-meter > i'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
      { duration: plan.meter[1] - plan.meter[0], delay: d(plan.meter[0]), easing: 'steps(12, end)' });
    var sync = log.querySelector('.o55np-sync');
    A(sync, [{ opacity: 0 }, { opacity: 0 }], { duration: Math.max(1, d(plan.sync)) });
    A(sync.querySelector('.o55np-caret'), [
      { opacity: 1, easing: 'step-end' }, { opacity: 0, offset: 0.5, easing: 'step-end' }, { opacity: 1 }
    ], { duration: 900, delay: d(plan.sync), iterations: Infinity, fill: 'none' });
    return { anims: anims };
  }
  function rbClear(log, typing, plan, t0) {
    var synced = since(t0) >= plan.sync;
    typing.anims.forEach(function (a) { try { a.cancel(); } catch (e) { /* already gone */ } });
    var s = log.querySelector('.o55np-sync');
    if (synced) s.setAttribute('data-ok', ''); else s.style.display = 'none';
    log.setAttribute('data-done', '');
    log.querySelector('.o55np-kick-t').textContent = 'All clear';
  }
  var BR = 12;
  function rbBox(cover) {
    var r = cover.getBoundingClientRect(), w = cover.offsetWidth || r.width || 1, h = cover.offsetHeight || r.height || 1;
    return { r: r, w: w, h: h, k: r.width / w || 1 };
  }
  var press = null;
  var PRESSABLE = 'button, a[href], input, select, label, summary, [role="button"], [role="switch"], [role="checkbox"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="menuitem"], [role="option"], [role="tab"]';
  function notePress(e) {
    var t = e.target;
    if (!e.isTrusted || !(t instanceof Element) || (t.closest && t.closest('#o55np-reboot'))) return;
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    var el = (t.closest && t.closest(PRESSABLE)) || t;
    var host = el.closest ? el.closest('[id]') : null;
    var role = el.getAttribute ? el.getAttribute('role') : '';
    press = {
      el: el, at: performance.now(), id: host ? host.id : '',
      sel: host && host !== el ? el.localName + (role ? '[role="' + role + '"]' : '') : '',
      pt: e.type === 'pointerdown' ? { left: e.clientX - 12, top: e.clientY - 12, width: 24, height: 24 } : null
    };
  }
  document.addEventListener('pointerdown', notePress, true);
  document.addEventListener('keydown', notePress, true);
  function lastPress() { return press && performance.now() - press.at < 2000 ? press : null; }
  function pressEl(p) {
    if (!p) return null;
    if (p.el && p.el.isConnected) return p.el;
    var host = p.id ? document.getElementById(p.id) : null;
    if (!host || !p.sel) return host;
    var same = host.querySelectorAll(p.sel);
    return same.length === 1 ? same[0] : null;
  }
  function givenFrom(info) {
    try { return info && typeof info.from === 'function' ? info.from() : info && info.from; } catch (e) { return null; }
  }
  function rbFrom(cands, scope, box) {
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i], r = null;
      if (!c) continue;
      if (typeof c.getBoundingClientRect === 'function' && typeof c.isConnected === 'boolean') {
        if (!c.isConnected || (scope && scope.contains && !scope.contains(c))) continue;
        r = c.getBoundingClientRect();
      } else if (typeof c.left === 'number' && typeof c.width === 'number') r = c;
      if (!r || r.width < 8 || r.height < 8) continue;
      var x = (r.left - box.r.left) / box.k, y = (r.top - box.r.top) / box.k, w = r.width / box.k, h = r.height / box.k;
      if (x + w <= 0 || y + h <= 0 || x >= box.w || y >= box.h) continue;
      var cx = Math.max(0, x), cy = Math.max(0, y);
      return { x: cx, y: cy, w: Math.min(box.w, x + w) - cx, h: Math.min(box.h, y + h) - cy };
    }
    return { x: box.w / 2 - 80, y: box.h / 2 - 50, w: 160, h: 100 };
  }
  function lerpRect(a, b, f) {
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, w: a.w + (b.w - a.w) * f, h: a.h + (b.h - a.h) * f };
  }
  function clipOf(r, box) {
    var x = Math.round(r.x), y = Math.round(r.y), sx = Math.max(1, Math.round(r.w)) / box.w, sy = Math.max(1, Math.round(r.h)) / box.h;
    return ['translate(' + x + 'px, ' + y + 'px) scale(' + sx.toFixed(5) + ', ' + sy.toFixed(5) + ')',
      'scale(' + (1 / sx).toFixed(5) + ', ' + (1 / sy).toFixed(5) + ') translate(' + (-x) + 'px, ' + (-y) + 'px)'];
  }
  function rbPose(r, o, box) {
    var sx = Math.max(r.w, 1) / box.w, sy = Math.max(r.h, 1) / box.h;
    var x = Math.round(r.x), y = Math.round(r.y), x2 = Math.round(r.x + r.w), y2 = Math.round(r.y + r.h), k = Math.round(o);
    return [
      'translate(' + x + 'px, ' + y + 'px) scaleX(' + sx.toFixed(4) + ')',
      'translate(' + x + 'px, ' + (y2 - 1) + 'px) scaleX(' + sx.toFixed(4) + ')',
      'translate(' + x + 'px, ' + y + 'px) scaleY(' + sy.toFixed(4) + ')',
      'translate(' + (x2 - 1) + 'px, ' + y + 'px) scaleY(' + sy.toFixed(4) + ')',
      'translate(' + (x - k) + 'px, ' + (y - k) + 'px) scale(1, 1)',
      'translate(' + (x2 + k - BR) + 'px, ' + (y - k) + 'px) scale(-1, 1)',
      'translate(' + (x - k) + 'px, ' + (y2 + k - BR) + 'px) scale(1, -1)',
      'translate(' + (x2 + k - BR) + 'px, ' + (y2 + k - BR) + 'px) scale(-1, -1)'
    ];
  }
  function walk(frames, total) {
    return frames.map(function (f) {
      var o = { offset: Math.min(1, f.t / total), easing: 'step-end' };
      Object.keys(f.v).forEach(function (k) { o[k] = f.v[k]; });
      return o;
    });
  }
  function rbSet(lines) {
    var set = document.createElement('div');
    set.className = 'o55np-set';
    var ground = document.createElement('div');
    ground.className = 'o55np-plate';
    ground.innerHTML = '<div class="o55np-plate-in"></div>';
    var log = rbLog(lines);
    ground.firstElementChild.appendChild(log);
    set.appendChild(ground);
    var deco = document.createElement('div');
    deco.className = 'o55np-deco';
    deco.innerHTML = '<i class="o55np-edge" data-e="t"></i><i class="o55np-edge" data-e="b"></i><i class="o55np-edge" data-e="l"></i><i class="o55np-edge" data-e="r"></i>'
      + '<i class="o55np-br"></i><i class="o55np-br"></i><i class="o55np-br"></i><i class="o55np-br"></i>';
    set.appendChild(deco);
    return { set: set, ground: ground, inner: ground.firstElementChild, log: log, deco: deco.querySelectorAll('i') };
  }
  function rbSlats(cover, src, mode, delay) {
    var wrap = document.createElement('div');
    wrap.className = 'o55np-slats';
    var order = mode === 'out' ? [2, 1, 0, 0, 1, 2] : [0, 1, 2, 2, 1, 0];
    var anims = [], i, s;
    for (i = 0; i < 6; i++) {
      s = document.createElement('div');
      s.className = 'o55np-slat';
      s.style.setProperty('--i', String(i));
      s.appendChild(src.cloneNode(true));
      wrap.appendChild(s);
    }
    cover.appendChild(wrap);
    for (i = 0; i < wrap.children.length; i++) {
      s = wrap.children[i];
      var away = 'translateX(' + (i % 2 ? 101 : -101) + '%)';
      anims.push(s.animate(mode === 'out'
        ? [{ transform: 'translateX(0)' }, { transform: away }]
        : [{ transform: away }, { transform: 'translateX(0)' }],
        { duration: 180, delay: delay + order[i] * 30, easing: mode === 'out' ? 'steps(4, jump-start)' : 'steps(4, end)', fill: mode === 'out' ? 'forwards' : 'both' }));
    }
    return { wrap: wrap, first: anims[0], done: Promise.all(anims.map(settled)) };
  }
  function rbRelease(ctx) {
    if (ctx && ctx.unhold) ctx.unhold();
    coverUp = false;
  }
  var HELD = ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'dblclick', 'auxclick', 'contextmenu'];
  function holdPresses(ctx) {
    var hold = function (e) { if (e.isTrusted) { e.preventDefault(); e.stopImmediatePropagation(); } };
    HELD.forEach(function (k) { window.addEventListener(k, hold, true); });
    ctx.unhold = function () {
      HELD.forEach(function (k) { window.removeEventListener(k, hold, true); });
      ctx.unhold = null;
    };
  }
  function rbSounds(info, on, quiet) {
    var own = info.sound !== false && !quiet;
    var humAt = -1e9, woke = false;
    var up = !!(on || (info && info.reason === 'replay'));
    return {
      hum: function () { if (own && sfx(up ? 'sweepOn' : 'sweepOff', true)) humAt = performance.now(); },
      wake: function () {
        if (!own || woke || !up) return;
        woke = true;
        var wait = humAt + 120 - performance.now();
        if (wait > 0) window.setTimeout(function () { sfx('wake', true); }, wait);
        else sfx('wake', true);
      }
    };
  }
  function rebootPlate(ctx, info, folding) {
    var kind = folding ? 'pageOff' : (info.reason === 'replay' ? 'replay' : 'pageOn');
    var lines = rbLines(info, kind);
    var plan = rbPlan(lines.length, folding);
    var cover = ctx.cover = document.createElement('div');
    cover.id = 'o55np-reboot';
    cover.className = 'o55np-page';
    cover.setAttribute('aria-hidden', 'true');
    cover.dataset.tone = tone();
    cover.dataset.dir = folding ? 'off' : 'on';
    var built = rbSet(lines);
    var set = built.set, ground = built.ground, inner = built.inner, log = built.log, deco = built.deco;
    cover.appendChild(set);
    var given = givenFrom(info), pr = given ? null : lastPress();
    var startEl = given || pressEl(pr);
    var startRect = startEl && startEl.isConnected ? startEl.getBoundingClientRect() : null;
    var home = function (box) { return rbFrom([startEl, pressEl(pr), startRect, pr && pr.pt], html, box); };
    document.body.appendChild(cover);
    holdPresses(ctx);
    coverUp = true; curOff(); retOff();
    var t0 = tl();
    var box = rbBox(cover), full = { x: 0, y: 0, w: box.w, h: box.h };
    var chain = Promise.resolve();
    if (!folding) {
      var from = home(box);
      var F = [0, 0.3, 0.55, 0.75, 0.9, 1];
      var rects = F.map(function (f) { return lerpRect(from, full, f); });
      var off = F.map(function (f) { return 3 - 17 * f; });
      var at = function (k) { return 90 + 60 * k; };
      var TOTAL = 450;
      var clips = rects.map(function (r) { return clipOf(r, box); });
      var idle = clipOf(full, box);
      var growFrames = [{ t: 0, v: { transform: clips[0][0], opacity: 0 } }];
      var inFrames = [{ t: 0, v: { transform: clips[0][1] } }];
      clips.forEach(function (c, k) {
        growFrames.push({ t: at(k), v: { transform: c[0], opacity: 1 } });
        inFrames.push({ t: at(k), v: { transform: c[1] } });
      });
      growFrames.push({ t: TOTAL, v: { transform: idle[0], opacity: 1 } });
      inFrames.push({ t: TOTAL, v: { transform: idle[1] } });
      var grow = ground.animate(walk(growFrames, TOTAL), { duration: TOTAL, fill: 'forwards' });
      var growIn = inner.animate(walk(inFrames, TOTAL), { duration: TOTAL, fill: 'forwards' });
      var poses = rects.map(function (r, k) { return rbPose(r, off[k], box); });
      var lock = [12, 8, 5].map(function (o) { return rbPose(rects[0], o, box); });
      Array.prototype.forEach.call(deco, function (el, j) {
        var fr = [], isBr = j >= 4;
        if (isBr) lock.forEach(function (p, s) { fr.push({ t: s * 30, v: { transform: p[j], opacity: 1 } }); });
        else fr.push({ t: 0, v: { transform: poses[0][j], opacity: 0 } });
        poses.forEach(function (p, k) { fr.push({ t: at(k), v: { transform: p[j], opacity: 1 } }); });
        fr.push({ t: TOTAL, v: { transform: poses[5][j], opacity: 1 } });
        el.animate(walk(fr, TOTAL), { duration: TOTAL, fill: 'forwards' });
      });
      chain = rbStart(grow, t0).then(function (started) {
        t0 = started;
        ctx.cue('start');
        return settled(grow);
      }).then(function () {
        if (!cover.isConnected) return;
        Array.prototype.forEach.call(set.querySelectorAll('.o55np-deco > i'), function (el) {
          el.getAnimations().forEach(function (a) { try { a.commitStyles(); } catch (e) { /* not rendered */ } a.cancel(); });
        });
        ground.style.opacity = '1';
        grow.cancel(); growIn.cancel();
      });
    } else {
      var shutPose = rbPose(full, -14, box);
      Array.prototype.forEach.call(deco, function (el, j) { el.style.transform = shutPose[j]; el.style.opacity = '1'; });
      ground.style.opacity = '1';
      cover.setAttribute('data-hold', '');
      var shut = rbSlats(cover, set, 'in', 60);
      chain = rbStart(shut.first, t0).then(function (started) {
        t0 = started;
        ctx.cue('start');
        return shut.done;
      }).then(function () {
        if (!cover.isConnected) return;
        cover.removeAttribute('data-hold');
        shut.wrap.remove();
      });
    }
    return chain.then(function () {
      if (!cover.isConnected) return;
      log.setAttribute('data-on', '');
      plan = rbShift(plan, since(t0));
      var typing = rbType(log, plan, since(t0));
      return settledStart(typing.anims).then(function () {
        ctx.paint();
        return frames(2);
      }).then(function () { return rbAt(cover, t0, plan.done); }).then(function () {
        if (!cover.isConnected) return;
        rbClear(log, typing, plan, t0);
        if (!cover.isConnected) return;
        if (!folding) {
          var slats = rbSlats(cover, set, 'out', 160);
          set.remove();
          return rbWait(cover, 160).then(function () {
            if (ctx.unhold) ctx.unhold();
            ctx.cue('reveal');
            return slats.done;
          }).then(function () { rbRelease(ctx); });
        }
        var to = home(rbBox(cover));
        return rbWait(cover, 120).then(function () {
          log.style.display = 'none';
          if (ctx.unhold) ctx.unhold();
          ctx.cue('reveal');
          var G = [0.1, 0.25, 0.45, 0.7, 0.9, 1];
          var rects = G.map(function (f) { return lerpRect(full, to, f); });
          var off = G.map(function (f) { return -14 + 17 * f; });
          var TOTAL = 450;
          var clips = rects.map(function (r) { return clipOf(r, box); });
          var idle = clipOf(full, box), last = clipOf(to, box);
          var foldFrames = [{ t: 0, v: { transform: idle[0], opacity: 1 } }];
          var backFrames = [{ t: 0, v: { transform: idle[1] } }];
          clips.forEach(function (c, k) {
            foldFrames.push({ t: 60 * (k + 1), v: { transform: c[0], opacity: 1 } });
            backFrames.push({ t: 60 * (k + 1), v: { transform: c[1] } });
          });
          foldFrames.push({ t: 390, v: { transform: last[0], opacity: 0 } });
          foldFrames.push({ t: TOTAL, v: { transform: last[0], opacity: 0 } });
          backFrames.push({ t: TOTAL, v: { transform: last[1] } });
          var fold = ground.animate(walk(foldFrames, TOTAL), { duration: TOTAL, fill: 'forwards' });
          inner.animate(walk(backFrames, TOTAL), { duration: TOTAL, fill: 'forwards' });
          var poses = [rbPose(full, -14, box)].concat(rects.map(function (r, k) { return rbPose(r, off[k], box); }));
          var letGo = rbPose(to, 7, box);
          Array.prototype.forEach.call(deco, function (el, j) {
            var fr = poses.map(function (p, k) { return { t: 60 * k, v: { transform: p[j], opacity: 1 } }; });
            if (j < 4) fr.push({ t: 390, v: { transform: poses[6][j], opacity: 0 } });
            else fr.push({ t: 420, v: { transform: letGo[j], opacity: 1 } }, { t: 450, v: { transform: letGo[j], opacity: 0 } });
            fr.push({ t: TOTAL, v: { transform: j < 4 ? poses[6][j] : letGo[j], opacity: 0 } });
            el.animate(walk(fr, TOTAL), { duration: TOTAL, fill: 'forwards' });
          });
          return settled(fold);
        }).then(function () { rbRelease(ctx); });
      });
    });
  }
  var rebooting = false;
  function reboot(repaint, info) {
    info = info || {};
    var on = !!info.on, reason = info.reason;
    var snd = rbSounds(info, on, rebooting || document.hidden);
    var seen = {};
    var cue = function (phase) {
      var order = ['start', 'reveal', 'gone'], i, p;
      for (i = 0; i < order.length; i++) {
        p = order[i];
        if (!seen[p]) {
          seen[p] = 1;
          if (p === 'start') snd.hum();
          else if (p === 'reveal') snd.wake();
          try { if (typeof info.onReveal === 'function') info.onReveal(p); } catch (e) { /* the caller's beat never stops the moment */ }
        }
        if (p === phase) break;
      }
    };
    var painted = false;
    var paint = function () { if (painted) return; painted = true; try { repaint(); } catch (e) { /* the repaint is the caller's */ } sync(); };
    if (rebooting || !installed('reboot') || still() || document.hidden || !document.body) {
      cue('start'); paint(); cue('reveal'); cue('gone');
      return Promise.resolve();
    }
    rebooting = true;
    var ctx = { cover: null, unhold: null, paint: paint, cue: cue };
    return Promise.resolve().then(function () {
      return rebootPlate(ctx, info, !on && reason !== 'replay');
    }).then(function () { /* the moment is decoration */ }, function () { /* a thrown animation still repaints */ }).then(function () {
      paint();
      if (ctx.cover && ctx.cover.parentNode) ctx.cover.remove();
      rbRelease(ctx);
      rebooting = false;
      cue('gone');
    });
  }
  PARTS.reboot = { on: function () {}, off: function () {} };

  /* ---------- arrivals: what the concept just drew (its afterRender observer slot) -------------------------------------- */
  /* Toasts carry no severity: their words decide. Errors are failures and refusals; warnings are what could not happen
     yet or was held; a proposal asks the reader to act. */
  var ERR = /\b(fail(ed|s|ure)?|error|refused|denied|blocked|rolled back|lost|crash)/i;
  var WARN = /\b(not |can.?t|cannot|held|stale|unable|limit|queue full|stop before|unavailable|offline|interrupted|paused)/i;
  var ASK = /^(approve|review|confirm|choose|decide|allow|grant)\b/i;
  function toastKind(t) { var s = String((t && t.title) || '') + ' ' + String((t && t.detail) || ''); return ERR.test(t && t.title || '') ? 'error' : (ERR.test(s) || WARN.test(t && t.title || '')) ? 'warn' : ASK.test(t && t.title || '') ? 'proposal' : 'report'; }
  var seenToast = {}, seenRefusal = typeof WeakSet !== 'undefined' ? new WeakSet() : null, seenFail = typeof WeakSet !== 'undefined' ? new WeakSet() : null;
  var lastTid = null, seenMsg = null;
  /* arriving cards in these states are failed events */
  var FAILED_SEL = '.event-card.danger, .event-card.warning, [data-state="failed"], [data-state="blocked"], .sched-card-failed, .tx-terminal-error, .is-failed';
  function onToasts(c) {
    var root = document.getElementById('pmOverlayRoot'), stack = root && root.querySelector(':scope > .toast-stack');
    var list = ((c.state && c.state.toast) || []).slice(-3), nodes = stack ? stack.children : [];
    var ids = {};
    list.forEach(function (t, i) {
      var el = nodes[i]; ids[t.id] = 1; if (!el) return;
      var kind = toastKind(t), pod = kind === 'error' || kind === 'warn' ? 'alert' : kind;
      /* the app's patch rewrites every attribute it does not know: the kind is written again after each one */
      if (el.getAttribute('data-o55-pod') !== pod) el.setAttribute('data-o55-pod', pod);
      if (el.getAttribute('data-o55-sev') !== kind) el.setAttribute('data-o55-sev', kind);
      if (seenToast[t.id]) return;
      seenToast[t.id] = 1;
      /* the split copies are taken before the words scramble */
      if (pod === 'alert') alertFx(el, true);
      if (live.decode) { decode(el.querySelector('strong')); decode(el.querySelector('span')); }
      if (live.pod) podDeliver();
      sfx(pod === 'alert' ? 'alert' : 'pod');
    });
    Object.keys(seenToast).forEach(function (id) { if (!ids[id]) delete seenToast[id]; });
    /* a refusal that appears in a sheet or a menu */
    if (root && seenRefusal && (live.glitch || live.sweep || live.particles)) {
      root.querySelectorAll('.pmx-refusal').forEach(function (el) { if (!seenRefusal.has(el)) { seenRefusal.add(el); alertFx(el, false); sfx('alert'); } });
    }
  }
  function onApp(c) {
    var t = c.thread, tid = c.state && c.state.selectedThread, msgs = (t && t.messages) || [];
    if (tid !== lastTid || !seenMsg) {
      var switched = lastTid !== null && seenMsg;
      lastTid = tid; seenMsg = {};
      msgs.forEach(function (m) { seenMsg[m.id] = 1; });
      if (!switched) return;
      var tr = document.querySelector('.chat-stage .transcript');
      if (live.wipe && tr && !still() && !document.hidden) { var r = tr.getBoundingClientRect(); if (r.width > 40 && r.height > 40) threadWipe(r); }
      if (live.decode) {
        var go = function () { document.querySelectorAll('.chat-header .pmx-chat-title-word').forEach(function (w, i) { if (i < 6) decode(w); }); };
        if (live.wipe) window.setTimeout(go, 110); else go();
      }
      /* refusals and failures already in a thread you open are not arrivals */
      document.querySelectorAll('.transcript-inner .pmx-refusal').forEach(function (el) { if (seenRefusal) seenRefusal.add(el); });
      return;
    }
    var fresh = [];
    for (var i = 0; i < msgs.length; i++) if (!seenMsg[msgs[i].id]) { seenMsg[msgs[i].id] = 1; fresh.push(msgs[i]); }
    if (!fresh.length) return;
    var inner = document.querySelector('.transcript-inner');
    fresh.forEach(function (m, n) {
      var el = document.querySelector('.transcript-inner [data-message-id="' + (window.CSS && CSS.escape ? CSS.escape(m.id) : m.id) + '"]')
        || (inner && fresh.length === 1 ? inner.lastElementChild : null);
      if (!el) return;
      if (live.decode) {
        var head = el.querySelector(':scope .message-role, :scope .system-card-head .title, :scope .pmx-run-head .pmx-receipt-title');
        if (head) decode(head);
      }
      var bad = el.matches(FAILED_SEL) ? el : el.querySelector(FAILED_SEL);
      var refusal = el.querySelector('.pmx-refusal');
      if (refusal && seenRefusal) seenRefusal.add(refusal);
      if (bad || refusal) { alertFx(bad || refusal, false); sfx('alert'); }
    });
  }
  function onScope(info) {
    /* the work tick: an Orbit step or a rail step that fails */
    var sc = info && info.scope; if (!sc || !sc.querySelectorAll || !seenFail || !(live.glitch || live.sweep || live.particles)) return;
    sc.querySelectorAll('.orbit-node.failed, .rail8-item.failed').forEach(function (el) { if (!seenFail.has(el)) { seenFail.add(el); alertFx(el, false); } });
  }
  var EXT = window.PM56_EXT;
  if (EXT && typeof EXT.slot === 'function') {
    EXT.slot('afterRender', function (c, info) {
      if (html.getAttribute('data-o55-nier') !== 'on') { lastTid = null; seenMsg = null; return; }
      if (pod) podShySoon();
      try {
        curReMark();
        var phase = info && info.phase;
        if (phase === 'overlay') onToasts(c);
        else if (phase === 'app') onApp(c);
        else if (phase === 'scope') onScope(info);
      } catch (e) { /* decoration only */ }
    });
  }

  /* ---------- wiring ------------------------------------------------------------------------------------------------------ */
  function start() {
    var n = N(); if (!n || typeof n.onChange !== 'function') return false;
    n.setTransition(reboot);
    n.onChange(function () { sync(); });
    return true;
  }
  if (!start()) window.setTimeout(start, 0);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync); else window.setTimeout(sync, 0);

  /* test hooks: which script parts are live, what sounded, a decode or an alert on demand; play() is the synth for the
     World parts (nier-world.js), heard only while Menu sounds is live and sound is on */
  window.PM_NIER_PARTS = Object.freeze({
    live: function () { return Object.keys(live).filter(function (k) { return live[k]; }); },
    sounds: function () { return sfxLog.slice(); },
    decode: function (el) { return decode(el); },
    alert: function (el, split) { alertFx(el, !!split); },
    play: function (name) { return sfx(name); },
    sync: sync
  });
})();
