/* ============================================================================
   ca-views.js — shared view layer for the four Settings concepts
   ----------------------------------------------------------------------------
   Render helpers + behavior shared by every concept page (the shared
   vocabulary); each concept composes these into its own information
   architecture. Depends on: ca-components.css, pm-store.js (PMStore),
   pm-search.js (PMSearch).

   Settings values: demo settings stay immutable; user edits live in the
   store as an `overrides` map keyed by the FULL setting id (dotted ids are
   never used as store paths — use CAViews.setOverride/getOverride).

   Provider data: concepts seed `providers` (deep copy of
   PM_SETTINGS_DEMO.providers) into the store; the provider helpers here
   read and mutate that store array so all four concepts behave identically.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- tiny utilities ---------- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function clone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }

  function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

  /* ---------- inline SVG icon dictionary (no emoji anywhere) ---------- */

  var ICONS = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/></svg>',
    palette: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="8.5" cy="10" r="1.2"/><circle cx="12" cy="7.5" r="1.2"/><circle cx="15.5" cy="10" r="1.2"/><path d="M12 20.5c1.8-2 .6-3.7 2.4-4.6 1.5-.8 3.1-.4 3.1-2.4"/></svg>',
    layers: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 4.7-9 4.7-9-4.7z"/><path d="m4.5 12.2 7.5 3.9 7.5-3.9"/><path d="m4.5 16.2 7.5 3.9 7.5-3.9"/></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 2.6v4.9c0 4.3-3 7.5-7 9.2-4-1.7-7-4.9-7-9.2V5.6z"/><path d="m9 12 2.2 2.2L15.5 9.7"/></svg>',
    code: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 7-5 5 5 5"/><path d="m16 7 5 5-5 5"/></svg>',
    stack: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v4H5zM5 10h14v4H5zM5 16h14v4H5z"/></svg>',
    branch: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="6" r="2.4"/><circle cx="7" cy="18" r="2.4"/><circle cx="17" cy="12" r="2.4"/><path d="M7 8.4v7.2M9.3 6.9l5.4 4"/></svg>',
    wrench: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.8 6.2a4.2 4.2 0 0 0-5.9 5L4 16.2V20h3.8l5-4.9a4.2 4.2 0 0 0 5-5.9L14.6 12l-2.6-2.6z"/></svg>',
    image: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m5 18 5-5 3 3 3-3 3 3"/></svg>',
    gauge: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 17a8 8 0 1 1 15 0"/><path d="M12 17l3-7"/><circle cx="12" cy="17" r="1.5"/></svg>',
    plug: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3v5m6-5v5"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v4"/></svg>',
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>',
    mask: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="10.5" r="1.1"/><circle cx="15" cy="10.5" r="1.1"/><path d="M8.5 14.5c1 1 2.2 1.5 3.5 1.5s2.5-.5 3.5-1.5"/></svg>',
    grid: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
    puzzle: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6v4a2 2 0 1 0 0 4h-6v-4a2 2 0 1 1 0-4z" transform="rotate(90 12 12)"/></svg>',
    terminal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="m7 9 3 3-3 3"/><path d="M12 15h5"/></svg>',
    command: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9h6v6H9z"/><path d="M9 9V7a2 2 0 1 0-2 2zm6 0h2a2 2 0 1 0-2-2zm0 6v2a2 2 0 1 0 2-2zm-6 0H7a2 2 0 1 0 2 2z"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3 5.5 13H11l-1.5 8L18 10.5h-5.5z"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17.5H7.5A2.5 2.5 0 0 0 5 22z"/><path d="M5 19.5V4.5M19 15.5H7.5A2.5 2.5 0 0 0 5 18"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.5 2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12a7 7 0 1 1-2-4.9"/><path d="M19 4v5h-5"/></svg>',
    eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.6"/></svg>',
    eyeoff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4l16 16"/><path d="M9.9 6.3A9.4 9.4 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3 3.6M6.6 8.4A16 16 0 0 0 2.5 12s3.5 6 9.5 6c1.2 0 2.3-.2 3.3-.6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6l-1 6 3.5 3.5v2h-11v-2L10 10z"/><path d="M12 15.5V21"/></svg>',
    dots: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>'
  };

  function icon(name) { return ICONS[name] || ICONS.layers; }

  /* ---------- humanization maps (never show raw tokens) ---------- */

  var STATE_LABEL = {
    "default": "Default", "recommended": "Recommended", "inherited": "Inherited",
    "auto": "Auto", "not-configured": "Not configured", "managed": "Managed",
    "custom": "Custom", "unavailable": "Unavailable", "effective-differs": "Effective value differs"
  };

  var EXPOSURE_LABEL = {
    "standard": "Standard", "advanced": "Advanced", "expert": "Expert — risky",
    "managed": "Managed", "diagnostic": "Diagnostic", "unavailable": "Unavailable"
  };

  var SCOPE_LABEL = {
    "turn": "This turn", "thread": "This thread", "goal": "This Goal or run",
    "project": "Project", "global": "Global"
  };

  var HEALTH = {
    "ready": { label: "Ready", dot: "ok" },
    "signed-in-idle": { label: "Signed in, idle", dot: "info" },
    "auth-ok-invocation-failed": { label: "Signed in — model calls failing", dot: "danger" },
    "setup-required": { label: "Setup required", dot: "warn" },
    "healthy": { label: "Healthy", dot: "ok" },
    "degraded": { label: "Degraded", dot: "warn" },
    "connecting": { label: "Connecting", dot: "info" },
    "error": { label: "Error", dot: "danger" },
    "not-configured": { label: "Not configured", dot: "unknown" }
  };

  var INSTALL_STATE = {
    "installed-signed-in": "Installed and signed in",
    "installed-signed-out": "Installed — signed out",
    "not-installed": "Not installed",
    "not-applicable": null
  };

  var AUTH_MODEL = {
    "cli-profile-oauth": "The provider's own CLI owns sign-in inside an isolated profile. Puppet Master launches the native login and never sees credentials.",
    "pm-direct-oauth": "Puppet Master owns this sign-in directly.",
    "api-key": "An API credential you paste into a Puppet Master connection.",
    "api-token": "An API token for your organization's tenant endpoint.",
    "server": "A server route — no shared sign-in.",
    "none": "No authentication — a local or keyless route.",
    "mixed": "Each underlying provider owns its own credential."
  };

  var GROUP_LABEL = {
    "installed-tools": "Installed tools and signed-in apps",
    "connected-accounts": "Connected accounts",
    "api": "API connections",
    "server": "Server connections",
    "free": "Free and community models"
  };

  var CAP_STATE = {
    "supported": "Supported", "unsupported": "Unsupported", "likely": "Likely",
    "unverified": "Unverified", "temporarily-unavailable": "Temporarily unavailable",
    "ca-transformed": "Via PM transformation", "other-route": "Via another route"
  };

  var WHATNEXT = {
    "stop-and-wait": "Stop and wait for the reset",
    "use-extra-balance": "Use the extra balance",
    "use-paid-usage": "Use paid usage after the plan",
    "use-saved-reset": "Use a saved reset",
    "switch-account-or-provider": "Switch account or provider",
    "use-free-models": "Use Free Models",
    "use-api-billing": "Use API billing",
    "ask-each-time": "Ask each time"
  };

  function human(map, key) { return map[key] || String(key || "").replace(/-/g, " "); }

  /* ---------- store-backed overrides (full-id keys, never dot paths) ---------- */

  function overrides() { return PMStore.get("overrides", {}); }
  function getOverride(id) { var o = overrides(); return Object.prototype.hasOwnProperty.call(o, id) ? o[id] : undefined; }
  function setOverride(id, value) { var o = overrides(); o[id] = value; PMStore.set("overrides", o); }
  function clearOverride(id) { var o = overrides(); delete o[id]; PMStore.set("overrides", o); }

  function settingValue(s) { var v = getOverride(s.id); return v === undefined ? s.value : v; }

  /* Resolve the displayed state/source after session edits. */
  function resolveState(s) {
    var v = getOverride(s.id);
    if (v === undefined) return { state: s.state, source: s.source };
    if (eq(v, s.defaultValue)) return { state: "default", source: "You reset this to the default" };
    return { state: "custom", source: "Changed in this demo session" };
  }

  function fmtValue(s, v) {
    if (v === "auto") return "Auto";
    if (v === "inherit") return "Inherit";
    if (v === "not-configured") return "Not configured";
    if (s.options) {
      for (var i = 0; i < s.options.length; i++) if (s.options[i].value === v) return s.options[i].label;
    }
    if (typeof v === "boolean") return v ? "On" : "Off";
    return String(v);
  }

  /* ---------- badges ---------- */

  function stateBadge(s) {
    var r = resolveState(s);
    return '<span class="ca-badge" data-kind="state" data-icon data-state="' + esc(r.state) + '">' + esc(human(STATE_LABEL, r.state)) + "</span>";
  }

  function metaBadges(s) {
    var out = "";
    (s.scope || []).forEach(function (sc) {
      out += '<span class="ca-badge" data-kind="scope">' + esc(human(SCOPE_LABEL, sc)) + "</span>";
    });
    if (s.exposure && s.exposure !== "standard") {
      out += '<span class="ca-badge" data-kind="exposure" data-icon data-exposure="' + esc(s.exposure) + '">' + esc(human(EXPOSURE_LABEL, s.exposure)) + "</span>";
    }
    if (s.restartRequired) out += '<span class="ca-badge" data-kind="restart" data-icon>Needs restart</span>';
    if (s.reconnectRequired) out += '<span class="ca-badge" data-kind="restart" data-icon>Needs reconnect</span>';
    if (s.effect) out += '<span class="ca-badge" data-kind="effect" data-icon data-effect="' + esc(s.effect.kind) + '" data-tip="' + esc(s.effect.note) + '">' + esc(human({ cost: "Cost", privacy: "Privacy", safety: "Safety", performance: "Performance" }, s.effect.kind)) + "</span>";
    return out;
  }

  /* ---------- controls (markup follows ca-components.css contracts) ---------- */

  function controlHtml(s) {
    var v = settingValue(s);
    var disabled = s.state === "managed" || s.state === "unavailable" ? " disabled" : "";
    var disAttr = s.state === "managed" || s.state === "unavailable" ? ' aria-disabled="true"' : "";
    switch (s.type) {
      case "toggle":
        return '<button type="button" class="ca-switch" role="switch" aria-checked="' + (v === true) + '" data-sid="' + esc(s.id) + '" aria-label="' + esc(s.label) + '"' + disabled + "></button>";
      case "select":
        return '<span class="ca-select"><select data-sid="' + esc(s.id) + '" aria-label="' + esc(s.label) + '"' + disabled + ">" +
          (s.options || []).map(function (o) {
            return '<option value="' + esc(o.value) + '"' + (o.value === v ? " selected" : "") + ">" + esc(o.label) + "</option>";
          }).join("") + "</select></span>";
      case "segmented":
        return '<div class="ca-seg" role="radiogroup" aria-label="' + esc(s.label) + '" data-sid="' + esc(s.id) + '">' +
          (s.options || []).map(function (o) {
            return '<button type="button" role="radio" aria-checked="' + (o.value === v) + '" data-value="' + esc(o.value) + '"' + disabled + ">" + esc(o.label) + "</button>";
          }).join("") + "</div>";
      case "slider":
        return '<span class="ca-sliderwrap"><input type="range" class="ca-slider" data-sid="' + esc(s.id) + '" min="' + (s.min || 0) + '" max="' + (s.max || 100) + '" step="' + (s.step || 1) + '" value="' + esc(v) + '" aria-label="' + esc(s.label) + '"' + disabled + '><output class="ca-slider-val">' + esc(v) + (s.unit ? " " + esc(s.unit) : "") + "</output></span>";
      case "number":
        return '<span class="ca-stepper" data-sid="' + esc(s.id) + '"><button type="button" data-step="-1" aria-label="Decrease"' + disabled + '>−</button><input type="number" value="' + esc(v) + '" min="' + (s.min || 0) + '" max="' + (s.max == null ? 999 : s.max) + '" aria-label="' + esc(s.label) + '"' + disabled + '><button type="button" data-step="1" aria-label="Increase"' + disabled + '>+</button></span>';
      case "text":
      case "path": {
        var isToken = v === "auto" || v === "inherit" || v === "not-configured";
        var hint = isToken ? ' data-empty-hint="' + esc(v) + '"' : "";
        return '<span class="ca-text"' + hint + '><input type="text" data-sid="' + esc(s.id) + '" value="' + (isToken ? "" : esc(v)) + '" placeholder="' + esc(s.placeholder || "Enter a value") + '" aria-label="' + esc(s.label) + '"' + disabled + "></span>";
      }
      case "color":
        return '<span class="ca-swatches" data-sid="' + esc(s.id) + '" role="group" aria-label="' + esc(s.label) + '">' +
          (s.options || []).map(function (o) {
            return '<button type="button" class="ca-swatch" style="--swatch:' + esc(o.value) + '" data-value="' + esc(o.value) + '" aria-pressed="' + (o.value === v) + '" aria-label="' + esc(o.label) + '"' + disAttr + "></button>";
          }).join("") + "</span>";
      case "action":
        return '<button type="button" class="ca-btn" data-run="' + esc(s.id) + '">' + esc(s.actionLabel || "Run") + "</button>";
      case "multiselect":
        return '<span class="ca-swatches" data-sid="' + esc(s.id) + '" role="group" aria-label="' + esc(s.label) + '">' +
          (s.options || []).map(function (o) {
            var on = Array.isArray(v) && v.indexOf(o.value) !== -1;
            return '<button type="button" class="ca-chip" data-value="' + esc(o.value) + '" aria-pressed="' + on + '"' + disAttr + ">" + esc(o.label) + "</button>";
          }).join("") + "</span>";
      default:
        return '<span class="ca-muted">' + esc(fmtValue(s, v)) + "</span>";
    }
  }

  /* ---------- settings row (follows the .ca-row DOM contract) ---------- */

  function rowHtml(s, opts) {
    opts = opts || {};
    var r = resolveState(s);
    var reason = "";
    if (r.state === "managed" && s.managedReason) reason = s.managedReason;
    if (r.state === "unavailable" && s.unavailableReason) reason = s.unavailableReason;
    var effective = "";
    if (r.state === "effective-differs" && s.effectiveValue !== undefined) {
      effective = '<div class="ca-row-effective">Requested <b class="ca-eff">' + esc(fmtValue(s, settingValue(s))) + '</b> → Effective <b class="ca-eff">' + esc(fmtValue(s, s.effectiveValue)) + "</b>" + (s.effectiveReason ? " — " + esc(s.effectiveReason) : "") + "</div>";
    }
    var changed = getOverride(s.id) !== undefined;
    var reset = changed && !eq(settingValue(s), s.defaultValue)
      ? '<button type="button" class="ca-btn" data-variant="quiet" data-reset="' + esc(s.id) + '">Reset</button>' : "";
    var help = s.help ? ' <span class="ca-ic ca-help" style="--ca-ic:var(--ca-ic-info)" tabindex="0" data-tip="' + esc(s.help) + '" aria-label="More about this setting"></span>' : "";
    return '<div class="ca-row" id="row-' + esc(s.id) + '" data-state="' + esc(r.state) + '" data-exposure="' + esc(s.exposure || "standard") + '"' + (s.risky ? " data-risky" : "") + ' data-setting="' + esc(s.id) + '">' +
      '<div class="ca-row-main"><div class="ca-row-label">' + esc(s.label) + help + " " + metaBadges(s) + '</div>' +
      '<div class="ca-row-desc">' + esc(s.description) + '</div>' +
      (reason ? '<div class="ca-row-reason">' + esc(reason) + "</div>" : "") + effective +
      '<div class="ca-row-src">' + esc(r.source) + "</div></div>" +
      '<div class="ca-row-control">' + controlHtml(s) + reset + "</div>" +
      '<div class="ca-row-state">' + stateBadge(s) + "</div>" +
      "</div>";
  }

  /* ---------- notice card ---------- */

  function noticeHtml(n) {
    var kindLabel = n.kind === "attention" ? "Needs attention" : n.kind === "setup" ? "Continue setup" : "Recommended";
    return '<div class="ca-notice" data-kind="' + esc(n.kind) + '" data-notice="' + esc(n.id) + '">' +
      '<span class="ca-notice-chip">' + kindLabel + "</span>" +
      '<div class="ca-notice-head">' + esc(n.headline) + "</div>" +
      '<div class="ca-notice-body">' + esc(n.consequence) + "</div>" +
      '<div class="ca-notice-actions"><button type="button" class="ca-btn" data-variant="primary" data-notice-act="' + esc(n.id) + '">' + esc(n.actionLabel) + "</button>" +
      '<button type="button" class="ca-btn" data-variant="quiet" data-notice-dismiss="' + esc(n.id) + '">' + esc(n.secondaryLabel || "Dismiss") + "</button></div></div>";
  }

  /* ---------- settings control binding (event delegation) ---------- */

  function bindSettings(root, handlers) {
    var onChange = handlers.onChange || function () {};
    var onReset = handlers.onReset || function (sid) { clearOverride(sid); };
    var onRun = handlers.onRun || function () {};

    root.addEventListener("click", function (ev) {
      var t = ev.target;
      var sw = t.closest && t.closest(".ca-switch[data-sid]");
      if (sw && !sw.disabled) { onChange(sw.getAttribute("data-sid"), sw.getAttribute("aria-checked") !== "true"); return; }
      var radio = t.closest && t.closest('.ca-seg [role="radio"]');
      if (radio && !radio.disabled) {
        var seg = radio.closest(".ca-seg[data-sid]");
        if (seg) onChange(seg.getAttribute("data-sid"), radio.getAttribute("data-value"));
        return;
      }
      var stepBtn = t.closest && t.closest(".ca-stepper button[data-step]");
      if (stepBtn && !stepBtn.disabled) {
        var wrap = stepBtn.closest(".ca-stepper[data-sid]");
        var input = wrap.querySelector("input");
        var next = (parseFloat(input.value) || 0) + parseFloat(stepBtn.getAttribute("data-step"));
        if (input.min !== "" && next < parseFloat(input.min)) next = parseFloat(input.min);
        if (input.max !== "" && next > parseFloat(input.max)) next = parseFloat(input.max);
        input.value = next;
        onChange(wrap.getAttribute("data-sid"), next);
        return;
      }
      var swatch = t.closest && t.closest(".ca-swatch[data-value]");
      if (swatch && swatch.getAttribute("aria-disabled") !== "true") {
        var group = swatch.closest("[data-sid]");
        if (group) onChange(group.getAttribute("data-sid"), swatch.getAttribute("data-value"));
        return;
      }
      var chip = t.closest && t.closest(".ca-chip[data-value]");
      if (chip && chip.getAttribute("aria-disabled") !== "true") {
        var cgroup = chip.closest("[data-sid]");
        if (cgroup) {
          var sid = cgroup.getAttribute("data-sid");
          var s = handlers.getSetting && handlers.getSetting(sid);
          var cur = s ? settingValue(s) : [];
          cur = Array.isArray(cur) ? cur.slice() : [];
          var val = chip.getAttribute("data-value");
          var i = cur.indexOf(val);
          if (i === -1) cur.push(val); else cur.splice(i, 1);
          onChange(sid, cur);
        }
        return;
      }
      var reset = t.closest && t.closest("[data-reset]");
      if (reset) { onReset(reset.getAttribute("data-reset")); return; }
      var run = t.closest && t.closest("[data-run]");
      if (run) { onRun(run.getAttribute("data-run")); return; }
    });

    root.addEventListener("change", function (ev) {
      var t = ev.target;
      if (t.matches && t.matches("select[data-sid]")) onChange(t.getAttribute("data-sid"), t.value);
      if (t.matches && t.matches(".ca-slider[data-sid]")) onChange(t.getAttribute("data-sid"), parseFloat(t.value));
      if (t.matches && t.matches(".ca-stepper input")) {
        var wrap = t.closest(".ca-stepper[data-sid]");
        if (wrap) onChange(wrap.getAttribute("data-sid"), parseFloat(t.value));
      }
    });

    root.addEventListener("input", function (ev) {
      var t = ev.target;
      if (t.matches && t.matches(".ca-slider[data-sid]")) {
        var out = t.parentNode.querySelector(".ca-slider-val");
        if (out) {
          var s = handlers.getSetting && handlers.getSetting(t.getAttribute("data-sid"));
          out.textContent = t.value + (s && s.unit ? " " + s.unit : "");
        }
      }
    });

    /* text inputs commit on blur or Enter; clearing restores the seeded token */
    function commitText(input) {
      var sid = input.getAttribute("data-sid");
      var s = handlers.getSetting && handlers.getSetting(sid);
      var raw = input.value.trim();
      if (raw === "") { clearOverride(sid); }
      else onChange(sid, raw);
    }
    root.addEventListener("focusout", function (ev) {
      if (ev.target.matches && ev.target.matches('.ca-text input[data-sid]')) commitText(ev.target);
    });
    root.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" && ev.target.matches && ev.target.matches('.ca-text input[data-sid]')) {
        ev.target.blur();
      }
    });
  }

  /* ---------- search wiring ---------- */

  var KIND_LABEL = { setting: "Setting", category: "Destination", subcategory: "Section", manager: "Manager", action: "Action" };

  function wireSearch(opts) {
    var input = opts.input, listEl = opts.listEl, index = opts.index;
    var onPick = opts.onPick || function () {};
    var results = [];
    var active = -1;

    function close() {
      results = []; active = -1;
      listEl.innerHTML = "";
      listEl.hidden = true;
      input.removeAttribute("aria-activedescendant");
      if (opts.onClose) opts.onClose();
    }

    function preferManagerIndex(i) {
      var r = results[i];
      if (!r) return i;
      if (r.kind === "manager") return i;
      if (r.target && r.target.manager && (r.kind === "setup" || r.kind === "status" || r.kind === "diagnostic" || r.kind === "unavailable")) return i;
      if (r.kind !== "category" && r.kind !== "subcategory") return i;
      var bestIdx = -1, bestScore = -1;
      for (var k = 0; k < Math.min(results.length, 8); k++) {
        var cand = results[k];
        if (!cand || cand.kind !== "manager" || !cand.target || !cand.target.manager) continue;
        /* Prefer manager over broad category/subcategory landings for the same intent. */
        if (cand.score > bestScore) { bestScore = cand.score; bestIdx = k; }
      }
      if (bestIdx !== -1 && bestScore >= (r.score * 0.7)) return bestIdx;
      return i;
    }

    function pick(i) {
      var idx = preferManagerIndex(i);
      var r = results[idx];
      if (!r) return;
      close();
      input.value = "";
      onPick(r);
    }

    function render() {
      if (!results.length) {
        listEl.innerHTML = '<div class="ca-hits-empty">No matches. Try a setting, manager, or action name.</div>';
        listEl.hidden = false;
        return;
      }
      var html = "";
      var lastGroup = null;
      results.forEach(function (r, i) {
        var group = r.kind === "setting" || r.kind === "subcategory" ? r.subtitle : (KIND_LABEL[r.kind] + "s");
        if (group !== lastGroup) {
          lastGroup = group;
          html += '<div class="ca-hits-group">' + esc(group) + "</div>";
        }
        var t = r.target || {};
        var attrs = ' data-target-kind="' + esc(r.kind) + '"';
        if (t.setting) attrs += ' data-setting-id="' + esc(t.setting) + '"';
        if (t.sub) attrs += ' data-sub-id="' + esc(t.sub) + '"';
        if (t.category) attrs += ' data-category-id="' + esc(t.category) + '"';
        if (t.manager) attrs += ' data-manager-id="' + esc(t.manager) + '"';
        html += '<button type="button" class="ca-hit" role="option" id="hit-' + i + '" data-hit="' + i + '"' + attrs + ' aria-selected="' + (i === active) + '">' +
          '<span class="ca-hit-kind">' + esc(KIND_LABEL[r.kind] || r.kind) + "</span>" +
          '<span class="ca-hit-title">' + PMSearch.highlight(r.title, r.ranges) + "</span>" +
          (r.kind === "setting" || r.kind === "subcategory" ? "" : '<span class="ca-hit-sub">' + esc(r.subtitle) + "</span>") +
          "</button>";
      });
      listEl.innerHTML = html;
      listEl.hidden = false;
    }

    function run() {
      var q = input.value.trim();
      if (!q) { close(); return; }
      results = PMSearch.query(index, q, { limit: 24 });
      active = results.length ? 0 : -1;
      render();
      if (opts.onOpen) opts.onOpen(q);
    }

    var deb = null;
    input.addEventListener("input", function () {
      window.clearTimeout(deb);
      deb = window.setTimeout(run, 80);
    });
    function flushQuery() {
      window.clearTimeout(deb);
      run();
    }

    input.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowDown") {
        flushQuery();
        if (!results.length) return;
        ev.preventDefault();
        active = (active + 1) % results.length;
        render();
        input.setAttribute("aria-activedescendant", "hit-" + active);
      } else if (ev.key === "ArrowUp") {
        flushQuery();
        if (!results.length) return;
        ev.preventDefault();
        active = (active - 1 + results.length) % results.length;
        render();
        input.setAttribute("aria-activedescendant", "hit-" + active);
      } else if (ev.key === "Enter") {
        ev.preventDefault();
        flushQuery();
        pick(active === -1 ? 0 : active);
      } else if (ev.key === "Escape") {
        ev.stopPropagation();
        window.clearTimeout(deb);
        close();
        input.blur();
      }
    });
    listEl.addEventListener("click", function (ev) {
      var hit = ev.target.closest && ev.target.closest("[data-hit]");
      if (hit) pick(parseInt(hit.getAttribute("data-hit"), 10));
    });
    listEl.addEventListener("mousemove", function (ev) {
      var hit = ev.target.closest && ev.target.closest("[data-hit]");
      if (hit) {
        var i = parseInt(hit.getAttribute("data-hit"), 10);
        if (i !== active) { active = i; render(); }
      }
    });
    return { close: close, rerun: run };
  }

  /* ---------- popup menu (context menus, overflow actions) ---------- */

  function popMenu(x, y, items, opts) {
    opts = opts || {};
    document.querySelectorAll(".ca-menu[data-pop]").forEach(function (m) { m.remove(); });
    var menu = document.createElement("div");
    menu.className = "ca-menu";
    menu.setAttribute("data-pop", "1");
    menu.setAttribute("role", "menu");
    menu.style.position = "fixed";
    menu.style.insetInlineStart = Math.max(8, x) + "px";
    menu.style.top = Math.max(8, y) + "px";
    menu.style.zIndex = "90";
    items.forEach(function (it) {
      if (it.sep) {
        var sep = document.createElement("div");
        sep.className = "ca-menu-sep";
        menu.appendChild(sep);
        return;
      }
      var b = document.createElement("button");
      b.type = "button";
      b.className = "ca-menu-item";
      b.setAttribute("role", "menuitem");
      b.textContent = it.label;
      if (it.disabled) b.setAttribute("aria-disabled", "true");
      b.addEventListener("click", function () {
        cleanup();
        if (!it.disabled && it.action) it.action();
      });
      menu.appendChild(b);
    });
    function cleanup() {
      menu.remove();
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("keydown", onKey, true);
      if (opts.onClose) opts.onClose();
    }
    function outside(ev) { if (!menu.contains(ev.target)) cleanup(); }
    function onKey(ev) { if (ev.key === "Escape") cleanup(); }
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("keydown", onKey, true);
    document.body.appendChild(menu);
    var first = menu.querySelector(".ca-menu-item:not([aria-disabled])");
    if (first) first.focus();
    return menu;
  }

  /* ---------- spellcheck demo (never auto-replaces) ---------- */

  var MISSPELLED = { "recieve": "receive", "seperate": "separate", "occured": "occurred" };

  function mountSpellcheck(el, storeOpts) {
    var data = window.PM_SETTINGS_DEMO.spellcheck;
    var ignored = PMStore.get("spell.ignored", []);
    var personal = PMStore.get("spell.personal", data.personalDictionary.slice());
    var project = PMStore.get("spell.project", data.projectDictionary.slice());

    function render() {
      var words = data.demoParagraph.split(/(\s+)/);
      var html = words.map(function (w) {
        var bare = w.replace(/[^a-zA-Z_]/g, "");
        var lower = bare.toLowerCase();
        if (Object.prototype.hasOwnProperty.call(MISSPELLED, lower) && ignored.indexOf(lower) === -1 && personal.indexOf(bare) === -1 && project.indexOf(bare) === -1) {
          return '<span class="ca-spell" tabindex="0" role="button" aria-haspopup="menu" aria-label="Possible misspelling: ' + esc(bare) + '. Open for suggestions." data-word="' + esc(bare) + '" data-fixed="' + esc(MISSPELLED[lower]) + '">' + esc(w) + "</span>";
        }
        return esc(w);
      }).join("");
      el.innerHTML =
        '<div class="ca-spell-demo" aria-label="Spellcheck demonstration">' +
        '<p class="ca-spell-text">' + html + "</p>" +
        '<p class="ca-spell-note">Suggestions appear on click or focus + Enter. Spellcheck never replaces text by itself; code tokens and paths are skipped.</p>' +
        '<div class="ca-spell-dicts"><span class="ca-badge" data-kind="scope">Personal dictionary: ' + esc(personal.join(", ")) + '</span> <span class="ca-badge" data-kind="scope">Project dictionary: ' + esc(project.join(", ")) + "</span></div>" +
        "</div>";
    }

    function openMenu(span) {
      var rect = span.getBoundingClientRect();
      var wrong = span.getAttribute("data-word");
      var fixed = span.getAttribute("data-fixed");
      popMenu(rect.left, rect.bottom + 6, [
        { label: 'Replace once with "' + fixed + '"', action: function () { span.textContent = fixed; span.classList.remove("ca-spell"); span.removeAttribute("tabindex"); PMStore.receipt("Replaced once — spellcheck never changes text on its own", "ok"); } },
        { label: "Ignore once", action: function () { span.classList.remove("ca-spell"); span.removeAttribute("tabindex"); } },
        { label: "Ignore for this draft", action: function () { ignored.push(wrong.toLowerCase()); PMStore.set("spell.ignored", ignored); render(); } },
        { sep: true },
        { label: "Add to personal dictionary", action: function () { personal.push(wrong); PMStore.set("spell.personal", personal); PMStore.receipt('Added "' + wrong + '" to your personal dictionary', "ok"); render(); } },
        { label: "Add to project dictionary", action: function () { project.push(wrong); PMStore.set("spell.project", project); PMStore.receipt('Added "' + wrong + '" to the project dictionary', "ok"); render(); } }
      ]);
    }

    el.addEventListener("click", function (ev) {
      var span = ev.target.closest && ev.target.closest(".ca-spell");
      if (span) openMenu(span);
    });
    el.addEventListener("keydown", function (ev) {
      var span = ev.target.closest && ev.target.closest(".ca-spell");
      if (span && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); openMenu(span); }
    });
    el.addEventListener("contextmenu", function (ev) {
      var span = ev.target.closest && ev.target.closest(".ca-spell");
      if (span) { ev.preventDefault(); openMenu(span); }
    });

    render();
    return { rerender: render };
  }

  /* ---------- provider helpers (store-backed) ---------- */

  function providers() { return PMStore.get("providers", []); }
  function providerById(pid) {
    var list = providers();
    for (var i = 0; i < list.length; i++) if (list[i].id === pid) return list[i];
    return null;
  }
  function saveProvider(p) {
    PMStore.set("providers", providers().map(function (x) { return x.id === p.id ? p : x; }));
  }

  function providerStatus(p) {
    if (p.installState === "not-installed") return { label: "Not installed", dot: "unknown" };
    if (p.installState === "installed-signed-out") return { label: "Installed — signed out", dot: "warn" };
    var worst = null;
    (p.accounts || []).forEach(function (a) {
      var h = HEALTH[a.health] || { label: a.health, dot: "unknown" };
      if (!worst || h.dot === "danger" || (h.dot === "warn" && worst.dot !== "danger")) worst = h;
    });
    if (worst) return worst;
    if (p.installState === "installed-signed-in") return { label: "Signed in", dot: "ok" };
    return { label: "Ready", dot: "ok" };
  }

  function activeAccount(p) {
    var act = null;
    (p.accounts || []).forEach(function (a) { if (a.active) act = a; });
    return act;
  }

  function healthDot(state, label) {
    return '<span class="ca-healthdot" data-state="' + esc(state) + '"><span class="ca-healthdot-dot" aria-hidden="true"></span><span>' + esc(label) + "</span></span>";
  }

  function capabilityChip(name, cap) {
    var tip = cap.evidence + (cap.freshAsOf ? " · as of " + cap.freshAsOf : "");
    return '<span class="ca-badge" data-kind="scope" data-tip="' + esc(tip) + '" tabindex="0">' + esc(name) + ": " + esc(human(CAP_STATE, cap.state)) + "</span>";
  }

  function modelRowHtml(p, m) {
    var unavailable = m.unavailableReason
      ? '<div class="ca-row-reason">' + esc(m.unavailableReason) + "</div>" : "";
    var rve = m.requestedVsEffective
      ? '<div class="ca-row-effective">Requested <b class="ca-eff">' + esc(m.requestedVsEffective.requested) + '</b> → Effective <b class="ca-eff">' + esc(m.requestedVsEffective.effective) + "</b> — " + esc(m.requestedVsEffective.reason) + "</div>" : "";
    var caps = '<span class="ca-model-caps">' +
      capabilityChip("Tools", m.capabilities.tools) +
      capabilityChip("Vision", m.capabilities.vision) +
      capabilityChip("Structured output", m.capabilities.structuredOutput) + "</span>";
    var effort = m.effort
      ? '<span class="ca-select"><select data-pv="effort" data-pid="' + esc(p.id) + '" data-mid="' + esc(m.id) + '" aria-label="Reasoning effort">' +
        m.effort.map(function (e) { return '<option value="' + esc(e) + '"' + (e === (m.effortSelected || m.effort[1] || m.effort[0]) ? " selected" : "") + ">Effort: " + esc(e[0].toUpperCase() + e.slice(1)) + "</option>"; }).join("") + "</select></span>"
      : '<span class="ca-badge" data-kind="scope">Effort: not offered</span>';
    var variant = m.fastMode && m.fastMode.supported
      ? '<span class="ca-seg" role="radiogroup" aria-label="Speed variant" data-pv-seg="variant" data-pid="' + esc(p.id) + '" data-mid="' + esc(m.id) + '">' +
        '<button type="button" role="radio" aria-checked="' + ((m.variant || "normal") === "normal") + '" data-value="normal">Normal</button>' +
        '<button type="button" role="radio" aria-checked="' + (m.variant === "fast") + '" data-value="fast" data-tip="' + esc(m.fastMode.evidence) + '">Fast</button></span>'
      : '<span class="ca-badge" data-kind="scope" data-tip="' + esc(m.fastMode ? m.fastMode.evidence : "") + '" tabindex="0">Single speed</span>';
    var setup = "";
    if (m.requiresSetup && p.setupSteps) {
      setup = '<details class="ca-accordion ca-setup"><summary>Setup required — Puppet Master walks you through it</summary><div class="ca-accordion-body"><ol class="ca-setup-steps">' +
        p.setupSteps.map(function (st) { return "<li>" + esc(st) + "</li>"; }).join("") +
        '</ol><button type="button" class="ca-btn" data-variant="primary" data-pv="setup" data-pid="' + esc(p.id) + '" data-mid="' + esc(m.id) + '">Start guided setup</button></div></details>';
    }
    if (m.rateNote) setup += '<div class="ca-row-reason">' + esc(m.rateNote) + "</div>";
    return '<div class="ca-row ca-model' + (m.hidden ? " is-hidden" : "") + '" data-state="' + (m.unavailableReason ? "unavailable" : "custom") + '">' +
      '<div class="ca-row-main"><div class="ca-row-label">' +
      '<button type="button" class="ca-iconbtn' + (m.favorite ? " is-on" : "") + '" data-pv="fav" data-pid="' + esc(p.id) + '" data-mid="' + esc(m.id) + '" aria-pressed="' + !!m.favorite + '" aria-label="Favorite ' + esc(m.name) + '">' + icon("star") + "</button>" +
      esc(m.name) +
      ' <button type="button" class="ca-alias" data-pv="alias" data-pid="' + esc(p.id) + '" data-mid="' + esc(m.id) + '" data-tip="Rename the alias" aria-label="Edit alias">' + esc(m.alias ? "“" + m.alias + "”" : "Add alias") + "</button>" +
      ' <span class="ca-badge" data-kind="scope">Context ' + (m.contextLimit >= 1000 ? Math.round(m.contextLimit / 1000) + "k" : m.contextLimit) + "</span>" +
      (m.hidden ? ' <span class="ca-badge" data-kind="exposure" data-icon data-exposure="unavailable">Hidden</span>' : "") +
      '</div>' + unavailable + rve +
      '<div class="ca-row-desc">' + caps + "</div>" + setup + "</div>" +
      '<div class="ca-row-control">' + effort + variant +
      '<span class="ca-stepper" data-pv-step="priority" data-pid="' + esc(p.id) + '" data-mid="' + esc(m.id) + '"><button type="button" data-step="-1" aria-label="Lower priority">−</button><input type="number" value="' + m.priority + '" aria-label="Priority" readonly><button type="button" data-step="1" aria-label="Raise priority">+</button></span>' +
      '<button type="button" class="ca-iconbtn" data-pv="hide" data-pid="' + esc(p.id) + '" data-mid="' + esc(m.id) + '" aria-pressed="' + !!m.hidden + '" aria-label="' + (m.hidden ? "Show " : "Hide ") + esc(m.name) + '">' + icon(m.hidden ? "eyeoff" : "eye") + "</button>" +
      "</div></div>";
  }

  function installationsHtml(p) {
    var list = p.installations || [];
    if (!list.length) {
      if (p.installAction) {
        return '<div class="ca-panel"><h3 class="ca-panel-h">Installation</h3>' +
          '<p class="ca-row-desc">' + esc(p.installAction.label || "Install from official source") + "</p>" +
          '<button type="button" class="ca-btn" data-variant="primary" data-pv="install" data-pid="' + esc(p.id) + '">' +
          esc(p.installAction.label || "Install") + "</button></div>";
      }
      return "";
    }
    var update = "";
    if (p.updatePolicy) {
      update = '<div class="ca-row-desc">Update policy: ' + esc((p.updatePolicy.mode || "").replace(/^ask-first$/i, "Ask first").replace(/^scheduled-idle$/i, "Scheduled when idle")) +
        (p.updatePolicy.availableVersion ? (" · available " + esc(p.updatePolicy.availableVersion)) : "") +
        (p.updatePolicy.note ? (" — " + esc(p.updatePolicy.note)) : "") +
        (p.updatePolicy.lastResult ? (" · " + esc(p.updatePolicy.lastResult)) : "") + "</div>";
    }
    return '<div class="ca-panel"><h3 class="ca-panel-h">Host / environment installations</h3>' + update +
      list.map(function (inst) {
        var badge = inst.selected ? "auto" : (inst.shadowed ? "inherited" : (inst.manualOnly ? "not-configured" : "default"));
        var label = inst.selected ? "Selected" : (inst.shadowed ? "Shadowed" : (inst.manualOnly ? "Manual only" : (inst.health || "Present")));
        var selectBtn = "";
        if (!inst.manualOnly && !inst.selected && inst.health !== "not-installed") {
          selectBtn = '<button type="button" class="ca-btn" data-variant="quiet" data-pv="select-install" data-pid="' + esc(p.id) + '" data-iid="' + esc(inst.id) + '">Select for future requests</button>';
        }
        return '<div class="ca-row" data-state="' + (inst.manualOnly ? "not-configured" : inst.selected ? "custom" : "default") + '">' +
          '<div class="ca-row-main"><div class="ca-row-label">' + esc(inst.label) +
          ' <span class="ca-badge" data-kind="state" data-state="' + badge + '">' + esc(label) + "</span></div>" +
          '<div class="ca-row-desc">' + esc(inst.path || "No path") + " · v" + esc(inst.version || "?") +
          " · Owner " + esc(inst.owner || "Unknown") + " · Confidence " + esc(inst.confidence || "—") + "</div>" +
          (inst.note ? '<div class="ca-row-reason">' + esc(inst.note) + "</div>" : "") +
          '</div><div class="ca-row-control">' + selectBtn +
          (inst.health === "verify-failed-rolled-back" ? '<span class="ca-badge" data-kind="state" data-state="unavailable">Verify failed · rolled back</span>' : "") +
          "</div></div>";
      }).join("") +
      (p.installAction ? '<button type="button" class="ca-btn" data-pv="install" data-pid="' + esc(p.id) + '">' + esc(p.installAction.label || "Install") + "</button>" : "") +
      '<p class="ca-faint">Selecting an installation affects future requests only. Shadowed installs stay on disk.</p></div>';
  }

  function accountRowHtml(p, a) {
    var h = HEALTH[a.health] || { label: a.health, dot: "unknown" };
    var activate = (!a.active && a.enabled)
      ? '<button type="button" class="ca-btn" data-variant="quiet" data-pv="activate" data-pid="' + esc(p.id) + '" data-aid="' + esc(a.id) + '">Use for future work</button>' : "";
    var signin = "";
    if (p.installState === "installed-signed-out") {
      signin = '<button type="button" class="ca-btn" data-variant="primary" data-pv="signin" data-pid="' + esc(p.id) + '">Sign in through the provider’s own flow</button>';
    }
    return '<div class="ca-row" data-state="' + (a.health === "auth-ok-invocation-failed" ? "unavailable" : a.enabled ? "default" : "not-configured") + '">' +
      '<div class="ca-row-main"><div class="ca-row-label">' + esc(a.label) +
      (a.active ? ' <span class="ca-badge" data-kind="state" data-icon data-state="auto">Active for new requests</span>' : "") +
      ' <span class="ca-badge" data-kind="scope">Priority ' + a.priority + "</span>" +
      (a.sticky ? ' <span class="ca-badge" data-kind="scope">Sticky sessions</span>' : "") + "</div>" +
      '<div class="ca-row-desc">' + esc(a.identity) + " · Last catalog " + esc(a.lastCatalogRefresh) + " · Last successful generation " + esc(a.lastSuccessfulGeneration) + "</div>" +
      '<div class="ca-row-desc">' + healthDot(h.dot, h.label) + ' <span class="ca-badge" data-kind="scope">Usage pressure: ' + esc(a.usagePressure) + '</span> <span class="ca-badge" data-kind="scope">Resets: ' + esc(a.resetAt) + "</span></div>" +
      (p.lastError && a.health === "auth-ok-invocation-failed" ? '<div class="ca-row-reason">' + esc(p.lastError) + "</div>" : "") +
      "</div>" +
      '<div class="ca-row-control">' +
      '<button type="button" class="ca-switch" role="switch" aria-checked="' + !!a.enabled + '" data-pv="enabled" data-pid="' + esc(p.id) + '" data-aid="' + esc(a.id) + '" aria-label="Enable ' + esc(a.label) + '"></button>' +
      activate +
      '<button type="button" class="ca-btn" data-variant="quiet" data-pv="reconnect" data-pid="' + esc(p.id) + '" data-aid="' + esc(a.id) + '">Reconnect</button>' +
      (a.health === "auth-ok-invocation-failed" ? '<button type="button" class="ca-btn" data-variant="quiet" data-pv="repair" data-pid="' + esc(p.id) + '" data-aid="' + esc(a.id) + '">Run a readiness check</button>' : "") +
      signin +
      "</div></div>";
  }

  function usageHtml(p) {
    var u = p.usageSnapshot;
    if (!u) return '<div class="ca-empty"><div class="ca-empty-title">No usage reporting on this route</div><div class="ca-empty-guidance">This connection does not report balances. Usage detail still lives in the Usage area when a route reports it.</div></div>';
    var whatNext = "";
    if (u.whatNext) {
      whatNext = '<div class="ca-row" data-state="custom"><div class="ca-row-main"><div class="ca-row-label">When included usage runs out</div>' +
        '<div class="ca-row-desc">A provider-specific choice — not a global budget switch.</div></div>' +
        '<div class="ca-row-control"><span class="ca-select"><select data-pv="whatnext" data-pid="' + esc(p.id) + '" aria-label="When included usage runs out">' +
        u.whatNext.options.map(function (o) { return '<option value="' + esc(o) + '"' + (o === u.whatNext.selected ? " selected" : "") + ">" + esc(human(WHATNEXT, o)) + "</option>"; }).join("") +
        "</select></span></div></div>";
    }
    return '<dl class="ca-kv">' +
      '<dt>Included usage remaining</dt><dd>' + esc(u.includedRemaining) + "</dd>" +
      "<dt>Extra balance</dt><dd>" + esc(u.extraBalance) + "</dd>" +
      "<dt>Next reset</dt><dd>" + esc(u.resetsAt) + "</dd>" +
      "<dt>Pressure</dt><dd>" + esc(u.pressure) + "</dd>" +
      "<dt>Last successful use</dt><dd>" + esc(u.lastSuccessfulUse) + "</dd>" +
      "<dt>Projection</dt><dd>" + esc(u.projection) + "</dd>" +
      "<dt>Source freshness</dt><dd>" + esc(u.sourceFreshness) + "</dd>" +
      "</dl>" + whatNext +
      '<p class="ca-faint">Read-only snapshot. <button type="button" class="ca-btn" data-variant="quiet" data-pv="open-usage" data-pid="' + esc(p.id) + '">Open Usage for detail</button> — Usage owns balances, history, and projections; this panel never recalculates them.</p>';
  }

  function catalogHtml(p) {
    var c = p.catalog;
    var stateLine = c.refreshing
      ? '<span class="ca-badge" data-kind="state" data-icon data-state="auto">Refreshing — showing the last known good catalog</span>'
      : c.lastKnownGood
        ? '<span class="ca-badge" data-kind="state" data-icon data-state="default">Last known good catalog</span>'
        : '<span class="ca-badge" data-kind="state" data-icon data-state="not-configured">No catalog yet</span>';
    return '<div class="ca-catalog">' +
      '<div class="ca-row-desc">Source ' + esc(c.source) + " · Version " + esc(c.version) + " · Last checked " + esc(c.lastChecked) + " · Last successfully activated " + esc(c.lastActivated) + " " + stateLine + "</div>" +
      '<button type="button" class="ca-btn" data-pv="refresh" data-pid="' + esc(p.id) + '"' + (c.refreshing ? " disabled" : "") + ">" + (c.refreshing ? "Refreshing…" : "Refresh catalog") + "</button>" +
      '<p class="ca-faint">A fresh catalog does not prove account entitlement or that a call will succeed — those are checked separately.</p></div>';
  }

  function diagnosticsHtml(p) {
    return '<div class="ca-logs" aria-label="Diagnostics log">' +
      (p.diagnostics || []).map(function (l) { return '<div class="ca-log-line">' + esc(l) + "</div>"; }).join("") + "</div>";
  }

  function routingHtml(p) {
    var r = p.routing || { priority: 1, useNextOnExhaust: false, continuation: "Ask before switching" };
    var continuations = ["Ask before switching", "Switch automatically", "Stop and ask"];
    return '<div class="ca-row"><div class="ca-row-main"><div class="ca-row-label">Failover priority</div>' +
      '<div class="ca-row-desc">Lower numbers are tried first when more than one route can serve a request.</div></div>' +
      '<div class="ca-row-control"><span class="ca-stepper" data-pv-step="route-priority" data-pid="' + esc(p.id) + '">' +
      '<button type="button" data-step="-1" aria-label="Higher priority">−</button><input type="number" value="' + r.priority + '" aria-label="Failover priority" readonly>' +
      '<button type="button" data-step="1" aria-label="Lower priority">+</button></span></div></div>' +
      '<div class="ca-row"><div class="ca-row-main"><div class="ca-row-label">Use the next route when this one runs out</div>' +
      '<div class="ca-row-desc">When this provider is exhausted or unavailable, try the next eligible route instead of stopping.</div></div>' +
      '<div class="ca-row-control"><button type="button" class="ca-switch" role="switch" aria-checked="' + !!r.useNextOnExhaust + '" data-pv="route-usenext" data-pid="' + esc(p.id) + '" aria-label="Use next route on exhaustion"></button></div></div>' +
      '<div class="ca-row"><div class="ca-row-main"><div class="ca-row-label">Switching mid-conversation</div>' +
      '<div class="ca-row-desc">What to do when a switch would change the route of an ongoing conversation.</div></div>' +
      '<div class="ca-row-control"><span class="ca-select"><select data-pv="route-continuation" data-pid="' + esc(p.id) + '" aria-label="Switching mid-conversation">' +
      continuations.map(function (c) { return '<option value="' + esc(c) + '"' + (c === r.continuation ? " selected" : "") + ">" + esc(c) + "</option>"; }).join("") +
      "</select></span></div></div>";
  }

  /* One delegation binder for every provider control (data-pv / data-pv-seg). */
  function bindProviders(root, rerender) {
    function modelOf(pid, mid) {
      var p = providerById(pid);
      if (!p) return [null, null];
      for (var i = 0; i < p.models.length; i++) if (p.models[i].id === mid) return [p, p.models[i]];
      return [p, null];
    }

    root.addEventListener("click", function (ev) {
      var t = ev.target;
      var btn = t.closest && t.closest("[data-pv]");
      var stepBtn = t.closest && t.closest("[data-pv-step] button[data-step]");
      var segBtn = t.closest && t.closest("[data-pv-seg] [data-value]");
      if (segBtn) {
        var seg = segBtn.closest("[data-pv-seg]");
        var pm1 = modelOf(seg.getAttribute("data-pid"), seg.getAttribute("data-mid"));
        if (pm1[1]) { pm1[1].variant = segBtn.getAttribute("data-value"); saveProvider(pm1[0]); rerender(); }
        return;
      }
      if (stepBtn) {
        var wrap = stepBtn.closest("[data-pv-step]");
        if (wrap.getAttribute("data-pv-step") === "route-priority") {
          var pr = providerById(wrap.getAttribute("data-pid"));
          if (pr) {
            pr.routing.priority = Math.max(1, (pr.routing.priority || 1) + parseInt(stepBtn.getAttribute("data-step"), 10));
            saveProvider(pr); rerender();
          }
          return;
        }
        var pm2 = modelOf(wrap.getAttribute("data-pid"), wrap.getAttribute("data-mid"));
        if (pm2[1]) {
          pm2[1].priority = Math.max(1, (pm2[1].priority || 1) + parseInt(stepBtn.getAttribute("data-step"), 10));
          saveProvider(pm2[0]); rerender();
        }
        return;
      }
      if (!btn) return;
      var action = btn.getAttribute("data-pv");
      var pid = btn.getAttribute("data-pid");
      var p = providerById(pid);
      if (!p) return;
      var mid = btn.getAttribute("data-mid");
      var aid = btn.getAttribute("data-aid");
      switch (action) {
        case "fav": {
          var pmf = modelOf(pid, mid);
          if (pmf[1]) { pmf[1].favorite = !pmf[1].favorite; saveProvider(p); rerender(); }
          break;
        }
        case "hide": {
          var pmh = modelOf(pid, mid);
          if (pmh[1]) {
            pmh[1].hidden = !pmh[1].hidden;
            saveProvider(p);
            PMStore.receipt(pmh[1].hidden ? "Model hidden from pickers (still listed here)" : "Model visible again", "info");
            rerender();
          }
          break;
        }
        case "alias": {
          var pma = modelOf(pid, mid);
          if (!pma[1]) break;
          var input = document.createElement("input");
          input.type = "text";
          input.value = pma[1].alias || "";
          input.placeholder = "Alias";
          input.className = "ca-alias-edit";
          btn.replaceWith(input);
          input.focus();
          input.select();
          var commit = function () {
            pma[1].alias = input.value.trim() || null;
            saveProvider(pma[0]);
            rerender();
          };
          input.addEventListener("blur", commit);
          input.addEventListener("keydown", function (e2) {
            if (e2.key === "Enter") input.blur();
            if (e2.key === "Escape") { input.removeEventListener("blur", commit); rerender(); }
          });
          break;
        }
        case "enabled": {
          (p.accounts || []).forEach(function (a) { if (a.id === aid) a.enabled = btn.getAttribute("aria-checked") !== "true"; });
          saveProvider(p); rerender();
          break;
        }
        case "activate": {
          (p.accounts || []).forEach(function (a) { a.active = a.id === aid; });
          saveProvider(p);
          PMStore.receipt((p.accountSwitchNote || "Switching accounts affects future requests only."), "ok");
          rerender();
          break;
        }
        case "reconnect":
          PMStore.receipt("Reconnect simulated — no real sign-in flow was launched", "info");
          break;
        case "repair":
          PMStore.receipt("Readiness check simulated — the demo keeps the invocation-failed state so you can inspect it", "warn");
          break;
        case "signin":
          PMStore.receipt("Sign-in simulated — Puppet Master would launch the provider's own login inside an isolated profile; it never sees credentials", "info");
          break;
        case "select-install": {
          var iid = btn.getAttribute("data-iid");
          (p.installations || []).forEach(function (inst) {
            inst.selected = inst.id === iid;
            inst.shadowed = inst.id !== iid;
          });
          saveProvider(p);
          PMStore.receipt("Installation selected for future requests (simulated) — shadowed copies remain on disk", "ok");
          rerender();
          break;
        }
        case "install":
          PMStore.receipt((p.installAction && p.installAction.receipt) || "Install simulated — nothing was downloaded or changed", "info");
          break;
        case "setup":
          PMStore.receipt("Guided setup simulated — it would open the underlying provider connection, then return to this model row", "info");
          break;
        case "refresh": {
          if (p.catalog.refreshing) break;
          p.catalog.refreshing = true;
          saveProvider(p);
          if (window.CAMotion) {
            try { CAMotion.captureOrigin((typeof ev !== "undefined" && ev && ev.target) || null, "provider-refresh"); } catch (err) {}
            CAMotion.afterRender(root, "provider-refresh");
            CAMotion.pulse(root, "catalog", 720);
          }
          try { root.setAttribute("data-ca-provider", "refreshing"); } catch (err2) {}
          rerender();
          window.setTimeout(function () {
            var again = providerById(pid);
            again.catalog.refreshing = false;
            try { root.removeAttribute("data-ca-provider"); } catch (err3) {}
            again.catalog.lastChecked = "just now";
            saveProvider(again);
            PMStore.receipt("Catalog refresh simulated — the last-known-good list stayed visible the whole time", "ok");
            rerender();
          }, 1400);
          break;
        }
        case "open-usage":
          PMStore.receipt("Deep link simulated — Usage owns measured balances, history, and forecasts", "info");
          break;
        case "route-usenext":
          p.routing.useNextOnExhaust = btn.getAttribute("aria-checked") !== "true";
          saveProvider(p);
          rerender();
          break;
      }
    });

    root.addEventListener("change", function (ev) {
      var t = ev.target;
      if (!t.matches || !t.matches("select[data-pv]")) return;
      var p = providerById(t.getAttribute("data-pid"));
      if (!p) return;
      var action = t.getAttribute("data-pv");
      if (action === "route-continuation") {
        p.routing.continuation = t.value;
        saveProvider(p);
        rerender();
      }
      if (action === "whatnext" && p.usageSnapshot && p.usageSnapshot.whatNext) {
        p.usageSnapshot.whatNext.selected = t.value;
        saveProvider(p);
        PMStore.receipt("Continuation choice saved for " + p.name + " (simulated)", "ok");
        rerender();
      }
      if (action === "effort") {
        var pm = modelOf(t.getAttribute("data-pid"), t.getAttribute("data-mid"));
        if (pm[1]) { pm[1].effortSelected = t.value; saveProvider(pm[0]); rerender(); }
      }
    });
  }

  /* ---------- exports ---------- */

  window.CAViews = {
    esc: esc, clone: clone, icon: icon,
    STATE_LABEL: STATE_LABEL, EXPOSURE_LABEL: EXPOSURE_LABEL, SCOPE_LABEL: SCOPE_LABEL,
    HEALTH: HEALTH, INSTALL_STATE: INSTALL_STATE, AUTH_MODEL: AUTH_MODEL,
    GROUP_LABEL: GROUP_LABEL, CAP_STATE: CAP_STATE, WHATNEXT: WHATNEXT,
    human: human,
    overrides: overrides, getOverride: getOverride, setOverride: setOverride, clearOverride: clearOverride,
    settingValue: settingValue, resolveState: resolveState, fmtValue: fmtValue,
    stateBadge: stateBadge, metaBadges: metaBadges, controlHtml: controlHtml, rowHtml: rowHtml, noticeHtml: noticeHtml,
    bindSettings: bindSettings, wireSearch: wireSearch, popMenu: popMenu, mountSpellcheck: mountSpellcheck,
    providers: providers, providerById: providerById, saveProvider: saveProvider,
    providerStatus: providerStatus, activeAccount: activeAccount, healthDot: healthDot,
    modelRowHtml: modelRowHtml, installationsHtml: installationsHtml, accountRowHtml: accountRowHtml,
    usageHtml: usageHtml, catalogHtml: catalogHtml, diagnosticsHtml: diagnosticsHtml,
    routingHtml: routingHtml,
    bindProviders: bindProviders, capabilityChip: capabilityChip
  };
})();
