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

  /* one helper cheers for a choice (the one nearest the middle, turn about) */
  let turn = 0;
  A.react = function react(host) {
    const svg = sceneSvg(host); if (!svg || quiet()) return false;
    const hs = helpers(svg); if (!hs.length) return false;
    const i = turn++ % hs.length, g = hs[i], key = g.getAttribute('data-key'), fam = svg.getAttribute('data-family');
    O55.sound.play('cheer', { voice: i }); /* each helper has its own voice */
    const isTied = tied(svg, key) && A.rig;
    if (fam === 'nier') { joy(g, isTied ? 760 : 620, 0); lockOn(svg, g, 0); glance(svg, g); }
    if (isTied) return A.rig.cheer(svg, key);
    hop(g, fam, false, 0);
    return true;
  };

  /* the troupe celebrates, and the family's confetti bursts from the middle of the stage */
  A.celebrate = function celebrate(host, o) {
    o = o || {};
    const svg = sceneSvg(host); if (!svg || quiet()) return false;
    const fam = svg.getAttribute('data-family'), hs = helpers(svg);
    if (A.rig && hs.some((g) => tied(svg, g.getAttribute('data-key')))) A.rig.cheer(svg, 'all', { big: true });
    hs.filter((g) => !tied(svg, g.getAttribute('data-key'))).forEach((g, i) => hop(g, fam, true, i * 110));
    /* NieR: every unit shows joy for its cheer (tied ones cheer one after another, 110 ms apart, as A.rig.cheer does);
       the middle unit is locked on */
    if (fam === 'nier') {
      let ti = 0, fi = 0;
      hs.forEach((g) => { const t = tied(svg, g.getAttribute('data-key')); joy(g, t ? 1300 : 900, (t ? ti++ : fi++) * 110); });
      const mid = hs.find((g) => g.getAttribute('data-key') === 'h1'); if (mid) { lockOn(svg, mid, 110); glance(svg, mid); }
    }
    confetti(svg, fam, o.at || [240, 300], o.count || 34);
    O55.sound.play('celebrate');
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

  function confetti(svg, fam, at, count, small) {
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
      const ang = small ? -Math.PI / 2 + 0.7 + (Math.random() - 0.5) * 1.1 : -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25, sp = small ? 26 + Math.random() * 30 : 120 + Math.random() * 170;
      const dx = Math.cos(ang) * sp, dy = Math.sin(ang) * sp, fall = small ? 26 + Math.random() * 24 : 170 + Math.random() * 120;
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
})();
