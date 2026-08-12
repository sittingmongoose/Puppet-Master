/* ============================================================================
   pm-shell.js — behavior for the quiet fake Puppet Master shell (pmx-*)
   ----------------------------------------------------------------------------
   Pages carry the static .pmx-frame markup (see pm-shell.css header contract,
   or copy it from index.html) and include this file after pm-bridge.js.

     PMShell.init()   // wires every [data-shell-*] control inside the frame

   Controls the pages place in markup:
     <button data-shell-toggle="side|chat|bottom">   hide/show that panel
     <select data-shell-theme>                       8 theme options
     <button data-shell-motion>                      reduced-motion toggle
     <select data-shell-width>                       page-width presets
                                                      (auto-hidden when the
                                                      ConceptHub drives width)
     <button data-shell-inbox>                       title-bar sprout inbox —
     <span data-shell-inbox-count>                   the ONLY in-app
     <div data-shell-inbox-panel hidden>             notification affordance

   Inbox contract (kimi-k3): the button lives in .pmx-topbar; the panel is
   positioned by pm-shell.css and filled by the concept (notice rows).
     PMShell.setInboxCount(n)   update the count chip (hidden at 0)
   Concepts re-render the panel list themselves and call setInboxCount.

   Everything routes through PMBridge.applyLocal so hub-pushed state and local
   demo controls share one application path. Adds .pmx-squeezed to the frame
   at <= 900px frame width as the JS fallback for the @container pmx rules.
   ========================================================================== */
(function () {
  "use strict";

  var PANEL_FOR = { side: ".pmx-side", chat: ".pmx-chat", bottom: ".pmx-bottom" };

  function closestFrame(el) {
    return el && el.closest ? el.closest(".pmx-frame") : null;
  }

  function wireToggle(button) {
    var key = button.getAttribute("data-shell-toggle");
    var frame = closestFrame(button);
    var panel = frame && frame.querySelector(PANEL_FOR[key]);
    if (!panel) return;
    var sync = function () {
      button.setAttribute("aria-pressed", String(!panel.hidden));
    };
    button.addEventListener("click", function () {
      panel.hidden = !panel.hidden;
      sync();
    });
    sync();
  }

  function wireTheme(select) {
    select.addEventListener("change", function () {
      window.PMBridge.applyLocal({ theme: select.value });
    });
    var syncTheme = function () {
      select.value = document.documentElement.dataset.theme || "friendly-dark";
    };
    new MutationObserver(syncTheme).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
    syncTheme();
  }

  function wireMotion(button) {
    var reduced = function () {
      return document.documentElement.dataset.motion === "reduced";
    };
    var sync = function () {
      var isReduced = reduced();
      button.setAttribute("aria-pressed", String(isReduced));
      button.setAttribute("title", isReduced ? "Reduced motion on" : "Reduced motion off");
    };
    button.addEventListener("click", function () {
      window.PMBridge.applyLocal({ motion: reduced() ? "full" : "reduced" });
    });
    new MutationObserver(sync).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-motion"]
    });
    sync();
  }

  function wireWidth(select) {
    if (window.PMBridge.embedded) {
      select.hidden = true;
      return;
    }
    select.addEventListener("change", function () {
      var value = select.value;
      window.PMBridge.applyLocal({ width: value === "full" ? null : parseInt(value, 10) });
    });
  }

  function wireSqueezed(frame) {
    if (!("ResizeObserver" in window)) return;
    var last = null;
    new ResizeObserver(function (entries) {
      var width = entries[0].contentRect.width;
      var squeezed = width <= 900;
      if (squeezed !== last) {
        last = squeezed;
        frame.classList.toggle("pmx-squeezed", squeezed);
      }
    }).observe(frame);
  }

  /* Title-bar sprout inbox: the ONLY in-app notification surface.
     The concept renders rows into [data-shell-inbox-list]; this wires
     open/close, Escape, and outside-click. */
  function wireInbox(button) {
    var frame = closestFrame(button);
    var panel = frame && frame.querySelector("[data-shell-inbox-panel]");
    if (!panel) return;
    var sync = function () {
      button.setAttribute("aria-expanded", String(!panel.hidden));
    };
    var close = function () { panel.hidden = true; sync(); };
    button.addEventListener("click", function () {
      panel.hidden = !panel.hidden;
      sync();
    });
    /* Outside-click close uses containment, not stopPropagation, so clicks
       on inbox rows still bubble to the concept's document-level
       data-notice-act / data-notice-dismiss delegation. */
    document.addEventListener("click", function (ev) {
      if (panel.hidden) return;
      /* A row action may re-render the list mid-dispatch; a detached target
         means the click began inside the panel — not an outside click. */
      if (!document.documentElement.contains(ev.target)) return;
      if (panel.contains(ev.target) || button.contains(ev.target)) return;
      close();
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && !panel.hidden) { close(); button.focus(); }
    });
    sync();
  }

  function setInboxCount(n) {
    document.querySelectorAll("[data-shell-inbox-count]").forEach(function (chip) {
      var count = typeof n === "number" ? n : parseInt(n, 10) || 0;
      chip.textContent = String(count);
      chip.hidden = count <= 0;
    });
  }

  window.PMShell = {
    init: function (root) {
      var scope = root || document;
      scope.querySelectorAll("[data-shell-toggle]").forEach(wireToggle);
      scope.querySelectorAll("[data-shell-theme]").forEach(wireTheme);
      scope.querySelectorAll("[data-shell-motion]").forEach(wireMotion);
      scope.querySelectorAll("[data-shell-width]").forEach(wireWidth);
      scope.querySelectorAll("[data-shell-inbox]").forEach(wireInbox);
      scope.querySelectorAll(".pmx-frame").forEach(wireSqueezed);
    },
    setInboxCount: setInboxCount
  };
})();
