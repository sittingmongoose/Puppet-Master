/* NieR's world on Pip's stage (DL-238, O8): parchment and graph paper, a YoRHa Pip that hovers like a Pod, a scanner
   ring turning, motes rising, a data column and a scan line sweeping the stage. The stage is a unit's HUD: a decoding
   label, target brackets that fly in and lock with a turning marker and a leader line labelled at its elbow, and on a
   chapter change QUEST UPDATED and a glitch in which two bands of the whole picture slip sideways for a moment (no
   black frame ever). Pip talks in a YoRHa dialogue box with its name tab, and its notes go in a TIPS box at the top
   right on every page. The world and backdrop are here, and the stage's NieR parts as a mixin. */
(function () {
  'use strict';
  const O55 = window.O55, PIP = O55.pipStage, PW = O55.pipWorlds, Hp = PIP.h, R = Hp.R, ease = Hp.ease;
  Object.assign(PW.WORLDS, {
    'nier-light': {
      fam: 'nier', scheme: 'light', paper: '#CCC8B1', paper2: '#C3BFA7', ink: '#211F1B', text: '#211F1B', line: '#211F1B', grid: 'rgba(33,31,27,.07)', red: '#A94A38',
      hues: { a: '#211F1B', b: '#211F1B', c: '#211F1B', d: '#211F1B', e: '#211F1B' }, chapter: {}
    },
    'nier-dark': {
      fam: 'nier', scheme: 'dark', paper: '#2F2D26', paper2: '#36342C', ink: '#D1CDB7', text: '#D1CDB7', line: '#D1CDB7', grid: 'rgba(209,205,183,.06)', red: '#C96B57',
      hues: { a: '#D1CDB7', b: '#D1CDB7', c: '#D1CDB7', d: '#D1CDB7', e: '#D1CDB7' }, chapter: {}
    }
  });
  /* parchment, graph paper, faint contour lines and a ruled horizon ending in squares */
  PW.BACKDROPS.nier = function backdrop(w, ids, L) {
    const W = L.w, H = L.h, gy = L.ground, X0 = -W, X1 = 2 * W, Y0 = -H, Y1 = 2 * H;
    let defs = '', s = '';
    const rect = (fill, extra) => `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="${fill}"${extra || ''}/>`;
    defs += `<pattern id="${ids}grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="${w.grid}" stroke-width="1"/></pattern>`;
    s += rect(w.paper) + rect(`url(#${ids}grid)`);
    for (let i = 0; i < 5; i++) s += `<ellipse cx="${R(W * .78)}" cy="${R(H * .22)}" rx="${60 + i * 34}" ry="${36 + i * 22}" fill="none" stroke="${w.ink}" stroke-opacity=".07" stroke-width="1"/>`;
    // a scanner ring turning slowly round Pip, ticked like a YoRHa map
    const rcx = L.ctl[0], rcy = R(L.ctl[1] + L.rope * .82), rr = R(Math.min(W * .4, L.rope * 1.05));
    let rt = '';
    for (let i = 0; i < 72; i++) { const a = i * Math.PI / 36, l = i % 6 === 0 ? 9 : 4; rt += `M${R(rcx + Math.cos(a) * rr)} ${R(rcy + Math.sin(a) * rr)}L${R(rcx + Math.cos(a) * (rr - l))} ${R(rcy + Math.sin(a) * (rr - l))}`; }
    s += `<g class="st-radar" style="transform-origin:${rcx}px ${rcy}px"><circle cx="${rcx}" cy="${rcy}" r="${rr}" fill="none" stroke="${w.ink}" stroke-opacity=".16" stroke-width="1" stroke-dasharray="2 5"/><path d="${rt}" stroke="${w.ink}" stroke-opacity=".22" stroke-width="1"/><rect x="${R(rcx - 3)}" y="${R(rcy - rr - 3)}" width="6" height="6" fill="${w.ink}" opacity=".5" transform="rotate(45 ${rcx} ${R(rcy - rr)})"/></g>`;
    s += `<circle cx="${rcx}" cy="${rcy}" r="${R(rr * .62)}" fill="none" stroke="${w.ink}" stroke-opacity=".07" stroke-width="1"/>`;
    // motes rising through the air, the way dust hangs in every NieR menu
    for (let i = 0; i < 16; i++) { const z = 1.6 + (i % 3) * 1.1; s += `<rect class="st-mote" style="--d:${R(11 + (i % 6) * 2.3)}s;--dl:${R(-i * 1.9)}s" x="${R((i * 89 + 30) % (W - 40) + 20)}" y="${R(gy - 10)}" width="${R(z)}" height="${R(z)}" fill="${w.ink}" opacity=".4"/>`; }
    // the unit's designation, set small and sideways down the left ruler
    s += `<text transform="translate(22 ${R(gy - 24)}) rotate(-90)" font-family="'PM NieR Mono', ui-monospace, monospace" font-size="7.5" letter-spacing="2.2" fill="${w.ink}" opacity=".45">YoRHa // PIP P-01 // GUIDE SUPPORT UNIT</text>`;
    // a data column at the right edge, scrolling
    let col = '';
    for (let i = 0; i < 40; i++) col += `<text x="${W - 12}" y="${i * 14}" text-anchor="end">${((i * 2654435761) >>> 0).toString(16).slice(0, 4).toUpperCase()} ${(i * 37 % 256).toString(2).padStart(8, '0')}</text>`;
    defs += `<clipPath id="${ids}dc"><rect x="${W - 90}" y="40" width="80" height="${R(gy - 80)}"/></clipPath>`;
    s += `<g clip-path="url(#${ids}dc)" opacity=".2" fill="${w.ink}" font-family="'PM NieR Mono', ui-monospace, monospace" font-size="7.5" letter-spacing=".08em"><g class="st-data">${col}${col.replace(/y="(\d+)"/g, (m, y) => `y="${+y + 560}"`)}</g></g>`;
    s += `<path d="M14 ${gy}H${W - 14}" stroke="${w.ink}" stroke-width="1"/><rect x="10" y="${gy - 4}" width="8" height="8" fill="${w.ink}"/><rect x="${W - 18}" y="${gy - 4}" width="8" height="8" fill="${w.ink}"/>`;
    for (let x = 30; x < W - 20; x += 20) s += `<path d="M${x} ${gy}v${x % 100 === 30 ? 7 : 4}" stroke="${w.ink}" stroke-opacity=".6" stroke-width="1"/>`;
    for (let y = 30; y < gy - 10; y += 20) s += `<path d="M6 ${y}h${y % 100 === 30 ? 8 : 4}" stroke="${w.ink}" stroke-opacity=".45" stroke-width="1"/>`;
    return { defs, back: s };
  };

  /* ------------------------------------------------------------------ the stage's NieR parts */
  Hp.mix({
    /* -------------------------------------------------------- NieR HUD */
    hudTarget(id, label) {
      if ((id || null) !== this.target) this.tgtT = this.t;
      this.target = id || null;
      if (this.famName !== 'nier') return;
      const t = this.hudEl && this.hudEl.querySelector('.pst-target');
      if (t) t.textContent = (label || (id ? id : 'STANDBY')).toUpperCase();
    },
    decode(text) {
      const d = this.hudEl && this.hudEl.querySelector('.pst-decode');
      if (!d) return;
      const glyphs = '#%&*+=<>/\\01';
      const goal = text.toUpperCase().slice(0, 28);
      if (goal === this.decoded) return;
      this.decoded = goal;
      if (this.decT) this.decT.cancel();
      if (this.reduced || !goal) { d.textContent = goal; return; }
      this.sfx('decode');
      this.decT = PIP.h.typer(goal.length * 2, 1000 / 32, (n) => {
        d.textContent = goal.split('').map((ch, i) => i < n / 2 || ch === ' ' ? ch : glyphs[(i * 7 + n) % glyphs.length]).join('');
      }, { paused: () => !this.live() });
    },
    lockOn(pr) {
      if (!pr) return;
      this.lockT = this.t;
      this.sfx('lock', { x: pr.ax });
      const lab = this.hudEl && this.hudEl.querySelector('.pst-target');
      if (lab) { lab.dataset.state = 'confirmed'; clearTimeout(this.lockTO); this.lockTO = setTimeout(() => { delete lab.dataset.state; }, 1400); }
    },
    // a chapter change in NieR: QUEST UPDATED wipes across the top of the stage
    quest(name) {
      const q = this.hudEl && this.hudEl.querySelector('.pst-nquest');
      if (!q) return;
      q.querySelector('.pst-nquest-t').textContent = name.toUpperCase();
      q.classList.remove('on'); void q.offsetWidth; q.classList.add('on');
      // and it lets go once it has wiped out again (it used to stay "on", which hid every tip after the first chapter)
      clearTimeout(this.questT); this.questT = setTimeout(() => q.classList.remove('on'), 2900);
    },
    renderSlice() {
      const k = this.sliceT != null && !this.reduced ? (this.t - this.sliceT) / .42 : 1;
      if (k >= 1) { if (this.gSlice.getAttribute('display') !== 'none') this.gSlice.setAttribute('display', 'none'); return; }
      const H = this.L.h, step = [[.14, .27, -16, .55, .61], [.5, .58, 12, .3, .36], [.33, .44, -9, .7, .74], [.64, .79, 7, .2, .24], [.06, .13, -5, .46, .52], [.4, .47, 3, .82, .86]][Math.min(5, Math.floor(k * 6))];
      this.sliceR[0].setAttribute('y', R(step[0] * H)); this.sliceR[0].setAttribute('height', R((step[1] - step[0]) * H));
      this.sliceR[1].setAttribute('y', R(step[3] * H)); this.sliceR[1].setAttribute('height', R((step[4] - step[3]) * H));
      this.gSlice.setAttribute('transform', `translate(${step[2]} 0)`);
      this.gSlice.setAttribute('display', 'inline');
    },
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
  });
})();
