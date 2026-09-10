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
PM51.on = (name, fn) => { actions[name] = fn; };
PM51.onChange = (name, fn) => { changes[name] = fn; };
PM51.onInput = (name, fn) => { inputs[name] = fn; };

/* ---------- state ------------------------------------------------------ */
function ensurePm51State() {
  if (!state.pm51 || typeof state.pm51 !== 'object') state.pm51 = {};
  const s = state.pm51;
  if (!s.tabs) s.tabs = {};
  if (!s.sel) s.sel = {};
  for (const [key, value] of Object.entries(DATA)) if (s[key] === undefined) s[key] = clone(value);
  pm51SeedCanonicalValues();
}
/* The engine seeds state.settings from the reference pages; those pages are deleted by the placement
   pass, so the same seeding runs here for every canonical row wherever it now renders. */
function pm51SeedCanonicalValues() {
  const reg = PM51.placement && PM51.placement.byId; if (!reg || !state.settings || typeof state.settings !== 'object') return;
  for (const entry of Object.values(reg)) {
    const s = entry.setting; if (!s || state.settings[s.id] !== undefined || s.value === undefined) continue;
    state.settings[s.id] = typeof s.value === 'object' && s.value !== null ? clone(s.value) : s.value;
  }
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
/* Status token: a small coloured dot plus text. No capsules anywhere in Settings (the user does not
   like pills); PM51.pill keeps its name so every manager converts without edits. */
PM51.status = (label, tone) => `<span class="pm51-status tone-${a(tone || PM51.tone(label))}"><i aria-hidden="true"></i><span>${h(label)}</span></span>`;
PM51.pill = PM51.status;
PM51.statusPill = status => PM51.status(PM51.plain(status));
PM51.tag = (label, { icon: ic } = {}) => `<span class="pm51-tag">${ic ? icon(ic) : ''}${h(label)}</span>`;
PM51.kbd = key => `<kbd class="pm51-kbd">${h(key)}</kbd>`;
PM51.dot = tone => `<span class="status-dot ${a({ ready: 'ready', attention: 'attention', off: 'disabled', info: 'info', blocked: 'error', neutral: 'disabled' }[tone] || 'disabled')}"></span>`;

/* ---------- primitives -------------------------------------------------- */
const dataAttrs = data => Object.entries(data || {}).map(([k, v]) => `data-${a(k)}="${a(v == null ? '' : v)}"`).join(' ');

PM51.btn = ({ label, action, data, icon: ic, primary, small, ghost, danger, disabled, reason, ui, cls, title, callback }) => {
  const dis = disabled ? `aria-disabled="true" data-pm51-disabled="1" data-disabled-reason="${a(reason || 'Not available in this concept preview.')}" data-pm-hover-label="${a(label || '')}" data-pm-hover-detail="${a(reason || 'Not available in this concept preview.')}"` : '';
  const act = disabled ? 'data-action="pm51-disabled"' : (callback ? `data-callback="${a(registerAction(callback))}"` : `data-action="${a(action || 'pm51-noop')}"`);
  return `<button type="button" class="btn pm51-btn${primary ? ' primary' : ''}${small ? ' small' : ''}${ghost ? ' ghost' : ''}${danger ? ' danger' : ''}${cls ? ' ' + cls : ''}" ${act} ${ui ? `data-ui-action-id="${a(ui)}"` : ''} ${dataAttrs(data)} ${dis} ${title ? `title="${a(title)}"` : ''}>${ic ? icon(ic) : ''}${label ? `<span>${h(label)}</span>` : ''}</button>`;
};
PM51.iconBtn = ({ action, data, icon: ic, label, cls, callback, ui, disabled, reason }) => {
  const act = disabled ? 'data-action="pm51-disabled"' : (callback ? `data-callback="${a(registerAction(callback))}"` : `data-action="${a(action || 'pm51-noop')}"`);
  const why = reason || 'Not available here.';
  const dis = disabled ? ` aria-disabled="true" data-pm51-disabled="1" data-disabled-reason="${a(why)}" data-pm-hover-detail="${a(why)}"` : '';
  return `<button type="button" class="icon-btn pm51-icon-btn${cls ? ' ' + cls : ''}${disabled ? ' is-disabled' : ''}" ${act} ${ui ? `data-ui-action-id="${a(ui)}"` : ''} ${dataAttrs(data)} aria-label="${a(label || '')}" data-pm-hover-label="${a(label || '')}"${dis}>${icon(ic || 'more')}</button>`;
};
PM51.link = ({ label, action, data, callback, cls, ui }) => {
  const act = callback ? `data-callback="${a(registerAction(callback))}"` : `data-action="${a(action || 'pm51-noop')}"`;
  return `<button type="button" class="pm51-link${cls ? ' ' + cls : ''}" ${act} ${ui ? `data-ui-action-id="${a(ui)}"` : ''} ${dataAttrs(data)}>${h(label)}</button>`;
};
/* Dropdown: a hidden native <select> (keeps every change handler, FormData and querySelector('select')
   consumer working) beside a themed trigger; the option list is a chat-style sprout popout in body. */
const normOption = o => (o && typeof o === 'object' && !Array.isArray(o)) ? o : (Array.isArray(o) ? { value: o[0], label: o[1] } : { value: o, label: o });
PM51.dropdown = (value, options, { action, data, cls, label, name, id, search, width, placeholder, disabled, reason } = {}) => {
  const list = (options || []).map(normOption);
  const sel = `<select class="select-control pm51-select${cls ? ' ' + cls : ''}" data-action="${a(action || 'pm51-noop')}" ${dataAttrs(data)} ${name ? `name="${a(name)}"` : ''} ${id ? `id="${a(id)}"` : ''} ${label ? `aria-label="${a(label)}"` : ''} ${search ? 'data-dd-search="1"' : ''} ${width ? `data-dd-width="${Number(width)}"` : ''} ${placeholder ? `data-dd-placeholder="${a(placeholder)}"` : ''} ${disabled ? `aria-disabled="true" data-disabled-reason="${a(reason || 'This cannot be changed here.')}"` : ''}>${list.map(o => `<option value="${a(o.value)}"${String(o.value) === String(value) ? ' selected' : ''}${o.meta ? ` data-meta="${a(o.meta)}"` : ''}${o.icon ? ` data-icon="${a(o.icon)}"` : ''}${o.group ? ` data-group="${a(o.group)}"` : ''}${o.disabled ? ' data-disabled="1"' : ''}${o.reason ? ` data-reason="${a(o.reason)}"` : ''}>${h(o.label)}</option>`).join('')}</select>`;
  return PM51.upgradeSelects(sel);
};
PM51.select = (value, options, opts) => PM51.dropdown(value, options, opts || {});
/* Wrap every native <select> in an HTML string (engine rows, dialogs, facets) with the dropdown trigger. */
function upgradeSelectNode(sel) {
  if (sel.classList.contains('pm51-dd-native')) return;
  const wrap = document.createElement('span'); wrap.className = 'pm51-dd' + (sel.classList.contains('form-select') ? ' pm51-dd-form' : '');
  sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel);
  sel.classList.add('pm51-dd-native'); sel.setAttribute('aria-hidden', 'true'); sel.setAttribute('tabindex', '-1');
  const disabled = sel.disabled || sel.getAttribute('aria-disabled') === 'true';
  if (sel.disabled) { sel.disabled = false; if (!sel.dataset.disabledReason) sel.dataset.disabledReason = 'This cannot be changed here.'; }
  const cur = sel.options[sel.selectedIndex];
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'pm51-dd-trigger';
  btn.setAttribute('data-action', disabled ? 'pm51-disabled' : 'pm51-dd-open'); btn.setAttribute('role', 'combobox'); btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('data-pm-hover-exempt', 'dropdown');
  const label = sel.getAttribute('aria-label') || (sel.closest('label') && (sel.closest('label').querySelector('.form-label, .pm51-field-label') || {}).textContent) || '';
  if (label) btn.setAttribute('aria-label', String(label).trim());
  if (disabled) { btn.setAttribute('aria-disabled', 'true'); btn.setAttribute('data-disabled-reason', sel.dataset.disabledReason || 'This cannot be changed here.'); }
  if (sel.dataset.ddWidth) btn.style.width = Number(sel.dataset.ddWidth) + 'px';
  btn.innerHTML = `<span class="pm51-dd-value">${h(cur ? cur.textContent : (sel.dataset.ddPlaceholder || ''))}</span>${icon('down')}`;
  wrap.appendChild(btn);
}
PM51.upgradeSelects = html => {
  if (!html || typeof html !== 'string' || html.indexOf('<select') < 0) return html;
  const tpl = document.createElement('template'); tpl.innerHTML = html;
  tpl.content.querySelectorAll('select').forEach(upgradeSelectNode);
  return tpl.innerHTML;
};
PM51.toggle = (on, { action, data, label, disabled, reason, ui } = {}) => `<button type="button" class="toggle pm51-toggle${on ? ' on' : ''}" role="switch" aria-checked="${on ? 'true' : 'false'}" ${ui ? `data-ui-action-id="${a(ui)}"` : ''} data-action="${a(disabled ? 'pm51-disabled' : (action || 'pm51-noop'))}" ${dataAttrs(data)} aria-label="${a(label || 'Toggle')}" ${disabled ? `aria-disabled="true" data-pm51-disabled="1" data-disabled-reason="${a(reason || 'This cannot be changed here.')}" data-pm-hover-label="${a(label || 'Toggle')}" data-pm-hover-detail="${a(reason || 'This cannot be changed here.')}"` : ''}></button>`;
PM51.segmented = (value, options, { action, data, label } = {}) => `<div class="segmented pm51-seg" role="group" ${label ? `aria-label="${a(label)}"` : ''}>${options.map(o => { const v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o; return `<button type="button" class="${String(v) === String(value) ? 'active' : ''}" data-action="${a(action || 'pm51-noop')}" ${dataAttrs(data)} data-value="${a(v)}" aria-pressed="${String(v) === String(value)}">${h(l)}</button>`; }).join('')}</div>`;
PM51.input = (value, { action, data, placeholder, type, cls, label } = {}) => `<input class="text-control pm51-input${cls ? ' ' + cls : ''}" type="${a(type || 'text')}" value="${a(value == null ? '' : value)}" placeholder="${a(placeholder || '')}" data-action="${a(action || 'pm51-noop')}" ${dataAttrs(data)} ${label ? `aria-label="${a(label)}"` : ''}/>`;
PM51.chip = label => PM51.tag(label);
PM51.chipToggle = (label, on, { action, data, label: aria } = {}) => `<button type="button" class="pm51-chip pm51-chip-toggle${on ? ' is-on' : ''}" aria-pressed="${on ? 'true' : 'false'}" data-action="${a(action || 'pm51-noop')}" ${dataAttrs(data)}>${h(label)}</button>`;
PM51.tech = text => `<code class="pm51-tech">${h(text)}</code>`;

PM51.page = ({ id, key, tabs, active, body, quiet, cls, ui }) => {
  const tabsHtml = tabs && tabs.length ? `<nav class="manager-tabs pm51-tabs" aria-label="Sections">${tabs.map(t => `<button type="button" class="manager-tab${t.id === active ? ' active' : ''}" data-action="pm51-tab" data-manager="${a(id)}" data-tab="${a(t.id)}" ${t.ui || ui ? `data-ui-action-id="${a(t.ui || ui)}"` : ''}>${h(t.label)}</button>`).join('')}</nav>` : '';
  return `<div class="manager-page pm51-mgr${tabsHtml ? ' has-manager-tabs' : ''}${cls ? ' ' + cls : ''}" data-manager-key="${a(key || '')}" data-pm51-manager="${a(id)}">${tabsHtml}<div class="manager-body manager-tab-body pm51-body"><div class="manager-scroll pm51-scroll">${body}${quiet && quiet.length ? PM51.quiet(quiet) : ''}</div></div></div>`;
};
PM51.section = ({ title, help, action, body, cls, id, tone, data }) => `<section class="panel-card pm51-section${cls ? ' ' + cls : ''}${tone ? ' tone-' + a(tone) : ''}" ${id ? `id="${a(id)}"` : ''} ${dataAttrs(data)}><div class="pm51-section-head"><div class="pm51-section-copy"><h3 class="pm51-section-title">${h(title)}</h3>${help ? `<p class="pm51-section-help">${h(help)}</p>` : ''}</div>${action ? (typeof action === 'string' ? action : PM51.btn(action)) : ''}</div>${body ? `<div class="pm51-section-body">${body}</div>` : ''}</section>`;
PM51.grid = (cols, ...parts) => `<div class="pm51-grid cols-${a(cols)}">${parts.join('')}</div>`;
PM51.rows = (rows, { cls } = {}) => `<div class="pm51-rows${cls ? ' ' + cls : ''}">${rows.filter(Boolean).map(r => `<div class="pm51-row${r.cls ? ' ' + r.cls : ''}" ${r.id ? `data-row="${a(r.id)}"` : ''} ${dataAttrs(r.data)}><div class="pm51-row-copy"><div class="pm51-row-label">${h(r.label)}${r.pill ? ' ' + r.pill : ''}</div>${r.help ? `<div class="pm51-row-help">${h(r.help)}</div>` : ''}</div><div class="pm51-row-control">${r.control || (r.value != null ? `<span class="pm51-row-value${r.muted ? ' is-muted' : ''}">${h(String(r.value))}</span>` : '')}${r.action ? (typeof r.action === 'string' ? r.action : PM51.btn(Object.assign({ small: true }, r.action))) : ''}</div></div>`).join('')}</div>`;
PM51.stats = items => `<div class="pm51-stats">${items.map(s => `<div class="pm51-stat${s.tone ? ' tone-' + a(s.tone) : ''}"><div class="pm51-stat-label">${h(s.label)}</div><div class="pm51-stat-value">${h(String(s.value))}</div>${s.help ? `<div class="pm51-stat-help">${h(s.help)}</div>` : ''}</div>`).join('')}</div>`;
PM51.list = (items, { cls } = {}) => `<div class="pm51-list${cls ? ' ' + cls : ''}">${items.filter(Boolean).map(it => `<div class="pm51-item${it.cls ? ' ' + it.cls : ''}${it.action || it.callback ? ' is-clickable' : ''}" ${it.action ? `data-action="${a(it.action)}"` : ''} ${it.callback ? `data-callback="${a(registerAction(it.callback))}"` : ''} ${dataAttrs(it.data)} ${it.action || it.callback ? 'role="button" tabindex="0"' : ''}>${it.avatar ? `<span class="pm51-item-avatar">${it.avatar}</span>` : ''}<div class="pm51-item-copy"><div class="pm51-item-title">${h(it.title)}${it.pill ? ' ' + it.pill : ''}</div>${it.meta ? `<div class="pm51-item-meta">${h(it.meta)}</div>` : ''}${it.sub ? `<div class="pm51-item-sub">${h(it.sub)}</div>` : ''}${it.note ? `<div class="pm51-item-note">${h(it.note)}</div>` : ''}</div><div class="pm51-item-end">${it.end || ''}</div></div>`).join('')}</div>`;
PM51.steps = (items, { start = 1, cls } = {}) => `<ol class="pm51-steps${cls ? ' ' + cls : ''}">${items.filter(Boolean).map((s, i) => `<li class="pm51-step${s.tone ? ' tone-' + a(s.tone) : ''}${s.done ? ' is-done' : ''}"><span class="pm51-step-n">${s.done ? icon('check') : (i + start)}</span><div class="pm51-step-copy"><div class="pm51-step-title">${h(s.title)}</div>${s.desc ? `<div class="pm51-step-desc">${h(s.desc)}</div>` : ''}</div><div class="pm51-step-end">${s.status ? PM51.pill(s.status, s.tone) : ''}${s.action ? (typeof s.action === 'string' ? s.action : PM51.btn(Object.assign({ small: true }, s.action))) : ''}</div></li>`).join('')}</ol>`;
PM51.advanced = (body, { label, open, help } = {}) => `<details class="pm51-advanced" ${open ? 'open' : ''}><summary>${icon('chevron')}<span>${h(label || 'Advanced')}</span>${help ? `<small>${h(help)}</small>` : ''}</summary><div class="pm51-advanced-body">${body}</div></details>`;
PM51.quiet = items => `<div class="pm51-quiet">${items.filter(Boolean).map(i => PM51.link(i)).join('')}</div>`;
PM51.empty = (title, copy, action) => `<div class="empty-state pm51-empty"><div>${icon('info')}<div class="empty-title">${h(title)}</div>${copy ? `<div class="empty-copy">${h(copy)}</div>` : ''}${action ? `<div class="empty-actions">${PM51.btn(Object.assign({ primary: true }, action))}</div>` : ''}</div></div>`;
PM51.kv = pairs => `<div class="pm51-kv">${pairs.filter(Boolean).map(([k, v]) => `<div class="pm51-kv-row"><span>${h(k)}</span><span>${v == null ? '—' : h(String(v))}</span></div>`).join('')}</div>`;
PM51.note = (text, tone) => `<p class="pm51-note${tone ? ' tone-' + a(tone) : ''}">${icon(tone === 'attention' ? 'alert' : 'info')}<span>${h(text)}</span></p>`;
PM51.field = (label, control, help) => `<label class="pm51-field"><span class="pm51-field-label">${h(label)}</span>${control}${help ? `<span class="pm51-field-help">${h(help)}</span>` : ''}</label>`;
PM51.initials = name => String(name || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
/* Usage meter: 4 px rounded track, label + "value" line; tone from the percentage unless given. */
PM51.meter = ({ label, pct, reset, tone, note, value }) => {
  const p = Math.max(0, Math.min(100, Number(pct) || 0));
  const t = tone || (p >= 100 ? 'blocked' : p >= 80 ? 'attention' : 'ready');
  const text = value || `${Math.round(p)}% used${reset ? ' · ' + reset : ''}`;
  return `<div class="pm51-meter tone-${a(t)}" data-pct="${Math.round(p)}"><div class="pm51-meter-head"><span class="pm51-meter-label">${h(label)}</span><span class="pm51-meter-value">${h(text)}</span></div><div class="pm51-meter-track" role="img" aria-label="${a(`${label}: ${text}`)}"><i class="pm51-meter-fill" style="--fill:${Math.round(p)}%"></i></div>${note ? `<div class="pm51-meter-note">${h(note)}</div>` : ''}</div>`;
};
/* Numbered order badge (priority lists); locked variant for a fixed first position. */
PM51.order = (n, { locked, label } = {}) => `<span class="pm51-order${locked ? ' is-locked' : ''}" aria-label="${a(label || (locked ? 'Always first' : 'Position ' + n))}">${locked ? icon('lock') : h(String(n))}</span>`;
/* Accordion: a head row with controls and a pop-down body; open state persists in PM51.s().open. */
PM51.accordion = (items, { cls } = {}) => `<div class="pm51-acc${cls ? ' ' + cls : ''}">${items.filter(Boolean).map(it => {
  const open = it.open != null ? !!it.open : !!(PM51.s().open || {})[it.id];
  return `<div class="pm51-acc-item${open ? ' is-open' : ''}" data-acc="${a(it.id)}" ${dataAttrs(it.data)}>
    <div class="pm51-acc-head" data-action="pm51-accordion" data-acc-id="${a(it.id)}">${it.badge || ''}${it.avatar ? `<span class="pm51-item-avatar">${it.avatar}</span>` : ''}<div class="pm51-acc-copy"><div class="pm51-acc-title">${h(it.title)}${it.tag ? ' ' + it.tag : ''}</div>${it.meta ? `<div class="pm51-acc-meta">${h(it.meta)}</div>` : ''}${it.note ? `<div class="pm51-acc-note">${h(it.note)}</div>` : ''}${it.meters ? `<div class="pm51-acc-meters">${it.meters}</div>` : ''}</div><div class="pm51-acc-end">${it.status || ''}${it.controls || ''}<button type="button" class="icon-btn pm51-acc-toggle" data-action="pm51-accordion" data-acc-id="${a(it.id)}" aria-expanded="${open ? 'true' : 'false'}" aria-controls="pm51-acc-${a(it.id)}" aria-label="${a(open ? 'Collapse' : 'Expand')}">${icon('chevron')}</button></div></div>
    <div class="pm51-acc-body" id="pm51-acc-${a(it.id)}" ${open ? '' : 'inert'}><div class="pm51-acc-inner">${it.body || ''}</div></div>
  </div>`; }).join('')}</div>`;
PM51.on('accordion', el => {
  const id = el.dataset.accId; const item = el.closest('.pm51-acc-item'); if (!id || !item) return;
  const s = PM51.s(); s.open = s.open || {}; const open = !item.classList.contains('is-open'); s.open[id] = open;
  item.classList.toggle('is-open', open);
  const body = item.querySelector('.pm51-acc-body'); if (body) { if (open) body.removeAttribute('inert'); else body.setAttribute('inert', ''); }
  item.querySelectorAll('.pm51-acc-toggle').forEach(b => { b.setAttribute('aria-expanded', open ? 'true' : 'false'); b.setAttribute('aria-label', open ? 'Collapse' : 'Expand'); });
  saveState();
});

PM51.listDetail = ({ id, rosterId, rosterTitle, count, add, filter, items, detail, selectAction, scroll }) => `<div class="split-manager pm51-split" ${scroll === false ? '' : 'data-roster-scroll="1"'}>
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

/* ---------- popout engine: dropdown lists, menus, pickers ------------------- */
/* Popouts live in document.body (position:fixed) so #pm-settings-portals' overflow:hidden and the
   root's contain never clip them. Nothing in body gets the engine's event routing (ownsEvent), so
   the engine owns its listeners here; the motion contract is the chat assistant's "sprout"
   (six --pm6-sprout-* vars, is-open / is-closing), driven by window.PM6_SPROUT when that script has
   loaded and by an identical local class choreography otherwise. */
let pmActive = null, popSeq = 0;
const POP_ID = () => 'pm51-pop-' + (++popSeq);
const pmSprout = () => (window.PM6_SPROUT && typeof window.PM6_SPROUT.open === 'function' && typeof window.PM6_SPROUT.close === 'function') ? window.PM6_SPROUT : null;
function setSproutLocal(el, anchor) {
  const r = el.getBoundingClientRect(), ar = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : null;
  const ax = ar ? ar.left + ar.width / 2 : r.left + r.width / 2, ay = ar ? ar.top + ar.height / 2 : r.top;
  const ox = ax < r.left + r.width / 2 ? 12 : 88, above = ay > r.top + r.height / 2;
  el.style.setProperty('--pm6-sprout-ox', ox + '%'); el.style.setProperty('--pm6-sprout-oy', above ? '100%' : '0%');
  el.style.setProperty('--pm6-sprout-tx', '0px'); el.style.setProperty('--pm6-sprout-ty', above ? '10px' : '-10px');
  el.style.setProperty('--pm6-sprout-sx', '0.72'); el.style.setProperty('--pm6-sprout-sy', '0.48');
  el.dataset.sprout = (above ? 'b' : 't') + (ox === 12 ? 'l' : 'r');
}
function sproutOpen(el, anchor) {
  const S = pmSprout();
  if (S) { S.open(el, null, anchor || null); if (!anchor) setSproutLocal(el, null); return; }
  el.classList.remove('is-closing'); el.style.display = 'block'; setSproutLocal(el, anchor); void el.offsetHeight; el.classList.add('is-open');
}
function sproutClose(el, done) {
  const S = pmSprout();
  if (S) { S.close(el, done); return; }
  let finished = false; const finish = () => { if (finished) return; finished = true; el.removeEventListener('transitionend', onEnd); el.style.display = 'none'; done && done(); };
  const onEnd = e => { if (e.target !== el || (e.propertyName !== 'opacity' && e.propertyName !== 'transform')) return; finish(); };
  el.classList.remove('is-open'); el.classList.add('is-closing'); el.addEventListener('transitionend', onEnd);
  window.setTimeout(finish, motionReduced() ? 0 : 280);
}
function positionPopout(pop, anchor, { align = 'left', width = 0 } = {}) {
  const vw = window.innerWidth, vh = window.innerHeight;
  const r = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : { left: vw - 240, right: vw - 16, top: 16, bottom: 16, width: 224 };
  pop.style.display = 'block'; pop.style.top = ''; pop.style.bottom = ''; pop.style.maxHeight = '';
  const w = Math.min(vw - 16, Math.max(width || 0, align === 'right' ? 210 : r.width, 200));
  pop.style.width = w + 'px';
  const ph = pop.offsetHeight;
  let left = align === 'right' ? r.right - w : r.left; left = Math.max(8, Math.min(vw - w - 8, left));
  const below = vh - r.bottom - 8, above = r.top - 8;
  const placeBelow = below >= Math.min(ph, 240) || below >= above;
  if (placeBelow) { pop.style.top = Math.round(r.bottom + 6) + 'px'; pop.style.maxHeight = Math.max(120, Math.min(420, below - 6)) + 'px'; }
  else { pop.style.bottom = Math.round(vh - r.top + 6) + 'px'; pop.style.maxHeight = Math.max(120, Math.min(420, above - 6)) + 'px'; }
  pop.style.left = Math.round(left) + 'px';
  pop.dataset.sprout = (placeBelow ? 't' : 'b') + (align === 'right' ? 'r' : 'l');
}
function popoutClose(opts = {}) {
  const p = pmActive; if (!p) return; pmActive = null;
  if (p.trigger && p.trigger.setAttribute && p.trigger.isConnected) { p.trigger.setAttribute('aria-expanded', 'false'); p.trigger.removeAttribute('aria-controls'); p.trigger.removeAttribute('aria-activedescendant'); }
  const el = p.el; sproutClose(el, () => { if (el.isConnected) el.remove(); });
  if (p.kind === 'menu') menuAnchorEl = null;
  if (opts.restoreFocus !== false) { const t = p.returnFocus || p.trigger; if (t && t.isConnected && typeof t.focus === 'function') { try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } } }
}
PM51.closePopouts = () => popoutClose({ restoreFocus: false });
const optionNodes = entry => [...entry.el.querySelectorAll('[role="option"]')];
const enabledVisible = entry => optionNodes(entry).filter(n => !n.hidden && n.getAttribute('aria-disabled') !== 'true');
function setActiveOption(entry, index, scroll) {
  optionNodes(entry).forEach(n => n.classList.toggle('is-active', Number(n.dataset.index) === index));
  entry.active = index;
  const node = entry.el.querySelector(`[role="option"][data-index="${index}"]`);
  const owner = entry.searchInput || entry.trigger;
  if (owner && owner.setAttribute && node) owner.setAttribute('aria-activedescendant', node.id);
  if (node && scroll) {
    const top = node.offsetTop, bottom = top + node.offsetHeight, pad = entry.searchInput ? entry.searchInput.parentNode.offsetHeight + 6 : 4;
    if (top - pad < entry.el.scrollTop) entry.el.scrollTop = Math.max(0, top - pad);
    else if (bottom > entry.el.scrollTop + entry.el.clientHeight) entry.el.scrollTop = bottom - entry.el.clientHeight + 4;
  }
}
function moveActive(entry, delta, edge) {
  const nodes = enabledVisible(entry); if (!nodes.length) return;
  let i = nodes.findIndex(n => Number(n.dataset.index) === entry.active);
  if (edge === 'home') i = 0; else if (edge === 'end') i = nodes.length - 1; else i = Math.max(0, Math.min(nodes.length - 1, (i < 0 ? (delta > 0 ? -1 : nodes.length) : i) + delta));
  setActiveOption(entry, Number(nodes[i].dataset.index), true);
}
function commitOption(entry, index) {
  const o = entry.options[index]; if (!o) return;
  if (o.disabled) { showToast('Not available', o.reason || 'Not available here.', 'info', 2600); return; }
  popoutClose({ restoreFocus: true });
  entry.onCommit(o.value, o, index);
}
function filterOptions(entry) {
  const q = String(entry.searchInput.value || '').trim().toLowerCase();
  const before = entry.el.offsetHeight;
  let any = false;
  optionNodes(entry).forEach(n => { const hit = !q || n.textContent.toLowerCase().includes(q); n.hidden = !hit; if (hit) any = true; });
  entry.el.querySelectorAll('.pm51-popout-group').forEach(g => { let sib = g.nextElementSibling, shown = false; while (sib && sib.getAttribute('role') === 'option') { if (!sib.hidden) shown = true; sib = sib.nextElementSibling; } g.hidden = !shown; });
  const empty = entry.el.querySelector('.pm51-popout-empty'); if (empty) empty.hidden = any;
  const first = enabledVisible(entry)[0]; if (first) setActiveOption(entry, Number(first.dataset.index), true); else entry.active = -1;
  positionPopout(entry.el, entry.anchor, { align: entry.align, width: entry.width });
  if (!motionReduced() && Math.abs(entry.el.offsetHeight - before) > 4) { entry.el.classList.remove('is-size-bounce'); void entry.el.offsetWidth; entry.el.classList.add('is-size-bounce'); }
}
function openListPopout({ anchor, trigger, options, current, search, title, width, onCommit, kind = 'dropdown' }) {
  popoutClose({ restoreFocus: false });
  const pop = document.createElement('div'); pop.className = 'pm51-popout pm51-dd-list'; pop.id = POP_ID(); pop.setAttribute('role', 'listbox'); pop.tabIndex = -1; pop.dataset.portalDisplay = 'block';
  const groups = [], seen = new Map();
  options.forEach((o, i) => { const g = o.group || ''; if (!seen.has(g)) { seen.set(g, groups.length); groups.push({ name: g, items: [] }); } groups[seen.get(g)].items.push(Object.assign({ index: i }, o)); });
  const item = o => `<div class="pm51-popout-item" role="option" id="${pop.id}-${o.index}" data-index="${o.index}" aria-selected="${String(o.value) === String(current) ? 'true' : 'false'}" ${o.disabled ? `aria-disabled="true" data-disabled-reason="${a(o.reason || 'Not available.')}"` : ''}>${o.icon ? `<span class="pm51-popout-icon">${icon(o.icon)}</span>` : ''}<span class="pm51-popout-label">${h(o.label)}</span>${o.meta ? `<span class="pm51-popout-meta">${h(o.meta)}</span>` : ''}<span class="pm51-popout-check">${icon('check')}</span></div>`;
  pop.innerHTML = (search ? `<div class="pm51-popout-search">${icon('search')}<input type="search" role="combobox" aria-autocomplete="list" aria-controls="${pop.id}" aria-expanded="true" aria-label="${a('Filter ' + (title || 'options'))}" placeholder="${a(title ? 'Search ' + String(title).toLowerCase() : 'Search')}"/></div>` : (title ? `<div class="pm51-popout-title">${h(title)}</div>` : ''))
    + groups.map(g => (g.name ? `<div class="pm51-popout-group" role="presentation">${h(g.name)}</div>` : '') + g.items.map(item).join('')).join('')
    + '<div class="pm51-popout-empty" hidden>No matches</div>';
  document.body.appendChild(pop);
  const entry = { kind, el: pop, trigger, anchor, options, current, onCommit, active: -1, searchInput: pop.querySelector('input'), typeBuf: '', typeAt: 0, returnFocus: trigger, align: 'left', width: Math.max(width || 0, search ? 280 : 220, anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect().width : 0) };
  pmActive = entry;
  positionPopout(pop, anchor, { width: entry.width });
  sproutOpen(pop, anchor);
  if (trigger && trigger.setAttribute) { trigger.setAttribute('aria-expanded', 'true'); trigger.setAttribute('aria-controls', pop.id); }
  const selIdx = options.findIndex(o => String(o.value) === String(current));
  const firstOk = options.findIndex(o => !o.disabled);
  setActiveOption(entry, selIdx >= 0 ? selIdx : firstOk, true);
  pop.addEventListener('pointermove', e => { const it = e.target.closest('[role="option"]'); if (it && Number(it.dataset.index) !== entry.active) setActiveOption(entry, Number(it.dataset.index), false); });
  pop.addEventListener('click', e => { const it = e.target.closest('[role="option"]'); if (!it) return; e.preventDefault(); commitOption(entry, Number(it.dataset.index)); });
  if (entry.searchInput) { entry.searchInput.addEventListener('input', () => filterOptions(entry)); requestAnimationFrame(() => { if (pmActive === entry) entry.searchInput.focus({ preventScroll: true }); }); }
  else if (trigger && typeof trigger.focus === 'function') trigger.focus({ preventScroll: true });
  return pop;
}
function dropdownOpen(trigger) {
  const wrap = trigger.closest('.pm51-dd'), sel = wrap && wrap.querySelector('select'); if (!sel) return;
  if (pmActive && pmActive.trigger === trigger) { popoutClose({ restoreFocus: true }); return; }
  const options = [...sel.options].map(o => ({ value: o.value, label: o.textContent, meta: o.dataset.meta || '', icon: o.dataset.icon || '', group: o.dataset.group || '', disabled: o.dataset.disabled === '1', reason: o.dataset.reason || '' }));
  const search = sel.dataset.ddSearch === '1' || options.length > 12;
  openListPopout({ anchor: trigger, trigger, options, current: sel.value, search, title: trigger.getAttribute('aria-label') || '', width: Number(sel.dataset.ddWidth) || 0, kind: 'dropdown',
    onCommit: (value, o, index) => {
      if (!sel.isConnected) return;
      const changed = sel.selectedIndex !== index; sel.selectedIndex = index;
      const v = trigger.querySelector('.pm51-dd-value'); if (v) v.textContent = o.label;
      if (changed) sel.dispatchEvent(new Event('change', { bubbles: true }));
    } });
}
PM51.on('dd-open', el => dropdownOpen(el));
/* Picker: a searchable listbox anchored to any button (used by the assistant model / persona pickers). */
PM51.pick = (anchor, { title = '', current = null, items = [], search = true, width = 0, onPick } = {}) => openListPopout({ anchor, trigger: anchor, options: items.map(normOption), current, search, title, width, kind: 'pick', onCommit: value => onPick && onPick(value) });
/* Engine menus: same signature, chat-style sprout menu in body. */
openMenu = function (anchor, items, title = '') {
  if (pmActive && pmActive.kind === 'menu' && anchor && pmActive.anchor === anchor) { popoutClose({ restoreFocus: true }); return null; }
  popoutClose({ restoreFocus: false });
  const pop = document.createElement('div'); pop.className = 'pm51-popout pm51-menu'; pop.id = POP_ID(); pop.setAttribute('role', 'menu'); pop.dataset.portalDisplay = 'block';
  pop.innerHTML = (title ? `<div class="pm51-popout-title">${h(title)}</div>` : '') + (items || []).map((it, i) => {
    if (!it) return '';
    if (it.separator) return '<div class="pm51-popout-sep" role="separator"></div>';
    const off = !!(it.disabled || it.ariaDisabled);
    return `<button type="button" class="pm51-popout-item pm51-menu-item${it.danger ? ' is-danger' : ''}" role="menuitem" data-index="${i}" ${off ? `aria-disabled="true" data-disabled-reason="${a(it.meta || 'Unavailable')}" data-pm-hover-label="${a(it.label + ' unavailable')}" data-pm-hover-detail="${a(it.meta || 'Unavailable')}"` : ''}>${icon(it.icon || 'settings')}<span class="pm51-popout-label">${h(it.label)}</span>${it.meta ? `<span class="pm51-popout-meta">${h(it.meta)}</span>` : ''}</button>`;
  }).join('');
  document.body.appendChild(pop);
  const entry = { kind: 'menu', el: pop, trigger: anchor, anchor, items, returnFocus: captureTransientFocus(anchor) || anchor, align: 'right', width: 0 };
  pmActive = entry; menuAnchorEl = anchor || null;
  positionPopout(pop, anchor, { align: 'right' });
  sproutOpen(pop, anchor);
  pop.addEventListener('click', e => {
    const b = e.target.closest('.pm51-menu-item'); if (!b) return; e.preventDefault();
    const it = items[Number(b.dataset.index)]; if (!it) return;
    if (b.getAttribute('aria-disabled') === 'true') { showToast('Not available', it.meta || 'Unavailable', 'info', 2600); return; }
    popoutClose({ restoreFocus: true }); if (typeof it.onClick === 'function') it.onClick();
  });
  requestAnimationFrame(() => { if (pmActive !== entry) return; const first = pop.querySelector('.pm51-menu-item:not([aria-disabled="true"])'); if (first) first.focus({ preventScroll: true }); });
  return pop;
};
const pm51OriginalClosePopover = closePopover;
closePopover = function (pop, restoreFocus = true) {
  if (pop && pop.classList && pop.classList.contains('pm51-popout')) { if (pmActive && pmActive.el === pop) popoutClose({ restoreFocus }); return; }
  return pm51OriginalClosePopover(pop, restoreFocus);
};
const pm51OriginalCloseOverlay = closeOverlay;
closeOverlay = function () { popoutClose({ restoreFocus: false }); return pm51OriginalCloseOverlay.apply(this, arguments); };
assistantPick = function (anchor, kind, current, onPick) {
  const items = kind === 'model'
    ? [{ value: 'Default', label: 'Default model', meta: 'Resolver', icon: 'brain' }, ...assistantModelRoutes().map(r => ({ value: r.value, label: r.label, meta: r.providerLabel, icon: 'brain' }))]
    : assistantPersonas().map(name => ({ value: name, label: name, icon: 'user' }));
  PM51.pick(anchor, { title: kind === 'model' ? 'Model & account' : 'Persona', current, items, search: true, onPick });
};
/* Document listeners (installed once, before any drawer registers its Escape handler). */
(function installPopoutListeners() {
  const menuKeys = (entry, e) => {
    const items = [...entry.el.querySelectorAll('.pm51-menu-item:not([aria-disabled="true"])')]; if (!items.length) return false;
    let i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') i = (i + 1) % items.length; else if (e.key === 'ArrowUp') i = (i - 1 + items.length) % items.length; else if (e.key === 'Home') i = 0; else if (e.key === 'End') i = items.length - 1; else return false;
    items[i].focus({ preventScroll: true }); return true;
  };
  document.addEventListener('keydown', e => {
    const p = pmActive; if (!p) return;
    const inside = p.el.contains(e.target) || e.target === p.trigger || (p.anchor && p.anchor.contains && p.anchor.contains(e.target));
    if (e.key === 'Escape') { popoutClose({ restoreFocus: true }); e.preventDefault(); e.stopImmediatePropagation(); return; }
    if (!inside) return;
    if (p.kind === 'menu') {
      if (menuKeys(p, e)) { e.preventDefault(); e.stopImmediatePropagation(); return; }
      if (e.key === 'Tab') { popoutClose({ restoreFocus: true }); e.preventDefault(); e.stopImmediatePropagation(); }
      return;
    }
    const inSearch = p.searchInput && e.target === p.searchInput;
    const stop = () => { e.preventDefault(); e.stopImmediatePropagation(); };
    switch (e.key) {
      case 'ArrowDown': moveActive(p, 1); stop(); return;
      case 'ArrowUp': moveActive(p, -1); stop(); return;
      case 'PageDown': moveActive(p, 8); stop(); return;
      case 'PageUp': moveActive(p, -8); stop(); return;
      case 'Home': moveActive(p, 0, 'home'); stop(); return;
      case 'End': moveActive(p, 0, 'end'); stop(); return;
      case 'Enter': if (p.active >= 0) commitOption(p, p.active); stop(); return;
      case ' ': if (!inSearch) { if (p.active >= 0) commitOption(p, p.active); stop(); } return;
      case 'Tab': {
        const selIdx = p.options.findIndex(o => String(o.value) === String(p.current));
        if (p.active >= 0 && p.active !== selIdx) { commitOption(p, p.active); if (inSearch) stop(); return; }
        popoutClose({ restoreFocus: inSearch }); if (inSearch) stop(); return;
      }
      default: {
        if (inSearch || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
        const now = Date.now(); p.typeBuf = (now - p.typeAt < 500 ? p.typeBuf : '') + e.key.toLowerCase(); p.typeAt = now;
        const nodes = enabledVisible(p); const hit = nodes.find(n => n.textContent.trim().toLowerCase().startsWith(p.typeBuf));
        if (hit) setActiveOption(p, Number(hit.dataset.index), true);
        stop();
      }
    }
  }, true);
  document.addEventListener('pointerdown', e => { const p = pmActive; if (!p) return; if (p.el.contains(e.target) || (p.trigger && p.trigger.contains && p.trigger.contains(e.target)) || (p.anchor && p.anchor.contains && p.anchor.contains(e.target))) return; popoutClose({ restoreFocus: false }); }, true);
  document.addEventListener('scroll', e => { const p = pmActive; if (!p) return; if (p.el.contains(e.target)) return; if (p.kind === 'menu' || !p.anchor || !p.anchor.isConnected) { popoutClose({ restoreFocus: false }); return; } positionPopout(p.el, p.anchor, { align: p.align, width: p.width }); }, true);
  window.addEventListener('resize', () => popoutClose({ restoreFocus: false }));
  document.addEventListener('focusin', e => { const p = pmActive; if (!p) return; if (p.el.contains(e.target) || e.target === p.trigger || (p.anchor && p.anchor.contains && p.anchor.contains(e.target))) return; popoutClose({ restoreFocus: false }); });
})();
/* Every engine path that still emits a native <select> is upgraded on the way out. */
const pm51OriginalRenderControl = renderControl;
renderControl = function (setting, value) { return PM51.upgradeSelects(pm51OriginalRenderControl(setting, value)); };
const pm51OriginalFormField = formField;
formField = function () { return PM51.upgradeSelects(pm51OriginalFormField.apply(this, arguments)); };
const pm51OriginalInlineSelect = inlineSelect;
inlineSelect = function () { return PM51.upgradeSelects(pm51OriginalInlineSelect.apply(this, arguments)); };
const pm51OriginalOpenDialog = openDialog;
openDialog = function (opts) {
  const overlay = pm51OriginalOpenDialog(opts);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (!overlay || !overlay.isConnected) return;
    const active = document.activeElement;
    if (overlay.contains(active) && !(active.closest && active.closest('.dialog-head'))) return;
    const t = overlay.querySelector('[data-autofocus], .dialog-body input:not([type="hidden"]):not(.pm51-dd-native), .dialog-body .pm51-dd-trigger, .dialog-body textarea, .dialog-body button, .dialog-footer .btn.primary, button');
    if (t) { try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } }
  }));
  return overlay;
};

/* Canonical setting rows inside a manager: the engine row renderer (Details button, id="setting-<id>",
   change-setting handlers) wrapped in a kit section. Wave S routes whole placement sections through
   renderSettingsSection; this primitive covers hand-picked ids (e.g. the Back Seat Driver rows), whose
   rows render as inline rows (first-sentence description) and whose section carries the placement
   section id (id="section-<id>" + data-section-id) when the ids belong to one composed section, so the
   page index, scrollToSection and the scroll spy treat it like any placed section.
   overrides[id].control may substitute a presentation control without changing the key. */
const pm51RowOverrides = {};
PM51.settingRows = (ids, { title, help, overrides = {}, cls, id: sectionId } = {}) => {
  const rows = (ids || []).map(id => {
    const f = findSettingGlobal(id); if (!f) return '';
    const override = overrides[id] || {};
    if (override.control || override.label) pm51RowOverrides[id] = override;
    let setting = f.setting;
    if (override.control) setting = Object.assign({}, setting, { control: override.control });
    if (override.label) setting = Object.assign({}, setting, { label: override.label });
    const section = f.section && f.section.inline ? f.section : Object.assign({ inline: true }, f.section || { id: 'manual', label: title || '' });
    return renderSettingRow(setting, section, f.workspace);
  }).filter(Boolean).join('');
  if (!rows) return '';
  const body = `<div class="pm51-settings-inline pm51-setting-rows"><div class="setting-list">${rows}</div></div>`;
  if (!title) return body;
  const placed = PM51.placement ? PM51.placement.sectionOf((ids || [])[0]) : null;
  const sid = sectionId || (placed && placed.composed && (ids || []).every(id => { const p = PM51.placement.sectionOf(id); return p && p.id === placed.id; }) ? placed.id : '');
  return PM51.section({ title, help, body, cls, id: sid ? 'section-' + sid : '', data: sid ? { 'section-id': sid } : null });
};
/* The engine's refreshSettingRow re-renders a row from the inventory alone; rows drawn through
   PM51.settingRows with a presentation override get their override back (managers that own the
   row, like Back Seat Driver, still wrap this again for their stats). */
const pm51OriginalRefreshSettingRow = refreshSettingRow;
refreshSettingRow = function (id) {
  const override = pm51RowOverrides[id];
  const el = override && root.querySelector(`#setting-${cssEscape(id)}`);
  if (!override || !el || !el.closest('.pm51-setting-rows') || state.detailSetting === id || detailInspectorVisible) return pm51OriginalRefreshSettingRow.apply(this, arguments);
  saveState();
  const tpl = document.createElement('template'); tpl.innerHTML = PM51.settingRows([id], { overrides: { [id]: override } });
  const next = tpl.content.querySelector('.setting-row');
  if (next) el.replaceWith(next); else pm51OriginalRefreshSettingRow.apply(this, arguments);
};

/* A programmatic `select.value = …; dispatchEvent(change)` must keep the trigger label in step. */
document.addEventListener('change', e => {
  const sel = e.target; if (!sel || !sel.classList || !sel.classList.contains('pm51-dd-native')) return;
  const wrap = sel.closest('.pm51-dd'), v = wrap && wrap.querySelector('.pm51-dd-value'), o = sel.options[sel.selectedIndex];
  if (v && o && v.textContent !== o.textContent) v.textContent = o.textContent;
}, true);
/* ---------- side panel (drawer) anatomy ------------------------------- */
const PANEL_ICONS = { providers: 'brain', notifications: 'bell', personas: 'user', 'context-memory': 'memory', goals: 'rocket', servers: 'system', backup: 'archive', doctor: 'shield', updates: 'refresh', permissions: 'lock', 'source-manager': 'branch', skills: 'sliders', plugins: 'brackets', mcp: 'network', commands: 'terminal', testing: 'test', web: 'browser', media: 'image', bsd: 'eye', 'settings-transfer': 'upload', 'project-history': 'history', 'browser-scm': 'browser', toolchain: 'code', 'project-settings': 'settings', 'app-input': 'settings' };
const DOMAIN_ICONS = { general: 'settings', ai: 'brain', code: 'code', memory: 'memory', source: 'branch', projects: 'folder', safety: 'shield', system: 'system', planning: 'map' };
const PANEL_SIZES = { narrow: 420, default: 480, wide: 600 };
/* Hero sheet: identity header (icon tile, eyebrow, title, summary, status token, facts, progress
   rail), body cards that reveal in a stagger once the spring is under way, sticky footer. The
   drawer spring / backdrop fade / material close are the engine's and stay untouched. */
openDrawer = function ({ title, subtitle = '', pill = '', status = null, eyebrow = '', icon: ic = '', summary = '', facts = null, steps = null, tone = '', body = '', primaryLabel = '', onPrimary = null, secondaryLabel = '', onSecondary = null, width = 0, size = '', cls = '', closeLabel = 'Close', danger = false, mode = '' }) {
  const returnTarget = captureTransientFocus();
  /* A sheet opened from another sheet (route Set Up -> sign-in, command -> dry run): the outgoing one stays
     still under the incoming spring instead of sliding away beside it. */
  const prev = portalRoot().querySelector('.drawer-wrap.is-open:not([data-closing])');
  if (prev) prev.classList.add('pm51-handoff');
  closeOverlay(false);
  const wrap = document.createElement('div'); wrap.className = 'drawer-wrap pm51-drawer-wrap' + (prev ? ' pm51-handoff-in' : ''); wrap._pmReturnFocus = returnTarget;
  if (prev) window.setTimeout(() => { prev.remove(); wrap.classList.remove('pm51-handoff-in'); }, motionReduced() ? 0 : 270);
  const secondary = onSecondary ? `<button type="button" class="btn" data-callback="${registerAction(() => { const r = onSecondary(wrap); if (r !== false && wrap.isConnected) closeDrawerWrap(wrap); })}">${h(secondaryLabel || 'Continue')}</button>` : '';
  const primary = onPrimary ? `<button type="button" class="btn ${danger ? 'danger' : 'primary'}" data-callback="${registerAction(() => { const r = onPrimary(wrap); if (r !== false && wrap.isConnected) closeDrawerWrap(wrap); })}">${h(primaryLabel || 'Apply')}</button>` : '';
  const iconName = ic || PANEL_ICONS[state.workspace] || DOMAIN_ICONS[state.domain] || 'settings';
  const statusHtml = status ? (typeof status === 'string' ? PM51.status(status) : PM51.status(status.label, status.tone)) : (pill || '');
  const factsHtml = facts && facts.length ? `<dl class="pm51-hero-facts">${facts.slice(0, 4).map(f => `<div><dt>${h(f.label)}</dt><dd>${h(String(f.value == null ? '—' : f.value))}</dd></div>`).join('')}</dl>` : '';
  const railHtml = steps && steps.items && steps.items.length ? `<ol class="pm51-hero-rail" aria-label="Progress">${steps.items.map((label, i) => `<li class="${i < steps.current ? 'is-done' : i === steps.current ? 'is-current' : ''}" ${i === steps.current ? 'aria-current="step"' : ''}><span>${h(label)}</span></li>`).join('')}</ol>` : '';
  const panelMode = mode || (onPrimary ? 'edit' : 'read');
  const px = Number(width) || PANEL_SIZES[size] || 0;
  wrap.innerHTML = `<aside class="drawer pm51-panel${cls ? ' ' + cls : ''}${tone ? ' tone-' + a(tone) : ''}" role="dialog" aria-modal="true" aria-label="${a(title)}" data-mode="${a(panelMode)}" data-size="${a(size || 'default')}" ${px ? `style="width:${px}px"` : ''}>
    <header class="pm51-panel-head pm51-hero${tone ? ' tone-' + a(tone) : ''}">
      <div class="pm51-hero-top"><span class="pm51-hero-icon">${icon(iconName)}</span><div class="pm51-panel-copy">${eyebrow ? `<div class="pm51-hero-eyebrow">${h(eyebrow)}</div>` : ''}<div class="pm51-panel-title">${h(title)}</div>${subtitle ? `<div class="pm51-panel-sub">${h(subtitle)}</div>` : ''}</div><button type="button" class="icon-btn pm51-panel-close" data-action="close-overlay" aria-label="Close">${icon('close')}</button></div>
      ${statusHtml ? `<div class="pm51-hero-status">${statusHtml}</div>` : ''}${summary ? `<p class="pm51-hero-summary">${h(summary)}</p>` : ''}${factsHtml}${railHtml}
    </header>
    <div class="pm51-panel-body">${body}</div>
    <footer class="pm51-panel-foot"><button type="button" class="btn" data-action="close-overlay">${h(closeLabel)}</button><span class="pm51-panel-foot-spacer"></span>${secondary}${primary}</footer>
  </aside>`;
  wrap.querySelectorAll('.pm51-panel-body > *').forEach((n, i) => { n.classList.add('pm51-reveal'); n.style.setProperty('--pm51-i', String(i)); });
  const drawer = wrap.querySelector('.drawer');
  const onEsc = e => { if (e.key !== 'Escape' || !wrap.isConnected || !window.PM7_SETTINGS_TOME.ownsEvent(e.target)) return; e.stopPropagation(); closeDrawerWrap(wrap); };
  const cleanup = () => { document.removeEventListener('keydown', onEsc, true); wrap._pmCleanup = null; }; wrap._pmCleanup = cleanup;
  wrap.addEventListener('mousedown', e => { if (e.target === wrap) closeDrawerWrap(wrap); });
  portalRoot().append(wrap); document.addEventListener('keydown', onEsc, true); void wrap.offsetWidth;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (!wrap.isConnected) return; wrap.classList.add('is-open');
    if (motionReduced()) wrap.classList.add('is-settled');
    else { const onSettled = e => { if (e.target !== drawer || e.propertyName !== 'transform') return; drawer.removeEventListener('transitionend', onSettled); if (wrap.isConnected && wrap.classList.contains('is-open')) wrap.classList.add('is-settled'); }; drawer.addEventListener('transitionend', onSettled); }
    const first = wrap.querySelector('[data-autofocus], .pm51-panel-body input:not(.pm51-dd-native), .pm51-panel-body .pm51-dd-trigger, .pm51-panel-body textarea, .pm51-panel-body button:not(.pm51-panel-close)') || wrap.querySelector('.pm51-panel-body') || wrap;
    if (!first.matches('input, textarea, button, select, [tabindex]')) first.tabIndex = -1;
    try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
  }));
  return wrap;
};
PM51.panel = opts => openDrawer(opts);
PM51.panelSection = (title, body, help, { icon: ic, tone } = {}) => `<section class="pm51-panel-card pm51-panel-section${tone ? ' tone-' + a(tone) : ''}"><div class="pm51-pc-head">${ic ? `<span class="pm51-pc-icon">${icon(ic)}</span>` : ''}<div class="pm51-ps-title">${h(title)}</div></div>${help ? `<p class="pm51-ps-help">${h(help)}</p>` : ''}<div class="pm51-pc-body">${body}</div></section>`;
PM51.menu = (anchor, items, title) => openMenu(anchor, items, title || '');
PM51.confirm = (title, message, label, onConfirm, danger) => confirmDialog(title, message, label, onConfirm, !!danger);
PM51.toast = (title, message, type) => showToast(title, message || '', type || 'success');
/* Honest "check" panel: steps with an outcome that never claims a real connection. */
PM51.check = ({ title, subtitle, steps, outcome, tone }) => openDrawer({
  title, subtitle: subtitle || 'Example data only. No real connection is made in this preview.', icon: 'test',
  status: { label: outcome || 'Checked · example data', tone: tone || 'info' },
  body: PM51.panelSection('What was checked', PM51.steps(steps.map(s => Object.assign({ tone: s.tone || 'ready', status: s.status || 'Checked' }, s)))) + PM51.note('This is a concept preview. Nothing was installed, sent, or changed.', 'info')
});
PM51.unavailable = (label, why) => showToast(label + ' is not available yet', why || 'This part of the concept has no live owner behind it.', 'info', 3200);
PM51.form = (fields, values = {}) => fields.map(f => formField(f.label, f.name, values[f.name] != null ? values[f.name] : (f.value != null ? f.value : ''), f)).join('');

/* ---------- action routing ---------------------------------------------- */
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
  if (m) return pm51PlaceInline(workspace, m.render(workspace, domain));
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
  popoutClose({ restoreFocus: false });
  const body = root.querySelector(`[data-continuous-workspace-body="${cssEscape(wsId)}"]`);
  const domain = getDomain();
  const ws = body && domain.workspaces.find(w => w.id === wsId);
  if (!body || !ws) { saveState(); renderApp({ soft: !state.home }); return; }
  body.innerHTML = renderContinuousWorkspaceBody(ws, domain);
  body.dataset.workspaceMounted = 'true';
  body.querySelectorAll('.manager-section').forEach(sec => sec.classList.add('section-block', 'is-revealed'));
  body.querySelectorAll('.pm51-settings-inline .settings-section').forEach(sec => sec.classList.add('section-block', 'is-revealed', 'pm51-instant'));
  PM51.applyFilters(body);
  try { syncDetailButtonStates(); } catch (e) { /* inspector chrome is cosmetic here */ }
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

/* ---------- wave S: canonical settings render inside their managers ------------ */
/* PM51_PLACEMENT (settings_refresh/placement.json, validated at build time) says where each of the
   892 canonical settings lives. The reference pages the engine generated from window.PM12_REFERENCE
   are deleted (two survive, relabelled), the T49 Assistant page is retired, and every manager
   workspace gains synthetic `sections[]` (engine section objects with inline/tab/advanced/composed
   flags) so the engine's own walkers (findSetting, allSettingsCatalog, buildSearchIndex) keep
   finding every id. The manager renderer output is post-processed by pm51PlaceInline, which
   renders those sections through renderSettingsSection inside .pm51-settings-inline. */
const PLACEMENT = typeof PM51_PLACEMENT === 'object' && PM51_PLACEMENT ? PM51_PLACEMENT : null;
const pm51ById = {};          // id -> { id, setting, workspace, domain, section, tab, advanced, composed, page, hand }
const pm51SectionMeta = {};   // section id -> { id, label, workspace, domain, tab, tabLabel, advanced, composed, page }
const pm51SectionObjects = new Map();
const pm51DefaultTabs = {};
const pm51TabOrder = {};
const pm51Report = { ids: 0, placed: 0, built: 0, unplaced: [], deleted: [], retired: [], sections: 0 };
let pm51InlineDepth = 0;
const pm51FirstSentence = text => { const m = /\S.*?(?:[.!?](?=\s|$))/.exec(String(text || '')); return m ? m[0].trim() : String(text || '').trim(); };
const pm51GlobRe = glob => new RegExp('^' + String(glob).split('*').map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$');
const pm51FindWs = id => { for (const d of D.domains) { const w = d.workspaces.find(x => x.id === id); if (w) return { ws: w, domain: d }; } return null; };

(function pm51Placement() {
  const P = PLACEMENT; const ref = window.PM12_REFERENCE;
  if (!P || !ref || !ref.byCat) return;
  const rows = Object.values(ref.byCat).flatMap(c => c.settings || []);
  const rowById = new Map(rows.map(r => [r.id, r]));
  pm51Report.ids = rows.length;
  const rules = (P.overrides || []).map(r => ({ section: r.section, set: new Set(r.ids || []), re: r.glob ? pm51GlobRe(r.glob) : null }));
  const isReferencePage = w => /-reference$/.test(w.id) && !P.pages[w.id];
  const retired = new Set(P.retire_workspaces || []);
  /* 1. existing setting objects: reference objects (preferred; the T49 page's copies have no
     description), then retired-page copies for anything the reference pages lack, and the
     hand-rendered rows on the surviving hand pages (those win the placement outright). */
  const refObjects = new Map(), retiredObjects = new Map(), handObjects = new Map();
  for (const d of D.domains) for (const w of d.workspaces) {
    if (!Array.isArray(w.sections)) continue;
    const page = P.pages[w.id];
    for (const s of w.sections) for (const st of s.settings || []) {
      if (!rowById.has(st.id)) continue;
      if (page && page.hand) { if (!handObjects.has(st.id)) handObjects.set(st.id, { setting: st, workspace: w.id, domain: d.id, section: s.id }); }
      else if (w.reference || isReferencePage(w)) { if (!refObjects.has(st.id)) refObjects.set(st.id, st); }
      else if (retired.has(w.id) && !retiredObjects.has(st.id)) retiredObjects.set(st.id, st);
    }
  }
  for (const [id, st] of retiredObjects) if (!refObjects.has(id)) refObjects.set(id, st);
  /* 2. resolve every canonical id: hand-rendered -> first matching rule -> subgroup -> page default */
  const resolve = row => { for (const r of rules) if (r.set.has(row.id) || (r.re && r.re.test(row.id))) return r.section; return P.subgroups[row.cat + '.' + row.sub] || P.page_defaults[row.cat] || null; };
  const bySection = new Map();
  for (const row of rows) {
    const hand = handObjects.get(row.id);
    if (hand) { pm51ById[row.id] = { id: row.id, setting: hand.setting, hand: true, page: true, workspace: hand.workspace, domain: hand.domain, section: hand.section, tab: null, advanced: false, composed: false }; continue; }
    const sid = resolve(row);
    if (!sid || !P.sections[sid]) { pm51Report.unplaced.push(row.id); continue; }
    let obj = refObjects.get(row.id);
    if (!obj) { obj = typeof D.referenceRow === 'function' ? D.referenceRow(row) : null; if (!obj) { pm51Report.unplaced.push(row.id); continue; } pm51Report.built++; }
    if (!bySection.has(sid)) bySection.set(sid, []);
    bySection.get(sid).push(obj);
  }
  /* 3. hand sections / rows that move into managers */
  const moved = new Map();
  for (const mv of P.hand_moves || []) {
    const f = pm51FindWs(mv.workspace); if (!f || !Array.isArray(f.ws.sections)) continue;
    const add = list => moved.set(mv.to_section, (moved.get(mv.to_section) || []).concat(list));
    if (mv.section) { const i = f.ws.sections.findIndex(s => s.id === mv.section); if (i >= 0) add(f.ws.sections.splice(i, 1)[0].settings || []); }
    for (const id of mv.ids || []) for (const s of f.ws.sections) { const i = (s.settings || []).findIndex(x => x.id === id); if (i >= 0) { add(s.settings.splice(i, 1)); break; } }
  }
  /* 4. synthetic sections */
  for (const [sid, def] of Object.entries(P.sections)) {
    const settings = (moved.get(sid) || []).concat(bySection.get(sid) || []);
    if (!settings.length) continue;
    const manager = P.managers[def.to], page = P.pages[def.to];
    if (!manager && !page) { settings.forEach(st => pm51Report.unplaced.push(st.id)); continue; }
    const domain = manager ? manager.domain : page.domain;
    if (page && def.hand_section) {
      const f = pm51FindWs(def.to); const host = f && (f.ws.sections || []).find(s => s.id === def.hand_section);
      if (host) { host.settings = (host.settings || []).concat(settings); settings.forEach(st => { if (rowById.has(st.id)) pm51ById[st.id] = { id: st.id, setting: st, hand: false, page: true, workspace: def.to, domain, section: host.id, tab: null, advanced: false, composed: false }; }); continue; }
    }
    const tabLabel = manager && def.tab ? (manager.tabs || {})[def.tab] || def.tab : '';
    const section = { id: sid, label: def.title, eyebrow: manager ? (tabLabel || def.title) : (page.label || ''), description: def.help || '', settings, tab: def.tab || null, tabLabel, inline: !!manager, advanced: !!def.advanced, composed: !!def.composed, order: Number(def.order) || 0, placement: true };
    pm51SectionObjects.set(sid, section);
    pm51SectionMeta[sid] = { id: sid, label: def.title, workspace: def.to, domain, tab: def.tab || null, tabLabel, advanced: !!def.advanced, composed: !!def.composed, page: !manager };
    settings.forEach(st => { if (rowById.has(st.id)) pm51ById[st.id] = { id: st.id, setting: st, hand: false, page: !manager, workspace: def.to, domain, section: sid, tab: def.tab || null, advanced: !!def.advanced, composed: !!def.composed }; });
  }
  pm51Report.sections = pm51SectionObjects.size;
  /* 5. delete reference pages and retired workspaces; rebuild surviving pages; attach manager sections */
  for (const d of D.domains) {
    d.workspaces = d.workspaces.filter(w => { const gone = isReferencePage(w), old = retired.has(w.id); if (gone) pm51Report.deleted.push(w.id); if (old) pm51Report.retired.push(w.id); return !gone && !old; });
    for (const w of d.workspaces) {
      const page = P.pages[w.id], manager = P.managers[w.id];
      const mine = [...pm51SectionObjects.values()].filter(s => P.sections[s.id].to === w.id).sort((x, y) => x.order - y.order);
      if (page) { if (page.label) w.label = page.label; w.sections = (page.hand ? (w.sections || []) : []).concat(mine); }
      else if (manager) { if (mine.length) w.sections = mine; pm51DefaultTabs[w.id] = manager.defaultTab || null; pm51TabOrder[w.id] = Object.keys(manager.tabs || {}); }
    }
    if (!d.workspaces.some(w => w.id === d.defaultWorkspace) && d.workspaces[0]) d.defaultWorkspace = d.workspaces[0].id;
  }
  for (const [id, meta] of Object.entries(P.domain_labels || {})) { const d = D.domains.find(x => x.id === id); if (!d) continue; if (meta.label) d.label = meta.label; if (meta.summary) d.summary = meta.summary; }
  pm51Report.placed = Object.keys(pm51ById).length;
  allSettingsCatalogCache = null; searchIndexDirty = true;
})();

PM51.placement = {
  byId: pm51ById,
  sectionOf: id => { const e = pm51ById[id]; return e && !e.hand ? pm51SectionObjects.get(e.section) || null : null; },
  tabOf: id => { const e = pm51ById[id]; return e ? e.tab : null; },
  sectionMeta: sid => pm51SectionMeta[sid] || null,
  defaultTab: ws => pm51DefaultTabs[ws] || null,
  sectionsFor: (ws, tab, { advanced = null, composed = null } = {}) => [...pm51SectionObjects.values()].filter(s => s.inline && PLACEMENT.sections[s.id].to === ws && (!s.tab || !tab || s.tab === tab) && (advanced === null || !!s.advanced === !!advanced) && (composed === null || !!s.composed === !!composed)).sort((x, y) => x.order - y.order),
  audit: () => {
    const seen = new Map(), duplicates = [], missingTabs = [], perWorkspace = {};
    for (const d of D.domains) for (const w of d.workspaces) for (const s of w.sections || []) for (const st of s.settings || []) {
      if (!pm51ById[st.id]) continue;
      if (seen.has(st.id)) duplicates.push(st.id + ' (' + seen.get(st.id) + ' + ' + w.id + ')'); else seen.set(st.id, w.id);
      perWorkspace[w.id] = (perWorkspace[w.id] || 0) + 1;
      if (s.inline && s.tab && pm51TabOrder[w.id] && !pm51TabOrder[w.id].includes(s.tab)) missingTabs.push(s.id + ' -> ' + w.id + '/' + s.tab);
    }
    const unplaced = pm51Report.unplaced.concat(Object.keys(pm51ById).length ? [] : ['placement did not run']);
    return { ids: pm51Report.ids, placed: seen.size, unplaced, duplicates, missingTabs, sections: pm51Report.sections, built: pm51Report.built, deleted: pm51Report.deleted.slice(), retired: pm51Report.retired.slice(), perWorkspace };
  }
};
pm51SeedCanonicalValues();

/* Inline rows keep the first sentence of the description (narrow v3 strips it for plain pages). */
const pm51NarrowSettingRow = renderSettingRow;
const pm51PlainSettingRow = typeof narrowOriginalSettingRow === 'function' ? narrowOriginalSettingRow : renderSettingRow;
renderSettingRow = function (setting, section, workspace) {
  if (!(pm51InlineDepth > 0 || (section && section.inline))) return pm51NarrowSettingRow(setting, section, workspace);
  const brief = pm51FirstSentence(setting.description);
  return pm51PlainSettingRow(brief === setting.description ? setting : Object.assign({}, setting, { description: brief }), section, workspace);
};
function pm51RenderInline(ws, sections, { advanced = false } = {}) {
  pm51InlineDepth++;
  try { return `<div class="pm51-settings-inline${advanced ? ' is-advanced' : ''}" data-pm51-inline="${a(ws.id)}">${sections.map((s, i) => renderSettingsSection(s, ws, i)).join('')}</div>`; }
  finally { pm51InlineDepth--; }
}
PM51.settingsSections = (wsId, tab, { advanced = false } = {}) => {
  const f = pm51FindWs(wsId); if (!f) return '';
  const secs = PM51.placement.sectionsFor(wsId, tab || null, { advanced: !!advanced, composed: false });
  return secs.length ? pm51RenderInline(f.ws, secs, { advanced: !!advanced }) : '';
};
/* Post-process a manager's markup: inline sections go before the view's direct-child Advanced (else
   before the quiet row, else at the end of .pm51-scroll; listDetail views therefore get full-width
   sections below the split); advanced placements become the first child of that Advanced (an existing
   one anywhere in the view, else one Advanced is created - never a second). Pages marked
   data-pm51-placed="manual" compose their rows themselves; only composed sections whose ids the
   manager did not render fall back into its Advanced so every id still renders exactly once. */
function pm51PlaceInline(workspace, html) {
  const all = (workspace.sections || []).filter(s => s.inline);
  if (!all.length || typeof html !== 'string' || html.indexOf('pm51-mgr') < 0) return html;
  const tpl = document.createElement('template'); tpl.innerHTML = html;
  const page = tpl.content.querySelector('.pm51-mgr'); if (!page) return html;
  const scroll = page.querySelector('.pm51-scroll'); if (!scroll) return html;
  const manual = page.dataset.pm51Placed === 'manual';
  const activeBtn = page.querySelector('.pm51-tabs .manager-tab.active');
  const activeTab = activeBtn ? activeBtn.dataset.tab : (PM51.tab(workspace.id, pm51DefaultTabs[workspace.id]) || null);
  const present = id => !!tpl.content.querySelector(`#setting-${cssEscape(id)}, [data-setting-id="${cssEscape(id)}"]`);
  const forTab = all.filter(s => !s.tab || !activeTab || s.tab === activeTab).filter(s => !s.composed || !s.settings.some(x => present(x.id)));
  const visible = manual ? [] : forTab.filter(s => !s.advanced);
  const advanced = forTab.filter(s => s.advanced || (manual && s.composed));
  const children = () => [...scroll.children];
  if (visible.length) {
    const holder = document.createElement('template'); holder.innerHTML = pm51RenderInline(workspace, visible, { advanced: false });
    const block = holder.content.firstElementChild;
    const anchor = children().find(n => n.matches('details.pm51-advanced')) || children().find(n => n.matches('.pm51-quiet'));
    if (anchor) scroll.insertBefore(block, anchor); else scroll.appendChild(block);
  }
  if (advanced.length) {
    let host = children().find(n => n.matches('details.pm51-advanced')) || page.querySelector('details.pm51-advanced');
    if (!host) {
      const holder = document.createElement('template'); holder.innerHTML = PM51.advanced('');
      host = holder.content.firstElementChild;
      const anchor = children().find(n => n.matches('.pm51-quiet'));
      if (anchor) scroll.insertBefore(host, anchor); else scroll.appendChild(host);
    }
    const body = host.querySelector('.pm51-advanced-body') || host;
    const holder = document.createElement('template'); holder.innerHTML = pm51RenderInline(workspace, advanced, { advanced: true });
    body.insertBefore(holder.content.firstElementChild, body.firstChild);
  }
  if (!manual) page.dataset.pm51Placed = 'auto';
  return tpl.innerHTML;
}

/* Engine walkers: any workspace with sections holds settings now. */
findSettingInDomain = function (id, domain) {
  if (!id) return null;
  for (const workspace of domain.workspaces) { if (!Array.isArray(workspace.sections)) continue; const found = findSetting(id, workspace); if (found) return { ...found, workspace }; }
  return null;
};
findSettingGlobal = function (id) {
  if (!id) return null;
  for (const domain of D.domains) for (const workspace of domain.workspaces) { if (!Array.isArray(workspace.sections)) continue; const found = findSetting(id, workspace); if (found) return { ...found, workspace, domain }; }
  return null;
};
const pm51OriginalContinuousSections = continuousWorkspaceSections;
continuousWorkspaceSections = function (workspace) {
  if (workspace.type === 'settings' || !Array.isArray(workspace.sections)) return pm51OriginalContinuousSections(workspace);
  const order = pm51TabOrder[workspace.id] || [];
  const inline = workspace.sections.filter(s => s.inline && !s.advanced)
    .sort((x, y) => ((x.tab ? order.indexOf(x.tab) : -1) - (y.tab ? order.indexOf(y.tab) : -1)) || (x.order - y.order))
    .map(s => ({ id: s.id, label: s.label, tab: s.tab || null, tabLabel: s.tabLabel || '' }));
  return [{ id: `${workspace.id}:main`, label: workspace.label }].concat(inline);
};
renderPageIndexCard = function (workspaces, activeWsId, activeSection) {
  const groups = workspaces.map(w => {
    const sections = domainSectionMap[w.id] || [];
    const title = `<button type="button" class="page-index-title ${w.id === activeWsId ? 'is-current' : ''}" data-action="jump-workspace" data-workspace="${escAttr(w.id)}">${escapeHtml(w.label)}</button>`;
    const main = `${w.id}:main`;
    if (w.type === 'settings' || !sections.some(s => s.id !== main)) {
      return title + sections.filter(s => !(sections.length === 1 && s.id === main)).map(s => `<button type="button" class="index-link ${s.id === activeSection ? 'is-active' : ''}" data-action="scroll-section" data-section="${escAttr(s.id)}" data-workspace="${escAttr(w.id)}">${escapeHtml(s.label)}</button>`).join('');
    }
    const activeTab = PM51.tab(w.id, pm51DefaultTabs[w.id] || null);
    let html = title, lastTab;
    for (const s of sections) {
      if (s.id === main) continue;
      if (s.tab !== lastTab) { lastTab = s.tab; if (s.tab) html += `<div class="pm51-index-caption">${escapeHtml(s.tabLabel || s.tab)}</div>`; }
      const active = s.id === activeSection && (!s.tab || s.tab === activeTab);
      html += `<button type="button" class="index-link ${active ? 'is-active' : ''}" data-action="scroll-section" data-section="${escAttr(s.id)}" data-workspace="${escAttr(w.id)}"${s.tab ? ` data-tab="${escAttr(s.tab)}"` : ''}>${escapeHtml(s.label)}</button>`;
    }
    return html;
  }).join('');
  return `<aside class="page-index" aria-label="On this page"><div class="page-index-card" data-page-index-links>${groups}</div></aside>`;
};
const pm51OriginalEstimatedHeight = estimatedWorkspaceHeight;
estimatedWorkspaceHeight = function (workspace) {
  const base = pm51OriginalEstimatedHeight(workspace);
  if (workspace.type === 'settings' || !Array.isArray(workspace.sections)) return base;
  const tab = PM51.tab(workspace.id, pm51DefaultTabs[workspace.id] || null);
  const rows = workspace.sections.filter(s => s.inline && !s.advanced && !s.composed && (!s.tab || !tab || s.tab === tab)).reduce((n, s) => n + 64 + (s.settings || []).length * (hostIsNarrow() ? 84 : 47), 0);
  return base + rows;
};
flashSearchHit = function (settingId) {
  const deadline = performance.now() + 1600;
  let lastTop = null, still = 0, centered = false;
  const glow = row => { row.classList.add('is-flash'); window.setTimeout(() => row.classList.remove('is-flash'), 3600); };
  const find = () => root.querySelector(`#setting-${cssEscape(settingId)}`) || root.querySelector(`[data-setting-id="${cssEscape(settingId)}"]`);
  const step = () => {
    const scroller = root.querySelector('#settings-document');
    const row = find();
    const top = scroller ? scroller.scrollTop : 0;
    still = lastTop !== null && Math.abs(top - lastTop) < 1 ? still + 1 : 0;
    lastTop = top;
    if (row && !centered) {
      centered = true;
      const rect = row.getBoundingClientRect(), sc = scroller ? scroller.getBoundingClientRect() : null;
      if (scroller && sc && (rect.top < sc.top || rect.bottom > sc.bottom)) {
        const abs = rect.top - sc.top + scroller.scrollTop;
        scroller.scrollTo({ top: Math.max(0, abs - (scroller.clientHeight - rect.height) / 2), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        still = 0;
      }
    }
    if (row && centered && (still >= 2 || !scroller)) { glow(row); return; }
    if (performance.now() > deadline) { if (row) glow(row); return; }
    window.setTimeout(step, 90);
  };
  window.setTimeout(step, 120);
};
const pm51OriginalAuditWithPlacement = runCompletenessAudit;
runCompletenessAudit = function () { const report = pm51OriginalAuditWithPlacement(); report.placement = PM51.placement.audit(); return report; };
Object.assign(INTROS, {
  'app-input': 'Look and feel, the chat view, help, and what happens at startup.',
  'editor-runtime': 'Files, editing, the terminal, and the project search index.',
  'code-reference': 'Building and running containers, Kubernetes views, and Unraid templates.',
  'planning-reference': 'How the planning interview asks questions and how deep plans go.',
  advanced: 'Diagnostics, runtime options, and deliberate recovery actions.'
});

/* Navigation: a section or setting on another tab switches the tab before the mount; scrolling to a
   section on a tab that is not rendered switches and re-renders synchronously first. */
const pm51OpenAdvancedFor = node => { const d = node && node.closest('details.pm51-advanced'); if (d && !d.open) d.open = true; };
const pm51OriginalNavigate = navigate;
navigate = function (domainId, workspaceId, options = {}) {
  const meta = options && options.section ? pm51SectionMeta[options.section] : null;
  if (meta && meta.tab && meta.workspace === workspaceId) PM51.setTab(meta.workspace, meta.tab);
  else if (options && options.detailSetting && pm51ById[options.detailSetting]) { const e = pm51ById[options.detailSetting]; if (e.tab && e.workspace === workspaceId) PM51.setTab(e.workspace, e.tab); }
  return pm51OriginalNavigate(domainId, workspaceId, options);
};
const pm51OriginalScrollToSection = scrollToSection;
scrollToSection = function (sectionId, smooth = true) {
  const meta = pm51SectionMeta[sectionId];
  if (meta && !meta.page) {
    const body = mountContinuousWorkspace(meta.workspace);
    if (meta.tab && PM51.tab(meta.workspace, pm51DefaultTabs[meta.workspace] || null) !== meta.tab) PM51.setTab(meta.workspace, meta.tab);
    if (body && !body.querySelector(`#section-${cssEscape(sectionId)}`)) PM51.refresh(meta.workspace, { swap: false });
    pm51OpenAdvancedFor(root.querySelector(`#section-${cssEscape(sectionId)}`));
  }
  return pm51OriginalScrollToSection(sectionId, smooth);
};
PM51.revealSetting = (id, { detail = false } = {}) => {
  const e = pm51ById[id];
  const f = !e ? findSettingGlobal(id) : null;
  if (!e && !f) return false;
  const domain = e ? e.domain : f.domain.id, workspace = e ? e.workspace : f.workspace.id, section = e ? e.section : f.section.id;
  if (e && e.tab) PM51.setTab(workspace, e.tab);
  navigate(domain, workspace, Object.assign({ section }, detail ? { detailSetting: id } : {}));
  let tries = 0;
  const reveal = () => { const row = root.querySelector(`#setting-${cssEscape(id)}`) || root.querySelector(`[data-setting-id="${cssEscape(id)}"]`); if (row) { pm51OpenAdvancedFor(row); return true; } return ++tries > 24; };
  if (!reveal()) { const timer = window.setInterval(() => { if (reveal()) window.clearInterval(timer); }, 60); }
  flashSearchHit(id);
  return true;
};
const pm51OriginalApplySearchSelection = applySearchSelection;
applySearchSelection = function (p) {
  if (p && p.kind === 'setting' && p.id && PM51.revealSetting(p.id)) return;
  return pm51OriginalApplySearchSelection(p);
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
/* Sticky rosters need the scroller height as a CSS variable (the settings host is only an
   inline-size container, so cqh is unavailable). */
let pm51RosterFitObserver = null, pm51RosterFitTarget = null;
function installRosterFit() {
  const scroller = root.querySelector('#settings-document'); if (!scroller) return;
  const apply = () => root.style.setProperty('--pm51-doc-h', scroller.clientHeight + 'px');
  apply();
  if (pm51RosterFitTarget === scroller || typeof ResizeObserver !== 'function') return;
  if (pm51RosterFitObserver) pm51RosterFitObserver.disconnect();
  pm51RosterFitObserver = new ResizeObserver(apply); pm51RosterFitObserver.observe(scroller); pm51RosterFitTarget = scroller;
}
afterRender = function () {
  popoutClose({ restoreFocus: false });
  try { installRosterFit(); } catch (e) { /* cosmetic */ }
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
  const facet = (values, current, label, filter, aria, format = humanize) => PM51.dropdown(current || 'all', [{ value: 'all', label }].concat([...new Set(values)].sort().map(v => ({ value: v, label: format(v) }))), { action: 'all-settings-filter', data: { filter }, label: aria, width: 170 });
  const categories = facet(catalog.map(x => x.category), allSettingsView.category, 'All categories', 'category', 'Category', v => titles.get(v) || humanize(v));
  const show = PM51.dropdown(allSettingsView.exposure || 'all', [['all', 'Show: All'], ['simple', 'Show: Common'], ['advanced', 'Show: Advanced']], { action: 'all-settings-filter', data: { filter: 'exposure' }, label: 'Show', width: 150 });
  const more = allSettingsView.moreFilters ? `<div class="pm51-facets-more">
      ${facet(catalog.map(x => x.control), allSettingsView.control, 'All control types', 'control', 'Control type')}
      ${facet(catalog.flatMap(x => x.applicability), allSettingsView.applicability, 'All applicability', 'applicability', 'Applicability')}
      ${facet(catalog.map(x => x.ownerStatus), allSettingsView.ownerStatus, 'All owner statuses', 'ownerStatus', 'Owner status')}
      ${facet(catalog.map(x => x.resultType), allSettingsView.resultType, 'All result types', 'resultType', 'Result type')}
      <label class="pm51-facet-check"><input type="checkbox" data-action="pm51-all-show-ids" ${allSettingsView.showIds ? 'checked' : ''}/> Show setting IDs</label>
    </div>` : '';
  return `<section class="settings-section all-settings-catalog pm51-all${allSettingsView.showIds ? ' pm51-show-ids' : ''}" id="section-all-settings" data-section-id="all-settings">
    <div class="pm51-facets" data-pm51-facets>
      <div class="pm51-facets-main">
        <label class="pm51-facet-search">${icon('search')}<input class="text-control all-settings-query" data-action="all-settings-query" value="${a(allSettingsView.query)}" placeholder="Search settings" aria-label="Search settings"/></label>
        ${categories}
        ${show}
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
