/* Hosted History geometry is read after layout, then published together.
   A render heartbeat binds replacement nodes; it does not flush the entire
   chat between state writes. ResizeObserver supplies each scroll box's width. */
(function () {
  'use strict';
  var pane = null, rect = null, scrolls = new Map(), narrow = null, closeMs = 240;
  var paneRO = null, headRO = null;
  function readTokens() {
    if (narrow != null) return;
    var root = document.getElementById('pmRoot');
    var css = getComputedStyle(root || document.documentElement);
    narrow = parseFloat(css.getPropertyValue('--ph-history-narrow-max')) || 204;
    var time = css.getPropertyValue('--ph-t').trim();
    closeMs = parseFloat(time) * (/ms$/.test(time) ? 1 : 1000) || 240;
  }
  function publish() {
    if (!rect) return;
    var style = window.PM56_ROOT_STYLE;
    style.setProperty('--ph-x', rect.left + 'px');
    style.setProperty('--ph-y', rect.top + 'px');
    style.setProperty('--ph-h', rect.height + 'px');
    style.setProperty('--ph-pane', rect.width + 'px');
  }
  function paintHead(scroll, width) {
    var host = scroll.closest('.history-flyout, .history-panel');
    var head = host && host.querySelector('.history-head');
    if (!head) return;
    var compact = width <= narrow + .5;
    head.classList.toggle('is-hh-compact', compact);
    host.classList.toggle('is-history-narrow', compact);
  }
  function heads() {
    readTokens();
    if (!headRO) headRO = new ResizeObserver(function (entries) {
      entries.forEach(function (entry) {
        var boxes = entry.borderBoxSize;
        var width = boxes && boxes.length ? boxes[0].inlineSize : entry.target.getBoundingClientRect().width;
        scrolls.set(entry.target, width);
      });
      scrolls.forEach(function (width, el) { if (width != null) paintHead(el, width); });
    });
    var root = document.getElementById('pmOverlayRoot');
    if (root) root.querySelectorAll('.history-flyout .history-scroll').forEach(function (el) {
      if (!scrolls.has(el)) { scrolls.set(el, null); headRO.observe(el); }
    });
    scrolls.forEach(function (width, el) {
      if (!el.isConnected) { headRO.unobserve(el); scrolls.delete(el); }
      else if (width != null) paintHead(el, width);
    });
  }
  function sync() {
    readTokens();
    var root = document.getElementById('pmRoot');
    var next = root && root.querySelector('.assistant-pane');
    if (next !== pane) {
      if (paneRO) paneRO.disconnect();
      pane = next;
      rect = pane ? pane.getBoundingClientRect() : null;
      if (pane) {
        paneRO = new ResizeObserver(function () {
          /* Read the position as well as size: Home widens toward the left. */
          rect = pane.getBoundingClientRect();
          publish();
        });
        paneRO.observe(pane);
      }
    }
    publish();
    heads();
  }
  window.addEventListener('resize', function () {
    if (pane && pane.isConnected) { rect = pane.getBoundingClientRect(); publish(); }
  });
  window.PM56_HISTORY_LAYOUT = {
    sync: sync, heads: heads,
    rect: function () { if (!rect) sync(); return rect; },
    closeMs: function () { readTokens(); return closeMs; }
  };
})();
