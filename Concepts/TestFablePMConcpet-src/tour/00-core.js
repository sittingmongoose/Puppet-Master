/* PMF Guided Tour — core: overlay, spotlight, coach card, Show Me pointer.
   Concept simulation over the real shell. Zero provider calls: every fixture is
   local and deterministic; the tour observes real state and invokes real
   commands. Motion: the spotlight and card travel (exponential settle, ~350ms),
   the pointer moves along a slight arc, and every Show Me shares the four beats
   pre-cue / travel / arrival / settle. */
(function () {
  'use strict';
  if (window.PMF_TOUR) return;
  var OB = window.PMF_ONBOARDING, U = OB ? OB.util : null;
  var T = window.PMF_TOUR = {
    schema_id: 'pm.guided_tour.pmf.concept_api.v1', concept_simulation_only: true, version: '2026-09-04',
    storage_key: 'pmf.tour.v1', provider_requests: 0, usage_increment: 0, commands: [], receipts: [], events: []
  };
  T.util = U;
  var esc = U.esc, $ = U.$, $$ = U.$$;
  T.command = function (id, payload) { var r = { command_id: id, at: U.now(), payload: payload || {} }; T.commands.push(r); if (T.commands.length > 300) T.commands.shift(); return r; };
  T.receipt = function (kind, status, detail) { var r = { receipt_id: U.uid('tr'), kind: kind, status: status, at: U.now(), detail: detail || {} }; T.receipts.push(r); return r; };
  T.emit = function (name, detail) { T.events.push({ name: name, at: U.now(), detail: detail || {} }); try { document.dispatchEvent(new CustomEvent('pmf.tour.' + name, { detail: detail || {} })); } catch (e) {} };
  T.reduced = U.reduced;
  T.icons = OB.icons;

  var root, maskHole, blockers, ring, pointer, card, cardBody, cardFoot, chapters, note;
  var spot = { cur: null, tgt: null, pad: 8, radius: 12, on: false };
  var raf = 0, lastT = 0;

  T.mount = function () {
    if (root) return true;
    root = document.getElementById('pmf-tour'); if (!root) return false;
    maskHole = $('.pmft-hole', root); blockers = $$('.pmft-block', root); ring = $('.pmft-ring', root); pointer = $('.pmft-pointer', root);
    card = $('#pmft-card', root); cardBody = $('#pmft-card-body', root); cardFoot = $('#pmft-card-foot', root); chapters = $('#pmft-chapters', root); note = $('#pmft-note', root);
    root.addEventListener('click', function (ev) { var el = ev.target.closest && ev.target.closest('[data-act]'); if (!el || el.getAttribute('aria-disabled') === 'true') return; var fn = T.actions[el.getAttribute('data-act')]; if (fn) { try { fn(el, ev); } catch (e) { console.error('[pmf-tour] action', e); } } });
    root.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && T.showMeRunning) { ev.preventDefault(); T.cancelShowMe(); } });
    window.addEventListener('resize', function () { T.relayout(); });
    return true;
  };
  T.actions = {};
  T.show = function () { root.hidden = false; root.setAttribute('data-open', 'true'); requestAnimationFrame(function () { root.setAttribute('data-phase', 'on'); }); if (!raf) loop(); };
  T.hide = function () { root.setAttribute('data-phase', 'off'); root.setAttribute('data-open', 'false'); setTimeout(function () { root.hidden = true; }, U.reduced() ? 20 : 500); spot.on = false; T.pointerHide(); };

  // ---- spotlight ----------------------------------------------------------------
  function rectOf(el, pad) {
    if (!el) return null; var r = el.getBoundingClientRect(); if (!r.width && !r.height) return null;
    pad = pad == null ? spot.pad : pad;
    return { x: r.left - pad, y: r.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 };
  }
  T.spotlight = function (el, opts) {
    opts = opts || {};
    var r = el && el.getBoundingClientRect ? rectOf(el, opts.pad) : (el && el.w != null ? el : null);
    spot.target = el; spot.padCur = opts.pad == null ? 8 : opts.pad; spot.radius = opts.radius != null ? opts.radius : (U.family() === 'retro' ? 0 : 12);
    if (!r) { spot.on = false; root.setAttribute('data-spot', 'false'); root.setAttribute('data-block', 'false'); spot.tgt = null; return; }
    spot.tgt = r; spot.on = true; root.setAttribute('data-spot', 'true'); root.setAttribute('data-block', opts.block ? 'true' : 'false');
    if (!spot.cur || U.reduced()) spot.cur = { x: r.x, y: r.y, w: r.w, h: r.h };
    ring.style.borderRadius = spot.radius + 'px'; maskHole.setAttribute('rx', spot.radius);
    if (opts.precue) { ring.classList.remove('is-precue'); void ring.offsetWidth; ring.classList.add('is-precue'); setTimeout(function () { ring.classList.remove('is-precue'); }, 1900); }
  };
  T.arrive = function () { ring.classList.remove('is-arrive'); void ring.offsetWidth; ring.classList.add('is-arrive'); setTimeout(function () { ring.classList.remove('is-arrive'); }, 600); };
  T.relayout = function () { if (spot.target && spot.target.getBoundingClientRect) { var r = rectOf(spot.target, spot.padCur); if (r) spot.tgt = r; } if (T.current) T.placeCard(); };
  function paintSpot() {
    var c = spot.cur; if (!c) return;
    maskHole.setAttribute('x', c.x); maskHole.setAttribute('y', c.y); maskHole.setAttribute('width', Math.max(0, c.w)); maskHole.setAttribute('height', Math.max(0, c.h));
    ring.style.transform = 'translate(' + c.x.toFixed(1) + 'px,' + c.y.toFixed(1) + 'px)'; ring.style.width = c.w.toFixed(1) + 'px'; ring.style.height = c.h.toFixed(1) + 'px';
    var W = window.innerWidth, H = window.innerHeight;
    var b = blockers; if (b.length === 4) {
      b[0].style.cssText = 'left:0;top:0;width:' + W + 'px;height:' + Math.max(0, c.y) + 'px';
      b[1].style.cssText = 'left:' + (c.x + c.w) + 'px;top:' + c.y + 'px;width:' + Math.max(0, W - c.x - c.w) + 'px;height:' + c.h + 'px';
      b[2].style.cssText = 'left:0;top:' + (c.y + c.h) + 'px;width:' + W + 'px;height:' + Math.max(0, H - c.y - c.h) + 'px';
      b[3].style.cssText = 'left:0;top:' + c.y + 'px;width:' + Math.max(0, c.x) + 'px;height:' + c.h + 'px';
    }
  }
  function loop() {
    raf = requestAnimationFrame(loop);
    var now = performance.now(), dt = (lastT ? Math.min(.05, (now - lastT) / 1000) : .016) / U.timeScale(); lastT = now;
    if (!root || root.hidden) return;
    if (spot.target && spot.target.getBoundingClientRect && spot.on) {
      if (!spot.target.isConnected && T.current && typeof T.current.target === 'function') { var again = null; try { again = T.current.target(); } catch (e) {} if (again) spot.target = again; }
      var r = rectOf(spot.target, spot.padCur); if (r) spot.tgt = r;
    }
    if (spot.tgt && spot.cur) {
      var k = U.reduced() ? 1 : 1 - Math.exp(-dt * (U.family() === 'basic' ? 16 : 11));
      var c = spot.cur, t = spot.tgt;
      c.x += (t.x - c.x) * k; c.y += (t.y - c.y) * k; c.w += (t.w - c.w) * k; c.h += (t.h - c.h) * k;
      paintSpot();
    }
    if (T.current && !T.cardPinned && T.cardFollow) T.placeCard(true);
  }

  // ---- coach card ---------------------------------------------------------------
  T.renderCard = function (html, footHtml, opts) {
    opts = opts || {};
    card.classList.remove('is-swap'); void card.offsetWidth; card.classList.add('is-swap');
    cardBody.innerHTML = U.str(html); cardFoot.innerHTML = U.str(footHtml || '');
    $$('button, [tabindex]', card).forEach(function (el) { el.setAttribute('data-pm-hover-exempt', 'true'); });
    T.placeCard();
    if (!opts.keepFocus) setTimeout(function () { var f = $('.pmft-btn.is-primary, .pmft-btn', cardFoot) || $('.pmft-skip', card); if (f) { try { f.focus({ preventScroll: true }); } catch (e) {} } }, U.reduced() ? 10 : 200);
  };
  T.renderChapters = function (list, currentIndex, progress) {
    chapters.innerHTML = list.map(function (c, i) { var st = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'todo'; var p = st === 'done' ? 1 : st === 'current' ? progress : 0; return '<div class="pmft-chapter" data-state="' + st + '" style="--p:' + p.toFixed(2) + '"><i></i><span>' + esc(c) + '</span></div>'; }).join('');
  };
  T.placeCard = function (quiet) {
    var W = window.innerWidth, H = window.innerHeight, cw = card.offsetWidth || 344, ch = card.offsetHeight || 200, gap = 18;
    var t = spot.on && spot.tgt ? spot.tgt : null;
    var x, y, place = 'none';
    if (!t) { x = (W - cw) / 2; y = Math.max(52, (H - ch) / 2); }
    else {
      var pref = T.current && T.current.place;
      var candidates = [
        ['right', t.x + t.w + gap, t.y + t.h / 2 - ch / 2],
        ['left', t.x - gap - cw, t.y + t.h / 2 - ch / 2],
        ['below', t.x + t.w / 2 - cw / 2, t.y + t.h + gap],
        ['above', t.x + t.w / 2 - cw / 2, t.y - gap - ch]
      ];
      if (pref) candidates.sort(function (a, b) { return (a[0] === pref ? -1 : 0) - (b[0] === pref ? -1 : 0); });
      var pick = null;
      for (var i = 0; i < candidates.length; i++) { var c = candidates[i]; if (c[1] >= 12 && c[1] + cw <= W - 12 && c[2] >= 12 && c[2] + ch <= H - 12) { pick = c; break; } }
      if (!pick) pick = candidates[0];
      place = pick[0]; x = U.clamp(pick[1], 12, W - cw - 12); y = U.clamp(pick[2], 52, H - ch - 12);
      // arrow toward the target center
      if (place === 'right' || place === 'left') card.style.setProperty('--arrow-y', U.clamp(t.y + t.h / 2 - y - 7, 16, ch - 30) + 'px');
      else card.style.setProperty('--arrow-x', U.clamp(t.x + t.w / 2 - x - 7, 16, cw - 30) + 'px');
    }
    card.setAttribute('data-place', place);
    if (!quiet) { card.classList.add('is-moving'); setTimeout(function () { card.classList.remove('is-moving'); }, 600); }
    card.style.left = x + 'px'; card.style.top = y + 'px';
  };
  T.setPrimary = function (patch) { var b = $('.pmft-btn.is-primary', cardFoot); if (!b) return; if (patch.disabled != null) b.setAttribute('aria-disabled', patch.disabled ? 'true' : 'false'); if (patch.label) b.innerHTML = esc(patch.label) + (patch.icon ? T.icons[patch.icon] : ''); };
  T.status = function (html) { var s = $('#pmft-status', card); if (s) s.innerHTML = U.str(html); };
  T.note = function (text, ms) { note.innerHTML = T.icons.check + '<span>' + esc(text) + '</span>'; note.classList.add('is-on'); clearTimeout(note._t); note._t = setTimeout(function () { note.classList.remove('is-on'); }, ms || 3600); };
  T.noteHide = function () { note.classList.remove('is-on'); };

  // ---- pointer (Show Me) -------------------------------------------------------------
  var P = { x: 0, y: 0 };
  T.pointerShow = function (x, y, label) { P.x = x; P.y = y; pointer.style.transform = 'translate(' + x + 'px,' + y + 'px)'; pointer.classList.add('is-on'); T.pointerLabel(label); };
  T.pointerLabel = function (label) { var l = $('.pmft-pointer-label', pointer); if (label) { l.textContent = label; pointer.classList.add('has-label'); } else pointer.classList.remove('has-label'); };
  T.pointerHide = function () { pointer.classList.remove('is-on', 'is-down', 'is-drag', 'has-label'); };
  T.pointerMove = function (x, y, dur, onFrame) {
    return new Promise(function (resolve) {
      var sx = P.x, sy = P.y, t0 = performance.now(); dur = U.reduced() ? 1 : dur * U.timeScale();
      var fam = U.family(); var ease = fam === 'retro' ? U.ease.steps(10) : U.ease.inOutCubic;
      var arc = Math.min(60, Math.hypot(x - sx, y - sy) * .12);
      (function step() {
        var k = U.clamp((performance.now() - t0) / dur, 0, 1), e = ease(k);
        var cx = U.lerp(sx, x, e), cy = U.lerp(sy, y, e) - Math.sin(k * Math.PI) * arc;
        P.x = cx; P.y = cy; pointer.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
        if (onFrame) onFrame(cx, cy, k);
        if (k < 1 && !T.showMeCancelled) requestAnimationFrame(step); else { P.x = x; P.y = y; pointer.style.transform = 'translate(' + x + 'px,' + y + 'px)'; resolve(); }
      })();
    });
  };
  T.pointerPress = function () { pointer.classList.add('is-down'); T.ripple(P.x, P.y); return U.sleep(U.reduced() ? 10 : 140).then(function () { pointer.classList.remove('is-down'); }); };
  T.ripple = function (x, y) { var r = document.createElement('span'); r.className = 'pmft-ripple'; r.style.left = x + 'px'; r.style.top = y + 'px'; root.appendChild(r); setTimeout(function () { r.remove(); }, 700); };
  T.center = function (el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  // synthetic pointer events, dispatched on the real element under the pointer
  T.pev = function (type, x, y, target) { var e = new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, pointerId: 91, pointerType: 'mouse', button: 0, buttons: type === 'pointerup' ? 0 : 1, isPrimary: true, view: window }); (target || document.elementFromPoint(x, y) || document).dispatchEvent(e); return e; };

  // wait until predicate true or timeout (ms); resolves boolean
  T.until = function (pred, ms, every) { return new Promise(function (res) { var t0 = performance.now(); (function tick() { var ok = false; try { ok = !!pred(); } catch (e) {} if (ok) return res(true); if (performance.now() - t0 > ms) return res(false); setTimeout(tick, every || 80); })(); }); };
  T.store = { read: function () { try { return JSON.parse(localStorage.getItem(T.storage_key) || 'null'); } catch (e) { return null; } }, write: function (o) { try { localStorage.setItem(T.storage_key, JSON.stringify(o)); } catch (e) {} }, clear: function () { try { localStorage.removeItem(T.storage_key); } catch (e) {} } };

  // text morph inside a real message bubble (ELI5): old fades up, box height eases, new fades in
  T.morphText = function (host, newText) {
    var wrap = host.querySelector('.pmft-morph'); if (!wrap) return;
    var oldEl = wrap.querySelector('.is-new') || wrap.firstElementChild;
    var h0 = wrap.getBoundingClientRect().height;
    var n = document.createElement('span'); n.className = 'pmft-text is-new is-pending'; n.textContent = newText; wrap.appendChild(n);
    oldEl.classList.remove('is-new'); oldEl.classList.add('is-old');
    var h1 = n.getBoundingClientRect().height;
    wrap.style.height = h0 + 'px'; wrap.style.overflow = 'hidden'; wrap.style.transition = 'height ' + (U.reduced() ? 1 : 460) + 'ms cubic-bezier(.05,.7,.1,1)';
    void wrap.offsetHeight; wrap.style.height = h1 + 'px';
    setTimeout(function () { n.classList.remove('is-pending'); }, U.reduced() ? 5 : 140);
    setTimeout(function () { oldEl.remove(); wrap.style.height = ''; wrap.style.overflow = ''; wrap.style.transition = ''; }, U.reduced() ? 20 : 520);
  };
})();
