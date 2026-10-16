/* O55 · Settings updates in place (M4, 2026-10-14). renderApp() used to replace the whole of Settings (rail, page, rows)
   on every call: a changed setting, a look or light/dark switch, a host projection, a manager's save. The new page
   started at the top, the reader's place was restored by number before late rows arrived, revealed sections played
   their entrance again, the Details panel sprang back in, focus fell to the page and hover was lost.
   Now a redraw that is not a navigation patches what is on screen: the engine still writes the whole page's markup,
   and the engine seam commitSettingsShell (build.py) hands it here instead of to innerHTML. Each node is matched with
   the node that was drawn for it (by id, by its section or workspace, by its action and target, else by tag and first
   class in order) and only what differs is changed: an attribute, a class, a text, a row that appears or goes. Nodes
   other owners put on the page are left where they are (the tab ink, Liquid Glass's wallpaper row and segment track,
   a cross-fade's outgoing copy), and so are classes and attributes that no Settings markup ever writes (reveal state,
   hover, sticky state, armed disclosures). Mounted workspaces stay mounted and are patched too.
   A navigation (another chapter, Home, or a jump that needs a fresh page) keeps the rail and the top bar (the rail
   keeps its scroll, the chapter you chose keeps focus, only its highlight moves) and replaces the page, so the arrival
   plays exactly as before, from the top of the chapter. The page-tab strip is new on a chapter change, so its ink is
   placed under the first tab instead of sliding over from an unrelated one.
   The reader's place, the end space and the active section during either kind of redraw are 27-place.js's. */

let o55cMode = null;            // 'in-place' or 'arrival' while renderApp commits its markup
let o55cKeepDetail = false;
const o55cMarkup = [];          // authored markup not yet read into the vocabularies below
const O55C_CLASSES = new Set(['o55-dep-off', 'o55-sec-off', 'active', 'is-active', 'is-on', 'on', 'is-open', 'is-changed', 'is-selected', 'is-disabled', 'disabled', 'page-enter', 'is-soft-remount', 'inspector-open', 'rail-open']);
const O55C_ATTRS = new Set(['disabled', 'hidden', 'inert', 'checked', 'selected', 'aria-pressed', 'aria-checked', 'aria-selected', 'aria-expanded', 'aria-current', 'aria-disabled']);
/* classes Settings markup also writes but that belong to a runtime owner once drawn (reveal, sticky, panel motion) */
const O55C_RUNTIME = new Set(['is-revealed', 'will-reveal', 'section-block', 'pm51-instant', 'is-stuck', 'is-settled', 'is-closing', 'is-current', 'has-manager-tabs', 'tab-swap', 'tab-swap-a', 'tab-swap-b', 'tab-swap-settled', 'roster-open']);
const O55C_RUNTIME_ATTR = /^(data-pm-hover-|data-o55-(armed|busy|morph|adopted)|data-pm51-phase|data-pm-swap-|data-lg)/;
/* the page index adopts a card or row as the anchor of a group the manager drew itself (22-index.js): that id and
   section id are the index's, not the markup's */
const o55cAdopted = (n, name) => n.hasAttribute('data-o55-adopted') && (name === 'data-section-id' || (name === 'id' && n.id === 'section-' + n.getAttribute('data-section-id')));
const O55C_FOREIGN = '.tab-ink, .o55-leaving, .o55np-glitch-slice, .lg-wrow, .pm-segtab-track, .o55-top-reserve, [data-o55-foreign]';
const O55C_STYLE = new Set(['display', 'visibility', 'min-height']);

/* The vocabularies: every class and attribute name any Settings markup has written; others are never removed. A patch
   learns them from the fresh nodes it visits; markup that went in another way (the first page, a workspace mounted on
   scroll, a manager redrawing its body) is read once, and only when a removal has to be decided. */
const o55cKnows = (set, name) => set.has(name) || (o55cMarkup.length > 0 && (o55cRead(), set.has(name)));
function o55cRead() {
  while (o55cMarkup.length) {
    const html = o55cMarkup.pop();
    for (const m of html.matchAll(/\sclass="([^"]*)"/g)) for (const c of m[1].split(/\s+/)) if (c) O55C_CLASSES.add(c);
    for (const m of html.matchAll(/\s([a-zA-Z][\w:-]*)="/g)) O55C_ATTRS.add(m[1].toLowerCase());
  }
}
let o55cReadSoon = 0;
function o55cKeep(html) {
  o55cMarkup.push(html);
  /* bodies drawn while nothing redraws in place are read when the page is idle, so they never pile up */
  if (o55cMarkup.length > 12 && !o55cReadSoon) o55cReadSoon = (window.requestIdleCallback || setTimeout)(() => { o55cReadSoon = 0; o55cRead(); });
}
const o55cBody = renderContinuousWorkspaceBody;
renderContinuousWorkspaceBody = function () { const html = o55cBody.apply(this, arguments); if (!o55cMode) o55cKeep(html); return html; };

/* ---------- matching ----------------------------------------------------------------------------------------------- */
function o55cKey(n) {
  if (n.nodeType === 3) return '#t';
  if (n.nodeType !== 1) return '#' + n.nodeType;
  const t = n.tagName;
  if (n.id && !o55cAdopted(n, 'id')) return t + '#' + n.id;
  for (const k of ['data-workspace-block', 'data-continuous-workspace-body', 'data-section-id', 'data-acc']) { const v = n.getAttribute(k); if (v !== null && !o55cAdopted(n, k)) return t + '[' + k + '=' + v + ']'; }
  const act = n.getAttribute('data-action');
  if (act) {
    let k = t + '!' + act;
    for (const f of ['data-domain', 'data-workspace', 'data-setting', 'data-id', 'data-tab', 'data-section', 'data-manager', 'data-provider', 'data-kind', 'data-acc-id']) { const v = n.getAttribute(f); if (v !== null) k += '|' + f.slice(5) + '=' + v; }
    if (/set-setting-value|toggle-list-value|insp-choose|segment|choose/.test(act)) k += '|v=' + (n.getAttribute('data-value') || '');
    return k;
  }
  const c = n.getAttribute('class');
  return t + '.' + (c ? c.trim().split(/\s+/)[0] : '') + (n.getAttribute('data-setting-id') ? '|' + n.getAttribute('data-setting-id') : '');
}
const o55cForeign = n => n.nodeType === 1 && n.matches(O55C_FOREIGN);
const o55cOpaque = n => n.id === 'toast-stack' || n.hasAttribute('data-all-settings-window') ||
  (n.id === 'setting-general.visual.wallpaper' && n.classList.contains('wpk-row')) ||
  (o55cKeepDetail && (n.classList.contains('detail-inspector') || n.classList.contains('detail-scrim')));

/* ---------- patching ----------------------------------------------------------------------------------------------- */
function o55cAttrs(live, fresh) {
  const was = live.getAttribute('class') || '', next = fresh.getAttribute('class') || '';
  if (was !== next) {
    const want = new Set(next.split(/\s+/).filter(Boolean));
    want.forEach(c => O55C_CLASSES.add(c));
    const add = [...want].filter(c => !live.classList.contains(c));
    const drop = [...live.classList].filter(c => !want.has(c) && !O55C_RUNTIME.has(c) && o55cKnows(O55C_CLASSES, c));
    o55cRowMotion(live, add, drop);
  }
  for (const at of fresh.attributes) {
    const name = at.name;
    O55C_ATTRS.add(name);
    if (name === 'class') continue;
    if (name === 'style') { o55cStyle(live, fresh); continue; }
    if (name === 'title' && live.hasAttribute('data-pm-hover-native-title')) {
      if (live.getAttribute('data-pm-hover-native-title') !== at.value) live.setAttribute('data-pm-hover-native-title', at.value);
      continue;
    }
    if (live.getAttribute(name) !== at.value) live.setAttribute(name, at.value);
  }
  for (const at of [...live.attributes]) {
    const name = at.name;
    if (name === 'class' || fresh.hasAttribute(name) || O55C_RUNTIME_ATTR.test(name) || o55cAdopted(live, name) || !o55cKnows(O55C_ATTRS, name)) continue;
    if (name === 'style') { o55cStyle(live, fresh); continue; }
    if (name === 'aria-describedby' && live.hasAttribute('data-pm-hover-bound')) continue;
    if (name === 'open' && live.tagName === 'DETAILS') continue;   /* a disclosure the reader opened stays open */
    live.removeAttribute(name);
  }
}
function o55cStyle(live, fresh) {
  const ls = live.style, fs = fresh.style;
  for (let i = 0; i < fs.length; i++) {
    const p = fs[i], v = fs.getPropertyValue(p), pr = fs.getPropertyPriority(p);
    if (ls.getPropertyValue(p) !== v || ls.getPropertyPriority(p) !== pr) ls.setProperty(p, v, pr);
  }
  for (const p of [...ls]) if (!fs.getPropertyValue(p) && O55C_STYLE.has(p)) ls.removeProperty(p);
}
/* a dependent row that comes or goes opens or closes by height with the kit's disclosure motion (o55SyncDependents) */
function o55cRowMotion(live, add, drop) {
  const row = live.matches('.setting-row[id]');
  const hiding = row && add.includes('o55-dep-off'), showing = row && drop.includes('o55-dep-off');
  if (!(hiding || showing) || o55Still() || live.getAnimations().length || !live.getClientRects().length && !showing) {
    add.forEach(c => live.classList.add(c)); drop.forEach(c => live.classList.remove(c)); return;
  }
  drop.forEach(c => live.classList.remove(c)); add.filter(c => c !== 'o55-dep-off').forEach(c => live.classList.add(c));
  if (showing) {
    const h = live.scrollHeight;
    live.animate([{ height: '0px', opacity: 0, paddingTop: '0px', paddingBottom: '0px' }, { height: h + 'px', opacity: 1 }], { duration: Math.min(420, 200 + h / 12), easing: o55Ease() });
  } else {
    const h = live.offsetHeight, done = () => live.classList.add('o55-dep-off');
    live.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0, paddingTop: '0px', paddingBottom: '0px' }], { duration: Math.min(420, 200 + h / 12), easing: o55Ease() }).finished.then(done, done);
  }
}
const o55cLeaving = new WeakSet();
function o55cInsert(parent, node, before) {
  parent.insertBefore(node, before);
  if (node.nodeType !== 1 || o55Still() || !node.matches('.setting-row[id]') || node.classList.contains('o55-dep-off') || o55cMode !== 'in-place') return;
  const h = node.scrollHeight;
  node.animate([{ height: '0px', opacity: 0, paddingTop: '0px', paddingBottom: '0px', overflow: 'clip' }, { height: h + 'px', opacity: 1, overflow: 'clip' }], { duration: Math.min(420, 200 + h / 12), easing: o55Ease() });
}
function o55cRemove(node) {
  if (o55cLeaving.has(node)) return;
  if (node.nodeType !== 1 || o55Still() || o55cMode !== 'in-place' || !node.matches('.setting-row[id]') || !node.getClientRects().length) { node.remove(); return; }
  o55cLeaving.add(node);
  const h = node.offsetHeight, done = () => node.remove();
  node.animate([{ height: h + 'px', opacity: 1, overflow: 'clip' }, { height: '0px', opacity: 0, paddingTop: '0px', paddingBottom: '0px', overflow: 'clip' }], { duration: Math.min(420, 200 + h / 12), easing: o55Ease(), fill: 'forwards' }).finished.then(done, done);
}
function o55cKids(live, fresh) {
  const pool = new Map();
  for (let f = fresh.firstChild; f; f = f.nextSibling) { const k = o55cKey(f); if (!pool.has(k)) pool.set(k, []); pool.get(k).push(f); }
  const pair = new Map(), gone = [];
  for (let l = live.firstChild; l; l = l.nextSibling) {
    if (o55cLeaving.has(l) || o55cForeign(l)) continue;
    const q = pool.get(o55cKey(l));
    if (q && q.length) pair.set(q.shift(), l); else gone.push(l);
  }
  gone.forEach(o55cRemove);
  let at = live.firstChild;
  const skip = () => { while (at && (o55cLeaving.has(at) || o55cForeign(at))) at = at.nextSibling; };
  for (let f = fresh.firstChild, next; f; f = next) {
    next = f.nextSibling;
    const l = pair.get(f);
    const node = l ? o55cNode(l, f) : f;
    if (l && node !== l) { if (at === l) at = l.nextSibling; l.remove(); }   /* replaced outright */
    skip();
    if (node === at) { at = at.nextSibling; continue; }
    if (node === l) live.insertBefore(l, at);
    else o55cInsert(live, node, at);
  }
}
function o55cNode(live, fresh) {
  if (live.nodeType !== 1) { if (live.nodeValue !== fresh.nodeValue) live.nodeValue = fresh.nodeValue; return live; }
  if (live.tagName !== fresh.tagName) return fresh;
  if (o55cOpaque(live)) return live;
  if (o55cMode === 'arrival' && (live.id === 'workspace-stage' || (live.classList.contains('workspace-tabs') && o55cChapter))) return fresh;
  if (live.hasAttribute('data-continuous-workspace-body')) return o55cBodyNode(live, fresh);
  o55cAttrs(live, fresh);
  if (live.tagName === 'SELECT') { o55cKids(live, fresh); if (live.value !== fresh.value) live.value = fresh.value; return live; }
  if (live.tagName === 'TEXTAREA') { if (live !== document.activeElement && live.value !== fresh.value) live.value = fresh.value; return live; }
  if (live.tagName === 'INPUT') {
    if (live !== document.activeElement && live.value !== fresh.value) live.value = fresh.value;
    if (live.checked !== fresh.checked) live.checked = fresh.checked;
    return live;
  }
  if (live.tagName === 'DETAILS' && fresh.open && !live.open) live.open = true;
  o55cKids(live, fresh);
  return live;
}
/* a workspace the reader has already mounted stays mounted: its fresh body is drawn here, then patched */
function o55cBodyNode(live, fresh) {
  if (live.dataset.workspaceMounted === 'true' && fresh.dataset.workspaceMounted === 'false') {
    const domain = getDomain(), ws = domain.workspaces.find(w => w.id === live.dataset.continuousWorkspaceBody);
    if (!ws) return live;
    const tpl = document.createElement('template'); tpl.innerHTML = renderContinuousWorkspaceBody(ws, domain);
    fresh.removeAttribute('style'); fresh.dataset.workspaceMounted = 'true';
    o55cAttrs(live, fresh);
    o55cKids(live, tpl.content);
    return live;
  }
  o55cAttrs(live, fresh);
  o55cKids(live, fresh);
  return live;
}

/* ---------- the engine seam ---------------------------------------------------------------------------------------- */
let o55cChapter = false;
commitSettingsShell = function (markup) {
  if (!o55cMode || !root.querySelector(':scope > .pm-shell')) { o55cKeep(markup); root.innerHTML = markup; return; }
  const tpl = document.createElement('template'); tpl.innerHTML = markup;
  o55cKids(root, tpl.content);
  if (o55cMode === 'arrival') tabInkGeometryCache = new WeakMap();
};

/* ---------- renderApp: in place, or an arrival ---------------------------------------------------------------------- */
const o55cRender = renderApp;
renderApp = function (options = {}) {
  const shell = root.querySelector(':scope > .pm-shell'), place = PM51.place;
  if (!shell) { place.nav(); return o55cRender.apply(this, arguments); }   /* the first page is an arrival too */
  const shownHome = !!root.querySelector('#workspace-stage > .home-page');
  const link = root.querySelector('.domain-link.active'), shownDomain = link ? link.dataset.domain : null;
  const inPlace = !pendingScroll && !!state.home === shownHome && (state.home || (shownDomain === state.domain && !!root.querySelector('#settings-document')));
  const held = inPlace ? { workspace: state.workspace, active: Object.assign({}, state.activeSection) } : null;
  o55cKeepDetail = inPlace && !!state.detailSetting && detailInspectorVisible;
  o55cMode = inPlace ? 'in-place' : 'arrival';
  o55cChapter = !inPlace && (!!state.home !== shownHome || shownDomain !== state.domain);
  place.inPlace = inPlace;
  if (!inPlace) {
    place.nav();
    /* the page is about to be replaced: a control in it that still has focus lets go now, while style is clean. Taking
       it out with the page made the browser recompute the whole page's style in the middle of the commit (+40 to
       60 ms before the new chapter's first frame); the focus ends on the page either way, as before. */
    const stage = root.querySelector('#workspace-stage'), act = document.activeElement;
    if (stage && act && act !== document.body && stage.contains(act) && typeof act.blur === 'function') act.blur();
  }
  let r;
  try { r = o55cRender.call(this, inPlace && !state.home ? Object.assign({}, options, { soft: true }) : options); }
  finally { o55cMode = null; place.inPlace = false; }
  if (inPlace) {
    preservedScrollTop = null;   /* nothing to restore by number: the page was never replaced */
    if (o55cKeepDetail) { detailInspectorVisible = true; document.addEventListener('keydown', onDetailEsc, true); if (PM51.syncInspector) PM51.syncInspector(); }
    state.workspace = held.workspace;
    state.activeSection = held.active;
  }
  o55cKeepDetail = false;
  place.watch();
  return r;
};

/* ---------- the active section of a navigation is decided with it, and saved with it -------------------------------- */
/* A page's first section as it is drawn, which is what the tracker judges at the top. The page's own section list says
   it: a manager page (Memory, Source Control...) is drawn inside its `${ws}:main` section, Projects starts with the
   settings catalog, a group that has stepped aside is left out, and advanced groups are drawn after the others. */
const o55cFirstSection = ws => {
  const list = continuousWorkspaceSections(ws) || [];
  return list.find(s => !(pm51SectionMeta[s.id] || {}).advanced) || list[0];
};
const o55cNavigate = navigate;
navigate = function (domainId, workspaceId, options = {}) {
  const domain = getDomain(domainId), ws = domain.workspaces.find(w => w.id === workspaceId) || domain.workspaces[0];
  if (ws && !(options && options.section)) {
    const placed = options && options.detailSetting && PM51.placement && PM51.placement.sectionOf(options.detailSetting);
    if (placed) state.activeSection[ws.id] = placed.id;
    else if (state.home || state.domain !== domain.id) {
      const first = o55cFirstSection(ws);
      if (first) state.activeSection[ws.id] = first.id;
    }
  }
  PM51.place.nav();
  return o55cNavigate.apply(this, arguments);
};
const o55cDispatch = dispatchAction;
dispatchAction = function (action, el, event) {
  /* choosing the chapter you are in goes to the top of its first page: its first section is the active one */
  if (action === 'navigate-domain' && !state.home) {
    const domain = getDomain(ds(el, 'domain'));
    if (domain.id === state.domain) {
      const ws = domain.workspaces.find(w => w.id === domain.defaultWorkspace) || domain.workspaces[0];
      const first = ws && o55cFirstSection(ws);
      if (first) state.activeSection[ws.id] = first.id;
    }
  }
  return o55cDispatch.apply(this, arguments);
};

/* ---------- a row drawn again is patched too -------------------------------------------------------------------------- */
/* A control on the page (a switch, a stepper, a choice) draws its row again (refreshSettingRow, PM51.swapRow). The row
   used to be replaced: the control lost focus and hover, and the switch's own transition never ran (26-switch-motion.js
   bridged that). It is patched now, like the page; a row whose tag changed is still replaced. */
const o55cSwapRow = PM51.swapRow;
PM51.swapRow = (el, next) => {
  if (!el || !next || !el.isConnected || el.tagName !== next.tagName) return o55cSwapRow(el, next);
  [...el.attributes].forEach(att => { if (att.name.startsWith('data-all-setting') && !next.hasAttribute(att.name)) next.setAttribute(att.name, att.value); });
  const was = o55cMode; o55cMode = was || 'row';
  try { o55cNode(el, next); } finally { o55cMode = was; }
};

/* ---------- coming back to Settings never replays an entrance -------------------------------------------------------- */
/* Settings is display:none while another page shows, and a CSS animation starts over when its element is shown again, so
   coming back replayed the page's arrival, every revealed section's slide and the last manager tab swap. When Settings
   is shown again, the entrances that had already played and restarted are finished at once, before the first frame is
   painted (after its layout, in a ResizeObserver), which leaves them exactly as a finished entrance always is. Two other ways were measured and dropped: taking
   the classes away, and placing the animations past their end with a negative delay, each changed how Glass is
   composited (about +300 ms on every action in Glass Light on the RTX 3090). Nothing is looked at unless an entrance
   has played since Settings was last shown, so the first entry, which plays its arrival as before, costs nothing. */
const O55C_ENTRANCES = /^(pageIn|sectionReveal|pmSettingsTabSwap[AB])$/;
const o55cPlayed = new WeakSet();
let o55cPlayedAny = false;
root.addEventListener('animationend', e => {
  if (e.target && O55C_ENTRANCES.test(e.animationName || '')) { o55cPlayed.add(e.target); o55cPlayedAny = true; }
}, true);
function o55cWatchReturns() {
  const panel = document.getElementById('panel-settings');
  if (!panel || panel.o55cReturns || typeof MutationObserver !== 'function' || typeof ResizeObserver !== 'function') return;
  panel.o55cReturns = true;
  /* the restarted entrances are finished in the first frame's ResizeObserver: its style and layout are already done
     there (finding them any earlier forced a whole extra style pass), an entrance moves nothing in layout, and the frame
     is not painted yet */
  let shown = panel.classList.contains('active'), due = false;
  new MutationObserver(() => {
    const now = panel.classList.contains('active');
    if (now && !shown && o55cPlayedAny) due = true;
    shown = now;
  }).observe(panel, { attributes: true, attributeFilter: ['class'] });
  new ResizeObserver(() => {
    if (!due || !panel.classList.contains('active')) return;
    due = false;
    for (const a of root.getAnimations({ subtree: true })) {
      const t = a.effect && a.effect.target;
      if (t && o55cPlayed.has(t) && O55C_ENTRANCES.test(a.animationName || '')) a.finish();
    }
  }).observe(panel);
}

/* ---------- leaving Settings and coming back keeps the open Details panel --------------------------------------------- */
const o55cBoot = boot;
boot = function () {
  const r = o55cBoot.apply(this, arguments), api = window.PM12_KIMI;
  o55cWatchReturns();
  if (api && typeof api.closeTransientUi === 'function' && !api.closeTransientUi.o55Keeps) {
    const close = api.closeTransientUi;
    api.closeTransientUi = function () {
      const panel = document.getElementById('panel-settings'), leaving = !!(panel && !panel.classList.contains('active'));
      const detail = state.detailSetting, shown = detailInspectorVisible;
      const out = close.apply(this, arguments);
      if (leaving && detail && shown) { state.detailSetting = detail; detailInspectorVisible = true; }
      return out;
    };
    api.closeTransientUi.o55Keeps = true;
    const panel = document.getElementById('panel-settings');
    if (panel && typeof MutationObserver === 'function') new MutationObserver(() => {
      if (panel.classList.contains('active') && state.detailSetting && detailInspectorVisible) document.addEventListener('keydown', onDetailEsc, true);
    }).observe(panel, { attributes: true, attributeFilter: ['class'] });
  }
  return r;
};
