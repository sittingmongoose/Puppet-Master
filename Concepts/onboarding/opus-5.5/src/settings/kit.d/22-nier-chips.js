/* O55 · NieR Mode's parts editor, drawn as the game's Plug-in Chips screen (an original design, not a copy of the game).
   Canon (Plans/Settings_System.md, NieR Mode Parts): a row editor for general.visual.nier-parts titled NieR Mode, not a
   manager; it adds no manager id, route, detail id or command id. The row "Customize NieR Mode" (rows.d
   60-app-input.json, `editor`) opens it in the Settings side sheet (PM51.panel), the same way the other structured
   rows open theirs.
     - each part is a chip in its group (Look, Motion, Sound & voice, Pointer, World) with one line of help, a size and
       Installed or Removed; a click installs or removes it at once through PM_NIER.setParts (the real settings path)
     - a storage meter "Installed N / 29" (cosmetic: no limit is enforced)
     - presets Full install (all 29), Quiet (no Menu sounds, Pod voice, Pod companion, Pod 042 in Chat), Still (no Motion
       part, no Pod companion, no Boot sequence) and Colors only (none)
     - a still preview tile at the top, drawn from the chips: a menu with the cursor, a header rule, a dialog band, a
       diamond, a block bar and the Pod, in the current look's colours
     - the NieR background (general.visual.nier-background) as thumbnails of PM_NIER_SCENES, and Play reboot moment
       (PM_NIER.replay)
     - a note on the Motion group while Reduce motion is on; a note and a switch while NieR Mode is off (the list can
       be edited for later)
   Styles: styles.d/17-nier-chips.css. The sheet follows the store's onChange while it is open and writes only what changed.
   The same markup renders in the Settings drawer (open), in a body-level dialog (popup) and inside any host (mount).
   Reads and writes go through a store: PM_NIER.store(kind) when that exists, otherwise localLiveStore() below, which
   commits through the existing PM_NIER API and o55NierCommitRow for the background. */
var localLiveStore;
(function o55NierChipsModule() {
  const ID = 'general.visual.nier-parts', BG = 'general.visual.nier-background';
  const NIER = () => window.PM_NIER || null;
  const SCENES = () => window.PM_NIER_SCENES || null;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const still = () => { try { return !!o55Still(); } catch (e) { return document.documentElement.getAttribute('data-motion') === 'reduced'; } };
  const GROUPS = ['Look', 'Motion', 'Sound & voice', 'Pointer', 'World'];
  const HELP = {
    square: ['Square corners and fine ink lines everywhere.', 4], cursor: ['The item under the pointer becomes an ink bar with a small cursor.', 5],
    headers: ['Section titles in wide capitals over a ruled line.', 4], ground: ['A faint grid behind the whole app.', 3],
    brackets: ['Four corner brackets mark what has keyboard focus.', 5], diamonds: ['Spinners become a slowly turning diamond.', 3],
    reboot: ['An ink band sweeps over the window when NieR Mode turns on or off.', 8], slice: ['Menus and dialogs open from a thin line.', 4],
    decode: ['Page titles and notices resolve from scrambled letters.', 5], wipe: ['A quick band crosses the page when you switch pages.', 4],
    particles: ['A few small ink squares drift behind the app.', 3], sweep: ['A faint line crosses the screen every few seconds.', 2],
    glitch: ['Warnings and errors arrive with a short jitter.', 4], sounds: ['Soft ticks and tones when you move and choose.', 5],
    voice: ['Notices begin with Report, Alert or Proposal.', 3],
    pod: ['A small Pod floats in the corner and delivers notices.', 6], pointer: ['The mouse pointer becomes a small ink square.', 2],
    boot: ['A short boot log when the app opens.', 5], readouts: ['The status bar reads like a unit’s status panel.', 4],
    blocks: ['Progress bars fill in blocks.', 3], charts: ['Charts in ink, told apart by patterns instead of colour.', 4],
    ticks: ['Map corner ticks and grid labels on cards and panels.', 2], glyphs: ['A faint strip of machine script under headers.', 2],
    intel: ['Hover tags become small intel cards.', 3], icons: ['Icons draw with square line ends.', 1],
    pod042: ['Adds Pod 042 to the personas in Chat.', 7], quests: ['A wide band when a plan is approved, a build finishes or the tour ends.', 5],
    empty: ['Small ink drawings on empty pages.', 4], save: ['Saving… and Data saved in the corner when a setting changes.', 2]
  };
  const PARTS = () => (NIER() ? NIER().PARTS : []);
  const all = () => PARTS().map(p => p.key);
  const PRESETS = [
    { id: 'full', label: 'Full install', help: 'Every part', keys: () => all() },
    { id: 'quiet', label: 'Quiet', help: 'No sounds, no Pod', keys: () => all().filter(k => !['sounds', 'voice', 'pod', 'pod042'].includes(k)) },
    { id: 'still', label: 'Still', help: 'Nothing moves', keys: () => PARTS().filter(p => p.group !== 'Motion' && p.key !== 'pod' && p.key !== 'boot').map(p => p.key) },
    { id: 'colors', label: 'Colors only', help: 'Just ink and parchment', keys: () => [] }
  ];
  const BG_TILES = [['Parchment', null], ['City Ruins', 'city'], ['The Bunker', 'bunker'], ['Desert', 'desert'], ['Forest Castle', 'forest'],
    ['Amusement Park', 'park'], ['Flooded City', 'flooded'], ['Follow the page', 'follow']];
  const same = (x, y) => x.length === y.length && x.every((v, i) => v === y[i]);
  const presetOf = keys => { const p = PRESETS.find(x => same(x.keys(), keys)); return p ? p.id : ''; };
  /* PM_NIER.store(kind) when the look layer provides it; otherwise the live fallback assigned to localLiveStore. */
  function storeFor(kind) {
    const N = window.PM_NIER;
    if (N && typeof N.store === 'function') {
      try { const s = N.store(kind || 'live'); if (s) return s; } catch (e) { /* fall through to the live store */ }
    }
    return localLiveStore();
  }
  function sceneTiles(store) {
    const labels = store && Array.isArray(store.BACKGROUNDS) && store.BACKGROUNDS.length ? store.BACKGROUNDS : BG_TILES.map(t => t[0]);
    return labels.map(label => { const known = BG_TILES.find(t => t[0] === label); return [label, known ? known[1] : null]; });
  }

  /* ---------- the row: a summary of the chips that opens the editor ------------------------------------------------- */
  const o55ncControl = renderControl;
  renderControl = function (setting, value) {
    if (!setting || setting.id !== ID || !NIER()) return o55ncControl.apply(this, arguments);
    const have = new Set((Array.isArray(value) ? value : []).map(String)), list = PARTS(), n = list.filter(p => have.has(p.label)).length;
    const cells = list.map(p => `<i${have.has(p.label) ? ' class="on"' : ''}></i>`).join('');
    const text = `${n} of ${list.length} parts installed`;
    return `<button type="button" class="o55-struct o55nc-open" data-action="open-structured-setting" data-setting="${esc(ID)}" aria-label="${esc(`Customize NieR Mode: ${text}. Open Plug-in Chips`)}">`
      + `<span class="o55-struct-copy"><span class="o55-struct-count">${esc(text)}</span><span class="o55nc-rowcells" aria-hidden="true">${cells}</span></span>${icon('edit')}</button>`;
  };

  /* ---------- the sheet ---------------------------------------------------------------------------------------------- */
  const POD = '<svg viewBox="0 0 40 52" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">'
    + '<path d="M3.5 13.5H8.5V30.5H3.5Z M31.5 13.5H36.5V30.5H31.5Z M8.5 18H9.5 M30.5 18H31.5 M6 10.5V13.5 M34 10.5V13.5"/>'
    + '<path d="M12.5 6.5H27.5L30.5 9.5V33.5L26.5 37.5H13.5L9.5 33.5V9.5Z M11 12.5H29 M13 27.5H27 M13 30.5H27 M15.5 37.5L17 41.5H23L24.5 37.5"/>'
    + '<path d="M15 18H25V21H15Z" fill="currentColor" stroke="none"/><path d="M14 47.5H26" opacity=".35"/></svg>';
  function preview() {
    return '<div class="o55nc-pv" aria-hidden="true">'
      + '<div class="o55nc-pv-head"><span>Unit status</span><i class="o55nc-pv-glyphs"></i></div>'
      + '<div class="o55nc-pv-body"><div class="o55nc-pv-menu"><span>Plans</span><span>Builds</span><span class="is-on">Plug-in Chips<i class="o55nc-pv-cur"></i>'
      + '<b class="o55nc-pv-br"></b><b class="o55nc-pv-br"></b><b class="o55nc-pv-br"></b><b class="o55nc-pv-br"></b></span></div>'
      + '<div class="o55nc-pv-dialog"><div class="o55nc-pv-band"><span class="o55nc-pv-v">Pod 042</span><span class="o55nc-pv-nv">Notice</span></div>'
      + '<p><span class="o55nc-pv-v">Report: </span>All parts nominal.</p><div class="o55nc-pv-bar"><i></i></div>'
      + '<div class="o55nc-pv-busy"><i class="o55nc-pv-spin"></i><span>Loading</span></div></div>'
      + `<div class="o55nc-pv-pod">${POD}</div></div></div>`;
  }
  function chip(p) {
    const [help, size] = HELP[p.key] || ['', 1];
    return `<button type="button" class="o55nc-chip" role="switch" aria-checked="false" data-o55nc-key="${esc(p.key)}" aria-label="${esc(p.label)}">`
      + '<span class="o55nc-chip-pins" aria-hidden="true"><i></i><i></i><i></i></span>'
      + `<span class="o55nc-chip-copy"><span class="o55nc-chip-name">${esc(p.label)}</span><span class="o55nc-chip-help">${esc(help)}</span>`
      + `<span class="o55nc-chip-foot"><span>Size ${size}</span><span class="o55nc-chip-state">Removed</span></span></span></button>`;
  }
  function body(store) {
    const list = PARTS();
    const groups = GROUPS.map(g => {
      const ps = list.filter(p => p.group === g); if (!ps.length) return '';
      const note = g === 'Motion' ? '<p class="o55nc-note o55nc-motion-note">Reduce motion is on, so these parts stay still. Your choices are kept for when it is off.</p>' : '';
      return `<section class="o55nc-group" data-o55nc-group="${esc(g)}"><header class="o55nc-ghead"><h4>${esc(g)}</h4><span class="o55nc-gcount"></span></header>${note}`
        + `<div class="o55nc-chips">${ps.map(chip).join('')}</div></section>`;
    }).join('');
    const tiles = sceneTiles(store).map(([label, key]) => `<button type="button" class="o55nc-scene" role="radio" aria-checked="false" data-o55nc-bg="${esc(label)}" data-key="${esc(key || 'plain')}">`
      + `<span class="o55nc-scene-art"></span><span class="o55nc-scene-name">${esc(label)}</span></button>`).join('');
    return '<div class="o55nc">'
      + `<div class="o55nc-top">${preview()}<div class="o55nc-side">`
      + `<div class="o55nc-meter"><div class="o55nc-meter-head"><span>Storage</span><b class="o55nc-meter-n"></b></div><div class="o55nc-meter-cells">${list.map(() => '<i></i>').join('')}</div></div>`
      + `<div class="o55nc-presets" role="group" aria-label="Presets">${PRESETS.map(p => `<button type="button" class="o55nc-preset" aria-pressed="false" data-o55nc-preset="${p.id}"><span>${esc(p.label)}</span><small>${esc(p.help)}</small></button>`).join('')}</div>`
      + '<button type="button" class="btn small o55nc-replay" data-o55nc-replay><span>Play reboot moment</span></button><p class="o55nc-replay-why"></p>'
      + '</div></div>'
      + '<div class="o55nc-off"><p>NieR Mode is off. The parts you install here show when you turn it on.</p><button type="button" class="btn small primary" data-o55nc-on>Turn on NieR Mode</button></div>'
      + groups
      + `<section class="o55nc-group o55nc-bg"><header class="o55nc-ghead"><h4>Background</h4><span>Behind the app while NieR Mode is on</span></header><div class="o55nc-scenes" role="radiogroup" aria-label="NieR background">${tiles}</div></section>`
      + '</div>';
  }

  /* thumbnails: the scene art drawn once as an image in the sheet's ink (an image cannot follow currentColor) */
  const thumbs = new Map();
  function thumb(key, ink) {
    const S = SCENES(); if (!S || !key || key === 'follow' || key === 'plain') return '';
    const id = key + '|' + ink; if (thumbs.has(id)) return thumbs.get(id);
    const svg = S.svg(key); if (!svg) return '';
    const uri = `url("data:image/svg+xml,${encodeURIComponent(svg.split('currentColor').join(ink))}")`;
    thumbs.set(id, uri);
    return uri;
  }

  function paint(wrap, store) {
    const box = wrap && store && wrap.querySelector('.o55nc'); if (!box) return;
    const raw = store.parts(), keys = Array.isArray(raw) ? raw : [], have = new Set(keys), list = PARTS(), on = !!store.on();
    const setA = (el, name, v) => { if (el.getAttribute(name) !== v) el.setAttribute(name, v); };
    setA(box, 'data-parts', keys.join(' '));
    box.toggleAttribute('data-nier-off', !on);
    box.toggleAttribute('data-still', still());
    box.querySelectorAll('.o55nc-chip').forEach(c => {
      const inst = have.has(c.dataset.o55ncKey);
      setA(c, 'aria-checked', String(inst));
      const st = c.querySelector('.o55nc-chip-state'), w = inst ? 'Installed' : 'Removed'; if (st.textContent !== w) st.textContent = w;
    });
    box.querySelectorAll('.o55nc-group[data-o55nc-group]').forEach(g => {
      const ks = list.filter(p => p.group === g.dataset.o55ncGroup).map(p => p.key), t = `${ks.filter(k => have.has(k)).length} / ${ks.length}`;
      const c = g.querySelector('.o55nc-gcount'); if (c && c.textContent !== t) c.textContent = t;
    });
    const n = box.querySelector('.o55nc-meter-n'), t = `Installed ${keys.length} / ${list.length}`; if (n.textContent !== t) n.textContent = t;
    box.querySelectorAll('.o55nc-meter-cells > i').forEach((c, i) => c.classList.toggle('on', i < keys.length));
    const pre = presetOf(keys);
    box.querySelectorAll('.o55nc-preset').forEach(b => setA(b, 'aria-pressed', String(b.dataset.o55ncPreset === pre)));
    const bg = store.background();
    box.querySelectorAll('.o55nc-scene').forEach(b => setA(b, 'aria-checked', String(b.dataset.o55ncBg === bg)));
    const rb = box.querySelector('[data-o55nc-replay]'), why = box.querySelector('.o55nc-replay-why');
    const reason = !have.has('reboot') ? 'Install Reboot moment to play it.' : still() ? 'Reduce motion is on, so it does not play.' : '';
    /* not the disabled property: the hover-tag layer turns a disabled button into a lasting aria-disabled one */
    setA(rb, 'aria-disabled', String(!!reason)); if (why.textContent !== reason) why.textContent = reason;
  }
  function paintThumbs(wrap) {
    const box = wrap.querySelector('.o55nc'); if (!box) return;
    let ink = ''; try { ink = getComputedStyle(box).color; } catch (e) { ink = ''; }
    if (!ink) return;
    box.querySelectorAll('.o55nc-scene').forEach(b => { const u = thumb(b.dataset.key, ink); if (u) b.querySelector('.o55nc-scene-art').style.backgroundImage = u; });
  }

  function onClick(e, wrap, store) {
    const t = e.target && e.target.closest ? e.target : null; if (!t || !store) return;
    const c = t.closest('.o55nc-chip');
    if (c) { const k = c.dataset.o55ncKey, have = new Set(store.parts()); if (have.has(k)) have.delete(k); else have.add(k); store.setParts([...have]); paint(wrap, store); return; }
    const p = t.closest('[data-o55nc-preset]');
    if (p) { const def = PRESETS.find(x => x.id === p.dataset.o55ncPreset); if (def) { store.setParts(def.keys()); paint(wrap, store); } return; }
    const s = t.closest('[data-o55nc-bg]');
    if (s) { const v = s.dataset.o55ncBg; if (v !== store.background()) store.setBackground(v); paint(wrap, store); return; }
    const r = t.closest('[data-o55nc-replay]');
    if (r) { if (r.getAttribute('aria-disabled') !== 'true') { const N = NIER(); if (N && typeof N.replay === 'function') N.replay(); } return; }
    if (t.closest('[data-o55nc-on]')) { store.set(true); paint(wrap, store); }
  }
  /* One editor in a host. destroy drops the store subscription immediately (popup and mount) or, for the drawer,
     on the next change after the host is gone, which is how the sheet closed before. */
  function bind(host, store) {
    const fire = e => onClick(e, host, store);
    host.addEventListener('click', fire);
    paint(host, store); paintThumbs(host);
    let off = () => {}, dead = false;
    if (store && typeof store.onChange === 'function') {
      const un = store.onChange(info => {
        if (!host.isConnected) { destroy(); return; }
        paint(host, store);
        if (info && (info.reason === 'mode' || (info.changed || []).includes('mode') || info.reason === 'on' || info.reason === 'off')) paintThumbs(host);
      });
      if (typeof un === 'function') off = un;
    }
    function destroy() {
      if (dead) return; dead = true;
      try { off(); } catch (e) { /* already dropped */ }
      off = () => {};
      host.removeEventListener('click', fire);
    }
    return { destroy };
  }
  function open() {
    if (!NIER()) return false;
    const store = storeFor('live');
    const wrap = PM51.panel({ title: 'NieR Mode', eyebrow: 'Plug-in Chips', icon: 'sliders', size: 'wide', cls: 'o55nc-panel', closeLabel: 'Done',
      summary: 'Install or remove each part. A change applies at once and is saved.', body: body(store) });
    if (!wrap) return false;
    bind(wrap, store);
    return true;
  }

  const POP_Z = 2147482050; /* below #o55np-reboot (2147483600), above the tour root (2147481500) and the title bar */
  let popApi = null;
  const reducedMotion = () => document.documentElement.getAttribute('data-motion') === 'reduced'
    || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const focusable = root => [...root.querySelectorAll('button, [href], input, select, textarea, [tabindex]')].filter(el => {
    if (el.disabled || el.getAttribute('aria-hidden') === 'true' || el.tabIndex < 0) return false;
    const s = getComputedStyle(el); return s.visibility !== 'hidden' && s.display !== 'none';
  });
  function restoreFocus(from) {
    if (from && from.isConnected && typeof from.focus === 'function') {
      try { from.focus(); } catch (e) { /* the menu may be closed */ }
      if (document.activeElement === from) return;
    }
    const btn = document.getElementById('themeSelect');
    if (btn) { try { btn.focus(); } catch (e) { /* leave focus where it is */ } }
  }
  /* The lead line under the title, the drawer's summary; a preview store's changes land with the look. */
  const LEAD_LIVE = 'Install or remove each part. A change applies at once and is saved.';
  const LEAD_PREVIEW = 'Install or remove each part. You see each change now; it is kept with your look when setup finishes.';
  const leadFor = store => (store && store.kind === 'preview' ? LEAD_PREVIEW : LEAD_LIVE);
  /* The page's hover/focus tag layer paints a label card over buttons; popup and mount opt out of it. */
  const exemptHover = root => root.querySelectorAll('button, [href], input, select, textarea, [tabindex]')
    .forEach(el => el.setAttribute('data-pm-hover-exempt', 'true'));
  function popup(opts) {
    opts = opts || {};
    if (popApi) popApi.close();
    const store = opts.store || storeFor('live');
    const title = opts.title ? String(opts.title) : 'NieR Mode';
    const lead = leadFor(store);
    const from = opts.from || null;
    const root = document.createElement('div');
    root.className = 'o55nc-pop'; root.id = 'o55nc-pop';
    root.innerHTML = `<div class="o55nc-pop-scrim" data-o55nc-pop="scrim"></div>`
      + `<div class="o55nc-pop-dialog o55nc-host" role="dialog" aria-modal="true" aria-labelledby="o55nc-pop-title" style="z-index:1">`
      + `<header class="o55nc-pop-head"><div class="o55nc-pop-titles"><p class="o55nc-pop-eye">Plug-in Chips</p>`
      + `<h2 class="o55nc-pop-title" id="o55nc-pop-title">${esc(title)}</h2><p class="pm51-hero-summary o55nc-pop-lead">${esc(lead)}</p></div>`
      + `<button type="button" class="o55nc-pop-x" data-o55nc-pop="close" aria-label="Close">`
      + `<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true" focusable="false"><path d="M3 3 L11 11 M11 3 L3 11" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/></svg>`
      + `</button></header><div class="o55nc-pop-body">${body(store)}</div>`
      + `<footer class="pm51-panel-foot o55nc-pop-foot"><button type="button" class="btn" data-o55nc-pop="close">Done</button></footer></div>`;
    exemptHover(root);
    root.style.zIndex = String(POP_Z);
    const dialog = root.querySelector('.o55nc-pop-dialog');
    let dead = false;
    let session = { destroy() {} };
    function onKey(e) {
      if (dead || !root.isConnected) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
      if (e.key !== 'Tab') return;
      const items = focusable(dialog);
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1], active = document.activeElement;
      if (e.shiftKey) { if (active === first || !dialog.contains(active)) { e.preventDefault(); last.focus(); } }
      else if (active === last || !dialog.contains(active)) { e.preventDefault(); first.focus(); }
    }
    function close() {
      if (dead) return; dead = true;
      document.removeEventListener('keydown', onKey, true);
      session.destroy();
      root.remove();
      if (popApi && popApi.close === close) popApi = null;
      restoreFocus(from);
    }
    root.addEventListener('click', e => {
      const hit = e.target && e.target.closest ? e.target.closest('[data-o55nc-pop="close"], [data-o55nc-pop="scrim"]') : null;
      if (hit) close();
    });
    document.addEventListener('keydown', onKey, true);
    if (reducedMotion()) root.dataset.open = 'true';
    document.body.appendChild(root);
    session = bind(dialog, store);
    if (!reducedMotion()) requestAnimationFrame(() => { if (root.isConnected) root.dataset.open = 'true'; });
    const x = root.querySelector('[data-o55nc-pop="close"]');
    if (x) { try { x.focus(); } catch (e) { /* the dialog is still the trap */ } }
    popApi = { close };
    return popApi;
  }
  function mount(host, opts) {
    opts = opts || {};
    if (!host || typeof host.appendChild !== 'function') return { unmount() {} };
    const store = opts.store || storeFor('live');
    host.classList.add('o55nc-host');
    const shell = document.createElement('div');
    shell.className = 'o55nc-mount';
    shell.innerHTML = `<p class="pm51-hero-summary o55nc-mount-lead">${esc(leadFor(store))}</p>` + body(store)
      + `<footer class="pm51-panel-foot o55nc-mount-foot"><button type="button" class="btn" data-o55nc-done>Done</button></footer>`;
    host.appendChild(shell);
    exemptHover(shell);
    const session = bind(shell, store);
    const done = shell.querySelector('[data-o55nc-done]');
    const onDone = () => { if (typeof opts.onClose === 'function') { try { opts.onClose(); } catch (e) { /* the host owns its own close */ } } };
    if (done) done.addEventListener('click', onDone);
    let dead = false;
    return { unmount() {
      if (dead) return; dead = true;
      session.destroy();
      if (done) done.removeEventListener('click', onDone);
      shell.remove();
      if (!host.querySelector('.o55nc')) host.classList.remove('o55nc-host');
      if (typeof opts.onClose === 'function') { try { opts.onClose(); } catch (e) { /* the host owns its own close */ } }
    } };
  }

  /* Live fallback until kit.d/18-nier.js exports PM_NIER.store. File 23 calls this same function. */
  localLiveStore = function () {
    const listeners = new Set();
    let upstream = null;
    const emit = info => listeners.forEach(cb => { try { cb(info); } catch (e) { /* one listener never blocks the rest */ } });
    function ensure() {
      if (upstream) return;
      const n = NIER();
      if (n && typeof n.onChange === 'function') upstream = n.onChange(emit);
    }
    function drop() {
      if (listeners.size || !upstream) return;
      try { upstream(); } catch (e) { /* already dropped */ }
      upstream = null;
    }
    return {
      kind: 'live',
      on: () => { const n = NIER(); return !!(n && n.on()); },
      set: on => { const n = NIER(); return !!(n && n.set(!!on)); },
      parts: () => { const n = NIER(); return n && n.parts ? n.parts().slice() : []; },
      setParts: keys => { const n = NIER(); return !!(n && n.setParts(keys)); },
      background: () => { const n = NIER(); return n && n.background ? n.background() : 'City Ruins'; },
      setBackground: label => {
        const n = NIER();
        if (n && typeof n.setBackground === 'function') return !!n.setBackground(label);
        return !!o55NierCommitRow(BG, label);
      },
      BACKGROUNDS: BG_TILES.map(t => t[0]),
      onChange: cb => {
        if (typeof cb !== 'function') return () => {};
        ensure(); listeners.add(cb);
        return () => { listeners.delete(cb); drop(); };
      }
    };
  };

  PM51.on('o55-nier-chips', () => open());
  window.PM_NIER_CHIPS = Object.freeze({
    open,
    popup,
    mount,
    presets: () => PRESETS.map(p => ({ id: p.id, label: p.label, keys: p.keys() }))
  });
})();
