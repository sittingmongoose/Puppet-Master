/* PMF Product Onboarding — window shell: lifecycle, navigation, sheets, footer,
   progress, persistence, first-run boot, settings/tour handoff, compat shims. */
(function () {
  'use strict';
  var PMF = window.PMF_ONBOARDING, U = PMF.util, h = U.h, raw = U.raw, str = U.str, S = PMF.store;
  var root, stage, pane, screensEl, footEl, sheetEl, headLeft, captionEl, liveEl, scenarioBtn;
  var CHAPTERS = [['where', 'Where'], ['project', 'Project'], ['review', 'Review'], ['power', 'Power'], ['ready', 'Ready']];

  PMF.screens = PMF.screens || {};
  PMF.actions = PMF.actions || {};
  PMF.state = { open: false, screen: null, dir: 'fwd', draft: null, stack: [], sheet: null, tmp: {}, resumed: false, source: null };

  PMF.newDraft = function () {
    return {
      created_at: U.now(), idempotency_key: U.uid('project'),
      mode: null, where: 'local', server: null, paired: false,
      name: '', path: '', history: true, online: false, online_host: 'github', online_account: null,
      inherit: null, inherit_groups: null,
      source: null, folder: null, has_history: false, repo: null,
      nas_method: 'ssh', nas_device: null, nas_connected: false, nas_folder: null,
      backup: null, backup_source: 'local',
      committed: null, commit_attempts: 0,
      providers: {}, power_ready: false, free: null, tour_choice: null
    };
  };
  PMF.draft = function () { return PMF.state.draft; };

  // ---- mount -------------------------------------------------------------------
  function mount() {
    root = document.getElementById('pmf-onboarding'); if (!root) return false;
    stage = U.$('.pmf-stage', root); pane = U.$('.pmf-pane', root); screensEl = U.$('#pmf-screens', root);
    footEl = U.$('#pmf-foot', root); sheetEl = U.$('#pmf-sheet', root); headLeft = U.$('#pmf-head-left', root);
    captionEl = U.$('#pmf-stage-caption', root); liveEl = U.$('#pmf-live', root); scenarioBtn = U.$('#pmf-scenario', root);
    PMF.art.mount(U.$('#pmf-art-host', root));
    syncFamily();
    try { new MutationObserver(syncFamily).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-reduced-motion'] }); } catch (e) {}
    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKey);
    // The window is modal: keystrokes typed into it must not reach the shell's
    // global hotkeys (which open menus and then swallow the next click).
    ['keydown', 'keyup', 'keypress'].forEach(function (t) { root.addEventListener(t, function (ev) { ev.stopPropagation(); }); });
    root.addEventListener('change', function (ev) { var el = ev.target.closest && ev.target.closest('[data-on-change]'); if (el) run(el.getAttribute('data-on-change'), el, ev); });
    root.addEventListener('input', function (ev) { var el = ev.target.closest && ev.target.closest('[data-on-input]'); if (el) run(el.getAttribute('data-on-input'), el, ev); });
    return true;
  }
  function syncFamily() {
    var f = U.family(); if (!root) return;
    root.setAttribute('data-family', f); PMF.art.setFamily(f);
    if (PMF.state.open && PMF.state.screen) applyScene(PMF.state.screen);
  }
  function run(name, el, ev) { var fn = PMF.actions[name]; if (typeof fn === 'function') { try { return fn(el, ev); } catch (e) { console.error('[pmf] action failed', name, e); } } else console.warn('[pmf] no action', name); }
  function onClick(ev) {
    var el = ev.target.closest && ev.target.closest('[data-act]'); if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    var act = el.getAttribute('data-act');
    if (act === 'backdrop') return; // backdrop click does nothing: the window is the user's place to decide
    run(act, el, ev);
  }
  function onKey(ev) {
    if (ev.key === 'Escape') { ev.preventDefault(); if (PMF.state.sheet) PMF.sheetClose(); else PMF.close('escape'); }
    if (ev.key === 'Enter' && ev.target && ev.target.tagName === 'INPUT' && !ev.target.closest('.pmf-sheet')) { var b = U.$('.pmf-foot .pmf-btn.is-primary', root); if (b && b.getAttribute('aria-disabled') !== 'true') { ev.preventDefault(); b.click(); } }
  }

  // ---- lifecycle -----------------------------------------------------------------
  PMF.open = function (opts) {
    opts = opts || {};
    if (!root && !mount()) return false;
    if (PMF.state.open) return true;
    var saved = S.read();
    var st = PMF.state;
    st.source = opts.source || 'first_run';
    if (saved && saved.scenario && PMF.scenarios[saved.scenario]) PMF.scenario_id = saved.scenario;
    if (opts.fresh || !saved || !saved.draft || saved.completed) {
      st.draft = PMF.newDraft(); st.stack = []; st.resumed = false;
      var start = 'welcome';
      if (saved && saved.completed && saved.draft && saved.draft.committed && !saved.provider_done && !opts.fresh) { st.draft = saved.draft; start = 'power'; st.resumed = true; }
      st.screen = null; st.pendingStart = start;
    } else {
      st.draft = saved.draft; st.stack = saved.stack || []; st.resumed = true; st.pendingStart = saved.screen || 'welcome';
    }
    st.tmp = {};
    root.hidden = false; root.setAttribute('data-open', 'true'); root.setAttribute('data-motion', 'in');
    st.open = true;
    updateScenarioLabel();
    PMF.emit('opened', { source: st.source, resumed: st.resumed, screen: st.pendingStart });
    PMF.command('ui.onboarding.open', { source: st.source, resumed: st.resumed });
    var startScreen = st.pendingStart;
    // entrance choreography: window rises, the bar drops in, then the scene is lowered on its strings
    PMF.art.entrance();
    setTimeout(function () { if (PMF.state.open) applyScene(startScreen); }, U.reduced() ? 10 : 300 * U.timeScale());
    setTimeout(function () { root.setAttribute('data-motion', 'open'); }, U.reduced() ? 10 : 500 * U.timeScale());
    setTimeout(function () { PMF.go(startScreen, 'fwd', { first: true }); }, U.reduced() ? 10 : 140 * U.timeScale());
    try { root.focus({ preventScroll: true }); } catch (e) {}
    return true;
  };
  PMF.close = function (reason) {
    if (!PMF.state.open) return;
    var st = PMF.state; st.open = false;
    PMF.sheetClose(true);
    persist();
    root.setAttribute('data-motion', 'out');
    PMF.emit('closed', { reason: reason || 'close', screen: st.screen });
    PMF.command('ui.onboarding.close', { reason: reason || 'close', screen: st.screen });
    setTimeout(function () { root.hidden = true; root.setAttribute('data-open', 'false'); root.setAttribute('data-motion', 'idle'); screensEl.innerHTML = ''; }, U.reduced() ? 20 : 240);
  };
  PMF.skip = function () { var saved = S.read() || {}; saved.skipped = true; saved.updated = U.now(); S.write(saved); PMF.emit('skipped', {}); PMF.close('skip'); };
  PMF.finish = function (choice) {
    var st = PMF.state, saved = S.read() || {};
    saved.completed = true; saved.provider_done = true; saved.draft = st.draft; saved.updated = U.now(); saved.screen = null; saved.stack = [];
    S.write(saved);
    PMF.emit('completed', { choice: choice, project_id: st.draft.committed && st.draft.committed.project_id });
    PMF.command('ui.onboarding.finish', { choice: choice });
    PMF.close('complete');
    if (choice === 'tour') setTimeout(function () { startTour(); }, U.reduced() ? 40 : 300);
    if (choice === 'wizard') setTimeout(function () { try { window.PM_PAGES && window.PM_PAGES.go('wizard'); } catch (e) {} }, 200);
  };
  function startTour() {
    try {
      if (window.PMF_TOUR && typeof window.PMF_TOUR.start === 'function') { window.PMF_TOUR.start({ source: 'onboarding', project_id: (PMF.state.draft.committed || {}).project_id }); return true; }
    } catch (e) { console.error(e); }
    return false;
  }
  PMF.replay = function (opts) { S.clear(); return PMF.open({ fresh: true, source: (opts && opts.source_surface) || 'settings' }); };
  PMF.reset = function () { S.clear(); };
  function persist() {
    var st = PMF.state; var saved = S.read() || {};
    saved.draft = st.draft; saved.screen = st.screen; saved.stack = st.stack; saved.updated = U.now(); saved.scenario = PMF.scenario_id;
    if (st.draft && st.draft.committed) { saved.completed = true; saved.provider_done = !!st.draft.provider_done; }
    S.write(saved);
  }
  PMF.persist = persist;

  // ---- navigation ------------------------------------------------------------------
  var navToken = 0;
  PMF.go = function (id, dir, opts) {
    opts = opts || {};
    var def = PMF.screens[id]; if (!def) { console.warn('[pmf] unknown screen', id); return; }
    var st = PMF.state, prev = st.screen;
    dir = dir || 'fwd';
    if (prev && prev !== id && dir === 'fwd' && !opts.replace) st.stack.push(prev);
    st.screen = id; st.dir = dir; st.tmp = {};
    root.setAttribute('data-screen', id);
    PMF.sheetClose(true);
    var token = ++navToken;
    // exit old
    var olds = U.$$('.pmf-screen', screensEl);
    olds.forEach(function (o) { o.setAttribute('data-phase', 'exit'); o.setAttribute('data-dir', dir === 'back' ? 'back' : 'fwd'); o.setAttribute('aria-hidden', 'true'); });
    var exitMs = U.reduced() ? 60 : (olds.length ? 100 * U.timeScale() : 0);
    setTimeout(function () {
      if (token !== navToken) return;
      olds.forEach(function (o) { o.remove(); });
      var sec = document.createElement('section');
      sec.className = 'pmf-screen'; sec.setAttribute('data-phase', 'enter'); sec.setAttribute('data-dir', dir === 'back' ? 'back' : 'fwd'); sec.setAttribute('data-screen-id', id);
      var banner = '';
      if (st.resumed && opts.first && id !== 'welcome') banner = str(h`<div class="pmf-banner">${PMF.icon('clock')}<span>Welcome back. Your choices from last time are still here.</span><button type="button" class="pmf-btn is-small is-quiet" data-act="start-over">Start over</button></div>`);
      sec.innerHTML = banner + str(def.render(st.draft, st.tmp));
      Array.prototype.forEach.call(sec.children, function (c, i) { c.style.setProperty('--i', i); });
      screensEl.appendChild(sec);
      setTimeout(function () { if (sec.isConnected) sec.setAttribute('data-phase', 'idle'); }, U.reduced() ? 80 : 700);
      renderFoot(def, st.draft);
      renderProgress(def);
      if (typeof def.onEnter === 'function') { try { def.onEnter(sec, st.draft, st.tmp); } catch (e) { console.error('[pmf] onEnter', id, e); } }
      exemptHoverTags();
      focusFirst(sec);
      persist();
      PMF.emit('screen', { id: id, dir: dir });
    }, exitMs);
    applyScene(id);
  };
  PMF.back = function () { var st = PMF.state; var def = PMF.screens[st.screen]; var to = def && def.backTo ? def.backTo(st.draft) : null; if (!to) to = st.stack.pop(); else { var i = st.stack.lastIndexOf(to); if (i >= 0) st.stack.length = i; } if (!to) return; PMF.command('ui.onboarding.back', { from: st.screen, to: to }); PMF.go(to, 'back', { replace: true }); };
  PMF.next = function () { var st = PMF.state; var def = PMF.screens[st.screen]; if (!def) return; if (def.canContinue && !def.canContinue(st.draft, st.tmp)) return; var to = typeof def.next === 'function' ? def.next(st.draft) : def.next; if (!to) return; PMF.command('ui.onboarding.next', { from: st.screen, to: to }); PMF.go(to, 'fwd'); };
  PMF.rerender = function () { // soft update: re-render body of current screen without a transition, keep scroll
    var st = PMF.state, def = PMF.screens[st.screen]; if (!def) return; var sec = U.$('.pmf-screen', screensEl); if (!sec) return;
    var sc = sec.scrollTop; sec.setAttribute('data-phase', 'idle'); sec.innerHTML = str(def.render(st.draft, st.tmp)); sec.scrollTop = sc; renderFoot(def, st.draft); if (def.onEnter) { try { def.onEnter(sec, st.draft, st.tmp); } catch (e) {} } exemptHoverTags(); applyScene(st.screen); persist(); try { document.dispatchEvent(new CustomEvent('pmf.onboarding.rendered')); } catch (e) {}
  };
  PMF.refreshFoot = function () { var st = PMF.state, def = PMF.screens[st.screen]; if (def) renderFoot(def, st.draft); };
  // The window explains itself; the shell's hover/focus tag controller would add
  // a second layer of generic tips ("Change this setting.") on every control.
  function exemptHoverTags() { U.$$('button, input, [tabindex], [role="radio"], [role="switch"]', root).forEach(function (el) { if (!el.hasAttribute('data-pm-hover-exempt')) el.setAttribute('data-pm-hover-exempt', 'true'); }); }
  PMF.exemptHoverTags = exemptHoverTags;
  function focusFirst(sec) { var el = U.$('input:not([type=hidden]), [aria-checked="true"], .pmf-opt, .pmf-btn', sec); if (el) { try { el.focus({ preventScroll: true }); } catch (e) {} } }

  function applyScene(id) {
    var def = PMF.screens[id]; if (!def) return;
    var d = PMF.state.draft || PMF.newDraft();
    var sc = typeof def.scene === 'function' ? def.scene(d) : (def.scene || id);
    var name = Array.isArray(sc) ? sc[0] : sc, opts = Array.isArray(sc) ? sc[1] : d;
    stage.setAttribute('data-scene', name);
    PMF.art.setScene(name, opts);
    var caps = typeof def.caption === 'function' ? def.caption(d) : [];
    captionEl.innerHTML = (caps || []).map(function (c, i) { return '<div class="pmf-cap' + (c.primary ? ' is-primary' : '') + '" style="--i:' + i + '"><i></i><span>' + U.esc(c.text) + '</span></div>'; }).join('');
  }
  PMF.scene = function () { applyScene(PMF.state.screen); };

  function renderFoot(def, d) {
    var cfg = typeof def.foot === 'function' ? def.foot(d, PMF.state.tmp) : (def.foot || {});
    if (cfg === null) { footEl.innerHTML = ''; return; }
    var left = '', right = '';
    if (cfg.back !== false && PMF.state.stack.length) left += str(h`<button type="button" class="pmf-btn is-ghost" data-act="back">${PMF.icon('back')}<span>Back</span></button>`);
    if (cfg.skip) left += str(h`<button type="button" class="pmf-btn is-ghost" data-act="${cfg.skip.act}">${cfg.skip.label}</button>`);
    if (cfg.secondary) right += str(h`<button type="button" class="pmf-btn ${cfg.secondary.kind === 'ghost' ? 'is-ghost' : ''}" data-act="${cfg.secondary.act}" aria-disabled="${cfg.secondary.disabled ? 'true' : 'false'}">${cfg.secondary.label}</button>`);
    if (cfg.primary) right += str(h`<button type="button" class="pmf-btn is-primary" data-act="${cfg.primary.act || 'next'}" aria-disabled="${cfg.primary.disabled ? 'true' : 'false'}"><span class="pmf-btn-label">${cfg.primary.label}</span>${cfg.primary.icon === false ? '' : PMF.icon(cfg.primary.icon || 'next')}</button>`);
    footEl.innerHTML = '<div class="pmf-foot-left">' + left + '</div><div class="pmf-progress" id="pmf-progress"></div><div class="pmf-foot-right">' + right + '</div>';
    renderProgress(def); exemptHoverTags();
  }
  function renderProgress(def) {
    var p = document.getElementById('pmf-progress'); if (!p) return;
    var ch = def.chapter; if (!ch) { p.innerHTML = ''; return; }
    var idx = CHAPTERS.findIndex(function (c) { return c[0] === ch; });
    p.innerHTML = CHAPTERS.map(function (c, i) { var stt = i < idx ? 'done' : i === idx ? 'current' : 'todo'; return '<div class="pmf-step" data-state="' + stt + '"><i></i><span>' + c[1] + '</span></div>'; }).join('');
  }
  PMF.setPrimary = function (patch) { var b = U.$('.pmf-foot .pmf-btn.is-primary', root); if (!b) return; if (patch.disabled != null) { b.setAttribute('aria-disabled', patch.disabled ? 'true' : 'false'); b.removeAttribute('data-pm-hover-was-disabled'); } if (patch.label) { var l = U.$('.pmf-btn-label', b); if (l) l.textContent = patch.label; } if (patch.act) b.setAttribute('data-act', patch.act); };

  // ---- sheets (sub-flows inside the pane) --------------------------------------------
  PMF.sheet = function (def) {
    PMF.state.sheet = def;
    sheetEl.innerHTML = '<div class="pmf-sheet-head"><button type="button" class="pmf-iconbtn" data-act="sheet-close" aria-label="Back">' + PMF.icons.back + '</button><div class="pmf-kicker">' + U.esc(def.kicker || '') + '</div></div>' +
      '<div class="pmf-sheet-body" id="pmf-sheet-body">' + str(def.body) + '</div>' +
      '<div class="pmf-sheet-foot" id="pmf-sheet-foot">' + str(def.foot || '') + '</div>';
    Array.prototype.forEach.call(U.$('#pmf-sheet-body', sheetEl).children, function (c, i) { c.style.setProperty('--i', i); });
    sheetEl.setAttribute('aria-hidden', 'false'); pane.setAttribute('data-sheet', 'open');
    if (def.onMount) { try { def.onMount(sheetEl); } catch (e) { console.error(e); } }
    exemptHoverTags();
    setTimeout(function () { focusFirst(sheetEl); }, U.reduced() ? 20 : 260);
    PMF.command('ui.onboarding.sheet.open', { sheet: def.id || def.kicker });
  };
  PMF.sheetClose = function (silent) {
    if (!PMF.state.sheet) return;
    var def = PMF.state.sheet; PMF.state.sheet = null;
    pane.setAttribute('data-sheet', 'closed'); sheetEl.setAttribute('aria-hidden', 'true');
    if (def.onClose && !silent) { try { def.onClose(); } catch (e) {} }
    setTimeout(function () { if (!PMF.state.sheet) sheetEl.innerHTML = ''; }, U.reduced() ? 20 : 320);
  };
  PMF.sheetFoot = function (html) { var f = U.$('#pmf-sheet-foot', sheetEl); if (f) f.innerHTML = str(html); };
  PMF.sheetBody = function (html) { var b = U.$('#pmf-sheet-body', sheetEl); if (b) { b.innerHTML = str(html); Array.prototype.forEach.call(b.children, function (c, i) { c.style.setProperty('--i', i); }); } };

  PMF.announce = function (text) { if (liveEl) { liveEl.textContent = ''; setTimeout(function () { liveEl.textContent = text; }, 30); } };
  PMF.patch = function (sel, html) { var el = U.$(sel, root); if (el) el.innerHTML = str(html); return el; };

  // ---- common actions ---------------------------------------------------------------------
  PMF.actions.next = function () { PMF.next(); };
  PMF.actions.back = function () { PMF.back(); };
  PMF.actions.close = function () { PMF.close('close'); };
  PMF.actions.skip = function () { PMF.skip(); };
  PMF.actions['sheet-close'] = function () { PMF.sheetClose(); };
  PMF.actions['start-over'] = function () { PMF.state.draft = PMF.newDraft(); PMF.state.stack = []; PMF.state.resumed = false; PMF.go('welcome', 'back', { replace: true }); };
  PMF.actions.goto = function (el) { var to = el.getAttribute('data-arg'); if (to) { PMF.command('ui.onboarding.edit', { to: to }); PMF.go(to, 'back'); } };
  PMF.actions.scenario = function () {
    var menu = U.$('.pmf-scenario-menu', root);
    if (menu) { menu.remove(); return; }
    menu = document.createElement('div'); menu.className = 'pmf-scenario-menu';
    menu.innerHTML = Object.keys(PMF.scenarios).map(function (k) { var s = PMF.scenarios[k]; return '<button type="button" data-act="scenario-pick" data-arg="' + k + '" aria-checked="' + (k === PMF.scenario_id) + '"><span>' + U.esc(s.label) + '</span><small>' + U.esc(s.hint) + '</small></button>'; }).join('');
    U.$('.pmf-window', root).appendChild(menu);
  };
  PMF.actions['scenario-pick'] = function (el) {
    PMF.scenario_id = el.getAttribute('data-arg'); var m = U.$('.pmf-scenario-menu', root); if (m) m.remove();
    updateScenarioLabel();
    // restart the draft so the scenario is visible from the first screen
    PMF.state.draft = PMF.newDraft(); PMF.state.stack = []; PMF.state.resumed = false; PMF.go('welcome', 'back', { replace: true });
  };
  function updateScenarioLabel() { if (scenarioBtn) scenarioBtn.innerHTML = 'Concept scenario: <b>' + U.esc(PMF.scenario().label) + '</b>'; }

  // ---- compat shims (settings handlers call these) ----------------------------------------------
  window.PM7_ONBOARDING_CINEMATIC = {
    schema_id: 'pm.onboarding.pmf.compat.v1', concept_simulation_only: true,
    open: function (o) { return PMF.open(o); }, replay: function (o) { return PMF.replay(o); }, skip: function () { return PMF.skip(); },
    close: function () { return PMF.close('close'); }, snapshot: function () { return { open: PMF.state.open, screen: PMF.state.screen, draft: U.clone(PMF.state.draft || {}) }; }
  };

  // ---- boot --------------------------------------------------------------------------------------
  function boot() {
    if (!mount()) return;
    var saved = S.read();
    var suppressed = /no-onboarding/.test(location.hash) || /pmf-no-onboarding/.test(location.search);
    if (suppressed) return;
    var providerPending = !!(saved && saved.completed && saved.draft && saved.draft.committed && !saved.provider_done && !saved.skipped);
    if (!saved || (!saved.completed && !saved.skipped) || providerPending) {
      setTimeout(function () { PMF.open({ source: providerPending ? 'resume_provider' : (saved && saved.draft ? 'resume' : 'first_run') }); }, 900);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
