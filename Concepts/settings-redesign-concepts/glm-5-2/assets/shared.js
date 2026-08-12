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
        S.noticeSprout(),
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
    // title-bar notification sprout (sole in-app notification surface)
    S.wireNoticeSprout();
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
    if (r.error) note += '<span class="mgr-note bad small">' + PM.svg("warn", 11) + " " + r.error + "</span>";
    if (r.restart) note += '<span class="chip warn">' + PM.svg("refresh", 11) + " Restart required</span>";
    if (r.reconnect) note += '<span class="chip warn">Reconnect required</span>';
    if (r.elsewhere) note += '<span class="mgr-note warn small">Changed elsewhere — value refreshed from another window.</span>';
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

  /* ---------- NOTIFICATION SPROUT (title-bar inbox — sole in-app surface, packet 06) ---------- */
  S.noticeSprout = function () {
    var n = PM_DEMO.inbox || [];
    var bad = n.filter(function (x) { return x.kind === "bad"; }).length;
    var count = n.length;
    return '<button class="pm-sprout' + (bad ? " warn" : "") + '" data-sprout type="button" aria-label="Notifications, ' + count + ' unread" aria-expanded="false">' +
      PM.svg("bell", 16) + '<span class="pm-sprout-count' + (count ? "" : " hidden") + '">' + count + "</span></button>";
  };
  S.wireNoticeSprout = function () {
    var btn = document.querySelector("[data-sprout]");
    if (!btn || btn.dataset.wired) return; btn.dataset.wired = "1";
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var old = document.querySelector("[data-popover].pm-inbox");
      if (old) { old.remove(); btn.setAttribute("aria-expanded", "false"); return; }
      var items = (PM_DEMO.inbox || []).map(function (n) {
        return '<button class="pm-menu-item" data-inbox-target="' + n.target + '" style="align-items:flex-start;gap:8px">' +
          '<span class="sdot ' + n.kind + '"></span>' +
          '<span class="col gap-xs"><span style="font-size:13px;text-align:left">' + n.title + "</span>" +
          '<span class="muted small">' + n.ago + "</span></span></button>";
      }).join("");
      var pop = PM.el("div", "pm-menu pm-inbox", { "data-popover": "", role: "menu", "aria-label": "Notifications" },
        '<div class="pm-inbox-head">Notifications — title-bar stack is the only in-app surface</div>' + items);
      document.body.appendChild(pop);
      var r = btn.getBoundingClientRect();
      pop.style.top = (r.bottom + 6) + "px";
      pop.style.left = Math.min(r.left, window.innerWidth - 280) + "px";
      pop.style.minWidth = "280px";
      btn.setAttribute("aria-expanded", "true");
      pop.querySelectorAll("[data-inbox-target]").forEach(function (it) {
        it.addEventListener("click", function () {
          var t = it.getAttribute("data-inbox-target");
          pop.remove(); btn.setAttribute("aria-expanded", "false");
          if (PM._inboxRoute) { PM._inboxRoute(t); return; }
          PM.openCategory(t.split(".")[0], t.split(".")[1]); PM.render && PM.render();
        });
      });
      setTimeout(function () { document.addEventListener("click", function c() { pop.remove(); btn.setAttribute("aria-expanded", "false"); document.removeEventListener("click", c); }, { once: true }); }, 0);
    });
  };

  /* ---------- STATE BLOCKS (loading/empty/error/managed/unavailable, packet 08) ---------- */
  S.stateBlock = function (kind, title, msg) {
    var icon = ({ loading: "refresh", empty: "search", error: "bad", managed: "lock", unavailable: "warn" })[kind] || "info";
    var cls = ({ loading: "info", empty: "neutral", error: "bad", managed: "warn", unavailable: "bad" })[kind] || "neutral";
    var ic = kind === "loading"
      ? '<span class="state-spin">' + PM.svg("refresh", 18) + "</span>"
      : '<span class="state-ic ' + cls + '">' + PM.svg(icon, 18) + "</span>";
    return '<div class="state-block ' + cls + '">' + ic +
      '<div class="col gap-xs"><strong>' + title + "</strong>" + (msg ? '<span class="muted small">' + msg + "</span>" : "") + "</div></div>";
  };

  /* ---------- RESUME RECENT (Home 4th job, packet 01) ---------- */
  S.recentWork = function () {
    var items = (PM_DEMO.recent || []).map(function (r) {
      return '<button class="recent-item" data-recent data-recent-mgr="' + (r.manager || "") + '" data-recent-target="' + r.target + '">' +
        '<span class="recent-ic">' + PM.svg("history", 15) + "</span>" +
        '<div class="col gap-xs"><span class="recent-label">' + r.label + '</span><span class="muted small">' + r.ago + "</span></div>" +
        '<span class="recent-open">' + PM.svg("external", 13) + "</span></button>";
    }).join("");
    return '<section class="recent-strip"><span class="recent-eyebrow">Resume recent</span><div class="recent-grid">' + items + "</div></section>";
  };
  S.wireRecentWork = function () {
    document.querySelectorAll("[data-recent]").forEach(function (b) {
      b.addEventListener("click", function () {
        var mgr = this.getAttribute("data-recent-mgr");
        var t = this.getAttribute("data-recent-target");
        if (mgr && PM.openOwnedManager) PM.openOwnedManager(mgr);
        else if (mgr) { PM.openManager(mgr); PM.render && PM.render(); }
        else { PM.openCategory(t.split(".")[0], t.split(".")[1]); PM.render && PM.render(); }
      });
    });
  };

  /* ---------- SECRET FIELD (7 secret-value types, packet 02) ---------- */
  S.secretField = function (s) {
    var body;
    if (s.mode === "secret-input") {
      body = '<span class="field secret-field"><span class="mono secret-val" data-masked="' + s.masked + '">' + s.masked + "</span>" +
        '<button class="btn sm ghost icon" data-secret="reveal" title="Reveal (gated)" aria-label="Reveal">' + PM.svg("eye", 14) + "</button>" +
        '<button class="btn sm ghost icon" data-secret="copy" title="Copy (gated)" aria-label="Copy">' + PM.svg("doc", 14) + "</button>" +
        '<button class="btn sm ghost icon" data-secret="test" title="Test" aria-label="Test">' + PM.svg("bolt", 14) + "</button></span>";
    } else if (s.mode === "vault-ref" || s.mode === "vault-cmd") {
      body = '<span class="chip mono">' + s.ref + '</span><button class="btn sm ghost" data-secret="vault">Open vault</button>';
    } else if (s.mode === "cli-owned") {
      body = '<button class="btn sm primary" data-secret="cli-launch">' + PM.svg("external", 13) + "Launch CLI login</button>";
    } else if (s.mode === "pm-oauth") {
      body = '<button class="btn sm primary" data-secret="pm-authorize">' + PM.svg("lock", 13) + "Authorize via PM</button>";
    } else if (s.mode === "env") {
      body = '<span class="chip mono">env: ' + s.var + '</span><span class="chip">read-only</span>';
    } else { // text (non-secret)
      body = '<span class="field"><input type="text" value="' + (s.value || "") + '" aria-label="' + s.name + '"></span>';
    }
    return '<div class="secret-row"><div class="col grow gap-xs">' +
      '<div class="row center gap-sm wrap"><strong>' + s.name + '</strong><span class="chip accent">' + s.type + "</span></div>" +
      '<span class="muted small">' + s.note + "</span></div>" +
      '<div class="row center gap-xs secret-control">' + body + "</div></div>";
  };
  S.wireSecretFields = function (root) {
    if (!root) return;
    root.querySelectorAll("[data-secret]").forEach(function (b) {
      if (b.dataset.wired) return; b.dataset.wired = "1";
      b.addEventListener("click", function () {
        var a = this.getAttribute("data-secret");
        if (a === "reveal") {
          var f = this.closest(".secret-field"); var v = f && f.querySelector(".secret-val");
          if (v) { var m = v.getAttribute("data-masked"); var shown = v.dataset.shown === "1"; v.textContent = shown ? m : "sk-ant-9f2a-XXXX-XXXX (revealed)"; v.dataset.shown = shown ? "0" : "1"; PM.toast(shown ? "Masked again" : "Revealed — gated, never logged"); }
        } else if (a === "copy") PM.toast("Copied to clipboard — gated, auto-clears");
        else if (a === "test") PM.toast("Probe sent — receipted");
        else if (a === "vault") PM.toast("Opened vault reference — external");
        else if (a === "cli-launch") PM.toast("Launching CLI-owned OAuth in an isolated profile");
        else if (a === "pm-authorize") PM.toast("PM-direct OAuth flow — receipted");
      });
    });
  };

  /* ---------- SEARCH KIND META (7 distinct result types, packet 01) ---------- */
  S.searchKindMeta = function (kind) {
    return ({
      setting: { label: "Setting", icon: "settings", cls: "" },
      category: { label: "Area", icon: "grid", cls: "" },
      subcategory: { label: "Section", icon: "list", cls: "" },
      manager: { label: "Manager", icon: "external", cls: "accent" },
      destination: { label: "Area", icon: "grid", cls: "" },
      action: { label: "Action", icon: "bolt", cls: "accent" },
      status: { label: "Status", icon: "info", cls: "info" },
      diagnostic: { label: "Diagnostic", icon: "doc", cls: "neutral" },
      workflow: { label: "Setup", icon: "compass", cls: "info" },
      unavailable: { label: "Unavailable", icon: "warn", cls: "bad" }
    })[kind] || { label: kind, icon: "dot", cls: "" };
  };

  /* ---------- OWNED-FAMILIES STRIP (final-cumulative per-concept ownership) ---------- */
  /* Renders destination-control cards (NOT filter pills) for the families a concept
     deeply demonstrates. Inserted into each concept's Home so ownership is explicit. */
  var OWNED_PURPOSE = {
    pam:"Providers, accounts, connections, models, installations, roles.",
    context:"Durable breadth, narrow turn context, AGENTS.md chain.",
    memory:"Evidence-backed Gists; half-life fades, never deletes.",
    personas:"Behavior, not authority; scope explicit; import-trust scan.",
    goal:"Defaults + ceilings; requested/effective worker routes.",
    crew:"Orchestrator-owned templates; requested vs effective members.",
    permissions:"Ordered rules, per-tool overrides, FileSafe floor.",
    bsd:"Read-only observation; auto on risk/phase triggers.",
    notifications:"Delivery, routing, sounds; title-bar stack only.",
    sounds:"Uploaded sounds + PeonPing/OpenPeon packs; license checks.",
    appearance:"Families, custom TOML, fonts, UI scale, live reload.",
    spellcheck:"Dictionary sources; personal/project; no autocorrect.",
    desktop:"Tray, window restore, crash recovery, limits.",
    teacher:"Guided explanation + safe transitions.",
    filemanager:"Tree, tabs, large-file, changed-on-disk, recovery.",
    terminal:"Profiles, ANSI, opacity, cursor, CWD/env, retention.",
    lsp:"Registry, startup, conflicts, formatting ownership.",
    formatters:"Detected/custom, single ownership per language.",
    commands:"Custom lifecycle, shortcuts, conflicts, dry-run.",
    mcp:"Transport, tools, approval, scope, diagnostics.",
    skills:"Skills, plugins, tools, commands — four distinct kinds.",
    testing:"Per-capability Auto/On/Off; DAP, capture, artifacts.",
    storage:"Mode, retention, holds, compaction, quarantine.",
    backup:"Action vs setting vs status vs manager vs log.",
    settingsLifecycle:"Export/import/conflict/rollback/receipt/reset.",
    history:"Filters, archive, PM-owned vs provider identity.",
    artifacts:"Type/version/retention/receipts/redaction/cleanup.",
    sourcecontrol:"Changes/history/graph/worktrees; forge; leases.",
    github:"Pinned workflows, branch readiness, run/job/log.",
    containers:"Docker/Podman/K8s; registries; capability probes.",
    webfetch:"Priority, limits, credit guards, caches, privacy.",
    searchindex:"Enable, rebuild, exclusions, disk, failures.",
    cleanup:"Dry-run first; worktree safety; receipts.",
    server:"Deferred-owner insertion shell — no state machine.",
    media:"Image, audio, video routes (extra — shared grammar)."
  };
  S.ownedStrip = function (conceptKey) {
    var c = PM_DEMO.concepts[conceptKey]; if (!c) return "";
    var cards = c.families.map(function (fam) {
      var m = PM.managers[fam]; if (!m) return "";
      return [
        '<a class="owned-card" data-owned-manager="' + fam + '" role="button" tabindex="0" aria-label="Open ' + m.title + ' manager">',
          '<span class="owned-icon">' + PM.svg(m.icon, 18) + '</span>',
          '<div class="col grow gap-xs">',
            '<strong>' + m.title + '</strong>',
            '<span class="muted small">' + (OWNED_PURPOSE[fam] || "") + '</span>',
          '</div>',
          '<span class="owned-open">' + PM.svg("external", 13) + '</span>',
        '</a>'
      ].join("");
    }).join("");
    return [
      '<section class="owned-strip card">',
        '<div class="row between wrap gap-sm">',
          '<div class="col gap-xs">',
            '<span class="owned-eyebrow">Deep demos — this concept owns</span>',
            '<strong>' + c.name + ' proves these families</strong>',
          '</div>',
          '<span class="chip accent">' + c.families.length + ' families</span>',
        '</div>',
        '<div class="owned-grid">' + cards + '</div>',
      '</section>'
    ].join("");
  };
  S.wireOwnedStrip = function (root) {
    if (!root) return;
    root.querySelectorAll("[data-owned-manager]").forEach(function (a) {
      a.addEventListener("click", function () {
        var id = this.getAttribute("data-owned-manager");
        if (PM.openOwnedManager) PM.openOwnedManager(id);
        else { PM.openManager(id); PM.render && PM.render(); }
      });
      a.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this.click(); }
      });
    });
  };
})();
