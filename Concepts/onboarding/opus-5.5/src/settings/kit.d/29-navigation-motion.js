/* Navigation acknowledges the destination before building it. The outgoing chapter starts moving on the compositor
   before the build task, then the incoming chapter arrives after its first layout. No snapshot capture pauses the
   compositor, and no duplicate live IDs or rows are introduced. Rapid requests coalesce to the latest destination. */
let o55NavTicket = 0, o55NavRunning = false, o55NavLeaving = null;
function o55NavVisible() {
  const panel = document.getElementById('panel-settings');
  return !!(panel && panel.classList.contains('active') && root.querySelector('#workspace-stage'));
}
function o55NavAck(selector) {
  root.querySelectorAll('[data-o55-nav-pending]').forEach(n => n.removeAttribute('data-o55-nav-pending'));
  if (selector) root.querySelectorAll(selector).forEach(n => n.setAttribute('data-o55-nav-pending', ''));
}
function o55NavRun(work, selector, chapter) {
  if (o55NavRunning || !o55NavVisible()) return work();
  const ticket = ++o55NavTicket;
  o55NavAck(selector);
  const commit = () => {
    if (ticket !== o55NavTicket) return;
    o55NavRunning = true;
    try { work(); } finally { o55NavRunning = false; o55NavAck(null); }
  };
  if (o55NavLeaving) { o55NavLeaving.cancel(); o55NavLeaving = null; }
  const stage = root.querySelector('#workspace-stage');
  const moving = chapter && !o55Still() && stage;
  if (moving) o55NavLeaving = stage.animate([
    { opacity: 1, transform: 'none' }, { opacity: .55, transform: 'translateY(-4px)' }
  ], { duration: 260, easing: 'ease-out', fill: 'forwards' });
  o55AfterPaint(() => {
    if (ticket !== o55NavTicket) return;
    commit();
    const next = root.querySelector('#workspace-stage');
    const arrive = () => {
      if (ticket !== o55NavTicket) return;
      if (o55NavLeaving) { o55NavLeaving.cancel(); o55NavLeaving = null; }
      if (!next || !next.isConnected || !moving || next === stage) return;
      next.animate([{ opacity: .55, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }],
        { duration: 180, easing: 'cubic-bezier(.22,.8,.24,1)' });
    };
    if (moving && next && typeof ResizeObserver === 'function') {
      const ready = new ResizeObserver(() => { ready.disconnect(); arrive(); }); ready.observe(next);
    } else arrive();
  });
}
const o55NavNavigate = navigate;
navigate = function (domainId, workspaceId, options) {
  const args = arguments, domain = getDomain(domainId), chapter = state.home || state.domain !== domain.id;
  return o55NavRun(() => o55NavNavigate.apply(this, args), `.domain-link[data-domain="${cssEscape(domain.id)}"]`, chapter);
};
const o55NavHome = goHome;
goHome = function () {
  const args = arguments;
  return o55NavRun(() => o55NavHome.apply(this, args), '[data-action="home"]', !state.home);
};
const o55NavDispatch = dispatchAction;
dispatchAction = function (action, el) {
  const args = arguments;
  if (action !== 'jump-workspace') return o55NavDispatch.apply(this, args);
  return o55NavRun(() => o55NavDispatch.apply(this, args), `.workspace-tab[data-workspace="${cssEscape(ds(el, 'workspace'))}"]`, false);
};
