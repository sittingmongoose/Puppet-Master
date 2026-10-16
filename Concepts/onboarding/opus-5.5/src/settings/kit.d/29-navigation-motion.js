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
      /* The in-place shell patch retains #workspace-stage while replacing its chapter children. That retained
         container still needs the incoming motion; identity alone does not mean the old chapter survived. */
      if (!next || !next.isConnected || !moving) return;
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
let o55NierAckTicket = 0, o55NierAckDesired = null;
dispatchAction = function (action, el) {
  const args = arguments;
  /* A reduced-motion NieR click still saved and rebuilt its row before the calm cover could paint (166–236 ms
     in the P1000 click handler). Paint the switch's existing selected style first, then perform that same write.
     Coalesce repeated input to the latest desired value; a refused write restores the owner's actual row. */
  if (action === 'toggle-setting' && ds(el, 'setting') === 'general.visual.nier-mode' &&
      args[2] && args[2].isTrusted && o55Still() && !state.settingsProjectionReadOnly &&
      !el.disabled && el.getAttribute('aria-disabled') !== 'true') {
    const id = 'general.visual.nier-mode', ticket = ++o55NierAckTicket;
    o55NierAckDesired = o55NierAckDesired === null ? !o55On(PM51.value(id)) : !o55NierAckDesired;
    el.classList.toggle('on', o55NierAckDesired); el.setAttribute('aria-checked', String(o55NierAckDesired));
    if (el.hasAttribute('aria-pressed')) el.setAttribute('aria-pressed', String(o55NierAckDesired));
    o55AfterPaint(() => {
      if (ticket !== o55NierAckTicket) return;
      const desired = o55NierAckDesired; o55NierAckDesired = null;
      try { if (o55On(PM51.value(id)) !== desired) o55NavDispatch.apply(this, args); }
      finally {
        const actual = o55On(PM51.value(id));
        if (el.isConnected && (el.classList.contains('on') !== actual || el.getAttribute('aria-checked') !== String(actual))) refreshSettingRow(id);
      }
    });
    return;
  }
  if (action !== 'jump-workspace') return o55NavDispatch.apply(this, args);
  return o55NavRun(() => o55NavDispatch.apply(this, args), `.workspace-tab[data-workspace="${cssEscape(ds(el, 'workspace'))}"]`, false);
};
