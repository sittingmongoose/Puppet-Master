/* rw-thread.js — the chat's Running domain (Background activity concept, Opus 5.5).
 *
 * A tenth Activity-bar domain, "Running", with the same three parts every domain has: the icon in the Activity bar,
 * its hover card, and its view in Activity Detail. It lists what THIS thread has running: processes and scripts the
 * thread's agent or its subagents started (dev servers, watchers, tests, builds, browser sessions), scheduled runs,
 * and what finished this session. Subagents stay in the Subagents domain; here they appear only as the owner of a
 * process, linked back to their own domain (DRY: one domain per thing).
 *
 * How it lives inside PMConcept7 without editing it: the chat re-renders its tree with a keyed reconcile (pmPatch),
 * so the injected button and the Activity Detail tab carry a data-k the chat does not know; the reconcile removes
 * them and a MutationObserver puts the same nodes back before the next paint. The hover card and the Running view of
 * Activity Detail are this file's own nodes, drawn with the chat's own classes so every look applies.
 */
(function () {
  'use strict';
  var RW = window.RW;
  if (!RW || window.RW_THREAD) return;
  var T = window.RW_THREAD = {};
  var esc = RW.esc;
  var ui = { open: false, pinned: false, expanded: {}, selected: null, hoverOpen: false, showAll: false };
  var doc = document;

  /* ------------------------------------------------------------ the data */
  function mine() { return RW.items.filter(function (x) { return x.thread === RW.state.thread && x.kind !== 'agent'; }); }
  function counts() {
    var l = mine(), c = { live: 0, needs: 0, sched: 0, done: 0, failed: 0, lost: 0, procs: 0 };
    l.forEach(function (x) {
      if (x.kind === 'scheduled' && x.state === 'pending') c.sched++;
      else if (RW.isLive(x)) { c.live++; if (RW.needsYou(x)) c.needs++; }
      else if (RW.isDone(x)) { c.done++; if (x.state === 'failed') c.failed++; if (x.state === 'warning') c.lost++; }
    });
    return c;
  }
  function tone(c) { return c.needs || c.lost ? 'attention' : (c.failed ? 'blocked' : (c.live ? 'working' : 'idle')); }
  function summary(c) {
    var p = [];
    if (c.live) p.push(c.live + ' running' + (c.needs ? ', ' + c.needs + ' needs you' : ''));
    if (c.sched) p.push(c.sched + ' scheduled');
    if (c.done) { var why = [c.failed ? c.failed + ' failed' : '', c.lost ? c.lost + ' lost' : ''].filter(Boolean).join(', '); p.push(c.done + ' finished' + (why ? ' (' + why + ')' : '')); }
    return p.length ? p.join(' · ') : 'Nothing has run in this thread.';
  }

  /* --------------------------------------------- the Activity-bar button */
  var btn = doc.createElement('button');
  btn.type = 'button';
  btn.className = 'activity-item rw-ab-item';
  btn.setAttribute('data-k', 'rw-running');
  btn.setAttribute('data-rw-domain', 'running');
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.setAttribute('aria-controls', 'rw-activity-detail');
  btn.setAttribute('data-pm-hover-visual-suppressed', 'true');
  function paintButton() {
    var c = counts();
    btn.setAttribute('data-tone', tone(c));
    btn.setAttribute('aria-label', 'Running activity, ' + c.live + ' running' + (c.needs ? ', ' + c.needs + ' needs you' : ''));
    btn.setAttribute('aria-expanded', ui.open ? 'true' : 'false');
    btn.classList.toggle('active', ui.open);
    var html = RW.icon(RW.state.icon, 12, 'nx nx-r-concept rw-ab-icon') + '<span class="label">Running</span><span class="count">' + c.live + '</span>';
    if (btn.getAttribute('data-html') !== html) { btn.innerHTML = html; btn.setAttribute('data-html', html); }
  }
  function realBar() { return doc.querySelector('.pm56-activity-bar'); }
  function placeButton() {
    var bar = realBar();
    if (!bar) return;
    var c = counts();
    var show = c.live || c.sched || c.done || RW.state.alwaysShow;
    if (!show) { if (btn.parentNode) btn.parentNode.removeChild(btn); return; }
    /* After Subagents: the compaction tiers drop the right-hand domains first, and Running is not a file-level one. */
    var after = bar.querySelector('.activity-item[data-domain="subagents"]') || bar.querySelector('.activity-item[data-domain="todo"]') || bar.querySelector('.activity-item[data-domain="goal"]');
    var ref = after ? after.nextSibling : bar.firstChild;
    if (btn.parentNode !== bar || (after && btn.previousSibling !== after) || (!after && bar.firstChild !== btn)) bar.insertBefore(btn, ref);
  }

  /* ------------------------------------- the tab inside Activity Detail */
  function placeTab() {
    var filt = doc.querySelector('#pmRoot .activity-panel .activity-filter');
    if (!filt) return;
    var tab = filt.querySelector('[data-rw-tab]');
    if (!tab) {
      tab = doc.createElement('button');
      tab.setAttribute('data-k', 'rw-tab'); tab.setAttribute('data-rw-tab', 'running');
      tab.setAttribute('aria-pressed', 'false'); tab.setAttribute('data-hover-tip', 'Running');
      tab.innerHTML = RW.icon(RW.state.icon, 12, 'nx nx-r-concept') + '<span>Running</span>';
    }
    var after = filt.querySelector('[data-domain="subagents"]') || filt.querySelector('[data-domain="todo"]');
    var ref = after ? after.nextSibling : filt.firstChild;
    if (tab.parentNode !== filt || (after && tab.previousSibling !== after)) filt.insertBefore(tab, ref);
    filt.style.setProperty('--activity-n', String(filt.querySelectorAll('button').length));
  }

  /* ------------------------------------------------------------- layers */
  function layerFor(host, id, cls) {
    var l = doc.getElementById(id);
    if (!l && host) { l = doc.createElement('div'); l.id = id; l.className = 'rw-layer ' + (cls || ''); host.appendChild(l); }
    return l;
  }
  function rel(layer, r) { var b = layer.getBoundingClientRect(); return { left: r.left - b.left, top: r.top - b.top, right: r.right - b.left, bottom: r.bottom - b.top, width: r.width, height: r.height }; }

  /* ---------------------------------------------------------- hover card */
  var card = doc.createElement('div');
  card.className = 'hover-card ab-card rw-card';
  card.id = 'rw-running-preview';
  card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'false'); card.setAttribute('aria-label', 'Running activity preview');
  card.setAttribute('data-domain', 'running');
  var hoverT = null, leaveT = null, lastXY = [0, 0];
  doc.addEventListener('pointermove', function (e) { lastXY = [e.clientX, e.clientY]; }, true);
  function inRect(el) { if (!el || !el.isConnected) return false; var r = el.getBoundingClientRect(); return lastXY[0] >= r.left - 2 && lastXY[0] <= r.right + 2 && lastXY[1] >= r.top - 2 && lastXY[1] <= r.bottom + 2; }
  function rowHtml(it, opts) {
    opts = opts || {};
    var owner = it.owner ? RW.ownerName(it) : '';
    var sub = it.ask && RW.needsYou(it) ? it.ask : (it.lost ? 'Ended while Puppet Master was closed' : [owner, it.kind === 'scheduled' ? it.detail : (it.ports && it.ports.length ? it.command + ' · :' + it.ports.join(', :') : it.command)].filter(Boolean).join(' · '));
    var t = RW.tone(it);
    return '<button type="button" class="ab-row" data-k="rw:' + esc(it.id) + '" data-state="' + t + '" data-rw-open="' + esc(it.id) + '" title="Open ' + esc(it.title) + '">' +
      '<span class="ab-row-copy"><b>' + esc(it.title) + '</b><i>' + esc(sub) + '</i></span>' +
      '<span class="ab-row-right"><b data-tone="' + t + '">' + esc(RW.word(it)) + '</b><i data-rw-time="' + esc(it.id) + '">' + esc(RW.time(it)) + '</i></span></button>';
  }
  function renderCard() {
    var c = counts(), list = RW.sort(mine()), shown = list.slice(0, 5);
    card.setAttribute('data-tone', tone(c));
    var meta = c.live ? c.live + ' running' : (c.sched ? c.sched + ' scheduled' : 'none running');
    var body = shown.length ? shown.map(function (x) { return rowHtml(x); }).join('') : '<div class="ab-empty">Nothing is running in this thread. Commands, servers and scripts its agents start show up here.</div>';
    card.innerHTML = '<button type="button" class="ab-head" data-rw-act="open-detail">' +
      '<span class="ab-head-icon" data-tone="' + tone(c) + '">' + RW.icon(RW.state.icon, 13, 'nx nx-r-concept') + '</span>' +
      '<strong>Running</strong><span class="ab-head-meta">' + esc(meta) + '</span></button>' +
      (RW.state.feed === 'stale' ? '<div class="rw-strip" data-tone="attention">' + RW.st('offline', 11) + '<span>Last known 40s ago · reconnecting</span></div>' : '') +
      '<div class="ab-body">' + body + (list.length > shown.length ? '<div class="ab-more">+' + (list.length - shown.length) + ' more</div>' : '') + '</div>' +
      (c.needs ? '<div class="rw-card-foot">' + RW.st('waiting', 11) + '<span>' + c.needs + ' needs you. Open to answer.</span></div>' : '');
  }
  function showCard() {
    if (ui.open) return;
    ensureLayers();
    var layer = layerFor(doc.getElementById('pm56-layers'), 'rw-chat-hover', 'pm56-host pm56-overlay');
    if (!layer) return;
    if (card.parentNode !== layer) layer.appendChild(card);
    renderCard();
    card.hidden = false;
    var r = rel(layer, btn.getBoundingClientRect()), cw = card.offsetWidth || 360;
    var stage = doc.querySelector('.chat-stage'), sr = stage ? rel(layer, stage.getBoundingClientRect()) : null;
    var left = Math.round(r.left + r.width / 2 - cw / 2);
    if (sr) left = Math.max(sr.left + 8, Math.min(left, sr.right - cw - 8));
    card.style.left = left + 'px';
    card.style.top = Math.round(r.top - card.offsetHeight - 8) + 'px';
    ui.hoverOpen = true;
  }
  function hideCard() { card.hidden = true; ui.hoverOpen = false; }
  btn.addEventListener('pointerenter', function () { clearTimeout(leaveT); clearTimeout(hoverT); hoverT = setTimeout(showCard, 220); });
  btn.addEventListener('pointerleave', function () {
    clearTimeout(hoverT);
    leaveT = setTimeout(function () { if (!inRect(btn) && !inRect(card)) hideCard(); }, 260);
  });
  card.addEventListener('pointerenter', function () { clearTimeout(leaveT); });
  card.addEventListener('pointerleave', function () { leaveT = setTimeout(function () { if (!inRect(btn) && !inRect(card)) hideCard(); }, 260); });

  /* ------------------------------------------------ the Activity Detail view */
  var panel = doc.createElement('aside');
  panel.id = 'rw-activity-detail';
  panel.className = 'activity-panel transient rw-panel';
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'false'); panel.setAttribute('aria-label', 'Activity Detail: Running');
  panel.setAttribute('data-domain', 'running'); panel.setAttribute('data-scope', 'focus');
  panel.hidden = true;
  var DOMAINS = [['goal', 'Goal'], ['todo', 'Todo'], ['subagents', 'Subagents'], ['crew', 'Crew'], ['brainstorm', 'BrainStorm'], ['review', 'Review'], ['chat_room', 'Chat Room'], ['changes', 'Changes'], ['artifacts', 'Artifacts']];
  function liveDomains() {
    var bar = realBar(), have = {};
    if (bar) bar.querySelectorAll('.activity-item[data-domain]').forEach(function (b) { have[b.getAttribute('data-domain')] = b; });
    return DOMAINS.filter(function (d) { return have[d[0]]; }).map(function (d) { return [d[0], d[1], have[d[0]]]; });
  }
  function headHtml() {
    var c = counts();
    var tabs = liveDomains(), out = [], at = -1;
    tabs.forEach(function (d, i) {
      var svg = d[2].querySelector('svg'); svg = svg ? svg.outerHTML : '';
      out.push('<button type="button" data-rw-domain-jump="' + d[0] + '" aria-pressed="false" data-hover-tip="' + d[1] + '">' + svg + '<span>' + d[1] + '</span></button>');
      if (d[0] === 'goal' || d[0] === 'todo' || d[0] === 'subagents') at = i;
    });
    out.splice(at + 1, 0, runTab());
    return '<div class="activity-panel-head"><span class="event-icon activity-head-icon" data-tone="' + tone(c) + '">' + RW.icon(RW.state.icon, 13, 'nx nx-r-concept') + '</span>' +
      '<strong>Activity Detail</strong><span class="spacer"></span>' +
      '<button type="button" class="icon-button' + (ui.pinned ? ' is-pinned' : '') + '" data-rw-act="pin" aria-pressed="' + ui.pinned + '" aria-label="' + (ui.pinned ? 'Unpin' : 'Pin') + ' Activity Detail" title="' + (ui.pinned ? 'Unpin: float over the thread again' : 'Pin to the left of the thread') + '">' + RW.icon('pin', 13) + '</button>' +
      '<button type="button" class="icon-button" data-rw-act="close" aria-label="Close Activity Detail" title="Close">' + RW.icon('close', 13) + '</button></div>' +
      '<div class="activity-filter" role="toolbar" aria-label="Activity domains" style="--activity-n:' + (tabs.length + 1) + '">' + out.join('') + '</div>';
  }
  function runTab() { return '<button type="button" class="active" data-rw-self="1" aria-pressed="true" data-hover-tip="Running">' + RW.icon(RW.state.icon, 12, 'nx nx-r-concept') + '<span>Running</span></button>'; }

  /* One detail block, shared with the status bar's pop-out (rw-platform.js): the same facts, the same actions. */
  RW.ui = RW.ui || {};
  RW.ui.detail = function (it, where) {
    var n = Date.now(), facts = [];
    if (it.command) facts.push(['Command', '<code>' + esc(it.command) + '</code>']);
    if (it.cwd) facts.push(['Folder', '<code>' + esc(it.cwd) + '</code>']);
    if (it.pid || (it.ports && it.ports.length)) facts.push(['Process', (it.pid ? 'pid ' + it.pid : '') + (it.ports && it.ports.length ? ' · port ' + it.ports.map(function (p) { return '<button type="button" class="rw-link" data-rw-port="' + p + '">' + p + '</button>'; }).join(', ') : '')]);
    if (it.kind === 'scheduled') facts.push(['Runs', 'at ' + RW.clock(it.at) + ' (' + RW.time(it) + ') · ' + esc(it.detail || '')]);
    else if (it.startedAt) facts.push(['Started', RW.clock(it.startedAt) + ' · by ' + (it.owner ? '<button type="button" class="rw-link" data-rw-owner="' + esc(it.owner) + '">' + esc(RW.ownerName(it)) + '</button>' : esc(RW.ownerName(it) || it.where || ''))]);
    if (where) facts.push(['Where', esc(it.where || '') + (it.surface ? ' · ' + esc(surfaceName(it.surface)) : '')]);
    if (it.progress && RW.isLive(it)) facts.push(['Progress', it.progress.done + ' of ' + it.progress.total + ' ' + esc(it.progress.unit) + ' <span class="rw-dim">(' + (it.progress.source === 'measured' ? 'measured' : 'reported by the tool') + ')</span>']);
    if (RW.isDone(it)) facts.push(['Ended', (it.exit != null ? 'exit ' + it.exit + ' · ' : (it.state === 'warning' ? 'no exit code · ' : '')) + RW.short(n - (it.endedAt || n)) + ' ago' + (it.stoppedBy ? ' · stopped by ' + esc(it.stoppedBy) : '')]);
    if (it.kind === 'process' || it.kind === 'scheduled') {
      facts.push(['When it ends', '<span class="rw-seg" role="group" aria-label="When it ends">' + [['agent', 'Tell the agent'], ['me', 'Notify me'], ['quiet', 'Quiet']].map(function (o) {
        return '<button type="button" data-rw-report="' + o[0] + '" aria-pressed="' + (it.report === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</span>']);
      if (it.kind === 'process') facts.push(['The reply', it.waits ? 'waits for this to finish' : 'can finish while this keeps running']);
    }
    var h = '<div class="rw-detail" data-rw-detail="' + esc(it.id) + '">';
    if (RW.needsYou(it) && it.ask) {
      h += '<div class="rw-ask"><span class="rw-ask-q">' + RW.st('waiting', 12) + '<b>' + esc(it.ask) + '</b></span><span class="rw-ask-a">' +
        (it.quick || []).map(function (q, i) { return '<button type="button" class="rw-btn' + (i === 0 ? ' rw-primary' : '') + '" data-rw-answer="' + esc(q) + '">' + esc(q) + '</button>'; }).join('') +
        (it.kind === 'process' ? '<button type="button" class="rw-btn" data-rw-act="terminal">Answer in Terminal</button>' : '<button type="button" class="rw-btn rw-primary" data-rw-act="goto">Answer</button>') + '</span></div>';
    }
    if (it.lost) h += '<p class="rw-note">' + RW.st('warning', 11) + esc(it.lost) + '</p>';
    if (it.detail && it.kind !== 'scheduled') h += '<p class="rw-what">' + esc(it.detail) + '</p>';
    h += '<dl class="rw-facts">' + facts.map(function (f) { return '<dt>' + f[0] + '</dt><dd>' + f[1] + '</dd>'; }).join('') + '</dl>';
    if (it.tail && it.tail.length) h += tailHtml(it);
    var acts = [];
    if (it.kind === 'process') acts.push('<button type="button" class="rw-btn" data-rw-act="terminal">Open in Terminal</button>', '<button type="button" class="rw-btn" data-rw-act="copy">Copy command</button>');
    if (it.ports && it.ports.length && RW.isLive(it)) acts.push('<button type="button" class="rw-btn" data-rw-port="' + it.ports[0] + '">Open :' + it.ports[0] + '</button>');
    if ((it.role === 'server' || it.role === 'db' || it.role === 'watcher') && it.kind === 'process') acts.push('<button type="button" class="rw-btn" data-rw-act="restart">Restart</button>');
    if (RW.isDone(it) && it.kind === 'process') acts.push('<button type="button" class="rw-btn" data-rw-act="rerun">Run again</button>');
    if (it.kind === 'agent') acts.push('<button type="button" class="rw-btn" data-rw-act="goto">Open ' + esc(it.surface === 'assistant' ? 'thread' : surfaceName(it.surface)) + '</button>');
    if (RW.isLive(it) || (it.kind === 'scheduled' && it.state === 'pending')) acts.push('<button type="button" class="rw-btn danger" data-rw-act="stop"' + (it.stopping ? ' disabled' : '') + '>' + (it.stopping ? 'Stopping…' : (it.kind === 'scheduled' ? 'Cancel' : 'Stop')) + '</button>');
    if (acts.length) h += '<div class="rw-actions">' + acts.join('') + '</div>';
    return h + '</div>';
  };
  function surfaceName(s) { for (var i = 0; i < RW.SURFACES.length; i++) if (RW.SURFACES[i][0] === s) return RW.SURFACES[i][1]; return s; }
  RW.ui.surfaceName = surfaceName;
  function tailHtml(it, rows) {
    rows = rows || 6;
    var lines = it.tail.slice(-rows), earlier = (it.lines || it.tail.length) - lines.length;
    return '<div class="rw-tail" data-rw-tail="' + esc(it.id) + '">' + (earlier > 0 ? '<div class="rw-tail-more">' + earlier.toLocaleString() + ' earlier lines in the full log</div>' : '') +
      '<pre>' + lines.map(esc).join('\n') + '</pre></div>';
  }
  RW.ui.tail = tailHtml;

  function recordRow(it) {
    var t = RW.tone(it), owner = it.owner ? RW.ownerName(it) : '';
    var sub = it.ask && RW.needsYou(it) ? '<b class="rw-askline">' + esc(it.ask) + '</b>' :
      (owner && RW.state.threadVariant !== 'owner' ? '<u class="agent-model">' + esc(owner) + '</u> · ' : '') + esc(it.kind === 'scheduled' ? it.detail : it.command || it.detail || '') +
      (it.ports && it.ports.length && RW.isLive(it) ? ' · <span class="rw-port">:' + it.ports.join(', :') + '</span>' : '') +
      (it.progress && RW.isLive(it) ? ' · ' + it.progress.done + '/' + it.progress.total + ' ' + esc(it.progress.unit) : '');
    var open = !!ui.expanded[it.id];
    return '<div class="rw-rec' + (open ? ' is-open' : '') + (RW.state.feed === 'stale' ? ' is-stale' : '') + '" data-rw-rec="' + esc(it.id) + '">' +
      '<button type="button" class="pmap-row rw-row" data-state="' + t + '" data-rw-toggle="' + esc(it.id) + '" aria-expanded="' + open + '">' +
      '<span class="rw-lead">' + RW.st(it.stopping ? 'pending' : it.state, 12) + '</span>' +
      '<span class="copy"><strong>' + esc(it.title) + '</strong><span>' + sub + '</span></span>' +
      '<span class="right"><b data-tone="' + t + '">' + esc(RW.word(it)) + '</b><i data-rw-time="' + esc(it.id) + '">' + esc(RW.time(it)) + '</i></span></button>' +
      (open ? RW.ui.detail(it) : '') + '</div>';
  }
  function section(title, list, extra) {
    if (!list.length) return '';
    return '<section class="pmap-records rw-sec"><div class="pmap-records-head"><strong>' + esc(title) + '</strong><span>' + (extra || list.length) + '</span></div>' + list.map(recordRow).join('') + '</section>';
  }
  function bodyHtml() {
    var c = counts(), all = RW.sort(mine());
    var live = all.filter(function (x) { return RW.isLive(x) && !RW.needsYou(x); }), needs = all.filter(RW.needsYou),
      sched = all.filter(function (x) { return x.kind === 'scheduled' && x.state === 'pending'; }), done = all.filter(RW.isDone);
    var h = '<div class="pmap pmap-statusboard is-focused rw-board" data-variant="' + RW.state.threadVariant + '">';
    h += '<section class="pmap-focus-summary" data-tone="' + tone(c) + '"><div class="pmap-focus-head"><span class="pmap-focus-ident">' + RW.icon(RW.state.icon, 13, 'nx nx-r-concept') + '<strong>Running</strong></span><span class="pmap-focus-count">' + c.live + '</span></div><p>' + esc(summary(c)) + '</p></section>';
    if (RW.state.restarted) h += '<div class="rw-strip" data-tone="attention">' + RW.st('warning', 12) + '<span>Puppet Master restarted 2m ago. 2 processes ended while it was closed; the agents were told once.</span></div>';
    if (RW.state.feed === 'stale') h += '<div class="rw-strip" data-tone="attention">' + RW.st('offline', 12) + '<span>Showing what was known 40s ago. Reconnecting to the server; nothing here has been stopped.</span></div>';
    if (!all.length) h += '<div class="ab-empty rw-empty">Nothing is running in this thread. When its agent or a subagent starts a command, a server or a script, it shows up here, and so do scheduled runs.</div>';
    var v = RW.state.threadVariant;
    if (v === 'state') {
      h += section('Needs you', needs) + section('Running', live) + section('Scheduled', sched);
      if (done.length) h += '<section class="pmap-records rw-sec"><div class="pmap-records-head"><strong>Finished this session</strong><span><button type="button" class="rw-link" data-rw-act="clear">Clear</button></span></div>' + done.map(recordRow).join('') + '</section>';
    } else if (v === 'owner') {
      var owners = [null];
      all.forEach(function (x) { if (x.owner && owners.indexOf(x.owner) < 0 && x.kind !== 'scheduled') owners.push(x.owner); });
      owners.forEach(function (o) {
        var l = all.filter(function (x) { return (x.owner || null) === o && x.kind !== 'scheduled'; });
        if (!l.length) return;
        var ag = o ? RW.byId(o) : null;
        var head = o ? (ag ? ag.title : o) : 'Puppet Master · this thread';
        h += '<section class="pmap-records rw-sec rw-owner"><div class="pmap-records-head"><strong>' + (ag ? RW.st(ag.state, 11) : RW.icon('robot', 11)) + esc(head) + '</strong><span>' +
          (ag ? '<b data-tone="' + RW.tone(ag) + '">' + esc(RW.word(ag)) + '</b> · <button type="button" class="rw-link" data-rw-owner="' + esc(o) + '">Subagents</button>' : l.length) + '</span></div>' + l.map(recordRow).join('') + '</section>';
      });
      h += section('Scheduled', sched);
    } else {
      var sel = ui.selected && RW.byId(ui.selected) && RW.byId(ui.selected).thread === RW.state.thread ? RW.byId(ui.selected) : (needs[0] || live[0] || all[0]);
      if (sel) ui.selected = sel.id;
      h += '<section class="pmap-records rw-sec rw-compact"><div class="pmap-records-head"><strong>Everything in this thread</strong><span>' + all.length + '</span></div>' +
        all.map(function (it) {
          var t = RW.tone(it);
          return '<button type="button" class="pmap-row rw-row rw-mini' + (sel && sel.id === it.id ? ' is-sel' : '') + '" data-state="' + t + '" data-rw-select="' + esc(it.id) + '" aria-pressed="' + (sel && sel.id === it.id) + '">' +
            '<span class="rw-lead">' + RW.st(it.stopping ? 'pending' : it.state, 11) + '</span><span class="copy"><strong>' + esc(it.title) + '</strong></span>' +
            '<span class="right"><b data-tone="' + t + '">' + esc(RW.word(it)) + '</b><i data-rw-time="' + esc(it.id) + '">' + esc(RW.time(it)) + '</i></span></button>';
        }).join('') + '</section>';
      if (sel) h += '<section class="rw-inspector" data-rw-inspect="' + esc(sel.id) + '"><div class="pmap-records-head"><strong>' + esc(sel.title) + '</strong><span><b data-tone="' + RW.tone(sel) + '">' + esc(RW.word(sel)) + '</b></span></div>' + RW.ui.detail(sel) + '</section>';
    }
    h += '</div>';
    return h;
  }
  function footHtml() {
    var c = counts();
    var n = c.live + c.sched;
    return '<div class="rw-foot"><span class="rw-dim">Stop in the composer ends the reply, not these.</span><button type="button" class="rw-btn danger" data-rw-act="stop-all"' + (n ? '' : ' disabled') + '>Stop all in this thread' + (n ? ' (' + n + ')' : '') + '</button></div>';
  }
  function renderPanel(keepScroll) {
    var sc = panel.querySelector('.activity-scroll'), top = sc ? sc.scrollTop : 0;
    panel.setAttribute('data-variant', '1'); panel.setAttribute('data-rw-variant', RW.state.threadVariant);
    panel.setAttribute('data-pinned', String(ui.pinned));
    panel.innerHTML = headHtml() + '<div class="activity-scroll">' + bodyHtml() + '</div>' + footHtml();
    if (keepScroll) { var s2 = panel.querySelector('.activity-scroll'); if (s2) s2.scrollTop = top; }
  }
  function placePanel() {
    var host = doc.getElementById('pmw-chat56');
    var layer = layerFor(host, 'rw-chat-layer', 'pm56-host');
    if (!layer) return;
    if (panel.parentNode !== layer) layer.appendChild(panel);
    var stage = doc.querySelector('#pmRoot .chat-stage'), comp = doc.querySelector('#pmRoot .activity-wrap') || doc.querySelector('#pmRoot .composer');
    if (!stage) return;
    var s = rel(layer, stage.getBoundingClientRect()), cb = comp ? rel(layer, comp.getBoundingClientRect()).top : s.bottom;
    var w = Math.min(400, s.width - 20), bottom = cb - 10;
    if (ui.pinned) {
      panel.style.left = (s.left + 8) + 'px'; panel.style.top = (s.top + 8) + 'px'; panel.style.width = Math.min(380, s.width * 0.55) + 'px'; panel.style.height = Math.max(240, bottom - s.top - 8) + 'px';
    } else {
      var hgt = Math.min(560, Math.max(260, bottom - s.top - 60));
      panel.style.left = (s.right - w - 10) + 'px'; panel.style.top = (bottom - hgt) + 'px'; panel.style.width = w + 'px'; panel.style.height = hgt + 'px';
    }
  }
  function closeReal() {
    var x = doc.querySelector('#pmRoot .activity-panel [data-action="close-activity"]');
    if (x) x.click();
  }
  T.open = function () {
    hideCard(); closeReal();
    ui.open = true; panel.hidden = false; ensureLayers();
    renderPanel(); placePanel(); paintButton();
    setTimeout(function () { var f = panel.querySelector('[data-rw-self]'); if (f) f.focus({ preventScroll: true }); }, 0);
  };
  T.close = function () { ui.open = false; panel.hidden = true; paintButton(); };
  T.toggle = function () { if (ui.open) T.close(); else T.open(); };
  T.expand = function (id) { ui.expanded[id] = true; if (ui.open) renderPanel(true); };

  /* -------------------------------------------------------------- events */
  btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); T.toggle(); });
  card.addEventListener('click', function (e) {
    var t = e.target.closest('[data-rw-open],[data-rw-act]');
    if (!t) return;
    var id = t.getAttribute('data-rw-open');
    T.open();
    if (id) { if (RW.state.threadVariant === 'list') ui.selected = id; else ui.expanded[id] = true; renderPanel(); }
  });
  /* the injected tab in the chat's own Activity Detail */
  doc.addEventListener('click', function (e) {
    var tab = e.target.closest && e.target.closest('[data-rw-tab]');
    if (tab) { e.preventDefault(); e.stopPropagation(); T.open(); return; }
    var real = e.target.closest && e.target.closest('#pmRoot .pm56-activity-bar .activity-item:not(.rw-ab-item)');
    if (real && ui.open) T.close();
  }, true);
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ui.open && !doc.querySelector('.rw-dialog')) T.close(); });

  RW.ui.handle = function (e, scopeEl, rerender) {
    var t = e.target.closest('[data-rw-act],[data-rw-toggle],[data-rw-select],[data-rw-answer],[data-rw-report],[data-rw-port],[data-rw-owner],[data-rw-domain-jump]');
    if (!t || !scopeEl.contains(t)) return false;
    var det = t.closest('[data-rw-detail]'), id = det ? det.getAttribute('data-rw-detail') : null, it = id ? RW.byId(id) : null;
    if (t.hasAttribute('data-rw-answer')) { RW.answer(id, t.getAttribute('data-rw-answer')); return true; }
    if (t.hasAttribute('data-rw-report')) { RW.setReport(id, t.getAttribute('data-rw-report')); RW.toast({ agent: 'When it ends, the agent is told: its exit code and the end of its output.', me: 'When it ends, you get a notice; the agent is not woken.', quiet: 'When it ends, nothing is sent; it stays listed here.' }[t.getAttribute('data-rw-report')]); return true; }
    if (t.hasAttribute('data-rw-port')) { RW.toast('Opens http://localhost:' + t.getAttribute('data-rw-port') + ' in the Browser tab (the Ports panel owns forwarding)'); return true; }
    if (t.hasAttribute('data-rw-owner')) { var o = RW.byId(t.getAttribute('data-rw-owner')); RW.toast('Opens ' + (o ? o.title : 'the agent') + ' in the Subagents domain'); return true; }
    var a = t.getAttribute('data-rw-act');
    if (a === 'stop' && it) { RW.stop(id); return true; }
    if (a === 'restart' && it) { RW.restart(id); RW.toast('Restarting ' + it.title); return true; }
    if (a === 'rerun' && it) { RW.restart(id); RW.toast('Running ' + it.command + ' again'); return true; }
    if (a === 'terminal' && it) { RW.toast('Reveals ' + it.title + ' in its terminal tab (pid ' + it.pid + ')'); return true; }
    if (a === 'copy' && it) { try { navigator.clipboard.writeText(it.command); } catch (x) {} RW.toast('Copied: ' + it.command); return true; }
    if (a === 'goto' && it) { RW.toast('Opens ' + (it.surface === 'assistant' ? 'the thread “' + it.where + '”' : RW.ui.surfaceName(it.surface) + ' at ' + it.title)); return true; }
    return false;
  };
  panel.addEventListener('click', function (e) {
    if (RW.ui.handle(e, panel)) return;
    var t = e.target.closest('button');
    if (!t) return;
    if (t.hasAttribute('data-rw-toggle')) { var id = t.getAttribute('data-rw-toggle'); ui.expanded[id] = !ui.expanded[id]; renderPanel(true); return; }
    if (t.hasAttribute('data-rw-select')) { ui.selected = t.getAttribute('data-rw-select'); renderPanel(true); return; }
    if (t.hasAttribute('data-rw-domain-jump')) {
      var d = t.getAttribute('data-rw-domain-jump'), b = doc.querySelector('#pmRoot .pm56-activity-bar .activity-item[data-domain="' + d + '"]');
      T.close(); if (b) b.click(); return;
    }
    var a = t.getAttribute('data-rw-act');
    if (a === 'close') T.close();
    else if (a === 'pin') { ui.pinned = !ui.pinned; renderPanel(true); placePanel(); }
    else if (a === 'clear') RW.clearFinished(function (x) { return x.thread === RW.state.thread; });
    else if (a === 'stop-all') T.confirmStopAll();
  });

  /* Stop all in this thread: name exactly what will stop (Cursor 3.26 / Claude exit dialog lesson). */
  T.confirmStopAll = function () {
    var list = RW.sort(mine()).filter(function (x) { return RW.isLive(x) || (x.kind === 'scheduled' && x.state === 'pending'); });
    RW.ui.confirm({
      title: 'Stop ' + list.length + ' things in “' + RW.state.threadTitle + '”?',
      lead: 'Each process gets SIGTERM and then SIGKILL after 3 seconds, with everything it started. Scheduled runs are cancelled. The agents are told what you stopped; nothing restarts on its own.',
      items: list, go: 'Stop ' + list.length,
      onGo: function (ids) { ids.forEach(function (id) { RW.stop(id); }); }
    });
  };

  /* ------------------------------------------------ the shared dialog */
  RW.ui.confirm = function (o) {
    var layer = layerFor(doc.body, 'rw-dialog-layer');
    var d = doc.createElement('div');
    d.className = 'rw-dialog-scrim';
    d.innerHTML = '<div class="rw-dialog" role="alertdialog" aria-modal="true" aria-label="' + esc(o.title) + '"><h2>' + esc(o.title) + '</h2><p>' + esc(o.lead) + '</p>' +
      (o.choice ? '<div class="rw-seg rw-choice" role="radiogroup">' + o.choice.map(function (c, i) { return '<button type="button" role="radio" aria-pressed="' + (i === 0) + '" data-rw-choice="' + c[0] + '">' + esc(c[1]) + '</button>'; }).join('') + '</div>' : '') +
      '<ul class="rw-dialog-list">' + o.items.map(function (it) { return '<li><label><input type="checkbox" checked data-id="' + esc(it.id) + '" data-kind="' + it.kind + '">' + RW.st(it.state, 11) + '<b>' + esc(it.title) + '</b><span>' + esc(it.where || '') + (it.command ? ' · ' + esc(it.command) : '') + '</span></label></li>'; }).join('') + '</ul>' +
      (o.note ? '<p class="rw-dim">' + esc(o.note) + '</p>' : '') +
      '<div class="rw-dialog-actions"><button type="button" class="rw-btn" data-x="cancel">Cancel</button><button type="button" class="rw-btn danger" data-x="go">' + esc(o.go) + '</button></div></div>';
    layer.appendChild(d);
    var goBtn = d.querySelector('[data-x="go"]');
    function count() {
      var choice = d.querySelector('[data-rw-choice][aria-pressed="true"]'), mode = choice ? choice.getAttribute('data-rw-choice') : 'all';
      var boxes = [].slice.call(d.querySelectorAll('input[type=checkbox]'));
      boxes.forEach(function (b) { var off = mode === 'keep' || (mode === 'procs' && b.getAttribute('data-kind') === 'agent'); b.disabled = off; b.closest('li').classList.toggle('is-off', off); });
      var n = boxes.filter(function (b) { return b.checked && !b.disabled; }).length;
      goBtn.textContent = n ? (o.goWord || 'Stop') + ' ' + n : (o.goZero || (o.goWord || 'Stop') + ' 0'); goBtn.disabled = !n && !o.goZero;
      goBtn.classList.toggle('danger', !!n);
    }
    d.addEventListener('change', count);
    d.addEventListener('click', function (e) {
      var c = e.target.closest('[data-rw-choice]');
      if (c) { d.querySelectorAll('[data-rw-choice]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === c)); }); count(); return; }
      var x = e.target.closest('[data-x]');
      if (!x && e.target !== d) return;
      if (x && x.getAttribute('data-x') === 'go') {
        var ids = [].slice.call(d.querySelectorAll('input[type=checkbox]')).filter(function (b) { return b.checked && !b.disabled; }).map(function (b) { return b.getAttribute('data-id'); });
        o.onGo(ids);
      }
      d.remove();
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); d.remove(); } });
    count();
    setTimeout(function () { d.querySelector('[data-x="cancel"]').focus(); }, 0);
  };

  /* ------------------------------------------------------- keeping in place */
  /* The chat's looks hang off data-* attributes on its .pm56-host roots (data-theme and friends): mirror them. */
  function mirror(fromId, toId) {
    var a = doc.getElementById(fromId), b = doc.getElementById(toId);
    if (!a || !b) return;
    [].slice.call(a.attributes).forEach(function (at) { if (at.name.indexOf('data-') === 0 && b.getAttribute(at.name) !== at.value) b.setAttribute(at.name, at.value); });
    [].slice.call(b.attributes).forEach(function (at) { if (at.name.indexOf('data-') === 0 && !a.hasAttribute(at.name)) b.removeAttribute(at.name); });
  }
  function ensureLayers() {
    layerFor(doc.getElementById('pmw-chat56'), 'rw-chat-layer', 'pm56-host'); layerFor(doc.getElementById('pm56-layers'), 'rw-chat-hover', 'pm56-host pm56-overlay');
    mirror('pmRoot', 'rw-chat-layer'); mirror('pmOverlayRoot', 'rw-chat-hover');
  }
  var sched = false;
  function sync() {
    sched = false;
    ensureLayers();
    paintButton(); placeButton(); placeTab();
    if (ui.open) placePanel();
    var realOpen = doc.querySelector('#pmRoot .activity-panel');
    if (realOpen && ui.open) T.close();
  }
  function kick() { if (!sched) { sched = true; Promise.resolve().then(sync); } }
  var root = doc.getElementById('pmRoot');
  if (root) new MutationObserver(kick).observe(root, { childList: true, subtree: true });
  window.addEventListener('resize', function () { requestAnimationFrame(sync); });
  setInterval(sync, 700);

  RW.on(function (why) {
    paintButton(); placeButton();
    if (why === 'tick') {
      [card, panel].forEach(function (scope) {
        scope.querySelectorAll('[data-rw-time]').forEach(function (el) { var it = RW.byId(el.getAttribute('data-rw-time')); if (it) el.textContent = RW.time(it); });
        scope.querySelectorAll('[data-rw-tail]').forEach(function (el) {
          var it = RW.byId(el.getAttribute('data-rw-tail'));
          if (!it || !it.tail) return;
          var rows = 6, pre = el.querySelector('pre'), txt = it.tail.slice(-rows).join('\n');
          if (pre && pre.textContent !== txt) { var tmp = doc.createElement('div'); tmp.innerHTML = tailHtml(it, rows); el.replaceWith(tmp.firstChild); }
        });
      });
      return;
    }
    if (ui.hoverOpen) renderCard();
    if (ui.open) { renderPanel(true); placePanel(); }
  });
  sync();
  T.ui = ui;
  if (window.RW_OPEN === 'thread') setTimeout(function () { T.open(); T.expand('p-migrate'); }, 600);
})();
