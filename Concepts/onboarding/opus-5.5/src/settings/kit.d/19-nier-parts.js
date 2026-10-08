/* O55 · NieR Mode parts, the script half: Look, Motion, Sound & voice and Pointer (17 of the 29; the World parts, the
   Plug-in Chips manager and Pod 042 are kit.d/20-* and managers/57-nier.js). The styles are styles.d/14-nier-parts.css.
   Contract: kit.d/18-nier.js. A part is live while PM_NIER.has(key); each part below installs when its key arrives and
   removes everything it added when the key goes, so every part is silent while NieR Mode is off.
     square, headers, diamonds, slice, pointer   CSS only (the parts attribute)
     ground, particles   one fixed layer (#o55np-ground) between the scene and the shell: the still grid, twelve motes
     cursor              one shared cursor (#o55np-cursor), placed by transform on pointerover and keyboard focus
     brackets            one reticle of four corners (#o55np-reticle), placed by transform on keyboard focus and on a
                         chosen tab or item
     reboot              PM_NIER.setTransition: an ink band down, the repaint under full cover, a stepped flicker back
     decode              page titles on a page change (PM_PAGES.go, a Settings page) and arriving toasts, ~250 ms
     wipe                PM_PAGES.go: a band over the page area while the new page draws, sliding off
     sweep               one one-shot Web Animation every 12 s (a timer; nothing runs between sweeps)
     glitch              a one-shot split of an arriving error or warning toast
     sounds              a small Web Audio synth: ticks, select, confirm, cancel, the Pod's chirp; only while
                         general.interaction.sound-effects is on, through O55.sound's context and mute when present
     voice               CSS leads (Report / Alert / Proposal) and the POD 042 band; a proposal is tagged at arrival
     pod                 #o55np-pod bobbing by CSS; it turns toward each arriving toast and sends it
   Toasts: window.toast and PM_TITLEBAR_NOTIFY.push are wrapped once (straight through while NieR Mode is off); the card
   the shell stages synchronously in #rsStage is handed to the parts, so no observer watches the page.
   Performance (README "Performance rules"): no requestAnimationFrame loop and no page-wide MutationObserver; rects are
   read only on input events, before any write; motion is CSS or Web Animations of transform and opacity, and
   Element.prototype.animate (kit.d/17-look.js) scales it with Animation speed; timers are scaled the same way. */
(function o55NierPartsModule() {
  const html = document.documentElement;
  const NIER = () => window.PM_NIER || null;
  const has = key => { const n = NIER(); try { return !!(n && n.has(key)); } catch (e) { return false; } };
  /* installed whether or not NieR Mode is painted (a transition runs before the repaint) */
  const installed = key => { const n = NIER(); try { return !!(n && n.parts().includes(key)); } catch (e) { return false; } };
  const still = () => {
    try { if (o55Still()) return true; } catch (e) { /* kit.d/20-motion.js not read yet */ }
    return html.getAttribute('data-motion') === 'reduced' || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  const speed = () => { try { return o55SpeedFactor || 1; } catch (e) { return 1; } };
  const later = (fn, ms) => window.setTimeout(fn, Math.round(ms * speed()));
  const onboarding = () => html.hasAttribute('data-o55-open');
  const tone = () => (/-light$/.test(html.getAttribute('data-theme') || '') ? 'light' : 'dark');
  const zoom = () => { const z = document.body && Number.parseFloat(document.body.style.zoom); return Number.isFinite(z) && z > 0 ? z : 1; };
  const frames = n => new Promise(res => { const step = () => (--n <= 0 ? res() : window.requestAnimationFrame(step)); window.requestAnimationFrame(step); });
  function layer(id, cls) {
    const e = document.createElement('div');
    e.id = id; if (cls) e.className = cls; e.setAttribute('aria-hidden', 'true');
    document.body.appendChild(e);
    return e;
  }

  /* ---------- the part registry ---------------------------------------------------------------------------------- */
  const PARTS = {};
  const live = new Set();
  function sync() {
    if (!document.body) return;
    Object.keys(PARTS).forEach(key => {
      const want = has(key);
      if (want === live.has(key)) return;
      if (want) live.add(key); else live.delete(key);
      try { PARTS[key][want ? 'on' : 'off'](); } catch (e) { /* a part never breaks the app */ }
    });
    hooks();
  }

  /* ---------- sounds: a small synth of the game's menu blips ------------------------------------------------------
     One audio path: with the onboarding layer present (src/js/15-sound.js) every blip plays through O55.sound.synth,
     on its context and master and under its mute (no second AudioContext); this module's own context is only the
     fallback for a page without it. The table takes its bus as a parameter (5.6 Pro's nier-parts.js has the same
     numbers), so any context can play or render it. Inside the onboarding window O55 owns sound (its NieR kit plays
     these same blips), so the document-wide menu sounds stay quiet there, on the tour's own controls and on synthetic
     clicks (a tour's Show Me presses the real control; O55.sound.suppress(ms) holds them too). Outside onboarding
     they also follow general.interaction.sound-effects, the Settings value (Settings_System 4.4). */
  let ac = null, acBus = null, lastTick = 0;
  const buses = new WeakMap();
  function busFor(ctx, out) {
    /* the synth's own level into the destination's chain, one per context and destination */
    let m = buses.get(ctx); if (!m) { m = new Map(); buses.set(ctx, m); }
    let b = m.get(out);
    if (!b) { b = ctx.createGain(); b.gain.value = 0.6; b.connect(out); m.set(out, b); }
    return b;
  }
  function audio() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    if (!ac) {
      try {
        ac = new AC(); acBus = ac.createGain(); acBus.gain.value = 1;
        const comp = ac.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3;
        acBus.connect(comp); comp.connect(ac.destination);
      } catch (e) { ac = null; return null; }
    }
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    return ac.state === 'closed' ? null : ac;
  }
  const soundAllowed = () => { try { return o55On(PM51.value('general.interaction.sound-effects')); } catch (e) { return false; } };
  const o55Sound = () => { const S = window.O55 && window.O55.sound; return S && typeof S.synth === 'function' ? S : null; };
  /* the onboarding window and the tour's own chrome: O55 plays there */
  const O55_SURFACE = '#pm-o55-onboarding, #pm-o55-tour';
  const inO55 = t => !!(t && t.closest && t.closest(O55_SURFACE));
  function blip(c, bus, t, f, dur, gain, type, f2) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.03);
  }
  function sweepTone(c, bus, t, up) {
    const o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(up ? 98 : 196, t); o.frequency.exponentialRampToValueAtTime(up ? 196 : 98, t + 0.55);
    f.type = 'lowpass'; f.Q.value = 7; f.frequency.setValueAtTime(up ? 260 : 3400, t); f.frequency.exponentialRampToValueAtTime(up ? 3400 : 260, t + 0.5);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
    o.connect(f); f.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.66);
    blip(c, bus, t + (up ? 0.5 : 0.02), up ? 1760 : 880, 0.12, 0.03);
  }
  const SFX = {
    tick: (c, b, t) => blip(c, b, t, 2640, 0.026, 0.028),
    select: (c, b, t) => { blip(c, b, t, 1480, 0.05, 0.045, 'triangle'); blip(c, b, t + 0.038, 2220, 0.07, 0.035); },
    confirm: (c, b, t) => { blip(c, b, t, 988, 0.08, 0.05, 'triangle'); blip(c, b, t + 0.07, 1480, 0.17, 0.05, 'triangle'); },
    cancel: (c, b, t) => { blip(c, b, t, 1318, 0.07, 0.045, 'triangle'); blip(c, b, t + 0.06, 880, 0.16, 0.045, 'triangle'); },
    pod: (c, b, t) => { blip(c, b, t, 1760, 0.05, 0.03); blip(c, b, t + 0.06, 2350, 0.05, 0.026); blip(c, b, t + 0.12, 1975, 0.09, 0.026); },
    alert: (c, b, t) => { blip(c, b, t, 523, 0.09, 0.05, 'triangle'); blip(c, b, t + 0.1, 523, 0.09, 0.05, 'triangle'); blip(c, b, t + 0.2, 392, 0.2, 0.05, 'triangle'); },
    sweepOn: (c, b, t) => sweepTone(c, b, t, true),
    sweepOff: (c, b, t) => sweepTone(c, b, t, false)
  };
  /* which of these matter when two sounds meet (O55.sound keeps the more important one) */
  const SFX_PRIO = { tick: 20, select: 45, confirm: 60, cancel: 55, pod: 48, alert: 84, sweepOn: 93, sweepOff: 93 };
  /* force: the reboot plays while NieR Mode is still off (turning on), so it asks for the installed part instead */
  function sfx(name, force) {
    if (!(force ? installed('sounds') : live.has('sounds')) || !SFX[name]) return false;
    /* the onboarding window holds the app beneath still and plays its own NieR kit */
    if (!force && onboarding()) return false;
    const now = performance.now();
    if (name === 'tick' && now - lastTick < 45) return false;
    if (!soundAllowed()) return false;
    const O = o55Sound();
    let ok = false;
    if (O) ok = O.synth((c, out, t) => SFX[name](c, busFor(c, out), t), { force: !!force, name: 'nier:' + name, priority: SFX_PRIO[name] });
    else {
      const c = audio(); if (!c) return false;
      try { SFX[name](c, busFor(c, acBus), c.currentTime + 0.004); ok = true; } catch (e) { return false; }
    }
    if (!ok) return false;
    if (name === 'tick') lastTick = now;
    sfxLog.push({ name, t: Math.round(now) }); if (sfxLog.length > 60) sfxLog.shift();
    return true;
  }
  const sfxLog = [];

  /* ---------- menu cursor ------------------------------------------------------------------------------------------ */
  /* the items that become an ink bar (the same list as the CSS in styles.d/14-nier-parts.css) */
  const CURSOR_SEL = ['.page-tab:not(.active)', '.pm6-tb-menu-item', '.pm6-tt-mode', '.pm6-tb-pages-more-item', '.activity-bar .icon', '.domain-link',
    '.side-link', '.index-link', '.page-index-title', '.workspace-tab', '.manager-tab', '.resource-row', '.pm51-popout-item:not([aria-disabled="true"])',
    '.pm51-menu-item', '.pm7u-navbtn', '.pm7u-poprow', '.orch-tab', '.pm-segtab-item:not(.active)', '.fm-row', '.fm-ctx-item', '.ctx-item', '.menu-item',
    '.chat-dropdown-item', '.pm6-chat-more-item', '.cl-mode-item', '.pm-home-menu-row', '.palette-item', '.search-result-item', '.slash-cmd-item',
    '.pm6-chat-slash-item', '.pm6-fab-item', '.chat-thread-item', '.pm6-dash-catalog-item', '[role="menuitem"]', '[role="option"]:not([aria-disabled="true"])'].join(',');
  /* tabs and places a click chooses, where the brackets lock on (menu items close with their menu) */
  const CHOSEN_SEL = '.page-tab, .workspace-tab, .manager-tab, .orch-tab, .pm7u-navbtn, .domain-link, .side-link, .index-link, .page-index-title, .pm-segtab-item, .activity-bar .icon, .resource-row';
  /* items in a horizontal strip: the cursor sits under them (a neighbour sits where the left side would be) */
  const STRIP_SEL = '.page-tab, .workspace-tab, .manager-tab, .orch-tab, .pm-segtab-item, .pm6-tt-mode, .pm7u-range button';
  const targetOf = e => (e && e.target && e.target.closest ? e.target.closest(CURSOR_SEL) : null);
  let cur = null, curT = null, curHide = 0;
  function curPlace(t) {
    if (!cur) return;
    const r = t.getBoundingClientRect(), z = zoom();
    if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > window.innerHeight) { curOff(); return; }
    let x = r.left - 12, y = r.top + r.height / 2 - 4.5, side = 'left';
    if (t.matches(STRIP_SEL)) { x = r.left + r.width / 2 - 4.5; y = r.bottom + 3; side = 'below'; } else if (x < 2) { x = r.right + 5; side = 'right'; }
    const wasOn = cur.hasAttribute('data-on');
    if (!wasOn) { cur.setAttribute('data-jump', ''); frames(2).then(() => { if (cur) cur.removeAttribute('data-jump'); }); }
    cur.style.transform = `translate(${Math.round(x / z)}px, ${Math.round(y / z)}px)`;
    if (cur.dataset.side !== side) cur.dataset.side = side;
    if (!wasOn) cur.setAttribute('data-on', '');
  }
  function curOff() { curT = null; if (cur && cur.hasAttribute('data-on')) cur.removeAttribute('data-on'); }
  function curOver(e) {
    const t = targetOf(e);
    if (t === curT) { if (curHide) { window.clearTimeout(curHide); curHide = 0; } return; }
    if (!t) { if (!curHide && curT) curHide = window.setTimeout(() => { curHide = 0; curOff(); }, 90); return; }
    if (curHide) { window.clearTimeout(curHide); curHide = 0; }
    curT = t; curPlace(t);
    sfx('tick');
  }
  function curFocus(e) {
    const t = targetOf(e); if (!t) return;
    let fv = false; try { fv = e.target.matches(':focus-visible'); } catch (x) { fv = false; }
    if (fv) { curT = t; curPlace(t); sfx('tick'); }
  }
  PARTS.cursor = {
    on() {
      cur = layer('o55np-cursor'); cur.innerHTML = '<i></i>';
      document.addEventListener('pointerover', curOver, true);
      document.addEventListener('focusin', curFocus, true);
    },
    off() {
      document.removeEventListener('pointerover', curOver, true);
      document.removeEventListener('focusin', curFocus, true);
      if (curHide) window.clearTimeout(curHide); curHide = 0; curT = null;
      if (cur) cur.remove(); cur = null;
    }
  };

  /* ---------- target brackets --------------------------------------------------------------------------------------- */
  let ret = null, retT = null, retLock = 0, retScroll = 0;
  const RET_GAP = 3, RET_S = 10;
  function retPlace(t) {
    if (!ret || !t || !t.isConnected) { retOff(); return; }
    const r = t.getBoundingClientRect(), z = zoom();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > window.innerHeight) { retOff(); return; }
    const l = r.left - RET_GAP, tp = r.top - RET_GAP, rt = r.right + RET_GAP - RET_S, b = r.bottom + RET_GAP - RET_S;
    const pos = [[l, tp, 1, 1], [rt, tp, -1, 1], [l, b, 1, -1], [rt, b, -1, -1]];
    const wasOn = ret.hasAttribute('data-on'), c = ret.children;
    if (!wasOn) { ret.setAttribute('data-jump', ''); frames(2).then(() => { if (ret) ret.removeAttribute('data-jump'); }); }
    pos.forEach(([x, y, sx, sy], i) => { c[i].style.transform = `translate(${Math.round(x / z)}px, ${Math.round(y / z)}px) scale(${sx}, ${sy})`; });
    if (!wasOn) {
      ret.setAttribute('data-on', '');
      if (!still()) pos.forEach(([, , sx, sy], i) => c[i].animate([{ translate: `${-sx * 9}px ${-sy * 9}px`, opacity: 0 }, { translate: '0px 0px', opacity: 1 }], { duration: 210, easing: 'steps(3, end)' }));
    }
  }
  function retOff() { retT = null; if (ret && ret.hasAttribute('data-on')) ret.removeAttribute('data-on'); }
  function retFocus(e) {
    const t = e.target; if (!(t instanceof Element)) return;
    let fv = false; try { fv = t.matches(':focus-visible'); } catch (x) { fv = false; }
    if (!fv) return;
    if (retLock) { window.clearTimeout(retLock); retLock = 0; }
    retT = t; retPlace(t);
  }
  function retBlur() {
    window.setTimeout(() => {
      if (retLock) return;
      const a = document.activeElement;
      let fv = false; try { fv = !!a && a !== document.body && a.matches(':focus-visible'); } catch (x) { fv = false; }
      if (!fv) retOff(); else if (a !== retT) { retT = a; retPlace(a); }
    }, 0);
  }
  function retChoose(e) {
    const t = e.target && e.target.closest ? e.target.closest(CHOSEN_SEL) : null; if (!t) return;
    if (retLock) window.clearTimeout(retLock);
    retT = t; retPlace(t);
    retLock = later(() => { retLock = 0; retBlur(); }, 1200);
  }
  function retKey(e) { if (retT && (e.key === 'Tab' || /^Arrow/.test(e.key)) && !retT.isConnected) retOff(); }
  PARTS.brackets = {
    on() {
      ret = layer('o55np-reticle'); ret.innerHTML = '<i></i><i></i><i></i><i></i>';
      document.addEventListener('focusin', retFocus, true);
      document.addEventListener('focusout', retBlur, true);
      document.addEventListener('click', retChoose, true);
      document.addEventListener('keydown', retKey, true);
    },
    off() {
      document.removeEventListener('focusin', retFocus, true);
      document.removeEventListener('focusout', retBlur, true);
      document.removeEventListener('click', retChoose, true);
      document.removeEventListener('keydown', retKey, true);
      if (retLock) window.clearTimeout(retLock); retLock = 0; retT = null;
      if (ret) ret.remove(); ret = null;
    }
  };

  /* scrolling or resizing moves what the cursor and the reticle point at: they step aside and come back after */
  function onScroll() {
    if (cur) curOff();
    if (ret && retT) {
      const t = retT; if (ret.hasAttribute('data-on')) ret.removeAttribute('data-on');
      if (retScroll) window.clearTimeout(retScroll);
      retScroll = window.setTimeout(() => { retScroll = 0; if (retT === t && t.isConnected) { retT = t; retPlace(t); } }, 160);
    }
  }

  /* ---------- parchment ground and drifting particles: one layer ----------------------------------------------------- */
  let ground = null;
  function groundSync() {
    const want = live.has('ground') || live.has('particles');
    if (!want) { if (ground) ground.remove(); ground = null; return; }
    if (!ground) {
      ground = document.createElement('div'); ground.id = 'o55np-ground'; ground.setAttribute('aria-hidden', 'true');
      ground.innerHTML = '<div class="o55np-grid"></div>' + '<i class="o55np-mote"></i>'.repeat(12);
    }
    /* first among the shell's siblings after the scene layer; the CSS z-order (scene 0, ground 1, shell 2) decides */
    const shell = document.querySelector('body > .app-shell');
    if (shell) { if (ground.nextElementSibling !== shell) document.body.insertBefore(ground, shell); } else if (!ground.isConnected) document.body.insertBefore(ground, document.body.firstChild);
    idle();
  }
  PARTS.ground = { on: groundSync, off: groundSync };
  PARTS.particles = { on: groundSync, off: groundSync };
  /* a hidden tab holds every loop still */
  function idle() {
    const hidden = !!document.hidden;
    [ground, pod].forEach(e => { if (e && e.hasAttribute('data-idle') !== hidden) e.toggleAttribute('data-idle', hidden); });
  }
  document.addEventListener('visibilitychange', idle);

  /* ---------- scan sweep --------------------------------------------------------------------------------------------- */
  let sweep = null, sweepTimer = 0;
  function sweepNext(ms) { if (sweepTimer) window.clearTimeout(sweepTimer); sweepTimer = later(sweepRun, ms); }
  function sweepRun() {
    sweepTimer = 0; if (!sweep) return;
    if (!document.hidden && !still() && !onboarding()) {
      const h = window.innerHeight / zoom();
      sweep.animate([{ transform: 'translateY(-72px)', opacity: 0 }, { opacity: 1, offset: 0.06 }, { opacity: 1, offset: 0.9 }, { transform: `translateY(${Math.round(h)}px)`, opacity: 0 }], { duration: 2600, easing: 'linear' });
    }
    sweepNext(12000);
  }
  PARTS.sweep = {
    on() { sweep = layer('o55np-sweep'); sweepNext(2600); },
    off() { if (sweepTimer) window.clearTimeout(sweepTimer); sweepTimer = 0; if (sweep) sweep.remove(); sweep = null; }
  };

  /* ---------- text decode ---------------------------------------------------------------------------------------------- */
  const GLYPH = { upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ', lower: 'abcdefghjkmnopqrstuvwxyz', digit: '0123456789', mark: '#%&*+=/<>' };
  const decoding = new WeakMap();
  function scramble(text, shown) {
    let out = '';
    for (let k = 0; k < text.length; k++) {
      const ch = text[k];
      if (k < shown || /\s/.test(ch)) { out += ch; continue; }
      const set = /[A-Z]/.test(ch) ? GLYPH.upper : /[a-z]/.test(ch) ? GLYPH.lower : /[0-9]/.test(ch) ? GLYPH.digit : GLYPH.mark;
      out += set[(Math.random() * set.length) | 0];
    }
    return out;
  }
  /* an element holding one text node of at most 64 characters resolves from scrambled glyphs, left to right, in eight
     steps; if anything else writes it meanwhile, it stops and leaves that write alone */
  function decode(el) {
    if (!el || !el.isConnected || still()) return false;
    if (el.childNodes.length !== 1 || el.firstChild.nodeType !== 3) return false;
    const node = el.firstChild, text = node.nodeValue;
    if (!text || !text.trim() || text.length > 64) return false;
    const prev = decoding.get(el); if (prev) prev.stop();
    const steps = 8, dt = Math.max(20, Math.min(40, (110 + text.length * 9) / steps));
    let i = 0, last = '', timer = 0, stopped = false;
    const stop = () => { if (stopped) return; stopped = true; window.clearTimeout(timer); decoding.delete(el); if (node.isConnected && node.nodeValue === last) node.nodeValue = text; };
    const tick = () => {
      if (stopped) return;
      if (!node.isConnected || node.nodeValue !== last) { stopped = true; decoding.delete(el); return; }
      if (++i >= steps) { node.nodeValue = text; last = text; stop(); return; }
      last = scramble(text, Math.floor(text.length * i / steps)); node.nodeValue = last;
      timer = later(tick, dt);
    };
    decoding.set(el, { stop });
    last = scramble(text, 0); node.nodeValue = last;
    timer = later(tick, dt);
    return true;
  }
  const PAGE_TITLES = {
    dashboard: '.page-dashboard .pm6-dash-card-title',
    projects: '.page-projects .projects-title',
    wizard: '.page-wizard .pm6-wiz-hero-title',
    orchestrator: '.page-orchestrator .orch-title',
    usage: '#pm7uRoomTitle, .pm7u-brand h1',
    settings: '#panel-settings .rail-title, #panel-settings .workspace-separator h2'
  };
  function decodePage(page) {
    const sel = PAGE_TITLES[page]; if (!sel) return;
    later(() => {
      if (!live.has('decode')) return;
      [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length).slice(0, 4).forEach(decode);
    }, live.has('wipe') ? 110 : 0);
  }
  PARTS.decode = { on() {}, off() {} };

  /* ---------- page wipe ------------------------------------------------------------------------------------------------ */
  let wipe = null, wipeAnim = null;
  function pageWipe(r) {
    if (!document.body) return;
    if (!wipe) { wipe = layer('o55np-wipe'); wipe.innerHTML = '<i></i>'; }
    const z = zoom();
    wipe.style.cssText = `left:${r.left / z}px;top:${r.top / z}px;width:${r.width / z}px;height:${r.height / z}px;display:block`;
    if (wipeAnim) wipeAnim.cancel();
    const a = wipeAnim = wipe.firstChild.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(0)', offset: 0.2 }, { transform: 'translateX(101%)' }],
      { duration: 400, easing: 'cubic-bezier(.65, 0, .3, 1)', fill: 'both' });
    a.onfinish = () => { if (wipeAnim !== a) return; wipeAnim = null; if (wipe) wipe.style.display = 'none'; a.cancel(); };
  }
  PARTS.wipe = { on() {}, off() { if (wipeAnim) wipeAnim.cancel(); wipeAnim = null; if (wipe) wipe.remove(); wipe = null; } };

  /* ---------- the shell's page change and toasts: wrapped once, straight through while NieR Mode is off -------------- */
  let pagesWrapped = false, toastsWrapped = false;
  function wrapPages() {
    const P = window.PM_PAGES; if (pagesWrapped || !P || typeof P.go !== 'function') return;
    const orig = P.go;
    P.go = function (pageId) {
      const prev = P.current, changed = !!(prev && pageId && prev !== pageId);
      let rect = null;
      if (changed && live.has('wipe') && !still() && !document.hidden && !onboarding()) {
        const area = document.querySelector('.primary-content');
        rect = area ? area.getBoundingClientRect() : null;
        if (rect && (rect.width < 40 || rect.height < 40)) rect = null;
      }
      const r = orig.apply(this, arguments);
      try {
        if (rect) pageWipe(rect);
        if (changed && live.has('decode')) decodePage(pageId);
      } catch (e) { /* decoration only */ }
      return r;
    };
    pagesWrapped = true;
  }
  const isProposal = msg => !!(msg && typeof msg === 'object' && (msg.patternSuggest
    || (Array.isArray(msg.allowed_action_ids) && msg.allowed_action_ids.some(a => !/^(acknowledge|dismiss|open)$/.test(String(a))))
    || /^(hitl|permission|filesafe|concern|wizard|usage)$/.test(String(msg.kind || ''))));
  function arrive(card, msg) {
    if (!card || card.dataset.o55Pod) return;
    const m = /(?:^|\s)n-sev-(\w+)/.exec(card.className), sev = m ? m[1] : 'info';
    const alert = sev === 'warn' || sev === 'error';
    card.dataset.o55Pod = alert ? 'alert' : isProposal(msg) ? 'proposal' : 'report';
    if (live.has('decode')) { decode(card.querySelector('.n-title')); decode(card.querySelector('.n-body')); }
    if (alert && live.has('glitch')) glitch(card);
    if (live.has('pod')) podDeliver();
    sfx(alert ? 'alert' : 'pod');
  }
  function wrapToasts() {
    const center = window.PM_TITLEBAR_NOTIFY, t = window.toast;
    if (toastsWrapped || !center || typeof center.push !== 'function' || typeof t !== 'function') return;
    const around = fn => function (msg) {
      const st = document.getElementById('rsStage'), before = st ? st.lastElementChild : null;
      const r = fn.apply(this, arguments);
      try {
        const card = st ? st.lastElementChild : null;
        if (card && card !== before && NIER() && NIER().on()) arrive(card, msg);
      } catch (e) { /* decoration only */ }
      return r;
    };
    center.push = around(center.push);
    const wrapped = around(t);
    Object.keys(t).forEach(k => { wrapped[k] = typeof t[k] === 'function' && k !== 'clear' && k !== 'expand' && k !== 'collapse' ? around(t[k]) : t[k]; });
    window.toast = wrapped;
    toastsWrapped = true;
  }
  /* Settings pages are page changes too: their title decodes when the shown page changes */
  let settingsAt = '';
  const o55npRender = renderApp;
  renderApp = function () {
    const r = o55npRender.apply(this, arguments);
    try {
      const at = state.home ? 'home' : `${state.domain}/${state.workspace}`;
      if (at !== settingsAt) {
        const first = !settingsAt; settingsAt = at;
        if (!first && live.has('decode')) { const h = root.querySelector('.workspace-separator h2'); if (h && h.getClientRects().length) decode(h); }
      }
    } catch (e) { /* decoration only */ }
    return r;
  };
  function hooks() { if (!pagesWrapped) wrapPages(); if (!toastsWrapped) wrapToasts(); }

  /* ---------- alert glitch --------------------------------------------------------------------------------------------- */
  function glitch(card) {
    if (still() || typeof card.animate !== 'function') return;
    card.animate([{ translate: '0px 0px' }, { translate: '4px 0px' }, { translate: '-3px 0px' }, { translate: '2px 0px' }, { translate: '0px 0px' }], { duration: 240, easing: 'steps(5, end)' });
    [['inset(0 0 54% 0)', [0, -8, 6, -3, 0]], ['inset(46% 0 0 0)', [0, 7, -5, 2, 0]]].forEach(([clip, xs], n) => {
      const s = card.cloneNode(true);
      s.classList.add('o55np-glitch-slice'); s.removeAttribute('data-o55-pod'); s.setAttribute('aria-hidden', 'true');
      s.style.clipPath = clip; s.style.inset = '0'; s.style.minHeight = '0';
      card.appendChild(s);
      const a = s.animate(xs.map(x => ({ transform: `translateX(${x}px)` })), { duration: 260, delay: n * 30, easing: 'steps(5, end)', fill: 'both' });
      a.onfinish = () => s.remove(); a.oncancel = () => s.remove();
    });
  }
  PARTS.glitch = { on() {}, off() {} };

  /* ---------- Pod companion ---------------------------------------------------------------------------------------------- */
  /* An original ink-line Pod: a chamfered box with a sensor slit, two side arms and a skirt; a shadow dash below. */
  const POD_SVG = '<svg viewBox="0 0 40 52" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="miter" stroke-linecap="square" aria-hidden="true">'
    + '<path class="o55np-pod-fill" d="M3.5 13.5H8.5V30.5H3.5Z M31.5 13.5H36.5V30.5H31.5Z"/><path d="M3.5 13.5H8.5V30.5H3.5Z M31.5 13.5H36.5V30.5H31.5Z M8.5 18H9.5 M30.5 18H31.5 M6 10.5V13.5 M34 10.5V13.5"/>'
    + '<path class="o55np-pod-fill" d="M12.5 6.5H27.5L30.5 9.5V33.5L26.5 37.5H13.5L9.5 33.5V9.5Z"/><path d="M12.5 6.5H27.5L30.5 9.5V33.5L26.5 37.5H13.5L9.5 33.5V9.5Z M11 12.5H29 M13 27.5H27 M13 30.5H27 M15.5 37.5L17 41.5H23L24.5 37.5"/>'
    + '<path class="o55np-pod-ink" stroke="none" d="M15 18H25V21H15Z"/><path class="o55np-pod-ink" stroke="none" d="M22 18H25V21H22Z" opacity=".35"/></svg>';
  const POD_SHADOW = '<svg viewBox="0 0 40 52" aria-hidden="true"><path class="o55np-pod-ink" d="M13 47.3H27V48.7H13Z" opacity=".32"/></svg>';
  let pod = null;
  function podDeliver() {
    if (!pod || still() || document.hidden) return;
    const body = pod.querySelector('.o55np-pod-body');
    body.animate([{ transform: 'rotate(0deg) translate(0, 0)' }, { transform: 'rotate(-16deg) translate(-2px, -4px)', offset: 0.22 },
      { transform: 'rotate(-16deg) translate(-2px, -4px)', offset: 0.7 }, { transform: 'rotate(0deg) translate(0, 0)' }], { duration: 1000, easing: 'cubic-bezier(.3, .7, .3, 1)' });
    pod.querySelectorAll('.o55np-pod-signal').forEach((s, i) => {
      s.animate([{ transform: 'translate(0, 0)', opacity: 0 }, { opacity: 1, offset: 0.15 }, { transform: `translate(${-34 - i * 16}px, ${-40 - i * 18}px)`, opacity: 0 }],
        { duration: 520, delay: 200 + i * 90, easing: 'steps(6, end)', fill: 'backwards' });
    });
  }
  PARTS.pod = {
    on() {
      pod = layer('o55np-pod');
      pod.innerHTML = `<div class="o55np-pod-shadow">${POD_SHADOW}</div><div class="o55np-pod-bob"><div class="o55np-pod-body">${POD_SVG}</div></div>` + '<i class="o55np-pod-signal"></i>'.repeat(3);
      idle();
    },
    off() { if (pod) pod.remove(); pod = null; }
  };

  PARTS.voice = { on() {}, off() {} };

  /* ---------- menu sounds: select, confirm and cancel by delegation (ticks come with the cursor) -------------------- */
  const CONFIRM_SEL = '.btn.primary, button[type="submit"], .n-btn.primary, .pm6-dash-btn:not(.pm6-dash-btn--ghost), .primary-button, .o55-btn-primary, [data-o55-preview="keep"]';
  const CANCEL_SEL = '[data-action="close-overlay"], .n-x, [aria-label="Close"], [aria-label="Dismiss"], .n-btn.danger, [data-o55-preview="back"], [data-o55-nier-note="close"]';
  const TOGGLE_SEL = '[role="switch"], [role="checkbox"], input[type="checkbox"], input[type="radio"], .toggle, .switch';
  /* a click the person made, outside O55's own surfaces, while nothing holds the menu sounds */
  const menuSoundFor = e => {
    const O = o55Sound();
    return !!(e && e.isTrusted && e.target && e.target.closest && !inO55(e.target) && !(O && O.suppressed && O.suppressed()));
  };
  function soundClick(e) {
    if (!menuSoundFor(e)) return;
    const t = e.target;
    if (t.closest(CANCEL_SEL)) sfx('cancel');
    else if (t.closest(CONFIRM_SEL)) sfx('confirm');
    else if (t.closest(CURSOR_SEL) || t.closest(TOGGLE_SEL) || t.closest('.page-tab, .pm-segtab-item')) sfx('select');
  }
  function soundKey(e) {
    if (!menuSoundFor(e)) return;
    if (e.key === 'Escape') sfx('cancel'); else if (e.key === 'Enter' && e.target.closest(CURSOR_SEL)) sfx('select');
  }
  PARTS.sounds = {
    on() { document.addEventListener('click', soundClick, true); document.addEventListener('keydown', soundKey, true); },
    off() { document.removeEventListener('click', soundClick, true); document.removeEventListener('keydown', soundKey, true); }
  };

  /* ---------- reboot moment ---------------------------------------------------------------------------------------------- */
  const REBOOT_COPY = {
    on: ['NieR Mode', 'Rebooting the interface', 'Ink and parchment loaded'],
    off: ['NieR Mode', 'Shutting down the unit', 'Your theme restored'],
    replay: ['NieR Mode', 'Rebooting the interface', 'All parts reinstalled']
  };
  let rebooting = false;
  async function reboot(repaint, info) {
    const on = !!(info && info.on), reason = info && info.reason;
    if (rebooting || !installed('reboot') || still() || document.hidden || !document.body || onboarding()) { repaint(); sync(); return; }
    rebooting = true;
    const copy = REBOOT_COPY[reason === 'replay' ? 'replay' : on ? 'on' : 'off'];
    const cover = document.createElement('div');
    cover.id = 'o55np-reboot'; cover.setAttribute('aria-hidden', 'true'); cover.dataset.tone = tone();
    cover.innerHTML = `<div class="o55np-rb-band"><div class="o55np-rb-lines"></div><div class="o55np-rb-copy"><div class="o55np-rb-title">${copy[0]}</div>`
      + `<div class="o55np-rb-line">${copy[1]}</div><div class="o55np-rb-line">${copy[2]}</div><div class="o55np-rb-meter"><i></i></div></div></div>`;
    document.body.appendChild(cover);
    const band = cover.firstElementChild, meter = cover.querySelector('.o55np-rb-meter > i'), lines = cover.querySelectorAll('.o55np-rb-line');
    try {
      sfx(on || reason === 'replay' ? 'sweepOn' : 'sweepOff', true);
      await band.animate([{ transform: 'translateY(-101%)' }, { transform: 'translateY(0)' }], { duration: 320, easing: 'cubic-bezier(.6, 0, .3, 1)', fill: 'forwards' }).finished;
      const fill = meter.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 560, easing: 'steps(12, end)', fill: 'forwards' });
      lines[0].setAttribute('data-ok', '');
      repaint();
      sync();
      await frames(2); /* the repaint's long frame is drawn here, under full cover; the meter runs on the compositor */
      await fill.finished;
      lines[1].setAttribute('data-ok', '');
      await cover.animate([{ opacity: 1, easing: 'step-end' }, { opacity: 0, offset: 0.16, easing: 'step-end' }, { opacity: 0.85, offset: 0.3, easing: 'step-end' },
        { opacity: 0, offset: 0.46, easing: 'step-end' }, { opacity: 0.4, offset: 0.6, easing: 'step-end' }, { opacity: 0, offset: 0.74 }, { opacity: 0 }],
      { duration: 480, fill: 'forwards' }).finished;
    } catch (e) { repaint(); sync(); } finally {
      cover.remove(); rebooting = false;
    }
  }

  /* ---------- wiring ------------------------------------------------------------------------------------------------------ */
  function start() {
    const n = NIER(); if (!n) return false;
    n.setTransition(reboot);
    n.onChange(() => sync());
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return true;
  }
  if (!start()) window.setTimeout(start, 0);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { hooks(); sync(); });
  window.addEventListener('load', () => { hooks(); sync(); });
  window.setTimeout(sync, 0);

  /* test hooks: which script parts are live, what sounded, and a toast or decode on demand; play() is the synth */
  window.PM_NIER_PARTS = Object.freeze({
    live: () => [...live],
    sounds: () => sfxLog.slice(),
    decode: el => decode(el),
    /* the synth for the World parts (kit.d/20-nier-world.js): plays only while Menu sounds is live and sounds are on */
    play: name => sfx(name),
    /* the blips themselves, fn(ctx, bus, t0), for renders and parity checks (read-only) */
    SFX: Object.freeze(Object.assign({}, SFX)),
    sync
  });
})();
