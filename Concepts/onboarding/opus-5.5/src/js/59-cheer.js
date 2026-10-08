/* O55.art.react / O55.art.celebrate — the puppets answer the person. A choice gets a small cheer from one helper; a
   Project made, and the last screen, get the whole troupe celebrating with a burst of the family's confetti (Basic:
   drafting marks; Friendly: tumbling paper; Glass: rising light motes; Retro: pixel squares on a stepped clock; NieR: a
   few ink squares and diamonds, a rust one or two, falling in steps and turning only in quarter turns).
   Helpers tied to the control bar cheer through the rig, so their strings stay on; free-standing helpers hop with a
   family-shaped keyframe on their own ambient group. These are one-time answers to what the person did, not ambient
   loops, so low-resource mode keeps them; Reduced Motion skips them (the choice and its sound already say it). */
(function () {
  'use strict';
  const O55 = window.O55, A = O55.art, M = O55.motion;
  const sceneSvg = (host) => host && host.querySelector('.o55-scene-wrap:not(.o55-out) svg.o55-scene');
  const quiet = () => M.reduced();
  const helpers = (svg) => [...svg.querySelectorAll('.o55-it')].filter((g) => /^(h\d|fx\d)/.test(g.getAttribute('data-key') || ''));
  const tied = (svg, key) => !!svg.querySelector(`.o55-tie[data-to^="${key}:"]`);

  /* a free-standing helper hops (its feet are its origin, so a squash stays on the floor) */
  function hop(g, family, big, delay) {
    const am = g.querySelector(':scope > .o55-in > .o55-am'); if (!am || !am.animate) return;
    const h = big ? 18 : 10;
    const kf = {
      basic: [{ transform: 'translateY(0)' }, { transform: `translateY(${-h}px)`, offset: 0.4 }, { transform: 'translateY(0)', offset: 0.75 }, { transform: 'translateY(-2px)', offset: 0.88 }, { transform: 'translateY(0)' }],
      friendly: [{ transform: 'translateY(0) scale(1, 1)' }, { transform: 'translateY(0) scale(1.08, 0.9)', offset: 0.15 }, { transform: `translateY(${-h * 1.2}px) scale(0.94, 1.08) rotate(${big ? 8 : 5}deg)`, offset: 0.45 },
        { transform: 'translateY(0) scale(1.1, 0.88)', offset: 0.75 }, { transform: 'translateY(0) scale(1, 1)' }],
      glass: [{ transform: 'translateY(0)', opacity: 1 }, { transform: `translateY(${-h}px)`, opacity: 1, offset: 0.5 }, { transform: 'translateY(0)', opacity: 1 }],
      retro: [{ transform: 'translateY(0)' }, { transform: `translateY(${-Math.round(h / 4) * 4}px)`, offset: 0.5 }, { transform: 'translateY(0)' }],
      /* NieR: a square hop: up in three steps, held, down in two (each segment is stepped; the whole runs linear) */
      nier: [{ transform: 'translateY(0)', easing: 'steps(3, end)' }, { transform: `translateY(${-h}px)`, offset: 0.3, easing: 'steps(1, end)' },
        { transform: `translateY(${-h}px)`, offset: 0.62, easing: 'steps(2, end)' }, { transform: 'translateY(0)' }]
    }[family] || [];
    const opts = { duration: big ? 900 : 620, delay: delay || 0, easing: family === 'retro' ? 'steps(4, end)' : family === 'nier' ? 'linear' : family === 'glass' ? 'cubic-bezier(0.3, 0, 0.2, 1)' : 'cubic-bezier(0.34, 1.3, 0.64, 1)', fill: 'none' };
    try { am.animate(kf, opts); } catch (_) {}
    if (big && family !== 'retro') try { am.animate(kf, Object.assign({}, opts, { delay: (delay || 0) + opts.duration + 80 })); } catch (_) {}
  }

  /* NieR's cheer, on top of the hop: the unit's visor shows joy for as long as it cheers (the item gets `o55-joy`; one
     class write at the start and one at the end; 30-art.css swaps .nv-scan for .nv-joy in steps), and, with the
     Target brackets part, four ink lock-on brackets close in around it (one-shot: 1.3 to 1 in three steps over 240 ms,
     held 400 ms, gone in two steps). Both are skipped under Reduced Motion with the cheer itself. */
  function joy(g, ms, delay) {
    M.after(delay || 0, () => { if (g.isConnected) g.classList.add('o55-joy'); });
    M.after((delay || 0) + ms, () => g.classList.remove('o55-joy'));
  }
  const NS = 'http://www.w3.org/2000/svg';
  function lockOn(svg, g, delay) {
    const am = g.querySelector(':scope > .o55-in > .o55-am'), tok = A.tokens(svg);
    if (!am || !am.animate || (A.nier && A.nier.has && !A.nier.has({ tok }, 'brackets'))) return;
    M.after(delay || 0, () => {
      if (!am.isConnected) return;
      /* around the unit's body: an element marked .o55-nier-body (untransformed, in the unit's own units), else the whole unit */
      let b; try { b = (am.querySelector('.o55-nier-body') || am).getBBox(); } catch (_) { return; }
      if (!b || !(b.width || b.height)) return;
      const sm = /scale\(\s*(-?[\d.]+)\)/.exec(g.style.transform || ''), s = sm ? +sm[1] || 1 : 1; /* the unit's own units: 6 canvas units long, 1 wide */
      const pad = 3 / s, n = 6 / s, x0 = b.x - pad, y0 = b.y - pad, x1 = b.x + b.width + pad, y1 = b.y + b.height + pad;
      const c = (x, y, dx, dy) => `M${(x + dx * n).toFixed(2)} ${y.toFixed(2)}H${x.toFixed(2)}V${(y + dy * n).toFixed(2)}`;
      const ink = A.nier && A.nier.tokens ? A.nier.tokens(tok, svg.classList.contains('o55-m-light') ? 'light' : 'dark').text : tok.text;
      const el = document.createElementNS(NS, 'path');
      el.setAttribute('class', 'o55-nier-lock'); el.setAttribute('aria-hidden', 'true');
      el.setAttribute('d', c(x0, y0, 1, 1) + c(x1, y0, -1, 1) + c(x0, y1, 1, -1) + c(x1, y1, -1, -1));
      el.setAttribute('fill', 'none'); el.setAttribute('stroke', ink); el.setAttribute('stroke-width', (1 / s).toFixed(3)); el.setAttribute('stroke-linecap', 'square');
      el.style.transformBox = 'fill-box'; el.style.transformOrigin = 'center';
      am.appendChild(el);
      try {
        el.animate([{ transform: 'scale(1.3)', opacity: 1, easing: 'steps(3, end)' }, { transform: 'scale(1)', opacity: 1, offset: 0.286, easing: 'steps(1, end)' },
          { transform: 'scale(1)', opacity: 1, offset: 0.762, easing: 'steps(2, end)' }, { transform: 'scale(1)', opacity: 0 }], { duration: 840, fill: 'both' });
      } catch (_) {}
      M.after(860, () => el.remove());
    });
  }

  /* NieR's hero: the machine lifeform watching from the stage's broken corner glances at the cheering unit, one step of
     its eyes toward it for 600 ms (one-shot, transform only; skipped with the cheer under Reduced Motion) */
  function glance(svg, g) {
    const eyes = svg.querySelector('.o55-it[data-key="mach"] .o55-nier-eyes'), mach = eyes && eyes.closest('.o55-it');
    if (!eyes || !eyes.animate || !g) return;
    const x = (el) => { const m = /translate\(\s*(-?[\d.]+)px/.exec(el.style.transform || ''); return m ? +m[1] : 0; };
    const dx = x(g) < x(mach) ? -1 : 1;
    try { eyes.animate([{ transform: `translateX(${dx}px)` }, { transform: `translateX(${dx}px)` }], { duration: 600, easing: 'steps(1, end)' }); } catch (_) {}
  }

  /* Each helper's voice, in every family: its chord tone (h0 the root, h1 the third, h2 the fifth; the extra units take
     theirs by number) and its place on the stage as the pan ((x - 240) / 240 * 0.7), so three cheers in a row spell the
     chapter's chord across the stage (design/hero-spec.md H6) */
  const keyOf = (g) => (g && g.getAttribute('data-key')) || '';
  const xOf = (g) => { const m = /translate\(\s*(-?[\d.]+)px/.exec((g && g.style.transform) || ''); return m ? +m[1] : 240; };
  const voiceOf = (g) => { const m = /(\d+)$/.exec(keyOf(g)); return { voice: m ? +m[1] % 3 : 0, pan: Math.round(Math.max(-0.7, Math.min(0.7, ((xOf(g) - 240) / 240) * 0.7)) * 100) / 100 }; };
  A.voiceOf = voiceOf;

  /* one helper cheers for a choice (the one nearest the middle, turn about) */
  let turn = 0;
  A.react = function react(host) {
    const svg = sceneSvg(host); if (!svg || quiet()) return false;
    const hs = helpers(svg); if (!hs.length) return false;
    const i = turn++ % hs.length, g = hs[i], key = g.getAttribute('data-key'), fam = svg.getAttribute('data-family');
    O55.sound.play('cheer', voiceOf(g)); /* each helper has its own voice and its own place */
    const isTied = tied(svg, key) && A.rig;
    if (fam === 'nier') { joy(g, isTied ? 760 : 620, 0); lockOn(svg, g, 0); glance(svg, g); }
    if (isTied) return A.rig.cheer(svg, key);
    hop(g, fam, false, 0);
    return true;
  };

  /* the troupe celebrates, and the family's confetti bursts from the middle of the stage. o: at, count, big, confetti
     (false: none), sound (false: none), down (the burst fans downward: from a sign hung high). Under NieR's art the
     two big moments have performances of their own, and a celebrate asked for there plays them instead: the Created
     scene its act (A.createdAct: the sign stamped, the run's one confetti), Ready its curtain call (A.curtainCall: no
     confetti). */
  A.celebrate = function celebrate(host, o) {
    o = o || {};
    const svg = sceneSvg(host); if (!svg || quiet()) return false;
    const fam = svg.getAttribute('data-family'), hs = helpers(svg), sc = svg.getAttribute('data-scene'), beat = svg.getAttribute('data-beat');
    if (fam === 'nier' && !o.direct && sc === 'creating' && beat === 'done' && A.createdAct) return A.createdAct(host, {});
    /* (no sting from the redirect: a caller still asking for celebrate has not claimed the chapter's sting, which the
       screen change already played) */
    if (fam === 'nier' && !o.direct && sc === 'ready' && A.curtainCall) return A.curtainCall(host, { sting: false });
    if (A.rig && hs.some((g) => tied(svg, g.getAttribute('data-key')))) A.rig.cheer(svg, 'all', { big: true });
    hs.filter((g) => !tied(svg, g.getAttribute('data-key'))).forEach((g, i) => hop(g, fam, true, i * 110));
    /* NieR: every unit shows joy for its cheer (tied ones cheer one after another, 110 ms apart, as A.rig.cheer does);
       the middle unit is locked on */
    if (fam === 'nier') {
      let ti = 0, fi = 0;
      hs.forEach((g) => { const t = tied(svg, g.getAttribute('data-key')); joy(g, t ? 1300 : 900, (t ? ti++ : fi++) * 110); });
      const mid = hs.find((g) => g.getAttribute('data-key') === 'h1'); if (mid) { lockOn(svg, mid, 110); glance(svg, mid); }
    }
    const at = o.at || [240, 300];
    if (o.confetti !== false) confetti(svg, fam, at, o.count || 34, false, !!o.down);
    /* placed where it bursts, as the cheers are (not toward the last click) */
    if (o.sound !== false) O55.sound.play('celebrate', { pan: Math.round(Math.max(-0.7, Math.min(0.7, ((at[0] - 240) / 240) * 0.7)) * 100) / 100 });
    return true;
  };

  /* A small answer to one keystroke or one pick, on the prop hung from the bar: it is plucked (A.rig.pluck); a new
     beginning's icon pops in (Retro drops in one pixel step, never scaled); a typed letter sends a fleck or two of the
     family's ink off the end of the word. Reduced Motion skips it. */
  let lastFleck = 0;
  A.poke = function poke(host, key, o) {
    o = o || {};
    const svg = sceneSvg(host); if (!svg || quiet()) return false;
    const fam = svg.getAttribute('data-family'), it = svg.querySelector(`.o55-it[data-key="${key}"]`); if (!it) return false;
    if (A.rig) A.rig.pluck(svg, key, { amp: o.amp || 1, dir: o.dir || 1 });
    const gl = o.pop && it.querySelector('.o55-gl');
    if (gl && gl.animate) try {
      gl.animate(fam === 'retro' ? [{ transform: 'translate(0, -4px)', opacity: 0 }, { transform: 'translate(0, -4px)', opacity: 1, offset: 0.34 }, { transform: 'translate(0, 0)', opacity: 1 }]
        : fam === 'nier' ? [{ transform: 'scale(0.6)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.5 }, { transform: 'scale(1)', opacity: 1 }] /* decoded in, never turned */
        : [{ transform: 'scale(0.4) rotate(-14deg)', opacity: 0 }, { transform: 'scale(1.16) rotate(4deg)', opacity: 1, offset: 0.55 }, { transform: 'scale(1) rotate(0deg)', opacity: 1 }],
      { duration: fam === 'retro' ? 360 : fam === 'nier' ? 400 : 460, easing: fam === 'retro' ? 'steps(3, end)' : fam === 'nier' ? 'steps(4, end)' : fam === 'glass' ? 'cubic-bezier(0.3, 0, 0.2, 1)' : 'cubic-bezier(0.34, 1.4, 0.64, 1)' });
    } catch (_) {}
    if (o.fleck && M.now() - lastFleck > 70) { lastFleck = M.now(); const at = wordEnd(svg, it); if (at) confetti(svg, fam, at, 2 + (Math.random() < 0.4 ? 1 : 0), true); }
    return true;
  };
  /* the end of the word on a prop (its last text), in scene units */
  function wordEnd(svg, it) {
    const txt = [...it.querySelectorAll('text')].pop(); if (!txt || !txt.getBBox) return null;
    try {
      const b = txt.getBBox(), m = svg.getScreenCTM().inverse().multiply(txt.getScreenCTM()), x = b.x + b.width + 7, y = b.y + b.height * 0.4;
      return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f];
    } catch (_) { return null; }
  }

  function confetti(svg, fam, at, count, small, down) {
    const fx = svg.querySelector('g.o55-fx') || svg, tok = A.tokens(svg), NS = 'http://www.w3.org/2000/svg';
    const colors = [tok.blue, tok.magenta, tok.lime, tok.orange, tok.warn];
    const nier = fam === 'nier';
    /* NieR is sparing: under half as many pieces, in ink with a rust one now and then (its tokens; a preview's own) */
    if (nier && !small) count = Math.max(8, Math.round(count * 0.45)); /* 46 -> 21; a fleck keeps its 1-3 */
    const nt = nier && A.nier && A.nier.tokens ? A.nier.tokens(tok, svg.classList.contains('o55-m-light') ? 'light' : 'dark') : tok, ink = nt.text, rust = nt.error;
    const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'o55-confetti'); g.setAttribute('aria-hidden', 'true');
    fx.appendChild(g);
    let longest = 0;
    for (let i = 0; i < count; i++) {
      /* a fleck leaves up and to the right of the word, short and small; a celebration bursts up and all round */
      const c = colors[(i + (small ? Math.floor(Math.random() * 5) : 0)) % colors.length];
      /* (down: from a sign hung high, the burst fans out sideways and down over the troupe) */
      const ang = small ? -Math.PI / 2 + 0.7 + (Math.random() - 0.5) * 1.1 : down ? Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5 : -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25;
      const sp = small ? 26 + Math.random() * 30 : down ? 70 + Math.random() * 150 : 120 + Math.random() * 170;
      const dx = Math.cos(ang) * sp, dy = Math.sin(ang) * sp, fall = small ? 26 + Math.random() * 24 : down ? 90 + Math.random() * 110 : 170 + Math.random() * 120;
      let el;
      if (nier) {
        /* an ink square, an ink diamond or an open diamond; every fifth one rust */
        const k = i % 3, c2 = i % 5 === 4 ? rust : ink, s = small ? 3 : 4 + (i % 2) * 2;
        el = document.createElementNS(NS, k ? 'path' : 'rect');
        if (k) { el.setAttribute('d', `M0 ${-s}L${s} 0L0 ${s}L${-s} 0Z`); el.setAttribute('fill', k === 1 ? c2 : 'none'); if (k === 2) { el.setAttribute('stroke', c2); el.setAttribute('stroke-width', '1.2'); el.setAttribute('stroke-linejoin', 'miter'); } }
        else { el.setAttribute('width', s); el.setAttribute('height', s); el.setAttribute('x', -s / 2); el.setAttribute('y', -s / 2); el.setAttribute('fill', c2); }
        el.setAttribute('shape-rendering', 'crispEdges');
      } else if (fam === 'retro') { el = document.createElementNS(NS, 'rect'); const s = 4 * (1 + (i % 2)); el.setAttribute('width', s); el.setAttribute('height', s); el.setAttribute('x', -s / 2); el.setAttribute('y', -s / 2); el.setAttribute('shape-rendering', 'crispEdges'); el.setAttribute('fill', c); }
      else if (fam === 'basic') { el = document.createElementNS(NS, 'path'); el.setAttribute('d', i % 3 ? 'M-4 0H4M0 -4V4' : 'M0 -3.5A3.5 3.5 0 1 1 0 3.5A3.5 3.5 0 1 1 0 -3.5'); el.setAttribute('fill', 'none'); el.setAttribute('stroke', i % 2 ? tok.blue : tok.orange); el.setAttribute('stroke-width', '1.4'); }
      else if (fam === 'glass') { el = document.createElementNS(NS, 'circle'); el.setAttribute('r', 2 + (i % 3)); el.setAttribute('fill', c); el.setAttribute('opacity', '0.85'); }
      else { el = document.createElementNS(NS, 'rect'); el.setAttribute('width', i % 2 ? 9 : 6); el.setAttribute('height', i % 2 ? 5 : 8); el.setAttribute('x', -4); el.setAttribute('y', -3); el.setAttribute('rx', '1.2'); el.setAttribute('fill', c); el.setAttribute('stroke', 'rgba(0,0,0,0.25)'); el.setAttribute('stroke-width', '0.6'); }
      el.style.transformBox = 'fill-box'; el.style.transformOrigin = 'center';
      g.appendChild(el);
      const x0 = at[0] + (Math.random() - 0.5) * (small ? 6 : 30), y0 = at[1];
      const spin = fam === 'retro' ? 0 : nier ? 90 * Math.round((Math.random() - 0.5) * 4) : (Math.random() - 0.5) * 720; /* pixels never rotate; NieR turns in quarter turns */
      if (nier) {
        /* NieR: the flight is the same path on the separate translate property, falling in steps; the turn runs on the
           separate rotate property with one step per quarter turn, so every sampled angle is a multiple of 90 degrees
           (inside one stepped transform the turn was interpolated with the flight, and pieces sat at any angle) */
        const path = [[x0, y0, 1, 0], [x0 + dx * 0.85, y0 + dy * 0.85, 1, 0.38], [x0 + dx + (i % 2 ? 12 : -12), y0 + dy + fall * 0.6, 1, 0.72], [x0 + dx * 1.05, y0 + dy + fall, 0, 1]];
        if (small) el.style.scale = '0.7';
        const dur = small ? 620 + Math.random() * 240 : 1300 + Math.random() * 500, delay = small ? Math.random() * 60 : Math.random() * 160;
        longest = Math.max(longest, dur + delay);
        try {
          el.animate(path.map(([x, y, op, offset]) => ({ translate: `${x}px ${y}px`, opacity: op, offset })), { duration: dur, delay, easing: small ? 'steps(4, end)' : 'steps(12, end)', fill: 'both' });
          if (spin) el.animate([{ rotate: '0deg' }, { rotate: `${spin}deg` }], { duration: dur, delay, easing: `steps(${Math.abs(spin) / 90}, end)`, fill: 'both' });
        } catch (_) {}
        continue;
      }
      /* Glass motes rise and fade; the others fly up and out, then fall with a little flutter */
      const kf = fam === 'glass'
        ? [{ transform: `translate(${x0}px, ${y0}px) scale(0.4)`, opacity: 0 }, { transform: `translate(${x0 + dx * 0.4}px, ${y0 + dy * 0.5}px) scale(1)`, opacity: 1, offset: 0.35 }, { transform: `translate(${x0 + dx * 0.7}px, ${y0 + dy * 0.9 - 40}px) scale(0.6)`, opacity: 0 }]
        : [{ transform: `translate(${x0}px, ${y0}px) rotate(0deg)`, opacity: 1 }, { transform: `translate(${x0 + dx * 0.85}px, ${y0 + dy * 0.85}px) rotate(${spin * 0.5}deg)`, opacity: 1, offset: 0.38 },
          { transform: `translate(${x0 + dx + (i % 2 ? 12 : -12)}px, ${y0 + dy + fall * 0.6}px) rotate(${spin * 0.8}deg)`, opacity: 1, offset: 0.72 }, { transform: `translate(${x0 + dx * 1.05}px, ${y0 + dy + fall}px) rotate(${spin}deg)`, opacity: 0 }];
      if (small && fam !== 'retro') kf.forEach((k) => { k.transform += ' scale(0.7)'; }); /* a fleck is smaller; Retro keeps whole pixels */
      const dur = small ? 620 + Math.random() * 240 : (fam === 'glass' ? 1500 : 1300) + Math.random() * 500, delay = small ? Math.random() * 60 : Math.random() * 160;
      longest = Math.max(longest, dur + delay);
      try { el.animate(kf, { duration: dur, delay, easing: fam === 'retro' ? (small ? 'steps(5, end)' : 'steps(10, end)') : 'cubic-bezier(0.2, 0.6, 0.4, 1)', fill: 'both' }); } catch (_) {}
    }
    M.after(longest + 100, () => g.remove());
  }

  /* ================================================================ the troupe acts (design/hero-spec.md 2.2)
     Performances on a mounted scene, each a one-shot made of class and attribute changes on the motion clock and Web
     Animations (transform and opacity only, in held steps; 30-art.css holds the states). Each one plays its own foley,
     with the unit's voice and pan, on the frame its picture changes, so sound and picture never drift. Each goes
     straight to its end state, silently, under Reduced Motion, on a low-resource computer and, under NieR's art, while
     no Motion part is installed (the Still and Colors only presets): the state sounds (wake, save, celebrate, the
     chapter) belong to the callers, except the two below that own theirs. Each returns a Promise that resolves at its
     end. Any performance can be cut short to its end state by O55.art.troupe.snap(host) (a key or a press during a stage
     performance: design/hero-spec.md 1.7); a new performance on the same drawing snaps the one before.
       A.troupe.enter(host, { order, gap, signal })  a held ensemble (A.mount ctx.ensembleHold) is lowered in: NieR's
                       units fly in on their strings after You's signal, land on their chord tones, boot their visors
                       and cheer the chord; a family's bar and helpers play their own entrance, landing in its material
       A.troupe.powerDown(host)                      NieR's units go to rest one by one, the bar sags, You's arm lowers,
                       the link goes dark back toward the hand (before the cover of an untick)
       A.troupe.wake(host, { at })                   a scene composed asleep (55-scenes.js) wakes: You's slit, its arm,
                       the signal up the link, the control unit taking up the slack, each unit rising from its slump
                       as its string goes taut, the visors booting, and (at.hello) h0's first wave; at.<beat> is a ms
                       offset from the call or a Promise (a boot log's stamps)
       A.troupe.bow(host, { together, keys, hold, sound })   a bow (head dip and rest dashes, 2 held steps); on the layer
                       waiting to leave when a screen change holds one (the end of an act)
       A.troupe.rise(host)                           the bowing units stand again
       A.troupe.point(host, key?, { hold })          the unit nearest the pane (or `key`) points at it and jabs twice
       A.troupe.wave(host, { only, sound, joy })     the units raise their wave arms in 2 steps, with joy and the
                       cheer chord (only: one unit: h0's first hello)
       A.troupe.snap(host)                           every performance on the host's drawings to its end state now
       A.troupe.busy(host)                           a performance is running
       A.curtainCall(host, { chord, point, target, sting, onRise, at })   Ready (NieR): the bows spell the chord, a
                       rest, then the rise with joy and the point at the tour; plays the resolving chapter sting at the
                       rise unless sting is false (onRise is called at that frame); at: the first bow at that many ms
                       from now instead of 1000 ms after the scene arrived (the 'curtaincall' scene: a small stage)
       A.createdAct(host, { name })                  Created (NieR): landed, a bow, the name sign comes back and is
                       stamped; joy, a lock-on on the sign and the run's one confetti from it; plays land and celebrate
       A.peek(host, { joy })                         the look screen's NieR thumbnail: its bar dips, its units hop once
                       in 2 steps and sweep their visors (silent; at most once a second)
     A performance asked for after its scene arrived (the Created and Ready ones) keeps the scene's own timeline (the
     drawing's data-o55-t0, 50-art-core.js). */
  const T = A.troupe = {};
  const SND = (ev, o) => { if (O55.sound && O55.sound.play) O55.sound.play(ev, o || {}); };
  const item = (svg, key) => svg.querySelector(`.o55-it[data-key="${key}"]`);
  const inner = (g) => g && g.querySelector(':scope > .o55-in');
  const units = (svg) => helpers(svg);
  const pose = (g) => { const u = g && g.querySelector('.o55-nier-unit'); return u ? u.getAttribute('data-pose') : null; };
  const has = (g, sel) => !!(g && g.querySelector(sel));
  const MOTION = /(^|\s)(reboot|slice|decode|wipe|particles|sweep|glitch)(\s|$)/;
  /* the troupe acts out: not under Reduced Motion, not on a low-resource computer, and for NieR's art only with a Motion
     part installed (a preview while NieR Mode is off shows every part) */
  function acts(svg) {
    if (M.reduced() || M.lowResource) return false;
    if (svg && svg.getAttribute('data-family') === 'nier') { const p = document.documentElement.getAttribute('data-o55-nier-parts'); if (p != null && !MOTION.test(p)) return false; }
    return true;
  }
  T.acts = (host) => acts(sceneSvg(host));
  /* a performance: its timers, its animations and its end state, all cut short by finish() */
  const perfs = new WeakMap();
  function perf(svg, name) {
    let resolve, set = perfs.get(svg);
    const p = { svg, name, timers: [], anims: [], ends: [], done: false, promise: new Promise((r) => { resolve = r; }) };
    p.at = (ms, fn) => { const t = M.after(Math.max(0, ms), () => { if (p.done) return; if (!svg.isConnected) { p.finish(); return; } fn(); }); p.timers.push(t); return t; };
    p.anim = (el, kf, o) => { if (!el || !el.animate) return null; try { const a = el.animate(kf, o); p.anims.push(a); return a; } catch (_) { return null; } };
    p.end = (fn) => { p.ends.push(fn); return p; };
    p.finish = () => {
      if (p.done) return; p.done = true;
      p.timers.forEach((t) => t.cancel());
      /* the end state is written first and the animations are dropped after it, in the same task: no frame between */
      p.ends.forEach((fn) => { try { fn(); } catch (_) {} });
      p.anims.forEach((a) => { try { a.cancel(); } catch (_) {} });
      set.delete(p); resolve(true);
    };
    if (!set) { set = new Set(); perfs.set(svg, set); }
    set.add(p);
    return p;
  }
  function snapSvg(svg) { const set = svg && perfs.get(svg); if (set) [...set].forEach((p) => p.finish()); if (A.rig && svg) A.rig.finish(svg); }
  T.snap = function snap(host) { if (host) host.querySelectorAll('svg.o55-scene').forEach(snapSvg); };
  T.busy = function busy(host) { return !!host && [...host.querySelectorAll('svg.o55-scene')].some((svg) => { const set = perfs.get(svg); return !!(set && set.size); }); };
  /* a value held in steps: keyframes that hold each value for `ms` (no interpolation) */
  const held = (prop, values) => values.map((v, i) => ({ [prop]: v, offset: i / values.length, easing: 'steps(1, end)' })).concat([{ [prop]: values[values.length - 1], offset: 1 }]);
  /* the visor boot: rest dashes for 130 ms, then the scan notch shows and sweeps once (the CSS o55-nier-boot) */
  const BOOT = [{ opacity: 0, transform: 'none', easing: 'steps(1, end)' }, { opacity: 1, transform: 'none', offset: 0.25, easing: 'steps(1, end)' },
    { opacity: 1, transform: 'translateX(3.6px)', offset: 0.375, easing: 'steps(1, end)' }, { opacity: 1, transform: 'translateX(7.2px)', offset: 0.5, easing: 'steps(1, end)' },
    { opacity: 1, transform: 'translateX(10.8px)', offset: 0.625, easing: 'steps(1, end)' }, { opacity: 1, transform: 'translateX(14.4px)', offset: 0.75, easing: 'steps(1, end)' },
    { opacity: 1, transform: 'none', offset: 0.875 }, { opacity: 1, transform: 'none' }];
  function bootVisor(p, g, delay, fill) {
    p.anim(g.querySelector('.nv-rest'), [{ opacity: 1 }, { opacity: 0 }], { duration: 130, delay, easing: 'steps(1, end)', fill: fill || 'backwards' });
    p.anim(g.querySelector('.nv-scan'), BOOT, { duration: 520, delay, fill: fill || 'backwards' });
    p.at(delay, () => g.classList.remove('o55-rest'));
  }
  /* a unit's visor answers a new face at once (joy): any boot still running on it ends */
  const visorDone = (g) => g.querySelectorAll('.nv-scan, .nv-rest').forEach((el) => { if (el.getAnimations) el.getAnimations().forEach((a) => { if (typeof CSSAnimation === 'undefined' || !(a instanceof CSSAnimation)) a.finish(); }); });
  /* the stepped head dip of a bow (the .o55-bow class holds it once dipped) */
  function dip(p, g, delay) {
    p.anim(g.querySelector('.nv-head'), [{ translate: '0px 0px' }, { translate: '0px 4px' }], { duration: 240, delay, easing: 'steps(2, jump-start)', fill: 'backwards' });
    p.at(delay, () => g.classList.add('o55-bow', 'o55-rest'));
  }
  const unbow = (g) => g.classList.remove('o55-bow', 'o55-rest');
  /* a performance timed on its scene's own clock: the beat at `ms` after the scene arrived, now if it is past (late:
     the whole performance shifts so its first beat is now) */
  function since(svg) { const t0 = +svg.getAttribute('data-o55-t0'); return Number.isFinite(t0) && t0 > 0 ? Math.max(0, M.now() - t0) : 0; }
  /* You's arm and the link: the operator's signal (H1 and H2) */
  function armTo(p, you, t, states) { if (you) states.forEach((v, i) => p.at(t + i * 60, () => you.setAttribute('data-arm', v))); }
  function runLink(p, link, t) {
    const lk = link && link.querySelector('.o55-nier-link'); if (!lk) return t;
    const n = +(lk.style.getPropertyValue('--n') || 12) || 12, step = Math.max(14, Math.min(25, 300 / n));
    p.at(t, () => { link.style.setProperty('--o55-run-step', step + 'ms'); link.classList.remove('o55-nier-linkdark', 'o55-nier-linkoff'); link.classList.add('o55-nier-linkrun'); });
    return t + n * step;
  }

  /* ---------------------------------------------------------------- enter */
  const FAM_LAND = { basic: 360, friendly: 430, glass: 560, retro: 440 }; /* when a family's own drop entrance lands */
  T.enter = function enter(host, o) {
    o = o || {};
    const svg = sceneSvg(host); if (!svg) return Promise.resolve(false);
    snapSvg(svg);
    const wrap = svg.parentNode, fam = svg.getAttribute('data-family'), wasHeld = wrap.classList.contains('o55-ens-hold');
    const p = perf(svg, 'enter'), hs = units(svg), ens = hs.filter((g) => g.classList.contains('o55-ens-h'));
    if (fam !== 'nier') return enterFamily(p, svg, wrap, hs, ens, wasHeld);
    const order = (o.order || ['h1', 'h0', 'h2']).map((k) => item(svg, k)).filter((g) => g && ens.includes(g)), gap = o.gap == null ? 120 : o.gap;
    const you = item(svg, 'you'), link = item(svg, 'link'), signal = o.signal !== false && !!you;
    /* the entrance each unit had (CSS) is ended where it stands, so it never plays again over the fly-in */
    const ended = () => ens.forEach((g) => { const el = inner(g); if (el && el.getAnimations) el.getAnimations().forEach((a) => { if (typeof CSSAnimation !== 'undefined' && a instanceof CSSAnimation) a.finish(); }); });
    p.end(() => {
      wrap.classList.remove('o55-ens-hold'); ended();
      ens.forEach((g) => g.classList.remove('o55-nier-flyin', 'o55-rest'));
      if (you) you.removeAttribute('data-arm');
      if (link) link.classList.remove('o55-nier-linkdark', 'o55-nier-linkrun');
      if (A.rig) { A.rig.finish(svg, { drop: 0 }); A.rig.watch(svg, { settle: 260 }); }
    });
    if (!acts(svg)) { p.finish(); return p.promise; }
    /* the held state moves onto the items, so the layer's hold can go now */
    if (wasHeld) {
      if (you) you.setAttribute('data-arm', 'dn');
      if (link) link.classList.add('o55-nier-linkdark');
      ens.forEach((g) => g.classList.add('o55-nier-flyin', 'o55-rest'));
    }
    let t = 0;
    if (signal && wasHeld) {
      armTo(p, you, 0, ['mid', 'up']);
      p.at(120, () => SND('pointer', { intensity: 0.3, pan: -0.5 }));
      runLink(p, link, 120);
      if (A.rig) A.rig.bar(svg, -3, { delay: 200, ms: 120, steps: 2 });
      t = 280;
    }
    if (wasHeld) {
      /* lowered in, centre first: each unit from the top of its fly-in in 6 held steps (420 ms), a 2-step settle */
      const firstLand = t + 420;
      order.forEach((g, i) => {
        const el = inner(g), fly = parseFloat(el && el.style.getPropertyValue('--o55-fly')) || -91, sm = /scale\(\s*([\d.]+)\)/.exec(g.style.transform || ''), down = 2.5 / (sm ? +sm[1] || 1 : 1), d = t + i * gap;
        p.anim(el, [{ transform: `translateY(${fly}px)`, visibility: 'hidden', easing: 'steps(6, jump-start)' }, { transform: 'translateY(0px)', visibility: 'visible', offset: 420 / 560, easing: 'steps(1, end)' },
          { transform: `translateY(${down.toFixed(2)}px)`, visibility: 'visible', offset: 490 / 560, easing: 'steps(1, end)' }, { transform: 'translateY(0px)', visibility: 'visible' }], { duration: 560, delay: d, fill: 'both' });
        p.at(d + 420, () => { g.classList.remove('o55-nier-flyin'); SND('land', voiceOf(g)); });
      });
      wrap.classList.remove('o55-ens-hold'); ended();
      if (A.rig) { A.rig.watch(svg, { settle: t + (order.length - 1) * gap + 560 + 300, payout: true }); if (signal) p.at(firstLand, () => A.rig.bar(svg, 0, { ms: 120, steps: 2 })); }
      t += (order.length - 1) * gap + 460; /* 40 ms after the last landing */
    }
    /* the visors boot one after another, then the troupe answers: joy, a small stepped hop and the chord */
    hs.forEach((g, i) => bootVisor(p, g, t + i * 90));
    const tj = t + 300;
    hs.forEach((g, i) => p.at(tj + i * 90, () => {
      visorDone(g); joy(g, 620, 0); SND('cheer', voiceOf(g));
      if (A.rig && tied(svg, keyOf(g))) A.rig.cheer(svg, keyOf(g), { hop: 6, dur: 300, steps: 2, arm: 0.5, lean: 0 });
      if (keyOf(g) === 'h1') { lockOn(svg, g, 0); glance(svg, g); }
    }));
    p.at(tj + (hs.length - 1) * 90 + 640, () => p.finish());
    return p.promise;
  };
  /* a family's troupe arrives with its own entrance: the bar, then the helpers 120 ms apart, each landing in the
     family's material on its chord tone; then h0 cheers once */
  function enterFamily(p, svg, wrap, hs, ens, wasHeld) {
    const fam = svg.getAttribute('data-family'), bar = svg.querySelector('.o55-ens-bar');
    const css = (g) => { const el = inner(g); return el && el.getAnimations ? el.getAnimations().filter((a) => typeof CSSAnimation !== 'undefined' && a instanceof CSSAnimation) : []; };
    p.end(() => { wrap.classList.remove('o55-ens-hold'); [bar].concat(ens).filter(Boolean).forEach((g) => css(g).forEach((a) => a.finish())); });
    if (!wasHeld || !acts(svg)) { p.finish(); return p.promise; }
    const land = FAM_LAND[fam] || 400;
    if (bar) css(bar).forEach((a) => { try { a.effect.updateTiming({ delay: 0 }); a.currentTime = 0; } catch (_) {} });
    ens.forEach((g, i) => {
      const d = 200 + i * 120;
      css(g).forEach((a) => { try { a.effect.updateTiming({ delay: d }); a.currentTime = 0; } catch (_) {} });
      p.at(d + land, () => SND('land', voiceOf(g)));
    });
    wrap.classList.remove('o55-ens-hold');
    const last = 200 + (ens.length - 1) * 120 + land;
    if (A.rig) A.rig.watch(svg, { settle: last + 900 });
    const h0 = item(svg, 'h0');
    if (h0) p.at(last + 380, () => { SND('cheer', voiceOf(h0)); if (A.rig && tied(svg, 'h0')) A.rig.cheer(svg, 'h0'); else hop(h0, fam, false, 0); });
    p.at(last + 1100, () => p.finish());
    return p.promise;
  }

  /* ---------------------------------------------------------------- powerDown */
  T.powerDown = function powerDown(host) {
    const svg = sceneSvg(host); if (!svg || svg.getAttribute('data-family') !== 'nier') return Promise.resolve(false);
    snapSvg(svg);
    const p = perf(svg, 'powerDown'), hs = units(svg), you = item(svg, 'you'), link = item(svg, 'link');
    p.end(() => {
      hs.forEach((g) => g.classList.add('o55-rest'));
      if (you) you.setAttribute('data-arm', 'dn');
      if (link) { link.classList.remove('o55-nier-linkrun', 'o55-nier-linkoff'); link.classList.add('o55-nier-linkdark'); }
      if (A.rig) A.rig.finish(svg, { drop: 2 });
    });
    if (!acts(svg)) { p.finish(); return p.promise; }
    hs.forEach((g, i) => p.at(i * 90, () => g.classList.add('o55-rest')));
    if (A.rig) A.rig.bar(svg, 2, { ms: 60, steps: 1 });
    armTo(p, you, 0, ['mid', 'dn']);
    let tl = 0;
    const lk = link && link.querySelector('.o55-nier-link');
    if (lk) { const n = +(lk.style.getPropertyValue('--n') || 12) || 12; p.at(0, () => link.classList.add('o55-nier-linkoff')); tl = n * 20 + 40; }
    p.at(Math.max(300, tl), () => p.finish());
    return p.promise;
  };

  /* ---------------------------------------------------------------- wake */
  const SLUMP = { h0: -14, h1: 7, h2: 14 }; /* = 30-art.css --o55-slump */
  /* the beats, in ms after a call made as the asleep stage shows (the window's T560, design/hero-spec.md H2): the slit
     lights at T1010, the arm rises 50 later, the signal climbs at T1220, the control unit takes up the slack at T1430
     (the units rise 50, 130 and 210 after it), the visors boot 270 after it (60 after the last stamp when the stamps
     drive it) and h0 says hello 1170 after it. A caller with a boot log passes its stamps: { slit, link, takeup, boot }. */
  const WAKE = { slit: 450, link: 660, takeup: 870 };
  T.wake = function wake(host, o) {
    o = o || {};
    const svg = sceneSvg(host); if (!svg || !svg.classList.contains('o55-nier-asleep')) return Promise.resolve(false);
    snapSvg(svg);
    const p = perf(svg, 'wake'), hs = units(svg).filter((g) => g.classList.contains('o55-ens-h')), you = item(svg, 'you'), link = item(svg, 'link'), bar = item(svg, 'bar');
    let awake = false;
    const settle = () => { /* the drawing leaves its sleep: the composed asleep state and the wake's own animations go together */
      if (awake) return; awake = true;
      svg.classList.remove('o55-nier-asleep');
      hs.forEach((g) => g.classList.remove('o55-rest', 'o55-nier-slump'));
      if (you) ['data-arm', 'data-slit', 'data-head'].forEach((a) => you.removeAttribute(a));
      if (link) link.classList.remove('o55-nier-linkdark', 'o55-nier-linkrun');
      if (bar) bar.classList.remove('o55-nier-slitdark', 'o55-nier-slitlit');
      p.anims.forEach((a) => { try { a.cancel(); } catch (_) {} }); p.anims.length = 0;
      if (A.rig) { A.rig.finish(svg, { drop: 0, slack: 0 }); A.rig.watch(svg, { settle: 240 }); }
    };
    p.end(() => { settle(); if (A.rig) { hs.forEach((g) => A.rig.arm(svg, keyOf(g), 0, { ms: 0, steps: 1 })); A.rig.finish(svg); } });
    if (!acts(svg)) { p.finish(); return p.promise; }
    const at = o.at || {}, given = (k) => Object.prototype.hasOwnProperty.call(at, k);
    /* a beat [v, extra]: extra ms after v, a ms offset from the call or a Promise (a stamp); false: no such beat */
    const beat = (k, base, extra) => (given(k) ? [at[k], 0] : [base, extra]);
    const when = ([v, extra], fn) => {
      if (v === false || v == null) return;
      if (typeof v.then === 'function') v.then(() => { if (!p.done && svg.isConnected) fn(extra); });
      else fn(+v + extra);
    };
    const slit = beat('slit', WAKE.slit, 0), takeup = beat('takeup', WAKE.takeup, 0);
    when(slit, (t) => { if (you) { p.at(t, () => you.setAttribute('data-slit', 'half')); p.at(t + 60, () => you.setAttribute('data-slit', 'lit')); } });
    when(beat('arm', given('slit') ? at.slit : WAKE.slit, 50), (t) => {
      if (you) { p.at(t, () => { you.setAttribute('data-head', 'up'); you.setAttribute('data-arm', 'mid'); }); p.at(t + 60, () => you.setAttribute('data-arm', 'up')); }
    });
    when(beat('link', WAKE.link, 0), (t) => { const reach = runLink(p, link, t); if (bar) p.at(reach, () => bar.classList.add('o55-nier-slitlit')); });
    when(takeup, (t) => {
      /* the control unit takes up the slack: 14 units in 3 held steps; the strings go from sag to straight, and as each
         goes taut its unit rises from the slump in 3 held steps */
      if (A.rig) { A.rig.bar(svg, 0, { delay: t, ms: 330, steps: 3, slack: 0 }); p.at(t, () => A.rig.watch(svg, { settle: 50 + hs.length * 80 + 180 + 900 })); }
      hs.forEach((g, i) => {
        const d = t + 50 + i * 80, a = SLUMP[keyOf(g)] || 8, unit = g.querySelector('.o55-nier-unit');
        p.anim(unit, [{ transform: `translate(0px, 6px) rotate(${a}deg) scale(1, 0.86)` }, { transform: 'translate(0px, 0px) rotate(0deg) scale(1, 1)' }], { duration: 180, delay: d, easing: 'steps(3, jump-start)', fill: 'both' });
        p.anim(g.querySelector('.nv-head'), [{ translate: '0px 2px' }, { translate: '0px 0px' }], { duration: 180, delay: d, easing: 'steps(3, jump-start)', fill: 'both' });
        p.anim(g.querySelector('.nv-stub'), [{ opacity: 1 }, { opacity: 0 }], { duration: 120, delay: d, easing: 'steps(1, end)', fill: 'both' });
        p.at(d, () => SND('string', Object.assign(voiceOf(g), { step: i })));
      });
    });
    /* the visors boot one after another; then the drawing is awake (h0's arm stays down until its hello) */
    when(beat('boot', given('takeup') ? at.takeup : WAKE.takeup, given('boot') ? 60 : 270), (t) => {
      if (given('boot')) t += 60;
      hs.forEach((g, i) => bootVisor(p, g, t + i * 90, 'both'));
      p.at(t + (hs.length - 1) * 90 + 700, settle);
      if (given('hello') && at.hello === false) p.at(t + (hs.length - 1) * 90 + 760, () => p.finish());
    });
    /* h0's first hello: its wave arm, held down while asleep, comes up in 2 steps toward the pane, with joy and its cheer */
    const h0 = hs.find((g) => keyOf(g) === 'h0');
    when(beat('hello', given('takeup') ? at.takeup : WAKE.takeup, 1170), (t) => {
      p.at(t, () => { settle(); if (h0) { if (A.rig) A.rig.arm(svg, 'h0', 0, { ms: 120, steps: 2 }); joy(h0, 620, 0); SND('cheer', voiceOf(h0)); } });
      p.at(t + 700, () => p.finish());
    });
    return p.promise;
  };

  /* ---------------------------------------------------------------- bow, rise, point, wave */
  T.bow = function bow(host, o) {
    o = o || {};
    const svg = o.svg || (host && host.querySelector(':scope > .o55-scene-wrap.o55-scene-waiting svg.o55-scene')) || sceneSvg(host);
    if (!svg) return Promise.resolve(false);
    const hs = (o.keys ? o.keys.map((k) => item(svg, k)) : units(svg)).filter((g) => g && pose(g) && pose(g) !== 'bow');
    if (!hs.length || !acts(svg)) return Promise.resolve(false);
    const p = perf(svg, 'bow');
    p.end(() => { hs.forEach((g) => { if (o.hold != null) unbow(g); else g.classList.add('o55-bow', 'o55-rest'); }); });
    hs.forEach((g, i) => { const d = o.together === false ? i * 120 : 0; dip(p, g, d); if (o.sound !== false && (o.together === false || !i)) p.at(d, () => SND('bow', o.together === false ? voiceOf(g) : { voice: 0, pan: 0, intensity: 0.5 })); });
    const dipped = (o.together === false ? (hs.length - 1) * 120 : 0) + 240;
    if (o.hold != null) { p.at(dipped + o.hold, () => hs.forEach(unbow)); p.at(dipped + o.hold + 40, () => p.finish()); }
    else p.at(dipped, () => p.finish());
    return p.promise;
  };
  T.rise = function rise(host) { const svg = sceneSvg(host); if (svg) units(svg).forEach(unbow); return Promise.resolve(!!svg); };
  /* the unit nearest the pane (the right of the stage), among those whose right arm is free */
  function pointer(svg, key) {
    if (key) return item(svg, key);
    return units(svg).filter((g) => pose(g) && pose(g) !== 'wave' && pose(g) !== 'carry').sort((a, b) => xOf(b) - xOf(a))[0] || null;
  }
  function jab(p, g, t) {
    const pointing = pose(g) === 'point', arm = pointing ? g.querySelector('.nv-arm-r') : g.querySelector('.nv-alt-pt');
    if (!pointing) { p.at(t, () => { g.classList.remove('o55-arm-stand'); g.classList.add('o55-arm-aim'); }); p.at(t + 90, () => { g.classList.remove('o55-arm-aim'); g.classList.add('o55-arm-pt'); }); }
    else { p.at(t, () => { g.classList.remove('o55-arm-stand'); g.classList.add('o55-arm-aim'); }); p.at(t + 90, () => g.classList.remove('o55-arm-aim')); }
    p.anim(arm, held('translate', ['0px 0px', '2.6px 0px', '0px 0px', '2.6px 0px', '0px 0px']), { duration: 450, delay: t + 180 });
    return t + 630;
  }
  T.point = function point(host, key, o) {
    o = o || {};
    const svg = sceneSvg(host), g = svg && pointer(svg, key);
    if (!g || !(pose(g) === 'point' || has(g, '.nv-alt-pt'))) return Promise.resolve(false);
    const p = perf(svg, 'point');
    p.end(() => { g.classList.remove('o55-arm-aim', 'o55-arm-stand'); if (pose(g) !== 'point') g.classList.add('o55-arm-pt'); });
    /* a unit that only points for this cue goes back to its own pose after o.hold ms */
    if (o.hold != null && pose(g) !== 'point') p.promise.then(() => M.after(o.hold, () => g.classList.remove('o55-arm-pt')));
    if (!acts(svg)) { p.finish(); return p.promise; }
    p.at(jab(p, g, 0), () => p.finish());
    return p.promise;
  };
  T.wave = function wave(host, o) {
    o = o || {};
    const svg = sceneSvg(host); if (!svg) return Promise.resolve(false);
    const hs = (o.only ? [item(svg, o.only)] : units(svg)).filter(Boolean);
    const p = perf(svg, 'wave');
    const up = (g) => { if (A.rig && has(g, '.o55-arm')) return 'rig'; return has(g, '.nv-alt-up') ? 'alt' : null; };
    p.end(() => hs.forEach((g) => { const u = up(g); if (u === 'rig') A.rig.arm(svg, keyOf(g), o.only ? 0 : -24, { ms: 0, steps: 1 }); else if (u === 'alt') { g.classList.remove('o55-arm-mid', 'o55-arm-stand'); g.classList.add('o55-arm-up'); } }));
    if (!acts(svg)) { p.finish(); return p.promise; }
    hs.forEach((g, i) => {
      const d = i * 90, u = up(g);
      if (u === 'rig') A.rig.arm(svg, keyOf(g), o.only ? 0 : -24, { delay: d, ms: 120, steps: 2 });
      else if (u === 'alt') { p.at(d, () => { g.classList.remove('o55-arm-stand', 'o55-arm-pt'); g.classList.add('o55-arm-mid'); }); p.at(d + 60, () => { g.classList.remove('o55-arm-mid'); g.classList.add('o55-arm-up'); }); }
      if (o.joy !== false) joy(g, 620, d);
      if (o.sound !== false) p.at(d, () => SND('cheer', voiceOf(g)));
    });
    p.at((hs.length - 1) * 90 + 640, () => p.finish());
    return p.promise;
  };

  /* ---------------------------------------------------------------- the curtain call (Ready, NieR) */
  const CC = { bows: [1000, 1120, 1240], rest: 1450, rise: 1600 };
  A.curtainCall = function curtainCall(host, o) {
    o = o || {};
    const svg = sceneSvg(host); if (!svg) return Promise.resolve(false);
    snapSvg(svg);
    const p = perf(svg, 'curtainCall'), hs = units(svg), pt = item(svg, o.point || 'h2'), chord = o.chord || 'ready';
    const sting = () => { if (o.sting !== false) SND('chapter', { chapter: chord, depth: 4, intensity: 0.85 }); if (o.onRise) try { o.onRise(); } catch (_) {} };
    let rose = false;
    const rise = () => { if (rose) return; rose = true; hs.forEach(unbow); if (pt) pt.classList.remove('o55-arm-stand'); sting(); };
    p.end(rise);
    if (!acts(svg)) { p.finish(); return p.promise; }
    /* until the rise the unit that will point stands like the others (the curtain opens on a line); asked for after the
       scene arrived, it keeps pointing (no arm vanishes on screen) */
    if (pt && pose(pt) === 'point' && has(pt, '.nv-alt-stand') && since(svg) < 300) pt.classList.add('o55-arm-stand');
    /* on the scene's own clock; asked late (after 800 ms), the bows start 200 ms from now; o.at: the first bow that many
       ms from now (a small stage timed by its caller: the tour's results card) */
    const s0 = o.at != null ? CC.bows[0] - o.at : since(svg), shift = o.at == null && s0 > CC.bows[0] - 200 ? s0 - (CC.bows[0] - 200) : 0, t = (ms) => Math.max(0, ms - s0 + shift);
    hs.forEach((g, i) => { const d = t(CC.bows[i] != null ? CC.bows[i] : CC.bows[2] + (i - 2) * 120); dip(p, g, d); p.at(d, () => SND('bow', Object.assign(voiceOf(g), { chapter: chord }))); });
    p.at(t(CC.rest), () => { if (O55.sound && O55.sound.rest) O55.sound.rest(150); });
    p.at(t(CC.rise), () => {
      rose = true; hs.forEach(unbow); hs.forEach((g, i) => joy(g, 620, i * 40));
      sting();
      if (pt) jab(p, pt, 0);
    });
    p.at(t(CC.rise) + 700, () => p.finish());
    return p.promise;
  };

  /* ---------------------------------------------------------------- the Created act (NieR) */
  const CA = { land: 560, bow: 600, stamp: 1160 };
  A.createdAct = function createdAct(host, o) {
    o = o || {};
    const svg = sceneSvg(host);
    if (!svg || svg.getAttribute('data-family') !== 'nier' || svg.getAttribute('data-scene') !== 'creating' || svg.getAttribute('data-beat') !== 'done') {
      return Promise.resolve(A.celebrate(host, { big: true, direct: true }));
    }
    snapSvg(svg);
    const p = perf(svg, 'createdAct'), hs = units(svg), sign = item(svg, 'sign');
    if (o.name && sign) relabel(svg, sign, o.name);
    const signAt = () => { const m = /translate\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(sign ? sign.style.transform : ''); return m ? [+m[1], +m[2]] : [240, 68]; };
    let stamped = false;
    const stamp = () => {
      if (stamped) return; stamped = true;
      hs.forEach(unbow);
      if (!acts(svg)) { SND('celebrate'); return; }
      hs.forEach((g, i) => joy(g, 620, i * 60));
      if (A.rig) A.rig.cheer(svg, 'all', { hop: 8, dur: 360, stagger: 60, steps: 2, arm: 0.6, lean: 0 });
      if (sign) lockOn(svg, sign, 0);
      confetti(svg, 'nier', signAt(), 46, false, true);
      SND('celebrate', { pan: 0 });
    };
    p.end(stamp);
    if (!acts(svg)) { p.finish(); return p.promise; }
    const now = since(svg), t = (ms) => Math.max(0, ms - now);
    if (now < CA.land + 100) p.at(t(CA.land), () => SND('land', { voice: 1, pan: 0 }));
    if (now < CA.stamp - 240) p.at(t(CA.bow), () => { hs.forEach((g) => dip(p, g, 0)); });
    p.at(t(CA.stamp), stamp);
    p.at(t(CA.stamp) + 640, () => p.finish());
    return p.promise;
  };
  /* the name on the sign, when the scene was drawn without it (a caller that does not pass params.name): the sign is
     drawn again in place with the name, its strings and its stamp */
  function relabel(svg, sign, name) {
    const txt = sign.querySelector('text'), want = String(name).trim().slice(0, 22);
    if (!txt || !want || txt.textContent === want.toUpperCase() || !A.nier || !A.nier.props) return;
    const amEl = sign.querySelector(':scope > .o55-in > .o55-am'), m = /scale\(\s*(-?[\d.]+)\)/.exec(sign.style.transform || ''), xy = /translate\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(sign.style.transform || '');
    const mode = svg.classList.contains('o55-m-light') ? 'light' : 'dark', tok = A.nier.tokens(A.tokens(svg), mode);
    const ctx = { pal: A.nier.palette(mode, tok), tok, mode, items: null };
    const NS = 'http://www.w3.org/2000/svg', box = document.createElementNS(NS, 'svg');
    const lab = O55.t('art.nier.stamp'), stampWord = lab === 'art.nier.stamp' ? 'created' : lab;
    box.innerHTML = A.nier.props.badge(ctx, { x: xy ? +xy[1] : 240, y: xy ? +xy[2] : 68, s: m ? +m[1] : 1.4, opts: { label: want, accent: true, hang: -30, stamp: stampWord } });
    if (amEl && box.firstElementChild) { amEl.innerHTML = ''; amEl.appendChild(box.firstElementChild); }
  }

  /* ---------------------------------------------------------------- the thumbnail's peek (H6, H1) */
  const peeked = new WeakMap();
  const SWEEP = held('transform', ['translateX(3.6px)', 'translateX(7.2px)', 'translateX(10.8px)', 'translateX(14.4px)', 'none']);
  A.peek = function peek(host, o) {
    o = o || {};
    const svg = sceneSvg(host); if (!svg || svg.getAttribute('data-family') !== 'nier' || M.reduced()) return false;
    const now = M.now(); if (now - (peeked.get(svg) || -1e9) < 1000) return false;
    peeked.set(svg, now);
    const ctm = svg.getScreenCTM(), px = ctm && ctm.a > 0 ? 1 / ctm.a : 1; /* scene units per screen pixel */
    if (A.rig) { A.rig.bar(svg, 2 * px, { ms: 0, steps: 1 }); A.rig.bar(svg, 0, { delay: 160, ms: 0, steps: 1 }); A.rig.cheer(svg, 'all', { hop: 3 * px, dur: 240, stagger: 60, steps: 2, arm: 0.6, lean: 0 }); }
    units(svg).forEach((g, i) => {
      const sc = g.querySelector('.nv-scan'); if (sc && sc.animate) try { sc.animate(SWEEP, { duration: 300, delay: 60 + i * 60 }); } catch (_) {}
      if (o.joy) joy(g, 140, 0);
    });
    return true;
  };
})();
