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
    glass: { name: 'depth', from: 'translateY(24px) scale(1.03)', dist: 24, dur: 720, ease: E.depth, fade: T.fade, fadeEase: E.out, row: 45, col: 25, blur: 10 },
    retro: { name: 'type', from: 'translateY(16px)', dist: 16, dur: 320, ease: 'steps(4,jump-start)', fade: 200, fadeEase: 'steps(2,jump-start)', row: 60, col: 15 },
    nier: { name: 'game', from: null, dist: 0, dur: 300, ease: 'steps(5,jump-start)', fade: 120, fadeEase: 'steps(3,jump-start)', row: 45, col: 30 }
  };
  function voice(f) { return VOICES[f || fam()] || VOICES.basic; }

  /* ---- the diagonal wave (3.1 Phase B): delay = base + row x rowRank + col x colRank, capped; rowRank is the rank of the
     card's top grid row among the distinct top rows, colRank its rank by x inside that row ---- */
  function wave(cards, o) {
    o = o || {};
    var v = voice(), base = o.base || 0, row = o.row == null ? v.row : o.row, col = o.col == null ? v.col : o.col, cap = o.cap == null ? T.cap : o.cap;
    var tops = [], groups = {};
    cards.forEach(function (c) { var y = +c.dataset.y || 0; if (tops.indexOf(y) < 0) tops.push(y); (groups[y] = groups[y] || []).push(c); });
    tops.sort(function (a, b) { return a - b; });
    Object.keys(groups).forEach(function (y) { groups[y].sort(function (a, b) { return (+a.dataset.x || 0) - (+b.dataset.x || 0); }); });
    cards.forEach(function (c) {
      var y = +c.dataset.y || 0, r = tops.indexOf(y), k = groups[y].indexOf(c);
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
      if (f === 'glass' && !soft()) { a[0].filter = 'blur(' + v.blur + 'px)'; a[1].filter = 'blur(0px)'; }
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
    var parts = card.querySelectorAll(':scope > .pmu-cardhead, :scope > .pmu-cardbody');
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
    var wrap = H('i', 'pmu-film-glint', card), band = H('i', '', wrap);
    var a = anim(band, [{ transform: 'translateX(-120%) skewX(-20deg)', opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.7 }, { transform: 'translateX(320%) skewX(-20deg)', opacity: 0 }],
      { dur: 900, delay: d, easing: E.depth, fill: 'both' });
    gone(a, wrap);
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
    if (el._pmuOdo) el._pmuOdo.cancel(true);
    var fin = format(to);
    var first = o.from == null || o.from === 0 && !o.change;
    var prev = first ? null : format(o.from);
    if (reduced() || !DIG.test(fin) || (!first && prev === fin)) { el.textContent = fin; return { cancel: function () {} }; }
    var f = fam();
    if (f === 'nier') return decode(el, fin, { delay: o.delay || 0, from: prev });
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
    var handle = { cancel: function (keep) { anims.forEach(function (a) { try { a.cancel(); } catch (e) {} }); done(); } };
    function done() { if (el._pmuOdo !== handle) return; el._pmuOdo = null; el.classList.remove('pmu-odo'); el.textContent = fin; }
    el._pmuOdo = handle;
    if (!last) { done(); return handle; }
    last.finished.then(function () { later(done); }, function () {});
    return handle;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---- NieR decode (5): glyphs cycle every 30 ms and lock left to right, 35 ms per character, at most 420 ms; the final
     characters are exact (never zero-first) ---- */
  var GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%$/+';
  function decode(el, text, o) {
    o = o || {};
    if (!el) return { cancel: function () {} };
    if (el._pmuDecode) el._pmuDecode.cancel();
    if (reduced() || !text) { el.classList.remove('pmu-dec-wait'); el.textContent = text; return { cancel: function () {} }; }
    var n = text.length, per = Math.min(35, 420 / Math.max(1, n)), total = per * n + 60, lastBucket = -1;
    function glyphs(ms, bucket) {
      var out = '';
      for (var i = 0; i < n; i++) {
        var ch = text[i];
        out += ms >= (i + 1) * per || /\s/.test(ch) ? ch : GLYPHS[(i * 7 + bucket * 13) % GLYPHS.length];
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
    if (reduced() || !wrap || !inner || off.comet) return null;
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
    if (reduced() || !track || off.head) return null;
    var g = H('i', 'pmu-film-head', track);
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
    if (reduced() || !el) return null;
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
    if (reduced() || !el) return null;
    var g = H('i', 'pmu-film-flash', el);
    if (o.tone) g.setAttribute('data-tone', o.tone);
    var nier = fam() === 'nier';
    var a = anim(g, [{ opacity: 0 }, { opacity: nier ? 1 : 0.55, offset: nier ? 0.01 : 0.22 }, { opacity: nier ? 1 : 0.55, offset: nier ? 0.3 : 0.3 }, { opacity: 0 }],
      { dur: nier ? 180 : T.flash, delay: o.delay || 0, easing: nier ? 'steps(2,jump-start)' : E.out, fill: 'both' });
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

  /* ---- the held-then-release hook: while a board is held, a card's inner entrance (kind.enter) waits in a queue and
     runs at release with the card's final wave delay + 160 ---- */
  var hold = null;
  function holding() { return !!hold; }
  function cue(card, fn) {
    if (hold && card && hold.board.contains(card)) {
      hold.queue = hold.queue.filter(function (q) { return q.card !== card; });   /* a card rendered again keeps one entrance */
      hold.queue.push({ card: card, fn: fn });
      return;
    }
    if (card && !innerOn(card)) return;   /* final as rendered (PERF-3: quiet supporting plate, or outside the viewport) */
    try { fn((card && card._pmuEnterDelay || 0) + T.inner); } catch (error) { console.error('[pm-usage] film cue', error); }
  }
  /* the queued inner entrances run in reading order in chunks of about 10 ms per frame (the release frame stays short on
     the CPU-only VM); a cue that runs a frame or two after the release takes the elapsed time off its delay, so the
     choreography keeps its timeline */
  function flushCues(list, t0) {
    var q = list.filter(function (c) { return innerOn(c.card); }), start0 = t0 || performance.now();
    /* the no-GPU profile releases every queued entrance in the release task (only the hero's remain): no JS in the
       frames of the moment, so the compositor runs it without main frames */
    if (soft()) { q.forEach(function (c) { if (c.card.isConnected) try { c.fn((c.card._pmuEnterDelay || 0) + T.inner); } catch (error) { console.error('[pm-usage] film cue', error); } }); return; }
    function chunk() {
      var start = performance.now(), elapsed = (start - start0) / M.speed();
      while (q.length && performance.now() - start < 10) {
        var c = q.shift();
        if (!c.card.isConnected) continue;
        try { c.fn(Math.max(0, (c.card._pmuEnterDelay || 0) + T.inner - elapsed)); } catch (error) { console.error('[pm-usage] film cue', error); }
      }
      if (q.length) requestAnimationFrame(chunk);
    }
    chunk();
  }

  /* ---- per-room signature beats (4): a room registers one; it runs once after the room's plates have entered ---- */
  var beats = {};
  function beat(room, fn) { beats[room] = fn; }
  function playBeat(room, cards) {
    var fn = beats[room]; if (!fn || reduced()) return;
    var last = 0; cards.forEach(function (c) { last = Math.max(last, c._pmuEnterDelay || 0); });
    try { fn({ room: room, cards: cards, last: last, inner: T.inner }); } catch (error) { console.error('[pm-usage] film beat ' + room, error); }
  }
  /* Overview (implemented reference): when the KPI strip has rolled, one light crosses the five tiles left to right */
  beat('overview', function (b) {
    var tiles = b.cards.filter(function (c) { return c.getAttribute('data-kind') === 'kpi' && +c.dataset.y === 0; })
      .sort(function (a, z) { return (+a.dataset.x) - (+z.dataset.x); });
    var startAt = 0; tiles.forEach(function (c) { startAt = Math.max(startAt, (c._pmuEnterDelay || 0) + T.inner + 900); });
    tiles.forEach(function (c, i) { sweep(c, { delay: startAt + 70 * i, dur: T.sweep }); });
  });

  /* ---- the shell's power-on (3.1 Phase A): rail rows, brand, ink, title, head controls and the key light ---- */
  function shellIntro(app) {
    if (off.shell) return;
    var f = fam(), stepped = f === 'retro' || f === 'nier', ease = stepped ? 'steps(3,jump-start)' : E.out;
    /* the key light blooms only with a GPU: it is the one full-stage layer, and its bloom alone costs the software
       compositor 11-15 ms per frame (PERF-3, vizlab); without a GPU it shows at rest */
    key({ bloom: !soft() });
    var brand = app.querySelector('.pmu-brand');
    if (brand) anim(brand, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { dur: T.title, delay: 40, easing: ease });
    Array.prototype.forEach.call(app.querySelectorAll('#pmuNav > .pmu-navbtn'), function (b, i) {
      anim(b, [{ opacity: 0, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'none' }], { dur: T.rail, delay: 40 + T.railStep * i, easing: ease });
    });
    var ink = document.getElementById('pmuNavInk');
    if (ink) anim(ink, [{ scale: '1 0', opacity: 0 }, { scale: '1 1', opacity: 1 }], { dur: 280, delay: 200, easing: stepped ? 'steps(3,jump-start)' : E.settle });
    if (f !== 'nier') {
      var tb = app.querySelector('.pmu-titleblock');
      if (tb) anim(tb, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { dur: T.title, delay: 60, easing: ease });
    }
    Array.prototype.forEach.call(app.querySelectorAll('.pmu-headctl > *'), function (c, i) {
      anim(c, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { dur: T.rail, delay: 120 + T.headStep * i, easing: ease });
    });
  }

  /* ---- release a held board: the wave, the plates, the queued inner entrances and the room's beat, all created in this
     one frame (the compositor runs them from here) ---- */
  function releaseHeld(h, why) {
    if (hold !== h) return;
    /* every card measured once more now that the board is final (a tile measured in an early slice can be one tier off);
       a changed card renders again and requeues its entrance */
    try { if (PMU.board && PMU.board.tierPass) PMU.board.tierPass(Array.prototype.slice.call(h.board.querySelectorAll(':scope > .pmu-card')), 'held'); } catch (error) { console.error('[pm-usage] film re-measure', error); }
    hold = null;
    try { performance.mark('pmu-film-release'); } catch (error) {}
    if (PMU.board && PMU.board.viewNow) PMU.board.viewNow(true);   /* the layout is clean here (the re-measure just read it) */
    var board = h.board, t0 = performance.now();
    var cards = Array.prototype.slice.call(board.querySelectorAll(':scope > .pmu-card'));
    /* the plates entered at the click (40-board.js mount held); the release reveals the bodies in a faster wave (30 ms per
       row, 16 per column, cap 300): each body fades in (200 OUT, one animation per body seen, PERF-3) and its instruments
       follow 160 later, so data lands on plates that are already in place */
    wave(cards, { row: 30, col: 16, cap: 300 });
    revealBodies(cards);
    flushCues(h.queue, t0);
    /* while the moment runs every plate keeps its own compositor layer (data-film, 05-film.css), so sixteen staggered
       animation ends never each drop a layer and repaint a plate into the board; the layers go once, at the end */
    board.setAttribute('data-film', '');
    board.removeAttribute('data-held');
    board.removeAttribute('data-hold-bodies');
    board.removeAttribute('data-pm-hover-exempt');
    playBeat(h.room, cards);
    /* the moment ends about 1.75 s after the release; the hover tags scan the panel then */
    var lastDelay = 0; cards.forEach(function (c) { lastDelay = Math.max(lastDelay, c._pmuEnterDelay || 0); });
    var endAt = lastDelay + T.inner + 1500;
    deferHoverTags(endAt);
    clearTimeout(filmEndT);
    filmEndT = setTimeout(function () {
      filmEndT = 0;
      later(function () { board.removeAttribute('data-film'); });
    }, endAt * M.speed());
    last = { room: h.room, at: performance.now() - h.start, why: why, cards: cards.length };
    if (PMU.board && PMU.board.settled) PMU.board.settled();
  }
  var last = null;
  /* T0: every body built, the board width stable for two frames and at least 240 ms after the click (the panel is then
     about 75 % in); 600 ms fallback once built. A class change while held rebuilds held (40-board.js). */
  function watch(h) {
    var lastW = -1, stable = 0;
    function tick() {
      if (hold !== h) return;
      var now = performance.now();
      /* no layout read until every body is built (the slices dirty the layout each frame; a read here would lay the
         board out twice per frame) */
      if (!h.built) { if ((now - h.start) / M.speed() > 4000) { releaseHeld(h, 'timeout'); return; } requestAnimationFrame(tick); return; }
      var w = h.board.clientWidth;
      stable = w > 0 && Math.abs(w - lastW) < 0.5 ? stable + 1 : 0; lastW = w;
      var t = (now - h.start) / M.speed();
      if (h.built && ((stable >= 2 && t >= 240) || t >= 600)) { releaseHeld(h, stable >= 2 ? 'stable' : 'fallback'); return; }
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

  /* ---- 3.1 the first arrival on Usage ---- */
  function arrive(o) {
    o = o || {};
    var app = document.getElementById('pmuApp'), board = document.getElementById('pmuBoard');
    if (!app || !board || !PMU.board) return;
    if (reduced() || M.paused()) { hold = null; PMU.board.mount(st.room, {}); return; }
    var h = { board: board, room: st.room, start: performance.now(), queue: [], built: false };
    hold = h;
    try { performance.mark('pmu-film-arrive'); } catch (error) {}
    deferHoverTags(4000);
    /* the app seats the Assistant beside every non-Home page in its first frame after the page change; seating it now
       gives the board its final width before the first slice, so the build never has to start over at a new board class */
    try { if (window.PM7_SHELL_ADJUSTMENTS && typeof window.PM7_SHELL_ADJUSTMENTS.seatChat === 'function') window.PM7_SHELL_ADJUSTMENTS.seatChat(); } catch (error) {}
    shellIntro(app);
    board.setAttribute('data-pm-hover-exempt', 'entering');
    PMU.board.mount(st.room, { held: true, onBuilt: function () { if (hold === h) h.built = true; } });
    watch(h);
  }
  /* a board class change while held rebuilds the board held under the same arrival (never the instant remount) */
  function rehold(onBuilt) {
    if (!hold) return null;
    hold.built = false; hold.queue = [];
    var h = hold;
    return function () { if (hold === h) h.built = true; if (onBuilt) onBuilt(); };
  }
  function cancelHold() { releaseHoverTags(); if (hold) { var h = hold; hold = null; h.board.removeAttribute('data-held'); h.board.removeAttribute('data-hold-bodies'); h.board.removeAttribute('data-pm-hover-exempt'); flushCues([]); } }

  PMU.film = { E: E, T: T, VOICES: VOICES, voice: voice, at: at, sequence: sequence, stagger: stagger, wave: wave, enterPlates: enterPlates,
    odometer: odometer, decode: decode, comet: comet, headGlow: headGlow, drop: drop, sweep: sweep, flash: flash, ring: ring, halo: halo, spring: spring,
    key: key, edgeAt: edgeAt, cue: cue, holding: holding, rehold: rehold, cancelHold: cancelHold, beat: beat, playBeat: playBeat, arrive: arrive,
    deferHoverTags: deferHoverTags, last: function () { return last; }, off: off, parsePath: parsePath, yAt: yAt,
    soft: soft, innerOn: innerOn };
})();
