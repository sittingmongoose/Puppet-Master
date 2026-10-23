/* pm7-port/js/06-history-width.js: pinned History's width in the Home chat column (column lane, 2026-10-23, DL-233).
   Loads after 00-host.js and 05-page-root.js and before the chat's modules. The standalone never loads it and keeps its
   own 200 px pinned drawer (history.css --ph-pin-w).

   The panel redesign designed the column around it (D3; F3-637): "The 5.6 Pro History list is a flyout by default;
   pinning it widens the chat by its own width instead of squeezing the messages." Pinned, the History is 240 px, or
   200 px while the whole column is under 540 px (Home's LADDER.chatHistoryW, chatHistoryWNarrow and chatHistoryAt,
   44-narrow.js), and the column grows by the width the History is drawn at, so the message area keeps the width the
   person gave it.
   1. --ph-pin-w on the chat's hosts (PM56_ROOT_STYLE, where history.css's --ph-w reads it): 240, or 200 while the
      column is under 540 px. A docked column with History pinned is never that narrow (the ladder keeps it at 400 px
      of messages plus the History), so only a capped column gets there, the popped-out chat or the narrow peek: their
      frame is followed by a ResizeObserver. Deciding on the docked frame instead would start every pin made in a
      column under 540 px at 200 and turn it to 240 halfway, as the column grows past 540. history.js reads its default
      from the hosts (tools/patches_column.py), so its enter and exit width locks and the separator's value agree.
   2. PM56_HOST.historyWidth(mw): what pinned History adds to the column beside a message area of mw px, which the Home
      ladder asks for through PMW.chatCol.historyW (the chat surface's historyWidth, app.js claimSurface): the width the
      person dragged the History's edge to (--ph-user-w, history.js) or the pin default, clamped as history.css clamps
      the drawer (--ph-w = min(max(that, 170), 42 % of the pane)) and solved for the pane the wider column will have
      (the message area plus the History, less the frame's hairline), so the drawer drawn there is the width added.
   3. The ladder measures again when that width changes: a write of --ph-user-w (an arrow key on the separator, a width
      restored at boot, the default put back) or --ph-pin-w, and the end of a drag of the History's edge. While a drag
      lasts the column holds still and only the History moves, so the edge stays under the pointer; on release the
      column takes the new width and the messages get theirs back. */
(function () {
  'use strict';
  var H = window.PM56_HOST, RS = window.PM56_ROOT_STYLE, doc = document;
  if (!H || !RS) return;
  /* history.js's W_MIN, W_MAX and W_PANE, which are history.css's --ph-min-w and .42 */
  var MIN = 170, MAX = 360, PANE = 0.42;

  function ladder() {
    var L = (window.PMW && PMW.LADDER) || {};
    return { w: L.chatHistoryW || 240, narrow: L.chatHistoryWNarrow || 200, at: L.chatHistoryAt || 540 };
  }
  function schedule() { try { if (window.PMW && PMW.narrow && PMW.narrow.schedule) PMW.narrow.schedule(); } catch (_) {} }
  function px(v) { var n = parseFloat(v); return isFinite(n) && n > 0 ? n : null; }
  function resizing() { return !!(doc.body && doc.body.hasAttribute('data-ph-resizing')); }

  /* ---- 1. the pin default ---- */
  function capped() {
    var C = window.PMW && PMW.chatCol;
    try { return !!(C && ((C.isFloating && C.isFloating()) || (C.isPeeking && C.isPeeking()))); } catch (_) { return false; }
  }
  function pinFor(frameW) { var L = ladder(); return capped() && frameW > 0 && frameW < L.at ? L.narrow : L.w; }
  function publishPin(frameW) {
    var v = pinFor(frameW) + 'px';
    if (RS.getPropertyValue('--ph-pin-w') !== v) RS.setProperty('--ph-pin-w', v);
  }
  publishPin(0);
  var frame = H.frame && H.frame();
  if (frame && typeof ResizeObserver === 'function') {
    new ResizeObserver(function (entries) {
      var e = entries && entries[entries.length - 1];
      publishPin(e && e.contentRect ? e.contentRect.width : 0);
    }).observe(frame);
  }

  /* ---- 2. the width the column adds ---- */
  /* the width the person dragged the History to, as the column last took it: held while a drag lasts */
  var settled = null, seen = false;
  function userW() {
    var now = px(RS.getPropertyValue('--ph-user-w'));
    if (resizing() && seen) return settled;
    settled = now; seen = true;
    return now;
  }
  /* the column's width less its pane's (the frame's 1 px hairline in every look measured), read from what is laid out */
  function hairline() {
    var cp = doc.getElementById('chatPanel'), pane = doc.querySelector('#pmRoot .assistant-pane');
    var a = cp ? cp.getBoundingClientRect().width : 0, p = pane ? pane.getBoundingClientRect().width : 0;
    return a > 0 && p > 0 && a >= p ? a - p : 1;
  }
  H.historyWidth = function (mw) {
    mw = Number(mw);
    if (!(mw > 0)) return null;
    var L = ladder(), b = hairline(), u = userW();
    var want = u == null ? (mw + L.w < L.at ? L.narrow : L.w) : Math.min(MAX, Math.max(MIN, u));
    want = Math.max(MIN, want);
    /* the drawer is at most 42 % of its pane, and that pane is mw - b + the History itself */
    var cap = PANE * (mw - b) / (1 - PANE);
    return want <= cap ? want : Math.max(0, cap);
  };

  /* ---- 3. measuring again ---- */
  var set = RS.setProperty, remove = RS.removeProperty;
  function heard(name) { if ((name === '--ph-user-w' || name === '--ph-pin-w') && !resizing()) schedule(); }
  RS.setProperty = function (name) { var r = set.apply(RS, arguments); heard(name); return r; };
  RS.removeProperty = function (name) { var r = remove.apply(RS, arguments); heard(name); return r; };
  if (typeof MutationObserver === 'function' && doc.body) {
    new MutationObserver(function () { if (!resizing()) schedule(); })
      .observe(doc.body, { attributes: true, attributeFilter: ['data-ph-resizing'] });
  }
})();
