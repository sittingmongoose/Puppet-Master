/* 48-work.js: agents and processes across Puppet Master (W6; DL-240 to DL-253, F3-664, F3-665, DR-078). OWNER:
 * pm7-activity (PM7 build, 2026-10-29).
 *
 * Jared, 2026-10-26: "a pop out panel for Puppet Master as a whole that shows all the agents/subagents running on the
 * entire platform (including planning wizard, prd builder, scout, orchestrator, assistant chat, and everything else).
 * Same for processes/scripts/background tasks. That can be located in the bottom status bar."
 *
 * Everything here reads the one work projection, window.PM_WORK (found's head module, DR-078: one projection, no list,
 * count or status of its own) and draws through the one glyph registry (window.PMG, DR-051) and the Pip kit
 * (window.PMLogo, DR-076). It owns:
 *   1. the status bar's two items (D5): the group's markup is installStatusBar's (pm7-t23-shell-adjustments.js); this
 *      paints them. Numbers by default, Words with general.interaction.status-bar-words (html[data-pm-status-words],
 *      kit.d/47-status-words.js). Their glyphs are the category marks (X1: robot and processes) and move on the 2200 ms
 *      beat while anything runs (.pmg-beat, found's pm7-beat.css). No CPU or RAM item (G4).
 *   2. the panel, in the one overlay root (#pmw-overlay, DR-067): Agents (Questions first), Processes (Needs input
 *      first, each under the agent that started it), Resources (G4, G8: every server and environment of the Project,
 *      sampled only while the tab is open, D12). Pop out, Stop per item, Stop all (D8), Clear finished (G6: view-local).
 *   3. the detail block every surface shows for one item, the chat's Processes view included (PM7_WORK_UI.detail), and
 *      the one delegated handler for its actions ([data-work-act]).
 *   4. the Stop list (D8: what will stop, each unticked item kept) and the quit dialog (D10: keep running is the
 *      default; the other choice stops everything from a list you can untick), both in the overlay root.
 *   5. the "Notify me" notices (D9) through the one notification owner (19-notify.js).
 * Loops: none of its own. It repaints on PM_WORK's change events, whose 1 s tick the core pauses while hidden and during
 * drags; the Resources sampler runs only while that tab is on screen. */
(function () {
  'use strict';
  const O55 = window.O55 || {};
  const doc = document;
  const T = (k, v) => (typeof O55.t === 'function' ? O55.t('work.' + k, v) : k);
  const W = () => window.PM_WORK || null;
  const VIEW = 'platform';
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
  const clock = (t) => { const d = new Date(t); return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); };
  const short = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); if (s < 60) return s + 's'; const m = Math.floor(s / 60); return m < 60 ? m + 'm' : Math.floor(m / 60) + 'h ' + (m % 60) + 'm'; };
  const mb = (v) => (v == null ? T('res.na') : v >= 1000 ? (v / 1000).toFixed(1) + ' GB' : Math.round(v) + ' MB');
  const pct = (v) => (v == null ? T('res.na') : Math.round(v) + '%');

  /* ------------------------------------------------------------------------------------------------- glyphs */
  function st(key, size) {
    const G = window.PMG; if (!G || !G.status) return '';
    const k = G.hasStatus && G.hasStatus(key) ? key : 'idle';
    return G.status(k, size || 12, 'nx-still');
  }
  function icon(name, size, cls) {
    const G = window.PMG; if (!G || !G.icon) return '';
    return G.icon(G.has && G.has(name) ? name : 'terminal', size || 12, cls || '');
  }
  /* the category marks (X1): the lit robot for agents, the console for processes, the gauge for resources; a mark that
     stands for live work wears .pmg-beat (rows never do) */
  const CAT = { agents: 'robot', processes: 'processes', resources: 'gauge' };
  function cat(kind, size, live) {
    return '<span class="wk-g' + (live ? ' pmg-beat' : '') + '" data-tone="' + (live ? 'working' : 'idle') + '" aria-hidden="true">' +
      icon(CAT[kind], size, 'nx-r-concept nx-lit') + '</span>';
  }
  /* each individual agent is Pip (X1), its face the agent's state (A5's table, PMLogo.STATUS_FACE) */
  function agentMark(it, size) {
    const L = window.PMLogo;
    if (L && typeof L.mark === 'function') {
      const face = (L.STATUS_FACE && L.STATUS_FACE[it.state]) || 'idle';
      try { return '<span class="wk-pip" aria-hidden="true">' + L.mark({ px: size || 14, mood: face, decorative: true }) + '</span>'; } catch (_) { /* fall back */ }
    }
    return icon('robot', size || 12);
  }
  const ROLE_ICON = { server: 'server', db: 'database', script: 'terminal', test: 'terminal', watcher: 'clock', build: 'hammer', browser: 'browser', lsp: 'server', mcp: 'plug', index: 'layers' };
  function kindMark(it) {
    if (it.kind === 'agent') return agentMark(it, 14);
    return icon(ROLE_ICON[it.role] || (it.kind === 'scheduled' ? 'clock' : 'terminal'), 11);
  }
  const SURFACE_ICON = { assistant: 'robot', orchestrator: 'pipeline', wizard: 'route', prd: 'page', scout: 'telescope', system: 'server' };
  const SURFACES = ['assistant', 'orchestrator', 'wizard', 'prd', 'scout', 'system'];
  const surfaceName = (s) => T('surface.' + s);
  const PAGE_OF = { orchestrator: 'orchestrator', wizard: 'wizard' };

  /* ------------------------------------------------------------------------------------------- the data */
  const items = (filter) => { const w = W(); return w ? w.items(Object.assign({ view: VIEW }, filter || {})) : []; };
  const counts = () => { const w = W(); return w ? w.counts() : { agents: 0, questions: 0, processes: 0, needsInput: 0, scheduled: 0 }; };
  const word = (it) => (W() ? W().word(it) : it.state);
  const tone = (it) => (W() ? W().tone(it) : 'idle');
  const time = (it) => (W() ? W().time(it) : '');
  const sort = (l) => (W() ? W().sort(l) : l);
  const isLive = (it) => !!(W() && W().isLive(it));
  const isDone = (it) => !!(W() && W().isDone(it));
  const needsYou = (it) => !!(W() && W().needsYou(it));
  const byId = (id) => (W() ? W().item(id) : null);
  function project() {
    const sel = doc.querySelector('.pm6-tb-menu-item.is-selected[data-project]') || doc.querySelector('[data-project].is-selected');
    return (sel && sel.getAttribute('data-project')) || 'tastebook';
  }
  /* the agent a process belongs to: its owner's top agent, else the thread's own agent */
  function topOf(x) {
    let o = x.owner ? byId(x.owner) : null;
    while (o && o.parent && byId(o.parent)) o = byId(o.parent);
    if (o) return o;
    if (x.thread) return items({ thread: x.thread, kind: 'agent' }).filter((a) => a.role === 'main')[0] || null;
    return null;
  }
  const ownerName = (it) => { if (!it.owner) return it.surface === 'assistant' ? T('detail.thisThread') : ''; const o = byId(it.owner); return o ? o.title : it.owner; };
  const liveProcs = () => items({ kind: 'process' }).filter(isLive);
  const procsOf = (a) => liveProcs().filter((x) => { const t = topOf(x); return t && t.id === a.id; });

  /* -------------------------------------------------------------------------------------- the status bar */
  const bar = () => doc.getElementById('pm7GlobalStatusBar');
  const group = () => { const b = bar(); return b && b.querySelector('[data-work-group]'); };
  const words = () => doc.documentElement.getAttribute('data-pm-status-words') === 'on';
  function bySurface(list) {
    const by = {};
    list.forEach((x) => { const n = surfaceName(x.surface); by[n] = (by[n] || 0) + 1; });
    return Object.keys(by).map((k) => k + ' ' + by[k]).join(', ');
  }
  function paintItem(b, kind, n, ask, c) {
    if (!b) return;
    const A = kind === 'agents', live = n > 0;
    let h = cat(kind, 13, live);
    const askMark = ask ? '<span class="wk-sb-ask">' + st('waiting', 10) : '';
    if (!n && !ask) h += '<span class="wk-dim">' + T(A ? 'bar.noAgents' : 'bar.noProcesses') + '</span>';
    else if (!words()) h += '<strong>' + n + '</strong>' + (ask ? askMark + '<strong>' + ask + '</strong></span>' : '');
    else h += '<span><strong>' + n + '</strong> ' + T(A ? (n === 1 ? 'bar.agent' : 'bar.agents') : (n === 1 ? 'bar.process' : 'bar.processes')) + '</span>' +
      (ask ? askMark + '<span><strong>' + ask + '</strong> ' + T(A ? (ask === 1 ? 'bar.question' : 'bar.questions') : (ask === 1 ? 'bar.needsInputOne' : 'bar.needsInputMany')) + '</span></span>' : '');
    if (b.__wkHtml !== h) { b.innerHTML = h; b.__wkHtml = h; }
    b.setAttribute('data-tone', live ? 'working' : 'idle');
    b.setAttribute('data-ask', ask ? 'true' : 'false');
    const on = ui.open && ui.tab === kind;
    b.setAttribute('aria-expanded', on ? 'true' : 'false');
    b.classList.toggle('is-open', on);
    const list = A ? items({ kind: 'agent' }).filter(isLive) : liveProcs();
    const askWords = A ? plural(ask, T('bar.question'), T('bar.questions')) : ask + ' ' + T(ask === 1 ? 'bar.needsInputOne' : 'bar.needsInputMany');
    b.setAttribute('data-pm-hover-label', T(A ? 'bar.agentsLabel' : 'bar.processesLabel'));
    b.setAttribute('data-pm-hover-detail', (n ? T(A ? 'bar.agentsRunning' : 'bar.processesRunning', { n: plural(n, T(A ? 'bar.agent' : 'bar.process'), T(A ? 'bar.agents' : 'bar.processes')), where: bySurface(list) })
      : T(A ? 'bar.noneAgents' : 'bar.noneProcesses')) + (ask ? ' ' + T(A ? 'bar.asksAgents' : 'bar.asksProcesses', { n: askWords }) : '') +
      (!A && c.scheduled ? ' ' + T('bar.scheduled', { n: c.scheduled }) : '') + ' ' + T('bar.click'));
    b.setAttribute('aria-label', T(A ? 'bar.ariaAgents' : 'bar.ariaProcesses', { n: n, ask: ask ? ', ' + askWords : '' }));
  }
  function paintBar() {
    const g = group(), w = W();
    if (!g) return;
    if (!w) { g.hidden = true; return; }
    g.hidden = false;
    const c = counts(), feed = w.feed ? w.feed() : { state: 'current' };
    paintItem(g.querySelector('[data-status-action="agents"]'), 'agents', c.agents, c.questions, c);
    paintItem(g.querySelector('[data-status-action="processes"]'), 'processes', c.processes, c.needsInput, c);
    const stale = g.querySelector('[data-work-stale]');
    if (stale) {
      const on = feed.state === 'stale';
      stale.hidden = !on;
      if (on) {
        const h = st('offline', 10) + '<span class="wk-dim">' + T('bar.stale') + '</span>';
        if (stale.__wkHtml !== h) { stale.innerHTML = h; stale.__wkHtml = h; }
        stale.setAttribute('data-pm-hover-label', T('bar.staleLabel'));
        stale.setAttribute('data-pm-hover-detail', T('bar.staleDetail', { ago: short(Date.now() - (feed.at || Date.now())) }));
      }
    }
  }

  /* ------------------------------------------------------------------------------------------ the panel */
  const ui = { open: false, tab: 'agents', floating: false, fx: null, fy: null, expanded: {}, subOpen: {}, collapsed: { system: true }, jump: null,
    sort: ['cpu', -1], selected: null, sampleStop: null, snap: null, back: null };
  let pop = null;
  function root() { try { if (window.PMW && typeof window.PMW.overlay === 'function') return window.PMW.overlay(); } catch (_) { /* no Home */ } return doc.body; }
  function ensure() {
    if (pop && pop.isConnected) return pop;
    pop = doc.createElement('section');
    pop.id = 'pm7-work';
    pop.className = 'wk-pop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-modal', 'false');
    pop.setAttribute('aria-labelledby', 'pm7-work-title');
    pop.hidden = true;
    root().appendChild(pop);
    pop.addEventListener('click', onPanelClick);
    pop.addEventListener('keydown', onPanelKey);
    pop.addEventListener('pointerdown', onPanelDrag);
    return pop;
  }

  /* one row: the state mark, the kind (Pip for an agent), what it is and what it is doing, its word and its time */
  function row(it, depth, o) {
    o = o || {};
    const t = tone(it), open = !!ui.expanded[it.id];
    const sub = needsYou(it) && it.ask ? '<b class="wk-askline">' + esc(it.ask) + '</b>' :
      esc(it.lost ? it.lost : (it.kind === 'agent' ? (it.detail || '') : (it.kind === 'scheduled' ? it.detail : it.command))) +
      (it.ports && it.ports.length && isLive(it) ? ' · <span class="wk-mono">:' + it.ports.join(', :') + '</span>' : '') +
      (it.progress && isLive(it) ? ' · ' + T('detail.progressOf', { done: it.progress.done, total: it.progress.total, unit: esc(it.progress.unit) }) : '');
    const meta = [];
    if (o.where) meta.push(esc(surfaceName(it.surface)) + (it.where && it.where !== it.title ? ' · ' + esc(it.where) : ''));
    if (it.model && it.kind === 'agent') meta.push(esc(it.model));
    if (it.owner && o.owner !== false) meta.push(esc(ownerName(it)));
    return '<div class="wk-row' + (open ? ' is-open' : '') + '" style="--d:' + (depth || 0) + '" data-kind="' + esc(it.kind) + '" data-work-row="' + esc(it.id) + '">' +
      '<button type="button" class="wk-row-btn" data-work-x="' + esc(it.id) + '" aria-expanded="' + open + '">' +
      '<span class="wk-lead">' + st(W().key(it), 12) + '</span>' +
      '<span class="wk-kind">' + kindMark(it) + '</span>' +
      '<span class="wk-copy"><strong>' + esc(it.title) + '</strong><span class="wk-sub">' + sub + '</span>' + (meta.length ? '<span class="wk-meta">' + meta.join(' · ') + '</span>' : '') + '</span>' +
      '<span class="wk-right"><b data-tone="' + t + '">' + esc(word(it)) + '</b><i data-work-time="' + esc(it.id) + '">' + esc(time(it)) + '</i></span></button>' +
      (open ? detail(it, { where: true }) : '') + '</div>';
  }
  function sec(key, title, list, o) {
    if (!list.length) return '';
    o = o || {};
    return '<section class="wk-group wk-fixed" data-sec="' + key + '"' + (o.tone ? ' data-tone="' + o.tone + '"' : '') + '><div class="wk-shead">' +
      (o.tone === 'attention' ? st('waiting', 11) : '') + '<strong>' + esc(title) + '</strong><span class="wk-gsum">' + esc(o.sum || String(list.length)) + '</span>' +
      (o.clear ? '<button type="button" class="wk-link" data-work-p="clear">' + T('act.clear') + '</button>' : '') + '</div>' +
      list.map((x) => row(x, 0, o.row || { where: true })).join('') + '</section>';
  }
  function ghead(id, ico, title, sumHtml, gotoKey, col) {
    return '<div class="wk-ghead-row"><button type="button" class="wk-ghead" data-work-g="' + esc(id) + '" aria-expanded="' + !col + '">' +
      icon(col ? 'arrow-right' : 'chevron-down', 10) + icon(ico, 13) + '<strong>' + esc(title) + '</strong><span class="wk-gsum">' + sumHtml + '</span></button>' +
      (gotoKey ? '<button type="button" class="wk-link wk-gopen" data-work-goto="' + esc(gotoKey) + '">' + T(gotoKey === 'system' ? 'sec.systemStatus' : 'sec.open') + '</button>' : '') + '</div>';
  }
  function agentsBody() {
    const all = items();
    let h = sec('questions', T('sec.questions'), sort(all.filter((x) => W().isQuestion(x))), { tone: 'attention', sum: T('sec.questionsSum') });
    SURFACES.forEach((key) => {
      if (key === 'system') return;
      const mine = all.filter((x) => x.surface === key && x.kind === 'agent' && !isDone(x));
      if (!mine.length) return;
      /* an agent with a question is listed once, under Questions; its surface counts it */
      const tops = sort(mine.filter((x) => (x.role === 'main' || !x.parent || !byId(x.parent)) && !W().isQuestion(x)));
      const live = mine.filter(isLive).length, q = mine.filter((x) => W().isQuestion(x)).length, col = !!ui.collapsed['a:' + key];
      h += '<section class="wk-group" data-surface="' + key + '">' + ghead('a:' + key, SURFACE_ICON[key], surfaceName(key),
        T('agentsRunning', { n: plural(live, T('bar.agent'), T('bar.agents')) }) + (q ? ' · <b data-tone="attention">' + T('questionsAbove', { n: plural(q, T('bar.question'), T('bar.questions')) }) + '</b>' : ''), PAGE_OF[key] ? key : null, col);
      if (!col) tops.forEach((a) => {
        h += row(a, 0, { owner: false });
        const subs = sort(all.filter((x) => x.parent === a.id && !isDone(x))), np = procsOf(a).length;
        if (!subs.length && !np) return;
        const open = !!ui.subOpen[a.id];
        h += '<div class="wk-alinks">';
        if (subs.length) {
          const by = {};
          subs.forEach((s) => { const w = word(s).toLowerCase(); by[w] = (by[w] || 0) + 1; });
          const what = Object.keys(by).map((k) => by[k] + ' ' + k).join(', ');
          h += '<button type="button" class="wk-subs" data-work-subs="' + esc(a.id) + '" aria-expanded="' + open + '">' + icon(open ? 'chevron-down' : 'arrow-right', 10) +
            '<span>' + (subs.length === 1 ? T('subagent', { what: what }) : T('subagents', { n: subs.length, what: what })) + '</span></button>';
        }
        if (np) h += '<button type="button" class="wk-plink" data-work-procs="' + esc(a.id) + '" title="' + esc(T('processesOfTitle', { name: a.title })) + '">' +
          cat('processes', 11, false) + (np === 1 ? T('processOf') : T('processesOf', { n: np })) + '</button>';
        h += '</div>';
        if (open) subs.forEach((s) => { h += row(s, 1, { owner: false }); });
      });
      h += '</section>';
    });
    h += sec('finished', T('sec.finished'), sort(all.filter((x) => x.kind === 'agent' && isDone(x))), { clear: true });
    return h || '<div class="wk-empty">' + T('emptyAgents') + '</div>';
  }
  function procsBody() {
    const all = items();
    let h = sec('input', T('sec.input'), sort(all.filter((x) => W().needsInput(x))), { tone: 'attention', sum: T('sec.inputSum') });
    const groups = [], gi = {};
    sort(all.filter((x) => x.kind === 'process' && isLive(x) && !needsYou(x))).forEach((x) => {
      const t = topOf(x), k = t ? t.id : 'other:' + x.surface;
      if (!gi[k]) { gi[k] = { id: k, top: t, surface: x.surface, list: [] }; groups.push(gi[k]); }
      gi[k].list.push(x);
    });
    groups.sort((a, b) => SURFACES.indexOf(a.surface) - SURFACES.indexOf(b.surface));
    groups.forEach((g) => {
      const col = !!ui.collapsed['p:' + g.id], title = g.top ? (g.top.where || g.top.title) : surfaceName(g.surface);
      h += '<section class="wk-group" data-owner-group="' + esc(g.id) + '"' + (ui.jump === g.id ? ' data-jump="1"' : '') + '>' +
        ghead('p:' + g.id, SURFACE_ICON[g.surface], title, esc(surfaceName(g.surface)) + ' · ' + plural(g.list.length, T('bar.process'), T('bar.processes')), PAGE_OF[g.surface] ? g.surface : null, col);
      if (!col) g.list.forEach((x) => { h += row(x, 0, {}); });
      h += '</section>';
    });
    h += sec('scheduled', T('sec.scheduled'), sort(all.filter((x) => x.kind === 'scheduled' && x.state === 'pending' && !x.stopping)));
    h += sec('finished', T('sec.finished'), sort(all.filter((x) => (x.kind === 'process' || x.kind === 'scheduled') && isDone(x))), { clear: true });
    const svc = sort(all.filter((x) => x.kind === 'service'));
    if (svc.length) {
      const col = !!ui.collapsed.system;
      h += '<section class="wk-group" data-surface="system">' + ghead('system', 'server', T('sec.services'), T('sec.servicesSum', { n: plural(svc.filter(isLive).length, T('bar.service'), T('bar.services')) }), 'system', col);
      if (!col) { svc.forEach((x) => { h += row(x, 0, {}); }); h += '<p class="wk-note wk-dim">' + T('sec.servicesNote') + '</p>'; }
      h += '</section>';
    }
    return h || '<div class="wk-empty">' + T('emptyProcesses') + '</div>';
  }

  /* Resources (G4): every server and environment of the Project, what runs on each, CPU, memory and ports, read from
     the sampler only while this tab is on screen (D12). A sortable table per environment and an inspector. */
  const COLS = [['title', 'name'], ['rank', 'state'], ['cpu', 'cpu'], ['mem', 'mem'], ['ports', 'port'], ['where', 'where']];
  function liveVal(it, k) { return isLive(it) ? (it[k] == null ? null : it[k]) : null; }
  function resBody() {
    const w = W(); if (!w) return '';
    const servers = w.servers ? w.servers(project()) : [];
    const all = items({ project: project() }).filter((x) => x.kind === 'process' || x.kind === 'service');
    if (!servers.length || !all.length) return '<div class="wk-empty">' + T('res.empty') + '</div>';
    const [k, dir] = ui.sort;
    const cmp = (a, b) => {
      if (k === 'cpu' || k === 'mem') { const va = liveVal(a, k), vb = liveVal(b, k); return dir * ((va == null ? -1 : va) - (vb == null ? -1 : vb)); }
      if (k === 'rank') return dir * (w.rank(a) - w.rank(b));
      if (k === 'ports') return dir * (((a.ports || [])[0] || 99999) - ((b.ports || [])[0] || 99999));
      const sa = String(k === 'where' ? ownerName(a) : a.title).toLowerCase(), sb = String(k === 'where' ? ownerName(b) : b.title).toLowerCase();
      return dir * (sa < sb ? -1 : sa > sb ? 1 : 0);
    };
    const head = '<div class="wk-tr wk-th" role="row">' + COLS.map((c) => '<button type="button" role="columnheader" data-work-sort="' + c[0] + '" aria-sort="' +
      (k === c[0] ? (dir > 0 ? 'ascending' : 'descending') : 'none') + '">' + T('res.cols.' + c[1]) + (k === c[0] ? icon(dir > 0 ? 'arrow-up' : 'arrow-down', 9) : '') + '</button>').join('') + '</div>';
    let h = '<div class="wk-res" role="table" aria-label="' + esc(T('res.label')) + '">', any = null;
    servers.forEach((sv) => {
      const mine = all.filter((x) => x.server === sv.id);
      const cpu = mine.reduce((s, x) => s + (liveVal(x, 'cpu') || 0), 0), mem = mine.reduce((s, x) => s + (liveVal(x, 'mem') || 0), 0);
      const col = !!ui.collapsed['s:' + sv.id];
      h += '<section class="wk-group wk-server" data-server="' + esc(sv.id) + '">' + ghead('s:' + sv.id, sv.kind === 'container' ? 'layers' : 'server', sv.name,
        esc(T('res.kind.' + sv.kind)) + ' · <span class="wk-mono">' + esc(sv.host || '') + '</span> · <span data-work-total="' + esc(sv.id) + '">' + T('res.totals', { cpu: pct(cpu), mem: mb(mem) }) + '</span>', null, col);
      if (!col) (sv.environments || []).forEach((env) => {
        const list = mine.filter((x) => x.environment === env.id).sort(cmp);
        h += '<div class="wk-env" role="rowgroup" aria-label="' + esc(sv.name + ' · ' + env.name) + '"><div class="wk-env-head">' + esc(env.name) + '<span class="wk-gsum">' +
          (list.length ? plural(list.filter(isLive).length, T('bar.process'), T('bar.processes')) : T('res.envEmpty')) + '</span></div>';
        if (list.length) h += head + list.map((x) => {
          if (!any) any = x;
          const sel = ui.selected === x.id;
          return '<button type="button" class="wk-tr' + (sel ? ' is-sel' : '') + '" role="row" data-work-sel="' + esc(x.id) + '" aria-selected="' + sel + '">' +
            '<span role="cell" class="wk-c-name">' + st(W().key(x), 11) + '<b>' + esc(x.title) + '</b></span>' +
            '<span role="cell"><b data-tone="' + tone(x) + '">' + esc(word(x)) + '</b></span>' +
            '<span role="cell" class="wk-num" data-work-cpu="' + esc(x.id) + '">' + pct(liveVal(x, 'cpu')) + '</span>' +
            '<span role="cell" class="wk-num" data-work-mem="' + esc(x.id) + '">' + mb(liveVal(x, 'mem')) + '</span>' +
            '<span role="cell" class="wk-num">' + (x.ports && x.ports.length ? x.ports.join(', ') : '') + '</span>' +
            '<span role="cell" class="wk-c-where">' + esc(x.kind === 'service' ? surfaceName('system') : ownerName(x) || x.where || '') + '</span></button>';
        }).join('');
        h += '</div>';
      });
      h += '</section>';
    });
    h += '</div>';
    const sel = (ui.selected && byId(ui.selected)) || any;
    if (sel) { ui.selected = sel.id; h += '<section class="wk-inspector" aria-label="' + esc(sel.title) + '"><div class="wk-ihead">' + st(sel.state, 12) + '<strong>' + esc(sel.title) + '</strong><b data-tone="' + tone(sel) + '">' + esc(word(sel)) + '</b></div>' + detail(sel, { where: true, server: true }) + '</section>'; }
    return h;
  }

  /* the tab heads: each says what it holds and how many wait on you; Agents and Processes beat while anything runs */
  function headLabel(kind, c) {
    const n = kind === 'agents' ? c.agents : kind === 'processes' ? c.processes : null;
    const ask = kind === 'agents' ? c.questions : kind === 'processes' ? c.needsInput : 0;
    return cat(kind, 13, !!n) + '<span>' + T('tabs.' + kind) + '</span>' + (n != null ? '<span class="wk-n">' + n + '</span>' : '') +
      (ask ? '<span class="wk-ask-n" data-tone="attention">' + st('waiting', 10) + (kind === 'agents' ? plural(ask, T('bar.question'), T('bar.questions')) : ask + ' ' + T(ask === 1 ? 'bar.needsInputOne' : 'bar.needsInputMany')) + '</span>' : '');
  }
  function render(keep) {
    const p = ensure(), w = W(); if (!w) return;
    const sc = p.querySelector('.wk-body'), top = sc ? sc.scrollTop : 0;
    const focused = doc.activeElement && p.contains(doc.activeElement) ? focusKey(doc.activeElement) : null;
    const c = counts(), feed = w.feed ? w.feed() : { state: 'current' };
    p.setAttribute('data-tab', ui.tab);
    p.classList.toggle('is-floating', ui.floating);
    const tabs = ['agents', 'processes', 'resources'];
    const strips = (feed.restarted ? '<div class="wk-strip" data-tone="attention">' + st('warning', 12) + '<span>' + T('strip.restarted', { ago: short(Date.now() - (feed.restarted.at || Date.now())), n: feed.restarted.lost || 0 }) + '</span></div>' : '') +
      (feed.state === 'stale' ? '<div class="wk-strip" data-tone="attention">' + st('offline', 12) + '<span>' + T('strip.stale', { ago: short(Date.now() - (feed.at || Date.now())) }) + '</span></div>' : '');
    const body = ui.tab === 'processes' ? procsBody() : ui.tab === 'resources' ? resBody() : agentsBody();
    p.innerHTML = '<header class="wk-head" data-work-drag="1"><strong id="pm7-work-title">' + T('panelTitle') + '</strong>' +
      (c.scheduled ? '<span class="wk-head-sum">' + T('scheduledSum', { n: c.scheduled }) + '</span>' : '') + '<span class="wk-grow"></span>' +
      '<button type="button" class="wk-ib" data-work-p="float" aria-pressed="' + ui.floating + '" aria-label="' + esc(T(ui.floating ? 'dockBack' : 'popOut')) + '" data-pm-hover-label="' + esc(T(ui.floating ? 'dockBack' : 'popOut')) + '">' + icon(ui.floating ? 'arrow-down' : 'open', 13) + '</button>' +
      '<button type="button" class="wk-ib" data-work-p="close" aria-label="' + esc(T('close')) + '" data-pm-hover-label="' + esc(T('close')) + '">' + icon('close', 13) + '</button></header>' +
      strips +
      '<div class="wk-tabs" role="tablist" aria-label="' + esc(T('panelLabel')) + '">' + tabs.map((k) => '<button type="button" role="tab" id="pm7-work-tab-' + k + '" data-work-tab="' + k + '" aria-selected="' + (ui.tab === k) + '" tabindex="' + (ui.tab === k ? '0' : '-1') + '" aria-controls="pm7-work-body">' + headLabel(k, c) + '</button>').join('') + '</div>' +
      '<div class="wk-body" id="pm7-work-body" role="tabpanel" aria-labelledby="pm7-work-tab-' + ui.tab + '" tabindex="-1">' + body + '</div>' +
      '<footer class="wk-foot">' + (ui.tab !== 'resources' ? '<button type="button" class="wk-link" data-work-p="clear">' + T('clearFinished') + '</button>' : '<span class="wk-dim wk-res-note">' + T(ui.snap ? 'res.sampled' : 'res.notSampled') + '</span>') +
      '<span class="wk-grow"></span><button type="button" class="wk-btn danger" data-work-p="stopall"' + (c.agents + c.processes + c.scheduled ? '' : ' disabled') + '>' + T('stopAll') + '</button></footer>';
    if (keep) { const s2 = p.querySelector('.wk-body'); if (s2) s2.scrollTop = top; }
    if (focused) { const f = p.querySelector(focused); if (f) f.focus({ preventScroll: true }); }
    const j = ui.jump && p.querySelector('[data-jump="1"]');
    if (j) { j.scrollIntoView({ block: 'nearest' }); setTimeout(() => { ui.jump = null; const g = p.querySelector('[data-jump="1"]'); if (g) g.removeAttribute('data-jump'); }, 1600); }
    sampling();
  }
  /* focus survives a repaint: the same control by its data key */
  function focusKey(el) {
    const keys = ['data-work-tab', 'data-work-x', 'data-work-p', 'data-work-g', 'data-work-sel', 'data-work-sort', 'data-work-act', 'data-work-subs', 'data-work-procs'];
    for (const k of keys) {
      const v = el.getAttribute && el.getAttribute(k);
      if (v == null) continue;
      const d = k === 'data-work-act' && el.closest('[data-work-detail]');
      return (d ? '[data-work-detail="' + CSS.escape(d.getAttribute('data-work-detail')) + '"] ' : '') + '[' + k + '="' + CSS.escape(v) + '"]';
    }
    return null;
  }
  /* D12: CPU and memory only while the Resources tab is on screen */
  function sampling() {
    const want = ui.open && ui.tab === 'resources' && W() && typeof W().sample === 'function';
    if (want && !ui.sampleStop) ui.sampleStop = W().sample((snap) => { ui.snap = snap; refreshResources(); }, { project: project() });
    if (!want && ui.sampleStop) { try { ui.sampleStop(); } catch (_) { /* stopped */ } ui.sampleStop = null; ui.snap = null; }
  }
  function refreshResources() {
    if (!pop || !ui.open || ui.tab !== 'resources') return;
    pop.querySelectorAll('[data-work-cpu]').forEach((el) => { const it = byId(el.getAttribute('data-work-cpu')); if (it) el.textContent = pct(liveVal(it, 'cpu')); });
    pop.querySelectorAll('[data-work-mem]').forEach((el) => { const it = byId(el.getAttribute('data-work-mem')); if (it) el.textContent = mb(liveVal(it, 'mem')); });
    pop.querySelectorAll('[data-work-total]').forEach((el) => {
      const id = el.getAttribute('data-work-total'), mine = items({ project: project() }).filter((x) => x.server === id && (x.kind === 'process' || x.kind === 'service'));
      el.textContent = T('res.totals', { cpu: pct(mine.reduce((s, x) => s + (liveVal(x, 'cpu') || 0), 0)), mem: mb(mine.reduce((s, x) => s + (liveVal(x, 'mem') || 0), 0)) });
    });
    const note = pop.querySelector('.wk-res-note'); if (note) note.textContent = T('res.sampled');
  }
  function place() {
    const p = ensure();
    if (ui.floating) {
      if (ui.fx == null) { ui.fx = Math.max(8, Math.round(innerWidth / 2 - 320)); ui.fy = 90; }
      p.style.left = ui.fx + 'px'; p.style.top = ui.fy + 'px'; p.style.bottom = 'auto'; p.style.right = 'auto';
      return;
    }
    const b = bar(), br = b ? b.getBoundingClientRect() : { top: innerHeight - 26 };
    const g = group(), anchor = g && (g.querySelector('[data-status-action="' + (ui.tab === 'processes' ? 'processes' : 'agents') + '"]') || g);
    const ir = anchor ? anchor.getBoundingClientRect() : { left: 8 };
    const w = p.offsetWidth || 600;
    p.style.top = 'auto'; p.style.right = 'auto';
    p.style.left = Math.max(8, Math.min(ir.left - 6, innerWidth - w - 8)) + 'px';
    p.style.bottom = Math.round(innerHeight - br.top + 6) + 'px';
  }
  function open(tab) {
    if (!W()) return false;
    if (tab) ui.tab = tab;
    const p = ensure();
    if (!ui.open) ui.back = doc.activeElement;
    ui.open = true; p.hidden = false;
    render(); place(); paintBar();
    requestAnimationFrame(() => { const t = p.querySelector('[data-work-tab][aria-selected="true"]'); if (t && !p.contains(doc.activeElement)) t.focus({ preventScroll: true }); });
    return true;
  }
  function close() {
    if (!ui.open) return;
    ui.open = false; if (pop) pop.hidden = true;
    sampling(); paintBar();
    const g = group(), b = g && g.querySelector('[data-status-action="' + (ui.tab === 'processes' ? 'processes' : 'agents') + '"]');
    const back = ui.back && ui.back.isConnected ? ui.back : b;
    if (back && typeof back.focus === 'function') back.focus({ preventScroll: true });
    ui.back = null;
  }
  function toggle(tab) { if (ui.open && (!tab || ui.tab === tab)) close(); else open(tab); }

  /* ------------------------------------------------------------------------------------ the detail block */
  /* One detail block for one item, shared by the panel and the chat's Processes view (the same facts and actions,
     D3/D13/D9/D8). Its actions are [data-work-act] buttons inside [data-work-detail], handled below for every surface. */
  function detail(it, o) {
    o = o || {};
    const now = Date.now(), f = [];
    if (it.command) f.push([T('detail.command'), '<code>' + esc(it.command) + '</code>']);
    if (it.cwd) f.push([T('detail.folder'), '<code>' + esc(it.cwd) + '</code>']);
    if (it.pid || (it.ports && it.ports.length)) f.push([T('detail.process'), (it.pid ? T('detail.pid', { n: it.pid }) : '') + (it.ports && it.ports.length ? (it.pid ? ' · ' : '') +
      T('detail.port', { list: it.ports.map((p) => '<button type="button" class="wk-link" data-work-act="port" data-port="' + p + '">' + p + '</button>').join(', ') }) : '')]);
    if (o.server && it.server && W() && W().servers) {
      const sv = (W().servers(project()) || []).filter((s) => s.id === it.server)[0], env = sv && (sv.environments || []).filter((e) => e.id === it.environment)[0];
      if (sv) f.push([T('detail.server'), esc(T('detail.serverAt', { server: sv.name, env: env ? env.name : '' }))]);
    }
    if (it.kind === 'scheduled' && it.at) f.push([T('detail.runs'), T('detail.runsAt', { clock: clock(it.at), in: time(it) }) + ' · ' + esc(it.detail || '')]);
    else if (it.startedAt) f.push([T('detail.started'), T('detail.startedBy', { clock: clock(it.startedAt), who: it.owner ? '<button type="button" class="wk-link" data-work-act="owner" data-owner="' + esc(it.owner) + '">' + esc(ownerName(it)) + '</button>' : esc(ownerName(it) || it.where || '') })]);
    if (o.where) f.push([T('detail.where'), esc(it.where || '') + (it.surface ? ' · ' + esc(surfaceName(it.surface)) : '')]);
    if (it.progress && isLive(it)) f.push([T('detail.progress'), T('detail.progressOf', { done: it.progress.done, total: it.progress.total, unit: esc(it.progress.unit) }) + ' <span class="wk-dim">(' + T(it.progress.source === 'measured' ? 'detail.measured' : 'detail.reported') + ')</span>']);
    if (isDone(it)) f.push([T('detail.ended'), (it.exit != null ? T('detail.exit', { n: it.exit }) + ' · ' : (it.state === 'warning' ? T('detail.noExit') + ' · ' : '')) + T('time.ago', { t: short(now - (it.endedAt || now)) }) + (it.stoppedBy ? ' · ' + T('detail.stoppedBy', { who: esc(it.stoppedBy) }) : '')]);
    if (it.kind === 'process' || it.kind === 'scheduled') {
      f.push([T('detail.whenEnds'), '<span class="wk-seg" role="group" aria-label="' + esc(T('detail.whenEnds')) + '">' + [['agent', 'deliveryAgent'], ['user', 'deliveryUser'], ['quiet', 'deliveryQuiet']].map((d) =>
        '<button type="button" data-work-act="delivery" data-value="' + d[0] + '" aria-pressed="' + (it.delivery === d[0]) + '">' + T('detail.' + d[1]) + '</button>').join('') + '</span>']);
      if (it.kind === 'process') f.push([T('detail.reply'), T(it.waits ? 'detail.replyWaits' : 'detail.replyGoesOn')]);
    }
    let h = '<div class="wk-detail" data-work-detail="' + esc(it.id) + '">';
    if (needsYou(it) && it.ask) {
      /* D13: quick answers only for a plain yes/no prompt, the safe one first; anything else goes to the terminal */
      const quick = W().canSendInput ? (W().canSendInput(it) ? it.quick : []) : ((it.quick || []).length === 2 ? it.quick : []);
      h += '<div class="wk-ask"><span class="wk-ask-q">' + st('waiting', 12) + '<b>' + esc(it.ask) + '</b></span><span class="wk-ask-a">' +
        quick.map((q, i) => '<button type="button" class="wk-btn' + (i === 0 ? ' wk-primary' : '') + '" data-work-act="answer" data-value="' + esc(q) + '">' + esc(q) + '</button>').join('') +
        (it.kind === 'agent' ? '<button type="button" class="wk-btn wk-primary" data-work-act="goto">' + T('act.answer') + '</button>' : '<button type="button" class="wk-btn" data-work-act="terminal">' + T('act.answerTerminal') + '</button>') + '</span></div>';
    }
    if (it.lost) h += '<p class="wk-note">' + st('warning', 11) + '<span>' + esc(it.lost) + '</span></p>';
    if (it.detail && it.kind !== 'scheduled' && it.kind !== 'agent') h += '<p class="wk-what">' + esc(it.detail) + '</p>';
    h += '<dl class="wk-facts">' + f.map((x) => '<dt>' + x[0] + '</dt><dd>' + x[1] + '</dd>').join('') + '</dl>';
    if (it.tail && it.tail.length) h += tail(it);
    const acts = [];
    if (it.kind === 'process') acts.push(btn('terminal', T('act.openTerminal')), btn('copy', T('act.copy')));
    if (it.ports && it.ports.length && isLive(it)) acts.push('<button type="button" class="wk-btn" data-work-act="port" data-port="' + it.ports[0] + '">' + T('act.openPort', { port: it.ports[0] }) + '</button>');
    if (it.kind === 'process' && /^(server|db|watcher)$/.test(it.role || '') && !isDone(it) && W().canRestart(it)) acts.push(btn('restart', T('act.restart')));
    if (it.kind === 'process' && isDone(it)) acts.push(btn('rerun', T('act.rerun')));
    if (it.kind === 'agent') acts.push(btn('goto', it.surface === 'assistant' ? T('act.openThread') : T('act.openSurface', { surface: surfaceName(it.surface) })));
    /* services are never stopped here (D11) */
    if (it.kind !== 'service' && (isLive(it) || (it.kind === 'scheduled' && it.state === 'pending'))) acts.push('<button type="button" class="wk-btn danger" data-work-act="stop"' + (it.stopping ? ' disabled' : '') + '>' + T(it.stopping ? 'act.stopping' : (it.kind === 'scheduled' ? 'act.cancel' : 'act.stop')) + '</button>');
    if (acts.length) h += '<div class="wk-actions">' + acts.join('') + '</div>';
    return h + '</div>';
  }
  const btn = (act, label) => '<button type="button" class="wk-btn" data-work-act="' + act + '">' + esc(label) + '</button>';
  function tail(it, rows) {
    rows = rows || 6;
    const lines = it.tail.slice(-rows), earlier = (it.lines || it.tail.length) - lines.length;
    return '<div class="wk-tail" data-work-tail="' + esc(it.id) + '">' + (earlier > 0 ? '<div class="wk-tail-more">' + T('detail.earlier', { n: earlier.toLocaleString() }) + '</div>' : '') +
      '<pre>' + lines.map(esc).join('\n') + '</pre></div>';
  }

  /* --------------------------------------------------------------------------------------------- actions */
  function say(text, quiet) {
    try { if (window.PM_TITLEBAR_NOTIFY && typeof window.PM_TITLEBAR_NOTIFY.push === 'function') { window.PM_TITLEBAR_NOTIFY.push({ title: text, kind: 'ephemeral', important: false, ttlMs: quiet ? 2600 : 4200 }); return; } } catch (_) { /* fall through */ }
    try { if (typeof window.toast === 'function') window.toast(text); } catch (_) { /* nothing */ }
  }
  function goPage(page) { try { if (window.PM_PAGES && typeof window.PM_PAGES.go === 'function') { window.PM_PAGES.go(page); return true; } } catch (_) { /* fall through */ } return false; }
  /* the thread an item belongs to, in the hosted chat (CONTRACT 6.1: the chat's own switchThread through PM56_DEMO) */
  function openThread(it) {
    try {
      if (it.thread && window.PM56_DEMO && typeof window.PM56_DEMO.selectThread === 'function') {
        if (window.PMW && window.PMW.chatCol && window.PMW.chatCol.show) window.PMW.chatCol.show();
        window.PM56_DEMO.selectThread(it.thread); return true;
      }
    } catch (_) { /* fall through */ }
    return false;
  }
  function act(a, el, id) {
    const w = W(), it = id ? byId(id) : null;
    if (!w) return;
    /* each is the owner's one command (IDS: cmd.work.*), through the projection's own entry points */
    if (a === 'answer' && it) { const r = el.getAttribute('data-value'); w.sendInput(id, r); say(T('say.sent', { reply: r, title: it.title })); return; }
    if (a === 'delivery' && it) { const v = el.getAttribute('data-value'); w.setCompletionDelivery(id, v); say(T(v === 'agent' ? 'detail.deliveryAgentSaid' : v === 'user' ? 'detail.deliveryUserSaid' : 'detail.deliveryQuietSaid'), true); return; }
    if (a === 'stop' && it) { w.stop({ scope: 'item', id: id }); return; }
    if (a === 'restart' && it) { w.restart(id); say(T('say.restart', { title: it.title }), true); return; }
    if (a === 'rerun' && it) { w.restart(id); say(T('say.rerun', { command: it.command }), true); return; }
    if (a === 'copy' && it) { try { navigator.clipboard.writeText(it.command); } catch (_) { /* sandboxed */ } say(T('say.copied', { command: it.command }), true); return; }
    if (a === 'terminal' && it) { say(T('say.terminal', { title: it.title })); return; }
    if (a === 'port') { say(T('say.port', { port: el.getAttribute('data-port') })); return; }
    if (a === 'owner') { const o = byId(el.getAttribute('data-owner')); say(T('say.owner', { name: o ? o.title : '' })); return; }
    if (a === 'goto' && it) {
      if (it.surface === 'assistant' && openThread(it)) { close(); return; }
      if (PAGE_OF[it.surface] && goPage(PAGE_OF[it.surface])) { close(); return; }
      say(it.surface === 'assistant' ? T('say.thread', { where: it.where }) : T('say.surface', { surface: surfaceName(it.surface), title: it.title }));
    }
  }
  /* every [data-work-act] on the page: the panel's rows and inspector, and the chat's Processes view */
  doc.addEventListener('click', (e) => {
    const t = e.target && e.target.closest && e.target.closest('[data-work-act]');
    if (!t) return;
    const d = t.closest('[data-work-detail]');
    e.preventDefault();
    act(t.getAttribute('data-work-act'), t, d ? d.getAttribute('data-work-detail') : null);
  });

  function onPanelClick(e) {
    const t = e.target.closest('button'); if (!t || t.closest('[data-work-act]')) return;
    if (t.hasAttribute('data-work-tab')) { setTab(t.getAttribute('data-work-tab')); return; }
    if (t.hasAttribute('data-work-x')) { const id = t.getAttribute('data-work-x'); ui.expanded[id] = !ui.expanded[id]; render(true); return; }
    if (t.hasAttribute('data-work-subs')) { const a = t.getAttribute('data-work-subs'); ui.subOpen[a] = !ui.subOpen[a]; render(true); return; }
    if (t.hasAttribute('data-work-g')) { const g = t.getAttribute('data-work-g'); ui.collapsed[g] = !ui.collapsed[g]; render(true); return; }
    if (t.hasAttribute('data-work-procs')) { ui.jump = t.getAttribute('data-work-procs'); ui.collapsed['p:' + ui.jump] = false; setTab('processes'); return; }
    if (t.hasAttribute('data-work-sort')) { const k = t.getAttribute('data-work-sort'); ui.sort = [k, ui.sort[0] === k ? -ui.sort[1] : (k === 'cpu' || k === 'mem' ? -1 : 1)]; render(true); return; }
    if (t.hasAttribute('data-work-sel')) { ui.selected = t.getAttribute('data-work-sel'); render(true); return; }
    if (t.hasAttribute('data-work-goto')) {
      const g = t.getAttribute('data-work-goto');
      if (g === 'system') { say(T('say.systemStatus')); return; }
      if (PAGE_OF[g] && goPage(PAGE_OF[g])) { close(); return; }
      return;
    }
    const p = t.getAttribute('data-work-p');
    if (p === 'close') close();
    else if (p === 'float') { ui.floating = !ui.floating; render(true); place(); }
    else if (p === 'clear') { W().clearFinished(VIEW); say(T('say.cleared'), true); }
    else if (p === 'stopall') confirmPlatform();
  }
  function setTab(k) { if (ui.tab === k) return; ui.tab = k; ui.selected = null; render(); place(); paintBar(); const t = pop.querySelector('[data-work-tab="' + k + '"]'); if (t) t.focus({ preventScroll: true }); }
  function onPanelKey(e) {
    const t = e.target;
    if (t && t.getAttribute && t.getAttribute('role') === 'tab' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End')) {
      const tabs = ['agents', 'processes', 'resources'], i = tabs.indexOf(ui.tab);
      const n = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      e.preventDefault(); setTab(tabs[n]);
    }
  }
  /* the popped-out window moves by its header */
  function onPanelDrag(e) {
    if (!ui.floating || !e.target.closest('[data-work-drag]') || e.target.closest('button')) return;
    const sx = e.clientX, sy = e.clientY, ox = pop.offsetLeft, oy = pop.offsetTop;
    const mv = (ev) => { ui.fx = Math.max(0, Math.min(innerWidth - 80, ox + ev.clientX - sx)); ui.fy = Math.max(0, Math.min(innerHeight - 40, oy + ev.clientY - sy)); pop.style.left = ui.fx + 'px'; pop.style.top = ui.fy + 'px'; };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  }
  /* the status bar's two items open the panel at their own tab, or close it (the group is installStatusBar's, which may
     be drawn after this file runs: the click is heard on the document) */
  doc.addEventListener('click', (e) => {
    const b = e.target && e.target.closest && e.target.closest('[data-work-group] [data-status-action]');
    if (!b) return;
    e.preventDefault();
    toggle(b.getAttribute('data-status-action'));
  });
  /* outside a docked panel closes it; Escape closes the innermost thing (the Stop list first) */
  doc.addEventListener('pointerdown', (e) => {
    if (!ui.open || ui.floating || !pop) return;
    const t = e.target;
    if (pop.contains(t) || (group() && group().contains(t)) || (t.closest && t.closest('.wk-dialog-scrim, #o55-demo-studio, .o55ds, [data-pm-hover-exempt]'))) return;
    close();
  }, true);
  doc.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !ui.open || doc.querySelector('.wk-dialog-scrim')) return;
    const t = e.target;
    if (pop.contains(t) || (group() && group().contains(t)) || t === doc.body || t === doc.documentElement) { e.preventDefault(); close(); }
  });

  /* --------------------------------------------------------------------------- the Stop list and quitting */
  let dlg = null;
  function confirm(o) {
    if (dlg) dlg.remove();
    const back = doc.activeElement;
    const d = dlg = doc.createElement('div');
    d.className = 'wk-dialog-scrim';
    d.innerHTML = '<div class="wk-dialog" id="pm7-work-dialog" role="alertdialog" aria-modal="true" aria-labelledby="wk-dialog-title" aria-describedby="wk-dialog-lead"><h2 id="wk-dialog-title">' + esc(o.title) + '</h2><p id="wk-dialog-lead">' + esc(o.lead) + '</p>' +
      (o.choice ? '<div class="wk-seg wk-choice" role="radiogroup" aria-label="' + esc(o.title) + '">' + o.choice.map((c, i) => '<button type="button" role="radio" aria-checked="' + (i === 0) + '" data-choice="' + c[0] + '">' + esc(c[1]) + '</button>').join('') + '</div>' : '') +
      (o.items.length ? '<ul class="wk-dialog-list">' + o.items.map((it) => '<li><label><input type="checkbox" checked data-id="' + esc(it.id) + '" data-kind="' + esc(it.kind) + '">' + st(it.state, 11) + '<b>' + esc(it.title) + '</b><span>' + esc(it.where || '') + (it.command ? ' · ' + esc(it.command) : '') + '</span></label></li>').join('') + '</ul>' : '') +
      (o.note ? '<p class="wk-dim">' + esc(o.note) + '</p>' : '') +
      '<div class="wk-dialog-actions"><button type="button" class="wk-btn" data-x="cancel">' + T('stopDialog.cancel') + '</button><button type="button" class="wk-btn danger" data-x="go"></button></div></div>';
    root().appendChild(d);
    const go = d.querySelector('[data-x="go"]');
    const mode = () => { const c = d.querySelector('[data-choice][aria-checked="true"]'); return c ? c.getAttribute('data-choice') : 'all'; };
    function count() {
      const m = mode(), boxes = Array.prototype.slice.call(d.querySelectorAll('input[type=checkbox]'));
      boxes.forEach((b) => { const off = m === 'keep_running' || (m === 'procs' && b.getAttribute('data-kind') === 'agent'); b.disabled = off; b.closest('li').classList.toggle('is-off', off); });
      const n = boxes.filter((b) => b.checked && !b.disabled).length;
      go.textContent = o.goLabel(n, m);
      go.disabled = !n && !o.allowZero;
      go.classList.toggle('danger', !!n);
    }
    const shut = () => { d.remove(); if (dlg === d) dlg = null; if (back && back.isConnected) back.focus({ preventScroll: true }); };
    d.addEventListener('change', count);
    d.addEventListener('click', (e) => {
      const c = e.target.closest('[data-choice]');
      if (c) { d.querySelectorAll('[data-choice]').forEach((b) => b.setAttribute('aria-checked', String(b === c))); count(); return; }
      const x = e.target.closest('[data-x]');
      if (!x && e.target !== d) return;
      if (x && x.getAttribute('data-x') === 'go') o.onGo(Array.prototype.slice.call(d.querySelectorAll('input[type=checkbox]')).filter((b) => b.checked && !b.disabled).map((b) => b.getAttribute('data-id')), mode());
      shut();
    });
    d.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); shut(); return; }
      if (e.key === 'Tab') { const f = Array.prototype.slice.call(d.querySelectorAll('button:not([disabled]), input:not([disabled])')); if (!f.length) return; const i = f.indexOf(doc.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
    });
    count();
    requestAnimationFrame(() => { const c = d.querySelector('[data-x="cancel"]'); if (c) c.focus(); });
    return d;
  }
  /* Stop all in one chat thread (D8; the chat's Processes view calls this) */
  function confirmThread(threadId, where) {
    const w = W(); if (!w) return;
    /* the chat's Stop all is for what the thread started: its processes and scheduled runs; the composer's Stop ends the
       reply, and an agent is stopped from its own row */
    const ids = w.stopTargets({ scope: 'thread', thread: threadId }), list = sort(ids.map(byId).filter((x) => x && x.kind !== 'agent'));
    confirm({ title: T('stopDialog.threadTitle', { n: list.length, where: where || '' }), lead: T('stopDialog.threadLead'), items: list,
      goLabel: (n) => (n ? T('stopDialog.go', { n: n }) : T('stopDialog.goNone')),
      onGo: (sel) => { if (sel.length) { w.stop({ scope: 'thread', thread: threadId, targets: sel }); say(T('say.stopped', { n: sel.length }), true); } } });
  }
  /* Stop all across Puppet Master (D8): processes and scheduled runs, or agents too */
  function confirmPlatform() {
    const w = W(); if (!w) return;
    const list = sort(w.stopTargets({ scope: 'platform' }).map(byId).filter(Boolean));
    confirm({ title: T('stopDialog.platformTitle'), lead: T('stopDialog.platformLead'), choice: [['procs', T('stopDialog.choiceProcs')], ['all', T('stopDialog.choiceAll')]], items: list,
      goLabel: (n) => (n ? T('stopDialog.go', { n: n }) : T('stopDialog.goNone')),
      onGo: (sel) => { if (sel.length) { w.stop({ scope: 'platform', targets: sel }); say(T('say.stopped', { n: sel.length }), true); } } });
  }
  /* What quitting does to running work (D10, F3-665): it asks; keep running on the server is the default */
  function quit() {
    const w = W(); if (!w) return;
    const c = counts(), list = sort(w.quitTargets().map(byId).filter(Boolean));
    confirm({ title: T('quitDialog.title'),
      lead: c.agents + c.processes ? T('quitDialog.lead', { agents: plural(c.agents, T('bar.agent'), T('bar.agents')), processes: plural(c.processes, T('bar.process'), T('bar.processes')) }) : T('quitDialog.leadNone'),
      choice: [['keep_running', T('quitDialog.keep')], ['stop_selected', T('quitDialog.stop')]], items: list, note: list.length ? T('quitDialog.note') : '', allowZero: true,
      goLabel: (n, m) => (m === 'stop_selected' && n ? T('quitDialog.goStop', { n: n }) : T('quitDialog.go')),
      onGo: (sel, m) => {
        const stop = m === 'stop_selected' ? sel : [];
        w.quit({ choice: stop.length ? 'stop_selected' : 'keep_running', targets: stop });
        say(stop.length ? T('say.quitStop', { n: stop.length }) : T('say.quitKeep'));
      } });
  }

  /* ----------------------------------------------------------------------------- notices for "Notify me" */
  /* D9: an item set to Notify me tells you once when it finishes, fails or is found lost; one notice per item (the
     notification owner merges repeats); one stopped by a person is not news */
  const seen = {};
  function notices() {
    const w = W(); if (!w) return;
    w.items().forEach((it) => {
      const done = isDone(it), was = seen[it.id];
      seen[it.id] = done ? 'done' : 'live';
      if (was !== 'live' || !done || it.delivery !== 'user' || it.state === 'skipped') return;
      const key = it.state === 'failed' ? 'failed' : it.state === 'warning' ? 'lost' : 'done';
      try {
        if (window.PM_TITLEBAR_NOTIFY && window.PM_TITLEBAR_NOTIFY.push) window.PM_TITLEBAR_NOTIFY.push({
          title: T('notice.' + key, { title: it.title }), body: T('notice.body', { where: it.where || surfaceName(it.surface), what: it.exit != null ? T('detail.exit', { n: it.exit }) : word(it) }),
          kind: 'advisory', severity: key === 'done' ? 'success' : 'warn', important: true, source: 'agents' });
      } catch (_) { /* decoration only */ }
    });
  }

  /* --------------------------------------------------------------------------------------- staying current */
  function onChange(why) {
    paintBar();
    notices();
    if (!ui.open || !pop) return;
    if (why === 'tick') {
      pop.querySelectorAll('[data-work-time]').forEach((el) => { const it = byId(el.getAttribute('data-work-time')); if (it) { const v = time(it); if (el.textContent !== v) el.textContent = v; } });
      pop.querySelectorAll('[data-work-tail]').forEach((el) => {
        const it = byId(el.getAttribute('data-work-tail')); if (!it || !it.tail) return;
        const pre = el.querySelector('pre'), txt = it.tail.slice(-6).join('\n');
        if (pre && pre.textContent !== txt) { const tmp = doc.createElement('div'); tmp.innerHTML = tail(it, 6); el.replaceWith(tmp.firstChild); }
      });
      return;
    }
    render(true); place();
  }
  function boot() {
    const w = W(); if (!w) return;
    w.items().forEach((it) => { seen[it.id] = isDone(it) ? 'done' : 'live'; });
    w.on('change', onChange);
    new MutationObserver(paintBar).observe(doc.documentElement, { attributes: true, attributeFilter: ['data-pm-status-words'] });
    window.addEventListener('resize', () => { if (ui.open && !ui.floating) place(); });
    paintBar();
  }
  window.PM7_WORK_UI = { open, close, toggle, isOpen: () => ui.open, tab: () => ui.tab, detail, tail, confirmThread, confirmPlatform, quit, paintBar, ui };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();
})();
