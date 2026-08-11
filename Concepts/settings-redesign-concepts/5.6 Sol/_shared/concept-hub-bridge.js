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
      root.style.setProperty("--hub-page-width", state.testWidth + "px");
    }
    if (typeof state.viewportWidth === "number") {
      root.style.setProperty("--hub-viewport-width", state.viewportWidth + "px");
    }
    window.dispatchEvent(new CustomEvent("pm-settings-review-state", { detail: state }));
  }

  window.PMSettingsReview = window.PMSettingsReview || {};
  window.PMSettingsReview.apply = apply;

  window.addEventListener("message", function (event) {
    var message = event.data;
    if (!message || typeof message !== "object") return;
    if (message.source === "pm-concept-hub" && message.type === "pm-concept-state") apply(message.state);
    if (message.source === "pm-settings-bakeoff" && message.type === "pm-settings-state") apply(message.state);
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
