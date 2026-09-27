/* O55 · motion inside managers. Nothing inside a manager is ever swapped by clearing it and fading the new content up
   from nothing (that frame of bare background is the "flash"): the outgoing content stays painted while the incoming
   content arrives, and the space between them eases from the old height to the new one.
   - tab switch: the tab strip stays put (its ink slides), the body cross-fades with a short slide in the direction of
     travel, and the manager's height morphs;
   - choosing another item in a list (a provider, a sound, a skill): the list stays put (its scroll and filter too),
     only the detail cross-fades;
   - "More options" and other disclosures open and close by height, never by a jump;
   - reduced motion (system or the app's Reduce Animations): every swap is immediate.
   Retro keeps its stepped look (steps(4) instead of a curve). Only opacity and transform run per frame on the moving
   layers; the one height animation is on the manager box. */

const o55Retro = () => /^retro/.test(document.documentElement.getAttribute('data-theme') || '');
const o55Ease = () => o55Retro() ? 'steps(4, end)' : 'cubic-bezier(.22,.8,.24,1)';
const o55Still = () => motionReduced() || document.documentElement.getAttribute('data-motion') === 'reduced';
let o55MorphSeq = 0;

/* Swap oldEl for newEl inside host (which gets position:relative for the duration). dir: -1 left, 1 right, 0 rise. */
function o55Morph(oldEl, newEl, { host, dir = 0, dur = 300 } = {}) {
  host = host || oldEl.parentNode;
  if (!oldEl || !oldEl.isConnected) { return; }
  if (o55Still()) { oldEl.replaceWith(newEl); return; }
  const seq = ++o55MorphSeq; host.dataset.o55Morph = String(seq);
  host.querySelectorAll(':scope > .o55-leaving').forEach(n => n.remove()); /* a morph interrupted by another */
  const hostPos = getComputedStyle(host).position;
  if (hostPos === 'static') host.style.position = 'relative'; /* before measuring: offsets are relative to it */
  const h0 = host.getBoundingClientRect().height;
  const top = oldEl.offsetTop, left = oldEl.offsetLeft, width = oldEl.offsetWidth;
  oldEl.after(newEl);
  Object.assign(oldEl.style, { position: 'absolute', top: top + 'px', left: left + 'px', width: width + 'px', margin: '0', pointerEvents: 'none', zIndex: '0' });
  oldEl.classList.add('o55-leaving'); oldEl.setAttribute('aria-hidden', 'true'); oldEl.setAttribute('inert', '');
  const h1 = host.getBoundingClientRect().height;
  const ease = o55Ease();
  const dx = dir ? 18 * dir : 0, dy = dir ? 0 : 8;
  const out = oldEl.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translate(${-dx * .6}px, ${-dy * .5}px)` }], { duration: dur * .6, easing: ease, fill: 'forwards' });
  newEl.animate([{ opacity: 0, transform: `translate(${dx}px, ${dy}px)` }, { opacity: 1, transform: 'none' }], { duration: dur, delay: dur * .12, easing: ease, fill: 'backwards' });
  let grow = null;
  if (Math.abs(h1 - h0) > 2) { host.style.overflow = 'clip'; grow = host.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: dur, easing: ease }); }
  const done = () => {
    if (host.dataset.o55Morph !== String(seq)) return;
    oldEl.remove(); if (hostPos === 'static') host.style.position = ''; host.style.overflow = ''; delete host.dataset.o55Morph;
  };
  (grow || out).finished.then(done, done);
  window.setTimeout(done, dur + 200);
}
PM51.morph = o55Morph;

/* ---------- tabs ----------------------------------------------------------------------------------------------- */
function o55PostMount(scope) {
  scope.querySelectorAll('.manager-section').forEach(sec => sec.classList.add('section-block', 'is-revealed'));
  scope.querySelectorAll('.pm51-settings-inline .settings-section').forEach(sec => sec.classList.add('section-block', 'is-revealed', 'pm51-instant'));
  PM51.applyFilters(scope);
  o55ArmDisclosures(scope);
}
function o55Fresh(wsId) {
  const domain = getDomain(); const ws = domain.workspaces.find(w => w.id === wsId); if (!ws) return null;
  const tpl = document.createElement('template'); tpl.innerHTML = renderContinuousWorkspaceBody(ws, domain);
  return tpl.content;
}
/* Keep the reader oriented: if the manager's tab strip has scrolled off the top, bring it back into view. */
function o55KeepTabsInView(page) {
  const scroller = root.querySelector('#settings-document'); const tabs = page && page.querySelector('.pm51-tabs');
  if (!scroller || !tabs) return;
  const st = scroller.getBoundingClientRect(), tt = tabs.getBoundingClientRect();
  if (tt.top < st.top + 4) scroller.scrollTo({ top: scroller.scrollTop + (tt.top - st.top) - 12, behavior: o55Still() ? 'auto' : 'smooth' });
}
PM51.switchTab = function (wsId, tab) {
  const body = root.querySelector(`[data-continuous-workspace-body="${cssEscape(wsId)}"]`);
  const page = body && body.querySelector('.pm51-mgr');
  const oldBody = page && page.querySelector(':scope > .manager-body');
  const tabs = page ? [...page.querySelectorAll(':scope > .pm51-tabs .manager-tab')] : [];
  const from = tabs.findIndex(t => t.classList.contains('active')), to = tabs.findIndex(t => t.dataset.tab === tab);
  PM51.setTab(wsId, tab);
  if (!page || !oldBody || to < 0) { PM51.refresh(wsId); return; }
  popoutClose({ restoreFocus: false });
  const fresh = o55Fresh(wsId); const nextPage = fresh && fresh.querySelector('.pm51-mgr'); const nextBody = nextPage && nextPage.querySelector(':scope > .manager-body');
  if (!nextBody) { PM51.refresh(wsId); return; }
  tabs.forEach((t, i) => { const on = i === to; t.classList.toggle('active', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); });
  if (nextPage.dataset.pm51Placed) page.dataset.pm51Placed = nextPage.dataset.pm51Placed;
  o55PostMount(nextBody);
  o55Morph(oldBody, nextBody, { host: page, dir: from < 0 ? 0 : (to > from ? 1 : -1) });
  requestAnimationFrame(() => moveTabInks(measureTabInks(true, page)));
  try { syncDetailButtonStates(); } catch (e) { /* cosmetic */ }
  o55KeepTabsInView(page);
  saveState();
};
PM51.on('tab', el => PM51.switchTab(ds(el, 'manager'), ds(el, 'tab')));

/* ---------- list / detail: only the detail moves --------------------------------------------------------------- */
PM51.swapDetail = function (wsId, sel) {
  const body = root.querySelector(`[data-continuous-workspace-body="${cssEscape(wsId)}"]`);
  const page = body && body.querySelector('.pm51-mgr');
  const oldDetail = page && page.querySelector('.resource-detail');
  if (!oldDetail) { PM51.refresh(wsId, { swap: false }); return; }
  const fresh = o55Fresh(wsId); const nextDetail = fresh && fresh.querySelector('.resource-detail');
  if (!nextDetail) { PM51.refresh(wsId, { swap: false }); return; }
  page.querySelectorAll('.resource-roster .resource-row').forEach(row => { const on = String(row.dataset.id || row.dataset.provider) === String(sel); row.classList.toggle('active', on); row.setAttribute('aria-current', on ? 'true' : 'false'); });
  o55PostMount(nextDetail);
  o55Morph(oldDetail, nextDetail, { host: oldDetail.parentNode, dir: 0, dur: 260 });
  try { syncDetailButtonStates(); } catch (e) { /* cosmetic */ }
  saveState();
};
PM51.on('select', el => { const ws = ds(el, 'manager'), id = ds(el, 'id'); PM51.setSel(ws, id); state.resourceRosterOpen = false; const b = el.closest('.manager-body'); if (b) b.classList.remove('roster-open'); PM51.swapDetail(ws, id); });
selectProviderView = function (providerId) {
  const provider = state.providers.find(row => row.id === providerId) || state.providers[0];
  if (!provider) return false;
  state.selectedProvider = provider.id; state.resourceRosterOpen = false; saveState();
  if (state.home || state.domain !== 'ai' || !root.querySelector('[data-continuous-workspace-body="providers"][data-workspace-mounted="true"] .resource-detail')) { navigate('ai', 'providers'); return true; }
  PM51.swapDetail('providers', provider.id);
  return true;
};

/* ---------- disclosures (More options, account rows) --------------------------------------------------------- */
function o55ArmDisclosures(scope) {
  (scope || root).querySelectorAll('details.pm51-advanced:not([data-o55-armed])').forEach(d => {
    d.dataset.o55Armed = '1';
    const sum = d.querySelector(':scope > summary'), body = d.querySelector(':scope > .pm51-advanced-body');
    if (!sum || !body) return;
    sum.addEventListener('click', e => {
      if (o55Still()) return;
      e.preventDefault();
      if (d.dataset.o55Busy) return; d.dataset.o55Busy = '1';
      const opening = !d.open;
      if (opening) d.open = true;
      const full = body.scrollHeight;
      const a1 = body.animate([{ height: opening ? '0px' : full + 'px', opacity: opening ? 0 : 1 }, { height: opening ? full + 'px' : '0px', opacity: opening ? 1 : 0 }], { duration: Math.min(420, 200 + full / 12), easing: o55Ease() });
      body.style.overflow = 'clip';
      a1.finished.then(() => { if (!opening) d.open = false; body.style.overflow = ''; delete d.dataset.o55Busy; }, () => { delete d.dataset.o55Busy; });
    });
  });
}
PM51.armDisclosures = o55ArmDisclosures;
const o55MotionAfterRender = afterRender;
afterRender = function () { const r = o55MotionAfterRender.apply(this, arguments); try { o55ArmDisclosures(root); } catch (e) { /* cosmetic */ } return r; };
const o55MotionMount = mountContinuousWorkspace;
mountContinuousWorkspace = function (id) { const body = o55MotionMount(id); if (body) { try { o55ArmDisclosures(body); } catch (e) { /* cosmetic */ } } return body; };
const o55MotionRefresh = PM51.refresh;
PM51.refresh = function (wsId, opts) {
  const r = o55MotionRefresh.call(this, wsId, Object.assign({}, opts || {}, { swap: false }));
  const body = root.querySelector(`[data-continuous-workspace-body="${cssEscape(wsId)}"]`);
  if (body) { try { o55ArmDisclosures(body); } catch (e) { /* cosmetic */ } }
  return r;
};
