/* PMXNotify — Opus 5
 *
 * THE BOUNDARY IS THE WHOLE POINT.
 *
 * `05_ATTACHMENTS_PROVIDER_SETUP_SYNC_AND_NOTIFICATIONS.md:110` and CHAT-021: app-wide events go
 * to the canonical title-bar notification stack/inbox and NOWHERE else. Chat must not grow a
 * dedicated notification panel, a bottom-right permanent stack, or an application-rail
 * notification icon. This module is the model behind that one title-bar surface; the only
 * renderer permitted to consume it lives in the fake title bar in `shared/shell.js`, outside
 * every `[data-pmx-window]` subtree. Phase G asserts exactly that: no element carrying
 * `data-pmx-notify` may exist inside any `[data-pmx-window]`. If a second surface ever wants an
 * inbox, the answer is to move that surface's event into the title bar, not to widen this module.
 *
 * THE CORRECT ALTERNATIVE, so nobody reaches for this module by mistake. A local inline outcome
 * that belongs to the CURRENT task is not a notification. "Command finished", "Copied", "Compact
 * complete", "Approval denied" — those stay where the user's attention already is: a transient
 * `PMXToast`, or a durable in-transcript row rendered by the thread concept. Route such an
 * outcome through here and you have both duplicated the feedback and misfiled it as app-wide.
 * Use this module only for something that outlives the current task's surface: a host-owned Goal
 * that completed while the client was closed, a provider account that now needs setup, an outbox
 * that finished replaying, a cross-thread request that was answered.
 *
 * Seeding is deliberately absent. An inbox that starts full is a fiction — it claims events
 * happened that never did, and it makes `unread()` a decoration rather than a fact. The Director
 * (`shared/demo.js`) fires real notifications; until it does, the inbox is honestly empty.
 *
 * No DOM, no second notification system (SHARED_PROCESS_RULES.md). State is store-owned so the
 * title bar re-renders through the ordinary subscription path.
 *
 * Contract: CONTRACT.md section 5; SERVICES.md "PMXNotify".
 */
(function (global) {
  'use strict';

  /* Bounded because the inbox is a title-bar surface, not an audit log: an unbounded array grows
   * `store.snapshot()` forever and the stack can only ever show a screenful. The oldest entries
   * are the ones a user has already lived past, so they are what falls off. Durable history of
   * what actually happened belongs to the transcript and to the observable receipts, not here. */
  var MAX_ITEMS = 50;

  var store = null;
  var seq = 0;

  function bind(s) {
    /* Boot binds once before the corpus loads and once after; rebinding must not clear state. */
    store = s || null;
    return api;
  }

  function slice() {
    if (!store) return null;
    var s = store.get('session.notify');
    return s && typeof s === 'object' ? s : null;
  }

  function items() {
    var s = slice();
    var list = s && s.items;
    return list && list.length ? list.slice() : [];
  }

  /* Writes go to `session.notify.items` / `session.notify.open`. The store coarsens a change key
   * to its first two segments, so both announce as `session.notify` — one key for the whole
   * surface, which is what the title bar subscribes to. */
  function writeItems(list) {
    if (store) store.set('session.notify.items', list);
  }

  function normalizeActions(actions) {
    var out = [];
    if (!actions || !actions.length) return out;
    for (var i = 0; i < actions.length; i++) {
      var a = actions[i];
      if (!a || !a.id) continue;
      out.push({ id: String(a.id), label: String(a.label || a.id) });
    }
    return out;
  }

  /* push({ kind, title, body, threadId, actions }) -> id
   *
   * Prepends, because a title-bar stack reads newest-first and re-sorting on every render is a
   * cost paid for nothing. Returns the id so the caller can mark it read or address it later. */
  function push(spec) {
    var sp = spec || {};
    var rec = {
      id: 'ntf-' + (++seq) + '-' + Date.now().toString(36),
      kind: sp.kind ? String(sp.kind) : 'info',
      title: sp.title ? String(sp.title) : '',
      body: sp.body ? String(sp.body) : '',
      threadId: sp.threadId || null,
      actions: normalizeActions(sp.actions),
      at: new Date().toISOString(),
      read: false
    };
    if (!store) return rec.id;   /* Unbound service returns a neutral value, never throws. */
    var list = items();
    list.unshift(rec);
    while (list.length > MAX_ITEMS) list.pop();
    writeItems(list);
    return rec.id;
  }

  function unread() {
    var list = items();
    var n = 0;
    for (var i = 0; i < list.length; i++) if (!list[i].read) n++;
    return n;
  }

  /* Returns false for an unknown id rather than pretending the mark landed — a silent true here
   * would let a caller believe the badge cleared when it did not. */
  function markRead(id) {
    if (!store || !id) return false;
    var list = items();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id !== id) continue;
      if (list[i].read) return true;
      /* Copy the record rather than mutating in place: subscribers that held the previous array
       * must be able to see that this entry changed. */
      var next = {};
      for (var k in list[i]) if (Object.prototype.hasOwnProperty.call(list[i], k)) next[k] = list[i][k];
      next.read = true;
      list[i] = next;
      writeItems(list);
      return true;
    }
    return false;
  }

  function open(on) {
    if (!store) return false;
    var v = !!on;
    store.set('session.notify.open', v);
    return v;
  }

  function isOpen() {
    var s = slice();
    return !!(s && s.open);
  }

  var api = {
    MAX_ITEMS: MAX_ITEMS,
    bind: bind,
    push: push,
    items: items,
    unread: unread,
    markRead: markRead,
    open: open,
    isOpen: isOpen
  };

  global.PMXNotify = api;
})(window);
