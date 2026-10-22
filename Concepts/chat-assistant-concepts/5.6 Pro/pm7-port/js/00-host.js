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
  function paintHost(el) {
    var t = pageTheme();
    if (el.getAttribute('data-theme') !== t) el.setAttribute('data-theme', t);
  }
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

  var frame = null, root = null, overlay = null;
  function mount() {
    var cp = doc.getElementById('chatPanel');
    if (!frame) {
      frame = el('div', { id: 'pmw-chat56', class: 'pm56-frame pm56-column', role: 'region', 'aria-label': 'Chat' });
      root = el('div', { id: 'pmRoot', class: 'pm56-host', 'aria-busy': 'true' });
      frame.appendChild(root);
    }
    if (cp && frame.parentNode !== cp) cp.appendChild(frame);
    if (cp) cp.setAttribute('data-pm56', 'on');
    if (!overlay) overlay = el('div', { id: 'pmOverlayRoot', class: 'pm56-host pm56-overlay' });
    if (doc.body && overlay.parentNode !== doc.body) doc.body.appendChild(overlay);
    paintHost(root); paintHost(overlay);
    return !!cp;
  }
  mount();
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
  /* a press outside the chat dismisses the chat's open menu, as a click outside it does in the standalone */
  doc.addEventListener('pointerdown', function (e) {
    if (inChatTarget(e.target)) return;
    try { if (app && app.dismissOutside) app.dismissOutside(e); } catch (err) { try { console.error('[pm56] dismiss failed', err); } catch (_) {} }
  }, true);

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
    if (DOCS.test(id)) return 'document';
    if (/^artifact(-revision)?:/.test(id) || (app && app.isArtifact && app.isArtifact(id))) return 'artifact';
    return 'document';
  }

  /* ---- a chat tab body: frame (container) > host (scope, theme) > editor body, painted by the chat ---- */
  function mountChatBody(host, state, api) {
    var id = api.id;
    var fr = el('div', { class: 'pm56-frame pm56-tab', 'data-pm56-tab': id });
    var h = el('div', { class: 'pm56-host pm56-tab-host' });
    var body = el('div', { class: 'editor-body pm56-tab-body', 'data-scroll-key': 'editor', 'data-pm56-tab-body': id, 'data-pmh': 'off' });
    h.appendChild(body); fr.appendChild(h); host.appendChild(fr);
    paintHost(h);
    hostKeys(h);
    var rec = { el: body, host: h, api: api, frame: fr };
    bodies[id] = rec;
    function paint() {
      var r = window.PMW && PMW.renderers && PMW.renderers[id];
      try {
        if (r && typeof r.render === 'function') r.render(body, { id: id, api: api });
        else if (app) app.paintBody(body, id);
      } catch (err) { try { console.error('[pm56] tab body failed for ' + id, err); } catch (_) {} }
      try { if (app && api.update) api.update({ label: app.label(id) }); } catch (_) {}
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
    bind: function (a) { app = a; wrapKinds(); hostKeys(root); hostKeys(overlay); return H; },
    endLoad: function () { loading = false; },
    hears: hears,
    app: function () { return app; },
    /* the chat opened an id: the surfaces lane's router first, else one Home tab with the chat's body */
    openTab: function (id, o) {
      o = o || {};
      var S = window.PM56_SURFACES;
      if (S && typeof S.open === 'function') {
        try { var r = S.open(id, o); if (r) return r; } catch (err) { try { console.error('[pm56] PM56_SURFACES.open failed', err); } catch (_) {} }
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
