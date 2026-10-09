/* PMR host: mounts the chosen concept into the shell without disturbing the shell's own rail.

   Two pages carry it. The published page (PMConcept7.html) holds only concept D, Polish: a skin that keeps the shell's
   panels and restyles them under html[data-rail-skin="d"] (written into the <html> tag at build time, so D's look is
   there from the first frame). The review copy (LeftRailPMConcept7.html) adds the view concepts A, B and C, their
   fixture (PMR.data) and the switcher.
   The original band stays: #activityBar, #sidePanelSlot and all nine .side-panel-view panels. For a view concept the
   host adds, on first use, a sibling <section class="pmr-view" data-pmr-for="panel-files"> per redesigned panel at the
   end of #sidePanelSlot; CSS (src/css/25-review.css) hides the original panel and shows its pmr-view whenever the
   original is .active, so every existing way of switching panels (icon click, Ctrl+1..9, cmd.panel.switch, the tour)
   keeps working unchanged. A skin concept creates no views.
   html[data-rail-concept="a|b|c|d|current"] scopes each concept's CSS; "current" (labelled Original) is the shell's own
   rail with every concept unmounted. A skin concept registers with skin: true and mount(ctx) -> { show(info),
   destroy() } instead of render().

   A concept registers itself:
     PMR.concepts.register('a', {
       label: 'Ledger', blurb: 'Read it in place',
       render(panel, view, ctx) -> { show?(info), hide?(), destroy?() },   // panel = PMR.data.files | source | docker
       bar?(barEl, ctx) -> { panel?(target), destroy?() },               // activity bar treatment
       overlay?: true,                                                    // uses PMR.host.overlay() (Lens)
     });
   ctx = { concept, panelId, target, isShown(), rerender() } */

const CONCEPTS = new Map();
const HOST = { views: {}, inst: {}, bar: null, concept: null, observers: [] };
const ORDER = ['a', 'b', 'c', 'd', 'current'];

/* the panels the view concepts redraw, in rail order, and their original .side-panel-view ids (a skin is told about
   all nine rail panels: notifyShown) */
PMR.PANELS = [
  { id: 'files', target: 'panel-files' },
  { id: 'source', target: 'panel-source' },
  { id: 'docker', target: 'panel-docker' },
];
PMR.panelFor = target => PMR.PANELS.find(p => p.target === target || p.id === target) || null;

PMR.concepts = {
  register(id, def) { CONCEPTS.set(id, Object.assign({ id }, def)); },
  get: id => CONCEPTS.get(id) || null,
  list() {
    const out = ORDER.filter(id => id === 'current' || CONCEPTS.has(id)).map(id => (id === 'current'
      ? { id, label: 'Original', blurb: 'The rail before Polish' }
      : { id, label: CONCEPTS.get(id).label, blurb: CONCEPTS.get(id).blurb || '' }));
    return out;
  },
  current: () => HOST.concept,
  set: id => setConcept(id, { animate: true }),
};

function slot() { return document.getElementById('sidePanelSlot'); }
function isShown(target) {
  const s = slot(), p = document.getElementById(target);
  return !!(s && p && !s.classList.contains('hidden') && p.classList.contains('active'));
}
function activeTarget() {
  const p = slot() && slot().querySelector(':scope > .side-panel-view.active');
  return p ? p.id : null;
}

function ensureViews() {
  const s = slot();
  if (!s) return false;
  PMR.PANELS.forEach(p => {
    let v = HOST.views[p.id];
    if (!v || !v.isConnected) {
      v = PMR.h('section', { class: 'pmr-view', id: 'pmr-view-' + p.id, 'data-pmr-for': p.target, 'aria-label': ((PMR.data && PMR.data[p.id]) || {}).title || p.id });
      s.appendChild(v);
      HOST.views[p.id] = v;
    }
  });
  return true;
}

function teardown() {
  Object.keys(HOST.inst).forEach(k => { const i = HOST.inst[k]; try { if (i && i.destroy) i.destroy(); } catch (e) { console.error('[pm-rail] destroy', k, e); } });
  HOST.inst = {};
  if (HOST.bar) { try { if (HOST.bar.destroy) HOST.bar.destroy(); } catch (e) { console.error('[pm-rail] bar destroy', e); } }
  HOST.bar = null;
  Object.values(HOST.views).forEach(v => { v.textContent = ''; v.className = 'pmr-view'; v.removeAttribute('data-concept'); });
  const ov = document.getElementById('pmr-overlay');
  if (ov) ov.textContent = '';
  PMR.menu.closeAll();
}

function mountConcept(id) {
  const def = CONCEPTS.get(id);
  if (!def) return;
  if (def.skin) {
    /* a skin concept keeps the shell's own panels and restyles them (html[data-rail-skin]); it renders no views */
    try { HOST.inst.skin = (def.mount && def.mount({ concept: id, isShown, activeTarget })) || {}; }
    catch (e) { console.error('[pm-rail] concept ' + id + ' mount', e); }
    const barEl = document.getElementById('activityBar');
    if (def.bar && barEl) { try { HOST.bar = def.bar(barEl, { concept: id, activeTarget }) || null; } catch (e) { console.error('[pm-rail] concept ' + id + ' bar', e); } }
    return;
  }
  /* a view concept draws into the host's sections, made on first use (review copy only) */
  if (!ensureViews()) return;
  PMR.PANELS.forEach(p => {
    const v = HOST.views[p.id];
    const panel = PMR.data ? PMR.data[p.id] : null;
    v.classList.add('pmr-view-' + id);
    v.setAttribute('data-concept', id);
    if (!panel) { v.appendChild(PMR.h('div.pmr-missing', { text: 'This panel has no data yet.' })); return; }
    const ctx = {
      concept: id, panelId: p.id, target: p.target,
      isShown: () => isShown(p.target),
      rerender() { try { const old = HOST.inst[p.id]; if (old && old.destroy) old.destroy(); } catch (e) { /* ignore */ } v.textContent = ''; HOST.inst[p.id] = def.render(panel, v, ctx) || {}; },
    };
    try { HOST.inst[p.id] = def.render(panel, v, ctx) || {}; }
    catch (e) { console.error('[pm-rail] concept ' + id + ' render ' + p.id, e); v.appendChild(PMR.h('div.pmr-missing', { text: 'This concept failed to draw this panel.' })); }
  });
  const bar = document.getElementById('activityBar');
  if (def.bar && bar) {
    try { HOST.bar = def.bar(bar, { concept: id, activeTarget }) || null; } catch (e) { console.error('[pm-rail] concept ' + id + ' bar', e); }
  }
}

function setConcept(id, opts) {
  opts = opts || {};
  if (!ORDER.includes(id) || (id !== 'current' && !CONCEPTS.has(id))) id = 'current';
  if (id === HOST.concept && !opts.force) return;
  const s = slot();
  if (!s) return;
  const swap = () => {
    teardown();
    HOST.concept = id;
    /* the root attributes are written only when they change: the published page carries data-rail-concept="d" and
       data-rail-skin="d" in its <html> tag, and re-setting an attribute on <html> restyles the whole document */
    const root = document.documentElement;
    if (root.getAttribute('data-rail-concept') !== id) root.setAttribute('data-rail-concept', id);
    const skinDef = CONCEPTS.get(id);
    if (skinDef && skinDef.skin) { if (root.getAttribute('data-rail-skin') !== id) root.setAttribute('data-rail-skin', id); }
    else if (root.hasAttribute('data-rail-skin')) root.removeAttribute('data-rail-skin');
    if (id !== 'current') mountConcept(id);
    const t = activeTarget();
    if (t) notifyShown(t, { reason: 'concept' });
    document.dispatchEvent(new CustomEvent('pmr:concept', { detail: { id } }));
  };
  if (opts.animate && s && !PMR.motion.reduced()) {
    const out = PMR.motion.animate(s, [{ opacity: 1 }, { opacity: 0 }], { dur: 'fast', fill: 'forwards' });
    const go = () => { swap(); const back = PMR.motion.animate(s, [{ opacity: 0 }, { opacity: 1 }], { dur: 'med' }); if (back) back.onfinish = () => back.cancel(); if (out) out.cancel(); };
    if (out) out.onfinish = go; else go();
  } else swap();
}

function notifyShown(target, info) {
  const p = PMR.panelFor(target);
  if (HOST.bar && HOST.bar.panel) { try { HOST.bar.panel(target, info); } catch (e) { console.error('[pm-rail] bar panel', e); } }
  /* a skin restyles every rail panel, not only the three the view concepts redraw */
  const skin = HOST.inst.skin;
  if (skin && skin.show) { try { skin.show(Object.assign({ target, panelId: p ? p.id : target }, info)); } catch (e) { console.error('[pm-rail] skin show', target, e); } }
  if (!p) return;
  const inst = HOST.inst[p.id];
  if (inst && inst.show) { try { inst.show(Object.assign({ target }, info)); } catch (e) { console.error('[pm-rail] show', p.id, e); } }
}

/* panel changes: the shell flips .active on its panels and .hidden on the slot; watch both */
function watchPanels() {
  const s = slot();
  if (!s) return;
  let last = activeTarget(), lastHidden = s.classList.contains('hidden');
  const check = () => {
    const now = activeTarget(), hidden = s.classList.contains('hidden');
    if ((now !== last || hidden !== lastHidden) && now && !hidden) notifyShown(now, { reason: 'switch', from: last });
    if (now !== last || hidden !== lastHidden) {
      Object.keys(HOST.inst).forEach(k => {
        const p = PMR.PANELS.find(x => x.id === k);
        const inst = HOST.inst[k];
        if (p && inst && inst.hide && p.target === last && (p.target !== now || hidden)) { try { inst.hide(); } catch (e) { /* ignore */ } }
      });
    }
    last = now; lastHidden = hidden;
  };
  const mo = new MutationObserver(check);
  mo.observe(s, { attributes: true, attributeFilter: ['class'] });
  Array.from(s.querySelectorAll(':scope > .side-panel-view')).forEach(v => mo.observe(v, { attributes: true, attributeFilter: ['class'] }));
  HOST.observers.push(mo);
}

/* a transient layer beside the rail for concepts that show detail outside it (Lens). It sits over the editor, never
   pushes the layout, and is positioned against the slot's right edge. */
PMR.host = {
  slot, isShown, activeTarget,
  view: id => HOST.views[id] || null,
  overlay() {
    let ov = document.getElementById('pmr-overlay');
    if (!ov) { ov = PMR.h('div#pmr-overlay', { 'aria-live': 'polite' }); document.body.appendChild(ov); }
    return ov;
  },
  slotRect() { const s = slot(); return s ? s.getBoundingClientRect() : null; },
  ensureViews, setConcept, watchPanels,
};
