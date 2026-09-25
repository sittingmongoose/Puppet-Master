/* O55.art.react / O55.art.celebrate — the puppets answer the person. A choice gets a small cheer from one helper; a
   Project made, and the last screen, get the whole troupe celebrating with a burst of the family's confetti (Basic:
   drafting marks; Friendly: tumbling paper; Glass: rising light motes; Retro: pixel squares on a stepped clock).
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
      retro: [{ transform: 'translateY(0)' }, { transform: `translateY(${-Math.round(h / 4) * 4}px)`, offset: 0.5 }, { transform: 'translateY(0)' }]
    }[family] || [];
    const opts = { duration: big ? 900 : 620, delay: delay || 0, easing: family === 'retro' ? 'steps(4, end)' : family === 'glass' ? 'cubic-bezier(0.3, 0, 0.2, 1)' : 'cubic-bezier(0.34, 1.3, 0.64, 1)', fill: 'none' };
    try { am.animate(kf, opts); } catch (_) {}
    if (big && family !== 'retro') try { am.animate(kf, Object.assign({}, opts, { delay: (delay || 0) + opts.duration + 80 })); } catch (_) {}
  }

  /* one helper cheers for a choice (the one nearest the middle, turn about) */
  let turn = 0;
  A.react = function react(host) {
    const svg = sceneSvg(host); if (!svg || quiet()) return false;
    const hs = helpers(svg); if (!hs.length) return false;
    const i = turn++ % hs.length, g = hs[i], key = g.getAttribute('data-key'), fam = svg.getAttribute('data-family');
    O55.sound.play('cheer', { voice: i }); /* each helper has its own voice */
    if (tied(svg, key) && A.rig) return A.rig.cheer(svg, key);
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
        : [{ transform: 'scale(0.4) rotate(-14deg)', opacity: 0 }, { transform: 'scale(1.16) rotate(4deg)', opacity: 1, offset: 0.55 }, { transform: 'scale(1) rotate(0deg)', opacity: 1 }],
      { duration: fam === 'retro' ? 360 : 460, easing: fam === 'retro' ? 'steps(3, end)' : fam === 'glass' ? 'cubic-bezier(0.3, 0, 0.2, 1)' : 'cubic-bezier(0.34, 1.4, 0.64, 1)' });
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
    const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'o55-confetti'); g.setAttribute('aria-hidden', 'true');
    fx.appendChild(g);
    let longest = 0;
    for (let i = 0; i < count; i++) {
      /* a fleck leaves up and to the right of the word, short and small; a celebration bursts up and all round */
      const c = colors[(i + (small ? Math.floor(Math.random() * 5) : 0)) % colors.length];
      const ang = small ? -Math.PI / 2 + 0.7 + (Math.random() - 0.5) * 1.1 : -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25, sp = small ? 26 + Math.random() * 30 : 120 + Math.random() * 170;
      const dx = Math.cos(ang) * sp, dy = Math.sin(ang) * sp, fall = small ? 26 + Math.random() * 24 : 170 + Math.random() * 120;
      let el;
      if (fam === 'retro') { el = document.createElementNS(NS, 'rect'); const s = 4 * (1 + (i % 2)); el.setAttribute('width', s); el.setAttribute('height', s); el.setAttribute('x', -s / 2); el.setAttribute('y', -s / 2); el.setAttribute('shape-rendering', 'crispEdges'); el.setAttribute('fill', c); }
      else if (fam === 'basic') { el = document.createElementNS(NS, 'path'); el.setAttribute('d', i % 3 ? 'M-4 0H4M0 -4V4' : 'M0 -3.5A3.5 3.5 0 1 1 0 3.5A3.5 3.5 0 1 1 0 -3.5'); el.setAttribute('fill', 'none'); el.setAttribute('stroke', i % 2 ? tok.blue : tok.orange); el.setAttribute('stroke-width', '1.4'); }
      else if (fam === 'glass') { el = document.createElementNS(NS, 'circle'); el.setAttribute('r', 2 + (i % 3)); el.setAttribute('fill', c); el.setAttribute('opacity', '0.85'); }
      else { el = document.createElementNS(NS, 'rect'); el.setAttribute('width', i % 2 ? 9 : 6); el.setAttribute('height', i % 2 ? 5 : 8); el.setAttribute('x', -4); el.setAttribute('y', -3); el.setAttribute('rx', '1.2'); el.setAttribute('fill', c); el.setAttribute('stroke', 'rgba(0,0,0,0.25)'); el.setAttribute('stroke-width', '0.6'); }
      el.style.transformBox = 'fill-box'; el.style.transformOrigin = 'center';
      g.appendChild(el);
      const x0 = at[0] + (Math.random() - 0.5) * (small ? 6 : 30), y0 = at[1];
      const spin = fam === 'retro' ? 0 : (Math.random() - 0.5) * 720; /* pixels never rotate */
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
