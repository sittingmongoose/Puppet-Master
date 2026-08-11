/* PMX drafts — Opus 5
 *
 * Each thread has an independent durable draft: text, attachment references, and revision
 * history. It survives thread switches and, through the store's snapshot/rehydrate pair,
 * a simulated restart or crash.
 *
 * Revisions are bounded and deduplicated. There is explicitly no requirement to save every
 * keystroke, so a revision commits on a meaningful boundary: an idle pause with a real
 * change, a thread switch, or immediately before a send.
 *
 * Known schema gap (recorded as GAP-D7): supplied revision entries carry only
 * {savedAt, text} with no attachment snapshot, so restoring one of those cannot restore the
 * attachments that existed at the time. New revisions written here do include a snapshot.
 */
(function (global) {
  'use strict';

  var MAX_REVISIONS = 12;
  var IDLE_MS = 1500;
  var MIN_DELTA = 12;

  var store = null;
  var idleTimers = {};
  var lastCommitted = {};

  function bind(s) { store = s; }

  function slice(threadId) {
    if (!store) return { text: '', attachments: [], revisions: [] };
    var v = store.view(threadId);
    if (!v.draft) v.draft = { text: '', attachments: [], revisions: [] };
    if (!v.draft.attachments) v.draft.attachments = [];
    if (!v.draft.revisions) v.draft.revisions = [];
    return v.draft;
  }

  function get(threadId) { return slice(threadId); }

  function nowIso() { return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'); }

  function setText(threadId, text) {
    var d = slice(threadId);
    d.text = String(text == null ? '' : text);
    scheduleCommit(threadId);
    if (store) store.touchView('draft');
  }

  function scheduleCommit(threadId) {
    if (idleTimers[threadId]) clearTimeout(idleTimers[threadId]);
    idleTimers[threadId] = setTimeout(function () {
      idleTimers[threadId] = null;
      commitRevision(threadId);
    }, IDLE_MS);
  }

  /* Deduplicated and delta-gated, so idle time alone never fills the history with
   * near-identical entries. */
  function commitRevision(threadId, force) {
    var d = slice(threadId);
    var text = d.text || '';
    var prev = d.revisions.length ? d.revisions[d.revisions.length - 1].text : (lastCommitted[threadId] || '');

    if (!force) {
      if (text === prev) return false;
      if (Math.abs(text.length - prev.length) < MIN_DELTA && text.indexOf(prev) === 0) return false;
      if (!text.trim() && !prev) return false;
    }
    if (text === prev) return false;

    d.revisions.push({
      savedAt: nowIso(),
      text: text,
      attachments: (d.attachments || []).slice()
    });
    while (d.revisions.length > MAX_REVISIONS) d.revisions.shift();
    lastCommitted[threadId] = text;
    if (store) store.touchView('draft');
    return true;
  }

  function revisions(threadId) { return slice(threadId).revisions.slice(); }

  function restoreRevision(threadId, index) {
    var d = slice(threadId);
    var rev = d.revisions[index];
    if (!rev) return false;
    /* Restoring is itself a change worth keeping, so the current text is committed first
     * and the restore never destroys what the user had a moment ago. */
    commitRevision(threadId, true);
    d.text = rev.text;
    if (rev.attachments) d.attachments = rev.attachments.slice();
    if (store) store.touchView('draft');
    return true;
  }

  function addAttachment(threadId, ref) {
    var d = slice(threadId);
    if (d.attachments.indexOf(ref) === -1) d.attachments.push(ref);
    if (store) store.touchView('draft');
  }

  function removeAttachment(threadId, ref) {
    var d = slice(threadId);
    var i = d.attachments.indexOf(ref);
    if (i >= 0) d.attachments.splice(i, 1);
    if (store) store.touchView('draft');
  }

  /* Clearing is explicitly DISTINCT from sending: the revision history survives a clear so
   * the text is still recoverable, whereas a send archives it into the conversation. */
  function clear(threadId) {
    var d = slice(threadId);
    commitRevision(threadId, true);
    d.text = '';
    d.attachments = [];
    if (store) store.touchView('draft');
  }

  function archiveOnSend(threadId) {
    var d = slice(threadId);
    commitRevision(threadId, true);
    d.text = '';
    d.attachments = [];
    if (idleTimers[threadId]) { clearTimeout(idleTimers[threadId]); idleTimers[threadId] = null; }
    if (store) store.touchView('draft');
  }

  function flushAll() {
    for (var tid in idleTimers) {
      if (idleTimers[tid]) { clearTimeout(idleTimers[tid]); idleTimers[tid] = null; commitRevision(tid); }
    }
  }

  global.PMXDrafts = {
    bind: bind,
    get: get,
    setText: setText,
    addAttachment: addAttachment,
    removeAttachment: removeAttachment,
    commitRevision: commitRevision,
    revisions: revisions,
    restoreRevision: restoreRevision,
    clear: clear,
    archiveOnSend: archiveOnSend,
    flushAll: flushAll,
    MAX_REVISIONS: MAX_REVISIONS
  };
})(window);
