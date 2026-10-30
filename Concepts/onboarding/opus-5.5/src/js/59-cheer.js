/* Pip's celebrations and moments (DL-238): what the stage does when a choice lands, a block is set down, the person
   arrives on Welcome, or Ready ends setup. Each world answers in its own material: Friendly stars, hearts and a hop;
   Glass glints, bubbles and ripples; Basic a check badge on the prop's corner and a ring spreading from it; Retro Dark
   phosphor pixels and glyphs with [ OK ]; Retro Light printed marks and paper chads with DONE; NieR target brackets
   that lock, // CONFIRMED and a burst of squares. Creating's blocks slow into place, arrive level, squash as they
   take their weight (the blocks below give a touch), unhook their strings, which lift away, and sound at touchdown
   (O12: a block lands when its owner phase completes; nothing here gates Continue or Ready). Reduced Motion keeps the
   faces and the sounds and drops the motion. A mixin of O55.pipStage (58-rig.js). */
(function () {
  'use strict';
  const O55 = window.O55, PIP = O55.pipStage, H = PIP.h;
  const { R, el, ease } = H;
  const pointer = () => PIP.pointer || { t: 0 };
  H.mix({
    hop(k) { if (this.reduced || this.fam.noHop) return; this.ps.dyv -= 210 * (k || 1); this.sfx('hop', { x: this.ps.C.x }); },
    nod() { if (this.reduced) return; this.ps.tiltv += 2.4; },
    // the moment a choice lands: the prop pops, Pip is pleased, the world celebrates in its own way
    cheer(propId, opts) {
      opts = opts || {};
      const pr = propId && this.props.get(propId);
      this.feel(opts.mood || 'happy', opts.hold || 1400);
      // a block still being lowered: Pip is pleased now, the sound and the flourish wait for its touchdown
      if (pr && pr.spec.ground && !pr.landed && !this.reduced) { pr.onLand = () => { this.cheerAt(pr, opts); if (opts.then) opts.then(); }; return; }
      this.cheerAt(pr, opts);
      if (opts.then) opts.then();
    },
    cheerAt(pr, opts) {
      const at = pr ? this.propCentre(pr) : this.headCentre();
      this.sfx(opts.sound || 'cheer', { x: at[0], index: opts.index, count: opts.count });
      if (this.famName === 'nier') { this.ps.tiltv -= 1.2; } else this.hop(.8);
      if (pr && !this.reduced && !pr.spec.ground) { pr.sv -= 2.2; pr.av += this.fam.kick * .8; }
      if (this.tube) this.ok();
      /* (Pip parts: cheers off keeps the face and the sound, without the flourish) */
      if (this.reduced || !H.part('cheers')) { if (this.famName === 'nier') this.lockOn(pr); return; }
      const f = this.famName;
      if (f === 'friendly') this.burst(at, ['star', 'heart', 'dot'], 12);
      else if (f === 'glass') this.burst(at, ['glint', 'bubble'], 10);
      else if (f === 'basic') this.badge(pr, at);
      else if (this.tube === 'phosphor') this.burst(at, ['pix', 'glyph'], 14);
      else if (this.tube === 'teletype') this.burst(at, ['print', 'chad'], 12);
      else if (f === 'nier') { this.lockOn(pr); this.burst(at, ['nsq'], 10); }
      if (f !== 'nier' && f !== 'basic') setTimeout(() => this.sfx('sparkle', { x: at[0] }), 90);
    },
    wake() {
      // the welcome: Pip asleep on slack strings. It wakes when you arrive (the pointer travelling, a key or a
      // press), and the hand lifts it up. Nothing else wakes it: no timer (HANDOFF W3: only on a real arrival).
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
      const off = () => { ['pointermove', 'keydown', 'pointerdown'].forEach((k) => document.removeEventListener(k, up, true)); };
      ['pointermove', 'keydown', 'pointerdown'].forEach((k) => document.addEventListener(k, up, true));
      this.off = off;
    },
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
        /* printed marks: a star and a plus typed, a cross and a tick drawn (no symbol glyphs in the words) */
        if (kind === 'print') { const ink = i % 2 ? w.ink : w.red; sh = i % 4 < 2 ? `<text font-family="'IBM Plex Mono', monospace" font-weight="700" font-size="15" text-anchor="middle" dominant-baseline="central" fill="${ink}">${i % 4 ? '+' : '*'}</text>` : i % 4 === 2 ? `<path d="M-4 -4L4 4M4 -4L-4 4" stroke="${ink}" stroke-width="2.2" stroke-linecap="square"/>` : `<path d="M-5 0L-1.5 3.5L5 -4" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="square"/>`; }
        if (kind === 'chad') sh = `<circle r="3.4" fill="${w.hole}" stroke="${w.rule}" stroke-width=".8"/>`;
        if (kind === 'nsq') sh = `<rect x="-2.5" y="-2.5" width="5" height="5" fill="${w.ink}" transform="rotate(45)"/>`;
        e.innerHTML = sh;
        const nsq = kind === 'nsq', ang = nsq ? i / n * Math.PI * 2 : a;
        const p = { e, kind, x: at[0], y: at[1], vx: Math.cos(ang) * (nsq ? 150 : sp), vy: Math.sin(ang) * (nsq ? 150 : sp) - (nsq ? 0 : 60), r: nsq ? 0 : Math.random() * 6, vr: nsq ? 0 : (Math.random() - .5) * 8, life: 0, max: nsq ? .55 : .9 + Math.random() * .5, g: kind === 'bubble' ? -120 : kind === 'glint' || nsq ? 0 : 260, drag: nsq ? 5 : .8 };
        this.fx.push(p);
      }
    },
    // Basic marks a choice the way a diagram would: a check badge on the prop's corner and a ring spreading
    // from it, both riding the prop as it swings
    badge(pr, at) {
      const w = this.w, sc = pr ? this.propTarget(pr).sc : this.L.propScale;
      const off = pr ? [34 * sc, -30 * sc] : [0, -50 * sc];
      const mk = (html) => { const e = el('g', { class: 'pst-p' }, this.gFx); e.innerHTML = html; return e; };
      const ring = mk(`<circle r="11" fill="none" stroke="${w.accent}" stroke-width="1.5"/>`);
      const chk = mk(`<circle r="11" fill="${w.accent}" stroke="${w.bg}" stroke-width="2"/><path d="M-5 .5L-1.6 3.9L5.2 -3.4" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>`);
      [[ring, 'ring', .8], [chk, 'check', 1.5]].forEach(([e, kind, max]) => this.fx.push({ e, kind, x: at[0] + off[0], y: at[1] + off[1], vx: 0, vy: 0, r: 0, vr: 0, life: 0, max, g: 0, follow: pr || null, off }));
    },
    confetti(n) {
      if (this.reduced || this.famName === 'nier' || !H.part('cheers')) return;
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
    },
    // a prop has come to rest: the floor answers in the world's material
    settle(pr) {
      pr.settled = true;
      if (pr.spec.preview || pr.state === 'out') return;
      const x = pr.pos ? pr.pos[0] : pr.ax;
      if (!pr.spec.stack && pr.spec.stack !== 0) this.sfx('land', { x });
      if (this.reduced) return;
      if (this.famName === 'glass') this.ripple(x);
    },
    ripple(x, y, big) {
      const Lay = this.L, yy = y == null ? Lay.ground : y, e = el('ellipse', { cx: R(x), cy: R(yy), rx: 4, ry: 1, fill: 'none', stroke: '#fff', 'stroke-width': 1.2 }, this.gRipple);
      this.fx.push({ e, kind: 'ripple', x, y: yy, vx: 0, vy: 0, r: 0, vr: 0, life: 0, max: big === false ? .9 : 1.4, g: 0, drag: 0, small: big === false });
    },
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
    },
    /* Ready (O10): the choices come back as charms and the crew takes its curtain call, with confetti in the look's
       own material; Pip winks once, at its sign-off, when its line is said (the only wink: none is random). Reduced
       Motion: no confetti, the faces still change. When the Guided Tour is chosen, Pip hands the strings on: the hand
       lifts out of view as the tour's first callout takes over (handOff). */
    ready() {
      clearTimeout(this.readyT); clearTimeout(this.winkT);
      this.readyT = setTimeout(() => { if (this.dead) return; this.confetti(60); this.cheer(null, { sound: 'crew' }); }, this.reduced ? 0 : 500);
      this.winkT = setTimeout(() => { if (!this.dead) this.feel('wink', 900); }, this.reduced ? 1200 : 2700);
    },
    handOff() {
      if (this.reduced || this.dead) return;
      this.feel('happy', 1400); this.sfx('lift', { x: this.ps.C.x });
      this.ps.Ct.y = -this.L.h * .6; this.kick();
    }
  });
})();
