/* Concept Hub bridge for the "Opus 5" settings-redesign concepts.
 *
 * Speaks the Hub protocol documented in Concepts/ConceptHub/starter/model-folder:
 *   hub  -> concept : { source: "pm-concept-hub", type: "pm-concept-state", state }
 *   concept -> hub  : { source: "pm-concept",     type: "pm-concept-ready", version, capabilities }
 *
 * On top of the starter behaviour it re-broadcasts the applied state as a local
 * DOM event ("pm-concept-state-applied") so each concept can re-run its own
 * layout maths (section offsets, mini-map bands) after a theme or width change
 * instead of measuring on every frame.
 */
(function () {
  "use strict";

  var LAST = null;

  function apply(state) {
    if (!state || typeof state !== "object") return;
    var root = document.documentElement;

    if (state.theme) {
      root.setAttribute("data-theme", state.theme);
      root.style.colorScheme = /-dark$/.test(state.theme) ? "dark" : "light";
    }

    root.setAttribute("data-reduced-motion", state.reducedMotion ? "1" : "0");

    if (typeof state.testWidth === "number") {
      root.style.setProperty("--hub-test-width", state.testWidth + "px");
      if (state.widthRole) {
        root.style.setProperty("--hub-" + state.widthRole + "-width", state.testWidth + "px");
      }
    }
    if (typeof state.viewportWidth === "number") {
      root.style.setProperty("--hub-viewport-width", state.viewportWidth + "px");
    }

    LAST = state;
    // Layout settles first; listeners recompute their section model afterwards.
    window.requestAnimationFrame(function () {
      window.dispatchEvent(new CustomEvent("pm-concept-state-applied", { detail: state }));
    });
  }

  window.addEventListener("message", function (event) {
    var message = event.data;
    if (!message || message.source !== "pm-concept-hub" || message.type !== "pm-concept-state") return;
    apply(message.state);
  });

  function ready() {
    if (window.parent === window) return;
    window.parent.postMessage({
      source: "pm-concept",
      type: "pm-concept-ready",
      version: 1,
      capabilities: { theme: true, reducedMotion: true, testWidth: true }
    }, "*");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready, { once: true });
  } else {
    ready();
  }

  window.PMHubBridge = {
    lastState: function () { return LAST; },
    inHub: function () {
      return window.parent !== window ||
        new URLSearchParams(window.location.search).get("hub") === "1";
    },
    /* Local control surfaces call this so standalone use matches Hub-driven use. */
    applyLocal: apply
  };
})();
