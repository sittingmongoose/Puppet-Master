/* O55 · settings that belong to one thing. "Account nickname", "Jobs this account may do" or "Google Cloud project"
   describe one account; "Region" or "Preferred sign-in" describe one AI service. The inventory keeps a single value
   for each, which reads as a global switch that changes every account at once. A manager draws such a row inside the
   thing it describes and keeps the value there (thing.props[id]); rows.d marks it with `per`, and its Details panel
   says it is set per account (or per service) and lists what each one has instead of offering a global choice.
   - PM51.scoped.row(id, value, { scope, data, label, help }) draws the row; a change calls the setter registered
     for `scope` with (id, value, el), so the manager decides where the value lives;
   - PM51.perValues(id, fn) tells the Details panel what each thing has ([{ name, value }]);
   - PM51.owner(workspace, fn) runs before search or Details lands on one of the manager's rows, so the manager can
     select the thing that draws it (a service, a server); closed account rows around the target open by themselves. */

const o55Setters = {}, o55PerFns = {}, o55Owners = {};
PM51.scopedSetter = (scope, fn) => { o55Setters[scope] = fn; };
PM51.perValues = (id, fn) => { o55PerFns[id] = fn; };
PM51.owner = (ws, fn) => { o55Owners[ws] = fn; };
/* A thing without its own value shows the inventory default, never the single project-wide value. */
PM51.scopedValue = (thing, id) => {
  const props = thing && thing.props;
  if (props && Object.prototype.hasOwnProperty.call(props, id)) return props[id];
  const s = PM51.setting(id); return s ? clone(s.value) : undefined;
};
const o55Same = (x, y) => JSON.stringify(x == null ? null : x) === JSON.stringify(y == null ? null : y);
const o55ScopedData = (id, scope, data) => Object.assign({}, data || {}, { scope, setting: id });

PM51.scoped = {
  control(id, value, { scope, data, label, choices } = {}) {
    const s = PM51.setting(id); if (!s) return '';
    const row = O55R[id] || {};
    const kind = row.control || s.control;
    const d = o55ScopedData(id, scope, data);
    const name = label || PM51.rowLabel(s);
    const opts = choices || o55Options(s);
    if (kind === 'toggle') {
      const on = !!value && value !== 'off';
      return PM51.toggle(on, { action: 'pm51-scoped-toggle', data: d, label: name });
    }
    if (kind === 'multiselect' && opts.length) {
      const cur = Array.isArray(value) ? value.map(String) : [];
      return `<div class="chip-select o55-chips" role="group" aria-label="${a(name)}">${opts.map(o => { const on = cur.includes(String(o)); return `<button type="button" class="${on ? 'active' : ''}" aria-pressed="${on}" data-action="pm51-scoped-chip" ${dataAttrs(d)} data-value="${a(o)}">${on ? icon('check') : ''}<span>${h(PM51.valueLabel(id, o))}</span></button>`; }).join('')}</div>`;
    }
    if (opts.length && ['select', 'segmented', 'radio'].includes(kind)) {
      const list = opts.slice(); const cur = value == null ? '' : String(value);
      if (!list.map(String).includes(cur)) list.unshift(cur);
      return PM51.dropdown(cur, list.map(o => ({ value: o, label: PM51.valueLabel(id, o), meta: PM51.valueHint(id, o) })), { action: 'pm51-scoped-select', data: d, label: name });
    }
    if (kind === 'number') {
      const n = Number.parseFloat(String(value == null ? '' : value)), unit = o55Unit(s);
      const bounds = `${Number.isFinite(row.min) ? ` min="${row.min}"` : ''}${Number.isFinite(row.max) ? ` max="${row.max}"` : ''}`;
      return `<label class="o55-num"><input class="text-control" type="number" inputmode="decimal" step="${a(row.step || 'any')}"${bounds} value="${a(Number.isFinite(n) ? n : '')}" placeholder="${a(row.placeholder || 'Automatic')}" data-action="pm51-scoped-input" ${dataAttrs(d)} aria-label="${a(name)}">${unit ? `<span class="o55-unit">${h(unit)}</span>` : ''}</label>`;
    }
    /* a stored default that is really words ("provider defaults") reads as the placeholder, not as typed text */
    const shown = typeof value === 'string' && value === s.value && row.placeholder && /default/i.test(value) ? '' : value;
    return `<input class="text-control" value="${a(shown == null ? '' : shown)}" placeholder="${a(row.placeholder || '')}" data-action="pm51-scoped-input" ${dataAttrs(d)} aria-label="${a(name)}"/>`;
  },
  row(id, value, opts = {}) {
    const s = PM51.setting(id); if (!s) return '';
    const row = O55R[id] || {};
    const label = opts.label || PM51.rowLabel(s), help = opts.help != null ? opts.help : PM51.rowHelp(s);
    const changed = !opts.noChanged && !o55Same(value, s.value) && !(value === '' && s.value == null);
    const control = opts.control || PM51.scoped.control(id, value, opts);
    const found = findSettingGlobal(id);
    const kind = row.control || s.control || '';
    const wide = row.layout === 'wide' || (kind === 'multiselect' && (opts.choices || o55Options(s)).length > 4);
    return `<div class="setting-row o55-row o55-scoped${changed ? ' is-changed' : ''}${wide ? ' is-wide' : ''}" data-setting-id="${a(id)}" data-o55-kind="${a(kind)}"${opts.noChanged ? ' data-no-changed="1"' : ''}>
      <div class="setting-copy"><div class="setting-label">${h(label)}${changed ? '<span class="o55-changed" title="Changed from the default"><i></i><span>Changed</span></span>' : ''}</div>${help ? `<div class="setting-description">${h(help)}</div>` : ''}</div>
      <div class="setting-control">${control}</div>
      <button type="button" class="icon-btn details-btn o55-about" data-action="setting-details" data-setting="${a(id)}" data-workspace="${a(found ? found.workspace.id : '')}" data-section="${a(found && found.section ? found.section.id : '')}" aria-label="${a('About ' + label)}" data-pm-hover-label="${a('About ' + label)}" data-pm-hover-detail="What it does and your choices.">${icon('help')}</button>
    </div>`;
  },
  rows(list) { return `<div class="setting-list o55-bound-rows">${list.filter(Boolean).join('')}</div>`; },
  /* a compact labelled field for secondary choices, laid out two to a line by .o55-fields */
  field(id, value, opts = {}) {
    const s = PM51.setting(id); if (!s) return '';
    const label = opts.label || PM51.rowLabel(s);
    const changed = !o55Same(value, s.value) && !(value === '' && s.value == null);
    return `<div class="o55-field${changed ? ' is-changed' : ''}" data-setting-id="${a(id)}"><div class="o55-field-head"><span class="o55-field-label">${h(label)}</span><button type="button" class="icon-btn details-btn o55-about" data-action="setting-details" data-setting="${a(id)}" aria-label="${a('About ' + label)}" data-pm-hover-label="${a('About ' + label)}" data-pm-hover-detail="${a(PM51.rowHelp(s))}">${icon('help')}</button></div>${opts.control || PM51.scoped.control(id, value, opts)}</div>`;
  },
  fields(list) { const items = list.filter(Boolean); return items.length ? `<div class="o55-fields">${items.join('')}</div>` : ''; }
};

function o55ScopedSet(el, value, { quiet } = {}) {
  const scope = ds(el, 'scope'), id = ds(el, 'setting'), fn = o55Setters[scope]; if (!fn) return;
  const who = fn(id, value, el);
  const s = PM51.setting(id);
  const row = el.closest('.o55-scoped, .o55-field');
  if (row && s && !row.dataset.noChanged) row.classList.toggle('is-changed', !o55Same(value, s.value));
  if (!quiet && s) showToast('Saved', `${PM51.rowLabel(s)}${who ? ' for ' + who : ''}: ${PM51.valueText(s, value)}.`, 'success', 2200);
}
PM51.onChange('scoped-select', el => o55ScopedSet(el, el.value));
PM51.on('scoped-toggle', el => {
  const on = !el.classList.contains('on');
  el.classList.toggle('on', on); el.setAttribute('aria-checked', on ? 'true' : 'false');
  o55ScopedSet(el, on);
});
PM51.on('scoped-chip', el => {
  el.classList.toggle('active'); const on = el.classList.contains('active');
  el.setAttribute('aria-pressed', on ? 'true' : 'false');
  const mark = el.querySelector('svg'); if (on && !mark) el.insertAdjacentHTML('afterbegin', icon('check')); if (!on && mark) mark.remove();
  const group = el.closest('.o55-chips');
  o55ScopedSet(el, [...group.querySelectorAll('button.active')].map(b => b.dataset.value));
});
let o55ScopedTimer = 0;
PM51.onInput('scoped-input', el => {
  clearTimeout(o55ScopedTimer);
  o55ScopedTimer = window.setTimeout(() => { const v = el.type === 'number' && el.value !== '' ? Number(el.value) : el.value; o55ScopedSet(el, v, { quiet: true }); }, 380);
});

/* ---------- Details: "each account has its own" --------------------------------------------------------------- */
const O55_PER = { account: 'Each account has its own', service: 'Each AI service has its own', server: 'Each server has its own' };
const o55ScopedInspector = renderDetailInspectorBody;
renderDetailInspectorBody = function (setting) {
  const html = o55ScopedInspector.apply(this, arguments);
  const row = setting ? O55R[setting.id] || {} : {};
  if (!row.per) return html;
  const tpl = document.createElement('template'); tpl.innerHTML = html;
  const now = tpl.content.querySelector('.o55-insp-now');
  if (now) {
    let list = [];
    try { list = (o55PerFns[setting.id] ? o55PerFns[setting.id]() : []) || []; } catch (e) { list = []; }
    now.classList.remove('is-changed'); now.classList.add('is-per');
    now.innerHTML = `<div class="o55-insp-now-label">${h(O55_PER[row.per] || 'Set one at a time')}</div>`
      + (list.length ? `<ul class="o55-insp-per">${list.map(x => `<li><span>${h(x.name)}</span><span>${h(PM51.valueText(setting, x.value))}</span></li>`).join('')}</ul>` : `<div class="o55-insp-now-value">${h(row.perEmpty || 'Nothing uses it yet')}</div>`)
      + `<div class="o55-insp-now-foot"><span>${h(row.perWhere || 'Change it where it is shown.')}</span><button type="button" class="o55-textbtn" data-action="o55-reveal" data-setting="${a(setting.id)}">${icon('arrowRight')}<span>Show me</span></button></div>`;
  }
  /* the choices describe what one thing can be set to; they are not a global switch here */
  tpl.content.querySelectorAll('.o55-insp-choice').forEach(b => { b.removeAttribute('data-action'); b.setAttribute('aria-disabled', 'true'); b.classList.add('is-static'); b.classList.remove('is-on'); b.setAttribute('aria-checked', 'false'); const mark = b.querySelector('.o55-insp-mark'); if (mark) mark.innerHTML = ''; });
  const head = tpl.content.querySelector('.o55-insp-choices'); if (head && head.previousElementSibling) head.previousElementSibling.textContent = 'What it can be';
  return tpl.innerHTML;
};

/* ---------- landing on a row that lives inside one thing ------------------------------------------------------ */
function o55OpenAround(selector) {
  let tries = 0;
  const go = () => {
    const el = root.querySelector(selector); if (!el) return ++tries > 30;
    let item = el.closest('.pm51-acc-item:not(.is-open)');
    while (item) { const t = item.querySelector(':scope > .pm51-acc-head .pm51-acc-toggle'); if (t) t.click(); else break; item = item.parentElement && item.parentElement.closest('.pm51-acc-item:not(.is-open)'); }
    el.closest('details:not([open])') && (el.closest('details:not([open])').open = true);
    return true;
  };
  if (!go()) { const t = window.setInterval(() => { if (go()) window.clearInterval(t); }, 70); }
}
const o55RevealKit = PM51.revealSetting;
PM51.revealSetting = (id, opts) => {
  const e = PM51.placement.byId[id];
  if (e && o55Owners[e.workspace]) { try { o55Owners[e.workspace](id); } catch (err) { /* selection is a convenience */ } }
  const r = o55RevealKit(id, opts);
  if (r) o55OpenAround(`[data-setting-id="${cssEscape(id)}"]`);
  return r;
};
const o55GoOwnerKit = o55GoOwner;
o55GoOwner = function (id) {
  const route = (O55R[id] || {}).route;
  const r = o55GoOwnerKit(id);
  if (r && route && route.target) o55OpenAround(route.target);
  return r;
};
PM51.goOwner = o55GoOwner;
const o55ScopedDispatch = dispatchAction;
dispatchAction = function (action, el) {
  if (action === 'o55-reveal') { const id = el.dataset.setting; closeOverlay(false); window.setTimeout(() => PM51.revealSetting(id), 60); return; }
  return o55ScopedDispatch.apply(this, arguments);
};

/* ---------- grouped lists ------------------------------------------------------------------------------------- */
/* A list/detail roster whose items carry `group` gets a small heading before each group, and the roster filter hides
   a heading whose items are all filtered out. */
const o55ListDetailKit = PM51.listDetail;
PM51.listDetail = opts => {
  const html = o55ListDetailKit(opts);
  const groups = (opts.groups || []);
  if (!groups.length || !(opts.items || []).some(it => it.group)) return html;
  const tpl = document.createElement('template'); tpl.innerHTML = html;
  const list = tpl.content.querySelector('.roster-list'); if (!list) return html;
  list.classList.add('o55-grouped');
  const rows = [...list.querySelectorAll(':scope > .resource-row')];
  let last = null;
  rows.forEach((row, i) => {
    const g = (opts.items[i] || {}).group; if (!g) return;
    row.dataset.group = g;
    if (g === last) return; last = g;
    const meta = groups.find(x => x.id === g) || { label: g };
    const head = document.createElement('div'); head.className = 'o55-roster-group'; head.dataset.group = g; head.setAttribute('role', 'presentation');
    head.innerHTML = `<span>${h(meta.label)}</span>${meta.help ? `<small>${h(meta.help)}</small>` : ''}`;
    list.insertBefore(head, row);
  });
  return tpl.innerHTML;
};
PM51.onInput('filter', el => {
  PM51.s().filters = PM51.s().filters || {}; PM51.s().filters[ds(el, 'manager')] = el.value; applyRosterFilter(el);
  o55GroupHeads(el);
});
function o55GroupHeads(el) {
  const list = el.closest('.resource-roster')?.querySelector('.roster-list.o55-grouped'); if (!list) return;
  list.querySelectorAll('.o55-roster-group').forEach(head => { head.hidden = ![...list.querySelectorAll(`.resource-row[data-group="${cssEscape(head.dataset.group)}"]`)].some(r => !r.hidden); });
}
const o55ApplyFiltersKit = PM51.applyFilters;
PM51.applyFilters = scope => { o55ApplyFiltersKit(scope); (scope || root).querySelectorAll('input[data-action="pm51-filter"]').forEach(o55GroupHeads); };
