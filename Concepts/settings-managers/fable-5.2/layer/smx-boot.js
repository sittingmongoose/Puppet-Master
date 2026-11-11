/* Settings managers, rethought (Fable 5.2): boot. Loaded last. It waits for PMConcept7, opens Settings, starts the
   redesigned view and tells index.html the layer is ready. The host and the layer talk only by postMessage
   ({source: 'smx-host', cmd} in, {source: 'smx', type, state} out), so the review strip also works in a sandboxed
   preview. With no parent (the single-file app build that the browser-check kit opens) the review config comes from
   the URL hash: #smx=route=computers,view=new,look=glass-dark */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX || SMX.bootStarted) return;
  SMX.bootStarted = true;
  const D = W.document, H = D.documentElement;
  const wait = SMX.wait;

  // NieR is painted over Basic (the theme mark stays basic-…): it is reported as its own look, so the strip keeps saying NieR
  const look = () => { const t = H.getAttribute('data-theme') || 'basic-dark'; let n = false; try { n = !!(W.PM_NIER && W.PM_NIER.on && W.PM_NIER.on()); } catch (e) { n = false; } return n ? 'nier-' + (t.split('-')[1] || 'dark') : t; };
  function note() {
    const m = SMX.match(SMX.route); if (!m) return '';
    const p = m.page; const ctx = { st: SMX.st(), local: SMX.local, params: m.params };
    const title = typeof p.title === 'function' ? p.title(ctx) : p.title;
    const list = typeof p.changes === 'function' ? p.changes(ctx) : (p.changes || []);
    const first = list[0];
    const lead = p.note || (first ? (typeof first === 'string' ? first : first.now) : '');
    return `<b>${SMX.h(title)}.</b> ${lead || 'Same contents as today, in the new page shape.'}${list.length > 1 ? ` <em>${list.length - 1} more under “What changed here”.</em>` : ''}`;
  }
  function report(type, extra) {
    let state = {};
    try { state = { view: SMX.view, route: SMX.route, look: look(), note: note(), changesOpen: SMX.layerOpen === 'changes', movedOpen: SMX.layerOpen === 'moved' }; } catch (e) { state = { view: SMX.view, route: SMX.route }; }
    const msg = Object.assign({ source: 'smx', type, state }, extra || {});
    SMX.lastReport = msg;
    if (W.parent !== W) { try { W.parent.postMessage(msg, '*'); } catch (e) { /* no parent */ } }
  }
  SMX.report = report;

  /* A look, through PMConcept7's own theme owner, and SAVED like a choice made on the Look & feel page. It used to be
     an unsaved preview: the Look page then showed the saved look's choices under another look, and any choice made
     there snapped the app back (review R1, F7). "Reset demo" puts the look back. Asked again if it did not take
     (right after start the theme owner is sometimes not listening yet). */
  async function setLook(id) {
    const [family, mode] = String(id).split('-');
    const nier = family === 'nier';
    const label = String(id).split('-').map((x) => (x === 'nier' ? 'NieR' : x.charAt(0).toUpperCase() + x.slice(1))).join(' ');   // how PMConcept7 stores a look
    // NieR is painted over the Basic look: the page's theme mark stays basic-…, and PM_NIER.on() says it is painted
    const shown = () => { const t = H.getAttribute('data-theme') || ''; const n = !!(W.PM_NIER && W.PM_NIER.on && W.PM_NIER.on()); return nier ? (n && t.endsWith('-' + mode)) : (!n && t === id); };
    const is = () => shown() && (!W.PM7_SETTINGS_TOME || String(SMX.val('general.visual.theme') || '') === label);
    for (let attempt = 0; attempt < 3 && !is(); attempt++) {
      try {
        const tome = W.PM7_SETTINGS_TOME, T = W.PM_THEME, N = W.PM_NIER;
        if (tome && tome.setChromeThemeFamily && tome.setChromeThemeMode) {
          // the way the look menu in PMConcept7's title bar saves a look (NieR included: the engine plays its moment)
          tome.setChromeThemeFamily(family); tome.setChromeThemeMode(mode);
          // NieR is saved by that, but only its own switch puts it on screen (or takes it off again)
          if (N && N.set) { const painted = !!(N.on && N.on()); if (nier !== painted) await N.set(nier); }
        } else {
          T.setMode(mode, { persist: false });
          if (!nier && N && N.on && N.on()) await N.set(false, { persist: false });
          try { T.setFamily(family, { persist: false }); } catch (e) { if (!nier) throw e; }
          if (nier && !(H.getAttribute('data-theme') || '').startsWith('nier') && N) await N.set(true, { persist: false });
        }
      } catch (e) { W.console.error('Settings managers concept: could not set the look', id, e); }
      for (let i = 0; i < 40 && !is(); i++) await wait(100);
    }
    await wait(300);
    SMX.tick(true);
    report('look-done');
  }
  SMX.setLook = setLook;

  function pagesForHost() {
    const out = [{ group: 'Start', route: 'home', title: 'Settings Home' }];
    const ctx = { st: SMX.st(), local: SMX.local };
    for (const c of SMX.chapters) for (const p of SMX.pages) {
      if (p.chapter !== c.id || p.id.includes(':')) continue;
      if (p.id !== c.id && !p.nav) continue;
      out.push({ group: c.title, route: p.id, title: p.id === c.id ? 'Overview' : (typeof p.nav === 'function' ? p.nav(ctx) : p.nav) });
    }
    for (const j of (SMX.jumps || [])) out.push(j);
    return out;
  }

  function command(m) {
    switch (m.cmd) {
      case 'hello': report('ready', { pages: pagesForHost() }); break;
      case 'view': SMX.setView(m.view); break;
      case 'go': if (SMX.view !== 'new') SMX.setView('new'); if (typeof m.route === 'string' && m.route.startsWith('do:')) { const f = SMX.acts[m.route.slice(3)]; if (f) f(D.body, null); } else SMX.go(m.route); break;
      case 'changes': if (SMX.view === 'new') { SMX.showChanges(); report('state'); } break;
      case 'moved': if (SMX.view !== 'new') SMX.setView('new'); SMX.showMoved(); report('state'); break;
      case 'look': setLook(m.look); break;
      case 'escape': if (SMX.layerOpen) { SMX.closeLayer(); report('state'); } else if (SMX.details && SMX.details.shown()) SMX.details.close(); break;
      case 'motion': H.setAttribute('data-motion', m.reduced ? 'reduced' : ''); if (!m.reduced) H.removeAttribute('data-motion'); SMX.reduced = !!m.reduced; break;
      case 'reset': try { W.PM12_KIMI.reset(); } catch (e) { /* engine not ready */ } SMX.resetLocal(); SMX.search && SMX.search.reset(); SMX.setView('new'); SMX.go('home', { replace: true }); SMX.toast('Demo reset', 'Every example value is back where it started.', 'info'); break;
      default: break;
    }
  }
  W.addEventListener('message', (ev) => { const m = ev.data; if (m && typeof m === 'object' && m.source === 'smx-host' && m.cmd) command(m); });
  SMX.command = command;

  const ready = () => H.getAttribute('data-pmr-ready') === '1' && W.PM51 && W.PM12_KIMI && W.PM_PAGES && W.PM_THEME && D.getElementById('pm-settings-root') && W.PM51.placement && W.PM51.placement.byId;
  async function boot() {
    for (let i = 0; i < 400 && !ready(); i++) await wait(100);
    if (!ready()) { W.console.error('Settings managers concept: PMConcept7 did not become ready'); return; }
    // onboarding may still own the window on a first visit: the concept opens on the app
    for (let i = 0; i < 40; i++) { try { if (W.PM_PAGES.current !== 'settings') W.PM_PAGES.go('settings'); } catch (e) { /* the page switcher may still be starting */ } await wait(120); if (W.PM_PAGES.current === 'settings' && D.getElementById('pm-settings-root').querySelector('.pm-shell')) break; }
    await wait(400);
    const cfg = {};
    const hm = /[#&]smx=([^&]*)/.exec(W.location.hash || '');
    if (hm) decodeURIComponent(hm[1]).split(',').forEach((kv) => { const i = kv.indexOf('='); if (i > 0) cfg[kv.slice(0, i)] = kv.slice(i + 1); });
    if (!SMX.start(cfg.route || 'home')) { W.console.error('Settings managers concept: could not mount'); return; }
    H.setAttribute('data-smx-layer', 'on');
    if (cfg.view === 'today') SMX.setView('today');
    if (cfg.look && cfg.look !== look()) await setLook(cfg.look);
    if (cfg.panel === 'moved') SMX.showMoved();
    if (cfg.panel === 'changes') SMX.showChanges();
    report('ready', { pages: pagesForHost() });
    // keys for the person reviewing, when the focus is inside PMConcept7 and not in a field
    D.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || /input|select|textarea/i.test((e.target && e.target.tagName) || '') || (e.target && e.target.isContentEditable)) return;
      if (W.parent === W) return;
      if (e.key === 'R') SMX.setView('new'); else if (e.key === 'T') SMX.setView('today');
    });
  }
  boot();
})(window);
