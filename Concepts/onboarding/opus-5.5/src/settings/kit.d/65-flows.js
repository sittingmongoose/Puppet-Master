/* O55 · action rows that do something. An inventory action with no manager behind it used to open a generic
   "What this does" panel whose button only said "requested". rows.d gives such a row a `flow`, and the row's button
   runs it:
   - form:    fields to fill in (text, secret, select, toggle, textarea, number); non-secret answers are kept and shown
              again next time, secrets are only marked as saved in the keychain;
   - check:   steps that run one after another when you press the button, with an outcome and the time of the last run;
   - confirm: a plain question with the consequence spelled out (danger when it removes something);
   - list:    things to look at, each with its own action or Remove, and an optional form to add one;
   - order:   a list you put in order with Move up / Move down.
   What each flow keeps lives in PM51.s().o55Flows[id]. Nothing leaves this preview; the last line of each flow says so
   where an outside service would be involved. */
const o55FlowStore = id => { const s = PM51.s(); s.o55Flows = s.o55Flows || {}; return (s.o55Flows[id] = s.o55Flows[id] || {}); };
const o55FlowNow = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
function o55FlowField(f, saved) {
  const v = saved[f.key] != null ? saved[f.key] : (f.value != null ? f.value : '');
  const data = `data-key="${a(f.key)}"`;
  if (f.type === 'secret') return PM51.field(f.label, `<input class="text-control o55-flow-in" ${data} data-secret="1" type="password" autocomplete="off" spellcheck="false" placeholder="${a(saved[f.key] ? 'Saved. Paste a new one to replace it' : (f.placeholder || 'Paste it here'))}"/>`, (f.help ? f.help + ' ' : '') + 'Kept in your server\'s keychain; never shown again.');
  if (f.type === 'select') return PM51.field(f.label, PM51.select(v || (f.options[0] && (Array.isArray(f.options[0]) ? f.options[0][0] : f.options[0])), f.options, { cls: 'o55-flow-in', data: { key: f.key }, label: f.label }), f.help);
  if (f.type === 'toggle') return `<div class="o55-flow-toggle">${PM51.rows([{ label: f.label, help: f.help, control: PM51.toggle(v === true || v === 'on', { action: 'pm51-o55-flow-toggle', data: { key: f.key }, label: f.label }) }])}</div>`;
  if (f.type === 'textarea') return PM51.field(f.label, `<textarea class="form-textarea o55-flow-in${f.mono ? ' o55-setup-mono' : ''}" ${data} rows="${Number(f.rows) || 6}" spellcheck="false" placeholder="${a(f.placeholder || '')}">${h(v)}</textarea>`, f.help);
  return PM51.field(f.label, `<input class="text-control o55-flow-in${f.mono ? ' o55-setup-mono' : ''}" ${data} type="${f.type === 'number' ? 'number' : 'text'}" value="${a(v)}" placeholder="${a(f.placeholder || '')}" autocomplete="off" spellcheck="false"/>`, f.help);
}
function o55FlowCollect(wrap, flow, into) {
  let missing = '';
  wrap.querySelectorAll('.o55-flow-in').forEach(el => {
    const k = el.dataset.key; if (!k) return; const val = String(el.value || '').trim();
    if (el.dataset.secret) { if (val) into[k] = '(saved)'; } else into[k] = val;
  });
  wrap.querySelectorAll('.o55-flow-toggle [data-action="pm51-o55-flow-toggle"]').forEach(el => { into[el.dataset.key] = el.classList.contains('on'); });
  (flow.fields || []).forEach(f => { if (!missing && f.required && !into[f.key]) missing = `${f.type === 'secret' ? 'Paste' : 'Fill in'} ${f.label.toLowerCase()} first.`; });
  return missing;
}
function o55Flow(found, flow) {
  const s = found.setting, id = s.id, store = o55FlowStore(id);
  const title = flow.title || (O55R[id] || {}).actionLabel || PM51.rowLabel(s);
  const eyebrow = found.workspace ? found.workspace.label : '';
  const done = (fallbackTitle) => { const [t, m] = flow.done || [fallbackTitle, '']; showToast(t, (m ? m + ' ' : '') + (flow.external ? 'Example only: nothing left this preview.' : ''), flow.external ? 'info' : 'success', 3000); };
  const last = store.last ? PM51.note(`Last time: ${store.last}.`, 'info') : '';
  if (flow.kind === 'confirm') {
    confirmDialog(title, flow.message || PM51.rowHelp(s), flow.primary || 'Continue', () => { store.last = `${o55FlowNow()} today`; saveState(); done(`${title}: done`); }, !!flow.danger);
    return true;
  }
  if (flow.kind === 'check') {
    const steps = (flow.steps || []).map(st => Object.assign({ status: 'Waiting', tone: 'neutral' }, typeof st === 'string' ? { title: st } : st));
    const wrap = PM51.panel({
      title, eyebrow, icon: flow.icon || 'test', summary: flow.summary || PM51.rowHelp(s),
      body: PM51.panelSection('What happens', `<div class="o55-flow-steps">${PM51.steps(steps.map(st => Object.assign({}, st, { status: 'Waiting', tone: 'neutral' })))}</div>`) + last,
      primaryLabel: flow.primary || 'Run it', onPrimary: w => {
        const host = w.querySelector('.o55-flow-steps'); if (!host) return;
        const shown = steps.map(st => Object.assign({}, st, { status: 'Waiting', tone: 'neutral' }));
        let i = 0; const tick = () => { if (!w.isConnected) return; shown[i] = Object.assign({}, steps[i], { status: steps[i].result || 'Done', tone: steps[i].resultTone || 'ready' }); host.innerHTML = PM51.steps(shown); i++; if (i < steps.length) window.setTimeout(tick, motionReduced() ? 0 : 380); else { store.last = `${o55FlowNow()} today · ${flow.outcome || 'finished'}`; saveState(); done(flow.outcome ? `${title}: ${flow.outcome}` : `${title}: finished`); } };
        tick(); return false;
      }
    });
    return !!wrap;
  }
  if (flow.kind === 'list' || flow.kind === 'order') {
    if (!store.items) store.items = clone(flow.items || []);
    const paint = w => {
      const body = w.querySelector('.pm51-panel-body'); if (!body) return;
      const n = store.items.length;
      const rows = store.items.map((it, i) => ({ label: it.label, help: it.help, control: [
        it.value ? `<span class="pm51-row-value">${h(it.value)}</span>` : '',
        flow.kind === 'order' ? PM51.iconBtn({ icon: 'up', label: `Move ${it.label} up`, action: 'pm51-o55-flow-move', data: { id, i, d: -1 }, disabled: i === 0, reason: 'Already first.' }) + PM51.iconBtn({ icon: 'down', label: `Move ${it.label} down`, action: 'pm51-o55-flow-move', data: { id, i, d: 1 }, disabled: i === n - 1, reason: 'Already last.' }) : '',
        it.action ? PM51.btn({ label: it.action, small: true, icon: it.icon || 'play', action: 'pm51-o55-flow-item', data: { id, i } }) : '',
        it.remove ? PM51.iconBtn({ icon: 'trash', label: `Remove ${it.label}`, action: 'pm51-o55-flow-remove', data: { id, i } }) : ''
      ].join('') }));
      body.innerHTML = (flow.intro && flow.summary ? `<p class="o55-wiz-lead">${h(flow.intro)}</p>` : '')
        + PM51.panelSection(flow.listTitle || 'Now', n ? PM51.rows(rows) : PM51.note(flow.empty || 'Nothing here.', 'info'))
        + (flow.add ? PM51.panelSection(flow.add.title || 'Add one', `<div class="o55-setup-fields">${flow.add.fields.map(f => o55FlowField(f, {})).join('')}</div><div class="pm51-mcp-actions">${PM51.btn({ label: flow.add.label || 'Add', icon: 'plus', small: true, action: 'pm51-o55-flow-add', data: { id } })}</div>`) : '');
    };
    const wrap = PM51.panel({ title, eyebrow, icon: flow.icon || 'list', summary: flow.summary || flow.intro || PM51.rowHelp(s), size: flow.size || '', body: '', primaryLabel: flow.kind === 'order' ? 'Done' : '', onPrimary: flow.kind === 'order' ? () => { store.last = `${o55FlowNow()} today`; saveState(); done('Order saved'); } : null });
    wrap._o55FlowPaint = () => paint(wrap); wrap._o55Flow = { id, flow, store };
    paint(wrap);
    return true;
  }
  /* form */
  const saved = store.values || {};
  PM51.panel({
    title, eyebrow, icon: flow.icon || 'sliders', summary: flow.summary || PM51.rowHelp(s), size: flow.size || '',
    body: `<div class="o55-setup-fields">${(flow.fields || []).map(f => o55FlowField(f, saved)).join('')}</div>` + (flow.note ? PM51.note(flow.note, 'info') : '') + last,
    primaryLabel: flow.primary || 'Save', onPrimary: w => {
      const next = Object.assign({}, saved); const why = o55FlowCollect(w, flow, next);
      if (why) { showToast('One more thing', why, 'info', 2600); return false; }
      store.values = next; store.last = `${o55FlowNow()} today`; saveState(); done(`${title}: saved`);
    }
  });
  return true;
}
const o55FlowWrapOf = el => el && el.closest && el.closest('.drawer-wrap');
PM51.on('o55-flow-toggle', el => { el.classList.toggle('on'); el.setAttribute('aria-checked', String(el.classList.contains('on'))); });
PM51.on('o55-flow-move', el => { const w = o55FlowWrapOf(el); const f = w && w._o55Flow; if (!f) return; const i = Number(ds(el, 'i')), j = i + Number(ds(el, 'd')); const it = f.store.items; if (j < 0 || j >= it.length) return; [it[i], it[j]] = [it[j], it[i]]; saveState(); w._o55FlowPaint(); });
PM51.on('o55-flow-remove', el => { const w = o55FlowWrapOf(el); const f = w && w._o55Flow; if (!f) return; const i = Number(ds(el, 'i')); const it = f.store.items[i]; if (!it) return; confirmDialog(`Remove ${it.label}?`, f.flow.removeMessage || 'It is taken off this list.', 'Remove', () => { f.store.items.splice(i, 1); saveState(); if (w.isConnected) w._o55FlowPaint(); showToast('Removed', it.label, 'success', 2200); }, true); });
PM51.on('o55-flow-item', el => { const w = o55FlowWrapOf(el); const f = w && w._o55Flow; if (!f) return; const it = f.store.items[Number(ds(el, 'i'))]; if (!it) return; if (it.after) Object.assign(it, it.after, { after: undefined }); saveState(); w._o55FlowPaint(); showToast(it.doneTitle || `${it.action}: done`, it.doneText || (f.flow.external ? 'Example only: nothing left this preview.' : it.label), f.flow.external ? 'info' : 'success', 2600); });
PM51.on('o55-flow-add', el => { const w = o55FlowWrapOf(el); const f = w && w._o55Flow; if (!f || !f.flow.add) return; const vals = {}; const why = o55FlowCollect(w, { fields: f.flow.add.fields }, vals); if (why) { showToast('One more thing', why, 'info', 2400); return; } const tpl = f.flow.add.item || {}; const label = vals[f.flow.add.labelKey || f.flow.add.fields[0].key] || 'New'; f.store.items.push(Object.assign({}, tpl, { label, help: (f.flow.add.helpKeys || []).map(k => vals[k]).filter(Boolean).join(' · ') || tpl.help || '' })); saveState(); w._o55FlowPaint(); showToast('Added', label, 'success', 2200); });
/* The inventory's generic action panel gives way to a flow when rows.d has one. */
const o55RunActionPlain = o55RunAction;
o55RunAction = function (found) {
  const row = O55R[found.setting.id] || {};
  if (row.flow && !row.route && !row.pm51) return o55Flow(found, row.flow);
  return o55RunActionPlain(found);
};
/* Search all settings: the button puts you in the search box. */
PM51.on('o55-focus-search', () => { closeOverlay(false); const i = root.querySelector('#pm-settings-root input[placeholder^="Search settings"], .settings-search input'); if (i) { i.focus(); i.select && i.select(); } });
