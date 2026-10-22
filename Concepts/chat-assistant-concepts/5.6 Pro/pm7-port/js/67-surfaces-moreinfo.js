/* pm7-port/js/67-surfaces-moreinfo.js: an attachment's More Info is a bounded popover at its attachment (canon ACD500:
   "More Info stays a popover"; chat56-audit section 3 row 20), not a dialog in the middle of the window.
   attachments.js still draws it (renderDetailsDialog, the att-details dialog with its own close and actions); here it
   is placed beside the attachment it describes: above it when there is room (the composer's tray sits low), else
   below, its left edge on the attachment's, kept 8 px inside the window, at most 440 px wide and as tall as the room
   it has (its body scrolls). The chat re-patches the overlay often and resets the dialog's own attributes, so the
   place is written as custom properties on #pmOverlayRoot (which the chat never patches) and read by
   css/31-surfaces-moreinfo.css. A press outside it closes it, as a popover does; Escape and its close still do. */
(function () {
  'use strict';
  var W = window;
  var ROOT = 'data-pm56-attpop';
  var last = null;   // { att, rect } from the click that asked for it

  function E() { return W.PM56_EXT || null; }
  function overlay() { return document.getElementById('pmOverlayRoot'); }
  function anchorFor(att) {
    if (!att) return null;
    var sel = '[data-att="' + (W.CSS && CSS.escape ? CSS.escape(att) : att) + '"]';
    var cands = document.querySelectorAll('#pmRoot ' + sel + ', .pm56-tab-host ' + sel);
    for (var i = 0; i < cands.length; i++) {
      var r = cands[i].getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return r;
    }
    return last && last.att === att ? last.rect : null;
  }
  function place() {
    var root = overlay(), A = W.PM56_APP, st = A && A.state;
    if (!root) return;
    var d = st && st.dialog;
    var dlg = root.querySelector('.att-details-dialog');
    if (!d || d.type !== 'att-details' || !dlg) { if (root.hasAttribute(ROOT)) root.removeAttribute(ROOT); return; }
    var a = anchorFor(d.attId);
    if (!a) { if (root.hasAttribute(ROOT)) root.removeAttribute(ROOT); return; }
    var vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight, m = 8, gap = 6;
    var w = Math.min(440, vw - 2 * m);
    var above = a.top - gap - m, below = vh - a.bottom - gap - m;
    var up = above >= Math.min(320, below) && above >= 200;
    var room = Math.max(160, up ? above : below);
    var h = Math.min(room, Math.min(620, vh - 2 * m));
    var x = Math.max(m, Math.min(a.left, vw - m - w));
    var y = up ? Math.max(m, a.top - gap - h) : Math.min(vh - m - h, a.bottom + gap);
    root.style.setProperty('--pm56-pop-x', Math.round(x) + 'px');
    root.style.setProperty('--pm56-pop-y', Math.round(y) + 'px');
    root.style.setProperty('--pm56-pop-w', Math.round(w) + 'px');
    root.style.setProperty('--pm56-pop-h', Math.round(h) + 'px');
    root.setAttribute(ROOT, up ? 'up' : 'down');
  }

  /* the attachment the person asked about, before the chat's own handler opens the dialog */
  document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-action="att-details"][data-att]') : null;
    if (!b) return;
    var chip = b.closest('[data-att]') || b;
    last = { att: b.getAttribute('data-att'), rect: chip.getBoundingClientRect() };
  }, true);
  /* a press outside the popover closes it (not inside the overlay's other menus, not on its own attachment) */
  document.addEventListener('pointerdown', function (ev) {
    var root = overlay();
    if (!root || !root.hasAttribute(ROOT)) return;
    var t = ev.target;
    if (!t || !t.closest || t.closest('.att-details-dialog, .overlay-menu, [data-action="att-details"]')) return;
    var A = W.PM56_APP;
    if (A && A.state && A.state.dialog && A.state.dialog.type === 'att-details') {
      A.state.dialog = null;
      if (A.renderOverlays) A.renderOverlays(); else if (A.render) A.render();
    }
  }, true);
  W.addEventListener('resize', place);
  document.addEventListener('scroll', function () { (W.requestAnimationFrame || setTimeout)(place); }, true);

  var e0 = E();
  if (e0 && typeof e0.slot === 'function') e0.slot('afterRender', function () { place(); });
  var SF = W.PM56_SURFACES = W.PM56_SURFACES || {};
  SF.placeMoreInfo = place;
})();
