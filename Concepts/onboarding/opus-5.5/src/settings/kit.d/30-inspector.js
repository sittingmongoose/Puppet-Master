/* O55 · the setting Details panel. The panel itself (its spring in and out, its width, the scrim) is the engine's and
   is unchanged; what it says is rebuilt so it answers a newcomer's questions in order:
     where am I (chapter › page), what is it set to now and what the default is (with a way back to it), what does it
     do, what are my choices (each in plain words, the current one ticked, the default and the recommended one marked,
     and clickable), where does it apply, and which settings sit next to it. The technical name is last and folded away.
   The inventory's machine fields (tier, curation flags, "Recommended: false", the raw default as an "example") are
   never shown as prose. Moving between two settings' Details cross-fades instead of snapping.
   A change made while the panel is open (in it, or in the row beside it) updates the panel in place: only the blocks
   whose content changed are swapped, the panel keeps its scroll, its open "For experts" and the focused choice, and
   the value that changed glows once. Nothing is torn down and sprung back in (that was the black flash). */

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
const o55SameValue = (x, y) => (x == null || x === '') && (y == null || y === '') ? true : (typeof x === 'object' || typeof y === 'object') ? JSON.stringify(x) === JSON.stringify(y) : String(x) === String(y);
PM51.sameValue = o55SameValue;
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
  if (control === 'swatches') {
    const opts = (setting.options || []).slice(); if (!opts.length) return null;
    return { kind: 'single', items: opts.map(o => ({ raw: o, label: PM51.valueLabel(setting.id, o), on: String(o) === String(current), marks: mark(o), swatch: o === 'Theme' ? 'var(--o55-theme-accent, var(--accent-primary))' : ((typeof O55_SWATCH === 'object' && O55_SWATCH[o]) || '') })) };
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
  return `<section class="o55-insp-block"><h4>${ch.kind === 'multi' ? 'Choose any' : 'Your choices'}</h4><div class="o55-insp-choices" role="${ch.kind === 'multi' ? 'group' : 'radiogroup'}" aria-label="${a(PM51.rowLabel(setting))}">${ch.items.map(it => `<button type="button" class="o55-insp-choice${it.on ? ' is-on' : ''}" role="${ch.kind === 'multi' ? 'checkbox' : 'radio'}" aria-checked="${it.on}" data-action="o55-insp-choose" data-setting="${a(setting.id)}" data-kind="${ch.kind}" data-value="${a(typeof it.raw === 'boolean' ? (it.raw ? '__true' : '__false') : it.raw)}"><span class="o55-insp-mark">${it.on ? icon('check') : ''}</span>${it.swatch ? `<span class="o55-insp-dot" aria-hidden="true" style="background:${it.swatch}"></span>` : ''}<span class="o55-insp-choice-copy"><span class="o55-insp-choice-label">${h(it.label)}${it.marks.map(m => `<em>${h(m)}</em>`).join('')}</span>${it.hint ? `<span class="o55-insp-choice-hint">${h(it.hint)}</span>` : ''}</span></button>`).join('')}</div></section>`;
}
renderDetailInspectorBody = function (setting, section, workspace) {
  const row = O55R[setting.id] || {};
  const ref = O55_REF.get(setting.id) || {};
  const d = setting.detail || {};
  const current = settingValue(setting);
  /* "is it the default" is decided by the value, not by whether it was ever touched: choosing the default again
     reads as the default */
  const isDefault = o55SameValue(current, setting.value);
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
      <section class="o55-insp-now${isDefault ? '' : ' is-changed'}" data-o55-now="${a(JSON.stringify(current == null ? null : current))}">
        <div class="o55-insp-now-label">${isDefault ? 'Set to the default' : 'You changed this'}</div>
        <div class="o55-insp-now-value">${h(nowText)}</div>
        <div class="o55-insp-now-foot">${isDefault
          ? `<span class="o55-insp-isdef">${icon('check')}<span>This is the default</span></span>`
          : `<span>Default: <strong>${h(defText)}</strong></span><button type="button" class="o55-textbtn" data-action="reset-setting" data-setting="${a(setting.id)}">${icon('restore')}<span>Go back to the default</span></button>`}</div>
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
/* Update the open panel in place. The fresh body is compared block by block with what is on screen; a block that
   differs is swapped (a disclosure keeps its open state, a focused choice keeps focus), the others are left alone, so
   the panel never loses its scroll or blinks. A block whose value changed glows once (not with reduced motion). */
function o55InspPatch(page, html) {
  const tpl = document.createElement('template'); tpl.innerHTML = html;
  const nextHead = tpl.content.querySelector(':scope > .detail-head'), nextBody = tpl.content.querySelector(':scope > .detail-body');
  const head = page.querySelector(':scope > .detail-head'), body = page.querySelector(':scope > .detail-body');
  if (!nextHead || !nextBody || !head || !body) { page.innerHTML = html; return; }
  if (head.outerHTML !== nextHead.outerHTML) head.replaceWith(nextHead);
  const olds = [...body.children], news = [...nextBody.children];
  const sameShape = olds.length === news.length && olds.every((n, i) => n.tagName === news[i].tagName && n.className.split(' ')[0] === news[i].className.split(' ')[0]);
  if (!sameShape) { const top = body.scrollTop; body.replaceWith(nextBody); nextBody.scrollTop = top; return; }
  const act = document.activeElement;
  olds.forEach((o, i) => {
    const n = news[i];
    if (o.tagName === 'DETAILS') { if (o.open) n.setAttribute('open', ''); else n.removeAttribute('open'); }
    if (o.outerHTML === n.outerHTML) return;
    const focused = act && o.contains(act) ? act : null;
    const valueMoved = o.dataset && n.dataset && o.dataset.o55Now !== undefined && o.dataset.o55Now !== n.dataset.o55Now;
    o.replaceWith(n);
    if (focused) {
      const key = ['data-action', 'data-value', 'data-setting'].filter(k => focused.hasAttribute(k)).map(k => `[${k}="${cssEscape(focused.getAttribute(k))}"]`).join('');
      let again = (key && n.querySelector(key)) || n.querySelector('button, [tabindex]');
      if (!again) { n.tabIndex = -1; again = n; }
      try { again.focus({ preventScroll: true }); } catch (e) { again.focus(); }
    }
    if (valueMoved && !o55Still()) n.animate([{ boxShadow: '0 0 0 3px color-mix(in srgb, var(--k3-accent) 45%, transparent)' }, { boxShadow: '0 0 0 0 transparent' }], { duration: 700, easing: 'ease-out' });
  });
}
PM51.syncInspector = function () {
  if (!state.detailSetting || !detailInspectorVisible) return false;
  const { inspector } = getDetailNodes(); if (!inspector) return false;
  const found = findSettingInDomain(state.detailSetting, getDomain()) || findSettingGlobal(state.detailSetting); if (!found) return false;
  let page = inspector.querySelector(':scope > .o55-insp-page:not(.o55-leaving)');
  if (!page) { page = document.createElement('div'); page.className = 'o55-insp-page'; while (inspector.firstChild) page.appendChild(inspector.firstChild); inspector.appendChild(page); }
  o55InspPatch(page, renderDetailInspectorBody(found.setting, found.section, found.workspace));
  try { syncDetailButtonStates(); } catch (e) { /* the About buttons' pressed state is cosmetic */ }
  return true;
};
/* Any saved change (a row's dropdown, a switch, a number, a reset, a manager's own control) refreshes the panel once,
   on the next frame, while it is open. A value set back to its default no longer counts as changed. */
let o55InspFrame = 0;
const o55InspSoon = () => { if (o55InspFrame || !detailInspectorVisible) return; o55InspFrame = requestAnimationFrame(() => { o55InspFrame = 0; PM51.syncInspector(); }); };
const o55InspCommit = commitSettingValue;
commitSettingValue = function (id, value) {
  const ok = o55InspCommit.apply(this, arguments);
  if (ok && state.changed && state.changed[id]) { const f = findSettingGlobal(id); if (f && o55SameValue(state.settings[id], f.setting.value)) delete state.changed[id]; }
  if (ok) o55InspSoon();
  return ok;
};
const o55InspRestore = restoreSettingDefault;
restoreSettingDefault = function () { const ok = o55InspRestore.apply(this, arguments); if (ok) o55InspSoon(); return ok; };
function o55InspRefresh(id) {
  refreshSettingRow(id);
  PM51.syncInspector();
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
