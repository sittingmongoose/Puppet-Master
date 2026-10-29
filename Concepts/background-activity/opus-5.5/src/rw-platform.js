/* rw-platform.js — agents and processes in the status bar (Background activity concept, Opus 5.5).
 *
 * Two status-bar items in their own group, between the project folder and the branch: one for agents and one for
 * processes, each with its own count and its own "needs you" count. Agents have questions; processes need input
 * (Jared, 2026-10-27: keep them apart, and say "processes" everywhere, as the chat's domain does). Clicking either
 * opens one panel at its tab: every agent and subagent (Assistant threads, the Orchestrator, the Planning Wizard,
 * the PRD Builder, Scout), every process, script and scheduled run, and a read-only mirror of system services. It
 * reads the same store as the chat's Processes domain (rw-data.js) and uses the same detail block (RW.ui.detail).
 *
 * Three layouts for the panel, switched in the lab: "tabs" (Agents and Processes tabs, questions or input first),
 * "side" (the two lists side by side) and "table" (a task manager: sortable columns and an inspector).
 */
(function () {
  'use strict';
  var RW = window.RW;
  if (!RW || !RW.ui || window.RW_PLATFORM) return;
  var P = window.RW_PLATFORM = {};
  var esc = RW.esc, doc = document;
  var ui = { open: false, floating: false, expanded: {}, subOpen: {}, collapsed: { system: true }, tab: 'agents', sort: ['rank', 1], selected: null, jump: null };

  /* ---------------------------------------------------------- counting */
  function counts() {
    var c = { agents: 0, questions: 0, procs: 0, input: 0, sched: 0, done: 0, services: 0 };
    RW.items.forEach(function (x) {
      if (x.kind === 'service') { if (RW.isLive(x)) c.services++; return; }
      if (x.kind === 'scheduled') { if (x.state === 'pending') c.sched++; else if (RW.isDone(x)) c.done++; return; }
      if (RW.isQuestion(x)) c.questions++;
      if (RW.needsInput(x)) c.input++;
      if (RW.isLive(x)) { if (x.kind === 'agent') c.agents++; else c.procs++; }
      else if (RW.isDone(x)) c.done++;
    });
    return c;
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function qWord(n) { return plural(n, 'question', 'questions'); }
  function iWord(n) { return n + ' need' + (n === 1 ? 's' : '') + ' input'; }
  function sumText(c) {
    var p = [plural(c.agents, 'agent', 'agents')];
    if (c.questions) p.push(qWord(c.questions));
    p.push(plural(c.procs, 'process', 'processes'));
    if (c.input) p.push(iWord(c.input));
    if (c.sched) p.push(c.sched + ' scheduled');
    return p.join(' · ');
  }
  /* the agent a process belongs to: its owner's top agent, or the thread's own agent */
  function topOf(x) {
    var o = x.owner ? RW.byId(x.owner) : null;
    while (o && o.parent && RW.byId(o.parent)) o = RW.byId(o.parent);
    if (o) return o;
    if (x.thread) for (var i = 0; i < RW.items.length; i++) { var a = RW.items[i]; if (a.kind === 'agent' && a.role === 'main' && a.thread === x.thread) return a; }
    return null;
  }
  function liveProcs() { return RW.items.filter(function (x) { return x.kind === 'process' && RW.isLive(x); }); }
  function procsOf(a) { return liveProcs().filter(function (x) { var t = topOf(x); return t && t.id === a.id; }); }

  /* -------------------------------------------- the status-bar group: two items */
  var group = doc.createElement('div');
  group.className = 'pm7-statusbar-group rw-sb-group';
  group.setAttribute('data-rw-sb-group', '1');
  function mkItem(kind) {
    var b = doc.createElement('button');
    b.type = 'button'; b.className = 'pm7-statusitem rw-sb';
    b.setAttribute('data-rw-sb', kind); b.setAttribute('aria-haspopup', 'dialog'); b.setAttribute('aria-controls', 'rw-pop');
    group.appendChild(b);
    return b;
  }
  var itemA = mkItem('agents'), itemP = mkItem('processes');
  var stale = doc.createElement('span');
  stale.className = 'pm7-statusitem rw-sb-stale';
  stale.setAttribute('data-pm-hover-label', 'Out of date');
  stale.setAttribute('data-pm-hover-detail', 'These counts are what was known 40 seconds ago. Reconnecting to the server; nothing has been stopped.');
  group.appendChild(stale);
  function bySurface(list) {
    var by = {};
    list.forEach(function (x) { var n = RW.ui.surfaceName(x.surface); by[n] = (by[n] || 0) + 1; });
    return Object.keys(by).map(function (k) { return k + ' ' + by[k]; }).join(', ');
  }
  function paintOne(b, kind, c) {
    var v = RW.state.barVariant, n = kind === 'agents' ? c.agents : c.procs, ask = kind === 'agents' ? c.questions : c.input;
    var tone = n ? 'working' : 'idle', h = '<span class="rw-gh">' + RW.glyph(kind, 12, 'rw-g') + '</span>';
    if (!n && !ask) h += '<span class="rw-dim">' + (kind === 'agents' ? 'No agents' : 'No processes') + '</span>';
    else if (v === 'compact') h += '<strong>' + n + '</strong>' + (ask ? '<span class="rw-sb-ask">' + RW.st('waiting', 10) + '<strong>' + ask + '</strong></span>' : '');
    else h += '<span><strong>' + n + '</strong> ' + (kind === 'agents' ? (n === 1 ? 'agent' : 'agents') : (n === 1 ? 'process' : 'processes')) + '</span>' +
      (ask ? '<span class="rw-sb-ask">' + RW.st('waiting', 10) + '<span><strong>' + ask + '</strong> ' + (kind === 'agents' ? (ask === 1 ? 'question' : 'questions') : (ask === 1 ? 'needs input' : 'need input')) + '</span></span>' : '');
    b.setAttribute('data-tone', tone);
    b.setAttribute('data-ask', String(!!ask));
    b.setAttribute('data-variant', v);
    var on = ui.open && (RW.state.popVariant === 'side' || ui.tab === kind);
    b.setAttribute('aria-expanded', String(on));
    b.classList.toggle('is-open', on);
    if (b.getAttribute('data-html') !== h) { b.innerHTML = h; b.setAttribute('data-html', h); }
    var live = kind === 'agents' ? RW.items.filter(function (x) { return x.kind === 'agent' && RW.isLive(x); }) : liveProcs();
    b.setAttribute('data-pm-hover-label', kind === 'agents' ? 'Agents' : 'Processes');
    b.setAttribute('data-pm-hover-detail', (n ? (kind === 'agents' ? plural(n, 'agent', 'agents') : plural(n, 'process', 'processes')) + ' running across Puppet Master (' + bySurface(live) + ').' : (kind === 'agents' ? 'No agents are running.' : 'No processes are running.')) +
      (ask ? ' ' + (kind === 'agents' ? qWord(ask) + ' for you.' : iWord(ask) + ' from you.') : '') +
      (kind === 'processes' && c.sched ? ' ' + c.sched + ' scheduled.' : '') + ' Click to see them.');
    b.setAttribute('aria-label', (kind === 'agents' ? 'Agents: ' : 'Processes: ') + n + ' running' + (ask ? ', ' + (kind === 'agents' ? qWord(ask) : iWord(ask)) : ''));
  }
  function paintItem() {
    var c = counts();
    paintOne(itemA, 'agents', c); paintOne(itemP, 'processes', c);
    var st = RW.state.feed === 'stale';
    stale.hidden = !st;
    var sh = RW.st('offline', 10) + '<span class="rw-dim">stale</span>';
    if (st && stale.getAttribute('data-html') !== sh) { stale.innerHTML = sh; stale.setAttribute('data-html', sh); }
  }
  function placeItem() {
    var bar = doc.getElementById('pm7GlobalStatusBar');
    if (!bar) return;
    /* its own group, after the group that holds Ready and the project folder, so the bar's dividers frame it */
    var sys = bar.querySelector('[data-status-action="system"]');
    var after = sys ? sys.closest('.pm7-statusbar-group') : bar.querySelector('.pm7-statusbar-group');
    if (!after || after === group) return;
    if (group.parentNode !== bar || group.previousElementSibling !== after) bar.insertBefore(group, after.nextSibling);
  }

  /* ------------------------------------------------------------- the panel */
  var pop = doc.createElement('section');
  pop.id = 'rw-pop';
  pop.className = 'rw-pop';
  pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-modal', 'false'); pop.setAttribute('aria-label', 'Agents and processes');
  pop.hidden = true;

  function rowHtml(it, depth, opts) {
    opts = opts || {};
    var t = RW.tone(it), open = !!ui.expanded[it.id];
    var sub = RW.needsYou(it) && it.ask ? '<b class="rw-askline">' + esc(it.ask) + '</b>' :
      esc(it.lost ? 'Ended while Puppet Master was closed' : (it.kind === 'agent' ? (it.detail || '') : (it.kind === 'scheduled' ? it.detail : it.command))) +
      (it.ports && it.ports.length && RW.isLive(it) ? ' · <span class="rw-port">:' + it.ports.join(', :') + '</span>' : '') +
      (it.progress && RW.isLive(it) ? ' · ' + it.progress.done + '/' + it.progress.total + ' ' + esc(it.progress.unit) : '');
    var meta = [];
    if (opts.where) meta.push(esc(RW.ui.surfaceName(it.surface)) + (it.where && it.where !== it.title ? ' · ' + esc(it.where) : ''));
    if (it.model && it.kind === 'agent') meta.push(esc(it.model));
    if (it.owner && opts.owner !== false) meta.push('by ' + esc(RW.ownerName(it)));
    return '<div class="rw-prow' + (open ? ' is-open' : '') + (RW.state.feed === 'stale' ? ' is-stale' : '') + '" style="--d:' + (depth || 0) + '" data-kind="' + it.kind + '">' +
      '<button type="button" class="rw-prow-btn" data-rw-x="' + esc(it.id) + '" aria-expanded="' + open + '">' +
      '<span class="rw-lead">' + RW.st(it.stopping ? 'pending' : it.state, 12) + '</span>' +
      '<span class="rw-kind" aria-hidden="true">' + RW.icon(RW.roleIcon(it), 11) + '</span>' +
      '<span class="rw-copy"><strong>' + esc(it.title) + '</strong><span class="rw-sub">' + sub + '</span>' + (meta.length ? '<span class="rw-meta">' + meta.join(' · ') + '</span>' : '') + '</span>' +
      '<span class="rw-right"><b data-tone="' + t + '">' + esc(RW.word(it)) + '</b><i data-rw-time="' + esc(it.id) + '">' + esc(RW.time(it)) + '</i></span></button>' +
      (open ? RW.ui.detail(it, true) : '') + '</div>';
  }
  /* a fixed section: Questions, Needs input, Scheduled, Finished */
  function sec(key, title, list, opts) {
    if (!list.length) return '';
    opts = opts || {};
    return '<section class="rw-group rw-fixed" data-sec="' + key + '"' + (opts.tone ? ' data-tone="' + opts.tone + '"' : '') + '><div class="rw-shead">' +
      (opts.tone === 'attention' ? RW.st('waiting', 11) : '') + '<strong>' + title + '</strong><span class="rw-gsum">' + (opts.sum || list.length) + '</span>' +
      (opts.clear ? '<button type="button" class="rw-link" data-rw-p="clear">Clear</button>' : '') + '</div>' +
      list.map(function (x) { return rowHtml(x, 0, opts.row || { where: true }); }).join('') + '</section>';
  }
  function surfaceIcon(key) { for (var i = 0; i < RW.SURFACES.length; i++) if (RW.SURFACES[i][0] === key) return RW.SURFACES[i][2]; return 'robot'; }
  function ghead(id, icon, title, sumHtml, gotoKey, col) {
    return '<button type="button" class="rw-ghead" data-rw-g="' + esc(id) + '" aria-expanded="' + !col + '">' +
      RW.icon(col ? 'arrow-right' : 'chevron-down', 10) + RW.icon(icon, 13) + '<strong>' + esc(title) + '</strong><span class="rw-gsum">' + sumHtml + '</span>' +
      (gotoKey ? '<span class="rw-gopen" data-rw-goto="' + esc(gotoKey) + '">' + (gotoKey === 'system' ? 'System status' : 'Open') + '</span>' : '') + '</button>';
  }

  /* Agents: their questions first, then each surface's agents. Processes are counted on the row, listed on the other tab. */
  function agentsBody() {
    var h = sec('questions', 'Questions', RW.sort(RW.items.filter(RW.isQuestion)), { tone: 'attention', sum: 'answer each in its thread' });
    RW.SURFACES.forEach(function (sf) {
      var key = sf[0];
      if (key === 'system') return;
      var mine = RW.items.filter(function (x) { return x.surface === key && x.kind === 'agent' && !RW.isDone(x); });
      if (!mine.length) return;
      /* an agent with a question is listed once, under Questions; its surface counts it */
      var tops = RW.sort(mine.filter(function (x) { return (x.role === 'main' || !x.parent || !RW.byId(x.parent)) && !RW.isQuestion(x); }));
      var live = mine.filter(RW.isLive).length, q = mine.filter(RW.isQuestion).length, col = !!ui.collapsed['a:' + key];
      h += '<section class="rw-group" data-surface="' + key + '">' + ghead('a:' + key, sf[2], sf[1], plural(live, 'agent', 'agents') + ' running' + (q ? ' · <b data-tone="attention">' + qWord(q) + ' above</b>' : ''), key, col);
      if (!col) tops.forEach(function (a) {
        h += rowHtml(a, 0, { owner: false });
        var subs = RW.sort(RW.items.filter(function (x) { return x.parent === a.id && !RW.isDone(x); })), np = procsOf(a).length;
        if (!subs.length && !np) return;
        var open = !!ui.subOpen[a.id];
        /* under the row, outside its button: the subagents fold and the way to this agent's processes */
        h += '<div class="rw-alinks">';
        if (subs.length) {
          var by = {};
          subs.forEach(function (s) { var w = RW.word(s).toLowerCase(); by[w] = (by[w] || 0) + 1; });
          h += '<button type="button" class="rw-subs" data-rw-subs="' + esc(a.id) + '" aria-expanded="' + open + '">' + RW.icon(open ? 'chevron-down' : 'arrow-right', 10) + '<span>' + plural(subs.length, 'subagent', 'subagents') + ': ' + Object.keys(by).map(function (k) { return by[k] + ' ' + k; }).join(', ') + '</span></button>';
        }
        if (np) h += '<button type="button" class="rw-plink" data-rw-procs="' + esc(a.id) + '" title="Show the processes ' + esc(a.title) + ' started">' + '<span class="rw-gh" data-tone="working">' + RW.glyph('processes', 11, 'rw-g') + '</span>' + plural(np, 'process', 'processes') + '</button>';
        h += '</div>';
        if (open) subs.forEach(function (s) { h += rowHtml(s, 1, { owner: false }); });
      });
      h += '</section>';
    });
    h += sec('finished', 'Finished this session', RW.sort(RW.items.filter(function (x) { return x.kind === 'agent' && RW.isDone(x); })), { clear: true });
    return h || '<div class="rw-empty">No agents are running.</div>';
  }
  /* Processes: what needs input first, then running processes under the agent that started them. */
  function procsBody() {
    var h = sec('input', 'Needs input', RW.sort(RW.items.filter(RW.needsInput)), { tone: 'attention', sum: 'answer here or in Terminal' });
    var groups = [], byId = {};
    RW.sort(liveProcs().filter(function (x) { return !RW.needsYou(x); })).forEach(function (x) {
      var t = topOf(x), k = t ? t.id : 'other:' + x.surface;
      if (!byId[k]) { byId[k] = { id: k, top: t, surface: x.surface, list: [] }; groups.push(byId[k]); }
      byId[k].list.push(x);
    });
    var order = RW.SURFACES.map(function (s) { return s[0]; });
    groups.sort(function (a, b) { return order.indexOf(a.surface) - order.indexOf(b.surface); });
    groups.forEach(function (g) {
      var col = !!ui.collapsed['p:' + g.id], title = g.top ? (g.top.where || g.top.title) : RW.ui.surfaceName(g.surface);
      h += '<section class="rw-group" data-owner-group="' + esc(g.id) + '"' + (ui.jump === g.id ? ' data-jump="1"' : '') + '>' +
        ghead('p:' + g.id, surfaceIcon(g.surface), title, esc(RW.ui.surfaceName(g.surface)) + ' · ' + plural(g.list.length, 'process', 'processes'), g.surface, col);
      if (!col) g.list.forEach(function (x) { h += rowHtml(x, 0, {}); });
      h += '</section>';
    });
    h += sec('scheduled', 'Scheduled', RW.sort(RW.items.filter(function (x) { return x.kind === 'scheduled' && x.state === 'pending'; })));
    h += sec('finished', 'Finished this session', RW.sort(RW.items.filter(function (x) { return (x.kind === 'process' || x.kind === 'scheduled') && RW.isDone(x); })), { clear: true });
    var svc = RW.sort(RW.items.filter(function (x) { return x.kind === 'service'; }));
    if (svc.length) {
      var col = !!ui.collapsed.system;
      h += '<section class="rw-group" data-surface="system">' + ghead('system', 'server', 'System services', plural(svc.filter(RW.isLive).length, 'service', 'services') + ' · read only', 'system', col);
      if (!col) { svc.forEach(function (x) { h += rowHtml(x, 0, {}); }); h += '<p class="rw-note rw-dim">A mirror of System status. Services are started and stopped there, never from here.</p>'; }
      h += '</section>';
    }
    return h || '<div class="rw-empty">No processes are running.</div>';
  }
  var COLS = [['title', 'Name'], ['where', 'Where'], ['rank', 'State'], ['time', 'Time'], ['cpu', 'CPU'], ['mem', 'Memory'], ['ports', 'Port']];
  function bodyTable() {
    var list = RW.items.filter(function (x) {
      if (ui.tab === 'agents') return x.kind === 'agent';
      if (ui.tab === 'services') return x.kind === 'service';
      return x.kind === 'process' || x.kind === 'scheduled';
    });
    var k = ui.sort[0], dir = ui.sort[1];
    list = list.slice().sort(function (a, b) {
      var va, vb;
      if (k === 'rank') { va = RW.rank(a); vb = RW.rank(b); }
      else if (k === 'time') { va = a.startedAt || 0; vb = b.startedAt || 0; return dir * (va - vb); }
      else if (k === 'cpu' || k === 'mem') { va = RW.isLive(a) ? (a[k] || 0) : -1; vb = RW.isLive(b) ? (b[k] || 0) : -1; return -dir * (va - vb); }
      else if (k === 'ports') { va = (a.ports || [])[0] || 99999; vb = (b.ports || [])[0] || 99999; }
      else { va = String(k === 'where' ? RW.ui.surfaceName(a.surface) + a.where : a.title).toLowerCase(); vb = String(k === 'where' ? RW.ui.surfaceName(b.surface) + b.where : b.title).toLowerCase(); }
      return dir * (va < vb ? -1 : va > vb ? 1 : 0);
    });
    if (!ui.selected || !list.some(function (x) { return x.id === ui.selected; })) ui.selected = list[0] ? list[0].id : null;
    var h = '<div class="rw-table" role="table" aria-label="' + (ui.tab === 'agents' ? 'Agents' : ui.tab === 'services' ? 'Services' : 'Processes') + '"><div class="rw-tr rw-th" role="row">' + COLS.map(function (c) {
      return '<button type="button" role="columnheader" data-rw-sort="' + c[0] + '" aria-sort="' + (k === c[0] ? (dir > 0 ? 'ascending' : 'descending') : 'none') + '">' + c[1] + (k === c[0] ? RW.icon(dir > 0 ? 'arrow-up' : 'arrow-down', 9) : '') + '</button>';
    }).join('') + '</div>';
    h += list.map(function (x) {
      var t = RW.tone(x), live = RW.isLive(x);
      return '<button type="button" class="rw-tr' + (ui.selected === x.id ? ' is-sel' : '') + (RW.state.feed === 'stale' ? ' is-stale' : '') + '" role="row" data-rw-sel="' + esc(x.id) + '" aria-selected="' + (ui.selected === x.id) + '">' +
        '<span role="cell" class="rw-c-name">' + RW.st(x.stopping ? 'pending' : x.state, 11) + '<b>' + esc(x.title) + '</b></span>' +
        '<span role="cell" class="rw-c-where">' + esc(RW.ui.surfaceName(x.surface)) + (x.where && x.where !== x.title ? ' · ' + esc(x.where) : '') + '</span>' +
        '<span role="cell"><b data-tone="' + t + '">' + esc(RW.word(x)) + '</b></span>' +
        '<span role="cell" data-rw-time="' + esc(x.id) + '">' + esc(RW.time(x)) + '</span>' +
        '<span role="cell" class="rw-num" data-rw-cpu="' + esc(x.id) + '">' + (live && x.cpu != null ? x.cpu + '%' : 'n/a') + '</span>' +
        '<span role="cell" class="rw-num">' + (live && x.mem ? (x.mem >= 1000 ? (x.mem / 1000).toFixed(1) + ' GB' : x.mem + ' MB') : 'n/a') + '</span>' +
        '<span role="cell" class="rw-num">' + (x.ports && x.ports.length ? x.ports.join(', ') : '') + '</span></button>';
    }).join('') + '</div>';
    var sel = ui.selected && RW.byId(ui.selected);
    if (sel) h += '<section class="rw-inspector"><div class="rw-ihead">' + RW.st(sel.state, 12) + '<strong>' + esc(sel.title) + '</strong><b data-tone="' + RW.tone(sel) + '">' + esc(RW.word(sel)) + '</b></div>' + RW.ui.detail(sel, true) + '</section>';
    return h;
  }
  /* the two lists' heads: a tab (tabs, table) or a column head (side by side), each with its own ask count */
  function headLabel(kind, c) {
    var n = kind === 'agents' ? c.agents : c.procs, ask = kind === 'agents' ? c.questions : c.input;
    return '<span class="rw-gh" data-tone="' + (n ? 'working' : 'idle') + '">' + RW.glyph(kind, 13, 'rw-g') + '</span><span>' + (kind === 'agents' ? 'Agents' : 'Processes') + '</span><span class="rw-n">' + n + '</span>' +
      (ask ? '<span class="rw-ask-n" data-tone="attention">' + RW.st('waiting', 10) + (kind === 'agents' ? qWord(ask) : iWord(ask)) + '</span>' : '');
  }
  function tabsHtml(c) {
    var v = RW.state.popVariant;
    if (v === 'side') return '';
    var tabs = [['agents', headLabel('agents', c)], ['processes', headLabel('processes', c)]];
    if (v === 'table') tabs.push(['services', RW.icon('server', 13) + '<span>Services</span><span class="rw-n">' + c.services + '</span>']);
    return '<div class="rw-pop-tabs rw-tabs2" role="tablist">' + tabs.map(function (t) {
      return '<button type="button" role="tab" data-rw-tab2="' + t[0] + '" data-kind="' + t[0] + '" aria-selected="' + (ui.tab === t[0]) + '">' + t[1] + '</button>';
    }).join('') + '</div>';
  }
  function bodyHtml(c) {
    var v = RW.state.popVariant;
    if (v === 'table') return bodyTable();
    if (v === 'side') return '<div class="rw-cols"><div class="rw-col" data-kind="agents"><div class="rw-colhead">' + headLabel('agents', c) + '</div>' + agentsBody() + '</div>' +
      '<div class="rw-col" data-kind="processes"><div class="rw-colhead">' + headLabel('processes', c) + '</div>' + procsBody() + '</div></div>';
    return ui.tab === 'processes' ? procsBody() : agentsBody();
  }
  function render(keep) {
    var sc = pop.querySelectorAll('.rw-pop-body, .rw-col'), tops = [].map.call(sc, function (e) { return e.scrollTop; });
    var c = counts(), v = RW.state.popVariant;
    if (v !== 'table' && ui.tab === 'services') ui.tab = 'processes';
    pop.setAttribute('data-variant', v);
    pop.setAttribute('data-tab', ui.tab);
    pop.classList.toggle('is-floating', ui.floating);
    var cpu = 0, mem = 0;
    RW.items.forEach(function (x) { if (RW.isLive(x) && x.kind !== 'agent') { cpu += x.cpu || 0; mem += x.mem || 0; } });
    /* the counts live on the tabs (or the column heads), once */
    pop.innerHTML = '<header class="rw-pop-head" data-rw-drag="1"><strong>Agents and processes</strong>' +
      (c.sched ? '<span class="rw-pop-sum">' + c.sched + ' scheduled</span>' : '') + '<span class="rw-grow"></span>' +
      '<button type="button" class="icon-button rw-ib" data-rw-p="tab" title="Open as a panel tab on Home" aria-label="Open as a panel tab">' + RW.icon('panel', 13) + '</button>' +
      '<button type="button" class="icon-button rw-ib" data-rw-p="float" aria-pressed="' + ui.floating + '" title="' + (ui.floating ? 'Dock back to the status bar' : 'Pop out to a floating window') + '" aria-label="Pop out">' + RW.icon(ui.floating ? 'arrow-down' : 'open', 13) + '</button>' +
      '<button type="button" class="icon-button rw-ib" data-rw-p="close" title="Close" aria-label="Close">' + RW.icon('close', 13) + '</button></header>' +
      (RW.state.restarted ? '<div class="rw-strip" data-tone="attention">' + RW.st('warning', 12) + '<span>Puppet Master restarted 2m ago. 2 processes ended while it was closed; each agent was told once.</span></div>' : '') +
      (RW.state.feed === 'stale' ? '<div class="rw-strip" data-tone="attention">' + RW.st('offline', 12) + '<span>Showing what was known 40s ago. Reconnecting to the server; nothing has been stopped.</span></div>' : '') +
      tabsHtml(c) + '<div class="rw-pop-body">' + bodyHtml(c) + '</div>' +
      '<footer class="rw-pop-foot"><button type="button" class="rw-link" data-rw-p="clear">Clear finished</button>' +
      (v === 'table' ? '<span class="rw-dim rw-res">Processes Puppet Master started: CPU ' + cpu + '% · memory ' + (mem / 1000).toFixed(1) + ' GB · sampled every 2 s while this is open</span>' : '<span class="rw-grow"></span>') +
      '<button type="button" class="rw-btn danger" data-rw-p="stopall"' + (c.agents + c.procs + c.sched ? '' : ' disabled') + '>Stop all…</button></footer>';
    if (keep) [].forEach.call(pop.querySelectorAll('.rw-pop-body, .rw-col'), function (e, i) { if (tops[i] != null) e.scrollTop = tops[i]; });
    var j = ui.jump && pop.querySelector('[data-jump="1"]');
    if (j) { j.scrollIntoView({ block: 'nearest' }); setTimeout(function () { ui.jump = null; var g = pop.querySelector('[data-jump="1"]'); if (g) g.removeAttribute('data-jump'); }, 1600); }
  }
  function anchorItem() { return RW.state.popVariant === 'side' || ui.tab !== 'processes' ? itemA : itemP; }
  function place() {
    if (pop.parentNode !== doc.body) doc.body.appendChild(pop);
    if (ui.floating) {
      if (!pop.style.getPropertyValue('--rw-fx')) { pop.style.setProperty('--rw-fx', Math.round(innerWidth / 2 - 400) + 'px'); pop.style.setProperty('--rw-fy', '90px'); }
      pop.style.left = pop.style.getPropertyValue('--rw-fx'); pop.style.top = pop.style.getPropertyValue('--rw-fy'); pop.style.bottom = 'auto';
      return;
    }
    var bar = doc.getElementById('pm7GlobalStatusBar'), br = bar ? bar.getBoundingClientRect() : { top: innerHeight - 25 }, ir = anchorItem().getBoundingClientRect();
    var w = pop.offsetWidth || 600;
    pop.style.left = Math.max(8, Math.min(ir.left - 6, innerWidth - w - 8)) + 'px';
    pop.style.top = 'auto';
    pop.style.bottom = Math.round(innerHeight - br.top + 6) + 'px';
  }
  P.open = function (tab) {
    if (tab) ui.tab = tab;
    ui.open = true; pop.hidden = false; render(); place(); paintItem();
    setTimeout(function () { var b = pop.querySelector('.rw-pop-tabs [aria-selected="true"]') || pop.querySelector('.rw-ib'); if (b) b.focus({ preventScroll: true }); }, 0);
  };
  P.close = function () { var back = anchorItem(); ui.open = false; pop.hidden = true; paintItem(); back.focus({ preventScroll: true }); };
  P.toggle = function (tab) {
    if (ui.open && (!tab || ui.tab === tab || RW.state.popVariant === 'side')) P.close();
    else P.open(tab);
  };

  [itemA, itemP].forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); P.toggle(b.getAttribute('data-rw-sb')); });
  });
  pop.addEventListener('click', function (e) {
    if (RW.ui.handle(e, pop)) return;
    var t = e.target.closest('button,[data-rw-goto]');
    if (!t) return;
    var goto = e.target.closest('[data-rw-goto]');
    if (goto) {
      e.stopPropagation();
      var g = goto.getAttribute('data-rw-goto'), page = { orchestrator: 'Orchestrator', wizard: 'Planning Wizard' }[g];
      if (page) { var tab = [].slice.call(doc.querySelectorAll('.title-bar button, .title-bar [role="tab"]')).filter(function (b) { return b.textContent.trim() === page; })[0]; if (tab) { tab.click(); RW.toast('Opened ' + page); return; } }
      RW.toast({ assistant: 'Opens the thread list with these threads first', prd: 'Opens the PRD Builder', scout: 'Opens Scout', system: 'Opens System status (the Ready item), which owns services' }[g] || 'Opens ' + g);
      return;
    }
    if (t.hasAttribute('data-rw-procs')) {
      e.stopPropagation();
      ui.jump = t.getAttribute('data-rw-procs');
      if (RW.state.popVariant !== 'side') ui.tab = 'processes';
      ui.collapsed['p:' + ui.jump] = false; render(true); place(); paintItem(); return;
    }
    if (t.hasAttribute('data-rw-x')) { var id = t.getAttribute('data-rw-x'); ui.expanded[id] = !ui.expanded[id]; render(true); return; }
    if (t.hasAttribute('data-rw-subs')) { var a = t.getAttribute('data-rw-subs'); ui.subOpen[a] = !ui.subOpen[a]; render(true); return; }
    if (t.hasAttribute('data-rw-g')) { var g2 = t.getAttribute('data-rw-g'); ui.collapsed[g2] = !ui.collapsed[g2]; render(true); return; }
    if (t.hasAttribute('data-rw-tab2')) { ui.tab = t.getAttribute('data-rw-tab2'); ui.selected = null; render(); place(); paintItem(); return; }
    if (t.hasAttribute('data-rw-sort')) { var k = t.getAttribute('data-rw-sort'); ui.sort = [k, ui.sort[0] === k ? -ui.sort[1] : 1]; render(true); return; }
    if (t.hasAttribute('data-rw-sel')) { ui.selected = t.getAttribute('data-rw-sel'); render(true); return; }
    var p = t.getAttribute('data-rw-p');
    if (p === 'close') P.close();
    else if (p === 'float') { ui.floating = !ui.floating; render(true); place(); }
    else if (p === 'tab') RW.toast('Adds an Agents and processes tab to the Home panels: a tab kind beside Terminal, Problems, Output and Ports');
    else if (p === 'clear') RW.clearFinished();
    else if (p === 'stopall') P.confirmStopAll();
  });
  /* drag the floating window by its header */
  pop.addEventListener('pointerdown', function (e) {
    if (!ui.floating || !e.target.closest('[data-rw-drag]') || e.target.closest('button')) return;
    var sx = e.clientX, sy = e.clientY, ox = pop.offsetLeft, oy = pop.offsetTop;
    function mv(ev) { var x = ox + ev.clientX - sx, y = Math.max(0, oy + ev.clientY - sy); pop.style.left = x + 'px'; pop.style.top = y + 'px'; pop.style.setProperty('--rw-fx', x + 'px'); pop.style.setProperty('--rw-fy', y + 'px'); }
    function up() { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); }
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  });
  doc.addEventListener('pointerdown', function (e) {
    if (!ui.open || ui.floating) return;
    if (pop.contains(e.target) || group.contains(e.target) || (e.target.closest && e.target.closest('.rw-dialog-scrim,#pmn-lab,#rw-lab'))) return;
    P.close();
  }, true);
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ui.open && !doc.querySelector('.rw-dialog-scrim')) P.close(); });

  P.confirmStopAll = function () {
    var list = RW.sort(RW.items.filter(function (x) { return x.kind !== 'service' && (RW.isLive(x) || (x.kind === 'scheduled' && x.state === 'pending')) && !(x.kind === 'agent' && x.parent && RW.byId(x.parent) && RW.isLive(RW.byId(x.parent))); }));
    RW.ui.confirm({
      title: 'Stop work across Puppet Master?',
      lead: 'Choose what to stop. Stopping an agent also stops its subagents and the processes they started. System services keep running; System status owns them.',
      choice: [['procs', 'Processes and scheduled runs'], ['all', 'Agents too']],
      items: list, go: 'Stop',
      onGo: function (ids) { ids.forEach(function (id) { RW.stop(id); }); }
    });
  };
  /* What quitting does to running work. Server-owned work outlives the window (SIR §8.2); this asks once. */
  P.quit = function () {
    var c = counts();
    RW.ui.confirm({
      title: 'Quit Puppet Master?',
      lead: plural(c.agents, 'agent', 'agents') + ' and ' + plural(c.procs, 'process', 'processes') + ' are running. They run on your Puppet Master server, not in this window, so they can keep going and be here when you come back.',
      choice: [['keep', 'Keep it all running'], ['all', 'Stop everything']],
      items: RW.sort(RW.items.filter(function (x) { return x.kind !== 'service' && RW.isLive(x) && !(x.kind === 'agent' && x.parent); })),
      note: 'Untick anything you want to keep when you stop everything.', go: 'Quit', goWord: 'Quit and stop', goZero: 'Quit',
      onGo: function (ids) { RW.toast(ids.length ? 'Quit: stopped ' + ids.length + ' (concept)' : 'Quit: everything keeps running on the server (concept)'); }
    });
  };

  /* --------------------------------------------------------- staying put */
  RW.on(function (why) {
    paintItem();
    if (!ui.open) return;
    if (why === 'tick') {
      pop.querySelectorAll('[data-rw-time]').forEach(function (el) { var it = RW.byId(el.getAttribute('data-rw-time')); if (it) el.textContent = RW.time(it); });
      pop.querySelectorAll('[data-rw-cpu]').forEach(function (el) { var it = RW.byId(el.getAttribute('data-rw-cpu')); if (it && RW.isLive(it)) el.textContent = it.cpu + '%'; });
      pop.querySelectorAll('[data-rw-tail]').forEach(function (el) {
        var it = RW.byId(el.getAttribute('data-rw-tail')); if (!it || !it.tail) return;
        var pre = el.querySelector('pre'), txt = it.tail.slice(-6).join('\n');
        if (pre && pre.textContent !== txt) { var tmp = doc.createElement('div'); tmp.innerHTML = RW.ui.tail(it, 6); el.replaceWith(tmp.firstChild); }
      });
      return;
    }
    render(true); place();
  });
  setInterval(function () { placeItem(); paintItem(); if (ui.open) place(); }, 700);
  window.addEventListener('resize', function () { if (ui.open) place(); });
  placeItem(); paintItem();
  P.ui = ui;
  if (window.RW_OPEN === 'platform') setTimeout(function () { P.open('agents'); }, 700);
})();
