/* pip.js: the live Pip in the chat (W4, PM7 build 2026-10-29; DL-239, ACD-507, PC1-PC5). OWNER: pm7-chatpip.

   module-shell.js draws Pip (the agent primitive, the list faces, the sheet's Pip by its close button) with the one kit
   (window.PMLogo.kit). This file makes the sheet's Pip and the other Pips on screen live, the way onboarding's Pip moves
   (rounds 6-10):
     - watch: rest the pointer on a control for 0.42 s and the sheet's Pip watches it; leave and it looks back;
     - wonder: while you type in a sheet's field (big eyes, a round mouth), until 1.5 s after the last key;
     - oops: press a main button that can't be used yet (pointer or keyboard), for 1.9 s;
     - happy and a hop: press a main button that works; when that press closes the sheet, a copy of Pip cheers where
       it hung and is lifted out of view on its strings (lift-off), in the layer the sheet's exit copy uses;
     - face changes are a blink: the eyes shut on their line, the other parts shrink to their centres, the new face
       opens a touch past full; nothing fades and two faces never show at once. Retro changes in its own steps, NieR in
       one cut with a flicker;
     - gaze: the eyes lean toward the pointer and stay on its last known spot (never glancing away and back); the
       thinking dots, sleep and happy faces don't follow;
     - sway and drop-in: the sheet's Pip drops in on its strings as a sheet opens and sways a little at rest (pip.css,
       PC1: idle motion in sheets);
     - blinks: now and then one Pip on screen blinks, never two in step.
   How it stays live in a chat that renders by reconciling markup (app.js pmPatch): every move is a Web Animation on
   Pip's own nodes, which the reconcile never resets, and a face change redraws exactly what module-shell.js would draw
   for the new face and records it (hostMood), so the next render draws the same and the reconcile finds nothing to do.
   No observer, no innerHTML hook, no island: the sheet's Pip is found after each render (PM56_EXT afterRender).
   Every loop rests during a drag (body.pm-resizing and the other drag classes), in a hidden tab and offscreen, and
   Reduced Motion keeps every Motion part still (faces still change, in one step). Animation speed scales every move. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.PM56_PIP) return;
  var EXT = W.PM56_EXT;

  var SH = function () { return W.PM56_SHELL || {}; };
  var LOGO = function () { return W.PMLogo || null; };
  var DRAG = ['pm-resizing', 'pm-ab-dragging', 'pmw-dragging', 'pmu-pointer-op', 'pm7u-pointer-op'];
  function reduced() {
    var h = D.documentElement;
    return h.getAttribute('data-motion') === 'reduced' || !!(D.body && D.body.classList.contains('pm56-reduced')) ||
      !!(W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function dragging() { var b = D.body; return !!b && DRAG.some(function (c) { return b.classList.contains(c); }); }
  function speed() { var L = LOGO(); try { return L && L.clock ? L.clock.speed() : 1; } catch (e) { return 1; } }
  function look() { var S = SH(); return S.pmxPipLook ? S.pmxPipLook() : 'basic-dark'; }
  function family() { return look().split('-')[0]; }
  /* the parts Pip settings switch (M2: general.visual.pip-parts through PM_PIP_PARTS); until then every part is on but
     the app voice (S3) */
  function wants(part) { return part !== 'app-voice'; }
  function moves(part) { return wants(part) && !reduced(); }
  function anim(el, frames, o) {
    if (!el || typeof el.animate !== 'function') return null;
    o = Object.assign({}, o); o.duration = Math.round((o.duration || 200) * speed());
    try { return el.animate(frames, o); } catch (e) { return null; }
  }

  /* ---------------------------------------------------------------- the sheet's Pip */
  var MOOD = Object.create(null);        /* kind -> the face its Pip shows now (module-shell draws it) */
  var hosts = new Map();                 /* host element -> its live state */
  var BASE = 'idle';
  function hostMood(kind) { return MOOD[kind] || BASE; }
  function stOf(el) { return el ? hosts.get(el) : null; }
  function hostIn(el) {
    var s = el && el.closest ? el.closest('.pmx-sheet') : null;
    if (!s || s.classList.contains('pmx-ghost')) return null;
    var h = s.querySelector(':scope > .pmx-head > .pmx-pip-host');
    return h ? stOf(h) : null;
  }
  function mount(el) {
    var st = { el: el, kind: el.getAttribute('data-pip-kind') || 'sheet', mood: el.getAttribute('data-pip-mood') || BASE, base: BASE, gx: 0, gy: 0 };
    hosts.set(el, st);
    MOOD[st.kind] = st.mood;
    st.face = el.querySelector('.pmx-pip-face');
    /* drop in on its strings as the sheet opens: Retro and NieR step */
    var fam = family();
    if (moves('sway-and-physics')) anim(el, [{ transform: 'translateY(-22px)' }, { transform: 'none' }], { duration: 640, easing: fam === 'retro' ? 'steps(5, end)' : fam === 'nier' ? 'steps(4, end)' : 'cubic-bezier(.3, 1.45, .5, 1)' });
    applyGaze(st, true);
  }
  function unmount(st) {
    clearTimeout(st.holdT); clearTimeout(st.typeT); clearTimeout(st.swapT); clearTimeout(st.openT); clearTimeout(st.backT);
    hosts.delete(st.el);
    if (MOOD[st.kind] && ![...hosts.values()].some(function (o) { return o.kind === st.kind; })) delete MOOD[st.kind];
  }
  /* after each render: find the sheet's Pip that just opened, and let go of one whose sheet closed. A sheet closed by a
     press that cheered leaves as the exit copy (pmx-system ghost) moves it to the effects layer: Pip lifts off from it. */
  function scan() {
    D.querySelectorAll('.pmx-sheet:not(.pmx-ghost) > .pmx-head > .pmx-pip-host').forEach(function (el) {
      var st = stOf(el);
      if (!st) mount(el);
      else if (st.mood !== (el.getAttribute('data-pip-mood') || BASE)) { st.mood = el.getAttribute('data-pip-mood') || BASE; st.face = el.querySelector('.pmx-pip-face'); }
    });
    hosts.forEach(function (st) {
      if (st.el.isConnected && !st.el.closest('.pmx-ghost')) return;
      if (st.leaving) return;
      st.leaving = true;
      var copy = st.el.cloneNode(true), cheered = st.cheerAt && Date.now() - st.cheerAt < 4000;
      unmount(st);
      if (!cheered || !moves('cheers')) return;
      /* the exit copy takes the sheet a moment later (a microtask); look again on the next frame */
      W.requestAnimationFrame(function () { liftOff(st, copy); });
    });
  }
  function liftOff(st, copy) {
    var el = st.el, sheet = el.closest ? el.closest('.pmx-ghost') : null;
    if (!el.isConnected || !sheet || /cancel|swap/.test(sheet.getAttribute('data-exit') || '')) return;
    var r = el.getBoundingClientRect();
    if (!r.width) return;
    copy.classList.add('pmx-pip-lift-copy');
    copy.setAttribute('aria-hidden', 'true');
    copy.style.left = Math.round(r.left) + 'px'; copy.style.top = Math.round(r.top) + 'px';
    (sheet.parentNode || D.body).appendChild(copy);
    el.style.visibility = 'hidden';
    var fam = family();
    var a = anim(copy, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(2px)', opacity: 1, offset: .12 }, { opacity: 1, offset: .6 }, { transform: 'translateY(-130px)', opacity: 0 }],
      { duration: 950, easing: fam === 'retro' ? 'steps(10, end)' : fam === 'nier' ? 'steps(6, end)' : 'cubic-bezier(.55, 0, .75, .4)', fill: 'forwards' });
    var drop = function () { if (copy.parentNode) copy.parentNode.removeChild(copy); };
    if (a && a.finished) a.finished.then(drop, drop); else drop();
    setTimeout(drop, 2000);
  }

  /* a face change, drawn as module-shell draws it (so the next render agrees) */
  function hostMarkup(st, mood) {
    var S = SH(); if (!S.pmxPipHost) return null;
    var t = D.createElement('template');
    t.innerHTML = S.pmxPipHost(st.kind, mood);
    return t.content.firstElementChild;
  }
  function swapNow(st, mood) {
    var fresh = hostMarkup(st, mood); if (!fresh) return;
    MOOD[st.kind] = mood; st.mood = mood;
    st.el.setAttribute('data-pip-mood', mood);
    var nf = fresh.querySelector('.pmx-pip-face');
    var fam = family();
    if (fam !== 'retro' && fam !== 'nier' && st.face && nf && st.face.isConnected) st.face.innerHTML = nf.innerHTML;
    else { st.el.innerHTML = fresh.innerHTML; st.face = st.el.querySelector('.pmx-pip-face'); st.gx = st.gy = 0; }
    applyGaze(st, true);
  }
  /* One face change at a time. A change already closing lands on the newest face asked for; one already opening
     finishes, then goes on to the next. A request for the face it is already showing or heading to does nothing, so
     typing (an input event a key) never restarts a change. */
  function settle(st) { clearTimeout(st.swapT); clearTimeout(st.openT); st.swapT = st.openT = 0; st.phase = null; st.target = st.next = null; }
  function setFace(st, mood, instant) {
    if (!st.el.isConnected) return;
    var goal = st.phase === 'closing' ? st.target : st.phase === 'opening' && st.next ? st.next : st.mood;
    if (mood === goal) return;
    var fam = family();
    if (fam === 'nier') {
      /* NieR cuts, with a flicker */
      settle(st);
      swapNow(st, mood);
      if (moves('face-transitions')) anim(st.el.querySelector('.pmx-pip-pup'), [{ opacity: .2 }, { opacity: 1, offset: .5 }, { opacity: .5, offset: .75 }, { opacity: 1 }], { duration: 200, easing: 'steps(2, end)' });
      return;
    }
    if (fam === 'retro' || instant || !moves('face-transitions') || !st.face) { settle(st); swapNow(st, mood); return; }
    if (st.phase === 'closing') { st.target = mood; return; }
    if (st.phase === 'opening') { st.next = mood; return; }
    /* the old face closes on the eye line, the new one opens a touch past full (onboarding round 9) */
    st.phase = 'closing'; st.target = mood;
    var parts = st.face.children;
    for (var i = 0; i < parts.length; i++) {
      var eyes = parts[i].classList.contains('pmx-pip-eyes');
      anim(parts[i], [{ transform: 'none' }, { transform: eyes ? 'scaleY(.08)' : 'scale(.2)' }], { duration: 95, easing: 'ease-in', fill: 'forwards' });
    }
    st.swapT = setTimeout(function () {
      var m = st.target; st.target = null; st.swapT = 0;
      swapNow(st, m);
      st.phase = 'opening';
      var np = st.face ? st.face.children : [];
      for (var j = 0; j < np.length; j++) {
        var e2 = np[j].classList.contains('pmx-pip-eyes');
        anim(np[j], [{ transform: e2 ? 'scaleY(.08)' : 'scale(.2)' }, { transform: e2 ? 'scaleY(1.06)' : 'scale(1.06)', offset: .7 }, { transform: 'none' }], { duration: 170, easing: 'cubic-bezier(.2, .8, .3, 1.15)' });
      }
      st.openT = setTimeout(function () {
        st.openT = 0; st.phase = null;
        var n = st.next; st.next = null;
        if (n && n !== st.mood) setFace(st, n);
      }, Math.round(175 * speed()));
    }, Math.round(95 * speed()));
  }
  function feel(st, mood, hold, instant) {
    clearTimeout(st.holdT);
    setFace(st, mood, instant);
    if (hold) st.holdT = setTimeout(function () { if (!st.typing) setFace(st, st.base); }, Math.round(hold * speed()));
  }
  function hop(st) {
    if (!moves('cheers')) return;
    var fam = family();
    anim(st.el, [{ transform: 'none' }, { transform: 'translateY(-6px)', offset: .34 }, { transform: 'translateY(1px)', offset: .64 }, { transform: 'none' }],
      { duration: 600, easing: fam === 'retro' ? 'steps(6, end)' : fam === 'nier' ? 'steps(4, end)' : 'cubic-bezier(.3, 0, .3, 1)' });
  }

  /* gaze: the eyes lean toward the last place the pointer was, and stay there */
  var lastPt = null, gazeQueued = false;
  var NO_GAZE = { dots: 1, working: 1, sleep: 1, happy: 1 };
  function applyGaze(st, now) {
    if (!st.face || !st.face.isConnected) return;
    var x = 0, y = 0;
    if (lastPt && wants('gaze') && !NO_GAZE[st.mood] && family() !== 'retro') {
      var r = st.el.getBoundingClientRect(); if (!r.width) return;
      var cx = r.left + r.width * .33, cy = r.top + r.height * .64, dx = lastPt[0] - cx, dy = lastPt[1] - cy, l = Math.hypot(dx, dy) || 1, k = Math.min(1, l / 160);
      x = Math.round(dx / l * 2.4 * k * 10) / 10; y = Math.round(dy / l * 1.7 * k * 10) / 10;
    }
    if (x === st.gx && y === st.gy && st.gazeA) return;
    var from = 'translate(' + st.gx + 'px, ' + st.gy + 'px)', to = 'translate(' + x + 'px, ' + y + 'px)';
    var prev = st.gazeA;
    st.gazeA = anim(st.face, [{ transform: from }, { transform: to }], { duration: now || reduced() ? 1 : 140, easing: 'ease-out', fill: 'forwards' });
    if (prev) try { prev.cancel(); } catch (e) { }
    st.gx = x; st.gy = y;
  }
  D.addEventListener('pointermove', function (e) {
    lastPt = [e.clientX, e.clientY];
    if (!hosts.size || gazeQueued || dragging()) return;
    gazeQueued = true;
    W.requestAnimationFrame(function () { gazeQueued = false; hosts.forEach(function (st) { applyGaze(st); }); });
  }, { passive: true });

  /* watch: the pointer rests on one of the sheet's controls for 0.42 s */
  var CONTROL = 'button, [role="switch"], [role="radio"], [role="tab"], select, a[href], label, .pmx-roster-row, .pmx-p-seat, summary, input, textarea';
  var dwellT = 0, dwellEl = null;
  D.addEventListener('pointerover', function (e) {
    var st = hostIn(e.target); if (!st || !wants('watches')) return;
    var c = e.target.closest(CONTROL);
    if (!c || c === dwellEl || c.closest('.pmx-pip-host') || c.classList.contains('pmx-close')) return;
    dwellEl = c; clearTimeout(dwellT);
    dwellT = setTimeout(function () { if (dwellEl === c && st.mood !== 'happy' && st.mood !== 'oops' && !st.typing) feel(st, 'watch'); }, 420);
  }, true);
  D.addEventListener('pointerout', function (e) {
    var st = hostIn(e.target); if (!st) return;
    var c = e.target.closest(CONTROL);
    if (c && c === dwellEl && !(e.relatedTarget && c.contains(e.relatedTarget))) {
      dwellEl = null; clearTimeout(dwellT);
      if (st.mood === 'watch') { clearTimeout(st.backT); st.backT = setTimeout(function () { if (!dwellEl && st.mood === 'watch') setFace(st, st.base); }, 220); }
    }
  }, true);
  /* wonder while typing in a sheet's field */
  D.addEventListener('input', function (e) {
    var st = hostIn(e.target); if (!st || !wants('wonders-while-typing')) return;
    if (!/^(TEXTAREA|INPUT)$/.test(e.target.tagName)) return;
    st.typing = true; clearTimeout(st.typeT); clearTimeout(st.holdT);
    feel(st, 'wonder');
    st.typeT = setTimeout(function () { st.typing = false; if (st.mood === 'wonder') setFace(st, st.base); }, 1500);
  }, true);

  /* the sheet's main button: oops when it can't be used yet, happy and a hop when it works. Pointer and keyboard alike;
     a refused press is never let through (UIW-013), and nothing here holds or replays a press. */
  var MAIN = '.pmx-primary, .pmx-foot .primary-button';
  function refused(b) { return !!(b.disabled || b.getAttribute('aria-disabled') === 'true' || b.hasAttribute('data-pm-hover-was-disabled')); }
  function pressed(st, b) {
    if (refused(b)) { if (wants('oops')) { st.typing = false; feel(st, 'oops', 1900); } return; }
    if (!wants('cheers')) return;
    st.cheerAt = Date.now();
    feel(st, 'happy', 2600, true);
    hop(st);
  }
  /* a disabled main button lets the press fall through to its footer, so a press is matched by where it landed */
  D.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    var st = hostIn(e.target); if (!st) return;
    var sheet = e.target.closest('.pmx-sheet');
    var b = [].slice.call(sheet.querySelectorAll(MAIN)).find(function (x) { var r = x.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; });
    if (b) { st.downOn = b; pressed(st, b); }
  }, true);
  D.addEventListener('click', function (e) {
    var st = hostIn(e.target); if (!st) return;
    var b = e.target.closest(MAIN);
    /* a pointer press already reacted on pointerdown; a keyboard press (detail 0) reacts here */
    if (b && e.detail === 0 && st.downOn !== b) pressed(st, b);
    st.downOn = null;
  }, true);
  D.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var b = e.target && e.target.closest ? e.target.closest(MAIN) : null;
    if (!b || !refused(b)) return;
    var st = hostIn(b); if (st && wants('oops')) { st.typing = false; feel(st, 'oops', 1900); }
  }, true);

  /* ---------------------------------------------------------------- blinks, one Pip at a time */
  var blinkT = 0, lastBlink = new WeakMap();
  var BLINKS = { idle: 1, watch: 1, wonder: 1, alert: 1, oops: 1, think: 1 };
  function moodOfBlink(el) {
    var h = el.closest('.pmx-pip-host');
    if (h) return h.getAttribute('data-pip-mood') || 'idle';
    var m = el.closest('.pmx-mark, .pmx-p-mark');
    var s = m ? m.getAttribute('data-state') : '';
    return SH().pmxPipMood ? SH().pmxPipMood(s) : 'idle';
  }
  function blinkTick() {
    blinkT = setTimeout(blinkTick, Math.round(1400 + Math.random() * 1800));
    if (D.hidden || dragging() || !moves('blinks')) return;
    /* read where Pips are in a frame's own layout pass, never forcing one mid-task */
    W.requestAnimationFrame(blinkOne);
  }
  function blinkOne() {
    if (D.hidden || dragging()) return;
    var all = D.querySelectorAll('.pmx-pip .pmx-pip-blink'), vh = W.innerHeight, vw = W.innerWidth, now = Date.now(), pick = [];
    var n = Math.min(all.length, 60), start = all.length > n ? Math.floor(Math.random() * all.length) : 0;
    for (var i = 0; i < n; i++) {
      var el = all[(start + i) % all.length];
      if ((lastBlink.get(el) || 0) > now - 5200 || el.closest('.pmx-ghost, .pmx-pip-lift-copy')) continue;
      var r = el.getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue;
      if (!BLINKS[moodOfBlink(el)]) continue;
      pick.push(el);
    }
    if (!pick.length) return;
    var el2 = pick[Math.floor(Math.random() * pick.length)];
    lastBlink.set(el2, now);
    anim(el2, [{ transform: 'none' }, { transform: 'scaleY(.1)', offset: .42 }, { transform: 'scaleY(.1)', offset: .58 }, { transform: 'none' }], { duration: 170, easing: 'ease-in-out' });
  }
  function startBlinks() { if (!blinkT) blinkT = setTimeout(blinkTick, 1600); }
  D.addEventListener('visibilitychange', function () { if (!D.hidden) startBlinks(); });

  /* ---------------------------------------------------------------- the thinking placeholder (W5 L5, conflict 2)
     "is thinking" leads with the system loader in its Think motion (window.PM_PIP_LOADER, the one loader). One Pip per
     reply: while the reply's work runs, Pip sits in the Orbit's centre (orbit.js) with its thinking dots, and the
     placeholder's loader steps aside; it never shows twice. */
  function loaderHtml() {
    var LD = W.PM_PIP_LOADER;
    return LD && LD.html ? LD.html({ motion: LD.motion ? LD.motion('thinking') : 'think', px: 16 }) : '';
  }
  function thinkingPip() {
    var l = loaderHtml();
    return l ? '<span class="tx-pending-pip" aria-hidden="true">' + l + '</span>' : '';
  }
  function syncThinking() {
    var slots = D.querySelectorAll('.tx-pending-pip');
    if (!slots.length) return;
    var orbit = !!D.querySelector('.orbit-core-face.is-live');
    slots.forEach(function (s) {
      if (!s.firstElementChild) { var l = loaderHtml(); if (!l) return; s.innerHTML = l; }
      var ld = s.firstElementChild;
      if (ld.hidden !== orbit) ld.hidden = orbit;
    });
  }

  /* ---------------------------------------------------------------- hooks */
  if (EXT && EXT.slot) EXT.slot('afterRender', function () { scan(); syncThinking(); });
  startBlinks();

  W.PM56_PIP = Object.freeze({
    version: '1.0',
    hostMood: hostMood,
    wants: wants,
    thinkingPip: thinkingPip,
    /* tests and Demo Studio: the sheet Pips on screen and a face on each */
    hosts: function () { return [...hosts.values()].map(function (s) { return { kind: s.kind, mood: s.mood }; }); },
    feel: function (mood, hold) { hosts.forEach(function (st) { feel(st, mood, hold); }); }
  });
})();
