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

  window.PMSemantics = {
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
