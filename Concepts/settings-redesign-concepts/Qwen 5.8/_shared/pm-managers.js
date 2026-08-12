(function () {
  "use strict";

  function esc(x) {
    return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function ico(name, size) { return window.PMIcons.get(name, size || 14); }

  // Concept prefix: setPrefix("at-"|"dk-"|"lg-"|"sp-") before rendering so every
  // builder wrapper also carries a concept-specific class for styling.
  var _px = "";
  function setPrefix(p) { _px = p || ""; }
  function getPrefix() { return _px; }
  function cls(base) { return "pm-" + base + (_px ? " " + _px + base : ""); }

  // --- Small atoms ----------------------------------------------------------
  function badge(label, kind) {
    return '<span class="pm-badge pm-badge-' + esc(kind || "muted") + '">' + esc(label) + "</span>";
  }

  function badgesFor(s) {
    var meta = window.PMCore.settingMeta(s);
    return meta.badges.map(function (b) { return badge(b.label, b.kind); }).join("");
  }

  function updateStateChip(state) {
    var map = {
      "ready": ["Ready", "ok"],
      "update-available": ["Update available", "warn"],
      "updating": ["Updating", "info"],
      "verifying": ["Verifying", "info"],
      "verification-failed": ["Verification failed", "danger"],
      "rolled-back": ["Rolled back", "danger"],
      "needs-repair": ["Needs repair", "warn"],
      "managed-externally": ["Managed externally", "managed"],
      "scheduled-idle": ["Waiting for work to finish", "info"],
      "unknown-method": ["Could not identify installation method", "warn"]
    };
    var m = map[state] || [state || "n/a", "muted"];
    return '<span class="pm-badge pm-badge-' + m[1] + '" data-update-state="' + esc(state) + '">' + esc(m[0]) + "</span>";
  }

  function stateChip(state) {
    var map = {
      connected: ["Connected", "ok"], authenticated: ["Signed in", "ok"], ready: ["Ready", "ok"],
      "needs-setup": ["Needs setup", "warn"], "signed-out": ["Signed out", "warn"], "needs-auth": ["Needs auth", "warn"],
      "invocation-failed": ["Invocation failed", "danger"], "not-installed": ["Not installed", "muted"],
      error: ["Error", "danger"], disabled: ["Disabled", "muted"], "rate-limited": ["Rate limited", "warn"],
      cooling: ["Cooling down", "info"], "manual-only": ["Manual-only", "warn"], shadowed: ["Shadowed", "muted"],
      running: ["Running", "ok"], installed: ["Installed", "ok"], detected: ["Detected", "ok"],
      "not-found": ["Not found", "warn"], verified: ["Verified", "ok"], "license-check-failed": ["License check failed", "danger"],
      "format-invalid": ["Format invalid", "danger"], unavailable: ["Unavailable", "muted"], idle: ["Idle", "muted"]
    };
    var m = map[state] || [state || "n/a", "muted"];
    return '<span class="pm-badge pm-badge-' + m[1] + '" data-state-chip="' + esc(state) + '">' + esc(m[0]) + "</span>";
  }

  function secretField(kind, label) {
    var map = {
      "pm-owned": "PM-owned secret input — stored in the PM secret store, never shown raw",
      "vault-ref": "Secure vault/reference selector — the secret stays in your vault",
      "cli-owned": "CLI-owned authentication — the CLI holds this credential, PM never sees it",
      "pm-oauth": "PM-owned OAuth — token managed by Puppet Master",
      "env-backed": "Environment-backed secret — read from the environment at launch",
      "helper": "Command-helper/vault-backed secret",
      "plain": "Non-secret text"
    };
    return '<div class="pm-secret" data-secret-kind="' + esc(kind) + '">' + ico(kind === "cli-owned" ? "terminal" : kind === "env-backed" ? "code" : "key", 13) +
      '<span class="pm-secret-label">' + esc(label || "") + '</span><span class="pm-secret-kind">' + esc(map[kind] || kind) + "</span></div>";
  }

  // --- Setting row ------------------------------------------------------------
  function controlFor(s) {
    var dis = s.source === "managed" || s.source === "unavailable" || (window.PMCore && window.PMCore.isThemeLocked(s));
    var d = dis ? " disabled" : "";
    if (s.type === "toggle") {
      var on = s.value === true || s.value === "true";
      return '<button class="pm-toggle" data-setting="' + esc(s.id) + '" aria-pressed="' + on + '" aria-label="' + esc(s.label) + '"' + d + "></button>";
    }
    if (s.type === "select") {
      var opts = (s.options || []).map(function (o) {
        return '<option' + (o === s.value ? " selected" : "") + ">" + esc(o) + "</option>";
      }).join("");
      return '<select class="pm-select" data-setting="' + esc(s.id) + '"' + d + ">" + opts + "</select>";
    }
    if (s.type === "segment") {
      var btns = (s.options || []).map(function (o) {
        return '<button data-seg-value="' + esc(o) + '"' + (o === s.value ? ' class="active"' : "") + d + ">" + esc(o) + "</button>";
      }).join("");
      return '<span class="pm-seg" data-setting="' + esc(s.id) + '" role="group" aria-label="' + esc(s.label) + '">' + btns + "</span>";
    }
    if (s.type === "range") {
      return '<span class="pm-range-wrap"><input type="range" class="pm-range" data-setting="' + esc(s.id) + '" min="' + (s.min || 0) + '" max="' + (s.max || 100) + '" value="' + esc(s.value) + '"' + d + '><span class="pm-range-val">' + esc(s.value) + "%</span></span>";
    }
    if (s.type === "action") {
      var target = s.target ? ' data-nav-target=\'' + JSON.stringify(s.target).replace(/'/g, "&#39;") + "'" : "";
      return '<button class="pm-btn pm-btn-sm" data-act="setting.action" data-id="' + esc(s.id) + '"' + target + d + ">" + esc(s.actionLabel || "Do") + "</button>";
    }
    return '<span class="pm-textval">' + esc(s.value) + "</span>";
  }

  function settingRow(s) {
    var meta = window.PMCore.settingMeta(s);
    var detail =
      '<dl>' +
        "<dt>Scope</dt><dd>" + esc(s.scope) + "</dd>" +
        "<dt>Value state</dt><dd>" + esc(meta.sourceLabel) + "</dd>" +
        (s.reason ? "<dt>Reason</dt><dd>" + esc(s.reason) + "</dd>" : "") +
        (s.managedBy ? "<dt>Managed by</dt><dd>" + esc(s.managedBy) + "</dd>" : "") +
        (s.restart ? "<dt>Takes effect</dt><dd>After restart</dd>" : "") +
        (s.requested && s.effective && s.requested !== s.effective ? "<dt>Requested / Effective</dt><dd>" + esc(s.requested) + " / " + esc(s.effective) + (s.reason ? " — " + esc(s.reason) : "") + "</dd>" : "") +
      "</dl>";
    return '<div class="' + cls("set-row") + '" data-setting-row="' + esc(s.id) + '">' +
      '<div class="pm-set-main">' +
        '<div class="pm-set-label">' + esc(s.label) + "</div>" +
        '<div class="pm-set-desc">' + esc(s.desc) + "</div>" +
        (s.validationError ? '<div class="pm-set-error" role="alert">' + ico("alertCircle", 12) + " " + esc(s.validationError) + "</div>" : "") +
        '<div class="pm-set-badges">' + badgesFor(s) + "</div>" +
        (window.PMCore.isThemeLocked(s) ? '<div class="pm-set-lockline">' + ico("lock", 12) + " Requested: " + window.PMState.humanValue(s) + " · Effective: Off — " + esc(s.themeLocked) + "</div>" : "") +
      "</div>" +
      '<div class="pm-set-ctl">' + controlFor(s) +
        '<button class="pm-btn pm-btn-quiet pm-btn-sm pm-set-help" data-act="setting.help" data-id="' + esc(s.id) + '" aria-expanded="false" aria-label="Help for ' + esc(s.label) + '">' + ico("info", 13) + "</button>" +
        '<button class="pm-btn pm-btn-quiet pm-btn-sm pm-set-reset" data-act="setting.reset" data-id="' + esc(s.id) + '"' + (meta.disabled ? " disabled" : "") + '>Reset</button>' +
      "</div>" +
      '<div class="pm-set-detail">' + detail + "</div>" +
    "</div>";
  }

  // --- Manager shell --------------------------------------------------------------
  function managerShell(o) {
    return '<section class="' + cls("mgr") + '" data-manager="' + esc(o.id) + '" aria-label="' + esc(o.title) + '">' +
      '<header class="pm-mgr-head">' +
        '<div class="pm-mgr-title">' + ico(o.icon || "gear", 16) + "<b>" + esc(o.title) + "</b>" + (o.health ? '<span class="pm-mgr-health">' + esc(o.health) + "</span>" : "") + "</div>" +
        (o.add ? '<button class="pm-btn pm-btn-sm" data-act="' + esc(o.add.act) + '"' + (o.add.data || "") + ">" + ico("plus", 12) + " " + esc(o.add.label) + "</button>" : "") +
      "</header>" +
      '<div class="pm-mgr-body">' + (o.body || "") + "</div>" +
    "</section>";
  }

  function inspector(rows) {
    return '<div class="' + cls("inspect") + '">' + rows.map(function (r) {
      return '<div class="pm-inspect-row"><span class="pm-inspect-k">' + esc(r[0]) + '</span><span class="pm-inspect-v">' + esc(r[1]) + "</span></div>";
    }).join("") + "</div>";
  }

  function requestedEffective(rows) {
    return '<div class="' + cls("reqeff") + '" data-reqeff="1">' +
      '<div class="pm-reqeff-cap">Requested vs effective</div>' +
      rows.map(function (r) {
        var diff = r.requested !== r.effective;
        return '<div class="pm-reqeff-row' + (diff ? " differs" : "") + '">' +
          '<span class="pm-reqeff-label">' + esc(r.label) + "</span>" +
          '<span class="pm-reqeff-req">Requested: ' + esc(r.requested) + "</span>" +
          '<span class="pm-reqeff-eff">Effective: ' + esc(r.effective) + "</span>" +
          (r.reason ? '<span class="pm-reqeff-why">' + esc(r.reason) + "</span>" : "") +
        "</div>";
      }).join("") +
    "</div>";
  }

  // --- Provider family ---------------------------------------------------------------
  function installationCard(p, inst) {
    var rows = [
      ["Configured command", inst.command],
      ["Resolved launcher", inst.resolved],
      ["Installation method", inst.method],
      ["Owner", inst.owner],
      ["Confidence", inst.confidence],
      ["Host / Environment", (inst.host || "") + " · " + (inst.env || "")],
      ["Evidence", inst.evidence]
    ];
    var selBtn = inst.selected
      ? badge("Selected", "ok")
      : '<button class="pm-btn pm-btn-sm" data-act="provider.select-installation" data-provider="' + esc(p.id) + '" data-installation="' + esc(inst.id) + '">Select</button>';
    var stateNote = inst.state === "manual-only" ? badge("Manual-only — unknown ownership", "warn") : stateChip(inst.state);
    var receipts = (inst.receipts || []).map(function (r) { return '<div class="pm-log">' + esc(r) + "</div>"; }).join("");
    return '<div class="' + cls("install") + '" data-installation="' + esc(inst.id) + '">' +
      '<div class="pm-install-head"><b>' + esc(inst.label) + "</b>" + stateNote + selBtn + "</div>" +
      inspector(rows) +
      (receipts ? '<div class="pm-install-receipts">' + receipts + "</div>" : "") +
    "</div>";
  }

  function accountRow(p, a) {
    var prefBtn = a.preferred
      ? badge("Preferred", "ok")
      : '<button class="pm-btn pm-btn-sm" data-act="provider.account.prefer" data-provider="' + esc(p.id) + '" data-account="' + esc(a.id) + '">Prefer</button>';
    var usageLine = a.usage ? [a.usage.included, a.usage.remaining, a.usage.reset ? "Reset: " + a.usage.reset : null, "Pressure: " + (a.usage.pressure || "n/a")].filter(Boolean).join(" · ") : "n/a";
    return '<div class="' + cls("acct") + '" data-account="' + esc(a.id) + '">' +
      '<div class="pm-acct-head">' +
        '<b>' + esc(a.label) + (a.nickname ? ' <span class="pm-acct-nick">(' + esc(a.nickname) + ")</span>" : "") + "</b>" +
        stateChip(a.state) + prefBtn +
        '<button class="pm-btn pm-btn-quiet pm-btn-sm" data-act="provider.account.nickname" data-provider="' + esc(p.id) + '" data-account="' + esc(a.id) + '">Nickname</button>' +
        '<button class="pm-btn pm-btn-quiet pm-btn-sm" data-act="provider.account.sticky" data-provider="' + esc(p.id) + '" data-account="' + esc(a.id) + '">' + (a.sticky ? "Sticky: on" : "Sticky: off") + "</button>" +
        '<button class="pm-btn pm-btn-quiet pm-btn-sm" data-act="provider.account.enable" data-provider="' + esc(p.id) + '" data-account="' + esc(a.id) + '">' + (a.enabled ? "Disable" : "Enable") + "</button>" +
        '<span class="pm-acct-prio"><button class="pm-btn pm-btn-quiet pm-btn-sm" data-act="provider.account.up" data-provider="' + esc(p.id) + '" data-account="' + esc(a.id) + '" aria-label="Raise priority">↑</button><button class="pm-btn pm-btn-quiet pm-btn-sm" data-act="provider.account.down" data-provider="' + esc(p.id) + '" data-account="' + esc(a.id) + '" aria-label="Lower priority">↓</button><span class="pm-note">P' + (a.priority || 1) + "</span></span>" +
      "</div>" +
      '<div class="pm-acct-meta">' +
        "<span>Auth: " + esc(a.authKind) + " (" + esc(a.authOwner) + ")</span>" +
        "<span>Identity: " + esc(a.identity) + "</span>" +
        "<span>Isolation: " + esc(a.isolation) + "</span>" +
        "<span>Usage: " + esc(usageLine) + "</span>" +
        "<span>Last success: catalog " + esc(a.health ? a.health.catalog : "n/a") + " · generation " + esc(a.health ? a.health.generation : "n/a") + "</span>" +
        (a.probe ? '<span class="pm-probe pm-probe-' + esc(a.probe.result) + '">Probe: ' + esc(a.probe.detail) + "</span>" : "") +
      "</div>" +
      secretField(a.authKind === "PM-direct OAuth" ? "pm-oauth" : a.authKind === "API credential" ? "pm-owned" : a.authKind === "Keyless local server" || a.authKind === "Server-managed session" ? "plain" : "cli-owned", "Credential handling") +
    "</div>";
  }

  function modelRow(p, m) {
    var free = m.freeState ? badge(freeStateLabel(m.freeState), freeStateKind(m.freeState)) : "";
    return '<div class="' + cls("model") + '" data-model="' + esc(m.id) + '">' +
      '<div class="pm-model-head">' +
        '<button class="pm-btn pm-btn-quiet pm-btn-sm pm-model-fav' + (m.favorite ? " on" : "") + '" data-act="provider.model.favorite" data-provider="' + esc(p.id) + '" data-model="' + esc(m.id) + '" aria-pressed="' + !!m.favorite + '" aria-label="Favorite ' + esc(m.name) + '">' + ico("star", 13) + "</button>" +
        '<span class="pm-model-name">' + esc(m.name) + "</span>" +
        (m.alias ? '<span class="pm-model-alias">' + esc(m.alias) + "</span>" : "") +
        free +
        (m.hidden ? badge("Hidden", "muted") : "") +
        (m.reason ? badge("Evidence limited", "warn") : "") +
        '<span class="pm-model-tools">' +
          '<button class="pm-btn pm-btn-quiet pm-btn-sm" data-act="provider.model.alias" data-provider="' + esc(p.id) + '" data-model="' + esc(m.id) + '">Alias</button>' +
          '<button class="pm-btn pm-btn-quiet pm-btn-sm" data-act="provider.model.hide" data-provider="' + esc(p.id) + '" data-model="' + esc(m.id) + '">' + (m.hidden ? "Show" : "Hide") + "</button>" +
          '<button class="pm-btn pm-btn-quiet pm-btn-sm" data-act="provider.model.up" data-provider="' + esc(p.id) + '" data-model="' + esc(m.id) + '" aria-label="Raise priority">↑</button>' +
          '<button class="pm-btn pm-btn-quiet pm-btn-sm" data-act="provider.model.down" data-provider="' + esc(p.id) + '" data-model="' + esc(m.id) + '" aria-label="Lower priority">↓</button>' +
          '<span class="pm-note">P' + m.priority + "</span>" +
        "</span>" +
      "</div>" +
      '<div class="pm-model-meta">' +
        (m.effort && m.effort.length ? "<span>Effort: " + esc(m.effort.join(", ")) + "</span>" : "<span>Effort: not exposed</span>") +
        "<span>" + (m.fast ? "Fast variant: yes (evidence-backed)" : "Fast variant: no") + "</span>" +
        "<span>In: " + esc(m.modalities.in.join(", ")) + " · Out: " + esc(m.modalities.out.join(", ")) + "</span>" +
        "<span>Context: " + esc(m.context) + "</span>" +
        "<span>Tools: " + (m.tools ? "yes" : "no") + " · MCP: " + (m.mcp ? "yes" : "no") + " · Structured: " + (m.structured ? "yes" : "no") + "</span>" +
        "<span>Evidence: " + esc(m.evidence) + "</span>" +
        (m.reason ? '<span class="pm-model-reason">' + esc(m.reason) + "</span>" : "") +
      "</div>" +
    "</div>";
  }

  function freeStateLabel(s) {
    return { ready: "Ready", "needs-setup": "Needs setup", "cooling-down": "Cooling down", "no-longer-free": "No longer free", "no-longer-available": "No longer available", unverified: "Unverified" }[s] || s;
  }
  function freeStateKind(s) {
    return { ready: "ok", "needs-setup": "warn", "cooling-down": "info", "no-longer-free": "warn", "no-longer-available": "muted", unverified: "warn" }[s] || "muted";
  }

  // Provider family card with tabs answering the six default questions.
  function providerFamilyCard(p) {
    var tabs = [
      ["overview", "Overview"], ["accounts", "Accounts & Models"], ["plans", "Plans & Limits"],
      ["routing", "Routing"], ["install", "Installation & Updates"], ["advanced", "Advanced"]
    ];
    var connectedAccount = null;
    p.accounts.forEach(function (a) { if (a.preferred) connectedAccount = a; });
    var overview = inspector([
      ["Is it connected?", p.stateLabel],
      ["Which account/connection will PM use?", connectedAccount ? connectedAccount.label : (p.accounts.length ? p.accounts[0].label : "None — needs setup or install")],
      ["What is included?", connectedAccount && connectedAccount.usage ? connectedAccount.usage.included : "n/a"],
      ["What happens when included usage ends?", (connectedAccount && connectedAccount.continuationOptions ? connectedAccount.continuationOptions[0] : "Continuation unset") + " (see Continuation settings)"],
      ["Which models are available?", p.models.length + " model" + (p.models.length === 1 ? "" : "s") + " listed"],
      ["Does anything need setup or repair?", setupAnswer(p)]
    ]);

    var accountsHtml = p.accounts.length
      ? p.accounts.map(function (a) { return accountRow(p, a); }).join("")
      : '<div class="pm-empty">No accounts yet. ' + (p.login ? esc(p.login.note) : p.install ? "Install first, then sign in." : "") + "</div>";
    var modelsHtml = p.models.length
      ? p.models.map(function (m) { return modelRow(p, m); }).join("")
      : '<div class="pm-empty">Models appear after the provider is installed and connected.</div>';

    var plansHtml = p.accounts.length
      ? inspector(p.accounts.map(function (a) { return [a.label, a.usage ? [a.usage.included, a.usage.remaining ? "remaining: " + a.usage.remaining : null, a.usage.reset ? "reset: " + a.usage.reset : null].filter(Boolean).join(" · ") : "n/a"]; }))
      : '<div class="pm-empty">No plan information without a connected account.</div>';

    var rolesForProvider = window.PMState.state.roles.filter(function (r) { return r.provider && r.provider.indexOf(p.name.split(" ")[0]) >= 0; });
    var routingHtml = rolesForProvider.length
      ? requestedEffective(rolesForProvider.map(function (r) { return { label: r.label, requested: r.requested, effective: r.effective, reason: r.note }; }))
      : '<div class="pm-empty">No agent roles currently route through this provider.</div>';

    var installHtml = "";
    if (p.install) {
      installHtml = '<div class="pm-install-card" data-install-card="' + esc(p.id) + '">' +
        '<div class="pm-install-head"><b>Explicit Install</b>' + badge("Not bundled", "muted") + "</div>" +
        '<div class="pm-install-note">' + esc(p.install.note) + "</div>" +
        inspector([
          ["Official source", p.install.officialSource || "Official provider channel"],
          ["Host / Environment", (p.install.host || "") + " · " + (p.install.env || "")],
          ["Acquisition policy", "Explicit user-triggered only; never silent, never pre-seeded"]
        ]) +
        '<button class="pm-btn pm-btn-primary pm-btn-sm" data-act="provider.install" data-provider="' + esc(p.id) + '">' + ico("download", 12) + " Install " + esc(p.name) + "</button>" +
      "</div>";
    }
    installHtml += (p.installations || []).map(function (i) { return installationCard(p, i); }).join("");
    if (!p.installations || !p.installations.length) {
      if (!p.install) installHtml += '<div class="pm-empty">No installations discovered on this host.</div>';
    }
    installHtml += '<div class="pm-update-block">' +
      '<div class="pm-update-row"><span class="pm-update-label">Update state</span>' + updateStateChip(p.updateState) + (p._phase ? '<span class="pm-spinner" data-spinner="1" aria-label="Working"></span>' : "") + "</div>" +
      (p.updateDetail ? '<div class="pm-note">' + esc(p.updateDetail.from || "") + (p.updateDetail.to ? " → " + esc(p.updateDetail.to) : "") + " — " + esc(p.updateDetail.note || "") + "</div>" : "") +
      inspector([
        ["Check for provider updates", p.updatePolicy.check],
        ["Install provider updates", p.updatePolicy.install],
        ["Version policy", p.updatePolicy.version],
        ["Roll back after failed verification", p.updatePolicy.rollback]
      ]) +
      '<div class="pm-mgr-actions">' +
        '<button class="pm-btn pm-btn-sm" data-act="provider.check-update" data-provider="' + esc(p.id) + '">Check for updates</button>' +
        (p.updateState === "update-available" ? '<button class="pm-btn pm-btn-primary pm-btn-sm" data-act="provider.apply-update" data-provider="' + esc(p.id) + '">Update now</button><button class="pm-btn pm-btn-sm" data-act="provider.apply-update" data-provider="' + esc(p.id) + '" data-fail="1" title="Demo the verification-failed path">Simulate failed verification</button>' : "") +
        (p.updateState === "rolled-back" ? '<button class="pm-btn pm-btn-sm" data-act="provider.apply-update" data-provider="' + esc(p.id) + '">Retry update</button>' : "") +
        '<button class="pm-btn pm-btn-sm" data-act="provider.repair" data-provider="' + esc(p.id) + '">Repair</button>' +
      "</div>" +
    "</div>";

    var advancedHtml = inspector([
      ["Provider family", p.name],
      ["Connection group", p.group],
      ["Auth boundary", authBoundary(p)],
      ["Agent assignments", "Roles consume candidates but stay separate from accounts and installations"]
    ]) + '<div class="pm-mgr-actions">' +
      '<button class="pm-btn pm-btn-sm" data-act="provider.diagnostics" data-provider="' + esc(p.id) + '">Diagnostics</button>' +
      '<button class="pm-btn pm-btn-sm" data-act="provider.probe" data-provider="' + esc(p.id) + '">Readiness probe</button>' +
      (p.login ? '<button class="pm-btn pm-btn-primary pm-btn-sm" data-act="provider.login" data-provider="' + esc(p.id) + '">Sign in (native flow)</button>' : "") +
      (p.state === "signed-out" ? '<button class="pm-btn pm-btn-sm" data-act="provider.rescan" data-provider="' + esc(p.id) + '">Rescan installations</button>' : "") +
    "</div>";

    return '<div class="' + cls("provider") + '" data-provider-card="' + esc(p.id) + '">' +
      '<header class="pm-provider-head">' +
        '<div class="pm-provider-title"><b>' + esc(p.name) + "</b>" + stateChip(p.state) + '<span class="pm-note">' + esc(p.stateLabel) + "</span></div>" +
        '<div class="pm-provider-group">' + badge(p.group, "muted") + "</div>" +
      "</header>" +
      '<nav class="pm-provider-tabs" role="tablist" aria-label="' + esc(p.name) + ' sections">' +
        tabs.map(function (t, i) {
          return '<button role="tab" data-ptab="' + t[0] + '"' + (i === 0 ? ' aria-selected="true" class="active"' : ' aria-selected="false"') + ">" + t[1] + "</button>";
        }).join("") +
      "</nav>" +
      '<div class="pm-provider-pane" data-pane="overview">' + overview + (p.setup ? setupFlow(p) : "") + "</div>" +
      '<div class="pm-provider-pane" data-pane="accounts" hidden>' + accountsHtml + '<div class="pm-provider-models-cap">Models</div>' + modelsHtml + "</div>" +
      '<div class="pm-provider-pane" data-pane="plans" hidden>' + plansHtml + "</div>" +
      '<div class="pm-provider-pane" data-pane="routing" hidden>' + routingHtml + "</div>" +
      '<div class="pm-provider-pane" data-pane="install" hidden>' + installHtml + "</div>" +
      '<div class="pm-provider-pane" data-pane="advanced" hidden>' + advancedHtml + "</div>" +
    "</div>";
  }

  function setupAnswer(p) {
    if (p.state === "not-installed") return "Yes — explicit install available";
    if (p.state === "signed-out") return "Yes — sign-in required";
    if (p.state === "needs-setup") return "Yes — setup steps remain";
    if (p.state === "invocation-failed") return "Yes — probe failing; usage details unavailable";
    return "No";
  }

  function authBoundary(p) {
    if (p.id === "openai") return "PM-direct OAuth supported";
    if (p.id === "anthropic-api") return "API connections stay separate from subscription products";
    if (p.id === "anthropic") return "Claude CLI OAuth is CLI-owned; PM isolates profiles and launches the native flow";
    if (p.id === "antigravity") return "Antigravity CLI OAuth is CLI-owned";
    if (p.id === "opencode" || p.id === "local-server") return "Server connection; PM connects as a client";
    return "CLI-owned authentication";
  }

  function setupFlow(p) {
    if (!p.setup) return "";
    return '<div class="pm-setup" data-setup="' + esc(p.id) + '">' +
      '<div class="pm-setup-cap">Setup steps</div>' +
      "<ol>" + p.setup.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" +
      '<div class="pm-note">' + esc(p.setup.note) + "</div>" +
    "</div>";
  }

  // --- Permission rule editor -----------------------------------------------------
  function permissionRuleEditor() {
    var rules = window.PMState.state.collections.permissionRules.slice().sort(function (a, b) { return a.order - b.order; });
    var rows = rules.map(function (r) {
      return '<div class="pm-rule" data-rule="' + esc(r.id) + '">' +
        '<span class="pm-rule-order">' + r.order + "</span>" +
        '<code class="pm-rule-match">' + esc(r.match) + "</code>" +
        badge(r.effect, r.effect === "Allow" ? "ok" : r.effect === "Deny" ? "danger" : "info") +
        '<span class="pm-rule-note">' + esc(r.note) + ' <span class="pm-note">(' + esc(r.origin) + ")</span></span>" +
        (r.conflictsWith ? badge("Conflicts", "warn") : "") +
        '<span class="pm-rule-actions">' +
          '<button class="pm-btn pm-btn-quiet pm-btn-sm" data-act="rule.up" data-rule="' + esc(r.id) + '" aria-label="Move rule up">↑</button>' +
          '<button class="pm-btn pm-btn-quiet pm-btn-sm" data-act="rule.down" data-rule="' + esc(r.id) + '" aria-label="Move rule down">↓</button>' +
          '<button class="pm-btn pm-btn-quiet pm-btn-sm pm-btn-danger" data-act="rule.delete" data-rule="' + esc(r.id) + '">Delete</button>' +
        "</span>" +
      "</div>";
    }).join("");
    return '<div class="' + cls("rules") + '" data-rules="1">' +
      '<div class="pm-note pm-rules-note">Ordered top to bottom — the last matching rule wins. Wildcards: * (one path segment), ** (any depth).</div>' +
      rows +
      '<div class="pm-rule-add">' +
        '<input class="pm-input" data-rule-match placeholder="Match pattern, e.g. docs/**">' +
        '<select class="pm-select" data-rule-effect><option>Allow</option><option>Ask for approval</option><option>Deny</option></select>' +
        '<button class="pm-btn pm-btn-sm" data-act="rule.add">Add rule</button>' +
      "</div>" +
      '<div class="pm-trace">' +
        '<input class="pm-input" data-trace-path placeholder="Trace a path, e.g. scripts/pm-shard-plans.py">' +
        '<button class="pm-btn pm-btn-primary pm-btn-sm" data-act="rule.trace">Trace</button>' +
        '<div class="pm-trace-result" data-trace-result aria-live="polite"></div>' +
      "</div>" +
    "</div>";
  }

  // --- Sound library ------------------------------------------------------------------
  function soundLibraryPanel() {
    var lib = window.PMState.state.collections.soundLibrary;
    var packs = window.PMState.state.collections.soundPacks;
    var events = lib.events.map(function (e) {
      return '<div class="pm-sound-row" data-sound="' + esc(e.id) + '">' +
        '<span class="pm-sound-event">' + esc(e.event) + "</span>" +
        '<span class="pm-sound-name">' + esc(e.sound) + "</span>" +
        '<span class="pm-note">' + esc(e.source) + " · " + esc(e.license) + " · v" + esc(e.version) + " · " + esc(e.duration) + " · #" + esc(e.hash) + "</span>" +
        '<button class="pm-btn pm-btn-quiet pm-btn-sm" data-act="sound.preview" data-sound="' + esc(e.id) + '">Preview</button>' +
      "</div>";
    }).join("");
    var uploads = lib.uploads.length ? lib.uploads.map(function (u) {
      return '<div class="pm-sound-row pm-sound-upload" data-upload="' + esc(u.id) + '">' +
        '<span class="pm-sound-event">' + esc(u.name) + "</span>" +
        '<span class="pm-sound-name">' + esc(u.mappedTo) + "</span>" +
        '<span class="pm-note">Uploaded ' + esc(u.uploaded) + " · " + esc(u.duration) + " · #" + esc(u.hash) + "</span>" +
        '<button class="pm-btn pm-btn-quiet pm-btn-sm" data-act="sound.preview" data-sound="' + esc(u.id) + '">Preview</button>' +
        '<button class="pm-btn pm-btn-quiet pm-btn-sm pm-btn-danger" data-act="sound.delete" data-sound="' + esc(u.id) + '">Delete</button>' +
      "</div>";
    }).join("") : '<div class="pm-empty">No uploaded sounds yet.</div>';
    var packRows = packs.map(function (pk) {
      return '<div class="pm-pack" data-pack="' + esc(pk.id) + '">' +
        '<b>' + esc(pk.name) + "</b>" + stateChip(pk.state) +
        '<span class="pm-note">' + esc(pk.format) + " · " + esc(pk.license) + " · " + pk.sounds + " sounds</span>" +
        (pk.note ? '<div class="pm-note pm-pack-note">' + esc(pk.note) + "</div>" : "") +
        (pk.imported ? badge("Imported", "ok") : '<button class="pm-btn pm-btn-sm" data-act="pack.import" data-pack="' + esc(pk.id) + '">Import</button>') +
      "</div>";
    }).join("");
    return '<div class="' + cls("sounds") + '">' +
      '<div class="pm-sound-cap">Built-in events (' + lib.events.length + ")</div>" + events +
      '<div class="pm-sound-cap">Uploaded sounds</div>' + uploads +
      '<div class="pm-mgr-actions"><button class="pm-btn pm-btn-sm" data-act="sound.upload">Upload sound</button><button class="pm-btn pm-btn-sm" data-act="sound.export">Export library</button></div>' +
      '<div class="pm-sound-cap">Imported packs</div>' + packRows +
      '<div class="pm-note">Preview is local-only. Test-send is explicit, masked, and rate-limited. Sound is never the only indication of failure, blocked work, approval, or completion.</div>' +
    "</div>";
  }

  // --- Destination form -----------------------------------------------------------------
  function destinationForm() {
    return '<div class="' + cls("dest-form") + '" data-dest-form="1">' +
      '<div class="pm-form-grid">' +
        '<label>Name<input class="pm-input" data-field="name" placeholder="e.g. Ops webhook"></label>' +
        '<label>Kind<select class="pm-select" data-field="kind"><option>webhook</option><option>push</option><option>chat</option><option>system</option></select></label>' +
        '<label>Channel / thread<input class="pm-input" data-field="channel" placeholder="#channel or topic"></label>' +
        '<label>Mentions<input class="pm-input" data-field="mentions" placeholder="@who on failures"></label>' +
        '<label>Template<input class="pm-input" data-field="template" placeholder="Compact card"></label>' +
        '<label>Success predicate<input class="pm-input" data-field="successPredicate" placeholder="HTTP 2xx"></label>' +
        '<label>Retry<input class="pm-input" data-field="retry" placeholder="3 × exponential"></label>' +
      "</div>" +
      '<div class="pm-mgr-actions"><button class="pm-btn pm-btn-primary pm-btn-sm" data-act="dest.save">Save destination</button></div>' +
    "</div>";
  }

  // --- Theme preview card ------------------------------------------------------------------
  function themePreviewCard(t) {
    var isCustom = t && t.base;
    var chips = ["--bg", "--surface", "--accent", "--text-1", "--border"].map(function (tok) {
      return '<span class="pm-theme-swatch" style="background: var(' + tok + ')"></span>';
    }).join("");
    return '<div class="' + cls("theme-card") + '" data-theme-card="' + esc(isCustom ? t.name : t) + '">' +
      '<div class="pm-theme-chips">' + chips + "</div>" +
      '<div class="pm-theme-name">' + esc(isCustom ? t.name : t.split("-").map(function (w) { return w[0].toUpperCase() + w.slice(1); }).join(" ")) + "</div>" +
      (isCustom ? '<div class="pm-note">Base: ' + esc(t.base) + " · " + esc(t.state === "valid" ? "valid TOML" : "schema-invalid") + "</div>" : "") +
    "</div>";
  }

  // --- Import preview dialog ------------------------------------------------------------------
  function importPreviewBody(fx) {
    var conflicts = fx.conflicts.map(function (c) {
      return '<tr><td><code>' + esc(c.key) + "</code></td><td>" + esc(c.current) + "</td><td>" + esc(c.incoming) + "</td>" +
        '<td><select class="pm-select pm-select-sm" data-conflict="' + esc(c.key) + '"><option>Keep current</option><option>Take incoming</option></select></td></tr>';
    }).join("");
    var legacy = fx.legacy.map(function (l) {
      return '<div class="pm-legacy-row"><code>' + esc(l.key) + "</code> — " + esc(l.note) + " → <b>" + esc(l.action) + "</b></div>";
    }).join("");
    return '<div class="' + cls("import-preview") + '" data-import-preview="1">' +
      '<div class="pm-note">' + esc(fx.source) + "</div>" +
      '<table class="pm-table"><thead><tr><th>Key</th><th>Current</th><th>Incoming</th><th>Resolution</th></tr></thead><tbody>' + conflicts + "</tbody></table>" +
      '<div class="pm-legacy-cap">Legacy-key migration</div>' + legacy +
      '<div class="pm-note">Merge or replace, validation, and restart/reconnect planning are disclosed before apply. Rollback to the pre-import snapshot stays available.</div>' +
    "</div>";
  }

  // Generic resource list: shared-grammar managers compose list + inspector from this.
  function resourceList(items, opts) {
    var o = opts || {};
    var rows = (items || []).map(function (it) {
      return '<div class="' + cls("resitem") + '" data-res-id="' + esc(it.id || it.name) + '">' +
        '<div class="' + cls("resitem-main") + '"><b>' + esc(it.title || it.name) + "</b>" +
        (it.chip ? stateChip(it.chip) : "") +
        (it.badges ? it.badges.map(function (b) { return badge(b[0], b[1]); }).join("") : "") + "</div>" +
        (it.sub ? '<div class="pm-note">' + esc(it.sub) + "</div>" : "") +
        (it.actions ? '<div class="' + cls("resitem-actions") + '">' + it.actions + "</div>" : "") +
      "</div>";
    }).join("");
    return '<div class="' + cls("reslist") + '"' + (o.label ? ' aria-label="' + esc(o.label) + '"' : "") + ">" +
      (rows || '<div class="pm-empty">' + esc(o.empty || "Nothing here yet.") + "</div>") + "</div>";
  }

  // --- Modal -----------------------------------------------------------------------------------
  var modalHost = null;
  function closeModal() {
    if (modalHost && modalHost.parentNode) modalHost.parentNode.removeChild(modalHost);
    modalHost = null;
  }
  function modal(title, bodyHtml, buttons) {
    closeModal();
    modalHost = document.createElement("div");
    modalHost.className = "pm-dialog-overlay";
    modalHost.innerHTML = '<div class="pm-dialog pm-dialog-wide" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      '<div class="pm-dialog-title">' + esc(title) + "</div>" +
      '<div class="pm-dialog-body">' + bodyHtml + "</div>" +
      '<div class="pm-dialog-actions"></div>' +
    "</div>";
    var acts = modalHost.querySelector(".pm-dialog-actions");
    (buttons || [{ label: "Close" }]).forEach(function (b) {
      var btn = document.createElement("button");
      btn.className = "pm-btn pm-btn-sm" + (b.primary ? " pm-btn-primary" : "") + (b.danger ? " pm-btn-danger" : "");
      btn.textContent = b.label;
      btn.addEventListener("click", function () {
        var keep = b.onClick ? b.onClick(modalHost) : false;
        if (keep !== true) closeModal();
      });
      acts.appendChild(btn);
    });
    modalHost.addEventListener("click", function (e) { if (e.target === modalHost) closeModal(); });
    modalHost.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
    document.body.appendChild(modalHost);
    var focusable = modalHost.querySelector("button, input, select");
    if (focusable) focusable.focus();
    return modalHost;
  }

  // --- Delegated action dispatcher --------------------------------------------------------------
  function findCtx(el) {
    var ctx = {};
    var n = el;
    while (n && n !== document.body) {
      if (!ctx.provider && n.getAttribute && n.getAttribute("data-provider")) ctx.provider = n.getAttribute("data-provider");
      if (!ctx.account && n.getAttribute && n.getAttribute("data-account")) ctx.account = n.getAttribute("data-account");
      if (!ctx.model && n.getAttribute && n.getAttribute("data-model")) ctx.model = n.getAttribute("data-model");
      if (!ctx.installation && n.getAttribute && n.getAttribute("data-installation")) ctx.installation = n.getAttribute("data-installation");
      if (!ctx.rule && n.getAttribute && n.getAttribute("data-rule")) ctx.rule = n.getAttribute("data-rule");
      if (!ctx.sound && n.getAttribute && n.getAttribute("data-sound")) ctx.sound = n.getAttribute("data-sound");
      if (!ctx.pack && n.getAttribute && n.getAttribute("data-pack")) ctx.pack = n.getAttribute("data-pack");
      n = n.parentNode;
    }
    return ctx;
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-act]") : null;
    if (!el) return;
    var act = el.getAttribute("data-act");
    var ctx = findCtx(el);
    var ST = window.PMState;

    switch (act) {
      case "setting.reset": ST.resetSetting(el.getAttribute("data-id")); break;
      case "setting.help": {
        var s = ST.getSetting(el.getAttribute("data-id"));
        var row = el.closest("[data-setting-row]");
        if (row) {
          var open = row.classList.toggle("open");
          el.setAttribute("aria-expanded", open ? "true" : "false");
        }
        if (s) ST.receipt("Help: " + s.label, s.desc + (s.reason ? " Reason: " + s.reason : "") + (s.restart ? " Takes effect after restart." : ""), "info");
        break;
      }
      case "setting.action": {
        var st = ST.getSetting(el.getAttribute("data-id"));
        var navTarget = el.getAttribute("data-nav-target");
        if (navTarget) {
          var t = JSON.parse(navTarget);
          var view = { name: "workspace", category: t.category };
          if (t.subcategory) view.subcategory = t.subcategory;
          if (t.manager) view.manager = t.manager;
          ST.navigate(view);
        } else if (st) {
          ST.receipt(st.label, "Action acknowledged. Simulated in this concept.", "sim");
        }
        break;
      }
      case "catalog.refresh": ST.refreshCatalog(el.getAttribute("data-catalog")); break;
      case "provider.install": ST.installProvider(ctx.provider); break;
      case "provider.check-update": ST.checkUpdate(ctx.provider); break;
      case "provider.apply-update": ST.applyUpdate(ctx.provider, { fail: el.getAttribute("data-fail") === "1" }); break;
      case "provider.repair": ST.repairInstallation(ctx.provider); break;
      case "provider.select-installation": ST.selectInstallation(ctx.provider, el.getAttribute("data-installation")); break;
      case "provider.diagnostics": ST.providerAction(ctx.provider, "diagnostics"); break;
      case "provider.probe": ST.providerAction(ctx.provider, "probe"); break;
      case "provider.login": ST.providerAction(ctx.provider, "login"); break;
      case "provider.rescan": ST.providerAction(ctx.provider, "rescan"); break;
      case "provider.account.prefer": ST.setPreferredAccount(ctx.provider, ctx.account); break;
      case "provider.account.nickname": {
        var acc = ST.accountById(ctx.provider, ctx.account);
        window.PMCore.promptDialog("Nickname for " + (acc ? acc.label : "account"), acc ? acc.nickname : "", function (v) {
          ST.setAccountNickname(ctx.provider, ctx.account, v);
        });
        break;
      }
      case "provider.account.sticky": { var a1 = ST.accountById(ctx.provider, ctx.account); if (a1) ST.setAccountSticky(ctx.provider, ctx.account, !a1.sticky); break; }
      case "provider.account.enable": { var a2 = ST.accountById(ctx.provider, ctx.account); if (a2) ST.setAccountEnabled(ctx.provider, ctx.account, !a2.enabled); break; }
      case "provider.account.up": ST.moveAccountPriority(ctx.provider, ctx.account, -1); break;
      case "provider.account.down": ST.moveAccountPriority(ctx.provider, ctx.account, 1); break;
      case "provider.model.favorite": ST.toggleFavorite(ctx.provider, ctx.model); break;
      case "provider.model.alias": {
        var prov = ST.providerById(ctx.provider);
        var mod = null;
        if (prov) prov.models.forEach(function (m) { if (m.id === ctx.model) mod = m; });
        window.PMCore.promptDialog("Alias for " + (mod ? mod.name : "model"), mod ? mod.alias : "", function (v) {
          ST.setAlias(ctx.provider, ctx.model, v);
        });
        break;
      }
      case "provider.model.hide": ST.toggleHidden(ctx.provider, ctx.model); break;
      case "provider.model.up": ST.movePriority(ctx.provider, ctx.model, -1); break;
      case "provider.model.down": ST.movePriority(ctx.provider, ctx.model, 1); break;
      case "dest.test": ST.testDestination(el.getAttribute("data-dest")); break;
      case "dest.toggle": {
        var d1 = null;
        ST.state.collections.notificationDestinations.forEach(function (x) { if (x.id === el.getAttribute("data-dest")) d1 = x; });
        if (d1) ST.toggleDestination(d1.id, !d1.enabled);
        break;
      }
      case "dest.delete": ST.deleteDestination(el.getAttribute("data-dest")); break;
      case "dest.save": {
        var form = el.closest("[data-dest-form]");
        var dest = {};
        form.querySelectorAll("[data-field]").forEach(function (f) { dest[f.getAttribute("data-field")] = f.value.trim(); });
        if (!dest.name) { ST.receipt("Destination needs a name", "Give the destination a human name first.", "blocked"); break; }
        dest.fields = { thread: dest.channel || "n/a", mentions: dest.mentions || "None", template: dest.template || "Default", successPredicate: dest.successPredicate || "Delivery acknowledged", retry: dest.retry || "3 × exponential" };
        dest.channel = dest.channel || "n/a";
        ST.addDestination(dest);
        break;
      }
      case "sound.upload": {
        window.PMCore.promptDialog("Upload a sound file name", "my-alert.wav", function (v) {
          if (v) ST.uploadSound(v);
        });
        break;
      }
      case "sound.preview": ST.previewSound(ctx.sound || el.getAttribute("data-sound")); break;
      case "sound.delete": ST.deleteSound(el.getAttribute("data-sound")); break;
      case "sound.export": ST.receipt("Sound library exported", "Mappings, uploads, and pack references written to a portable file. Simulated.", "sim"); break;
      case "pack.import": ST.importPack(el.getAttribute("data-pack")); break;
      case "rule.add": {
        var scope = el.closest("[data-rules]");
        var match = scope.querySelector("[data-rule-match]").value.trim();
        var effect = scope.querySelector("[data-rule-effect]").value;
        if (!match) { ST.receipt("Rule needs a pattern", "Use * or ** wildcards, e.g. docs/**.", "blocked"); break; }
        ST.addPermissionRule(match, effect, "Custom rule");
        break;
      }
      case "rule.up": ST.reorderPermissionRule(el.getAttribute("data-rule"), -1); break;
      case "rule.down": ST.reorderPermissionRule(el.getAttribute("data-rule"), 1); break;
      case "rule.delete": ST.deletePermissionRule(el.getAttribute("data-rule")); break;
      case "rule.trace": {
        var scope2 = el.closest("[data-rules]");
        var path = scope2.querySelector("[data-trace-path]").value.trim();
        if (!path) { ST.receipt("Trace needs a path", "Type a path like scripts/pm-shard-plans.py.", "blocked"); break; }
        var res = ST.testPermissionTrace(path);
        var out = scope2.querySelector("[data-trace-result]");
        out.innerHTML = '<div class="pm-trace-verdict">' + esc(res.verdict) + "</div>" +
          res.steps.map(function (s) {
            return '<div class="pm-trace-step' + (s.hit ? " hit" : "") + '">#' + s.rule.order + " " + esc(s.rule.match) + " → " + esc(s.rule.effect) + (s.hit ? " · matched" : "") + "</div>";
          }).join("");
        break;
      }
      case "formatter.test": ST.runFormatterTest(el.getAttribute("data-formatter")); break;
      case "command.dryrun": ST.dryRunCommand(el.getAttribute("data-command")); break;
      case "shortcut.resolve": ST.resolveShortcutConflict(el.getAttribute("data-binding")); break;
      case "backup.now": ST.backupNow(el.getAttribute("data-backup") || "bk-settings"); break;
      case "backup.test-restore": ST.testRestore(); break;
      case "backup.log": ST.receipt("Backup log opened", "Four backup classes with runs, schedules, and verification state. Simulated.", "sim"); break;
      case "lifecycle.export": ST.exportSettings(); break;
      case "lifecycle.import-preview": {
        var fx = ST.importPreview();
        modal("Import preview — " + fx.fileName, importPreviewBody(fx), [
          { label: "Cancel" },
          { label: "Apply import", primary: true, onClick: function (host) {
            var resolutions = [];
            host.querySelectorAll("[data-conflict]").forEach(function (sel) {
              resolutions.push({ key: sel.getAttribute("data-conflict"), resolution: sel.value });
            });
            ST.importApply(resolutions);
            return false;
          } }
        ]);
        break;
      }
      case "lifecycle.import-rollback": ST.importRollback(); break;
      case "lifecycle.copy-from": ST.copySettingsFrom("ConceptHub"); break;
      case "lifecycle.reset-preview": ST.resetAll("preview"); break;
      case "lifecycle.reset-apply": ST.resetAll("apply"); break;
      case "index.rebuild": ST.rebuildIndex(); break;
      case "cleanup.dryrun": {
        ST.cleanupDryRun();
        var rows = window.PMDemoData.cleanupDryRun.map(function (r) {
          return '<div class="pm-cleanup-row">' + esc(r.what) + " — " + esc(r.size) + (r.safe ? badge("Safe", "ok") : badge("Protected", "warn")) + '<div class="pm-note">' + esc(r.note) + "</div></div>";
        }).join("");
        modal("Cleanup dry run", rows, [
          { label: "Cancel" },
          { label: "Clean safe items", primary: true, onClick: function () { ST.cleanupApply(["cl-1", "cl-2"]); return false; } }
        ]);
        break;
      }
      case "teacher.explain": ST.teacherExplain(el.getAttribute("data-teacher")); break;
      case "notice.dismiss": ST.dismissNotice(el.getAttribute("data-notice")); break;
      case "demo.reset": ST.resetDemo(); break;
    }
  });

  // Change events: settings controls + segment buttons.
  document.addEventListener("change", function (e) {
    var el = e.target;
    var id = el.getAttribute && el.getAttribute("data-setting");
    if (!id) return;
    var v = el.value;
    if (el.type === "range") v = String(el.value);
    window.PMState.setSettingValue(id, v);
  });

  // Toggles are buttons — handle clicks directly (no change event fires).
  document.addEventListener("click", function (e) {
    var tg = e.target.closest ? e.target.closest(".pm-toggle") : null;
    if (!tg || tg.disabled) return;
    var id = tg.getAttribute("data-setting");
    if (!id) return;
    var next = tg.getAttribute("aria-pressed") !== "true";
    tg.setAttribute("aria-pressed", String(next));
    window.PMState.setSettingValue(id, next);
  });

  document.addEventListener("click", function (e) {
    var seg = e.target.closest ? e.target.closest(".pm-seg [data-seg-value]") : null;
    if (!seg) return;
    var group = seg.closest(".pm-seg");
    var id = group.getAttribute("data-setting");
    window.PMState.setSettingValue(id, seg.getAttribute("data-seg-value"));
  });

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-ptab]") : null;
    if (!t) return;
    var card = t.closest("[data-provider-card]");
    if (!card) return;
    card.querySelectorAll("[data-ptab]").forEach(function (b) {
      b.classList.toggle("active", b === t);
      b.setAttribute("aria-selected", b === t ? "true" : "false");
    });
    card.querySelectorAll(".pm-provider-pane").forEach(function (p) {
      p.hidden = p.getAttribute("data-pane") !== t.getAttribute("data-ptab");
    });
  });

  window.PMManagers = {
    esc: esc,
    setPrefix: setPrefix,
    getPrefix: getPrefix,
    resourceList: resourceList,
    badge: badge,
    badgesFor: badgesFor,
    stateChip: stateChip,
    updateStateChip: updateStateChip,
    secretField: secretField,
    controlFor: controlFor,
    settingRow: settingRow,
    managerShell: managerShell,
    inspector: inspector,
    requestedEffective: requestedEffective,
    installationCard: installationCard,
    accountRow: accountRow,
    modelRow: modelRow,
    providerFamilyCard: providerFamilyCard,
    permissionRuleEditor: permissionRuleEditor,
    soundLibraryPanel: soundLibraryPanel,
    destinationForm: destinationForm,
    themePreviewCard: themePreviewCard,
    importPreviewBody: importPreviewBody,
    modal: modal,
    closeModal: closeModal
  };

  // Theme-specific locked rows re-render live when the active theme changes
  // (demo tray, Deck theme cards, or Hub messages all just set data-theme).
  var lockObserver = new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      if (m.attributeName !== "data-theme") return;
      document.querySelectorAll("[data-setting-row]").forEach(function (row) {
        var id = row.getAttribute("data-setting-row");
        var s = window.PMState && window.PMState.getSetting(id);
        if (s && s.themeLocked) {
          var tmp = document.createElement("div");
          tmp.innerHTML = settingRow(s);
          row.replaceWith(tmp.firstElementChild);
        }
      });
    });
  });
  lockObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
})();
