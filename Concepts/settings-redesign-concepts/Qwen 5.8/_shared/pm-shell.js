(function () {
  "use strict";

  var THEMES = ["friendly-dark", "friendly-light", "glass-dark", "glass-light", "retro-dark", "retro-light", "basic-dark", "basic-light"];

  function themeLabel(t) {
    return t.split("-").map(function (w) { return w[0].toUpperCase() + w.slice(1); }).join(" ");
  }

  function mount(opts) {
    var app = document.getElementById("app");
    var conceptName = opts.conceptName;
    var model = opts.model;

    app.classList.add("pm-app");
    app.setAttribute("data-rail", "closed");
    app.setAttribute("data-assistant", "closed");
    app.setAttribute("data-wtier", "wide");

    app.innerHTML =
      '<header class="pm-topbar">' +
        '<span class="pm-wordmark"><svg class="pm-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="7" r="3.2"/><path d="M12 10.2v3.2"/><path d="M7 20c.5-3 2.4-4.6 5-4.6s4.5 1.6 5 4.6"/><path d="M5.5 8.5 3.5 7"/><path d="M18.5 8.5l2-1.5"/></svg>Puppet Master</span>' +
        '<span class="pm-chip" data-shell-project>PuppetMaster</span>' +
        '<span class="pm-chip">' + window.PMIcons.get("branch", 12) + ' main</span>' +
        '<span class="pm-spacer"></span>' +
        '<span class="pm-chip" data-shell-route>' + window.PMIcons.get("robot", 12) + ' Claude Sonnet 4.5</span>' +
        '<span class="pm-avatar">J</span>' +
      '</header>' +
      '<div class="pm-main">' +
        '<nav class="pm-rail" aria-label="Puppet Master navigation"><div class="pm-rail-inner">' +
          '<div class="pm-rail-cap">Workspace</div>' +
          '<button class="pm-rail-item" data-shell-nav="Dashboard">' + window.PMIcons.get("grid", 15) + ' Dashboard</button>' +
          '<button class="pm-rail-item" data-shell-nav="Projects">' + window.PMIcons.get("fileText", 15) + ' Projects</button>' +
          '<button class="pm-rail-item" data-shell-nav="Assistant Chat">' + window.PMIcons.get("chat", 15) + ' Assistant Chat</button>' +
          '<button class="pm-rail-item" data-shell-nav="Orchestrator">' + window.PMIcons.get("target", 15) + ' Orchestrator</button>' +
          '<button class="pm-rail-item" data-shell-nav="Usage">' + window.PMIcons.get("gauge", 15) + ' Usage</button>' +
          '<div class="pm-rail-sep"></div>' +
          '<div class="pm-rail-cap">Configure</div>' +
          '<button class="pm-rail-item active" data-shell-nav="Settings">' + window.PMIcons.get("gear", 15) + ' Settings</button>' +
        '</div></nav>' +
        '<main class="pm-content" id="content" tabindex="-1"></main>' +
        '<aside class="pm-assistant" aria-label="Assistant panel"><div class="pm-assistant-inner">' +
          '<div class="pm-assistant-head">' + window.PMIcons.get("spark", 15) + ' Assistant <span class="pm-spacer" style="flex:1"></span><span class="pm-note">Settings redesign thread</span></div>' +
          '<div class="pm-assistant-body">' +
            '<div class="msg pm-msg"><span class="who">Jared</span>We should recieve the settings concepts before Friday, and keep them seperate from the chat work.</div>' +
            '<div class="pm-msg assist"><span class="who">Assistant</span>Understood. Four settings concepts, each with its own structure. Spellcheck is underlining two words in your message — it never replaces them on its own.</div>' +
          '</div>' +
          '<div class="pm-composer">' +
            '<div contenteditable="true" data-spell-text data-spell-raw="Draft a note: the demo tray can toggle teh rail, and motion is definately honored.">Draft a note: the demo tray can toggle teh rail, and motion is definately honored.</div>' +
            '<div class="pm-composer-hint">Spellcheck underlines only — suggestions appear on click or Enter, never automatic replacement.</div>' +
          '</div>' +
        '</div></aside>' +
      '</div>' +
      '<footer class="pm-bottombar">' +
        '<span style="display:inline-flex;align-items:center;gap:6px"><span class="pm-dot"></span> Ready</span>' +
        '<span class="pm-chip">' + window.PMIcons.get("shieldCheck", 12) + ' Full Access</span>' +
        '<span class="pm-chip" data-shell-spell>Spellcheck On</span>' +
        '<span class="pm-spacer"></span>' +
        '<span class="pm-concept-tag">' + conceptName + ' — ' + model + '</span>' +
      '</footer>';

    var tray = document.createElement("div");
    tray.className = "pm-tray closed";
    tray.innerHTML =
      '<button class="pm-btn pm-btn-sm pm-tray-toggle">' + window.PMIcons.get("sliders", 13) + ' Demo</button>' +
      '<div class="pm-tray-body">' +
        '<div class="pm-tray-row"><span class="pm-tray-label">Theme</span><select class="pm-select" data-tray-theme></select></div>' +
        '<div class="pm-tray-row"><span class="pm-tray-label">Motion</span><select class="pm-select" data-tray-motion><option value="full">Full motion</option><option value="reduced">Reduced motion</option></select></div>' +
        '<div class="pm-tray-row"><span class="pm-tray-label">Scenario</span><select class="pm-select" data-tray-scenario>' +
          '<option value="default">Default states</option>' +
          '<option value="attention">Needs attention</option>' +
          '<option value="calm">Calm — no notices</option>' +
          '<option value="refreshing">Catalog refreshing</option>' +
          '<option value="exhausted">Usage exhausted</option>' +
          '<option value="update-available">Provider update available</option>' +
          '<option value="rollback">Update rolled back</option>' +
          '<option value="import-conflict">Import conflict</option>' +
          '<option value="lkg-active">Catalog last-known-good</option>' +
          '<option value="low-resource">Low-resource profile</option>' +
          '<option value="poor-network">Poor network (stale-while-revalidate)</option>' +
        '</select></div>' +
        '<div class="pm-tray-row"><span class="pm-tray-label">Left rail</span><button class="pm-btn pm-btn-sm" data-tray-rail>Open</button></div>' +
        '<div class="pm-tray-row"><span class="pm-tray-label">Assistant panel</span><button class="pm-btn pm-btn-sm" data-tray-assist>Open</button></div>' +
        '<div class="pm-tray-row"><span class="pm-tray-label">Width</span><span class="pm-note">Use the Hub width slider</span></div>' +
        '<div class="pm-tray-row"><span class="pm-tray-label">Demo state</span><button class="pm-btn pm-btn-sm" data-tray-reset>Reset demo data</button></div>' +
      '</div>';
    document.body.appendChild(tray);

    var themeSel = tray.querySelector("[data-tray-theme]");
    THEMES.forEach(function (t) {
      var o = document.createElement("option");
      o.value = t;
      o.textContent = themeLabel(t);
      themeSel.appendChild(o);
    });
    themeSel.value = document.documentElement.getAttribute("data-theme") || "friendly-dark";
    themeSel.addEventListener("change", function () { setTheme(themeSel.value); });

    var motionSel = tray.querySelector("[data-tray-motion]");
    motionSel.value = document.documentElement.getAttribute("data-reduced-motion") === "1" ? "reduced" : "full";
    motionSel.addEventListener("change", function () { setReducedMotion(motionSel.value === "reduced"); });

    var scenSel = tray.querySelector("[data-tray-scenario]");
    scenSel.addEventListener("change", function () { window.PMState.applyScenario(scenSel.value); });

    tray.querySelector("[data-tray-reset]").addEventListener("click", function () {
      window.PMState.resetDemo();
    });

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
        if (name === "Settings") {
          window.PMState.navigate({ name: "home" });
          return;
        }
        window.PMState.receipt("Shell is decorative here", name + " is part of the surrounding Puppet Master shell. Settings is the active surface in this concept.", "info");
      });
    });

    function setTheme(t) {
      document.documentElement.setAttribute("data-theme", t);
      themeSel.value = t;
    }
    function setReducedMotion(on) {
      document.documentElement.setAttribute("data-reduced-motion", on ? "1" : "0");
      motionSel.value = on ? "reduced" : "full";
    }

    window.addEventListener("message", function (e) {
      var m = e.data;
      if (!m || m.source !== "pm-concept-hub" || m.type !== "pm-concept-state") return;
      if (m.state && m.state.theme) themeSel.value = m.state.theme;
      if (m.state) motionSel.value = m.state.reducedMotion ? "reduced" : "full";
    });

    var ro = new ResizeObserver(function () {
      var w = app.clientWidth;
      var tier = w < 860 ? "squeezed" : w < 1150 ? "narrow" : w < 1600 ? "mid" : "wide";
      if (app.getAttribute("data-wtier") !== tier) {
        app.setAttribute("data-wtier", tier);
        window.PMState.state.shell.wtier = tier;
        window.PMState.emit("wtier", tier);
      }
    });
    ro.observe(app);

    var assistHead = app.querySelector(".pm-assistant-head");
    var ovBtn = document.createElement("button");
    ovBtn.className = "pm-btn pm-btn-quiet pm-btn-sm pm-btn-ico";
    ovBtn.setAttribute("aria-label", "Thread overflow actions");
    ovBtn.setAttribute("data-assist-overflow", "");
    ovBtn.innerHTML = window.PMIcons.get("dots", 14);
    assistHead.appendChild(ovBtn);
    var ovMenu = null;
    function closeOv() { if (ovMenu && ovMenu.parentNode) ovMenu.parentNode.removeChild(ovMenu); ovMenu = null; }
    ovBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (ovMenu) { closeOv(); return; }
      ovMenu = document.createElement("div");
      ovMenu.className = "pm-pop-menu";
      var dis = window.PMState.state.ui.spellThreadDisabled;
      var b = document.createElement("button");
      b.setAttribute("data-spell-thread-toggle", "");
      b.textContent = dis ? "Enable spellcheck for this thread" : "Disable spellcheck for this thread";
      b.addEventListener("click", function () {
        window.PMState.setSpellThreadDisabled(!dis);
        closeOv();
      });
      ovMenu.appendChild(b);
      var note = document.createElement("div");
      note.className = "pm-pop-menu-note";
      note.textContent = "Thread-local override — defaults stay unchanged.";
      ovMenu.appendChild(note);
      assistHead.appendChild(ovMenu);
    });
    document.addEventListener("click", function (e) {
      if (ovMenu && !(e.target.closest && e.target.closest(".pm-pop-menu")) && e.target !== ovBtn) closeOv();
    });

    window.PMState.subscribe(function (kind, payload) {
      if (kind === "receipt") window.PMCore.toast(payload);
      if (kind === "spellthread") {
        document.querySelectorAll("[data-spell-text]").forEach(function (el) { window.PMCore.decorateSpell(el); });
      }
      if (kind === "setting" && payload && payload.id === "general.language.spellcheck") {
        var s = window.PMState.getSetting("general.language.spellcheck");
        var tag = app.querySelector("[data-shell-spell]");
        if (tag) tag.textContent = "Spellcheck " + (s.value ? "On" : "Off");
        document.querySelectorAll("[data-spell-text]").forEach(function (el) { window.PMCore.decorateSpell(el); });
      }
    });

    window.PMCore.attachSpellcheck(document.body);
    return { content: app.querySelector("#content"), app: app };
  }

  window.PMShell = { mount: mount, themes: THEMES };
})();
