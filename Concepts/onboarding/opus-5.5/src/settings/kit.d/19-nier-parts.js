/* O55 · NieR Mode parts, the script half: Look, Motion, Sound & voice and Pointer (17 of the 29; the World parts, the
   Plug-in Chips manager and Pod 042 are kit.d/20-* and managers/57-nier.js). The styles are styles.d/14-nier-parts.css.
   Contract: kit.d/18-nier.js. A part is live while PM_NIER.has(key); each part below installs when its key arrives and
   removes everything it added when the key goes, so every part is silent while NieR Mode is off.
     square, headers, diamonds, slice, pointer   CSS only (the parts attribute)
     ground, particles   one fixed layer (#o55np-ground) between the scene and the shell: the still grid, twelve motes
     cursor              one shared cursor (#o55np-cursor), placed by transform on pointerover and keyboard focus
     brackets            one reticle of four corners (#o55np-reticle), placed by transform on keyboard focus and on a
                         chosen tab or item
     reboot              PM_NIER.setTransition: the reboot cover (in the onboarding window it grows from the pressed control,
                         types a check list through the repaint and tears out as six slats; elsewhere an ink band
                         steps down and tears out the same way; never a flicker)
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
     One audio path: with the onboarding layer present (src/js/15-sound.js) every blip plays through O55.sound.synth
     (the reboot's hum as O55.sound.play('nierOn' | 'nierOff'), see O55_EVENT), on its context and master and under its
     mute (no second AudioContext); this module's own context is only the fallback for a page without it. The table
     takes its bus as a parameter (5.6 Pro's nier-parts.js has the same numbers), so any context can play or render
     it. Inside the onboarding window O55 owns sound (its NieR kit plays these same blips), so the document-wide menu
     sounds stay quiet there, on the tour's own controls and on synthetic clicks (a tour's Show Me presses the real
     control; O55.sound.suppress(ms) holds them too). Outside onboarding they also follow
     general.interaction.sound-effects, the Settings value (Settings_System 4.4). */
  let ac = null, acBus = null, lastTick = 0;
  /* the synth's own level into a destination, one per destination node. Keyed weakly by that node: O55.sound.synth
     hands every blip a fresh node, so an entry lives only as long as its blip (no cache that grows with each sound) */
  const buses = new WeakMap();
  function busFor(ctx, out) {
    let b = buses.get(out);
    if (!b) { b = ctx.createGain(); b.gain.value = 0.6; b.connect(out); buses.set(out, b); }
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
  /* the reboot's hum is O55's own NieR moment when O55 is present (its NieR kit plays the hum, the ticks and the
     choir): one designed sound, and a caller that also plays nierOn or nierOff for the same toggle merges into it
     instead of a second hum (O55.sound keeps one of two equal events in the same moment) */
  const O55_EVENT = { sweepOn: 'nierOn', sweepOff: 'nierOff' };
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
    if (O && O55_EVENT[name] && typeof O.play === 'function') ok = O.play(O55_EVENT[name], { kit: 'nier' });
    else if (O) ok = O.synth((c, out, t) => SFX[name](c, busFor(c, out), t), { force: !!force, name: 'nier:' + name, priority: SFX_PRIO[name] });
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
  /* the onboarding window and the tour draw their own cursor (O55.nierFx and their skins): the page's stays out of them,
     or one row of a look menu got a second square (it matched role=menuitem, its neighbours did not) */
  const targetOf = e => { const t = e && e.target && e.target.closest ? e.target.closest(CURSOR_SEL) : null; return t && !inO55(t) ? t : null; };
  let cur = null, curT = null, curHide = 0;
  /* while the reboot cover is up nothing points through it (the cursor and the reticle sit above the window) */
  let coverUp = false;
  function curPlace(t) {
    if (!cur) return;
    if (coverUp) { curOff(); return; }
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
    if (!ret || !t || !t.isConnected || coverUp) { retOff(); return; }
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
  /* a heading the onboarding window focuses itself (tabindex -1, so the next Tab starts there) is not a target: the
     window brackets its own chosen card, and a reticle round a full-width heading framed the column, not the words */
  const retSkip = t => t.getAttribute('tabindex') === '-1' && !!t.closest('#pm-o55-onboarding');
  function retFocus(e) {
    const t = e.target; if (!(t instanceof Element)) return;
    let fv = false; try { fv = t.matches(':focus-visible'); } catch (x) { fv = false; }
    if (!fv) return;
    if (retSkip(t)) { if (!retLock) retOff(); return; }
    if (retLock) { window.clearTimeout(retLock); retLock = 0; }
    retT = t; retPlace(t);
  }
  function retBlur() {
    window.setTimeout(() => {
      if (retLock) return;
      const a = document.activeElement;
      let fv = false; try { fv = !!a && a !== document.body && a.matches(':focus-visible') && !retSkip(a); } catch (x) { fv = false; }
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

  /* ---------- reboot moment ----------------------------------------------------------------------------------------------
     PM_NIER.setTransition(reboot). Two stagings share one plate, one check list and one exit (hero spec H1; rules 2, 3
     and 6):
     - inside the onboarding window (info.within), "the little world opens". Ticking: four ink brackets lock onto the
       control that was pressed (info.from, else the NieR thumbnail) in 3 steps; at T90 a plate in NieR's ground (its
       hairline frame, the 32 px map grid, the brackets riding its corners) is born on that rect and grows to the window
       in 6 held steps of 60 ms. At T450 the kicker band, the line slots and the meter appear in one step and the check
       list types on: a block caret steps across each line (8 steps, 120 ms), then its stamp blinks in (T600, 750, 900,
       1050, where nierOn's ticks land); the meter fills from T480 to T1080. All of it is created before repaint(), so
       the compositor runs it through the repaint's long frames; a fifth line, "Synchronising" with a blinking caret,
       shows only if the repaint still runs at T1100. R, the reveal, is the first frame after two frame intervals under
       34 ms, two frames or more after repaint() returned, never before the list is done and at most 4 s after: the
       kicker reads "All clear" in one step, holds 160 ms, and the plate tears out as six slats sliding off to
       alternate sides from the middle outward (steps(4), 30 ms apart). info.onReveal('reveal') fires as they start (the
       window takes input again from then) and 'gone' once they are off.
       Unticking, "back into the box": the stage powers down first (300 ms, the window's beat), six slats close in from
       both sides (T300-T540), two lines type (stamps at T700 and T850), then the repaint; at R "All clear" for 120 ms,
       'reveal', and the plate, as one, shrinks in 6 held steps into the NieR thumbnail with the brackets riding its
       corners; the brackets let go 60 ms after, then 'gone'.
     - anywhere else (the Settings page, the title-bar menu): the ink band over the whole page, stepped down in 6 held
       steps, with the same check list; it leaves by the same slat tear-out. The old flicker-out was a large-area strobe
       over the WCAG three-flash limit (films KEY-H1-dark-strobe); no surface here reverses its brightness twice.
     The cover takes NieR's tokens from the preview scope (data-o55-nier-preview, styles.d/13-nier.css), because it
     exists before the palette is painted. Every time is on the animation timeline (document.timeline, scaled by
     Animation speed like every animation here), so slow-motion filming slows all of it together. Reduced motion, a
     hidden tab, a missing Reboot moment part, or the onboarding without a window (low resource) repaint at once and
     still report 'reveal' and 'gone'. The class names are shared with 5.6 Pro's nier-parts.js. */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const RB = (key, fallback, vars) => (typeof o55NierCopy === 'function' ? o55NierCopy('nierSettings.reboot.' + key, fallback, vars)
    : String(fallback).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? String(vars[k]) : m)));
  /* the look kept for later (ticking: the family painted now) or coming back (unticking: the family NieR paints over) */
  function familyName() {
    let f = String(html.getAttribute('data-theme') || 'basic').split('-')[0];
    if (html.hasAttribute('data-o55-nier')) { try { const c = window.PM_THEME && window.PM_THEME.getFamily && window.PM_THEME.getFamily(); if (c) f = String(c); } catch (e) { /* the painted one */ } }
    const named = typeof o55NierCopy === 'function' ? o55NierCopy('look.families.' + f + '.name', '') : '';
    return named || f.charAt(0).toUpperCase() + f.slice(1);
  }
  /* the check list: what the caller passed (already worded and gated by parts), else the plate's own words */
  function rbLines(info, kind) {
    const ok = RB('ok', 'OK');
    if (Array.isArray(info.lines) && info.lines.length) return info.lines.slice(0, 5).map(l => ({ text: String(l && typeof l === 'object' ? l.text : l), stamp: String(l && typeof l === 'object' && l.stamp != null ? l.stamp : ok) }));
    const fam = familyName();
    const last = installed('pod') || installed('voice') ? { text: RB('pod', 'Pod 042'), stamp: RB('online', 'Online') }
      : installed('sounds') ? { text: RB('menuSounds', 'Menu sounds'), stamp: ok } : { text: RB('ready', 'Ready'), stamp: ok };
    const keep = { text: RB('keepLook', 'Keeping {family} for later', { family: fam }), stamp: ok }, ink = { text: RB('inkParchment', 'Ink and parchment'), stamp: ok };
    const restore = { text: RB('restoreLook', 'Restoring {family}', { family: fam }), stamp: ok }, boot = { text: RB('pageOn', 'Rebooting the interface'), stamp: ok };
    if (kind === 'fold') return [{ text: RB('saveNier', 'Saving NieR Mode for later'), stamp: ok }, restore];
    if (kind === 'pageOff') return [{ text: RB('pageOff', 'Shutting down the unit'), stamp: ok }, restore];
    if (kind === 'replay') return [boot, ink, last, { text: RB('pageReplayDone', 'All parts reinstalled'), stamp: ok }];
    if (kind === 'pageOn') return [boot, keep, ink, last];
    return [keep, ink, { text: RB('puppets', 'NieR puppets'), stamp: ok }, last];
  }
  /* when the stamps land: ticking at T600..T1050 every 150 ms (nierOn's stamp ticks), unticking at T700 and T850 */
  function rbPlan(n, folding) {
    const P = folding ? { first: 700, last: 850, meter: [560, 870], sync: 920 } : { first: 600, last: 1050, meter: [480, 1080], sync: 1100 };
    const gap = n > 1 ? Math.min(150, (P.last - P.first) / (n - 1)) : 0;
    P.stamps = Array.from({ length: n }, (_, i) => Math.round(P.first + i * gap));
    P.done = Math.max(P.meter[1], P.stamps[n - 1] + 90);
    return P;
  }
  function rbLog(lines) {
    const log = document.createElement('div');
    log.className = 'o55np-log';
    log.innerHTML = `<div class="o55np-kick"><i></i><i></i><i></i><span class="o55np-kick-t">${esc(RB('kicker', 'NieR Mode'))}</span></div>`
      + `<div class="o55np-lns">${lines.map(l => `<div class="o55np-ln"><span class="o55np-ln-t">${esc(l.text)}</span><span class="o55np-ln-dots"></span><b class="o55np-stamp">${esc(l.stamp)}</b><i class="o55np-ln-mask"></i></div>`).join('')}</div>`
      + '<div class="o55np-meter"><i></i></div>'
      + `<div class="o55np-ln o55np-sync"><span class="o55np-ln-t">${esc(RB('syncing', 'Synchronising'))}</span><i class="o55np-caret"></i><span class="o55np-ln-dots"></span><b class="o55np-stamp">${esc(RB('ok', 'OK'))}</b></div>`;
    return log;
  }

  /* the animation clock: design ms since t0 on the document timeline (Element.animate scales durations and delays by
     Animation speed, so the clock is divided by it) */
  const tl = () => (document.timeline && typeof document.timeline.currentTime === 'number' ? document.timeline.currentTime : performance.now());
  const since = t0 => (tl() - t0) / speed();
  /* resolves once the timeline has run ms (an empty animation on el, slowed like the others); a timer is the floor for
     an element taken out of the page meanwhile */
  function rbWait(el, ms) {
    return new Promise(res => {
      let a = null; try { a = el.animate(null, { duration: Math.max(0, ms) }); } catch (e) { a = null; }
      if (!a) { later(res, ms); return; }
      a.onfinish = () => res(); a.oncancel = () => res();
      window.setTimeout(res, Math.max(0, ms) * speed() * 30 + 2000);
    });
  }
  const rbAt = (el, t0, T) => rbWait(el, T - since(t0));
  const settled = a => (a && a.finished ? a.finished.then(() => true, () => false) : Promise.resolve(false));
  /* R: the first frame after two frame intervals under 34 ms, at least two frames after now, at most maxMs later */
  function rbIdle(maxMs) {
    return new Promise(res => {
      const t0 = performance.now(); let last = 0, prev = Infinity, n = 0, done = false;
      const end = () => { if (!done) { done = true; res(); } };
      const step = now => {
        if (done) return;
        const dt = last ? now - last : Infinity; last = now; n++;
        if ((n >= 3 && dt < 34 && prev < 34) || now - t0 >= maxMs) { end(); return; }
        prev = dt; window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
      window.setTimeout(end, maxMs + 250); /* a tab hidden meanwhile draws no frames */
    });
  }
  const twoFrames = () => Promise.race([frames(2), new Promise(res => window.setTimeout(res, 120))]);
  /* before the repaint's long frames, every list animation must have its start time settled with the compositor: one
     still pending when the main thread stalls was restarted by the next commit (a typed line un-typed and typed again) */
  const settledStart = anims => Promise.race([Promise.all(anims.map(a => a.ready.catch(() => null))), new Promise(res => window.setTimeout(res, 250))]).then(twoFrames);
  /* the repaint's long tasks are expected here: the window's low-resource watch should not count them (films M1) */
  const quiet = ms => { try { const M = window.O55 && window.O55.motion; if (M && typeof M.quiet === 'function') M.quiet(ms); } catch (e) { /* none */ } };

  /* a list that starts late (a busy frame before it) keeps its rhythm: the whole schedule moves later, never two lines
     typing at once */
  function rbShift(plan, now) {
    const late = Math.max(0, now + 30 - Math.min(plan.stamps[0] - 120, plan.meter[0]));
    if (!late) return plan;
    return Object.assign({}, plan, { stamps: plan.stamps.map(x => x + late), meter: plan.meter.map(x => x + late), sync: plan.sync + late, done: plan.done + late, late });
  }
  /* the moment's T0 is when its first animation really started (the click's own work can hold the first frame), so
     every later time lines up with what is on screen */
  async function rbStart(a, fallback) {
    try { await a.ready; } catch (e) { return fallback; }
    return typeof a.startTime === 'number' ? a.startTime : fallback;
  }

  /* the check list's motion, all created now with delays (design ms from t0): the caret block steps across each line,
     the stamp blinks in, the meter fills; "Synchronising" waits at plan.sync and blinks its caret until R */
  function rbType(log, plan, now) {
    const anims = [], A = (el, kf, o) => { const a = el.animate(kf, o); anims.push(a); return a; };
    const d = t => Math.max(0, t - now);
    log.querySelectorAll('.o55np-lns > .o55np-ln').forEach((ln, i) => {
      const st = plan.stamps[i];
      A(ln.querySelector('.o55np-ln-mask'), [{ transform: 'translateX(0)' }, { transform: 'translateX(calc(100% + 10px))' }], { duration: 120, delay: d(st - 120), easing: 'steps(8, end)', fill: 'forwards' });
      A(ln.querySelector('.o55np-stamp'), [{ opacity: 1, easing: 'step-end' }, { opacity: 0, offset: 0.5, easing: 'step-end' }, { opacity: 1 }], { duration: 80, delay: d(st), fill: 'forwards' });
    });
    A(log.querySelector('.o55np-meter > i'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: plan.meter[1] - plan.meter[0], delay: d(plan.meter[0]), easing: 'steps(12, end)', fill: 'forwards' });
    const sync = log.querySelector('.o55np-sync');
    const show = A(sync, [{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay: d(plan.sync), fill: 'forwards' });
    const blink = A(sync.querySelector('.o55np-caret'), [{ opacity: 1, easing: 'step-end' }, { opacity: 0, offset: 0.5, easing: 'step-end' }, { opacity: 1 }], { duration: 900, delay: d(plan.sync), iterations: Infinity });
    return { anims, show, blink };
  }
  /* at R: the list in its end state (by attribute, so the slats' copies show it too), "All clear" in one step */
  function rbClear(log, typing, plan, t0) {
    const synced = since(t0) >= plan.sync;
    typing.anims.forEach(a => a.cancel());
    if (synced) { const s = log.querySelector('.o55np-sync'); s.setAttribute('data-shown', ''); s.setAttribute('data-ok', ''); }
    log.setAttribute('data-done', '');
    log.querySelector('.o55np-kick-t').textContent = RB('allClear', 'All clear');
  }

  /* ---- the in-window plate's geometry: rects in the cover's own CSS px, the hairline edges and brackets as transforms */
  const BR = 12;
  function rbBox(cover) { const r = cover.getBoundingClientRect(), w = cover.offsetWidth || r.width || 1, h = cover.offsetHeight || r.height || 1; return { r, w, h, k: r.width / w || 1 }; }
  function rbFrom(info, within, box) {
    let given = null; try { given = typeof info.from === 'function' ? info.from() : info.from; } catch (e) { given = null; }
    const thumb = within.querySelector('.o55-pane > .o55-layer:not(.o55-out) [data-nier-thumb]') || within.querySelector('[data-nier-thumb]');
    for (const c of [given, thumb, document.activeElement]) {
      let r = null;
      if (c && typeof c.getBoundingClientRect === 'function') { if (!c.isConnected || !within.contains(c)) continue; r = c.getBoundingClientRect(); }
      else if (c && typeof c.left === 'number' && typeof c.width === 'number') r = c;
      if (!r || r.width < 8 || r.height < 8) continue;
      const x = (r.left - box.r.left) / box.k, y = (r.top - box.r.top) / box.k, w = r.width / box.k, h = r.height / box.k;
      if (x + w <= 0 || y + h <= 0 || x >= box.w || y >= box.h) continue;
      const cx = Math.max(0, x), cy = Math.max(0, y);
      return { x: cx, y: cy, w: Math.min(box.w, x + w) - cx, h: Math.min(box.h, y + h) - cy };
    }
    return { x: box.w / 2 - 80, y: box.h / 2 - 50, w: 160, h: 100 };
  }
  const lerpRect = (a, b, f) => ({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, w: a.w + (b.w - a.w) * f, h: a.h + (b.h - a.h) * f });
  const px = v => `${Math.round(v)}px`;
  /* the plate's clip, on the compositor: the plate is an overflow box moved and scaled onto the rect, its ground inside
     scaled and moved back by the inverse, so the map stays put while the box around it steps (in Slint, a clipping
     Rectangle whose x, y, width and height step); [plate transform, ground transform] */
  function clipOf(r, box) {
    const x = Math.round(r.x), y = Math.round(r.y), sx = Math.max(1, Math.round(r.w)) / box.w, sy = Math.max(1, Math.round(r.h)) / box.h;
    return [`translate(${x}px, ${y}px) scale(${sx.toFixed(5)}, ${sy.toFixed(5)})`, `scale(${(1 / sx).toFixed(5)}, ${(1 / sy).toFixed(5)}) translate(${-x}px, ${-y}px)`];
  }
  /* the eight decorations for a rect: edges top, bottom, left, right, then brackets tl, tr, bl, br, o px outside it */
  function rbPose(r, o, box) {
    const sx = Math.max(r.w, 1) / box.w, sy = Math.max(r.h, 1) / box.h, x = Math.round(r.x), y = Math.round(r.y), x2 = Math.round(r.x + r.w), y2 = Math.round(r.y + r.h), k = Math.round(o);
    return [`translate(${x}px, ${y}px) scaleX(${sx.toFixed(4)})`, `translate(${x}px, ${y2 - 1}px) scaleX(${sx.toFixed(4)})`,
      `translate(${x}px, ${y}px) scaleY(${sy.toFixed(4)})`, `translate(${x2 - 1}px, ${y}px) scaleY(${sy.toFixed(4)})`,
      `translate(${x - k}px, ${y - k}px) scale(1, 1)`, `translate(${x2 + k - BR}px, ${y - k}px) scale(-1, 1)`,
      `translate(${x - k}px, ${y2 + k - BR}px) scale(1, -1)`, `translate(${x2 + k - BR}px, ${y2 + k - BR}px) scale(-1, -1)`];
  }
  function rbSet(lines, inWindow) {
    const set = document.createElement('div');
    set.className = 'o55np-set';
    const ground = document.createElement('div');
    ground.className = inWindow ? 'o55np-plate' : 'o55np-band';
    if (!inWindow) ground.innerHTML = '<div class="o55np-rb-lines"></div>';
    else ground.innerHTML = '<div class="o55np-plate-in"></div>';
    const log = rbLog(lines);
    (inWindow ? ground.firstElementChild : ground).appendChild(log);
    set.appendChild(ground);
    if (inWindow) {
      const deco = document.createElement('div');
      deco.className = 'o55np-deco';
      deco.innerHTML = '<i class="o55np-edge" data-e="t"></i><i class="o55np-edge" data-e="b"></i><i class="o55np-edge" data-e="l"></i><i class="o55np-edge" data-e="r"></i>'
        + '<i class="o55np-br"></i><i class="o55np-br"></i><i class="o55np-br"></i><i class="o55np-br"></i>';
      set.appendChild(deco);
    }
    return { set, ground, inner: ground.firstElementChild, log, deco: set.querySelectorAll('.o55np-deco > i') };
  }
  /* keyframes for a stepped walk: frames [{ t, ... }] in ms over total ms, every segment held (step-end) */
  const walk = (frames, total) => frames.map(f => Object.assign({ offset: Math.min(1, f.t / total), easing: 'step-end' }, f.v));
  /* six slats, each a copy of the set moved up by its own place; 'out' slides them off to alternate sides from the middle
     outward, 'in' slides them in from the outside inward; steps(4), 30 ms apart */
  function rbSlats(cover, src, mode, delay) {
    const wrap = document.createElement('div');
    wrap.className = 'o55np-slats';
    const order = mode === 'out' ? [2, 1, 0, 0, 1, 2] : [0, 1, 2, 2, 1, 0];
    for (let i = 0; i < 6; i++) {
      const s = document.createElement('div');
      s.className = 'o55np-slat'; s.style.setProperty('--i', String(i));
      s.appendChild(src.cloneNode(true));
      wrap.appendChild(s);
    }
    cover.appendChild(wrap);
    const anims = [...wrap.children].map((s, i) => {
      const away = `translateX(${i % 2 ? 101 : -101}%)`;
      return s.animate(mode === 'out' ? [{ transform: 'translateX(0)' }, { transform: away }] : [{ transform: away }, { transform: 'translateX(0)' }],
        { duration: 180, delay: delay + order[i] * 30, easing: 'steps(4, end)', fill: mode === 'out' ? 'forwards' : 'both' });
    });
    return { wrap, first: anims[0], done: Promise.all(anims.map(settled)) };
  }

  /* the window's effects and the pointers come back with the reveal */
  function rbRelease(ctx) {
    if (ctx.host) { ctx.host.removeAttribute('data-o55np-cover'); ctx.host = null; }
    coverUp = false;
  }

  /* ---- inside the onboarding window */
  async function rebootWithin(ctx, info, within, folding) {
    const kind = folding ? 'fold' : info.reason === 'replay' ? 'replay' : 'on';
    const lines = rbLines(info, kind), t = tone();
    let plan = rbPlan(lines.length, folding);
    const cover = ctx.cover = document.createElement('div');
    cover.id = 'o55np-reboot'; cover.className = 'o55np-within'; cover.setAttribute('aria-hidden', 'true');
    cover.dataset.tone = t; cover.dataset.dir = folding ? 'off' : 'on'; cover.setAttribute('data-o55-nier-preview', t);
    const { set, ground, inner, log, deco } = rbSet(lines, true);
    cover.appendChild(set);
    within.appendChild(cover);
    /* the window's own effects (brackets on the chosen card, the cursor, Pod's strip) sit above the window in its root:
       they hold off while the cover is up (an attribute that restyles only those layers), and so do the page's pointers */
    const host = ctx.host = within.closest('#pm-o55-onboarding');
    if (host) host.setAttribute('data-o55np-cover', '');
    coverUp = true; curOff(); retOff();
    let t0 = tl();
    const box = rbBox(cover), full = { x: 0, y: 0, w: box.w, h: box.h };
    if (!folding) {
      /* T0-T90 the brackets lock on in 3 steps; T90 the plate is born on the rect; T90-T390 it grows in 6 held steps */
      const from = rbFrom(info, within, box);
      const F = [0, 0.3, 0.55, 0.75, 0.9, 1], rects = F.map(f => lerpRect(from, full, f)), off = F.map(f => 3 - 17 * f);
      const at = k => 90 + 60 * k, TOTAL = 450;
      const clips = rects.map(r => clipOf(r, box)), idle = clipOf(full, box);
      const grow = ground.animate(walk([{ t: 0, v: { transform: clips[0][0], opacity: 0 } }, ...clips.map((c, k) => ({ t: at(k), v: { transform: c[0], opacity: 1 } })),
        { t: TOTAL, v: { transform: idle[0], opacity: 1 } }], TOTAL), { duration: TOTAL, fill: 'forwards' });
      const growIn = inner.animate(walk([{ t: 0, v: { transform: clips[0][1] } }, ...clips.map((c, k) => ({ t: at(k), v: { transform: c[1] } })),
        { t: TOTAL, v: { transform: idle[1] } }], TOTAL), { duration: TOTAL, fill: 'forwards' });
      const started = rbStart(grow, t0);
      const poses = rects.map((r, k) => rbPose(r, off[k], box)), lock = [12, 8, 5].map(o => rbPose(rects[0], o, box));
      deco.forEach((el, j) => {
        const isBr = j >= 4;
        const fr = isBr ? lock.map((p, s) => ({ t: s * 30, v: { transform: p[j], opacity: 1 } })) : [{ t: 0, v: { transform: poses[0][j], opacity: 0 } }];
        poses.forEach((p, k) => fr.push({ t: at(k), v: { transform: p[j], opacity: 1 } }));
        fr.push({ t: TOTAL, v: { transform: poses[5][j], opacity: 1 } });
        el.animate(walk(fr, TOTAL), { duration: TOTAL, fill: 'forwards' });
      });
      t0 = await started;
      await settled(grow);
      /* T450: full cover; the decorations keep their last place inline (so the slats' copies carry them) */
      set.querySelectorAll('.o55np-deco > i').forEach(el => el.getAnimations().forEach(a => { try { a.commitStyles(); } catch (e) { /* not rendered */ } a.cancel(); }));
      ground.style.opacity = '1'; grow.cancel(); growIn.cancel();
    } else {
      /* the stage powers down (the window's beat), then T300-T540 six slats close in from both sides */
      const poses = rbPose(full, -14, box);
      deco.forEach((el, j) => { el.style.transform = poses[j]; el.style.opacity = '1'; });
      ground.style.opacity = '1';
      cover.setAttribute('data-hold', '');
      const shut = rbSlats(cover, set, 'in', 300);
      t0 = await rbStart(shut.first, t0);
      await shut.done;
      cover.removeAttribute('data-hold');
      shut.wrap.remove();
    }
    if (!cover.isConnected) return;
    /* the list appears in one step; every animation of it exists before the repaint */
    log.setAttribute('data-on', '');
    plan = rbShift(plan, since(t0));
    const typing = rbType(log, plan, since(t0));
    await settledStart(typing.anims);
    quiet(5000);
    ctx.paint();
    await rbIdle(4000);
    await rbAt(cover, t0, plan.done);
    rbClear(log, typing, plan, t0);
    if (!cover.isConnected) return;
    if (!folding) {
      /* R: hold 160 ms, then the slats tear out and the window shows band by band */
      const slats = rbSlats(cover, set, 'out', 160);
      set.remove();
      await rbWait(cover, 160);
      cover.style.pointerEvents = 'none';
      rbRelease(ctx);
      ctx.cue('reveal');
      await slats.done;
      return;
    }
    /* R: hold 120 ms; then the plate, as one, folds back into the NieR thumbnail (measured now: the window re-rendered) */
    const to = rbFrom(info, within, rbBox(cover));
    await rbWait(cover, 120);
    log.style.display = 'none';
    cover.style.pointerEvents = 'none';
    rbRelease(ctx);
    ctx.cue('reveal');
    const G = [0.1, 0.25, 0.45, 0.7, 0.9, 1], rects = G.map(f => lerpRect(full, to, f)), off = G.map(f => -14 + 17 * f), TOTAL = 450;
    const clips = rects.map(r => clipOf(r, box)), idle = clipOf(full, box), last = clipOf(to, box);
    const fold = ground.animate(walk([{ t: 0, v: { transform: idle[0], opacity: 1 } }, ...clips.map((c, k) => ({ t: 60 * (k + 1), v: { transform: c[0], opacity: 1 } })),
      { t: 390, v: { transform: last[0], opacity: 0 } }, { t: TOTAL, v: { transform: last[0], opacity: 0 } }], TOTAL), { duration: TOTAL, fill: 'forwards' });
    inner.animate(walk([{ t: 0, v: { transform: idle[1] } }, ...clips.map((c, k) => ({ t: 60 * (k + 1), v: { transform: c[1] } })), { t: TOTAL, v: { transform: last[1] } }], TOTAL),
      { duration: TOTAL, fill: 'forwards' });
    const poses = [rbPose(full, -14, box), ...rects.map((r, k) => rbPose(r, off[k], box))], let1 = rbPose(to, 7, box);
    deco.forEach((el, j) => {
      const fr = poses.map((p, k) => ({ t: 60 * k, v: { transform: p[j], opacity: 1 } }));
      if (j < 4) fr.push({ t: 390, v: { transform: poses[6][j], opacity: 0 } });
      else fr.push({ t: 420, v: { transform: let1[j], opacity: 1 } }, { t: 450, v: { transform: let1[j], opacity: 0 } });
      fr.push({ t: TOTAL, v: { transform: j < 4 ? poses[6][j] : let1[j], opacity: 0 } });
      el.animate(walk(fr, TOTAL), { duration: TOTAL, fill: 'forwards' });
    });
    await settled(fold);
  }

  /* ---- the whole page: the ink band, stepped down, the list, the tear-out */
  async function rebootPage(ctx, info, folding) {
    const kind = folding ? 'pageOff' : info.reason === 'replay' ? 'replay' : 'pageOn';
    const lines = rbLines(info, kind), t = tone();
    let plan = rbPlan(lines.length, folding);
    const cover = ctx.cover = document.createElement('div');
    cover.id = 'o55np-reboot'; cover.setAttribute('aria-hidden', 'true'); cover.setAttribute('data-page', '');
    cover.dataset.tone = t; cover.dataset.dir = folding ? 'off' : 'on'; cover.setAttribute('data-o55-nier-preview', t);
    const { set, ground, log } = rbSet(lines, false);
    cover.appendChild(set);
    document.body.appendChild(cover);
    let t0 = tl();
    /* 6 held steps down: on T90-T390 (nierOn's six ticks), off T60-T360 */
    const first = folding ? 60 : 90, TOTAL = first + 360;
    const drop = ground.animate(walk([{ t: 0, v: { transform: 'translateY(-101%)' } }, ...[83.3, 66.7, 50, 33.3, 16.7, 0].map((y, k) => ({ t: first + 60 * k, v: { transform: `translateY(${-y}%)` } })),
      { t: TOTAL, v: { transform: 'translateY(0%)' } }], TOTAL), { duration: TOTAL, fill: 'forwards' });
    t0 = await rbStart(drop, t0);
    await settled(drop);
    ground.style.transform = 'none'; drop.cancel();
    if (!cover.isConnected) return;
    log.setAttribute('data-on', '');
    plan = rbShift(plan, since(t0));
    const typing = rbType(log, plan, since(t0));
    await settledStart(typing.anims);
    ctx.paint();
    await rbIdle(4000);
    await rbAt(cover, t0, plan.done);
    rbClear(log, typing, plan, t0);
    if (!cover.isConnected) return;
    const slats = rbSlats(cover, set, 'out', 160);
    set.remove();
    await rbWait(cover, 160);
    ctx.cue('reveal');
    await slats.done;
  }

  let rebooting = false;
  async function reboot(repaint, info) {
    info = info || {};
    const on = !!info.on, reason = info.reason;
    /* a change made inside the onboarding window plays inside it (info.within, the window): the app beneath holds still */
    const within = info.within && info.within.isConnected ? info.within : null;
    const seen = new Set(), cue = phase => { if (seen.has(phase)) return; seen.add(phase); try { if (typeof info.onReveal === 'function') info.onReveal(phase); } catch (e) { /* the caller's beat never stops the moment */ } };
    let painted = false;
    const paint = () => { if (painted) return; painted = true; repaint(); sync(); };
    if (rebooting || !installed('reboot') || still() || document.hidden || !document.body || (onboarding() && !within)) { paint(); cue('reveal'); cue('gone'); return; }
    rebooting = true;
    const ctx = { cover: null, paint, cue };
    try {
      /* info.sound false: the caller plays its own (the onboarding's NieR checkbox plays nierOn / nierOff) */
      if (info.sound !== false) sfx(on || reason === 'replay' ? 'sweepOn' : 'sweepOff', true);
      const folding = !on && reason !== 'replay';
      if (within) await rebootWithin(ctx, info, within, folding); else await rebootPage(ctx, info, folding);
    } catch (e) { /* the moment is decoration; the repaint is not */ } finally {
      paint();
      if (ctx.cover) ctx.cover.remove();
      rbRelease(ctx);
      rebooting = false;
      cue('reveal'); cue('gone');
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
