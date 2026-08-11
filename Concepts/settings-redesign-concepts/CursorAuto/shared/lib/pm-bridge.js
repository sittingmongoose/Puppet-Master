/* ============================================================================
   pm-bridge.js — ConceptHub bridge (IIFE, no dependencies)
   ----------------------------------------------------------------------------
   Two jobs:
   1. Announce readiness to the ConceptHub parent frame with a
      { source: "pm-concept", type: "pm-concept-ready", ... } postMessage.
   2. Apply hub state pushed via
      { source: "pm-concept-hub", type: "pm-concept-state", state: {...} }:
        state.theme         -> <html data-theme="..."> + style.colorScheme
        state.reducedMotion -> <html data-motion="reduced"|"full">
        state.testWidth     -> --hub-page-width / --hub-test-width (px) on root
                               (removed when the width is cleared)

   Exposes exactly one global:
     window.PMBridge = {
       embedded: boolean,                     // true inside the hub iframe
       applyLocal({ theme, motion, width })   // pages' own demo controls
                                              // reuse the same code path
     }
   Export nothing else.
   ========================================================================== */
(function () {
  "use strict";

  var THEME_RE = /^(friendly|glass|retro|basic)-(dark|light)$/;

  function applyTheme(theme) {
    if (typeof theme !== "string" || !THEME_RE.test(theme)) return;
    var root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = /-dark$/.test(theme) ? "dark" : "light";
  }

  function applyMotion(reducedMotion) {
    document.documentElement.dataset.motion = reducedMotion ? "reduced" : "full";
  }

  function applyWidth(testWidth) {
    var root = document.documentElement;
    var n = typeof testWidth === "string" ? parseFloat(testWidth) : testWidth;
    if (typeof n === "number" && isFinite(n) && n > 0) {
      root.style.setProperty("--hub-page-width", n + "px");
      root.style.setProperty("--hub-test-width", n + "px");
    } else {
      root.style.removeProperty("--hub-page-width");
      root.style.removeProperty("--hub-test-width");
    }
  }

  function applyState(state) {
    if (!state || typeof state !== "object") return;
    if (Object.prototype.hasOwnProperty.call(state, "theme")) applyTheme(state.theme);
    if (Object.prototype.hasOwnProperty.call(state, "reducedMotion")) applyMotion(!!state.reducedMotion);
    if (Object.prototype.hasOwnProperty.call(state, "testWidth")) applyWidth(state.testWidth);
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (data && data.source === "pm-concept-hub" && data.type === "pm-concept-state") {
      applyState(data.state);
    }
  });

  function announce() {
    if (window.parent === window) return;
    try {
      window.parent.postMessage({
        source: "pm-concept",
        type: "pm-concept-ready",
        version: 1,
        capabilities: { theme: true, reducedMotion: true, testWidth: true }
      }, "*");
    } catch (err) {
      /* cross-origin parent: nothing to announce to */
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", announce);
  } else {
    announce();
  }

  window.PMBridge = {
    embedded: window.parent !== window,
    applyLocal: function (opts) {
      if (!opts || typeof opts !== "object") return;
      var state = {};
      if (Object.prototype.hasOwnProperty.call(opts, "theme")) state.theme = opts.theme;
      if (Object.prototype.hasOwnProperty.call(opts, "motion")) state.reducedMotion = opts.motion === "reduced";
      if (Object.prototype.hasOwnProperty.call(opts, "width")) state.testWidth = opts.width;
      applyState(state);
    }
  };
})();
