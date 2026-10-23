/* pm7-port/js/00-host.js: window.PM56_HOST, the host contract the 5.6 Pro chat reads when PMConcept7 hosts it.
   It runs before every chat module (the chat56 layer puts it first in the pm56-js script), so the chat's guarded
   hosted branches (`window.PM56_HOST`) see it from their first line. The standalone never defines it.

   Mount (CONTRACT "Mount and scope"): div.pm56-frame#pmw-chat56 (the container pm56host) holding div.pm56-host#pmRoot
   is a layer inside the page's own #chatPanel, exactly as the stand-in layered itself (never moved, wrapped or replaced;
   #chatResizer untouched); div.pm56-host#pmOverlayRoot is a child of <body>. Every .pm56-host carries data-theme,
   mirrored from html[data-theme] (NieR stays on html and paints Basic, as PMConcept7 does).

   Tabs (CONTRACT 6.1): the chat's openEditor/closeEditor/activeEditor map to PM_HOME.openEditor / close / active and
   the 'activate' and 'close' events. A chat tab body is div.pm56-frame > div.pm56-host > div.editor-body, painted by
   the chat (app.js renderEditorBodyFor) and repainted after each chat render while mounted. Every document-ish Home
   kind draws that body for an id that has a chat renderer (PMW.renderers), so plan:X stays kind 'plan' (its icon,
   group, minimum and placement) and still shows the chat's own document. */
(function () {
  'use strict';
  if (window.PM56_HOST) return;
  var doc = document;
  var THEMES = ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light'];
  var app = null;                 // what app.js hands over at boot (PM56_HOST.bind)
  var bodies = Object.create(null);   // tab id -> { el, host, api } for mounted chat tab bodies
  var themeFns = [];

  function pageTheme() {
    var t = doc.documentElement.getAttribute('data-theme') || '';
    if (THEMES.indexOf(t) >= 0) return t;
    return /light/.test(t) ? 'basic-light' : 'basic-dark';
  }
  function hosts() { return Array.prototype.slice.call(doc.querySelectorAll('.pm56-host')); }
  /* the chat's own state classes on <body> are mirrored onto every host (chat56_layer HOST_STATE_CLASSES: its CSS
     reads them on the host, so a toggle restyles the chat only); pm56-reduced also follows PMConcept7's Reduced
     Motion (html[data-motion="reduced"]) */
  var STATE_CLASSES = ['pm56-reduced', 'pm-theming', 'pmx-title-morphing', 'tx-flying'];
  function stateOn(c) {
    if (c === 'pm56-reduced' && doc.documentElement.getAttribute('data-motion') === 'reduced') return true;
    return !!(doc.body && doc.body.classList.contains(c));
  }
  function paintHost(el) {
    var t = pageTheme();
    if (el.getAttribute('data-theme') !== t) el.setAttribute('data-theme', t);
    for (var i = 0; i < STATE_CLASSES.length; i++) {
      var on = stateOn(STATE_CLASSES[i]);
      if (el.classList.contains(STATE_CLASSES[i]) !== on) el.classList.toggle(STATE_CLASSES[i], on);
    }
  }
  function syncState() { hosts().forEach(paintHost); }
  function syncTheme() {
    var t = pageTheme();
    hosts().forEach(function (el) { if (el.getAttribute('data-theme') !== t) el.setAttribute('data-theme', t); });
    return t;
  }
  function el(tag, attrs) {
    var e = doc.createElement(tag);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    return e;
  }

  /* The frame and the body-level layer wrapper carry .pmw-scope (without data-theme), so the Home panels' --pmw-*
     tokens reach every chat host (the looks lane aliases the chat's tokens to them). The wrapper is display:contents
     and holds the overlay root and the effects layer: #pm56Fx takes what the chat appends to <body> (menu ghosts,
     sheet ghosts and flights, the send flight, demo taps), so those keep the chat's scoped styles. */
  var frame = null, root = null, overlay = null, layers = null, fx = null;
  function mount() {
    var cp = doc.getElementById('chatPanel');
    if (!frame) {
      frame = el('div', { id: 'pmw-chat56', class: 'pm56-frame pm56-column pmw-scope', role: 'region', 'aria-label': 'Chat' });
      root = el('div', { id: 'pmRoot', class: 'pm56-host', 'aria-busy': 'true', 'data-pmh-tag': 'literal' });
      frame.appendChild(root);
    }
    if (cp && frame.parentNode !== cp) cp.appendChild(frame);
    if (cp && !doc.documentElement.hasAttribute('data-o55-tour')) cp.setAttribute('data-pm56', 'on');
    if (!layers) {
      layers = el('div', { id: 'pm56-layers', class: 'pmw-scope pm56-layers' });
      overlay = el('div', { id: 'pmOverlayRoot', class: 'pm56-host pm56-overlay', 'data-pmh-tag': 'literal' });
      fx = el('div', { id: 'pm56Fx', class: 'pm56-host pm56-fx', 'aria-hidden': 'true' });
      layers.appendChild(overlay); layers.appendChild(fx);
    }
    if (doc.body && layers.parentNode !== doc.body) doc.body.appendChild(layers);
    paintHost(root); paintHost(overlay); paintHost(fx);
    return !!cp;
  }
  mount();
  /* the chat column widens for a pinned History only while the chat draws it (46-chat.js historyShown): the drawer's
     mode is body[data-ph-drawer] (history.js), so each change asks the narrow ladder to measure again */
  if (typeof MutationObserver === 'function' && doc.body) new MutationObserver(function (recs) {
    var drawer = false, cls = false;
    recs.forEach(function (r) { if (r.attributeName === 'data-ph-drawer') drawer = true; else cls = true; });
    if (cls) syncState();
    if (drawer) { try { if (window.PMW && PMW.narrow && PMW.narrow.schedule) PMW.narrow.schedule(); } catch (_) {} }
  }).observe(doc.body, { attributes: true, attributeFilter: ['data-ph-drawer', 'class'] });
  /* the Guided Tour teaches the page's own chat: while html[data-o55-tour] is on, the column gives #chatPanel back
     (data-pm56 off) and the body-level layers hide (state on elements, never an html-rooted rule) */
  function syncTour() {
    var tour = doc.documentElement.hasAttribute('data-o55-tour'), cp = doc.getElementById('chatPanel');
    if (cp) { if (tour) cp.removeAttribute('data-pm56'); else cp.setAttribute('data-pm56', 'on'); }
    if (layers) layers.hidden = tour;
  }
  syncTour();
  if (typeof MutationObserver === 'function') new MutationObserver(function (recs) {
    var tour = false, motion = false;
    recs.forEach(function (r) { if (r.attributeName === 'data-o55-tour') tour = true; else motion = true; });
    if (tour) syncTour();
    if (motion) syncState();
  }).observe(doc.documentElement, { attributes: true, attributeFilter: ['data-o55-tour', 'data-motion'] });
  /* what the chat appends to <body> goes to the effects layer (class prefixes only the chat uses) */
  var FX_CLASS = /(?:^|\s)(?:pm56-|pmx-|tx-fly|rec-tap)/;
  function isChatFx(n) { return !!(n && n.nodeType === 1 && fx && FX_CLASS.test(n.className && n.className.baseVal != null ? n.className.baseVal : (n.className || ''))); }
  (function redirectBody() {
    var b = doc.body;
    if (!b) return;
    var ap = b.appendChild, ib = b.insertBefore, app = b.append;
    b.appendChild = function (n) { return isChatFx(n) ? fx.appendChild(n) : ap.call(this, n); };
    b.insertBefore = function (n, ref) { return isChatFx(n) ? fx.appendChild(n) : ib.call(this, n, ref); };
    if (app) b.append = function () {
      var rest = [];
      for (var i = 0; i < arguments.length; i++) { if (isChatFx(arguments[i])) fx.appendChild(arguments[i]); else rest.push(arguments[i]); }
      if (rest.length) app.apply(this, rest);
    };
  })();
  /* the page's chat may re-render its own content: the layer goes back in (same node, state kept) */
  (function watchPanel() {
    var cp = doc.getElementById('chatPanel');
    if (!cp || typeof MutationObserver !== 'function') return;
    new MutationObserver(function () { if (frame.parentNode !== cp) mount(); }).observe(cp, { childList: true });
  })();
  if (typeof MutationObserver === 'function') {
    new MutationObserver(function () {
      var before = root.getAttribute('data-theme');
      var t = syncTheme();
      if (t !== before) themeFns.forEach(function (fn) { try { fn(t); } catch (err) { console.error('[pm56] theme hook failed', err); } });
    }).observe(doc.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  /* ---- the chat's document and window listeners hear only the chat ----
     PMConcept7 carries data-action on hundreds of its own controls (Settings, Usage) and has its own Escape, digit and
     Tab handling, while the chat delegates clicks, keys, focus and pointer moves from document and window. While the
     chat's scripts load (from here to the end of app.js's boot, PM56_HOST.endLoad), every such listener they add is
     wrapped: it runs only for an event whose target is inside a .pm56-host (the column, the overlay root, a chat tab
     body). Releases (pointerup, mouseup, pointercancel, keyup, focusout, lostpointercapture) and every other event type
     pass unchanged, so a drag or a press that ends outside still ends. Keyboard events with no element target (focus
     on <body>) reach the chat only while one of its menus or sheets is open. A chat keydown that is Escape stops at the
     chat: the chat's own bubble listeners run from the host (below) and the event goes no further. removeEventListener
     finds a wrapped listener by the function the chat passed. Listeners added after the boot are not wrapped (each
     names its own chat element). */
  var SCOPED = { click: 1, dblclick: 1, auxclick: 1, contextmenu: 1, mousedown: 1, pointerdown: 1, pointerover: 1, pointerout: 1,
    pointerenter: 1, pointerleave: 1, pointermove: 1, mouseover: 1, mouseout: 1, mousemove: 1, keydown: 1, keypress: 1,
    input: 1, change: 1, beforeinput: 1, focusin: 1, focus: 1, wheel: 1, touchstart: 1, touchmove: 1, paste: 1, copy: 1, cut: 1,
    dragstart: 1, dragover: 1, drop: 1, dragenter: 1, dragleave: 1, scroll: 1, submit: 1 };
  var KEYS = { keydown: 1, keypress: 1 };
  var wrapped = new WeakMap();   // fn -> { 'type|capture': wrapper }
  var keyBubble = [];            // the chat's bubble-phase keydown listeners on document/window, in order
  var loading = true;
  function inChatTarget(t) {
    if (!t) return false;
    if (t.nodeType !== 1) t = t.parentElement || null;
    return !!(t && t.closest && t.closest('.pm56-host'));
  }
  function chatModal() { try { return !!(app && app.modalOpen && app.modalOpen()); } catch (_) { return false; } }
  function hears(type, e) {
    if (!SCOPED[type]) return true;
    var t = e.target;
    if (inChatTarget(t)) return true;
    if (KEYS[type] && (t === doc.body || t === doc.documentElement || t === doc || t === window)) return chatModal();
    return false;
  }
  function capOf(o) { return !!(o === true || (o && typeof o === 'object' && o.capture)); }
  function patch(target) {
    var add = target.addEventListener, remove = target.removeEventListener;
    target.addEventListener = function (type, fn, opts) {
      if (!loading || !SCOPED[type] || typeof fn !== 'function') return add.call(this, type, fn, opts);
      var key = type + '|' + capOf(opts);
      var map = wrapped.get(fn) || {};
      if (!map[key]) {
        map[key] = function (e) { if (e.__pm56Done && KEYS[type]) return; if (hears(type, e)) return fn.call(this, e); };
        wrapped.set(fn, map);
        if (KEYS[type] && !capOf(opts)) keyBubble.push({ type: type, fn: fn, self: this });
      }
      return add.call(this, type, map[key], opts);
    };
    target.removeEventListener = function (type, fn, opts) {
      var map = typeof fn === 'function' && wrapped.get(fn);
      var w = map && map[type + '|' + capOf(opts)];
      if (w) {
        remove.call(this, type, w, opts);
        if (KEYS[type] && !capOf(opts)) keyBubble = keyBubble.filter(function (k) { return !(k.fn === fn && k.type === type); });
      }
      return remove.call(this, type, fn, opts);
    };
  }
  patch(doc); patch(window);
  /* Escape stops at the chat: on the way up from a chat element, the host runs the chat's bubble keydown listeners
     itself and stops the event, so PMConcept7's document and window handlers never see it */
  function hostKeys(hostEl) {
    if (!hostEl || hostEl.__pm56Keys) return;
    hostEl.__pm56Keys = true;
    hostEl.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || e.__pm56Done) return;
      keyBubble.slice().forEach(function (k) {
        if (k.type !== 'keydown') return;
        try { k.fn.call(k.self, e); } catch (err) { try { console.error('[pm56] keydown listener failed', err); } catch (_) {} }
      });
      e.__pm56Done = true;
      e.stopPropagation();
    });
  }
  /* a press outside the chat dismisses the chat's open menu, as a click outside it does in the standalone (added
     with the unwrapped method: it is the one listener here that must hear the page) */
  EventTarget.prototype.addEventListener.call(doc, 'pointerdown', function (e) {
    if (inChatTarget(e.target)) return;
    try { if (app && app.dismissOutside) app.dismissOutside(e); } catch (err) { try { console.error('[pm56] dismiss failed', err); } catch (_) {} }
  }, true);

  /* ---- observers: a chat MutationObserver on the whole page watches the chat's hosts instead (every PMConcept7
     mutation would otherwise run its callback); hosts mounted later (tab bodies) are added as they mount ---- */
  var watchers = [];
  function observeHosts(obs, opts) {
    watchers.push({ obs: obs, opts: opts });
    hosts().forEach(function (h) { try { obs.observe(h, opts); } catch (_) {} });
  }
  function watchHost(h) { watchers.forEach(function (w) { try { w.obs.observe(h, w.opts); } catch (_) {} }); }

  /* ---- tab kinds per id (the surfaces lane refines these through PM56_SURFACES) ---- */
  var RUN = /^(collab-run|crew-work|review|room|brainstorm|review-evidence|brainstorm-evidence):/;
  var DOCS = /^(teach|memory|revert|debug|lens-source|lens-effective|wonderer|wonder-source|doc):/;
  var RECORD = /^(search|mcp|app|work-record):/;
  function kindFor(id) {
    id = String(id || '');
    if (/^plan:|^plan-query$|^deep-discovery:/.test(id)) return 'plan';
    if (/^file:/.test(id)) return 'editor';
    if (/^link:/.test(id)) return 'browser';
    if (/^thread-/.test(id)) return 'transcript';
    if (RUN.test(id)) return 'run';
    if (RECORD.test(id)) return 'record';
    if (/^context:/.test(id)) return 'context';
    if (/^attachment:/.test(id)) return 'artifact';
    if (DOCS.test(id)) return 'document';
    if (/^artifact(-revision)?:/.test(id) || (app && app.isArtifact && app.isArtifact(id))) return 'artifact';
    return 'document';
  }

  /* ---- a chat tab body: frame (container) > host (scope, theme) > editor body, painted by the chat ---- */
  function mountChatBody(host, state, api) {
    var id = api.id;
    var fr = el('div', { class: 'pm56-frame pm56-tab', 'data-pm56-tab': id });
    var h = el('div', { class: 'pm56-host pm56-tab-host', 'data-pmh-tag': 'literal' });
    var body = el('div', { class: 'editor-body pm56-tab-body', 'data-scroll-key': 'editor', 'data-pm56-tab-body': id, 'data-pmh': 'off', 'data-pm-hover-exempt': 'duplicate-visible-label' });
    h.appendChild(body); fr.appendChild(h); host.appendChild(fr);
    paintHost(h);
    hostKeys(h);
    watchHost(h);
    var rec = { el: body, host: h, api: api, frame: fr };
    bodies[id] = rec;
    function paint() {
      var r = window.PMW && PMW.renderers && PMW.renderers[id];
      try {
        if (r && typeof r.render === 'function') r.render(body, { id: id, api: api });
        else if (app) app.paintBody(body, id);
      } catch (err) { try { console.error('[pm56] tab body failed for ' + id, err); } catch (_) {} }
      /* the tab's label: the router's when it has one, else the chat's (never the chat's 'Untitled' over a label the
         router gave) */
      try {
        var S = window.PM56_SURFACES, lab = S && typeof S.labelFor === 'function' ? S.labelFor(id) : null;
        if (!lab && app) { lab = app.label(id); if (lab === 'Untitled') lab = null; }
        if (lab && api.update) api.update({ label: lab });
      } catch (_) {}
    }
    rec.paint = paint;
    paint();
    if (state && state.scrollTop) body.scrollTop = state.scrollTop;
    return {
      rerender: paint,
      onResize: function () {},
      onShow: function () { paint(); },
      serialize: function () { return { scrollTop: Math.round(body.scrollTop || 0) }; },
      focus: function () { try { body.setAttribute('tabindex', '-1'); body.focus({ preventScroll: true }); } catch (_) {} },
      unmount: function () { if (bodies[id] === rec) delete bodies[id]; }
    };
  }
  var WRAP = ['plan', 'document', 'artifact', 'run', 'transcript', 'context', 'record', 'editor', 'browser'];
  function wrapKinds() {
    var K = window.PMW && PMW.kinds;
    if (!K) return;
    WRAP.forEach(function (kid) {
      var k = K[kid];
      if (!k || k.__pm56) return;
      var own = k.mount;
      k.mount = function (host, state, api) {
        if (window.PMW && PMW.renderers && PMW.renderers[api.id]) return mountChatBody(host, state, api);
        return own.apply(this, arguments);
      };
      k.__pm56 = true;
    });
  }

  /* ---- what the chat calls ---- */
  var H = window.PM56_HOST = {
    hosted: true,
    version: 1,
    THEMES: THEMES.slice(),
    theme: pageTheme,
    syncTheme: syncTheme,
    onTheme: function (fn) { if (typeof fn === 'function') themeFns.push(fn); },
    root: function () { return root; },
    overlay: function () { return overlay; },
    fx: function () { return fx; },
    /* the class names the chat56 layer renamed in the chat's CSS and JS (old -> new) */
    classMap: (window.PM56_CLASS_MAP && typeof window.PM56_CLASS_MAP === 'object') ? window.PM56_CLASS_MAP : {},
    observe: observeHosts,
    /* History pinned beside the messages (the chat column's history_pinned, CONTRACT 6.1): history.js reads and writes
       it here; the chat column widens for it while the drawer is drawn pinned (drawsHistory) */
    historyPinned: function () { try { return !!(window.PMW && PMW.chatCol && PMW.chatCol.historyPinned()); } catch (_) { return false; } },
    setHistoryPinned: function (on) {
      on = !!on;
      if (H.historyPinned() === on) return;
      try { if (window.PM_HOME && PM_HOME.command) PM_HOME.command('ui.chat_column.pin_history', { history_pinned: on }); else if (PMW.chatCol) PMW.chatCol.setHistoryPinned(on); } catch (err) { try { console.error('[pm56] pin History failed', err); } catch (_) {} }
    },
    onHistoryPinned: function (fn) {
      try { if (window.PMW && PMW.bus && PMW.bus.on) PMW.bus.on('chat:column', function (e) { if (e && typeof e.history_pinned === 'boolean') fn(e.history_pinned); }); } catch (_) {}
      try { if (window.PM_HOME && PM_HOME.on) PM_HOME.on('layout', function () { fn(H.historyPinned()); }); } catch (_) {}
    },
    drawsHistory: function () { return !!(doc.body && doc.body.getAttribute('data-ph-drawer') === 'pinned') && H.shown(); },
    frame: function () { return frame; },
    hosts: hosts,
    paintHost: paintHost,
    /* the chat column's width and height (JS width checks read these, never the window); the window when the column
       is hidden */
    width: function () { var w = frame && frame.clientWidth; return w > 0 ? w : window.innerWidth; },
    height: function () { var h = frame && frame.clientHeight; return h > 0 ? h : window.innerHeight; },
    inChat: function (t) { return !!(t && t.nodeType === 1 && t.closest && t.closest('.pm56-host')) || !!(t && t.parentElement && t.parentElement.closest && t.parentElement.closest('.pm56-host')); },
    shown: function () {
      if (!frame || !frame.isConnected) return false;
      if (doc.documentElement.hasAttribute('data-o55-tour')) return false;
      if (window.PMW && PMW.standIn && PMW.standIn.isOn && PMW.standIn.isOn()) return false;
      return true;
    },
    kindFor: kindFor,
    mountChatBody: mountChatBody,
    wrapKinds: wrapKinds,
    bodies: function () { return Object.keys(bodies); },
    /* app.js hands over its handles once, at boot; endLoad stops wrapping new listeners */
    bind: function (a) { app = a; wrapKinds(); hostKeys(root); hostKeys(overlay); hostKeys(fx); return H; },
    endLoad: function () { loading = false; },
    hears: hears,
    /* PMConcept7's Reduced Motion (html[data-motion="reduced"]) or the chat's own body.pm56-reduced */
    reduced: function () { return doc.documentElement.getAttribute('data-motion') === 'reduced' || !!(doc.body && doc.body.classList.contains('pm56-reduced')); },
    app: function () { return app; },
    /* the chat opened an id: the surfaces lane's router first, else one Home tab with the chat's body */
    openTab: function (id, o) {
      o = o || {};
      var S = window.PM56_SURFACES;
      if (S && typeof S.open === 'function') {
        try {
          /* the chat's own body for this id, for the kinds the router gives the chat's body */
          var r = S.open(id, Object.assign({ render: function (body) { if (app) app.paintBody(body, id); } }, o));
          if (r) return r;
        } catch (err) { try { console.error('[pm56] PM56_SURFACES.open failed', err); } catch (_) {} }
      }
      if (!window.PM_HOME || !PM_HOME.openEditor) return null;
      wrapKinds();
      try { if (window.PM_PAGES && PM_PAGES.current && PM_PAGES.current !== 'dashboard' && PM_PAGES.go) PM_PAGES.go('dashboard'); } catch (_) {}
      var ev = o.event || null;
      return PM_HOME.openEditor(id, {
        label: o.label || (app ? app.label(id) : id), kind: o.kind || kindFor(id), by: o.by || 'user',
        background: o.background != null ? !!o.background : !!(ev && (ev.ctrlKey || ev.metaKey)),
        where: o.where || (ev && ev.altKey ? 'panel' : undefined),
        mode: o.mode, line: o.line,
        render: function (body) { if (app) app.paintBody(body, id); }
      });
    },
    closeTab: function (id) {
      var S = window.PM56_SURFACES;
      if (S && typeof S.close === 'function') {
        try { if (S.close(id)) return true; } catch (err) { try { console.error('[pm56] PM56_SURFACES.close failed', err); } catch (_) {} }
      }
      if (!window.PM_HOME || !PM_HOME.close) return false;
      var r = PM_HOME.close(id);
      return !(r && r.ok === false);
    },
    isOpen: function (id) {
      try { return !!(window.PMW && PMW.state && PMW.state.layout && PMW.state.layout.tabs[id]); } catch (_) { return false; }
    },
    /* a Home tab is on screen: Home is the page in front, the tab is its panel's active tab, that panel is expanded,
       not behind a maximized panel and not one the last paint hid (the narrow switcher). Read from a class and the
       layout model, never a box (a box read in a look switch pays the page's pending restyle); a tab opened this
       moment counts before its first paint */
    tabShown: function (id) {
      try {
        var P = window.PMW, l = P && P.state && P.state.layout, M = P && P.model;
        if (!l || !M || typeof M.panelOf !== 'function') return false;
        var page = doc.getElementById('panel-dashboard');
        if (page && !page.classList.contains('active')) return false;
        var p = M.panelOf(l, id);
        if (!p || p.active !== id || p.collapsed) return false;
        var narrow = !!(P.narrow && P.narrow.singleColumn && P.narrow.singleColumn());
        if (!narrow && l.view && l.view.maximized && l.view.maximized !== p.id) return false;
        var rects = P.render && P.render.rects ? P.render.rects() : null;
        return !(rects && rects.hidden && rects.hidden[p.id]);
      } catch (_) { return false; }
    },
    /* the page in front changed (Home's #panel-dashboard gains or loses .active): no Home event says so */
    onPage: function (fn) {
      var page = doc.getElementById('panel-dashboard');
      if (!page || typeof MutationObserver !== 'function' || typeof fn !== 'function') return;
      new MutationObserver(function () { try { fn(); } catch (err) { try { console.error('[pm56] page hook failed', err); } catch (_) {} } })
        .observe(page, { attributes: true, attributeFilter: ['class'] });
    },
    /* register the chat's body for a tab that is already open (restored from the saved layout) */
    adopt: function (id) {
      if (!window.PMW || !PMW.renderers) return;
      PMW.renderers[id] = { render: function (body) { if (app) app.paintBody(body, id); }, label: app ? app.label(id) : null };
      try { PM_HOME.refresh(id); } catch (_) {}
    },
    /* repaint every mounted chat tab body (after a chat render) */
    repaintTabs: function () { Object.keys(bodies).forEach(function (id) { var b = bodies[id]; if (b && b.el.isConnected && b.paint) b.paint(); }); }
  };
})();
