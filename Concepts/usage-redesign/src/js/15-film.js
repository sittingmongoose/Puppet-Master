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
  /* the card's own board says whether it is in view (D10 3.6; PMU.boards is made by 40-board.js, after this file) */
  function inView(card) { var b = card && PMU.boards ? PMU.boards.of(card) : null; return !card || !b ? true : b.inView(card); }
  /* the cards that keep their inner entrance in a moment: on the no-GPU profile only the hero (WOW-SPEC-3 3.3: light
     and rolls belong to the hero; supporting plates arrive final); on any profile never a card outside the viewport */
  function innerOn(card) { return !!card && inView(card) && (!soft() || card.hasAttribute('data-hero')); }
  function fam() { return M.family(); }
  function anim(el, frames, o) {
    o = o || {};
    var a = M.animate(el, frames, { dur: o.dur == null ? 300 : o.dur, delay: o.delay || 0, easing: o.easing || E.out, fill: o.fill || 'backwards' });
    if (a && el.classList && el.classList.contains('pmu-card')) plateLayer(el, a);
    return a;
  }
  /* Sharp plates (Jared's note 5, 2026-10-09): a plate keeps its film layer (05-film.css: will-change under the board's
     data-film) only while its own entrance runs, not for the whole moment. Chrome keeps the raster scale a will-change
     layer took during a scaled entrance (Glass scale(1.02), a Friendly hop with scale), so a plate at rest drew its text
     from a resampled layer until the board's film window closed, about 1 s after it had landed (GPU probe at 1920: title
     sharpness 0.44-0.58 of rest in Glass, back to 1.0 the moment the window closed). Each plate animation made here
     counts on the card; when the card's last one ends (finished, finished early by a rapid switch, or cancelled) the card
     takes data-film-rest, written for every card that ended in the same 60 ms in one batch, and drops its layer. A new
     entrance takes the attribute off before it starts. Not on the no-GPU profile: its entrances are opacity only (no
     raster scale to keep) and a dropped layer would re-raster the plate on the CPU inside the moment (PERF-3). */
  var restQ = [], restT = 0;
  function flushRest() {
    restT = 0;
    var list = restQ; restQ = [];
    list.forEach(function (c) { if (!c._pmuPlateRuns && c.isConnected) c.setAttribute('data-film-rest', ''); });
  }
  function plateLayer(card, a) {
    if (soft()) return;
    if (card.hasAttribute('data-film-rest')) card.removeAttribute('data-film-rest');
    card._pmuPlateRuns = (card._pmuPlateRuns || 0) + 1;
    var end = function () {
      card._pmuPlateRuns = Math.max(0, (card._pmuPlateRuns || 1) - 1);
      if (card._pmuPlateRuns) return;
      restQ.push(card);
      if (!restT) restT = setTimeout(flushRest, reduced() ? 0 : 60);
    };
    a.finished.then(end, end);
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
  /* a speed-scaled timer, skipped under Reduce Motion (the caller writes the end state itself). While the running moment
     is held at its start (the first arrival before its page is seen: moment.wait, arriveHold) it starts with the moment */
  function at(ms, fn) {
    if (reduced()) return 0;
    var w = moment && moment.wait;
    if (w) { var t = { ms: ms, fn: fn }; w.at.push(t); return t; }
    return setTimeout(fn, Math.max(0, ms) * M.speed());
  }
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
    /* Glass: each plate enters as the lens's edge reaches its nearest point; Basic and Friendly as the cut passes its left
       side (on the click's clock: 40-board.js adds its own 90 to every plate of a room change) */
    if (o.cam && irisOn() && !reduced() && !M.paused()) {
      var ig = irisGeo();
      cards.forEach(function (c) {
        var b = cardBox(c), dx = Math.max(b.l - ig.x, 0, ig.x - (b.l + b.w)), dy = Math.max(b.t - ig.y, 0, ig.y - (b.t + b.h));
        c._pmuEnterDelay = Math.max(0, base + irisAt(Math.hypot(dx, dy)) - 90);
      });
      return cards.slice().sort(function (a, b) { return a._pmuEnterDelay - b._pmuEnterDelay; });
    }
    if (o.cam && riseOn() && !reduced() && !M.paused()) {
      var ww = boardW();
      cards.forEach(function (c) { c._pmuEnterDelay = Math.max(0, base + wipeAt(cardBox(c).l / ww) - 90); });
      return cards.slice().sort(function (a, b) { return a._pmuEnterDelay - b._pmuEnterDelay; });
    }
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
    /* a card title's nowrap spans (42-cards.js nbHyphen, item 9) come back when the decode lands */
    var html0 = el.firstElementChild && el.textContent === text ? el.innerHTML : null, land = function () { if (html0 != null) el.innerHTML = html0; else el.textContent = text; };
    if (reduced() || !text) { el.classList.remove('pmu-dec-wait'); land(); return { cancel: function () {} }; }
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
      done: function () { show(); land(); if (el._pmuDecode === handle) el._pmuDecode = null; } });
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
  /* the spare old key lights (40-board.js keyShift) and lens rims (irisRim), made with the key light, hidden: a room change
     reuses them and inserts nothing. An element inserted into the stage or the scroll pane mid-burst restyled every
     element of both rooms (the app's positional rules: about 90 ms at the second click of a 3-a-second burst, Glass
     review r3 R2); three of each cover the fades that overlap at 6 clicks a second */
  function spares(stage, keyEl) {
    var olds = stage.querySelectorAll(':scope > .pmu-film-key.pmu-key-old').length, after = keyEl.nextSibling;
    for (var i = olds; i < 3; i++) {
      var k = document.createElement('i'); k.className = 'pmu-film-key pmu-key-old'; k.setAttribute('aria-hidden', 'true'); k.style.visibility = 'hidden';
      stage.insertBefore(k, after);
    }
    var scroll = document.getElementById('pmuScroll');
    if (!scroll) return;
    for (var j = scroll.querySelectorAll(':scope > .pmu-iris').length; j < 3; j++) {
      var r = H('i', 'pmu-iris', scroll); r.setAttribute('aria-hidden', 'true'); r.style.visibility = 'hidden'; r._pmuParked = true; r._pmuAll = [];
    }
  }
  function key(o) {
    o = o || {};
    var stage = document.getElementById('pmuStage');
    if (!stage) return null;
    var el = stage.querySelector(':scope > .pmu-film-key');
    if (!el) { el = document.createElement('i'); el.className = 'pmu-film-key'; el.setAttribute('aria-hidden', 'true'); stage.insertBefore(el, stage.firstChild); }
    spares(stage, el);
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
    rerank: 420, slideOut: 220, heroInstr: 900, heroNum: 40, beatLead: 160,
    /* the warm arrival (motion QA P2-03): its bodies are built before the click, so each supporting body follows its own
       plate by warmLead (never before the hero + warmAfter) instead of waiting for a build: no plate stands empty */
    warmLead: 80, warmAfter: 40 };
  function flag(name) { return !PMU.flags || PMU.flags[name] !== false; }

  /* ======== MOTION-4 (lane b-motion, Jared's items 7 and 8): one camera you can see, and five voices that differ in kind ========
     The room change is ONE camera move: the old room (the ghost, one layer) and the new frames travel the same pan P along
     the rail with matched velocities. The ghost moves from the click and fades only when the new chrome is in (frames(),
     the chrome task), so no frame shows an empty board between the rooms. P by the distance travelled on the rail: a
     neighbour 40 px, two or three rooms 56, four or more 72 (tokens --pmu-cam-p1/p2/p3 in 00-base.css; no GPU 24, one
     board-level move). The voices differ in kind, as Retro and NieR always did (the chat's ACD-475 voices):
     Basic is ink: a crisp pan, and an ink stroke draws under each first-row head and dries.
     Friendly is hop: the old room steps back and tilts away; the new plates hop up from their feet with one soft bounce
       and a small alternating tilt (a lilting wave); warm light blooms under the hero.
     Glass is depth: a dolly through glass. Down the rail the camera pushes in (the old room holds its size, drifts and
       defocuses at the lens while the new room comes toward the viewer out of depth), up the rail it pulls out (the old
       room shrinks away defocused, the new room settles back from in front); the focus racks from the old room to the new
       room, which arrives sharp with the hero first (an arriving plate never draws through a blur); a refraction band
       crosses the board on the first arrival, the glass rod of the hand-off on a room change. The old room never grows: a board scaled above 1 makes the
       compositor raster every old plate again at a new scale, and on the first room change that is a run of GPU program
       compiles (VM trace: 20 compiles, 676 ms; the old room stood frozen about 1 s in Glass Dark 1920).
     Values never overshoot in any voice (numbers, meters, bar and ring fills land exactly on their value): springs, the
     hop and the squash move plates, marks, dots and paths only. Every blur ends at exactly 0 (fill backwards: no filter
     after the end) or dies with its layer; finishMoment ends every one at once. */
  var CAM = { dir: 1, dist: 1 };
  function camera(o) { o = o || {}; CAM = { dir: o.dir < 0 ? -1 : 1, dist: Math.max(1, Math.round(Math.abs(o.dist || 1))) }; return CAM; }
  function camP(dist) { if (soft()) return 24; var d = dist || CAM.dist; return d >= 4 ? 72 : d >= 2 ? 56 : 40; }
  /* the voices of the room change (MOTION-4 4.2). ghost: y in P units (x dir), sc / push / pull scale (never above 1),
     rot deg (x dir), blur px (Glass: the lens pass, on the old room's one layer only);
     frame: y in P units, travel ms + curve (Friendly: a spring), fade ms; wave: row / col / cap ms */
  var CAMV = {
    basic: { ghost: { y: -1, sc: 0.985, ms: 360, ease: E.slide }, fade: 180,
      frame: { y: 1, ms: 520, ease: E.settle, fade: 200 }, wave: [28, 16, 160], body: { y: 6, fade: 200, ms: 280, ease: E.settle } },
    friendly: { ghost: { y: -0.8, sc: 0.95, rot: -2.2, ms: 400, ease: 'cubic-bezier(.3,0,.5,1)' }, fade: 200,
      frame: { y: 0.9, sc: 0.94, tilt: 14, spring: [260, 21], fade: 220 }, wave: [40, 26, 280], body: { y: 10, fade: 220, ms: 320, ease: E.settle } },
    glass: { ghost: { y: -0.5, push: 1, pull: 0.94, blur: 6, ms: 400, ease: E.slide }, fade: 240,
      frame: { y: 0.35, push: 0.9, pull: 1.07, ms: 560, ease: E.depth, fade: 260 }, wave: [24, 14, 140], heroFirst: true,
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
    var a = G.el.isConnected ? anim(G.el, [{ opacity: 1 }, { opacity: 0 }], { dur: G.fadeMs, easing: E.out, fill: 'forwards' }) : null;
    G.fade = a || true;
    if (a) a.finished.then(function () { later(G.done); }, G.done); else G.done();
    /* rooms carried from a rapid switch go with it */
    if (carryQ.length && m === moment) carryOn(null, G.fadeMs);
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
  /* at the end of the current task: a reversal's 'finish' is heard once the board has retired the room that was arriving
     (a listener's fit pass would otherwise measure that room's bodies) */
  emitMoment.later = function (what, m) { Promise.resolve().then(function () { emitMoment(what, m); }); };
  function begin(kind, room) {
    var prev = moment, now0 = performance.now(), quick = kind === 'room' && !!prev && prev.kind === 'room' && now0 - prev.start < 900;
    finishMoment('next', kind === 'room' ? room : null);
    var now = performance.now();
    var m = { kind: kind, room: room, start: now, t0: now, quick: quick, released: kind !== 'arrive', entrance: true, anims: [], queue: [], rank: 0,
      heroAt: kind === 'arrive' ? 0 : T3.heroAt, timers: [], built: false, beatDone: false };
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
  function mtimer(m, ms, fn) {
    if (m.wait) { var t = { ms: ms, fn: fn }; m.wait.timers.push(t); return t; }
    var id = setTimeout(fn, Math.max(0, ms) * M.speed()); m.timers.push(id); return id;
  }
  /* a moment held at its start (moment.wait) that ends before it starts: the tweens may start again, and the end states
     its timers write (a bar's tone, a layer it removes) are written now; its own timers (the beat, its end) are dropped */
  function unwait(m) {
    var w = m && m.wait; if (!w) return;
    m.wait = null; M.hold(false);
    var panel = document.getElementById('panel-usage');
    if (panel) panel.removeAttribute('data-pmu-arrive');
    w.at.forEach(function (t) { try { t.fn(); } catch (error) {} });
  }
  function endMoment(m) {
    if (moment !== m) return;
    unwait(m);
    moment = null; M.track(null);
    /* a timer of this moment never acts in the next one (a hold release fired into the next room's entrance) */
    m.timers.forEach(clearTimeout); m.timers = [];
    root.removeAttribute('data-pmu-moment');
    dropKept();
    var board = document.getElementById('pmuBoard');
    if (board) later(function () { if (!moment) board.removeAttribute('data-film'); });
    releaseBeatHold();
    emitMoment('end', m);
  }
  /* rapid switching (6.2): the running moment ends at once in its final state (Animation.finish on everything it made;
     waiting bodies show as built) and the next moment starts from there. Nothing stacks. */
  function finishMoment(why, next) {
    var m = moment; if (!m) return;
    /* a hand-off still waiting for its painted frame plays now (and is finished below like everything else), as it did
       when it started with the chrome; a Retro or NieR erase not yet started too */
    if (m.holding) { try { handOff(m); } catch (error) { console.error('[pm-usage] hand-off', error); } }
    if (m.stepErase) { var se0 = m.stepErase; m.stepErase = null; try { se0(); } catch (error) { console.error('[pm-usage] step erase', error); } }
    var held = m.wait;
    moment = null; M.track(null);
    root.removeAttribute('data-pmu-moment');
    m.timers.forEach(clearTimeout);
    /* rapid switching (Jared #20): an old room still being cut away is carried into the next change (carryGhosts), and
       the room half laid down, which becomes the next change's ghost, keeps its entrance instead of snapping to it */
    var keep = why === 'next' ? carryGhosts(m, next) : (carryOn(null), dropKept(), null);
    m.anims.forEach(function (a) { try {
      if (keep && a.effect && keep.some(function (el) { return el.contains(a.effect.target); })) return;
      if (a.finish && a.playState !== 'finished' && a.playState !== 'idle') a.finish(); } catch (error) {} });
    if (held) { m.wait = held; unwait(m); }
    /* the old room's ghost: a fade not started yet (the new chrome never came) ends now too, so no still, blurred old room
       stays over the next one */
    /* only a fade that is still playing is finished: a ghost that is gone had its fade cancelled, and finish() on that
       cancelled fade re-applied opacity 0 to its element, which 40-board.js had just made the new live board (a click 0.9-
       2.3 s after the previous one left the whole new room invisible until the next room change) */
    if (m.ghost && !m.ghost.gone && !m.ghost.carried && m.ghost !== kept) { try { fadeGhost(m); var fa = m.ghost.fade; if (fa && fa.finish && (fa.playState === 'running' || fa.playState === 'paused')) fa.finish(); } catch (error) {} }
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
  /* ---- never an empty board (P2-03 item 2): a room change's hand-off (the old room's cut, lens, fade or erase, and the new
     plates' rise) starts at the new room's first painted frame, not when its chrome is inserted. The chrome and the first
     build slice (the hero's body first) go in under data-plate-hold: the plates at opacity .004 on their film layers, the
     bodies built in the hold drawn inside them (05-film.css), so the GPU rasters the new room unseen while the old room
     stands. Two animation frames later (the second runs only once the frame that drew them is activated: the compositor
     sends no main frame before that) or at HOLD_CAP ms, whichever is first, the hold lifts and the hand-off plays in the
     look's own voice on the moment's clock (the plates' delays less the time held; a late hand-off moves the clock as
     before). A body built in the hold is revealed at the hand-off at its slot. Retro and NieR erase the old room at the
     hand-off too (their erase ran on the click's clock: on a slow first slice the board stood empty). Anything that ends
     the moment first (a rapid click, leaving the page, Reduce Motion) hands off at once, so what follows is unchanged.
     Not on the no-GPU profile (no ghost: the old room goes with the new chrome in one batch) and not under Reduce Motion
     (calmSwap swaps whole rooms). ?pmu-hold=0 leaves it out (A/B). ---- */
  var HOLD_CAP = 300, HOLD_OFF = /[?&]pmu-hold=0(?:&|#|$)/.test(location.search);
  function painted(m, fn, cap) {
    if (document.hidden || M.paused()) { fn(); return; }
    var ran = false, go = function () { if (ran) return; ran = true; fn(); };
    requestAnimationFrame(function () { requestAnimationFrame(go); });
    mtimer(m, cap, go);
  }
  function holdOn(m, cards, o) {
    if (!m || m.kind !== 'room' || !o.dir || o.handoff || m.handed || HOLD_OFF || kept || soft() || reduced() || M.paused() || !cards || !cards.length) return false;
    return !!m.stepErase || !!(m.ghost && !m.ghost.gone && !m.ghost.fade);
  }
  function handOff(m) {
    var h = m && m.holding; if (!h) return;
    m.holding = null; m.handed = true;
    var cards = h.cards.filter(function (c) { return c.isConnected; });
    if (moment !== m) { cards.forEach(function (c) { c.removeAttribute('data-plate-hold'); }); return; }
    var held = (performance.now() - h.at) / M.speed();
    m.holdMs = Math.round(held);
    cards.forEach(function (c) { c.removeAttribute('data-plate-hold'); c._pmuEnterDelay = Math.max(0, (c._pmuEnterDelay || 0) - held); });
    frames(cards, Object.assign({}, h.o, { handoff: true }));
    var built = m.heldBodies || []; m.heldBodies = null;
    built.forEach(function (c) { if (c.isConnected) bodyBuilt(c); });
  }
  function frames(cards, o) {
    var m = moment;
    o = o || {};
    if (holdOn(m, cards, o)) {
      m.holding = { cards: cards.slice(), o: o, at: performance.now() }; m.heldBodies = [];
      cards.forEach(function (c) { c.setAttribute('data-plate-hold', ''); });
      painted(m, function () { handOff(m); }, HOLD_CAP);
      return;
    }
    /* Retro and NieR: the old room's erase starts here (ghost) */
    if (m && m.stepErase) { var se = m.stepErase; m.stepErase = null; se(); }
    /* the new chrome is in: the old room leaves now (MOTION-4 RC2: never earlier, so no empty board), wiped away at the
       hand-off's edge where the voice has one (Jared #3: a fade let the new headings draw over a dimmed old room for up to
       650 ms on a slow frame), else faded */
    var lens = !!o.dir && irisOn() && !reduced() && !M.paused(), cut = !!o.dir && !!riseOn() && !reduced() && !M.paused();
    /* the new room is on screen from here (a click from now on hands this room over, not the one before it) */
    if (m && cards && cards.length) m.framed = true;
    /* a late build (Jared #20: "the page change animation is not smooth"). The cut and the lens run on the click's clock,
       and the new room's chrome can come several hundred ms after the click (P1000 films: the board's build holds the main
       thread), when the whole hand-off was already due: the old room went in one frame and the new one stood there as
       empty frames. When the chrome comes later than a third of the way into the hand-off, the moment's clock moves on so
       the hand-off resumes from there (m.t0: the cut or lens, its rim, the plates' rise, the bodies' reveals and the beat
       all keep their order). The new room shows as early as before; its hand-off plays instead of jumping. */
    if (m && (lens || cut) && !m.lagged) {
      m.lagged = true;
      /* a quick lens (lensT) always starts from its first frame: entered part way, its fast start jumped */
      var V0 = lens ? lensT() : riseOn(), late = since(m) - (V0.at + (lens && m.quick ? 0 : V0.ms / 3));
      if (late > 0) {
        m.t0 += late * M.speed(); m.lag = late;
        var ig0 = lens ? irisGeo() : null, w0 = boardW(), now0 = since(m);
        /* the plates' rise on the moved clock (40-board.js timed them from the click: at = max(90, when the edge reaches them)) */
        (cards || []).forEach(function (c) {
          var b = cardBox(c), due = lens ? irisAt(Math.hypot(Math.max(b.l - ig0.x, 0, ig0.x - (b.l + b.w)), Math.max(b.t - ig0.y, 0, ig0.y - (b.t + b.h)))) : wipeAt(b.l / w0);
          c._pmuEnterDelay = Math.max(0, Math.max(90, due) - now0);
        });
      }
    }
    /* under a room kept on screen (keepRoom) the change's own ghost goes at once and no cut or lens plays */
    if (kept && m && m.ghost && !m.ghost.gone) dropNow(m.ghost);
    if (m && m.ghost && !m.ghost.fade && !(lens && irisGhost(m, since(m))) && !(cut && wipeGhost(m, since(m)))) fadeGhost(m);
    if (carryQ.length) carryOn((lens || cut) && m ? since(m) : null);
    if (reduced() || M.paused() || !cards || !cards.length || off.plates) return;
    /* a plate the lens or the cut uncovers starts at half its opacity, so the uncovered board is the new room at once (a
       plate from 0 showed the wallpaper through Glass, or the empty stage, for a frame or two) */
    if (lens || cut) o.from = Math.max(o.from || 0, 0.5);
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
    /* the room change's light on the click's clock (the hand-off; NieR's glitch); the first arrival keeps Glass's band */
    if (dir) { var el0 = m ? since(m) : 0; if (f === 'nier') glitch(o.board, el0); else if (lens && !kept) irisRim(o.board, el0); }
    else if (cam && f === 'glass') refract(1, base + 100);
    if (f === 'retro' && o.scan !== false) scanBar(o.board || (cards[0] && cards[0].parentNode), base);
  }

  /* ---- film.reveal (5 Phases B and C): a held body appears. The hero: opacity 160 OUT, then its queued instruments with
     all the light (its number 40 later). A supporting body {quiet: true}: one animation (opacity 200 OUT + 6 px 280
     SETTLE; the fade only without a GPU), its values final, its charts drawn quietly. The hold is the card's
     data-body-wait (an opacity hold, never visibility: PERF-3 rule 3); it is lifted in the same task the reveal is made.
     o.bodyAt: the body's own entrance starts then instead of at o.delay (the warm arrival's hero: its body comes in with
     its plate, its instruments and light at their time; P2-03 final). */
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
    var d = Math.max(0, o.delay || 0), bd = o.bodyAt != null ? Math.max(0, Math.min(d, o.bodyAt)) : d;
    card._pmuEnterDelay = d;
    if (reduced() || M.paused() || !inView(card)) return;   /* final as rendered (outside the viewport: PERF-3 rule 9) */
    var body = card.querySelector(':scope > .pmu-cardbody'), f = fam(), stepped = f === 'retro' || f === 'nier';
    if (body) {
      if (f === 'nier' && !o.quiet && !soft()) {
        anim(body, [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { dur: 300, delay: bd, easing: 'steps(5,jump-start)' });
        var scan = H('i', 'pmu-film-scan', card);
        gone(anim(scan, [{ transform: 'translateY(0%)', opacity: 1 }, { transform: 'translateY(100%)', opacity: 1, offset: 0.98 }, { transform: 'translateY(100%)', opacity: 0 }],
          { dur: 300, delay: bd, easing: 'steps(5,jump-start)', fill: 'both' }), scan);
      } else if (o.quiet && !soft() && !stepped) {
        /* a supporting body in its voice (MOTION-4 4.2): Basic 6 px, Friendly 10 px (settles, no overshoot), Glass from .985 */
        var bv = camVoice(f).body || CAMV.basic.body;
        anim(body, combo(bv.ms, { ms: bv.fade, ease: E.out }, { ms: bv.ms, ease: bv.ease }, bv.sc ? { sc: bv.sc } : { y: bv.y }, 8), { dur: bv.ms, delay: bd, easing: 'linear' });
      } else {
        anim(body, [{ opacity: 0 }, { opacity: 1 }], { dur: stepped ? 120 : o.quiet ? T3.quietFade : 160, delay: bd, easing: stepped ? 'steps(' + (o.quiet ? 2 : 3) + ',jump-start)' : E.out });
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
    /* a room change still holding for its first painted frame: revealed at the hand-off */
    if (m.holding && m.heldBodies) { if (m.heldBodies.indexOf(card) < 0) m.heldBodies.push(card); return; }
    if (!m.released) { if (hero && hold) hold.hero = true; return; }
    var slot = hero ? m.heroAt
      : !flag('heroRoll') ? m.heroAt + Math.min(T3.quietCap, T3.quietStep * (m.rank++)) : m.quietAt + Math.min(T3.quietCap, T3.quietStep * (m.rank++));
    /* the real reveal time (a body built after its slot reveals at once): the signature beat reads it */
    card._pmuRevealAt = Math.max(slot, since(m));
    reveal(card, { quiet: !hero && flag('heroRoll'), delay: Math.max(0, slot - since(m)) });
  }
  /* every first-screen body of the moment is built: its signature beat when the hero's instruments end (the arrival
     about T0 + 940, a room change about 1140 after the click), and the moment's end about 900 after that */
  function allBuilt(room, cards) {
    var m = moment; if (!m || m.room !== room || m.beatDone) return;
    if (kept && !kept.gone && kept.room === room) { swapKept(m); return; }
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
      g._pmuRevived = false;
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
    /* this ghost's life: a reversal (reverse) or a newer ghost of the same element makes this one's end a no-op */
    var gen = g._pmuGen = (g._pmuGen || 0) + 1;
    var f = fam(), dir = o.dir || 1, base = o.sTop ? 'translateY(' + (-o.sTop) + 'px)' : '', a, gAnims = [], deferred = null;
    if (soft()) a = anim(g, [{ opacity: 1, transform: base || 'none' }, { opacity: 0, transform: base || 'none' }], { dur: T3.ghostFade, easing: E.exit, fill: 'forwards' });
    else if (f === 'retro' || f === 'nier') {
      var n = f === 'nier' ? 8 : 8, ms = f === 'nier' ? 200 : 180;
      var erase = function () {
        var e = anim(g, [{ clipPath: 'inset(0 0 0 0)', transform: base || 'none' }, { clipPath: 'inset(100% 0 0 0)', transform: base || 'none' }], { dur: ms, easing: 'steps(' + n + ',jump-end)', fill: 'forwards' });
        var line = H('i', f === 'nier' ? 'pmu-film-scan pmu-ghostscan' : 'pmu-film-scanbar pmu-ghostscan', g);
        var lineA = anim(line, [{ transform: 'translateY(0%)', opacity: 1 }, { transform: 'translateY(100%)', opacity: 1, offset: 0.97 }, { transform: 'translateY(100%)', opacity: 0 }], { dur: ms, easing: 'steps(' + n + ',jump-end)', fill: 'both' });
        gone(lineA, line);
        return { erase: e, lineA: lineA };
      };
      var ms0 = moment;
      if (ms0 && ms0.kind === 'room' && !HOLD_OFF) {
        /* never an empty board (P2-03 item 2): the erase starts at the room change's hand-off (frames), not on the click's
           clock; the old room stands whole until then. What a click back to this room steps back stays in _pmuRev (an
           erase not started reverses from 0). The new chrome never came (an empty room): it starts on its own at 600 ms. */
        var R = g._pmuRev = { erase: null, lineA: null, ms: ms, n: n };
        deferred = function () {
          if (R.erase || g._pmuRev !== R || g._pmuRevived || g._pmuGen !== gen || !g.isConnected) return;
          /* an erase that fails still ends the ghost (only its finished promise would) */
          var x; try { x = erase(); } catch (error) { console.error('[pm-usage] step erase', error); done(); return; }
          R.erase = x.erase; R.lineA = x.lineA;
          if (x.erase) { gAnims.push(x.erase); x.erase.finished.then(function () { later(done); }, done); } else done();
        };
        ms0.stepErase = deferred;
        mtimer(ms0, 600, function () { if (!ms0.holding) deferred(); });
      } else {
        var x0 = erase(); a = x0.erase;
        /* what a click back to this room steps back (reverse; motion QA A13, Jared 2026-10-16) */
        g._pmuRev = { erase: a, lineA: x0.lineA, ms: ms, n: n };
      }
    } else {
      /* MOTION-4 RC1 / RC2 and 4.2: the camera's first half. The old room moves from the click (this task) on its voice's
         path, at full opacity: Basic pans P up the rail (-P x dir, scale .985, 360 SLIDE); Friendly steps back and tilts
         away about the visible centre (-0.8 P, scale .95, -2.2 deg x dir, 400); Glass passes the lens (push: holds its
         size, pull: .94, -0.5 P, 400) and blurs out (6 px) on a separate animation that leaves no filter behind. When the new
         chrome is in (frames()) it leaves: Basic and Friendly cut it away from its left (wipeGhost), Glass's lens opens
         through it (irisGhost); the board is never empty and no text is under two rooms. */
      var CV = camVoice(f), gv = CV.ghost, P = camP(), cy = viewCentre().y + (o.sTop || 0);
      /* never above 1 (see the Glass voice above): the old board keeps its raster scale, so no plate is rastered again */
      var sc = Math.min(1, f === 'glass' ? (dir > 0 ? gv.push : gv.pull) : gv.sc);
      var tr = { base: base, y: gv.y * P * dir, rot: gv.rot ? gv.rot * dir : 0, sc: sc, ms: gv.ms, fn: M.curve(gv.ease), out: true,
        origin: f === 'friendly' || f === 'glass' ? '50% ' + cy.toFixed(0) + 'px' : null };
      a = anim(g, camKeys(gv.ms, { tr: tr }, 14), { dur: gv.ms, easing: 'linear', fill: 'forwards' });
      var mm = moment;
      /* Glass's old room defocuses as the lens opens through it, not from the click: a room still building held the
         blurred board for 0.4 s with nothing readable (review r3) */
      if (gv.blur && !soft() && !(mm && a && irisOn(f))) gAnims.push(anim(g, [{ filter: 'blur(0px)' }, { filter: 'blur(' + gv.blur + 'px)', offset: 0.55 }, { filter: 'blur(' + gv.blur + 'px)' }], { dur: gv.ms + 200, easing: E.out, fill: 'none' }));
      if (mm && a) {
        mm.ghost = { el: g, fade: null, fadeMs: CV.fade, done: null, move: a, anims: gAnims, sTop: o.sTop || 0, blur: gv.blur && !soft() && irisOn(f) ? gv.blur : 0 };
        /* the new chrome never came (an empty room): the old room fades on its own */
        mtimer(mm, 600, function () { if (!mm.holding) fadeGhost(mm); });
      } else if (a) gAnims.push(anim(g, [{ opacity: 1 }, { opacity: 0 }], { dur: CV.fade, delay: 100, easing: E.exit, fill: 'forwards' }));
    }
    if (a) gAnims.push(a);
    var done = function () {
      if (done.ran || g._pmuGen !== gen || g._pmuRevived) return; done.ran = true;
      g._pmuRev = null;
      if (mg) mg.gone = true;
      drop(Array.prototype.slice.call(g.querySelectorAll(':scope > .pmu-card')));
      /* the old board element empties into the hidden spare (40-board.js), never leaves the scroll pane, and carries no
         animation into its next life as the live board (every one still on the element is cancelled) */
      if (o.ghost) { gAnims.concat(mg && mg.fade && mg.fade.cancel ? [mg.fade] : [], g.getAnimations ? g.getAnimations() : []).forEach(function (x) { if (x) { try { x.cancel(); } catch (error) {} } }); g.textContent = ''; g.hidden = true; g.className = 'pmu-board'; g.removeAttribute('style'); ['data-film', 'data-op', 'data-held', 'data-hold-bodies'].forEach(function (a) { g.removeAttribute(a); }); }
      else g.remove();
    };
    var mg = moment && moment.ghost && moment.ghost.el === g ? moment.ghost : null;
    if (mg) mg.done = done;
    else if (deferred) { /* its erase hooks done when it starts */ }
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

  /* ======== the room change's own moment (Jared #3, 2026-10-14) ========
     Jared's ruling of 2026-10-14 retired the shared-element flight (6.3-6.6) in every look: its flyers lifted in the click,
     waited for their targets' bodies to be built and hovered over the new room's text for 400-700 ms. In its place each
     voice hands the board over in its own way. Nothing waits for the build (the new frames come in the first frame after
     the click and the bodies reveal on the film's clock), no text is ever under two rooms, and the board is never empty:
     - Basic and Friendly: a staggered rise from the rail side. The old room is cut away from its left (WIPE, a clip with
       no light on its edge) and each new plate rises in the voice's own way as the cut passes its left side, Basic with
       its ink strokes, Friendly with its hop. A rise after a fade showed an empty board for a third of a second whenever
       the build held the main thread (P1000 films); under the cut the old room stands until the new one is there.
     - Glass: a lens opens. The new room is seen through a circle that grows from the middle of the board to its corners
       (IRIS: the old room is clipped to the board less the circle), with a glass rim on the circle's edge; outside it the
       old room still drifts and defocuses. No band crosses the board (Jared, 2026-10-11: "the side ways swipe across the
       whole screen when you change tabs can go away").
     - Retro keeps its phosphor wipe and NieR its scanline, and NieR adds a signal glitch (three ink lines in steps).
     Without a GPU the old room goes in the new chrome's frame and the board rises as one (6.2). Reduce Motion: nothing
     travels; the new room dissolves in (dissolve(), from 40-board.js calmSwap). */
  /* both start at 80 on the click's clock: 40-board.js lays no new plate before 90 */
  var WIPE = { basic: { at: 80, ms: 300, ease: 'cubic-bezier(.45,0,.25,1)' }, friendly: { at: 80, ms: 340, ease: 'cubic-bezier(.4,0,.3,1)' } },
    IRIS = { at: 80, ms: 420, ease: 'cubic-bezier(.4,.1,.2,1)', n: 48 },
    /* a change that interrupts one still handing over (about 3 clicks a second or faster) opens its lens quick: the lens
       starts when the new room's frame is in, and the slow start of the 420 ms lens kept the board on the old room for
       200-300 ms after the title had named the new one (review r3 R2, 2026-10-15: never more than one hand-off apart) */
    IRIS_QUICK = { at: 80, ms: 280, ease: 'cubic-bezier(.2,.75,.25,1)', n: 48 };
  function lensT() { return moment && moment.quick ? IRIS_QUICK : IRIS; }
  function riseOn(f) { return soft() ? null : WIPE[f || fam()] || null; }
  /* when the cut reaches the point at u of the board's width (0 on the rail side), on the click's clock */
  function wipeAt(u, f) {
    var V = riseOn(f); if (!V) return 0;
    var fn = M.curve(V.ease), p = Math.max(0, Math.min(1, u)), lo = 0, hi = 1;
    for (var i = 0; i < 16; i++) { var mid = (lo + hi) / 2; if (fn(mid) < p) lo = mid; else hi = mid; }
    return V.at + V.ms * hi;
  }
  /* the old room cut away from its left, on the click's clock */
  function wipeGhost(m, elapsed) {
    var G = m && m.ghost, V = riseOn(); if (!G || G.fade || G.gone || !V || !G.el.isConnected) return false;
    var a = anim(G.el, [{ clipPath: 'inset(0 0 0 0px)' }, { clipPath: 'inset(0 0 0 ' + boardW() + 'px)' }], { dur: V.ms, delay: V.at - (elapsed || 0), easing: V.ease, fill: 'forwards' });
    if (!a) return false;
    G.fade = a; G.cut = 'cut'; G.cutW = boardW();
    ghostFade(G, V.ms, V.at - (elapsed || 0));
    /* cancelled because it was carried into the next change (carryOn), it has a new exit and is not done */
    a.finished.then(function () { later(G.done); }, function () { if (G.fade === a && G.done) G.done(); });
    return true;
  }
  function irisOn(f) { return !soft() && (f || fam()) === 'glass'; }
  function boardW() { var cls = PMU.board && PMU.board.cls ? PMU.board.cls() : null; return cls && cls.W ? cls.W : 1200; }
  /* the lens's centre and reach in board pixels, the board at its top (no layout read) */
  function irisGeo() { var W = boardW(), c = viewCentre(); return { x: W / 2, y: c.y, R: Math.ceil(Math.hypot(W / 2, c.y)) + 24 }; }
  /* when the lens's edge reaches a point d px from its centre, on the click's clock */
  function irisAt(d) {
    var L = lensT(), g = irisGeo(), p = Math.max(0, Math.min(1, d / g.R)), fn = M.curve(L.ease), lo = 0, hi = 1;
    for (var i = 0; i < 16; i++) { var mid = (lo + hi) / 2; if (fn(mid) < p) lo = mid; else hi = mid; }
    return L.at + L.ms * hi;
  }
  /* the board less a circle of radius r, as one even-odd polygon (an outline, then the circle; polygons with the same
     points interpolate everywhere) */
  function irisClip(cx, cy, r) {
    var W = boardW(), pts = ['-40px -40px', (W + 40) + 'px -40px', (W + 40) + 'px 100000px', '-40px 100000px', '-40px -40px'];
    r = Math.max(0.5, r);
    for (var i = 0; i <= IRIS.n; i++) { var a = (i / IRIS.n) * Math.PI * 2; pts.push((cx + r * Math.cos(a)).toFixed(1) + 'px ' + (cy + r * Math.sin(a)).toFixed(1) + 'px'); }
    return 'polygon(evenodd, ' + pts.join(', ') + ')';
  }
  /* the old room under the lens, on the click's clock (its own scroll offset: the ghost keeps the old scroll position) */
  function irisGhost(m, elapsed) {
    var G = m && m.ghost; if (!G || G.fade || G.gone || !G.el.isConnected) return false;
    var g = irisGeo(), cy = g.y + (G.sTop || 0);
    var L = lensT(), a = anim(G.el, irisKeys(G, irisClip(g.x, cy, 0), 0, irisClip(g.x, cy, g.R)), { dur: L.ms, delay: L.at - (elapsed || 0), easing: L.ease, fill: 'forwards' });
    if (!a) return false;
    G.fade = a; G.cut = 'iris'; G.iris = { x: g.x, cy: cy, R: g.R };
    ghostFade(G, L.ms, L.at - (elapsed || 0));
    a.finished.then(function () { later(G.done); }, function () { if (G.fade === a && G.done) G.done(); });
    return true;
  }
  /* the lens's keyframes: the old room's clip from c0 (held to offset q) to c1, and outside the lens it defocuses to 6 px
     by the time the lens is half open. The blur is part of the lens's own animation: a separate one ran on the
     compositor and went on blurring while the lens stood still behind a busy main thread (a frosted board). In one
     animation with the clip (a main-thread property) the two always move together. */
  /* the cut and the lens are clip-path animations, which run on the main thread: while the new room's bodies build they
     stand still where they are. Alongside each one the old room fades on the compositor from just past its middle to
     a little after its end, so a stalled edge never leaves the old room (blurred, in Glass) standing for the length of
     the build: without a stall the cut or lens has finished first and the fade is never seen (review r3, P1000 film:
     the lens stood at a wide circle with blurred corners for 0.4 s). */
  function ghostFade(G, dur, delay) {
    if (!G || !G.el.isConnected || reduced()) return null;
    if (G.fadeA) { try { G.fadeA.cancel(); } catch (error) {} }
    G.fadeA = anim(G.el, [{ opacity: 1 }, { opacity: 1, offset: 0.55 }, { opacity: 0 }], { dur: dur + 140, delay: delay, easing: 'linear', fill: 'forwards' });
    return G.fadeA;
  }
  function irisKeys(G, c0, q, c1) {
    var b = G.blur && !soft() ? G.blur : 0, k = [{ clipPath: c0 }];
    if (q > 0) k.push({ clipPath: c0, offset: q });
    if (b) { k[0].filter = 'blur(0px)'; if (q > 0) k[1].filter = 'blur(0px)'; k.push({ filter: 'blur(' + b + 'px)', offset: q + (1 - q) * 0.55 }); }
    k.push(b ? { clipPath: c1, filter: 'blur(' + b + 'px)' } : { clipPath: c1 });
    return k;
  }
  /* the lens's rim: one ring in the board's scroll pane, above both rooms, scaled with the lens on the compositor.
     The rings are kept and reused, hidden once faded (as the old key lights, 40-board.js keyShift): inserting one and
     removing it changed the scroll pane's children, which laid the whole Usage page out again (100 ms in the middle of
     the next room's build on the RTX 3090; Glass review r3 R2, 2026-10-15). Moving or sizing a ring lays out only it. */
  function rimPark(ring) {
    (ring._pmuAll || []).forEach(function (x) { try { x.cancel(); } catch (error) {} });
    ring._pmuAll = []; ring._pmuA = null; ring._pmuParked = true;
    ring.classList.remove('pmu-iris-out'); ring.style.visibility = 'hidden';
  }
  function rimTrack(ring, a) {
    if (!a) { rimPark(ring); return; }
    (ring._pmuAll = ring._pmuAll || []).push(a);
    var last = function () { return !ring._pmuParked && ring._pmuAll[ring._pmuAll.length - 1] === a; };
    a.finished.then(function () { if (last()) later(function () { if (last()) rimPark(ring); }); }, function () {});
  }
  function liveRim(scroll) {
    var live = null;
    Array.prototype.some.call(scroll.querySelectorAll(':scope > .pmu-iris:not(.pmu-iris-out)'), function (r) { if (!r._pmuParked) live = r; return !!live; });
    return live;
  }
  function irisRim(board, elapsed) {
    var scroll = board && board.parentNode, stage = document.getElementById('pmuStage');
    if (!scroll || !stage || !stage.contains(board) || !irisOn() || reduced() || M.paused() || off.key) return null;
    var old = liveRim(scroll); if (old) rimPark(old);
    var g = irisGeo(), ring = null;
    Array.prototype.some.call(scroll.querySelectorAll(':scope > .pmu-iris'), function (r) { if (r._pmuParked) ring = r; return !!ring; });
    if (!ring) { ring = H('i', 'pmu-iris', scroll); ring.setAttribute('aria-hidden', 'true'); }
    ring._pmuParked = false;
    ring.style.cssText = 'left:' + (g.x - g.R) + 'px;top:' + (g.y - g.R) + 'px;width:' + (2 * g.R) + 'px;height:' + (2 * g.R) + 'px';
    var a = anim(ring, [{ transform: 'scale(.01)', opacity: 1 }, { opacity: 1, offset: 0.72 }, { transform: 'scale(1)', opacity: 0 }],
      { dur: lensT().ms, delay: lensT().at - (elapsed || 0), easing: lensT().ease, fill: 'both' });
    ring._pmuA = a;
    rimTrack(ring, a);
    return a;
  }
  /* rapid switching (Jared #20: "when you change the page quickly it breaks"; review r3, 2026-10-15: "an interrupted
     change never shows a room you have already left; a room still building never freezes the board behind frost"). At a
     click during a room change exactly one room hands over to the next: the room on screen.
     - The change had not drawn its new room yet (its frames never came): the old room is still what is on screen, so it
       stays the outgoing room, and the next change's cut or lens takes it from where it stands (carryQ, carryOn).
     - The new room had drawn: it becomes the next change's outgoing room (40-board.js makes it the ghost), and every
       room before it goes in the click's own frame (dropNow). No older room is held behind the next change, and none
       comes back.
     A click used to finish everything at once instead: the old room's uncut part vanished and the half laid down room
     snapped into place. Holding every older room until the next change's cut reached it (the first fix) showed two or
     three rooms side by side at three clicks a second, and an old room around the next lens. */
  var carryQ = [], carryT = 0;
  /* where a ghost's cut or lens stands (0-1 of its own reach): its exit holds at G.from until the eased progress passes
     G.q, then runs with it to the end */
  function cutAt(G) {
    var a = G.fade, p = a && a.effect ? a.effect.getComputedTiming().progress : null, from = G.from || 0, q = G.q || 0;
    p = p == null ? 0 : p;
    return p <= q ? from : Math.min(1, from + (p - q) / (1 - q) * (1 - from));
  }
  /* pause() takes hold at the next frame, and a room change's build holds the main thread for a few hundred ms, so a cut
     paused in the click ran on until then and its follower restarted behind it; seeking back to the click's time makes
     the freeze where it is read */
  function freeze(a) { try { var t = a.currentTime; a.pause(); if (t != null) a.currentTime = t; } catch (error) {} }
  /* a ghost's cut or lens, chosen for the look now when it has none yet (its hand-off had not begun) */
  function cutKind(G) {
    if (G.cut) return G.cut;
    if (irisOn()) { var g = irisGeo(); G.cut = 'iris'; G.iris = { x: g.x, cy: g.y + (G.sTop || 0), R: g.R }; }
    else if (riseOn()) { G.cut = 'cut'; G.cutW = boardW(); }
    return G.cut;
  }
  /* a room the click has left behind twice over goes in the click's own frame. Finishing its exit (about 150 ms) still
     showed it beside the room now leaving, and on a slow machine for the whole of the next build (review r3: "an
     interrupted change never shows a room you have already left"). Its animations stop and it turns invisible at once
     (one opacity on the ghost board, nothing restyled inside it); its element empties into the spare with the next
     batch of finished layers. */
  function dropNow(G) {
    if (!G || G.gone) return;
    G.gone = true;
    var list = [G.fade, G.move, G.fadeA].concat(G.anims || []); G.fade = null;
    list.forEach(function (x) { if (x && x !== true && x.cancel) { try { x.cancel(); } catch (error) {} } });
    if (G.el.isConnected) G.el.style.opacity = '0';
    later(function () { if (G.done) G.done(); });
  }
  /* a burst that ends on the room on screen leaves it as it is (review r3 R2): the click back to the room still on screen
     plays its cut or lens back closed (twice as fast) and keeps it over the copy the change builds under it; when that
     copy's first screen is built, its entrance ends at once and the two swap unseen (swapKept). Pointer input goes to the
     copy meanwhile. A further click hands the kept room over like any room on screen (carryGhosts). */
  var kept = null, keptT = 0;
  function keepRoom(G, room, whole) {
    var at = whole || !G.fade || G.fade === true ? 0 : cutAt(G);
    [G.fade, G.fadeA].concat(G.anims || []).forEach(function (a) { if (a && a !== true && a !== G.move) { try { a.cancel(); } catch (error) {} } });
    G.fadeA = null; G.from = 0; G.q = 0;
    /* the camera's drift goes back the way it came; the cut or lens closes from where it stands (140 OUT). Basic, Friendly
       and Glass drift back on an even ease from where they stand (settleBack: played backwards at twice its speed, the
       ease-out drift landed its last 20-37 px in one frame, motion QA A12); Retro and NieR step back as they stepped out */
    var stepped0 = fam() === 'retro' || fam() === 'nier';
    if (G.move && G.move.playState !== 'idle' && !stepped0) { var back0 = readBack(G.el); try { G.move.cancel(); } catch (error) {} G.move = writeBack(G.el, back0, { transformOnly: true, rest: G.sTop ? 'translateY(' + (-G.sTop) + 'px)' : null }).move; }
    else if (G.move && G.move.playState !== 'idle') { try { G.move.playbackRate = -2; G.move.play(); } catch (error) {} }
    var k = null;
    if (at > 0 && G.cut === 'iris' && G.iris) {
      var b = G.blur && !soft() ? G.blur * Math.min(1, at / 0.55) : 0;
      k = [{ clipPath: irisClip(G.iris.x, G.iris.cy, at * G.iris.R), filter: 'blur(' + b.toFixed(2) + 'px)' }, { clipPath: irisClip(G.iris.x, G.iris.cy, 0), filter: 'blur(0px)' }];
    } else if (at > 0 && G.cut === 'cut') {
      var W = G.cutW || boardW();
      k = [{ clipPath: 'inset(0 0 0 ' + (at * W).toFixed(1) + 'px)' }, { clipPath: 'inset(0 0 0 0px)' }];
    }
    G.fade = k ? anim(G.el, k, { dur: 140, easing: E.out, fill: 'forwards' }) : null;
    G.carried = false; G.room = room; G.el.style.zIndex = '3'; G.el.style.pointerEvents = 'none';
    /* its own end (a cut or lens finishing) must not empty it while it is kept */
    if (G.done && !G.done.keepGuard) { var done = G.done; G.done = function () { if (kept !== G) done(); }; G.done.keepGuard = true; }
    kept = G;
    clearTimeout(keptT); keptT = setTimeout(dropKept, 2600 * M.speed());   /* the copy never built: the room goes */
  }
  function dropKept() {
    clearTimeout(keptT); keptT = 0;
    var G = kept; kept = null;
    if (G && !G.gone) dropNow(G);
  }
  function swapKept(m) {
    m.beatDone = true;
    m.anims.forEach(function (a) { try { if (a.finish && a.playState !== 'finished' && a.playState !== 'idle') a.finish(); } catch (error) {} });
    releaseBeatHold();
    var board = document.getElementById('pmuBoard'), scroll = board && board.parentNode, G = kept;
    if (board) Array.prototype.forEach.call(board.querySelectorAll(':scope > .pmu-card[data-body-wait]'), function (c) { if (c.querySelector(':scope > .pmu-cardbody > *')) c.removeAttribute('data-body-wait'); });
    /* the kept room's view: the change scrolled the board to its top */
    if (G && G.sTop && scroll) scroll.scrollTop = G.sTop;
    dropKept();
    endMoment(m);
  }
  /* ======== a click back to the room still leaving (motion QA A12, 2026-10-16) ========
     Overview -> Costs -> Overview inside the hand-off kept the old room over a copy of itself that the change built under
     it: the old room's drift played backwards at twice its speed on its ease-out curve, so its last 20-37 px landed in one
     frame (Mac films: a 37 px snap), and the Costs room that had started to arrive showed through the part of the board
     the cut had uncovered. The change is reversed instead. The room the user goes back to is the room still on screen, so
     it becomes the live board again as it stands (40-board.js; nothing is built again); it drifts back from where it
     stands to rest on an even ease, about 12.5 ms per pixel its corners travel (240-720 ms: Glass's pull-back is the
     longest, about 70 px at its corners; no frame moves it much more than 2 px), its cut or lens closes from where it
     stands (180 OUT), its defocus and fade with it; the room that was arriving
     goes in the click's own frame. Retro and NieR step their erase back up the same way (A13, Jared 2026-10-16: the
     board the user never left just returns, with no erase and rebuild). */
  function stepped3(f) { return f === 'retro' || f === 'nier'; }
  function reversible(el) {
    var m = moment, G = m && m.ghost, f = fam();
    if (!el || !el.isConnected || el._pmuRevived || reduced() || soft() || M.paused() || kept) return false;
    if (carryQ.some(function (c) { return !c.G.gone && c.G.el.isConnected; })) return false;
    /* Retro and NieR: the old room is being erased from its top (its erase and scanline, no camera); it reverses while
       its cards are still there, its erase finished or not (they go a beat later, with the batch of finished layers) */
    if (stepped3(f)) return !!el._pmuRev && el.classList.contains('pmu-ghostboard') && !!el.querySelector(':scope > .pmu-card') && (!m || m.kind === 'room') && !(G && G.el === el);
    if (!m || m.kind !== 'room' || !G || G.el !== el || G.gone || G.leaving || G.carried) return false;
    if (G.fade && G.fade !== true && (G.fade.playState === 'finished' || G.fade.playState === 'idle')) return false;
    if ((m.carried || []).some(function (C) { return liveGhost(C); })) return false;
    return true;
  }
  /* where the old room stands now: one style read of its one element, before its animations go */
  function readBack(el) {
    var cs = getComputedStyle(el);
    return { tf: cs.transform, org: cs.transformOrigin, cp: cs.clipPath, fl: cs.filter, op: parseFloat(cs.opacity) };
  }
  /* how far the board's visible corners stand from rest under the transform s.tf (board pixels; no layout read) */
  function travelOf(s) {
    var m = /^matrix\(([^)]+)\)$/.exec(s.tf || ''); if (!m) return 0;
    var v = m[1].split(',').map(Number), o = String(s.org || '0 0').split(' ').map(parseFloat), W = boardW(), H = Math.max(200, (window.innerHeight || 900) - 170), d = 0;
    [[0, 0], [W, 0], [0, H], [W, H]].forEach(function (p) {
      var x = p[0] - (o[0] || 0), y = p[1] - (o[1] || 0);
      d = Math.max(d, Math.hypot(v[0] * x + v[2] * y + v[4] - x, v[1] * x + v[3] * y + v[5] - y));
    });
    return d;
  }
  /* the old room back to rest from s (readBack): the drift on an even ease (EXIT) for 12.5 ms per pixel of travel, 240-720;
     the cut, lens, defocus and fade in 180 OUT. o.shift: px the board moves down when the scroll it kept is given back
     (its keyframes start that much lower, so nothing moves on screen); o.iris: the lens it closes; o.transformOnly: the
     drift alone (keepRoom closes the cut itself); o.rest: the transform it rests at, held (a kept room keeps the scroll
     offset it left with until swapKept gives the scroll back) */
  function writeBack(el, s, o) {
    o = o || {};
    var out = { move: null, close: null, ms: 0 }, shift = o.shift ? 'translateY(' + o.shift + 'px) ' : '';
    var tf0 = (s.tf && s.tf !== 'none') ? s.tf : '';
    if (tf0 || shift) {
      var ms = Math.round(Math.max(240, Math.min(720, travelOf(s) * 12.5)));
      out.move = anim(el, [{ transform: (shift + tf0).trim() || 'none', transformOrigin: s.org }, { transform: o.rest || 'none', transformOrigin: s.org }], { dur: ms, easing: E.exit, fill: o.rest ? 'forwards' : 'none' });
      out.ms = ms;
    }
    if (o.transformOnly) return out;
    var k0 = {}, k1 = {}, any = false;
    if (s.cp && s.cp !== 'none') {
      any = true; k0.clipPath = s.cp;
      k1.clipPath = /^polygon/.test(s.cp) && o.iris ? irisClip(o.iris.x, o.iris.cy, 0) : 'inset(0px 0px 0px 0px)';
    }
    if (s.fl && s.fl !== 'none') { any = true; k0.filter = s.fl; k1.filter = 'blur(0px)'; }
    if (s.op < 0.999) { any = true; k0.opacity = s.op; k1.opacity = 1; }
    if (any) { out.close = anim(el, [k0, k1], { dur: 180, easing: E.out, fill: 'none' }); out.ms = Math.max(out.ms, 180); }
    return out;
  }
  /* the reversal itself (the board has made el its live board again): the hand-off on the old room stops where it stands
     and nothing of it may empty the board now (its done), the lens rim fades where it stands, the moment ends without
     finishing what it made (the arriving room went with its board), and the old room goes back to rest */
  /* the moment ends without finishing what it made: the arriving room went with its board */
  function dropMoment(m) {
    if (!m || moment !== m) return;
    moment = null; M.track(null);
    m.timers.forEach(clearTimeout); m.timers = []; m.queue = [];
    root.removeAttribute('data-pmu-moment');
    if (hold) hold = null;
    releaseBeatHold();
  }
  /* Retro and NieR step back as they stepped out: the erase runs back up from where it stands, in as many of its eight
     steps as it had taken and at its own pace (180 / 200 ms for the whole board), its phosphor bar or ink scanline
     climbing with it */
  function reverseStepped(el, m, o) {
    var R = el._pmuRev, f = fam(), cs = getComputedStyle(el), hit = /inset\(\s*([\d.]+)%/.exec(cs.clipPath || '');
    var p = hit ? Math.min(1, +hit[1] / 100) : (R.erase && R.erase.playState === 'finished' ? 1 : 0);
    el._pmuRevived = true; el._pmuRev = null;
    [R.erase, R.lineA].forEach(function (x) { if (x && x.cancel) { try { x.cancel(); } catch (error) {} } });
    Array.prototype.forEach.call(el.querySelectorAll(':scope > .pmu-ghostscan'), function (n) { n.remove(); });
    dropMoment(m);
    /* (the erase kept the old scroll as a base transform; with it cancelled and the scroll given back, nothing moves) */
    var out = { move: null, close: null, ms: 0 };
    if (p > 0.001) {
      var n = Math.max(1, Math.round(p * R.n)), ms = Math.max(60, Math.round(p * R.ms)), ease = 'steps(' + n + ',jump-end)';
      out.close = anim(el, [{ clipPath: 'inset(' + (p * 100).toFixed(2) + '% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)' }], { dur: ms, easing: ease, fill: 'none' });
      var line = H('i', f === 'nier' ? 'pmu-film-scan pmu-ghostscan' : 'pmu-film-scanbar pmu-ghostscan', el);
      gone(anim(line, [{ transform: 'translateY(' + (p * 100).toFixed(2) + '%)', opacity: 1 }, { transform: 'translateY(0%)', opacity: 1, offset: 0.97 }, { transform: 'translateY(0%)', opacity: 0 }], { dur: ms, easing: ease, fill: 'both' }), line);
      out.ms = ms;
    }
    emitMoment.later('finish', m || { kind: 'room' });
    return out;
  }
  function reverse(el, o) {
    var m = moment, G = m && m.ghost;
    if (!reversible(el)) return null;
    o = o || {};
    if (stepped3(fam())) return reverseStepped(el, m, o);
    el._pmuRevived = true;
    var s = readBack(el), iris = G.cut === 'iris' ? G.iris : null;
    var list = [G.move, G.fade, G.fadeA].concat(G.anims || []);
    G.gone = true; G.done = null; G.fade = null; G.fadeA = null; G.move = null; G.anims = [];
    list.forEach(function (x) { if (x && x !== true && x.cancel) { try { x.cancel(); } catch (error) {} } });
    var rim = iris && el.parentNode ? liveRim(el.parentNode) : null;
    if (rim && rim._pmuA) {
      freeze(rim._pmuA);
      rim.classList.add('pmu-iris-out');
      rimTrack(rim, anim(rim, [{ opacity: 1 }, { opacity: 0 }], { dur: 140, easing: E.out, fill: 'forwards' }));
    }
    dropMoment(m);
    var back = writeBack(el, s, { shift: o.shift || 0, iris: iris });
    emitMoment.later('finish', m);
    return back;
  }
  /* finishMoment('next'): the elements whose animations play on (the room carried into the next change, the board that
     becomes the next ghost, a lens rim fading where it stands), or null for none */
  function liveGhost(G) { return !!G && !G.gone && !G.leaving && G.el.isConnected && !(G.fade && G.fade !== true && (G.fade.playState === 'finished' || G.fade.playState === 'idle')); }
  /* a room on screen that does not hand over fades where it stands (100 OUT, on the compositor) instead of vanishing */
  function fadeAway(G, ms) {
    if (!G || G.gone || G.leaving) return;
    G.leaving = true;
    if (G.fade && G.fade !== true) freeze(G.fade);
    if (G.fadeA) { try { G.fadeA.cancel(); } catch (error) {} G.fadeA = null; }
    var a = G.el.isConnected ? anim(G.el, [{ opacity: 1 }, { opacity: 0 }], { dur: ms, easing: E.out, fill: 'forwards' }) : null;
    if (a) a.finished.then(function () { dropNow(G); }, function () { dropNow(G); }); else dropNow(G);
  }
  function carryGhosts(m, nextRoom) {
    if (reduced() || soft() || M.paused()) { dropKept(); return null; }
    var keep = [], G0 = m.ghost, carry = null, layers = [], wasKept = kept && !kept.gone && kept.el.isConnected ? kept : null;
    /* what is on screen (review r3 R2, repros A, D and E at 3 and 6 clicks a second). Top down the board shows: a room
       kept over its own rebuild (keepRoom), rooms carried from earlier clicks (frozen, or cut with this change), this
       change's ghost, then the new room once its frames are in. Each covers the board less what its cut or lens has
       uncovered, and has to itself what the ones above leave. One room hands over:
       - a click back to a room with a third of the board or more: that room stays as it is (keepRoom; repro A, Costs
         then Overview 180 ms later, showed half-built Costs for 150 ms and then rebuilt Overview);
       - else the newest room, once its frames are in (the newest room's frame, never an older room's: at 6 clicks a
         second a room kept by its share of the board stayed on screen through several clicks); a room above it with
         a share of the board fades where it stands (fadeAway) rather than vanishing;
       - else (no new frames yet) the room with the most of the board. */
    if (wasKept) layers.push({ G: wasKept, cov: 1 });
    carryQ.forEach(function (c) { if (!c.G.gone && c.G.el.isConnected && c.G !== wasKept) layers.push({ G: c.G, cov: 1 - c.at }); });
    (m.carried || []).forEach(function (G) { if (liveGhost(G) && G.cut) layers.push({ G: G, cov: 1 - cutAt(G) }); });
    var g0 = G0 && liveGhost(G0) && cutKind(G0);
    if (g0) layers.push({ G: G0, cov: G0.fade && G0.fade !== true ? 1 - cutAt(G0) : 1 });
    if (m.framed) layers.push({ G: null, cov: 1 });
    var above = 0, best = null, back = null;
    layers.forEach(function (L) {
      L.vis = Math.max(0, L.cov - above); above = Math.max(above, L.cov);
      if (!best || L.vis > best.vis + 0.001) best = L;
      if (L.G && nextRoom && L.G.el.getAttribute('data-room') === nextRoom && L.vis >= 0.33 && (!back || L.vis > back.vis)) back = L;
    });
    /* a kept room is the room on screen over its own copy (the copy under it is the same room, half built) */
    carry = back ? back.G : wasKept ? wasKept : m.framed ? null : best ? best.G : null;
    kept = null; clearTimeout(keptT);
    var older = [], fading = [];
    layers.forEach(function (L) { if (L.G && L.G !== carry) { if (!back && m.framed && L.vis >= 0.05) fading.push(L.G); else older.push(L.G); } });
    (m.carried || []).forEach(function (G) { if (G !== carry && older.indexOf(G) < 0 && fading.indexOf(G) < 0) older.push(G); });
    if (G0 && !g0 && m.framed && older.indexOf(G0) < 0) older.push(G0);
    carryQ = carryQ.filter(function (c) { return c.G === carry; });
    older.forEach(dropNow);
    fading.forEach(function (G) { fadeAway(G, 100); keep.push(G.el); });
    /* the click goes back to the room on screen: it stays as it is (keepRoom) */
    if (carry && nextRoom && carry.el.getAttribute('data-room') === nextRoom) {
      carryQ = [];
      keepRoom(carry, nextRoom, carry === wasKept);
      keep.push(carry.el);
      var rim0 = carry === G0 && carry.cut === 'iris' && carry.el.parentNode ? liveRim(carry.el.parentNode) : null;
      if (rim0 && rim0._pmuA) {
        /* its rim closes with the lens and fades */
        try { rim0._pmuA.playbackRate = -2; rim0._pmuA.play(); } catch (error) {}
        rim0.classList.add('pmu-iris-out'); keep.push(rim0);
        rimTrack(rim0, anim(rim0, [{ opacity: 1 }, { opacity: 0 }], { dur: 110, easing: E.out, fill: 'forwards' }));
      }
      return keep;
    }
    if (carry && !carryQ.length) {
      var a = carry === wasKept ? null : carry.fade && carry.fade !== true ? carry.fade : null, at = a ? cutAt(carry) : 0;
      if (a) freeze(a);
      /* a kept room stands whole: its closing cut or lens goes */
      if (carry === wasKept && carry.fade && carry.fade !== true) { try { carry.fade.cancel(); } catch (error) {} carry.fade = null; }
      if (carry.fadeA) { try { carry.fadeA.cancel(); } catch (error) {} carry.fadeA = null; }
      carry.carried = true; carry.el.style.zIndex = '3';
      carryQ.push({ G: carry, at: at, a: a });
    }
    if (carry) keep.push(carry.el);
    /* the room that was drawing becomes the next ghost as it stands: its plates keep rising instead of snapping */
    var board = document.getElementById('pmuBoard'); if (board && m.framed) keep.push(board);
    if (!keep.length && !carryQ.length) return null;
    /* the lens's rim fades where it stands (finished, it went at once) */
    var rim = G0 && G0.cut === 'iris' && G0.el.parentNode ? liveRim(G0.el.parentNode) : null;
    if (rim && rim._pmuA) {
      freeze(rim._pmuA);
      rim.classList.add('pmu-iris-out'); keep.push(rim);
      rimTrack(rim, anim(rim, [{ opacity: 1 }, { opacity: 0 }], { dur: 140, easing: E.out, fill: 'forwards' }));
    }
    if (carryQ.length) { clearTimeout(carryT); carryT = setTimeout(function () { carryOn(null); }, 900 * M.speed()); }   /* the next change drew no frames */
    return keep;
  }
  /* the next change's frames are in: each carried room holds where it stands until the new cut or lens reaches it, then
     goes with it (the same easing and clock, so one edge sweeps); with no cut or lens to follow it fades out, with the
     next change's own ghost when that one fades (fadeGhost) */
  function carryOn(elapsed, fadeMs) {
    clearTimeout(carryT); carryT = 0;
    var list = carryQ, m = moment; carryQ = [];
    list.forEach(function (c) {
      var G = c.G, a2 = null, q = 0; if (G.gone || !G.el.isConnected) return;
      /* all but cut away already: it goes now */
      if (c.at >= 0.995) { G.gone = true; if (G.done) G.done(); return; }
      if (elapsed != null && c.at < 1 && !reduced()) {
        var V = riseOn();
        if (G.cut === 'cut' && V) {
          var W = G.cutW || boardW(); q = Math.min(0.999, c.at * W / boardW());
          a2 = anim(G.el, [{ clipPath: 'inset(0 0 0 ' + (c.at * W).toFixed(1) + 'px)' }, { clipPath: 'inset(0 0 0 ' + (c.at * W).toFixed(1) + 'px)', offset: q }, { clipPath: 'inset(0 0 0 ' + W + 'px)' }],
            { dur: V.ms, delay: V.at - elapsed, easing: V.ease, fill: 'both' });
        } else if (G.cut === 'iris' && irisOn() && G.iris) {
          var g = G.iris, r0 = c.at * g.R; q = Math.min(0.999, r0 / irisGeo().R);
          a2 = anim(G.el, irisKeys(G, irisClip(g.x, g.cy, r0), q, irisClip(g.x, g.cy, g.R)), { dur: lensT().ms, delay: lensT().at - elapsed, easing: lensT().ease, fill: 'both' });
        }
      }
      if (a2) { if (c.a) try { c.a.cancel(); } catch (error) {} G.from = c.at; G.q = q; ghostFade(G, G.cut === 'iris' ? lensT().ms : (riseOn() || {}).ms || 300, (G.cut === 'iris' ? lensT().at : (riseOn() || {}).at || 80) - elapsed); }
      else {
        /* nothing to follow: it fades where it stands (its cut stays paused under the fade) */
        G.cut = null;
        a2 = reduced() ? null : anim(G.el, [{ opacity: 1 }, { opacity: 0 }], { dur: fadeMs || 140, easing: E.out, fill: 'forwards' });
        if (!a2) { G.gone = true; if (G.done) G.done(); return; }
      }
      G.fade = a2; G.carried = false;
      if (m) (m.carried = m.carried || []).push(G);
      a2.finished.then(function () { later(G.done); }, function () { if (G.fade === a2 && G.done) G.done(); });
    });
    /* the next change's own ghost lies under every carried room and is cut with them: under one that is still whole it
       never shows */
    var NG = m && m.ghost;
    if (elapsed != null && NG && !NG.gone && !NG.carried && list.some(function (c) { return !c.G.gone && c.G.cut && c.at <= 0.002; })) { NG.gone = true; if (NG.done) NG.done(); }
  }
  /* NieR's signal glitch: three ink lines at fixed heights flicker in three steps each, 40 apart, offset sideways and
     settling (150 ms each, done by about 230 ms) */
  function glitch(board, elapsed) {
    var stage = document.getElementById('pmuStage');
    if (!stage || soft() || reduced() || M.paused() || off.key || !board || !stage.contains(board)) return null;
    var old = stage.querySelector(':scope > .pmu-glitch'); if (old) old.remove();
    var wrap = H('i', 'pmu-glitch', stage), a = null;
    wrap.setAttribute('aria-hidden', 'true');
    [[22, 30, -14], [51, 70, 10], [78, 110, -6]].forEach(function (g) {
      var line = H('i', '', wrap); line.style.top = g[0] + '%';
      a = anim(line, [{ opacity: 0, transform: 'translateX(' + g[2] + 'px) scaleX(.6)' }, { opacity: 1, transform: 'translateX(' + (-g[2] / 2) + 'px) scaleX(1)', offset: 0.34 },
        { opacity: 0.6, transform: 'none', offset: 0.67 }, { opacity: 0, transform: 'none' }], { dur: 150, delay: g[1] - (elapsed || 0), easing: 'steps(3,jump-end)', fill: 'both' });
    });
    gone(a, wrap);
    return a;
  }
  /* Reduce Motion's room change: nothing travels; the old room is gone at once and the new one dissolves in from a third
     of its opacity over 160 ms. Element.animate directly: PMU.motion makes nothing under Reduce Motion. */
  function dissolve(board) {
    if (!board || typeof board.animate !== 'function') return null;
    try { return board.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 160, easing: E.out }); } catch (error) { return null; }
  }
  function flightLayer() {
    var app = document.getElementById('pmuApp'), el = document.getElementById('pmuFlight');
    if (!el && app) { el = document.createElement('div'); el.id = 'pmuFlight'; el.className = 'pmu-flight'; el.setAttribute('aria-hidden', 'true'); app.appendChild(el); }
    return el;
  }
  /* the board still calls the retired flight's hooks (40-board.js, owned elsewhere): they do nothing, and no build order
     waits on a flight target any more */
  function noop() { return null; }
  /* light at a measured rect, drawn in the flight layer (#pmuFlight, above the board): the flash (and with a GPU the sweep) of a
     landed flyer or a live lead, sized to the element itself whatever its position (a flash inside a static element
     covered its whole card; NieR's invert flash then inverted the hero plate) */
  function rectIn(el) {
    var app = document.getElementById('pmuApp'); if (!el || !app) return null;
    var r = el.getBoundingClientRect(), a = app.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? { x: r.left - a.left, y: r.top - a.top, w: r.width, h: r.height } : null;
  }
  /* o.layer: a layer of the caller's own instead of #pmuFlight (a dashboard's, 40-board.js: #pmuApp, and with it the
     Usage page's flight layer, is hidden on Home), r measured from it; o.calm: under Reduce Motion the calm light
     (calmAt) instead of none. The Usage page passes neither. */
  function lightAt(r, o) {
    o = o || {};
    if (!r) return null;
    if (reduced()) return o.calm ? calmAt(r, o) : null;
    var layer = o.layer || flightLayer(); if (!layer) return null;
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
  /* the calm light (Reduce Motion on a dashboard): the voice's own flash tint (Friendly warm, NieR's ink, a warn or crit
     tone) rises to the flash's own strength and fades once over 1.2 s, opacity only: no sweep, no glint, nothing moves.
     Element.animate directly, since PMU.motion.animate makes nothing under Reduce Motion; the Animation speed still
     scales it (the look sheet's wrapper). */
  function calmAt(r, o) {
    var layer = o.layer || flightLayer(); if (!layer) return null;
    var box = H('i', 'pmu-film-at', layer);
    box.style.cssText = 'left:' + (r.x - 3).toFixed(1) + 'px;top:' + (r.y - 2).toFixed(1) + 'px;width:' + (r.w + 6).toFixed(1) + 'px;height:' + (r.h + 4).toFixed(1) + 'px';
    box.setAttribute('data-voice', voice().name);
    var g = H('i', 'pmu-film-flash', box), a = null;
    if (o.tone) g.setAttribute('data-tone', o.tone);
    try { a = g.animate([{ opacity: 0 }, { opacity: fam() === 'nier' ? 0.3 : 0.55, offset: 0.4 }, { opacity: 0 }], { duration: o.dur || 1200, easing: 'ease-in-out', fill: 'both' }); } catch (error) { a = null; }
    if (a) a.finished.then(function () { later(function () { box.remove(); }); }, function () { box.remove(); }); else box.remove();
    return box;
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

  /* ---- the warm arrival (motion QA P2-03, 2026-10-16). The arrival built its board after the Usage tab's click: Home
     stood still through the page change, then the page showed its plates empty for as long as the bodies took to build
     (P1000: 250-400 ms of empty board, drawn at 0.8-1.3 s; M3: a 15-30 ms frame per slice for ~150 ms). Now the next
     arrival's board is built before it: in an idle period while another page shows, the Usage page is laid out unseen in
     the box it shows in (#panel-usage[data-pmu-warm], 05-film.css) and the board is mounted held in idle slices
     (40-board.js mount opts.warm), every body's entrance queued on its card; then it is drawn once unseen (the raster,
     below), and the page goes back to display: none, the board waiting in its scroll pane (data-pmu-warm-wait). The page
     is laid out in its warm box (inert and aria-hidden) only while the build or a raster step runs (P2-03 final,
     2026-10-17: kept laid out and styled until the arrival, the waiting board made Home's look changes and resizes cost
     40-54 % more on Nas1, moved the show's cost into the click's frame instead of saving it, since other lanes' '.active'
     rules restyle the whole styled board when the shell marks the page active, and its pinned box clipped the board
     under the side panel). The arrival shows it whole (arriveHold, below): the board comes out of its wait in the task
     that changes the page, so the page's first frame lays it out with the rest of the page, and it is drawn unseen while
     the shell holds the page's own entrance; the entrance starts in the frame the page's does, plates and bodies
     together. A warm board is used only while nothing it shows has changed (warmKey: the look, Reduce Motion, the room,
     its view and layout, the data epoch, Settings); a stale one is dropped and the arrival builds the board whole in its
     own task. Without a GPU nothing is warmed: that profile is set when Usage first shows. ---- */
  var warm = null, warmT = 0, warmRev = 0, warmLast = null, warmA11y = null;
  /* ?pmu-warm=0 leaves it out (A/B measurements) */
  var WARM_OFF = /[?&]pmu-warm=0(?:&|#|$)/.test(location.search);
  function pageShown() { var p = document.getElementById('panel-usage'); return !!p && p.classList.contains('active'); }
  function warmKey() {
    var B = PMU.board, room = st.room;
    return [PMU.theme && PMU.theme.look ? PMU.theme.look().key : '', reduced() ? 1 : 0, soft() ? 1 : 0, room, st.range, st.scope, st.detail,
      st.more ? 1 : 0, warmRev, PMU.boards && PMU.boards.epoch ? PMU.boards.epoch() : 0,
      B && B.cls ? B.cls().name : '', B ? JSON.stringify(B.layout(room)) + JSON.stringify(B.visible(room)) : ''].join('|');
  }
  function warming() { return !!warm; }
  /* the page laid out in its warm box, out of the focus order and the accessibility tree (inert also covers a descendant
     that would show itself by its own visibility, as a raster step's marks do); as it was again once the page is back to
     display: none, at the arrival, a drop and an unmount */
  function warmHide(panel) {
    if (!panel || warmA11y) return;
    warmA11y = { inert: panel.inert, aria: panel.getAttribute('aria-hidden') };
    panel.inert = true; panel.setAttribute('aria-hidden', 'true');
  }
  function warmUnhide() {
    var panel = document.getElementById('panel-usage'), a = warmA11y; if (!panel || !a) return;
    warmA11y = null;
    panel.inert = !!a.inert;
    if (a.aria == null) panel.removeAttribute('aria-hidden'); else panel.setAttribute('aria-hidden', a.aria);
  }
  /* the box the page shows in: .primary-content's content box on every page but Home. Home turns that padding off with a
     rule of its own (:has its page), so on Home the padding is read from a stand-in of the same class, matched by every
     other rule (the density, Glass and short-window paddings) */
  function warmBox(panel) {
    var pc = panel.parentNode; if (!pc || !pc.parentNode) return null;
    var probe = null;
    if (pc.querySelector(':scope > #panel-dashboard.active')) {
      probe = document.createElement(pc.tagName); probe.className = pc.className; probe.style.display = 'none';
      pc.parentNode.insertBefore(probe, pc.nextSibling);
    }
    var cs = getComputedStyle(probe || pc);
    var t = parseFloat(cs.paddingTop) || 0, r = parseFloat(cs.paddingRight) || 0, b = parseFloat(cs.paddingBottom) || 0, l = parseFloat(cs.paddingLeft) || 0;
    if (probe) probe.remove();
    var w = pc.clientWidth - l - r, h = pc.clientHeight - t - b;
    return w > 0 && h > 0 ? { x: l, y: t, w: w, h: h } : null;
  }
  function warmSoon(ms) {
    if (WARM_OFF) return;
    warmWatch();
    if (warmT || warm || !PMU.board) return;
    warmT = setTimeout(function () {
      warmT = 0;
      (window.requestIdleCallback || function (fn) { return setTimeout(fn, 0); })(warmNow, { timeout: 4000 });
    }, (ms == null ? 1500 : ms) * M.speed());
  }
  function warmNow() {
    if (warm || warmT || !PMU.board) return;
    var panel = document.getElementById('panel-usage'), board = document.getElementById('pmuBoard');
    if (!panel || !board || pageShown() || moment || hold) return;
    /* not while something else is running (a page change, onboarding, the tour, a hidden tab), nor on the Settings page,
       where what the board reads can change (leaving it warms again) */
    var sp = document.getElementById('panel-settings');
    if (sp && sp.classList.contains('active')) return;
    if (document.hidden || root.hasAttribute('data-o55-open') || root.hasAttribute('data-o55-tour') || root.hasAttribute('data-pm-page-transition')) { warmSoon(1200); return; }
    /* no GPU, or the no-GPU profile forced (?pmu-soft=1): nothing is warmed */
    if (typeof softwareRendered === 'function' && softwareRendered()) { rasterLog.skipped = /[?&]pmu-soft=1\b/.test(location.search) ? 'soft' : 'software'; return; }
    var box = warmBox(panel); if (!box) { warmSoon(2000); return; }
    var w = warm = { room: st.room, key: null, built: false, box: box, shares: {}, at: performance.now() };
    warmIn(panel, box);
    PMU.board.mount(st.room, { warm: true, onBuilt: function () { warmBuilt(w); } });
    if (warm !== w) return;
    if (!w.mounted) { warmDrop('unmounted'); warmSoon(3000); return; }
    if (!PMU.board.cardsNow().length) { warmDrop('empty'); return; }
    w.key = warmKey();
  }
  function warmBuilt(w) {
    if (warm !== w) return;
    if (w.key !== warmKey()) { warmDrop('stale'); warmSoon(1200); return; }
    w.built = true; w.ms = Math.round(performance.now() - w.at);
    rasterSoon(w);
  }
  /* the page laid out unseen in its warm box (05-film.css #panel-usage[data-pmu-warm]), the board out of its wait */
  function warmIn(panel, box) {
    panel.style.setProperty('--pmu-warm-x', box.x + 'px'); panel.style.setProperty('--pmu-warm-y', box.y + 'px');
    panel.style.setProperty('--pmu-warm-w', box.w + 'px'); panel.style.setProperty('--pmu-warm-h', box.h + 'px');
    panel.setAttribute('data-pmu-warm', '');
    var board = document.getElementById('pmuBoard');
    if (board && board.parentNode) board.parentNode.removeAttribute('data-pmu-warm-wait');
    warmHide(panel);
  }
  /* the built board waits in its scroll pane for the arrival, display: none (after its raster, at a park, or at once
     without one): the page leaves its warm box and is as it was for the focus order and assistive tech */
  function warmPark(w) {
    if (warm !== w) return;
    w.parked = true;
    var board = document.getElementById('pmuBoard'), panel = document.getElementById('panel-usage');
    if (board && board.parentNode) board.parentNode.setAttribute('data-pmu-warm-wait', '');
    if (panel) panel.removeAttribute('data-pmu-warm');
    warmUnhide();
  }

  /* ---- the warm board's raster (P2-03; 05-film.css data-pmu-raster). The warm build laid the board out but never
     painted it, so the first visible entry paid for every GPU program its cards and charts draw with (P1000 F3 cold: 47
     program links, ~1.4 s of GPU main thread, an 834 ms gap). After the warm build, in idle time, the REAL board is drawn
     in place at opacity .004 on a will-change: opacity layer above the page that shows, one slice at a time, so the GPU
     links its programs before an arrival needs them. The arrival does not depend on it (arriveHold draws the board
     unseen itself, under the shell's hold); the pass only makes that hold shorter.
     Every slice is one step of the page-wide idle-warm queue (window.PM_WARM, IDLE-WARM-RULE.md v3.4; P2-03 final,
     2026-10-17): the queue admits it when the page is still and judges it by the frames after it (late, back-off, drop,
     stop). Without PM_WARM (or with it off: ?pm-warm=0, the no-GPU profile) nothing is drawn ahead. Usage's work comes
     as two kinds of step. A draw (a GPU step) marks what its slice adds and turns the paint token on; the cleanup it
     returns, which the queue runs in the next frame, turns the token off, so nothing of Usage is drawn between two steps
     (a card's prefix marks stay, unseen, until the card is done). Work that draws nothing comes as cpu steps that stop
     at the idle period's deadline, or after RASTER_CPU ms (the rule assumes no 45 ms slot): a root's plan, read element
     by element and resumed in the next step; another room's first screen built in the spare board (40-board.js
     rasterRoom, one slice a step); the page laid out in its warm box again after a park. Only one Usage step is queued at
     a time; each step queues the next as it runs, so a light chain can continue.
     The slices (fix cycle 2: each may link at most a program or two, about 30 ms a link on the P1000; P1000 part2,
     1994fee11d: a step with 12-15 links made a 234 ms gap, so one new kind a step): the layer alone with one small box
     (its own compositor programs); then the page chrome and each card of the room, the hero first, as a growing prefix
     of its paint order (rasterPlan): a layer that will hold six paths or more (Chrome rasters such a layer
     multisampled) first draws six of them alone, so everything after them draws, and links, in its multisampled form;
     then each step adds the next painting elements, one of a kind no step drew yet alone (a heavy one in parts first:
     rasterParts), else up to rasterGrow of them (doubled after a step the queue did not report late, back to one after
     one it did), an image once it is decoded; then the part whole, which adds nothing new. Then the first screen of each
     other room the rail leads with (Overview, Costs, Accounts, less the arrival's room) is built in the spare board and
     drawn the same way, its cards alone, then torn down. Once per look, board class and room per page load; a room the
     page has shown is done. Nothing of the held state changes: no animation, the cues, data-held and data-body-wait
     stay, so the arrival plays as before.
     A late step (Usage's onLate) is split in two when it drew more than one element, else moved to the end of its room;
     late a second time it is dropped and recorded. The queue's session stop ends the pass.
     Usage's own holds, before every step: the tab shown, no page change, not on Settings, under the tour or onboarding,
     and the warm board still current (warmKey: a look or Settings change drops it and the next warm build starts the
     pass again). A hidden tab, Settings, the tour or onboarding park the pass at once (rasterPark: a spare room is torn
     down and the page goes back to display: none as after a pass), and so do a window resize and a step that has waited
     RASTER_WAIT ms while the queue is stopped, the page busy or the queue in a long back-off, so the page is not kept
     laid out unseen while Home is used. A parked pass resumes at the slice it was on: the page is laid out again in a cpu step of
     its own (rasterUnpark, the box read again). The arrival (warmTake) or a drop stops it at once. ?pmu-raster=0 leaves
     it out, ?pmu-raster=1 skips Usage's own no-GPU checks (PM_WARM's ?pm-warm=force runs the queue on a CPU-only VM),
     ?pmu-raster-marks=1 adds a performance mark per draw. PMU.film.warmState().raster says what ran. ---- */
  var RASTER = (function () { var m = /[?&]pmu-raster=([01])(?:&|#|$)/.exec(location.search); return m ? m[1] : null; })();
  var RASTER_MARKS = /[?&]pmu-raster-marks=1(?:&|#|$)/.test(location.search);
  /* RASTER_CPU: the most ms of a cpu step's work when its idle period gives no deadline; RASTER_WAIT: a queued step not
     run in this long parks the pass; RASTER_MSAA: the paths that make a layer raster multisampled */
  var RASTER_ROOMS = ['overview', 'costs', 'accounts'], RASTER_CPU = 6, RASTER_WAIT = 3000, RASTER_MSAA = 6, RASTER_QUIET = 600;
  /* RASTER_PREFIX: the most painting elements a card's draw adds (?pmu-raster-prefix=N for measurements) */
  var RASTER_PREFIX = (function () { var m = /[?&]pmu-raster-prefix=(\d{1,3})(?:&|#|$)/.exec(location.search); return m ? Math.max(1, +m[1]) : 8; })();
  var rast = null, rasterDone = {}, rasterSeen = {}, rasterLog = { rooms: [], at: null, ms: null, skipped: WARM_OFF ? 'warm-off' : null };
  function rasterKey(room, cls) {
    var look = (root.getAttribute('data-theme') || '') + (root.getAttribute('data-o55-nier') === 'on' ? '+nier' : '');
    return look + '|' + (cls || (PMU.board && PMU.board.cls && PMU.board.cls() ? PMU.board.cls().name : '')) + '|' + room;
  }
  /* the shared queue, or why there is none to use */
  function rasterQueue() {
    var q = window.PM_WARM;
    if (!q || typeof q.add !== 'function') return 'no-pm-warm';
    try { var qs = typeof q.state === 'function' ? q.state('usage') || {} : {}; if (qs.off) return 'pm-warm-off'; if (qs.session) return 'pm-warm-stopped'; } catch (error) { return 'no-pm-warm'; }
    return q;
  }
  /* true, or why not */
  function rasterGpu() {
    if (RASTER === '0') return 'off';
    var q = rasterQueue(); if (typeof q === 'string') return q;
    if (RASTER === '1') return true;
    if (soft() || root.hasAttribute('data-pmh-soft') || /[?&]pmu-soft=1\b/.test(location.search)) return 'soft';
    var tier = root.getAttribute('data-lg-tier');
    if (tier !== 'gpu') return tier === 'cpu' ? 'cpu' : 'no-tier';
    if (typeof softwareRendered === 'function' && softwareRendered()) return 'software';
    return true;
  }
  function rasterSoon(w) {
    var g = rasterGpu();
    if (g !== true) { rasterLog.skipped = g; warmPark(w); return; }
    var rooms = [w.room].concat(RASTER_ROOMS.filter(function (r) { return r !== w.room; })).filter(function (r) { return !rasterDone[rasterKey(r)]; });
    if (!rooms.length) { rasterLog.skipped = 'done'; warmPark(w); return; }
    var r = rast = { w: w, q: window.PM_WARM, rooms: rooms, t0: performance.now(), cur: null, spare: false, building: null, parked: false,
      queued: 0, queuedAt: 0, waitT: 0, holdT: 0, holdFn: null, visFn: null, resizeAt: 0, prev: null, redo: [], resumes: 0 };
    rasterLog = { rooms: [], at: Math.round(r.t0), ms: null, skipped: null, gate: null, parks: 0, steps: [], ran: 0, late: 0, split: 0, moved: 0,
      dropped: [], cpu: { plan: 0, build: 0, unpark: 0 } };
    r.onResize = function () { r.resizeAt = performance.now(); if (!r.parked) { rasterUnqueue(r); rasterPark(r); rasterNext(r); } };
    window.addEventListener('resize', r.onResize, { passive: true });
    rasterNext(r);
  }
  /* what holds the pass now that the queue does not see ('' when nothing) */
  function rasterHeld(r) {
    if (document.hidden) return 'hidden';
    var sp = document.getElementById('panel-settings');
    if (sp && sp.classList.contains('active')) return 'settings';
    if (root.hasAttribute('data-o55-tour')) return 'tour';
    if (root.hasAttribute('data-o55-open')) return 'onboarding';
    if (root.hasAttribute('data-pm-page-transition')) return 'page';
    return '';
  }
  /* the warm board no longer shows what the arrival would (a look, Settings, the room's layout): dropped, and the next
     warm build starts the pass again (the look listeners would do the same; this does not depend on them) */
  function rasterStale(r) {
    if (!r.w.key || r.w.key === warmKey()) return false;
    warmDrop('stale'); warmSoon(1200);
    return true;
  }
  function rasterUnlisten(r) {
    clearTimeout(r.holdT); r.holdT = 0;
    if (r.holdFn) { window.removeEventListener('pm-idle', r.holdFn); r.holdFn = null; }
    if (r.visFn) { document.removeEventListener('visibilitychange', r.visFn); r.visFn = null; }
  }
  /* the queued step taken back (a park, the end) */
  function rasterUnqueue(r) {
    clearTimeout(r.waitT); r.waitT = 0;
    if (r.queued) { try { r.q.cancel(r.queued); } catch (error) {} r.queued = 0; }
  }
  /* the next step, queued (one at a time): what the cursor needs next decides its kind */
  function rasterNext(r) {
    if (rast !== r || r.queued) return;
    rasterUnlisten(r);
    if (warm !== r.w || pageShown() || moment || hold) { rasterStop('page'); return; }
    if (rasterStale(r)) return;
    var why = rasterHeld(r);
    rasterLog.gate = why || null;
    if (why) {
      /* a page change only waits; the rest park the page at once and come back when they end */
      if (why !== 'page' && !r.parked) rasterPark(r);
      var go = function () { if (rast === r && !r.queued) rasterNext(r); };
      if (why === 'hidden') { r.visFn = go; document.addEventListener('visibilitychange', go); return; }
      r.holdFn = go; window.addEventListener('pm-idle', go);
      r.holdT = setTimeout(go, why === 'page' ? 250 : 1000);
      return;
    }
    var need = rasterNeed(r);
    if (need === 'end' || need === 'wait') return;
    /* a window still being resized: laid out again once it has settled */
    var settle = need === 'unpark' ? RASTER_QUIET - (performance.now() - r.resizeAt) : 0;
    if (settle > 0) { r.holdT = setTimeout(function () { if (rast === r && !r.queued) rasterNext(r); }, settle + 20); return; }
    if (need === 'decode') { r.holdT = setTimeout(function () { if (rast === r && !r.queued) rasterNext(r); }, 50); return; }
    rasterAdd(r, need);
  }
  /* what comes next: 'unpark', 'build' (the spare room's next slice), 'plan' (the root's plan, resumed), 'draw', 'decode'
     (an image of the next slice still decoding), 'wait' (a spare slice is queued by the board) or 'end' */
  function rasterNeed(r) {
    if (r.parked) return 'unpark';
    for (var guard = 0; guard < 400; guard++) {
      var room = r.rooms[0];
      if (!room) { rasterEnd(null); return 'end'; }
      if (!r.cur || r.cur.room !== room) r.cur = { room: room, key: rasterKey(room), t0: performance.now(), roots: null, ri: 0, plan: null, planning: null, pi: 0, steps: 0, build: 0, planMs: 0 };
      var cur = r.cur, kind = room === r.w.room ? 'board' : 'spare';
      if (kind === 'spare' && !r.spare) return r.building && r.building.slice ? 'build' : r.building ? 'wait' : 'build';
      if (!cur.roots) { cur.roots = rasterRoots(kind); cur.ri = 0; cur.plan = null; cur.planning = null; }
      var rt = cur.roots[cur.ri];
      if (!rt) {
        r.redo = r.redo.filter(function (x) { return x.room === room && (x.els ? x.els.some(rasterLive) : rasterLive(x.whole) || !x.whole); });
        if (r.redo.length) return 'draw';
        rasterRoomDone(r, cur, cur.roots.filter(function (x) { return x.t === 'card'; }).length, kind);
        continue;
      }
      if (rt.t === 'card' && !rasterLive(rt.el)) { rasterAdvance(cur); continue; }
      if (!cur.plan) return 'plan';
      var s = cur.plan[cur.pi];
      if (!s) { rasterAdvance(cur); continue; }
      /* a body rendered again since the plan (a tier pass): planned again, its new elements */
      if (s.self && !s.self.some(rasterLive)) { cur.plan = null; cur.planning = null; continue; }
      /* an image not decoded yet waits for it (up to a second): decoded in the step's own raster, the 109 KB provider
         mark held a frame 92 ms on the RTX 3090 with nothing linked */
      if (rasterDecoding(s)) return 'decode';
      return 'draw';
    }
    return 'wait';
  }
  function rasterLive(x) { return !!x && x.isConnected; }
  function rasterDecoding(s) { return !!s.self && s.self.some(function (x) { return x._pmuDecoding && !x._pmuDecoded && performance.now() - x._pmuDecoding < 1000; }); }
  /* one step handed to the queue: a draw (GPU) or a cpu step of the given kind */
  function rasterAdd(r, need) {
    var cpu = need !== 'draw', pk = cpu ? null : rasterPeek(r), step = null;
    var o = { owner: 'usage', name: (r.cur ? r.cur.room : '') + ':' + (cpu ? need : pk.name), near: false, cpu: cpu, light: !cpu && pk.light,
      until: function () { return rast === r && warm === r.w && !pageShown(); },
      run: function (d) {
        if (r.queued === o.id) { r.queued = 0; clearTimeout(r.waitT); r.waitT = 0; }
        if (rast !== r || warm !== r.w || pageShown() || moment || hold) return null;
        if (rasterHeld(r)) { rasterNext(r); return null; }
        if (cpu) { rasterCpu(r, need, d); rasterNext(r); return null; }
        if (r.parked) { rasterNext(r); return null; }
        /* a part's next prefix doubles after a draw no onLate came for */
        if (r.prev && r.prev.els && !r.prev.late) rasterPace(false);
        if (!step) step = rasterTake(r);
        if (!step) { rasterNext(r); return null; }
        r.prev = step;
        rasterLog.ran++;
        if (rasterLog.steps.length < 800) { step.row = rasterLog.steps.length; rasterLog.steps.push([step.label, Math.round(performance.now()), 0]); }
        var undo = rasterRun(r, step);
        rasterNext(r);
        return undo;
      },
      onLate: function (info) {
        if (rast !== r) return true;
        /* dropped by the queue (its session stop, or warming known to be off): the pass ends, first use pays as without it */
        if (info && info.dropped) { rasterLog.dropped.push(o.name); rasterEnd('stopped:pm-warm'); return true; }
        if (!step) return true;
        step.late = true;
        var row = rasterLog.steps[step.row]; if (row && row[0] === step.label) row[2] = 1;
        rasterLate(r, step);
        if (!r.queued && rast === r) rasterNext(r);
        return true;
      } };
    var id = 0;
    try { id = r.q.add(o); } catch (error) { id = 0; }
    if (!id) { rasterEnd('stopped:pm-warm-add'); return; }
    o.id = id;
    r.queued = id; r.queuedAt = performance.now();
    clearTimeout(r.waitT);
    r.waitT = setTimeout(function () { rasterWaited(r, id); }, RASTER_WAIT);
  }
  /* a queued step that has waited RASTER_WAIT ms: when the queue is stopped, the page busy (a page change, a cover) or the
     queue in a long back-off, the page is parked meanwhile and the step queued again behind an unpark (a wait for the
     queue's quiet clock or for frames on time only goes on: each resume lays the page out again); a queue stopped for
     the session ends the pass */
  function rasterWaited(r, id) {
    r.waitT = 0;
    if (rast !== r || r.queued !== id) return;
    var qs = {}; try { qs = r.q.state('usage') || {}; } catch (error) {}
    if (qs.session || qs.off) { rasterEnd(qs.off ? 'pm-warm-off' : 'stopped:pm-warm'); return; }
    var long = qs.stopped || qs.waiting === 'busy' || qs.waiting === 'backoff' && qs.backoffMs >= 4000;
    if (r.parked || !long) { r.waitT = setTimeout(function () { rasterWaited(r, id); }, RASTER_WAIT); return; }
    rasterLog.waits = (rasterLog.waits || 0) + 1;
    rasterUnqueue(r);
    rasterPark(r);
    rasterNext(r);
  }
  /* a cpu step's work, up to the idle period's deadline or RASTER_CPU ms */
  function rasterCpu(r, need, d) {
    var left = d && typeof d.timeRemaining === 'function' ? d.timeRemaining() - 1 : RASTER_CPU;
    var end = performance.now() + Math.max(2, Math.min(RASTER_CPU, left)), until = function () { return performance.now() < end; };
    rasterLog.cpu[need] = (rasterLog.cpu[need] || 0) + 1;
    if (need === 'unpark') { if (r.parked) rasterUnpark(r); return; }
    if (need === 'build') { rasterBuild(r, d); return; }
    if (need === 'plan') {
      var cur = r.cur, rt = cur && cur.roots ? cur.roots[cur.ri] : null, panel = document.getElementById('panel-usage');
      if (!rt || !panel || cur.plan) return;
      var t1 = performance.now();
      if (!cur.planning) cur.planning = rasterPlanFor(panel, rt);
      if (rasterPlanRun(cur.planning, until)) { cur.plan = cur.planning.steps; cur.planning = null; cur.pi = 0; }
      cur.planMs += performance.now() - t1;
    }
  }
  /* the spare room: built by the board one slice a cpu step (40-board.js rasterRoom's step hook), then drawn */
  function rasterBuild(r, d) {
    var cur = r.cur;
    if (r.building && r.building.slice) { var fn = r.building.slice; r.building.slice = null; fn(d); return; }
    if (r.building) return;
    var panel = rasterTok(r, 'spare');
    var b = r.building = { room: cur.room, slice: null };
    var job = panel && PMU.board.rasterRoom ? PMU.board.rasterRoom(cur.room, function (res) {
      if (r.building !== b) return;
      r.building = null;
      if (rast !== r || r.cur !== cur) return;
      if (!res) { rasterSkip(r, cur.room, 'failed'); return; }
      r.spare = true; cur.build += res.ms || 0;
      if (cur.roots) { var at = cur.roots[cur.ri] && cur.roots[cur.ri].t === 'card' ? cur.ri : 0; cur.roots = rasterRoots('spare'); cur.ri = Math.min(at, cur.roots.length); cur.plan = null; cur.planning = null; }
      if (!r.queued) rasterNext(r);
    }, function (slice) {
      /* the board's next slice: run by the next cpu step */
      if (r.building !== b || rast !== r) return;
      b.slice = slice;
      if (!r.queued) rasterNext(r);
    }) : null;
    if (!job) { r.building = null; rasterSkip(r, cur.room, 'board-busy'); }
  }
  function rasterTok(r, tok) {
    var panel = document.getElementById('panel-usage'); if (!panel) return null;
    if (tok) panel.setAttribute('data-pmu-raster', tok); else panel.removeAttribute('data-pmu-raster');
    return panel;
  }
  var RASTER_ATTRS = ['data-pmu-raster-on', 'data-pmu-raster-self', 'data-pmu-raster-pieces', 'data-pmu-raster-part'];
  /* the marks off the scope and everything in it (the panel itself is the chrome plan's first element) */
  function rasterUnmark(scope) {
    if (!scope) return;
    var all = Array.prototype.slice.call(scope.querySelectorAll('[data-pmu-raster-on], [data-pmu-raster-self], [data-pmu-raster-pieces], [data-pmu-raster-part]'));
    all.push(scope);
    all.forEach(function (c) { RASTER_ATTRS.forEach(function (a) { c.removeAttribute(a); }); });
  }
  /* nothing drawn: the paint token off (the spare stays laid out while it holds a built room) and no mark */
  function rasterQuiet(r) {
    var panel = document.getElementById('panel-usage'); if (!panel) return;
    var tok = panel.getAttribute('data-pmu-raster') || '';
    if (/\bpaint\b/.test(tok)) rasterTok(r, r.spare ? 'spare' : null);
    rasterUnmark(panel);
  }
  /* the page parks as it would after a pass (display: none, the panel as it was); a spare room built and not drawn is
     torn down and built again at the resume */
  function rasterPark(r) {
    if (r.parked) return;
    rasterQuiet(r);
    if (PMU.board && PMU.board.rasterClear) PMU.board.rasterClear();
    r.spare = false; r.building = null;
    rasterTok(r, null);
    warmPark(r.w);
    r.parked = true;
    rasterLog.parks = (rasterLog.parks || 0) + 1;
  }
  /* laid out unseen in the warm box once more (read again: the window may have changed); what that costs is logged
     (rasterLog.resumeMs) */
  function rasterUnpark(r) {
    var panel = document.getElementById('panel-usage');
    r.parked = false; r.resumes++; r.w.parked = false;
    if (!panel) return;
    var t0 = performance.now(), box = warmBox(panel);
    if (box) r.w.box = box;
    warmIn(panel, r.w.box);
    void panel.offsetHeight;
    (rasterLog.resumeMs = rasterLog.resumeMs || []).push(Math.round(performance.now() - t0));
  }
  /* an element in a draw's label (warmState().raster.steps, ?pmu-raster-marks=1) */
  function rasterName(el) {
    if (!el) return '';
    var cl = el.className && el.className.baseVal != null ? el.className.baseVal : el.className;
    return el.localName + (cl ? '.' + String(cl).trim().split(/\s+/)[0] : '');
  }
  /* how many elements a part's next draw may add (RASTER_PREFIX at most): doubled after a draw the queue did not report
     late, back to one after one it did (a GPU program link: about 19 ms each on the RTX 3090) */
  var rasterGrow = 1;
  function rasterPace(late) { rasterGrow = late ? 1 : Math.min(RASTER_PREFIX, rasterGrow * 2); }
  /* the hero first (it holds the most charts), then reading order */
  function rasterOrder(list) {
    return Array.prototype.slice.call(list).sort(function (a, b) {
      return (b.hasAttribute('data-hero') - a.hasAttribute('data-hero')) || ((+a.dataset.y || 0) - (+b.dataset.y || 0)) || ((+a.dataset.x || 0) - (+b.dataset.x || 0));
    });
  }
  function rasterCards(kind) {
    if (kind === 'board') return rasterOrder(PMU.board.cardsNow());
    var panel = document.getElementById('panel-usage');
    return rasterOrder(panel ? panel.querySelectorAll('.pmu-scroll > .pmu-board[data-pmu-raster-room] > .pmu-card') : []);
  }
  /* ---- what an element paints by itself, as a key: the GPU links one program per kind of draw (its geometry, its
     paint, its anti-aliasing, the clip it is drawn under), so one element of each kind is drawn alone. '' when it paints
     nothing of its own. ctx: its layer ('P' the page, 'K' a card's plate, 'Y' a card's body, upper case when that layer
     rasters multisampled) and 'C' under a rounded clip ---- */
  var SVGNS = 'http://www.w3.org/2000/svg', RASTER_SHAPES = /^(path|polyline|polygon|line|rect|circle|ellipse|text|tspan|textPath|image|use)$/;
  var RASTER_SLOW = /^(path|polyline|polygon|line)$/;
  function rpx(v) { return parseFloat(v) || 0; }
  function ralpha(c) { if (!c || c === 'transparent') return 0; var m = /rgba?\([^)]*?,\s*([\d.]+)\)$/.exec(c) || /\/\s*([\d.]+%?)\)$/.exec(c); if (!m) return 1; var a = m[1].slice(-1) === '%' ? rpx(m[1]) / 100 : rpx(m[1]); return a; }
  /* split at the commas outside parentheses */
  function rsplit(v) {
    var out = [], d = 0, at = 0;
    for (var i = 0; i < v.length; i++) { var ch = v.charAt(i); if (ch === '(') d++; else if (ch === ')') d--; else if (ch === ',' && !d) { out.push(v.slice(at, i).trim()); at = i + 1; } }
    out.push(v.slice(at).trim());
    return out;
  }
  var RCOLOR = /(rgba?|hsla?|color|okl(ab|ch)|lab|lch|hwb)\(|#[0-9a-f]{3,8}\b|\btransparent\b|currentcolor/i;
  /* a colour outside sRGB (a colour mix that overshoots, another colour space): the GPU draws it with float colours,
     its own programs ('W') */
  function rwide(v) {
    if (!v || v.indexOf('(') < 0) return false;
    if (/\b(okl(ab|ch)|lab|lch)\(|color\((display-p3|rec2020|a98-rgb|prophoto-rgb|xyz)/.test(v)) return true;
    var re = /color\(srgb(?:-linear)? ([-\d.e]+) ([-\d.e]+) ([-\d.e]+)/g, m;
    while ((m = re.exec(v))) { for (var i = 1; i <= 3; i++) { var x = +m[i]; if (x < -0.0005 || x > 1.0005) return true; } }
    return false;
  }
  /* a background image as the GPU sees it: each layer's kind, its stop count and whether it has a hard stop (both pick
     the gradient's program; colours, angles and positions are only its numbers), a wide colour, an image */
  /* an image by its source: each one is its own texture, and a texture's format and sampling pick its programs (the first
     provider logo drawn whole linked 13 after an image of another kind was drawn alone) */
  function rhash(v) { var h = 0; v = String(v || ''); for (var i = 0; i < v.length; i += Math.max(1, v.length >> 8)) h = (h * 31 + v.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + v.length; }
  function rimage(v) {
    if (!v || v === 'none') return '';
    var keys = rsplit(v).map(function (layer) {
      var m = /^((?:repeating-)?(?:linear|radial|conic)-gradient)\((.*)\)$/.exec(layer);
      if (!m) return /^url\(/.test(layer) ? 'url' + rhash(layer) : layer.replace(/\(.*$/, '');
      var args = rsplit(m[2]), stops = args.filter(function (a) { return RCOLOR.test(a); }), hard = false, lastPos = null;
      stops.forEach(function (a) {
        var pos = a.replace(/(rgba?|hsla?|color|okl(ab|ch)|lab|lch|hwb)\([^()]*\)/gi, ' ').replace(/#[0-9a-f]{3,8}\b|\b(transparent|currentcolor)\b/gi, ' ')
          .match(/calc\((?:[^()]|\([^()]*\))*\)|-?[\d.]+(%|px)?/g) || [];
        if (pos.length > 1) hard = true;
        if (pos.length && lastPos != null && pos[0] === lastPos) hard = true;
        if (pos.length) lastPos = pos[pos.length - 1];
      });
      return m[1].replace('-gradient', '') + stops.length + (hard ? 'h' : '') + (rwide(m[2]) ? 'W' : '');
    });
    return 'i' + keys.join('+');
  }
  function rbox(cs, r) {
    var f = [], bg = ralpha(cs.backgroundColor), img = rimage(cs.backgroundImage);
    if (bg > 0) f.push((bg < 1 ? 'ba' : 'b') + (rwide(cs.backgroundColor) ? 'W' : ''));
    if (img) f.push(img);
    var bw = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].map(rpx), bs = cs.borderTopStyle;
    if (bw.some(function (x) { return x > 0; }) && bs !== 'none' && bs !== 'hidden') f.push('B' + (bs === 'solid' ? '' : bs) + (bw[0] === bw[1] && bw[1] === bw[2] && bw[2] === bw[3] ? '' : 'n') + (ralpha(cs.borderTopColor) < 1 ? 'a' : '') + (rwide(cs.borderTopColor) ? 'W' : ''));
    if (cs.boxShadow && cs.boxShadow !== 'none') {
      var n = rsplit(cs.boxShadow).length;
      f.push('S' + Math.min(n, 3) + (/inset/.test(cs.boxShadow) ? 'i' : '') + (/(\s|^)0px\s+0px\s+0px/.test(cs.boxShadow) ? '' : 'b') + (rwide(cs.boxShadow) ? 'W' : ''));
    }
    if (cs.outlineStyle && cs.outlineStyle !== 'none' && rpx(cs.outlineWidth) > 0) f.push('O');
    if (!f.length) return '';
    var rad = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(rpx);
    if (rad.some(function (x) { return x > 0; })) {
      var even = rad[0] === rad[1] && rad[1] === rad[2] && rad[2] === rad[3];
      f.push('r' + (even ? '' : 'n') + (r && rad[0] * 2 >= Math.min(r.width, r.height) - 0.5 ? 'p' : ''));
    }
    return f.join('');
  }
  function rasterSig(el, cs, r, ctx) {
    var f = [], svg = el.namespaceURI === SVGNS, tag = el.localName;
    if (svg && tag !== 'svg') {
      if (!RASTER_SHAPES.test(tag)) return '';
      var fill = cs.fill && cs.fill !== 'none', stroke = cs.stroke && cs.stroke !== 'none' && rpx(cs.strokeWidth) > 0;
      if (!fill && !stroke && tag !== 'image' && tag !== 'use') return '';
      if (tag === 'image') f.push(rhash(el.getAttribute('href') || el.getAttribute('xlink:href')));
      var area = r.width * r.height;
      f.push(tag, fill ? 'f' + (/url\(/.test(cs.fill) ? 'u' : '') + (rpx(cs.fillOpacity) < 1 ? 'a' : '') + (rwide(cs.fill) ? 'W' : '') : '',
        stroke ? 's' + (cs.strokeDasharray && cs.strokeDasharray !== 'none' ? 'd' : '') + cs.strokeLinecap.charAt(0) + cs.strokeLinejoin.charAt(0) + (/url\(/.test(cs.stroke) ? 'u' : '') + (rwide(cs.stroke) ? 'W' : '') : '',
        cs.shapeRendering === 'crispEdges' ? 'c' : '', area > 65536 ? 'L' : area > 1024 ? 'M' : 'S');
    } else {
      var box = rbox(cs, r); if (box) f.push(box);
      if (tag === 'img') f.push('img' + rhash(el.currentSrc || el.src));
      else if (tag === 'canvas' || tag === 'video') f.push(tag);
      var text = false;
      for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && /\S/.test(n.nodeValue)) { text = true; break; }
      if (text) {
        var fs = rpx(cs.fontSize);
        f.push('x' + (fs <= 20 ? 'a' : fs <= 64 ? 'b' : 'c') + (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text' ? 'g' : '') + (cs.textShadow && cs.textShadow !== 'none' ? 't' : '') +
          (rpx(cs.webkitTextStrokeWidth) > 0 ? 'k' : '') + (ralpha(cs.color) < 1 ? 'a' : '') + (rwide(cs.color) ? 'W' : ''));
      }
      if (!svg) ['::before', '::after'].forEach(function (p) {
        var ps = getComputedStyle(el, p); if (!ps.content || ps.content === 'none' || ps.content === 'normal' || ps.display === 'none') return;
        var pb = rbox(ps, null); if (pb) f.push(p.charAt(2) + pb + (rimage(ps.maskImage || ps.webkitMaskImage) ? 'm' : ''));
      });
    }
    if (!f.length) return '';
    if (cs.filter && cs.filter !== 'none') f.push('F' + (cs.filter.match(/\b(blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|opacity|saturate|sepia|url)\(/g) || []).join(''));
    if (cs.backdropFilter && cs.backdropFilter !== 'none') f.push('D');
    if (cs.mixBlendMode && cs.mixBlendMode !== 'normal') f.push('X' + cs.mixBlendMode);
    if (rpx(cs.opacity) < 1) f.push('o');
    if (cs.clipPath && cs.clipPath !== 'none') f.push('Q');
    if (rimage(cs.maskImage || cs.webkitMaskImage)) f.push('m');
    if (cs.transform && cs.transform !== 'none' && !/^matrix\(1, 0, 0, 1,/.test(cs.transform)) f.push('T');
    return ctx + '|' + f.join('.');
  }
  /* one root's plan, made a little at a time (rasterPlanRun, in cpu steps): [{ self: [elements], sig: [keys] } ..., then
     its whole steps]. A layer of six paths or more first draws six of them alone, of one kind where it can. ctxOf(el)
     names the layer of an element, skip(el) leaves a subtree out. A part (the page chrome, a card) is drawn as a growing
     prefix of its paint order: each draw adds the next painting elements in the window, at most RASTER_PREFIX of them
     and at most one of a kind no draw had yet (a heavy one after its parts), and the elements drawn stay drawn. The GPU
     batches neighbouring draws of one kind into one and links a program for the batch's mix of features, so what links
     is decided by which draws sit next to each other: drawn kind by kind, the part's whole draw then batched them
     differently again (P2-03 final, RTX 3090: the hero's whole step linked 4-7 FillRRectOp programs in Glass and
     Friendly, and a provider logo drawn with the other logos of its kind linked 4-6 in Basic Dark, 75-150 ms frames). A
     prefix of the paint order batches as the whole draw will, so each draw meets at most its own few new batches, and
     the whole draw after the last one meets none */
  function rasterPlanStart(root0, ctxOf, skip, wholes) {
    return { stack: [[root0, false]], ctxOf: ctxOf, skip: skip, wholes: wholes || [], items: [], slow: {}, msaa: {}, pre: [], units: [], local: {}, i: 0, phase: 0, steps: null,
      vw: window.innerWidth || 1, vh: window.innerHeight || 1 };
  }
  /* until(): true while the step has time left; true when the plan is done (p.steps) */
  function rasterPlanRun(p, until) {
    var seen = function (r) { return r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < p.vw && r.top < p.vh; };
    while (p.phase === 0 && p.stack.length) {
      if (!until()) return false;
      var top = p.stack.pop(), el = top[0], clip = top[1];
      if (!el.isConnected || p.skip && p.skip(el)) continue;
      var cs = getComputedStyle(el); if (cs.display === 'none') continue;
      var ctx = p.ctxOf(el), r = el.getBoundingClientRect(), inView = seen(r);
      /* a slow path as Chrome counts them for multisampling (cc DrawPathOp::CountSlowPaths: an anti-aliased path that is
         not a line, not a hairline, and not a concave fill under 64 x 64; ClipPathOp: an anti-aliased clip path). Whether a
         small fill is convex is not known here, so every filled SVG path counts (P2-03 final: counted only from 64 px,
         a card's layer went multisampled in the middle of its prefix and its next step linked 20 programs, a 242 ms
         frame on the RTX 3090); so do an HTML element's clip path and a dashed or dotted border (drawn as paths). Too
         many counted only draws a few paths early. */
      if (el.namespaceURI === SVGNS ? RASTER_SLOW.test(el.localName) && el.localName !== 'line' && cs.shapeRendering !== 'crispEdges' : true) {
        var sv = el.namespaceURI === SVGNS, stroked = sv && cs.stroke !== 'none' && rpx(cs.strokeWidth) > 0, filled = sv && cs.fill !== 'none';
        var clipP = !sv && cs.clipPath && cs.clipPath !== 'none' && !/^(inset|rect|xywh)\(|^(border|padding|content|margin|fill|stroke|view)-box$/.test(cs.clipPath);
        var dash = !sv && /^(dashed|dotted)$/.test(cs.borderTopStyle) && rpx(cs.borderTopWidth) > 0;
        if (stroked || filled || clipP || dash) (p.slow[ctx] = p.slow[ctx] || []).push({ el: el, inView: inView, kind: sv ? el.localName + (filled ? 'f' : '') + (stroked ? 's' + (cs.strokeDasharray !== 'none' ? 'd' : '') : '') : clipP ? 'clip' : 'dash' });
      }
      /* an image starts decoding now, so it draws in its own step (decoded late, it drew, and linked, in a later one) */
      if (el.localName === 'img' && el.decode && !el._pmuDecoding) {
        el._pmuDecoding = performance.now();
        el.decode().then(function () { this._pmuDecoded = true; }.bind(el), function () { this._pmuDecoded = true; }.bind(el));
      }
      p.items.push({ el: el, cs: cs, r: r, ctx: ctx, clip: clip, inView: inView });
      var rad = rpx(cs.borderTopLeftRadius) + rpx(cs.borderBottomRightRadius);
      var clips = clip || (rad > 0 && cs.overflowX !== 'visible' && el.namespaceURI !== SVGNS);
      var kids = [];
      for (var k = el.firstElementChild; k; k = k.nextElementSibling) kids.push(k);
      for (var j = kids.length - 1; j >= 0; j--) p.stack.push([kids[j], clips]);
    }
    if (p.phase === 0) {
      Object.keys(p.slow).forEach(function (ctx) {
        var all = p.slow[ctx]; if (all.length < RASTER_MSAA) return;
        p.msaa[ctx] = true;
        var by = {}; all.forEach(function (x) { (by[x.kind] = by[x.kind] || []).push(x); });
        var big = Object.keys(by).sort(function (a, b) { return by[b].length - by[a].length; })[0];
        var order = function (list) { return list.filter(function (x) { return x.inView; }).concat(list.filter(function (x) { return !x.inView; })); };
        var pick = order(by[big]).concat(order(all.filter(function (x) { return x.kind !== big; }))).slice(0, RASTER_MSAA + 2);
        p.pre.push({ self: pick.map(function (x) { return x.el; }), sig: [], label: 'msaa-' + ctx });
      });
      p.phase = 1;
    }
    while (p.phase === 1 && p.i < p.items.length) {
      if (!until()) return false;
      var it = p.items[p.i++];
      if (!it.el.isConnected) continue;
      /* an element at opacity 0 (an entrance the arrival plays, a control shown on hover) draws at 1, as it will */
      it.lit = it.cs.opacity === '0';
      it.sig = rasterSig(it.el, it.cs, it.r, (p.msaa[it.ctx] ? it.ctx : it.ctx.toLowerCase()) + (it.clip ? 'C' : ''));
      if (it.lit && it.sig) it.sig = it.sig.replace(/\.o$|\.o(?=\.)/, '');
      if (!it.inView || !it.sig) continue;
      var fresh = !rasterSeen[it.sig] && !p.local[it.sig];
      /* one unit an element; rasterTake takes up to rasterGrow of them a draw, an element of a new kind alone, a heavy
         one after its parts (rasterParts) */
      if (fresh) {
        p.local[it.sig] = true;
        rasterParts(it).forEach(function (pt) { p.units.push({ self: [it.el], lits: [it.lit], sig: [], unit: true, fresh: true, part: pt, label: 'part' }); });
      }
      p.units.push({ self: [it.el], lits: [it.lit], sig: fresh ? [it.sig] : [], unit: true, fresh: fresh, label: fresh ? it.sig : '' });
    }
    p.steps = p.pre.concat(p.units, p.wholes); p.phase = 2; p.items = null; p.stack = null;
    return true;
  }
  /* the roots of a room: the board room starts with the layer and the page chrome; then its cards in order */
  function rasterRoots(kind) {
    var roots = kind === 'board' ? [{ t: 'layer' }, { t: 'chrome' }] : [];
    rasterCards(kind).forEach(function (c) { roots.push({ t: 'card', el: c }); });
    return roots;
  }
  function rasterPlanFor(panel, rt) {
    if (rt.t === 'layer') { var p0 = rasterPlanStart(panel, null, null, [{ layer: true, label: 'layer' }]); p0.stack = []; p0.phase = 1; return p0; }
    if (rt.t === 'chrome') {
      return rasterPlanStart(panel, function () { return 'P'; }, function (el) { return el.classList && el.classList.contains('pmu-card') && el.parentNode && el.parentNode.classList.contains('pmu-board'); },
        [{ chrome: true, label: 'chrome' }]);
    }
    var card = rt.el, body = card.querySelector(':scope > .pmu-cardbody');
    return rasterPlanStart(card, function (el) { return body && body.contains(el) ? 'Y' : 'K'; }, null, [{ whole: card, card: true, label: 'card' }]);
  }
  /* the next root: the one done loses its marks (each draw's cleanup took the paint token off, so its layer is gone and
     nothing of it stays drawn) */
  function rasterAdvance(cur) {
    var rt = cur.roots[cur.ri];
    if (rt) rasterUnmark(rt.t === 'card' ? rt.el : document.getElementById('panel-usage'));
    cur.ri++; cur.pi = 0; cur.plan = null; cur.planning = null;
    rasterGrow = 1;
  }
  /* the next draw's name and pace without taking it (PM_WARM's add): light when it adds only elements of kinds already
     drawn, or is a card's whole draw (0-1 links measured) */
  function rasterPeek(r) {
    var cur = r.cur, rt = cur && cur.roots && cur.roots[cur.ri], s = rt && cur.plan ? cur.plan[cur.pi] : null;
    if (!rt) return { name: 'again', light: false };
    return { name: (rt.t === 'card' ? 'card' + cur.ri : rt.t) + ':' + (s ? (s.part ? 'part' : s.label) || (s.unit ? 'pre' : '') : ''),
      light: !!s && !s.part && (s.unit && !s.fresh || !!(s.whole && s.card)) };
  }
  /* the next draw (rasterNeed said 'draw'): the cursor moves past it now */
  function rasterTake(r) {
    if (rasterNeed(r) !== 'draw') return null;
    var cur = r.cur, kind = cur.room === r.w.room ? 'board' : 'spare', rt = cur.roots[cur.ri];
    if (!rt) {
      for (var i = 0; i < r.redo.length; i++) if (r.redo[i].room === cur.room) return r.redo.splice(i, 1)[0];
      return null;
    }
    var s = cur.plan[cur.pi], card = rt.t === 'card' ? rt.el : null, take = 1;
    var out = { room: cur.room, kind: kind, card: card, root: cur.ri, chromeOn: false };
    /* a part's prefix: the next units that bring no new kind, up to rasterGrow of them (one of a new kind alone) */
    if (s.unit && !s.fresh) {
      var els = s.self.slice(), lits = s.lits.slice();
      while (take < rasterGrow) { var nx = cur.plan[cur.pi + take]; if (!nx || !nx.unit || nx.fresh) break; els.push(nx.self[0]); lits.push(nx.lits[0]); take++; }
      out.els = els; out.lits = lits; out.label = 'pre' + take + ':' + rasterName(els[0]);
    } else if (s.unit) {
      out.els = s.self; out.lits = s.lits; out.part = s.part || null;
      out.label = s.part ? 'part:' + s.part.name + ':' + rasterName(s.self[0]) : 'new:' + rasterName(s.self[0]) + ':' + s.label;
    } else if (s.self) { out.els = s.self; out.lits = s.self.map(function () { return false; }); out.label = s.label; }
    else if (s.whole) { out.whole = s.whole; out.label = s.label; }
    else if (s.chrome) { out.chrome = true; out.chromeOn = true; out.label = s.label; }
    else { out.layer = true; out.label = s.label; }
    (s.sig || []).forEach(function (k) { rasterSeen[k] = true; });
    out.label = cur.room + ':' + (card ? 'card' + cur.ri + ':' : '') + out.label;
    cur.pi += take; cur.steps++;
    return out;
  }
  /* one draw (a frame callback): its marks and the paint token on, and a part's overrides. It returns the cleanup: the
     paint token off (the layer and what it drew go; a part's prefix marks stay, unseen, for its next draw), the
     overrides off, and a moved draw's own marks off */
  function rasterRun(r, s) {
    var panel = document.getElementById('panel-usage'); if (!panel) return null;
    var own = [], set = function (x, a, v) { if (s.again && !x.hasAttribute(a)) own.push(x); x.setAttribute(a, v); };
    if (s.els) {
      if (s.card && s.card.isConnected) set(s.card, 'data-pmu-raster-pieces', '');
      s.els.forEach(function (x, i) { if (x.isConnected) set(x, 'data-pmu-raster-self', s.lits && s.lits[i] ? 'lit' : ''); });
    } else if (s.whole) {
      /* drawn whole: the pieces' marks inside it go (a piece hides its children) */
      Array.prototype.forEach.call(s.whole.querySelectorAll('[data-pmu-raster-self], [data-pmu-raster-on]'), function (x) { x.removeAttribute('data-pmu-raster-self'); x.removeAttribute('data-pmu-raster-on'); });
      s.whole.removeAttribute('data-pmu-raster-self'); s.whole.removeAttribute('data-pmu-raster-pieces');
      set(s.whole, 'data-pmu-raster-on', '');
    } else if (s.chrome) {
      Array.prototype.forEach.call(panel.querySelectorAll('[data-pmu-raster-self]'), function (x) { if (!x.closest('.pmu-board > .pmu-card')) x.removeAttribute('data-pmu-raster-self'); });
      panel.removeAttribute('data-pmu-raster-self');
    }
    var off = s.part && s.els && s.els[0] && s.els[0].isConnected ? rasterPartOn(s.els[0], s.part) : null;
    rasterTok(r, (s.kind !== 'board' ? 'spare paint' : 'board paint') + (s.layer ? ' layer' : '') + (s.chromeOn ? ' chrome' : ''));
    if (RASTER_MARKS) { try { performance.mark('pmu-raster:' + s.label); } catch (error) {} }
    return function () {
      if (rast === r) rasterTok(r, r.spare ? 'spare' : null);
      if (off) off();
      own.forEach(function (x) { RASTER_ATTRS.forEach(function (a) { x.removeAttribute(a); }); });
    };
  }
  /* a late draw (Usage's onLate): split in two when it drew more than one element, else moved to the end of its room;
     late a second time it is dropped and recorded (warmState().raster.dropped) */
  function rasterLate(r, s) {
    rasterLog.late++;
    if (s.els) rasterPace(true);
    var n = (s.lates || 0) + 1;
    if (n >= 2) { if (rasterLog.dropped.length < 60) rasterLog.dropped.push(s.label); return; }
    var k = s.els ? s.els.length : 0;
    if (k > 1) { var h = Math.ceil(k / 2); r.redo.unshift(rasterAgain(s, 0, h, n), rasterAgain(s, h, k, n)); rasterLog.split++; }
    else { r.redo.push(rasterAgain(s, 0, k, n)); rasterLog.moved++; }
  }
  function rasterAgain(s, i, j, n) {
    return { room: s.room, kind: s.kind, card: s.card, root: s.root, layer: s.layer, whole: s.whole, chrome: s.chrome, chromeOn: s.chromeOn, part: s.part,
      els: s.els ? s.els.slice(i, j) : null, lits: s.lits ? s.lits.slice(i, j) : null, again: true, lates: n,
      label: 'again:' + s.label.replace(/^again:/, '') + (s.els && j - i < s.els.length ? '#' + i + '-' + j : '') };
  }
  /* ---- a heavy element drawn in parts (P2-03 final, coordinator's step-size split, 2026-10-17). An element whose own
     draw needs four or more GPU programs linked them all in its one draw (RTX 3090: the hero's two-gradient wide-colour
     plate i.pmu-skyfill and its cap, 4 FillRRectOp links, 100 ms; the 48 px gradient-clipped number, 4-5 links; the
     label's two text shadows). The raster is unseen (.004), so a draw may show such an element for one frame with part
     of its style overridden: each background layer alone, then its pseudo-element cap without and with its glow; the
     plain text, then the gradient box, then the clip; the text without its shadows, then one; a dashed border solid; an
     image or icon without its filter. Each part links a program or two, and the element's own draw after its parts
     links nothing new. The overrides are inline !important declarations on that element alone (data-pmu-raster-part
     for its pseudo-elements, 05-film.css), and the draw's cleanup restores what was there. ---- */
  function rasterText(el) { for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && /\S/.test(n.nodeValue)) return true; return false; }
  function rasterParts(it) {
    var el = it.el, cs = it.cs, out = [];
    if (el.namespaceURI === SVGNS) return out;
    var text = rasterText(el);
    /* the background clipped to the text of the element and its descendants (the hero's <b class="pmu-heronum">: its
       digits are in its children, their own ink transparent): the text drawn solid, then the gradient box, each with the
       text's elements shown for that frame */
    if (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text') {
      var kids = Array.prototype.filter.call(el.querySelectorAll('*'), rasterText);
      if (text) kids.unshift(el);
      if (!kids.length) return out;
      var flat = { '-webkit-background-clip': 'border-box', 'background-clip': 'border-box' };
      out.push({ name: 'text', css: Object.assign({ 'background-image': 'none', 'background-color': 'transparent' }, flat), tok: 'bare',
        kids: kids, kidCss: { color: '#808080', '-webkit-text-fill-color': '#808080' } });
      out.push({ name: 'box', css: flat, tok: 'bare', kids: kids, kidCss: { color: 'transparent', '-webkit-text-fill-color': 'transparent' } });
      return out;
    }
    var layers = cs.backgroundImage && cs.backgroundImage !== 'none' ? rsplit(cs.backgroundImage) : [];
    var caps = ['::before', '::after'].map(function (pe) { return getComputedStyle(el, pe); }).filter(function (ps) {
      return ps.content && ps.content !== 'none' && ps.content !== 'normal' && ps.display !== 'none' && !!rbox(ps, null);
    });
    if (layers.length > 1 || layers.length && caps.length) {
      if (layers.length > 1) layers.forEach(function (l, i) { out.push({ name: 'layer' + i, css: { 'background-image': l, 'background-color': 'transparent', 'box-shadow': 'none' }, tok: 'bare' }); });
      if (caps.length) {
        var none = { 'background-image': 'none', 'background-color': 'transparent', 'box-shadow': 'none' };
        if (caps.some(function (ps) { return ps.boxShadow && ps.boxShadow !== 'none'; })) out.push({ name: 'cap', css: none, tok: 'flat' });
        out.push({ name: 'glow', css: none });
      }
    }
    if (text && cs.textShadow && cs.textShadow !== 'none') {
      var sh = rsplit(cs.textShadow);
      out.push({ name: 'text', css: { 'text-shadow': 'none' } });
      if (sh.length > 1) out.push({ name: 'shadow', css: { 'text-shadow': sh[0] } });
    }
    if (/^(dashed|dotted)$/.test(cs.borderTopStyle) && rpx(cs.borderTopWidth) > 0) out.push({ name: 'solid', css: { 'border-style': 'solid' } });
    /* a provider mark or icon under a filter (Friendly's marks): the image alone first, then with its filter */
    if (cs.filter && cs.filter !== 'none' && (el.localName === 'img' || el.localName === 'svg' || el.localName === 'canvas')) out.push({ name: 'plain', css: { filter: 'none' } });
    return out;
  }
  function rasterOverride(el, css) {
    var had = el.hasAttribute('style'), saved = [];
    Object.keys(css).forEach(function (k) { saved.push([k, el.style.getPropertyValue(k), el.style.getPropertyPriority(k)]); el.style.setProperty(k, css[k], 'important'); });
    return function () {
      saved.forEach(function (x) { if (x[1]) el.style.setProperty(x[0], x[1], x[2]); else el.style.removeProperty(x[0]); });
      if (!had && !el.style.length) el.removeAttribute('style');
    };
  }
  function rasterPartOn(el, pt) {
    var undo = [rasterOverride(el, pt.css || {})], shown = [];
    if (pt.tok) el.setAttribute('data-pmu-raster-part', pt.tok);
    (pt.kids || []).forEach(function (k) {
      if (!k.isConnected) return;
      if (k !== el && !k.hasAttribute('data-pmu-raster-self')) { shown.push(k); k.setAttribute('data-pmu-raster-self', ''); }
      undo.push(rasterOverride(k, pt.kidCss || {}));
    });
    return function () {
      undo.forEach(function (f) { f(); });
      shown.forEach(function (k) { k.removeAttribute('data-pmu-raster-self'); });
      if (pt.tok) el.removeAttribute('data-pmu-raster-part');
    };
  }
  function rasterRoomDone(r, cur, cards, how) {
    rasterQuiet(r);
    if (how === 'spare') { if (PMU.board.rasterClear) PMU.board.rasterClear(); r.spare = false; rasterTok(r, null); }
    /* done only for the look and board class it was drawn in from its first draw */
    if (cur.key === rasterKey(cur.room)) rasterDone[cur.key] = true;
    rasterLog.rooms.push({ room: cur.room, at: Math.round(performance.now()), ms: Math.round(performance.now() - cur.t0), build: cur.build ? Math.round(cur.build) : 0,
      cards: cards, steps: cur.steps, plan: Math.round(cur.planMs || 0), how: how });
    r.redo = r.redo.filter(function (x) { return x.room !== cur.room; });
    r.rooms.shift(); r.cur = null;
  }
  function rasterSkip(r, room, why) {
    rasterLog.rooms.push({ room: room, skipped: why });
    if (PMU.board.rasterClear) PMU.board.rasterClear();
    r.spare = false; r.building = null; rasterTok(r, null);
    r.rooms.shift(); r.cur = null;
    if (!r.queued) rasterNext(r);
  }
  /* the pass is over: the panel as it was (its token and marks off, a queued step taken back), the board waiting where it
     was built */
  function rasterEnd(why) {
    var r = rast; if (!r) return;
    rasterUnqueue(r);
    rasterUnlisten(r);
    window.removeEventListener('resize', r.onResize);
    rasterQuiet(r);
    rast = null;
    if (PMU.board && PMU.board.rasterClear) PMU.board.rasterClear();
    rasterTok(r, null);
    rasterLog.ms = Math.round(performance.now() - r.t0);
    if (why) rasterLog.skipped = why;
    rasterLog.gate = null;
    warmPark(r.w);
  }
  /* stopped from outside (the arrival, a drop): the same, at once */
  function rasterStop(why) { if (rast) rasterEnd('stopped:' + (why || '')); }
  /* warmState().raster: what ran (the steps run, late, split, moved and dropped; the cpu steps by kind; the parks and
     their resume costs). steps: [label, at, late] */
  function rasterState() {
    var r = rast, qs = null;
    if (r) { try { qs = r.q.state('usage'); } catch (error) { qs = null; } }
    return { running: r ? { rooms: r.rooms.slice(), gate: rasterLog.gate, parked: r.parked, resumes: r.resumes, queued: !!r.queued,
        step: r.cur ? { room: r.cur.room, root: r.cur.ri, piece: r.cur.pi, spare: r.spare } : null } : null,
      ran: rasterLog.ran || 0, late: rasterLog.late || 0, split: rasterLog.split || 0, moved: rasterLog.moved || 0, dropped: (rasterLog.dropped || []).slice(),
      cpu: Object.assign({}, rasterLog.cpu || {}), queue: qs, rooms: rasterLog.rooms.slice(), at: rasterLog.at, ms: rasterLog.ms, parks: rasterLog.parks || 0, waits: rasterLog.waits || 0,
      resumeMs: (rasterLog.resumeMs || []).slice(), prefix: RASTER_PREFIX, skipped: rasterLog.skipped, done: Object.keys(rasterDone),
      kinds: Object.keys(rasterSeen).length, steps: (rasterLog.steps || []).slice() };
  }
  function warmDrop(why) {
    var w = warm; if (!w) return;
    rasterStop('drop');
    warm = null;
    warmLast = { why: why, built: w.built, at: Math.round(performance.now()) };
    var board = document.getElementById('pmuBoard'), panel = document.getElementById('panel-usage');
    if (panel) panel.removeAttribute('data-pmu-warm');
    if (board && board.parentNode) board.parentNode.removeAttribute('data-pmu-warm-wait');
    warmUnhide();
    if (!pageShown() && PMU.board && PMU.board.unmount) PMU.board.unmount();
  }
  /* a live beat while the page is hidden (the dashboards' beat, PMU.live): the warm board's cards that show its readings
     are rendered again at the arrival (warmRelease). Not in idle time: the board waits display: none, and laying it out
     again for a beat costs as much as a raster resume (rasterLog.resumeMs) on every beat, while the release renders
     only the cards the beats hit */
  function warmBeat(keys) { if (warm && keys) keys.forEach(function (k) { warm.shares[k] = true; }); }
  function warmCheck() {
    if (pageShown()) return;
    if (warm && (!warm.built || warm.key === warmKey())) return;
    warmDrop('stale');
    warmSoon(1200);
  }
  /* what can change what the board shows while the page is hidden: a look (PMU.theme), Settings (written from Usage's
     own controls on a dashboard, or on the Settings page), onboarding, and any other mount of the board */
  function warmWatch() {
    if (warmWatch.on || !PMU.board) return;
    warmWatch.on = true;
    if (PMU.settings && PMU.settings.onChange) PMU.settings.onChange(function (why) { if (why === 'page') return; warmRev++; warmCheck(); });
    if (PMU.theme && PMU.theme.onChange) PMU.theme.onChange(function () { warmCheck(); });
    if (PMU.board.on) PMU.board.on('mount', function (d) {
      /* a room the page has shown compiled what it draws: the raster leaves it out */
      if (d && !d.warm && d.room && d.cls && pageShown()) rasterDone[rasterKey(d.room, d.cls)] = true;
      if (!warm) return; if (d && d.warm) warm.mounted = true; else warmDrop('mount');
    });
    if (!window.MutationObserver) return;
    var sp = document.getElementById('panel-settings'), was = !!sp && sp.classList.contains('active');
    if (sp) new MutationObserver(function () { var on = sp.classList.contains('active'); if (on === was) return; was = on; warmRev++; if (!on) warmCheck(); })
      .observe(sp, { attributes: true, attributeFilter: ['class'] });
    var open = root.hasAttribute('data-o55-open');
    new MutationObserver(function () { var on = root.hasAttribute('data-o55-open'); if (on === open) return; open = on; if (!on) { warmRev++; warmCheck(); } })
      .observe(root, { attributes: true, attributeFilter: ['data-o55-open'] });
  }
  /* at the arrival: the warm board if it is built and still shows what a build would; anything else is dropped. A raster
     still running stops and the board parks first (its marks off, its wait on); the arrival takes it out of the wait in
     the same task (warmArrive), in the box the page really shows in (the Assistant seated beside it or not) */
  function warmTake() {
    clearTimeout(warmT); warmT = 0;
    var w = warm; if (!w) return null;
    if (!w.built || w.room !== st.room || w.key !== warmKey()) { warmDrop(w.built ? 'stale' : 'building'); return null; }
    rasterStop('arrival');
    warmPark(w);
    warm = null;
    return w;
  }
  /* no warm board (the arrival came before the warm build, or a look or Settings change dropped it): the board is built
     now, whole, in the task that changes the page (40-board.js mount opts.warm + opts.sync: every body measured in one
     read and rendered, each body's entrance queued on its card), so no frame shows its plates empty while slices build
     it. The click's answer (the shell's tab spring and Home's fade, on the compositor) is already running; the page's
     first frame waits for this task. Returned as a warm board built here (w.sync), or null when the board could not be
     built (no width: the page is not laid out) */
  function arriveWhole() {
    var t0 = performance.now(), built = false;
    try { PMU.board.mount(st.room, { warm: true, sync: true, onBuilt: function () { built = true; } }); } catch (error) { console.error('[pm-usage] arrival build', error); }
    if (!built) return null;
    return { room: st.room, built: true, shares: {}, ms: Math.round(performance.now() - t0), sync: true };
  }
  /* the held fallback's frame after the click (two rAFs: the first one's callbacks run before the click's own frame is
     drawn) */
  function nextFrame(fn) { requestAnimationFrame(function () { requestAnimationFrame(fn); }); }
  /* the page's own entrance (pm8-page-in) held by the shell: after a long frame the shell keeps a page's moves at their
     start until two frames in a row come on time (PM_START_ON_SHOWN, at most 6 frames). Read after the frame's layout
     (PM_AFTER_LAYOUT, the shell's), so the check forces no style */
  function pageHeld() {
    var p = document.getElementById('panel-usage');
    if (!p || !p.getAnimations) return false;
    return p.getAnimations().some(function (a) { return a.animationName === 'pm8-page-in' && a.playState === 'paused'; });
  }
  /* the page's own entrance is still to play or playing (not ended, not cut short) */
  function pageEntering() {
    var p = document.getElementById('panel-usage');
    if (!p || !p.getAnimations || !p.classList.contains('pm8-page-in')) return false;
    return p.getAnimations().some(function (a) { return a.animationName === 'pm8-page-in' && a.playState !== 'finished' && a.playState !== 'idle'; });
  }
  /* the held fallback waits for that hold to end, then builds in the frame after it */
  function afterPage(fn) {
    var n = 0, after = window.PM_AFTER_LAYOUT;
    if (typeof after !== 'function' || typeof window.PM_START_ON_SHOWN !== 'function') { nextFrame(fn); return; }
    var check = function () { if (pageHeld() && ++n < 10) { requestAnimationFrame(function () { after(check); }); return; } requestAnimationFrame(fn); };
    requestAnimationFrame(function () { after(check); });
  }
  /* ---- the arrival's unseen first draw (P2-03 final, 2026-10-17). The warm arrival showed its board a frame after the
     page (display: none through the click's frame), and the bodies' reveals were made in a task after that frame, after
     a re-measure: on the P1000 the page stood with an empty board area for ~100 ms, then with empty plates while the
     bodies waited (Basic warm 0.15-0.2 s, Friendly 0.45 s), and the first visible draw of the bodies linked the GPU
     programs the raster had not reached with those empty plates frozen on screen (Basic cold 1.1 s). Now everything is
     made in the task that changes the page (warmArrive): the board out of its wait and measured where it shows, then the
     whole entrance (the shell's power-on, the plates' rise, every body's reveal, the hero's instruments and light) with
     its animations paused at their start and its tweens and timers waiting (moment.wait). The page's own first frame
     (the long one, where the shell restyles the page) styles, lays out and paints the board as the entrance's first
     frame will show it; the shell holds the page's entrance at opacity 0 while its frames are late (PM_START_ON_SHOWN),
     and the GPU rasters what comes after a long frame (the entrance's layers included: an animation held at its start
     is a current one) before the frames come on time again, so the board is drawn, and any program it needs linked,
     while Home is still on screen. go runs in the frame the page's entrance starts, after its layout (this check is
     queued after the shell's own in the same delivery, so the two see the same frame) and plays the entrance from its
     first frame: the first frame anyone sees of the page has the whole board entering, plates and bodies together.
     Without the shell's hold (a page that changed in a short frame, Reduce Motion, no shell) go runs in the page's first
     frame. A moment that ends meanwhile (a rapid click, leaving the page) runs go at once. ---- */
  var ARRIVE_FRAMES = 12;
  function arriveHold(m, go) {
    var after = window.PM_AFTER_LAYOUT, n = 0;
    var check = function () {
      if (m && moment !== m) { go(false, n); return; }
      if (after && pageHeld() && ++n < ARRIVE_FRAMES) { requestAnimationFrame(function () { after(check); }); return; }
      go(true, n);
    };
    requestAnimationFrame(function () { if (typeof after === 'function') after(check); else { after = null; check(); } });
  }
  /* the board out of its wait: three attributes, no read */
  function warmShow(w, board) {
    var scroll = board.parentNode;
    if (scroll) scroll.removeAttribute('data-pmu-warm-wait');
    board.removeAttribute('data-held'); board.removeAttribute('data-hold-bodies');
  }
  function unwaitBodies(board) { Array.prototype.forEach.call(board.querySelectorAll(':scope > .pmu-card[data-body-wait]'), function (c) { c.removeAttribute('data-body-wait'); }); }
  /* the re-measure where the board shows (in the arrival's task: its reads lay the page out, the layout its first frame
     would run anyway): a tile one tier off renders again, its entrance queued; the cards that show a reading a live beat
     changed while the page was hidden render again too. A board built in this arrival's own task (w.sync) was measured
     where it shows */
  function warmMeasure(w, board) {
    if (w.sync) return;
    var cards = PMU.board.cardsNow().filter(function (c) { return c.isConnected; });
    var keys = Object.keys(w.shares || {}), live = keys.length && PMU.boards && PMU.boards.live ? cards.filter(function (c) { return PMU.boards.live.hit(c, keys); }) : [];
    w.live = live.length;
    if (PMU.board.tierPass) PMU.board.tierPass(cards.filter(function (c) { var b = c.querySelector(':scope > .pmu-cardbody'); return b && b._pmuKind && live.indexOf(c) < 0; }), 'held');
    if (live.length) PMU.board.fitSliced(function () { PMU.board.tierPass(live, 'enter'); });
    if (PMU.board.viewNow) PMU.board.viewNow(true);
  }
  function warmArrive(w, m, board, app) {
    var t0 = performance.now();
    warmShow(w, board);
    board.setAttribute('data-film', '');
    try { warmMeasure(w, board); } catch (error) { console.error('[pm-usage] warm re-measure', error); }
    var c1 = performance.now();
    /* the whole entrance is made here, held at its start (moment.wait): its animations paused at 0, its tweens and timers
       waiting, so the page's first frame styles, lays out and paints it as its first frame will show it, and the GPU
       rasters it, and links what it needs, under the shell's hold */
    m.wait = { at: [], timers: [], anims: [], t0: t0 };
    M.hold(true);
    m.t0 = performance.now();
    /* a room the page shows compiles what it draws: the raster leaves it out from here */
    rasterDone[rasterKey(m.room)] = true;
    shellIntro(app);
    var cards = PMU.board.cardsNow();
    w.framedAt = 0;
    frames(cards, { dir: 0, base: 0, board: board });
    warmRelease(w, m, board, cards);
    /* held at the middle of each move, not its first frame: a first frame at opacity 0 is not rastered (RTX 3090, the
       first try: 19 links after the hold, a 225 ms frame with the page at .21 and no plate on it), so the hold shows
       every plate, body, roll and light half way, which the GPU rasters (and links) unseen, the page at .004 over the
       shell's held 0 and the bodies on their own layers, the ones their reveals animate (the panel's data-pmu-arrive,
       05-film.css). arriveGo rewinds each to 0 */
    m.anims.forEach(function (a) {
      if (!a || !a.effect || typeof a.pause !== 'function') return;
      try {
        if (a.playState === 'finished' || a.playState === 'idle') return;
        a.pause();
        var tm = a.effect.getTiming(), ct = a.effect.getComputedTiming();
        a.currentTime = (+tm.delay || 0) + (isFinite(ct.activeDuration) ? ct.activeDuration / 2 : 0);
        m.wait.anims.push(a);
      } catch (error) {}
    });
    var panel = document.getElementById('panel-usage');
    if (panel) panel.setAttribute('data-pmu-arrive', '');
    if (last) last.goMs = [Math.round((c1 - t0) * 10) / 10, Math.round((performance.now() - c1) * 10) / 10];
    arriveHold(m, function (ok, n) { arriveGo(m, n); });
  }
  /* the page's entrance starts: the board's starts with it, from its first frame */
  function arriveGo(m, n) {
    var w = m.wait; if (!w) return;   /* the moment ended meanwhile (unwait wrote its end states) */
    m.wait = null; M.hold(false);
    var panel = document.getElementById('panel-usage');
    if (panel) panel.removeAttribute('data-pmu-arrive');
    if (moment !== m) return;
    var now = performance.now();
    /* a page whose entrance the shell ended while it was held (its completion fallback, PM7_MOTION_FINISH, counts only
       running moves: a hold over ~380 ms ends it and the page shows at once, RTX 3090 a5) shows now at full opacity: the
       board goes on from half way instead of starting again from an empty frame */
    var cut = n > 0 && !pageEntering();
    m.holdMs = Math.round(now - w.t0); m.holdFrames = n; m.t0 = now; m.cut = cut;
    w.anims.forEach(function (a) { try { if (a.playState === 'paused') { if (!cut) a.currentTime = 0; a.play(); } } catch (error) {} });
    w.timers.forEach(function (t) { m.timers.push(setTimeout(t.fn, Math.max(0, t.ms) * M.speed())); });
    w.at.forEach(function (t) { setTimeout(t.fn, Math.max(0, t.ms) * M.speed()); });
    /* the preset hold a mount schedules (40-board.js holdPass) waited for the arrival */
    if (PMU.board.holdSoon) PMU.board.holdSoon(500);
    if (last) { last.holdMs = m.holdMs; last.holdFrames = n; last.anims = w.anims.length; last.cut = cut; }
  }
  /* the bodies come in with their plates (P2-03 final): each supporting body's quiet reveal starts with its own plate's
     rise, the hero's body with its plate and its instruments and light at T3.heroAt as before; a plate never stands
     empty, and nothing waits for a task after the first frame */
  function warmRelease(w, m, board, cards) {
    cards = cards.filter(function (c) { return c.isConnected; });
    m.released = true; m.heroAt = T3.heroAt; m.quietAt = m.heroAt + T3.quietGap;
    board.removeAttribute('data-pm-hover-exempt');
    var el = since(m);
    var built = cards.filter(function (c) { var b = c.querySelector(':scope > .pmu-cardbody'); return b && b._pmuKind && c.hasAttribute('data-body-wait'); });
    built.sort(function (a, b) { return (b.hasAttribute('data-hero') - a.hasAttribute('data-hero')) || (+a.dataset.y - +b.dataset.y) || (+a.dataset.x - +b.dataset.x); });
    built.forEach(function (c) {
      var at = c._pmuFrameAt == null ? 0 : c._pmuFrameAt;
      if (c.hasAttribute('data-hero')) { c._pmuRevealAt = Math.max(m.heroAt, el); reveal(c, { delay: Math.max(0, m.heroAt - el), bodyAt: Math.max(0, at - el) }); return; }
      if (!flag('heroRoll')) { bodyBuilt(c); return; }
      c._pmuRevealAt = Math.max(at, el);
      reveal(c, { quiet: true, delay: Math.max(0, at - el) });
    });
    deferHoverTags(T3.heroNum + T3.heroInstr + 1500);
    allBuilt(m.room, cards);
    last = { room: m.room, why: w.sync ? 'whole' : 'warm', cards: cards.length, warmMs: w.ms, live: w.live || 0 };
  }
  /* Reduce Motion: the warm board shows with the page, whole, and dissolves in as the calm entry does */
  function warmCalm(w, board) {
    var t0 = performance.now();
    warmShow(w, board);
    unwaitBodies(board);
    arriveHold(null, function () {
      var keys = Object.keys(w.shares || {});
      if (keys.length && PMU.boards && PMU.boards.live) { try { PMU.board.cardsNow().forEach(function (c) { if (PMU.boards.live.hit(c, keys)) PMU.cards.update(c, 'live'); }); } catch (error) {} }
      dissolve(board);
      if (PMU.board.holdSoon) PMU.board.holdSoon(500);
      last = { room: st.room, at: 0, why: w.sync ? 'whole-calm' : 'warm-calm', cards: PMU.board.cardsNow().length, warmMs: w.ms, holdMs: Math.round(performance.now() - t0) };
    });
  }

  /* ---- 5 the first arrival on Usage ---- */
  function arrive(o) {
    o = o || {};
    var app = document.getElementById('pmuApp'), board = document.getElementById('pmuBoard');
    if (!app || !board || !PMU.board) return;
    if (M.paused()) { warmDrop('paused'); finishMoment('instant'); hold = null; PMU.board.mount(st.room, {}); return; }
    var w = warmTake();
    /* the app seats the Assistant beside every non-Home page in its first frame after the page change; seating it now
       gives the board its final width before anything is measured or built */
    try { if (window.PM7_SHELL_ADJUSTMENTS && typeof window.PM7_SHELL_ADJUSTMENTS.seatChat === 'function') window.PM7_SHELL_ADJUSTMENTS.seatChat(); } catch (error) {}
    /* Reduce Motion: no arrival; the board shows whole with the page and dissolves in */
    if (reduced()) {
      finishMoment('instant'); hold = null;
      if (!w) w = arriveWhole();
      if (w) { warmCalm(w, board); return; }
      requestAnimationFrame(function () { requestAnimationFrame(function () { if (!moment && !hold) PMU.board.mount(st.room, { calmEntry: true }); }); });
      return;
    }
    var m = begin('arrive', st.room);
    deferHoverTags(4000);
    board.setAttribute('data-pm-hover-exempt', 'entering');
    if (!w) w = arriveWhole();
    if (w) { hold = null; warmArrive(w, m, board, app); return; }
    /* the board could not be built here: the held build of old, in the frame after the page's entrance starts (the
       plates enter from its first slice, each body revealed as it is built) */
    shellIntro(app);
    var h = { board: board, room: st.room, start: performance.now(), built: false, hero: false, m: m };
    hold = h;
    board.setAttribute('data-held', '');
    afterPage(function () {
      if (hold !== h || moment !== m) return;
      PMU.board.mount(st.room, { held: true, onBuilt: function (cards) { if (hold === h) h.built = true; else if (moment === m && m.released) allBuilt(h.room, cards || []); } });
      watch(h);
    });
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
    /* the warm arrival (motion QA P2-03) */
    warmSoon: warmSoon, warming: warming, warmDrop: warmDrop, warmBeat: warmBeat, warmUnhide: warmUnhide,
    warmState: function () {
      return { warm: warm ? { room: warm.room, built: warm.built, ms: warm.ms || null, box: warm.box, parked: !!warm.parked, hidden: !!warmA11y } : null, last: warmLast,
        raster: rasterState() };
    },
    deferHoverTags: deferHoverTags, last: function () { return last; }, off: off, parsePath: parsePath, yAt: yAt,
    soft: soft, innerOn: innerOn, glint: glint, combo: combo,
    /* round 3 */
    begin: begin, finish: finishMoment, moment: function () { return moment; }, onMoment: function (fn) { momentListeners.push(fn); },
    frames: frames, reveal: reveal, bodyBuilt: bodyBuilt, allBuilt: allBuilt, ghost: ghost, reversible: reversible, reverse: reverse,
    lit: lit, isQuiet: quietEl, lightBudget: lightBudget, flag: flag,
    budget: function (card, on) { if (card) card._pmuBudget = on !== false; }, lightAt: lightAt, rectIn: rectIn,
    snapShares: noop, flight: noop, pairFlights: noop, flightCards: function () { return []; }, irisAt: irisAt, glitch: glitch, dissolve: dissolve,
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
   pauses for one load (harnesses).
   Dashboards (D10 P12): every beat's share keys also go to the Home dashboards (PMU.boards.live.beat); a shown one patches
   only the cards they match, a hidden one keeps them for its show; with the beat's lead keys it lights the lead in its
   own layer (lightAt with o.layer, the calm light under Reduce Motion) and tells its kind, whose Live mark can pulse
   (PMU.live.pulse). While the Usage page is hidden the beats go on, one
   per 3 ticks, only while a shown dashboard holds a Usage widget (and the tab shows): the deltas apply and the dashboards
   patch; the Usage board is left alone, since its next arrival builds it from the overlay as it is then. */
(function () {
  var root = document.documentElement, M = PMU.motion;
  var STORE_KEY = 'pm7:usage:live:v1';
  var enabled = !PMU.flags || PMU.flags.live !== false;
  var urlOff = (function () { try { return /[?&]pmu-live=(off|0)\b/.test(location.search); } catch (error) { return false; } })();
  var overlay = {};
  var S = { on: enabled && !urlOff && STORE.get(STORE_KEY, 'on') !== 'paused', ticks: 0, lastTick: 0, lastBeat: 0, firstAt: 0, armed: false,
    pending: null, subscribed: false, momentEnd: 0, count: 0, hostTicks: 0 };
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
    if (!usageShown()) { hostedTick(); return; }
    if (!S.armed || document.hidden) return;
    if (S.firstAt && now < S.firstAt - period * 0.5) return;
    var due = S.firstAt ? (S.firstAt = 0, true) : (++S.ticks >= 3);
    if (!due && S.pending && !heldBy()) { flush(); return; }
    if (!due) return;
    S.ticks = 0;
    advance();
  }
  /* the Usage page hidden (D10 P12): a beat per 3 ticks while a shown dashboard holds a Usage widget and the tab shows;
     between them a dashboard whose hold ended patches what it kept. No dashboard shown: nothing runs. */
  function hostedTick() {
    var B = PMU.boards && PMU.boards.live;
    if (document.hidden || !B || !B.wanted()) return;
    if (++S.hostTicks < 3) { B.flush(); return; }
    S.hostTicks = 0;
    advance(null, true);
  }
  /* a beat's share keys to the dashboards: a shown one patches the cards they match, a hidden one keeps them; its lead
     keys light the lead change on a dashboard as they do here */
  function hosted(keys, lead) {
    var B = PMU.boards && PMU.boards.live;
    if (B && keys && keys.length) { try { B.beat(keys, lead || []); } catch (error) { console.error('[pm-usage] live boards', error); } }
  }
  /* one step of the script: the deltas apply now; the dashboards hear it; the page patches now or, while held, at the end
     of the hold (hostedOnly: the Usage page is hidden and keeps nothing for it) */
  function advance(index, hostedOnly) {
    var L = PMU.data && PMU.data.live; if (!L || !L.apply) return null;
    var i = index != null ? index : (L.next ? L.next(overlay) : 0);
    if (i == null || i < 0) return null;
    var info = null;
    try { info = L.apply(overlay, i); } catch (error) { console.error('[pm-usage] live apply', error); return null; }
    if (!info) return null;
    hosted(info.shares, info.lead);
    if (hostedOnly) { if (PMU.film && PMU.film.warmBeat) PMU.film.warmBeat(info.shares || []); return info; }
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
      /* a reading inside the card carries a changed share key, or its data-live names a prefix of one (the dashboards'
         match too: PMU.boards.live.hit, 40-board.js) */
      all.forEach(function (c) { if (PMU.boards.live.hit(c, keys)) cards.push(c); });
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
    /* the dashboards had the beat's keys when its deltas applied (advance, hourTick): each patches only what they match */
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
    pulseRing(ring);
  }
  /* the pulse on a ring element: the Usage indicator's, or a dashboard kind's own Live mark (PMU.live.pulse, on the
     board's 'beat' event); none under Reduce Motion */
  function pulseRing(ring) {
    if (!ring || M.reduced()) return null;
    var f = M.family();
    if (f === 'retro' || f === 'nier') return M.animate(ring, [{ opacity: 1 }, { opacity: 0 }], { dur: 240, easing: 'steps(2,jump-none)' });
    return M.animate(ring, [{ transform: 'scale(.6)', opacity: 0.5 }, { transform: 'scale(2.2)', opacity: 0 }], { dur: 600, easing: 'cubic-bezier(.22,.8,.28,1)' });
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
    subscribe();   /* played from a dashboard (PMU.boards.hour) before Usage was ever opened, the tick may not be heard yet */
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
    hosted((info && info.shares) || [], info && info.lead);   /* a shown dashboard patches every step (D10 P12) */
    /* the Usage page hidden keeps nothing for it, as a hosted beat does (advance(null, true)): its next arrival builds
       from the overlay as it is then, so a step queued here was patched and pulsed again on its first beat (review
       2026-10-10) */
    if (!usageShown()) { syncHead(); return; }
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
    reset: function () { var L = PMU.data && PMU.data.live; if (L && L.reset) L.reset(overlay); else Object.keys(overlay).forEach(function (k) { delete overlay[k]; }); S.pending = null; S.ticks = 0; if (window.PM7_USAGE && PM7_USAGE.rerender && usageShown()) PM7_USAGE.rerender(); else if (PMU.boards) PMU.boards.touch('data'); return true; },
    sync: syncCtl,
    /* the tick subscription, asked for by a dashboard as it shows (40-board.js show): the demo engine boots after this
       script, and Usage may never be opened (D10 P12) */
    wake: subscribe,
    /* a dashboard's lead light and Live mark (D10 round two): the elements a lead key's reading sits in (the lead's
       light fills the nearest of them, as here), and the indicator's pulse on a ring of the kind's own */
    LEAD_HOST: LEAD_HOST,
    pulse: pulseRing
  };
})();
