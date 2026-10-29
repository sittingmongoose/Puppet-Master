/* Pip in the chat (Opus 5.5 concept), v0.1.
   Redraws the 5.6 Pro chat's puppets, sheets, menus and work panels with Pip, without editing a line of the chat.
   index.html loads this into the chat's own document after pm-logo.js (the logo kit) and, for Pip's voice,
   the onboarding's sound.js.

   How it reaches the chat. The chat renders by building markup and reconciling it into the page (app.js
   pmPatch: parse into a <template>, then patch what changed). Pip is applied where markup is parsed: the
   innerHTML setter runs `decorate` on every fragment that names a puppet, a sheet head, an Activity row and the
   rest, so the markup the chat compares against already has Pip in it, the reconcile finds nothing to undo, and
   a Pip that is on screen is never torn down and redrawn by the 500 ms work tick. Everything drawn this way is a
   pure function of the markup and the theme (no ids, no randomness), which is what lets two renders compare equal.
   The live parts (the Pip by each sheet's close button) sit in data-pm-keep islands the reconcile leaves alone.

   Presentation only: nothing here adds a step, a message or a setting to the chat itself, except the Pip
   settings this concept is about (wand > Preferences > Pip, and a section in Demo Studio). */
(function (W) {
  'use strict';
  const D = W.document, LOGO = W.PMLogo;
  if (!LOGO || W.PIP_CHAT) return;
  const K = LOGO.kit, R = K.R, mix = K.mix;

  /* ------------------------------------------------------------------ settings */
  // Each part is one thing Pip does, in the groups the Pip settings show. Size is how much it adds, as in
  // NieR Mode's Plug-in Chips; Pip's voice is the one part that starts off.
  const PARTS = [
    { key: 'cast', group: 'Where Pip appears', label: 'Teams on stage', help: 'Crew, BrainStorm, Review and Chat Room seats are Pips in their seat colours.', size: 6 },
    { key: 'marks', group: 'Where Pip appears', label: 'Helper marks', help: 'The small marks in team rows, chat cards and pickers.', size: 4 },
    { key: 'hosts', group: 'Where Pip appears', label: 'Sheet hosts', help: 'Each sheet has a Pip by its close button, holding up that sheet’s sign.', size: 5 },
    { key: 'status', group: 'Where Pip appears', label: 'Status faces in lists', help: 'In Scheduled and Memory, each row’s status icon is Pip’s face: sent is happy, failed says oops, waiting sleeps.', size: 3 },
    { key: 'activity', group: 'Where Pip appears', label: 'Activity rows', help: 'Each subagent in Activity Detail shows its Pip and how it is doing.', size: 3 },
    { key: 'orbit', group: 'Where Pip appears', label: 'Working orbit', help: 'Pip sits in the middle of the Orbit while work runs.', size: 3 },
    { key: 'plans', group: 'Where Pip appears', label: 'Plans', help: 'Pip holds up a plan that is ready for review, and naps beside a build that waits for its window.', size: 3 },
    { key: 'menu', group: 'Where Pip appears', label: 'Wand menu', help: 'Pip holds the wand at the top of Assistant capabilities.', size: 2 },
    { key: 'empty', group: 'Where Pip appears', label: 'Empty lists', help: 'A resting Pip where there is nothing yet.', size: 2 },
    { key: 'faces', group: 'Faces', label: 'State faces', help: 'Working shows thinking dots, done is happy, needs you wonders, failed says oops, waiting sleeps.', size: 4 },
    { key: 'watch', group: 'Faces', label: 'Watches what you point at', help: 'Rest the pointer on a control and the sheet’s Pip watches it.', size: 3 },
    { key: 'wonder', group: 'Faces', label: 'Wonders while you type', help: 'Big eyes while you write in a sheet’s fields.', size: 2 },
    { key: 'cheer', group: 'Faces', label: 'Cheers when you start', help: 'Happy, and a hop, when you press a sheet’s main button.', size: 2 },
    { key: 'oops', group: 'Faces', label: 'Oops on a refusal', help: 'A worried face when a button can’t be used yet.', size: 2 },
    { key: 'gaze', group: 'Faces', label: 'Eyes follow the pointer', help: 'The sheet’s Pip looks where the pointer is, and keeps looking there when it stops.', size: 2 },
    { key: 'blink', group: 'Motion', label: 'Blinks', help: 'Now and then, never two Pips at once.', size: 1 },
    { key: 'sway', group: 'Motion', label: 'Sways on its strings', help: 'The sheet’s Pip swings a little, as if a hand held it, and drops in when a sheet opens.', size: 2 },
    { key: 'swap', group: 'Motion', label: 'Blinks between faces', help: 'A face changes behind a quick blink, the way it does in onboarding.', size: 2 },
    { key: 'dots', group: 'Motion', label: 'Thinking dots move', help: 'The working face’s three dots bob in turn.', size: 1 },
    { key: 'seats', group: 'Look', label: 'Seat colours', help: 'Each helper wears its seat’s colour. Off: every Pip is the theme’s Pip.', size: 2 },
    { key: 'props', group: 'Look', label: 'Role props', help: 'Crown, hard hat, glasses, gavel, jester cap, page, pennant and the rest.', size: 3 },
    { key: 'strings', group: 'Look', label: 'Strings and control bar', help: 'Off: Pip floats without its strings.', size: 2 },
    { key: 'shine', group: 'Look', label: 'Cheeks and shine', help: 'Friendly and Glass only.', size: 1 },
    { key: 'voice', group: 'Sound', label: 'Pip’s voice', help: 'A small chirp with each face a sheet’s Pip makes, in the theme’s voice. Starts off.', size: 3 }
  ];
  const GROUPS = ['Where Pip appears', 'Faces', 'Motion', 'Look', 'Sound'];
  const KEYS = PARTS.map((p) => p.key);
  const MOTION_KEYS = ['blink', 'sway', 'swap', 'dots', 'cheer', 'gaze'];
  const PRESETS = [
    { id: 'full', label: 'Full', help: 'Everything but the voice', keys: () => KEYS.filter((k) => k !== 'voice') },
    { id: 'quiet', label: 'Quiet', help: 'Pip where work is; no reactions', keys: () => KEYS.filter((k) => ['voice', 'watch', 'wonder', 'cheer', 'oops', 'gaze', 'hosts', 'menu', 'empty'].indexOf(k) < 0) },
    { id: 'still', label: 'Still', help: 'Nothing moves', keys: () => KEYS.filter((k) => MOTION_KEYS.indexOf(k) < 0 && k !== 'voice') },
    { id: 'classic', label: 'Classic', help: 'The chat’s own puppets', keys: () => [] }
  ];
  const STORE = 'pip-chat:v1';
  let prefs = load();
  function load() {
    try {
      const v = JSON.parse(W.localStorage.getItem(STORE) || 'null');
      if (v && Array.isArray(v.parts)) return { parts: v.parts.filter((k) => KEYS.indexOf(k) >= 0) };
    } catch (e) { /* no storage */ }
    return { parts: PRESETS[0].keys() };
  }
  function save() { try { W.localStorage.setItem(STORE, JSON.stringify(prefs)); } catch (e) { /* no storage */ } }
  const has = (k) => prefs.parts.indexOf(k) >= 0;
  const still = () => D.documentElement.getAttribute('data-motion') === 'reduced' || (D.body && D.body.classList.contains('pm56-reduced')) ||
    !!(W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const moves = (k) => has(k) && !still();

  /* --------------------------------------------------------------------- look */
  // The chat paints NieR over Basic (body says basic-*, html says data-o55-nier), so NieR is read from both.
  function look() {
    const b = D.body, t = (b && b.getAttribute('data-theme')) || 'basic-dark';
    const scheme = /-light$/.test(t) ? 'light' : 'dark';
    const nier = D.documentElement.getAttribute('data-o55-nier') === 'on';
    const id = nier ? 'nier-' + scheme : (LOGO.THEMES[t] ? t : 'basic-' + scheme);
    const th = LOGO.THEMES[id];
    return { id, fam: th.family, scheme, th };
  }
  // computed colours, read once per theme (the seat hues are per-theme literals in the chat's CSS)
  let colorMemo = { key: '', v: {} };
  function cssColor(name) {
    const L = look(), key = L.id;
    if (colorMemo.key !== key) colorMemo = { key, v: {} };
    if (!(name in colorMemo.v)) colorMemo.v[name] = (W.getComputedStyle(D.body).getPropertyValue(name) || '').trim();
    return colorMemo.v[name];
  }
  function rgb(c) {
    c = String(c || '').trim();
    let m = /^#([0-9a-f]{3})$/i.exec(c);
    if (m) return m[1].split('').map((h) => parseInt(h + h, 16));
    m = /^#([0-9a-f]{6})/i.exec(c);
    if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
    m = /rgba?\(([^)]+)\)/.exec(c);
    if (m) return m[1].split(',').slice(0, 3).map((v) => parseFloat(v));
    return null;
  }
  function lum(c) {
    const v = rgb(c); if (!v) return .5;
    const f = (x) => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); };
    return .2126 * f(v[0]) + .7152 * f(v[1]) + .0722 * f(v[2]);
  }
  const pipHue = (th) => (Array.isArray(th.head) ? th.head[0] : th.head);
  // eyes that read on the head they sit on: the theme's own eye colour when it contrasts, else the other end
  function eyeFor(head, th) {
    const lh = lum(head), le = lum(th.eye);
    const ratio = (Math.max(lh, le) + .05) / (Math.min(lh, le) + .05);
    if (ratio >= 3.2) return th.eye;
    return lh > .42 ? '#1E1B24' : '#FFFFFF';
  }
  // the seat a mark sits in, from the style the chat gave it (--pmx-seat:var(--pmx-seat-3))
  function seatOf(el) {
    const s = (el && el.getAttribute && el.getAttribute('style')) || '';
    const m = /--pmx-seat:\s*var\(--pmx-seat-([a-z0-9]+)\)/i.exec(s);
    return m ? m[1] : '1';
  }
  function headFor(L, seat) {
    if (L.fam === 'nier') return L.th.ink;
    if (!has('seats')) return pipHue(L.th);
    return cssColor('--pmx-seat-' + seat) || pipHue(L.th);
  }
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

  /* -------------------------------------------------------------- moods */
  const STATE_MOOD = { working: 'dots', queued: 'sleep', needs: 'wonder', done: 'happy', failed: 'oops' };
  const ROW_MOOD = { working: 'dots', blocked: 'oops', idle: 'sleep', done: 'happy', attention: 'think' };
  // a list row's status (Scheduled: messages and build windows; Memory: notes and rules) as Pip's face
  const LIST_MOOD = { failed: 'oops', held: 'wonder', needs: 'wonder', scheduled: 'sleep', waiting: 'sleep', queued: 'sleep', paused: 'sleep', expired: 'sleep',
    sent: 'happy', done: 'happy', verified: 'happy', running: 'dots', sending: 'dots', unverified: 'think', stale: 'oops', conflict: 'oops', decide: 'wonder' };
  // and in the colour the chat already gives that status, so red still means failed at a glance
  const LIST_TONE = { failed: '--danger', stale: '--danger', conflict: '--danger', held: '--warning', needs: '--warning', decide: '--warning', sent: '--positive', done: '--positive', verified: '--positive' };
  const CLS = { eyes: 'pip-eyes', blink: 'pip-blink', dot: 'pip-dot', face: 'pip-face' };

  /* ---------------------------------------------------------------- props */
  // The role's prop, as the chat names it (data-prop): crown, gavel, hardhat, lens, jester, orbit, grill, page,
  // square, pennant. Drawn on Pip's 64 grid around its head; `back` goes behind the head (the far side of the
  // Wonderer's ring), `front` over it.
  function propInk(L, eye) {
    const th = L.th, dark = L.scheme === 'dark', fam = L.fam;
    // NieR: solid ink silhouettes, paper only where a line has to show on ink
    if (fam === 'nier') return { nier: true, gold: th.ink, gold2: th.ink, line: th.paper, wood: th.ink, paper: th.paper, cloth: th.ink, ink: th.ink, grill: th.ink, eye };
    // Basic stays flat, but a crown and a hard hat are gold in every theme, so they read on any seat (a white lead)
    if (fam === 'basic') return { gold: dark ? '#F5BD55' : '#B57100', gold2: dark ? '#D69A35' : '#8F5900', line: th.bg, wood: th.ctl, paper: dark ? '#F2F2F2' : '#FFFFFF', cloth: th.accent, ink: th.ctl, grill: dark ? '#3A3A3A' : '#2B2B2B', eye };
    return {
      gold: dark ? '#F6C552' : '#E8AE2C', gold2: dark ? '#D9A236' : '#C98E1A', line: dark ? '#2A2233' : '#3B2F36',
      wood: dark ? '#D39A68' : '#B9814F', paper: dark ? '#F6F0E7' : '#FFFFFF', cloth: dark ? '#FF7F8A' : '#D9475A',
      ink: th.ctl, grill: dark ? '#3B3740' : '#2D2A30', eye
    };
  }
  function propSvg(prop, g, L, eye, detail) {
    if (!has('props') || !prop) return { back: '', front: '' };
    const c = propInk(L, eye), hy = g.head.y0, lw = detail ? 1.3 : 1.9;
    const edge = c.nier || L.fam === 'basic' ? '' : ` stroke="${c.line}" stroke-width="${lw * .8}" stroke-linejoin="round"`;
    const P = (d, fill, extra) => `<path d="${d}" fill="${fill}"${extra == null ? edge : extra}/>`;
    switch (prop) {
      case 'crown': {
        const b = hy + 1.6;
        return { back: '', front: P(`M22.5 ${b}L21 ${b - 9.5}L27 ${b - 4.6}L32 ${b - 11.5}L37 ${b - 4.6}L43 ${b - 9.5}L41.5 ${b}Z`, c.gold) +
          (detail && !c.nier ? `<circle cx="32" cy="${R(b - 3)}" r="1.7" fill="${c.cloth}"/>` : '') };
      }
      case 'hardhat': {
        const b = hy + 3.2;
        return { back: '', front: P(`M18.5 ${b}C18.5 ${R(b - 14.5)} 45.5 ${R(b - 14.5)} 45.5 ${b}Z`, c.gold) +
          P(`M14.5 ${R(b - 1.6)}H49.5V${R(b + 2.4)}H14.5Z`, c.gold2, c.nier ? null : L.fam === 'basic' ? '' : undefined) +
          (detail ? `<path d="M32 ${R(b - 10.5)}V${R(b - 2)}" stroke="${c.nier ? c.paper : c.line}" stroke-opacity="${c.nier ? 1 : .35}" stroke-width="${c.nier ? 1.4 : 2.4}" stroke-linecap="${c.nier ? 'butt' : 'round'}"/>` : '') };
      }
      case 'lens': {
        // the onboarding's Reviewer wears glasses; here they ring the eyes, in the eyes' own ink
        const e = g.eye, r = R(e.r * 1.62), L0 = 32 - e.dx, R0 = 32 + e.dx, sw = detail ? 1.7 : 2.6;
        if (c.nier) {
          // NieR's eyes are its visor: a square lens on the band, paper on ink, its handle out past the jaw
          const vy = detail ? 40.6 : 42, q = detail ? 7.4 : 8.6;
          return { back: '', front: `<rect x="${R(R0 - q / 2)}" y="${R(vy - q / 2)}" width="${q}" height="${q}" fill="none" stroke="${c.paper}" stroke-width="${detail ? 1.3 : 2}"/>` +
            `<path d="M${R(R0 + q / 2)} ${R(vy + q / 2)}L${R(R0 + q / 2 + 7)} ${R(vy + q / 2 + 7)}" stroke="${c.ink}" stroke-width="${detail ? 2.2 : 3}" stroke-linecap="square"/>` };
        }
        const ring = (x) => c.nier ? `<rect x="${R(x - r)}" y="${R(e.y - r)}" width="${R(r * 2)}" height="${R(r * 2)}"/>` : `<circle cx="${x}" cy="${e.y}" r="${r}"/>`;
        return { back: '', front: `<g fill="none" stroke="${c.nier ? c.ink : eye}" stroke-width="${sw}" stroke-linecap="round">${ring(L0)}${ring(R0)}` +
          `<path d="M${R(L0 + r)} ${e.y - .6}Q32 ${R(e.y - 2.6)} ${R(R0 - r)} ${e.y - .6}"/></g>` };
      }
      case 'gavel': {
        const t = 'rotate(-38 55.5 33)';
        return { back: '', front: `<path d="M48 51L56 35" stroke="${c.wood}" stroke-width="${detail ? 2.6 : 3.6}" stroke-linecap="round"/>` +
          `<g transform="${t}">${P('M49.5 29.5H61.5V36.5H49.5Z', c.wood)}${detail && !c.nier ? `<path d="M52 29.5V36.5M59 29.5V36.5" stroke="${c.line}" stroke-opacity=".35" stroke-width="1.2"/>` : ''}</g>` };
      }
      case 'jester': {
        const b = hy + 2;
        return { back: '', front: P(`M20 ${b}Q16.5 ${b - 7} 10 ${b - 11.5}Q21 ${b - 10.5} 32 ${b - 4}Q43 ${b - 10.5} 54 ${b - 11.5}Q47.5 ${b - 7} 44 ${b}Z`, c.cloth) +
          `<circle cx="10" cy="${R(b - 11.5)}" r="${detail ? 2.3 : 3}" fill="${c.gold}"${edge}/><circle cx="54" cy="${R(b - 11.5)}" r="${detail ? 2.3 : 3}" fill="${c.gold}"${edge}/>` };
      }
      case 'orbit': {
        const cy = g.head.y0 + (g.head.y1 - g.head.y0) * .52, rx = 28, ry = 7.5, sw = detail ? 1.8 : 2.6, col = c.nier ? c.ink : c.gold;
        const t = `rotate(-12 32 ${R(cy)})`;
        return { back: `<ellipse cx="32" cy="${R(cy)}" rx="${rx}" ry="${ry}" transform="${t}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-opacity=".75"/>`,
          front: `<path d="M${32 - rx} ${R(cy)}A${rx} ${ry} 0 0 0 ${32 + rx} ${R(cy)}" transform="${t}" fill="none" stroke="${col}" stroke-width="${sw}"/>` +
            `<circle cx="${32 - rx + 1}" cy="${R(cy + 4.2)}" r="${detail ? 2.6 : 3.4}" fill="${c.nier ? c.ink : c.cloth}"/>` };
      }
      case 'page': {
        const lines = detail ? `<path d="M50.5 32.5H57M50.5 36H57M50.5 39.5H55" stroke="${c.nier ? c.ink : c.line}" stroke-opacity="${c.nier ? 1 : .45}" stroke-width="1.1"/>` : '';
        return { back: '', front: P('M47.5 26H56.5L60.5 30V45H47.5Z', c.paper, ` stroke="${c.nier ? c.ink : c.line}" stroke-width="${c.nier ? lw : lw * .8}" stroke-linejoin="${c.nier ? 'miter' : 'round'}"`) + lines };
      }
      case 'square':
        return { back: '', front: `<path d="M47.5 25V47H62.5Z M51 34V43.5H57.5Z" fill="${c.wood}" fill-rule="evenodd"${edge}/>` };
      case 'pennant':
        return { back: '', front: `<path d="M50 49V20" stroke="${c.ink}" stroke-width="${detail ? 1.8 : 2.6}" stroke-linecap="round"/>` + P('M50.5 20.5L62.5 25L50.5 29.5Z', c.cloth) };
      case 'grill': {
        // Grill Me: Pip peeks over a kettle grill, eyes above the rim
        const sw = detail ? 1.8 : 2.6;
        return { back: '', front: `<path d="M19 59L15 63.5M45 59L49 63.5" stroke="${c.grill}" stroke-width="${sw}" stroke-linecap="round"/>` +
          P('M12 49.5H52Q52 62 32 62Q12 62 12 49.5Z', c.grill, c.nier ? null : '') +
          `<path d="M10 49.5H54" stroke="${c.nier ? c.ink : mix(c.grill, '#ffffff', .35)}" stroke-width="${sw}" stroke-linecap="round"/>` +
          (detail ? `<path d="M22 53.5H42" stroke="${mix(c.grill, '#ffffff', .2)}" stroke-width="1.1" stroke-linecap="round"/>` : '') };
      }
      default: return { back: '', front: '' };
    }
  }

  /* ------------------------------------------------------- the vector mark */
  const lineSvg = (a, b, w, col) => `<line x1="${R(a[0])}" y1="${R(a[1])}" x2="${R(b[0])}" y2="${R(b[1])}" stroke="${col}" stroke-width="${R(w)}" stroke-linecap="butt"/>`;
  // Pip on its own 64 grid, flat (no gradients or ids: the chat strips ids from some copies of a mark), with its
  // head in the seat's colour. `cssHead` lets the seat follow the chat's own --pmx-seat where it is set.
  function vectorPip(o) {
    const L = o.L, th = L.th, fam = L.fam, g = K.GEO[o.detail ? 'full' : 'small'], h = g.head, d = K.headPath(h);
    const shine = has('shine') && (fam === 'friendly' || fam === 'glass');
    const pr = propSvg(o.prop, g, L, o.eye, o.detail);
    const fill = o.cssHead ? ` style="fill:var(--pmx-seat, ${o.head})"` : ` fill="${o.head}"`;
    let head = '';
    if (fam === 'glass' && !o.bust) {
      head += `<path d="${d}"${fill} fill-opacity=".74"/><path d="${d}" fill="#fff" fill-opacity="${L.scheme === 'dark' ? .1 : .2}"/>`;
      if (shine) head += `<ellipse cx="${h.x0 + 10.5}" cy="${h.y0 + 6.5}" rx="7.5" ry="4" fill="#fff" fill-opacity=".55"/>`;
      head += `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${L.scheme === 'dark' ? .7 : .9}" stroke-width="${o.detail ? 1.5 : 2.2}"/>`;
    } else {
      head += `<path d="${d}"${fill}/>`;
      if (shine) head += `<ellipse cx="${h.x0 + 10.5}" cy="${h.y0 + 6.5}" rx="7.5" ry="4.2" fill="#fff" fill-opacity=".26"/>`;
    }
    if (shine && o.detail && th.cheek && o.mood !== 'dots' && o.mood !== 'error') {
      const cy = g.eye.y + 6.2;
      head += `<ellipse cx="${32 - g.eye.dx - 4.2}" cy="${cy}" rx="3.1" ry="1.9" fill="${th.cheek}" opacity=".9"/><ellipse cx="${32 + g.eye.dx + 4.2}" cy="${cy}" rx="3.1" ry="1.9" fill="${th.cheek}" opacity=".9"/>`;
    }
    head += `<g class="pip-face">${K.faceShapes(g, o.mood, o.eye, { cls: CLS, shine: o.detail && th.shine && has('shine') })}</g>`;
    if (o.bust) return pr.back + head + pr.front;
    let strings = '', ctl = '';
    if (has('strings')) {
      const sc = K.solidStr(th);
      strings = K.stringEnds(g, 'thread', (q) => q, (q) => q).map((e) => lineSvg(e.T, e.E, g.strW, sc)).join('');
      ctl = K.controlSvg(g, th, {}, { attach: 'thread' });
    }
    return strings + pr.back + `<g class="pip-hd">${head}</g>` + ctl + pr.front;
  }

  /* --------------------------------------------------------- the NieR mark */
  function nierTheme(L) {
    // NieR's ink and paper as the chat paints them now
    return Object.assign({}, L.th, { ink: cssColor('--text') || L.th.ink, paper: L.th.paper, bg: L.th.bg });
  }
  function nierPip(o) {
    const L = o.L, th = nierTheme(L), g = K.GEO[o.detail ? 'full' : 'small'];
    const r = K.pipNier(g, th, o.mood === 'dots' ? 'think' : o.mood, CLS, { face: 'x' }, { parts: true });
    const pr = propSvg(o.prop, g, Object.assign({}, L, { th }), th.ink, o.detail);
    const head = `<g class="pip-hd">${r.headInner}</g>`;
    if (o.bust) return pr.back + head + pr.front;
    if (!has('strings')) return pr.back + head + pr.front;
    const strings = r.barNodes.map((q, i) => lineSvg(q, r.headNodes[i], o.detail ? 1 : 2.6, th.ink)).join('');
    return strings + pr.back + head + r.ctl + pr.front;
  }

  /* -------------------------------------------------------- the Retro mark */
  // Retro is pixels: the logo kit's 24-cell sprite, redrawn here so it can wear a seat colour, the faces the
  // onboarding added (watch, wonder, oops) and the props, cell by cell. Eyes are holes, as in the kit.
  const PXG = 24;
  function stairSticks(G, x0, x1, ytop, step, thick) {
    const g = Array.from({ length: G }, () => Array(G).fill('.'));
    const n = Math.ceil((x1 - x0 + 1) / step);
    const rowAt = (x) => ytop + (n - 1 - Math.floor((x - x0) / step));
    for (let x = x0; x <= x1; x++) for (let t = 0; t < thick; t++) { const xb = G - 1 - x; if (g[rowAt(x) + t][xb] === '.') g[rowAt(x) + t][xb] = 'b'; }
    for (let x = x0; x <= x1; x++) for (let t = 0; t < thick; t++) g[rowAt(x) + t][x] = 'c';
    return g.map((r) => r.join(''));
  }
  function roundHead(G, x0, x1, y0, y1, r, nubRows) {
    const rows = [];
    for (let y = 0; y < G; y++) {
      let row = '';
      for (let x = 0; x < G; x++) {
        const px = x + .5, py = y + .5;
        let hh = false;
        if (px >= x0 && px <= x1 && py >= y0 && py <= y1) {
          const qx = Math.min(px - x0, x1 - px), qy = Math.min(py - y0, y1 - py);
          hh = !(qx < r && qy < r && Math.hypot(r - qx, r - qy) > r + .15);
        }
        if (nubRows.indexOf(y) >= 0 && (x === Math.floor(x0) - 1 || x === Math.floor(x1))) hh = true;
        row += hh ? 'h' : '.';
      }
      rows.push(row);
    }
    return rows;
  }
  function bresenham(a, b) {
    const pts = []; let [x0, y0] = a; const [x1, y1] = b;
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx + dy;
    for (;;) { pts.push([x0, y0]); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
    return pts;
  }
  const PX = {
    sticks: stairSticks(PXG, 2, 21, 1, 4, 2),
    head: roundHead(PXG, 4, 20, 10.5, 22.5, 4, [16, 17]),
    anchor: [4, 7], eyelet: [7, 9], cheeks: [[6, 18, 2, 1], [16, 18, 2, 1]],
    faces: {
      idle: { eye: [[8, 14, 2, 3]], mouth: [[9, 18, 1, 1], [14, 18, 1, 1], [10, 19, 4, 1]] },
      happy: { eye: [[8, 14, 2, 1], [7, 15, 1, 1], [10, 15, 1, 1]], mouth: [[9, 18, 6, 1], [10, 19, 4, 1]] },
      alert: { eye: [[7, 13, 3, 3]], mouth: [[11, 18, 2, 2]] },
      error: { eye: [[7, 14, 1, 1], [9, 14, 1, 1], [8, 15, 1, 1], [7, 16, 1, 1], [9, 16, 1, 1]], mouth: [[10, 19, 4, 1]] },
      sleep: { eye: [[7, 16, 3, 1]], mouth: [[11, 19, 2, 1]] },
      think: { eye: [[9, 13, 2, 2]], eyeR: [[15, 13, 2, 2]], mouth: [[11, 19, 4, 1]] },
      dots: { mouth: [[7, 16, 2, 2], [11, 16, 2, 2], [15, 16, 2, 2]] },
      // the onboarding's faces, in cells: watch glances up and right under one raised brow, oops worries
      watch: { eye: [[9, 13, 2, 2]], eyeR: [[15, 13, 2, 2]], brow: [[14, 11, 3, 1]], mouth: [[11, 19, 3, 1], [14, 18, 1, 1]] },
      oops: { eye: [[8, 15, 2, 2]], brow: [[7, 13, 2, 1], [15, 13, 2, 1], [9, 12, 1, 1], [14, 12, 1, 1]], mouth: [[9, 19, 1, 1], [10, 18, 1, 1], [11, 19, 1, 1], [12, 18, 1, 1], [13, 19, 1, 1], [14, 18, 1, 1]], drop: [[19, 11, 1, 2]] }
    }
  };
  PX.faces.wonder = PX.faces.alert;
  const PXPROP = {
    crown: { x: 8, y: 6, rows: ['g..gg..g', 'gg.gg.gg', 'gggggggg', 'gggggggg'] },
    hardhat: { x: 6, y: 6, rows: ['....gggg....', '..gggggggg..', '.gggggggggg.', '.gggggggggg.', 'GGGGGGGGGGGG'] },
    gavel: { x: 19, y: 7, rows: ['.wwww', '.wwww', '..w..', '..w..', '..w..', '..w..'] },
    jester: { x: 5, y: 4, rows: ['g............g', 'rr..........rr', '.rr........rr.', '.rrr......rrr.', '..rrrrrrrrrr..', '..rrrrrrrrrr..', '...rrrrrrrr...'] },
    page: { x: 19, y: 9, rows: ['pppp.', 'ppppp', 'plllp', 'ppppp', 'plllp', 'ppppp'] },
    square: { x: 19, y: 7, rows: ['w....', 'ww...', 'w.w..', 'w..w.', 'w...w', 'wwwww'] },
    pennant: { x: 20, y: 3, rows: ['irrr', 'irr.', 'ir..', 'i...', 'i...', 'i...', 'i...', 'i...', 'i...', 'i...'] },
    grill: { x: 2, y: 17, rows: ['iiiiiiiiiiiiiiiiiiii', '.dddddddddddddddddd.', '..dddddddddddddddd..', '...dddddddddddddd...', '.....dddddddddd.....', '....d..........d....', '...d............d...'] }
  };
  function pxPip(o) {
    const L = o.L, th = L.th, dark = L.scheme === 'dark', G = PXG;
    const grid = Array.from({ length: G }, () => Array(G).fill('.'));
    const put = (x, y, ch) => { if (x >= 0 && x < G && y >= 0 && y < G) grid[y][x] = ch; };
    const stamp = (p) => p.rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') put(p.x + i, p.y + j, ch); }));
    const prop = has('props') ? o.prop : null;
    if (!o.bust && has('strings')) {
      PX.sticks.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') put(x, y, ch); }));
      [[PX.anchor, PX.eyelet], [[G - 1 - PX.anchor[0], PX.anchor[1]], [G - 1 - PX.eyelet[0], PX.eyelet[1]]]].forEach(([a, e]) => {
        bresenham(a, e).forEach(([x, y]) => { if (grid[y][x] === '.') put(x, y, 's'); });
      });
    }
    let ring = null;
    if (prop === 'orbit') {
      // a tilted ring in cells: the far half before the head, the near half after it
      ring = { back: [], front: [] };
      for (let i = 0; i < 96; i++) {
        const t = i / 96 * Math.PI * 2, x = Math.round(12 + Math.cos(t) * 11.6 - .5), y = Math.round(16.5 + Math.sin(t) * 3.2 - (Math.cos(t) * 11.6) * .16 - .5);
        (Math.sin(t) < 0 ? ring.back : ring.front).push([x, y]);
      }
      ring.back.forEach(([x, y]) => put(x, y, 'g'));
    }
    PX.head.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'h') put(x, y, 'h'); }));
    const f = PX.faces[o.mood] || PX.faces.idle;
    if (has('shine') && o.mood !== 'dots' && o.mood !== 'error') PX.cheeks.forEach((r) => { for (let x = r[0]; x < r[0] + r[2]; x++) put(x, r[1], 'k'); });
    if (prop === 'lens') {
      // frames first, so the eye holes stay open inside them
      [[7, 10], [13, 16]].forEach(([x0, x1]) => { for (let x = x0; x <= x1; x++) { put(x, 13, 'l'); put(x, 17, 'l'); } for (let y = 13; y <= 17; y++) { put(x0, y, 'l'); put(x1, y, 'l'); } });
      put(11, 14, 'l'); put(12, 14, 'l');
    }
    const hole = (r, mirror) => { const x0 = mirror ? G - r[0] - r[2] : r[0]; for (let y = r[1]; y < r[1] + r[3]; y++) for (let x = x0; x < x0 + r[2]; x++) put(x, y, 'e'); };
    (f.eye || []).forEach((r) => hole(r, false));
    if (f.eyeR) f.eyeR.forEach((r) => hole(r, false)); else (f.eye || []).forEach((r) => hole(r, true));
    (f.brow || []).forEach((r) => hole(r, false));
    (f.mouth || []).forEach((r) => hole(r, false));
    (f.drop || []).forEach((r) => { for (let y = r[1]; y < r[1] + r[3]; y++) put(r[0], y, 'w2'); });
    if (prop && PXPROP[prop]) stamp(PXPROP[prop]);
    if (ring) ring.front.forEach(([x, y]) => put(x, y, 'g'));
    const ctl = solid(th.ctl);
    const col = {
      c: ctl, b: mix(ctl, th.tile.stops[0], .42), s: solid(th.str), h: o.head, k: th.cheek, l: o.eye,
      g: dark ? '#F2D35E' : '#B88A12', G: dark ? '#C9A93A' : '#8E6A0C', r: dark ? '#E9853F' : '#D32F2F', w: dark ? '#D08A3C' : '#9A5A22',
      p: dark ? '#F3F0DC' : '#FFFDF0', i: ctl, d: dark ? '#3A3F33' : '#2B2B2B', w2: dark ? '#DFE6CF' : '#FFFFFF'
    };
    let s = '';
    grid.forEach((row, y) => {
      let x = 0;
      while (x < G) {
        const ch = row[x];
        if (ch === '.' || ch === 'e' || !col[ch]) { x++; continue; }
        let w = 1;
        while (x + w < G && row[x + w] === ch) w++;
        s += `<rect x="${x}" y="${y}" width="${w}" height="1" fill="${col[ch]}"/>`;
        x += w;
      }
    });
    return s;
  }
  function solid(c) { return /^rgba/.test(c) ? (rgb(c) ? '#' + rgb(c).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('') : c) : c; }

  /* ------------------------------------------------------ one mark, 28 grid */
  // The inside of a chat mark: what replaces the puppet in g.pmx-pp. Cached by everything that changes it.
  const MEMO = new Map();
  function markInner(o) {
    const L = o.L || look();
    const head = o.head || (L.fam === 'retro' ? cssColorSolid(o.seat, L) : headFor(L, o.seat || '1'));
    const eye = L.fam === 'nier' ? L.th.ink : eyeFor(head, L.th);
    const mood = o.mood || 'idle';
    const key = [L.id, prefs.parts.join(','), o.prop, mood, o.detail ? 1 : 0, o.bust ? 1 : 0, head, o.cssHead ? 1 : 0].join('|');
    let v = MEMO.get(key);
    if (v) return v;
    const q = { L, head, eye, mood, prop: o.prop, detail: !!o.detail, bust: !!o.bust, cssHead: !!o.cssHead && L.fam !== 'nier' && L.fam !== 'retro' };
    if (L.fam === 'retro') {
      const body = pxPip(q);
      // the 24 cells sit in the 28 grid with two cells of air, or fill it as a bust
      v = q.bust ? `<g class="pip-m pip-px" transform="translate(-3 -9.5) scale(1.42)">${body}</g>` : `<g class="pip-m pip-px" transform="translate(2 2)">${body}</g>`;
    } else {
      const body = L.fam === 'nier' ? nierPip(q) : vectorPip(q);
      // the head alone, filling the mark, at the chat's smallest size (12 px), where strings would be a smudge
      v = q.bust ? `<g class="pip-m" transform="translate(-6.2 -14.6) scale(.63)">${body}</g>` : `<g class="pip-m" transform="scale(.4375)">${body}</g>`;
    }
    if (MEMO.size > 600) MEMO.clear();
    MEMO.set(key, v);
    return v;
  }
  function cssColorSolid(seat, L) { return solid(headFor(L, seat || '1')); }
  // a standalone mark (rows, menus, the settings preview): its own 28-grid svg
  function markSvg(o, size, cls) {
    return `<svg class="${cls || 'pip-mk'}" viewBox="0 0 28 28" width="${size}" height="${size}" aria-hidden="true"${look().fam === 'retro' ? ' shape-rendering="crispEdges"' : ''}>${markInner(o)}</svg>`;
  }

  /* ---------------------------------------------------- decorate a fragment */
  const KEEP_PROP = { you: 1 };
  function pipifyMark(g, L) {
    if (g.getAttribute('data-pip') === '1') return;
    const holder = g.closest('.pmx-mark, .pmx-p-mark');
    const plate = !!(holder && holder.classList.contains('pmx-p-mark'));
    if (!has(plate ? 'cast' : 'marks')) return;
    const prop = g.getAttribute('data-prop') || 'hardhat';
    if (KEEP_PROP[prop]) return;
    const state = (holder && holder.getAttribute('data-state')) || 'idle';
    const size = plate ? 99 : (+(holder && holder.getAttribute('data-size')) || 22);
    const html = markInner({ L, prop, seat: seatOf(holder), mood: has('faces') ? (STATE_MOOD[state] || 'idle') : 'idle', detail: size >= 28, bust: size <= 12, cssHead: has('seats') });
    g.setAttribute('data-pip', '1');
    g.setAttribute('data-fam', 'pip');
    // a blink phase of its own, from what it is (never random: two renders of one mark must compare equal)
    g.setAttribute('style', `--pip-bd:-${(hash(prop + seatOf(holder) + state) % 9000) / 1000}s`);
    SET.call(g, html);
  }
  function roleProp(name) {
    // the chat's own role-to-prop table, asked through its mark (a Reviewer's lens, a Runner's hard hat)
    const S = W.PM56_SHELL, word = String(name || '').trim().split(/\s+/).pop();
    if (!S || !S.pmxMark || !word) return 'hardhat';
    const m = /data-prop="([a-z]+)"/.exec(S.pmxMark({ role: word.toLowerCase(), size: 22 }));
    return m ? m[1] : 'hardhat';
  }
  function decorate(root) {
    if (!root || !root.querySelectorAll || !prefs.parts.length) return;
    const L = look();
    if (has('cast') || has('marks')) root.querySelectorAll('g.pmx-pp:not([data-pip])').forEach((g) => pipifyMark(g, L));
    if (has('hosts')) root.querySelectorAll('.pmx-sheet > .pmx-head').forEach((head) => {
      if (head.querySelector(':scope > .pip-host')) return;
      const sheet = head.parentNode, kind = (sheet && sheet.getAttribute && sheet.getAttribute('data-pmx-kind')) || '';
      if (kind === 'pip') return;
      const host = D.createElement('span');
      host.className = 'pip-host';
      host.setAttribute('data-pm-keep', '');
      host.setAttribute('data-pip-kind', kind);
      host.setAttribute('aria-hidden', 'true');
      // its box rides in the markup, not only in the stylesheet: a closing sheet keeps only its pmx-* classes
      host.setAttribute('style', 'flex:none;width:92px;height:66px;margin:-10px 8px -28px 12px;align-self:flex-start;pointer-events:none;position:relative;display:block');
      const close = head.querySelector(':scope > .pmx-close');
      head.insertBefore(host, close || null);
    });
    if (has('status')) root.querySelectorAll('.pmx-sched-rowglyph, .pmx-mem-rglyph').forEach((gl) => {
      if (gl.querySelector(':scope > .pip-mk')) return;
      const row = gl.closest('[data-state]'), st = (row && row.getAttribute('data-state')) || '';
      gl.setAttribute('data-pip', '1');
      const tone = L.fam === 'nier' ? undefined : solid(cssColor(LIST_TONE[st] || '--muted') || pipHue(L.th));
      SET.call(gl, markSvg({ L, prop: null, head: tone, mood: has('faces') ? (LIST_MOOD[st] || 'idle') : 'idle', detail: true, bust: true }, 22));
    });
    if (has('activity')) root.querySelectorAll('.pmap-agent-row').forEach((row) => {
      if (row.querySelector(':scope > .pip-row')) return;
      const st = row.getAttribute('data-state') || 'idle', id = row.getAttribute('data-id') || '';
      const name = (row.querySelector('.copy strong') || {}).textContent || '';
      const span = D.createElement('span');
      span.className = 'pip-row';
      span.setAttribute('aria-hidden', 'true');
      SET.call(span, markSvg({ L, prop: roleProp(name), seat: String(hash(id) % 6 + 1), mood: has('faces') ? (ROW_MOOD[st] || 'idle') : 'idle', detail: true }, 30));
      row.setAttribute('data-pip', '1');
      row.insertBefore(span, row.firstChild);
    });
    if (has('orbit')) root.querySelectorAll('.orbit-core-icon').forEach((ic) => {
      if (ic.querySelector(':scope > .pip-core')) return;
      const live = ic.classList.contains('is-live');
      const span = D.createElement('span');
      span.className = 'pip-core';
      SET.call(span, markSvg({ L, prop: null, head: L.fam === 'nier' ? undefined : pipHue(L.th), mood: has('faces') ? (live ? 'dots' : 'idle') : 'idle', detail: true }, 40));
      ic.setAttribute('data-pip', '1');
      ic.insertBefore(span, ic.firstChild);
    });
    if (has('plans')) {
      root.querySelectorAll('.qs-head-icon').forEach((ic) => {
        if (ic.querySelector('.pip-mk') || !ic.querySelector('svg[data-nx="plan"]')) return;
        ic.setAttribute('data-pip', '1');
        SET.call(ic, markSvg({ L, prop: 'page', head: L.fam === 'nier' ? undefined : pipHue(L.th), mood: has('faces') ? 'watch' : 'idle', detail: true }, 22));
      });
      root.querySelectorAll('.plan-sched-mark').forEach((ic) => {
        if (ic.querySelector('.pip-mk')) return;
        ic.setAttribute('data-pip', '1');
        SET.call(ic, markSvg({ L, prop: 'hardhat', head: L.fam === 'nier' ? undefined : pipHue(L.th), mood: has('faces') ? 'sleep' : 'idle', detail: true }, 22));
      });
    }
    if (has('empty')) root.querySelectorAll('.pmx-mem-empty, .pmx-sched-empty, .pmx-rv-empty, .pmap-empty, .pmx-empty, .collab-empty, .af-empty').forEach((el) => {
      if (el.querySelector(':scope > .pip-empty')) return;
      const span = D.createElement('span');
      span.className = 'pip-empty';
      span.setAttribute('aria-hidden', 'true');
      SET.call(span, markSvg({ L, prop: null, head: L.fam === 'nier' ? undefined : pipHue(L.th), mood: 'sleep', detail: true }, 30));
      el.insertBefore(span, el.firstChild);
    });
    root.querySelectorAll('.overlay-menu[data-overlay="root-menu"], [data-overlay="root-menu"]').forEach((menu) => decorateWand(menu, L));
  }
  function decorateWand(menu, L) {
    const head = menu.querySelector('.menu-head');
    if (has('menu') && head && !head.querySelector('.pip-wand')) {
      const span = D.createElement('span');
      span.className = 'pip-wand';
      span.setAttribute('aria-hidden', 'true');
      SET.call(span, markSvg({ L, prop: null, head: L.fam === 'nier' ? undefined : pipHue(L.th), mood: has('faces') ? 'watch' : 'idle', detail: false }, 22));
      const wand = head.querySelector('svg');
      head.insertBefore(span, wand || null);
    }
    // the Pip settings row lives in Preferences, beside New chat defaults
    const body = menu.querySelector('.polish-wand-group[data-k="wand-group:preferences"] .polish-group-body');
    if (body && !body.querySelector('[data-action="pip-settings-open"]')) {
      const tpl = D.createElement('template');
      SET.call(tpl, `<button class="menu-item pip-wand-row" data-action="pip-settings-open" title="Where Pip appears in the chat, its faces and how it moves"><span class="menu-icon">${markSvg({ L, prop: null, head: L.fam === 'nier' ? undefined : pipHue(L.th), mood: 'idle', detail: false }, 15)}</span><span class="menu-copy"><strong>Pip…</strong></span></button>`);
      body.appendChild(tpl.content);
    }
  }

  /* The parse hook. innerHTML is where the chat's markup becomes nodes (pmPatch's template, the wand's own
     template, a module's island); decorating there means the chat reconciles Pip against Pip. */
  const DESC = Object.getOwnPropertyDescriptor(W.Element.prototype, 'innerHTML');
  const SET = DESC.set;
  const NEEDLE = /pmx-pp|pmx-head|pmap-agent-row|orbit-core-icon|qs-head-icon|plan-sched-mark|pmx-sched-rowglyph|pmx-mem-rglyph|root-menu|polish-wand-group|-empty/;
  Object.defineProperty(W.Element.prototype, 'innerHTML', {
    configurable: true, enumerable: DESC.enumerable, get: DESC.get,
    set(v) {
      SET.call(this, v);
      if (typeof v === 'string' && v.length > 20 && NEEDLE.test(v)) {
        try { decorate(this.content || this); } catch (e) { console.error('pip-chat decorate', e); }
      }
    }
  });

  /* ---------------------------------------------------- the sheet's host */
  // A Pip by each sheet's close button, on its control bar, holding up the sheet's sign on a third string. It is
  // the one live Pip in a sheet: it blinks, sways, watches what you point at, wonders while you type, cheers when
  // you start, and says oops when a button refuses. Built here (not in decorate) because it is JS-owned.
  const HOSTS = new Set();
  let hostSeq = 0;
  const HV = { w: 98, h: 70, k: .94 };
  function hostLook(st) {
    const L = look();
    if (st.lookId !== L.id || st.partsSig !== prefs.parts.join(',')) { st.lookId = L.id; st.partsSig = prefs.parts.join(','); st.L = L; return true; }
    return false;
  }
  function signArt(st) {
    // the sheet's own mark, as the chat draws it, on a little card
    const S = W.PM56_SHELL;
    const glyph = S && S.pmxKindMark ? S.pmxKindMark(st.kind || 'memory', 24) : '';
    return glyph.replace(/^<svg/, '<svg x="0" y="0"');
  }
  function cardSvg(st) {
    const L = st.L, th = L.th, fam = L.fam, dark = L.scheme === 'dark';
    const x = 64, y = 32, w = 28, hh = 28;
    const fill = fam === 'nier' ? th.paper : fam === 'retro' ? th.tile.stops[0] : fam === 'glass' ? (dark ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.62)') : fam === 'basic' ? th.tile.stops[0] : (dark ? '#2E2A38' : '#FFFFFF');
    const edge = fam === 'nier' ? th.ink : fam === 'retro' ? th.tile.edge : fam === 'glass' ? (dark ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.95)') : fam === 'basic' ? th.line : (dark ? 'rgba(255,255,255,.14)' : '#E4DCEA');
    const rx = fam === 'retro' || fam === 'nier' ? 0 : fam === 'basic' ? 5 : 7;
    const shadow = fam === 'retro' ? `<rect x="${x + 2}" y="${y + 2}" width="${w}" height="${hh}" fill="${th.tile.shadow}"/>` : '';
    const ties = fam === 'nier' ? `<rect x="${x + w / 2 - 1.3}" y="${y - 1.3}" width="2.6" height="2.6" fill="${th.ink}"/>` : '';
    return `${shadow}<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="${rx}" fill="${fill}" stroke="${edge}" stroke-width="${fam === 'nier' ? 1.1 : 1.2}"/>${ties}` +
      `<g class="pip-sign" transform="translate(${x + 3} ${y + 3}) scale(.917)" style="color:${fam === 'nier' ? th.ink : th.text}">${signArt(st)}</g>`;
  }
  function hostFace(st, mood) {
    const L = st.L, th = L.th, g = K.GEO.full;
    if (L.fam === 'nier') return K.pipNier(g, nierTheme(L), mood === 'dots' ? 'think' : mood, CLS, { face: 'x' }, { parts: true }).headInner;
    if (L.fam === 'retro') return pxPip({ L, head: solid(pipHue(th)), eye: th.eye, mood, prop: null, bust: true });
    return K.faceShapes(g, mood, th.eye, { cls: CLS, shine: th.shine && has('shine') });
  }
  function renderHost(st) {
    hostLook(st);
    SET.call(st.el, hostMarkup(st, st.mood, 'piph' + st.n));
    // live state sits on the svg: the chat's reconcile resets the span's own attributes to its markup
    st.svg = st.el.firstElementChild;
    st.face = st.el.querySelector('.pip-face');
  }
  function hostMarkup(st, mood, P) {
    const L = st.L, th = L.th, g = K.GEO.full, fam = L.fam;
    const ids = { face: P + 'f', grad: P + 'h', clip: P + 'c', rim: P + 'r', glow: P + 'g', spec: P + 's', drop: P + 'd' };
    let defs = '', strings = '', pup = '', ctl = '';
    // the sign's string: from the control's right tip down to the card's top
    const tip = K.sticks(g).s1[1];
    const signStr = fam === 'retro' ? '' : `<path d="M${R(tip[0] - 1)} ${R(tip[1] + 1)}L78 32" stroke="${fam === 'nier' ? th.ink : K.solidStr(th)}" stroke-width="${fam === 'nier' ? 1 : 1.3}" fill="none"/>`;
    if (fam === 'retro') {
      // pixel Pip: 24 cells at 2.4 units each, the card in square steps
      const cells = pxPip({ L, head: solid(pipHue(th)), eye: th.eye, mood, prop: null });
      pup = `<g class="pip-pup pip-px" transform="translate(2 2) scale(2.5)" shape-rendering="crispEdges">${cells}</g>`;
      strings = `<path d="M58 9H78V32" stroke="${solid(th.str)}" stroke-width="2.5" fill="none" shape-rendering="crispEdges"/>`;
    } else if (fam === 'nier') {
      const r = K.pipNier(g, nierTheme(L), mood === 'dots' ? 'think' : mood, CLS, ids, { parts: true });
      strings = r.barNodes.map((q, i) => lineSvg(q, r.headNodes[i], 1, nierTheme(L).ink)).join('');
      pup = `<g class="pip-pup"><g class="pip-nface">${r.headInner}</g></g>`;
      ctl = r.ctl;
    } else {
      const sc = K.solidStr(th);
      strings = K.stringEnds(g, 'eye', (q) => q, (q) => q).map((e) => lineSvg(e.T, e.E, g.strW, sc)).join('');
      const hd = K.pipHead(g, th, mood, ids, CLS, {});
      defs = hd.defs;
      pup = `<g class="pip-pup">${K.eyeletRings(g, th, {})}${hd.body}</g>`;
      ctl = K.controlSvg(g, th, {}, { attach: 'eye' });
    }
    const sign = `<g class="pip-card">${signStr}${cardSvg(st)}</g>`;
    if (!has('strings')) { strings = ''; ctl = ''; }
    // every gradient has a plain fallback: a closing sheet loses its ids, and a head must not vanish with them
    const body = `${sign}${strings}${pup}${ctl}`.replace(new RegExp(`fill="url\\(#${P}h\\)"`, 'g'), `fill="url(#${P}h) ${solid(pipHue(th))}"`)
      .replace(/(fill|stroke)="url\(#([^)]+)\)"/g, '$1="url(#$2) none"');
    return `<svg class="pip-host-svg" data-fam="${fam}" data-sway="${moves('sway') ? 1 : 0}" viewBox="0 0 ${HV.w} ${HV.h}" width="${HV.w * HV.k}" height="${HV.h * HV.k}" overflow="visible">` +
      (defs ? `<defs>${defs}</defs>` : '') +
      `<g class="pip-lift"><g class="pip-rig">${body}</g></g></svg>`;
  }
  // Most main buttons close their sheet. When the press takes the sheet away, its Pip does not vanish with it:
  // a copy stays where it hung, cheers, and is lifted out of view on its strings.
  function liftOff(st, rect) {
    if (still() || !rect.width) return;
    const ghost = D.createElement('div');
    ghost.className = 'pip-host pip-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.cssText = `left:${R(rect.left)}px;top:${R(rect.top)}px;width:${R(rect.width)}px;height:${R(rect.height)}px`;
    SET.call(ghost, hostMarkup(st, 'happy', 'pipg' + st.n));
    D.body.appendChild(ghost);
    // on the HTML box, so it runs on the compositor; started on the first frame after the chat's work, or its
    // clock would run out while nothing repaints
    W.requestAnimationFrame(() => W.requestAnimationFrame(() => liftAnim(st, ghost)));
  }
  function liftAnim(st, ghost) {
    const a = ghost.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(2px)', opacity: 1, offset: .12 }, { opacity: 1, offset: .6 }, { transform: 'translateY(-130px)', opacity: 0 }],
      { duration: 950, easing: st.L.fam === 'retro' ? 'steps(10, end)' : 'cubic-bezier(.55, 0, .75, .4)', fill: 'forwards' });
    a.finished.then(() => ghost.remove(), () => ghost.remove());
  }
  // the host's own moves, also on its HTML box (a reconcile resets the box's classes, never its animations)
  function hop(st) {
    if (still()) return;
    st.el.animate([{ transform: 'none' }, { transform: 'translateY(-6px)', offset: .34 }, { transform: 'translateY(1px)', offset: .64 }, { transform: 'none' }],
      { duration: 600, easing: st.L.fam === 'retro' ? 'steps(6, end)' : 'cubic-bezier(.3, 0, .3, 1)' });
  }
  function mountHost(el) {
    if (el.__pip) return;
    const st = { el, n: ++hostSeq, kind: el.getAttribute('data-pip-kind') || '', mood: 'idle', base: 'idle', lookId: '', partsSig: '' };
    el.__pip = st;
    renderHost(st);
    HOSTS.add(st);
    if (moves('sway')) el.animate([{ transform: 'translateY(-22px)' }, { transform: 'none' }], { duration: 640, easing: st.L.fam === 'retro' ? 'steps(5, end)' : 'cubic-bezier(.3, 1.45, .5, 1)' });
    scheduleBlink(st);
  }
  function unmountGone() {
    HOSTS.forEach((st) => {
      // the chat closes a sheet by moving that same node to <body> as a fading copy (.pmx-ghost)
      const leaving = st.el.isConnected && st.el.closest('.pmx-ghost');
      if (st.el.isConnected && !leaving) return;
      if (leaving && st.cheerAt && Date.now() - st.cheerAt < 4000 && !still()) {
        const rect = st.el.getBoundingClientRect();
        st.el.style.visibility = 'hidden';
        liftOff(st, rect);
      }
      clearTimeout(st.blinkT); clearTimeout(st.holdT); clearTimeout(st.swapT); HOSTS.delete(st);
    });
  }
  const VOICE_EVENT = { happy: 'happy', wonder: 'alert', watch: 'tap', oops: 'warn', cheer: 'cheer' };
  function voice(mood) {
    if (!has('voice')) return;
    const S = W.PipSound; if (!S || !S.play) return;
    try { S.setTheme(look().id); S.play(VOICE_EVENT[mood] || 'tap', {}); } catch (e) { /* sound is optional */ }
  }
  function setFace(st, mood, instant) {
    if (!st.el.isConnected || mood === st.mood) return;
    st.mood = mood;
    const fam = st.L.fam;
    voice(mood);
    if (fam === 'retro' || fam === 'nier' || !st.face) {
      // pixels and ink change in one step, the way those themes change everything
      renderHost(st);
      if (fam === 'nier' && !still()) { st.svg.classList.remove('pip-flick'); void st.el.offsetWidth; st.svg.classList.add('pip-flick'); }
      return;
    }
    const swap = () => { if (st.face) SET.call(st.face, hostFace(st, mood)); applyGaze(st); };
    if (!moves('swap') || instant) { clearTimeout(st.swapT); st.face.classList.remove('pip-closing', 'pip-opening'); swap(); return; }
    // the onboarding's face change: the old face closes on the eye line, the new one opens
    clearTimeout(st.swapT);
    st.face.classList.remove('pip-opening');
    st.face.classList.add('pip-closing');
    st.swapT = setTimeout(() => {
      swap();
      if (!st.face) return;
      st.face.classList.remove('pip-closing');
      void st.face.getBoundingClientRect();
      st.face.classList.add('pip-opening');
      st.swapT = setTimeout(() => st.face && st.face.classList.remove('pip-opening'), 200);
    }, 95);
  }
  function feel(st, mood, hold, instant) {
    clearTimeout(st.holdT);
    setFace(st, mood, instant);
    if (hold) st.holdT = setTimeout(() => setFace(st, st.base), hold);
  }
  function scheduleBlink(st) {
    clearTimeout(st.blinkT);
    st.blinkT = setTimeout(() => {
      if (!st.el.isConnected) return;
      if (moves('blink') && st.face && ['idle', 'watch', 'wonder', 'oops'].indexOf(st.mood) >= 0 && !st.face.classList.contains('pip-closing')) {
        st.face.classList.add('pip-blinking');
        setTimeout(() => st.face && st.face.classList.remove('pip-blinking'), 170);
      }
      scheduleBlink(st);
    }, 3200 + Math.random() * 3800);
  }
  // gaze: the eyes lean toward the last place the pointer was, and stay there
  let lastPt = null;
  function applyGaze(st) {
    if (!st.face || !lastPt || !has('gaze') || ['dots', 'sleep', 'happy'].indexOf(st.mood) >= 0) { if (st.face) st.face.style.transform = ''; return; }
    const r = st.el.getBoundingClientRect(); if (!r.width) return;
    const cx = r.left + r.width * .33, cy = r.top + r.height * .64;
    const dx = lastPt[0] - cx, dy = lastPt[1] - cy, l = Math.hypot(dx, dy) || 1, k = Math.min(1, l / 160);
    st.face.style.transform = `translate(${R(dx / l * 2.4 * k)}px, ${R(dy / l * 1.7 * k)}px)`;
  }
  const hostOf = (el) => { const s = el && el.closest && el.closest('.pmx-sheet'); const h = s && s.querySelector('.pip-host'); return h && h.__pip; };
  const CONTROL = 'button, [role="switch"], [role="radio"], [role="tab"], select, a[href], label, .pmx-roster-row, .pmx-p-seat, summary';
  let dwellT = 0, dwellEl = null;
  D.addEventListener('pointerover', (e) => {
    const st = hostOf(e.target); if (!st || !has('watch')) return;
    const c = e.target.closest(CONTROL);
    if (!c || c === dwellEl || c.closest('.pip-host') || c.classList.contains('pmx-close')) return;
    dwellEl = c; clearTimeout(dwellT);
    dwellT = setTimeout(() => { if (dwellEl === c && st.mood !== 'happy' && st.mood !== 'oops' && !st.typing) feel(st, 'watch'); }, 420);
  }, true);
  D.addEventListener('pointerout', (e) => {
    const st = hostOf(e.target); if (!st) return;
    const c = e.target.closest(CONTROL);
    if (c && c === dwellEl && !(e.relatedTarget && c.contains(e.relatedTarget))) {
      dwellEl = null; clearTimeout(dwellT);
      if (st.mood === 'watch') setTimeout(() => { if (!dwellEl && st.mood === 'watch') setFace(st, st.base); }, 220);
    }
  }, true);
  D.addEventListener('pointermove', (e) => {
    lastPt = [e.clientX, e.clientY];
    if (!HOSTS.size || !has('gaze')) return;
    if (!pmQueued) { pmQueued = true; W.requestAnimationFrame(() => { pmQueued = false; HOSTS.forEach(applyGaze); }); }
  }, { passive: true });
  let pmQueued = false;
  D.addEventListener('input', (e) => {
    const st = hostOf(e.target); if (!st || !has('wonder')) return;
    if (!/^(TEXTAREA|INPUT)$/.test(e.target.tagName)) return;
    st.typing = true; clearTimeout(st.typeT);
    if (st.mood !== 'wonder') feel(st, 'wonder');
    st.typeT = setTimeout(() => { st.typing = false; if (st.mood === 'wonder') setFace(st, st.base); }, 1500);
  }, true);
  let replaying = false;
  D.addEventListener('click', (e) => {
    if (replaying) return;
    const st = hostOf(e.target); if (!st) return;
    const b = e.target.closest('.pmx-primary, .pmx-foot .primary-button');
    if (!b) return;
    const refused = b.disabled || b.getAttribute('aria-disabled') === 'true' || b.hasAttribute('data-pm-hover-was-disabled');
    if (refused) { if (has('oops')) feel(st, 'oops', 1900); return; }
    if (!has('cheer')) return;
    st.cheerAt = Date.now();
    // Starting something keeps the chat busy for most of a second, and nothing repaints until it is done. So the
    // cheer goes first: straight to happy (no blink to hang half shut), the hop handed to the compositor, and the
    // press itself replayed two frames (about 30 ms) later, once both are on screen.
    feel(st, 'happy', 2600, true);
    hop(st);
    e.stopImmediatePropagation();
    e.preventDefault();
    W.requestAnimationFrame(() => W.requestAnimationFrame(() => { replaying = true; try { b.click(); } finally { replaying = false; } }));
  }, true);
  // a disabled primary lets the press fall through to its footer, so the press is found by where it landed
  D.addEventListener('pointerdown', (e) => {
    const st = hostOf(e.target); if (!st || !has('oops')) return;
    const sheet = e.target.closest('.pmx-sheet');
    const b = [...sheet.querySelectorAll('.pmx-primary')].find((x) => { const r = x.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; });
    if (b && (b.disabled || b.getAttribute('aria-disabled') === 'true')) { st.typing = false; feel(st, 'oops', 1900); }
  }, true);

  /* ------------------------------------------------------------- settings UI */
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const CAST = [
    { prop: 'crown', seat: 'lead', state: 'idle', name: 'Coordinator' },
    { prop: 'hardhat', seat: '1', state: 'working', name: 'Builder' },
    { prop: 'hardhat', seat: '2', state: 'queued', name: 'Builder' },
    { prop: 'lens', seat: '3', state: 'needs', name: 'Checker' },
    { prop: 'jester', seat: '4', state: 'done', name: 'Critic' }
  ];
  const PLAY = [['queued', 'queued', 'queued', 'queued'], ['working', 'queued', 'working', 'queued'], ['working', 'working', 'done', 'queued'], ['done', 'working', 'done', 'needs'], ['done', 'done', 'done', 'done']];
  let playStep = -1, playT = 0;
  function previewCast() {
    const L = look();
    return CAST.map((c, i) => {
      const state = playStep >= 0 && i > 0 ? PLAY[playStep][i - 1] : c.state;
      const mood = has('faces') ? (STATE_MOOD[state] || 'idle') : 'idle';
      const inner = has('marks') || has('cast') ? markInner({ L, prop: c.prop, seat: c.seat, mood, detail: true }) : '';
      const seatVar = c.seat === 'lead' ? 'var(--pmx-seat-lead)' : `var(--pmx-seat-${c.seat})`;
      return `<figure class="pipc-seat" data-state="${state}"><span class="pmx-mark pipc-mk" data-state="${state}" data-size="36" style="--pmx-seat:${seatVar}">` +
        `<svg viewBox="0 0 28 28"${L.fam === 'retro' ? ' shape-rendering="crispEdges"' : ''}>${inner || '<text x="14" y="17" text-anchor="middle" font-size="7" fill="currentColor">puppet</text>'}</svg></span>` +
        `<figcaption>${esc(c.name)}<small>${esc({ idle: 'leads', working: 'working', queued: 'waits its turn', needs: 'needs you', done: 'done' }[state])}</small></figcaption></figure>`;
    }).join('');
  }
  function editor(where) {
    const n = prefs.parts.length, all = KEYS.length;
    let pre = '';
    PRESETS.forEach((p) => { if (!pre && p.keys().slice().sort().join(' ') === prefs.parts.slice().sort().join(' ')) pre = p.id; });
    const chip = (p) => {
      const on = has(p.key);
      return `<button type="button" class="pipc-chip" role="switch" aria-checked="${on}" data-action="pip-part" data-key="${p.key}" aria-label="${esc(p.label)}">` +
        `<span class="pipc-chip-name">${esc(p.label)}</span><span class="pipc-chip-help">${esc(p.help)}</span>` +
        `<span class="pipc-chip-foot"><span>Size ${p.size}</span><span class="pipc-chip-state">${on ? 'On' : 'Off'}</span></span></button>`;
    };
    const groups = GROUPS.map((gname) => {
      const ps = PARTS.filter((p) => p.group === gname);
      const note = gname === 'Motion' && still() ? '<p class="pipc-note">Reduce motion is on, so these stay still. Your choices are kept for when it is off.</p>' : '';
      return `<section class="pipc-group"><header class="pipc-ghead"><h4>${esc(gname)}</h4><span>${ps.filter((p) => has(p.key)).length} / ${ps.length}</span></header>${note}<div class="pipc-chips">${ps.map(chip).join('')}</div></section>`;
    }).join('');
    return `<div class="pipc" data-where="${where}" data-k="pipc:${where}">` +
      `<div class="pipc-top"><div class="pipc-stage" data-k="pipc-stage:${where}" data-pm-keep>${previewCast()}</div>` +
      `<div class="pipc-side"><div class="pipc-meter"><div class="pipc-meter-head"><span>Pip parts</span><b>On ${n} / ${all}</b></div><div class="pipc-meter-cells">` +
      KEYS.map((k, i) => `<i${i < n ? ' class="on"' : ''}></i>`).join('') + '</div></div>' +
      `<div class="pipc-presets" role="group" aria-label="Presets">${PRESETS.map((p) => `<button type="button" class="pipc-preset" aria-pressed="${p.id === pre}" data-action="pip-preset" data-value="${p.id}"><span>${esc(p.label)}</span><small>${esc(p.help)}</small></button>`).join('')}</div>` +
      `<button type="button" class="soft-button pipc-play" data-action="pip-play"${has('cast') || has('marks') ? '' : ' aria-disabled="true"'}>Play: the team works</button></div></div>` +
      groups + '</div>';
  }
  function sheet(ctx) {
    const S = W.PM56_SHELL; if (!S || !S.pmxSheet) return '';
    const foot = S.pmxFoot ? S.pmxFoot({ readback: '<span>Changes apply as you pick them. Nothing here changes what the chat does.</span>', cancel: false, primary: { action: 'close-dialog', label: 'Done' } })
      : '<footer class="mdl-foot pmx-foot"><div class="pmx-foot-say">Changes apply as you pick them.</div><button type="button" class="primary-button pmx-primary" data-action="close-dialog">Done</button></footer>';
    return S.pmxSheet({ type: 'pip-settings', kind: 'pip', size: 'standard', cls: 'pip-sheet', title: 'Pip', titleText: 'Pip',
      lead: 'Where Pip appears in the chat, the faces it makes and how it moves. Like NieR Mode’s parts, each one goes on or off.',
      markHtml: markSvg({ prop: null, head: look().fam === 'nier' ? undefined : pipHue(look().th), mood: 'happy', detail: true }, 26), body: editor('sheet'), foot });
  }
  function studio() {
    return `<section class="demo-section pipc-studio" style="margin-bottom:8px"><h3>Pip · Parts</h3><div class="demo-section-body" style="display:block">${editor('studio')}</div></section>`;
  }

  /* ------------------------------------------------------------- re-render */
  function flags() {
    const h = D.documentElement;
    h.setAttribute('data-pip-blink', moves('blink') ? '1' : '0');
    h.setAttribute('data-pip-dots', moves('dots') ? '1' : '0');
  }
  function rerender() {
    MEMO.clear();
    flags();
    const E = W.PM56_EXT, c = E && E.ctx ? E.ctx() : null;
    if (c && c.renderApp) c.renderApp();
    if (c && c.renderOverlays) c.renderOverlays();
    HOSTS.forEach((st) => { renderHost(st); applyGaze(st); });
    refreshStage();
  }
  function refreshStage() { D.querySelectorAll('.pipc-stage').forEach((el) => SET.call(el, previewCast())); }
  function setParts(keys) { prefs.parts = KEYS.filter((k) => keys.indexOf(k) >= 0); save(); rerender(); }
  function play() {
    clearTimeout(playT); playStep = 0; refreshStage();
    const next = () => { playStep++; if (playStep >= PLAY.length) { playT = setTimeout(() => { playStep = -1; refreshStage(); }, 1600); return; } refreshStage(); playT = setTimeout(next, 1100); };
    playT = setTimeout(next, 1100);
  }

  /* ---------------------------------------------------------- the chat's hooks */
  const EXT = W.PM56_EXT;
  if (EXT && EXT.slot) {
    EXT.slot('dialog', (ctx) => (ctx.state.dialog && ctx.state.dialog.type === 'pip-settings' ? sheet(ctx) : ''));
    EXT.action('pip-settings-open', (ctx) => { if (ctx.closeMenu) ctx.closeMenu(); ctx.openDialog({ type: 'pip-settings' }); return true; });
    EXT.action('pip-part', (ctx, btn) => { const k = btn && btn.dataset.key; if (KEYS.indexOf(k) < 0) return true; const want = prefs.parts.slice(), i = want.indexOf(k); if (i >= 0) want.splice(i, 1); else want.push(k); setParts(want); return true; });
    EXT.action('pip-preset', (ctx, btn) => { const p = PRESETS.filter((x) => x.id === (btn && btn.dataset.value))[0]; if (p) setParts(p.keys()); return true; });
    EXT.action('pip-play', (ctx, btn) => { if (btn && btn.getAttribute('aria-disabled') !== 'true') play(); return true; });
  }
  const prevStudio = W.PM56_NIER_STUDIO;
  W.PM56_NIER_STUDIO = function (c) { let a = ''; try { a = prevStudio ? prevStudio(c) : ''; } catch (e) { a = ''; } return a + studio(); };

  // mount hosts as they arrive; drop the ones whose sheet closed
  const mo = new W.MutationObserver(() => {
    D.querySelectorAll('.pip-host:not(.pip-ghost)').forEach((el) => { if (!el.__pip && !el.closest('.pmx-ghost')) mountHost(el); });
    unmountGone();
  });
  mo.observe(D.body, { childList: true, subtree: true });
  // a theme switch re-renders the chat (decorate redraws the marks); hosts redraw themselves
  new W.MutationObserver(() => { MEMO.clear(); HOSTS.forEach((st) => { if (hostLook(st)) { renderHost(st); applyGaze(st); } }); })
    .observe(D.body, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  new W.MutationObserver(() => { MEMO.clear(); flags(); }).observe(D.documentElement, { attributes: true, attributeFilter: ['data-o55-nier', 'data-motion'] });

  W.PIP_CHAT = Object.freeze({
    PARTS, PRESETS, version: '0.1',
    parts: () => prefs.parts.slice(), has, setParts,
    preset: (id) => { const p = PRESETS.filter((x) => x.id === id)[0]; if (p) setParts(p.keys()); },
    open: () => { const c = W.PM56_EXT && W.PM56_EXT.ctx ? W.PM56_EXT.ctx() : null; if (c) { if (c.closeMenu) c.closeMenu(); c.openDialog({ type: 'pip-settings' }); } },
    markSvg, markInner, decorate, rerender, hosts: () => [...HOSTS].map((s) => ({ kind: s.kind, mood: s.mood })),
    feel: (mood, hold) => HOSTS.forEach((st) => feel(st, mood, hold))
  });
  // the chat was drawn before this file arrived: decorate what is there, then let it re-render through the hook
  const boot = () => { decorate(D.body); rerender(); };
  if (W.PM56_DEMO && D.body && D.body.getAttribute('data-theme')) boot(); else W.addEventListener('load', boot, { once: true });
})(window);
