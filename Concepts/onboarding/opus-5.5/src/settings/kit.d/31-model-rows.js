/* FO-182 / FO-183 (Jared's Settings review, 2026-11-13, #1 and #2): "The model selector is sometimes the correct one,
   sometimes just the list drop down ... It also says same as project as an option ... what is the projects value here
   then ... It should be a model." and "Some model entry sections are just a blank field, like Easy, routine jobs."
   Canon (Plans/settings_inventory.json, every model_picker row's presentation_contract; Models_System 7.1 and 7.2):
   "Use the shared chat model picker as an overlay, with depth inside it. Show the inherited source and its current
   model/depth." Every Settings model row now draws one control, the picker the Details panel uses (FO-127, a popup
   over the page since FO-178, kit.d/30-inspector.js o55PopOpen), on its row, in a service's or an account's own rows,
   and in the Media abilities' model fields:
     its face        the chat's picker button: the maker's mark, the model's name, a small line (the maker and the depth,
                     or for the row's own inherit choice the model it resolves to now), the chevron
     its choices     first the row's own choices that are not a model, read from the inventory (O55S.canonModels): its
                     inherit choice in its own words ("Same as Everyday building", never the global "Same as the
                     project") with the model and depth that source resolves to now, and Default / None / auto in plain
                     words with what they resolve to; a row whose inventory names no inherit label offers no inherit
                     choice. Then the models, one section per maker.
     its depth       inside the picker (Models_System 7.1): choosing a model that has depths shows them beside the list
                     (inside the popup when there is no room beside it), and the model and its depth are saved together
                     as one value; a model without depths (o55/depth.json) is saved at once and shows none
   The value is still the model's id, so every reader of these settings (the chat port, the Back Seat Driver, search,
   transfer) reads what it read; the depth that goes with it is kept beside it (PM51.s().o55Depth), only for that model.
   Under the control is a hidden native <select> with every choice, as every Settings dropdown keeps one (kit.js
   PM51.dropdown): its change event is the row's, a scoped row's or a manager's form's own save path. */
const O55_DEPTH = ((typeof O55S === 'object' && O55S && O55S.depth) || {}).levels || {};
const o55DepthLevels = raw => (raw != null && Array.isArray(O55_DEPTH[String(raw)]) ? O55_DEPTH[String(raw)].slice() : []);
/* the words for a choice that is not a model, by what it means (model_picker.inherit_from), where rows.d and the
   labels file have none */
const O55_MODEL_WORDS = { smallest_available: 'Smallest available model', automatic_vision: 'The best one available', none: 'No model yet', normal_defaults: 'Use the normal defaults list' };
(function o55ModelLabels() {
  Object.entries(O55_MODEL_CANON).forEach(([id, c]) => {
    const per = O55L.bySetting[id] = Object.assign({}, O55L.bySetting[id] || {});
    const own = (O55R[id] || {}).options || {};
    (c.options || []).forEach(tok => {
      if (Object.prototype.hasOwnProperty.call(own, tok)) return;
      if (tok === 'inherit' && c.inheritLabel) { per[tok] = c.inheritLabel; return; }
      if (!Object.prototype.hasOwnProperty.call(per, tok)) per[tok] = O55_MODEL_WORDS[tok === 'None' ? 'none' : c.inheritFrom] || o55Humanize(tok);
    });
  });
})();

/* ---------- the depth kept with a model ---------------------------------------------------------------------- */
const o55DepthStore = () => { const s = PM51.s(); return s.o55Depth || (s.o55Depth = {}); };
function o55DepthOf(key, model) { const d = o55DepthStore()[key]; return d && model != null && String(d.model) === String(model) ? d.effort || '' : ''; }
function o55DepthPut(key, model, effort) { const st = o55DepthStore(); if (effort) st[key] = { model: String(model), effort: String(effort) }; else delete st[key]; }

/* ---------- what a value resolves to ------------------------------------------------------------------------- */
const o55ModelRaw = v => v == null ? '' : typeof v === 'object' ? String(v.model_id || '') : String(v);
const o55Ready = () => { try { return PM51.readyModels ? PM51.readyModels() : []; } catch (e) { return []; } };
function o55BrandOf(raw, m) {
  if (m && m.brand) return m.brand;
  const s = String(raw || ''), slash = s.indexOf('/'), pid = m && m.pid ? m.pid : slash > 0 ? s.slice(0, slash) : '';
  return pid ? (O55_BRANDS[pid] || pid.replace(/[-_]+/g, ' ').replace(/^./, c => c.toUpperCase())) : '';
}
function o55ModelName(id, raw) {
  const r = o55Ready().find(m => m.value === raw);
  const label = r ? r.label : String(PM51.valueLabel(id, raw));
  const parts = label.split(' · ');
  return parts.length > 1 ? parts.slice(0, -1).join(' · ') : label;
}
/* the smallest model that can be used now (a Haiku, a Fast, a Mini), else the first */
function o55Smallest() { const all = o55Ready(); return all.find(m => /haiku|fast|mini|flash|lite|small/i.test(m.model || m.label)) || all[0] || null; }
/* the first signed-in model that can look at pictures */
function o55FirstVision() {
  for (const p of state.providers || []) {
    if (p.status !== 'active') continue;
    const m = (p.models || []).find(x => x.enabled !== false && (x.caps || []).includes('vision'));
    if (m) return { value: `${p.id}/${m.id}`, label: `${m.name} · ${p.name}`, pid: p.id };
  }
  return null;
}
const o55IsModelToken = (id, v) => ((O55_MODEL_CANON[id] || {}).options || []).includes(o55ModelRaw(v));
/* { name, brand, effort } for a value, or { none: true }; a token follows what it means: inherit follows its source's
   whole model/depth pair (Models_System 7.2), Default the smallest available, auto the first that can see, None none */
function o55ModelResolve(id, v, ctx, depth) {
  const c = O55_MODEL_CANON[id] || {};
  if ((depth || 0) > 6) return null;
  const s = o55ModelRaw(v);
  if (s === '' && depth) return o55ModelResolve(id, (findSettingGlobal(id) || { setting: {} }).setting.value, ctx, depth + 1);
  if ((c.options || []).includes(s)) {
    const from = c.inheritFrom;
    if (s === 'None' || from === 'none') return { none: true };
    if (O55_MODEL_CANON[from]) return o55ModelResolve(from, PM51.value(from), {}, (depth || 0) + 1);
    if (from === 'normal_defaults') return o55ModelResolve('ai.models.default-model', PM51.value('ai.models.default-model'), {}, (depth || 0) + 1);
    const m = from === 'automatic_vision' ? o55FirstVision() : o55Smallest();
    return m ? { value: m.value, name: o55ModelName(id, m.value), brand: o55BrandOf(m.value, m), effort: '' } : { none: true };
  }
  if (!s) return null;
  return { value: s, name: o55ModelName(id, s), brand: o55BrandOf(s), effort: o55DepthOf((ctx && ctx.depthKey) || id, s) };
}
const o55ResolvedText = r => !r ? '' : r.none ? 'No model' : [r.name, r.effort ? `${r.effort} depth` : ''].filter(Boolean).join(' · ');
/* the model settings this picker draws (the inventory's model_picker rows), for search, Details and the kit's checks */
PM51.modelRowIds = () => [...O55_PICK_MODELS];
PM51.modelResolve = (id, v) => o55ModelResolve(id, v === undefined ? PM51.value(id) : v, {}, 0);

/* ---------- the choices ---------------------------------------------------------------------------------------- */
const O55_MEDIA_KIND = { image: 'image-generation', video: 'video-generation', tts: 'text-to-speech', music: 'audio-generation', vision: 'image-understanding' };
function o55ModelCatalog(id, ctx) {
  const c = O55_MODEL_CANON[id] || {};
  const f = findSettingGlobal(id);
  const examples = (f && Array.isArray(f.setting.options) ? f.setting.options : []).filter(o => typeof o === 'string' && o.includes('/')).map(v => ({ value: v, label: PM51.valueLabel(id, v) }));
  let more = [];
  if (O55_MEDIA_KIND[c.catalog]) more = PM51.mediaModels ? PM51.mediaModels(O55_MEDIA_KIND[c.catalog]) : [];
  else { try { more = o55More[id] ? o55More[id]() || [] : o55Ready(); } catch (e) { more = []; } }
  /* an account's own default offers that account's service's models */
  if (c.catalog === 'account' && ctx && ctx.provider) more = o55Ready().filter(m => m.pid === ctx.provider);
  return examples.concat(more);
}
function o55ModelMarks(id, raw) {
  const f = findSettingGlobal(id), def = f ? f.setting.value : (O55_MODEL_CANON[id] || {}).default, rec = (O55_REF.get(id) || {}).recommended;
  return [o55ModelRaw(def) === String(raw) ? 'Default' : '', rec != null && String(rec) === String(raw) && String(rec) !== o55ModelRaw(def) ? 'Recommended' : ''].filter(Boolean);
}
/* every choice of a model row: its own choices that are not a model, then the models (the value it has now first when
   it is none of them: a list never pretends its first choice is the current one) */
function o55ModelItems(id, current, ctx = {}) {
  const c = O55_MODEL_CANON[id] || {};
  const cur = o55ModelRaw(current), out = [];
  (c.options || []).forEach(tok => {
    const r = o55ModelResolve(id, tok, ctx, 0), word = PM51.valueLabel(id, tok);
    out.push({ raw: tok, label: word, name: word, pre: true, sub: r && !r.none ? o55ResolvedText(r) : '', mark: r && !r.none ? r.brand : '', none: !r || !!r.none, levels: [] });
  });
  const seen = new Set(out.map(x => String(x.raw)));
  o55ModelCatalog(id, ctx).forEach(m => {
    const v = String(m.value); if (seen.has(v)) return; seen.add(v);
    const label = String(m.label || PM51.valueLabel(id, v)), parts = label.split(' · ');
    out.push({ raw: v, label, name: parts.length > 1 ? parts.slice(0, -1).join(' · ') : label, sub: m.meta || PM51.valueHint(id, v) || '', brand: o55BrandOf(v, m), levels: o55DepthLevels(v), why: m.disabled ? (m.reason || 'Not available here.') : '' });
  });
  if (cur && !seen.has(cur)) { const r = o55ModelResolve(id, cur, ctx, 0); out.unshift({ raw: cur, label: r && r.name || cur, name: r && r.name || PM51.valueLabel(id, cur), pre: true, sub: 'Not in the list now', mark: r && r.brand || '', levels: o55DepthLevels(cur) }); }
  const effort = o55DepthOf(ctx.depthKey || id, cur);
  return out.map(x => Object.assign(x, { on: String(x.raw) === cur, marks: o55ModelMarks(id, x.raw), effort: String(x.raw) === cur ? effort : '', hint: x.sub }));
}
/* a manager's own list (a media service's models): its first choice (the service's default model) is not a model */
function o55OwnItems(id, current, choices) {
  const cur = current == null ? '' : String(current);
  const out = choices.map(m => { const v = String(m.value == null ? '' : m.value); return { raw: v, label: m.label, name: m.label, sub: m.meta || '', brand: m.brand || '', pre: !!m.pre || v === '', mark: m.mark || '', none: !!m.none, levels: m.levels || [], why: m.disabled ? (m.reason || 'Not available here.') : '', marks: [] }; });
  if (!out.some(x => x.raw === cur)) out.unshift({ raw: cur, label: cur, name: cur || 'Not set', sub: 'Not in the list now', pre: true, levels: [], marks: [] });
  return out.map(x => Object.assign(x, { on: x.raw === cur, effort: '', hint: x.sub }));
}
/* a choice's mark: a model's maker; a choice that is not a model shows the mark of the model it resolves to, the
   automatic spark when it resolves to none it can name, and a dash for no model */
function o55ItemMark(it, size) {
  if (!it) return o55BrandMark('', size);
  if (it.pre) return it.mark ? o55BrandMark(it.mark, size) : icon(it.none ? 'minus' : 'spark');
  return o55BrandMark(it.brand, size);
}

/* ---------- the control ---------------------------------------------------------------------------------------- */
function o55MselFace(it) {
  const name = it ? it.name : 'Not set';
  const sub = !it ? '' : it.pre ? it.sub : [it.brand, it.effort ? `${it.effort} depth` : ''].filter(Boolean).join(' · ');
  return `<span class="o55-pick-mark${it && it.pre ? ' is-pre' : ''}" aria-hidden="true">${o55ItemMark(it, 16)}</span><span class="o55-pick-copy"><strong>${h(name)}</strong>${sub ? `<small>${h(sub)}</small>` : ''}</span><span class="o55-pick-chev" aria-hidden="true">${icon('down')}</span>`;
}
const o55MselName = (label, it) => `${label}: ${it ? it.name : 'Not set'}${it && (it.pre ? it.sub : it.effort) ? ', ' + (it.pre ? it.sub : `${it.effort} depth`) : ''}`;
function o55MselOptions(items) {
  return items.map(it => `<option value="${a(it.raw)}"${it.on ? ' selected' : ''} data-name="${a(it.name)}"${it.sub ? ` data-sub="${a(it.sub)}"` : ''}${it.brand ? ` data-brand="${a(it.brand)}"` : ''}${it.mark ? ` data-mark="${a(it.mark)}"` : ''}${it.pre ? ' data-pre="1"' : ''}${it.none ? ' data-none="1"' : ''}${it.levels && it.levels.length ? ` data-levels="${a(it.levels.join('|'))}"` : ''}${it.effort ? ` data-effort="${a(it.effort)}"` : ''}${it.marks && it.marks.length ? ` data-marks="${a(it.marks.join('|'))}"` : ''}${it.why ? ` data-disabled="1" data-reason="${a(it.why)}"` : ''}>${h(it.name)}</option>`).join('');
}
/* PM51.modelSelect(id, value, { action, data, label, cls, depthKey, provider, choices })
     id        the inventory row it sets (its choices, its inherit words, its depth key)
     action    the hidden select's data-action: 'change-setting' for a row, 'pm51-scoped-select' for a thing's row, a
               manager's own; `data` its data attributes (a scoped row's scope and owner)
     choices   a manager's own list instead of the row's (a media service's models), [{ value, label, meta, brand }]
     depthKey  where the depth is kept when it is not the row's (one account's own default model) */
PM51.modelSelect = (id, value, opts = {}) => {
  const f = findSettingGlobal(id);
  const label = opts.label || (f ? PM51.rowLabel(f.setting) : (O55_MODEL_CANON[id] || {}).label || id);
  const ctx = { depthKey: opts.depthKey || '', provider: opts.provider || '' };
  const items = opts.choices ? o55OwnItems(id, value, opts.choices) : o55ModelItems(id, value, ctx);
  const cur = items.find(x => x.on) || null;
  const data = Object.assign({}, opts.data || {}); delete data.setting;
  return `<span class="pm51-dd o55-msel${opts.choices ? ' is-own' : ''}" data-o55-msel="${a(id)}"${ctx.depthKey ? ` data-o55-depth-key="${a(ctx.depthKey)}"` : ''}${ctx.provider ? ` data-o55-provider="${a(ctx.provider)}"` : ''}><select class="select-control pm51-select pm51-dd-native${opts.cls ? ' ' + opts.cls : ''}" data-action="${a(opts.action || 'pm51-noop')}" data-setting="${a(id)}" ${dataAttrs(data)} aria-label="${a(label)}" aria-hidden="true" tabindex="-1">${o55MselOptions(items)}</select><button type="button" class="o55-pick-trigger is-model o55-msel-trigger" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-label="${a(o55MselName(label, cur))}" data-action="pm51-model-pick" data-setting="${a(id)}" data-o55-label="${a(label)}" data-pm-hover-exempt="dropdown">${o55MselFace(cur)}</button></span>`;
};
/* the items a drawn control holds, read back from its hidden select (so the popup lists exactly what the row offers) */
function o55MselItems(sel) {
  return [...sel.options].map((o, i) => ({ raw: o.value, index: i, label: o.dataset.name || o.textContent, name: o.dataset.name || o.textContent, sub: o.dataset.sub || '', brand: o.dataset.brand || '', mark: o.dataset.mark || '', pre: o.dataset.pre === '1', none: o.dataset.none === '1', levels: o.dataset.levels ? o.dataset.levels.split('|') : [], effort: o.dataset.effort || '', marks: o.dataset.marks ? o.dataset.marks.split('|') : [], on: i === sel.selectedIndex, why: o.dataset.disabled === '1' ? (o.dataset.reason || 'Not available here.') : '' }));
}
/* draw a control again from what is stored now: its choices (a row it inherits from may have changed) and its face;
   the button itself stays, so it keeps the key focus */
function o55MselRefresh(wrap) {
  const sel = wrap.querySelector('select'), btn = wrap.querySelector('.o55-msel-trigger'); if (!sel || !btn) return;
  const id = wrap.dataset.o55Msel;
  if (!wrap.classList.contains('is-own')) {
    const ctx = { depthKey: wrap.dataset.o55DepthKey || '', provider: wrap.dataset.o55Provider || '' };
    /* a row of the setting itself shows what is stored (the Details panel may have saved it); a thing's own row (an
       account's) keeps its own value */
    const v = !ctx.depthKey && sel.dataset.action === 'change-setting' && findSettingGlobal(id) ? PM51.value(id) : sel.value;
    const html = o55MselOptions(o55ModelItems(id, v, ctx));
    if (sel.innerHTML !== html) sel.innerHTML = html;
  }
  const cur = o55MselItems(sel).find(x => x.on) || null;
  const face = o55MselFace(cur), name = o55MselName(btn.dataset.o55Label || '', cur);
  if (btn.innerHTML !== face) btn.innerHTML = face;
  if (btn.getAttribute('aria-label') !== name) btn.setAttribute('aria-label', name);
}
let o55MselFrame = 0;
function o55MselSoon() {
  if (o55MselFrame) return;
  o55MselFrame = requestAnimationFrame(() => { o55MselFrame = 0; document.querySelectorAll('.o55-msel').forEach(o55MselRefresh); });
}
/* open: the shared popup (o55PopOpen), its pick going through the hidden select's own change, as a person's pick in a
   dropdown does (kit.js dropdownOpen), with the depth kept first so the Saved toast names it */
PM51.on('model-pick', el => {
  const wrap = el.closest('.o55-msel'), sel = wrap && wrap.querySelector('select'); if (!sel) return;
  const id = wrap.dataset.o55Msel, f = findSettingGlobal(id);
  const known = f ? f.setting : PM51.setting ? PM51.setting(id) : null;
  /* a manager's own model field (a media service's models) is a model picker too, with makers and marks */
  const setting = Object.assign({}, known || { id, label: el.dataset.o55Label || id }, { id, o55Model: true });
  const pm = o55PickModel(setting, { kind: 'single', items: o55MselItems(sel) }, null);
  const key = wrap.dataset.o55DepthKey || id;
  o55PopOpen(el, setting, pm, {
    label: el.dataset.o55Label || '',
    commit(raw, effort) {
      const i = [...sel.options].findIndex(o => o.value === String(raw)); if (i < 0) return false;
      if (!wrap.classList.contains('is-own')) o55DepthPut(key, raw, effort);
      const moved = sel.selectedIndex !== i;
      sel.selectedIndex = i;
      if (moved || effort !== (sel.options[i].dataset.effort || '')) sel.dispatchEvent(new Event('change', { bubbles: true }));
      if (wrap.isConnected) o55MselRefresh(wrap);
      o55MselSoon();
      return true;
    },
    after() { if (el.isConnected && document.activeElement !== el) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } } }
  });
});

/* ---------- where it is drawn ---------------------------------------------------------------------------------- */
/* every model row a page draws (Settings › Models, the Back Seat Driver, any page a search lands on) */
const o55ModelKit = renderControl;
renderControl = function (setting, value) {
  if (setting && O55_PICK_MODELS.has(setting.id)) return PM51.modelSelect(setting.id, value, { action: 'change-setting', label: PM51.rowLabel(setting) });
  return o55ModelKit.apply(this, arguments);
};
/* a value in words names the model it resolves to: "Same as Everyday model · Claude Opus · High depth" */
const o55ModelValueText = PM51.valueText;
PM51.valueText = (setting, v) => {
  if (!setting || !O55_PICK_MODELS.has(setting.id) || (v != null && typeof v === 'object' && !('model_id' in v))) return o55ModelValueText(setting, v);
  const r = o55ModelResolve(setting.id, v, {}, 0);
  if (o55IsModelToken(setting.id, v)) { const word = PM51.valueLabel(setting.id, o55ModelRaw(v)); return r && !r.none ? `${word} · ${o55ResolvedText(r)}` : word; }
  return r && r.name ? o55ResolvedText(r) : o55ModelValueText(setting, v);
};
/* a saved model value redraws every model control on the page: the rows that follow it name its new model */
const o55ModelCommit = commitSettingValue;
commitSettingValue = function (id) { const ok = o55ModelCommit.apply(this, arguments); if (ok) o55MselSoon(); return ok; };
const o55ModelRestore = restoreSettingDefault;
restoreSettingDefault = function () { const ok = o55ModelRestore.apply(this, arguments); if (ok) o55MselSoon(); return ok; };
