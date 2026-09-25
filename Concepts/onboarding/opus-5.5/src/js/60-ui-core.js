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
      + `<div class="o55-headctl"><span class="o55-soundslot"></span>`
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
    new MutationObserver(() => { if (S.open) syncTheme(true); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    document.addEventListener('visibilitychange', () => { root.setAttribute('data-o55-ambient', document.hidden ? 'off' : 'on'); });
    window.addEventListener('resize', () => { if (S.open) layoutClass(); });
    return root;
  }
  function logo() {
    return `<svg class="o55-logo" viewBox="0 0 32 32" width="22" height="22" aria-hidden="true"><path d="M5 9h22M16 4v14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`
      + `<path d="M8 9v9M24 9v9M16 18v5" stroke="currentColor" stroke-width="1.2" stroke-dasharray="1.6 2.2"/><circle cx="8" cy="21" r="2.6" fill="currentColor"/><circle cx="24" cy="21" r="2.6" fill="currentColor"/><circle cx="16" cy="26" r="2.6" fill="currentColor"/></svg>`;
  }
  function layoutClass() {
    const w = S.root.querySelector('.o55-win'); if (!w) return;
    const r = w.getBoundingClientRect();
    S.root.setAttribute('data-o55-layout', r.width < 760 ? 'narrow' : r.height < 520 ? 'short' : 'wide');
  }

  /* ---------------------------------------------------------------- theme */
  let lastLook = null;
  function syncTheme(fromObserver) {
    const th = O55.theme();
    const look = th.family + '-' + th.mode;
    S.root.setAttribute('data-family', th.family); S.root.setAttribute('data-mode', th.mode);
    S.root.querySelector('.o55-stage').setAttribute('data-family', th.family);
    if (lastLook && lastLook !== look && fromObserver) { renderScene(true); renderRail(); refresh(); }
    lastLook = look;
  }
  /* Look reveal: a circular (Retro: stepped) reveal of the new world from the chosen tile. Browser View Transitions
     when available; otherwise the scene cross-fade already covers the change. Input never waits for it. */
  function applyLook(family, mode, originEl) {
    const apply = () => {
      try { window.PM_THEME.setFamily(family, { persist: false }); window.PM_THEME.setMode(mode, { persist: false }); }
      catch (_) { document.documentElement.setAttribute('data-theme', family + '-' + mode); }
    };
    const d = S.draft(); O55.draft.set(d, { theme_family: family, theme_mode: mode }); S.save();
    const now = O55.theme(); if (now.family === family && now.mode === mode) return;
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

  /* ---------------------------------------------------------------- rail */
  function renderRail() {
    const nav = S.root.querySelector('.o55-rail');
    const def = SCREENS.defs[S.sess.screen] || {};
    const pr = O55.stages.progress(S, def);
    const fam = O55.theme().family;
    const items = pr.chapters.map((ch, i) => {
      const state = i < pr.index ? 'done' : i === pr.index ? 'current' : 'next';
      const charms = S.sess.charms.filter((c) => c.chapter === ch).slice(-3);
      return `<li class="o55-railitem" data-state="${state}" data-chapter="${ch}" data-key="rail-${ch}">`
        + `<span class="o55-railstring" aria-hidden="true"></span><span class="o55-railnode" aria-hidden="true"></span>`
        + `<span class="o55-raillabel">${U.esc(T('chapters.' + ch))}</span>`
        + `<span class="o55-charms" aria-hidden="true">${charms.map((c) => `<span class="o55-charm" title="${U.esc(c.label)}">${charmGlyph(c.glyph)}</span>`).join('')}</span></li>`;
    }).join('');
    U.morph(nav, `<div class="o55-railbar o55-railbar-${fam}" aria-hidden="true"></div><ol class="o55-raillist" aria-label="${U.esc(pr.announce)}">${items}</ol>`);
    nav.setAttribute('data-count', pr.chapters.length);
  }
  const charmGlyph = (g) => `<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">${O55.art.glyph(g || 'spark', 'currentColor', 2.4)}</svg>`;

  /* Choices become charms: the token flies from the card to the rail's current chapter node and hangs there. */
  function charm(fromEl, label, glyph) {
    const def = SCREENS.defs[S.sess.screen] || {};
    const ch = (def.chapterFor ? def.chapterFor(S) : def.chapter) || 'welcome';
    const existing = S.sess.charms.findIndex((c) => c.chapter === ch && c.slot === (def.charmSlot || def.id));
    const entry = { chapter: ch, label, glyph, slot: def.charmSlot || def.id };
    if (existing >= 0) S.sess.charms[existing] = entry; else S.sess.charms.push(entry);
    S.save();
    const node = S.root.querySelector(`.o55-railitem[data-chapter="${ch}"] .o55-railnode`);
    if (!fromEl || !node || O55.motion.reduced()) { renderRail(); return; }
    const a = fromEl.getBoundingClientRect(), b = node.getBoundingClientRect();
    const fly = document.createElement('div');
    fly.className = 'o55-flycharm'; fly.innerHTML = charmGlyph(glyph) + `<span>${U.esc(label)}</span>`;
    S.root.appendChild(fly);
    const sx = a.left + Math.min(40, a.width / 2), sy = a.top + Math.min(28, a.height / 2), ex = b.left + b.width / 2, ey = b.top + b.height / 2;
    const mx = (sx + ex) / 2, my = Math.min(sy, ey) - 80;
    const frames = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12, x = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * mx + t * t * ex, y = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * my + t * t * ey; frames.push({ transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${1 - 0.55 * t})`, opacity: i === 12 ? 0.2 : 1 }); }
    const retro = O55.theme().family === 'retro';
    const anim = fly.animate(frames, { duration: O55.motion.T.charm, easing: retro ? 'steps(8, end)' : 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'forwards' });
    anim.onfinish = () => { fly.remove(); renderRail(); const n = S.root.querySelector(`.o55-railitem[data-chapter="${ch}"] .o55-railnode`); if (n) O55.motion.play(n, [{ transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(0.34,1.56,0.64,1)' }); };
  }

  /* ---------------------------------------------------------------- render */
  const val = (v) => (typeof v === 'function' ? v(S) : v);
  function footHtml(foot, def) {
    foot = foot || {};
    const back = foot.back === false ? '' : `<button type="button" class="o55-btn o55-ghost o55-back" data-o55-do="back" data-pm-hover-exempt="true">${backIcon()}<span>${U.esc(T('chrome.back'))}</span></button>`;
    const sec = (foot.secondary || []).filter(Boolean).map((b) => btn(b, 'o55-secondary')).join('');
    const pri = foot.primary ? btn(foot.primary, 'o55-primary') : '';
    const note = foot.note ? `<span class="o55-footnote">${U.esc(foot.note)}</span>` : '';
    return `<footer class="o55-foot o55-st" style="--i:4">${back}${note}<span class="o55-footgrow"></span>${sec}${pri}</footer>`;
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
      + `<div class="o55-main o55-st" style="--i:3" data-key="main">${resumedBanner(def)}${body}</div></div></div>` + footHtml(def.foot ? def.foot(S) : {}, def);
  }

  /* Reopening lands on the exact saved screen with a quiet "Picking up where you left off" and Start over; the banner
     stays until the person moves on. The welcome screen shows its own version. */
  function resumedBanner(def) {
    if (!S.resumed || S.resumedShownOn !== def.id || def.id === 'welcome') return '';
    return `<div class="o55-banner" data-key="resumed">${O55.c.small('history', 18)}<span>${U.esc(T('welcome.resumed'))}</span>${O55.c.link(T('welcome.startOver'), 'startOver')}</div>`;
  }
  function renderScene(force) {
    const def = SCREENS.defs[S.sess.screen]; if (!def) return;
    const sc = def.scene ? def.scene(S) : { id: 'hero' };
    const host = S.root.querySelector('.o55-stage');
    const th = O55.theme();
    const band = S.root.getAttribute('data-o55-layout') === 'narrow';
    const key = `${sc.id}|${th.family}|${th.mode}|${band}`;
    if (force || host.getAttribute('data-scene-key') !== key || host.getAttribute('data-beat') !== (sc.beat || 'default') || JSON.stringify(sc.params || {}) !== host.getAttribute('data-params')) {
      O55.art.mount(host, sc.id, { family: th.family, mode: th.mode, beat: sc.beat || 'default', params: sc.params || {}, band, instance: band ? 'band' : '' });
      host.setAttribute('data-scene-key', key); host.setAttribute('data-beat', sc.beat || 'default'); host.setAttribute('data-params', JSON.stringify(sc.params || {}));
    }
  }

  /* Quiet in-screen update: morph the current layer; never replays the entrance. */
  function refresh() {
    if (!S.open) return;
    const def = SCREENS.defs[S.sess.screen]; if (!def) return;
    const layer = S.root.querySelector('.o55-pane > .o55-layer:not(.o55-out)');
    if (!layer) return transition(null);
    U.morph(layer, paneHtml(def));
    renderScene(); renderSound();
    def.mounted && def.mounted(S, layer, false);
  }

  function transition(dir) {
    const def = SCREENS.defs[S.sess.screen]; if (!def) return;
    const pane = S.root.querySelector('.o55-pane');
    const old = pane.querySelector('.o55-layer:not(.o55-out)');
    if (old) {
      old.classList.add('o55-out', 'o55-out-' + (dir || 'fwd'));
      old.setAttribute('inert', ''); old.setAttribute('aria-hidden', 'true');
      old.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
      const kill = () => old.remove();
      O55.motion.after(900, kill);
      old.addEventListener('animationend', (e) => { if (e.target === old) kill(); });
    }
    const layer = document.createElement('div');
    layer.className = `o55-layer o55-entering o55-in-${dir || 'fwd'}`;
    layer.setAttribute('data-screen', def.id);
    layer.innerHTML = paneHtml(def);
    pane.appendChild(layer);
    layer.querySelectorAll('.o55-card, .o55-row, .o55-tile').forEach((n, i) => n.style.setProperty('--ci', i));
    /* the entrance classes leave once every entrance animation has finished (never cut short, even in slow motion) */
    O55.motion.settled(layer, { fallback: 2600 }).then(() => layer.classList.remove('o55-entering', 'o55-in-fwd', 'o55-in-back', 'o55-in-open'));
    renderScene(); renderRail(); renderSound();
    const h = layer.querySelector('#o55-h');
    /* the scene heading takes programmatic focus when the screen settles, unless the person is already inside it */
    O55.motion.after(60, () => { const a = document.activeElement; if (h && S.open && !(a && a !== layer && layer.contains(a))) h.focus({ preventScroll: true }); });
    U.announce(O55.stages.progress(S, def).announce + '. ' + (val(def.title) || ''), S.root.querySelector('.o55-win'));
    def.mounted && def.mounted(S, layer, true);
  }

  function renderSound() {
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
    const t = e.target.closest('[data-o55-do]');
    if (!t || !S.root.contains(t)) return;
    const action = t.getAttribute('data-o55-do'), arg = t.getAttribute('data-arg');
    if (t.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
      const reason = t.getAttribute('data-disabled-reason');
      if (reason) U.announce(reason, S.root.querySelector('.o55-win'));
      O55.sound.play('error');
      O55.motion.play(t, [{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 260, easing: 'ease-out' });
      showReason(t, reason);
      return;
    }
    e.preventDefault();
    if (action === 'close') return close('close');
    if (action === 'back') return back();
    if (action === 'sound') { O55.sound.toggle('onboarding'); renderSound(); return; }
    if (action === 'go') return go(arg);
    const def = SCREENS.defs[S.sess.screen];
    const fn = def && def.do && def.do[action];
    if (!fn) { const g = O55.actions[action]; if (g) return g(S, arg, t, e); console.warn('O55: no action', action); return; }
    /* controls whose handler plays its own sound (e.g. a look tile plays the new family's kit) opt out */
    if (!t.classList.contains('o55-primary') && t.getAttribute('data-o55-sound') !== 'self') O55.sound.play(t.classList.contains('o55-card') || t.classList.contains('o55-tile') ? 'select' : 'tap');
    fn(S, arg, t, e);
  }
  function showReason(t, reason) {
    if (!reason) return;
    const layer = t.closest('.o55-layer'); if (!layer) return;
    let tip = layer.querySelector('.o55-reason');
    if (!tip) { tip = document.createElement('div'); tip.className = 'o55-reason'; tip.setAttribute('role', 'note'); layer.querySelector('.o55-foot').appendChild(tip); }
    tip.textContent = reason; tip.classList.remove('o55-reason-show'); void tip.offsetWidth; tip.classList.add('o55-reason-show');
  }
  function onInput(e) {
    const t = e.target.closest('[data-o55-bind]'); if (!t) return;
    const def = SCREENS.defs[S.sess.screen];
    const key = t.getAttribute('data-o55-bind');
    const fn = def && def.bind && def.bind[key];
    const v = t.type === 'checkbox' ? t.checked : t.value;
    if (fn) fn(S, v, t, e);
  }
  function onKey(e) {
    e.stopPropagation(); /* shell trap: typed keys never reach the app's global shortcuts */
    if (e.type !== 'keydown') return;
    if (e.key === 'Escape') {
      const pop = S.root.querySelector('.o55-sheet[data-open="true"], .o55-popover[data-open="true"]');
      if (pop) { const c = pop.querySelector('[data-o55-do="sheet-close"]'); if (c) c.click(); e.preventDefault(); return; }
      e.preventDefault(); close('escape'); return;
    }
    if (e.key === 'Tab') return trapTab(e);
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey) {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'textarea' || tag === 'button' || tag === 'a' || e.target.closest('[role="radio"],[role="option"]')) return;
      const pri = S.root.querySelector('.o55-pane > .o55-layer:not(.o55-out) .o55-primary');
      if (pri) { e.preventDefault(); pri.click(); }
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      const group = e.target.closest('.o55-choices, .o55-tiles'); if (!group) return;
      const items = Array.from(group.querySelectorAll('.o55-card:not([aria-disabled="true"]), .o55-tile'));
      const i = items.indexOf(e.target.closest('.o55-card, .o55-tile')); if (i < 0) return;
      const n = items[(i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length];
      if (n) { e.preventDefault(); n.focus(); }
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
    O55.motion.play(el, k, { duration: 300, easing: S.root.getAttribute('data-family') === 'retro' ? 'steps(4, end)' : 'ease-out', fill: 'none' });
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
  function open(opts) {
    opts = opts || {};
    build();
    S.env = S.env || O55.fixtures.make(O55.store.get('scenario', 'fresh'));
    const saved = opts.fresh ? null : O55.store.get(KEY, null);
    S.sess = saved && saved.v === 1 && saved.status !== 'done' && saved.status !== 'skipped' ? Object.assign(freshSession(), saved) : freshSession();
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
    setInert(true); syncTheme(false); layoutClass();
    r.setAttribute('data-o55-ambient', 'on');
    r.classList.remove('o55-closing'); r.classList.add('o55-opening');
    O55.motion.settled(r.querySelector('.o55-win'), { subtree: false, fallback: 2800 }).then(() => { if (S.open) r.classList.remove('o55-opening'); });
    const pane = r.querySelector('.o55-pane'); pane.innerHTML = '';
    const stage = r.querySelector('.o55-stage'); stage.innerHTML = ''; stage.removeAttribute('data-scene-key');
    transition('open');
    O55.sound.play('open');
    window.dispatchEvent(new CustomEvent('o55:onboarding', { detail: { type: 'opened', screen: S.sess.screen, resumed: S.resumed } }));
    return true;
  }
  /* close(reason, {handoff}) — with handoff the window gives way at once, because the Guided Tour's first callout
     grows out of the same rectangle in the same frame (see O55.tour.start({from})) */
  function close(reason, o) {
    if (!S.open) return;
    const handoff = !!(o && o.handoff);
    const def = SCREENS.defs[S.sess.screen];
    if (def && def.leave) def.leave(S);
    S.sess.status = reason === 'skip' ? 'skipped' : reason === 'done' ? 'done' : 'closed';
    S.save();
    S.open = false;
    const r = S.root;
    r.classList.remove('o55-opening'); r.classList.add('o55-closing'); r.classList.toggle('o55-handoff', handoff); r.setAttribute('data-o55-ambient', 'off');
    if (!handoff) O55.sound.play('close');
    const finish = () => {
      r.hidden = true; r.setAttribute('data-open', 'false'); r.classList.remove('o55-closing', 'o55-handoff');
      document.documentElement.removeAttribute('data-o55-open');
      setInert(false);
      if (S.pausedClock && window.PM_DEMO && window.PM_DEMO.clock && window.PM_DEMO.clock.resume) { try { window.PM_DEMO.clock.resume(); } catch (_) {} }
      if (reason !== 'done' && returnFocus && document.contains(returnFocus)) { try { returnFocus.focus(); } catch (_) {} }
      O55.boot && O55.boot.chip && O55.boot.chip();
    };
    if (O55.motion.reduced()) finish(); else O55.motion.settled(r.querySelector('.o55-win'), { subtree: false, fallback: 700 }).then(finish);
    window.dispatchEvent(new CustomEvent('o55:onboarding', { detail: { type: reason === 'skip' ? 'skipped' : reason === 'done' ? 'finished' : 'closed', screen: S.sess.screen } }));
  }

  /* shared actions any screen can use */
  O55.actions = {
    skip() { close('skip'); },
    'sheet-close'(S2, arg, el) { const sh = el.closest('.o55-sheet'); if (sh) { sh.setAttribute('data-open', 'false'); S.sess.ui.sheet = null; S.save(); refresh(); } },
    details(S2, arg, el) { const k = 'details:' + (arg || S.sess.screen); S.sess.ui[k] = !S.sess.ui[k]; S.save(); refresh(); },
    startOver() { open({ fresh: true }); }
  };

  Object.assign(O55.ui, { S, build, open, close, go, back, refresh, transition, charm, applyLook, renderRail, renderScene, footHtml, shake });
})();
