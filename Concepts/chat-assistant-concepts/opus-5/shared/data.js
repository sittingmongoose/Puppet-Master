/* PMX data — Opus 5
 *
 * Loads the supplied dataset and merges an additive extension over it.
 * The supplied demo/demoData.json is NEVER modified — it is kept byte-identical.
 *
 * Normalization fixes three defects found in the supplied data. Each is corrected here
 * rather than in the source file, and each is recorded in GAP_REPORT.md:
 *   1. thread.updatedAt precedes the last message's sentAt on 11 of 15 threads, so recency
 *      is derived from messages[last].sentAt instead.
 *   2. thread-09 has one backward timestamp jump at index 20.
 *   3. runtime is byte-identical on each user/assistant pair. That is correct semantics —
 *      a user message's provider/model/duration describe the turn it LAUNCHED — but it is
 *      implicit, so we mark it explicitly with runtime.describesTurn.
 */
(function (global) {
  'use strict';

  var data = null;

  function clone(v) {
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(clone);
    var o = {};
    for (var k in v) if (Object.prototype.hasOwnProperty.call(v, k)) o[k] = clone(v[k]);
    return o;
  }

  /* ------------------------------------------------------------------ formatting */

  var LABELS = {
    waiting_for_parent: 'Waiting for parent',
    awaiting_parent: 'Waiting for parent',
    awaiting_question: 'Awaiting question',
    in_progress: 'In progress',
    ready_to_submit: 'Ready to submit',
    not_started: 'Not started',
    ready_to_run: 'Ready to run',
    context_expansion_requested: 'Context expansion requested',
    user_input_requested: 'Waiting for parent',
    clarification_needed: 'Waiting for parent',
    todo_write: 'Todo write',
    single_question: 'Single question'
  };

  function label(v) {
    if (v == null) return '';
    var s = String(v);
    if (LABELS[s]) return LABELS[s];
    if (s.indexOf('_') === -1) return s.charAt(0).toUpperCase() + s.slice(1);
    /* Never let an underscored internal name reach display text. */
    var words = s.split('_');
    return words[0].charAt(0).toUpperCase() + words[0].slice(1) + ' ' + words.slice(1).join(' ');
  }

  /* Stored UTC, rendered in the viewer's locale. */
  function time(iso) {
    if (!iso) return '';
    try { return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }
    catch (e) { return ''; }
  }
  function date(iso) {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
    catch (e) { return ''; }
  }
  function dateTime(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit'
      });
    } catch (e) { return ''; }
  }
  function duration(sec) {
    if (sec == null) return '';
    sec = Math.max(0, Math.round(sec));
    if (sec < 60) return sec + 's';
    var m = Math.floor(sec / 60), s = sec % 60;
    if (m < 60) return m + 'm' + (s ? ' ' + s + 's' : '');
    var h = Math.floor(m / 60);
    m = m % 60;
    return h + 'h' + (m ? ' ' + (m < 10 ? '0' : '') + m + 'm' : '');
  }
  function cost(n) {
    if (n == null) return '';
    try { return '$' + Number(n).toFixed(2); } catch (e) { return String(n); }
  }
  function relative(iso) {
    if (!iso) return '';
    var then = new Date(iso).getTime();
    var now = global.PMX_NOW ? global.PMX_NOW : Date.now();
    var d = Math.max(0, now - then);
    var mins = Math.floor(d / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    var days = Math.floor(hrs / 24);
    if (days < 30) return days + 'd ago';
    return date(iso);
  }

  var fmt = {
    time: time, date: date, dateTime: dateTime,
    duration: duration, cost: cost, label: label, relative: relative
  };

  /* ------------------------------------------------------------------ normalize */

  function normalize(base, ext) {
    var out = clone(base);
    out.threads = out.threads || [];

    if (ext) applyExtension(out, ext);

    var byId = {};
    for (var i = 0; i < out.threads.length; i++) {
      var t = out.threads[i];
      byId[t.id] = t;
      t.messages = t.messages || [];

      /* Defect 2: repair non-monotonic timestamps so ordering is trustworthy. */
      for (var m = 1; m < t.messages.length; m++) {
        var prev = new Date(t.messages[m - 1].sentAt).getTime();
        var cur = new Date(t.messages[m].sentAt).getTime();
        if (cur < prev) {
          t.messages[m].sentAt = new Date(prev + 30000).toISOString().replace(/\.\d{3}Z$/, 'Z');
        }
      }

      /* Defect 3: make the launched-turn semantics of user runtime explicit. */
      for (var k = 0; k < t.messages.length; k++) {
        var msg = t.messages[k];
        msg.threadId = t.id;
        if (msg.runtime && msg.role === 'user') msg.runtime.describesTurn = 'launched';
        if (msg.runtime && !msg.runtime.turnId) msg.runtime.turnId = msg.id;
      }

      /* Defect 1: recency comes from the last message, not the unreliable updatedAt. */
      var last = t.messages[t.messages.length - 1];
      t.lastActivityAt = last ? last.sentAt : t.updatedAt;
      t.storedCount = t.messages.length;
      if (t.initialVisibleMessageCount == null) t.initialVisibleMessageCount = 50;
      t.hiddenCount = Math.max(0, t.storedCount - t.initialVisibleMessageCount);
    }

    out.threadById = function (id) { return byId[id]; };
    out.messagesFor = function (id) { var t = byId[id]; return t ? t.messages : []; };
    out.storedCount = function (id) { var t = byId[id]; return t ? t.storedCount : 0; };

    var repliesById = {};
    (out.scriptedReplies || []).forEach(function (r) { repliesById[r.id] = r; });
    out.scriptedReply = function (threadId, cursor) {
      var t = byId[threadId];
      if (!t || !t.scriptedReplyIds || !t.scriptedReplyIds.length) return null;
      var id = t.scriptedReplyIds[cursor % t.scriptedReplyIds.length];
      return repliesById[id] || null;
    };

    /* The rendered window: the newest N, extended downward when older ranges are loaded. */
    out.visibleSlice = function (threadId, loadedFrom) {
      var t = byId[threadId];
      if (!t) return [];
      var start = t.messages.length - t.initialVisibleMessageCount;
      if (loadedFrom != null) start = Math.min(start, loadedFrom);
      return t.messages.slice(Math.max(0, start));
    };

    out.fmt = fmt;
    return out;
  }

  function applyExtension(out, ext) {
    var byId = {};
    out.threads.forEach(function (t) { byId[t.id] = t; });

    /* Patch existing threads. */
    (ext.patchThreads || []).forEach(function (p) {
      var t = byId[p.id];
      if (!t) return;
      for (var k in p) {
        if (!Object.prototype.hasOwnProperty.call(p, k) || k === 'id') continue;
        if (k === 'appendMessages') continue;
        if (k === 'replaceMessageBody') {
          p[k].forEach(function (r) {
            for (var i = 0; i < t.messages.length; i++) {
              if (t.messages[i].id === r.id) {
                t.messages[i].body = r.body;
                if (r.collapsedByDefault != null) t.messages[i].collapsedByDefault = r.collapsedByDefault;
                if (r.runtime) {
                  for (var rk in r.runtime) t.messages[i].runtime[rk] = r.runtime[rk];
                }
              }
            }
          });
          continue;
        }
        t[k] = p[k];
      }
      if (p.appendMessages) {
        /* Splice before the trailing tail so the newest turn still reads as newest. */
        var at = p.appendAt == null ? t.messages.length : p.appendAt;
        var head = t.messages.slice(0, at);
        var tail = t.messages.slice(at);
        t.messages = head.concat(p.appendMessages, tail);
      }
    });

    /* Whole new threads. */
    (ext.threads || []).forEach(function (t) {
      if (!byId[t.id]) out.threads.push(t);
    });

    (ext.scriptedReplies || []).forEach(function (r) {
      out.scriptedReplies = out.scriptedReplies || [];
      var exists = out.scriptedReplies.some(function (x) { return x.id === r.id; });
      if (!exists) out.scriptedReplies.push(r);
    });
  }

  /* ------------------------------------------------------------------ loading
   * fetch() fails on file:// in Chromium (opaque origin), so a bundle global is the
   * fallback. demo/demoData.bundle.js assigns window.PMX_DEMO_DATA. */
  function loadJSON(url, globalName) {
    return new Promise(function (resolve) {
      if (global[globalName]) { resolve(global[globalName]); return; }
      if (!global.fetch || global.location.protocol === 'file:') { resolve(null); return; }
      global.fetch(url)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(resolve)
        .catch(function () { resolve(null); });
    });
  }

  function load() {
    if (data) return Promise.resolve(data);
    return Promise.all([
      loadJSON('demo/demoData.json', 'PMX_DEMO_DATA'),
      Promise.resolve(global.PMX_DEMO_EXTENSION || null)
    ]).then(function (parts) {
      var base = parts[0];
      if (!base) {
        throw new Error('[pmx-data] demo data unavailable. Serve over http, or load demo/demoData.bundle.js first.');
      }
      data = normalize(base, parts[1]);
      return data;
    });
  }

  global.PMXData = {
    load: load,
    fmt: fmt,
    get: function () { return data; },
    _normalize: normalize
  };
})(window);
