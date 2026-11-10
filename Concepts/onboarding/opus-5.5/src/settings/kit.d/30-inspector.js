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
    return { kind: 'single', items: opts.map(o => ({ raw: o, label: PM51.valueLabel(setting.id, o), hint: PM51.valueHint(setting.id, o), on: String(o) === String(current), marks: mark(o), why: PM51.choiceReason(setting.id, o, current) })) };
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
/* FO-127 (Jared, 2026-11-09 #2): "Shouldnt the your choices list be a drop down rather than listing every model down
   the page? you could use the model selector from assistant chat." A model choice, or any single choice with more than
   O55_PICK_AT choices, is one picker button instead of a list. It is the chat's picker (5.6 Pro): the
   shared-picker-button trigger (the maker's mark, the name, a small line, the chevron) and the model menu (a search
   head, the makers rail, a section per maker, one row per model with the maker's mark from PM56_PICKERS.providerMark),
   drawn through Settings' own popout (kit.js openListPopout's entry, keys, placement and sprout), so it keeps
   Settings' looks, keyboard and screen-reader rules. Short lists (On/Off, the five themes) stay a list.
   PROTOTYPE (phase 1, for Jared's pick): html[data-fo127] a = the chat's menu, floating; b = the same rows unfolding
   in the panel; list = the old list. ?fo127=a|b|list sets it at load. */
const O55_PICK_AT = 6;
const O55_BRANDS = { anthropic: 'Anthropic', 'anthropic-api': 'Anthropic', 'claude-code': 'Anthropic', openai: 'OpenAI', 'openai-codex': 'OpenAI', gemini: 'Google', google: 'Google', 'qwen-coding': 'Alibaba', 'qwen-token': 'Alibaba', alibaba: 'Alibaba', 'kimi-coding': 'Moonshot', moonshot: 'Moonshot', 'zai-coding': 'z.ai', zai: 'z.ai', 'cursor-cli': 'Cursor', cursor: 'Cursor', 'free-models': 'Free routes', opencode: 'OpenCode' };
(() => {
  try {
    const q = new URLSearchParams(location.search), r = document.documentElement;
    if (!r.dataset.fo127) r.dataset.fo127 = ['b', 'list'].includes(q.get('fo127')) ? q.get('fo127') : 'a';
    if (!r.dataset.fo127Icon) r.dataset.fo127Icon = ['c', 'old'].includes(q.get('fo127icon')) ? q.get('fo127icon') : 'b';
  } catch (e) { /* no location in a bare harness */ }
})();
const o55PickVariant = () => document.documentElement.dataset.fo127 || 'a';
const o55IsModelChoice = (setting, items) => /^ai\.models\..*-model$/.test(setting.id) || /(^|\.)default-model$/.test(setting.id) || (items.length > 1 && items.every(it => /^[\w.-]+\/[\w.:-]+$/.test(String(it.raw))));
const o55UsesPicker = (setting, ch) => !!ch && ch.kind === 'single' && o55PickVariant() !== 'list' && (o55IsModelChoice(setting, ch.items) || ch.items.length > O55_PICK_AT);
/* the chat's maker mark (PM56_PICKERS.providerMark draws its PROVIDER_MARKS; an unknown maker gets the chat's sparkle),
   or the maker's first letter when the chat is not in the page */
function o55BrandMark(brand, size) {
  const P = window.PM56_PICKERS;
  if (brand === 'Free routes') return icon('route');
  if (P && typeof P.providerMark === 'function' && brand) { try { return P.providerMark(brand, size); } catch (e) { /* fall through */ } }
  return `<b class="o55-pick-letter">${h(String(brand || '?').charAt(0))}</b>`;
}
function o55PickModel(setting, ch) {
  const model = o55IsModelChoice(setting, ch.items);
  const items = ch.items.map((it, i) => {
    const raw = String(it.raw), slash = model ? raw.indexOf('/') : -1, pid = slash > 0 ? raw.slice(0, slash) : '';
    const brand = model ? (O55_BRANDS[pid] || pid.replace(/[-_]+/g, ' ').replace(/^./, c => c.toUpperCase())) : '';
    const parts = String(it.label).split(' · ');
    const name = model && parts.length > 1 ? parts.slice(0, -1).join(' · ') : String(it.label);
    return Object.assign({}, it, { index: i, brand, name, sub: it.why || it.hint || '' });
  });
  /* one section per maker, makers in the order they first appear (the inventory's examples first), as the chat
     groups its menu; data-index stays the choice's own index */
  const brands = model ? [...new Set(items.map(x => x.brand))] : [];
  const rows = model ? brands.flatMap(b => items.filter(x => x.brand === b)) : items;
  return { model, items: rows, brands, current: rows.find(x => x.on) || null };
}
function o55PickTrigger(setting, pm) {
  const cur = pm.current, label = PM51.rowLabel(setting);
  const name = cur ? cur.name : PM51.valueText(setting, settingValue(setting));
  const marks = cur ? cur.marks : [];
  const sub = cur ? [pm.model ? cur.brand : '', cur.sub].filter(Boolean).join(' · ') : '';
  return `<button type="button" class="o55-pick-trigger${pm.model ? ' is-model' : ''}" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-label="${a(`${label}: ${name}${marks.length ? ', ' + marks.join(', ') : ''}`)}" data-action="o55-insp-pick" data-setting="${a(setting.id)}">${pm.model ? `<span class="o55-pick-mark" aria-hidden="true">${o55BrandMark(cur ? cur.brand : '', 16)}</span>` : ''}<span class="o55-pick-copy"><strong>${h(name)}${marks.map(m => `<em>${h(m)}</em>`).join('')}</strong>${sub ? `<small>${h(sub)}</small>` : ''}</span><span class="o55-pick-chev" aria-hidden="true">${icon('down')}</span></button>`;
}
function o55PickItems(pm, idBase) {
  let html = '', last = null;
  pm.items.forEach(it => {
    if (pm.model && it.brand !== last) { html += `<div class="pm51-popout-group o55-pick-group" role="presentation" data-brand="${a(it.brand)}">${h(it.brand)}</div>`; last = it.brand; }
    html += `<div class="pm51-popout-item o55-pick-item${it.why ? ' has-why' : ''}${pm.model ? ' is-model' : ''}" role="option" id="${idBase}-${it.index}" data-index="${it.index}" data-brand="${a(it.brand)}" aria-selected="${it.on}"${it.why ? ` aria-disabled="true" data-disabled-reason="${a(it.why)}"` : ''}>${pm.model ? `<span class="o55-pick-mark" aria-hidden="true">${o55BrandMark(it.brand, 15)}</span>` : ''}<span class="o55-pick-copy"><strong>${h(it.name)}${it.marks.map(m => `<em>${h(m)}</em>`).join('')}</strong>${it.sub ? `<small>${h(it.sub)}</small>` : ''}</span><span class="o55-pick-tick" aria-hidden="true">${it.on ? icon('check') : ''}</span></div>`;
  });
  return html + '<div class="pm51-popout-empty" hidden>No matches</div>';
}
/* search and the maker filter together; a maker's section hides with its last row */
function o55PickFilter(entry, root) {
  const q = String(entry.searchInput.value || '').trim().toLowerCase();
  let any = false;
  root.querySelectorAll('[role="option"]').forEach(n => { const hit = (!entry.brand || n.dataset.brand === entry.brand) && (!q || `${n.textContent} ${n.dataset.brand || ''}`.toLowerCase().includes(q)); n.hidden = !hit; if (hit) any = true; });
  root.querySelectorAll('.o55-pick-group').forEach(g => { g.hidden = !root.querySelector(`[role="option"][data-brand="${cssEscape(g.dataset.brand)}"]:not([hidden])`); });
  const empty = root.querySelector('.pm51-popout-empty'); if (empty) empty.hidden = any;
  const first = [...root.querySelectorAll('[role="option"]')].find(n => !n.hidden && n.getAttribute('aria-disabled') !== 'true');
  if (first) setActiveOption(entry, Number(first.dataset.index), true); else entry.active = -1;
}
function o55PickCommit(id, raw) {
  const found = findSettingGlobal(id); if (!found) return;
  if (o55SameValue(settingValue(found.setting), raw)) return;
  if (!commitSettingValue(id, raw)) return;
  saveState(); o55InspRefresh(id); o55Changed(found.setting, raw);
}
const o55PickOptions = pm => { const o = []; pm.items.forEach(it => { o[it.index] = { value: it.raw, label: it.name, disabled: !!it.why, reason: it.why || '' }; }); return o; };
const o55PickBrands = (pm, size, cls) => [`<button type="button" class="${cls} is-on" data-brand="" aria-pressed="true" tabindex="-1" aria-label="All makers" data-pm-hover-label="All makers">${icon('users')}</button>`]
  .concat(pm.brands.map(b => `<button type="button" class="${cls}" data-brand="${a(b)}" aria-pressed="false" tabindex="-1" aria-label="${a(b)}" data-pm-hover-label="${a(b)}">${o55BrandMark(b, size)}</button>`)).join('');
/* a: the chat's model menu, floating from the trigger (Settings' popout entry: Escape, Tab, outside press, scroll and
   resize behave as every Settings dropdown does) */
function o55PickPopOpen(trigger, setting, pm) {
  if (pmActive && pmActive.trigger === trigger) { popoutClose({ restoreFocus: true }); return; }
  popoutClose({ restoreFocus: false });
  const label = PM51.rowLabel(setting), rail = pm.model && pm.brands.length > 1;
  const pop = document.createElement('div'); pop.className = 'pm51-popout o55-pick-pop' + (rail ? ' has-rail' : ''); pop.id = POP_ID(); pop.dataset.portalDisplay = 'block';
  const listId = pop.id + '-list';
  pop.innerHTML = `<div class="o55-pick-grid">${rail ? `<div class="o55-pick-rail" role="group" aria-label="Show models from">${o55PickBrands(pm, 16, 'o55-pick-railbtn')}</div>` : ''}<div class="o55-pick-main"><div class="pm51-popout-search">${icon('search')}<input type="search" role="combobox" aria-autocomplete="list" aria-controls="${listId}" aria-expanded="true" aria-label="${a('Filter ' + label)}" placeholder="${a(pm.model ? 'Search models…' : 'Search choices…')}"/></div><div class="o55-pick-list" role="listbox" id="${listId}" aria-label="${a(label)}">${o55PickItems(pm, pop.id)}</div></div></div>`;
  document.body.appendChild(pop);
  const entry = { kind: 'pick', el: pop, trigger, anchor: trigger, options: o55PickOptions(pm), current: pm.current ? pm.current.raw : null, onCommit: value => o55PickCommit(setting.id, value), active: -1, searchInput: pop.querySelector('input'), typeBuf: '', typeAt: 0, returnFocus: trigger, align: 'left', width: Math.max(300, Math.ceil(trigger.getBoundingClientRect().width)), brand: '' };
  pmActive = entry;
  positionPopout(pop, trigger, { width: entry.width });
  sproutOpen(pop, trigger);
  trigger.setAttribute('aria-expanded', 'true'); trigger.setAttribute('aria-controls', listId);
  const sel = pm.items.find(x => x.on), first = pm.items.find(x => !x.why);
  setActiveOption(entry, (sel || first || { index: -1 }).index, true);
  pop.addEventListener('pointermove', e => { const it = e.target.closest('[role="option"]'); if (it && Number(it.dataset.index) !== entry.active) setActiveOption(entry, Number(it.dataset.index), false); });
  pop.addEventListener('click', e => {
    const rb = e.target.closest('.o55-pick-railbtn');
    if (rb) {
      e.preventDefault(); entry.brand = rb.dataset.brand || '';
      pop.querySelectorAll('.o55-pick-railbtn').forEach(b => { const on = b === rb; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
      o55PickFilter(entry, pop); positionPopout(pop, trigger, { width: entry.width }); entry.searchInput.focus({ preventScroll: true }); return;
    }
    const it = e.target.closest('[role="option"]'); if (!it) return; e.preventDefault(); commitOption(entry, Number(it.dataset.index));
  });
  entry.searchInput.addEventListener('input', () => { o55PickFilter(entry, pop); positionPopout(pop, trigger, { width: entry.width }); });
  requestAnimationFrame(() => { if (pmActive === entry) entry.searchInput.focus({ preventScroll: true }); });
}
/* b: the same rows unfolding in the panel under the trigger, with the makers as a strip (the panel is too narrow for
   a rail beside the list); its own keys, since it is not a popout: arrows, Page Up/Down, Home/End, Enter, Escape */
let o55Inline = null;
function o55InlineClose(focusTrigger) {
  const e = o55Inline; if (!e) return; o55Inline = null;
  if (e.trigger.isConnected) { e.trigger.setAttribute('aria-expanded', 'false'); e.trigger.removeAttribute('aria-controls'); }
  e.box.remove();
  if (focusTrigger && e.trigger.isConnected) { try { e.trigger.focus({ preventScroll: true }); } catch (err) { e.trigger.focus(); } }
}
function o55InlineOpen(trigger, setting, pm) {
  if (o55Inline && o55Inline.trigger === trigger) { o55InlineClose(true); return; }
  o55InlineClose(false); popoutClose({ restoreFocus: false });
  const label = PM51.rowLabel(setting), id = POP_ID();
  const box = document.createElement('div'); box.className = 'o55-pick-inline';
  box.innerHTML = `${pm.model && pm.brands.length > 1 ? `<div class="o55-pick-chips" role="group" aria-label="Show models from">${o55PickBrands(pm, 14, 'o55-pick-chip')}</div>` : ''}<div class="pm51-popout-search o55-pick-search">${icon('search')}<input type="search" role="combobox" aria-autocomplete="list" aria-controls="${id}-list" aria-expanded="true" aria-label="${a('Filter ' + label)}" placeholder="${a(pm.model ? 'Search models…' : 'Search choices…')}"/></div><div class="o55-pick-list" role="listbox" id="${id}-list" aria-label="${a(label)}">${o55PickItems(pm, id)}</div>`;
  box.querySelectorAll('.o55-pick-chip').forEach(b => b.removeAttribute('tabindex'));
  trigger.insertAdjacentElement('afterend', box);
  const list = box.querySelector('.o55-pick-list');
  const entry = { el: list, trigger, options: o55PickOptions(pm), active: -1, searchInput: box.querySelector('input'), brand: '' };
  o55Inline = { box, trigger, entry };
  trigger.setAttribute('aria-expanded', 'true'); trigger.setAttribute('aria-controls', id + '-list');
  const pick = index => { const o = entry.options[index]; if (!o) return; if (o.disabled) { showToast('Not available', o.reason || 'Not available here.', 'info', 2600); return; } o55InlineClose(true); o55PickCommit(setting.id, o.value); };
  const sel = pm.items.find(x => x.on), first = pm.items.find(x => !x.why);
  setActiveOption(entry, (sel || first || { index: -1 }).index, false);
  const node = list.querySelector(`[data-index="${entry.active}"]`);
  if (node) { const lr = list.getBoundingClientRect(), nr = node.getBoundingClientRect(); list.scrollTop = Math.max(0, list.scrollTop + nr.top - lr.top - (lr.height - nr.height) / 2); }
  /* the unfolded list is brought into the panel's view, instantly (the panel scroll is not an animation) */
  const body = box.closest('.o55-insp-body');
  if (body) { const br = body.getBoundingClientRect(), xr = box.getBoundingClientRect(), over = xr.bottom + 12 - br.bottom; if (over > 0) body.scrollTop += Math.min(over, Math.max(0, trigger.getBoundingClientRect().top - br.top - 8)); }
  box.addEventListener('pointermove', e => { const it = e.target.closest('[role="option"]'); if (it && Number(it.dataset.index) !== entry.active) setActiveOption(entry, Number(it.dataset.index), false); });
  box.addEventListener('click', e => {
    const chip = e.target.closest('.o55-pick-chip');
    if (chip) { e.preventDefault(); e.stopPropagation(); entry.brand = chip.dataset.brand || ''; box.querySelectorAll('.o55-pick-chip').forEach(b => { const on = b === chip; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); }); o55PickFilter(entry, list); return; }
    const it = e.target.closest('[role="option"]'); if (!it) return; e.preventDefault(); e.stopPropagation(); pick(Number(it.dataset.index));
  });
  entry.searchInput.addEventListener('input', () => o55PickFilter(entry, list));
  box.addEventListener('keydown', e => {
    const k = e.key, stop = () => { e.preventDefault(); e.stopPropagation(); };
    if (k === 'Escape') { stop(); o55InlineClose(true); return; }
    if (e.target.closest('.o55-pick-chip') && (k === 'Enter' || k === ' ')) return;
    if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'PageDown' || k === 'PageUp') { stop(); moveActive(entry, { ArrowDown: 1, ArrowUp: -1, PageDown: 8, PageUp: -8 }[k]); return; }
    if ((k === 'Home' || k === 'End') && e.target !== entry.searchInput) { stop(); moveActive(entry, 0, k === 'Home' ? 'home' : 'end'); return; }
    if (k === 'Enter' && entry.active >= 0) { stop(); pick(entry.active); }
  });
  box.addEventListener('focusout', () => { requestAnimationFrame(() => { if (o55Inline && o55Inline.box === box && !box.contains(document.activeElement) && document.activeElement !== trigger) o55InlineClose(false); }); });
  requestAnimationFrame(() => { if (o55Inline && o55Inline.box === box) entry.searchInput.focus({ preventScroll: true }); });
  if (!o55Still()) box.classList.add('is-entering');
}
document.addEventListener('pointerdown', e => { const p = o55Inline; if (!p) return; if (p.box.contains(e.target) || p.trigger.contains(e.target)) return; o55InlineClose(false); }, true);
/* the trigger is a combobox: Arrow Down (or Alt+Arrow Down) opens it, as it does a Settings dropdown */
document.addEventListener('keydown', e => {
  const t = e.target && e.target.closest && e.target.closest('.o55-pick-trigger'); if (!t || e.key !== 'ArrowDown' || t.getAttribute('aria-expanded') === 'true') return;
  e.preventDefault(); e.stopPropagation(); t.click();
}, true);
function o55PickerHtml(setting, ch) {
  const pm = o55PickModel(setting, ch);
  const count = pm.model ? `${pm.items.length} models from ${pm.brands.length} makers` : `${pm.items.length} choices`;
  return `<section class="o55-insp-block o55-pick-block"><h4>Your choices <span class="o55-pick-count">· ${h(count)}</span></h4>${o55PickTrigger(setting, pm)}</section>`;
}
function o55ChoicesHtml(setting, ch) {
  if (!ch) return '';
  if (o55UsesPicker(setting, ch)) return o55PickerHtml(setting, ch);
  return `<section class="o55-insp-block"><h4>${ch.kind === 'multi' ? 'Choose any' : 'Your choices'}</h4><div class="o55-insp-choices" role="${ch.kind === 'multi' ? 'group' : 'radiogroup'}" aria-label="${a(PM51.rowLabel(setting))}">${ch.items.map(it => `<button type="button" class="o55-insp-choice${it.on ? ' is-on' : ''}" role="${ch.kind === 'multi' ? 'checkbox' : 'radio'}" aria-checked="${it.on}" data-action="o55-insp-choose" data-setting="${a(setting.id)}" data-kind="${ch.kind}" data-value="${a(typeof it.raw === 'boolean' ? (it.raw ? '__true' : '__false') : it.raw)}"${it.why ? ` aria-disabled="true" data-disabled-reason="${a(it.why)}"` : ''}><span class="o55-insp-mark">${it.on ? icon('check') : ''}</span>${it.swatch ? `<span class="o55-insp-dot" aria-hidden="true" style="background:${it.swatch}"></span>` : ''}<span class="o55-insp-choice-copy"><span class="o55-insp-choice-label">${h(it.label)}${it.marks.map(m => `<em>${h(m)}</em>`).join('')}</span>${it.why || it.hint ? `<span class="o55-insp-choice-hint">${h(it.why || it.hint)}</span>` : ''}</span></button>`).join('')}</div></section>`;
}
/* FO-127 (moved from FO-122, Jared #1: "that logo looks terrible", on most right-side panels): the head tile of the
   Details panel and of every Settings side panel (PM51.panel's hero). PROTOTYPE (phase 1): html[data-fo127-icon]
   b = the PM glyph (PMG, the shell's neon set, as the rail draws it) in a quiet tile; c = the settings glyph reweighted
   in a quiet tile; old = as before. ?fo127icon=b|c|old sets it at load. */
const O55_PMG_NAMES = { memory: 'database', system: 'server', archive: 'vault', brackets: 'puzzle', test: 'flask', map: 'route', branch: 'branch' };
function o55HeadGlyph(name, size) {
  const G = window.PMG;
  if (document.documentElement.dataset.fo127Icon === 'b' && G && typeof G.icon === 'function' && typeof G.has === 'function') {
    const n = [O55_PMG_NAMES[name], name].find(x => x && G.has(x));
    if (n) { try { return `<span class="icon o55-head-pmg">${G.icon(n, size || 20)}</span>`; } catch (e) { /* fall back to the settings glyph */ } }
  }
  return icon(name);
}
PM51.headGlyph = o55HeadGlyph;
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
      <span class="o55-insp-icon">${o55HeadGlyph(iconName, 20)}</span>
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
    /* a held-back choice (PM51.choiceBlock) says why and changes nothing */
    if (el.getAttribute('aria-disabled') === 'true') { showToast('Not available', el.dataset.disabledReason || 'Not available here.', 'info', 2600); return; }
    const id = el.dataset.setting, found = findSettingGlobal(id); if (!found) return;
    const raw = el.dataset.value === '__true' ? true : el.dataset.value === '__false' ? false : el.dataset.value;
    let next = raw;
    if (el.dataset.kind === 'multi') { const cur = [...(settingValue(found.setting) || [])].map(String); const i = cur.indexOf(String(raw)); if (i >= 0) cur.splice(i, 1); else cur.push(String(raw)); next = cur; }
    if (!commitSettingValue(id, next)) return;
    saveState(); o55InspRefresh(id); o55Changed(found.setting, next); return;
  }
  if (action === 'o55-insp-pick') {
    const found = findSettingGlobal(el.dataset.setting); if (!found) return;
    const ch = o55ChoicesFor(found.setting, settingValue(found.setting)); if (!ch) return;
    (o55PickVariant() === 'b' ? o55InlineOpen : o55PickPopOpen)(el, found.setting, o55PickModel(found.setting, ch)); return;
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
