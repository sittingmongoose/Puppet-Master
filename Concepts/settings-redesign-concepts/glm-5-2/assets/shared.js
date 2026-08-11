/* shared.js — shared renderers used by all four GLM-5.2 concepts:
   the quiet PM shell header (topbar + activity + rail + chat + footer) and the settings-row renderer. */
(function () {
  "use strict";
  var S = window.PM.shared = {};

  /* ---------- QUIET SHELL ---------- */
  /* Each concept injects its stage content via a `<main class="pm-stage" data-stage>` element.
     The shell wraps the activity bar, rail, chat, footer. The concept page owns the grid. */
  S.activityButtons = function (activeRail) {
    return [
      S.actBtn("home","Home","home", false),
      S.actBtn("rail","Project rail","rail", activeRail === "open", 'data-shell-toggle="rail"'),
      S.actBtn("chat","Assistant","chat", false, 'data-shell-toggle="chat"'),
      '<div style="flex:1"></div>',
      S.actBtn("settings","Settings","settings", true),
    ].join("");
  };
  S.actBtn = function (id, label, icon, pressed, extra) {
    return '<button class="pm-act-btn' + (id === "settings" ? " settings" : "") + '" type="button" aria-label="' + label + '" title="' + label + '" aria-pressed="' + (pressed ? "true" : "false") + '" ' + (extra || "") + '>' + PM.svg(icon, 18) + '</button>';
  };

  S.topbar = function (crumbHTML, modelLabel) {
    return [
      '<div class="pm-topbar">',
        PM.svg("settings", 18),
        '<span class="pm-brand">PUPPET MASTER</span>',
        '<span class="pm-crumb">' + crumbHTML + '</span>',
        '<span class="pm-spacer"></span>',
        '<span class="pm-modelchip" data-concept-model="GLM-5.2">' + PM.svg("bolt",11) + modelLabel + '</span>',
      '</div>'
    ].join("");
  };

  S.rail = function () {
    return [
      '<aside class="pm-rail" id="pmRail">',
        '<div class="pm-rail-head">Project rail</div>',
        '<div class="pm-rail-body">',
          '<div class="rail-fake-line"></div><div class="rail-fake-line"></div><div class="rail-fake-line"></div>',
          '<div class="rail-fake-line"></div><div class="rail-fake-line"></div><div class="rail-fake-line"></div>',
        '</div>',
      '</aside>'
    ].join("");
  };
  S.chat = function () {
    return [
      '<aside class="pm-chat" id="pmChat">',
        '<div class="pm-chat-head">Assistant</div>',
        '<div class="pm-chat-body">',
          '<div class="chat-fake-bubble self">Quiet shell reference.</div>',
          '<div class="chat-fake-bubble">Surrounding panels can open or close.</div>',
          '<div class="chat-fake-bubble self">Spacing stays judgeable.</div>',
        '</div>',
      '</aside>'
    ].join("");
  };
  S.footer = function () {
    return [
      '<footer class="pm-footer">',
        '<span class="pm-dot warn"></span>',
        '<span>Full Access · 1 provider needs attention</span>',
        '<span class="grow"></span>',
        '<span class="faint">Fake system chrome · spacing reference only</span>',
      '</footer>'
    ].join("");
  };

  /* wire shell toggles */
  S.wireShell = function () {
    document.querySelectorAll('[data-shell-toggle]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var part = this.getAttribute("data-shell-toggle");
        var cur = PM.state[part];
        PM.setShell(part, cur === "open" ? "closed" : "open");
        PM.persist();
      });
    });
    // apply initial shell intent
    var shell = document.querySelector(".pm-shell");
    if (shell) { shell.setAttribute("data-rail", PM.state.rail); shell.setAttribute("data-chat", PM.state.chat); }
    // sync toggle button states
    document.querySelectorAll('[data-shell-toggle="rail"]').forEach(function (b) { b.setAttribute("aria-pressed", String(PM.state.rail === "open")); });
    document.querySelectorAll('[data-shell-toggle="chat"]').forEach(function (b) { b.setAttribute("aria-pressed", String(PM.state.chat === "open")); });
  };

  /* ---------- SETTINGS ROW RENDERER (packet 01 states) ---------- */
  /* state chips: Default | Recommended | Inherited | Auto | Not configured | Managed | Custom | Unavailable | Effective differs */
  S.stateChip = function (st) {
    var cls = ({
      default:"neutral", recommended:"info", inherited:"info", auto:"neutral",
      "not-configured":"neutral", managed:"warn", custom:"accent",
      unavailable:"bad", effective:"warn"
    })[st] || "neutral";
    return '<span class="chip ' + cls + '">' + PM.stateLabel(st) + '</span>';
  };
  S.exposureChip = function (ex) {
    if (ex === "standard") return "";
    var cls = ({ advanced:"info", expert:"warn", managed:"warn", diagnostic:"neutral", unavailable:"bad" })[ex] || "neutral";
    return '<span class="chip ' + cls + '">' + PM.exposureLabel(ex) + '</span>';
  };

  S.control = function (r) {
    // apply persisted value/state if present (B7 settings persistence)
    var saved = PM.state.settingValues[r.id];
    if (saved && saved.value !== undefined) r = Object.assign({}, r, { value: saved.value });
    if (saved && saved.state) r = Object.assign({}, r, { state: saved.state });
    if (r.unavailable) {
      return '<span class="chip bad">Unavailable</span><span class="muted small">' + (r.reason || "") + '</span>';
    }
    if (r.managed) {
      return '<span class="chip warn">' + PM.svg("lock",11) + 'Managed</span>';
    }
    if (r.type === "switch") {
      return '<button class="switch" role="switch" aria-checked="' + (r.value ? "true" : "false") + '" data-setting="' + r.id + '" data-default="' + (r.defaultValue != null ? r.defaultValue : r.value) + '" aria-label="' + r.label + '"></button>';
    }
    if (r.type === "select") {
      return '<select class="btn sm" data-setting="' + r.id + '" data-default="' + (r.defaultValue != null ? r.defaultValue : r.value) + '">' +
        r.options.map(function (o) { return '<option' + (o === r.value ? " selected" : "") + '>' + o + '</option>'; }).join("") +
        '</select>';
    }
    if (r.type === "slider") {
      var eff = (r.effective != null) ? '<span class="mgr-note warn small">Effective: ' + r.effective + (r.unit || "") + ' — ' + (r.effectiveNote || "") + '</span>' : "";
      return '<div class="col gap-xs"><div class="row center gap-sm"><input type="range" min="' + r.min + '" max="' + r.max + '" value="' + r.value + '" data-setting="' + r.id + '" data-default="' + (r.defaultValue != null ? r.defaultValue : r.value) + '" data-unit="' + (r.unit||"") + '" style="width:160px"><span class="mono">' + r.value + (r.unit || "") + '</span></div>' + eff + '</div>';
    }
    if (r.type === "text") {
      return '<span class="field" style="min-width:160px"><input type="text" value="' + (r.value || "") + '" data-setting="' + r.id + '" data-default="' + (r.defaultValue != null ? r.defaultValue : r.value) + '" spellcheck="false"></span>';
    }
    if (r.type === "readonly") {
      return '<span class="chip">' + r.value + '</span>';
    }
    return "";
  };

  S.settingRow = function (r) {
    // apply persisted state for the chip display (B7)
    var saved = PM.state.settingValues[r.id];
    var displayState = (saved && saved.state) ? saved.state : r.state;
    var note = "";
    if (r.note) note = '<div class="muted small">' + r.note + '</div>';
    if (r.safety) note += '<span class="chip ' + (r.safety === "risky" ? "warn" : "warn") + '">' + r.safety + '</span>';
    var effDiff = displayState === "effective" ? '<span class="mgr-note warn small">Effective value differs from requested.</span>' : "";
    // Goal Mode warning callout (A9) — renders when a setting carries a `warning` (verbatim from packet 03)
    var warning = r.warning ? '<div class="goal-warning">' + PM.svg("info", 16) + '<div>' + r.warning + '</div></div>' : "";
    // reset-to-default affordance (A3): only when state differs from default
    var canReset = displayState && displayState !== "default" && !r.unavailable && !r.managed;
    var resetBtn = canReset ? '<button class="btn sm ghost icon set-reset" data-reset="' + r.id + '" title="Reset to default" aria-label="Reset ' + r.label + ' to default">' + PM.svg("refresh", 13) + '</button>' : "";
    return [
      '<div class="set-row" data-setting-row="' + r.id + '" data-exposure="' + r.exposure + '">',
        '<div class="col grow gap-xs">',
          '<div class="row center gap-sm wrap">',
            '<strong class="set-label">' + r.label + '</strong>',
            S.stateChip(displayState),
            S.exposureChip(r.exposure),
          '</div>',
          '<span class="muted small">' + r.expl + '</span>',
          note, effDiff, warning,
        '</div>',
        '<div class="set-control">', S.control(r), resetBtn, '</div>',
      '</div>'
    ].join("");
  };

  /* render an entire subcategory's settings as a list */
  S.subList = function (catId, subId) {
    var rows = PM.settingsBySub[catId + "." + subId] || [];
    return rows.map(S.settingRow).join("");
  };

  /* A promo card for a manager-backed subcategory section (so the workspace doc is
     never a bare placeholder row). Shows what the manager owns + an open affordance. */
  S.managerPromo = function (managerId) {
    var m = PM.managers[managerId]; if (!m) return "";
    return [
      '<div class="mgr-promo">',
        '<span class="mgr-promo-icon">' + PM.svg(m.icon, 22) + '</span>',
        '<div class="col grow gap-xs">',
          '<strong>' + m.title + '</strong>',
          '<span class="muted small">This area is managed in the dedicated ' + m.title + ' surface — inventory, status, add/connect, details, requested/effective state, and logs.</span>',
        '</div>',
        '<a class="btn sm primary" data-sub-manager="' + managerId + '">Open manager ' + PM.svg("external",13) + '</a>',
      '</div>'
    ].join("");
  };

  /* wire settings controls after render (B7 persistence + A3 reset) */
  S.wireSettings = function (root) {
    if (!root) return;
    // restore persisted values into controls
    root.querySelectorAll('[data-setting]').forEach(function (ctl) {
      var id = ctl.getAttribute("data-setting");
      var saved = PM.state.settingValues[id];
      if (!saved || saved.value === undefined) return;
      if (ctl.tagName === "BUTTON" && ctl.classList.contains("switch")) {
        ctl.setAttribute("aria-checked", String(!!saved.value));
      } else if (ctl.tagName === "SELECT") {
        ctl.value = saved.value;
      } else if (ctl.type === "range" || ctl.type === "text") {
        ctl.value = saved.value;
        if (ctl.type === "range") {
          var sib = ctl.parentNode.querySelector(".mono");
          if (sib) sib.textContent = saved.value + (ctl.getAttribute("data-unit") || "");
        }
      }
    });
    // toggle
    root.querySelectorAll('button.switch[data-setting]').forEach(function (sw) {
      if (sw.dataset.wired) return; sw.dataset.wired = "1";
      sw.addEventListener("click", function () {
        var id = this.getAttribute("data-setting");
        var on = this.getAttribute("aria-checked") === "true";
        this.setAttribute("aria-checked", String(!on));
        PM.state.settingValues[id] = { value: !on, state: "custom" };
        PM.toast(this.getAttribute("aria-label") + ": " + (on ? "off" : "on"));
        S._flashRowState(this, id);
      });
    });
    // select
    root.querySelectorAll('select[data-setting]').forEach(function (sel) {
      if (sel.dataset.wired) return; sel.dataset.wired = "1";
      sel.addEventListener("change", function () {
        var id = this.getAttribute("data-setting");
        PM.state.settingValues[id] = { value: this.value, state: "custom" };
        PM.toast(id + " → " + this.value);
        S._flashRowState(this, id);
      });
    });
    // slider
    root.querySelectorAll('input[type=range][data-setting]').forEach(function (rng) {
      if (rng.dataset.wired) return; rng.dataset.wired = "1";
      rng.addEventListener("input", function () {
        var sib = this.parentNode.querySelector(".mono");
        if (sib) sib.textContent = this.value + (this.getAttribute("data-unit") || "");
      });
      rng.addEventListener("change", function () {
        var id = this.getAttribute("data-setting");
        var v = this.type === "range" ? Number(this.value) : this.value;
        PM.state.settingValues[id] = { value: v, state: "custom" };
        PM.toast(id + " → " + this.value);
        S._flashRowState(this, id);
      });
    });
    // text
    root.querySelectorAll('input[type=text][data-setting]').forEach(function (inp) {
      if (inp.dataset.wired) return; inp.dataset.wired = "1";
      inp.addEventListener("change", function () {
        var id = this.getAttribute("data-setting");
        PM.state.settingValues[id] = { value: this.value, state: "custom" };
        PM.toast(id + " saved");
        S._flashRowState(this, id);
      });
    });
    // reset-to-default (A3)
    root.querySelectorAll('[data-reset]').forEach(function (btn) {
      if (btn.dataset.wired) return; btn.dataset.wired = "1";
      btn.addEventListener("click", function () {
        var id = this.getAttribute("data-reset");
        // find the control and its default
        var ctl = root.querySelector('[data-setting="' + id + '"]');
        var def = ctl ? ctl.getAttribute("data-default") : null;
        var label = this.getAttribute("aria-label") || id;
        if (ctl && def != null) {
          if (ctl.classList.contains("switch")) ctl.setAttribute("aria-checked", String(def === "true"));
          else ctl.value = def;
          if (ctl.type === "range") { var sib = ctl.parentNode.querySelector(".mono"); if (sib) sib.textContent = def + (ctl.getAttribute("data-unit")||""); }
        }
        delete PM.state.settingValues[id];
        PM.toast("Reset " + label.replace(/^Reset /,"").replace(/ to default$/,"") + " to default");
        // flip the row state chip back to default
        var row = this.closest(".set-row");
        if (row) {
          var chip = row.querySelector(".chip");
          // simplest: re-render just the chip area is heavy; toast is enough visual feedback + pulse
          PM.motion && PM.motion.pulseOnce(row, { duration: 600 });
        }
      });
    });
  };
  // flash the row's state chip to "custom" when a value changes
  S._flashRowState = function (ctl, id) {
    var row = ctl.closest(".set-row");
    if (!row) return;
    var chip = row.querySelector(".chip");
    // lightweight: pulse the row to confirm
    PM.motion && PM.motion.pulseOnce(row, { duration: 500 });
  };

  /* ---------- EXPOSURE CONTROL (A2) ---------- */
  S.exposureControl = function () {
    var cur = PM.state.exposure || "standard";
    var btns = [
      { id:"standard", label:"Standard" },
      { id:"advanced", label:"Advanced" },
      { id:"expert", label:"Expert" }
    ].map(function (b) {
      return '<button class="' + (b.id===cur?"active":"") + '" data-exposure="' + b.id + '">' + b.label + '</button>';
    }).join("");
    return '<div class="exposure-control" data-exposure-control>' + btns + '</div>';
  };
  S.applyExposure = function (container) {
    var level = PM.state.exposure || "standard";
    var rank = { standard:1, advanced:2, expert:3, managed:99, unavailable:99, diagnostic:3 };
    container.querySelectorAll(".set-row[data-exposure]").forEach(function (row) {
      var ex = row.getAttribute("data-exposure");
      var r = rank[ex] || 1;
      var visible = (level === "standard" && r <= 1) ||
                    (level === "advanced" && r <= 2) ||
                    (level === "expert" && r <= 3) ||
                    ex === "managed" || ex === "unavailable";
      // search override: if a query is active and this row matches, keep it visible
      var q = (PM.state.query || "").trim().toLowerCase();
      if (q && row.textContent.toLowerCase().indexOf(q) > -1) visible = true;
      row.style.display = visible ? "" : "none";
    });
  };
  S.wireExposureControl = function (container, onChange) {
    var ctrl = container.querySelector("[data-exposure-control]");
    if (!ctrl) return;
    ctrl.querySelectorAll("[data-exposure]").forEach(function (b) {
      b.addEventListener("click", function () {
        ctrl.querySelectorAll("[data-exposure]").forEach(function (o) { o.classList.remove("active"); });
        this.classList.add("active");
        PM.state.exposure = this.getAttribute("data-exposure");
        S.applyExposure(container);
        PM.motion && PM.motion.staggerIn(container, ".set-row:not([style*='none'])", { step: 18, duration: 240 });
        onChange && onChange();
      });
    });
  };

  /* ---------- SPELLCHECK PROSE FIELD (A1) ---------- */
  S.proseField = function (label, sampleText) {
    var id = "spell-notes";
    return [
      '<div class="set-row" data-exposure="standard">',
        '<div class="col grow gap-xs">',
          '<div class="row center gap-sm"><strong class="set-label">' + label + '</strong>',
            '<span class="chip info">Spellcheck demo</span>',
          '</div>',
          '<span class="muted small">Right-click a wavy-underlined word for suggestions. No autocorrect; skips code, paths, and names.</span>',
          '<div class="spell-field" contenteditable="true" data-spell-field="' + id + '" aria-label="' + label + '">' + (sampleText || "") + '</div>',
          '<span class="spell-hint">Concept demo: simulated local dictionary. Production uses a Slint-portable spelling-service abstraction.</span>',
        '</div>',
      '</div>'
    ].join("");
  };
  S.wireProseFields = function (root) {
    var fields = root.querySelectorAll("[data-spell-field]");
    fields.forEach(function (f) {
      if (window.PM_SPELL) PM_SPELL.attachEditable(f);
    });
  };

  /* ---------- THEME PICKER (inline) ---------- */
  // Each swatch carries a FIXED literal preview gradient approximating its target theme,
  // so every swatch visually distinct (B3 — previously they all resolved to the current theme's vars).
  S.themePreviews = {
    "friendly-light": "linear-gradient(135deg,#fbf7f3 0%,#f3ece7 60%,#3f9cc7 100%)",
    "friendly-dark":  "linear-gradient(135deg,#211e26 0%,#2b2731 60%,#6fc6e8 100%)",
    "glass-light":    "linear-gradient(135deg,#e8e0ef 0%,#c4d9f0 55%,#8161d6 100%)",
    "glass-dark":     "linear-gradient(135deg,#1c1530 0%,#4a2d7a 55%,#b79cff 100%)",
    "retro-light":    "linear-gradient(135deg,#f1ece1 0%,#ded6c4 60%,#0047ab 100%)",
    "retro-dark":     "linear-gradient(135deg,#0e0e0e 0%,#161616 60%,#00ff41 100%)",
    "basic-light":    "linear-gradient(135deg,#eef0f3 0%,#f7f8fa 60%,#0056b3 100%)",
    "basic-dark":     "linear-gradient(135deg,#15171b 0%,#1e2127 60%,#64b5f6 100%)"
  };
  S.themePicker = function () {
    var rows = ["friendly","glass","retro","basic"].map(function (fam) {
      var dark = fam + "-dark", light = fam + "-light";
      return [
        '<div class="theme-row">',
          '<span class="theme-fam">' + fam.charAt(0).toUpperCase()+fam.slice(1) + '</span>',
          '<button class="theme-sw" data-theme-pick="' + light + '" aria-label="' + fam + ' light" style="background:' + S.themePreviews[light] + '"></button>',
          '<button class="theme-sw" data-theme-pick="' + dark + '" aria-label="' + fam + ' dark" style="background:' + S.themePreviews[dark] + '"></button>',
        '</div>'
      ].join("");
    }).join("");
    var rmChecked = PM.state.reducedMotion ? "true" : "false"; // B4: reflect saved state
    return [
      '<div class="theme-picker card" id="pmThemePicker">',
        '<div class="row between"><strong class="small">Theme</strong>',
          '<label class="row center gap-xs muted small"><span class="switch" role="switch" aria-checked="' + rmChecked + '" id="rmToggle"></span>Reduced motion</label>',
        '</div>',
        '<div class="theme-grid">', rows, '</div>',
      '</div>'
    ].join("");
  };
  S.wireThemePicker = function () {
    var p = document.getElementById("pmThemePicker");
    if (!p) return;
    function refreshSwatches() {
      p.querySelectorAll(".theme-sw").forEach(function (sw) {
        sw.classList.toggle("sel", sw.getAttribute("data-theme-pick") === PM.state.theme);
      });
    }
    p.querySelectorAll("[data-theme-pick]").forEach(function (sw) {
      sw.addEventListener("click", function () {
        PM.applyTheme(this.getAttribute("data-theme-pick"));
        PM.persist();
        refreshSwatches();
      });
    });
    var rm = document.getElementById("rmToggle");
    if (rm) {
      rm.addEventListener("click", function () {
        PM.applyReducedMotion(this.getAttribute("aria-checked") !== "true");
        this.setAttribute("aria-checked", String(PM.state.reducedMotion));
        PM.persist();
      });
    }
    refreshSwatches();
  };
})();
