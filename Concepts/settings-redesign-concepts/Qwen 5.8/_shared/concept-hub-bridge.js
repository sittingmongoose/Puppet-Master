(function () {
  "use strict";

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
      if (state.widthRole) root.style.setProperty("--hub-" + state.widthRole + "-width", state.testWidth + "px");
    }
    if (typeof state.viewportWidth === "number") {
      root.style.setProperty("--hub-viewport-width", state.viewportWidth + "px");
    }
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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, { once: true });
  else ready();
})();
