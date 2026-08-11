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
    if (r.unavailable) {
      return '<span class="chip bad">Unavailable</span><span class="muted small">' + (r.reason || "") + '</span>';
    }
    if (r.managed) {
      return '<span class="chip warn">' + PM.svg("lock",11) + 'Managed</span>';
    }
    if (r.type === "switch") {
      return '<button class="switch" role="switch" aria-checked="' + (r.value ? "true" : "false") + '" data-setting="' + r.id + '" aria-label="' + r.label + '"></button>';
    }
    if (r.type === "select") {
      return '<select class="btn sm" data-setting="' + r.id + '">' +
        r.options.map(function (o) { return '<option' + (o === r.value ? " selected" : "") + '>' + o + '</option>'; }).join("") +
        '</select>';
    }
    if (r.type === "slider") {
      var eff = (r.effective != null) ? '<span class="mgr-note warn small">Effective: ' + r.effective + (r.unit || "") + ' — ' + (r.effectiveNote || "") + '</span>' : "";
      return '<div class="col gap-xs"><div class="row center gap-sm"><input type="range" min="' + r.min + '" max="' + r.max + '" value="' + r.value + '" data-setting="' + r.id + '" style="width:160px"><span class="mono">' + r.value + (r.unit || "") + '</span></div>' + eff + '</div>';
    }
    if (r.type === "text") {
      return '<span class="field" style="min-width:160px"><input type="text" value="' + (r.value || "") + '" data-setting="' + r.id + '" spellcheck="false"></span>';
    }
    if (r.type === "readonly") {
      return '<span class="chip">' + r.value + '</span>';
    }
    return "";
  };

  S.settingRow = function (r) {
    var note = "";
    if (r.note) note = '<div class="muted small">' + r.note + '</div>';
    if (r.safety) note += '<span class="chip ' + (r.safety === "risky" ? "warn" : "warn") + '">' + r.safety + '</span>';
    var effDiff = r.state === "effective" ? '<span class="mgr-note warn small">Effective value differs from requested.</span>' : "";
    return [
      '<div class="set-row" data-setting-row="' + r.id + '">',
        '<div class="col grow gap-xs">',
          '<div class="row center gap-sm wrap">',
            '<strong class="set-label">' + r.label + '</strong>',
            S.stateChip(r.state),
            S.exposureChip(r.exposure),
          '</div>',
          '<span class="muted small">' + r.expl + '</span>',
          note, effDiff,
        '</div>',
        '<div class="set-control">', S.control(r), '</div>',
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

  /* wire settings controls after render */
  S.wireSettings = function (root) {
    if (!root) return;
    root.querySelectorAll('button.switch[data-setting]').forEach(function (sw) {
      sw.addEventListener("click", function () {
        var on = this.getAttribute("aria-checked") === "true";
        this.setAttribute("aria-checked", String(!on));
        PM.toast(this.getAttribute("aria-label") + ": " + (on ? "off" : "on"));
      });
    });
    root.querySelectorAll('select[data-setting]').forEach(function (sel) {
      sel.addEventListener("change", function () { PM.toast(this.getAttribute("data-setting") + " → " + this.value); });
    });
    root.querySelectorAll('input[type=range][data-setting]').forEach(function (rng) {
      rng.addEventListener("input", function () {
        var sib = this.parentNode.querySelector(".mono");
        if (sib) sib.textContent = this.value + (this.getAttribute("data-unit") || "");
      });
    });
  };

  /* ---------- THEME PICKER (inline) ---------- */
  S.themePicker = function () {
    var rows = ["friendly","glass","retro","basic"].map(function (fam) {
      var dark = fam + "-dark", light = fam + "-light";
      return [
        '<div class="theme-row">',
          '<span class="theme-fam">' + fam.charAt(0).toUpperCase()+fam.slice(1) + '</span>',
          '<button class="theme-sw" data-theme-pick="' + light + '" aria-label="' + fam + ' light" style="background:linear-gradient(135deg,var(--bg),var(--surface))" ></button>',
          '<button class="theme-sw" data-theme-pick="' + dark + '" aria-label="' + fam + ' dark" style="background:linear-gradient(135deg,var(--bg),var(--surface))"></button>',
        '</div>'
      ].join("");
    }).join("");
    return [
      '<div class="theme-picker card" id="pmThemePicker">',
        '<div class="row between"><strong class="small">Theme</strong>',
          '<label class="row center gap-xs muted small"><span class="switch" role="switch" aria-checked="false" id="rmToggle"></span>Reduced motion</label>',
        '</div>',
        '<div class="theme-grid">', rows, '</div>',
      '</div>'
    ].join("");
  };
  S.wireThemePicker = function () {
    var p = document.getElementById("pmThemePicker");
    if (!p) return;
    // theme picks must reflect current theme across the picker swatches; set after render
    function refreshSwatches() {
      p.querySelectorAll(".theme-sw").forEach(function (sw) {
        var id = sw.getAttribute("data-theme-pick");
        var themeEl = document.documentElement.cloneNode(true);
        // simpler: just toggle selected ring
        sw.classList.toggle("sel", id === PM.state.theme);
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
      rm.setAttribute("aria-checked", String(PM.state.reducedMotion));
      rm.addEventListener("click", function () {
        PM.applyReducedMotion(this.getAttribute("aria-checked") !== "true");
        this.setAttribute("aria-checked", String(PM.state.reducedMotion));
        PM.persist();
      });
    }
    refreshSwatches();
  };
})();
