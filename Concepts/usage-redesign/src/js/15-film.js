/* Film core (owner: engine, creative direction 2026-10-02; WOW-SPEC.md sections 1, 3.1 and 10). PMU.film is the one
   vocabulary every moment on the page speaks: the five voices (Basic ink, Friendly hop, Glass depth, Retro type, NieR
   game UI), the diagonal plate wave, odometer rolls, NieR decode, the comet that rides a line's reveal edge, the head
   glow of a filling meter, marker drops, light sweeps, change flashes, ring swells, physical springs as WAAPI linear()
   easings, the room key light, the held-then-release entrance hook (cue / hold / release) and the first arrival on Usage
   (arrive). Rules (WOW-SPEC 8 and 9): continuous motion is transform and opacity only; every animation of a moment is
   created in one frame with delays, so the compositor runs it even while the main thread is busy; nothing loops; Reduce
   Motion jumps to the end; the Animation speed scales everything (WAAPI through the app's Element.animate wrapper, timers
   and tweens through PMU.motion.speed()). Elements this file adds are removed when their animation ends. */
(function () {
  var root = document.documentElement;
  var M = PMU.motion;
  var st = PMU.core.state;

  /* ---- 1.1 easings and 1.2 durations ---- */
  var E = {
    out: 'cubic-bezier(.22,.8,.28,1)', settle: 'cubic-bezier(.17,.84,.29,.99)', slide: 'cubic-bezier(.22,1,.36,1)', 'in': 'cubic-bezier(.4,0,1,1)',
    roll: 'cubic-bezier(.16,1,.3,1)', draw: 'cubic-bezier(.65,0,.35,1)', spring: 'cubic-bezier(.34,1.45,.64,1)', hop: 'cubic-bezier(.34,1.56,.64,1)',
    depth: 'cubic-bezier(.05,.7,.1,1)', close: 'cubic-bezier(.4,0,.2,1)', exit: 'cubic-bezier(.33,0,.67,1)',
    pop: 'linear(0,.028,.111 8%,.412 20%,.686 30%,.867 40%,.964 50%,1.012 62%,1.014 74%,1.003 88%,1)'
  };
  var T = { fade: 280, exit: 160, plate: 620, rail: 240, railStep: 16, title: 260, headStep: 24, row: 45, col: 25, cap: 640, inner: 160,
    roll: 700, rollStep: 28, rollChange: 420, rollChangeStep: 20, fill: 900, draw: 900, grow: 760, notch: 240, drop: 260, sweep: 650,
    flash: 620, ring: 700, key: 900, hover: 220, lift: 140, settle: 160, slide: 250 };
  function reduced() { return M.reduced(); }
  /* the no-GPU motion profile (PERF-3): html[data-pmu-soft], set by 90-api.js when Usage first shows on a software-
     rendered machine, forced on by ?pmu-soft=1 (a GPU film of what the VM plays) and off by ?pmu-soft=0 */
  function soft() { return root.hasAttribute('data-pmu-soft'); }
  function inView(card) { return !card || !PMU.board || !PMU.board.inView ? true : PMU.board.inView(card); }
  /* the cards that keep their inner entrance in a moment: on the no-GPU profile only the hero (WOW-SPEC-3 3.3: light
     and rolls belong to the hero; supporting plates arrive final); on any profile never a card outside the viewport */
  function innerOn(card) { return !!card && inView(card) && (!soft() || card.hasAttribute('data-hero')); }
  function fam() { return M.family(); }
  function anim(el, frames, o) {
    o = o || {};
    return M.animate(el, frames, { dur: o.dur == null ? 300 : o.dur, delay: o.delay || 0, easing: o.easing || E.out, fill: o.fill || 'backwards' });
  }
  /* cleanup is batched: a finished film layer stays (invisible: every film animation ends at opacity 0 or on its final
     frame with fill both) until the burst of finishes is over, then every finished layer goes and every finished odometer
     writes its plain text in one task. One mutation burst instead of one per element keeps the main thread (and the app's
     hover-tag observer and Layerize) out of the moment on the CPU-only VM. */
  var trash = [], flushT = 0;
  function flushTrash() {
    flushT = 0;
    var list = trash; trash = [];
    list.forEach(function (fn) { try { fn(); } catch (error) {} });
  }
  function later(fn) {
    trash.push(fn);
    clearTimeout(flushT);
    flushT = setTimeout(flushTrash, reduced() ? 0 : 180);
  }
  function gone(a, el) {
    if (!el) return;
    if (!a) { el.remove(); return; }
    a.finished.then(function () { later(function () { el.remove(); }); }, function () { el.remove(); });
  }
  function H(tag, cls, parent) { var el = document.createElement(tag); if (cls) el.className = cls; if (parent) parent.appendChild(el); return el; }
  /* a speed-scaled timer, skipped under Reduce Motion (the caller writes the end state itself) */
  function at(ms, fn) { if (reduced()) return 0; return setTimeout(fn, Math.max(0, ms) * M.speed()); }
  function sequence(steps) { (steps || []).forEach(function (s) { if (s.at <= 0) s.run(); else at(s.at, s.run); }); }
  function stagger(list, o) {
    o = o || {};
    var base = o.base || 0, step = o.step == null ? 22 : o.step, cap = o.cap == null ? 400 : o.cap;
    return Array.prototype.map.call(list, function (el, i) { return base + Math.min(cap, step * i); });
  }

  /* perf bisection switches for the VM harness (infra/wow): PMU.film.off.{plates,odo,comet,head,key,shell} = true */
  var off = {};

  /* ---- 1.3 voices ---- */
  var VOICES = {
    basic: { name: 'ink', from: 'translateY(32px)', dist: 32, dur: 620, ease: E.settle, fade: T.fade, fadeEase: E.out, row: 45, col: 25 },
    friendly: { name: 'hop', from: 'translateY(40px) rotate(-1.2deg) scale(.94)', dist: 40, dur: 680, ease: E.hop, fade: T.fade, fadeEase: E.out, row: 45, col: 25 },
    glass: { name: 'depth', from: 'translateY(24px) scale(1.03)', dist: 24, dur: 720, ease: E.depth, fade: T.fade, fadeEase: E.out, row: 45, col: 25 },
    retro: { name: 'type', from: 'translateY(16px)', dist: 16, dur: 320, ease: 'steps(4,jump-start)', fade: 200, fadeEase: 'steps(2,jump-start)', row: 60, col: 15 },
    nier: { name: 'game', from: null, dist: 0, dur: 300, ease: 'steps(5,jump-start)', fade: 120, fadeEase: 'steps(3,jump-start)', row: 45, col: 30 }
  };
  function voice(f) { return VOICES[f || fam()] || VOICES.basic; }

  /* ---- the diagonal wave (3.1 Phase B): delay = base + row x rowRank + col x colRank, capped; rowRank is the rank of the
     card's top grid row among the distinct top rows, colRank its rank by x inside that row ---- */
  function wave(cards, o) {
    o = o || {};
    var v = voice(), base = o.base || 0, row = o.row == null ? v.row : o.row, col = o.col == null ? v.col : o.col, cap = o.cap == null ? T.cap : o.cap;
    /* a room change (o.cam, 40-board.js streamBuild) takes its voice's cadence (MOTION-4 4.2): Basic 28 / 16 / 160 (the
       board moves as one camera with a ripple), Friendly 40 / 26 / 280 (a looser, lilting wave), Glass from the hero
       outward 24 / 14 / 140 (the hero comes into focus first), Retro 60 / 15 / 240, NieR 45 / 30 / 240 */
    var cv = o.cam ? camVoice() : null, heroIds = o.heroes || [];
    if (cv && cv.wave) { row = cv.wave[0]; col = cv.wave[1]; cap = cv.wave[2]; }
    var tops = [], groups = {};
    cards.forEach(function (c) { var y = +c.dataset.y || 0; if (tops.indexOf(y) < 0) tops.push(y); (groups[y] = groups[y] || []).push(c); });
    tops.sort(function (a, b) { return a - b; });
    Object.keys(groups).forEach(function (y) { groups[y].sort(function (a, b) { return (+a.dataset.x || 0) - (+b.dataset.x || 0); }); });
    var isHero = function (c) { return c.plan ? heroIds.indexOf(c.plan.id) >= 0 : !!(c.hasAttribute && c.hasAttribute('data-hero')); };
    var hc = cv && cv.heroFirst ? cards.filter(isHero)[0] : null;
    var hr = hc ? tops.indexOf(+hc.dataset.y || 0) : 0, hx = hc ? +hc.dataset.x || 0 : 0;
    cards.forEach(function (c) {
      var y = +c.dataset.y || 0, r = tops.indexOf(y), k = groups[y].indexOf(c);
      /* Glass: rank by distance from the hero (rows from its row, columns from its side) */
      if (hc) { r = Math.abs(r - hr); k = c === hc ? 0 : 1 + groups[y].filter(function (z) { return Math.abs((+z.dataset.x || 0) - hx) < Math.abs((+c.dataset.x || 0) - hx); }).length; if (r === 0 && c === hc) k = 0; }
      c._pmuEnterDelay = reduced() || M.paused() ? 0 : base + Math.min(cap, row * r + col * k);
    });
    return cards.slice().sort(function (a, b) { return a._pmuEnterDelay - b._pmuEnterDelay; });
  }

  /* ---- the plate entrance per voice (3.1 Phase B, 3.2): a fast early fade and a long travel, so a plate is fully
     opaque for most of its movement (film, not a fade) ---- */
  function enterPlates(cards, o) {
    if (reduced() || M.paused() || !cards || !cards.length || off.plates) return;
    o = o || {};
    var f = fam(), v = voice(f), dir = o.dir || 1, base = o.base || 0, sp = soft();
    var fill = 'backwards';   /* never hold a plate's transform after its entrance: drag and resize write inline transforms */
    cards.forEach(function (card) {
      /* a plate outside the scroll viewport gets no entrance (PERF-3 rule 2): it is final when scrolled to, and Chrome
         would run its animations on the main thread ("no visible change") for their whole life */
      if (!inView(card)) return;
      var d = base + (card._pmuEnterDelay || 0);
      if (f === 'nier') { bootPlate(card, d, sp && !card.hasAttribute('data-hero')); return; }
      /* the no-GPU profile (PERF-3): one opacity animation per plate, no travel (a moving plate damages the union of its
         old and new rects every frame, and the software compositor redraws the damage's bounding box); the hero keeps
         the Glass glint */
      if (sp) {
        /* o.from: a room change starts its frames part-way in (0.35), so the frame that swaps the rooms already shows the
           new structure (no empty board between the old room and the new one) */
        anim(card, [{ opacity: o.from || 0 }, { opacity: 1 }], { dur: v.fade + 60, delay: d, easing: v.fadeEase, fill: fill });
        if (f === 'glass' && card.hasAttribute('data-hero')) glint(card, d + 120);
        return;
      }
      anim(card, [{ opacity: 0 }, { opacity: 1 }], { dur: v.fade, delay: d, easing: v.fadeEase, fill: fill });
      var from = dir < 0 && v.dist ? v.from.replace(/translateY\((\d+)px\)/, function (m0, n) { return 'translateY(-' + n + 'px)'; }) : v.from;
      var a = [{ transform: from }, { transform: 'none' }];
      anim(card, a, { dur: v.dur, delay: d, easing: v.ease, fill: fill });
      if (f === 'glass') glint(card, d + v.dur * 0.35);
    });
    if (f === 'retro' && o.scan !== false) scanBar(o.board || (cards[0] && cards[0].parentNode), base);
  }
  /* the release of the first arrival: every built body seen fades in at its wave delay (created before the hold is lifted
     in the same task, fill backwards: no frame shows it early); NieR steps it */
  function revealBodies(cards) {
    if (reduced() || M.paused()) return;
    var f = fam(), stepped = f === 'retro' || f === 'nier';
    cards.forEach(function (card) {
      if (card.hasAttribute('data-late') || !inView(card)) return;
      var body = card.querySelector(':scope > .pmu-cardbody'); if (!body) return;
      anim(body, [{ opacity: 0 }, { opacity: 1 }], { dur: stepped ? 120 : 200, delay: card._pmuEnterDelay || 0, easing: stepped ? 'steps(3,jump-start)' : E.out });
    });
  }
  /* NieR: the frame first (opacity in three steps), then the content unfolds top-down in five steps with an ink scanline
     on the edge; clip-path in steps is five paints, not a continuous main-thread animation */
  function bootPlate(card, d, quiet) {
    anim(card, [{ opacity: 0 }, { opacity: 1 }], { dur: 120, delay: d, easing: 'steps(3,jump-start)' });
    /* the no-GPU profile boots supporting plates frame-first only (three opacity steps): the clip unfold is a main-thread
       animation and the title decode a JS tween */
    if (quiet) return;
    /* round 3: a body still held (data-body-wait) unfolds at its reveal (PMU.film.reveal), only the head here */
    var parts = card.querySelectorAll(card.hasAttribute('data-body-wait') ? ':scope > .pmu-cardhead' : ':scope > .pmu-cardhead, :scope > .pmu-cardbody');
    Array.prototype.forEach.call(parts, function (p) {
      anim(p, [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { dur: 300, delay: d + 120, easing: 'steps(5,jump-start)' });
    });
    var scan = H('i', 'pmu-film-scan', card);
    var a = anim(scan, [{ transform: 'translateY(0%)', opacity: 1 }, { transform: 'translateY(100%)', opacity: 1, offset: 0.98 }, { transform: 'translateY(100%)', opacity: 0 }],
      { dur: 300, delay: d + 120, easing: 'steps(5,jump-start)', fill: 'both' });
    gone(a, scan);
    var title = card.querySelector('.pmu-cardtitle');
    if (title && title.textContent) decode(title, title.textContent, { delay: d + 120 });
  }
  /* Glass: one specular glint crosses the plate as it lands (a single composited band; kept without a GPU) */
  function glint(card, d) {
    if (!lit(card)) return null;
    var wrap = H('i', 'pmu-film-glint', card), band = H('i', '', wrap);
    var a = anim(band, [{ transform: 'translateX(-120%) skewX(-20deg)', opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.7 }, { transform: 'translateX(320%) skewX(-20deg)', opacity: 0 }],
      { dur: 900, delay: d, easing: E.depth, fill: 'both' });
    gone(a, wrap);
    return a;
  }
  /* Retro: one phosphor scan bar sweeps down the board on an entrance (480 ms in twelve steps) */
  function scanBar(board, d) {
    if (!board || !board.isConnected) return;
    var bar = H('i', 'pmu-film-scanbar', board);
    var a = anim(bar, [{ transform: 'translateY(0%)', opacity: 1 }, { transform: 'translateY(100%)', opacity: 1, offset: 0.96 }, { transform: 'translateY(100%)', opacity: 0 }],
      { dur: 480, delay: d, easing: 'steps(12,jump-start)', fill: 'both' });
    gone(a, bar);
  }

  /* ---- odometer (3.1 Phase C, 3.6): digit columns roll on the compositor (one translateY per column); the final text
     is written back as plain text when the roll ends, so the page text after a moment equals an instant render ---- */
  var DIG = /[0-9]/;
  function strip(seq) { return seq.join('\n'); }
  function odometer(el, to, format, o) {
    o = o || {};
    if (!el) return { cancel: function () {} };
    if (off.odo) { el.textContent = format(to); return { cancel: function () {} }; }
    var fin = format(to);
    /* WOW-SPEC-3 9.1 / E3-10: a roll already running to this text keeps running; a reading whose shown text is already
       the target never rolls (no re-roll of an unchanged value by a patch) */
    if (el._pmuOdo && el._pmuOdo.fin === fin) return el._pmuOdo;
    if (el._pmuOdo) el._pmuOdo.cancel(true);
    var first = o.from == null || o.from === 0 && !o.change;
    var prev = first ? null : format(o.from);
    /* quiet (WOW-SPEC-3 3.3, Q3 heroRoll): during an entrance only the hero's numbers roll; a supporting value is written
       final (one text write, no columns), as is any roll asked for with {quiet: true} */
    var quietNow = o.quiet || first && quietEl(el);
    if (reduced() || quietNow || !DIG.test(fin) || (!first && (prev === fin || el.textContent === fin))) { el.textContent = fin; return { cancel: function () {} }; }
    var f = fam();
    /* NieR decodes; without a GPU the hero's decode is one text swap at its time (PERF-3 open item: the decode is a JS
       tween on every frame of the moment) */
    if (f === 'nier') return soft() ? swapText(el, fin, o.delay || 0) : decode(el, fin, { delay: o.delay || 0, from: prev });
    var cols = [], html = '<span class="pmu-odo-ghost">' + esc(fin) + '</span><span class="pmu-odo-layer" aria-hidden="true">';
    var sameShape = !first && prev.length === fin.length && prev.replace(/[0-9]/g, '0') === fin.replace(/[0-9]/g, '0');
    var up = first || !(to < o.from);
    if (!first && !sameShape) {
      /* the string changes shape (9.35M -> 61.4M): the old text slides up and out while the new slides in */
      html += '<span class="pmu-odo-c is-d"><span class="pmu-odo-g">' + esc(fin) + '</span><span class="pmu-odo-s is-swap">' + esc(up ? prev + '\n' + fin : fin + '\n' + prev) + '</span></span>';
      cols.push({ n: 2, up: up, r: 0 });
    } else {
      var digitsRight = 0;
      for (var i = fin.length - 1; i >= 0; i--) if (DIG.test(fin[i])) digitsRight++;
      var r = digitsRight;
      /* the integer digits left of the units digit start blank on a first roll and roll in (so "$184.62" grows from
         "$  0.00", never "$000.00"); a group separator among them rolls in with them */
      var intEnd = fin.search(/[.]/); if (intEnd < 0) intEnd = fin.length;
      var unitsAt = -1; for (var q = intEnd - 1; q >= 0; q--) if (DIG.test(fin[q])) { unitsAt = q; break; }
      var firstDigit = fin.search(DIG);
      for (var j = 0; j < fin.length; j++) {
        var ch = fin[j];
        var leading = first && j < unitsAt && j > firstDigit - 1 && j >= firstDigit;
        if (!DIG.test(ch)) {
          if (leading && ch === ',') { html += '<span class="pmu-odo-c is-d"><span class="pmu-odo-g">,</span><span class="pmu-odo-s">\u00a0\n,</span></span>'; cols.push({ n: 2, up: true, r: Math.max(0, r - 1) }); continue; }
          html += '<span class="pmu-odo-c">' + esc(ch) + '</span>'; continue;
        }
        r--;
        var d = +ch, seq = [];
        if (first) {
          /* only fractional digits spin (the rightmost two turns, the next one turn): the integer part rolls straight to
             its digit, so a reading never passes above its final whole value on the way (Atlas: values never overshoot) */
          var frac = intEnd < fin.length && j > intEnd;
          var spins = !frac ? 0 : o.spins != null ? (r === 0 ? o.spins : 0) : r === 0 ? 2 : r === 1 ? 1 : 0;
          /* a leading zero (the tens of "100") rolls in from blank straight to 0, never through 1-9 ("190%") */
          if (leading) { seq.push('\u00a0'); if (d === 0) seq.push(0); else for (var k0 = 1; k0 <= d; k0++) seq.push(k0); }
          else for (var k = 0; k <= spins * 10 + d; k++) seq.push(k % 10);
        } else {
          var a0 = +prev[j];
          if (a0 === d) { html += '<span class="pmu-odo-c">' + ch + '</span>'; continue; }
          if (up) { for (var u = a0; ; u = (u + 1) % 10) { seq.push(u); if (u === d) break; } }
          else { for (var w = d; ; w = (w + 1) % 10) { seq.push(w); if (w === a0) break; } }
        }
        if (seq.length < 2) { html += '<span class="pmu-odo-c">' + ch + '</span>'; continue; }
        html += '<span class="pmu-odo-c is-d"><span class="pmu-odo-g">' + ch + '</span><span class="pmu-odo-s">' + strip(seq) + '</span></span>';
        cols.push({ n: seq.length, up: first || up, r: r });
      }
    }
    html += '</span>';
    el.classList.add('pmu-odo');
    el.innerHTML = html;
    /* Friendly's hero ink runs left to right across the number (WOW-SPEC-3 4.4): each column takes the gradient at its own
       x over the number's width; tabular digits are 1ch, the other glyphs estimated (no layout read in a moment) */
    if (f === 'friendly' && el.classList.contains('pmu-heronum')) {
      var xs = 0, colsEl = el.querySelectorAll('.pmu-odo-layer > .pmu-odo-c');
      Array.prototype.forEach.call(colsEl, function (c) { c.style.setProperty('--col-x', xs.toFixed(2) + 'ch'); var ch = (c.querySelector('.pmu-odo-g') || c).textContent; xs += /[0-9]/.test(ch) ? 1 : /[.,:]/.test(ch) ? 0.42 : /%/.test(ch) ? 1.45 : /\s/.test(ch) ? 0.5 : 1.05; });
      el.style.setProperty('--num-w', xs.toFixed(2) + 'ch');
    }
    var strips = el.querySelectorAll('.pmu-odo-s');
    var dur = first ? (typeof o.dur === 'number' ? Math.min(o.dur, 900) : T.roll) : (typeof o.dur === 'number' ? o.dur : T.rollChange);
    var step = first ? T.rollStep : T.rollChangeStep, base = o.delay || 0, anims = [], end = 0, last = null;
    cols.forEach(function (c, i) {
      var s = strips[i]; if (!s) return;
      var span = 'translateY(' + (-(c.n - 1) / c.n * 100).toFixed(4) + '%)';
      var frames = c.up ? [{ transform: 'translateY(0%)' }, { transform: span }] : [{ transform: span }, { transform: 'translateY(0%)' }];
      var easing = f === 'retro' ? 'steps(' + (c.n - 1) + ',end)' : E.roll;
      var dl = base + step * c.r;
      var a = anim(s, frames, { dur: dur, delay: dl, easing: easing, fill: 'both' });
      if (a) { anims.push(a); if (dl + dur >= end) { end = dl + dur; last = a; } }
    });
    /* a first roll is not seen before it moves (integration 2, Mac films of the first arrival and a room change: a row of
       "$ 0.00", "0.0%", "0.00M" stood still for 100-200 ms before the rolls began, a zero that is not a reading): the
       digits fade in as their roll starts */
    if (first && cols.length) {
      var layer = el.querySelector('.pmu-odo-layer');
      var fa = layer ? anim(layer, [{ opacity: 0 }, { opacity: 1 }], { dur: f === 'retro' ? 1 : 140, delay: base, easing: E.out, fill: 'backwards' }) : null;
      if (fa) anims.push(fa);
    }
    var handle = { fin: fin, cancel: function (keep) { anims.forEach(function (a) { try { a.cancel(); } catch (e) {} }); done(); } };
    function done() { if (el._pmuOdo !== handle) return; el._pmuOdo = null; el.classList.remove('pmu-odo'); el.style.removeProperty('--num-w'); el.textContent = fin; }
    el._pmuOdo = handle;
    if (!last) { done(); return handle; }
    last.finished.then(function () { later(done); }, function () {});
    return handle;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function swapText(el, text, delay) {
    if (!delay || reduced()) { el.textContent = text; return { cancel: function () {} }; }
    el.classList.add('pmu-dec-wait');
    var id = setTimeout(function () { el.classList.remove('pmu-dec-wait'); el.textContent = text; }, delay * M.speed());
    return { cancel: function () { clearTimeout(id); el.classList.remove('pmu-dec-wait'); el.textContent = text; } };
  }
  /* ---- NieR decode (5): glyphs cycle every 30 ms and lock left to right, 35 ms per character, at most 420 ms; the final
     characters are exact (never zero-first) ---- */
  /* integ3: no digits among the cycling glyphs (a live 79% -> 80% decode showed "89%" for a frame: a reading that was never
     true); and a change decode (o.from) cycles only the characters that changed (WOW-SPEC-3 8.4 NieR) */
  var GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ#$/+';
  function decode(el, text, o) {
    o = o || {};
    if (!el) return { cancel: function () {} };
    if (el._pmuDecode) el._pmuDecode.cancel();
    if (reduced() || !text) { el.classList.remove('pmu-dec-wait'); el.textContent = text; return { cancel: function () {} }; }
    var n = text.length, per = Math.min(35, 420 / Math.max(1, n)), total = per * n + 60, lastBucket = -1;
    var same = o.from != null && String(o.from).length === n ? String(o.from) : null;
    function glyphs(ms, bucket) {
      var out = '';
      for (var i = 0; i < n; i++) {
        var ch = text[i];
        out += ms >= (i + 1) * per || /\s/.test(ch) || (same && same[i] === ch) ? ch : GLYPHS[(i * 7 + bucket * 13) % GLYPHS.length];
      }
      return out;
    }
    /* final fix M3 (Mac film of the NieR first arrival: "0%", "$0.00" and "$0.00 of $250.00 budget" held 50-100 ms before
       their glyphs cycled, the caller's start text shown during the delay): a first decode writes its bucket-0 glyphs at
       once, so the start text is never painted and the line keeps its final length, and it stays unseen until its first
       step, as a first odometer roll's digits appear only when the roll starts. A change decode (o.from) keeps the
       previous reading on screen until it starts. */
    var first = o.from == null, waiting = false;
    if (first) { el.textContent = glyphs(-1, 0); if (o.delay > 0) { el.classList.add('pmu-dec-wait'); waiting = true; } }
    function show() { if (waiting) { waiting = false; el.classList.remove('pmu-dec-wait'); } }
    var tw = M.tween({ from: 0, to: total, dur: total, delay: o.delay || 0, ease: 'linear',
      step: function (ms) {
        show();
        var bucket = Math.floor(ms / 30); if (bucket === lastBucket) return; lastBucket = bucket;
        el.textContent = glyphs(ms, bucket);
      },
      done: function () { show(); el.textContent = text; if (el._pmuDecode === handle) el._pmuDecode = null; } });
    var handle = { cancel: function () { tw.cancel(); show(); if (el._pmuDecode === handle) el._pmuDecode = null; } };
    el._pmuDecode = handle;
    return handle;
  }

  /* the fraction of a reveal's duration at which its edge (moving 0 -> 1 on `easing`) reaches `frac`: marks that sit on
     a line (end dots, NOW halos, markers) light up when the comet reaches them, not when the reveal ends */
  function edgeAt(frac, easing) {
    frac = Math.max(0, Math.min(1, frac));
    var f = M.curve(easing || E.draw), lo = 0, hi = 1;
    for (var i = 0; i < 26; i++) { var mid = (lo + hi) / 2; if (f(mid) < frac) lo = mid; else hi = mid; }
    return hi;
  }

  /* ---- the comet (3.1 Phase C, 3.3): a light riding the primary line at the reveal edge. The reveal window moves its
     edge from x 0 to x W on `easing`; with the same effect easing, keyframe offsets are in eased progress, so a keyframe
     at offset k/N placed at x = W k/N sits exactly on the edge. y comes from the line's own path (monotone cubic
     segments have x linear in t, so y(x) is exact). No layout read: W is the plot's width attribute. ---- */
  function parsePath(d) {
    var nums = String(d || '').match(/-?\d*\.?\d+(?:e-?\d+)?|[MLCHVZ]/gi) || [], segs = [], cur = null, cmd = '';
    for (var i = 0; i < nums.length;) {
      var tk = nums[i];
      if (/^[A-Za-z]$/.test(tk)) { cmd = tk.toUpperCase(); i++; continue; }
      if (cmd === 'M') { cur = [+nums[i], +nums[i + 1]]; i += 2; cmd = 'L'; continue; }
      if (cmd === 'L' && cur) { var p = [+nums[i], +nums[i + 1]]; segs.push({ t: 'L', a: cur, b: p }); cur = p; i += 2; continue; }
      if (cmd === 'C' && cur) {
        var c1 = [+nums[i], +nums[i + 1]], c2 = [+nums[i + 2], +nums[i + 3]], q = [+nums[i + 4], +nums[i + 5]];
        segs.push({ t: 'C', a: cur, c1: c1, c2: c2, b: q }); cur = q; i += 6; continue;
      }
      i++;
    }
    return segs;
  }
  function yAt(segs, x) {
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i], x0 = s.a[0], x1 = s.b[0];
      if (x < Math.min(x0, x1) - 0.01 || x > Math.max(x0, x1) + 0.01) continue;
      var t = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
      if (s.t === 'L') return s.a[1] + (s.b[1] - s.a[1]) * t;
      var u = 1 - t;
      return u * u * u * s.a[1] + 3 * u * u * t * s.c1[1] + 3 * u * t * t * s.c2[1] + t * t * t * s.b[1];
    }
    return null;
  }
  function comet(wrap, inner, o) {
    o = o || {};
    if (reduced() || !wrap || !inner || off.comet || !lit(wrap)) return null;
    var box = wrap.parentNode, svg = inner.querySelector('svg');
    var path = inner.querySelector('[data-comet="1"]') || inner.querySelector('[data-mark="line"][data-primary="1"]') || inner.querySelector('[data-mark="line"]');
    if (!box || !svg || !path) return null;
    var W = +svg.getAttribute('width') || 0, Hh = +svg.getAttribute('height') || 0;
    if (W < 120 || Hh < 60) return null;   /* no comet on sparklines and compact plots */
    var segs = parsePath(path.getAttribute('d'));
    if (!segs.length) return null;
    var x0 = segs[0].a[0], x1 = segs[segs.length - 1].b[0], span = Math.max(1, x1 - x0);
    var f = fam(), N = 32, frames = [];
    for (var k = 0; k <= N; k++) {
      var x = W * k / N, y = yAt(segs, Math.max(x0, Math.min(x1, x)));
      var inside = x >= x0 - 1 && x <= x1 + 1, p = (x - x0) / span;
      var op = !inside || y == null ? 0 : p < 0.08 ? 0.9 * Math.max(0, p / 0.08) : p > 0.82 ? 0.9 * Math.max(0, (1 - p) / 0.18) : 0.9;
      frames.push({ offset: k / N, transform: 'translate(' + x.toFixed(1) + 'px,' + (y == null ? 0 : y).toFixed(1) + 'px)', opacity: +op.toFixed(3) });
    }
    var el = H('i', 'pmu-film-comet', null);
    ['data-series-index', 'data-tk', 'data-vendor', 'data-tone'].forEach(function (a) { var v = path.getAttribute(a); if (v != null) el.setAttribute(a, v); });
    el.setAttribute('data-voice', voice(f).name);
    box.appendChild(el);
    var a = anim(el, frames, { dur: o.dur || T.draw, delay: o.delay || 0, easing: o.easing || E.draw, fill: 'both' });
    gone(a, el);
    /* the light front: a soft vertical edge of light on the reveal edge (areas and heroes only) */
    if (!o.noFront && Hh >= 120 && f !== 'nier') {
      var front = H('i', 'pmu-film-front', null);
      ['data-series-index', 'data-tk', 'data-vendor'].forEach(function (a2) { var v2 = path.getAttribute(a2); if (v2 != null) front.setAttribute(a2, v2); });
      box.appendChild(front);
      var fa = anim(front, [{ transform: 'translateX(' + x0.toFixed(1) + 'px)', opacity: 0 }, { opacity: 0.55, offset: 0.12 }, { opacity: 0.55, offset: 0.8 },
        { transform: 'translateX(' + W.toFixed(1) + 'px)', opacity: 0 }], { dur: o.dur || T.draw, delay: o.delay || 0, easing: o.easing || E.draw, fill: 'both' });
      gone(fa, front);
    }
    return a;
  }

  /* ---- the head glow (3.1 Phase C, 3.8): a soft light in the tone colour riding a meter's fill head. A transparent
     track-wide layer slides exactly like the fill (same % keyframes, same easing) and paints the light at its right
     edge, outside the fill's clip ---- */
  function headGlow(track, o) {
    o = o || {};
    if (reduced() || !track || off.head || !lit(track)) return null;
    var g = H('i', 'pmu-film-head', track);
    g.setAttribute('data-voice', voice().name);
    var from = o.from == null ? 0 : o.from, to = o.to == null ? 100 : o.to;
    var a = anim(g, [{ transform: 'translateX(' + (from - 100) + '%)', opacity: 0 }, { opacity: 0.85, offset: 0.15 }, { opacity: 0.85, offset: 0.72 },
      { transform: 'translateX(' + (to - 100) + '%)', opacity: 0 }], { dur: o.dur || T.fill, delay: o.delay || 0, easing: o.easing || E.roll, fill: 'both' });
    gone(a, g);
    return a;
  }

  /* ---- a marker drops onto its place (3.1 Phase D: the TODAY marker); SVG children animate on the main thread, so
     keep these short ---- */
  function drop(el, o) {
    o = o || {};
    if (reduced() || !el) return null;
    var f = fam();
    return anim(el, [{ transform: 'translateY(' + (-(o.from || 40)) + 'px)', opacity: 0 }, { opacity: 1, offset: 0.35 }, { transform: 'translateY(0px)', opacity: 1 }],
      { dur: o.dur || T.drop, delay: o.delay || 0, easing: f === 'retro' || f === 'nier' ? 'steps(4,jump-start)' : f === 'friendly' ? E.hop : E.settle });
  }

  /* ---- one light band across an element (3.1 Phase D KPI sweep, 3.6) ---- */
  function sweep(el, o) {
    o = o || {};
    if (reduced() || !el || !lit(el)) return null;
    var wrap = H('i', 'pmu-film-sweep', el), band = H('i', '', wrap);
    wrap.setAttribute('data-voice', voice().name);
    var f = fam();
    var a = anim(band, [{ transform: 'translateX(-110%) skewX(-16deg)', opacity: 0 }, { opacity: 1, offset: 0.18 }, { opacity: 1, offset: 0.7 }, { transform: 'translateX(330%) skewX(-16deg)', opacity: 0 }],
      { dur: o.dur || T.sweep, delay: o.delay || 0, easing: f === 'retro' || f === 'nier' ? 'steps(8,jump-start)' : E.out, fill: 'both' });
    gone(a, wrap);
    return a;
  }
  /* ---- the change flash (3.6): a pre-painted glow layer (opacity only) and the 2 px underline ---- */
  function flash(el, o) {
    o = o || {};
    if (reduced() || !el || !lit(el)) return null;
    var g = H('i', 'pmu-film-flash', el);
    if (o.tone) g.setAttribute('data-tone', o.tone);
    var nier = fam() === 'nier';
    var a = anim(g, [{ opacity: 0 }, { opacity: nier ? 1 : 0.55, offset: nier ? 0.01 : 0.22 }, { opacity: nier ? 1 : 0.55, offset: nier ? 0.3 : 0.3 }, { opacity: 0 }],
      { dur: nier ? 180 : o.dur || T.flash, delay: o.delay || 0, easing: nier ? 'steps(2,jump-start)' : E.out, fill: 'both' });
    gone(a, g);
    if (!o.noSweep) sweep(el, { delay: (o.delay || 0) + 120 });
    return a;
  }
  /* ---- the exhausted ring swell (3.6): a pre-rendered ring layer, opacity and scale ---- */
  function ring(el, o) {
    o = o || {};
    if (reduced() || !el) return null;
    var r = H('i', 'pmu-film-ring', el);
    if (o.tone) r.setAttribute('data-tone', o.tone);
    var a = anim(r, [{ transform: 'scale(.92)', opacity: 0 }, { transform: 'scale(1)', opacity: 0.85, offset: 0.25 }, { transform: 'scale(1.06)', opacity: 0 }],
      { dur: T.ring, delay: o.delay || 0, easing: 'cubic-bezier(.2,.6,.3,1)', fill: 'both' });
    gone(a, r);
    return a;
  }
  /* ---- the halo pulse (3.9 "Use this account": the new mark's halo): one pre-rendered circle centred on the element,
     scale .8 -> 1.4 while it fades .5 -> 0 (600 OUT); Retro and NieR step it. The element must be positioned. ---- */
  function halo(el, o) {
    o = o || {};
    if (reduced() || !el) return null;
    var h = H('i', 'pmu-film-halo', el), f = fam(), stepped = f === 'retro' || f === 'nier';
    h.setAttribute('aria-hidden', 'true');
    if (o.tone) h.setAttribute('data-tone', o.tone);
    var a = anim(h, [{ transform: 'translate(-50%,-50%) scale(.8)', opacity: 0.55 }, { transform: 'translate(-50%,-50%) scale(1.4)', opacity: 0 }],
      { dur: o.dur || 600, delay: o.delay || 0, easing: stepped ? 'steps(4,jump-start)' : E.out, fill: 'both' });
    gone(a, h);
    return a;
  }

  /* ---- a physical spring as a WAAPI linear() easing (3.11 drop, 3.13 gravity, Friendly) ---- */
  var springCache = {};
  function spring(o) {
    o = o || {};
    /* until: the settle threshold (|x - 1| and |v| / 20 under it). 0.001 by default; a move across the board ends where the
       eye sees it end with about 0.005 (NOTES2-engine 3: the 520 / 38 drop then lasts about 290 ms instead of 400) */
    var k = o.k || 520, c = o.c || 38, m = o.m || 1, v0 = o.v0 || 0, until = o.until || 0.001, key = [k, c, m, v0, until].join(',');
    if (springCache[key]) return springCache[key];
    var x = 0, v = v0, dt = 1 / 600, t = 0, pts = [], settleAt = 0;
    while (t < 3) {
      var a = (-k * (x - 1) - c * v) / m; v += a * dt; x += v * dt; t += dt;
      pts.push([t, x]);
      if (Math.abs(x - 1) < until && Math.abs(v) < until * 20) { settleAt = t; break; }
    }
    var total = settleAt || t, n = 40, out = [];
    for (var i = 0; i <= n; i++) {
      var tt = total * i / n, j = Math.min(pts.length - 1, Math.round(tt / dt));
      out.push(i === n ? '1' : (i === 0 ? '0' : pts[j][1].toFixed(4)));
    }
    var res = { easing: 'linear(' + out.join(',') + ')', duration: Math.round(total * 1000) };
    springCache[key] = res;
    return res;
  }

  /* ---- the room key light (2.1, 3.1, 3.2): one static radial light under the board; it blooms on arrival ---- */
  function key(o) {
    o = o || {};
    var stage = document.getElementById('pmuStage');
    if (!stage) return null;
    var el = stage.querySelector(':scope > .pmu-film-key');
    if (!el) { el = document.createElement('i'); el.className = 'pmu-film-key'; el.setAttribute('aria-hidden', 'true'); stage.insertBefore(el, stage.firstChild); }
    el.setAttribute('data-room', o.room || st.room);
    if (o.bloom && !reduced() && !off.key) anim(el, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { dur: T.key, delay: o.delay || 0, easing: E.out });
    return el;
  }

  /* ======== WOW round 3 (WOW-SPEC-3): one camera, one light, one pulse ======== */
  /* MOTION-4 RC9: the hero reveals at 160 (its number at 200) and the supporting bodies from 300, 20 apart, cap 240, so no
     plate stands empty for more than about 200 ms (Friendly Light showed white empty plates for 250 ms) */
  var T3 = { frameFade: 200, frameTravel: 420, frameRow: 28, frameCol: 16, frameCap: 220, rule: 300, ghostFade: 140, ghostTravel: 220,
    takeoff: 110, flight: 460, flightStep: 24, flightCap: 120, land: 420, heroAt: 160, quietGap: 140, quietStep: 20, quietCap: 240,
    quietFade: 200, quietTravel: 280, quietDraw: 600, quietFill: 520, beatGap: 6000, liveRoll: 420, liveFlash: 620, liveSweep: 650,
    rerank: 420, slideOut: 220, heroInstr: 900, heroNum: 40, beatLead: 160 };
  function flag(name) { return !PMU.flags || PMU.flags[name] !== false; }

  /* ======== MOTION-4 (lane b-motion, Jared's items 7 and 8): one camera you can see, and five voices that differ in kind ========
     The room change is ONE camera move: the old room (the ghost, one layer) and the new frames travel the same pan P along
     the rail with matched velocities. The ghost moves from the click and fades only when the new chrome is in (frames(),
     the chrome task), so no frame shows an empty board between the rooms. P by the distance travelled on the rail: a
     neighbour 40 px, two or three rooms 56, four or more 72 (tokens --pmu-cam-p1/p2/p3 in 00-base.css; no GPU 24, one
     board-level move). The voices differ in kind, as Retro and NieR always did (the chat's ACD-475 voices):
     Basic is ink: a crisp pan, and an ink stroke draws under each first-row head and dries.
     Friendly is hop: the old room steps back and tilts away; the new plates hop up from their feet with one soft bounce
       and a small alternating tilt (a lilting wave); warm light blooms under the hero; flyers hop along an arc and land
       with a squash (marks, numbers) or a puff of three dots (meters, controls never scale).
     Glass is depth: a dolly through glass. Down the rail the camera pushes in (the old room passes the lens: it grows and
       blurs), up the rail it pulls out; the focus racks from the old room (defocused as it passes the lens) to the new
       room, which arrives sharp out of depth with the hero first (an arriving plate never draws through a blur); one
       refraction band crosses the board; flyers rise toward the lens.
     Values never overshoot in any voice (numbers, meters, bar and ring fills land exactly on their value): springs, the
     hop and the squash move plates, marks, dots and paths only. Every blur ends at exactly 0 (fill backwards: no filter
     after the end) or dies with its layer; finishMoment ends every one at once. */
  var CAM = { dir: 1, dist: 1 };
  function camera(o) { o = o || {}; CAM = { dir: o.dir < 0 ? -1 : 1, dist: Math.max(1, Math.round(Math.abs(o.dist || 1))) }; return CAM; }
  function camP(dist) { if (soft()) return 24; var d = dist || CAM.dist; return d >= 4 ? 72 : d >= 2 ? 56 : 40; }
  /* the voices of the room change (MOTION-4 4.2). ghost: y in P units (x dir), sc / push / pull scale, rot deg (x dir);
     frame: y in P units, travel ms + curve (Friendly: a spring), fade ms; wave: row / col / cap ms */
  var CAMV = {
    basic: { ghost: { y: -1, sc: 0.985, ms: 360, ease: E.slide }, fade: 180,
      frame: { y: 1, ms: 520, ease: E.settle, fade: 200 }, wave: [28, 16, 160], body: { y: 6, fade: 200, ms: 280, ease: E.settle } },
    friendly: { ghost: { y: -0.8, sc: 0.95, rot: -2.2, ms: 400, ease: 'cubic-bezier(.3,0,.5,1)' }, fade: 200,
      frame: { y: 0.9, sc: 0.94, tilt: 14, spring: [260, 21], fade: 220 }, wave: [40, 26, 280], body: { y: 10, fade: 220, ms: 320, ease: E.settle } },
    glass: { ghost: { y: -0.35, push: 1.06, pull: 0.94, blur: 6, ms: 400, ease: E.slide }, fade: 240,
      frame: { y: 0.35, push: 0.93, pull: 1.07, ms: 560, ease: E.depth, fade: 260 }, wave: [24, 14, 140], heroFirst: true,
      body: { sc: 0.985, fade: 240, ms: 320, ease: E.depth } },
    retro: { wave: [60, 15, 240] },
    nier: { wave: [45, 30, 240] }
  };
  function camVoice(f) { return CAMV[f || fam()] || CAMV.basic; }
  /* a physical spring as a position function (Friendly's hop: k 260, c 21 settles in about 640 ms after one overshoot of
     about 7 %, the plate's feet land and bounce once) */
  var springFnCache = {};
  function springFn(k, c) {
    var key = k + ',' + c; if (springFnCache[key]) return springFnCache[key];
    var x = 0, v = 0, dt = 1 / 600, t = 0, pts = [0], peak = 0;
    while (t < 2) { var a = -k * (x - 1) - c * v; v += a * dt; x += v * dt; t += dt; pts.push(x); if (x > peak) peak = x; if (t > 0.2 && Math.abs(x - 1) < 0.002 && Math.abs(v) < 0.04) break; }
    var n = pts.length - 1;
    var res = { ms: Math.round(t * 1000), peak: peak, fn: function (p) { if (p >= 1) return 1; if (p <= 0) return 0; var q = p * n, i = Math.floor(q); return pts[i] + (pts[i + 1] - pts[i]) * (q - i); } };
    springFnCache[key] = res;
    return res;
  }
  /* sampled keyframes for ONE animation per element (PERF-3 rule 10): opacity on its own curve and length, the transform
     from `tr` to rest (tr.out: from rest to `tr`) on its own, an optional blur on a third; samples cluster early */
  function camKeys(total, parts, n) {
    n = n || 18;
    var out = [], op = parts.op, tr = parts.tr, bl = parts.blur;
    for (var i = 0; i <= n; i++) {
      var off = i === n ? 1 : Math.pow(i / n, 1.35), ms = total * off, key = { offset: +off.toFixed(4) };
      if (op) { var po = op.fn(Math.min(1, ms / Math.max(1, op.ms))); key.opacity = +(op.from + (op.to - op.from) * po).toFixed(3); }
      if (tr) {
        var pt = tr.fn(Math.min(1, ms / Math.max(1, tr.ms))), k = tr.out ? pt : 1 - pt, tf = [];
        if (tr.base) tf.push(tr.base);
        if (tr.y) tf.push('translateY(' + (tr.y * k).toFixed(2) + 'px)');
        if (tr.rot) tf.push('rotate(' + (tr.rot * k).toFixed(3) + 'deg)');
        if (tr.sc != null && tr.sc !== 1) tf.push('scale(' + (1 + (tr.sc - 1) * k).toFixed(4) + ')');
        key.transform = tf.length ? tf.join(' ') : 'none';
        if (tr.origin) key.transformOrigin = tr.origin;
      }
      if (bl) { var pb = bl.fn(Math.min(1, ms / Math.max(1, bl.ms))), kb = bl.out ? pb : 1 - pb; key.filter = 'blur(' + Math.max(0, bl.px * kb).toFixed(2) + 'px)'; }
      out.push(key);
    }
    /* an entrance ends exactly at rest: no blur, no transform left (a blur that does not end at 0 is item 5's soft text) */
    var lastK = out[out.length - 1];
    if (bl && !bl.out) lastK.filter = 'blur(0px)';
    if (tr && !tr.out && !tr.base) lastK.transform = 'none';
    return out;
  }
  /* the visible centre of the board in board pixels (no layout read): the dolly and the step-back pivot there */
  function viewCentre() {
    var cls = PMU.board && PMU.board.cls ? PMU.board.cls() : null, W = cls && cls.W ? cls.W : 1200;
    return { x: W / 2, y: Math.max(200, (window.innerHeight || 900) - 170) / 2 };
  }
  /* a card's grid box in board pixels (no layout read) */
  function cardBox(card) {
    var ds = card.dataset, r = { x: +ds.x || 0, y: +ds.y || 0, w: +ds.w || 4, h: +ds.h || 4 };
    var p = PMU.board && PMU.board.px ? PMU.board.px(r) : null;
    return p || { l: 0, t: 0, w: 300, h: 200 };
  }
  /* the ghost's fade starts when the new chrome is in (frames(), or the fallback timer) and its removal waits for it. A ghost
     that is gone (its element emptied into the spare board, which the next room change makes the live board) is never
     touched again */
  function fadeGhost(m) {
    var G = m && m.ghost; if (!G || G.fade || G.gone) return;
    G.fade = true;
    var a = G.el.isConnected ? anim(G.el, [{ opacity: 1 }, { opacity: 0 }], { dur: G.fadeMs, easing: E.exit, fill: 'forwards' }) : null;
    G.fade = a || true;
    if (a) a.finished.then(function () { later(G.done); }, G.done); else G.done();
  }
  /* the hold of the beat's targets (MOTION-4 RC4): a card revealed inside a moment keeps what its signature beat will
     reveal from invisible (05-film.css [data-beat-hold]) unseen until the beat creates its animations in the same task;
     finish, end, Reduce Motion and a beat that throws all release it */
  function releaseBeatHold() {
    var board = document.getElementById('pmuBoard'); if (!board) return;
    Array.prototype.forEach.call(board.querySelectorAll(':scope > .pmu-card[data-beat-hold]'), function (c) { c.removeAttribute('data-beat-hold'); });
  }
  /* Glass: one refraction band crosses the board in the camera's direction (a wide diagonal specular sheet, one element) */
  function refract(dir, delay) {
    if (reduced() || off.key) return null;
    var stage = document.getElementById('pmuStage'); if (!stage) return null;
    var old = stage.querySelector(':scope > .pmu-film-refract'); if (old) old.remove();
    var wrap = H('i', 'pmu-film-refract', stage), band = H('i', '', wrap);
    wrap.setAttribute('aria-hidden', 'true');
    var from = dir < 0 ? 'translateX(260%) rotate(9deg)' : 'translateX(-120%) rotate(9deg)', to = dir < 0 ? 'translateX(-120%) rotate(9deg)' : 'translateX(260%) rotate(9deg)';
    var a = anim(band, [{ transform: from, opacity: 0 }, { opacity: 1, offset: 0.18 }, { opacity: 1, offset: 0.72 }, { transform: to, opacity: 0 }],
      { dur: 760, delay: delay == null ? 120 : delay, easing: E.depth, fill: 'both' });
    gone(a, wrap);
    return a;
  }
  /* Basic: an ink stroke draws under a first-row head (scaleX from the left, 300 OUT) and dries (fades) by 860 */
  function inkStroke(card, d) {
    var head = card.querySelector(':scope > .pmu-cardhead'); if (!head) return null;
    var s = H('i', 'pmu-film-ink', head);
    s.setAttribute('aria-hidden', 'true');
    var a = anim(s, [{ transform: 'scaleX(0)', opacity: 1, easing: E.out }, { transform: 'scaleX(1)', opacity: 1, offset: 0.36, easing: 'cubic-bezier(.4,0,.6,1)' }, { transform: 'scaleX(1)', opacity: 0 }],
      { dur: 860, delay: d, easing: 'linear', fill: 'both' });
    gone(a, s);
    return a;
  }
  /* the hero light floor (MOTION-4 RC3): a hero whose instruments made no light (Plans: bars and markers only) still
     carries light in every voice. Basic and Glass: one light front crosses the hero body (800 DRAW); Friendly: a warm
     bloom under the hero (opacity 0 -> 1 -> .7 -> 0, 1300 OUT); Retro and NieR have their scan bar and boot scanline. */
  var LIGHTS = '.pmu-film-comet, .pmu-film-front, .pmu-film-head, .pmu-film-sweep, .pmu-film-glint, .pmu-film-floor, .pmu-film-warm, .pmu-odo';
  function heroFloor(card, d) {
    var f = fam(); if (f === 'retro' || f === 'nier' || !lit(card)) return null;
    if (card.querySelector(LIGHTS)) return null;
    var a;
    if (f === 'friendly') {
      /* appended (never before the head: no child of the plate changes its position); z-index -1 puts it under the content */
      var w = H('i', 'pmu-film-warm', card); w.setAttribute('aria-hidden', 'true');
      a = anim(w, [{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'scale(1)', offset: 0.3 }, { opacity: 0.7, transform: 'scale(1.03)', offset: 0.62 }, { opacity: 0, transform: 'scale(1.06)' }], { dur: 1300, delay: d, easing: E.out, fill: 'both' });
      gone(a, w);
      return a;
    }
    var wrap = H('i', 'pmu-film-floor', card), band = H('i', '', wrap);
    wrap.setAttribute('aria-hidden', 'true');
    a = anim(band, [{ transform: 'translateX(-100%)', opacity: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 1, offset: 0.82 }, { transform: 'translateX(0%)', opacity: 0 }], { dur: 800, delay: d, easing: E.draw, fill: 'both' });
    gone(a, wrap);
    return a;
  }
  /* ---- the moment: an arrival or a room change. It records every animation made through PMU.motion (rapid switching
     finishes it at once), holds the light budget and the reveal timeline, and ends when its signature beat is over ---- */
  var moment = null, inBeat = 0, momentListeners = [];
  function emitMoment(what, m) { momentListeners.slice().forEach(function (fn) { try { fn(what, m); } catch (error) { console.error('[pm-usage] moment', error); } }); }
  function begin(kind, room) {
    finishMoment('next');
    var now = performance.now();
    var m = { kind: kind, room: room, start: now, t0: now, released: kind !== 'arrive', entrance: true, anims: [], queue: [], rank: 0,
      heroAt: kind === 'arrive' ? 0 : T3.heroAt, timers: [], built: false, beatDone: false, flights: null };
    m.quietAt = m.heroAt + T3.quietGap;
    moment = m;
    M.track(m.anims);
    /* the app's PM8 pointer field rests while a moment runs (usage layer patch A3) */
    root.setAttribute('data-pmu-moment', kind);
    try { performance.mark('pmu-moment-' + kind); } catch (error) {}
    emitMoment('begin', m);
    return m;
  }
  function since(m) { return (performance.now() - m.t0) / M.speed(); }
  function mtimer(m, ms, fn) { var id = setTimeout(fn, Math.max(0, ms) * M.speed()); m.timers.push(id); return id; }
  function endMoment(m) {
    if (moment !== m) return;
    moment = null; M.track(null);
    /* a timer of this moment never acts in the next one (a hold release fired into the next room's entrance) */
    m.timers.forEach(clearTimeout); m.timers = [];
    root.removeAttribute('data-pmu-moment');
    var board = document.getElementById('pmuBoard');
    if (board) later(function () { if (!moment) board.removeAttribute('data-film'); });
    releaseBeatHold();
    emitMoment('end', m);
  }
  /* rapid switching (6.2): the running moment ends at once in its final state (Animation.finish on everything it made;
     flyers land; waiting bodies show as built) and the next moment starts from there. Nothing stacks. */
  function finishMoment(why) {
    var m = moment; if (!m) return;
    moment = null; M.track(null);
    root.removeAttribute('data-pmu-moment');
    m.timers.forEach(clearTimeout);
    if (m.flights && m.flights.finish) { try { m.flights.finish(); } catch (error) {} }
    m.anims.forEach(function (a) { try { if (a.finish && a.playState !== 'finished' && a.playState !== 'idle') a.finish(); } catch (error) {} });
    /* the old room's ghost: a fade not started yet (the new chrome never came) ends now too, so no still, blurred old room
       stays over the next one */
    /* only a fade that is still playing is finished: a ghost that is gone had its fade cancelled, and finish() on that
       cancelled fade re-applied opacity 0 to its element, which 40-board.js had just made the new live board (a click 0.9-
       2.3 s after the previous one left the whole new room invisible until the next room change) */
    if (m.ghost && !m.ghost.gone) { try { fadeGhost(m); var fa = m.ghost.fade; if (fa && fa.finish && (fa.playState === 'running' || fa.playState === 'paused')) fa.finish(); } catch (error) {} }
    releaseBeatHold();
    var board = document.getElementById('pmuBoard');
    if (board) Array.prototype.forEach.call(board.querySelectorAll(':scope > .pmu-card[data-body-wait]'), function (c) { if (c.querySelector(':scope > .pmu-cardbody > *')) c.removeAttribute('data-body-wait'); });
    m.queue = [];
    if (hold) { hold = null; }
    emitMoment('finish', m);
  }
  /* the light budget (3.3): while an entrance runs, light layers (comet, light front, head glow, sweep, glint, flash) are
     made only inside the hero plate and inside what the room's signature beat touches (the beat runs with the budget
     open); outside entrances (live beats, range, hover, gestures) the light goes to what changed. Flag heroRoll (Q3). */
  function lit(el) {
    if (!moment || !moment.entrance || inBeat || !flag('heroRoll')) return true;
    var c = el && el.closest ? el.closest('.pmu-card') : null;
    return !c || c.hasAttribute('data-hero') || !!c._pmuBudget;
  }
  /* a supporting reading during an entrance: written final, drawn quietly (charts C3-3 ask PMU.film.isQuiet(el)) */
  function quietEl(el) { return !!moment && moment.entrance && !inBeat && flag('heroRoll') && !lit(el); }
  function lightBudget(room) {
    var board = document.getElementById('pmuBoard'); if (!board) return [];
    return Array.prototype.filter.call(board.querySelectorAll(':scope > .pmu-card'), function (c) { return c.hasAttribute('data-hero') || !!c._pmuBudget; });
  }

  /* ---- sampled keyframes: opacity and transform with their own durations and easings in ONE animation per element
     (PERF-3 rule 10: a frame is one animation, not two). Samples cluster early, where the curves move fastest. ---- */
  function combo(total, op, tr, from, n) {
    n = n || 12;
    var fo = M.curve(op.ease), ft = M.curve(tr.ease), out = [], o0 = op.from || 0, o1 = op.to == null ? 1 : op.to;
    for (var i = 0; i <= n; i++) {
      var off = i === n ? 1 : Math.pow(i / n, 1.5), t = total * off;
      var eo = fo(Math.min(1, t / Math.max(1, op.ms))), et = ft(Math.min(1, t / Math.max(1, tr.ms))), k = 1 - et, tf = [];
      if (from.base) tf.push(from.base);
      if (from.x) tf.push('translateX(' + (from.x * k).toFixed(2) + 'px)');
      if (from.y) tf.push('translateY(' + (from.y * k).toFixed(2) + 'px)');
      if (from.rot) tf.push('rotate(' + (from.rot * k).toFixed(3) + 'deg)');
      if (from.sc) tf.push('scale(' + (1 + (from.sc - 1) * k).toFixed(4) + ')');
      var key = { offset: +off.toFixed(4), opacity: +(o0 + (o1 - o0) * eo).toFixed(3), transform: tf.length ? tf.join(' ') : 'none' };
      if (from.blur) key.filter = 'blur(' + (from.blur * k).toFixed(2) + 'px)';
      out.push(key);
    }
    return out;
  }

  /* ---- film.frames (5 Phase A, 6.2): the structure wave. Each frame (a card's chrome) fades in and travels as ONE
     animation: Basic 200 OUT fade + 14 px rise 420 SETTLE (a room change 16 px x dir), Friendly 18 px + rotate(-1deg)
     520 HOP, Glass scale(1.02) 520 DEPTH (no blur on an arriving plate), Retro STEP(4) 240 with rows 60 apart, NieR boots the
     frame first. Without a GPU: the fade only (o.from lets a room change start part-way). Cards outside the viewport get
     no entrance. o.wave === false keeps the cards' own _pmuEnterDelay. ---- */
  function frames(cards, o) {
    var m = moment;
    /* the new chrome is in: the old room starts to fade now (MOTION-4 RC2: never earlier, so no empty board) */
    if (m && m.ghost && !m.ghost.fade) fadeGhost(m);
    if (reduced() || M.paused() || !cards || !cards.length || off.plates) return;
    o = o || {};
    var f = fam(), dir = o.dir || 0, sgn = dir < 0 ? -1 : 1, base = o.base || 0, sp = soft(), V = camVoice(f);
    if (o.wave !== false) wave(cards, { base: 0, row: f === 'retro' ? 60 : T3.frameRow, col: T3.frameCol, cap: o.cap || T3.frameCap });
    var cam = !sp && (f === 'basic' || f === 'friendly' || f === 'glass');
    /* a room change pans by P (rail distance); the first arrival rises from below by a shorter 28 px in the same voice */
    var P = dir ? camP() : 28, push = dir >= 0, centre = cam && f === 'glass' ? viewCentre() : null;
    /* column rank inside each grid row (Friendly's alternating tilt) and the first row (Basic's ink strokes) */
    var rowOf = {}, top = Infinity;
    cards.forEach(function (c) { var y = +c.dataset.y || 0; top = Math.min(top, y); (rowOf[y] = rowOf[y] || []).push(c); });
    Object.keys(rowOf).forEach(function (y) { rowOf[y].sort(function (a, b) { return (+a.dataset.x || 0) - (+b.dataset.x || 0); }).forEach(function (c, i) { c._pmuCol = i; }); });
    /* the no-GPU profile on a room change: ONE board-level move (the new board rises P = 24 in the camera's direction from
       90 % opacity, 280 OUT) instead of a fade per frame: the camera still moves, and no frame shows the board under 90 % */
    var boardMove = sp && dir && f !== 'nier' && o.board && o.board.isConnected;
    if (boardMove) anim(o.board, [{ opacity: 0.9, transform: 'translateY(' + (24 * sgn) + 'px)' }, { opacity: 1, transform: 'none' }], { dur: 280, delay: 0, easing: E.out });
    var heroMade = false;
    /* the beat holds its targets at most until 3.2 s (a moment whose beat never comes still shows everything) */
    if (m && !m.holdT && !reduced()) m.holdT = mtimer(m, 3200, function () { if (moment === m) releaseBeatHold(); });
    cards.forEach(function (card) {
      if (!inView(card)) return;
      var d = base + (card._pmuEnterDelay || 0), hero = card.hasAttribute('data-hero');
      card._pmuFrameAt = d;
      if (m && !reduced()) card.setAttribute('data-beat-hold', '');
      var travel = sp ? (boardMove ? 280 : T3.frameFade + 60) : f === 'friendly' ? springFn(V.frame.spring[0], V.frame.spring[1]).ms : f === 'glass' ? V.frame.ms : f === 'retro' ? 240 : f === 'nier' ? 420 : V.frame.ms;
      /* when this frame is at rest, on the moment's clock (a flight lands only on a frame at rest) */
      card._pmuFrameEnd = m ? since(m) + d + travel : 0;
      if (f === 'nier') { bootPlate(card, d, sp && !hero); return; }
      if (sp) {
        if (!boardMove) anim(card, [{ opacity: o.from || 0 }, { opacity: 1 }], { dur: T3.frameFade + 60, delay: d, easing: E.out });
        if (f === 'glass' && hero) glint(card, d + 120);
        return;
      }
      if (f === 'retro') { anim(card, [{ opacity: 0, transform: 'translateY(' + (8 * sgn) + 'px)' }, { opacity: 1, transform: 'none' }], { dur: 240, delay: d, easing: 'steps(4,jump-start)' }); return; }
      var F = V.frame, keys, total;
      if (f === 'friendly') {
        /* hop: up from the plate's feet with one soft bounce, tilted so the plate's corner lifts 14 px whatever its width,
           alternating by column (+ even, - odd) */
        var sprg = springFn(F.spring[0], F.spring[1]), w = cardBox(card).w || 300;
        var th = Math.atan(F.tilt / Math.max(40, w / 2)) * 180 / Math.PI * (card._pmuCol % 2 ? -1 : 1);
        total = sprg.ms;
        keys = camKeys(total, { op: { from: o.from || 0, to: 1, ms: F.fade, fn: M.curve(E.out) }, tr: { y: F.y * P * sgn, sc: F.sc, rot: th, ms: total, fn: sprg.fn, origin: '50% 100%' } }, 24);
      } else if (f === 'glass') {
        /* depth: out of the distance (push) or from in front of the lens (pull), about the board's visible centre (a real
           dolly: plates far from the centre travel further), the hero first. The focus pull is the old room's: it defocuses
           as it passes the lens while the new room arrives sharp. An arriving plate never draws through a blur (fix cycle
           1, GPU screencasts at 1920: eight-px blurs on every arriving plate, each over its own 18 px backdrop-filter, read
           as an empty violet board for 300-500 ms in Glass Dark; with the blur on the old room only the board never fell
           below Basic's detail and no frame gap grew) */
        var bx = cardBox(card), org = centre ? (centre.x - bx.l).toFixed(1) + 'px ' + (centre.y - bx.t).toFixed(1) + 'px' : null;
        total = F.ms;
        keys = camKeys(total, { op: { from: o.from || 0, to: 1, ms: F.fade, fn: M.curve(E.out) }, tr: { y: F.y * P * sgn, sc: push ? F.push : F.pull, ms: total, fn: M.curve(F.ease), origin: org } }, 18);
      } else {
        total = F.ms;
        keys = camKeys(total, { op: { from: o.from || 0, to: 1, ms: F.fade, fn: M.curve(E.out) }, tr: { y: F.y * P * sgn, ms: total, fn: M.curve(F.ease) } }, 16);
        /* ink: the first row's heads are underlined by a stroke that draws and dries */
        if ((+card.dataset.y || 0) === top) inkStroke(card, d + 80);
      }
      anim(card, keys, { dur: total, delay: d, easing: 'linear' });
      if (f === 'glass' && hero && !heroMade) { heroMade = true; glint(card, d + 200); }
    });
    if (cam && f === 'glass') refract(dir < 0 ? -1 : 1, base + 100);
    if (f === 'retro' && o.scan !== false) scanBar(o.board || (cards[0] && cards[0].parentNode), base);
  }

  /* ---- film.reveal (5 Phases B and C): a held body appears. The hero: opacity 160 OUT, then its queued instruments with
     all the light (its number 40 later). A supporting body {quiet: true}: one animation (opacity 200 OUT + 6 px 280
     SETTLE; the fade only without a GPU), its values final, its charts drawn quietly. The hold is the card's
     data-body-wait (an opacity hold, never visibility: PERF-3 rule 3); it is lifted in the same task the reveal is made. */
  function takeCue(card) {
    var m = moment, hit = null;
    if (m) m.queue = m.queue.filter(function (q) { if (q.card === card) { hit = q; return false; } return true; });
    if (!hit && card._pmuCue) { hit = { card: card, fn: card._pmuCue }; }
    card._pmuCue = null;
    return hit;
  }
  function reveal(card, o) {
    o = o || {};
    if (!card) return;
    var entry = takeCue(card);
    card.removeAttribute('data-body-wait');
    var d = Math.max(0, o.delay || 0);
    card._pmuEnterDelay = d;
    if (reduced() || M.paused() || !inView(card)) return;   /* final as rendered (outside the viewport: PERF-3 rule 9) */
    var body = card.querySelector(':scope > .pmu-cardbody'), f = fam(), stepped = f === 'retro' || f === 'nier';
    if (body) {
      if (f === 'nier' && !o.quiet && !soft()) {
        anim(body, [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { dur: 300, delay: d, easing: 'steps(5,jump-start)' });
        var scan = H('i', 'pmu-film-scan', card);
        gone(anim(scan, [{ transform: 'translateY(0%)', opacity: 1 }, { transform: 'translateY(100%)', opacity: 1, offset: 0.98 }, { transform: 'translateY(100%)', opacity: 0 }],
          { dur: 300, delay: d, easing: 'steps(5,jump-start)', fill: 'both' }), scan);
      } else if (o.quiet && !soft() && !stepped) {
        /* a supporting body in its voice (MOTION-4 4.2): Basic 6 px, Friendly 10 px (settles, no overshoot), Glass from .985 */
        var bv = camVoice(f).body || CAMV.basic.body;
        anim(body, combo(bv.ms, { ms: bv.fade, ease: E.out }, { ms: bv.ms, ease: bv.ease }, bv.sc ? { sc: bv.sc } : { y: bv.y }, 8), { dur: bv.ms, delay: d, easing: 'linear' });
      } else {
        anim(body, [{ opacity: 0 }, { opacity: 1 }], { dur: stepped ? 120 : o.quiet ? T3.quietFade : 160, delay: d, easing: stepped ? 'steps(' + (o.quiet ? 2 : 3) + ',jump-start)' : E.out });
      }
    }
    if (entry && innerOn(card)) {
      var run = function () { entry.fn(d + (o.quiet ? 0 : T3.heroNum)); };
      try { if (o.quiet && PMU.charts && PMU.charts.quietly) PMU.charts.quietly(run); else run(); } catch (error) { console.error('[pm-usage] film reveal', error); }
    }
    /* every hero carries light in every voice (MOTION-4 RC3) */
    if (!o.quiet && moment && card.hasAttribute('data-hero') && innerOn(card)) { try { heroFloor(card, d + T3.heroNum); } catch (error) {} }
  }
  function bodyMs() { var f = fam(); return (camVoice(f).body || CAMV.basic.body).ms; }
  /* the board calls this after each body of a moment is built: the hero at its time (arrival: the release; room change:
     200 after the click), the supporting bodies quietly from 280 after the hero, 24 apart in build (reading) order, cap
     360; a body built after its slot reveals at once. Before the arrival's release a body only records that it is built. */
  function bodyBuilt(card) {
    var m = moment;
    if (!card || !card.isConnected) return;
    if (!m) { reveal(card, { quiet: true, delay: 0 }); return; }
    var hero = card.hasAttribute('data-hero');
    if (!m.released) { if (hero && hold) hold.hero = true; return; }
    var fly = !hero && m.flyCards && m.flyCards.indexOf(card.getAttribute('data-widget')) >= 0;
    /* the plates that hold flight targets show their rows as the flyers set off (FINAL-REVIEW-3 must-fix 4: they stood
       empty until about 566 ms, white cards in Friendly Light): from 40 before the hero, 20 apart. Without a GPU they keep
       their place after the hero (VM: revealing them with the frames' entrance cost the Accounts change 4-5 frames) */
    var flyAt = soft() ? m.heroAt + 60 + Math.min(120, 24 * ((m.flyRank || 0) + 1) - 24) : m.heroAt - 40 + Math.min(100, 20 * ((m.flyRank || 0) + 1) - 20);
    if (fly) m.flyRank = (m.flyRank || 0) + 1;
    var slot = hero ? m.heroAt : fly ? flyAt
      : !flag('heroRoll') ? m.heroAt + Math.min(T3.quietCap, T3.quietStep * (m.rank++)) : m.quietAt + Math.min(T3.quietCap, T3.quietStep * (m.rank++));
    /* the real reveal time (a body built after its slot reveals at once): flights wait for it to be fully in */
    card._pmuRevealAt = Math.max(slot, since(m));
    reveal(card, { quiet: !hero && flag('heroRoll'), delay: Math.max(0, slot - since(m)) });
  }
  /* every first-screen body of the moment is built: its signature beat when the hero's instruments end (the arrival
     about T0 + 940, a room change about 1140 after the click), and the moment's end about 900 after that */
  function allBuilt(room, cards) {
    var m = moment; if (!m || m.room !== room || m.beatDone) return;
    m.beatDone = true;
    var beatAt = m.heroAt + T3.heroNum + T3.heroInstr, el = since(m);
    /* MOTION-4 RC5: the beat runs on the moment's timer T3.beatLead before its time, when every body is built AND drawn
       (called at once, a room built fast ran it before its chart existed: Prompt cache lost its beat in 3 of 12 entries) */
    var runAt = beatAt - T3.beatLead - el;
    if (runAt <= 16) playBeat(room, cards, { at: Math.max(0, beatAt - el) });
    else mtimer(m, runAt, function () { if (moment === m) playBeat(room, cards, { at: T3.beatLead }); });
    mtimer(m, Math.max(0, beatAt + 900 - el), function () { endMoment(m); });
  }

  /* ---- film.ghost (6.2): the outgoing room leaves as ONE layer. Its cards move into one .pmu-ghostboard (the same grid,
     at their place on screen) and that one element plays the camera drift: opacity 140 exit, translateY(-18 px x dir) and
     scale .992 over 220 IN. Friendly tilts away, Glass blurs with a GPU, Retro is wiped by a phosphor line in eight steps,
     NieR erased by its ink scanline. Without a GPU: the fade only. Removed (and its cards destroyed) at its end. ---- */
  function ghost(cards, o) {
    o = o || {};
    var board = o.board || document.getElementById('pmuBoard'), scroll = board && board.parentNode;
    function drop(list) { list.forEach(function (c) { if (o.destroy) try { o.destroy(c); } catch (error) {} if (c.parentNode) c.remove(); }); }
    if (!cards.length || !scroll) { drop(cards); return null; }
    if (reduced()) { drop(cards); return null; }
    var g = o.ghost;
    if (g) {
      /* the old board element itself (40-board.js swapped in a new one): nothing is moved */
      g.classList.add('pmu-ghostboard');
      Array.prototype.forEach.call(g.querySelectorAll(':scope > :not(.pmu-card)'), function (n) { n.remove(); });
      cards.forEach(function (c) { c._pmuLeaving = true; });
    } else {
      g = document.createElement('div');
      g.className = 'pmu-board pmu-ghostboard';
      g.setAttribute('aria-hidden', 'true');
      ['data-cls', 'data-room'].forEach(function (a) { var v = board.getAttribute(a); if (v != null) g.setAttribute(a, v); });
      g.style.cssText = board.style.cssText;
      cards.forEach(function (c) { c._pmuLeaving = true; c.removeAttribute('data-hero'); g.appendChild(c); });
      scroll.appendChild(g);
    }
    var f = fam(), dir = o.dir || 1, base = o.sTop ? 'translateY(' + (-o.sTop) + 'px)' : '', a, gAnims = [];
    if (soft()) a = anim(g, [{ opacity: 1, transform: base || 'none' }, { opacity: 0, transform: base || 'none' }], { dur: T3.ghostFade, easing: E.exit, fill: 'forwards' });
    else if (f === 'retro' || f === 'nier') {
      var n = f === 'nier' ? 8 : 8, ms = f === 'nier' ? 200 : 180;
      a = anim(g, [{ clipPath: 'inset(0 0 0 0)', transform: base || 'none' }, { clipPath: 'inset(100% 0 0 0)', transform: base || 'none' }], { dur: ms, easing: 'steps(' + n + ',jump-end)', fill: 'forwards' });
      var line = H('i', f === 'nier' ? 'pmu-film-scan pmu-ghostscan' : 'pmu-film-scanbar pmu-ghostscan', g);
      gone(anim(line, [{ transform: 'translateY(0%)', opacity: 1 }, { transform: 'translateY(100%)', opacity: 1, offset: 0.97 }, { transform: 'translateY(100%)', opacity: 0 }], { dur: ms, easing: 'steps(' + n + ',jump-end)', fill: 'both' }), line);
    } else {
      /* MOTION-4 RC1 / RC2 and 4.2: the camera's first half. The old room moves from the click (this task) on its voice's
         path, at full opacity: Basic pans P up the rail (-P x dir, scale .985, 360 SLIDE); Friendly steps back and tilts
         away about the visible centre (-0.8 P, scale .96, -1.4 deg x dir, 380); Glass passes the lens (push: scale 1.06,
         pull: .94, -0.35 P, 400) and blurs out (6 px) on a separate animation that leaves no filter behind. Its fade
         starts when the new chrome is in (frames(): fadeGhost), so the board is never empty between the rooms. */
      var CV = camVoice(f), gv = CV.ghost, P = camP(), cy = viewCentre().y + (o.sTop || 0);
      var sc = f === 'glass' ? (dir > 0 ? gv.push : gv.pull) : gv.sc;
      var tr = { base: base, y: gv.y * P * dir, rot: gv.rot ? gv.rot * dir : 0, sc: sc, ms: gv.ms, fn: M.curve(gv.ease), out: true,
        origin: f === 'friendly' || f === 'glass' ? '50% ' + cy.toFixed(0) + 'px' : null };
      a = anim(g, camKeys(gv.ms, { tr: tr }, 14), { dur: gv.ms, easing: 'linear', fill: 'forwards' });
      if (gv.blur && !soft()) gAnims.push(anim(g, [{ filter: 'blur(0px)' }, { filter: 'blur(' + gv.blur + 'px)', offset: 0.55 }, { filter: 'blur(' + gv.blur + 'px)' }], { dur: gv.ms + 200, easing: E.out, fill: 'none' }));
      var mm = moment;
      if (mm && a) {
        mm.ghost = { el: g, fade: null, fadeMs: CV.fade, done: null, move: a, anims: gAnims };
        /* the new chrome never came (an empty room): the old room fades on its own */
        mtimer(mm, 240, function () { fadeGhost(mm); });
      } else if (a) gAnims.push(anim(g, [{ opacity: 1 }, { opacity: 0 }], { dur: CV.fade, delay: 100, easing: E.exit, fill: 'forwards' }));
    }
    gAnims.push(a);
    var done = function () {
      if (done.ran) return; done.ran = true;
      if (mg) mg.gone = true;
      drop(Array.prototype.slice.call(g.querySelectorAll(':scope > .pmu-card')));
      /* the old board element empties into the hidden spare (40-board.js), never leaves the scroll pane, and carries no
         animation into its next life as the live board (every one still on the element is cancelled) */
      if (o.ghost) { gAnims.concat(mg && mg.fade && mg.fade.cancel ? [mg.fade] : [], g.getAnimations ? g.getAnimations() : []).forEach(function (x) { if (x) { try { x.cancel(); } catch (error) {} } }); g.textContent = ''; g.hidden = true; g.className = 'pmu-board'; g.removeAttribute('style'); ['data-film', 'data-op', 'data-held', 'data-hold-bodies'].forEach(function (a) { g.removeAttribute(a); }); }
      else g.remove();
    };
    var mg = moment && moment.ghost && moment.ghost.el === g ? moment.ghost : null;
    if (mg) mg.done = done;
    else if (a) a.finished.then(function () { later(done); }, done); else done();
    return g;
  }
  /* the key light moves with the camera (6.1): translateY(6 % of the stage x dir) -> 0, 520 SETTLE; with a GPU only (it is
     the one full-stage layer: without a GPU its motion costs the software compositor 11-15 ms per frame, PERF-3) */
  /* MOTION-4 4.2: the key light moves in the voice of the camera. Basic pans 8 / 10 / 12 % of the stage by rail distance
     (600 SETTLE); Friendly blooms from the hero's corner (scale .9, opacity .55 -> 1, 700 OUT); Glass dollies with the
     camera (push 1.08, pull .94 -> 1, 600 DEPTH); Retro keeps its stepped pan; NieR has no key light */
  function keyPan(dir) {
    if (reduced() || soft() || off.key) return null;
    var stage = document.getElementById('pmuStage'), el = stage && stage.querySelector(':scope > .pmu-film-key:not(.pmu-key-old)');
    if (!el) return null;
    var f = fam(), d = dir || CAM.dir, pct = CAM.dist >= 4 ? 12 : CAM.dist >= 2 ? 10 : 8;
    if (f === 'friendly') return anim(el, [{ transform: 'scale(.9)', transformOrigin: '22% 0', opacity: 0.55 }, { transform: 'none', transformOrigin: '22% 0', opacity: 1 }], { dur: 700, easing: E.out });
    if (f === 'glass') return anim(el, [{ transform: 'scale(' + (d > 0 ? 1.08 : 0.94) + ')', transformOrigin: '50% 40%' }, { transform: 'none', transformOrigin: '50% 40%' }], { dur: 600, easing: E.depth });
    if (f === 'retro') return anim(el, [{ transform: 'translateY(' + (6 * d) + '%)' }, { transform: 'none' }], { dur: 520, easing: 'steps(4,jump-start)' });
    return anim(el, [{ transform: 'translateY(' + (pct * d) + '%)' }, { transform: 'none' }], { dur: 600, easing: E.settle });
  }

  /* ======== 6.3-6.6 shared-element flight (film.flight) ========
     What exists in both rooms does not exit and enter: it flies. In the click task (before any write) one batched read
     takes the rects of the old room's [data-share] elements at least half inside the viewport (snapShares); the board
     then builds flyers for the keys the new room shows (known from its last visit; on a first visit the highest-ranked
     keys lift and the ones that find no target leave with the ghost), hides their sources and lifts them (takeoff 110).
     When the new room's target bodies are built (the board builds them right after the hero), their rects are read at
     the start of a slice, where the layout is already clean (no extra forced layout), and every flyer travels 460 on an
     arc (X on SLIDE, Y on (.55,.05,.35,1), scale on ROLL) to its target, 24 apart in priority order; at the landing the
     flyer and its target swap in one frame and the target gets the landing light. Caps: 12 with a GPU, 6 without, 4 in
     NieR. Without a GPU: one element per flyer on a straight path, no takeoff. Reduce Motion: no flight. */
  var SHARE_RANK = { chart: 0, num: 1, ctl: 2, win: 3, acct: 4, prov: 5, reset: 6 };
  var FILL = '.pmu-metertrack, .pmu-ladtrack, .pmu-skytrack';
  /* a room not visited yet (its keys unknown): the shares it is known to hold (WOW-SPEC-3 6.5), so the flock is chosen from
     what can land there instead of lifting numbers that will find no target */
  var ROOM_HINT = {
    overview: ['win:', 'num:spend.month', 'num:value.window', 'num:cache.saved', 'num:context.pct', 'num:health.score', 'chart:budget', 'chart:context', 'ctl:', 'prov:', 'reset:'],
    accounts: ['ctl:', 'win:', 'acct:', 'prov:', 'reset:'], plans: ['win:', 'reset:', 'acct:', 'prov:'], costs: ['num:spend.month', 'chart:budget'],
    context: ['num:context.pct', 'chart:context'], analytics: ['num:value.window', 'num:tokens.', 'chart:tokens', 'prov:', 'reset:'],
    cache: ['num:cache.saved'], ledger: ['num:attempts.count'], attention: ['prov:'], signals: ['num:health.score'], free: ['prov:'], tools: [], authority: [] };
  function hinted(room, key) { var h = ROOM_HINT[room]; return !!h && h.some(function (p) { return key.indexOf(p) === 0; }); }
  var roomKeys = {}, snapRec = null;
  function shareKind(key) { return String(key || '').split(':')[0]; }
  function flyCap() { return fam() === 'nier' ? 4 : soft() ? 6 : 12; }
  function flightOn() { return !reduced() && !M.paused() && !off.flight; }
  /* the keys (and the cards that hold them) each room showed on its first screen, recorded when its moment ends */
  function recordKeys(room) {
    var board = document.getElementById('pmuBoard'); if (!board || !room) return;
    var keys = {}, cards = [], home = {};
    Array.prototype.forEach.call(board.querySelectorAll(':scope > .pmu-card'), function (c) {
      if (!inView(c)) return;
      var list = c.querySelectorAll('[data-share]'); if (!list.length) return;
      var id = c.getAttribute('data-widget');
      cards.push(id);
      /* the plate that holds each key (MOTION-4 RC6: a revisit's flyers aim their early leg there; a used meter before a
         headroom ladder, the hero before a plate) */
      Array.prototype.forEach.call(list, function (e) {
        var k = e.getAttribute('data-share'); keys[k] = true;
        var ladder = !!(e.closest && e.closest('.pmu-ladrow, .pmu-ladtrack')), h = home[k];
        if (!h || (h.ladder && !ladder) || (h.ladder === ladder && !h.hero && c.hasAttribute('data-hero'))) home[k] = { id: id, ladder: ladder, hero: c.hasAttribute('data-hero') };
      });
    });
    var homes = {}; Object.keys(home).forEach(function (k) { homes[k] = home[k].id; });
    roomKeys[room] = { keys: keys, cards: cards, home: homes };
  }
  momentListeners.push(function (what, m) { if (what === 'end' || what === 'finish') { try { recordKeys(m.room); } catch (error) {} } });
  function flightCards(room) {
    if (roomKeys[room]) return roomKeys[room].cards.slice();
    /* a first visit: the cards predicted to hold the flyers' targets (built right after the hero, revealed with it) */
    return moment && moment.room === room && moment.predicted ? moment.predicted.slice() : [];
  }
  /* where a share lands in a room not visited yet (FINAL-REVIEW-3 must-fix 4: a first visit waited for every first-screen
     body before any flyer travelled; the towers stood over the hero for 200 ms and the target plates stayed empty): the
     widget that holds the key in that room, from the widget naming the rooms share (content's widget ids); null when not
     known (that flyer then waits for its target as before) */
  function homeOf(room, key, ids) {
    var kind = shareKind(key), rest = key.slice(kind.length + 1), prov = kind === 'win' || kind === 'acct' ? rest.split('/')[0] : kind === 'prov' ? rest : null;
    var leg = prov && PMU.roster && PMU.roster.settingsToLegacy ? PMU.roster.settingsToLegacy(prov) : null, cand = [];
    if (room === 'accounts') {
      if (kind === 'ctl') cand.push('acct-switch');
      if (prov) cand.push('acct-' + prov);
      if (kind === 'reset') cand.push('acct-resets');
    } else if (room === 'plans') {
      if (leg && kind !== 'reset') cand.push('plan-' + leg);
      if (kind === 'win') cand.push('plans-timeline', 'quota-history');
      if (kind === 'reset') cand.push('reset-map');
    } else if (room === 'analytics') {
      if (kind === 'prov' && leg) cand.push('tok-' + leg);
      if (key === 'num:value.window') cand.push('an-totals');
      if (key === 'chart:tokens' || key.indexOf('num:tokens') === 0) cand.push('token-trend', 'an-totals');
      if (kind === 'reset') cand.push('an-resets');
      if (kind === 'win') cand.push('an-quota-history');
    } else if (room === 'overview') {
      if (kind === 'win') cand.push('ov-skyline');
      if (key === 'num:spend.month' || key === 'chart:budget') cand.push('budget-now');
      if (key === 'num:value.window') cand.push('month');
      if (kind === 'ctl') cand.push('ov-headroom');
      if (kind === 'prov') cand.push('route-pressure');
      if (kind === 'reset') cand.push('ov-resets');
    } else if (room === 'costs') {
      if (key === 'num:spend.month' || key === 'chart:budget') cand.push('budget');
      if (key === 'num:value.window') cand.push('cost-month');
    } else if (room === 'context') {
      if (key === 'num:context.pct' || key === 'chart:context') cand.push('ctx-window');
    }
    return cand.filter(function (id) { return ids.indexOf(id) >= 0; })[0] || null;
  }
  /* one batched read of the old room's shares, before the click task writes anything (46-shell.js setView) */
  function snapShares(toRoom) {
    snapRec = null;
    if (!flightOn()) return;
    var board = document.getElementById('pmuBoard'), scroll = document.getElementById('pmuScroll'), app = document.getElementById('pmuApp');
    if (!board || !scroll || !app) return;
    var els = board.querySelectorAll(':scope > .pmu-card [data-share]');
    if (!els.length) return;
    var known = roomKeys[toRoom], sr = scroll.getBoundingClientRect(), ar = app.getBoundingClientRect(), items = [];
    Array.prototype.forEach.call(els, function (el) {
      var key = el.getAttribute('data-share'); if (known ? !known.keys[key] : !hinted(toRoom, key)) return;
      if (!(shareKind(key) in SHARE_RANK)) return;
      /* without a GPU a chart does not fly: its flyer is the largest moving box of the moment, and the software compositor
         redraws the bounding box of everything that moves (VM e3r5, Overview -> Costs: draw-gap dropped 7.5 -> 21.5) */
      if (soft() && shareKind(key) === 'chart') return;
      var keyEl = el;
      /* a window flies as its meter's track (the cell that carries the key also holds its value and reset line), and only
         as a fill (MOTION-4 RC8): a Plans timeline bar or quota line carries the key for live patches, but its length is
         the time to the reset, not the share used, so it never morphs into a meter (it arrives with its body) */
      if (shareKind(key) === 'win') { el = el.matches && el.matches(FILL) ? el : el.querySelector(FILL); if (!el) return; }
      var r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
      var vw = Math.min(r.right, sr.right) - Math.max(r.left, sr.left), vh = Math.min(r.bottom, sr.bottom) - Math.max(r.top, sr.top);
      if (vw <= 0 || vh <= 0 || vw * vh < 0.5 * r.width * r.height) return;
      var card = el.closest('.pmu-card');
      /* a headroom ladder shows what is LEFT: its bar is the inverse of a used meter, so it is the last choice to fly from */
      var headroom = !!(el.closest && el.closest('.pmu-ladrow, .pmu-ladtrack'));
      items.push({ el: el, keyEl: keyEl, key: key, kind: shareKind(key), r: { x: r.left - ar.left, y: r.top - ar.top, w: r.width, h: r.height }, hero: !!(card && card.hasAttribute('data-hero')), headroom: headroom });
    });
    /* one flyer per key: inside the hero first, then the largest, then reading order; across keys by kind priority */
    var by = {};
    items.forEach(function (it) {
      var o = by[it.key];
      if (!o || (o.headroom && !it.headroom) || (o.headroom === it.headroom && ((it.hero && !o.hero) || (it.hero === o.hero && it.r.w * it.r.h > o.r.w * o.r.h * 1.01)))) by[it.key] = it;
    });
    var list = Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return (SHARE_RANK[a.kind] - SHARE_RANK[b.kind]) || (b.hero - a.hero) || (a.r.y - b.r.y) || (a.r.x - b.r.x); });
    /* the cap counts every flying element: with a GPU up to 4 of the 12 are windows' value texts (a window flyer and its
       number), so at most 8 shares fly; no value texts without a GPU or in NieR (film e3g: 22 flyers with their shadows
       put 172 running animations in one frame, the cap is 160) */
    var vals = !soft() && fam() !== 'nier' ? Math.min(4, list.filter(function (it) { return it.kind === 'win'; }).length) : 0;
    list = list.slice(0, flyCap() - vals);
    var valsLeft = vals;
    /* the number flyer's face (6.3 num:, and a window's value text): computed once here, with the rects; a chart flyer is the
       charts kit's clone of its primary line and area (C3-5), placed on its data box */
    list.forEach(function (it) {
      if (it.kind === 'chart' && PMU.charts && PMU.charts.flyClone) {
        try {
          var dr = it.el.getBoundingClientRect(), fc = PMU.charts.flyClone(it.el, dr);
          if (fc && fc.el && fc.rect) { it.fly = fc; it.r = { x: fc.rect.left - ar.left, y: fc.rect.top - ar.top, w: fc.rect.width, h: fc.rect.height }; }
        } catch (error) { it.fly = null; }
      }
      if (it.kind === 'num') it.font = faceOf(it.el);
      if (it.kind !== 'chart') { var cs0 = getComputedStyle(it.el); it.vars = {}; ['--c', '--cb', '--v', '--pv', '--mr'].forEach(function (n) { var v0 = cs0.getPropertyValue(n); if (v0) it.vars[n] = v0.trim(); }); it.color = cs0.color; }
      if (it.kind === 'win') {
        var card = it.el.closest('.pmu-card'), v = card && card.querySelector('[data-share-v="' + cssEsc(it.key) + '"]');
        /* the reading the source shows (a target showing the same reading is the right landing: a used % lands on a used
           %, not on a headroom ladder) */
        if (v) it.vText = v.textContent.trim();
        if (v && valsLeft > 0) { var vr = v.getBoundingClientRect(); if (vr.width > 1) { valsLeft--; it.v = { el: v, kind: 'num', r: { x: vr.left - ar.left, y: vr.top - ar.top, w: vr.width, h: vr.height }, font: faceOf(v) }; } }
      }
    });
    /* the board's origin in the app's frame at scroll 0 (the new board takes the old one's place, scrolled to its top): the
       flight aims at predicted plates from grid geometry (FINAL-REVIEW-3 must-fix 4) */
    var br = board.getBoundingClientRect();
    snapRec = { at: performance.now(), from: st.room, to: toRoom, items: list, app: { x: ar.left, y: ar.top }, board: { x: br.left - ar.left, y: br.top - ar.top + scroll.scrollTop } };
  }
  function cssEsc(v) { return window.CSS && CSS.escape ? CSS.escape(v) : String(v).replace(/"/g, '\\"'); }
  function faceOf(el) {
    var cs = getComputedStyle(el);
    return { font: cs.font || [cs.fontStyle, cs.fontWeight, cs.fontSize + '/' + cs.lineHeight, cs.fontFamily].join(' '), fvn: cs.fontVariantNumeric, ls: cs.letterSpacing, color: cs.color, bg: cs.backgroundImage, clip: cs.webkitBackgroundClip || cs.backgroundClip, size: cs.backgroundSize, tt: cs.textTransform };
  }
  function flightLayer() {
    var app = document.getElementById('pmuApp'), el = document.getElementById('pmuFlight');
    if (!el && app) { el = document.createElement('div'); el.id = 'pmuFlight'; el.className = 'pmu-flight'; el.setAttribute('aria-hidden', 'true'); app.appendChild(el); }
    return el;
  }
  function stripClone(n) {
    if (n.nodeType !== 1) return;
    ['id', 'data-share', 'data-share-v', 'data-pm-hover-label', 'data-pm-hover-detail', 'data-pm-hover-bound', 'data-pm-hover-kind', 'aria-describedby', 'tabindex', 'data-pmu-fly-target'].forEach(function (a) { n.removeAttribute(a); });
    Array.prototype.forEach.call(n.children, stripClone);
  }
  function cloneFor(it) {
    var src = it.el, c;
    if (it.fly && it.fly.el) c = it.fly.el;
    if (!c) {
      if (src.querySelectorAll('*').length > 120) return null;
      c = src.cloneNode(true);
    }
    stripClone(c);
    c.classList.add('pmu-fly-c');
    if (it.font) applyFace(c, it.font);
    if (it.vars) Object.keys(it.vars).forEach(function (n) { c.style.setProperty(n, it.vars[n]); });
    if (!it.font && it.color) c.style.color = it.color;
    return c;
  }
  function applyFace(c, f) {
    c.style.font = f.font; if (f.fvn) c.style.fontVariantNumeric = f.fvn; c.style.letterSpacing = f.ls; c.style.textTransform = f.tt; c.style.whiteSpace = 'nowrap';
    if (f.bg && f.bg !== 'none' && /text/.test(f.clip || '')) { c.style.backgroundImage = f.bg; c.style.backgroundSize = f.size; c.style.webkitBackgroundClip = 'text'; c.style.backgroundClip = 'text'; c.style.color = 'transparent'; }
    else c.style.color = f.color;
  }
  /* the click task: build the flyers at the old rects, hide their sources, lift them (GPU) */
  function flight(o) {
    o = o || {};
    var m = moment, rec = snapRec; snapRec = null;
    if (!m || !rec || !rec.items.length || rec.to !== m.room || !flightOn()) return null;
    var layer = flightLayer(); if (!layer) return null;
    var f = fam(), sp = soft(), flyers = [];
    /* each flyer's home plate in the new room (MOTION-4 RC6 / RC7): a revisit knows it (recorded at the room's last visit);
       a first visit predicts it from the widget naming. On a first visit a share whose home is unknown or below the first
       screen does not lift at all (it left with the ghost instead of lifting, waiting and fading where it took off). */
    var known = roomKeys[m.room], ids = PMU.board && PMU.board.visible ? PMU.board.visible(m.room) || [] : [];
    var vh = Math.max(200, (window.innerHeight || 900) - 170);
    var items = rec.items.filter(function (it) {
      var h = known ? (known.home && known.home[it.key]) || null : homeOf(m.room, it.key, ids);
      if (h && ids.indexOf(h) < 0) h = null;
      if (h && !known) { var g0 = PMU.board.rect ? PMU.board.rect(h) : null, p0 = g0 && PMU.board.px ? PMU.board.px(g0) : null; if (!p0 || p0.t > vh) h = null; }
      it.home = h;
      return known ? true : !!h;
    });
    items.forEach(function (it) {
      var clone = cloneFor(it); if (!clone) return;
      var fl = makeFlyer(layer, it.r, clone, it, sp);
      fl.it = it; fl.key = it.key; fl.home = it.home; flyers.push(fl);
      if (it.v) { var vc = it.v.el.cloneNode(true); stripClone(vc); vc.classList.add('pmu-fly-c'); applyFace(vc, it.v.font); fl.val = makeFlyer(layer, it.v.r, vc, it.v, sp); }
      it.el.style.visibility = 'hidden';
      if (it.v) it.v.el.style.visibility = 'hidden';
    });
    if (!flyers.length) return null;
    /* takeoff (GPU): scale 1.04, 3 px up, the shadow layer in; NieR selects first (its brackets snap in two steps) */
    if (!sp && f === 'nier') flyers.forEach(function (fl) {
      var br = H('i', 'pmu-fly-brk', fl.lift);
      anim(br, [{ transform: 'scale(1.35)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1, offset: 0.5 }, { transform: 'scale(1)', opacity: 1 }], { dur: 120, easing: 'steps(2,jump-end)', fill: 'forwards' });
    });
    if (!sp) flyers.forEach(function (fl) {
      [fl, fl.val].forEach(function (x) { if (!x) return;
        x.takeoff = anim(x.lift, [{ transform: 'none' }, { transform: 'translateY(-3px) scale(1.04)' }], { dur: T3.takeoff, easing: f === 'nier' || f === 'retro' ? 'steps(2,jump-start)' : E.out, fill: 'forwards' });
        if (x.shadow) anim(x.shadow, [{ opacity: 0 }, { opacity: 1 }], { dur: T3.takeoff, easing: E.out, fill: 'forwards' });
      });
    });
    var F = { flyers: flyers, paired: false, layer: layer, finish: function () { flyers.forEach(function (fl) { land(fl, true); }); } };
    m.flights = F;
    /* a first visit predicts the cards that hold the targets (built after the hero, revealed with it) and every flyer
       starts toward its predicted plate when its takeoff ends; it re-aims at its real target when that exists */
    if (!known) {
      var pred = [];
      flyers.forEach(function (fl) { if (fl.home && pred.indexOf(fl.home) < 0) pred.push(fl.home); });
      m.predicted = pred;
    }
    m.flyCards = flightCards(m.room);
    if (!sp) flyers.forEach(function (fl) { preTravel(fl, rec); if (fl.val && fl.pre) preFollow(fl.val, fl.pre); });
    /* nothing paired after 700 ms (a target body that never came): the flyers leave */
    mtimer(m, 700, function () { if (!F.paired) pairFlights(true); });
    return F;
  }
  /* the early leg (FINAL-REVIEW-3 must-fix 4): from the end of the takeoff the flyer moves toward the point its target is
     predicted at (the plate's grid rect, no read, and a per-kind anchor inside it), on the same arc as the flight (X on
     SLIDE, Y on the flight's curve); a tower already starts to tip. pairFlights re-aims it from where it is. */
  var PRE = { dur: 460 };
  function homeRect(rec, id) {
    var g = PMU.board && PMU.board.rect ? PMU.board.rect(id) : null, p = g && PMU.board.px ? PMU.board.px(g) : null;
    if (!p || !rec.board) return null;
    return { x: rec.board.x + p.l, y: rec.board.y + p.t, w: p.w, h: p.h };
  }
  function preAim(fl, hr) {
    var it = fl.it || {}, kind = it.kind || 'num', a = fl.r;
    /* the anchor inside the plate: a window or an account at its row (the account's place in its provider's list), a
       mark or a reset line near the head, a control or a number in the upper part of the hero */
    var row = 0;
    if (kind === 'win' || kind === 'acct') {
      var parts = String(fl.key).split(':')[1].split('/'), pv = PMU.roster && PMU.roster.provider ? PMU.roster.provider(parts[0]) : null;
      if (pv) row = Math.max(0, pv.accounts.map(function (x) { return x.id; }).indexOf(parts[1]));
    }
    var ax = kind === 'win' ? hr.x + Math.min(hr.w * 0.62, 360) : hr.x + 24 + Math.min(a.w, hr.w * 0.5) / 2;
    var ay = kind === 'prov' ? hr.y + 24 : kind === 'reset' ? hr.y + 70 : kind === 'ctl' || kind === 'num' || kind === 'chart' ? hr.y + Math.min(hr.h * 0.4, 110) : hr.y + 86 + 36 * row;
    ay = Math.min(ay, hr.y + hr.h - 12);
    return { cx: ax, cy: ay };
  }
  function preTravel(fl, rec) {
    if (!fl.home || !rec) return;
    var hr = homeRect(rec, fl.home); if (!hr) return;
    var aim = preAim(fl, hr), a = fl.r, it = fl.it || {};
    var dx = aim.cx - (a.x + a.w / 2), dy = aim.cy - (a.y + a.h / 2);
    var tip = it.kind === 'win' && a.h > a.w * 1.3, rot = tip ? -90 : 0;
    fl.outer.style.transformOrigin = '50% 50%'; fl.inner.style.transformOrigin = '50% 50%';
    /* Retro and NieR take the early leg too, in their own steps (MOTION-4 RC6: their flyers stood still 300-500 ms) */
    var fv = fam();
    if (fv === 'retro' || fv === 'nier') {
      var SE = 'steps(' + (fv === 'retro' ? 6 : 5) + ',jump-end)', sf = M.curve(SE);
      fl.pre = { dx: dx, dy: dy, rot: rot, fx: sf, fy: sf, fs: sf, easing: SE,
        a: anim(fl.outer, [{ transform: 'translateX(0px)' }, { transform: 'translateX(' + dx.toFixed(2) + 'px)' }], { dur: PRE.dur, delay: T3.takeoff, easing: SE, fill: 'both' }),
        b: anim(fl.inner, [{ transform: 'translateY(0px) rotate(0deg)' }, { transform: 'translateY(' + dy.toFixed(2) + 'px) rotate(' + rot + 'deg)' }], { dur: PRE.dur, delay: T3.takeoff, easing: SE, fill: 'both' }) };
      return;
    }
    var fx = M.curve(E.slide), fy = M.curve('cubic-bezier(.55,.05,.35,1)'), fs = M.curve(E.roll), ko = [], ki = [];
    for (var i = 0; i <= 12; i++) { var o = i / 12; ko.push({ offset: o, transform: 'translateX(' + (dx * fx(o)).toFixed(2) + 'px)' }); ki.push({ offset: o, transform: 'translateY(' + (dy * fy(o)).toFixed(2) + 'px) rotate(' + (rot * fs(o)).toFixed(2) + 'deg)' }); }
    fl.pre = { dx: dx, dy: dy, rot: rot, fx: fx, fy: fy, fs: fs,
      a: anim(fl.outer, ko, { dur: PRE.dur, delay: T3.takeoff, easing: 'linear', fill: 'both' }), b: anim(fl.inner, ki, { dur: PRE.dur, delay: T3.takeoff, easing: 'linear', fill: 'both' }) };
  }
  /* a window's value text keeps beside its meter on the early leg: the same move, no turn */
  function preFollow(v, P) {
    v.outer.style.transformOrigin = '50% 50%'; v.inner.style.transformOrigin = '50% 50%';
    if (P.easing) {
      v.pre = { dx: P.dx, dy: P.dy, rot: 0, fx: P.fx, fy: P.fy, fs: P.fs, easing: P.easing,
        a: anim(v.outer, [{ transform: 'translateX(0px)' }, { transform: 'translateX(' + P.dx.toFixed(2) + 'px)' }], { dur: PRE.dur, delay: T3.takeoff, easing: P.easing, fill: 'both' }),
        b: anim(v.inner, [{ transform: 'translateY(0px)' }, { transform: 'translateY(' + P.dy.toFixed(2) + 'px)' }], { dur: PRE.dur, delay: T3.takeoff, easing: P.easing, fill: 'both' }) };
      return;
    }
    var ko = [], ki = [];
    for (var i = 0; i <= 12; i++) { var o = i / 12; ko.push({ offset: o, transform: 'translateX(' + (P.dx * P.fx(o)).toFixed(2) + 'px)' }); ki.push({ offset: o, transform: 'translateY(' + (P.dy * P.fy(o)).toFixed(2) + 'px)' }); }
    v.pre = { dx: P.dx, dy: P.dy, rot: 0, fx: P.fx, fy: P.fy, fs: P.fs,
      a: anim(v.outer, ko, { dur: PRE.dur, delay: T3.takeoff, easing: 'linear', fill: 'both' }), b: anim(v.inner, ki, { dur: PRE.dur, delay: T3.takeoff, easing: 'linear', fill: 'both' }) };
  }
  /* where the early leg will have brought the flyer when the real flight starts `after` motion ms from now (from its own
     timing: no style read). The early leg keeps running until the flight takes over (the flight's animations are newer,
     so they win from their first frame); it is cancelled at the landing. */
  function preAt(fl, after) {
    var P = fl.pre; if (!P) return null;
    var p = 0, sp0 = M.speed();
    try {
      var ct = P.a && P.a.effect && P.a.effect.getComputedTiming();
      var local = ct && ct.localTime != null ? ct.localTime : 0, dl = T3.takeoff * sp0, du = PRE.dur * sp0;
      p = Math.max(0, Math.min(1, (local + Math.max(0, after) * sp0 - dl) / du));
    } catch (error) { p = 0; }
    return { x: P.dx * P.fx(p), y: P.dy * P.fy(p), r: P.rot * P.fs(p), p: p };
  }
  function preCancel(fl) {
    var P = fl.pre; if (!P) return;
    fl.pre = null;
    [P.a, P.b].forEach(function (x) { if (x) try { x.cancel(); } catch (error) {} });
  }
  function makeFlyer(layer, r, clone, it, sp) {
    var outer = H('div', 'pmu-flyer', layer), inner = H('div', 'pmu-fly-in', outer), lift = H('div', 'pmu-fly-lift', inner);
    outer.style.cssText = 'left:' + r.x.toFixed(1) + 'px;top:' + r.y.toFixed(1) + 'px;width:' + r.w.toFixed(1) + 'px;height:' + r.h.toFixed(1) + 'px';
    outer.setAttribute('data-kind', it.kind || 'num');
    var shadow = null;
    if (!sp && it.kind !== 'num' && it.kind !== 'reset') shadow = H('i', 'pmu-fly-shadow', lift);
    lift.appendChild(clone);
    return { outer: outer, inner: inner, lift: lift, shadow: shadow, r: r, clone: clone };
  }
  /* the target side, from the board's slice (the layout is clean there): pair, hide targets, fly */
  function pairFlights(force) {
    var m = moment, F = m && m.flights;
    if (!F || F.paired) return;
    var board = document.getElementById('pmuBoard'), app = document.getElementById('pmuApp'); if (!board || !app) return;
    var targets = {};
    F.flyers.forEach(function (fl) {
      var list = board.querySelectorAll(':scope > .pmu-card [data-share="' + cssEsc(fl.key) + '"]');
      if (list.length) targets[fl.key] = Array.prototype.slice.call(list);
    });
    var missing = F.flyers.some(function (fl) { return !targets[fl.key]; });
    if (missing && !force) return;
    F.paired = true;
    var ar = app.getBoundingClientRect(), scroll = document.getElementById('pmuScroll'), sr = scroll ? scroll.getBoundingClientRect() : ar;
    var start = Math.max(T3.takeoff, since(m)), el0 = since(m), f = fam(), sp = soft(), i = 0;
    F.flyers.forEach(function (fl) {
      var pick = null, best = null;
      (targets[fl.key] || []).forEach(function (t) {
        var c = t.closest('.pmu-card'); if (!c || c.hasAttribute('data-late')) return;
        /* a window lands on the meter's track inside the cell that carries the key (the cell also holds the value and its
           reset line: a tower scaled to the whole cell became a block) */
        var land0 = fl.it && fl.it.kind === 'win' ? (t.matches && t.matches(FILL) ? t : t.querySelector(FILL)) : t;
        if (!land0) return;
        var r = land0.getBoundingClientRect(); if (r.width < 1 || r.height < 1 || r.bottom < sr.top || r.top > sr.bottom) return;
        /* the target's rect at REST: its plate and body may still be entering (a frame rises 16 px, a quiet body 6 px), so
           their current translation is taken off (computed style of two elements, read where the layout is clean) */
        var rest = restShift(c);
        var cand = { t: land0, card: c, r: { x: r.left - ar.left - rest.x, y: r.top - ar.top - rest.y, w: r.width, h: r.height }, hero: c.hasAttribute('data-hero') };
        /* the same reading: the card's value text for the key equals the source's, or (a plate row marks no value text) the
           cell that carries the key shows it ("78% used" holds "78%") */
        if (fl.it && fl.it.vText) { var vv0 = c.querySelector('[data-share-v="' + cssEsc(fl.key) + '"]'); cand.same = vv0 ? vv0.textContent.trim() === fl.it.vText : t.textContent.indexOf(fl.it.vText) >= 0; }
        cand.headroom = !!(t.closest && t.closest('.pmu-ladrow, .pmu-ladtrack')) && !(fl.it && fl.it.headroom);
        var better = !best || (cand.same && !best.same) || (cand.same === best.same && ((best.headroom && !cand.headroom) || (cand.headroom === best.headroom && ((cand.hero && !best.hero) || (cand.hero === best.hero && cand.r.w * cand.r.h > best.r.w * best.r.h * 1.01)))));
        if (better) best = cand;
      });
      pick = best;
      if (!pick) { leave(fl); if (fl.val) leave(fl.val); return; }
      var vt = null;
      if (fl.val) { var vv = pick.card.querySelector('[data-share-v="' + cssEsc(fl.key) + '"]'); if (vv) { var vr = vv.getBoundingClientRect(), rv = restShift(pick.card); vt = { t: vv, r: { x: vr.left - ar.left - rv.x, y: vr.top - ar.top - rv.y, w: vr.width, h: vr.height } }; } }
      if (fl.it && fl.it.fly && PMU.charts && PMU.charts.flyTarget) {
        try { var ft = PMU.charts.flyTarget(pick.t, fl.it.fly.domain, null), rs = restShift(pick.card); if (ft && ft.width > 0) pick.r = { x: ft.left - ar.left - rs.x, y: ft.top - ar.top - rs.y, w: ft.width, h: ft.height }; } catch (error) {}
      }
      [pick.t, vt && vt.t].forEach(function (t) { if (!t) return; t.setAttribute('data-pmu-fly-target', ''); settleTarget(t); });
      /* the body that holds the target is fully in before the landing (its reveal ends at its slot + its fade) */
      var bodyIn = Math.max(pick.card._pmuRevealAt != null ? pick.card._pmuRevealAt + bodyMs() : 0, pick.card._pmuFrameEnd || 0);
      var t0 = Math.max(start + Math.min(T3.flightCap, T3.flightStep * i), bodyIn - T3.flight);
      pick.bodyIn = bodyIn - el0;
      i++;
      travel(fl, pick, t0 - el0, f, sp);
      if (fl.val) { if (vt) travel(fl.val, vt, t0 - el0 + 20, f, sp); else leave(fl.val); }
    });
  }
  function restShift(card) {
    var out = { x: 0, y: 0 };
    [card, card && card.querySelector(':scope > .pmu-cardbody')].forEach(function (el) {
      if (!el) return;
      var tf = getComputedStyle(el).transform;
      if (!tf || tf === 'none') return;
      var m = /matrix\(([^)]+)\)/.exec(tf); if (!m) return;
      var v = m[1].split(',').map(Number);
      out.x += v[4] || 0; out.y += v[5] || 0;
    });
    return out;
  }
  function settleTarget(t) {
    if (t._pmuOdo) t._pmuOdo.cancel();
    Array.prototype.forEach.call(t.querySelectorAll('.pmu-odo'), function (n) { if (n._pmuOdo) n._pmuOdo.cancel(); });
    var list = []; try { list = t.getAnimations({ subtree: true }); } catch (error) {}
    list.forEach(function (a) { try { if (a.playState !== 'finished' && a.effect && a.effect.getTiming().iterations !== Infinity) a.finish(); } catch (error) {} });
  }
  function leave(fl) {
    /* a flyer on its early leg whose home plate turned out not to show its reading (a first visit: the plate shows one
       window of the account) is absorbed into that plate: it ends its leg there and dissolves (scale .9, 220 OUT), never
       fading mid-air and never landing on another reading (MOTION-4 RC7) */
    var rest = 0;
    if (fl.pre && fl.pre.a) { try { var ct = fl.pre.a.effect.getComputedTiming(); rest = Math.max(0, ((T3.takeoff + PRE.dur) * M.speed() - (ct.localTime || 0)) / M.speed()); } catch (error) { rest = 0; } }
    if (rest > 0) {
      fl.done = true;
      anim(fl.lift, [{ transform: 'translateY(-3px) scale(1.04)' }, { transform: 'scale(.9)' }], { dur: 220, delay: Math.max(0, rest - 200), easing: E.out, fill: 'forwards' });
      var ab = anim(fl.outer, [{ opacity: 1 }, { opacity: 0 }], { dur: 220, delay: Math.max(0, rest - 200), easing: E.out, fill: 'forwards' });
      if (ab) ab.finished.then(function () { later(function () { preCancel(fl); fl.outer.remove(); }); }, function () { fl.outer.remove(); }); else fl.outer.remove();
      return;
    }
    var a = anim(fl.outer, [{ opacity: 1 }, { opacity: 0 }], { dur: T3.ghostFade, easing: E.exit, fill: 'forwards' });
    fl.done = true;
    if (a) a.finished.then(function () { later(function () { fl.outer.remove(); }); }, function () { fl.outer.remove(); }); else fl.outer.remove();
  }
  function travel(fl, pick, delay, f, sp) {
    var a = fl.r, b = pick.r, kind = (fl.it && fl.it.kind) || 'num';
    fl.target = pick.t; fl.card = pick.card;
    var tip = kind === 'win' && a.h > a.w * 1.3 && b.w > b.h * 1.3;
    var dx, dy, tf;
    /* a flyer already on its early leg re-aims from where that leg will be when this flight starts (centre to centre,
       about its centre: the leg turned it about its centre), and the rest of its turn and its scale follow (must-fix 4) */
    var from = fl.pre && !sp ? preAt(fl, delay) : null;
    if (from) {
      var R = tip ? -90 : 0, fsx, fsy;
      if (tip) { fsx = b.h / a.w; fsy = b.w / a.h; }
      else if (kind === 'reset') { fsx = fsy = 1; }
      else if (kind === 'chart' || kind === 'win') { fsx = b.w / a.w; fsy = b.h / a.h; }
      else if (kind === 'num') { fsx = fsy = b.h / a.h; }
      else { fsx = fsy = Math.min(b.w / a.w, b.h / a.h); }
      dx = (b.x + b.w / 2) - (a.x + a.w / 2); dy = (b.y + b.h / 2) - (a.y + a.h / 2);
      var fdur = Math.max(300, Math.round(flightMs(f) * (1 - 0.35 * from.p)));
      /* the body that holds the target is fully in before the landing (the shorter leg starts later if it must) */
      if (pick.bodyIn != null && delay + fdur < pick.bodyIn) { delay = pick.bodyIn - fdur; from = preAt(fl, delay); }
      if (f === 'retro' || f === 'nier') {
        /* the rest of a stepped flight from where its stepped early leg is: straight, in steps; NieR leaves afterimages */
        var SE2 = 'steps(' + (f === 'retro' ? 8 : 6) + ',jump-end)', sdur = Math.max(240, Math.round((f === 'retro' ? 400 : 360) * (1 - 0.35 * from.p)));
        if (pick.bodyIn != null && delay + sdur < pick.bodyIn) { delay = pick.bodyIn - sdur; from = preAt(fl, delay); }
        var kx = [{ transform: 'translateX(' + from.x.toFixed(2) + 'px)' }, { transform: 'translateX(' + dx.toFixed(2) + 'px)' }];
        var ky = [{ transform: 'translateY(' + from.y.toFixed(2) + 'px) rotate(' + from.r.toFixed(2) + 'deg) scale(1,1)' }, { transform: 'translateY(' + dy.toFixed(2) + 'px) rotate(' + R + 'deg) scale(' + fsx.toFixed(4) + ',' + fsy.toFixed(4) + ')' }];
        anim(fl.outer, kx, { dur: sdur, delay: delay, easing: SE2, fill: 'forwards' });
        var lastS = anim(fl.inner, ky, { dur: sdur, delay: delay, easing: SE2, fill: 'forwards' });
        if (fl.takeoff) anim(fl.lift, [{ transform: 'translateY(-3px) scale(1.04)' }, { transform: 'none' }], { dur: sdur, delay: delay, easing: SE2, fill: 'forwards' });
        if (f === 'nier') afterimagesLeg(fl, kx, ky, sdur, delay, SE2);
        fl.anim = lastS;
        if (!lastS) { preCancel(fl); land(fl); return; }
        lastS.finished.then(function () { preCancel(fl); land(fl); }, function () {});
        return;
      }
      var cfy = M.curve('cubic-bezier(.55,.05,.35,1)'), cfs = M.curve(E.roll), kin = [];
      for (var j = 0; j <= 12; j++) { var oo = j / 12, ey = cfy(oo), es = cfs(oo); kin.push({ offset: oo, transform: 'translateY(' + (from.y + (dy - from.y) * ey).toFixed(2) + 'px) rotate(' + (from.r + (R - from.r) * es).toFixed(2) + 'deg) scale(' + (1 + (fsx - 1) * es).toFixed(4) + ',' + (1 + (fsy - 1) * es).toFixed(4) + ')' }); }
      var ok0 = outerPath(from.x, dx, f);
      anim(fl.outer, ok0.keys, { dur: fdur, delay: delay, easing: ok0.easing, fill: 'forwards' });
      var lastF = anim(fl.inner, kin, { dur: fdur, delay: delay, easing: 'linear', fill: 'forwards' });
      if (fl.takeoff) liftPath(fl, fdur, delay, f);
      if (fl.shadow) anim(fl.shadow, [{ opacity: 1 }, { opacity: 0 }], { dur: fdur, delay: delay, easing: E.out, fill: 'forwards' });
      if (f === 'glass') glintFlyer(fl, delay + 40);
      fl.anim = lastF;
      if (!lastF) { preCancel(fl); land(fl); return; }
      lastF.finished.then(function () { preCancel(fl); land(fl); }, function () {});
      return;
    }
    preCancel(fl);
    if (tip) {
      /* a vertical tower landing in a horizontal meter tips over (6.3): rotate -90 about its centre while its length scales to
         the target's length and its thickness to the target's */
      fl.inner.style.transformOrigin = '50% 50%'; fl.outer.style.transformOrigin = '50% 50%';
      dx = (b.x + b.w / 2) - (a.x + a.w / 2); dy = (b.y + b.h / 2) - (a.y + a.h / 2);
      tf = function (e, k) { return 'translateY(' + (dy * e.y).toFixed(2) + 'px) rotate(' + (-90 * e.s).toFixed(2) + 'deg) scale(' + (1 + (b.h / a.w - 1) * e.s).toFixed(4) + ',' + (1 + (b.w / a.h - 1) * e.s).toFixed(4) + ')'; };
    } else {
      dx = b.x - a.x; dy = b.y - a.y;
      var sx, sy;
      if (kind === 'reset') { sx = sy = 1; }
      else if (kind === 'chart' || kind === 'win') { sx = b.w / a.w; sy = b.h / a.h; }
      else if (kind === 'num') { sx = sy = b.h / a.h; }
      else { sx = sy = Math.min(b.w / a.w, b.h / a.h); }
      tf = function (e) { return 'translateY(' + (dy * e.y).toFixed(2) + 'px) scale(' + (1 + (sx - 1) * e.s).toFixed(4) + ',' + (1 + (sy - 1) * e.s).toFixed(4) + ')'; };
    }
    var dur = f === 'retro' ? 400 : f === 'nier' ? 360 : flightMs(f);
    var stepped = f === 'retro' || f === 'nier', last;
    if (sp || stepped) {
      /* one element, straight path (no GPU, Retro, NieR): translate + scale together */
      var keys = [0, 1].map(function (k) { return { transform: 'translateX(' + (dx * k).toFixed(2) + 'px) ' + tf({ y: k, s: k }) }; });
      last = anim(fl.outer, keys, { dur: dur, delay: delay, easing: stepped ? 'steps(' + (f === 'retro' ? 8 : 6) + ',jump-end)' : E.slide, fill: 'forwards' });
      if (f === 'nier' && !sp) afterimages(fl, keys, dur, delay);
    } else {
      var ok1 = outerPath(0, dx, f);
      anim(fl.outer, ok1.keys, { dur: dur, delay: delay, easing: ok1.easing, fill: 'forwards' });
      var fy = M.curve('cubic-bezier(.55,.05,.35,1)'), fs = M.curve(E.roll), keys2 = [];
      for (var i = 0; i <= 12; i++) { var off2 = i / 12; keys2.push({ offset: off2, transform: tf({ y: fy(off2), s: fs(off2) }) }); }
      last = anim(fl.inner, keys2, { dur: dur, delay: delay, easing: 'linear', fill: 'forwards' });
      /* the lift settles back as it flies (it lands at rest); Glass rises toward the lens on the way */
      if (fl.takeoff) liftPath(fl, dur, delay, f);
      if (fl.shadow) anim(fl.shadow, [{ opacity: 1 }, { opacity: 0 }], { dur: dur, delay: delay, easing: E.out, fill: 'forwards' });
      if (f === 'glass') glintFlyer(fl, delay + 40);
    }
    fl.anim = last;
    if (!last) { land(fl); return; }
    last.finished.then(function () { land(fl); }, function () {});
  }
  /* MOTION-4 4.2 flight paths per voice: Basic 460 on the arc; Friendly hops (the path bows 44 px against gravity at
     mid-flight, 560); Glass rises toward the lens (the lift grows 10 % at mid-flight, 500). The outer element carries X
     (and Friendly's hop, in screen pixels whatever the flyer's scale); the lift carries the takeoff and the lens. */
  function flightMs(f) { return f === 'friendly' ? 560 : f === 'glass' ? 500 : T3.flight; }
  function outerPath(x0, x1, f) {
    if (f !== 'friendly') return { keys: [{ transform: 'translateX(' + x0.toFixed(2) + 'px)' }, { transform: 'translateX(' + x1.toFixed(2) + 'px)' }], easing: E.slide };
    var fx = M.curve(E.slide), out = [];
    for (var i = 0; i <= 16; i++) { var t = i / 16; out.push({ offset: t, transform: 'translate(' + (x0 + (x1 - x0) * fx(t)).toFixed(2) + 'px,' + (-44 * Math.sin(Math.PI * t)).toFixed(2) + 'px)' }); }
    return { keys: out, easing: 'linear' };
  }
  function liftPath(fl, dur, delay, f) {
    if (f !== 'glass') { anim(fl.lift, [{ transform: 'translateY(-3px) scale(1.04)' }, { transform: 'none' }], { dur: dur, delay: delay, easing: E.out, fill: 'forwards' }); return; }
    var out = [];
    for (var i = 0; i <= 12; i++) { var t = i / 12, e = 1 - M.curve(E.out)(t), lens = 0.1 * Math.sin(Math.PI * t); out.push({ offset: t, transform: 'translateY(' + (-3 * e - 4 * Math.sin(Math.PI * t)).toFixed(2) + 'px) scale(' + (1 + 0.04 * e + lens).toFixed(4) + ')' }); }
    out[out.length - 1].transform = 'none';
    anim(fl.lift, out, { dur: dur, delay: delay, easing: 'linear', fill: 'forwards' });
  }
  /* Friendly's landing on a meter or a control: three warm dots puff out from the landing point and fade (a value or a
     fill never scales) */
  function puff(r) {
    if (!r || reduced()) return;
    var layer = flightLayer(); if (!layer) return;
    var cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    [[-1, -0.7], [0, -1], [1, -0.7]].forEach(function (v, i) {
      var dot = H('i', 'pmu-film-puff', layer);
      dot.style.left = cx.toFixed(1) + 'px'; dot.style.top = cy.toFixed(1) + 'px';
      gone(anim(dot, [{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 }, { opacity: 0.95, offset: 0.2 },
        { transform: 'translate(calc(-50% + ' + (16 * v[0]) + 'px), calc(-50% + ' + (16 * v[1]) + 'px)) scale(1)', opacity: 0 }], { dur: 440, delay: 24 * i, easing: E.out, fill: 'both' }), dot);
    });
  }
  /* NieR's afterimages on a flight that continues an early leg: copies of the flyer follow 60 and 120 later on the same
     outer (X) and inner (Y, turn, scale) path, fading */
  function afterimagesLeg(fl, kx, ky, dur, delay, easing) {
    [[0.4, 60], [0.2, 120]].forEach(function (p) {
      var g = fl.outer.cloneNode(true); g.classList.add('pmu-fly-after'); fl.outer.parentNode.insertBefore(g, fl.outer);
      var gi = g.firstChild;
      var a1 = anim(g, kx.map(function (k, i) { return { transform: k.transform, opacity: i === 0 ? p[0] : 0 }; }), { dur: dur, delay: delay + p[1], easing: easing, fill: 'both' });
      if (gi) anim(gi, ky, { dur: dur, delay: delay + p[1], easing: easing, fill: 'both' });
      gone(a1, g);
    });
  }
  function afterimages(fl, keys, dur, delay) {
    [[0.4, 60], [0.2, 120]].forEach(function (p) {
      var ghostEl = fl.outer.cloneNode(true); ghostEl.classList.add('pmu-fly-after'); fl.outer.parentNode.insertBefore(ghostEl, fl.outer);
      var a = anim(ghostEl, keys.map(function (k, i) { return { transform: k.transform, opacity: i === 0 ? p[0] : 0 }; }), { dur: dur, delay: delay + p[1], easing: 'steps(6,jump-end)', fill: 'both' });
      gone(a, ghostEl);
    });
  }
  function glintFlyer(fl, d) {
    var wrap = H('i', 'pmu-film-glint', fl.lift), band = H('i', '', wrap);
    gone(anim(band, [{ transform: 'translateX(-120%) skewX(-20deg)', opacity: 0 }, { opacity: 1, offset: 0.25 }, { transform: 'translateX(320%) skewX(-20deg)', opacity: 0 }], { dur: 400, delay: d, easing: E.depth, fill: 'both' }), wrap);
  }
  /* light at a measured rect, drawn in the flight layer (#pmuFlight, above the board): the flash (and with a GPU the sweep) of a
     landed flyer or a live lead, sized to the element itself whatever its position (a flash inside a static element
     covered its whole card; NieR's invert flash then inverted the hero plate) */
  function rectIn(el) {
    var app = document.getElementById('pmuApp'); if (!el || !app) return null;
    var r = el.getBoundingClientRect(), a = app.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? { x: r.left - a.left, y: r.top - a.top, w: r.width, h: r.height } : null;
  }
  function lightAt(r, o) {
    o = o || {};
    if (!r || reduced()) return null;
    var layer = flightLayer(); if (!layer) return null;
    var box = H('i', 'pmu-film-at', layer);
    box.style.cssText = 'left:' + (r.x - 3).toFixed(1) + 'px;top:' + (r.y - 2).toFixed(1) + 'px;width:' + (r.w + 6).toFixed(1) + 'px;height:' + (r.h + 4).toFixed(1) + 'px';
    var a = flash(box, { tone: o.tone, noSweep: true, dur: o.dur });
    box.setAttribute('data-voice', voice().name);
    /* a live lead in its voice (MOTION-4 4.2): Glass a specular glint instead of the sweep; Friendly's flash is warm (CSS) */
    var b = !o.noSweep && !soft() ? (fam() === 'glass' ? glint(box, (o.delay || 0) + 120) : sweep(box, { delay: (o.delay || 0) + 120, dur: 650 })) : null;
    var lastA = b || a;
    if (lastA) lastA.finished.then(function () { later(function () { box.remove(); }); }, function () { box.remove(); }); else box.remove();
    return box;
  }
  /* the landing: target and flyer swap in one task (one frame), then the landing light on the target */
  function land(fl, now) {
    if (fl.done) { if (now && fl.outer.isConnected) fl.outer.remove(); return; }
    fl.done = true;
    if (now) preCancel(fl);
    if (fl.anim && now) { try { fl.anim.finish(); } catch (error) {} }
    var t = fl.target;
    if (fl.val) land(fl.val, now);
    /* the landing light's rect is the flyer's last frame: no read of the target */
    var lr = null;
    if (t && !now && !reduced()) { try { var fr = fl.lift.getBoundingClientRect(), ap = document.getElementById('pmuApp').getBoundingClientRect(); lr = { x: fr.left - ap.left, y: fr.top - ap.top, w: fr.width, h: fr.height }; } catch (error) { lr = null; } }
    if (t) { settleTarget(t); t.removeAttribute('data-pmu-fly-target'); }
    /* the swap frame shows the target exactly where the flyer ended: if the target's own rect moved since the pairing (a
       fit pass, a late body above it: measured 2-6 px on the VM), the target starts at the flyer's place and settles
       into its own in 160 ms (one transform animation on the target) */
    if (t && lr && !(fl.it && fl.it.kind === 'chart')) {
      try {
        var tr0 = t.getBoundingClientRect(), ap0 = document.getElementById('pmuApp').getBoundingClientRect();
        var ex = lr.x - (tr0.left - ap0.left), ey = lr.y - (tr0.top - ap0.top);
        if (Array.isArray(off.landLog)) off.landLog.push({ card: fl.card && fl.card.getAttribute('data-widget'), at: moment ? Math.round(since(moment)) : null, key: fl.key, dx: +ex.toFixed(1), dy: +ey.toFixed(1), dw: +(lr.w - tr0.width).toFixed(1), dh: +(lr.h - tr0.height).toFixed(1) });
        if ((Math.abs(ex) >= 1 || Math.abs(ey) >= 1) && Math.abs(ex) < 40 && Math.abs(ey) < 40) anim(t, [{ transform: 'translate(' + ex.toFixed(1) + 'px,' + ey.toFixed(1) + 'px)' }, { transform: 'none' }], { dur: 160, easing: E.settle });
      } catch (error) {}
    }
    fl.outer.remove();
    if (!t || now || reduced()) return;
    var f = fam();
    inBeat++;
    try {
      lightAt(lr, { noSweep: true, dur: T3.land });
      var kd = (fl.it && fl.it.kind) || 'num';
      /* Friendly: marks land with a squash (a plate-like body); a number hops 4 px up and settles back without changing
         its size (a number never reads bigger than it is); meters, ladders and controls get a puff of three warm dots
         instead, so no fill ever reads longer than its value (MOTION-4 4.2) */
      if (f === 'friendly') {
        if (kd === 'prov' || kd === 'acct') anim(t, [{ transform: 'scale(1)' }, { transform: 'scale(1.08,.94)', offset: 0.3 }, { transform: 'scale(.97,1.03)', offset: 0.65 }, { transform: 'scale(1)' }], { dur: 280, easing: E.out });
        else if (kd === 'num') anim(t, [{ transform: 'none' }, { transform: 'translateY(-4px)', offset: 0.4 }, { transform: 'none' }], { dur: 300, easing: E.out });
        else if (kd !== 'chart') puff(lr);
      }
      if (f === 'glass' && (kd === 'prov' || kd === 'acct')) halo(t, { dur: 600 });
      /* Glass: a specular glint runs along a landed fill */
      if (f === 'glass' && kd === 'win') glint(t, 40);
    } finally { inBeat--; }
  }

  /* ---- the inner entrance hook: kind.enter waits while its body waits (data-body-wait, inside a moment) and runs at the
     body's reveal with its delay; outside a moment it runs at once with the card's wave delay + 160 (cards added by a
     layout change), and never for a card that is not innerOn (PERF-3: final as rendered) ---- */
  var hold = null;
  function holding() { return !!hold; }
  function cue(card, fn) {
    var m = moment;
    if (card && card.hasAttribute('data-body-wait')) {
      if (m) { m.queue = m.queue.filter(function (q) { return q.card !== card; }); m.queue.push({ card: card, fn: fn }); }
      else card._pmuCue = fn;
      return;
    }
    if (card && !innerOn(card)) return;
    try { fn((card && card._pmuEnterDelay || 0) + T.inner); } catch (error) { console.error('[pm-usage] film cue', error); }
  }

  /* ---- per-room signature beats (7): a room registers one with PMU.film.beat(room, fn); it runs once per arrival or room
     change, when every first-screen body is built, with b.at = ms from now when the hero's instruments end. The beat runs
     with the light budget open (what it touches may carry light). Round-2 helpers keep working: each card's
     _pmuEnterDelay is its reveal relative to now, b.inner the hero number's offset. ---- */
  var beats = {};
  function beat(room, fn) { beats[room] = fn; }
  function playBeat(room, cards, o) {
    var fn = beats[room];
    /* the beat's targets show from here: in the same task as the beat creates their animations (fill backwards keeps each
       unseen until its delay), so none shows, hides and pops back (MOTION-4 RC4) */
    releaseBeatHold();
    if (!fn || reduced()) return;
    o = o || {};
    var m = moment, el = m ? since(m) : 0, last = 0;
    cards = (cards || []).filter(function (c) { return c.isConnected; });
    cards.forEach(function (c) { if (m && c._pmuRevealAt != null) c._pmuEnterDelay = Math.max(0, c._pmuRevealAt - el); last = Math.max(last, c._pmuEnterDelay || 0); });
    var heroes = cards.filter(function (c) { return c.hasAttribute('data-hero'); });
    inBeat++;
    emitMoment('beat', m || { room: room });
    try { fn({ room: room, cards: cards, hero: heroes[0] || null, heroes: heroes, at: o.at || 0, last: last, inner: T3.heroNum }); }
    catch (error) { console.error('[pm-usage] film beat ' + room, error); }
    finally { inBeat--; emitMoment('beat-end', m || { room: room }); }
  }

  /* ---- the shell's power-on (3.1 Phase A): rail rows, brand, ink, title, head controls and the key light ---- */
  function shellIntro(app) {
    if (off.shell) return;
    var f = fam(), stepped = f === 'retro' || f === 'nier', ease = stepped ? 'steps(3,jump-start)' : E.out;
    /* the key light blooms only with a GPU: it is the one full-stage layer, and its bloom alone costs the software
       compositor 11-15 ms per frame (PERF-3, vizlab); without a GPU it shows at rest */
    key({ bloom: !soft() });
    var brand = app.querySelector('.pmu-brand');
    if (brand) anim(brand, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { dur: T.title, delay: 40, easing: ease });
    /* integ3: without a GPU the rail and the head controls each enter as ONE group (rule 10: one layer per moving group;
       the soft first arrival peaked at 66-79 running animations against the 60 cap, 13 of them rail rows) */
    var navEl = app.querySelector('#pmuNav');
    if (soft() && navEl) anim(navEl, [{ opacity: 0, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'none' }], { dur: T.rail + 80, delay: 40, easing: ease });
    else Array.prototype.forEach.call(app.querySelectorAll('#pmuNav > .pmu-navbtn'), function (b, i) {
      anim(b, [{ opacity: 0, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'none' }], { dur: T.rail, delay: 40 + T.railStep * i, easing: ease });
    });
    var ink = document.getElementById('pmuNavInk');
    if (ink) anim(ink, [{ scale: '1 0', opacity: 0 }, { scale: '1 1', opacity: 1 }], { dur: 280, delay: 200, easing: stepped ? 'steps(3,jump-start)' : E.settle });
    if (f !== 'nier') {
      var tb = app.querySelector('.pmu-titleblock');
      if (tb) anim(tb, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { dur: T.title, delay: 60, easing: ease });
    }
    var hc = app.querySelector('.pmu-headctl');
    if (soft() && hc) anim(hc, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { dur: T.rail + 60, delay: 120, easing: ease });
    else Array.prototype.forEach.call(app.querySelectorAll('.pmu-headctl > *'), function (c, i) {
      anim(c, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { dur: T.rail, delay: 120 + T.headStep * i, easing: ease });
    });
  }

  /* ---- 5: the first arrival. The frames are on screen from the first frame (40-board.js mount held); the bodies are
     built held, the hero's first. Release T0 = the hero's body built + the board width stable for two frames + at least
     200 ms (600 fallback); at T0 the hero comes alive with all the light, the built supporting bodies settle in quietly
     from T0 + 280, the rest as they are built. ---- */
  function releaseHeld(h, why) {
    if (hold !== h) return;
    var m = h.m;
    /* the built cards measured once more now that the board is final (a tile measured in an early slice can be one tier
       off); a changed card renders again and requeues its entrance (it still waits under data-body-wait) */
    var board = h.board;
    var cards = Array.prototype.slice.call(board.querySelectorAll(':scope > .pmu-card'));
    try { if (PMU.board && PMU.board.tierPass) PMU.board.tierPass(cards.filter(function (c) { var b = c.querySelector(':scope > .pmu-cardbody'); return b && b._pmuKind; }), 'held'); } catch (error) { console.error('[pm-usage] film re-measure', error); }
    hold = null;
    try { performance.mark('pmu-film-release'); } catch (error) {}
    if (PMU.board && PMU.board.viewNow) PMU.board.viewNow(true);   /* the layout is clean here (the re-measure just read it) */
    if (moment !== m) return;
    m.released = true; m.t0 = performance.now();
    board.setAttribute('data-film', '');
    board.removeAttribute('data-held');
    board.removeAttribute('data-hold-bodies');
    board.removeAttribute('data-pm-hover-exempt');
    var built = cards.filter(function (c) { var b = c.querySelector(':scope > .pmu-cardbody'); return b && b._pmuKind && c.hasAttribute('data-body-wait'); });
    built.sort(function (a, b) { return (b.hasAttribute('data-hero') - a.hasAttribute('data-hero')) || (+a.dataset.y - +b.dataset.y) || (+a.dataset.x - +b.dataset.x); });
    built.forEach(bodyBuilt);
    deferHoverTags(T3.heroNum + T3.heroInstr + 1500);
    if (h.built) allBuilt(h.room, cards);
    last = { room: h.room, at: performance.now() - h.start, why: why, cards: cards.length };
    if (PMU.board && PMU.board.settled) PMU.board.settled();
  }
  var last = null;
  function watch(h) {
    function tick() {
      if (hold !== h) return;
      var now = performance.now(), t = (now - h.start) / M.speed();
      if (!(h.hero || h.built)) { if (t > 4000) { releaseHeld(h, 'timeout'); return; } requestAnimationFrame(tick); return; }
      /* the width is stable when the board's ResizeObserver has not seen a change for two frames (no layout read here) */
      var v = PMU.board && PMU.board.viewNow ? PMU.board.viewNow() : null, stable = !v || !v.wAt || now - v.wAt >= 34;
      if ((stable && t >= 200) || t >= 600) { releaseHeld(h, stable ? 'stable' : 'fallback'); return; }
      if (t > 4000) { releaseHeld(h, 'timeout'); return; }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---- hover tags wait for the moment to end (WOW-SPEC 3.1 budget, MOTION-REVIEW-2 item 2): the app's hover-tag
     controller scans a page 380 ms after a page change, in rAF batches, and each batch is a full main-thread frame on the
     CPU-only VM, in the middle of the entrance. While a film moment runs, the controller is kept in its own
     page-settling state; when the moment ends it scans the Usage panel once (the same scan, later). ---- */
  var hoverT = 0, filmEndT = 0;
  function deferHoverTags(ms) {
    var hc = window.PM_HOVER_TAG_CONTROLLER;
    if (!hc || typeof hc.scheduleScan !== 'function' || reduced()) return;
    try { clearTimeout(hc.pageScanTimer); hc.pageScanTimer = 0; hc.pageSettling = true; } catch (error) { return; }
    clearTimeout(hoverT);
    hoverT = setTimeout(function () {
      hoverT = 0;
      try { hc.pageSettling = false; hc.scheduleScan(document.getElementById('panel-usage') || document); } catch (error) {}
    }, Math.max(0, ms) * M.speed());
  }
  function releaseHoverTags() {
    if (!hoverT) return;
    clearTimeout(hoverT); hoverT = 0;
    var hc = window.PM_HOVER_TAG_CONTROLLER;
    try { if (hc) { hc.pageSettling = false; hc.scheduleScan(document.getElementById('panel-usage') || document); } } catch (error) {}
  }

  /* ---- 5 the first arrival on Usage ---- */
  function arrive(o) {
    o = o || {};
    var app = document.getElementById('pmuApp'), board = document.getElementById('pmuBoard');
    if (!app || !board || !PMU.board) return;
    if (reduced() || M.paused()) { finishMoment('instant'); hold = null; PMU.board.mount(st.room, {}); return; }
    var m = begin('arrive', st.room);
    var h = { board: board, room: st.room, start: performance.now(), built: false, hero: false, m: m };
    hold = h;
    deferHoverTags(4000);
    /* the app seats the Assistant beside every non-Home page in its first frame after the page change; seating it now
       gives the board its final width before the first slice, so the build never has to start over at a new board class */
    try { if (window.PM7_SHELL_ADJUSTMENTS && typeof window.PM7_SHELL_ADJUSTMENTS.seatChat === 'function') window.PM7_SHELL_ADJUSTMENTS.seatChat(); } catch (error) {}
    shellIntro(app);
    board.setAttribute('data-pm-hover-exempt', 'entering');
    PMU.board.mount(st.room, { held: true, onBuilt: function (cards) { if (hold === h) h.built = true; else if (moment === m && m.released) allBuilt(h.room, cards || []); } });
    watch(h);
  }
  /* a board class change while held rebuilds the board held under the same arrival (never the instant remount) */
  function rehold(onBuilt) {
    if (!hold) return null;
    hold.built = false; hold.hero = false;
    if (moment) moment.queue = [];
    var h = hold;
    return function (cards) { if (hold === h) h.built = true; if (onBuilt) onBuilt(cards); };
  }
  function cancelHold() {
    releaseHoverTags();
    if (hold) { var h = hold; hold = null; h.board.removeAttribute('data-held'); h.board.removeAttribute('data-hold-bodies'); h.board.removeAttribute('data-pm-hover-exempt'); }
    finishMoment('cancel');
  }

  PMU.film = { E: E, T: T, T3: T3, VOICES: VOICES, voice: voice, at: at, sequence: sequence, stagger: stagger, wave: wave, enterPlates: enterPlates,
    odometer: odometer, decode: decode, comet: comet, headGlow: headGlow, drop: drop, sweep: sweep, flash: flash, ring: ring, halo: halo, spring: spring,
    key: key, keyPan: keyPan, edgeAt: edgeAt, cue: cue, holding: holding, rehold: rehold, cancelHold: cancelHold, beat: beat, playBeat: playBeat, arrive: arrive,
    deferHoverTags: deferHoverTags, last: function () { return last; }, off: off, parsePath: parsePath, yAt: yAt,
    soft: soft, innerOn: innerOn, glint: glint, combo: combo,
    /* round 3 */
    begin: begin, finish: finishMoment, moment: function () { return moment; }, onMoment: function (fn) { momentListeners.push(fn); },
    frames: frames, reveal: reveal, bodyBuilt: bodyBuilt, allBuilt: allBuilt, ghost: ghost,
    lit: lit, isQuiet: quietEl, lightBudget: lightBudget, flag: flag,
    budget: function (card, on) { if (card) card._pmuBudget = on !== false; }, lightAt: lightAt, rectIn: rectIn,
    snapShares: snapShares, flight: flight, pairFlights: pairFlights, flightCards: flightCards, roomKeys: function () { return roomKeys; },
    /* MOTION-4 (lane b-motion) */
    camera: camera, cam: function () { return { dir: CAM.dir, dist: CAM.dist, p: camP() }; }, CAMV: CAMV, springFn: springFn, refract: refract, heroFloor: heroFloor,
    /* animations made before the moment began (the room title, 46-shell.js render) join it, so a rapid switch ends them too */
    adopt: function (list) { var m = moment; if (!m) return; (list || []).forEach(function (a) { if (a) m.anims.push(a); }); } };
})();

/* ======== Live film (WOW-SPEC-3 8; WOW-TASKS-3 E3-6 .. E3-8; flag live, Q1) ========
   While Usage is open a few demo readings change in front of the viewer: the concept's demo engine (PM_DEMO) emits
   usage.tick every 2 s of demo time; one beat per 3 ticks (about 6 s at demo speed 1, the demo engine's speed 2 / 4
   shortens it), the first one 4 s after the first arrival's beat. The CONTENT of a beat is the live script (content,
   roster.json live, PMU.data.live): its deltas go into PMU.live.overlay (created once, never replaced; DATA and
   PM7_USAGE.data never change), then the cards that show a changed reading patch in place (PMU.cards.update(card,
   'live')), the lead change gets one flash and one sweep, and the Live indicator pulses once. Between beats nothing
   runs: no timer but the tick subscription, no animation. Holds (the page not shown, the tab hidden, an arrival or room
   change + 1 s, a gesture, a menu, the inspector, a crosshair, a sliced refresh, the guided tour or onboarding) queue
   and coalesce: the deltas still apply, and when the hold ends one beat patches what is shown to the latest values.
   Reduce Motion: every change final at once, no pulse. The viewer's choice (Live / Paused) is remembered; ?pmu-live=off
   pauses for one load (harnesses). */
(function () {
  var root = document.documentElement, M = PMU.motion;
  var STORE_KEY = 'pm7:usage:live:v1';
  var enabled = !PMU.flags || PMU.flags.live !== false;
  var urlOff = (function () { try { return /[?&]pmu-live=(off|0)\b/.test(location.search); } catch (error) { return false; } })();
  var overlay = {};
  var S = { on: enabled && !urlOff && STORE.get(STORE_KEY, 'on') !== 'paused', ticks: 0, lastTick: 0, lastBeat: 0, firstAt: 0, armed: false,
    pending: null, subscribed: false, momentEnd: 0, count: 0 };
  var log = [];
  function usageShown() { var p = document.getElementById('panel-usage'); return !!p && p.classList.contains('active'); }
  function heldBy() {
    if (!usageShown()) return 'page';
    if (document.hidden) return 'tab';
    if (root.hasAttribute('data-o55-open')) return 'onboarding';
    if (root.hasAttribute('data-o55-tour')) return 'tour';
    var m = PMU.film && PMU.film.moment && PMU.film.moment();
    if (m) return 'moment';
    if (performance.now() - S.momentEnd < 1000 * M.speed()) return 'moment+1s';
    if (PMU.board && PMU.board.gesture && PMU.board.gesture()) return 'gesture';
    if (PMU.menu && PMU.menu.isOpen && PMU.menu.isOpen()) return 'menu';
    if (PMU.inspector && PMU.inspector.isOpen && PMU.inspector.isOpen()) return 'inspector';
    if (PMU.charts && PMU.charts.crosshairOn ? PMU.charts.crosshairOn() : document.querySelector('#pmuBoard .pmu-xh-on')) return 'crosshair';
    if (PMU.board && PMU.board.refreshing && PMU.board.refreshing()) return 'refresh';
    return null;
  }
  function demoSpeed() { try { return (window.PM_DEMO && PM_DEMO.state && PM_DEMO.state.clock && PM_DEMO.state.clock.speed) || 1; } catch (error) { return 1; } }
  function subscribe() {
    if (S.subscribed || !enabled || !window.PM_DEMO || typeof PM_DEMO.on !== 'function') return;
    S.subscribed = true;
    try {
      PM_DEMO.on('usage.tick', onTick);
      PM_DEMO.on('usage.alert', function () { if (S.on && usageShown()) { S.alertDue = true; } });
    } catch (error) { S.subscribed = false; }
  }
  if (PMU.film && PMU.film.onMoment) PMU.film.onMoment(function (what, m) {
    if (what !== 'end' && what !== 'finish') return;
    S.momentEnd = performance.now();
    /* the first beat 4 s after the first arrival's beat (8.2) */
    if (!S.armed && m.kind === 'arrive') { S.armed = true; S.firstAt = performance.now() + 4000 * M.speed(); S.ticks = 0; }
  });
  /* a usage.tick: the demo engine's metronome. Ticks of other demo actions (closer than half a period) are not counted. */
  function onTick() {
    if (!S.on || !enabled) return;
    var now = performance.now(), period = 2000 / demoSpeed();
    if (now - S.lastTick < period * 0.5) return;
    S.lastTick = now;
    if (H.on) { hourTick(); return; }
    if (!S.armed || !usageShown() || document.hidden) return;
    if (S.firstAt && now < S.firstAt - period * 0.5) return;
    var due = S.firstAt ? (S.firstAt = 0, true) : (++S.ticks >= 3);
    if (!due && S.pending && !heldBy()) { flush(); return; }
    if (!due) return;
    S.ticks = 0;
    advance();
  }
  /* one step of the script: the deltas apply now; the page patches now or, while held, at the end of the hold */
  function advance(index) {
    var L = PMU.data && PMU.data.live; if (!L || !L.apply) return null;
    var i = index != null ? index : (L.next ? L.next(overlay) : 0);
    if (i == null || i < 0) return null;
    var info = null;
    try { info = L.apply(overlay, i); } catch (error) { console.error('[pm-usage] live apply', error); return null; }
    if (!info) return null;
    var p = S.pending || { shares: {}, lead: [], beats: [] };
    (info.shares || []).forEach(function (k) { p.shares[k] = true; });
    p.lead = (info.lead || []).concat(p.lead);
    p.beats.push(info.beat != null ? info.beat : i);
    S.pending = p;
    var why = heldBy();
    if (why && index == null) { p.held = why; return info; }
    flush();
    return info;
  }
  /* the patch of a beat (film.liveBeat): cards that show a changed reading update in place (in view first), the lead
     flashes and sweeps, the indicator pulses; Reduce Motion writes final (content's patch honours it) */
  function flush() {
    var p = S.pending; if (!p) return null;
    S.pending = null;
    var t0 = performance.now(), anims = [];
    var board = document.getElementById('pmuBoard'), keys = Object.keys(p.shares);
    var cards = [], leadRect = null;
    if (board && keys.length) {
      var all = PMU.board && PMU.board.cardsNow ? PMU.board.cardsNow() : Array.prototype.slice.call(board.querySelectorAll(':scope > .pmu-card'));
      all.forEach(function (c) {
        var hit = keys.some(function (k) { return c.querySelector('[data-share="' + cssq(k) + '"], [data-share-v="' + cssq(k) + '"]'); })
          || (c.getAttribute('data-live') && keys.some(function (k) { return c.getAttribute('data-live').split(' ').some(function (pre) { return pre && k.indexOf(pre) === 0; }); }));
        if (hit) cards.push(c);
      });
      cards.sort(function (a, b) { return (PMU.board.inView(b) - PMU.board.inView(a)) || (+a.dataset.y - +b.dataset.y) || (+a.dataset.x - +b.dataset.x); });
      /* the lead's place is read before anything is written (one read, clean layout) */
      leadRect = lead(board, p.lead);
    }
    pulse();
    /* an alert arriving rolls the rail's Attention count (WOW-SPEC-3 8.3) */
    if (keys.some(function (k) { return k.indexOf('alert:') === 0; }) && PMU.shell && PMU.shell.navCount) { try { PMU.shell.navCount(true); } catch (error) {} }
    var rec = { beats: p.beats, at: Math.round(performance.now()), held: p.held || null, cards: cards.map(function (c) { return c.getAttribute('data-widget'); }),
      shares: keys, ms: 0, slices: 0, anims: 0 };
    log.push(rec); if (log.length > 200) log.shift();
    S.count++;
    try { performance.mark('pmu-live-beat'); } catch (error) {}
    /* the patches run in slices of about 6 ms, the cards in view first (content's request: a beat touching 3-5 cards was
       one 15-25 ms task on the VM); the lead's light comes with the first slice */
    var list = cards.slice(), first = true;
    function step() {
      var ts = performance.now();
      M.track(anims);
      try {
        var run = function () { while (list.length && (first || performance.now() - ts < 6)) { var c = list.shift(); first = false; try { if (c.isConnected) PMU.cards.update(c, 'live'); } catch (error) { console.error('[pm-usage] live patch', error); } } };
        if (PMU.board && PMU.board.fitSliced) PMU.board.fitSliced(run); else run();
      } finally { M.track(null); }
      if (leadRect && !M.reduced()) { PMU.film.lightAt(leadRect, {}); leadRect = null; }
      rec.ms = +(rec.ms + performance.now() - ts).toFixed(2); rec.slices++; rec.anims = anims.length;
      if (list.length) requestAnimationFrame(step);
    }
    step();
    return rec;
  }
  function cssq(v) { return window.CSS && CSS.escape ? CSS.escape(v) : String(v).replace(/"/g, '\\"'); }
  var LEAD_HOST = '.pmu-kpicell, .pmu-kpi, .pmu-lrow, .pmu-accrow, .pmu-skycol, .pmu-budgethero, .pmu-herohead, .pmu-qrow, .pmu-agline, .pmu-ladrow, .pmu-rk';
  function lead(board, keys) {
    if (M.reduced()) return;
    for (var i = 0; i < keys.length; i++) {
      var list = board.querySelectorAll(':scope > .pmu-card [data-share="' + cssq(keys[i]) + '"], :scope > .pmu-card [data-share-v="' + cssq(keys[i]) + '"]');
      for (var j = 0; j < list.length; j++) {
        var c = list[j].closest('.pmu-card');
        if (!c || !PMU.board.inView(c)) continue;
        var host = list[j].closest(LEAD_HOST) || list[j];
        /* the flash and (with a GPU) the sweep are drawn at this rect after the patch (without a GPU the sweep drops, 10.3) */
        return PMU.film.rectIn(host);
      }
    }
    return null;
  }
  /* the Live indicator: one pulse per beat (ring .6 -> 2.2, .5 -> 0, 600 OUT); Retro blinks in two steps, NieR inverts */
  function pulse() {
    if (M.reduced()) return;
    var ring = document.querySelector('#pmuLiveCtl .pmu-livepulse'); if (!ring || !ring.getClientRects().length) return;
    var f = M.family();
    if (f === 'retro' || f === 'nier') M.animate(ring, [{ opacity: 1 }, { opacity: 0 }], { dur: 240, easing: 'steps(2,jump-none)' });
    else M.animate(ring, [{ transform: 'scale(.6)', opacity: 0.5 }, { transform: 'scale(2.2)', opacity: 0 }], { dur: 600, easing: 'cubic-bezier(.22,.8,.28,1)' });
  }

  /* ---- the control in the rail head (8.5): dot + "Live" / ring + "Paused"; click toggles, the chevron opens the menu ---- */
  function word(on) {
    var f = M.family();
    return f === 'retro' ? (on ? '[LIVE]' : '[HOLD]') : f === 'nier' ? (on ? 'LIVE' : 'STANDBY') : t(on ? 'live.on' : 'live.paused');
  }
  function syncCtl() {
    var ctl = document.getElementById('pmuLiveCtl'); if (!ctl) return;
    if (!enabled) { ctl.hidden = true; return; }
    ctl.hidden = false;
    ctl.setAttribute('data-state', S.on ? 'on' : 'paused');
    var btn = document.getElementById('pmuLiveBtn'), w = ctl.querySelector('.pmu-liveword');
    if (btn) { btn.setAttribute('aria-pressed', S.on ? 'true' : 'false'); btn.setAttribute('data-pm-hover-label', t('live.tag_title')); btn.setAttribute('data-pm-hover-detail', t(S.on ? 'live.tag_on' : 'live.tag_paused')); }
    var txt = word(S.on); if (w && w.textContent !== txt) w.textContent = txt;
  }
  function setOn(on, source) {
    if (!enabled) return false;
    on = !!on;
    if (S.on === on) { syncCtl(); return true; }
    S.on = on;
    if (source !== 'url') STORE.set(STORE_KEY, on ? 'on' : 'paused');
    if (on) { S.ticks = 0; if (!S.armed && usageShown()) { S.armed = true; } }
    else S.pending = null;
    syncCtl();
    try { viewAction('view.usage.live_' + (on ? 'resumed' : 'paused'), { source: source || 'control' }); } catch (error) {}
    return true;
  }
  function menuSpec() {
    var rows = [{ value: 'on', label: t('live.menu_on'), sub: t('live.menu_on_sub'), active: S.on }, { value: 'off', label: t('live.menu_off'), sub: t('live.menu_off_sub'), active: !S.on }];
    if (PMU.live.hour && PMU.live.hour.available()) {
      rows.push({ divider: true });
      if (PMU.live.hour.running()) rows.push({ value: 'now', label: t('live.menu_now'), sub: t('live.menu_now_sub'), icon: 'refresh', action: true });
      else rows.push({ value: 'hour', label: t('live.menu_hour'), sub: t('live.menu_hour_sub'), icon: 'clock', action: true });
    }
    return { id: 'live', title: t('live.menu_title'), current: S.on ? t('live.on') : t('live.paused'), align: 'start', width: 300, rows: rows, foot: t('live.menu_foot'),
      onPick: function (v) {
        if (v === 'on' || v === 'off') setOn(v === 'on', 'menu');
        else if (v === 'hour' && PMU.live.hour) PMU.live.hour.play();
        else if (v === 'now' && PMU.live.hour) PMU.live.hour.back();
      } };
  }
  var app = document.getElementById('pmuApp');
  if (app) app.addEventListener('click', function (event) {
    var b = event.target.closest('#pmuLiveBtn, #pmuLiveMenu');
    if (!b) return;
    event.stopPropagation();
    if (b.id === 'pmuLiveBtn') setOn(!S.on, 'control');
    else if (PMU.menu) PMU.menu.toggle(b, menuSpec());
  });
  if (PMU.theme && PMU.theme.onChange) PMU.theme.onChange(syncCtl);
  /* subscribe when Usage first shows (the demo engine may boot after this script) */
  var panel = document.getElementById('panel-usage');
  if (panel) new MutationObserver(function () { if (panel.classList.contains('active')) { subscribe(); syncCtl(); } }).observe(panel, { attributes: true, attributeFilter: ['class'] });
  subscribe(); syncCtl();

  /* ---- 8.6 "Play the next hour" (flag playHour, phase 2): the demo clock runs one demo minute per real second for one demo
     hour on the 2 s tick (two demo minutes a tick, 30 ticks); each tick the hour's script (content, PMU.data.live.hourStep)
     adds its readings and events to the overlay and the cards patch as in a beat; relative times read the demo clock
     (PMU.clock) and update as plain text. The head shows "Demo time HH:MM" while the demo clock is not now. At the end the
     page stays at demo time + 1 h until "Back to now" (the fixture state again, with a 200 ms board cross-fade). Offered
     only when the hour's script exists. ---- */
  var H = { on: false, step: 0, done: false };
  function hourAvailable() { return enabled && !!(PMU.flags && PMU.flags.playHour) && !!(PMU.data && PMU.data.live && PMU.data.live.hourStep); }
  function hourLabel() { return t('live.demo_time', { time: PMU.fmt && PMU.fmt.clock ? PMU.fmt.clock(PMU.clock.now()) : '' }); }
  function hourPlay() {
    if (!hourAvailable()) return false;
    if (!S.on) setOn(true, 'hour');
    H.on = true; H.step = 0; H.done = false;
    try { viewAction('view.usage.demo_hour_started', {}); } catch (error) {}
    hourTick();
    return true;
  }
  function hourTick() {
    if (!H.on) return;
    if (H.step >= 30) { H.on = false; H.done = true; syncHead(); return; }
    H.step++;
    PMU.clock.advance(120000);
    var info = null;
    try { info = PMU.data.live.hourStep(overlay, PMU.clock.now(), H.step); } catch (error) { console.error('[pm-usage] demo hour', error); }
    var p = S.pending || { shares: {}, lead: [], beats: [] };
    ((info && info.shares) || []).forEach(function (k) { p.shares[k] = true; });
    p.lead = ((info && info.lead) || []).concat(p.lead);
    p.beats.push('hour:' + H.step);
    S.pending = p;
    syncHead();
    if (!heldBy()) flush();
  }
  function hourBack() {
    H.on = false; H.done = false; H.step = 0;
    PMU.clock.reset();
    var L = PMU.data && PMU.data.live; if (L && L.reset) L.reset(overlay);
    S.pending = null;
    if (window.PM7_USAGE && PM7_USAGE.rerender) PM7_USAGE.rerender();
    var board = document.getElementById('pmuBoard');
    if (board && !M.reduced()) M.animate(board, [{ opacity: 0.35 }, { opacity: 1 }], { dur: 200, easing: 'cubic-bezier(.22,.8,.28,1)' });
    syncHead();
    try { viewAction('view.usage.demo_hour_back', {}); } catch (error) {}
    return true;
  }
  function syncHead() { if (PMU.shell && PMU.shell.fitDesc) PMU.shell.fitDesc(); }

  PMU.live = {
    hour: { play: hourPlay, back: hourBack, running: function () { return H.on || H.done || PMU.clock.demo(); }, label: hourLabel, available: hourAvailable, step: function () { return H.step; } },
    overlay: overlay,
    T: { beatGap: 6000 },
    on: function () { return S.on; },
    enabled: function () { return enabled; },
    held: heldBy,
    pause: function () { return setOn(false, 'api'); },
    resume: function () { return setOn(true, 'api'); },
    /* beat(i): play script beat i now (harnesses; holds other than a hidden page do not apply) */
    beat: function (i) { if (!enabled) return null; subscribe(); var info = advance(i == null ? undefined : i); if (S.pending && usageShown()) flush(); return info ? log[log.length - 1] || null : null; },
    flush: flush,
    log: log,
    state: function () { return { enabled: enabled, on: S.on, held: heldBy(), pending: !!S.pending, ticks: S.ticks, beats: S.count, armed: S.armed, subscribed: S.subscribed, overlay: JSON.parse(JSON.stringify(overlay)) }; },
    reset: function () { var L = PMU.data && PMU.data.live; if (L && L.reset) L.reset(overlay); else Object.keys(overlay).forEach(function (k) { delete overlay[k]; }); S.pending = null; S.ticks = 0; if (window.PM7_USAGE && PM7_USAGE.rerender && usageShown()) PM7_USAGE.rerender(); return true; },
    sync: syncCtl
  };
})();
