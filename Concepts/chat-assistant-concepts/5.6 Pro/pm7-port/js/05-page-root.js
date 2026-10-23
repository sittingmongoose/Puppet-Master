/* pm7-port/js/05-page-root.js: what the chat would write on the page's root, hosted (fix lane, 2026-10-22). Loads
   before the chat's modules; pm7-port/tools/patches_fix.py is the other half.

   1. PM56_ROOT_STYLE: the custom properties the standalone writes on <html> (--tx-hold-min on every frame of a turn's
      room hold, History's --ph-x, -y, -h, -pane and --ph-user-w, the Ask Card's --qs-ask-room, the dividers'
      --editor-w, --history-w and --activity-w) land on the chat's own hosts instead, where the chat's rules read them.
      On <html> every element of PMConcept7 inherited them, so each write restyled the whole page, and the Usage board
      re-fits every card when <html>'s style changes.
   2. The body state the hosted CSS reads in place of four body:has(...) rules: data-pm56-drag while a divider drags,
      data-pm56-activity-transient while a transient Activity Detail shows, data-pm56-editor-revealed while the
      workspace shows its editor. A :has() on <body> was checked again on every insertion anywhere in the page, and
      each check restyled the chat's hosts.

   Measured on the integrated build (live agent turn, 2400 x 900, 759 px column, GPU Chrome on the P1000): long tasks
   16.6 s of a 26 s turn before, see handoff/fix.md for after. The standalone never loads this file. */
(function () {
  'use strict';
  if (!window.PM56_HOST) return;
  var doc = document, IDS = ['pmRoot', 'pmOverlayRoot', 'pm56Fx'];

  function hosts(name) {
    var out = [];
    /* Only the body-level drawer consumes these viewport coordinates. The
       gutter uses its own pane's container width; publishing drawer geometry
       on pmRoot would invalidate the entire transcript on a column resize. */
    if (/^--ph-(?:x|y|h|pane)$/.test(name || '')) {
      var overlay = doc.getElementById('pmOverlayRoot');
      if (overlay) return [overlay];
    }
    for (var i = 0; i < IDS.length; i++) { var el = doc.getElementById(IDS[i]); if (el) out.push(el); }
    return out.length ? out : [doc.documentElement];   /* before the hosts exist, where the standalone wrote */
  }
  window.PM56_ROOT_STYLE = {
    setProperty: function (name, value) {
      var v = String(value), list = hosts(name);
      for (var i = 0; i < list.length; i++) if (list[i].style.getPropertyValue(name) !== v) list[i].style.setProperty(name, v);
    },
    removeProperty: function (name) {
      var list = hosts(name);
      for (var i = 0; i < list.length; i++) if (list[i].style.getPropertyValue(name)) list[i].style.removeProperty(name);
    },
    getPropertyValue: function (name) { return hosts(name)[0].style.getPropertyValue(name); }
  };

  /* 3. The Ask Card's dock height. --decision-h is read only by .chat-float; while a card morphs (questions.js
     trackAskDock, every frame for up to 1.2 s) the value goes on the float alone, because on .chat-stage an inherited
     custom property changed each frame restyled the whole stage. The settled value goes on the stage as before and the
     float's own copy is dropped, so the float reads the stage again. */
  window.PM56_DOCK_H = function (stage, value, frame) {
    var floats = stage.querySelectorAll('.chat-float'), i;
    if (frame) {
      for (i = 0; i < floats.length; i++) if (floats[i].style.getPropertyValue('--decision-h') !== value) floats[i].style.setProperty('--decision-h', value);
      return;
    }
    if (stage.style.getPropertyValue('--decision-h') !== value) stage.style.setProperty('--decision-h', value);
    for (i = 0; i < floats.length; i++) if (floats[i].style.getPropertyValue('--decision-h')) floats[i].style.removeProperty('--decision-h');
  };

  function mark(name, on) {
    var b = doc.body; if (!b) return;
    if (on) { if (!b.hasAttribute(name)) b.setAttribute(name, ''); }
    else if (b.hasAttribute(name)) b.removeAttribute(name);
  }
  function inHosts(sel) {
    var a = doc.getElementById('pmRoot'), b = doc.getElementById('pmOverlayRoot');
    return !!((a && a.querySelector(sel)) || (b && b.querySelector(sel)));
  }
  function sync() {
    mark('data-pm56-activity-transient', inHosts('.activity-panel.transient'));
    mark('data-pm56-editor-revealed', inHosts('.workspace.editor-revealed'));
  }
  var DRAG = '.resizer.dragging, .panel-resize.dragging';
  function syncDrag() { mark('data-pm56-drag', inHosts(DRAG)); }
  /* the chat's own handlers add and remove .dragging on the handle during the same event: look once they have run */
  doc.addEventListener('pointerdown', function (e) {
    if (e.target && e.target.closest && e.target.closest('.pm56-host .resizer, .pm56-host .panel-resize')) Promise.resolve().then(syncDrag);
  }, true);
  ['pointerup', 'pointercancel'].forEach(function (type) {
    doc.addEventListener(type, function () { if (doc.body && doc.body.hasAttribute('data-pm56-drag')) Promise.resolve().then(syncDrag); }, true);
  });

  /* after every render (the chat's afterRender observer slot: app, overlay and scope phases); armed once every script
     has run, so the chat's extension registry is the full one */
  function arm() {
    var ext = window.PM56_EXT;
    if (ext && typeof ext.slot === 'function') ext.slot('afterRender', function () { sync(); });
    sync();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', arm, { once: true });
  else setTimeout(arm, 0);
})();
