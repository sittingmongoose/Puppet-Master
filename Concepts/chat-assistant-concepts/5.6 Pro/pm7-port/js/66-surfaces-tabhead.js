/* pm7-port/js/66-surfaces-tabhead.js: a chat-drawn tab carries the shared header row every Home kind draws (Home
   CONTRACT section 5, D12), so a plan, a run view or a context tab beside a terminal or an editor reads as the same kind
   of tab: the kind's mark and word, then the tab-level actions. The chat's own controls stay in its body.
   - Return to chat (canon: at narrow widths a plan or run view is full width with "Return to chat"): only while the chat
     is not on screen (folded to its edge strip, or hidden); it brings the chat back over the centre.
   - Maximize / Restore (Shift+Escape), as every Home kind has.
   The row is the panels' own (api.headerRow): 30 px, icon-only under 520 px, hidden under 150 px of body height.
   It wraps the foundation's chat-body mount (PM56_HOST.mountChatBody) for the document kinds, outermost, so a tab whose
   id has a chat renderer draws row + body and every other tab keeps its kind's own drawing. */
(function () {
  'use strict';
  var W = window;
  var KINDS = { plan: 'Plan', document: 'Document', artifact: 'Artifact', run: 'Run', transcript: 'Agent transcript', context: 'Context detail', record: 'Record' };
  var ICON = { plan: 'plan', document: 'document', artifact: 'artifact', run: 'run', transcript: 'transcript', context: 'context', record: 'record' };

  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function chatOnScreen() { try { return !!(W.PM_HOME && PM_HOME.chat && PM_HOME.chat.isOpen()); } catch (_) { return true; } }
  function tabIcon(api, kid) {
    try { var r = W.PM56_SURFACES && PM56_SURFACES.route ? PM56_SURFACES.route(api.id) : null; if (r && r.icon) return r.icon; } catch (_) {}
    return ICON[kid] || 'document';
  }

  function mountWithHead(host, state, api, kid) {
    var H = W.PM56_HOST;
    var wrap = el('div', 'pm56-frame-wrap');
    var slot = el('div', 'pm56-frame-slot');
    var row = api.headerRow({ label: KINDS[kid] + ' controls', left: left(), actions: actions() });
    wrap.appendChild(row.el);
    wrap.appendChild(slot);
    host.appendChild(wrap);
    var inner = H.mountChatBody(slot, state, api) || {};
    function left() { return [{ id: 'kind', icon: tabIcon(api, kid), text: KINDS[kid], strong: true }]; }
    function actions() {
      var out = [];
      if (!chatOnScreen()) out.push({ id: 'chat', label: 'Return to chat', icon: 'chat', detail: 'The chat waits at the edge of the window',
        run: function () { try { if (W.PMW && PMW.chatCol && PMW.chatCol.show) PMW.chatCol.show(); } catch (_) {} } });
      var m = api.isMaximized && api.isMaximized();
      out.push({ id: 'max', label: m ? 'Restore' : 'Maximize', icon: m ? 'restore' : 'maximize', shortcut: 'Shift+Escape', run: function () { api.toggleMaximize(); } });
      return out;
    }
    function refresh() { try { row.set({ left: left(), actions: actions() }); } catch (_) {} }
    var offs = [];
    try { offs.push(api.on('maximize', refresh)); } catch (_) {}
    try { if (W.PM_HOME && PM_HOME.on) { offs.push(PM_HOME.on('narrow', refresh)); offs.push(PM_HOME.on('chat', refresh)); } } catch (_) {}
    try { if (W.PMW && PMW.bus && PMW.bus.on) { var o = PMW.bus.on('chat:peek', refresh); if (typeof o === 'function') offs.push(o); } } catch (_) {}
    return Object.assign({}, inner, {
      onShow: function () { refresh(); if (inner.onShow) return inner.onShow.apply(inner, arguments); },
      unmount: function () {
        offs.forEach(function (f) { try { if (typeof f === 'function') f(); } catch (_) {} });
        if (inner.unmount) return inner.unmount.apply(inner, arguments);
      }
    });
  }

  function wrapKinds() {
    var K = W.PMW && PMW.kinds, H = W.PM56_HOST;
    if (!K || !H || typeof H.mountChatBody !== 'function') return false;
    try { if (H.wrapKinds) H.wrapKinds(); } catch (_) {}   // the foundation's wrap first, so this one is outermost
    Object.keys(KINDS).forEach(function (kid) {
      var k = K[kid];
      if (!k || k.__pm56head) return;
      var below = k.mount;
      k.mount = function (host, state, api) {
        if (W.PMW && PMW.renderers && PMW.renderers[api.id] && typeof api.headerRow === 'function') return mountWithHead(host, state, api, kid);
        return below.apply(this, arguments);
      };
      k.__pm56head = true;
    });
    return true;
  }

  /* Tabs restored from the saved layout mount at boot, before the chat has booted and adopted them (00-host.js adopt
     registers their renderer later): those drew their Home kind's own copy (a context tab its own numbers, a
     deep-discovery tab the Home plan kind's). Once the chat's renderer is there, such a tab remounts and draws the
     chat's body and this row; a project switch that restores another layout does the same. */
  /* the port's own ids (context:<thread>, attachment:<...>) are the chat's alone: the chat adopts the ones restored at
     its boot (app.js chatOwnsId); a layout restored later (a project switch) is adopted here */
  var OWN = /^(context:|attachment:)/;
  function adoptOwn() {
    var P = W.PMW, H = W.PM56_HOST, A = H && H.app ? H.app() : null;
    if (!P || !P.renderers || !P.state || !P.state.layout || !A || typeof A.paintBody !== 'function') return;
    Object.keys(P.state.layout.tabs || {}).forEach(function (id) {
      if (!OWN.test(id) || P.renderers[id]) return;
      P.renderers[id] = { render: function (body) { var a = H.app(); if (a && a.paintBody) a.paintBody(body, id); }, label: null };
    });
  }
  function remountAdopted() {
    var P = W.PMW;
    if (!P || !P.instances || !P.renderers || !P.render || !P.render.unmountTab) return 0;
    adoptOwn();
    var n = 0;
    Object.keys(P.instances).forEach(function (id) {
      var e = P.instances[id];
      if (!P.renderers[id] || !e || !e.host || e.host.querySelector('.pm56-tab')) return;
      try { P.render.unmountTab(id); n += 1; } catch (_) {}
    });
    if (n) { try { P.render.schedule({ animate: false }); } catch (_) {} }
    return n;
  }
  var tries = 0;
  (function attempt() { if (wrapKinds() || ++tries > 200) return; setTimeout(attempt, 50); })();
  // the chat adopts restored tabs a moment after its boot: look for them for the first seconds, then on layout changes
  var sweeps = 0;
  (function sweep() { remountAdopted(); if (++sweeps < 24) setTimeout(sweep, 500); })();
  (function bindLayout() {
    if (W.PM_HOME && PM_HOME.on) { PM_HOME.on('layout', function () { setTimeout(remountAdopted, 0); }); return; }
    setTimeout(bindLayout, 200);
  })();
  var SF = W.PM56_SURFACES = W.PM56_SURFACES || {};
  SF.wrapTabHeads = wrapKinds;
  SF.remountAdopted = remountAdopted;
})();
