/* Pip's stage, the upgrade, round two (Fable 5.2). The stage itself is the Pip concept's (stage.js, kept as it was); this
   file adds what makes it livelier and ties it to the sound:
   - Pip's mouth moves with its voice (PipSound.mouth(): how open, how round, as each syllable is heard);
   - the stage keeps time: Pip nods on the beat, the light behind it and the pool under it breathe on the bar;
   - a music box stands on the floor (not on NieR's), its crank turns once a bar, and notes drift up from it;
   - more to look at in every look: a sun or a moon and bunting in Friendly, prisms and light in Glass, a drawing's
     title block and an oscilloscope line in Basic, stars and a spectrum on Retro Dark's tube, a tempo strip printed on
     Retro Light's paper, broken columns and a signal line in NieR.
   Everything is drawn with the world's own pen. Under Reduced Motion nothing here moves: the pieces are shown, still.

   What it costs. PMConcept7's onboarding was made cheap to draw after round one, and its rules are kept here so this
   can go into its rig without undoing that:
   - what moves in time (the crank, the box, the light, the flowers, a floating note) is a transform or opacity
     animation the compositor runs, started when a song starts and left alone; no script runs per frame for it;
   - nothing is written every frame: the mouth is written only while Pip speaks, the sound's line or bars about twelve
     times a second and only when they change, texts only when they change;
   - the floating notes are five elements used again and again, never made and removed;
   - there is no parallax any more (round one slid the backdrop against the pointer: a write on every frame);
   - Pip's nod is a small push on the rig's own springs. In PMConcept7's rig it belongs in the idle pose (drawn at its
     30 Hz), so that a tune never wakes the full-rate drawing. */
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
  const NOTE = 'M3 -9V4.2A3.4 2.7 -18 1 1 1.2 2.6V-11.5L9 -13.5V-9.6Z';   // an eighth note, drawn (never an emoji)
  const SINE = 'cubic-bezier(.37,0,.63,1)';

  /* ------------------------------------------------------------------ the music box, drawn with the pen */
  const ART = {
    box: (p, h) => p.path('M-26 -14L-21 -42H31L26 -14Z', 'shade', h) + p.rect(-27, -14, 54, 30, 5, 'body', h) + p.rect(-22, -11, 44, 10, 2.5, 'screen') + p.rect(-17, -9.5, 28, 7, 3.5, 'accent', h)
      + [0, 1, 2, 3, 4].map((i) => p.circle(-13 + i * 5.2, -6 + (i % 2 ? 1.2 : -1.2), 1.1, 'light')).join('') + p.rect(13, -9.5, 6, 7, 1, 'panel') + p.rect(-23, 16, 8, 4, 2, 'shade', h) + p.rect(15, 16, 8, 4, 2, 'shade', h),
    /* The crank is on the box's side, so it is seen edge on: its axle comes straight out, and the arm with its handle
       goes round in a plane the eye looks along. From the front that is the arm rising and falling through the axle
       (round one turned it flat on the page, like a clock's hand). The arm is what moves: .ppx-crank, flipped about
       the axle's own line. */
    axle: (p, h) => `<path d="M-1 0H9" fill="none" stroke="${(p.w.hues && p.w.hues[h]) || p.w.ink}" stroke-width="2.8" stroke-linecap="round"/>` + p.circle(0, 0, 3, 'shade', h),
    // the arm is flipped about the axle (it is seen edge on, so it only grows and shrinks); the handle rides its end and stays round
    arm: (p, h) => `<path d="M9 0V-12" fill="none" stroke="${(p.w.hues && p.w.hues[h]) || p.w.ink}" stroke-width="2.8" stroke-linecap="round"/>`,
    knob: (p, h) => `<path d="M9 -12H14" fill="none" stroke="${(p.w.hues && p.w.hues.d) || p.w.ink}" stroke-width="2.8" stroke-linecap="round"/>` + p.circle(17, -12, 4.2, 'accent', h)
  };

  /* ------------------------------------------------------------------ building the extra layers */
  function build(st) {
    const Lay = st.L, w = st.w, W = Lay.w, H = Lay.h, gy = Lay.ground, id = st.id + 'x', k = Lay.s / 2.6, fam = st.famName;
    st.px = { id, k, notes: 0, lastNote: -9, anims: [], notePool: [], poolAt: 0, vizT: 0 };
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
      // (the light stands where Pip stands at rest; it does not follow each sway of the head, which would be a write on every frame)
      const hx = R(Lay.ctl[0]);
      if (X.cone) X.cone.setAttribute('d', `M${R(hx - 16)} -20H${R(hx + 16)}L${R(hx + 92 * k)} ${gy + 6}H${R(hx - 92 * k)}Z`);
      X.pool = el('ellipse', { class: 'ppx-poolglow', cx: hx, cy: gy + 3, rx: R(84 * k), ry: R(13 * k), fill: `url(#${id}pool)`, style: `transform-origin:${hx}px ${gy + 3}px` }, X.gLight);
    }
    deco(st);
    dress(st);
    // five notes to float, used again and again
    X.gNotes = el('g', { class: 'ppx-notes' }); st.svg.insertBefore(X.gNotes, st.gHud);
    for (let i = 0; i < 5; i++) { const g = el('g', { class: 'ppx-note', opacity: 0 }, X.gNotes); g.innerHTML = fam === 'nier' ? '<rect x="-2.6" y="-2.6" width="5.2" height="5.2" transform="rotate(45)"/>' : `<path d="${NOTE}" transform="scale(${R(Math.max(0.7, k))})"/>`; X.notePool.push(g); }
    st.syncDefs();
    if (!st.pxSubs) subscribe(st);
    tempo(st);
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
        // (stars twinkle in three groups: three layers to keep, not twelve)
        for (let g3 = 0; g3 < 3; g3++) { s += `<g class="ppx-star" style="--dl:${R(-g3 * 1.1)}s">`; for (let i = g3; i < 12; i += 3) s += `<path transform="translate(${R((i * 89 + 30) % W)} ${R(14 + (i * 53) % (gy * 0.42))}) scale(${R(0.35 + (i % 3) * 0.16)})" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z" fill="#FFE9A8"/>`; s += '</g>'; }
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
        s += `<g font-family="'Inter',system-ui,sans-serif" fill="${ln}"><rect x="${bx}" y="${by}" width="154" height="34" fill="${w.bg}" stroke="${ln}" stroke-opacity=".45" stroke-width="1"/><path d="M${bx} ${by + 17}H${bx + 154}M${bx + 106} ${by + 17}V${by + 34}" stroke="${ln}" stroke-opacity=".3" stroke-width="1"/><text x="${bx + 7}" y="${by + 12}" font-size="8" font-weight="700" letter-spacing=".08em" opacity=".72">PIP · STAGE</text><text class="ppx-sheet" x="${bx + 7}" y="${by + 28}" font-size="7.5" opacity=".6">SHEET 0${Math.max(0, ['welcome', 'computer', 'project', 'ai', 'ready'].indexOf(st.chapter)) + 1} · ${String(st.chapter || 'welcome').toUpperCase()}</text><text class="ppx-tempo" x="${bx + 112}" y="${by + 28}" font-size="7.5" opacity=".6">— BPM</text></g>`;
      }
      X.scope = el('path', { class: 'ppx-scope', fill: 'none', stroke: w.accent, 'stroke-width': '1.4', 'stroke-opacity': '.6', 'stroke-linejoin': 'round' });
      X.scopeX1 = small ? W - 26 : W - 166 - 14;                 // the line stops short of the drawing's title block
    } else if (st.tube === 'phosphor') {
      for (let g3 = 0; g3 < 3; g3++) { s += `<g class="ppx-star" style="--dl:${R(-g3 * 1.1)}s">`; for (let i = g3; i < 26; i += 3) s += `<rect x="${R((i * 97 + 20) % W)}" y="${R(26 + (i * 61) % (gy * 0.5))}" width="${1.5 + (i % 3) * 0.6}" height="${1.5 + (i % 3) * 0.6}" fill="${w.ink}"/>`; s += '</g>'; }
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

  /* the music box on the floor: every song has it (not on NieR's bare floor, and not where the stage is a low strip) */
  function dress(st) {
    const X = st.px, Lay = st.L, w = st.w, W = Lay.w, gy = Lay.ground, k = X.k, p = st.pen, small = Lay.h < 300, fam = st.famName;
    X.src = null; X.crank = null; X.knob = null; X.srcEl = null;
    X.gSet.innerHTML = '';
    if (Lay.h < 220 || fam === 'nier') return;
    // (on Retro Dark's tube the terminal's prompt is written at the left of the floor, so the box stands beside it)
    const x = small ? W - 50 : st.tube === 'phosphor' ? W * 0.4 : 54 * k + 6, y = gy - 18 * k, sc = (small ? 0.7 : 1) * Math.max(0.7, k);
    const g = el('g', { class: 'ppx-box', transform: `translate(${R(x)} ${R(y)}) scale(${R(sc)})` }, X.gSet);
    g.innerHTML = `<ellipse cx="0" cy="20" rx="34" ry="5" fill="${w.shadow || 'rgba(0,0,0,.2)'}" opacity="${fam === 'friendly' || fam === 'glass' ? 1 : 0}"/><g class="ppx-pulse">` + ART.box(p, 'd') + `<g transform="translate(27 2)">${ART.axle(p, 'd')}<g class="ppx-crank">${ART.arm(p, 'd')}</g><g class="ppx-knob">${ART.knob(p, 'c')}</g></g></g>`;
    X.crank = g.querySelector('.ppx-crank'); X.knob = g.querySelector('.ppx-knob'); X.src = [x, y - 30 * sc]; X.srcEl = g.querySelector('.ppx-pulse');
  }

  /* ------------------------------------------------------------------ keeping time
     When a song starts (or the stage is rebuilt under one), everything that moves with it is set going once, as
     animations the compositor runs: a loop a bar or a beat long, begun in step with the bar that is playing. Nothing
     is written per frame, and nothing runs when no song plays. */
  function tempo(st) {
    const X = st.px, S = snd(); if (!X) return;
    X.anims.forEach((a) => { try { a.cancel(); } catch (e) { /* gone */ } }); X.anims = [];
    const tr = S && S.transport ? S.transport() : { playing: false };
    st.root.classList.toggle('ppx-playing', !!tr.playing);
    if (!tr.playing || st.reduced || !S.ctx) return;
    const beat = tr.beatDur * (tr.pulse || 1) * 1000, bar = tr.beatDur * tr.meter * 1000, into = (S.ctx.currentTime - tr.barT) * 1000;
    const go = (node, frames, dur) => { if (!node || !node.animate) return; try { X.anims.push(node.animate(frames, { duration: dur, iterations: Infinity, delay: -(((into % dur) + dur) % dur) })); } catch (e) { /* no web animations */ } };
    // the crank: once round a bar (seen edge on: up through the axle and down again)
    go(X.crank, [{ transform: 'scaleY(1)', easing: SINE }, { transform: 'scaleY(-1)', easing: SINE }, { transform: 'scaleY(1)' }], bar);
    go(X.knob, [{ transform: 'translateY(0)', easing: SINE }, { transform: 'translateY(24px)', easing: SINE }, { transform: 'translateY(0)' }], bar);
    // the box gives a little on every beat, the pool of light and the glow behind Pip once a bar
    go(X.srcEl, [{ transform: 'scale(1.035, .97)', easing: 'ease-out' }, { transform: 'none', offset: 0.4 }, { transform: 'none' }], beat);
    go(X.pool, [{ transform: 'scaleX(1.1)', easing: 'ease-out' }, { transform: 'none', offset: 0.5 }, { transform: 'none' }], bar);
    go(st.gBack.querySelector('.st-glow'), [{ opacity: 1, easing: 'ease-out' }, { opacity: 0.86, offset: 0.6 }, { opacity: 0.86 }], bar);
    X.beatEls.forEach((n, i) => go(n, [{ transform: `rotate(${i % 2 ? -5 : 5}deg) scale(1.05)`, easing: 'ease-out' }, { transform: 'none', offset: 0.5 }, { transform: 'none' }], beat * 2));
    const bpm = tr.meter === 6 ? Math.round(tr.bpm / 3) : Math.round(tr.bpm);
    if (X.tempo && X.tempoV !== bpm) { X.tempoV = bpm; X.tempo.textContent = bpm + ' BPM'; }
  }

  /* ------------------------------------------------------------------ listening to the music */
  function subscribe(st) {
    const S = snd(); if (!S || !S.on) return;
    st.pxSubs = true;
    const live = () => st.px && !st.dead && st.root.isConnected;
    S.on('beat', (b) => { if (!live()) return; st.px.beatN = (st.px.beatN || 0) + 1; try { onBeat(st, b); } catch (e) { caught(e); } });
    S.on('note', (n) => { if (!live()) return; try { onNote(st, n); } catch (e) { caught(e); } });
    S.on('music', () => { if (live()) setTimeout(() => { if (live()) tempo(st); }, 60); });
    S.on('mute', () => { if (live()) tempo(st); });
  }
  function onBeat(st, b) {
    const X = st.px, ps = st.ps, fam = st.famName;
    if (st.reduced) return;
    // Pip nods with the beat, calmly (a Pod only dips); in three, Pip sways from side to side once a bar
    if (!st.sleepZ) {
      const amp = 0.8 * (fam === 'nier' ? 0.4 : 1), three = b.meter === 3 || b.meter === 6;
      if (!st.fam.noHop) ps.dyv -= (b.down ? 40 : 22) * amp * (st.tube ? 0.8 : 1);
      if (three) { if (b.down) ps.tiltv += ((b.bar % 2) ? 1 : -1) * 1.4 * amp; } else ps.tiltv += ((X.beatN % 2) ? 1 : -1) * (b.down ? 0.9 : 0.5) * amp;
    }
    // Retro Light prints the bar: one mark a bar on its tempo strip
    if (X.strip && b.down) { X.stripS = ((X.stripS || '') + (b.bar % 4 === 0 ? '+' : '-')).slice(-18); X.strip.textContent = 'TEMPO ' + X.stripS; }
    if (fam === 'glass' && b.down && b.bar % 2 === 0 && st.ripple) st.ripple(st.L.w / 2, st.L.ground, false);
  }
  /* a note floats up from the music box (from Pip, in NieR): one of five, set going and left to the compositor */
  function onNote(st, n) {
    const X = st.px; if (st.reduced || n.role !== 'lead') return;
    const src = X.src || (st.famName === 'nier' && st.H ? [st.H[0], st.H[1] - 6] : null);
    if (!src || st.t - X.lastNote < 0.5) return;
    X.lastNote = st.t; X.notes++;
    const w = st.w, fam = st.famName, hues = Object.values(w.hues), c = fam === 'basic' ? w.accent : fam === 'nier' ? w.ink : st.tube === 'phosphor' ? w.bright : st.tube ? (X.notes % 2 ? w.ink : w.red) : fam === 'glass' ? '#fff' : hues[X.notes % hues.length];
    const e = X.notePool[X.poolAt++ % X.notePool.length]; if (!e.animate) return;
    if (e.getAttribute('fill') !== c) e.setAttribute('fill', c);
    const x0 = src[0] + (Math.random() - 0.5) * 14, dx = (Math.random() - 0.5) * 44, up = 62 + Math.random() * 34, r0 = (Math.random() - 0.5) * 20;
    e.animate([{ transform: `translate(${R(x0)}px, ${R(src[1])}px) rotate(${R(r0)}deg)`, opacity: 0 }, { opacity: fam === 'glass' ? 0.85 : 1, offset: 0.14 }, { transform: `translate(${R(x0 + dx)}px, ${R(src[1] - up)}px) rotate(${R(-r0)}deg)`, opacity: 0 }], { duration: 1500 + Math.random() * 500, easing: 'cubic-bezier(.2,.6,.4,1)' });
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

  /* ------------------------------------------------------------------ every frame: almost nothing
     Asleep or awake is told to the sound when it changes; the mouth is written only while Pip speaks; the sound's own
     picture (a line in Basic and NieR, bars on Retro Dark's tube) is redrawn about twelve times a second, in whole
     pixels, and only when it differs from what is there. */
  function frame(st) {
    const X = st.px; if (!X) return;
    const S = snd(), Lay = st.L, W = Lay.w, gy = Lay.ground;
    if (X.sleep !== !!st.sleepZ) { X.sleep = !!st.sleepZ; if (S && S.progress) S.progress({ asleep: X.sleep }); }
    mouth(st);
    if (!(X.scope || X.spec) || st.reduced || st.t - X.vizT < 0.085) return;
    X.vizT = st.t;
    const an = S && S.analyser && S.analyser(); if (!an) return;
    if (X.scope) {
      const n = 48, buf = X.wave || (X.wave = new Uint8Array(an.fftSize)); an.getByteTimeDomainData(buf);
      const nier = st.famName === 'nier', x0 = 26, x1 = nier ? 112 : (X.scopeX1 || W - 26), y = nier ? (Lay.h < 300 ? 38 : 58) : gy + (Lay.h < 300 ? 14 : 38), amp = nier ? 22 : 46; let d = '';
      for (let i = 0; i < n; i++) { const v = (buf[Math.floor(i * buf.length / n)] - 128) / 128; d += (i ? 'L' : 'M') + Math.round(x0 + (x1 - x0) * i / (n - 1)) + ' ' + Math.round(y + clamp(v * amp, -12, 12)); }
      if (d !== X.scopeD) { X.scopeD = d; X.scope.setAttribute('d', d); }
    }
    if (X.spec) {
      const bins = X.freq || (X.freq = new Uint8Array(an.frequencyBinCount)); an.getByteFrequencyData(bins);
      const [bx, by, bw, bh] = X.specBox, n = 18; let d = '';
      for (let i = 0; i < n; i++) { const a = Math.floor(Math.pow(i / n, 2) * 180) + 2, b2 = Math.floor(Math.pow((i + 1) / n, 2) * 180) + 3; let m = 0; for (let j = a; j < b2; j++) m = Math.max(m, bins[j]); const h = Math.max(1, Math.round((m / 255) * bh / 3) * 3); d += `M${Math.round(bx + i * bw / n)} ${by + bh}v${-h}h${Math.round(bw / n - 2)}v${h}Z`; }
      if (d !== X.specD) { X.specD = d; X.spec.setAttribute('d', d); }
    }
  }

  /* ------------------------------------------------------------------ joining the stage */
  P.build = function () { base.build.call(this); try { build(this); } catch (e) { caught(e); } };
  P.renderHead = function (mood, force) { const was = this.faceEl; base.renderHead.call(this, mood, force); if (this.faceEl !== was) face(this); };
  P.render = function () { base.render.call(this); try { frame(this); } catch (e) { caught(e); } };
  P.setReduced = function (r) { base.setReduced.call(this, r); try { tempo(this); } catch (e) { caught(e); } };
  P.setChapter = function (ch) {
    const was = this.chapter; base.setChapter.call(this, ch);
    const X = this.px; if (!X || was === ch) return;
    const n = { welcome: 0, computer: 1, project: 2, ai: 3, ready: 4 }[ch] || 0;
    if (X.sheet) X.sheet.textContent = `SHEET 0${n + 1} · ${String(ch).toUpperCase()}`;
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
