/* The pen and the props of Pip's stage (DL-238). A world's pen turns a prop's parts (body, shade, panel, accent, screen,
   ink, light, line) into that world's material, so every prop is drawn once and reads as felt in Friendly, glass in
   Glass, a clean diagram in Basic, pixels on the tube and halftone ink on the paper in Retro, and ink line art in NieR.
   Each prop draws in its own box centred on (0,0) and says where its strings tie on (ties) and how far its bottom
   reaches (foot); parameters change a prop in place (a sign's words, a clipboard's ticks). The props for the screens
   the concept did not draw are in 57-scenes-journey.js. */
(function () {
  'use strict';
  const O55 = window.O55, PIP = O55.pipStage, PW = O55.pipWorlds, Hp = PIP.h, R = Hp.R, mix = PW.mix;
  const MEAS = document.createElement('canvas').getContext('2d');

  function pen(w, ids) {
    const fam = w.fam;
    let defs = '';
    const used = {};
    const glassBody = (hue) => {
      const id = `${ids}gb${hue}`;
      if (!used[id]) {
        used[id] = 1;
        defs += `<linearGradient id="${id}" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${w.scheme === 'dark' ? .34 : .85}"/><stop offset=".55" stop-color="${w.hues[hue]}" stop-opacity="${w.scheme === 'dark' ? .26 : .3}"/><stop offset="1" stop-color="${w.hues[hue]}" stop-opacity="${w.scheme === 'dark' ? .42 : .48}"/></linearGradient>`;
      }
      return `url(#${id})`;
    };
    const rim = () => {
      const id = `${ids}grim`;
      if (!used[id]) { used[id] = 1; defs += `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${w.rim}"/><stop offset=".55" stop-color="${w.rim}" stop-opacity=".18"/><stop offset="1" stop-color="${w.rim}" stop-opacity=".5"/></linearGradient>`; }
      return `url(#${id})`;
    };
    // a printer's halftone: dots of the hue on the paper, denser for shade
    const halftone = (hue, r) => {
      const id = `${ids}ht${hue}${String(r).replace('.', '')}`;
      if (!used[id]) { used[id] = 1; defs += `<pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="4" fill="${w.paper}"/><circle cx="2" cy="2" r="${r}" fill="${w.hues[hue] || w.ink}" fill-opacity=".8"/></pattern>`; }
      return `url(#${id})`;
    };
    function style(role, hue) {
      hue = hue || 'a';
      const H = w.hues[hue];
      if (fam === 'friendly') {
        const dark = w.scheme === 'dark';
        return {
          body: `fill="${H}"`, shade: `fill="${mix(H, w.ink, .26)}"`, panel: `fill="${mix(H, '#ffffff', dark ? .5 : .62)}"`, accent: `fill="${w.hues[{ a: 'c', b: 'd', c: 'a', d: 'e', e: 'b' }[hue]]}"`,
          screen: `fill="${mix(w.ink, H, .14)}"`, ink: `fill="${w.ink}"`, light: `fill="#ffffff" fill-opacity=".9"`,
          line: `fill="none" stroke="${w.ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`
        }[role];
      }
      if (fam === 'glass') {
        return {
          body: `fill="${glassBody(hue)}" stroke="${rim()}" stroke-width="1.4"`, shade: `fill="${H}" fill-opacity=".45" stroke="${rim()}" stroke-width="1"`,
          panel: `fill="#ffffff" fill-opacity="${w.scheme === 'dark' ? .16 : .55}" stroke="${w.rimLow}" stroke-width=".9"`, accent: `fill="${H}"`,
          screen: `fill="${w.screen}" stroke="${w.rimLow}" stroke-width=".8"`, ink: `fill="${w.ink}"`, light: `fill="#ffffff" fill-opacity=".92"`,
          line: `fill="none" stroke="${w.ink}" stroke-opacity=".85" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`
        }[role];
      }
      if (fam === 'basic') {
        return {
          body: `fill="${w.surface}" stroke="${w.line}" stroke-width="2"`, shade: `fill="${mix(w.surface, w.line, .12)}" stroke="${w.line}" stroke-width="2"`,
          panel: `fill="${mix(w.surface, w.line, .06)}" stroke="${w.line}" stroke-width="1.5"`, accent: `fill="${w.accent}"`,
          screen: `fill="${mix(w.surface, w.accent, w.scheme === 'dark' ? .22 : .1)}" stroke="${w.line}" stroke-width="1.5"`, ink: `fill="${w.line}"`, light: `fill="${w.surface}"`,
          line: `fill="none" stroke="${w.line}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`
        }[role];
      }
      if (fam === 'retro' && w.tube === 'phosphor') {
        // a green monochrome monitor: dark fills, lit edges, the brightest phosphor for highlights
        return {
          body: `fill="${hue === 'n' ? w.fill : mix(w.bg, H, .2)}" stroke="${H}" stroke-width="2.4"`, shade: `fill="${w.fill2}" stroke="${w.mid}" stroke-width="2"`,
          panel: `fill="${w.bg}" stroke="${w.mid}" stroke-width="1.6"`, accent: `fill="${H}"`, screen: `fill="${w.screen}" stroke="${w.mid}" stroke-width="1.6"`,
          ink: `fill="${w.ink}"`, light: `fill="${w.bright}"`, line: `fill="none" stroke="${w.ink}" stroke-width="2.4" stroke-linecap="square"`
        }[role];
      }
      if (fam === 'retro') {
        // a two-colour ribbon on paper: ink line art, halftone fills, the red and blue for accents
        return {
          body: `fill="${halftone(hue, 1.15)}" stroke="${w.ink}" stroke-width="2.2"`, shade: `fill="${halftone(hue, 1.7)}" stroke="${w.ink}" stroke-width="2"`,
          panel: `fill="${w.paper}" stroke="${w.ink}" stroke-width="1.6"`, accent: `fill="${H}"`, screen: `fill="${w.ink}" stroke="${w.ink}" stroke-width="1.6"`,
          ink: `fill="${w.ink}"`, light: `fill="${w.paper}"`, line: `fill="none" stroke="${w.ink}" stroke-width="2.2" stroke-linecap="square"`
        }[role];
      }
      return {
        body: `fill="${w.paper}" stroke="${w.ink}" stroke-width="1.6"`, shade: `fill="${w.paper2}" stroke="${w.ink}" stroke-width="1.2"`,
        panel: `fill="${w.paper2}" stroke="${w.ink}" stroke-width="1"`, accent: `fill="${w.ink}"`, screen: `fill="${w.ink}"`,
        ink: `fill="${w.ink}"`, light: `fill="${w.paper}"`, line: `fill="none" stroke="${w.ink}" stroke-width="1.4" stroke-linecap="square"`
      }[role];
    }
    // each world's face, for prop text and for measuring it (a sign sizes itself to its words)
    const FACE = fam === 'retro' ? (w.tube === 'phosphor' ? "'VT323', 'IBM Plex Mono', ui-monospace, monospace" : "'IBM Plex Mono', ui-monospace, monospace") : fam === 'nier' ? "'PM NieR Sans','Inter',system-ui,sans-serif" : fam === 'glass' || fam === 'basic' ? "'Inter',system-ui,sans-serif" : "'Poppins',system-ui,sans-serif";
    const WEIGHT = fam === 'nier' ? 500 : 700;
    const P = {
      fam, w,
      measure: (t, size) => { MEAS.font = `${WEIGHT} ${size}px ${FACE}`; return MEAS.measureText(String(t)).width; },
      rect: (x, y, ww, hh, r, role, hue) => `<rect x="${R(x)}" y="${R(y)}" width="${R(ww)}" height="${R(hh)}" rx="${fam === 'retro' || fam === 'nier' ? Math.min(r, 2) : r}" ${style(role, hue)}/>`,
      circle: (x, y, r, role, hue) => `<circle cx="${R(x)}" cy="${R(y)}" r="${R(r)}" ${style(role, hue)}/>`,
      path: (d, role, hue) => `<path d="${d}" ${style(role, hue)}/>`,
      line: (x1, y1, x2, y2, role) => `<path d="M${R(x1)} ${R(y1)}L${R(x2)} ${R(y2)}" ${style(role || 'line')}/>`,
      text: (x, y, t, size, role, extra) => `<text x="${R(x)}" y="${R(y)}" font-size="${size}" text-anchor="middle" dominant-baseline="central" ${style(role || 'ink')} font-family="${FACE.replace(/"/g, '')}" font-weight="${WEIGHT}"${extra || ''}>${String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`,
      // a floor shadow under a prop (Friendly and Glass only)
      shadow: () => '',
      sparkle: (x, y, r, hue) => fam === 'nier' ? `<rect x="${R(x - r * .45)}" y="${R(y - r * .45)}" width="${R(r * .9)}" height="${R(r * .9)}" transform="rotate(45 ${R(x)} ${R(y)})" fill="${w.ink}"/>`
        : `<path d="M${R(x)} ${R(y - r)}Q${R(x + r * .16)} ${R(y - r * .16)} ${R(x + r)} ${R(y)}Q${R(x + r * .16)} ${R(y + r * .16)} ${R(x)} ${R(y + r)}Q${R(x - r * .16)} ${R(y + r * .16)} ${R(x - r)} ${R(y)}Q${R(x - r * .16)} ${R(y - r * .16)} ${R(x)} ${R(y - r)}Z" fill="${fam === 'basic' ? w.accent : w.hues[hue || 'e']}"/>`,
      defs: () => defs
    };
    return P;
  }
  PW.pen = pen;

  /* ------------------------------------------------------------ the props */
  // Each prop draws in its own box centred on (0,0) and says where its strings tie on (`ties`) and
  // how far its bottom reaches (`foot`). Parameters change a prop in place (a sign's words, ticks).
  const PROPS = {
    laptop(p) {
      let s = p.shadow(30, 44);
      s += p.rect(-40, -44, 80, 54, 8, 'body', 'a') + p.rect(-33, -37, 66, 40, 4, 'screen');
      // a tiny Pip face on the screen
      s += p.circle(-8, -20, 3, 'light') + p.circle(8, -20, 3, 'light') + `<path d="M-6 -12Q0 -7 6 -12" ${p.fam === 'friendly' ? 'stroke="#fff" stroke-opacity=".9"' : `stroke="${p.fam === 'nier' ? p.w.paper : p.fam === 'retro' ? (p.w.tube === 'phosphor' ? p.w.bright : p.w.paper) : '#fff'}"`} stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
      s += p.path('M-50 10H50L44 22H-44Z', 'shade', 'a') + p.rect(-9, 12, 18, 4, 2, 'panel', 'a');
      return { svg: s, ties: [[0, -44]], foot: 24 };
    },
    phone(p) {
      let s = p.shadow(34, 20);
      s += p.rect(-18, -34, 36, 66, 8, 'body', 'b') + p.rect(-13, -27, 26, 48, 4, 'screen') + p.circle(0, 25, 2.6, 'light');
      s += p.circle(-5, -6, 2.4, 'light') + p.circle(5, -6, 2.4, 'light');
      return { svg: s, ties: [[0, -34]], foot: 32 };
    },
    server(p) {
      let s = p.shadow(50, 34);
      s += p.rect(-32, -50, 64, 100, 8, 'body', 'd');
      for (let i = 0; i < 3; i++) {
        const y = -40 + i * 28;
        s += p.rect(-24, y, 48, 20, 4, 'panel', 'd') + `<g class="st-led" style="--dl:${-i * .4}s">${p.circle(14, y + 10, 3.2, 'accent', 'b')}</g>` + p.line(-16, y + 10, 4, y + 10, 'line');
      }
      return { svg: s, ties: [[0, -50]], foot: 50 };
    },
    page(p) {
      let s = p.shadow(44, 30);
      s += p.path('M-30 -42H14L32 -24V42H-30Z', 'body', 'b') + p.path('M14 -42V-24H32Z', 'shade', 'b');
      s += p.line(-18, -18, 6, -18) + p.line(-18, -4, 18, -4) + p.line(-18, 10, 12, 10);
      s += p.sparkle(26, 30, 11, 'e');
      return { svg: s, ties: [[-8, -42]], foot: 44 };
    },
    folder(p) {
      let s = p.shadow(36, 44);
      s += p.path('M-46 -28H-14L-6 -20H46V34H-46Z', 'shade', 'e');
      s += p.rect(-30, -34, 54, 40, 3, 'light') + p.line(-22, -24, 12, -24) + p.line(-22, -14, 4, -14);
      s += p.path('M-46 -10H46V34H-46Z', 'body', 'e');
      return { svg: s, ties: [[-30, -28], [30, -20]], foot: 36 };
    },
    restore(p) {
      let s = p.shadow(40, 38);
      s += p.rect(-38, -16, 76, 54, 8, 'body', 'd') + p.rect(-42, -26, 84, 16, 5, 'shade', 'd');
      s += p.circle(0, 12, 15, 'panel', 'd');
      s += `<path d="M-8 4A10 10 0 1 1 -9 16" ${p.fam === 'friendly' ? `stroke="${p.w.ink}"` : `stroke="${p.w.ink}"`} stroke-width="${p.fam === 'retro' ? 2.4 : 2.6}" fill="none" stroke-linecap="round"/>` + p.path('M-12 -1L-7 6L-14 7Z', 'ink');
      return { svg: s, ties: [[-30, -26], [30, -26]], foot: 40 };
    },
    // the sign sizes itself to the name: one line as large as fits, then two or three smaller lines, and only
    // past that does the end give way to an ellipsis
    sign(p, o) {
      const vt = p.fam === 'retro' && p.w.tube === 'phosphor', k = vt ? 1.35 : 1;
      const name = String((o && o.text) || '').replace(/\s+/g, ' ').trim(), txt = vt ? name.toUpperCase() : name;
      const MAXW = 152, PAD = 15, room = MAXW - PAD * 2, wid = (t, sz) => p.measure(t, sz * k) * 1.05;
      // greedy wrap at a size; a word too long for a line is broken where it must be
      const wrap = (sz) => {
        const out = []; let line = '';
        txt.split(' ').forEach((wd) => {
          const next = line ? line + ' ' + wd : wd;
          if (wid(next, sz) <= room) { line = next; return; }
          if (line) out.push(line);
          line = wd;
          while (wid(line, sz) > room && line.length > 1) { let n = line.length - 1; while (n > 1 && wid(line.slice(0, n) + '-', sz) > room) n--; out.push(line.slice(0, n) + '-'); line = line.slice(n); }
        });
        if (line) out.push(line);
        return out;
      };
      let size = 0, lines = [txt];
      for (const sz of [19, 18, 17, 16, 15]) if (wid(txt, sz) <= room) { size = sz; break; }
      if (!size) for (const sz of [15, 14, 13, 12]) { lines = wrap(sz); if (lines.length <= (sz > 13 ? 2 : 3)) { size = sz; break; } }
      if (!size) {
        size = 12; lines = wrap(12).slice(0, 3);
        let last = lines[2]; while (last.length > 1 && wid(last + '…', 12) > room) last = last.slice(0, -1);
        lines[2] = last.replace(/[\s-]+$/, '') + '…';
      }
      const lh = size * k * 1.18, tw = txt ? Math.max(...lines.map((l) => wid(l, size))) : 30;
      const W = Math.max(116, Math.min(MAXW, Math.ceil(tw + PAD * 2))), H = Math.max(58, Math.ceil(lines.length * lh + 26)), x0 = -W / 2, y0 = -28;
      let s = p.shadow(36, 52);
      s += p.rect(x0, y0, W, H, 10, 'body', 'e') + p.rect(x0 + 8, y0 + 8, W - 16, H - 16, 6, 'panel', 'e');
      s += p.circle(x0 + 14, y0 + 6, 2.6, 'shade', 'e') + p.circle(-x0 - 14, y0 + 6, 2.6, 'shade', 'e');
      const cy = y0 + H / 2 + 1;
      s += txt ? lines.map((l, i) => p.text(0, cy + (i - (lines.length - 1) / 2) * lh, l, size * k, 'ink')).join('') : `<g class="st-caret">${p.rect(-1.5, cy - 11, 3, 22, 1, 'ink')}</g>`;
      return { svg: s, ties: [[x0 + 14, y0], [-x0 - 14, y0]], foot: y0 + H };
    },
    vault(p) {
      let s = p.shadow(44, 40);
      s += p.rect(-40, -40, 80, 80, 10, 'body', 'b') + p.rect(-32, -32, 64, 64, 6, 'panel', 'b');
      s += p.circle(0, 0, 18, 'shade', 'b') + p.circle(0, 0, 6, 'ink');
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; s += p.line(Math.cos(a) * 9, Math.sin(a) * 9, Math.cos(a) * 15, Math.sin(a) * 15); }
      s += p.rect(26, -20, 6, 14, 2, 'ink') + p.rect(26, 6, 6, 14, 2, 'ink');
      return { svg: s, ties: [[0, -40]], foot: 44 };
    },
    cloud(p) {
      let s = '';
      s += p.path('M-40 18C-58 18 -58 -8 -38 -8C-40 -30 -6 -38 4 -18C14 -34 44 -26 38 -4C58 -4 56 18 40 18Z', 'body', 'a');
      s += `<path d="M0 10V-12M-9 -3L0 -12L9 -3" ${p.fam === 'nier' ? `stroke="${p.w.ink}"` : `stroke="${p.fam === 'basic' ? p.w.accent : p.w.ink}"`} stroke-width="${p.fam === 'retro' ? 2.4 : 3}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      return { svg: s, ties: [[0, -30]], foot: 18 };
    },
    backup(p) {
      let s = p.shadow(30, 36);
      s += p.rect(-36, -24, 72, 50, 10, 'body', 'c') + p.rect(-26, -14, 40, 8, 3, 'panel', 'c') + p.circle(22, -10, 4, 'accent', 'b');
      s += p.line(-26, 10, 26, 10) + p.line(-26, 2, 6, 2);
      return { svg: s, ties: [[0, -24]], foot: 28 };
    },
    house(p) {
      let s = p.shadow(40, 44);
      s += p.rect(-34, -6, 68, 46, 4, 'body', 'c') + p.path('M-44 -2L0 -40L44 -2Z', 'shade', 'c');
      s += p.rect(-10, 14, 20, 26, 3, 'ink') + p.rect(14, 2, 14, 12, 2, 'light') + p.rect(-28, 2, 14, 12, 2, 'light');
      return { svg: s, ties: [[0, -40]], foot: 40 };
    },
    globe(p) {
      let s = p.shadow(44, 30);
      s += p.circle(0, 0, 38, 'body', 'a');
      s += `<g ${p.fam === 'nier' ? '' : 'opacity=".9"'}>` + `<ellipse cx="0" cy="0" rx="16" ry="38" fill="none" ${p.fam === 'basic' || p.fam === 'nier' ? `stroke="${p.w.line}"` : `stroke="${p.w.ink}" stroke-opacity=".55"`} stroke-width="${p.fam === 'retro' ? 2.4 : 2}"/>`;
      s += `<path d="M-38 0H38M-33 -18H33M-33 18H33" ${p.fam === 'basic' || p.fam === 'nier' ? `stroke="${p.w.line}"` : `stroke="${p.w.ink}" stroke-opacity=".55"`} stroke-width="${p.fam === 'retro' ? 2.4 : 2}" fill="none"/></g>`;
      s += p.circle(14, -14, 6, 'accent', 'c');
      return { svg: s, ties: [[0, -38]], foot: 40 };
    },
    clipboard(p, o) {
      const ticks = (o && o.ticks) || 0, rows = (o && o.rows) || 4;
      let s = p.shadow(52, 40);
      s += p.rect(-38, -46, 76, 96, 8, 'body', 'e') + p.rect(-30, -34, 60, 78, 4, 'light');
      s += p.rect(-16, -52, 32, 14, 4, 'shade', 'e');
      for (let i = 0; i < rows; i++) {
        const y = -22 + i * 17;
        s += p.rect(-24, y - 5, 10, 10, 2, 'panel', 'e') + p.line(-8, y, 20, y);
        if (i < ticks) s += `<path d="M-22 ${y}L-19 ${y + 3}L-13 ${y - 4}" stroke="${p.fam === 'basic' ? p.w.accent : p.fam === 'nier' ? p.w.ink : p.w.hues.b}" stroke-width="${p.fam === 'retro' ? 2.4 : 2.8}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
      return { svg: s, ties: [[0, -52]], foot: 52 };
    },
    block(p, o) {
      const hue = (o && o.hue) || 'a', icon = (o && o.icon) || 'dot';
      let s = p.rect(-26, -22, 52, 44, 8, 'body', hue);
      const ic = {
        folder: p.path('M-12 -6H-3L0 -3H12V9H-12Z', 'ink'),
        history: `<circle cx="0" cy="2" r="9" fill="none" stroke="${p.w.ink}" stroke-width="${p.fam === 'retro' ? 2.4 : 2.6}"/>` + p.line(0, 2, 0, -3) + p.line(0, 2, 4, 4),
        cloud: p.path('M-10 8C-17 8 -17 -1 -10 -1C-10 -9 1 -10 3 -4C7 -9 15 -6 13 1C18 1 18 8 13 8Z', 'ink'),
        check: `<path d="M-9 1L-3 7L10 -6" stroke="${p.w.ink}" stroke-width="${p.fam === 'retro' ? 3 : 3.4}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
        globe: `<circle cx="0" cy="0" r="9" fill="none" stroke="${p.w.ink}" stroke-width="2.4"/>` + p.line(-9, 0, 9, 0) + `<ellipse cx="0" cy="0" rx="4" ry="9" fill="none" stroke="${p.w.ink}" stroke-width="2"/>`,
        dot: p.circle(0, 0, 4, 'ink'),
        /* (the real wizard's other phases: a device's folder, a restore, settings brought across) */
        nas: p.rect(-11, -9, 22, 8, 2, 'ink') + p.rect(-11, 2, 22, 8, 2, 'ink'),
        restore: `<path d="M-8 -2A9 9 0 1 1 -5 6" fill="none" stroke="${p.w.ink}" stroke-width="2.6" stroke-linecap="round"/>` + p.path('M-12 -6L-8 -1L-3 -6Z', 'ink'),
        stack: p.path('M0 -9L11 -3L0 3L-11 -3Z', 'ink') + `<path d="M-11 2L0 8L11 2" fill="none" stroke="${p.w.ink}" stroke-width="2.4" stroke-linejoin="round"/>`
      }[icon] || '';
      return { svg: s + ic, ties: [[0, -22]], foot: 22 };
    },
    orb(p, o) {
      const lit = o && o.lit, label = (o && o.label) || '', hue = (o && o.hue) || 'e';
      let s = '';
      if (lit && (p.fam === 'friendly' || p.fam === 'glass')) s += `<circle r="30" fill="${p.w.hues[hue]}" opacity=".22"/>`;
      s += p.circle(0, 0, 22, lit ? 'body' : 'panel', hue);
      if (lit) s += p.circle(0, 0, 13, 'accent', hue);
      s += p.text(0, 1, label, 15, lit ? (p.fam === 'nier' ? 'light' : 'ink') : 'ink', lit ? '' : ' opacity=".55"');
      s += p.rect(-6, -30, 12, 8, 2, 'shade', hue);
      return { svg: s, ties: [[0, -30]], foot: 22 };
    },
    gift(p) {
      let s = p.shadow(36, 36);
      s += p.rect(-34, -12, 68, 48, 6, 'body', 'c') + p.rect(-38, -24, 76, 16, 4, 'shade', 'c');
      s += p.rect(-6, -24, 12, 60, 2, 'accent', 'c');
      s += p.path('M0 -24C-12 -42 -28 -30 -14 -24ZM0 -24C12 -42 28 -30 14 -24Z', 'accent', 'c');
      return { svg: s, ties: [[-26, -24], [26, -24]], foot: 36 };
    },
    palette(p) {
      let s = p.shadow(30, 44);
      s += p.path('M0 -34C30 -34 46 -14 42 4C38 22 20 18 14 26C8 34 -8 34 -24 28C-46 18 -44 -34 0 -34Z', 'body', 'e');
      s += p.circle(-20, -12, 7, 'accent', 'a') + p.circle(0, -20, 7, 'accent', 'b') + p.circle(20, -12, 7, 'accent', 'c') + p.circle(-24, 10, 7, 'accent', 'd');
      s += p.circle(10, 8, 6, 'shade', 'e');
      return { svg: s, ties: [[0, -34]], foot: 30 };
    }
  };

  // headwear for the crew at the curtain call: Coordinator's crown, Builder's hard hat, Reviewer's glasses
  const HATS = {
    crown: (p) => p.path('M-14 0L-16 -16L-7 -8L0 -20L7 -8L16 -16L14 0Z', 'accent', 'e') + p.circle(0, -20, 2.6, 'light'),
    hardhat: (p) => p.path('M-17 0C-17 -14 17 -14 17 0Z', 'accent', 'e') + p.rect(-20, -2, 40, 5, 2, 'shade', 'e') + p.rect(-2, -14, 4, 10, 1, 'light'),
    glasses: (p) => `<g fill="none" stroke="${p.fam === 'nier' ? p.w.ink : p.w.fam === 'basic' ? p.w.line : p.w.ink}" stroke-width="2.2"><circle cx="-7" cy="0" r="5.4"/><circle cx="7" cy="0" r="5.4"/><path d="M-1.6 0H1.6"/></g>`
  };

  // the crew: little Pips on their own controls, each in its role's headwear
  PROPS.crew = function (p, o) {
    const theme = p.theme || 'friendly-dark', hat = (o && o.hat) || 'crown';
    const K = Hp.kit(); if (!K) return { svg: '', ties: [[0, -25.5]], foot: 20 };
    const mark = K.svg({ theme, px: 64, tier: 'full', decorative: true }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    // the glyph's head top sits at y 31.5; the hat rides on it
    const s = `<g transform="translate(-32 -40)">${mark}</g><g transform="translate(${hat === 'glasses' ? 0 : 0} ${hat === 'glasses' ? 3.5 : -9})">${HATS[hat](p)}</g>`;
    return { svg: s, ties: [[0, -25.5]], foot: 20 };
  };
  Object.assign(PW.PROPS, PROPS);
  Object.assign(PW.HATS, HATS);
})();
