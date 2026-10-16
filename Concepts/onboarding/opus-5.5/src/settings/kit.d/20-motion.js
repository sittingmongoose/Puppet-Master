/* O55 · motion inside managers. Nothing inside a manager is ever swapped by clearing it and fading the new content up
   from nothing (that frame of bare background is the "flash"): the outgoing content stays painted while the incoming
   content arrives, and the space between them eases from the old height to the new one.
   - tab switch: the tab strip stays put (its ink slides), the body cross-fades with a short slide in the direction of
     travel, and the manager's height morphs;
   - choosing another item in a list (a provider, a sound, a skill): the list stays put (its scroll and filter too),
     only the detail cross-fades (and the item's group in the view's More options is swapped with it);
   - "More options" and other disclosures open and close by height, never by a jump;
   - reduced motion (system or the app's Reduce Animations): every swap is immediate.
   Retro keeps its stepped look (steps(4) instead of a curve). Only opacity and transform run per frame on the moving
   layers; the one height animation is on the manager box.
   The tab strip is a real tab list: it wraps onto a second line instead of hiding tabs (the thumb follows the chosen
   tab to its line), the arrow keys, Home and End move between tabs, and while the strip is stuck to the top of the
   page it is marked .is-stuck so 20-managers.css can lay the page's colour behind it. */

const o55Retro = () => /^retro/.test(document.documentElement.getAttribute('data-theme') || '');
const o55Ease = () => o55Retro() ? 'steps(4, end)' : 'cubic-bezier(.22,.8,.24,1)';
const o55Still = () => motionReduced() || document.documentElement.getAttribute('data-motion') === 'reduced';
let o55MorphSeq = 0;
const o55TabExits = new WeakMap();

/* Swap oldEl for newEl inside host (which gets position:relative for the duration). dir: -1 left, 1 right, 0 rise. */
function o55Morph(oldEl, newEl, { host, dir = 0, dur = 300 } = {}) {
  host = host || oldEl.parentNode;
  if (!oldEl || !oldEl.isConnected) { return; }
  if (o55Still()) { const leaving = o55TabExits.get(oldEl); if (leaving) { leaving.cancel(); o55TabExits.delete(oldEl); } oldEl.replaceWith(newEl); return; }
  const seq = ++o55MorphSeq; host.dataset.o55Morph = String(seq);
  host.querySelectorAll(':scope > .o55-leaving').forEach(n => n.remove()); /* a morph interrupted by another */
  const hostPos = getComputedStyle(host).position;
  if (hostPos === 'static') host.style.position = 'relative'; /* before measuring: offsets are relative to it */
  const h0 = host.getBoundingClientRect().height;
  const top = oldEl.offsetTop, left = oldEl.offsetLeft, width = oldEl.offsetWidth;
  oldEl.after(newEl);
  Object.assign(oldEl.style, { position: 'absolute', top: top + 'px', left: left + 'px', width: width + 'px', margin: '0', pointerEvents: 'none', zIndex: '0' });
  oldEl.classList.add('o55-leaving'); oldEl.setAttribute('aria-hidden', 'true'); oldEl.setAttribute('inert', '');
  const arrive = () => {
  if (!newEl.isConnected || host.dataset.o55Morph !== String(seq)) return;
  const h1 = host.getBoundingClientRect().height;
  const ease = o55Ease();
  const dx = dir ? 18 * dir : 0, dy = dir ? 0 : 8;
  let from = { opacity: 1, transform: 'none' };
  const leaving = o55TabExits.get(oldEl);
  if (leaving) {
    /* Layout has finished. Continue from the actual outgoing pose instead of flashing it back to full opacity. */
    const cs = getComputedStyle(oldEl); from = { opacity: cs.opacity, transform: cs.transform };
    leaving.cancel(); o55TabExits.delete(oldEl);
  }
  const out = oldEl.animate([from, { opacity: 0, transform: `translate(${-dx * .6}px, ${-dy * .5}px)` }], { duration: dur * .6, easing: ease, fill: 'forwards' });
  newEl.animate([{ opacity: 0, transform: `translate(${dx}px, ${dy}px)` }, { opacity: 1, transform: 'none' }], { duration: dur, delay: dur * .12, easing: ease, fill: 'backwards' });
  let grow = null;
  if (Math.abs(h1 - h0) > 2) { host.style.overflow = 'clip'; grow = host.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: dur, easing: ease }); }
  const done = () => {
    if (host.dataset.o55Morph !== String(seq)) return;
    oldEl.remove(); if (hostPos === 'static') host.style.position = ''; host.style.overflow = ''; delete host.dataset.o55Morph;
  };
  (grow || out).finished.then(done, done);
  window.setTimeout(done, dur + 200);
  };
  /* New content gets its ordinary layout once. The observer runs before paint, so the arriving body never flashes
     at rest and reading its final height does not force a second layout inside the input task. */
  if (typeof ResizeObserver === 'function') {
    const ready = new ResizeObserver(() => { ready.disconnect(); arrive(); }); ready.observe(newEl);
  } else requestAnimationFrame(arrive);
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
let o55TabTicket = 0;
const o55AfterPaint = fn => requestAnimationFrame(() => setTimeout(fn, 0));
PM51.switchTab = function (wsId, tab) {
  const body = root.querySelector(`[data-continuous-workspace-body="${cssEscape(wsId)}"]`);
  const page = body && body.querySelector('.pm51-mgr');
  const oldBody = page && page.querySelector(':scope > .manager-body');
  const tabs = page ? [...page.querySelectorAll(':scope > .pm51-tabs .manager-tab')] : [];
  const from = tabs.findIndex(t => t.classList.contains('active')), to = tabs.findIndex(t => t.dataset.tab === tab);
  PM51.setTab(wsId, tab);
  if (!page || !oldBody || to < 0) { PM51.refresh(wsId); return; }
  const ticket = ++o55TabTicket;
  tabs.forEach((t, i) => { const on = i === to; t.classList.toggle('active', on); t.setAttribute('aria-selected', String(on)); });
  moveTabInks();
  if (!o55Still() && !o55TabExits.has(oldBody)) {
    const dir = from < 0 ? 0 : (to > from ? 1 : -1), dx = dir ? 18 * dir : 0, dy = dir ? 0 : 8;
    /* The existing body begins its exit with the selected ink, before building the replacement. A quiet compositor
       continuation covers a slow first layout; arrival keeps the same slide, delay and height choreography. */
    o55TabExits.set(oldBody, oldBody.animate([
      { opacity: 1, transform: 'none', easing: o55Ease() },
      { opacity: .55, transform: `translate(${-dx * .18}px, ${-dy * .25}px)`, offset: 260 / 1200, easing: o55Retro() ? 'steps(28, end)' : 'linear' },
      { opacity: .3, transform: `translate(${-dx * .45}px, ${-dy * .45}px)` }
    ], { duration: 1200, easing: 'linear', fill: 'forwards' }));
  }
  o55AfterPaint(() => {
  if (ticket !== o55TabTicket || !page.isConnected) return;
  o55KeepTabsInView(page);
  popoutClose({ restoreFocus: false });
  const fresh = o55Fresh(wsId); const nextPage = fresh && fresh.querySelector('.pm51-mgr'); const nextBody = nextPage && nextPage.querySelector(':scope > .manager-body');
  if (!nextBody) { PM51.refresh(wsId); return; }
  tabs.forEach((t, i) => { const on = i === to; t.classList.toggle('active', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); });
  if (nextPage.dataset.pm51Placed) page.dataset.pm51Placed = nextPage.dataset.pm51Placed;
  o55PostMount(nextBody);
  o55Morph(oldBody, nextBody, { host: page, dir: from < 0 ? 0 : (to > from ? 1 : -1) });
  requestAnimationFrame(() => moveTabInks(measureTabInks(true, page)));
  try { syncDetailButtonStates(); } catch (e) { /* cosmetic */ }
  if (PM51.syncIndexTabs) PM51.syncIndexTabs(wsId);
  saveState();
  });
};
PM51.on('tab', el => PM51.switchTab(ds(el, 'manager'), ds(el, 'tab')));

/* The engine places a strip's thumb from a cached left and width. A strip that wraps needs the chosen tab's line too,
   and the cache is stale once a resize moves a tab to another line, so a manager's strip is measured live, and again
   whenever the strip itself changes size (a page index or an open Details panel narrows it without a window resize). */
const o55InkSizes = typeof ResizeObserver === 'function' ? new ResizeObserver(() => moveTabInks()) : null;
const o55InkWatched = new WeakSet();
const o55InkMoves = new WeakMap();
let o55InkFrame = 0;
/* The engine's old measurement API is a request now. Its theme/resize/render callers used to measure immediately,
   write each ink, then measure the next strip and sticky state against dirty style. One frame reads every rectangle
   first, then writes every ink. A moving ink keeps its final layout box and carries its slide/stretch by transform. */
measureTabInks = function () { return null; };
moveTabInks = function () {
  if (o55InkFrame) return;
  o55InkFrame = 1;
  const fit = () => {
    o55InkFrame = 0;
    const panel = document.getElementById('panel-settings');
    if (panel && !panel.classList.contains('active')) return;
    const scroller = root.querySelector('#settings-document');
    const top = scroller ? scroller.getBoundingClientRect().top + 1 : 0;
    const rows = [...root.querySelectorAll('.workspace-tabs, .manager-tabs')].map(nav => {
      const btn = nav.querySelector('.workspace-tab.active, .manager-tab.active');
      const row = { nav, ink: nav.querySelector(':scope > .tab-ink'), btn,
        left: btn ? btn.offsetLeft : 0, width: btn ? btn.offsetWidth : 0,
        top: btn ? btn.offsetTop : 0, height: btn ? btn.offsetHeight : 0,
        manager: nav.matches('.pm51-mgr > .pm51-tabs'),
        stuck: !!(scroller && nav.matches('.pm51-mgr.has-manager-tabs > .pm51-tabs') && nav.getBoundingClientRect().top <= top) };
      const ink = row.ink;
      row.changed = !!(ink && (parseFloat(ink.style.left) !== row.left || parseFloat(ink.style.width) !== row.width ||
        (row.manager && (parseFloat(ink.style.top) !== row.top || parseFloat(ink.style.height) !== row.height))));
      if (ink && row.changed && !o55Still()) {
        const cs = getComputedStyle(ink), matrix = new DOMMatrixReadOnly(cs.transform);
        row.from = { left: (parseFloat(ink.style.left) || 0) + matrix.e, width: (parseFloat(ink.style.width) || 0) * matrix.a,
          top: (parseFloat(ink.style.top) || 0) + matrix.f, height: (parseFloat(ink.style.height) || row.height) * matrix.d };
        row.ease = o55Retro() ? 'steps(4, end)' : cs.getPropertyValue('--k3-ease-spring').trim() || 'cubic-bezier(.22,.8,.24,1)';
      }
      return row;
    });
    rows.forEach(row => {
      const { nav, btn } = row;
      if (row.manager && o55InkSizes && !o55InkWatched.has(nav)) { o55InkWatched.add(nav); o55InkSizes.observe(nav); }
      let ink = row.ink;
      if (!btn) { if (ink) ink.style.opacity = '0'; return; }
      if (!ink) { ink = document.createElement('span'); ink.className = 'tab-ink'; ink.setAttribute('aria-hidden', 'true'); }
      /* Left/width transitions relaid out the document during every ink frame. Set the destination once and carry
         the same slide and stretch by transform. Retargeting starts from the actually drawn transform, read above. */
      ink.style.transition = o55Still() ? 'none' : 'opacity 160ms ease';
      ink.style.transformOrigin = '0 0';
      const previous = o55InkMoves.get(ink);
      if (previous && (row.changed || o55Still())) { previous.cancel(); o55InkMoves.delete(ink); }
      Object.assign(ink.style, { left: row.left + 'px', width: row.width + 'px', opacity: '1' });
      if (row.manager) Object.assign(ink.style, { top: row.top + 'px', height: row.height + 'px', bottom: 'auto' });
      if (!row.ink) nav.appendChild(ink);
      if (row.from && row.from.width > 0 && row.width > 0) {
        const from = row.from, dy = row.manager ? from.top - row.top : 0, sy = row.manager && row.height ? from.height / row.height : 1;
        const move = ink.animate([{ transform: `translate(${from.left - row.left}px, ${dy}px) scale(${from.width / row.width}, ${sy})` }, { transform: 'none' }],
          { duration: (row.manager ? 420 : 320) * (typeof o55SpeedFactor === 'number' ? o55SpeedFactor : 1), easing: row.ease });
        o55InkMoves.set(ink, move);
        const done = () => { if (o55InkMoves.get(ink) === move) o55InkMoves.delete(ink); };
        move.finished.then(done, done);
      }
      if (row.manager) nav.classList.toggle('is-stuck', row.stuck);
    });
  };
  /* Selection and mounting have changed the strip. The first layout delivery supplies its final geometry; a
     pre-layout rAF read forced the just-mounted workspace (81 ms on the P1000). All strip reads still precede
     every ink write, and the existing transform animation retains its duration, curve and retargeting. */
  requestAnimationFrame(() => {
    /* A strip-size observer and the shell's resize kick can request this from another ResizeObserver delivery.
       Arm in the next frame's normal phase so a new root observation never starts inside a deeper delivery. */
    if (typeof ResizeObserver === 'function') {
      const ready = new ResizeObserver(() => { ready.disconnect(); fit(); }); ready.observe(root);
    } else fit();
  });
};

/* Arrow keys, Home and End move along the strip and choose the tab they land on, as in any tab list. */
root.addEventListener('keydown', e => {
  const tab = e.target && e.target.closest ? e.target.closest('.pm51-tabs .manager-tab') : null;
  if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
  const tabs = [...tab.parentElement.querySelectorAll(':scope > .manager-tab')], i = tabs.indexOf(tab);
  const next = tabs[e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
  if (!next || next === tab) return;
  e.preventDefault();
  const ws = next.dataset.manager, id = next.dataset.tab;
  PM51.switchTab(ws, id);
  const again = root.querySelector(`[data-pm51-manager="${cssEscape(ws)}"] > .pm51-tabs .manager-tab[data-tab="${cssEscape(id)}"]`);
  if (again) again.focus({ preventScroll: true });
});

/* A strip is stuck while its top sits at the top of the page's scroller; checked once a frame while that scrolls. */
function o55MarkStuck() {
  moveTabInks();
}
let o55StuckFrame = 0;
document.addEventListener('scroll', e => {
  if (!e.target || e.target.id !== 'settings-document' || o55StuckFrame) return;
  o55StuckFrame = requestAnimationFrame(() => { o55StuckFrame = 0; o55MarkStuck(); });
}, { capture: true, passive: true });

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
  /* the item's own More options lives in the view's More options (kit.js pm51OneMore): it changes with the detail */
  const oldMore = page.querySelector('[data-o55-item-more]'), nextMore = fresh.querySelector('[data-o55-item-more]');
  const moreBody = page.querySelector(':scope > .manager-body > .pm51-scroll > details.pm51-advanced > .pm51-advanced-body');
  if (nextMore) o55PostMount(nextMore);
  if (oldMore && nextMore) oldMore.replaceWith(nextMore);
  else if (oldMore) oldMore.remove();
  else if (nextMore && moreBody) moreBody.insertBefore(nextMore, moreBody.firstChild);
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
