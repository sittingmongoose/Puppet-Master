/* Projects concepts (Opus 5.5): Concept A · Polish.

   Today's page kept and brought up to Home and Usage. Jared called the current page "ok", so this keeps its shape (a
   head, a grid of project cards, a New Project sheet) and fixes what he named: it is drawn in Usage's own plates,
   controls and inks (.pmu-shell inside the root, so every look styles it the way it styles Usage); every action says
   what it does in words; the folder-missing project has a Fix… button right where the problem is shown; history,
   online copy and backup are on every card; and New Project is one stepped window that asks what onboarding asks
   (PJX.flow), without onboarding's stage.

   The parts:
     head        one 52 px Usage head: "Projects", a count line, Show, Sort, search, Refresh and the one New Project.
     summary     a quiet line under the head while anything needs you, with each item's own fix; gone when all is well.
     grid        Usage plates, auto-fill. A card: glyph, name, stack; Where; what it is doing; the Safe line; the problem
                 and its fix when there is one; a foot with when it was opened and Open, Details, More.
     drawer      Details: Usage's inspector over the right of the page, with every owner action for the project and a
                 separate Delete data section at the bottom.
     window      New Project: a stepped window (Begin, the way's own steps, Review), then Creating, then Done or
                 Setup didn't finish, all in the same window.
   Everything the page says comes from the core (PJX.primary, PJX.safety, PJX.parts) so the three concepts say the
   same words; this file only decides where they go. */
(function (W) {
  'use strict';
  const PJX = W.PJX;
  if (!PJX || !PJX.flow || !PJX.parts) return;
  const D = W.document;
  const { h, icon, mark, tip, ACT, ACTIONS, STATUS } = PJX;
  const P = PJX.parts, F = PJX.flow;

  /* ------------------------------------------------------------------ state */
  const A = {
    root: null, shell: null, els: {}, offs: [], ro: null, timers: [],
    view: 'all', sort: 'recent', q: '', searchOpen: false, density: '', densityPicked: false,
    cards: new Map(), animate: true, gen: 0,
    drawer: null, drawerFrom: null, drawerSig: '',
    creating: null, look: '', undoTimer: 0
  };
  const VIEWS = { all: 'All projects', attention: 'Need you', working: 'Working', unprotected: 'Not backed up', archived: 'Archived' };
  const SORTS = { recent: 'Last opened', name: 'Name', attention: 'Needs you first' };
  /* how much a card shows: everything, or the essentials (name, status, the Safe line, a problem's fix) so a long list
     stays scannable; a list of more than 12 starts with the essentials until the person picks */
  const DENSITY = { full: 'Everything', compact: 'The essentials' };
  const density = () => (A.densityPicked ? A.density : (PJX.listed().length > 12 ? 'compact' : 'full'));
  /* the order the summary line and "Needs you first" read problems in: a folder that is gone before a sign-in, a
     sign-in before an unreachable device, those before advisories */
  const SEVERITY = { blocked: 0, failed: 1, waiting: 2, offline: 3, warning: 4 };

  const later = (fn, ms) => { const t = setTimeout(() => { A.timers = A.timers.filter((x) => x !== t); fn(); }, ms); A.timers.push(t); return t; };
  const isNier = () => D.documentElement.getAttribute('data-o55-nier') === 'on';
  const isGlass = () => /^glass/.test(D.documentElement.getAttribute('data-theme') || '');
  const needsYou = (p) => { const k = PJX.primary(p).key; return STATUS[k] && STATUS[k].rank <= STATUS.warning.rank; };
  const isWorking = (p) => PJX.primary(p).key === 'working' || (p.activity && p.activity.key === 'working') || !!liveOp(p);
  const liveOp = (p) => { const op = PJX.S.ops[p.id]; return op && !op.done ? op : null; };
  const sev = (p) => { const k = PJX.primary(p).key; return SEVERITY[k] != null ? SEVERITY[k] : 9; };
  /* marks are lit and still in lists (F3-658): only the status slot's working bead and needs-you mark move, and a
     running task's own row; every other mark on the page is the calm one, so one problem is never said in motion
     five times over */
  const still = (key, px) => PJX.calm(key, px || 14);
  function slot(pr, opts) {
    const live = pr.key === 'working' || pr.key === 'waiting';
    const el = P.st(pr.key, (opts && opts.word) || shortWord(pr), { moving: live });
    tip(el, pr.word, pr.text || null);
    return el;
  }
  /* the Safe line's facts, with one addition: a missing folder holds the history out of reach without breaking it (the
     repair says "its history, online copy and backups are safe"), so History says where it is, in the quiet ink */
  function safe(p) {
    const s = PJX.safety(p);
    if (p.where.missing && s.history.key !== 'off') {
      s.history = Object.assign({}, s.history, { key: 'pending', short: s.history.short + ' · in the missing folder',
        text: s.history.text + ' · inside the missing folder, out of reach until it is found' + (p.online && p.online.service ? '. Every change you sent is on ' + p.online.service + '.' : '.') });
    }
    return s;
  }
  /* what kind of running task each attention fix would start, so a fix is never offered twice while its task runs */
  const BUSY = { backup: ['backup_now', 'setup_backup'], signin: ['sign_in'], retry: ['retry'], relocate: ['repair'], restore: ['repair'], move: ['repair'], resume: ['resume'] };
  const busyWhy = (op, action) => (op && (BUSY[op.kind] || []).indexOf(action) >= 0 ? op.label + ' now. It finishes on its own.' : '');

  /* ------------------------------------------------------------------ small builders */
  /* a labelled button; k is the key that keeps focus on it across a re-render */
  function btn(label, o) {
    o = o || {};
    const b = h('button', { type: 'button', class: [o.cls || 'pjx-a-btn', o.primary && 'is-primary', o.danger && 'is-danger'], 'data-k': o.k || null, 'aria-disabled': o.off ? 'true' : null, 'aria-haspopup': o.menu ? 'menu' : null, 'aria-expanded': o.menu ? 'false' : null },
      o.icon ? h('span.pjx-a-bico', { html: icon(o.icon, 15), 'aria-hidden': 'true' }) : null,
      h('span.pjx-a-blabel', { text: label }),
      o.menu ? h('span.pjx-a-bchev', { html: icon('chevron-down', 13), 'aria-hidden': 'true' }) : null);
    if (o.off) tip(b, label, o.off);
    else if (o.tip) tip(b, o.tip, o.detail);
    b.addEventListener('click', (e) => { if (b.getAttribute('aria-disabled') === 'true') { if (o.onOff) o.onOff(e); return; } if (o.run) o.run(e, b); });
    return b;
  }
  /* a path, cut in the middle: the head of the path gives way first, the folder's own name always shows; the hover tag
     shows it whole and literally (data-pmh-tag), never as generic copy */
  function pathEl(path, cls) {
    const s = String(path || ''), i = s.lastIndexOf('/');
    const head = i > 0 ? s.slice(0, i + 1) : '', tail = i > 0 ? s.slice(i + 1) : s;
    const el = h('span', { class: ['pjx-a-path', cls], 'data-pmh-tag': 'literal' }, h('span.pjx-a-path-a', { text: head }), h('span.pjx-a-path-b', { text: tail }));
    tip(el, s);
    return el;
  }
  function stackText(p) {
    const st = p.stack || [];
    if (!st.length) return '';
    return st.slice(0, 2).join(' · ') + (st.length > 2 ? ' · +' + (st.length - 2) : '');
  }
  /* the status slot's short word: the core's own title when it is short, else the shared word for its state */
  function shortWord(prim) {
    if (prim.source === 'attention' && prim.word && prim.word.length > 20) return PJX.statusWord(prim.key);
    return prim.word;
  }
  function shown(p) {
    const op = liveOp(p);
    return op ? { key: 'working', word: op.label, text: op.phase, source: 'op' } : PJX.primary(p);
  }
  function openedText(p) {
    if (p.active) return 'Open now';
    const o = String(p.opened || '');
    if (/^just added$/i.test(o)) return 'Just added';
    return 'Opened ' + (/^(yesterday|today)/i.test(o) ? o.charAt(0).toLowerCase() + o.slice(1) : o);
  }
  const placeText = (p, short) => (p.where.kind === 'device' ? p.where.device + (short ? '' : ' · over ' + (p.where.via || 'SSH')) : p.where.label);
  /* why Open can't open this project now, in words (the card's notice holds the fix) */
  function openBlock(p) {
    if (p.where.missing) return 'Its folder is missing. Fix the folder first.';
    if ((p.attention || []).some((a) => a.code === 'device_offline')) return (p.where.device || 'The device') + ' isn’t answering. Try again first.';
    if (p.lifecycle === 'recovery') return 'Setup didn’t finish. Continue setup first.';
    return '';
  }

  /* ------------------------------------------------------------------ the list: filter, search, sort */
  function matches(p, q) {
    const hay = [p.name, (p.stack || []).join(' '), p.where.path, p.where.label, p.where.device, p.online && p.online.repo, p.online && p.online.service, p.backup && p.backup.dest]
      .concat((p.attention || []).map((a) => a.title)).filter(Boolean).join(' ').toLowerCase();
    return q.split(/\s+/).filter(Boolean).every((w) => hay.indexOf(w) >= 0);
  }
  function visible() {
    let L = A.view === 'archived' ? PJX.archived() : PJX.listed();
    if (A.view === 'attention') L = L.filter(needsYou);
    else if (A.view === 'working') L = L.filter(isWorking);
    else if (A.view === 'unprotected') L = L.filter((p) => !p.backup || !p.backup.dest);
    const q = A.q.trim().toLowerCase();
    if (q) L = L.filter((p) => matches(p, q));
    const recent = (a, b) => (a.openedRank - b.openedRank) || a.order - b.order;
    if (A.sort === 'name') L = L.slice().sort((a, b) => a.name.localeCompare(b.name));
    else if (A.sort === 'attention') L = L.slice().sort((a, b) => (sev(a) - sev(b)) || recent(a, b));
    else L = L.slice().sort(recent);
    return L;
  }

  /* ------------------------------------------------------------------ the head */
  function buildHead() {
    const E = A.els;
    E.top = h('div.pjx-a-top', { 'data-lg-surface': 'bar' });
    E.head = h('header.pmu-stagehead.pjx-a-head');
    E.title = h('h2.pjx-a-title', { text: 'Projects' });
    E.sub = h('p.pmu-roomdesc.pjx-a-sub');
    E.head.appendChild(h('div.pmu-titleblock', null, E.title, E.sub));
    E.ctl = h('div.pmu-headctl.pjx-a-ctl');
    E.show = ctlBtn('filter', 'show'); E.show.addEventListener('click', () => openShowMenu(E.show));
    E.sort = ctlBtn('list-view', 'sort'); E.sort.addEventListener('click', () => openSortMenu(E.sort));
    // the search field is the look's rectangle; on a narrow head it folds to an icon that opens it over the controls
    E.searchBox = h('div.pjx-a-search', { role: 'search' });
    E.searchIco = h('span.pjx-a-search-ico', { html: icon('search', 15), 'aria-hidden': 'true' });
    E.q = h('input', { type: 'search', class: 'pjx-a-q', placeholder: 'Search projects', 'aria-label': 'Search projects', autocomplete: 'off', spellcheck: 'false' });
    E.qClear = h('button', { type: 'button', class: 'pjx-a-qx', html: icon('close', 13) });
    tip(E.qClear, 'Clear the search');
    E.searchBox.append(E.searchIco, E.q, E.qClear);
    E.q.addEventListener('input', () => { A.q = E.q.value; A.animate = true; render(); });
    E.q.addEventListener('keydown', (e) => { if (e.key === 'Escape' && (A.q || A.searchOpen)) { e.preventDefault(); e.stopPropagation(); clearSearch(true); } });
    E.q.addEventListener('blur', () => { if (!A.q && A.searchOpen) later(() => { if (D.activeElement !== E.q && !A.q) { A.searchOpen = false; paintHead(); } }, 120); });
    E.qClear.addEventListener('click', () => clearSearch(true));
    E.searchBtn = h('button', { type: 'button', class: 'pmu-iconbtn pjx-a-searchbtn', html: icon('search', 16) });
    tip(E.searchBtn, 'Search projects');
    E.searchBtn.addEventListener('click', () => { A.searchOpen = true; paintHead(); E.q.focus(); });
    E.refresh = h('button', { type: 'button', class: 'pmu-iconbtn pjx-a-refresh', html: icon('refresh', 16) });
    tip(E.refresh, 'Refresh', 'Check every folder, device and online copy again');
    E.refresh.addEventListener('click', refresh);
    E.newBtn = h('button', { type: 'button', class: 'pmw-act is-primary pjx-a-new' }, h('span.pjx-a-bico', { html: icon('plus', 15), 'aria-hidden': 'true' }), h('span', { text: 'New Project' }));
    E.newBtn.addEventListener('click', () => openNew({}));
    E.ctl.append(E.show, E.sort, E.searchBox, E.searchBtn, E.refresh);
    // New Project sits outside the control group, so a narrow head can fold the controls to a second row and keep it
    E.head.append(E.ctl, E.newBtn);
    E.sum = h('div.pjx-a-sum', { role: 'region', 'aria-label': 'Needs you', hidden: true });
    E.top.append(E.head, E.sum);
    return E.top;
  }
  function ctlBtn(ico, k) {
    const b = h('button', { type: 'button', class: 'pmu-ctlbtn pjx-a-ctlbtn', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'data-k': k },
      h('span.pmu-ctllead', { html: icon(ico, 15), 'aria-hidden': 'true' }), h('span.pmu-ctltext'),
      h('span.pmu-ctlchev', { html: icon('chevron-down', 14), 'aria-hidden': 'true' }));
    return b;
  }
  function paintHead() {
    const E = A.els, c = PJX.counts(), none = !PJX.all().length;
    const n = c.all, need = c.attention;
    let sub;
    if (none) sub = 'No projects yet';
    else if (A.view === 'archived') sub = c.archived + ' archived · files, history and backups kept';
    else sub = n + ' project' + (n === 1 ? '' : 's') + (need ? ' · ' + need + ' need' + (need === 1 ? 's' : '') + ' you' : ' · all well');
    E.sub.textContent = sub;
    A.root.toggleAttribute('data-none', none);
    A.root.setAttribute('data-density', density());
    E.show.querySelector('.pmu-ctltext').textContent = VIEWS[A.view];
    E.sort.querySelector('.pmu-ctltext').textContent = SORTS[A.sort];
    tip(E.show, 'Show: ' + VIEWS[A.view], 'Which projects the page lists');
    tip(E.sort, 'Sort: ' + SORTS[A.sort], 'Cards show ' + DENSITY[density()].toLowerCase());
    E.show.setAttribute('aria-label', 'Show: ' + VIEWS[A.view]);
    E.sort.setAttribute('aria-label', 'Sort: ' + SORTS[A.sort]);
    E.show.toggleAttribute('data-on', A.view !== 'all');
    if (E.q.value !== A.q) E.q.value = A.q;
    E.qClear.hidden = !A.q;
    E.head.classList.toggle('is-searching', A.searchOpen || !!A.q);
    // the look's glyphs: PMG draws each look's own strokes, so a look change redraws the head's icons
    const lk = PJX.look();
    if (lk !== A.look) {
      A.look = lk;
      E.show.querySelector('.pmu-ctllead').innerHTML = icon('filter', 15);
      E.sort.querySelector('.pmu-ctllead').innerHTML = icon('list-view', 15);
      E.show.querySelector('.pmu-ctlchev').innerHTML = icon('chevron-down', 14);
      E.sort.querySelector('.pmu-ctlchev').innerHTML = icon('chevron-down', 14);
      E.searchIco.innerHTML = icon('search', 15); E.searchBtn.innerHTML = icon('search', 16);
      E.refresh.innerHTML = icon('refresh', 16); E.qClear.innerHTML = icon('close', 13);
      E.newBtn.querySelector('.pjx-a-bico').innerHTML = icon('plus', 15);
    }
  }
  function clearSearch(focus) {
    A.q = ''; A.searchOpen = false; A.animate = true;
    render();
    if (focus) { const E = A.els; (E.searchBtn.offsetParent ? E.searchBtn : E.q).focus({ preventScroll: true }); }
  }
  function setView(v) {
    if (!VIEWS[v]) v = 'all';
    if (A.view === v) return;
    A.view = v; A.animate = true;
    const sc = A.els.scroll; if (sc) sc.scrollTop = 0;
    render();
  }
  function openShowMenu(anchor) {
    if (!(W.PMR && W.PMR.menu)) return;
    const c = PJX.counts();
    const it = (v, n) => ({ value: v, label: VIEWS[v], meta: String(n) });
    W.PMR.menu.open({ id: 'pjxa-show', label: 'Show', value: A.view, groups: [
      { items: [it('all', c.all), it('attention', c.attention), it('working', c.working), it('unprotected', c.unprotected)] },
      { items: [it('archived', c.archived)] }
    ] }, anchor, { align: 'end', onPick: (item) => setTimeout(() => setView(item.value), 0) });
  }
  function openSortMenu(anchor) {
    if (!(W.PMR && W.PMR.menu)) return;
    const dn = density();
    W.PMR.menu.open({ id: 'pjxa-sort', label: 'Sort and cards', groups: [
      { label: 'Sort by', items: Object.keys(SORTS).map((k) => ({ value: 's:' + k, label: SORTS[k], selected: A.sort === k })) },
      { label: 'Cards show', items: Object.keys(DENSITY).map((k) => ({ value: 'd:' + k, label: DENSITY[k], selected: dn === k })) }
    ] }, anchor, { align: 'end', onPick: (item) => setTimeout(() => {
      const [kind, v] = String(item.value).split(':');
      if (kind === 's') { A.sort = v; A.animate = true; }
      else { A.density = v; A.densityPicked = true; A.cards.clear(); A.animate = true; }
      render();
    }, 0) });
  }
  /* Refresh asks every owner again (cmd.project.refresh); the demo world has nothing new to report */
  function refresh() {
    const b = A.els.refresh;
    b.classList.remove('is-spinning'); void b.offsetWidth; b.classList.add('is-spinning');
    later(() => { b.classList.remove('is-spinning'); PJX.toast('Projects checked', 'Every folder, device and online copy was looked at again.', 'info'); }, PJX.reduced() ? 50 : 700);
  }

  /* ------------------------------------------------------------------ the summary line under the head */
  function paintSummary() {
    const E = A.els, sum = E.sum;
    // the line is drawn anew on every change; whoever was on one of its buttons stays on it (or on the line's link)
    const ae = D.activeElement, fk = sum.contains(ae) && ae.getAttribute ? ae.getAttribute('data-k') : null;
    const items = PJX.listed().filter(needsYou).sort((a, b) => (sev(a) - sev(b)) || a.openedRank - b.openedRank);
    if (!items.length || A.view === 'archived') {
      sum.hidden = true; sum.innerHTML = '';
      // the last problem was fixed from this line: focus goes to the page title rather than to nowhere
      if (fk) { E.title.setAttribute('tabindex', '-1'); E.title.focus({ preventScroll: true }); }
      return;
    }
    sum.hidden = false; sum.innerHTML = '';
    const lead = h('span.pjx-a-sum-lead', null, h('b', { text: items.length + ' need' + (items.length === 1 ? 's' : '') + ' you' }));
    const list = h('span.pjx-a-sum-list');
    items.forEach((p) => {
      const pr = shown(p), att = pr.item;
      const item = h('span.pjx-a-si', { 'data-id': p.id, 'data-tone': P.tone(pr.key) },
        h('span.pjx-st-mark', { html: pr.source === 'op' ? mark('working', 13) : still(pr.key, 13), 'aria-hidden': 'true' }),
        h('b.pjx-a-si-name', { text: p.name }), h('span.pjx-a-si-dash', { text: '—', 'aria-hidden': 'true' }),
        h('span.pjx-a-si-word', { text: pr.source === 'op' ? pr.word + ' · ' + (pr.text || '') : pr.word }));
      const first = att && (att.actions || []).find((a) => a !== 'details' && ACTIONS[a]);
      if (first && pr.source !== 'op') {
        const def = ACTIONS[first];
        const label = first === 'open_online' && p.online.service ? 'Open on ' + p.online.service : def.label;
        item.appendChild(btn(label, { cls: 'pmu-textbtn pjx-a-sibtn', k: 'sum-' + p.id, run: () => def.run(p.id) }));
      }
      list.appendChild(item);
    });
    sum.append(lead, list);
    if (A.view !== 'attention') {
      const more = h('button', { type: 'button', class: 'pjx-link pjx-a-sum-more', text: 'Show all ' + items.length, 'data-k': 'sum-more' });
      more.addEventListener('click', () => setView('attention'));
      sum.appendChild(more);
    }
    fitSummary();
    if (fk) { const f = sum.querySelector('[data-k="' + fk + '"]') || sum.querySelector('[data-k="sum-more"]'); if (f) f.focus({ preventScroll: true }); }
  }
  /* one line: the items that do not fit are left out (the "Show all" link and the Need you view list them all) */
  function fitSummary() {
    const sum = A.els.sum; if (!sum || sum.hidden) return;
    const list = sum.querySelector('.pjx-a-sum-list'); if (!list) return;
    const items = Array.from(list.children);
    items.forEach((x) => { x.hidden = false; });
    const room = list.clientWidth;
    let used = 0, cut = false;
    items.forEach((x, i) => {
      const w = x.offsetWidth + (i ? 18 : 0);
      if (cut || used + w > room + 0.5) { x.hidden = true; cut = true; } else used += w;
    });
    sum.toggleAttribute('data-cut', cut);
  }

  /* ------------------------------------------------------------------ a card */
  function cardSig(p) {
    const op = liveOp(p);
    return [PJX.look(), density(), p.name, p.lifecycle, p.active, p.opened, JSON.stringify(p.activity), JSON.stringify(p.history), JSON.stringify(p.online),
      JSON.stringify(p.backup), JSON.stringify(p.where), JSON.stringify(p.attention), op ? op.label + '|' + op.phase + '|' + op.i : ''].join('§');
  }
  function buildCard(p) {
    const pr = shown(p), archived = p.lifecycle === 'archived', op = liveOp(p);
    const nameId = 'pjxa-n-' + p.id.replace(/[^\w-]/g, '');
    const card = h('article', { class: ['pmu-card', 'pjx-a-card'], 'data-head': 'plate', 'data-id': p.id, 'data-life': p.lifecycle, 'data-tone': P.tone(pr.key),
      'aria-labelledby': nameId, 'data-lg-surface': 'card', 'aria-current': p.active ? 'true' : null });
    // head: glyph, name and stack, the status slot
    const sub = stackText(p);
    const subEl = h('span.pmu-cardsub', { text: sub || (p.where.kind === 'device' ? 'On ' + p.where.device : '') });
    if ((p.stack || []).length > 2) tip(subEl, p.stack.join(' · '));
    card.appendChild(h('header.pmu-cardhead.pjx-a-cardhead', null,
      h('span.pjx-a-glyph', { html: icon(p.glyph || 'box', 18), 'aria-hidden': 'true' }),
      h('div.pmu-cardtitles', null, h('h3.pmu-cardtitle', { id: nameId, text: p.name }), subEl),
      h('span.pmu-cardmeta.pjx-a-meta', null, slot(pr))));
    // body: where it lives, then one "now" slot of the same height on every card (a running task, the problem with its
    // fix, or what it last did), then the Safe line. Every card in a row keeps the same rows, so a healthy card beside
    // one with a problem has no hole in it
    const body = h('div.pmu-cardbody.pjx-a-cardbody');
    if (density() === 'full') body.appendChild(whereFact(p));
    if (op) body.appendChild(workingRow(op, true));
    else if (pr.source === 'attention' && pr.item && !archived) body.appendChild(cardNotice(p, pr.item, shortWord(pr)));
    else body.appendChild(nowActivity(p));
    card.appendChild(body);
    card.appendChild(safeLine(p));
    // foot: when (or the work the slot above is not showing), then Open (or Unarchive), Details, More
    const acts = h('div.pjx-a-acts');
    if (archived) acts.appendChild(btn('Unarchive', { cls: 'pmu-textbtn', icon: 'reset', k: 'unarchive', run: () => ACT.unarchive(p.id) }));
    else {
      const why = openBlock(p);
      acts.appendChild(btn('Open', { cls: 'pmu-textbtn', k: 'open', off: why || null, run: () => ACT.open(p.id),
        // Open can't do it: the fix is the card's own notice, so a press there lands on that fix
        onOff: () => { const fix = card.querySelector('.pjx-notice-acts button'); if (fix) fix.focus(); } }));
    }
    acts.appendChild(btn('Details', { k: 'details', run: (e, b) => openDrawer(p.id, b) }));
    acts.appendChild(btn('More', { k: 'more', menu: true, run: (e, b) => PJX.menu(b, PJX.moreItems(p), { label: 'More for ' + p.name }) }));
    card.appendChild(h('footer.pmu-cardfoot.pjx-a-foot', null, footWhen(p, pr), acts));
    return card;
  }
  /* the foot's left side: when it was opened, or, when the slot above shows a problem instead of the project's work,
     that work (harbor needs a sign-in while two runs keep working; legacy-app's backup is late while it sits paused) */
  function footWhen(p, pr) {
    const a = p.activity || {};
    if (p.lifecycle === 'archived') return h('span.pjx-a-when', { text: 'Last opened ' + p.opened });
    if (p.active) return h('span.pjx-a-when', null, h('span.pjx-a-when-ico', { html: icon('open', 13), 'aria-hidden': 'true' }), h('span', { text: 'Open now' }));
    if (pr.source !== 'activity' && (a.key === 'working' || a.key === 'paused')) {
      const el = h('span.pjx-a-when.is-work', null,
        // still: the status slot above already moves for this card
        h('span.pjx-st-mark', { html: still(a.key === 'working' ? 'working' : 'paused', 13), 'aria-hidden': 'true' }),
        h('span', { text: a.key === 'working' ? (a.runs ? a.runs + (a.runs > 1 ? ' runs' : ' run') + ' working' : 'Working') : 'Paused' }));
      tip(el, a.word || 'Working', [a.text, openedText(p)].filter(Boolean).join(' · '));
      return el;
    }
    return h('span.pjx-a-when', null, h('span', { text: openedText(p) }));
  }
  /* the Safe line, with each of its parts kept whole when a word wraps ("Home NAS ·" then "2 h ago", never "2" then
     "h ago"; "Not backed up" on one line); marks are the calm ones unless a backup is running right now */
  function safeLine(p) {
    const el = P.safeLine(p), s = safe(p);
    el.querySelectorAll('.pjx-safe-cell').forEach((c) => {
      const x = s[c.getAttribute('data-part')]; if (!x) return;
      const w = c.querySelector('.pjx-safe-word');
      if (c.getAttribute('data-part') === 'history' && p.where.missing) { c.setAttribute('data-tone', P.tone(x.key)); w.textContent = x.short; tip(c, x.label + ': ' + x.text); }
      c.querySelector('.pjx-st-mark').innerHTML = x.key === 'working' ? mark('working', 14) : still(x.key, 14);
      w.textContent = w.textContent.split(' · ').map((t) => (/\d/.test(t) || t.length <= 10 ? t.replace(/ /g, ' ') : t)).join(' · ');
    });
    return el;
  }
  function whereFact(p) {
    const w = p.where;
    const val = h('b.pmu-factv.pjx-a-where', null,
      // a missing folder says so in words beside the old path, struck through; the card's slot and notice carry the tone
      w.missing ? h('span.pjx-a-missing', { text: 'Missing' }) : h('span.pjx-a-place', { text: placeText(p, true) }),
      pathEl(w.path, w.missing ? 'is-gone' : null));
    return h('div.pmu-facts.pjx-a-facts', null, h('div.pmu-fact.is-top', null, h('span.pmu-factl', { text: 'Where' }), val));
  }
  /* the "now" slot when nothing needs the person: what the project last did, and when */
  function nowActivity(p) {
    const a = p.activity || {}, archived = p.lifecycle === 'archived';
    const at = String(a.at || '');
    const when = archived ? 'Unarchive it to open it' : at ? (a.key === 'working' ? 'Updated ' : a.key === 'paused' ? 'Paused ' : 'Last activity ') + (/^(yesterday|today)/i.test(at) ? at.charAt(0).toLowerCase() + at.slice(1) : at) : '';
    const t = h('p.pjx-a-now-t', { text: a.text || a.word || '' });
    tip(t, a.word || 'Activity', a.text || '');
    return h('div.pjx-a-now.is-act', null, t, when ? h('p.pjx-a-now-m', { text: when }) : null);
  }
  /* the card's notice: the problem (or, when the status slot already names it, its reason) and its one fix; the rest of
     its fixes are in More and in Details, and the reason is whole in the hover tag and in Details */
  function cardNotice(p, att, word) {
    const first = (att.actions || []).find((x) => x !== 'details' && ACTIONS[x]);
    const n = P.notice(p, Object.assign({}, att, { actions: first ? [first] : [] }), { cls: 'pmu-textbtn' });
    n.classList.add('pjx-a-notice', 'pjx-a-now');
    n.removeAttribute('role');   // the card's text, not an announcement each time the card is drawn
    n.querySelector('.pjx-notice-mark').innerHTML = still(att.key, 16);
    const t = n.querySelector('.pjx-notice-title'), x = n.querySelector('.pjx-notice-text'), a = n.querySelector('.pjx-notice-acts');
    a.querySelectorAll('button').forEach((b, i) => b.setAttribute('data-k', 'att-' + i));
    const same = att.title === word;
    n.classList.toggle('is-same', same);
    const text = h('div.pjx-a-ntext', null, same ? null : t, x);
    if (same) t.remove();
    tip(text, att.title, att.text);
    n.insertBefore(text, a);
    const more = (p.attention || []).length - 1;
    if (more > 0) {
      const l = h('button', { type: 'button', class: 'pjx-link pjx-a-also', 'data-k': 'also', text: '+' + more + ' more', 'aria-label': more + ' more in Details' });
      l.addEventListener('click', () => openDrawer(p.id, l));
      a.appendChild(l);
    }
    return n;
  }
  /* a running owner operation: its label, its phase, and where it is in its phases (never a timer) */
  function workingRow(op, now) {
    const segs = h('span.pjx-a-segs', { 'aria-hidden': 'true' });
    for (let i = 0; i < op.n; i++) segs.appendChild(h('i', { class: i < op.i ? 'is-done' : i === op.i ? 'is-now' : null }));
    return h('div', { class: ['pjx-a-working', now && 'pjx-a-now'], role: 'status' },
      h('span.pjx-st-mark', { html: mark('working', 14), 'aria-hidden': 'true' }),
      h('span.pjx-a-working-text', null, h('b', { text: op.label }), h('span', { text: op.phase ? ' · ' + op.phase : '' })),
      h('span.pjx-a-working-n', { text: (op.i + 1) + ' of ' + op.n }),
      segs);
  }
  /* the project being created while its window is closed: what it is doing now, and a way back to the window */
  function creatingCard() {
    const c = A.creating, st = c.st;
    const card = h('article', { class: ['pmu-card', 'pjx-a-card', 'is-creating'], 'data-head': 'plate', 'data-tone': 'working', 'data-lg-surface': 'card', 'aria-label': 'Creating ' + st.name });
    card.appendChild(h('header.pmu-cardhead.pjx-a-cardhead', null,
      h('span.pjx-a-glyph', { html: icon(st.s ? draftGlyph(st.s) : 'seed', 18), 'aria-hidden': 'true' }),
      h('div.pmu-cardtitles', null, h('h3.pmu-cardtitle', { text: st.name }), h('span.pmu-cardsub', { text: 'New Project' })),
      h('span.pmu-cardmeta.pjx-a-meta', null, P.st('working', 'Creating'))));
    const body = h('div.pmu-cardbody.pjx-a-cardbody');
    if (density() === 'full') body.appendChild(h('div.pmu-facts.pjx-a-facts', null, h('div.pmu-fact.is-top', null, h('span.pmu-factl', { text: 'Where' }),
      h('b.pmu-factv.pjx-a-where', null, h('span.pjx-a-place', { text: 'This computer' }), pathEl(st.s ? F.placeFor(st.s) : '')))));
    body.appendChild(workingRow({ label: c.label || 'Getting ready', phase: '', i: c.i, n: c.n }, true));
    card.appendChild(body);
    card.appendChild(h('p.pjx-a-hint.pjx-a-creating-note', { text: 'It becomes a project card here when it is ready.' }));
    const acts = h('div.pjx-a-acts', null, btn('Show progress', { cls: 'pmu-textbtn', k: 'progress', run: () => openWindow(st) }));
    card.appendChild(h('footer.pmu-cardfoot.pjx-a-foot', null, h('span.pjx-a-when', { text: 'Started just now' }), acts));
    return card;
  }
  /* the glyph a draft will get, the one flow.js gives the Project it makes */
  function draftGlyph(s) {
    const d = s.draft, tpl = PJX.ENV.templates.find((t) => t.id === d.template);
    return d.way === 'online' ? 'cloud' : d.way === 'device' ? 'server' : d.way === 'restore' ? 'history' : d.way === 'folder' ? 'folder' : tpl && tpl.glyph !== 'folder' ? tpl.glyph : 'seed';
  }

  /* ------------------------------------------------------------------ the page body */
  function paintBody() {
    const E = A.els, none = !PJX.all().length;
    E.welcome.hidden = !none;
    E.grid.hidden = none;
    E.notes.innerHTML = '';
    if (none) { paintWelcome(); E.grid.innerHTML = ''; A.cards.clear(); return; }
    // notes above the grid: the undo strip after a removal, the archived view's line, the search line
    const undo = P.undoStrip();
    if (undo) {
      undo.classList.add('pjx-a-undo');
      E.notes.appendChild(undo);
      clearTimeout(A.undoTimer); A.undoTimer = setTimeout(() => render(), 15200);
    }
    const list = visible();
    if (A.view === 'archived') {
      const back = h('button', { type: 'button', class: 'pjx-link', text: 'Back to all projects', 'data-k': 'back-all' });
      back.addEventListener('click', () => setView('all'));
      E.notes.appendChild(h('div.pjx-a-band', null, h('span.pjx-a-band-ico', { html: icon('archive', 15), 'aria-hidden': 'true' }),
        h('span.pjx-a-band-t', { text: 'Archived projects stay out of your list. Their files, history and backups are kept.' }), back));
    } else if (A.view !== 'all') {
      const back = h('button', { type: 'button', class: 'pjx-link', text: 'Show all projects', 'data-k': 'back-all' });
      back.addEventListener('click', () => setView('all'));
      E.notes.appendChild(h('div.pjx-a-band', null, h('span.pjx-a-band-ico', { html: icon('filter', 15), 'aria-hidden': 'true' }),
        h('span.pjx-a-band-t', { text: 'Showing ' + list.length + ' · ' + VIEWS[A.view] }), back));
    }
    E.notes.hidden = !E.notes.children.length;
    // the grid: a card is redrawn only when what it shows changed, so focus, hover and a menu's anchor stay put
    const grid = E.grid, want = [];
    const ae = D.activeElement;
    if (A.creating) {
      const old = A.creating.el, had = old && old.contains(ae);
      want.push(A.creating.el = creatingCard());
      if (had) later(() => { const b = A.creating && A.creating.el && A.creating.el.querySelector('[data-k="progress"]'); if (b) b.focus({ preventScroll: true }); }, 0);
    }
    list.forEach((p) => {
      const sig = cardSig(p);
      let c = A.cards.get(p.id);
      if (!c || c.sig !== sig) {
        const el = buildCard(p), key = shown(p).key;
        if (c && c.el.contains(ae)) {
          // keep the person where they were: the same button if it is still there, else the card's Details
          const k = ae.getAttribute && ae.getAttribute('data-k');
          c.focusNext = (k && el.querySelector('[data-k="' + k + '"]')) || el.querySelector('[data-k="details"]');
        }
        if (c && c.key !== key) { const m = el.querySelector('.pjx-a-meta .pjx-st'); if (m) m.classList.add('is-changed'); }
        const focusNext = c && c.focusNext;
        c = { el, sig, key };
        c.focusNext = focusNext;
      }
      A.cards.set(p.id, c);
      want.push(c.el);
    });
    const keepIds = new Set(list.map((p) => p.id));
    Array.from(A.cards.keys()).forEach((id) => { if (!keepIds.has(id)) A.cards.delete(id); });
    // put the wanted cards in order, moving only what is out of place
    const before = new Set(Array.from(grid.children));
    want.forEach((el, i) => { if (grid.children[i] !== el) grid.insertBefore(el, grid.children[i] || null); });
    while (grid.children.length > want.length) grid.lastElementChild.remove();
    list.forEach((p) => { const c = A.cards.get(p.id); if (c && c.focusNext) { const f = c.focusNext; c.focusNext = null; if (f.isConnected) f.focus({ preventScroll: true }); } });
    // the entrance: on arrival, and for the cards a filter, search or sort brings in (the ones already shown stay
    // still); never on a status update
    if (A.animate) {
      A.animate = false;
      let n = 0;
      want.forEach((el) => {
        if (before.has(el)) return;
        el.style.setProperty('--i', String(Math.min(n++, 10)));
        el.classList.remove('is-new'); void el.offsetWidth; el.classList.add('is-new');
        later(() => el.classList.remove('is-new'), 700);
      });
    }
    // nothing to show
    E.empty.hidden = !!list.length || !!A.creating;
    if (!list.length) paintEmpty();
  }
  function paintEmpty() {
    const E = A.els, el = E.empty; el.innerHTML = '';
    let t, s, b;
    if (A.q.trim()) { t = 'No projects match “' + A.q.trim() + '”'; s = 'Search looks at names, stacks, folders, online copies and problems.'; b = btn('Clear search', { k: 'empty-clear', run: () => clearSearch(true) }); }
    else if (A.view === 'attention') { t = 'Nothing needs you'; s = 'Every project’s folder, history, online copy and backup are fine.'; b = btn('Show all projects', { k: 'empty-all', run: () => setView('all') }); }
    else if (A.view === 'archived') { t = 'No archived projects'; s = 'Archive a project from its More menu to keep it out of your list.'; b = btn('Show all projects', { k: 'empty-all', run: () => setView('all') }); }
    else if (A.view === 'working') { t = 'Nothing is working right now'; s = 'Runs and owner tasks show here while they work.'; b = btn('Show all projects', { k: 'empty-all', run: () => setView('all') }); }
    else if (A.view === 'unprotected') { t = 'Every project is backed up'; s = 'Each has a backup place and a schedule.'; b = btn('Show all projects', { k: 'empty-all', run: () => setView('all') }); }
    else { t = 'No projects in your list'; s = 'Archived projects are under Show › Archived.'; b = btn('New Project', { k: 'empty-new', run: () => openNew({}) }); }
    el.append(h('span.pjx-a-empty-mark', { html: A.view === 'attention' || A.view === 'unprotected' ? mark('complete', 18) : icon(A.q ? 'search' : 'folder', 20), 'aria-hidden': 'true' }),
      h('p.pjx-a-empty-t', { text: t }), h('p.pjx-a-empty-s', { text: s }), b);
  }
  /* the first run: a welcome with the five ways in, each opening New Project at that way */
  function paintWelcome() {
    const el = A.els.welcome;
    if (el.getAttribute('data-look') === PJX.look() && el.children.length) return;
    el.setAttribute('data-look', PJX.look());
    el.innerHTML = '';
    const ways = h('div.pjx-a-ways', { role: 'group', 'aria-label': 'Ways to start' });
    F.WAYS.forEach((w) => {
      const b = h('button', { type: 'button', class: 'pjx-a-way', 'data-k': 'way-' + w.id },
        h('span.pjx-a-way-ico', { html: icon(w.glyph, 22), 'aria-hidden': 'true' }),
        h('span.pjx-a-way-t', { text: w.title }), h('span.pjx-a-way-s', { text: w.sub }),
        w.tag ? h('span.pjx-a-way-tag', { text: w.tag }) : null);
      b.addEventListener('click', () => openNew({ way: w.id }));
      ways.appendChild(b);
    });
    const newB = h('button', { type: 'button', class: 'pmw-act is-primary pjx-a-new', 'data-k': 'welcome-new' }, h('span.pjx-a-bico', { html: icon('plus', 15), 'aria-hidden': 'true' }), h('span', { text: 'New Project' }));
    newB.addEventListener('click', () => openNew({}));
    const imp = F.MORE[0];
    el.append(
      h('div.pjx-a-welcome-mark', { html: icon('folder-plus', 26), 'aria-hidden': 'true' }),
      h('h3.pjx-a-welcome-t', { text: 'No projects yet' }),
      h('p.pjx-a-welcome-s', { text: 'A Project keeps one thing you are making: its files, plans, chats and history. Start one, or bring in work you already have.' }),
      ways,
      h('div.pjx-a-welcome-acts', null, newB, h('span.pjx-a-welcome-or', { text: 'asks the same questions, one step at a time' })),
      h('p.pjx-a-welcome-note', null, h('span.pjx-a-band-ico', { html: icon('info', 14), 'aria-hidden': 'true' }), h('span', { text: imp.title + ': ' + imp.sub })));
  }

  /* ------------------------------------------------------------------ Details: a drawer over the right of the page */
  function openDrawer(id, from) {
    const p = PJX.get(id); if (!p) return;
    A.drawer = id; A.drawerFrom = from || null; A.drawerSig = '';
    const dr = A.els.drawer;
    placeDrawer();
    paintDrawer();
    dr.setAttribute('aria-hidden', 'false');
    dr.removeAttribute('inert');
    if (isGlass()) dr.setAttribute('data-lg-surface', 'panel');
    A.els.scrim.hidden = false;
    requestAnimationFrame(() => { dr.classList.add('open'); A.els.scrim.classList.add('is-on'); const f = dr.querySelector('.pjx-a-dh-title'); if (f) f.focus({ preventScroll: true }); placeNotices(); });
  }
  function closeDrawer(quiet) {
    if (!A.drawer) return;
    const id = A.drawer, from = A.drawerFrom, dr = A.els.drawer;
    A.drawer = null; A.drawerFrom = null;
    dr.classList.remove('open'); A.els.scrim.classList.remove('is-on');
    dr.setAttribute('aria-hidden', 'true'); dr.setAttribute('inert', '');
    placeNotices();
    later(() => { if (!A.drawer) { A.els.scrim.hidden = true; dr.removeAttribute('data-lg-surface'); } }, PJX.reduced() ? 0 : 300);
    if (quiet) return;
    // focus goes back to the button that opened it, or to the same card's Details if that card was redrawn
    let back = from && from.isConnected ? from : null;
    if (!back) { const c = A.cards.get(id); back = c && c.el.querySelector('[data-k="details"]'); }
    if (back) back.focus({ preventScroll: true });
  }
  function placeDrawer() {
    const top = A.els.top ? A.els.top.offsetHeight : 52;
    A.root.style.setProperty('--pjx-a-top', top + 'px');
  }
  function paintDrawer() {
    const p = A.drawer && PJX.get(A.drawer);
    if (A.drawer && !p) { closeDrawer(true); return; }
    if (!p) return;
    const sig = cardSig(p);
    if (sig === A.drawerSig) return;
    A.drawerSig = sig;
    const dr = A.els.drawer, ae = D.activeElement;
    const k = dr.contains(ae) && ae.getAttribute ? ae.getAttribute('data-k') : null;
    const oldBody = dr.querySelector('.pmu-inspbody'), scroll = oldBody ? oldBody.scrollTop : 0;
    dr.innerHTML = '';
    const pr = shown(p), archived = p.lifecycle === 'archived', s = safe(p), op = liveOp(p);
    // header: glyph, name, status, Open, Close
    const closeB = h('button', { type: 'button', class: 'pmu-iconbtn pjx-a-dh-x', 'data-k': 'close', html: icon('close', 16) });
    tip(closeB, 'Close details', 'Esc');
    closeB.addEventListener('click', () => closeDrawer());
    const st = slot(pr);
    const why = openBlock(p);
    const openB = archived ? btn('Unarchive', { cls: 'pmu-textbtn', icon: 'reset', k: 'd-unarchive', run: () => ACT.unarchive(p.id) })
      : btn('Open', { cls: 'pmu-textbtn', icon: 'open', k: 'd-open', off: why || null, run: () => ACT.open(p.id) });
    dr.appendChild(h('header.pmu-insphead.pjx-a-dh', null,
      h('span.pjx-a-glyph', { html: icon(p.glyph || 'box', 18), 'aria-hidden': 'true' }),
      h('div.pmu-insptitles', null, h('h3.pjx-a-dh-title', { id: 'pjxa-dh-title', tabindex: '-1', text: p.name }), h('div.pmu-inspsub.pjx-a-dh-sub', null, st, h('span.pjx-a-dh-place', { text: archived ? (p.archivedAt || 'Archived') : placeText(p) }))),
      openB, closeB));
    const body = h('div.pmu-inspbody.pjx-a-db');
    // Now
    const now = sec('Now');
    if (op) now.appendChild(workingRow(op));
    (archived ? [] : (p.attention || [])).forEach((att, i) => now.appendChild(drawerNotice(p, att, op, i)));
    const a = p.activity || {};
    now.appendChild(rows([
      ['Activity', h('span.pjx-a-rowv', null, h('span.pjx-st-mark', { html: still(a.key || 'idle', 13), 'aria-hidden': 'true' }), h('span', { text: [a.word, a.text].filter(Boolean).join(' · ') }))],
      ['When', h('span', { text: a.at ? a.at : '—' })],
      ['Runs', h('span', { text: a.runs ? a.runs + ' working now' : 'None running' })],
      ['Opened', h('span', { text: archived ? 'Last ' + String(p.opened).toLowerCase() : openedText(p) })]
    ]));
    now.appendChild(acts([btn('Open the Orchestrator', { k: 'd-orch', icon: 'workflow', run: () => ACT.orchestrator(p.id) })]));
    body.appendChild(now);
    // Where it lives
    const where = sec('Where it lives');
    where.appendChild(rows([
      ['Place', h('span', { text: placeText(p) })],
      ['Folder', h('span.pjx-a-rowv.is-path', null, p.where.missing ? h('span.pjx-a-missing', { text: 'Missing' }) : null, pathEl(p.where.path, p.where.missing ? 'is-full is-gone' : 'is-full'))]
    ]));
    where.appendChild(acts([
      btn(p.where.missing ? 'Find the folder…' : 'Move or change folder…', { cls: p.where.missing ? 'pmu-textbtn is-primary' : 'pjx-a-btn', icon: 'folder-search', k: 'd-move', off: busyWhy(op, 'repair') || null, run: () => PJX.emit('need-repair', { id: p.id, move: !p.where.missing }) }),
      btn('Show in file manager', { icon: 'folder', k: 'd-reveal', off: p.where.missing ? 'The folder is missing' : null, run: () => ACT.reveal(p.id) }),
      btn('Copy path', { icon: 'copy', k: 'd-copy', run: () => ACT.copyPath(p.id) })
    ]));
    body.appendChild(where);
    // Keeping it safe: history, online copy, backup, each with its owner's actions
    const safeSec = sec('Keeping it safe');
    const o = p.online || {}, b = p.backup || {};
    const signedOut = (p.attention || []).some((x) => x.code === 'signed_out');
    safeSec.appendChild(safeBlock(s.history, s.history.key === 'off' ? 'Only safety copies before big changes are kept.' : (p.history.backend === 'jujutsu' ? 'Jujutsu keeps bookmarks and workspaces; it works with ' + (o.service || 'any Git service') + '.' : ''), [
      btn('Open history', { k: 'd-hist', icon: 'history', run: () => PJX.toast('History for ' + p.name, 'Opens Source Control’s history, chosen for ' + p.name + '.', 'info') })
    ]));
    safeSec.appendChild(safeBlock(s.online, o.service ? [o.privacy ? 'Who can see it: ' + o.privacy : null].filter(Boolean).join(' · ') : 'Files and history stay on this computer only.', o.service ? [
      signedOut ? btn('Sign in', { cls: 'pmu-textbtn is-primary', icon: 'key', k: 'd-signin', off: busyWhy(op, 'sign_in') || null, run: () => ACT.signIn(p.id) }) : null,
      o.behind ? btn('Get the latest', { cls: 'pmu-textbtn', icon: 'download', k: 'd-pull', off: op && op.kind === 'sync' ? op.label + ' now' : null, run: () => ACT.getLatest(p.id) }) : null,
      o.ahead && o.state !== 'waiting' ? btn('Send changes', { cls: 'pmu-textbtn', icon: 'upload', k: 'd-push', off: op && op.kind === 'sync' ? op.label + ' now' : null, run: () => ACT.send(p.id) }) : null,
      btn('Open on ' + o.service, { icon: 'globe', k: 'd-web', run: () => ACT.openOnline(p.id) })
    ] : [btn('Add an online copy…', { icon: 'cloud', k: 'd-addonline', run: () => PJX.toast('Online copy', 'Opens Source Control’s publish flow for ' + p.name + '.', 'info') })]));
    safeSec.appendChild(safeBlock(s.backup, b.dest ? [b.size, b.versions ? b.versions + ' versions kept' : null].filter(Boolean).join(' · ') : 'An online copy keeps files and history, not plans, chats and settings. A backup keeps everything.', b.dest ? [
      btn('Back up now', { cls: 'pmu-textbtn' + (b.state === 'warning' ? ' is-primary' : ''), icon: 'upload', k: 'd-backup', off: op && op.kind === 'backup' ? 'A backup is running' : null, run: () => ACT.backupNow(p.id) }),
      btn('Backup history', { icon: 'history', k: 'd-bhist', run: () => ACT.backupHistory(p.id) }),
      btn('Restore as new…', { icon: 'reset', k: 'd-restore', run: () => openNew({ way: 'restore' }) })
    ] : [btn('Set up backup', { cls: 'pmu-textbtn is-primary', icon: 'safe', k: 'd-setup', off: busyWhy(op, 'setup_backup') || null, run: () => ACT.setupBackup(p.id) })]));
    if (p.sync && p.sync.devices) safeSec.appendChild(h('p.pjx-a-hint.pjx-a-sync', null, h('span', { html: icon('swap', 13), 'aria-hidden': 'true' }), h('span', { text: 'Your other Puppet Master devices see this project (' + p.sync.devices + ' device' + (p.sync.devices > 1 ? 's' : '') + ').' })));
    body.appendChild(safeSec);
    // Settings and the list
    const set = sec('Settings');
    const live = p.activity && p.activity.key === 'working';
    set.appendChild(acts([
      btn('Project settings', { icon: 'settings', k: 'd-settings', run: () => ACT.settings(p.id) }),
      btn('Rename…', { icon: 'edit', k: 'd-rename', run: () => PJX.emit('need-rename', { id: p.id }) }),
      btn('New project like this…', { icon: 'folder-plus', k: 'd-like', run: () => openNew({ like: p.id }) })
    ]));
    set.appendChild(acts([
      archived ? btn('Unarchive', { icon: 'reset', k: 'd-unarch2', run: () => ACT.unarchive(p.id) })
        : btn('Archive', { icon: 'archive', k: 'd-archive', off: live ? 'Work is running in it' : null, run: () => ACT.archive(p.id) }),
      btn('Remove from list…', { icon: 'close', k: 'd-remove', off: live ? 'Work is running in it' : null, run: () => PJX.emit('need-remove', { id: p.id }) })
    ], 'Archive hides it and keeps everything. Remove from list deletes nothing; add it back any time.'));
    body.appendChild(set);
    // Delete data: its own section, never beside Remove (Project_System §4)
    const del = PJX.deleteItem(p);
    const dz = h('section.pjx-a-sec.pjx-a-danger', { 'aria-labelledby': 'pjxa-del' }, h('h4.pjx-a-sech', { id: 'pjxa-del', text: 'Delete Puppet Master’s data' }), h('p.pjx-a-hint', { text: del.say }));
    dz.appendChild(acts([btn(del.label, { cls: 'pjx-a-btn', danger: true, icon: 'trash', k: 'd-delete', off: del.disabled || null, run: del.run })]));
    body.appendChild(dz);
    dr.appendChild(body);
    body.scrollTop = scroll;
    if (k) { const f = dr.querySelector('[data-k="' + k + '"]'); if (f) f.focus({ preventScroll: true }); else { const t = dr.querySelector('.pjx-a-dh-title'); if (t) t.focus({ preventScroll: true }); } }
  }
  /* an attention item in Details: every fix labelled; a fix whose task is already running says so and waits */
  function drawerNotice(p, att, op, i) {
    const acts = (att.actions || []).filter((x) => x !== 'details' && ACTIONS[x]);
    const n = P.notice(p, Object.assign({}, att, { actions: acts }), { cls: 'pmu-textbtn' });
    n.removeAttribute('role');
    n.querySelector('.pjx-notice-mark').innerHTML = still(att.key, 16);
    n.querySelectorAll('.pjx-notice-acts button').forEach((b, j) => {
      b.setAttribute('data-k', 'd-att-' + i + '-' + j);
      const why = busyWhy(op, acts[j]);
      // the clone carries no click handler: nothing can start the same task a second time
      if (why) { const c = b.cloneNode(true); c.setAttribute('aria-disabled', 'true'); tip(c, c.textContent, why); b.replaceWith(c); }
    });
    if (op && acts.some((a) => busyWhy(op, a))) n.setAttribute('data-busy', '');
    return n;
  }
  function sec(title) { return h('section.pjx-a-sec', null, h('h4.pjx-a-sech', { text: title })); }
  function rows(list) {
    const g = h('dl.pjx-a-rows');
    list.forEach(([k, v]) => { g.appendChild(h('dt', { text: k })); g.appendChild(h('dd', null, v)); });
    return g;
  }
  function acts(list, note) {
    const r = h('div.pjx-a-dacts', null, ...list.filter(Boolean));
    return note ? h('div', null, r, h('p.pjx-a-hint', { text: note })) : r;
  }
  function safeBlock(x, extra, actList) {
    return h('div.pjx-a-safe', { 'data-tone': P.tone(x.key) },
      h('span.pjx-st-mark', { html: x.key === 'working' ? mark('working', 14) : still(x.key, 14), 'aria-hidden': 'true' }),
      h('div.pjx-a-safe-main', null,
        h('div.pjx-a-safe-head', null, h('span.pjx-a-safe-l', { text: x.label }), h('b.pjx-a-safe-w', { text: x.text })),
        extra ? h('p.pjx-a-hint', { text: extra }) : null,
        acts(actList)));
  }
  /* the drawer keeps Tab inside itself while it is open, as a dialog does */
  function drawerKeys(e) {
    if (e.key !== 'Tab' || !A.drawer) return;
    const dr = A.els.drawer;
    const f = Array.from(dr.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])')).filter((x) => !x.disabled && x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (D.activeElement === first || !dr.contains(D.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && D.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ------------------------------------------------------------------ Find the folder: this page's own window
     The shared repair part (PJX.parts.repairBody) asks the questions; this window hosts it so that focus stays on the
     choice that was pressed while the part redraws itself, and so the fix is seen through to its end: the owner task's
     phases while it runs, then the project as its card will show it, with Open. Closing goes back to that card. */
  const REP = { cur: null };
  const LOUD = { blocked: 1, failed: 1, waiting: 1, offline: 1, warning: 1 };
  /* the part draws marks that loop (a pulsing lock); in this window they are the calm ones, like everywhere on the page */
  function calmIn(el) {
    el.querySelectorAll('.pjx-notice[data-tone] > .pjx-notice-mark').forEach((m) => { const k = m.parentNode.getAttribute('data-tone') === 'blocked' ? 'blocked' : 'warning'; m.innerHTML = still(k, 16); });
    el.querySelectorAll('.pjx-fact').forEach((li) => { const k = (/(?:^|\s)is-([a-z]+)/.exec(li.className) || [])[1]; const m = li.querySelector('.pjx-fact-mark'); if (k && LOUD[k] && m) m.innerHTML = still(k, 14); });
  }
  function openRepair(id, move) {
    const p = PJX.get(id); if (!p) return false;
    if (REP.cur && REP.cur.dlg) REP.cur.dlg.close('replace');
    const R = { id, move: !!move, phase: 'choose', last: null, look: PJX.look(), dlg: null, op: null, footSig: '' };
    REP.cur = R;
    const holder = h('div.pjx-a-rep');
    const ctx = { move: R.move, onChange: () => afterDraw() };
    const body = P.repairBody(p, ctx);
    holder.appendChild(body);
    // remember the control in use, by what it is (its choice value, its words), not by the element the part replaces
    holder.addEventListener('focusin', (e) => { const t = e.target; R.last = t && t.getAttribute ? { key: t.getAttribute('data-pjx-key'), fk: focusKey(t, holder) } : null; });
    /* the part gives focus back to the control in use after it redraws (by choice value, field key or words); this
       window calms the redrawn marks and redraws its foot, keeping focus there when it was there */
    function afterDraw() {
      if (!R.dlg || R.phase !== 'choose') return;
      calmIn(holder);
      paint();
      // a folder's answer ("the same project") lands under the fold of the list: bring it into view once, as it arrives
      const pr = ctx.state && ctx.state.probe;
      if (pr && pr !== R.seen) {
        R.seen = pr;
        const g = Array.from(holder.querySelectorAll('.pjx-group')).pop();
        if (g && g.scrollIntoView) later(() => g.scrollIntoView({ block: 'nearest', behavior: PJX.reduced() ? 'auto' : 'smooth' }), 0);
      }
      // the part restores focus only when it held it; a redraw that started from the foot keeps the foot's focus above
      later(() => { if (R.dlg && R.phase === 'choose' && !R.dlg.el.contains(D.activeElement) && R.last) refocus(R.last.fk, holder); }, 0);
    }
    function paint() {
      if (!R.dlg) return;
      let list;
      if (R.phase === 'choose') {
        const pr = body.pjxPrimary();
        list = [
          R.move ? null : { label: 'Remove from list…', quiet: true, run: () => { R.dlg.close('remove'); PJX.emit('need-remove', { id }); } },
          { spacer: true },
          { label: 'Cancel', run: () => R.dlg.close('cancel') },
          { label: pr.label, primary: true, disabled: pr.disabled || null, run: () => go(pr) }
        ].filter(Boolean);
      } else if (R.phase === 'working') list = [{ spacer: true }, { label: 'Close', run: () => R.dlg.close('later') }];
      else {
        const q = PJX.get(id) || p, why = openBlock(q);
        list = [{ label: 'Close', run: () => R.dlg.close('done') }, { spacer: true },
          { label: 'Open ' + q.name, primary: true, disabled: why || null, run: () => { R.dlg.close('open'); ACT.open(id); } }];
      }
      const sig = R.phase + JSON.stringify(list.map((x) => [x.label, !!x.disabled]));
      if (sig === R.footSig) return;
      R.footSig = sig;
      const ae = D.activeElement, had = R.dlg.foot.contains(ae) ? (ae.classList.contains('is-primary') ? '§primary' : ae.textContent) : null;
      R.dlg.setActions(list);
      if (had) {
        const b = had === '§primary' ? R.dlg.foot.querySelector('.is-primary:not([disabled])') : Array.from(R.dlg.foot.querySelectorAll('button')).find((x) => x.textContent === had);
        if (b) b.focus({ preventScroll: true });
        else if (R.phase === 'choose' && R.last) refocus(R.last.fk, holder);
      }
    }
    /* the fix itself: the part starts the owner task (test, then update; or clone; or restore; or move), and the window
       stays to show it working, then shows the result */
    async function go(pr) {
      if (pr.keep) { pr.run(); return; }
      const way = (ctx.state && ctx.state.way) || 'find';
      R.phase = 'working';
      const off = PJX.on('op', (op) => { if (op.id === id && !op.done) { R.op = op; drawWorking(); } });
      const pending = Promise.resolve(pr.run());   // its first progress event has already arrived
      drawWorking(true); paint();
      try { await pending; } finally { off(); }
      if (!R.dlg) return;
      R.phase = 'done';
      const q = PJX.get(id);
      if (!q) { R.dlg.close('gone'); return; }
      holder.innerHTML = '';
      const where = q.where.path;
      const said = way === 'clone' ? ['is back', 'A fresh copy from ' + (q.online.service || 'its online copy') + ' is at ' + where + '. Changes that were never sent are not in it.']
        : way === 'restore' ? ['is back', 'Restored from its backup on ' + (q.backup.dest || 'your backup place') + ', at ' + where + '. Sign in again where it needs it.']
          : way === 'moveit' ? ['moved', 'Now at ' + where + '. The old folder is still there until you remove it.']
            : ['is back', 'Found at ' + where + '. Only the place changed: its history, online copy and backups are as they were.'];
      holder.appendChild(h('section', { class: ['pjx-a-out', !PJX.reduced() && 'is-arrive'], 'data-phase': 'done' }, hero(q.glyph, 'complete', q.name + ' ' + said[0], said[1]), preview(q)));
      paint();
      const t = holder.querySelector('.pjx-q-title'); if (t) t.focus({ preventScroll: true });
    }
    function drawWorking(first) {
      if (!R.dlg || R.phase !== 'working') return;
      const op = R.op || { label: 'Starting', phase: '', i: 0, n: 1 };
      if (first || !holder.querySelector('.pjx-a-rep-work')) {
        holder.innerHTML = '';
        holder.appendChild(h('section.pjx-a-out.pjx-a-rep-work', { 'data-phase': 'working' },
          hero(p.glyph, 'working', op.label + ' · ' + p.name, 'Puppet Master checks each step before the next. You can close this window; it keeps going, and the card shows it.'),
          workingRow(op)));
        const t = holder.querySelector('.pjx-q-title'); if (t) t.focus({ preventScroll: true });
      } else holder.querySelector('.pjx-a-working').replaceWith(workingRow(op));
    }
    R.dlg = PJX.dialog({ title: (R.move ? 'Move or change the folder of ' : 'Find ') + p.name + (R.move ? '' : '’s folder'), kicker: R.move ? 'Where it lives' : 'Folder missing', body: holder, wide: true,
      onClose: () => { R.dlg = null; if (REP.cur === R) REP.cur = null; returnFocus(id); } });
    R.dlg.el.classList.add('pjx-a-repdlg');
    R.repaint = () => calmIn(holder);
    calmIn(holder);
    paint();
    return true;
  }
  /* after a window over the page closes, focus goes back to the project it was about: the button that opened the window
     is often gone (its card was redrawn when the task started), so it lands on that card's Open (or Details), or on
     Details' own head when Details is open */
  function returnFocus(id) {
    if (!A.root) return;
    // a control on this page that still exists keeps focus; anything else (nothing, a redrawn button, the title bar's
    // look menu when the window was opened from the review strip) gives way to the project's own card
    const ae = D.activeElement;
    if (ae && ae !== D.body && ae.isConnected && (A.root.contains(ae) || ae.closest('.pjx-dlg-back'))) return;
    let t = null;
    if (A.drawer === id) t = A.els.drawer.querySelector('[data-k="d-open"]:not([aria-disabled="true"])') || A.els.drawer.querySelector('.pjx-a-dh-title');
    else { const c = A.cards.get(id); if (c) t = c.el.querySelector('[data-k="open"]:not([aria-disabled="true"])') || c.el.querySelector('[data-k="details"]'); }
    if (t) { t.focus({ preventScroll: true }); if (!A.drawer && t.scrollIntoView) t.scrollIntoView({ block: 'nearest' }); }
  }

  /* ------------------------------------------------------------------ the app's title-bar notes
     PMConcept7's notes (#rsStage) drop from the title bar over the right of this page's head, where Search, Refresh and
     New Project are. While Projects shows they sit at the bottom right of this page instead (beside Details when it is
     open), as Usage places them for its page (PMU.shell.placeNotices); they still take no pointer (core.css). */
  function placeNotices() {
    const rs = D.getElementById('rsStage');
    if (!rs || !A.root || !rs.firstElementChild || !D.body.classList.contains('pjx-page-active')) return;
    const sr = A.root.getBoundingClientRect(); if (!sr.width || !sr.height) return;
    const dr = A.drawer && A.els.drawer ? A.els.drawer.getBoundingClientRect() : null;
    const edge = dr && dr.width && dr.left > sr.left + 240 ? dr.left - 12 : sr.right - 18;
    rs.style.translate = 'none';
    const r = rs.getBoundingClientRect(); let right = 0, left = Infinity;
    for (let c = rs.firstElementChild; c; c = c.nextElementSibling) { const cr = c.getBoundingClientRect(); right = Math.max(right, cr.right); left = Math.min(left, cr.left); }
    rs.style.translate = '';
    if (!right) { right = r.right; left = r.left; }
    // where the notes already sit clear of this page (a narrow window puts the page left of the chat), they stay put
    if (left >= sr.right || right <= sr.left) { rs.style.setProperty('--pjx-a-rs-x', '0px'); rs.style.setProperty('--pjx-a-rs-y', '0px'); return; }
    let x = Math.round(edge - right);
    if (left + x < 8) x = Math.round(8 - left);   // a note wider than the page stays inside the window
    rs.style.setProperty('--pjx-a-rs-x', x + 'px');
    rs.style.setProperty('--pjx-a-rs-y', 'calc(' + Math.round(sr.bottom - 18 - r.top) + 'px - 100%)');
  }

  /* ------------------------------------------------------------------ New Project: one stepped window */
  const NW = { cur: null };
  const VERB = { new: 'Create', folder: 'Add', online: 'Copy', device: 'Add', restore: 'Restore' };
  function openNew(opts) {
    opts = opts || {};
    const old = NW.cur;
    if (old && old.dlg) {
      // a creation that is running keeps running; a draft is replaced by the new start
      if (old.phase === 'creating' || old.phase === 'resuming') { old.dlg.el.focus(); return; }
      old.dlg.close('replace');
    }
    const s = F.start({ way: opts.way, like: opts.like, text: opts.text });
    if (opts.way && !opts.text && s.step === 'way') s.next();
    const st = { gen: A.gen, s, phase: 'steps', last: null, dir: 1, demoFail: false, alt: false, list: [], states: [], result: null, advance: false, dlg: null, name: '', pasteMiss: '' };
    NW.cur = st;
    s.on(() => { if (NW.cur === st && st.phase === 'steps') paintNW(st); });
    openWindow(st);
  }
  /* Setup didn't finish, from a card, Details, Open or the review strip: the same window at its "didn't finish" screen,
     so Continue setup runs here, shows each step it does, and ends on the same Done screen as New Project (the shared
     dialog reads p.recovery after the core has cleared it; see the report) */
  function openResume(id) {
    const p = PJX.get(id); if (!p || !p.recovery) return false;
    const old = NW.cur;
    if (old && old.dlg) {
      if (old.phase === 'creating' || old.phase === 'resuming') { old.dlg.el.focus(); return true; }
      old.dlg.close('replace');
    }
    const st = { gen: A.gen, s: null, phase: 'failed', title: 'Finish setting up ' + p.name, kicker: 'Setup didn’t finish', name: p.name, glyph: p.glyph,
      list: [], states: [], result: { ok: false, project: p }, dlg: null, from: D.activeElement };
    NW.cur = st;
    openWindow(st);
    return true;
  }
  function openWindow(st) {
    if (st.dlg) return;
    const steps = h('nav.pjx-a-nwsteps', { 'aria-label': 'New Project steps' });
    const stage = h('div.pjx-a-nwstage');
    st.els = { steps, stage };
    st.last = null; st.footSig = ''; st.lastOut = null;
    st.dlg = PJX.dialog({ title: st.title || 'New Project', kicker: st.kicker || null, body: stage, size: 'xl', sticky: true,
      onClose: () => {
        st.dlg = null;
        if (NW.cur === st && st.phase !== 'creating' && st.phase !== 'resuming') NW.cur = null;
        render();
        // the button that opened it may have been redrawn while it was open: go back to that project's card instead
        const p = st.result && st.result.project;
        if (p) returnFocus(p.id);
      } });
    const box = st.dlg.el;
    box.classList.add('pjx-a-nwdlg');
    box.insertBefore(steps, st.dlg.body);
    // picking a way card moves on by itself, a beat after the card shows it is chosen
    stage.addEventListener('click', (e) => { const c = e.target.closest && e.target.closest('.pjx-choices-ways .pjx-choice'); if (c && !c.classList.contains('is-off') && st.s.step === 'way') st.advance = true; }, true);
    stage.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('.pjx-choices-ways .pjx-choice')) st.advance = true; }, true);
    // Alt-click Create is the concept demo's network drop
    box.addEventListener('pointerdown', (e) => { st.alt = !!e.altKey; }, true);
    box.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') st.alt = !!e.altKey; }, true);
    // a pasted link, folder path, address or Recovery Kit on the Begin step finds its way and skips ahead
    box.addEventListener('paste', (e) => {
      if (st.phase !== 'steps' || st.s.step !== 'way') return;
      if (e.target && /input|textarea/i.test(e.target.tagName || '')) return;
      const t = ((e.clipboardData && e.clipboardData.getData('text')) || '').trim();
      const d = F.detect(t);
      e.preventDefault();
      if (!d) { st.pasteMiss = t.slice(0, 48); paintNW(st); return; }
      st.pasteMiss = ''; st.dir = 1; F.applyDetected(st.s, d); st.s.changed();
    });
    paintNW(st);
  }
  function paintNW(st) {
    if (!st.dlg) return;
    if (st.phase === 'steps') paintSteps(st);
    else paintOutcome(st);
  }
  /* the stepper: every step by its own label; done steps are buttons back, later steps open once every step before
     them is answered */
  function paintStepper(st, locked) {
    // a window opened at Setup didn't finish (from a card) has no steps behind it to show
    st.els.steps.hidden = !st.s;
    if (!st.s) return;
    const s = st.s, ids = s.steps(), i = locked ? ids.length : ids.indexOf(s.step);
    const ol = h('ol.pjx-stepper.pjx-a-stepper');
    let blocked = false;
    ids.forEach((id, k) => {
      const def = F.STEPS[id] || { label: id };
      const state = k < i ? 'done' : k === i ? 'now' : 'next';
      const can = !locked && k !== i && (k < i || !blocked);
      const b = h('button', { type: 'button', class: ['pjx-a-step', 'is-' + state], 'aria-current': k === i ? 'step' : null, disabled: can ? null : true, 'data-k': 'step-' + id },
        h('span.pjx-a-stepn', { html: k < i ? icon('check', 12) : String(k + 1), 'aria-hidden': 'true' }), h('span.pjx-a-stepl', { text: def.label }));
      if (k < i) b.setAttribute('aria-label', def.label + ', done');
      if (can) b.addEventListener('click', () => { st.dir = k < i ? -1 : 1; s.go(id); });
      if (!locked && k >= i && F.problem(s, id)) blocked = true;
      ol.appendChild(h('li', null, b));
      if (k < ids.length - 1) ol.appendChild(h('li.pjx-a-stepsep', { 'aria-hidden': 'true', html: icon('chevron-right', 12) }));
    });
    st.els.steps.innerHTML = '';
    st.els.steps.appendChild(ol);
  }
  /* which control had focus, so it can have it again after the step is drawn anew */
  function focusKey(el, stage) {
    if (!el || !stage.contains(el) || el.hasAttribute('data-pjx-key')) return null;
    const sel = el.tagName.toLowerCase() + (el.classList[0] ? '.' + el.classList[0] : '');
    const all = Array.from(stage.querySelectorAll(sel));
    return { sel, v: el.getAttribute('data-v'), text: el.textContent, idx: all.indexOf(el) };
  }
  function refocus(fk, stage) {
    if (!fk) return;
    const all = Array.from(stage.querySelectorAll(fk.sel));
    const hit = (fk.v != null && all.find((x) => x.getAttribute('data-v') === fk.v)) || all.find((x) => x.textContent === fk.text) || all[fk.idx];
    if (hit) hit.focus({ preventScroll: true });
  }
  function paintSteps(st) {
    const s = st.s, stage = st.els.stage, ids = s.steps(), i = ids.indexOf(s.step);
    const changed = st.last !== s.step, first = st.last === null;
    st.els.steps.hidden = false;
    paintStepper(st, false);
    const fk = focusKey(D.activeElement, stage);
    F.render(s, stage);
    const t = stage.querySelector('.pjx-q-title'); if (t) t.setAttribute('tabindex', '-1');
    if (s.step === 'way') {
      stage.querySelector('.pjx-step').appendChild(h('p.pjx-a-paste', null,
        h('span.pjx-a-paste-ico', { html: icon('copy', 13), 'aria-hidden': 'true' }),
        h('span', { text: st.pasteMiss ? 'Puppet Master doesn’t recognise “' + st.pasteMiss + '”. Choose a way above, or paste a link or a folder path.' : 'Have a link, a folder path or an address? Paste it here (Ctrl+V) to skip ahead.' })));
      if (st.advance && s.draft.way) {
        st.advance = false;
        later(() => { if (NW.cur === st && st.phase === 'steps' && s.step === 'way' && s.draft.way) { st.dir = 1; s.next(); } }, PJX.reduced() ? 0 : 170);
      }
    }
    if (s.step === 'review') stage.querySelector('.pjx-step').appendChild(demoBox(st));
    if (changed) {
      st.dlg.body.scrollTop = 0;
      if (!first && !PJX.reduced()) { stage.classList.remove('is-fwd', 'is-back'); void stage.offsetWidth; stage.classList.add(st.dir < 0 ? 'is-back' : 'is-fwd'); }
      // a step with a field to fill starts in it (Name); any other step starts at its question
      if (!first) { const f = stage.querySelector('input[autofocus]'); (f || t) && (f || t).focus({ preventScroll: true }); }
    } else refocus(fk, stage);
    st.last = s.step;
    // the foot: Back, the step it is on (and what is still missing), Cancel, Continue or the way's own verb
    const prob = F.problem(s, s.step), review = s.step === 'review';
    const name = String(s.draft.name || '').trim() || 'it';
    const list = [];
    if (i > 0) list.push({ label: 'Back', run: () => { st.dir = -1; s.back(); } });
    list.push({ spacer: true });
    list.push({ label: 'Cancel', quiet: true, run: () => st.dlg.close('cancel') });
    // nothing is made from an incomplete draft: Create waits for every step's answer (the core checks again)
    const open = review ? ids.find((id) => F.problem(s, id)) : null;
    const openWhy = open ? (F.STEPS[open] ? F.STEPS[open].label + ': ' : '') + F.problem(s, open) : '';
    if (review) list.push({ label: (VERB[s.draft.way] || 'Create') + ' ' + name, primary: true, disabled: openWhy || null, run: () => create(st) });
    else list.push({ label: 'Continue', primary: true, disabled: prob || null, run: () => { st.dir = 1; s.next(); } });
    const note = 'Step ' + (i + 1) + ' of ' + ids.length + (prob && s.step !== 'way' ? ' · ' + prob : openWhy ? ' · ' + openWhy : '');
    const sig = JSON.stringify(list.map((x) => [x.label, !!x.disabled])) + note;
    if (sig !== st.footSig) {
      st.footSig = sig;
      const hadFocus = st.dlg.foot.contains(D.activeElement) ? D.activeElement.textContent : null;
      st.dlg.setActions(list);
      st.dlg.foot.insertBefore(h('span.pjx-a-nwnote', { text: note, 'aria-live': 'polite' }), st.dlg.foot.querySelector('.pjx-grow'));
      if (hadFocus && !changed) { const b = Array.from(st.dlg.foot.querySelectorAll('button')).find((x) => x.textContent === hadFocus); if (b) b.focus({ preventScroll: true }); }
    }
  }
  /* the concept demo's switch, clearly a demo control: the network drops while setup copies or sends */
  function demoBox(st) {
    const can = F.phases(st.s).some((x) => x.clone);
    const inp = h('input', { type: 'checkbox', checked: st.demoFail && can ? true : null, disabled: can ? null : true });
    inp.addEventListener('change', () => { st.demoFail = inp.checked; });
    return h('div.pjx-a-demo', null,
      h('label.pjx-check', null, inp, h('span', { text: 'Concept demo: the network drops during setup' })),
      h('p.pjx-a-hint', { text: can ? 'Shows Setup didn’t finish. Alt-click the Create button does the same.' : 'Only when setup copies from, or sends to, an online service.' }));
  }
  async function create(st) {
    const s = st.s, fail = !!(st.demoFail || st.alt);
    st.alt = false;
    st.name = String(s.draft.name || '').trim();
    st.phase = 'creating';
    st.list = F.phases(s); st.states = st.list.map(() => 'pending');
    A.creating = { st, i: 0, n: st.list.length, label: st.list[0] ? st.list[0].label : '' };
    const mine = () => A.creating && A.creating.st === st;
    paintNW(st); render();
    const res = await F.commit(s, { fail, onPhase: (i, list, state) => {
      st.states[i] = state;
      if (mine()) { A.creating.i = i; A.creating.label = list[i].label; }
      if (st.dlg) paintOutcome(st);
      if (mine() && A.creating.el && A.creating.el.isConnected) {
        const had = A.creating.el.contains(D.activeElement), fresh = creatingCard();
        A.creating.el.replaceWith(fresh); A.creating.el = fresh;
        if (had) { const b = fresh.querySelector('[data-k="progress"]'); if (b) b.focus({ preventScroll: true }); }
      }
    } });
    if (mine()) A.creating = null;
    // the page was left (another concept, a reset) while it ran: the core added the project; this page says nothing
    if (st.gen !== A.gen) return;
    if (!res.ok && !res.project && res.step) {
      // an answer stopped being right while the window was open (a name another project took): back to that step
      st.phase = 'steps'; st.last = null; st.footSig = ''; st.dir = -1;
      if (st.dlg) { st.s.go(res.step); paintNW(st); } else PJX.toast('Nothing was made', res.said || '', 'warn');
      render();
      return;
    }
    st.result = res;
    st.phase = res.ok ? 'done' : res.project ? 'failed' : 'nothing';
    if (st.dlg) paintNW(st);
    else if (res.ok) PJX.toast(st.name + ' is ready', 'Open it from its card, or plan it in the Planning Wizard.', 'success');
    else if (res.project) PJX.toast('Setup didn’t finish for ' + st.name, 'Its card has Continue setup. Nothing is made twice.', 'warn', true);
    else PJX.toast('Nothing was made', res.said || '', 'warn');
    render();
  }
  /* Continue setup, in the same window: only what is left, never a second repository. The list starts with what was
     already done, so the person sees it pick up where it stopped ("1 of 4 done" from the first moment) */
  async function resumeHere(st) {
    const p = st.result && st.result.project; if (!p || !p.recovery) return;
    const rec = p.recovery, base = rec.settled.length;
    st.phase = 'resuming';
    st.list = rec.settled.map((r) => ({ label: r.label + (r.ref ? ' · ' + r.ref : '') })).concat(rec.remaining.map((r) => ({ label: r.label })));
    st.states = st.list.map((_, i) => (i < base ? 'complete' : 'pending'));
    paintNW(st);
    const off = PJX.on('op', (op) => {
      if (op.id !== p.id || op.kind !== 'resume') return;
      st.states = st.list.map((_, i) => (i < base || op.done || i - base < op.i ? 'complete' : i - base === op.i ? 'working' : 'pending'));
      if (st.dlg) paintOutcome(st);
    });
    A.offs.push(off);
    await ACT.resume(p.id);
    off();
    st.states = st.list.map(() => 'complete');
    st.result = { ok: true, project: PJX.get(p.id) || p };
    st.phase = 'done';
    if (st.dlg) paintNW(st);
  }
  /* while it runs, only the rows whose state changed are redrawn: a mark draws itself once when its state changes, so
     drawing the whole list again would replay every finished row's check on each step */
  function progressView(st) {
    const n = st.states.filter((x) => x === 'complete').length;
    const segs = h('span.pjx-a-segs.is-big', { 'aria-hidden': 'true' });
    st.states.forEach((x) => segs.appendChild(h('i', { class: x === 'complete' ? 'is-done' : x === 'working' ? 'is-now' : null })));
    return h('div.pjx-a-progress', null, segs, h('p.pjx-a-hint.pjx-a-count', { role: 'status', text: n + ' of ' + st.list.length + ' done' }));
  }
  function patchProgress(st) {
    const stage = st.els.stage, ol = stage.querySelector('.pjx-a-out .pjx-phases');
    if (!ol || ol.children.length !== st.list.length) return false;
    const fresh = F.phaseList(st.list, st.states);
    Array.from(ol.children).forEach((li, i) => { if (li.className !== fresh.children[i].className) li.replaceWith(fresh.children[i].cloneNode(true)); });
    const old = stage.querySelector('.pjx-a-progress'); if (old) old.replaceWith(progressView(st));
    return true;
  }
  /* the window's head for every outcome: the project's own glyph in its frame with the state's mark on its corner, the
     sentence that says what happened, and one line under it. The same frame carries Creating into Done, so the moment
     it is ready reads as the same object arriving, not as a new screen */
  function hero(glyph, key, title, lead) {
    return h('div.pjx-a-hero', { 'data-tone': P.tone(key) },
      h('span.pjx-a-hero-frame', { 'aria-hidden': 'true' },
        h('span.pjx-a-hero-glyph', { html: icon(glyph || 'seed', 26) }),
        h('span.pjx-a-hero-badge', { html: key === 'working' ? mark('working', 16) : still(key, 16) })),
      h('header.pjx-q.pjx-a-hero-text', null, h('h2.pjx-q-title', { tabindex: '-1', text: title }), lead ? h('p.pjx-q-lead', { text: lead }) : null));
  }
  /* the project as its card shows it on the page: what was just made, in the page's own words */
  function preview(p) {
    const s = stackText(p);
    const plate = h('div.pjx-a-preview', { role: 'group', 'aria-label': 'How ' + p.name + ' shows in your Projects' },
      h('div.pjx-a-pv-head', null,
        h('span.pjx-a-glyph', { html: icon(p.glyph || 'box', 18), 'aria-hidden': 'true' }),
        h('div.pjx-a-pv-titles', null, h('b.pjx-a-pv-name', { text: p.name }), (s || p.where.kind === 'device') ? h('span.pjx-a-pv-sub', { text: s || 'On ' + p.where.device }) : null),
        slot(PJX.primary(p))),
      h('div.pjx-a-pv-where', null, h('span.pjx-a-pv-l', { text: 'Where' }),
        h('span.pjx-a-pv-v', null, h('span.pjx-a-place', { text: placeText(p, true) }), pathEl(p.where.path))),
      safeLine(p));
    plate.querySelectorAll('.pjx-safe-cell').forEach((c, i) => c.style.setProperty('--c', String(i)));
    return h('div.pjx-a-pv-wrap', null, h('p.pjx-a-pv-cap', { text: 'In your Projects' }), plate);
  }
  function paintOutcome(st, force) {
    const stage = st.els.stage, dlg = st.dlg, ph = st.phase;
    if (!force && (ph === 'creating' || ph === 'resuming') && st.lastOut === ph && patchProgress(st)) return;
    paintStepper(st, true);
    stage.classList.remove('is-fwd', 'is-back');
    stage.innerHTML = '';
    const arrive = ph !== st.lastOut && !PJX.reduced();
    const view = h('section', { class: ['pjx-step', 'pjx-a-out', arrive && 'is-arrive'], 'data-phase': ph });
    const p = st.result && st.result.project;
    const glyph = p ? p.glyph : st.s ? draftGlyph(st.s) : st.glyph;
    let actsList;
    if (ph === 'creating' || ph === 'resuming') {
      view.appendChild(hero(glyph, 'working', (ph === 'resuming' ? 'Finishing ' : 'Creating ') + st.name, 'This takes a moment. You can close the window; it keeps going.'));
      // what is being done, beside what was chosen (the review, as it was confirmed)
      const left = h('div.pjx-a-outmain', null, progressView(st), F.phaseList(st.list, st.states));
      const right = h('aside.pjx-a-outside', { 'aria-label': 'What you chose' });
      if (ph === 'creating' && st.s) F.review(st.s).forEach((g) => {
        const dl = h('dl.pjx-review-rows');
        g.rows.forEach(([k, v]) => { dl.appendChild(h('dt', { text: k })); dl.appendChild(h('dd', { text: v })); });
        right.appendChild(h('section.pjx-review-group', null, h('h3.pjx-group-label', { text: g.label }), dl));
      });
      view.appendChild(h('div.pjx-a-outgrid', null, left, right.children.length ? right : null));
      actsList = [{ spacer: true }, { label: 'Close', run: () => dlg.close('later') }];
    } else if (ph === 'done') {
      const name = p ? p.name : st.name;
      const where = p && p.openedRank < 0 ? 'It is at the top of your Projects.' : 'It is in your Projects.';
      view.appendChild(hero(glyph, 'complete', name + ' is ready', p && p.activity && p.activity.text ? p.activity.text + '. ' + where : where));
      if (p) view.appendChild(preview(p));
      const done = h('details.pjx-a-donelist', null, h('summary', null, h('span.pjx-a-sum-ico', { html: icon('chevron-right', 13), 'aria-hidden': 'true' }), h('span', { text: 'What was done · ' + st.list.length + ' step' + (st.list.length === 1 ? '' : 's') })), F.phaseList(st.list, st.states));
      view.appendChild(done);
      actsList = [{ label: 'Done', run: () => dlg.close('done') }, { spacer: true },
        { label: 'Plan it in the Planning Wizard', icon: 'plan', run: () => { dlg.close('replan'); if (p) ACT.replan(p.id); } },
        { label: 'Open ' + name, primary: true, run: () => { dlg.close('open'); if (p) ACT.open(p.id); } }];
    } else if (ph === 'failed') {
      const att = (p.attention || [])[0] || { text: '' };
      view.appendChild(hero(glyph, 'waiting', 'Setup didn’t finish', att.text || (st.name + ' is in your list with what was made, so you can finish it.')));
      // a ledger: what is already there beside what is left, so "nothing is made twice" can be seen, not just read
      const settled = p.recovery.settled.length ? F.facts(p.recovery.settled.map((x) => ({ key: 'complete', text: x.label + (x.ref ? ' · ' + x.ref : '') }))) : h('p.pjx-a-hint', { text: 'Nothing yet.' });
      view.appendChild(h('div.pjx-a-ledger', null,
        h('section.pjx-a-ledger-col', null, h('h3.pjx-group-label', { text: 'Already done' }), settled),
        h('section.pjx-a-ledger-col', null, h('h3.pjx-group-label', { text: 'Still to do' }), F.phaseList(p.recovery.remaining, p.recovery.remaining.map(() => 'pending')))));
      view.appendChild(h('p.pjx-a-hint.pjx-a-ledger-note', { text: st.name + ' is in your list with what was made. Continue setup does only what is left' + (p.online && p.online.service ? '; the repository on ' + p.online.service + ' is never made a second time.' : '; nothing is made twice.') }));
      actsList = [{ label: 'Later', run: () => dlg.close('later') }, { spacer: true },
        p.online && p.online.repo ? { label: 'Open on ' + p.online.service, icon: 'globe', quiet: true, run: () => ACT.openOnline(p.id) } : null,
        { label: 'Continue setup', primary: true, icon: 'play', run: () => resumeHere(st) }].filter(Boolean);
    } else {
      view.appendChild(hero(glyph, 'failed', 'Nothing was made', (st.result && st.result.said) || 'Setup stopped before anything was made.'));
      view.appendChild(F.facts([{ key: 'complete', text: 'Your answers are kept. Back to review, then try again when the network is back.' }, { key: 'info', text: 'No folder, history, online copy or backup was made, so there is nothing to clean up.' }]));
      actsList = [{ label: 'Close', run: () => dlg.close('later') }, { spacer: true },
        { label: 'Back to review', primary: true, run: () => { st.phase = 'steps'; st.last = null; st.demoFail = false; st.footSig = ''; st.s.go('review'); paintNW(st); } }];
    }
    stage.appendChild(view);
    const sig = ph + JSON.stringify(actsList.map((x) => x.label || '|'));
    if (sig !== st.footSig) {
      st.footSig = sig;
      dlg.setActions(actsList);
      const h2 = view.querySelector('.pjx-q-title');
      if (h2) h2.focus({ preventScroll: true });
    }
    if (ph !== st.lastOut) { st.lastOut = ph; dlg.body.scrollTop = 0; }
  }

  /* ------------------------------------------------------------------ render, mount, unmount */
  function render() {
    if (!A.root || !A.root.isConnected) return;
    // a look change redraws the New Project window's step too (its marks and glyphs are the look's own)
    const nw = NW.cur, lk = PJX.look();
    if (nw && nw.dlg && nw.look && nw.look !== lk) { if (nw.phase === 'steps') paintNW(nw); else paintOutcome(nw, true); }
    if (REP.cur && REP.cur.look !== lk) { REP.cur.look = lk; REP.cur.repaint(); }
    if (nw) nw.look = lk;
    paintHead();
    paintSummary();
    paintBody();
    if (A.drawer) paintDrawer();
  }
  let rq = 0;
  function soon() { if (rq) return; rq = requestAnimationFrame(() => { rq = 0; render(); }); }
  /* Escape closes Details. It listens on the window, before the core's own Escape (document, capture), so a dialog the
     core still lists but no longer shows can't swallow it; a dialog or a menu that is showing closes first */
  function onKey(e) {
    if (e.key !== 'Escape' || e.defaultPrevented || !A.root || !A.drawer) return;
    if (D.querySelector('.pjx-dlg-back:not([data-leaving]), .pmr-menu.is-open')) return;
    if (e.target && e.target.closest && e.target.closest('.pmr-menu, [role="menu"]')) return;
    e.preventDefault(); e.stopPropagation(); closeDrawer();
  }

  PJX.concept('a', {
    title: 'A · Polish',
    mount(root) {
      A.root = root; A.view = 'all'; A.sort = 'recent'; A.q = ''; A.searchOpen = false; A.cards = new Map(); A.animate = true; A.drawer = null; A.look = '';
      A.density = ''; A.densityPicked = false; A.gen++;
      root.innerHTML = '';
      const shell = h('div.pmu-shell.pmu-hosted.pjx-a-shell');
      A.shell = shell;
      const E = A.els = {};
      shell.appendChild(buildHead());
      E.scroll = h('div.pmu-scroll.pjx-a-scroll');
      E.notes = h('div.pjx-a-notes', { hidden: true });
      E.grid = h('section.pjx-a-grid', { 'aria-label': 'Projects' });
      E.empty = h('div.pjx-a-empty', { role: 'status', hidden: true });
      E.welcome = h('section.pjx-a-welcome', { 'aria-label': 'Start your first project', 'data-lg-surface': 'panel', hidden: true });
      E.scroll.append(E.notes, E.grid, E.empty, E.welcome);
      shell.appendChild(E.scroll);
      E.scrim = h('div.pjx-a-scrim', { hidden: true });
      E.scrim.addEventListener('mousedown', () => closeDrawer());
      E.drawer = h('aside.pmu-inspector.pjx-a-drawer', { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'pjxa-dh-title', 'aria-hidden': 'true', inert: true });
      E.drawer.addEventListener('keydown', drawerKeys);
      shell.append(E.scrim, E.drawer);
      root.appendChild(shell);
      A.offs.push(PJX.on('op', soon));
      A.offs.push(PJX.on('pjx-show', (e) => { closeDrawer(true); setView((e && e.view) || 'all'); }));
      W.addEventListener('keydown', onKey, true);
      if (W.ResizeObserver) { A.ro = new ResizeObserver(() => { fitSummary(); if (A.drawer) placeDrawer(); placeNotices(); }); A.ro.observe(root); }
      const rs = D.getElementById('rsStage');
      if (rs && W.MutationObserver) { A.rsObs = new MutationObserver(placeNotices); A.rsObs.observe(rs, { childList: true }); }
      render();
    },
    unmount() {
      A.offs.forEach((f) => { try { f(); } catch (e) { /* gone */ } }); A.offs = [];
      W.removeEventListener('keydown', onKey, true);
      if (A.ro) { A.ro.disconnect(); A.ro = null; }
      if (A.rsObs) { A.rsObs.disconnect(); A.rsObs = null; }
      const rs = D.getElementById('rsStage'); if (rs) { rs.style.removeProperty('--pjx-a-rs-x'); rs.style.removeProperty('--pjx-a-rs-y'); }
      if (REP.cur && REP.cur.dlg) REP.cur.dlg.close('switch');
      REP.cur = null;
      A.timers.forEach(clearTimeout); A.timers = []; clearTimeout(A.undoTimer);
      if (rq) { cancelAnimationFrame(rq); rq = 0; }
      if (NW.cur && NW.cur.dlg) NW.cur.dlg.close('switch');
      NW.cur = null; A.creating = null; A.gen++;
      A.cards.clear(); A.drawer = null; A.root = null; A.shell = null; A.els = {};
    },
    render() { render(); },
    openNew(opts) { openNew(opts || {}); },
    openProject(id) { const p = PJX.get(id); if (!p) return; if (p.lifecycle === 'archived' && A.view !== 'archived') setView('archived'); const c = A.cards.get(id); openDrawer(id, c ? c.el.querySelector('[data-k="details"]') : null); },
    openRepair(id) { openRepair(id, false); },
    /* the shared dialogs are replaced by this page's own windows for the two flows Jared named (core: onRepair/onResume) */
    onRepair(e) { return !!(e && openRepair(e.id, e.move)); },
    onResume(e) { return !!(e && openResume(e.id)); }
  });
})(window);
