/* pm7-port/js/64-surfaces-context.js: Context "More Details" moves from a drawer fixed to the window's right edge
   (styles.css .drawer, 500 px, a 24 px backdrop blur over the chat) to the thread-scoped context-detail tab
   (canon FinalGUISpec 2620-2621: "More Details focuses or opens the thread-scoped context-detail editor tab", Curated
   and Raw; ACD-252). One tab per thread, context:<threadId>, kind 'context' (Home CONTRACT section 2).

   The body is the chat's own drawer content (context.js drawer(), its live numbers, its Curated / Raw toggle, Preview
   compaction, Redacted JSON, Raw projection), drawn for the tab's own thread even after the chat switches threads.
   It is registered as the chat's editorDocument / editorTabLabel for context: ids, so the foundation's hosted
   openEditor renders it and repaints it with the chat. context-details (the ring's More Details, a context card's
   Details) opens or reveals the tab instead of setting state.context.details; close-context-details closes it. */
(function () {
  'use strict';
  var W = window;
  var PRE = 'context:';

  function E() { return W.PM56_EXT || null; }
  function threadOf(st, tid) {
    var list = (st && st.threads) || [];
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === tid) return list[i];
    return null;
  }
  function drawerFn() {
    var e = E(), fns = e && e._slots && e._slots.contextDrawer;
    return fns && fns.length ? fns[fns.length - 1] : null;
  }

  /* the drawer's HTML for one thread: the chat draws the selected thread, so the tab's thread is selected for the
     length of the call and put back (a render, no other side effects) */
  function bodyFor(ctx, tid) {
    var st = ctx.state, fn = drawerFn();
    if (!fn || !st) return '';
    var prev = st.selectedThread, html = '';
    var t = threadOf(st, tid);
    if (!t) return '<article class="editor-doc pm56-ctx-missing"><h1>Context</h1><p>This thread is not in the chat any more.</p></article>';
    st.selectedThread = tid;
    try {
      var c = E().ctx({ thread: t });
      html = fn(c) || '';
    } catch (err) { try { console.error('[pm56-surfaces] context detail failed', err); } catch (_) {} }
    finally { st.selectedThread = prev; }
    // the drawer's own frame becomes the tab's section: no fixed edge, no close (the tab closes), its title says the thread
    html = html.replace('<aside class="drawer ctx-drawer"', '<section class="ctx-drawer pm56-ctx-tab" data-pm56-thread="' + escAttr(tid) + '"')
      .replace(/<\/aside>\s*$/, '</section>')
      .replace('>Context More Details</strong>', '>' + escText(t.title || 'Context') + '</strong>');
    return html;
  }
  function escAttr(s) { return String(s).replace(/[&"<>]/g, function (c) { return { '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function escText(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function openFor(c, tid) {
    if (!c || !c.openEditor) return false;
    c.openEditor(PRE + tid);
    return true;
  }

  var e0 = E();
  if (e0 && typeof e0.slot === 'function') {
    e0.slot('editorTabLabel', function (c) {
      var id = String(c.editorId || '');
      if (id.indexOf(PRE) !== 0) return '';
      var t = threadOf(c.state, id.slice(PRE.length));
      return 'Context · ' + (t ? t.title : 'thread');
    });
    e0.slot('editorDocument', function (c) {
      var id = String(c.editorId || '');
      return id.indexOf(PRE) === 0 ? bodyFor(c, id.slice(PRE.length)) : '';
    });
    e0.chainAction('context-details', function (c) {
      if (!W.PM_HOME || !c || !c.state) return false;
      c.state.context.details = false;
      c.state.menu = null;
      openFor(c, c.state.selectedThread);
      if (c.renderApp) c.renderApp();
      return true;
    });
    e0.chainAction('close-context-details', function (c, btn) {
      if (!W.PM_HOME || !c || !c.state) return false;
      var sec = btn && btn.closest ? btn.closest('[data-pm56-thread]') : null;
      var tid = sec ? sec.getAttribute('data-pm56-thread') : c.state.selectedThread;
      c.state.context.details = false;
      if (c.closeEditor) c.closeEditor(PRE + tid);
      return true;
    });
    /* the drawer flag set any other way (a recorded example, a keyboard path) opens the tab instead */
    e0.slot('afterRender', function (c) {
      var st = c && c.state;
      if (!W.PM_HOME || !st || !st.context || !st.context.details) return;
      st.context.details = false;
      var tid = st.selectedThread;
      setTimeout(function () { var cc = E().ctx(); openFor(cc, tid); if (cc.renderApp) cc.renderApp(); }, 0);
    });
  }
})();
