/* Navigation acknowledges the destination before building it: the switcher's chip leaves for the chosen chapter (glass.js
   STRIPS, the left bar) and a section tab's ink moves, in the frame of the press, while the old chapter is still painted;
   the build follows. No snapshot capture pauses the compositor, and no duplicate live IDs or rows are introduced. Rapid
   requests coalesce to the latest destination.
   FO-196 (Jared, 2026-11-13: "the settings page when switching chapters has really janky animations on all themes"): the
   chapter itself has one entrance, its layout's own (.page-enter, pageIn: 4 px and a tenth of its opacity, which each look
   times, Retro in steps, and Reduce Motion stills). This stage also faded the old chapter to .55 and lifted it 4 px while
   the new one was built, then dropped it 8 px and brought the new one in from .55 and 4 px low on top of pageIn's 4 px:
   the chapter rose 8 px, from a dim hold (the heading 165 -> 157 px in Basic, 184 -> 176 in Glass; triage-motion). */
let o55NavTicket = 0, o55NavRunning = false;
const o55NavWaits = new Set();
function o55NavVisible() {
  const panel = document.getElementById('panel-settings');
  return !!(panel && panel.classList.contains('active') && root.querySelector('#workspace-stage'));
}
function o55NavAck(selector) {
  root.querySelectorAll('[data-o55-nav-pending]').forEach(n => n.removeAttribute('data-o55-nav-pending'));
  if (selector) root.querySelectorAll(selector).forEach(n => {
    n.setAttribute('data-o55-nav-pending', '');
    if (n.classList.contains('workspace-tab')) {
      /* Move the existing selected plate in the acknowledgement frame, while the old workspace is still painted.
         Hydration and exact-position scrolling follow after that paint; the ink carries the same 320 ms motion. */
      n.parentElement.querySelectorAll('.workspace-tab').forEach(tab => {
        const on = tab === n; tab.classList.toggle('active', on);
        if (tab.hasAttribute('aria-selected')) tab.setAttribute('aria-selected', String(on));
      });
      moveTabInks();
    }
  });
}
function o55NavCancel() {
  ++o55NavTicket;
  o55NavWaits.forEach(cancel => cancel());
  o55NavAck(null);
}
/* ResizeObserver can skip a delivery, or the tab can hide before its queued frame. Bound both waits, disconnect
   superseded observers, and run each continuation at most once. Normal visible navigation still waits for layout. */
function o55NavWait(ticket, node, next) {
  let done = false, ready = null;
  const cancel = () => {
    if (done) return;
    done = true; clearTimeout(timer); if (ready) ready.disconnect(); o55NavWaits.delete(cancel);
  };
  const finish = () => { if (done) return; cancel(); if (ticket === o55NavTicket) next(); };
  const timer = setTimeout(finish, 120);
  o55NavWaits.add(cancel);
  if (node && typeof ResizeObserver === 'function') {
    ready = new ResizeObserver(finish); ready.observe(node);
  } else o55AfterPaint(finish);
}
function o55NavRun(work, selector, chapter, prepare) {   /* (chapter: a chapter changes; its entrance is the layout's own) */
  if (o55NavRunning) return work();
  o55NavCancel();
  if (!o55NavVisible()) return work();
  const ticket = o55NavTicket;
  o55NavAck(selector);
  const commit = () => {
    if (ticket !== o55NavTicket) return;
    o55NavRunning = true;
    try { work(); } finally { o55NavRunning = false; o55NavAck(null); }
  };
  const complete = () => {
    if (ticket !== o55NavTicket) return;
    try { commit(); } catch (error) { o55NavCancel(); throw error; }
  };
  o55NavWait(ticket, null, () => {
    if (ticket !== o55NavTicket) return;
    if (!prepare || !prepare() || typeof ResizeObserver !== 'function') { complete(); return; }
    /* A cold workspace hydrates its preceding blocks for an exact landing. Let their first layout finish before
       the existing landing path reads its offset; measuring immediately forced that layout in the input follow-up
       (48 ms M3 / 222 ms P1000). The destination ink is already travelling during this work. */
    const scroller = root.querySelector('#settings-document');
    if (!scroller) { complete(); return; }
    o55NavWait(ticket, scroller, complete);
  });
}
const o55NavNavigate = navigate;
navigate = function (domainId, workspaceId, options) {
  /* Programmatic callers synchronously refresh or open the destination (provider/history search, deep links).
     Keep that contract and its return value. Only the navigation action below defers its visual work. */
  if (!o55NavRunning) o55NavCancel();
  return o55NavNavigate.apply(this, arguments);
};
const o55NavHome = goHome;
goHome = function () {
  if (!o55NavRunning) o55NavCancel();
  return o55NavHome.apply(this, arguments);
};
const o55NavDispatch = dispatchAction;
dispatchAction = function (action, el) {
  const args = arguments;
  if (action === 'home') return o55NavRun(() => o55NavDispatch.apply(this, args), '[data-action="home"]', !state.home);
  if (action === 'navigate-domain' || action === 'navigate') {
    const domain = getDomain(ds(el, 'domain'));
    return o55NavRun(() => o55NavDispatch.apply(this, args), `.domain-link[data-domain="${cssEscape(domain.id)}"]`, state.home || state.domain !== domain.id);
  }
  if (action !== 'jump-workspace') return o55NavDispatch.apply(this, args);
  const ws = ds(el, 'workspace');
  const prepare = () => {
    const ids = getDomain().workspaces.map(w => w.id), to = ids.indexOf(ws);
    const cold = ids.slice(0, to + 1).some(id => root.querySelector(`[data-continuous-workspace-body="${cssEscape(id)}"][data-workspace-mounted="false"]`));
    if (!cold) return false;
    PLACE.nav(); pm51MountPreceding(ws); mountContinuousWorkspace(ws);
    return true;
  };
  return o55NavRun(() => o55NavDispatch.apply(this, args), `.workspace-tab[data-workspace="${cssEscape(ws)}"]`, false, prepare);
};
