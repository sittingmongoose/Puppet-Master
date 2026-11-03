/* Projects concepts (Opus 5.5): concept C, "Split".

   A library of Projects on the left and the chosen Project's own page on the right. The library is grouped by the machine
   each Project lives on (This computer, Home NAS, Studio Mac, then Archived), because the person this concept serves
   works across several machines and thinks "the one on the NAS", not "the fourth card". Every machine you have shows,
   with whether it answers and what to do about it, even before anything lives on it. What needs you stays in its
   machine's group, first in it, and a short "4 need you" line above the list shows only those. The page on the right
   says what the Project is doing, how it is kept safe (History, Online copy, Backup) and where it lives, and every
   problem is fixed on that page: the missing folder is found in place, an unfinished setup is finished in place.

   Split v2 (2026-11-02, Jared: "I am leaning towards the Split option. Lets just focus on that for future passes."):
   New Project takes over the right page as a launcher: paste a link, a folder or an address (PJX.np.detect recognises
   it), or choose one of the six ways; then one guided page beside a live Review. One section is open at a time,
   finished sections fold to their answer with Change, and the sections are a pure function of the answers (PJX.np,
   layer/np.js), so an abandoned answer never comes back. The sections and their parts are PJX.npui's (layer/np-ui.js);
   this file draws the frame, the launcher, the Review card, creating, Done, "Finish protecting your work" and Didn't
   finish. The Project page's plates reuse the same parts for their in-place forms (online copy, backup, which computer
   does the work), so the page and New Project never disagree. Leaving New Project never throws the answers away: the
   draft waits at the top of the library ("Not made yet") until it is made or started over.

   Built from Usage's own parts (.pmu-shell, .pmu-rail, .pmu-stagehead, .pmu-card plates with .pmu-facts, .pmu-textbtn)
   and Home's .pmw-act buttons, so every look draws it the way it draws Usage and Home. Nothing here is a second runtime:
   every action routes through PJX.ACT, PJX.ACTIONS, PJX.moreItems, PJX.parts and PJX.flow. */
(function (W) {
  'use strict';
  const PJX = W.PJX;
  if (!PJX) return;
  const D = W.document;
  const { h, icon, mark, tip } = PJX;
  const W_ = (k, v) => PJX.w(k, v);
  const parts = () => PJX.parts, flow = () => PJX.flow;

  /* Below this width of the Projects pane the library becomes a drawer behind a "Projects" button. c.css switches its
     layout at the same width (@container pjx (max-width: 739.98px)), so the two never disagree. */
  const NARROW = 740;
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
      repair: {}, repairOpen: {}, resume: {}, flash: {}, lastChoice: null, inplace: {}
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
      'data-c-key': o.key || null, 'data-cmd': o.cmd || null, 'aria-disabled': o.off ? 'true' : null },
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
  /* what YOLO does at a Project-page yes-point instead (only while the run mode is YOLO) */
  const yoloAt = (text, asks) => PJX.npui.yoloLine(text, { asks });
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
    // a text field keeps its focus and caret, wherever it was redrawn (np-ui's sections, the in-place forms)
    if (a.getAttribute('data-pjx-key')) return { sel: '[data-pjx-key="' + cssEsc(a.getAttribute('data-pjx-key')) + '"]', caret: a.selectionStart != null ? [a.selectionStart, a.selectionEnd] : null, el: a.classList.contains('pjx-np-secret') ? a : null };
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
    if (k.el && k.el.isConnected) { try { k.el.focus({ preventScroll: true }); } catch (e) { /* gone */ } return; }
    if (k.sel) el = C.root.querySelector(k.sel);
    if (el && k.caret) { try { el.focus({ preventScroll: true }); el.setSelectionRange(k.caret[0], k.caret[1]); } catch (e) { /* not a text field */ } return; }
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
    const words = trying ? 'Calling ' + dev.name + '…' : off ? 'Not answering' : dev.address + (dev.pm ? ' · Puppet Master server · answering' : ' · connected');
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
    return !!(s && (s.d.way || s.d.nameTouched || (C.pasteText || '').trim() || C.commit));
  }
  function draftRow() {
    const s = C.s, d = s.d, cm = C.commit, way = PJX.np.WAYS.find((w) => w.id === d.way), verb = PJX.np.VERB[d.way] || PJX.np.VERB.new;
    const done = cm ? cm.states.filter((x) => x === 'complete').length : 0;
    const key = cm && cm.running ? 'working' : cm && cm.fail ? 'failed' : 'pending';
    const line = cm && cm.running ? verb[1] + ' · step ' + Math.min(cm.list.length, done + 1) + ' of ' + cm.list.length
      : cm && cm.fail ? (cm.fail.kept && cm.fail.kept.length ? 'Didn’t finish · part was made' : 'Didn’t finish · nothing was made') : way ? way.title : W_('np.draft.notStarted');
    const m = h('span.pjxc-row-mark', { html: listMark(key, 14), 'data-tone': parts().tone(key), 'aria-hidden': 'true' });
    tip(m, cm && cm.running ? 'Being made now' : 'Not made yet');
    const b = h('button.pjxc-row.is-draft', { type: 'button', 'data-c-key': 'row:draft', tabindex: '-1' },
      h('span.pjxc-row-ico', { html: icon(way ? way.glyph : 'folder-plus', 16), 'aria-hidden': 'true' }),
      h('span.pjxc-row-text', null, h('span.pjxc-row-name', { text: String(PJX.np.nameOf(s) || '').trim() || 'New project' }), h('span.pjxc-row-line', { 'data-tone': parts().tone(key), text: line })),
      m);
    tip(b, 'Back to your new Project', W_('np.draft.tip').replace(/^Back to your new Project · /, ''));
    b.addEventListener('click', () => startNew({}));
    return group('draft', W_('np.draft.row'), [s], { rowFn: () => b, noCount: true });
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
    if (C.mode === 'new' || (C.mode === 'move' && C.mv)) return;
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
    else acts.push(act(p.active ? 'Open now' : 'Open', { icon: 'open', strong: !p.active, key: 'h:open', cmd: 'cmd.project.open', off: p.active ? 'It is the open project' : openWhy(p), onOff: () => goToProblem(p), run: () => PJX.ACT.open(p.id) }));
    acts.push(act('Project settings', { icon: 'settings', key: 'h:settings', cmd: 'cmd.project.open_settings', run: () => PJX.ACT.settings(p.id) }));
    const more = act('More', { icon: 'more', chev: true, key: 'h:more', run: (e, b) => moreMenu(p, b) });
    more.setAttribute('aria-haspopup', 'menu');
    acts.push(more);
    return h('div.pmu-headctl.pjxc-acts', null, ...acts);
  }
  /* More holds what has no plate of its own on this page: Open, Project settings, Rename, New project like this,
     Archive and Remove from list. Keep it safe and Where it lives are on their plates, beside what they are about, so
     the menu stays short and nothing hides below its fold */
  function moreMenu(p, b) {
    const like = { label: W_('pg.more.like'), icon: 'folder-plus', meta: W_('pg.more.likeSub'), run: () => PJX.emit('need-new', { like: p.id }) };
    // the same choices as New Project's copy step, from the other side: this Project receives (10.5) [Depends: settings]
    const copy = { label: W_('pg.more.copy'), icon: 'swap', meta: 'Settings Transfer', run: () => PJX.ACT.copySettingsInto(p.id) };
    const groups = PJX.moreItems(p, [{ items: [like, copy] }]).filter((g) => !/^(Keep it safe|Where it lives)$/.test(g.label || ''));
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
  const OP_FOR = { signed_out: ['signin'], device_offline: ['retry'], not_backed_up: ['backup'], backup_overdue: ['backup'], original_newer: ['sync'], backup_unfinished: ['protect', 'backup'] };
  function noticeNode(p, att) {
    const n = parts().notice(p, att, { cls: 'pmu-textbtn' });
    n.querySelectorAll('.pjx-notice-acts button').forEach((b, i) => b.setAttribute('data-c-key', 'n:' + att.code + ':' + i));
    const op = opOf(p.id);
    if (op && (OP_FOR[att.code] || []).indexOf(op.kind) >= 0) fill(n.querySelector('.pjx-notice-acts'), working(op));
    return n;
  }
  function flashNode(p, fl) {
    const acts = [];
    if (p.lifecycle === 'listed') acts.push(act(W_('np.done.open', { name: p.name }), { cls: 'pmu-textbtn', primary: true, icon: 'open', key: 'f:open', off: p.active ? 'It is the open project' : null, run: () => PJX.ACT.open(p.id) }));
    if (fl.chat) acts.push(act(W_('np.done.undo'), { cls: 'pmu-textbtn', icon: 'reset', key: 'f:undochat', cmd: 'gap:thread conversion undo [Depends: no-project]', run: () => undoNewFromChat(p, fl) }));
    if (fl.moved) acts.push(act(W_('np.mv.show'), { cls: 'pmu-textbtn', icon: 'folder', key: 'f:mvshow', run: () => PJX.toast(W_('np.mv.show'), fl.moved.files.length ? fl.moved.files.join(', ') + ' · in ' + fl.moved.folder + '/' + (fl.moved.place === 'draft' ? ' on the draft ' + fl.moved.branch : '') : 'No files moved.', 'info') }));
    if (fl.moved) acts.push(act(W_('np.mv.undo'), { cls: 'pmu-textbtn', icon: 'reset', key: 'f:mvundo', cmd: 'gap:thread conversion undo [Depends: no-project]', run: () => undoMove(p, fl.moved) }));
    if (fl.plan) acts.push(act(W_('np.done.plan'), { cls: 'pmu-textbtn', icon: 'plan', key: 'f:plan', run: () => PJX.ACT.replan(p.id) }));
    if (fl.undoCopy && p.copied) acts.push(act(W_('np.done.undoCopy'), { cls: 'pmu-textbtn', icon: 'reset', key: 'f:undocopy', run: () => PJX.ACT.undoCopied(p.id) }));
    acts.push(act(W_('np.done.ok'), { cls: 'pmu-textbtn', key: 'f:done', run: () => { delete C.flash[p.id]; render(); focusTitle(); } }));
    const more = fl.accounts ? h('div.pjx-notice-text.pjxc-flash-acc', null, h('span', { text: (fl.accounts === 1 ? W_('np.done.accountsOne', { computer: fl.computer }) : W_('np.done.accounts', { n: fl.accounts, computer: fl.computer })) + ' ' }),
      act(W_('np.done.accountsGo'), { cls: 'pjx-link', key: 'f:signin', run: () => { PJX.toast('Settings › Providers', 'Opens Providers with ' + fl.computer + ' chosen, so the sign-ins and keys are kept there.', 'info'); if (W.PM_PAGES) W.PM_PAGES.go('settings'); } })) : null;
    return h('div.pjx-notice.pjxc-flash', { 'data-tone': 'done', role: 'status' },
      h('span.pjx-notice-mark', { html: PJX.calm('complete', 16), 'aria-hidden': 'true' }),
      h('div.pjx-notice-title', { text: fl.title }), h('div.pjx-notice-text', { text: fl.text }), fl.agent ? h('div.pjx-notice-text.pjxc-flash-agent', { text: fl.agent }) : null, more, h('div.pjx-notice-acts', null, ...acts));
  }
  /* Undo a new project made from a chat: its own statement first, by the way its files were used (NOPROJECT 7.7) */
  function undoNewFromChat(p, fl) {
    const mode = fl.files || 'move', c = (PJX.ENV.chats || []).find((x) => x.title === fl.chat) || {};
    const body = h('div', null, PJX.flow.facts([{ key: 'info', text: W_('np.done.undoNew.' + mode, { name: p.name, n: c.files || 0, path: (c.workedIn || {}).path || '' }) }, { key: 'info', text: W_('np.done.undoNew.never') }]));
    PJX.yes({ title: W_('np.done.undoNew.title', { name: p.name, chat: fl.chat }), body, okLabel: W_('np.done.undo'),
      ok: () => PJX.run(p.id, 'remove', 'Undoing', [{ label: 'Moving “' + fl.chat + '” back to No project', ms: 700 }, { label: mode === 'move' ? 'Putting its files back in the chat folder' : 'Taking ' + p.name + ' off your list', ms: 700 }], () => { PJX.S.world.projects = PJX.all().filter((x) => x !== p); delete C.flash[p.id]; }, { cmd: 'gap:thread conversion undo' }).then(() => PJX.toast(W_('np.done.undoNew.done', { chat: fl.chat, name: p.name }), W_('np.done.undoNew.never'), 'success')),
      report: { title: W_('np.done.undoNew.done', { chat: fl.chat, name: p.name }) } });
  }
  /* Undo a move into a project you have: its statement first, then the move back */
  function undoMove(p, rec) {
    const body = h('div', null, PJX.flow.facts(PJX.np.moveUndoStatement(rec).map((t) => ({ key: 'info', text: t }))));
    PJX.yes({ title: W_('np.mv.u.title', { chat: rec.title }), body, okLabel: W_('np.mv.u.go'),
      ok: () => PJX.run(p.id, 'move', 'Undoing the move', [{ label: 'Putting the files back in the chat folder', ms: 700 }, { label: 'Moving “' + rec.title + '” back to No project', ms: 700 }], () => { PJX.np.moveUndo(rec.chat); delete C.flash[p.id]; }, { cmd: 'gap:thread conversion undo' }).then(() => PJX.toast(W_('np.mv.u.done', { chat: rec.title }), W_('np.mv.u.never'), 'success')),
      report: { title: W_('np.mv.u.done', { chat: rec.title }) } });
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
      body: busy ? [working(op)] : [move ? null : missingLead(p), R.box, yoloAt(W_('np.yolo.repair'))],
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
    // 6.12.4 C: Continue setup, Check again, Review setup again, Open on the service, and Delete the repository there with
    // its own confirmation (never part of resume), apart from Remove from list
    const checking = op && op.kind === 'check';
    const foot = running ? null : h('div.pmu-cardfoot.pjxc-foot', null,
      act('Remove from list…', { cls: 'pmu-textbtn', quiet: true, key: 'rs:remove', cmd: 'cmd.project.remove', run: () => PJX.emit('need-remove', { id: p.id }) }),
      h('span.pjx-grow'),
      act(W_('pg.rs.check'), { cls: 'pmu-textbtn', icon: 'refresh', key: 'rs:check', cmd: 'cmd.project.resume_creation (preflight)', off: checking ? 'Checking now' : null, run: () => PJX.ACT.checkAgain(p.id) }),
      act(W_('pg.rs.review'), { cls: 'pmu-textbtn', icon: 'list', key: 'rs:review', run: () => reviewSetupDialog(p) }),
      p.online.service ? act('Open on ' + svc, { cls: 'pmu-textbtn', icon: 'globe', key: 'rs:online', cmd: 'cmd.forge.repository.open_in_browser', run: () => PJX.ACT.openOnline(p.id) }) : null,
      act('Continue setup', { cls: 'pmu-textbtn', primary: true, icon: 'play', key: 'rs:go', cmd: 'cmd.project.resume_creation (Handler pending, G5)', run: () => { R.states = rec.remaining.map(() => 'pending'); PJX.ACT.resume(p.id); } }));
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
        textLine('Continue setup does only what is left. Nothing on ' + svc + ' is made a second time.', 'is-hint'),
        yoloAt(W_('np.yolo.resume')),
        // deleting what was made online is its own act, apart from Remove from list and never part of Continue setup
        p.online.service && !running ? h('p.pjxc-say.is-hint.pjxc-rsdelete', null, h('span', { text: W_('pg.rs.deleteLine', { service: svc }) + ' ' }),
          act(W_('pg.rs.delete', { repo: p.online.repo, service: svc }), { cls: 'pjx-link', danger: true, key: 'rs:delete', cmd: 'cmd.forge.repository.delete (Handler pending, G5)', run: () => deleteRemoteDialog(p) })) : null
      ],
      footEl: foot
    });
  }

  /* ------------------------------------------------------------------ the plates (Usage's plate head, facts and foot) */
  function plate(key, o) {
    const el = slot('plate:' + key, () => h(o.tag || 'article', { class: ['pmu-card', 'pjxc-plate', o.cls], 'data-head': 'plate', 'data-plate': key, 'data-lg-surface': 'card', 'aria-labelledby': 'pjxc-pt-' + key }));
    const foot = o.footEl || (o.foot && o.foot.filter(Boolean).length ? h('div.pmu-cardfoot.pjxc-foot', null, ...o.foot.filter(Boolean)) : null);
    setAttr(el, 'data-tone', o.tone || null);
    setAttr(el, 'data-inplace', o.inplace ? '' : null);
    fill(el,
      h('header.pmu-cardhead', null,
        // the lead is the plate's glyph, or a status mark when the plate itself is the state (creating, stopped)
        o.mark ? h('span.pjxc-plico.is-mark', { html: listMark(o.mark, 16), 'data-tone': parts().tone(o.mark), 'aria-hidden': 'true' })
          : o.icon ? h('span.pjxc-plico', { html: icon(o.icon, 16), 'aria-hidden': 'true' }) : null,
        h('div.pmu-cardtitles', null, h('h3.pmu-cardtitle', { id: 'pjxc-pt-' + key, text: o.title }), o.sub ? h('span.pmu-cardsub', { text: o.sub }) : null),
        o.meta ? h('span.pmu-cardmeta', null, o.meta) : null),
      h('div.pmu-cardbody', null, ...(o.body || []).filter(Boolean), foot));
    if (o.inplace && foot) { const inner = Array.from(el.querySelectorAll('.pmu-cardbody .pjx-btn.is-primary')).some((b) => !foot.contains(b)); const sv = foot.querySelector('.pjxc-btn.is-primary'); if (inner && sv) sv.classList.remove('is-primary'); }
    return el;
  }
  /* backup states, in one place: the plate's corner, the Safe strip and the library line agree */
  function bkState(p) {
    const b = p.backup || {}, op = opOf(p.id);
    if (op && (op.kind === 'backup' || op.kind === 'protect')) return { key: 'working', word: op.label, short: op.label + '…' };
    if (!b.dest) return { key: p.lifecycle === 'archived' ? 'off' : 'warning', word: W_('pg.bk.none'), short: W_('pg.bk.none') };
    const offline = (p.attention || []).some((a) => a.code === 'device_offline');
    if (offline) return { key: 'offline', word: W_('pg.bk.waiting', { device: p.where.device }), short: b.dest + ' · waiting' };
    return ({
      setup: { key: 'waiting', word: W_('pg.bk.notOn'), short: b.dest + ' · not on yet' },
      scheduled: { key: 'pending', word: 'First one tonight', short: b.dest + ' · first one tonight' },
      ready: { key: 'idle', word: 'Ready', short: b.dest + ' · ready' },
      warning: { key: 'warning', word: W_('pg.bk.late'), short: b.dest + ' · ' + (b.last || 'late') },
      failed: { key: 'failed', word: W_('pg.bk.failed'), short: b.dest + ' · failed' },
      paused: { key: 'paused', word: W_('pg.bk.paused'), short: b.dest + ' · paused' },
      pending: { key: 'pending', word: 'After setup', short: b.dest + ' · none yet' }
    })[b.state] || { key: 'complete', word: W_('pg.bk.ok'), short: b.dest + (b.last ? ' · ' + b.last : '') };
  }
  /* Kept safe at a glance: History · Online copy · Backup, each its mark, its name and a short word, and each a button to
     its own plate below (the same cells as the core's Safe line, PJX.parts.safeLine, made pressable) */
  function safeStrip(p) {
    const s = PJX.safety(p), hist = p.history || {}, o = p.online || {}, op = opOf(p.id);
    const syncing = op && (op.kind === 'sync' || op.kind === 'signin'), bk = bkState(p);
    const words = {
      // Jujutsu says bookmark (SCS-005, JJI-006)
      history: s.history.key === 'off' ? 'Not kept' : (hist.backend === 'jujutsu' ? 'Jujutsu · bookmark ' : 'Git · ') + hist.branch,
      online: !o.service ? (o.found ? 'Found, not linked' : 'None') : syncing ? op.label + '…' : o.service + (o.state === 'waiting' ? ' · sign in again' : o.upstream && o.upstream.behind ? ' · ' + o.upstream.behind + ' newer in the original' : o.behind ? ' · ' + o.behind + ' newer' : o.ahead ? ' · ' + o.ahead + ' to send' : o.readOnly ? ' · read only' : ' · up to date'),
      backup: bk.short
    };
    const keys = { history: s.history.key, online: syncing ? 'working' : !o.service && o.found ? 'info' : s.online.key, backup: bk.key };
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
          p.stack && p.stack.length ? { k: 'Built with', v: p.stack.join(' · ') } : null,
          p.copied ? { k: 'Settings', v: 'Like ' + p.copied.from + ': ' + PJX.np.plural(p.copied.settings, 'setting') + (p.copied.things ? ' and ' + PJX.np.plural(p.copied.things, 'thing') : '') } : null
        ])
      ],
      foot: [
        act(busy ? 'Open in Orchestrator' : 'Orchestrator', { cls: 'pmu-textbtn', icon: 'workflow', key: 'p:orch', cmd: 'cmd.nav.focus_route (orchestrator)', run: () => PJX.ACT.orchestrator(p.id) }),
        p.lifecycle === 'listed' ? act('Plan in the Planning Wizard', { cls: 'pmu-textbtn', icon: 'plan', key: 'p:plan', cmd: 'cmd.nav.focus_route (planning wizard)', run: () => PJX.ACT.replan(p.id) }) : null
      ]
    });
  }
  function historyPlate(p) {
    const s = PJX.safety(p).history, hist = p.history || {}, jj = hist.backend === 'jujutsu';
    const none = s.key === 'off';
    const changed = hist.changed == null ? (p.where.missing ? 'Unknown until it is found' : 'Unknown yet') : hist.changed ? hist.changed + ' unsaved' : 'None';
    const lim = PJX.np.limits(hist);
    return plate('history', {
      icon: 'branch', title: 'History', sub: none ? 'Not kept' : (jj ? 'Jujutsu · bookmark ' : 'Git · ') + hist.branch,
      meta: none ? parts().st('off', 'Off') : null,
      body: none ? [textLine(W_('pg.hi.none'))] : [facts([
        { k: 'Kept with', v: jj ? 'Jujutsu' : 'Git' },
        { k: jj ? 'Bookmark' : 'Branch', v: hist.branch + (hist.defaultBranch && hist.defaultBranch !== hist.branch ? ' · your change (the original’s main line is ' + hist.defaultBranch + ')' : '') },
        { k: jj ? 'Workspaces' : 'Worktrees', v: String(hist.worktrees || 0) },
        { k: 'Changes not saved', v: changed, tone: hist.changed ? 'warn' : null },
        hist.submodules && hist.submodules.length ? { k: W_('pg.hi.subs'), v: hist.submodules.join(', ') } : null,
        hist.lfs ? { k: W_('pg.hi.lfs'), v: W_('pg.hi.lfsVal', { size: hist.lfs }) } : null,
        hist.hooks && hist.hooks.length ? { k: W_('pg.hi.hooks'), v: hist.hooks.join(', ') } : null,
        hist.filesafe === false ? { k: 'FileSafe', v: 'Off' } : null
      ]), jj && lim.length ? textLine(W_('np.ver.jjLimitsChosen', { effects: PJX.np.andList(lim.map((x) => W_('np.ver.eff.' + x))) }), 'is-hint') : null],
      foot: [none
        ? act('Turn on history…', { cls: 'pmu-textbtn', icon: 'branch', key: 'p:histon', cmd: 'cmd.source_control.backend.select', run: () => route('History', 'Opens Source Control to start keeping versions of ' + p.name + '.') })
        : act(W_('pg.hi.open'), { cls: 'pmu-textbtn', icon: 'history', key: 'p:hist', cmd: 'cmd.source_control.history.open', off: p.where.missing ? 'Find the folder first' : null, onOff: () => goToProblem(p), run: () => route('History of ' + p.name, 'Opens Source Control’s history, ' + (jj ? 'with its bookmarks and workspaces.' : 'with its branches and worktrees.')) })]
    });
  }

  /* ------------------------------------------------------------------ forms in place: the same New Project parts, in a plate */
  /* a session over an existing Project: the online copy or the backup section, with that Project's facts */
  function formSession(p, kind) {
    // the Project is already added: its folder, on the computer that does its work (files on Home NAS read as Home NAS's)
    const fresh = PJX.np.start({ purpose: 'page', project: p.id, way: 'folder' });
    const d = fresh.d;
    // the computer that does the work is the Project's own (SIR-026); where its files are is a separate fact, which the
    // form reads from the Project itself (the NAS rule, the holder), never by moving the work to where the files are
    d.runsOn = p.runsOn || 'here'; d.name = p.name; d.nameTouched = true;
    d.folder.path = p.where.path;
    // the look is the Project's own facts: no second inspection
    const info = { history: p.history.backend, branch: p.history.branch, changed: p.history.changed || 0, online: kind === 'link' && p.online.found ? { service: p.online.found.service, repo: p.online.found.repo, remote: p.online.found.remote } : null };
    const tgt = PJX.np.lookTarget(fresh);
    if (tgt) fresh.ops['look:' + d.runsOn + ':' + tgt.route + ':' + tgt.holder + ':' + tgt.path] = { state: 'done', result: info, target: tgt };
    if (kind === 'link') d.online.mode = 'link_found';
    if (kind === 'add') d.online.mode = 'make';
    if (kind === 'backup-setup') { d.backup.dest = 'gdrive'; d.folderName = p.name; d.folderNameTouched = true; }
    // another place starts on a place this Project doesn't use yet (never on the one it already has)
    if (kind === 'backup-add') {
      const b = p.backup, used = [b.dest].concat((b.more || []).map((x) => x.dest));
      d.backup.dest = ['gdrive', 'onedrive', 'bucket'].find((x) => used.indexOf({ gdrive: 'Google Drive', onedrive: 'OneDrive', bucket: 'Amazon S3' }[x]) < 0) || 'server';
      d.folderName = p.name; d.folderNameTouched = true;
    }
    if (kind === 'backup-change') {
      const b = p.backup, fam = b.family || ({ 'Home NAS': 'local_nas', 'Google Drive': 'google_drive', OneDrive: 'onedrive' })[b.dest];
      d.backup.dest = fam === 'local_nas' ? 'nas' : fam === 'google_drive' ? 'gdrive' : fam === 'onedrive' ? 'onedrive' : /aws|b2|s3/.test(fam || '') ? 'bucket' : 'server';
      if (d.backup.dest === 'bucket' || d.backup.dest === 'server') d.backup.sub = fam;
      const lo = {}; (b.leaveOut || []).forEach((k) => { lo[k] = true; });
      Object.assign(d.backup, { include: b.include || 'all', leaveOut: lo, mode: b.mode || (b.schedule && /click/i.test(b.schedule) ? 'manual' : 'daily'), time: b.time || '2:00 AM', keep: b.keep === 'custom' ? 'custom' : 'standard',
        keepCustom: b.keepCustom ? Object.assign({}, b.keepCustom) : { d: 7, w: 4, m: 6 }, acc: Object.assign({}, b.locator || {}) });
      // a password or key is never brought back into a form: only that one is saved for this place
      Object.keys(d.backup.acc).forEach((k) => { if (/secret|password|session/i.test(k)) delete d.backup.acc[k]; });
      (PJX.rules.ACCESS[fam] || []).forEach((f) => { if (f[1] === 'password' && b.locator) d.backup.acc[f[0] + 'Typed'] = true; });
      d.folderName = p.name; d.folderNameTouched = true;
    }
    fresh.on(() => { if (C) render(); });
    return fresh;
  }
  function openForm(p, kind) {
    // Cancel and Save take the focus back to the button that opened the form
    const a = D.activeElement, opener = a && a.closest && a.closest('[data-c-key]') ? a.closest('[data-c-key]').getAttribute('data-c-key') : null;
    C.inplace[p.id] = { kind, opener, s: kind === 'computer' || kind === 'contribute' ? null : formSession(p, kind), sel: p.runsOn || 'here', fork: { owner: 'jared', branch: 'my-change', upstream: 'upstream' } };
    render();
    const plateKey = /^backup/.test(kind) ? 'backup' : kind === 'computer' ? 'where' : 'online';
    reveal('[data-plate="' + plateKey + '"]', 'button, input');
  }
  function closeForm(p) {
    const ip = C.inplace[p.id], opener = ip && ip.opener;
    delete C.inplace[p.id]; render();
    later(() => { const b = opener && C.root.querySelector('[data-c-key="' + cssEsc(opener) + '"]'); if (b) b.focus({ preventScroll: true }); else { const t = C.root.querySelector('[data-plate] .pmu-textbtn'); if (t) t.focus({ preventScroll: true }); } }, 30);
  }
  function formFoot(p, saveLabel, ok, why, run, cmd) {
    return h('div.pmu-cardfoot.pjxc-foot', null, h('span.pjx-grow'),
      act(W_('pg.on.cancel'), { cls: 'pmu-textbtn', key: 'f:cancel', run: () => closeForm(p) }),
      act(saveLabel, { cls: 'pmu-textbtn', primary: true, key: 'f:save', cmd: cmd || null, off: ok ? null : why, run: () => { run(); closeForm(p); } }));
  }
  function npBody(s, fn) { const box = slot('form:' + s.id, () => h('div.pjxc-form')); PJX.npui.render(box, () => box.replaceChildren(fn(s))); return box; }

  function onlinePlate(p) {
    const o = p.online || {}, op = opOf(p.id), syncing = op && (op.kind === 'sync' || op.kind === 'signin'), ip = C.inplace[p.id];
    if (ip && (ip.kind === 'add' || ip.kind === 'link')) {
      const s = ip.s, pr = PJX.np.problem(s, 'online'), m = PJX.np.onlineMode(s);
      // the record a save writes is the one New Project would make (makeProject): the same service, kind, server, owner,
      // team project, name and the visibility the service reported, never a guess
      const save = () => {
        const made = PJX.np.makeProject(s, 'listed').online;
        if (m === 'link_found' || m === 'link') PJX.ACT.linkOnline(p.id, { service: made.service || 'Git address', repo: made.repo, privacy: made.privacy, identity: { kind: made.kind, host: made.host, address: made.address, remote: made.remote } });
        else PJX.ACT.addOnline(p.id, { service: made.service, repo: made.repo, privacy: made.privacy, identity: { kind: made.kind, kindLabel: made.kindLabel, host: made.host, address: made.address, owner: made.owner, container: made.container, containerNoun: made.containerNoun, url: made.url, branch: made.branch, description: made.description } });
      };
      return plate('online', { icon: 'cloud', title: ip.kind === 'link' ? W_('pg.on.link').replace('…', '') : W_('pg.on.add').replace('…', ''), sub: p.name, inplace: true,
        body: [npBody(s, PJX.npui.secOnline)], footEl: formFoot(p, m === 'make' || m === 'instead' ? W_('pg.on.save.new') : W_('pg.on.save.link'), !pr, pr && pr.text, save, m === 'make' || m === 'instead' ? (s.d.online.service === 'github' ? 'cmd.project.new_github_repo' : 'cmd.forge.repository.create (gap: G1/G7)') : 'cmd.source_control.repository.bind') });
    }
    if (ip && ip.kind === 'contribute') {
      const f = ip.fork, bp = PJX.rules.branchProblem(f.branch), up = f.upstream, upBad = !/^[A-Za-z0-9._-]+$/.test(up) || up === 'origin';
      const U = PJX.npui;
      const body = h('div.pjxc-form', null, U.line('info', W_('np.access.contributeSub', { service: o.service })),
        U.group(W_('np.access.forkTo'), U.choices('pc:owner', [{ id: 'jared', glyph: 'user', title: W_('np.access.forkMine', { account: 'jared' }) }, { id: 'jared-labs', glyph: 'organisation', title: 'jared-labs', sub: 'Organization' }], f.owner, (v) => { f.owner = v; render(); }, { label: W_('np.access.forkTo') })),
        U.field(W_('np.access.branch'), U.input('pc:branch', f.branch, 'my-change', (v) => { f.branch = v; render(); }), W_('np.access.branchHint'), bp ? bp : ''),
        U.field(W_('np.fork.upstream'), U.input('pc:up', up, 'upstream', (v) => { f.upstream = v; render(); }), W_('np.fork.upstreamHint'), upBad ? W_('np.fork.upstreamBad') : ''),
        U.line('info', W_('np.rv.forkSays', { fork: f.owner + '/' + String(o.repo).split('/').pop(), service: o.service })), yoloAt(W_('np.yolo.fork', { service: o.service })));
      return plate('online', { icon: 'cloud', title: W_('np.access.contribute'), sub: o.repo, inplace: true, body: [body],
        footEl: formFoot(p, W_('pg.on.save.fork'), !bp && !upBad, bp || W_('np.fork.upstreamBad'), () => PJX.ACT.contribute(p.id, { fork: f.owner + '/' + String(o.repo).split('/').pop(), branch: f.branch, upstream: f.upstream }), 'cmd.forge.repository.fork + gap:add remote') });
    }
    if (!o.service) {
      const found = o.found;
      return plate('online', {
        icon: 'cloud', title: 'Online copy', sub: found ? W_('pg.on.found') : 'None',
        meta: found ? parts().st('info', W_('pg.on.found')) : parts().st('off', 'None'),
        body: [found ? facts([{ k: W_('pg.on.found'), v: W_('pg.on.foundValue', { service: found.service, project: found.repo }) }, { k: 'Link', v: found.remote || 'origin' }]) : textLine(W_('pg.on.noneLine', { where: p.where.kind === 'local' ? 'this computer' : p.where.label }))],
        foot: [found ? act(W_('pg.on.link'), { cls: 'pmu-textbtn', primary: true, icon: 'link', key: 'p:linkonline', cmd: 'cmd.source_control.repository.bind', run: () => openForm(p, 'link') }) : null,
          act(W_('pg.on.add'), { cls: 'pmu-textbtn', icon: 'cloud', key: 'p:addonline', cmd: 'cmd.project.new_github_repo | cmd.forge.repository.create (gap: G1/G7)', run: () => openForm(p, 'add') })]
      });
    }
    const waiting = o.state === 'waiting', up = o.upstream;
    const changes = o.behind ? o.behind + ' newer online' : o.ahead ? o.ahead + ' not sent yet' : 'Up to date';
    const cornerKey = up && up.behind ? 'info' : o.state;
    return plate('online', {
      icon: 'cloud', title: 'Online copy', sub: o.service + ' · ' + o.repo,
      meta: syncing ? parts().st('working', op.label) : cornerSays(cornerKey || 'complete') ? parts().st(cornerKey, waiting ? 'Sign in needed' : up && up.behind ? W_('pg.on.originalBehind', { n: up.behind }) : o.behind ? o.behind + ' newer' : o.ahead ? o.ahead + ' to send' : 'Up to date') : null,
      body: [syncing ? working(op) : null, facts([
        { k: 'Service', v: o.service + (o.kindLabel && o.kindLabel !== o.service && !/\.com$|Cloud$|Services$/.test(o.kindLabel) ? ' · ' + o.kindLabel : '') },
        o.host && o.address && !/github\.com|gitlab\.com|bitbucket\.org|dev\.azure\.com/.test(o.host) ? { k: W_('pg.on.where'), node: h('span.pjxc-code', { text: o.address, 'data-pmh-tag': 'literal' }) } : null,
        o.container ? { k: o.containerNoun || 'Project', v: o.container } : null,
        { k: 'Name', node: h('span.pjxc-code', { text: o.repo, 'data-pmh-tag': 'literal' }) },
        up ? { k: W_('pg.on.original'), v: up.repo + (up.behind ? ' · ' + W_('pg.on.originalBehind', { n: up.behind }) : ''), tone: up.behind ? null : null } : null,
        up ? { k: W_('pg.on.branch'), node: h('span.pjxc-code', { text: up.branch, 'data-pmh-tag': 'literal' }) } : o.branch ? { k: W_('pg.on.branch'), node: h('span.pjxc-code', { text: o.branch, 'data-pmh-tag': 'literal' }) } : null,
        o.readOnly ? { k: 'Sending changes', v: W_('pg.on.readOnly', { project: o.repo }) } : null,
        { k: 'Who can see it', v: o.privacy || W_('pg.on.privacyUnknown'), tone: o.privacy ? null : 'warn' },
        o.branch && !up && !o.team ? { k: W_('pg.on.mainBranch'), node: h('span.pjxc-code', { text: o.branch, 'data-pmh-tag': 'literal' }) } : null,
        o.description ? { k: W_('pg.on.description'), v: o.description } : null,
        waiting ? { k: 'Sign-in', v: 'Expired · SSH still works', tone: 'warn' } : null,
        { k: 'Changes', v: changes }
      ]),
      o.ahead && !waiting ? yoloAt(W_('np.yolo.push', { service: o.service })) : null,
      up && up.behind ? yoloAt(W_('np.yolo.original', { branch: up.branch || 'my-change' })) : null,
      up || o.branch ? yoloAt(W_('np.yolo.offer')) : null],
      foot: [
        waiting ? act('Sign in', { cls: 'pmu-textbtn', primary: true, icon: 'key', key: 'p:signin', cmd: 'cmd.forge.connection.reauthorize', off: syncing ? 'Signing in now' : null, run: () => PJX.ACT.signIn(p.id) }) : null,
        up && up.behind ? act(W_('pg.on.getOriginal'), { cls: 'pmu-textbtn', primary: true, icon: 'download', key: 'p:getorig', cmd: 'gap:fork sync', off: syncing ? 'Working on it' : null, run: () => PJX.ACT.getOriginal(p.id) }) : null,
        o.behind ? act('Get the latest', { cls: 'pmu-textbtn', primary: !(up && up.behind), icon: 'download', key: 'p:pull', cmd: p.history && p.history.backend === 'jujutsu' ? 'cmd.jujutsu.git.fetch' : 'cmd.source_control.remote.sync', off: syncing ? 'Working on it' : null, run: () => PJX.ACT.getLatest(p.id) }) : null,
        o.ahead && !waiting ? act('Send changes', { cls: 'pmu-textbtn', primary: true, icon: 'upload', key: 'p:push', cmd: p.history && p.history.backend === 'jujutsu' ? 'cmd.jujutsu.git.push' : 'cmd.source_control.remote.publish', off: syncing ? 'Working on it' : null, run: () => PJX.ACT.send(p.id) }) : null,
        up || o.branch ? act(W_('pg.on.offer'), { cls: 'pmu-textbtn', icon: 'pull-request', key: 'p:offer', cmd: up ? 'gap:cross-repository review' : 'cmd.forge.review.create', run: () => PJX.ACT.offerChanges(p.id) }) : null,
        o.readOnly ? act(W_('pg.on.contribute'), { cls: 'pmu-textbtn', icon: 'pull-request', key: 'p:contribute', cmd: 'cmd.forge.repository.fork', run: () => openForm(p, 'contribute') }) : null,
        act('Open on ' + o.service, { cls: 'pmu-textbtn', icon: 'globe', key: 'p:openonline', cmd: 'cmd.forge.repository.open_in_browser', run: () => PJX.ACT.openOnline(p.id) })
      ]
    });
  }
  function backupPlate(p) {
    const b = p.backup || {}, op = opOf(p.id), running = op && (op.kind === 'backup' || op.kind === 'protect'), ip = C.inplace[p.id];
    if (ip && /^backup/.test(ip.kind)) {
      const s = ip.s, pr = PJX.np.problem(s, 'backup');
      const taken = ip.kind === 'backup-add' ? [b.dest].concat((b.more || []).map((x) => x.dest)) : [];
      const plan = () => { const mk = PJX.np.makeProject(s, 'listed').backup; return Object.assign({}, mk, { testFail: false, access: /bucket|server/.test(s.d.backup.dest) }); };
      // an added place must be another place: the same family and place as one in use is refused at Save too
      const dupe = ip.kind === 'backup-add' && [b].concat(b.more || []).some((x) => x.dest === PJX.np.bkDestLabel(s) && (x.family === PJX.np.bkFamily(s) || !x.family));
      const label = ip.kind === 'backup-change' ? W_('pg.bk.save') : ip.kind === 'backup-add' ? W_('pg.bk.addPlace').replace('…', '') : W_('pg.bk.setup');
      const run = () => { if (ip.kind === 'backup-change') PJX.ACT.changeBackup(p.id, plan()); else PJX.ACT.setupBackupFull(p.id, plan(), { add: ip.kind === 'backup-add' }); };
      return plate('backup', { icon: 'safe', title: ip.kind === 'backup-add' ? W_('pg.bk.addPlace').replace('…', '') : ip.kind === 'backup-change' ? 'Change the backup' : W_('pg.bk.setup'), sub: ip.kind === 'backup-add' ? W_('pg.bk.addPlaceSub') : p.name, inplace: true,
        body: [npBody(s, (x) => PJX.npui.secBackup(x, { noNone: true, taken }))], footEl: formFoot(p, label, !pr && s.d.backup.dest !== 'none' && !dupe, dupe ? 'Already a backup place for this Project' : pr ? pr.text : 'Choose where backups go', run, ip.kind === 'backup-change' ? 'cmd.backup.destination.update + cmd.backup.policy.update' : 'cmd.backup.destination.add') });
    }
    if (!b.dest) {
      return plate('backup', {
        icon: 'safe', title: 'Backup', sub: running ? 'Setting up' : W_('pg.bk.none'),
        meta: running ? parts().st('working', op.label) : parts().st(p.lifecycle === 'archived' ? 'off' : 'warning', W_('pg.bk.none')),
        body: running ? [working(op)] : [textLine('Not backed up. Its history and online copy keep its files, but nothing keeps its plans, chats and settings.')],
        foot: running ? [] : [act(W_('pg.bk.setup'), { cls: 'pmu-textbtn', primary: true, icon: 'safe', key: 'p:setupbk', cmd: 'cmd.backup.destination.add', run: () => openForm(p, 'backup-setup') }),
          act('Restore as new…', { cls: 'pmu-textbtn', icon: 'history', key: 'p:restorenew', cmd: 'cmd.restore.project_as_new', off: 'There is no backup of it yet' })]
      });
    }
    const st0 = bkState(p), offline = st0.key === 'offline';
    const kit = b.kit ? W_('pg.bk.kitVal', { saved: b.kit.saved, checked: b.kit.checked || 'not yet' }) : W_('pg.bk.kitNone');
    const restoreMenu = (e, btnEl) => PJX.menu(btnEl, [{ label: W_('pg.bk.restore').replace('…', ''), items: [
      { label: W_('pg.bk.restoreNew'), icon: 'folder-plus', meta: W_('pg.bk.restoreNewSub'), disabled: b.last ? null : 'There is no complete backup yet', run: () => startNew({ way: 'restore', from: p.id, fresh: true }) },
      { label: W_('pg.bk.restoreHere'), icon: 'history', meta: W_('pg.bk.restoreHereSub'), disabled: b.last ? null : 'There is no complete backup yet', run: () => confirmRestoreHere(p) },
      { label: W_('pg.bk.tryRestore'), icon: 'check', meta: W_('pg.bk.tryRestoreSub'), disabled: b.last ? null : 'There is no complete backup yet', run: () => PJX.ACT.tryRestore(p.id) }
    ] }], { label: 'Restore ' + p.name });
    return plate('backup', {
      icon: 'safe', title: 'Backup', sub: b.dest + (b.schedule ? ' · ' + b.schedule.toLowerCase() : ''),
      meta: running ? parts().st('working', op.label) : cornerSays(st0.key) || b.state === 'complete' && false ? parts().st(st0.key, st0.word) : null,
      body: [running ? working(op) : null, offline ? textLine(W_('pg.bk.waitingLine', { device: p.where.device }), 'is-lead') : null, facts([
        { k: W_('pg.bk.last'), v: b.last ? b.last + (b.state === 'complete' ? ' · checked' : '') : b.state === 'scheduled' ? 'None yet · the first one is tonight at ' + (b.time || '2:00 AM') : 'None yet', tone: b.state === 'warning' ? 'warn' : null },
        b.note ? { k: b.state === 'warning' ? 'Problem' : 'Note', v: b.note, tone: b.state === 'warning' ? 'warn' : null } : null,
        { k: W_('pg.bk.where'), node: h('span.pjxc-code', { text: b.place || b.dest, 'data-pmh-tag': 'literal' }) },
        { k: W_('pg.bk.what'), v: W_(b.include === 'pm' ? 'np.bk.what.pm' : b.include === 'some' ? 'np.bk.what.some' : 'np.bk.what.all') },
        b.include === 'some' && b.leaveOut && b.leaveOut.length ? { k: W_('pg.bk.leftOut'), v: PJX.np.andList(b.leaveOut) } : null,
        { k: W_('pg.bk.whenK'), v: b.mode === 'manual' || /click/i.test(b.schedule || '') ? W_('np.bk.when.manual') : (b.schedule || 'Every day') + (b.time && b.state !== 'paused' ? ' at ' + b.time : '') },
        { k: W_('pg.bk.keeps'), v: b.keep === 'custom' && b.keepCustom ? W_('pg.bk.keepCustom', b.keepCustom) : W_('np.bk.keep.standard') },
        { k: W_('pg.bk.kit'), v: kit, tone: b.kit && b.kit.checked ? null : 'warn' },
        // checking a backup today doesn't make it newer: the loss is counted from the backup that was checked
        b.checked ? { k: W_('pg.bk.lastChecked'), v: W_('pg.bk.lastCheckedVal', { when: b.checked, of: lc(b.checkedOf || b.last || 'the last backup') }) } : null,
        b.previous ? { k: W_('pg.bk.previous'), v: W_('pg.bk.previousVal', { n: PJX.np.plural(b.previous.versions, 'backup'), dest: b.previous.dest, last: b.previous.last }) } : null,
        b.more && b.more.length ? { k: W_('pg.bk.alsoTo'), v: b.more.map((x) => x.dest + (x.state === 'setup' ? ' (not on yet)' : '')).join(', ') } : null,
        { k: W_('pg.bk.versions'), v: String(b.versions || 0) },
        b.size ? { k: W_('pg.bk.size'), v: b.size } : null
      ])],
      foot: [
        b.state === 'setup' ? act(W_('pg.bk.finish'), { cls: 'pmu-textbtn', primary: true, icon: 'safe', key: 'p:bkfinish', cmd: 'cmd.auth_profile.sign_in → cmd.backup.destination.test → cmd.backup.recovery_key.export → cmd.backup.recovery_key.test → cmd.backup.policy.update', run: () => { PJX.ACT.protectOpen(p.id); reveal('[data-plate="protect"]', '.pjx-btn.is-primary'); } }) : null,
        b.state !== 'setup' ? act(W_('pg.bk.now'), { cls: 'pmu-textbtn', primary: b.state === 'warning', icon: 'upload', key: 'p:bknow', cmd: 'cmd.backup.project.create', off: running ? 'Backing up now' : b.state === 'pending' ? 'Backups start after setup' : p.lifecycle === 'archived' ? 'Paused while archived' : p.where.missing ? 'Find the folder first' : offline ? 'Waiting for ' + p.where.device : null, onOff: () => goToProblem(p), run: () => PJX.ACT.backupNow(p.id) }) : null,
        act(W_('pg.bk.history'), { cls: 'pmu-textbtn', icon: 'history', key: 'p:bkhist', cmd: 'cmd.backup.open_history', run: () => PJX.ACT.backupHistory(p.id) }),
        act(W_('pg.bk.change'), { cls: 'pmu-textbtn', icon: 'settings', key: 'p:bkchange', cmd: 'cmd.backup.destination.update + cmd.backup.policy.update', off: running ? 'Working on it' : null, run: () => openForm(p, 'backup-change') }),
        (() => { const r = act(W_('pg.bk.restore'), { cls: 'pmu-textbtn', icon: 'history', chev: true, key: 'p:bkrestore', cmd: 'cmd.restore.preview', run: restoreMenu }); r.setAttribute('aria-haspopup', 'menu'); return r; })(),
        act(W_('pg.bk.kitCheck'), { cls: 'pmu-textbtn', icon: 'key', key: 'p:kit', cmd: 'cmd.backup.recovery_key.test', off: b.kit ? null : 'Save the Recovery Kit first', run: () => checkKitDialog(p) }),
        act(W_('pg.bk.addPlace'), { cls: 'pmu-textbtn', icon: 'plus', key: 'p:bkadd', cmd: 'cmd.backup.destination.add', off: running ? 'Working on it' : b.state === 'setup' ? 'Finish setting up this place first' : null, run: () => openForm(p, 'backup-add') })
      ]
    });
  }
  /* Put this Project back as it was: the backup it comes from, what comes back (what that backup holds), what changes, and
     the safe point first; then the named button. Replacing files still asks in YOLO */
  function confirmRestoreHere(p) {
    const b = p.backup, ch = (p.history && p.history.changed) || 0, demo = { fail: false };
    // "2 h ago", "today, 2:00 AM", "on Oct 3": the backup's time read as a sentence
    const when = /ago$/.test(b.last) || /^(Today|Yesterday)/.test(b.last) ? lc(b.last) : 'on ' + b.last;
    const comes = b.include === 'pm' ? W_('pg.bk.rh.pm', { when }) : b.include === 'some' && (b.leaveOut || []).length ? W_('pg.bk.rh.some', { when, list: PJX.np.andList(b.leaveOut) }) : W_('pg.bk.rh.all', { when });
    const body = h('div', null, h('p.pjx-q-lead', { text: W_('pg.bk.restoreHereConfirm', { name: p.name, when }) }),
      PJX.flow.facts([{ key: 'info', text: W_('pg.bk.rh.which', { when: b.last + ' · ' + b.dest }) }, { key: 'complete', text: comes },
        { key: ch ? 'warning' : 'info', text: ch && b.include !== 'pm' ? W_('pg.bk.rh.changes', { n: ch }) : W_('pg.bk.rh.noChanges') }, { key: 'info', text: W_('pg.bk.rh.safeFirst') }, { key: 'info', text: 'Passwords and keys never come back from a backup.' }]),
      PJX.npui.check('rh:demo', W_('pg.bk.rh.demo'), false, (v) => { demo.fail = v; }));
    PJX.yes({ title: W_('pg.bk.restoreHere').replace('…', ''), kicker: p.name, body, wide: true, okLabel: 'Put it back', guard: W_('np.yolo.restore'),
      ok: () => PJX.ACT.restoreInPlace(p.id, { safePointFails: demo.fail }) });
  }
  /* Check Recovery Kit: confirm it's you first (BRS: a kit test is a human-only step-up), then the kit file, then the
     Backup owner opens the backup with it. Cancelling reads nothing. YOLO still stops here */
  function checkKitDialog(p) {
    let step = 'stepup', dlg = null;
    const body = h('div');
    const paint = () => {
      const U = PJX.npui;
      body.replaceChildren(h('p.pjx-q-lead', { text: W_('pg.kit.lead') }),
        step === 'stepup' ? U.line('waiting', W_('pg.kit.stepLead')) : PJX.flow.facts([{ key: 'complete', text: W_('pg.kit.confirmed') }, { key: 'complete', text: W_('pg.kit.found', { name: p.name }) }]),
        step === 'kit' ? U.hint('Concept demo: “Try a different kit” is refused.', 'is-concept') : null,
        U.yoloLine(W_('np.yolo.kit'), { asks: true }));
      dlg.setActions(step === 'stepup'
        ? [{ spacer: true }, { label: 'Cancel', run: () => { dlg.close('cancel'); PJX.toast(W_('pg.kit.cancelled'), '', 'info'); } }, { label: W_('np.prot.s3StepUp'), primary: true, icon: 'lock', run: () => { step = 'kit'; paint(); } }]
        : [{ label: 'Try a different kit', quiet: true, run: () => { dlg.close('bad'); PJX.ACT.checkKit(p.id, true); } }, { spacer: true }, { label: 'Cancel', run: () => { dlg.close('cancel'); PJX.toast(W_('pg.kit.cancelled'), '', 'info'); } }, { label: W_('np.prot.s4Go'), primary: true, run: () => { dlg.close('ok'); PJX.ACT.checkKit(p.id, false); } }]);
      later(() => { const f = dlg.el.querySelector('.pjx-dlg-foot .pjx-btn.is-primary'); if (f) f.focus({ preventScroll: true }); }, 20);
    };
    dlg = PJX.dialog({ title: W_('pg.kit.title', { name: p.name }), kicker: 'Backup', body, returnFocus: () => { const b = C && C.root.querySelector('[data-c-key="p:kit"]'); if (b) b.focus(); } });
    paint();
  }
  /* Delete the repository on the service: its own confirmation, the name typed, never part of resume; asks in YOLO too */
  function deleteRemoteDialog(p) {
    const repo = p.online.repo, svc = p.online.service;
    let typed = '', dlg = null;
    const inp = PJX.flow.textInput('', repo, (v) => { typed = v; paint(); });
    const body = h('div', null, h('p.pjx-q-lead', { text: W_('pg.rs.deleteLead', { repo, service: svc }) }), PJX.flow.field(W_('pg.rs.deleteType', { repo }), inp), PJX.npui.yoloLine(W_('np.yolo.deleteRemote', { service: svc }), { asks: true }));
    const paint = () => dlg && dlg.setActions([{ spacer: true }, { label: 'Cancel', run: () => dlg.close('cancel') }, { label: W_('pg.rs.deleteGo', { service: svc }), danger: true, icon: 'trash', disabled: typed.trim() !== repo ? 'Type the name first' : null, run: () => { dlg.close('ok'); PJX.ACT.deleteRemote(p.id); } }]);
    dlg = PJX.dialog({ title: W_('pg.rs.deleteTitle', { repo, service: svc }), kicker: 'Setup didn’t finish', body });
    paint();
  }
  /* Review setup again: what setup was asked to do, what is done and what is left, read only */
  function reviewSetupDialog(p) {
    const rec = p.recovery;
    const body = h('div', null, h('p.pjx-q-lead', { text: W_('pg.rs.reviewLead') }),
      PJX.flow.group('Already done', PJX.flow.facts(rec.settled.map((x) => ({ key: 'complete', text: x.label + (x.ref ? ' · ' + x.ref : '') })).concat(rec.settled.length ? [] : [{ key: 'info', text: 'Nothing yet' }]))),
      PJX.flow.group('Still to do', PJX.flow.facts(rec.remaining.map((x) => ({ key: 'pending', text: x.label + ' · ' + x.cmd })))));
    const dlg = PJX.dialog({ title: W_('pg.rs.reviewTitle', { name: p.name }), kicker: 'Setup didn’t finish', body, wide: true, actions: [{ spacer: true }, { label: 'Close', run: () => dlg.close('close') }, { label: 'Continue setup', primary: true, icon: 'play', run: () => { dlg.close('ok'); PJX.ACT.resume(p.id); } }] });
  }
  /* which computers can reach a Project's files (the demo's reach rule; canon names the check, spec 19 #11) */
  function canReach(c, p) {
    // the computer doing the work now reaches the files, or it couldn't be doing the work (never "current and can't reach")
    if (c === (p.runsOn || 'here')) return true;
    // files on this computer: this computer, and a Server this computer shares them with (New Project's "On this computer")
    if (p.where.kind === 'local') return c === 'here' || (p.where.reach || []).indexOf(c) >= 0;
    const d0 = PJX.ENV.devices.find((x) => x.name === p.where.device);
    if (!d0) return c === 'here';
    if (d0.id === 'nas') return true;
    return (PJX.ENV.reach[c] || []).indexOf(d0.id) >= 0 || !!PJX.S.world.facts.trusted[c + ':' + d0.id];
  }
  function wherePlate(p) {
    const w0 = p.where, op = opOf(p.id), offline = (p.attention || []).some((a) => a.code === 'device_offline'), ip = C.inplace[p.id];
    const moving = op && ['relocate', 'move', 'restore', 'retry', 'computer'].indexOf(op.kind) >= 0;
    const comp = PJX.np.comp(p.runsOn || 'here');
    if (ip && ip.kind === 'computer') {
      const U = PJX.npui;
      const items = PJX.ENV.computers.map((c) => ({ id: c.id, title: c.name, sub: c.id === 'here' ? c.detail : W_('np.loc.serverSub'), off: canReach(c.id, p) ? null : W_('pg.wh.cant', { computer: c.name, path: w0.path }) }));
      const body = h('div.pjxc-form', null, U.line('info', W_('pg.wh.changeLead')), U.group(W_('pg.wh.runsOn'), U.seg('pw:runs', items, ip.sel, (v) => { ip.sel = v; render(); }, W_('pg.wh.runsOn'))),
        ...items.filter((x) => x.off).map((x) => U.line('off', x.off)),
        w0.kind === 'local' && ip.sel === 'homenas' && canReach('homenas', p) ? U.line('info', W_('np.loc.onDeviceWarn', { server: 'Home NAS' })) : null,
        yoloAt(W_('np.yolo.computer')));
      return plate('where', { icon: 'server', title: W_('pg.wh.changeTitle'), sub: p.name, inplace: true, body: [body],
        footEl: formFoot(p, W_('pg.wh.save'), ip.sel !== (p.runsOn || 'here') && canReach(ip.sel, p), ip.sel === (p.runsOn || 'here') ? 'It already does the work' : 'It can’t reach the files', () => PJX.ACT.changeComputer(p.id, ip.sel), 'cmd.project.execution_host.select') });
    }
    const st = moving ? ['working', op.label] : w0.missing ? ['blocked', 'Missing'] : offline ? ['offline', 'Not answering'] : w0.pending ? ['pending', 'Not made yet'] : ['complete', 'Found'];
    const devs = p.sync && p.sync.devices;
    const devRec = PJX.ENV.devices.find((x) => x.name === w0.device);
    const kept = w0.kind === 'local' ? 'This computer · ' + PJX.np.comp('here').free + ' free' : devRec && devRec.online === false ? w0.device + ' · not answering' : w0.device + (devRec && devRec.id === 'nas' ? ' · /volume1 · 3.1 TB free' : '');
    // each way of reaching the files in its own words (SSH, SMB, NFS, a connected drive, Puppet Master on the device)
    const reached = w0.kind === 'local' ? ((w0.reach || []).indexOf(p.runsOn) >= 0 && p.runsOn !== 'here' ? W_('pg.wh.shared', { computer: comp.name }) : W_('pg.wh.direct')) : w0.via === 'Puppet Master' ? W_('pg.wh.pm', { device: w0.device })
      : /SMB/.test(w0.via || '') ? W_('pg.wh.smb') : /NFS/.test(w0.via || '') ? W_('pg.wh.nfs') : /connected drive|drive/i.test(w0.via || '') ? W_('pg.wh.drive') : /SSH/.test(w0.via || '') ? W_('pg.wh.ssh') : W_('pg.wh.other', { via: w0.via || 'the network' });
    return plate('where', {
      icon: w0.kind === 'local' ? 'desktop' : 'server', title: 'Where it lives', sub: w0.label + (w0.via ? ' · over ' + w0.via : ''),
      meta: cornerSays(st[0]) ? parts().st(st[0], st[1]) : null,
      body: [moving ? working(op) : null, facts([
        { k: W_('pg.wh.runsOn'), v: comp.name + (comp.id === 'here' ? ' (' + comp.detail + ')' : ' (your Puppet Master server)') },
        { k: W_('pg.wh.folder'), node: midPath(w0.path), tone: w0.missing ? 'crit' : null },
        { k: W_('pg.wh.keptOn'), v: kept, tone: offline ? 'warn' : null },
        { k: W_('pg.wh.reached'), v: reached },
        { k: W_('pg.wh.devices'), v: devs ? 'Seen on ' + devs + ' device' + (devs > 1 ? 's' : '') : 'Not shared yet' }
      ])],
      foot: [
        w0.missing
          ? act('Find the folder…', { cls: 'pmu-textbtn', primary: true, icon: 'folder-search', key: 'p:find', cmd: 'cmd.project.source_location.test → cmd.project.source_location.update', run: () => PJX.emit('need-repair', { id: p.id }) })
          : act('Move or change folder…', { cls: 'pmu-textbtn', icon: 'move', key: 'p:move', cmd: 'cmd.project.source_location.update', off: w0.pending ? 'Setup hasn’t made the folder yet' : moving ? 'Working on it' : null, run: () => PJX.emit('need-repair', { id: p.id, move: true }) }),
        act('Show in file manager', { cls: 'pmu-textbtn', icon: 'folder', key: 'p:reveal', cmd: 'cmd.file.reveal', off: w0.missing ? 'The folder is missing' : offline ? (w0.device || 'The device') + ' isn’t answering' : w0.pending ? 'Setup hasn’t made the folder yet' : null, run: () => PJX.ACT.reveal(p.id) }),
        act('Copy path', { cls: 'pmu-textbtn', icon: 'copy', key: 'p:copy', cmd: 'cmd.file.copy_full_path', run: () => PJX.ACT.copyPath(p.id) }),
        act(W_('pg.wh.change'), { cls: 'pmu-textbtn', icon: 'server', key: 'p:computer', cmd: 'cmd.project.execution_host.select', off: moving ? 'Working on it' : w0.missing ? 'Find the folder first' : null, run: () => openForm(p, 'computer') }),
        act(W_('pg.wh.move'), { cls: 'pmu-textbtn', icon: 'move', key: 'p:movecomputer', cmd: 'cmd.project.move.preflight', run: () => PJX.ACT.moveComputer(p.id) })
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
      foot: [h('span.pjx-grow'), act(it.label, { cls: 'pmu-textbtn', danger: true, icon: 'trash', key: 'p:delete', cmd: 'cmd.project.delete_data', off: it.disabled || null, run: it.run })]
    });
  }
  /* "Finish protecting your work": the backup's steps, in onboarding's order, on the new Project's page (6.12.3) */
  function protectPlate(p) {
    const b = p.backup, stp = b.setup, tgt = stp.target != null ? b.more[stp.target] : b;
    const done = stp.steps.filter((x) => x === 'done').length;
    return plate('protect', {
      cls: 'pjxc-protectplate', icon: 'safe', tone: stp.done ? null : 'attention', title: W_('np.prot.title'), sub: tgt.dest + ' · ' + (stp.done ? 'done' : 'step ' + Math.min(5, done + 1) + ' of 5'),
      meta: opOf(p.id) && opOf(p.id).kind === 'protect' ? parts().st('working', opOf(p.id).label) : null,
      body: [PJX.npui.protectSteps(p)],
      foot: stp.done ? [h('span.pjx-grow'), act(W_('np.done.ok'), { cls: 'pmu-textbtn', key: 'prot:ok', run: () => { stp.open = false; render(); } })]
        : [act(W_('np.prot.later'), { cls: 'pmu-textbtn', quiet: true, key: 'prot:later', run: () => PJX.ACT.protectLater(p.id) })]
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
    const protect = p.backup && p.backup.setup && p.backup.setup.open;
    if (protect) items.push(protectPlate(p));
    if (p.where.missing || C.repairOpen[p.id]) items.push(repairPlate(p));
    if (p.recovery) items.push(resumePlate(p));
    (p.attention || []).filter((a) => a.code !== 'folder_missing' && a.code !== 'setup_unfinished' && !(protect && a.code === 'backup_unfinished'))
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
  const NPS = () => PJX.np;
  const wayOf = (id) => NPS().WAYS.find((x) => x.id === id) || null;
  const verbOf = (way) => NPS().VERB[way] || NPS().VERB.new;
  /* New Project with nothing asked of it goes back to the draft you left, exactly as it was. A request for a particular
     beginning (a way, "like this", a pasted link, Restore as new, a chat) starts a fresh one, and asks first when that
     would clear answers you gave. */
  function startNew(opts, quiet) {
    opts = opts || {};
    const explicit = !!(opts.way || opts.like || opts.text || opts.from || opts.device || opts.chat || opts.folder);
    if (C.s && !opts.fresh) {
      if (!explicit || (C.commit && C.commit.running)) {
        resumeDraft(quiet);
        if (explicit) PJX.toast(W_('np.oneAtATime.title'), W_('np.oneAtATime.text', { name: NPS().nameOf(C.s) || 'Your new Project' }), 'info');
        return;
      }
      if (draftWorth()) { confirmFresh(opts); return; }
    }
    if (C.mode !== 'new') C.prevSel = C.sel;
    C.mode = 'new'; C.commit = null; C.drawer = false; C.swap = true;
    const like = opts.like && PJX.get(opts.like) ? opts.like : null;
    const s = NPS().start({ way: opts.way, text: opts.text, like, device: opts.device, from: opts.from, chat: opts.chat, folder: opts.folder });
    C.s = s;
    C.view = s.d.way ? 'steps' : 'launcher';
    C.pasteText = opts.text || '';
    if (C.els.paste) C.els.paste.value = C.pasteText;
    s.on(() => { if (C && C.s === s) { soon(); sayLook(s); agentTick(s); } });
    if (C.els.scroll) C.els.scroll.scrollTop = 0;
    if (quiet) return;
    render();
    focusNew();
  }
  /* one sentence when the look inside finishes (spec 15): "Looked inside budget-tracker: Git on main, linked to GitHub
     jared/budget-tracker, 2 changes not saved." */
  function sayLook(s) {
    const o = NPS().look(s); if (!o || o.state !== 'done' || !o.target) return;
    const key = o.target.holder + ':' + o.target.path; if (s.ui.saidLook === key) return;
    s.ui.saidLook = key;
    const i = o.result, bits = [];
    bits.push(i.history ? (i.history === 'jujutsu' ? 'Jujutsu' : 'Git') + ' on ' + i.branch : 'no saved versions yet');
    if (i.online) bits.push('linked to ' + (i.online.service ? i.online.service + ' ' + i.online.repo : i.online.address));
    if (i.changed) bits.push(i.changed + ' change' + (i.changed > 1 ? 's' : '') + ' not saved');
    if (i.submodules && i.submodules.length) bits.push(i.submodules.length + ' submodules');
    if (i.lfs) bits.push('Git LFS');
    if (i.known) bits.push('already a Project');
    announce(W_('np.look.said', { folder: String(o.target.path).split('/').pop(), facts: bits.join(', ') }));
  }
  function resumeDraft(quiet) {
    if (C.mode !== 'new') C.prevSel = C.sel;
    C.mode = 'new'; C.drawer = false; C.swap = true;
    if (C.els.scroll) C.els.scroll.scrollTop = 0;
    if (quiet) return;
    render();
    focusNew();
  }
  /* where the keyboard lands in New Project: the paste field on the launcher, else the open section's first field */
  function focusNew() {
    later(() => {
      if (!C || C.mode !== 'new') return;
      if (C.view === 'launcher') { C.els.paste.focus({ preventScroll: true }); return; }
      const sec = C.els.steps.querySelector('.pjx-np-sec[data-state="open"]');
      const f = sec ? sec.querySelector('.pjx-np-body input:not([type="checkbox"]), .pjx-np-body .pjx-choice.is-on, .pjx-np-body .pjx-choice:not(.is-off), .pjx-np-body button') : C.root.querySelector('[data-c-key="rv:go"]');
      if (f) f.focus({ preventScroll: true });
      if (sec) reveal('.pjxc-stepsin [data-step="' + cssEsc(sec.getAttribute('data-step')) + '"]');
    }, 40);
  }
  /* a different beginning would clear the answers in the draft: say what goes, and let the person keep it */
  function confirmFresh(opts) {
    const d = C.s.d, way = wayOf(d.way);
    const what = [(NPS().nameOf(C.s) || '').trim(), way ? way.title : null].filter(Boolean).join(' · ') || 'the link you pasted';
    const dlg = PJX.dialog({
      title: W_('np.fresh.title'), kicker: W_('np.head.title'),
      body: h('div', null, h('p.pjx-q-lead', { text: W_('np.fresh.lead', { what }) })),
      actions: [{ spacer: true },
        { label: W_('np.fresh.keep'), run: () => { dlg.close('keep'); resumeDraft(); } },
        { label: W_('np.fresh.go'), primary: true, run: () => { dlg.close('ok'); startNew(Object.assign({}, opts, { fresh: true })); } }]
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
    D.documentElement.removeAttribute('data-pjx-roomy');
    if (!draftWorth()) { C.s = null; C.commit = null; }
    C.mode = 'project'; C.swap = true;
    if (!PJX.get(C.prevSel)) C.prevSel = null;
    C.sel = C.prevSel || C.sel;
    render();
    later(() => C.els.newBtn.offsetParent ? C.els.newBtn.focus() : focusTitle(), 0);
  }
  /* a way card: the same way goes back to its page; another way asks first when it would clear answers (6.0) */
  function chooseWay(id) {
    const s = C.s; if (!s) return;
    const go = () => {
      NPS().chooseWay(s, id, true);
      if (id === 'chat' && !s.d.chat.id) s.d.chat.id = (PJX.ENV.chats[0] || {}).id;
      C.view = 'steps'; C.swap = true; C.els.scroll.scrollTop = 0;
      render(); focusNew();
    };
    if (s.d.way && s.d.way !== id) {
      const loss = NPS().wayLoss(s);
      if (loss.length) {
        const dlg = PJX.dialog({ title: W_('np.begins.anotherConfirm.title'), kicker: W_('np.head.title'),
          body: h('div', null, h('p.pjx-q-lead', { text: W_('np.begins.anotherConfirm.lead', { way: wayOf(s.d.way).title, list: NPS().andList(loss) }) })),
          actions: [{ spacer: true }, { label: W_('np.begins.anotherConfirm.keep'), run: () => { dlg.close('keep'); C.view = 'steps'; render(); } }, { label: W_('np.begins.anotherConfirm.go'), primary: true, run: () => { dlg.close('ok'); go(); } }] });
        return;
      }
    }
    go();
  }
  function fromText() {
    const t = C.pasteText.trim(), d = NPS().detect(t); if (!d) return;
    const like = C.s && C.s.d.like.source !== 'usual' ? C.s.d.like.source : null;
    startNew({ text: t, like });
  }
  function renderHeadNew() {
    const E = C.els, s = C.s, empty = !PJX.all().length, way = s && wayOf(s.d.way);
    const steps = C.view === 'steps' && way;
    const running = C.commit && C.commit.running;
    const back = steps && !running ? act(W_('np.page.allWays'), { icon: 'chevron-left', key: 'h:back', tip: W_('np.page.allWays.tip'), run: () => { C.view = 'launcher'; C.swap = true; render(); later(() => { const b = C.root.querySelector('[data-c-key="way:' + s.d.way + '"]'); if (b) b.focus(); }, 30); } }) : null;
    // Close keeps the answers: the draft waits at the top of the library (Start over, in the questions, clears them)
    const cancel = empty ? null : act(W_('np.close'), { icon: 'close', key: 'h:cancel', tip: running ? W_('np.close.tipRunning') : W_('np.close.tip'), run: () => closeNew() });
    // on a very narrow pane Close keeps only its close mark (a universal), named for the screen reader and its hover label
    if (cancel) { cancel.setAttribute('aria-label', W_('np.close')); cancel.classList.add('pjxc-can-shrink'); }
    if (C.narrow) { fill(E.head, projectsBtn(), h('span.pjx-grow'), back, cancel, roomBtn()); return; }
    const nm = s && steps ? String(NPS().nameOf(s) || '').trim() : '';
    const title = empty && !steps ? W_('np.head.titleFirst') : nm || W_('np.page.title');
    const sub = steps ? W_('np.page.sub', { way: way.title, verb: s.d.way === 'chat' ? W_('np.rv.goChat') : verbOf(s.d.way)[0] }) : empty ? W_('np.head.subFirst') : W_('np.head.sub');
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
      E.paste = h('input.pjxc-paste-in', { type: 'text', autocomplete: 'off', spellcheck: 'false', 'data-c-key': 'paste', placeholder: W_('np.paste.ph'), 'aria-label': W_('np.paste.aria'), 'aria-describedby': 'pjxc-detect' });
      E.paste.addEventListener('input', () => { C.pasteText = E.paste.value; paintDetect(); });
      E.paste.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); fromText(); }
        else if (e.key === 'Escape' && E.paste.value) { e.preventDefault(); E.paste.value = ''; C.pasteText = ''; paintDetect(); }
      });
      E.pasteField = h('div.pjxc-pastefield', null, h('span.pjxc-pasteico', { html: icon('link', 18), 'aria-hidden': 'true' }), E.paste);
      E.detect = h('div.pjxc-detect', { id: 'pjxc-detect', role: 'status' });
    }
    if (D.activeElement !== E.paste) E.paste.value = C.pasteText;
    setAttr(E.paste, 'placeholder', C.narrow ? W_('np.paste.phNarrow') : PJX.stepped() ? W_('np.paste.phStepped') : W_('np.paste.ph'));
    const empty = !PJX.all().length;
    const like = s && s.d.like.source !== 'usual' && PJX.get(s.d.like.source);
    syncChildren(card, [
      C.narrow ? h('h2.pjxc-title.pjxc-title-in', { tabindex: '-1', text: empty ? W_('np.head.titleFirst') : W_('np.head.title') }) : null,
      C.narrow && !empty ? h('p.pjxc-welcome', { text: W_('np.paste.ph') + '.' }) : null,
      empty ? h('p.pjxc-welcome', { text: W_('np.paste.welcome') }) : null,
      E.pasteField, E.detect,
      like ? h('p.pjxc-likenote', null, h('span', { html: icon('swap', 13), 'aria-hidden': 'true' }), h('span', { text: W_('np.paste.likeNote', { project: like.name }) })) : null
    ]);
    paintDetect();
    return card;
  }
  /* live recognition under the paste field (PJX.np.detect) */
  function paintDetect() {
    const E = C.els, t = C.pasteText.trim(), d = t ? NPS().detect(t) : null;
    if (d) {
      const way = wayOf(d.way);
      const go = act(W_('np.paste.go'), { primary: true, icon: 'arrow-right', key: 'paste:go', run: () => fromText() });
      fill(E.detect, h('span.pjx-st-mark', { html: PJX.calm('complete', 14), 'aria-hidden': 'true' }),
        h('span.pjxc-detect-text', null, h('b', { text: d.say }), way ? h('span', { text: way.title }) : null), go);
      E.detect.setAttribute('data-state', 'found');
    } else if (t) {
      fill(E.detect, h('span.pjx-st-mark', { html: PJX.calm('info', 14), 'aria-hidden': 'true' }),
        h('span.pjxc-detect-text', null, h('b', { text: W_('np.detect.notYet') }), h('span', { text: W_('np.detect.notYetHelp') })));
      E.detect.setAttribute('data-state', 'unknown');
    } else {
      const tries = ['github.com/jared/garden-planner', 'github.com/maplecraft/plant-journal', '~/Code/game-jam', 'jared@studio.local:~/Developer/lighting-rig'];
      fill(E.detect, h('span.pjxc-detect-try', { text: W_('np.paste.try') }), ...tries.map((x, i) => {
        const b = h('button.pjx-link.pjxc-try', { type: 'button', text: x, 'data-c-key': 'try:' + i, 'data-pmh-tag': 'literal' });
        b.addEventListener('click', () => { C.pasteText = x; E.paste.value = x; paintDetect(); E.paste.focus(); });
        return b;
      }));
      E.detect.setAttribute('data-state', 'empty');
    }
  }
  function wayCards() {
    const s = C.s, grid = slot('new:ways', () => h('div.pjxc-ways', { role: 'group', 'aria-label': 'How it begins' }));
    const ways = NPS().WAYS.filter((x) => x.id !== 'chat' || (PJX.ENV.chats || []).length);
    const cards = ways.map((x) => {
      const b = slot('new:way:' + x.id, () => { const el = h('button.pmu-card.pjxc-way', { type: 'button', 'data-lg-surface': 'card', 'data-way': x.id, 'data-c-key': 'way:' + x.id }); el.addEventListener('click', () => chooseWay(x.id)); return el; });
      b.setAttribute('aria-pressed', String(!!(s && s.d.way === x.id)));
      const sub = x.id === 'folder' && NPS().serverOn() ? W_('np.way.folderSubServer', { server: 'Home NAS' }) : x.sub;
      fill(b, h('span.pjxc-way-ico', { html: icon(x.glyph, 24), 'aria-hidden': 'true' }),
        h('span.pjxc-way-text', null, h('span.pjxc-way-title', { text: x.title }), h('span.pjxc-way-sub', { text: sub })),
        x.tag ? h('span.pjxc-way-tag', { text: x.tag }) : x.id === 'chat' ? h('span.pjxc-way-tag', { text: 'Concept · no-project' }) : null,
        h('span.pjxc-way-go', { html: icon('arrow-right', 16), 'aria-hidden': 'true' }));
      return b;
    });
    syncChildren(grid, cards);
    return grid;
  }
  /* the way that is not here yet: one quiet line that says why and offers what works instead */
  function importLine() {
    const el = slot('new:more', () => h('div.pjxc-more'));
    fill(el, h('span.pjxc-more-ico', { html: icon('download', 16), 'aria-hidden': 'true' }),
      h('span.pjxc-more-text', null, h('b', { text: W_('np.import') }), h('span', { text: W_('np.importSub') })),
      act(W_('np.importGo'), { cls: 'pjx-link', key: 'more:folder', run: () => chooseWay('folder') }));
    return el;
  }

  /* ------------------------------------------------------------------ New Project: the guided page beside a live Review */
  /* open a section and focus the field a problem names (a Review row's Change, the first-problem line, Continue) */
  function goToSection(id, fieldKey, head) {
    const s = C.s; if (!s) return;
    if (C.commit && !C.commit.running) C.commit = null;
    if (s.ui.open !== id) NPS().open(s, id); else render();
    later(() => {
      const sec = C.els.steps.querySelector('[data-step="' + cssEsc(id) + '"]'); if (!sec) return;
      reveal('.pjxc-stepsin [data-step="' + cssEsc(id) + '"]');
      if (head) { const hb = sec.querySelector('.pjx-np-head'); if (hb) { hb.focus({ preventScroll: true }); return; } }
      const byKey = fieldKey ? sec.querySelector('[data-pjx-key="' + cssEsc(fieldKey) + '"], [data-c-key^="' + cssEsc(fieldKey) + '"], [data-np-group="' + cssEsc(fieldKey) + '"] .pjx-choice') : null;
      const f = byKey || sec.querySelector('.pjx-np-body input:not([type="checkbox"]), .pjx-np-body .pjx-choice.is-on, .pjx-np-body .pjx-choice:not(.is-off), .pjx-np-body button');
      if (f) f.focus({ preventScroll: true });
    }, 60);
  }
  function stepsCard() {
    const E = C.els, s = C.s, way = wayOf(s.d.way) || {};
    const card = slot('new:steps', () => h('section.pmu-card.pjxc-steps', { 'data-lg-surface': 'card', 'aria-label': 'Questions' }));
    if (!E.steps) E.steps = h('div.pjxc-stepsin');
    const running = !!(C.commit && C.commit.running);
    const begins = h('div.pjxc-begins', null,
      h('span.pjxc-begins-ico', { html: icon(way.glyph || 'seed', 20), 'aria-hidden': 'true' }),
      h('span.pjxc-begins-text', null, h('span.pjxc-cap', { text: W_('np.begins.cap') }), h('b', { text: way.title || '' })),
      h('span.pjxc-begins-acts', null,
        act(W_('np.begins.another'), { cls: 'pjx-link', key: 'steps:way', off: running ? W_('np.begins.busy') : null, run: () => { C.view = 'launcher'; C.swap = true; render(); } }),
        act(W_('np.begins.over'), { cls: 'pjx-link', key: 'steps:over', off: running ? W_('np.begins.busy') : null, tip: W_('np.begins.over.tip'), run: () => startOver() })));
    // from a chat, the other choice is always in sight, whichever section is open (NOPROJECT 7.2)
    const ch = s.d.way === 'chat' ? PJX.np.chatOf(s.d.chat.id) : null;
    const making = ch ? h('div.pjxc-making', null, PJX.npui.line('info', W_('np.chat.making', { chat: ch.title }), { after: act(W_('np.chat.instead'), { cls: 'pjx-link', key: 'steps:instead', run: () => chooserExisting(ch) }) })) : null;
    syncChildren(card, [begins, making, E.steps]);
    const sc = E.scroll.scrollTop;
    PJX.npui.render(E.steps, () => PJX.npui.sections(s, E.steps, {
      focusField: (id, f) => goToSection(id, f),
      afterContinue: (next) => { if (next) goToSection(next, null, true); else later(() => { const g = C.root.querySelector('[data-c-key="rv:go"]'); if (g) g.focus({ preventScroll: true }); }, 60); },
      onInstead: (c) => chooserExisting(c)
    }));
    E.scroll.scrollTop = sc;
    E.steps.inert = running;
    E.steps.toggleAttribute('data-busy', running);
    return card;
  }
  /* paths and names in a step's words keep together: a line breaks between words, never inside ~/Code/budget-tracker */
  function keepWhole(root, sel) {
    root.querySelectorAll(sel || '.pjx-phase-label').forEach((el) => {
      const parts2 = String(el.textContent).split(/(\s+)/);
      // a long path (folder names keep their spaces, P7) may still break at its slashes, so it never runs off the card
      if (!parts2.some((x) => /[/-]/.test(x))) return;
      // a short name stays whole; a long path may break only after a slash
      const wb = (x) => { const f = D.createDocumentFragment(); x.split('/').forEach((seg, i, a) => { f.appendChild(D.createTextNode(seg + (i < a.length - 1 ? '/' : ''))); if (i < a.length - 1) f.appendChild(D.createElement('wbr')); }); return f; };
      el.replaceChildren(...parts2.map((x) => (/[/-]/.test(x) && x.length <= 18 ? h('span.pjxc-nobr', { text: x }) : /\//.test(x) ? wb(x) : D.createTextNode(x))));
    });
    return root;
  }
  function reviewCard() {
    const s = C.s, cm = C.commit, d = s.d, verb = verbOf(d.way);
    const name = String(NPS().nameOf(s) || '').trim();
    let body = [], footEl = null, title = W_('np.rv.title'), sub = W_('np.rv.sub'), lead = 'list', leadMark = null;
    if (cm) {
      // the plate's subject is the Project being made; what is happening, and how far, is its second line
      const n = cm.list.length, done = cm.states.filter((x) => x === 'complete').length;
      leadMark = cm.running ? 'working' : 'failed'; lead = null;
      title = cm.running ? (name || 'Your new Project') : W_('np.fail.title');
      sub = cm.running ? W_('np.ph.creating', { verb: verb[1], i: Math.min(n, done + 1), n }) : name || 'Your new Project';
      body = [keepWhole(PJX.flow.phaseList(cm.list, cm.states)), cm.running ? h('p.pjxc-steps-n.is-left', { text: W_('np.ph.eachChecked') }) : null];
      if (!cm.running && cm.fail) body.push(keepWhole(PJX.flow.facts([{ key: 'failed', text: cm.fail.text }]), '.pjx-fact-text'));
      if (!cm.running && cm.fail && cm.fail.kind === 'taken') footEl = h('div.pjxc-commit', null,
        act(W_('np.fail.rename', { service: cm.fail.service }), { primary: true, icon: 'edit', key: 'rv:rename', run: () => { C.commit = null; const nm = NPS().onlineName(s); s.d.online.name = nm; s.d.online.nameTouched = true; s.changed(); goToSection('online', 'oname'); } }),
        act(W_('np.fail.skip'), { key: 'rv:skip', run: () => skipOnline() }));
      else if (!cm.running) footEl = h('div.pjxc-commit', null,
        act(W_('np.fail.again'), { primary: true, icon: 'refresh', key: 'rv:again', run: () => create() }),
        act(W_('np.fail.change'), { key: 'rv:edit', run: () => { const sec = cm.fail && cm.fail.section; C.commit = null; render(); goToSection(sec || NPS().sections(s)[0]); } }));
    } else {
      body = [agentCard(s), PJX.npui.review(s, { change: (sec, f) => goToSection(sec, f) })].filter(Boolean);
      keepWhole(body[body.length - 1], 'dd');
      footEl = PJX.npui.reviewFoot(s, { change: (sec, f) => goToSection(sec, f), create: () => create() });
    }
    return plate('review', { tag: 'aside', cls: 'pjxc-review', icon: lead, mark: leadMark, title, sub, body, footEl });
  }
  /* one sentence for a settled check, sign-in or look-up (spec 15); "" for those that speak elsewhere (the look inside) */
  function settledWords(s, key, o) {
    const r = o.result || {}, ok = o.state === 'done', k = key.split(':')[0], cn = PJX.np.comp(s.d.runsOn).name;
    const svcOf = (x) => { const sv = PJX.rules.service(String(x || '').split('.')[0]); return sv ? sv.name : 'the service'; };
    switch (k) {
      case 'signin': return ok ? 'Signed in to ' + svcOf(key.split(':')[1]) + ' as ' + r.account + ' on ' + cn + '.' : r.fail === 'token' ? W_('np.signin.tokenBad') : W_('np.signin.fail');
      case 'link': return ok ? (r.empty ? 'Checked: it is empty, so your folder’s history goes up to it.' : 'Checked: it is this Project.') + (r.vis ? ' Who can see it: ' + r.vis + '.' : '') : r.fail === 'gone' ? 'It isn’t there any more, or this account can’t see it.' : 'Its history doesn’t match this folder.';
      case 'name': case 'forkname': return r.bad ? r.bad : r.ok ? (r.name || 'That name') + ' is available.' : '';
      case 'access': return ok ? (r.access === 'write' ? (r.team ? W_('np.access.team', { owner: 'someone else' }) : W_('np.access.yours')) : W_('np.access.public')) : 'Nothing found there.';
      case 'find': return ok ? 'Found ' + r.id + '.' : 'Nothing found at ' + r.id + '.';
      case 'smb': case 'nfs': return ok ? 'Opened the shared folder. Its folders are listed.' : 'The shared folder didn’t let you in.';
      case 'vol': return ok ? 'The drive can be read. Its folders are listed.' : '';
      case 'net': return ok ? 'Checked: Puppet Master can write there.' : 'That place refused. ' + (r.fail === 'wrong' ? 'Check the username and password.' : '');
      case 'keyadd': return ok ? W_('np.connect.done') : r.fail === 'wrong' ? 'It didn’t accept that username and password.' : '';
      case 'rlist': return ok ? 'Found backups of ' + PJX.np.plural((r.projects || []).length, 'Project') + '.' : 'No Puppet Master backup was found there.';
      case 'gitaddr': return ok ? 'Found it: ' + r.branch + ' branch.' : W_('np.svc.gitAddressNone');
      case 'srv': return ok ? 'The server answers.' : 'Nothing answered at that address.';
      case 'addr': return ok ? 'Found it on your network.' : 'Nothing answered at that address.';
      case 'preview': return ok ? 'Read the settings it would copy.' : '';
      case 'inside': return ok ? 'Looked inside: about ' + r.size + '.' : '';
      default: return '';
    }
  }
  /* the run-mode demo: an agent sets this Project up. Regular: it stops here and asks; YOLO: it goes ahead and reports, and
     still stops for the sign-in and the Recovery Kit (Jared 2026-11-03) */
  function agentCard(s) {
    const a = s.ui.agent; if (!a || C.commit) return null;
    const U = PJX.npui, ph = PJX.np.phases(s), fork = ph.find((x) => x.key === 'fork');
    const acts = [fork ? 'make your fork ' + PJX.np.forkOwner(s) + '/' + PJX.np.forkName(s) + ' on ' + fork.service : null, 'copy it to ' + PJX.np.comp(s.d.runsOn).name, s.d.backup.dest !== 'none' ? 'set up backups to ' + PJX.np.bkDestLabel(s) : null].filter(Boolean);
    const box = h('div.pjxc-agent', { role: 'group', 'aria-label': W_('np.yolo.agent') }, h('div.pjxc-agent-head', null, h('span.pjx-st-mark', { html: mark('working', 14), 'aria-hidden': 'true' }), h('b', { text: W_('np.yolo.agent') }), h('span.pjxc-agent-mode', { text: PJX.yolo() ? 'YOLO' : 'Regular' })));
    if (PJX.yolo()) put0(box, U.line('info', W_('np.yolo.agentGo')), U.hint(PJX.np.firstProblem(s) ? 'Waiting for: ' + PJX.np.firstProblem(s).text : 'Starting now…'));
    else put0(box, h('p.pjx-np-say', { text: W_('np.yolo.agentAsk', { acts: PJX.np.andList(acts) }) }),
      h('div.pjx-row', null, act(W_('np.yolo.agentAllow'), { primary: true, key: 'agent:allow', run: () => { a.allowed = true; create(); } }), act(W_('np.yolo.agentNot'), { key: 'agent:not', run: () => { s.ui.agent = null; s.changed(); } })));
    return box;
  }
  function agentTick(s) {
    const a = s && s.ui.agent; if (!a || a.started || !PJX.yolo() || C.s !== s || (C.commit && C.commit.running)) return;
    if (PJX.np.firstProblem(s)) return;
    a.started = true; later(() => { if (C && C.s === s) create(); }, PJX.reduced() ? 100 : 900);
  }
  /* Skip the online copy (6.12.4 B): asked first, then setup runs again without it */
  function skipOnline() {
    const dlg = PJX.dialog({ title: W_('np.fail.skip') + '?', body: h('div', null, h('p.pjx-q-lead', { text: W_('np.fail.skipConfirm') })),
      actions: [{ spacer: true }, { label: 'Keep it', run: () => dlg.close('keep') }, { label: W_('np.fail.skip'), primary: true, run: () => { dlg.close('ok'); C.commit = null; NPS().set(C.s, 'online.mode', 'none'); create(); } }] });
  }
  async function create() {
    const s = C.s; if (!s || (C.commit && C.commit.running)) return;
    const pr = NPS().firstProblem(s); if (pr) { goToSection(pr.section, pr.field); return; }
    const list = NPS().phases(s), demo = Object.assign({}, s.ui.demo || {});
    C.commit = { list, states: list.map(() => 'pending'), running: true, fail: null, sid: s.id };
    render();
    later(() => { const r = C.root.querySelector('.pjxc-review'); if (r) { r.setAttribute('tabindex', '-1'); r.focus({ preventScroll: true }); } }, 30);
    const nm = NPS().nameOf(s);
    announce(verbOf(s.d.way)[1] + ' ' + nm);
    // what the agent did, said in the past tense: the steps that act online, and the copy here
    const PAST = { Making: 'made', Copying: 'copied', Linking: 'linked', Starting: 'started', Sending: 'sent', Adding: 'added', Installing: 'installed' };
    const past = (l) => l.replace(/^(\w+)/, (m0) => PAST[m0] || m0.toLowerCase());
    const agent = s.ui.agent ? { yolo: PJX.yolo(), labels: list.filter((x) => x.remote || /^(send|clone|upstream|branch|link)$/.test(x.key)).map((x) => past(x.label)) } : null;
    const res = await NPS().commit(s, { demo, onPhase(i, l, st, was) { if (C && C.commit && C.commit.sid === s.id) { C.commit.states[i] = st; render(); if (st === 'complete' && !was) announce(l[i].label + ' · done'); } } });
    if (!C) return;
    const mine = C.s === s, still = mine && C.mode === 'new';
    if (res.project) {
      const p = res.project;
      if (res.ok) {
        const chat = p.fromChat;
        const files = chat ? PJX.np.chatFiles(s) : null;
        p.fromChatFiles = files;
        // what can't be undone is said: an online copy or a fork made here stays there if you Undo
        const remote = p.online && p.online.service && /make|instead/.test(PJX.np.onlineMode(s)) ? ' The online copy on ' + p.online.service + ' can’t be undone from here: delete it there if you don’t want it.' : p.online && p.online.upstream && !((PJX.np.accessDone(s) || {}).fork) && agent ? ' Your fork on ' + p.online.service + ' can’t be undone from here: delete it there if you don’t want it.' : '';
        C.flash[p.id] = { title: chat ? W_('np.done.chat', { name: p.name, chat }) : W_('np.done.title', { name: p.name }), text: (p.backup && p.backup.setup ? W_('np.done.textBk') : W_('np.done.text')) + remote, plan: true, accounts: p.needsSignin, computer: PJX.np.comp(p.runsOn).name, undoCopy: !!p.copied, chat, files,
          agent: agent ? (agent.yolo ? W_('np.yolo.agentDone') : W_('np.yolo.agentAllowed')) + ': ' + PJX.np.andList(agent.labels) + '.' + (p.backup && p.backup.setup ? ' ' + W_('np.yolo.agentWaits', { where: p.backup.dest }) : '') : null };
      }
      // the draft became a Project (or a Project whose setup can be continued): it is no longer a draft
      if (mine) { C.s = null; C.commit = null; C.pasteText = ''; if (C.els.paste) C.els.paste.value = ''; }
      if (still) { C.mode = 'project'; C.sel = p.id; C.swap = true; C.els.scroll.scrollTop = 0; render(); focusTitle(); }
      else {
        // made while the person looked at another Project: say so where they are, and leave them there
        render();
        PJX.toast(res.ok ? W_('np.done.title', { name: p.name }) : 'Setup didn’t finish for ' + p.name, res.ok ? W_('np.done.away', { name: p.name, computer: p.where.label }) : 'Continue setup from its page. Nothing is made twice.', res.ok ? 'success' : 'warn');
      }
      announce(res.ok ? W_('np.done.title', { name: p.name }) : 'Setup didn’t finish for ' + p.name);
    } else if (mine) {
      C.commit.running = false; C.commit.fail = res.fail; render();
      announce(W_('np.fail.title') + '. ' + (res.fail && res.fail.text));
    }
  }
  /* a window so narrow that the chat beside it leaves New Project a sliver (640 px leaves about 175 px): say so, and offer to
     give it the room for as long as New Project is open; the chat comes back when you leave it, or at once with Show the
     chat. The chat itself is PMConcept7's: only its width is set aside, by the layer's own rule (core.css) */
  function roomNote() {
    const tight = C.width && C.width < 330, roomy = D.documentElement.hasAttribute('data-pjx-roomy');
    if (!tight && !roomy) return null;
    const el = slot('room', () => h('div.pjxc-room', { role: 'note' }));
    fill(el, h('span.pjx-st-mark', { html: PJX.calm('info', 14), 'aria-hidden': 'true' }),
      h('span.pjxc-room-text', { text: roomy ? W_('np.room.on') : W_('np.room.off', { w: Math.round(C.width) }) }),
      act(roomy ? W_('np.room.show') : W_('np.room.give'), { cls: 'pjx-link', key: roomy ? 'room:show' : 'room:give', run: () => setRoomy(!roomy) }));
    return el;
  }
  /* the same choice in the head, where a sliver of a page always shows it */
  function roomBtn() {
    const tight = C.width && C.width < 330, roomy = D.documentElement.hasAttribute('data-pjx-roomy');
    if (!tight && !roomy) return null;
    return act(roomy ? W_('np.room.show') : W_('np.room.give'), { icon: roomy ? 'chat' : 'expand', key: roomy ? 'h:room:show' : 'h:room:give', tip: roomy ? W_('np.room.on') : W_('np.room.off', { w: Math.round(C.width) }), run: () => setRoomy(!roomy) });
  }
  function setRoomy(on) {
    if (on) D.documentElement.setAttribute('data-pjx-roomy', ''); else D.documentElement.removeAttribute('data-pjx-roomy');
    later(() => { if (C) render(); }, 60);
  }
  function renderNew() {
    const E = C.els;
    if (!C.s) startNew({}, true);
    renderHeadNew();
    const kids = [roomNote()].filter(Boolean);
    if (C.view === 'launcher' || !C.s.d.way) {
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

  /* ------------------------------------------------------------------ from a chat with no project [Depends: no-project] */
  /* "Make this a project…": both choices in sight, nothing chosen until you click, and PM says what happens next */
  function chooser(chatId) {
    const c = (PJX.ENV.chats || []).find((x) => x.id === chatId) || (PJX.ENV.chats || [])[0]; if (!c) return;
    const mv = PJX.np.moved(c.id);
    if (mv) { const t = PJX.get(mv.into); PJX.toast(W_('np.chooser.moved', { chat: c.title, project: t ? t.name : mv.into }), '', 'info'); if (t) select(t.id, { focus: 'page' }); return; }
    let pick = null;
    const body = h('div.pjx-np-chooser');
    let dlg = null;
    const paint = () => {
      const U = PJX.npui;
      fill(body,
        h('p.pjx-q-lead', { text: W_('np.chooser.none') }),
        U.choices('chooser', [{ id: 'new', glyph: 'folder-plus', title: W_('np.chooser.new'), sub: W_('np.chooser.newSub') }, { id: 'existing', glyph: 'move', title: W_('np.chooser.existing'), sub: W_('np.chooser.existingSub') }], pick, (v) => { pick = v; paint(); }, { label: W_('np.chooser.title', { chat: c.title }), cls: 'pjx-choices-grid pjx-np-tiles' }),
        pick ? U.line('info', pick === 'new' ? W_('np.chooser.saysNew', { chat: c.title, n: c.files }) : W_('np.chooser.saysExisting')) : null,
        U.hint(W_('np.chooser.pending'), 'is-concept'));
      if (dlg) dlg.setActions([{ spacer: true }, { label: W_('np.chooser.cancel'), run: () => dlg.close('cancel') },
        { label: pick === 'existing' ? W_('np.chooser.goExisting') : W_('np.chooser.goNew'), primary: true, disabled: pick ? null : 'Choose one first', run: () => { if (!pick) return; dlg.close('ok'); if (pick === 'new') startNew({ way: 'chat', chat: c.id }); else chooserExisting(c); } }]);
      const f = body.querySelector('.pjx-choice[aria-checked="true"]'); if (f) f.focus({ preventScroll: true });
    };
    dlg = PJX.dialog({ title: W_('np.chooser.title', { chat: c.title }), kicker: W_('np.chooser.kicker'), body, wide: true });
    paint();
  }
  function chooserExisting(c) { startMove(c.id); }

  /* ------------------------------------------------------------------ moving a chat into a project you have (NOPROJECT 7.4 to
     7.7, N2): which project, which files, where they go, the plain statement and a live preview, the named button, then the
     report with Undo on the project's page. [Depends: no-project] */
  function startMove(chatId) {
    if (C.mode !== 'move' && C.mode !== 'new') C.prevSel = C.sel;
    C.mv = PJX.np.moveStart(chatId); if (!C.mv) return;
    C.mvCommit = null; C.mode = 'move'; C.drawer = false; C.swap = true;
    C.mv.on(() => { if (C && C.mv) soon(); });
    if (C.els.scroll) C.els.scroll.scrollTop = 0;
    render();
    later(() => { const f = C.root.querySelector('[data-pjx-key="mv:q"]') || C.root.querySelector('.pjxc-move .pjx-choice'); if (f) f.focus({ preventScroll: true }); }, 40);
  }
  function closeMove(to) {
    D.documentElement.removeAttribute('data-pjx-roomy');
    C.mv = null; C.mvCommit = null; C.mode = 'project'; C.swap = true;
    C.sel = to || (PJX.get(C.prevSel) ? C.prevSel : C.sel);
    render(); if (to) focusTitle(); else later(() => (C.els.newBtn.offsetParent ? C.els.newBtn.focus() : focusTitle()), 0);
  }
  function renderHeadMove() {
    const E = C.els, m = C.mv, c = PJX.np.chatOf(m.chat), running = !!(C.mvCommit && C.mvCommit.running);
    const back = running ? null : act(W_('np.mv.back'), { icon: 'chevron-left', key: 'mv:back', tip: 'Back to the choice: a new project or one you have', run: () => { const id = m.chat; closeMove(); chooser(id); } });
    const cancel = running ? null : act(W_('np.mv.cancel'), { icon: 'close', key: 'mv:cancel', tip: 'Nothing moves · Esc', run: () => closeMove() });
    if (cancel) { cancel.setAttribute('aria-label', W_('np.mv.cancel')); cancel.classList.add('pjxc-can-shrink'); }
    if (C.narrow) { fill(E.head, projectsBtn(), h('span.pjx-grow'), back, cancel, roomBtn()); return; }
    fill(E.head, h('div.pjxc-headmain', null, h('span.pjxc-headico', { html: icon('move', 22), 'aria-hidden': 'true' }),
      h('div.pjxc-titles', null, h('h2.pjxc-title', { tabindex: '-1', text: W_('np.mv.head', { chat: c.title }) }), h('div.pjxc-headline', null, h('span.pjxc-headsub', { text: W_('np.mv.sub', { go: PJX.np.moveLabel(m) }) })))),
      h('div.pmu-headctl.pjxc-acts', null, back, cancel));
    setAttr(E.head, 'aria-label', W_('np.mv.title', { chat: c.title }));
  }
  const MARK = { new: ['info', 'np.mv.mark.new'], same: ['complete', 'np.mv.mark.same'], different: ['warning', 'np.mv.mark.different'] };
  function moveQuestions() {
    const m = C.mv, NPx = PJX.np, U = PJX.npui, c = NPx.chatOf(m.chat), p = PJX.get(m.target), running = !!(C.mvCommit && C.mvCommit.running);
    const box = h('div.pjxc-mvq');
    const q = (n, title, lead, ...kids) => h('section.pjxc-mvsec', { 'aria-labelledby': 'pjxc-mvh-' + n }, h('h3.pjxc-mvh', { id: 'pjxc-mvh-' + n, tabindex: '-1' }, h('span.pjx-np-num', { text: String(n), 'aria-hidden': 'true' }), h('span', { text: title })), lead ? h('p.pjx-np-lead', { text: lead }) : null, ...kids.flat().filter(Boolean));
    // always the other choice in sight (7.2)
    put0(box, h('div.pjxc-making', null, U.line('info', W_('np.mv.making', { chat: c.title }), { after: act(W_('np.mv.instead'), { cls: 'pjx-link', key: 'mv:instead', run: () => { const id = m.chat; closeMove(); startNew({ way: 'chat', chat: id, fresh: true }); } }) })));
    // 1 which project: the library's groups, with search
    const T = NPx.moveTargets(m), groups = new Map();
    T.forEach((x) => { const k = x.p.where.label || 'Elsewhere'; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(x); });
    const order = ['This computer'].concat(PJX.ENV.devices.map((d) => d.name));
    const lists = Array.from(groups.keys()).sort((a, b) => ((order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99))).map((k) => U.group(k, U.choices('mv:target:' + k.replace(/\W+/g, '-'), groups.get(k).map((x) => ({ id: x.p.id, glyph: x.p.glyph, title: x.p.name, sub: [PJX.primary(x.p).word, x.other ? W_('np.mv.other', { project: x.p.name, computer: x.other }) : null].filter(Boolean).join(' · '), disabled: x.off })), m.target, (v) => { m.target = v; m.place = 'draft'; m.changed(); }, { label: k })));
    put0(box, q(1, W_('np.mv.q1'), W_('np.mv.q1Lead'), U.field(W_('np.mv.search'), U.input('mv:q', m.q, 'harbor', (v) => { m.q = v; m.changed(); }), ''), lists.length ? lists : U.hint('No project matches that search.'),
      p && (p.runsOn || 'here') !== c.runsOn ? U.line('info', W_('np.mv.other', { project: p.name, computer: NPx.comp(p.runsOn).name })) : null));
    if (!p) return box;
    // 2 which files: all ticked; each marked New, Same or Different against the project
    const files = (c.fileList || []).map((f) => { const mk = MARK[NPx.moveMark(m, f)]; return h('div.pjxc-mvfile', null, U.check('mv:file:' + f, f, !!m.files[f] && !m.chatOnly, (v) => { m.files[f] = v; m.changed(); }, { disabled: m.chatOnly ? W_('np.mv.chatOnlySub', { n: c.files, folder: c.folder }) : null }), PJX.parts.st(mk[0], W_(mk[1]))); });
    put0(box, q(2, W_('np.mv.q2'), W_('np.mv.q2Lead', { project: p.name }), U.check('mv:chatonly', W_('np.mv.chatOnly'), m.chatOnly, (v) => { m.chatOnly = v; m.changed(); }, { sub: W_('np.mv.chatOnlySub', { n: c.files, folder: c.folder }) }), h('div.pjxc-mvfiles', { role: 'group', 'aria-label': W_('np.mv.q2') }, ...files)));
    if (m.chatOnly) return box;
    // 3 where they go: a separate draft first (N9); straight into the main version under Advanced; the folder in the project
    const hist = NPx.moveHist(m), jj = p.history.backend === 'jujutsu', fb = String(m.folder || '');
    const folderField = U.field(W_('np.mv.folder', { project: p.name }), U.input('mv:folder', fb, 'tools/printer', (v) => { m.folder = v; m.changed(); }), W_('np.mv.folderHint'), /[\\:*?"<>|]|\.\./.test(fb) || !fb.trim() ? W_('np.mv.folderBad') : '');
    const s0 = { id: 'mv-' + m.id, ui: m.ui, changed: () => m.changed() };
    put0(box, q(3, W_('np.mv.q3'), null,
      hist ? U.choices('mv:place', [{ id: 'draft', glyph: 'branch', title: W_('np.mv.draft'), sub: W_('np.mv.draftSub'), tag: W_('np.svc.recommended') }].concat(m.place === 'main' ? [{ id: 'main', glyph: 'upload', title: W_('np.mv.main'), sub: W_('np.mv.mainSub', { project: p.name }) }] : []), m.place, (v) => { m.place = v; m.changed(); }, { label: W_('np.mv.q3') }) : U.line('info', W_('np.mv.noHist', { project: p.name })),
      folderField,
      U.demo([{ label: 'tools/printer', outcome: 'works', run: () => { m.folder = 'tools/printer'; m.changed(); } }, { label: '../outside', outcome: 'refused', run: () => { m.folder = '../outside'; m.changed(); } }], { id: 'mvfolder' }),
      hist ? U.disc(s0, 'mv-adv', W_('np.sec.advanced'), () => [
        U.field(jj ? W_('np.mv.branchJj') : W_('np.mv.branch'), U.input('mv:branch', m.branch, 'chat/fix-printer', (v) => { m.branch = v; m.branchTouched = true; m.changed(); }), W_('np.mv.branchHint'), PJX.rules.branchProblem(m.branch) || ''),
        U.check('mv:main', W_('np.mv.main'), m.place === 'main', (v) => { m.place = v ? 'main' : 'draft'; m.changed(); }, { sub: W_('np.mv.mainSub', { project: p.name }) })]) : null));
    // 4 conflicts, only when a Different file goes straight in
    const conf = NPx.moveConflicts(m);
    if (conf.length) put0(box, q(4, W_('np.mv.q4'), conf.join(', '), U.choices('mv:resolve', [{ id: 'both', glyph: 'copy', title: W_('np.mv.r.both'), sub: W_('np.mv.r.bothSub', { example: conf[0] }), tag: W_('np.svc.recommended') }, { id: 'chat', glyph: 'swap', title: W_('np.mv.r.chat'), sub: W_('np.mv.r.chatSub') }, { id: 'skip', glyph: 'slash-circle', title: W_('np.mv.r.skip'), sub: W_('np.mv.r.skipSub') }], m.resolve, (v) => { m.resolve = v; m.changed(); }, { label: W_('np.mv.q4') })));
    void running;
    return box;
  }
  function put0(box, ...kids) { kids.flat().forEach((k) => { if (k) box.appendChild(k); }); return box; }
  function moveReview() {
    const m = C.mv, NPx = PJX.np, U = PJX.npui, c = NPx.chatOf(m.chat), p = PJX.get(m.target), cm = C.mvCommit;
    if (cm) {
      const n = cm.list.length, done = cm.states.filter((x) => x === 'complete').length;
      return plate('mvreview', { tag: 'aside', cls: 'pjxc-review pjxc-mvreview', mark: 'working', title: W_('np.mv.title', { chat: c.title }), sub: W_('np.mv.moving', { i: Math.min(n, done + 1), n }),
        body: [keepWhole(PJX.flow.phaseList(cm.list, cm.states)), h('p.pjxc-steps-n.is-left', { text: W_('np.ph.eachChecked') })] });
    }
    const pr = NPx.moveProblem(m), st = NPx.moveStatement(m), pv = p ? NPx.movePicked(m) : [];
    const body = [];
    if (p) {
      body.push(h('ol.pjxc-mvsays', { 'aria-label': W_('np.mv.says') }, ...st.map((t) => h('li', { text: t }))));
      body.push(h('section.pjxc-rgroup', null, h('div.pjxc-rghead', null, h('h4.pjxc-cap', { text: W_('np.mv.preview') })),
        h('dl.pjxc-rrows', null,
          h('dt', { text: W_('np.mv.pv.files') }), h('dd', null, ...(m.chatOnly ? [h('span', { text: 'None' })] : pv.length ? pv.map((f) => { const mk = MARK[NPx.moveMark(m, f)]; return h('span.pjxc-mvpv', null, h('span.pjxc-code', { text: f, 'data-pmh-tag': 'literal' }), PJX.parts.st(mk[0], W_(mk[1]))); }) : [h('span', { text: 'None chosen' })])),
          h('dt', { text: W_('np.mv.pv.first') }), h('dd', { text: '“' + c.first + '”' }),
          h('dt', { text: W_('np.mv.pv.last') }), h('dd', { text: '“' + c.last + '”' }),
          h('dt', { text: W_('np.mv.pv.where', { project: p.name }) }), h('dd', { text: W_('np.mv.pv.whereVal', { chat: c.title }) }))));
    } else body.push(U.hint(W_('np.mv.pick')));
    const why = pr ? (() => { const b = h('button.pjxc-why', { type: 'button', id: 'pjxc-mvwhy', 'data-c-key': 'mv:why' }, h('span.pjx-st-mark', { html: PJX.calm('warning', 13), 'aria-hidden': 'true' }), h('span', { text: pr.text })); b.addEventListener('click', () => { const f = C.root.querySelector(pr.field === 'target' ? '[data-pjx-key="mv:q"]' : pr.field === 'files' ? '[data-c-key="mv:chatonly"]' : '[data-pjx-key="mv:' + pr.field + '"]'); if (f) f.focus(); }); return b; })() : null;
    const go = h('button', { type: 'button', class: ['pmw-act', 'pjxc-btn', 'pjxc-go', !pr && 'is-primary'], 'data-c-key': 'mv:go', 'aria-disabled': pr ? 'true' : null, 'aria-describedby': pr ? 'pjxc-mvwhy' : null, 'data-cmd': p ? NPx.movePhases(m).map((x) => x.cmd).join(' → ') : null },
      h('span.pjxc-bico', { html: icon('move', 15), 'aria-hidden': 'true' }), h('span.pjxc-blabel', { text: NPx.moveLabel(m) }));
    go.addEventListener('click', () => { if (pr) { why && why.click(); return; } doMove(); });
    const foot = h('div.pjxc-commit', null, why, go, U.yoloLine(W_('np.yolo.chatMove', { project: p ? p.name : 'the project' })), U.hint(W_('np.chat.pending'), 'is-concept'));
    return plate('mvreview', { tag: 'aside', cls: 'pjxc-review pjxc-mvreview', icon: 'list', title: W_('np.mv.says'), sub: p ? p.name : W_('np.mv.pick'), body, footEl: foot });
  }
  async function doMove() {
    const m = C.mv; if (!m || (C.mvCommit && C.mvCommit.running)) return;
    const list = PJX.np.movePhases(m);
    C.mvCommit = { list, states: list.map(() => 'pending'), running: true };
    render(); announce(W_('np.mv.moving', { i: 1, n: list.length }));
    const res = await PJX.np.moveCommit(m, { yolo: PJX.yolo(), onPhase(i, l, st) { if (C && C.mvCommit) { C.mvCommit.states[i] = st; render(); if (st === 'complete') announce(l[i].label + ' · done'); } } });
    if (!C) return;
    if (res.ok) {
      const r = res.rec, c = PJX.np.chatOf(r.chat), p = res.project, left = [];
      const nLeft = (c.fileList || []).length - (r.chatOnly ? 0 : PJX.np.movePicked(m).length);
      if (nLeft) left.push(PJX.np.plural(nLeft, 'file') + ' you didn’t pick');
      left.push(PJX.np.plural(c.outside.length, 'file') + ' outside the chat folder', '1 folder permission');
      C.flash[p.id] = { title: W_('np.mv.done', { project: p.name }), text: W_('np.mv.doneText', { n: c.messages, a: c.attachments, files: r.files.length ? W_('np.mv.doneFiles', { k: PJX.np.plural(r.files.length, 'file'), folder: r.folder, onDraft: r.place === 'draft' ? W_('np.mv.onDraft', { branch: r.branch }) : '' }) : '', left: PJX.np.andList(left) }) + (r.by === 'yolo' ? ' YOLO didn’t ask for a yes.' : ''), moved: r };
      announce(W_('np.mv.done', { project: p.name }));
      closeMove(p.id);
    }
  }
  function renderMove() {
    const E = C.els;
    renderHeadMove();
    const grid = slot('mv:grid', () => h('div.pjxc-flowgrid'));
    const card = slot('mv:steps', () => h('section.pmu-card.pjxc-steps.pjxc-move', { 'data-lg-surface': 'card', 'aria-label': 'Questions' }));
    const running = !!(C.mvCommit && C.mvCommit.running);
    const inner = moveQuestions();
    inner.inert = running;
    fill(card, inner);
    syncChildren(grid, [card, moveReview()]);
    syncChildren(E.body, [roomNote(), grid]);
    E.body.setAttribute('data-view', 'move');
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
    if (C.mode === 'new') renderNew(); else if (C.mode === 'move' && C.mv) renderMove(); else renderProject();
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
      if (C.mode === 'move' && C.mv && !(C.mvCommit && C.mvCommit.running)) {
        e.preventDefault();
        // in a field, Escape only leaves the field; from anywhere else it cancels the move (nothing has moved)
        if (a && /input|textarea|select/i.test(a.tagName || '')) { const hd = a.closest('.pjxc-mvsec') && a.closest('.pjxc-mvsec').querySelector('.pjxc-mvh'); if (hd) hd.focus(); return; }
        closeMove(); return;
      }
      if (C.mode === 'new' && PJX.all().length) {
        e.preventDefault();
        const s = C.s, mini = a && a.closest && a.closest('[data-np-esc]'), sec = a && a.closest && a.closest('.pjx-np-sec[data-state="open"]');
        // 1. the open mini-step it is in leaves to where it was (dropping only what depended on it), focus on its section
        const fn = s && mini && s.ui.esc && s.ui.esc[mini.getAttribute('data-np-esc')];
        if (fn && !(C.commit && C.commit.running)) { const id = sec && sec.getAttribute('data-step'); fn(); later(() => { const sc = id && C.els.steps.querySelector('[data-step="' + cssEsc(id) + '"]'); const f = sc && (sc.querySelector('.pjx-np-mini.is-open .pjx-choice, .pjx-np-mini.is-open input, .pjx-np-mini.is-open button') || sc.querySelector('.pjx-np-head')); if (f) f.focus({ preventScroll: true }); }, 40); return; }
        // 2. an open section folds: nothing is cleared, the focus goes to its heading
        if (s && sec && C.view === 'steps' && !(C.commit && C.commit.running)) { const id = sec.getAttribute('data-step'); PJX.np.fold(s); later(() => { const hb = C.els.steps.querySelector('[data-c-key="sec:' + cssEsc(id) + '"]'); if (hb) hb.focus({ preventScroll: true }); }, 40); return; }
        // 3. otherwise New Project closes; its answers wait in the library
        closeNew();
      }
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
      // a read-only handle for the verification scripts (the session and its state), never used by the page itself
      PJX.split = { session: () => C && C.s, state: () => C, select: (id) => C && select(id), openForm: (id, kind) => { const p = PJX.get(id); if (C && p) openForm(p, kind); } };
      build(root);
      C.width = root.getBoundingClientRect().width;
      C.narrow = C.width > 0 && C.width < NARROW;
      if (W.ResizeObserver) {
        C.ro = new W.ResizeObserver((ents) => {
          const w = ents[0].contentRect.width; if (!w) return;
          const was = C.width; C.width = w;
          if ((was < 330) !== (w < 330) && (C.mode === 'new' || C.mode === 'move')) soon();
          const n = w < NARROW;
          if (n !== C.narrow) { C.narrow = n; if (!n) C.drawer = false; render(); } else fitHead();
        });
        C.ro.observe(root);
      }
      PJX.np.onSettled = (s, key, o) => {
        if (!C) return;
        const mine = C.s === s || Object.keys(C.inplace).some((k) => C.inplace[k] && C.inplace[k].s === s);
        const t = mine ? settledWords(s, key, o) : '';
        if (t) announce(t);
      };
      C.offs.push(() => { if (PJX.np) PJX.np.onSettled = null; });
      C.offs.push(PJX.on('op', (op) => {
        if (!C) return;
        if (op.done && op.kind === 'protect') {
          const p = PJX.get(op.id), stp = p && p.backup && p.backup.setup;
          announce(op.failed ? op.label + ' didn’t work. ' + (/test/i.test(op.label) ? W_('np.prot.s2Fail', { where: p.backup.dest, reason: W_('np.prot.s2Full') }) : W_('np.prot.s4Fail')) : op.label + ' · done.' + (stp && stp.done ? ' ' + W_('np.prot.done', { time: p.backup.time || '2:00 AM' }) : ''));
          later(() => { const b = C.root.querySelector('[data-plate="protect"] .pjx-np-pstep.is-now .pjx-btn.is-primary, [data-plate="protect"] .pjx-np-pstep.is-failed .pjx-btn.is-primary') || C.root.querySelector('[data-plate="protect"] [data-c-key="prot:ok"]'); if (b) b.focus({ preventScroll: true }); }, 80);
        }
        if (op.done && !op.failed && /relocate|restore|move/.test(op.kind)) later(() => { if (!D.activeElement || D.activeElement === D.body || !C.root.contains(D.activeElement)) focusTitle(); }, 80);
        if (op.done && op.failed && op.kind === 'restore') later(() => focusTitle(), 80);
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
      C.offs.push(() => { D.body.removeAttribute('data-pjxc-page'); D.body.style.removeProperty('--pjxc-rs-x'); D.body.style.removeProperty('--pjxc-rs-y'); D.documentElement.removeAttribute('data-pjx-roomy'); });
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
    /* the review strip's v2 moments (core act() hands them here) */
    moment(name) {
      if (!C) return;
      const M = {
        fromchat: () => chooser('chat-printer'),
        chatmove: () => startMove('chat-printer'),
        agent: () => { startNew({ text: 'https://github.com/maplecraft/plant-journal', fresh: true }); const s = C.s; if (!s) return; PJX.np.set(s, 'backup.dest', 'gdrive', true); s.ui.agent = { allowed: false }; s.ui.open = null; s.ui.entered = true; s.changed(); },
        contribute: () => startNew({ text: 'https://github.com/maplecraft/plant-journal', fresh: true }),
        foundonline: () => startNew({ way: 'folder', folder: '~/Code/budget-tracker', fresh: true }),
        samecopy: () => startNew({ text: 'jared@studio.local:~/Developer/loom', fresh: true }),
        jjlimits: () => startNew({ text: 'https://github.com/godot-community/demo-games', fresh: true }),
        gamejam: () => startNew({ way: 'folder', folder: '~/Code/game-jam', fresh: true }),
        newdevice: () => startNew({ way: 'device', device: 'office', fresh: true }),
        backupsetup: () => { const p = PJX.get('docs-site'); if (!p) return; select(p.id); if (!p.backup.dest) openForm(p, 'backup-setup'); else reveal('[data-plate="backup"]'); },
        photosorter: () => { if (PJX.get('photo-sorter')) { select('photo-sorter', { focus: 'page' }); reveal('[data-plate="online"]'); } },
        gardennotes: () => { if (PJX.get('garden-notes')) { select('garden-notes', { focus: 'page' }); reveal('[data-plate="backup"]'); } },
        legacy: () => { if (PJX.get('legacy-app')) { select('legacy-app', { focus: 'page' }); reveal('[data-plate="online"]'); } }
      };
      if (M[name]) { if (C.s && !(C.commit && C.commit.running) && /contribute|foundonline|samecopy|jjlimits|gamejam|newdevice|agent/.test(name)) { C.s = null; C.commit = null; } if (C.mv && name !== 'chatmove') { C.mv = null; C.mvCommit = null; if (C.mode === 'move') C.mode = 'project'; } M[name](); }
    },
    /* Finish setting up a backup: the protect plate on the Project's page */
    onBackup(e) {
      if (!C) return false; const p = PJX.get(e.id); if (!p) return false;
      select(p.id);
      // Set up backup (a notice, More): the same backup form and protect steps as the plate, never the old shortcut
      if (e.step === 'setup') { if (!p.backup.dest) openForm(p, 'backup-setup'); else reveal('[data-plate="backup"]', '.pmu-textbtn'); return true; }
      PJX.ACT.protectOpen(p.id); reveal('[data-plate="protect"]', '.pjx-btn.is-primary'); return true;
    },
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
