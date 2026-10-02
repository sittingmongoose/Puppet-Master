/* Concept C — Lens ("detail beside the rail"). Scan in the rail, read in the lens.
   The rail is a compact index: one 30 px line per item (type icon, name, status letter or glyph). Everything else
   about an item lives in the Lens, a sheet that grows out of the selected row into the space beside the rail, over
   the editor, only while it is needed (src/concepts/c/05-lens.js). Sub-views are morphing icon tabs; the panel title
   is a chat-style menu of every view. Files in this folder share one wrapper scope; names are prefixed to stay unique.

   00-c.js   shared helpers: kinds, state, middle truncation, action rows, icon tools with overflow, menus
   05-lens.js the Lens engine (placement beside the slot, beak, open / follow / close motion per theme family)
   08-panel.js the panel framework (head, identity line, morphing tabs, index list, sections, keyboard, footer)
   10/20/30  Files, Source Control, Docker specs     40-bar.js  the activity bar and its status board */

const h = PMR.h;
const U = PMR.util;
const MO = PMR.motion;
const C_SPECS = {};

const KIND_ICON = {
  folder: 'folder', file: 'file', changed: 'file', open: 'file', recent: 'clock', change: 'file', worktree: 'branch',
  commit: 'clock', branch: 'branch', stash: 'stash', remote: 'globe', review: 'pr', gate: 'actions', conflict: 'merge',
  operation: 'layers', bookmark: 'pin', 'current-change': 'edit', fact: 'info', container: 'layers', image: 'camera',
  service: 'compose', scenario: 'play', registry: 'globe', 'build-target': 'cog', stage: 'upload', network: 'link',
  volume: 'stash', context: 'monitor', k8s: 'cog', event: 'bell', summary: 'flame', section: 'info', panel: 'info',
};
const KIND_WORD = {
  folder: 'Folder', file: 'File', changed: 'Changed file', open: 'Open editor', recent: 'Recent file', change: 'Changed file',
  worktree: 'Worktree', commit: 'Commit', branch: 'Branch', stash: 'Stash', remote: 'Push target', review: 'Review',
  gate: 'Check', conflict: 'Conflict', operation: 'Operation', bookmark: 'Bookmark', 'current-change': 'Current change',
  fact: 'Detail', container: 'Container', image: 'Image', service: 'Compose service', scenario: 'Compose scenario',
  registry: 'Registry', 'build-target': 'Build settings', stage: 'Publish step', network: 'Network', volume: 'Volume',
  context: 'Docker context', k8s: 'Kubernetes', event: 'Event', summary: 'Summary', section: 'Section', panel: 'Panel',
};

/* per-viewer view memory (survives a concept switch through PMR.state) */
const CST = {
  get: (k, d) => PMR.state.get('c.' + k, d),
  set: (k, v) => PMR.state.set('c.' + k, v),
};

const cClamp = U.clamp;
const cPlural = U.plural;
const cOn = (el, ev, fn, opts) => { el.addEventListener(ev, fn, opts); return () => el.removeEventListener(ev, fn, opts); };

/* ---------- middle truncation that keeps the extension, fitted to the measured width ------------------------------ */
const C_MEASURE = document.createElement('canvas').getContext('2d');
const C_FONT_CACHE = new Map();
function cFontOf(el) {
  const key = (el.classList.contains('is-mono') ? 'm' : 's') + (el.classList.contains('is-strong') ? 'b' : '');
  let f = C_FONT_CACHE.get(key);
  if (!f) { const cs = getComputedStyle(el); f = { font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, ls: parseFloat(cs.letterSpacing) || 0 }; C_FONT_CACHE.set(key, f); }
  return f;
}
function cFitName(el) {
  const full = el.dataset.full;
  if (full == null) return;
  const w = el.clientWidth;
  if (!w) return;
  const f = cFontOf(el);
  C_MEASURE.font = f.font;
  const width = s => C_MEASURE.measureText(s).width + f.ls * s.length;
  if (width(full) <= w - 1) { if (el.textContent !== full) el.textContent = full; return; }
  let lo = 5, hi = full.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (width(U.midName(full, mid)) <= w - 2) lo = mid; else hi = mid - 1;
  }
  el.textContent = U.midName(full, lo);
}
function cFitNames(root) { if (root) root.querySelectorAll('.pmr-c-name[data-full]').forEach(cFitName); }
/* theme changes alter fonts: drop the cache */
const C_THEME_MO = new MutationObserver(() => C_FONT_CACHE.clear());
C_THEME_MO.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier'] });

/* ---------- running an action without a visible button (Enter / double-click run the row's primary action) ------- */
function cRunAction(a, host) {
  if (!a) return;
  const b = h('button', Object.assign({ type: 'button', class: 'pmr-c-ghost', tabindex: '-1', 'aria-hidden': 'true' }, PMR.actionAttrs(a)));
  (host || document.body).appendChild(b);
  b.click();
  setTimeout(() => b.remove(), 0);
}

/* ---------- actions sorted for the Lens: primary first, destructive last --------------------------------------- */
function cSortActions(list) {
  const arr = (list || []).filter(Boolean);
  const rank = a => (a.primary ? 0 : a.danger ? 2 : 1);
  return arr.map((a, i) => [a, i]).sort((x, y) => rank(x[0]) - rank(y[0]) || x[1] - y[1]).map(x => x[0]);
}
function cPrimary(item) {
  const acts = (item && item.actions) || [];
  return acts.find(a => a.primary && !a.disabled && (a.cmd || a.local)) || null;
}

const C_ACT_ICON = { Stage: 'plus', Unstage: 'minus', Open: 'file', Logs: 'terminal' };
/* ---------- a full-width action row (Lens action column) --------------------------------------------------------
   a: Action. o: { P, navKey, enter (show the Enter hint on the primary), menu (menu to open instead), onPick } */
function cActRow(a, o) {
  o = o || {};
  const menuDef = o.menu || (a.menu && o.P && o.P.menus[a.menu]) || null;
  const attrs = menuDef ? {} : PMR.actionAttrs(a);
  const why = a.disabled || a.hint || null;
  const el = h('button', Object.assign({
    type: 'button',
    class: ['pmr-c-act', 'pmr-cur', a.primary && !a.disabled && 'is-primary', a.danger && 'is-danger', menuDef && 'is-menu', a.disabled && 'is-disabled'],
  }, attrs),
  PMR.icon(a.icon || C_ACT_ICON[a.label] || (menuDef ? 'layers' : 'chevR'), 'pmr-c-act-ico'),
  h('span.pmr-c-act-text', h('span.pmr-c-act-label', { text: a.label }), why ? h('span.pmr-c-act-why', { text: why }) : null),
  a.key ? h('kbd.pmr-key', { text: a.key }) : (o.enter && a.primary && !a.disabled ? h('kbd.pmr-key', { text: 'Enter' }) : null),
  menuDef ? PMR.icon('chevR', 'pmr-c-act-chev') : null);
  if (menuDef) {
    el.setAttribute('data-pmr-nav', 'menu');
    el.setAttribute('data-pmr-nav-id', 'lensmenu:' + (o.navKey || '') + ':' + a.label);
    el.setAttribute('aria-haspopup', 'menu');
    el.addEventListener('click', ev => {
      ev.preventDefault();
      PMR.menu.toggle(menuDef, el, { menus: (o.P && o.P.menus) || {}, onPick: o.onPick, width: 264 });
    });
  } else if (a.local && o.P) {
    el.addEventListener('click', () => { if (!a.disabled) o.P.local(a.local, a, el); });
  }
  return el;
}

/* ---------- icon tools with a priority overflow (head of each panel) -------------------------------------------
   list: [{ a: Action, run?: fn (local), menu?: Menu, onPick?, toggled?: () => bool }] in priority order. */
function cTools(P, list) {
  const wrap = h('div.pmr-c-tools', { role: 'toolbar', 'aria-label': P.panel.title + ' actions' });
  const items = list.map(t => {
    let el;
    const detail = (t.a.attrs && t.a.attrs['data-pm-hover-detail']) || t.detail || '';
    if (t.menu) {
      el = h('button', { type: 'button', class: 'pmr-btn pmr-btn-icon pmr-btn-quiet pmr-c-tool', 'aria-haspopup': 'menu', 'data-pmr-nav': 'menu', 'data-pmr-nav-id': 'tool:' + P.panel.id + ':' + t.a.label }, PMR.icon(t.a.icon || 'filter'));
      PMR.hover(el, t.a.label, detail);
      el.addEventListener('click', ev => { ev.preventDefault(); PMR.menu.toggle(t.menu, el, { menus: P.menus, onPick: t.onPick, align: 'end' }); });
    } else if (t.run) {
      el = h('button', { type: 'button', class: 'pmr-btn pmr-btn-icon pmr-btn-quiet pmr-c-tool', 'aria-pressed': t.toggled ? String(!!t.toggled()) : null }, PMR.icon(t.a.icon || 'cog'));
      PMR.hover(el, t.a.label, detail);
      el.addEventListener('click', ev => { ev.preventDefault(); t.run(el); if (t.toggled) el.setAttribute('aria-pressed', String(!!t.toggled())); });
    } else {
      el = PMR.button(t.a, { variant: 'icon', cls: 'pmr-btn-quiet pmr-c-tool' });
    }
    return { t, el };
  });
  const more = h('button', { type: 'button', class: 'pmr-btn pmr-btn-icon pmr-btn-quiet pmr-c-tool pmr-c-tool-more', 'aria-haspopup': 'menu', 'data-pmr-nav': 'menu', 'data-pmr-nav-id': 'toolmore:' + P.panel.id }, PMR.icon('chevD'));
  PMR.hover(more, 'More actions', 'The actions that do not fit beside the title');
  let hidden = [];
  more.addEventListener('click', ev => {
    ev.preventDefault();
    const menus = Object.assign({}, P.menus);
    const runs = new Map();
    const its = hidden.map((x, i) => {
      const a = x.t.a;
      if (x.t.menu) { menus['__toolsub' + i] = x.t.menu; return { label: a.label, icon: a.icon, submenu: '__toolsub' + i }; }
      if (x.t.run) { const it = { label: a.label, icon: a.icon, meta: x.t.toggled && x.t.toggled() ? 'on' : null }; runs.set(it, x.t.run); return it; }
      return a;
    });
    PMR.menu.toggle({ id: 'c-tools-more', label: 'More actions', groups: [{ items: its }] }, more, {
      menus, align: 'end',
      onPick: (it, el) => {
        if (runs.has(it)) { runs.get(it)(el); return; }
        const owner = hidden.find(x => x.t.menu && x.t.onPick && x.t.menu.groups.some(g => g.items.includes(it)));
        if (owner) owner.t.onPick(it, el);
      },
    });
  });
  items.forEach(x => wrap.appendChild(x.el));
  wrap.appendChild(more);
  wrap.fit = (avail) => {
    const step = 30;
    const n = items.length;
    let fitN = Math.floor((avail + 2) / step);
    if (fitN < n) fitN = Math.max(0, Math.floor((avail + 2 - step) / step));
    hidden = [];
    items.forEach((x, i) => { const show = i < fitN; x.el.hidden = !show; if (!show) hidden.push(x); });
    more.hidden = hidden.length === 0;
  };
  wrap.refresh = () => items.forEach(x => { if (x.t.toggled) x.el.setAttribute('aria-pressed', String(!!x.t.toggled())); });
  return wrap;
}

/* ---------- small display helpers --------------------------------------------------------------------------- */
function cGlyph(status, opts) {
  if (!status) return null;
  opts = opts || {};
  const g = PMR.glyph(opts.shape || status.state, 'pmr-c-glyph');
  g.setAttribute('data-state', status.state);
  if (status.state === 'ok' && !opts.loud) g.classList.add('is-quiet');
  return g;
}
function cDiff(d) {
  if (!d) return null;
  return h('span.pmr-diff.pmr-c-diff', h('span.add', { text: '+' + d.add }), h('span.del', { text: '−' + d.del }));
}
function cMeter(value, state, label) {
  const v = cClamp(+value || 0, 0, 100);
  return h('span.pmr-c-meter', { 'data-state': state || 'ok', role: 'img', 'aria-label': (label ? label + ' ' : '') + v + '%' },
    h('span.pmr-c-meter-fill', { style: { transform: 'scaleX(' + (v / 100) + ')' } }));
}
function cBaseName(p) { const s = String(p || ''); const i = s.lastIndexOf('/'); return i >= 0 ? s.slice(i + 1) : s; }
function cDirName(p) { const s = String(p || ''); const i = s.lastIndexOf('/'); return i > 0 ? s.slice(0, i) : ''; }
function cStatusWordEl(status) {
  if (!status) return null;
  const el = PMR.statusEl(status);
  if (el) el.classList.add('pmr-c-status');
  return el;
}

/* registration: render hands each panel to its spec through the shared framework (08-panel.js) */
PMR.concepts.register('c', {
  label: 'Lens',
  blurb: 'Detail beside the rail',
  overlay: true,
  render(panel, view, ctx) {
    const spec = C_SPECS[panel.id];
    if (!spec) { view.appendChild(h('div.pmr-missing', { text: 'This panel is not drawn by the Lens concept.' })); return {}; }
    return cMountPanel(panel, view, ctx, spec);
  },
  bar(barEl, ctx) { return typeof cMountBar === 'function' ? cMountBar(barEl, ctx) : null; },
});
