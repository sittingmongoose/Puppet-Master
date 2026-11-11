/* Settings managers, rethought (Fable 5.2): core.
   A new Settings view that lives inside the real PMConcept7. It hides PMConcept7's own Settings shell and draws its own
   navigation and pages in a node the Settings engine leaves alone (data-o55-foreign). Pages are composed from the real
   kit: every setting row is PM51's own row, bound to the same setting id, so every control, guided flow, side panel and
   menu is PMConcept7's and nothing is re-implemented or dropped. What is new is where things are and how each page is
   laid out. The engine is kept parked on its Home view so no row is mounted twice.

   window.SMX
     .chapter({id, title, icon, group, blurb, status(ctx)})         a chapter of the navigation
     .page({id, chapter, nav, parent, title, purpose, lead(ctx), sections, more, expert, tail(ctx), covers, changes, legacy})
     .go(route, {reveal})   .back()   .tick()                        navigation and redraw
     .st()                  a snapshot of the engine's state        .local   this concept's own demo state
     .act(name, fn)         a click handler for data-smx-do="name"
   Routes: 'home', '<chapter>', '<chapter>/<page>', '<chapter>/<page>/<thing id>' (a page id may end in '/:id'). */
(function (W) {
  'use strict';
  if (W.SMX) return;
  const D = W.document;
  const SMX = W.SMX = { version: 'fable-5.2-1', chapters: [], pages: [], acts: {}, booted: false };
  const kit = () => W.PM51, eng = () => W.PM12_KIMI;

  /* ------------------------------------------------------------------ small helpers */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const attrs = (o) => Object.entries(o || {}).filter(([, v]) => v !== false && v != null).map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`)).join('');
  const data = (o) => Object.entries(o || {}).filter(([, v]) => v != null && v !== false).map(([k, v]) => ` data-${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}="${esc(v)}"`).join('');
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  /* n painted frames (or a short timer where frames are not running, as in a tab in the background) */
  const frames = (n) => new Promise((res) => {
    let i = 0, done = false;
    const end = () => { if (!done) { done = true; res(); } };
    const f = () => (++i >= n ? end() : W.requestAnimationFrame(f));
    W.requestAnimationFrame(f); W.setTimeout(end, 40 * n + 80);
  });
  const fn = (v, ...a) => (typeof v === 'function' ? v(...a) : v);
  SMX.h = esc; SMX.attrs = attrs; SMX.data = data; SMX.wait = wait;

  /* icons: a few of our own, then the Settings kit's set (PM51.icon) */
  const ICONS = {
    computer: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    laptop: '<path d="M5 6h14v9H5z"/><path d="M2.5 18.5h19l-1.5-3.5H4z"/>',
    nas: '<rect x="4" y="3.5" width="16" height="7" rx="1.6"/><rect x="4" y="13.5" width="16" height="7" rx="1.6"/><path d="M8 7h.01M8 17h.01M12 7h4M12 17h4"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.4"/><path d="M11 18.5h2"/>',
    cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 10.5a4 4 0 0 1 0 8z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-1.9 0-.6-.3-1-.6-1.4-.3-.4-.5-.8-.5-1.3 0-1 .8-1.9 1.9-1.9H17a4 4 0 0 0 4-4c0-4.2-4-7.5-9-7.5z"/><circle cx="7.5" cy="11.5" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    wallet: '<path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M4 7V6a2 2 0 0 1 2-2h10v3M16 13.5h2"/>',
    puzzle: '<path d="M9 4h4v3a1.5 1.5 0 1 0 3 0V4h4v6h-2a2 2 0 1 0 0 4h2v6H4V4z" transform="scale(.92) translate(1 1)"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 15h9"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M8 12h2l1.2-2 1.6 4 1.2-2h2"/>',
    box: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
    plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
    wand: '<path d="m4 20 11-11M14 5l1-2 1 2 2 1-2 1-1 2-1-2-2-1zM18 13l.6-1.4L20 11l-1.4-.6L18 9l-.6 1.4L16 11l1.4.6z"/>',
    swap: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    go: '<path d="m9 5 7 7-7 7"/>',
    fold: '<path d="m9 5 7 7-7 7"/>',
    here: '<circle cx="12" cy="10" r="3"/><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/>',
    notes: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7M9 7h3"/>',
    people: '<circle cx="9" cy="9" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="8" r="2.4"/><path d="M15.5 14.2A5 5 0 0 1 21 19"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>'
  };
  SMX.icon = (name, cls) => {
    if (ICONS[name]) return `<span class="icon ${cls || ''}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg></span>`;
    try { return kit().icon(name, cls || ''); } catch (e) { return ''; }
  };

  /* ------------------------------------------------------------------ the engine's state, and this concept's own */
  let snap = null, snapAt = 0;
  SMX.st = () => { const now = W.performance.now(); if (!snap || now - snapAt > 40) { snap = eng().getState(); snapAt = now; } return snap; };
  SMX.fresh = () => { snap = null; return SMX.st(); };
  SMX.val = (id) => { try { return kit().value(id); } catch (e) { return undefined; } };
  SMX.has = (id) => { try { return !!kit().setting(id); } catch (e) { return false; } };
  const LOCAL0 = () => ({ openMore: {}, flags: {} });
  SMX.local = LOCAL0();
  SMX.resetLocal = () => { SMX.local = LOCAL0(); };

  /* ------------------------------------------------------------------ registry */
  SMX.chapter = (def) => { SMX.chapters.push(def); return def; };
  SMX.page = (def) => {
    def.pattern = def.id.split('/');
    SMX.pages.push(def);
    return def;
  };
  SMX.act = (name, f) => { SMX.acts[name] = f; };
  const chapterOf = (id) => SMX.chapters.find((c) => c.id === id);
  function match(route) {
    const parts = String(route || 'home').split('/').filter(Boolean);
    for (const p of SMX.pages) {
      if (p.pattern.length !== parts.length) continue;
      const params = {}; let ok = true;
      for (let i = 0; i < parts.length; i++) {
        if (p.pattern[i][0] === ':') params[p.pattern[i].slice(1)] = decodeURIComponent(parts[i]);
        else if (p.pattern[i] !== parts[i]) { ok = false; break; }
      }
      if (ok) return { page: p, params };
    }
    return null;
  }
  SMX.match = match;
  /* The managers of PMConcept7 a page stands for: its own `legacy`, or that of the nearest page above it (the page of
     one sound stands for the manager its list stands for). */
  const stands = (route) => {
    const parts = String(route || '').split('/').filter(Boolean);
    for (let n = parts.length; n > 0; n--) { const m = match(parts.slice(0, n).join('/')); if (m && m.page.legacy && m.page.legacy.length) return m.page.legacy; }
    return [];
  };
  SMX.stands = stands;

  /* ------------------------------------------------------------------ placement: where every setting id is drawn
     A page lists the ids it draws (sections, more, expert) or names one of PMConcept7's own sections with SMX.from(),
     which resolves to that section's ids minus any id another page names outright. SMX.where(id) answers for search,
     for links and for the "Everything that moved" list; SMX.coverage() says what is drawn nowhere or twice. */
  SMX.from = (...sectionIds) => ({ from: sectionIds, minus: [] });
  let PLACE = null;
  function resolvePlacement() {
    const P = kit().placement, all = Object.keys(P.byId).concat((SMX.handIds || []).filter((id) => !P.byId[id] && SMX.has(id)));
    const claimed = new Map();   // id -> {route, section, level, how}
    const dup = [];
    const claim = (id, rec) => { if (claimed.has(id)) dup.push([id, claimed.get(id).route, rec.route]); else claimed.set(id, rec); };
    const groups = (p) => [['main', p.sections || []], ['more', p.more || []], ['expert', p.expert || []]];
    // 1. ids a page names outright, and ids it says it draws its own way
    for (const p of SMX.pages) {
      for (const [level, list] of groups(p)) for (const s of list) if (Array.isArray(s.ids)) for (const id of s.ids) claim(id, { route: p.id, section: s.title || '', level });
      for (const [id, how] of Object.entries(p.covers || {})) claim(id, { route: p.id, section: '', level: 'drawn', how });
    }
    // 2. whole sections taken from PMConcept7, minus what was claimed above
    const bySection = {};
    for (const id of all) { const sec = P.sectionOf(id); const key = sec && sec.id ? sec.id : ''; (bySection[key] = bySection[key] || []).push(id); }
    for (const p of SMX.pages) {
      for (const [level, list] of groups(p)) for (const s of list) {
        if (!s.ids || Array.isArray(s.ids)) continue;
        const want = [];
        for (const sid of s.ids.from) for (const id of (bySection[sid] || [])) if (!claimed.has(id) && !(s.ids.minus || []).includes(id)) want.push(id);
        s.resolved = want;
        for (const id of want) claim(id, { route: p.id, section: s.title || '', level });
      }
    }
    const missing = all.filter((id) => !claimed.has(id));
    PLACE = { claimed, missing, dup, all };
    return PLACE;
  }
  SMX.placement = () => PLACE || resolvePlacement();
  SMX.where = (id) => SMX.placement().claimed.get(id) || null;
  /* a link to the row of a setting, wherever its home is: ui.btn(Object.assign({label}, SMX.at(id))), ui.word(text, SMX.at(id)) */
  SMX.at = (id) => { const w = SMX.where(id); return w ? { go: w.route, reveal: id } : {}; };
  SMX.idsOf = (s) => (Array.isArray(s.ids) ? s.ids : (s.resolved || [])).filter((id) => SMX.has(id));
  SMX.coverage = () => { const p = SMX.placement(); return { total: p.all.length, placed: p.claimed.size, missing: p.missing.slice(), twice: p.dup.slice() }; };
  /* The plan can place a setting on a page whose section then fails to draw it. This opens every page in turn and
     lists the settings that are planned as a row there but have no row on the page: [[route, id, section]]. */
  SMX.undrawn = () => {
    if (!host) return [];
    const here = SMX.route, out = [];
    const P = SMX.placement();
    const byRoute = {};
    for (const [id, rec] of P.claimed) if (rec.level !== 'drawn') (byRoute[rec.route] = byRoute[rec.route] || []).push([id, rec.section]);
    for (const p of SMX.pages) {
      if (p.id.includes(':') || !byRoute[p.id]) continue;
      try { SMX.go(p.id, { replace: true }); } catch (e) { out.push([p.id, '(the page failed to draw: ' + e.message + ')', '']); continue; }
      // a section that shows only in some state (the extras of one look) is not missing while that state is off
      const cond = new Set();
      for (const list of [p.sections, p.more, p.expert]) for (const s of (list || [])) if (s.when) for (const id of SMX.idsOf(s)) cond.add(id);
      for (const [id, section] of byRoute[p.id]) if (!cond.has(id) && !host.querySelector('#setting-' + W.CSS.escape(id))) out.push([p.id, id, section]);
    }
    SMX.go(here, { replace: true });
    return out;
  };
  /* where PMConcept7 draws a setting today, in words */
  SMX.oldHome = (id) => {
    const P = kit().placement, e = P.byId[id];
    if (!e) { const hnd = (SMX.handHomes || {})[id]; return hnd ? { domain: '', workspace: hnd[0], tab: '', section: hnd[1], advanced: false } : null; }
    const sec = P.sectionOf(id);
    return { domain: e.domain || '', workspace: e.workspace || '', tab: e.tab || '', section: (sec && sec.label) || '', advanced: !!(e.advanced || (sec && sec.advanced)) };
  };

  /* ------------------------------------------------------------------ mount, and the two views (redesign / today) */
  let host = null, root = null, navEl = null, mainEl = null, scrollEl = null, layerEl = null;
  SMX.view = 'new';
  function mount() {
    root = D.getElementById('pm-settings-root');
    if (!root || host) return !!host;
    host = D.createElement('div');
    host.id = 'smx-root'; host.className = 'smx'; host.setAttribute('data-o55-foreign', '');
    host.innerHTML = '<aside class="smx-nav" aria-label="Settings"></aside><main class="smx-main"><div class="smx-scroll" tabindex="-1"></div></main><div class="smx-layer"></div>';
    root.insertBefore(host, root.firstChild);   // first, so a setting's row here is the one the engine refreshes
    navEl = host.querySelector('.smx-nav'); mainEl = host.querySelector('.smx-main'); scrollEl = host.querySelector('.smx-scroll'); layerEl = host.querySelector('.smx-layer');
    host.addEventListener('click', onClick);
    host.addEventListener('input', onInput);
    host.addEventListener('change', onChange);
    host.addEventListener('keydown', onKey);
    for (const ev of ['click', 'change', 'input', 'keyup', 'focusout']) host.addEventListener(ev, () => soon(), true);
    let intent = 0;
    const warmable = (t) => { const b = t && t.closest && t.closest('[data-smx-do]'); return b && SMX.warmers[b.getAttribute('data-smx-do')] ? b : null; };
    const warmUp = (b) => { try { SMX.warm(SMX.warmers[b.getAttribute('data-smx-do')](b)); } catch (e) { /* it opens on the click instead */ } };
    host.addEventListener('pointerover', (e) => { W.clearTimeout(intent); const b = warmable(e.target); if (b) intent = W.setTimeout(() => { if (b.isConnected) warmUp(b); }, 70); });
    host.addEventListener('pointerout', () => W.clearTimeout(intent));
    host.addEventListener('focusin', (e) => { const b = warmable(e.target); if (b) warmUp(b); });
    scrollEl.addEventListener('scroll', () => { try { kit().closePopouts(); } catch (e) { /* none open */ } }, { passive: true });
    // PMConcept7 closes an open menu when anything at all scrolls, even a list on a page that is not showing. A menu
    // opened from these pages closes only when what scrolled moves the button it hangs from.
    let pressed = null;
    const inOverlay = (t) => !!(t && t.closest && t.closest('.pm51-popout, #pm-settings-portals'));
    D.addEventListener('click', (e) => { pressed = e.target; if (inOverlay(e.target)) usedAt = W.performance.now(); }, true);
    D.addEventListener('keydown', (e) => { if (e.key === 'Enter' && inOverlay(e.target)) usedAt = W.performance.now(); }, true);
    // Escape puts away the search results or a review panel wherever the focus is (it used to need the focus inside
    // these pages), unless a menu, dialog or panel of PMConcept7's is open: that one closes first, by its own handler.
    D.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || SMX.view !== 'new' || !layerEl || !layerEl.firstChild) return;
      if (menuOpen() || D.querySelector('#pm-settings-portals .drawer-wrap.is-open, #pm-settings-portals [role="dialog"]')) return;
      const q = navEl && navEl.querySelector('[data-smx-search]');
      if (SMX.layerOpen === 'find' && q) { q.value = ''; SMX.query = ''; }
      closeLayer(); e.stopPropagation(); SMX.report && SMX.report('state');
    }, true);
    W.addEventListener('scroll', (e) => {
      const pop = SMX.view === 'new' && menuOpen();
      const t = e.target;
      if (!pop || !t || t.nodeType !== 1 || pop.contains(t)) return;
      if (pressed && pressed.isConnected && host.contains(pressed) && !t.contains(pressed)) e.stopPropagation();
    }, true);
    const portals = D.getElementById('pm-settings-portals');
    if (portals) new W.MutationObserver(() => soon(120)).observe(portals, { childList: true, subtree: false });
    setView('new');
    return true;
  }
  /* Keep the engine on its Home view while the redesign shows: no setting row is then mounted in its hidden shell.
     PMConcept7 goes Home a frame or more AFTER it is asked (it animates the way out, kit.d/29-navigation-motion.js) and
     drops the trip when anything else navigates meanwhile. Until it has arrived, the place it is leaving is not a place
     it was "sent to", and tick must not follow it there (the page used to jump to the manager a menu was borrowed from;
     found by the Web research builder). */
  let leaving = null, usedAt = -1e9;   // usedAt: when one of PMConcept7's own menus, dialogs or panels was last pressed
  function park() {
    try {
      const st = SMX.fresh();
      if (st.home) { leaving = null; return; }
      const now = W.performance.now();
      leaving = { domain: st.domain, ws: st.workspace, detail: st.detailSetting || '', at: now, asked: now };
      eng().dispatchAction('home');
    } catch (e) { /* engine not ready */ }
  }
  /* While the trip is on, PMConcept7 marks its own Home buttons. Its hidden page also names "the manager at the reading
     line" as it redraws and scrolls, and for a moment that can be a neighbour in the same chapter: that is not a place
     the engine was sent to either (a saved sound dialog threw the page to Help & hints; found by the Notifications
     builder). Another chapter, or a setting it now points at, is. */
  const tripMarked = () => !!(root && root.querySelector('[data-action="home"][data-o55-nav-pending]'));
  const placeMode = () => { try { return (kit().place && kit().place.mode) || ''; } catch (e) { return ''; } };
  function onTheWayHome(st) {
    if (!leaving) return false;
    const now = W.performance.now();
    if (st.home || now - leaving.at > 2500) { leaving = null; return false; }
    if (tripMarked()) return true;
    const sent = st.domain !== leaving.domain || (st.detailSetting || '') !== leaving.detail;
    if (sent || (st.workspace !== leaving.ws && now - leaving.at > 900)) { leaving = null; return false; }   // follow it
    if (now - leaving.asked > 120) { leaving.asked = now; try { eng().dispatchAction('home'); } catch (e) { /* engine not ready */ } }   // the trip was dropped: ask again
    return true;
  }
  function setView(v) {
    SMX.view = v === 'today' ? 'today' : 'new';
    if (!root) return;
    root.classList.toggle('smx-on', SMX.view === 'new');
    D.documentElement.setAttribute('data-smx-view', SMX.view);
    if (SMX.view === 'new') { leaving = null; SMX.tick(true); }   // tick goes to the page that holds the place "Today" was showing, then parks
    else {
      // show PMConcept7's own Settings at the place that matches the current page, when the page names one
      const lg = stands(SMX.route)[0];
      try { if (lg) { eng().navigate(lg[0], lg[1]); if (lg[2]) setTimeout(() => eng().dispatchAction('pm51-tab', { manager: lg[3] || lg[1], tab: lg[2] }), 350); } } catch (e) { /* stay where it is */ }
    }
    SMX.report && SMX.report('state');
  }
  SMX.setView = setView;
  /* opened without the review strip (the page on its own), "Today" needs its own way back */
  const backBtn = () => {
    let b = D.getElementById('smx-back-btn');
    if (SMX.view === 'today' && W.parent === W) {
      if (!b) { b = D.createElement('button'); b.id = 'smx-back-btn'; b.type = 'button'; b.textContent = 'Back to the redesign'; b.addEventListener('click', () => { setView('new'); backBtn(); }); D.body.appendChild(b); }
    } else if (b) b.remove();
  };
  SMX.act('see-today', () => { setView('today'); backBtn(); });

  /* ------------------------------------------------------------------ router */
  SMX.route = 'home';
  const trail = [];   // [{route, top}] for Back
  SMX.go = (route, opts = {}) => {
    route = String(route || 'home').replace(/^\/+|\/+$/g, '') || 'home';
    let m = match(route);
    if (!m) { m = match('home'); route = 'home'; }
    if (route !== SMX.route && !opts.replace) trail.push({ route: SMX.route, top: scrollEl ? scrollEl.scrollTop : 0 });
    if (trail.length > 40) trail.shift();
    SMX.route = route;
    SMX.reveal = opts.reveal || '';
    SMX.anchor = opts.anchor || '';
    closeLayer();
    render(true);
    if (scrollEl && !opts.keepScroll) scrollEl.scrollTop = typeof opts.top === 'number' ? opts.top : 0;
    if (SMX.reveal) setTimeout(() => revealSetting(SMX.reveal), 60);
    else if (SMX.anchor) setTimeout(() => { const n = host.querySelector(`[data-smx-anchor="${W.CSS.escape(SMX.anchor)}"]`); if (n) { for (let d = n.closest('details'); d; d = d.parentElement && d.parentElement.closest('details')) d.open = true; bring(n, 'start'); } }, 60);
    SMX.report && SMX.report('state');
  };
  SMX.back = () => { const t = trail.pop(); if (t) SMX.go(t.route, { replace: true, top: t.top }); else { const m = match(SMX.route); SMX.go((m && (m.page.parent || m.page.chapter)) || 'home', { replace: true }); } };
  /* Bring a node into view by moving the page's own scroller. scrollIntoView also scrolls the app's window (the title
     bar slid out by 47 px), and nothing brought it back; found by the Memory builder. */
  function bring(n, where) {
    if (!n || !scrollEl) return;
    const a = n.getBoundingClientRect(), b = scrollEl.getBoundingClientRect();
    scrollEl.scrollTop += where === 'center' ? (a.top + a.height / 2) - (b.top + b.height / 2) : a.top - b.top - 10;
  }
  SMX.bring = bring;
  function revealSetting(id) {
    const row = host.querySelector(`[id="setting-${W.CSS.escape(id)}"], [data-setting-id="${W.CSS.escape(id)}"], [data-smx-covers~="${W.CSS.escape(id)}"]`);
    if (!row) return false;
    for (let d = row.closest('details'); d; d = d.parentElement && d.parentElement.closest('details')) d.open = true;
    bring(row, 'center');
    row.classList.add('smx-flash'); setTimeout(() => row.classList.remove('smx-flash'), 1800);
    return true;
  }
  SMX.revealSetting = revealSetting;
  /* a place in PMConcept7's own Settings -> the page that now holds it */
  /* the page that stands for a place in PMConcept7: the one that names that tab; else the FIRST that names the whole
     manager (the chapter's own page comes first in the plan; it used to be the last, a sub-page); else any tab's page */
  SMX.fromLegacy = (domain, ws, tab) => {
    let whole = null, some = null;
    for (const p of SMX.pages) for (const l of (p.legacy || [])) {
      if (l[1] !== ws) continue;
      if (tab && l[2] === tab) return p.id;
      if (!l[2]) { if (!whole) whole = p.id; } else if (!some) some = p.id;
    }
    return whole || some;
  };

  /* ------------------------------------------------------------------ drawing */
  const ctxOf = (m) => ({ st: SMX.st(), params: m.params, route: SMX.route, local: SMX.local, page: m.page });
  SMX.tone = (t) => ({ ready: 'ready', ok: 'ready', attention: 'attention', warn: 'attention', off: 'off', info: 'info', blocked: 'blocked', error: 'blocked' }[t] || 'off');
  function navHtml(cur) {
    const curCh = cur.page.chapter;
    const st = SMX.st(); const ctx = { st, local: SMX.local };
    const out = [];
    out.push(`<div class="smx-nav-head"><div class="smx-nav-title">Settings</div><div class="smx-nav-sub">${esc(SMX.projectLine ? SMX.projectLine(st) : '')}</div></div>`);
    out.push(`<label class="smx-search">${SMX.icon('search')}<input type="search" autocomplete="off" spellcheck="false" placeholder="Search settings" aria-label="Search settings" data-smx-search value="${esc(SMX.query || '')}"></label>`);
    out.push('<nav class="smx-nav-list">');
    out.push(`<button type="button" class="smx-nav-item smx-nav-home${cur.page.id === 'home' ? ' is-current' : ''}" data-smx-go="home">${SMX.icon('home')}<span>Home</span></button>`);
    let group = '';
    for (const c of SMX.chapters) {
      if (c.group !== group) { group = c.group; out.push(`<div class="smx-nav-group">${esc(group)}</div>`); }
      const open = c.id === curCh;
      let status = null; try { status = c.status ? c.status(ctx) : null; } catch (e) { status = null; }
      const mark = status && status.tone && status.tone !== 'ready' && status.tone !== 'off' ? `<span class="smx-nav-mark tone-${SMX.tone(status.tone)}" title="${esc(status.text || '')}"></span>` : '';
      out.push(`<div class="smx-nav-ch${open ? ' is-open' : ''}"><button type="button" class="smx-nav-item${cur.page.id === c.id ? ' is-current' : ''}${open ? ' is-open' : ''}" data-smx-go="${esc(c.id)}"${open ? ' aria-expanded="true"' : ' aria-expanded="false"'}>${SMX.icon(c.icon)}<span>${esc(c.title)}</span>${mark}</button>`);
      if (open) {
        const pages = SMX.pages.filter((p) => p.chapter === c.id && p.nav && p.id !== c.id && !p.id.includes(':'));
        if (pages.length) out.push(`<div class="smx-nav-pages">${pages.map((p) => { const here = cur.page.id === p.id || cur.page.parent === p.id; return `<button type="button" class="smx-nav-page${here ? ' is-current' : ''}" data-smx-go="${esc(p.id)}"><span>${esc(fn(p.nav, ctx))}</span></button>`; }).join('')}</div>`);
      }
      out.push('</div>');
    }
    out.push('</nav>');
    return out.join('');
  }
  function crumbsHtml(m, ctx) {
    const p = m.page; let items = [];
    const ch = chapterOf(p.chapter);
    if (p.id === 'home') return '';
    if (p.crumbs) items = p.crumbs(ctx) || [];
    else {
      if (ch && p.id !== ch.id) items.push([ch.id, ch.title]);
      if (p.parent && p.parent !== (ch && ch.id)) { const pm = match(p.parent); if (pm) items.push([p.parent, fn(pm.page.nav || pm.page.title, ctx)]); }
    }
    if (!items.length) return '';
    return `<nav class="smx-crumbs" aria-label="You are in"><button type="button" class="smx-back" data-smx-do="back" aria-label="Back">${SMX.icon('back')}</button>${items.map(([r, t]) => `<button type="button" class="smx-crumb" data-smx-go="${esc(r)}">${esc(t)}</button><span class="smx-crumb-sep" aria-hidden="true">›</span>`).join('')}<span class="smx-crumb-here">${esc(fn(p.nav || p.title, ctx))}</span></nav>`;
  }
  /* the blocks of a page, in order: [{key, html, fixed}] ; fixed blocks hold the kit's own rows and are drawn once */
  const hash = (t) => { let x = 5381; for (let i = 0; i < t.length; i++) x = ((x << 5) + x + t.charCodeAt(i)) | 0; return (x >>> 0).toString(36) + '.' + t.length; };
  function blocksOf(m, ctx) {
    const p = m.page; const out = [];
    // two blocks with one key would be drawn as one (the second would replace the first): the later one gets a suffix
    const seen = new Set();
    const uniq = (b) => { let k = b.key, n = 1; while (seen.has(k)) k = `${b.key}~${++n}`; seen.add(k); b.key = k; return b; };
    const glue = (html) => html.replace(/(<button type="button" class="smx-word"[^>]*>[^<]*<\/button>)([.,;:!?])/g, '<span class="smx-nb">$1$2</span>');
    const push = (b) => { if (b && b.html) { b.html = glue(b.html); out.push(uniq(b)); } };
    const lead = p.lead ? p.lead(ctx) : [];
    for (const b of (lead || [])) push(b);
    // A planned page whose manager draws lists and cards of its own, not rebuilt in this cut: say so, and give the way
    // to them, so nothing PMConcept7 offers is out of reach from here.
    // (a planned page with no rows at all is such a page too: everything on it is its manager's own drawing)
    const bare = !((p.sections || []).length + (p.more || []).length + (p.expert || []).length);
    if (SMX.ui && (p.pending || (p.planned && !p.extended))) push({ key: 'pending', html: SMX.ui.pending(p, bare) });
    const sec = (s, i, level) => {
      if (s.when && !s.when(ctx)) return null;
      if (s.html) return { key: `${level}-${s.key || i}`, html: `<div data-smx-anchor="${esc(s.key || '')}"${s.count ? ` data-smx-count="${Number(s.count) || 0}"` : ''}>${fn(s.html, ctx)}</div>`, fixed: !!s.fixed };
      const ids = SMX.idsOf(s);
      // `also`: settings that belong with these rows but have their home on another page; said in words, with the way there
      const also = s.also && SMX.ui ? SMX.ui.elsewhere(s.also, { title: s.alsoTitle || (ids.length ? 'Part of this, decided on another page' : s.title || 'Decided on another page'), help: s.alsoHelp || '', here: p.id }) : '';
      if (!ids.length && !also) return null;
      let html = '';
      if (ids.length) { try { html = kit().settingRows(ids, { title: s.title || '', help: s.help || '' }); } catch (e) { html = ''; } }
      if (!html && !also) return null;
      return { key: `${level}-${s.key || i}`, html: `<div data-smx-anchor="${esc(s.key || '')}">${html}${also}</div>`, fixed: true, sig: ids.join(',') + (also ? '|' + hash(also) : '') };
    };
    (p.sections || []).forEach((s, i) => push(sec(s, i, 'main')));
    const fold = (list, level, label, help) => {
      const parts = (list || []).map((s, i) => sec(s, i, level)).filter(Boolean).map(uniq);
      if (!parts.length) return;
      const key = `${p.id}:${level}`; const open = !!SMX.local.openMore[key];
      // the rows it holds NOW: a section that shows only in some state (the extras of one look) is not counted while it is off
      const count = (list || []).reduce((n, s) => n + (s.when && !s.when(ctx) ? 0 : s.html ? (s.count || 0) : SMX.idsOf(s).length), 0);
      const said = (n) => (n ? ` · ${n} setting${n === 1 ? '' : 's'}` : '');
      // a part is redrawn when its words change, not only when their length does (a count going from 3 to 4 stayed 3)
      out.push({ key: `${level}-fold`, fixed: true, sig: parts.map((x) => x.key + ':' + (x.sig || hash(x.html))).join('|') + (open ? ':o' : ':c'),
        html: `<details class="smx-fold smx-fold-${level}"${open ? ' open' : ''} data-smx-fold="${esc(key)}"><summary>${SMX.icon('fold')}<span class="smx-fold-label">${esc(label)}</span><span class="smx-fold-help">${esc(help)}<span class="smx-fold-count">${said(count)}</span></span></summary><div class="smx-fold-body">${parts.map((x) => x.html).join('')}</div></details>` });
    };
    fold(p.more, 'more', p.moreLabel || 'More options', p.moreHelp || 'Less common choices');
    fold(p.expert, 'expert', p.expertLabel || 'For experts', p.expertHelp || 'Safe to leave alone');
    const tail = p.tail ? p.tail(ctx) : [];
    for (const b of (tail || [])) push(b);
    // a chapter's first page ends with the chapter's other pages, each with its state
    if (p.id === p.chapter && p.id !== 'home' && !p.noPagesList && SMX.ui) push({ key: 'chapter-pages', html: SMX.ui.pages(p.chapter, ctx, { title: 'Also in this chapter' }) });
    return out;
  }
  let drawn = { route: null, keys: [], html: {}, sig: {} };
  const typingIn = (n) => { const a = D.activeElement; return !!a && n.contains(a) && a.matches('input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]') && !a.matches('[data-smx-search], [data-smx-input]'); };
  function render(force) {
    if (!host || SMX.view !== 'new') return;
    let m = match(SMX.route); if (!m) { SMX.route = 'home'; m = match('home'); }
    if (!m) return;
    const ctx = ctxOf(m);
    // navigation
    const nh = navHtml(m);
    if (nh !== drawn.nav) {
      const q = navEl.querySelector('[data-smx-search]'); const hadFocus = q && D.activeElement === q; const pos = hadFocus ? q.selectionStart : 0;
      navEl.innerHTML = nh; drawn.nav = nh;
      if (hadFocus) { const q2 = navEl.querySelector('[data-smx-search]'); if (q2) { q2.focus(); try { q2.setSelectionRange(pos, pos); } catch (e) { /* not a text field */ } } }
    }
    // page
    const p = m.page;
    const fresh = force || drawn.route !== SMX.route;
    let pageEl = scrollEl.firstElementChild;
    if (fresh || !pageEl) {
      scrollEl.innerHTML = `<div class="smx-page manager-page pm51-mgr${p.cls ? ' ' + p.cls : ''}" data-smx-route="${esc(SMX.route)}"><div class="smx-page-top"></div><div class="smx-blocks"></div></div>`;
      pageEl = scrollEl.firstElementChild; drawn.route = SMX.route; drawn.keys = []; drawn.html = {}; drawn.sig = {}; drawn.top = null;
    }
    const top = `${crumbsHtml(m, ctx)}<header class="smx-head"><div class="smx-head-copy"><h1 class="smx-title">${esc(fn(p.title, ctx))}</h1>${p.purpose ? `<p class="smx-purpose">${esc(fn(p.purpose, ctx))}</p>` : ''}</div>${p.headSide ? `<div class="smx-head-side">${p.headSide(ctx)}</div>` : ''}</header>`;
    if (top !== drawn.top) { pageEl.querySelector('.smx-page-top').innerHTML = top; drawn.top = top; }
    const blocks = blocksOf(m, ctx);
    const wrap = pageEl.querySelector('.smx-blocks');
    const keys = blocks.map((b) => b.key);
    // remove what is gone
    for (const k of drawn.keys) if (!keys.includes(k)) { const n = wrap.querySelector(`:scope > [data-smx-block="${W.CSS.escape(k)}"]`); if (n) n.remove(); delete drawn.html[k]; delete drawn.sig[k]; }
    let prev = null;
    for (const b of blocks) {
      let n = wrap.querySelector(`:scope > [data-smx-block="${W.CSS.escape(b.key)}"]`);
      const sig = b.fixed ? (b.sig || 'fixed') : b.html;
      if (!n) {
        n = D.createElement('div'); n.className = 'smx-block'; n.setAttribute('data-smx-block', b.key); n.innerHTML = b.html;
        drawn.html[b.key] = b.html; drawn.sig[b.key] = sig;
      } else if (drawn.sig[b.key] !== sig && typingIn(n)) {
        /* someone is typing or dragging in this block: redrawing it would take the field from under the caret (a
           nickname lost focus after two letters). It is redrawn when the field is left. */
      } else if (drawn.sig[b.key] !== sig) {
        const act = D.activeElement && n.contains(D.activeElement) ? D.activeElement : null;
        const focusKey = act ? (act.getAttribute('data-smx-key') || act.id || '') : '';
        n.innerHTML = b.html; drawn.html[b.key] = b.html; drawn.sig[b.key] = sig;
        if (focusKey) { const again = n.querySelector(`[data-smx-key="${W.CSS.escape(focusKey)}"]`) || (focusKey && D.getElementById(focusKey)); if (again && n.contains(again)) again.focus({ preventScroll: true }); }
      }
      // keep order
      const want = prev ? prev.nextElementSibling : wrap.firstElementChild;
      if (want !== n) wrap.insertBefore(n, want);
      prev = n;
    }
    drawn.keys = keys;
    recount(wrap);
  }
  /* A fold says how many rows it holds NOW. PMConcept7 hides a row while what it depends on is off (the strength of an
     effect that is switched off), so the number is counted from the rows on the page, not from the plan: "6 settings"
     used to open on 4 rows. A part drawn by hand counts as it declares (count: n) unless it holds more rows than that. */
  function recount(wrap) {
    wrap.querySelectorAll(':scope > .smx-block > details[data-smx-fold]').forEach((d) => {
      const out = d.querySelector(':scope > summary .smx-fold-count'); const body = d.querySelector(':scope > .smx-fold-body'); if (!out || !body) return;
      let n = 0;
      for (const part of body.children) { const rows = part.querySelectorAll('.setting-row:not(.o55-dep-off)').length; n += Math.max(rows, Number(part.getAttribute('data-smx-count')) || 0); }
      const text = n ? ` · ${n} setting${n === 1 ? '' : 's'}` : '';
      if (out.textContent !== text) out.textContent = text;
    });
  }
  SMX.render = render;

  /* redraw soon after anything happens; the engine patches its own rows, this redraws the parts that are ours */
  let timer = 0, timer2 = 0, timer3 = 0, unsure = 0;
  const again = (ms) => { W.clearTimeout(timer3); timer3 = W.setTimeout(() => SMX.tick(), ms); };
  function soon(ms) { W.clearTimeout(timer); timer = W.setTimeout(() => SMX.tick(), ms || 40); W.clearTimeout(timer2); timer2 = W.setTimeout(() => SMX.tick(), 420); }
  SMX.soon = soon;
  SMX.tick = (force) => {
    if (!host || SMX.view !== 'new') return;
    snap = null;
    let st; try { st = SMX.st(); } catch (e) { return; }
    // the engine was sent somewhere (a link inside a flow, the title bar's search): follow it to the page that holds it now
    if (!st.home && !SMX.borrowing && onTheWayHome(st)) again(70);
    else if (!st.home && !SMX.borrowing) {
      let tab = ''; try { tab = (st.pm51 && st.pm51.tabs && st.pm51.tabs[st.workspace]) || ''; } catch (e) { tab = ''; }
      const reveal = st.detailSetting && SMX.where(st.detailSetting) ? st.detailSetting : '';
      const own = stands(SMX.route);
      const mine = own.some((lg) => lg[0] === st.domain && lg[1] === st.workspace);
      const near = !mine && own.some((lg) => lg[0] === st.domain);
      /* This page stands for another manager of the PMConcept7 chapter the engine is in, and it points at no setting.
         - Right after one of PMConcept7's dialogs, panels or menus was used, that is its hidden page redrawn by what
           was saved (it redraws at the chapter's top and names the first manager there): the person stays here.
         - While a jump is still landing there, the name may be a neighbour's: believe it once the landing has rested. */
      if (!reveal && near && W.performance.now() - usedAt < 2500) { unsure = 0; park(); }
      else if (!reveal && near && placeMode() === 'nav' && unsure < 8) { unsure++; again(80); }
      else {
        unsure = 0;
        const to = SMX.fromLegacy(st.domain, st.workspace, tab);
        park();
        if (reveal) SMX.go(SMX.where(reveal).route, { reveal });
        else if (to && to !== SMX.route && !mine) SMX.go(to);
      }
    }
    render(!!force);
  };

  /* ------------------------------------------------------------------ events */
  function onClick(e) {
    const t = e.target;
    const go = t.closest('[data-smx-go]');
    // a button or control that sits inside a row that opens does its own job only (it used to open the row as well)
    const inner = t.closest('button, a, input, select, textarea, label, [data-action], [data-smx-do], [role="switch"], [role="button"]');
    if (go && inner && inner !== go && go.contains(inner)) { /* the inner control's own handlers take it from here */ }
    else if (go && host.contains(go)) { e.preventDefault(); closeTheirs(); SMX.go(go.getAttribute('data-smx-go'), { reveal: go.getAttribute('data-smx-reveal') || '', anchor: go.getAttribute('data-smx-anchor-to') || '' }); return; }
    // a click anywhere but the results and the search box puts the results away
    if (SMX.layerOpen === 'find' && layerEl && !layerEl.contains(t) && !t.closest('[data-smx-search]')) closeLayer();
    if (t.closest('[data-smx-borrowed]')) return;   // a borrowed click on its way to the Settings engine
    const doer = t.closest('[data-smx-do]');
    if (doer && host.contains(doer)) {
      const name = doer.getAttribute('data-smx-do');
      if (name === 'back') { closeTheirs(); SMX.back(); return; }
      const f = SMX.acts[name];
      if (f) { e.preventDefault(); try { f(doer, e); } catch (err) { W.console.error('SMX action failed', name, err); } soon(); }
      return;
    }
    const sum = t.closest('summary');
    if (sum && sum.parentElement && sum.parentElement.hasAttribute('data-smx-fold')) {
      const d = sum.parentElement; setTimeout(() => { SMX.local.openMore[d.getAttribute('data-smx-fold')] = d.open; }, 0);
    }
  }
  /* One of PMConcept7's side panels (a test run's details) stays open until it is closed, and would lie over the page
     the person goes to next. Going somewhere by hand closes it the way a click beside it does. (A page change the
     engine asks for, in the middle of a guided flow, closes nothing.) */
  function closeTheirs() {
    try { kit().closePopouts(); } catch (e) { /* none open */ }
    D.querySelectorAll('#pm-settings-portals .drawer-wrap.is-open:not([data-closing])').forEach((w) => { try { w.dispatchEvent(new W.MouseEvent('mousedown', { bubbles: true, cancelable: true, view: W })); } catch (e) { /* it stays */ } });
  }
  SMX.closeTheirs = closeTheirs;
  function onInput(e) {
    const q = e.target.closest('[data-smx-search]');
    if (q) { SMX.query = q.value; SMX.search && SMX.search.show(q.value, q); }
    // a field of a page's own (a filter box): <input data-smx-input="name"> runs SMX.act('name') on every keystroke.
    // Keep the field in a block whose markup does not change as you type, so it is not redrawn under the caret.
    const own = e.target.closest('[data-smx-input]');
    if (own && host.contains(own)) { const f = SMX.acts[own.getAttribute('data-smx-input')]; if (f) { try { f(own, e); } catch (err) { W.console.error('SMX input failed', err); } } }
  }
  /* a dropdown of this concept's own (not one of the engine's settings): the wrapper names the handler */
  function onChange(e) {
    const w = e.target.closest('[data-smx-do-change]');
    if (!w || !host.contains(w)) return;
    const f = SMX.acts[w.getAttribute('data-smx-do-change')];
    if (f) { try { f(w, e); } catch (err) { W.console.error('SMX change failed', err); } soon(); }
  }
  function onKey(e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.smx-thing.is-clickable')) { e.preventDefault(); e.target.click(); return; }
    const q = e.target.closest && e.target.closest('[data-smx-search]');
    if (q && SMX.search) SMX.search.key(e);
  }

  /* ------------------------------------------------------------------ the layer above the page (search results, review notes) */
  function closeLayer() { if (layerEl) { layerEl.innerHTML = ''; layerEl.className = 'smx-layer'; } SMX.layerOpen = ''; }
  SMX.closeLayer = closeLayer;
  SMX.openLayer = (name, html, cls) => { if (!layerEl) return; layerEl.className = 'smx-layer is-open ' + (cls || ''); layerEl.innerHTML = html; SMX.layerOpen = name; };
  SMX.layer = () => layerEl;
  SMX.host = () => host;
  SMX.scroller = () => scrollEl;

  /* ------------------------------------------------------------------ calling PMConcept7's own actions
     A button that carries data-action is handled by the Settings engine itself (it is inside the engine's root), so a
     page just draws real kit buttons. SMX.run is for the few places a page calls an action from its own code. */
  SMX.run = (action, d) => { try { eng().dispatchAction(action, d || {}); } catch (e) { W.console.error('SMX.run failed', action, e); } soon(60); };
  SMX.toast = (title, body, tone) => { try { kit().toast(title, body || '', tone || 'success'); } catch (e) { /* no toast */ } };

  /* A few of PMConcept7's buttons (its "More actions" menus) exist only as functions made while a manager is drawn, so
     they have no action name to call. SMX.borrow finds that button in PMConcept7's own (hidden) manager and runs its
     handler with the button the person pressed here, so the real menu opens where they clicked and every item in it is
     PMConcept7's own. spec: {domain, ws, manager, tab, select: {action, data}, find: selector | (block) => element,
     mode: 'anchor' (default) | 'click'} */
  SMX.borrowing = false;
  let warm = null, lendGen = 0;   // warm: a manager made ready because the pointer rests on a button that borrows from it
  const menuOpen = () => D.querySelector('.pm51-popout.pm51-menu.is-open');
  const specKey = (spec) => JSON.stringify([spec.ws, spec.tab || '', spec.select ? spec.select.data : '']);
  const reach = (spec) => {
    const st = SMX.fresh();
    if (st.home || st.workspace !== spec.ws) eng().navigate(spec.domain, spec.ws);
    if (spec.tab) eng().dispatchAction('pm51-tab', { manager: spec.manager, tab: spec.tab });
    if (spec.select) eng().dispatchAction(spec.select.action, spec.select.data || {});
  };
  /* hand the engine back: it is parked again only once whatever opened has closed (parking closes menus and panels) */
  const release = (spec, after, had) => {
    const mine = ++lendGen;
    const showing = () => [...D.querySelectorAll('.pm51-popout, #pm-settings-portals > *')].some((n) => { const r = n.getBoundingClientRect(); return r.width > 4 && r.height > 4 && W.getComputedStyle(n).visibility !== 'hidden'; });
    let tries = 0;
    const settle = () => {
      if (mine !== lendGen) return;                                      // a newer borrow owns the engine now
      if (showing() && tries++ < 600) { W.setTimeout(settle, 400); return; }
      let st = null; try { st = SMX.fresh(); } catch (e) { st = null; }
      const away = !!st && !st.home;
      // sent elsewhere on purpose = another chapter of PMConcept7, or a setting it now points at. Another manager of the
      // SAME chapter is what its hidden page names after the borrowed dialog redrew it (see tick): not followed.
      const pointed = away && !!st.detailSetting && st.detailSetting !== (had || '');
      const moved = away && st.domain !== spec.domain;
      SMX.borrowing = false;
      if (moved || pointed) { leaving = null; soon(20); return; }
      park(); soon(60);
    };
    W.setTimeout(settle, after);
  };
  /* The manager a borrowed control lives in takes about half a second to draw. Resting the pointer on the button, or
     tabbing to it, starts that early, so the menu is there at once on the click. */
  SMX.warm = (spec) => {
    if (SMX.borrowing || SMX.view !== 'new') return;
    SMX.borrowing = true; lendGen++;
    try { reach(spec); } catch (e) { SMX.borrowing = false; return; }
    let had = ''; try { had = SMX.fresh().detailSetting || ''; } catch (e) { had = ''; }
    const w = warm = { key: specKey(spec), timer: W.setTimeout(() => { if (warm === w) { warm = null; release(spec, 0, had); } }, 3500) };
  };
  SMX.borrow = async (btn, spec) => {
    const ready = !!(warm && warm.key === specKey(spec));
    if (warm) { W.clearTimeout(warm.timer); warm = null; }
    else if (SMX.borrowing) { if (menuOpen()) { try { kit().closePopouts(); } catch (e) { /* none */ } } return false; }   // pressed again: the menu closes
    SMX.borrowing = true; lendGen++;
    let ok = false, scrolled = 0;
    const onScroll = () => { scrolled = W.performance.now(); };
    D.addEventListener('scroll', onScroll, true);
    btn.setAttribute('aria-busy', 'true');
    // going to a manager scrolls its page a moment later; wait until two frames pass with no scrolling, not a fixed pause
    const quiet = async () => { for (let i = 0; i < 30; i++) { await frames(2); if (W.performance.now() - scrolled > 50) return; } };
    /* PMConcept7 swaps a manager's detail with a short animation and keeps the one that is LEAVING in the page until it
       ends (kit.d/20-motion.js, o55Morph). A control in there belongs to the thing shown before: borrowed, its menu
       acts on that thing (a reset meant for one ability reset another; found by the Web research builder). What is
       leaving is taken out first, as PMConcept7 itself does when a second swap interrupts the first; none of it is on
       screen while the redesign shows. */
    const find = () => {
      const blk = [...root.querySelectorAll('.pm-shell .workspace-block')].find((b) => b.dataset.workspaceBlock === spec.ws);
      if (!blk) return null;
      blk.querySelectorAll('.o55-leaving').forEach((n) => n.remove());
      return typeof spec.find === 'function' ? spec.find(blk) : blk.querySelector(spec.find);
    };
    // the original's handler runs with the pressed button as its anchor: lend it the original's data, click, take it back
    const lend = (orig) => {
      const keep = {};
      for (const a of [...btn.attributes]) if (a.name.startsWith('data-')) { keep[a.name] = a.value; btn.removeAttribute(a.name); }
      for (const a of [...orig.attributes]) if (a.name.startsWith('data-') && !/^data-pm-hover/.test(a.name)) btn.setAttribute(a.name, a.value);
      btn.setAttribute('data-smx-borrowed', '1');
      btn.dispatchEvent(new W.MouseEvent('click', { bubbles: true, cancelable: true, view: W }));
      for (const a of [...btn.attributes]) if (a.name.startsWith('data-')) btn.removeAttribute(a.name);
      for (const [k, v] of Object.entries(keep)) btn.setAttribute(k, v);
    };
    let had = '';
    try {
      if (!ready) reach(spec);
      try { had = SMX.fresh().detailSetting || ''; } catch (e) { had = ''; }
      let orig = find();
      for (let i = 0; i < 25 && !orig; i++) { await quiet(); orig = find(); }
      if (!orig) throw new Error('the original control was not found: ' + (typeof spec.find === 'string' ? spec.find : 'by function'));
      if (spec.mode === 'click') orig.click();
      else {
        lend(orig);
        await frames(2);
        if (!menuOpen() && btn.isConnected) { await quiet(); orig = find(); if (orig && !menuOpen()) lend(orig); }   // closed under us: once more
      }
      ok = true;
    } catch (e) { W.console.error('SMX.borrow failed', e); SMX.toast('Not available in this preview', 'That menu could not be opened here.', 'info'); }
    D.removeEventListener('scroll', onScroll, true);
    btn.removeAttribute('aria-busy');
    release(spec, 700, had);
    return ok;
  };
  /* a page names a borrowed control once: the action that runs it and the warm-up share the same description */
  SMX.warmers = {};
  SMX.lends = (name, specOf) => { SMX.warmers[name] = specOf; SMX.act(name, (el) => SMX.borrow(el, specOf(el))); };

  SMX.start = (route) => {
    if (!mount()) return false;
    resolvePlacement();
    SMX.booted = true;
    SMX.go(route || 'home', { replace: true });
    W.setInterval(() => { if (SMX.view === 'new' && D.getElementById('panel-settings') && D.getElementById('panel-settings').offsetParent !== null) SMX.tick(); }, 1500);
    return true;
  };
})(window);
