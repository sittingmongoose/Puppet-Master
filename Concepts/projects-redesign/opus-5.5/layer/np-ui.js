/* Projects concepts (Opus 5.5), Split v2: the New Project parts, window.PJX.npui.

   One renderer per guided section (start, folder, device, source, find, restore, chat, where, like, versions, online,
   backup) and the shared components they are made of. The Project page draws the same components inside its plates
   (an np session with purpose 'page'), so the page and New Project can never disagree (spec 10).

   Built from the flow's own DOM parts (PJX.flow.choices, seg, field, picker material) and PJX.parts.st, under Usage's
   and Home's material. Status is always the shared mark plus a word. Every acting button carries data-cmd (its owner
   command, or gap:<what> where canon has none). Each section has at most one Advanced disclosure; the only other
   disclosures are Other services, More about keeping versions and the Review's closed lists (spec 3).

   Focus survives re-renders: buttons carry data-c-key (concept C restores them), text fields data-pjx-key (render()
   restores them with their caret), and protected inputs are the same element every time (s.secrets). */
(function (W) {
  'use strict';
  const PJX = W.PJX;
  if (!PJX || PJX.npui) return;
  const D = W.document;
  const { h, icon, tip, ENV } = PJX;
  const w = PJX.w, NP = () => PJX.np, R = () => PJX.rules, FL = () => PJX.flow;
  const cssEsc = (s) => (W.CSS && W.CSS.escape ? W.CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&'));

  /* ------------------------------------------------------------------ small parts */
  /* append what is there: a part that has nothing to say returns null */
  const put = (box, ...nodes) => { nodes.flat().forEach((n) => { if (n) box.appendChild(n); }); return box; };
  const st = (key, word, o) => PJX.parts.st(key, word, o);
  /* one fact: a status mark (or an icon) and a sentence */
  function line(key, text, o) {
    o = o || {};
    const lead = o.icon ? h('span.pjx-np-mk', { html: icon(o.icon, 14), 'aria-hidden': 'true' }) : h('span.pjx-np-mk', { html: key === 'working' ? PJX.mark(key, 14) : PJX.calm(key, 14), 'aria-hidden': 'true' });
    const el = h('div', { class: ['pjx-np-line', o.cls], 'data-tone': o.icon ? null : PJX.parts.tone(key), role: o.role || null }, lead, h('span.pjx-np-text', null, ...[].concat(text).map((x) => (typeof x === 'string' ? D.createTextNode(x) : x))));
    if (o.after) put(el, h('span.pjx-np-after', null, ...[].concat(o.after).filter(Boolean)));
    if (o.why) tip(el.querySelector('.pjx-np-text'), typeof text === 'string' ? text : '', o.why);
    return el;
  }
  const lines = (...kids) => h('div.pjx-np-lines', null, ...kids.flat().filter(Boolean));
  const code = (t) => h('span.pjx-np-code', { text: t, 'data-pmh-tag': 'literal' });
  const hint = (t, cls) => h('p', { class: ['pjx-np-hint', cls], text: t });
  const cap = (t) => h('div.pjx-np-cap', { text: t });
  const group = (label, ...kids) => h('div.pjx-np-group', null, label ? cap(label) : null, ...kids.flat().filter(Boolean));
  function btn(label, run, o) {
    o = o || {};
    const b = h('button', { type: 'button', class: ['pjx-btn', o.primary && 'is-primary', o.quiet && 'is-quiet'], 'data-c-key': o.key || null, 'data-cmd': o.cmd || null, 'aria-disabled': o.off ? 'true' : null, 'aria-describedby': o.describedby || null },
      o.icon ? h('span.pjx-np-bico', { html: icon(o.icon, 15), 'aria-hidden': 'true' }) : null, h('span', { text: label }));
    if (o.off) tip(b, label, o.off); else if (o.tip) tip(b, label, o.tip);
    b.addEventListener('click', (e) => { if (o.off) return; run && run(e); });
    return b;
  }
  function link(label, run, o) {
    o = o || {};
    const b = h('button.pjx-link', { type: 'button', text: label, 'data-c-key': o.key || null, 'data-cmd': o.cmd || null, 'data-pmh-tag': o.literal ? 'literal' : null });
    if (o.tip) tip(b, label, o.tip);
    b.addEventListener('click', (e) => { e.preventDefault(); run && run(e); });
    return b;
  }
  /* a radio group the way the keyboard expects one (spec 15): one tab stop (the chosen one, else the first that can be
     chosen), arrows and Home/End move to the next choice and choose it, disabled choices are skipped. Built over
     PJX.flow's parts, which A and B keep as they are */
  function roving(box, sel, pick) {
    const all = () => Array.from(box.querySelectorAll(sel));
    const ok = (b) => b.getAttribute('aria-disabled') !== 'true' && !b.classList.contains('is-off');
    const list = all(), on = list.find((b) => b.getAttribute('aria-checked') === 'true' && ok(b)) || list.find(ok);
    list.forEach((b) => { b.tabIndex = b === on ? 0 : -1; });
    box.addEventListener('keydown', (e) => {
      if (!/^(Arrow(Up|Down|Left|Right)|Home|End)$/.test(e.key)) return;
      const bs = all().filter(ok), i = bs.indexOf(D.activeElement); if (i < 0) return;
      e.preventDefault(); e.stopPropagation();
      const n = e.key === 'Home' ? bs[0] : e.key === 'End' ? bs[bs.length - 1] : bs[(i + (/Down|Right/.test(e.key) ? 1 : bs.length - 1)) % bs.length];
      if (!n || n === D.activeElement) return;
      n.focus(); if (n.getAttribute('aria-checked') !== 'true') pick(n);
    }, true);
    return box;
  }
  /* radio cards (PJX.flow.choices) whose buttons keep their focus across renders */
  function choices(key, items, sel, onPick, o) {
    o = o || {};
    const box = FL().choices(items, sel, onPick, { label: o.label || key, cls: o.cls || 'pjx-choices-list' });
    box.setAttribute('data-np-group', key);
    box.querySelectorAll('.pjx-choice').forEach((b) => { b.setAttribute('data-c-key', key + ':' + b.getAttribute('data-v')); const it = items.find((x) => x.id === b.getAttribute('data-v')); if (it && it.cmd) b.setAttribute('data-cmd', it.cmd); });
    if (!o.multi) roving(box, '.pjx-choice', (b) => b.click());
    return box;
  }
  function seg(key, items, value, onPick, label) {
    const box = FL().seg(items, value, onPick, label);
    box.querySelectorAll('.pjx-seg-btn').forEach((b, i) => { b.setAttribute('data-c-key', key + ':' + items[i].id); if (items[i].off) { b.setAttribute('aria-disabled', 'true'); tip(b, items[i].title, items[i].off); } });
    // a disabled segment says why and does nothing
    box.addEventListener('click', (e) => { const b = e.target.closest('.pjx-seg-btn'); if (b && b.getAttribute('aria-disabled') === 'true') e.stopImmediatePropagation(); }, true);
    roving(box, '.pjx-seg-btn', (b) => b.click());
    return box;
  }
  /* what YOLO does at this yes-point instead (shown while the run mode is YOLO): the mark, the word and one sentence */
  function yoloLine(text, o) {
    o = o || {};
    if (!(PJX.yolo && PJX.yolo()) && !o.always) return null;
    const said = String(text).replace(/^In YOLO, (\w)/, (m0, c) => c.toUpperCase());
    return h('div.pjx-yolo-line', { 'data-yolo': o.asks ? 'asks' : 'goes' }, h('span.pjx-st-mark', { html: PJX.calm(o.asks ? 'waiting' : 'info', 14), 'aria-hidden': 'true' }), h('span', null, h('b', { text: w('np.yolo.cap') + ' · ' }), said));
  }
  /* a text field, kept with its caret across renders by data-pjx-key */
  function input(key, value, ph, onInput, attrs) {
    const i = FL().textInput(value, ph, onInput, attrs);
    i.setAttribute('data-pjx-key', key);
    return i;
  }
  function field(label, inputEl, hintText, problem, o) {
    o = o || {};
    const f = FL().field(label, inputEl, hintText, problem);
    // while typing, a field's problem or hint is read quietly through aria-describedby; the section's own error line
    // (role=alert) speaks once, when Continue is pressed (spec 15)
    const say = f.querySelector('.pjx-field-problem, .pjx-field-hint');
    if (say) { say.removeAttribute('role'); say.id = inputEl.id + '-say'; inputEl.setAttribute('aria-describedby', say.id); }
    if (o.real) f.setAttribute('data-real-service', '');
    if (o.after) put(f, o.after);
    return f;
  }
  /* a protected input: the same element every render; the draft records only that one was typed */
  function secret(s, slot, label, hintText, o) {
    o = o || {};
    let el = s.secrets.get(slot);
    if (!el) {
      el = h('input', { type: 'password', class: 'pjx-input pjx-np-secret', autocomplete: 'off', spellcheck: 'false', 'data-pjx-key': 'secret:' + slot, placeholder: o.ph || '' });
      el.addEventListener('input', () => { const t = !!el.value; if (o.onTyped && t !== el._typed) { el._typed = t; o.onTyped(t); } });
      if (o.enter) el.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); o.enter(); } });
      s.secrets.set(slot, el);
    }
    const id = 'pjx-np-' + slot.replace(/\W/g, '-');
    el.id = id;
    const wrap = h('div', { class: ['pjx-field', o.problem && 'has-problem'], 'data-real-service': o.real ? '' : null }, h('label.pjx-field-label', { for: id, text: label }), el);
    if (o.problem) { put(wrap, h('div.pjx-field-problem', { role: 'alert', html: PJX.mark('warning', 13) + '<span>' + PJX.esc(o.problem) + '</span>' })); el.setAttribute('aria-invalid', 'true'); }
    else { el.removeAttribute('aria-invalid'); if (hintText) put(wrap, h('div.pjx-field-hint', { text: hintText })); }
    return wrap;
  }
  /* a switch: button[role=switch][aria-checked] */
  function sw(key, label, sub, on, onToggle) {
    const b = h('button.pjx-np-switch', { type: 'button', role: 'switch', 'aria-checked': String(!!on), 'data-c-key': key },
      h('span.pjx-np-switch-track', { 'aria-hidden': 'true' }, h('span.pjx-np-switch-knob')),
      h('span.pjx-np-switch-text', null, h('span.pjx-np-switch-label', { text: label }), sub ? h('span.pjx-np-switch-sub', { text: sub }) : null));
    b.addEventListener('click', () => onToggle(!on));
    return b;
  }
  /* a checkbox; o: sub, disabled (a reason), mixed */
  function check(key, label, on, onChange, o) {
    o = o || {};
    const inp = h('input', { type: 'checkbox', 'data-c-key': key, checked: on ? true : null, disabled: o.disabled ? true : null });
    inp.checked = !!on; inp.indeterminate = !!o.mixed;
    if (o.mixed) inp.setAttribute('aria-checked', 'mixed');
    const el = h('label', { class: ['pjx-check', 'pjx-np-check', o.disabled && 'is-off'] }, inp, h('span.pjx-np-check-text', null, h('span', { text: label }), o.sub ? h('span.pjx-np-check-sub', { text: o.sub }) : null));
    if (o.disabled && typeof o.disabled === 'string') tip(el, label, o.disabled);
    inp.addEventListener('change', () => onChange(inp.checked));
    return el;
  }
  /* a disclosure; its open state lives in the session's ui so a render keeps it */
  function disc(s, id, label, body, o) {
    o = o || {};
    const open = o.force || !!s.ui.disc[id];
    const rid = 'pjx-np-d-' + s.id + '-' + id;
    // held open because the chosen answer is inside it: a plain heading (a toggle that can't close would do nothing)
    const b = o.force ? h('div.pjx-np-disc.is-held', { id: rid + '-h', 'data-disc': o.kind || 'advanced' }, h('span', { text: label }))
      : h('button.pjx-np-disc', { type: 'button', 'aria-expanded': String(open), 'aria-controls': rid, 'data-c-key': 'disc:' + id, 'data-disc': o.kind || 'advanced' },
        h('span.pjx-np-disc-chev', { html: icon(open ? 'chevron-down' : 'chevron-right', 13), 'aria-hidden': 'true' }), h('span', { text: label }));
    if (!o.force) b.addEventListener('click', () => { s.ui.disc[id] = !open; s.changed(); });
    const wrap = h('div', { class: ['pjx-np-discwrap', o.cls], 'data-disc-kind': o.kind || 'advanced' }, b);
    if (open) put(wrap, h('div.pjx-np-discbody', { id: rid, role: 'region', 'aria-label': label }, ...[].concat(typeof body === 'function' ? body() : body).filter(Boolean)));
    return wrap;
  }
  /* demo hints [Demo only]: links that fill a value and say what happens */
  function demo(items, o) {
    o = o || {};
    if (o.hide) return null;
    return h('div.pjx-demo', { 'data-demo': o.id || '' }, h('span.pjx-demo-label', { text: 'Try it in this demo:' }),
      ...items.map((it, i) => h('span.pjx-demo-item', null, link(it.label, it.run, { key: 'demo:' + (o.id || '') + ':' + i, literal: true }), h('span.pjx-demo-out', { text: it.outcome }))));
  }
  /* a folder tree picker over any tree ({ path: [kids] }) */
  function picker(s, key, tree, root, onPick) {
    const at = s.ui['tree:' + key] || root, kids = tree[at] || [];
    const crumbs = h('div.pjx-crumbs');
    const parts = at === '~' ? ['~'] : at.split('/').filter((x, i) => x || i === 0);
    let acc = '';
    at.split('/').forEach((part, i) => {
      acc = i === 0 ? part : acc + '/' + part;
      const p = acc;
      if (i === 0 && !part) return;
      if (!tree[p] && p !== at) return;
      const b = link(i === 0 && part === '~' ? w('np.folder.home') : part, () => { s.ui['tree:' + key] = p; s.changed(); }, { key: key + ':crumb:' + p, literal: true });
      if (crumbs.children.length) put(crumbs, h('span.pjx-crumb-sep', { 'aria-hidden': 'true', html: icon('chevron-right', 12) }));
      put(crumbs, b);
    });
    void parts;
    const list = h('div.pjx-tree', { role: 'listbox', 'aria-label': w('np.folder.pick') });
    kids.forEach((k) => {
      const path = at + '/' + k;
      const b = h('button.pjx-tree-item', { type: 'button', role: 'option', 'data-c-key': key + ':item:' + path, html: icon('folder', 15) + '<span>' + PJX.esc(k) + '</span>' + (tree[path] ? icon('chevron-right', 13) : '') });
      b.addEventListener('click', () => { if (tree[path] && tree[path].length) { s.ui['tree:' + key] = path; s.changed(); } else onPick(path); });
      put(list, b);
    });
    if (!kids.length) put(list, hint(w('np.folder.none')));
    const top = at === root || !tree[at];
    const use = btn(w('np.folder.pickThis'), () => onPick(at), { key: key + ':use', off: top && !kids.length ? null : top ? w('np.folder.pickFirst') : null });
    return h('div.pjx-picker.pjx-np-picker', null, crumbs, list, h('div.pjx-row', null, use));
  }
  /* a mini-step inside a section: "1 of 3", folded to one line with Change once it is done (spec 2.2, 8 rule 9) */
  function mini(o) {
    const head = h('div.pjx-np-minihead', null, h('span.pjx-np-mininum', { text: w('np.sec.step', { n: o.n, total: o.total }) }), h('span.pjx-np-minititle', { text: o.title }));
    const el = h('div', { class: ['pjx-np-mini', 'is-' + o.state], 'data-np-esc': o.state === 'open' && o.esc ? o.key : null }, head);
    if (o.state === 'open' && o.esc && o.s) { o.s.ui.esc = o.s.ui.esc || {}; o.s.ui.esc[o.key] = o.esc; }
    if (o.state === 'done') {
      put(head, h('span.pjx-np-minisum', null, PJX.parts.st('complete', o.summary || 'Done')));
      if (o.change) put(head, link(w('np.sec.change'), o.change, { key: o.key + ':change' }));
    } else if (o.state === 'later') {
      el.classList.add('is-later');
    } else put(el, h('div.pjx-np-minibody', null, ...[].concat(o.body || []).filter(Boolean)));
    return el;
  }
  const working = (text) => line('working', text, { role: 'status', cls: 'is-working' });

  /* ------------------------------------------------------------------ the look inside (6.2.1) */
  function lookView(s, o, opts) {
    opts = opts || {};
    if (!o) return null;
    const t = o.target || {};
    if (o.state === 'working') return working(w('np.look.checking', { folder: t.label }));
    if (o.state === 'failed') {
      const f = o.result.fail || 'read';
      return h('div.pjx-np-look', null, line('failed', w('np.look.fail.' + f, { path: t.path, device: NP().holderName(s) })),
        h('div.pjx-row', null, btn(w('np.look.retry'), () => NP().retry(s, Object.keys(s.ops).find((k) => s.ops[k] === o)), { key: 'look:retry', cmd: 'cmd.project.source_location.test' }), btn(w('np.look.other'), () => opts.other && opts.other(), { key: 'look:other', quiet: true })));
    }
    const i = o.result, rows = [];
    if (i.partial) {
      rows.push(line('pending', w('np.look.unknownHist', { reason: i.reason })), line('pending', w('np.look.unknownRest')));
      rows.push(h('div.pjx-row', null, btn(w('np.look.again'), () => { s.ui.lookAgain = (s.ui.lookAgain || 0) + 1; s.changed(); }, { key: 'lookagain', cmd: 'cmd.project.source_location.test' })));
      return h('div.pjx-np-look', { 'data-cmd': 'cmd.source_control.backend.detect + new:inspection', 'data-partial': '' }, cap(w('np.look.title')), lines(rows));
    }
    if (i.history === 'git') rows.push(line('complete', w('np.look.git', { branch: i.branch })));
    else if (i.history === 'jujutsu') rows.push(line('complete', w('np.look.jj', { bookmark: i.branch })));
    else rows.push(line('off', w('np.look.none')));
    if (i.online) rows.push(line('info', i.online.address ? w('np.look.onlineAddress', { address: i.online.address }) : w('np.look.online', { service: i.online.service, project: i.online.repo })));
    else rows.push(line('off', w('np.look.onlineNone')));
    if (i.original) rows.push(line('info', w('np.look.original', { project: i.original.repo, service: i.original.service })));
    if (i.changed) rows.push(line('info', i.changed === 1 ? w('np.look.changesOne') : w('np.look.changes', { n: i.changed })));
    if (i.submodules && i.submodules.length) rows.push(line('info', w('np.look.submodules', { n: i.submodules.length, list: i.submodules.join(', ') })));
    if (i.lfs) rows.push(line('info', w('np.look.lfs', { size: i.lfs })));
    if (i.hooks && i.hooks.length) rows.push(line('info', w('np.look.hooks', { list: i.hooks.join(', ') })));
    if (i.stack && i.stack.length) rows.push(line(null, w('np.look.stack', { stack: i.stack.join(' · ') }), { icon: 'code' }));
    if (i.size && !i.known) rows.push(line(null, w('np.look.size', { size: i.size }), { icon: 'code' }));
    const known = i.known && PJX.get(i.known), same = i.sameOnline && PJX.get(i.sameOnline);
    if (known) rows.push(line('blocked', w('np.look.known', { project: known.name }), { after: btn(w('np.look.knownOpen', { project: known.name }), () => PJX.ACT.open(known.id), { key: 'look:open', cmd: 'cmd.project.open' }) }));
    if (same) rows.push(line('info', w('np.look.sameOnline', { project: same.name, name: NP().nameOf(s) || same.name }), { after: link(w('np.look.sameOnlineOpen', { project: same.name }), () => PJX.ACT.open(same.id), { key: 'look:same', cmd: 'cmd.project.open' }) }));
    if (i.online && !known && !opts.noNext) rows.push(hint(w('np.look.next')));
    return h('div.pjx-np-look', { 'data-cmd': 'cmd.source_control.backend.detect + new:inspection' }, cap(w('np.look.title')), lines(rows));
  }

  /* ------------------------------------------------------------------ the computer that does the work */
  function runsOnSeg(s, key) {
    if (!NP().serverOn() && s.d.runsOn === 'here') return null;
    const items = ENV.computers.map((c) => ({ id: c.id, title: c.name, sub: c.detail, off: c.id === 'homenas' && !NP().serverOn() ? w('np.loc.serverOff', { server: c.name }) : null }));
    return seg(key || 'runsOn', items, s.d.runsOn, (v) => NP().set(s, 'runsOn', v), w('np.loc.runsOn'));
  }

  /* ------------------------------------------------------------------ section: start (6.1) */
  function secStart(s) {
    const d = s.d, items = [
      { id: 'basics', glyph: 'file-plus', title: w('np.start.basics'), sub: w('np.start.basicsSub') },
      { id: 'empty', glyph: 'folder', title: w('np.start.empty'), sub: w('np.start.emptySub') }
    ].concat(ENV.starters.map((x) => ({ id: 'starter:' + x.id, glyph: x.kind === 'folder' ? 'folder' : 'cloud', title: x.name, sub: x.kind === 'folder' ? w('np.start.starterSub.folder') : w('np.start.starterSub.template', { service: x.service, project: x.project }) })));
    const box = h('div.pjx-np-start');
    put(box, choices('start', items, d.start, (v) => NP().set(s, 'start', v), { label: w('np.start.title') }));
    const stt = ENV.starters.find((x) => 'starter:' + x.id === d.start);
    put(box, lines(
      d.start === 'basics' ? line('complete', w('np.start.fact.basics')) : null,
      stt && stt.kind === 'folder' ? line('complete', w('np.start.fact.folder', { adds: stt.adds, from: stt.from })) : null,
      stt && stt.kind === 'template' ? line('complete', w('np.start.fact.template', { project: stt.project })) : null,
      line(null, w('np.start.what'), { icon: 'info' }),
      line(null, ENV.starters.length ? w('np.start.manage') : w('np.start.noStarters'), { icon: 'settings', after: link(w('np.start.manageLink'), () => PJX.toast('Settings › New projects › Starters', 'A proposal waiting on your decision: the basics’ defaults and your own starters live there, apart from Saved setups.', 'info'), { key: 'start:manage', cmd: 'cmd.settings.open' }) }),
      hint(w('np.start.pending'), 'is-concept')));
    put(box, line(null, w('np.start.filesWhere'), { icon: 'info' }));
    return box;
  }

  /* ------------------------------------------------------------------ section: folder (6.2) */
  function secFolder(s) {
    const d = s.d, box = h('div.pjx-np-folder'), here = d.runsOn === 'here';
    const ro = runsOnSeg(s, 'folder:runsOn');
    if (ro) put(box, group(w('np.folder.on'), ro, hint(w('np.folder.onHint'))));
    const hd = here ? null : NP().comp(d.runsOn).device, hdev = hd ? NP().dev(hd) : null;
    const list = here ? ENV.recentFolders.map((r) => ({ id: r.path, glyph: 'folder', title: r.name, sub: r.path })) : ((hdev || { folders: [] }).folders || []).map((f) => ({ id: f, glyph: 'folder', title: f.split('/').pop(), sub: f }));
    if (d.folder.path && !list.some((x) => x.id === d.folder.path)) list.push({ id: d.folder.path, glyph: 'folder', title: d.folder.path.split('/').pop(), sub: d.folder.path });
    put(box, group(here ? w('np.folder.recent') : w('np.folder.recentOn', { computer: NP().comp(d.runsOn).name }), choices('folder:pick', list, d.folder.path, (v) => { d.folder.browse = false; NP().set(s, 'folder.path', v); }, { label: w('np.folder.recent') })));
    put(box, h('div.pjx-row', null, btn(w('np.folder.browse'), () => { d.folder.browse = !d.folder.browse; s.changed(); }, { key: 'folder:browse', icon: 'folder-search', quiet: true })));
    if (d.folder.browse) put(box, here ? picker(s, 'folder', ENV.tree, '~', (p) => { d.folder.browse = false; NP().set(s, 'folder.path', p); }) : picker(s, 'folder-' + hd, ENV.trees[hd] || {}, Object.keys(ENV.trees[hd] || { '~': [] })[0], (p) => { d.folder.browse = false; NP().set(s, 'folder.path', p); }));
    put(box, demo([{ label: '~/Code/budget-tracker', outcome: 'linked on GitHub', run: () => NP().set(s, 'folder.path', '~/Code/budget-tracker') }, { label: '~/Code/game-jam', outcome: 'submodules and Git LFS', run: () => NP().set(s, 'folder.path', '~/Code/game-jam') }, { label: '~/Projects/tastebook', outcome: 'already a Project', run: () => NP().set(s, 'folder.path', '~/Projects/tastebook') }], { id: 'folder', hide: !!d.folder.path || !here }));
    put(box, lookView(s, NP().look(s), { other: () => { NP().set(s, 'folder.path', null); } }));
    return box;
  }

  /* ------------------------------------------------------------------ section: device (6.3) */
  function secDevice(s) {
    const d = s.d, dv = d.device, box = h('div.pjx-np-device'), cn = NP().comp(d.runsOn).name;
    const ro = runsOnSeg(s, 'device:runsOn');
    if (ro) put(box, group(w('np.device.runsOn'), ro, hint(w('np.device.runsOnHint'))));
    put(box, group(w('np.device.how'), seg('device:method', [{ id: 'ssh', title: w('np.device.ssh'), sub: w('np.device.sshSub') }, { id: 'smb', title: w('np.device.smb'), sub: w('np.device.smbSub') }, { id: 'nfs', title: w('np.device.nfs'), sub: w('np.device.nfsSub') }, { id: 'mounted', title: w('np.device.mounted'), sub: w('np.device.mountedSub') }], dv.method, (v) => NP().set(s, 'device.method', v), w('np.device.how')),
      hint({ ssh: w('np.device.sshSub'), smb: w('np.device.smbSub'), nfs: w('np.device.nfsSub'), mounted: w('np.device.mountedSub') }[dv.method])));
    if (dv.method === 'ssh') sshPart(s, box, cn);
    else if (dv.method === 'smb' || dv.method === 'nfs') sharePart(s, box, cn);
    else volPart(s, box, cn);
    // the device section's one Advanced: the SMB domain and the technical fingerprint
    const x = NP().dev(dv.id);
    const adv = [];
    if (dv.method === 'smb') adv.push(field(w('np.smb.domain'), input('smbDomain', dv.smbDomain, '', (v) => { dv.smbDomain = v; }), w('np.smb.domainHint')));
    if (dv.method === 'ssh' && x && x.fingerprint && !NP().trusted(s, x.id)) adv.push(h('div.pjx-field', null, cap(w('np.connect.id.techLabel')), code(x.fingerprint)));
    if (adv.length) put(box, disc(s, 'device-adv', w('np.sec.advanced'), adv));
    put(box, lookView(s, NP().look(s), { other: () => NP().set(s, 'device.path', null) }));
    return box;
  }
  function sshPart(s, box, cn) {
    const d = s.d, dv = d.device, L = NP().devicesFor(s), self = NP().comp(d.runsOn);
    const row = (x, isFound) => {
      const tr = NP().trusted(s, x.id), off = x.online === false;
      const sub = [x.brand, x.address].filter(Boolean).join(' · ') + ' · ' + (off ? w('np.device.offline') : x.pm && x.server ? w('np.device.pm') + ' · ' + w('np.device.paired', { computer: 'this computer' }) : tr ? w('np.device.trusted', { computer: cn }) : w('np.device.notConnected'));
      return { id: x.id, glyph: x.glyph || 'server', title: x.name, sub, disabled: off ? w('np.device.offlineWhy', { device: x.name }) : null, meta: off ? PJX.calm('offline', 13) : tr ? PJX.calm('complete', 13) : PJX.calm('pending', 13) };
    };
    if (self.device) put(box, hint(w('np.device.self', { computer: self.name })));
    put(box, group(w('np.device.yours'), choices('device:pick', L.yours.map((x) => row(x.dev)), dv.id, (v) => NP().set(s, 'device.id', v), { label: w('np.device.yours') })));
    const off = L.yours.find((x) => x.dev.online === false);
    if (off) put(box, line('offline', w('np.device.offlineWhy', { device: off.dev.name }), { after: btn(w('np.device.retry'), () => { PJX.toast(off.dev.name + ' still isn’t answering', 'Turn it on or check its network.', 'warn'); }, { key: 'device:retry', cmd: 'cmd.project.source_location.test', quiet: true }) }));
    put(box, group(w('np.device.found'), choices('device:found', L.found.map((x) => row(x.dev, true)), dv.id, (v) => NP().set(s, 'device.id', v), { label: w('np.device.found') })));
    // type an address instead
    const typing = dv.typing;
    put(box, h('div.pjx-row', null, link(w('np.device.address'), () => { dv.typing = !dv.typing; s.changed(); }, { key: 'device:typing', cmd: 'cmd.server.discovery.refresh' })));
    if (typing) {
      const portBad = dv.port && !(Number(dv.port) >= 1 && Number(dv.port) <= 65535 && /^\d+$/.test(dv.port));
      const o = dv.asked ? NP().lookFor(s) : null;
      put(box, h('div.pjx-np-pair', null,
        field(w('np.device.addressLabel'), input('devAddr', dv.address, '', (v) => { dv.address = v; }), w('np.device.addressHint'), null, { real: true }),
        field(w('np.device.port'), input('devPort', dv.port, '22', (v) => { dv.port = v; s.changed(); }, { inputmode: 'numeric' }), '', portBad ? w('np.device.portBad') : '')));
      put(box, h('div.pjx-row', null, btn(w('np.device.lookFor'), () => { if (portBad || !String(dv.address).trim()) return; dv.asked = String(dv.address).trim(); s.changed(); }, { key: 'device:lookfor', cmd: 'cmd.server.discovery.refresh' })));
      if (o && o.state === 'working') put(box, working(w('np.device.looking')));
      else if (o && o.state === 'failed') put(box, line('offline', w('np.device.noAnswer', { address: dv.asked })));
      else if (o && o.state === 'done' && dv.id !== o.result.id) { const hit = NP().dev(o.result.id); put(box, line('complete', 'Found ' + hit.name + ' at ' + dv.asked + '.', { after: btn('Use ' + hit.name, () => { dv.typing = false; NP().set(s, 'device.id', hit.id); }, { key: 'device:usefound' }) })); }
      put(box, demo([{ label: '192.168.1.40', outcome: 'works', run: () => { dv.address = '192.168.1.40'; dv.port = '22'; s.changed(); } }, { label: '192.168.1.99', outcome: 'no answer', run: () => { dv.address = '192.168.1.99'; s.changed(); } }, { label: 'port 99999', outcome: 'wrong', run: () => { dv.port = '99999'; s.changed(); } }], { id: 'addr' }));
    }
    const x = NP().dev(dv.id);
    if (!x || x.online === false) return;
    if (!NP().trusted(s, x.id)) {
      // (2.07) a device that runs Puppet Master is paired with; (2.11) one whose SSH is off says where to turn it on
      if (x.pm && !(s.ui.sshInstead || {})[x.id]) { put(box, pairSteps(s, x)); return; }
      if (x.ssh === false && !(s.ui.sshOn || {})[x.id]) { put(box, sshOffView(s, x)); return; }
      put(box, connectSteps(s, x)); return;
    }
    devFolders(s, box, x.folders, ENV.trees[x.id], (ENV.trees[x.id] && Object.keys(ENV.trees[x.id])[0]) || '~', x.name);
  }
  /* (GUIDED-FLOWS 2.07) pair with a device that runs Puppet Master: an approval on a device you already use, a code shown on
     it, or its QR code; SSH stays one press away. Pairing is human-only; the look inside comes after, as on every route */
  function pairSteps(s, x) {
    const d = s.d, c = d.runsOn, key = 'pair:' + c + ':' + x.id + ':' + (s.ui.pairTry || 0), o = s.ui.pairing ? NP().peek(s, key) : null;
    const how = s.ui.pairHow || 'approval';
    const box = h('div.pjx-np-connect', { 'data-cmd': 'cmd.server.pair (approval, code or QR)' }, cap(w('np.pair.title', { device: x.name })), h('p.pjx-np-say', { text: w('np.pair.lead', { device: x.name }) }));
    put(box, choices('pair:how', [{ id: 'approval', glyph: 'phone', title: w('np.pair.approval', { approver: x.approver || 'your phone' }), sub: w('np.pair.approvalSub') }, { id: 'code', glyph: 'key', title: w('np.pair.code'), sub: w('np.pair.codeSub', { device: x.name }) }, { id: 'qr', glyph: 'grid', title: w('np.pair.qr'), sub: w('np.pair.qrSub') }], how, (v) => { s.ui.pairHow = v; s.changed(); }, { label: w('np.pair.title', { device: x.name }) }));
    if (how === 'code') put(box, field(w('np.pair.codeLabel'), input('pairCode', s.ui.pairCode || '', x.code || 'ABCD-1234', (v) => { s.ui.pairCode = v; }), w('np.pair.codeHint', { device: x.name }), s.ui.pairBad ? w('np.pair.codeBad') : '', { real: true }));
    if (o && o.state === 'working') put(box, working(how === 'approval' ? w('np.pair.waiting', { approver: x.approver || 'your phone' }) : w('np.pair.checking')));
    else if (o && o.state === 'failed') put(box, line('failed', o.result.fail === 'denied' ? w('np.pair.denied', { approver: x.approver || 'your phone' }) : w('np.pair.expired')));
    if (!(o && o.state === 'working')) put(box, h('div.pjx-row', null, btn(o && o.state === 'failed' ? w('np.pair.again') : w('np.pair.go'), () => {
      if (how === 'code' && String(s.ui.pairCode || '').trim().toUpperCase() !== String(x.code || '').toUpperCase()) { s.ui.pairBad = true; s.changed(); return; }
      s.ui.pairBad = false; s.ui.pairTry = (s.ui.pairTry || 0) + 1; s.ui.pairing = true; const k2 = 'pair:' + c + ':' + x.id + ':' + s.ui.pairTry;
      NP().op(s, k2, 1200, () => { if (s.ui.pairDeny) { s.ui.pairDeny = false; return { fail: 'denied' }; } PJX.S.world.facts.trusted[c + ':' + x.id] = true; return { ok: true }; });
      s.changed();
    }, { key: 'pair:go', primary: true, cmd: 'cmd.server.pair' }), link(w('np.pair.ssh'), () => { s.ui.sshInstead = Object.assign({}, s.ui.sshInstead, { [x.id]: true }); s.changed(); }, { key: 'pair:ssh' })));
    put(box, demo([{ label: x.code || 'R5N2-C8VD', outcome: 'the code it shows', run: () => { s.ui.pairHow = 'code'; s.ui.pairCode = x.code; s.changed(); } }, { label: 'Declined on the phone', outcome: 'refused, try again', run: () => { s.ui.pairDeny = true; s.changed(); } }], { id: 'pair' }));
    put(box, yoloLine(w('np.yolo.identity'), { asks: true }));
    return box;
  }
  /* (GUIDED-FLOWS 2.11) SSH is turned off on the device: where its own settings turn it on, Check again, or its shared folder */
  function sshOffView(s, x) {
    const c = s.d.runsOn, key = 'sshon:' + c + ':' + x.id + ':' + (s.ui.sshTry || 0), o = s.ui.sshTry ? NP().peek(s, key) : null;
    const box = h('div.pjx-np-connect', { 'data-cmd': 'cmd.server.discovery.refresh (SSH check)' }, cap(w('np.sshoff.title', { device: x.name })));
    put(box, line('blocked', w('np.sshoff.lead', { device: x.name })));
    put(box, line(null, w('np.sshoff.vendor.' + (x.vendor || 'other'), { device: x.name, brand: x.brand }), { icon: 'settings' }));
    if (o && o.state === 'working') put(box, working(w('np.sshoff.checking', { device: x.name })));
    else if (o && o.state === 'failed') put(box, line('offline', w('np.sshoff.still', { device: x.name })));
    put(box, h('div.pjx-row', null, btn(w('np.sshoff.again'), () => { s.ui.sshTry = (s.ui.sshTry || 0) + 1; const k2 = 'sshon:' + c + ':' + x.id + ':' + s.ui.sshTry; NP().op(s, k2, 900, () => { if (!s.ui.sshTurnedOn) return { fail: 'off' }; s.ui.sshOn = Object.assign({}, s.ui.sshOn, { [x.id]: true }); return { ok: true }; }); s.changed(); }, { key: 'sshoff:again', primary: true, cmd: 'cmd.server.discovery.refresh' }),
      x.smb ? link(w('np.sshoff.share'), () => NP().set(s, 'device.method', 'smb'), { key: 'sshoff:share' }) : null));
    put(box, demo([{ label: 'I turned SSH on', outcome: 'then Check again works', run: () => { s.ui.sshTurnedOn = true; s.changed(); } }], { id: 'sshoff', hide: !!s.ui.sshTurnedOn }));
    return box;
  }
  /* connect a new device by SSH (6.3; GUIDED-FLOWS 2.13, 2.16): 1 is it yours (a changed identity is shown, never accepted
     quietly), 2 your username there, then the key, said as it is on that device (works already, locked, needs adding),
     3 add it once, with an uncertain result checked before anything is tried again */
  function connectSteps(s, x) {
    const d = s.d, dv = d.device, cn = NP().comp(d.runsOn).name, F0 = PJX.S.world.facts;
    const keys = (ENV.sshKeys[d.runsOn] || []).concat([{ id: 'new', name: w('np.connect.key.new'), sub: w('np.connect.key.newSub') }]);
    const keyOf = (k) => keys.find((x2) => x2.id === k) || {};
    const keyName = (k) => keyOf(k).name || '';
    const works = (k) => (keyOf(k).works || []).indexOf(x.id) >= 0;
    const locked = (k) => !!keyOf(k).passphrase && !(s.ui.unlocked || {})[k];
    const changed = !!s.ui.idChanged && !s.ui.idReplaced;
    const step1 = dv.idOk ? 'done' : 'open', step2 = !dv.idOk ? 'later' : dv.keyDone ? 'done' : 'open', step3 = !dv.keyDone ? 'later' : 'open';
    const box = h('div.pjx-np-connect', { 'data-cmd': 'cmd.server.ssh.trust + cmd.server.ssh.key_install (human-only)' }, cap(w('np.connect.title', { device: x.name })));
    const backToKey = () => { dv.keyDone = false; const el = s.secrets.get('devpw'); if (el) el.value = ''; s.secrets.delete('devpw'); s.ui.keyOp = null; Object.keys(s.ops).forEach((k) => { if (/^keyadd:/.test(k)) delete s.ops[k]; }); s.ui.connNeedBoth = false; s.ui.uncertain = false; s.changed(); };
    const body1 = changed ? [
      line('blocked', w('np.connect.changed.lead', { device: x.name, computer: cn })),
      h('div.pjx-np-pair', null, h('div.pjx-field', null, cap(w('np.connect.changed.was')), code('SHA256:1qP0f9Wm3cXr7LtV2bN8aZ4kY6hS5dJ0uE1oG9iR3Tw')), h('div.pjx-field', null, cap(w('np.connect.changed.now')), code(x.fingerprint))),
      h('div.pjx-row', null, btn(w('np.connect.changed.replace'), () => { s.ui.idReplaced = true; dv.idOk = true; dv.key = dv.key || 'ed25519'; s.changed(); }, { key: 'conn:replace', cmd: 'cmd.server.ssh.trust (replace, human-only)' }), btn(w('np.connect.id.stop'), () => NP().set(s, 'device.id', null), { key: 'conn:stop', quiet: true })),
      yoloLine(w('np.yolo.identity'), { asks: true })]
      : [h('p.pjx-np-say', { text: w('np.connect.id.lead', { device: x.name }) }), h('div.pjx-np-words', { text: x.words, 'data-pmh-tag': 'literal' }),
        h('div.pjx-row', null, btn(w('np.connect.id.yes'), () => { dv.idOk = true; dv.key = dv.key || 'ed25519'; s.changed(); }, { key: 'conn:yes', primary: false }), btn(w('np.connect.id.stop'), () => NP().set(s, 'device.id', null), { key: 'conn:stop', quiet: true })),
        yoloLine(w('np.yolo.identity'), { asks: true }), hint('The technical fingerprint is under Advanced.'),
        demo([{ label: x.name + '’s identity changed', outcome: 'shown side by side, never accepted quietly', run: () => { s.ui.idChanged = true; s.changed(); } }], { id: 'idchanged' })];
    put(box, mini({ n: 1, total: 3, key: 'conn1', s, title: changed ? w('np.connect.changed.title', { device: x.name }) : w('np.connect.id.title'), state: step1, summary: s.ui.idReplaced ? w('np.connect.changed.done', { device: x.name }) : w('np.connect.id.done', { device: x.name }),
      change: () => { dv.idOk = false; dv.keyDone = false; s.ui.idReplaced = false; const el = s.secrets.get('devpw'); if (el) el.value = ''; s.secrets.delete('devpw'); s.ui.keyOp = null; s.changed(); },
      esc: () => NP().set(s, 'device.id', null), body: body1 }));
    // step 2: the account first, then each key as it is on that device
    const user = String(dv.user || '').trim();
    const userBad = user && /@/.test(user) ? w('np.connect.userEmail', { device: x.name }) : s.ui.connUserErr ? w('np.connect.userEmpty', { device: x.name }) : '';
    const keyState = (k) => (k.weak ? w('np.connect.key.old') : k.id === 'new' ? k.sub : !user ? w('np.connect.key.userFirst') : works(k.id) ? w('np.connect.key.works', { device: x.name, user }) : locked(k.id) ? w('np.connect.key.locked') : w('np.connect.key.notAdded', { device: x.name }));
    const sel = keyOf(dv.key);
    const body2 = [
      field(w('np.connect.user', { device: x.name }), input('devUser', dv.user, 'jared', (v) => { dv.user = v; s.ui.connUserErr = false; s.changed(); }), w('np.connect.userHint', { device: x.name }), userBad, { real: true }),
      demo([{ label: 'jared', outcome: 'works', run: () => { dv.user = 'jared'; s.changed(); } }, { label: 'jared@example.com', outcome: 'wrong', run: () => { dv.user = 'jared@example.com'; s.changed(); } }], { id: 'user', hide: dv.user === 'jared' }),
      h('p.pjx-np-say', { text: w('np.connect.key.lead', { computer: d.runsOn === 'here' ? 'this computer' : cn }) }),
      choices('conn:key', keys.map((k) => ({ id: k.id, glyph: 'key', title: k.name, sub: (k.where === 'agent' ? w('np.connect.key.agent') : k.where ? w('np.connect.key.file') : '') + (k.where ? ' · ' : '') + keyState(k), disabled: k.weak ? w('np.connect.key.old') : null })), dv.key, (v) => NP().set(s, 'device.key', v), { label: w('np.connect.key.title') }),
      sel.passphrase && locked(sel.id) && user ? secret(s, 'keypass', w('np.connect.key.pass', { key: sel.name }), w('np.connect.key.passHint'), { problem: s.ui.passBad ? w('np.connect.key.passBad') : '', real: true }) : null,
      sel.passphrase && locked(sel.id) && user ? demo([{ label: 'blue kettle', outcome: 'unlocks it', run: () => { const el = s.secrets.get('keypass'); if (el) el.value = 'blue kettle'; s.changed(); } }], { id: 'keypass' }) : null,
      line(null, w('np.connect.key.reads'), { icon: 'lock' }),
      h('div.pjx-row', null, btn(sel.passphrase && locked(sel.id) && user ? w('np.connect.key.unlock') : w('np.sec.continue'), () => {
        if (!user) { s.ui.connUserErr = true; s.changed(); return; }
        if (/@/.test(user)) return;
        if (sel.passphrase && locked(sel.id)) { const el = s.secrets.get('keypass'), v = el ? el.value : ''; if (el) el.value = ''; if (v !== sel.passphrase) { s.ui.passBad = true; s.changed(); return; } s.ui.passBad = false; s.ui.unlocked = Object.assign({}, s.ui.unlocked, { [sel.id]: true }); }
        // a key that already works there needs no installing: the device is connected now (2.13)
        if (works(sel.id)) { F0.trusted[d.runsOn + ':' + x.id] = true; s.changed(); return; }
        dv.keyDone = true; s.changed();
      }, { key: 'conn:keygo' }))];
    put(box, mini({ n: 2, total: 3, key: 'conn2', s, title: w('np.connect.key.titleUser'), state: step2, summary: w('np.connect.key.done', { key: keyName(dv.key), user: dv.user }), change: backToKey, esc: () => { dv.idOk = false; s.changed(); }, body: body2 }));
    let body3 = [];
    if (step3 === 'open') {
      const o = s.ui.keyOp ? NP().peek(s, s.ui.keyOp) : null;
      if (o && o.state === 'working') body3 = [working(w('np.connect.working', { device: x.name }))];
      else if (s.ui.uncertain) {
        // (2.16) the connection dropped before the device answered: check what happened before anything is tried again
        const rk = 'keycheck:' + d.runsOn + ':' + x.id + ':' + (s.ui.reconTry || 0), r = s.ui.reconTry ? NP().peek(s, rk) : null;
        body3 = [line('warning', w('np.connect.uncertain', { device: x.name })),
          r && r.state === 'working' ? working(w('np.connect.reconciling', { device: x.name })) : h('div.pjx-row', null, btn(w('np.connect.reconcile'), () => { s.ui.reconTry = (s.ui.reconTry || 0) + 1; const k2 = 'keycheck:' + d.runsOn + ':' + x.id + ':' + s.ui.reconTry; NP().op(s, k2, 900, () => { F0.trusted[d.runsOn + ':' + x.id] = true; s.ui.uncertain = false; return { ok: true, was: 'added' }; }); s.changed(); }, { key: 'conn:reconcile', primary: true, cmd: 'cmd.server.ssh.key_install (reconcile, no second install)' })),
          hint(w('np.connect.uncertainHint'))];
      } else {
        const fail = o && o.state === 'failed' && !o.result.uncertain ? w('np.connect.signin.wrong', { device: x.name }) : s.ui.connNeedBoth ? w('np.connect.signin.needBoth') : '';
        body3 = [h('p.pjx-np-say', { text: w('np.connect.signin.lead') }),
          seg('conn:how', [{ id: 'pw', title: 'Sign in once' }, { id: 'self', title: w('np.connect.signin.self') }], dv.signin, (v) => { dv.signin = v; s.changed(); }, 'How to add the key'),
          dv.signin === 'pw' ? secret(s, 'devpw', w('np.connect.signin.pwFor', { user, device: x.name }), w('np.connect.signin.pwHint'), { problem: fail, real: true, enter: () => go() }) : null,
          dv.signin === 'pw' ? demo([{ label: 'correct horse', outcome: 'works', run: () => { const el = s.secrets.get('devpw'); if (el) el.value = 'correct horse'; s.changed(); } }, { label: 'not-the-password', outcome: 'refused', run: () => { const el = s.secrets.get('devpw'); if (el) el.value = 'not-the-password'; s.changed(); } }, { label: 'the connection drops', outcome: 'not sure it was added', run: () => { s.ui.dropNext = true; const el = s.secrets.get('devpw'); if (el) el.value = 'correct horse'; s.changed(); } }], { id: 'devpw' }) : null,
          dv.signin === 'self' ? h('div.pjx-np-say', null, w('np.connect.signin.selfLead', { device: x.name, key: keyName(dv.key) }), h('div.pjx-np-words.is-code', { text: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPm…q7 jared@puppet-master', 'data-pmh-tag': 'literal' })) : null,
          yoloLine(w('np.yolo.signin'), { asks: true }),
          h('div.pjx-row', null, btn(dv.signin === 'pw' ? w('np.connect.signin.add') : w('np.connect.signin.selfCheck'), () => go(), { key: 'conn:add', primary: true, cmd: 'cmd.server.ssh.key_install (human-only)' }))];
      }
    }
    function go() {
      if (s.ui.dropNext) { s.ui.dropNext = false; const el = s.secrets.get('devpw'); if (el) el.value = ''; s.ui.uncertain = true; s.changed(); return; }
      const r = NP().addKey(s, dv.signin);
      s.ui.connNeedBoth = !!(r && r.fail === 'needBoth');
      s.changed();
    }
    put(box, mini({ n: 3, total: 3, key: 'conn3', s, title: w('np.connect.signin.title', { device: x.name }), state: step3, body: body3, esc: backToKey }));
    return box;
  }
  /* folders on a device, a share or a drive, then the look inside */
  function devFolders(s, box, folders, tree, root, where) {
    const d = s.d, dv = d.device;
    if (NP().trusted(s, dv.id) && s.ui.pendingPath && !dv.path) { const p = s.ui.pendingPath; s.ui.pendingPath = null; dv.path = p; }
    put(box, line('complete', dv.method === 'ssh' ? w('np.connect.done') : where, { cls: 'is-quiet' }));
    const made = (s.ui.newFolders || []).filter((f) => f.indexOf(root) === 0);
    const list = (folders || []).concat(made).map((f) => ({ id: f, glyph: made.indexOf(f) >= 0 ? 'folder-plus' : 'folder', title: f.split('/').pop(), sub: made.indexOf(f) >= 0 ? f + ' · ' + w('np.device.newFolderSub') : f }));
    if (dv.path && !list.some((x) => x.id === dv.path)) list.push({ id: dv.path, glyph: 'folder', title: dv.path.split('/').pop(), sub: dv.path });
    put(box, group(w('np.device.folders', { device: dv.method === 'ssh' ? (NP().dev(dv.id) || {}).name : where.replace(/^Opened |\.$/g, '') }), choices('device:path', list, dv.path, (v) => { dv.browse = null; NP().set(s, 'device.path', v); }, { label: w('np.folder.pick') })));
    if (tree) {
      put(box, h('div.pjx-row', null, btn(w('np.folder.browse'), () => { dv.browse = dv.browse ? null : root; s.changed(); }, { key: 'device:browse', icon: 'folder-search', quiet: true }), btn(w('np.folder.newFolder'), () => { s.ui.newFolderOpen = !s.ui.newFolderOpen; s.changed(); }, { key: 'device:newfolder', quiet: true, icon: 'folder-plus' })));
      if (dv.browse) put(box, picker(s, 'dev-' + (dv.id || dv.share || dv.volume), tree, root, (p) => { dv.browse = null; NP().set(s, 'device.path', p); }));
      if (s.ui.newFolderOpen) {
        const nm = String(s.ui.newFolderName || ''), bad = nm && R().folderNameProblem(nm);
        const make = () => { const v = String(s.ui.newFolderName || '').trim(); if (!v || R().folderNameProblem(v)) return; const pth = root.replace(/\/+$/, '') + '/' + v; s.ui.newFolders = (s.ui.newFolders || []).concat([pth]); s.ui.newFolderOpen = false; s.ui.newFolderName = ''; NP().set(s, 'device.path', pth); };
        const inp = input('newFolder', nm, 'family-photos', (v) => { s.ui.newFolderName = v; s.changed(); });
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); make(); } });
        put(box, field(w('np.device.newFolderLabel', { place: root }), inp, w('np.device.newFolderHint', { device: where.replace(/^Opened |\.$/g, '') }), bad || '', { after: h('div.pjx-row', null, btn(w('np.device.newFolderGo'), make, { key: 'device:newfolder:go' })) }));
      }
    }
  }
  function sharePart(s, box, cn) {
    const d = s.d, dv = d.device, smb = dv.method === 'smb', kind = smb ? 'smb' : 'nfs';
    const list = ENV.shares.filter((x) => x.kind === kind).map((x) => ({ id: x.id, glyph: 'network', title: x.address, sub: (NP().dev(x.device) || {}).name + ' · ' + x.free + ' free' }));
    list.push({ id: 'typed', glyph: 'edit', title: smb ? w('np.smb.typed') : w('np.nfs.typed'), sub: smb ? w('np.smb.typedHint') : w('np.nfs.typedHint'), quiet: true });
    put(box, group(smb ? w('np.smb.shares') : w('np.nfs.shares'), choices('device:share', list, dv.share, (v) => NP().set(s, 'device.share', v), { label: smb ? w('np.smb.shares') : w('np.nfs.shares') })));
    if (dv.share === 'typed') {
      const v = String(dv.typedShare || '').trim(), bad = v && !(smb ? /^(smb:)?\/\/[\w.-]+\/\S+/.test(v) : /^[\w.-]+:\/\S+/.test(v));
      put(box, field(smb ? w('np.smb.typedLabel') : w('np.nfs.typedLabel'), input('typedShare', dv.typedShare, '', (x) => { dv.typedShare = x; dv.path = null; s.changed(); }), smb ? w('np.smb.typedHint') : w('np.nfs.typedHint'), bad ? w(smb ? 'np.smb.typedBad' : 'np.nfs.typedBad') : '', { real: true }));
      put(box, demo(smb ? [{ label: '//home-nas.local/projects', outcome: 'works', run: () => { dv.typedShare = '//home-nas.local/projects'; s.changed(); } }, { label: 'home-nas.local/projects', outcome: 'wrong', run: () => { dv.typedShare = 'home-nas.local/projects'; s.changed(); } }]
        : [{ label: 'home-nas.local:/volume1/projects', outcome: 'works', run: () => { dv.typedShare = 'home-nas.local:/volume1/projects'; s.changed(); } }, { label: 'home-nas.local', outcome: 'wrong', run: () => { dv.typedShare = 'home-nas.local'; s.changed(); } }], { id: 'share' }));
    }
    const sh = NP().resolveShare(s);
    if (!dv.share || (dv.share === 'typed' && !sh)) return;
    const key = (smb ? 'smb:' : 'nfs:') + d.runsOn + ':' + NP().smbShareKey(s) + (smb ? ':' + dv.smbUser : '');
    const o = NP().peek(s, key);
    if (smb) {
      const pwEl = s.secrets.get('devsmb');
      const fail = s.ui.smbFail ? w('np.smb.wrong') : s.ui.smbNeed ? w('np.smb.needBoth') : '';
      if (!(o && o.state === 'done')) {
        put(box, h('div.pjx-np-pair', null, field(w('np.smb.user'), input('smbUser', dv.smbUser, '', (v) => { dv.smbUser = v; }), '', null, { real: true }),
          secret(s, 'devsmb', w('np.smb.pw'), w('np.smb.pwHint', { computer: cn }), { problem: fail, real: true })));
        put(box, demo([{ label: 'jared · correct horse', outcome: 'works', run: () => { dv.smbUser = 'jared'; if (s.secrets.get('devsmb')) s.secrets.get('devsmb').value = 'correct horse'; s.changed(); } }, { label: 'jared · wrong password', outcome: 'refused', run: () => { dv.smbUser = 'jared'; if (s.secrets.get('devsmb')) s.secrets.get('devsmb').value = 'wrong'; s.changed(); } }], { id: 'smb' }));
      }
      if (o && o.state === 'working') put(box, working(w('np.smb.phase.open') + ' · ' + w('np.smb.phase.read')));
      else if (!(o && o.state === 'done')) put(box, h('div.pjx-row', null, btn(w('np.smb.check'), () => {
        // the field and its key are read now, as the person left them (the username may have been typed since the draw)
        const pwNow = s.secrets.get('devsmb') || pwEl, pw = pwNow ? pwNow.value : '', u = String(dv.smbUser || '').trim();
        s.ui.smbFail = false; s.ui.smbNeed = !u || !pw; if (s.ui.smbNeed) { s.changed(); return; }
        const k2 = 'smb:' + d.runsOn + ':' + NP().smbShareKey(s) + ':' + dv.smbUser;
        delete s.ops[k2];
        NP().op(s, k2, 900, () => { if (u === sh.user && pw === sh.password) return { ok: true }; s.ui.smbFail = true; delete s.ops[k2]; return { fail: 'wrong' }; });
        if (pwNow) pwNow.value = '';
        s.changed();
      }, { key: 'smb:check', primary: true, cmd: 'cmd.project.source_location.test' })));
    } else {
      put(box, line(null, w('np.nfs.note', { computer: cn }), { icon: 'info' }));
      if (o && o.state === 'working') put(box, working(w('np.nfs.phase.open')));
      else if (!(o && o.state === 'done')) put(box, h('div.pjx-row', null, btn(w('np.smb.check'), () => { NP().op(s, key, 800, () => (sh.allows.indexOf(d.runsOn) >= 0 ? { ok: true } : { fail: 'denied' })); s.changed(); }, { key: 'nfs:check', primary: true, cmd: 'cmd.project.source_location.test' })));
    }
    if (o && o.state === 'done') devFolders(s, box, sh.folders, ENV.trees[sh.id], Object.keys(ENV.trees[sh.id] || { '/': [] })[0], smb ? w('np.smb.ok', { share: sh.address, user: dv.smbUser }) : w('np.nfs.ok', { share: sh.address, computer: cn }));
  }
  function volPart(s, box, cn) {
    const d = s.d, dv = d.device;
    if (d.runsOn !== 'here') { put(box, line('info', 'Home NAS shows no connected drives. Use SMB or NFS to reach a share from it.')); return; }
    put(box, group(w('np.mounted.title'), choices('device:volume', ENV.volumes.map((v) => ({ id: v.id, glyph: 'folder', title: v.path, sub: v.label + ' · ' + v.free + ' free' })), dv.volume, (v) => { NP().set(s, 'device.volume', v); NP().op(s, 'vol:' + d.runsOn + ':' + v, 700, () => ({ ok: true })); }, { label: w('np.mounted.title') })));
    const v = NP().vol(dv.volume); if (!v) return;
    const o = NP().op(s, 'vol:' + d.runsOn + ':' + v.id, 700, () => ({ ok: true }));
    if (o.state === 'working') put(box, working(w('np.mounted.read', { computer: cn })));
    else devFolders(s, box, v.folders, ENV.trees[v.id], v.path, w('np.mounted.ok', { volume: v.path, computer: cn }));
  }

  /* ------------------------------------------------------------------ the service cards (6.4.1, 6.9.4) */
  function serviceCards(s, key, o) {
    // o: { value, kind, address, onService, onKind, onAddress, git (offer Any Git address) }
    const svcItems = R().SERVICES.map((x) => ({ id: x.id, glyph: x.id === 'github' ? 'globe' : x.token ? 'server' : 'cloud', title: x.name, sub: x.id === 'github' ? w('np.svc.githubSub') : x.sub, tag: x.id === 'github' ? w('np.svc.recommended') : null }));
    if (o.git) svcItems.push({ id: 'git', glyph: 'link', title: w('np.svc.gitAddress'), sub: w('np.svc.gitAddressSub') });
    const main = svcItems.filter((x) => x.id === 'github'), rest = svcItems.filter((x) => x.id !== 'github');
    const box = h('div.pjx-np-svc');
    put(box, choices(key, main, o.value, o.onService, { label: 'Service' }));
    const other = rest.some((x) => x.id === o.value);
    put(box, disc(s, key + '-others', w('np.svc.others'), () => [choices(key + ':o', rest, o.value, o.onService, { label: w('np.svc.others') }), disc(s, key + '-gitjj', w('np.gitjj.title'), gitJjAnswer(), { kind: 'others' })], { kind: 'others', force: other }));
    const svc = R().service(o.value);
    if (svc) {
      const under = h('div.pjx-np-under');
      if (svc.kinds.length > 1) put(under, seg(key + ':kind', svc.kinds.map((k) => ({ id: k.id, title: k.label })), R().kind(svc.id, o.kind).id, o.onKind, 'Which ' + svc.name));
      const kd = R().kind(svc.id, o.kind);
      if (kd.address) {
        const c = o.address && NP().addrOk(o.address) ? NP().serverCheck(s, svc.id, kd.id, o.address) : null;
        const bad = o.address && !NP().addrOk(o.address) ? (/^http:\/\//.test(o.address) ? w('np.svc.addressBad') : w('np.svc.addressBad')) : c && c.state === 'failed' ? w('np.svc.addressNone', { address: o.address }) : '';
        put(under, field(w('np.svc.addressLabel'), input(key + ':addr', o.address, '', o.onAddress), c && c.state === 'working' ? 'Checking the address…' : c && c.state === 'done' ? 'Answering' : '', bad, { real: true }));
        const demoAddr = (ENV.forges[R().key(svc.id, kd.id)] || {}).address;
        put(under, demo([{ label: demoAddr || 'https://git.platyr.test', outcome: 'works', run: () => o.onAddress(demoAddr || 'https://git.platyr.test') }, { label: 'http://git.platyr.test', outcome: 'wrong', run: () => o.onAddress('http://git.platyr.test') }], { id: key + 'addr', hide: !!(c && c.state === 'done') }));
      }
      if (under.children.length) put(box, under);
    }
    return box;
  }
  /* the plain answer: do Git and Jujutsu work with every service? (6.9.7) */
  function gitJjAnswer() { return h('div.pjx-np-gitjj', null, ...['1', '2', '3', '4'].map((n) => line(n === '1' ? 'complete' : 'info', w('np.gitjj.' + n)))); }

  /* sign in to a service on the computer that does the work (6.9.4 mini-step 2); returns { node, done } */
  function signinView(s, rec, key, o) {
    o = o || {};
    const d = s.d, cn = NP().comp(d.runsOn).name, svc = R().service(rec.svc), methods = R().auth(rec.svc, rec.kind);
    const si = NP().signedIn(rec, d.runsOn), op0 = NP().signinOp(s, rec);
    if (si && !si.expired && !s.ui['another:' + key]) {
      return { done: true, node: h('div.pjx-np-signin', null, choices(key + ':use', [{ id: 'use', glyph: 'user', title: w('np.signin.connected', { account: si.account }), sub: w('np.signin.connectedSub', { computer: cn }) }], 'use', () => {}, { label: 'Account' }),
        h('div.pjx-row', null, link(w('np.signin.another'), () => { s.ui['another:' + key] = true; s.changed(); }, { key: key + ':another' }))) };
    }
    const box = h('div.pjx-np-signin');
    if (si && si.expired) put(box, line('warning', w('np.link.expired', { service: svc.name, computer: cn })));
    if (op0 && op0.state === 'working') { put(box, working(methods[0] === 'token' ? 'Checking the token…' : w('np.signin.waiting'))); return { done: false, node: box }; }
    if (op0 && op0.state === 'failed') put(box, line('failed', op0.result.fail === 'token' ? w('np.signin.tokenBad') : w('np.signin.fail')));
    // a method kept from another service or server is never used here (FF-11): only this service's own methods
    const method = methods.indexOf(s.ui['method:' + key]) >= 0 ? s.ui['method:' + key] : methods[0];
    if (methods.length > 1) put(box, seg(key + ':method', methods.map((m) => ({ id: m, title: { browser: 'Sign in on its page', device: 'A code to type', token: 'Access token' }[m] })), method, (v) => { s.ui['method:' + key] = v; s.changed(); }, 'How to sign in'));
    if (method === 'token') {
      put(box, h('p.pjx-np-say', { text: w('np.signin.tokenLead', { host: rec.host || svc.name }) }));
      put(box, line(null, w('np.signin.tokenHow.' + (svc.tokenHow || 'gitea'), { host: rec.host }), { icon: 'key' }));
      // what this token needs for what it is for here: making a new copy, or reaching one that exists (4.10 to 4.14)
      const purpose = key === 'osign' && /make|instead/.test(NP().onlineMode(s)) ? 'create' : 'existing';
      put(box, line('info', w('np.signin.perm.' + (svc.tokenHow || 'gitea') + '.' + purpose, { host: rec.host }), { icon: 'check' }));
      put(box, line(null, w('np.signin.reach.' + (svc.tokenHow || 'gitea'), { host: rec.host }), { icon: 'lock' }));
      put(box, secret(s, 'tok:' + key, w('np.signin.token'), w('np.signin.tokenKept', { computer: cn }), { real: true, enter: () => NP().signIn(s, rec, 'token', 'tok:' + key) }));
      put(box, demo([{ label: 'Demo token', outcome: 'works', run: () => { const el = s.secrets.get('tok:' + key); if (el) { el.value = 'Demo token'; el._typed = true; } s.changed(); } }, { label: 'abc', outcome: 'wrong', run: () => { const el = s.secrets.get('tok:' + key); if (el) { el.value = 'abc'; el._typed = true; } s.changed(); } }], { id: key + 'tok' }));
      put(box, h('div.pjx-row', null, btn(w('np.signin.tokenCheck'), () => { s.ui['another:' + key] = false; NP().signIn(s, rec, 'token', 'tok:' + key); s.changed(); }, { key: key + ':tokgo', primary: true, cmd: 'cmd.auth_profile.sign_in' })));
    } else if (method === 'device') {
      put(box, h('p.pjx-np-say', { text: w('np.signin.codeLead', { url: svc.device || rec.host }) }));
      put(box, h('div.pjx-np-words.is-code', { text: 'WDJB-MJHT', 'data-pmh-tag': 'literal' }));
      put(box, hint(w('np.signin.codeExpiresMin', { n: svc.codeMin || 15, service: svc.name })));
      put(box, h('div.pjx-row', null, btn('I entered the code', () => { s.ui['another:' + key] = false; NP().signIn(s, rec, 'device'); s.changed(); }, { key: key + ':codego', primary: true, cmd: 'cmd.auth_profile.sign_in' })));
    } else {
      put(box, h('p.pjx-np-say', { text: 'Puppet Master works only on the Project you set up here. ' + svc.name + '’s page shows the access it asks for before you agree. The sign-in is kept on ' + cn + '.' }));
      put(box, h('div.pjx-row', null, btn(si && si.expired ? 'Sign in again' : w('np.signin.signIn'), () => { s.ui['another:' + key] = false; NP().signIn(s, rec, 'browser'); s.changed(); }, { key: key + ':go', primary: true, icon: 'key', cmd: si && si.expired ? 'cmd.forge.connection.reauthorize' : 'cmd.auth_profile.sign_in' }),
        methods.indexOf('device') >= 0 ? link(w('np.signin.noBrowser'), () => { s.ui['method:' + key] = 'device'; s.changed(); }, { key: key + ':nobrowser' }) : null));
      // a service with no code to type: its own page, opened again or copied to another browser (4.15)
      if (methods.indexOf('device') < 0) {
        const url = (rec.address || 'https://' + (rec.host || '')).replace(/\/+$/, '') + '/login/oauth/authorize?client=puppet-master';
        put(box, line(null, [w('np.signin.pageLead'), code(url)], { icon: 'globe', after: [link(w('np.signin.openPage'), () => PJX.toast(w('np.signin.openPage'), url, 'info'), { key: key + ':openpage', cmd: 'cmd.auth_profile.open_official_page' }), link(w('np.signin.copyPage'), () => { try { W.navigator.clipboard.writeText(url); } catch (e) { /* no clipboard */ } PJX.toast(w('np.signin.copied'), url, 'success'); }, { key: key + ':copypage' })] }));
      }
    }
    // sign-up turned off on this server: no sign-up link, the administrator instead (4.16)
    if (rec.signup === false) put(box, line('info', w('np.signin.noSignup', { host: rec.host || svc.name })));
    else put(box, h('div.pjx-row', null, link(w('np.signin.signup', { service: svc.name }), () => PJX.toast(svc.name, 'Opens ' + svc.name + '’s own sign-up page in your browser. Come back here to sign in.', 'info'), { key: key + ':signup', cmd: 'cmd.auth_profile.open_official_page' })));
    put(box, yoloLine(w('np.yolo.signin'), { asks: true }));
    return { done: false, node: box };
  }

  /* ------------------------------------------------------------------ section: source (6.4.1) */
  function secSource(s) {
    const d = s.d, box = h('div.pjx-np-source');
    put(box, serviceCards(s, 'src', { value: d.src.service, kind: d.src.kind, address: d.src.address, git: true,
      onService: (v) => NP().set(s, 'src.service', v), onKind: (v) => NP().set(s, 'src.kind', v), onAddress: (v) => NP().set(s, 'src.address', v) }));
    if (d.src.service === 'git') {
      const a = d.src.gitAddress, valid = NP().gitAddrValid(a), o = valid ? NP().gitAddressCheck(s) : null;
      put(box, field(w('np.svc.gitAddressLabel'), input('gitAddress', a, '', (v) => { d.src.gitAddress = v; s.changed(); }), o && o.state === 'working' ? w('np.svc.gitAddressChecking') : w('np.svc.gitAddressHint'), a && !valid ? w('np.svc.gitAddressBad') : o && o.state === 'failed' ? w('np.svc.gitAddressNone') : '', { real: true }));
      if (o && o.state === 'done') put(box, lines(line('complete', w('np.svc.gitAddressFound', { branch: o.result.branch, size: o.result.size })), o.result.auth ? line('info', w('np.svc.gitAddressAuth')) : null));
      put(box, line('info', w('np.svc.gitAddressNote')));
      put(box, demo([{ label: 'https://git.example.net/team/tool.git', outcome: 'works', run: () => { d.src.gitAddress = 'https://git.example.net/team/tool.git'; s.changed(); } }, { label: 'ssh://nobody.invalid/x.git', outcome: 'no answer', run: () => { d.src.gitAddress = 'ssh://nobody.invalid/x.git'; s.changed(); } }], { id: 'git', hide: !!(o && o.state === 'done') }));
    }
    return box;
  }

  /* ------------------------------------------------------------------ section: find (6.4.2) */
  function secFind(s) {
    const d = s.d, box = h('div.pjx-np-find'), cn = NP().comp(d.runsOn).name;
    if (d.src.service === 'git') { put(box, line('info', w('np.find.plainAccess'))); return box; }
    const rec = NP().srcRec(s); if (!rec) { put(box, hint('Type the server’s address in “Where is it stored?” first.')); return box; }
    const svc = R().service(rec.svc), si = NP().signedIn(rec, d.runsOn);
    const tab = d.find.tab || (si && !si.expired ? 'yours' : 'anyone');
    put(box, seg('find:tab', [{ id: 'yours', title: w('np.find.yours') }, { id: 'anyone', title: w('np.find.anyone') }], tab, (v) => NP().set(s, 'find.tab', v), w('np.find.title')));
    const rowOf = (r) => ({ id: r.id, glyph: r.tfvc ? 'slash-circle' : r.forkOf ? 'branch' : 'box', title: r.id, sub: [w('np.find.row', { owner: r.owner || r.id.split('/')[0], visibility: r.vis || 'Everyone', when: r.when || 'recently' }), r.team ? w('np.find.canSend') : null, r.forkOf ? w('np.find.fork', { project: r.forkOf }) : null, r.template ? w('np.find.template') : null, r.desc || null].filter(Boolean).join(' · '), disabled: r.tfvc ? w('np.find.tfvc', { project: r.id }) : null, cmd: 'cmd.forge.repository.list' });
    if (tab === 'yours') {
      const sv = signinView(s, rec, 'find');
      if (!sv.done) { put(box, line(null, w('np.find.signinFirst', { service: svc.name }), { icon: 'key' })); put(box, sv.node); }
      else {
        const q = lc(d.find.q), list = (rec.repos || []).filter((r) => !q || lc(r.id).indexOf(q) >= 0);
        put(box, sv.node);
        if ((rec.repos || []).length > 4) put(box, field(w('np.find.search'), input('findQ', d.find.q, '', (v) => { d.find.q = v; s.changed(); }), ''));
        put(box, list.length ? choices('find:pick', list.map(rowOf), d.find.project, (v) => NP().set(s, 'find.project', v), { label: w('np.find.yours') }) : line('off', (rec.repos || []).length ? w('np.find.noMatch') : w('np.find.empty', { account: si.account, service: svc.name })));
      }
    } else {
      const go = () => { const q = String(d.find.anyQ || '').trim(); if (!q) return; d.find.anyAsked = q; if (d.find.project) NP().set(s, 'find.project', null); else s.changed(); };
      const inp = input('findAny', d.find.anyQ, w('np.find.searchAnyPh'), (v) => { d.find.anyQ = v; });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
      put(box, field(w('np.find.searchAny'), inp, '', null, { real: true, after: h('div.pjx-row', null, btn(w('np.find.findBtn'), go, { key: 'find:go', cmd: 'gap:search anyone’s Projects (FGI-011 scope)' })) }));
      const o = NP().findAnyone(s);
      if (o && o.state === 'working') put(box, working(w('np.find.finding', { project: d.find.anyAsked })));
      else if (o && o.state === 'failed') put(box, lines(line('blocked', w('np.find.notFound', { project: o.result.id })), h('div.pjx-row', null, link(w('np.find.another'), () => PJX.toast(w('np.find.another'), 'Signs in to ' + svc.name + ' with another account, on ' + cn + '.', 'info'), { key: 'find:anotheracct', cmd: 'cmd.auth_profile.sign_in' }))));
      else if (o && o.state === 'done') {
        const r = (rec.repos || []).find((x) => x.id === o.result.id) || ENV.publicRepos.find((x) => x.id === o.result.id);
        put(box, choices('find:anypick', [rowOf(r)], d.find.project, (v) => NP().set(s, 'find.project', v), { label: w('np.find.anyone') }));
        if (!d.find.project) { d.find.project = r.id; }
      }
      put(box, demo(['maplecraft/plant-journal', 'openphoto/photo-sorter', 'acme/harbor-mobile', 'acme/secret-sauce', 'godot-community/demo-games'].map((x, i) => ({ label: x, outcome: ['read only', 'your fork exists', 'you can send changes', 'nothing there', 'submodules, LFS'][i], run: () => { d.find.anyQ = x; d.find.anyAsked = x; NP().set(s, 'find.project', null); } })), { id: 'anyone' }));
    }
    if (!d.find.project) return box;
    // what you can do with it (the access check), then what you want to do
    const a = NP().access(s);
    if (a && a.state === 'signin') {
      put(box, line('waiting', w('np.access.signinFirst', { service: svc.name, project: d.find.project, computer: cn })));
      if (tab !== 'yours') { const sv = signinView(s, rec, 'find'); if (!sv.done) put(box, sv.node); }
      return box;
    }
    if (!a || a.state === 'working') { put(box, working(w('np.access.checking', { project: d.find.project }))); return box; }
    if (a.state === 'failed') return box;
    const acc = a.result, r = NP().repoOf(s), owner = String(r.id).split('/')[0];
    const known = NP().knownFor(s);
    if (known && !d.find.another) put(box, line('info', w('np.find.known', { project: known.name, computer: known.where.label }), { after: [btn(w('np.find.knownOpen', { project: known.name }), () => PJX.ACT.open(known.id), { key: 'find:open', cmd: 'cmd.project.open' }), link(w('np.find.knownAnother'), () => { d.find.another = true; s.changed(); }, { key: 'find:another' })] }));
    const g = h('div.pjx-np-access', { 'data-cmd': 'gap:guided access check (FGI-003 states)' });
    if (acc.access === 'write' && !acc.team) put(g, line('complete', w('np.access.yours')));
    else if (acc.access === 'write') {
      put(g, line('complete', w('np.access.team', { owner })));
      put(g, group(w('np.access.choose'), choices('find:intent', [{ id: 'offer', glyph: 'pull-request', title: w('np.access.offer'), sub: w('np.access.offerSub', { computer: cn, owner }), tag: w('np.svc.recommended') }, { id: 'direct', glyph: 'upload', title: w('np.access.direct'), sub: w('np.access.directSub', { computer: cn }) }], NP().intentOf(s), (v) => NP().set(s, 'find.intent', v), { label: w('np.access.choose') })));
    } else {
      put(g, line('info', w('np.access.public')));
      if (acc.fork) put(g, line('complete', w('np.access.forkExists', { fork: acc.fork })));
      const items = svc.fork ? [{ id: 'contribute', glyph: 'pull-request', title: w('np.access.contribute'), sub: w('np.access.contributeSub', { service: svc.name }), tag: w('np.svc.recommended'), cmd: 'cmd.forge.repository.fork' }] : [];
      items.push({ id: 'copy', glyph: 'download', title: w('np.access.copy'), sub: w('np.access.copySub', { computer: cn }) });
      put(g, group(w('np.access.choose'), choices('find:intent', items, NP().intentOf(s), (v) => NP().set(s, 'find.intent', v), { label: w('np.access.choose') })));
      if (!svc.fork) put(g, line('info', w('np.access.noFork', { service: svc.name })));
      if (NP().intentOf(s) === 'contribute' && !acc.fork) {
        const sv = signinView(s, rec, 'fork');
        if (!sv.done) put(g, lines(line('waiting', w('np.access.signinFork', { service: svc.name })), sv.node));
        else put(g, group(w('np.access.forkTo'), choices('find:forkowner', (rec.owners || []).filter((x) => x.kind === 'personal' || x.kind === 'organization').map((x) => ({ id: x.id, glyph: x.kind === 'personal' ? 'user' : 'organisation', title: x.kind === 'personal' ? w('np.access.forkMine', { account: x.label }) : x.label, sub: x.kind === 'personal' ? 'Your own account' : 'Organization' })), NP().forkOwner(s), (v) => { d.find.forkOwner = v; s.changed(); }, { label: w('np.access.forkTo') })));
      }
    }
    const it = NP().intentOf(s);
    if (it === 'contribute' || it === 'offer') {
      const bp = R().branchProblem(d.find.branch);
      put(g, field(w('np.access.branch'), input('findBranch', d.find.branch, 'my-change', (v) => { d.find.branch = v; d.find.branchTouched = true; s.changed(); }), w('np.access.branchHint'), d.find.branchTouched && bp ? bp : ''));
      put(g, demo([{ label: 'my-change', outcome: 'works', run: () => { d.find.branch = 'my-change'; d.find.branchTouched = true; s.changed(); } }, { label: 'my branch', outcome: 'wrong', run: () => { d.find.branch = 'my branch'; d.find.branchTouched = true; s.changed(); } }], { id: 'branch' }));
    }
    put(box, g);
    // the bounded read before copying
    const ins = NP().inside(s);
    if (ins && ins.state === 'working') put(box, working(w('np.find.looking', { project: r.id, service: svc.name })));
    else if (ins && ins.state === 'done') {
      const i = ins.result;
      put(box, h('div.pjx-np-look', { 'data-partial': '' }, cap(w('np.find.inside')), lines(line('pending', w('np.look.partialOnline', { service: svc.name, computer: cn })),
        i.submodules && i.submodules.length ? line('info', w('np.look.submodules', { n: i.submodules.length, list: i.submodules.join(', ') })) : null,
        i.lfs ? line('info', w('np.look.lfs', { size: i.lfs })) : null,
        line(null, w('np.find.big', { size: i.size, computer: cn }), { icon: 'code' }))));
    }
    return box;
  }
  const lc = (x) => String(x || '').toLowerCase();

  /* ------------------------------------------------------------------ section: restore (6.5) */
  function secRestore(s) {
    const d = s.d, r = d.restore, box = h('div.pjx-np-restore'), NPx = NP();
    // 1 the Kit file first, or say you have none (2.32)
    put(box, group(w('np.restore.kitQ'), choices('restore:kit', (ENV.kits || []).map((k) => ({ id: k.id, glyph: 'key', title: k.file, sub: w('np.restore.kitRow', { folder: k.folder, where: k.where }) }))
      .concat([{ id: 'none', glyph: 'slash-circle', title: w('np.restore.noKit'), sub: w('np.restore.noKitSub') }]), r.kit, (v) => NPx.set(s, 'restore.kit', v), { label: w('np.restore.kitQ') }),
      h('div.pjx-row', null, link(w('np.restore.kitBrowse'), () => PJX.toast(w('np.restore.kitBrowse'), 'Opens the file picker on this computer. A Kit is a .pdf or .pmkit file.', 'info'), { key: 'restore:kitbrowse', cmd: 'cmd.restore.kit.open' }))));
    if (!r.kit) return box;
    const k = NPx.kitOf(s);
    if (k) put(box, lines(line('complete', w('np.restore.kitSays', { where: k.where })), line('info', w('np.restore.kitMade', { made: k.made }))));
    else put(box, group(w('np.restore.title'), choices('restore:from', [
      { id: 'drive', glyph: 'folder', title: w('np.restore.folder'), sub: w('np.restore.folderSub') }, { id: 'nas', glyph: 'server', title: w('np.restore.nas'), sub: w('np.restore.nasSubPm') },
      { id: 'cloud', glyph: 'cloud', title: w('np.restore.cloud'), sub: w('np.restore.cloudSub') }], r.from, (v) => NPx.set(s, 'restore.from', v), { label: w('np.restore.title') })));
    if (!r.from) return box;
    if (r.from === 'cloud' && !k) put(box, group(w('np.restore.cloudWhich'), seg('restore:cloud', [{ id: 'gdrive', title: 'Google Drive' }, { id: 'onedrive', title: 'OneDrive' }, { id: 'b2', title: 'A storage bucket' }], r.cloud, (v) => NPx.set(s, 'restore.cloud', v), w('np.restore.cloudWhich'))));
    // 2 reach and sign in to that exact storage (2.33): nothing is assumed signed in
    const ro = NPx.reachOp(s), where = NPx.restoreWhere(s);
    const how = r.from === 'cloud' ? w('np.restore.reach.cloud.' + r.cloud) : r.from === 'nas' ? w('np.restore.reach.nas') : w('np.restore.reach.drive');
    const g2 = group(w('np.restore.reachQ', { where }), line(null, how, { icon: r.from === 'cloud' ? 'key' : r.from === 'nas' ? 'server' : 'folder' }));
    if (ro && ro.state === 'working') put(g2, working(w('np.restore.reaching', { where })));
    else if (ro && ro.state === 'done') put(g2, line('complete', ro.result.account ? w('np.restore.reachedAs', { where, account: ro.result.account }) : w('np.restore.reached', { where })));
    else {
      if (ro && ro.state === 'failed') put(g2, line('failed', w('np.restore.reachFail.' + (ro.result.fail || 'noAnswer'), { where })));
      put(g2, h('div.pjx-row', null, btn(r.from === 'cloud' ? w('np.restore.signIn', { where }) : r.from === 'nas' ? w('np.restore.connect', { where }) : w('np.restore.read', { where }), () => { if (ro) NPx.retry(s, Object.keys(s.ops).find((x) => s.ops[x] === ro)); NPx.reach(s); s.changed(); }, { key: 'reach', primary: true, icon: r.from === 'cloud' ? 'key' : null, cmd: r.from === 'cloud' ? 'cmd.auth_profile.sign_in (that storage)' : 'cmd.backup.destination.test' })),
        demo([{ label: r.from === 'cloud' ? 'The sign-in expires' : 'No answer', outcome: 'retry', run: () => { s.ui.reachFail = true; s.changed(); } }], { id: 'reach' }), r.from === 'cloud' ? yoloLine(w('np.yolo.signin'), { asks: true }) : null);
    }
    put(box, g2);
    if (!NPx.reached(s)) return box;
    // 3 unlock: the Kit's own key, checked against what was reached; or the recovery phrase
    const src = NPx.restoreSource(s);
    if (k) {
      const ko = NPx.peek(s, 'kitopen:' + k.id + ':' + r.from);
      if (ko && ko.state === 'done') put(box, line('complete', w('np.restore.kitUnlocked', { where })));
      else if (ko && ko.state === 'working') put(box, working(w('np.restore.kitChecking')));
      else put(box, group(w('np.restore.unlock'), line(null, w('np.restore.kitUnlockLead', { file: k.file, where }), { icon: 'lock' }), h('div.pjx-row', null, btn(w('np.restore.kitUnlockBtn'), () => { NPx.kitOpen(s); s.changed(); }, { key: 'kitopen', primary: true, cmd: 'cmd.restore.preview (Kit key, protected)' })), yoloLine(w('np.yolo.kit'), { asks: true })));
      if (!NPx.restoreUnlocked(s)) return box;
    } else if (src && src.locked && !r.unlocked) {
      put(box, group(w('np.restore.unlock'), h('p.pjx-np-say', { text: w('np.restore.unlockLead', { where: src.path || src.where }) }),
        secret(s, 'phrase', w('np.restore.phrase'), '', { problem: s.ui.phraseBad ? w('np.restore.phraseWrong') : s.ui.phraseFirst ? w('np.restore.phraseFirst') : '', real: true, enter: () => doUnlock() }),
        demo([{ label: 'river candle orbit maple quiet lantern', outcome: 'works', run: () => { const el = s.secrets.get('phrase'); if (el) el.value = 'river candle orbit maple quiet lantern'; s.changed(); } }, { label: 'river candle orbit', outcome: 'wrong', run: () => { const el = s.secrets.get('phrase'); if (el) el.value = 'river candle orbit'; s.changed(); } }], { id: 'phrase' }),
        h('div.pjx-row', null, btn(w('np.restore.unlockBtn'), () => doUnlock(), { key: 'restore:unlock', primary: true, cmd: 'cmd.restore.preview' }))));
      return box;
    } else if (src && src.locked) put(box, line('complete', w('np.restore.unlocked')));
    function doUnlock() { const res = NPx.unlock(s); s.ui.phraseFirst = res.fail === 'first'; s.changed(); }
    // 4 the Project, then its recovery point and what that point covers, then a look inside it (2.34)
    const l = NPx.restoreList(s);
    if (!l || l.state === 'working') { put(box, working(w('np.restore.looking', { where }))); return box; }
    if (l.state === 'failed') { put(box, lines(line('off', w('np.restore.none', { where })), h('div.pjx-row', null, link(w('np.restore.elsewhere'), () => NPx.set(s, 'restore.kit', 'none'), { key: 'restore:elsewhere' })))); return box; }
    if (s.ui.restoreWant && !r.pick && l.result.projects.indexOf(s.ui.restoreWant) >= 0) { r.pick = s.ui.restoreWant; s.ui.restoreWant = null; }
    put(box, group(w('np.restore.pick'), choices('restore:pick', l.result.projects.map((p) => ({ id: p, glyph: 'box', title: p, sub: w('np.restore.pickRow', { when: src.latest || 'Oct 28', inList: PJX.get(p) ? w('np.restore.inList') : w('np.restore.notInList') }) })), r.pick, (v) => NPx.set(s, 'restore.pick', v), { label: w('np.restore.pick') })));
    if (!r.pick) return box;
    const pts = NPx.restorePoints(s);
    put(box, group(w('np.restore.pointQ'), choices('restore:point', pts.map((x) => ({ id: x.id, glyph: 'history', title: x.when, sub: x.cover, tag: x.tag || null })), r.point, (v) => { r.point = v; s.changed(); }, { label: w('np.restore.pointQ') })));
    if (!r.point) return box;
    const lin = NPx.lineage(s), rh = NPx.restoredHist(s);
    put(box, group(w('np.restore.comes'), lines(line('complete', rh && rh.backend ? w('np.restore.filesKind', { kind: NPx.kindWord(rh.backend), ref: rh.branch ? (rh.backend === 'jujutsu' ? 'bookmark ' : 'branch ') + rh.branch : '' }) : w('np.restore.filesOnly')), line('complete', w('np.restore.pm')), line('info', w('np.restore.never')),
      line(null, w('np.restore.lookAfter', { computer: NPx.comp(d.runsOn).name }), { icon: 'search' }),
      PJX.get(r.pick) ? line('info', w('np.restore.both', { project: r.pick })) : null, lin ? line('info', w('np.restore.lineage', { service: lin[0], project: lin[1] })) : null)));
    return box;
  }

  /* ------------------------------------------------------------------ section: chat (spec 12) [Depends: no-project] */
  function secChat(s, ctx) {
    const d = s.d, c = NP().chatOf(d.chat.id), box = h('div.pjx-np-chat');
    if (c) put(box, h('div.pjx-np-making', null, h('span', { text: w('np.chat.making', { chat: c.title }) }), link(w('np.chat.instead'), () => { if (ctx && ctx.onInstead) ctx.onInstead(c); else PJX.toast(w('np.chat.instead'), w('np.chat.insteadToast'), 'info'); }, { key: 'chat:instead', cmd: 'ACD-510 Move this chat into a project' })));
    const chats = (PJX.chat ? PJX.chat.list() : ENV.chats || []).concat(c && PJX.chat && PJX.chat.list().indexOf(c) < 0 ? [c] : []);
    put(box, group(w('np.chat.which'), choices('chat:which', chats.map((x) => ({ id: x.id, glyph: x.talkOnly ? 'chat' : 'folder', title: x.title, sub: x.files ? x.files + ' files · ' + x.sample : w('nc.talkOnly', { slug: x.slug, computer: NP().comp(x.runsOn).name }) })), d.chat.id, (v) => NP().set(s, 'chat.id', v), { label: w('np.chat.which') })));
    if (!c) return box;
    // what is waiting in the chat settles first (ACD-510): answer it here, or in the chat
    NP().waitingApprovals(c).forEach((a) => put(box, line('blocked', w('cv.work.approval', { what: a.what }), { after: [btn(w('nc.ap.once'), () => { PJX.S.world.facts.approvals[a.id] = 'allowed'; s.changed(); }, { key: 'chat:ap:once' }), btn(w('nc.ap.no'), () => { PJX.S.world.facts.approvals[a.id] = 'denied'; s.changed(); }, { key: 'chat:ap:no', quiet: true })] })));
    const items = [];
    if (c.files) items.push({ id: 'move', glyph: 'move', title: w('np.chat.move'), sub: w('np.chat.moveSub', { n: c.files }) });
    if (c.folder) items.push({ id: 'useFolder', glyph: 'folder', title: w('np.chat.useFolder'), sub: w('np.chat.useFolderSub', { path: c.folder }) });
    if (c.workedIn) items.push({ id: 'worked', glyph: 'folder-search', title: w('np.chat.worked', { path: c.workedIn.path }), sub: w('np.chat.workedSub', { n: c.workedIn.changed }) });
    items.push({ id: 'empty', glyph: 'seed', title: w('np.chat.empty'), sub: c.files ? w('np.chat.emptySub') : w('nc.talkOnly', { slug: c.slug, computer: NP().comp(c.runsOn).name }) });
    put(box, group(w('np.chat.files'), choices('chat:files', items, NP().chatFiles(s), (v) => NP().set(s, 'chat.files', v), { label: w('np.chat.files') })));
    // only picked content moves (7.05): every file starts picked
    if (NP().chatFiles(s) === 'move') {
      const pk = d.chat.pick || {}, picked = NP().chatPicked(s);
      const all = (v) => { d.chat.pick = {}; (c.fileList || []).forEach((f) => { d.chat.pick[f] = v; }); s.changed(); };
      const grid = h('div.pjx-np-filepick', { role: 'group', 'aria-label': w('cv.pick'), 'data-np-group': 'chatPick' }, ...(c.fileList || []).map((f) => check('chat:pick:' + f, f, pk[f] !== false, (v) => { d.chat.pick = Object.assign({}, d.chat.pick || {}); d.chat.pick[f] = v; s.changed(); })));
      put(box, group(w('cv.pick'), h('div.pjx-row', null, st(picked.length ? 'complete' : 'warning', w('cv.pickN', { k: picked.length, n: (c.fileList || []).length })), link(w('cv.pickAll'), () => all(true), { key: 'chat:pickall' }), link(w('cv.pickNone'), () => all(false), { key: 'chat:picknone' })), grid));
    }
    put(box, lookView(s, NP().look(s), { other: () => NP().set(s, 'chat.files', c.files ? 'move' : 'empty') }));
    // the live preview, family by family (7.10, 7.11), for the Project this draft would make
    const like = NP().likeSrc(s), m = NP().onlineMode(s), svc = /make|instead/.test(m) && R().service(d.online.service) ? R().service(d.online.service).name : null;
    put(box, convPreview(NP().convEffects(c, { name: NP().nameOf(s), computer: d.runsOn, like: like ? like.name : null, remote: svc })));
    return box;
  }
  /* the conversion preview's families as small groups of facts (shared by both paths) */
  function convPreview(fams) {
    const box = h('div.pjx-np-conv', { role: 'group', 'aria-label': w('cv.preview') }, cap(w('cv.preview')));
    fams.forEach((f) => put(box, h('div.pjx-np-convfam', { 'data-fam': f.id }, h('div.pjx-np-convcap', { text: f.label }), lines(f.rows.map((r) => line(r.key, r.text))))));
    return box;
  }

  /* ------------------------------------------------------------------ section: where (6.6) */
  function secWhere(s, ctx) {
    const d = s.d, box = h('div.pjx-np-where'), NPx = NP(), cn = NPx.comp(d.runsOn).name;
    const nm = NPx.nameOf(s), np = NPx.nameProblem(s), shown = s.ui.nameShown || (s.ui.err.where && s.ui.err.where.field === 'name');
    const nameIn = input('name', nm, w('np.name.ph'), (v) => { d.name = v; d.nameTouched = true; s.ui.nameShown = true; s.changed(); }, { maxlength: '80' });
    put(box, field(w('np.name.label'), nameIn, np ? w('np.name.hint') : nm ? w('np.name.ok') + ' · ' + w('np.name.hint') : w('np.name.hint'), shown && np ? np : ''));
    if (d.way === 'new' && !d.nameTouched) put(box, h('div.pjx-np-suggest', null, h('span', { text: w('np.name.suggestLead') }), ...['Book club website', 'Family recipes', 'Garden planner'].map((x, i) => [i ? h('span.pjx-np-dot', { text: ' · ', 'aria-hidden': 'true' }) : null, link(x, () => { d.name = x; d.nameTouched = true; s.changed(); }, { key: 'name:sug:' + i })]).flat()));
    const loc = h('div.pjx-np-loc', { role: 'group', 'aria-label': w('np.loc.filesTitle') }, cap(w('np.loc.filesTitle')));
    const stay = NPx.filesStay(s);
    if (stay) put(loc, line(null, w('np.loc.runsOnFixed', { computer: cn }), { icon: NPx.comp(d.runsOn).glyph, after: link(w('np.loc.change'), () => NPx.open(s, NPx.sections(s)[0]), { key: 'where:runsChange' }) }));
    if (PJX.work) put(box, PJX.work.npBlock(s, { defSeg: stay ? null : runsOnSeg(s, 'where:runsOn') }));
    const ch = d.way === 'chat' ? NPx.chatOf(d.chat.id) : null;
    if (ch && ch.runsOn !== d.runsOn) put(loc, line('info', w('np.loc.chatMove', { chat: ch.title, chatComputer: NPx.comp(ch.runsOn).name, computer: cn })));
    if (stay) {
      const fp = NPx.fullPath(s);
      put(loc, line('complete', w('np.loc.stays', { path: fp ? fp.replace(NPx.HOME, '~') : '', holder: NPx.holderName(s) })));
    } else {
      const modes = NPx.filesModes(s), m = NPx.filesMode(s);
      const W2 = {
        projects: { title: w('np.loc.projects'), sub: NPx.comp(d.runsOn).root, glyph: 'folder', tag: w('np.svc.recommended') },
        custom: { title: w('np.loc.other', { computer: cn }), sub: 'A folder you choose', glyph: 'folder-search' },
        network: { title: w('np.loc.network'), sub: w('np.loc.networkSub'), glyph: 'network' },
        with_server: { title: w('np.loc.withServer', { server: 'Home NAS' }), sub: w('np.loc.withServerSub'), glyph: 'server', tag: w('np.svc.recommended') },
        this_computer: { title: w('np.loc.onDevice'), sub: w('np.loc.onDeviceSub', { server: 'Home NAS' }), glyph: 'desktop' }
      };
      put(loc, h('div.pjx-np-field', null, cap(w('np.loc.files')), choices('where:files', modes.map((x) => Object.assign({ id: x }, W2[x])), m, (v) => NPx.set(s, 'files.mode', v), { label: w('np.loc.files') })));
      if (m === 'this_computer') put(loc, line('info', w('np.loc.onDeviceWarn', { server: 'Home NAS' })));
      if (m === 'custom') {
        const p = d.files.parent;
        put(loc, field(w('np.loc.parent'), input('parent', p, '~/Documents', (v) => { d.files.parent = v; d.files.touched = true; s.changed(); }), '', null, { real: true, after: h('div.pjx-row', null, btn(w('np.loc.choose'), () => { d.files.browse = !d.files.browse; s.changed(); }, { key: 'where:choose', icon: 'folder-search', quiet: true })) }));
        if (d.files.browse) put(loc, picker(s, 'parent', ENV.tree, '~', (x) => { d.files.parent = x; d.files.browse = false; s.changed(); }));
        const exists = ENV.tree[String(p).replace(/\/+$/, '')] || /^~\/(Documents|Projects|Code|Desktop)$/.test(p);
        if (p && !exists && !/^\/System/i.test(p)) put(loc, line('info', w('np.loc.bad.parent', { path: p })));
        put(loc, demo([{ label: '~/Documents', outcome: 'works', run: () => { d.files.parent = '~/Documents'; s.changed(); } }, { label: '/System/Library', outcome: 'refused', run: () => { d.files.parent = '/System/Library'; s.changed(); } }, { label: '~/Projects + tastebook', outcome: 'taken', run: () => { d.files.parent = '~/Projects'; d.folderName = 'tastebook'; d.folderNameTouched = true; s.ui.disc['where-adv'] = true; s.changed(); } }], { id: 'parent' }));
      }
      if (m === 'network') {
        put(loc, group(w('np.loc.networkPick'), choices('where:net', NPx.networkPlaces(s).map((x) => ({ id: x.id, glyph: x.route === 'drive' ? 'folder' : 'network', title: x.title, sub: x.sub, disabled: x.off })), d.files.network, (v) => NPx.set(s, 'files.network', v), { label: w('np.loc.networkPick') }),
          line(null, w('np.loc.net.other'), { icon: 'info' })));
        put(loc, demo([{ label: '/Volumes/Backup Drive', outcome: 'nothing there (no room)', run: () => NPx.set(s, 'files.network', 'vol:vol-backup') }], { id: 'room', hide: d.way !== 'online' }));
        const n = NPx.netPlace(s);
        if (n && !n.off) {
          const o = NPx.netCheck(s), place = n.title, computer = cn;
          if (n.route === 'SMB' && !(o && o.state === 'done')) {
            put(loc, h('div.pjx-np-pair', null, field(w('np.smb.user'), input('netUser', d.files.netUser, '', (v) => { d.files.netUser = v; }), '', null, { real: true }),
              secret(s, 'net:smb', w('np.smb.pw'), w('np.smb.pwHint', { computer }), { problem: o && o.state === 'failed' ? w('np.loc.net.refused.wrong', { place }) : s.ui.netNeed ? w('np.loc.net.refused.needBoth') : '', real: true, enter: () => NPx.netSignIn(s) })));
            put(loc, demo([{ label: 'jared · correct horse', outcome: 'works', run: () => { d.files.netUser = 'jared'; const el = s.secrets.get('net:smb'); if (el) el.value = 'correct horse'; s.changed(); } }, { label: 'jared · wrong password', outcome: 'refused', run: () => { d.files.netUser = 'jared'; const el = s.secrets.get('net:smb'); if (el) el.value = 'wrong'; s.changed(); } }], { id: 'netsmb' }));
            if (o && o.state === 'working') put(loc, working(w('np.loc.net.checking', { place })));
            else put(loc, h('div.pjx-row', null, btn(w('np.loc.net.check'), () => NPx.netSignIn(s), { key: 'where:netcheck', primary: true, cmd: 'cmd.project.source_location.test' })));
          } else if (o && o.state === 'working') put(loc, working(w('np.loc.net.checking', { place })));
          else if (o && o.state === 'failed') put(loc, line('blocked', w('np.loc.net.refused.' + (o.result.fail || 'denied'), { place, computer })));
          else if (o && o.state === 'done') put(loc, line('complete', w('np.loc.net.ok.' + (o.result.how || 'key'), { place, user: d.files.netUser, computer })));
        }
      }
      const r = NPx.placeRoot(s), fp = NPx.fullPath(s), named = !!String(nm || '').trim();
      const pathEl = r ? (named && fp ? code(fp) : h('span.pjx-np-code.is-open', { text: w('np.loc.fullNoName', { parent: r.root }), 'data-pmh-tag': 'literal' })) : h('span.pjx-np-code.is-open', { text: w('np.sec.notChosen') });
      const off = r && r.net && r.net.off;
      // a network place answers only once its check passed: until then the path says so instead
      const nc = r && r.net && !off ? NPx.netCheck(s) : null, netOk = !r || !r.net || (nc && nc.state === 'done');
      put(loc, h('div.pjx-np-path', null, cap(w('np.loc.full')), pathEl,
        r && netOk && !off ? h('div.pjx-np-pathfacts', null, st('complete', w('np.loc.answers', { place: r.net ? r.net.holder : r.holder })), r.free ? h('span.pjx-np-free', { text: w('np.loc.free', { free: r.free }) }) : null) : null,
        r && !netOk && !off ? h('div.pjx-np-pathfacts', null, st('pending', w('np.loc.net.first', { place: r.net.title }))) : null,
        off ? line('offline', w('np.loc.notAnswering', { place: r.net.holder })) : null));
      if (d.way === 'online' && fp && named) put(loc, hint(w('np.loc.copyGoes', { path: fp })));
      if (d.way === 'restore' && fp && named) put(loc, hint(w('np.loc.restoreGoes', { path: fp })));
      put(loc, line(null, w('np.loc.default', { computer: cn, folder: NPx.comp(d.runsOn).root }), { icon: 'settings', after: link(w('np.loc.defaultLink'), () => PJX.toast('Settings › Server & Project Location', cn + ' › Projects folder: a setting for each computer. New Projects there go in this folder; Projects you already have stay where they are.', 'info'), { key: 'where:default', cmd: 'cmd.settings.open' }) }));
    }
    if (s.ui.nasDropped) put(loc, h('div.pjx-notice', { 'data-tone': 'attention' }, h('span.pjx-notice-mark', { html: PJX.calm('warning', 16), 'aria-hidden': 'true' }), h('div.pjx-notice-title', { text: w('np.loc.nasDropped', { nas: 'Home NAS' }) }), h('div.pjx-notice-acts', null, link(w('np.loc.nasDroppedGo'), () => NPx.open(s, 'backup'), { key: 'where:nasgo' }))));
    put(box, loc);
    if (!stay) {
      const fn = NPx.folderNameOf(s), fnp = R().folderNameProblem(fn);
      put(box, disc(s, 'where-adv', w('np.sec.advanced'), () => [field(w('np.loc.folderName'), input('folderName', fn, '', (v) => { d.folderName = v; d.folderNameTouched = true; s.changed(); }), w('np.loc.folderNameHint'), d.folderNameTouched && fnp ? fnp : '')]));
    }
    void ctx;
    return box;
  }

  /* ------------------------------------------------------------------ section: like (6.7, SETTINGS-PROPOSAL 5.2 to 5.4) */
  const KIND_SHORT = { appearance_workspace: 'look', assistant_chat: 'chat', providers_accounts_models_routing: 'AI models', planning_goal: 'planning', orchestrator_automation: 'automation', tools_integrations: 'tools', testing_browser_devices: 'testing', permissions_security: 'permissions', memory_retention_history: 'memory', notifications_usage_budgets: 'notifications' };
  const THING_KIND = { persona: 'np.like.thing.persona', mcp: 'np.like.thing.mcp', command: 'np.like.thing.command' };
  function accountsWords(ids) { const names = ids.map((id) => { const a = ENV.accounts.find((x) => x.id === id); return a ? (a.kind === 'key' ? (/^an? /.test(a.name) ? a.name : 'an ' + a.name + ' key') : a.name) : id; }); return NP().andList(names); }
  function secLike(s) {
    const d = s.d, L = d.like, box = h('div.pjx-np-like'), NPx = NP(), cn = NPx.comp(d.runsOn).name;
    const projects = PJX.listed().filter((p) => p.lifecycle === 'listed' && !p.where.missing).sort((a, b) => a.openedRank - b.openedRank);
    const shownP = L.showAll ? projects : projects.slice(0, 4);
    if (L.source !== 'usual' && !shownP.some((p) => p.id === L.source)) { const sp = PJX.get(L.source); if (sp) shownP.push(sp); }
    const items = [{ id: 'usual', glyph: 'sparkles', title: w('np.like.usual'), sub: w('np.like.usualSub') }].concat(shownP.map((p) => {
      const S = NPx.settingsOf(p.id), own = S.own.length ? NPx.plural(S.own.length, 'setting') + (S.things.length ? ' and ' + NPx.plural(S.things.length, 'thing') : '') : '';
      return { id: p.id, glyph: p.glyph, title: w('np.like.row', { project: p.name }), sub: own ? w('np.like.rowSub', { own, accounts: accountsWords(S.uses) }) : w('np.like.rowSubNone', { accounts: accountsWords(S.uses) }) };
    }));
    put(box, choices('like:source', items, L.source, (v) => NPx.set(s, 'like.source', v), { label: w('np.like.title') }));
    if (!L.showAll && projects.length > 4) put(box, h('div.pjx-row', null, link(w('np.like.more'), () => { L.showAll = true; s.changed(); }, { key: 'like:more' })));
    const p = NPx.likeSrc(s);
    if (!p) { put(box, hint('Every new Project follows your usual settings, everywhere, and keeps following later changes to them.')); return box; }
    const pv = NPx.likePreview(s);
    if (pv.state === 'working') { put(box, working(w('np.like.reading', { project: p.name }))); return box; }
    const S = NPx.settingsOf(p.id), c = NPx.likeCounts(s);
    const kindsDiff = NPx.andList(Array.from(new Set(S.own.map((r) => r[0]))).map((k) => KIND_SHORT[k]));
    const rows = NPx.accountRows(s);
    const comes = h('div.pjx-np-comes', { 'data-cmd': 'cmd.settings.transaction.preview' }, cap(w('np.like.comes')), lines(
      S.own.length ? line(c.picked ? 'complete' : 'off', c.picked === S.own.length ? w('np.like.diffs', { n: S.own.length, kinds: kindsDiff }) : w('np.like.diffsPicked', { k: c.picked, n: S.own.length, kinds: kindsDiff })) : line('off', 'It has no settings of its own: it uses your usual settings.'),
      S.things.length ? line('complete', w('np.like.things', { n: S.things.length, things: NPx.andList(S.things.map((t) => (t.kind === 'persona' ? 'the persona ' : t.kind === 'mcp' ? 'the MCP server ' : 'the command ') + t.name)) })) : null,
      L.accounts ? line('complete', w('np.like.accounts', { computer: cn })) : line('off', w('np.like.acctOff'))));
    if (L.accounts) put(comes, acctRows(s, rows, false));
    put(comes, lines(line(null, w('np.like.never'), { icon: 'lock' }), hint(w('np.like.separate', { name: NPx.nameOf(s) || 'the new Project', project: p.name }))));
    put(box, comes);
    put(box, disc(s, 'like-adv', w('np.like.adv'), () => likeAdvanced(s, p, S, rows)));
    const parts0 = [NPx.plural(c.own, 'setting'), NPx.plural(c.things, 'thing'), NPx.plural(c.accounts, 'AI account')].concat(c.headers ? [NPx.plural(c.headers, 'sign-in header')] : []).concat(c.files ? [c.files + ' of its own files'] : []);
    put(box, h('p.pjx-np-totals', { 'aria-live': 'polite', text: c.own || c.things || c.accounts || c.headers || c.files ? w('np.like.totals', { list: NPx.andList(parts0) }) : w('np.like.totalsNone') }));
    put(box, hint(w('np.like.undoNote')));
    return box;
  }
  function acctRows(s, rows, adv) {
    const L = s.d.like;
    return h('ul.pjx-np-accts', { 'aria-label': w('np.like.acctHead') }, ...rows.map((r) => {
      const stEl = st(r.key, r.word);
      if (r.why) tip(stEl, r.word, r.why);
      return h('li.pjx-np-acct', { 'data-state': r.state },
        h('span.pjx-np-acct-name', { text: w('np.acct.row', { name: r.name, account: r.account }) }), stEl,
        adv ? seg('like:per:' + r.id, [{ id: 'same', title: w('np.like.acctSame') }, { id: 'later', title: w('np.like.acctLater') }], r.choice, (v) => { L.per[r.id] = v; s.changed(); }, r.name) : null);
    }));
  }
  function likeAdvanced(s, p, S, rows) {
    const d = s.d, L = d.like, NPx = NP(), cn = NPx.comp(d.runsOn).name, q = lc(L.q);
    const out = [];
    out.push(h('div.pjx-np-pair', null, field(w('np.like.find'), input('likeQ', L.q, 'Thinking depth', (v) => { L.q = v; s.changed(); }), ''),
      sw('like:onlydiff', w('np.like.onlyDiff'), w('np.like.onlyDiffSub'), L.onlyDiff, (v) => { L.onlyDiff = v; s.changed(); })));
    // settings by kind: the ten selectors (5.3.1), each with its count and its rows
    const kinds = h('div.pjx-np-kinds', { role: 'group', 'aria-label': w('np.like.kindsHead') }, h('div.pjx-np-kindshead', null, cap(w('np.like.kindsHead')), h('span.pjx-grow'),
      link(w('np.like.kindsAll'), () => { L.ids = null; L.kinds = null; s.changed(); }, { key: 'like:all' }), h('span.pjx-np-dot', { text: ' · ', 'aria-hidden': 'true' }),
      link(w('np.like.kindsNone'), () => { L.ids = {}; L.kinds = {}; S.own.forEach((r) => { L.ids[r[1]] = false; }); ENV.kinds.forEach(([kid]) => { L.kinds[kid] = false; }); s.changed(); }, { key: 'like:none' })));
    ENV.kinds.forEach(([kid, label]) => {
      const own = S.own.filter((r) => r[0] === kid), same = S.same.filter((r) => r[0] === kid);
      const hit = (r) => !q || lc(r[2]).indexOf(q) >= 0;
      const ownShown = own.filter(hit), sameShown = L.onlyDiff ? [] : same.filter(hit);
      if (q && !ownShown.length && !sameShown.length) return;
      const kOn = NPx.picked(L.kinds, kid), on = kOn ? own.filter((r) => NPx.picked(L.ids, r[1])).length : 0;
      const k = h('div.pjx-np-kind', { 'data-kind': kid });
      // a kind is a selection of its own: clearing it also keeps its values out of Keep them fixed (3.07)
      put(k, check('like:kind:' + kid, label, own.length ? kOn && on === own.length : kOn && L.fixed && same.length > 0, (v) => { L.kinds = L.kinds || {}; L.kinds[kid] = v; L.ids = L.ids || {}; own.forEach((r) => { L.ids[r[1]] = v; }); s.changed(); },
        { disabled: own.length || (L.fixed && same.length) ? null : w('np.like.kindNone'), mixed: own.length > 0 && on > 0 && on < own.length, sub: own.length ? w('np.like.kindCount', { k: on, n: own.length }) : same.length && L.fixed ? w('np.like.kindFixed', { n: same.length }) : w('np.like.kindNone') }));
      if (ownShown.length || sameShown.length) put(k, h('div.pjx-np-kindrows', null,
        ...ownShown.map((r) => check('like:id:' + r[1], w('np.like.singleRow', { label: r[2], value: r[4], usual: r[3] }), NPx.picked(L.ids, r[1]), (v) => { L.ids = L.ids || {}; L.ids[r[1]] = v; s.changed(); })),
        ...sameShown.map((r) => check('like:same:' + r[1], w('np.like.sameRow', { label: r[2], value: r[3] }), L.fixed && kOn && NPx.picked(L.sameIds, r[1]), (v) => { L.sameIds = L.sameIds || {}; L.sameIds[r[1]] = v; s.changed(); }, { disabled: L.fixed ? null : w('np.like.sameOff'), sub: L.fixed ? w('np.like.sameOn') : null }))));
      put(kinds, k);
    });
    put(kinds, hint(w('np.like.computerOnly', { computer: NPx.comp(p.runsOn || 'here').name })));
    out.push(kinds);
    // its own things, one outcome line each
    out.push(group(w('np.like.thingsGroup'), S.things.length ? h('div.pjx-np-things', null, ...S.things.map((t) => check('like:thing:' + t.id, w(THING_KIND[t.kind] || 'np.like.thing.command', { thing: t.name, project: p.name, computer: cn }), NPx.picked(L.things, t.id), (v) => { L.things = L.things || {}; L.things[t.id] = v; s.changed(); }))) : hint(w('np.like.thingNone'))));
    // AI accounts: the switch, then one line per account with its own choice
    out.push(group(w('np.like.acctHead'), sw('like:accounts', w('np.like.acctSwitch'), w('np.like.acctSwitchSub'), L.accounts, (v) => { L.accounts = v; s.changed(); }), L.accounts ? acctRows(s, rows, true) : hint(w('np.like.acctOff'))));
    // send keys: not drawn while SETTINGS.sendKeys is false (S11 A)
    if (NPx.SETTINGS.sendKeys && d.runsOn !== (p.runsOn || 'here') && rows.some((r) => r.kind === 'key')) out.push(lines(sw('like:sendkeys', w('np.like.sendKeys', { computer: cn }), w('np.like.sendKeysSub', { computer: cn, tools: 'Claude Code and Codex' }), !!L.sendKeys, (v) => { L.sendKeys = v; s.changed(); }), hint(w('np.like.sendKeysNew'), 'is-concept')));
    // about its own files (all off), then Also
    if (S.ownFiles.length) out.push(group(w('np.like.ownFilesHead'), hint(w('np.like.ownFilesSub')), ...S.ownFiles.map((f) => check('like:file:' + f.id, f.label, !!L.ownFiles[f.id], (v) => { L.ownFiles[f.id] = v; s.changed(); }))));
    out.push(group(w('np.like.alsoHead'), check('like:fixed', w('np.like.fixed'), L.fixed, (v) => { L.fixed = v; if (v) { L.onlyDiff = false; } s.changed(); }, { sub: w('np.like.fixedSub', { project: p.name, n: S.same.length, name: NPx.nameOf(s) || 'the new Project' }), disabled: S.same.length ? null : w('np.like.kindNone') }),
      S.fromComputer ? check('like:fromcomputer', w('np.like.fromComputer', { project: p.name, computer: NPx.comp(p.runsOn || 'here').name, n: S.fromComputer }), L.fromComputer, (v) => { L.fromComputer = v; s.changed(); }) : null));
    // never copied, with the reasons
    const keys = rows.filter((r) => r.kind === 'key').map((r) => w('np.like.never.key', { key: r.name + (r.mcp ? ' sign-in header' : ' key') }));
    out.push(group(w('np.like.neverHead'), lines(line(null, w('np.like.never.shell'), { icon: 'lock' }), ...keys.map((k) => line(null, k, { icon: 'lock' })), line(null, w('np.like.never.signins'), { icon: 'lock' })), hint(w('np.like.neverWhy'))));
    return out;
  }

  /* ------------------------------------------------------------------ section: versions (6.8) */
  function secVersions(s) {
    const d = s.d, NPx = NP(), box = h('div.pjx-np-ver'), k = NPx.histKeeps(s), cn = NPx.comp(d.runsOn).name;
    const rh = d.way === 'restore' ? NPx.restoredHist(s) : null;
    if (k === 'restored') put(box, line('complete', w('np.ver.restored', { kind: NPx.kindWord(rh.backend), ref: rh.branch ? (rh.backend === 'jujutsu' ? 'bookmark ' : 'branch ') + rh.branch : '' })));
    else if (k) put(box, line('complete', w('np.ver.keeps', { kind: k === 'jujutsu' ? 'Jujutsu' : 'Git' })));
    else {
      if (d.way === 'restore' && rh && !rh.backend) put(box, line('info', w('np.ver.restoredNone')));
      const lim = NPx.histLimits(s);
      put(box, group(d.way === 'online' ? w('np.ver.copyWith') : w('np.ver.with'), seg('ver:history', [{ id: 'git', title: w('np.ver.git') }, { id: 'jujutsu', title: w('np.ver.jj') }], d.history, (v) => NPx.set(s, 'history', v), w('np.ver.with')),
        hint(d.history === 'jujutsu' ? w('np.ver.jjSub') : w('np.ver.gitSub'))));
      if (d.history === 'jujutsu' && !NPx.jjOn(s)) put(box, line('info', w('np.ver.install', { computer: cn }), { cls: 'is-cmd' }));
      if (lim.length) {
        const list = NPx.andList(lim.map((x) => w('np.ver.lim.' + x))), eff = NPx.andList(lim.map((x) => w('np.ver.eff.' + x)));
        put(box, line('info', d.history === 'jujutsu' ? w('np.ver.jjLimitsChosen', { effects: eff }) : w('np.ver.jjLimits', { list, effects: eff })));
      }
    }
    put(box, disc(s, 'ver-more', w('np.ver.more'), () => [h('p.pjx-np-say', { text: w('np.ver.moreText') }), sw('ver:filesafe', w('np.ver.filesafe'), w('np.ver.filesafeSub'), d.filesafe, (v) => NPx.set(s, 'filesafe', v)), cap(w('np.gitjj.title')), gitJjAnswer()], { kind: 'more' }));
    return box;
  }

  /* ------------------------------------------------------------------ section: online (6.9) */
  function secOnline(s) {
    const d = s.d, NPx = NP(), box = h('div.pjx-np-online'), m = NPx.onlineMode(s), page = s.purpose === 'page';
    if (s.ui.retired) put(box, line('warning', w('np.svc.retired')));
    if (d.way === 'online') {
      const it = NPx.intentOf(s), svcName = d.src.service === 'git' ? '' : (R().service(d.src.service) || {}).name, a = NPx.accessDone(s) || {};
      if (d.src.service === 'git') put(box, line('info', w('np.online.plain', { address: d.src.gitAddress })));
      else if (it === 'contribute') {
        put(box, lines(line('info', a.fork ? w('np.online.forkExists', { fork: a.fork }) : w('np.online.fork', { fork: NPx.forkOwner(s) + '/' + NPx.forkName(s), verb: 'Copy' })), line('info', w('np.online.original', { project: d.find.project })), line('info', w('np.online.branch', { branch: d.find.branch }))));
        if (!a.fork) put(box, yoloLine(w('np.yolo.fork', { service: svcName })));
        if (!a.fork) put(box, disc(s, 'online-adv', w('np.sec.advanced'), () => {
          const fp = R().nameProblem(d.src.service, d.src.kind, NPx.forkName(s)), up = d.fork.upstreamName, upBad = !/^[A-Za-z0-9._-]+$/.test(up) || up === 'origin';
          return [field(w('np.fork.name', { service: svcName }), input('forkName', NPx.forkName(s), '', (v) => { d.fork.name = v; d.fork.nameTouched = true; s.changed(); }), w('np.fork.nameHint'), d.fork.nameTouched && fp ? fp : ''),
            field(w('np.fork.upstream'), input('upstream', up, 'upstream', (v) => { d.fork.upstreamName = v; s.changed(); }), w('np.fork.upstreamHint'), upBad ? w('np.fork.upstreamBad') : '')];
        }));
      } else if (it === 'copy') put(box, line('info', w('np.online.readOnly', { project: d.find.project })));
      else if (it === 'offer') put(box, lines(line('info', w('np.online.from', { service: svcName, project: d.find.project })), line('info', w('np.online.branch', { branch: d.find.branch }))));
      else put(box, line('info', d.find.project ? w('np.online.from', { service: svcName, project: d.find.project }) : 'Copied from the Project you choose in “Which Project?”'));
      return box;
    }
    const info = NPx.lookDone(s), found = info && info.online, lin = d.way === 'restore' ? NPx.lineage(s) : null;
    let items;
    if (d.way === 'restore' && lin) items = [{ id: 'leave', glyph: 'slash-circle', title: w('np.online.leaveRestore'), sub: w('np.online.leaveRestoreSub') }, { id: 'again', glyph: 'link', title: w('np.online.again'), sub: w('np.online.againSub', { service: lin[0] }) }, { id: 'make', glyph: 'cloud', title: w('np.online.makeNew'), sub: w('np.online.makeNewSub') }];
    else if (found) items = [{ id: 'link_found', glyph: 'link', title: w('np.online.linkFound'), sub: w('np.online.linkFoundSub', { service: found.service || 'the Git address' }), tag: w('np.svc.recommended') }, { id: 'leave', glyph: 'slash-circle', title: w('np.online.leave'), sub: w('np.online.leaveSub', { service: found.service || 'the Git address' }) }, { id: 'instead', glyph: 'cloud', title: w('np.online.instead'), sub: w('np.online.insteadSub') }];
    else if (d.way === 'new' || (d.way === 'chat' && !NPx.filesStay(s)) || d.way === 'restore') items = [{ id: 'none', glyph: 'slash-circle', title: w('np.online.notNow'), sub: w('np.online.notNowSub') }, { id: 'make', glyph: 'cloud', title: w('np.online.make'), sub: w('np.online.makeSub') }];
    else items = [{ id: 'none', glyph: 'slash-circle', title: w('np.online.notNow'), sub: w('np.online.notNowSub') }, { id: 'make', glyph: 'cloud', title: w('np.online.makeNew'), sub: w('np.online.makeNewSub') }, { id: 'link', glyph: 'link', title: w('np.online.link'), sub: w('np.online.linkSub') }];
    if (page) items = items.filter((x) => x.id !== 'none' && x.id !== 'leave');
    if (!(page && items.length === 1)) put(box, choices('online:mode', items, m, (v) => NPx.set(s, 'online.mode', v), { label: w('np.online.title') }));
    if (m === 'make' || m === 'instead') put(box, makeView(s));
    else if (m === 'link_found' || m === 'again') put(box, linkFoundView(s));
    else if (m === 'link') put(box, linkPickView(s));
    return box;
  }
  /* make a new one: 1 where it lives, 2 sign in, 3 name and who can see it; the rest under Advanced (6.9.4) */
  function makeView(s) {
    const d = s.d, o = d.online, NPx = NP(), svc = R().service(o.service), kd = R().kind(o.service, o.kind);
    const box = h('div.pjx-np-make', { 'data-cmd': svc && svc.id === 'github' ? 'cmd.project.new_github_repo' : 'cmd.forge.repository.create (gap: per-forge hand-off G1/G7)' });
    const addrOk = !kd.address || (NPx.addrOk(o.address) && NPx.serverCheck(s, o.service, kd.id, o.address).state === 'done');
    const rec = addrOk ? NPx.onlineRec(s) : null, si = rec && NPx.signedIn(rec, d.runsOn), signed = !!(si && !si.expired);
    const st1 = s.ui.mini.online === 1 || !addrOk ? 'open' : 'done';
    const st2 = st1 === 'open' ? 'later' : s.ui.mini.online === 2 || !signed ? 'open' : 'done';
    const st3 = st2 === 'done' ? 'open' : 'later';
    put(box, yoloLine(w('np.yolo.make')));
    put(box, mini({ n: 1, total: 3, key: 'make1', s, title: w('np.online.where'), state: st1, summary: svc ? kd.label + (kd.address ? ' · ' + o.address : '') : '',
      change: () => { s.ui.mini.online = 1; s.changed(); }, esc: s.ui.mini.online === 1 && addrOk ? () => { s.ui.mini.online = null; s.changed(); } : null,
      body: [serviceCards(s, 'osvc', { value: o.service, kind: o.kind, address: o.address, onService: (v) => NPx.set(s, 'online.service', v), onKind: (v) => NPx.set(s, 'online.kind', v), onAddress: (v) => NPx.set(s, 'online.address', v) }),
        h('div.pjx-row', null, btn(w('np.sec.continue'), () => { if (addrOk) { s.ui.mini.online = null; s.changed(); } }, { key: 'make1:go', off: addrOk ? null : 'Type the server’s address first' }))] }));
    let body2 = [];
    if (st2 === 'open' && rec) { const sv = signinView(s, rec, 'osign'); body2 = [sv.node, sv.done ? h('div.pjx-row', null, btn(w('np.sec.continue'), () => { s.ui.mini.online = null; s.changed(); }, { key: 'make2:go' })) : null]; }
    put(box, mini({ n: 2, total: 3, key: 'make2', s, title: w('np.link.signin', { service: svc ? svc.name : '' }), state: st2, summary: si ? w('np.signin.signedIn', { account: si.account, computer: NPx.comp(d.runsOn).name }) : '', change: () => { s.ui.mini.online = 2; s.ui['another:osign'] = true; s.changed(); },
      esc: s.ui.mini.online === 2 && signed ? () => { s.ui.mini.online = null; s.ui['another:osign'] = false; s.changed(); } : null, body: body2 }));
    let body3 = [];
    if (st3 === 'open') body3 = detailsView(s, rec);
    put(box, mini({ n: 3, total: 3, key: 'make3', title: w('np.details.title', { service: svc ? svc.name : '' }), state: st3, body: body3 }));
    return box;
  }
  function detailsView(s, rec) {
    const d = s.d, o = d.online, NPx = NP(), svc = R().service(o.service), kd = R().kind(o.service, o.kind), out = [];
    const owners = NPx.owners(s, rec), owner = NPx.ownerOf(s, rec), q = R().ownerQ(o.service, kd.id);
    const oname = (x) => (x.kind === 'personal' ? w('np.details.personal', { account: x.label }) : x.label);
    const osub = (x) => (x.kind === 'personal' ? (o.service === 'gitlab' ? w('np.details.kind.personalProject') : 'Your own account') : x.kind === 'organization' ? (x.enterprise ? w('np.details.kind.enterprise') : w('np.details.kind.organization')) : x.kind === 'group' ? w('np.details.kind.group') + (x.cap ? ' · ' + x.cap : '') : x.kind === 'subgroup' ? w('np.details.kind.subgroup') + (x.cap ? ' · ' + x.cap : '') : x.kind === 'azOrg' ? 'Organization' : x.kind === 'collection' ? 'Collection on this server' : x.kind === 'workspace' ? 'Workspace' : x.personal ? 'Your personal project' : 'Project');
    out.push(group(q, choices('o:owner', owners.map((x) => ({ id: x.id, glyph: x.kind === 'personal' ? 'user' : 'organisation', title: oname(x), sub: osub(x) })), owner && owner.id, (v) => NPx.set(s, 'online.owner', v), { label: q })));
    const pn = R().projectNoun(o.service, kd.id);
    let pj = null;
    if (pn && owner) {
      pj = NPx.projectOf(s, owner);
      const ps = (owner.projects || []).map((x) => ({ id: x.id, glyph: x.tfvc ? 'slash-circle' : 'box', title: x.label, sub: x.tfvc ? w('np.details.tfvc') : o.service === 'bitbucket' ? (x.private ? w('np.details.bbPrivateProject', { key: x.key }) : w('np.details.bbPublicProject', { key: x.key })) : 'Git', disabled: x.tfvc ? w('np.find.tfvc', { project: x.label }) : null }));
      out.push(group(pn === 'teamProject' ? w('np.details.teamProject') : w('np.details.bbProject'), choices('o:project', ps, pj && pj.id, (v) => NPx.set(s, 'online.project', v), { label: pn })));
    }
    const nm = NPx.onlineName(s), nc = NPx.nameCheck(s);
    const ni = input('oname', nm, '', (v) => { o.name = v; o.nameTouched = true; s.changed(); });
    const nhint = nc && nc.state === 'working' ? w('np.details.checking') : nc && nc.result && nc.result.ok ? w('np.details.available') + (svc.spaces === 'keep' ? ' · ' + w('np.details.slug', { slug: R().slug(nm) }) : '') : R().RULE_TEXT[typeof svc.rule === 'string' ? svc.rule : svc.rule[kd.id]];
    out.push(field(w('np.details.title', { service: svc.name }), ni, nhint, nc && nc.result && nc.result.bad ? nc.result.bad : '', { real: true, after: owner ? h('div.pjx-np-preview', null, code((owner.label.replace(/ \/ /g, '/')) + '/' + nm)) : null }));
    out.push(demo([{ label: (rec && rec.taken && rec.taken[0]) || 'budget-tracker', outcome: 'taken', run: () => { o.name = (rec && rec.taken && rec.taken[0]) || 'budget-tracker'; o.nameTouched = true; s.changed(); } }, { label: 'bad/name?', outcome: 'wrong', run: () => { o.name = 'bad/name?'; o.nameTouched = true; s.changed(); } }, { label: R().spell(o.service, NPx.nameOf(s) || 'book-club-website'), outcome: 'works', run: () => { o.name = R().spell(o.service, NPx.nameOf(s) || 'book-club-website'); o.nameTouched = true; s.changed(); } }], { id: 'oname' }));
    const v = NPx.visOf(s, rec, owner, pj);
    if (v.opts.length) out.push(group(w('np.details.privacy'), choices('o:vis', v.opts.map((x) => ({ id: x.id, glyph: x.id === 'private' ? 'lock' : x.id === 'internal' ? 'users' : 'globe', title: x.title, sub: x.sub })), v.v && v.v.id, (x) => { o.visibility = x; s.changed(); }, { label: w('np.details.privacy') }), R().capNote(o.service, kd.id, owner, pj, rec && rec.host) ? line('info', R().capNote(o.service, kd.id, owner, pj, rec && rec.host)) : null));
    else out.push(line('info', w('np.details.azurePrivacy')));
    if (o.service === 'azure') out.push(h('div.pjx-row', null, link(w('np.details.teamProjectRefresh'), () => PJX.toast('Team projects refreshed', 'Finance, Mobile and Legacy (TFVC).', 'info'), { key: 'o:azrefresh', cmd: 'cmd.forge.repository.list' })));
    out.push(disc(s, 'online-adv', w('np.sec.advanced'), () => [
      field(w('np.details.description'), input('odesc', o.description, '', (x) => { o.description = x; }), ''),
      field(w('np.details.branch'), input('obranch', o.branch || 'main', 'main', (x) => { o.branch = x; s.changed(); }), w('np.details.branchHint'), o.branch && R().branchProblem(o.branch) ? R().branchProblem(o.branch) : ''),
      demo([{ label: 'main', outcome: 'works', run: () => { o.branch = 'main'; s.changed(); } }, { label: 'my branch', outcome: 'wrong', run: () => { o.branch = 'my branch'; s.changed(); } }], { id: 'obranch' }),
      // (GUIDED-FLOWS 4.18) the README, the ignore list and the licence live here, in the one online-copy Advanced; Start with
      // keeps only which files it begins with, and a folder that has history makes an empty online copy for it
      ...(d.way === 'new' ? [
        line('complete', w('np.details.startNew', { basics: lc(NPx.summary(s, 'start')) }), { after: link(w('np.details.startNewLink'), () => NPx.open(s, 'start'), { key: 'o:start' }) }),
        sw('o:readme', w('np.start.readme'), w('np.start.readmeSub'), d.basics.readme, (v) => NPx.set(s, 'basics.readme', v)),
        group(w('np.start.ignore'), seg('o:ignore', [['automatic', 'Chosen for you'], ['none', 'None'], ['rust', 'Rust'], ['node', 'Node'], ['python', 'Python'], ['slint', 'Slint']].map(([id, title]) => ({ id, title })), d.basics.ignore, (v) => NPx.set(s, 'basics.ignore', v), w('np.start.ignore')), hint(w('np.start.ignoreHint'))),
        group(w('np.start.license'), seg('o:license', [['none', 'No license'], ['mit', 'MIT'], ['apache_2', 'Apache 2.0'], ['gpl_3', 'GPL 3.0']].map(([id, title]) => ({ id, title })), d.basics.license, (v) => NPx.set(s, 'basics.license', v), w('np.start.license')), hint(w('np.start.licenseHint')))
      ] : [line('info', w('np.details.startExisting'))]),
      NPx.onlineMode(s) === 'instead' ? field(w('np.link.remoteName'), input('remoteName', o.remoteName || o.service, '', (x) => { o.remoteName = x; s.changed(); }), 'The folder’s old link, origin, stays as it is.') : null,
      o.service === 'azure' ? h('div.pjx-row', null, link(w('np.details.teamProjectNew'), () => PJX.toast('Azure DevOps', 'Opens Azure DevOps’ own page to make a team project.', 'info'), { key: 'o:aznew', cmd: 'cmd.auth_profile.open_official_page' })) : null,
      hint(w('np.details.noTopics'))
    ]));
    return out;
  }
  /* link it (a found online copy, or one from a restore): sign in on the work computer, then the check (6.9.2) */
  function linkFoundView(s) {
    const d = s.d, NPx = NP(), t = NPx.linkTarget(s), box = h('div.pjx-np-link', { 'data-cmd': 'cmd.source_control.repository.bind' });
    if (!t) return box;
    if (t.address) {
      const c = NPx.linkCheck(s);
      put(box, c && c.state === 'working' ? working('Reading ' + t.address + '…') : c && c.state === 'failed' ? line('blocked', w('np.link.gone', { project: t.address, service: 'that server' })) : line('info', w('np.link.address')));
      return box;
    }
    const rec = NPx.linkRec(s), si = NPx.signedIn(rec, d.runsOn), signed = !!(si && !si.expired), cn = NPx.comp(d.runsOn).name;
    put(box, yoloLine(w('np.yolo.link')));
    if (signed && !s.ui['another:link']) put(box, mini({ n: 1, total: 2, key: 'link1', title: w('np.link.signin', { service: t.service }), state: 'done', summary: w('np.link.signedIn', { service: t.service, account: si.account, computer: cn }), change: () => { s.ui['another:link'] = true; s.changed(); } }));
    else put(box, mini({ n: 1, total: 2, key: 'link1', title: w('np.link.signin', { service: t.service }), state: 'open', body: [signinView(s, rec, 'link').node] }));
    const c = signed ? NPx.linkCheck(s) : null;
    let body = [];
    if (c && c.state === 'working') body = [working(w('np.link.checking', { project: t.project, service: t.service }))];
    else if (c && c.state === 'failed') body = [line('blocked', c.result.fail === 'gone' ? w('np.link.gone', { project: t.project, service: t.service }) : w('np.link.mismatch', { project: t.project }))];
    else if (c && c.state === 'done') { const i = NPx.lookDone(s); body = [line('complete', w('np.link.match')), c.result.vis ? line('info', w('np.link.vis', { vis: c.result.vis, service: t.service })) : line('info', w('np.link.visUnknown', { service: t.service })), i && i.changed ? line('info', w('np.link.ahead', { n: i.changed })) : null]; }
    put(box, mini({ n: 2, total: 2, key: 'link2', title: 'Check it’s this Project', state: signed ? 'open' : 'later', body }));
    if (t.remote) put(box, disc(s, 'online-adv', w('np.sec.advanced'), () => [line(null, w('np.link.remote', { remote: t.remote }), { icon: 'link' })]));
    return box;
  }
  /* link one you already have: the service (or any Git address), sign in, pick, check (6.9.3) */
  function linkPickView(s) {
    const d = s.d, o = d.online, NPx = NP(), box = h('div.pjx-np-link', { 'data-cmd': 'cmd.source_control.repository.bind + gap:add remote' });
    put(box, serviceCards(s, 'olsvc', { value: o.service, kind: o.kind, address: o.service === 'git' ? '' : o.address, git: true, onService: (v) => NPx.set(s, 'online.service', v === 'git' ? 'git' : v), onKind: (v) => NPx.set(s, 'online.kind', v), onAddress: (v) => NPx.set(s, 'online.address', v) }));
    if (o.service === 'git') {
      put(box, field(w('np.svc.gitAddressLabel'), input('olAddr', o.address, '', (v) => { o.address = v; s.changed(); }), w('np.svc.gitAddressHint'), o.address && !NPx.gitAddrValid(o.address) ? w('np.svc.gitAddressBad') : '', { real: true }));
      const c = NPx.gitAddrValid(o.address) ? NPx.linkCheck(s) : null;
      if (c) put(box, c.state === 'working' ? working('Reading ' + o.address + '…') : c.state === 'failed' ? line('blocked', w('np.svc.gitAddressNone')) : line('complete', w('np.link.address')));
      put(box, demo([{ label: 'https://git.example.net/team/tool.git', outcome: 'works', run: () => { o.address = 'https://git.example.net/team/tool.git'; s.changed(); } }, { label: 'ssh://nobody.invalid/x.git', outcome: 'no answer', run: () => { o.address = 'ssh://nobody.invalid/x.git'; s.changed(); } }], { id: 'olgit' }));
      return box;
    }
    const kd = R().kind(o.service, o.kind);
    if (kd.address && !NPx.addrOk(o.address)) return box;
    const rec = NPx.onlineRec(s); if (!rec) return box;
    const sv = signinView(s, rec, 'olsign'); put(box, sv.node);
    if (!sv.done) return box;
    const repos = (rec.repos || []).filter((r) => !r.tfvc);
    put(box, group(w('np.link.pick'), choices('ol:pick', repos.map((r) => ({ id: r.id, glyph: 'box', title: r.id, sub: r.vis + ' · updated ' + r.when })), o.linkProject, (v) => { o.linkProject = v; s.changed(); }, { label: w('np.link.pick') })));
    const folder = (NPx.lookTarget(s) || {}).path || '';
    put(box, demo([{ label: 'jared/budget-tracker', outcome: /budget-tracker$/.test(folder) ? 'works' : 'wrong (doesn’t match)', run: () => { o.linkProject = 'jared/budget-tracker'; s.changed(); } }, { label: 'jared/garden-planner', outcome: 'wrong (doesn’t match)', run: () => { o.linkProject = 'jared/garden-planner'; s.changed(); } }, { label: 'jared/dotfiles', outcome: 'empty: your history goes up', run: () => { o.linkProject = 'jared/dotfiles'; s.changed(); } }], { id: 'olpick' }));
    const c = o.linkProject ? NPx.linkCheck(s) : null;
    if (c) put(box, c.state === 'working' ? working(w('np.link.checking', { project: o.linkProject, service: R().service(o.service).name })) : c.state === 'failed' ? line('blocked', c.result.fail === 'gone' ? w('np.link.gone', { project: o.linkProject, service: R().service(o.service).name }) : w('np.link.mismatch', { project: o.linkProject })) : line('complete', c.result.empty ? w('np.link.empty', { project: o.linkProject }) : w('np.link.match')));
    put(box, disc(s, 'online-adv', w('np.sec.advanced'), () => [field(w('np.link.remoteName'), input('remoteName', o.remoteName || 'origin', 'origin', (x) => { o.remoteName = x; s.changed(); }), 'Letters, numbers, - _ and . only.', o.remoteName && R().remoteProblem(o.remoteName, []) ? R().remoteProblem(o.remoteName, []) : '')]));
    return box;
  }

  /* ------------------------------------------------------------------ section: backup (6.10) */
  function secBackup(s, ctx) {
    ctx = ctx || {};
    const d = s.d, b = d.backup, NPx = NP(), box = h('div.pjx-np-backup'), cn = NPx.comp(d.runsOn).name;
    const onNas = NPx.filesOnNas(s), nasDev = NPx.dev('nas'), gacct = d.runsOn === 'here' ? ENV.backupPlaces.google_drive.account : null;
    const taken = ctx.taken || [];
    const items = [
      { id: 'nas', glyph: 'server', title: 'Home NAS', sub: w('np.bk.nasSub'), disabled: onNas ? w('np.bk.nasSame', { nas: 'Home NAS' }) : !nasDev.online ? w('np.bk.nasOff', { nas: 'Home NAS' }) : taken.indexOf('Home NAS') >= 0 ? 'Already a backup place for this Project' : null },
      { id: 'gdrive', glyph: 'cloud', title: w('np.bk.gdrive'), sub: gacct ? w('np.bk.gdriveSub', { account: gacct }) : w('np.bk.driveSubOut'), disabled: taken.indexOf('Google Drive') >= 0 ? 'Already a backup place for this Project' : null },
      { id: 'onedrive', glyph: 'cloud', title: w('np.bk.onedrive'), sub: w('np.bk.driveSubOut'), disabled: taken.indexOf('OneDrive') >= 0 ? 'Already a backup place for this Project' : null },
      { id: 'bucket', glyph: 'vault', title: w('np.bk.bucket'), sub: w('np.bk.bucketSub') },
      { id: 'server', glyph: 'server', title: w('np.bk.server'), sub: w('np.bk.serverSub') }
    ];
    if (!ctx.noNone) items.push({ id: 'none', glyph: 'slash-circle', title: w('np.bk.none'), sub: w('np.bk.noneSub') });
    put(box, group(w('np.bk.where'), choices('bk:dest', items, b.dest, (v) => NPx.set(s, 'backup.dest', v), { label: w('np.bk.where'), cls: 'pjx-choices-list' })));
    if (onNas) put(box, line('info', w('np.bk.nasSame', { nas: 'Home NAS' })));
    put(box, line(null, w('np.bk.more'), { icon: 'settings', after: link(w('np.bk.moreLink'), () => PJX.toast('Settings › Backup & Restore', 'Azure Blob Storage, Google Cloud Storage, a backup server of your own, and every retention rule.', 'info'), { key: 'bk:more', cmd: 'cmd.settings.open' }) }));
    if (b.dest === 'none') return box;
    const fam = NPx.bkFamily(s), under = h('div.pjx-np-under');
    if (b.dest === 'bucket') put(under, group(w('np.bk.bucketWhich'), seg('bk:sub', [{ id: 'aws_s3', title: w('np.bk.bucket.aws') }, { id: 'backblaze_b2', title: w('np.bk.bucket.b2') }, { id: 's3_compatible', title: w('np.bk.bucket.other') }], fam, (v) => NPx.set(s, 'backup.sub', v), w('np.bk.bucketWhich'))));
    if (b.dest === 'server') put(under, group(w('np.bk.serverHow'), seg('bk:sub', [{ id: 'sftp', title: w('np.bk.server.sftp') }, { id: 'webdav', title: w('np.bk.server.webdav') }], fam, (v) => NPx.set(s, 'backup.sub', v), w('np.bk.serverHow'))));
    const ex = NPx.bkExisting(s);
    put(under, h('div.pjx-np-path', null, cap(w('np.bk.place')), code(NPx.bkPlace(s))));
    if (ex) put(under, line('info', w('np.bk.place.existing', { list: NPx.andList(ex.slice(0, 2).concat(ex.length > 2 ? [(ex.length - 2) + ' more'] : [])) })));
    if (b.dest === 'nas') put(under, line(null, d.runsOn === 'homenas' ? w('np.bk.place.nasPaired', { nas: 'Home NAS' }) : w('np.bk.place.nasKey', { nas: 'Home NAS' }), { icon: 'key' }));
    if ((b.dest === 'gdrive' && !gacct) || b.dest === 'onedrive') put(under, line(null, w('np.bk.signinLater'), { icon: 'lock' }));
    if (b.dest === 'bucket' || b.dest === 'server') put(under, accessFields(s, fam));
    if (onNas && b.dest !== 'nas' && NPx.bkOnNas(s)) put(under, line('blocked', w('np.bk.nasSameAddr', { nas: 'Home NAS', host: NPx.bkHost(s) })));
    put(box, under);
    const out0 = Object.keys(b.leaveOut || {}).filter((k) => b.leaveOut[k]);
    put(box, lines(line(null, w('np.bk.what.safe', { computer: cn }), { icon: 'lock' }),
      line('complete', b.include === 'all' ? w('np.bk.what.all') : b.include === 'pm' ? w('np.bk.what.pm') : w('np.bk.what.some') + (out0.length ? ': ' + NPx.andList(out0) + ' left out' : '')),
      line('complete', b.mode === 'manual' ? w('np.bk.when.manual') : w('np.bk.when.daily', { time: b.time, computer: cn }))));
    put(box, yoloLine(w('np.yolo.backup', { where: bkLabelFor(s) })));
    put(box, disc(s, 'bk-adv', w('np.sec.advanced'), () => backupAdvanced(s)));
    return box;
  }
  const bkLabelFor = (s) => NP().bkDestLabel(s);
  function accessFields(s, fam) {
    const d = s.d, acc = d.backup.acc, box = h('div.pjx-np-access-fields', null, cap(w('np.bk.accessHead')));
    R().shown(fam, acc).forEach((f) => {
      const [k, type] = f, wd = R().fieldWords(fam, k), bad = R().fieldBad(f, acc);
      if (type === 'password') put(box, secret(s, 'bk:' + fam + ':' + k, wd.label, wd.hint, { real: true, onTyped: (t) => { acc[k + 'Typed'] = t; s.changed(); } }));
      else put(box, field(wd.label + (f[3] === 'opt' ? '' : ''), input('acc-' + fam + '-' + k, acc[k] || '', wd.ph, (v) => { acc[k] = v; s.changed(); }), wd.hint, bad ? wd.bad : '', { real: true }));
    });
    // turning temporary keys off throws the session token away: it never comes back if they are turned on again (FO-22)
    if (fam === 'aws_s3') put(box, h('div.pjx-row', null, link(acc.temp ? 'Not using temporary keys' : 'Using temporary keys?', () => {
      if (acc.temp) { const el = s.secrets.get('bk:aws_s3:session'); if (el) el.value = ''; s.secrets.delete('bk:aws_s3:session'); acc.sessionTyped = false; }
      acc.temp = !acc.temp; s.changed();
    }, { key: 'bk:temp' })));
    put(box, demo((R().DEMO_ACCESS[fam] || []).map(([outcome, fills]) => ({ label: (fills.find(([k]) => k === 'bucket') || fills[0])[1], outcome, run: () => {
      fills.forEach(([k, v]) => { const f = (R().ACCESS[fam] || []).find((x) => x[0] === k); if (f && f[1] === 'password') { const el = s.secrets.get('bk:' + fam + ':' + k) || null; if (el) el.value = v; acc[k + 'Typed'] = true; } else acc[k] = v; });
      s.changed();
    } })), { id: 'acc' + fam, hide: !R().accessProblem(fam, acc) }));
    return box;
  }
  function backupAdvanced(s) {
    const d = s.d, b = d.backup, NPx = NP(), out = [];
    out.push(group(w('np.bk.what'), choices('bk:include', [{ id: 'all', glyph: 'safe', title: w('np.bk.what.all') }, { id: 'pm', glyph: 'notebook', title: w('np.bk.what.pm') }, { id: 'some', glyph: 'folder', title: w('np.bk.what.some') }], b.include, (v) => { b.include = v; s.changed(); }, { label: w('np.bk.what') })));
    if (b.include === 'pm') out.push(line('warning', w('np.bk.what.pmWarn')));
    if (b.include === 'some') {
      const i = NPx.lookDone(s) || {}, tops = Array.from(new Set(['assets', 'build', 'node_modules'].concat(i.submodules || []).concat(i.lfs ? ['large files (Git LFS)'] : [])));
      out.push(group(w('np.bk.what.someLabel'), ...tops.map((f) => check('bk:out:' + f, f, !!b.leaveOut[f], (v) => { b.leaveOut[f] = v; s.changed(); }))), line('warning', w('np.bk.what.someWarn')));
    }
    out.push(group(w('np.bk.when'), choices('bk:mode', [{ id: 'daily', glyph: 'calendar', title: w('np.bk.when.daily', { time: b.time, computer: NPx.comp(d.runsOn).name }) }, { id: 'manual', glyph: 'upload', title: w('np.bk.when.manual') }], b.mode, (v) => { b.mode = v; s.changed(); }, { label: w('np.bk.when') })));
    if (b.mode === 'daily') {
      const sel = h('select.pjx-input.pjx-np-select', { 'data-pjx-key': 'bk:time', id: 'pjx-np-bktime-' + s.id });
      for (let i = 0; i < 48; i++) { const hh = Math.floor(i / 2), mm = i % 2 ? '30' : '00', t = ((hh % 12) || 12) + ':' + mm + ' ' + (hh < 12 ? 'AM' : 'PM'); const o = h('option', { value: t, text: t }); if (t === b.time) o.selected = true; put(sel, o); }
      sel.addEventListener('change', () => { b.time = sel.value; s.changed(); });
      out.push(h('div.pjx-field', null, h('label.pjx-field-label', { for: sel.id, text: w('np.bk.when.time') }), sel));
      const tzc = NPx.comp(d.runsOn), tz = h('select.pjx-input.pjx-np-select', { 'data-pjx-key': 'bk:tz', id: 'pjx-np-bktz-' + s.id });
      [['', w('np.bk.tz.computer', { computer: tzc.name, tz: tzc.tz })], ['America/New_York', 'America/New_York'], ['America/Chicago', 'America/Chicago'], ['America/Los_Angeles', 'America/Los_Angeles'], ['Europe/London', 'Europe/London'], ['UTC', 'UTC']].forEach(([v, t]) => { const o = h('option', { value: v, text: t }); if ((b.tz || '') === v) o.selected = true; put(tz, o); });
      tz.addEventListener('change', () => { b.tz = tz.value || null; s.changed(); });
      out.push(h('div.pjx-field', null, h('label.pjx-field-label', { for: tz.id, text: w('np.bk.tz') }), tz, h('div.pjx-field-hint', { text: w('np.bk.tzHint', { computer: tzc.name }) })));
    }
    // P8 (Jared, 2026-11-03): Standard, or how many to keep, here under Advanced; no More or Fewer presets
    out.push(group(w('np.bk.when.keep'), choices('bk:keep', [{ id: 'standard', glyph: 'history', title: w('np.bk.keep.standard'), tag: w('np.svc.recommended') }, { id: 'custom', glyph: 'sliders', title: w('np.bk.keep.custom'), sub: b.keep === 'custom' ? w('np.bk.keep.customVal', b.keepCustom) : null }], b.keep === 'custom' ? 'custom' : 'standard', (v) => { b.keep = v; s.changed(); }, { label: w('np.bk.when.keep') })));
    if (b.keep === 'custom') {
      const k = b.keepCustom, bad = NPx.keepBad(k);
      out.push(h('div.pjx-np-trio', null, ...[['d', 'np.bk.keep.days'], ['w', 'np.bk.keep.weeks'], ['m', 'np.bk.keep.months']].map(([x, key]) => field(w(key), input('keep-' + x, String(k[x]), '', (v) => { k[x] = Number(v) || 0; s.changed(); }, { inputmode: 'numeric' }), ''))), bad ? line('warning', w('np.bk.keep.bad')) : null);
    }
    return out;
  }

  /* ------------------------------------------------------------------ the guided page: every section in order (spec 2.4) */
  const RENDER = { start: secStart, folder: secFolder, device: secDevice, source: secSource, find: secFind, restore: secRestore, chat: secChat, where: secWhere, like: secLike, versions: secVersions, online: secOnline, backup: secBackup };
  function title(s, id) {
    const d = s.d;
    return ({ start: w('np.start.title'), folder: w('np.folder.title'), device: w('np.device.title'), source: w('np.source.title'), find: w('np.find.title'), restore: w('np.restore.title'), chat: w('np.chat.title'),
      where: NP().filesStay(s) ? w('np.where.titleExisting') : w('np.where.title'), like: w('np.like.title'), versions: w('np.ver.title'), online: w('np.online.title'), backup: w('np.bk.title') })[id];
  }
  function lead(s, id) {
    const c = NP().chatOf(s.d.chat.id);
    return ({ start: w('np.start.lead'), folder: w('np.folder.lead'), device: w('np.device.lead'), source: w('np.source.lead'), find: w('np.find.lead'), restore: w('np.restore.lead'), chat: c ? w('np.chat.lead', { chat: c.title }) : '',
      where: w('np.where.lead'), like: w('np.like.lead'), versions: w('np.ver.lead'), online: w('np.online.lead'), backup: w('np.bk.lead') })[id];
  }
  /* draw the sections into container (ctx: { onInstead, onCreate }) */
  function sectionsView(s, container, ctx) {
    ctx = ctx || {};
    const NPx = NP();
    NPx.enter(s);
    s.ui.esc = {};
    const list = NPx.sections(s), n = list.length;
    const nextOpen = s.ui.open ? NPx.firstNotDone(s, s.ui.open) : null;
    const kids = list.map((id, i) => {
      const stt = NPx.state(s, id), p = NPx.problem(s, id), bid = 'pjx-np-b-' + s.id + '-' + id, hid = 'pjx-np-h-' + s.id + '-' + id;
      const open = stt === 'open';
      const word = open ? '' : stt === 'done' ? w('np.sec.change') : stt === 'blocked' ? w('np.sec.fix') : w('np.sec.answer');
      const sum = open ? null : stt === 'done' ? h('span.pjx-np-sum', { text: NPx.summary(s, id) }) : stt === 'blocked' ? h('span.pjx-np-sum.is-blocked', null, st('warning', p.text)) : h('span.pjx-np-sum.is-todo', { text: p && p.wait ? p.text : w('np.sec.needs') });
      const head = h('button.pjx-np-head', { type: 'button', id: hid, 'aria-expanded': String(open), 'aria-controls': bid, 'data-c-key': 'sec:' + id },
        h('span.pjx-np-num', { text: String(i + 1), 'aria-hidden': 'true' }),
        h('span.pjx-np-headtext', null, h('span.pjx-np-q', { text: title(s, id) }), sum),
        word ? h('span.pjx-np-act', { text: word }) : h('span.pjx-np-act.is-fold', { html: icon('chevron-up', 14), 'aria-hidden': 'true' }));
      head.setAttribute('aria-label', (i + 1) + ', ' + title(s, id) + (open ? '' : ': ' + (stt === 'done' ? NPx.summary(s, id) + ', ' + word : stt === 'blocked' ? p.text + ', ' + word : w('np.sec.needs').toLowerCase() + ', ' + word)));
      head.addEventListener('click', () => { if (open) NPx.fold(s); else NPx.open(s, id); });
      const sec = h('section', { class: ['pjx-np-sec'], 'data-step': id, 'data-state': stt, 'aria-labelledby': hid }, h('h3.pjx-np-h', null, head));
      if (open) {
        const err = s.ui.err[id];
        const body = h('div.pjx-np-body', { id: bid }, lead(s, id) ? h('p.pjx-np-lead', { text: lead(s, id) }) : null, RENDER[id](s, ctx));
        const last = !nextOpen;
        const errEl = err && p ? h('div.pjx-np-err', { role: 'alert', id: 'pjx-np-e-' + s.id + '-' + id }, st('warning', p.text)) : null;
        // one accent at a time (spec 2.4): an action inside the section (Check access, Sign in, Add my key) or, once
        // every section is done, Create in the Review is the filled button; otherwise Continue is
        const inner = body.querySelector('.pjx-btn.is-primary');
        const go = btn(last ? w('np.sec.continueLast') : w('np.sec.continue'), () => {
          const pr = NPx.cont(s, id);
          if (pr && ctx.focusField) ctx.focusField(id, pr.field);
          else if (!pr && ctx.afterContinue) ctx.afterContinue(s.ui.open);
        }, { key: 'sec:' + id + ':go', primary: !inner && !NPx.allDone(s), describedby: errEl ? errEl.id : null });
        put(body, h('div.pjx-np-foot', null, errEl, h('span.pjx-grow'), go));
        put(sec, body);
      }
      return sec;
    });
    container.replaceChildren(...kids);
    return container;
  }

  /* ------------------------------------------------------------------ the Review (6.11) */
  function reviewView(s, ctx) {
    ctx = ctx || {};
    const NPx = NP(), d = s.d, verb = (NPx.VERB[d.way] || NPx.VERB.new)[0], name = String(NPx.nameOf(s) || '').trim();
    const box = h('div.pjx-np-review');
    NPx.review(s).forEach((g) => {
      const dl = h('dl.pjxc-rrows.pjx-np-rrows');
      g.rows.forEach((r) => {
        const dt = h('dt', null, h('span', { text: r.k }), r.sec ? link(w('np.sec.change'), () => ctx.change && ctx.change(r.sec, r.field), { key: 'rv:' + g.id + ':' + r.k, tip: w('np.sec.change') + ' ' + lc(r.k) }) : null);
        put(dl, dt); put(dl, h('dd', { class: [r.open && 'is-open', r.code && 'is-code'], text: r.v }));
      });
      if (g.closed) put(box, disc(s, 'rv-' + g.id, g.label, [dl], { kind: 'review' }));
      else put(box, h('section.pjxc-rgroup', null, h('div.pjxc-rghead', null, h('h4.pjxc-cap', { text: g.label })), dl));
    });
    const ph = NPx.phases(s);
    put(box, disc(s, 'rv-will', w('np.rv.will', { verb }), [h('ol.pjx-np-will', null, ...ph.map((x) => h('li', { 'data-cmd': x.cmd, text: x.label })))], { kind: 'review' }));
    return box;
  }
  /* the Review's foot: the fork said out loud, the first problem, the button, the step count and the concept demo */
  function reviewFoot(s, ctx) {
    ctx = ctx || {};
    const NPx = NP(), d = s.d, verb = (NPx.VERB[d.way] || NPx.VERB.new)[0], name = String(NPx.nameOf(s) || '').trim();
    const pr = NPx.firstProblem(s), ph = NPx.phases(s), foot = h('div.pjxc-commit');
    const fork = ph.find((x) => x.key === 'fork');
    if (fork) put(foot, line('info', w('np.rv.forkSays', { fork: NPx.forkOwner(s) + '/' + NPx.forkName(s), service: fork.service }), { cls: 'pjx-np-forksays' }));
    if (pr) { const why = h('button.pjxc-why', { type: 'button', id: 'pjxc-why', 'data-c-key': 'rv:why' }, h('span.pjx-st-mark', { html: PJX.calm('warning', 13), 'aria-hidden': 'true' }), h('span', { text: pr.text })); why.addEventListener('click', () => ctx.change && ctx.change(pr.section, pr.field)); put(foot, why); }
    const label = d.way === 'chat' ? w('np.rv.goChat') : w('np.rv.go', { verb, name: name || 'it' });
    // while the agent demo asks, its Allow is the one accent on screen
    const go = h('button', { type: 'button', class: ['pmw-act', 'pjxc-btn', 'pjxc-go', !pr && !(s.ui.agent && !PJX.yolo()) && 'is-primary'], 'data-c-key': 'rv:go', 'aria-disabled': pr ? 'true' : null, 'aria-describedby': pr ? 'pjxc-why' : null, 'data-cmd': ph.map((x) => x.cmd).join(' → ') },
      h('span.pjxc-bico', { html: icon(d.way === 'restore' ? 'history' : d.way === 'online' ? 'download' : 'check', 15), 'aria-hidden': 'true' }), h('span.pjxc-blabel', { text: label }));
    go.addEventListener('click', () => { if (pr) { ctx.change && ctx.change(pr.section, pr.field); return; } ctx.create && ctx.create(); });
    put(foot, go);
    put(foot, h('p.pjxc-steps-n', { text: w('np.rv.steps', { n: ph.length }) }));
    put(foot, yoloCreate(s, ph, label));
    const D0 = s.ui.demo = s.ui.demo || {};
    const boxes = [];
    if (ph.some((x) => x.net)) boxes.push(check('rv:demo:net', w('np.rv.demo.net'), !!D0.net, (v) => { D0.net = v; if (v) { D0.taken = false; D0.fork = false; } s.changed(); }));
    if (ph.some((x) => x.key === 'create')) boxes.push(check('rv:demo:taken', w('np.rv.demo.taken', { service: (ph.find((x) => x.key === 'create') || {}).service }), !!D0.taken, (v) => { D0.taken = v; if (v) { D0.net = false; D0.fork = false; } s.changed(); }));
    if (d.backup.dest !== 'none') boxes.push(check('rv:demo:bk', w('np.rv.demo.bk'), !!D0.bk, (v) => { D0.bk = v; s.changed(); }));
    if (fork) boxes.push(check('rv:demo:fork', w('np.rv.demo.fork'), !!D0.fork, (v) => { D0.fork = v; if (v) { D0.net = false; D0.taken = false; D0.forkUnknown = false; } s.changed(); }));
    if (fork) boxes.push(check('rv:demo:forkunknown', w('np.rv.demo.forkUnknown', { service: fork.service }), !!D0.forkUnknown, (v) => { D0.forkUnknown = v; if (v) { D0.net = false; D0.taken = false; D0.fork = false; } s.changed(); }));
    if (boxes.length) put(foot, disc(s, 'rv-demo', w('np.rv.demo'), boxes, { kind: 'review', cls: 'pjxc-demo' }));
    return foot;
  }

  /* YOLO at the Review: what an agent asked to do this does instead of waiting for the button */
  function yoloCreate(s, ph, label) {
    if (!(PJX.yolo && PJX.yolo())) return null;
    const d = s.d, acts = [], stops = [];
    const fork = ph.find((x) => x.key === 'fork'), create = ph.find((x) => x.key === 'create'), link0 = ph.find((x) => x.key === 'link');
    if (fork) acts.push(w('np.yolo.createActs.fork', { service: fork.service }));
    if (create) acts.push(w('np.yolo.createActs.make', { service: create.service }));
    if (link0 && link0.service) acts.push(w('np.yolo.createActs.link', { service: link0.service }));
    if (d.way === 'chat') return yoloLine(w('np.yolo.chatNew'));
    if (d.backup.dest !== 'none') stops.push(w('np.yolo.stops.signin'), w('np.yolo.stops.kit'));
    if (d.way === 'device' && d.device.method === 'ssh') stops.push(w('np.yolo.stops.device'));
    if (!stops.length) stops.push(w('np.yolo.stops.none'));
    const svc = create ? create.service : fork ? fork.service : null;
    return yoloLine(w('np.yolo.create', { go: label, acts: acts.length ? ': ' + NP().andList(acts) : '', stops: NP().andList(stops.filter((x, i) => stops.indexOf(x) === i)), cant: svc ? w('np.yolo.cant', { service: svc, what: create ? 'the online copy' : 'the fork' }) : '' }));
  }

  /* ------------------------------------------------------------------ "Finish protecting your work" (6.12.3) */
  const kitUi = {};
  function protectSteps(p) {
    const b = p.backup, stp = b && b.setup; if (!stp) return null;
    const tgt = stp.target != null ? b.more[stp.target] : b, where = tgt.dest, nas = where === 'Home NAS', access = /S3|B2|SFTP|WebDAV|S3-compatible/.test(where);
    const k = kitUi[p.id] = kitUi[p.id] || { hand: null, test: null };
    const cloud = !nas && !access;
    const ACT = PJX.ACT, steps = stp.steps;
    const cur = steps.findIndex((x) => x !== 'done');
    const LABEL = [nas ? w('np.prot.s1Pair', { where }) : access ? w('np.prot.s1Access', { where }) : w('np.prot.s1', { where }), w('np.prot.s2'), w('np.prot.s3'), w('np.prot.s4'), tgt.mode === 'manual' ? w('np.prot.s5Manual') : w('np.prot.s5')];
    const CMD = ['cmd.auth_profile.sign_in', 'cmd.backup.destination.test', 'cmd.backup.recovery_key.export', 'cmd.backup.recovery_key.test', 'cmd.backup.policy.update'];
    const box = h('div.pjx-np-protect', { role: 'group', 'aria-label': w('np.prot.title') });
    put(box, h('p.pjx-np-say', { text: nas ? w('np.prot.leadNas', { where }) : access ? w('np.prot.leadAccess', { where }) : w('np.prot.lead', { where }) }));
    const ol = h('ol.pjx-np-psteps');
    LABEL.forEach((lab, i) => {
      const state = steps[i], now = i === cur;
      const mk = state === 'done' ? 'complete' : state === 'working' ? 'working' : state === 'failed' ? 'failed' : now ? 'waiting' : 'pending';
      const li = h('li', { class: ['pjx-np-pstep', 'is-' + (state === 'todo' && now ? 'now' : state)] }, h('span.pjx-np-pmark', { html: mk === 'working' ? PJX.mark(mk, 14) : PJX.calm(mk, 14), 'aria-hidden': 'true' }), h('span.pjx-np-plabel', { text: lab }));
      if (now && state !== 'working') {
        const body = h('div.pjx-np-pbody');
        const run = (bad) => ACT.protectStep(p.id, i, { bad });
        // (GUIDED-FLOWS 5.17, 5.18) the destination's own connection at this step: the NAS's existing pairing, the cloud
        // account's sign-in, or the bucket's or server's access details; earlier typed fields are never taken as proof
        if (i === 0) {
          if (nas) put(body, line('complete', w('np.prot.s1PairLead', { where })));
          if (cloud) put(body, line(null, w('np.prot.s1CloudLead', { where, account: tgt.account || (where === 'Google Drive' ? 'jared@gmail.com' : 'jared@outlook.com') }), { icon: 'key' }));
          if (access) put(body, h('div.pjx-np-pair', null, field(w('np.prot.s1KeyId'), input('prot:keyid:' + p.id, k.keyId || '', '', (v) => { k.keyId = v; }), ''), (() => { const el = h('input.pjx-input', { type: 'password', autocomplete: 'off', 'aria-label': w('np.prot.s1Secret') }); return h('div.pjx-field', null, h('label.pjx-field-label', { text: w('np.prot.s1Secret') }), el, h('div.pjx-field-hint', { text: w('np.prot.s1SecretHint') })); })()));
          if (state === 'failed') put(body, line('failed', nas ? w('np.prot.s1PairFail', { where }) : w('np.prot.s1Expired', { where })));
          put(body, h('div.pjx-row', null, btn(state === 'failed' ? w('np.prot.retry') : LABEL[0], () => run(false), { key: 'prot:0', primary: true, icon: nas ? 'server' : 'key', cmd: nas ? 'cmd.server.pair (reuse the existing pairing)' : CMD[0] }),
            cloud ? link(w('np.signin.another'), () => PJX.toast(w('np.signin.another'), 'Opens ' + where + '’s own sign-in page to choose another account.', 'info'), { key: 'prot:another' }) : null));
          put(body, demo([{ label: nas ? 'Home NAS doesn’t answer' : 'The sign-in expires', outcome: 'retry', run: () => run(true) }], { id: 'prot0' }));
          put(body, yoloLine(w('np.yolo.signin'), { asks: true }));
        }
        if (i === 1) {
          put(body, h('p.pjx-np-say', { text: w('np.prot.s2Lead', { place: tgt.place }) }));
          if (state === 'failed') put(body, line('failed', w('np.prot.s2Fail', { where, reason: w('np.prot.s2Full') })));
          put(body, h('div.pjx-row', null, btn(state === 'failed' ? w('np.prot.retry') : w('np.prot.s2'), () => run(), { key: 'prot:1', primary: true, cmd: CMD[1] })));
        }
        if (i === 2) {
          put(body, h('p.pjx-np-say', { text: w('np.prot.s3Why') }));
          // (GUIDED-FLOWS 5.20) a protected handoff on this device, never a local "it's you" switch; its pending, refused and
          // unavailable answers are said as they are
          const hand = (state0) => { k.hand = 'pending'; PJX.rerender(); setTimeout(() => { k.hand = state0 || 'ok'; PJX.rerender(); }, PJX.reduced() ? 150 : 900); };
          if (k.hand === 'pending') put(body, working(w('np.prot.handPending')));
          else if (k.hand === 'refused' || k.hand === 'unavailable') put(body, line(k.hand === 'refused' ? 'failed' : 'offline', w('np.prot.hand.' + k.hand)));
          if (k.hand !== 'ok' && k.hand !== 'pending') put(body, h('div.pjx-row', null, btn(k.hand ? w('np.prot.retry') : w('np.prot.s3StepUp'), () => hand(), { key: 'prot:stepup', primary: true, icon: 'lock', cmd: 'protected handoff (this Client, this audience)' }), h('span.pjx-np-hint', { text: w('np.prot.s3StepUpHint') })),
            demo([{ label: 'Cancel the prompt', outcome: 'refused', run: () => hand('refused') }, { label: 'A browser tab', outcome: 'can’t show it', run: () => hand('unavailable') }], { id: 'hand' }));
          if (k.hand === 'ok') put(body, line('complete', w('np.prot.handOk')));
          if (k.hand === 'ok') put(body, h('div.pjx-row', null, btn(w('np.prot.s3Save'), () => run(), { key: 'prot:2', primary: true, icon: 'download', cmd: CMD[2] }), btn(w('np.prot.s3Copy'), () => run(), { key: 'prot:copy', cmd: 'cmd.backup.recovery_key.copy' }), btn(w('np.prot.s3Print'), () => PJX.toast('Printing the Recovery Kit', 'Only on this device.', 'info'), { key: 'prot:print', cmd: 'cmd.backup.recovery_key.print' })));
        }
        if (i === 3) {
          if (steps[2] === 'done') put(body, line(null, w('np.prot.s3Once'), { icon: 'lock' }));
          if (state === 'failed') put(body, line('failed', w('np.prot.s4Fail')));
          // (5.21) the check also needs this device's protected context, and says pending, refused and unavailable as such
          put(body, line(null, w('np.prot.s4Protected'), { icon: 'lock' }));
          put(body, h('div.pjx-row', null, btn(state === 'failed' ? w('np.prot.retry') : w('np.prot.s4Go'), () => run(false), { key: 'prot:3', primary: true, icon: 'lock', cmd: CMD[3] + ' (protected)' }), btn(w('np.prot.s4Other'), () => run(true), { key: 'prot:3bad', quiet: true, cmd: CMD[3] })));
          put(body, hint('Try a different kit is a concept demo: that kit is refused.', 'is-concept'));
        }
        if (i === 4) put(body, h('div.pjx-row', null, btn(LABEL[4], () => run(), { key: 'prot:4', primary: true, icon: 'check', cmd: CMD[4] })));
        put(li, body);
      } else if (state === 'done') {
        const said = i === 0 ? w('np.prot.s1Done', { where }) : i === 1 ? w('np.prot.s2Ok', { where }) : i === 2 ? w('np.prot.s3Saved') : i === 3 ? w('np.prot.s4Ok') : '';
        if (said) put(li, h('span.pjx-np-psaid', { text: said }));
      } else if (state === 'working') put(li, h('span.pjx-np-psaid', { text: w('np.prot.working') }));
      put(ol, li);
    });
    put(box, ol);
    if (!stp.done) put(box, yoloLine(w('np.yolo.protect')));
    // (5.22) on is a policy, not a backup: scheduled stays apart from a completed, checked backup
    if (stp.done) put(box, lines(line('complete', tgt.mode === 'manual' ? w('np.prot.doneManual') : w('np.prot.done', { time: tgt.time })), line('pending', w('np.prot.notYet'))));
    return box;
  }

  /* ------------------------------------------------------------------ render with focus and caret kept */
  function render(container, fn) {
    const a = D.activeElement, key = a && container.contains(a) && a.getAttribute && a.getAttribute('data-pjx-key');
    const caret = key && a.selectionStart != null ? [a.selectionStart, a.selectionEnd] : null;
    const secretEl = a && a.classList && a.classList.contains('pjx-np-secret') ? a : null;
    fn();
    if (secretEl && secretEl.isConnected) { try { secretEl.focus({ preventScroll: true }); } catch (e) { /* gone */ } return; }
    if (key) {
      const el = container.querySelector('[data-pjx-key="' + cssEsc(key) + '"]');
      if (el) { el.focus({ preventScroll: true }); if (caret) try { el.setSelectionRange(caret[0], caret[1]); } catch (e) { /* not a text field */ } }
    }
  }

  PJX.npui = { line, lines, code, hint, cap, group, btn, link, choices, seg, input, field, secret, sw, check, disc, demo, picker, mini, lookView, gitJjAnswer, signinView, serviceCards, yoloLine, roving, convPreview,
    sections: sectionsView, review: reviewView, reviewFoot, protectSteps, render, RENDER, title, lead, secOnline, secBackup, secWhere };
})(window);
