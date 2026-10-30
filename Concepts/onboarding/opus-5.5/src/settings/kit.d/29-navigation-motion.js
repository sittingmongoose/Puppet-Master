/* Navigation acknowledges the destination before building it. The outgoing chapter starts moving on the compositor
   before the build task, then the incoming chapter arrives after its first layout. No snapshot capture pauses the
   compositor, and no duplicate live IDs or rows are introduced. Rapid requests coalesce to the latest destination. */
let o55NavTicket = 0, o55NavRunning = false, o55NavLeaving = null;
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
  if (o55NavLeaving) { o55NavLeaving.cancel(); o55NavLeaving = null; }
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
function o55NavRun(work, selector, chapter, prepare) {
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
  const stage = root.querySelector('#workspace-stage');
  const moving = chapter && !o55Still() && stage;
  if (moving) o55NavLeaving = stage.animate([
    { opacity: 1, transform: 'none' }, { opacity: .55, transform: 'translateY(-4px)' }
  ], { duration: 260, easing: 'ease-out', fill: 'forwards' });
  const complete = () => {
    if (ticket !== o55NavTicket) return;
    try { commit(); } catch (error) { o55NavCancel(); throw error; }
    const next = root.querySelector('#workspace-stage');
    const arrive = () => {
      if (ticket !== o55NavTicket) return;
      if (o55NavLeaving) { o55NavLeaving.cancel(); o55NavLeaving = null; }
      /* The in-place shell patch retains #workspace-stage while replacing its chapter children. That retained
         container still needs the incoming motion; identity alone does not mean the old chapter survived. */
      if (!next || !next.isConnected || !moving) return;
      next.animate([{ opacity: .55, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }],
        { duration: 180, easing: 'cubic-bezier(.22,.8,.24,1)' });
    };
    if (moving && next && typeof ResizeObserver === 'function') {
      o55NavWait(ticket, next, arrive);
    } else arrive();
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
