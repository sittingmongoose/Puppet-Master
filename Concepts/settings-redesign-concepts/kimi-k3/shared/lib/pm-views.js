/* ============================================================================
   pm-views.js — shared view layer for the four Settings concepts
   ----------------------------------------------------------------------------
   Render helpers + behavior shared by every concept page (the shared
   vocabulary); each concept composes these into its own information
   architecture. Depends on: pm-components.css, pm-store.js (PMStore),
   pm-search.js (PMSearch).

   Settings values: demo settings stay immutable; user edits live in the
   store as an `overrides` map keyed by the FULL setting id (dotted ids are
   never used as store paths — use PMViews.setOverride/getOverride).

   Provider data: concepts seed `providers` (deep copy of
   PM_CORE_DATA.providers) into the store; the provider helpers here
   read and mutate that store array so all four concepts behave identically.

   kimi-k3 extensions: noticeCompactHtml (title-bar inbox rows, same
   data-notice-act / data-notice-dismiss contract as noticeHtml) and
   wireDrawer (scrim + drawer wiring shared by every Demo scenarios drawer).
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
    dots: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>',
    compass: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5 13 13l-4.5 2.5L11 11z"/></svg>',
    bell: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
    users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.5a3 3 0 0 1 0 5.5M17.5 15a5.5 5.5 0 0 1 3 5"/></svg>',
    download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10m0 0 4-4m-4 4-4-4"/><path d="M5 19h14"/></svg>'
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
    "pm-transformed": "Via PM transformation", "other-route": "Via another route"
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

  /* ---------- agent role assignments (packet §2 role list) ---------- */

  function roleCandidates(guarded) {
    var out = [];
    providers().forEach(function (p) {
      var acct = activeAccount(p);
      var acctLabel = acct ? acct.label : null;
      (p.models || []).forEach(function (m) {
        if (m.unavailableReason || m.requiresSetup || m.hidden) return;
        /* reasoning-capable models stand in for the high-quality set in this demo */
        if (guarded && !m.effort) return;
        out.push(m.name + " · " + p.name + (acctLabel ? " · " + acctLabel : ""));
      });
    });
    return out;
  }

  function roleLabel(r) {
    if (r.routeLabel) return r.routeLabel;
    if (r.route) return r.route.model + " · " + r.route.provider + (r.route.account ? " · " + r.route.account : "");
    return null;
  }

  function rolesHtml(roles) {
    return (roles || []).map(function (r) {
      var cur = roleLabel(r);
      var cands = roleCandidates(!!r.qualityGuarded);
      if (cur && cands.indexOf(cur) === -1) cands.unshift(cur);
      var opts = ['<option value="">Not configured</option>'].concat(cands.map(function (c) {
        return '<option value="' + esc(c) + '"' + (c === cur ? " selected" : "") + ">" + esc(c) + "</option>";
      })).join("");
      var ready = !!cur;
      return '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label">' + esc(r.label) +
        (r.qualityGuarded ? ' <span class="pm-badge" data-kind="exposure" data-icon data-exposure="managed" data-tip="User-facing planning and discussion never silently downgrade to a cheaper route" tabindex="0">Quality-guarded</span>' : "") +
        '</div><div class="pm-row-desc">' + esc(r.note) + "</div></div>" +
        '<div class="pm-row-control"><span class="pm-select"><select data-role="' + esc(r.id) + '" aria-label="Route for ' + esc(r.label) + '">' + opts + "</select></span></div>" +
        '<div class="pm-row-state"><span class="pm-badge" data-kind="state" data-icon data-state="' + (ready ? "auto" : "not-configured") + '">' + (ready ? "Ready" : "Not configured") + "</span></div></div>";
    }).join("");
  }

  function bindRoles(root) {
    root.addEventListener("change", function (ev) {
      var t = ev.target;
      if (!t.matches || !t.matches("select[data-role]")) return;
      var roles = PMStore.get("roles", []).slice();
      roles.forEach(function (r) {
        if (r.id === t.getAttribute("data-role")) {
          r.routeLabel = t.value || null;
          r.status = t.value ? "Ready" : "Not configured";
        }
      });
      PMStore.set("roles", roles);
      PMStore.receipt(t.value
        ? "Role route updated — applies to future work; user-facing planning stays on quality-guarded routes"
        : "Role route cleared — the role is not configured until a route is chosen", "ok");
    });
  }

  /* ---------- store-backed overrides (full-id keys, never dot paths) ---------- */

  function overrides() { return PMStore.get("overrides", {}); }
  function getOverride(id) { var o = overrides(); return Object.prototype.hasOwnProperty.call(o, id) ? o[id] : undefined; }
  function setOverride(id, value) { var o = overrides(); o[id] = value; PMStore.set("overrides", o); }
  function clearOverride(id) { var o = overrides(); delete o[id]; PMStore.set("overrides", o); }

  /* Validation errors keyed like overrides (kimi-k3): concepts validate in
     their onChange handler and setError; rowHtml renders the slot. */
  function errorsMap() { return PMStore.get("errors", {}); }
  function getError(id) { return errorsMap()[id]; }
  function setError(id, message) { var m = errorsMap(); if (message) { if (m[id] === message) return; m[id] = message; } else { if (!Object.prototype.hasOwnProperty.call(m, id)) return; delete m[id]; } PMStore.set("errors", m); }

  /* "Changed elsewhere" conflict flags, same keying. */
  function changedMap() { return PMStore.get("changedElsewhere", {}); }
  function getChanged(id) { return changedMap()[id]; }
  function setChanged(id, note) { var m = changedMap(); if (note) { if (m[id] === note) return; m[id] = note; } else { if (!Object.prototype.hasOwnProperty.call(m, id)) return; delete m[id]; } PMStore.set("changedElsewhere", m); }

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
    return '<span class="pm-badge" data-kind="state" data-icon data-state="' + esc(r.state) + '">' + esc(human(STATE_LABEL, r.state)) + "</span>";
  }

  function metaBadges(s) {
    var out = "";
    (s.scope || []).forEach(function (sc) {
      out += '<span class="pm-badge" data-kind="scope">' + esc(human(SCOPE_LABEL, sc)) + "</span>";
    });
    if (s.exposure && s.exposure !== "standard") {
      out += '<span class="pm-badge" data-kind="exposure" data-icon data-exposure="' + esc(s.exposure) + '">' + esc(human(EXPOSURE_LABEL, s.exposure)) + "</span>";
    }
    if (s.restartRequired) out += '<span class="pm-badge" data-kind="restart" data-icon>Needs restart</span>';
    if (s.reconnectRequired) out += '<span class="pm-badge" data-kind="restart" data-icon>Needs reconnect</span>';
    if (s.effect) out += '<span class="pm-badge" data-kind="effect" data-icon data-effect="' + esc(s.effect.kind) + '" data-tip="' + esc(s.effect.note) + '">' + esc(human({ cost: "Cost", privacy: "Privacy", safety: "Safety", performance: "Performance" }, s.effect.kind)) + "</span>";
    return out;
  }

  /* ---------- controls (markup follows pm-components.css contracts) ---------- */

  function controlHtml(s) {
    var v = settingValue(s);
    var disabled = s.state === "managed" || s.state === "unavailable" ? " disabled" : "";
    var disAttr = s.state === "managed" || s.state === "unavailable" ? ' aria-disabled="true"' : "";
    switch (s.type) {
      case "toggle":
        return '<button type="button" class="pm-switch" role="switch" aria-checked="' + (v === true) + '" data-sid="' + esc(s.id) + '" aria-label="' + esc(s.label) + '"' + disabled + "></button>";
      case "select":
        return '<span class="pm-select"><select data-sid="' + esc(s.id) + '" aria-label="' + esc(s.label) + '"' + disabled + ">" +
          (s.options || []).map(function (o) {
            return '<option value="' + esc(o.value) + '"' + (o.value === v ? " selected" : "") + ">" + esc(o.label) + "</option>";
          }).join("") + "</select></span>";
      case "segmented":
        return '<div class="pm-seg" role="radiogroup" aria-label="' + esc(s.label) + '" data-sid="' + esc(s.id) + '">' +
          (s.options || []).map(function (o) {
            return '<button type="button" role="radio" aria-checked="' + (o.value === v) + '" data-value="' + esc(o.value) + '"' + disabled + ">" + esc(o.label) + "</button>";
          }).join("") + "</div>";
      case "slider":
        return '<span class="pm-sliderwrap"><input type="range" class="pm-slider" data-sid="' + esc(s.id) + '" min="' + (s.min || 0) + '" max="' + (s.max || 100) + '" step="' + (s.step || 1) + '" value="' + esc(v) + '" aria-label="' + esc(s.label) + '"' + disabled + '><output class="pm-slider-val">' + esc(v) + (s.unit ? " " + esc(s.unit) : "") + "</output></span>";
      case "number":
        return '<span class="pm-stepper" data-sid="' + esc(s.id) + '"><button type="button" data-step="-1" aria-label="Decrease"' + disabled + '>−</button><input type="number" value="' + esc(v) + '" min="' + (s.min || 0) + '" max="' + (s.max == null ? 999 : s.max) + '" aria-label="' + esc(s.label) + '"' + disabled + '><button type="button" data-step="1" aria-label="Increase"' + disabled + '>+</button></span>';
      case "text":
      case "path": {
        var isToken = v === "auto" || v === "inherit" || v === "not-configured";
        var hint = isToken ? ' data-empty-hint="' + esc(v) + '"' : "";
        return '<span class="pm-text"' + hint + '><input type="text" data-sid="' + esc(s.id) + '" value="' + (isToken ? "" : esc(v)) + '" placeholder="' + esc(s.placeholder || "Enter a value") + '" aria-label="' + esc(s.label) + '"' + disabled + "></span>";
      }
      case "color":
        return '<span class="pm-swatches" data-sid="' + esc(s.id) + '" role="group" aria-label="' + esc(s.label) + '">' +
          (s.options || []).map(function (o) {
            return '<button type="button" class="pm-swatch" style="--swatch:' + esc(o.value) + '" data-value="' + esc(o.value) + '" aria-pressed="' + (o.value === v) + '" aria-label="' + esc(o.label) + '"' + disAttr + "></button>";
          }).join("") + "</span>";
      case "action":
        return '<button type="button" class="pm-btn" data-run="' + esc(s.id) + '">' + esc(s.actionLabel || "Run") + "</button>";
      case "multiselect":
        return '<span class="pm-swatches" data-sid="' + esc(s.id) + '" role="group" aria-label="' + esc(s.label) + '">' +
          (s.options || []).map(function (o) {
            var on = Array.isArray(v) && v.indexOf(o.value) !== -1;
            return '<button type="button" class="pm-chip" data-value="' + esc(o.value) + '" aria-pressed="' + on + '"' + disAttr + ">" + esc(o.label) + "</button>";
          }).join("") + "</span>";
      default:
        return '<span class="pm-muted">' + esc(fmtValue(s, v)) + "</span>";
    }
  }

  /* ---------- settings row (follows the .pm-row DOM contract) ---------- */

  function rowHtml(s, opts) {
    opts = opts || {};
    var r = resolveState(s);
    var reason = "";
    if (r.state === "managed" && s.managedReason) reason = s.managedReason;
    if (r.state === "unavailable" && s.unavailableReason) reason = s.unavailableReason;
    var effective = "";
    if (r.state === "effective-differs" && s.effectiveValue !== undefined) {
      effective = '<div class="pm-row-effective">Requested <b class="pm-eff">' + esc(fmtValue(s, settingValue(s))) + '</b> → Effective <b class="pm-eff">' + esc(fmtValue(s, s.effectiveValue)) + "</b>" + (s.effectiveReason ? " — " + esc(s.effectiveReason) : "") + "</div>";
    }
    var changed = getOverride(s.id) !== undefined;
    var reset = changed && !eq(settingValue(s), s.defaultValue)
      ? '<button type="button" class="pm-btn" data-variant="quiet" data-reset="' + esc(s.id) + '">Reset</button>' : "";
    var help = s.help ? ' <span class="pm-ic pm-help" style="--pm-ic:var(--pm-ic-info)" tabindex="0" data-tip="' + esc(s.help) + '" aria-label="More about this setting"></span>' : "";
    var errMsg = getError(s.id) || s.error;
    var errSlot = errMsg ? '<div class="pm-row-error" role="alert">' + esc(errMsg) + "</div>" : "";
    var conflict = getChanged(s.id)
      ? '<div class="pm-row-conflict"><span>Changed elsewhere — ' + esc(getChanged(s.id)) + "</span>" +
        '<button type="button" class="pm-btn" data-variant="quiet" data-conflict="reload" data-sid="' + esc(s.id) + '">Reload</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-conflict="keep" data-sid="' + esc(s.id) + '">Keep mine</button></div>'
      : "";
    return '<div class="pm-row" id="row-' + esc(s.id) + '" data-state="' + esc(r.state) + '" data-exposure="' + esc(s.exposure || "standard") + '"' + (s.risky ? " data-risky" : "") + ' data-setting="' + esc(s.id) + '">' +
      '<div class="pm-row-main"><div class="pm-row-label">' + esc(s.label) + help + " " + metaBadges(s) + '</div>' +
      '<div class="pm-row-desc">' + esc(s.description) + '</div>' +
      (reason ? '<div class="pm-row-reason">' + esc(reason) + "</div>" : "") + effective + errSlot + conflict +
      '<div class="pm-row-src">' + esc(r.source) +
      (s.recommendedValue !== undefined && r.state !== "recommended" ? " · Recommended: " + esc(fmtValue(s, s.recommendedValue)) : "") +
      "</div></div>" +
      '<div class="pm-row-control">' + controlHtml(s) + reset + "</div>" +
      '<div class="pm-row-state">' + stateBadge(s) + "</div>" +
      "</div>";
  }

  /* ---------- notice card ---------- */

  function noticeHtml(n) {
    var kindLabel = n.kind === "attention" ? "Needs attention" : n.kind === "setup" ? "Continue setup" : "Recommended";
    return '<div class="pm-notice" data-kind="' + esc(n.kind) + '" data-notice="' + esc(n.id) + '">' +
      '<span class="pm-notice-chip">' + kindLabel + "</span>" +
      '<div class="pm-notice-head">' + esc(n.headline) + "</div>" +
      '<div class="pm-notice-body">' + esc(n.consequence) + "</div>" +
      '<div class="pm-notice-actions"><button type="button" class="pm-btn" data-variant="primary" data-notice-act="' + esc(n.id) + '">' + esc(n.actionLabel) + "</button>" +
      '<button type="button" class="pm-btn" data-variant="quiet" data-notice-dismiss="' + esc(n.id) + '">' + esc(n.secondaryLabel || "Dismiss") + "</button></div></div>";
  }

  /* Compact inbox row — same data-notice-act / data-notice-dismiss contract
     as noticeHtml, so one delegation handler serves Home and the inbox. */
  function noticeCompactHtml(n) {
    var kindLabel = n.kind === "attention" ? "Needs attention" : n.kind === "setup" ? "Continue setup" : "Recommended";
    return '<div class="pm-inbox-item" data-kind="' + esc(n.kind) + '" data-notice="' + esc(n.id) + '">' +
      '<span class="pm-notice-chip">' + kindLabel + "</span>" +
      '<div class="pm-inbox-item-head">' + esc(n.headline) + "</div>" +
      '<div class="pm-inbox-item-actions">' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-notice-act="' + esc(n.id) + '">' + esc(n.actionLabel) + "</button>" +
      '<button type="button" class="pm-btn" data-variant="quiet" data-notice-dismiss="' + esc(n.id) + '" aria-label="Dismiss ' + esc(n.headline) + '">Dismiss</button>' +
      "</div></div>";
  }

  /* Scrim + drawer wiring shared by every Demo scenarios drawer.
     wireDrawer({ button, drawer, scrim, onClose }) — drawer/scrim use the
     [hidden] attribute; Escape closes and returns focus to the button. */
  function wireDrawer(opts) {
    var button = opts.button, drawer = opts.drawer, scrim = opts.scrim;
    if (!button || !drawer) return;
    var onClose = typeof opts.onClose === "function" ? opts.onClose : function () {};
    function open() {
      drawer.hidden = false;
      if (scrim) scrim.hidden = false;
      button.setAttribute("aria-expanded", "true");
      var first = drawer.querySelector("button, [href], input, select, [tabindex]");
      if (first) first.focus();
    }
    function close() {
      drawer.hidden = true;
      if (scrim) scrim.hidden = true;
      button.setAttribute("aria-expanded", "false");
      onClose();
    }
    button.addEventListener("click", function () {
      if (drawer.hidden) open(); else close();
    });
    if (scrim) scrim.addEventListener("click", close);
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && !drawer.hidden) { close(); button.focus(); }
    });
    button.setAttribute("aria-expanded", "false");
    return { open: open, close: close };
  }

  /* ---------- settings control binding (event delegation) ---------- */

  function bindSettings(root, handlers) {
    var onChange = handlers.onChange || function () {};
    var onReset = handlers.onReset || function (sid) { clearOverride(sid); };
    var onRun = handlers.onRun || function () {};

    root.addEventListener("click", function (ev) {
      var t = ev.target;
      var sw = t.closest && t.closest(".pm-switch[data-sid]");
      if (sw && !sw.disabled) { onChange(sw.getAttribute("data-sid"), sw.getAttribute("aria-checked") !== "true"); return; }
      var radio = t.closest && t.closest('.pm-seg [role="radio"]');
      if (radio && !radio.disabled) {
        var seg = radio.closest(".pm-seg[data-sid]");
        if (seg) onChange(seg.getAttribute("data-sid"), radio.getAttribute("data-value"));
        return;
      }
      var stepBtn = t.closest && t.closest(".pm-stepper button[data-step]");
      if (stepBtn && !stepBtn.disabled) {
        var wrap = stepBtn.closest(".pm-stepper[data-sid]");
        var input = wrap.querySelector("input");
        var next = (parseFloat(input.value) || 0) + parseFloat(stepBtn.getAttribute("data-step"));
        if (input.min !== "" && next < parseFloat(input.min)) next = parseFloat(input.min);
        if (input.max !== "" && next > parseFloat(input.max)) next = parseFloat(input.max);
        input.value = next;
        onChange(wrap.getAttribute("data-sid"), next);
        return;
      }
      var swatch = t.closest && t.closest(".pm-swatch[data-value]");
      if (swatch && swatch.getAttribute("aria-disabled") !== "true") {
        var group = swatch.closest("[data-sid]");
        if (group) onChange(group.getAttribute("data-sid"), swatch.getAttribute("data-value"));
        return;
      }
      var chip = t.closest && t.closest(".pm-chip[data-value]");
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
      var conflictBtn = t.closest && t.closest("[data-conflict]");
      if (conflictBtn) {
        /* store mutations emit "change"; the concept's PMStore subscription
           re-renders. Do NOT route through onChange (that writes overrides). */
        var csid = conflictBtn.getAttribute("data-sid");
        if (conflictBtn.getAttribute("data-conflict") === "reload") {
          clearOverride(csid);
          setChanged(csid, null);
          PMStore.receipt("Reloaded the value changed elsewhere", "info");
        } else {
          setChanged(csid, null);
          PMStore.receipt("Kept this window's value", "info");
        }
        return;
      }
    });

    root.addEventListener("change", function (ev) {
      var t = ev.target;
      if (t.matches && t.matches("select[data-sid]")) onChange(t.getAttribute("data-sid"), t.value);
      if (t.matches && t.matches(".pm-slider[data-sid]")) onChange(t.getAttribute("data-sid"), parseFloat(t.value));
      if (t.matches && t.matches(".pm-stepper input")) {
        var wrap = t.closest(".pm-stepper[data-sid]");
        if (wrap) onChange(wrap.getAttribute("data-sid"), parseFloat(t.value));
      }
    });

    root.addEventListener("input", function (ev) {
      var t = ev.target;
      if (t.matches && t.matches(".pm-slider[data-sid]")) {
        var out = t.parentNode.querySelector(".pm-slider-val");
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
      if (ev.target.matches && ev.target.matches('.pm-text input[data-sid]')) commitText(ev.target);
    });
    root.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" && ev.target.matches && ev.target.matches('.pm-text input[data-sid]')) {
        ev.target.blur();
      }
    });
  }

  /* ---------- search wiring ---------- */

  var KIND_LABEL = {
    setting: "Setting", category: "Destination", subcategory: "Section",
    manager: "Manager", action: "Action", status: "Read-only status",
    diagnostic: "Diagnostic", workflow: "Setup workflow", capability: "Unavailable capability"
  };
  var KIND_GROUP = {
    manager: "Managers", action: "Actions", status: "Status",
    diagnostic: "Diagnostics", workflow: "Setup", capability: "Unavailable"
  };

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

    function pick(i) {
      var r = results[i];
      if (!r) return;
      close();
      input.value = "";
      onPick(r);
    }

    function render() {
      if (!results.length) {
        listEl.innerHTML = '<div class="pm-hits-empty">No matches. Try a setting, manager, or action name.</div>';
        listEl.hidden = false;
        return;
      }
      var html = "";
      var lastGroup = null;
      results.forEach(function (r, i) {
        var group = r.kind === "setting" || r.kind === "subcategory" ? r.subtitle : (KIND_GROUP[r.kind] || KIND_LABEL[r.kind] || r.kind);
        if (group !== lastGroup) {
          lastGroup = group;
          html += '<div class="pm-hits-group">' + esc(group) + "</div>";
        }
        html += '<button type="button" class="pm-hit" role="option" id="hit-' + i + '" data-hit="' + i + '" aria-selected="' + (i === active) + '">' +
          '<span class="pm-hit-kind">' + esc(KIND_LABEL[r.kind] || r.kind) + "</span>" +
          '<span class="pm-hit-title">' + PMSearch.highlight(r.title, r.ranges) + "</span>" +
          (r.kind === "setting" || r.kind === "subcategory" ? "" : '<span class="pm-hit-sub">' + esc(r.subtitle) + "</span>") +
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
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowDown" && results.length) { ev.preventDefault(); active = (active + 1) % results.length; render(); input.setAttribute("aria-activedescendant", "hit-" + active); }
      else if (ev.key === "ArrowUp" && results.length) { ev.preventDefault(); active = (active - 1 + results.length) % results.length; render(); input.setAttribute("aria-activedescendant", "hit-" + active); }
      else if (ev.key === "Enter") { ev.preventDefault(); pick(active === -1 ? 0 : active); }
      else if (ev.key === "Escape") { ev.stopPropagation(); close(); input.blur(); }
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
    document.querySelectorAll(".pm-menu[data-pop]").forEach(function (m) { m.remove(); });
    var menu = document.createElement("div");
    menu.className = "pm-menu";
    menu.setAttribute("data-pop", "1");
    menu.setAttribute("role", "menu");
    menu.style.position = "fixed";
    menu.style.insetInlineStart = Math.max(8, x) + "px";
    menu.style.top = Math.max(8, y) + "px";
    menu.style.zIndex = "90";
    items.forEach(function (it) {
      if (it.sep) {
        var sep = document.createElement("div");
        sep.className = "pm-menu-sep";
        menu.appendChild(sep);
        return;
      }
      var b = document.createElement("button");
      b.type = "button";
      b.className = "pm-menu-item";
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
    var first = menu.querySelector(".pm-menu-item:not([aria-disabled])");
    if (first) first.focus();
    return menu;
  }

  /* ---------- spellcheck demo (never auto-replaces) ---------- */

  var MISSPELLED = { "recieve": "receive", "seperate": "separate", "occured": "occurred" };

  function mountSpellcheck(el, storeOpts) {
    var data = (window.PM_CORE_DATA || window.PM_SETTINGS_DEMO).spellcheck;
    var ignored = PMStore.get("spell.ignored", []);
    var personal = PMStore.get("spell.personal", data.personalDictionary.slice());
    var project = PMStore.get("spell.project", data.projectDictionary.slice());

    function render() {
      var words = data.demoParagraph.split(/(\s+)/);
      var html = words.map(function (w) {
        var bare = w.replace(/[^a-zA-Z_]/g, "");
        var lower = bare.toLowerCase();
        if (Object.prototype.hasOwnProperty.call(MISSPELLED, lower) && ignored.indexOf(lower) === -1 && personal.indexOf(bare) === -1 && project.indexOf(bare) === -1) {
          return '<span class="pm-spell" tabindex="0" role="button" aria-haspopup="menu" aria-label="Possible misspelling: ' + esc(bare) + '. Open for suggestions." data-word="' + esc(bare) + '" data-fixed="' + esc(MISSPELLED[lower]) + '">' + esc(w) + "</span>";
        }
        return esc(w);
      }).join("");
      el.innerHTML =
        '<div class="pm-spell-demo" aria-label="Spellcheck demonstration">' +
        '<p class="pm-spell-text">' + html + "</p>" +
        '<p class="pm-spell-note">Suggestions appear on click or focus + Enter. Spellcheck never replaces text by itself; code tokens and paths are skipped.</p>' +
        '<div class="pm-spell-dicts"><span class="pm-badge" data-kind="scope">Personal dictionary: ' + esc(personal.join(", ")) + '</span> <span class="pm-badge" data-kind="scope">Project dictionary: ' + esc(project.join(", ")) + "</span></div>" +
        "</div>";
    }

    function openMenu(span) {
      var rect = span.getBoundingClientRect();
      var wrong = span.getAttribute("data-word");
      var fixed = span.getAttribute("data-fixed");
      popMenu(rect.left, rect.bottom + 6, [
        { label: 'Replace once with "' + fixed + '"', action: function () { span.textContent = fixed; span.classList.remove("pm-spell"); span.removeAttribute("tabindex"); PMStore.receipt("Replaced once — spellcheck never changes text on its own", "ok"); } },
        { label: "Ignore once", action: function () { span.classList.remove("pm-spell"); span.removeAttribute("tabindex"); } },
        { label: "Ignore for this draft", action: function () { ignored.push(wrong.toLowerCase()); PMStore.set("spell.ignored", ignored); render(); } },
        { sep: true },
        { label: "Add to personal dictionary", action: function () { personal.push(wrong); PMStore.set("spell.personal", personal); PMStore.receipt('Added "' + wrong + '" to your personal dictionary', "ok"); render(); } },
        { label: "Add to project dictionary", action: function () { project.push(wrong); PMStore.set("spell.project", project); PMStore.receipt('Added "' + wrong + '" to the project dictionary', "ok"); render(); } }
      ]);
    }

    el.addEventListener("click", function (ev) {
      var span = ev.target.closest && ev.target.closest(".pm-spell");
      if (span) openMenu(span);
    });
    el.addEventListener("keydown", function (ev) {
      var span = ev.target.closest && ev.target.closest(".pm-spell");
      if (span && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); openMenu(span); }
    });
    el.addEventListener("contextmenu", function (ev) {
      var span = ev.target.closest && ev.target.closest(".pm-spell");
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
    return '<span class="pm-healthdot" data-state="' + esc(state) + '"><span class="pm-healthdot-dot" aria-hidden="true"></span><span>' + esc(label) + "</span></span>";
  }

  function capabilityChip(name, cap) {
    var tip = cap.evidence + (cap.freshAsOf ? " · as of " + cap.freshAsOf : "");
    return '<span class="pm-badge" data-kind="scope" data-tip="' + esc(tip) + '" tabindex="0">' + esc(name) + ": " + esc(human(CAP_STATE, cap.state)) + "</span>";
  }

  function modelRowHtml(p, m) {
    var unavailable = m.unavailableReason
      ? '<div class="pm-row-reason">' + esc(m.unavailableReason) + "</div>" : "";
    var rve = m.requestedVsEffective
      ? '<div class="pm-row-effective">Requested <b class="pm-eff">' + esc(m.requestedVsEffective.requested) + '</b> → Effective <b class="pm-eff">' + esc(m.requestedVsEffective.effective) + "</b> — " + esc(m.requestedVsEffective.reason) + "</div>" : "";
    var caps = '<span class="pm-model-caps">' +
      capabilityChip("Tools", m.capabilities.tools) +
      capabilityChip("Vision", m.capabilities.vision) +
      capabilityChip("Structured output", m.capabilities.structuredOutput) + "</span>";
    var effort = m.effort
      ? '<span class="pm-select"><select data-pv="effort" data-pid="' + esc(p.id) + '" data-mid="' + esc(m.id) + '" aria-label="Reasoning effort">' +
        m.effort.map(function (e) { return '<option value="' + esc(e) + '"' + (e === (m.effortSelected || m.effort[1] || m.effort[0]) ? " selected" : "") + ">Effort: " + esc(e[0].toUpperCase() + e.slice(1)) + "</option>"; }).join("") + "</select></span>"
      : '<span class="pm-badge" data-kind="scope">Effort: not offered</span>';
    var variant = m.fastMode && m.fastMode.supported
      ? '<span class="pm-seg" role="radiogroup" aria-label="Speed variant" data-pv-seg="variant" data-pid="' + esc(p.id) + '" data-mid="' + esc(m.id) + '">' +
        '<button type="button" role="radio" aria-checked="' + ((m.variant || "normal") === "normal") + '" data-value="normal">Normal</button>' +
        '<button type="button" role="radio" aria-checked="' + (m.variant === "fast") + '" data-value="fast" data-tip="' + esc(m.fastMode.evidence) + '">Fast</button></span>'
      : '<span class="pm-badge" data-kind="scope" data-tip="' + esc(m.fastMode ? m.fastMode.evidence : "") + '" tabindex="0">Single speed</span>';
    var setup = "";
    if (m.requiresSetup && p.setupSteps) {
      setup = '<details class="pm-accordion pm-setup"><summary>Setup required — Puppet Master walks you through it</summary><div class="pm-accordion-body"><ol class="pm-setup-steps">' +
        p.setupSteps.map(function (st) { return "<li>" + esc(st) + "</li>"; }).join("") +
        '</ol><button type="button" class="pm-btn" data-variant="primary" data-pv="setup" data-pid="' + esc(p.id) + '" data-mid="' + esc(m.id) + '">Start guided setup</button></div></details>';
    }
    if (m.rateNote) setup += '<div class="pm-row-reason">' + esc(m.rateNote) + "</div>";
    return '<div class="pm-row pm-model' + (m.hidden ? " is-hidden" : "") + '" data-state="' + (m.unavailableReason ? "unavailable" : "custom") + '">' +
      '<div class="pm-row-main"><div class="pm-row-label">' +
      '<button type="button" class="pm-iconbtn' + (m.favorite ? " is-on" : "") + '" data-pv="fav" data-pid="' + esc(p.id) + '" data-mid="' + esc(m.id) + '" aria-pressed="' + !!m.favorite + '" aria-label="Favorite ' + esc(m.name) + '">' + icon("star") + "</button>" +
      esc(m.name) +
      ' <button type="button" class="pm-alias" data-pv="alias" data-pid="' + esc(p.id) + '" data-mid="' + esc(m.id) + '" data-tip="Rename the alias" aria-label="Edit alias">' + esc(m.alias ? "“" + m.alias + "”" : "Add alias") + "</button>" +
      ' <span class="pm-badge" data-kind="scope">Context ' + (m.contextLimit >= 1000 ? Math.round(m.contextLimit / 1000) + "k" : m.contextLimit) + "</span>" +
      ' <span class="pm-badge" data-kind="scope">In: ' + esc((m.modalities.in || []).join(" + ")) + " · Out: " + esc((m.modalities.out || []).join(" + ")) + "</span>" +
      (m.hidden ? ' <span class="pm-badge" data-kind="exposure" data-icon data-exposure="unavailable">Hidden</span>' : "") +
      '</div>' + unavailable + rve +
      '<div class="pm-row-desc">' + caps + "</div>" + setup + "</div>" +
      '<div class="pm-row-control">' + effort + variant +
      '<span class="pm-stepper" data-pv-step="priority" data-pid="' + esc(p.id) + '" data-mid="' + esc(m.id) + '"><button type="button" data-step="-1" aria-label="Lower priority">−</button><input type="number" value="' + m.priority + '" aria-label="Priority" readonly><button type="button" data-step="1" aria-label="Raise priority">+</button></span>' +
      '<button type="button" class="pm-iconbtn" data-pv="hide" data-pid="' + esc(p.id) + '" data-mid="' + esc(m.id) + '" aria-pressed="' + !!m.hidden + '" aria-label="' + (m.hidden ? "Show " : "Hide ") + esc(m.name) + '">' + icon(m.hidden ? "eyeoff" : "eye") + "</button>" +
      "</div></div>";
  }

  function accountRowHtml(p, a) {
    var h = HEALTH[a.health] || { label: a.health, dot: "unknown" };
    var activate = (!a.active && a.enabled)
      ? '<button type="button" class="pm-btn" data-variant="quiet" data-pv="activate" data-pid="' + esc(p.id) + '" data-aid="' + esc(a.id) + '">Use for future work</button>' : "";
    var signin = "";
    if (p.installState === "installed-signed-out") {
      signin = '<button type="button" class="pm-btn" data-variant="primary" data-pv="signin" data-pid="' + esc(p.id) + '">Sign in through the provider’s own flow</button>';
    }
    return '<div class="pm-row" data-state="' + (a.health === "auth-ok-invocation-failed" ? "unavailable" : a.enabled ? "default" : "not-configured") + '">' +
      '<div class="pm-row-main"><div class="pm-row-label">' + esc(a.label) +
      (a.active ? ' <span class="pm-badge" data-kind="state" data-icon data-state="auto">Active for new requests</span>' : "") +
      ' <span class="pm-badge" data-kind="scope">Priority ' + a.priority + "</span>" +
      (a.sticky ? ' <span class="pm-badge" data-kind="scope">Sticky sessions</span>' : "") + "</div>" +
      '<div class="pm-row-desc">' + esc(a.identity) + " · Last catalog " + esc(a.lastCatalogRefresh) + " · Last successful generation " + esc(a.lastSuccessfulGeneration) + "</div>" +
      '<div class="pm-row-desc">' + healthDot(h.dot, h.label) + ' <span class="pm-badge" data-kind="scope">Usage pressure: ' + esc(a.usagePressure) + '</span> <span class="pm-badge" data-kind="scope">Resets: ' + esc(a.resetAt) + "</span></div>" +
      (p.lastError && a.health === "auth-ok-invocation-failed" ? '<div class="pm-row-reason">' + esc(p.lastError) + "</div>" : "") +
      "</div>" +
      '<div class="pm-row-control">' +
      '<button type="button" class="pm-switch" role="switch" aria-checked="' + !!a.enabled + '" data-pv="enabled" data-pid="' + esc(p.id) + '" data-aid="' + esc(a.id) + '" aria-label="Enable ' + esc(a.label) + '"></button>' +
      activate +
      '<button type="button" class="pm-btn" data-variant="quiet" data-pv="reconnect" data-pid="' + esc(p.id) + '" data-aid="' + esc(a.id) + '">Reconnect</button>' +
      (a.health === "auth-ok-invocation-failed" ? '<button type="button" class="pm-btn" data-variant="quiet" data-pv="repair" data-pid="' + esc(p.id) + '" data-aid="' + esc(a.id) + '">Run a readiness check</button>' : "") +
      signin +
      "</div></div>";
  }

  function usageHtml(p) {
    var u = p.usageSnapshot;
    if (!u) return '<div class="pm-empty"><div class="pm-empty-title">No usage reporting on this route</div><div class="pm-empty-guidance">This connection does not report balances. Usage detail still lives in the Usage area when a route reports it.</div></div>';
    var whatNext = "";
    if (u.whatNext) {
      whatNext = '<div class="pm-row" data-state="custom"><div class="pm-row-main"><div class="pm-row-label">When included usage runs out</div>' +
        '<div class="pm-row-desc">A provider-specific choice — not a global budget switch.</div></div>' +
        '<div class="pm-row-control"><span class="pm-select"><select data-pv="whatnext" data-pid="' + esc(p.id) + '" aria-label="When included usage runs out">' +
        u.whatNext.options.map(function (o) { return '<option value="' + esc(o) + '"' + (o === u.whatNext.selected ? " selected" : "") + ">" + esc(human(WHATNEXT, o)) + "</option>"; }).join("") +
        "</select></span></div></div>";
    }
    return '<dl class="pm-kv">' +
      '<dt>Included usage remaining</dt><dd>' + esc(u.includedRemaining) + "</dd>" +
      "<dt>Extra balance</dt><dd>" + esc(u.extraBalance) + "</dd>" +
      "<dt>Next reset</dt><dd>" + esc(u.resetsAt) + "</dd>" +
      "<dt>Pressure</dt><dd>" + esc(u.pressure) + "</dd>" +
      "<dt>Last successful use</dt><dd>" + esc(u.lastSuccessfulUse) + "</dd>" +
      "<dt>Projection</dt><dd>" + esc(u.projection) + "</dd>" +
      "<dt>Source freshness</dt><dd>" + esc(u.sourceFreshness) + "</dd>" +
      "</dl>" + whatNext +
      '<p class="pm-faint">Read-only snapshot. <button type="button" class="pm-btn" data-variant="quiet" data-pv="open-usage" data-pid="' + esc(p.id) + '">Open Usage for detail</button> — Usage owns balances, history, and projections; this panel never recalculates them.</p>';
  }

  function catalogHtml(p) {
    var c = p.catalog;
    var stateLine = c.refreshing
      ? '<span class="pm-badge" data-kind="state" data-icon data-state="auto">Refreshing — showing the last known good catalog</span>'
      : c.lastKnownGood
        ? '<span class="pm-badge" data-kind="state" data-icon data-state="default">Last known good catalog</span>'
        : '<span class="pm-badge" data-kind="state" data-icon data-state="not-configured">No catalog yet</span>';
    return '<div class="pm-catalog">' +
      '<div class="pm-row-desc">Source ' + esc(c.source) + " · Version " + esc(c.version) + " · Last checked " + esc(c.lastChecked) + " · Last successfully activated " + esc(c.lastActivated) + " " + stateLine + "</div>" +
      '<button type="button" class="pm-btn" data-pv="refresh" data-pid="' + esc(p.id) + '"' + (c.refreshing ? " disabled" : "") + ">" + (c.refreshing ? "Refreshing…" : "Refresh catalog") + "</button>" +
      '<p class="pm-faint">A fresh catalog does not prove account entitlement or that a call will succeed — those are checked separately.</p>' +
      '<p class="pm-faint">Catalogs refresh in the background (stale-while-revalidate). A bad update is quarantined and the last known good list stays active; removed or no-longer-free models keep a visible history.</p></div>';
  }

  function diagnosticsHtml(p) {
    return '<div class="pm-logs" aria-label="Diagnostics log">' +
      (p.diagnostics || []).map(function (l) { return '<div class="pm-log-line">' + esc(l) + "</div>"; }).join("") + "</div>";
  }

  function routingHtml(p) {
    var r = p.routing || { priority: 1, useNextOnExhaust: false, continuation: "Ask before switching" };
    var continuations = ["Ask before switching", "Switch automatically", "Stop and ask"];
    return '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label">Failover priority</div>' +
      '<div class="pm-row-desc">Lower numbers are tried first when more than one route can serve a request.</div></div>' +
      '<div class="pm-row-control"><span class="pm-stepper" data-pv-step="route-priority" data-pid="' + esc(p.id) + '">' +
      '<button type="button" data-step="-1" aria-label="Higher priority">−</button><input type="number" value="' + r.priority + '" aria-label="Failover priority" readonly>' +
      '<button type="button" data-step="1" aria-label="Lower priority">+</button></span></div></div>' +
      '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label">Use the next route when this one runs out</div>' +
      '<div class="pm-row-desc">When this provider is exhausted or unavailable, try the next eligible route instead of stopping.</div></div>' +
      '<div class="pm-row-control"><button type="button" class="pm-switch" role="switch" aria-checked="' + !!r.useNextOnExhaust + '" data-pv="route-usenext" data-pid="' + esc(p.id) + '" aria-label="Use next route on exhaustion"></button></div></div>' +
      '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label">Switching mid-conversation</div>' +
      '<div class="pm-row-desc">What to do when a switch would change the route of an ongoing conversation.</div></div>' +
      '<div class="pm-row-control"><span class="pm-select"><select data-pv="route-continuation" data-pid="' + esc(p.id) + '" aria-label="Switching mid-conversation">' +
      continuations.map(function (c) { return '<option value="' + esc(c) + '"' + (c === r.continuation ? " selected" : "") + ">" + esc(c) + "</option>"; }).join("") +
      "</select></span></div></div>";
  }

  /* ---------- ObservableWork operation projection (correction pass) ----------
     Truthful operation grammar per the Performance register §11:
     precise phase, visible wait/queue reason, determinate progress ONLY
     with a real denominator, an explicit progress source, and cancel only
     when semantically valid. Demo projections declare their source. */
  var PROGRESS_SOURCE = {
    "measured": "Measured progress",
    "provider_reported": "Reported by the provider",
    "derived": "Derived estimate",
    "unknown": "Progress unknown",
    "simulated": "Simulated demo projection"
  };

  function operationHtml(op) {
    var out = '<div class="pm-op" data-state="' + esc(op.state || "running") + '">';
    out += '<div class="pm-op-head"><span class="pm-op-title">' + esc(op.title) + "</span>" +
      '<span class="pm-badge" data-kind="state" data-icon data-state="auto">' + esc(op.phase) + "</span></div>";
    if (op.progressKind === "determinate" && typeof op.completed === "number" && typeof op.total === "number" && op.total > 0) {
      var pct = Math.round((op.completed / op.total) * 100);
      out += '<div class="pm-op-meter" role="progressbar" aria-valuemin="0" aria-valuemax="' + op.total + '" aria-valuenow="' + op.completed + '" aria-label="' + esc(op.title) + '">' +
        '<span class="pm-op-fill" style="inline-size:' + pct + '%"></span></div>' +
        '<div class="pm-op-nums">' + esc(op.completed.toLocaleString("en-US")) + " of " + esc(op.total.toLocaleString("en-US")) + " " + esc(op.unit || "items") + " · " + pct + "%</div>";
    }
    if (op.waitReason) out += '<div class="pm-op-wait">' + icon("bolt") + esc(op.waitReason) + "</div>";
    out += '<div class="pm-op-source">' + esc(PROGRESS_SOURCE[op.source || "unknown"]) + "</div>";
    if (op.canCancel) out += '<div class="pm-op-actions"><button type="button" class="pm-btn" data-variant="quiet" data-op-cancel="' + esc(op.id || "") + '">Cancel</button></div>';
    return out + "</div>";
  }

  /* Environment-level provider states (correction pass): offline/poor-network
     keeps the cached catalog and marks freshness instead of probing; a large
     detection result collapses to one human summary instead of 100 cards. */
  function providerEnvBannerHtml() {
    var out = "";
    if (PMStore.get("providersOffline", false)) {
      out += '<div class="pm-env-banner" data-kind="offline">' + icon("plug") +
        "<div><b>Offline.</b> Showing the last-known-good catalog and connection state — nothing is probed until the network returns. Refresh resumes on reconnect.</div></div>";
    }
    if (PMStore.get("manyInstalls", false)) {
      out += '<div class="pm-env-banner" data-kind="many">' + icon("layers") +
        '<div><b>100 detected installations collapse into human summaries.</b> 94 ready · 4 shadowed (detected, not used) · 2 unknown ownership (manual-only). Individual cards appear on the provider that needs them.</div></div>';
    }
    return out;
  }

  /* Store-key → owning surface map. Concepts extend this with their own
     manager keys so a change repaints only the surface that owns the key
     (Performance register §7.3 narrow deltas, §20.2 domain-local refresh). */
  var SHARED_KEY_DOMAINS = {
    "providers": "manager:providers",
    "roles": "manager:providers",
    "providersOffline": "manager:providers",
    "manyInstalls": "manager:providers",
    "overrides": "workspace",
    "errors": "workspace",
    "changedElsewhere": "workspace",
    "spell.ignored": "manager:spellcheck",
    "spell.personal": "manager:spellcheck",
    "spell.project": "manager:spellcheck"
  };

  /* ---------- installations & update lifecycle (kimi-k3) ---------- */

  var CONFIDENCE_LABEL = {
    "proven": "Proven", "strong": "Strongly identified", "probable": "Probable",
    "ambiguous": "Ambiguous", "unknown": "Unknown"
  };
  var UPDATE_STATE = {
    "ready": "Ready", "update-available": "Update available", "waiting": "Waiting for work to finish",
    "updating": "Updating", "verifying": "Verifying", "verification-failed": "Verification failed",
    "rolled-back": "Rolled back", "needs-repair": "Needs repair",
    "managed-externally": "Managed externally", "unknown-method": "Could not identify installation method"
  };

  function confidenceBadge(c) {
    var warn = c === "ambiguous" || c === "unknown";
    return '<span class="pm-badge" data-kind="state" data-icon data-state="' + (warn ? "effective-differs" : "default") + '">' +
      esc(CONFIDENCE_LABEL[c] || c) + (warn ? " — manual-only" : "") + "</span>";
  }

  /* One humanized installation card per detected installation. */
  function installationHtml(p) {
    var list = p.installations || [];
    var out = "";
    if (!list.length && p.installAction) {
      return '<div class="pm-install-card" data-state="not-installed">' +
        '<div class="pm-install-head">' + icon("download") + '<div><div class="pm-install-title">Not installed on this host</div>' +
        '<div class="pm-install-sub">' + esc(p.installAction.sourceNote || "Installs come from the provider's official source, for the exact host and environment you pick — never bundled with Puppet Master.") + "</div></div></div>" +
        '<div class="pm-install-actions"><button type="button" class="pm-btn" data-variant="primary" data-pv="install" data-pid="' + esc(p.id) + '">' + esc(p.installAction.label || "Install from the official source") + "</button></div></div>";
    }
    list.forEach(function (inst) {
      var shadow = inst.shadowed ? "shadowed — detected but not used" : (inst.selected ? "selected" : "available");
      out += '<div class="pm-install-card" data-selected="' + !!inst.selected + '" data-shadowed="' + !!inst.shadowed + '">' +
        '<div class="pm-install-head">' + icon("terminal") + '<div><div class="pm-install-title">' + esc(inst.label) +
        ' <span class="pm-badge" data-kind="scope">' + esc(inst.version) + "</span></div>" +
        '<div class="pm-install-sub">' + esc(inst.methodLabel || inst.method) + " · " + esc(inst.host) + " · " + esc(inst.environment) + "</div></div>" +
        confidenceBadge(inst.confidence) + "</div>" +
        '<dl class="pm-kv pm-install-kv">' +
        "<dt>Command</dt><dd class=\"pm-mono\">" + esc(inst.command) + "</dd>" +
        "<dt>Executable</dt><dd class=\"pm-mono\">" + esc(inst.executable) + "</dd>" +
        (inst.packageIdentity ? "<dt>Package</dt><dd class=\"pm-mono\">" + esc(inst.packageIdentity) + "</dd>" : "") +
        "<dt>Status</dt><dd>" + esc(shadow) + "</dd></dl>" +
        (!inst.selected && !inst.shadowed
          ? '<div class="pm-install-actions"><button type="button" class="pm-btn" data-variant="quiet" data-pv="install-select" data-pid="' + esc(p.id) + '" data-iid="' + esc(inst.id) + '">Use this installation</button></div>'
          : "") +
        "</div>";
    });
    return out;
  }

  /* Update policy rows (packet defaults) + truthful update state. */
  function updatesHtml(p) {
    var pol = p.updatePolicy || { check: "Automatic", install: "Ask first", version: "Latest compatible", rollback: true };
    var st = p.updateState || { state: "ready" };
    function sel(field, value, options, label, desc) {
      return '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label">' + esc(label) + "</div>" +
        '<div class="pm-row-desc">' + esc(desc) + "</div></div>" +
        '<div class="pm-row-control"><span class="pm-select"><select data-pv-policy="' + field + '" data-pid="' + esc(p.id) + '" aria-label="' + esc(label) + '">' +
        options.map(function (o) { return '<option value="' + esc(o) + '"' + (o === value ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") +
        "</select></span></div></div>";
    }
    var out = sel("check", pol.check, ["Automatic", "Manual"], "Check for provider updates", "How often Puppet Master looks for new versions of this provider tool.") +
      sel("install", pol.install, ["Ask first", "Automatically when idle", "Manual"], "Install provider updates", "Ask first is the recommended default. Automatically when idle needs proven ownership, no active requests, and a reliable rollback path.") +
      sel("version", pol.version, ["Latest compatible", "Pinned"], "Version policy", "Latest compatible tracks the newest version that still works with your setup.") +
      '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label">Roll back after failed verification</div>' +
      '<div class="pm-row-desc">Return to the last working version when a fresh install fails its readiness checks. On where supported.</div></div>' +
      '<div class="pm-row-control"><button type="button" class="pm-switch" role="switch" aria-checked="' + !!pol.rollback + '" data-pv="policy-rollback" data-pid="' + esc(p.id) + '" aria-label="Roll back after failed verification"></button></div></div>';

    var stateLabel = UPDATE_STATE[st.state] || st.state;
    var dot = st.state === "ready" ? "ok" : (st.state === "verification-failed" || st.state === "needs-repair" ? "danger" : (st.state === "update-available" || st.state === "waiting" || st.state === "rolled-back" ? "warn" : "info"));
    if (st.state === "updating" || st.state === "verifying") {
      out += operationHtml({
        id: "update-" + p.id,
        title: "Update to " + (st.availableVersion || "the new version"),
        phase: stateLabel,
        state: st.state === "verifying" ? "verifying" : "running",
        progressKind: "none",
        source: "simulated",
        waitReason: st.state === "verifying" ? null : "Downloads from the official source, then verifies launch, auth, catalog, and adapter handshake — not just the installer exit code"
      }) + (st.note ? '<div class="pm-update-note">' + esc(st.note) + "</div>" : "");
    } else {
      out += '<div class="pm-update-state" data-state="' + esc(st.state) + '">' + healthDot(dot, stateLabel) +
        (st.availableVersion ? '<span class="pm-badge" data-kind="scope">Version ' + esc(st.availableVersion) + "</span>" : "") +
        (st.note ? '<span class="pm-update-note">' + esc(st.note) + "</span>" : "") + "</div>";
    }
    var actions = "";
    if (st.state === "update-available") actions += '<button type="button" class="pm-btn" data-variant="primary" data-pv="update-apply" data-pid="' + esc(p.id) + '">Update now</button>';
    if (st.state === "verification-failed" || st.state === "needs-repair") actions += '<button type="button" class="pm-btn" data-variant="danger" data-pv="update-rollback" data-pid="' + esc(p.id) + '">Roll back</button>';
    if (st.state === "ready") actions += '<button type="button" class="pm-btn" data-variant="quiet" data-pv="update-check" data-pid="' + esc(p.id) + '">Check for updates</button>';
    if (actions) out += '<div class="pm-update-actions">' + actions + "</div>";
    return out;
  }

  /* ---------- deterministic provider scenarios (Demo drawers) ---------- */

  var PROVIDER_SCENARIOS = [
    { id: "cli-signs-out", label: "Claude CLI signs out" },
    { id: "update-available", label: "Claude CLI update becomes available" },
    { id: "schedule-idle", label: "Schedule the update for idle time" },
    { id: "verification-failed", label: "Update verification fails → rollback" },
    { id: "usage-exhausted", label: "OpenAI included usage runs out" },
    { id: "catalog-stale", label: "Catalog refresh keeps last-known-good" },
    { id: "offline", label: "Network goes offline (last-known-good)" },
    { id: "many-installs", label: "100 detected installations collapse" },
    { id: "reset-providers", label: "Reset providers to seeded state" }
  ];

  function applyProviderScenario(id, rerender) {
    var done = typeof rerender === "function" ? rerender : function () {};
    function anthropic() { return providerById("anthropic"); }
    switch (id) {
      case "cli-signs-out": {
        var p1 = anthropic();
        if (!p1) return;
        p1.installState = "installed-signed-out";
        (p1.accounts || []).forEach(function (a) { a.health = "setup-required"; });
        saveProvider(p1);
        PMStore.receipt("Scenario applied — the Claude CLI is now signed out (simulated)", "warn");
        done();
        return;
      }
      case "update-available": {
        var p2 = anthropic();
        if (!p2) return;
        p2.updateState = { state: "update-available", availableVersion: "2.1.0", note: "Found by the automatic check" };
        saveProvider(p2);
        PMStore.receipt("Scenario applied — an update is available and waits for your go-ahead", "info");
        done();
        return;
      }
      case "schedule-idle": {
        var p3 = anthropic();
        if (!p3) return;
        p3.updatePolicy.install = "Automatically when idle";
        p3.updateState = { state: "waiting", availableVersion: "2.1.0", note: "Scheduled — installs when no requests are active" };
        saveProvider(p3);
        PMStore.receipt("Scenario applied — the update is scheduled for idle time (simulated)", "info");
        done();
        return;
      }
      case "verification-failed": {
        var p4 = anthropic();
        if (!p4) return;
        p4.updateState = { state: "verification-failed", availableVersion: "2.1.0", note: "Adapter handshake failed after install" };
        saveProvider(p4);
        PMStore.receipt("Scenario applied — verification failed; rollback starts automatically (simulated)", "danger");
        done();
        window.setTimeout(function () {
          var again = anthropic();
          if (!again) return;
          again.updateState = { state: "rolled-back", note: "Back on 2.0.4 — the failed update never served a request" };
          saveProvider(again);
          PMStore.receipt("Rollback simulated — the previous version is verified and serving again", "ok");
          done();
        }, 1600);
        return;
      }
      case "usage-exhausted": {
        var p5 = providerById("openai");
        if (!p5 || !p5.usageSnapshot) return;
        p5.usageSnapshot.includedRemaining = "0%";
        p5.usageSnapshot.pressure = "high";
        p5.usageSnapshot.projection = "Included usage is exhausted; the allowance resets in 6 days";
        saveProvider(p5);
        PMStore.receipt("Scenario applied — OpenAI included usage is exhausted (simulated)", "warn");
        done();
        return;
      }
      case "catalog-stale": {
        var p6 = providerById("openai");
        if (!p6) return;
        p6.catalog.refreshing = true;
        p6.catalog.lastKnownGood = true;
        saveProvider(p6);
        PMStore.receipt("Scenario applied — the refresh keeps showing the last-known-good catalog", "info");
        done();
        window.setTimeout(function () {
          var again2 = providerById("openai");
          if (!again2) return;
          again2.catalog.refreshing = false;
          again2.catalog.lastChecked = "just now";
          saveProvider(again2);
          done();
        }, 1500);
        return;
      }
      case "offline": {
        PMStore.set("providersOffline", true);
        PMStore.receipt("Scenario applied — offline: cached catalog and connection state stay visible; nothing probes (simulated)", "warn");
        done();
        return;
      }
      case "many-installs": {
        PMStore.set("manyInstalls", true);
        PMStore.receipt("Scenario applied — 100 detected installations collapse to human summaries (simulated)", "info");
        done();
        return;
      }
      case "reset-providers": {
        var seed = (window.PM_CORE_DATA || window.PM_SETTINGS_DEMO).providers;
        PMStore.set("providers", clone(seed));
        PMStore.set("providersOffline", false);
        PMStore.set("manyInstalls", false);
        PMStore.receipt("Providers restored to the seeded fixture set", "ok");
        done();
        return;
      }
    }
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
          input.className = "pm-alias-edit";
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
          rerender();
          window.setTimeout(function () {
            var again = providerById(pid);
            again.catalog.refreshing = false;
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
        case "install-select": {
          var iid = btn.getAttribute("data-iid");
          (p.installations || []).forEach(function (inst) {
            inst.selected = inst.id === iid;
            inst.shadowed = inst.id !== iid;
          });
          saveProvider(p);
          PMStore.receipt("Installation switched (simulated) — the previous entry is now shadowed", "ok");
          rerender();
          break;
        }
        case "update-check":
          p.updateState = { state: "update-available", availableVersion: "2.1.0", note: "Found by a manual check just now" };
          saveProvider(p);
          PMStore.receipt("Update check simulated — a compatible update is available", "info");
          rerender();
          break;
        case "update-apply":
          p.updateState = { state: "updating", availableVersion: (p.updateState || {}).availableVersion || "2.1.0", note: "Installing from the official source" };
          saveProvider(p);
          rerender();
          window.setTimeout(function () {
            var up = providerById(pid);
            if (!up) return;
            up.updateState = { state: "verifying", availableVersion: "2.1.0", note: "Running readiness checks: launch, auth, catalog, adapter handshake" };
            saveProvider(up);
            rerender();
            window.setTimeout(function () {
              var up2 = providerById(pid);
              if (!up2) return;
              up2.updateState = { state: "ready", note: "Updated to 2.1.0 (simulated) — nothing was downloaded or changed" };
              saveProvider(up2);
              PMStore.receipt("Update simulated — verification passed and 2.1.0 is serving", "ok");
              rerender();
            }, 1200);
          }, 1400);
          break;
        case "update-rollback":
          p.updateState = { state: "rolled-back", note: "Back on 2.0.4 — the failed update never served a request" };
          saveProvider(p);
          PMStore.receipt("Rollback simulated — the previous version is verified and serving again", "ok");
          rerender();
          break;
        case "policy-rollback":
          p.updatePolicy.rollback = btn.getAttribute("aria-checked") !== "true";
          saveProvider(p);
          rerender();
          break;
      }
    });

    root.addEventListener("change", function (ev) {
      var t = ev.target;
      if (t.matches && t.matches("select[data-pv-policy]")) {
        var pp = providerById(t.getAttribute("data-pid"));
        if (pp) {
          var field = t.getAttribute("data-pv-policy");
          if (field === "install" && t.value === "Automatically when idle" && pp.updateState && pp.updateState.state === "update-available") {
            pp.updateState = { state: "waiting", availableVersion: pp.updateState.availableVersion, note: "Scheduled — installs when no requests are active" };
          }
          pp.updatePolicy[field] = t.value;
          saveProvider(pp);
          rerender();
        }
        return;
      }
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

  window.PMViews = {
    esc: esc, clone: clone, icon: icon,
    STATE_LABEL: STATE_LABEL, EXPOSURE_LABEL: EXPOSURE_LABEL, SCOPE_LABEL: SCOPE_LABEL,
    HEALTH: HEALTH, INSTALL_STATE: INSTALL_STATE, AUTH_MODEL: AUTH_MODEL,
    GROUP_LABEL: GROUP_LABEL, CAP_STATE: CAP_STATE, WHATNEXT: WHATNEXT,
    human: human,
    overrides: overrides, getOverride: getOverride, setOverride: setOverride, clearOverride: clearOverride,
    getError: getError, setError: setError, getChanged: getChanged, setChanged: setChanged,
    settingValue: settingValue, resolveState: resolveState, fmtValue: fmtValue,
    stateBadge: stateBadge, metaBadges: metaBadges, controlHtml: controlHtml, rowHtml: rowHtml, noticeHtml: noticeHtml,
    noticeCompactHtml: noticeCompactHtml, wireDrawer: wireDrawer,
    bindSettings: bindSettings, wireSearch: wireSearch, popMenu: popMenu, mountSpellcheck: mountSpellcheck,
    providers: providers, providerById: providerById, saveProvider: saveProvider,
    providerStatus: providerStatus, activeAccount: activeAccount, healthDot: healthDot,
    modelRowHtml: modelRowHtml, accountRowHtml: accountRowHtml,
    usageHtml: usageHtml, catalogHtml: catalogHtml, diagnosticsHtml: diagnosticsHtml,
    routingHtml: routingHtml,
    installationHtml: installationHtml, updatesHtml: updatesHtml,
    operationHtml: operationHtml, providerEnvBannerHtml: providerEnvBannerHtml,
    SHARED_KEY_DOMAINS: SHARED_KEY_DOMAINS,
    PROVIDER_SCENARIOS: PROVIDER_SCENARIOS, applyProviderScenario: applyProviderScenario,
    roleCandidates: roleCandidates, rolesHtml: rolesHtml, bindRoles: bindRoles,
    bindProviders: bindProviders, capabilityChip: capabilityChip
  };
})();
