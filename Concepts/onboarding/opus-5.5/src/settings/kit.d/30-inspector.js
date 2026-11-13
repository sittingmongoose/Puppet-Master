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
  global: 'Everywhere, unless a project sets its own',   /* FO-131, P's rule: a value says Everywhere, then the levels its row offers */
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
   the page? you could use the model selector from assistant chat." Jared's pick (2026-11-10, "option b"): a model
   setting's Your choices is one picker button, the chat's (5.6 Pro shared-picker-button: the maker's mark, the name, a
   small line, the chevron), and it opens the chat model menu's rows (since FO-178 in a popup over the panel, o55PopOpen
   below; they first unfolded inside it): a strip of maker
   marks (the chat menu's rail, laid flat for the narrow panel), a search box, one section per maker, one row per model
   with the maker's mark (PM56_PICKERS.providerMark), where it runs, the Default/Recommended tags and the tick. Which
   lists, by id, exactly as Jared chose them: the 13 model settings (option B, 2026-11-10) and the 11 long single-choice
   lists of question 3 ("looks good, I choose all 11", 2026-11-11), those without the maker strip. No rule widens it:
   every other list, however long (Terminal colors, How it talks and the rest), stays a tick list until he says so. */
const O55_PICK_MODELS = new Set(['ai.models.default-model', 'ai.models.overseer-model', 'ai.models.worker-model', 'ai.models.gui-worker-model', 'ai.models.high-effort-worker-model', 'ai.models.auditor-model', 'ai.models.teach-model', 'ai.models.goal-worker-model', 'ai.models.goal-verifier-model', 'ai.models.subagent-model', 'ai.models.thread-title-model', 'ai.models.per-lane-model', 'personas.tuning.default-model']);
const O55_PICK_LISTS = new Set(['code.terminal.background-image', 'code.editing.color-scheme', 'ai.models.default-provider', 'code.terminal.background-gradient', 'general.visual.theme', 'planning.verification.goal-template', 'code.terminal.bezel-material', 'personas.library.default-persona', 'personas.library.active-persona', 'general.visual.nier-background', 'media.image.provider']);
const O55_BRANDS = { anthropic: 'Anthropic', 'anthropic-api': 'Anthropic', 'claude-code': 'Anthropic', openai: 'OpenAI', 'openai-codex': 'OpenAI', gemini: 'Google', google: 'Google', 'qwen-coding': 'Alibaba', 'qwen-token': 'Alibaba', alibaba: 'Alibaba', 'kimi-coding': 'Moonshot', moonshot: 'Moonshot', 'zai-coding': 'z.ai', zai: 'z.ai', 'cursor-cli': 'Cursor', cursor: 'Cursor', 'free-models': 'Free routes', opencode: 'OpenCode' };
const o55IsModelChoice = setting => O55_PICK_MODELS.has(setting.id);
const o55UsesPicker = (setting, ch) => !!ch && ch.kind === 'single' && (O55_PICK_MODELS.has(setting.id) || O55_PICK_LISTS.has(setting.id));
/* the chat's maker mark (PM56_PICKERS.providerMark draws its PROVIDER_MARKS; an unknown maker gets the chat's sparkle),
   or the maker's first letter when the chat is not in the page */
function o55BrandMark(brand, size) {
  const P = window.PM56_PICKERS;
  if (brand === 'Free routes') return icon('route');
  if (P && typeof P.providerMark === 'function' && brand) { try { return P.providerMark(brand, size); } catch (e) { /* fall through */ } }
  return `<b class="o55-pick-letter">${h(String(brand || '?').charAt(0))}</b>`;
}
/* The choices the picker shows, and how it saves. A per-thing setting (a persona's Preferred model, a Goal template's
   Kind of job) asks its owner (kit.d/45-scoped.js PM51.pickSource): from one thing's own row it shows that row's own
   choices and saves through that row; opened any other way it is read only ("What it can be"), as the old buttons were.
   Every other setting keeps its inventory choices and the global save. */
function o55PickSource(setting, ch) {
  const src = PM51.pickSource ? PM51.pickSource(setting) : null;
  if (!src) return { ch, src: null };
  if (src.static) return { ch: { kind: 'single', items: ch.items.map(it => Object.assign({}, it, { on: false, why: '', off: true, reason: src.reason })) }, src };
  return { ch: { kind: 'single', items: src.items.map(it => Object.assign({ marks: [] }, it)) }, src };
}
function o55PickModel(setting, ch, src) {
  const model = o55IsModelChoice(setting);
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
  return { model, items: rows, brands, current: rows.find(x => x.on) || null, static: !!(src && src.static), reason: src && src.static ? src.reason : '' };
}
function o55PickTrigger(setting, pm) {
  const cur = pm.current, label = PM51.rowLabel(setting);
  /* read only: it names no current value (each thing has its own, listed above) */
  const name = pm.static ? `See the ${pm.items.length} choices` : cur ? cur.name : PM51.valueText(setting, settingValue(setting));
  const marks = cur ? cur.marks : [];
  const sub = pm.static ? pm.reason : cur ? [pm.model ? cur.brand : '', cur.sub].filter(Boolean).join(' · ') : '';
  return `<button type="button" class="o55-pick-trigger${pm.model ? ' is-model' : pm.current && pm.current.swatch ? ' has-dot' : ''}" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-label="${a(`${label}: ${name}${marks.length ? ', ' + marks.join(', ') : ''}`)}" data-action="o55-insp-pick" data-setting="${a(setting.id)}">${pm.model ? `<span class="o55-pick-mark" aria-hidden="true">${o55BrandMark(cur ? cur.brand : '', 16)}</span>` : cur && cur.swatch ? `<span class="o55-insp-dot" aria-hidden="true" style="background:${cur.swatch}"></span>` : ''}<span class="o55-pick-copy"><strong>${h(name)}${marks.map(m => `<em>${h(m)}</em>`).join('')}</strong>${sub ? `<small>${h(sub)}</small>` : ''}</span><span class="o55-pick-chev" aria-hidden="true">${icon('down')}</span></button>`;
}
function o55PickItems(pm, idBase) {
  let html = '', last = null;
  pm.items.forEach(it => {
    if (pm.model && it.brand !== last) { html += `<div class="pm51-popout-group o55-pick-group" role="presentation" data-brand="${a(it.brand)}">${h(it.brand)}</div>`; last = it.brand; }
    html += `<div class="pm51-popout-item o55-pick-item${it.why ? ' has-why' : ''}${pm.model ? ' is-model' : it.swatch ? ' has-dot' : ''}" role="option" id="${idBase}-${it.index}" data-index="${it.index}" data-brand="${a(it.brand)}" aria-selected="${it.on}"${it.why || it.off ? ` aria-disabled="true" data-disabled-reason="${a(it.why || it.reason)}"` : ''}>${pm.model ? `<span class="o55-pick-mark" aria-hidden="true">${o55BrandMark(it.brand, 15)}</span>` : it.swatch ? `<span class="o55-insp-dot" aria-hidden="true" style="background:${it.swatch}"></span>` : ''}<span class="o55-pick-copy"><strong>${h(it.name)}${it.marks.map(m => `<em>${h(m)}</em>`).join('')}</strong>${it.sub ? `<small>${h(it.sub)}</small>` : ''}</span><span class="o55-pick-tick" aria-hidden="true">${it.on ? icon('check') : ''}</span></div>`;
  });
  return html + '<div class="pm51-popout-empty" hidden>No matches</div>';
}
/* The active row, kept wholly inside the popup's own scroll box: its list. kit.js's setActiveOption scrolls by offsetTop
   with a pad for a popout's sticky search; here the maker strip and the search sit above the list, which is the only
   scroller, so the row is placed in the list's own layout box (the list is the rows' offsetParent). Layout boxes are not
   scaled by the sprout, so a key pressed while the popup is still growing moves the list as far as one pressed after it
   (FO-127's walk: Arrow Up and every step under Reduced Motion had left the row out of view; FO-178 keeps it in the popup,
   which never runs past the window, so no scroller outside it has to move). */
function o55PopActive(entry, index) {
  setActiveOption(entry, index, false);
  const list = entry.el, node = list.querySelector(`[role="option"][data-index="${index}"]`); if (!node) return;
  const m = 4, top = node.offsetTop, bottom = top + node.offsetHeight;
  if (top - m < list.scrollTop) list.scrollTop = Math.max(0, top - m);
  else if (bottom + m > list.scrollTop + list.clientHeight) list.scrollTop = bottom + m - list.clientHeight;
}
function o55PopMove(entry, delta, edge) {
  const nodes = [...entry.el.querySelectorAll('[role="option"]')].filter(n => !n.hidden && n.getAttribute('aria-disabled') !== 'true');
  if (!nodes.length) return;
  let i = nodes.findIndex(n => Number(n.dataset.index) === entry.active);
  if (edge === 'home') i = 0; else if (edge === 'end') i = nodes.length - 1;
  else i = Math.max(0, Math.min(nodes.length - 1, (i < 0 ? (delta > 0 ? -1 : nodes.length) : i) + delta));
  o55PopActive(entry, Number(nodes[i].dataset.index));
}
/* search and the maker filter together; a maker's section hides with its last row. The popup keeps where it was placed
   (one that opened over its trigger keeps its bottom edge, as the chat's model picker does) and, when its height
   changed, springs it with the menu sprout's size bounce, as every popout does under a filter (none under Reduced Motion) */
function o55PickFilter(entry, root) {
  const before = entry.pop ? entry.pop.offsetHeight : 0;
  o55PickFilterRows(entry, root);
  if (entry.pop && Math.abs(entry.pop.offsetHeight - before) > 4 && window.PM6_SPROUT && PM6_SPROUT.bounce) PM6_SPROUT.bounce(entry.pop);
}
function o55PickFilterRows(entry, root) {
  const q = String(entry.searchInput.value || '').trim().toLowerCase();
  let any = false;
  root.querySelectorAll('[role="option"]').forEach(n => { const hit = (!entry.brand || n.dataset.brand === entry.brand) && (!q || `${n.textContent} ${n.dataset.brand || ''}`.toLowerCase().includes(q)); n.hidden = !hit; if (hit) any = true; });
  root.querySelectorAll('.o55-pick-group').forEach(g => { g.hidden = !root.querySelector(`[role="option"][data-brand="${cssEscape(g.dataset.brand)}"]:not([hidden])`); });
  const empty = root.querySelector('.pm51-popout-empty'); if (empty) empty.hidden = any;
  const first = [...root.querySelectorAll('[role="option"]')].find(n => !n.hidden && n.getAttribute('aria-disabled') !== 'true');
  if (first) { entry.el.scrollTop = 0; o55PopActive(entry, Number(first.dataset.index)); } else entry.active = -1;
}
function o55PickCommit(id, raw) {
  const found = findSettingGlobal(id); if (!found) return;
  if (o55SameValue(settingValue(found.setting), raw)) return;
  if (!commitSettingValue(id, raw)) return;
  saveState(); o55InspRefresh(id); o55Changed(found.setting, raw);
  o55PickFocusBack(id);
}
/* a per-thing setting saves through its thing's own row (its scoped setter stores it on the thing and says so), then
   the panel follows: its Now list and the picker read the thing again */
function o55PickOwnerCommit(id, src, raw) {
  if (!src.commit(raw)) { showToast('Not saved', 'Change it where it is shown.', 'info', 2600); return; }
  PM51.syncInspector();
  o55PickFocusBack(id);
}
function o55PickFocusBack(id) {
  /* a pick hands focus back to the picker, as a select does; a model change can re-render the page in place
     (28-in-place.js lets the focused control go), and a Theme pick re-renders it again when its look transition ends
     (NieR's exit most of all), so the new trigger takes focus back whenever it was dropped, until the look is settled */
  const back = () => {
    const act = document.activeElement; if (act && act !== document.body && act.isConnected) return;
    const t = document.querySelector(`#panel-settings .detail-inspector [data-action="o55-insp-pick"][data-setting="${cssEscape(id)}"]`);
    if (t) { try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } }
  };
  const busy = () => !!((window.PM_THEME_TRANSITION && PM_THEME_TRANSITION.busy && PM_THEME_TRANSITION.busy()) || (window.PM_LOOK_COVERED && PM_LOOK_COVERED()));
  const until = Date.now() + 5000;
  const watch = () => { back(); if (busy() && Date.now() < until) setTimeout(watch, 100); else requestAnimationFrame(() => requestAnimationFrame(back)); };
  back(); requestAnimationFrame(() => requestAnimationFrame(watch));
}
const o55PickOptions = pm => { const o = []; pm.items.forEach(it => { o[it.index] = { value: it.raw, label: it.name, disabled: !!(it.why || it.off), reason: it.why || it.reason || '' }; }); return o; };
const o55PickBrands = (pm, size) => [`<button type="button" class="o55-pick-chip is-on" data-brand="" aria-pressed="true" aria-label="All makers" data-pm-hover-label="All makers">${icon('users')}</button>`]
  .concat(pm.brands.map(b => `<button type="button" class="o55-pick-chip" data-brand="${a(b)}" aria-pressed="false" aria-label="${a(b)}" data-pm-hover-label="${a(b)}">${o55BrandMark(b, size)}</button>`)).join('');
/* FO-178 (Jared's card Q6, answer A, 2026-11-13: "Pop up over the panel, like the chat picker"): the rows no longer
   unfold in the panel under the trigger, pushing what follows down; they pop up over the panel, the way the chat's model
   picker pops up over its sheet, and the panel under them does not move. The popup is built from the parts the chat's
   picker and every Settings popout are built from, nothing of its own:
     where it lives   document.body, position: fixed (a .pm51-popout, kit.js's popout layer at z-index 1300), so it sits
                      above the panel and the panel's toasts whatever stacking context the panel makes (isolation or not)
     where it stands  the chat picker's placement (o55PopPlace below): from the trigger's left edge at the trigger's
                      width, so it fits the narrow panel; under the trigger when the list fits there, over it when it
                      does not (it keeps that bottom edge while a search shortens it, as the chat's picker does), never
                      past the window's edges or under the status bar (Settings' popout frame)
     how it moves     the menu sprout, PM6_SPROUT, from the trigger's centre (origin 'trigger', the chat's menus' own);
                      its size bounce when a search or a maker changes its height; nothing under Reduced Motion
     its surface      a menu sheet in Glass (data-lg-surface="menu") and a popout in every other look
   Inside it, the maker strip (the chat's rail, laid flat for the narrow panel) and the search stay at the top and the
   list is the popup's own scroll box. It keeps its own keys (arrows, Page Up/Down, Home/End, Enter, Escape, Tab out to
   the trigger) and keeps focus in its search while a row is pressed (a press on a row is not focus leaving it); a press
   outside it, focus leaving it, a window resize or its trigger leaving the page close it, and a scroll that moves its
   trigger takes it along. */
let o55Pop = null;
function o55PopClose(focusTrigger) {
  const e = o55Pop; if (!e) return; o55Pop = null;
  if (e.watch) e.watch.disconnect();
  if (e.trigger.isConnected) { e.trigger.setAttribute('aria-expanded', 'false'); e.trigger.removeAttribute('aria-controls'); }
  const box = e.box;
  sproutClose(box, () => { if (box.isConnected && !box.classList.contains('is-open')) box.remove(); });
  if (focusTrigger && e.trigger.isConnected) { try { e.trigger.focus({ preventScroll: true }); } catch (err) { e.trigger.focus(); } }
}
/* Where it stands: the chat's model picker's rule (5.6 Pro positionOverlays, a scoped picker): from the trigger's left
   edge, under the trigger when the whole box fits there, else over it, its bottom edge kept by the trigger so a search
   that shortens it shrinks it toward the trigger (the chat's pinBottom), and never past the window's edges. The room is
   Settings' popout frame (kit.js popoutFrame: 8 px from the window's edges, above the status bar) and the box is capped
   as every popout is (420 px). When neither side holds the whole box, the list is cut to the larger side, as kit.js's
   positionPopout does; a side too small even for that (under 180 px) gives way to the chat's clamp, which slides the box
   over the trigger to stay on screen. The box is measured at its full height as a block, then is a column again (strip,
   search, the list taking what is left), and the list keeps its scroll. */
function o55PopPlace(p) {
  const box = p.box, list = p.entry.el, keep = list.scrollTop, gap = 6, MIN = 180;
  const { vw, vh, top: ft, bottom: fb } = popoutFrame();
  const ar = p.trigger.getBoundingClientRect();
  const w = Math.max(200, Math.min(vw - 16, ar.width));
  box.style.width = w + 'px'; box.style.left = Math.round(Math.max(8, Math.min(vw - w - 8, ar.left))) + 'px';
  box.style.display = 'block'; box.style.maxHeight = 'none'; box.style.top = '0px'; box.style.bottom = '';
  const ph = box.offsetHeight;
  let h = Math.min(ph, 420, fb - ft);
  const below = fb - ar.bottom - gap, above = ar.top - gap - ft;
  let top = null, bottom = null;
  if (below >= h) top = ar.bottom + gap;
  else if (above >= h) bottom = ar.top - gap;
  else if (Math.max(below, above) >= MIN) { if (below >= above) { h = below; top = ar.bottom + gap; } else { h = above; bottom = ar.top - gap; } }
  else top = Math.max(ft, Math.min(fb - h, ar.bottom + gap));
  box.style.maxHeight = Math.floor(h) + 'px';
  if (bottom != null) { box.style.top = 'auto'; box.style.bottom = Math.round(vh - bottom) + 'px'; }
  else { box.style.top = Math.round(top) + 'px'; box.style.bottom = ''; }
  box.style.display = 'flex';
  list.scrollTop = keep;
  p.at = anchorAt(p.trigger);
}
function o55PopOpen(trigger, setting, pm, src) {
  if (o55Pop && o55Pop.trigger === trigger) { o55PopClose(true); return; }
  o55PopClose(false); PM51.closePopouts();
  const label = PM51.rowLabel(setting), id = POP_ID();
  const box = document.createElement('div');
  box.className = `pm51-popout o55-pick-pop${pm.model ? ' is-model' : ''}`; box.id = id;
  box.dataset.portalDisplay = 'flex'; box.setAttribute('data-lg-surface', 'menu');
  box.innerHTML = `${pm.model && pm.brands.length > 1 ? `<div class="o55-pick-chips" role="group" aria-label="Show models from">${o55PickBrands(pm, 14)}</div>` : ''}<div class="pm51-popout-search o55-pick-search">${icon('search')}<input type="search" role="combobox" aria-autocomplete="list" aria-controls="${id}-list" aria-expanded="true" data-pm-hover-exempt="menu" aria-label="${a('Filter ' + label)}" placeholder="${a(pm.model ? 'Search models…' : 'Search choices…')}"/></div><div class="o55-pick-list" role="listbox" id="${id}-list" aria-label="${a(label)}">${o55PickItems(pm, id)}</div>`;
  document.body.appendChild(box);
  const list = box.querySelector('.o55-pick-list');
  const entry = { el: list, pop: box, trigger, options: o55PickOptions(pm), active: -1, searchInput: box.querySelector('input'), brand: '' };
  const p = o55Pop = { box, trigger, entry, at: null, watch: null };
  trigger.setAttribute('aria-expanded', 'true'); trigger.setAttribute('aria-controls', id + '-list');
  const pick = index => { const o = entry.options[index]; if (!o) return; if (o.disabled) { showToast('Not available', o.reason || 'Not available here.', 'info', 2600); return; } o55PopClose(true); if (src && src.commit) o55PickOwnerCommit(setting.id, src, o.value); else o55PickCommit(setting.id, o.value); };
  o55PopPlace(p);
  /* the current choice (else the first that can be picked) is the active row, in the middle of the list's view */
  const sel = pm.items.find(x => x.on), first = pm.items.find(x => !x.why);
  setActiveOption(entry, (sel || first || { index: -1 }).index, false);
  const node = list.querySelector(`[data-index="${entry.active}"]`);
  if (node) list.scrollTop = Math.max(0, node.offsetTop - (list.clientHeight - node.offsetHeight) / 2);
  if (window.PM6_SPROUT) PM6_SPROUT.open(box, null, trigger, { origin: 'trigger' }); else box.classList.add('is-open');
  box.addEventListener('pointermove', e => { const it = e.target.closest('[role="option"]'); if (it && Number(it.dataset.index) !== entry.active) setActiveOption(entry, Number(it.dataset.index), false); });
  /* a press on a row, a heading or the popup's edge leaves focus where it is (the search), as a listbox's rows do: the
     rows take no focus, and a blur there would close the popup before a press held for a moment ends in its click */
  box.addEventListener('mousedown', e => { if (!e.target.closest('input, button')) e.preventDefault(); });
  box.addEventListener('click', e => {
    const chip = e.target.closest('.o55-pick-chip');
    if (chip) { e.preventDefault(); e.stopPropagation(); entry.brand = chip.dataset.brand || ''; box.querySelectorAll('.o55-pick-chip').forEach(b => { const on = b === chip; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); }); o55PickFilter(entry, list); return; }
    const it = e.target.closest('[role="option"]'); if (!it) return; e.preventDefault(); e.stopPropagation(); pick(Number(it.dataset.index));
  });
  entry.searchInput.addEventListener('input', () => o55PickFilter(entry, list));
  box.addEventListener('keydown', e => {
    const k = e.key, stop = () => { e.preventDefault(); e.stopPropagation(); };
    if (e.target.closest('.o55-pick-chip') && (k === 'Enter' || k === ' ')) return;
    if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'PageDown' || k === 'PageUp') { stop(); o55PopMove(entry, { ArrowDown: 1, ArrowUp: -1, PageDown: 8, PageUp: -8 }[k]); return; }
    if ((k === 'Home' || k === 'End') && e.target !== entry.searchInput) { stop(); o55PopMove(entry, 0, k === 'Home' ? 'home' : 'end'); return; }
    if (k === 'Enter' && entry.active >= 0) { stop(); pick(entry.active); return; }
    /* the popup sits at the end of the page, away from its trigger: Tab past its last control, or Shift+Tab before its
       first, closes it on the trigger, so the next Tab goes on from there through the panel */
    if (k === 'Tab') {
      const stops = [...box.querySelectorAll('button, input')].filter(n => !n.disabled && n.getClientRects().length);
      if ((!e.shiftKey && e.target === stops[stops.length - 1]) || (e.shiftKey && e.target === stops[0])) { stop(); o55PopClose(true); }
    }
  });
  box.addEventListener('focusout', () => { requestAnimationFrame(() => { if (o55Pop === p && !box.contains(document.activeElement) && document.activeElement !== trigger) o55PopClose(false); }); });
  /* a re-render that replaces the trigger (the panel closed, or its block was swapped) takes the popup with it, and
     hands focus to the new trigger when the popup held it, as a pick does */
  const host = document.getElementById('panel-settings') || document.body;
  if (window.MutationObserver) {
    p.watch = new MutationObserver(() => {
      if (o55Pop !== p || trigger.isConnected) return;
      const had = box.contains(document.activeElement);
      o55PopClose(false); if (had) o55PickFocusBack(setting.id);
    });
    p.watch.observe(host, { childList: true, subtree: true });
  }
  requestAnimationFrame(() => { if (o55Pop === p) entry.searchInput.focus({ preventScroll: true }); });
}
document.addEventListener('pointerdown', e => { const p = o55Pop; if (!p) return; if (p.box.contains(e.target) || p.trigger.contains(e.target)) return; o55PopClose(false); }, true);
/* Escape closes the popup and nothing else: registered at load, ahead of the Details panel's own Escape
   (onDetailEsc, a later capture listener), as kit.js's popout keys are */
document.addEventListener('keydown', e => {
  const p = o55Pop; if (!p || e.key !== 'Escape' || !(p.box.contains(e.target) || p.trigger.contains(e.target))) return;
  e.preventDefault(); e.stopImmediatePropagation(); o55PopClose(true);
}, true);
/* a scroll that moves the trigger (the panel's body, the page) takes the popup along, as kit.js's lists go with their
   anchor; a scroll inside the popup, or one that leaves the trigger where it was, changes nothing. A resize closes it,
   as it closes every Settings popout. */
document.addEventListener('scroll', e => {
  const p = o55Pop; if (!p || p.box.contains(e.target) || !p.trigger.isConnected) return;
  const now = anchorAt(p.trigger); if (p.at && now && Math.abs(now.left - p.at.left) < 0.5 && Math.abs(now.top - p.at.top) < 0.5) return;
  o55PopPlace(p);
}, true);
window.addEventListener('resize', () => o55PopClose(false));
/* the trigger is a combobox: Arrow Down (or Alt+Arrow Down) opens it, as it does a Settings dropdown */
document.addEventListener('keydown', e => {
  const t = e.target && e.target.closest && e.target.closest('.o55-pick-trigger'); if (!t || e.key !== 'ArrowDown' || t.getAttribute('aria-expanded') === 'true') return;
  e.preventDefault(); e.stopPropagation(); t.click();
}, true);
function o55PickerHtml(setting, ch) {
  const ps = o55PickSource(setting, ch), pm = o55PickModel(setting, ps.ch, ps.src);
  const count = pm.model ? `${pm.items.length} models from ${pm.brands.length} makers` : `${pm.items.length} choices`;
  return `<section class="o55-insp-block o55-pick-block${pm.static ? ' is-static' : ''}"><h4>${pm.static ? 'What it can be' : 'Your choices'} <span class="o55-pick-count">· ${h(count)}</span></h4>${o55PickTrigger(setting, pm)}</section>`;
}
function o55ChoicesHtml(setting, ch) {
  if (!ch) return '';
  if (o55UsesPicker(setting, ch)) return o55PickerHtml(setting, ch);
  return `<section class="o55-insp-block"><h4>${ch.kind === 'multi' ? 'Choose any' : 'Your choices'}</h4><div class="o55-insp-choices" role="${ch.kind === 'multi' ? 'group' : 'radiogroup'}" aria-label="${a(PM51.rowLabel(setting))}">${ch.items.map(it => `<button type="button" class="o55-insp-choice${it.on ? ' is-on' : ''}" role="${ch.kind === 'multi' ? 'checkbox' : 'radio'}" aria-checked="${it.on}" data-action="o55-insp-choose" data-setting="${a(setting.id)}" data-kind="${ch.kind}" data-value="${a(typeof it.raw === 'boolean' ? (it.raw ? '__true' : '__false') : it.raw)}"${it.why ? ` aria-disabled="true" data-disabled-reason="${a(it.why)}"` : ''}><span class="o55-insp-mark">${it.on ? icon('check') : ''}</span>${it.swatch ? `<span class="o55-insp-dot" aria-hidden="true" style="background:${it.swatch}"></span>` : ''}<span class="o55-insp-choice-copy"><span class="o55-insp-choice-label">${h(it.label)}${it.marks.map(m => `<em>${h(m)}</em>`).join('')}</span>${it.why || it.hint ? `<span class="o55-insp-choice-hint">${h(it.why || it.hint)}</span>` : ''}</span></button>`).join('')}</div></section>`;
}
/* FO-127 (moved from FO-122, Jared #1: "that logo looks terrible", on most right-side panels; his pick, 2026-11-10:
   "For the header icons B"): the head tile of the Details panel and of every Settings side panel (PM51.panel's hero)
   draws the PM glyph (PMG, the shell's neon set the rail and the chat use) in a quiet tile, no accent ring or glow
   (30-inspector.css). A chapter glyph PMG lacks takes its PMG neighbour; without PMG the settings glyph stays. */
const O55_PMG_NAMES = { memory: 'database', system: 'server', archive: 'vault', brackets: 'puzzle', test: 'flask', map: 'route' };
/* A PM glyph is drawn on a 24-unit grid but not always centred in it (the brain sits 0.8 units high); a head tile
   centres the glyph it shows (FO-122's rule: within 0.5 px). Its painted parts (every shape but the halo, nx-h) are
   measured once per glyph in a hidden svg, and the viewBox is shifted so their middle is the svg's middle. */
const o55GlyphShift = {};
function o55CentredGlyph(markup, name) {
  if (!(name in o55GlyphShift)) {
    o55GlyphShift[name] = null;
    try {
      const box = document.createElement('div');
      box.style.cssText = 'position:absolute;left:-200px;top:0;width:24px;height:24px;visibility:hidden;pointer-events:none';
      box.innerHTML = markup; document.body.appendChild(box);
      let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
      box.querySelectorAll('svg :is(path, circle, rect, ellipse, line, polyline, polygon):not(.nx-h)').forEach(el => { const b = el.getBBox(); if (!b.width && !b.height) return; x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.width); y2 = Math.max(y2, b.y + b.height); });
      box.remove();
      if (isFinite(x1)) { const dx = Math.round(((x1 + x2) / 2 - 12) * 100) / 100, dy = Math.round(((y1 + y2) / 2 - 12) * 100) / 100; if (Math.abs(dx) >= 0.05 || Math.abs(dy) >= 0.05) o55GlyphShift[name] = [dx, dy]; }
    } catch (e) { /* measured nothing: the glyph stays as drawn */ }
  }
  const d = o55GlyphShift[name];
  return d ? markup.replace('viewBox="0 0 24 24"', `viewBox="${d[0]} ${d[1]} 24 24"`) : markup;
}
function o55HeadGlyph(name, size) {
  const G = window.PMG;
  if (G && typeof G.icon === 'function' && typeof G.has === 'function') {
    const n = [O55_PMG_NAMES[name], name].find(x => x && G.has(x));
    if (n) { try { return `<span class="icon o55-head-pmg">${o55CentredGlyph(G.icon(n, size || 20), n)}</span>`; } catch (e) { /* fall back to the settings glyph */ } }
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
    const ps = o55PickSource(found.setting, ch);
    o55PopOpen(el, found.setting, o55PickModel(found.setting, ps.ch, ps.src), ps.src); return;
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
