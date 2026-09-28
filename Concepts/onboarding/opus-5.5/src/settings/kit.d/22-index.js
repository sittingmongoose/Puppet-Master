/* O55 · the page index (the "On this page" column between the chapter rail and the page).
   It was one long list of every placed group of every page in the chapter, with a manager's tabs as captions: on a
   page with tabs most entries pointed at groups that are not on screen (they live on another tab, so you could not
   scroll to them), groups a manager draws itself had nothing to land on, and in a long chapter (Memory & Automation)
   the highlighted entry scrolled out of the index as you read down the page. Now:
   - a page with tabs lists its tabs; each tab is an entry that opens that tab, and only the tab on show unfolds to list
     its groups. A page without tabs lists its groups as before;
   - a page that is on screen lists what is really drawn on it, in the order it is drawn (a group a manager draws
     itself is found by its first row and lands on the card it sits in; groups under a closed "More options" of a
     manager are left out). Pages further down, not drawn yet, list their groups from placement until they are;
   - the entry for what you are reading is highlighted (the open tab when you are above its first group) and the
     index scrolls itself to keep that entry in view;
   - the scroll spy decides "what you are reading" with the same offset a jump lands at (below a manager's sticky tab
     strip), skips groups hidden in a closed disclosure or switched off, and after a jump keeps the target lit until
     you scroll yourself, so a click lands and lights exactly the entry clicked. */

const pm51IndexStill = () => (typeof o55Still === 'function' ? o55Still() : motionReduced());
const pm51IsMain = (ws, id) => id === `${ws}:main`;
const pm51IndexCurTab = ws => PM51.tab(ws, PM51.placement.defaultTab(ws) || (pm51TabOrder[ws] || [])[0]);
const pm51HasTabs = w => w && w.type !== 'settings' && (pm51TabOrder[w.id] || []).length > 1;
const pm51TabLabel = (ws, t) => (((PLACEMENT && PLACEMENT.managers[ws]) || {}).tabs || {})[t] || humanize(t);

/* A group the manager draws itself (a composed placement section) has no anchor of its own. Its first drawn row
   names the card it sits in; that card becomes the group's anchor, so the index, a jump and the scroll spy all see it. */
function pm51AdoptAnchors(ws, body) {
  const w = getDomain().workspaces.find(x => x.id === ws);
  if (!w || !body || !Array.isArray(w.sections)) return;
  for (const s of w.sections) {
    if (!s.inline || s.advanced || body.querySelector(`[data-section-id="${cssEscape(s.id)}"]`)) continue;
    const row = (s.settings || []).map(st => body.querySelector(`#setting-${cssEscape(st.id)}, [data-setting-id="${cssEscape(st.id)}"]`)).find(Boolean);
    if (!row) continue;
    const card = row.closest('.pm51-section, .settings-section');
    const host = card && !card.hasAttribute('data-section-id') ? card : (row.hasAttribute('data-section-id') ? null : row);
    if (!host) continue;
    host.setAttribute('data-section-id', s.id); host.setAttribute('data-o55-adopted', '');
    if (!host.id) host.id = `section-${s.id}`;
  }
}
/* What the index can honestly list for a drawn page: anchors in drawing order, not hidden, not switched off, not in a
   manager's closed More options (a plain page's More options is listed: its groups open on the way there). */
const pm51AnchorShown = el => !el.closest('[hidden], .o55-sec-off, .o55-leaving') && !(el.closest('details.pm51-advanced') && !el.closest('.o55-page-more'));
function pm51IndexEntries(w) {
  const statics = (domainSectionMap[w.id] || []).filter(s => !pm51IsMain(w.id, s.id));
  const body = root.querySelector(`[data-continuous-workspace-body="${cssEscape(w.id)}"][data-workspace-mounted="true"]`);
  const tabbed = pm51HasTabs(w), cur = tabbed ? pm51IndexCurTab(w.id) : null;
  if (!body) return statics.filter(s => !tabbed || !s.tab || s.tab === cur).map(s => ({ id: s.id, label: s.label }));
  pm51AdoptAnchors(w.id, body);
  const label = new Map(statics.map(s => [s.id, s.label]));
  const seen = new Set(), out = [];
  body.querySelectorAll('[data-section-id]').forEach(el => {
    const id = el.dataset.sectionId;
    if (pm51IsMain(w.id, id) || seen.has(id) || !pm51AnchorShown(el)) return;
    const head = el.querySelector(':scope > .pm51-section-head .pm51-section-title, :scope > .o55-group-head .o55-group-title, :scope > header h3, :scope h3');
    const text = label.get(id) || (head ? head.textContent.trim() : '');
    if (!text) return;
    seen.add(id); out.push({ id, label: text });
  });
  return out;
}
const pm51IndexLink = (w, s, active) => `<button type="button" class="index-link${s.id === active ? ' is-active' : ''}" data-action="scroll-section" data-section="${escAttr(s.id)}" data-workspace="${escAttr(w.id)}">${escapeHtml(s.label)}</button>`;
function pm51IndexGroupInner(w, activeWsId, activeSection) {
  const entries = pm51IndexEntries(w);
  const active = w.id === activeWsId ? activeSection : null;
  let html = `<button type="button" class="page-index-title ${w.id === activeWsId ? 'is-current' : ''}" data-action="jump-workspace" data-workspace="${escAttr(w.id)}">${escapeHtml(w.label)}</button>`;
  if (!pm51HasTabs(w)) return html + entries.map(s => pm51IndexLink(w, s, active)).join('');
  const cur = pm51IndexCurTab(w.id), main = `${w.id}:main`;
  for (const t of pm51TabOrder[w.id]) {
    const open = t === cur;
    html += `<button type="button" class="index-link pm51-index-tab${open ? ' is-open' : ''}${open && active === main ? ' is-active' : ''}" data-action="pm51-index-tab" data-workspace="${escAttr(w.id)}" data-tab="${escAttr(t)}" data-section="${open ? escAttr(main) : ''}" aria-expanded="${open}"><span>${escapeHtml(pm51TabLabel(w.id, t))}</span>${icon('chevron')}</button>`;
    if (open && entries.length) html += `<div class="pm51-index-sub" role="group" aria-label="${escAttr(pm51TabLabel(w.id, t))}">${entries.map(s => pm51IndexLink(w, s, active)).join('')}</div>`;
  }
  return html;
}
renderPageIndexCard = function (workspaces, activeWsId, activeSection) {
  const groups = workspaces.map(w => `<div class="pm51-index-group" data-index-ws="${escAttr(w.id)}">${pm51IndexGroupInner(w, activeWsId, activeSection)}</div>`).join('');
  return `<aside class="page-index" aria-label="On this page"><nav class="page-index-card" data-page-index-links>${groups}</nav></aside>`;
};
/* Redraw one page's entries after it is drawn, redrawn or changes tab; the highlight is put back and kept in view. */
PM51.syncIndex = function (ws) {
  const group = root.querySelector(`.pm51-index-group[data-index-ws="${cssEscape(ws)}"]`);
  const w = group && getDomain().workspaces.find(x => x.id === ws);
  if (!w) return;
  const html = pm51IndexGroupInner(w, state.workspace, state.activeSection[state.workspace]);
  if (group.innerHTML !== html) group.innerHTML = html;
  pm51MarkIndex();
};
PM51.syncIndexTabs = ws => PM51.syncIndex(ws);
const pm51SyncMounted = () => root.querySelectorAll('[data-continuous-workspace-body][data-workspace-mounted="true"]').forEach(b => PM51.syncIndex(b.dataset.continuousWorkspaceBody));

/* ---------- highlight: the entry you are reading, and its tab ---------------------------------------------------- */
let pm51IndexShown = '';
function pm51MarkIndex() {
  const card = root.querySelector('.page-index-card'); if (!card) return;
  const ws = state.workspace, id = state.activeSection[ws];
  card.querySelectorAll('.index-link').forEach(l => l.classList.toggle('is-active', !!id && l.dataset.section === id && l.dataset.workspace === ws));
  card.querySelectorAll('.pm51-index-tab').forEach(t => { const sub = t.nextElementSibling; t.classList.toggle('has-active', !!(sub && sub.classList.contains('pm51-index-sub') && sub.querySelector('.index-link.is-active'))); });
  pm51RevealIndex();
}
/* The index scrolls itself so the highlighted entry stays in view (with a little of what is around it). */
function pm51RevealIndex() {
  const box = root.querySelector('.page-index'); if (!box || box.scrollHeight <= box.clientHeight + 1) return;
  const hit = box.querySelector('.index-link.is-active') || box.querySelector('.page-index-title.is-current'); if (!hit) return;
  const key = (hit.dataset.workspace || '') + '|' + (hit.dataset.section || hit.dataset.tab || '');
  const b = box.getBoundingClientRect(), r = hit.getBoundingClientRect(), pad = Math.min(72, box.clientHeight * .2);
  if (r.top >= b.top + pad && r.bottom <= b.bottom - pad && key === pm51IndexShown) return;
  pm51IndexShown = key;
  if (r.top >= b.top + pad && r.bottom <= b.bottom - pad) return;
  const want = box.scrollTop + (r.top - b.top) - box.clientHeight * .35;
  box.scrollTo({ top: Math.max(0, Math.min(box.scrollHeight - box.clientHeight, want)), behavior: pm51IndexStill() ? 'auto' : 'smooth' });
}
const pm51IndexSetActive = setActiveLocalSection;
setActiveLocalSection = function (workspaceId, sectionId, persist = true) {
  const r = pm51IndexSetActive.apply(this, arguments);
  pm51MarkIndex();
  return r;
};

/* ---------- scroll spy ------------------------------------------------------------------------------------------- */
/* An anchor counts as reached when the page has scrolled to where a jump to it lands (scrollOffsetWithin, which
   allows for a manager's sticky tab strip) less a reading allowance. A jump pins its target: it stays lit while it is
   on screen until you scroll, type or click yourself. */
let pm51SpyPin = null;
const pm51LandTop = (scroller, el) => scrollOffsetWithin(scroller, el) - 26;
const pm51SpyShown = el => el.getClientRects().length > 0 && !el.closest('details:not([open]), [hidden], [inert], .o55-sec-off, .o55-leaving');
['wheel', 'touchstart', 'keydown'].forEach(n => root.addEventListener(n, () => { pm51SpyPin = null; }, { capture: true, passive: true }));
root.addEventListener('pointerdown', e => { if (e.target && e.target.id === 'settings-document') pm51SpyPin = null; }, { capture: true, passive: true });
setupScrollSpy = function () {
  const scroller = root.querySelector('#settings-document');
  if (!scroller) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    if (performance.now() < suppressScrollSpyUntil) { raf = requestAnimationFrame(update); return; }
    const blocks = [...scroller.querySelectorAll('[data-workspace-block]')];
    if (!blocks.length) return;
    const top = scroller.scrollTop, line = top + Math.min(140, scroller.clientHeight * .3);
    const sc = scroller.getBoundingClientRect();
    const pinEl = pm51SpyPin ? root.querySelector(`[data-section-id="${cssEscape(pm51SpyPin)}"]`) : null;
    const pinOn = pinEl && pm51SpyShown(pinEl) && (() => { const r = pinEl.getBoundingClientRect(); return r.bottom > sc.top + 20 && r.top < sc.bottom - 40; })();
    if (pm51SpyPin && !pinOn) pm51SpyPin = null;
    let block = blocks[0];
    if (pinOn) block = pinEl.closest('[data-workspace-block]') || block;
    else for (const b of blocks) if (pm51LandTop(scroller, b) <= line) block = b;
    const ws = block.getAttribute('data-workspace-block');
    if (ws && ws !== state.workspace) { state.workspace = ws; syncWorkspaceChrome(ws); updateHash(); }
    const anchors = [...block.querySelectorAll('[data-section-id]')].filter(pm51SpyShown);
    if (!anchors.length) return;
    let active = anchors[0].getAttribute('data-section-id');
    if (pinOn) active = pm51SpyPin;
    else {
      const max = scroller.scrollHeight - scroller.clientHeight;
      const atEnd = max > 0 && top >= max - 4;
      for (const a of anchors) {
        const reached = pm51LandTop(scroller, a) <= line;
        const inUpperView = atEnd && a.getBoundingClientRect().top < sc.top + scroller.clientHeight * .5;
        if (reached || inUpperView) active = a.getAttribute('data-section-id');
      }
    }
    setActiveLocalSection(ws || state.workspace, active, false);
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  scroller.addEventListener('scroll', onScroll, { passive: true });
  update();
  scrollCleanup = () => { scroller.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
};

/* ---------- jumps ------------------------------------------------------------------------------------------------ */
const pm51IndexScrollTo = scrollToSection;
scrollToSection = function (sectionId, smooth = true) {
  const meta = pm51SectionMeta[sectionId];
  const ws = meta ? meta.workspace : Object.keys(domainSectionMap).find(k => (domainSectionMap[k] || []).some(s => s.id === sectionId));
  if (ws) {
    const body = mountContinuousWorkspace(ws);
    if (body && !root.querySelector(`[data-section-id="${cssEscape(sectionId)}"]`)) pm51AdoptAnchors(ws, body);
  }
  const target = root.querySelector(`[data-section-id="${cssEscape(sectionId)}"]`);
  if (!target && ws && !(meta && meta.tab)) { pm51SpyPin = null; return jumpToWorkspace(ws); }
  pm51SpyPin = sectionId;
  const r = pm51IndexScrollTo.call(this, sectionId, smooth);
  const again = root.querySelector(`[data-section-id="${cssEscape(sectionId)}"]`);
  if (again && typeof o55OpenAround === 'function' && again.closest('.pm51-acc-item:not(.is-open), details:not([open])')) o55OpenAround(`[data-section-id="${cssEscape(sectionId)}"]`);
  if (ws) PM51.syncIndex(ws);
  return r;
};
const pm51IndexJump = jumpToWorkspace;
jumpToWorkspace = function (wsId, behavior) { pm51SpyPin = null; const r = pm51IndexJump.apply(this, arguments); PM51.syncIndex(wsId); return r; };
PM51.on('index-tab', el => {
  const ws = ds(el, 'workspace'), tab = ds(el, 'tab');
  const shown = root.querySelector(`[data-continuous-workspace-body="${cssEscape(ws)}"] .pm51-mgr`);
  if (shown && pm51IndexCurTab(ws) !== tab) PM51.switchTab(ws, tab); else PM51.setTab(ws, tab);
  state.activeSection[ws] = `${ws}:main`;
  jumpToWorkspace(ws);
  PM51.syncIndex(ws);
});

/* ---------- keep the index in step with what is drawn ------------------------------------------------------------ */
const pm51IndexMount = mountContinuousWorkspace;
mountContinuousWorkspace = function (id) {
  const was = root.querySelector(`[data-continuous-workspace-body="${cssEscape(id)}"]`);
  const fresh = !!(was && was.dataset.workspaceMounted === 'false');
  const body = pm51IndexMount.apply(this, arguments);
  if (fresh && body) PM51.syncIndex(id);
  return body;
};
const pm51IndexRefresh = PM51.refresh;
PM51.refresh = function (wsId) { const r = pm51IndexRefresh.apply(this, arguments); PM51.syncIndex(wsId); return r; };
const pm51IndexAfter = afterRender;
afterRender = function () {
  const r = pm51IndexAfter.apply(this, arguments);
  pm51IndexShown = '';
  if (!state.home) pm51SyncMounted();
  return r;
};
