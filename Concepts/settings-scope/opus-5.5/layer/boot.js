/* Settings that apply everywhere (Opus 5.5): boot. Loaded last. It waits for PMConcept7, adopts every Settings row into
   the model, feeds the opening context, opens Settings › AI & Providers › Models with tastebook on This computer, and
   tells index.html the layer is ready. The host and the layer talk only by postMessage ({source: 'psx-host', cmd} in,
   {source: 'psx', type, state} out), so the review strip also works in a sandboxed preview. With no parent (the
   single-file app build that the browser-check kit opens), the review config comes from the URL hash:
   #psx=opt.end=origin,opt.changed=outline,ctx.project=tastebook,ctx.device=here,homenas=down,moment=11.1 */
(function (W) {
  'use strict';
  const PSX = W.PSX;
  if (!PSX || PSX.booted) return;
  const { D, H, S } = PSX;
  const wait = PSX.wait;
  const look = () => { const t = H.getAttribute('data-theme') || 'basic-dark'; return H.getAttribute('data-o55-nier') === 'on' ? 'nier-' + (/-light$/.test(t) ? 'light' : 'dark') : t; };

  /* ------------------------------------------------------------------ messages to index.html */
  function report(type) {
    const state = { opt: Object.assign({}, S.opt), ctx: Object.assign({}, S.ctx, { homenas: PSX.W.up.homenas !== false, studio: PSX.W.up.studio !== false, actor: S.actor }), look: look(), moment: S.moment, motion: !!S.osReduced, runMode: S.runMode };
    PSX.lastReport = { type, state };
    if (W.parent !== W) { try { W.parent.postMessage({ source: 'psx', type, state }, '*'); } catch (e) { /* no parent */ } }
  }
  PSX.report = report;

  /* ------------------------------------------------------------------ looks, through PMConcept7's own theme menu
     (projects-redesign's setLook). The change lands where the look lives, silently: the strip is a review control. */
  async function setLook(id) {
    const nier = /^nier-/.test(id), mode = /-light$/.test(id) ? 'light' : 'dark';
    const tb = D.getElementById('themeSelect'); if (!tb) return;
    S.reviewChange = true;
    try {
      const open = async () => { if (tb.getAttribute('aria-expanded') !== 'true') { tb.click(); await wait(90); } };
      const pick = async (sel) => { await open(); const b = D.querySelector(sel); if (b && b.getAttribute('aria-checked') !== 'true') { b.click(); await wait(180); } return !!b; };
      const nierOn = () => !!(W.PM_NIER && W.PM_NIER.on && W.PM_NIER.on()) || /^nier/.test(H.getAttribute('data-theme') || '');
      const flipNier = async () => { await open(); const t = D.querySelector('#themeMenu [data-o55-nier-tt="toggle"]'); if (t) { t.click(); await wait(220); } };
      // NieR is a family of its own in this build; older builds switch it with a toggle over Basic
      await open();
      const nierFamily = !!D.querySelector('#themeMenu .pm6-tt-family[data-family="nier"]');
      const fam = nier ? (nierFamily ? 'nier' : 'basic') : id.split('-')[0];
      if (!nier && nierOn() && !nierFamily) await flipNier();
      await pick(`#themeMenu .pm6-tt-family[data-family="${fam}"]`);
      await pick(`#themeMenu .pm6-tt-mode[data-mode-value="${mode}"]`);
      if (nier && !nierOn() && !nierFamily) await flipNier();
      // a look paints on its own schedule (Glass mounts its lenses, NieR plays its switch-on): wait until it shows
      const painted = () => { const t = H.getAttribute('data-theme') || ''; return nier ? (/^nier/.test(t) || nierOn()) && t.endsWith('-' + mode) : t === id && !(W.PM_NIER && W.PM_NIER.on && W.PM_NIER.on()); };
      for (let i = 0; i < 40 && !painted(); i++) await wait(100);
      // close the menu with its own button: a synthetic Escape would also close a sheet that is open in Settings
      await wait(120);
      if (tb.getAttribute('aria-expanded') === 'true') { tb.click(); await wait(140); }
      if (W.PMR && W.PMR.menu && W.PMR.menu.isOpen()) { try { W.PMR.menu.closeAll(); } catch (e) { /* closed */ } }
      await wait(260);   // the router's diff runs after the menu's clicks; it reads reviewChange
    } finally { S.reviewChange = false; }
    PSX.rows && PSX.rows.refreshAll();
  }
  PSX.setLook = setLook;

  /* ------------------------------------------------------------------ review commands */
  function setOpt(patch) {
    Object.assign(S.opt, patch);
    PSX.store.save({ opt: S.opt });
    PSX.rows.refreshAll();
    PSX.panel.rerender();
    report('state');
  }
  /* a fresh demo: the world, the defaults, the computers and the device in use, every sheet, drawer and menu closed.
     The look, the strip's options and the run mode are the reviewer's and stay */
  function reset(o) {
    PSX.closeSheets(); PSX.hideNote();
    if (PSX.moments && PSX.moments.reset) PSX.moments.reset();
    PSX.freshWorld();
    S.ctx = { project: 'tastebook', device: 'here', on: null };
    S.actor = 'here';
    S.targets = {}; S.firstStart = false; S.viewAs = false; if (!(o && o.keepMoment)) S.moment = null;
    if (PSX.reseedAdopted) PSX.reseedAdopted();
    PSX.feed.full();
    PSX.rows.refreshAll();
    report('state');
  }
  PSX.reset = reset;
  async function command(m) {
    if (m.cmd === 'hello') { report('ready'); return; }
    if (m.cmd === 'opt') { const p = {}; if (m.end) p.end = m.end; if (m.changed) p.changed = m.changed; setOpt(p); return; }
    if (m.cmd === 'ctx') {
      const p = {};
      if (m.project !== undefined) { p.project = m.project; S.viewAs = false; }
      // the strip's You're using is the device in use: it sets both what you see and what you may change
      if (m.device !== undefined) { p.device = m.device; S.actor = m.device; }
      if (m.on !== undefined) p.on = m.on || null;
      if (m.homenas !== undefined) { if (PSX.moments) PSX.moments.homenas(m.homenas === 'up' || m.homenas === true); else PSX.W.up.homenas = m.homenas === 'up' || m.homenas === true; }
      if (m.studio !== undefined && PSX.moments) PSX.moments.studio(m.studio === 'up' || m.studio === true);
      if (Object.keys(p).length) PSX.setCtx(p); else { PSX.feed.push(); PSX.emit('redraw'); report('state'); }
      return;
    }
    if (m.cmd === 'moment') { if (PSX.moments) await PSX.moments.run(m.id); report('state'); return; }
    if (m.cmd === 'board') { if (PSX.board) PSX.board.open(); return; }
    if (m.cmd === 'look') { await setLook(m.look); report('look-done'); return; }
    if (m.cmd === 'motion') {
      S.osReduced = !!m.reduced;
      if (m.reduced) { H.setAttribute('data-motion', 'reduced'); H.setAttribute('data-reduced-motion', '1'); }
      else { H.removeAttribute('data-reduced-motion'); if (!PSX.resolve('general.visual.reduce-animations', S.ctx).value) H.removeAttribute('data-motion'); }
      report('state'); return;
    }
    if (m.cmd === 'reset') { reset(); return; }
    // Regular or YOLO: what every yes-point does (guard.js PSX.confirm)
    if (m.cmd === 'runmode') { S.runMode = m.mode === 'yolo' ? 'yolo' : 'regular'; PSX.store.save({ runMode: S.runMode }); PSX.rows.refreshAll(); PSX.emit('redraw'); if (PSX.approvals) PSX.approvals.draw(); report('state'); return; }
    // the strip's Compare options: the alternatives (and their keys) are there only while it is open
    if (m.cmd === 'compare') { S.keys = !!m.open; report('state'); return; }
    if (m.cmd === 'selftest') { report('selftest'); return; }
  }
  PSX.command = command;
  W.addEventListener('message', (ev) => {
    const m = ev.data;
    if (!m || m.source !== 'psx-host' || ev.source !== W.parent) return;
    command(m).catch((e) => console.error('[psx]', e));
  });
  // keys, outside text fields and sheets, while the strip's Compare options is open: 1 to 4 pick the end-of-row option,
  // 0 Today, C opens Compare. Closed (and in the app file alone) they do nothing, so the decided design stays put
  D.addEventListener('keydown', (e) => {
    if (!S.keys) return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented || PSX.topSheet()) return;
    const t = e.target, tag = (t && t.tagName) || '';
    if (/input|select|textarea/i.test(tag) || (t && t.isContentEditable)) return;
    if (W.PMR && W.PMR.menu && W.PMR.menu.isOpen()) return;
    const map = { 1: 'origin', 2: 'mark', 3: 'line', 4: 'more', 0: 'today' };
    if (map[e.key]) { setOpt({ end: map[e.key] }); return; }
    if ((e.key === 'c' || e.key === 'C') && PSX.board) { e.preventDefault(); PSX.board.open(); }
  });

  /* ------------------------------------------------------------------ the URL hash, when there is no host */
  function hashConfig() {
    const m = /[#&]psx=([^&]*)/.exec(W.location.hash || ''); if (!m) return null;
    const out = {};
    decodeURIComponent(m[1]).split(',').forEach((kv) => { const [k, v] = kv.split('='); if (k) out[k.trim()] = (v || '').trim(); });
    return out;
  }

  /* ------------------------------------------------------------------ start */
  function ready() {
    return !!(W.PMG && W.PM_PAGES && W.PM51 && W.PM12_KIMI && W.PM12_KIMI.reloadProject && W.PM7_SETTINGS_TOME && D.getElementById('pm-settings-root') && D.getElementById('themeSelect'));
  }
  async function boot(n) {
    if (!ready()) { if (n < 300) setTimeout(() => boot(n + 1), 100); else console.error('[psx] PMConcept7 never became ready'); return; }

    if (PSX.booted) return;
    PSX.booted = true;
    H.setAttribute('data-psx-layer', 'on');
    try {
      PSX.feed.wrapNotify();
      PSX.feed.watchTitleMenu();
      PSX.feed.hook(D.getElementById('pm-settings-root'));
      PSX.feed.hook(D.getElementById('pm-settings-portals'));
      PSX.feed.hook(D.getElementById('themeMenu'));
      try { if (W.PM_PAGES.current !== 'settings') W.PM_PAGES.go('settings'); } catch (e) { /* the page switcher may still be starting */ }
      await wait(60);
      PSX.feed.adoptAll();
      const hc = W.parent === W ? hashConfig() : null;
      if (hc) {
        if (hc['opt.end']) S.opt.end = hc['opt.end'];
        if (hc['opt.changed']) S.opt.changed = hc['opt.changed'];
        if (hc['ctx.project']) S.ctx.project = hc['ctx.project'];
        if (hc['ctx.device']) S.ctx.device = hc['ctx.device'];
        if (hc.homenas === 'down') PSX.W.up.homenas = false;
        if (hc.runmode === 'yolo' || hc.runmode === 'regular') S.runMode = hc.runmode;
        if (hc.keys === '1') S.keys = true;
      }
      // open on Settings › AI & Providers › Models
      try { W.PM12_KIMI.navigate('ai', 'providers'); } catch (e) { /* ignore */ }
      await wait(60);
      try { W.PM12_KIMI.dispatchAction('pm51-tab', { manager: 'providers', tab: 'models' }); } catch (e) { /* ignore */ }
      await wait(60);
      PSX.feed.full();
      PSX.rows.observe(); PSX.rows.wire();
      PSX.panel.install();
      if (PSX.managers) PSX.managers.install();
      PSX.rows.decorate();
      // the engine's root may be re-rendered: re-attach the observers and the router when it is
      new MutationObserver(() => { PSX.rows.observe(); PSX.panel.install(); PSX.feed.hook(D.getElementById('pm-settings-root')); PSX.feed.hook(D.getElementById('pm-settings-portals')); }).observe(D.getElementById('panel-settings') || D.body, { childList: true });
      PSX.selfTestResult = PSX.selfTest(true);
      if (PSX.selfTestResult.fail) console.warn('[psx] selfTest', PSX.selfTestResult.fail, 'failed', PSX.selfTestResult.results.filter((r) => !r.ok));
      if (hc && hc.moment && PSX.moments) await PSX.moments.run(hc.moment);
      if (hc && hc.board === '1' && PSX.board) PSX.board.open();
    } catch (e) { console.error('[psx] boot', e); }
    report('ready');
  }
  boot(0);
})(window);
