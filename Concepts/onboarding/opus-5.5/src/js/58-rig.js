/* O55.pipStage — Pip's stage, the scene beside every onboarding screen (DL-238, F3-663; the concept is
   Concepts/onboarding/opus-5.5-pip/stage.js, approved 2026-10-28 round 10).
   Pip hangs from the control, which stands for the person setting up. It is a real pendulum: when the hand moves, Pip
   swings and settles, and its strings are solved every frame from the screw eyes on the bar to the eyes on its head
   with the logo's solver (the one kit, PMLogo: DR-076). Every prop is lowered in on its own string and swings too.
   Hovering a choice previews its prop (after a rest of 420 ms; 60-ui-core.js); choosing it drops it in and Pip
   reacts. Between moments Pip is alive: it breathes, follows the pointer with its eyes (and keeps them on where it
   was last seen), and now and then kicks into a swing or wiggles; its face never changes on its own.
   Faces change like a blink: the eyes and brows shut on the eye line and the mouth shrinks to its centre, then the new
   face opens a touch past full (about 0.2 s; Retro in its own steps: shut, most of the way, open). Nothing fades.
   Speech is typed into the bubble at Pip's own pace; the bubble is aria-hidden.
   This file is the stage's core: its layouts, each look's motion, the rig, faces, gaze, props, speech, notes and the
   loop. Each look's world is in 51-54 (Retro's terminal and NieR's HUD as mixins), the pen and props in 56-57, the
   celebrations in 59-cheer.js and the director (what each screen shows) in 55-scenes.js.
   The loop runs only while the window is open and shown: it stops while the page is hidden, while a drag is under way
   (body.pm-resizing) and while a screen change is held; Reduced Motion and low-resource computers draw only what
   changed (nothing swings, travels, flickers or trails: props appear in place and Pip changes expression only). */
(function () {
  'use strict';
  const O55 = window.O55, PIP = O55.pipStage, H = PIP.h, PW = O55.pipWorlds;
  const { R, clamp, ease, rot, el, div, T } = H;
  const now = H.now;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const KIT = () => H.kit();
  const TH = () => KIT().THEMES;
  let tube = null;
  const TUBE = () => tube || (tube = PIP.TUBE_PIP(TH()));
  const CLOSE = () => O55.util.nx('close', 14, 'control') || '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  /* the chapters by the real names (chapters.*); the terminal's label and the printout's page number */
  const chapterN = (ch) => Math.max(0, O55.stages.CHAPTERS.indexOf(ch));
  const chapterName = (ch) => O55.t('chapters.' + (ch || 'welcome'));
  const chapterLabel = (tb, ch) => (tb === 'teletype' ? T('retroLight.page', { n: String(chapterN(ch) + 1).padStart(2, '0') }) : `[ ${chapterName(ch).toUpperCase()} ]`);
  // Pip's voice and kits (M3: O55.pipVoice, beside 15-sound.js); silent until it is there
  const snd = () => O55.pipVoice || null;
  /* ------------------------------------------------------------- layouts */
  // portrait: the left pane of the window. banner: the strip above the content on narrow windows.
  const LAYOUTS = {
    portrait: {
      w: 400, h: 560, ground: 492, s: 2.6, ctl: [146, 112], rope: 184, propScale: 1.1, anchorY: -60,
      slots: {
        side: [300, 372], sign: [290, 360], pairA: [276, 318], pairB: [342, 426], hi: [300, 262],
        o1: [258, 300], o2: [332, 322], o3: [258, 398], o4: [332, 420],
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

  // where the pointer is, for Pip's eyes (shared by every stage); the pointer's last spot is kept when it leaves
  const pointer = PIP.pointer = { x: -1, y: -1, t: 0 };
  document.addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.t = now(); }, { passive: true });

  /* --------------------------------------------------------------- stage */
  let seq = 0;
  class Stage {
    constructor(root, opts) {
      this.root = root;
      this.id = 'pst' + (++seq);
      this.theme = (opts && opts.theme) || 'basic-dark';
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
      this.raf = 0; this.active = true; this.dirty = true;
      this.parts();
      const reg = window.PM_PIP_PARTS; if (reg && typeof reg.on === 'function') try { this.offParts = reg.on('change', () => this.parts()); } catch (_) {}
      this.kick();
      this.ro = new ResizeObserver(() => this.measure());
      this.ro.observe(root);
    }
    /* ------------------------------------------------------- building */
    build() {
      const root = this.root, w = PW.WORLDS[this.theme] || PW.WORLDS['basic-dark'], Lay = this.L = LAYOUTS[this.layoutName];
      this.dirty = true;
      /* Pip's voice and music follow the look's kit (15-sound-pip.js) */
      const vo = snd(); if (vo && vo.setTheme) vo.setTheme(this.theme);
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
      /* Glass stands on PMConcept7's own Ribbons wallpaper (liquid glass's --lg-wall-ribbons-*) */
      if (w.fam === 'glass') root.style.setProperty('--wall', `var(--lg-wall-ribbons-${w.scheme})`); else root.style.removeProperty('--wall');
      if (w.fam === 'glass') this.wall.innerHTML = '<i class="pst-caustic c1"></i><i class="pst-caustic c2"></i><i class="pst-caustic c3"></i>';
      const svg = this.svg = el('svg', { class: 'pst-svg', viewBox: `0 0 ${Lay.w} ${Lay.h}`, preserveAspectRatio: this.tube ? 'xMidYMid slice' : 'xMidYMid meet', 'aria-hidden': 'true' }, this.content);
      svg.setAttribute('xmlns', H.NS);
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
      /* the bubble is decoration: the stage heading and the choice carry the meaning (Planning_Wizard L1851) */
      this.bubble.setAttribute('aria-hidden', 'true');
      this.bubble.innerHTML = (w.fam === 'nier' ? `<b class="pst-bn">${esc(T('bubble.name'))}</b>` : '') + '<span class="pst-bt"></span>' + (w.fam === 'nier' ? '<i class="pst-bgo" aria-hidden="true"></i>' : '');
      this.btext = this.bubble.querySelector('.pst-bt');
      if (this.tube === 'phosphor') div('pst-crt', this.screen, '<i class="pst-roll"></i><i class="pst-scan"></i><i class="pst-mask"></i><i class="pst-noise"></i><i class="pst-vig"></i><i class="pst-glare"></i>');
      if (this.tube === 'teletype') { div('pst-grain', this.screen); this.head = div('pst-printer', this.screen, '<i class="pst-bail"></i><i class="pst-platen"></i><i class="pst-head"><b></b></i>').querySelector('.pst-head'); }
      this.hudHtml();
      // Pip's tip: a note hanging under Pip, in the look's own material (NieR files it in a TIPS box in its HUD)
      this.tipBox = null; this.tipXY = null;
      const kick = w.fam === 'nier' ? 'nier' : this.tube === 'phosphor' ? 'retroDark' : this.tube ? 'retroLight' : w.fam;
      /* (NieR's TIPS diamond is drawn, not typed: no symbol glyphs in the words) */
      const tipHtml = `<b class="pst-tip-k">${w.fam === 'nier' ? '<i class="pst-tip-dia" aria-hidden="true"></i>' : ''}<span class="pst-tip-kl">${esc(T('note.kicker.' + kick))}</span>`
        + `<button type="button" class="pst-tip-x" data-o55-do="tip" data-o55-sound="self" aria-label="${esc(T('note.close'))}" data-pm-hover-exempt="true">${CLOSE()}</button></b>`
        + '<span class="pst-tip-h"></span><span class="pst-tip-t" aria-hidden="true"></span><span class="pst-tip-sr o55-sr"></span>';
      if (w.fam !== 'nier') this.tipBox = div('pst-tip', this.overlay, tipHtml);
      else { const nt = this.hudEl.querySelector('.pst-ntip'); nt.innerHTML = tipHtml; }
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
      const tw = this.tube === 'phosphor' ? 'retroDark' : 'retroLight';
      if (this.tube) h = `<div class="pst-term" aria-hidden="true"><div class="pst-term-top"><span>${esc(T(tw + '.title'))}</span><span class="pst-term-ch"></span></div><pre class="pst-term-boot"></pre><div class="pst-term-cmd"><span class="pst-term-ps">${esc(T(tw + '.prompt'))}</span> <span class="pst-term-in"></span><i class="pst-term-cur"></i><span class="pst-term-ok"></span></div></div>`;
      /* (the HUD is decoration, except its TIPS box: the explainer lives there in NieR) */
      if (f === 'nier') h = `<div class="pst-nhud"><div class="pst-ntop" aria-hidden="true"><span>${esc(T('nier.unit'))}</span><span class="pst-decode"></span></div>`
        + `<div class="pst-nscan" aria-hidden="true"><i></i><span class="pst-nscan-l">${esc(T('nier.scan'))}</span></div>`
        + `<div class="pst-nquest" aria-hidden="true"><b>${esc(T('nier.quest'))}</b><span class="pst-nquest-t"></span></div>`
        + '<div class="pst-ntip"></div>'
        + `<div class="pst-nlab" aria-hidden="true"><span class="pst-nlab-k"><i class="pst-nsq"></i> <b class="pst-target">${esc(T('nier.standby'))}</b></span><span class="pst-ncoord">${esc(T('nier.map'))}</span></div>`
        + '<i class="pst-nb tl" aria-hidden="true"></i><i class="pst-nb tr" aria-hidden="true"></i><i class="pst-nb bl" aria-hidden="true"></i><i class="pst-nb br" aria-hidden="true"></i></div>';
      const wrap = div('pst-hudhtml', this.overlay, h);
      this.hudEl = wrap;
      this.cmdText = null;
      const lab = wrap.querySelector('.pst-term-ch'), ch = this.chapter || 'welcome';
      if (lab) lab.textContent = chapterLabel(this.tube, ch);
    }
    /* -------------------------------------------------------------- Pip */
    pipTh(theme) {
      const th = theme === this.theme && this.tube ? TUBE()[this.tube] : TH()[theme];
      /* (the back stick's solid shade, as the concept mixed it, until the kit's THEMES carry it: found 7f204cbade) */
      if (!th || th.back) return th;
      const mx = KIT().kit.mix, back = th.ctl && th.bg && mx ? mx(th.ctl, th.bg, 0.42) : th.ctl;
      return Object.assign({}, th, { back }, th.glass && !th.glass.rodBack && mx ? { glass: Object.assign({}, th.glass, { rodBack: mx(th.glass.rod, th.bg, 0.42) }) } : {});
    }
    buildPip(themeOverride) {
      const K = KIT().kit, Lay = this.L, g = K.GEO.full, theme = themeOverride || this.theme, th = this.pipTh(theme), nier = !!th.nier;
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
      /* (Pip parts: face-transitions off swaps the face at once) */
      const leaving = !force && !this.reduced && H.part('face-transitions') && this.faceEl && this.faceEl.isConnected ? this.faceEl : null;
      if (this.faceOut) { this.faceOut.remove(); this.faceOut = null; }
      this.curMood = mood;
      const K = KIT().kit, g = K.GEO.full, th = this.pipTh(this.pipTheme);
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
    /* both strings' ends for a pose: the logo's one solver (PMLogo.solver.strings: screw eye under the stick, 5 units in,
       eye on Pip's head, each string leaving its eye on the side facing the other); NieR's square nodes join directly */
    solveStrings(P) {
      const sv = KIT().solver;
      /* (asked in the kit's own units, the stage's divided by its scale, so the eyes' radius keeps its proportion) */
      if (sv && sv.strings && this.ringR) {
        const s = this.L.s, k = (p) => [p[0] / s, p[1] / s];
        return sv.strings('full', (q) => k(this.ctlXf(q, P.C, P.phi)), (q) => k(this.headXf(q, P.H, P.ang, P.sx, P.sy)), 'eye').map((e) => ({ T: [e.T[0] * s, e.T[1] * s], E: [e.E[0] * s, e.E[1] * s] }));
      }
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
      const S = snd(); if (!S || !S.play) return;
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
      if (on) this.kick();
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
      const col = f === 'glass' ? (w.scheme === 'dark' ? 'rgba(246,248,252,.5)' : 'rgba(12,15,21,.38)') : f === 'basic' ? w.line : f === 'retro' ? (this.tube === 'phosphor' ? w.mid : '#5B544A') : f === 'nier' ? w.ink : TH()[this.theme].str;
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
      this.spec = spec; this.dirty = true; this.kick();
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
      if (lab) lab.textContent = chapterLabel(this.tube, ch);
      if (!prev) return;
      this.sfx('chapter', { chapter: chapterN(ch) });
      if (this.reduced) return;
      const f = this.famName, again = (node, cls) => { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); };
      if (f === 'nier') { this.sliceT = this.t; this.quest(chapterName(ch)); setTimeout(() => this.sfx('slice'), 40); }
      if (f === 'glass') again(this.root, 'pst-sweep');
      if (this.tube === 'phosphor') { this.screen.classList.remove('pst-on'); again(this.screen, 'pst-degauss'); setTimeout(() => this.sfx('degauss'), 30); }
      if (this.tube === 'teletype') this.feedPaper(2);
      if (f === 'friendly' || f === 'basic') this.hop(.6);
    }
    // a transient expression, then back to the scene's own
    feel(mood, ms) { this.moodOverride = mood; this.moodUntil = this.t + (ms || 1200) / 1000; this.kick(); }
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
      this.kick();
      if (!t) { if (el) { el.classList.remove('on', 'typing'); el.removeAttribute('id'); el.removeAttribute('role'); el.removeAttribute('aria-label'); } return; }
      this.showTip(instant);
    }
    tipEl() { return this.overlay && this.overlay.querySelector('.pst-tip, .pst-ntip'); }
    showTip(instant) {
      clearInterval(this.tipW);
      const el = this.tipEl(), t = this.tipData;
      if (!el || !t) return;
      // NieR: QUEST UPDATED gives way to a tip asked for
      const q = this.hudEl && this.hudEl.querySelector('.pst-nquest'); if (q) q.classList.remove('on');
      /* the note on the stage is the one anchored explainer (O7): the ? controls it, the choice is described by it */
      el.id = 'pm7ob-explainer'; el.setAttribute('role', 'note'); el.setAttribute('aria-label', t.title);
      const x = el.querySelector('.pst-tip-x'); if (x && t.id) x.setAttribute('data-arg', t.id);
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
      this.raf = 0;
      const tn = now(); let dt = Math.min(.05, tn - this.last) / H.speed(); this.last = tn;
      /* paused while the window is shut or held, the page hidden, a drag under way (body.pm-resizing) or the stage
         gone; a still stage (Reduced Motion, a low-resource computer) is drawn only when something changed */
      if (!this.live()) { this.park(); return; }
      if (this.still() && !this.dirty && this.t > this.moodUntil + .3 && !this.fx.length && !this.faceOut && this.faceT0 == null) return;
      this.dirty = false;
      this.raf = requestAnimationFrame(this.loop);
      this.t += dt;
      const sub = 3; for (let i = 0; i < sub; i++) this.step(dt / sub);
      this.life(dt);
      // Retro's tube refreshes in steps; the phosphor holds what was there a moment longer
      const fps = this.frameRate();
      /* (on a steady cadence: each draw is due one step after the last was due, so a frame that comes a little late
         does not push every later draw back; Retro Light then draws ten times a second, Retro Dark twenty) */
      if (fps && !this.reduced) { const step = 1 / fps; if (this.t - this.frameT < step - 0.006) return; this.frameT = this.t - this.frameT > 2 * step ? this.t : this.frameT + step; }
      this.render();
    }
    // how often the stage is drawn: every frame, but Retro in steps (Retro Light, paper, at half Retro Dark's rate,
    // a flipbook of printouts)
    frameRate() { return this.reduced ? 0 : this.tube === 'teletype' ? 10 : this.fam.fps || 0; }
    // Pip's idle life: now and then it looks up at the bar, kicks its feet, wiggles or glances round
    life(dt) {
      if (this.reduced || this.sleepZ || !H.part('idle-life')) return;
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
      /* (Pip parts: sway-and-physics off holds the rig and the props still, as Reduced Motion does) */
      const ps = this.ps, F = this.fam, Lay = this.L, red = this.reduced || !H.part('sway-and-physics');
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
      const br = this.reduced || !PIP.h.part('idle-life') ? 0 : (this.fam.breathe || 0) * Math.sin(this.t * (this.sleepZ ? 1.5 : 2.2));
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
      else if (!this.reduced && PIP.h.part('gaze') && this.box && pointer.t > 0) {
        // the pointer, in stage units
        const m = this.map || { k: 1, ox: 0, oy: 0 }, px = (pointer.x - this.box.left - m.ox) / m.k, py = (pointer.y - this.box.top - m.oy) / m.k;
        const vx = px - hc[0], vy = py - hc[1], l = Math.hypot(vx, vy) || 1, k = Math.min(1, l / 120);
        look = [vx / l * 2.3 * k, vy / l * 1.6 * k];
      } else if (tgt && tgt.pos) look = atTarget(tgt.pos);
      ps.lookT = look;
      if (this.eyesEl) this.eyesEl.setAttribute('transform', `translate(${R(ps.look[0])} ${R(ps.look[1])})`);
      // blink
      if (this.blinkEl && !this.reduced && PIP.h.part('blinks')) {
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
        const th = clamp(ps.th, -A(34), A(34)), deg = ps.th * 57.3, lab = `${deg < -.05 ? '-' : ''}${Math.abs(deg).toFixed(1)}`;
        const m = (q, rr) => [cx + Math.sin(q) * rr, cy + Math.cos(q) * rr], tip = m(th, r - 1), b1 = m(th - .045, r - 9), b2 = m(th + .045, r - 9), lp = m(A(-38), r + 4);
        this.gShadow.innerHTML = `<path d="M${P(A(-30), r)}A${R(r)} ${R(r)} 0 0 0 ${P(A(30), r)}${tk}" fill="none" stroke="${ln}" stroke-opacity=".28" stroke-width="1"/>`
          + `<path d="M${R(cx)} ${R(cy)}L${P(0, r + 7)}" stroke="${ln}" stroke-opacity=".18" stroke-dasharray="2 3"/>`
          + `<path d="M${R(tip[0])} ${R(tip[1])}L${R(b1[0])} ${R(b1[1])}L${R(b2[0])} ${R(b2[1])}Z" fill="${c}"/>`
          + (Lay.w > 300 ? `<text x="${R(lp[0])}" y="${R(lp[1])}" text-anchor="end" font-family="'Inter',system-ui,sans-serif" font-size="9" font-weight="600" fill="${ln}" opacity=".55">θ ${lab}<tspan dy="-3.5" font-size="6">o</tspan></text>` : '')
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
    /* --------------------------------------------------------------- API */
    setTheme(theme) {
      if (theme === this.theme) return;
      this.theme = theme;
      this.booted = false;
      this.root.classList.add('pst-swap');
      this.build();
      this.direct(this.spec);
      requestAnimationFrame(() => this.root.classList.remove('pst-swap'));
      this.kick();
    }
    setLayout(name) {
      if (name === this.layoutName) return;
      this.layoutName = name; this.ps = null;
      this.build(); this.direct(this.spec);
    }
    setReduced(r) { if (this.reduced === !!r) return; this.reduced = !!r; this.root.dataset.reduced = r ? '1' : '0'; this.dirty = true; this.kick(); }
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
    destroy() { if (this.off) this.off(); clearTimeout(this.questT); clearInterval(this.tipW); cancelAnimationFrame(this.raf); clearTimeout(this.parkT); this.dead = true; this.ro.disconnect(); clearTimeout(this.wakeT); clearInterval(this.typeT); clearInterval(this.decT); clearInterval(this.cmdT); clearInterval(this.bootT); this.root.innerHTML = ''; }

    /* ------------------------------------------------------------- the product's own */
    /* Pip parts the stage's CSS reads: setup-world-life off holds the world's own loops (clouds, caustics, motes, the
       tube's roll), strings off hides Pip's and the props' strings */
    parts() {
      const set = (a, on) => { if (this.root.hasAttribute(a) === !on) return; if (on) this.root.removeAttribute(a); else this.root.setAttribute(a, ''); };
      set('data-no-world-life', H.part('setup-world-life')); set('data-no-strings', H.part('strings'));
      this.dirty = true; this.kick();
    }
    // whether the loop runs: the window open and shown, the page visible, no drag under way, the stage on the page
    live() { return !this.dead && this.active && !this.held && !document.hidden && this.root.isConnected && !document.body.classList.contains('pm-resizing'); }
    // a stage that draws only what changed: Reduced Motion (nothing swings, travels, flickers or trails) and a computer
    // in low-resource mode
    still() { return this.reduced || !!O55.motion.lowResource; }
    kick() {
      this.dirty = true;
      if (this.raf || this.dead) return;
      if (!this.live()) { this.park(); return; }
      if (this.root.hasAttribute('data-paused')) this.root.removeAttribute('data-paused');
      this.last = now(); this.raf = requestAnimationFrame(this.loop);
    }
    // paused: look again a little later (a drag ends, the page shows again); nothing is drawn meanwhile
    park() {
      clearTimeout(this.parkT);
      if (!this.root.hasAttribute('data-paused')) this.root.setAttribute('data-paused', '');
      if (!this.dead && this.active) this.parkT = setTimeout(() => this.kick(), 250);
    }
    // a screen change the window holds back a frame (60-ui-core.js transition): the scene waits with it
    hold(on) { this.held = !!on; if (!on) this.kick(); }
    release() { this.hold(false); }
    // a choice made (O55.ui.charm): Pip is happy through its line and the chosen prop pops
    picked() { const sp = this.spec || {}; this.busy(); this.cheer(sp.target, { mood: 'happy', hold: 2600 }); }
    celebrate(o) { o = o || {}; this.confetti(o.count || 46); this.cheer(null, { sound: o.sound || 'crew' }); }
    // Creating's end: the last block is down (or the Project was already made), Pip is pleased
    created() { const sp = this.spec || {}; this.cheer(sp.target, { mood: 'happy', hold: 1800 }); }
    // Ready's curtain call: confetti, the crew bows, and Pip's one wink, at its sign-off (59-cheer.js)
    curtainCall(o) { if (this.ready) this.ready(o || {}); }
  }

  /* ---------------------------------------------------------------- the chapter rail (O9)
     The header's bar is a string pulled taut between two screw eyes, with a string down to each chapter, and Pip rides
     it like a zip line as the current-chapter marker: the string dips under Pip's weight, Pip slides to the current
     chapter on each look's own spring and swings when it stops, and the walked part of the string is in the accent.
     Retro steps the slide (Retro Light at ten frames a second, like its paper); NieR glides on a rigid track. Reduced
     Motion puts Pip in place. The loop runs only while Pip is moving, and never during a drag. */
  const rail = PIP.rail = { x: null, v: 0, dip: 0, dv: 0, ang: 0, av: 0, cur: -1, raf: 0, last: 0, nav: null, xs: [] };
  const SPRING = { friendly: [70, 11], glass: [26, 7.5], basic: [90, 19], retro: [110, 15], nier: [60, 16] };
  rail.mount = function mount(nav, cur, theme) {
    const K = H.kit(); if (!nav || !K) return;
    rail.nav = nav; rail.theme = theme;
    /* (the rail's markup holds both, kept by the window's morph: 60-ui-core.js renderRail) */
    const svg = nav.querySelector(':scope > .o55-railzip'), pip = nav.querySelector(':scope > .o55-railpip');
    if (!svg || !pip) return;
    if (!svg.firstChild) svg.innerHTML = '<path class="o55-railzip-str"/><path class="o55-railzip-hi"/><circle class="o55-railzip-eye" r="2.6"/><circle class="o55-railzip-eye" r="2.6"/>';
    if (pip.getAttribute('data-theme-pip') !== theme) { pip.setAttribute('data-theme-pip', theme); pip.innerHTML = K.svg({ theme, px: 24, decorative: true }); }
    rail.measure();
    if (rail.cur !== -1 && cur !== rail.cur && !O55.motion.reduced()) rail.av += (cur > rail.cur ? -1 : 1) * 0.6;
    rail.cur = cur;
    rail.kick();
  };
  /* bead x positions, read once per render and on a resize (never per frame) */
  rail.measure = function measure() {
    const nav = rail.nav; if (!nav) return;
    const nr = nav.getBoundingClientRect();
    rail.W = nr.width;
    rail.xs = Array.from(nav.querySelectorAll('.o55-railitem .o55-railnode')).map((n) => { const r = n.getBoundingClientRect(); return r.left + r.width / 2 - nr.left; });
  };
  rail.kick = function kick() { if (!rail.raf) { rail.last = now(); rail.raf = requestAnimationFrame(rail.tick); } };
  rail.tick = function tick() {
    rail.raf = 0;
    const nav = rail.nav; if (!nav || !nav.isConnected || !rail.xs.length) return;
    if (document.body.classList.contains('pm-resizing') || document.hidden) { setTimeout(rail.kick, 250); return; }
    const tn = now(), dt = Math.min(0.04, tn - rail.last) / H.speed(); rail.last = tn;
    const fam = String(rail.theme || 'basic-dark').split('-')[0], rigid = fam === 'nier', red = O55.motion.reduced();
    const W = rail.W, y0 = 9, x0 = 6, x1 = W - 6, tx = rail.xs[Math.max(0, rail.cur)] || x0, weight = rigid ? 0 : fam === 'basic' ? 2 : 4;
    if (rail.x == null || red) { rail.x = tx; rail.v = 0; rail.dip = weight; rail.dv = 0; rail.ang = 0; rail.av = 0; }
    const M2 = SPRING[fam] || SPRING.basic, ax = M2[0] * (tx - rail.x) - M2[1] * rail.v;
    rail.v += ax * dt; rail.x += rail.v * dt;
    const dA = 160 * (weight + Math.min(4, Math.abs(rail.v) * 0.01) - rail.dip) - 9 * rail.dv; rail.dv += dA * dt; rail.dip += rail.dv * dt;
    const aA = -38 * rail.ang - 3.2 * rail.av - ax * 0.0016; rail.av += aA * dt; rail.ang += rail.av * dt;
    const moving = Math.abs(tx - rail.x) > 0.3 || Math.abs(rail.v) > 1 || Math.abs(rail.av) > 0.01 || Math.abs(rail.ang) > 0.004 || Math.abs(rail.dip - weight) > 0.05;
    /* Retro Light is paper: the rail is drawn ten times a second (the spring still runs every frame) */
    if (rail.theme === 'retro-light' && moving && !red && tn - (rail.drawn || 0) < 0.1) { rail.kick(); return; }
    rail.drawn = tn;
    let px = rail.x, dip = Math.max(0, rail.dip);
    if (fam === 'retro') { px = Math.round(px / 4) * 4; dip = Math.round(dip); }
    const yAt = (x) => (x <= px ? y0 + dip * (x - x0) / Math.max(1, px - x0) : y0 + dip * (x1 - x) / Math.max(1, x1 - px));
    const k = 6, d = dip > 0.4 ? `M${x0} ${y0}L${R(px - k)} ${R(yAt(px - k))}Q${R(px)} ${R(y0 + dip)} ${R(px + k)} ${R(yAt(px + k))}L${x1} ${y0}` : `M${x0} ${y0}H${x1}`;
    const svg = nav.querySelector(':scope > .o55-railzip');
    if (svg) {
      svg.setAttribute('viewBox', `0 0 ${R(W)} 40`);
      svg.querySelector('.o55-railzip-str').setAttribute('d', d);
      svg.querySelector('.o55-railzip-hi').setAttribute('d', dip > 0.4 ? `M${x0} ${y0}L${R(px - k)} ${R(yAt(px - k))}Q${R(px)} ${R(y0 + dip)} ${R(px)} ${R(y0 + dip)}` : `M${x0} ${y0}H${R(px)}`);
      const eyes = svg.querySelectorAll('.o55-railzip-eye');
      eyes[0].setAttribute('cx', x0); eyes[0].setAttribute('cy', y0); eyes[1].setAttribute('cx', R(x1)); eyes[1].setAttribute('cy', y0);
    }
    /* the mark's pin (32, 14.5 of 64) rides the string; at 24 px that is (12, 5.4) */
    const pip = nav.querySelector(':scope > .o55-railpip');
    if (pip) pip.style.transform = `translate(${R(px - 12)}px, ${R(y0 + dip - 5.4)}px) rotate(${R(rail.ang * 57.3)}deg)`;
    if (moving && !red) rail.kick();
  };
  window.addEventListener('resize', () => { if (rail.nav && rail.nav.isConnected) { rail.measure(); rail.kick(); } });

  Object.assign(PIP, {
    Stage, LAYOUTS, FAM,
    of: (host) => (host && host.__pipStage) || null,
    // the stage on a host, made once; the window keeps one for its life (60-ui-core.js renderScene)
    ensure(host, opts) { if (!host) return null; if (!host.__pipStage || host.__pipStage.dead) host.__pipStage = new Stage(host, opts || {}); return host.__pipStage; }
  });
  PIP.mixins.forEach((m) => Object.assign(Stage.prototype, m));
})();
