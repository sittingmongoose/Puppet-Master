/* pm7-port/js/63-surfaces-browser.js: the chat's internal browser dialog (bc-browser, browser-capture.js, a 980 px
   centred modal) becomes PMConcept7's Home Browser tab (canon FinalGUISpec 4340-4357: the editor/workspace tab is
   the in-shell browser host, DevTools docked inside it; APR-010). The tab's own toolbar carries the capture hooks
   (Full screenshot, Region screenshot, Select component, DevTools), and what it captures goes to the chat's composer
   destination through the Home browser's bus events (Home CONTRACT 6.1):
   - 'browser:capture' { tabId, capture }: the capture becomes an attachment in the composer tray of the thread on
     screen (origin browser_capture, its picture a labelled fixture drawing, never claimed as a real screenshot);
   - 'browser:send' { how, what }: 'capture' sends that capture as its own message, 'send' sends the picked component
     as its own message (BROWSER-002: neither reads the composer's text), 'list' adds it to the composer as the next
     numbered line, 'insert' puts it at the composer's caret.
   bc-open (the chat's only route into the dialog) opens or reveals the one capture browser tab on the dialog's
   fixture page; a dialog of type bc-browser opened any other way is turned into the tab after the render.
   Destination: the dialog was modal, so its captures always went to the thread it was opened over. The tab outlives
   that, so it remembers the thread it was opened from, and what it captures goes there even after the chat shows
   another thread, with a notice naming the thread (list and insert write into the composer, so the chat first shows
   that thread). A thread that is gone refuses the send and says so. A browser tab the chat did not open (the "+"
   menu, an agent's) sends to the thread on screen. */
(function () {
  'use strict';
  var W = window;
  var TAB = 'browser:pm56-capture';
  var PAGE = { ordinary: 'https://app.internal/dashboards/query-performance', title: 'Query performance dashboard' };
  var seq = 0;

  function E() { return W.PM56_EXT || null; }
  function SF() { return W.PM56_SURFACES || {}; }
  function chatCtx() { var e = E(); try { return e && e.ctx ? e.ctx() : null; } catch (_) { return null; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function iso() { return new Date().toISOString(); }

  var origins = {};   // browser tab id -> { thread, destination } it was opened from
  function openBrowser(ev) {
    var c = chatCtx(), st = c && c.state;
    if (st) {
      var buf = bufferFor(st.selectedThread);
      origins[TAB] = { thread: st.selectedThread, destination: buf && buf.destination ? JSON.parse(JSON.stringify(buf.destination)) : null };
    }
    return SF().openHome && SF().openHome({ kind: 'browser', id: TAB, url: PAGE.ordinary, label: PAGE.title,
      title: 'Browser · ' + PAGE.title }, ev);
  }
  function threadById(st, tid) {
    var list = (st && st.threads) || [];
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === tid) return list[i];
    return null;
  }
  /* where a capture from this tab goes: { ok, thread, onScreen } or { ok: false, why } */
  function destinationFor(tabId) {
    var c = chatCtx(), st = c && c.state;
    if (!st) return { ok: false, why: 'The chat is not ready.' };
    var o = origins[tabId];
    var tid = o ? o.thread : st.selectedThread;
    var t = threadById(st, tid);
    if (!t) return { ok: false, why: 'The thread this browser was opened from is gone, so nothing was sent.' };
    return { ok: true, thread: t, onScreen: st.selectedThread === tid, origin: o || null };
  }
  function notify(title, detail) { var c = chatCtx(); try { if (c && c.toast) c.toast(title, detail || ''); } catch (_) {} }

  var e0 = E();
  if (e0 && typeof e0.chainAction === 'function') {
    e0.chainAction('bc-open', function (c, btn, ev) {
      if (!W.PM_HOME) return false;
      if (c && c.closeMenu) c.closeMenu();
      openBrowser(ev);
      return true;
    });
    /* a bc-browser dialog opened by any other path (a recorded example, a test hook) becomes the tab */
    e0.slot('afterRender', function (c) {
      var st = c && c.state;
      if (!W.PM_HOME || !st || !st.dialog || st.dialog.type !== 'bc-browser') return;
      st.dialog = null;
      setTimeout(function () { if (c.renderOverlays) c.renderOverlays(); openBrowser(null); }, 0);
    });
  }

  /* ---- the capture's picture: a labelled drawing (browser-capture.js fixtureImage: never a real screenshot) ---- */
  function fixtureImage(o) {
    var w = Math.max(120, Math.min(480, o.w || 480)), h = Math.max(80, Math.round(w * ((o.h || 270) / Math.max(1, o.w || 480))));
    h = Math.min(h, 360);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<rect width="100%" height="100%" fill="#1d2230"/><rect x="8" y="8" width="' + (w - 16) + '" height="' + (h - 16) + '" fill="none" stroke="#8a93a8" stroke-dasharray="4 3"/>' +
      '<text x="50%" y="44%" fill="#e6e9f0" font-family="sans-serif" font-size="13" text-anchor="middle">' + esc(o.label) + '</text>' +
      '<text x="50%" y="58%" fill="#aab2c4" font-family="sans-serif" font-size="11" text-anchor="middle">' + esc(o.sub || '') + '</text>' +
      '<text x="50%" y="74%" fill="#8a93a8" font-family="sans-serif" font-size="10" text-anchor="middle">FIXTURE IMAGE — not a real screenshot</text></svg>';
    return { url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), w: w, h: h };
  }
  function capLabel(c) {
    if (!c) return 'Capture';
    if (c.kind === 'component') return 'Component ' + (c.comp || '');
    if (c.kind === 'region') return 'Region screenshot';
    if (c.kind === 'page') return 'Full page screenshot';
    return 'Full screenshot';
  }
  function compLabel(i) { return i ? (i.comp ? '<' + i.comp + '>' : '<' + (i.el || 'element') + '>') : 'component'; }
  function pageOf(c) { return (c && (c.title || c.page)) || PAGE.title; }

  /* ---- the composer: the tray, the text ---- */
  function runtime() { return W.PM56_RUNTIME || {}; }
  function bufferFor(tid) {
    var RT = runtime();
    return RT.composer && typeof RT.composer.bufferFor === 'function' ? RT.composer.bufferFor(tid) : null;
  }
  function showChat() { try { if (W.PMW && PMW.chatCol && PMW.chatCol.show) PMW.chatCol.show(); } catch (_) {} }
  function attach(c, dest) {
    var ctx = chatCtx();
    if (!ctx || !ctx.state) return false;
    var tid = dest && dest.thread ? dest.thread.id : ctx.state.selectedThread, buf = bufferFor(tid);
    if (!buf || !Array.isArray(buf.attachments)) return false;
    seq += 1;
    var label = capLabel(c), sub = (c.w ? c.w + ' × ' + c.h + ' px · ' : '') + pageOf(c);
    var img = fixtureImage({ w: c.w, h: c.h, label: label, sub: sub });
    var rec = { id: 'att-pm56-bc-' + seq, demo: true, created_at: iso(), process_state: 'ready', origin: 'browser_capture', kind: 'image',
      name: label + ' · ' + pageOf(c), size: null, mime: 'image/svg+xml', source_label: 'Browser capture · ' + pageOf(c),
      producer: { label: 'You', detail: 'Captured in the browser tab' }, hash: 'fixture-' + seq, related: null, version: null, revisions: null,
      live_drift: null, retention: { holds: [], eligible_for_deletion: true, reason: '' }, materialization: [], transform: '',
      filesafe: { status: 'not_scanned', note: 'A fixture drawing, not a real screenshot.' }, export_history: [], folder_manifest: null,
      artifact_ref: null, error: null, pm56_capture: { kind: c.kind, w: c.w, h: c.h, url: c.url || PAGE.ordinary, page: pageOf(c) } };
    Object.defineProperty(rec, '_previewUrl', { value: img.url, enumerable: false, writable: true, configurable: true });
    buf.attachments.push(rec);
    try { var AT = runtime().attachments; if (AT && AT.registerRecord) AT.registerRecord(rec); } catch (_) {}
    if (ctx.renderApp) ctx.renderApp();
    return rec;
  }
  function removeCaptureAttachment(c, dest) {
    var ctx = chatCtx(); if (!ctx || !ctx.state) return;
    var buf = bufferFor(dest && dest.thread ? dest.thread.id : ctx.state.selectedThread); if (!buf || !Array.isArray(buf.attachments)) return;
    for (var i = buf.attachments.length - 1; i >= 0; i--) {
      var a = buf.attachments[i], pc = a && a.pm56_capture;
      if (pc && pc.kind === c.kind && pc.w === c.w && pc.h === c.h) { buf.attachments.splice(i, 1); return; }
    }
  }
  function composerEl() { return document.querySelector('.pm56-host textarea[data-input="composer"]') || document.querySelector('textarea[data-input="composer"]'); }
  function writeComposer(text, caret) {
    var el = composerEl();
    if (!el) return false;
    el.value = text;
    try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) {}
    try { el.focus({ preventScroll: true }); el.setSelectionRange(caret, caret); } catch (_) {}
    return true;
  }
  function listLine(ref) {
    var el = composerEl(); if (!el) return false;
    var v = String(el.value || '').replace(/\s+$/, '');
    var n = (v.match(/^\s*\d+\.\s/gm) || []).length + 1;
    var next = (v ? v + '\n' : '') + n + '. ' + ref + ' ';
    return writeComposer(next, next.length);
  }
  function insertAtCaret(ref) {
    var el = composerEl(); if (!el) return false;
    var v = String(el.value || ''), s = el.selectionStart != null ? el.selectionStart : v.length, e = el.selectionEnd != null ? el.selectionEnd : s;
    var before = v.slice(0, s), after = v.slice(Math.max(s, e)), pre = before && !/\s$/.test(before) ? ' ' : '';
    var next = before + pre + ref + ' ' + after;
    return writeComposer(next, (before + pre + ref + ' ').length);
  }

  /* ---- its own message (BROWSER-002: built from the capture alone, never from the composer) ---- */
  function post(kind, label, sub, img, extra, dest) {
    var ctx = chatCtx();
    if (!ctx || !ctx.appendMessage) return false;
    var thread = dest && dest.thread ? dest.thread : (ctx.activeThread ? ctx.activeThread() : null);
    seq += 1;
    var msg = Object.assign({ id: 'bc-msg-pm56-' + seq, role: 'user', type: 'bc-capture', body: '[Browser capture · ' + kind + ' · ' + label + ']',
      sentAt: iso(), kind: kind, image: img.url, imgW: img.w, imgH: img.h, label: label, sub: sub || '', instruction: '', rect: null,
      contextId: null, destinationLabel: thread ? thread.title : 'This chat', destinationRef: null, isolatedSubmission: true, demo: true }, extra || {});
    ctx.appendMessage(msg, thread);
    if (ctx.renderApp) ctx.renderApp();
    return true;
  }

  function onCapture(e) {
    if (!e || !e.capture || e.capture.kind === 'refused') return;
    var dest = destinationFor(e.tabId);
    if (!dest.ok) { notify('Not added', dest.why); return; }
    attach(e.capture, dest);
    if (!dest.onScreen) notify('Added to ' + dest.thread.title, 'The capture waits in that thread’s composer; this browser was opened from it.');
  }
  function onSend(e) {
    if (!e || !e.what) return;
    var dest = destinationFor(e.tabId);
    if (!dest.ok) { notify('Not sent', dest.why); return; }
    showChat();
    if (e.how === 'capture') {
      var c = e.what, label = capLabel(c), sub = (c.w ? c.w + ' × ' + c.h + ' px · ' : '') + pageOf(c);
      removeCaptureAttachment(c, dest);
      post(c.kind === 'page' ? 'page' : c.kind === 'region' ? 'region' : c.kind === 'component' ? 'component' : 'visible', label, sub,
        fixtureImage({ w: c.w, h: c.h, label: label, sub: sub }), null, dest);
      if (!dest.onScreen) notify('Sent to ' + dest.thread.title, 'This browser was opened from that thread.');
      return;
    }
    var i = e.what, ref = compLabel(i) + ' on ' + PAGE.title;
    if (e.how === 'send') {
      var lab = 'Select Component · ' + compLabel(i);
      post('component', lab, (i.w ? i.w + ' × ' + i.h + ' px · ' : '') + PAGE.title, fixtureImage({ w: i.w, h: i.h, label: lab, sub: i.locator || '' }),
        { instruction: '', locator: i.locator || null, source: i.src || null }, dest);
      if (!dest.onScreen) notify('Sent to ' + dest.thread.title, 'This browser was opened from that thread.');
      return;
    }
    // list and insert write into the composer on screen: the chat shows the destination thread first, and says so
    var A = W.PM56_APP;
    var run = function () { if (e.how === 'list') listLine(ref); else if (e.how === 'insert') insertAtCaret(ref); };
    if (dest.onScreen) { run(); return; }
    if (A && A.switchThread) A.switchThread(dest.thread.id);
    notify('Showing ' + dest.thread.title, 'This browser was opened from that thread.');
    (W.requestAnimationFrame || setTimeout)(run);
  }

  var bound = false, tries = 0;
  (function bind() {
    if (bound) return;
    if (W.PMW && PMW.bus && typeof PMW.bus.on === 'function') {
      bound = true;
      PMW.bus.on('browser:capture', onCapture);
      PMW.bus.on('browser:send', onSend);
      return;
    }
    if (++tries < 200) setTimeout(bind, 50);
  })();

  var S = W.PM56_SURFACES = W.PM56_SURFACES || {};
  S.openBrowser = function () { return openBrowser(null); };
  S.browserOrigins = function () { return JSON.parse(JSON.stringify(origins)); };
})();
