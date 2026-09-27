/* turn-stage.js -- Chat WOW (2026-09-26). OWNER of turn-stage.css and the spine.
 *
 * 1. Families. app.js stamps every transcript item with data-family from its own
 *    default map (renderTranscriptItems / familyOf). This module answers the
 *    `transcriptFamily` slot for types whose family depends on their content.
 * 2. The spine layer (Turn Stage take). Cards clip their own overflow, so a spine
 *    drawn from each item's pseudo-elements disappears behind every card. Instead
 *    one SVG layer sits behind the whole transcript (.tx-spine-layer, JS-owned):
 *    per assistant turn it draws the presence mark, a hairline through the turn's
 *    items, a family tick where each card meets it, and a dot where the turn ends.
 *    While a turn is live the mark lights, its satellite orbits while the
 *    assistant is thinking, and a comet of light runs down the line to whatever is
 *    being written or worked on. Nodes are reused by key so CSS animations never
 *    restart on redraw.
 *
 * Families: prose | user | work | deliverable | needs | people | time | ledger.
 */
(function () {
  'use strict';
  var EXT = window.PM56_EXT;
  if (!EXT || !EXT.slot) return;
  var FAMILIES = ['prose', 'user', 'work', 'deliverable', 'needs', 'people', 'time', 'ledger'];
  var EXTRA = { 'collab-receipt': 'people', 'af-revert-result': 'ledger', 'b13-lens-controls': 'ledger' };
  EXT.slot('transcriptFamily', function (ctx) {
    var m = ctx.m;
    if (!m) return '';
    if (m.type === 'agent-work' && window.PM56_RECORDS) {
      var k = (window.PM56_RECORDS.reference(m) || {}).kind;
      return k === 'activity' ? 'people' : k === 'inspection' ? 'ledger' : 'deliverable';
    }
    return EXTRA[m.type] || '';
  });

  /* ------------------------------------------------------------ spine layer */
  var SVGNS = 'http://www.w3.org/2000/svg';
  var TICKED = { work: 1, deliverable: 1, needs: 1, people: 1, time: 1 };
  var raf = 0, ro = null, mo = null, observed = null;
  var nodes = new Map();           // key -> element, reused across draws

  function el(tag, cls) { var e = document.createElementNS(SVGNS, tag); if (cls) e.setAttribute('class', cls); return e; }
  function group(svg, cls) { var g = svg.querySelector(':scope > g.' + cls); if (!g) { g = el('g', cls); svg.appendChild(g); } return g; }
  function node(svg, key, tag, cls) {
    var e = nodes.get(key);
    if (!e || !e.isConnected) { e = el(tag, cls); nodes.set(key, e); group(svg, cls === 'sp-tick' ? 'sp-ticks' : 'sp-lines').appendChild(e); }
    e.__seen = true;
    return e;
  }
  function set(e, attrs) { for (var k in attrs) { var v = String(attrs[k]); if (e.getAttribute(k) !== v) e.setAttribute(k, v); } }
  function markNode(svg, key) {
    var g = nodes.get(key);
    if (!g || !g.isConnected) {
      g = el('g', 'sp-mark');
      var ring = el('circle', 'sp-ring'); ring.setAttribute('r', '5.4'); g.appendChild(ring);
      /* the invisible hub circle centres the group's fill-box on the mark, so a
         CSS rotation about the fill-box centre orbits the satellite round it.
         The satellite rides ON the ring (radius 5.4), a bead on the stroke: one
         orbiting outside it drew letter shapes (a Q, a ring with a tail) as it
         went round. */
      var orbit = el('g', 'sp-orbit'); var hub = el('circle', 'sp-hub'); hub.setAttribute('r', '8.4'); orbit.appendChild(hub); var sat = el('circle', 'sp-sat'); sat.setAttribute('r', '2.2'); sat.setAttribute('cx', '3.82'); sat.setAttribute('cy', '-3.82'); orbit.appendChild(sat); g.appendChild(orbit);
      group(svg, 'sp-marks').appendChild(g); nodes.set(key, g);
    }
    g.__seen = true;
    return g;
  }

  function schedule() { if (!raf) raf = requestAnimationFrame(draw); }
  function arm() {
    var tr = document.querySelector('.transcript'), inner = tr && tr.querySelector('.transcript-inner');
    if (!inner || inner === observed) return;
    if (ro) ro.disconnect(); if (mo) mo.disconnect();
    observed = inner; nodes.clear();
    var layer = tr.querySelector('.tx-spine-layer'); if (layer) layer.textContent = '';
    ro = new ResizeObserver(schedule); ro.observe(inner);
    mo = new MutationObserver(function (list) { schedule(); births(list); });
    mo.observe(inner, { childList: true, attributes: true, subtree: true, attributeFilter: ['data-streaming', 'data-turn-pos', 'data-flight', 'data-turn'] });
    schedule();
  }

  function draw() {
    raf = 0;
    var tr = document.querySelector('.transcript');
    var inner = tr && tr.querySelector('.transcript-inner');
    var layer = tr && tr.querySelector('.tx-spine-layer');
    if (!inner || !layer) return;
    if (inner !== observed) { arm(); return; }
    if (tr.getAttribute('data-variant') !== '16') { if (layer.firstChild) { layer.textContent = ''; nodes.clear(); } return; }
    var svg = layer.firstChild;
    if (!svg || String(svg.tagName).toLowerCase() !== 'svg') {
      layer.textContent = ''; nodes.clear(); svg = el('svg', 'sp-svg'); layer.appendChild(svg);
      group(svg, 'sp-lines'); group(svg, 'sp-ticks'); group(svg, 'sp-marks');   /* paint order: lines, ticks, marks */
    }
    var tR = tr.getBoundingClientRect(), sT = tr.scrollTop;
    var gutter = parseFloat(getComputedStyle(inner).getPropertyValue('--tx-gutter')) || 26;
    /* The SVG is 1px tall and draws everything as paint overflow: paint
       overflow never counts as scrollable area. A layer sized to the content
       was one frame stale whenever the content shrank (a card folding), and
       for that frame it held the scroll height up, then let it drop at once. */
    layer.style.height = '';
    if (svg.hasAttribute('viewBox')) svg.removeAttribute('viewBox');
    set(svg, { width: Math.round(tR.width), height: 1 });
    nodes.forEach(function (n) { n.__seen = false; });
    var turns = {}, order = [];
    var kids = inner.children;
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i], pos = k.getAttribute('data-turn-pos');
      if (!pos || pos === 'user') continue;
      var t = k.getAttribute('data-turn') || '0';
      if (!turns[t]) { turns[t] = []; order.push(t); }
      turns[t].push(k);
    }
    order.forEach(function (t) {
      var list = turns[t];
      var r0 = list[0].getBoundingClientRect();
      var x = Math.round(r0.left - tR.left - gutter + 9) + 0.5;
      var yMark = r0.top - tR.top + sT + 10;
      var last = list[list.length - 1], rl = last.getBoundingClientRect();
      var yEnd = rl.top - tR.top + sT + 17;
      var live = null, pending = false;
      list.forEach(function (it) {
        var s = it.getAttribute('data-streaming');
        if (s === 'pending') pending = true;
        if ((s && s !== 'pending') || (it.classList.contains('working-card') && !it.classList.contains('is-done')) || it.querySelector(':scope > .working-card:not(.is-done)')) live = it;
      });
      var mk = markNode(svg, 'm' + t);
      set(mk, { transform: 'translate(' + x + ' ' + yMark.toFixed(1) + ')', 'data-state': pending ? 'pending' : live ? 'live' : 'rest' });
      if (list.length > 1) {
        var line = node(svg, 'l' + t, 'path', 'sp-line');
        set(line, { d: 'M' + x + ' ' + (yMark + 9).toFixed(1) + 'V' + yEnd.toFixed(1) });
        var end = node(svg, 'e' + t, 'circle', 'sp-end');
        set(end, { cx: x, cy: yEnd.toFixed(1), r: 2.4 });
      }
      list.forEach(function (it, j) {
        if (j === 0) return;
        var fam = it.getAttribute('data-family');
        if (!TICKED[fam]) return;
        var r = it.getBoundingClientRect();
        var tk = node(svg, 't' + t + ':' + (it.getAttribute('data-k') || j), 'circle', 'sp-tick');
        var attrs = { cx: x, cy: (r.top - tR.top + sT + 17).toFixed(1), r: 3.4, 'data-f': fam };
        if (fam === 'work') { var src = it.classList.contains('working-card') ? it : (it.querySelector('.working-card') || it); var c = getComputedStyle(src).getPropertyValue('--pm-step').trim(); attrs.style = c ? 'fill:' + c : ''; }
        set(tk, attrs);
      });
      /* the comet: light running from the mark down to what is live */
      if (live) {
        /* a streaming reply's live point is its caret (the writing edge), not
           its box, whose foot is the hover row's reserved space. A comet only
           once it has real length: a few pixels under the ring read as a glyph
           (a ring with a tail), not as light travelling. */
        var rL = live.getBoundingClientRect(), yLive;
        if (live.getAttribute('data-streaming')) {
          var cr = live.querySelector('.tx-caret'), rc = cr && cr.getBoundingClientRect();
          yLive = rc && rc.height ? rc.top + rc.height / 2 - tR.top + sT : rL.bottom - tR.top + sT - 34;
        } else yLive = rL.top - tR.top + sT + 17;
        if (yLive - yMark > 40) {
          var cm = node(svg, 'c' + t, 'path', 'sp-comet');
          set(cm, { d: 'M' + x + ' ' + (yMark + 9).toFixed(1) + 'V' + yLive.toFixed(1), pathLength: 100 });
        }
      }
    });
    nodes.forEach(function (n, key) { if (!n.__seen) { if (n.parentNode) n.parentNode.removeChild(n); nodes.delete(key); } });
  }

  /* ---- birth: a live turn's working card unfolds out of the turn mark ---
     A card whose record has just started (a live turn, the Multi Orbit run's
     next burst) opens as a circle growing from the mark in the gutter to the
     whole card. Cards mounted by a thread switch or history load are old
     records and simply appear. Voices: basic grows, friendly overshoots, glass
     clears from blur, retro steps. */
  function births(list) {
    var c; try { c = EXT.ctx(); } catch (e) { return; }
    list.forEach(function (mu) {
      mu.addedNodes && mu.addedNodes.forEach && mu.addedNodes.forEach(function (n) {
        if (!n || n.nodeType !== 1) return;
        var card = n.classList && n.classList.contains('working-card') ? n : (n.querySelector && n.querySelector(':scope > .working-card'));
        if (!card || card.__born) return;
        var rec = c.state.works && c.state.works[card.getAttribute('data-card')];
        if (!rec || !rec.running || (rec.clock || 0) > 1.2) return;
        card.__born = true;
        birth(card);
      });
    });
  }
  function birth(card) {
    var M = window.PM56_MOTION;
    if (M && M.reduced && M.reduced()) return;
    var tr = document.querySelector('.transcript');
    var voice = tr ? tr.getAttribute('data-voice') : 'basic';
    var gutter = parseFloat(getComputedStyle(card.parentElement).getPropertyValue('--tx-gutter')) || 24;
    var ox = -(gutter - 9), oy = 10;                       /* the mark, in card coordinates */
    var r = card.getBoundingClientRect();
    var far = Math.hypot(r.width - ox, r.height) + 20;
    var ms = window.PM56_CLOCK ? window.PM56_CLOCK.ms(560) : 560;
    var from = 'circle(6px at ' + ox + 'px ' + oy + 'px)', to = 'circle(' + far.toFixed(0) + 'px at ' + ox + 'px ' + oy + 'px)';
    var kf = [{ clipPath: from, opacity: 0.6 }, { clipPath: to, opacity: 1 }];
    var ease = 'cubic-bezier(.2,.8,.2,1)';
    if (voice === 'friendly') { kf = [{ clipPath: from, transform: 'scale(.97)' }, { clipPath: to, transform: 'scale(1.01)', offset: 0.75 }, { clipPath: to, transform: 'none' }]; ease = 'cubic-bezier(.34,1.3,.64,1)'; }
    else if (voice === 'glass') { kf = [{ clipPath: from, filter: 'blur(8px)', opacity: 0.4 }, { clipPath: to, filter: 'blur(0px)', opacity: 1 }]; ease = 'cubic-bezier(.05,.7,.1,1)'; }
    else if (voice === 'retro') { ease = 'steps(7,end)'; }
    card.animate(kf, { duration: ms, easing: ease });
    try { if (window.PM56_SOUND) window.PM56_SOUND.play('work'); } catch (e) { }
  }

  /* app.js re-renders the transcript; re-arm whenever its inner list is a new
     element, and redraw on anything that changes geometry. */
  function boot() {
    arm();
    var root = document.getElementById('pmRoot');
    if (root) new MutationObserver(function () { if (!observed || !observed.isConnected) arm(); }).observe(root, { childList: true, subtree: true });
    window.addEventListener('resize', schedule);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 0); });
  else setTimeout(boot, 0);

  window.PM56_STAGE = { families: FAMILIES.slice(), redraw: function () { draw(); } };
})();
