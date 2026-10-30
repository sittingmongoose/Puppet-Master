/* Projects concepts (Opus 5.5): concept B, "Ledger".

   Usage's own layout applied to Projects, for people with many of them. The page is Usage's .pmu-shell: a .pmu-rail of
   views with plain numeral counts (All projects, Need you, Working, This computer, Other devices, Not backed up,
   Archived) and a .pmu-stage whose head holds the view's title, Sort (which also sets the row height), search, Refresh
   and the page's one primary button, New Project. The board is a ledger, not cards: one two-line row per project in a
   single plate, with Status, Where, History, Online copy, Backup and Opened columns and labelled Open and More buttons
   at the end. A row whose project is stopped (needs you, blocked, can't reach, setup didn't finish) carries its reason
   and fix on a line under it; a backup that needs doing carries its fix under its own Backup word. A row opens Usage's
   inspector beside the ledger (Overview / Keeping it safe / Where it lives); Continue setup runs there, in place. New
   Project is a sheet from the right edge of the stage: one scrolling page drawn by PJX.flow, with a foot that says what
   Create will do before anything is made.

   Everything a row says comes from the core (PJX.primary, PJX.safety, PJX.parts) and every action is a core ACT or a
   need-* event, so the words and the owner routing match concepts A and C; nothing here changes the demo world itself.

   Rendering: the skeleton (rail, head, plate, inspector, sheet) is built once per mount and patched on every change,
   because in Glass each of those is a baked sheet that re-bakes when it is replaced. Rows are kept by project id and
   redrawn only when what they show changed, so a working mark keeps its motion, focus stays put and nothing flickers.

   Narrow: the ledger folds by its own width (container pjxl in b.css): Opened moves to the end of the name's line, then
   the status moves under the name (the paths stay in the details) so History, Online copy and Backup keep their words,
   then those three become one Kept safe column of three marks, and finally each row becomes a two-line entry. The rail
   folds by the page's width: icons with hover labels, then away, and the view's title becomes the View menu. */
(function (W) {
  'use strict';
  const PJX = W.PJX;
  if (!PJX) return;
  const D = W.document;
  const { h, icon, tip } = PJX;
  const parts = () => PJX.parts;
  const flow = () => PJX.flow;

  /* ------------------------------------------------------------------ the views in the rail */
  const RANK_WARN = PJX.STATUS.warning.rank;
  const needsYou = (p) => PJX.STATUS[PJX.primary(p).key].rank <= RANK_WARN;
  const isWorking = (p) => PJX.primary(p).key === 'working' || (p.activity && p.activity.key === 'working');
  const VIEWS = [
    { id: 'all', label: 'All projects', icon: 'list-view', count: 'all', test: () => true, group: 0 },
    { id: 'attention', label: 'Need you', icon: 'warning', count: 'attention', test: needsYou, group: 0, warn: true,
      none: ['complete', 'Nothing needs you', 'Every project is fine. When one needs you, it shows here with its fix.'] },
    { id: 'working', label: 'Working', icon: 'pulse', count: 'working', test: isWorking, group: 0,
      none: ['idle', 'Nothing is working right now', 'Projects with work running in the background show here.'] },
    { id: 'local', label: 'This computer', icon: 'desktop', count: 'local', test: (p) => p.where.kind === 'local', group: 1,
      none: ['idle', 'No projects on this computer', 'Projects whose files live on this computer show here.'] },
    { id: 'device', label: 'Other devices', icon: 'server', count: 'device', test: (p) => p.where.kind !== 'local', group: 1,
      none: ['idle', 'No projects on other devices', 'Projects whose files live on a NAS or another computer show here.'] },
    { id: 'unprotected', label: 'Not backed up', icon: 'safe', count: 'unprotected', test: (p) => !p.backup || !p.backup.dest, group: 2,
      none: ['complete', 'Every project is backed up', 'A project without a backup shows here, with Set up backup beside it.'] },
    { id: 'archived', label: 'Archived', icon: 'archive', count: 'archived', test: () => true, group: 3, archived: true,
      none: ['idle', 'Nothing archived', 'Archive a project from its More menu to tuck it away. Its files, history and backups stay where they are.'] }
  ];
  const viewOf = (id) => VIEWS.find((v) => v.id === id) || VIEWS[0];

  /* ------------------------------------------------------------------ sorting */
  const SORTS = [
    { id: 'opened', label: 'Last opened', say: 'last opened first', icon: 'clock' },
    { id: 'status', label: 'Needs you first', say: 'what needs you first', icon: 'warning' },
    { id: 'name', label: 'Name', say: 'by name', icon: 'list' },
    { id: 'backup', label: 'Oldest backup first', say: 'oldest backup first', icon: 'safe' },
    { id: 'where', label: 'Where it lives', say: 'by where it lives', icon: 'folder' },
    { id: 'history', label: 'History', say: 'by history', icon: 'branch', hidden: true },
    { id: 'online', label: 'Online copy', say: 'by online copy', icon: 'cloud', hidden: true }
  ];
  const sortOf = (id) => SORTS.find((x) => x.id === id) || SORTS[0];
  /* "2 h ago", "Yesterday", "9 days ago", "Aug 12": hours since, for the backup sort; none is the oldest of all */
  function ageHours(s) {
    if (!s) return 1e9;
    const t = String(s).toLowerCase();
    let m;
    if (/just now|today/.test(t)) return 0;
    if ((m = /(\d+)\s*h/.exec(t))) return +m[1];
    if (/yesterday/.test(t)) return 24;
    if ((m = /(\d+)\s*day/.exec(t))) return 24 * m[1];
    if ((m = /(\d+)\s*week/.exec(t))) return 168 * m[1];
    return 24 * 90;
  }
  const rankOf = (p) => PJX.STATUS[PJX.primary(p).key].rank;
  const CMP = {
    opened: (a, b) => a.openedRank - b.openedRank,
    status: (a, b) => rankOf(a) - rankOf(b) || a.openedRank - b.openedRank,
    name: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }),
    backup: (a, b) => ageHours(b.backup && b.backup.dest ? b.backup.last || 'none' : null) - ageHours(a.backup && a.backup.dest ? a.backup.last || 'none' : null) || a.openedRank - b.openedRank,
    where: (a, b) => (a.where.kind === 'local' ? 0 : 1) - (b.where.kind === 'local' ? 0 : 1) || String(a.where.path).localeCompare(String(b.where.path)),
    history: (a, b) => String(a.history.backend).localeCompare(String(b.history.backend)) || a.openedRank - b.openedRank,
    online: (a, b) => String(a.online.service || '~').localeCompare(String(b.online.service || '~')) || a.openedRank - b.openedRank
  };

  /* ------------------------------------------------------------------ the columns (the header row and every row) */
  const COLS = [
    { id: 'name', label: 'Project', sort: 'name' },
    { id: 'status', label: 'Status', sort: 'status' },
    { id: 'where', label: 'Where', sort: 'where' },
    { id: 'hist', label: 'History', sort: 'history' },
    { id: 'onl', label: 'Online copy', sort: 'online' },
    { id: 'bak', label: 'Backup', sort: 'backup' },
    { id: 'safe', label: 'Safe', sort: null },
    { id: 'opened', label: 'Opened', sort: 'opened' },
    { id: 'act', label: 'Actions', sort: null, hide: true }
  ];

  /* ------------------------------------------------------------------ small words */
  const placeText = (p) => (p.where.kind === 'local' ? 'This computer' : (p.where.device || p.where.label) + (p.where.via ? ' · ' + p.where.via : ''));
  const activityLine = (p) => (p.activity ? p.activity.text + (p.activity.at && p.activity.text.indexOf(p.activity.at) < 0 ? ' · ' + p.activity.at : '') : '');
  /* a path shortened in the middle: the start and the folder's own name stay, what is between becomes … */
  function midPath(path, max) {
    const s = String(path || '');
    if (s.length <= max) return s;
    const segs = s.split('/'), last = segs.pop();
    let head = '';
    for (let i = 0; i < segs.length; i++) {
      const next = (i ? head + '/' : '') + segs[i];
      if ((next + '/…/' + last).length > max) break;
      head = next;
    }
    if (head || s.startsWith('/')) { const out = head + '/…/' + last; if (out.length <= max + 2) return out; }
    const keep = max - 1;
    return s.slice(0, Math.ceil(keep / 2)) + '…' + s.slice(s.length - Math.floor(keep / 2));
  }
  function pathEl(p, max, cls) {
    const el = h('span', { class: ['pjxb-path', cls], 'data-pmh-tag': 'literal', text: midPath(p.where.path, max) });
    tip(el, p.where.path, p.where.missing ? 'Nothing is at this place any more' : (p.where.kind === 'local' ? 'On this computer' : 'On ' + (p.where.device || p.where.label)));
    return el;
  }
  const verbFor = (way) => ({ new: 'Create', folder: 'Add', online: 'Copy', device: 'Add', restore: 'Restore' }[way] || 'Create');
  const doing = (verb) => ({ Create: 'Creating', Add: 'Adding', Copy: 'Copying', Restore: 'Restoring' }[verb] || 'Setting up');
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : (many || one + 's'));
  /* the work a project is doing for the person right now (an owner operation they started), if any */
  const liveOp = (p) => { const op = PJX.S.ops[p.id]; return op && !op.done ? op : null; };
  /* the problem a row carries on its own line: only what stops the project (needs you, blocked, failed, can't reach,
     setup didn't finish). A warning (no backup, an old backup) is said by the status and fixed from its own Backup cell,
     and an info note stays in the details, so the ledger is not a wall of boxes */
  function lineItem(p) {
    const items = (p.attention || []).slice().sort((a, b) => PJX.STATUS[a.key].rank - PJX.STATUS[b.key].rank);
    const top = items.find((a) => PJX.STATUS[a.key].rank < RANK_WARN) || null;
    return top ? { item: top, more: items.length - 1 } : null;
  }
  /* a warning whose fix belongs to one cell: Set up backup / Back up now under the Backup word (or, once the Backup
     column has folded, after the status) */
  function cellFix(p) {
    const a = (p.attention || []).find((x) => x.key === 'warning' && (x.code === 'not_backed_up' || x.code === 'backup_overdue'));
    const act = a && a.actions && a.actions[0];
    return act && PJX.ACTIONS[act] ? { item: a, action: act, def: PJX.ACTIONS[act] } : null;
  }
  /* the fix written as a link in a cell: the same words and the same owner action as the attention's first button */
  function fixLink(p, f, fk) {
    const b = h('button', { type: 'button', class: 'pjxb-cellfix', 'data-fk': fk, 'data-pm-hover-visual-suppressed': 'true', text: f.def.label });
    tip(b, f.def.label, f.item.title + '. ' + f.item.text);
    b.addEventListener('click', (e) => { e.stopPropagation(); f.def.run(p.id); });
    return b;
  }
  /* when it was opened, for the end of the name's line once the Opened column has folded away: a clock and the time,
     "Opened …" in its hover label (never for the open project: it says Open now) */
  function openedEl(p) {
    if (p.active || !p.opened || p.lifecycle === 'archived') return null;
    // the clock says "opened"; the words drop their "ago" ("2 weeks", "Yesterday", "Aug 2") so the name keeps its room
    const full = String(p.opened).replace(/\s+ago$/i, '');
    const short = full.replace(/^Today,\s*/i, '').replace(/(\d+)\s*weeks?$/i, '$1 wk').replace(/(\d+)\s*days?$/i, '$1 d');
    const el = h('span', { class: 'pjxb-openedin' }, h('span.pjxb-oico', { html: icon('clock', 12), 'aria-hidden': 'true' }), h('span', { class: 'pjxb-otext', text: full, 'data-full': full, 'data-short': short }));
    tip(el, /^just added$/i.test(p.opened) ? 'Just added' : 'Opened ' + (/^[A-Z][a-z]+ \d/.test(p.opened) ? p.opened : String(p.opened).replace(/^([A-Z])(?=[a-z])/, (c) => c.toLowerCase())));
    return el;
  }
  /* the short words of an online copy, for a ledger cell (the full sentence is the cell's hover label) */
  function onlineShort(o, sf) {
    if (!o.service) return '';
    if (o.state === 'waiting' && o.note) return o.note;
    if (o.behind) return o.behind + ' newer online';
    if (o.ahead) return o.ahead + ' to send';
    return String(o.note || sf.online.tail || 'Up to date').replace(/^Last sent /, 'Sent ').replace(/^Created on \S+$/, 'Created');
  }
  /* the shared Fix… for a missing folder, written as what it does wherever B shows it (the dialog it opens is the
     same: Find the folder, a fresh copy, or the last backup) */
  function sayFind(node) {
    node.querySelectorAll('button').forEach((b) => {
      const t = b.lastElementChild;
      if (t && t.textContent === PJX.ACTIONS.repair.label) { t.textContent = 'Find the folder…'; tip(b, 'Find the folder…', 'Point to where it is now, get a fresh copy, or restore the last backup'); }
    });
    return node;
  }
  /* why Open can't run for a project, in its own words (the core refuses the same cases) */
  function openBlock(p) {
    if (p.where.missing) return 'Its folder is missing. Fix it first: Fix… finds the folder, gets a fresh copy or restores the last backup.';
    if ((p.attention || []).some((a) => a.code === 'device_offline')) return (p.where.device || 'Its device') + ' isn’t answering, and its files live there. Try again when it is back.';
    if (p.lifecycle === 'recovery') return 'Setup didn’t finish. Continue setup does only what is left.';
    return '';
  }

  /* ------------------------------------------------------------------ concept state (one per mount) */
  let S = null;
  function fresh(root) {
    return {
      root, els: {}, view: 'all', sort: 'opened', dir: 1, q: '', dense: false,
      sel: null, focus: null, inspOpen: false, tab: 'overview', inspMode: 'dock',
      rows: new Map(), list: [], offs: [], timers: [], raf: 0, ro: null,
      sheet: null, creating: null, flash: null, searchOpen: false, checked: null, resume: null, notes: null
    };
  }
  const later = (fn, ms) => { const t = setTimeout(() => { if (S) fn(); }, ms); S.timers.push(t); return t; };
  function schedule() {
    if (!S || S.raf) return;
    S.raf = requestAnimationFrame(() => { if (!S) return; S.raf = 0; render(); });
  }
  const announce = (text) => { if (S && S.els.live) { S.els.live.textContent = ''; later(() => { S.els.live.textContent = text; }, 30); } };

  /* ------------------------------------------------------------------ building blocks */
  function iconBtn(name, label, detail, run, fk) {
    const b = h('button', { type: 'button', class: 'pmu-iconbtn', 'aria-label': label, 'data-fk': fk || null, html: icon(name, 16) });
    tip(b, label, detail);
    b.addEventListener('click', (e) => run(e, b));
    return b;
  }
  /* a menu control in Usage's head: lead icon, the current value, chevron (no "Sort by:" label) */
  function ctlBtn(lead, label, run, fk) {
    const text = h('span.pmu-ctltext');
    const b = h('button', { type: 'button', class: 'pmu-ctlbtn pmu-ctlmenu', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'data-fk': fk || null },
      h('span.pmu-ctllead', { html: icon(lead, 16), 'aria-hidden': 'true' }), text, h('span.pmu-ico.pmu-ctlchev', { html: icon('chevron-down', 14), 'aria-hidden': 'true' }));
    b.pjxText = text;
    tip(b, label);
    b.addEventListener('click', () => run(b));
    return b;
  }
  /* a labelled button; a disabled one stays focusable and hoverable so its reason can be read */
  function btn(cls, label, iconName, run, o) {
    o = o || {};
    const b = h('button', { type: 'button', class: cls, 'data-fk': o.fk || null, 'aria-haspopup': o.menu ? 'menu' : null, 'aria-expanded': o.menu ? 'false' : null },
      iconName ? h('span.pjxb-bico', { html: icon(iconName, 15), 'aria-hidden': 'true' }) : null,
      h('span.pjxb-blabel', { text: label }),
      o.chev ? h('span.pjxb-bchev', { html: icon('chevron-down', 12), 'aria-hidden': 'true' }) : null);
    if (o.disabled) { b.setAttribute('aria-disabled', 'true'); tip(b, label, o.disabled); }
    else if (o.tip) tip(b, o.tip[0], o.tip[1]);
    b.addEventListener('click', (e) => {
      if (b.getAttribute('aria-disabled') === 'true') { e.preventDefault(); if (o.onRefused) o.onRefused(b); else if (o.disabled) announce(o.disabled); return; }
      run(e, b);
    });
    return b;
  }
  /* Sort and Rows in one menu: the order, then how tall a row is (each group marks its own current choice) */
  function sortGroups() {
    return [
      { label: 'Sort', items: SORTS.filter((x) => !x.hidden || x.id === S.sort).map((x) => ({ value: 'sort:' + x.id, label: x.label, icon: x.icon, selected: S.sort === x.id, meta: S.sort === x.id && S.dir === -1 ? 'Reversed' : '' })) },
      { label: 'Rows', items: [{ value: 'rows:two', label: 'Comfortable', icon: 'rows', meta: 'Two lines', selected: !S.dense }, { value: 'rows:one', label: 'Compact', icon: 'list', meta: 'One line', selected: !!S.dense }] }
    ];
  }
  function pickSortValue(v) {
    const [k, id] = String(v).split(':');
    if (k === 'sort') { S.sort = id; S.dir = 1; render(); announce('Sorted: ' + sortOf(id).label); }
    else if (k === 'rows') { S.dense = id === 'one'; render(); announce(S.dense ? 'Compact rows' : 'Comfortable rows'); }
    else if (k === 'view') setView(id);
  }
  function sortMenu(anchor) {
    if (!(W.PMR && W.PMR.menu)) return;
    if (W.PMR.menu.isOpen(anchor)) { W.PMR.menu.closeAll(); return; }
    W.PMR.menu.open({ id: PJX.uid('m'), label: 'Sort and rows', groups: sortGroups() }, anchor, { align: 'end', onPick: (it) => { if (it && it.value != null) pickSortValue(it.value); } });
  }
  /* the views; on the narrowest page, where Sort has folded away, Sort and Rows ride in this menu too */
  function viewMenu(anchor) {
    if (!(W.PMR && W.PMR.menu)) return;
    if (W.PMR.menu.isOpen(anchor)) { W.PMR.menu.closeAll(); return; }
    const c = PJX.counts();
    const groups = [{ label: 'View', items: VIEWS.map((v) => ({ value: 'view:' + v.id, label: v.label, icon: v.icon, meta: String(c[v.count] || 0), selected: S.view === v.id })) }];
    if (S.els.sortBtn.offsetParent === null && PJX.all().length) sortGroups().forEach((g) => groups.push(g));
    W.PMR.menu.open({ id: PJX.uid('m'), label: 'View', groups }, anchor, { align: 'start', onPick: (it) => { if (it && it.value != null) pickSortValue(it.value); } });
  }
  function moreMenu(anchor, p) {
    if (!(W.PMR && W.PMR.menu)) return;
    if (W.PMR.menu.isOpen(anchor)) { W.PMR.menu.closeAll(); return; }
    const extra = [{ items: [{ label: 'Details', icon: 'info', key: 'Enter', run: () => openProject(p.id) }] }];
    PJX.menu(anchor, PJX.moreItems(p, extra), { label: 'Actions for ' + p.name });
  }
  const closeMenus = () => { try { if (W.PMR && W.PMR.menu) W.PMR.menu.closeAll(); } catch (e) { /* none open */ } };

  /* ------------------------------------------------------------------ mount */
  function mount(root) {
    S = fresh(root);
    build(root);
    S.offs.push(
      PJX.on('op', () => schedule()),
      PJX.on('pjx-show', (e) => { if (e && e.view) setView(e.view === 'archived' ? 'archived' : e.view); }),
      PJX.on('change', onWorldChange)
    );
    watchNotices();
    render();
  }
  function unmount() {
    if (!S) return;
    S.offs.forEach((f) => f());
    S.timers.forEach((t) => clearTimeout(t));
    if (S.raf) cancelAnimationFrame(S.raf);
    if (S.ro) S.ro.disconnect();
    if (S.notes) S.notes.stop();
    if (S.sheet) S.sheet.dispose();
    closeMenus();
    S = null;
  }

  /* ------------------------------------------------------------------ the title bar's notes, out of the head's way
     PMConcept7's notes (#rsStage) drop from the bell over the right of the page head, where Search, Refresh and New
     Project are. While this page shows they sit at the bottom right of the ledger instead, the way Usage moves them for
     its own stage: their own place is read with no offset, then a translate carries the stack's right edge 18 px inside
     the ledger's and its bottom edge 18 px above the stage's, so the stack grows upward. While the New Project sheet is
     open they keep to the stage's bottom left, clear of its Create button. They still take no pointer (core.css). The
     stack has a transition on everything, so each placement is applied with it held off; it is placed again only when
     a note arrives or leaves, or when the ledger, the details or the sheet change the room it has. */
  function watchNotices() {
    const rs = D.getElementById('rsStage');
    if (!rs) return;
    let raf = 0, still = 0, lastKey = '';
    const place = (force) => {
      raf = 0;
      if (!S || !rs.firstElementChild || !S.root.isConnected || !S.els.stage.offsetParent) return;
      const st = S.els.stage.getBoundingClientRect();
      if (!st.width || !st.height) return;
      const sh = S.els.sheetHost.querySelector('.pjxb-sheet');
      const over = S.els.body.getAttribute('data-insp') === 'over';
      const mr = S.els.main.getBoundingClientRect();
      const key = [Math.round(st.left), Math.round(st.right), Math.round(st.bottom), Math.round(mr.right), over, !!sh, rs.childElementCount].join('|');
      if (!force && key === lastKey) return;
      lastKey = key;
      rs.classList.add('pjxb-rs-measure');
      const r = rs.getBoundingClientRect();
      let left = Infinity, right = 0;
      for (let c = rs.firstElementChild; c; c = c.nextElementSibling) { const b = c.getBoundingClientRect(); left = Math.min(left, b.left); right = Math.max(right, b.right); }
      if (!right) { left = r.left; right = r.right; }
      const dx = sh ? Math.round(st.left + 18 - left) : Math.round((over ? st.right : mr.right) - 18 - right);
      rs.style.setProperty('--pjxb-rs-x', dx + 'px');
      rs.style.setProperty('--pjxb-rs-y', 'calc(' + Math.round(st.bottom - 18 - r.top) + 'px - 100%)');
      // the new place takes effect with the transition held off, then the transition comes back for the notes' own motion
      rs.classList.add('pjxb-rs-still');
      rs.classList.remove('pjxb-rs-measure');
      void getComputedStyle(rs).translate;
      cancelAnimationFrame(still);
      still = requestAnimationFrame(() => requestAnimationFrame(() => rs.classList.remove('pjxb-rs-still')));
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(() => place(false)); };
    const mo = W.MutationObserver ? new W.MutationObserver(() => place(true)) : null;
    if (mo) mo.observe(rs, { childList: true });
    S.notes = {
      queue,
      stop() {
        if (mo) mo.disconnect(); if (raf) cancelAnimationFrame(raf); cancelAnimationFrame(still);
        rs.classList.add('pjxb-rs-still');
        rs.style.removeProperty('--pjxb-rs-x'); rs.style.removeProperty('--pjxb-rs-y'); rs.classList.remove('pjxb-rs-measure');
        void getComputedStyle(rs).translate;
        requestAnimationFrame(() => rs.classList.remove('pjxb-rs-still'));
      }
    };
    place(true);
  }

  /* ------------------------------------------------------------------ Setup didn't finish, in the details
     Continue setup shows in the project's own details rather than a dialog: what was already made, what is left, and
     the one button, then each remaining step as it runs and a finished state with Open and Plan it. The steps are a
     copy taken when the panel opens, so the end state still has them after the owner clears the project's recovery. */
  function onResume(e) {
    if (!S || !e) return false;
    const p = PJX.get(e.id);
    if (!p || !p.recovery) return false;
    if (S.sheet && S.sheet.phase !== 'creating') S.sheet.dispose(true);
    if (!S.resume || S.resume.id !== p.id || S.resume.done) {
      S.resume = { id: p.id, settled: p.recovery.settled.slice(), remaining: p.recovery.remaining.slice(), text: ((p.attention || []).find((a) => a.code === 'setup_unfinished') || {}).text || '', states: p.recovery.remaining.map(() => 'pending'), running: false, done: false };
    }
    openProject(p.id, 'overview');
    later(() => { const b = S.els.insp.querySelector('[data-fk="rs-go"]'); if (b) b.focus({ preventScroll: true }); }, 30);
    return true;
  }
  async function runResume() {
    const R = S && S.resume;
    if (!R || R.running || R.done) return;
    const id = R.id;
    R.running = true;
    const off = PJX.on('op', (op) => {
      if (!S || S.resume !== R || op.id !== id || op.kind !== 'resume') return;
      R.states = R.remaining.map((_, i) => (op.done || i < op.i ? 'complete' : i === op.i ? 'working' : 'pending'));
      schedule();
    });
    try { await PJX.ACT.resume(id); } finally { off(); }
    if (!S || S.resume !== R) return;
    R.running = false; R.done = true; R.states = R.remaining.map(() => 'complete');
    render();
    const b = S.els.insp.querySelector('[data-fk="rs-open"]'); if (b) b.focus({ preventScroll: true });
    announce(PJX.get(id) ? PJX.get(id).name + ' is ready' : 'Setup finished');
  }
  function onWorldChange(e) {
    if (!S || !e) return;
    if (e.why === 'remove') { later(schedule, 15200); if (S.sel === e.id) { S.inspOpen = false; S.sel = null; } }
    if (e.why === 'delete' && S.sel === e.id) { S.inspOpen = false; S.sel = null; }
    if (e.why === 'archive' && S.sel === e.id && S.view !== 'archived') { S.inspOpen = false; }
    if (e.why === 'unarchive' && S.view === 'archived' && S.sel === e.id) { S.inspOpen = false; }
    if (e.why === 'add' && e.id) {
      // a project that was just made shows where the person is looking, once, with a short wash
      S.flash = { id: e.id, at: Date.now() };
      if (S.view !== 'all' && S.view !== 'attention' && !viewOf(S.view).test(PJX.get(e.id) || {})) S.view = 'all';
      S.focus = e.id;
      later(() => { const r = S.rows.get(e.id); if (r && r.el.isConnected) r.el.scrollIntoView({ block: 'nearest', behavior: PJX.reduced() ? 'auto' : 'smooth' }); }, 60);
      later(() => { if (S.flash && S.flash.id === e.id) { S.flash = null; schedule(); } }, 2600);
    }
    schedule();
  }

  /* ------------------------------------------------------------------ the skeleton */
  function build(root) {
    const E = S.els;
    root.innerHTML = '';
    const tid = PJX.uid('pjxb-title'), iid = PJX.uid('pjxb-insp'), hint = PJX.uid('pjxb-hint');
    E.shell = h('div', { class: 'pmu-shell pjxb-shell', id: 'pjxbShell' });

    /* the rail: Usage's room list, as views of the one list */
    E.rail = h('aside', { class: 'pmu-rail pjxb-rail', 'aria-label': 'Project views', 'data-lg-surface': 'panel' });
    E.brandCount = h('span.pjxb-brandcount');
    E.rail.appendChild(h('div.pmu-brand', null, h('h1', { text: 'Projects' }), E.brandCount));
    E.nav = h('nav', { class: 'pmu-nav pjxb-nav', 'aria-label': 'Project views' });
    E.navBtns = {};
    let group = 0;
    VIEWS.forEach((v) => {
      if (v.group !== group) { E.nav.appendChild(h('span.pjxb-navsep', { 'aria-hidden': 'true' })); group = v.group; }
      const b = h('button', { type: 'button', class: 'pmu-navbtn', 'data-view': v.id, 'data-fk': 'nav:' + v.id },
        h('span.pmu-navicon', { html: icon(v.icon, 16), 'aria-hidden': 'true' }),
        h('span.pmu-navtext', { text: v.label }),
        h('span', { class: ['pmu-navcount', 'pjxb-count', v.warn && 'is-warn'] }));
      b.addEventListener('click', () => setView(v.id));
      E.navBtns[v.id] = b;
      E.nav.appendChild(b);
    });
    E.rail.appendChild(E.nav);
    E.railFoot = h('div.pjxb-railfoot', { role: 'group', 'aria-label': 'How your projects are kept safe' });
    E.rail.appendChild(E.railFoot);

    /* the stage: Usage's one-line head, then the ledger and the inspector side by side */
    E.stage = h('section', { class: 'pmu-stage pjxb-stage', 'aria-labelledby': tid });
    E.head = h('header', { class: 'pmu-stagehead pjxb-head', 'data-lg-surface': 'bar' });
    // once the rail has folded away, the view's title is itself the View menu: the title, a chevron, the views
    E.viewText = h('span.pjxb-viewtext');
    E.viewBtn = h('button', { type: 'button', class: 'pjxb-viewbtn', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'data-fk': 'viewbtn' },
      E.viewText, h('span.pjxb-viewchev', { html: icon('chevron-down', 14), 'aria-hidden': 'true' }));
    tip(E.viewBtn, 'Choose a view', 'All projects, Need you, Working, where they live, Not backed up, Archived');
    E.viewBtn.addEventListener('click', () => viewMenu(E.viewBtn));
    E.title = h('h2', { class: 'pjxb-title', id: tid, tabindex: '-1' });
    E.desc = h('p.pmu-roomdesc');
    E.titleblock = h('div', { class: 'pmu-titleblock pjxb-titleblock' }, E.title, E.desc);
    // Sort says its current order while there is room, and the word Sort when there is not (never a bare icon); the
    // same menu sets the row height
    E.sortBtn = ctlBtn('sliders', 'Sort and rows', (b) => sortMenu(b), 'sort');
    E.sortBtn.classList.add('pjxb-sortbtn');
    E.sortBtn.pjxText.append(h('span.pjxb-sortlong'), h('span', { class: 'pjxb-sortshort', text: 'Sort' }));
    E.search = h('input', { type: 'search', class: 'pjxb-searchin', placeholder: 'Search projects', 'aria-label': 'Search projects', autocomplete: 'off', spellcheck: 'false', 'data-fk': 'search' });
    E.searchWrap = h('label.pjxb-search', null, h('span.pjxb-searchico', { html: icon('search', 15), 'aria-hidden': 'true' }), E.search);
    E.search.addEventListener('input', () => { S.q = E.search.value; render(); });
    E.search.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (E.search.value) { e.stopPropagation(); E.search.value = ''; S.q = ''; render(); }
      else if (S.searchOpen) { e.stopPropagation(); S.searchOpen = false; render(); E.searchBtn.focus(); }
    });
    E.search.addEventListener('blur', () => { if (S && S.searchOpen && !E.search.value) later(() => { if (D.activeElement !== E.search && S.searchOpen && !E.search.value) { S.searchOpen = false; render(); } }, 120); });
    E.searchBtn = iconBtn('search', 'Search projects', 'Names, folders, online copies and backups', () => { S.searchOpen = true; render(); E.search.focus(); }, 'searchbtn');
    E.searchBtn.classList.add('pjxb-searchbtn');
    E.refresh = iconBtn('refresh', 'Refresh', 'Look at every project’s folder, history, online copy and backup again', () => refresh(), 'refresh');
    E.newBtn = btn('pmw-act is-primary pjxb-new', 'New Project', 'plus', () => openNew({}), { fk: 'new' });
    E.refresh.classList.add('pjxb-refresh');
    // on the narrowest stage the head takes two lines; this empty element is where the second one begins (b.css)
    E.ctl = h('div', { class: 'pmu-headctl pjxb-ctl' }, E.sortBtn, E.searchWrap, E.searchBtn, E.refresh, E.newBtn, h('span.pjxb-hbreak', { 'aria-hidden': 'true' }));
    E.head.append(E.viewBtn, E.titleblock, E.ctl);

    E.body = h('div.pjxb-body');
    E.main = h('div.pjxb-main');
    E.top = h('div.pjxb-top');
    E.plate = h('article', { class: 'pmu-card pjxb-plate', 'data-head': 'line', 'data-lg-surface': 'card', 'aria-labelledby': tid });
    E.grid = h('div', { class: 'pjxb-grid', role: 'grid', 'aria-labelledby': tid, 'aria-describedby': hint });
    E.colhead = h('div', { class: 'pjxb-colhead', role: 'rowgroup' });
    E.hrow = h('div', { class: 'pjxb-row pjxb-hrow', role: 'row' });
    E.hcells = {};
    COLS.forEach((c) => {
      const cell = h('div', { class: ['pjxb-c', 'pjxb-c-' + c.id, 'pjxb-hc'], role: 'columnheader' });
      if (c.sort) {
        const b = h('button', { type: 'button', class: 'pjxb-sorth', 'data-fk': 'col:' + c.id }, h('span', { text: c.label }), h('span.pjxb-sortmark', { 'aria-hidden': 'true' }));
        b.addEventListener('click', () => { if (S.sort === c.sort) S.dir = -S.dir; else { S.sort = c.sort; S.dir = 1; } render(); });
        cell.appendChild(b);
      } else cell.appendChild(h('span', { class: c.hide ? 'pjx-sr' : 'pjxb-hlabel', text: c.label }));
      E.hcells[c.id] = cell;
      E.hrow.appendChild(cell);
    });
    E.colhead.appendChild(E.hrow);
    E.rowsEl = h('div', { class: 'pjxb-rows', role: 'rowgroup' });
    E.grid.append(E.colhead, E.rowsEl);
    E.foot = h('footer', { class: 'pmu-cardfoot pjxb-foot' });
    E.footCount = h('span.pjxb-footcount');
    E.foot.append(E.footCount, h('span.pjx-grow'), h('span', { class: 'pjxb-keys', id: hint },
      h('kbd', { text: '↑' }), h('kbd', { text: '↓' }), h('span', { text: ' move · ' }), h('kbd', { text: 'Enter' }), h('span', { text: ' details · ' }), h('kbd', { text: 'Esc' }), h('span', { text: ' close' })));
    E.plate.append(E.grid, E.foot);
    E.empty = h('div.pjxb-empty');
    E.main.append(E.top, E.plate, E.empty);
    E.insp = h('aside', { class: 'pmu-inspector pjxb-insp', 'aria-labelledby': iid, 'data-lg-surface': 'panel' });
    E.insp.hidden = true;
    E.inspId = iid;
    E.body.append(E.main, E.insp);
    E.sheetHost = h('div.pjxb-sheethost');
    E.stage.append(E.head, E.body, E.sheetHost);
    E.live = h('div', { class: 'pjx-sr', 'aria-live': 'polite' });
    E.shell.append(E.rail, E.stage, E.live);
    root.appendChild(E.shell);

    wireGrid();
    // Escape closes the details from anywhere on the page (a menu, a dialog or the New Project sheet answer it first)
    E.shell.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented || !S.inspOpen || S.sheet) return;
      if (W.PMR && W.PMR.menu && W.PMR.menu.isOpen()) return;
      if (e.target === E.search && E.search.value) return;
      e.preventDefault(); closeInspector();
    });
    // the inspector docks beside the ledger when the stage has room, and covers it when it hasn't (b.css reads data-insp)
    if (W.ResizeObserver) {
      S.ro = new W.ResizeObserver(() => {
        if (!S) return;
        const w = E.stage.clientWidth, mode = w >= 690 ? 'dock' : 'over';
        if (mode !== S.inspMode) { S.inspMode = mode; schedule(); }
        fitDesc();
        fitRows();
        if (S.notes) S.notes.queue();
      });
      S.ro.observe(E.stage);
    }
  }

  /* ------------------------------------------------------------------ render */
  function focusKey() {
    const a = D.activeElement;
    if (!S || !a || !S.root.contains(a)) return null;
    const k = a.closest('[data-fk]');
    return k ? k.getAttribute('data-fk') : null;
  }
  function restoreFocus(key) {
    if (!key) return;
    const a = D.activeElement;
    if (a && a !== D.body && S.root.contains(a) && a.isConnected) return;
    const el = S.root.querySelector('[data-fk="' + key.replace(/"/g, '\\"') + '"]');
    if (el && el.offsetParent !== null) el.focus({ preventScroll: true });
  }
  function render() {
    if (!S || !S.root.isConnected) return;
    const key = focusKey();
    S.root.setAttribute('data-look', PJX.look());
    // the list first: the head's description, the ledger and its foot all count the same rows
    const list = currentList();
    S.list = list.map((p) => p.id);
    renderRail();
    renderHead(list);
    renderBoard(list);
    fitRows();
    renderInspector();
    if (S.sheet) S.sheet.render();
    restoreFocus(key);
    if (S.notes) S.notes.queue();
  }

  /* the rail: counts, the chosen view, and the Kept safe summary at its foot */
  function renderRail() {
    const E = S.els, c = PJX.counts();
    E.nav.setAttribute('data-view', S.view);
    E.brandCount.textContent = String(c.all);
    E.brandCount.setAttribute('aria-label', plural(c.all, 'project') + ' in your list');
    VIEWS.forEach((v) => {
      const b = E.navBtns[v.id], n = c[v.count] || 0, on = S.view === v.id;
      b.classList.toggle('active', on);
      if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      const cnt = b.querySelector('.pjxb-count');
      cnt.textContent = String(n);
      cnt.classList.toggle('is-zero', !n);
      cnt.classList.toggle('is-warn', !!v.warn && n > 0);
      b.setAttribute('data-pm-hover-label', v.label);
      b.setAttribute('data-pm-hover-detail', plural(n, 'project'));
      b.setAttribute('aria-label', v.label + ', ' + plural(n, 'project'));
    });
    // the foot: how many listed projects keep history, an online copy and a backup
    const L = PJX.listed(), n = L.length;
    const hist = L.filter((p) => p.history && p.history.backend && p.history.backend !== 'none').length;
    const onl = L.filter((p) => p.online && p.online.service).length;
    const bak = L.filter((p) => p.backup && p.backup.dest).length;
    const sig = [n, hist, onl, bak, PJX.look()].join('|');
    if (E.railFoot.dataset.sig === sig) return;
    E.railFoot.dataset.sig = sig;
    E.railFoot.innerHTML = '';
    if (!n) return;
    const line = (label, k, detail) => {
      const key = k === n ? 'complete' : k ? 'warning' : 'off';
      const el = h('div', { class: 'pjxb-rf-row', 'data-tone': parts().tone(key) },
        h('span.pjx-st-mark', { html: PJX.calm(key, 14), 'aria-hidden': 'true' }),
        h('span.pjxb-rf-label', { text: label }),
        h('span.pjxb-rf-n', null, h('b', { text: String(k) }), h('span', { text: ' of ' + n })));
      tip(el, label + ': ' + k + ' of ' + n, detail);
      return el;
    };
    E.railFoot.append(h('div.pjxb-rf-head', { text: 'Kept safe' }),
      line('History', hist, 'Projects keeping every version on their own computer (Git or Jujutsu)'),
      line('Online copy', onl, 'Projects with a copy on GitHub, GitLab or another service'),
      line('Backup', bak, 'Projects with a backup of everything, plans and chats included'));
  }

  function setView(id) {
    if (!S) return;
    const v = viewOf(id);
    if (S.view === v.id) { render(); return; }
    S.view = v.id;
    if (S.inspOpen) { const p = PJX.get(S.sel); if (!p || !v.test(p) || (v.archived ? p.lifecycle !== 'archived' : p.lifecycle === 'archived')) S.inspOpen = false; }
    S.focus = null;
    S.els.rowsEl.scrollTop = 0;
    S.els.main.setAttribute('data-enter', '');
    later(() => S.els.main.removeAttribute('data-enter'), 260);
    render();
    announce(v.label + ': ' + plural(S.list.length, 'project'));
  }

  function renderHead(list) {
    const E = S.els, v = viewOf(S.view), so = sortOf(S.sort);
    E.title.textContent = v.label;
    const shown = list.length;
    const base = v.archived ? PJX.archived().length : PJX.listed().filter(v.test).length;
    // the description in up to three lengths; fitDesc shows the longest that fits whole, or none (never cut mid-word)
    const q = S.q.trim();
    let full, short;
    if (!PJX.all().length) full = short = 'None yet · add your first one';
    else if (q) { full = shown + ' of ' + base + ' match “' + q + '”'; short = shown + ' of ' + base; }
    else {
      full = plural(base, 'project') + (base > 1 ? ' · ' + (S.dir === 1 ? so.say : 'reversed: ' + so.say) : '') + (S.checked ? ' · checked ' + S.checked : '');
      short = plural(base, 'project') + (S.checked ? ' · checked ' + S.checked : '');
    }
    E.desc.dataset.full = full; E.desc.dataset.short = short;
    E.title.setAttribute('data-pm-hover-label', v.label);
    E.title.setAttribute('data-pm-hover-detail', full);
    E.sortBtn.querySelector('.pjxb-sortlong').textContent = so.label + (S.dir === -1 ? ' (reversed)' : '');
    E.sortBtn.setAttribute('aria-label', 'Sort and rows: ' + so.label + (S.dir === -1 ? ', reversed' : '') + ', ' + (S.dense ? 'compact' : 'comfortable') + ' rows');
    E.viewText.textContent = v.label;
    E.viewBtn.setAttribute('aria-label', 'View: ' + v.label + ', ' + plural(shown, 'project'));
    E.head.toggleAttribute('data-search-open', !!S.searchOpen);
    E.head.toggleAttribute('data-searching', !!q);
    if (E.search.value !== S.q) E.search.value = S.q;
    const empty = !PJX.all().length;
    [E.sortBtn, E.searchWrap, E.searchBtn].forEach((x) => { x.hidden = empty; });
    fitDesc();
  }
  /* when each row was opened, at the end of its name's line: whole, then short ("2 wk", "6:10 PM"), or not at all, so
     it never cuts a name or itself. All reads first, then all writes, so the ledger lays out once or twice, not per row */
  function fitRows() {
    if (!S) return;
    const els = Array.from(S.els.rowsEl.querySelectorAll('.pjxb-otext'));
    const acts = Array.from(S.els.rowsEl.querySelectorAll('.pjxb-c-sub .pjxb-actline'));
    els.forEach((t) => { t.textContent = t.dataset.full; t.parentNode.classList.remove('is-cut'); });
    acts.forEach((a) => a.classList.remove('is-cut'));
    const cut = (t) => t.offsetParent && t.scrollWidth > t.clientWidth + 1;
    // what a project is doing, after its status: shown when a few words of it fit, never as a stub ("Co…")
    const stubs = acts.filter((a) => a.offsetParent && a.clientWidth < 64 && a.scrollWidth > a.clientWidth + 1);
    const long = els.filter(cut);
    stubs.forEach((a) => a.classList.add('is-cut'));
    long.forEach((t) => { t.textContent = t.dataset.short; });
    long.filter(cut).forEach((t) => t.parentNode.classList.add('is-cut'));
  }
  /* the head's description shows whole or not at all, as Usage's does: the full words, then the short ones, then none */
  function fitDesc() {
    if (!S) return;
    const el = S.els.desc, full = el.dataset.full || '', short = el.dataset.short || '';
    el.hidden = false;
    el.textContent = full;
    if (!el.clientWidth) return;               // folded away by the head's own width (b.css)
    if (el.scrollWidth > el.clientWidth + 1 && short !== full) el.textContent = short;
    if (el.scrollWidth > el.clientWidth + 1) el.hidden = true;
  }

  /* ------------------------------------------------------------------ the ledger */
  function matches(p) {
    const q = S.q.trim().toLowerCase();
    if (!q) return true;
    const hay = [p.name, p.where.path, p.where.label, p.where.device, p.online.service, p.online.repo, p.backup.dest, p.activity && p.activity.text,
      (p.stack || []).join(' '), (p.attention || []).map((a) => a.title).join(' '), p.history.backend, p.history.branch].filter(Boolean).join(' ').toLowerCase();
    return q.split(/\s+/).every((w) => hay.indexOf(w) >= 0);
  }
  function currentList() {
    const v = viewOf(S.view);
    const pool = v.archived ? PJX.archived() : PJX.listed();
    const cmp = CMP[S.sort] || CMP.opened;
    return pool.filter(v.test).filter(matches).sort((a, b) => S.dir * cmp(a, b) || a.order - b.order);
  }
  function signature(p) {
    const op = liveOp(p);
    return JSON.stringify([p.name, p.glyph, p.active, p.lifecycle, p.where, p.activity, p.history, p.online, p.backup, p.attention, p.opened, p.archivedAt,
      op ? [op.kind, op.label, op.phase] : 0, PJX.look(), S.flash && S.flash.id === p.id ? S.flash.at : 0, PJX.reduced()]);
  }

  function renderBoard(list) {
    const E = S.els;
    const v = viewOf(S.view);

    // the undo strip after a removal, above the plate (kept while it says the same, so its Undo keeps focus)
    const undo = parts().undoStrip();
    const was = E.top.firstChild;
    if (!undo) E.top.innerHTML = '';
    else if (!was || was.textContent !== undo.textContent) { E.top.innerHTML = ''; undo.querySelector('button') && undo.querySelector('button').setAttribute('data-fk', 'undo'); E.top.appendChild(undo); }

    // empty states: the first run, an empty view, a search with no match
    const none = !list.length && !S.creating;
    E.plate.hidden = none;
    E.empty.hidden = !none;
    E.main.toggleAttribute('data-empty', none);
    if (none) renderEmpty(v); else E.empty.innerHTML = '';

    // the column header: which column sorts, and which way
    COLS.forEach((c) => {
      const cell = E.hcells[c.id], on = c.sort && c.sort === S.sort;
      cell.setAttribute('aria-sort', on ? (S.dir === 1 ? 'ascending' : 'descending') : 'none');
      if (!c.sort) cell.removeAttribute('aria-sort');
      const m = cell.querySelector('.pjxb-sortmark');
      if (m) m.innerHTML = on ? icon(S.dir === 1 ? 'chevron-down' : 'chevron-up', 12) : '';
      cell.classList.toggle('is-sorted', !!on);
    });
    E.plate.setAttribute('data-view', S.view);
    E.plate.toggleAttribute('data-dense', !!S.dense);
    E.grid.setAttribute('aria-rowcount', String(list.length + 1));

    // rows, kept by id and redrawn only when what they show changed
    const want = [];
    if (S.creating && !v.archived) want.push(creatingRow());
    list.forEach((p, i) => {
      const sig = signature(p);
      let rec = S.rows.get(p.id);
      if (!rec || rec.sig !== sig) {
        const el = rowEl(p);
        if (rec && rec.el.isConnected) rec.el.replaceWith(el);
        rec = { sig, el };
        S.rows.set(p.id, rec);
      }
      rec.el.setAttribute('aria-rowindex', String(i + 2));
      want.push(rec.el);
    });
    Array.from(E.rowsEl.children).forEach((c) => { if (want.indexOf(c) < 0) c.remove(); });
    want.forEach((el, i) => { if (E.rowsEl.children[i] !== el) E.rowsEl.insertBefore(el, E.rowsEl.children[i] || null); });
    S.rows.forEach((rec, id) => { if (!PJX.get(id)) S.rows.delete(id); });

    // selection and the one tab stop (roving): the focused row, else the selected one, else the first
    if (S.focus && S.list.indexOf(S.focus) < 0) S.focus = null;
    const rov = S.focus || (S.inspOpen && S.list.indexOf(S.sel) >= 0 ? S.sel : S.list[0]);
    list.forEach((p) => {
      const el = S.rows.get(p.id).el, sel = S.inspOpen && S.sel === p.id;
      el.classList.toggle('is-sel', sel);
      el.setAttribute('aria-selected', String(sel));
      setRoving(el, p.id === rov);
    });
    E.footCount.textContent = S.q.trim() ? list.length + ' of ' + (v.archived ? PJX.archived().length : PJX.listed().filter(v.test).length) + ' shown' : plural(list.length, v.archived ? 'archived project' : 'project');
  }
  function setRoving(el, on) {
    el.tabIndex = on ? 0 : -1;
    el.querySelectorAll('button').forEach((b) => { b.tabIndex = on ? 0 : -1; });
  }

  /* one row: a CSS grid whose first line is the columns and whose second line, when there is one, is the problem with
     its fix. It is a role=row of gridcells (never a button around buttons); the row itself takes focus. */
  function rowEl(p) {
    const pr = PJX.primary(p), sf = PJX.safety(p), op = liveOp(p);
    const arch = p.lifecycle === 'archived';
    const line = arch ? null : lineItem(p);
    const fix = arch || op ? null : cellFix(p);
    const row = h('div', { class: ['pjxb-row', line && 'has-line', op && 'is-busy', p.fresh && S.flash && S.flash.id === p.id && 'is-flash'], role: 'row', tabindex: '-1',
      'data-id': p.id, 'data-fk': 'row:' + p.id, 'data-tone': parts().tone(line ? line.item.key : pr.key), 'data-pmh': 'row', 'aria-current': p.active ? 'true' : null });
    // the row's own hover label (otherwise PMConcept7's hover tag guesses "Choose this option")
    tip(row, p.name, 'Click or Enter for details · Shift+F10 for More');

    // Project: glyph, name (and Open now, or when it was opened once the Opened column has folded away); under it
    // what it is doing. On a narrower ledger the status takes the start of that line (b.css), and a row whose status is
    // a problem lets the problem speak alone: what it was doing is in its details
    const l1 = h('span.pjxb-l1', null, h('span.pjxb-name', { text: p.name }));
    if (p.active) l1.appendChild(h('span', { class: 'pjxb-now', html: icon('open', 12) + '<span>Open now</span>' }));
    const opened = openedEl(p);
    if (opened) l1.appendChild(opened);
    row.appendChild(h('div', { class: 'pjxb-c pjxb-c-name', role: 'rowheader' },
      h('span.pjxb-glyph', { html: icon(p.glyph, 16), 'aria-hidden': 'true' }), l1));
    const place = p.where.kind !== 'local' && pr.word.indexOf(p.where.device || p.where.label) < 0 ? 'On ' + (p.where.device || p.where.label) + ' · ' : '';
    row.appendChild(h('div', { class: ['pjxb-c', 'pjxb-c-sub', op && 'has-op'], role: 'gridcell', 'data-src': op ? 'op' : pr.source },
      h('span', { class: 'pjxb-actline', text: arch ? 'Files, history and backups kept' : place + activityLine(p) }),
      op ? h('span', { class: 'pjxb-opphase', text: op.phase }) : null));

    // Status: the one state (PJX.primary); while an owner operation runs, its phase under it. Marks are still in the
    // list; only work running and something that needs you move (F3-658). On the narrowest ledger the three Kept safe
    // marks ride at the end of this line, and a backup's fix follows the status once the Backup column has folded
    const stWord = arch ? (p.archivedAt || 'Archived') : pr.word;
    const stFix = fix ? fixLink(p, fix, 'stfix:' + p.id) : null;
    if (stFix) stFix.classList.add('pjxb-stfix');
    const stCell = h('div', { class: 'pjxb-c pjxb-c-status', role: 'gridcell' },
      h('span.pjxb-two', null, parts().st(pr.key, stWord, { cls: 'pjxb-st', moving: pr.key === 'working' || pr.key === 'waiting' }), op ? h('span', { class: 'pjxb-l2 pjxb-stsub', text: op.phase }) : null),
      stFix,
      h('span', { class: 'pjxb-stmarks', 'aria-hidden': 'true' }, ...['history', 'online', 'backup'].map((k) => parts().st(sf[k].key, sf[k].label + ': ' + sf[k].text, { noWord: true, calm: true, cls: 'pjxb-mini' }))));
    tip(stCell.firstElementChild, stWord, op ? op.label + ' · ' + op.phase : arch ? 'Files, history and backups kept' : activityLine(p));
    row.appendChild(stCell);

    // Where: the place, then the folder (middle-shortened, its full path in the hover label)
    row.appendChild(h('div', { class: 'pjxb-c pjxb-c-where', role: 'gridcell' },
      h('span.pjxb-two', null, h('span', { class: ['pjxb-l1', p.where.missing && 'is-missing'], text: p.where.missing ? 'Folder missing' : placeText(p) }), pathEl(p, 26, 'pjxb-l2'))));

    // History · Online copy · Backup: a mark, the word, and its detail under it
    const hist = sf.history, jj = p.history.backend === 'jujutsu';
    // under the word: the branch (Git) or bookmark (Jujutsu); worktree and workspace counts are in the hover label
    const histSub = hist.word === 'Off' ? 'No history kept' : (jj ? 'bookmark ' : '') + p.history.branch;
    row.appendChild(safeCell('hist', hist, hist.word === 'Off' ? 'Off' : hist.word, histSub));
    const o = p.online || {}, on = sf.online;
    row.appendChild(safeCell('onl', on, o.service || 'None', onlineShort(o, sf)));
    const b = p.backup || {}, bk = sf.backup;
    const bkL1 = !b.dest ? 'None' : bk.key === 'working' ? 'Backing up…' : b.last ? b.last : 'Not yet';
    // a backup that needs doing carries its fix under its word, where the eye already is
    row.appendChild(safeCell('bak', bk, bkL1, fix ? fixLink(p, fix, 'cellfix:' + p.id) : b.dest || ''));
    // folded: the same three as marks, each with its sentence as the hover label
    row.appendChild(h('div', { class: 'pjxb-c pjxb-c-safe', role: 'gridcell' },
      parts().st(hist.key, 'History: ' + hist.text, { noWord: true, calm: true, cls: 'pjxb-mini' }),
      parts().st(on.key, 'Online copy: ' + on.text, { noWord: true, calm: true, cls: 'pjxb-mini' }),
      parts().st(bk.key, 'Backup: ' + bk.text, { noWord: true, calm: true, cls: 'pjxb-mini' })));
    row.appendChild(h('div', { class: 'pjxb-c pjxb-c-opened', role: 'gridcell' }, h('span', { class: 'pjxb-l1', text: p.opened })));

    // Open and More, always labelled; Open says why when it can't run
    const acts = h('div', { class: 'pjxb-c pjxb-c-act', role: 'gridcell' });
    if (arch) acts.appendChild(btn('pjxb-rbtn pjxb-unarch', 'Unarchive', null, () => PJX.ACT.unarchive(p.id), { fk: 'unarch:' + p.id, tip: ['Unarchive ' + p.name, 'Back to your list. Its files, history and backups were never touched.'] }));
    else {
      const why = openBlock(p);
      acts.appendChild(btn('pjxb-rbtn pjxb-open', 'Open', 'open', () => PJX.ACT.open(p.id), {
        fk: 'open:' + p.id, disabled: why || null, tip: p.active ? ['Open', 'It is the open project. Goes to its dashboard.'] : ['Open ' + p.name, 'Makes it the open project. Work in others keeps running.'],
        onRefused: () => { announce(why); nudge(p.id); }
      }));
    }
    const more = btn('pjxb-rbtn pjxb-more', 'More', null, (e, el) => moreMenu(el, p), { fk: 'more:' + p.id, menu: true, chev: true, tip: ['More for ' + p.name, 'Settings, keeping it safe, where it lives, archive, remove'] });
    acts.appendChild(more);
    row.appendChild(acts);

    // the problem's own line: why, and its fix (or the fix running with its phase). The status above already names the
    // problem, so the line starts with the reason; its mark is still unless the project is waiting for the person
    if (line) {
      const a = line.item;
      const cell = h('div', { class: 'pjxb-c pjxb-c-line', role: 'gridcell', 'data-tone': parts().tone(a.key) });
      cell.appendChild(h('span.pjx-st-mark.pjxb-linemark', { html: a.key === 'waiting' && !PJX.reduced() ? PJX.mark(a.key, 14) : PJX.calm(a.key, 14), 'aria-hidden': 'true' }));
      cell.appendChild(h('span', { class: 'pjxb-linetext', text: a.text }));
      tip(cell.children[1], a.title, a.text);
      const acts2 = h('span.pjxb-lineacts');
      if (op) {
        acts2.appendChild(h('span.pjxb-linework', null, parts().st('working', op.label, { moving: true }), h('span', { text: op.phase })));
        acts2.setAttribute('role', 'status');
      } else {
        // two fixes at most on the line (the rest are in More and the details); a missing folder says what Fix does
        parts().attentionButtons(p, Object.assign({}, a, { actions: (a.actions || []).slice(0, 2) }), { cls: 'pmu-textbtn' }).forEach((x, i) => {
          x.setAttribute('data-fk', 'att:' + p.id + ':' + i); x.classList.add('pjxb-fix');
          acts2.appendChild(x);
        });
        sayFind(acts2);
        if (line.more > 0) acts2.appendChild(btn('pjxb-morenote', plural(line.more, 'more note'), null, () => openProject(p.id, 'overview'), { fk: 'notes:' + p.id, tip: ['Details', 'Its other notes are in the details'] }));
      }
      cell.appendChild(acts2);
      row.appendChild(cell);
    }
    return row;
  }
  function safeCell(kind, x, l1, l2) {
    const c = h('div', { class: 'pjxb-c pjxb-c-' + kind, role: 'gridcell', 'data-tone': parts().tone(x.key) },
      h('span.pjx-st-mark', { html: PJX.calm(x.key, 14), 'aria-hidden': 'true' }),
      h('span.pjxb-two', null, h('span', { class: 'pjxb-l1 pjxb-sw', text: l1 }), !l2 ? null : typeof l2 === 'string' ? h('span', { class: 'pjxb-l2', text: l2 }) : h('span', { class: 'pjxb-l2 pjxb-l2fix' }, l2)));
    tip(c, x.label, x.text);
    return c;
  }
  /* while New Project is creating, a row stands in for the project until its owner says it exists */
  function creatingRow() {
    const c = S.creating;
    const row = h('div', { class: 'pjxb-row pjxb-pending', role: 'row', 'data-tone': 'working', 'aria-busy': 'true' },
      h('div', { class: 'pjxb-c pjxb-c-name', role: 'rowheader' }, h('span.pjxb-glyph', { html: icon('seed', 16), 'aria-hidden': 'true' }),
        h('span.pjxb-l1', null, h('span.pjxb-name', { text: c.name || 'New project' }))),
      h('div', { class: 'pjxb-c pjxb-c-sub', role: 'gridcell' }, h('span', { class: 'pjxb-actline', text: 'Being set up · step ' + (c.i + 1) + ' of ' + c.n })),
      h('div', { class: 'pjxb-c pjxb-c-status', role: 'gridcell' }, h('span.pjxb-two', null, parts().st('working', doing(c.verb), { moving: true }), h('span', { class: 'pjxb-l2 pjxb-stsub', text: c.label }))));
    return row;
  }
  /* a refused Open points at the fix on its row: the fix's button gets a short ring */
  function nudge(id) {
    const r = S.rows.get(id); if (!r) return;
    const f = r.el.querySelector('.pjxb-fix');
    if (!f) return;
    f.classList.remove('is-nudge'); void f.offsetWidth; f.classList.add('is-nudge');
    later(() => f.classList.remove('is-nudge'), 900);
  }

  /* the empty stage: the first run, an empty view, or a search with no match */
  function renderEmpty(v) {
    const E = S.els, key = [S.view, S.q.trim(), PJX.all().length ? 'some' : 'none', PJX.look()].join('|');
    if (E.empty.dataset.sig === key) return;
    E.empty.dataset.sig = key;
    E.empty.innerHTML = '';
    if (!PJX.all().length) { E.empty.appendChild(welcome()); return; }
    if (S.q.trim()) {
      const clear = btn('pjx-btn', 'Clear search', 'close', () => { S.q = ''; E.search.value = ''; render(); E.search.focus(); }, { fk: 'clearsearch' });
      E.empty.appendChild(h('div.pjxb-none', null,
        h('span.pjxb-none-mark', { html: icon('search', 22), 'aria-hidden': 'true' }),
        h('h3', { text: 'No projects match “' + S.q.trim() + '”' }),
        h('p', { text: 'Search looks at names, folders, online copies, backups and what each project is doing.' }), h('div.pjx-row', null, clear)));
      return;
    }
    const n = v.none || ['idle', 'Nothing here', ''];
    const kids = [h('span.pjxb-none-mark', { html: PJX.calm(n[0], 22), 'aria-hidden': 'true' }), h('h3', { text: n[1] }), h('p', { text: n[2] })];
    if (v.id === 'unprotected' || v.id === 'attention') kids.push(h('div.pjx-row', null, btn('pjx-btn', 'Show all projects', 'list-view', () => setView('all'), { fk: 'showall' })));
    E.empty.appendChild(h('div.pjxb-none', null, ...kids));
  }
  /* the first run: a welcome that shows every way in, each opening New Project at that way, and a paste field that
     recognises a link, a folder or an address (PJX.flow.detect) */
  function welcome() {
    const F = flow();
    const box = h('div.pjxb-welcome');
    box.appendChild(h('div.pjxb-wk', { text: 'Projects' }));
    box.appendChild(h('h3.pjxb-wtitle', { text: 'Bring in your first Project' }));
    box.appendChild(h('p.pjxb-wlead', { text: F.STEPS.way.lead() + ' Start one, or bring in work you already have.' }));
    const card = h('div', { class: 'pmu-card pjxb-ways', 'data-head': 'line', 'data-lg-surface': 'card', role: 'list', 'aria-label': 'Ways to begin' });
    F.WAYS.forEach((w) => {
      const b = h('button', { type: 'button', class: 'pjxb-way', 'data-fk': 'way:' + w.id, 'data-pmh': 'row' },
        h('span.pjxb-wayico', { html: icon(w.glyph, 20), 'aria-hidden': 'true' }),
        h('span.pjxb-waytext', null, h('span.pjxb-waytitle', { text: w.title }), h('span.pjxb-waysub', { text: w.sub })),
        w.tag ? h('span.pjxb-waytag', { text: w.tag }) : null,
        h('span.pjxb-waychev', { html: icon('chevron-right', 14), 'aria-hidden': 'true' }));
      b.addEventListener('click', () => openNew({ way: w.id }));
      card.appendChild(h('div', { role: 'listitem' }, b));
    });
    box.appendChild(card);
    // paste: a link, a folder, an address or a Recovery Kit, recognised as you type
    const hint = h('div.pjxb-pastehint', { 'aria-live': 'polite' });
    const go = btn('pjx-btn', 'Continue', 'chevron-right', () => openNew({ text: inp.value }), { fk: 'pastego' });
    const inp = h('input', { type: 'text', class: 'pjx-input pjxb-pastein', placeholder: 'github.com/you/app, ~/Code/app or you@nas.local:/projects/app', autocomplete: 'off', spellcheck: 'false', 'data-fk': 'paste', 'aria-label': 'Paste a link, a folder or an address' });
    const paint = () => {
      const d = inp.value.trim() ? F.detect(inp.value) : null;
      hint.innerHTML = '';
      if (inp.value.trim()) hint.appendChild(d ? parts().st('complete', d.say, { calm: true }) : parts().st('info', 'Not recognised yet: a link, a folder path or user@device:/path', { calm: true }));
      go.setAttribute('aria-disabled', d ? 'false' : 'true');
    };
    inp.addEventListener('input', paint);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && F.detect(inp.value)) openNew({ text: inp.value }); });
    go.setAttribute('aria-disabled', 'true');
    box.appendChild(h('div.pjxb-paste', null, h('label.pjx-field-label', { text: 'Or paste where it is', for: 'pjxb-paste-in' }), h('div.pjxb-pasterow', null, inp, go), hint));
    inp.id = 'pjxb-paste-in';
    const more = F.MORE[0];
    if (more) box.appendChild(h('p.pjxb-notyet', null, h('span.pjxb-notyet-l', { text: 'Not here yet · ' }), h('span', { text: more.title + '. ' + more.sub })));
    return box;
  }

  /* ------------------------------------------------------------------ keyboard and pointer on the ledger */
  function wireGrid() {
    const E = S.els;
    E.rowsEl.addEventListener('click', (e) => {
      const row = e.target.closest('.pjxb-row');
      if (!row || !row.dataset.id || e.target.closest('button, a, input')) return;
      select(row.dataset.id);
    });
    E.rowsEl.addEventListener('focusin', (e) => {
      const row = e.target.closest('.pjxb-row');
      if (!row || !row.dataset.id || S.focus === row.dataset.id) return;
      S.focus = row.dataset.id;
      Array.from(E.rowsEl.children).forEach((r) => setRoving(r, r === row));
    });
    E.rowsEl.addEventListener('keydown', (e) => {
      const row = e.target.closest('.pjxb-row');
      if (!row || !row.dataset.id) return;
      const onRow = e.target === row, ids = S.list, i = ids.indexOf(row.dataset.id);
      const step = { ArrowDown: 1, ArrowUp: -1, PageDown: 8, PageUp: -8 }[e.key];
      if (onRow && (step || e.key === 'Home' || e.key === 'End')) {
        e.preventDefault();
        const j = e.key === 'Home' ? 0 : e.key === 'End' ? ids.length - 1 : Math.max(0, Math.min(ids.length - 1, i + step));
        moveTo(ids[j]);
      } else if (onRow && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        select(row.dataset.id, { focusInspector: S.inspMode === 'over' });
      } else if (onRow && (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10'))) {
        e.preventDefault();
        const m = row.querySelector('.pjxb-more'); if (m) m.click();
      } else if (!onRow && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && !e.target.closest('input')) {
        // from a button in a row, the arrows go back to the rows
        e.preventDefault();
        moveTo(ids[Math.max(0, Math.min(ids.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))]);
      } else if (e.key === 'Escape' && S.inspOpen) {
        e.preventDefault(); closeInspector();
      }
    });
  }
  function moveTo(id) {
    if (!id) return;
    S.focus = id;
    // with the inspector beside the ledger, it follows the row the keyboard is on
    if (S.inspOpen && S.inspMode === 'dock') { S.sel = id; render(); }
    else Array.from(S.els.rowsEl.children).forEach((r) => setRoving(r, r.dataset.id === id));
    const r = S.rows.get(id);
    if (r) { r.el.focus({ preventScroll: true }); r.el.scrollIntoView({ block: 'nearest' }); }
  }
  function select(id, o) {
    o = o || {};
    const p = PJX.get(id); if (!p) return;
    if (S.sel !== id) S.tab = o.tab || 'overview'; else if (o.tab) S.tab = o.tab;
    const opening = !S.inspOpen || S.els.insp.hidden;
    S.sel = id; S.focus = id; S.inspOpen = true;
    if (opening) S.els.insp.setAttribute('data-enter', '');
    render();
    // one frame in the entering state, then the drawer settles in (b.css; never a transform on a Glass panel)
    if (opening) requestAnimationFrame(() => requestAnimationFrame(() => { if (S) S.els.insp.removeAttribute('data-enter'); }));
    if (o.focusInspector || S.inspMode === 'over') { const t = S.els.insp.querySelector('.pjxb-ititle'); if (t) t.focus({ preventScroll: true }); }
    const r = S.rows.get(id); if (r && r.el.isConnected) r.el.scrollIntoView({ block: 'nearest' });
  }
  function closeInspector() {
    if (!S.inspOpen) return;
    const id = S.sel;
    S.inspOpen = false;
    if (S.resume && !S.resume.running) S.resume = null;
    render();
    const r = S.rows.get(id);
    if (r && r.el.isConnected) r.el.focus({ preventScroll: true });
  }
  function refresh() {
    const b = S.els.refresh;
    b.classList.remove('spinning'); void b.offsetWidth; b.classList.add('spinning');
    later(() => b.classList.remove('spinning'), 700);
    S.checked = 'just now';
    render();
    PJX.toast('Projects checked', 'Every folder, history, online copy and backup was looked at again. Nothing new.', 'success');
    later(() => { S.checked = null; schedule(); }, 8000);
  }

  /* ------------------------------------------------------------------ the inspector: Usage's drawer, beside the ledger */
  const TABS = [{ id: 'overview', label: 'Overview' }, { id: 'safe', label: 'Keeping it safe' }, { id: 'where', label: 'Where it lives' }];
  function renderInspector() {
    const E = S.els, p = S.inspOpen && S.sel ? PJX.get(S.sel) : null;
    const v = viewOf(S.view);
    const visible = p && (v.archived ? p.lifecycle === 'archived' : p.lifecycle !== 'archived');
    E.body.setAttribute('data-insp', visible ? S.inspMode : 'none');
    // over the ledger it is a floating sheet in Glass (a sheet on a sheet is not allowed); beside it, a panel
    E.insp.setAttribute('data-lg-surface', S.inspMode === 'over' ? 'menu' : 'panel');
    if (!visible) { if (!E.insp.hidden) { E.insp.hidden = true; E.insp.classList.remove('open'); E.insp.dataset.sig = ''; } return; }
    const op = liveOp(p);
    const rs = S.resume && S.resume.id === p.id ? S.resume : null;
    const sig = JSON.stringify([p, op ? [op.label, op.phase] : 0, S.tab, PJX.look(), S.inspMode, rs ? [rs.states, rs.running, rs.done] : 0, PJX.reduced()]);
    if (E.insp.hidden) { E.insp.hidden = false; E.insp.classList.add('open'); }
    if (E.insp.dataset.sig === sig) return;
    E.insp.dataset.sig = sig;
    const scroller = E.insp.querySelector('.pmu-inspbody');
    const keep = scroller && E.insp.dataset.pid === p.id && E.insp.dataset.tab === S.tab ? scroller.scrollTop : 0;
    // the resume panel belongs to the project it opened for: another project's details let it go (unless it is running)
    if (S.resume && S.resume.id !== p.id && !S.resume.running) S.resume = null;
    E.insp.dataset.pid = p.id; E.insp.dataset.tab = S.tab;
    E.insp.innerHTML = '';
    const pr = PJX.primary(p);

    const openWhy = p.lifecycle === 'archived' ? 'It is archived. Unarchive it to open it.' : openBlock(p);
    const head = h('header', { class: 'pmu-insphead pjxb-ihead' },
      h('span.pjxb-iglyph', { html: icon(p.glyph, 18), 'aria-hidden': 'true' }),
      h('div', { class: 'pmu-insptitles' },
        h('h3', { class: 'pjxb-ititle', id: E.inspId, tabindex: '-1', text: p.name }),
        h('div.pjxb-isub', null, parts().st(pr.key, pr.word))),
      p.lifecycle === 'archived'
        ? btn('pjx-btn pjxb-iopen', 'Unarchive', 'reset', () => PJX.ACT.unarchive(p.id), { fk: 'i-unarch' })
        : btn('pjx-btn pjxb-iopen', 'Open', 'open', () => PJX.ACT.open(p.id), { fk: 'i-open', disabled: openWhy || null }),
      iconBtn('close', 'Close details', 'Esc', () => closeInspector(), 'i-close'));
    E.insp.appendChild(head);

    const tabs = h('div', { class: 'pjx-seg pjxb-itabs', role: 'tablist', 'aria-label': 'Details of ' + p.name });
    TABS.forEach((t) => {
      const on = S.tab === t.id;
      const b = h('button', { type: 'button', class: ['pjx-seg-btn', on && 'is-on'], role: 'tab', 'aria-selected': String(on), tabindex: on ? '0' : '-1', 'data-fk': 'tab:' + t.id, text: t.label });
      b.addEventListener('click', () => { S.tab = t.id; render(); });
      tabs.appendChild(b);
    });
    tabs.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const i = TABS.findIndex((t) => t.id === S.tab), j = (i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
      S.tab = TABS[j].id; render();
      const nb = E.insp.querySelector('[data-fk="tab:' + S.tab + '"]'); if (nb) nb.focus();
    });
    E.insp.appendChild(h('div.pjxb-itabwrap', null, tabs));

    const body = h('div', { class: 'pmu-inspbody pjxb-ibody', role: 'tabpanel', 'aria-label': (TABS.find((t) => t.id === S.tab) || TABS[0]).label });
    if (S.tab === 'safe') inspSafe(p, body);
    else if (S.tab === 'where') inspWhere(p, body);
    else inspOverview(p, body, op);
    E.insp.appendChild(body);
    E.insp.addEventListener('keydown', inspKeys);
    body.scrollTop = keep;
  }
  function inspKeys(e) {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    if (W.PMR && W.PMR.menu && W.PMR.menu.isOpen()) return;
    e.preventDefault(); e.stopPropagation(); closeInspector();
  }
  const sec = (title, ...kids) => h('section.pjxb-isec', null, title ? h('h4.pjxb-ih', { text: title }) : null, ...kids);
  function facts(rows) {
    return h('div', { class: 'pmu-facts pjxb-facts' }, ...rows.filter(Boolean).map((r) => {
      const v = h('b', { class: ['pmu-factv', r.mono && 'pjxb-mono'], 'data-pmh-tag': r.mono ? 'literal' : null });
      if (r.node) v.appendChild(r.node); else v.textContent = r.v;
      if (r.title) tip(v, r.title, r.detail);
      return h('div', { class: 'pmu-fact', 'data-tone': r.tone || null }, h('span', { class: 'pmu-factl', text: r.k }), v);
    }));
  }
  /* a vertical list of labelled actions (a menu laid open), used for the project's own actions */
  function actList(items) {
    const box = h('div', { class: 'pjxb-alist', role: 'group' });
    items.filter(Boolean).forEach((it) => {
      const b = btn('pjxb-arow' + (it.danger ? ' is-danger' : ''), it.label, it.icon, () => it.run(), { fk: 'a:' + it.label, disabled: it.disabled || null });
      if (it.meta) b.appendChild(h('span.pjxb-ameta', { text: it.meta }));
      box.appendChild(b);
    });
    return box;
  }
  const acts = (...bs) => h('div.pjxb-iacts', null, ...bs.filter(Boolean));
  const ibtn = (label, ic, run, o) => btn('pjx-btn pjxb-ibtn' + (o && o.lead ? ' is-lead' : ''), label, ic, run, Object.assign({ fk: 'ib:' + label }, o || {}));

  function inspOverview(p, body, op) {
    const pr = PJX.primary(p);
    const R0 = S.resume && S.resume.id === p.id ? S.resume : null;
    // the resume panel shows its own running state; any other owner operation gets this working notice
    if (op && !(R0 && op.kind === 'resume')) body.appendChild(h('div', { class: 'pjx-notice pjxb-working', 'data-tone': 'working', role: 'status' },
      h('span.pjx-notice-mark', { html: PJX.mark('working', 16), 'aria-hidden': 'true' }), h('div.pjx-notice-title', { text: op.label }), h('div.pjx-notice-text', { text: op.phase || '' })));
    const R = S.resume && S.resume.id === p.id ? S.resume : null;
    if (R) body.appendChild(resumePanel(p, R));
    const items = (p.attention || []).slice().sort((a, b) => PJX.STATUS[a.key].rank - PJX.STATUS[b.key].rank).filter((a) => !(R && a.code === 'setup_unfinished'));
    // each notice's buttons are Usage's text buttons: the page keeps New Project as its one filled button
    if (items.length) body.appendChild(sayFind(h('div.pjxb-notices', null, ...items.map((a) => parts().notice(p, a, { cls: 'pmu-textbtn' })))));
    body.appendChild(sec('At a glance', facts([
      { k: 'Status', node: parts().st(pr.key, pr.word) },
      { k: 'Doing', v: p.activity ? p.activity.text : '—', title: p.activity ? p.activity.text : '' },
      { k: 'Opened', v: p.opened },
      p.stack && p.stack.length ? { k: 'Built with', v: p.stack.join(' · '), title: p.stack.join(' · ') } : null,
      { k: 'On your devices', v: p.sync && p.sync.devices ? 'Seen on ' + plural(p.sync.devices, 'device') : 'Not yet' }
    ])));
    const safeHead = h('div.pjxb-ihrow', null, h('h4.pjxb-ih', { text: 'Kept safe' }),
      btn('pjx-link', 'See all', null, () => { S.tab = 'safe'; render(); }, { fk: 'see-safe' }));
    body.appendChild(h('section.pjxb-isec', null, safeHead, parts().safeLine(p)));
    const live = p.activity && p.activity.key === 'working';
    body.appendChild(sec('Project', actList([
      { label: 'Project settings', icon: 'settings', run: () => PJX.ACT.settings(p.id) },
      { label: 'Rename…', icon: 'edit', run: () => PJX.emit('need-rename', { id: p.id }) },
      { label: 'New project like this…', icon: 'folder-plus', meta: 'Same settings', run: () => openNew({ like: p.id }) },
      p.lifecycle === 'archived'
        ? { label: 'Unarchive', icon: 'reset', meta: 'Back to your list', run: () => PJX.ACT.unarchive(p.id) }
        : { label: 'Archive', icon: 'archive', meta: 'Hide it, keep everything', disabled: live ? 'Work is running in it' : null, run: () => PJX.ACT.archive(p.id) },
      { label: 'Remove from list…', icon: 'close', meta: 'Deletes nothing', disabled: live ? 'Work is running in it' : null, run: () => PJX.emit('need-remove', { id: p.id }) }
    ])));
    // the danger section, on its own, never beside Remove and never worded like it
    const del = PJX.deleteItem(p);
    body.appendChild(h('section', { class: 'pjxb-isec pjxb-danger', 'aria-label': 'Delete data' },
      h('h4.pjxb-ih', { text: 'Delete data' }), h('p.pjxb-dsay', { text: del.say }),
      btn('pjx-btn is-danger pjxb-delbtn', 'Delete Puppet Master’s data…', 'trash', () => del.run(), { fk: 'delete', disabled: del.disabled || null })));
  }

  /* Continue setup, in place: the notice, what is already made, what is left (each step's mark as it runs), and the
     buttons for the moment the person is in */
  function resumePanel(p, R) {
    const F = flow(), svc = (p.online && p.online.service) || 'the service';
    const box = h('section', { class: 'pjxb-resume', 'data-state': R.done ? 'done' : R.running ? 'working' : 'todo', 'aria-label': 'Finish setting up ' + p.name });
    box.appendChild(R.done
      ? h('div', { class: 'pjx-notice', 'data-tone': 'done', role: 'status' }, h('span.pjx-notice-mark', { html: PJX.calm('complete', 16), 'aria-hidden': 'true' }), h('div.pjx-notice-title', { text: p.name + ' is ready' }), h('div.pjx-notice-text', { text: 'Setup finished. Nothing was made twice.' }))
      : h('div', { class: 'pjx-notice', 'data-tone': R.running ? 'working' : 'attention', role: R.running ? 'status' : null },
        h('span.pjx-notice-mark', { html: R.running ? PJX.mark('working', 16) : PJX.calm('waiting', 16), 'aria-hidden': 'true' }),
        h('div.pjx-notice-title', { text: R.running ? 'Finishing setup' : 'Setup stopped part-way' }),
        h('div.pjx-notice-text', { text: R.running ? 'Only what is left. Each step is checked before the next one starts.' : R.text })));
    if (R.settled.length) box.appendChild(F.group('Already done', F.facts(R.settled.map((x) => ({ key: 'complete', text: x.label + (x.ref ? ' · ' + x.ref : '') })))));
    box.appendChild(F.group(R.done ? 'Done now' : 'Still to do', F.phaseList(R.remaining, R.states)));
    if (R.done) {
      box.appendChild(acts(
        btn('pjx-btn pjxb-ibtn is-lead', 'Open ' + p.name, 'open', () => { S.resume = null; PJX.ACT.open(p.id); }, { fk: 'rs-open' }),
        btn('pjx-btn pjxb-ibtn', 'Plan it in the Planning Wizard', 'plan', () => { S.resume = null; PJX.ACT.replan(p.id); }, { fk: 'rs-plan' })));
    } else {
      box.appendChild(acts(
        btn('pjx-btn pjxb-ibtn is-lead', R.running ? 'Continuing…' : 'Continue setup', 'play', () => runResume(), { fk: 'rs-go', disabled: R.running ? 'It is running now' : null }),
        R.running ? null : btn('pjx-btn pjxb-ibtn', 'Open on ' + svc, 'globe', () => PJX.ACT.openOnline(p.id), { fk: 'rs-online' })));
      box.appendChild(h('p', { class: 'pjxb-dsay', text: 'Continue setup does only what is left. The repository on ' + svc + ' is never made a second time.' }));
    }
    return box;
  }

  function inspSafe(p, body) {
    const sf = PJX.safety(p), jj = p.history.backend === 'jujutsu', o = p.online || {}, b = p.backup || {};
    const head = (x, title) => h('div.pjxb-shead2', null, h('span.pjx-st-mark', { html: PJX.calm(x.key, 16), 'aria-hidden': 'true' }),
      h('h4.pjxb-ih', { text: title }), h('span', { class: 'pjxb-sword', 'data-tone': parts().tone(x.key), text: x.word === 'None' || x.word === 'Off' ? 'Not set up' : x.word }));
    // History
    const hist = sf.history.word === 'Off'
      ? [sec(null, h('p.pjxb-dsay', { text: 'No history is kept. FileSafe still keeps a copy of each file before big changes.' }))]
      : [facts([
        { k: 'Kept with', v: sf.history.word },
        { k: jj ? 'Bookmark' : 'Branch', v: p.history.branch, mono: true },
        { k: jj ? 'Workspaces' : 'Worktrees', v: String(p.history.worktrees || 0) },
        p.history.changed != null ? { k: 'Not saved in history yet', v: p.history.changed ? plural(p.history.changed, 'change') : 'Nothing', tone: p.history.changed ? 'warn' : null } : { k: 'Not saved in history yet', v: p.where.missing ? 'Can’t tell: the folder is missing' : '—' }
      ]), acts(ibtn('Open history', 'history', () => PJX.toast('History for ' + p.name, 'Opens Source Control’s history, chosen for ' + p.name + '.', 'info')))];
    body.appendChild(h('section', { class: 'pjxb-isec pjxb-sblock', 'data-tone': parts().tone(sf.history.key) }, head(sf.history, 'History'), ...hist));
    // Online copy
    const onl = !o.service
      ? [h('p.pjxb-dsay', { text: 'Only on ' + (p.where.kind === 'local' ? 'this computer' : p.where.device) + '. An online copy keeps files and history on a service like GitHub.' }),
        acts(ibtn('Add an online copy…', 'cloud', () => PJX.toast('Online copy', 'Opens Source Control’s publish flow for ' + p.name + '.', 'info')))]
      : [facts([
        { k: 'On', v: o.service },
        { k: 'Copy', v: o.repo, mono: true, title: o.repo },
        o.privacy ? { k: 'Who can see it', v: o.privacy } : null,
        { k: 'Now', v: o.state === 'waiting' && o.note ? o.note : sf.online.tail, tone: o.state === 'waiting' ? 'warn' : null }
      ]), acts(
        o.state === 'waiting' ? ibtn('Sign in', 'key', () => PJX.ACT.signIn(p.id), { lead: true }) : null,
        o.behind ? ibtn('Get the latest', 'download', () => PJX.ACT.getLatest(p.id), { lead: true, tip: ['Get the latest', o.behind + ' newer online'] }) : null,
        o.ahead && o.state !== 'waiting' ? ibtn('Send changes', 'upload', () => PJX.ACT.send(p.id), { lead: !o.behind, tip: ['Send changes', o.ahead + ' to send'] }) : null,
        ibtn('Open on ' + o.service, 'globe', () => PJX.ACT.openOnline(p.id)))];
    if (o.state === 'waiting') onl.splice(1, 0, h('p.pjxb-dsay', { text: 'Sending changes over SSH still works. Merge requests and pipelines need you to sign in again.' }));
    body.appendChild(h('section', { class: 'pjxb-isec pjxb-sblock', 'data-tone': parts().tone(sf.online.key) }, head(sf.online, 'Online copy'), ...onl));
    // Backup
    const bak = !b.dest
      ? [h('p.pjxb-dsay', { text: 'Nothing keeps its plans, chats and settings. An online copy keeps files and history, not those. A backup keeps everything.' }),
        acts(ibtn('Set up backup', 'safe', () => PJX.ACT.setupBackup(p.id), { lead: true }), ibtn('Restore as new…', 'history', () => restoreAsNew(p), { disabled: 'There is no backup of it yet' }))]
      : [facts([
        { k: 'To', v: b.dest },
        { k: 'When', v: b.schedule || '—' },
        { k: 'Last complete backup', v: b.last || 'None yet', tone: b.state === 'warning' ? 'warn' : null },
        b.versions ? { k: 'Versions kept', v: String(b.versions) + (b.size ? ' · ' + b.size : '') } : null
      ]), b.note ? h('p', { class: 'pjxb-dsay pjxb-note', 'data-tone': parts().tone(b.state), text: b.note }) : null,
      acts(ibtn('Back up now', 'upload', () => PJX.ACT.backupNow(p.id), { lead: b.state === 'warning', disabled: p.lifecycle === 'archived' ? 'Backups are paused while it is archived' : liveOp(p) ? 'Something is already running for it' : null }),
        ibtn('Backup history', 'history', () => PJX.ACT.backupHistory(p.id)),
        ibtn('Restore as new…', 'copy', () => restoreAsNew(p), { disabled: b.last ? null : 'No complete backup yet' }),
        ibtn('Change where', 'settings', () => PJX.ACT.settings(p.id, 'Backup · where and when')))];
    body.appendChild(h('section', { class: 'pjxb-isec pjxb-sblock', 'data-tone': parts().tone(sf.backup.key) }, head(sf.backup, 'Backup'), ...bak.filter(Boolean)));
    body.appendChild(h('p', { class: 'pjxb-dsay pjxb-sync', html: icon('swap', 13) + '<span>Your other Puppet Master devices see this Project automatically' + (p.sync && p.sync.devices ? ' (seen on ' + plural(p.sync.devices, 'device') + ')' : '') + '.</span>' }));
  }

  function inspWhere(p, body) {
    const missing = !!p.where.missing, offline = (p.attention || []).some((a) => a.code === 'device_offline');
    if (missing) body.appendChild(sayFind(parts().notice(p, (p.attention || []).find((a) => a.code === 'folder_missing') || { key: 'blocked', title: 'Folder missing', text: '', actions: ['repair'] }, { cls: 'pmu-textbtn' })));
    else if (offline) body.appendChild(parts().notice(p, p.attention.find((a) => a.code === 'device_offline'), { cls: 'pmu-textbtn' }));
    const path = h('div.pjxb-pathbox', null,
      h('span.pjxb-pathico', { html: icon(p.where.kind === 'local' ? 'folder' : 'server', 16), 'aria-hidden': 'true' }),
      pathEl(p, 44, 'pjxb-pathfull'));
    body.appendChild(sec('Folder', path, facts([
      { k: 'Place', v: p.where.kind === 'local' ? 'This computer' : (p.where.device || p.where.label) },
      p.where.via ? { k: 'Reached over', v: p.where.via === 'SSH' ? 'A secure connection (SSH)' : p.where.via } : null,
      { k: 'State', v: missing ? 'Nothing is there any more' : offline ? 'Not answering' : p.where.pending ? 'Not made yet' : 'Found', tone: missing || offline ? 'warn' : null }
    ])));
    body.appendChild(sec('Change it', actList([
      missing
        ? { label: 'Find the folder…', icon: 'folder-search', meta: 'Or a fresh copy, or the backup', run: () => PJX.emit('need-repair', { id: p.id }) }
        : { label: 'Move or change folder…', icon: 'move', meta: 'Checked before it switches', run: () => PJX.emit('need-repair', { id: p.id, move: true }) },
      { label: 'Show in file manager', icon: 'folder', disabled: missing ? 'The folder is missing' : offline ? (p.where.device || 'The device') + ' isn’t answering' : null, run: () => PJX.ACT.reveal(p.id) },
      { label: 'Copy path', icon: 'copy', run: () => PJX.ACT.copyPath(p.id) },
      { label: 'Project settings', icon: 'settings', meta: 'Server and project location', run: () => PJX.ACT.settings(p.id, 'Server & Project Location') }
    ])));
    body.appendChild(h('p', { class: 'pjxb-dsay', text: 'Changing the folder only changes where Puppet Master looks. Moving copies the files, checks the copy, then switches; nothing is deleted without asking.' }));
  }
  /* Restore as new: New Project at its restore way, with this project's backup already chosen */
  function restoreAsNew(p) {
    const src = (PJX.ENV.backups || []).find((b) => b.where === p.backup.dest);
    openNew({ way: 'restore', prefill: src ? { backupFrom: src.id, unlocked: src.id === 'nas' || src.id === 'gdrive', restorePick: p.id, name: p.name + '-restored' } : null });
  }

  function openProject(id, tab) {
    if (!S) return;
    const p = PJX.get(id); if (!p) return;
    if (p.lifecycle === 'archived' && S.view !== 'archived') S.view = 'archived';
    else if (p.lifecycle !== 'archived' && (S.view === 'archived' || !viewOf(S.view).test(p))) S.view = 'all';
    if (S.q && !matches(p)) { S.q = ''; S.els.search.value = ''; }
    select(id, { tab: tab || 'overview' });
  }

  /* ------------------------------------------------------------------ New Project: a sheet from the right of the stage */
  function openNew(opts) {
    opts = opts || {};
    if (!S) return;
    if (S.sheet && S.sheet.phase === 'creating') { S.sheet.focus(); return; }
    if (S.sheet) S.sheet.dispose(true);
    closeMenus();
    S.sheet = sheet(opts);
    // the title bar's notes step beside the sheet once it has arrived
    if (S.notes) later(() => S.notes.queue(), PJX.reduced() ? 30 : 460);
  }

  function sheet(opts) {
    const F = flow(), E = S.els;
    const s = F.start({ way: opts.way || undefined, like: opts.like || undefined, text: opts.text || undefined });
    s.autoNext = false;
    if (opts.prefill) Object.assign(s.draft, opts.prefill, { nameTouched: !!opts.prefill.name });
    const sh = { s, phase: 'form', waysOpen: !s.draft.way, fail: false, init: JSON.stringify(s.draft), list: null, states: null, result: null,
      prev: D.activeElement, raf: 0, now: null, open: true, lastWay: s.draft.way, lastStep: s.step };
    const tid = PJX.uid('pjxb-sheet');
    const wrap = h('div', { class: 'pjxb-sheetwrap' });
    const scrim = h('div', { class: 'pjxb-scrim', 'aria-hidden': 'true' });
    const el = h('section', { class: 'pjxb-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': tid, 'data-lg-surface': 'menu', 'data-lg-dense': '', 'data-lg-lens-host': '' });
    const title = h('h2', { class: 'pjxb-stitle', id: tid, text: 'New Project' });
    const sub = h('div.pjxb-ssub');
    const close = iconBtn('close', 'Close', 'Esc', () => requestClose(), 's-close');
    const head = h('header.pjxb-shead', null, h('div.pjxb-stitles', null, title, sub), close);
    const index = h('nav', { class: 'pjxb-sindex', 'aria-label': 'Sections' });
    const bodyEl = h('div.pjxb-sbody');
    const wayEl = h('div.pjxb-sway');
    const stepsEl = h('div.pjxb-ssteps');
    const resultEl = h('div.pjxb-sresult');
    bodyEl.append(wayEl, stepsEl, resultEl);
    const foot = h('footer.pjxb-sfoot');
    el.append(head, index, bodyEl, foot);
    wrap.append(scrim, el);
    E.sheetHost.appendChild(wrap);
    scrim.addEventListener('mousedown', () => requestClose());
    // the rest of the page sits still behind the sheet
    [E.rail, E.head, E.body].forEach((x) => { x.inert = true; });
    S.root.setAttribute('data-sheet', '');

    el.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const f = Array.from(el.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])')).filter((x) => !x.disabled && x.offsetParent !== null && x.tabIndex >= 0);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && D.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && D.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    const esc = (e) => {
      if (e.key !== 'Escape' || !sh.open) return;
      if (D.querySelector('.pjx-dlg-back')) return;          // a dialog above closes first (the core's own Escape)
      if (W.PMR && W.PMR.menu && W.PMR.menu.isOpen()) return; // and a menu
      e.preventDefault(); e.stopPropagation(); requestClose();
    };
    D.addEventListener('keydown', esc, true);
    s.on(() => { if (!sh.raf) sh.raf = requestAnimationFrame(() => { sh.raf = 0; if (sh.open) paint(); }); });
    bodyEl.addEventListener('scroll', () => spy(), { passive: true });
    wayEl.addEventListener('click', (e) => { const c = e.target.closest('.pjx-choice'); if (c && !c.classList.contains('is-off')) { sh.picked = true; if (c.getAttribute('data-v') === s.draft.way) s.changed(); } });

    /* the summary the foot keeps: the review's rows in its own words, one short line per review group (what it begins
       as and where, its settings, how it is kept safe), each line wrapping rather than cutting a value off */
    function summary() {
      // review() writes "undefined · null" for a place not chosen yet (a device or folder before the pick); say so plainly
      // and a value that starts with "—" (a choice not made yet inside a sentence) as not chosen yet too
      const clean = (v) => (v == null || /\bundefined\b|\bnull\b/.test(String(v)) || /^—/.test(String(v)) ? 'Not chosen yet' : String(v));
      return F.review(s).map((g) => ({ label: g.label, rows: g.rows.filter(([k]) => k !== 'Name').map(([k, v]) => [k, clean(v)]) })).filter((g) => g.rows.length);
    }
    function summaryEl() {
      const box = h('div', { class: 'pjxb-sumlines', role: 'list' });
      summary().forEach((g) => {
        const line = h('p', { class: 'pjxb-sumline', role: 'listitem' });
        g.rows.forEach(([k, v], i) => {
          // a label never parts from its value's start, and the dot stays at the end of the value before it, so a wrapped
          // line never begins with a dot
          line.appendChild(h('span.pjxb-sumpair', null, h('span', { class: 'pjxb-sumk', text: k + ' ' }), h('b', { class: 'pjxb-sumv', text: v }),
            i < g.rows.length - 1 ? h('span', { class: 'pjxb-sumsep', 'aria-hidden': 'true', text: '\u00a0·' }) : null));
          if (i < g.rows.length - 1) line.appendChild(D.createTextNode(' '));
        });
        box.appendChild(line);
      });
      return box;
    }
    function firstProblem() {
      if (!s.draft.way) return { id: 'way', why: F.problem(s, 'way') };
      for (const id of s.steps()) { if (id === 'way' || id === 'review') continue; const why = F.problem(s, id); if (why) return { id, why }; }
      return null;
    }
    function paint() {
      const d = s.draft;
      wrap.setAttribute('data-phase', sh.phase);
      const wayDef = F.WAYS.find((w) => w.id === d.way);
      sub.textContent = sh.phase === 'form' ? (wayDef ? wayDef.title : '') : sh.phase === 'creating' ? 'Setting it up' : '';
      // a newly chosen way (or the same one picked again) folds the list away and goes to its first question
      const picked = sh.picked; sh.picked = false;
      if (d.way && (d.way !== sh.lastWay || picked)) {
        const firstTime = !sh.lastWay;
        sh.lastWay = d.way; sh.waysOpen = false;
        drawForm();
        const firstSec = stepsEl.querySelector('.pjx-step');
        if (firstSec) {
          if (!firstTime) bodyEl.scrollTop = 0;
          const t = firstSec.querySelector('.pjx-q-title'); if (t) { t.tabIndex = -1; t.focus({ preventScroll: true }); }
          // the questions arrive under the folded list (b.css; the container survives the flow's redraws)
          stepsEl.classList.remove('is-arriving'); void stepsEl.offsetWidth; stepsEl.classList.add('is-arriving');
          later(() => stepsEl.classList.remove('is-arriving'), 420);
        }
      } else if (s.step !== sh.lastStep) {
        // a Review "Change" link (s.go) goes to that section of the one page
        sh.lastStep = s.step;
        drawForm();
        const target = stepsEl.querySelector('[data-step="' + s.step + '"]');
        if (target) scrollToSection(target);
      } else drawForm();
      drawFoot();
    }
    function drawForm() {
      if (sh.phase !== 'form') { wayEl.hidden = true; stepsEl.hidden = true; index.hidden = true; resultEl.hidden = false; return; }
      wayEl.hidden = false; stepsEl.hidden = false; resultEl.hidden = true; resultEl.innerHTML = '';
      const keepScroll = bodyEl.scrollTop;
      const fp = focusPath(bodyEl);
      // the way: the full list while choosing, one row with Change once chosen
      wayEl.innerHTML = '';
      if (sh.waysOpen || !s.draft.way) {
        F.render(s, wayEl, { only: 'way' });
      } else {
        const w = F.WAYS.find((x) => x.id === s.draft.way);
        const change = btn('pjx-btn is-quiet pjxb-waychange', 'Change', null, () => { sh.waysOpen = true; paint(); const c = wayEl.querySelector('.pjx-choice.is-on'); if (c) c.focus(); }, { fk: 's-waychange', tip: ['Change how it begins', 'What you chose for this beginning is cleared'] });
        wayEl.appendChild(h('section', { class: 'pjx-step pjxb-waypicked', 'data-step': 'way' },
          h('div.pjxb-wlabel', { text: F.STEPS.way.title(s) }),
          h('div.pjxb-wayrow', null, h('span.pjxb-wayico', { html: icon(w.glyph, 20), 'aria-hidden': 'true' }),
            h('span.pjxb-waytext', null, h('span.pjxb-waytitle', { text: w.title }), h('span.pjxb-waysub', { text: w.sub })), change)));
      }
      // every other step, as sections of one page
      if (s.draft.way) { F.render(s, stepsEl, { all: true }); stepsEl.hidden = false; } else { stepsEl.innerHTML = ''; stepsEl.hidden = true; }
      bodyEl.scrollTop = keepScroll;
      restorePath(bodyEl, fp);
      drawIndex();
    }
    /* the section index at the top: each section's word, a mark when it is answered; the one in view is filled */
    function drawIndex() {
      index.innerHTML = '';
      if (!s.draft.way || sh.phase !== 'form') { index.hidden = true; return; }
      index.hidden = false;
      const ol = h('ol.pjx-stepper');
      s.steps().filter((id) => id !== 'review').forEach((id) => {
        const st = F.STEPS[id]; if (!st) return;
        const ok = !F.problem(s, id);
        const b = h('button', { type: 'button', class: ['pjxb-ix', ok ? 'is-done' : 'is-todo', sh.now === id && 'is-now'], 'data-ix': id, 'data-fk': 's-ix:' + id, 'aria-current': sh.now === id ? 'step' : null },
          h('span.pjxb-ixmark', { html: PJX.calm(ok ? 'complete' : 'pending', 12), 'aria-hidden': 'true' }), h('span', { text: id === 'way' ? 'Begin' : st.label }));
        tip(b, st.label, ok ? 'Answered' : F.problem(s, id));
        b.addEventListener('click', () => {
          if (id === 'way') { bodyEl.scrollTo({ top: 0, behavior: PJX.reduced() ? 'auto' : 'smooth' }); return; }
          const t = stepsEl.querySelector('[data-step="' + id + '"]'); if (t) scrollToSection(t);
        });
        ol.appendChild(h('li', null, b));
      });
      index.appendChild(ol);
    }
    function scrollToSection(t) {
      const top = t.offsetTop - 8;
      bodyEl.scrollTo({ top, behavior: PJX.reduced() ? 'auto' : 'smooth' });
      const q = t.querySelector('.pjx-q-title'); if (q) { q.tabIndex = -1; q.focus({ preventScroll: true }); }
    }
    function spy() {
      if (sh.phase !== 'form' || !s.draft.way) return;
      const secs = [wayEl.querySelector('[data-step]')].concat(Array.from(stepsEl.querySelectorAll('[data-step]'))).filter(Boolean);
      const y = bodyEl.scrollTop + 40;
      let now = secs[0] ? secs[0].getAttribute('data-step') : null;
      secs.forEach((x) => { if (x.offsetTop <= y) now = x.getAttribute('data-step'); });
      if (bodyEl.scrollTop + bodyEl.clientHeight >= bodyEl.scrollHeight - 4 && secs.length) now = secs[secs.length - 1].getAttribute('data-step');
      if (now === sh.now) return;
      sh.now = now;
      index.querySelectorAll('.pjxb-ix').forEach((b) => { const on = b.getAttribute('data-ix') === now; b.classList.toggle('is-now', on); if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    }
    /* the foot: what Create will do (or what is still missing), the concept-demo control, Cancel and the one button */
    function drawFoot() {
      foot.innerHTML = '';
      const d = s.draft;
      if (sh.phase === 'creating') {
        foot.appendChild(h('div.pjxb-fbar', null, h('span.pjxb-fnote', { text: 'You can close this. Setup keeps going, and the project shows in your list when it is done.' }), h('span.pjx-grow'),
          btn('pjx-btn', 'Close', null, () => dispose(), { fk: 's-hide' })));
        return;
      }
      if (sh.phase === 'done') { drawResultFoot(); return; }
      const verb = verbFor(d.way), pb = firstProblem();
      const sumBox = h('div', { class: 'pjxb-sum', 'data-state': pb ? 'todo' : 'ready' });
      if (pb) {
        const go = btn('pjx-link', 'Go there', null, () => {
          if (pb.id === 'way') { sh.waysOpen = true; paint(); bodyEl.scrollTo({ top: 0 }); return; }
          const t = stepsEl.querySelector('[data-step="' + pb.id + '"]'); if (t) scrollToSection(t);
        }, { fk: 's-goto' });
        sumBox.appendChild(h('div.pjxb-sumhead', null, h('span.pjx-st-mark', { html: PJX.calm('warning', 14), 'aria-hidden': 'true' }),
          h('span', null, h('b', { text: 'Before you can ' + verb.toLowerCase() + ': ' }), h('span', { text: pb.why })), d.way ? go : null));
      } else sumBox.appendChild(h('div.pjxb-sumhead', null, h('span.pjx-st-mark', { html: PJX.calm('complete', 14), 'aria-hidden': 'true' }), h('b', { text: 'When you click ' + verb + ':' })));
      if (d.way) sumBox.appendChild(summaryEl());
      foot.appendChild(sumBox);
      // the concept-demo control: what a network drop part-way through setup looks like
      const canFail = d.way && F.phases(s).some((x) => x.clone);
      const chk = h('input', { type: 'checkbox', 'data-fk': 's-fail' });
      chk.checked = !!sh.fail;
      chk.disabled = !canFail;
      chk.addEventListener('change', () => { sh.fail = chk.checked; drawFoot(); });
      const failL = h('label', { class: ['pjx-check', 'pjxb-faildemo', !canFail && 'is-off'] }, chk, h('span', { text: 'Concept demo: the network drops during setup' }));
      tip(failL, 'Concept demo', canFail ? 'Shows what Setup didn’t finish looks like. Alt-click the button does the same.' : 'This setup copies nothing over the network, so nothing can drop. Add an online copy, or copy one, to try it.');
      const name = String(d.name || '').trim();
      const go = btn('pjx-btn is-primary pjxb-create', verb + (name ? ' ' + name : ''), verb === 'Restore' ? 'history' : verb === 'Copy' ? 'download' : 'plus', (e) => create(sh.fail || e.altKey), {
        fk: 's-create', disabled: pb ? pb.why : null, onRefused: () => { announce('Before you can ' + verb.toLowerCase() + ': ' + pb.why); }
      });
      foot.append(failL, h('div.pjxb-fbar', null, h('span.pjx-grow'), btn('pjx-btn', 'Cancel', null, () => requestClose(), { fk: 's-cancel' }), go));
    }
    async function create(fail) {
      if (firstProblem() || sh.phase !== 'form') return;
      const d = s.draft;
      sh.phase = 'creating'; sh.fail = !!fail;
      sh.list = F.phases(s); sh.states = sh.list.map(() => 'pending');
      S.creating = { name: String(d.name).trim(), i: 0, n: sh.list.length, label: sh.list[0] ? sh.list[0].label : '', verb: verbFor(d.way) };
      drawCreating();
      drawFoot();
      schedule();
      const res = await F.commit(s, {
        fail: !!fail,
        onPhase(i, list, state) {
          sh.states[i] = state;
          if (S && S.creating) { S.creating.i = i; S.creating.label = list[i].label; schedule(); }
          if (sh.open) drawCreating();
        }
      });
      if (S) S.creating = null;
      sh.phase = 'done'; sh.result = res;
      if (!sh.open) {
        // closed while it ran: say how it ended where the person is now
        if (res.ok) PJX.toast(res.project.name + ' is ready', 'It is in your Projects.', 'success');
        else if (res.project) PJX.toast('Setup didn’t finish for ' + res.project.name, 'Continue setup from its row in Projects.', 'warn', true);
        else PJX.toast('Nothing was made', res.said || '', 'warn', true);
        schedule();
        return;
      }
      wrap.setAttribute('data-phase', 'done');
      drawResult();
      drawFoot();
      if (S) schedule();
    }
    function drawCreating() {
      wrap.setAttribute('data-phase', 'creating');
      wayEl.hidden = true; stepsEl.hidden = true; index.hidden = true; resultEl.hidden = false;
      const d = s.draft, verb = verbFor(d.way);
      const doneN = sh.states.filter((x) => x === 'complete').length;
      resultEl.innerHTML = '';
      resultEl.appendChild(h('div', { class: 'pjxb-creating', role: 'status', 'aria-live': 'polite' },
        h('div.pjxb-rkick', { text: 'Step ' + Math.min(sh.list.length, doneN + 1) + ' of ' + sh.list.length }),
        h('h3.pjxb-rtitle', { text: doing(verb) + ' ' + String(d.name).trim() }),
        h('p.pjx-q-lead', { text: 'Each step is checked before the next one starts. Nothing is listed until the last step says it is done.' }),
        F.phaseList(sh.list, sh.states)));
      sub.textContent = 'Setting it up';
      bodyEl.scrollTop = 0;
    }
    function drawResult() {
      const r = sh.result, d = s.draft;
      resultEl.innerHTML = '';
      sub.textContent = r.ok ? 'Done' : r.project ? 'Setup didn’t finish' : 'Nothing was made';
      if (r.ok) {
        const p = r.project;
        resultEl.appendChild(h('div', { class: 'pjxb-done', role: 'status' },
          h('span.pjxb-donemark', { html: PJX.mark('complete', 28), 'aria-hidden': 'true' }),
          h('h3.pjxb-rtitle', { text: p.name + ' is ready' }),
          h('p.pjx-q-lead', { text: (d.way === 'restore' ? 'Restored from the backup' : d.way === 'online' ? 'Copied to this computer' : d.way === 'new' ? 'Made' : 'Added') + ' at ' + p.where.path + '. It is in your list now.' }),
          parts().safeLine(p),
          h('div.pjxb-rphases', null, F.phaseList(sh.list, sh.states))));
        const t = resultEl.querySelector('.pjxb-rtitle'); if (t) { t.tabIndex = -1; t.focus({ preventScroll: true }); }
      } else if (r.project) {
        const p = r.project;
        const note = parts().notice(p, p.attention[0], { cls: 'pmu-textbtn' });
        // the notice's buttons (Continue setup, Open on, Remove) act on the project; the sheet steps aside first
        note.addEventListener('click', (e) => { if (e.target.closest('button')) later(() => dispose(), 0); }, true);
        resultEl.appendChild(h('div', { class: 'pjxb-done is-failed', role: 'alert' },
          h('span.pjxb-donemark', { html: PJX.mark('waiting', 28), 'aria-hidden': 'true' }),
          h('h3.pjxb-rtitle', { text: 'Setup didn’t finish' }),
          h('p.pjx-q-lead', { text: p.name + ' is in your list with what was made so far. Continue setup does only what is left, and never makes the online copy twice.' }),
          note, h('div.pjxb-rphases', null, F.phaseList(sh.list, sh.states))));
        const t = resultEl.querySelector('.pjxb-rtitle'); if (t) { t.tabIndex = -1; t.focus({ preventScroll: true }); }
      } else {
        resultEl.appendChild(h('div', { class: 'pjxb-done is-failed', role: 'alert' },
          h('span.pjxb-donemark', { html: PJX.mark('failed', 28), 'aria-hidden': 'true' }),
          h('h3.pjxb-rtitle', { text: 'Nothing was made' }),
          h('p.pjx-q-lead', { text: r.said || 'The setup stopped before anything was made.' }),
          h('div.pjxb-rphases', null, F.phaseList(sh.list, sh.states))));
        const t = resultEl.querySelector('.pjxb-rtitle'); if (t) { t.tabIndex = -1; t.focus({ preventScroll: true }); }
      }
    }
    function drawResultFoot() {
      const r = sh.result;
      if (r.ok) {
        const p = r.project;
        foot.appendChild(h('div.pjxb-fbar', null,
          btn('pjx-btn', 'Done', null, () => { dispose(); openProject(p.id); }, { fk: 's-done' }), h('span.pjx-grow'),
          btn('pjx-btn', 'Plan it in the Planning Wizard', 'plan', () => { dispose(); PJX.ACT.replan(p.id); }, { fk: 's-plan' }),
          btn('pjx-btn is-primary', 'Open ' + p.name, 'open', () => { dispose(); PJX.ACT.open(p.id); }, { fk: 's-open' })));
      } else if (r.project) {
        foot.appendChild(h('div.pjxb-fbar', null, h('span.pjx-grow'), btn('pjx-btn', 'Close', null, () => { dispose(); openProject(r.project.id); }, { fk: 's-close2' })));
      } else {
        foot.appendChild(h('div.pjxb-fbar', null, btn('pjx-btn', 'Close', null, () => dispose(), { fk: 's-close3' }), h('span.pjx-grow'),
          btn('pjx-btn is-primary', 'Try again', 'refresh', () => { sh.phase = 'form'; sh.result = null; sh.fail = false; wrap.setAttribute('data-phase', 'form'); paint(); }, { fk: 's-retry' })));
      }
    }
    /* Escape, the scrim, Close and Cancel: nothing to lose closes at once; filled-in choices ask first */
    function requestClose() {
      if (sh.phase === 'creating') { dispose(); return; }
      if (sh.phase === 'form' && JSON.stringify(s.draft) !== sh.init) {
        const dlg = PJX.dialog({
          title: 'Discard this new Project?', size: null,
          body: h('p.pjx-q-lead', { text: 'Nothing has been made yet. What you chose here is not kept.' }),
          actions: [{ spacer: true }, { label: 'Keep editing', run: (a) => a.close('keep') }, { label: 'Discard', primary: true, run: (a) => { a.close('discard'); later(() => dispose(), 10); } }]
        });
        return dlg;
      }
      dispose();
      return null;
    }
    function dispose(instant) {
      if (!sh.open) return;
      sh.open = false;
      D.removeEventListener('keydown', esc, true);
      if (sh.raf) cancelAnimationFrame(sh.raf);
      [E.rail, E.head, E.body].forEach((x) => { x.inert = false; });
      if (!S) { wrap.remove(); return; }
      S.root.removeAttribute('data-sheet');
      if (S.sheet === api) S.sheet = null;
      const gone = () => { wrap.remove(); };
      if (instant || PJX.reduced()) gone();
      else { wrap.removeAttribute('data-open'); wrap.setAttribute('data-leaving', ''); setTimeout(gone, PJX.stepped() ? 180 : 240); }
      const back = sh.prev && sh.prev.isConnected && S.root.contains(sh.prev) ? sh.prev : E.newBtn;
      try { back.focus({ preventScroll: true }); } catch (e) { /* gone */ }
      if (S) schedule();
    }
    const api = {
      get phase() { return sh.phase; },
      render() { /* the world changed under the sheet (a folder check, a project added): the flow redraws itself on s.on */ },
      focus() { const t = el.querySelector('.pjxb-rtitle, .pjx-q-title, .pjxb-stitle'); if (t) { t.tabIndex = -1; t.focus({ preventScroll: true }); } },
      dispose
    };
    paint();
    if (!s.draft.way) { const c = wayEl.querySelector('.pjx-choice'); if (c) c.focus({ preventScroll: true }); }
    else { const t = stepsEl.querySelector('.pjx-q-title'); if (t) { t.tabIndex = -1; t.focus({ preventScroll: true }); } }
    requestAnimationFrame(() => requestAnimationFrame(() => { wrap.setAttribute('data-open', ''); spy(); }));
    return api;
  }
  /* where focus was inside the sheet's page, by section and position, so a redraw puts it back */
  function focusPath(container) {
    const a = D.activeElement;
    if (!a || !container.contains(a) || a.getAttribute('data-pjx-key')) return null;
    const secEl = a.closest('[data-step]');
    if (!secEl) return null;
    const list = Array.from(secEl.querySelectorAll('button, input, [tabindex]'));
    return { step: secEl.getAttribute('data-step'), i: list.indexOf(a), v: a.getAttribute('data-v') };
  }
  function restorePath(container, fp) {
    if (!fp) return;
    const a = D.activeElement;
    if (a && a !== D.body && container.contains(a)) return;
    const secEl = container.querySelector('[data-step="' + fp.step + '"]');
    if (!secEl) return;
    let t = fp.v ? secEl.querySelector('[data-v="' + fp.v.replace(/"/g, '\\"') + '"]') : null;
    if (!t) t = Array.from(secEl.querySelectorAll('button, input, [tabindex]'))[fp.i];
    if (t) t.focus({ preventScroll: true });
  }

  PJX.concept('b', { title: 'Ledger', mount, unmount, render, openNew, openProject, onResume });
})(window);
