/* Project picker concepts (Opus 5.5): new looks for PMConcept7's title-bar project box, beside the Pip logo.
   Runs inside PMConcept7, added at runtime by index.html (PMConcept7 itself is not edited). It keeps PMConcept7's own
   button, label, menu and handlers: choosing a project, the hover engine, the menu's open and close and the chosen row's
   switcher material all stay PMConcept7's. This file adds parts around them; picker.css draws them from PMConcept7's
   tokens (--pm-switch-*, --text-*, --border), and every icon comes from PMConcept7's one glyph registry (window.PMG).

   Options (html[data-ppk]):
     tab    One of the tabs: the page tabs' height, type and ink; the chip when open.
     crumb  Breadcrumb: Puppet Master / tastebook, no box until the pointer or the menu.
     plate  Plate: a two-line plate with a monogram tile, the name and its path.
     sign   Pip's sign: the project name on a card Pip holds up on a string; Pip's face is the project's state. */
(function (W) {
  'use strict';
  const D = W.document, H = D.documentElement;
  if (W.PPK) return;

  // the three projects PMConcept7's menu lists, with the path summary the title bar must show (FinalGUISpec 3.4)
  const INFO = {
    tastebook: { path: '~/Projects/tastebook', branch: 'main', stack: 'SvelteKit · Axum · Postgres' },
    harbor: { path: '~/Projects/harbor', branch: 'develop', stack: 'Next.js · Nest' },
    loom: { path: '~/Projects/loom', branch: 'main', stack: 'Rust · Slint' }
  };
  const LONG = 'tastebook-mobile-companion';
  // the badge the title bar shows when the active project needs attention (FinalGUISpec 3.4), as the shared status marks
  const STATES = {
    calm: null,
    working: { key: 'working', word: 'Working', say: '2 runs in the background', mood: 'dots' },
    needs: { key: 'waiting', word: 'Needs you', say: 'Blocked: 1 item needs you', mood: 'alert' },
    unsaved: { key: 'change-modified', word: 'Unsaved', say: 'Unsaved layout changes', mood: 'watch' }
  };
  const OTHERS = { harbor: 'working', loom: 'calm' };
  const OPTIONS = ['tab', 'crumb', 'plate', 'sign'];
  const S = { opt: 'tab', state: 'calm', long: false, before: false };

  const $ = (id) => D.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = (n, px) => (W.PMG && W.PMG.icon ? W.PMG.icon(n, px) : '');
  const mark = (key, px, calm) => (W.PMG ? (calm ? W.PMG.calm(key, px) : W.PMG.status(key, px)) : '');
  const el = (tag, cls, html) => { const e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const reduced = () => H.getAttribute('data-motion') === 'reduced' || (W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const stepped = () => H.getAttribute('data-o55-nier') === 'on' || /^retro/.test(H.getAttribute('data-theme') || '');

  function current() {
    const sel = D.querySelector('#projectMenu .pm6-tb-menu-item.is-selected[data-project]');
    return (sel && sel.getAttribute('data-project')) || 'tastebook';
  }
  const display = (id) => (S.long && id === 'tastebook' ? LONG : id);
  const stateOf = (id) => (id === current() ? S.state : (OTHERS[id] || 'calm'));

  /* ------------------------------------------------------------------ the logo: Pip beside the wordmark */
  function logoKey() {
    const t = H.getAttribute('data-theme') || 'basic-dark';
    return H.getAttribute('data-o55-nier') === 'on' ? 'nier-' + (/-light$/.test(t) ? 'light' : 'dark') : t;
  }
  function paintLogo() {
    const name = D.querySelector('.title-bar .app-name'), L = W.PMLogo;
    if (!name || !L) return;
    const key = logoKey(), st = STATES[S.state], mood = S.opt === 'sign' && !S.before && st ? st.mood : 'idle';
    const sig = `${key}|${mood}`;
    if (name.dataset.ppkLogo === sig) return;
    name.dataset.ppkLogo = sig;
    name.classList.add('ppk-logo');
    try { H.style.setProperty('--ppk-string', L.kit.solidStr(L.THEMES[key] || L.THEMES['basic-dark'])); } catch (e) { /* the token default stands */ }
    name.innerHTML = `<span class="ppk-pip">${L.svg({ mark: 'pip', theme: L.THEMES[key] ? key : 'basic-dark', px: 24, dpr: W.devicePixelRatio || 1, mood, decorative: true })}</span><span class="ppk-word">Puppet Master</span>`;
    requestAnimationFrame(placeStrings);
  }

  /* ------------------------------------------------------------------ the trigger */
  function build() {
    const btn = $('projectMenuBtn'), label = $('projectMenuLabel'), wrap = $('projectMenuWrap'), menu = $('projectMenu');
    if (!btn || !label || !wrap || !menu) return false;
    if (btn.querySelector('.ppk-lead')) return true;
    const text = el('span', 'ppk-text');
    btn.insertBefore(text, label);
    text.appendChild(label);
    text.appendChild(el('span', 'ppk-sub'));
    btn.insertBefore(el('span', 'ppk-lead'), text);
    btn.appendChild(el('span', 'ppk-badge'));
    btn.appendChild(el('span', 'ppk-chev', icon('chevron-down', 14)));
    // Pip's sign hangs from a hook above its middle: two short strings from the hook to the card's corners
    btn.appendChild(el('span', 'ppk-hang', '<i></i><i></i><b></b>'));
    wrap.insertBefore(el('span', 'ppk-slash', '/'), btn);
    btn.querySelector('.ppk-lead').setAttribute('aria-hidden', 'true');
    wrap.querySelector('.ppk-slash').setAttribute('aria-hidden', 'true');
    // the long string, from the right tip of Pip's control to the sign's hook, drawn over the title bar
    const svg = D.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ppk-string'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<path fill="none"/><rect width="3" height="3"/>';
    D.body.appendChild(svg);

    /* the menu: a heading with the switch shortcut, two-line rows, and a way to every project */
    const head = el('div', 'ppk-mhead', '<span>Projects</span><span class="ppk-keys"><kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>P</kbd></span>');
    head.setAttribute('role', 'presentation');
    menu.insertBefore(head, menu.firstChild);
    const foot = el('div', 'ppk-mfoot');
    foot.setAttribute('role', 'none');
    const all = el('button', 'pm6-tb-menu-item ppk-all', `<span class="ppk-mono ppk-mono-ico">${icon('grid', 14)}</span><span class="ppk-mtext"><b>All projects</b><small>Open the Projects page</small></span><span class="ppk-mstate">${icon('arrow-right', 13)}</span>`);
    all.type = 'button'; all.setAttribute('role', 'menuitem');
    all.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      D.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      const t = $('tab-projects'); if (t) t.click();
    });
    foot.appendChild(all);
    menu.appendChild(foot);

    // PMConcept7 rewrites the label when a project is chosen; the rest follows it
    new MutationObserver(() => { if (!S.syncing) refresh(); }).observe(label, { childList: true, characterData: true, subtree: true });
    new MutationObserver(refreshOpen).observe(btn, { attributes: true, attributeFilter: ['aria-expanded'] });
    new MutationObserver(() => { if (!S.syncing) refresh(); }).observe(menu, { attributes: true, subtree: true, attributeFilter: ['class'] });
    new MutationObserver(() => requestAnimationFrame(placeStrings)).observe(wrap, { attributes: true, attributeFilter: ['data-mode'] });
    if (W.ResizeObserver) new W.ResizeObserver(() => placeStrings()).observe(btn);
    W.addEventListener('resize', placeStrings);
    // FinalGUISpec's keyboard entry for switching projects: Ctrl+Shift+P opens this menu
    D.addEventListener('keydown', (e) => {
      if (S.before || !(e.ctrlKey || e.metaKey) || !e.shiftKey || (e.key !== 'P' && e.key !== 'p')) return;
      e.preventDefault();
      if (btn.getAttribute('aria-expanded') !== 'true') btn.click();
      const first = menu.querySelector('.pm6-tb-menu-item.is-selected') || menu.querySelector('.pm6-tb-menu-item');
      if (first) setTimeout(() => first.focus({ preventScroll: true }), 30);
    });
    return true;
  }

  function rowHtml(id) {
    const info = INFO[id] || { path: '~/Projects/' + id, branch: 'main', stack: '' };
    const st = STATES[stateOf(id)];
    const name = display(id);
    return `<span class="ppk-mono">${esc(name.charAt(0).toUpperCase())}</span>` +
      `<span class="ppk-mtext"><b>${esc(name)}</b><small>${esc(info.path)} · ${esc(info.branch)}</small></span>` +
      `<span class="ppk-mstate">${st ? mark(st.key, 12, true) + `<span>${esc(st.word)}</span>` : ''}</span>`;
  }

  function refresh() {
    const btn = $('projectMenuBtn'), label = $('projectMenuLabel'), menu = $('projectMenu');
    if (!btn || !label || !menu) return;
    S.syncing = true;
    try {
      const id = current(), info = INFO[id] || { path: '~/Projects/' + id, branch: 'main' }, st = STATES[S.state], name = display(id);
      if (label.textContent !== name) label.textContent = name;
      // (each part is rewritten only when it changes: the hover engine's class flips reach here too)
      const put = (sel, sig, html) => { const n = btn.querySelector(sel); if (n.dataset.sig !== sig) { n.dataset.sig = sig; n.innerHTML = html; } };
      const mono = S.opt === 'plate' || S.opt === 'sign';
      put('.ppk-lead', mono ? 'm' + name.charAt(0) : 'folder', mono ? `<span class="ppk-mono">${esc(name.charAt(0).toUpperCase())}</span>` : icon('folder', 15));
      put('.ppk-sub', id, esc(`${info.path} · ${info.branch}`));
      // the badge: the shared status mark, never a coloured dot of its own; Pip's sign shows it on Pip's face instead
      put('.ppk-badge', `${S.opt === 'sign' ? '' : S.state}`, st && S.opt !== 'sign' ? mark(st.key, 12, st.key === 'change-modified') : '');
      btn.setAttribute('data-ppk-state', S.state);
      const say = `${name}${st ? ' · ' + st.say : ''}`;
      btn.setAttribute('aria-label', `Project: ${say}. Switch project`);
      btn.setAttribute('data-pm-hover-label', 'Switch project · Ctrl+Shift+P');
      btn.setAttribute('data-pm-hover-detail', `${info.path} on ${info.branch}${st ? ' · ' + st.say : ''}`);
      menu.querySelectorAll('.pm6-tb-menu-item[data-project]').forEach((it) => {
        const pid = it.getAttribute('data-project'), sig = `${pid}|${display(pid)}|${stateOf(pid)}`;
        if (it.dataset.ppk !== sig) { it.dataset.ppk = sig; it.innerHTML = rowHtml(pid); }
      });
    } finally { S.syncing = false; }
    paintLogo();
    requestAnimationFrame(placeStrings);
  }

  function refreshOpen() {
    const btn = $('projectMenuBtn');
    if (!btn) return;
    // Pip's sign swings once when it is picked up; nothing swings in reduced motion
    if (S.opt === 'sign' && btn.getAttribute('aria-expanded') === 'true') swing(btn, 0.6);
  }
  function swing(btn, k) {
    if (reduced() || S.before || !btn.animate) return;
    const a = 2.6 * k;
    btn.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${a}deg)` }, { transform: `rotate(${-a * 0.55}deg)` }, { transform: `rotate(${a * 0.25}deg)` }, { transform: 'rotate(0deg)' }],
      { duration: 900, easing: stepped() ? 'steps(4, end)' : 'ease-in-out' });
  }

  /* the long string: Pip's control tip to the sign's hook, a gentle sag, redrawn whenever either one moves */
  function placeStrings() {
    const svg = D.querySelector('svg.ppk-string'), btn = $('projectMenuBtn'), pip = D.querySelector('.title-bar .app-name .ppk-pip svg');
    if (!svg) return;
    const show = S.opt === 'sign' && !S.before && btn && pip && $('projectMenuWrap').getAttribute('data-mode') !== 'icon';
    svg.style.display = show ? 'block' : 'none';
    if (!show) return;
    const p = pip.getBoundingClientRect(), b = btn.getBoundingClientRect(), bar = D.querySelector('.title-bar').getBoundingClientRect();
    // the line runs along the bar's top edge, clear of the wordmark: up from the right tip of Pip's control (about 86%
    // across and 17% down the 24 px mark, pm-logo.js's crossed sticks), then straight to a hook over the card
    const yR = bar.top + 3.5, x0 = p.left + p.width * 0.86, y0 = p.top + p.height * 0.17;
    const hx = b.left + b.width / 2, rise = Math.max(0, y0 - yR);
    svg.querySelector('path').setAttribute('d', `M${x0.toFixed(1)} ${y0.toFixed(1)}L${(x0 + rise).toFixed(1)} ${yR.toFixed(1)}H${hx.toFixed(1)}`);
    const r = svg.querySelector('rect'); r.setAttribute('x', (hx - 1.5).toFixed(1)); r.setAttribute('y', (yR - 1.5).toFixed(1));
    // from the hook, a wire to the card's two top corners, 9 px in from each side; the card swings about the hook
    const drop = b.top - yR, w = btn.offsetWidth, dx = Math.max(4, w / 2 - 9), dy = drop + 1;
    btn.style.setProperty('--ppk-hang-top', (-drop).toFixed(1) + 'px');
    btn.style.setProperty('--ppk-hang-l', Math.hypot(dx, dy).toFixed(1) + 'px');
    btn.style.setProperty('--ppk-hang-a', (Math.atan2(dx, dy) * 180 / Math.PI).toFixed(1) + 'deg');
    btn.style.transformOrigin = `50% ${(-drop).toFixed(1)}px`;
  }

  /* ------------------------------------------------------------------ switching looks the way a person does */
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  async function setLook(id) {
    const nier = /^nier-/.test(id), mode = /-light$/.test(id) ? 'light' : 'dark', fam = nier ? 'basic' : id.split('-')[0];
    const tb = $('themeSelect'); if (!tb) return;
    const open = async () => { if (tb.getAttribute('aria-expanded') !== 'true') { tb.click(); await wait(90); } };
    const pick = async (sel) => { await open(); const b = D.querySelector(sel); if (b && b.getAttribute('aria-checked') !== 'true') { b.click(); await wait(160); } };
    const nierOn = () => !!(W.PM_NIER && W.PM_NIER.on());
    const flipNier = async () => { await open(); const t = D.querySelector('#themeMenu [data-o55-nier-tt="toggle"]'); if (t) { t.click(); await wait(220); } };
    if (!nier && nierOn()) await flipNier();
    await pick(`#themeMenu .pm6-tt-family[data-family="${fam}"]`);
    await pick(`#themeMenu .pm6-tt-mode[data-mode-value="${mode}"]`);
    if (nier && !nierOn()) await flipNier();
    D.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await wait(120);
    paintLogo(); refresh();
  }

  /* ------------------------------------------------------------------ API for index.html */
  function apply() {
    if (S.before) H.removeAttribute('data-ppk'); else H.setAttribute('data-ppk', S.opt);
    const name = D.querySelector('.title-bar .app-name');
    if (name) delete name.dataset.ppkLogo;
    refresh();
    tabsMoved();
    report('state');
  }
  /* The title bar lays out the logo, this box and then the page tabs, so whenever the box changes width (another option,
     another project's name, a long name, the density fold) the tabs move and the chosen tab's ink has to follow them.
     PMConcept7 re-measures its ink and its title-bar density on a window resize; one is sent per frame at most. */
  let lastW = -1, pending = false;
  function tabsMoved() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => requestAnimationFrame(() => { pending = false; W.dispatchEvent(new Event('resize')); }));
  }
  function watchWidth() {
    const wrap = $('projectMenuWrap');
    if (!wrap || !W.ResizeObserver) return;
    new W.ResizeObserver(() => {
      const w = Math.round(wrap.getBoundingClientRect().width);
      if (Math.abs(w - lastW) >= 1) { lastW = w; tabsMoved(); }
    }).observe(wrap);
  }
  const API = {
    OPTIONS, STATES: Object.keys(STATES),
    set(opt) { if (OPTIONS.indexOf(opt) >= 0) { S.opt = opt; S.before = false; apply(); } },
    before(on) { S.before = !!on; apply(); },
    state(s) { if (s in STATES) { S.state = s; apply(); } },
    long(on) { S.long = !!on; apply(); },
    config(c) {
      if (c.opt === 'before') S.before = true; else if (OPTIONS.indexOf(c.opt) >= 0) { S.opt = c.opt; S.before = false; }
      if (c.state in STATES) S.state = c.state;
      if (typeof c.long === 'boolean') S.long = c.long;
      apply();
    },
    look: setLook,
    open() { const b = $('projectMenuBtn'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); },
    close() { D.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); },
    get: () => ({ opt: S.opt, before: S.before, state: S.state, long: S.long, look: logoKey() })
  };

  /* The page around PMConcept7 (index.html) speaks by message only: in a sandboxed preview the two have different origins,
     and neither can reach into the other. */
  function report(type) { if (W.parent !== W) { try { W.parent.postMessage({ source: 'ppk', type, state: API.get() }, '*'); } catch (e) { /* no parent */ } } }
  W.addEventListener('message', async (ev) => {
    const m = ev.data;
    if (!m || m.source !== 'ppk-host' || ev.source !== W.parent) return;
    if (m.cmd === 'hello') report('ready');
    else if (m.cmd === 'config') API.config(m);
    else if (m.cmd === 'look') { await API.look(m.look); report('look-done'); }
    else if (m.cmd === 'menu') { API.close(); await wait(120); API.open(); }
    else if (m.cmd === 'motion') { if (m.reduced) H.setAttribute('data-motion', 'reduced'); else if (H.getAttribute('data-motion') === 'reduced') H.removeAttribute('data-motion'); }
  });
  // 1 to 4 pick an option and 0 shows today's box, here too (never while typing, never with a modifier)
  D.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
    const t = e.target, tag = (t && t.tagName) || '';
    if (/input|select|textarea/i.test(tag) || (t && t.isContentEditable)) return;
    const map = { 1: 'tab', 2: 'crumb', 3: 'plate', 4: 'sign', 0: 'before' };
    if (map[e.key]) API.config({ opt: map[e.key] });
  });

  function boot(n) {
    if (!build() || !W.PMG) { if (n < 100) setTimeout(() => boot(n + 1), 100); return; }
    W.PPK = API;
    new MutationObserver(() => { const nm = D.querySelector('.title-bar .app-name'); if (nm) delete nm.dataset.ppkLogo; paintLogo(); refresh(); report('state'); })
      .observe(H, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier'] });
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(placeStrings);
    watchWidth();
    apply();
    W.dispatchEvent(new CustomEvent('ppk:ready'));
    report('ready');
  }
  boot(0);
})(window);
