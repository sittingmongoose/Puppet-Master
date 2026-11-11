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
  const { R, clamp, ease, rot, el, div, T, sa } = H;
  const now = H.now;
  const STACK_OFFSETS = [-3, 4, -2, 3, 0, -3];
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
      this.loop = this.loop.bind(this); this.tick = this.tick.bind(this);
      this.raf = 0; this.active = true; this.dirty = true;
      this.parts();
      const reg = window.PM_PIP_PARTS; if (reg && typeof reg.on === 'function') try { this.offParts = reg.on('change', () => this.parts()); } catch (_) {}
      this.kick();
      this.ro = new ResizeObserver(() => this.measure());
      this.ro.observe(root);
      /* a window resize measures again on the next frame and once the window has settled: the pane's clip can change
         with nothing on the stage itself resizing, and a span measured mid-change let a sign keep 1024's room at 860 */
      this.onWinResize = () => { if (this.dead) return; requestAnimationFrame(() => { if (!this.dead) this.measure(); }); clearTimeout(this.winRT); this.winRT = setTimeout(() => { if (!this.dead) this.measure(); }, 450); };
      window.addEventListener('resize', this.onWinResize);
    }
    /* ------------------------------------------------------- building */
    build() {
      const root = this.root, w = PW.WORLDS[this.theme] || PW.WORLDS['basic-dark'], L0 = this.L0 = LAYOUTS[this.layoutName], Lay = this.L = Object.create(L0); /* (Pip's own size on it: setPipK) */
      this.pipK = 1;
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
      /* new words that change the bubble's size are placed before they are painted, past Retro's stepped draw: a stepped
         stage left a grown bubble over a prop for up to a tenth of a second */
      /* (placed here, from Pip's last drawn pose, not only on the next drawn frame: a screen change holds the stage while
         the new screen comes in, and its line was written then, so the bubble grew where the old line had stood and was
         painted there, over the page leaving with the old screen, until the stage was let go: Basic Dark at 740x768,
         Begin to Away, FO-34 R1) */
      if (this.bubbleMO) this.bubbleMO.disconnect();
      if (this.bubbleRO) this.bubbleRO.disconnect();
      /* (its size is kept here, read when its words or class change and when its box resizes (a font arriving), never in
         the loop: placeBubble read offsetWidth/Height on every drawn frame, after that frame's writes, a forced layout each
         time; PERF-1. NieR's fixed box is measured at the same moments.) */
      this.bubbleW = this.bubbleH = 0; this.nierBox = null;
      const sized = () => { const b = this.bubble; if (!b || this.dead) return; const w = b.offsetWidth, h = b.offsetHeight; if (this.famName === 'nier') { const nb = this.boxInScene(b, 6); if (nb) this.nierBox = nb; } if (w !== this.bubbleW || h !== this.bubbleH) { this.bubbleW = w; this.bubbleH = h; this.frameT = -1e9; if (this.H && this.famName !== 'nier') this.placeBubble(this.H, this.ang); this.kick(); } };
      this.bubbleMO = new MutationObserver(sized);
      this.bubbleMO.observe(this.bubble, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] });
      this.bubbleRO = new ResizeObserver(sized); this.bubbleRO.observe(this.bubble);
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

      this.buildPip();
      // A retained note uses the pose that setLayout() just cleared.
      if (this.tipData) { this.showTip(true); if (this.relayout && this.tipEl()) this.tipEl().getAnimations().forEach((a) => a.finish()); }
      // re-create the props that were on stage, in the new material
      const keep = [...this.props.values()];
      this.props.clear();
      keep.forEach((p) => { if (p.state !== 'out') this.addProp(p.spec, true); });
      this.ghosts = [];
      this.syncDefs();
      this.measure(); this.remeasureAt = now() + 0.9; /* (and once the window's opening has settled) */
      /* the look's entrance plays on first show and on a look switch, not on a new layout (stayOn, SW-23) */
      if (this.tube) { if (this.relayout) this.stayOn(); else this.powerOn(); }
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
        this.pipAt = Lay.ctl; this.pipOff = [0, 0]; /* (its spot, not yet fitted to what a person can see: pipFit) */
      }
      this.pipBB = null;
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
      // a look only hovered is silent through and through (Jared's O6): its props settle without a sound
      if (this.spec && this.spec.mute) return;
      // a scene change lowers and lifts several props at once: one sound for the moment, not six
      const gap = { lower: .12, lift: .16, land: .1, ghost: .12, sparkle: .15, hop: .2 }[ev];
      if (gap) { this.sfxT = this.sfxT || {}; if (this.t - (this.sfxT[ev] || -9) < gap) return; this.sfxT[ev] = this.t; }
      o = Object.assign({}, o || {});
      if (o.x != null) { o.pan = R(clamp(o.x / this.L.w * 2 - 1, -1, 1) * .8); delete o.x; }
      /* a block's touchdown is its own moment: a sound the core played in the last 70 ms (its merge window) would have it
         dropped as the same moment, so it sounds just after that one. Retro Dark's last two blocks landed 6-65 ms apart
         and Friendly's middle one 24 ms after the Project-made sound; both were dropped (final run FO-2) */
      if (ev === 'block') { this.blockSfx(S, o, 0); return; }
      try { S.play(ev, o); } catch (e) { /* sound never stops the stage */ }
    }
    blockSfx(S, o, tries) {
      if (this.dead) return;
      const now = performance.now(), log = (O55.sound && O55.sound.log) || [];
      let last = null;
      for (let i = log.length - 1; i >= 0 && i >= log.length - 8; i--) { const e = log[i]; if (now - e.t >= 70) break; if (e.played) { last = e; break; } }
      if (tries < 4 && last) { setTimeout(() => this.blockSfx(S, o, tries + 1), Math.max(1, last.t + 85 - now)); return; }
      try { S.play('block', o); } catch (e) { /* sound never stops the stage */ }
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
      /* made invisible and placed before the browser can paint it: a new group has no transform or opacity of its own until
         render() gives it one, so the QR, laptop or server painted clipped at the stage's top-left for 3 frames (FA-10) */
      const g = el('g', { class: 'pst-prop', 'data-kind': spec.kind, opacity: '0' }, this.gProps);
      const pr = { spec, el: g, strs: [], state: 'in', a: 0, av: 0, len: 0, lenv: 0, ax: 0, axv: 0, scale: spec.scale || 1, sv: 0, op: 0, born: this.t, key: '', settled: !!instant };
      this.props.set(spec.id, pr);
      this.drawProp(pr);
      const tgt = this.propTarget(pr);
      pr.ax = tgt.ax; pr.len = instant ? tgt.len : 0; pr.op = instant ? tgt.op : 0;
      if (!instant) {
        pr.av = (Math.random() - .5) * this.fam.kick * 2;
        this.sfx(spec.preview ? 'ghost' : 'lower', { x: tgt.ax, len: clamp(tgt.len, 0, 400) });
      }
      this.placeProp(pr);
      if (!instant) this.enterUnder(pr, tgt);
      return pr;
    }
    /* NieR's speech box stands still over the stage (at the top of a short window's banner, over the column the props
       hang in), and a prop lowered from above went down behind its PIP tab and its box: each of Creating's blocks for about
       half a second at 740, the cloud on Safe's Add one. A prop whose place is under the box comes in from just below
       its lower edge instead, fading in there as it is lowered the rest of the way. (Elsewhere the bubble moves out of a
       prop's way, so props come in from above.) */
    enterUnder(pr, tgt) {
      const sb = this.famName === 'nier' ? this.keepOff : null;
      if (!sb) return;
      const g = 4 / ((this.map && this.map.k) || 1), len0 = pr.len;
      pr.len = tgt.len; this.placeProp(pr);
      const b = pr.box;
      /* (a place under the box: across its span and below its middle; one that rests inside its margin appears in place) */
      pr.len = b && b[0] < sb[2] + g && b[2] > sb[0] - g && b[1] >= (sb[1] + sb[3]) / 2 ? Math.max(len0, tgt.len - Math.max(0, b[1] - (sb[3] + g))) : len0;
      this.placeProp(pr);
    }
    /* the speech box a moving prop keeps out of, in scene units: NieR's fixed box with its tab, or the bubble where it is
       now (with its tail) */
    band() { return this.famName === 'nier' ? this.nierBox || null : this.bubbleBox || null; }
    /* A leaving prop is lifted away on its strings and fades. Lifted straight up, one under the speech box went up through
       it (FO-34: the folder through Glass Dark's bubble on AST3; NieR's box and PIP tab at 740 on every Add one and Back).
       It now lifts only as far as the box's lower edge, and fades there. */
    holdUnder(pr, tg) {
      const sb = this.band(), b = pr.box;
      if (!sb || !b || pr.op <= .05) return;
      const g = 4 / ((this.map && this.map.k) || 1);
      if (b[0] >= sb[2] + g || b[2] <= sb[0] - g || b[1] < (sb[1] + sb[3]) / 2) return;
      /* (the length that puts its top at the edge; one already resting inside the box's margin stays where it is) */
      const hold = Math.max(pr.holdLen == null ? -Infinity : pr.holdLen, pr.len + Math.min(0, sb[3] + g - b[1]));
      pr.holdLen = hold;
      if (hold > tg.len) { tg.len = hold; pr.held = true; }
    }
    /* A badge (Basic's check and the ring that spreads from it) rides its prop's corner, and a prop at the pane's edge put
       the ring past it, cut by the pane (FO-35, AST4's key at the right edge): the badge stays whole inside the visible
       stage, and the ring spreads only as far as the room it has there */
    keepIn(p) {
      const v = this.vis; if (!v) return;
      const pad = 2, r = p.reach || 0;
      p.x = v.x1 - v.x0 > 2 * (r + pad) ? clamp(p.x, v.x0 + r + pad, v.x1 - r - pad) : (v.x0 + v.x1) / 2;
      p.y = v.y1 - v.y0 > 2 * (r + pad) ? clamp(p.y, v.y0 + r + pad, v.y1 - r - pad) : (v.y0 + v.y1) / 2;
      if (p.ringR) p.room = Math.max(1, (Math.min(p.x - v.x0, v.x1 - p.x, p.y - v.y0, v.y1 - p.y) - pad) / p.ringR);
    }
    /* where a prop hangs this frame, its strings and its opacity (render(); and addProp, so a new prop is never painted
       before it is placed) */
    placeProp(pr) {
      const Lay = this.L;
      const tg = this.propTarget(pr); let sc = tg.sc * (pr.scale / (pr.spec.scale || 1));
      const tieMid = [pr.ties.reduce((m, t) => m + t[0], 0) / pr.ties.length, tg.tieY];
      const hang = [pr.ax + Math.sin(pr.a) * Math.max(0, pr.len), Lay.anchorY + Math.cos(pr.a) * Math.max(0, pr.len)];
      /* the whole prop stays inside the pane it is painted in, as it swings too: a sign with a long name hung at pairB
         crossed the pane's right edge at the divider and lost its end (SOL-AST1-01); it moves in, or is drawn smaller
         only when even that is not room enough. Its strings move with it. */
      const fit = this.fit(pr, hang, sc, tieMid); hang[0] += fit.dx; hang[1] += fit.dy; sc *= fit.f; pr.dx = fit.dx; pr.box = fit.box; pr.placedN = this.renderN;
      const cv = rot([-tieMid[0] * sc, -tieMid[1] * sc], pr.a);
      pr.pos = [hang[0] + cv[0], hang[1] + cv[1]];
      const sq = this.reduced ? 0 : clamp(pr.sq || 0, -.12, .12), squash = Math.abs(sq) > .002 ? ` translate(0 ${R(pr.foot)}) scale(${R(1 + sq * .6)} ${R(1 - sq)}) translate(0 ${R(-pr.foot)})` : '';
      sa(pr.el, 'transform', `translate(${R(hang[0])} ${R(hang[1])}) rotate(${R(pr.a * 57.3)}) scale(${R(sc)}) translate(${R(-tieMid[0])} ${R(-tieMid[1])})${squash}`);
      sa(pr.el, 'opacity', R(pr.op));
      // once a block is set down its strings are unhooked: they go slack, lift away and fade
      const off = pr.spec.ground && pr.landed ? clamp((this.t - pr.landT) / .55, 0, 1) : 0;
      const strOp = off ? Math.max(0, 1 - ease(off)) * pr.op : pr.op;
      /* each string hangs from the anchor of the prop's rest pose (restPose: its destination's ax, scale and dy), the
         same point on its first frame, through its swing and at rest, and is drawn straight from its tie through that
         anchor and on above it. Drawn instead from a point 200 above the anchor at this frame's fit offset, the line
         turned about that far point while the prop swung about the anchor, so where a string met the pane's top slid
         across it as it swung and whenever fit's offset changed (QA-6: up to 25 units at the top edge) */
      const rp = this.restPose(pr);
      pr.ties.forEach((t, i) => {
        const v = rot([(t[0] - tieMid[0]) * sc, (t[1] - tieMid[1]) * sc], pr.a), end = [hang[0] + v[0], hang[1] + v[1] - ease(off) * 70];
        /* the anchor stands over the pivot the prop swings from (pr.ax, with the destination's fit offset): a prop
           kept from the last screen travels to its new slot on that pivot's spring, and its strings travel with it
           instead of jumping to the new slot's anchor in one frame (r-pick to r-preview's restore). The painted
           prop eases its own copy of that offset (aimDx/aimDy); the string stays on this rest suspension, which
           QA-6 requires the drawn line to pass through. */
        const anch = [pr.ax + (rp.ax - tg.ax) + (t[0] - tieMid[0]) * rp.sc, Lay.anchorY + rp.dy];
        const av = [anch[0] - end[0], anch[1] - end[1]], al = Math.hypot(av[0], av[1]);
        /* The continuation is the ray from the painted tie through the rest anchor, and only
           upward. Extending it whenever the tie was more than 0.001 away sent the far end
           downward once the tie sat above the anchor: Basic Dark's cloud drew one frame from
           the anchor to a point inside the pane, and longer ties (Basic Light's kit) did the
           same. A tie above or level with the anchor stops at the suspension. Straight up
           remains only when the tie is on the anchor and the ray is undefined. A tie below
           the anchor still continues 200 units past it, so the stroke stays on the anchor. */
        let top = [anch[0], anch[1] - 200];
        if (al > 1e-3) {
          top = [anch[0] + av[0] / al * 200, anch[1] + av[1] / al * 200];
          if (top[1] >= anch[1]) top = [anch[0], anch[1]];
        }
        sa(pr.strs[i], 'd', `M${R(top[0])} ${R(top[1])}L${R(end[0])} ${R(end[1])}`);
        sa(pr.strs[i], 'opacity', R(strOp));
        pr.strs[i].classList.toggle('pst-dash', !!pr.spec.preview);
      });
    }
    /* Room swept by a resting prop's small swing, including the pendulum's travel as well as the rotated drawing.
       Speech must clear that room, not just the upright box (the 740 Retro vault reached 7 px into the bubble).
       This reservation is independent of the current angle, so neither destination nor bubble refits during entry. */
    speechSway(pr, sc, tm, len) {
      const bb = pr.spaceBB || pr.bb;
      if (this.still() || !H.part('sway-and-physics') || pr.spec.ground || !bb) return [0, 0];
      const [x, y, w, h] = bb, pts = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]];
      const base = pts.map(([x, y]) => [(x - tm[0]) * sc, (y - tm[1]) * sc]);
      const swept = [-.15, 0, .15].flatMap((a) => base.map((p) => { const q = rot(p, a); return [q[0] + Math.sin(a) * len, q[1] + (Math.cos(a) - 1) * len]; }));
      const span = (ps, axis) => [Math.min(...ps.map((p) => p[axis])),Math.max(...ps.map((p) => p[axis]))];
      return [0, 1].map((i) => { const b = span(base, i), q = span(swept, i); return Math.max(b[0] - q[0], q[1] - b[1]); });
    }
    /* The shared destination used by the drop, the bubble's occupancy and the strings' suspension. It exists before
       the first visible frame, independent of entry opacity, spring progress and swing. A scene/layout change refits
       it; an outgoing prop keeps the place it left. Only preceding props participate, so the order has no cycle. */
    restPose(pr) {
      if (pr.state === 'out' && pr.restFit) return pr.restFit;
      const tg = this.propTarget(pr), tm = [pr.ties.reduce((m, t) => m + t[0], 0) / pr.ties.length, tg.tieY];
      const preceding = [];
      for (const [id, q] of this.props) { if (q.state !== 'out') preceding.push([id, q.spec]); if (q === pr) break; }
      const key = JSON.stringify([this.theme, this.layoutName, this.vis, this.lastScreen, this.spec.pip,
        this.reduced, !!O55.motion.lowResource, H.part('sway-and-physics'),
        this.keepOff, this.pipAt, this.pipOff, this.pipBB, pr.bb, pr.spaceBB, preceding]);
      if (pr.restFit && pr.restFit.key === key) return pr.restFit;
      const geometry = JSON.stringify([this.theme, this.layoutName, this.vis, this.lastScreen, pr.bb, pr.spaceBB, tg.ax, tg.len, tg.sc, tm]);
      /* The wire is the slot, not the drawing. A new line redraws the art and moves the speech obstacle,
         so a key that included the box never matched and the clearance ran again. */
      const wireKey = JSON.stringify([this.theme, this.layoutName, this.lastScreen]);
      const kept = pr.restFit && pr.restFit.geometry === geometry ? pr.restFit : null;
      /* A shorter slot keeps the offset it solved and the length spring carries it. The hold
         lasts while the slot stays that short. The fit below keeps that offset while it clears
         the speech, and moves it by the least way out when it does not. A longer slot refits. */
      const sameWire = pr.restFit && pr.restFit.wireKey === wireKey;
      const onWire = sameWire && (pr.restFit.len - tg.len > .5 || (pr.restFit.held && tg.len <= pr.restFit.len + .5)) ? pr.restFit : null;
      const fit = this.fit(pr, [tg.ax, this.L.anchorY + tg.len], tg.sc, tm, true, pr.spaceBB, kept, onWire);
      /* A longer slot whose solved box stays at the same height has folded the extra length
         into the offset. Retro Light away then holds painted y while the string lengthens
         (305.4 to 388, the offset from about -105 to -183) and the frame never descends.
         Keep the offset already solved so painted y descends with the length. A box on the
         pane floor stays there. A fit that actually moves the prop, such as the corridor
         lift, is kept and still eases. */
      if (!onWire && pr.restFit && pr.restFit.box && fit.box && tg.len > pr.restFit.len + .5) {
        const oldC = (pr.restFit.box[1] + pr.restFit.box[3]) / 2, newC = (fit.box[1] + fit.box[3]) / 2;
        const v = this.vis, onFloor = v && fit.box[3] >= v.y1 - 9;
        if (!onFloor && Math.abs(newC - oldC) < 1) {
          const add = pr.restFit.dy - fit.dy;
          fit.dy = pr.restFit.dy;
          fit.box = [fit.box[0], fit.box[1] + add, fit.box[2], fit.box[3] + add];
          if (pr.restOff) pr.restOff.dy = fit.dy;
        }
      }
      const sc = tg.sc * fit.f, spaceBox = fit.box, bb = pr.bb;
      const actual = pr.spaceBB && bb ? [tg.ax + fit.dx + (bb[0] - tm[0]) * sc, this.L.anchorY + tg.len + fit.dy + (bb[1] - tm[1]) * sc,
        tg.ax + fit.dx + (bb[0] + bb[2] - tm[0]) * sc, this.L.anchorY + tg.len + fit.dy + (bb[1] + bb[3] - tm[1]) * sc] : fit.box;
      pr.restBox = actual;
      if (pr.spaceBB && bb) {
        // Preserve this exact fit on exit too: the capacity frame can reach the pane before the smaller drawing does.
        const room = this.vis.x1 - this.vis.x0 - 16, base = room > 0 ? Math.min(1, room / (bb[2] * tg.sc)) : 1;
        const lo = tg.ax + (bb[0] - tm[0]) * tg.sc * base, hi = tg.ax + (bb[0] + bb[2] - tm[0]) * tg.sc * base;
        let edge = hi > this.vis.x1 - 8 ? this.vis.x1 - 8 - hi : 0;
        if (lo + edge < this.vis.x0 + 8) edge = this.vis.x0 + 8 - lo;
        pr.restOff = {dx: fit.dx - edge, dy: fit.dy, g: fit.f / base};
      }
      const reach = this.speechSway(pr, tg.sc * fit.f, tm, tg.len), b = fit.box;
      const speechBox = b && [b[0] - reach[0], b[1] - reach[1], b[2] + reach[0], b[3] + reach[1]];
      return (pr.restFit = Object.assign({ key, geometry, wireKey, len: tg.len, held: !!onWire, speechBox, spaceBox, ax: tg.ax + fit.dx, sc }, fit, {box: actual}));
    }
    /* how far a prop must move (dx, dy) or shrink (f) for its drawing, at its angle, to sit inside the pane's visible span
       (this.vis, from measure) with a margin, and off a speech box that cannot move out of its way (this.keepOff: NieR's
       fixed box, or a bubble that found no clear place); box is where it is then painted */
    fit(pr, hang, sc, tm, destination, shape, kept, onWire) {
      const v = this.vis; let bb = shape || pr.bb;
      if (!v) return { dx: 0, dy: 0, f: 1, box: null };
      if (!bb || !bb[2]) { bb = pr.bb = this.boxOf(pr.el); if (!bb || !bb[2]) return { dx: 0, dy: 0, f: 1, box: null }; }
      const cs = [[bb[0], bb[1]], [bb[0] + bb[2], bb[1]], [bb[0], bb[1] + bb[3]], [bb[0] + bb[2], bb[1] + bb[3]]].map(([x, y]) => rot([(x - tm[0]) * sc, (y - tm[1]) * sc], destination ? 0 : pr.a));
      let lo = Math.min(...cs.map((c) => c[0])), hi = Math.max(...cs.map((c) => c[0])), tp = Math.min(...cs.map((c) => c[1])), bt = Math.max(...cs.map((c) => c[1])), f = 1;
      const pad = 8, room = v.x1 - v.x0 - pad * 2, hx = hang[0], hy = hang[1];
      const rest = pr.state !== 'out' && pr.spec.stack == null;
      if (rest && !destination) {
        /* Fit the destination, then lower the prop into it on its spring. Fitting the moving pose picked the nearest
           side of another prop every frame: Recovery Kit > backup list pinned the clipboard above the restore box
           for 120 ms, then switched below it in one frame (QA-7). The other props' destinations participate too, so
           their entry opacity or progress cannot change this prop's landing place halfway down. */
        const fit = this.restPose(pr);
        lo *= fit.f; hi *= fit.f; tp *= fit.f; bt *= fit.f;
        /* The destination offset is where the prop will hang, not where it hangs this frame. Painting a newly
           fitted offset in one frame snaps it while the spring is still at the old length: the head corridor
           (88f885da8e) lifts Glass Light's house about 170px when its slot lengthens, and that lift was applied
           as a position. step() eases aimDx/aimDy on the prop spring; this frame keeps the offset already under way. */
        if (pr.aimDx == null) { pr.aimDx = fit.dx; pr.aimDy = fit.dy; pr.aimDxv = 0; pr.aimDyv = 0; }
        let dx = pr.aimDx, dy = pr.aimDy;
        // A swing still stays inside the pane; the incoming prop may pass its top edge on its strings.
        if (hx + hi + dx > v.x1 - pad) dx = v.x1 - pad - (hx + hi);
        if (hx + lo + dx < v.x0 + pad) dx = v.x0 + pad - (hx + lo);
        if (hy + bt + dy > v.y1 - pad) dy = v.y1 - pad - (hy + bt);
        return { dx, dy, f: fit.f, box: [hx + lo + dx, hy + tp + dy, hx + hi + dx, hy + bt + dy] };
      }
      if (hi - lo > room && room > 0) { f = room / (hi - lo); lo *= f; hi *= f; tp *= f; bt *= f; }
      let dx = 0, dy = 0;
      if (hx + hi > v.x1 - pad) dx = v.x1 - pad - (hx + hi);
      if (hx + lo + dx < v.x0 + pad) dx = v.x0 + pad - (hx + lo);
      /* (up and down too, for a prop at rest: one coming in or going out passes the top edge on its strings, and Creating's
         blocks stand on the floor) */
      const dxEdge = dx, visible = destination ? 1 : pr.op;
      /* the least move (inside the pane) that clears every box in obs, or drawn a little smaller only when no way does */
      const clear = (obs) => {
        const L0 = lo, H0 = hi, T0 = tp, B0 = bt, f0 = f; let g = 1;
        for (let it = 0; it < (destination ? 12 : 6) && obs.length; it++) {
          const X0 = hx + lo + dx, X1 = hx + hi + dx, Y0 = hy + tp + dy, Y1 = hy + bt + dy;
          const hit = (ax, ay) => obs.find((o) => X0 + ax < o[2] && X1 + ax > o[0] && Y0 + ay < o[3] && Y1 + ay > o[1]);
          const o = hit(0, 0); if (!o) break;
          const inside = (ax, ay) => X0 + ax >= v.x0 + pad - .5 && X1 + ax <= v.x1 - pad + .5 && Y0 + ay >= v.y0 + pad - .5 && Y1 + ay <= v.y1 - pad + .5;
          const best = (list) => list.filter(([ax, ay]) => inside(ax, ay) && !hit(ax, ay)).sort((p, q) => Math.hypot(p[0], p[1]) - Math.hypot(q[0], q[1]))[0];
          let c = best([[0, o[3] - Y0], [0, o[1] - Y1], [o[0] - X1, 0], [o[2] - X0, 0], [o[0] - X1, o[3] - Y0], [o[2] - X0, o[3] - Y0], [o[0] - X1, o[1] - Y1], [o[2] - X0, o[1] - Y1]]);
          /* (and where no way off the box it meets is clear, the ways past the others too, each edge of each box across and
             down: Retro Dark's c-ready at 740, the server under the bubble that claimed its place, Pip's head on its left,
             the laptop on its right and the tube's foot below; the only ways tried were round the bubble, so it was drawn
             smaller and smaller under it, still under it (N1, astra-review-retro-3). Past the laptop it hangs whole) */
          if (!c) {
            const xs = [0], ys = [0];
            obs.forEach((q) => { xs.push(q[0] - X1, q[2] - X0); ys.push(q[1] - Y1, q[3] - Y0); });
            c = best(xs.flatMap((ax) => ys.map((ay) => [ax, ay])));
          }
          if (c) { dx += c[0]; dy += c[1]; break; }
          if (g <= .66) break;
          g = destination ? Math.max(.66, g * .9) : g * .9; f = f0 * g; lo = L0 * g; hi = H0 * g; tp = T0 * g; bt = B0 * g;
        }
        return g;
      };
      if (rest) {
        /* A shorter slot stays on the offset it already solved. The pane clamps still apply.
           That offset remains the wire while the drawing clears the speech. A shorten that
           leaves the drawing inside the speech moves it by the least way out, from the offset
           it already has, and the aim spring eases that. A longer slot is free to refit. */
        if (destination && onWire) {
          const wf = onWire.f || 1, fPane = f;
          const uLo = Math.min(...cs.map((c) => c[0])) * wf, uHi = Math.max(...cs.map((c) => c[0])) * wf;
          const uTp = Math.min(...cs.map((c) => c[1])) * wf, uBt = Math.max(...cs.map((c) => c[1])) * wf;
          let wdx = onWire.dx, wdy = onWire.dy;
          if (hx + uHi + wdx > v.x1 - pad) wdx = v.x1 - pad - (hx + uHi);
          if (hx + uLo + wdx < v.x0 + pad) wdx = v.x0 + pad - (hx + uLo);
          if (hy + uBt + wdy > v.y1 - pad) wdy = v.y1 - pad - (hy + uBt);
          if (hy + uTp + wdy < v.y0 + pad) wdy = v.y0 + pad - (hy + uTp);
          const box = [hx + uLo + wdx, hy + uTp + wdy, hx + uHi + wdx, hy + uBt + wdy];
          const reach = this.keepOff ? this.speechSway(pr, sc, tm, this.propTarget(pr).len) : [0, 0];
          const o = this.keepOff;
          const band = o ? [o[0] - reach[0], o[1] - reach[1], o[2] + reach[0], o[3] + reach[1]] : null;
          const into = band && box[0] < band[2] - 1e-7 && box[2] > band[0] + 1e-7 && box[1] < band[3] - 1e-7 && box[3] > band[1] + 1e-7;
          if (!into) {
            pr.restOff = { dx: wdx - dxEdge, dy: wdy, g: wf / fPane };
            return { dx: wdx, dy: wdy, f: wf, box };
          }
          f = wf; lo = uLo; hi = uHi; tp = uTp; bt = uBt; dx = wdx; dy = wdy;
          clear([band]);
          pr.restOff = { dx: dx - dxEdge, dy, g: f / fPane };
          return { dx, dy, f, box: [hx + lo + dx, hy + tp + dy, hx + hi + dx, hy + bt + dy] };
        }
        if (hy + bt > v.y1 - pad) dy = v.y1 - pad - (hy + bt);
        if (visible > .95 && hy + tp + dy < v.y0 + pad) dy = v.y0 + pad - (hy + tp);
        /* off what it must not touch: a speech box that cannot move (keepOff) and the props already placed this frame
           (the name's sign and the service's mark at a short window); it moves the least way that clears them all,
           inside the pane, and is drawn a little smaller only when no way does */
        const obs = [];
        if (this.keepOff && visible > .05) {
          const o = this.keepOff, reach = destination ? this.speechSway(pr, sc, tm, this.propTarget(pr).len) : [0, 0];
          obs.push([o[0] - reach[0], o[1] - reach[1], o[2] + reach[0], o[3] + reach[1]]);
        }
        /* (and off Pip's head where it hangs at rest: Retro's crop pushed a sign in from its cut side over Pip, FO-50) */
        const pk = destination ? this.pipHead(0, null, true) : this.pipKeep;
        if (pk && visible > .05) {
          /* A prop lowered from above must stop above the swept head, or pass beside it. Extending this
             obstacle below the head tests that whole entry path; extending it ABOVE the head too wrongly
             removed valid above-head destinations and shrank the 860 Retro sign to an unreadable size. */
          const reach = destination ? this.speechSway(pr, sc, tm, this.propTarget(pr).len) : [0, 0];
          obs.push(destination ? [pk[0] - 4 - reach[0], pk[1] - 4 - reach[1], pk[2] + 4 + reach[0], v.y1 + this.L.h]
            : [pk[0] - 4, pk[1] - 4, pk[2] + 4, pk[3] + 4]);
        }
        let before = true;
        this.props.forEach((q) => {
          if (q === pr) { before = false; return; }
          if (q.state === 'out' || (destination ? !before : q.placedN !== this.renderN || q.op <= .05)) return;
          const pose = destination ? this.restPose(q) : null, b = pose ? pose.spaceBox || pose.box : q.box;
          if (b) obs.push([b[0] - 4, b[1] - 4, b[2] + 4, b[3] + 4]);
        });
        /* Releasing a speech obstacle must not teleport a prop back to its default slot. Its old destination is
           reusable only for identical art/target geometry, inside today's crop and clear of EVERY current obstacle.
           A changed shape, slot, layout or colliding obstacle still takes the ordinary fit below. */
        if (destination && kept) {
          const b = [hx + Math.min(...cs.map(c => c[0])) * kept.f + kept.dx, hy + Math.min(...cs.map(c => c[1])) * kept.f + kept.dy,
            hx + Math.max(...cs.map(c => c[0])) * kept.f + kept.dx, hy + Math.max(...cs.map(c => c[1])) * kept.f + kept.dy];
          if (b[0] >= v.x0 + pad - .5 && b[2] <= v.x1 - pad + .5 && b[1] >= v.y0 + pad - .5 && b[3] <= v.y1 - pad + .5
            && !obs.some(o => b[0] < o[2] - 1e-7 && b[2] > o[0] + 1e-7 && b[1] < o[3] - 1e-7 && b[3] > o[1] + 1e-7)) {
            pr.restOff = {dx: kept.dx - dxEdge, dy: kept.dy, g: kept.f / f};
            return {dx: kept.dx, dy: kept.dy, f: kept.f, box: b};
          }
        }
        const g = clear(obs);
        pr.restOff = { dx: dx - dxEdge, dy, g };
      } else if (pr.state === 'out') {
        /* a prop that leaves keeps the way it was moved off the box and its neighbours at rest: dropping it at once made the
           prop jump up to 8 px in the frame it began to leave, into NieR's box at 740 (FO-34 kind) */
        const o = pr.restOff || { dx: 0, dy: 0, g: 1 }; f *= o.g; lo *= o.g; hi *= o.g; tp *= o.g; bt *= o.g; dx += o.dx; dy = o.dy;
        /* ...and makes way, as a prop at rest does, for a speech box that cannot move: a bubble that found nowhere clear
           and claimed a place over it (Retro's 740 banner on Name > Safe: between Pip's face and the leaving sign there
           was no room, so the bubble claimed the sign's place and the sign faded out under it for 8-13 frames), or NieR's
           box. The move is kept for the rest of its way out, which holdUnder then keeps below the box */
        const obs = [];
        if (this.keepOff && pr.op > .05) obs.push(this.keepOff);
        const pk = this.pipKeep;
        if (pk && pr.op > .05) obs.push([pk[0] - 4, pk[1] - 4, pk[2] + 4, pk[3] + 4]);
        // Keep each correction through the exit; releasing it on the next frame snaps the sign back into Pip.
        if (obs.length) { const g = clear(obs); pr.restOff = { dx: dx - dxEdge, dy, g: o.g * g }; }
      }
      return { dx, dy, f, box: [hx + lo + dx, hy + tp + dy, hx + hi + dx, hy + bt + dy] };
    }
    /* how far Pip's spot (the hand's, at) must move for the hand and Pip, hanging at rest, to sit whole inside the pane's
       visible span with the props' margin. Retro's tube slices the scene to fill the pane: a short window's crop left
       Pip's spot (84 units) off the tube altogether (FO-37), and the narrow strip's cut the hand at the top. Pip's box is
       its own drawing's (the hand's and the head's), placed as render() places them; the margin narrows where the span
       is barely tall enough, and where it is not, the hand stays whole */
    pipFit(at) {
      const v = this.vis, Lay = this.L, L0 = this.L0 || Lay;
      if (!v || !this.gCtl || !this.gHead) return [0, 0];
      if (!this.pipBB) { const c = this.boxOf(this.gCtl), h = this.boxOf(this.gHead); if (!c || !c[2] || !h || !h[2]) return [0, 0]; this.pipBB = { c, h }; }
      const { c, h } = this.pipBB;
      const lo = Math.min(c[0], h[0]) - 32, hi = Math.max(c[0] + c[2], h[0] + h[2]) - 32;
      const into = (a0, a1, v0, v1) => {
        const pad = clamp((v1 - v0 - (a1 - a0)) / 2, 0, 8); let d = 0;
        if (a1 > v1 - pad) d = v1 - pad - a1;
        if (a0 + d < v0 + pad) d = v0 + pad - a0;
        return d;
      };
      /* Pip hangs below the stage's own words over its column (Retro's title line, NieR's unit line: the bar crossed
         Retro Light's SETUP LOG at 740, FO-55). The lead's ruling: Pip is drawn smaller only where those words cut its
         span, and never under 80% of its size. Under the words it takes the largest size that keeps its 8-unit margins
         (.82 in Retro Light at 740), at least .8, narrowing the margins only if .8 needs it; at its size elsewhere. If
         not even .8 fits under the words, it hangs in the nearest column clear of them inside the crop, at its size;
         only with no such column is it drawn at .8 under them. One size for the span, at once, never animated */
      const s0 = L0.s, tall0 = L0.rope + (h[1] + h[3] - 31.5 - (c[1] - 14.5)) * s0;
      const col = (x) => { const d = into(x + lo * s0, x + hi * s0, v.x0, v.x1); return [x + d + lo * s0 - 4, x + d + hi * s0 + 4]; };
      const over = (x) => { const [X0, X1] = col(x); return (this.hdr || []).filter((w) => w.x1 > X0 && w.x0 < X1 && w.y1 > v.y0); };
      let ax = at[0], y0 = v.y0, k = 1;
      const ws = over(ax);
      if (ws.length) {
        const yw = Math.max(...ws.map((w) => w.y1));
        if (v.y1 - yw >= .8 * tall0) { y0 = yw; k = clamp((v.y1 - yw - 16) / tall0, .8, 1); }
        else {
          const [X0, X1] = col(ax), right = Math.max(...ws.map((w) => w.x1)) + 4 - X0, left = Math.min(...ws.map((w) => w.x0)) - 4 - X1;
          const clear = [right, left].filter((d) => X0 + d >= v.x0 && X1 + d <= v.x1 && !over(ax + d).length).sort((p, q) => Math.abs(p) - Math.abs(q));
          if (clear.length) ax += clear[0];
          else { y0 = yw; k = .8; }
        }
      }
      if (Math.abs(k - (this.pipK || 1)) > .002) this.setPipK(k);
      const s = Lay.s, dy = into(at[1] + (c[1] - 14.5) * s, at[1] + Lay.rope + (h[1] + h[3] - 31.5) * s, y0, v.y1);
      /* (and the bar rocks, while Pip works, only as far as the room above it: its ends rose 2.6 px past Retro Dark's tube
         at 740 on Creating, the span there barely holding Pip at rest) */
      const room = at[1] + dy + (c[1] - 14.5) * s - y0, halfW = Math.max(Math.abs(c[0] - 32), Math.abs(c[0] + c[2] - 32)) * s;
      this.rockMax = Math.min(.12, Math.asin(clamp(room / (halfW || 1), 0, 1)));
      return [ax - at[0] + into(ax + lo * s, ax + hi * s, v.x0, v.x1), dy];
    }
    /* Pip drawn at k of its layout's size: its drawing and the rope it hangs on, and the strings' rest lengths */
    setPipK(k) {
      const L0 = this.L0, Lay = this.L;
      this.pipK = k;
      if (k === 1) { delete Lay.s; delete Lay.rope; } else { Lay.s = L0.s * k; Lay.rope = L0.rope * k; }
      if (this.barPts && this.headPts) {
        const rest = this.solveStrings({ C: { x: Lay.ctl[0], y: Lay.ctl[1] }, phi: 0, H: this.headAt(Lay.ctl[0], Lay.ctl[1], 0, 0), ang: 0, sx: 1, sy: 1 });
        this.restLen = rest.map((r) => Math.hypot(r.E[0] - r.T[0], r.E[1] - r.T[1]));
      }
      this.dirty = true;
    }
    /* how far Pip's drawn head reaches around the point it hangs from, turned by ang (asleep it tilts), in stage units:
       [left, top, right, bottom]; null until it has been measured */
    pipReach(ang) {
      if (!this.pipBB || !this.vis) return null;
      const h = this.pipBB.h, s = this.L.s, c = Math.cos(ang || 0), n = Math.sin(ang || 0);
      const p = [[h[0], h[1]], [h[0] + h[2], h[1]], [h[0], h[1] + h[3]], [h[0] + h[2], h[1] + h[3]]].map(([x, y]) => { const u = (x - 32) * s, v = (y - 31.5) * s; return [u * c - v * n, u * n + v * c]; });
      return [Math.min(...p.map((q) => q[0])), Math.min(...p.map((q) => q[1])), Math.max(...p.map((q) => q[0])), Math.max(...p.map((q) => q[1]))];
    }
    /* how far a damped swing under way (angle x, speed v; x'' = -w2 x - d x', as step() swings Pip and the props) carries
       before it turns: its next peak, or where it is if that is further, in rad */
    swingAmp(x, v, w, d) {
      const sg = d / 2, wd = Math.sqrt(Math.max(1e-6, w * w - sg * sg)), B = (v + sg * x) / wd, R = Math.hypot(x, B);
      if (R < 1e-5) return 0;
      const phi = Math.atan2(x, B), q = Math.atan(wd / sg) - phi, t1 = (q - Math.PI * Math.floor(q / Math.PI)) / wd;
      return Math.max(Math.abs(x), R * Math.exp(-sg * t1) * Math.abs(Math.sin(wd * t1 + phi)));
    }
    /* how hard an idle swing may push Pip (dir: which way): the largest kick to the swing's speed whose swing, with the one
       already under way, keeps the head's box off every prop still painted, by more than fit()'s margin: where it
       is drawn, where it will hang at rest (a prop still being lowered in counts at its place) and as far as its own
       swing carries it. Measured where a prop was drawn at the kick, Glass Light's forge on Online details at 860 was not
       counted while it was lowered in after the screen changed, or was counted swung away, and swung back under the head
       as Pip swung to it (48 px2, retro-c3's awake guard) */
    swingRoom(dir) {
      const ps = this.ps, F = this.fam, near = [];
      if (!ps || !this.pipKeep) return .5;
      this.props.forEach((p) => {
        if (!p.box || (p.state === 'out' && !(+p.el.getAttribute('opacity') > .05))) return;
        const b = p.box, tg = this.propTarget(p), len = Math.max(0, p.len), L = Math.max(0, tg.len);
        const dx = tg.ax - (p.ax + Math.sin(p.a) * len), dy = tg.len - Math.cos(p.a) * len;
        const sw = Math.sin(this.swingAmp(p.a, p.av, F.pw * Math.sqrt(170 / Math.max(30, L)), F.pdamp)) * L, m = 5;
        near.push([Math.min(b[0], b[0] + dx - sw) - m, Math.min(b[1], b[1] + dy) - m, Math.max(b[2], b[2] + dx + sw) + m, Math.max(b[3], b[3] + dy) + m]);
      });
      const clear = (k) => { const h = this.pipHead(this.swingAmp(ps.th, ps.thv + dir * k, F.w, F.damp)); return !h || !near.some((o) => h[0] < o[2] && h[2] > o[0] && h[1] < o[3] && h[3] > o[1]); };
      if (clear(.5)) return .5;
      if (!clear(0)) return 0;
      let lo = 0, hi = .5;
      for (let i = 0; i < 10; i++) { const k = (lo + hi) / 2; if (clear(k)) lo = k; else hi = k; }
      return lo;
    }
    /* Pip's head where it hangs at rest from the hand's spot, on the floor it rests on: the box the props keep off (fit);
       swing: the swing's reach, rad (by default the one under way); now: the head as render() draws it this frame */
    pipHead(swing, now, resting) {
      const ps = this.ps, Lay = this.L, s = Lay.s;
      if (!ps || !this.pipReach(ps.tiltT)) return null;
      const box = (cx, cy, ang, th) => {
        const r = this.pipReach(ang);
        let y = cy + Math.cos(th || 0) * Lay.rope; const x = cx + Math.sin(th || 0) * Lay.rope;
        if (y + 28 * s > Lay.ground - 2) y = Lay.ground - 2 - 28 * s;
        if (y + r[3] > this.vis.y1) y = this.vis.y1 - r[3];
        return [x + r[0], y + r[1], x + r[2], y + r[3]];
      };
      const join = (a, c) => [Math.min(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[2], c[2]), Math.max(a[3], c[3])];
      /* A destination reserves Pip's canonical rest pose. A current swing or travelling hand must not change a
         prop's fixed suspension when a scene is refitted (QA-6); the ordinary collision box still takes their reach. */
      const pip = this.spec.pip || {}, asleep = resting ? pip.pose === 'asleep' : ps.asleep;
      const at = resting && this.pipAt ? [this.pipAt[0] + (this.pipOff || [0, 0])[0], this.pipAt[1] + (this.pipOff || [0, 0])[1] + (asleep ? Lay.rope * .72 : 0)] : [ps.Ct.x, ps.Ct.y];
      let b = box(at[0], at[1], resting ? (pip.tilt != null ? pip.tilt : asleep ? -.2 : 0) : ps.tiltT);
      /* (and, while the hand travels to a new spot, as Pip wakes and rises from the floor, the head where it hangs now:
         the box takes its whole way, so a sign beside where it rises to is not under it as it comes. Retro Dark Name 860
         showed 40 px2 painted as Pip woke, sol-review-retro-1's awake guard. Not within the idle drift, so resting props
         do not shift as Pip sways) */
      if (!resting && Math.hypot(ps.C.x - ps.Ct.x, ps.C.y - ps.Ct.y) > 8) b = join(b, box(ps.C.x, ps.C.y, ps.tilt + ps.th * .9, ps.th));
      /* (and the room its idle drift takes, awake: a sign beside the resting head was under it as it swayed, Retro Dark 860) */
      const F = this.fam, still = this.reduced || !!O55.motion.lowResource || !H.part('sway-and-physics');
      /* (and the room the swing under way takes, to its next peak either side, the head turned with it as render() turns
         it: a prop lowered in, or swinging back, beside a swinging Pip keeps off its head, as off the resting one) */
      const A = still || resting ? 0 : swing != null ? swing : this.swingAmp(ps.th, ps.thv, F.w, F.damp);
      if (A > .002) [-1, -.5, .5, 1].forEach((q) => { b = join(b, box(ps.Ct.x, ps.Ct.y, ps.tiltT + A * q * .9, A * q)); });
      /* Reserve the same small head motions as speechMotion from the canonical pose. This is a fixed
         swept band, independent of the head's current angle or wake progress, so prop destinations stay fixed. */
      if (resting && !still) {
        const tilt = pip.tilt != null ? pip.tilt : asleep ? -.2 : 0;
        for (const th of [-.15, 0, .15]) for (const turn of [-.2, 0, .2]) for (const dy of F.noHop ? [0] : [-12, 0, 2])
          b = join(b, box(at[0], at[1] + dy, tilt + th * .9 + turn, th));
      }
      const sw = still ? 0 : F.sway * (asleep ? .2 : 1), bob = still || !F.bob ? 0 : F.bob * .6;
      b = [b[0] - sw, b[1] - bob, b[2] + sw, b[3] + bob];
      /* (and the head where it is drawn now, turned, stretched and lifted as render() draws it: with no room to swing Pip
         wiggled, and the turn took its head 4 units past that box into the forge held at its edge as the forge swung in,
         Glass Light 860, retro-c4) */
      if (now && !resting) {
        const h = this.pipBB.h, c = Math.cos(now.ang), n = Math.sin(now.ang);
        const p = [[h[0], h[1]], [h[0] + h[2], h[1]], [h[0], h[1] + h[3]], [h[0] + h[2], h[1] + h[3]]].map(([x, y]) => {
          const u = (x - 32) * now.sx * s, v = ((y - 59.5) * now.sy + 28) * s;
          return [now.H[0] + u * c - v * n, now.H[1] + u * n + v * c];
        });
        b = join(b, [Math.min(...p.map((q) => q[0])), Math.min(...p.map((q) => q[1])), Math.max(...p.map((q) => q[0])), Math.max(...p.map((q) => q[1]))]);
      }
      return b;
    }
    /* Creating's and Protect's stack of blocks stands on the lowest floor a person can see, and is drawn closer and
       smaller when it would rise past the pane's top or into a speech box that cannot move (Retro's tube crops the floor
       at a narrow window; NieR's box sits over the column): its blocks were cut at the bottom, or under NieR's words */
    stackFit() {
      const Lay = this.L, [x, base, step] = Lay.stack, v = this.vis;
      if (!v) return { x, base, step, f: 1 };
      const pad = 8, half = 34 * Lay.propScale, o = this.keepOff;
      // Reserve the owner's full phase plan, including the interval before its first block exists.
      let n = this.spec.stackCount || 0; this.props.forEach((p) => { if (p.spec.stack != null && p.state !== 'out') n = Math.max(n, p.spec.stack + 1, p.spec.params && p.spec.params.count || 0); });
      const need = Math.max(1, n) * step + 22 * Lay.propScale;
      const floor = Math.min(base, v.y1 - pad), ceiling = v.y0 + pad;
      let column = x, bottom = floor, top = ceiling;
      /* A banner has a separate right-hand column for the stack. Pick it from the fixed crop and head before
         the first block enters: moving it in response to each speech claim made its string tops travel71 units.
         NieR's fixed dialogue owns that column, so its stack keeps the existing vertical clearance there. */
      if (this.layoutName !== 'portrait' && this.famName !== 'nier') {
        const side = v.x1 - half - pad, head = this.pipHead(0, null, true);
        if (side - half >= v.x0 + pad && (!head || side - half - 4 >= head[2])) column = side;
      }
      if (o && o[0] < column + half && o[2] > column - half) {
        if ((o[1] + o[3]) / 2 > (top + bottom) / 2) bottom = Math.min(bottom, o[1] - 4); else top = Math.max(top, o[3] + 4);
      }
      const room = bottom - top;
      const f = need > room && room > 0 ? Math.max(.45, room / need) : 1;
      return { x: column, base: bottom, step: step * f, f,
        box: n ? [column - half, bottom - (n - 1) * step * f - 44 * Lay.propScale * f, column + half, bottom] : null };
    }
    boxOf(g) { try { const b = g.getBBox(); return [b.x, b.y, b.width, b.height]; } catch (e) { return null; } }
    boxInScene(el, gap) {
      if (!el || !el.classList.contains('on') || !(el.textContent || '').trim() || !this.map || !this.screen) return null;
      const r0 = this.screen.getBoundingClientRect(), b = el.getBoundingClientRect(), sx = r0.width / (this.screen.offsetWidth || r0.width || 1), m = this.map;
      if (!b.width || !b.height) return null;
      /* (and its name tab: NieR's PIP tab stands 19 px above the box, outside the box's own rectangle, and the cloud on
         Safe at 740 sat behind it, kept off the box only: FO-39) */
      const tab = el.querySelector(':scope > .pst-bn'), q = tab && tab.getBoundingClientRect();
      const c = q && q.width && q.height ? { left: Math.min(b.left, q.left), top: Math.min(b.top, q.top), right: Math.max(b.right, q.right), bottom: Math.max(b.bottom, q.bottom) } : b;
      const u = (px, py) => [((px - r0.left) / sx - m.ox) / m.k, ((py - r0.top) / sx - m.oy) / m.k];
      const a = u(c.left, c.top), z = u(c.right, c.bottom), g = (gap || 0) / m.k;
      return [a[0] - g, a[1] - g, z[0] + g, z[1] + g];
    }
    drawProp(pr) {
      const key = JSON.stringify(pr.spec.params || {}) + '|' + pr.spec.kind;
      if (key === pr.key) return;
      pr.key = key;
      const d = PW.PROPS[pr.spec.kind](this.pen, pr.spec.params || {});
      pr.el.innerHTML = d.svg;
      pr.ties = d.ties; pr.foot = d.foot; pr.bb = this.boxOf(pr.el);
      if (d.reserve && pr.bb) {
        const a = d.reserve, b = pr.bb, x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]);
        pr.spaceBB = [x, y, Math.max(a[0] + a[2], b[0] + b[2]) - x, Math.max(a[1] + a[3], b[1] + b[3]) - y];
      } else pr.spaceBB = null;
      const n = d.ties.length;
      while (pr.strs.length < n) pr.strs.push(el('path', { class: 'pst-pstrl', fill: 'none', opacity: '0' }, this.gPropStr));
      while (pr.strs.length > n) pr.strs.pop().remove();
      const w = this.w, f = this.famName;
      const col = f === 'glass' ? (w.scheme === 'dark' ? 'rgba(246,248,252,.5)' : 'rgba(12,15,21,.38)') : f === 'basic' ? w.line : f === 'retro' ? (this.tube === 'phosphor' ? w.mid : '#5B544A') : f === 'nier' ? w.ink : TH()[this.theme].str;
      pr.strs.forEach((p) => { p.setAttribute('stroke', col); p.setAttribute('stroke-width', f === 'retro' ? 1.8 : f === 'nier' ? 1 : f === 'basic' ? 1.5 : 2); if (f === 'basic') p.setAttribute('stroke-opacity', '.55'); });
      this.syncDefs();
    }
    slotXY(spec) {
      if (spec.at) return spec.at;
      const Lay = this.L;
      if (spec.stack != null) { const sf = this.stackFit(); return [sf.x + STACK_OFFSETS[spec.stack % STACK_OFFSETS.length] * Lay.propScale, sf.base - spec.stack * sf.step - 22 * Lay.propScale * sf.f]; }
      return Lay.slots[spec.slot] || Lay.slots.side;
    }
    propTarget(pr) {
      const Lay = this.L, [x, y0] = this.slotXY(pr.spec), sc = (pr.spec.scale || 1) * Lay.propScale * (pr.spec.stack != null ? this.stackFit().f : 1);
      const tieY = pr.ties.reduce((m, t) => Math.min(m, t[1]), 0);
      /* a prop at rest hangs whole above the floor, never sunk into it or cut by the stage's edge (Muse m3: the server on
         Where is the backup? sat in the floor line); Creating's blocks stack on the floor by design */
      const y = pr.spec.stack == null && !pr.spec.at && pr.foot != null ? Math.min(y0, Lay.ground - 6 - pr.foot * sc) : y0;
      let len = (y + tieY * sc) - Lay.anchorY;
      if (pr.spec.preview) len -= 26 * Lay.propScale;
      if (pr.state === 'out') len = -10;
      return { ax: x, len, op: pr.state === 'out' ? 0 : pr.spec.preview ? .62 : 1, tieY, sc };
    }
    /* ------------------------------------------------------ direction */
    // spec: { chapter, props:[{id,kind,slot|at|stack,params,preview,scale,ground}], pip:{mood,look,at,pose,work,power,tilt}, say, target, label, cmd }
    direct(spec) {
      /* a new screen starts with no claimed bubble place, before its props are placed: destinations are fitted
         around keepOff (restPose's cache key), so a claim left from the last screen — or made only after the props
         were placed — refitted them mid-scene and the bubble then settled against the shifted boxes (QA-4) */
      if (this.famName !== 'nier') {
        if (spec.screen != null && spec.screen !== this.lastScreen) {
          this.bubbleClaim = null; this.bubbleKeepOff = null; this.keepOff = null; this.bubbleRel = null; this.bubbleRelT = 0; this.speechRoom = null; this.bubbleAnchor = null;
        } else if (this.speechRoom && this.speechRoom.line === this.saying && this.bubble.classList.contains('on') && !this.bubble.classList.contains('pst-hush')
          && JSON.stringify(spec.props || []) !== JSON.stringify(this.spec.props || [])) {
          /* A hover can change its picture while the current question is still being read. The incoming cast
             fits around that line's occupied room, just as it fits around Pip. placeBubble re-derives and
             validates this room against the current geometry; a new line or layout discards it below. */
          this.bubbleRel = this.speechRoom.rel.slice(); this.bubbleClaim = this.speechRoom.rel.slice();
          this.bubbleKeepOff = this.speechRoom.box.slice(); this.keepOff = this.bubbleKeepOff;
        }
      }
      this.spec = spec; this.dirty = true; this.kick();
      if (spec.chapter && spec.chapter !== this.chapter) this.setChapter(spec.chapter);
      const ids = new Set();
      (spec.props || []).forEach((ps) => {
        ids.add(ps.id);
        const pr = this.props.get(ps.id);
        if (!pr || pr.state === 'out') { if (pr) { pr.el.remove(); pr.strs.forEach((s) => s.remove()); this.props.delete(ps.id); } this.addProp(ps); }
        else {
          const wasTarget = this.propTarget(pr);
          const wasPreview = pr.spec.preview;
          pr.spec = ps; this.drawProp(pr);
          const target = this.propTarget(pr), moved = wasTarget.ax !== target.ax || wasTarget.len !== target.len || wasTarget.sc !== target.sc;
          /* A retained prop travelling back from a hover preview has a new arrival to make. Keeping its old
             settled flag called it at rest while both springs were still carrying it through the speech band. */
          if (moved || (wasPreview && !ps.preview)) { pr.settled = false; pr.av += (Math.random() > .5 ? 1 : -1) * this.fam.kick; }
          if (wasPreview && !ps.preview) { pr.settled = false; this.sfx('lower', { x: pr.ax, len: clamp(pr.len, 0, 400) }); }
        }
      });
      this.props.forEach((pr, id) => { if (!ids.has(id) && pr.state !== 'out') { pr.state = 'out'; pr.av += this.fam.kick * .6; if (!pr.spec.preview) this.sfx('lift', { x: pr.ax }); } });
      const pip = spec.pip || {};
      const Lay = this.L;
      const at = pip.at ? (Array.isArray(pip.at) ? pip.at : { left: [Lay.ctl[0] - 30 * (Lay.s / 2.3), Lay.ctl[1]], home: Lay.ctl }[pip.at] || Lay.ctl) : Lay.ctl;
      // asleep: the hand lowers until Pip rests on the floor (kept while the wake is pending)
      const asleep = pip.pose === 'asleep' || !!this.sleepZ;
      /* (its spot fitted to what a person can see, as the props are: pipFit) */
      this.work = !!pip.work; /* (before the fit: how far the bar may rock) */
      const fo = this.pipOff = this.pipFit(at); this.pipAt = at;
      this.ps.Ct.x = at[0] + fo[0]; this.ps.Ct.y = at[1] + fo[1] + (asleep ? Lay.rope * .72 : 0);
      this.ps.asleep = asleep;
      this.ps.tiltT = pip.tilt != null ? pip.tilt : this.ps.asleep ? -.2 : 0;
      this.work = !!pip.work; this.power = pip.power || 0;
      this.pglow.forEach((p) => p.classList.toggle('on', this.power > 0));
      this.root.style.setProperty('--st-power', String(Math.min(1, this.power / 3)));
      this.loopSnd('work', this.work ? 1 : 0);
      this.loopSnd('power', Math.min(1, this.power / 2));
      /* a new screen's line starts at once; changes within a screen take their turn (see say), except where the line on
         show (or waiting its turn) reports an operation that is no longer what the screen shows: its owner (spec.sayOwner,
         55-scenes.js) is not the screen's speech now, because the operation moved on or its inputs changed. Such a line
         gives way at once, whichever path said it (the screen's line, a fault, a cheer); FO-41 */
      const fresh = spec.sayNow || !this.ownerLive(this.sayOwner) || (spec.screen != null && spec.screen !== this.lastScreen); this.lastScreen = spec.screen;
      if (spec.say !== undefined && !this.sleepZ) {
        // A layout rebuild retains the line without replaying it, adopting its current live owner.
        if (this.relayout && spec.say && spec.say === this.saying && this.ownerLive(spec.sayOwner)) {
          this.sayOwner = spec.sayOwner || null; this.sayKept(spec.say);
        } else this.say(spec.say, null, fresh, spec.sayOwner);
      }
      this.hudTarget(spec.target, spec.label);
      if (this.tube) this.cmd(spec.cmd || null);
      if (this.famName === 'nier' && this.hudEl && spec.label) this.decode(spec.label);
      /* All targets and outgoing states now belong to this scene. addProp fitted while the old cast still stood;
         a same-size new line did not wake the bubble's size observer, so a held scene painted that preliminary fit
         for two frames (c-ready: 4.8 px). Draw the finalized scene now, without advancing its held springs. */
      this.render();
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
    /* owner: the operation a line reports (spec.speech's id), or none; a line with an owner is said and kept only while
       that is the screen's speech (ownerLive). The words on show, said again, take the owner they are said for now. */
    ownerLive(owner) { return !owner || (owner.kind === 'ai-account' ? !!(O55.ai && O55.ai.speechLive(O55.S, owner)) : !!(this.spec && this.spec.speech && this.spec.speech.id === owner)); }
    say(text, mood, now, owner) {
      const b = this.bubble;
      text = text || ''; owner = owner || null;
      clearTimeout(this.sayT);
      /* the line a hover typed silently (O6) is said aloud once its choice is picked, without typing it again */
      if (text && text === this.saying && this.sayMuted && b.classList.contains('on') && !(this.spec && this.spec.mute)) { this.sayNext = null; this.sayMuted = false; this.sayOwner = owner; this.voice(text, mood); return; }
      if (!text || now) { this.sayNext = null; if (text !== this.saying || !b.classList.contains('on')) this.sayNow(text, mood, owner); else this.sayOwner = owner; return; }
      if (text === this.saying && b.classList.contains('on')) { this.sayNext = null; this.sayOwner = owner; return; }
      const tn = performance.now(), calm = tn - (this.sayCall || 0) > 380;
      this.sayCall = tn;
      const shown = tn - (this.sayAt || 0), open = b.classList.contains('on');
      // the first line, or one after a calm moment, starts at once; otherwise it waits its turn
      const wait = !open ? 0 : Math.max(calm ? 0 : 380, (this.minShow || 0) - shown);
      if (wait <= 0) { this.sayNow(text, mood, owner); return; }
      this.sayNext = [text, mood, owner];
      this.sayT = setTimeout(() => { const n = this.sayNext; this.sayNext = null; if (n && this.ownerLive(n[2])) this.sayNow(n[0], n[1], n[2]); }, wait);
    }
    sayNow(text, mood, owner) {
      const b = this.bubble, S = snd();
      if (this.typeT) this.typeT.cancel();
      /* New words get a fresh clearance decision before paint. bubbleAnchor is only a candidate for that decision:
         it preserves a valid tail/bottom across a size change, never the old line's claim or its timed step-aside. */
      if (text !== this.saying) { this.bubbleRel = null; this.bubbleRelT = 0; }
      this.saying = text; this.sayOwner = text ? owner || null : null;
      if (!text) { b.classList.remove('on', 'typing'); if (S && S.hush) S.hush(); return; }
      if (!b.classList.contains('on')) { b.classList.remove('on'); void b.offsetWidth; b.classList.add('on'); }
      let r = null;
      const md = mood || (this.spec.pip && this.spec.pip.mood) || 'idle';
      /* a muted line (a look only hovered, O6) is typed at the voice's pace without the voice */
      this.sayMuted = !!(this.spec && this.spec.mute);
      if (S && this.sayMuted) try { if (S.hush) S.hush(); r = S.sayTiming ? S.sayTiming(text, { mood: md }) : null; } catch (e) { r = null; }
      else r = this.voice(text, md);
      const cps = (r && r.cps) || this.fam.cps;
      this.sayAt = performance.now(); this.sayMs = text.length / cps * 1000;
      this.minShow = Math.min(1400, 450 + text.length / cps * 1000 * .6);
      this.btext.innerHTML = '<span class="pst-bt-on"></span><span class="pst-bt-off"></span>';
      const on = this.btext.firstChild, off = this.btext.lastChild;
      if (this.reduced) { on.textContent = text; b.classList.remove('typing'); return; }
      off.textContent = text; b.classList.add('typing');
      this.typeT = H.typer(text.length, cps, (i) => { on.textContent = text.slice(0, i); off.textContent = text.slice(i); },
        { paused: () => !this.live(), done: () => b.classList.remove('typing') });
    }
    /* a new layout: the line Pip has said stays on the new bubble, whole and at once: not typed or voiced again, its box
       not popping in again (SW-23). Its time on screen runs on from when it was said */
    sayKept(text) {
      const b = this.bubble;
      clearTimeout(this.sayT); this.sayNext = null;
      if (this.typeT) this.typeT.cancel();
      b.classList.remove('typing'); b.classList.add('on');
      b.getAnimations().forEach((a) => a.finish());
      this.btext.innerHTML = '<span class="pst-bt-on"></span><span class="pst-bt-off"></span>';
      this.btext.firstChild.textContent = text;
    }
    // the line in Pip's voice (O55.sound.pip through O55.pipVoice): { ms, cps } for the typing
    voice(text, mood) {
      const S = snd(); if (!S || !S.say) return null;
      try { return S.say(text, { mood: mood || (this.spec && this.spec.pip && this.spec.pip.mood) || 'idle', kit: S.kitOf ? S.kitOf(this.theme) : undefined }); } catch (e) { return null; }
    }
    /* ------------------------------------------------------------- tips */
    // a tip Pip writes out when asked (the ? beside a choice): t = { title, text }, or null to put it away
    tip(t, instant) {
      const key = t ? t.title + '\n' + t.text : '';
      if (key === (this.tipKey || '')) return;
      if (this.tipW) this.tipW.cancel();
      /* a new note takes its own place at once, not the last one's (it used to ease up from there and hang past the
         stage's bottom for half a second: tools/tip_fit.mjs) */
      if (!t || !this.tipData || this.tipData.id !== t.id) this.tipXY = null;
      this.tipKey = key; this.tipData = t || null; this.tipLook = 0;
      const el = this.tipEl();
      this.kick();
      if (!t) { if (el) { el.classList.remove('on', 'typing'); el.removeAttribute('id'); el.removeAttribute('role'); el.removeAttribute('aria-label'); } return; }
      this.showTip(instant);
    }
    tipEl() { return this.overlay && this.overlay.querySelector('.pst-tip, .pst-ntip'); }
    showTip(instant) {
      if (this.tipW) this.tipW.cancel();
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
      /* placed at once from Pip's last pose: a stage parked for a moment (the window held, its opening) drew a new note at
         its corner until the next frame, past Friendly's tilted edge (tools/tip_fit.mjs, Welcome and Pick a look) */
      const place = () => { if (this.tipBox && this.tipH) this.placeTip(this.tipH, this.tipAng || 0, 0); };
      if (instant || this.reduced) { el.classList.add('on'); el.classList.remove('typing'); on.textContent = t.text; place(); return; }
      el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
      this.sfx('tip');
      // Pip is pleased to be asked, and reads along while it writes
      const cps = this.tube ? 60 : this.famName === 'nier' ? 55 : 44;
      this.tipLook = this.t + Math.min(3, t.text.length / cps);
      this.feel(this.famName === 'nier' ? 'alert' : 'happy', 900); this.nod(); this.busy();
      off.textContent = t.text; el.classList.add('typing'); place();
      this.tipW = H.typer(t.text.length, cps, (i) => { on.textContent = t.text.slice(0, i); off.textContent = t.text.slice(i); },
        { paused: () => !this.live(), done: () => el.classList.remove('typing') });
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
      /* (toggle with a force that matches leaves the attribute alone: remove() wrote `class` every frame, one mutation
         record a frame for the bubble's observer and its forced layout, and for every document-wide class observer; PERF-1) */
      this.tipMoving = false;
      if (!el || !el.classList.contains('on') || this.layoutName !== 'portrait') { this.ps.liftT = 0; this.bubble.classList.toggle('pst-hush', false); return; }
      // it holds still while the pointer is on it, so its close button is easy to hit (once it has its place: a new note
      // that opens under a resting pointer was left at the stage's corner, past its edge in Friendly's tilt; tip_fit)
      if (this.tipXY && el.matches(':hover')) return;
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
      /* the note's height is held to the stage's room, its words scrolling inside it, so it is always whole on the stage */
      const room0 = Math.max(60, by - foot - top - 8);
      if (el._tipmax !== room0) { el._tipmax = room0; el.style.setProperty('--tipmax', room0 + 'px'); }
      const goal = [clamp(p[0] - w * .4, 8, Math.max(8, Math.min(bx * .62 - w, bx - w - 10))), clamp(p[1] + 12, top, Math.max(top, by - h - foot))];
      if (!this.tipXY || this.reduced) this.tipXY = goal.slice();
      const k = Math.min(1, (dt || .016) * 5); this.tipXY[0] += (goal[0] - this.tipXY[0]) * k; this.tipXY[1] += (goal[1] - this.tipXY[1]) * k;
      /* (and never past the stage's edges while it eases after Pip) */
      this.tipXY[1] = clamp(this.tipXY[1], top, Math.max(top, by - h - foot)); this.tipXY[0] = clamp(this.tipXY[0], 8, Math.max(8, bx - w - 8));
      /* (still easing after Pip: a draw is due each frame until it is there, PERF-1) */
      this.tipMoving = Math.abs(goal[0] - this.tipXY[0]) > .05 || Math.abs(goal[1] - this.tipXY[1]) > .05;
      const tf = `translate(${R(this.tipXY[0])}px, ${R(this.tipXY[1])}px)`, tx = R(clamp(p[0] - this.tipXY[0], 14, w - 14)) + 'px';
      if (el._tipTf !== tf) { el._tipTf = tf; el.style.transform = tf; }
      if (el._tipTx !== tx) { el._tipTx = tx; el.style.setProperty('--tx', tx); }
    }
    /* --------------------------------------------------------- geometry */
    /* in the stage's own, untransformed size: the window's opening scales it, and a box measured then kept the larger
       size once it settled, so a note was allowed below the window's bottom (the pattern review; the rail's F1-3) */
    measure() {
      const r0 = this.screen.getBoundingClientRect(), Lay = this.L;
      const w = this.screen.offsetWidth || r0.width, h = this.screen.offsetHeight || r0.height;
      const r = this.box = { left: r0.left + (r0.width - w) / 2, top: r0.top + (r0.height - h) / 2, width: w, height: h, right: r0.left + (r0.width + w) / 2, bottom: r0.top + (r0.height + h) / 2 };
      const k = this.tube ? Math.max(r.width / Lay.w, r.height / Lay.h) : Math.min(r.width / Lay.w, r.height / Lay.h);
      this.map = { k, ox: (r.width - Lay.w * k) / 2, oy: (r.height - Lay.h * k) / 2 };
      /* the part of the scene a person can see, in its own units: the screen box, cut by every box that clips it up to
         the stage (the pane's divider, Retro's tube); a sliced tube's sides are off screen too */
      const sx = r0.width / (w || 1); let vl = 0, vr = w, vt = 0, vb = h;
      for (let e = this.screen; e; e = e.parentElement) {
        if (e !== this.screen) {
          const cs = getComputedStyle(e), c = (/hidden|clip|auto|scroll/.test(cs.overflowX + cs.overflowY)) ? e.getBoundingClientRect() : null;
          if (c && /hidden|clip|auto|scroll/.test(cs.overflowX)) { vl = Math.max(vl, (c.left - r0.left) / sx); vr = Math.min(vr, (c.right - r0.left) / sx); }
          if (c && /hidden|clip|auto|scroll/.test(cs.overflowY)) { vt = Math.max(vt, (c.top - r0.top) / sx); vb = Math.min(vb, (c.bottom - r0.top) / sx); }
        }
      }
      /* (and the viewport: a short window can scroll the stage partly out of view) */
      vl = Math.max(vl, -r0.left / sx); vr = Math.min(vr, (window.innerWidth - r0.left) / sx); vt = Math.max(vt, -r0.top / sx); vb = Math.min(vb, (window.innerHeight - r0.top) / sx);
      /* (and what the stage paints over the scene at its foot: Retro Light's printer, its platen, bail and head across the
         paper, and a tube's command line. A sign at the pane's foot kept its lower line behind the roller, A3-6. Read
         from the layout, not the painted box: the paper feeding in and the tube's degauss move them for a moment) */
      const atop = (n) => { let y = 0; for (let e = n; e && e !== this.screen; e = e.offsetParent) y += e.offsetTop; return y; };
      this.screen.querySelectorAll(':scope > .pst-printer, :scope > .pst-printer > *, .pst-term-cmd').forEach((n) => { if (n.offsetHeight) vb = Math.min(vb, atop(n)); });
      /* (and the stage's own words at its top, Retro's title line and NieR's unit line, each where it is written: Pip
         hangs below the ones over its column, pipFit, FO-55) */
      const aleft = (n) => { let x = 0; for (let e = n; e && e !== this.screen; e = e.offsetParent) x += e.offsetLeft; return x; };
      this.hdr = [];
      if (this.hudEl && k > 0) this.hudEl.querySelectorAll('.pst-term-top > span, .pst-ntop > span').forEach((n) => {
        if (!n.offsetWidth || !n.textContent.trim()) return;
        const x = aleft(n);
        this.hdr.push({ x0: (x - this.map.ox) / k, x1: (x + n.offsetWidth - this.map.ox) / k, y1: (atop(n) + n.offsetHeight - this.map.oy) / k });
      });
      this.vis = k > 0 && vr > vl && vb > vt ? { x0: (vl - this.map.ox) / k, x1: (vr - this.map.ox) / k, y0: (vt - this.map.oy) / k, y1: (vb - this.map.oy) / k } : null;
      /* Pip's spot follows the new span at once, the hand and Pip together, so a resize does not swing it (pipFit) */
      if (this.ps && this.pipAt) {
        const o = this.pipOff || [0, 0], f = this.pipOff = this.pipFit(this.pipAt), ps = this.ps, dx = f[0] - o[0], dy = f[1] - o[1];
        if (dx || dy) { ps.Ct.x += dx; ps.Ct.y += dy; ps.C.x += dx; ps.C.y += dy; }
      }
      this.nierBox = null;
      if (this.bubble) { this.bubbleW = this.bubble.offsetWidth; this.bubbleH = this.bubble.offsetHeight; if (this.famName === 'nier') this.nierBox = this.boxInScene(this.bubble, 6); }
      this.dirty = true; this.frameT = -1e9; if (this.svg && this.kick) this.kick(); /* (a resize redraws the props in their new room, at once: past Retro's stepped gate too) */
      this.headTo();
    }
    toScreen(p) { const m = this.map || { k: 1, ox: 0, oy: 0 }; return [m.ox + p[0] * m.k, m.oy + p[1] * m.k]; }
    headCentre() { const ps = this.ps, H = this.H || this.headAt(ps.C.x, ps.C.y, ps.th, ps.dy); return this.headXf([32, 45], H, this.ang || 0, 1, 1); }
    /* Pip's control bar (the two sticks and the screw eyes under them) as a box in the bubble's pixels, from the kit's own
       geometry and the pose this frame draws it in (ctlXf: the transform render() writes), widened by gap (FO-59) */
    barBox(gap, pose) {
      const ps = pose || this.ps; if (!ps || this.famName === 'nier') return null;
      const K = KIT().kit, g = K.GEO.full, st = K.sticks(g), r = g.w / 2, ring = (g.ring || 0) + (g.ringW || 0);
      /* in the kit's units: the sticks' ends with their round caps, and the screw eyes hanging under them */
      const q = st.s1.concat(st.s2).map(([x, y]) => [x - r, y - r, x + r, y + r]).concat((this.barPts || []).map(([x, y]) => [x - ring, y - ring, x + ring, y + ring]));
      const x0 = Math.min(...q.map((b) => b[0])), y0 = Math.min(...q.map((b) => b[1])), x1 = Math.max(...q.map((b) => b[2])), y1 = Math.max(...q.map((b) => b[3]));
      /* its four corners where this frame draws the bar (it rocks while Pip works) */
      const sc = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map((p) => this.toScreen(this.ctlXf(p, ps.C, ps.phi)));
      return [Math.min(...sc.map((p) => p[0])) - gap, Math.min(...sc.map((p) => p[1])) - gap, Math.max(...sc.map((p) => p[0])) + gap, Math.max(...sc.map((p) => p[1])) + gap];
    }
    propCentre(pr) { return pr.pos ? [pr.pos[0], pr.pos[1]] : this.slotXY(pr.spec); }
    /* ------------------------------------------------------------- loop */
    loop() {
      this.raf = 0;
      if (this.waitT) { clearTimeout(this.waitT); this.waitT = 0; }
      const tn = now(); let dt = Math.min(.05, tn - this.last) / H.speed(); this.last = tn;
      /* paused while the window is shut or held, the page hidden, a drag under way (body.pm-resizing) or the stage
         gone; a still stage (Reduced Motion, a low-resource computer) is drawn only when something changed */
      if (!this.live()) { this.park(); return; }
      if (this.remeasureAt && tn > this.remeasureAt) { this.remeasureAt = 0; this.measure(); }
      if (this.still() && !this.dirty && this.t > this.moodUntil + .3 && !this.fx.length && !this.faceOut && this.faceT0 == null) return;
      // Retro's tube refreshes in steps; the phosphor holds what was there a moment longer
      const fps = this.frameRate(), smooth = !(fps && !this.reduced) && !this.still();
      if (!smooth && !this.raf) this.raf = requestAnimationFrame(this.loop);
      this.advance(dt);
      /* (on a steady cadence: each draw is due one step after the last was due, so a frame that comes a little late
         does not push every later draw back; Retro Light then draws ten times a second, Retro Dark twenty) */
      if (fps && !this.reduced) { const step = 1 / fps; if (this.t - this.frameT < step - 0.006) return; this.frameT = this.t - this.frameT > 2 * step ? this.t : this.frameT + step; }
      /* (and elsewhere only when a draw is due: the displacement gate, drawDue; with none due the loop asks for no frame
         and waits on a timer, PERF-1 step 5) */
      else if (smooth && !this.drawDue() && !this.dirty) { this.wait(); return; }
      /* (a kick's draw keeps the frame loop for the next frame: what it started, a swing or a letter's poke, may move at
         once) */
      if (smooth && this.dirty) this.speed = Infinity;
      /* (a change is drawn only once a frame is: cleared before Retro's stepped gate, a still stage that skipped one never
         drew it, and a sign kept 1024's place at 860 after a resize) */
      this.dirty = false;
      this.render();
      /* (moving fast enough that the next frame's draw is due too, a swing or anything that draws every frame: the frame
         loop goes on; slow drift goes back to the timer) */
      if (smooth && !this.raf) { if (this.speed >= 8) this.raf = requestAnimationFrame(this.loop); else this.wait(); }
    }
    /* PERF-1 step 5: a tick that drew nothing asks for no animation frame. Each frame the loop asked for cost 1.3-4.3 ms
       even when it drew nothing (the stage world's CSS animations are re-serviced on every main frame). A light timer
       runs the fixed-step physics and the gate, touching nothing on the page, and asks for a frame only once a draw is
       due. One loop, never two: kick() and park() cancel the timer, and the timer stands down while a frame is asked
       for. Paused (park), held, destroyed or inactive, it stops as the frame loop does. */
    wait() { if (!this.waitT && !this.dead) this.waitT = setTimeout(this.tick, 16); }
    tick() {
      this.waitT = 0;
      if (this.raf || this.dead) return;
      if (!this.live()) { this.park(); return; }
      const tn = now(); let dt = Math.min(.05, tn - this.last) / H.speed(); this.last = tn;
      if (this.remeasureAt && tn > this.remeasureAt) { this.remeasureAt = 0; this.measure(); }
      if (this.raf) return;
      this.advance(dt);
      if (this.dirty || this.still() || this.frameRate() && !this.reduced || this.drawDue()) { this.raf = requestAnimationFrame(this.loop); return; }
      this.wait();
    }
    /* the physics on a fixed step, 1/360 s (the substep a 120 Hz frame took: three a frame): the motion then depends only
       on time, not on when frames ran, so a 60 Hz screen moves as a 120 Hz one does and the loop can skip frames and catch
       up exactly (PERF-1 step 3). The clock advances with each step; what is left over waits for the next tick. Idle life
       runs once a tick, as before. */
    advance(dt) {
      const h = 1 / 360;
      this.acc = (this.acc || 0) + dt;
      this.tickN = (this.tickN || 0) + 1;
      while (this.acc >= h) { this.t += h; this.step(h); this.acc -= h; }
      this.life(dt);
    }
    /* a prop's destination, once a tick: nothing a physics step changes is in its key, and building that key for every
       prop in every step was the step's main cost */
    tickPose(pr) { if (pr.tickPoseN !== this.tickN || !pr.tickPoseV) { pr.tickPoseV = this.restPose(pr); pr.tickPoseN = this.tickN; } return pr.tickPoseV; }
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
        else if (pick === 'swing') {
          /* (as far as the room beside the head allows: a swing carried Glass's head .15 rad into the forge beside it on
             Online details at 860, 24 px2 painted, the awake guard of sol-review-retro-1; with no room, a wiggle) */
          const dir = Math.random() > .5 ? 1 : -1, kick = Math.min(.5, this.swingRoom(dir));
          if (kick > .08) { ps.thv += dir * kick; this.sfx('swing', { x: ps.C.x, intensity: .35 * kick / .5 }); }
          else ps.tiltv += dir * 3;
        }
        else if (pick === 'wiggle') ps.tiltv += (Math.random() > .5 ? 1 : -1) * 3;
        else { this.idleLook = [Math.random() > .5 ? 2.2 : -2.2, .3]; this.idleUntil = this.t + 1.1; }
      }
      if (this.idleLook && this.t > this.idleUntil) this.idleLook = null;
    }
    step(dt) {
      /* (Pip parts: sway-and-physics off holds the rig and the props still, as Reduced Motion does) */
      /* (a still stage draws only when something changed, so on a low-resource computer its props take their places at once,
         as under Reduced Motion: moving there by physics, they stopped after one frame, an outgoing folder prop beside Pip
         and the incoming name's sign half-way in, after a long run of Backs, B-A2-G-1) */
      const ps = this.ps, F = this.fam, Lay = this.L, red = this.reduced || !!O55.motion.lowResource || !H.part('sway-and-physics');
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
        const phiT = this.work ? Math.sin(this.t * 4.2) * (this.rockMax == null ? .12 : this.rockMax) : ps.asleep ? .08 : 0;
        ps.phi += (phiT - ps.phi) * Math.min(1, dt * 6);
      }
      // eyes follow what Pip is looking at
      const lk = ps.lookT; ps.look[0] += (lk[0] - ps.look[0]) * Math.min(1, dt * 9); ps.look[1] += (lk[1] - ps.look[1]) * Math.min(1, dt * 9);
      // props: each hangs from its own anchor above the stage
      this.props.forEach((pr, id) => {
        const tg = this.propTarget(pr);
        if (pr.state === 'out' && !red) this.holdUnder(pr, tg);
        if (red) {
          pr.ax = tg.ax; pr.len = tg.len; pr.a = 0; pr.av = 0; pr.op = tg.op; pr.scale = (pr.spec.scale || 1);
          if (pr.state !== 'out' && pr.spec.stack == null) { const pose = this.tickPose(pr); pr.aimDx = pose.dx; pr.aimDy = pose.dy; pr.aimDxv = 0; pr.aimDyv = 0; }
        }
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
          /* A refitted destination moves this offset on the same spring as the slot. The painted prop
             follows aimDx/aimDy, so a target change re-aims instead of teleporting. */
          if (pr.state !== 'out' && pr.spec.stack == null) {
            const pose = this.tickPose(pr);
            if (pr.aimDx == null) { pr.aimDx = pose.dx; pr.aimDy = pose.dy; pr.aimDxv = 0; pr.aimDyv = 0; }
            else {
              const dxA = F.pk * (pose.dx - pr.aimDx) - F.pc * pr.aimDxv; pr.aimDxv += dxA * dt; pr.aimDx += pr.aimDxv * dt;
              const dyA = F.pk * (pose.dy - pr.aimDy) - F.pc * pr.aimDyv; pr.aimDyv += dyA * dt; pr.aimDy += pr.aimDyv * dt;
            }
          }
        }
        let arrived = Math.abs(pr.len - tg.len) < 2.5 && Math.abs(pr.lenv) < 30 && Math.abs(pr.ax - tg.ax) < 2.5 && Math.abs(pr.axv) < 30;
        if (arrived && pr.aimDx != null && pr.spec.stack == null) {
          const pose = this.tickPose(pr);
          arrived = Math.abs(pr.aimDx - pose.dx) < 2.5 && Math.abs(pr.aimDy - pose.dy) < 2.5 && Math.abs(pr.aimDxv) < 30 && Math.abs(pr.aimDyv) < 30;
        }
        if (!pr.settled && pr.state !== 'out' && arrived) this.settle(pr);
        if (pr.spec.ground && !pr.landed && (red || (Math.abs(pr.len - tg.len) < 1.6 && Math.abs(pr.lenv) < 22))) { pr.landed = true; pr.landT = this.t; this.touchdown(pr); if (this.onLanded) this.onLanded(pr); }
        if (pr.state === 'out' && (pr.len < 0 || pr.held) && (red || pr.op < .05)) { pr.el.remove(); pr.strs.forEach((s) => s.remove()); this.props.delete(id); }
      });
      // particles
      for (let i = this.fx.length - 1; i >= 0; i--) {
        const p = this.fx[i]; p.life += dt;
        if (p.life >= p.max) { p.e.remove(); this.fx.splice(i, 1); continue; }
        if (p.follow) { if (p.follow.pos) { p.x = p.follow.pos[0] + p.off[0]; p.y = p.follow.pos[1] + p.off[1]; } if (p.reach != null) this.keepIn(p); continue; }
        p.vy += p.g * dt; p.x += (p.vx + (p.sway ? Math.sin(this.t * 2 + p.sway) * 20 : 0)) * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        const k = Math.max(0, 1 - dt * (p.drag || 0)); p.vx *= k; if (p.drag > 1) p.vy *= k;
      }
    }
    render() {
      const ps = this.ps, Lay = this.L, f = this.famName;
      /* (NieR's box is fixed: its band is kept clear from when it is first seen, also while it is silent, so a stack
         that lands before it talks is already below it. Its observers keep it; it is read here only until it is first
         seen, before this frame's writes, so the read forces no layout; PERF-1) */
      if (f === 'nier' && !this.nierBox) { const nb = this.boxInScene(this.bubble, 6); if (nb) this.nierBox = nb; }
      const mood = this.moodNow();
      this.renderHead(mood);
      this.animFace();
      const hp = this.headPose(), H = hp.H, ang = hp.ang, sx = hp.sx, sy = hp.sy, s = Lay.s;
      this.H = H; this.ang = ang;
      sa(this.gCtl, 'transform', `translate(${R(ps.C.x)} ${R(ps.C.y)}) rotate(${R(ps.phi * 57.3)}) scale(${s}) translate(-32 -14.5)`);
      sa(this.gHead, 'transform', `translate(${R(H[0])} ${R(H[1])}) rotate(${R(ang * 57.3)}) scale(${s}) translate(-32 -31.5) translate(32 59.5) scale(${R(sx)} ${R(sy)}) translate(-32 -59.5)`);
      const ends = this.solveStrings({ C: ps.C, phi: ps.phi, H, ang, sx, sy });
      ends.forEach((e, i) => {
        const l = Math.hypot(e.E[0] - e.T[0], e.E[1] - e.T[1]), slack = Math.max(0, (this.restLen[i] || l) - l);
        const d = slack > 1 ? `M${R(e.T[0])} ${R(e.T[1])}Q${R((e.T[0] + e.E[0]) / 2 + (i ? 1 : -1) * slack * .25)} ${R((e.T[1] + e.E[1]) / 2 + slack * .55)} ${R(e.E[0])} ${R(e.E[1])}` : `M${R(e.T[0])} ${R(e.T[1])}L${R(e.E[0])} ${R(e.E[1])}`;
        sa(this.pstrs[i], 'd', d); sa(this.pglow[i], 'd', d);
      });
      const hc = this.headCentre();
      this.aimEyes();
      if (this.eyesEl) sa(this.eyesEl, 'transform', `translate(${R(ps.look[0])} ${R(ps.look[1])})`);
      // blink
      const blink = this.blinkK();
      if (this.blinkEl && !this.reduced && PIP.h.part('blinks')) sa(this.blinkEl, 'transform', `translate(0 ${this.blinkY}) scale(1 ${R(blink)}) translate(0 ${-this.blinkY})`);
      // props
      this.keepOff = f === 'nier' ? this.nierBox || null : this.bubbleKeepOff || null;
      this.pipKeep = this.pipHead(null, { H, ang, sx, sy });
      this.renderN = (this.renderN || 0) + 1;
      this.props.forEach((pr) => this.placeProp(pr));
      // particles
      this.fx.forEach((p) => {
        const k = p.life / p.max;
        if (p.kind === 'ripple') { const e = ease(k), m = p.small ? .45 : 1; sa(p.e, 'rx', R(6 + e * 90 * m)); sa(p.e, 'ry', R(1.5 + e * 12 * m)); sa(p.e, 'stroke-opacity', R((1 - k) * .7)); return; }
        const op = p.kind === 'conf' ? (k > .85 ? (1 - k) / .15 : 1) : p.kind === 'check' ? (k < .75 ? 1 : (1 - k) / .25) : p.kind === 'ring' ? (1 - k) * .9 : 1 - k * k;
        const sc = p.kind === 'ring' ? Math.min(1 + ease(k) * 2.2, p.room || Infinity) : p.kind === 'check' ? (k < .1 ? k / .1 * 1.18 : k < .18 ? 1.18 - (k - .1) / .08 * .18 : 1) : 1;
        sa(p.e, 'transform', `translate(${R(p.x)} ${R(p.y)}) rotate(${R(p.r * 57.3 / 6)}) scale(${R(sc)})`);
        sa(p.e, 'opacity', R(Math.max(0, op)));
      });
      // sleeping z's
      if (this.sleepZ && !this.reduced && this.t - (this.lastZ || 0) > .9 && f !== 'nier') {
        this.lastZ = this.t;
        const e = el('g', { class: 'pst-p', opacity: '0' }, this.gFx);
        const font = this.tube === 'phosphor' ? 'VT323, monospace' : this.tube ? "'IBM Plex Mono', monospace" : 'system-ui,sans-serif';
        e.innerHTML = `<text font-family="${font}" font-weight="800" font-size="${this.tube ? 22 : 16}" fill="${this.w.text}">z</text>`;
        this.fx.push({ e, kind: 'z', x: hc[0] + 40, y: hc[1] - 30, vx: 14, vy: -26, r: 0, vr: .4, life: 0, max: 2, g: 0 });
      }
      // soft shadows on the floor: Pip's and each prop's, smaller and fainter the higher they hang
      /* (kept elements, each value written only when it changed: rebuilding them with innerHTML inserted new nodes on
         every drawn frame, a whole-document layerization and a childList record for every page observer; PERF-1) */
      if (f === 'friendly' || f === 'glass') {
        const shs = [[H[0], H[1] + 64 * Lay.s / 2.6, 46 * Lay.s / 2.6]];
        this.props.forEach((pr) => { if (pr.pos) shs.push([pr.pos[0], pr.pos[1] + pr.foot * (pr.spec.scale || 1) * Lay.propScale, 40 * (pr.spec.scale || 1) * Lay.propScale * pr.op]); });
        const g = this.gShadow, kids = g.children;
        while (kids.length > shs.length) g.lastElementChild.remove();
        while (kids.length < shs.length) el('ellipse', { cy: Lay.ground + 2, fill: this.w.shadow }, g);
        shs.forEach(([x, y, r], i) => {
          const e = kids[i], h = Math.max(0, Lay.ground - y), k = clamp(1 - h / (Lay.h * .9), .25, 1);
          sa(e, 'cx', R(x)); sa(e, 'cy', Lay.ground + 2); sa(e, 'rx', R(r * (.6 + k * .5))); sa(e, 'ry', R(r * .13 * (.6 + k * .5))); sa(e, 'fill', this.w.shadow); sa(e, 'opacity', R(k * .7));
        });
      }
      // Basic measures: a plumb line from Pip to the floor and a marker riding the ruler
      // and a protractor under the hand that reads Pip's swing, its marker on the angle of the string
      /* (the protractor and ruler are made once for the layout and look, the arc and its ticks about the hand's spot;
         each draw moves them and writes only the values that changed: the marker, the plumb line, the ruler's marker
         and the two numbers; PERF-1) */
      if (f === 'basic') {
        const c = this.w.accent, ln = this.w.line, x = R(hc[0]), y0 = R(H[1] + 30 * Lay.s);
        const r = Lay.rope * .52, cx = ps.C.x, cy = ps.C.y, A = (d) => d / 57.3, P = (q, rr) => `${R(Math.sin(q) * rr)} ${R(Math.cos(q) * rr)}`;
        const pkey = [this.theme, r, Lay.w > 300, Lay.ground, c, ln].join('|');
        let pt = this.protractor;
        if (!pt || pt.key !== pkey || pt.g.parentNode !== this.gShadow) {
          let tk = '';
          for (let d = -30; d <= 30; d += 5) tk += `M${P(A(d), r)}L${P(A(d), r + (d % 15 ? 3.5 : 7))}`;
          const lp = [Math.sin(A(-38)) * (r + 4), Math.cos(A(-38)) * (r + 4)], font = "'Inter',system-ui,sans-serif";
          this.gShadow.textContent = '';
          const g = el('g', null, this.gShadow);
          el('path', { d: `M${P(A(-30), r)}A${R(r)} ${R(r)} 0 0 0 ${P(A(30), r)}${tk}`, fill: 'none', stroke: ln, 'stroke-opacity': '.28', 'stroke-width': '1' }, g);
          el('path', { d: `M0 0L${P(0, r + 7)}`, stroke: ln, 'stroke-opacity': '.18', 'stroke-dasharray': '2 3' }, g);
          pt = this.protractor = { key: pkey, g, marker: el('path', { fill: c }, g) };
          if (Lay.w > 300) { pt.ang = el('text', { x: R(lp[0]), y: R(lp[1]), 'text-anchor': 'end', 'font-family': font, 'font-size': '9', 'font-weight': '600', fill: ln, opacity: '.55' }, g); pt.angT = document.createTextNode(''); pt.ang.appendChild(pt.angT); el('tspan', { dy: '-3.5', 'font-size': '6' }, pt.ang).textContent = 'o'; }
          pt.plumb = el('path', { stroke: ln, 'stroke-opacity': '.22', 'stroke-dasharray': '2 4' }, this.gShadow);
          pt.foot = el('path', { d: `M0 ${Lay.ground + 1}l-5 8h10z`, fill: c }, this.gShadow);
          pt.num = el('text', { y: Lay.ground + 22, 'text-anchor': 'middle', 'font-family': font, 'font-size': '9', 'font-weight': '600', fill: ln, opacity: '.55' }, this.gShadow);
        }
        const th = clamp(ps.th, -A(34), A(34)), deg = ps.th * 57.3, lab = `θ ${deg < -.05 ? '-' : ''}${Math.abs(deg).toFixed(1)}`;
        const m = (q, rr) => [Math.sin(q) * rr, Math.cos(q) * rr], tip = m(th, r - 1), b1 = m(th - .045, r - 9), b2 = m(th + .045, r - 9);
        sa(pt.g, 'transform', `translate(${R(cx)} ${R(cy)})`);
        sa(pt.marker, 'd', `M${R(tip[0])} ${R(tip[1])}L${R(b1[0])} ${R(b1[1])}L${R(b2[0])} ${R(b2[1])}Z`);
        if (pt.angT && pt.angT.data !== lab) pt.angT.data = lab;
        sa(pt.plumb, 'd', `M${x} ${y0}V${Lay.ground - 6}`);
        sa(pt.foot, 'transform', `translate(${x} 0)`);
        sa(pt.num, 'x', x);
        const n = String(Math.round(hc[0])); if (pt.num.textContent !== n) pt.num.textContent = n;
      }
      // Retro: the vector terrain rolls toward you, and the phosphor remembers where Pip was
      if (this.gTerrain && !this.reduced) {
        const T = this.terrain, ph = (this.t * .55) % 1, D = T.H - T.vy;
        let d = '';
        for (let k = 1; k < 16; k++) { const z = k - ph + .6, y = T.vy + D / (z * z * .45 + .2); if (y > T.vy + 1 && y < T.H) d += `M-400 ${R(y)}H${Lay.w + 400}`; }
        sa(this.gTerrain, 'd', d); sa(this.gTerrain, 'stroke-opacity', '.32');
      }
      if (this.tube === 'phosphor') this.persist();
      // NieR: target brackets, a leader line and the lock; the glitch on a chapter change
      if (f === 'nier') { this.renderBrackets(); this.renderSlice(); }
      // the speech bubble follows Pip (NieR's dialogue box sits at the foot of the stage instead)
      if (f !== 'nier') this.placeBubble(H, ang);
      this.tipH = H; this.tipAng = ang;
      if (this.tipBox) this.placeTip(H, ang, this.t - (this.tipLast || this.t)); this.tipLast = this.t;
      this.motionSounds();
      /* (what this draw showed, for the displacement gate: drawDue) */
      this.drawnPose = this.poseVec(); this.blinkDrawn = blink;
    }
    // the head's pose this tick, as render draws it
    headPose() {
      const ps = this.ps, Lay = this.L;
      let H = this.headAt(ps.C.x, ps.C.y, ps.th, ps.dy);
      let ang = ps.th * .9 + ps.tilt;
      // NieR hovers: a slow bob and a little drift of the visor
      if (this.fam.bob && !this.reduced) { H = [H[0], H[1] + Math.sin(this.t * 1.35) * this.fam.bob * Lay.s / 2.6]; ang += Math.sin(this.t * .9) * .025; }
      // asleep: the head rests on the floor and the strings go slack
      const headH = 28 * Lay.s;
      if (H[1] + headH > Lay.ground - 2) { H = [H[0], Lay.ground - 2 - headH]; }
      /* (and on the lowest floor a person can see: a narrow window's Retro tube crops the stage's floor away, FO-51) */
      const reach = this.pipReach(ang);
      if (reach && this.vis && H[1] + reach[3] > this.vis.y1) H = [H[0], this.vis.y1 - reach[3]];
      // breathing: Pip's head swells a touch, slower when it sleeps
      const br = this.reduced || !PIP.h.part('idle-life') ? 0 : (this.fam.breathe || 0) * Math.sin(this.t * (this.sleepZ ? 1.5 : 2.2));
      return { H, ang, sx: ps.sx * (1 - br * .4), sy: ps.sy * (1 + br) };
    }
    // what the face shows now: a transient feeling wins over the scene's own
    moodNow() {
      if (this.moodOverride && this.t > this.moodUntil) this.moodOverride = null;
      const base = (this.spec.pip && this.spec.pip.mood) || 'idle';
      return this.sleepZ ? 'sleep' : (this.moodOverride || base);
    }
    // the lid in a blink, 1 open; a blink starts when one is due, drawn or not
    blinkK() {
      const ps = this.ps;
      if (!this.blinkEl || this.reduced || !PIP.h.part('blinks')) return 1;
      if (this.t > ps.nextBlink) { ps.blinkAt = this.t; ps.nextBlink = this.t + 2.2 + Math.random() * 3.4; }
      const b = ps.blinkAt != null ? this.t - ps.blinkAt : 9;
      return b < .16 ? Math.max(.1, Math.abs(1 - b / .08)) : 1;
    }
    // where the eyes look: at the target prop, at an idle glance, or at the pointer (the eyes ease to it in step())
    aimEyes() {
      const ps = this.ps, pip = this.spec.pip || {};
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
    }
    // big swings can be heard, and sleep
    motionSounds() {
      if (!this.reduced && this.t - (this.swT || 0) > .07) { this.swT = this.t; this.loopSnd('swing', clamp((Math.abs(this.ps.thv) - .25) / 1.6, 0, 1)); }
      this.loopSnd('snore', this.sleepZ ? 1 : 0);
    }
    /* PERF-1 step 4, the displacement gate (Jared's card vm.pm7-perf--P1, answer A): Pip at rest is never still (the
       hand's sway, breathing, NieR's bob), but it moves about 0.01 px a frame, and every draw cost a whole-document
       layerization. A draw is due when something drawn has moved at least a tenth of a pixel since the last draw, or
       when something must draw every frame while it lasts: particles, a change of face, a blink, a feeling ending,
       Pip's sleeping z's, NieR's HUD flying in or its glitch, a note easing after Pip, a set block's strings lifting
       away. What is drawn is the exact pose at today's precision: slow drift is sampled less often, never moved. */
    drawDue() {
      this.aimEyes(); this.motionSounds();
      /* (and how fast the pose moves, in px a second from the last tick: the frame loop goes on while it is 8 or more, more
         than a tenth of a pixel a 60 Hz frame, so the next frame's draw is due too and no frame is asked for in vain;
         slower, the timer asks for a frame once the draw falls due, its 16 ms and that frame at most about 50 ms of drift
         under 8 px/s (0.4 px) after it; anything that draws every frame counts as fast) */
      this.speed = Infinity;
      if (this.fx.length || this.faceOut || this.faceT0 != null || this.moodNow() !== this.curMood) return true;
      if (this.blinkK() !== this.blinkDrawn) return true;
      if (this.sleepZ && !this.reduced && this.famName !== 'nier' && this.t - (this.lastZ || 0) > .9) return true;
      if (this.famName === 'nier' && this.hudBusy && this.hudBusy()) return true;
      if (this.tipBox && this.tipMoving) return true;
      for (const pr of this.props.values()) if (pr.spec.ground && pr.landed && this.t - pr.landT < .6) return true;
      const v = this.poseVec(), d = this.drawnPose, u = this.tickV;
      if (u && u.length === v.length && this.t > this.tickT) { let m = 0; for (let i = 0; i < v.length; i++) m = Math.max(m, Math.abs(v[i] - u[i])); this.speed = m / (this.t - this.tickT); }
      this.tickV = v; this.tickT = this.t;
      if (!d || d.length !== v.length) return true;
      for (let i = 0; i < v.length; i++) if (!(Math.abs(v[i] - d[i]) < .1)) return true;
      return false;
    }
    /* the drawn pose as screen pixels, from the values render writes, rounded as it rounds them (R, .01 units and .01
       degrees), so a draw is due on the frame a written value would move something a tenth of a pixel: the head's own
       box corners (its tilt, hop, breathing and squash, NieR's bob), the control's corners (its rock), the eyes' offset,
       NieR's bracket breathing, and each prop's drawing corners where placeProp hangs it (its pivot, length, swing, fit
       offset and scale), its drawn opacity and squash. (Breathing's scale is written to .01: its step moves the head's
       top about 0.85 px at once, on the same frame as before.) */
    poseVec() {
      const ps = this.ps, Lay = this.L, k = (this.map && this.map.k) || 1, v = [], deg = (a) => R(a * 57.3) / 57.3;
      const hp = this.headPose(), hd = [R(hp.H[0]), R(hp.H[1])], ang = deg(hp.ang), sx = R(hp.sx), sy = R(hp.sy);
      /* (the corners of the head's and the control's own drawn boxes, pipBB, as kit units; the kit's frame until measured) */
      const box = (b) => [[b[0], b[1]], [b[0] + b[2], b[1]], [b[0], b[1] + b[3]], [b[0] + b[2], b[1] + b[3]]], bb0 = this.pipBB;
      for (const q of box(bb0 ? bb0.h : [0, 0, 64, 62])) { const p = this.headXf(q, hd, ang, sx, sy); v.push(p[0] * k, p[1] * k); }
      for (const q of box(bb0 ? bb0.c : [0, 0, 64, 29])) { const p = this.ctlXf(q, { x: R(ps.C.x), y: R(ps.C.y) }, deg(ps.phi)); v.push(p[0] * k, p[1] * k); }
      v.push(R(ps.look[0]) * Lay.s * k, R(ps.look[1]) * Lay.s * k);
      /* (Pip's strings' ends: they follow the breathing head smoothly, from its unrounded scale, as render draws them) */
      this.solveStrings({ C: ps.C, phi: ps.phi, H: hp.H, ang: hp.ang, sx: hp.sx, sy: hp.sy }).forEach((e) => v.push(R(e.T[0]) * k, R(e.T[1]) * k, R(e.E[0]) * k, R(e.E[1]) * k));
      /* (NieR's brackets breathe on the diagonal: each corner moves the pulse's change times the square root of two) */
      if (this.famName === 'nier' && this.hudPulse) v.push(this.hudPulse() * k * Math.SQRT2);
      this.props.forEach((pr) => {
        const tg = this.propTarget(pr), sc = tg.sc * (pr.scale / (pr.spec.scale || 1)), bb = pr.bb || [0, 0, 0, 0];
        const tm = [pr.ties.reduce((m, t) => m + t[0], 0) / pr.ties.length, tg.tieY];
        const hang = [pr.ax + Math.sin(pr.a) * Math.max(0, pr.len), Lay.anchorY + Math.cos(pr.a) * Math.max(0, pr.len)];
        const f = this.fit(pr, hang, sc, tm), s2 = R(sc * f.f), hx = R(hang[0] + f.dx), hy = R(hang[1] + f.dy), a = deg(pr.a), t0 = R(tm[0]), t1 = R(tm[1]);
        for (const [x, y] of box(bb)) { const c = rot([(x - t0) * s2, (y - t1) * s2], a); v.push((hx + c[0]) * k, (hy + c[1]) * k); }
        /* (its opacity as drawn, to the .01 a draw writes: a change draws, a residue the write would round away does not) */
        const sq = this.reduced ? 0 : clamp(pr.sq || 0, -.12, .12);
        v.push(R(pr.op) * 40, (Math.abs(sq) > .002 ? R(1 - sq) - 1 : 0) * (pr.foot || 0) * s2 * k);
      });
      return v;
    }
    /* Speech follows the head. Reserve obstacles in that same frame through the head's whole small motion,
       rather than keeping a pixel edge as a head-relative offset: a wiggle then dragged that offset away from
       the prop, and its 2.5-second expiry moved the bubble back (QA-4, 4.6–5.7 px residuals). This envelope uses
       the scene's target pose, not this frame's sway, tilt, hop or bar rock, so it is the same on first paint. */
    speechMotion(point) {
      const ps = this.ps, L = this.L, F = this.fam;
      const key = JSON.stringify([this.theme, this.map, this.vis, this.pipBB, L.s, L.rope, ps.Ct, ps.tiltT, this.rockMax, this.still()]);
      if (this.speechEnvelope && this.speechEnvelope.key === key) return this.speechEnvelope;
      const still = this.still(), ths = still ? [0] : [-.15, 0, .15], turns = still ? [0] : [-.2, 0, .2];
      const hops = still || F.noHop ? [0] : [-12, 0, 2], points = [];
      for (const th of ths) for (const turn of turns) for (const dy of hops) {
        const a = ps.tiltT + th * .9 + turn, h = this.headAt(ps.Ct.x, ps.Ct.y, th, dy), reach = this.pipReach(a);
        h[1] = Math.min(h[1], L.ground - 2 - 28 * L.s, reach && this.vis ? this.vis.y1 - reach[3] : Infinity);
        points.push(this.toScreen(this.headXf(point, h, a, 1, 1)));
      }
      const sway = still ? 0 : F.sway * this.map.k;
      const lo = [Math.min(...points.map(p => p[0])) - sway, Math.min(...points.map(p => p[1]))];
      const hi = [Math.max(...points.map(p => p[0])) + sway, Math.max(...points.map(p => p[1]))];
      // A line can outlive the work it reports. Reserve the bar's full allowed rock throughout that line;
      // switching to its upright box at work's end re-picked Retro Light Creating's held line by1.4px.
      const rock = still ? 0 : this.rockMax == null ? .12 : this.rockMax;
      const bars = [-rock, 0, rock].map(phi => this.barBox(6, { C: ps.Ct, phi })).filter(Boolean);
      const bar = bars.length ? [Math.min(...bars.map(b => b[0])) - sway, Math.min(...bars.map(b => b[1])), Math.max(...bars.map(b => b[2])) + sway, Math.max(...bars.map(b => b[3]))] : null;
      return (this.speechEnvelope = { key, lo, hi, bar });
    }
    placeBubble(H, ang) {
      const tall = this.layoutName === 'portrait';
      const head = this.toScreen(this.headXf([32, 34], H, ang, 1, 1));
      const sp = this.toScreen(this.headXf(tall ? [44, 30] : [58, 44], H, ang, 1, 1));
      const bw = this.bubbleW || this.bubble.offsetWidth || 160, bh = this.bubbleH || this.bubble.offsetHeight || 34, bx = this.box ? this.box.width : 400, by = this.box ? this.box.height : 560;
      const pad = this.tube ? 14 : 8, top = this.tube ? (tall ? 44 : 34) : 8, foot = this.tube === 'teletype' ? (tall ? 70 : 48) : this.tube ? (tall ? 44 : 34) : 8;
      /* the bubble covers no prop and never Pip's face (FO26: the name's sign on Name; RDA-01: Pip's eyes on Review). Where
         its usual place is taken it moves to the nearest clear place inside the pane, and keeps that side while it stays
         clear, so new words never send it across Pip; if nowhere is clear it still keeps off the face, and the props
         make way for it (keepOff). Its tail still points at Pip. */
      const gap = 6, obs = [], hx0 = head[0], hy0 = head[1];
      const motion = this.speechMotion(tall ? [44, 30] : [58, 44]);
      const v = this.vis, vs = v ? [this.toScreen([v.x0, v.y0]), this.toScreen([v.x1, v.y1])] : null;
      const bounds = [Math.max(pad, vs ? vs[0][0] + pad : pad), Math.max(top, vs ? vs[0][1] + 4 : top), Math.min(bx - bw - pad, vs ? vs[1][0] - bw - pad : bx), Math.min(by - bh - foot, vs ? vs[1][1] - bh - 4 : by)];
      /* Bounds belong to the same frame as the obstacles. A screen-fixed edge otherwise rejects a kept place as
         the head moves (nas-signin: x=7.28 against an 8px edge, then a 211px jump). Where the whole head travel
         cannot fit on an axis, pin that axis to the scene instead and reserve the head's whole face there. */
      const follows = [bounds[2] - bounds[0] >= motion.hi[0] - motion.lo[0], bounds[3] - bounds[1] >= motion.hi[1] - motion.lo[1]];
      const origin = sp.map((p, i) => follows[i] ? p : (motion.lo[i] + motion.hi[i]) / 2);
      const anchorKey = JSON.stringify([this.lastScreen, motion.key, follows]);
      const frameKey = JSON.stringify([this.lastScreen, this.saying, motion.key, bw, bh, follows]);
      if (this.bubbleFrame !== frameKey) {
        const hadBand = this.bubbleKeepOff;
        this.bubbleFrame = frameKey; this.bubbleRel = null; this.bubbleClaim = null; this.bubbleKeepOff = null;
        if (hadBand) { this.keepOff = null; this.renderN = (this.renderN || 0) + 1; this.props.forEach((pr) => this.placeProp(pr)); }
      }
      const X0 = follows[0] ? sp[0] + bounds[0] - motion.lo[0] : bounds[0], X1 = follows[0] ? sp[0] + bounds[2] - motion.hi[0] : bounds[2];
      const Y0 = follows[1] ? sp[1] + bounds[1] - motion.lo[1] : bounds[1], Y1 = follows[1] ? sp[1] + bounds[3] - motion.hi[1] : bounds[3];
      let x = clamp(origin[0] + (tall ? -bw * .3 : 6), X0, X1), y = clamp(tall ? origin[1] - bh - 22 : origin[1] - bh / 2, Y0, Y1);
      const projected = o => [follows[0] ? sp[0] + o[0] - motion.hi[0] : o[0], follows[1] ? sp[1] + o[1] - motion.hi[1] : o[1], follows[0] ? sp[0] + o[2] - motion.lo[0] : o[2], follows[1] ? sp[1] + o[3] - motion.lo[1] : o[3]];
      /* the face through the head's whole turn (its rest tilt either way by a swing's reach), each turn read from
         the speech point at that same turn: at this frame's turn alone, a swing or a wiggle raised a corner of the
         box into the bubble's margin and the bubble stepped up a few px mid-line, then dropped back when the
         step-aside was let go (QA-4) */
      const tiltT = this.ps ? this.ps.tiltT || 0 : 0, spQ = tall ? [44, 30] : [58, 44];
      const fc = [tiltT - .2, tiltT, tiltT + .2].flatMap((a2) => {
        const s2 = this.toScreen(this.headXf(spQ, H, a2, 1, 1)), dx = sp[0] - s2[0], dy = sp[1] - s2[1];
        return [[12, 32], [52, 32], [12, 58], [52, 58]].map((q) => { const c = this.toScreen(this.headXf(q, H, a2, 1, 1)); return [c[0] + dx, c[1] + dy]; });
      });
      const face = [Math.min(...fc.map((c) => c[0])) - gap, Math.min(...fc.map((c) => c[1])) - gap, Math.max(...fc.map((c) => c[0])) + gap, Math.max(...fc.map((c) => c[1])) + gap];
      /* (its tail too: about 12 px below the bubble when it points down, left of it when it points left) */
      if (tall) face[1] -= 12; else face[2] += 12;
      for (let i = 0; i < 2; i++) if (!follows[i]) { face[i] += motion.lo[i] - sp[i]; face[i + 2] += motion.hi[i] - sp[i]; }
      /* (the bubble no longer steps aside for a leaving prop (FO-34's words-over-a-fading-prop is kept off by
         holdUnder and band() below, which cap its lift at the bubble's own lower edge) */
      /* (at the box each prop will REST in (restPose's restBox), read for every prop that is staying, from its first
         frame: at the box it falls through, the bubble stepped up or aside while a prop was lowered past it and
         dropped back seconds later once the prop had settled and the step-aside was let go, and a prop not yet faded
         in was no obstacle at all on the bubble's first frames (QA-4). A leaving prop is no obstacle: holdUnder
         already caps its lift at the bubble's lower edge and fades it there, and counting its rising box made the
         bubble step aside for a prop that was already keeping under it) */
      this.props.forEach((pr) => {
        if (pr.state === 'out') return;
        const pose = this.restPose(pr), rb = pose.speechBox || pose.box || pr.box;
        if (rb) { const a = this.toScreen([rb[0], rb[1]]), c = this.toScreen([rb[2], rb[3]]); obs.push(projected([a[0] - gap, a[1] - gap, c[0] + gap, c[1] + gap])); }
        /* The destination can already be the place a claim would push a settled prop to.
           Retro Dark Review then drew the reflowed line across the clipboard that was still
           painted where it had settled, and the claim shunted the clipboard right. The
           painted box of a settled prop is an obstacle of its own. */
        if (pr.settled && pr.op > .5 && pr.box) {
          const a = this.toScreen([pr.box[0], pr.box[1]]), c = this.toScreen([pr.box[2], pr.box[3]]);
          obs.push(projected([a[0] - gap, a[1] - gap, c[0] + gap, c[1] + gap]));
        }
      });
      /* Future phase blocks occupy the same planned column as the first one. Reserve it before any block
         enters: discovering a later row during a held sentence moved short-layout speech by21px. */
      const stackBox = this.stackFit().box;
      if (stackBox) { const a = this.toScreen([stackBox[0], stackBox[1]]), c = this.toScreen([stackBox[2], stackBox[3]]); obs.push(projected([a[0] - gap, a[1] - gap, c[0] + gap, c[1] + gap])); }
      /* (and Pip's control bar: where a prop beside Pip took the usual place, the bubble went up over the sticks Pip hangs
         from, Retro Dark's Look 'Soft and cosy. I like it.', FO-59) */
      /* The control's entire rock is projected through the same head motion as the props. Reading its current
         rock or the current hop made an ostensibly conservative obstacle change while the line was already up. */
      const bar = motion.bar && projected(motion.bar); if (bar) obs.push(bar);
      const fx = (face[0] + face[2]) / 2, sideOf = (cx) => (cx + bw / 2 < fx ? 'L' : 'R');
      // A translated exact contact can differ by ~1e-13px; it is not a new overlap on the renderer's .01px grid.
      const over = (cx, cy, o) => cx < o[2] - 1e-7 && cx + bw > o[0] + 1e-7 && cy < o[3] - 1e-7 && cy + bh > o[1] + 1e-7;
      const fits = (cx, cy) => cx >= X0 - .5 && cx <= X1 + .5 && cy >= Y0 - .5 && cy <= Y1 + .5;
      const clear = (cx, cy) => fits(cx, cy) && !over(cx, cy, face) && !obs.some((o) => over(cx, cy, o));
      /* (a place on Pip's other side counts as far: new words never send the bubble across Pip, it goes above instead) */
      const cost = ([cx, cy]) => Math.hypot(cx - x, cy - y) + (this.bubbleSide && sideOf(cx) !== this.bubbleSide && !(cy + bh <= face[1]) ? 400 : 0);
      const near = (list) => list.filter(([cx, cy]) => clear(cx, cy)).sort((p, q) => cost(p) - cost(q))[0];
      const candidates = (obstacles) => {
        const list = [];
        obstacles.forEach((o) => list.push([o[0] - bw, y], [o[2], y], [x, o[1] - bh], [x, o[3]], [o[0] - bw, o[1] - bh], [o[2], o[1] - bh], [o[0] - bw, o[3]], [o[2], o[3]]));
        list.push([X0, Y0], [X1, Y0], [X0, Y1], [X1, Y1]);
        return list.map(([cx, cy]) => [clamp(cx, X0, X1), clamp(cy, Y0, Y1)]);
      };
      /* Kept from the same origin as the usual place: the speech point on an axis with room to follow it, the
         fixed scene on a cramped axis. A different origin for the kept place made it wander during a wiggle. */
      const prev = this.bubbleRel ? [origin[0] + this.bubbleRel[0], origin[1] + this.bubbleRel[1]] : null;
      /* A shorter new line can still fit at the old tail while the usual place is on Pip's other side. Try that
         full-precision candidate before searching again; the same face, full-motion, prop and bounds checks apply. */
      const prior = this.bubbleAnchor, pin = (side, w, h) => side === 'up' ? [w * .3, 0] : side === 'down' ? [w * .3, h] : side === 'right' ? [w, h / 2] : [0, h / 2];
      const oldPin = prior && pin(prior.side, prior.w, prior.h), newPin = prior && pin(prior.side, bw, bh);
      const priorAt = prior && prior.key === anchorKey && prior.line !== this.saying
        ? origin.map((p, i) => p + prior.rel[i] + oldPin[i] - newPin[i]) : null;
      let at = null;
      if (prev && clear(prev[0], prev[1])) at = prev; /* the current line owns its place while the geometry stays clear */
      else if (priorAt && clear(priorAt[0], priorAt[1])) at = priorAt;
      else if (clear(x, y) && !(this.bubbleSide && sideOf(x) !== this.bubbleSide && y + bh > face[1])) at = [x, y];
      else {
        at = near(candidates([face].concat(obs)));
      }
      const talking = this.bubble.classList.contains('on') && !!(this.bubble.textContent || '').trim();
      const claimNear = p => p && this.bubbleClaim && Math.abs(p[0] - origin[0] - this.bubbleClaim[0]) < 10 && Math.abs(p[1] - origin[1] - this.bubbleClaim[1]) < 10;
      const claimed = talking && claimNear(at), priorBand = this.bubbleKeepOff;
      if (!claimed) this.bubbleKeepOff = null;
      if (!at) {
        /* Nowhere inside the bounds clears every destination. Keeping the previous place
           is allowed when that place itself clears those destinations, even past the pane
           edge: the line stays beside the vault instead of sitting on the spot it is
           approaching. It does not claim a band, so a settled prop is not pushed. */
        const offProps = (cx, cy) => !obs.some((o) => over(cx, cy, o)) && !over(cx, cy, face) && !(bar && over(cx, cy, bar));
        if (priorAt && offProps(priorAt[0], priorAt[1])) { at = priorAt; this.bubbleClaim = null; }
        else {
          const cand = [[x, y]].concat(candidates([face].concat(bar ? [bar] : []))).filter(([cx, cy]) => fits(cx, cy) && !over(cx, cy, face) && !(bar && over(cx, cy, bar)));
          const open = cand.filter(([cx, cy]) => offProps(cx, cy));
          if (open.length) { at = open.sort((p, q) => cost(p) - cost(q))[0]; this.bubbleClaim = null; }
          else if (priorAt) {
            let cx = priorAt[0], cy = priorAt[1];
            const blockers = obs.concat(bar ? [bar] : []);
            for (let n = 0; n < blockers.length + 2; n++) {
              const hit = blockers.find((o) => over(cx, cy, o));
              if (!hit) break;
              const ways = [[hit[0] - bw - cx, 0], [hit[2] - cx, 0], [0, hit[1] - bh - cy], [0, hit[3] - cy]];
              ways.sort((p, q) => Math.hypot(p[0], p[1]) - Math.hypot(q[0], q[1]));
              cx += ways[0][0]; cy += ways[0][1];
            }
            at = [cx, cy]; this.bubbleClaim = null;
          } else {
            at = cand.sort((p, q) => cost(p) - cost(q))[0] || [x, y];
            this.bubbleClaim = talking ? [at[0] - origin[0], at[1] - origin[1]] : null;
          }
        }
      }
      /* (the place it claimed is kept while it stays there and talks: the props stay off it, instead of coming back under it
         as soon as their moving away has made its usual place clear, and going again the next frame) */
      if ((!claimed && this.bubbleClaim && at && !claimNear(at)) || !talking) this.bubbleClaim = null;
      /* A claim reserves the bubble through the SAME motion used to test obstacles. Reserving only this frame's
         box made it fail its own next clearance test (Ready: 16px oscillation). This does not force a placement:
         the normal candidate search above still decides whether the place is clear. Round the reservation out
         to the renderer's .01-unit grid so subpixel cancellation cannot churn restPose's geometry cache. */
      let room = null;
      if (talking) {
        const m = this.map || { k: 1, ox: 0, oy: 0 }, u = (px, py) => [(px - m.ox) / m.k, (py - m.oy) / m.k];
        const lo = at.map((p, i) => follows[i] ? motion.lo[i] + p - sp[i] : p), hi = at.map((p, i) => follows[i] ? motion.hi[i] + p - sp[i] : p);
        const a0 = u(lo[0] - gap, lo[1] - gap), a1 = u(hi[0] + bw + gap, hi[1] + bh + gap);
        room = a0.map(p => Math.floor((p + 1e-8) * 100) / 100).concat(a1.map(p => Math.ceil((p - 1e-8) * 100) / 100));
      }
      this.speechRoom = room ? { line: this.saying, rel: [at[0] - origin[0], at[1] - origin[1]], box: room } : null;
      this.bubbleKeepOff = this.bubbleClaim ? room : null;
      /* (a new claim moves the props off it in this same frame, before it is painted: on a stepped stage the props learnt of
         it a step later and sat under it for a tenth of a second) */
      if (this.bubbleKeepOff && JSON.stringify(this.bubbleKeepOff) !== JSON.stringify(priorBand)) { this.keepOff = this.bubbleKeepOff; this.renderN = (this.renderN || 0) + 1; this.props.forEach((pr) => this.placeProp(pr)); }
      if (at[0] !== x || at[1] !== y) { if (!this.bubbleRel || at !== prev) this.bubbleRelT = this.t; this.bubbleRel = [at[0] - origin[0], at[1] - origin[1]]; } else this.bubbleRel = null;
      [x, y] = at;
      this.bubbleSide = talking ? sideOf(x) : null;
      const dx = Math.max(x - head[0], head[0] - x - bw, 0), dy = Math.max(y - head[1], head[1] - y - bh, 0);
      const tail = dx > dy ? (head[0] < x ? 'left' : 'right') : (head[1] < y ? 'up' : 'down');
      this.bubbleAnchor = talking ? { key: anchorKey, line: this.saying, rel: [x - origin[0], y - origin[1]], w: bw, h: bh, side: tail } : null;
      /* where it is, with its tail, for the props that leave under it (holdUnder) */
      if (talking) { const m = this.map || { k: 1, ox: 0, oy: 0 }, u = (px, py) => [(px - m.ox) / m.k, (py - m.oy) / m.k], a0 = u(x - gap - (tail === 'left' ? 10 : 0), y - gap - (tail === 'up' ? 10 : 0)), a1 = u(x + bw + gap + (tail === 'right' ? 10 : 0), y + bh + gap + (tail === 'down' ? 10 : 0)); this.bubbleBox = [a0[0], a0[1], a1[0], a1[1]]; } else this.bubbleBox = null;
      /* (its place as `translate`: its pop's `scale` (30-art.css pstBubble) then grows it from its tail where it stands; a
         `transform` here was scaled with it, so the bubble flew in from the stage's corner, over Pip, FO-44) */
      /* (each written only when it changed: an inline style write is a mutation record and a style invalidation even when
         it is the same; PERF-1) */
      const bs = this.bubble.style, bk = this.bubbleW8 || (this.bubbleW8 = {}), put = (n, v) => { if (bk[n] !== v || bs.getPropertyValue(n) !== v) { bk[n] = v; bs.setProperty(n, v); } };
      put('translate', `${R(x)}px ${R(y)}px`);
      if (this.bubble.dataset.side !== tail) this.bubble.dataset.side = tail;
      put('--tx', R(clamp(head[0] - x, 16, bw - 16)) + 'px');
      put('--ty', R(clamp(head[1] - y, 12, bh - 12)) + 'px');
    }
    /* --------------------------------------------------------------- API */
    setTheme(theme) {
      if (theme === this.theme) return;
      this.theme = theme;
      this.booted = false; this.decoded = null;
      this.root.classList.add('pst-swap');
      this.build();
      this.direct(this.spec);
      /* the rebuilt rig is drawn in its pose before the browser can paint it, as addProp places a new prop (FA-10): a theme
         written after this frame's draw (NieR's moment writes it from inside a frame) left the new head and control with
         no transform for that frame, the kit's 64-unit Pip at the stage's corner (FO-40) */
      this.render();
      requestAnimationFrame(() => this.root.classList.remove('pst-swap'));
      this.kick();
    }
    setLayout(name) {
      if (name === this.layoutName) return;
      this.layoutName = name; this.ps = null;
      /* a new layout rebuilds the stage in its new shape; what it already shows stays as it was, finished: the tube on,
         Pip's line whole, the command line and NieR's label as they read. No entrance plays again (SW-23) */
      const okEl = this.hudEl && this.hudEl.querySelector('.pst-term-ok');
      this.cmdWas = this.cmdText; this.okWas = okEl ? okEl.textContent : '';
      this.relayout = true;
      try { this.build(); this.direct(this.spec); } finally { this.relayout = false; }
      this.render(); /* (drawn in its pose before it can be painted, as setTheme: group 1, FO-40; without it the new head
         painted unposed at the stage's corner for a frame or two once no entrance covered the rebuild, SW-23) */
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
    destroy() { if (this.off) this.off(); clearTimeout(this.questT); cancelAnimationFrame(this.raf); clearTimeout(this.parkT); clearTimeout(this.waitT); clearTimeout(this.holdT); this.dead = true; this.ro.disconnect(); window.removeEventListener('resize', this.onWinResize); clearTimeout(this.winRT); if (this.bubbleMO) this.bubbleMO.disconnect(); clearTimeout(this.wakeT); [this.tipW, this.typeT, this.decT, this.cmdT, this.bootT].forEach((w) => w && w.cancel()); this.root.innerHTML = ''; }

    /* ------------------------------------------------------------- the product's own */
    /* Pip parts the stage's CSS reads: setup-world-life off holds the world's own loops (clouds, caustics, motes, the
       tube's roll), strings off hides Pip's and the props' strings */
    parts() {
      const set = (a, on) => { if (this.root.hasAttribute(a) === !on) return; if (on) this.root.removeAttribute(a); else this.root.setAttribute(a, ''); };
      set('data-no-world-life', H.part('setup-world-life')); set('data-no-strings', H.part('strings'));
      this.dirty = true; this.kick();
    }
    // whether the loop runs: the window open and shown, the page visible, no drag under way, the stage on the page
    live() { if (this.held && this.heldAt && now() - this.heldAt > 3) { this.held = false; this.heldAt = 0; } return !this.dead && this.active && !this.held && !document.hidden && this.root.isConnected && !document.body.classList.contains('pm-resizing'); }
    // a stage that draws only what changed: Reduced Motion (nothing swings, travels, flickers or trails) and a computer
    // in low-resource mode
    still() { return this.reduced || !!O55.motion.lowResource; }
    kick() {
      this.dirty = true;
      if (this.raf || this.dead) return;
      if (!this.live()) { this.park(); return; }
      if (this.root.hasAttribute('data-paused')) this.root.removeAttribute('data-paused');
      /* (a loop waiting on its timer is the same loop, its clock running: it asks for the frame now and keeps its time) */
      if (this.waitT) { clearTimeout(this.waitT); this.waitT = 0; } else this.last = now();
      this.raf = requestAnimationFrame(this.loop);
    }
    // paused: look again a little later (a drag ends, the page shows again); nothing is drawn meanwhile
    park() {
      clearTimeout(this.parkT); clearTimeout(this.waitT); this.waitT = 0;
      if (!this.root.hasAttribute('data-paused')) this.root.setAttribute('data-paused', '');
      if (!this.dead && this.active) this.parkT = setTimeout(() => this.kick(), 250);
    }
    // how many blocks rest on the stack (Creating's Continue waits for the last one, O12 B)
    blocksLanded() { let n = 0; this.props.forEach((pr) => { if (pr.spec.ground && pr.state !== 'out' && pr.landed) n++; }); return n; }
    // a screen change the window holds back a frame (60-ui-core.js transition): the scene waits with it
    /* (a hold is for a screen change, a frame or a skin's bow, never longer: after a long run of Backs the last change's
       release never came, and the stage stood still mid-exchange, the old folder prop beside Pip and the name's sign
       half-way in under the header (B-A2-G-1); a hold that outlasts any change lets go by itself) */
    hold(on) { this.held = !!on; this.heldAt = on ? now() : 0; if (!on) this.kick(); else { clearTimeout(this.holdT); this.holdT = setTimeout(() => { if (this.held && now() - this.heldAt >= 2.9) this.hold(false); }, 3000); } }
    release() { this.hold(false); }
    // a letter lands on the sign (Name): it swings a little, alternately left and right (Reduced Motion: still)
    poke(id, o) { this.busy(); const pr = id && this.props.get(id); if (!pr || this.reduced) return; pr.av += (o.dir || 1) * this.fam.kick * 0.35 * (o.amp || 1); this.kick(); }
    // a choice made (O55.ui.charm): Pip is happy through its line and the chosen prop pops
    picked() { const sp = this.spec || {}; this.busy(); this.cheer(sp.target, { mood: 'happy', hold: 2600 }); }
    celebrate(o) { o = o || {}; this.confetti(o.count || 46); this.cheer(null, { sound: o.sound || 'crew' }); }
    // Creating's end: the last block is down (or the Project was already made), Pip is pleased
    /* the Project made: Pip cheers its last block with the block sound (the kit's flourish), at its touchdown; a block
       already down has sounded there, so the cheer is then silent */
    created() {
      const sp = this.spec || {}, pr = sp.target && this.props.get(sp.target), block = pr && pr.spec.kind === 'block';
      this.cheer(sp.target, block ? { mood: 'happy', hold: 1800, sound: pr.landed ? false : 'block', index: pr.spec.stack, count: (pr.spec.params && pr.spec.params.count) || pr.spec.stack + 1 } : { mood: 'happy', hold: 1800 });
    }
    // Ready's curtain call: confetti, the crew bows, and Pip's one wink, at its sign-off (59-cheer.js)
    curtainCall(o) { if (this.ready) this.ready(o || {}); }
  }

  /* ---------------------------------------------------------------- the chapter rail (O9)
     The header's bar is a string pulled taut between two screw eyes, each chapter's bead threaded on it, and Pip rides
     it like a zip line as the current-chapter marker: the string dips under Pip's weight, Pip slides to the current
     chapter on each look's own spring and swings when it stops, and the walked part of the string is in the accent.
     Retro steps the slide (Retro Light at ten frames a second, like its paper); NieR glides on a rigid track. Reduced
     Motion puts Pip in place. The loop runs only while Pip is moving, and never during a drag.
     QA-1 (Jared, 2026-11-08: "the progress bar indicator at the top that has pip move across the line runs through the
     circles and the section around the text cuts down into the other section"): the string is cut at every bead that is
     drawn, so it never runs through a hollow bead; a bead Pip's mark covers is not drawn (Pip stands in for it, as it
     always has for the current one), so Pip never slides over a bead, the one it is leaving included; and the string
     sits at the rail's --o55-rail-y (10-window.css), high enough that the label under it and the look's chip round the
     label stay inside the header. */
  const rail = PIP.rail = { x: null, v: 0, dip: 0, dv: 0, ang: 0, av: 0, cur: -1, raf: 0, last: 0, nav: null, xs: [], ws: [], y0: 10 };
  let railCut = 0;
  const SPRING = { friendly: [70, 11], glass: [26, 7.5], basic: [90, 19], retro: [110, 15], nier: [60, 16] };
  rail.mount = function mount(nav, cur, theme) {
    const K = H.kit(); if (!nav || !K) return;
    rail.nav = nav; rail.theme = theme;
    /* (the rail's markup holds both, kept by the window's morph: 60-ui-core.js renderRail) */
    const svg = nav.querySelector(':scope > .o55-railzip'), pip = nav.querySelector(':scope > .o55-railpip');
    if (!svg || !pip) return;
    /* (the mask holds a hole per drawn bead: the string and its walked part stop at each bead's edge, 58-rig.js rail.draw) */
    if (!svg.firstChild) { const id = `o55-railcut-${++railCut}`; svg.innerHTML = `<defs><mask id="${id}" maskUnits="userSpaceOnUse"><rect class="o55-railzip-cutall" fill="#fff"/><g class="o55-railzip-holes"></g></mask></defs><g mask="url(#${id})"><path class="o55-railzip-str"/><path class="o55-railzip-hi"/></g><circle class="o55-railzip-eye" r="2.6"/><circle class="o55-railzip-eye" r="2.6"/>`; }
    if (pip.getAttribute('data-theme-pip') !== theme) { pip.setAttribute('data-theme-pip', theme); pip.innerHTML = K.svg({ theme, px: 24, decorative: true }); }
    /* the rail's own size: a layout change (narrow, short, a look's labels) moves its beads after any window resize
       event has fired, so the rail measures again whenever it changes size (final check: Pip and its rope stayed at
       the old layout after 720x900 -> 1390x480) */
    if (!rail.ro && window.ResizeObserver) rail.ro = new ResizeObserver(() => rail.relayout());
    if (rail.ro && rail.observed !== nav) { rail.ro.disconnect(); rail.ro.observe(nav); rail.observed = nav; }
    rail.measure();
    if (rail.cur !== -1 && cur !== rail.cur && !O55.motion.reduced()) rail.av += (cur > rail.cur ? -1 : 1) * 0.6;
    rail.cur = cur;
    /* drawn now, where Pip is: the window's morph has just dropped the beads' inline state (their sag, and the hiding of
       the bead Pip is leaving), and a draw left to the next frame let that bead show under Pip for a frame */
    if (rail.px != null) rail.draw(rail.px, rail.pdip || 0, rail.pang || 0);
    rail.kick();
  };
  /* bead x positions, read once per render and on a resize (never per frame) */
  /* (in the rail's own, untransformed units: the window's entrance scales it, and a measure taken then would keep the
     scaled sizes once it settles; final check F1-3, a direct open in Glass was 5 px off) */
  rail.measure = function measure() {
    const nav = rail.nav; if (!nav) return;
    const nr = nav.getBoundingClientRect(), w = nav.offsetWidth || nr.width, k = nr.width && w ? nr.width / w : 1;
    rail.W = w;
    const y = parseFloat(getComputedStyle(nav).getPropertyValue('--o55-rail-y'));
    rail.y0 = Number.isFinite(y) ? y : 10;
    rail.nodes = Array.from(nav.querySelectorAll('.o55-railitem .o55-railnode'));
    const rs = rail.nodes.map((n) => n.getBoundingClientRect());
    rail.xs = rs.map((r) => (r.left + r.width / 2 - nr.left) / k);
    rail.ws = rs.map((r) => r.width / k);
  };
  /* measured again after a size change; a new window layout (wide, narrow, short) puts Pip at its bead at once, where a
     chapter change lets it travel */
  rail.relayout = function relayout() {
    const nav = rail.nav; if (!nav || !nav.isConnected) return;
    const win = nav.closest('[data-o55-layout]'), layout = win ? win.getAttribute('data-o55-layout') : '';
    const at = Math.max(0, rail.cur), was = rail.xs[at];
    rail.measure();
    const now0 = rail.xs[at];
    if (rail.layout !== undefined && rail.layout !== layout) rail.x = null;
    /* the layout moved the bead (the window growing or shrinking): Pip moves with it, a journey under way goes on */
    else if (rail.x != null && was != null && now0 != null) rail.x += now0 - was;
    rail.layout = layout;
    /* drawn now: a ResizeObserver runs after layout and before paint, so Pip and the rope are in place in the very
       frame the new layout paints (final check F1-3: a frame drawn later showed Pip at the old spot) */
    if (rail.raf) { cancelAnimationFrame(rail.raf); rail.raf = 0; }
    rail.force = true; rail.tick(); rail.force = false;
  };
  rail.kick = function kick() { if (!rail.raf) { rail.last = now(); rail.raf = requestAnimationFrame(rail.tick); } };
  rail.tick = function tick() {
    rail.raf = 0;
    const nav = rail.nav; if (!nav || !nav.isConnected || !rail.xs.length) return;
    if (!rail.force && (document.body.classList.contains('pm-resizing') || document.hidden)) { setTimeout(rail.kick, 250); return; }
    const tn = now(), dt = Math.min(0.04, tn - rail.last) / H.speed(); rail.last = tn;
    const fam = String(rail.theme || 'basic-dark').split('-')[0], rigid = fam === 'nier', red = O55.motion.reduced();
    /* (the string sits where the concept has it, clear of the window's top edge with Pip's bar under it: Muse M3; its
       height is the rail's --o55-rail-y, read by rail.measure) */
    const x0 = 6, tx = rail.xs[Math.max(0, rail.cur)] || x0, weight = rigid ? 0 : fam === 'basic' ? 2 : 4;
    if (rail.x == null || red) { rail.x = tx; rail.v = 0; rail.dip = weight; rail.dv = 0; rail.ang = 0; rail.av = 0; }
    const M2 = SPRING[fam] || SPRING.basic, ax = M2[0] * (tx - rail.x) - M2[1] * rail.v;
    rail.v += ax * dt; rail.x += rail.v * dt;
    const dA = 160 * (weight + Math.min(4, Math.abs(rail.v) * 0.01) - rail.dip) - 9 * rail.dv; rail.dv += dA * dt; rail.dip += rail.dv * dt;
    const aA = -38 * rail.ang - 3.2 * rail.av - ax * 0.0016; rail.av += aA * dt; rail.ang += rail.av * dt;
    const moving = Math.abs(tx - rail.x) > 0.3 || Math.abs(rail.v) > 1 || Math.abs(rail.av) > 0.01 || Math.abs(rail.ang) > 0.004 || Math.abs(rail.dip - weight) > 0.05;
    /* Retro Light is paper: the rail is drawn ten times a second (the spring still runs every frame) */
    if (rail.theme === 'retro-light' && moving && !red && !rail.force && tn - (rail.drawn || 0) < 0.1) { rail.kick(); return; }
    rail.drawn = tn;
    let px = rail.x, dip = Math.max(0, rail.dip);
    if (fam === 'retro') { px = Math.round(px / 4) * 4; dip = Math.round(dip); }
    rail.draw(px, dip, rail.ang);
    if (moving && !red) rail.kick();
  };
  /* The rail as it stands with Pip at px, the string dipped dip px under it and Pip turned ang radians: the string, its
     walked part, the beads on it and Pip. (Called by the tick and, at once, by a mount.) */
  rail.draw = function draw(px, dip, ang) {
    const nav = rail.nav; if (!nav || !nav.isConnected || !rail.xs.length) return;
    rail.px = px; rail.pdip = dip; rail.pang = ang;
    const W = rail.W, y0 = rail.y0, x0 = 6, x1 = W - 6;
    const yAt = (x) => (x <= px ? y0 + dip * (x - x0) / Math.max(1, px - x0) : y0 + dip * (x1 - x) / Math.max(1, x1 - px));
    const k = 6, d = dip > 0.4 ? `M${x0} ${y0}L${R(px - k)} ${R(yAt(px - k))}Q${R(px)} ${R(y0 + dip)} ${R(px + k)} ${R(yAt(px + k))}L${x1} ${y0}` : `M${x0} ${y0}H${x1}`;
    /* Pip's mark is 24 px hung from its pin (12, 5.4) and turned about it: how far its box reaches either side of px */
    const c = Math.abs(Math.cos(ang)), sn = Math.abs(Math.sin(ang)), reach = 12 * c + 18.6 * sn;
    /* each bead is threaded on the string, so it sits where the string sags (QA round 2, Q4; set every frame drawn: a
       re-render of the rail drops the inline offset, and the mount that follows draws again). A bead within Pip's reach
       is not drawn, and the string is cut at every bead that is, a hair inside its edge so string and outline meet */
    const holes = [];
    (rail.nodes || []).forEach((n, i) => {
      const dy = R(yAt(rail.xs[i]) - y0), half = (rail.ws[i] || 0) / 2, under = half > 0 && Math.abs(rail.xs[i] - px) < reach + half + 1;
      n.style.translate = dy ? `0 ${dy}px` : '';
      n.style.visibility = under ? 'hidden' : '';
      if (half > 0 && !under) holes.push(`<circle cx="${R(rail.xs[i])}" cy="${R(y0 + dy)}" r="${R(Math.max(0, half - 0.5))}" fill="#000"/>`);
    });
    const svg = nav.querySelector(':scope > .o55-railzip');
    if (svg) {
      svg.setAttribute('viewBox', `0 0 ${R(W)} 40`);
      svg.querySelector('.o55-railzip-str').setAttribute('d', d);
      svg.querySelector('.o55-railzip-hi').setAttribute('d', dip > 0.4 ? `M${x0} ${y0}L${R(px - k)} ${R(yAt(px - k))}Q${R(px)} ${R(y0 + dip)} ${R(px)} ${R(y0 + dip)}` : `M${x0} ${y0}H${R(px)}`);
      const all = svg.querySelector('.o55-railzip-cutall'), hg = svg.querySelector('.o55-railzip-holes');
      if (all) { all.setAttribute('x', '-20'); all.setAttribute('y', '-20'); all.setAttribute('width', R(W + 40)); all.setAttribute('height', '80'); }
      const mask = all && all.parentNode; if (mask) { mask.setAttribute('x', '-20'); mask.setAttribute('y', '-20'); mask.setAttribute('width', R(W + 40)); mask.setAttribute('height', '80'); }
      const hs = holes.join(''); if (hg && hg.__h !== hs) { hg.innerHTML = hs; hg.__h = hs; }
      const eyes = svg.querySelectorAll('.o55-railzip-eye');
      eyes[0].setAttribute('cx', x0); eyes[0].setAttribute('cy', y0); eyes[1].setAttribute('cx', R(x1)); eyes[1].setAttribute('cy', y0);
    }
    /* the mark's pin (32, 14.5 of 64) rides the string; at 24 px that is (12, 5.4) */
    const pip = nav.querySelector(':scope > .o55-railpip');
    if (pip) pip.style.transform = `translate(${R(px - 12)}px, ${R(y0 + dip - 5.4)}px) rotate(${R(ang * 57.3)}deg)`;
  };
  /* (on the next frame: the window's layout class, 60-ui-core.js layoutClass, is set by a resize listener of its own) */
  window.addEventListener('resize', () => { if (rail.nav && rail.nav.isConnected) requestAnimationFrame(rail.relayout); });

  Object.assign(PIP, {
    Stage, LAYOUTS, FAM,
    of: (host) => (host && host.__pipStage) || null,
    // the stage on a host, made once; the window keeps one for its life (60-ui-core.js renderScene)
    ensure(host, opts) { if (!host) return null; if (!host.__pipStage || host.__pipStage.dead) host.__pipStage = new Stage(host, opts || {}); return host.__pipStage; }
  });
  PIP.mixins.forEach((m) => Object.assign(Stage.prototype, m));
})();
