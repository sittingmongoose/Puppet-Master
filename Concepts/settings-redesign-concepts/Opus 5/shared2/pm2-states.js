/* Opus 5 — the deterministic states every concept must be able to show.
 *
 * A concept that only ever renders the happy path is a drawing. The packet lists
 * eighteen situations a real Settings surface has to survive, and this file makes
 * each one a named, linkable fixture: `?s=offline` on any route puts the whole page
 * into that situation, so a reviewer can hand someone an exact screen and a test can
 * assert the exact same screen tomorrow.
 *
 * This file describes the situation. It never draws it: each concept decides what an
 * offline provider roster or an import conflict LOOKS like, which is where seven
 * designs are supposed to differ.
 *
 * Nothing here fakes success. `verify-failed-rollback` really does leave the copy
 * transaction in its recovery state; `unavailable` really does make the affected
 * rows uneditable.
 */
(function () {
  "use strict";

  /* Grouped the way a reviewer thinks about them, not the way the code uses them. */
  var FIXTURES = [
    { id: "normal", group: "Baseline", label: "Normal",
      note: "The Project as it usually looks: a few things need attention, everything else is fine." },

    { id: "loading-cached", group: "Arrival", label: "Loading with cached content",
      note: "Cached values stay on screen and are marked as being refreshed. Nothing is blanked out to show a spinner." },
    { id: "empty", group: "Arrival", label: "Empty Project",
      note: "A Project with nothing configured yet. Every roster is empty and says what to do first." },
    { id: "no-results", group: "Search", label: "No search results",
      note: "A query that matches nothing, and what the reader is offered instead." },
    { id: "typo-search", group: "Search", label: "Typo in the query",
      note: "A misspelled query that still finds the right destination, and shows why it matched." },

    { id: "validation-error", group: "Editing", label: "Validation error",
      note: "A value the reader typed that cannot be accepted, explained in place without losing what they typed." },
    { id: "changed-elsewhere", group: "Editing", label: "Setting changed elsewhere",
      note: "A value this Project changed in another window while the page was open." },
    { id: "restart-required", group: "Editing", label: "Restart required",
      note: "A change that only takes effect after a restart, stated once rather than on every row." },

    { id: "offline", group: "Connectivity", label: "Offline or poor network",
      note: "No network. Cached values remain readable, and anything that needs the network says so before it is pressed." },
    { id: "reconnect-required", group: "Connectivity", label: "Reconnect required",
      note: "A provider session that expired and needs an explicit sign-in again." },
    { id: "usage-unavailable", group: "Connectivity", label: "Provider ready, Usage unavailable",
      note: "The provider works but reports no balance. Readiness and measurement are separate facts." },

    { id: "managed", group: "Authority", label: "Managed by policy",
      note: "Values a policy genuinely controls. They are readable, explained, and not editable here." },
    { id: "unavailable", group: "Authority", label: "Capability unavailable",
      note: "Settings this host cannot provide. They stay findable and say why, rather than disappearing." },

    { id: "multi-install-shadowed", group: "Installation", label: "Several installations, one shadowed",
      note: "More than one candidate installation found, with the selected one and the shadowed one both named." },
    { id: "unknown-install-owner", group: "Installation", label: "Unknown installation owner",
      note: "An installation whose owner cannot be established. Manual-only: Puppet Master will not manage it." },
    { id: "update-available", group: "Installation", label: "Provider update available",
      note: "A newer generation is available for an already approved installation. It asks first." },

    { id: "import-conflict", group: "Transactions", label: "Import conflict",
      note: "An import that disagrees with values this Project already has, itemised before anything is applied." },
    { id: "rollback-complete", group: "Transactions", label: "Rollback complete",
      note: "A transaction that was rolled back, with the restore point and the receipt still available." },
    { id: "verify-failed-rollback", group: "Transactions", label: "Verification failed, rolled back",
      note: "An apply that verified badly and undid itself. The Project is exactly as it was." }
  ];

  var BY_ID = {};
  FIXTURES.forEach(function (f) { BY_ID[f.id] = f; });

  /* What each fixture actually changes, as flags a concept reads declaratively. A
   * concept never branches on the fixture id itself, so adding a fixture later does
   * not mean editing seven renderers. */
  var EFFECTS = {
    "normal": {},
    "loading-cached": { refreshing: true, showCached: true },
    "empty": { emptyRosters: true, noAttention: true },
    "no-results": { forceQuery: "zzhqx", searchEmpty: true },
    "typo-search": { forceQuery: "notifcations" },
    "validation-error": { validationError: true },
    "changed-elsewhere": { changedElsewhere: true },
    "restart-required": { restartPending: true },
    "offline": { offline: true, showCached: true, degradeNetworkActions: true },
    "reconnect-required": { reconnectRequired: true },
    "usage-unavailable": { usageUnavailable: true },
    "managed": { managedOverride: true },
    "unavailable": { unavailableOverride: true },
    "multi-install-shadowed": { multiInstall: true },
    "unknown-install-owner": { unknownOwner: true },
    "update-available": { updateAvailable: true },
    "import-conflict": { importConflict: true },
    "rollback-complete": { rollbackComplete: true },
    "verify-failed-rollback": { verifyFailed: true }
  };

  /* At most one critical full-width notice, and only when it is genuinely critical.
   * Everything else belongs in the compact attention list. */
  var NOTICE = {
    "offline": {
      id: "notice-offline", tone: "attention",
      headline: "No network connection",
      detail: "Values below are the last ones this Project read. Anything that needs the network is disabled and says so.",
      action: null
    },
    "reconnect-required": {
      id: "notice-reconnect", tone: "attention",
      headline: "One provider needs you to sign in again",
      detail: "The session for the Anthropic account expired. Nothing was changed while it was expired.",
      action: { label: "Sign in again", destination: { managerId: "manager-providers", objectId: "anthropic", sectionKey: "credentials" } }
    },
    "verify-failed-rollback": {
      id: "notice-verify-failed", tone: "attention",
      headline: "The last copy was undone",
      detail: "Verification found four values that did not match the source, so the whole transaction was rolled back. This Project is exactly as it was.",
      action: { label: "Open the receipt", destination: { managerId: "manager-copy", sectionKey: "receipts" } }
    },
    "restart-required": {
      id: "notice-restart", tone: "info",
      headline: "Two changes take effect after a restart",
      detail: "They are saved. Puppet Master will apply them the next time it starts.",
      action: null
    }
  };

  /* The compact `Needs attention` list. Normally two to four items — never a wall. */
  var ATTENTION = {
    "normal": [
      { id: "att-openai-key", tone: "attention", label: "The OpenAI API key was rejected",
        detail: "Requests routed to OpenAI are failing. The key may have been rotated.",
        actionLabel: "Fix", destination: { managerId: "manager-providers", objectId: "openai", sectionKey: "credentials" } },
      { id: "att-index-stale", tone: "setup", label: "The Project search index is 6 days stale",
        detail: "Files changed since the last build will not be found by name.",
        actionLabel: "Rebuild", destination: { managerId: "manager-index" } },
      { id: "att-mcp-down", tone: "setup", label: "One MCP server is not responding",
        detail: "The filesystem server has not answered since 08:14.",
        actionLabel: "Open", destination: { managerId: "manager-mcp", objectId: "mcp-filesystem" } }
    ],
    "empty": [],
    "offline": [
      { id: "att-offline-index", tone: "setup", label: "Index rebuild is waiting for a network",
        detail: "It will resume on its own once the connection returns.",
        actionLabel: "Open", destination: { managerId: "manager-index" } }
    ],
    "update-available": [
      { id: "att-update", tone: "info", label: "A newer Claude CLI generation is available",
        detail: "2.1.4 is staged. It will not be installed until you say so.",
        actionLabel: "Review", destination: { managerId: "manager-providers", objectId: "anthropic", sectionKey: "installations" } },
      { id: "att-openai-key", tone: "attention", label: "The OpenAI API key was rejected",
        detail: "Requests routed to OpenAI are failing. The key may have been rotated.",
        actionLabel: "Fix", destination: { managerId: "manager-providers", objectId: "openai", sectionKey: "credentials" } }
    ]
  };

  function activeId() {
    var route = window.PM2Route;
    var id = route && route.state ? route.state() : null;
    return id && BY_ID[id] ? id : "normal";
  }

  function effects() {
    return EFFECTS[activeId()] || {};
  }

  /* One place decides whether a row is editable right now, so a fixture cannot make
   * one concept honest and another concept a liar. */
  function rowState(record) {
    var e = effects();
    var base = record && record.state;
    if (!base) return base;
    if (e.managedOverride && base.source === "default" && record.exposure !== "diagnostic") {
      return Object.assign({}, base, {
        source: "managed",
        managedBy: "Workspace policy",
        managedNote: "Set by Workspace policy for every Project on this host."
      });
    }
    if (e.unavailableOverride && (record.kind === "action" || record.exposure === "expert")) {
      return Object.assign({}, base, {
        source: "unavailable",
        reason: "This host does not provide the capability."
      });
    }
    return base;
  }

  window.PM2States = {
    FIXTURES: FIXTURES,
    list: function () { return FIXTURES; },
    grouped: function () {
      var order = [];
      var byGroup = {};
      FIXTURES.forEach(function (f) {
        if (!byGroup[f.group]) { byGroup[f.group] = { group: f.group, items: [] }; order.push(byGroup[f.group]); }
        byGroup[f.group].items.push(f);
      });
      return order;
    },
    get: function (id) { return BY_ID[id] || null; },
    active: activeId,
    activeFixture: function () { return BY_ID[activeId()]; },
    is: function (id) { return activeId() === id; },
    effects: effects,
    rowState: rowState,

    /* At most one. A concept that wants to show none is free to; it may never show two. */
    notice: function () { return NOTICE[activeId()] || null; },
    attention: function () {
      var id = activeId();
      return ATTENTION[id] || ATTENTION.normal;
    },

    /* Applied to a manager spec so an offline page does not claim a healthy server. */
    decorate: function (spec) {
      var e = effects();
      if (!spec || (!e.offline && !e.refreshing && !e.emptyRosters)) return spec;
      var out = Object.assign({}, spec);
      if (e.offline && out.health) {
        out.health = Object.assign({}, out.health, {
          status: "unavailable",
          statusWord: "Cannot check right now",
          detail: "There is no network connection. The figures below are the last ones read."
        });
      }
      if (e.refreshing && out.health) {
        out.health = Object.assign({}, out.health, { refreshing: true, statusWord: "Refreshing" });
      }
      if (e.emptyRosters && out.sections) {
        out.sections = out.sections.map(function (s) {
          return s.kind === "list" ? Object.assign({}, s, { items: [] }) : s;
        });
      }
      return out;
    }
  };
})();
