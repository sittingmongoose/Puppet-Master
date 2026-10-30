/* Projects concepts (Opus 5.5): concept C, "Split".

   A library of Projects on the left and the chosen Project's own page on the right. The library is grouped by the machine
   each Project lives on (This computer, Home NAS, Studio Mac, then Archived), because the person this concept serves
   works across several machines and thinks "the one on the NAS", not "the fourth card". Every machine you have shows,
   with whether it answers and what to do about it, even before anything lives on it. What needs you stays in its
   machine's group, first in it, and a short "4 need you" line above the list shows only those. The page on the right
   says what the Project is doing, how it is kept safe (History, Online copy, Backup) and where it lives, and every
   problem is fixed on that page: the missing folder is found in place, an unfinished setup is finished in place.

   New Project takes over the right page as a launcher: paste a link, a folder or an address (PJX.flow.detect recognises
   it), or choose one of the five ways; then one page of the remaining questions beside a live Review. The questions,
   their words and the creation itself are PJX.flow's; this file draws only the frame, the navigation and the creating,
   success and failure screens. Leaving New Project never throws the answers away: the draft waits at the top of the
   library ("Not made yet") until it is made or started over.

   Built from Usage's own parts (.pmu-shell, .pmu-rail, .pmu-stagehead, .pmu-card plates with .pmu-facts, .pmu-textbtn)
   and Home's .pmw-act buttons, so every look draws it the way it draws Usage and Home. Nothing here is a second runtime:
   every action routes through PJX.ACT, PJX.ACTIONS, PJX.moreItems, PJX.parts and PJX.flow. */
(function (W) {
  'use strict';
  const PJX = W.PJX;
  if (!PJX) return;
  const D = W.document;
  const { h, icon, mark, tip } = PJX;
  const parts = () => PJX.parts, flow = () => PJX.flow;

  /* Below this width of the Projects pane the library becomes a drawer behind a "Projects" button. c.css switches its
     layout at the same width (@container pjx (max-width: 739.98px)), so the two never disagree. */
  const NARROW = 740;
  /* the words a way's final button uses, and the words while it runs */
  const VERB = { new: ['Create', 'Creating'], folder: ['Add', 'Adding'], online: ['Copy', 'Copying'], device: ['Add', 'Adding'], restore: ['Restore', 'Restoring'] };
  /* the filters of the library (all labelled), and the orders */
  const SHOWS = [
    { id: 'all', label: 'All projects', icon: 'list' },
    { id: 'need', label: 'Need you', icon: 'warning' },
    { id: 'working', label: 'Working', icon: 'play' },
    { id: 'unprotected', label: 'Not backed up', icon: 'safe' },
    { id: 'local', label: 'On this computer', icon: 'desktop' },
    { id: 'device', label: 'On other devices', icon: 'server' }
  ];
  const ORDERS = [{ id: 'recent', label: 'Recently opened', icon: 'history' }, { id: 'name', label: 'Name', icon: 'list-view' }];

  let C = null;   // the mounted concept's state; null while another concept is shown
  function fresh(root) {
    return {
      root, els: {}, slots: new Map(), offs: [], timers: [], ro: null,
      sel: null, lastSel: null, mode: 'project', prevSel: null, swap: false,
      q: '', show: 'all', order: 'recent', archivedOpen: false,
      narrow: false, drawer: false,
      s: null, view: 'launcher', commit: null, demoFail: false, pasteText: '',
      repair: {}, repairOpen: {}, resume: {}, flash: {}, lastChoice: null
    };
  }

  /* ------------------------------------------------------------------ small helpers */
  const rankOf = (p) => (PJX.STATUS[PJX.primary(p).key] || { rank: 99 }).rank;
  /* Need you: what cannot go on without the person (blocked, waiting, offline, failed). Advisories (Not backed up, a late
     backup) keep their own mark and words on their row but are not counted, so "4 need you" stays short and means
     something. */
  const needsYou = (p) => p.lifecycle !== 'archived' && rankOf(p) < PJX.STATUS.warning.rank;
  const opOf = (id) => { const op = PJX.S.ops[id]; return op && !op.done ? op : null; };
  const lc = (s) => (/^(Yesterday|Today)/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);
  const cssEsc = (s) => (W.CSS && W.CSS.escape ? W.CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&'));
  const factTone = (key) => ({ blocked: 'crit', attention: 'warn', done: 'good' }[parts().tone(key)] || null);
  const later = (fn, ms) => { const t = setTimeout(() => { if (C) fn(); }, ms); if (C) C.timers.push(t); return t; };
  const route = (title, body) => PJX.toast(title, body, 'info');
  const announce = (text) => { if (C && C.els.live) { C.els.live.textContent = ''; later(() => { C.els.live.textContent = text; }, 30); } };

  /* a persistent element by key. Sheets (Glass's data-lg-surface) are baked once when they first show, so plates, the
     head bar and the band boxes are kept across renders and only their contents change */
  function slot(key, make) { if (!C.slots.has(key)) C.slots.set(key, make()); return C.slots.get(key); }
  /* put exactly these children in this order, moving nothing that is already in place (a moved node loses focus and a
     moved sheet is baked again) */
  function syncChildren(parent, kids) {
    kids = kids.filter(Boolean);
    const keep = new Set(kids);
    Array.from(parent.children).forEach((c) => { if (!keep.has(c)) parent.removeChild(c); });
    for (let i = 0; i < kids.length; i++) { const cur = parent.children[i]; if (cur !== kids[i]) parent.insertBefore(kids[i], cur || null); }
  }
  /* replace an element's children, skipping the empty ones (replaceChildren would write "null") */
  function fill(el, ...kids) { el.replaceChildren(...kids.flat().filter(Boolean)); return el; }
  /* set an attribute only when it changes: Glass watches its sheets, and a rewrite of the same value is still a mutation */
  function setAttr(el, k, v) {
    if (v == null || v === false) { if (el.hasAttribute(k)) el.removeAttribute(k); return; }
    v = v === true ? '' : String(v);
    if (el.getAttribute(k) !== v) el.setAttribute(k, v);
  }

  /* every action is a button with its words on it; the icon is only a lead. o: { icon, cls, primary, strong, danger,
     quiet, chev, key, run(e, b), off (a reason: the button stays focusable, says why, and does nothing), onOff, tip } */
  function act(label, o) {
    o = o || {};
    const b = h('button', { type: 'button', class: [o.cls || 'pmw-act', 'pjxc-btn', o.primary && 'is-primary', o.strong && 'is-strong', o.danger && 'is-danger', o.quiet && 'is-quiet'],
      'data-c-key': o.key || null, 'aria-disabled': o.off ? 'true' : null },
    o.icon ? h('span.pjxc-bico', { html: icon(o.icon, 15), 'aria-hidden': 'true' }) : null,
    h('span.pjxc-blabel', { text: label }),
    o.chev ? h('span.pjxc-bchev', { html: icon('chevron-down', 14), 'aria-hidden': 'true' }) : null);
    if (o.off) tip(b, label, o.off); else if (o.tip) tip(b, label, o.tip);
    b.addEventListener('click', (e) => { if (o.off) { if (o.onOff) o.onOff(e, b); return; } if (o.run) o.run(e, b); });
    return b;
  }
  /* a path in the code face, cut in the middle so its last folder always shows; the hover label is the whole path,
     kept literal (the hover-tag controller would otherwise swap a path for generic copy) */
  function midPath(path) {
    const s = String(path || ''), i = s.lastIndexOf('/');
    const el = h('span.pjxc-mid', { 'data-pmh-tag': 'literal' }, h('span.pjxc-mid-a', { text: i > 0 ? s.slice(0, i + 1) : '' }), h('span.pjxc-mid-b', { text: i > 0 ? s.slice(i + 1) : s }));
    tip(el, s);
    return el;
  }
  function facts(rows) {
    return h('div.pmu-facts.pjxc-facts', null, ...rows.filter(Boolean).map((r, i) => h('div', { class: ['pmu-fact', i === 0 && 'is-top'], 'data-tone': r.tone || null },
      h('span.pmu-factl', { text: r.k }), r.node ? h('b.pmu-factv', null, r.node) : h('b.pmu-factv', { text: r.v }))));
  }
  const textLine = (text, cls) => h('p', { class: ['pjxc-say', cls], text });
  function working(op) {
    return h('div.pjxc-working', { role: 'status' }, h('span.pjx-st-mark', { html: mark('working', 14), 'aria-hidden': 'true' }),
      h('span', null, h('b', { text: op.label }), op.phase ? ' · ' + op.phase : ''));
  }

  /* ------------------------------------------------------------------ focus and scroll across re-renders
     The core re-calls render on every change; text fields keep their caret through data-pjx-key (flow.js), and every
     button of this concept carries data-c-key so the one that had focus gets it back. A choice inside a flow step or the
     repair keeps it by its value. */
  function focusKey() {
    const a = D.activeElement;
    if (!C || !a || a === D.body || !C.root.contains(a)) return null;
    const k = a.closest('[data-c-key]');
    if (k) return { sel: '[data-c-key="' + cssEsc(k.getAttribute('data-c-key')) + '"]' };
    if (a.getAttribute('data-pjx-key')) return null;
    const zone = a.closest('[data-step]');
    const z = zone ? '[data-step="' + cssEsc(zone.getAttribute('data-step')) + '"] ' : a.closest('.pjx-repair') ? '.pjx-repair ' : '';
    if (a.classList.contains('pjx-choice') && a.getAttribute('data-v')) return { sel: z + '.pjx-choice[data-v="' + cssEsc(a.getAttribute('data-v')) + '"]' };
    if (a.classList.contains('pjx-seg-btn')) { const g = a.closest('.pjx-seg'); return { seg: g && g.getAttribute('aria-label'), text: a.textContent, z }; }
    if (a.classList.contains('pjx-link') || a.classList.contains('pjx-btn') || a.classList.contains('pjx-tree-item')) return { z, text: a.textContent, cls: a.classList.contains('pjx-link') ? 'pjx-link' : a.classList.contains('pjx-tree-item') ? 'pjx-tree-item' : 'pjx-btn' };
    if (a.type === 'checkbox') { const l = a.closest('label'); return { z, check: l && l.textContent }; }
    return null;
  }
  function restoreFocus(k) {
    if (!k || !C) return;
    const a = D.activeElement;
    if (a && a !== D.body && C.root.contains(a)) return;
    let el = null;
    if (k.sel) el = C.root.querySelector(k.sel);
    else if (k.seg) el = Array.from(C.root.querySelectorAll(k.z + '.pjx-seg[aria-label="' + cssEsc(k.seg) + '"] .pjx-seg-btn')).find((b) => b.textContent === k.text);
    else if (k.cls) el = Array.from(C.root.querySelectorAll(k.z + '.' + k.cls)).find((b) => b.textContent === k.text);
    else if (k.check) el = Array.from(C.root.querySelectorAll(k.z + 'label')).filter((l) => l.textContent === k.check).map((l) => l.querySelector('input'))[0];
    if (el) try { el.focus({ preventScroll: true }); } catch (e) { /* gone */ }
  }
  function focusTitle() { later(() => { const t = C.root.querySelector('.pjxc-title'); if (t) t.focus({ preventScroll: true }); }, 0); }
  /* bring a part of the page into view (the repair, a plate) and optionally focus its first control */
  function reveal(sel, focus) {
    later(() => {
      const el = C.root.querySelector(sel); if (!el) return;
      const sc = C.els.scroll, r = el.getBoundingClientRect(), sr = sc.getBoundingClientRect();
      if (r.top < sr.top || r.bottom > sr.bottom) sc.scrollTo({ top: Math.max(0, sc.scrollTop + r.top - sr.top - 12), behavior: PJX.reduced() ? 'auto' : 'smooth' });
      if (focus) { const f = el.querySelector(focus); if (f) f.focus({ preventScroll: true }); }
    }, 40);
  }

  /* ------------------------------------------------------------------ the library: grouped by the machine Projects live on */
  function grouped() {
    const q = C.q.trim().toLowerCase();
    const hit = (p) => !q || [p.name, p.where.path, p.where.label, p.where.device, p.online && p.online.repo, p.online && p.online.service, PJX.primary(p).word, (p.stack || []).join(' ')]
      .some((x) => x && String(x).toLowerCase().includes(q));
    const show = {
      all: () => true,
      need: needsYou,
      working: (p) => PJX.primary(p).key === 'working' || (p.activity && p.activity.key === 'working'),
      unprotected: (p) => !p.backup || !p.backup.dest,
      local: (p) => p.where.kind === 'local',
      device: (p) => p.where.kind !== 'local'
    }[C.show] || (() => true);
    const sort = C.order === 'name' ? (a, b) => a.name.localeCompare(b.name) : (a, b) => (a.openedRank - b.openedRank) || a.name.localeCompare(b.name);
    // inside a machine's group, what needs you comes first (the most urgent first), then the chosen order
    const pin = (a, b) => (needsYou(b) - needsYou(a)) || (needsYou(a) ? rankOf(a) - rankOf(b) : 0) || sort(a, b);
    const L = PJX.listed().filter(hit).filter(show);
    const filtering = !!q || C.show !== 'all';
    const byPlace = new Map();
    // while nothing is filtered every machine you have gets its group, even one with nothing on it yet: it says whether
    // it answers and offers to add a Project from it
    if (!filtering) PJX.ENV.devices.forEach((d) => byPlace.set(d.name, []));
    L.forEach((p) => { const k = p.where.label || 'Elsewhere'; if (!byPlace.has(k)) byPlace.set(k, []); byPlace.get(k).push(p); });
    const order = ['This computer'].concat(PJX.ENV.devices.map((d) => d.name));
    const keys = Array.from(byPlace.keys()).sort((a, b) => { const ia = order.indexOf(a), ib = order.indexOf(b); return ((ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)) || a.localeCompare(b); });
    const arch = PJX.archived().filter(hit).filter(show).sort(sort);
    return {
      need: L.filter(needsYou),
      places: keys.map((k) => ({ label: k, items: byPlace.get(k).sort(pin), device: PJX.ENV.devices.find((d) => d.name === k) || null })),
      arch, shown: L.length + arch.length, filtering
    };
  }
  /* the visual order of every Project, for the keyboard and for choosing a neighbour after a removal */
  function visualOrder(g) {
    g = g || grouped();
    return [].concat(...g.places.map((x) => x.items)).concat(g.arch);
  }
  /* a row's second line: what it is doing when that matters, otherwise when it was last opened */
  function rowLine(p) {
    const op = opOf(p.id);
    if (op) return { key: 'working', text: op.label + (op.phase ? ' · ' + op.phase : ''), tone: 'working', word: op.label };
    const pr = PJX.primary(p), t = parts().tone(pr.key);
    if (p.lifecycle === 'archived') return { key: 'skipped', text: p.archivedAt || 'Archived', tone: 'idle', word: 'Archived' };
    if (p.active) return { key: pr.key, text: 'Open now' + (pr.key === 'working' || pr.key === 'paused' ? ' · ' + pr.word : ''), tone: pr.key === 'working' ? 'working' : 'idle', word: pr.word };
    if (rankOf(p) <= PJX.STATUS.warning.rank || pr.key === 'working' || pr.key === 'paused') return { key: pr.key, text: pr.word, tone: t, word: pr.word };
    return { key: pr.key, text: p.opened === 'Just added' ? 'Just added' : 'Opened ' + lc(p.opened), tone: 'idle', word: pr.word };
  }
  /* marks are lit and still in a list (F3-658); only working's bead moves, so a list of problems never pulses at you */
  const listMark = (key, px) => (key === 'working' ? mark(key, px) : PJX.calm(key, px));
  function row(p) {
    const r = rowLine(p), on = C.mode === 'project' && p.id === C.sel;
    const m = h('span.pjxc-row-mark', { html: listMark(r.key, 14), 'data-tone': parts().tone(r.key), 'aria-hidden': 'true' });
    tip(m, r.word);
    const b = h('button.pjxc-row', { type: 'button', 'data-pid': p.id, 'data-c-key': 'row:' + p.id, 'aria-current': on ? 'true' : null, tabindex: '-1', 'data-active': p.active ? '' : null },
      h('span.pjxc-row-ico', { html: icon(p.glyph, 16), 'aria-hidden': 'true' }),
      h('span.pjxc-row-text', null, h('span.pjxc-row-name', { text: p.name }), h('span.pjxc-row-line', { 'data-tone': r.tone, text: r.text })),
      m);
    b.addEventListener('click', (e) => select(p.id, { from: 'list', focus: e.detail === 0 ? 'page' : null }));
    return b;
  }
  function group(id, label, items, o) {
    o = o || {};
    const count = h('span.pjxc-gcount', { text: String(items.length) });
    let headEl;
    if (o.toggle) {
      headEl = h('button.pjxc-ghead.is-toggle', { type: 'button', 'aria-expanded': String(!!o.open), 'data-c-key': 'g:' + id, tabindex: '-1' },
        h('span.pjxc-gchev', { html: icon(o.open ? 'chevron-down' : 'chevron-right', 13), 'aria-hidden': 'true' }), h('span.pjxc-glabel', { text: label }), count);
      headEl.addEventListener('click', o.toggle);
    } else {
      headEl = h('div.pjxc-ghead', { id: 'pjxc-g-' + id }, h('span.pjxc-glabel', { text: label }), o.noCount ? null : count);
    }
    const list = (o.toggle && !o.open) || !items.length ? null : h('ul.pjxc-rows', { role: 'list', 'aria-labelledby': o.toggle ? null : 'pjxc-g-' + id }, ...items.map((p) => h('li', null, o.rowFn ? o.rowFn(p) : row(p))));
    return h('section', { class: ['pjxc-group', 'is-' + id], 'data-device': o.device ? o.device.id : null }, headEl, o.device ? deviceLine(o.device, items) : null, list);
  }
  /* a machine's own line under its name: whether it answers, and the one thing to do about it. The machine, not each
     Project on it, is the problem when it doesn't answer, so Try again lives here as well as on the Project's page */
  function deviceLine(dev, items) {
    const down = items.filter((p) => (p.attention || []).some((a) => a.code === 'device_offline'));
    const trying = items.some((p) => { const op = opOf(p.id); return op && op.kind === 'retry'; });
    // the demo keeps a device's answer in each Project on it; a machine with nothing on it answers for itself
    const off = !trying && (down.length > 0 || (!items.length && !dev.online));
    const key = trying ? 'working' : off ? 'offline' : 'complete';
    const words = trying ? 'Calling ' + dev.name + '…' : off ? 'Not answering' : dev.address + ' · connected';
    let action = null;
    if (off && down.length) action = act('Try again', { cls: 'pjx-link', key: 'dev:retry:' + dev.id, tip: 'Call ' + dev.name + ' again', run: () => down.forEach((p) => PJX.ACT.retry(p.id)) });
    else if (!trying && !off && !items.length) action = act('Add a project from it…', { cls: 'pjx-link', key: 'dev:add:' + dev.id, tip: 'New Project › Files on ' + dev.name, run: () => startNew({ way: 'device', device: dev.id }) });
    if (action) action.tabIndex = -1;
    const m = h('span.pjx-st-mark', { html: listMark(key, 13), 'aria-hidden': 'true' });
    const text = h('span.pjxc-gdev-text', { text: words });
    if (off) tip(text, dev.name + ' isn’t answering', down.length ? 'It didn’t answer at 7:42 PM. Its Projects open again once it does.' : 'Turn it on or check its network.');
    return h('div.pjxc-gdev', { 'data-tone': parts().tone(key) }, m, text, off && action ? h('span.pjxc-gdev-sep', { 'aria-hidden': 'true', text: '·' }) : null, action);
  }
  /* "4 need you": a short line above the list that shows only those, and back */
  function needLine(n) {
    const on = C.show === 'need';
    const b = h('button.pjxc-needbtn', { type: 'button', 'aria-pressed': String(on), 'data-c-key': 'lib:need', 'data-tone': n ? 'attention' : 'idle' },
      h('span.pjx-st-mark', { html: PJX.calm(n ? 'waiting' : 'complete', 14), 'aria-hidden': 'true' }),
      h('b.pjxc-needcount', { text: n ? n + (n === 1 ? ' needs you' : ' need you') : 'Nothing needs you' }),
      h('span.pjxc-needgo', { text: on ? 'Show all' : 'Show only these' }));
    b.addEventListener('click', () => { C.show = on ? 'all' : 'need'; C.els.list.scrollTop = 0; render(); });
    return b;
  }
  /* the New Project you left: it waits here, as it was, until it is made or started over */
  function draftWorth() {
    const s = C && C.s;
    return !!(s && (s.draft.way || s.draft.nameTouched || (C.pasteText || '').trim() || C.commit));
  }
  function draftRow() {
    const s = C.s, d = s.draft, cm = C.commit, way = flow().WAYS.find((w) => w.id === d.way), verb = VERB[d.way] || VERB.new;
    const done = cm ? cm.states.filter((x) => x === 'complete').length : 0;
    const key = cm && cm.running ? 'working' : cm && cm.error ? 'failed' : 'pending';
    const line = cm && cm.running ? verb[1] + ' · step ' + Math.min(cm.list.length, done + 1) + ' of ' + cm.list.length
      : cm && cm.error ? 'Didn’t finish · nothing was made' : way ? way.title : 'Not started yet';
    const m = h('span.pjxc-row-mark', { html: listMark(key, 14), 'data-tone': parts().tone(key), 'aria-hidden': 'true' });
    tip(m, cm && cm.running ? 'Being made now' : 'Not made yet');
    const b = h('button.pjxc-row.is-draft', { type: 'button', 'data-c-key': 'row:draft', tabindex: '-1' },
      h('span.pjxc-row-ico', { html: icon(way ? way.glyph : 'folder-plus', 16), 'aria-hidden': 'true' }),
      h('span.pjxc-row-text', null, h('span.pjxc-row-name', { text: (d.name || '').trim() || 'New project' }), h('span.pjxc-row-line', { 'data-tone': parts().tone(key), text: line })),
      m);
    tip(b, 'Back to your new Project', 'Your answers are as you left them');
    b.addEventListener('click', () => startNew({}));
    return group('draft', 'Not made yet', [s], { rowFn: () => b, noCount: true });
  }
  function renderLib() {
    const E = C.els, g = grouped(), all = PJX.all().length;
    E.count.textContent = all ? String(PJX.listed().length) : '';
    E.filterLabel.textContent = (SHOWS.find((x) => x.id === C.show) || SHOWS[0]).label;
    E.filterBtn.toggleAttribute('data-on', C.show !== 'all' || C.order !== 'recent');
    if (D.activeElement !== E.search) E.search.value = C.q;
    E.searchClear.hidden = !C.q;
    // while New Project is open its button wears the chosen-row material: you are there, and the launcher's own
    // Continue or Create is the one accent fill on screen
    E.newBtn.classList.toggle('is-primary', C.mode !== 'new');
    E.newBtn.setAttribute('aria-pressed', String(C.mode === 'new'));
    E.lib.toggleAttribute('data-empty', !all);
    syncChildren(E.undo, [parts().undoStrip()]);
    const needN = PJX.listed().filter(needsYou).length;
    syncChildren(E.needSlot, [all && (needN || C.show === 'need') ? needLine(needN) : null]);
    const kids = [];
    if (C.s && C.mode !== 'new' && draftWorth()) kids.push(draftRow());
    const devices = g.places.filter((x) => x.device);
    if (!all) {
      kids.push(h('div.pjxc-libempty', null, h('span.pjxc-libempty-ico', { html: icon('folder', 22), 'aria-hidden': 'true' }), h('b', { text: 'No projects yet' }),
        h('span', { text: 'Choose how your first one begins. Nothing is made until you review it.' })));
      // the machines you already trust are a way in on their own
      devices.forEach((x) => kids.push(group('place-' + x.device.id, x.label, x.items, { device: x.device })));
    } else if (!g.shown) {
      const clear = act('Clear search and filters', { cls: 'pmu-textbtn', key: 'lib:clear', run: () => { C.q = ''; C.show = 'all'; render(); E.search.focus(); } });
      kids.push(h('div.pjxc-libempty', null, h('b', { text: C.q ? 'No projects match “' + C.q.trim() + '”' : 'No projects here' }),
        h('span', { text: 'Search looks at names, folders, places, online copies and states.' }), clear));
    } else {
      g.places.forEach((x) => kids.push(group('place-' + (x.device ? x.device.id : x.label.toLowerCase().replace(/\W+/g, '-')), x.label, x.items, { device: x.device })));
      const sel = PJX.get(C.sel);
      if (g.arch.length) kids.push(group('archived', 'Archived', g.arch, { open: C.archivedOpen || (sel && sel.lifecycle === 'archived' && C.mode === 'project'), toggle: () => { C.archivedOpen = !C.archivedOpen; render(); } }));
    }
    const st = E.list.scrollTop;
    fill(E.list, kids);
    E.list.scrollTop = st;
    // one tab stop in the list: the chosen row (or the first item); arrows move between rows and machine actions
    const items = listItems();
    const cur = items.find((x) => x.getAttribute('aria-current') === 'true') || items[0];
    if (cur) cur.tabIndex = 0;
  }
  const listItems = () => Array.from(C.els.list.querySelectorAll('.pjxc-row, .pjxc-ghead.is-toggle, .pjxc-gdev .pjxc-btn, .pjxc-libempty .pjxc-btn'));
  function onListKey(e) {
    const items = listItems();
    const i = items.indexOf(D.activeElement); if (i < 0) return;
    let n = -1;
    if (e.key === 'ArrowDown') n = Math.min(items.length - 1, i + 1); else if (e.key === 'ArrowUp') n = Math.max(0, i - 1);
    else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = items.length - 1;
    else if (e.key === 'ArrowRight' && D.activeElement.classList.contains('is-toggle') && !C.archivedOpen) { e.preventDefault(); D.activeElement.click(); return; }
    else if (e.key === 'ArrowLeft' && D.activeElement.classList.contains('is-toggle') && C.archivedOpen) { e.preventDefault(); D.activeElement.click(); return; }
    if (n < 0 || n === i) return;
    e.preventDefault();
    const t = items[n]; items.forEach((x) => { x.tabIndex = -1; }); t.tabIndex = 0; t.focus();
    // selection follows focus, as in a mail list: the page beside it shows the row under the keyboard
    // (the draft's row only opens New Project when pressed: arrowing past it never leaves the page you are on)
    if (t.classList.contains('pjxc-row') && t.getAttribute('data-pid')) select(t.getAttribute('data-pid'), { from: 'keys' });
  }
  function filterMenu(b) {
    const counts = {};
    // counts are of the listed Projects (Archived keeps its own count in the list)
    SHOWS.forEach((x) => { const keep = C.show; C.show = x.id; const q = C.q; C.q = ''; const g = grouped(); counts[x.id] = g.shown - g.arch.length; C.show = keep; C.q = q; });
    PJX.menu(b, [
      { label: 'Show', items: SHOWS.map((x) => ({ label: x.label, icon: x.icon, meta: (C.show === x.id ? 'Shown · ' : '') + counts[x.id], run: () => { C.show = x.id; render(); } })) },
      { label: 'Order', items: ORDERS.map((x) => ({ label: x.label, icon: x.icon, meta: C.order === x.id ? 'Shown' : '', run: () => { C.order = x.id; render(); } })) }
    ], { label: 'Show and order', align: 'start' });
  }

  /* ------------------------------------------------------------------ selection and navigation */
  function ensureSelection() {
    if (C.mode === 'new') return;
    if (C.sel && PJX.get(C.sel)) return;
    const order = visualOrder();
    const fallback = (C.lastOrder || []).slice((C.lastOrder || []).indexOf(C.sel) + 1).map(PJX.get).find(Boolean);
    const active = PJX.all().find((p) => p.active);
    const next = (C.sel ? fallback : active) || active || order[0] || PJX.all()[0];
    if (next) { C.sel = next.id; C.swap = true; } else { C.sel = null; startNew({}, true); }
  }
  function select(id, o) {
    o = o || {};
    const p = PJX.get(id); if (!p) return;
    const changed = C.sel !== id || C.mode !== 'project';
    // leaving New Project keeps its answers (the library shows the draft); an untouched one is simply let go
    if (C.mode === 'new' && !draftWorth()) { C.s = null; C.commit = null; }
    C.mode = 'project'; C.sel = id;
    if (p.lifecycle === 'archived') C.archivedOpen = true;
    if (changed) { C.swap = true; C.els.scroll.scrollTop = 0; Object.keys(C.flash).forEach((k) => { if (k !== id) delete C.flash[k]; }); }
    if (C.narrow && o.from !== 'keys') C.drawer = false;
    render();
    if (o.focus === 'page') focusTitle();
  }
  function openDrawer() { C.drawer = true; render(); later(() => { const r = C.els.list.querySelector('.pjxc-row[aria-current="true"]') || C.els.newBtn; r.focus({ preventScroll: false }); }, 30); }
  function closeDrawer(refocus) { C.drawer = false; render(); if (refocus) later(() => { const b = C.root.querySelector('[data-c-key="h:projects"]'); if (b) b.focus(); }, 0); }

  /* ------------------------------------------------------------------ the page head */
  function headState(p) {
    const op = opOf(p.id);
    if (op) return { key: 'working', word: op.label + (op.phase ? ' · ' + op.phase : '') };
    const pr = PJX.primary(p);
    return { key: pr.key, word: pr.word };
  }
  function openWhy(p) {
    if (p.where.missing) return 'The folder is missing. Find it first.';
    if ((p.attention || []).some((a) => a.code === 'device_offline')) return (p.where.device || 'The device') + ' isn’t answering. Try again first.';
    if (p.lifecycle === 'recovery') return 'Setup didn’t finish. Continue setup first.';
    return null;
  }
  /* a disabled Open says why and, pressed anyway, takes the person to the thing that fixes it */
  function goToProblem(p) {
    if (p.where.missing) reveal('[data-plate="repair"]', '.pjx-choice');
    else if (p.lifecycle === 'recovery') reveal('[data-plate="resume"]', '[data-c-key="rs:go"]');
    else reveal('.pjxc-bandbox', '.pmu-textbtn');
  }
  function titleBlock(p) {
    const hs = headState(p), w = p.where;
    return h('div.pjxc-titles', null,
      h('h2.pjxc-title', { tabindex: '-1', text: p.name }),
      h('div.pjxc-headline', null,
        parts().st(hs.key, hs.word, { cls: 'pjxc-headst' }),
        h('span.pjxc-place', null, h('span.pjxc-pico', { html: icon(w.kind === 'local' ? 'desktop' : 'server', 14), 'aria-hidden': 'true' }), h('span', { text: w.label + (w.via ? ' · over ' + w.via : '') })),
        midPath(w.path)));
  }
  function headActs(p) {
    const acts = [];
    if (p.lifecycle === 'archived') acts.push(act('Unarchive', { icon: 'reset', strong: true, key: 'h:unarchive', run: () => PJX.ACT.unarchive(p.id) }));
    else acts.push(act(p.active ? 'Open now' : 'Open', { icon: 'open', strong: !p.active, key: 'h:open', off: p.active ? 'It is the open project' : openWhy(p), onOff: () => goToProblem(p), run: () => PJX.ACT.open(p.id) }));
    acts.push(act('Project settings', { icon: 'settings', key: 'h:settings', run: () => PJX.ACT.settings(p.id) }));
    const more = act('More', { icon: 'more', chev: true, key: 'h:more', run: (e, b) => moreMenu(p, b) });
    more.setAttribute('aria-haspopup', 'menu');
    acts.push(more);
    return h('div.pmu-headctl.pjxc-acts', null, ...acts);
  }
  /* More holds what has no plate of its own on this page: Open, Project settings, Rename, New project like this,
     Archive and Remove from list. Keep it safe and Where it lives are on their plates, beside what they are about, so
     the menu stays short and nothing hides below its fold */
  function moreMenu(p, b) {
    const like = { label: 'New project like this…', icon: 'folder-plus', meta: 'Its settings', run: () => PJX.emit('need-new', { like: p.id }) };
    const groups = PJX.moreItems(p, [{ items: [like] }]).filter((g) => !/^(Keep it safe|Where it lives)$/.test(g.label || ''));
    PJX.menu(b, groups, { label: 'More for ' + p.name });
  }
  function projectsBtn() {
    const need = PJX.listed().filter(needsYou).length;
    const b = act('Projects', { icon: 'list-view', key: 'h:projects', run: () => (C.drawer ? closeDrawer(true) : openDrawer()) });
    if (need) b.appendChild(h('span.pjxc-bcount', { text: String(need), 'aria-label': need + ' need you' }));
    b.setAttribute('aria-expanded', String(!!C.drawer));
    b.setAttribute('aria-controls', 'pjxc-lib');
    return b;
  }
  function newBtnSmall() { return act('New Project', { primary: true, icon: 'folder-plus', key: 'h:new', run: () => startNew({}) }); }
  function renderHeadProject(p) {
    const E = C.els;
    if (C.narrow) fill(E.head, projectsBtn(), h('span.pjx-grow'), newBtnSmall());
    else fill(E.head, h('div.pjxc-headmain', null, h('span.pjxc-headico', { html: icon(p.glyph, 22), 'aria-hidden': 'true' }), titleBlock(p)), headActs(p));
    setAttr(E.head, 'aria-label', p.name);
  }

  /* ------------------------------------------------------------------ the band: what needs doing, fixed in place */
  function bandBox(n, node, tone) {
    const s = slot('band:' + n, () => h('div.pjxc-bandbox', { 'data-lg-surface': 'card' }));
    setAttr(s, 'data-tone', tone || null);
    fill(s, node);
    return s;
  }
  /* the ops that answer a notice: while one runs, the notice shows it working in place of its buttons */
  const OP_FOR = { signed_out: ['signin'], device_offline: ['retry'], not_backed_up: ['backup'], backup_overdue: ['backup'] };
  function noticeNode(p, att) {
    const n = parts().notice(p, att, { cls: 'pmu-textbtn' });
    n.querySelectorAll('.pjx-notice-acts button').forEach((b, i) => b.setAttribute('data-c-key', 'n:' + att.code + ':' + i));
    const op = opOf(p.id);
    if (op && (OP_FOR[att.code] || []).indexOf(op.kind) >= 0) fill(n.querySelector('.pjx-notice-acts'), working(op));
    return n;
  }
  function flashNode(p, fl) {
    const acts = [];
    if (p.lifecycle === 'listed') acts.push(act('Open ' + p.name, { cls: 'pmu-textbtn', primary: true, icon: 'open', key: 'f:open', off: p.active ? 'It is the open project' : null, run: () => PJX.ACT.open(p.id) }));
    if (fl.plan) acts.push(act('Plan it in the Planning Wizard', { cls: 'pmu-textbtn', icon: 'plan', key: 'f:plan', run: () => PJX.ACT.replan(p.id) }));
    acts.push(act('Done', { cls: 'pmu-textbtn', key: 'f:done', run: () => { delete C.flash[p.id]; render(); focusTitle(); } }));
    return h('div.pjx-notice.pjxc-flash', { 'data-tone': 'done', role: 'status' },
      h('span.pjx-notice-mark', { html: PJX.calm('complete', 16), 'aria-hidden': 'true' }),
      h('div.pjx-notice-title', { text: fl.title }), h('div.pjx-notice-text', { text: fl.text }), h('div.pjx-notice-acts', null, ...acts));
  }
  /* Find the folder, in place (PJX.parts.repairBody): the same choices as the shared dialog, on the page that shows the
     problem. The body element is kept for the Project, because its folder check finishes later and redraws itself. */
  function repairPlate(p) {
    const move = !p.where.missing;
    let R = C.repair[p.id];
    if (!R || R.move !== move) {
      const ctx = { move, onChange: () => { paintRepairFoot(p); if (C.lastChoice && (!D.activeElement || D.activeElement === D.body)) { const el = R.box.querySelector('.pjx-choice[data-v="' + cssEsc(C.lastChoice) + '"]'); if (el) el.focus({ preventScroll: true }); } } };
      // a missing folder has most often just moved: "Find the folder" starts chosen, so the likely places and Browse
      // show at once and the first press can already be the right folder (the other ways stay one press away)
      if (!move) ctx.state = { way: 'find', path: null, probe: null, checking: false, treeAt: '~/Code', browsing: false, place: PJX.ENV.projectsRoot + '/' + p.name, again: null };
      R = C.repair[p.id] = { move, ctx, box: null, foot: h('div.pmu-cardfoot.pjxc-foot') };
      R.box = parts().repairBody(p, ctx);
      // a choice that redraws the body takes the focus back to itself
      R.box.addEventListener('focusin', (e) => { const c = e.target.closest && e.target.closest('.pjx-choice'); C.lastChoice = c ? c.getAttribute('data-v') : null; });
    }
    paintRepairFoot(p);
    const op = opOf(p.id);
    const busy = op && ['relocate', 'restore', 'move'].indexOf(op.kind) >= 0;
    // the head of the page already says "Folder missing": this plate says where it was and how to get it back, once
    // (the shared repair's own red notice is folded into this lead, c.css)
    return plate('repair', {
      cls: 'pjxc-repairplate', icon: 'folder-search', tone: move ? null : 'blocked',
      title: move ? 'Move or change the folder' : 'Find ' + p.name + '’s folder',
      sub: move ? p.where.path : 'Open is waiting for it. Nothing has been lost.',
      meta: busy ? parts().st('working', op.label) : null,
      body: busy ? [working(op)] : [move ? null : missingLead(p), R.box],
      footEl: busy ? null : R.foot
    });
  }
  function missingLead(p) {
    return h('p.pjxc-say.is-lead.pjxc-missing', null,
      h('span.pjx-st-mark', { html: PJX.calm('blocked', 14), 'aria-hidden': 'true' }),
      h('span', null, 'Nothing is at ', h('span.pjxc-code', { text: p.where.path, 'data-pmh-tag': 'literal' }),
        ' any more. It may have been moved or renamed, or be on a drive that isn’t connected. Its history, online copy and backups are safe.'));
  }
  function paintRepairFoot(p) {
    const R = C.repair[p.id]; if (!R || !R.box || !R.box.pjxPrimary) return;
    const pr = R.box.pjxPrimary();
    const kids = [];
    if (!R.move) kids.push(act('Remove from list…', { cls: 'pmu-textbtn', quiet: true, key: 'r:remove', run: () => PJX.emit('need-remove', { id: p.id }) }));
    kids.push(h('span.pjx-grow'));
    if (R.move) kids.push(act('Cancel', { cls: 'pmu-textbtn', key: 'r:cancel', run: () => { delete C.repairOpen[p.id]; delete C.repair[p.id]; render(); focusTitle(); } }));
    kids.push(act(pr.label, { cls: 'pmu-textbtn', primary: true, key: 'r:go', off: pr.disabled || null,
      run: () => { pr.run(); if (!pr.keep && R.move) delete C.repairOpen[p.id]; } }));
    fill(R.foot, ...kids);
  }
  /* Setup didn't finish, in place: what was done, what is left, and Continue setup, which does only what is left */
  function resumePlate(p) {
    const rec = p.recovery, att = (p.attention || []).find((a) => a.code === 'setup_unfinished') || {};
    const R = C.resume[p.id] || (C.resume[p.id] = { states: rec.remaining.map(() => 'pending') });
    const op = opOf(p.id), running = op && op.kind === 'resume';
    if (running) R.states = rec.remaining.map((_, i) => (i < op.i ? 'complete' : i === op.i ? 'working' : 'pending'));
    const svc = p.online.service || 'the service';
    const foot = running ? null : h('div.pmu-cardfoot.pjxc-foot', null,
      act('Remove from list…', { cls: 'pmu-textbtn', quiet: true, key: 'rs:remove', run: () => PJX.emit('need-remove', { id: p.id }) }),
      h('span.pjx-grow'),
      p.online.service ? act('Open on ' + svc, { cls: 'pmu-textbtn', icon: 'globe', key: 'rs:online', run: () => PJX.ACT.openOnline(p.id) }) : null,
      act('Continue setup', { cls: 'pmu-textbtn', primary: true, icon: 'play', key: 'rs:go', run: () => { R.states = rec.remaining.map(() => 'pending'); PJX.ACT.resume(p.id); } }));
    return plate('resume', {
      // (the head already says "Setup didn't finish": the corner speaks only while it is being finished)
      cls: 'pjxc-resumeplate', icon: 'play', tone: running ? null : 'attention',
      title: 'Finish setting up ' + p.name, sub: 'Setup stopped part-way. Nothing is made twice.',
      meta: running ? parts().st('working', 'Finishing setup') : null,
      body: [
        att.text ? textLine(att.text, 'is-lead') : null,
        h('div.pjxc-resume', null,
          // a reference is shown when it is a name (jared/recipe-app); a step's own label is not repeated after it
          flow().group('Already done', flow().facts(rec.settled.map((x) => ({ key: 'complete', text: x.label + (x.ref && !/\s/.test(x.ref) ? ' · ' + x.ref : '') })))),
          flow().group(running ? 'Doing now' : 'Still to do', flow().phaseList(rec.remaining, R.states))),
        textLine('Continue setup does only what is left. Nothing on ' + svc + ' is made a second time.', 'is-hint')
      ],
      footEl: foot
    });
  }

  /* ------------------------------------------------------------------ the plates (Usage's plate head, facts and foot) */
  function plate(key, o) {
    const el = slot('plate:' + key, () => h(o.tag || 'article', { class: ['pmu-card', 'pjxc-plate', o.cls], 'data-head': 'plate', 'data-plate': key, 'data-lg-surface': 'card', 'aria-labelledby': 'pjxc-pt-' + key }));
    const foot = o.footEl || (o.foot && o.foot.filter(Boolean).length ? h('div.pmu-cardfoot.pjxc-foot', null, ...o.foot.filter(Boolean)) : null);
    setAttr(el, 'data-tone', o.tone || null);
    fill(el,
      h('header.pmu-cardhead', null,
        // the lead is the plate's glyph, or a status mark when the plate itself is the state (creating, stopped)
        o.mark ? h('span.pjxc-plico.is-mark', { html: listMark(o.mark, 16), 'data-tone': parts().tone(o.mark), 'aria-hidden': 'true' })
          : o.icon ? h('span.pjxc-plico', { html: icon(o.icon, 16), 'aria-hidden': 'true' }) : null,
        h('div.pmu-cardtitles', null, h('h3.pmu-cardtitle', { id: 'pjxc-pt-' + key, text: o.title }), o.sub ? h('span.pmu-cardsub', { text: o.sub }) : null),
        o.meta ? h('span.pmu-cardmeta', null, o.meta) : null),
      h('div.pmu-cardbody', null, ...(o.body || []).filter(Boolean), foot));
    return el;
  }
  /* Kept safe at a glance: History · Online copy · Backup, each its mark, its name and a short word, and each a button to
     its own plate below (the same cells as the core's Safe line, PJX.parts.safeLine, made pressable) */
  function safeStrip(p) {
    const s = PJX.safety(p), hist = p.history || {}, o = p.online || {}, b = p.backup || {}, op = opOf(p.id);
    const syncing = op && (op.kind === 'sync' || op.kind === 'signin'), backing = op && op.kind === 'backup';
    const words = {
      // Jujutsu says bookmark (SCS-005, JJI-006)
      history: s.history.key === 'off' ? 'Not kept' : (hist.backend === 'jujutsu' ? 'Jujutsu · bookmark ' : 'Git · ') + hist.branch,
      online: !o.service ? 'None' : syncing ? op.label + '…' : o.service + (o.state === 'waiting' ? ' · sign in again' : o.behind ? ' · ' + o.behind + ' newer' : o.ahead ? ' · ' + o.ahead + ' to send' : ' · up to date'),
      backup: !b.dest ? (backing ? 'Setting up…' : 'Not set up') : backing ? 'Backing up…' : b.dest + (b.last ? ' · ' + b.last : ' · none yet')
    };
    const keys = { history: s.history.key, online: syncing ? 'working' : s.online.key, backup: backing ? 'working' : !b.dest ? (p.lifecycle === 'archived' ? 'off' : 'warning') : s.backup.key };
    const cell = (part, x) => {
      const c = h('button.pjx-safe-cell.pjxc-safecell', { type: 'button', 'data-tone': parts().tone(keys[part]), 'data-part': part, 'data-c-key': 'safe:' + part },
        h('span.pjx-st-mark', { html: listMark(keys[part], 14), 'aria-hidden': 'true' }),
        h('span.pjx-safe-label', { text: x.label }),
        h('span.pjx-safe-word', { text: words[part] }));
      tip(c, x.label + ': ' + x.text, 'Show ' + x.label);
      c.addEventListener('click', () => reveal('[data-plate="' + part + '"]', '.pmu-textbtn:not([aria-disabled="true"])'));
      return c;
    };
    return h('div.pjx-safe.pjxc-safe', { role: 'group', 'aria-label': 'Kept safe' }, cell('history', s.history), cell('online', s.online), cell('backup', s.backup));
  }
  /* a plate's corner word only when there is something to say: a calm plate (every version kept, up to date, checked,
     found) says nothing there, so the page's colour goes only where something needs a look */
  const cornerSays = (key) => !/^(complete|idle)$/.test(key);
  function nowPlate(p) {
    const a = p.activity || {}, op = opOf(p.id);
    const k = op ? 'working' : a.key || 'idle';
    const busy = (a.runs || 0) > 0 || a.key === 'working' || a.key === 'paused';
    return plate('now', {
      cls: 'pjxc-nowplate', icon: 'pulse', title: 'Now', sub: a.at ? (a.at === 'just now' ? 'Updated just now' : 'Last activity ' + lc(a.at)) : '',
      body: [
        h('div.pjxc-now', { 'data-tone': parts().tone(k) },
          h('span.pjxc-now-mark', { html: k === 'working' || k === 'waiting' ? mark(k, 18) : PJX.calm(k, 18), 'aria-hidden': 'true' }),
          h('div.pjxc-now-text', null, h('b', { text: op ? op.label : a.word || 'Idle' }), h('span', { text: op ? op.phase : a.text || '' }))),
        safeStrip(p),
        facts([
          a.runs ? { k: 'Runs going', v: String(a.runs) } : null,
          { k: 'Last opened', v: p.opened },
          p.stack && p.stack.length ? { k: 'Built with', v: p.stack.join(' · ') } : null
        ])
      ],
      foot: [
        act(busy ? 'Open in Orchestrator' : 'Orchestrator', { cls: 'pmu-textbtn', icon: 'workflow', key: 'p:orch', run: () => PJX.ACT.orchestrator(p.id) }),
        p.lifecycle === 'listed' ? act('Plan in the Planning Wizard', { cls: 'pmu-textbtn', icon: 'plan', key: 'p:plan', run: () => PJX.ACT.replan(p.id) }) : null
      ]
    });
  }
  function historyPlate(p) {
    const s = PJX.safety(p).history, hist = p.history || {}, jj = hist.backend === 'jujutsu';
    const none = s.key === 'off';
    const changed = hist.changed == null ? (p.where.missing ? 'Unknown until it is found' : 'Unknown yet') : hist.changed ? hist.changed + ' unsaved' : 'None';
    return plate('history', {
      icon: 'branch', title: 'History', sub: none ? 'Not kept' : (jj ? 'Jujutsu · bookmark ' : 'Git · ') + hist.branch,
      meta: none ? parts().st('off', 'Off') : null,
      body: none ? [textLine('No history is kept for this Project. FileSafe still keeps a copy of each file before big changes.')] : [facts([
        { k: 'Kept with', v: jj ? 'Jujutsu' : 'Git' },
        { k: jj ? 'Bookmark' : 'Branch', v: hist.branch },
        { k: jj ? 'Workspaces' : 'Worktrees', v: String(hist.worktrees || 0) },
        { k: 'Changes not saved', v: changed, tone: hist.changed ? 'warn' : null }
      ])],
      foot: [none
        ? act('Turn on history…', { cls: 'pmu-textbtn', icon: 'branch', key: 'p:histon', run: () => route('History', 'Opens Source Control to start keeping versions of ' + p.name + '.') })
        : act('Open history', { cls: 'pmu-textbtn', icon: 'history', key: 'p:hist', off: p.where.missing ? 'Find the folder first' : null, onOff: () => goToProblem(p), run: () => route('History of ' + p.name, 'Opens Source Control’s history, ' + (jj ? 'with its bookmarks and workspaces.' : 'with its branches and worktrees.')) })]
    });
  }
  function onlinePlate(p) {
    const o = p.online || {}, op = opOf(p.id), syncing = op && (op.kind === 'sync' || op.kind === 'signin');
    if (!o.service) {
      return plate('online', {
        icon: 'cloud', title: 'Online copy', sub: 'None',
        meta: parts().st('off', 'None'),
        body: [textLine('No online copy. Its history stays on ' + (p.where.kind === 'local' ? 'this computer' : p.where.label) + ' only.')],
        foot: [act('Add an online copy…', { cls: 'pmu-textbtn', icon: 'cloud', key: 'p:addonline', run: () => route('Online copy', 'Opens Source Control’s publish flow for ' + p.name + '.') })]
      });
    }
    const waiting = o.state === 'waiting';
    const changes = o.behind ? o.behind + ' newer online' : o.ahead ? o.ahead + ' not sent yet' : 'Up to date';
    return plate('online', {
      icon: 'cloud', title: 'Online copy', sub: o.service + ' · ' + o.repo,
      meta: syncing ? parts().st('working', op.label) : cornerSays(o.state || 'complete') ? parts().st(o.state, waiting ? 'Sign in needed' : o.behind ? o.behind + ' newer' : o.ahead ? o.ahead + ' to send' : 'Up to date') : null,
      body: [syncing ? working(op) : null, facts([
        { k: 'Service', v: o.service },
        { k: 'Name', node: h('span.pjxc-code', { text: o.repo, 'data-pmh-tag': 'literal' }) },
        o.privacy ? { k: 'Who can see it', v: o.privacy } : null,
        waiting ? { k: 'Sign-in', v: 'Expired · SSH still works', tone: 'warn' } : null,
        { k: 'Changes', v: changes }
      ])],
      foot: [
        waiting ? act('Sign in', { cls: 'pmu-textbtn', primary: true, icon: 'key', key: 'p:signin', off: syncing ? 'Signing in now' : null, run: () => PJX.ACT.signIn(p.id) }) : null,
        o.behind ? act('Get the latest', { cls: 'pmu-textbtn', primary: true, icon: 'download', key: 'p:pull', off: syncing ? 'Working on it' : null, run: () => PJX.ACT.getLatest(p.id) }) : null,
        o.ahead && !waiting ? act('Send changes', { cls: 'pmu-textbtn', primary: true, icon: 'upload', key: 'p:push', off: syncing ? 'Working on it' : null, run: () => PJX.ACT.send(p.id) }) : null,
        act('Open on ' + o.service, { cls: 'pmu-textbtn', icon: 'globe', key: 'p:openonline', run: () => PJX.ACT.openOnline(p.id) })
      ]
    });
  }
  function backupPlate(p) {
    const b = p.backup || {}, op = opOf(p.id), running = op && op.kind === 'backup';
    if (!b.dest) {
      return plate('backup', {
        icon: 'safe', title: 'Backup', sub: running ? 'Setting up' : 'Not set up',
        meta: running ? parts().st('working', op.label) : parts().st(p.lifecycle === 'archived' ? 'off' : 'warning', 'None'),
        body: running ? [working(op)] : [textLine('Not backed up. Its history and online copy keep its files, but nothing keeps its plans, chats and settings.')],
        foot: running ? [] : [act('Set up backup', { cls: 'pmu-textbtn', primary: true, icon: 'safe', key: 'p:setupbk', run: () => PJX.ACT.setupBackup(p.id) }),
          act('Restore as new…', { cls: 'pmu-textbtn', icon: 'history', key: 'p:restorenew', off: 'There is no backup of it yet' })]
      });
    }
    const stateWord = running ? op.label : b.state === 'warning' ? 'Late' : b.state === 'pending' ? 'After setup' : b.state === 'paused' ? 'Paused' : b.last ? 'Checked' : 'Not yet';
    return plate('backup', {
      icon: 'safe', title: 'Backup', sub: b.dest + (b.schedule ? ' · ' + b.schedule.toLowerCase() : ''),
      meta: running || cornerSays(b.state || 'complete') ? parts().st(running ? 'working' : b.state || 'complete', stateWord) : null,
      body: [running ? working(op) : null, facts([
        { k: 'Last complete backup', v: b.last ? b.last + (b.state === 'complete' ? ' · checked' : '') : 'None yet', tone: b.state === 'warning' ? 'warn' : null },
        b.note ? { k: b.state === 'warning' ? 'Problem' : 'Note', v: b.note, tone: b.state === 'warning' ? 'warn' : null } : null,
        { k: 'Where', v: b.dest },
        { k: 'Versions kept', v: String(b.versions || 0) },
        b.size ? { k: 'Size', v: b.size } : null
      ])],
      foot: [
        act('Back up now', { cls: 'pmu-textbtn', primary: b.state === 'warning', icon: 'upload', key: 'p:bknow', off: running ? 'Backing up now' : b.state === 'pending' ? 'Backups start after setup' : p.lifecycle === 'archived' ? 'Paused while archived' : p.where.missing ? 'Find the folder first' : null, onOff: () => goToProblem(p), run: () => PJX.ACT.backupNow(p.id) }),
        act('Backup history', { cls: 'pmu-textbtn', icon: 'history', key: 'p:bkhist', run: () => PJX.ACT.backupHistory(p.id) }),
        act('Restore as new…', { cls: 'pmu-textbtn', icon: 'folder-plus', key: 'p:restorenew', off: b.last ? null : 'There is no complete backup yet', run: () => startNew({ way: 'restore', from: p.id }) })
      ]
    });
  }
  function wherePlate(p) {
    const w = p.where, op = opOf(p.id), offline = (p.attention || []).some((a) => a.code === 'device_offline');
    const moving = op && ['relocate', 'move', 'restore', 'retry'].indexOf(op.kind) >= 0;
    const st = moving ? ['working', op.label] : w.missing ? ['blocked', 'Missing'] : offline ? ['offline', 'Not answering'] : w.pending ? ['pending', 'Not made yet'] : ['complete', 'Found'];
    const devs = p.sync && p.sync.devices;
    return plate('where', {
      icon: w.kind === 'local' ? 'desktop' : 'server', title: 'Where it lives', sub: w.label + (w.via ? ' · over ' + w.via : ''),
      meta: cornerSays(st[0]) ? parts().st(st[0], st[1]) : null,
      body: [moving ? working(op) : null, facts([
        { k: 'Device', v: w.device || 'This computer' },
        { k: 'Folder', node: midPath(w.path), tone: w.missing ? 'crit' : null },
        { k: 'Reached', v: w.kind === 'local' ? 'Directly' : 'Over a secure connection (' + (w.via || 'SSH') + ')' },
        { k: 'Your devices', v: devs ? 'Seen on ' + devs + ' device' + (devs > 1 ? 's' : '') : 'Not shared yet' }
      ])],
      foot: [
        w.missing
          ? act('Find the folder…', { cls: 'pmu-textbtn', primary: true, icon: 'folder-search', key: 'p:find', run: () => PJX.emit('need-repair', { id: p.id }) })
          : act('Move or change folder…', { cls: 'pmu-textbtn', icon: 'move', key: 'p:move', off: w.pending ? 'Setup hasn’t made the folder yet' : moving ? 'Working on it' : null, run: () => PJX.emit('need-repair', { id: p.id, move: true }) }),
        act('Show in file manager', { cls: 'pmu-textbtn', icon: 'folder', key: 'p:reveal', off: w.missing ? 'The folder is missing' : offline ? (w.device || 'The device') + ' isn’t answering' : w.pending ? 'Setup hasn’t made the folder yet' : null, run: () => PJX.ACT.reveal(p.id) }),
        act('Copy path', { cls: 'pmu-textbtn', icon: 'copy', key: 'p:copy', run: () => PJX.ACT.copyPath(p.id) })
      ]
    });
  }
  /* (Project settings is in the head; Rename and New project like this are in More: a plate of three links said less
     than the page around it, and its weight was the same as the plates that keep the Project safe) */
  /* Delete data is its own plate at the very bottom, never next to Remove from list and never worded like it */
  function deletePlate(p) {
    const it = PJX.deleteItem(p);
    return plate('delete', {
      cls: 'pjxc-danger', icon: 'trash', title: 'Delete Puppet Master’s data', sub: 'Not the same as Remove from list',
      body: [textLine(it.say)],
      foot: [h('span.pjx-grow'), act(it.label, { cls: 'pmu-textbtn', danger: true, icon: 'trash', key: 'p:delete', off: it.disabled || null, run: it.run })]
    });
  }

  /* ------------------------------------------------------------------ the project page */
  function renderProject() {
    const E = C.els, p = PJX.get(C.sel);
    if (!p) return;
    renderHeadProject(p);
    const kids = [];
    // narrow: the head bar holds only Projects and New Project, so the name, state and actions open the page
    if (C.narrow) {
      const hero = slot('hero', () => h('section.pmu-card.pjxc-hero', { 'data-lg-surface': 'card' }));
      fill(hero, h('div.pjxc-headmain', null, h('span.pjxc-headico', { html: icon(p.glyph, 22), 'aria-hidden': 'true' }), titleBlock(p)), headActs(p));
      kids.push(hero);
    }
    const band = slot('band', () => h('div.pjxc-band'));
    const items = [];
    let n = 0;
    if (C.flash[p.id]) items.push(bandBox(n++, flashNode(p, C.flash[p.id]), 'done'));
    if (p.where.missing || C.repairOpen[p.id]) items.push(repairPlate(p));
    if (p.recovery) items.push(resumePlate(p));
    (p.attention || []).filter((a) => a.code !== 'folder_missing' && a.code !== 'setup_unfinished')
      .slice().sort((a, b) => PJX.STATUS[a.key].rank - PJX.STATUS[b.key].rank)
      .forEach((a) => items.push(bandBox(n++, noticeNode(p, a), parts().tone(a.key))));
    syncChildren(band, items);
    if (items.length) kids.push(band);
    const bento = slot('bento', () => h('div.pjxc-bento'));
    syncChildren(bento, [nowPlate(p), historyPlate(p), onlinePlate(p), backupPlate(p), wherePlate(p), deletePlate(p)]);
    kids.push(bento);
    syncChildren(E.body, kids);
    E.body.setAttribute('data-view', 'project');
  }

  /* ------------------------------------------------------------------ New Project: the launcher */
  /* New Project with nothing asked of it goes back to the draft you left, exactly as it was. A request for a particular
     beginning (a way, "like this", a pasted link, Restore as new) starts a fresh one, and asks first when that would clear
     answers you gave. */
  function startNew(opts, quiet) {
    opts = opts || {};
    const explicit = !!(opts.way || opts.like || opts.text || opts.from || opts.device);
    if (C.s && !opts.fresh) {
      if (!explicit || (C.commit && C.commit.running)) {
        resumeDraft(quiet);
        if (explicit) PJX.toast('One new Project at a time', (C.s.draft.name || 'Your new Project') + ' is being set up now. Start the next one when it is ready.', 'info');
        return;
      }
      if (draftWorth()) { confirmFresh(opts); return; }
    }
    if (C.mode !== 'new') C.prevSel = C.sel;
    C.mode = 'new'; C.commit = null; C.drawer = false; C.swap = true;
    const like = opts.like && PJX.get(opts.like) ? opts.like : null;
    let s;
    if (opts.text) s = flow().start({ text: opts.text, like });
    else if (opts.way) s = flow().start({ way: opts.way, like });
    else s = flow().start({ like });
    // Restore as new… from a Project's own Backup plate: its backup is already chosen and unlocked
    if (opts.from && opts.way === 'restore') {
      const p = PJX.get(opts.from), src = p && PJX.ENV.backups.find((b) => b.where === p.backup.dest);
      if (src) { s.draft.backupFrom = src.id; s.draft.unlocked = src.id === 'nas' || src.id === 'gdrive'; if (src.projects.indexOf(p.id) >= 0) { s.draft.restorePick = p.id; s.draft.name = p.id + '-restored'; } }
    }
    // "Add a project from it…" on a machine in the library: that machine is already chosen
    if (opts.device && s.draft.way === 'device' && PJX.ENV.devices.some((d) => d.id === opts.device)) s.draft.device = opts.device;
    C.s = s;
    C.view = s.draft.way ? 'steps' : 'launcher';
    C.pasteText = opts.text || '';
    if (C.els.paste) C.els.paste.value = C.pasteText;
    s.on(() => { if (C && C.s === s) render(); });
    if (C.els.scroll) C.els.scroll.scrollTop = 0;
    if (quiet) return;
    render();
    focusNew();
  }
  function resumeDraft(quiet) {
    if (C.mode !== 'new') C.prevSel = C.sel;
    C.mode = 'new'; C.drawer = false; C.swap = true;
    if (C.els.scroll) C.els.scroll.scrollTop = 0;
    if (quiet) return;
    render();
    focusNew();
  }
  /* where the keyboard lands in New Project: the paste field on the launcher, else the first question still open */
  function focusNew() {
    later(() => {
      if (!C || C.mode !== 'new') return;
      if (C.view === 'launcher') { C.els.paste.focus({ preventScroll: true }); return; }
      const pr = C.s && firstProblem(C.s);
      const zone = (pr && C.els.steps.querySelector('[data-step="' + cssEsc(pr.step) + '"]')) || C.els.steps;
      const f = zone.querySelector('input:not([type="checkbox"]), .pjx-choice.is-on, .pjx-choice:not(.is-off)');
      if (f) f.focus({ preventScroll: true });
      if (pr && zone !== C.els.steps) reveal('.pjxc-stepsin [data-step="' + cssEsc(pr.step) + '"]');
    }, 40);
  }
  /* a different beginning would clear the answers in the draft: say what goes, and let the person keep it */
  function confirmFresh(opts) {
    const d = C.s.draft, way = flow().WAYS.find((w) => w.id === d.way);
    const what = [(d.name || '').trim(), way ? way.title : null].filter(Boolean).join(' · ') || 'the link you pasted';
    const dlg = PJX.dialog({
      title: 'Start a different new Project?', kicker: 'New Project',
      body: h('div', null,
        h('p.pjx-q-lead', { text: 'Your unfinished new Project (' + what + ') is cleared. Nothing was made from it, so nothing else changes.' })),
      actions: [{ spacer: true },
        { label: 'Keep my draft', run: () => { dlg.close('keep'); resumeDraft(); } },
        { label: 'Start the new one', primary: true, run: () => { dlg.close('ok'); startNew(Object.assign({}, opts, { fresh: true })); } }]
    });
  }
  /* Start over: the draft goes, the launcher comes back empty */
  function startOver() {
    if (C.commit && C.commit.running) return;
    C.s = null; C.commit = null; C.pasteText = '';
    if (C.els.paste) C.els.paste.value = '';
    startNew({ fresh: true });
  }
  /* Close (and Esc) go back to the Project you came from; the answers stay in the draft */
  function closeNew() {
    if (!PJX.all().length) return;
    if (!draftWorth()) { C.s = null; C.commit = null; }
    C.mode = 'project'; C.swap = true;
    if (!PJX.get(C.prevSel)) C.prevSel = null;
    C.sel = C.prevSel || C.sel;
    render();
    later(() => C.els.newBtn.offsetParent ? C.els.newBtn.focus() : focusTitle(), 0);
  }
  function chooseWay(id) {
    const s = C.s; if (!s) return;
    flow().chooseWay(s, id, true);
    C.view = 'steps'; C.swap = true; C.els.scroll.scrollTop = 0;
    render();
    later(() => { const f = C.els.steps.querySelector('input:not([type="checkbox"]), .pjx-choice:not(.is-off)'); if (f) f.focus({ preventScroll: true }); }, 40);
  }
  function fromText() {
    const t = C.pasteText.trim(), d = flow().detect(t); if (!d) return;
    const like = C.s && C.s.draft.like;
    startNew({ text: t, like });
  }
  function renderHeadNew() {
    const E = C.els, s = C.s, empty = !PJX.all().length, way = s && flow().WAYS.find((w) => w.id === s.draft.way);
    const steps = C.view === 'steps' && way;
    const running = C.commit && C.commit.running;
    const back = steps && !running ? act('Back', { icon: 'chevron-left', key: 'h:back', tip: 'All the ways to begin', run: () => { C.view = 'launcher'; C.swap = true; render(); later(() => { const b = C.root.querySelector('[data-c-key="way:' + s.draft.way + '"]'); if (b) b.focus(); }, 30); } }) : null;
    // Close keeps the answers: the draft waits at the top of the library (Start over, in the questions, clears them)
    const cancel = empty ? null : act('Close', { icon: 'close', key: 'h:cancel', tip: running ? 'Back to your Projects · setup keeps going and the list shows it · Esc' : 'Back to your Projects · your answers are kept · Esc', run: () => closeNew() });
    // on a very narrow pane Close keeps only its close mark (a universal), named for the screen reader and its hover label
    if (cancel) { cancel.setAttribute('aria-label', 'Close'); cancel.classList.add('pjxc-can-shrink'); }
    if (C.narrow) { fill(E.head, projectsBtn(), h('span.pjx-grow'), back, cancel); return; }
    const title = empty ? 'Your first Project' : 'New Project';
    const sub = steps ? way.title + ' · ' + way.sub : empty ? flow().STEPS.way.lead(s) : 'Five ways in. Nothing is made until you review it.';
    fill(E.head, 
      h('div.pjxc-headmain', null, h('span.pjxc-headico', { html: icon(steps ? way.glyph : 'folder-plus', 22), 'aria-hidden': 'true' }),
        h('div.pjxc-titles', null, h('h2.pjxc-title', { tabindex: '-1', text: title }), h('div.pjxc-headline', null, h('span.pjxc-headsub', { text: sub })))),
      h('div.pmu-headctl.pjxc-acts', null, back, cancel));
    setAttr(E.head, 'aria-label', title);
  }
  function pasteCard() {
    const E = C.els, s = C.s;
    const card = slot('new:paste', () => h('section.pmu-card.pjxc-paste', { 'data-lg-surface': 'card', 'aria-label': 'Paste to begin' }));
    if (!E.paste) {
      E.paste = h('input.pjxc-paste-in', { type: 'text', autocomplete: 'off', spellcheck: 'false', 'data-c-key': 'paste', placeholder: 'Paste a link, a folder or an address — or choose how to begin', 'aria-label': 'Paste a link, a folder or an address', 'aria-describedby': 'pjxc-detect' });
      E.paste.addEventListener('input', () => { C.pasteText = E.paste.value; paintDetect(); });
      E.paste.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); fromText(); }
        else if (e.key === 'Escape' && E.paste.value) { e.preventDefault(); E.paste.value = ''; C.pasteText = ''; paintDetect(); }
      });
      E.pasteField = h('div.pjxc-pastefield', null, h('span.pjxc-pasteico', { html: icon('link', 18), 'aria-hidden': 'true' }), E.paste);
      E.detect = h('div.pjxc-detect', { id: 'pjxc-detect', role: 'status' });
    }
    if (D.activeElement !== E.paste) E.paste.value = C.pasteText;
    // a narrow pane cannot show the whole invitation in the field: it goes above it, and the field keeps a short hint
    // (Retro's and NieR's mono faces are wider: there the field says the first half and the head says the rest)
    setAttr(E.paste, 'placeholder', C.narrow ? 'A link, a folder or an address' : PJX.stepped() ? 'Paste a link, a folder or an address' : 'Paste a link, a folder or an address — or choose how to begin');
    const empty = !PJX.all().length;
    const like = s && s.draft.like && PJX.get(s.draft.like);
    syncChildren(card, [
      C.narrow ? h('h2.pjxc-title.pjxc-title-in', { tabindex: '-1', text: empty ? 'Your first Project' : 'New Project' }) : null,
      C.narrow && !empty ? h('p.pjxc-welcome', { text: 'Paste a link, a folder or an address — or choose how to begin.' }) : null,
      empty ? h('p.pjxc-welcome', { text: 'Welcome. Bring in work you already have, from this computer, another one or online, or start something new. You see everything before anything is made.' }) : null,
      E.pasteField, E.detect,
      like ? h('p.pjxc-likenote', null, h('span', { html: icon('swap', 13), 'aria-hidden': 'true' }), h('span', { text: 'Starts with ' + like.name + '’s settings. You can change that on the next page.' })) : null
    ]);
    paintDetect();
    return card;
  }
  /* live recognition under the paste field (PJX.flow.detect) */
  function paintDetect() {
    const E = C.els, t = C.pasteText.trim(), d = t ? flow().detect(t) : null;
    if (d) {
      const way = flow().WAYS.find((w) => w.id === d.way);
      const go = act('Continue', { primary: true, icon: 'arrow-right', key: 'paste:go', run: () => fromText() });
      fill(E.detect, h('span.pjx-st-mark', { html: PJX.calm('complete', 14), 'aria-hidden': 'true' }),
        h('span.pjxc-detect-text', null, h('b', { text: d.say }), way ? h('span', { text: way.title }) : null), go);
      E.detect.setAttribute('data-state', 'found');
    } else if (t) {
      fill(E.detect, h('span.pjx-st-mark', { html: PJX.calm('info', 14), 'aria-hidden': 'true' }),
        h('span.pjxc-detect-text', null, h('b', { text: 'Not recognised yet' }), h('span', { text: 'Paste a link from GitHub, GitLab or Bitbucket, a Git address, a folder such as ~/Code/app, or an address such as you@nas.local:/path.' })));
      E.detect.setAttribute('data-state', 'unknown');
    } else {
      const tries = ['https://github.com/jared/garden-planner', '~/Code/budget-tracker', 'jared@studio.local:~/Developer/lighting-rig'];
      fill(E.detect, h('span.pjxc-detect-try', { text: 'Try' }), ...tries.map((x, i) => {
        const b = h('button.pjx-link.pjxc-try', { type: 'button', text: x, 'data-c-key': 'try:' + i, 'data-pmh-tag': 'literal' });
        b.addEventListener('click', () => { C.pasteText = x; E.paste.value = x; paintDetect(); E.paste.focus(); });
        return b;
      }));
      E.detect.setAttribute('data-state', 'empty');
    }
  }
  function wayCards() {
    const s = C.s, grid = slot('new:ways', () => h('div.pjxc-ways', { role: 'group', 'aria-label': 'How it begins' }));
    const cards = flow().WAYS.map((w) => {
      const b = slot('new:way:' + w.id, () => { const el = h('button.pmu-card.pjxc-way', { type: 'button', 'data-lg-surface': 'card', 'data-way': w.id, 'data-c-key': 'way:' + w.id }); el.addEventListener('click', () => chooseWay(w.id)); return el; });
      b.setAttribute('aria-pressed', String(!!(s && s.draft.way === w.id)));
      fill(b, h('span.pjxc-way-ico', { html: icon(w.glyph, 24), 'aria-hidden': 'true' }),
        h('span.pjxc-way-text', null, h('span.pjxc-way-title', { text: w.title }), h('span.pjxc-way-sub', { text: w.sub })),
        w.tag ? h('span.pjxc-way-tag', { text: w.tag }) : null,
        h('span.pjxc-way-go', { html: icon('arrow-right', 16), 'aria-hidden': 'true' }));
      return b;
    });
    syncChildren(grid, cards);
    return grid;
  }
  /* the way that is not here yet: one quiet line that says why and offers what works instead */
  function importLine() {
    const m = flow().MORE[0], el = slot('new:more', () => h('div.pjxc-more'));
    fill(el, h('span.pjxc-more-ico', { html: icon(m.glyph, 16), 'aria-hidden': 'true' }),
      h('span.pjxc-more-text', null, h('b', { text: m.title }), h('span', { text: m.sub })),
      act('Add its folder instead', { cls: 'pjx-link', key: 'more:folder', run: () => chooseWay('folder') }));
    return el;
  }

  /* ------------------------------------------------------------------ New Project: the questions beside a live Review */
  function firstProblem(s) {
    for (const id of s.steps()) { if (id === 'way' || id === 'review' || id === 'source') continue; const t = flow().problem(s, id); if (t) return { step: id, text: t }; }
    return null;
  }
  function goToStep(step) { reveal('.pjxc-stepsin [data-step="' + cssEsc(step) + '"]', 'input:not([type="checkbox"]), .pjx-choice:not(.is-off), button'); }
  function stepsCard() {
    const E = C.els, s = C.s, way = flow().WAYS.find((w) => w.id === s.draft.way) || {};
    const card = slot('new:steps', () => h('section.pmu-card.pjxc-steps', { 'data-lg-surface': 'card', 'aria-label': 'Questions' }));
    if (!E.steps) E.steps = h('div.pjxc-stepsin');
    const running = !!(C.commit && C.commit.running);
    const begins = h('div.pjxc-begins', null,
      h('span.pjxc-begins-ico', { html: icon(way.glyph || 'seed', 20), 'aria-hidden': 'true' }),
      h('span.pjxc-begins-text', null, h('span.pjxc-cap', { text: 'Begins as' }), h('b', { text: way.title || '' })),
      h('span.pjxc-begins-acts', null,
        act('Choose another way', { cls: 'pjx-link', key: 'steps:way', off: running ? 'Setup is running' : null, run: () => { C.view = 'launcher'; C.swap = true; render(); } }),
        act('Start over', { cls: 'pjx-link', key: 'steps:over', off: running ? 'Setup is running' : null, tip: 'Clears every answer on this page', run: () => startOver() })));
    syncChildren(card, [begins, E.steps]);
    // the flow draws every remaining question as a section; text fields keep their caret (data-pjx-key)
    const sc = E.scroll.scrollTop;
    flow().render(s, E.steps, { all: true });
    E.scroll.scrollTop = sc;
    // "Name it" says where the files are once the source is chosen; before that its line would read "null" or
    // "undefined · null" (flow.js has no guard for a source not chosen yet: see the report), so it waits
    E.steps.querySelectorAll('.pjx-step-name .pjx-fact').forEach((f) => { const t = f.textContent.trim(); if (!t || /\bundefined\b|\bnull\b/.test(t)) f.hidden = true; });
    E.steps.inert = running;
    E.steps.toggleAttribute('data-busy', running);
    return card;
  }
  /* The live Review, read before anything is chosen: a value the flow leaves half-made ("A copy of", "Online ·", "—")
     says "Not chosen yet" in the quiet ink, and the folder waits for the name it is made from, so the Review never
     shows a fragment or a place nobody chose */
  function reviewRows(s) {
    const d = s.draft, named = !!(d.name || '').trim();
    return flow().review(s).map((g) => ({ label: g.label, step: g.step, rows: g.rows.map(([k, v]) => {
      const t = String(v == null ? '' : v).trim();
      // a fragment (an older flow.js, or a value cut short) never shows
      if (!t || /^—/.test(t) || /\s(of|from|on)$/.test(t) || /[·:]$/.test(t)) return [k, 'Not chosen yet', true];
      // the flow's own placeholders read as placeholders: the quiet ink, not a bold value
      const open = /not chosen yet/i.test(t) || (k === 'Name' && !named)
        || (k === 'Files' && !named && !d.placeTouched && /^(new|online|restore)$/.test(d.way || ''))
        || (k === 'Begins as' && d.way === 'online' && !d.repo);
      return [k, k === 'Name' && !named ? 'Not chosen yet' : t, open];
    }) }));
  }
  /* paths and names in a step's words keep together: a line breaks between words, never inside ~/Code/budget-tracker */
  function keepWhole(root, sel) {
    root.querySelectorAll(sel || '.pjx-phase-label').forEach((el) => {
      const parts2 = String(el.textContent).split(/(\s+)/);
      if (!parts2.some((x) => /[/-]/.test(x) && x.length <= 30)) return;
      el.replaceChildren(...parts2.map((x) => (/[/-]/.test(x) && x.length <= 30 ? h('span.pjxc-nobr', { text: x }) : D.createTextNode(x))));
    });
    return root;
  }
  function reviewCard() {
    const s = C.s, cm = C.commit, d = s.draft, verb = VERB[d.way] || VERB.new;
    const name = (d.name || '').trim();
    let body = [], footEl = null, title = 'Review', sub = 'Nothing has been made yet', meta = null, lead = 'list', leadMark = null;
    if (cm) {
      // the plate's subject is the Project being made; what is happening, and how far, is its second line
      const n = cm.list.length, done = cm.states.filter((x) => x === 'complete').length;
      leadMark = cm.running ? 'working' : 'failed'; lead = null;
      title = cm.running ? (name || 'Your new Project') : 'It didn’t finish';
      sub = cm.running ? verb[1] + ' · step ' + Math.min(n, done + 1) + ' of ' + n : name || 'Your new Project';
      body = [keepWhole(flow().phaseList(cm.list, cm.states)), cm.running ? h('p.pjxc-steps-n.is-left', { text: 'Each step is checked before the next one starts.' }) : null];
      if (!cm.running && cm.error) body.push(flow().facts([{ key: 'failed', text: cm.error }]));
      if (!cm.running) footEl = h('div.pjxc-commit', null,
        act('Try again', { primary: true, icon: 'refresh', key: 'rv:again', run: (e) => create(e.altKey || C.demoFail) }),
        act('Change something', { key: 'rv:edit', run: () => { C.commit = null; render(); goToStep(s.draft.way === 'online' ? 'online' : 'name'); } }));
    } else {
      body = reviewRows(s).map((g) => {
        const change = g.step ? act('Change', { cls: 'pjx-link', key: 'rv:ch:' + g.step, run: () => goToStep(g.step) }) : null;
        const dl = h('dl.pjxc-rrows');
        g.rows.forEach(([k, v, open]) => { dl.appendChild(h('dt', { text: k })); dl.appendChild(h('dd', { class: [open && 'is-open'], text: v })); });
        keepWhole(dl, 'dd');
        return h('section.pjxc-rgroup', null, h('div.pjxc-rghead', null, h('h4.pjxc-cap', { text: g.label }), change), dl);
      });
      const pr = firstProblem(s);
      const phases = flow().phases(s);
      const canFail = phases.some((x) => x.clone);
      const go = act(verb[0] + (name ? ' ' + name : ''), { primary: true, key: 'rv:go', icon: d.way === 'restore' ? 'history' : d.way === 'online' ? 'download' : 'check',
        off: pr ? pr.text : null, onOff: () => goToStep(pr.step), run: (e) => create(e.altKey || (canFail && C.demoFail)) });
      go.classList.add('pjxc-go');
      if (pr) go.setAttribute('aria-describedby', 'pjxc-why');
      const demo = canFail ? h('label.pjx-check.pjxc-demo', null, h('input', { type: 'checkbox', checked: C.demoFail ? true : null }), h('span', { text: 'Concept demo: the network drops during setup' })) : null;
      if (demo) demo.querySelector('input').addEventListener('change', (e) => { C.demoFail = e.target.checked; });
      const why = pr ? h('button.pjxc-why', { type: 'button', id: 'pjxc-why', 'data-c-key': 'rv:why' }, h('span.pjx-st-mark', { html: PJX.calm('warning', 13), 'aria-hidden': 'true' }), h('span', { text: pr.text })) : null;
      if (why) why.addEventListener('click', () => goToStep(pr.step));
      footEl = h('div.pjxc-commit', null, why, go,
        h('p.pjxc-steps-n', { text: phases.length + ' step' + (phases.length > 1 ? 's' : '') + ', each checked before the next' }), demo);
    }
    return plate('review', { tag: 'aside', cls: 'pjxc-review', icon: lead, mark: leadMark, title, sub, meta, body, footEl });
  }
  async function create(fail) {
    const s = C.s; if (!s || (C.commit && C.commit.running)) return;
    const pr = firstProblem(s); if (pr) { goToStep(pr.step); return; }
    const list = flow().phases(s);
    C.commit = { list, states: list.map(() => 'pending'), running: true, error: null, sid: s.id };
    render();
    later(() => { const r = C.root.querySelector('.pjxc-review'); if (r) { r.setAttribute('tabindex', '-1'); r.focus({ preventScroll: true }); } }, 30);
    announce((VERB[s.draft.way] || VERB.new)[1] + ' ' + s.draft.name);
    const res = await flow().commit(s, { fail: !!fail, onPhase(i, l, st) { if (C && C.commit && C.commit.sid === s.id) { C.commit.states[i] = st; render(); } } });
    if (!C) return;
    const mine = C.s === s, still = mine && C.mode === 'new';
    if (res.project) {
      if (res.ok) C.flash[res.project.id] = { title: res.project.name + ' is ready', text: 'It’s in your Projects. Plan it in the Planning Wizard, or open it now.', plan: true };
      // the draft became a Project (or a Project whose setup can be continued): it is no longer a draft
      if (mine) { C.s = null; C.commit = null; C.pasteText = ''; if (C.els.paste) C.els.paste.value = ''; }
      if (still) { C.mode = 'project'; C.sel = res.project.id; C.swap = true; C.els.scroll.scrollTop = 0; render(); focusTitle(); }
      else {
        // made while the person looked at another Project: say so where they are, and leave them there
        render();
        PJX.toast(res.ok ? res.project.name + ' is ready' : 'Setup didn’t finish for ' + res.project.name, res.ok ? 'It’s in your Projects, on ' + res.project.where.label + '.' : 'Continue setup from its page. Nothing is made twice.', res.ok ? 'success' : 'warn');
      }
      announce(res.ok ? res.project.name + ' is ready' : 'Setup didn’t finish for ' + res.project.name);
    } else if (mine) {
      C.commit.running = false; C.commit.error = res.said || 'Setup didn’t finish.'; render();
      announce('It didn’t finish. ' + C.commit.error);
    }
  }
  function renderNew() {
    const E = C.els;
    if (!C.s) startNew({}, true);
    renderHeadNew();
    const kids = [];
    if (C.view === 'launcher' || !C.s.draft.way) {
      C.view = 'launcher';
      kids.push(pasteCard(), wayCards(), importLine());
      E.body.setAttribute('data-view', 'launcher');
    } else {
      const grid = slot('new:grid', () => h('div.pjxc-flowgrid'));
      syncChildren(grid, [stepsCard(), reviewCard()]);
      kids.push(grid);
      E.body.setAttribute('data-view', 'steps');
    }
    syncChildren(E.body, kids);
  }

  /* ------------------------------------------------------------------ render */
  function render() {
    if (!C || !C.els.shell) return;
    const fk = focusKey();
    ensureSelection();
    const E = C.els;
    E.shell.toggleAttribute('data-narrow', C.narrow);
    E.shell.toggleAttribute('data-drawer', C.narrow && C.drawer);
    // in Glass the library is a panel sheet beside the page, and a floating menu sheet while it is a drawer
    setAttr(E.lib, 'data-lg-surface', C.narrow ? 'menu' : 'panel');
    setAttr(E.lib, 'data-lg-dense', C.narrow);
    setAttr(E.lib, 'data-lg-lens-host', C.narrow);
    setAttr(E.lib, 'aria-hidden', C.narrow && !C.drawer ? 'true' : null);
    if (E.lib.inert !== (C.narrow && !C.drawer)) E.lib.inert = C.narrow && !C.drawer;
    renderLib();
    if (C.mode === 'new') renderNew(); else renderProject();
    setAttr(E.shell, 'data-mode', C.mode);
    if (C.swap || C.lastSel !== C.sel) {
      C.swap = false;
      // a short arrival for the new page's contents (each look's own voice in c.css). The mark is on the shell, never
      // on a sheet: the animation moves what is inside the sheets, not the sheets themselves
      E.shell.removeAttribute('data-swap');
      void E.shell.offsetWidth;
      if (!PJX.reduced()) { E.shell.setAttribute('data-swap', ''); clearTimeout(C.swapT); C.swapT = later(() => E.shell.removeAttribute('data-swap'), 460); }
    }
    C.lastSel = C.sel;
    C.lastOrder = visualOrder().map((p) => p.id);
    restoreFocus(fk);
    fitHead();
  }
  /* the name keeps its whole word: when the head's actions would cut it, they move under the state line */
  function fitHead() {
    const E = C.els, t = E.head.querySelector('.pjxc-title');
    E.head.removeAttribute('data-tight');
    if (!t || C.narrow) return;
    if (t.scrollWidth > t.clientWidth + 1) E.head.setAttribute('data-tight', '');
  }
  let raf = 0;
  const soon = () => { if (raf) return; raf = W.requestAnimationFrame(() => { raf = 0; render(); }); };

  /* ------------------------------------------------------------------ mount */
  function build(root) {
    const E = C.els;
    E.shell = h('div.pmu-shell.pjxc-shell', { id: 'pjxc' });
    E.lib = h('aside.pmu-rail.pjxc-lib', { id: 'pjxc-lib', 'aria-label': 'Your projects', 'data-lg-surface': 'panel' });
    E.count = h('span.pjxc-count');
    E.filterLabel = h('span.pmu-ctltext');
    E.filterBtn = h('button.pmu-ctlbtn.pjxc-filter', { type: 'button', 'aria-haspopup': 'menu', 'data-c-key': 'lib:filter' },
      h('span.pmu-ctllead', { html: icon('filter', 15), 'aria-hidden': 'true' }), E.filterLabel, h('span.pmu-ctlchev', { html: icon('chevron-down', 14), 'aria-hidden': 'true' }));
    tip(E.filterBtn, 'Show and order', 'Filter the list or change its order');
    E.filterBtn.addEventListener('click', () => filterMenu(E.filterBtn));
    E.search = h('input.pjxc-search-in', { type: 'search', placeholder: 'Search projects', 'aria-label': 'Search projects', autocomplete: 'off', spellcheck: 'false' });
    E.search.addEventListener('input', () => { C.q = E.search.value; render(); });
    E.search.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && E.search.value) { e.preventDefault(); C.q = ''; E.search.value = ''; render(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); const r = C.els.list.querySelector('.pjxc-row'); if (r) { r.focus(); select(r.getAttribute('data-pid'), { from: 'keys' }); } }
    });
    E.searchClear = h('button.pjx-iconbtn.pjxc-search-x', { type: 'button', html: icon('close', 14), 'data-c-key': 'lib:clearq' });
    tip(E.searchClear, 'Clear search', 'Esc');
    E.searchClear.addEventListener('click', () => { C.q = ''; E.search.value = ''; render(); E.search.focus(); });
    E.newBtn = h('button.pmw-act.is-primary.pjxc-new', { type: 'button', 'data-c-key': 'lib:new' }, h('span.pjxc-bico', { html: icon('folder-plus', 16), 'aria-hidden': 'true' }), h('span.pjxc-blabel', { text: 'New Project' }));
    // pressed while New Project is open it only takes you to where you are in it (it never clears the answers); pressed
    // anywhere else it opens New Project, or the draft you left there
    E.newBtn.addEventListener('click', () => { if (C.mode === 'new') { if (C.narrow) closeDrawer(false); focusNew(); return; } startNew({}); });
    // the drawer's own close (a universal: its mark, its hover label and its name), shown only while it is a drawer
    E.drawerX = h('button.pjx-iconbtn.pjxc-drawer-x', { type: 'button', html: icon('close', 16), 'data-c-key': 'lib:close' });
    tip(E.drawerX, 'Close the list', 'Esc');
    E.drawerX.addEventListener('click', () => closeDrawer(true));
    E.undo = h('div.pjxc-undo');
    E.needSlot = h('div.pjxc-needslot');
    E.list = h('nav.pjxc-list', { 'aria-label': 'Projects' });
    E.list.addEventListener('keydown', onListKey);
    E.lib.append(
      h('div.pjxc-libhead', null,
        h('div.pmu-brand.pjxc-brand', null, h('h1', null, 'Projects', E.count), h('span.pjx-grow'), E.filterBtn, E.drawerX),
        h('label.pjxc-search', null, h('span.pjxc-search-ico', { html: icon('search', 15), 'aria-hidden': 'true' }), E.search, E.searchClear),
        E.newBtn),
      E.undo, E.needSlot, E.list);
    E.scrim = h('div.pjxc-scrim', { 'aria-hidden': 'true' });
    E.scrim.addEventListener('mousedown', () => closeDrawer(true));
    E.head = h('header.pmu-stagehead.pjxc-head', { 'data-lg-surface': 'bar' });
    E.body = h('div.pjxc-body');
    E.scroll = h('div.pmu-scroll.pjxc-scroll', null, E.body);
    E.stage = h('section.pmu-stage.pjxc-stage', { 'aria-label': 'Project' }, E.head, E.scroll);
    E.live = h('div.pjx-sr', { 'aria-live': 'polite' });
    E.shell.append(E.lib, E.scrim, E.stage, E.live);
    root.appendChild(E.shell);
  }
  function onDocKey(e) {
    if (!C || e.defaultPrevented) return;
    if (D.querySelector('.pjx-dlg-back, .pmr-menu.is-open')) return;
    const a = D.activeElement, inside = a && (C.root.contains(a) || a === D.body);
    if (!inside || !C.root.offsetParent) return;
    if (e.key === 'Escape') {
      if (C.drawer) { e.preventDefault(); closeDrawer(true); return; }
      if (C.mode === 'new' && PJX.all().length) { e.preventDefault(); closeNew(); }
      return;
    }
    // the drawer is modal while it is open: Tab stays inside it
    if (e.key === 'Tab' && C.drawer) {
      const f = Array.from(C.els.lib.querySelectorAll('button:not([disabled]), input, [tabindex="0"]')).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
      return;
    }
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !/input|textarea|select/i.test(a.tagName || '')) {
      e.preventDefault();
      if (C.narrow && !C.drawer) openDrawer();
      later(() => C.els.search.focus(), C.narrow ? 40 : 0);
    }
  }

  /* The title bar's notes (#rsStage, PM Notify) drop over the page head's actions. While this page shows, they take no
     pointer and sit at the bottom right of the page instead, as they do on Usage (style contract §1). Only the
     standalone translate property is written, so the app's own motion of the stage still composes with it. */
  function placeNotes() {
    if (!C) return;
    const B = D.body, rs = D.getElementById('rsStage'), pnl = D.getElementById('panel-projects');
    const on = !!(rs && pnl && pnl.classList.contains('active') && C.root.offsetParent);
    if (!on) { if (B.hasAttribute('data-pjxc-page')) { B.removeAttribute('data-pjxc-page'); B.style.removeProperty('--pjxc-rs-x'); B.style.removeProperty('--pjxc-rs-y'); } return; }
    B.setAttribute('data-pjxc-page', '');
    const r = rs.getBoundingClientRect(), sc = C.els.scroll.getBoundingClientRect();
    if (!r.height) return;
    const cx = parseFloat(B.style.getPropertyValue('--pjxc-rs-x')) || 0, cy = parseFloat(B.style.getPropertyValue('--pjxc-rs-y')) || 0;
    const x = Math.round((sc.right - 18 - r.width) - (r.left - cx)), y = Math.round((sc.bottom - 14 - r.height) - (r.top - cy));
    B.style.setProperty('--pjxc-rs-x', Math.min(0, x) + 'px');
    B.style.setProperty('--pjxc-rs-y', Math.max(0, y) + 'px');
  }

  PJX.concept('c', {
    title: 'Split',
    mount(root) {
      C = fresh(root);
      build(root);
      C.narrow = root.getBoundingClientRect().width > 0 && root.getBoundingClientRect().width < NARROW;
      if (W.ResizeObserver) {
        C.ro = new W.ResizeObserver((ents) => {
          const w = ents[0].contentRect.width; if (!w) return;
          const n = w < NARROW;
          if (n !== C.narrow) { C.narrow = n; if (!n) C.drawer = false; render(); } else fitHead();
        });
        C.ro.observe(root);
      }
      C.offs.push(PJX.on('op', (op) => {
        if (!C) return;
        // the in-place fixes end with a short "done" band on the page that showed the problem
        if (op.done && !op.failed) {
          const p = PJX.get(op.id);
          if (p && op.kind === 'relocate' && !p.where.missing) { delete C.repair[p.id]; C.flash[p.id] = /fresh/.test(op.label) ? { title: p.name + ' is back', text: 'A fresh copy from ' + p.online.service + ' is at ' + p.where.path + '. Changes that were never sent are not in it.' } : { title: p.name + ' found', text: 'Now at ' + p.where.path + '. Its history, online copy and backups are as they were.' }; }
          if (p && op.kind === 'restore' && !p.where.missing) { delete C.repair[p.id]; C.flash[p.id] = { title: p.name + ' is back', text: 'Restored from its backup into ' + p.where.path + '.' }; }
          if (p && op.kind === 'move') { delete C.repair[p.id]; delete C.repairOpen[p.id]; }
          if (p && op.kind === 'resume') { delete C.resume[p.id]; C.flash[p.id] = { title: p.name + ' is ready', text: 'Setup finished. Nothing was made twice.', plan: true }; }
        }
        soon();
      }));
      C.offs.push(PJX.on('change', (e) => {
        // the undo strip appears after parts.js has noted the removal, which is after the core's own re-render
        if (e && e.why === 'remove') { render(); later(render, 15300); }
      }));
      C.offs.push(PJX.on('pjx-show', (e) => {
        if (!C || !e || e.view !== 'archived') return;
        C.archivedOpen = true;
        const a = PJX.archived()[0];
        if (a) select(a.id, { focus: 'page' }); else render();
        later(() => { const g = C.root.querySelector('.pjxc-group.is-archived'); if (g) g.scrollIntoView({ block: 'nearest' }); }, 40);
      }));
      D.addEventListener('keydown', onDocKey);
      C.offs.push(() => D.removeEventListener('keydown', onDocKey));
      // the notes move when one arrives or leaves, when the page shows or hides, and when the window changes size
      if (W.MutationObserver) {
        const mo = new W.MutationObserver(() => W.requestAnimationFrame(placeNotes));
        const rs = D.getElementById('rsStage'), pnl = D.getElementById('panel-projects');
        if (rs) mo.observe(rs, { childList: true, subtree: false });
        if (pnl) mo.observe(pnl, { attributes: true, attributeFilter: ['class'] });
        C.offs.push(() => mo.disconnect());
      }
      const onResize = () => placeNotes();
      W.addEventListener('resize', onResize);
      C.offs.push(() => W.removeEventListener('resize', onResize));
      C.offs.push(() => { D.body.removeAttribute('data-pjxc-page'); D.body.style.removeProperty('--pjxc-rs-x'); D.body.style.removeProperty('--pjxc-rs-y'); });
      if (!PJX.all().length) startNew({}, true);
      render();
    },
    unmount() {
      if (!C) return;
      C.offs.forEach((f) => { try { f(); } catch (e) { /* already gone */ } });
      C.timers.forEach((t) => clearTimeout(t));
      if (C.ro) C.ro.disconnect();
      if (raf) { W.cancelAnimationFrame(raf); raf = 0; }
      C = null;
    },
    render() { if (C) render(); },
    openNew(opts) { if (C) startNew(opts || {}); },
    openProject(id) {
      if (!C) return;
      const p = PJX.get(id); if (!p) return;
      const again = C.mode === 'project' && C.sel === id;
      select(id, { focus: 'page' });
      // Details on a page that already shows the Project goes to the part its notice is about
      const att = (p.attention || [])[0];
      if (again && att) reveal(att.code === 'signed_out' ? '[data-plate="online"]' : att.code === 'device_offline' ? '[data-plate="where"]' : '[data-plate="now"]', '.pmu-textbtn');
    },
    openRepair(id) { return this.onRepair({ id }); },
    /* Find the folder and Continue setup are shown on the Project's own page, not in a dialog */
    onRepair(e) {
      if (!C) return false;
      const p = PJX.get(e.id); if (!p) return false;
      if (e.move) C.repairOpen[p.id] = true;
      select(p.id);
      reveal('[data-plate="repair"]', '.pjx-choice');
      return true;
    },
    onResume(e) {
      if (!C) return false;
      const p = PJX.get(e.id); if (!p || !p.recovery) return false;
      select(p.id);
      reveal('[data-plate="resume"]', '[data-c-key="rs:go"]');
      return true;
    }
  });
})(window);
