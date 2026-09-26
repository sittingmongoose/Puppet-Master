/* O55 · values and controls. Every stored value reads as plain words, and every row's control does what it says.
   The stored value never changes (commitSettingValue still receives the raw option), only what a person reads:
   - option labels and hints come from O55S.labels (global words, per-setting meanings, one-line hints);
   - a select whose current value is not one of its options gets that value as a visible first choice instead of
     silently showing the first option as if it were chosen;
   - number fields show their unit or nothing (the engine printed the word "number"); a number that follows a default
     until someone sets it reads "Automatic" with a quiet "Set a number";
   - lists and key/value settings open a real editor (rows you add, remove and reorder) instead of a JSON box;
   - action rows run what they name (O55S.rows[id].route / .open), never the engine's generic three-step preview;
   - secret rows open a key panel that never shows the key, or send you to the manager that owns the secret.
   Per-row wording and control choices live in O55S.rows (see src/settings/o55/rows.json). */

Object.assign(iconPaths, {
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  cloud: '<path d="M7 18h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.1 9.2 4.5 4.5 0 0 0 7 18Z"/>',
  server: '<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/><path d="M8 7.5h.01M8 16.5h.01"/>',
  plug: '<path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0V8ZM12 16v5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z"/>',
  minus: '<path d="M5 12h14"/>',
  filter: '<path d="M4 5h16l-6 7.5V19l-4-2v-4.5L4 5Z"/>',
  sort: '<path d="M7 4v16M4 17l3 3 3-3M17 20V4M14 7l3-3 3 3"/>',
  gauge: '<path d="M4.5 16a8 8 0 1 1 15 0"/><path d="M12 13l4-4"/><circle cx="12" cy="13" r="1.2"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
  wand: '<path d="m4 20 11-11M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2ZM19 10l.6 1.4L21 12l-1.4.6L19 14l-.6-1.4L17 12l1.4-.6L19 10Z"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z"/>',
  bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.8M12 17h.01"/>'
});

const O55L = Object.assign({ global: {}, bySetting: {}, hints: {} }, (typeof O55S === 'object' && O55S && O55S.labels) || {});
const O55R = (typeof O55S === 'object' && O55S && O55S.rows && O55S.rows.rows) || {};
PM51.rowMeta = id => O55R[id] || {};
const o55Has = (obj, k) => !!obj && Object.prototype.hasOwnProperty.call(obj, k);
/* An identifier-looking token ("os_keychain", "round-robin", "meta_only") becomes words; anything already written for
   people ("Basic Dark", "System Default", "5h and 7d") is left alone. */
function o55Humanize(raw) {
  const s = String(raw == null ? '' : raw);
  if (/^[a-z0-9]+(?:[_-][a-z0-9]+)+$/.test(s) || /^[a-z]{3,}$/.test(s)) { const t = s.replace(/[_-]+/g, ' '); return t.charAt(0).toUpperCase() + t.slice(1); }
  return s;
}
PM51.valueLabel = (id, raw) => {
  const k = String(raw == null ? '' : raw);
  const row = O55R[id];
  if (row && o55Has(row.options, k)) return row.options[k];
  const per = O55L.bySetting[id];
  if (o55Has(per, k)) return per[k];
  if (o55Has(O55L.global, k)) return O55L.global[k];
  if (o55Has(o55MoreLabels, k)) return o55MoreLabels[k];
  if (k === '') return 'Not set';
  return o55Humanize(k);
};
PM51.valueHint = (id, raw) => { const row = O55R[id], k = String(raw); return (row && row.hints && row.hints[k]) || ((O55L.hints[id] || {})[k]) || o55MoreHints[id + '|' + k] || ''; };
const o55Unit = setting => { const u = (O55R[setting.id] || {}).unit || setting.unit || ''; return u === 'ms' ? 'ms' : u; };
/* The value as a sentence fragment: On, Off, "Ask me first", "3 items: Claude, Codex, Copilot", "500 MB". */
PM51.valueText = (setting, v) => {
  if (v === true) return 'On';
  if (v === false) return 'Off';
  if (v == null || v === '') return (O55R[setting.id] || {}).empty || 'Not set';
  if (Array.isArray(v)) return v.length ? v.map(x => (x && typeof x === 'object') ? o55ObjectLine(x) : PM51.valueLabel(setting.id, x)).join(', ') : ((O55R[setting.id] || {}).emptyList || 'None');
  if (typeof v === 'object') { const e = Object.entries(v); return e.length ? e.slice(0, 4).map(([k, x]) => `${o55Humanize(k)}: ${(x && typeof x === 'object') ? '…' : PM51.valueLabel(setting.id, x)}`).join(', ') + (e.length > 4 ? ` and ${e.length - 4} more` : '') : 'None'; }
  const unit = o55Unit(setting);
  if (typeof v === 'number' || /^-?\d+(\.\d+)?$/.test(String(v))) return unit ? `${v} ${unit}` : String(v);
  return PM51.valueLabel(setting.id, v);
};
function o55ObjectLine(o) { const name = o.name || o.label || o.title || o.id; if (name) return String(name); const e = Object.entries(o); return e.slice(0, 2).map(([k, x]) => `${o55Humanize(k)} ${typeof x === 'object' ? '…' : x}`).join(', '); }

/* ---------- controls ------------------------------------------------------------------------------------------ */
/* Choices that come from what is connected (the models on your signed-in accounts, say) are added by the manager
   that knows them: PM51.moreChoices(id, () => [{ value, label, meta }]). The inventory's own choices stay first. */
const o55More = {}, o55MoreLabels = {}, o55MoreHints = {};
PM51.moreChoices = (id, fn) => { o55More[id] = fn; };
function o55Extra(id) {
  if (!o55More[id]) return [];
  let list = []; try { list = o55More[id]() || []; } catch (e) { list = []; }
  list.forEach(x => { o55MoreLabels[x.value] = x.label; if (x.meta) o55MoreHints[id + '|' + x.value] = x.meta; });
  return list.map(x => x.value);
}
const o55Options = setting => {
  const row = O55R[setting.id] || {};
  const base = (row.choices || setting.options || []).map(o => (o && typeof o === 'object' && !Array.isArray(o)) ? o.value : (Array.isArray(o) ? o[0] : o));
  const seen = new Set(base.map(String));
  return base.concat(o55Extra(setting.id).filter(v => !seen.has(String(v))));
};
const o55SegmentFits = (setting, opts) => opts.length <= 4 && opts.reduce((n, o) => n + PM51.valueLabel(setting.id, o).length, 0) <= 34;
function o55Select(setting, value, opts) {
  const list = opts.slice();
  const cur = value == null ? '' : String(value);
  if (!list.map(String).includes(cur)) list.unshift(cur); /* never pretend the first choice is the current one */
  return PM51.dropdown(cur, list.map(o => ({ value: o, label: PM51.valueLabel(setting.id, o), meta: PM51.valueHint(setting.id, o) })), { action: 'change-setting', data: { setting: setting.id }, label: setting.label, search: list.length > 10 });
}
function o55Segmented(setting, value, opts) {
  return `<div class="segmented o55-seg" role="radiogroup" aria-label="${a(setting.label)}">${opts.map(o => { const on = String(o) === String(value); return `<button type="button" role="radio" class="${on ? 'active' : ''}" aria-checked="${on}" data-action="set-setting" data-setting="${a(setting.id)}" data-value="${a(o)}">${h(PM51.valueLabel(setting.id, o))}</button>`; }).join('')}</div>`;
}
function o55Multi(setting, value, opts) {
  const on = Array.isArray(value) ? value.map(String) : [];
  return `<div class="chip-select o55-chips" role="group" aria-label="${a(setting.label)}">${opts.map(o => { const sel = on.includes(String(o)); return `<button type="button" class="${sel ? 'active' : ''}" aria-pressed="${sel}" data-action="toggle-multi-setting" data-setting="${a(setting.id)}" data-value="${a(o)}">${sel ? icon('check') : ''}<span>${h(PM51.valueLabel(setting.id, o))}</span></button>`; }).join('')}</div>`;
}
function o55Number(setting, value) {
  const raw = String(value == null ? '' : value), n = Number.parseFloat(raw), suffix = raw.replace(/^[-+]?\d*\.?\d+\s*/, '');
  const unit = o55Unit(setting) || suffix;
  const row = O55R[setting.id] || {};
  const bounds = `${Number.isFinite(row.min ?? setting.min) ? ` min="${row.min ?? setting.min}"` : ''}${Number.isFinite(row.max ?? setting.max) ? ` max="${row.max ?? setting.max}"` : ''}`;
  return `<label class="o55-num"><input class="text-control" type="number" inputmode="decimal" step="${a(row.step || 'any')}"${bounds} value="${a(Number.isFinite(n) ? n : '')}" placeholder="${a(row.placeholder || '')}" data-action="input-setting" data-setting="${a(setting.id)}" data-value-suffix="${a(suffix)}" aria-label="${a(setting.label)}">${unit ? `<span class="o55-unit">${h(unit)}</span>` : ''}</label>`;
}
function o55Inherited(setting, value) {
  const n = Number(value);
  if (Number.isFinite(n) && value !== '' && value != null) return `<span class="o55-inherit">${o55Number(Object.assign({}, setting), n)}<button type="button" class="o55-textbtn" data-action="o55-auto-number" data-setting="${a(setting.id)}">Use automatic</button></span>`;
  const shown = value == null || value === '' ? 'Automatic' : PM51.valueLabel(setting.id, value);
  return `<span class="o55-inherit"><span class="o55-auto">${icon('spark')}<span>${h(/default/i.test(shown) ? cap(shown) : shown)}</span></span><button type="button" class="o55-textbtn" data-action="set-slider-override" data-setting="${a(setting.id)}">Set a number</button></span>`;
}
function o55Structured(setting, value) {
  const list = setting.control === 'list';
  const count = Array.isArray(value) ? value.length : (value && typeof value === 'object' ? Object.keys(value).length : 0);
  const row = O55R[setting.id] || {};
  const noun = row.noun || (list ? 'item' : 'entry');
  const plural = row.nouns || (noun.endsWith('y') ? noun.slice(0, -1) + 'ies' : noun + 's');
  const preview = count ? PM51.valueText(setting, value) : '';
  const text = count ? `${count} ${count === 1 ? noun : plural}` : (row.empty || `No ${plural} yet`);
  return `<button type="button" class="o55-struct" data-action="open-structured-setting" data-setting="${a(setting.id)}" aria-label="${a(`${setting.label}: ${text}. Edit`)}"><span class="o55-struct-copy"><span class="o55-struct-count">${h(text)}</span>${preview ? `<span class="o55-struct-preview">${h(preview)}</span>` : ''}</span>${icon(count ? 'edit' : 'plus')}</button>`;
}
function o55Credential(setting) {
  const saved = !!(PM51.s().o55Keys || {})[setting.id];
  const row = O55R[setting.id] || {};
  if (row.route) return `<button type="button" class="btn small o55-routebtn" data-action="o55-go-owner" data-setting="${a(setting.id)}">${icon('key')}<span>${h(row.routeLabel || 'Set up where it is used')}</span>${icon('arrowRight')}</button>`;
  return `<span class="o55-key ${saved ? 'is-saved' : ''}">${saved ? `<span class="o55-key-state">${icon('lock')}<span>Saved securely</span></span>` : ''}<button type="button" class="btn small" data-action="manage-credential-reference" data-setting="${a(setting.id)}">${icon(saved ? 'refresh' : 'key')}<span>${saved ? 'Replace' : 'Add key'}</span></button></span>`;
}
function o55Action(setting) {
  const row = O55R[setting.id] || {};
  const label = row.actionLabel || setting.label;
  const go = row.route && !row.run;
  return `<button type="button" class="btn small o55-actionbtn${row.danger ? ' danger' : ''}" data-action="run-setting-action" data-setting="${a(setting.id)}">${row.icon ? icon(row.icon) : ''}<span>${h(label)}</span>${go ? icon('arrowRight') : ''}</button>`;
}
function o55Text(setting, value) {
  const row = O55R[setting.id] || {};
  return `<input class="text-control" value="${a(value == null ? '' : value)}" placeholder="${a(row.placeholder || '')}" data-action="input-setting" data-setting="${a(setting.id)}" aria-label="${a(setting.label)}"${row.wide ? ' data-wide="1"' : ''}/>`;
}
function o55Path(setting, value) {
  const row = O55R[setting.id] || {};
  return `<div class="path-control o55-path"><input class="text-control" value="${a(value == null ? '' : value)}" placeholder="${a(row.placeholder || 'Automatic')}" data-action="input-setting" data-setting="${a(setting.id)}" aria-label="${a(setting.label)}"><button type="button" class="btn small" data-action="browse-setting-path" data-setting="${a(setting.id)}">${icon('folder')}<span>Choose</span></button></div>`;
}
function o55Status(setting, value) {
  const row = O55R[setting.id] || {};
  const text = PM51.valueText(setting, value);
  return `<span class="o55-readout">${PM51.status(text, row.tone || PM51.tone(text))}</span>`;
}
const o55KitControl = renderControl;
renderControl = function (setting, value) {
  if (!setting) return o55KitControl(setting, value);
  const row = O55R[setting.id] || {};
  const control = row.control || setting.control;
  const opts = o55Options(setting);
  switch (control) {
    case 'select': return opts.length ? o55Select(setting, value, opts) : o55Text(setting, value);
    case 'segmented': return opts.length && o55SegmentFits(setting, opts) && opts.map(String).includes(String(value)) ? o55Segmented(setting, value, opts) : o55Select(setting, value, opts);
    case 'multiselect': return opts.length ? o55Multi(setting, value, opts) : o55Structured(Object.assign({}, setting, { control: 'list' }), value);
    case 'number': return o55Number(setting, value);
    case 'number-inherited': case 'slider-inherited': return o55Inherited(setting, value);
    case 'list': case 'keyvalue': return o55Structured(Object.assign({}, setting, { control }), value);
    case 'credential': return o55Credential(setting);
    case 'action': return o55Action(setting);
    case 'text': return o55Text(setting, value);
    case 'path': return o55Path(setting, value);
    case 'status': return o55Status(setting, value);
    case 'toggle': return `<button type="button" class="toggle ${value ? 'on' : ''}" role="switch" aria-checked="${!!value}" data-action="toggle-setting" data-setting="${a(setting.id)}" aria-label="${a(setting.label)}"></button>`;
    default: return o55KitControl(Object.assign({}, setting, { control }), value);
  }
};

/* ---------- rows ---------------------------------------------------------------------------------------------- */
/* One row everywhere (manager sections, plain pages, composed rows): label, one plain sentence, the control, and a
   small "About" button that opens the Details panel. Changed values carry a quiet dot, not a badge. */
const o55FirstSentence = text => { const m = /\S.*?(?:[.!?](?=\s|$))/.exec(String(text || '')); return m ? m[0].trim() : String(text || '').trim(); };
PM51.rowLabel = setting => (O55R[setting.id] || {}).label || setting.label;
PM51.rowHelp = setting => { const r = O55R[setting.id] || {}; return r.help != null ? r.help : o55FirstSentence(setting.description); };
renderSettingRow = function (setting, section, workspace) {
  const current = settingValue(setting);
  const changed = !!state.changed[setting.id];
  const row = O55R[setting.id] || {};
  const label = PM51.rowLabel(setting), help = PM51.rowHelp(setting);
  const control = renderControl(setting, current);
  const wide = row.layout === 'wide' || ['multiselect'].includes(row.control || setting.control) && o55Options(setting).length > 4;
  return `<div class="setting-row o55-row${changed ? ' is-changed' : ''}${wide ? ' is-wide' : ''}${row.risk ? ' is-risky' : ''}" id="setting-${a(setting.id)}" data-o55-kind="${a(row.control || setting.control || '')}">
      <div class="setting-copy"><div class="setting-label">${h(label)}${changed ? '<span class="o55-changed" title="Changed from the default"><i></i><span>Changed</span></span>' : ''}${row.risk ? `<span class="o55-risk">${icon('alert')}<span>${h(row.risk)}</span></span>` : ''}</div>${help ? `<div class="setting-description">${h(help)}</div>` : ''}</div>
      <div class="setting-control">${control}</div>
      <button type="button" class="icon-btn details-btn o55-about" aria-expanded="${state.detailSetting === setting.id ? 'true' : 'false'}" data-action="setting-details" data-setting="${a(setting.id)}" data-workspace="${a(workspace ? workspace.id : '')}" data-section="${a(section ? section.id : '')}" aria-label="${a('About ' + label)}" data-pm-hover-label="${a('About ' + label)}" data-pm-hover-detail="What it does, your choices, and the default.">${icon('help')}</button>
    </div>`;
};
/* Placed sections inside managers: a titled group, no kicker, no "Section guide" button (each row has About). */
const o55KitSection = renderSettingsSection;
renderSettingsSection = function (section, workspace, index) {
  if (!section || !section.placement) return o55KitSection(section, workspace, index);
  return `<section class="settings-section o55-group" id="section-${a(section.id)}" data-section-id="${a(section.id)}">
      <header class="o55-group-head"><h3 class="o55-group-title">${h(section.label)}</h3>${section.description ? `<p class="o55-group-help">${h(section.description)}</p>` : ''}</header>
      <div class="setting-list">${section.settings.map(s => renderSettingRow(s, section, workspace)).join('')}</div>
    </section>`;
};

/* ---------- toasts in plain words --------------------------------------------------------------------------- */
function o55Changed(setting, raw) {
  const label = PM51.rowLabel(setting);
  const text = PM51.valueText(setting, raw);
  showToast('Saved', `${label}: ${text}.`, 'success', 2200);
}
const o55ChangeAction = handleChangeAction;
handleChangeAction = function (action, el) {
  if (action === 'change-setting') {
    const id = ds(el, 'setting'), found = findSettingGlobal(id);
    if (!found || !commitSettingValue(id, el.value)) return;
    saveState(); o55Changed(found.setting, el.value); o55MarkChanged(id); return;
  }
  return o55ChangeAction(action, el);
};
function o55MarkChanged(id) {
  const row = root.querySelector(`#setting-${cssEscape(id)}`); if (!row || row.classList.contains('is-changed')) return;
  row.classList.add('is-changed');
  const lab = row.querySelector('.setting-label'); if (lab && !lab.querySelector('.o55-changed')) lab.insertAdjacentHTML('beforeend', '<span class="o55-changed" title="Changed from the default"><i></i><span>Changed</span></span>');
}

/* ---------- editors: lists, key/value pairs, numbers, keys, actions ------------------------------------------- */
const o55IsFlatList = v => Array.isArray(v) && v.every(x => x == null || ['string', 'number', 'boolean'].includes(typeof x));
const o55IsFlatMap = v => v && typeof v === 'object' && !Array.isArray(v) && Object.values(v).every(x => x == null || ['string', 'number', 'boolean'].includes(typeof x));
function o55ListEditor(found) {
  const s = found.setting, row = O55R[s.id] || {};
  const value = settingValue(s);
  if (!o55IsFlatList(value) && value != null && !(Array.isArray(value) && !value.length)) return o55JsonEditor(found);
  let items = (Array.isArray(value) ? value : []).map(x => String(x));
  const noun = row.noun || 'item';
  const ordered = row.ordered !== false;
  /* a list of known things (services, say) is picked from, not typed: items read as names, Add offers what is left */
  const pick = Array.isArray(row.valueChoices) && row.valueChoices.length ? row.valueChoices.map(String) : null;
  const draw = wrap => {
    const list = wrap.querySelector('.o55-le-list');
    if (pick) {
      const left = pick.filter(c => !items.includes(c));
      const add = wrap.querySelector('.o55-le-add');
      if (add) add.innerHTML = left.length ? `${PM51.dropdown(left[0], left.map(c => ({ value: c, label: PM51.valueLabel(s.id, c) })), { label: 'New ' + noun, cls: 'o55-le-pick' }).replace('<select ', '<select data-o55-le-new ')}<button type="button" class="btn small" data-o55-le="add">${icon('plus')}<span>Add</span></button>` : `<span class="o55-le-help">Every ${h(noun)} is in the list.</span>`;
    }
    list.innerHTML = items.length ? items.map((x, i) => `<div class="o55-le-row${ordered ? '' : ' is-plain'}" data-i="${i}">${ordered ? `<span class="o55-le-n">${i + 1}</span>` : ''}${pick ? `<span class="o55-le-name">${h(PM51.valueLabel(s.id, x))}</span>` : `<input class="text-control" value="${a(x)}" aria-label="${a(`${cap(noun)} ${i + 1}`)}" data-i="${i}"/>`}${ordered ? `<button type="button" class="icon-btn" data-o55-le="up" data-i="${i}" aria-label="Move up"${i === 0 ? ' aria-disabled="true"' : ''}>${icon('up')}</button><button type="button" class="icon-btn" data-o55-le="down" data-i="${i}" aria-label="Move down"${i === items.length - 1 ? ' aria-disabled="true"' : ''}>${icon('down')}</button>` : ''}<button type="button" class="icon-btn" data-o55-le="remove" data-i="${i}" aria-label="${a('Remove ' + noun)}">${icon('trash')}</button></div>`).join('')
      : `<div class="o55-le-empty">${h(row.empty || `No ${noun}s yet.`)}</div>`;
  };
  const body = `<div class="o55-le">${row.editorHelp ? `<p class="o55-le-help">${h(row.editorHelp)}</p>` : ''}<div class="o55-le-list"></div>
      <div class="o55-le-add"><input class="text-control" placeholder="${a(row.placeholder || `Add ${/^[aeiou]/i.test(noun) ? 'an' : 'a'} ${noun}`)}" aria-label="${a('New ' + noun)}" data-o55-le-new/><button type="button" class="btn small" data-o55-le="add">${icon('plus')}<span>Add</span></button></div></div>`;
  const wrap = PM51.panel({
    title: PM51.rowLabel(s), eyebrow: found.workspace ? found.workspace.label : '', icon: row.icon || 'list', summary: PM51.rowHelp(s), body,
    primaryLabel: 'Save', onPrimary: w => {
      w.querySelectorAll('.o55-le-row input').forEach(inp => { items[Number(inp.dataset.i)] = inp.value.trim(); });
      const pending = pick ? null : w.querySelector('[data-o55-le-new]'); if (pending && pending.value.trim()) items.push(pending.value.trim());
      const next = items.filter(Boolean);
      if (!commitSettingValue(s.id, next)) return false;
      saveState(); refreshSettingRow(s.id); o55Notify(s.id, next); showToast('Saved', `${PM51.rowLabel(s)}: ${next.length} ${next.length === 1 ? noun : noun + 's'}.`, 'success', 2200);
    }
  });
  draw(wrap);
  const sync = () => wrap.querySelectorAll('.o55-le-row input').forEach(inp => { items[Number(inp.dataset.i)] = inp.value; });
  wrap.addEventListener('click', e => {
    const b = e.target.closest('[data-o55-le]'); if (!b || b.getAttribute('aria-disabled') === 'true') return;
    sync(); const i = Number(b.dataset.i), op = b.dataset.o55Le;
    if (op === 'add') { const inp = wrap.querySelector('[data-o55-le-new]'); const v = inp.value.trim(); if (!v) { inp.focus(); return; } items.push(v); inp.value = ''; }
    else if (op === 'remove') items.splice(i, 1);
    else if (op === 'up' && i > 0) items.splice(i - 1, 0, items.splice(i, 1)[0]);
    else if (op === 'down' && i < items.length - 1) items.splice(i + 1, 0, items.splice(i, 1)[0]);
    draw(wrap); if (op === 'add') wrap.querySelector('[data-o55-le-new]').focus();
  });
  wrap.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('[data-o55-le-new]')) { e.preventDefault(); wrap.querySelector('[data-o55-le="add"]').click(); } });
  return true;
}
function o55MapEditor(found) {
  const s = found.setting, row = O55R[s.id] || {};
  const value = settingValue(s);
  if (!o55IsFlatMap(value) && value != null && !(value && typeof value === 'object' && !Object.keys(value).length) && typeof value !== 'string') return o55JsonEditor(found);
  let pairs = Object.entries(o55IsFlatMap(value) ? value : {}).map(([k, v]) => [k, v == null ? '' : String(v)]);
  const [kName, vName] = row.pair || ['Name', 'Value'];
  const draw = wrap => {
    const vc = row.valueChoices;
    const valueCell = (v, i) => vc ? `<select class="select-control o55-kv-select" data-v="${i}" aria-label="${a(vName)}">${vc.map(o => `<option value="${a(o)}"${String(o) === String(v) ? ' selected' : ''}>${h(PM51.valueLabel(s.id, o))}</option>`).join('')}</select>` : `<input class="text-control" value="${a(v)}" aria-label="${a(vName)}" data-v="${i}"/>`;
    wrap.querySelector('.o55-kv-list').innerHTML = pairs.length ? pairs.map(([k, v], i) => `<div class="o55-kv-row"><input class="text-control" value="${a(k)}" aria-label="${a(kName)}" data-k="${i}"/>${valueCell(v, i)}<button type="button" class="icon-btn" data-o55-kv="remove" data-i="${i}" aria-label="Remove">${icon('trash')}</button></div>`).join('')
      : `<div class="o55-le-empty">${h(row.empty || 'Nothing here yet.')}</div>`;
  };
  const body = `<div class="o55-kv">${row.editorHelp ? `<p class="o55-le-help">${h(row.editorHelp)}</p>` : ''}<div class="o55-kv-cols"><span>${h(kName)}</span><span>${h(vName)}</span><span></span></div><div class="o55-kv-list"></div>
      <button type="button" class="btn small o55-kv-add" data-o55-kv="add">${icon('plus')}<span>Add a row</span></button></div>`;
  const wrap = PM51.panel({
    title: PM51.rowLabel(s), eyebrow: found.workspace ? found.workspace.label : '', icon: row.icon || 'sliders', summary: PM51.rowHelp(s), body,
    primaryLabel: 'Save', onPrimary: w => {
      const next = {}; w.querySelectorAll('.o55-kv-row').forEach((r, i) => { const k = r.querySelector('[data-k]').value.trim(), v = r.querySelector('[data-v]').value.trim(); if (k) next[k] = /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v; });
      if (!commitSettingValue(s.id, next)) return false;
      saveState(); refreshSettingRow(s.id); o55Notify(s.id, next); showToast('Saved', `${PM51.rowLabel(s)} updated.`, 'success', 2200);
    }
  });
  draw(wrap);
  wrap.addEventListener('click', e => {
    const b = e.target.closest('[data-o55-kv]'); if (!b) return;
    wrap.querySelectorAll('.o55-kv-row').forEach((r, i) => { pairs[i] = [r.querySelector('[data-k]').value, r.querySelector('[data-v]').value]; });
    if (b.dataset.o55Kv === 'add') pairs.push(['', row.valueChoices ? row.valueChoices[0] : '']); else pairs.splice(Number(b.dataset.i), 1);
    draw(wrap); if (b.dataset.o55Kv === 'add') { const last = wrap.querySelectorAll('.o55-kv-row [data-k]'); last.length && last[last.length - 1].focus(); }
  });
  return true;
}
/* Nested data (lists of objects, maps of maps) keeps an honest structured editor, labelled as such. */
function o55JsonEditor(found) {
  const s = found.setting;
  PM51.panel({
    title: PM51.rowLabel(s), eyebrow: 'Structured value', icon: 'brackets', summary: PM51.rowHelp(s),
    body: PM51.panelSection('Edit', `<textarea class="text-control o55-json" spellcheck="false" aria-label="${a(PM51.rowLabel(s))}">${h(JSON.stringify(settingValue(s), null, 2))}</textarea>`, 'This one holds nested data, so it is edited as text. Puppet Master checks it before saving.'),
    primaryLabel: 'Check and save', onPrimary: w => {
      const list = Array.isArray(settingValue(s)) || s.control === 'list';
      try { const v = JSON.parse(w.querySelector('.o55-json').value); if (list ? !Array.isArray(v) : (!v || typeof v !== 'object' || Array.isArray(v))) throw new Error(list ? 'This needs to be a list in square brackets.' : 'This needs to be a set of names and values in curly braces.'); if (!commitSettingValue(s.id, v)) return false; saveState(); refreshSettingRow(s.id); showToast('Saved', `${PM51.rowLabel(s)} updated.`, 'success', 2200); }
      catch (e) { showToast('Not saved', e.message.replace(/^Unexpected token.*/, 'That text is not valid. Check commas and quotes.'), 'error'); return false; }
    }
  });
  return true;
}
function o55NumberDialog(found) {
  const s = found.setting, row = O55R[s.id] || {};
  const unit = o55Unit(s);
  const min = row.min ?? s.min, max = row.max ?? s.max;
  PM51.panel({
    title: PM51.rowLabel(s), eyebrow: 'Set a number', icon: 'sliders', size: 'narrow', summary: PM51.rowHelp(s),
    body: PM51.panelSection('Value', PM51.field(unit ? `Value (${unit})` : 'Value', `<input class="text-control o55-numinput" type="number" inputmode="decimal" step="any"${Number.isFinite(min) ? ` min="${min}"` : ''}${Number.isFinite(max) ? ` max="${max}"` : ''} placeholder="${a(row.placeholder || '')}" data-autofocus aria-label="Value"/>`, Number.isFinite(min) && Number.isFinite(max) ? `Between ${min} and ${max}.` : 'Leave it on Automatic to follow the default.')),
    primaryLabel: 'Use this number', onPrimary: w => {
      const v = Number(w.querySelector('.o55-numinput').value);
      if (w.querySelector('.o55-numinput').value === '' || !Number.isFinite(v) || (Number.isFinite(min) && v < min) || (Number.isFinite(max) && v > max)) { showToast('Enter a number', Number.isFinite(min) && Number.isFinite(max) ? `Between ${min} and ${max}.` : 'A whole number or a decimal.', 'info'); return false; }
      if (!commitSettingValue(s.id, v)) return false; saveState(); refreshSettingRow(s.id); o55Changed(s, v);
    }
  });
  return true;
}
/* Secret material is never rendered, stored in project settings, or read back; this concept only records that a key
   was saved so the row can say so. */
function o55KeyPanel(found) {
  const s = found.setting, row = O55R[s.id] || {};
  if (row.route) return o55GoOwner(s.id);
  const project = window.PM7_SETTINGS_TOME.project();
  if (!project) { showToast('Choose a project first', 'Keys are saved for a project.', 'info'); return true; }
  const owner = window.PM_SETTINGS_CREDENTIALS && window.PM_SETTINGS_CREDENTIALS.open;
  if (typeof owner === 'function') { owner({ project_id: project.id, setting_id: s.id, mode: 'reference_only' }); return true; }
  const keys = PM51.s().o55Keys = PM51.s().o55Keys || {};
  const saved = !!keys[s.id];
  PM51.panel({
    title: PM51.rowLabel(s), eyebrow: 'Secret', icon: 'key', status: saved ? { label: 'Saved securely', tone: 'ready' } : { label: 'Not set', tone: 'off' }, summary: PM51.rowHelp(s),
    body: PM51.panelSection(saved ? 'Replace the key' : 'Add the key', PM51.field(row.keyLabel || 'Key', `<input class="text-control o55-keyinput" type="password" autocomplete="off" spellcheck="false" placeholder="${a(row.placeholder || 'Paste it here')}" data-autofocus aria-label="Key"/>`, 'Kept in the secure keychain on your server. It is never shown again, never copied into settings files, and never included when settings are exported.'))
      + (saved ? PM51.panelSection('Remove', `<button type="button" class="btn small danger" data-o55-key-remove>${icon('trash')}<span>Remove this key</span></button>`, 'Anything that uses it stops working until you add a key again.') : ''),
    primaryLabel: saved ? 'Replace key' : 'Save key', onPrimary: w => {
      const v = w.querySelector('.o55-keyinput').value.trim();
      if (!v) { showToast('Paste the key first', row.where || 'You get it from the service\'s website.', 'info'); return false; }
      keys[s.id] = true; saveState(); refreshSettingRow(s.id); showToast('Key saved', 'Example only: nothing was stored or sent in this preview.', 'info', 2800);
    }
  });
  const rm = document.querySelector('[data-o55-key-remove]');
  if (rm) rm.addEventListener('click', () => PM51.confirm(`Remove ${PM51.rowLabel(s)}?`, 'Anything that uses it stops working until you add a key again.', 'Remove', () => { delete keys[s.id]; saveState(); closeOverlay(false); refreshSettingRow(s.id); showToast('Key removed', PM51.rowLabel(s)); }, true));
  return true;
}
/* Rows whose real home is a manager control ("route" in rows.json) take you there and point at it. */
function o55GoOwner(id) {
  const row = O55R[id] || {}, r = row.route; if (!r) return false;
  closeOverlay(false);
  if (r.tab && r.workspace) PM51.setTab(r.workspace, r.tab);
  if (r.select && r.workspace === 'providers') state.selectedProvider = r.select;
  if (r.select && r.workspace && r.workspace !== 'providers') PM51.setSel(r.workspace, r.select);
  navigate(r.domain, r.workspace, r.section ? { section: r.section } : {});
  if (r.target) {
    let tries = 0;
    const find = () => { const el = root.querySelector(r.target); if (el) { el.scrollIntoView({ block: 'center', behavior: motionReduced() ? 'auto' : 'smooth' }); el.classList.add('o55-pointed'); window.setTimeout(() => el.classList.remove('o55-pointed'), 2400); if (r.then === 'click' && typeof el.click === 'function') window.setTimeout(() => el.click(), 380); return true; } return ++tries > 30; };
    if (!find()) { const t = window.setInterval(() => { if (find()) window.clearInterval(t); }, 70); }
  }
  if (row.routeToast) showToast(row.routeToast[0], row.routeToast[1] || '', 'info', 3000);
  return true;
}
PM51.goOwner = o55GoOwner;
function o55RunAction(found) {
  const s = found.setting, row = O55R[s.id] || {};
  if (row.route && !row.run) return o55GoOwner(s.id);
  if (row.open) { const f = findSettingGlobal(row.open); if (f) { (f.setting.control === 'keyvalue' ? o55MapEditor : o55ListEditor)(f); return true; } }
  if (row.pm51) { const fn = actions[row.pm51.replace(/^pm51-/, '')]; if (fn) { fn(Object.assign(document.createElement('button'), { dataset: Object.assign({}, row.data || {}) }), null); return true; } }
  const steps = row.steps || [];
  PM51.panel({
    title: row.actionLabel || PM51.rowLabel(s), eyebrow: found.workspace ? found.workspace.label : '', icon: row.icon || 'play', summary: row.summary || PM51.rowHelp(s),
    body: (steps.length ? PM51.panelSection('What happens', PM51.steps(steps.map(t => typeof t === 'string' ? { title: t } : t))) : PM51.panelSection('What this does', `<p class="pm51-ps-text">${h(s.description || PM51.rowHelp(s))}</p>`))
      + (row.note ? PM51.note(row.note, row.danger ? 'attention' : 'info') : ''),
    primaryLabel: row.run || row.actionLabel || PM51.rowLabel(s), danger: !!row.danger,
    onPrimary: () => showToast(row.doneTitle || `${row.actionLabel || PM51.rowLabel(s)} requested`, 'Example only: nothing changed outside this preview.', 'info', 2800)
  });
  return true;
}
const o55ValuesDispatch = dispatchAction;
dispatchAction = function (action, el, event) {
  const id = el && el.dataset ? el.dataset.setting : null;
  const found = id ? findSettingGlobal(id) : null;
  switch (action) {
    case 'open-structured-setting': if (found) { (found.setting.control === 'keyvalue' ? o55MapEditor : o55ListEditor)(found); return; } break;
    case 'set-slider-override': if (found) { o55NumberDialog(found); return; } break;
    case 'manage-credential-reference': if (found) { o55KeyPanel(found); return; } break;
    case 'run-setting-action': if (found && found.setting.id !== 'restore-defaults') { o55RunAction(found); return; } break;
    case 'o55-go-owner': if (id) { o55GoOwner(id); return; } break;
    case 'o55-auto-number': if (found) { if (restoreSettingDefault(id)) { saveState(); refreshSettingRow(id); showToast('Back to automatic', PM51.rowLabel(found.setting), 'success', 2200); } return; } break;
    case 'set-setting': {
      if (found) { const v = el.dataset.value; if (!commitSettingValue(id, v)) return; refreshSettingRow(id); o55Changed(found.setting, v); return; }
      break;
    }
    case 'toggle-setting': {
      if (found) { const next = !settingValue(found.setting); if (!commitSettingValue(id, next)) return; saveState(); refreshSettingRow(id); o55Changed(found.setting, next); return; }
      break;
    }
  }
  return o55ValuesDispatch(action, el, event);
};
