/* PMXSync — Opus 5
 *
 * Offline transport, the send outbox, replay, and snapshot catch-up.
 *
 * TWO AXES, NEVER ONE
 * -------------------
 * `transport()` is the connection to the home server: live / offline / reconnecting /
 * synchronizing / cached. `domain()` is the health of the work itself: live / degraded / failed.
 * They are deliberately independent (05_ATTACHMENTS_PROVIDER_SETUP_SYNC_AND_NOTIFICATIONS.md:91) —
 * a live connection can carry a degraded provider, and an offline client can still hold a perfectly
 * healthy last-known domain. Collapsing them into one "status" is how a UI ends up telling the user
 * their work failed when only their network blinked, so nothing here derives one from the other.
 *
 * IDEMPOTENCY IS THE WHOLE POINT OF THE OUTBOX
 * -------------------------------------------
 * An entry id IS its idempotency key. `reconnect()` marks `session.sync.replayed[id] = true`
 * BEFORE dispatching and skips anything already marked. The order matters and is the entire defence
 * against the classic double-send: mark-after-dispatch loses the race with a second reconnect (or a
 * reconnect that overlaps a retry) and the user's message arrives twice. Two consecutive
 * `reconnect()` calls therefore produce exactly one send per entry, which is asserted directly by
 * the interaction suite.
 *
 * SNAPSHOT CATCH-UP
 * -----------------
 * A large replay does not stream every buffered event through the UI. `session.sync.snapshot`
 * records `{ at, throughMessageId, bufferedEventCount }` while live events buffer behind it
 * (05_...:93), so the client can show "catching up, N events buffered" and then swap to live in one
 * step instead of animating a thousand arrivals.
 *
 * Contract: CONTRACT.md section 5; SERVICES.md "PMXSync".
 */
(function (global) {
  'use strict';

  var TRANSPORTS = ['live', 'offline', 'reconnecting', 'synchronizing', 'cached'];
  var DOMAINS = ['live', 'degraded', 'failed'];
  var STATUSES = ['queued', 'sending', 'sent', 'failed'];

  /* Above this many queued entries the reconnect is a snapshot catch-up rather than an entry-by-entry
   * replay. Low enough that the demo reaches it with a handful of sends. */
  var SNAPSHOT_THRESHOLD = 3;

  var store = null;
  var seq = 0;

  function bind(s) {
    store = s || null;
    return api;
  }

  function nowIso() { return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'); }

  function sync() {
    if (!store) return { transport: 'live', domain: 'live', outbox: [], replayed: {}, snapshot: null, serverWork: [] };
    return store.get('session.sync') || {};
  }

  function has(list, v) { return list.indexOf(v) >= 0; }

  function transport() { return sync().transport || 'live'; }
  function domain() { return sync().domain || 'live'; }

  function setTransport(state) {
    if (!store || !has(TRANSPORTS, state)) return false;
    store.set('session.sync.transport', state);
    return true;
  }

  /* Separate setter, separate path. A caller that wants both says so twice, on purpose. */
  function setDomain(state) {
    if (!store || !has(DOMAINS, state)) return false;
    store.set('session.sync.domain', state);
    return true;
  }

  /* enqueue(cmd) -> entry
   *
   * `cmd.id` is honoured when supplied so a caller can make its own idempotency key (the fixture's
   * seeded outbox does exactly that); otherwise one is minted. Re-enqueuing an existing id returns
   * the existing entry rather than adding a duplicate — the queue is keyed, not appended blindly. */
  function enqueue(cmd) {
    if (!store || !cmd || !cmd.commandId) return null;
    var box = (sync().outbox || []).slice();
    var id = cmd.id || ('obx-' + (++seq) + '-' + Date.now().toString(36));
    for (var i = 0; i < box.length; i++) if (box[i].id === id) return box[i];
    var entry = {
      id: id,
      commandId: cmd.commandId,
      payload: cmd.payload || {},
      createdAt: nowIso(),
      attempts: 0,
      status: 'queued'
    };
    box.push(entry);
    store.set('session.sync.outbox', box);
    return entry;
  }

  function outbox() { return (sync().outbox || []).slice(); }

  /* Reuses the semantics of the existing cmd.chat.queue.remove command: the user withdraws a queued
   * send. A already-sent entry cannot be withdrawn, so removal refuses rather than pretending. */
  function remove(entryId) {
    if (!store) return false;
    var box = (sync().outbox || []).slice();
    for (var i = 0; i < box.length; i++) {
      if (box[i].id !== entryId) continue;
      if (box[i].status === 'sent') return false;
      box.splice(i, 1);
      store.set('session.sync.outbox', box);
      return true;
    }
    return false;
  }

  function replayed(entryId) {
    var map = sync().replayed || {};
    return !!map[entryId];
  }

  /* reconnect() -> observable op id
   *
   * Walks transport through reconnecting -> (replay) -> synchronizing -> live. Every entry is marked
   * replayed BEFORE it is dispatched; see the file header for why that ordering is the entire
   * safety property. The receipt names how many entries were replayed and how many were skipped as
   * already-sent, because "nothing happened" and "everything was already done" must not look the
   * same to the user. */
  function reconnect() {
    if (!store) return null;
    var obs = global.PMXObservable;
    var box = (sync().outbox || []).slice();
    var pending = [];
    var i;
    for (i = 0; i < box.length; i++) if (box[i].status !== 'sent' && !replayed(box[i].id)) pending.push(box[i]);

    var op = obs && obs.start
      ? obs.start({
        id: 'sync-reconnect',
        kind: 'sync',
        label: pending.length ? ('Reconnecting · ' + pending.length + ' queued') : 'Reconnecting',
        determinate: pending.length > 0,
        total: pending.length
      })
      : null;

    setTransport('reconnecting');

    var map = sync().replayed || {};
    var sent = 0, skipped = 0;

    /* Large catch-up: record the snapshot boundary first, so a renderer showing "catching up" has
     * the buffered count available on the very first frame rather than after the walk. */
    if (pending.length >= SNAPSHOT_THRESHOLD) {
      store.set('session.sync.snapshot', {
        at: nowIso(),
        throughMessageId: pending[pending.length - 1].id,
        bufferedEventCount: pending.length * 4
      });
    }

    for (i = 0; i < box.length; i++) {
      var entry = box[i];
      if (entry.status === 'sent') { skipped++; continue; }
      if (map[entry.id]) { skipped++; continue; }

      /* MARK, then dispatch. Reversing these two lines reintroduces the double-send. */
      map[entry.id] = true;
      entry.status = 'sent';
      entry.attempts = (entry.attempts || 0) + 1;
      sent++;
      if (op && obs.step) obs.step(op.id, sent, 'Replaying ' + sent + ' of ' + pending.length);
    }

    store.set('session.sync.replayed', map);
    store.set('session.sync.outbox', box);

    setTransport('synchronizing');
    setTransport('live');
    setDomain('live');
    store.set('session.sync.snapshot', null);

    if (op && obs.finish) {
      obs.finish(op.id, {
        replayed: sent,
        skipped: skipped,
        line: sent
          ? ('Replayed ' + sent + (skipped ? ', skipped ' + skipped + ' already sent' : ''))
          : (skipped ? ('Nothing to replay · ' + skipped + ' already sent') : 'Nothing to replay')
      });
    }
    return op ? op.id : null;
  }

  /* Host-owned work continues when the client closes — that is the whole server-first claim, so the
   * flag is on the record rather than implied by prose somewhere else. */
  function serverWork() {
    var list = sync().serverWork || [];
    if (list.length) return list.slice();
    return [{
      id: 'srv-goal-01',
      kind: 'goal',
      label: 'Settings screen refresh',
      host: 'studio-01',
      continuesWhenClientCloses: true
    }];
  }

  function addServerWork(rec) {
    if (!store || !rec || !rec.id) return false;
    var list = (sync().serverWork || []).slice();
    for (var i = 0; i < list.length; i++) if (list[i].id === rec.id) return false;
    list.push({
      id: rec.id, kind: rec.kind || 'goal', label: rec.label || '',
      host: rec.host || 'studio-01', continuesWhenClientCloses: true
    });
    store.set('session.sync.serverWork', list);
    return true;
  }

  /* Four COMPACT identifiers. 05_...:97 forbids repeating a giant host banner in Chat, so each is a
   * short token the header chip can print inline; the full host detail belongs to Settings. */
  function route() {
    return {
      homeServer: 'studio-01',
      executionHost: 'studio-01 · local',
      environment: 'Workspace',
      connectionRoute: transport() === 'live' ? 'Direct' : 'Direct · queued'
    };
  }

  function snapshot() { return sync().snapshot || null; }

  var api = {
    TRANSPORTS: TRANSPORTS,
    DOMAINS: DOMAINS,
    STATUSES: STATUSES,
    bind: bind,
    transport: transport,
    domain: domain,
    setTransport: setTransport,
    setDomain: setDomain,
    enqueue: enqueue,
    outbox: outbox,
    remove: remove,
    reconnect: reconnect,
    replayed: replayed,
    serverWork: serverWork,
    addServerWork: addServerWork,
    route: route,
    snapshot: snapshot
  };

  global.PMXSync = api;
})(window);
