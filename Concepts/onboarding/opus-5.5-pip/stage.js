/* Pip's stage (Opus 5.5 concept): the scene beside every onboarding screen.
   Pip hangs from the control, which stands for the person setting up. It is a real pendulum: when
   the hand moves, Pip swings and settles, and its strings are solved every frame from the screw
   eyes on the bar to the eyes on its head (the same solver as the logo). Every prop is lowered in
   on its own string and swings too. Hovering a choice previews its prop; choosing it drops it in
   and Pip reacts. Retro draws the same scene as true pixel art (rendered small and snapped to
   Retro's palette at 8 frames a second); NieR keeps still and speaks in its HUD. */
(function (G) {
  'use strict';
  const L = G.PMLogo, K = L.kit, TH = L.THEMES, PW = G.PipWorlds;
  const NS = 'http://www.w3.org/2000/svg';
  const R = (v) => +(+v).toFixed(2);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const now = () => performance.now() / 1000;

  /* ------------------------------------------------------------- layouts */
  // portrait: the left pane of the window. banner: the strip above the content on narrow windows.
  const LAYOUTS = {
    portrait: {
      w: 400, h: 560, ground: 492, s: 2.6, ctl: [146, 112], rope: 184, propScale: 1.18, anchorY: -60,
      slots: {
        side: [306, 372], pairA: [284, 318], pairB: [360, 426], hi: [306, 262],
        o1: [262, 300], o2: [340, 322], o3: [262, 398], o4: [340, 420],
        m1: [250, 132], m2: [312, 162], m3: [374, 132], m4: [300, 318], m5: [52, 352],
        c1: [254, 378], c2: [316, 400], c3: [378, 378]
      },
      stack: [300, 466, 44], crewScale: 1, charmScale: .5
    },
    banner: {
      w: 720, h: 240, ground: 234, s: 1.42, ctl: [150, 30], rope: 76, propScale: .74, anchorY: -40,
      slots: {
        side: [420, 132], pairA: [396, 112], pairB: [480, 152], hi: [420, 92],
        o1: [330, 96], o2: [390, 118], o3: [450, 96], o4: [510, 118],
        m1: [330, 64], m2: [380, 80], m3: [430, 64], m4: [410, 78], m5: [480, 108],
        c1: [470, 150], c2: [526, 164], c3: [582, 150]
      },
      stack: [430, 222, 32.5], crewScale: .55, charmScale: .32
    },
    // squeezed windows: a short strip, Pip on the left and one prop beside it
    compact: {
      w: 420, h: 200, ground: 196, s: 1.2, ctl: [84, 26], rope: 62, propScale: .64, anchorY: -40,
      slots: {
        side: [292, 112], pairA: [268, 96], pairB: [340, 130], hi: [300, 70],
        o1: [218, 86], o2: [270, 104], o3: [322, 86], o4: [374, 104],
        m1: [230, 56], m2: [290, 72], m3: [350, 56], m4: [300, 90], m5: [380, 90],
        c1: [262, 124], c2: [318, 138], c3: [374, 124]
      },
      stack: [300, 186, 28], crewScale: .5, charmScale: .3
    }
  };

  // how each family moves (PMConcept7's own motion personalities)
  const FAM = {
    friendly: { w: 3.9, damp: .9, sway: 5, swayW: .9, k: 120, c: 12, pk: 130, pc: 11, pw: 3.6, pdamp: 1.1, kick: .45 },
    glass: { w: 2.8, damp: .55, sway: 4, swayW: .55, k: 40, c: 10, pk: 42, pc: 10, pw: 2.6, pdamp: .7, kick: .32 },
    basic: { w: 3.6, damp: 2.4, sway: 1.6, swayW: .6, k: 170, c: 26, pk: 170, pc: 25, pw: 3.6, pdamp: 3, kick: .16 },
    retro: { w: 4.2, damp: 1.4, sway: 5, swayW: 1, k: 190, c: 20, pk: 190, pc: 20, pw: 4, pdamp: 1.6, kick: .4, fps: 8 },
    nier: { w: 3, damp: 9, sway: 0, swayW: 0, k: 260, c: 34, pk: 260, pc: 34, pw: 3, pdamp: 9, kick: 0, still: true }
  };

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const rot = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };

  /* --------------------------------------------------------------- stage */
  let seq = 0;
  class Stage {
    constructor(root, opts) {
      this.root = root;
      this.id = 'pst' + (++seq);
      this.theme = (opts && opts.theme) || 'friendly-dark';
      this.layoutName = (opts && opts.layout) || 'portrait';
      this.reduced = !!(opts && opts.reduced);
      this.props = new Map();
      this.fx = [];
      this.spec = { props: [], pip: {} };
      this.moodOverride = null; this.moodUntil = 0;
      this.score = 0;
      this.t = 0; this.last = now();
      this.build();
      this.loop = this.loop.bind(this);
      this.raf = requestAnimationFrame(this.loop);
      this.ro = new ResizeObserver(() => this.measure());
      this.ro.observe(root);
    }

    /* ------------------------------------------------------- building */
    build() {
      const root = this.root, th = TH[this.theme], w = PW.WORLDS[this.theme], Lay = LAYOUTS[this.layoutName];
      this.th = th; this.w = w; this.L = Lay; this.fam = FAM[w.fam]; this.famName = w.fam;
      root.innerHTML = '';
      root.classList.add('pst');
      root.dataset.fam = w.fam; root.dataset.scheme = w.scheme; root.dataset.layout = this.layoutName;
      root.dataset.reduced = this.reduced ? '1' : '0';
      root.style.setProperty('--st-tint', (w.chapter && w.chapter[this.chapter || 'welcome']) || w.ink);
      this.wall = document.createElement('div'); this.wall.className = 'pst-wall'; root.appendChild(this.wall);
      // Glass stands on PMConcept7's own Ribbons wallpaper (kept with the logo; a standalone build inlines it)
      if (w.fam === 'glass') root.style.setProperty('--wall', `url(${(G.PIP_WALLS && G.PIP_WALLS[w.scheme]) || `../../Icon-Concepts/Opus5.5icon/wall-ribbons-${w.scheme}.webp`})`);
      if (w.fam === 'glass') this.wall.innerHTML = '<i class="pst-caustic c1"></i><i class="pst-caustic c2"></i><i class="pst-caustic c3"></i>';
      const svg = this.svg = el('svg', { class: 'pst-svg', viewBox: `0 0 ${Lay.w} ${Lay.h}`, preserveAspectRatio: w.fam === 'retro' ? 'xMidYMid slice' : 'xMidYMid meet', 'aria-hidden': 'true' }, root);
      svg.setAttribute('xmlns', NS);
      this.defs = el('defs', null, svg);
      const bd = PW.backdrop(w, this.id + 'w', Lay);
      this.pen = PW.pen(w, this.id + 'p'); this.pen.theme = this.theme;
      this.backDefs = bd.defs;
      this.gBack = el('g', { class: 'pst-back' }, svg); this.gBack.innerHTML = bd.back;
      if (w.fam === 'glass') {
        // a faint mirror image in the glass floor, of everything that hangs
        const m = this.id + 'rm';
        this.backDefs += `<linearGradient id="${m}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="${m}" maskUnits="userSpaceOnUse" x="-2000" y="${Lay.ground}" width="4000" height="${Lay.h}"><rect x="-2000" y="${Lay.ground}" width="4000" height="${Lay.h}" fill="url(#${m}g)"/></mask>`;
        this.gReflect = el('g', { class: 'pst-reflect', mask: `url(#${m})`, opacity: w.scheme === 'dark' ? '.55' : '.4' }, svg);
        el('use', { href: `#${this.id}act`, transform: `translate(0 ${2 * Lay.ground}) scale(1 -1)` }, this.gReflect);
      }
      this.gShadow = el('g', { class: 'pst-shadows' }, svg);
      this.gActors = el('g', { id: `${this.id}act` }, svg);
      this.gPropStr = el('g', { class: 'pst-pstr' }, this.gActors);
      this.gProps = el('g', { class: 'pst-props' }, this.gActors);
      this.gPip = el('g', { class: 'pst-pip' }, this.gActors);
      this.gFx = el('g', { class: 'pst-fx' }, svg);
      this.gHud = el('g', { class: 'pst-hud' }, svg);
      if (w.fam === 'retro') {
        this.canvas = document.createElement('canvas'); this.canvas.className = 'pst-px'; root.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.img = new Image(); this.pxBusy = false; this.pxLast = 0; this.pxCache = new Map();
        this.palette = w.palette.map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
      }
      this.overlay = document.createElement('div'); this.overlay.className = 'pst-overlay'; root.appendChild(this.overlay);
      this.bubble = document.createElement('div'); this.bubble.className = 'pst-bubble'; this.bubble.setAttribute('role', 'status'); this.overlay.appendChild(this.bubble);
      this.hudHtml();
      this.buildPip();
      // re-create the props that were on stage, in the new material
      const keep = [...this.props.values()];
      this.props.clear();
      keep.forEach((p) => { if (p.labelEl) p.labelEl.remove(); if (p.state !== 'out') this.addProp(p.spec, true); });
      this.syncDefs();
      this.measure();
    }
    syncDefs() { this.defs.innerHTML = this.backDefs + this.pen.defs(); }

    hudHtml() {
      const f = this.famName;
      let h = '';
      if (f === 'retro') h = `<div class="pst-hud-top"><span class="pst-1up">1UP <b class="pst-score">${String(this.score).padStart(6, '0')}</b></span><span class="pst-stage">STAGE <b class="pst-stagen">1-1</b></span></div><div class="pst-press">PRESS ▶ TO START</div>`;
      if (f === 'nier') h = `<div class="pst-nhud"><div class="pst-ntop"><span>PIP // UNIT P-01</span><span class="pst-decode" aria-hidden="true"></span></div><div class="pst-nlab"><span class="pst-nlab-k">■ <b class="pst-target">STANDBY</b></span><span>MAP 1:1</span></div><i class="pst-nb tl"></i><i class="pst-nb tr"></i><i class="pst-nb bl"></i><i class="pst-nb br"></i></div>`;
      const wrap = document.createElement('div'); wrap.className = 'pst-hudhtml'; wrap.innerHTML = h;
      this.overlay.appendChild(wrap);
      this.hudEl = wrap;
    }

    /* -------------------------------------------------------------- Pip */
    buildPip(themeOverride) {
      const Lay = this.L, g = K.GEO.full, theme = themeOverride || this.theme, th = TH[theme], nier = !!th.nier;
      this.pipTheme = theme;
      const s = Lay.s;
      if (!this.ps) {
        this.ps = { C: { x: Lay.ctl[0], y: Lay.ctl[1], vx: 0, vy: 0 }, Ct: { x: Lay.ctl[0], y: Lay.ctl[1] }, th: 0, thv: 0, dy: 0, dyv: 0, tilt: 0, tiltv: 0, tiltT: 0, phi: 0, phiv: 0,
          sx: 1, sy: 1, sv: 0, look: [0, 0], lookT: [0, 0], blink: 1, nextBlink: 2, asleep: false };
      }
      this.gPip.innerHTML = '';
      this.pstrs = [0, 1].map(() => el('path', { class: 'pst-str', fill: 'none', 'stroke-linecap': 'round' }, this.gPip));
      this.pglow = [0, 1].map(() => el('path', { class: 'pst-power', fill: 'none', 'stroke-linecap': 'round' }, this.gPip));
      this.gHead = el('g', { class: 'pst-head' }, this.gPip);
      this.gCtl = el('g', { class: 'pst-ctl' }, this.gPip);
      const strW = this.famName === 'retro' ? 4.2 : this.famName === 'nier' ? 1.4 : 2.2;
      this.pstrs.forEach((p) => { p.setAttribute('stroke', th.str); p.setAttribute('stroke-width', strW); });
      this.pglow.forEach((p) => { p.setAttribute('stroke-width', strW + 1.6); });
      if (nier) {
        const parts = K.pipNier(g, th, 'idle', { face: 'pf' }, { face: this.id + 'nf' }, { parts: true });
        this.gCtl.innerHTML = parts.ctl;
        this.barPts = parts.barNodes; this.headPts = parts.headNodes; this.ringR = 0;
      } else {
        this.gCtl.innerHTML = K.controlSvg(g, th, {}, { attach: 'eye' });
        const ba = K.barAttach(g);
        this.barPts = ba.map((b) => [b.a[0] + b.n[0] * (g.w / 2 + g.ring * .45), b.a[1] + b.n[1] * (g.w / 2 + g.ring * .45)]);
        this.headPts = K.eyelets(g).map((e) => e.ring); this.ringR = g.ring;
      }
      this.renderHead(this.curMood || 'idle', true);
      // the rest distance of each string, for slack when Pip lies down
      const rest = this.solveStrings({ C: { x: Lay.ctl[0], y: Lay.ctl[1] }, phi: 0, H: this.headAt(Lay.ctl[0], Lay.ctl[1], 0, 0), ang: 0, sx: 1, sy: 1 });
      this.restLen = rest.map((r) => Math.hypot(r.E[0] - r.T[0], r.E[1] - r.T[1]));
    }
    renderHead(mood, force) {
      if (!force && mood === this.curMood) return;
      this.curMood = mood;
      const g = K.GEO.full, th = TH[this.pipTheme];
      const p = this.id + 'h' + (++this.hseq || (this.hseq = 1));
      if (th.nier) {
        const parts = K.pipNier(g, th, mood === 'dots' ? 'think' : mood, { face: 'pf', dot: 'pst-dot' }, { face: p + 'f' }, { parts: true });
        this.gHead.innerHTML = parts.headInner;
      } else {
        const hd = K.pipHead(g, th, mood, { face: p + 'f', grad: p + 'g', clip: p + 'c', rim: p + 'r', glow: p + 'w', spec: p + 's', drop: p + 'd' }, { face: 'pf', eyes: 'pe', blink: 'pb', dot: 'pst-dot' }, {});
        this.gHead.innerHTML = (hd.defs ? `<defs>${hd.defs}</defs>` : '') + K.eyeletRings(g, th, {}) + hd.body;
      }
      this.eyesEl = this.gHead.querySelector('.pe') || this.gHead.querySelector('.pf');
      this.blinkEl = this.gHead.querySelector('.pb');
    }
    // where Pip's head hangs for a pose: anchor at the top centre of the head
    headAt(cx, cy, th, dy) { return [cx + Math.sin(th) * this.L.rope, cy + Math.cos(th) * this.L.rope + dy]; }
    ctlXf(q, C, phi) { const s = this.L.s, v = rot([(q[0] - 32) * s, (q[1] - 14.5) * s], phi); return [C.x + v[0], C.y + v[1]]; }
    headXf(q, H, ang, sx, sy) {
      const s = this.L.s, bx = 32, by = 59.5, q2 = [bx + (q[0] - bx) * sx, by + (q[1] - by) * sy];
      const v = rot([(q2[0] - 32) * s, (q2[1] - 31.5) * s], ang); return [H[0] + v[0], H[1] + v[1]];
    }
    solveStrings(P) {
      const r = this.ringR * this.L.s;
      return [0, 1].map((i) => {
        const C = this.ctlXf(this.barPts[i], P.C, P.phi), Hh = this.headXf(this.headPts[i], P.H, P.ang, P.sx, P.sy);
        if (!r) return { T: C, E: Hh };
        const vx = Hh[0] - C[0], vy = Hh[1] - C[1], l = Math.hypot(vx, vy) || 1;
        return { T: [C[0] + vx / l * r, C[1] + vy / l * r], E: [Hh[0] - vx / l * r, Hh[1] - vy / l * r] };
      });
    }

    /* ----------------------------------------------------------- props */
    addProp(spec, instant) {
      const Lay = this.L, P = PW.PROPS[spec.kind];
      if (!P) return null;
      const g = el('g', { class: 'pst-prop', 'data-kind': spec.kind }, this.gProps);
      const pr = { spec, el: g, strs: [], state: 'in', a: 0, av: 0, len: 0, lenv: 0, ax: 0, axv: 0, scale: spec.scale || 1, sv: 0, op: 0, born: this.t, key: '' };
      this.props.set(spec.id, pr);
      this.drawProp(pr);
      const tgt = this.propTarget(pr);
      pr.ax = tgt.ax; pr.len = instant ? tgt.len : 0; pr.op = instant ? tgt.op : 0;
      if (!instant) pr.av = (Math.random() - .5) * this.fam.kick * 2;
      return pr;
    }
    drawProp(pr) {
      const key = JSON.stringify(pr.spec.params || {}) + '|' + pr.spec.kind;
      if (key === pr.key) return;
      pr.key = key;
      const d = PW.PROPS[pr.spec.kind](this.pen, pr.spec.params || {});
      let inner = d.svg;
      if (pr.spec.hat) inner += '';
      pr.el.innerHTML = inner;
      pr.ties = d.ties; pr.foot = d.foot;
      if (d.label != null) {
        if (!pr.labelEl) { pr.labelEl = document.createElement('span'); pr.labelEl.className = 'pst-plabel'; this.overlay.appendChild(pr.labelEl); }
        pr.labelEl.textContent = d.label;
      } else if (pr.labelEl) { pr.labelEl.remove(); pr.labelEl = null; }
      const n = d.ties.length;
      while (pr.strs.length < n) pr.strs.push(el('path', { class: 'pst-pstrl', fill: 'none' }, this.gPropStr));
      while (pr.strs.length > n) pr.strs.pop().remove();
      const w = this.w, col = this.famName === 'glass' ? (w.scheme === 'dark' ? 'rgba(246,248,252,.5)' : 'rgba(12,15,21,.38)') : this.famName === 'basic' ? w.line : this.famName === 'retro' ? w.ink : this.famName === 'nier' ? w.ink : TH[this.theme].str;
      pr.strs.forEach((p) => { p.setAttribute('stroke', col); p.setAttribute('stroke-width', this.famName === 'retro' ? 4 : this.famName === 'nier' ? 1 : this.famName === 'basic' ? 1.5 : 2); if (this.famName === 'basic') p.setAttribute('stroke-opacity', '.55'); });
      this.syncDefs();
    }
    slotXY(spec) {
      if (spec.at) return spec.at;
      const Lay = this.L;
      if (spec.stack != null) { const [x, base, step] = Lay.stack; return [x + [-3, 4, -2, 3, 0, -3][spec.stack % 6] * Lay.propScale, base - spec.stack * step - 22 * Lay.propScale]; }
      return Lay.slots[spec.slot] || Lay.slots.side;
    }
    propTarget(pr) {
      const Lay = this.L, [x, y] = this.slotXY(pr.spec), sc = (pr.spec.scale || 1) * Lay.propScale;
      const tie = pr.ties[0], tieY = pr.ties.reduce((m, t) => Math.min(m, t[1]), 0);
      let len = (y + tieY * sc) - Lay.anchorY;
      if (pr.spec.preview) len -= 26 * Lay.propScale;
      if (pr.state === 'out') len = -10;
      return { ax: x, len, op: pr.state === 'out' ? 0 : pr.spec.preview ? .62 : 1, tieY, sc };
    }

    /* ------------------------------------------------------ direction */
    // spec: { chapter, props:[{id,kind,slot|at|stack,params,preview,scale,ground}], pip:{mood,look,at,pose,work,power,tilt}, say, target, label }
    direct(spec) {
      this.spec = spec;
      if (spec.chapter && spec.chapter !== this.chapter) this.setChapter(spec.chapter);
      const ids = new Set();
      (spec.props || []).forEach((ps) => {
        ids.add(ps.id);
        const pr = this.props.get(ps.id);
        if (!pr || pr.state === 'out') { if (pr) { pr.el.remove(); pr.strs.forEach((s) => s.remove()); this.props.delete(ps.id); } this.addProp(ps); }
        else {
          const moved = JSON.stringify(this.slotXY(ps)) !== JSON.stringify(this.slotXY(pr.spec));
          const wasPreview = pr.spec.preview;
          pr.spec = ps; this.drawProp(pr);
          if (moved || (wasPreview && !ps.preview)) pr.av += (Math.random() > .5 ? 1 : -1) * this.fam.kick;
        }
      });
      this.props.forEach((pr, id) => { if (!ids.has(id) && pr.state !== 'out') { pr.state = 'out'; pr.av += this.fam.kick * .6; } });
      const pip = spec.pip || {};
      const Lay = this.L;
      const at = pip.at ? (Array.isArray(pip.at) ? pip.at : { left: [Lay.ctl[0] - 30 * (Lay.s / 2.3), Lay.ctl[1]], home: Lay.ctl }[pip.at] || Lay.ctl) : Lay.ctl;
      // asleep: the hand lowers until Pip rests on the floor (kept while the wake is pending)
      const asleep = pip.pose === 'asleep' || !!this.sleepZ;
      this.ps.Ct.x = at[0]; this.ps.Ct.y = at[1] + (asleep ? Lay.rope * .72 : 0);
      this.ps.asleep = asleep;
      this.ps.tiltT = pip.tilt != null ? pip.tilt : this.ps.asleep ? -.2 : 0;
      this.work = !!pip.work; this.power = pip.power || 0;
      this.pglow.forEach((p) => p.classList.toggle('on', this.power > 0));
      this.root.style.setProperty('--st-power', String(Math.min(1, this.power / 3)));
      if (spec.say !== undefined) this.say(spec.say);
      this.hudTarget(spec.target, spec.label);
      if (this.famName === 'retro' && this.hudEl) {
        const press = this.hudEl.querySelector('.pst-press'); if (press) press.hidden = !spec.press;
        const st = this.hudEl.querySelector('.pst-stagen'); if (st && spec.stageNo) st.textContent = spec.stageNo;
      }
      if (this.famName === 'nier' && this.hudEl && spec.label) this.decode(spec.label);
    }
    setChapter(ch) {
      const prev = this.chapter;
      this.chapter = ch;
      const tint = this.w.chapter && this.w.chapter[ch];
      if (tint) this.root.style.setProperty('--st-tint', tint);
      if (prev && !this.reduced) {
        if (this.famName === 'nier') { this.root.classList.remove('pst-slice'); void this.root.offsetWidth; this.root.classList.add('pst-slice'); }
        if (this.famName === 'glass') { this.root.classList.remove('pst-sweep'); void this.root.offsetWidth; this.root.classList.add('pst-sweep'); }
        if (this.famName === 'retro') { this.root.classList.remove('pst-clear'); void this.root.offsetWidth; this.root.classList.add('pst-clear'); }
        if (this.famName === 'friendly' || this.famName === 'basic') this.hop(.6);
      }
    }
    // a transient expression, then back to the scene's own
    feel(mood, ms) { this.moodOverride = mood; this.moodUntil = this.t + (ms || 1200) / 1000; }
    hop(k) { if (this.reduced || this.fam.still) return; this.ps.dyv -= 210 * (k || 1); }
    nod() { if (this.reduced || this.fam.still) return; this.ps.tiltv += 2.4; }
    // the moment a choice lands: the prop pops, Pip is pleased, the world celebrates in its own way
    cheer(propId, opts) {
      const pr = propId && this.props.get(propId);
      const at = pr ? this.propCentre(pr) : this.headCentre();
      this.feel(opts && opts.mood || (this.famName === 'friendly' && Math.random() < .35 ? 'wink' : 'happy'), 1400);
      this.hop(.8);
      if (pr && !this.reduced) { pr.sv -= 2.2; pr.av += this.fam.kick * .8; }
      if (this.reduced) return;
      const f = this.famName;
      if (f === 'friendly') this.burst(at, ['star', 'heart', 'dot'], 12);
      else if (f === 'glass') this.burst(at, ['glint', 'bubble'], 10);
      else if (f === 'basic') this.burst(at, ['ring', 'check'], 2);
      else if (f === 'retro') { this.burst(at, ['pix'], 14); this.addScore(100, at); }
      else if (f === 'nier') this.lockOn(pr);
    }
    wake() {
      // the welcome: Pip asleep on slack strings. It wakes when you arrive (the first pointer move or
      // key press) or after a moment, and the hand lifts it up.
      const ps = this.ps;
      this.sleepZ = true;
      this.say('');
      this.direct(this.spec);
      ps.C.y = ps.Ct.y; ps.C.vy = 0; ps.th = 0; ps.thv = 0;
      this.renderHead('sleep');
      clearTimeout(this.wakeT);
      const up = () => {
        if (!this.sleepZ) return;
        clearTimeout(this.wakeT); off();
        this.feel('alert', 650);
        this.wakeT = setTimeout(() => {
          this.sleepZ = false;
          this.direct(this.spec);
          this.feel('happy', 1600);
          setTimeout(() => { this.hop(.5); if (this.spec.wakeSay) this.say(this.spec.wakeSay); }, this.reduced ? 0 : 450);
        }, this.reduced ? 0 : 650);
      };
      const off = () => { document.removeEventListener('pointermove', up); document.removeEventListener('keydown', up); };
      document.addEventListener('pointermove', up, { once: true }); document.addEventListener('keydown', up, { once: true });
      this.wakeT = setTimeout(up, this.reduced ? 200 : 2600);
    }

    /* ---------------------------------------------------------- speech */
    say(text) {
      const b = this.bubble;
      clearInterval(this.typeT);
      if (!text) { b.classList.remove('on'); return; }
      b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
      const typed = (this.famName === 'retro' || this.famName === 'nier') && !this.reduced;
      if (!typed) { b.textContent = text; return; }
      let i = 0; b.textContent = '';
      this.typeT = setInterval(() => { i += 1; b.textContent = text.slice(0, i); if (i >= text.length) clearInterval(this.typeT); }, this.famName === 'retro' ? 28 : 18);
    }

    /* -------------------------------------------------------- NieR HUD */
    hudTarget(id, label) {
      this.target = id || null;
      if (this.famName !== 'nier') return;
      const t = this.hudEl && this.hudEl.querySelector('.pst-target');
      if (t) t.textContent = (label || (id ? id : 'STANDBY')).toUpperCase();
    }
    decode(text) {
      const d = this.hudEl && this.hudEl.querySelector('.pst-decode');
      if (!d) return;
      const glyphs = '▚▞▖▘▝▗#±‡⌗∴∵01';
      const goal = text.toUpperCase().slice(0, 28);
      let n = 0;
      clearInterval(this.decT);
      if (this.reduced) { d.textContent = goal; return; }
      this.decT = setInterval(() => {
        n += 1;
        d.textContent = goal.split('').map((ch, i) => i < n / 2 || ch === ' ' ? ch : glyphs[(i * 7 + n) % glyphs.length]).join('');
        if (n / 2 >= goal.length) clearInterval(this.decT);
      }, 32);
    }
    lockOn(pr) {
      if (!pr) return;
      this.lockT = this.t;
      const lab = this.hudEl && this.hudEl.querySelector('.pst-target');
      if (lab) { lab.dataset.state = 'confirmed'; clearTimeout(this.lockTO); this.lockTO = setTimeout(() => { delete lab.dataset.state; }, 1400); }
    }

    /* ----------------------------------------------------------- effects */
    burst(at, kinds, n) {
      const w = this.w, hues = Object.values(w.hues);
      for (let i = 0; i < n; i++) {
        const kind = kinds[i % kinds.length], a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 120;
        const e = el('g', { class: 'pst-p' }, this.gFx);
        const c = hues[i % hues.length];
        let sh = '';
        if (kind === 'star') sh = `<path d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z" fill="${c}"/>`;
        if (kind === 'heart') sh = `<path d="M0 5C-7 0 -7 -6 -3 -6C-1 -6 0 -4 0 -3C0 -4 1 -6 3 -6C7 -6 7 0 0 5Z" fill="${w.hues.c}"/>`;
        if (kind === 'dot') sh = `<circle r="3.2" fill="${c}"/>`;
        if (kind === 'glint') sh = `<path d="M0 -9Q.6 -.6 9 0Q.6 .6 0 9Q-.6 .6 -9 0Q-.6 -.6 0 -9Z" fill="#fff" style="mix-blend-mode:plus-lighter"/>`;
        if (kind === 'bubble') sh = `<circle r="${3 + Math.random() * 4}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1.2"/>`;
        if (kind === 'ring') sh = `<circle r="10" fill="none" stroke="${w.accent}" stroke-width="2"/>`;
        if (kind === 'check') sh = `<circle r="11" fill="${w.accent}"/><path d="M-5 0L-1.5 3.5L5.5 -4" fill="none" stroke="${w.surface}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
        if (kind === 'pix') sh = `<rect x="-3" y="-3" width="6" height="6" fill="${w.palette[6 + (i % 4)]}"/>`;
        e.innerHTML = sh;
        const still = kind === 'ring' || kind === 'check';
        const p = { e, kind, x: at[0], y: at[1] - (kind === 'check' ? 46 * this.L.propScale : 0), vx: still ? 0 : Math.cos(a) * sp, vy: still ? 0 : Math.sin(a) * sp - 60, r: Math.random() * 6, vr: (Math.random() - .5) * 8, life: 0, max: kind === 'check' ? 1.1 : kind === 'ring' ? .7 : .9 + Math.random() * .5, g: kind === 'bubble' ? -120 : kind === 'glint' ? 0 : 260 };
        this.fx.push(p);
      }
    }
    confetti(n) {
      if (this.reduced || this.famName === 'nier') return;
      const w = this.w, Lay = this.L, hues = this.famName === 'basic' ? [w.accent, w.line] : this.famName === 'retro' ? w.palette.slice(6) : Object.values(w.hues);
      for (let i = 0; i < n; i++) {
        const e = el('g', { class: 'pst-p' }, this.gFx), c = hues[i % hues.length];
        e.innerHTML = this.famName === 'glass' ? `<circle r="${3 + Math.random() * 5}" fill="#fff" fill-opacity=".18" stroke="#fff" stroke-opacity=".8" stroke-width="1"/>`
          : this.famName === 'retro' ? `<rect x="-3" y="-3" width="6" height="6" fill="${c}"/>` : `<rect x="-4" y="-2.2" width="8" height="4.4" rx="1" fill="${c}"/>`;
        this.fx.push({ e, kind: 'conf', x: Math.random() * Lay.w, y: -20 - Math.random() * Lay.h * .6, vx: (Math.random() - .5) * 30, vy: 40 + Math.random() * 60, r: Math.random() * 6, vr: (Math.random() - .5) * 6, life: 0, max: 4 + Math.random() * 2, g: this.famName === 'glass' ? -10 : 40, sway: Math.random() * 6 });
      }
    }
    addScore(n, at) {
      if (!this.hudEl) return;
      const from = this.score, to = this.score + n; this.score = to;
      const sc = this.hudEl.querySelector('.pst-score');
      let k = 0; clearInterval(this.scoreT);
      this.scoreT = setInterval(() => { k += 1; const v = Math.round(from + (to - from) * Math.min(1, k / 6)); if (sc) sc.textContent = String(v).padStart(6, '0'); if (k >= 6) clearInterval(this.scoreT); }, 60);
      const pop = document.createElement('span'); pop.className = 'pst-pop'; pop.textContent = '+' + n;
      const p = this.toScreen(at); pop.style.left = p[0] + 'px'; pop.style.top = p[1] + 'px';
      this.overlay.appendChild(pop); setTimeout(() => pop.remove(), 1000);
    }

    /* --------------------------------------------------------- geometry */
    measure() {
      const r = this.root.getBoundingClientRect(), Lay = this.L;
      this.box = r;
      const slice = this.famName === 'retro';
      const k = slice ? Math.max(r.width / Lay.w, r.height / Lay.h) : Math.min(r.width / Lay.w, r.height / Lay.h);
      this.map = { k, ox: (r.width - Lay.w * k) / 2, oy: (r.height - Lay.h * k) / 2 };
      if (this.canvas) {
        const px = Math.max(2.4, r.width / 128);
        this.canvas.width = Math.max(40, Math.round(r.width / px)); this.canvas.height = Math.max(30, Math.round(r.height / px));
        this.pxDirty = true;
      }
    }
    toScreen(p) { const m = this.map || { k: 1, ox: 0, oy: 0 }; return [m.ox + p[0] * m.k, m.oy + p[1] * m.k]; }
    headCentre() { const ps = this.ps, H = this.H || this.headAt(ps.C.x, ps.C.y, ps.th, ps.dy); return this.headXf([32, 45], H, this.ang || 0, 1, 1); }
    propCentre(pr) { return pr.pos ? [pr.pos[0], pr.pos[1]] : this.slotXY(pr.spec); }

    /* ------------------------------------------------------------- loop */
    loop() {
      this.raf = requestAnimationFrame(this.loop);
      const tn = now(); let dt = Math.min(.05, tn - this.last); this.last = tn;
      if (document.hidden) return;
      this.t += dt;
      const sub = 3; for (let i = 0; i < sub; i++) this.step(dt / sub);
      this.render();
      if (this.canvas) this.pixelate();
    }
    step(dt) {
      const ps = this.ps, F = this.fam, Lay = this.L, red = this.reduced || F.still;
      // the hand: springs to its spot, with a slow idle drift that keeps Pip alive
      const swayX = red ? 0 : F.sway * Math.sin(this.t * F.swayW) * (ps.asleep ? .2 : 1);
      const tx = ps.Ct.x + swayX, ty = ps.Ct.y;
      if (red) { ps.C.x = tx; ps.C.y = ty; ps.C.vx = ps.C.vy = 0; ps.th = ps.asleep ? 0 : 0; ps.thv = 0; }
      else {
        const ax = F.k * (tx - ps.C.x) - F.c * ps.C.vx, ay = F.k * (ty - ps.C.y) - F.c * ps.C.vy;
        ps.C.vx += ax * dt; ps.C.vy += ay * dt; ps.C.x += ps.C.vx * dt; ps.C.y += ps.C.vy * dt;
        // the pendulum, driven by the hand's acceleration
        const thA = -F.w * F.w * Math.sin(ps.th) - F.damp * ps.thv - (ax / Lay.rope) * Math.cos(ps.th);
        ps.thv += thA * dt; ps.th += ps.thv * dt;
      }
      // hop and squash
      if (red) { ps.dy = 0; ps.dyv = 0; ps.sx = ps.sy = 1; }
      else {
        const dyA = -180 * ps.dy - 14 * ps.dyv; ps.dyv += dyA * dt; ps.dy += ps.dyv * dt;
        const sq = clamp(-ps.dyv / 900, -.1, .1); ps.sy += ((1 + sq) - ps.sy) * Math.min(1, dt * 18); ps.sx += ((1 - sq * .7) - ps.sx) * Math.min(1, dt * 18);
      }
      // head tilt (expression) and the control's own tilt (rocking while working)
      if (red) { ps.tilt = ps.tiltT; ps.phi = 0; }
      else {
        const tA = 90 * (ps.tiltT - ps.tilt) - 10 * ps.tiltv; ps.tiltv += tA * dt; ps.tilt += ps.tiltv * dt;
        const phiT = this.work ? Math.sin(this.t * 4.2) * .12 : ps.asleep ? .08 : 0;
        ps.phi += (phiT - ps.phi) * Math.min(1, dt * 6);
      }
      // eyes follow what Pip is looking at
      const lk = ps.lookT; ps.look[0] += (lk[0] - ps.look[0]) * Math.min(1, dt * 9); ps.look[1] += (lk[1] - ps.look[1]) * Math.min(1, dt * 9);
      // props: each hangs from its own anchor above the stage
      this.props.forEach((pr, id) => {
        const tg = this.propTarget(pr);
        if (red) { pr.ax = tg.ax; pr.len = tg.len; pr.a = 0; pr.av = 0; pr.op = tg.op; pr.scale = (pr.spec.scale || 1); }
        else {
          const axA = this.fam.pk * (tg.ax - pr.ax) - this.fam.pc * pr.axv; pr.axv += axA * dt; pr.ax += pr.axv * dt;
          const lA = this.fam.pk * (tg.len - pr.len) - this.fam.pc * pr.lenv; pr.lenv += lA * dt; pr.len += pr.lenv * dt;
          const Lp = Math.max(30, pr.len);
          const aA = -(this.fam.pw * this.fam.pw) * Math.sin(pr.a) * (170 / Lp) - this.fam.pdamp * pr.av - (axA / Lp) * Math.cos(pr.a);
          pr.av += aA * dt; pr.a += pr.av * dt;
          if (pr.spec.ground && pr.landed) { pr.a *= Math.max(0, 1 - dt * 12); pr.av *= Math.max(0, 1 - dt * 12); }
          const sA = 260 * ((pr.spec.scale || 1) - pr.scale) - 16 * pr.sv; pr.sv += sA * dt; pr.scale += pr.sv * dt;
          pr.op += (tg.op - pr.op) * Math.min(1, dt * 8);
        }
        if (pr.spec.ground && !pr.landed && Math.abs(pr.len - tg.len) < 3) { pr.landed = true; pr.landT = this.t; }
        if (pr.state === 'out' && pr.len < 0 && (red || pr.op < .05)) { pr.el.remove(); pr.strs.forEach((s) => s.remove()); if (pr.labelEl) pr.labelEl.remove(); this.props.delete(id); }
      });
      // particles
      for (let i = this.fx.length - 1; i >= 0; i--) {
        const p = this.fx[i]; p.life += dt;
        if (p.life >= p.max) { p.e.remove(); this.fx.splice(i, 1); continue; }
        p.vy += p.g * dt; p.x += (p.vx + (p.sway ? Math.sin(this.t * 2 + p.sway) * 20 : 0)) * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.vx *= (1 - dt * .8);
      }
    }
    render() {
      const ps = this.ps, Lay = this.L;
      // mood: a transient feeling wins over the scene's own
      if (this.moodOverride && this.t > this.moodUntil) this.moodOverride = null;
      const base = (this.spec.pip && this.spec.pip.mood) || 'idle';
      const mood = this.sleepZ ? 'sleep' : (this.moodOverride || base);
      this.renderHead(mood);
      let H = this.headAt(ps.C.x, ps.C.y, ps.th, ps.dy);
      let ang = ps.th * .9 + ps.tilt;
      // asleep: the head rests on the floor and the strings go slack
      const headH = 28 * Lay.s;
      if (H[1] + headH > Lay.ground - 2) { H = [H[0], Lay.ground - 2 - headH]; }
      this.H = H; this.ang = ang;
      const sx = ps.sx, sy = ps.sy, s = Lay.s;
      this.gCtl.setAttribute('transform', `translate(${R(ps.C.x)} ${R(ps.C.y)}) rotate(${R(ps.phi * 57.3)}) scale(${s}) translate(-32 -14.5)`);
      this.gHead.setAttribute('transform', `translate(${R(H[0])} ${R(H[1])}) rotate(${R(ang * 57.3)}) scale(${s}) translate(-32 -31.5) translate(32 59.5) scale(${R(sx)} ${R(sy)}) translate(-32 -59.5)`);
      const ends = this.solveStrings({ C: ps.C, phi: ps.phi, H, ang, sx, sy });
      ends.forEach((e, i) => {
        const l = Math.hypot(e.E[0] - e.T[0], e.E[1] - e.T[1]), slack = Math.max(0, (this.restLen[i] || l) - l);
        const d = slack > 1 ? `M${R(e.T[0])} ${R(e.T[1])}Q${R((e.T[0] + e.E[0]) / 2 + (i ? 1 : -1) * slack * .25)} ${R((e.T[1] + e.E[1]) / 2 + slack * .55)} ${R(e.E[0])} ${R(e.E[1])}` : `M${R(e.T[0])} ${R(e.T[1])}L${R(e.E[0])} ${R(e.E[1])}`;
        this.pstrs[i].setAttribute('d', d); this.pglow[i].setAttribute('d', d);
      });
      // where the eyes look: at the target prop, or where the scene says
      const pip = this.spec.pip || {};
      let look = [0, 0];
      const tgt = pip.look && this.props.get(pip.look);
      if (tgt && tgt.pos) { const hc = this.headCentre(), vx = tgt.pos[0] - hc[0], vy = tgt.pos[1] - hc[1], l = Math.hypot(vx, vy) || 1; look = [vx / l * 2.2, vy / l * 1.5]; }
      else if (Array.isArray(pip.look)) look = pip.look;
      ps.lookT = look;
      if (this.eyesEl) this.eyesEl.setAttribute('transform', `translate(${R(ps.look[0])} ${R(ps.look[1])})`);
      // blink
      if (this.blinkEl && !this.reduced) {
        if (this.t > ps.nextBlink) { ps.blinkAt = this.t; ps.nextBlink = this.t + 2.2 + Math.random() * 3.4; }
        const b = ps.blinkAt != null ? this.t - ps.blinkAt : 9, k = b < .16 ? Math.max(.1, Math.abs(1 - b / .08)) : 1;
        this.blinkEl.setAttribute('transform', `translate(0 44) scale(1 ${R(k)}) translate(0 -44)`);
      }
      // props
      this.props.forEach((pr) => {
        const tg = this.propTarget(pr), sc = tg.sc * (pr.scale / (pr.spec.scale || 1));
        const tieMid = [pr.ties.reduce((m, t) => m + t[0], 0) / pr.ties.length, tg.tieY];
        const hang = [pr.ax + Math.sin(pr.a) * Math.max(0, pr.len), Lay.anchorY + Math.cos(pr.a) * Math.max(0, pr.len)];
        const cv = rot([-tieMid[0] * sc, -tieMid[1] * sc], pr.a);
        pr.pos = [hang[0] + cv[0], hang[1] + cv[1]];
        if (pr.labelEl) { const q = this.toScreen(pr.pos), k = (this.map ? this.map.k : 1) * sc; pr.labelEl.style.transform = `translate(${R(q[0])}px, ${R(q[1])}px) translate(-50%, -50%) rotate(${R(pr.a * 57.3)}deg)`; pr.labelEl.style.fontSize = R(Math.min(15, 1400 / Math.max(10, pr.labelEl.textContent.length * 9) ) * k) + 'px'; pr.labelEl.style.opacity = R(pr.op); }
        pr.el.setAttribute('transform', `translate(${R(hang[0])} ${R(hang[1])}) rotate(${R(pr.a * 57.3)}) scale(${R(sc)}) translate(${R(-tieMid[0])} ${R(-tieMid[1])})`);
        pr.el.setAttribute('opacity', R(pr.op));
        const strOp = pr.spec.ground && pr.landed ? Math.max(0, 1 - (this.t - pr.landT) * 2.5) : pr.op;
        pr.ties.forEach((t, i) => {
          const v = rot([(t[0] - tieMid[0]) * sc, (t[1] - tieMid[1]) * sc], pr.a), end = [hang[0] + v[0], hang[1] + v[1]];
          const top = [pr.ax + (t[0] - tieMid[0]) * sc, Lay.anchorY - 200];
          pr.strs[i].setAttribute('d', `M${R(top[0])} ${R(top[1])}L${R(end[0])} ${R(end[1])}`);
          pr.strs[i].setAttribute('opacity', R(strOp));
          pr.strs[i].classList.toggle('pst-dash', !!pr.spec.preview);
        });
      });
      // particles
      this.fx.forEach((p) => {
        const k = p.life / p.max, op = p.kind === 'conf' ? (k > .85 ? (1 - k) / .15 : 1) : 1 - k * k;
        const sc = p.kind === 'ring' ? 1 + k * 3.2 : p.kind === 'check' ? (k < .2 ? k / .2 * 1.1 : 1) : 1;
        p.e.setAttribute('transform', `translate(${R(p.x)} ${R(p.y)}) rotate(${R(p.r * 57.3 / 6)}) scale(${R(sc)})`);
        p.e.setAttribute('opacity', R(Math.max(0, op)));
      });
      // sleeping z's
      if (this.sleepZ && !this.reduced && this.t - (this.lastZ || 0) > .9 && this.famName !== 'nier') {
        this.lastZ = this.t;
        const hc = this.headCentre(), e = el('g', { class: 'pst-p' }, this.gFx);
        e.innerHTML = `<text font-family="system-ui,sans-serif" font-weight="800" font-size="${this.famName === 'retro' ? 20 : 16}" fill="${this.w.text}">z</text>`;
        this.fx.push({ e, kind: 'z', x: hc[0] + 40, y: hc[1] - 30, vx: 14, vy: -26, r: 0, vr: .4, life: 0, max: 2, g: 0 });
      }
      // soft shadows on the floor: Pip's and each prop's, smaller and fainter the higher they hang
      if (this.famName === 'friendly' || this.famName === 'glass') {
        const sh = (x, y, r) => { const h = Math.max(0, Lay.ground - y), k = clamp(1 - h / (Lay.h * .9), .25, 1); return `<ellipse cx="${R(x)}" cy="${Lay.ground + 2}" rx="${R(r * (.6 + k * .5))}" ry="${R(r * .13 * (.6 + k * .5))}" fill="${this.w.shadow}" opacity="${R(k * .7)}"/>`; };
        let out = sh(H[0], H[1] + 64 * Lay.s / 2.6, 46 * Lay.s / 2.6);
        this.props.forEach((pr) => { if (pr.pos) out += sh(pr.pos[0], pr.pos[1] + pr.foot * (pr.spec.scale || 1) * Lay.propScale, 40 * (pr.spec.scale || 1) * Lay.propScale * pr.op); });
        this.gShadow.innerHTML = out;
      }
      // NieR target brackets around what Pip is looking at
      if (this.famName === 'nier') this.renderBrackets();
      // the speech bubble follows Pip
      // tall stages put the bubble above Pip; short strips put it beside Pip. Always inside the stage.
      const tall = this.layoutName === 'portrait';
      const sp = this.toScreen(this.headXf(tall ? [44, 30] : [58, 44], H, ang, 1, 1));
      const bw = this.bubble.offsetWidth || 160, bh = this.bubble.offsetHeight || 34, bx = this.box ? this.box.width : 400, by = this.box ? this.box.height : 560;
      const x = clamp(sp[0] + (tall ? 0 : 6), 8, bx - bw - 8), y = clamp(tall ? sp[1] - bh - 14 : sp[1] - bh / 2, 8, by - bh - 8);
      this.bubble.style.transform = `translate(${R(x)}px, ${R(y)}px)`;
    }
    renderBrackets() {
      const id = this.target, pr = id && this.props.get(id);
      if (!pr || !pr.pos) { this.gHud.innerHTML = ''; return; }
      const sc = this.propTarget(pr).sc, x = pr.pos[0], y = pr.pos[1];
      const lock = this.lockT != null && this.t - this.lockT < 1.2 ? 1 - Math.min(1, (this.t - this.lockT) / .25) : 0;
      const hw = (58 + lock * 14) * sc, hh = (Math.max(48, pr.foot + 8) + lock * 12) * sc, k = 12 * sc, c = this.w.ink;
      const corner = (cx, cy, dx, dy) => `<path d="M${R(cx)} ${R(cy + dy * k)}V${R(cy)}H${R(cx + dx * k)}" fill="none" stroke="${c}" stroke-width="1.6"/>`;
      this.gHud.innerHTML = corner(x - hw, y - hh, 1, 1) + corner(x + hw, y - hh, -1, 1) + corner(x - hw, y + hh, 1, -1) + corner(x + hw, y + hh, -1, -1)
        + `<path d="M${R(x - hw - 10)} ${R(y)}H${R(x - hw - 3)}M${R(x + hw + 3)} ${R(y)}H${R(x + hw + 10)}" stroke="${c}" stroke-width="1"/>`;
    }

    /* ------------------------------------------------------ Retro pixels */
    pixelate() {
      const tn = this.t;
      if (this.pxBusy || tn - this.pxLast < 1 / FAM.retro.fps) return;
      this.pxBusy = true; this.pxLast = tn;
      const cw = this.canvas.width, ch = this.canvas.height;
      const svg = this.svg.cloneNode(true);
      svg.setAttribute('width', cw); svg.setAttribute('height', ch);
      const xml = new XMLSerializer().serializeToString(svg);
      const img = this.img;
      img.onload = () => {
        const c = this.ctx;
        c.imageSmoothingEnabled = true;
        c.clearRect(0, 0, cw, ch); c.drawImage(img, 0, 0, cw, ch);
        const d = c.getImageData(0, 0, cw, ch), a = d.data, pal = this.palette, cache = this.pxCache;
        for (let i = 0; i < a.length; i += 4) {
          const key = (a[i] >> 2) << 12 | (a[i + 1] >> 2) << 6 | (a[i + 2] >> 2);
          let best = cache.get(key);
          if (best === undefined) {
            let bd = 1e9; best = 0;
            for (let j = 0; j < pal.length; j++) { const dr = a[i] - pal[j][0], dg = a[i + 1] - pal[j][1], db = a[i + 2] - pal[j][2], dd = dr * dr * 3 + dg * dg * 4 + db * db * 2; if (dd < bd) { bd = dd; best = j; } }
            cache.set(key, best);
          }
          a[i] = pal[best][0]; a[i + 1] = pal[best][1]; a[i + 2] = pal[best][2]; a[i + 3] = 255;
        }
        c.putImageData(d, 0, 0);
        this.pxBusy = false;
      };
      img.onerror = () => { this.pxBusy = false; };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    }

    /* --------------------------------------------------------------- API */
    setTheme(theme) {
      if (theme === this.theme) return;
      this.theme = theme;
      this.root.classList.add('pst-swap');
      this.build();
      this.direct(this.spec);
      requestAnimationFrame(() => this.root.classList.remove('pst-swap'));
    }
    setLayout(name) {
      if (name === this.layoutName) return;
      this.layoutName = name; this.ps = null;
      this.build(); this.direct(this.spec);
    }
    setReduced(r) { this.reduced = !!r; this.root.dataset.reduced = r ? '1' : '0'; }
    // Pip tries on another look (the Pick a look screen): only Pip changes, the world stays
    tryOn(theme) {
      const t = theme || this.theme;
      if (t === this.pipTheme) return;
      if (this.reduced) { this.buildPip(t); return; }
      const g = this.gHead, c = this.gCtl;
      let k = 0;
      const flip = () => {
        k += 1;
        const sx = k <= 6 ? 1 - k / 6 : (k - 6) / 6;
        [g, c].forEach((n) => n.style.transformBox = 'fill-box');
        this.gPip.style.transformOrigin = `${this.ps.C.x}px 0`;
        this.gPip.style.transform = `scaleX(${R(Math.max(.02, sx))})`;
        if (k === 6) { this.buildPip(t); }
        if (k < 12) requestAnimationFrame(flip); else this.gPip.style.transform = '';
      };
      flip();
    }
    destroy() { cancelAnimationFrame(this.raf); this.ro.disconnect(); clearTimeout(this.wakeT); clearInterval(this.typeT); clearInterval(this.decT); this.root.innerHTML = ''; }
  }

  G.PipStage = { Stage, LAYOUTS, FAM };
})(window);
