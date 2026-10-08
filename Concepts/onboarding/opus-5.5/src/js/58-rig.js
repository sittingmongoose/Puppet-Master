/* O55.art.rig — the marionette as one linked system (ties and hooks are rendered in 50-art-core.js). Every frame:
   1. the control bar tilts, and lifts a little, on the motion clock, with the family's feel;
   2. each tied helper hangs from its string: when its point on the bar rises, the helper is lifted with it; when the
      point drops, the helper stays standing and its string goes slack and sags; it swings after its point with a
      spring's lag and leans toward the pull, pivoting on its feet;
   3. a raised hand tied to the bar rises and falls with its string, with a small wave of its own;
   4. every string is drawn between its two hook points, so it stays attached through the entrance, beat glides and
      all of the above; a helper can also be made to cheer (A.rig.cheer) and the whole troupe to celebrate.
   Cost: while props are still arriving (an entrance, a beat glide) the hooks are measured, all reads before any
   write, once a frame. Once settled, each hook's place inside its own group is cached and every later frame is plain
   arithmetic on the transforms the rig itself sets: no layout reads on this very large page.
   A scene that re-renders in place (a beat change, or the name sign relettered on every keystroke) keeps its motion:
   the rig's own transforms are held across the morph and the swing carries on from where it was, so the bar never
   snaps back to level. A tied prop can be plucked (A.rig.pluck): a sideways kick into its spring, a wobble and a
   small dip that settle on their own, as when a letter lands on the name sign.
   Retro moves in whole pixels on a stepped clock and never rotates: the bar hops, the helpers hop with it, the waving
   helper swaps between two frames, and a pluck drops the prop one pixel step for a beat. Reduced Motion and
   low-resource mode hold the ambient motion still; nothing runs while the scene is hidden, paused or gone.
   The troupe's acting (O55.art.troupe, 59-cheer.js) adds, for NieR's units:
   - a drop of the control unit below its mark (A.rig.bar: the strings go slack and sag, the units stay standing; a
     drawing marked asleep starts SLEEP.drop low) and a held offset of a waving arm (A.rig.arm: asleep, it hangs down);
     both move in held steps on the motion clock;
   - a measuring window re-armed by every arrival (watch(svg, { settle, payout })): strings follow props that fly in,
     paying out straight (no sag) while they do;
   - rest lengths from the drawing (data-rest), so a drawing born slack sags from its first frame;
   - a held ensemble (.o55-ens-hold): the units wait at the top of their fly-in (their inner group's --o55-fly), and the
     strings end on their knots there without measuring.
   NieR's idle sway is decoration: it stops while the NieR parts leave out Scan sweep (the Still and Colors only
   presets), like the drawings' own loops (30-art.css). */
(function () {
  'use strict';
  const O55 = window.O55, A = O55.art, M = O55.motion;
  /* tilt (deg) and period (ms) of the bar; bob (px); lift share; sideways follow; lean (deg per px); arm (deg per px of
     hand-point rise); a small wave of the hand of its own; spring stiffness and damping */
  const FEEL = {
    basic: { tilt: 1.7, period: 6400, bob: 1.6, lift: 1, swing: 0.55, lean: 0.12, arm: 1.1, wave: 4, waveHz: 0.9, k: 60, c: 15 },
    friendly: { tilt: 3.4, period: 3900, bob: 2.4, lift: 1, swing: 0.75, lean: 0.2, arm: 1.5, wave: 9, waveHz: 1.3, k: 95, c: 7 },
    glass: { tilt: 2.1, period: 8200, bob: 3, lift: 1, swing: 0.6, lean: 0.1, arm: 1, wave: 5, waveHz: 0.7, k: 28, c: 8 },
    retro: { step: 380, hop: 4 },
    /* NieR: crisp and mechanical, little overshoot (near critical damping), and stepped: the idle sway is sampled on a
       `tick` clock (ms) and redrawn only once a tick (8 Hz), the springs integrated over the tick in small sub-steps;
       the bar's tilt (deg), its lift and a cheer's hop (units) move in quantum steps (qTilt, qLift, qHop). Arrivals,
       cheers and plucks keep the full frame rate and stay smooth. */
    nier: { tilt: 1.2, period: 7200, bob: 1.2, lift: 1, swing: 0.5, lean: 0.08, arm: 1, wave: 3, waveHz: 0.8, k: 70, c: 18, tick: 125, qTilt: 0.3, qLift: 0.5, qHop: 3 }
  };
  const quant = (v, q) => (q ? Math.round(v / q) * q : v);
  /* NieR asleep (55-scenes.js): the control unit SLEEP.drop units below its mark, every string let out SLEEP.slack units
     (so it sags, whatever the slumped unit's distance), a waving arm SLEEP.arm degrees down */
  const SLEEP = { drop: 14, slack: 34, arm: 128 };
  /* a value moving in held steps: the first step lands at t0, the last at t0 + ms * (steps - 1) / steps */
  function stepped(a, now) {
    if (now < a.t0) return a.from;
    const p = (now - a.t0) / Math.max(1, a.ms);
    return p >= 1 ? a.to : a.from + ((a.to - a.from) * Math.min(a.steps, Math.floor(p * a.steps) + 1)) / a.steps;
  }
  const flyOf = (g) => { const inEl = g && g.querySelector(':scope > .o55-in'), v = inEl ? parseFloat(inEl.style.getPropertyValue('--o55-fly')) : NaN; return Number.isFinite(v) ? v : 0; };
  const rigs = new Map();
  let raf = 0;
  const rad = (d) => (d * Math.PI) / 180;
  const rot = (p, deg) => { const c = Math.cos(rad(deg)), s = Math.sin(rad(deg)); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };

  const parse = (el) => { /* the anchor group's own translate/scale (its CSS transform, the value it settles on) */
    const t = (el && el.style.transform) || '';
    const m = /translate\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(t), s = /scale\(\s*(-?[\d.]+)\)/.exec(t);
    return { x: m ? +m[1] : 0, y: m ? +m[2] : 0, s: s ? +s[1] : 1 };
  };
  const hookLocal = (h) => [+h.getAttribute('cx'), +h.getAttribute('cy')];
  /* the DOM is written only when a value really changes: an unchanged attribute still costs a style and layout pass on
     this very large page, and Retro's stepped rig holds each pose for a third of a second */
  const put = (el, name, v) => { if (el.getAttribute(name) !== v) el.setAttribute(name, v); };
  /* a point given in el's user space, in the user space of `space` (el inside it), whatever lies between */
  function inSpace(space, el, local) {
    const a = space.getScreenCTM(), b = el.getScreenCTM(); if (!a || !b) return local;
    const r = a.inverse().multiply(b);
    return [r.a * local[0] + r.c * local[1] + r.e, r.b * local[0] + r.d * local[1] + r.f];
  }

  A.rig = {
    /* (re)read a mounted scene: after its first mount and after every beat change. opts: quick (a re-render that moved
       no prop: measure at once), settle (ms: measure the strings for this long, re-armed by an arrival; never shortens a
       window already open), payout (strings stay straight while measuring: props flying in on them). */
    watch(svg, opts) {
      if (!svg) return;
      opts = opts || {};
      const ties = [...svg.querySelectorAll('.o55-tie')];
      if (!ties.length) { rigs.delete(svg); return; }
      const fam = svg.getAttribute('data-family'), it = (key) => svg.querySelector(`.o55-it[data-key="${key}"]`);
      const am = (g) => g && g.querySelector(':scope > .o55-in > .o55-am');
      const prev = rigs.get(svg), now = M.now();
      const asleep = svg.classList.contains('o55-nier-asleep'), wrap = svg.parentNode, held = !!(wrap && wrap.classList && wrap.classList.contains('o55-ens-hold'));
      /* a re-render keeps the ambient phase and the bar's pose; one that moved no prop re-measures at once */
      const settle = opts.settle != null ? opts.settle : prev ? (opts.quick ? 0 : 950) : 1900;
      const st = { svg, fam, feel: FEEL[fam] || FEEL.basic, born: prev ? prev.born : now, last: now, settleAt: Math.max(now + settle, prev ? prev.settleAt : 0),
        payoutUntil: opts.payout ? now + settle : prev ? prev.payoutUntil : 0, asleep,
        amb0: prev ? prev.amb0 : null, until: prev ? prev.until : 0, morph: !!prev, cached: false, helpers: new Map() };
      const barKey = ties[0].getAttribute('data-from').split(':')[0], barIt = it(barKey);
      /* the control unit's drop: kept across a re-render; a drawing born asleep starts low; one that left its sleep
         with no wake under way (a re-render, a snap) stands at its mark */
      const pb = prev && prev.bar, woke = !!(pb && pb.asleep && !asleep && !pb.dropA);
      const drop = pb ? (woke ? 0 : pb.drop) : asleep ? SLEEP.drop : 0, slack = pb ? (woke ? 0 : pb.slack) : asleep ? SLEEP.slack : 0;
      st.bar = { it: barIt, am: am(barIt), pos: parse(barIt), tilt: pb ? pb.tilt : 0, lift: pb ? pb.lift : 0, drop, slack, dropA: pb && !woke ? pb.dropA : null, asleep };
      st.ties = ties.map((g) => {
        const [fk, fh] = g.getAttribute('data-from').split(':'), [tk, th] = g.getAttribute('data-to').split(':');
        const from = it(fk) && it(fk).querySelector(`.o55-hook[data-hook="${fh}"]`), hIt = it(tk), to = hIt && hIt.querySelector(`.o55-hook[data-hook="${th}"]`);
        if (!from || !to) return null;
        const t = { g, from, to, paths: [...g.querySelectorAll('.o55-sp')], hand: th === 'hand', key: tk };
        /* the same string before the re-render: its hook places carry over until they are measured again */
        const was = prev && prev.ties.find((o) => o.g === g || o.g.getAttribute('data-key') === g.getAttribute('data-key'));
        if (was && was.fromLocal) { t.fromLocal = was.fromLocal; t.toLocal = was.toLocal; t.rest = was.rest; t.armM = was.armM; }
        /* a head string's rest length from the drawing, when it gives one (NieR) */
        if (!t.hand && g.hasAttribute('data-rest')) { t.rest = +g.getAttribute('data-rest'); t.fixed = true; }
        if (!st.helpers.has(tk)) {
          const old = prev && prev.helpers.get(tk), arm = hIt.querySelector('.o55-arm');
          st.helpers.set(tk, { it: hIt, am: am(hIt), pos: parse(hIt), arm, pivot: arm ? (arm.getAttribute('data-pivot') || '0 0').split(/[ ,]+/).map(Number) : null,
            frames: [...hIt.querySelectorAll('.o55-wf')], x: old ? old.x : 0, v: old ? old.v : 0, up: old ? old.up : 0, lean: old ? old.lean : 0, ang: old ? old.ang : 0,
            cheer: old ? old.cheer : null, pl: old ? old.pl : null, still: old ? old.still : null, i: st.helpers.size,
            /* a held arm (asleep: hanging down) and its stepped move; the fly-in height while the ensemble is held */
            armOff: old ? old.armOff : asleep && arm ? SLEEP.arm : 0, armA: old ? old.armA : null, inY: held && hIt.classList.contains('o55-ens-h') ? flyOf(hIt) : 0 });
        }
        const h = st.helpers.get(tk);
        if (t.hand) h.handTie = t; else { h.heads = (h.heads || []).concat(t); h.head = h.head || t; }
        t.h = h;
        return t;
      }).filter(Boolean);
      rigs.set(svg, st);
      if (!raf) raf = requestAnimationFrame(frame);
    },
    /* a helper cheers: a hop and a lean (and a lifted arm), on top of whatever the bar is doing. `who` is a helper key
       or 'all' (the troupe celebrates, one after another). o: big; or a shape of its own (the NieR thumbnail's peek):
       hop (units), dur (ms), stagger (ms between helpers), steps (the hop held in steps: up, then down), arm (the
       raised arm's lift, 1 = the usual), lean (0 = none). */
    cheer(svg, who, o) {
      const st = svg && rigs.get(svg); if (!st) return false;
      o = o || {};
      const now = M.now(), big = !!o.big, gap = o.stagger != null ? o.stagger : 110;
      let n = 0, end = 0;
      [...st.helpers.entries()].forEach(([k, h], i) => {
        if (who !== 'all' && who !== k) return;
        const c = { t0: now + (who === 'all' ? i * gap : 0), dur: o.dur || (big ? 1300 : 760), hop: o.hop != null ? o.hop : big ? 22 : 12, turns: big ? 2 : 1,
          steps: o.steps || 0, arm: o.arm != null ? o.arm : 1, lean: o.lean != null ? o.lean : 1 };
        h.cheer = c; n++; end = Math.max(end, c.t0 + c.dur);
      });
      st.until = Math.max(st.until || 0, o.dur || o.stagger != null ? end + 60 : now + (big ? 1900 : 1100));
      if (!raf) raf = requestAnimationFrame(frame);
      return n > 0;
    },
    /* the control unit moves `to` units below its mark (negative: above it) in held steps; o: ms, steps, delay, slack
       (the strings let out by this many units by the end, taken up when 0: the wake's takeup). The units stay standing
       (their strings go slack and sag below the mark) and are lifted with it above. */
    bar(svg, to, o) {
      const st = svg && rigs.get(svg); if (!st) return false;
      o = o || {};
      const now = M.now(), t0 = now + (o.delay || 0), ms = o.ms == null ? 240 : o.ms, B = st.bar, a0 = B.dropA;
      B.dropA = { from: a0 ? stepped(a0, now) : B.drop, to: +to || 0, t0, ms, steps: Math.max(1, o.steps || 2),
        s0: a0 && a0.s1 != null ? stepped({ from: a0.s0, to: a0.s1, t0: a0.t0, ms: a0.ms, steps: a0.steps }, now) : B.slack, s1: o.slack != null ? +o.slack : null };
      st.until = Math.max(st.until || 0, t0 + ms + 60); st.drawnStill = false;
      if (!raf) raf = requestAnimationFrame(frame);
      return true;
    },
    /* a waving helper's arm held `deg` from where the rig puts it (0: let go), in held steps; o: ms, steps, delay */
    arm(svg, key, deg, o) {
      const st = svg && rigs.get(svg), h = st && st.helpers.get(key); if (!h || !h.arm) return false;
      o = o || {};
      const now = M.now(), t0 = now + (o.delay || 0), ms = o.ms == null ? 120 : o.ms;
      h.armA = { from: h.armA ? stepped(h.armA, now) : h.armOff, to: +deg || 0, t0, ms, steps: Math.max(1, o.steps || 2) };
      st.until = Math.max(st.until || 0, t0 + ms + 60); st.drawnStill = false;
      if (!raf) raf = requestAnimationFrame(frame);
      return true;
    },
    /* end every stepped move at once (a key or a press snaps the troupe to its end state); o.drop / o.arm force them */
    finish(svg, o) {
      const st = svg && rigs.get(svg); if (!st) return false;
      o = o || {};
      const B = st.bar;
      if (B.dropA) { B.drop = B.dropA.to; if (B.dropA.s1 != null) B.slack = B.dropA.s1; B.dropA = null; }
      if (o.drop != null) B.drop = o.drop;
      if (o.slack != null) B.slack = o.slack;
      for (const h of st.helpers.values()) { if (h.armA) { h.armOff = h.armA.to; h.armA = null; } if (o.arm != null) h.armOff = o.arm; h.cheer = null; }
      st.drawnStill = false;
      if (!raf) raf = requestAnimationFrame(frame);
      return true;
    },
    /* for tests and films: the control unit's drop and each helper's held arm */
    state(svg) {
      const st = rigs.get(svg); if (!st) return null;
      return { drop: st.bar.drop, slack: st.bar.slack, measuring: M.now() < st.settleAt, arms: [...st.helpers.entries()].map(([k, h]) => ({ key: k, armOff: h.armOff, inY: h.inY })) };
    },
    /* a tied prop is plucked: a kick sideways into its spring, a wobble and a dip that die away (a letter landing on
       the name sign, a new beginning hung on the string). Reduced Motion skips it. */
    pluck(svg, key, o) {
      const st = svg && rigs.get(svg); if (!st || M.reduced()) return false;
      const h = st.helpers.get(key); if (!h) return false;
      const now = M.now(), amp = (o && o.amp) || 1, dir = (o && o.dir) || 1;
      h.pl = { t0: now, amp, dir };
      h.v += dir * 34 * amp;
      st.until = Math.max(st.until || 0, now + 1000); st.drawnStill = false;
      if (!raf) raf = requestAnimationFrame(frame);
      return true;
    },
    /* around an in-place re-render: the morph resets attributes the render does not write, which would drop the rig's
       transforms, its strings and Retro's wave frames back to rest for a frame; hold() returns the restore */
    hold(svg) {
      if (!svg || !rigs.has(svg)) return null;
      const kept = [...svg.querySelectorAll('.o55-am[transform], .o55-arm[transform]')].map((el) => [el, 'transform', el.getAttribute('transform')])
        .concat([...svg.querySelectorAll('.o55-tie .o55-sp')].map((el) => [el, 'd', el.getAttribute('d')]))
        .concat([...svg.querySelectorAll('.o55-wf')].map((el) => [el, 'style', el.getAttribute('style')]));
      return () => kept.forEach(([el, name, v]) => { if (el.isConnected && v != null && el.getAttribute(name) !== v) el.setAttribute(name, v); });
    },
    /* every prop's place, to tell a re-render that moved props (they glide; strings are measured while they do) from
       one that only relabelled them */
    layout(svg) { return svg ? [...svg.querySelectorAll('.o55-it')].map((g) => g.getAttribute('data-key') + '@' + (g.style.transform || '')).join('|') : ''; },
    /* for tests and films: each string's ends against its hooks' measured places, in scene units */
    gaps(svg) {
      const st = rigs.get(svg); if (!st) return null;
      return st.ties.map((t) => {
        const a = inSpace(st.svg, t.from, hookLocal(t.from)), b = inSpace(st.svg, t.to, hookLocal(t.to)), n = t.paths[0].getAttribute('d').match(/-?[\d.]+/g).map(Number);
        return { key: t.key, hand: t.hand, start: Math.hypot(n[0] - a[0], n[1] - a[1]), end: Math.hypot(n[n.length - 2] - b[0], n[n.length - 1] - b[1]) };
      });
    },
    running: () => rigs.size
  };

  /* the loop stops when nothing moves (ambient off: the page hidden, low-resource mode, Reduced Motion); when motion
     comes back it has to be woken, or the troupe stood frozen until the next scene */
  const wake = () => { if (!raf && rigs.size) raf = requestAnimationFrame(frame); };
  A.rig.wake = wake;
  document.addEventListener('visibilitychange', wake);
  window.addEventListener('o55:lowresource', wake);

  /* NieR's idle is decoration: off while the installed parts leave out Scan sweep (a preview while NieR Mode is off
     has no parts attribute and shows every part) */
  const sweepOn = () => { const r = document.documentElement, p = r.getAttribute('data-o55-nier-parts'); return p == null || (' ' + p + ' ').indexOf(' sweep ') >= 0; };
  const ambientOn = (svg) => {
    if (M.reduced() || M.lowResource || document.hidden) return false;
    if (svg.getAttribute('data-family') === 'nier' && !sweepOn()) return false;
    const host = svg.closest('[data-o55-ambient]');
    return !host || host.getAttribute('data-o55-ambient') === 'on';
  };
  new MutationObserver(wake).observe(document.documentElement, { attributes: true, attributeFilter: ['data-o55-nier-parts', 'data-motion'] });

  /* One frame for every rig on the page, in three passes: the rig transforms that decide where things are, then every
     measurement, then every string. Several scenes can be live at once (the look page has five), and a measurement
     taken after another scene's writes forced a fresh style and layout of this very large page each time. */
  /* The idle sway is slow (periods of seconds, a few pixels or degrees), so it is redrawn at 30 Hz: every rig write
     costs a style, layout, paint and layerize pass of this very large page on a computer without a GPU, and at this
     speed no one can tell 30 from 60. Arrivals, cheers and plucks run at the full frame rate. */
  const IDLE_MS = 1000 / 30 - 4;
  let lastIdle = 0;
  /* when every live rig has a stepped feel (NieR: a 125 ms tick), the wait (ms) to the nearest next tick, so a stepped
     troupe wakes the page 8 times a second rather than 30; 0 otherwise (any other family keeps the 30 Hz timer) */
  function stepWait() {
    const n = M.now();
    let wait = Infinity;
    for (const [svg, st] of rigs) {
      if (!svg.isConnected || !ambientOn(svg)) continue;
      if (!st.feel.tick || st.amb0 == null) return 0;
      wait = Math.min(wait, st.feel.tick - ((n - st.amb0) % st.feel.tick));
    }
    if (!isFinite(wait) || !(M.timeScale > 0)) return 0;
    return Math.max(4, Math.min(250, wait / M.timeScale + 2));
  }
  function frame() {
    raf = 0;
    const real = performance.now();
    let busy = false, live = false;
    for (const [svg, st] of rigs) {
      if (!svg.isConnected) continue;
      const n = M.now();
      if (n < st.settleAt || (st.until && n < st.until)) busy = true;
      if (ambientOn(svg)) live = true;
    }
    /* between idle redraws a timer waits, not a frame callback: a callback alone makes the browser run a whole
       rendering pass of the page */
    if (!busy && live && real - lastIdle < IDLE_MS) { raf = -1; M.real.setTimeout(() => { raf = requestAnimationFrame(frame); }, Math.max(IDLE_MS - (real - lastIdle), stepWait())); return; }
    lastIdle = real;
    let any = false;
    const now = M.now(), measuring = [], settled = [];
    for (const [svg, st] of rigs) {
      if (!svg.isConnected) { rigs.delete(svg); continue; }
      const moving = ambientOn(svg);
      /* props still arriving: measure the strings; after a re-render the troupe keeps moving meanwhile */
      /* (a drawing that hangs its control unit off its mark, asleep or acting, is driven from its first frame) */
      if (now < st.settleAt) { if ((st.morph && (moving || (st.until && now < st.until))) || st.bar.drop || st.bar.dropA) drive(st, now, moving); measuring.push(st); any = true; continue; }
      settled.push([st, moving]);
    }
    const measuredEnds = measuring.map(measure);
    for (const [st] of settled) if (!st.cached) cache(st);
    measuring.forEach((st, i) => st.ties.forEach((t, k) => write(st, t, measuredEnds[i][k][0], measuredEnds[i][k][1])));
    for (const [st, moving] of settled) {
      const cheering = st.until && now < st.until;
      if (!moving && !cheering && st.drawnStill) continue;
      /* a stepped feel (NieR) redraws its idle sway once a tick, not at 30 Hz: nothing is read or written in between */
      if (moving && !cheering && st.feel.tick && st.amb0 != null && st.drawnTick === Math.floor((now - st.amb0) / st.feel.tick)) { any = true; continue; }
      drive(st, now, moving);
      computed(st);
      st.drawnStill = !moving && !cheering;
      any = true;
    }
    if (!any) return;
    /* idle: the next redraw is a timer away (see above); arrivals, cheers and plucks ask for the very next frame */
    if (busy || !live) raf = requestAnimationFrame(frame);
    else { raf = -1; M.real.setTimeout(() => { raf = requestAnimationFrame(frame); }, stepWait() || IDLE_MS); }
  }

  /* ---------------------------------------------------------------- while props arrive: measured, reads first */
  function measure(st) { return st.ties.map((t) => [inSpace(st.svg, t.from, hookLocal(t.from)), inSpace(st.svg, t.to, hookLocal(t.to))]); }
  /* once settled: where each hook sits inside the group the rig moves (bar, helper, arm), measured one time */
  function cache(st) {
    for (const t of st.ties) {
      t.fromLocal = st.bar.am ? inSpace(st.bar.am, t.from, hookLocal(t.from)) : hookLocal(t.from);
      const h = t.h;
      t.toLocal = t.hand && h.arm ? inSpace(h.arm, t.to, hookLocal(t.to)) : h.am ? inSpace(h.am, t.to, hookLocal(t.to)) : hookLocal(t.to);
      /* a raised hand turns with its arm group; anything between that group and the helper's moving group (NieR's
         slump while asleep) is carried as a matrix, left out when it is none */
      t.armM = null;
      if (t.hand && h.arm && h.am && h.arm.parentNode !== h.am) {
        const a = h.am.getScreenCTM(), b = h.arm.parentNode.getScreenCTM();
        if (a && b) { const m = a.inverse().multiply(b); if (Math.abs(m.a - 1) + Math.abs(m.b) + Math.abs(m.c) + Math.abs(m.d - 1) + Math.abs(m.e) + Math.abs(m.f) > 1e-4) t.armM = [m.a, m.b, m.c, m.d, m.e, m.f]; }
      }
    }
    /* rest lengths of the head strings, for slack (unless the drawing gave them) */
    for (const t of st.ties) if (!t.hand && !t.fixed) { const [a, b] = ends(st, t, true); t.rest = Math.hypot(b[0] - a[0], b[1] - a[1]); }
    st.cached = true;
  }
  /* a tie's two ends from the rig's own transforms (rest = with every rig transform at zero) */
  function ends(st, t, rest) {
    const B = st.bar, h = t.h, bs = B.pos.s || 1, hs = h.pos.s || 1;
    const bp = rest ? t.fromLocal : (() => { const r = rot(t.fromLocal, B.tilt); return [r[0], r[1] - B.lift + B.drop]; })();
    const a = [B.pos.x + bs * bp[0], B.pos.y + bs * bp[1]];
    let p = t.toLocal;
    if (!rest && t.hand && h.arm) { const pv = h.pivot, r = rot([p[0] - pv[0], p[1] - pv[1]], h.ang); p = [pv[0] + r[0], pv[1] + r[1]]; }
    if (t.armM) { const m = t.armM; p = [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]]; }
    if (!rest) { const r = rot(p, h.lean); p = [r[0] + h.x / hs, r[1] - h.up / hs + h.inY]; }
    return [a, [h.pos.x + hs * p[0], h.pos.y + hs * p[1]]];
  }
  function computed(st) { for (const t of st.ties) { const [a, b] = ends(st, t, false); write(st, t, a, b); } }

  /* a string between two points; a head string shorter than its rest length is slack and sags */
  /* (a string paying out under a prop that flies in, or hanging short above a held one, stays straight; a hand string
     whose arm hangs down is loose; strings let out (the control unit's slack: asleep) bow outward, away from the
     stage's middle, so the sag reads on a string that hangs nearly straight down) */
  function write(st, t, a, b) {
    const retro = st.fam === 'retro', B = st.bar;
    if (retro) { a = a.map(Math.round); b = b.map(Math.round); }
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const slack = retro ? 0 : t.hand ? (t.h.armOff > 40 ? 30 : 0) : t.rest && !t.h.inY && !(st.payoutUntil && M.now() < st.payoutUntil) ? Math.max(0, t.rest + (B.slack || 0) - len) : 0;
    let d;
    if (slack > 0.4 && B.slack > 0) {
      const sag = Math.min(30, Math.sqrt(slack) * 3.8), out = b[0] >= 240 ? 1 : -1, mx = (a[0] + b[0]) / 2 + out * sag, my = (a[1] + b[1]) / 2 + sag * 0.3;
      d = `M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
    } else if (slack > 0.4) {
      const sag = Math.min(16, Math.sqrt(slack) * 3.2), mx = (a[0] + b[0]) / 2 + sag * 0.45, my = (a[1] + b[1]) / 2 + sag * 0.2;
      d = `M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
    } else d = `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
    if (t.d !== d) { t.d = d; t.paths.forEach((p) => p.setAttribute('d', d)); }
  }

  /* ---------------------------------------------------------------- the motion */
  /* a cheer's offset at time now: a hop (up and down twice for a big one), a lean and an arm lift */
  function cheerAt(h, now) {
    const c = h.cheer; if (!c) return null;
    const p = (now - c.t0) / c.dur; if (p < 0) return { up: 0, lean: 0, arm: 0 };
    if (p >= 1) { h.cheer = null; return null; }
    /* a stepped hop: up for the first half, down for the second */
    const hop = c.steps ? (p < 0.5 ? c.hop : 0) : Math.abs(Math.sin(Math.PI * p * c.turns)) * (1 - p * 0.35) * c.hop;
    const k = c.arm == null ? 1 : c.arm, l = c.lean == null ? 1 : c.lean;
    return { up: hop, lean: Math.sin(Math.PI * 2 * p * c.turns) * 5 * (1 - p) * l, arm: -Math.sin(Math.PI * p) * 34 * k };
  }
  /* a pluck's wobble (deg) and dip (px, down) at time now: a damped swing with the family's spring feel */
  function pluckAt(h, now, f) {
    const c = h.pl; if (!c) return null;
    const p = (now - c.t0) / 1000; if (p < 0) return { rot: 0, dip: 0 };
    if (p > 1.1) { h.pl = null; return null; }
    const soft = f.k ? Math.sqrt(60 / f.k) : 1; /* Glass swings slower and longer, Friendly quicker */
    return { rot: c.amp * c.dir * 3.4 * Math.exp(-p / (0.24 * soft)) * Math.sin((2 * Math.PI * p) / (0.36 * soft)),
      dip: c.amp * 3.2 * Math.exp(-p / (0.17 * soft)) * Math.cos((2 * Math.PI * p) / (0.3 * soft)) };
  }
  function drive(st, now, moving) {
    const f = st.feel, span = Math.max(0, (now - st.last) / 1000); st.last = now;
    /* the springs' time step: one step of at most 50 ms; a stepped feel, drawn once a tick, integrates its tick (at most
       a quarter second) in sub-steps of at most 20 ms, so its springs move as fast as at the full rate */
    const subs = f.tick ? Math.max(1, Math.ceil(Math.min(0.25, span) / 0.02)) : 1, dt = f.tick ? Math.min(0.25, span) / subs : Math.min(0.05, span);
    if (st.amb0 == null) st.amb0 = now; /* the ambient motion starts from rest, never mid-swing */
    const el = moving ? now - st.amb0 : 0, tick = f.tick ? Math.floor(el / f.tick) : 0, t = (f.tick ? tick * f.tick : el) / 1000; /* a stepped feel samples the sway on its tick */
    st.drawnTick = moving ? tick : null;
    if (st.fam === 'retro') return driveRetro(st, now, moving);
    const w = (p) => (2 * Math.PI * t) / (p / 1000);
    const B = st.bar;
    B.tilt = moving ? quant(f.tilt * Math.sin(w(f.period)) + f.tilt * 0.25 * Math.sin(w(f.period * 0.41)), f.qTilt) : B.tilt;
    B.lift = moving ? quant(f.bob * Math.sin(w(f.period * 1.7)), f.qLift) : B.lift;
    if (B.dropA) {
      const a = B.dropA; B.drop = stepped(a, now);
      if (a.s1 != null) B.slack = stepped({ from: a.s0, to: a.s1, t0: a.t0, ms: a.ms, steps: a.steps }, now);
      if (now >= a.t0 + a.ms) { B.drop = a.to; if (a.s1 != null) B.slack = a.s1; B.dropA = null; }
    }
    if (B.am) put(B.am, 'transform', `translate(0 ${(B.drop - B.lift).toFixed(2)}) rotate(${B.tilt.toFixed(3)})`);
    for (const h of st.helpers.values()) {
      if (h.armA) { h.armOff = stepped(h.armA, now); if (now >= h.armA.t0 + h.armA.ms) { h.armOff = h.armA.to; h.armA = null; } }
      if (!h.head || !h.am || h.heads.some((t) => !t.fromLocal)) {
        /* a string not measured yet; a held arm (asleep) is held from the first frame all the same */
        if (h.arm && h.armOff) { h.ang = h.armOff; put(h.arm, 'transform', `rotate(${h.ang.toFixed(2)} ${h.pivot[0]} ${h.pivot[1]})`); }
        continue;
      }
      /* a prop hung by two strings (the name sign) tilts with the bar and rises by the mean of its two points */
      const shift = (l) => { const r = rot(l, B.tilt); return [r[0] - l[0], r[1] - l[1] - B.lift + B.drop]; };
      const moves = h.heads.map((t) => shift(t.fromLocal)), dx = moves.reduce((a, m) => a + m[0], 0) / moves.length, dy = moves.reduce((a, m) => a + m[1], 0) / moves.length;
      /* with the ambient motion held, a helper keeps the place it stopped at, and a pluck settles back to it */
      if (moving) h.still = null; else if (h.still == null) h.still = h.x;
      const target = moving ? dx * f.swing + 1.2 * Math.sin(w(2900 + h.i * 530) + h.i * 1.7) : h.still;
      for (let i = 0; i < subs; i++) { const acc = f.k * (target - h.x) - f.c * h.v; h.v += acc * dt; h.x += h.v * dt; }
      const ch = cheerAt(h, now), pk = pluckAt(h, now, f);
      h.up = Math.max(0, -dy) * f.lift + (ch ? quant(ch.up, f.qHop) : 0) - (pk ? pk.dip : 0);
      h.lean = h.heads.length > 1 ? B.tilt + (ch ? ch.lean * 0.4 : 0) + (pk ? pk.rot : 0) : Math.max(-8, Math.min(8, (dx - h.x) * f.lean + h.v * 0.02 + (ch ? ch.lean : 0) + (pk ? pk.rot : 0)));
      const s = h.pos.s || 1;
      put(h.am, 'transform', `translate(${(h.x / s).toFixed(2)} ${(-h.up / s).toFixed(2)}) rotate(${h.lean.toFixed(2)})`);
      if (h.arm) {
        const hy = h.handTie && h.handTie.fromLocal ? (() => { const l = h.handTie.fromLocal, rr = rot(l, B.tilt); return rr[1] - l[1] - B.lift + B.drop; })() : 0;
        h.ang = Math.max(-28, Math.min(22, hy * f.arm)) + (moving ? f.wave * Math.sin(2 * Math.PI * f.waveHz * t) : 0) + (ch ? ch.arm : 0) + h.armOff;
        put(h.arm, 'transform', `rotate(${h.ang.toFixed(2)} ${h.pivot[0]} ${h.pivot[1]})`);
      }
    }
  }
  function driveRetro(st, now, moving) {
    const f = st.feel, n = moving ? Math.floor((now - st.amb0) / f.step) : 0;
    const up = n % 4 === 1 || n % 4 === 2 ? f.hop : 0;
    st.bar.lift = up; st.bar.tilt = 0;
    if (st.bar.am) put(st.bar.am, 'transform', `translate(0 ${-up})`);
    for (const h of st.helpers.values()) {
      if (!h.am) continue;
      const late = (n + h.i) % 4 === 2 || (n + h.i) % 4 === 3 ? f.hop : 0; /* each helper hops a step after the one before */
      const c0 = h.cheer ? h.cheer.t0 : null, ch = cheerAt(h, now), jump = ch ? Math.round(ch.up / 4) * 4 : 0; /* a cheer jumps in whole 4 px steps */
      const dropped = h.pl && now - h.pl.t0 < 140 ? 4 : 0; /* a pluck: one pixel step down, for one beat */
      if (h.pl && now - h.pl.t0 >= 140) h.pl = null;
      h.up = Math.min(up, late) + jump - dropped; h.lean = 0; h.x = 0;
      put(h.am, 'transform', `translate(0 ${-h.up})`);
      const frame = ch && c0 != null ? Math.floor(Math.max(0, now - c0) / 120) : n; /* a cheering helper waves fast */
      if (h.frames.length > 1) h.frames.forEach((fr, i) => { const d = i === frame % 2 ? '' : 'none'; if (fr.style.display !== d) fr.style.display = d; });
    }
  }
})();
