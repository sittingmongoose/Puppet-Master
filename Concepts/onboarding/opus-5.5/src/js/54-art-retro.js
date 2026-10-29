/* Retro's two worlds on Pip's stage (DL-238). Retro Dark is PMConcept7's own green-phosphor terminal: a charcoal
   monitor case with a sloped face, the tube with glow, scanlines, an aperture grille, grain, a flicker held under 3 %
   (the terminal's cap), a rolling bar and phosphor persistence trailing Pip; the tube refreshes in steps (20 a
   second) and a chapter change degausses it. Retro Light is the same machine's Paper Teletype printout: no screen and
   no bezel, green-bar paper rising out of the printer, drawn ten times a second like a flipbook, the head printing
   the command line and the paper feeding up a page on a chapter change. On both a terminal types what the scene is
   doing. The worlds and backdrops are here, and the stage's Retro parts as a mixin (O55.pipStage.h.mix). */
(function () {
  'use strict';
  const O55 = window.O55, PIP = O55.pipStage, PW = O55.pipWorlds, Hp = PIP.h, R = Hp.R, mix = PW.mix, T = Hp.T;
  Object.assign(PW.WORLDS, {
    // Retro Dark is PMConcept7's green-phosphor terminal (PM Phosphor Green): the stage is the tube
    'retro-dark': {
      fam: 'retro', scheme: 'dark', tube: 'phosphor', bg: '#071109', ink: '#77EA83', text: '#77EA83', line: '#77EA83',
      dim: '#1D4424', mid: '#3DCC56', bright: '#D3FFB0', glow: '#12FB56', fill: '#0B2411', fill2: '#14391B', screen: '#03140A',
      hues: { a: '#77EA83', b: '#87F2C4', c: '#C4EC35', d: '#D3FFB0', e: '#3DCC56' }, chapter: {}
    },
    // Retro Light is "the same machine's printout": PM Paper Teletype ink on green-bar paper
    'retro-light': {
      fam: 'retro', scheme: 'light', tube: 'teletype', bg: '#F4ECDD', paper: '#F4ECDD', ink: '#231E19', text: '#231E19', line: '#231E19',
      bar: '#E2E8D3', hole: '#E6DCCB', rule: '#B9B2A4', red: '#A13126', blue: '#2D4D8B', green: '#346B37', amber: '#815B16',
      hues: { a: '#2D4D8B', b: '#346B37', c: '#A13126', d: '#815B16', e: '#783B82' }, chapter: {}
    }
  });
  /* Pip on the tube: Retro Dark's Pip in PM Phosphor Green, Retro Light's in Paper Teletype ink (the kit's own Retro
     Pip, recoloured for the world it hangs in) */
  PIP.TUBE_PIP = (TH) => ({
    phosphor: Object.assign({}, TH['retro-dark'], { bg: '#071109', head: '#4FCB60', eye: '#041008', cheek: '#C4EC35', ctl: '#9BF5A6', str: '#3E8A48', pin: '#D3FFB0' }),
    teletype: Object.assign({}, TH['retro-light'], { bg: '#F4ECDD', head: '#346B37', eye: '#F4ECDD', cheek: '#A13126', ctl: '#231E19', str: '#5B544A', pin: '#A13126' })
  });
  /* a phosphor graticule (the terminal's "Phosphor grid" ground), its centre axes ticked, and a vector-terrain floor
     whose rows the stage scrolls toward you */
  PW.BACKDROPS.phosphor = function backdrop(w, ids, L) {
    const W = L.w, H = L.h, gy = L.ground, X0 = -W, X1 = 2 * W, Y0 = -H, Y1 = 2 * H;
    let defs = '', s = '';
    const rect = (fill, extra) => `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="${fill}"${extra || ''}/>`;
    // a phosphor graticule (PMConcept7's terminal ground "Phosphor grid"), its centre axes ticked, and a
    // vector-terrain floor whose rows the stage scrolls toward you
    s += rect(w.bg);
    const cols = 10, rows = 8, mx = 18, my = 22, gw = W - mx * 2, gh = gy - 30 - my;
    let g = '', a = '', t = '';
    for (let i = 0; i <= cols; i++) { const x = R(mx + gw * i / cols); (i === cols / 2 ? (a += `M${x} ${my}V${R(my + gh)}`) : (g += `M${x} ${my}V${R(my + gh)}`)); }
    for (let j = 0; j <= rows; j++) { const y = R(my + gh * j / rows); (j === rows / 2 ? (a += `M${mx} ${y}H${R(mx + gw)}`) : (g += `M${mx} ${y}H${R(mx + gw)}`)); }
    for (let k = 0; k <= cols * 5; k++) { const x = R(mx + gw * k / (cols * 5)), cy = R(my + gh / 2); t += `M${x} ${cy - 3}V${cy + 3}`; }
    s += `<path d="${g}" stroke="${w.ink}" stroke-opacity=".09" stroke-width="1" fill="none"/><path d="${a}" stroke="${w.ink}" stroke-opacity=".16" stroke-width="1" fill="none"/><path d="${t}" stroke="${w.ink}" stroke-opacity=".2" stroke-width="1" fill="none"/>`;
    // the sun on the horizon, striped the way a vector display draws one
    const sx = W * .74, sr = Math.min(64, W * .16);
    defs += `<clipPath id="${ids}sun"><rect x="${R(sx - sr - 2)}" y="${R(gy - sr - 2)}" width="${R(sr * 2 + 4)}" height="${R(sr + 2)}"/></clipPath>`;
    let stripes = '';
    for (let i = 0; i < 7; i++) stripes += `<rect x="${R(sx - sr)}" y="${R(gy - sr * (i + 1) / 7 + 1)}" width="${R(sr * 2)}" height="${R(Math.max(1, 3.2 - i * .35))}" fill="${w.ink}"/>`;
    s += `<g clip-path="url(#${ids}sun)" opacity=".22"><circle cx="${R(sx)}" cy="${gy}" r="${R(sr)}" fill="none" stroke="${w.ink}" stroke-width="1.4"/>${stripes}</g>`;
    // the terrain: rays to the vanishing point here, the moving rows in the stage (gTerrain)
    const vx = W / 2, vy = gy - 4;
    let rays = `M${X0} ${gy}H${X1}`;
    for (let i = -14; i <= 14; i++) rays += `M${R(vx + i * 6)} ${gy}L${R(vx + i * W * .22)} ${R(H + 40)}`;
    s += `<path d="${rays}" stroke="${w.ink}" stroke-opacity=".34" stroke-width="1.1" fill="none"/>`;
    s += `<rect x="${X0}" y="${R(vy - 1)}" width="${X1 - X0}" height="3" fill="${w.ink}" opacity=".12"/>`;
    return { defs, back: s, terrain: { vx, vy: gy, H: H + 40 } };
  };
  /* Paper Teletype: green-bar continuous paper with tractor-feed margins; the paper group feeds upward on a chapter
     change (the stage moves .st-paper) */
  PW.BACKDROPS.teletype = function backdrop(w, ids, L) {
    const W = L.w, H = L.h, gy = L.ground, X0 = -W, X1 = 2 * W, Y0 = -H, Y1 = 2 * H;
    let defs = '', s = '';
    const rect = (fill, extra) => `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="${fill}"${extra || ''}/>`;
    // Paper Teletype: green-bar continuous paper with tractor-feed margins; the paper group feeds
    // upward on a chapter change (the stage moves .st-paper)
    s += rect(w.paper);
    const band = 36, mL = 26, mR = W - 26;
    let bars = '', holes = '';
    for (let y = -band * 4; y < H + band * 30; y += band * 2) bars += `<rect x="${mL}" y="${y}" width="${mR - mL}" height="${band}" fill="${w.bar}"/>`;
    for (let y = -band * 4; y < H + band * 30; y += 18) holes += `<circle cx="13" cy="${y}" r="4.2" fill="${w.hole}" stroke="${w.rule}" stroke-width=".8"/><circle cx="${W - 13}" cy="${y}" r="4.2" fill="${w.hole}" stroke="${w.rule}" stroke-width=".8"/>`;
    const perf = `<path d="M${mL} ${-H}V${H + band * 30}M${mR} ${-H}V${H + band * 30}" stroke="${w.rule}" stroke-width="1" stroke-dasharray="2 4"/>`;
    // the page break: a perforation across the paper every so often
    let tears = '';
    for (let y = band * 12; y < H + band * 30; y += band * 12) tears += `<path d="M0 ${y}H${W}" stroke="${w.rule}" stroke-width="1" stroke-dasharray="1 3"/>`;
    s += `<g class="st-paper" data-band="${band * 2}">${bars}${tears}${holes}${perf}</g>`;
    // a printed axis for the floor, the way a plotter rules its baseline
    let ticks = '';
    for (let x = mL + 10; x <= mR - 10; x += 12) ticks += `M${x} ${gy}v${(x - mL - 10) % 60 === 0 ? 7 : 3.5}`;
    s += `<path d="M${mL + 6} ${gy}H${mR - 6}${ticks}" stroke="${w.ink}" stroke-width="1.2" fill="none"/>`;
    return { defs, back: s };
  };

  /* ------------------------------------------------------------------ the stage's Retro parts */
  Hp.mix({
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
    },
    // the print head sits where the next letter will land
    headTo() {
      if (!this.head || !this.hudEl) return;
      const cur = this.hudEl.querySelector('.pst-term-cur'), sh = this.screen.getBoundingClientRect();
      if (!cur || !sh.width) return;
      this.head.style.transform = `translateX(${R(cur.getBoundingClientRect().left - sh.left)}px)`;
    },
    ok() {
      const ok = this.hudEl && this.hudEl.querySelector('.pst-term-ok');
      if (!ok) return;
      ok.textContent = '  ' + T(this.tube === 'teletype' ? 'retroLight.ok' : 'retroDark.ok');
      ok.classList.remove('flash'); void ok.offsetWidth; ok.classList.add('flash');
      this.headTo();
    },
    // the welcome on a cold machine: a few lines of boot text, then the screen clears
    boot() {
      const pre = this.hudEl && this.hudEl.querySelector('.pst-term-boot');
      if (!pre || this.booted) return;
      this.booted = true;
      const lines = (O55.tx('pip.stage.' + (this.tube === 'teletype' ? 'retroLight' : 'retroDark') + '.boot') || []).concat(['']);
      const all = lines.join('\n');
      if (this.reduced) { pre.textContent = ''; return; }
      let i = 0; pre.textContent = ''; pre.classList.remove('gone');
      clearInterval(this.bootT);
      this.bootT = setInterval(() => {
        i += 2; pre.textContent = all.slice(0, i);
        if (i >= all.length) { clearInterval(this.bootT); setTimeout(() => pre.classList.add('gone'), 900); }
      }, 14);
    },
    powerOn() {
      if (this.reduced) return;
      const s = this.screen;
      s.classList.remove('pst-on', 'pst-off', 'pst-degauss'); void s.offsetWidth; s.classList.add('pst-on');
      setTimeout(() => this.sfx('powerOn'), 20);
    },
    powerOff() {
      if (!this.tube || this.reduced) return;
      const s = this.screen;
      s.classList.remove('pst-on', 'pst-off'); void s.offsetWidth; s.classList.add('pst-off');
      this.sfx('powerOff');
    },
    // Paper Teletype: the platen turns and the paper feeds up a band or two
    feedPaper(n) {
      if (!this.paper) return;
      const band = +this.paper.dataset.band || 72;
      this.feed += band * (n || 1);
      if (this.feed > band * 12) { this.paper.style.transition = 'none'; this.feed -= band * 6; this.paper.style.transform = `translateY(${-(this.feed - band * (n || 1))}px)`; void this.paper.getBoundingClientRect(); }
      this.paper.style.transition = '';
      this.paper.style.transform = `translateY(${-this.feed}px)`;
      this.sfx('feed');
    },
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
  });
})();
