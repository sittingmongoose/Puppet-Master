/* Pip's stage (Opus 5.5 concept): the scene beside every onboarding screen.
   Pip hangs from the control, which stands for the person setting up. It is a real pendulum: when
   the hand moves, Pip swings and settles, and its strings are solved every frame from the screw
   eyes on the bar to the eyes on its head (the same solver as the logo). Every prop is lowered in
   on its own string and swings too. Hovering a choice previews its prop; choosing it drops it in
   and Pip reacts. Between moments Pip is alive: it breathes, follows the pointer with its eyes and
   fidgets now and then.
   Retro is PMConcept7's own terminal: Retro Dark a green-phosphor tube in a charcoal monitor case (glow,
   scanlines, an aperture grille, grain, a rolling bar, phosphor persistence, a degauss on a chapter
   change); Retro Light the same machine's Paper Teletype printout, no screen at all: green-bar paper
   rising out of the printer at the foot of the stage, its head printing the command line, the paper
   feeding on a chapter change. NieR is a YoRHa unit: Pip hovers like
   a Pod, a scanner turns, targets lock with leader lines, quests update and Pip talks in a dialogue box.
   Sound goes through window.PipSound (sound.js) when it is there. */
(function (G) {
  'use strict';
  const L = G.PMLogo, K = L.kit, TH = L.THEMES, PW = G.PipWorlds;
  const NS = 'http://www.w3.org/2000/svg';
  const R = (v) => +(+v).toFixed(2);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const now = () => performance.now() / 1000;
  const ease = (k) => 1 - Math.pow(1 - clamp(k, 0, 1), 3);

  /* ------------------------------------------------------------- layouts */
  // portrait: the left pane of the window. banner: the strip above the content on narrow windows.
  const LAYOUTS = {
    portrait: {
      w: 400, h: 560, ground: 492, s: 2.6, ctl: [146, 112], rope: 184, propScale: 1.18, anchorY: -60,
      slots: {
        side: [306, 372], sign: [294, 360], pairA: [284, 318], pairB: [360, 426], hi: [306, 262],
        o1: [262, 300], o2: [340, 322], o3: [262, 398], o4: [340, 420],
        m1: [250, 132], m2: [312, 162], m3: [374, 132], m4: [300, 318], m5: [52, 352],
        c1: [254, 378], c2: [316, 400], c3: [378, 378]
      },
      stack: [300, 490, 52], crewScale: 1, charmScale: .5
    },
    banner: {
      w: 720, h: 240, ground: 234, s: 1.42, ctl: [150, 30], rope: 76, propScale: .74, anchorY: -40,
      slots: {
        side: [420, 132], sign: [432, 124], pairA: [396, 112], pairB: [480, 152], hi: [420, 92],
        o1: [330, 96], o2: [390, 118], o3: [450, 96], o4: [510, 118],
        m1: [330, 64], m2: [380, 80], m3: [430, 64], m4: [410, 78], m5: [480, 108],
        c1: [470, 150], c2: [526, 164], c3: [582, 150]
      },
      stack: [430, 232, 32.6], crewScale: .55, charmScale: .32
    },
    // squeezed windows: a short strip, Pip on the left and one prop beside it
    compact: {
      w: 420, h: 200, ground: 196, s: 1.2, ctl: [84, 26], rope: 62, propScale: .64, anchorY: -40,
      slots: {
        side: [292, 112], sign: [296, 104], pairA: [268, 96], pairB: [340, 130], hi: [300, 70],
        o1: [218, 86], o2: [270, 104], o3: [322, 86], o4: [374, 104],
        m1: [230, 56], m2: [290, 72], m3: [350, 56], m4: [300, 90], m5: [380, 90],
        c1: [262, 124], c2: [318, 138], c3: [374, 124]
      },
      stack: [300, 194, 28.2], crewScale: .5, charmScale: .3
    }
  };

  // how each family moves (PMConcept7's own motion personalities). fps: Retro's tube refreshes at
  // a stepped rate with phosphor persistence between frames. bob: NieR hovers like a Pod.
  const FAM = {
    friendly: { w: 3.9, damp: .9, sway: 5, swayW: .9, k: 120, c: 12, pk: 130, pc: 11, pw: 3.6, pdamp: 1.1, kick: .45, breathe: .014, cps: 32 },
    glass: { w: 2.8, damp: .55, sway: 4, swayW: .55, k: 40, c: 10, pk: 42, pc: 10, pw: 2.6, pdamp: .7, kick: .32, breathe: .01, cps: 30 },
    basic: { w: 3.6, damp: 2.4, sway: 1.6, swayW: .6, k: 170, c: 26, pk: 170, pc: 25, pw: 3.6, pdamp: 3, kick: .16, breathe: .006, cps: 38 },
    retro: { w: 4.2, damp: 1.4, sway: 4, swayW: 1, k: 190, c: 20, pk: 190, pc: 20, pw: 4, pdamp: 1.6, kick: .4, breathe: .01, fps: 20, cps: 50 },
    nier: { w: 2.6, damp: 3.4, sway: 2.4, swayW: .42, k: 55, c: 15, pk: 60, pc: 16, pw: 2.8, pdamp: 3.2, kick: .1, bob: 3.2, breathe: 0, noHop: true, cps: 55 }
  };
  // Pip on the tube: Retro Dark's Pip in PM Phosphor Green, Retro Light's in Paper Teletype ink
  const TUBE_PIP = {
    phosphor: Object.assign({}, TH['retro-dark'], { bg: '#071109', head: '#4FCB60', eye: '#041008', cheek: '#C4EC35', ctl: '#9BF5A6', str: '#3E8A48', pin: '#D3FFB0' }),
    teletype: Object.assign({}, TH['retro-light'], { bg: '#F4ECDD', head: '#346B37', eye: '#F4ECDD', cheek: '#A13126', ctl: '#231E19', str: '#5B544A', pin: '#A13126' })
  };
  const CHAPTER_NAMES = { welcome: 'Welcome', computer: 'The computer', project: 'Your Project', ai: 'Power', ready: 'Ready' };
  const CHAPTER_N = { welcome: 0, computer: 1, project: 2, ai: 3, ready: 4 };

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const div = (cls, parent, html) => { const d = document.createElement('div'); d.className = cls; if (html) d.innerHTML = html; if (parent) parent.appendChild(d); return d; };
  const rot = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
  const snd = () => G.PipSound || null;

  // where the pointer is, for Pip's eyes (shared by every stage)
  const pointer = { x: -1, y: -1, t: 0 };
  document.addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.t = now(); }, { passive: true });

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
      this.ghosts = [];
      this.spec = { props: [], pip: {} };
      this.moodOverride = null; this.moodUntil = 0;
      this.t = 0; this.last = now(); this.frameT = 0;
      this.feed = 0; this.loops = {};
      this.idleNext = 6 + Math.random() * 4; this.idleUntil = 0; this.idleLook = null;
      this.build();
      this.loop = this.loop.bind(this);
      this.raf = requestAnimationFrame(this.loop);
      this.ro = new ResizeObserver(() => this.measure());
      this.ro.observe(root);
    }

    /* ------------------------------------------------------- building */
    build() {
      const root = this.root, w = PW.WORLDS[this.theme], Lay = this.L = LAYOUTS[this.layoutName];
      this.w = w; this.fam = FAM[w.fam]; this.famName = w.fam; this.tube = w.tube || null;
      root.innerHTML = '';
      root.classList.add('pst');
      root.dataset.fam = w.fam; root.dataset.scheme = w.scheme; root.dataset.layout = this.layoutName;
      // only Retro's stages carry data-tube (the monitor and paper rules key on it)
      if (this.tube) root.dataset.tube = this.tube; else delete root.dataset.tube;
      root.dataset.reduced = this.reduced ? '1' : '0';
      root.style.setProperty('--st-tint', (w.chapter && w.chapter[this.chapter || 'welcome']) || w.ink);
      // Retro Dark: a monitor case, its sloped face and the tube; everything on stage lives on the tube.
      // Retro Light: a sheet of paper and the printer it comes out of
      this.screen = root; this.content = root; this.head = null;
      if (this.tube === 'phosphor') {
        const cs = div('pst-case', root);
        div('pst-brand', cs, `<span>PUPPET MASTER</span><i class="pst-led"></i>`);
        const face = div('pst-face', cs);
        this.screen = div('pst-tube', face);
        this.content = div('pst-content', this.screen);
      } else if (this.tube) {
        this.screen = div('pst-sheet', root);
        this.content = div('pst-content', this.screen);
      }
      this.wall = div('pst-wall', this.content);
      // Glass stands on PMConcept7's own Ribbons wallpaper (kept with the logo; a standalone build inlines it)
      if (w.fam === 'glass') root.style.setProperty('--wall', `url(${(G.PIP_WALLS && G.PIP_WALLS[w.scheme]) || `../../Icon-Concepts/Opus5.5icon/wall-ribbons-${w.scheme}.webp`})`);
      if (w.fam === 'glass') this.wall.innerHTML = '<i class="pst-caustic c1"></i><i class="pst-caustic c2"></i><i class="pst-caustic c3"></i>';
      const svg = this.svg = el('svg', { class: 'pst-svg', viewBox: `0 0 ${Lay.w} ${Lay.h}`, preserveAspectRatio: this.tube ? 'xMidYMid slice' : 'xMidYMid meet', 'aria-hidden': 'true' }, this.content);
      svg.setAttribute('xmlns', NS);
      this.defs = el('defs', null, svg);
      const bd = PW.backdrop(w, this.id + 'w', Lay);
      this.pen = PW.pen(w, this.id + 'p'); this.pen.theme = this.theme;
      this.backDefs = bd.defs;
      this.gBack = el('g', { class: 'pst-back', id: this.id + 'bk' }, svg); this.gBack.innerHTML = bd.back;
      this.paper = this.gBack.querySelector('.st-paper');
      if (this.paper) this.paper.style.transform = `translateY(${-this.feed}px)`;
      this.terrain = bd.terrain || null;
      this.gTerrain = this.terrain ? el('path', { class: 'pst-terrain', fill: 'none', stroke: w.ink, 'stroke-width': '1.1' }, svg) : null;
      if (w.fam === 'glass') {
        // a faint mirror image in the glass floor, of everything that hangs
        const m = this.id + 'rm';
        this.backDefs += `<linearGradient id="${m}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="${m}" maskUnits="userSpaceOnUse" x="-2000" y="${Lay.ground}" width="4000" height="${Lay.h}"><rect x="-2000" y="${Lay.ground}" width="4000" height="${Lay.h}" fill="url(#${m}g)"/></mask>`;
        this.gReflect = el('g', { class: 'pst-reflect', mask: `url(#${m})`, opacity: w.scheme === 'dark' ? '.55' : '.4' }, svg);
        el('use', { href: `#${this.id}act`, transform: `translate(0 ${2 * Lay.ground}) scale(1 -1)` }, this.gReflect);
      }
      this.gShadow = el('g', { class: 'pst-shadows' }, svg);
      this.gRipple = el('g', { class: 'pst-ripples' }, svg);
      this.gTrail = el('g', { class: 'pst-trail' }, svg);
      this.gActors = el('g', { id: `${this.id}act` }, svg);
      this.gPropStr = el('g', { class: 'pst-pstr' }, this.gActors);
      this.gProps = el('g', { class: 'pst-props' }, this.gActors);
      this.gPip = el('g', { class: 'pst-pip' }, this.gActors);
      // NieR's chapter glitch: two bands of the whole picture, backdrop and all, slip sideways for a moment
      this.gSlice = null;
      if (w.fam === 'nier') {
        const cp = el('clipPath', { id: this.id + 'slc' }, svg);
        this.sliceR = [0, 1].map(() => el('rect', { x: -2000, y: 0, width: 4000, height: 0 }, cp));
        this.gSlice = el('g', { 'clip-path': `url(#${this.id}slc)`, display: 'none' }, svg);
        el('use', { href: `#${this.id}bk` }, this.gSlice); el('use', { href: `#${this.id}act` }, this.gSlice);
      }
      this.gFx = el('g', { class: 'pst-fx' }, svg);
      this.gHud = el('g', { class: 'pst-hud' }, svg);
      this.overlay = div('pst-overlay', this.content);
      this.bubble = div('pst-bubble', this.overlay);
      this.bubble.setAttribute('role', 'status');
      this.bubble.innerHTML = (w.fam === 'nier' ? '<b class="pst-bn">PIP</b>' : '') + '<span class="pst-bt"></span>' + (w.fam === 'nier' ? '<i class="pst-bgo" aria-hidden="true"></i>' : '');
      this.btext = this.bubble.querySelector('.pst-bt');
      if (this.tube === 'phosphor') div('pst-crt', this.screen, '<i class="pst-roll"></i><i class="pst-scan"></i><i class="pst-mask"></i><i class="pst-noise"></i><i class="pst-vig"></i><i class="pst-glare"></i>');
      if (this.tube === 'teletype') { div('pst-grain', this.screen); this.head = div('pst-printer', this.screen, '<i class="pst-bail"></i><i class="pst-platen"></i><i class="pst-head"><b></b></i>').querySelector('.pst-head'); }
      this.hudHtml();
      // Pip's tip: a note hanging under Pip, in the look's own material (NieR files it in a TIPS box in its HUD)
      this.tipBox = null; this.tipXY = null;
      const kl = w.fam === 'nier' ? '◆ TIPS' : this.tube === 'phosphor' ? 'HELP' : this.tube ? 'NOTE' : { friendly: "Pip's tip", glass: 'Tip', basic: 'Note' }[w.fam];
      const tipHtml = `<b class="pst-tip-k"><span class="pst-tip-kl">${kl}</span><button type="button" class="pst-tip-x" data-help-close aria-label="Close tip">×</button></b><span class="pst-tip-h"></span><span class="pst-tip-t" aria-hidden="true"></span><span class="pst-tip-sr"></span>`;
      if (w.fam !== 'nier') this.tipBox = div('pst-tip', this.overlay, tipHtml);
      else { const nt = this.hudEl.querySelector('.pst-ntip'); nt.innerHTML = tipHtml; }
      const te = this.tipEl(); if (te) te.setAttribute('role', 'status');
      if (this.tipData) this.showTip(true);
      this.buildPip();
      // re-create the props that were on stage, in the new material
      const keep = [...this.props.values()];
      this.props.clear();
      keep.forEach((p) => { if (p.state !== 'out') this.addProp(p.spec, true); });
      this.ghosts = [];
      this.syncDefs();
      this.measure();
      if (this.tube) this.powerOn();
    }
    syncDefs() { this.defs.innerHTML = this.backDefs + this.pen.defs(); }

    hudHtml() {
      const f = this.famName;
      let h = '';
      if (this.tube === 'phosphor') h = `<div class="pst-term"><div class="pst-term-top"><span>PIP.SYS 1.0</span><span class="pst-term-ch">[ WELCOME ]</span></div><pre class="pst-term-boot" aria-hidden="true"></pre><div class="pst-term-cmd"><span class="pst-term-ps">C:\\PIP&gt;</span> <span class="pst-term-in"></span><i class="pst-term-cur"></i><span class="pst-term-ok"></span></div></div>`;
      if (this.tube === 'teletype') h = `<div class="pst-term"><div class="pst-term-top"><span>PUPPET MASTER · SETUP LOG</span><span class="pst-term-ch">PAGE 01</span></div><pre class="pst-term-boot" aria-hidden="true"></pre><div class="pst-term-cmd"><span class="pst-term-ps">»</span> <span class="pst-term-in"></span><i class="pst-term-cur"></i><span class="pst-term-ok"></span></div></div>`;
      if (f === 'nier') h = `<div class="pst-nhud"><div class="pst-ntop"><span>PIP // UNIT P-01</span><span class="pst-decode" aria-hidden="true"></span></div>
        <div class="pst-nscan" aria-hidden="true"><i></i><span class="pst-nscan-l">SCAN</span></div>
        <div class="pst-nquest" aria-hidden="true"><b>QUEST UPDATED</b><span class="pst-nquest-t"></span></div>
        <div class="pst-ntip"></div>
        <div class="pst-nlab"><span class="pst-nlab-k">■ <b class="pst-target">STANDBY</b></span><span class="pst-ncoord">MAP 1:1</span></div><i class="pst-nb tl"></i><i class="pst-nb tr"></i><i class="pst-nb bl"></i><i class="pst-nb br"></i></div>`;
      const wrap = div('pst-hudhtml', this.overlay, h);
      this.hudEl = wrap;
      this.cmdText = null;
      const lab = wrap.querySelector('.pst-term-ch'), ch = this.chapter || 'welcome';
      if (lab) lab.textContent = this.tube === 'teletype' ? `PAGE ${String(CHAPTER_N[ch] + 1).padStart(2, '0')}` : `[ ${CHAPTER_NAMES[ch].toUpperCase()} ]`;
    }

    /* -------------------------------------------------------------- Pip */
    pipTh(theme) { return theme === this.theme && this.tube ? TUBE_PIP[this.tube] : TH[theme]; }
    buildPip(themeOverride) {
      const Lay = this.L, g = K.GEO.full, theme = themeOverride || this.theme, th = this.pipTh(theme), nier = !!th.nier;
      this.pipTheme = theme;
      if (!this.ps) {
        this.ps = { C: { x: Lay.ctl[0], y: Lay.ctl[1], vx: 0, vy: 0 }, Ct: { x: Lay.ctl[0], y: Lay.ctl[1] }, th: 0, thv: 0, dy: 0, dyv: 0, tilt: 0, tiltv: 0, tiltT: 0, phi: 0, phiv: 0,
          sx: 1, sy: 1, sv: 0, look: [0, 0], lookT: [0, 0], blink: 1, nextBlink: 2, asleep: false };
      }
      this.gPip.innerHTML = '';
      this.pstrs = [0, 1].map(() => el('path', { class: 'pst-str', fill: 'none', 'stroke-linecap': 'round' }, this.gPip));
      this.pglow = [0, 1].map(() => el('path', { class: 'pst-power', fill: 'none', 'stroke-linecap': 'round' }, this.gPip));
      this.gHead = el('g', { class: 'pst-head' }, this.gPip);
      this.gCtl = el('g', { class: 'pst-ctl' }, this.gPip);
      const strW = this.famName === 'nier' ? 1.4 : 2.2;
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
      // the face being left closes as the new one opens (animFace), unless the whole head is being rebuilt
      const leaving = !force && !this.reduced && this.faceEl && this.faceEl.isConnected ? this.faceEl : null;
      if (this.faceOut) { this.faceOut.remove(); this.faceOut = null; }
      this.curMood = mood;
      const g = K.GEO.full, th = this.pipTh(this.pipTheme);
      const p = this.id + 'h' + (++this.hseq || (this.hseq = 1));
      this.blinkY = 44;
      if (th.nier) {
        const nm = mood === 'dots' ? 'think' : mood === 'wink' ? 'happy' : mood;
        const parts = K.pipNier(g, th, nm, { face: 'pf', dot: 'pst-dot' }, { face: p + 'f' }, { parts: true });
        this.gHead.innerHTML = parts.headInner;
        // at rest the blindfold is not blank: two eyes show through it, and blink (the other moods light the band up)
        const f = this.gHead.querySelector('.pf');
        if (f && nm === 'idle') {
          const e = (x) => `<rect x="${R(x - 1.35)}" y="38.2" width="2.7" height="4.8" rx=".8" fill="${th.paper}"/>`;
          f.insertAdjacentHTML('beforeend', `<g class="pb">${e(25.5) + e(38.5)}</g>`);
          this.blinkY = 40.6;
        }
      } else {
        const hd = K.pipHead(g, th, mood, { face: p + 'f', grad: p + 'g', clip: p + 'c', rim: p + 'r', glow: p + 'w', spec: p + 's', drop: p + 'd' }, { face: 'pf', eyes: 'pe', blink: 'pb', dot: 'pst-dot' }, {});
        this.gHead.innerHTML = (hd.defs ? `<defs>${hd.defs}</defs>` : '') + K.eyeletRings(g, th, {}) + hd.body;
      }
      // the face as one group (eyes, brows, mouth; on NieR the band's marks and the mouth after them), so it changes as one
      const pf = this.gHead.querySelector('.pf'), face = el('g', { class: 'pst-face' });
      if (pf) {
        this.gHead.insertBefore(face, pf); face.appendChild(pf);
        const m = th.nier && this.gHead.lastElementChild; if (m && m !== face) face.appendChild(m);
      }
      // each part wrapped, so a change of face can close and open it in place: the eyes (with their brows; NieR's
      // marks on the band) blink shut on their own line, the mouth and anything else shrink to their own centre
      (th.nier ? [...face.children] : pf ? [...pf.children] : []).forEach((n) => {
        const w = el('g', { class: 'pst-part' }); n.parentNode.insertBefore(w, n); w.appendChild(n);
        w.eyes = n.classList.contains('pe') || n.classList.contains('pf');
      });
      this.faceEl = face;
      if (leaving) { this.faceOut = leaving; this.faceOutV = this.faceT0 == null ? 1 : clamp(this.faceV, 0, 1); this.gHead.appendChild(leaving); this.faceT0 = this.t; this.faceV = 0; }
      else { this.faceT0 = null; this.faceV = 1; }
      // the eyes follow what Pip looks at, but not three thinking dots, NieR's three squares, or eyes closed in sleep
      const still = mood === 'dots' || mood === 'sleep' || (th.nier && mood === 'think');
      this.eyesEl = still ? null : face.querySelector('.pe') || (th.nier ? face.querySelector('.pf') : null);
      this.blinkEl = face.querySelector('.pb');
    }
    /* A change of face is a blink: the face being left closes (eyes shut on their line, the mouth shrinks to its centre)
       and only then does the new one open, a touch past full before it settles. Nothing fades, so no two faces ever
       show at once. About 0.2 s. A Retro stage draws in steps, so there the old face goes at once and the new one
       opens from shut over two of its frames: shut, most of the way, open; never a straight swap. */
    animFace() {
      const fps = this.frameRate(), CLOSE = fps ? 0 : .075, OPEN = fps ? 2 / fps : .13, e = this.t - (this.faceT0 == null ? -9 : this.faceT0);
      const set = (face, v) => face.querySelectorAll('.pst-part').forEach((w) => {
        if (v == null) { w.removeAttribute('transform'); return; }
        // the eyes close on the eye line (not between eyes and brows); everything else on its own centre
        if (!w.c) { const b = w.getBBox(), pb = w.eyes && w.querySelector('.pb'), e = pb ? pb.getBBox() : b; w.c = [b.x + b.width / 2, e.y + e.height / 2]; }
        const sx = w.eyes ? 1 : .25 + .75 * v, sy = w.eyes ? .06 + .94 * v : sx;
        w.setAttribute('transform', `translate(${R(w.c[0])} ${R(w.c[1])}) scale(${R(sx)} ${R(sy)}) translate(${R(-w.c[0])} ${R(-w.c[1])})`);
      });
      const close = CLOSE * (this.faceOutV == null ? 1 : this.faceOutV);
      if (this.faceOut) {
        if (e >= close) { this.faceOut.remove(); this.faceOut = null; }
        else { const k = e / close; set(this.faceOut, this.faceOutV * (1 - k * k)); }
      }
      const f = this.faceEl;
      if (!f || this.faceT0 == null) return;
      if (e < close) { f.setAttribute('visibility', 'hidden'); this.faceV = 0; return; }
      f.removeAttribute('visibility');
      const q = clamp((e - close) / OPEN, 0, 1);
      if (q >= 1) { set(f, null); this.faceV = 1; this.faceT0 = null; return; }
      // a stepped stage shows shut, then most of the way open, then open; elsewhere the eyes open a touch past full
      const x = q - 1;
      this.faceV = fps ? 1 - x * x : 1 + 2.4 * x * x * x + 1.4 * x * x;
      set(f, this.faceV);
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

    /* ------------------------------------------------------------ sound */
    sfx(ev, o) {
      const S = snd(); if (!S) return;
      // a scene change lowers and lifts several props at once: one sound for the moment, not six
      const gap = { lower: .12, lift: .16, land: .1, ghost: .12, sparkle: .15, hop: .2 }[ev];
      if (gap) { this.sfxT = this.sfxT || {}; if (this.t - (this.sfxT[ev] || -9) < gap) return; this.sfxT[ev] = this.t; }
      o = Object.assign({}, o || {});
      if (o.x != null) { o.pan = R(clamp(o.x / this.L.w * 2 - 1, -1, 1) * .8); delete o.x; }
      try { S.play(ev, o); } catch (e) { /* sound never stops the stage */ }
    }
    loopSnd(name, level) {
      level = R(level);
      if (this.loops[name] === level) return;
      this.loops[name] = level;
      const S = snd(); if (S && S.loop) try { S.loop(name, level); } catch (e) { /* ignore */ }
    }
    // the window opened or closed: ambience and loops follow
    setActive(on) {
      this.active = on;
      this.loopSnd('bed', on ? 1 : 0);
      if (!on) ['snore', 'work', 'power', 'swing'].forEach((n) => this.loopSnd(n, 0));
    }

    /* ----------------------------------------------------------- props */
    addProp(spec, instant) {
      const P = PW.PROPS[spec.kind];
      if (!P) return null;
      const g = el('g', { class: 'pst-prop', 'data-kind': spec.kind }, this.gProps);
      const pr = { spec, el: g, strs: [], state: 'in', a: 0, av: 0, len: 0, lenv: 0, ax: 0, axv: 0, scale: spec.scale || 1, sv: 0, op: 0, born: this.t, key: '', settled: !!instant };
      this.props.set(spec.id, pr);
      this.drawProp(pr);
      const tgt = this.propTarget(pr);
      pr.ax = tgt.ax; pr.len = instant ? tgt.len : 0; pr.op = instant ? tgt.op : 0;
      if (!instant) {
        pr.av = (Math.random() - .5) * this.fam.kick * 2;
        this.sfx(spec.preview ? 'ghost' : 'lower', { x: tgt.ax, len: clamp(tgt.len, 0, 400) });
      }
      return pr;
    }
    drawProp(pr) {
      const key = JSON.stringify(pr.spec.params || {}) + '|' + pr.spec.kind;
      if (key === pr.key) return;
      pr.key = key;
      const d = PW.PROPS[pr.spec.kind](this.pen, pr.spec.params || {});
      pr.el.innerHTML = d.svg;
      pr.ties = d.ties; pr.foot = d.foot;
      const n = d.ties.length;
      while (pr.strs.length < n) pr.strs.push(el('path', { class: 'pst-pstrl', fill: 'none' }, this.gPropStr));
      while (pr.strs.length > n) pr.strs.pop().remove();
      const w = this.w, f = this.famName;
      const col = f === 'glass' ? (w.scheme === 'dark' ? 'rgba(246,248,252,.5)' : 'rgba(12,15,21,.38)') : f === 'basic' ? w.line : f === 'retro' ? (this.tube === 'phosphor' ? w.mid : '#5B544A') : f === 'nier' ? w.ink : TH[this.theme].str;
      pr.strs.forEach((p) => { p.setAttribute('stroke', col); p.setAttribute('stroke-width', f === 'retro' ? 1.8 : f === 'nier' ? 1 : f === 'basic' ? 1.5 : 2); if (f === 'basic') p.setAttribute('stroke-opacity', '.55'); });
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
      const tieY = pr.ties.reduce((m, t) => Math.min(m, t[1]), 0);
      let len = (y + tieY * sc) - Lay.anchorY;
      if (pr.spec.preview) len -= 26 * Lay.propScale;
      if (pr.state === 'out') len = -10;
      return { ax: x, len, op: pr.state === 'out' ? 0 : pr.spec.preview ? .62 : 1, tieY, sc };
    }

    /* ------------------------------------------------------ direction */
    // spec: { chapter, props:[{id,kind,slot|at|stack,params,preview,scale,ground}], pip:{mood,look,at,pose,work,power,tilt}, say, target, label, cmd }
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
          if (wasPreview && !ps.preview) { pr.settled = false; this.sfx('lower', { x: pr.ax, len: clamp(pr.len, 0, 400) }); }
        }
      });
      this.props.forEach((pr, id) => { if (!ids.has(id) && pr.state !== 'out') { pr.state = 'out'; pr.av += this.fam.kick * .6; if (!pr.spec.preview) this.sfx('lift', { x: pr.ax }); } });
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
      this.loopSnd('work', this.work ? 1 : 0);
      this.loopSnd('power', Math.min(1, this.power / 2));
      // a new screen's line starts at once; changes within a screen take their turn (see say)
      const fresh = spec.sayNow || (spec.screen != null && spec.screen !== this.lastScreen); this.lastScreen = spec.screen;
      if (spec.say !== undefined && !this.sleepZ) this.say(spec.say, null, fresh);
      this.hudTarget(spec.target, spec.label);
      if (this.tube) this.cmd(spec.cmd || null);
      if (this.famName === 'nier' && this.hudEl && spec.label) this.decode(spec.label);
    }
    setChapter(ch) {
      const prev = this.chapter;
      this.chapter = ch;
      const tint = this.w.chapter && this.w.chapter[ch];
      if (tint) this.root.style.setProperty('--st-tint', tint);
      const lab = this.hudEl && this.hudEl.querySelector('.pst-term-ch');
      if (lab) lab.textContent = this.tube === 'teletype' ? `PAGE ${String(CHAPTER_N[ch] + 1).padStart(2, '0')}` : `[ ${CHAPTER_NAMES[ch].toUpperCase()} ]`;
      if (!prev) return;
      this.sfx('chapter', { chapter: CHAPTER_N[ch] });
      if (this.reduced) return;
      const f = this.famName, again = (node, cls) => { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); };
      if (f === 'nier') { this.sliceT = this.t; this.quest(CHAPTER_NAMES[ch]); setTimeout(() => this.sfx('slice'), 40); }
      if (f === 'glass') again(this.root, 'pst-sweep');
      if (this.tube === 'phosphor') { this.screen.classList.remove('pst-on'); again(this.screen, 'pst-degauss'); setTimeout(() => this.sfx('degauss'), 30); }
      if (this.tube === 'teletype') this.feedPaper(2);
      if (f === 'friendly' || f === 'basic') this.hop(.6);
    }
    // a transient expression, then back to the scene's own
    feel(mood, ms) { this.moodOverride = mood; this.moodUntil = this.t + (ms || 1200) / 1000; }
    hop(k) { if (this.reduced || this.fam.noHop) return; this.ps.dyv -= 210 * (k || 1); this.sfx('hop', { x: this.ps.C.x }); }
    nod() { if (this.reduced) return; this.ps.tiltv += 2.4; }
    // the moment a choice lands: the prop pops, Pip is pleased, the world celebrates in its own way
    cheer(propId, opts) {
      opts = opts || {};
      const pr = propId && this.props.get(propId);
      this.feel(opts.mood || 'happy', opts.hold || 1400);
      // a block still being lowered: Pip is pleased now, the sound and the flourish wait for its touchdown
      if (pr && pr.spec.ground && !pr.landed && !this.reduced) { pr.onLand = () => { this.cheerAt(pr, opts); if (opts.then) opts.then(); }; return; }
      this.cheerAt(pr, opts);
      if (opts.then) opts.then();
    }
    cheerAt(pr, opts) {
      const at = pr ? this.propCentre(pr) : this.headCentre();
      this.sfx(opts.sound || 'cheer', { x: at[0], index: opts.index, count: opts.count });
      if (this.famName === 'nier') { this.ps.tiltv -= 1.2; } else this.hop(.8);
      if (pr && !this.reduced && !pr.spec.ground) { pr.sv -= 2.2; pr.av += this.fam.kick * .8; }
      if (this.tube) this.ok();
      if (this.reduced) { if (this.famName === 'nier') this.lockOn(pr); return; }
      const f = this.famName;
      if (f === 'friendly') this.burst(at, ['star', 'heart', 'dot'], 12);
      else if (f === 'glass') this.burst(at, ['glint', 'bubble'], 10);
      else if (f === 'basic') this.badge(pr, at);
      else if (this.tube === 'phosphor') this.burst(at, ['pix', 'glyph'], 14);
      else if (this.tube === 'teletype') this.burst(at, ['print', 'chad'], 12);
      else if (f === 'nier') { this.lockOn(pr); this.burst(at, ['nsq'], 10); }
      if (f !== 'nier' && f !== 'basic') setTimeout(() => this.sfx('sparkle', { x: at[0] }), 90);
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
      if (this.tube) this.boot();
      clearTimeout(this.wakeT);
      if (this.off) this.off();
      // a real arrival only: the browser's own pointer event on load, or a pointer at rest, does not count
      const t0 = performance.now();
      let travel = 0;
      const up = (e) => {
        if (!this.sleepZ) return;
        if (e && e.type === 'pointermove') { travel += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0); if (performance.now() - t0 < 900 || travel < 24) return; }
        clearTimeout(this.wakeT); off();
        this.feel('alert', 650);
        this.sfx('wake');
        this.wakeT = setTimeout(() => {
          this.sleepZ = false;
          this.direct(this.spec);
          this.feel('happy', 1600);
          setTimeout(() => { this.hop(.5); if (this.spec.wakeSay) this.say(this.spec.wakeSay, 'happy'); }, this.reduced ? 0 : 450);
        }, this.reduced ? 0 : 650);
      };
      const off = () => { document.removeEventListener('pointermove', up); document.removeEventListener('keydown', up); };
      document.addEventListener('pointermove', up); document.addEventListener('keydown', up);
      this.off = off;
      this.wakeT = setTimeout(up, this.reduced ? 200 : 3200);
    }

    /* ---------------------------------------------------------- speech */
    /* Pip types its line at the pace its voice speaks it (sound.js), in every look. Every line is typed, never
       swapped in whole: the bubble takes the whole line's size first and the letters arrive in place, so
       nothing jumps. Lines that come faster than Pip could say them (a name being typed, a quick change of
       mind) wait: Pip says the one you settle on, once things are still for a moment, and a line it has
       started stays up long enough to read. */
    say(text, mood, now) {
      const b = this.bubble;
      text = text || '';
      clearTimeout(this.sayT);
      if (!text || now) { this.sayNext = null; if (text !== this.saying || !b.classList.contains('on')) this.sayNow(text, mood); return; }
      if (text === this.saying && b.classList.contains('on')) { this.sayNext = null; return; }
      const tn = performance.now(), calm = tn - (this.sayCall || 0) > 380;
      this.sayCall = tn;
      const shown = tn - (this.sayAt || 0), open = b.classList.contains('on');
      // the first line, or one after a calm moment, starts at once; otherwise it waits its turn
      const wait = !open ? 0 : Math.max(calm ? 0 : 380, (this.minShow || 0) - shown);
      if (wait <= 0) { this.sayNow(text, mood); return; }
      this.sayNext = [text, mood];
      this.sayT = setTimeout(() => { const n = this.sayNext; this.sayNext = null; if (n) this.sayNow(n[0], n[1]); }, wait);
    }
    sayNow(text, mood) {
      const b = this.bubble, S = snd();
      clearInterval(this.typeT);
      this.saying = text;
      if (!text) { b.classList.remove('on', 'typing'); if (S && S.hush) S.hush(); return; }
      if (!b.classList.contains('on')) { b.classList.remove('on'); void b.offsetWidth; b.classList.add('on'); }
      let r = null;
      if (S && S.say) try { r = S.say(text, { mood: mood || (this.spec.pip && this.spec.pip.mood) || 'idle', kit: S.kitOf ? S.kitOf(this.theme) : undefined }); } catch (e) { r = null; }
      const cps = (r && r.cps) || this.fam.cps;
      this.sayAt = performance.now(); this.sayMs = text.length / cps * 1000;
      this.minShow = Math.min(1400, 450 + text.length / cps * 1000 * .6);
      this.btext.innerHTML = '<span class="pst-bt-on"></span><span class="pst-bt-off"></span>';
      const on = this.btext.firstChild, off = this.btext.lastChild;
      if (this.reduced) { on.textContent = text; b.classList.remove('typing'); return; }
      let i = 0; off.textContent = text; b.classList.add('typing');
      const t0 = performance.now();
      this.typeT = setInterval(() => {
        const n = Math.min(text.length, Math.floor((performance.now() - t0) / 1000 * cps) + 1);
        if (n !== i) { i = n; on.textContent = text.slice(0, i); off.textContent = text.slice(i); }
        if (i >= text.length) { clearInterval(this.typeT); b.classList.remove('typing'); }
      }, 16);
    }

    /* ------------------------------------------------------------- tips */
    // a tip Pip writes out when asked (the ? beside a choice): t = { title, text }, or null to put it away
    tip(t, instant) {
      const key = t ? t.title + '\n' + t.text : '';
      if (key === (this.tipKey || '')) return;
      clearInterval(this.tipW);
      this.tipKey = key; this.tipData = t || null; this.tipLook = 0;
      const el = this.tipEl();
      if (!t) { if (el) el.classList.remove('on', 'typing'); return; }
      this.showTip(instant);
    }
    tipEl() { return this.overlay && this.overlay.querySelector('.pst-tip, .pst-ntip'); }
    showTip(instant) {
      clearInterval(this.tipW);
      const el = this.tipEl(), t = this.tipData;
      if (!el || !t) return;
      // NieR: QUEST UPDATED gives way to a tip asked for
      const q = this.hudEl && this.hudEl.querySelector('.pst-nquest'); if (q) q.classList.remove('on');
      el.querySelector('.pst-tip-h').textContent = t.title;
      el.querySelector('.pst-tip-sr').textContent = t.text;
      const tx = el.querySelector('.pst-tip-t');
      tx.innerHTML = '<span class="pst-bt-on"></span><span class="pst-bt-off"></span>';
      const on = tx.firstChild, off = tx.lastChild;
      this.tipRect = null;
      if (instant || this.reduced) { el.classList.add('on'); el.classList.remove('typing'); on.textContent = t.text; return; }
      el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
      this.sfx('tip');
      // Pip is pleased to be asked, and reads along while it writes
      const cps = this.tube ? 60 : this.famName === 'nier' ? 55 : 44;
      this.tipLook = this.t + Math.min(3, t.text.length / cps);
      this.feel(this.famName === 'nier' ? 'alert' : 'happy', 900); this.nod(); this.busy();
      let i = 0; off.textContent = t.text; el.classList.add('typing');
      const t0 = performance.now();
      this.tipW = setInterval(() => {
        const n = Math.min(t.text.length, Math.floor((performance.now() - t0) / 1000 * cps) + 1);
        if (n !== i) { i = n; on.textContent = t.text.slice(0, i); off.textContent = t.text.slice(i); }
        if (i >= t.text.length) { clearInterval(this.tipW); el.classList.remove('typing'); }
      }, 16);
    }
    // where the note is, in stage units (for Pip's eyes)
    tipAt() {
      const el = this.tipEl(), m = this.map;
      if (!el || !m || !this.box || !el.classList.contains('on')) return null;
      let x, y;
      if (el === this.tipBox && this.tipXY) { x = this.tipXY[0] + 40; y = this.tipXY[1] + 24; }
      else { const r = this.tipRect || (this.tipRect = el.getBoundingClientRect()); x = r.left - this.box.left + 40; y = r.top - this.box.top + 24; }
      return [(x - m.ox) / m.k, (y - m.oy) / m.k];
    }
    // the note hangs under Pip and drifts after it, slowly enough to read while Pip sways
    placeTip(H, ang, dt) {
      const el = this.tipBox;
      if (!el || !el.classList.contains('on') || this.layoutName !== 'portrait') { this.ps.liftT = 0; this.bubble.classList.remove('pst-hush'); return; }
      // it holds still while the pointer is on it, so its close button is easy to hit
      if (el.matches(':hover')) return;
      const p = this.toScreen(this.headXf([32, 63], H, ang, 1, 1)), w = el.offsetWidth || 180, h = el.offsetHeight || 40, bx = this.box ? this.box.width : 400, by = this.box ? this.box.height : 560;
      // under Pip, kept to the left of the stage where the props do not hang, above a tube's command line, and
      // always whole on the stage. A long note on a small stage: the hand lifts Pip to make room for it
      // always whole on the stage. A long note on a small stage: the hand lifts Pip to make room for it, as far as
      // keeps Pip's face below the top of the stage, and Pip's bubble steps aside while it does (the note is Pip talking)
      const foot = this.tube === 'teletype' ? 74 : this.tube ? 46 : 8, top = this.tube ? 16 : 8, mk = (this.map && this.map.k) || 1;
      const lifted = (this.ps.lift || 0) * mk, restY = p[1] + lifted, headTop = this.toScreen(this.headXf([32, 31.5], H, ang, 1, 1))[1] + lifted;
      const short = restY + 12 + h - (by - foot), room = Math.max(0, headTop - top - 4);
      this.ps.liftT = clamp(short, 0, room) / mk;
      this.bubble.classList.toggle('pst-hush', this.ps.liftT * mk > 18);
      const goal = [clamp(p[0] - w * .4, 8, Math.max(8, Math.min(bx * .62 - w, bx - w - 10))), clamp(p[1] + 12, 8, by - h - foot)];
      if (!this.tipXY || this.reduced) this.tipXY = goal.slice();
      const k = Math.min(1, (dt || .016) * 5); this.tipXY[0] += (goal[0] - this.tipXY[0]) * k; this.tipXY[1] += (goal[1] - this.tipXY[1]) * k;
      el.style.transform = `translate(${R(this.tipXY[0])}px, ${R(this.tipXY[1])}px)`;
      el.style.setProperty('--tx', R(clamp(p[0] - this.tipXY[0], 14, w - 14)) + 'px');
    }

    /* ------------------------------------------------- Retro: the terminal */
    // the command line at the foot of the tube types what the scene is doing
    cmd(text) {
      if (!this.hudEl || text === this.cmdText) return;
      this.cmdText = text;
      const inp = this.hudEl.querySelector('.pst-term-in'), ok = this.hudEl.querySelector('.pst-term-ok');
      if (!inp) return;
      clearInterval(this.cmdT);
      // the teletype: the head returns to the margin and prints the next line
      const tty = this.tube === 'teletype';
      ok.textContent = '';
      const s = text || '';
      if (this.reduced) { inp.textContent = s; this.headTo(); return; }
      let i = 0; inp.textContent = ''; this.headTo();
      if (tty && s) this.sfx('decode', { len: s.length });
      this.cmdT = setInterval(() => { i += 1; inp.textContent = s.slice(0, i); this.headTo(); if (i >= s.length) clearInterval(this.cmdT); }, tty ? 30 : 24);
    }
    // the print head sits where the next letter will land
    headTo() {
      if (!this.head || !this.hudEl) return;
      const cur = this.hudEl.querySelector('.pst-term-cur'), sh = this.screen.getBoundingClientRect();
      if (!cur || !sh.width) return;
      this.head.style.transform = `translateX(${R(cur.getBoundingClientRect().left - sh.left)}px)`;
    }
    ok() {
      const ok = this.hudEl && this.hudEl.querySelector('.pst-term-ok');
      if (!ok) return;
      ok.textContent = this.tube === 'teletype' ? '  ✓ DONE' : '  [ OK ]';
      ok.classList.remove('flash'); void ok.offsetWidth; ok.classList.add('flash');
      this.headTo();
    }
    // the welcome on a cold machine: a few lines of boot text, then the screen clears
    boot() {
      const pre = this.hudEl && this.hudEl.querySelector('.pst-term-boot');
      if (!pre || this.booted) return;
      this.booted = true;
      const lines = this.tube === 'teletype'
        ? ['PUPPET MASTER TELETYPE MODEL 33', 'PAPER ...... OK   RIBBON ...... OK', 'LOADING PIP ......................', '']
        : ['PUPPET MASTER BIOS v1.0', 'MEMORY TEST  640K OK', 'STRINGS      2 OK', 'LOADING PIP.SYS ......', ''];
      const all = lines.join('\n');
      if (this.reduced) { pre.textContent = ''; return; }
      let i = 0; pre.textContent = ''; pre.classList.remove('gone');
      clearInterval(this.bootT);
      this.bootT = setInterval(() => {
        i += 2; pre.textContent = all.slice(0, i);
        if (i >= all.length) { clearInterval(this.bootT); setTimeout(() => pre.classList.add('gone'), 900); }
      }, 14);
    }
    powerOn() {
      if (this.reduced) return;
      const s = this.screen;
      s.classList.remove('pst-on', 'pst-off', 'pst-degauss'); void s.offsetWidth; s.classList.add('pst-on');
      setTimeout(() => this.sfx('powerOn'), 20);
    }
    powerOff() {
      if (!this.tube || this.reduced) return;
      const s = this.screen;
      s.classList.remove('pst-on', 'pst-off'); void s.offsetWidth; s.classList.add('pst-off');
      this.sfx('powerOff');
    }
    // Paper Teletype: the platen turns and the paper feeds up a band or two
    feedPaper(n) {
      if (!this.paper) return;
      const band = +this.paper.dataset.band || 72;
      this.feed += band * (n || 1);
      if (this.feed > band * 12) { this.paper.style.transition = 'none'; this.feed -= band * 6; this.paper.style.transform = `translateY(${-(this.feed - band * (n || 1))}px)`; void this.paper.getBoundingClientRect(); }
      this.paper.style.transition = '';
      this.paper.style.transform = `translateY(${-this.feed}px)`;
      this.sfx('feed');
    }

    /* -------------------------------------------------------- NieR HUD */
    hudTarget(id, label) {
      if ((id || null) !== this.target) this.tgtT = this.t;
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
      if (goal === this.decoded) return;
      this.decoded = goal;
      let n = 0;
      clearInterval(this.decT);
      if (this.reduced) { d.textContent = goal; return; }
      this.sfx('decode');
      this.decT = setInterval(() => {
        n += 1;
        d.textContent = goal.split('').map((ch, i) => i < n / 2 || ch === ' ' ? ch : glyphs[(i * 7 + n) % glyphs.length]).join('');
        if (n / 2 >= goal.length) clearInterval(this.decT);
      }, 32);
    }
    lockOn(pr) {
      if (!pr) return;
      this.lockT = this.t;
      this.sfx('lock', { x: pr.ax });
      const lab = this.hudEl && this.hudEl.querySelector('.pst-target');
      if (lab) { lab.dataset.state = 'confirmed'; clearTimeout(this.lockTO); this.lockTO = setTimeout(() => { delete lab.dataset.state; }, 1400); }
    }
    // a chapter change in NieR: QUEST UPDATED wipes across the top of the stage
    quest(name) {
      const q = this.hudEl && this.hudEl.querySelector('.pst-nquest');
      if (!q) return;
      q.querySelector('.pst-nquest-t').textContent = name.toUpperCase();
      q.classList.remove('on'); void q.offsetWidth; q.classList.add('on');
      // and it lets go once it has wiped out again (it used to stay "on", which hid every tip after the first chapter)
      clearTimeout(this.questT); this.questT = setTimeout(() => q.classList.remove('on'), 2900);
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
        if (kind === 'pix') sh = `<rect x="-2.5" y="-2.5" width="5" height="5" fill="${i % 3 ? w.ink : w.bright}"/>`;
        if (kind === 'glyph') sh = `<text font-family="VT323, monospace" font-size="18" text-anchor="middle" dominant-baseline="central" fill="${w.bright}">${['*', '+', '#', '$', '@'][i % 5]}</text>`;
        if (kind === 'print') sh = `<text font-family="'IBM Plex Mono', monospace" font-weight="700" font-size="15" text-anchor="middle" dominant-baseline="central" fill="${i % 2 ? w.ink : w.red}">${['*', '+', '×', '✓'][i % 4]}</text>`;
        if (kind === 'chad') sh = `<circle r="3.4" fill="${w.hole}" stroke="${w.rule}" stroke-width=".8"/>`;
        if (kind === 'nsq') sh = `<rect x="-2.5" y="-2.5" width="5" height="5" fill="${w.ink}" transform="rotate(45)"/>`;
        e.innerHTML = sh;
        const nsq = kind === 'nsq', ang = nsq ? i / n * Math.PI * 2 : a;
        const p = { e, kind, x: at[0], y: at[1], vx: Math.cos(ang) * (nsq ? 150 : sp), vy: Math.sin(ang) * (nsq ? 150 : sp) - (nsq ? 0 : 60), r: nsq ? 0 : Math.random() * 6, vr: nsq ? 0 : (Math.random() - .5) * 8, life: 0, max: nsq ? .55 : .9 + Math.random() * .5, g: kind === 'bubble' ? -120 : kind === 'glint' || nsq ? 0 : 260, drag: nsq ? 5 : .8 };
        this.fx.push(p);
      }
    }
    // Basic marks a choice the way a diagram would: a check badge on the prop's corner and a ring spreading
    // from it, both riding the prop as it swings
    badge(pr, at) {
      const w = this.w, sc = pr ? this.propTarget(pr).sc : this.L.propScale;
      const off = pr ? [34 * sc, -30 * sc] : [0, -50 * sc];
      const mk = (html) => { const e = el('g', { class: 'pst-p' }, this.gFx); e.innerHTML = html; return e; };
      const ring = mk(`<circle r="11" fill="none" stroke="${w.accent}" stroke-width="1.5"/>`);
      const chk = mk(`<circle r="11" fill="${w.accent}" stroke="${w.bg}" stroke-width="2"/><path d="M-5 .5L-1.6 3.9L5.2 -3.4" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>`);
      [[ring, 'ring', .8], [chk, 'check', 1.5]].forEach(([e, kind, max]) => this.fx.push({ e, kind, x: at[0] + off[0], y: at[1] + off[1], vx: 0, vy: 0, r: 0, vr: 0, life: 0, max, g: 0, follow: pr || null, off }));
    }
    confetti(n) {
      if (this.reduced || this.famName === 'nier') return;
      this.sfx('confetti');
      const w = this.w, Lay = this.L, f = this.famName, hues = f === 'basic' ? [w.accent, w.line] : Object.values(w.hues);
      for (let i = 0; i < n; i++) {
        const e = el('g', { class: 'pst-p' }, this.gFx), c = hues[i % hues.length];
        e.innerHTML = f === 'glass' ? `<circle r="${3 + Math.random() * 5}" fill="#fff" fill-opacity=".18" stroke="#fff" stroke-opacity=".8" stroke-width="1"/>`
          : this.tube === 'phosphor' ? (i % 3 ? `<rect x="-2.5" y="-2.5" width="5" height="5" fill="${c}"/>` : `<text font-family="VT323, monospace" font-size="16" fill="${w.bright}" text-anchor="middle">${'*+$#'[i % 4]}</text>`)
          : this.tube === 'teletype' ? `<circle r="3.4" fill="${i % 4 ? w.hole : w.red}" stroke="${w.rule}" stroke-width=".8"/>`
          : `<rect x="-4" y="-2.2" width="8" height="4.4" rx="1" fill="${c}"/>`;
        this.fx.push({ e, kind: 'conf', x: Math.random() * Lay.w, y: -20 - Math.random() * Lay.h * .6, vx: (Math.random() - .5) * 30, vy: 40 + Math.random() * 60, r: Math.random() * 6, vr: (Math.random() - .5) * 6, life: 0, max: 4 + Math.random() * 2, g: f === 'glass' ? -10 : 40, sway: Math.random() * 6, drag: .8 });
      }
    }
    // a prop has come to rest: the floor answers in the world's material
    settle(pr) {
      pr.settled = true;
      if (pr.spec.preview || pr.state === 'out') return;
      const x = pr.pos ? pr.pos[0] : pr.ax;
      if (!pr.spec.stack && pr.spec.stack !== 0) this.sfx('land', { x });
      if (this.reduced) return;
      if (this.famName === 'glass') this.ripple(x);
    }
    ripple(x, y, big) {
      const Lay = this.L, yy = y == null ? Lay.ground : y, e = el('ellipse', { cx: R(x), cy: R(yy), rx: 4, ry: 1, fill: 'none', stroke: '#fff', 'stroke-width': 1.2 }, this.gRipple);
      this.fx.push({ e, kind: 'ripple', x, y: yy, vx: 0, vy: 0, r: 0, vr: 0, life: 0, max: big === false ? .9 : 1.4, g: 0, drag: 0, small: big === false });
    }
    // a block set down on the stack: it takes its weight with a little squash, the ones beneath give a touch, the
    // world answers in its material, and the moment's sound and flourish (if one waited) play now
    touchdown(pr) {
      if (!this.reduced) {
        pr.sqv = (pr.sqv || 0) + 2.2;
        this.props.forEach((o) => { if (o !== pr && o.spec.ground && o.landed && o.spec.stack < pr.spec.stack) o.sqv = (o.sqv || 0) + 1.1 * Math.pow(.5, pr.spec.stack - o.spec.stack - 1); });
        const sc = this.propTarget(pr).sc, x = pr.pos ? pr.pos[0] : pr.ax, y = (pr.pos ? pr.pos[1] : this.L.ground) + pr.foot * sc, f = this.famName;
        if (f === 'glass') this.ripple(x, y, false);
        else if (f === 'friendly') this.burst([x, y], ['dot'], 5);
        else if (this.tube === 'phosphor') this.burst([x, y], ['pix'], 4);
        else if (this.tube === 'teletype') this.burst([x, y], ['chad'], 3);
      }
      if (pr.onLand) { const fn = pr.onLand; pr.onLand = null; fn(); }
    }

    /* --------------------------------------------------------- geometry */
    measure() {
      const r = this.screen.getBoundingClientRect(), Lay = this.L;
      this.box = r;
      const k = this.tube ? Math.max(r.width / Lay.w, r.height / Lay.h) : Math.min(r.width / Lay.w, r.height / Lay.h);
      this.map = { k, ox: (r.width - Lay.w * k) / 2, oy: (r.height - Lay.h * k) / 2 };
      this.headTo();
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
      this.life(dt);
      // Retro's tube refreshes in steps; the phosphor holds what was there a moment longer
      const fps = this.frameRate();
      if (fps && !this.reduced) { if (this.t - this.frameT < 1 / fps) return; this.frameT = this.t; }
      this.render();
    }
    // how often the stage is drawn: every frame, but Retro in steps (Retro Light, paper, at half Retro Dark's rate,
    // a flipbook of printouts)
    frameRate() { return this.reduced ? 0 : this.tube === 'teletype' ? 10 : this.fam.fps || 0; }
    // Pip's idle life: now and then it looks up at the bar, kicks its feet, wiggles or glances round
    life(dt) {
      if (this.reduced || this.sleepZ) return;
      const quiet = this.t - (this.busyT || 0) > 3.5;
      if (this.t > this.idleNext && quiet) {
        this.idleNext = this.t + 7 + Math.random() * 6;
        // glances (up at the bar, or to one side) only while there is no pointer to look at: once Pip has seen the
        // pointer it keeps its eyes on where it last was
        // (no face changes here: a wink with no reason read as random)
        const ps = this.ps, f = this.famName, acts = ['wiggle'].concat(f !== 'nier' ? ['swing'] : [], pointer.t > 0 ? [] : ['up', 'side']);
        const pick = acts[Math.floor(Math.random() * acts.length)];
        if (pick === 'up') { this.idleLook = [0, -2.4]; this.idleUntil = this.t + 1.3; this.ps.tiltv -= .8; }
        else if (pick === 'swing') { ps.thv += (Math.random() > .5 ? 1 : -1) * .5; this.sfx('swing', { x: ps.C.x, intensity: .35 }); }
        else if (pick === 'wiggle') ps.tiltv += (Math.random() > .5 ? 1 : -1) * 3;
        else { this.idleLook = [Math.random() > .5 ? 2.2 : -2.2, .3]; this.idleUntil = this.t + 1.1; }
      }
      if (this.idleLook && this.t > this.idleUntil) this.idleLook = null;
    }
    step(dt) {
      const ps = this.ps, F = this.fam, Lay = this.L, red = this.reduced;
      // the hand: springs to its spot, with a slow idle drift that keeps Pip alive
      const swayX = red ? 0 : F.sway * Math.sin(this.t * F.swayW) * (ps.asleep ? .2 : 1);
      const swayY = red || !F.bob ? 0 : F.bob * .6 * Math.sin(this.t * F.swayW * 1.7);
      ps.lift = (ps.lift || 0) + ((ps.liftT || 0) - (ps.lift || 0)) * Math.min(1, dt * 5);
      const tx = ps.Ct.x + swayX, ty = ps.Ct.y + swayY - ps.lift;
      if (red) { ps.C.x = tx; ps.C.y = ty; ps.C.vx = ps.C.vy = 0; ps.th = 0; ps.thv = 0; }
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
          const axA = F.pk * (tg.ax - pr.ax) - F.pc * pr.axv; pr.axv += axA * dt; pr.ax += pr.axv * dt;
          // a block set on the stack is lowered, not dropped: a softer, critically damped spring, so it slows into
          // its place and never bounces through the block beneath
          const gr = pr.spec.ground, lk = gr ? Math.max(40, F.pk * .5) : F.pk, lc = gr ? 2.1 * Math.sqrt(lk) : F.pc;
          const lA = lk * (tg.len - pr.len) - lc * pr.lenv; pr.lenv += lA * dt; pr.len += pr.lenv * dt;
          const Lp = Math.max(30, pr.len);
          const aA = -(F.pw * F.pw) * Math.sin(pr.a) * (170 / Lp) - F.pdamp * pr.av - (axA / Lp) * Math.cos(pr.a);
          pr.av += aA * dt; pr.a += pr.av * dt;
          // and it is steadied as it nears its place, so it arrives level instead of being straightened on arrival
          if (gr && !pr.landed) { const q = clamp(1 - (tg.len - pr.len) / 110, 0, 1) ** 2; pr.av *= Math.max(0, 1 - dt * 9 * q); pr.a *= Math.max(0, 1 - dt * 2.5 * q); }
          if (gr && pr.landed) { pr.a *= Math.max(0, 1 - dt * 6); pr.av *= Math.max(0, 1 - dt * 6); }
          // a squash at the foot when it takes weight (touchdown, or a block landing on top)
          const qA = -340 * (pr.sq || 0) - 17 * (pr.sqv || 0); pr.sqv = (pr.sqv || 0) + qA * dt; pr.sq = (pr.sq || 0) + pr.sqv * dt;
          const sA = 260 * ((pr.spec.scale || 1) - pr.scale) - 16 * pr.sv; pr.sv += sA * dt; pr.scale += pr.sv * dt;
          pr.op += (tg.op - pr.op) * Math.min(1, dt * 8);
        }
        if (!pr.settled && pr.state !== 'out' && Math.abs(pr.len - tg.len) < 2.5 && Math.abs(pr.lenv) < 30) this.settle(pr);
        if (pr.spec.ground && !pr.landed && (red || (Math.abs(pr.len - tg.len) < 1.6 && Math.abs(pr.lenv) < 22))) { pr.landed = true; pr.landT = this.t; this.touchdown(pr); }
        if (pr.state === 'out' && pr.len < 0 && (red || pr.op < .05)) { pr.el.remove(); pr.strs.forEach((s) => s.remove()); this.props.delete(id); }
      });
      // particles
      for (let i = this.fx.length - 1; i >= 0; i--) {
        const p = this.fx[i]; p.life += dt;
        if (p.life >= p.max) { p.e.remove(); this.fx.splice(i, 1); continue; }
        if (p.follow) { if (p.follow.pos) { p.x = p.follow.pos[0] + p.off[0]; p.y = p.follow.pos[1] + p.off[1]; } continue; }
        p.vy += p.g * dt; p.x += (p.vx + (p.sway ? Math.sin(this.t * 2 + p.sway) * 20 : 0)) * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        const k = Math.max(0, 1 - dt * (p.drag || 0)); p.vx *= k; if (p.drag > 1) p.vy *= k;
      }
    }
    render() {
      const ps = this.ps, Lay = this.L, f = this.famName;
      // mood: a transient feeling wins over the scene's own
      if (this.moodOverride && this.t > this.moodUntil) this.moodOverride = null;
      const base = (this.spec.pip && this.spec.pip.mood) || 'idle';
      const mood = this.sleepZ ? 'sleep' : (this.moodOverride || base);
      this.renderHead(mood);
      this.animFace();
      let H = this.headAt(ps.C.x, ps.C.y, ps.th, ps.dy);
      let ang = ps.th * .9 + ps.tilt;
      // NieR hovers: a slow bob and a little drift of the visor
      if (this.fam.bob && !this.reduced) { H = [H[0], H[1] + Math.sin(this.t * 1.35) * this.fam.bob * Lay.s / 2.6]; ang += Math.sin(this.t * .9) * .025; }
      // asleep: the head rests on the floor and the strings go slack
      const headH = 28 * Lay.s;
      if (H[1] + headH > Lay.ground - 2) { H = [H[0], Lay.ground - 2 - headH]; }
      this.H = H; this.ang = ang;
      // breathing: Pip's head swells a touch, slower when it sleeps
      const br = this.reduced ? 0 : (this.fam.breathe || 0) * Math.sin(this.t * (this.sleepZ ? 1.5 : 2.2));
      const sx = ps.sx * (1 - br * .4), sy = ps.sy * (1 + br), s = Lay.s;
      this.gCtl.setAttribute('transform', `translate(${R(ps.C.x)} ${R(ps.C.y)}) rotate(${R(ps.phi * 57.3)}) scale(${s}) translate(-32 -14.5)`);
      this.gHead.setAttribute('transform', `translate(${R(H[0])} ${R(H[1])}) rotate(${R(ang * 57.3)}) scale(${s}) translate(-32 -31.5) translate(32 59.5) scale(${R(sx)} ${R(sy)}) translate(-32 -59.5)`);
      const ends = this.solveStrings({ C: ps.C, phi: ps.phi, H, ang, sx, sy });
      ends.forEach((e, i) => {
        const l = Math.hypot(e.E[0] - e.T[0], e.E[1] - e.T[1]), slack = Math.max(0, (this.restLen[i] || l) - l);
        const d = slack > 1 ? `M${R(e.T[0])} ${R(e.T[1])}Q${R((e.T[0] + e.E[0]) / 2 + (i ? 1 : -1) * slack * .25)} ${R((e.T[1] + e.E[1]) / 2 + slack * .55)} ${R(e.E[0])} ${R(e.E[1])}` : `M${R(e.T[0])} ${R(e.T[1])}L${R(e.E[0])} ${R(e.E[1])}`;
        this.pstrs[i].setAttribute('d', d); this.pglow[i].setAttribute('d', d);
      });
      // where the eyes look: at the target prop, at an idle glance, or at the pointer
      const pip = this.spec.pip || {};
      let look = [0, 0];
      const tgt = pip.look && this.props.get(pip.look);
      const hc = this.headCentre();
      const atTarget = (p) => { const vx = p[0] - hc[0], vy = p[1] - hc[1], l = Math.hypot(vx, vy) || 1; return [vx / l * 2.2, vy / l * 1.5]; };
      const tipP = this.tipLook > this.t && !this.reduced ? this.tipAt() : null;
      if (tipP) look = atTarget(tipP);
      else if (this.idleLook) look = this.idleLook;
      else if (Array.isArray(pip.look)) look = pip.look;
      else if (tgt && tgt.pos && this.t - (this.busyT || -9) < 2.5) look = atTarget(tgt.pos);
      // the pointer, or where it was last seen (a pointer that leaves the window is not forgotten)
      else if (!this.reduced && this.box && pointer.t > 0) {
        // the pointer, in stage units
        const m = this.map || { k: 1, ox: 0, oy: 0 }, px = (pointer.x - this.box.left - m.ox) / m.k, py = (pointer.y - this.box.top - m.oy) / m.k;
        const vx = px - hc[0], vy = py - hc[1], l = Math.hypot(vx, vy) || 1, k = Math.min(1, l / 120);
        look = [vx / l * 2.3 * k, vy / l * 1.6 * k];
      } else if (tgt && tgt.pos) look = atTarget(tgt.pos);
      ps.lookT = look;
      if (this.eyesEl) this.eyesEl.setAttribute('transform', `translate(${R(ps.look[0])} ${R(ps.look[1])})`);
      // blink
      if (this.blinkEl && !this.reduced) {
        if (this.t > ps.nextBlink) { ps.blinkAt = this.t; ps.nextBlink = this.t + 2.2 + Math.random() * 3.4; }
        const b = ps.blinkAt != null ? this.t - ps.blinkAt : 9, k = b < .16 ? Math.max(.1, Math.abs(1 - b / .08)) : 1;
        this.blinkEl.setAttribute('transform', `translate(0 ${this.blinkY}) scale(1 ${R(k)}) translate(0 ${-this.blinkY})`);
      }
      // props
      this.props.forEach((pr) => {
        const tg = this.propTarget(pr), sc = tg.sc * (pr.scale / (pr.spec.scale || 1));
        const tieMid = [pr.ties.reduce((m, t) => m + t[0], 0) / pr.ties.length, tg.tieY];
        const hang = [pr.ax + Math.sin(pr.a) * Math.max(0, pr.len), Lay.anchorY + Math.cos(pr.a) * Math.max(0, pr.len)];
        const cv = rot([-tieMid[0] * sc, -tieMid[1] * sc], pr.a);
        pr.pos = [hang[0] + cv[0], hang[1] + cv[1]];
        const sq = this.reduced ? 0 : clamp(pr.sq || 0, -.12, .12), squash = Math.abs(sq) > .002 ? ` translate(0 ${R(pr.foot)}) scale(${R(1 + sq * .6)} ${R(1 - sq)}) translate(0 ${R(-pr.foot)})` : '';
        pr.el.setAttribute('transform', `translate(${R(hang[0])} ${R(hang[1])}) rotate(${R(pr.a * 57.3)}) scale(${R(sc)}) translate(${R(-tieMid[0])} ${R(-tieMid[1])})${squash}`);
        pr.el.setAttribute('opacity', R(pr.op));
        // once a block is set down its strings are unhooked: they go slack, lift away and fade
        const off = pr.spec.ground && pr.landed ? clamp((this.t - pr.landT) / .55, 0, 1) : 0;
        const strOp = off ? Math.max(0, 1 - ease(off)) * pr.op : pr.op;
        pr.ties.forEach((t, i) => {
          const v = rot([(t[0] - tieMid[0]) * sc, (t[1] - tieMid[1]) * sc], pr.a), end = [hang[0] + v[0], hang[1] + v[1] - ease(off) * 70];
          const top = [pr.ax + (t[0] - tieMid[0]) * sc, Lay.anchorY - 200];
          pr.strs[i].setAttribute('d', `M${R(top[0])} ${R(top[1])}L${R(end[0])} ${R(end[1])}`);
          pr.strs[i].setAttribute('opacity', R(strOp));
          pr.strs[i].classList.toggle('pst-dash', !!pr.spec.preview);
        });
      });
      // particles
      this.fx.forEach((p) => {
        const k = p.life / p.max;
        if (p.kind === 'ripple') { const e = ease(k), m = p.small ? .45 : 1; p.e.setAttribute('rx', R(6 + e * 90 * m)); p.e.setAttribute('ry', R(1.5 + e * 12 * m)); p.e.setAttribute('stroke-opacity', R((1 - k) * .7)); return; }
        const op = p.kind === 'conf' ? (k > .85 ? (1 - k) / .15 : 1) : p.kind === 'check' ? (k < .75 ? 1 : (1 - k) / .25) : p.kind === 'ring' ? (1 - k) * .9 : 1 - k * k;
        const sc = p.kind === 'ring' ? 1 + ease(k) * 2.2 : p.kind === 'check' ? (k < .1 ? k / .1 * 1.18 : k < .18 ? 1.18 - (k - .1) / .08 * .18 : 1) : 1;
        p.e.setAttribute('transform', `translate(${R(p.x)} ${R(p.y)}) rotate(${R(p.r * 57.3 / 6)}) scale(${R(sc)})`);
        p.e.setAttribute('opacity', R(Math.max(0, op)));
      });
      // sleeping z's
      if (this.sleepZ && !this.reduced && this.t - (this.lastZ || 0) > .9 && f !== 'nier') {
        this.lastZ = this.t;
        const e = el('g', { class: 'pst-p' }, this.gFx);
        const font = this.tube === 'phosphor' ? 'VT323, monospace' : this.tube ? "'IBM Plex Mono', monospace" : 'system-ui,sans-serif';
        e.innerHTML = `<text font-family="${font}" font-weight="800" font-size="${this.tube ? 22 : 16}" fill="${this.w.text}">z</text>`;
        this.fx.push({ e, kind: 'z', x: hc[0] + 40, y: hc[1] - 30, vx: 14, vy: -26, r: 0, vr: .4, life: 0, max: 2, g: 0 });
      }
      // soft shadows on the floor: Pip's and each prop's, smaller and fainter the higher they hang
      if (f === 'friendly' || f === 'glass') {
        const sh = (x, y, r) => { const h = Math.max(0, Lay.ground - y), k = clamp(1 - h / (Lay.h * .9), .25, 1); return `<ellipse cx="${R(x)}" cy="${Lay.ground + 2}" rx="${R(r * (.6 + k * .5))}" ry="${R(r * .13 * (.6 + k * .5))}" fill="${this.w.shadow}" opacity="${R(k * .7)}"/>`; };
        let out = sh(H[0], H[1] + 64 * Lay.s / 2.6, 46 * Lay.s / 2.6);
        this.props.forEach((pr) => { if (pr.pos) out += sh(pr.pos[0], pr.pos[1] + pr.foot * (pr.spec.scale || 1) * Lay.propScale, 40 * (pr.spec.scale || 1) * Lay.propScale * pr.op); });
        this.gShadow.innerHTML = out;
      }
      // Basic measures: a plumb line from Pip to the floor and a marker riding the ruler
      // and a protractor under the hand that reads Pip's swing, its marker on the angle of the string
      if (f === 'basic') {
        const c = this.w.accent, ln = this.w.line, x = R(hc[0]), y0 = R(H[1] + 30 * Lay.s);
        const r = Lay.rope * .52, cx = ps.C.x, cy = ps.C.y, A = (d) => d / 57.3, P = (q, rr) => `${R(cx + Math.sin(q) * rr)} ${R(cy + Math.cos(q) * rr)}`;
        let tk = '';
        for (let d = -30; d <= 30; d += 5) tk += `M${P(A(d), r)}L${P(A(d), r + (d % 15 ? 3.5 : 7))}`;
        const th = clamp(ps.th, -A(34), A(34)), deg = ps.th * 57.3, lab = `${deg < -.05 ? '−' : ''}${Math.abs(deg).toFixed(1)}°`;
        const m = (q, rr) => [cx + Math.sin(q) * rr, cy + Math.cos(q) * rr], tip = m(th, r - 1), b1 = m(th - .045, r - 9), b2 = m(th + .045, r - 9), lp = m(A(-38), r + 4);
        this.gShadow.innerHTML = `<path d="M${P(A(-30), r)}A${R(r)} ${R(r)} 0 0 0 ${P(A(30), r)}${tk}" fill="none" stroke="${ln}" stroke-opacity=".28" stroke-width="1"/>`
          + `<path d="M${R(cx)} ${R(cy)}L${P(0, r + 7)}" stroke="${ln}" stroke-opacity=".18" stroke-dasharray="2 3"/>`
          + `<path d="M${R(tip[0])} ${R(tip[1])}L${R(b1[0])} ${R(b1[1])}L${R(b2[0])} ${R(b2[1])}Z" fill="${c}"/>`
          + (Lay.w > 300 ? `<text x="${R(lp[0])}" y="${R(lp[1])}" text-anchor="end" font-family="'Inter',system-ui,sans-serif" font-size="9" font-weight="600" fill="${ln}" opacity=".55">θ ${lab}</text>` : '')
          + `<path d="M${x} ${y0}V${Lay.ground - 6}" stroke="${ln}" stroke-opacity=".22" stroke-dasharray="2 4"/><path d="M${x} ${Lay.ground + 1}l-5 8h10z" fill="${c}"/><text x="${x}" y="${Lay.ground + 22}" text-anchor="middle" font-family="'Inter',system-ui,sans-serif" font-size="9" font-weight="600" fill="${ln}" opacity=".55">${Math.round(hc[0])}</text>`;
      }
      // Retro: the vector terrain rolls toward you, and the phosphor remembers where Pip was
      if (this.gTerrain && !this.reduced) {
        const T = this.terrain, ph = (this.t * .55) % 1, D = T.H - T.vy;
        let d = '';
        for (let k = 1; k < 16; k++) { const z = k - ph + .6, y = T.vy + D / (z * z * .45 + .2); if (y > T.vy + 1 && y < T.H) d += `M-400 ${R(y)}H${Lay.w + 400}`; }
        this.gTerrain.setAttribute('d', d); this.gTerrain.setAttribute('stroke-opacity', '.32');
      }
      if (this.tube === 'phosphor') this.persist();
      // NieR: target brackets, a leader line and the lock; the glitch on a chapter change
      if (f === 'nier') { this.renderBrackets(); this.renderSlice(); }
      // the speech bubble follows Pip (NieR's dialogue box sits at the foot of the stage instead)
      if (f !== 'nier') this.placeBubble(H, ang);
      if (this.tipBox) this.placeTip(H, ang, this.t - (this.tipLast || this.t)); this.tipLast = this.t;
      // big swings can be heard
      if (!this.reduced && this.t - (this.swT || 0) > .07) { this.swT = this.t; this.loopSnd('swing', clamp((Math.abs(ps.thv) - .25) / 1.6, 0, 1)); }
      this.loopSnd('snore', this.sleepZ ? 1 : 0);
    }
    placeBubble(H, ang) {
      const tall = this.layoutName === 'portrait';
      const head = this.toScreen(this.headXf([32, 34], H, ang, 1, 1));
      const sp = this.toScreen(this.headXf(tall ? [44, 30] : [58, 44], H, ang, 1, 1));
      const bw = this.bubble.offsetWidth || 160, bh = this.bubble.offsetHeight || 34, bx = this.box ? this.box.width : 400, by = this.box ? this.box.height : 560;
      const pad = this.tube ? 14 : 8, top = this.tube ? (tall ? 44 : 34) : 8, foot = this.tube === 'teletype' ? (tall ? 70 : 48) : this.tube ? (tall ? 44 : 34) : 8;
      const x = clamp(sp[0] + (tall ? -bw * .3 : 6), pad, bx - bw - pad), y = clamp(tall ? sp[1] - bh - 22 : sp[1] - bh / 2, top, by - bh - foot);
      this.bubble.style.transform = `translate(${R(x)}px, ${R(y)}px)`;
      this.bubble.dataset.side = tall ? 'down' : 'left';
      this.bubble.style.setProperty('--tx', R(clamp(head[0] - x, 16, bw - 16)) + 'px');
      this.bubble.style.setProperty('--ty', R(clamp(head[1] - y, 12, bh - 12)) + 'px');
    }
    // phosphor persistence: each refresh leaves a fading copy of Pip while it moves
    persist() {
      const ps = this.ps, moving = Math.abs(ps.thv) > .12 || Math.hypot(ps.C.vx, ps.C.vy) > 25 || Math.abs(ps.dyv) > 30;
      if (!this.reduced && moving && this.t - (this.ghostT || 0) > .045) {
        this.ghostT = this.t;
        const gcl = this.gPip.cloneNode(true);
        gcl.removeAttribute('class');
        gcl.querySelectorAll('[class]').forEach((n) => n.removeAttribute('class'));
        gcl.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
        this.gTrail.appendChild(gcl);
        this.ghosts.push({ e: gcl, t: this.t });
        while (this.ghosts.length > 9) this.ghosts.shift().e.remove();
      }
      const life = this.tube === 'phosphor' ? .5 : .32, peak = this.tube === 'phosphor' ? .42 : .16;
      for (let i = this.ghosts.length - 1; i >= 0; i--) {
        const g = this.ghosts[i], k = (this.t - g.t) / life;
        if (k >= 1) { g.e.remove(); this.ghosts.splice(i, 1); continue; }
        g.e.setAttribute('opacity', R(peak * (1 - k)));
      }
    }
    renderSlice() {
      const k = this.sliceT != null && !this.reduced ? (this.t - this.sliceT) / .42 : 1;
      if (k >= 1) { if (this.gSlice.getAttribute('display') !== 'none') this.gSlice.setAttribute('display', 'none'); return; }
      const H = this.L.h, step = [[.14, .27, -16, .55, .61], [.5, .58, 12, .3, .36], [.33, .44, -9, .7, .74], [.64, .79, 7, .2, .24], [.06, .13, -5, .46, .52], [.4, .47, 3, .82, .86]][Math.min(5, Math.floor(k * 6))];
      this.sliceR[0].setAttribute('y', R(step[0] * H)); this.sliceR[0].setAttribute('height', R((step[1] - step[0]) * H));
      this.sliceR[1].setAttribute('y', R(step[3] * H)); this.sliceR[1].setAttribute('height', R((step[4] - step[3]) * H));
      this.gSlice.setAttribute('transform', `translate(${step[2]} 0)`);
      this.gSlice.setAttribute('display', 'inline');
    }
    renderBrackets() {
      const id = this.target, pr = id && this.props.get(id);
      if (!pr || !pr.pos) { this.gHud.innerHTML = ''; return; }
      const sc = this.propTarget(pr).sc, x = pr.pos[0], y = pr.pos[1], Lay = this.L;
      // brackets fly in and lock when the target changes, then breathe a little
      const inK = this.reduced ? 1 : ease((this.t - (this.tgtT || 0)) / .4);
      const lock = this.lockT != null && this.t - this.lockT < 1.2 ? 1 - Math.min(1, (this.t - this.lockT) / .25) : 0;
      const pulse = this.reduced ? 0 : Math.sin(this.t * 3) * 1.2;
      const grow = (1 - inK) * 34 + lock * 14 + pulse;
      const hw = 58 * sc + grow, hh = Math.max(48, pr.foot + 8) * sc + grow, k = 12 * sc, c = this.w.ink;
      const corner = (cx, cy, dx, dy) => `<path d="M${R(cx)} ${R(cy + dy * k)}V${R(cy)}H${R(cx + dx * k)}" fill="none" stroke="${c}" stroke-width="1.6"/>`;
      let s = corner(x - hw, y - hh, 1, 1) + corner(x + hw, y - hh, -1, 1) + corner(x - hw, y + hh, 1, -1) + corner(x + hw, y + hh, -1, -1)
        + `<path d="M${R(x - hw - 10)} ${R(y)}H${R(x - hw - 3)}M${R(x + hw + 3)} ${R(y)}H${R(x + hw + 10)}" stroke="${c}" stroke-width="1"/>`;
      // the marker: a diamond turning above the target
      const my = y - hh - 12, a = this.reduced ? 45 : (this.t * 120) % 360;
      s += `<rect x="${R(x - 3.5)}" y="${R(my - 3.5)}" width="7" height="7" fill="none" stroke="${c}" stroke-width="1.2" transform="rotate(${R(a)} ${R(x)} ${R(my)})"/>`;
      // a leader line from Pip to the target, drawn once the brackets lock, with its label at the elbow
      if (inK > .6 && this.H) {
        const hc = this.headXf([50, 40], this.H, this.ang || 0, 1, 1), ex = x - hw - 4, ey = y - hh;
        const mx = hc[0] + Math.min(26, Math.max(10, (ex - hc[0]) * .3)), myy = Math.min(hc[1] - 16, ey);
        const len = Math.hypot(mx - hc[0], myy - hc[1]) + Math.abs(ex - mx), drawn = this.reduced ? 1 : ease((inK - .6) / .4);
        s += `<path d="M${R(hc[0])} ${R(hc[1])}L${R(mx)} ${R(myy)}H${R(ex)}" fill="none" stroke="${c}" stroke-width="1" stroke-dasharray="${R(len)}" stroke-dashoffset="${R(len * (1 - drawn))}"/>`;
        s += `<rect x="${R(hc[0] - 2)}" y="${R(hc[1] - 2)}" width="4" height="4" fill="${c}"/>`;
        const lab = (this.hudEl && this.hudEl.querySelector('.pst-target') || {}).textContent || '';
        if (drawn > .9 && mx + 6 < ex - 20 && Lay.w > 300) s += `<text x="${R(mx + 4)}" y="${R(myy - 5)}" font-family="'PM NieR Sans','Inter',sans-serif" font-size="8.5" letter-spacing="1.4" fill="${c}">${lab.replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 18)}</text>`;
      }
      this.gHud.innerHTML = s;
      const co = this.hudEl && this.hudEl.querySelector('.pst-ncoord');
      if (co && this.t - (this.coT || 0) > .25) { this.coT = this.t; co.textContent = `X ${String(Math.round(x)).padStart(3, '0')} Y ${String(Math.round(y)).padStart(3, '0')}`; }
    }

    /* --------------------------------------------------------------- API */
    setTheme(theme) {
      if (theme === this.theme) return;
      this.theme = theme;
      this.booted = false;
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
    setReduced(r) { this.reduced = !!r; this.root.dataset.reduced = r ? '1' : '0'; const S = snd(); if (S && S.setReduced) S.setReduced(this.reduced); }
    // something on the screen is being pointed at: Pip turns to it rather than to the pointer
    busy() { this.busyT = this.t; }
    // Pip tries on another look (the Pick a look screen): only Pip changes, the world stays
    tryOn(theme) {
      const t = theme || this.theme;
      if (t === this.pipTheme) return;
      const S = snd();
      if (theme && theme !== this.theme) this.sfx('tryOn', { kit: S && S.kitOf ? S.kitOf(t) : undefined });
      if (this.reduced) { this.buildPip(t); return; }
      let k = 0;
      const flip = () => {
        k += 1;
        const sx = k <= 6 ? 1 - k / 6 : (k - 6) / 6;
        this.gPip.style.transformOrigin = `${this.ps.C.x}px 0`;
        this.gPip.style.transform = `scaleX(${R(Math.max(.02, sx))})`;
        if (k === 6) { this.buildPip(t); }
        if (k < 12) requestAnimationFrame(flip); else this.gPip.style.transform = '';
      };
      flip();
    }
    destroy() { if (this.off) this.off(); clearTimeout(this.questT); clearInterval(this.tipW); cancelAnimationFrame(this.raf); this.ro.disconnect(); clearTimeout(this.wakeT); clearInterval(this.typeT); clearInterval(this.decT); clearInterval(this.cmdT); clearInterval(this.bootT); this.root.innerHTML = ''; }
  }

  G.PipStage = { Stage, LAYOUTS, FAM };
})(window);
