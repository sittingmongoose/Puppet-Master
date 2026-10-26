/* rw-platform.js — Running work in the status bar (Background activity concept, Opus 5.5).
 *
 * One status-bar item says how much is running across all of Puppet Master and whether anything needs you; clicking
 * it pops out one panel with every agent and subagent (Assistant threads, the Orchestrator, the Planning Wizard, the
 * PRD Builder, Scout) and every process, script and scheduled run, plus a read-only mirror of system services. It
 * reads the same store as the chat's Running domain (rw-data.js) and uses the same detail block (RW.ui.detail).
 *
 * Three layouts for the pop-out, switched in the lab: "surface" (grouped by where the work lives), "triage" (one
 * list, tabs by state, needs-you first) and "table" (a task manager: sortable columns and an inspector).
 */
(function () {
  'use strict';
  var RW = window.RW;
  if (!RW || !RW.ui || window.RW_PLATFORM) return;
  var P = window.RW_PLATFORM = {};
  var esc = RW.esc, doc = document;
  var ui = { open: false, floating: false, expanded: {}, subOpen: {}, collapsed: { system: true }, tab: null, sort: ['rank', 1], selected: null, filter: 'all' };

  /* ---------------------------------------------------------- counting */
  function counts() {
    var c = { agents: 0, procs: 0, needs: 0, sched: 0, done: 0, failed: 0, services: 0 };
    RW.items.forEach(function (x) {
      if (x.kind === 'service') { if (RW.isLive(x)) c.services++; return; }
      if (x.kind === 'scheduled') { if (x.state === 'pending') c.sched++; else if (RW.isDone(x)) c.done++; return; }
      if (RW.needsYou(x)) c.needs++;
      if (RW.isLive(x)) { if (x.kind === 'agent') c.agents++; else c.procs++; }
      else if (RW.isDone(x)) { c.done++; if (x.state === 'failed' || x.state === 'warning') c.failed++; }
    });
    return c;
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function sumText(c) {
    var p = [];
    if (c.agents) p.push(plural(c.agents, 'agent', 'agents'));
    if (c.procs) p.push(plural(c.procs, 'process', 'processes'));
    if (c.sched) p.push(c.sched + ' scheduled');
    return p.length ? p.join(' · ') : 'Nothing running';
  }

  /* --------------------------------------------------- the status bar item */
  var item = doc.createElement('button');
  item.type = 'button';
  item.className = 'pm7-statusitem rw-sb';
  item.setAttribute('data-rw-sb', 'running');
  item.setAttribute('aria-haspopup', 'dialog');
  item.setAttribute('aria-controls', 'rw-pop');
  function paintItem() {
    var c = counts(), v = RW.state.barVariant, h = '';
    var live = c.agents + c.procs;
    item.setAttribute('data-tone', c.needs ? 'attention' : (live ? 'working' : 'idle'));
    item.setAttribute('data-variant', v);
    item.setAttribute('aria-expanded', String(ui.open));
    item.classList.toggle('is-open', ui.open);
    var needs = c.needs ? '<span class="rw-sb-needs">' + RW.st('waiting', 10) + '<strong>' + c.needs + '</strong>' + (v === 'marks' ? '' : ' need' + (c.needs === 1 ? 's' : '') + ' you') + '</span>' : '';
    if (!live && !c.sched) h = RW.st('idle', 10) + '<span class="rw-dim">Nothing running</span>';
    else if (v === 'words') h = RW.st('working', 10) + '<span>' + (c.agents ? '<strong>' + c.agents + '</strong> ' + (c.agents === 1 ? 'agent' : 'agents') : '') + (c.agents && c.procs ? ' · ' : '') + (c.procs ? '<strong>' + c.procs + '</strong> ' + (c.procs === 1 ? 'process' : 'processes') : '') + '</span>' + (needs ? '<span class="rw-sb-sep">·</span>' + needs : '');
    else if (v === 'marks') h = '<span class="rw-sb-seg" title="Agents running">' + RW.icon('robot', 11) + '<strong>' + c.agents + '</strong></span><span class="rw-sb-seg" title="Processes running">' + RW.icon('terminal', 11) + '<strong>' + c.procs + '</strong></span>' + (needs ? '<span class="rw-sb-seg">' + needs + '</span>' : '');
    else h = (c.needs ? needs + '<span class="rw-sb-sep">·</span>' : RW.st('working', 10)) + '<span>Running <strong>' + (live + c.sched) + '</strong></span>';
    if (RW.state.feed === 'stale') h += '<span class="rw-sb-sep">·</span>' + RW.st('offline', 10) + '<span class="rw-dim">stale</span>';
    if (item.getAttribute('data-html') !== h) { item.innerHTML = h; item.setAttribute('data-html', h); }
    item.setAttribute('data-pm-hover-label', 'Running work');
    item.setAttribute('data-pm-hover-detail', (live || c.sched ? sumText(c) + ' across Puppet Master' + (c.needs ? '; ' + c.needs + ' need' + (c.needs === 1 ? 's' : '') + ' you' : '') + '. Click to see them.' : 'Nothing is running. Click to see what finished recently.'));
    item.setAttribute('aria-label', 'Running work: ' + sumText(c) + (c.needs ? ', ' + c.needs + ' need you' : ''));
  }
  function placeItem() {
    var bar = doc.getElementById('pm7GlobalStatusBar');
    if (!bar) return;
    var sys = bar.querySelector('[data-status-action="system"]');
    var group = sys ? sys.parentNode : bar.querySelector('.pm7-statusbar-group');
    if (!group) return;
    if (item.parentNode !== group || item.previousElementSibling !== sys) group.insertBefore(item, sys ? sys.nextSibling : group.firstChild);
  }

  /* ------------------------------------------------------------- pop-out */
  var pop = doc.createElement('section');
  pop.id = 'rw-pop';
  pop.className = 'rw-pop';
  pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-modal', 'false'); pop.setAttribute('aria-label', 'Running across Puppet Master');
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
  function ofThread(thr) { return RW.items.filter(function (x) { return x.thread === thr && x.kind !== 'agent'; }); }
  function agentBlock(a, depth) {
    var h = rowHtml(a, depth, { owner: false });
    var subs = RW.sort(RW.items.filter(function (x) { return x.parent === a.id; }));
    var own = RW.sort(RW.items.filter(function (x) { return x.owner === a.id || (a.role === 'main' && a.thread && x.thread === a.thread && x.kind !== 'agent' && !x.owner); }));
    own.forEach(function (p) { h += rowHtml(p, depth + 1, { owner: false }); });
    if (subs.length) {
      var live = subs.filter(RW.isLive), by = {};
      subs.forEach(function (s) { var w = RW.word(s).toLowerCase(); by[w] = (by[w] || 0) + 1; });
      var open = !!ui.subOpen[a.id];
      h += '<button type="button" class="rw-subs" style="--d:' + (depth + 1) + '" data-rw-subs="' + esc(a.id) + '" aria-expanded="' + open + '">' + RW.icon(open ? 'chevron-down' : 'arrow-right', 10) + '<span>' + plural(subs.length, 'subagent', 'subagents') + ': ' + Object.keys(by).map(function (k) { return by[k] + ' ' + k; }).join(', ') + '</span></button>';
      if (open) subs.forEach(function (s) {
        h += rowHtml(s, depth + 1, { owner: false });
        RW.sort(RW.items.filter(function (x) { return x.owner === s.id; })).forEach(function (p) { h += rowHtml(p, depth + 2, { owner: false }); });
      });
      else {
        /* a subagent's process that needs you never hides behind a collapsed row (F3-472 blocked-outside) */
        subs.forEach(function (s) { RW.items.filter(function (x) { return x.owner === s.id && RW.needsYou(x); }).forEach(function (p) { h += rowHtml(p, depth + 1, { owner: true }); }); });
        subs.filter(RW.needsYou).forEach(function (s) { h += rowHtml(s, depth + 1, { owner: false }); });
      }
      void live;
    }
    return h;
  }
  function bodySurface() {
    var h = '';
    RW.SURFACES.forEach(function (sf) {
      var key = sf[0], list = RW.items.filter(function (x) { return x.surface === key; });
      if (!list.length) return;
      if (ui.filter === 'needs' && !list.some(RW.needsYou)) return;
      var c = { a: 0, p: 0, n: 0 };
      list.forEach(function (x) { if (RW.needsYou(x)) c.n++; if (RW.isLive(x)) { if (x.kind === 'agent') c.a++; else c.p++; } });
      var col = !!ui.collapsed[key];
      h += '<section class="rw-group" data-surface="' + key + '"><button type="button" class="rw-ghead" data-rw-g="' + key + '" aria-expanded="' + !col + '">' +
        RW.icon(col ? 'arrow-right' : 'chevron-down', 10) + RW.icon(sf[2], 13) + '<strong>' + sf[1] + '</strong><span class="rw-gsum">' +
        [c.a ? plural(c.a, key === 'system' ? 'service' : 'agent', key === 'system' ? 'services' : 'agents') : '', c.p ? plural(c.p, 'process', 'processes') : ''].filter(Boolean).join(' · ') +
        (c.n ? ' · <b data-tone="attention">' + c.n + ' need' + (c.n === 1 ? 's' : '') + ' you</b>' : '') + '</span><span class="rw-gopen" data-rw-goto="' + key + '">' + (key === 'system' ? 'System status' : 'Open') + '</span></button>';
      if (!col) {
        var tops = RW.sort(list.filter(function (x) { return (x.kind === 'agent' && x.role === 'main') || x.kind === 'service'; }));
        var stray = RW.sort(list.filter(function (x) { return x.kind === 'agent' && x.role !== 'main' && !RW.byId(x.parent); }));
        if (ui.filter === 'needs') tops = tops.filter(function (a) { return RW.needsYou(a) || RW.items.some(function (x) { return (x.parent === a.id || x.thread === a.thread && a.thread) && RW.needsYou(x); }) || RW.items.some(function (x) { var o = RW.byId(x.owner); return o && o.parent === a.id && RW.needsYou(x); }); });
        tops.concat(stray).forEach(function (a) { h += a.kind === 'service' ? rowHtml(a, 0) : agentBlock(a, 0); });
        if (key === 'system') h += '<p class="rw-note rw-dim">A mirror of System status. Services are started and stopped there, never from here.</p>';
      }
      h += '</section>';
    });
    return h || '<div class="rw-empty">Nothing needs you.</div>';
  }
  var TRIAGE = [['needs', 'Needs you'], ['running', 'Running'], ['scheduled', 'Scheduled'], ['finished', 'Finished']];
  function triageList(tab) {
    return RW.sort(RW.items.filter(function (x) {
      if (x.kind === 'service') return false;
      if (tab === 'needs') return RW.needsYou(x);
      if (tab === 'running') return RW.isLive(x) && !RW.needsYou(x);
      if (tab === 'scheduled') return (x.kind === 'scheduled' && x.state === 'pending') || (x.kind === 'agent' && x.state === 'pending');
      return RW.isDone(x);
    }));
  }
  function bodyTriage() {
    if (!ui.tab || !TRIAGE.some(function (t) { return t[0] === ui.tab; })) ui.tab = triageList('needs').length ? 'needs' : 'running';
    var list = triageList(ui.tab);
    if (!list.length) return '<div class="rw-empty">' + { needs: 'Nothing needs you right now.', running: 'Nothing is running.', scheduled: 'Nothing is scheduled.', finished: 'Nothing has finished yet.' }[ui.tab] + '</div>';
    return list.map(function (x) { return rowHtml(x, 0, { where: true }); }).join('');
  }
  var COLS = [['title', 'Name'], ['where', 'Where'], ['rank', 'State'], ['time', 'Time'], ['cpu', 'CPU'], ['mem', 'Memory'], ['ports', 'Port']];
  function bodyTable() {
    if (!ui.tab || ['agents', 'procs', 'services'].indexOf(ui.tab) < 0) ui.tab = 'procs';
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
  function tabsHtml() {
    var v = RW.state.popVariant, tabs = [];
    if (v === 'triage') tabs = TRIAGE.map(function (t) { return [t[0], t[1], triageList(t[0]).length]; });
    else if (v === 'table') tabs = [['agents', 'Agents', RW.items.filter(function (x) { return x.kind === 'agent' && RW.isLive(x); }).length], ['procs', 'Processes', RW.items.filter(function (x) { return x.kind === 'process' && RW.isLive(x); }).length], ['services', 'Services', RW.items.filter(function (x) { return x.kind === 'service'; }).length]];
    else return '<div class="rw-pop-tabs rw-seg" role="group" aria-label="Show">' + [['all', 'Everything'], ['needs', 'Needs you']].map(function (t) { return '<button type="button" data-rw-filter="' + t[0] + '" aria-pressed="' + (ui.filter === t[0]) + '">' + t[1] + (t[0] === 'needs' ? ' <span class="rw-n">' + counts().needs + '</span>' : '') + '</button>'; }).join('') + '</div>';
    return '<div class="rw-pop-tabs rw-seg" role="tablist">' + tabs.map(function (t) {
      return '<button type="button" role="tab" data-rw-tab2="' + t[0] + '" aria-selected="' + (ui.tab === t[0]) + '" aria-pressed="' + (ui.tab === t[0]) + '"' + (t[0] === 'needs' && t[2] ? ' data-tone="attention"' : '') + '>' + t[1] + ' <span class="rw-n">' + t[2] + '</span></button>';
    }).join('') + '</div>';
  }
  function render(keep) {
    var sc = pop.querySelector('.rw-pop-body'), top = sc ? sc.scrollTop : 0;
    var c = counts(), v = RW.state.popVariant;
    if (v === 'triage') bodyTriage(); /* settles ui.tab before the tabs draw */
    if (v === 'table') { if (!ui.tab || ['agents', 'procs', 'services'].indexOf(ui.tab) < 0) ui.tab = 'procs'; }
    pop.setAttribute('data-variant', v);
    pop.classList.toggle('is-floating', ui.floating);
    var body = v === 'triage' ? bodyTriage() : v === 'table' ? bodyTable() : bodySurface();
    var cpu = 0, mem = 0;
    RW.items.forEach(function (x) { if (RW.isLive(x) && x.kind !== 'agent') { cpu += x.cpu || 0; mem += x.mem || 0; } });
    pop.innerHTML = '<header class="rw-pop-head" data-rw-drag="1">' + RW.icon(RW.state.icon, 14) + '<strong>Running across Puppet Master</strong>' +
      '<span class="rw-pop-sum">' + esc(sumText(c)) + (c.needs ? ' · <b data-tone="attention">' + c.needs + ' need' + (c.needs === 1 ? 's' : '') + ' you</b>' : '') + '</span><span class="rw-grow"></span>' +
      '<button type="button" class="icon-button rw-ib" data-rw-p="tab" title="Open as a panel tab on Home" aria-label="Open as a panel tab">' + RW.icon('panel', 13) + '</button>' +
      '<button type="button" class="icon-button rw-ib" data-rw-p="float" aria-pressed="' + ui.floating + '" title="' + (ui.floating ? 'Dock back to the status bar' : 'Pop out to a floating window') + '" aria-label="Pop out">' + RW.icon(ui.floating ? 'arrow-down' : 'open', 13) + '</button>' +
      '<button type="button" class="icon-button rw-ib" data-rw-p="close" title="Close" aria-label="Close">' + RW.icon('close', 13) + '</button></header>' +
      (RW.state.restarted ? '<div class="rw-strip" data-tone="attention">' + RW.st('warning', 12) + '<span>Puppet Master restarted 2m ago. 2 processes ended while it was closed; each agent was told once.</span></div>' : '') +
      (RW.state.feed === 'stale' ? '<div class="rw-strip" data-tone="attention">' + RW.st('offline', 12) + '<span>Showing what was known 40s ago. Reconnecting to the server; nothing has been stopped.</span></div>' : '') +
      tabsHtml() + '<div class="rw-pop-body">' + body + '</div>' +
      '<footer class="rw-pop-foot"><button type="button" class="rw-link" data-rw-p="clear">Clear finished</button>' +
      (v === 'table' ? '<span class="rw-dim rw-res">Work started by Puppet Master: CPU ' + cpu + '% · memory ' + (mem / 1000).toFixed(1) + ' GB · sampled every 2 s while this is open</span>' : '<span class="rw-grow"></span>') +
      '<button type="button" class="rw-btn danger" data-rw-p="stopall"' + (c.agents + c.procs + c.sched ? '' : ' disabled') + '>Stop all…</button></footer>';
    if (keep) { var s2 = pop.querySelector('.rw-pop-body'); if (s2) s2.scrollTop = top; }
  }
  function place() {
    if (pop.parentNode !== doc.body) doc.body.appendChild(pop);
    if (ui.floating) {
      if (!pop.style.getPropertyValue('--rw-fx')) { pop.style.setProperty('--rw-fx', Math.round(innerWidth / 2 - 380) + 'px'); pop.style.setProperty('--rw-fy', '90px'); }
      pop.style.left = pop.style.getPropertyValue('--rw-fx'); pop.style.top = pop.style.getPropertyValue('--rw-fy'); pop.style.bottom = 'auto';
      return;
    }
    var bar = doc.getElementById('pm7GlobalStatusBar'), br = bar ? bar.getBoundingClientRect() : { top: innerHeight - 25 }, ir = item.getBoundingClientRect();
    var w = pop.offsetWidth || 560;
    pop.style.left = Math.max(8, Math.min(ir.left - 6, innerWidth - w - 8)) + 'px';
    pop.style.top = 'auto';
    pop.style.bottom = Math.round(innerHeight - br.top + 6) + 'px';
  }
  P.open = function () { ui.open = true; pop.hidden = false; render(); place(); paintItem(); setTimeout(function () { var b = pop.querySelector('.rw-pop-tabs button[aria-pressed="true"]') || pop.querySelector('.rw-ib'); if (b) b.focus({ preventScroll: true }); }, 0); };
  P.close = function () { ui.open = false; pop.hidden = true; paintItem(); item.focus({ preventScroll: true }); };
  P.toggle = function () { if (ui.open) P.close(); else P.open(); };

  item.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); P.toggle(); });
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
    if (t.hasAttribute('data-rw-x')) { var id = t.getAttribute('data-rw-x'); ui.expanded[id] = !ui.expanded[id]; render(true); return; }
    if (t.hasAttribute('data-rw-subs')) { var a = t.getAttribute('data-rw-subs'); ui.subOpen[a] = !ui.subOpen[a]; render(true); return; }
    if (t.hasAttribute('data-rw-g')) { var g2 = t.getAttribute('data-rw-g'); ui.collapsed[g2] = !ui.collapsed[g2]; render(true); return; }
    if (t.hasAttribute('data-rw-tab2')) { ui.tab = t.getAttribute('data-rw-tab2'); ui.selected = null; render(); return; }
    if (t.hasAttribute('data-rw-filter')) { ui.filter = t.getAttribute('data-rw-filter'); render(); return; }
    if (t.hasAttribute('data-rw-sort')) { var k = t.getAttribute('data-rw-sort'); ui.sort = [k, ui.sort[0] === k ? -ui.sort[1] : 1]; render(true); return; }
    if (t.hasAttribute('data-rw-sel')) { ui.selected = t.getAttribute('data-rw-sel'); render(true); return; }
    var p = t.getAttribute('data-rw-p');
    if (p === 'close') P.close();
    else if (p === 'float') { ui.floating = !ui.floating; render(true); place(); }
    else if (p === 'tab') RW.toast('Adds a Running tab to the Home panels: a tab kind beside Terminal, Problems, Output and Ports');
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
    if (pop.contains(e.target) || item.contains(e.target) || (e.target.closest && e.target.closest('.rw-dialog-scrim,#pmn-lab,#rw-lab'))) return;
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
      lead: sumText(c) + ' are running. They run on your Puppet Master server, not in this window, so they can keep going and be here when you come back.',
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
  if (window.RW_OPEN === 'platform') setTimeout(P.open, 700);
})();
