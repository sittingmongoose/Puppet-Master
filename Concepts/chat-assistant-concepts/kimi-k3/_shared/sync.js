/* ============================================================================
   Kimi K3 — sync / offline / outbox controller (window.K3Sync).

   Transport state machine (store slice `sync`):
     cached | synchronizing | live | offline | queued | reconnecting |
     replay | snapshot | server-continuing
     ('server-continuing' is written to sync.state AND sync.serverContinuing;
     the prior transport state is restored when the flag clears)

   Controller (ctx-free, like K3Data):
   - K3Sync.state() -> effective state string.
   - K3Sync.goOffline() — transport drops; sends start queueing.
   - K3Sync.queueSend(threadId, text, attachments)
       Deterministic opId `<threadId>-<NNNN>` (seq = 1 + outbox entries +
       appliedOps keys carrying the thread prefix, collision-guarded).
       Appends the user message ONCE via data.send({opId, queued:true,
       noReply:true}) so the transcript shows the "Queued to send" badge at
       queue time; records the outbox entry; state -> 'queued'.
   - K3Sync.reconnect() — synchronous full pass:
       reconnecting -> replay -> snapshot -> live (one emit per transition).
   - K3Sync.stepReconnect() — exactly ONE transition per call so the dev
       drawer / harness paces the beats. NO TIMERS anywhere in this module.
   - Replay applies each queued op through data.send(tid, text, {opId,
     noReply:true}); the data.js appliedOps fence returns null because the
     message was already appended at queue time — every fenced op logs
     "<opId> already applied — skipped" into K3Sync.replayLog(). The badge is
     then flipped via data.markMessageSent and the outbox entry -> 'sent'.
   - K3Sync.failDomain(name) / retryDomain(name) — domain sync failures
     (sync.domainNotes) stay SEPARATE from transport health: the connection
     can be live while e.g. the search index has failed.
   - K3Sync.setServerContinuing(bool).

   Chrome: K3Sync.pill(ctx) -> header state-chip pill element (testid
   'k3n-pill', .unmount() drops subscriptions). Click opens a K3UI popover:
   connection route lines (Home Server / Execution Host / Environment /
   Route via data.connectionInfo()), outbox list with per-op status, domain
   failure section with Retry, and a Reconnect action. CSS prefix k3n-.
   ========================================================================== */
(function () {
  'use strict';

  var PHASES = ['reconnecting', 'replay', 'snapshot', 'live'];
  var STATE_LABELS = {
    cached: 'Cached',
    synchronizing: 'Syncing…',
    live: 'Live',
    offline: 'Offline',
    queued: 'Queued',
    reconnecting: 'Reconnecting…',
    replay: 'Replaying…',
    snapshot: 'Catching up…',
    'server-continuing': 'Server continuing'
  };
  // fixed-step timestamp counter — deterministic, no Date.now() in fixtures
  var STAMP_BASE = Date.UTC(2026, 7, 8, 12, 0, 0);
  var stampCounter = 0;
  var replayLogLines = [];

  function store() { return window.K3Store; }
  function data() { return window.K3Data; }
  function icons() { return window.K3Icons; }
  function emit(evt) { if (window.K3 && window.K3.emit) window.K3.emit('data', evt); }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function nextStamp() {
    var stamp = new Date(STAMP_BASE + stampCounter * 1000).toISOString();
    stampCounter++;
    return stamp;
  }

  function rawSync() {
    return store().get('sync', null) || { state: 'live', domainNotes: [], serverContinuing: false };
  }

  function rawState() { return rawSync().state || 'live'; }

  function state() {
    var s = rawSync();
    if (s.serverContinuing === true) return 'server-continuing';
    return s.state || 'live';
  }

  function setState(next) {
    store().set('sync.state', next);
    emit({ type: 'sync-changed', state: state() });
  }

  function queuedOps() {
    var outbox = store().get('outbox', {}) || {};
    var ops = [];
    Object.keys(outbox).forEach(function (tid) {
      (outbox[tid] || []).forEach(function (entry) {
        if (entry && entry.status === 'queued') ops.push({ threadId: tid, entry: entry });
      });
    });
    return ops;
  }

  function queuedCount() { return queuedOps().length; }

  // --- controller ---------------------------------------------------------------

  function goOffline() {
    setState('offline');
  }

  function queueSend(threadId, text, attachments) {
    var d = data();
    if (!d || !threadId) return null;
    var prefix = threadId + '-';
    var outbox = store().get('outbox', {}) || {};
    var list = outbox[threadId] || [];
    var applied = store().get('appliedOps', {}) || {};
    var seq = 1 + list.length;
    Object.keys(applied).forEach(function (k) { if (k.indexOf(prefix) === 0) seq++; });
    var opId;
    do {
      opId = prefix + String(seq).padStart(4, '0');
      seq++;
    } while (applied[opId] || list.some(function (e) { return e && e.opId === opId; }));

    var eff = d.effective ? d.effective(threadId) : null;
    var entry = {
      opId: opId,
      text: String(text == null ? '' : text),
      attachments: attachments || [],
      routeSnapshot: eff ? eff.routeKey : null,
      queuedAt: nextStamp(),
      status: 'queued'
    };
    // appended ONCE at queue time; the reconnect replay is fenced by opId
    var message = d.send(threadId, entry.text, { opId: opId, queued: true, noReply: true });
    if (message === null) {
      replayLogLines.push(opId + ' already applied — skipped');
      return null;
    }
    list.push(entry);
    outbox[threadId] = list;
    store().set('outbox', outbox);
    emit({ type: 'outbox-changed', threadId: threadId });
    setState('queued');
    return entry;
  }

  function doReplay() {
    var d = data();
    var outbox = store().get('outbox', {}) || {};
    Object.keys(outbox).forEach(function (tid) {
      (outbox[tid] || []).forEach(function (entry) {
        if (!entry || entry.status !== 'queued') return;
        var appended = d.send(tid, entry.text, { opId: entry.opId, noReply: true });
        if (appended === null) replayLogLines.push(entry.opId + ' already applied — skipped');
        else replayLogLines.push(entry.opId + ' replayed — appended');
        d.markMessageSent(tid, entry.opId); // flips the "Queued to send" badge
        entry.status = 'sent';
      });
    });
    store().set('outbox', outbox);
    emit({ type: 'outbox-changed' });
  }

  // Exactly one transition per call — drawer/harness drives the pacing.
  function stepReconnect() {
    var cur = rawState();
    var next;
    if (cur === 'offline' || cur === 'queued') next = 'reconnecting';
    else {
      var i = PHASES.indexOf(cur);
      if (i < 0 || i >= PHASES.length - 1) return state(); // nothing to advance
      next = PHASES[i + 1];
    }
    setState(next);
    if (next === 'replay') doReplay();
    return state();
  }

  function reconnect() {
    var cur = rawState();
    if (cur !== 'offline' && cur !== 'queued' && PHASES.indexOf(cur) < 0) return state();
    var guard = 0;
    while (rawState() !== 'live' && guard < 8) {
      stepReconnect();
      guard++;
    }
    return state();
  }

  // Domain sync failures live apart from transport health.
  function failDomain(name) {
    var s = rawSync();
    var notes = (s.domainNotes || []).slice();
    var found = null;
    notes.forEach(function (n) { if (n && n.name === name) found = n; });
    if (found) { found.state = 'failed'; found.note = 'sync failed · retry'; }
    else notes.push({ name: name, state: 'failed', note: 'sync failed · retry' });
    s.domainNotes = notes;
    store().set('sync', s);
    emit({ type: 'sync-changed', state: state(), domain: name });
  }

  function retryDomain(name) {
    var s = rawSync();
    var notes = (s.domainNotes || []).filter(function (n) { return !n || n.name !== name; });
    s.domainNotes = notes;
    store().set('sync', s);
    emit({ type: 'sync-changed', state: state(), domain: name });
  }

  // server-continuing is stored BOTH ways: the durable bool (thread-kit live
  // region reads it) and the sync.state slot (store-level readers/probes).
  // The prior transport state is remembered and restored on clear — but only
  // when the slot still reads 'server-continuing', so a goOffline() during
  // continuation is never clobbered.
  var priorTransportState = null;

  function setServerContinuing(bool) {
    var s = rawSync();
    if (bool === true) {
      if (s.state !== 'server-continuing') priorTransportState = s.state || 'live';
      store().set('sync.serverContinuing', true);
      store().set('sync.state', 'server-continuing');
    } else {
      store().set('sync.serverContinuing', false);
      if (s.state === 'server-continuing') {
        store().set('sync.state', priorTransportState || 'live');
      }
      priorTransportState = null;
    }
    emit({ type: 'sync-changed', state: state() });
  }

  function replayLog() { return replayLogLines.slice(); }

  // --- pill chrome -----------------------------------------------------------------

  function pillIcon(st) {
    var name = st === 'offline' || st === 'queued' ? 'wifi-off' : 'wifi';
    if (!icons() || !icons().has(name)) return null;
    return icons().get(name);
  }

  function buildPopoverContent(ctx, popEl) {
    function render() {
      popEl.innerHTML = '';
      var st = state();

      var head = el('div', 'k3n-pop-head');
      head.appendChild(el('span', 'k3n-pop-title', 'Connection'));
      head.appendChild(el('span', 'k3n-status k3n-status-' + st, STATE_LABELS[st] || st));
      popEl.appendChild(head);

      var info = (ctx.data && ctx.data.connectionInfo) ? ctx.data.connectionInfo() : {};
      var routeSec = el('div', 'k3n-sec');
      routeSec.appendChild(el('div', 'k3n-sec-title', 'Route'));
      [['Home Server', info.homeServer], ['Execution Host', info.executionHost],
       ['Environment', info.environment], ['Route', info.route]].forEach(function (pair) {
        if (pair[1] == null) return;
        var row = el('div', 'k3n-kv');
        row.appendChild(el('span', 'k3n-kv-k', pair[0]));
        row.appendChild(el('span', 'k3n-kv-v', String(pair[1])));
        routeSec.appendChild(row);
      });
      popEl.appendChild(routeSec);

      var outSec = el('div', 'k3n-sec');
      outSec.appendChild(el('div', 'k3n-sec-title', 'Outbox'));
      var outbox = ctx.store.get('outbox', {}) || {};
      var rows = 0;
      Object.keys(outbox).forEach(function (tid) {
        (outbox[tid] || []).forEach(function (entry) {
          if (!entry) return;
          rows++;
          var row = el('div', 'k3n-op');
          row.title = entry.opId;
          var snippet = String(entry.text || '');
          if (snippet.length > 42) snippet = snippet.slice(0, 42) + '…';
          row.appendChild(el('span', 'k3n-op-text', snippet || '(empty)'));
          row.appendChild(el('span', 'k3n-op-status is-' + entry.status,
            entry.status === 'sent' ? 'Sent' : 'Queued'));
          outSec.appendChild(row);
        });
      });
      if (!rows) outSec.appendChild(el('div', 'k3n-empty', 'Outbox is empty'));
      popEl.appendChild(outSec);

      var notes = rawSync().domainNotes || [];
      if (notes.length) {
        var domSec = el('div', 'k3n-sec k3n-sec-domains');
        domSec.appendChild(el('div', 'k3n-sec-title', 'Domain sync'));
        domSec.appendChild(el('div', 'k3n-domain-note', 'Separate from transport — the connection is live.'));
        notes.forEach(function (n) {
          if (!n) return;
          var row = el('div', 'k3n-domain');
          row.appendChild(el('span', 'k3n-domain-name', n.name + ' — ' + (n.note || '')));
          var retry = el('button', 'k3-btn k3-btn-ghost k3n-domain-retry', 'Retry');
          retry.type = 'button';
          retry.setAttribute('data-testid', 'k3n-domain-retry');
          retry.addEventListener('click', function () {
            retryDomain(n.name);
            render();
            ctx.ui.springResize(popEl);
          });
          row.appendChild(retry);
          domSec.appendChild(row);
        });
        popEl.appendChild(domSec);
      }

      var raw = rawState();
      if (raw === 'offline' || raw === 'queued') {
        var reconnectBtn = el('button', 'k3-btn k3n-reconnect', 'Reconnect');
        reconnectBtn.type = 'button';
        reconnectBtn.setAttribute('data-testid', 'k3n-reconnect');
        reconnectBtn.addEventListener('click', function () {
          reconnect();
          ctx.ui.closeAll();
        });
        popEl.appendChild(reconnectBtn);
      }
    }
    render();
  }

  function pill(ctx) {
    var btn = el('button', 'k3-chip k3n-pill');
    btn.type = 'button';
    btn.setAttribute('data-testid', 'k3n-pill');
    var iconSlot = el('span', 'k3n-pill-icon');
    btn.appendChild(iconSlot);
    var dot = el('span', 'k3n-dot');
    btn.appendChild(dot);
    var label = el('span', 'k3n-pill-label');
    btn.appendChild(label);

    function refresh() {
      var st = state();
      var text = STATE_LABELS[st] || st;
      if (st === 'queued') text = 'Queued (' + queuedCount() + ')';
      label.textContent = text;
      btn.title = 'Connection — ' + text;
      btn.setAttribute('aria-label', btn.title);
      btn.classList.remove('is-live', 'is-offline', 'is-queued', 'is-busy', 'is-server', 'is-cached');
      if (st === 'live') btn.classList.add('is-live');
      else if (st === 'offline') btn.classList.add('is-offline');
      else if (st === 'queued') btn.classList.add('is-queued');
      else if (st === 'server-continuing') btn.classList.add('is-server');
      else if (st === 'cached') btn.classList.add('is-cached');
      else btn.classList.add('is-busy');
      iconSlot.innerHTML = '';
      var ic = pillIcon(st);
      iconSlot.hidden = !ic;
      if (ic) iconSlot.appendChild(ic);
    }

    btn.addEventListener('click', function () {
      ctx.ui.popover(btn, function (popEl) { buildPopoverContent(ctx, popEl); }, { className: 'k3n-pop' });
    });

    function onData(evt) {
      if (!evt) return;
      if (evt.type === 'sync-changed' || evt.type === 'outbox-changed') refresh();
    }
    ctx.on('data', onData);
    var unsubSync = ctx.store.subscribe('sync', refresh);
    var unsubOutbox = ctx.store.subscribe('outbox', refresh);
    refresh();
    btn.unmount = function () {
      ctx.off('data', onData);
      unsubSync();
      unsubOutbox();
    };
    return btn;
  }

  // --- public ------------------------------------------------------------------------

  window.K3Sync = {
    state: state,
    pill: pill,
    goOffline: goOffline,
    queueSend: queueSend,
    reconnect: reconnect,
    stepReconnect: stepReconnect,
    failDomain: failDomain,
    retryDomain: retryDomain,
    setServerContinuing: setServerContinuing,
    replayLog: replayLog
  };
})();
