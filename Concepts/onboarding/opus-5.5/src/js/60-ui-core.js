/* O55.ui — the onboarding window. One bounded modal over the dimmed, inert live app (PWIZ-022): chapter rail, scene
   stage, content pane, Back / Close / sound always reachable. Screens are registered by 65-73-*.js.
   Navigation keeps a real history (Back returns to where you came from). State changes inside a screen are quiet
   morphs (no replayed entrance); only a real screen change gets choreography, with an inert, ID-free outgoing layer. */
(function () {
  'use strict';
  const O55 = window.O55, U = O55.util, T = (k, v) => O55.t(k, v);
  const SCREENS = O55.screens = { defs: {}, define(id, def) { def.id = id; this.defs[id] = def; } };
  const ROOT_ID = 'pm-o55-onboarding';
  const KEY = 'onboarding';
  /* NieR Mode's skin of the window (66-nier-window.js, O55.nierWindow) hears the window's moments here and answers
     only while NieR Mode is painted; a hook that answers true has drawn the moment its own way */
  const skin = (name, a, b) => { const k = O55.nierWindow; if (!k || !k[name]) return false; try { return k[name](a, b); } catch (e) { console.warn('O55: NieR skin', name, e); return false; } };

  const S = O55.S = {
    env: null, sess: null, root: null, open: false, busyNav: false,
    draft() { return this.sess.drafts[this.sess.active]; },
    save() { if (this.sess) O55.store.set(KEY, this.sess); },
    ctx() { const s = this.sess; return { serverConfirmed: !!(s.server.confirmed || s.connect.confirmed), restoreConfirmed: !!(s.restore && s.restore.confirmed), reviewConfirmed: !!this.draft().review_confirmed, committed: s.commit.state === 'done' }; },
    set(patch) { O55.draft.set(this.draft(), patch); this.save(); }
  };

  function freshSession() {
    return {
      v: 1, status: 'active', screen: 'welcome', history: [], started: new Date().toISOString(),
      drafts: { main: O55.draft.create('new_or_local'), connect: O55.draft.create('connect_existing') }, active: 'main',
      charms: [], ui: {}, forgeAccounts: {}, server: { confirmed: false, claimed: false, restored: false }, connect: { confirmed: false, paired: false, newProject: false },
      ssh: {}, commit: { state: 'none', attempt: 0 }, backup: { dest: null, state: 'none' }, ai: { accounts: {}, skipped: false, free: 'none' }, tour: null
    };
  }
  O55.session = { fresh: freshSession };

  /* ---------------------------------------------------------------- DOM */
  function build() {
    if (S.root) return S.root;
    const root = document.createElement('div');
    root.id = ROOT_ID; root.className = 'o55-root'; root.hidden = true; root.setAttribute('data-open', 'false');
    root.setAttribute('data-pm-hover-exempt', 'true');
    root.innerHTML = `<div class="o55-scrim" aria-hidden="true"></div>`
      + `<div class="o55-win" role="dialog" aria-modal="true" aria-labelledby="o55-h">`
      + `<header class="o55-head"><div class="o55-brand" aria-hidden="true">${logo()}<span>${U.esc(T('chrome.brand'))}</span></div>`
      + `<nav class="o55-rail" aria-label="${U.esc(T('chrome.progressLabel'))}"></nav>`
      + `<div class="o55-headctl"><span class="o55-lookslot"></span><span class="o55-soundslot"></span>`
      + `<button type="button" class="o55-iconbtn o55-close" data-o55-do="close" data-pm-hover-exempt="true" aria-label="${U.esc(T('chrome.close'))}" title="${U.esc(T('chrome.closeHint'))}">`
      + `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg><span>${U.esc(T('chrome.close'))}</span></button></div></header>`
      + `<div class="o55-body"><div class="o55-stage o55-scene-host" aria-hidden="true"></div><section class="o55-pane"></section></div>`
      + `<div class="o55-live" aria-live="polite" role="status"></div></div>`;
    document.body.appendChild(root);
    S.root = root;
    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    root.addEventListener('change', onInput);
    ['keydown', 'keyup', 'keypress'].forEach((ev) => root.addEventListener(ev, onKey));
    root.addEventListener('pointerdown', (e) => { if (e.target.closest('.o55-scrim')) nudge(); });
    /* Input never waits for a performance (hero spec section 1 rule 7): a press or a key while the stage or the skin is
       still playing a moment snaps it to its end state. Caught on the way down, never prevented, so it still acts. */
    const snap = (e) => { if (e.type === 'keydown' && /^(Shift|Control|Alt|Meta|CapsLock|Fn)$/.test(e.key)) return; skin('input', e); };
    root.addEventListener('pointerdown', snap, true);
    root.addEventListener('keydown', snap, true);
    new MutationObserver(() => { if (S.open) syncTheme(true); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier', 'data-o55-nier-parts'] });
    document.addEventListener('visibilitychange', () => { root.setAttribute('data-o55-ambient', document.hidden ? 'off' : 'on'); });
    window.addEventListener('resize', () => { if (S.open) layoutClass(); });
    return root;
  }
  function logo() {
    return `<svg class="o55-logo" viewBox="0 0 32 32" width="22" height="22" aria-hidden="true"><path d="M5 9h22M16 4v14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`
      + `<path d="M8 9v9M24 9v9M16 18v5" stroke="currentColor" stroke-width="1.2" stroke-dasharray="1.6 2.2"/><circle cx="8" cy="21" r="2.6" fill="currentColor"/><circle cx="24" cy="21" r="2.6" fill="currentColor"/><circle cx="16" cy="26" r="2.6" fill="currentColor"/></svg>`;
  }
  /* the window's size from the viewport, by its own rule in 10-window.css (min(1080px, 100vw - 48px) by min(720px,
     100vh - 48px); 100vw - 16px by 100vh - 16px under 560 px), so opening it never forces a layout of the page in
     the middle of its build (films: 150 ms); measured only when the page is zoomed (Settings' interface scale) */
  function winSize() {
    const z = document.body ? Number.parseFloat(document.body.style.zoom) : NaN;
    if (Number.isFinite(z) && z > 0 && z !== 1) { const w = S.root.querySelector('.o55-win'); if (w) { const r = w.getBoundingClientRect(); return { width: r.width, height: r.height }; } }
    const vw = window.innerWidth, vh = window.innerHeight, small = vw <= 560;
    return { width: small ? vw - 16 : Math.min(1080, vw - 48), height: small ? vh - 16 : Math.min(720, vh - 48) };
  }
  function layoutClass() {
    if (!S.root.querySelector('.o55-win')) return;
    const r = winSize(), layout = r.width < 760 ? 'narrow' : r.height < 520 ? 'short' : 'wide';
    if (S.root.getAttribute('data-o55-layout') !== layout) S.root.setAttribute('data-o55-layout', layout);
    /* the concept demo pill folds into a slim tab beside a narrow window (12-components.css) */
    const demo = document.getElementById('o55-demo');
    if (demo && demo.hasAttribute('data-o55-narrow') !== (layout === 'narrow')) demo.toggleAttribute('data-o55-narrow', layout === 'narrow');
  }

  /* ---------------------------------------------------------------- theme */
  let lastLook = null;
  /* Stage colours, once per look. The art asks on every mount (O55.art.tokens). Walking each custom property with
     getPropertyValue forced a style pass per token (films M4: about 0.9 s under Reduced Motion, inside this
     function's remount). --o55-tokpack (20-motion.css) holds every colour. One getComputedStyle reads it, and the
     snapshot is kept until the theme, NieR Mode, its parts or the root's own variables change. A mount copies it.
     The art's own reader stays the fallback when the pack is missing. */
  const TOK_FIELDS = ['bg', 'surface', 'text', 'text2', 'muted', 'border', 'blue', 'magenta', 'lime', 'orange', 'warn', 'error', 'primary', 'raised', 'onInk'];
  const tokSnaps = new Map();
  const PREVIEW_OK = /^(dark|light)$/;
  function tokenOwner(el) {
    const root = document.documentElement;
    return (el && el.closest && el.closest('[data-theme], [data-o55-nier-preview]')) || root;
  }
  function tokenKey(owner) {
    const root = document.documentElement;
    const pv = owner !== root ? owner.getAttribute('data-o55-nier-preview') : null;
    const preview = PREVIEW_OK.test(pv || '') ? pv : null;
    const nier = root.hasAttribute('data-o55-nier') ? 'nier:' + (root.getAttribute('data-o55-nier-parts') || '') + '|' : '';
    return (owner === root ? 'r|' : 'o|') + nier + (preview ? 'pv:' + preview + ':' + (owner.getAttribute('data-o55-nier-parts') || '') + '|' : '')
      + (owner.getAttribute('data-theme') || '') + '|' + (root.getAttribute('style') || '');
  }
  function tokenFlags(owner) {
    const root = document.documentElement;
    const pv = owner !== root ? owner.getAttribute('data-o55-nier-preview') : null;
    const preview = PREVIEW_OK.test(pv || '') ? pv : null;
    const partsAttr = (owner !== root && owner.getAttribute('data-o55-nier-parts')) || (root.hasAttribute('data-o55-nier') ? (root.getAttribute('data-o55-nier-parts') || '') : null);
    const nier = (root.hasAttribute('data-o55-nier') && owner === root) || !!preview;
    return {
      nier, nierPreview: preview, root: owner === root,
      nierParts: nier && partsAttr != null ? partsAttr.split(/\s+/).filter(Boolean) : null
    };
  }
  function readStageTokens(el) {
    const root = document.documentElement;
    el = el || (S.root && S.root.querySelector('.o55-stage')) || root;
    const owner = tokenOwner(el), key = tokenKey(owner), hit = tokSnaps.get(key);
    if (hit) return Object.assign({}, hit);
    if (tokSnaps.size > 40) tokSnaps.clear();
    const raw = (getComputedStyle(el).getPropertyValue('--o55-tokpack') || '').trim();
    const parts = raw.split('|').map((s) => s.trim().replace(/^["']|["']$/g, ''));
    if (parts.length !== TOK_FIELDS.length || parts.some((s) => !s)) return null;
    const t = tokenFlags(owner);
    TOK_FIELDS.forEach((name, i) => { t[name] = parts[i]; });
    tokSnaps.set(key, t);
    return Object.assign({}, t);
  }
  /* every look already on the window, in one turn, before a remount replaces the nodes */
  function warmStageTokens() {
    if (!S.root) return;
    const nodes = [S.root.querySelector('.o55-stage') || document.documentElement];
    S.root.querySelectorAll('[data-theme], [data-o55-nier-preview]').forEach((n) => nodes.push(n));
    nodes.forEach((n) => { if (n) readStageTokens(n); });
  }
  (function hookStageTokens() {
    const art = O55.art;
    if (!art || !art.tokens || art.tokens._o55Packed) return;
    const orig = art.tokens.bind(art);
    function tokens(el) { return readStageTokens(el) || orig(el); }
    tokens._o55Packed = true;
    art.tokens = tokens;
  })();
  function syncTheme(fromObserver) {
    let th = O55.theme();
    /* While the window is open its look is the one chosen here. Settings reapplies a Project's saved theme when a
       Project is selected (Creating selects the new one), which undid the preview until the look was saved at the
       end, so the look changed twice. Any change that is not the chosen look is put back in the same moment. */
    const want = S.sess && S.sess.drafts && S.sess.drafts.main;
    if (fromObserver && S.open && want && want.theme_family && (th.chosen !== want.theme_family || th.mode !== want.theme_mode)) {
      try { window.PM_THEME.setFamily(want.theme_family, { persist: false }); window.PM_THEME.setMode(want.theme_mode, { persist: false }); th = O55.theme(); } catch (_) {}
    }
    /* NieR Mode repaints Basic in ink without changing the painted family, so it is part of the look */
    const look = th.family + '-' + th.mode + (document.documentElement.hasAttribute('data-o55-nier') ? '-nier' : '');
    S.root.setAttribute('data-family', th.family); S.root.setAttribute('data-mode', th.mode);
    S.root.querySelector('.o55-stage').setAttribute('data-family', th.family);
    /* after the attributes, before any mount: one read of the colours the new look already computed */
    warmStageTokens();
    if (lastLook && lastLook !== look && fromObserver) {
      /* NieR Mode turned on or off on the look screen (O55.nierLook.busy(): its moment is playing under the reboot's
         cover): the new cast is mounted waiting in the wings (ensembleHold) and lowered in at the reveal. When only NieR
         Mode changed (the chosen look and mode are the same), the four look tiles keep their scenes: the stage, the
         rail, the look menu and the NieR row redraw, and the pane's morph leaves the tiles' hosts alone */
      const busy = !!(O55.nierLook && O55.nierLook.busy && O55.nierLook.busy());
      renderScene(true, false, { ensembleHold: busy });
      renderRail(); refresh(); renderLook();
    }
    lastLook = look;
  }
  /* Look reveal: a circular (Retro: stepped) reveal of the new world from the chosen tile. Browser View Transitions
     when available; otherwise the scene cross-fade already covers the change. Input never waits for it. */
  function applyLook(family, mode, originEl) {
    const apply = () => {
      try { window.PM_THEME.setFamily(family, { persist: false }); window.PM_THEME.setMode(mode, { persist: false }); }
      catch (_) { document.documentElement.setAttribute('data-theme', (typeof window.PM_THEME_PAINT_FAMILY === 'function' ? window.PM_THEME_PAINT_FAMILY(family) : family) + '-' + mode); }
    };
    /* the look belongs to the whole onboarding, not to one journey's draft (it was lost at the end when it was picked
       while the Connect draft was active) */
    Object.values(S.sess.drafts).forEach((d) => O55.draft.set(d, { theme_family: family, theme_mode: mode })); S.save();
    /* under NieR Mode a family does not change the window (it shows once NieR Mode is off, and the look screen says so):
       no reveal over a window that stays the same, and no Settings note, because nothing is saved here; the screen and
       the look menu redraw for the pick themselves (the painted look did not change, so nothing else redraws them) */
    const now = O55.theme();
    if (now.chosen === family && now.mode === mode) return;
    /* repainting the page for a look is expected heavy work: it never counts toward low-resource mode */
    O55.motion.quiet(2500);
    if (now.nier && now.mode === mode) { apply(); refresh(); return; }
    if (!document.startViewTransition || O55.motion.reduced() || O55.motion.lowResource) { apply(); return; }
    if (S.vt) { try { S.vt.skipTransition(); } catch (_) {} }
    const r = originEl ? originEl.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    const x = r.left + r.width / 2, y = r.top + r.height / 2, end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.documentElement.setAttribute('data-o55-vt', family);
    const vt = S.vt = document.startViewTransition(apply);
    vt.ready.then(() => {
      const retro = family === 'retro';
      document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: retro ? 520 : 760, easing: retro ? 'steps(8, end)' : O55.motion.familyCss[family] === 'steps(6, end)' ? 'ease' : 'cubic-bezier(0.2,0,0,1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(() => {});
    vt.finished.finally(() => { if (S.vt === vt) { S.vt = null; document.documentElement.removeAttribute('data-o55-vt'); } });
  }
  /* The app beneath holds still while the window is open (README Performance rule 6). A theme written under the window
     (a Project's settings loading as it is selected, the look saved into it) has the app's own listeners announce a
     resize that never happened, and every resize listener of the page then re-measures it under the window (films M4:
     most of a second at Created). Such synthetic resizes wait while the window is open; one stands for them all once
     it has closed. A real resize (the browser's own, trusted) always passes. They are held where they are sent: the
     page's resize listeners are registered before this module, and a listener on the window itself cannot run ahead
     of them. */
  let heldResize = false;
  const sendEvent = window.dispatchEvent;
  window.dispatchEvent = function dispatchEvent(ev) {
    if (ev && ev.type === 'resize' && !ev.isTrusted && S.open && document.documentElement.hasAttribute('data-o55-open')) { heldResize = true; return true; }
    return sendEvent.call(this, ev);
  };
  /* Input never waits for the look reveal. While a view transition plays, the browser hands every click to the page
     root, and on a heavy page on a slow computer the reveal outlasted a second: an early Continue was lost. A press
     during the reveal ends it at once, and the click goes to whatever was under the pointer. */
  document.addEventListener('pointerdown', (e) => {
    if (!S.vt) return;
    try { S.vt.skipTransition(); } catch (_) {}
    S.vtPress = { x: e.clientX, y: e.clientY, t: performance.now() };
  }, true);
  document.addEventListener('click', (e) => {
    const k = S.vtPress; if (!k) return;
    S.vtPress = null;
    if (performance.now() - k.t > 1500 || e.target !== document.documentElement) return;
    const el = document.elementFromPoint(k.x, k.y);
    if (el && el !== document.documentElement) { e.stopPropagation(); e.preventDefault(); el.click(); }
  }, true);

  /* ---------------------------------------------------------------- rail */
  function renderRail() {
    const nav = S.root.querySelector('.o55-rail');
    const def = SCREENS.defs[S.sess.screen] || {};
    /* S.railHold: the skin holds the rail in its old state until its own beat moves it (NieR's rail walk on the act
       card's landing, the opening's header assembly) */
    const pr = S.railHold || O55.stages.progress(S, def);
    const fam = O55.theme().family;
    const items = pr.chapters.map((ch, i) => {
      const state = i < pr.index ? 'done' : i === pr.index ? 'current' : 'next';
      return `<li class="o55-railitem" data-state="${state}" data-chapter="${ch}" data-key="rail-${ch}">`
        + `<span class="o55-railstring" aria-hidden="true"></span><span class="o55-railnode" aria-hidden="true"></span>`
        + `<span class="o55-raillabel">${U.esc(T('chapters.' + ch))}</span></li>`;
    }).join('');
    U.morph(nav, `<div class="o55-railbar o55-railbar-${fam}" aria-hidden="true"></div><ol class="o55-raillist" aria-label="${U.esc(pr.announce)}">${items}</ol>`);
    nav.setAttribute('data-count', pr.chapters.length);
  }
  /* A choice made: a helper in the scene cheers for it and the rail's marker for this chapter gives a small bump. The
     choice is still recorded per chapter. (Choices used to fly up and hang on the rail as small icons; people read
     them as meaningless symbols, so the rail shows only the chapters - Jared, 2026-09-27.) */
  function charm(fromEl, label, glyph) {
    /* a choice made: a helper in the scene cheers for it */
    if (O55.art.react) O55.motion.after(120, () => O55.art.react(S.root.querySelector('.o55-stage')));
    const def = SCREENS.defs[S.sess.screen] || {};
    const ch = (def.chapterFor ? def.chapterFor(S) : def.chapter) || 'welcome';
    const existing = S.sess.charms.findIndex((c) => c.chapter === ch && c.slot === (def.charmSlot || def.id));
    const entry = { chapter: ch, label, glyph, slot: def.charmSlot || def.id };
    if (existing >= 0) S.sess.charms[existing] = entry; else S.sess.charms.push(entry);
    S.save();
    renderRail();
    const n = S.root.querySelector(`.o55-railitem[data-chapter="${ch}"] .o55-railnode`);
    const th = O55.theme();
    if (n && !O55.motion.reduced()) O55.motion.play(n, th.family === 'retro' ? [{ opacity: 0.2 }, { opacity: 1 }] : [{ transform: 'scale(1.5)' }, { transform: 'scale(1)' }],
      { duration: 320, easing: th.family === 'retro' ? 'steps(2, end)' : th.nier ? 'steps(3, end)' : 'cubic-bezier(0.34,1.56,0.64,1)' });
  }

  /* ---------------------------------------------------------------- render */
  const val = (v) => (typeof v === 'function' ? v(S) : v);
  function footHtml(foot, def, choose) {
    foot = foot || {};
    const back = foot.back === false ? '' : `<button type="button" class="o55-btn o55-ghost o55-back" data-o55-do="back" data-pm-hover-exempt="true">${backIcon()}<span>${U.esc(T('chrome.back'))}</span></button>`;
    const secs = (foot.secondary || []).filter(Boolean), sec = secs.map((b) => btn(b, 'o55-secondary')).join('');
    const pri = foot.primary ? btn(foot.primary, 'o55-primary') : '';
    const note = foot.note ? `<span class="o55-footnote">${U.esc(foot.note)}</span>` : '';
    return `<footer class="o55-foot o55-st" style="--i:4">${back}${note}<span class="o55-footgrow">${secs.length || note ? '' : keysHtml(foot, choose)}</span>${sec}${pri}</footer>`;
  }
  /* NieR Mode's key prompts (hero spec Q7): the keys the window answers, between Back and the primary, as ink keycaps
     with mono words; only while NieR Mode is painted (shown under YoRHa headers on a wide window with a fine pointer,
     11-window-nier.css), never beside other buttons, and hidden from screen readers (the keys are the window's own) */
  function keysHtml(foot, choose) {
    if (!O55.theme().nier) return '';
    const k = (cap, word) => `<span class="o55nw-key"><b>${U.esc(cap)}</b>${U.esc(word)}</span>`;
    return `<span class="o55nw-keys" aria-hidden="true">${foot.primary ? k(T('nierWindow.keys.enterCap'), T('nierWindow.keys.enter')) : ''}`
      + `${k(T('nierWindow.keys.escCap'), T('nierWindow.keys.esc'))}${choose ? k('\u2190 \u2192', T('nierWindow.keys.choose')) : ''}</span>`;
  }
  const backIcon = () => '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
  function btn(b, cls) {
    const dis = b.disabled ? ` aria-disabled="true" data-disabled-reason="${U.esc(b.reason || '')}"` : '';
    return `<button type="button" class="o55-btn ${cls}${b.cls ? ' ' + b.cls : ''}" data-o55-do="${U.esc(b.do)}"${b.arg != null ? ` data-arg="${U.esc(b.arg)}"` : ''}${dis} data-pm-hover-exempt="true"${b.id ? ` data-key="${U.esc(b.id)}"` : ''}>`
      + (b.icon ? U.icon(b.icon) : '') + `<span>${U.esc(b.label)}</span></button>`;
  }
  O55.ui = { btn };

  function paneHtml(def) {
    const eyebrow = val(def.eyebrow), title = val(def.title), lead = val(def.lead), body = def.body ? def.body(S) : '';
    return `<div class="o55-scroll" data-key="scroll"><div class="o55-content">`
      + (eyebrow ? `<p class="o55-eyebrow o55-st" style="--i:0">${U.esc(eyebrow)}</p>` : '')
      + `<h1 class="o55-title o55-st" style="--i:1" id="o55-h" tabindex="-1">${U.esc(title || '')}</h1>`
      + (lead ? `<p class="o55-lead o55-st" style="--i:2">${U.esc(lead)}</p>` : '')
      + `<div class="o55-main o55-st" style="--i:3" data-key="main">${resumedBanner(def)}${body}</div></div></div>` + footHtml(def.foot ? def.foot(S) : {}, def, /o55-choices|o55-tiles/.test(body));
  }

  /* Reopening lands on the exact saved screen with a quiet "Picking up where you left off" and Start over; the banner
     stays until the person moves on. The welcome screen shows its own version. */
  function resumedBanner(def) {
    if (!S.resumed || S.resumedShownOn !== def.id || def.id === 'welcome') return '';
    return `<div class="o55-banner" data-key="resumed">${O55.c.small('history', 18)}<span>${U.esc(T('welcome.resumed'))}</span>${O55.c.link(T('welcome.startOver'), 'startOver')}</div>`;
  }
  function renderScene(force, hold, o) {
    const def = SCREENS.defs[S.sess.screen]; if (!def) return;
    const sc = def.scene ? def.scene(S) : { id: 'hero' };
    const host = S.root.querySelector('.o55-stage');
    const th = O55.theme();
    const band = S.root.getAttribute('data-o55-layout') === 'narrow';
    const key = `${sc.id}|${th.family}|${th.mode}|${band}`;
    if (force || host.getAttribute('data-scene-key') !== key || host.getAttribute('data-beat') !== (sc.beat || 'default') || JSON.stringify(sc.params || {}) !== host.getAttribute('data-params')) {
      O55.art.mount(host, sc.id, { family: th.family, mode: th.mode, beat: sc.beat || 'default', params: sc.params || {}, band, instance: band ? 'band' : '', hold: !!hold, ensembleHold: !!(o && o.ensembleHold) });
      host.setAttribute('data-scene-key', key); host.setAttribute('data-beat', sc.beat || 'default'); host.setAttribute('data-params', JSON.stringify(sc.params || {}));
    }
  }

  /* Quiet in-screen update: morph the current layer; never replays the entrance. */
  function refresh() {
    if (!S.open) return;
    const def = SCREENS.defs[S.sess.screen]; if (!def) return;
    const layer = S.root.querySelector('.o55-pane > .o55-layer:not(.o55-out)');
    if (!layer) return transition(null);
    const hadSheet = !!layer.querySelector('.o55-sheet[data-open="true"]');
    U.morph(layer, paneHtml(def));
    /* a sheet that just opened is brought into view (it is drawn at the end of the content, often below the fold) */
    const sheet = !hadSheet && layer.querySelector('.o55-sheet[data-open="true"]');
    if (sheet) sheet.scrollIntoView({ block: 'nearest', behavior: O55.motion.reduced() || skin('stepped') ? 'auto' : 'smooth' });
    renderScene(); renderSound();
    def.mounted && def.mounted(S, layer, false);
    skin('refresh', layer);
  }

  function transition(dir) {
    const def = SCREENS.defs[S.sess.screen]; if (!def) return;
    O55.motion.quiet(1400);
    const pane = S.root.querySelector('.o55-pane');
    let old = pane.querySelector('.o55-layer:not(.o55-out)');
    /* a screen replaced while it was still held was never seen: it goes at once (its own release still lets the
       screen before it leave) */
    if (old && old.classList.contains('o55-hold')) { old.remove(); old = null; }
    /* the new screen is built held and released a frame later (O55.motion.release), so its entrance starts on a light
       frame instead of inside the long one that styles and lays out the new DOM; Reduced Motion has no entrance */
    const hold = !O55.motion.reduced();
    const leave = () => {
      if (!old) return;
      old.classList.add('o55-out-' + (dir || 'fwd'));
      const kill = () => old.remove();
      O55.motion.after(900, kill);
      old.addEventListener('animationend', (e) => { if (e.target === old) kill(); });
    };
    /* what the skin follows on the old screen (target brackets, the menu cursor) lets go now, before it leaves */
    if (old) skin('leaving', old, dir);
    if (old) {
      old.classList.add('o55-out');
      old.setAttribute('inert', ''); old.setAttribute('aria-hidden', 'true');
      old.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    }
    const layer = document.createElement('div');
    layer.className = `o55-layer o55-entering o55-in-${dir || 'fwd'}${hold ? ' o55-hold' : ''}`;
    layer.setAttribute('data-screen', def.id);
    layer.innerHTML = paneHtml(def);
    pane.appendChild(layer);
    layer.querySelectorAll('.o55-card, .o55-row, .o55-tile').forEach((n, i) => n.style.setProperty('--ci', i));
    /* the entrance classes leave once every entrance animation has finished (never cut short, even in slow motion) */
    O55.motion.settled(layer, { fallback: 2600 }).then(() => layer.classList.remove('o55-entering', 'o55-in-fwd', 'o55-in-back', 'o55-in-open'));
    renderScene(false, hold); renderRail(); renderSound();
    /* the end of an act: the skin may keep the old scene a moment longer (its troupe bows) before the new one shows */
    const stageWait = old && hold ? Math.max(0, +skin('stageDelay', dir) || 0) : 0;
    const stageTok = S.stageTok = (S.stageTok || 0) + 1;
    const releaseStage = () => { if (S.stageTok === stageTok) O55.art.release(S.root.querySelector('.o55-stage')); };
    const h = layer.querySelector('#o55-h');
    /* the scene heading takes programmatic focus when the screen settles, unless the person is already inside it */
    const focusHeading = () => O55.motion.after(60, () => { const a = document.activeElement; if (h && S.open && !(a && a !== layer && layer.contains(a))) h.focus({ preventScroll: true }); });
    U.announce(O55.stages.progress(S, def).announce + '. ' + (val(def.title) || ''), S.root.querySelector('.o55-win'));
    def.mounted && def.mounted(S, layer, true);
    if (!hold) { leave(); focusHeading(); skin('screen', layer, dir); return; }
    O55.motion.release(() => {
      S.root.classList.remove('o55-hold');
      if (dir === 'open') checkSolid(); /* the opening is the window's busiest motion: measured while it plays */
      /* The opening may be the skin's to play first (NieR's cold open: the window opens empty, a boot log runs where the
         title will be and its line becomes the title's rule). The screen waits for the skin's promise, or for a key or
         a press, which shows it at once (a key also lands on its primary); the stage shows when the promise says
         (gate.stage, a promise: the cold open's set decodes in as the header assembles), or at once. */
      const gate = dir === 'open' && layer.isConnected ? skin('openGate', layer) : null;
      if (gate && gate.stage && typeof gate.stage.then === 'function') gate.stage.then(releaseStage, releaseStage);
      else if (stageWait) O55.motion.after(stageWait, releaseStage); else releaseStage();
      let shown = false;
      const show = (byKey) => {
        if (shown) return; shown = true;
        if (off) off();
        if (gate) releaseStage(); /* a gate shown early (a key, a press, the cap) shows the stage with it */
        if (!layer.isConnected || layer.classList.contains('o55-out')) return;
        layer.classList.remove('o55-hold');
        leave();
        if (byKey) { const pri = layer.querySelector('.o55-primary'); O55.motion.after(0, () => { if (S.open && pri && pri.isConnected) pri.focus({ preventScroll: true }); }); }
        else focusHeading();
        skin('screen', layer, dir);
      };
      let off = null;
      if (gate && typeof gate.then === 'function') {
        const onKey = (e) => { if (!/^(Shift|Control|Alt|Meta|CapsLock|Fn)$/.test(e.key)) { skin('openSnap', e); show(true); } };
        const onPress = (e) => { skin('openSnap', e); show(false); };
        document.addEventListener('keydown', onKey, true); document.addEventListener('pointerdown', onPress, true);
        const cap = O55.motion.after(4200, () => show(false)); /* never longer than the opening itself */
        off = () => { document.removeEventListener('keydown', onKey, true); document.removeEventListener('pointerdown', onPress, true); cap.cancel(); };
        gate.then(() => show(false), () => show(false));
      } else show(false);
    });
  }

  /* the look menu beside the sound button (O55.lookMenu): open until a click lands outside it or Escape */
  function renderLook() {
    const slot = S.root && S.root.querySelector('.o55-lookslot'); if (!slot || !O55.lookMenu) return;
    const html = O55.lookMenu.button('o55-iconbtn', 'data-o55-do', S.lookOpen) + (S.lookOpen ? O55.lookMenu.panel('data-o55-do') : '');
    if (slot.innerHTML === html) return;
    /* redrawing keeps focus where it was (the option just chosen), so keys still reach the window */
    const a = document.activeElement, had = a && slot.contains(a) ? (a.getAttribute('data-arg') || 'btn') : null;
    slot.innerHTML = html;
    if (had) { const el = had === 'btn' ? slot.querySelector('.o55-lookbtn') : slot.querySelector(`[data-arg="${had}"]`); if (el) el.focus({ preventScroll: true }); }
  }
  function renderSound() {
    renderLook();
    const slot = S.root.querySelector('.o55-soundslot');
    const html = O55.sound.buttonHtml('o55-iconbtn');
    if (slot.innerHTML !== html) slot.innerHTML = html;
  }

  /* ---------------------------------------------------------------- navigation */
  function go(id, opts) {
    opts = opts || {};
    if (!SCREENS.defs[id]) { console.warn('O55: unknown screen', id); return; }
    const from = SCREENS.defs[S.sess.screen];
    if (from && from.leave) from.leave(S);
    if (!opts.replace && S.sess.screen !== id && !opts.noHistory) S.sess.history.push(S.sess.screen);
    S.resumedShownOn = null;
    S.sess.screen = id; S.save();
    const def = SCREENS.defs[id];
    if (def.enter) def.enter(S, opts);
    /* the music follows the journey: the chapter's chord, and how far along the person is (the first forward sound
       after a chapter change becomes that chapter's own sting, O55.sound's chapterSting) */
    /* (a skin that plays this chapter's sting itself, on a beat of its own, claims it: NieR's act card lands on it and
       its curtain call resolves on it, so the move itself stays a plain one) */
    const claim = skin('claimSting', from, def, opts.dir || 'fwd') === true;
    O55.sound.setContext(Object.assign({ chapter: (def.chapterFor ? def.chapterFor(S) : def.chapter) || 'welcome', step: S.sess.history.length }, claim ? { sting: false } : {}));
    if (!opts.silent) O55.sound.play(opts.dir === 'back' ? 'back' : 'next');
    transition(opts.dir || 'fwd');
  }
  function back() {
    const def = SCREENS.defs[S.sess.screen];
    if (def && def.onBack && def.onBack(S) === false) return;
    let prev = S.sess.history.pop();
    while (prev && SCREENS.defs[prev] && SCREENS.defs[prev].skipOnBack && SCREENS.defs[prev].skipOnBack(S)) prev = S.sess.history.pop();
    if (!prev) return;
    go(prev, { dir: 'back', noHistory: true });
  }

  /* ---------------------------------------------------------------- events */
  function onClick(e) {
    const t = e.target.closest('[data-o55-do]'), acts = !!(t && S.root.contains(t));
    /* a click outside the look menu closes it; when nothing else answers the click, the menu's own close sound does */
    if (S.lookOpen && !e.target.closest('.o55-lookslot')) { S.lookOpen = false; renderLook(); if (!acts) O55.sound.play('unsheet'); }
    if (!acts) return;
    const action = t.getAttribute('data-o55-do'), arg = t.getAttribute('data-arg');
    if (t.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
      const reason = t.getAttribute('data-disabled-reason');
      if (reason) U.announce(reason, S.root.querySelector('.o55-win'));
      O55.sound.play('warn'); /* a refusal with its reason is a soft warning, not a failure */
      if (!skin('refused', t)) O55.motion.play(t, [{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 260, easing: 'ease-out' });
      showReason(t, reason);
      return;
    }
    e.preventDefault();
    if (action === 'close') return close('close');
    if (action === 'back') return back();
    if (action === 'sound') { O55.sound.toggle('onboarding'); renderSound(); return; }
    /* the look menu is a small sheet: it opens and closes with the sheet sounds, as in the tour's bar */
    if (action === 'lookMenu') { S.lookOpen = !S.lookOpen; O55.sound.play(S.lookOpen ? 'sheet' : 'unsheet'); renderLook(); return; }
    if (action === 'lookFamily') { applyLook(arg, O55.theme().mode, t); return; }
    if (action === 'lookMode') { applyLook(O55.theme().chosen, arg, t); return; }
    if (action === 'lookNier' || action === 'lookNierAdjust') { if (O55.lookMenu && O55.lookMenu.nier) O55.lookMenu.nier(action, t); return; }
    if (action === 'go') return go(arg);
    const def = SCREENS.defs[S.sess.screen];
    const fn = def && def.do && def.do[action];
    if (!fn) { const g = O55.actions[action]; if (g) return g(S, arg, t, e); console.warn('O55: no action', action); return; }
    /* the handler's own sound (a sheet opening, a finding, a screen change) is the click's one sound; otherwise the
       generic one answers by role. Controls whose handler always plays (a look tile) opt out with data-o55-sound. */
    const log = O55.sound.log, last = log[log.length - 1], checked = t.getAttribute('aria-checked'), open = t.getAttribute('aria-expanded');
    fn(S, arg, t, e);
    if (t.classList.contains('o55-primary') || t.getAttribute('data-o55-sound') === 'self' || log[log.length - 1] !== last) return;
    const role = t.getAttribute('role');
    O55.sound.play(t.classList.contains('o55-card') || t.classList.contains('o55-tile') ? 'select'
      : role === 'switch' || role === 'checkbox' ? (checked === 'true' ? 'toggleOff' : 'toggleOn')
      : open != null ? (open === 'true' ? 'unsheet' : 'reveal') : 'tap');
  }
  function showReason(t, reason) {
    if (!reason) return;
    const layer = t.closest('.o55-layer'); if (!layer) return;
    let tip = layer.querySelector('.o55-reason');
    if (!tip) { tip = document.createElement('div'); tip.className = 'o55-reason'; tip.setAttribute('role', 'note'); layer.querySelector('.o55-foot').appendChild(tip); }
    tip.textContent = reason; tip.classList.remove('o55-reason-show'); void tip.offsetWidth; tip.classList.add('o55-reason-show');
  }
  /* typing ticks at most one per 120 ms, the chat's rate (ACD-475; O55.sound's RATE.type matches it) */
  const TYPE_MS = 120;
  let lastType = -1e9;
  function onInput(e) {
    const t = e.target.closest('[data-o55-bind]'); if (!t) return;
    const def = SCREENS.defs[S.sess.screen];
    const key = t.getAttribute('data-o55-bind');
    /* typing ticks quietly in the family's material (never for a protected field); a screen whose stage answers each
       letter with a sound of its own says so (def.typing: the Name screen's sign sings the name) */
    if (e.type === 'input' && t.type !== 'password' && !t.hasAttribute('data-o55-protected') && !(def && def.typing && def.typing(S, key)) && performance.now() - lastType >= TYPE_MS) { lastType = performance.now(); O55.sound.play('type'); }
    const fn = def && def.bind && def.bind[key];
    const v = t.type === 'checkbox' ? t.checked : t.value;
    if (fn) fn(S, v, t, e);
  }
  function onKey(e) {
    e.stopPropagation(); /* shell trap: typed keys never reach the app's global shortcuts */
    if (e.type !== 'keydown') return;
    if (e.key === 'Escape') {
      if (S.lookOpen) { S.lookOpen = false; renderLook(); O55.sound.play('unsheet'); e.preventDefault(); const b = S.root.querySelector('.o55-lookbtn'); if (b) b.focus(); return; }
      const pop = S.root.querySelector('.o55-sheet[data-open="true"], .o55-popover[data-open="true"]');
      if (pop) { const c = pop.querySelector('[data-o55-do="sheet-close"]'); if (c) c.click(); e.preventDefault(); return; }
      e.preventDefault(); close('escape'); return;
    }
    if (e.key === 'Tab') return trapTab(e);
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey) {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'textarea' || tag === 'button' || tag === 'a' || e.target.closest('[role="radio"],[role="option"]')) return;
      /* Adjust NieR look lies over the interior (O55.nierLook): Enter there never moves the screen hidden beneath it,
         and a primary inside an inert subtree is never pressed (a programmatic click would still reach it) */
      if (e.target.closest('.o55-nierpanel') || (O55.nierLook && O55.nierLook.panelOpen && O55.nierLook.panelOpen())) return;
      const pri = S.root.querySelector('.o55-pane > .o55-layer:not(.o55-out) .o55-primary');
      if (pri && !pri.closest('[inert]')) { e.preventDefault(); pri.click(); }
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      const group = e.target.closest('.o55-choices, .o55-tiles'); if (!group) return;
      const items = Array.from(group.querySelectorAll('.o55-card:not([aria-disabled="true"]), .o55-tile'));
      const i = items.indexOf(e.target.closest('.o55-card, .o55-tile')); if (i < 0) return;
      const n = items[(i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length];
      if (n) { e.preventDefault(); n.focus(); O55.sound.play('move', { step: items.indexOf(n) }); }
    }
  }
  function trapTab(e) {
    const win = S.root.querySelector('.o55-win');
    const f = Array.from(win.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter((n) => !n.closest('.o55-out') && !n.hasAttribute('disabled') && n.getClientRects().length);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  /* "That didn't work": a failed submit that leaves the screen as it was still answers the click. The field shakes (a
     short flash under Reduced Motion, from the opacity the keyframes start at). */
  function shake(bind) {
    const el = S.root.querySelector(`.o55-pane > .o55-layer:not(.o55-out) [data-key="field-${bind}"]`);
    if (!el) return;
    const k = [{ transform: 'translateX(0)', opacity: 0.55 }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)', opacity: 1 }];
    if (!skin('shake', el)) O55.motion.play(el, k, { duration: 300, easing: S.root.getAttribute('data-family') === 'retro' ? 'steps(4, end)' : 'ease-out', fill: 'none' });
    const i = el.querySelector('input, textarea'); if (i) { i.focus({ preventScroll: true }); i.select && i.select(); }
  }
  function nudge() { const w = S.root.querySelector('.o55-win'); O55.motion.play(w, [{ transform: 'scale(1)' }, { transform: 'scale(1.008)' }, { transform: 'scale(1)' }], { duration: 240 }); }

  /* ---------------------------------------------------------------- open / close */
  let returnFocus = null, inerted = [];
  function setInert(on) {
    if (on) {
      inerted = Array.from(document.body.children).filter((n) => n !== S.root && !n.hasAttribute('inert') && n.id !== 'pm-hover-tag-root' && n.id !== 'o55-demo' && n.tagName !== 'SCRIPT');
      inerted.forEach((n) => n.setAttribute('inert', ''));
    } else { inerted.forEach((n) => n.removeAttribute('inert')); inerted = []; }
  }
  /* Run Onboarding Again (the Home menu, Settings, the demo pill) starts over for real: a new run, a clean fixture
     world, no operation of the old run left running or reporting, and the Guided Tour back at its first step. */
  function startOver() {
    S.epoch = (S.epoch || 0) + 1;
    O55.owners.resetOps(); O55.flow.clearInflight();
    S.env = O55.fixtures.make(O55.store.get('scenario', 'fresh'));
    O55.motion.setLowResource(!!S.env.lowResource, 'scenario');
    if (O55.tour && O55.tour.reset) O55.tour.reset({ silent: true });
  }
  /* Solid backdrop. A computer that cannot draw the dimmed app beneath at full rate (no GPU: the app's live backdrop
     blurs, paper grounds and translucent layers composited in software, one pass per frame of motion in the window)
     gets a solid backdrop instead, so the window's own motion stays at 60 fps; a fast computer keeps the dimmed live
     app. Known at once when the browser renders in software (O55.motion.softwareRendered), otherwise measured over the
     first opening (the app then goes once the scrim covers it); kept for the page, and the app comes back as the
     window starts to close. */
  let SOLID = null;
  const setSolid = (on) => { const h = document.documentElement; if (h.hasAttribute('data-o55-solid') !== !!on) h.toggleAttribute('data-o55-solid', !!on); };
  function checkSolid() {
    if (SOLID !== null || document.hidden || O55.motion.reduced()) return;
    O55.motion.sampleFrames(900).then((r) => {
      if (SOLID !== null || document.hidden) return;
      /* fewer than a dozen frames in 0.9 s is itself the answer (a Glass skin without a GPU draws three a second) */
      SOLID = r.n < 12 || r.median > 21;
      if (SOLID && S.open && !S.root.classList.contains('o55-opening')) setSolid(true);
    });
  }
  O55.solid = { get: () => SOLID, set(v) { SOLID = v == null ? null : !!v; setSolid(!!SOLID && S.open); } };
  /* (asking the browser whether it renders in software builds a WebGL context, 180 ms on the VM: done once while the
     page is idle after it loads, never inside the window's opening) */
  const warm = () => { try { O55.motion.softwareRendered(); } catch (_) {} };
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(warm, { timeout: 6000 }); else window.setTimeout(warm, 3000);

  function open(opts) {
    opts = opts || {};
    if (opts.fresh && O55.tour && O55.tour.hasUnresolved && O55.tour.hasUnresolved()) { O55.tour.start({}); return false; }
    O55.motion.quiet(2200); /* building the window is expected to be heavy; it never counts as a slow computer */
    const wasShown = !!(S.open && S.root && !S.root.hidden); /* Start over reopens a window already on screen */
    build();
    /* a Project that is being created is never abandoned half-made: starting over waits for it, on its own screen */
    let waitNote = false;
    if (opts.fresh) {
      const cur = S.sess || O55.store.get(KEY, null);
      if (cur && cur.commit && cur.commit.state === 'running') { opts = Object.assign({}, opts, { fresh: false, screen: 'creating' }); waitNote = true; }
      else startOver();
    }
    S.env = S.env || O55.fixtures.make(O55.store.get('scenario', 'fresh'));
    const saved = opts.fresh ? null : O55.store.get(KEY, null);
    const resumable = saved && saved.v === 1 && saved.status !== 'done' && saved.status !== 'skipped';
    /* reopening the same run in the same page keeps the live session: operations still running (a Project being
       created, a key being added) report into the objects they started with */
    const live = resumable && S.sess && S.sess.started === saved.started;
    S.sess = live ? S.sess : resumable ? Object.assign(freshSession(), saved) : freshSession();
    if (opts.fresh || (saved && (saved.status === 'done' || saved.status === 'skipped'))) S.sess = freshSession();
    S.resumed = !!(saved && !opts.fresh && saved.status === 'closed');
    /* facts the person established earlier (a trusted device, an installed key) are re-applied to the fixture world */
    (O55.onOpen || []).forEach((fn) => { try { fn(S); } catch (_) {} });
    S.sess.status = 'active';
    if (opts.screen && SCREENS.defs[opts.screen]) S.sess.screen = opts.screen;
    if (!SCREENS.defs[S.sess.screen]) S.sess.screen = 'welcome';
    S.resumedShownOn = S.resumed ? S.sess.screen : null;
    returnFocus = opts.returnFocus || document.activeElement;
    S.open = true; S.save();
    const r = S.root; r.hidden = false; r.setAttribute('data-open', 'true');
    document.documentElement.setAttribute('data-o55-open', 'true');
    if (window.PM_DEMO && window.PM_DEMO.clock && window.PM_DEMO.clock.pause) { try { window.PM_DEMO.clock.pause(); S.pausedClock = true; } catch (_) {} }
    if (S.env.lowResource) O55.motion.setLowResource(true, 'scenario');
    setInert(true); reapplyLook(); syncTheme(false); layoutClass();
    r.setAttribute('data-o55-ambient', 'on');
    r.classList.remove('o55-closing'); r.classList.add('o55-opening');
    /* the whole window waits, unseen, through the frame that styles it and restyles the now inert app beneath; the
       first screen's release (transition below) lets the opening play from its first frame */
    if (!wasShown && !O55.motion.reduced()) r.classList.add('o55-hold');
    /* known in advance on a computer that renders in software: the backdrop is solid from the first frame */
    if (SOLID === null && O55.motion.softwareRendered()) SOLID = true;
    if (SOLID && !wasShown) setSolid(true);
    O55.motion.settled(r.querySelector('.o55-win'), { subtree: false, fallback: 2800 }).then(() => { if (S.open) { r.classList.remove('o55-opening'); if (SOLID) setSolid(true); } });
    const pane = r.querySelector('.o55-pane'); pane.innerHTML = '';
    const stage = r.querySelector('.o55-stage'); stage.innerHTML = ''; stage.removeAttribute('data-scene-key');
    /* a resumed run starts on its own chapter's chord */
    const cur = SCREENS.defs[S.sess.screen];
    /* (each onboarding run is a run of the score: its chapters sting once each, O55.sound) */
    O55.sound.setContext({ chapter: (cur.chapterFor ? cur.chapterFor(S) : cur.chapter) || 'welcome', step: S.sess.history.length, run: S.sess.started + '|' + (S.epoch || 0) });
    S.railHold = null;
    /* the skin may open with a silence of its own: the window's first sound then waits that many ms ('skin': the skin
       plays it) */
    const quietOpen = skin('open', { resumed: S.resumed, shown: wasShown, screen: S.sess.screen });
    transition('open');
    /* (or the skin plays the window's first sound itself, with its own picture: 'skin') */
    if (quietOpen === 'skin') { /* the skin's */ }
    else if (typeof quietOpen === 'number' && quietOpen > 0) O55.motion.after(quietOpen, () => { if (S.open) O55.sound.play('open'); });
    else O55.sound.play('open');
    const chip = document.getElementById('o55-resume'); if (chip) chip.remove();
    if (waitNote) O55.motion.after(700, () => O55.ui.toast(T('chrome.startOverWait')));
    window.dispatchEvent(new CustomEvent('o55:onboarding', { detail: { type: 'opened', screen: S.sess.screen, resumed: S.resumed } }));
    return true;
  }
  /* A reopened run shows its own look again (a reload painted the saved theme while the drafts kept the pick): the
     family and mode from the drafts, and NieR Mode from the session (O55.nierLook), still previews */
  function reapplyLook() {
    const d = S.sess.drafts && S.sess.drafts.main, th = O55.theme();
    if (d && d.theme_family && (th.chosen !== d.theme_family || th.mode !== d.theme_mode)) {
      try { window.PM_THEME.setFamily(d.theme_family, { persist: false }); window.PM_THEME.setMode(d.theme_mode, { persist: false }); } catch (_) {}
    }
    if (O55.nierLook && O55.nierLook.reapply) O55.nierLook.reapply(S);
  }
  /* close(reason, {handoff}) — with handoff the window gives way at once, because the Guided Tour's first callout
     grows out of the same rectangle in the same frame (see O55.tour.start({from})) */
  function close(reason, o) {
    if (!S.open) return;
    const handoff = !!(o && o.handoff);
    const def = SCREENS.defs[S.sess.screen];
    if (def && def.leave) def.leave(S);
    if (O55.nierLook && O55.nierLook.closed) O55.nierLook.closed(reason); /* an unsaved NieR preview lingers like the look's */
    S.sess.status = reason === 'skip' ? 'skipped' : reason === 'done' ? 'done' : 'closed';
    S.save();
    S.open = false;
    const r = S.root;
    setSolid(false); /* the app is back under the scrim before the window leaves */
    r.classList.remove('o55-opening'); r.classList.add('o55-closing'); r.classList.toggle('o55-handoff', handoff); r.setAttribute('data-o55-ambient', 'off');
    if (!handoff) O55.sound.play(reason === 'done' ? 'finish' : 'close');
    /* the skin may keep the root (and its scrim) a while: NieR folds the window to a line that carries on into the
       Guided Tour, and the scrim stays until the tour's own has taken over, so the app never comes up lit between */
    const hold = skin('close', reason, handoff);
    S.railHold = null;
    /* a look waiting to be saved into the new Project is written once the window has gone (finish() times its own) */
    if (reason !== 'done' && O55.shell && O55.shell.flushLook) O55.shell.flushLook(400);
    const finish = () => {
      if (S.open) return; /* opened again before this close had finished (Run Onboarding Again): it stays */
      r.hidden = true; r.setAttribute('data-open', 'false'); r.classList.remove('o55-closing', 'o55-handoff');
      document.documentElement.removeAttribute('data-o55-open');
      setInert(false);
      if (S.pausedClock && window.PM_DEMO && window.PM_DEMO.clock && window.PM_DEMO.clock.resume) { try { window.PM_DEMO.clock.resume(); } catch (_) {} }
      if (reason !== 'done' && returnFocus && document.contains(returnFocus)) { try { returnFocus.focus(); } catch (_) {} }
      O55.boot && O55.boot.chip && O55.boot.chip();
      if (heldResize) { heldResize = false; window.dispatchEvent(new Event('resize')); }
    };
    if (typeof hold === 'number' && hold > 0) O55.motion.after(hold, finish);
    else if (O55.motion.reduced()) finish(); else O55.motion.settled(r.querySelector('.o55-win'), { subtree: false, fallback: 700 }).then(finish);
    window.dispatchEvent(new CustomEvent('o55:onboarding', { detail: { type: reason === 'skip' ? 'skipped' : reason === 'done' ? 'finished' : 'closed', screen: S.sess.screen } }));
  }

  /* shared actions any screen can use */
  O55.actions = {
    skip() { close('skip'); },
    'sheet-close'(S2, arg, el) { const sh = el.closest('.o55-sheet'); if (sh) { sh.setAttribute('data-open', 'false'); S.sess.ui.sheet = null; S.save(); refresh(); O55.sound.play('unsheet'); } },
    details(S2, arg, el) { const k = 'details:' + (arg || S.sess.screen); S.sess.ui[k] = !S.sess.ui[k]; S.save(); refresh(); O55.sound.play(S.sess.ui[k] ? 'reveal' : 'unsheet'); },
    startOver() { open({ fresh: true }); }
  };

  Object.assign(O55.ui, { S, build, open, close, go, back, refresh, transition, charm, applyLook, renderRail, renderScene, footHtml, shake, skin });
})();
