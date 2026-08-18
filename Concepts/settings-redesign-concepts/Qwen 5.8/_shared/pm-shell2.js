/* PMShell2 — quiet surrounding Puppet Master shell for concepts 05–11.
 * Reuses pm-shell.css tokens/classes and pm-icons; wired to PMState2.
 * The Settings surface inside #content is concept-native per concept. */
(function () {
  "use strict";

  var THEMES = ["friendly-dark", "friendly-light", "glass-dark", "glass-light", "retro-dark", "retro-light", "basic-dark", "basic-light"];
  function themeLabel(t) { return t.split("-").map(function (w) { return w[0].toUpperCase() + w.slice(1); }).join(" "); }
  function ico(n, s) { return window.PMIcons.get(n, s || 14); }

  function mount(opts) {
    var app = document.getElementById("app");
    app.classList.add("pm-app");
    app.setAttribute("data-rail", "closed");
    app.setAttribute("data-assistant", "closed");
    app.setAttribute("data-wtier", "wide");

    app.innerHTML =
      '<header class="pm-topbar">' +
        '<span class="pm-wordmark"><svg class="pm-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="7" r="3.2"/><path d="M12 10.2v3.2"/><path d="M7 20c.5-3 2.4-4.6 5-4.6s4.5 1.6 5 4.6"/><path d="M5.5 8.5 3.5 7"/><path d="M18.5 8.5l2-1.5"/></svg>Puppet Master</span>' +
        '<span class="pm-chip" data-shell-project>Orion Data Pipeline</span>' +
        '<span class="pm-chip">' + ico("branch", 12) + ' main</span>' +
        '<span class="pm-spacer"></span>' +
        '<span class="pm-chip">' + ico("robot", 12) + ' Claude Sonnet 4.5</span>' +
        '<span class="pm-avatar">J</span>' +
      '</header>' +
      '<div class="pm-main">' +
        '<nav class="pm-rail" aria-label="Puppet Master navigation"><div class="pm-rail-inner">' +
          '<div class="pm-rail-cap">Workspace</div>' +
          '<button class="pm-rail-item" data-shell-nav="Dashboard">' + ico("grid", 15) + ' Dashboard</button>' +
          '<button class="pm-rail-item" data-shell-nav="Projects">' + ico("fileText", 15) + ' Projects</button>' +
          '<button class="pm-rail-item" data-shell-nav="Assistant Chat">' + ico("chat", 15) + ' Assistant Chat</button>' +
          '<button class="pm-rail-item" data-shell-nav="Orchestrator">' + ico("target", 15) + ' Orchestrator</button>' +
          '<button class="pm-rail-item" data-shell-nav="Usage">' + ico("gauge", 15) + ' Usage</button>' +
          '<div class="pm-rail-sep"></div>' +
          '<div class="pm-rail-cap">Configure</div>' +
          '<button class="pm-rail-item active" data-shell-nav="Settings">' + ico("gear", 15) + ' Settings</button>' +
        '</div></nav>' +
        '<main class="pm-content" id="content" tabindex="-1"></main>' +
        '<aside class="pm-assistant" aria-label="Assistant panel"><div class="pm-assistant-inner">' +
          '<div class="pm-assistant-head">' + ico("spark", 15) + ' Assistant <span class="pm-spacer" style="flex:1"></span><span class="pm-note">Settings redesign thread</span></div>' +
          '<div class="pm-assistant-body">' +
            '<div class="msg pm-msg"><span class="who">Jared</span>Seven more settings concepts this pass — keep the originals exactly as they are.</div>' +
            '<div class="pm-msg assist"><span class="who">Assistant</span>Understood. Concepts 05–11 stay self-contained; the four originals remain untouched historical work.</div>' +
          '</div>' +
          '<div class="pm-composer">' +
            '<div contenteditable="true" data-spell-text data-spell-raw="Note: the new concpets must each ship every manager family.">Note: the new concpets must each ship every manager family.</div>' +
            '<div class="pm-composer-hint">Spellcheck underlines only — suggestions appear on click or Enter, never automatic replacement.</div>' +
          '</div>' +
        '</div></aside>' +
      '</div>' +
      '<footer class="pm-bottombar">' +
        '<span style="display:inline-flex;align-items:center;gap:6px"><span class="pm-dot"></span> Ready</span>' +
        '<span class="pm-chip">' + ico("shieldCheck", 12) + ' Full Access</span>' +
        '<span class="pm-chip" data-shell-spell>Spellcheck On</span>' +
        '<span class="pm-spacer"></span>' +
        '<span class="pm-concept-tag">' + opts.conceptName + ' — ' + opts.model + '</span>' +
      '</footer>';

    // --- demo tray (PM popup-menu + tray standards) -------------------------------
    var tray = document.createElement("div");
    tray.className = "pm-tray closed";
    var scenOpts = (window.PMState2.scenarios || []).map(function (s) { return '<option value="' + s + '">' + s.replace(/-/g, " ") + "</option>"; }).join("");
    tray.innerHTML =
      '<button class="pm-btn pm-btn-sm pm-tray-toggle">' + ico("sliders", 13) + ' Demo</button>' +
      '<div class="pm-tray-body">' +
        '<div class="pm-tray-row"><span class="pm-tray-label">Theme</span><select class="pm-select" data-tray-theme></select></div>' +
        '<div class="pm-tray-row"><span class="pm-tray-label">Motion</span><select class="pm-select" data-tray-motion><option value="full">Full motion</option><option value="reduced">Reduced motion</option></select></div>' +
        '<div class="pm-tray-row"><span class="pm-tray-label">Scenario</span><select class="pm-select" data-tray-scenario>' + scenOpts + '</select></div>' +
        '<div class="pm-tray-row"><span class="pm-tray-label">Left rail</span><button class="pm-btn pm-btn-sm" data-tray-rail>Open</button></div>' +
        '<div class="pm-tray-row"><span class="pm-tray-label">Assistant panel</span><button class="pm-btn pm-btn-sm" data-tray-assist>Open</button></div>' +
        '<div class="pm-tray-row"><span class="pm-tray-label">Width</span><span class="pm-note">Use the Hub width slider</span></div>' +
        '<div class="pm-tray-row"><span class="pm-tray-label">Demo state</span><button class="pm-btn pm-btn-sm" data-tray-reset>Reset demo data</button></div>' +
      '</div>';
    document.body.appendChild(tray);

    var themeSel = tray.querySelector("[data-tray-theme]");
    THEMES.forEach(function (t) {
      var o = document.createElement("option");
      o.value = t; o.textContent = themeLabel(t);
      themeSel.appendChild(o);
    });
    themeSel.value = document.documentElement.getAttribute("data-theme") || "friendly-dark";
    themeSel.addEventListener("change", function () { document.documentElement.setAttribute("data-theme", themeSel.value); });

    var motionSel = tray.querySelector("[data-tray-motion]");
    motionSel.value = document.documentElement.getAttribute("data-reduced-motion") === "1" ? "reduced" : "full";
    motionSel.addEventListener("change", function () { document.documentElement.setAttribute("data-reduced-motion", motionSel.value === "reduced" ? "1" : "0"); if (opts.onMotion) opts.onMotion(motionSel.value === "reduced"); });

    var scenSel = tray.querySelector("[data-tray-scenario]");
    scenSel.value = window.PMState2.state.scenario || "default";
    scenSel.addEventListener("change", function () { window.PMState2.applyScenario(scenSel.value); });

    tray.querySelector("[data-tray-reset]").addEventListener("click", function () { window.PMState2.resetDemo(); });

    var railBtn = tray.querySelector("[data-tray-rail]");
    railBtn.addEventListener("click", function () {
      var next = app.getAttribute("data-rail") === "open" ? "closed" : "open";
      app.setAttribute("data-rail", next);
      railBtn.textContent = next === "open" ? "Close" : "Open";
    });
    var assistBtn = tray.querySelector("[data-tray-assist]");
    assistBtn.addEventListener("click", function () {
      var next = app.getAttribute("data-assistant") === "open" ? "closed" : "open";
      app.setAttribute("data-assistant", next);
      assistBtn.textContent = next === "open" ? "Close" : "Open";
    });
    tray.querySelector(".pm-tray-toggle").addEventListener("click", function () { tray.classList.toggle("closed"); });

    app.querySelectorAll("[data-shell-nav]").forEach(function (b) {
      b.addEventListener("click", function () {
        var name = b.getAttribute("data-shell-nav");
        if (name === "Settings") { if (opts.onHome) opts.onHome(); return; }
        window.PMState2.receipt("Shell is decorative here", name + " is part of the surrounding Puppet Master shell. Settings is the active surface in this concept.", "info");
      });
    });

    // Hub theme/motion sync
    window.addEventListener("message", function (e) {
      var m = e.data;
      if (!m || m.source !== "pm-concept-hub" || m.type !== "pm-concept-state") return;
      if (m.state && m.state.theme) themeSel.value = m.state.theme;
      if (m.state) motionSel.value = m.state.reducedMotion ? "reduced" : "full";
    });

    // width tiers
    var ro = new ResizeObserver(function () {
      var w = app.clientWidth;
      var tier = w < 860 ? "squeezed" : w < 1150 ? "narrow" : w < 1600 ? "mid" : "wide";
      if (app.getAttribute("data-wtier") !== tier) {
        app.setAttribute("data-wtier", tier);
        if (opts.onTier) opts.onTier(tier);
      }
    });
    ro.observe(app);

    // local spellcheck underline demo (underlines only; click offers suggestions)
    var MISSPELL = { concpets: "concepts", teh: "the", definately: "definitely", recieve: "receive", seperate: "separate" };
    function decorateSpell(el) {
      if (!el || el.querySelector(".pm-spell")) return;
      var raw = el.getAttribute("data-spell-raw") || el.textContent;
      var html = raw.split(/(\s+)/).map(function (w) {
        var k = w.toLowerCase().replace(/[^a-z']/g, "");
        return MISSPELL[k] ? '<span class="pm-spell" data-fix="' + MISSPELL[k] + '">' + w + "</span>" : w;
      }).join("");
      el.innerHTML = html;
    }
    document.querySelectorAll("[data-spell-text]").forEach(decorateSpell);
    document.addEventListener("click", function (e) {
      var sp = e.target && e.target.closest ? e.target.closest(".pm-spell") : null;
      if (!sp) return;
      var fix = sp.getAttribute("data-fix");
      var pop = document.createElement("div");
      pop.className = "pm-pop-menu";
      pop.style.position = "fixed";
      pop.style.left = Math.min(window.innerWidth - 240, e.clientX) + "px";
      pop.style.top = (e.clientY + 14) + "px";
      var b = document.createElement("button");
      b.textContent = "Replace with “" + fix + "”";
      b.addEventListener("click", function (ev) { ev.stopPropagation(); sp.outerHTML = fix; pop.remove(); });
      pop.appendChild(b);
      var n = document.createElement("div");
      n.className = "pm-pop-menu-note";
      n.textContent = "Suggestions never apply automatically.";
      pop.appendChild(n);
      document.body.appendChild(pop);
      setTimeout(function () {
        document.addEventListener("click", function h(ev) { if (!pop.contains(ev.target)) { pop.remove(); document.removeEventListener("click", h); } });
      }, 0);
    });

    // local receipt toasts (PM toast standard)
    var toastHost = document.createElement("div");
    toastHost.className = "pm-toasts";
    document.body.appendChild(toastHost);
    window.PMState2.subscribe(function (kind, payload) {
      if (kind !== "receipt") return;
      var t = document.createElement("div");
      t.className = "pm-toast in pm-toast-" + (payload.kind || "sim");
      t.innerHTML = '<span class="pm-toast-ico">' + ico(payload.kind === "warn" ? "alert" : payload.kind === "ok" ? "check" : "info", 14) + '</span>' +
        '<div class="pm-toast-body"><strong></strong><em></em></div>';
      t.querySelector("strong").textContent = payload.title;
      t.querySelector("em").textContent = payload.detail;
      toastHost.appendChild(t);
      while (toastHost.children.length > 3) toastHost.removeChild(toastHost.firstChild);
      setTimeout(function () { t.classList.add("out"); setTimeout(function () { t.remove(); }, 300); }, 4200);
      t.addEventListener("click", function () { t.remove(); });
    });

    return { content: app.querySelector("#content"), app: app };
  }

  window.PMShell2 = { mount: mount, themes: THEMES };
})();
