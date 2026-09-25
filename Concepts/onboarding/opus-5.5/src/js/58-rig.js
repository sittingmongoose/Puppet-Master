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
   low-resource mode hold the ambient motion still; nothing runs while the scene is hidden, paused or gone. */
(function () {
  'use strict';
  const O55 = window.O55, A = O55.art, M = O55.motion;
  /* tilt (deg) and period (ms) of the bar; bob (px); lift share; sideways follow; lean (deg per px); arm (deg per px of
     hand-point rise); a small wave of the hand of its own; spring stiffness and damping */
  const FEEL = {
    basic: { tilt: 1.7, period: 6400, bob: 1.6, lift: 1, swing: 0.55, lean: 0.12, arm: 1.1, wave: 4, waveHz: 0.9, k: 60, c: 15 },
    friendly: { tilt: 3.4, period: 3900, bob: 2.4, lift: 1, swing: 0.75, lean: 0.2, arm: 1.5, wave: 9, waveHz: 1.3, k: 95, c: 7 },
    glass: { tilt: 2.1, period: 8200, bob: 3, lift: 1, swing: 0.6, lean: 0.1, arm: 1, wave: 5, waveHz: 0.7, k: 28, c: 8 },
    retro: { step: 380, hop: 4 }
  };
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
  /* a point given in el's user space, in the user space of `space` (el inside it), whatever lies between */
  function inSpace(space, el, local) {
    const a = space.getScreenCTM(), b = el.getScreenCTM(); if (!a || !b) return local;
    const r = a.inverse().multiply(b);
    return [r.a * local[0] + r.c * local[1] + r.e, r.b * local[0] + r.d * local[1] + r.f];
  }

  A.rig = {
    /* (re)read a mounted scene: after its first mount and after every beat change */
    watch(svg, opts) {
      if (!svg) return;
      const ties = [...svg.querySelectorAll('.o55-tie')];
      if (!ties.length) { rigs.delete(svg); return; }
      const fam = svg.getAttribute('data-family'), it = (key) => svg.querySelector(`.o55-it[data-key="${key}"]`);
      const am = (g) => g && g.querySelector(':scope > .o55-in > .o55-am');
      const prev = rigs.get(svg), now = M.now();
      /* a re-render keeps the ambient phase and the bar's pose; one that moved no prop re-measures at once */
      const st = { svg, fam, feel: FEEL[fam] || FEEL.basic, born: prev ? prev.born : now, last: now, settleAt: now + (prev ? (opts && opts.quick ? 0 : 950) : 1900),
        amb0: prev ? prev.amb0 : null, until: prev ? prev.until : 0, morph: !!prev, cached: false, helpers: new Map() };
      const barKey = ties[0].getAttribute('data-from').split(':')[0], barIt = it(barKey);
      st.bar = { it: barIt, am: am(barIt), pos: parse(barIt), tilt: prev ? prev.bar.tilt : 0, lift: prev ? prev.bar.lift : 0 };
      st.ties = ties.map((g) => {
        const [fk, fh] = g.getAttribute('data-from').split(':'), [tk, th] = g.getAttribute('data-to').split(':');
        const from = it(fk) && it(fk).querySelector(`.o55-hook[data-hook="${fh}"]`), hIt = it(tk), to = hIt && hIt.querySelector(`.o55-hook[data-hook="${th}"]`);
        if (!from || !to) return null;
        const t = { g, from, to, paths: [...g.querySelectorAll('.o55-sp')], hand: th === 'hand', key: tk };
        /* the same string before the re-render: its hook places carry over until they are measured again */
        const was = prev && prev.ties.find((o) => o.g === g || o.g.getAttribute('data-key') === g.getAttribute('data-key'));
        if (was && was.fromLocal) { t.fromLocal = was.fromLocal; t.toLocal = was.toLocal; t.rest = was.rest; }
        if (!st.helpers.has(tk)) {
          const old = prev && prev.helpers.get(tk), arm = hIt.querySelector('.o55-arm');
          st.helpers.set(tk, { it: hIt, am: am(hIt), pos: parse(hIt), arm, pivot: arm ? (arm.getAttribute('data-pivot') || '0 0').split(/[ ,]+/).map(Number) : null,
            frames: [...hIt.querySelectorAll('.o55-wf')], x: old ? old.x : 0, v: old ? old.v : 0, up: old ? old.up : 0, lean: old ? old.lean : 0, ang: old ? old.ang : 0,
            cheer: old ? old.cheer : null, pl: old ? old.pl : null, still: old ? old.still : null, i: st.helpers.size });
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
       or 'all' (the troupe celebrates, one after another). */
    cheer(svg, who, o) {
      const st = svg && rigs.get(svg); if (!st) return false;
      const now = M.now(), big = !!(o && o.big);
      [...st.helpers.entries()].forEach(([k, h], i) => {
        if (who !== 'all' && who !== k) return;
        h.cheer = { t0: now + (who === 'all' ? i * 110 : 0), dur: big ? 1300 : 760, hop: big ? 22 : 12, turns: big ? 2 : 1 };
      });
      st.until = now + (big ? 1900 : 1100);
      if (!raf) raf = requestAnimationFrame(frame);
      return true;
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

  const ambientOn = (svg) => {
    if (M.reduced() || M.lowResource || document.hidden) return false;
    const host = svg.closest('[data-o55-ambient]');
    return !host || host.getAttribute('data-o55-ambient') === 'on';
  };

  function frame() {
    raf = 0;
    let any = false;
    for (const [svg, st] of rigs) {
      if (!svg.isConnected) { rigs.delete(svg); continue; }
      const now = M.now();
      /* props still arriving: measure the strings; after a re-render the troupe keeps moving meanwhile */
      if (now < st.settleAt) { if (st.morph && (ambientOn(svg) || (st.until && now < st.until))) drive(st, now, ambientOn(svg)); measured(st); any = true; continue; }
      if (!st.cached) cache(st);
      const moving = ambientOn(svg), cheering = st.until && now < st.until;
      if (!moving && !cheering && st.drawnStill) continue;
      drive(st, now, moving);
      computed(st);
      st.drawnStill = !moving && !cheering;
      any = true;
    }
    if (any) raf = requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------- while props arrive: measured, reads first */
  function measured(st) {
    const ends = st.ties.map((t) => [inSpace(st.svg, t.from, hookLocal(t.from)), inSpace(st.svg, t.to, hookLocal(t.to))]);
    st.ties.forEach((t, i) => write(st, t, ends[i][0], ends[i][1]));
  }
  /* once settled: where each hook sits inside the group the rig moves (bar, helper, arm), measured one time */
  function cache(st) {
    for (const t of st.ties) {
      t.fromLocal = st.bar.am ? inSpace(st.bar.am, t.from, hookLocal(t.from)) : hookLocal(t.from);
      const h = t.h;
      t.toLocal = t.hand && h.arm ? inSpace(h.arm, t.to, hookLocal(t.to)) : h.am ? inSpace(h.am, t.to, hookLocal(t.to)) : hookLocal(t.to);
    }
    /* rest lengths of the head strings, for slack */
    for (const t of st.ties) if (!t.hand) { const [a, b] = ends(st, t, true); t.rest = Math.hypot(b[0] - a[0], b[1] - a[1]); }
    st.cached = true;
  }
  /* a tie's two ends from the rig's own transforms (rest = with every rig transform at zero) */
  function ends(st, t, rest) {
    const B = st.bar, h = t.h, bs = B.pos.s || 1, hs = h.pos.s || 1;
    const bp = rest ? t.fromLocal : (() => { const r = rot(t.fromLocal, B.tilt); return [r[0], r[1] - B.lift]; })();
    const a = [B.pos.x + bs * bp[0], B.pos.y + bs * bp[1]];
    let p = t.toLocal;
    if (!rest && t.hand && h.arm) { const pv = h.pivot, r = rot([p[0] - pv[0], p[1] - pv[1]], h.ang); p = [pv[0] + r[0], pv[1] + r[1]]; }
    if (!rest) { const r = rot(p, h.lean); p = [r[0] + h.x / hs, r[1] - h.up / hs]; }
    return [a, [h.pos.x + hs * p[0], h.pos.y + hs * p[1]]];
  }
  function computed(st) { for (const t of st.ties) { const [a, b] = ends(st, t, false); write(st, t, a, b); } }

  /* a string between two points; a head string shorter than its rest length is slack and sags */
  function write(st, t, a, b) {
    const retro = st.fam === 'retro';
    if (retro) { a = a.map(Math.round); b = b.map(Math.round); }
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), slack = !retro && t.rest ? Math.max(0, t.rest - len) : 0;
    let d;
    if (slack > 0.4) {
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
    const hop = Math.abs(Math.sin(Math.PI * p * c.turns)) * (1 - p * 0.35) * c.hop;
    return { up: hop, lean: Math.sin(Math.PI * 2 * p * c.turns) * 5 * (1 - p), arm: -Math.sin(Math.PI * p) * 34 };
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
    const dt = Math.min(0.05, Math.max(0, (now - st.last) / 1000)); st.last = now;
    if (st.amb0 == null) st.amb0 = now; /* the ambient motion starts from rest, never mid-swing */
    const t = moving ? (now - st.amb0) / 1000 : 0, f = st.feel;
    if (st.fam === 'retro') return driveRetro(st, now, moving);
    const w = (p) => (2 * Math.PI * t) / (p / 1000);
    const B = st.bar;
    B.tilt = moving ? f.tilt * Math.sin(w(f.period)) + f.tilt * 0.25 * Math.sin(w(f.period * 0.41)) : B.tilt;
    B.lift = moving ? f.bob * Math.sin(w(f.period * 1.7)) : B.lift;
    if (B.am) B.am.setAttribute('transform', `translate(0 ${(-B.lift).toFixed(2)}) rotate(${B.tilt.toFixed(3)})`);
    for (const h of st.helpers.values()) {
      if (!h.head || !h.am || h.heads.some((t) => !t.fromLocal)) continue; /* a string not measured yet */
      /* a prop hung by two strings (the name sign) tilts with the bar and rises by the mean of its two points */
      const shift = (l) => { const r = rot(l, B.tilt); return [r[0] - l[0], r[1] - l[1] - B.lift]; };
      const moves = h.heads.map((t) => shift(t.fromLocal)), dx = moves.reduce((a, m) => a + m[0], 0) / moves.length, dy = moves.reduce((a, m) => a + m[1], 0) / moves.length;
      /* with the ambient motion held, a helper keeps the place it stopped at, and a pluck settles back to it */
      if (moving) h.still = null; else if (h.still == null) h.still = h.x;
      const target = moving ? dx * f.swing + 1.2 * Math.sin(w(2900 + h.i * 530) + h.i * 1.7) : h.still;
      const acc = f.k * (target - h.x) - f.c * h.v; h.v += acc * dt; h.x += h.v * dt;
      const ch = cheerAt(h, now), pk = pluckAt(h, now, f);
      h.up = Math.max(0, -dy) * f.lift + (ch ? ch.up : 0) - (pk ? pk.dip : 0);
      h.lean = h.heads.length > 1 ? B.tilt + (ch ? ch.lean * 0.4 : 0) + (pk ? pk.rot : 0) : Math.max(-8, Math.min(8, (dx - h.x) * f.lean + h.v * 0.02 + (ch ? ch.lean : 0) + (pk ? pk.rot : 0)));
      const s = h.pos.s || 1;
      h.am.setAttribute('transform', `translate(${(h.x / s).toFixed(2)} ${(-h.up / s).toFixed(2)}) rotate(${h.lean.toFixed(2)})`);
      if (h.arm) {
        const hy = h.handTie && h.handTie.fromLocal ? (() => { const l = h.handTie.fromLocal, rr = rot(l, B.tilt); return rr[1] - l[1] - B.lift; })() : 0;
        h.ang = Math.max(-28, Math.min(22, hy * f.arm)) + (moving ? f.wave * Math.sin(2 * Math.PI * f.waveHz * t) : 0) + (ch ? ch.arm : 0);
        h.arm.setAttribute('transform', `rotate(${h.ang.toFixed(2)} ${h.pivot[0]} ${h.pivot[1]})`);
      }
    }
  }
  function driveRetro(st, now, moving) {
    const f = st.feel, n = moving ? Math.floor((now - st.amb0) / f.step) : 0;
    const up = n % 4 === 1 || n % 4 === 2 ? f.hop : 0;
    st.bar.lift = up; st.bar.tilt = 0;
    if (st.bar.am) st.bar.am.setAttribute('transform', `translate(0 ${-up})`);
    for (const h of st.helpers.values()) {
      if (!h.am) continue;
      const late = (n + h.i) % 4 === 2 || (n + h.i) % 4 === 3 ? f.hop : 0; /* each helper hops a step after the one before */
      const c0 = h.cheer ? h.cheer.t0 : null, ch = cheerAt(h, now), jump = ch ? Math.round(ch.up / 4) * 4 : 0; /* a cheer jumps in whole 4 px steps */
      const dropped = h.pl && now - h.pl.t0 < 140 ? 4 : 0; /* a pluck: one pixel step down, for one beat */
      if (h.pl && now - h.pl.t0 >= 140) h.pl = null;
      h.up = Math.min(up, late) + jump - dropped; h.lean = 0; h.x = 0;
      h.am.setAttribute('transform', `translate(0 ${-h.up})`);
      const frame = ch && c0 != null ? Math.floor(Math.max(0, now - c0) / 120) : n; /* a cheering helper waves fast */
      if (h.frames.length > 1) h.frames.forEach((fr, i) => { fr.style.display = i === frame % 2 ? '' : 'none'; });
    }
  }
})();
