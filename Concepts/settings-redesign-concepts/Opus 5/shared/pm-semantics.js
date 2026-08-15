/* Opus 5 — the shared meaning layer.
 *
 * The packet requires that the semantic status language stay consistent across
 * themes AND across concepts: an alert, a destination, a setting and a manager
 * must mean the same thing everywhere. This file owns those words.
 *
 * It deliberately owns NO layout. Each concept composes its own DOM from these
 * strings, which is what keeps four concepts from collapsing into four skins.
 */
(function () {
  "use strict";

  /* The nine ordinary row states, in the packet's vocabulary. */
  function stateLabel(state) {
    if (!state) return "Default";
    if (state.source === "unavailable") return "Unavailable";
    if (state.source === "managed") return "Managed";
    if (state.source === "notConfigured") return "Not configured";
    if (state.source === "inherited") return state.inheritedFrom ? "Inherited · " + state.inheritedFrom : "Inherited";
    if (state.source === "auto") return "Auto";
    if (state.source === "recommended") return "Recommended";
    if (state.source === "custom" || state.isDefault === false) return "Changed";
    return "Default";
  }

  /* Short form for dense surfaces (the Ledger's table, the Stack's columns). */
  function stateLabelShort(state) {
    if (!state) return "Default";
    if (state.source === "inherited") return "Inherited";
    return stateLabel(state);
  }

  function stateStatus(state) {
    if (!state) return "ok";
    if (state.source === "unavailable") return "unavailable";
    if (state.source === "managed") return "managed";
    if (state.source === "notConfigured") return "setup";
    return "ok";
  }

  /* True when the value the user asked for is not the value in force. */
  function hasDifference(state) {
    if (!state) return false;
    if (state.requested && state.effective && state.requested !== state.effective) return true;
    return !!state.effectiveNote;
  }

  function differenceText(state) {
    if (!state) return "";
    if (state.requested && state.effective && state.requested !== state.effective) {
      return "Requested " + state.requested + " · in force " + state.effective;
    }
    return state.effectiveNote || "";
  }

  function isEditable(setting) {
    var ex = setting.exposure;
    return ex !== "managed" && ex !== "unavailable" &&
      setting.state.source !== "managed" && setting.state.source !== "unavailable";
  }

  function valueDisplay(setting) {
    var v = setting.state.value;
    if (typeof v === "boolean") return v ? "On" : "Off";
    if (v == null || v === "") return "Not configured";
    return String(v);
  }

  function defaultDisplay(setting) {
    var d = setting.state.defaultValue;
    if (d === undefined) return null;
    if (typeof d === "boolean") return d ? "On" : "Off";
    return String(d);
  }

  var EXPOSURE = {
    standard: { label: "Standard", note: "Everyday setting." },
    advanced: { label: "Advanced", note: "Useful once you know why you want it." },
    expert: { label: "Expert", note: "Can break things in ways that are hard to notice." },
    managed: { label: "Managed", note: "Set elsewhere. Read-only here." },
    diagnostic: { label: "Diagnostic", note: "For investigating a problem, not for daily use." },
    unavailable: { label: "Unavailable", note: "Cannot apply on this device or account." }
  };

  function exposureLabel(exposure) { return (EXPOSURE[exposure] || EXPOSURE.standard).label; }
  function exposureNote(exposure) { return (EXPOSURE[exposure] || EXPOSURE.standard).note; }

  /* Risky and unavailable items stay findable, but never render as an equally
   * inviting default control. Concepts express this differently; the judgement
   * itself is shared. */
  function needsGuard(setting) {
    return setting.exposure === "expert" || setting.exposure === "unavailable";
  }

  var EFFECT_WORD = {
    cost: "Cost",
    privacy: "Privacy",
    safety: "Safety",
    performance: "Performance"
  };

  function effectWord(kind) { return EFFECT_WORD[kind] || "Effect"; }

  var SCOPE_LABEL = {
    turn: "This turn",
    thread: "This thread",
    goal: "This Goal",
    project: "This project",
    global: "Everywhere"
  };

  function scopeLabel(scope) { return SCOPE_LABEL[scope] || "Everywhere"; }

  var RESTART_LABEL = {
    none: null,
    restart: "Takes effect after a restart",
    reconnect: "Reconnects the provider"
  };

  function restartLabel(r) { return RESTART_LABEL[r] || null; }

  /* Notice severities. Recommended is never visually equal to an error. */
  var SEVERITY = {
    attention: { word: "Needs attention", rank: 0, status: "attention",
      note: "Broken, disconnected, unsafe or incomplete." },
    setup: { word: "Continue setup", rank: 1, status: "setup",
      note: "Deliberately unfinished. Nothing is wrong." },
    recommended: { word: "Recommended", rank: 2, status: "recommended",
      note: "An optional improvement." }
  };

  function severity(id) { return SEVERITY[id] || SEVERITY.recommended; }

  /* Capability evidence vocabulary from the packet. */
  var CAPABILITY = {
    supported: "Supported",
    unsupported: "Not supported",
    likely: "Likely",
    unverified: "Unverified",
    temporarilyUnavailable: "Temporarily unavailable",
    supportedThroughTransformation: "Supported through transformation",
    supportedThroughRoute: "Supported through another route"
  };

  function capabilityLabel(state) { return CAPABILITY[state] || state; }

  function capabilityStatus(state) {
    if (state === "supported") return "ok";
    if (state === "unsupported") return "unavailable";
    if (state === "temporarilyUnavailable") return "attention";
    if (state === "likely" || state === "unverified") return "setup";
    return "ok";
  }

  /* Connection health. Authenticated is not the same as ready. */
  var HEALTH = {
    ok: { word: "Ready", status: "ok" },
    signedOut: { word: "Signed out", status: "attention" },
    generationFailed: { word: "Authenticated, generation failing", status: "attention" },
    notConfigured: { word: "Not configured", status: "setup" },
    refreshing: { word: "Refreshing", status: "loading" }
  };

  function healthMeta(check) { return HEALTH[check] || HEALTH.ok; }

  function countSettings(category) {
    var total = 0, changed = 0, attention = 0;
    (category.subcategories || []).forEach(function (sub) {
      (sub.settings || []).forEach(function (s) {
        total++;
        if (s.state && s.state.isDefault === false) changed++;
        if (s.exposure === "unavailable" || s.state.source === "unavailable") attention++;
      });
    });
    return { total: total, changed: changed, attention: attention };
  }

  function allSettings(data) {
    var out = [];
    data.categories.forEach(function (c) {
      (c.subcategories || []).forEach(function (sub) {
        (sub.settings || []).forEach(function (s) {
          out.push({ setting: s, category: c, subcategory: sub });
        });
      });
    });
    return out;
  }

  function findSetting(data, id) {
    var all = allSettings(data);
    for (var i = 0; i < all.length; i++) if (all[i].setting.id === id) return all[i];
    return null;
  }

  function findCategory(data, id) {
    for (var i = 0; i < data.categories.length; i++) if (data.categories[i].id === id) return data.categories[i];
    return null;
  }

  /* `dismissed` is a map of notice id -> true. Dismissing is a real removal:
   * the notice leaves the list until the demo state is changed, rather than
   * announcing success and staying put. */
  function noticesFor(data, demoState, dismissed) {
    return baseNotices(data, demoState).filter(function (n) {
      return !(dismissed && dismissed[n.id]);
    });
  }

  function baseNotices(data, demoState) {
    if (demoState === "calm") return [];
    if (demoState === "attention") {
      return data.notices.concat([{
        id: "notice-catalogue",
        severity: "attention",
        statusWord: "Needs attention",
        headline: "The models.dev refresh failed validation",
        consequence: "The previous catalogue is still in use. Two models added this week are not visible yet.",
        primary: { label: "Retry the refresh", action: "refresh-catalogue" },
        secondary: { label: "Show what changed", action: "open-catalogue" },
        target: { categoryId: "agents", subcategoryId: "agents-models", settingId: "model-catalog-refresh" }
      }, {
        id: "notice-grant",
        severity: "attention",
        statusWord: "Needs attention",
        headline: "A cross-project grant expired mid-Goal",
        consequence: "The migration Goal lost read access to orchard-shared and paused at phase three.",
        primary: { label: "Review the grant", action: "open-setting", settingId: "xp-grants" },
        target: { categoryId: "permissions", subcategoryId: "perm-crossproject", settingId: "xp-grants" }
      }]);
    }
    return data.notices;
  }

  function groupNotices(list) {
    var groups = { attention: [], setup: [], recommended: [] };
    list.forEach(function (n) { (groups[n.severity] || groups.recommended).push(n); });
    return groups;
  }


  /* ============================================ ACQUISITION AND READINESS */

  /* Added by the 2026-08-13 dependency correction.
   *
   * SERVER_BACKBONE_SETTINGS_RETURN §6 asks for per-tool acquisition and
   * readiness states instead of blanket "not bundled" copy. PROVIDER_CLI_FINAL_
   * ADJUDICATION supersedes that for one class: a provider CLI may never be
   * presented as included, pre-seeded, or baseline without a later named user
   * exception. Both rules are expressed here so a concept cannot satisfy one by
   * violating the other. */
  var ACQUISITION = {
    included_with_server: { label: "Included with this Server", baseline: true },
    pm_tool_store: { label: "Installed in the Puppet Master Tool Store", baseline: false },
    available_to_install: { label: "Available to install", baseline: false },
    installed_externally: { label: "Installed and managed externally", baseline: false },
    organization_managed: { label: "Managed by your organization", baseline: false },
    needs_license: { label: "Needs a licence or permission", baseline: false },
    needs_sign_in: { label: "Needs sign-in", baseline: false },
    not_installed: { label: "Not installed", baseline: false }
  };

  var READINESS = {
    ready: "Ready",
    update_available: "Update available",
    needs_repair: "Needs repair",
    waiting_for_work: "Waiting for work to finish",
    sign_in_required: "Sign-in required",
    waiting_for_you: "Waiting for you",
    could_not_connect: "Could not connect",
    organization_managed: "Managed by your organization",
    shadowed: "Another installation is being used",
    not_on_environment: "Source files are not available on this environment"
  };

  /* The load-bearing rule. A provider CLI is never baseline. */
  function acquisitionLabel(key, opts) {
    var o = opts || {};
    var entry = ACQUISITION[key];
    if (!entry) return null;
    if (o.isProviderCli && entry.baseline && o.namedException !== true) {
      /* Refuse rather than render: the adjudication supersedes the permissive
       * wording, and a silent downgrade would hide the conflict. */
      return ACQUISITION.available_to_install.label;
    }
    return entry.label;
  }

  function isBaselineAcquisition(key) { return !!(ACQUISITION[key] && ACQUISITION[key].baseline); }
  function readinessLabel(key) { return READINESS[key] || null; }

  /* ---------------------------------------------------------- scope words */

  /* Audit §6 requires scopes beyond global/project/thread. Every one of these
   * renders as human text; the key itself never reaches ordinary copy. */
  var SCOPE_WORD = {
    global: "Everywhere",
    project: "This project",
    thread: "This thread",
    turn: "This turn",
    goal: "This Goal",
    planningRun: "This planning run",
    crew: "This Crew",
    host: "This host",
    environment: "This environment",
    installation: "This installation",
    device: "This device",
    worktree: "This worktree"
  };

  function scopeWord(scope) { return SCOPE_WORD[scope] || SCOPE_WORD.global; }

  /* -------------------------------------------------------- secret classes */

  /* Audit §6 secret/auth distinctions. Puppet Master never copies a credential
   * it does not own, so the class decides what the UI may even offer. */
  var SECRET_CLASS = {
    pmSecret: { label: "Stored by Puppet Master", canReveal: true, canEdit: true },
    vaultReference: { label: "Reference to a vault entry", canReveal: false, canEdit: true },
    pmOAuth: { label: "Puppet Master sign-in", canReveal: false, canEdit: false },
    cliOwned: { label: "Owned by the tool's own login", canReveal: false, canEdit: false },
    envBacked: { label: "Read from the environment", canReveal: false, canEdit: false },
    helperBacked: { label: "Provided by a credential helper", canReveal: false, canEdit: false },
    nonSecret: { label: "Not a secret", canReveal: true, canEdit: true }
  };

  function secretClass(kind) { return SECRET_CLASS[kind] || SECRET_CLASS.pmSecret; }


  /* Installation provenance in human words. EGOLITE §10 and §12: values such as
   * `npm_global` or `strongly_identified` belong in Technical Details, never in
   * ordinary copy. Added by the 2026-08-13 correction after the bespoke provider
   * surfaces were found rendering the raw keys. */
  var OWNER_KIND_WORD = {
    npm_global: "Installed with npm",
    npm_managed: "Installed with npm by Puppet Master",
    homebrew_formula: "Homebrew formula",
    pm_tool_store: "Puppet Master Tool Store",
    system_package: "System package",
    manual: "Installed by hand",
    unknown: "Unknown installer"
  };

  var CONFIDENCE_WORD = {
    proven: "Confirmed",
    strongly_identified: "Almost certain",
    probable: "Likely",
    weak: "Uncertain",
    unknown: "Not established"
  };

  function ownerKindWord(k) { return OWNER_KIND_WORD[k] || OWNER_KIND_WORD.unknown; }
  function confidenceWord(c) { return CONFIDENCE_WORD[c] || CONFIDENCE_WORD.unknown; }

  window.PMSemantics = {
    OWNER_KIND_WORD: OWNER_KIND_WORD,
    CONFIDENCE_WORD: CONFIDENCE_WORD,
    ownerKindWord: ownerKindWord,
    confidenceWord: confidenceWord,
    ACQUISITION: ACQUISITION,
    READINESS: READINESS,
    acquisitionLabel: acquisitionLabel,
    isBaselineAcquisition: isBaselineAcquisition,
    readinessLabel: readinessLabel,
    SCOPE_WORD: SCOPE_WORD,
    scopeWord: scopeWord,
    SECRET_CLASS: SECRET_CLASS,
    secretClass: secretClass,
    stateLabel: stateLabel,
    stateLabelShort: stateLabelShort,
    stateStatus: stateStatus,
    hasDifference: hasDifference,
    differenceText: differenceText,
    isEditable: isEditable,
    valueDisplay: valueDisplay,
    defaultDisplay: defaultDisplay,
    exposureLabel: exposureLabel,
    exposureNote: exposureNote,
    needsGuard: needsGuard,
    effectWord: effectWord,
    scopeLabel: scopeLabel,
    restartLabel: restartLabel,
    severity: severity,
    capabilityLabel: capabilityLabel,
    capabilityStatus: capabilityStatus,
    healthMeta: healthMeta,
    countSettings: countSettings,
    allSettings: allSettings,
    findSetting: findSetting,
    findCategory: findCategory,
    noticesFor: noticesFor,
    groupNotices: groupNotices,
    EXPOSURE_ORDER: ["standard", "advanced", "expert", "managed", "diagnostic", "unavailable"]
  };
})();
