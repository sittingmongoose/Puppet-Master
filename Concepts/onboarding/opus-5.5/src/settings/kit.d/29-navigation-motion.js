/* Navigation acknowledges the destination before building it. Keep the current chapter readable while its successor
   is prepared; a scoped snapshot crossfade retains its pixels through the handoff, without duplicate live IDs, rows,
   or observers. Ordinary row edits still use the in-place renderer. Rapid requests coalesce to the latest destination. */
let o55NavTicket = 0, o55NavRunning = false, o55NavTransition = null;
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
  o55AfterPaint(() => {
    if (ticket !== o55NavTicket) return;
    if (!chapter || o55Still() || typeof document.startViewTransition !== 'function') { commit(); return; }
    if (o55NavTransition) o55NavTransition.skipTransition();
    const html = document.documentElement;
    html.classList.add('o55-settings-transition');
    const transition = document.startViewTransition(() => {
      commit();
      /* afterRender is already queued; let it place the first viewport before the incoming picture is taken. */
      return new Promise(resolve => requestAnimationFrame(resolve));
    });
    o55NavTransition = transition;
    const done = () => {
      if (o55NavTransition !== transition) return;
      o55NavTransition = null; html.classList.remove('o55-settings-transition');
    };
    transition.finished.then(done, done);
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
