/* Settings that apply everywhere (Opus 5.5): setting a value for one place (Jared's review, 2026-11-13).

   Jared, 2026-11-13: "Some details panels dont let you choose the selection, just the project or computer that is
   impacted", "Some fields let you set values that are not valid ... when i set a value for a specific project or
   computer, i can set any value i want", and model rows offered a plain list with "Same as the project" in it.
   This file is the one place those three answers live:

     PSX.places.limits(id, ctx)   the row's own limits, taken from the same source as its main control: Plans'
                                  inventory range (Randomness "0.0-2.0"), the base row's min, max, step and unit
                                  (PM51.rowMeta, the rows.d data kit.d/10-values.js o55Bound reads, a bound that
                                  follows another setting read at that place), the engine setting's own bounds (a
                                  slider's), and a list's choices exactly as the main control lists them
                                  (PM51.settingRows: the inventory's choices and the ones a manager adds)
     PSX.places.check(id, v, ctx) why a value can't be kept there, or null: the panel's editor and the one write path
                                  (guard.js PSX.write) both ask it, so no path takes a value the main control refuses
     PSX.places.picker(...)       a model row's choice: the shared model picker's anatomy (the maker marks the chat
                                  draws, PM56_PICKERS.providerMark; the Details panel's rows, groups, maker strip and
                                  search) opened as an overlay, with the row's inherit choice in the inventory's words
                                  and the model it resolves to at that place, and the thinking depth inside it
     PSX.places.openRow(id, ...)  a value the inline editor can't hold (a key-value map, a list of records): the row's
                                  own editor (PMConcept7's, through open-structured-setting) for that place; its Save
                                  is routed to that place through the router (feed.js targetFor) and the guard

   Every value here is [Demo only]. PMConcept7 is not edited. */
(function (W) {
  'use strict';
  const PSX = W.PSX; if (!PSX || PSX.places) return;
  const { D, DEF, DEFAULTS, esc, icon, vt, label, placeName, same } = PSX;
  const S = PSX.S;
  const K = () => W.PM12_KIMI;
  const meta = (id) => { try { return (W.PM51 && W.PM51.rowMeta && W.PM51.rowMeta(id)) || {}; } catch (e) { return {}; } };
  const eng = (id) => PSX.engineSetting(id);
  const num = (v) => (v === null || v === undefined || v === '' ? NaN : Number(v));
  const fin = Number.isFinite;

  /* the context a place speaks for (panel.js lineCtx, the same rule) */
  function ctxAt(level, key) {
    const c = PSX.ctxFull(S.ctx);
    if (level === 'project') return { project: key, device: c.device, on: null };
    if (level === 'computer') return { project: 'none', device: c.device, on: key };
    if (level === 'device') return { project: 'none', device: key, on: c.on };
    return S.ctx;
  }

  /* ------------------------------------------------------------------ a list's choices, as its main control lists them
     PM51.settingRows draws the row the way Settings does (kit.d/10-values.js o55Select: the inventory's choices, then
     the ones a manager adds with PM51.moreChoices, and the value in use, never held back); the values are read off it */
  const choiceMemo = new Map();
  function rowChoices(id) {
    const memoKey = id + '|' + PSX.W.rev + '|' + JSON.stringify(S.ctx);
    if (choiceMemo.has(memoKey)) return choiceMemo.get(memoKey);
    let out = [];
    try {
      const html = W.PM51 && W.PM51.settingRows ? W.PM51.settingRows([id]) : '';
      if (html) {
        const tpl = D.createElement('template'); tpl.innerHTML = html;
        const ctl = tpl.content.querySelector('.setting-control') || tpl.content;
        const opts = [...ctl.querySelectorAll('select option')].map((o) => o.value);
        out = opts.length ? opts : [...ctl.querySelectorAll('[data-value]')].map((b) => b.getAttribute('data-value'));
      }
    } catch (e) { out = []; }
    if (!out.length) { const s = eng(id); out = s && Array.isArray(s.options) ? s.options.map((x) => (x && typeof x === 'object' ? (x.value != null ? x.value : x.id) : x)) : []; }
    out = [...new Set(out.map(String))];
    if (choiceMemo.size > 400) choiceMemo.clear();
    choiceMemo.set(memoKey, out);
    return out;
  }
  // a choice back in the type the row keeps (a list of numbers keeps numbers, a switch-like list keeps true and false)
  function typed(id, raw) {
    const d = DEFAULTS[id], s = eng(id), opts = s && Array.isArray(s.options) ? s.options : [];
    const hit = opts.find((o) => String(o && typeof o === 'object' ? (o.value != null ? o.value : o.id) : o) === String(raw));
    if (hit !== undefined && (typeof hit !== 'object' || hit === null)) return hit;
    if (typeof d === 'number' && /^-?\d+(\.\d+)?$/.test(String(raw))) return Number(raw);
    if (typeof d === 'boolean' && (raw === 'true' || raw === 'false')) return raw === 'true';
    return raw;
  }

  /* ------------------------------------------------------------------ a number's limits
     In the units the main control shows (rows.d `scale` divides the stored value for display: a timeout kept in ms is
     shown in seconds), so the editor reads like the row and its limits are the row's own words. */
  const NUMERIC = ['number', 'slider', 'number-inherited', 'slider-inherited', 'stepper'];
  const rangeOf = (opts) => {
    if (!Array.isArray(opts) || opts.length !== 1 || typeof opts[0] !== 'string') return null;
    const m = /^\s*(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)\s*%?\s*$/.exec(opts[0]);
    return m ? [Number(m[1]), Number(m[2])] : null;
  };
  const NUM_SUFFIX = /^\s*(-?\d+(?:\.\d+)?)\s*([^\d\s.][^\d]*)?$/;
  function limits(id, ctx) {
    if (!DEF[id] && !eng(id)) return null;
    if (PSX.isModel(id)) return { kind: 'model' };
    if (isNicknames(id)) return { kind: 'nicknames' };
    const s = eng(id) || {}, m = meta(id), f = PSX.factsOf(id) || {}, d = DEFAULTS[id], def = DEF[id] || {};
    const ctl = s.control, range = rangeOf(f.options);
    const numeric = !Array.isArray(d) && (NUMERIC.includes(ctl) || typeof d === 'number' || !!range);
    if (numeric) {
      const scale = Number(m.scale) || 1;
      let lo = num(m.min != null ? m.min : s.min), hi = num(m.max != null ? m.max : s.max);
      // a bound that follows another setting (rows.d minFrom / maxFrom, kit.d/10-values.js o55Bound), read at the same place
      const from = (side) => {
        const fr = m[side + 'From']; if (!fr) return NaN;
        const fid = typeof fr === 'string' ? fr : fr.id;
        const v = Number(DEF[fid] ? PSX.resolve(fid, ctx || S.ctx).value : (W.PM51 && W.PM51.value ? W.PM51.value(fid) : NaN));
        return fin(v) ? v + (typeof fr === 'object' ? Number(fr.offset) || 0 : 0) : NaN;
      };
      const lf = from('min'), hf = from('max');
      if (fin(lf)) lo = fin(lo) ? Math.max(lo, lf) : lf;
      if (fin(hf)) hi = fin(hi) ? Math.min(hi, hf) : hf;
      // Plans' inventory range, in stored units
      if (range) { lo = fin(lo) ? Math.max(lo, range[0] / scale) : range[0] / scale; hi = fin(hi) ? Math.min(hi, range[1] / scale) : range[1] / scale; }
      // a count with no written floor: never below 0 (a computer's ceiling, never below 1), as the guard always held it
      if (!fin(lo) && typeof d === 'number' && d >= 0) lo = (def.combine === 'computer_ceiling' ? 1 : 0) / scale;
      const step = num(m.step != null ? m.step : s.step);
      // a value kept as words with a unit ("100%", "2px") keeps its unit
      const sm = typeof d === 'string' ? NUM_SUFFIX.exec(d) : null;
      const suffix = sm && sm[2] ? sm[2].trim() : '';
      const asText = typeof d === 'string' && !!sm;
      // the automatic value a row starts on ("Model default", "Provider default", the theme's own): kept as it is
      const auto = [];
      if (d === null || d === undefined || (typeof d === 'string' && !sm)) auto.push(d === undefined ? null : d);
      if ((ctl === 'number-inherited' || ctl === 'slider-inherited') && !auto.length) auto.push(null);
      const unit = String(m.unit || s.unit || suffix || '');
      const whole = (fin(step) && Number.isInteger(step) && step >= 1) || (Number.isInteger(d) && def.combine === 'computer_ceiling');
      return { kind: 'number', lo, hi, step: fin(step) ? step : null, scale, unit, suffix, asText, auto, whole, zero: m.zero || null };
    }
    // Theme lists the ten looks (world.js optionsFor); the row draws them as a picker of families, not as its values
    if (id === 'general.visual.theme') { const ch = (PSX.optionsFor(id) || []).map(String); return ch.length ? { kind: 'choices', choices: ch } : null; }
    if (ctl === 'multiselect') { const ch = rowChoices(id); return ch.length ? { kind: 'multi', choices: ch } : null; }
    if (['select', 'segmented', 'radio', 'swatches'].includes(ctl)) { const ch = rowChoices(id); if (ch.length >= 2) return { kind: 'choices', choices: ch }; }
    return null;
  }
  /* the one Model nicknames list (Plans batch 4, DL-479): a key-value map of nickname to model, Everywhere and per project,
     each nickname on its own. Main's inventory still keeps the old row inside its owner, so this applies only where the
     inventory says keyvalue. Its value side is a model, chosen with the shared picker, stored with no depth */
  const NICKNAMES = 'ai.models.model-alias';
  const isNicknames = (id) => id === NICKNAMES && !!(PSX.layering && PSX.layering.types[id] === 'keyvalue');
  const nickKey = (k) => String(k).trim().toLowerCase().replace(/[\s_-]+/g, ' ');
  function nickCheck(id, value) {
    if (typeof value === 'string') return null;   // the old row's shape is a compatibility read (DL-479)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return 'It has to be a list of nicknames';
    const seen = new Set(), models = modelChoices(id).filter((x) => !x.own).map((x) => x.value);
    for (const [k, v] of Object.entries(value)) {
      const n = nickKey(k);
      if (!n) return 'A nickname can’t be empty';
      if (seen.has(n)) return `“${k}” is already a nickname in this list`;
      seen.add(n);
      if (models.some((m) => m.toLowerCase() === String(k).trim().toLowerCase())) return `“${k}” is a model’s own name, so it would hide that model`;
      if (typeof v !== 'string' || !models.includes(v)) return `${typeof v === 'string' ? vt('ai.models.default-model', v) : 'That'} isn’t a model you can use`;
    }
    return null;
  }
  const fmt = (n) => String(+Number(n).toFixed(6));
  // a stored value as the main control shows it, and back
  function shown(id, v, lim) {
    lim = lim || limits(id);
    if (!lim || lim.kind !== 'number') return v;
    if (v === null || v === undefined || v === '') return NaN;
    const n = typeof v === 'number' ? v : lim.asText || typeof v === 'string' ? Number.parseFloat(v) : NaN;
    return fin(n) ? +(n / lim.scale).toFixed(6) : NaN;
  }
  function stored(id, n, lim) {
    lim = lim || limits(id);
    if (!lim || lim.kind !== 'number') return n;
    const v = lim.scale === 1 ? n : lim.scale > 1 ? Math.round(n * lim.scale) : +(n * lim.scale).toFixed(6);
    return lim.asText ? `${fmt(v)}${lim.suffix}` : v;
  }

  /* ------------------------------------------------------------------ one check, for the editor and the guard */
  function check(id, value, ctx) {
    if (value === undefined) return null;
    const lim = limits(id, ctx); if (!lim) return null;
    if (lim.kind === 'model') return modelCheck(id, value);
    if (lim.kind === 'nicknames') return nickCheck(id, value);
    if (lim.kind === 'number') {
      if (lim.auto.some((a) => same(a, value)) || (lim.auto.length && (value === null || value === ''))) return null;
      let n;
      if (typeof value === 'number') n = value;
      else if (typeof value === 'string' && (lim.asText || lim.auto.length || typeof DEFAULTS[id] === 'string')) {
        const mm = NUM_SUFFIX.exec(value); if (!mm) return 'It has to be a number';
        if (lim.suffix && mm[2] && mm[2].trim() !== lim.suffix) return `It has to be in ${lim.suffix}`;
        n = Number(mm[1]);
      } else return 'It has to be a number';
      if (!fin(n)) return 'It has to be a number';
      const x = +(n / lim.scale).toFixed(6), u = lim.unit && lim.unit !== lim.suffix ? ` ${lim.unit}` : lim.suffix || '';
      // a written "no cap" zero (rows.d `zero`) is the row's own choice
      if (lim.zero && x === 0) return null;
      if (fin(lim.lo) && x < lim.lo - 1e-9 && !same(value, DEFAULTS[id])) return `It can’t be less than ${fmt(lim.lo)}${u}`;
      if (fin(lim.hi) && x > lim.hi + 1e-9 && !same(value, DEFAULTS[id])) return `It can’t be more than ${fmt(lim.hi)}${u}`;
      // a whole-number step means whole numbers; the box's step arrows are not a limit the main control holds a typed value to
      if (lim.whole && !Number.isInteger(+x.toFixed(6))) return 'It has to be a whole number';
      return null;
    }
    // the row's own default is always one of its choices (an empty "Not set" a list starts on, say)
    if ((lim.kind === 'choices' || lim.kind === 'multi') && same(value, DEFAULTS[id])) return null;
    if (lim.kind === 'choices') {
      if (value === null || typeof value === 'object') return 'It has to be one of its choices';
      return lim.choices.includes(String(value)) ? null : `${vt(id, value)} isn’t one of its choices`;
    }
    if (lim.kind === 'multi') {
      if (!Array.isArray(value)) return 'It has to be a list';
      const bad = value.filter((v) => !lim.choices.includes(String(v)));
      return bad.length ? `${PSX.list(bad.map((v) => vt(id, [v]) || String(v)))} ${bad.length === 1 ? 'isn’t one of its choices' : 'aren’t among its choices'}` : null;
    }
    return null;
  }

  /* ------------------------------------------------------------------ model rows
     The shared picker's catalog: the row's own words from Plans' inventory (inherit, Default, None, auto), then every
     model you can use (PM51.readyModels: the models on your signed-in accounts, the list the main control and the
     Details panel offer) and the inventory's examples. Making pictures and Reading pictures offer the models that can;
     the three media rows whose service picks its own model offer its words only. */
  const MAKERS = { anthropic: 'Anthropic', 'anthropic-api': 'Anthropic', 'claude-code': 'Anthropic', openai: 'OpenAI', 'openai-codex': 'OpenAI', gemini: 'Google', google: 'Google', 'gemini-direct': 'Google', antigravity: 'Google', 'qwen-coding': 'Alibaba', 'qwen-token': 'Alibaba', alibaba: 'Alibaba', 'kimi-coding': 'Moonshot', moonshot: 'Moonshot', 'zai-coding': 'z.ai', zai: 'z.ai', 'cursor-cli': 'Cursor', cursor: 'Cursor', 'free-models': 'Free routes', opencode: 'OpenCode', 'minimax-coding': 'MiniMax', 'xai-api': 'xAI' };
  const PLACEHOLDER = /^<|choose a specific/i;
  const DEPTHS = ['Low', 'Medium', 'High'];
  const MEDIA_CAP = { 'media.image.model': 'image-generation', 'media.io.vision-fallback-model': 'vision' };
  const OWN_ONLY = ['media.capabilities.video-model', 'media.capabilities.tts-model', 'media.capabilities.music-model'];
  let providersAt = 0, providersMemo = null;
  function providers() {
    if (providersMemo && Date.now() - providersAt < 1500) return providersMemo;
    try { providersMemo = (K() && K().getState().providers) || []; } catch (e) { providersMemo = []; }
    providersAt = Date.now();
    return providersMemo;
  }
  function capsOf(value) {
    const raw = String(PSX.modelOf(value) || ''), i = raw.indexOf('/');
    if (i < 0) return null;
    const pid = raw.slice(0, i), mid = raw.slice(i + 1);
    const p = providers().find((x) => x.id === pid);
    const m = p && (p.models || []).find((x) => x.id === mid);
    if (m) return m.caps || [];
    // the inventory's examples (anthropic/claude-opus-4, openai/gpt-5): models that think
    return /claude|gpt-5|gemini-2\.5|o3|o4/i.test(mid) ? ['reasoning'] : [];
  }
  const depthsFor = (value) => ((capsOf(value) || []).includes('reasoning') ? DEPTHS : []);
  const makerOf = (raw) => { const i = String(raw).indexOf('/'); const pid = i > 0 ? String(raw).slice(0, i) : ''; return MAKERS[pid] || (pid ? pid.replace(/[-_]+/g, ' ').replace(/^./, (c) => c.toUpperCase()) : ''); };
  function modelChoices(id) {
    const f = PSX.factsOf(id) || {};
    const own = (Array.isArray(f.options) ? f.options : []).filter((o) => typeof o === 'string' && !PLACEHOLDER.test(o));
    const items = own.map((o) => ({ value: o, own: true }));
    if (OWN_ONLY.includes(id)) return items;
    const seen = new Set(own);
    const add = (value, extra) => { if (seen.has(value) || PLACEHOLDER.test(value)) return; seen.add(value); items.push(Object.assign({ value, maker: makerOf(value) }, extra || {})); };
    const cap = MEDIA_CAP[id];
    if (cap) {
      providers().filter((p) => p.status === 'active').forEach((p) => (p.models || []).filter((m) => m.enabled !== false && (m.caps || []).includes(cap)).forEach((m) => add(`${p.id}/${m.id}`, { name: m.name, meta: `On your ${p.name} ${p.bill === 'use' ? 'account' : 'plan'}` })));
      return items;
    }
    // the inventory's examples first, as the main control lists them (Everyday model's own choices)
    const ex = eng('ai.models.default-model');
    (ex && Array.isArray(ex.options) ? ex.options : []).forEach((o) => add(String(o && typeof o === 'object' ? o.value : o)));
    let ready = [];
    try { ready = W.PM51 && W.PM51.readyModels ? W.PM51.readyModels() : []; } catch (e) { ready = []; }
    ready.forEach((r) => add(r.value, { name: r.model || '', meta: r.meta || '' }));
    // one section per maker, makers in the order they first appear, as the Details picker and the chat group them
    const makers = [...new Set(items.filter((x) => !x.own).map((x) => x.maker))];
    return items.filter((x) => x.own).concat(makers.flatMap((m) => items.filter((x) => !x.own && x.maker === m)));
  }
  function modelCheck(id, value) {
    const own = (PSX.factsOf(id) || {}).options || [];
    if (typeof value === 'string' && own.includes(value)) return null;
    const model = PSX.modelOf(value), effort = PSX.effortOf(value);
    if (typeof model !== 'string' || !model) return 'It has to be a model';
    if (value && typeof value === 'object' && own.includes(model)) return effort ? `${vt(id, model)} has no thinking depth of its own` : null;
    const ch = modelChoices(id);
    if (!ch.some((c) => c.value === model)) return `${vt(id, model)} isn’t a model you can use here`;
    if (effort && !depthsFor(model).includes(effort)) return `${vt(id, model)} has no ${effort} thinking`;
    return null;
  }
  /* what "inherit" is at a place: the named source (model_picker.inherit_from) resolved there, followed until a model */
  function inherited(id, level, key) {
    let src = id, v = 'inherit', guard = 0;
    const ctx = level ? ctxAt(level, key) : S.ctx;
    while (v === 'inherit' && guard++ < 6) {
      const f = PSX.factsOf(src) || {};
      const from = f.picker && f.picker.inherit_from;
      if (!from || !DEFAULTS.hasOwnProperty(from) && !PSX.factsOf(from)) return null;
      src = from;
      if (level === 'everywhere') { const e = PSX.getAt(PSX.W, 'everywhere', null, src); v = e !== undefined ? e : DEFAULTS[src]; }
      else v = DEF[src] ? PSX.resolve(src, ctx).value : DEFAULTS[src];
    }
    return v === 'inherit' ? null : { from: src, value: v };
  }
  function inheritWords(id, level, key) {
    const f = PSX.factsOf(id) || {}, lab = f.labels && f.labels.inherit;
    if (!lab) return null;
    const got = inherited(id, level, key), direct = f.picker && f.picker.inherit_from;
    return { label: lab, model: got ? vt(got.from, got.value) : '', from: direct || (got ? got.from : null), through: got && got.from !== direct ? got.from : null };
  }

  /* ------------------------------------------------------------------ the picker, as an overlay
     The rows, groups, maker strip and search of the Details panel's picker (kit.d/30-inspector.js), in the kit's own
     popout (.pm51-popout, fixed, over the page: nothing under it moves), with the depth inside it. Each pick changes the
     line's draft at once; Done, Enter, a click outside or Esc closes it, and the line's Save keeps it. */
  let open = null;
  const mark = (maker, size) => {
    if (maker === 'Free routes') return icon('route');
    const P = W.PM56_PICKERS;
    if (P && typeof P.providerMark === 'function' && maker) { try { return P.providerMark(maker, size); } catch (e) { /* letter */ } }
    return `<b class="o55-pick-letter">${esc(String(maker || '?').charAt(0))}</b>`;
  };
  function nameOf(id, value, item) {
    if (item && item.name) return item.name;
    const t = vt(id, PSX.modelOf(value));
    return String(t).split(' · ')[0];
  }
  function trigger(id, o) {
    const b = D.createElement('button');
    b.type = 'button'; b.className = 'o55-pick-trigger is-model psx-mtrigger';
    b.setAttribute('aria-haspopup', 'listbox'); b.setAttribute('aria-expanded', 'false');
    b.setAttribute('data-psx-edit-control', '1'); b.setAttribute('data-psx-mpick', id);
    const paint = (value) => {
      const iw = value === 'inherit' ? inheritWords(id, o.level, o.key) : null;
      const isOwn = typeof value === 'string' && ((PSX.factsOf(id) || {}).options || []).includes(value);
      const maker = isOwn ? '' : makerOf(PSX.modelOf(value));
      const name = value == null || value === '' ? 'No model yet' : iw ? iw.label : isOwn ? vt(id, value) : nameOf(id === NICKNAMES ? 'ai.models.default-model' : id, value);
      const sub = value == null || value === '' ? 'Choose a model' : iw ? (iw.model ? `${iw.model} here` : '') : isOwn ? (W.PM51 && W.PM51.valueHint ? W.PM51.valueHint(id, value) : '') : [maker, o.noDepth ? '' : PSX.effortOf(value) ? `${PSX.effortOf(value)} thinking` : 'Model’s own depth'].filter(Boolean).join(' · ');
      b.innerHTML = `<span class="o55-pick-mark" aria-hidden="true">${isOwn || iw ? icon('spark') : mark(maker, 16)}</span><span class="o55-pick-copy"><strong>${esc(name)}</strong>${sub ? `<small>${esc(sub)}</small>` : ''}</span><span class="o55-pick-chev" aria-hidden="true">${icon('down')}</span>`;
      b.setAttribute('aria-label', `${label(id)} for ${o.name}: ${name}${sub ? ', ' + sub : ''}`);
      b.__psxValue = value;
    };
    paint(o.value);
    b.__psxPaint = paint;
    return b;
  }
  function close(focusBack) {
    const p = open; if (!p) return; open = null;
    p.el.remove();
    if (p.trigger.isConnected) { p.trigger.setAttribute('aria-expanded', 'false'); p.trigger.removeAttribute('aria-controls'); if (focusBack) { try { p.trigger.focus({ preventScroll: true }); } catch (e) { p.trigger.focus(); } } }
    W.removeEventListener('keydown', p.keys, true);
    D.removeEventListener('pointerdown', p.outside, true);
    W.removeEventListener('resize', p.place);
    if (p.onClose) p.onClose();
  }
  function picker(trig0, id, o, onPick, onClose) {
    let trig = trig0;
    if (open && open.trigger === trig) { close(true); return null; }
    close(false);
    try { if (W.PM51 && W.PM51.closePopouts) W.PM51.closePopouts(); } catch (e) { /* none */ }
    let value = trig.__psxValue !== undefined ? trig.__psxValue : o.value;
    const items = modelChoices(id);
    const iw = inheritWords(id, o.level, o.key);
    const pid = PSX.uid('psx-mpick');
    const el = D.createElement('div');
    el.className = 'pm51-popout psx-mpick is-open'; el.id = pid; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', `${label(id)} for ${o.name}`);
    el.setAttribute('data-psx-mpick-for', id);
    const makers = [...new Set(items.filter((x) => !x.own).map((x) => x.maker).filter(Boolean))];
    const row = (it, i) => {
      const own = !!it.own, inh = it.value === 'inherit' && iw;
      const nm = inh ? iw.label : own ? vt(id, it.value) : nameOf(id, it.value, it);
      const sub = inh ? (iw.model ? `${iw.model} here${iw.through ? ` · through ${label(iw.through)}` : ''}` : '') : own ? (W.PM51 && W.PM51.valueHint ? W.PM51.valueHint(id, it.value) : '') : (it.meta || it.maker || '');
      const on = same(PSX.modelOf(value), it.value);
      return `<div class="pm51-popout-item o55-pick-item is-model" role="option" id="${pid}-${i}" data-index="${i}" data-value="${esc(it.value)}" data-brand="${esc(own ? '' : it.maker)}" aria-selected="${on}"><span class="o55-pick-mark" aria-hidden="true">${own || inh ? icon('spark') : mark(it.maker, 15)}</span><span class="o55-pick-copy"><strong>${esc(nm)}</strong>${sub ? `<small>${esc(sub)}</small>` : ''}</span><span class="o55-pick-tick" aria-hidden="true">${on ? icon('check') : ''}</span></div>`;
    };
    let body = '', last = null;
    items.forEach((it, i) => {
      const g = it.own ? (it.value === 'inherit' ? 'Follow another model' : 'Its own choices') : it.maker;
      if (g !== last) { body += `<div class="pm51-popout-group o55-pick-group" role="presentation" data-brand="${esc(it.own ? '' : it.maker)}">${esc(g)}</div>`; last = g; }
      body += row(it, i);
    });
    el.innerHTML = `<div class="psx-mpick-head"><strong>${esc(label(id))}</strong><span>for ${esc(o.name)}</span></div>`
      + (makers.length > 1 ? `<div class="psx-mpick-chips" role="group" aria-label="Show models from"><button type="button" class="psx-mpick-chip is-on" data-brand="" aria-pressed="true" aria-label="All makers">${icon('users')}</button>${makers.map((m) => `<button type="button" class="psx-mpick-chip" data-brand="${esc(m)}" aria-pressed="false" aria-label="${esc(m)}" data-pm-hover-label="${esc(m)}">${mark(m, 14)}</button>`).join('')}</div>` : '')
      + `<div class="pm51-popout-search">${icon('search')}<input type="search" role="combobox" aria-autocomplete="list" aria-controls="${pid}-list" aria-expanded="true" aria-label="${esc('Filter ' + label(id))}" placeholder="Search models…" data-pm-hover-exempt="menu"/></div>`
      + `<div class="psx-mpick-list" role="listbox" id="${pid}-list" aria-label="${esc(label(id))}">${body}<div class="pm51-popout-empty" hidden>No matches</div></div>`
      + `<div class="psx-mpick-depth" role="group" aria-label="Thinking depth"></div>`
      + `<div class="psx-mpick-foot"><button type="button" class="psx-tb psx-mpick-done" data-psx-mpick-done data-pm-hover-exempt="menu">Done</button></div>`;
    // on the body, as the kit's own popouts are (kit.js openListPopout): over the panel and the page, clipped by neither
    D.body.appendChild(el);
    const list = el.querySelector('.psx-mpick-list'), input = el.querySelector('input'), depth = el.querySelector('.psx-mpick-depth');
    let active = -1, brand = '';
    const nodes = () => [...list.querySelectorAll('[role="option"]')].filter((n) => !n.hidden);
    const setActive = (i) => {
      list.querySelectorAll('[role="option"].is-active').forEach((n) => n.classList.remove('is-active'));
      const n = list.querySelector(`[role="option"][data-index="${i}"]`); active = n ? i : -1;
      if (n) { n.classList.add('is-active'); input.setAttribute('aria-activedescendant', n.id); const lr = list.getBoundingClientRect(), nr = n.getBoundingClientRect(); if (nr.top < lr.top) list.scrollTop -= lr.top - nr.top + 4; else if (nr.bottom > lr.bottom) list.scrollTop += nr.bottom - lr.bottom + 4; }
    };
    const paintDepth = () => {
      if (o.noDepth) { depth.innerHTML = `<span class="psx-mpick-dlab">Thinking depth</span><span class="psx-mpick-dnone">${esc(o.noDepth)}</span>`; if (open && open.el === el) place(); return; }
      const model = PSX.modelOf(value), ds = typeof model === 'string' && !items.find((x) => x.own && x.value === model) ? depthsFor(model) : [];
      const cur = PSX.effortOf(value);
      if (!ds.length) { depth.innerHTML = `<span class="psx-mpick-dlab">Thinking depth</span><span class="psx-mpick-dnone">${esc(value === 'inherit' && iw ? `Follows ${label(iw.from)}’s depth` : 'This choice has no depth to set')}</span>`; if (open && open.el === el) place(); return; }
      depth.innerHTML = `<span class="psx-mpick-dlab" id="${pid}-dl">Thinking depth</span><div class="psx-seg" role="radiogroup" aria-labelledby="${pid}-dl">${[''].concat(ds).map((d) => `<button type="button" role="radio" aria-checked="${d === cur}" data-depth="${esc(d)}" data-pm-hover-exempt="menu">${esc(d || 'Model’s own')}</button>`).join('')}</div>`;
      if (open && open.el === el) place();
    };
    const choose = (raw) => {
      const keep = o.noDepth ? '' : PSX.effortOf(value);
      value = keep && depthsFor(raw).includes(keep) ? { model: raw, effort: keep } : raw;
      list.querySelectorAll('[role="option"]').forEach((n) => { const on = n.getAttribute('data-value') === raw; n.setAttribute('aria-selected', String(on)); n.querySelector('.o55-pick-tick').innerHTML = on ? icon('check') : ''; });
      paintDepth(); onPick(value); trig.__psxPaint(value);
    };
    const filter = () => {
      const q = String(input.value || '').trim().toLowerCase(); let any = false;
      list.querySelectorAll('[role="option"]').forEach((n) => { const hit = (!brand || n.dataset.brand === brand) && (!q || `${n.textContent} ${n.dataset.brand || ''}`.toLowerCase().includes(q)); n.hidden = !hit; if (hit) any = true; });
      list.querySelectorAll('.o55-pick-group').forEach((g) => { let sib = g.nextElementSibling, vis = false; while (sib && sib.getAttribute('role') === 'option') { if (!sib.hidden) vis = true; sib = sib.nextElementSibling; } g.hidden = !vis; });
      list.querySelector('.pm51-popout-empty').hidden = any;
      const first = nodes()[0]; setActive(first ? Number(first.dataset.index) : -1);
    };
    // placed under the trigger, or above it when the window has no room below; inside the window at every width
    const place = () => {
      if (!trig.isConnected) { close(false); return; }
      const r = trig.getBoundingClientRect(), vw = W.innerWidth, vh = W.innerHeight, w = Math.min(360, vw - 16);
      el.style.width = w + 'px';
      const left = Math.max(8, Math.min(vw - w - 8, r.right - w));
      el.style.left = left + 'px';
      // the side with more room (below when it holds 360px), and never taller than that side: the list scrolls inside
      const below = vh - r.bottom - 12, above = r.top - 12, under = below >= 360 || below >= above;
      el.style.maxHeight = Math.max(160, Math.min(520, under ? below : above)) + 'px';
      const hgt = el.offsetHeight;
      el.style.top = (under ? r.bottom + 4 : Math.max(8, r.top - hgt - 4)) + 'px';
    };
    const keys = (e) => {
      if (!open || open.el !== el) return;
      const k = e.key, stop = () => { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); };
      if (k === 'Escape') { stop(); close(true); return; }
      if (!el.contains(e.target)) return;
      if (k === 'ArrowDown' || k === 'ArrowUp') { stop(); const ns = nodes(); if (!ns.length) return; let i = ns.findIndex((n) => Number(n.dataset.index) === active); i = Math.max(0, Math.min(ns.length - 1, (i < 0 ? (k === 'ArrowDown' ? -1 : ns.length) : i) + (k === 'ArrowDown' ? 1 : -1))); setActive(Number(ns[i].dataset.index)); return; }
      if (k === 'Enter' && e.target === input && active >= 0) { stop(); choose(items[active].value); close(true); }
    };
    const outside = (e) => { if (!open || open.el !== el) return; if (el.contains(e.target) || trig.contains(e.target)) return; close(false); };
    el.addEventListener('pointermove', (e) => { const it = e.target.closest('[role="option"]'); if (it && Number(it.dataset.index) !== active) setActive(Number(it.dataset.index)); });
    el.addEventListener('click', (e) => {
      const chip = e.target.closest('.psx-mpick-chip');
      if (chip) { e.preventDefault(); brand = chip.dataset.brand || ''; el.querySelectorAll('.psx-mpick-chip').forEach((b) => { const on = b === chip; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); }); filter(); return; }
      const dp = e.target.closest('[data-depth]');
      if (dp) { e.preventDefault(); const m = PSX.modelOf(value); value = dp.dataset.depth ? { model: m, effort: dp.dataset.depth } : m; paintDepth(); onPick(value); trig.__psxPaint(value); return; }
      if (e.target.closest('[data-psx-mpick-done]')) { e.preventDefault(); close(true); return; }
      const it = e.target.closest('[role="option"]'); if (!it) return;
      e.preventDefault(); choose(items[Number(it.dataset.index)].value);
    });
    input.addEventListener('input', filter);
    open = { el, trigger: trig, keys, outside, place, onClose };
    /* the engine can redraw the panel under an open picker (a change elsewhere, the world feeding it): the picker then
       follows the line's new trigger, or closes when the line is gone */
    let lastAt = '';
    const follow = () => {
      if (!open || open.el !== el) return;
      // the panel can scroll under it (focus coming back, a redraw): it stays with its trigger
      if (trig.isConnected) { const rr = trig.getBoundingClientRect(), at = `${Math.round(rr.top)},${Math.round(rr.right)}`; if (at !== lastAt) { lastAt = at; place(); } }
      if (!trig.isConnected) {
        const again = D.querySelector(`[data-psx-mpick="${CSS.escape(id)}"][data-psx-edit-control]`);
        if (!again) { close(false); return; }
        trig = again; open.trigger = again; again.setAttribute('aria-expanded', 'true'); again.setAttribute('aria-controls', pid);
        if (again.__psxPaint) again.__psxPaint(value);
        place();
      }
      requestAnimationFrame(follow);
    };
    requestAnimationFrame(follow);
    W.addEventListener('keydown', keys, true);
    D.addEventListener('pointerdown', outside, true);
    W.addEventListener('resize', place);
    trig.setAttribute('aria-expanded', 'true'); trig.setAttribute('aria-controls', pid);
    paintDepth(); place();
    const sel = items.findIndex((x) => same(x.value, PSX.modelOf(value)));
    setActive(sel >= 0 ? sel : 0);
    if (!PSX.reduced()) { el.classList.add('is-entering'); el.addEventListener('animationend', () => el.classList.remove('is-entering'), { once: true }); }
    requestAnimationFrame(() => { if (open && open.el === el) { try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); } } });
    return el;
  }

  /* ------------------------------------------------------------------ a value the inline editor can't hold
     The row's own editor (PMConcept7's key-value or list editor, opened by open-structured-setting) for that place:
     the engine shows the place's value while it is open, its Save goes to that place (feed.js targetFor reads
     PSX.places.editing), through the guard, with the note naming the place; closing it any way puts the engine back
     on what this context uses. */
  let rowEdit = null;
  function openRow(id, level, key) {
    const k = K(); if (!k) return false;
    endRow(true);
    const own = PSX.getAt(PSX.W, level, key, id);
    const start = own !== undefined ? own : (DEF[id] ? PSX.resolve(id, ctxAt(level, key)).value : DEFAULTS[id]);
    const name = level === 'everywhere' ? 'everywhere' : placeName(level, key);
    rowEdit = { id, level, key, name, at: Date.now() };
    PSX.places.editing = rowEdit;
    try { k.setSettingFromHost(id, start, false, false); } catch (e) { /* the engine keeps what it had */ }
    PSX.last[id] = PSX.clone(start);
    const before = new Set([...D.querySelectorAll('.pm51-panel, .pm51-drawer, [data-pm51-panel]')]);
    try { k.dispatchAction('open-structured-setting', { setting: id }); } catch (e) { endRow(true); return false; }
    const find = () => [...D.querySelectorAll('.pm51-panel, .pm51-drawer, [data-pm51-panel]')].find((x) => !before.has(x) && x.isConnected);
    let tries = 0;
    const hook = () => {
      const pan = find();
      if (!pan) { if (++tries < 30 && rowEdit && rowEdit.id === id) { setTimeout(hook, 50); return; } endRow(true); return; }
      rowEdit.panel = pan;
      pan.setAttribute('data-psx-place-edit', `${level}:${key || ''}`);
      const body = pan.querySelector('.pm51-panel-body, .pm51-ps, .o55-kv, .o55-le') || pan;
      const note = D.createElement('p'); note.className = 'psx-place-banner'; note.setAttribute('data-o55-foreign', '1');
      note.innerHTML = `${PSX.mark('info')}<span>${level === 'everywhere' ? `What you save here is the everywhere value. Places with their own keep it.` : `What you save here is ${esc(name)}’s own value. Everywhere else keeps what it has.`}</span>`;
      (body.firstElementChild ? body.insertBefore(note, body.firstElementChild) : body.appendChild(note));
      /* Save with the value as it was still sets that place's own (the person chose "Set for <place>" and pressed Save):
         the router writes a change it sees; one it doesn't see (nothing moved in the engine) is written here, once */
      const primary = pan.querySelector('.pm51-panel-foot .btn.primary');
      if (primary) primary.addEventListener('click', () => {
        const ed = rowEdit; if (!ed || ed.id !== id) return;
        const at = { level: ed.level, key: ed.key };
        // what the editor saved, read right after its own Save ran (before the router re-feeds this context's value)
        setTimeout(() => {
          let v; try { v = K().getState().settings[id]; } catch (e) { return; }
          if (v === undefined) return;
          setTimeout(() => { if (!same(PSX.getAt(PSX.W, at.level, at.key, id), v)) PSX.setOwn(id, at, PSX.clone(v)); }, 260);
        }, 0);
      }, true);
      const watch = new MutationObserver(() => { if (!pan.isConnected || pan.getAttribute('aria-hidden') === 'true' || pan.hasAttribute('data-leaving')) { watch.disconnect(); setTimeout(() => endRow(false), 0); } });
      watch.observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-hidden', 'data-leaving'] });
      rowEdit.watch = watch;
    };
    setTimeout(hook, 30);
    return true;
  }
  function endRow(quiet) {
    const r = rowEdit; if (!r) return;
    rowEdit = null; PSX.places.editing = null;
    if (r.watch) r.watch.disconnect();
    // the engine back on what this context uses (a Save already went to the place and re-fed it)
    setTimeout(() => { try { PSX.feed.push(); } catch (e) { /* later */ } if (!quiet && PSX.panel && PSX.panel.refresh) PSX.panel.refresh(); }, 120);
  }

  PSX.places = { isNicknames, nickKey, limits, check, choices: rowChoices, typed, shown, stored, ctxAt, modelChoices, modelCheck, inherited, inheritWords, depthsFor, picker, trigger, close: () => close(false), isOpen: () => !!open, openRow, endRow, editing: null };
})(window);
