/* ca-motion.js — directed view choreography for CursorAuto (film-level, not constant motion) */
(function () {
  "use strict";

  var _origin = { x: 0.5, y: 0.5, label: "center", el: null };

  function reduced() {
    var html = document.documentElement;
    if (html && html.getAttribute("data-motion") === "reduced") return true;
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function stage(root, name, ms) {
    if (!root) return;
    root.setAttribute("data-ca-stage", name || "idle");
    if (_origin.label) root.setAttribute("data-ca-from", _origin.label);
    if (reduced()) return;
    if (ms) {
      window.clearTimeout(root._caStageTimer);
      root._caStageTimer = window.setTimeout(function () {
        if (root.getAttribute("data-ca-stage") === name) root.setAttribute("data-ca-stage", "settled");
      }, ms);
    }
  }

  function captureOrigin(el, label) {
    if (!el || !el.getBoundingClientRect) {
      _origin = { x: 0.5, y: 0.5, label: label || "center", el: null };
      return _origin;
    }
    var r = el.getBoundingClientRect();
    var x = (r.left + r.width / 2) / Math.max(1, window.innerWidth);
    var y = (r.top + r.height / 2) / Math.max(1, window.innerHeight);
    _origin = { x: x, y: y, label: label || el.getAttribute("data-ca-origin-label") || "control", el: el };
    try {
      el.setAttribute("data-ca-origin", _origin.label);
    } catch (e) {}
    return _origin;
  }

  function afterRender(root, kind, opts) {
    opts = opts || {};
    if (!root) return;
    var map = {
      home: ["enter-home", 420],
      workspace: ["enter-workspace", 460],
      manager: ["enter-manager", 400],
      category: ["category-change", 380],
      search: ["search-land", 520],
      apply: ["save-apply", 480],
      "provider-refresh": ["provider-refresh", 720]
    };
    var pair = map[kind] || ["enter-home", 400];
    root.style.setProperty("--ca-origin-x", (Math.round(_origin.x * 1000) / 10) + "%");
    root.style.setProperty("--ca-origin-y", (Math.round(_origin.y * 1000) / 10) + "%");
    root.removeAttribute("data-ca-stage");
    void root.offsetWidth;
    stage(root, pair[0], opts.ms || pair[1]);
    if (opts.focusEl && !reduced()) {
      opts.focusEl.classList.remove("ca-motion-focus");
      void opts.focusEl.offsetWidth;
      opts.focusEl.classList.add("ca-motion-focus");
    }
  }

  function markOrigin(el, origin) {
    if (!el) return;
    el.setAttribute("data-ca-origin", origin || "center");
  }

  function pulse(root, name, ms) {
    if (!root) return;
    root.setAttribute("data-ca-pulse", name || "work");
    window.clearTimeout(root._caPulseTimer);
    root._caPulseTimer = window.setTimeout(function () {
      root.removeAttribute("data-ca-pulse");
    }, ms || 700);
  }

  window.CAMotion = {
    reduced: reduced,
    stage: stage,
    afterRender: afterRender,
    markOrigin: markOrigin,
    captureOrigin: captureOrigin,
    pulse: pulse,
    getOrigin: function () { return { x: _origin.x, y: _origin.y, label: _origin.label }; }
  };
})();
