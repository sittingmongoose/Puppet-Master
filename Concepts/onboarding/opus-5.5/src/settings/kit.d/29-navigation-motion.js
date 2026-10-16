/* Navigation acknowledges the destination before building it. The outgoing chapter starts moving on the compositor
   before the build task, then the incoming chapter arrives after its first layout. No snapshot capture pauses the
   compositor, and no duplicate live IDs or rows are introduced. Rapid requests coalesce to the latest destination. */
let o55NavTicket = 0, o55NavLanding = 0, o55NavRunning = false, o55NavLeaving = null;
let o55NavStage = null, o55NavWatched = null;
const o55NavStageHeights = new WeakMap();
const o55NavStageSize = typeof ResizeObserver === 'function' ? new ResizeObserver(entries => {
  entries.forEach(e => { if (e.contentRect.height > 0) o55NavStageHeights.set(e.target, e.contentRect.height); });
}) : null;
const o55NavAfterRender = afterRender;
afterRender = function () {
  /* A chapter's pending jump used to measure its fresh document inside afterRender, before its first layout.
     Keep the workspace and optional section together: hydrate first, then take their normal landing path after
     layout. Splitting the two jumps would let the workspace jump overwrite an exact search/section destination. */
  const target = !state.home && pendingScroll && !(softRemount && preservedScrollTop != null) ? pendingScroll : null;
  const ticket = o55NavTicket, landing = target ? ++o55NavLanding : o55NavLanding, domain = state.domain;
  if (target) { pendingScroll = null; suppressScrollSpyUntil = performance.now() + 1200; }
  const r = o55NavAfterRender.apply(this, arguments), stage = root.querySelector('#workspace-stage');
  if (o55NavStageSize && stage !== o55NavWatched) {
    o55NavStageSize.disconnect(); o55NavWatched = stage;
    if (stage) o55NavStageSize.observe(stage);
  }
  if (target) {
    const scroller = root.querySelector('#settings-document');
    pm51MountPreceding(target.workspace); mountContinuousWorkspace(target.workspace);
    const land = () => {
      if (ticket !== o55NavTicket || landing !== o55NavLanding || state.home || state.domain !== domain || !scroller ||
          !scroller.isConnected || scroller !== root.querySelector('#settings-document')) return;
      jumpToWorkspace(target.workspace, 'auto');
      if (target.section) scrollToSection(target.section, false);
    };
    if (window.PM_AFTER_LAYOUT) window.PM_AFTER_LAYOUT(land); else o55AfterPaint(land);
  }
  return r;
};
/* Title decoding belongs to the incoming surface's reveal, after its layout. Starting it at DOM commit both
   forced that layout and spent the effect while the incoming surface was still behind the outgoing one. */
function o55NavOnShown(node, run) {
  const held = o55NavStage;
  if (held && held.retained && held.next && held.next.contains(node)) {
    (held.onShown || (held.onShown = [])).push(run);
    return;
  }
  const shown = () => { if (node.isConnected && node.getClientRects().length) run(); };
  if (window.PM_AFTER_LAYOUT) window.PM_AFTER_LAYOUT(shown); else o55AfterPaint(shown);
}
function o55NavReleaseStage() {
  const held = o55NavStage; o55NavStage = null;
  if (o55NavLeaving) { o55NavLeaving.cancel(); o55NavLeaving = null; }
  if (!held) return;
  if (held.arrival) { try { held.arrival.finish(); } catch (_) {} }
  if (held.next) { held.next.style.removeProperty('opacity'); held.next.style.removeProperty('z-index'); }
  if (held.tabs) held.tabs.style.zIndex = held.tabZ;
  if (held.retained) held.old.remove();
}
function o55NavRetainStage(old, next) {
  const held = o55NavStage;
  if (!held || held.old !== old || held.ticket !== o55NavTicket || !held.height || next.id !== 'workspace-stage') return false;
  held.retained = true; held.next = next;
  held.tabs = old.parentNode.querySelector(':scope > .workspace-tabs');
  if (held.tabs) { held.tabZ = held.tabs.style.zIndex; held.tabs.style.zIndex = '2'; }
  old.classList.add('o55-leaving'); old.setAttribute('aria-hidden', 'true'); old.inert = true;
  [old, ...old.querySelectorAll('[id]')].forEach(n => n.removeAttribute('id'));
  Object.assign(old.style, { position: 'absolute', left: '0', right: '0', bottom: '0', height: held.height + 'px', zIndex: '0', pointerEvents: 'none' });
  /* A nonzero opacity gets the incoming surface rastered while the outgoing one still carries the reader's place. */
  next.style.opacity = '.01'; next.style.zIndex = '1';
  return true;
}
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
function o55NavRun(work, selector, chapter, prepare) {
  if (o55NavRunning || !o55NavVisible()) return work();
  const ticket = ++o55NavTicket;
  o55NavAck(selector);
  const commit = () => {
    if (ticket !== o55NavTicket) return;
    o55NavRunning = true;
    try { work(); } finally { o55NavRunning = false; o55NavAck(null); }
  };
  o55NavReleaseStage();
  const stage = root.querySelector('#workspace-stage');
  const moving = chapter && !o55Still() && stage;
  if (moving) {
    o55NavStage = { old: stage, height: o55NavStageHeights.get(stage), ticket };
    /* The original 260 ms exit is followed by a quiet continuation only while layout is still busy. Both run on the
       compositor; a slow layout cannot leave the reader staring at an ended animation. Arrival never waits for it. */
    o55NavLeaving = stage.animate([
      { opacity: 1, transform: 'none', easing: 'ease-out' },
      { opacity: .55, transform: 'translateY(-4px)', offset: 260 / 1200, easing: 'linear' },
      { opacity: .3, transform: 'translateY(-20px)' }
    ], { duration: 1200, easing: 'linear', fill: 'forwards' });
  }
  const complete = () => {
    if (ticket !== o55NavTicket) return;
    commit();
    const next = root.querySelector('#workspace-stage');
    const arrive = () => {
      if (ticket !== o55NavTicket) return;
      const held = o55NavStage;
      if (held && held.retained && next && next.isConnected) {
        o55AfterPaint(() => {
          if (ticket !== o55NavTicket || o55NavStage !== held || !next.isConnected) return;
          const cs = getComputedStyle(held.old), from = { opacity: cs.opacity, transform: cs.transform };
          if (o55NavLeaving) { o55NavLeaving.cancel(); o55NavLeaving = null; }
          (held.onShown || []).splice(0).forEach(run => run());
          next.style.removeProperty('opacity');
          held.arrival = next.animate([{ opacity: .01, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }],
            { duration: 180, easing: 'cubic-bezier(.22,.8,.24,1)' });
          const out = held.old.animate([from, { opacity: 0, transform: 'translateY(-20px)' }],
            { duration: 180, easing: 'ease-out', fill: 'forwards' });
          const done = () => { if (o55NavStage === held) o55NavReleaseStage(); };
          Promise.all([held.arrival.finished, out.finished]).then(done, done);
        });
        return;
      }
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
  };
  o55AfterPaint(() => {
    if (ticket !== o55NavTicket) return;
    if (!prepare || !prepare() || typeof ResizeObserver !== 'function') { complete(); return; }
    /* A cold workspace hydrates its preceding blocks for an exact landing. Let their first layout finish before
       the existing landing path reads its offset; measuring immediately forced that layout in the input follow-up
       (48 ms M3 / 222 ms P1000). The destination ink is already travelling during this work. */
    const scroller = root.querySelector('#settings-document');
    if (!scroller) { complete(); return; }
    const ready = new ResizeObserver(() => {
      ready.disconnect();
      if (scroller.isConnected && scroller === root.querySelector('#settings-document')) complete();
    });
    ready.observe(scroller);
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
