/* Pip's stage, the upgrade (Fable 5.2). The stage itself is the Pip concept's (stage.js, kept as it was); this file adds
   what makes it livelier and ties it to the sound:
   - Pip's mouth moves with its voice (PipSound.mouth(): how open, how round, as each syllable is heard);
   - the stage keeps time: Pip nods on the beat, the light behind it breathes on the bar, props give a little;
   - notes drift up from whatever is playing the tune;
   - more to look at in every look: a sun or a moon and bunting in Friendly, prisms and light in Glass, a drawing's
     title block and an oscilloscope line in Basic, stars and a spectrum on Retro Dark's tube, a tempo strip printed on
     Retro Light's paper, broken columns and a signal line in NieR; a pool of light under Pip; and a little depth
     (the backdrop slides against the pointer);
   - each concept dresses the stage: Encore sets a music box on the floor, House Band hangs an instrument for every
     player that has joined (each one moves when it plays), Marionette Theatre closes the stage in with curtains, a
     valance, footlights and a key that turns in time.
   Everything is drawn with the world's own pen, so it is felt in Friendly, glass in Glass, a diagram in Basic, phosphor
   or ink in Retro and line art in NieR. Under Reduced Motion nothing here moves: the pieces are shown, still. */
(function (G) {
  'use strict';
  const PSt = G.PipStage; if (!PSt) return;
  const P = PSt.Stage.prototype, PW = G.PipWorlds, NS = 'http://www.w3.org/2000/svg';
  const R = (v) => +(+v).toFixed(2), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const snd = () => G.PipSound || null;
  // the stage itself never stops for a fault in this file; the checks read what was caught here
  const caught = (e) => { const a = G.__ppxErrors = G.__ppxErrors || []; if (a.length < 8) a.push(String((e && e.stack) || e)); };
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const base = { build: P.build, render: P.render, renderHead: P.renderHead, setChapter: P.setChapter, setReduced: P.setReduced };
  const pointer = { x: 0.5, y: 0.5 };
  document.addEventListener('pointermove', (e) => { pointer.x = e.clientX / Math.max(1, innerWidth); pointer.y = e.clientY / Math.max(1, innerHeight); }, { passive: true });
  const kick = (node, frames, ms) => { if (node && node.animate) try { node.animate(frames, { duration: ms || 260, easing: 'cubic-bezier(.2,.8,.3,1)' }); } catch (e) { /* no web animations */ } };
  const NOTE = 'M3 -9V4.2A3.4 2.7 -18 1 1 1.2 2.6V-11.5L9 -13.5V-9.6Z';   // an eighth note, drawn (never an emoji)

  /* ------------------------------------------------------------------ pieces, drawn with the pen */
  const ART = {
    uke: (p, h) => p.circle(0, 34, 15, 'body', h) + p.circle(0, 15, 11, 'body', h) + p.rect(-3, -36, 6, 46, 2, 'shade', h) + p.rect(-5.5, -44, 11, 10, 2, 'shade', h) + p.circle(0, 26, 4.6, 'screen') + p.rect(-6.5, 40, 13, 3, 1, 'ink') + `<path d="M-1.6 -36V41M1.6 -36V41" stroke="${p.w.ink}" stroke-width=".8" opacity=".55"/>`,
    bass: (p, h) => p.circle(0, 36, 18, 'body', h) + p.circle(0, 10, 13, 'body', h) + p.rect(-2.6, -46, 5.2, 52, 2, 'shade', h) + p.circle(0, -47, 4.4, 'shade', h) + p.rect(-7, 44, 14, 3, 1, 'ink') + `<path d="M-7 22q-3 6 0 12M7 22q3 6 0 12M-1.5 -44V45M1.5 -44V45" fill="none" stroke="${p.w.ink}" stroke-width=".9" opacity=".6"/>` + p.rect(-1.2, 54, 2.4, 9, 1, 'ink'),
    drum: (p, h) => `<path d="M-13 -14L4 6M13 -14L-4 6" stroke="${p.w.ink}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>` + p.rect(-19, 8, 38, 24, 5, 'body', h) + p.path('M-19 10A19 6 0 0 1 19 10A19 6 0 0 1 -19 10Z', 'panel', h) + p.rect(-20, 26, 40, 4, 2, 'shade', h) + p.rect(-20, 8, 40, 3.4, 1.7, 'shade', h),
    bars: (p, h) => [0, 1, 2, 3, 4].map((i) => p.rect(-23 + i * 9.4, 6 + i * 1.6, 7.6, 36 - i * 5, 2, i % 2 ? 'panel' : 'body', h)).join('') + p.rect(-26, 13, 52, 3, 1.5, 'shade', h) + `<path d="M10 -12L-2 8" stroke="${p.w.ink}" stroke-width="2" stroke-linecap="round" opacity=".8"/>` + p.circle(11, -13, 4, 'accent', h),
    keys: (p, h) => p.rect(-25, 4, 50, 28, 5, 'body', h) + p.rect(-21, 11, 42, 15, 2, 'light') + [0, 1, 3, 4, 5].map((i) => p.rect(-17.6 + i * 6, 11, 3.4, 9, 1, 'ink')).join(''),
    bell: (p, h) => p.path('M-13 28C-13 9 -7 2 0 2C7 2 13 9 13 28Z', 'body', h) + p.rect(-15, 26, 30, 4.4, 2.2, 'shade', h) + p.circle(0, 34, 3.4, 'accent', h),
    shaker: (p, h) => p.circle(0, 14, 11, 'body', h) + p.rect(-2.8, 22, 5.6, 24, 2.5, 'shade', h) + p.circle(-3.5, 10, 2, 'light'),
    box: (p, h) => p.path('M-26 -14L-21 -42H31L26 -14Z', 'shade', h) + p.rect(-27, -14, 54, 30, 5, 'body', h) + p.rect(-22, -11, 44, 10, 2.5, 'screen') + p.rect(-17, -9.5, 28, 7, 3.5, 'accent', h)
      + [0, 1, 2, 3, 4].map((i) => p.circle(-13 + i * 5.2, -6 + (i % 2 ? 1.2 : -1.2), 1.1, 'light')).join('') + p.rect(13, -9.5, 6, 7, 1, 'panel') + p.rect(-23, 16, 8, 4, 2, 'shade', h) + p.rect(15, 16, 8, 4, 2, 'shade', h),
    crank: (p, h) => `<path d="M0 0H9V-9" fill="none" stroke="${p.w.ink}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>` + p.circle(9, -10, 3.2, 'accent', h),
    key: (p, h) => `<circle cx="-8" cy="-12" r="7" fill="none" stroke="${p.w.hues[h] || p.w.ink}" stroke-width="3.4"/><circle cx="8" cy="-12" r="7" fill="none" stroke="${p.w.hues[h] || p.w.ink}" stroke-width="3.4"/>` + p.rect(-2.4, -8, 4.8, 22, 2, 'shade', h)
  };

  /* ------------------------------------------------------------------ building the extra layers */
  function build(st) {
    const Lay = st.L, w = st.w, W = Lay.w, H = Lay.h, gy = Lay.ground, id = st.id + 'x', k = Lay.s / 2.6, fam = st.famName;
    st.px = { id, k, notes: 0, beat: 0, bar: 0, items: {}, par: [0, 0], lastNote: 0 };
    const X = st.px;
    // my own gradients, apart from the world's (those are rewritten when a prop needs a new one)
    X.defs = el('defs', null, st.svg);
    const warm = fam === 'basic' ? w.accent : fam === 'nier' ? w.ink : st.tube === 'phosphor' ? w.bright : st.tube ? w.amber : w.hues.e;
    X.warm = warm;
    X.defs.innerHTML = `<radialGradient id="${id}glow"><stop offset="0" stop-color="${warm}" stop-opacity=".55"/><stop offset="1" stop-color="${warm}" stop-opacity="0"/></radialGradient>`
      + `<linearGradient id="${id}cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".25" stop-color="#fff" stop-opacity="${w.scheme === 'dark' ? 0.11 : 0.3}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
      + `<radialGradient id="${id}pool"><stop offset="0" stop-color="${w.scheme === 'dark' ? '#fff' : warm}" stop-opacity="${w.scheme === 'dark' ? 0.16 : 0.22}"/><stop offset="1" stop-color="${warm}" stop-opacity="0"/></radialGradient>`;
    X.gDeco = el('g', { class: 'ppx-deco' }); st.svg.insertBefore(X.gDeco, st.gBack.nextSibling);
    X.gLight = el('g', { class: 'ppx-light' }); st.svg.insertBefore(X.gLight, st.gShadow);
    X.gSet = el('g', { class: 'ppx-set' }); st.svg.insertBefore(X.gSet, st.gShadow);
    X.gFront = el('g', { class: 'ppx-front' }); st.svg.insertBefore(X.gFront, st.gHud);
    // a pool of light under Pip, and (on dark stages) the cone it falls in
    if (!st.tube && fam !== 'basic') {
      X.cone = w.scheme === 'dark' ? el('path', { fill: `url(#${id}cone)`, class: 'ppx-cone' }, X.gLight) : null;
      X.pool = el('ellipse', { cx: 0, cy: gy + 3, rx: R(84 * k), ry: R(13 * k), fill: `url(#${id}pool)` }, X.gLight);
    }
    deco(st);
    dress(st);
    st.syncDefs();
    if (!st.pxSubs) subscribe(st);
  }

  /* more to look at in each world */
  function deco(st) {
    const X = st.px, Lay = st.L, w = st.w, W = Lay.w, H = Lay.h, gy = Lay.ground, k = X.k, fam = st.famName, p = st.pen, small = Lay.h < 300;
    let s = '', f = '';
    if (fam === 'friendly') {
      const sx = R(W * (small ? 0.93 : 0.9)), sy = R(small ? 34 : H * 0.085), r = 19 * Math.max(0.62, k);
      if (w.scheme === 'light') {
        let rays = ''; for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; rays += `M${R(sx + Math.cos(a) * (r + 8))} ${R(sy + Math.sin(a) * (r + 8))}L${R(sx + Math.cos(a) * (r + 15))} ${R(sy + Math.sin(a) * (r + 15))}`; }
        s += `<g class="ppx-sun" style="transform-origin:${sx}px ${sy}px"><path d="${rays}" stroke="${w.hues.e}" stroke-width="${R(3.4 * Math.max(0.7, k))}" stroke-linecap="round"/></g><circle cx="${sx}" cy="${sy}" r="${R(r)}" fill="${w.hues.e}"/><circle cx="${sx}" cy="${sy}" r="${R(r - 4)}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" stroke-dasharray="3 4"/>`;
      } else {
        s += `<circle cx="${sx}" cy="${sy}" r="${R(r)}" fill="#FFE9A8"/><circle cx="${R(sx + r * 0.42)}" cy="${R(sy - r * 0.2)}" r="${R(r * 0.86)}" fill="${w.sky[0]}"/><circle cx="${R(sx - r * 0.45)}" cy="${R(sy + r * 0.25)}" r="${R(r * 0.14)}" fill="#E8CF86"/>`;
        for (let i = 0; i < 12; i++) s += `<path class="ppx-star" style="--dl:${R(-i * 0.7)}s" transform="translate(${R((i * 89 + 30) % W)} ${R(14 + (i * 53) % (gy * 0.42))}) scale(${R(0.35 + (i % 3) * 0.16)})" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z" fill="#FFE9A8"/>`;
      }
      // bunting on a drooping thread
      if (!small) {
        const y0 = 22, dip = 34, n = 7, hues = Object.values(w.hues); let flags = '';
        for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = t * W, y = y0 + dip * 4 * t * (1 - t); flags += `<g class="ppx-flag" style="transform-origin:${R(x)}px ${R(y)}px;--dl:${R(-i * 0.4)}s"><path d="M${R(x - 9)} ${R(y)}L${R(x + 9)} ${R(y)}L${R(x)} ${R(y + 17)}Z" fill="${hues[i % hues.length]}" stroke="${w.stitch}" stroke-width="1.2" stroke-dasharray="3 3"/></g>`; }
        s += `<path d="M-10 ${y0}Q${W / 2} ${y0 + dip * 2} ${W + 10} ${y0}" fill="none" stroke="${w.stitch}" stroke-width="1.4"/>` + flags;
      }
      // felt trees on the far hill, grass and flowers in front
      const tree = (x, sc, hue) => `<g transform="translate(${R(x)} ${R(gy - 24)}) scale(${R(sc * Math.max(0.6, k))})"><rect x="-2.5" y="-16" width="5" height="18" rx="2" fill="${PW.mix(w.hill[2], w.ink, 0.25)}"/><circle cx="0" cy="-26" r="13" fill="${PW.mix(w.hill[1], hue, 0.42)}" stroke="${w.stitch}" stroke-width="1.2" stroke-dasharray="3 4"/><circle cx="-8" cy="-18" r="8" fill="${PW.mix(w.hill[1], hue, 0.34)}"/><circle cx="9" cy="-17" r="7" fill="${PW.mix(w.hill[1], hue, 0.5)}"/></g>`;
      s += tree(W * 0.07, 0.9, w.hues.b) + tree(W * 0.6, 0.7, w.hues.b) + tree(W * 0.95, 1.05, w.hues.a);
      const flower = (x, hue, dl) => `<g class="ppx-flower" data-beat="1" style="transform-origin:${R(x)}px ${R(H + 6)}px;--dl:${dl}s"><path d="M${R(x)} ${R(H + 8)}Q${R(x - 5)} ${R(H - 16)} ${R(x)} ${R(H - 34)}" fill="none" stroke="${PW.mix(w.hues.b, w.ink, 0.25)}" stroke-width="2.6" stroke-linecap="round"/>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${R(x + Math.cos(a / 57.3) * 6)}" cy="${R(H - 36 + Math.sin(a / 57.3) * 6)}" r="4.6" fill="${hue}"/>`).join('')}<circle cx="${R(x)}" cy="${R(H - 36)}" r="3.4" fill="${w.hues.e}"/></g>`;
      if (!small) f += flower(W * 0.06, w.hues.c, 0) + flower(W * 0.14, w.hues.d, -0.6) + flower(W * 0.93, w.hues.a, -1.1);
      let grass = ''; for (let i = 0; i < 9; i++) { const x = (i < 5 ? i * 9 : W - (i - 5) * 10) + (i < 5 ? 2 : -4); grass += `M${R(x)} ${H + 4}q${i % 2 ? -4 : 4} -14 ${i % 2 ? 2 : -2} -${18 + (i % 3) * 5}`; }
      if (!small) f += `<path d="${grass}" fill="none" stroke="${PW.mix(w.hill[2], w.hues.b, 0.5)}" stroke-width="3" stroke-linecap="round"/>`;
    } else if (fam === 'glass') {
      const sh = (x, tilt, wd, op) => `<path d="M${R(x)} -20L${R(x + wd)} -20L${R(x + wd + tilt)} ${H + 20}L${R(x + tilt)} ${H + 20}Z" fill="#fff" opacity="${op}" style="mix-blend-mode:${w.scheme === 'dark' ? 'plus-lighter' : 'soft-light'}"/>`;
      s += `<g class="ppx-shafts">${sh(W * 0.52, -W * 0.34, W * 0.1, w.scheme === 'dark' ? 0.045 : 0.3)}${sh(W * 0.76, -W * 0.34, W * 0.05, w.scheme === 'dark' ? 0.035 : 0.22)}</g>`;
      const prism = (x, y, r, hue, dl) => `<g class="ppx-prism" style="transform-origin:${R(x)}px ${R(y)}px;--dl:${dl}s"><g transform="translate(${R(x)} ${R(y)})">${p.path(`M0 ${R(-r)}L${R(r * 0.8)} ${R(r * 0.5)}L${R(-r * 0.8)} ${R(r * 0.5)}Z`, 'body', hue)}<path d="M0 ${R(-r)}L0 ${R(r * 0.5)}" stroke="#fff" stroke-opacity=".5" stroke-width="1"/><circle cx="${R(-r * 0.28)}" cy="${R(-r * 0.1)}" r="${R(r * 0.12)}" fill="#fff" opacity=".85"/></g></g>`;
      s += prism(W * 0.84, H * (small ? 0.3 : 0.2), 15 * Math.max(0.6, k), 'c', 0) + prism(W * 0.1, H * 0.52, 11 * Math.max(0.6, k), 'a', -2) + (small ? '' : prism(W * 0.92, H * 0.64, 9 * k, 'd', -4));
    } else if (fam === 'basic') {
      const ln = w.line, mark = (x, y) => `<g transform="translate(${R(x)} ${R(y)})" opacity=".34"><circle r="5" fill="none" stroke="${ln}" stroke-width="1"/><path d="M-9 0H9M0 -9V9" stroke="${ln}" stroke-width="1"/></g>`;
      s += mark(16, 16) + mark(W - 16, 16) + (small ? '' : mark(16, H - 16));
      if (!small) {
        const bx = W - 166, by = H - 46;
        s += `<g font-family="'Inter',system-ui,sans-serif" fill="${ln}"><rect x="${bx}" y="${by}" width="154" height="34" fill="${w.bg}" stroke="${ln}" stroke-opacity=".45" stroke-width="1"/><path d="M${bx} ${by + 17}H${bx + 154}M${bx + 106} ${by + 17}V${by + 34}" stroke="${ln}" stroke-opacity=".3" stroke-width="1"/><text x="${bx + 7}" y="${by + 12}" font-size="8" font-weight="700" letter-spacing=".08em" opacity=".72">PIP · STAGE</text><text class="ppx-sheet" x="${bx + 7}" y="${by + 28}" font-size="7.5" opacity=".6">SHEET 01 · WELCOME</text><text class="ppx-tempo" x="${bx + 112}" y="${by + 28}" font-size="7.5" opacity=".6">— BPM</text></g>`;
      }
      X.scope = el('path', { class: 'ppx-scope', fill: 'none', stroke: w.accent, 'stroke-width': '1.4', 'stroke-opacity': '.6', 'stroke-linejoin': 'round' });
    } else if (st.tube === 'phosphor') {
      for (let i = 0; i < 26; i++) s += `<rect class="ppx-star" style="--dl:${R(-i * 0.53)}s" x="${R((i * 97 + 20) % W)}" y="${R(26 + (i * 61) % (gy * 0.5))}" width="${1.5 + (i % 3) * 0.6}" height="${1.5 + (i % 3) * 0.6}" fill="${w.ink}"/>`;
      X.spec = el('path', { class: 'ppx-spec', fill: w.ink, 'fill-opacity': '.5' });
      X.specBox = [W - (small ? 120 : 132), small ? 34 : 82, 110, small ? 20 : 30];
      s += `<g opacity=".5"><rect x="${X.specBox[0] - 4}" y="${X.specBox[1] - 4}" width="${X.specBox[2] + 8}" height="${X.specBox[3] + 8}" fill="none" stroke="${w.ink}" stroke-opacity=".4" stroke-width="1"/><text x="${X.specBox[0] - 2}" y="${X.specBox[1] - 8}" font-family="VT323, monospace" font-size="12" fill="${w.ink}">AUDIO</text></g>`;
    } else if (st.tube) {
      s += `<text class="ppx-strip" x="34" y="${small ? 30 : 68}" font-family="'IBM Plex Mono', monospace" font-size="${small ? 8 : 9.5}" font-weight="600" letter-spacing=".06em" fill="${w.ink}" opacity=".62">TEMPO</text>`;
      s += `<text x="${W - 34}" y="${small ? 30 : 68}" text-anchor="end" font-family="'IBM Plex Mono', monospace" font-size="${small ? 8 : 9.5}" fill="${w.red}" opacity=".7">* * *</text>`;
    } else if (fam === 'nier') {
      const col = (x, h, wd, lean) => `<g transform="translate(${R(x)} ${gy}) rotate(${lean})" fill="${w.paper}" stroke="${w.ink}" stroke-width="1" opacity=".34"><path d="M${-wd / 2} 0V${-h}l${wd * 0.3} 5l${wd * 0.25} -7l${wd * 0.45} 6V0Z"/><path d="M${-wd / 2 - 3} 0h${wd + 6}M${-wd * 0.2} 0V${-h + 6}M${wd * 0.2} 0V${-h + 4}" fill="none"/></g>`;
      s += col(W * 0.7, 90 * k, 16 * k, 0) + col(W * 0.84, 130 * k, 18 * k, 0) + col(W * 0.95, 60 * k, 15 * k, 4);
      X.scope = el('path', { class: 'ppx-scope', fill: 'none', stroke: w.ink, 'stroke-width': '1', 'stroke-opacity': '.5' });
      s += `<text x="26" y="${small ? 30 : 46}" font-family="'PM NieR Mono', ui-monospace, monospace" font-size="6.5" letter-spacing="1.6" fill="${w.ink}" opacity=".5">AUDIO // SYNC</text>`;
    }
    X.gDeco.innerHTML = s; X.gFront.innerHTML = f;
    if (X.scope) X.gDeco.appendChild(X.scope);
    if (X.spec) X.gDeco.appendChild(X.spec);
    X.strip = X.gDeco.querySelector('.ppx-strip'); X.sheet = X.gDeco.querySelector('.ppx-sheet'); X.tempo = X.gDeco.querySelector('.ppx-tempo');
    X.beatEls = [...X.gFront.querySelectorAll('[data-beat]'), ...X.gDeco.querySelectorAll('[data-beat]')];
  }

  /* each concept's own set */
  function dress(st) {
    const X = st.px, S = snd(), c = (S && S.concept) || 'c1', Lay = st.L, w = st.w, W = Lay.w, H = Lay.h, gy = Lay.ground, k = X.k, p = st.pen, small = Lay.h < 300, fam = st.famName;
    X.concept = c; X.items = {}; X.src = null;
    X.gSet.innerHTML = ''; [...X.gFront.querySelectorAll('.ppx-dress')].forEach((n) => n.remove());
    [...X.gFront.children].forEach((n) => { n.style.display = c === 'c3' ? 'none' : ''; });
    const hue = (i) => ['a', 'c', 'b', 'd', 'e'][i % 5];
    if (c === 'c1' || c === 'orig') {
      // Encore: a music box on the floor; its crank turns with the tune and the notes come out of it
      if (c === 'orig' || Lay.h < 220 || fam === 'nier') return;
      const x = small ? W - 46 : 50 * k + 6, y = gy - 16 * k, sc = (small ? 0.62 : 0.86) * Math.max(0.7, k);
      const g = el('g', { class: 'ppx-box', transform: `translate(${R(x)} ${R(y)}) scale(${R(sc)})` }, X.gSet);
      g.innerHTML = `<ellipse cx="0" cy="20" rx="34" ry="5" fill="${w.shadow || 'rgba(0,0,0,.2)'}" opacity="${fam === 'friendly' || fam === 'glass' ? 1 : 0}"/><g class="ppx-pulse">` + ART.box(p, 'd') + `<g class="ppx-crank" transform="translate(27 2)">${ART.crank(p, 'c')}</g></g>`;
      X.crank = g.querySelector('.ppx-crank'); X.src = [x, y - 30 * sc]; X.srcEl = g.querySelector('.ppx-pulse');
    } else if (c === 'c2') {
      // House Band: an instrument for each player, hung at the back; it comes down when the player joins
      const kit = (S && S.kit) || 'friendly';
      const BY = { friendly: { comp: 'uke', bass: 'bass', drum: 'drum', lead: 'bars', sparkle: 'bell', perc: 'shaker' }, glass: { comp: 'keys', bass: 'bass', drum: 'drum', lead: 'bars', sparkle: 'bell', arp: 'bell', perc: 'shaker' },
        basic: { comp: 'keys', bass: 'bass', drum: 'drum', lead: 'bars', sparkle: 'bell', perc: 'shaker' }, phosphor: { arp: 'keys', bass: 'bass', drum: 'drum', lead: 'keys', sparkle: 'bell', perc: 'shaker' },
        teletype: { bass: 'keys', comp: 'keys', drum: 'drum', lead: 'keys', sparkle: 'bell', perc: 'shaker' }, nier: { comp: 'keys', bass: 'bass', drum: 'drum', lead: 'box', sparkle: 'bell', arp: 'uke', perc: 'shaker' } }[kit] || {};
      const order = ['comp', 'bass', 'drum', 'lead', 'sparkle'], spots = small ? [[0.58, 34], [0.67, 52], [0.76, 30], [0.85, 48], [0.94, 32]] : [[0.5, 108], [0.63, 146], [0.76, 112], [0.9, 182], [0.1, 176]];
      order.forEach((role, i) => {
        const kind = BY[role]; if (!kind) return;
        const x = spots[i][0] * W, len = spots[i][1] * (small ? 1 : Math.max(0.8, k)), sc = (small ? 0.36 : 0.56) * Math.max(0.75, k);
        const g = el('g', { class: 'ppx-inst ppx-dress', 'data-role': role, style: `transform-origin:${R(x)}px -20px;--dl:${R(-i * 0.9)}s;--d:${R(5.5 + i * 0.7)}s` }, X.gSet);
        g.innerHTML = `<g class="ppx-drop"><path d="M${R(x)} -30V${R(len - 44 * sc)}" stroke="${w.line || w.ink}" stroke-opacity=".5" stroke-width="1.2"/><g class="ppx-icon" transform="translate(${R(x)} ${R(len)}) scale(${R(sc)})"><g class="ppx-pulse">${ART[kind](p, hue(i))}</g></g></g>`;
        X.items[role] = { g, icon: g.querySelector('.ppx-pulse'), drop: g.querySelector('.ppx-drop'), at: [x, len], on: null };
      });
      parts(st, true);
    } else if (c === 'c3') {
      // Marionette Theatre: drapes, a scalloped valance, footlights, and the key that winds it all
      const cw = W * (small ? 0.06 : 0.09), vh = small || st.tube ? 12 : 26, col = 'c';
      const drape = `M-24 -30H${R(cw)}C${R(cw + 9)} ${R(H * 0.2)} ${R(cw - 11)} ${R(H * 0.36)} ${R(cw + 2)} ${R(H * 0.52)}C${R(cw + 10)} ${R(H * 0.66)} ${R(cw - 8)} ${R(H * 0.8)} ${R(cw)} ${H + 30}H-24Z`;
      const folds = `<path d="M${R(cw * 0.3)} -20C${R(cw * 0.44)} ${R(H * 0.3)} ${R(cw * 0.2)} ${R(H * 0.6)} ${R(cw * 0.32)} ${H + 20}M${R(cw * 0.66)} -20C${R(cw * 0.8)} ${R(H * 0.3)} ${R(cw * 0.52)} ${R(H * 0.62)} ${R(cw * 0.66)} ${H + 20}" fill="none" stroke="${w.ink}" stroke-opacity=".22" stroke-width="1.4"/>`;
      const side = (flip) => `<g class="ppx-drape ppx-dress" data-side="${flip ? 'r' : 'l'}"><g transform="${flip ? `translate(${W} 0) scale(-1 1)` : ''}">${p.path(drape, 'shade', col)}${folds}</g></g>`;
      let sc = `M-24 -34H${W + 24}V${vh}`; const n = small ? 9 : 6, sw = (W + 48) / n;
      const dip = small || st.tube ? 9 : 18;
      for (let i = n; i >= 1; i--) sc += `Q${R(-24 + (i - 0.5) * sw)} ${R(vh + dip)} ${R(-24 + (i - 1) * sw)} ${vh}`;
      let fringe = ''; for (let i = 0; i < n; i++) fringe += p.circle(-24 + (i + 0.5) * sw, vh + dip * 0.56, small ? 1.6 : 2.6, 'accent', 'e');
      let lamps = ''; const m = small ? 7 : 5;
      for (let i = 0; i < m; i++) { const x = W * (0.18 + 0.64 * i / (m - 1)), y = small ? H - 3 : H - 10; lamps += `<g class="ppx-lamp" data-i="${i}"><circle cx="${R(x)}" cy="${R(y - 4)}" r="${small ? 14 : 26}" fill="url(#${X.id}glow)" class="ppx-lampglow"/>${p.path(`M${R(x - 8)} ${R(y + 3)}A8 8 0 0 1 ${R(x + 8)} ${R(y + 3)}Z`, 'accent', 'e')}${p.rect(x - 10, y + 2, 20, 3.6, 1.8, 'shade', 'd')}</g>`; }
      const front = el('g', { class: 'ppx-dress ppx-theatre' }, X.gFront);
      front.innerHTML = side(false) + side(true) + `<g class="ppx-valance">${p.path(sc + 'Z', 'body', col)}${fringe}</g><g class="ppx-lamps">${small ? '' : p.rect(-24, H - 8, W + 48, 40, 0, 'shade', 'd')}${lamps}</g>`;
      X.drapes = [...front.querySelectorAll('.ppx-drape')]; X.lamps = [...front.querySelectorAll('.ppx-lampglow')];
      if (!small && fam !== 'nier') {
        // the music box at the front of the stage, with the key that winds it
        const x = W * 0.74, y = gy - 14 * k, sx = 0.74 * Math.max(0.7, k);
        const g = el('g', { class: 'ppx-box', transform: `translate(${R(x)} ${R(y)}) scale(${R(sx)})` }, X.gSet);
        g.innerHTML = '<g class="ppx-pulse">' + ART.box(p, 'e') + `<g transform="translate(34 4)"><g class="ppx-key">${ART.key(p, 'e')}</g></g></g>`;
        X.key = g.querySelector('.ppx-key'); X.src = [x, y - 26 * sx]; X.srcEl = g.querySelector('.ppx-pulse');
      }
    }
  }
  /* which players are in (House Band): each instrument comes down on its string when its part starts */
  function parts(st, instant) {
    const X = st.px, S = snd(); if (!X || X.concept !== 'c2' || !S || !S.parts) return;
    const on = {}; S.parts().forEach((q) => { if (q.on && q.role) on[q.role] = true; });
    Object.keys(X.items).forEach((role) => {
      const it = X.items[role], want = !!on[role] || (role === 'comp' && !!on.arp && !X.items.arp);
      if (it.on === want) return; it.on = want;
      it.g.classList.toggle('ppx-in', want);
      if (want && !instant && !st.reduced) { kick(it.drop, [{ transform: 'translateY(-170px)' }, { transform: 'translateY(8px)', offset: 0.7 }, { transform: 'none' }], 620); if (st.burst) st.burst([it.at[0], it.at[1]], st.famName === 'nier' ? ['nsq'] : st.tube ? ['pix'] : ['star', 'dot'], 6); }
    });
    if (X.items.lead && X.items.lead.on) X.src = [X.items.lead.at[0], X.items.lead.at[1] - 10];
    else if (X.items.comp) X.src = X.items.comp.on ? [X.items.comp.at[0], X.items.comp.at[1] - 10] : null;
  }

  /* ------------------------------------------------------------------ listening to the music */
  function subscribe(st) {
    const S = snd(); if (!S || !S.on) return;
    st.pxSubs = true;
    S.on('beat', (b) => { const X = st.px; if (!X || st.dead || !st.root.isConnected) return; X.beat = st.t; X.down = !!b.down; if (b.down) X.bar = st.t; X.bpm = b.bpm; X.meter = b.meter; X.beatN = (X.beatN || 0) + 1; X.barN = b.bar; try { onBeat(st, b); } catch (e) { caught(e); } });
    S.on('note', (n) => { const X = st.px; if (!X || st.dead || !st.root.isConnected) return; try { onNote(st, n); } catch (e) { caught(e); } });
    S.on('concept', () => { if (st.px && st.root.isConnected) { dress(st); st.syncDefs(); } });
    S.on('progress', () => { if (st.px && st.root.isConnected) parts(st); });
    S.on('music', (m) => { if (st.px && !m.on) { st.px.beat = -9; st.px.bar = -9; } });
  }
  function onBeat(st, b) {
    const X = st.px, ps = st.ps, fam = st.famName;
    if (st.reduced) return;
    // Pip nods with the beat (a Pod only dips), and what hangs beside it gives a little on the bar
    if (!st.sleepZ) {
      // a calm nod in Encore, a livelier one with the band; in three, Pip sways from side to side once a bar
      const amp = ({ c1: 0.85, c2: 1.25, c3: 1 }[X.concept] || 1) * (fam === 'nier' ? 0.4 : 1), three = b.meter === 3 || b.meter === 6;
      if (!st.fam.noHop) ps.dyv -= (b.down ? 44 : 24) * amp * (st.tube ? 0.8 : 1);
      if (three) { if (b.down) ps.tiltv += ((b.bar % 2) ? 1 : -1) * 1.5 * amp; } else ps.tiltv += ((X.beatN % 2) ? 1 : -1) * (b.down ? 0.9 : 0.5) * amp;
      if (b.down) st.props.forEach((pr) => { if (pr.state !== 'out' && pr.settled) pr.sqv = (pr.sqv || 0) + 0.5; });
    }
    X.beatEls.forEach((n, i) => kick(n, [{ transform: `rotate(${i % 2 ? -5 : 5}deg) scale(1.06)` }, { transform: 'none' }], 320));
    if (X.lamps) X.lamps.forEach((n, i) => { if (b.down || (X.beatN + i) % 2 === 0) kick(n, [{ opacity: 1 }, { opacity: 0.55 }], 420); });
    if (X.strip) { const s = (X.stripS || '') + (b.down ? '+' : '-'); X.stripS = s.slice(-26); X.strip.textContent = 'TEMPO ' + X.stripS; }
    if (X.tempo && X.tempoV !== b.bpm) { X.tempoV = b.bpm; X.tempo.textContent = (b.meter === 6 ? Math.round(b.bpm / 3) : b.bpm) + ' BPM'; }
    if (fam === 'glass' && b.down && st.ripple) st.ripple(st.L.w / 2, st.L.ground, false);
    if (X.key) { X.keyA = (X.keyA || 0) + 1; }
  }
  function onNote(st, n) {
    const X = st.px; if (st.reduced) return;
    if (X.concept === 'c2' && X.items[n.role]) { const it = X.items[n.role]; if (it.on) { it.n = (it.n || 0) + 1; kick(it.icon, [{ transform: `scale(${n.role === 'drum' ? '1.14, .9' : '1.1'}) rotate(${it.n % 2 ? 4 : -4}deg)` }, { transform: 'none' }], 200); } }
    if (n.role === 'lead' && X.srcEl && X.concept !== 'c2') kick(X.srcEl, [{ transform: 'scale(1.05, .96)' }, { transform: 'none' }], 180);
    // a note floats up from whatever plays the tune
    const src = X.src || (st.famName === 'nier' && st.H && X.concept !== 'orig' ? [st.H[0], st.H[1] - 6] : null);
    if (n.role !== 'lead' || !src || st.t - X.lastNote < 0.34 || st.fx.length > 60) return;
    X.lastNote = st.t; X.notes++;
    const w = st.w, fam = st.famName, hues = Object.values(w.hues), c = fam === 'basic' ? w.accent : fam === 'nier' ? w.ink : st.tube === 'phosphor' ? w.bright : st.tube ? (X.notes % 2 ? w.ink : w.red) : fam === 'glass' ? '#fff' : hues[X.notes % hues.length];
    const e = el('g', { class: 'pst-p ppx-note' }, st.gFx), sc = (fam === 'nier' ? 0.7 : 1) * Math.max(0.7, X.k);
    e.innerHTML = fam === 'nier' ? `<rect x="-2.6" y="-2.6" width="5.2" height="5.2" fill="${c}" transform="rotate(45)"/>` : `<path d="${NOTE}" fill="${c}" transform="scale(${R(sc)})"${fam === 'glass' ? ' opacity=".85"' : ''}/>`;
    st.fx.push({ e, kind: 'note', x: src[0] + (Math.random() - 0.5) * 16, y: src[1], vx: (Math.random() - 0.5) * 26, vy: -46 - Math.random() * 22, r: (Math.random() - 0.5) * 2, vr: (Math.random() - 0.5) * 1.4, life: 0, max: 1.5 + Math.random() * 0.5, g: -8, sway: Math.random() * 6, drag: 0.4 });
  }

  /* ------------------------------------------------------------------ Pip's mouth */
  function face(st) {
    const f = st.faceEl; st.pxMouth = null; if (!f) return;
    const nier = !!st.pipTh(st.pipTheme).nier;
    // the talking mouth: an oval that opens with each syllable (a Pod's is a square that grows)
    const m = nier ? el('rect', { class: 'ppx-mouth', x: 30.4, y: 50, width: 3.2, height: 3.2, visibility: 'hidden' }, f) : el('ellipse', { class: 'ppx-mouth', cx: 32, cy: 51.8, rx: 3, ry: 2, visibility: 'hidden' }, f);
    st.pxMouth = { el: m, nier, parts: null, ink: null, v: 0 };
  }
  function mouth(st) {
    const M = st.pxMouth, S = snd(); if (!M || !M.el.isConnected) return;
    const mo = S && S.mouth && !st.sleepZ ? S.mouth() : null, open = mo ? mo.open : 0;
    if (open < 0.05 && M.v < 0.05) { if (M.shown) { M.shown = false; M.el.setAttribute('visibility', 'hidden'); (M.parts || []).forEach((n) => n.removeAttribute('visibility')); } M.v = 0; return; }
    if (!M.parts) {
      // the face's own mouth: whatever part of it sits where a mouth does
      M.parts = [...st.faceEl.querySelectorAll('.pst-part')].filter((n) => { if (n.eyes || n.contains(M.el)) return false; try { const b = n.getBBox(), cy = b.y + b.height / 2, cx = b.x + b.width / 2; return cy > 47.5 && cy < 57 && cx > 25 && cx < 39 && b.width < 16; } catch (e) { return false; } });
      const probe = M.parts[0] && (M.parts[0].querySelector('[stroke]:not([stroke="none"])') || M.parts[0].querySelector('[fill]:not([fill="none"])'));
      M.ink = probe ? (probe.getAttribute('stroke') && probe.getAttribute('stroke') !== 'none' ? probe.getAttribute('stroke') : probe.getAttribute('fill')) : (st.pipTh(st.pipTheme).eye || '#222');
      M.el.setAttribute('fill', M.ink);
    }
    M.v += (open - M.v) * (st.frameRate() ? 0.9 : 0.55);
    const v = M.v;
    if (!M.shown) { M.shown = true; M.el.removeAttribute('visibility'); M.parts.forEach((n) => n.setAttribute('visibility', 'hidden')); }
    if (M.nier) { const h = 1.2 + v * 3.4; M.el.setAttribute('y', R(51.6 - h / 2)); M.el.setAttribute('height', R(h)); M.el.setAttribute('width', R(3.2 + v * 1.2)); M.el.setAttribute('x', R(32 - (3.2 + v * 1.2) / 2)); }
    else { M.el.setAttribute('rx', R((mo && mo.round ? 2.1 : 2.9) + v * 0.9)); M.el.setAttribute('ry', R(0.7 + v * 2.9)); }
  }

  /* ------------------------------------------------------------------ every frame */
  function frame(st) {
    const X = st.px; if (!X) return;
    const S = snd(), Lay = st.L, W = Lay.w, gy = Lay.ground, red = st.reduced, H = st.H || [Lay.ctl[0], Lay.ctl[1] + Lay.rope];
    // asleep or awake: the music is the tune alone while Pip sleeps
    if (X.sleep !== !!st.sleepZ) { X.sleep = !!st.sleepZ; if (S && S.progress) S.progress({ asleep: X.sleep }); }
    mouth(st);
    // the light on Pip
    if (X.pool) { X.pool.setAttribute('cx', R(H[0])); const b = red ? 0 : Math.max(0, 1 - (st.t - X.bar) / 0.5); X.pool.setAttribute('rx', R((84 + b * 10) * X.k)); }
    if (X.cone) X.cone.setAttribute('d', `M${R(H[0] - 16)} -20H${R(H[0] + 16)}L${R(H[0] + 92 * X.k)} ${gy + 6}H${R(H[0] - 92 * X.k)}Z`);
    // depth: the backdrop and its dressing slide a little against the pointer
    if (!st.tube && !red && st.famName !== 'nier') {
      const tx = (pointer.x - 0.5) * 2, ty = (pointer.y - 0.5) * 2; X.par[0] += (tx - X.par[0]) * 0.06; X.par[1] += (ty - X.par[1]) * 0.06;
      st.gBack.setAttribute('transform', `translate(${R(-X.par[0] * 3)} ${R(-X.par[1] * 2)})`); X.gDeco.setAttribute('transform', `translate(${R(-X.par[0] * 6)} ${R(-X.par[1] * 3.5)})`);
    } else if (X.par[0] || X.par[1]) { X.par = [0, 0]; st.gBack.removeAttribute('transform'); X.gDeco.removeAttribute('transform'); }
    // the world behind Pip swells on the bar
    const glow = st.gBack.querySelector('.st-glow');
    if (glow && !red) { const b = Math.max(0, 1 - (st.t - X.bar) / 0.6); glow.style.opacity = R(0.86 + 0.14 * b); }
    // what turns in time: the music box's crank, the theatre's key
    const tr = S && S.transport ? S.transport() : { playing: false };
    if (X.crank && !red) { X.crankA = (X.crankA || 0) + (tr.playing ? 2.6 : 0) * (st.frameRate() ? 3 : 1); X.crank.setAttribute('transform', `translate(27 2) rotate(${R(X.crankA)})`); }
    if (X.key && !red) { const ph = tr.playing ? (tr.bar * tr.meter + tr.beat) / (tr.pulse || 1) : 0; X.key.setAttribute('transform', `scale(${R(Math.cos(ph * Math.PI))} 1)`); }
    // the sound itself, drawn: a line in Basic and NieR, bars on Retro Dark's tube
    const an = S && S.analyser && S.analyser();
    if (an && (X.scope || X.spec) && !red) {
      if (X.scope) {
        const n = 64, buf = X.wave || (X.wave = new Uint8Array(an.fftSize)); an.getByteTimeDomainData(buf);
        const nier = st.famName === 'nier', x0 = 26, x1 = nier ? 112 : W - 26, y = nier ? (Lay.h < 300 ? 38 : 58) : gy + (Lay.h < 300 ? 14 : 38), amp = nier ? 22 : 46; let d = '';
        for (let i = 0; i < n; i++) { const v = (buf[Math.floor(i * buf.length / n)] - 128) / 128; d += (i ? 'L' : 'M') + R(x0 + (x1 - x0) * i / (n - 1)) + ' ' + R(y + clamp(v * amp, -12, 12)); }
        X.scope.setAttribute('d', d);
      }
      if (X.spec) {
        const bins = X.freq || (X.freq = new Uint8Array(an.frequencyBinCount)); an.getByteFrequencyData(bins);
        const [bx, by, bw, bh] = X.specBox, n = 18; let d = '';
        for (let i = 0; i < n; i++) { const a = Math.floor(Math.pow(i / n, 2) * 180) + 2, b2 = Math.floor(Math.pow((i + 1) / n, 2) * 180) + 3; let m = 0; for (let j = a; j < b2; j++) m = Math.max(m, bins[j]); const h = Math.max(1, Math.round((m / 255) * bh / 3) * 3); d += `M${R(bx + i * bw / n)} ${by + bh}v${-h}h${R(bw / n - 2)}v${h}Z`; }
        X.spec.setAttribute('d', d);
      }
    }
  }

  /* ------------------------------------------------------------------ joining the stage */
  P.build = function () { base.build.call(this); try { build(this); } catch (e) { caught(e); } };
  P.renderHead = function (mood, force) { const was = this.faceEl; base.renderHead.call(this, mood, force); if (this.faceEl !== was) face(this); };
  P.render = function () { base.render.call(this); try { frame(this); } catch (e) { caught(e); } };
  P.setChapter = function (ch) {
    const was = this.chapter; base.setChapter.call(this, ch);
    const X = this.px; if (!X || was === ch) return;
    const n = { welcome: 0, computer: 1, project: 2, ai: 3, ready: 4 }[ch] || 0;
    if (X.sheet) X.sheet.textContent = `SHEET 0${n + 1} · ${String(ch).toUpperCase()}`;
    // a new act: the drapes draw in and part again
    if (X.drapes && !this.reduced) X.drapes.forEach((d) => kick(d, [{ transform: 'none' }, { transform: `translateX(${d.dataset.side === 'r' ? -1 : 1}${Math.round(this.L.w * 0.16)}px)`, offset: 0.35 }, { transform: 'none' }], 900));
  };
  /* Pip types its line as it says it: the voice gives the moment of every letter (a breath at a comma, a longer one
     at a full stop), so the words and the sound stay together */
  P.sayNow = function (text, mood) {
    const b = this.bubble, S = snd();
    clearInterval(this.typeT);
    this.saying = text;
    if (!text) { b.classList.remove('on', 'typing'); if (S && S.hush) S.hush(); return; }
    if (!b.classList.contains('on')) { b.classList.remove('on'); void b.offsetWidth; b.classList.add('on'); }
    let r = null;
    if (S && S.say) try { r = S.say(text, { mood: mood || (this.spec.pip && this.spec.pip.mood) || 'idle', kit: S.kitOf ? S.kitOf(this.theme) : undefined }); } catch (e) { r = null; }
    const cps = (r && r.cps) || this.fam.cps, ms = (r && r.ms) || text.length / cps * 1000;
    this.sayAt = performance.now(); this.sayMs = ms;
    this.minShow = Math.min(1400, 450 + ms * 0.6);
    this.btext.innerHTML = '<span class="pst-bt-on"></span><span class="pst-bt-off"></span>';
    const on = this.btext.firstChild, off = this.btext.lastChild;
    if (this.reduced) { on.textContent = text; b.classList.remove('typing'); return; }
    let i = 0; off.textContent = text; b.classList.add('typing');
    const t0 = performance.now(), shown = r && typeof r.shown === 'function' ? r.shown : null;
    this.typeT = setInterval(() => {
      const el2 = performance.now() - t0, n = Math.min(text.length, shown ? Math.max(1, shown(el2)) : Math.floor(el2 / 1000 * cps) + 1);
      if (n !== i) { i = n; on.textContent = text.slice(0, i); off.textContent = text.slice(i); }
      if (i >= text.length) { clearInterval(this.typeT); b.classList.remove('typing'); }
    }, 16);
  };
})(window);
