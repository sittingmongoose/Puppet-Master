/* O55 · the setting Details panel. The panel itself (its spring in and out, its width, the scrim) is the engine's and
   is unchanged; what it says is rebuilt so it answers a newcomer's questions in order:
     where am I (chapter › page), what is it set to now (and is that the default), what does it do, what are my choices
     (each in plain words, the current one ticked, the default and the recommended one marked, and clickable), where
     does it apply, and which settings sit next to it. The technical name is last and folded away.
   The inventory's machine fields (tier, curation flags, "Recommended: false", the raw default as an "example") are
   never shown as prose. Moving between two settings' Details cross-fades instead of snapping. */

const O55_REF = (() => { const m = new Map(); const ref = window.PM12_REFERENCE; if (ref && ref.byCat) for (const c of Object.values(ref.byCat)) for (const r of c.settings || []) m.set(r.id, r); return m; })();
const O55_SCOPE = {
  global: 'Every project, unless a project sets its own',
  project: 'This project',
  run: 'Can be changed for a single run',
  account: 'Each account can have its own',
  provider: 'Each AI service can have its own',
  persona: 'Each persona can have its own'
};
const o55Where = (id, workspace) => {
  const e = PM51.placement && PM51.placement.byId[id];
  const d = D.domains.find(x => x.id === (e ? e.domain : null)) || D.domains.find(x => x.workspaces.some(w => w === workspace || (workspace && w.id === workspace.id)));
  const w = d && d.workspaces.find(x => x.id === (e ? e.workspace : (workspace && workspace.id)));
  return { domain: d, workspace: w || workspace };
};
const o55IsJunkNote = t => !t || /^(simple|advanced)(\s*·.*)?$/i.test(String(t).trim());
const o55IsRecommendLine = t => /^recommended\s*:/i.test(String(t || '').trim());
function o55ChoicesFor(setting, current) {
  const row = O55R[setting.id] || {};
  const control = row.control || setting.control;
  const ref = O55_REF.get(setting.id) || {};
  const def = setting.value, rec = ref.recommended;
  const mark = raw => [String(raw) === String(def) ? 'Default' : '', rec != null && String(raw) === String(rec) && String(rec) !== String(def) ? 'Recommended' : ''].filter(Boolean);
  if (control === 'toggle') {
    return { kind: 'single', items: [true, false].map(v => ({ raw: v, label: v ? 'On' : 'Off', on: !!current === v, marks: mark(v) })) };
  }
  if (['select', 'segmented'].includes(control)) {
    const opts = o55Options(setting); if (!opts.length) return null;
    return { kind: 'single', items: opts.map(o => ({ raw: o, label: PM51.valueLabel(setting.id, o), hint: PM51.valueHint(setting.id, o), on: String(o) === String(current), marks: mark(o) })) };
  }
  if (control === 'multiselect') {
    const opts = o55Options(setting); if (!opts.length) return null;
    const cur = Array.isArray(current) ? current.map(String) : [];
    const defs = Array.isArray(def) ? def.map(String) : [];
    return { kind: 'multi', items: opts.map(o => ({ raw: o, label: PM51.valueLabel(setting.id, o), hint: PM51.valueHint(setting.id, o), on: cur.includes(String(o)), marks: defs.includes(String(o)) ? ['On by default'] : [] })) };
  }
  return null;
}
function o55ChoicesHtml(setting, ch) {
  if (!ch) return '';
  return `<section class="o55-insp-block"><h4>${ch.kind === 'multi' ? 'Choose any' : 'Your choices'}</h4><div class="o55-insp-choices" role="${ch.kind === 'multi' ? 'group' : 'radiogroup'}" aria-label="${a(PM51.rowLabel(setting))}">${ch.items.map(it => `<button type="button" class="o55-insp-choice${it.on ? ' is-on' : ''}" role="${ch.kind === 'multi' ? 'checkbox' : 'radio'}" aria-checked="${it.on}" data-action="o55-insp-choose" data-setting="${a(setting.id)}" data-kind="${ch.kind}" data-value="${a(typeof it.raw === 'boolean' ? (it.raw ? '__true' : '__false') : it.raw)}"><span class="o55-insp-mark">${it.on ? icon('check') : ''}</span><span class="o55-insp-choice-copy"><span class="o55-insp-choice-label">${h(it.label)}${it.marks.map(m => `<em>${h(m)}</em>`).join('')}</span>${it.hint ? `<span class="o55-insp-choice-hint">${h(it.hint)}</span>` : ''}</span></button>`).join('')}</div></section>`;
}
renderDetailInspectorBody = function (setting, section, workspace) {
  const row = O55R[setting.id] || {};
  const ref = O55_REF.get(setting.id) || {};
  const d = setting.detail || {};
  const current = settingValue(setting);
  const changed = !!state.changed[setting.id];
  const where = o55Where(setting.id, workspace);
  const label = PM51.rowLabel(setting);
  const iconName = (where.workspace && PANEL_ICONS[where.workspace.id]) || (where.domain && DOMAIN_ICONS[where.domain.id]) || 'settings';
  const what = row.about || ref.desc || d.what || setting.description || '';
  const why = row.why || (!o55IsRecommendLine(d.why) ? d.why : '');
  const note = row.note || (!o55IsJunkNote(d.notes) ? d.notes : '');
  const scopes = (Array.isArray(ref.scope) ? ref.scope : (setting.applicabilityMetadata || [])).map(s => O55_SCOPE[s]).filter(Boolean);
  const applies = row.applies || (scopes.length ? scopes.join('. ') + '.' : (d.applies && d.applies !== 'This project' ? d.applies : 'This project.'));
  const choices = o55ChoicesFor(setting, current);
  const defText = PM51.valueText(setting, setting.value);
  const nowText = PM51.valueText(setting, current);
  const neighbours = (section && Array.isArray(section.settings) ? section.settings : []).filter(s => s.id !== setting.id).slice(0, 5);
  const crumbs = [where.domain && where.domain.label, where.workspace && where.workspace.label].filter(Boolean);
  return `<div class="detail-head pm51-panel-head o55-insp-head">
      <span class="o55-insp-icon">${icon(iconName)}</span>
      <div class="o55-insp-headcopy">${crumbs.length ? `<div class="o55-insp-crumbs">${crumbs.map(h).join('<span aria-hidden="true">›</span>')}</div>` : ''}<div class="pm51-panel-title o55-insp-title">${h(label)}</div></div>
      <button type="button" class="icon-btn pm51-panel-close" data-action="close-details" aria-label="Close">${icon('close')}</button>
    </div>
    <div class="detail-body pm51-panel-body o55-insp-body">
      <section class="o55-insp-now${changed ? ' is-changed' : ''}">
        <div class="o55-insp-now-label">${changed ? 'You changed this' : 'Set to the default'}</div>
        <div class="o55-insp-now-value">${h(nowText)}</div>
        ${changed ? `<div class="o55-insp-now-foot"><span>Default: ${h(defText)}</span><button type="button" class="o55-textbtn" data-action="reset-setting" data-setting="${a(setting.id)}">${icon('restore')}<span>Go back to the default</span></button></div>` : ''}
      </section>
      ${what ? `<section class="o55-insp-block"><h4>What it does</h4><p>${h(what)}</p></section>` : ''}
      ${why ? `<section class="o55-insp-block"><h4>When you might change it</h4><p>${h(why)}</p></section>` : ''}
      ${o55ChoicesHtml(setting, choices)}
      ${!choices && row.example ? `<section class="o55-insp-block"><h4>For example</h4><div class="o55-insp-example">${h(row.example)}</div></section>` : ''}
      ${note ? `<section class="o55-insp-block"><h4>Good to know</h4><p>${h(note)}</p></section>` : ''}
      <section class="o55-insp-block"><h4>Where it applies</h4><p>${h(applies)}</p></section>
      ${neighbours.length ? `<section class="o55-insp-block"><h4>Next to it</h4><div class="o55-insp-near">${neighbours.map(s => `<button type="button" data-action="setting-details" data-setting="${a(s.id)}" data-workspace="${a(workspace ? workspace.id : '')}" data-section="${a(section.id)}">${h(PM51.rowLabel(s))}</button>`).join('')}</div></section>` : ''}
      <details class="o55-insp-tech"><summary>${icon('chevron')}<span>For experts</span></summary><div class="o55-insp-techbody"><div><span>Setting name</span><code>${h(setting.id)}</code></div>${Array.isArray(ref.scope) && ref.scope.length ? `<div><span>Scopes</span><code>${h(ref.scope.join(', '))}</code></div>` : ''}${ref.type ? `<div><span>Kind</span><code>${h(ref.type)}</code></div>` : ''}<button type="button" class="o55-textbtn" data-action="o55-copy-id" data-setting="${a(setting.id)}">${icon('copy')}<span>Copy setting name</span></button></div></details>
    </div>`;
};
/* Switching from one setting's Details to another's cross-fades the content; opening and closing stay the engine's. */
const o55InspPopulate = populateDetailInspector;
populateDetailInspector = function () {
  const { inspector } = getDetailNodes();
  if (!inspector || !detailInspectorVisible || o55Still() || !inspector.firstElementChild) return o55InspPopulate.apply(this, arguments);
  const found = findSettingInDomain(state.detailSetting, getDomain()) || findSettingGlobal(state.detailSetting);
  if (!found) return false;
  const tpl = document.createElement('template'); tpl.innerHTML = `<div class="o55-insp-page">${renderDetailInspectorBody(found.setting, found.section, found.workspace)}</div>`;
  const next = tpl.content.firstElementChild;
  let current = inspector.querySelector(':scope > .o55-insp-page');
  if (!current) { current = document.createElement('div'); current.className = 'o55-insp-page'; while (inspector.firstChild) current.appendChild(inspector.firstChild); inspector.appendChild(current); }
  o55Morph(current, next, { host: inspector, dir: 0, dur: 240 });
  return true;
};
function o55InspRefresh(id) {
  refreshSettingRow(id);
  if (state.detailSetting === id) { const { inspector } = getDetailNodes(); const found = findSettingGlobal(id); if (inspector && found) { const page = inspector.querySelector('.o55-insp-page'); const html = renderDetailInspectorBody(found.setting, found.section, found.workspace); if (page) page.innerHTML = html; else inspector.innerHTML = html; } }
}
const o55InspDispatch = dispatchAction;
dispatchAction = function (action, el, event) {
  if (action === 'o55-insp-choose') {
    const id = el.dataset.setting, found = findSettingGlobal(id); if (!found) return;
    const raw = el.dataset.value === '__true' ? true : el.dataset.value === '__false' ? false : el.dataset.value;
    let next = raw;
    if (el.dataset.kind === 'multi') { const cur = [...(settingValue(found.setting) || [])].map(String); const i = cur.indexOf(String(raw)); if (i >= 0) cur.splice(i, 1); else cur.push(String(raw)); next = cur; }
    if (!commitSettingValue(id, next)) return;
    saveState(); o55InspRefresh(id); o55Changed(found.setting, next); return;
  }
  if (action === 'reset-setting') {
    const id = el.dataset.setting, found = findSettingGlobal(id); if (!found || !restoreSettingDefault(id)) return;
    saveState(); o55InspRefresh(id); showToast('Back to the default', `${PM51.rowLabel(found.setting)}: ${PM51.valueText(found.setting, found.setting.value)}.`, 'success', 2400); return;
  }
  if (action === 'o55-copy-id') {
    const id = el.dataset.setting; try { navigator.clipboard && navigator.clipboard.writeText(id); } catch (e) { /* clipboard is optional */ }
    showToast('Copied', id, 'info', 1800); return;
  }
  return o55InspDispatch(action, el, event);
};
