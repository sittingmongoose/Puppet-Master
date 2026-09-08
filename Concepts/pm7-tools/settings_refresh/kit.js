/* PM51 Settings managers refresh — shared manager kit.
   Runs inside the Settings engine IIFE (after T49 and narrow v3), before boot().
   Outer engine bindings (state, D, root, renderApp, openDrawer, …) are reachable
   by closure; renderers are replaced by assignment, exactly as T49 does. */

const PM51 = {};
const h = escapeHtml;
const a = escAttr;
const DATA = PM51_DATA;
const managers = {};       // workspace type -> { render }
const actions = {};        // 'pm51-<name>' -> fn(el, event)
const changes = {};        // change handlers for select/toggle controls
const inputs = {};         // input handlers for text fields

/* ---------- state ------------------------------------------------------ */
function ensurePm51State() {
  if (!state.pm51 || typeof state.pm51 !== 'object') state.pm51 = {};
  const s = state.pm51;
  if (!s.tabs) s.tabs = {};
  if (!s.sel) s.sel = {};
  for (const [key, value] of Object.entries(DATA)) if (s[key] === undefined) s[key] = clone(value);
}
const pm51OriginalEnsureStateShape = ensureStateShape;
ensureStateShape = function () { pm51OriginalEnsureStateShape(); ensurePm51State(); };
ensurePm51State();
PM51.s = () => { ensurePm51State(); return state.pm51; };

/* ---------- plain-language status ------------------------------------- */
const TONE_BY_WORD = {
  ready: 'ready', connected: 'ready', working: 'ready', on: 'ready', running: 'ready', current: 'ready', passed: 'ready', verified: 'ready', saved: 'ready', 'in use': 'ready', tested: 'ready', enabled: 'ready',
  attention: 'attention', 'needs attention': 'attention', 'needs sign-in': 'attention', 'needs setup': 'attention', 'needs permission': 'attention', warning: 'attention', waiting: 'attention', 'update ready': 'attention', 'restart required': 'attention', 'not tested': 'attention', 'waiting for host': 'attention', paused: 'attention', '1 failure': 'attention',
  off: 'off', 'not set up': 'off', 'not installed': 'off', 'not connected': 'off', disabled: 'off', 'not run': 'off', none: 'off', available: 'off', complete: 'off', queued: 'off',
  checking: 'info', syncing: 'info', 'ready to resume here': 'info', recommended: 'info', info: 'info', locked: 'info', default: 'info',
  unavailable: 'blocked', blocked: 'blocked', failed: 'blocked', 'has problems': 'blocked', error: 'blocked', "can't reach the address": 'blocked'
};
const PLAIN_STATUS = {
  active: 'Ready', ready: 'Ready', ok: 'Ready', attention: 'Needs attention', 'needs-signin': 'Needs sign-in', 'not-installed': 'Not installed', setup: 'Not set up', 'not-connected': 'Not connected', disabled: 'Off', off: 'Off', unavailable: 'Unavailable', blocked: 'Unavailable', error: 'Has a problem', failed: 'Has a problem', running: 'Running', paused: 'Paused', checking: 'Checking'
};
PM51.plain = status => PLAIN_STATUS[String(status || '').toLowerCase()] || cap(String(status || ''));
PM51.tone = label => TONE_BY_WORD[String(label || '').toLowerCase()] || 'neutral';
PM51.pill = (label, tone) => `<span class="pm51-pill tone-${a(tone || PM51.tone(label))}"><i aria-hidden="true"></i>${h(label)}</span>`;
PM51.statusPill = status => PM51.pill(PM51.plain(status));
PM51.dot = tone => `<span class="status-dot ${a({ ready: 'ready', attention: 'attention', off: 'disabled', info: 'info', blocked: 'error', neutral: 'disabled' }[tone] || 'disabled')}"></span>`;

/* ---------- primitives -------------------------------------------------- */
const dataAttrs = data => Object.entries(data || {}).map(([k, v]) => `data-${a(k)}="${a(v == null ? '' : v)}"`).join(' ');

PM51.btn = ({ label, action, data, icon: ic, primary, small, ghost, danger, disabled, reason, ui, cls, title, callback }) => {
  const dis = disabled ? `aria-disabled="true" data-pm51-disabled="1" data-disabled-reason="${a(reason || 'Not available in this concept preview.')}" data-pm-hover-label="${a(label || '')}" data-pm-hover-detail="${a(reason || 'Not available in this concept preview.')}"` : '';
  const act = disabled ? 'data-action="pm51-disabled"' : (callback ? `data-callback="${a(registerAction(callback))}"` : `data-action="${a(action || 'pm51-noop')}"`);
  return `<button type="button" class="btn pm51-btn${primary ? ' primary' : ''}${small ? ' small' : ''}${ghost ? ' ghost' : ''}${danger ? ' danger' : ''}${cls ? ' ' + cls : ''}" ${act} ${ui ? `data-ui-action-id="${a(ui)}"` : ''} ${dataAttrs(data)} ${dis} ${title ? `title="${a(title)}"` : ''}>${ic ? icon(ic) : ''}${label ? `<span>${h(label)}</span>` : ''}</button>`;
};
PM51.iconBtn = ({ action, data, icon: ic, label, cls, callback, ui }) => {
  const act = callback ? `data-callback="${a(registerAction(callback))}"` : `data-action="${a(action || 'pm51-noop')}"`;
  return `<button type="button" class="icon-btn pm51-icon-btn${cls ? ' ' + cls : ''}" ${act} ${ui ? `data-ui-action-id="${a(ui)}"` : ''} ${dataAttrs(data)} aria-label="${a(label || '')}" data-pm-hover-label="${a(label || '')}">${icon(ic || 'more')}</button>`;
};
PM51.link = ({ label, action, data, callback, cls, ui }) => {
  const act = callback ? `data-callback="${a(registerAction(callback))}"` : `data-action="${a(action || 'pm51-noop')}"`;
  return `<button type="button" class="pm51-link${cls ? ' ' + cls : ''}" ${act} ${ui ? `data-ui-action-id="${a(ui)}"` : ''} ${dataAttrs(data)}>${h(label)}</button>`;
};
PM51.select = (value, options, { action, data, cls, label } = {}) => `<select class="select-control pm51-select${cls ? ' ' + cls : ''}" data-action="${a(action || 'pm51-noop')}" ${dataAttrs(data)} ${label ? `aria-label="${a(label)}"` : ''}>${options.map(o => { const v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o; return `<option value="${a(v)}" ${String(v) === String(value) ? 'selected' : ''}>${h(l)}</option>`; }).join('')}</select>`;
PM51.toggle = (on, { action, data, label, disabled, reason, ui } = {}) => `<button type="button" class="toggle pm51-toggle${on ? ' on' : ''}" role="switch" aria-checked="${on ? 'true' : 'false'}" ${ui ? `data-ui-action-id="${a(ui)}"` : ''} data-action="${a(disabled ? 'pm51-disabled' : (action || 'pm51-noop'))}" ${dataAttrs(data)} aria-label="${a(label || 'Toggle')}" ${disabled ? `aria-disabled="true" data-pm51-disabled="1" data-disabled-reason="${a(reason || 'This cannot be changed here.')}" data-pm-hover-label="${a(label || 'Toggle')}" data-pm-hover-detail="${a(reason || 'This cannot be changed here.')}"` : ''}></button>`;
PM51.segmented = (value, options, { action, data, label } = {}) => `<div class="segmented pm51-seg" role="group" ${label ? `aria-label="${a(label)}"` : ''}>${options.map(o => { const v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o; return `<button type="button" class="${String(v) === String(value) ? 'active' : ''}" data-action="${a(action || 'pm51-noop')}" ${dataAttrs(data)} data-value="${a(v)}" aria-pressed="${String(v) === String(value)}">${h(l)}</button>`; }).join('')}</div>`;
PM51.input = (value, { action, data, placeholder, type, cls, label } = {}) => `<input class="text-control pm51-input${cls ? ' ' + cls : ''}" type="${a(type || 'text')}" value="${a(value == null ? '' : value)}" placeholder="${a(placeholder || '')}" data-action="${a(action || 'pm51-noop')}" ${dataAttrs(data)} ${label ? `aria-label="${a(label)}"` : ''}/>`;
PM51.chip = (label, tone) => `<span class="pm51-chip${tone ? ' tone-' + a(tone) : ''}">${h(label)}</span>`;
PM51.chipToggle = (label, on, { action, data, label: aria } = {}) => `<button type="button" class="pm51-chip pm51-chip-toggle${on ? ' is-on' : ''}" aria-pressed="${on ? 'true' : 'false'}" data-action="${a(action || 'pm51-noop')}" ${dataAttrs(data)}>${h(label)}</button>`;
PM51.tech = text => `<code class="pm51-tech">${h(text)}</code>`;

PM51.page = ({ id, key, tabs, active, body, quiet, cls, ui }) => {
  const tabsHtml = tabs && tabs.length ? `<nav class="manager-tabs pm51-tabs" aria-label="Sections">${tabs.map(t => `<button type="button" class="manager-tab${t.id === active ? ' active' : ''}" data-action="pm51-tab" data-manager="${a(id)}" data-tab="${a(t.id)}" ${t.ui || ui ? `data-ui-action-id="${a(t.ui || ui)}"` : ''}>${h(t.label)}</button>`).join('')}</nav>` : '';
  return `<div class="manager-page pm51-mgr${tabsHtml ? ' has-manager-tabs' : ''}${cls ? ' ' + cls : ''}" data-manager-key="${a(key || '')}" data-pm51-manager="${a(id)}">${tabsHtml}<div class="manager-body manager-tab-body pm51-body"><div class="manager-scroll pm51-scroll">${body}${quiet && quiet.length ? PM51.quiet(quiet) : ''}</div></div></div>`;
};
PM51.section = ({ title, help, action, body, cls, id, tone }) => `<section class="panel-card pm51-section${cls ? ' ' + cls : ''}${tone ? ' tone-' + a(tone) : ''}" ${id ? `id="${a(id)}"` : ''}><div class="pm51-section-head"><div class="pm51-section-copy"><h3 class="pm51-section-title">${h(title)}</h3>${help ? `<p class="pm51-section-help">${h(help)}</p>` : ''}</div>${action ? (typeof action === 'string' ? action : PM51.btn(action)) : ''}</div>${body ? `<div class="pm51-section-body">${body}</div>` : ''}</section>`;
PM51.grid = (cols, ...parts) => `<div class="pm51-grid cols-${a(cols)}">${parts.join('')}</div>`;
PM51.rows = (rows, { cls } = {}) => `<div class="pm51-rows${cls ? ' ' + cls : ''}">${rows.filter(Boolean).map(r => `<div class="pm51-row${r.cls ? ' ' + r.cls : ''}" ${r.id ? `data-row="${a(r.id)}"` : ''} ${dataAttrs(r.data)}><div class="pm51-row-copy"><div class="pm51-row-label">${h(r.label)}${r.pill ? ' ' + r.pill : ''}</div>${r.help ? `<div class="pm51-row-help">${h(r.help)}</div>` : ''}</div><div class="pm51-row-control">${r.control || (r.value != null ? `<span class="pm51-row-value${r.muted ? ' is-muted' : ''}">${h(String(r.value))}</span>` : '')}${r.action ? (typeof r.action === 'string' ? r.action : PM51.btn(Object.assign({ small: true }, r.action))) : ''}</div></div>`).join('')}</div>`;
PM51.stats = items => `<div class="pm51-stats">${items.map(s => `<div class="pm51-stat${s.tone ? ' tone-' + a(s.tone) : ''}"><div class="pm51-stat-label">${h(s.label)}</div><div class="pm51-stat-value">${h(String(s.value))}</div>${s.help ? `<div class="pm51-stat-help">${h(s.help)}</div>` : ''}</div>`).join('')}</div>`;
PM51.list = (items, { cls } = {}) => `<div class="pm51-list${cls ? ' ' + cls : ''}">${items.filter(Boolean).map(it => `<div class="pm51-item${it.cls ? ' ' + it.cls : ''}${it.action || it.callback ? ' is-clickable' : ''}" ${it.action ? `data-action="${a(it.action)}"` : ''} ${it.callback ? `data-callback="${a(registerAction(it.callback))}"` : ''} ${dataAttrs(it.data)} ${it.action || it.callback ? 'role="button" tabindex="0"' : ''}>${it.avatar ? `<span class="pm51-item-avatar">${it.avatar}</span>` : ''}<div class="pm51-item-copy"><div class="pm51-item-title">${h(it.title)}${it.pill ? ' ' + it.pill : ''}</div>${it.meta ? `<div class="pm51-item-meta">${h(it.meta)}</div>` : ''}${it.note ? `<div class="pm51-item-note">${h(it.note)}</div>` : ''}</div><div class="pm51-item-end">${it.end || ''}</div></div>`).join('')}</div>`;
PM51.steps = (items, { start = 1 } = {}) => `<ol class="pm51-steps">${items.filter(Boolean).map((s, i) => `<li class="pm51-step${s.tone ? ' tone-' + a(s.tone) : ''}${s.done ? ' is-done' : ''}"><span class="pm51-step-n">${s.done ? icon('check') : (i + start)}</span><div class="pm51-step-copy"><div class="pm51-step-title">${h(s.title)}</div>${s.desc ? `<div class="pm51-step-desc">${h(s.desc)}</div>` : ''}</div><div class="pm51-step-end">${s.status ? PM51.pill(s.status, s.tone) : ''}${s.action ? (typeof s.action === 'string' ? s.action : PM51.btn(Object.assign({ small: true }, s.action))) : ''}</div></li>`).join('')}</ol>`;
PM51.advanced = (body, { label, open, help } = {}) => `<details class="pm51-advanced" ${open ? 'open' : ''}><summary>${icon('chevron')}<span>${h(label || 'Advanced')}</span>${help ? `<small>${h(help)}</small>` : ''}</summary><div class="pm51-advanced-body">${body}</div></details>`;
PM51.quiet = items => `<div class="pm51-quiet">${items.filter(Boolean).map(i => PM51.link(i)).join('')}</div>`;
PM51.empty = (title, copy, action) => `<div class="empty-state pm51-empty"><div>${icon('info')}<div class="empty-title">${h(title)}</div>${copy ? `<div class="empty-copy">${h(copy)}</div>` : ''}${action ? `<div class="empty-actions">${PM51.btn(Object.assign({ primary: true }, action))}</div>` : ''}</div></div>`;
PM51.kv = pairs => `<div class="pm51-kv">${pairs.filter(Boolean).map(([k, v]) => `<div class="pm51-kv-row"><span>${h(k)}</span><span>${v == null ? '—' : h(String(v))}</span></div>`).join('')}</div>`;
PM51.note = (text, tone) => `<p class="pm51-note${tone ? ' tone-' + a(tone) : ''}">${icon(tone === 'attention' ? 'alert' : 'info')}<span>${h(text)}</span></p>`;
PM51.field = (label, control, help) => `<label class="pm51-field"><span class="pm51-field-label">${h(label)}</span>${control}${help ? `<span class="pm51-field-help">${h(help)}</span>` : ''}</label>`;
PM51.initials = name => String(name || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

PM51.listDetail = ({ id, rosterId, rosterTitle, count, add, filter, items, detail, selectAction }) => `<div class="split-manager pm51-split">
  <aside class="resource-roster pm51-roster" ${rosterId ? `id="${a(rosterId)}"` : ''}>
    <div class="roster-head"><div class="roster-title">${h(rosterTitle)}${count != null ? ` (${count})` : ''}</div>${add ? PM51.iconBtn(Object.assign({ icon: 'plus' }, add)) : ''}</div>
    ${filter ? `<div class="roster-search"><input placeholder="${a(filter.placeholder || 'Filter')}" aria-label="${a(filter.placeholder || 'Filter')}" data-action="${a(filter.action || 'pm51-filter')}" data-manager="${a(id)}" value="${a(filter.value || '')}"/></div>` : ''}
    <div class="roster-list">${items.map(it => `<button type="button" class="resource-row${it.selected ? ' active' : ''}" data-action="${a(it.action || selectAction || 'pm51-select')}" data-manager="${a(id)}" data-id="${a(it.id)}" ${dataAttrs(it.data)} aria-current="${it.selected ? 'true' : 'false'}"><span class="resource-avatar">${it.avatar || h(PM51.initials(it.title))}</span><span class="resource-row-copy"><span class="resource-row-name">${h(it.title)}</span><span class="resource-row-meta">${h(it.meta || '')}${it.pill ? ' ' + it.pill : ''}</span></span>${it.tone ? PM51.dot(it.tone) : ''}</button>`).join('')}</div>
  </aside>
  <section class="resource-detail pm51-detail">
    <div class="resource-head pm51-detail-head"><button type="button" class="icon-btn pm51-roster-toggle" data-action="pm51-toggle-roster" aria-label="Show list">${icon('menu')}</button><div class="resource-head-main"><div class="pm51-detail-title">${h(detail.title)}${detail.pill ? ' ' + detail.pill : ''}</div>${detail.subtitle ? `<div class="pm51-detail-sub">${h(detail.subtitle)}</div>` : ''}</div><div class="pm51-detail-actions">${detail.primary ? PM51.btn(Object.assign({ primary: true }, detail.primary)) : ''}${detail.menu ? PM51.iconBtn({ icon: 'more', label: 'More actions', callback: detail.menu }) : ''}</div></div>
    <div class="resource-content pm51-detail-content">${detail.body}</div>
  </section>
</div>`;

/* ---------- side panel (drawer) anatomy ------------------------------- */
openDrawer = function ({ title, subtitle = '', pill = '', body = '', primaryLabel = '', onPrimary = null, secondaryLabel = '', onSecondary = null, width = 0, cls = '', closeLabel = 'Close', danger = false }) {
  const returnTarget = captureTransientFocus(); closeOverlay(false);
  const wrap = document.createElement('div'); wrap.className = 'drawer-wrap pm51-drawer-wrap'; wrap._pmReturnFocus = returnTarget;
  const secondary = onSecondary ? `<button type="button" class="btn" data-callback="${registerAction(() => { const r = onSecondary(wrap); if (r !== false && wrap.isConnected) closeDrawerWrap(wrap); })}">${h(secondaryLabel || 'Continue')}</button>` : '';
  const primary = onPrimary ? `<button type="button" class="btn ${danger ? 'danger' : 'primary'}" data-callback="${registerAction(() => { const r = onPrimary(wrap); if (r !== false && wrap.isConnected) closeDrawerWrap(wrap); })}">${h(primaryLabel || 'Apply')}</button>` : '';
  wrap.innerHTML = `<aside class="drawer pm51-panel${cls ? ' ' + cls : ''}" role="dialog" aria-modal="true" aria-label="${a(title)}" ${width ? `style="width:${Number(width)}px"` : ''}>
    <header class="pm51-panel-head"><div class="pm51-panel-copy"><div class="pm51-panel-title">${h(title)}${pill ? ' ' + pill : ''}</div>${subtitle ? `<div class="pm51-panel-sub">${h(subtitle)}</div>` : ''}</div><button type="button" class="icon-btn pm51-panel-close" data-action="close-overlay" aria-label="Close">${icon('close')}</button></header>
    <div class="pm51-panel-body">${body}</div>
    <footer class="pm51-panel-foot"><button type="button" class="btn" data-action="close-overlay">${h(closeLabel)}</button><span class="pm51-panel-foot-spacer"></span>${secondary}${primary}</footer>
  </aside>`;
  const drawer = wrap.querySelector('.drawer');
  const onEsc = e => { if (e.key !== 'Escape' || !wrap.isConnected || !window.PM7_SETTINGS_TOME.ownsEvent(e.target)) return; e.stopPropagation(); closeDrawerWrap(wrap); };
  const cleanup = () => { document.removeEventListener('keydown', onEsc, true); wrap._pmCleanup = null; }; wrap._pmCleanup = cleanup;
  wrap.addEventListener('mousedown', e => { if (e.target === wrap) closeDrawerWrap(wrap); });
  portalRoot().append(wrap); document.addEventListener('keydown', onEsc, true); void wrap.offsetWidth;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (!wrap.isConnected) return; wrap.classList.add('is-open');
    if (motionReduced()) wrap.classList.add('is-settled');
    else { const onSettled = e => { if (e.target !== drawer || e.propertyName !== 'transform') return; drawer.removeEventListener('transitionend', onSettled); if (wrap.isConnected && wrap.classList.contains('is-open')) wrap.classList.add('is-settled'); }; drawer.addEventListener('transitionend', onSettled); }
    const first = wrap.querySelector('[data-autofocus], .pm51-panel-body input, .pm51-panel-body select, .pm51-panel-body button, .pm51-panel-close'); if (first) first.focus();
  }));
  return wrap;
};
PM51.panel = opts => openDrawer(opts);
PM51.panelSection = (title, body, help) => `<section class="pm51-panel-section"><div class="pm51-ps-title">${h(title)}</div>${help ? `<p class="pm51-ps-help">${h(help)}</p>` : ''}${body}</section>`;
PM51.menu = (anchor, items, title) => openMenu(anchor, items, title || '');
PM51.confirm = (title, message, label, onConfirm, danger) => confirmDialog(title, message, label, onConfirm, !!danger);
PM51.toast = (title, message, type) => showToast(title, message || '', type || 'success');
/* Honest "check" panel: steps with an outcome that never claims a real connection. */
PM51.check = ({ title, subtitle, steps, outcome, tone }) => openDrawer({
  title, subtitle: subtitle || 'Example data only. No real connection is made in this preview.',
  pill: PM51.pill(outcome || 'Checked · example data', tone || 'info'),
  body: PM51.panelSection('What was checked', PM51.steps(steps.map(s => Object.assign({ tone: s.tone || 'ready', status: s.status || 'Checked' }, s)))) + PM51.note('This is a concept preview. Nothing was installed, sent, or changed.', 'info')
});
PM51.unavailable = (label, why) => showToast(label + ' is not available yet', why || 'This part of the concept has no live owner behind it.', 'info', 3200);
PM51.form = (fields, values = {}) => fields.map(f => formField(f.label, f.name, values[f.name] != null ? values[f.name] : (f.value != null ? f.value : ''), f)).join('');

/* ---------- action routing ---------------------------------------------- */
PM51.on = (name, fn) => { actions[name] = fn; };
PM51.onChange = (name, fn) => { changes[name] = fn; };
PM51.onInput = (name, fn) => { inputs[name] = fn; };
const pm51OriginalDispatch = dispatchAction;
dispatchAction = function (action, el, event) {
  if (el && el.dataset && el.dataset.pm51Disabled === '1') { showToast('Not available', el.dataset.disabledReason || 'Not available in this concept preview.', 'info', 2600); return; }
  if (typeof action === 'string' && action.startsWith('pm51-')) {
    if (el && el.getAttribute && el.getAttribute('aria-disabled') === 'true') { showToast('Not available', el.dataset.disabledReason || 'Not available in this concept preview.', 'info', 2600); return; }
    const fn = actions[action.slice(5)];
    if (fn) { fn(el, event); return; }
    if (action === 'pm51-noop') return;
    PM51.unavailable(humanize(action.slice(5)));
    return;
  }
  return pm51OriginalDispatch(action, el, event);
};
const pm51OriginalChange = handleChangeAction;
handleChangeAction = function (action, el) {
  if (typeof action === 'string' && action.startsWith('pm51-')) { const fn = changes[action.slice(5)] || actions[action.slice(5)]; if (fn) fn(el); return; }
  return pm51OriginalChange(action, el);
};
const pm51OriginalInput = handleInputAction;
handleInputAction = function (action, el) {
  if (typeof action === 'string' && action.startsWith('pm51-')) { const fn = inputs[action.slice(5)]; if (fn) fn(el); return; }
  return pm51OriginalInput(action, el);
};

/* ---------- managers registry & re-render ------------------------------ */
PM51.manager = (type, def) => { managers[type] = def; };
const pm51OriginalRenderWorkspace = renderWorkspace;
renderWorkspace = function (workspace, domain) {
  const m = managers[workspace.type];
  if (m) return m.render(workspace, domain);
  return pm51OriginalRenderWorkspace(workspace, domain);
};
renderWorkspaceBody = function (workspace, domain) {
  embedMode = true;
  try { const html = renderWorkspace(workspace, domain); return html.includes('pm51-mgr') ? html : narrowManagerMarkup(html); }
  finally { embedMode = false; }
};
pageHeader = function () { return ''; };

PM51.tab = (id, fallback) => PM51.s().tabs[id] || fallback;
PM51.setTab = (id, tab) => { PM51.s().tabs[id] = tab; };
PM51.sel = (id, fallback) => PM51.s().sel[id] || fallback;
PM51.setSel = (id, value) => { PM51.s().sel[id] = value; };

PM51.refresh = function (wsId, { swap = true } = {}) {
  const body = root.querySelector(`[data-continuous-workspace-body="${cssEscape(wsId)}"]`);
  const domain = getDomain();
  const ws = body && domain.workspaces.find(w => w.id === wsId);
  if (!body || !ws) { saveState(); renderApp({ soft: !state.home }); return; }
  body.innerHTML = renderContinuousWorkspaceBody(ws, domain);
  body.dataset.workspaceMounted = 'true';
  body.querySelectorAll('.manager-section').forEach(sec => sec.classList.add('section-block', 'is-revealed'));
  PM51.applyFilters(body);
  const mb = body.querySelector('.manager-body');
  if (mb && swap && !motionReduced()) { const phase = body.dataset.pm51Phase === 'a' ? 'b' : 'a'; body.dataset.pm51Phase = phase; mb.classList.add('tab-swap-' + phase); }
  requestAnimationFrame(() => moveTabInks(measureTabInks(true, body)));
  saveState();
};
PM51.refreshAll = () => { saveState(); renderApp({ soft: !state.home }); };
PM51.go = (domain, workspace, options) => navigate(domain, workspace, options || {});

PM51.on('tab', el => { PM51.setTab(ds(el, 'manager'), ds(el, 'tab')); PM51.refresh(ds(el, 'manager')); });
PM51.on('select', el => { PM51.setSel(ds(el, 'manager'), ds(el, 'id')); state.resourceRosterOpen = false; PM51.refresh(ds(el, 'manager'), { swap: false }); });
PM51.on('go', el => { PM51.go(ds(el, 'domain'), ds(el, 'workspace'), ds(el, 'section') ? { section: ds(el, 'section') } : {}); });
PM51.on('open-detail', el => { openDetailSetting(ds(el, 'setting'), ds(el, 'workspace') || undefined, ds(el, 'section') || undefined); });
PM51.on('noop', () => {});
PM51.on('disabled', el => { showToast('Not available', el.dataset.disabledReason || 'This cannot be changed here.', 'info', 2600); });
/* Narrow hosts: the roster becomes an off-canvas list toggled from the detail head. */
PM51.on('toggle-roster', el => { state.resourceRosterOpen = !state.resourceRosterOpen; const body = el.closest('.manager-body'); if (body) body.classList.toggle('roster-open', state.resourceRosterOpen); });
const applyRosterFilter = el => { const list = el.closest('.resource-roster')?.querySelector('.roster-list'); if (!list) return; const q = String(el.value || '').toLowerCase(); list.querySelectorAll('.resource-row').forEach(row => { row.hidden = !!q && !row.textContent.toLowerCase().includes(q); }); };
PM51.applyFilters = scope => { (scope || root).querySelectorAll('input[data-action="pm51-filter"]').forEach(el => { const stored = (PM51.s().filters || {})[ds(el, 'manager')]; if (stored != null && el.value !== stored) el.value = stored; if (el.value) applyRosterFilter(el); }); };
PM51.onInput('filter', el => { PM51.s().filters = PM51.s().filters || {}; PM51.s().filters[ds(el, 'manager')] = el.value; applyRosterFilter(el); });

/* ---------- workspace registry changes -------------------------------- */
(function pm51Registry() {
  const find = id => D.domains.find(d => d.id === id);
  const code = find('code');
  if (code && !code.workspaces.some(w => w.id === 'skills')) {
    const idx = code.workspaces.findIndex(w => w.id === 'toolchain');
    const tool = code.workspaces[idx]; if (tool) tool.label = 'Toolchain';
    code.workspaces.splice(idx + 1, 0,
      { id: 'skills', label: 'Skills', type: 'skills' },
      { id: 'plugins', label: 'Plugins', type: 'plugins' },
      { id: 'mcp', label: 'MCP Servers', type: 'mcp' },
      { id: 'commands', label: 'Commands & Shortcuts', type: 'commands' });
    code.summary = 'Editor, terminal, toolchain, skills, plugins, MCP servers, commands, and testing.';
  }
  const sys = find('system');
  if (sys) {
    const srv = sys.workspaces.find(w => w.id === 'servers');
    if (srv) { srv.label = 'Server & Project Location'; srv.type = 'serverLocation'; }
    const backup = sys.workspaces.find(w => w.id === 'backup'); if (backup) backup.label = 'Backup & Restore';
    const doctor = sys.workspaces.find(w => w.id === 'doctor'); if (doctor) doctor.label = 'Readiness & Doctor';
    const order = ['settings-transfer', 'servers', 'backup', 'doctor', 'updates', 'advanced'];
    sys.workspaces.sort((x, y) => { const ix = order.indexOf(x.id), iy = order.indexOf(y.id); return (ix < 0 ? 99 : ix) - (iy < 0 ? 99 : iy); });
    sys.summary = 'Settings transfer, your server and project location, backups, readiness, and updates.';
  }
  const proj = find('projects');
  if (proj) { proj.workspaces = proj.workspaces.filter(w => w.id !== 'project-sync'); proj.summary = 'All project settings, history, and artifacts.'; }
  const mem = find('memory');
  if (mem) { mem.workspaces = mem.workspaces.filter(w => w.id !== 'owners'); mem.summary = 'Context, memories, Goals, personas, and crews.'; }
  const src = find('source');
  if (src) { const sm = src.workspaces.find(w => w.id === 'source-manager'); if (sm) sm.label = 'Source Control'; src.summary = 'Version history, code services, repositories, and safety.'; }
  const ai = find('ai'); if (ai) ai.summary = 'AI services, web and media abilities, and the Back Seat Driver.';
})();

const INTROS = {
  notifications: 'Choose where alerts go and what they sound like.',
  providers: 'Install or sign in to the AI services you want to use.',
  web: 'Pick which service searches, reads, and browses the web for you.',
  media: 'Pick which service makes images, speech, video, and documents.',
  bsd: 'A second opinion that watches your work and speaks up when it matters.',
  toolchain: 'Language helpers and formatters that make code easier to write.',
  skills: 'Reusable know-how the assistant can pick up for specific jobs.',
  plugins: 'Add-ons that give the assistant new tools and connections.',
  mcp: 'Connect outside tools and services the assistant can call.',
  commands: 'Type / commands and press keys to do things faster.',
  testing: 'Decide how your work gets checked and how you debug it.',
  'context-memory': 'What the assistant remembers about you and this workspace.',
  goals: 'Templates and rules for jobs the assistant runs on its own.',
  personas: 'The characters the assistant can play, alone or as a team.',
  'source-manager': 'Keep version history and connect the code services you use.',
  'browser-scm': 'How the built-in browser and code tools rely on each other.',
  'project-settings': 'Every setting for this workspace, in one searchable list.',
  servers: 'Where your workspace lives, where work runs, and which devices reach it.',
  'project-history': 'What happened in this workspace and the files it produced.',
  permissions: 'What the assistant may do on its own, and when it must ask.',
  'settings-transfer': 'Copy settings from another workspace, or save them to a file.',
  backup: 'Protect your work so it can be recovered if something goes wrong.',
  doctor: 'Is everything ready? See what needs attention and fix it.',
  updates: 'Keep Puppet Master current, and go back if you need to.'
};
const pm51OriginalWorkspaceMeta = workspaceMeta;
workspaceMeta = function (workspace, domain) {
  const meta = pm51OriginalWorkspaceMeta(workspace, domain);
  if (INTROS[workspace.id]) meta.description = INTROS[workspace.id];
  return meta;
};
const pm51OriginalAudit = runCompletenessAudit;
runCompletenessAudit = function () {
  const report = pm51OriginalAudit();
  report.unknownWorkspaceTypes = (report.unknownWorkspaceTypes || []).filter(w => !managers[w.type]);
  report.pm51 = { managers: Object.keys(managers), actions: Object.keys(actions).length };
  return report;
};

/* ---------- exact landings: hydrate everything above the target first -- */
/* Workspaces above the target are lazy placeholders with estimated heights. A smooth scroll to
   an estimated offset then drifted while those blocks hydrated mid-flight (measured: Doctor landed
   ~870 px low and the scroll spy lit the wrong tab). Mount the preceding blocks synchronously so the
   offset is exact; blocks below stay lazy. Cross-domain landings (behavior 'auto') are instant. */
const pm51MountPreceding = wsId => {
  const domain = getDomain(); const ids = domain.workspaces.map(w => w.id); const idx = ids.indexOf(wsId);
  for (let i = 0; i < idx; i++) mountContinuousWorkspace(ids[i]);
};
const pm51OriginalJump = jumpToWorkspace;
jumpToWorkspace = function (wsId, behavior) {
  pm51MountPreceding(wsId);
  const scroller = root.querySelector('#settings-document');
  if (behavior === 'auto' && scroller) {
    const prev = scroller.style.scrollBehavior; scroller.style.scrollBehavior = 'auto';
    try { return pm51OriginalJump(wsId, 'auto'); } finally { requestAnimationFrame(() => { scroller.style.scrollBehavior = prev; }); }
  }
  return pm51OriginalJump(wsId, behavior);
};

/* ---------- re-renders keep the reader's place ------------------------ */
/* Host-driven setting changes (theme, density, host projections) call renderApp() without a
   navigation intent. The engine's full remount reset the page to the top of the domain and the
   scroll spy then reported the first workspace as active. When the rendered domain is unchanged
   and no navigation scroll is pending, render softly and re-anchor the active workspace block at
   the same offset it had before. Navigation (pendingScroll), Home, and explicit soft renders are
   untouched. */
const pm51OriginalRenderApp = renderApp;
const pm51DocOffset = (scroller, block) => block.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
let pm51Anchor = null;
renderApp = function (options = {}) {
  pm51Anchor = null;
  if (!state.home && !options.soft && !pendingScroll) {
    const rendered = root.querySelector('.domain-link.active');
    const scroller = root.querySelector('#settings-document');
    const block = scroller && state.workspace ? root.querySelector(`[data-workspace-block="${cssEscape(state.workspace)}"]`) : null;
    if (rendered && rendered.dataset.domain === state.domain && block) {
      pm51Anchor = { domain: state.domain, workspace: state.workspace, delta: scroller.scrollTop - pm51DocOffset(scroller, block) };
      options = Object.assign({}, options, { soft: true });
    }
  }
  return pm51OriginalRenderApp(options);
};
/* The engine restores a soft remount numerically (preservedScrollTop) in three consecutive frames,
   before the blocks above the active workspace exist; that both landed on placeholder heights and
   clobbered any navigation started in between (same-domain jumps do not re-render, so their smooth
   scroll was overwritten by the second and third apply). The kit takes the restore over: hydrate the
   blocks above, apply the exact offset once, re-check once, and yield to any navigation in flight. */
const pm51OriginalAfterRender = afterRender;
afterRender = function () {
  const a = pm51Anchor; pm51Anchor = null;
  let restore = null;
  if (a) {
    preservedScrollTop = null;
    if (softRemount && !state.home && state.domain === a.domain && state.workspace === a.workspace && !pendingScroll) {
      const scroller = root.querySelector('#settings-document');
      const block = scroller && root.querySelector(`[data-workspace-block="${cssEscape(a.workspace)}"]`);
      if (scroller && block) { pm51MountPreceding(a.workspace); restore = { scroller, workspace: a.workspace, wanted: Math.max(0, Math.round(pm51DocOffset(scroller, block) + a.delta)) }; }
    }
  }
  /* the scroll spy would otherwise re-label the active workspace at scrollTop 0 before the restore */
  if (restore) suppressScrollSpyUntil = Math.max(suppressScrollSpyUntil, performance.now() + 200);
  const out = pm51OriginalAfterRender.apply(this, arguments);
  if (restore) {
    const apply = () => {
      if (state.workspace !== restore.workspace || pendingScroll || !restore.scroller.isConnected) return;
      restore.scroller.style.scrollBehavior = 'auto'; restore.scroller.scrollTop = restore.wanted; restore.scroller.style.scrollBehavior = '';
      suppressScrollSpyUntil = Math.max(suppressScrollSpyUntil, performance.now() + 180);
    };
    apply();
    requestAnimationFrame(() => { if (Math.abs(restore.scroller.scrollTop - restore.wanted) > 1) apply(); });
  }
  return out;
};
if (window.PM12_KIMI && typeof window.PM12_KIMI === 'object') window.PM12_KIMI.renderApp = (...args) => renderApp(...args);
const pm51OriginalBoot = boot;
boot = function () { const r = pm51OriginalBoot.apply(this, arguments); if (window.PM12_KIMI && typeof window.PM12_KIMI === 'object') window.PM12_KIMI.renderApp = (...args) => renderApp(...args); return r; };

/* ---------- motion: no blank frames ----------------------------------- */
armSectionReveal = function () {
  try { PM51.applyFilters(root); } catch (e) { /* filters are a convenience; never block reveal */ }
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const nodes = root.querySelectorAll('.section-block, .settings-section, .manager-section');
  if (!nodes.length) return;
  const scroller = root.querySelector('#settings-document');
  const viewBottom = scroller ? scroller.getBoundingClientRect().bottom + 120 : window.innerHeight + 120;
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) { if (!entry.isIntersecting) continue; entry.target.classList.add('is-revealed'); entry.target.classList.remove('will-reveal'); revealObserver.unobserve(entry.target); }
    }, { threshold: 0.04 });
  } else revealObserver.disconnect();
  for (const node of nodes) {
    if (node.classList.contains('is-revealed')) continue;
    node.classList.add('section-block');
    if (node.getBoundingClientRect().top < viewBottom) { node.classList.add('is-revealed', 'pm51-instant'); continue; }
    node.classList.add('will-reveal');
    revealObserver.observe(node);
  }
};

/* ---------- setting Details inspector ---------------------------------- */
function pm51ValueText(setting) {
  const v = settingValue(setting);
  if (v === true) return 'On'; if (v === false) return 'Off';
  if (v == null || v === '') return 'Not set';
  if (Array.isArray(v)) return v.length ? v.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(', ') : 'None';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
renderDetailInspectorBody = function (setting, section, workspace) {
  const d = setting.detail || {};
  const block = (title, text) => text ? `<section class="pm51-panel-section"><div class="pm51-ps-title">${h(title)}</div><p class="pm51-ps-text">${h(text)}</p></section>` : '';
  const changed = state.changed[setting.id];
  return `<div class="detail-head pm51-panel-head"><div class="pm51-panel-copy"><div class="pm51-panel-title">${h(setting.label)}</div><div class="pm51-panel-sub">${h(section.label)}${changed ? ' · Changed in this project' : ''}</div></div><button type="button" class="icon-btn pm51-panel-close" data-action="close-details" aria-label="Close explanation">${icon('close')}</button></div>
    <div class="detail-body pm51-panel-body">
      <section class="pm51-panel-section pm51-current"><div class="pm51-ps-title">Current value</div><div class="pm51-current-value">${h(pm51ValueText(setting))}</div>${d.recommended || setting.recommended ? `<div class="pm51-ps-help">Recommended: ${h(String(d.recommended || setting.recommended))}</div>` : ''}</section>
      ${block('What it does', d.what)}
      ${block('Why you might change it', d.why)}
      ${d.example ? `<section class="pm51-panel-section"><div class="pm51-ps-title">Example</div><div class="pm51-example">${h(d.example)}</div></section>` : ''}
      ${block('Applies to', d.applies)}
      ${d.notes ? block('Good to know', d.notes) : ''}
      ${d.related && d.related.length ? `<section class="pm51-panel-section"><div class="pm51-ps-title">Related settings</div><div class="related-links pm51-related">${d.related.map(r => `<button type="button" data-action="search-related" data-query="${a(r)}">${h(r)}</button>`).join('')}</div></section>` : ''}
      <div class="pm51-panel-quiet"><button type="button" class="btn small" data-action="reset-setting" data-setting="${a(setting.id)}">${icon('restore')}<span>Reset to default</span></button><span class="pm51-tech-inline">${h(setting.id)}</span></div>
    </div>`;
};

/* ---------- All Project Settings: virtualized, page-scrolled ----------- */
const CATEGORY_TITLES = () => new Map((window.PM12_REFERENCE && window.PM12_REFERENCE.categories || []).map(c => [c.id, c.title]));
function pm51AllRows() {
  const order = new Map((window.PM12_REFERENCE && window.PM12_REFERENCE.categories || []).map((c, i) => [c.id, i]));
  const entries = allSettingsFiltered().filter(e => !allSettingsView.changedOnly || state.changed[e.setting.id]);
  if (!allSettingsView.query.trim()) entries.sort((x, y) => ((order.has(x.category) ? order.get(x.category) : 99) - (order.has(y.category) ? order.get(y.category) : 99)) || x.setting.label.localeCompare(y.setting.label));
  else entries.sort((x, y) => ((order.has(x.category) ? order.get(x.category) : 99) - (order.has(y.category) ? order.get(y.category) : 99)));
  const rows = []; let current = null; const titles = CATEGORY_TITLES();
  const counts = new Map(); entries.forEach(e => counts.set(e.category, (counts.get(e.category) || 0) + 1));
  for (const e of entries) {
    if (e.category !== current) { current = e.category; rows.push({ header: true, key: '#' + current, category: current, title: titles.get(current) || humanize(current), count: counts.get(current) }); }
    rows.push(e);
  }
  return rows;
}
function pm51Height(row) {
  if (row.header) return allSettingsView.heights.get(row.key) || 54;
  return allSettingsEstimatedHeight(row);
}
function pm51Prefix(rows) { const p = [0]; for (const r of rows) p.push(p[p.length - 1] + pm51Height(r)); return p; }
function pm51RowHtml(row, index, workspace) {
  if (row.header) return `<div class="pm51-cat-head" data-all-setting-key="${a(row.key)}" data-all-setting-index="${index}"><span class="pm51-cat-title">${h(row.title)}</span><span class="pm51-cat-count">${row.count} settings</span></div>`;
  return allSettingsRowHtml(row, index, workspace);
}
renderAllSettingsSection = function (workspace) {
  const rows = pm51AllRows(), prefix = pm51Prefix(rows), end = Math.min(rows.length, 20);
  const catalog = allSettingsCatalog(), titles = CATEGORY_TITLES();
  const opt = (values, current, label, format = humanize) => `<option value="all">${h(label)}</option>${[...new Set(values)].sort().map(v => `<option value="${a(v)}" ${current === v ? 'selected' : ''}>${h(format(v))}</option>`).join('')}`;
  const categories = opt(catalog.map(x => x.category), allSettingsView.category, 'All categories', v => titles.get(v) || humanize(v));
  const show = `<option value="all" ${allSettingsView.exposure === 'all' ? 'selected' : ''}>Show: All</option><option value="simple" ${allSettingsView.exposure === 'simple' ? 'selected' : ''}>Show: Common</option><option value="advanced" ${allSettingsView.exposure === 'advanced' ? 'selected' : ''}>Show: Advanced</option>`;
  const more = allSettingsView.moreFilters ? `<div class="pm51-facets-more">
      <select class="select-control" data-action="all-settings-filter" data-filter="control" aria-label="Control type">${opt(catalog.map(x => x.control), allSettingsView.control, 'All control types')}</select>
      <select class="select-control" data-action="all-settings-filter" data-filter="applicability" aria-label="Applicability">${opt(catalog.flatMap(x => x.applicability), allSettingsView.applicability, 'All applicability')}</select>
      <select class="select-control" data-action="all-settings-filter" data-filter="ownerStatus" aria-label="Owner status">${opt(catalog.map(x => x.ownerStatus), allSettingsView.ownerStatus, 'All owner statuses')}</select>
      <select class="select-control" data-action="all-settings-filter" data-filter="resultType" aria-label="Result type">${opt(catalog.map(x => x.resultType), allSettingsView.resultType, 'All result types')}</select>
      <label class="pm51-facet-check"><input type="checkbox" data-action="pm51-all-show-ids" ${allSettingsView.showIds ? 'checked' : ''}/> Show setting IDs</label>
    </div>` : '';
  return `<section class="settings-section all-settings-catalog pm51-all${allSettingsView.showIds ? ' pm51-show-ids' : ''}" id="section-all-settings" data-section-id="all-settings">
    <div class="pm51-facets" data-pm51-facets>
      <div class="pm51-facets-main">
        <label class="pm51-facet-search">${icon('search')}<input class="text-control all-settings-query" data-action="all-settings-query" value="${a(allSettingsView.query)}" placeholder="Search settings" aria-label="Search settings"/></label>
        <select class="select-control" data-action="all-settings-filter" data-filter="category" aria-label="Category">${categories}</select>
        <select class="select-control" data-action="all-settings-filter" data-filter="exposure" aria-label="Show">${show}</select>
        <label class="pm51-facet-check"><input type="checkbox" data-action="pm51-all-changed" ${allSettingsView.changedOnly ? 'checked' : ''}/> Changed only</label>
        <button type="button" class="pm51-link" data-action="pm51-all-more">${allSettingsView.moreFilters ? 'Fewer filters' : 'More filters'}</button>
      </div>${more}
      <div class="pm51-facets-count"><span data-all-settings-count aria-live="polite">${rows.filter(r => !r.header).length} of ${catalog.length} settings</span><span class="pm51-facets-current" data-pm51-current-group></span></div>
    </div>
    <div class="all-settings-viewport pm51-all-viewport" data-all-settings-viewport><div class="all-settings-spacer" data-all-settings-spacer><div class="all-settings-window" data-all-settings-window>${renderAllSettingsWindow(rows, 0, end, prefix, workspace)}</div></div></div>
    ${rows.length ? '' : '<div class="all-settings-empty">No settings match. Clear the filters to see everything.</div>'}
    <div class="pm51-quiet"><button type="button" class="pm51-link" data-action="clear-all-settings-filters">Clear filters</button><button type="button" class="pm51-link" data-action="pm51-all-reset">Reset all to defaults</button><button type="button" class="pm51-link" data-action="pm51-all-export">Export list</button></div>
  </section>`;
};
renderAllSettingsWindow = function (rows, start, end, prefix, workspace) {
  const top = Math.max(0, prefix[start] || 0), bottom = Math.max(0, (prefix[rows.length] || 0) - (prefix[end] || 0));
  return `<div class="all-settings-virtual-pad" aria-hidden="true" style="height:${top}px"></div>${rows.slice(start, end).map((row, i) => pm51RowHtml(row, start + i, workspace)).join('')}<div class="all-settings-virtual-pad" aria-hidden="true" style="height:${bottom}px"></div>`;
};
let pm51AllScroller = null, pm51AllScrollHandler = null, pm51AllFrame = 0;
refreshAllSettingsVirtual = function (resetScroll = false) {
  const viewport = root.querySelector('[data-all-settings-viewport]'), scroller = root.querySelector('#settings-document');
  if (!viewport || !scroller) return;
  const generation = ++allSettingsView.generation;
  const windowEl = viewport.querySelector('[data-all-settings-window]'), count = root.querySelector('[data-all-settings-count]'), current = root.querySelector('[data-pm51-current-group]');
  const rows = pm51AllRows(), prefix = pm51Prefix(rows);
  const viewportTop = viewport.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
  if (resetScroll) { allSettingsView.start = -1; allSettingsView.end = -1; if (scroller.scrollTop > viewportTop) scroller.scrollTop = Math.max(0, viewportTop - 120); }
  const offset = Math.max(0, scroller.scrollTop - viewportTop);
  const visibleStart = allSettingsIndexAt(prefix, offset), start = Math.max(0, visibleStart - 4), end = Math.min(rows.length, allSettingsIndexAt(prefix, offset + scroller.clientHeight) + 6);
  const workspace = getWorkspace(getDomain(), 'project-settings');
  if (windowEl && (start !== allSettingsView.start || end !== allSettingsView.end || resetScroll)) {
    allSettingsView.start = start; allSettingsView.end = end; windowEl.innerHTML = renderAllSettingsWindow(rows, start, end, prefix, workspace);
    requestAnimationFrame(() => {
      if (generation !== allSettingsView.generation || !windowEl.isConnected) return;
      let changed = false;
      for (const node of windowEl.querySelectorAll('.setting-row, .pm51-cat-head')) {
        const style = getComputedStyle(node), height = node.getBoundingClientRect().height + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
        const key = node.dataset.allSettingKey || node.dataset.allSettingId;
        if (key && Number.isFinite(height) && height > 0 && Math.abs((allSettingsView.heights.get(key) || 0) - height) > .5) { allSettingsView.heights.set(key, height); changed = true; }
      }
      if (changed) { allSettingsView.start = -1; requestAnimationFrame(() => { if (generation === allSettingsView.generation) refreshAllSettingsVirtual(false); }); }
    });
  }
  if (count) count.textContent = `${rows.filter(r => !r.header).length} of ${allSettingsCatalog().length} settings`;
  if (current) { let title = ''; for (const r of rows.slice(0, visibleStart + 1)) if (r.header) title = r.title; current.textContent = title ? 'In: ' + title : ''; }
};
setupAllSettingsVirtual = function () {
  const viewport = root.querySelector('[data-all-settings-viewport]'), scroller = root.querySelector('#settings-document');
  if (!viewport || !scroller) return;
  if (pm51AllScroller && pm51AllScrollHandler) pm51AllScroller.removeEventListener('scroll', pm51AllScrollHandler);
  pm51AllScrollHandler = () => { if (pm51AllFrame) return; pm51AllFrame = requestAnimationFrame(() => { pm51AllFrame = 0; refreshAllSettingsVirtual(false); }); };
  pm51AllScroller = scroller; scroller.addEventListener('scroll', pm51AllScrollHandler, { passive: true });
  if (allSettingsResizeObserver) allSettingsResizeObserver.disconnect();
  if (typeof ResizeObserver === 'function') {
    let priorWidth = viewport.clientWidth;
    allSettingsResizeObserver = new ResizeObserver(() => { const next = viewport.clientWidth; if (next !== priorWidth) { priorWidth = next; allSettingsView.heights.clear(); allSettingsView.start = -1; requestAnimationFrame(() => refreshAllSettingsVirtual(false)); } });
    allSettingsResizeObserver.observe(viewport);
  }
  allSettingsView.start = -1; refreshAllSettingsVirtual(false);
};
PM51.on('all-more', () => { allSettingsView.moreFilters = !allSettingsView.moreFilters; PM51.refresh('project-settings', { swap: false }); });
PM51.on('all-changed', el => { allSettingsView.changedOnly = !!el.checked; refreshAllSettingsVirtual(true); });
PM51.on('all-show-ids', el => { allSettingsView.showIds = !!el.checked; root.querySelector('.pm51-all')?.classList.toggle('pm51-show-ids', allSettingsView.showIds); });
PM51.on('all-reset', () => confirmDialog('Reset every setting to its default?', 'Every project setting goes back to its default value. You can change them again afterwards.', 'Reset all', () => { restoreAllProjectDefaults(); showToast('Settings reset', 'All project settings are back to their defaults.'); }, true));
PM51.on('all-export', () => { const rows = allSettingsCatalog(); infoDrawer('Export settings list', 'A secret-free list of every setting and its current value, ready to save.', [['Settings', String(rows.length)], ['Format', 'JSON · no secrets'], ['Scope', 'This project']], { intro: 'Exporting stays local. Credentials are never included.' }); });

/* Manager-scoped CSS: each manager file may add a few rules without touching styles.css. */
const pm51StyleChunks = [];
PM51.style = css => { pm51StyleChunks.push(css); let el = document.getElementById('pm51-managers-css'); if (!el) { el = document.createElement('style'); el.id = 'pm51-managers-css'; document.head.appendChild(el); } el.textContent = pm51StyleChunks.join('\n'); };
PM51.icon = icon;
PM51.h = h; PM51.a = a;
window.PM51 = PM51;
