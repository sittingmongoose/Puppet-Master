/* O55 · settings that a manager draws itself. Many inventory rows are not preferences that belong in a list of rows:
   they are the manager's own search box, sort menu, "show" filter, a per-item switch, a toolbar button, or a field of
   one account. A manager draws those where they belong, bound to the same setting id, so search, Details, reset and
   All Project Settings keep working, and the row is not drawn a second time underneath (its placement section is
   `composed`, and the kit's placement pass skips a composed section whose ids the manager already drew).
   - PM51.bound.* draw bound controls; each carries data-setting-id so search can point at it;
   - PM51.watch(id, fn) lets a manager react when a bound value changes (re-sort, re-filter, redraw);
   - rows.json `when` shows a row only when another setting makes it matter, and hides it (by height) otherwise. */

const o55Watchers = {};
PM51.watch = (id, fn) => { (o55Watchers[id] = o55Watchers[id] || []).push(fn); };
function o55Notify(id, value) {
  (o55Watchers[id] || []).forEach(fn => { try { fn(value); } catch (e) { /* a watcher never blocks a save */ } });
  o55SyncDependents(id);
}
PM51.value = id => { const f = findSettingGlobal(id); return f ? settingValue(f.setting) : undefined; };
PM51.setting = id => { const f = findSettingGlobal(id); return f ? f.setting : null; };
PM51.bound = {
  /* a compact dropdown, e.g. a list's Sort or Show menu */
  select(id, { label, prefix, width, choices } = {}) {
    const s = PM51.setting(id); if (!s) return '';
    const v = settingValue(s);
    const opts = (choices || o55Options(s)).slice(); if (!opts.map(String).includes(String(v))) opts.unshift(v);
    return `<span class="o55-bound o55-bound-select" data-setting-id="${a(id)}">${prefix ? `<span class="o55-bound-prefix">${h(prefix)}</span>` : ''}${PM51.dropdown(v, opts.map(o => ({ value: o, label: PM51.valueLabel(id, o), meta: PM51.valueHint(id, o) })), { action: 'change-setting', data: { setting: id }, label: label || PM51.rowLabel(s), width })}</span>`;
  },
  toggle(id, { label } = {}) {
    const s = PM51.setting(id); if (!s) return '';
    const on = !!settingValue(s) && settingValue(s) !== 'off';
    return `<span class="o55-bound" data-setting-id="${a(id)}">${`<button type="button" class="toggle pm51-toggle ${on ? 'on' : ''}" role="switch" aria-checked="${on}" data-action="toggle-setting" data-setting="${a(id)}" aria-label="${a(label || PM51.rowLabel(s))}"></button>`}</span>`;
  },
  search(id, { placeholder, label } = {}) {
    const s = PM51.setting(id); if (!s) return '';
    return `<label class="o55-bound o55-bound-search" data-setting-id="${a(id)}">${icon('search')}<input type="search" value="${a(settingValue(s) || '')}" placeholder="${a(placeholder || 'Search')}" aria-label="${a(label || PM51.rowLabel(s))}" data-action="input-setting" data-setting="${a(id)}"/></label>`;
  },
  action(id, { label, icon: ic, small = true, primary, ghost } = {}) {
    const s = PM51.setting(id); if (!s) return '';
    return `<button type="button" class="btn${small ? ' small' : ''}${primary ? ' primary' : ''}${ghost ? ' ghost' : ''} pm51-btn o55-bound" data-setting-id="${a(id)}" data-action="run-setting-action" data-setting="${a(id)}">${ic ? icon(ic) : ''}<span>${h(label || (PM51.rowMeta(id).actionLabel) || PM51.rowLabel(s))}</span></button>`;
  },
  /* an ordinary row, drawn inside a manager card (e.g. inside an account or a skill) */
  row(id, { label, help } = {}) {
    const f = findSettingGlobal(id); if (!f) return '';
    const s = label || help ? Object.assign({}, f.setting, label ? { label } : {}, help ? { description: help } : {}) : f.setting;
    return renderSettingRow(s, f.section, f.workspace);
  },
  rows(ids, opts) { return `<div class="setting-list o55-bound-rows">${(ids || []).map(id => PM51.bound.row(id, opts)).join('')}</div>`; }
};
/* Mark an element as the home of a setting drawn some other way (a per-item switch list, a whole list). */
PM51.home = (id, html, tag = 'div', cls = '') => `<${tag} class="o55-home${cls ? ' ' + cls : ''}" data-setting-id="${a(id)}">${html}</${tag}>`;

/* input-setting on a bound search updates as you type; watchers get the value (debounced) */
const o55BoundInput = handleInputAction;
let o55InputTimer = 0;
handleInputAction = function (action, el) {
  const r = o55BoundInput.apply(this, arguments);
  if (action === 'input-setting' && el && el.dataset && el.dataset.setting) {
    const id = el.dataset.setting; clearTimeout(o55InputTimer);
    o55InputTimer = window.setTimeout(() => o55Notify(id, el.value), 120);
  }
  return r;
};

/* ---------- dependents ("when") -------------------------------------------------------------------------------- */
const o55DepsOf = {}; /* parent id -> [child id] */
for (const [id, meta] of Object.entries(O55R)) if (meta && meta.when && meta.when.id) (o55DepsOf[meta.when.id] = o55DepsOf[meta.when.id] || []).push(id);
PM51.relevant = id => {
  const w = (O55R[id] || {}).when; if (!w || !w.id) return true;
  const v = PM51.value(w.id);
  if (Array.isArray(w.in)) return w.in.map(String).includes(String(v));
  if (w.not !== undefined) return String(v) !== String(w.not);
  if (w.truthy) return !!v && v !== 'off' && v !== 'none';
  return !!v;
};
function o55SyncDependents(parent) {
  (o55DepsOf[parent] || []).forEach(child => {
    root.querySelectorAll(`[id="setting-${cssEscape(child)}"]`).forEach(row => {
      const on = PM51.relevant(child), hidden = row.classList.contains('o55-dep-off');
      if (on === !hidden) return;
      if (o55Still()) { row.classList.toggle('o55-dep-off', !on); return; }
      if (on) {
        row.classList.remove('o55-dep-off');
        const hgt = row.scrollHeight;
        row.animate([{ height: '0px', opacity: 0, paddingTop: '0px', paddingBottom: '0px' }, { height: hgt + 'px', opacity: 1 }], { duration: 260, easing: o55Ease() });
      } else {
        const hgt = row.offsetHeight;
        const an = row.animate([{ height: hgt + 'px', opacity: 1 }, { height: '0px', opacity: 0, paddingTop: '0px', paddingBottom: '0px' }], { duration: 220, easing: o55Ease() });
        an.finished.then(() => row.classList.add('o55-dep-off'), () => row.classList.add('o55-dep-off'));
      }
    });
  });
}
const o55BoundRow = renderSettingRow;
renderSettingRow = function (setting, section, workspace) {
  const html = o55BoundRow.apply(this, arguments);
  if (!setting || !(O55R[setting.id] || {}).when || PM51.relevant(setting.id)) return html;
  return html.replace('class="setting-row o55-row', 'class="setting-row o55-row o55-dep-off');
};
/* every commit path in 10-values/30-inspector ends in o55Changed; notify watchers and dependents from there */
const o55BoundChanged = o55Changed;
o55Changed = function (setting, raw) { const r = o55BoundChanged.apply(this, arguments); o55Notify(setting.id, raw); return r; };
