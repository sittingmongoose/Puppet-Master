/* Opus 5 — the manager contract every concept renders against.
 *
 * Four concepts times thirty-eight managers is one hundred and fifty-two
 * screens if each concept hand-writes each manager. That is not a design
 * exercise, it is a copy-paste exercise, and the semantics drift on the second
 * copy. So the domain modules describe each manager ONCE as a normalised
 * ManagerSpec, and each concept writes exactly one renderManager(spec, ctx).
 *
 * What stays shared: what a manager contains, what each row means, which words
 * describe a status, what an action claims to do.
 * What stays per concept: every pixel of how that is arranged, entered, exited
 * and animated.
 *
 * The Provider/Account/Model/Installation manager is deliberately NOT rendered
 * through renderManager. It is the manager the packet requires in all four
 * concepts, so each concept builds it bespoke — that is where the four designs
 * are supposed to disagree with each other.
 *
 * Section kinds and the declared shape: a section carries only the keys listed
 * in the ManagerSpec contract. kind:"prose" therefore keeps its paragraphs in
 * items[].name, and kind:"matrix" keeps each cell in items[].fields keyed by the
 * column key. Renderers read nothing outside the contract.
 *
 * Load order note: the domain modules load before this file (they contribute to
 * PMData, which must be complete before it is sealed). They therefore push
 * [id, buildFn] pairs onto window.__pmManagerBuilders instead of calling
 * register() directly, and this file drains that queue on load.
 */
(function () {
  "use strict";

  var builders = Object.create(null);

  function register(id, buildFn) {
    if (typeof buildFn !== "function") return;
    builders[id] = buildFn;
  }

  /* Drain whatever the data modules queued before this file existed. */
  (window.__pmManagerBuilders || []).forEach(function (pair) {
    register(pair[0], pair[1]);
  });
  window.__pmManagerBuilders = { push: function (pair) { register(pair[0], pair[1]); } };

  /* ------------------------------------------------------------ assignment */

  var CORE = ["manager-providers"];

  var ASSIGNMENT = {
    atlas: ["manager-context", "manager-memory", "manager-personas", "manager-goal", "manager-crew",
      "manager-filesafe", "manager-bsd"],
    console: ["manager-notifications", "manager-sounds", "manager-appearance", "manager-dictionaries",
      "manager-desktop", "manager-teacher"],
    stack: ["manager-files", "manager-terminal", "manager-lsp", "manager-formatters", "manager-commands",
      "manager-mcp", "manager-skills", "manager-plugins", "manager-tools", "manager-testing"],
    ledger: ["manager-storage", "manager-backup", "manager-settings-lifecycle", "manager-history",
      "manager-artifacts", "manager-sourcecontrol", "manager-gh-actions", "manager-containers",
      "manager-web", "manager-index", "manager-cleanup", "manager-server", "manager-media"]
  };

  var CONCEPTS = {
    atlas: { title: "Opus 5 — Atlas", page: "opus-5-atlas.html" },
    console: { title: "Opus 5 — Console", page: "opus-5-console.html" },
    stack: { title: "Opus 5 — Stack", page: "opus-5-stack.html" },
    ledger: { title: "Opus 5 — Ledger", page: "opus-5-ledger.html" }
  };

  /* Built in every concept: the provider showcase, and the Usage boundary card
   * that has to exist wherever Settings talks about balances. */
  var EVERYWHERE = ["manager-providers", "manager-usage"];

  var HOME = Object.create(null);
  Object.keys(ASSIGNMENT).forEach(function (conceptId) {
    ASSIGNMENT[conceptId].forEach(function (id) { HOME[id] = conceptId; });
  });

  function homeOf(managerId) {
    if (EVERYWHERE.indexOf(managerId) >= 0) {
      return { conceptId: null, title: "every concept", href: null };
    }
    var conceptId = HOME[managerId];
    if (!conceptId) return { conceptId: null, title: "not assigned", href: null };
    var c = CONCEPTS[conceptId];
    return { conceptId: conceptId, title: c.title, href: c.page + "#/m/" + encodeURIComponent(managerId) };
  }

  function assignedTo(conceptId) {
    return CORE.concat(ASSIGNMENT[conceptId] || [], ["manager-usage"]);
  }

  /* -------------------------------------------------------- normalisation */

  var STATUSES = ["ok", "attention", "setup", "managed", "unavailable", "loading", "risky"];

  var TONE = {
    ok: "ok",
    attention: "attention",
    setup: "setup",
    managed: "managed",
    unavailable: "unavailable",
    loading: "loading",
    risky: "risky"
  };

  /* A CSS token name, never a border side and never colour on its own: every
   * consumer pairs this with statusWord, so the meaning survives a monochrome
   * theme and a colour-blind reader. */
  function statusTone(status) {
    return TONE[status] || "ok";
  }

  function str(v, fallback) {
    return typeof v === "string" && v !== "" ? v : (fallback || "");
  }

  function arr(v) { return Array.isArray(v) ? v : []; }

  function normBadge(b) {
    return {
      kind: str(b && b.kind, "source"),
      text: str(b && b.text),
      title: str(b && b.title)
    };
  }

  function normEditable(e) {
    return {
      key: str(e && e.key),
      label: str(e && e.label),
      kind: str(e && e.kind, "text"),
      options: arr(e && e.options),
      value: e && e.value !== undefined ? e.value : null,
      help: str(e && e.help),
      secretKind: e && e.secretKind ? String(e.secretKind) : null
    };
  }

  function normAction(a) {
    return { id: str(a && a.id), label: str(a && a.label), kind: str(a && a.kind, "quiet") };
  }

  function normDetail(d) {
    return {
      id: str(d && d.id),
      label: str(d && d.label),
      rows: arr(d && d.rows).map(function (r) {
        return { label: str(r && r.label), value: r && r.value != null ? r.value : "", hint: str(r && r.hint) };
      })
    };
  }

  function normItem(it) {
    var i = it || {};
    var availability = i.availability && typeof i.availability === "object"
      ? (i.availability.available === false
        ? { available: false, reason: str(i.availability.reason, "Unavailable."), owner: str(i.availability.owner) }
        : { available: true })
      : { available: true };
    return {
      id: str(i.id),
      name: str(i.name),
      secondary: str(i.secondary),
      status: STATUSES.indexOf(i.status) >= 0 ? i.status : "ok",
      statusWord: str(i.statusWord),
      badges: arr(i.badges).map(normBadge),
      value: i.value !== undefined ? i.value : null,
      valueSource: str(i.valueSource),
      requested: i.requested !== undefined ? i.requested : null,
      effective: i.effective !== undefined ? i.effective : null,
      effectiveWhy: i.effectiveWhy !== undefined ? i.effectiveWhy : null,
      availability: availability,
      fields: i.fields && typeof i.fields === "object" ? i.fields : {},
      editable: arr(i.editable).map(normEditable),
      actions: arr(i.actions).map(normAction),
      detail: arr(i.detail).map(normDetail)
    };
  }

  function normSection(s) {
    var sec = s || {};
    var kind = ["list", "table", "cards", "matrix", "rows", "prose"].indexOf(sec.kind) >= 0 ? sec.kind : "list";
    return {
      id: str(sec.id),
      label: str(sec.label),
      summary: str(sec.summary),
      kind: kind,
      columns: arr(sec.columns).map(function (c) {
        return { key: str(c && c.key), label: str(c && c.label),
          weight: typeof (c && c.weight) === "number" ? c.weight : 1, align: str(c && c.align, "start") };
      }),
      items: arr(sec.items).map(normItem),
      settings: arr(sec.settings),
      empty: sec.empty ? { headline: str(sec.empty.headline), detail: str(sec.empty.detail),
        action: sec.empty.action ? normAction(sec.empty.action) : null } : null,
      loading: !!sec.loading,
      actions: arr(sec.actions).map(normAction)
    };
  }

  function normSpec(id, raw) {
    var s = raw || {};
    var health = s.health || {};
    return {
      id: id,
      title: str(s.title, id),
      purpose: str(s.purpose),
      icon: str(s.icon, "sliders"),
      owner: s.owner ? { name: str(s.owner.name), why: str(s.owner.why),
        insertionContract: str(s.owner.insertionContract) } : null,
      health: {
        status: STATUSES.indexOf(health.status) >= 0 ? health.status : "ok",
        statusWord: str(health.statusWord, "Ready"),
        headline: str(health.headline),
        detail: str(health.detail),
        counts: arr(health.counts).map(function (c) {
          return { label: str(c && c.label), value: c && c.value != null ? c.value : "" };
        })
      },
      search: s.search ? { placeholder: str(s.search.placeholder, "Search"), fields: arr(s.search.fields) } : null,
      primary: s.primary ? { id: str(s.primary.id), label: str(s.primary.label),
        kind: str(s.primary.kind, "add") } : null,
      sections: arr(s.sections).map(normSection),
      diagnostics: arr(s.diagnostics).map(function (d) {
        return { id: str(d && d.id), label: str(d && d.label), kind: str(d && d.kind, "log") };
      }),
      notes: arr(s.notes).map(function (n) { return String(n); })
    };
  }

  /* --------------------------------------------------------------- lookup */

  function spec(id, state) {
    var data = window.PMData;
    var build = builders[id];
    if (build) return normSpec(id, build(data, state || {}));

    var record = data && data.managers ? data.managers[id] : null;
    if (!record) throw new Error("PMManagerKit: unknown manager " + id);

    /* Known manager, no builder in this page: a cross-concept pointer, which is
     * an honest answer rather than an empty screen. */
    var home = homeOf(id);
    return normSpec(id, {
      title: record.title,
      purpose: record.purpose,
      icon: record.icon,
      health: {
        status: "managed",
        statusWord: "Built in another concept",
        headline: home.title === "not assigned"
          ? "This manager is not part of any concept's assignment."
          : "This family is demonstrated in full by " + home.title + ".",
        detail: "The four concepts split the manager families between them so each one can be shown at full depth rather than four times at a quarter depth."
      },
      sections: [{
        id: "pointer", label: "Where it lives", kind: "prose",
        items: [
          { id: "pointer-purpose", name: record.purpose || "" },
          { id: "pointer-home", name: home.href ? "Open " + home.title + " to use it." : "No concept in this bakeoff builds it." }
        ]
      }],
      notes: home.href ? ["Cross-reference only. Nothing here is editable."] : []
    });
  }

  function has(id) {
    return !!builders[id] || !!(window.PMData && window.PMData.managers && window.PMData.managers[id]);
  }

  function ids() { return Object.keys(builders); }

  /* ------------------------------------------------------------- helpers */

  /* One sentence explaining why a row cannot be used, or "" when it can. */
  function reasonLine(item) {
    if (!item) return "";
    if (item.availability && item.availability.available === false) {
      var owner = item.availability.owner ? " Owned by " + item.availability.owner + "." : "";
      return item.availability.reason + owner;
    }
    if (item.status === "managed") {
      return item.statusWord ? item.statusWord + "." : "Managed for you; it cannot be changed here.";
    }
    return "";
  }

  /* "Requested X · Effective Y — why", or "" when the two agree. */
  function routeLine(item) {
    if (!item || item.requested == null || item.effective == null) return "";
    if (String(item.requested) === String(item.effective)) return "";
    var why = item.effectiveWhy ? " — " + item.effectiveWhy : "";
    return "Requested " + item.requested + " · Effective " + item.effective + why;
  }

  /* Empty states are content, not a shrug. A section that forgot to write one
   * still gets a sentence that says what would appear here and how to add it. */
  function emptyFor(section) {
    if (section && section.empty) return section.empty;
    var label = section && section.label ? section.label.toLowerCase() : "this section";
    return {
      headline: "Nothing in " + label + " yet",
      detail: "When something is added it appears here with its status, source and the actions it supports.",
      action: null
    };
  }

  function familyLabel(providerFamilyId) {
    var data = window.PMData;
    var found = null;
    ((data && data.providers) || []).forEach(function (p) { if (p.id === providerFamilyId) found = p; });
    if (found) return found.name;
    /* An installation can legitimately be discovered for a family this build
     * has no configured record for. Say so rather than rendering a blank. */
    return String(providerFamilyId || "unknown")
      .replace(/(^|[-_])(\w)/g, function (m, sep, ch) { return (sep ? " " : "") + ch.toUpperCase(); }) +
      " — no configured provider family";
  }

  function installationsFor(providerFamilyId) {
    var data = window.PMData;
    return ((data && data.installations) || []).filter(function (i) {
      return i.providerFamilyId === providerFamilyId;
    });
  }

  function installation(id) {
    var found = null;
    ((window.PMData && window.PMData.installations) || []).forEach(function (i) {
      if (i.installationId === id) found = i;
    });
    return found;
  }

  function attemptsFor(installationId) {
    return ((window.PMData && window.PMData.updateAttempts) || []).filter(function (a) {
      return a.installationId === installationId;
    });
  }

  /* ------------------------------------------------------------- actions */

  /* The production call each action stands in for. A concept cannot install a
   * CLI or post to Slack, so every action resolves to a dated receipt naming
   * the operation a real build would invoke. Nothing here pretends to succeed
   * at something it did not do. */
  var OPERATION = {
    "installation.rescan": { call: "ProviderInstallationResolver.rescan(hostId)", detail: "Would re-inventory every installation candidate on this host and keep the current binding.", phases: ["Reading package databases", "Tracing shims and symlinks", "Comparing evidence"] },
    "installation.select": { call: "ProviderInstallationResolver.select(installationId)", detail: "Would bind this provider to the chosen installation by id, so PATH order cannot move it.", phases: ["Validating the candidate", "Rebinding dependents"] },
    "installation.adopt": { call: "ProviderInstallationLifecycle.adopt(installationId)", detail: "Would copy the executable into a Puppet Master managed generation. Authentication stays with the CLI.", phases: ["Staging the generation", "Verifying", "Activating"] },
    "installation.check_update": { call: "ProviderInstallationLifecycle.checkUpdate(installationId)", detail: "Would ask the owning package manager for the latest compatible version on this channel.", phases: ["Reading the channel", "Comparing to the compatible range"] },
    "installation.update_now": { call: "ProviderInstallationLifecycle.beginUpdate(installationId, target)", detail: "Would run preflight, drain in-flight work, install, verify, then activate — or roll back.", phases: ["Preflight", "Draining active work", "Installing", "Verifying"] },
    "installation.schedule_update": { call: "ProviderInstallationLifecycle.scheduleUpdate(installationId, 'when_idle')", detail: "Would park the transaction in awaiting_authority_or_idle until the named work finishes.", phases: ["Recording the schedule"] },
    "installation.cancel_update": { call: "ProviderInstallationLifecycle.cancelUpdate(attemptId)", detail: "Would release the leases and leave the current version active.", phases: ["Releasing leases"] },
    "installation.rollback": { call: "ProviderInstallationLifecycle.rollback(installationId)", detail: "Would reactivate the last known good generation and refresh every dependent route.", phases: ["Reactivating the previous generation", "Refreshing dependents"] },
    "installation.repair": { call: "ProviderInstallationLifecycle.repair(installationId)", detail: "Would re-run the owner's repair procedure and then the full verification list.", phases: ["Repairing", "Verifying"] },
    "installation.pin": { call: "ProviderInstallationLifecycle.pinVersion(installationId, version)", detail: "Would pin this version and stop offering updates until the pin is removed.", phases: ["Writing the pin"] },
    "provider.models.refresh": { call: "ProviderCatalogService.refresh(sourceIds)", detail: "Would re-read the catalogue sources, validate them, and keep the last known good copy if validation fails.", phases: ["Checking sources", "Validating", "Activating"] },
    "provider.auth.start_setup": { call: "ProviderOnboardingService.startSetup(providerId, methodId)", detail: "Would open the provider's own official page in your browser and return to this row afterwards.", outcome: "handoff" },
    "provider.auth.revalidate": { call: "ProviderAuthResolver.revalidate(profileId)", detail: "Would re-probe the profile: identity, product, catalogue and adapter handshake.", phases: ["Probing", "Resolving identity"] },
    "notification.test_send": { call: "NotificationService.testSend(destinationId)", detail: "Would post one test message to the destination and record the provider's exact reply.", phases: ["Building the payload", "Sending", "Reading the reply"] },
    "settings.import.preview": { call: "SettingsLifecycle.previewImport(bundle)", detail: "Would compute a per-key diff against the live store without changing anything.", phases: ["Reading the bundle", "Comparing keys"] },
    "settings.import.apply": { call: "SettingsLifecycle.applyImport(bundle, plan)", detail: "Would take a restore point, apply the plan atomically, then verify.", phases: ["Taking a restore point", "Applying", "Verifying"] },
    "settings.import.rollback": { call: "SettingsLifecycle.rollbackImport(snapshotId)", detail: "Would restore every key captured before the import.", phases: ["Restoring"] },
    "storage.backup_now": { call: "BackupService.runNow(scope)", detail: "Would run the backup for the selected scope and write a receipt.", phases: ["Collecting", "Writing", "Verifying"] },
    "cleanup.dry_run": { call: "WorkspaceCleanup.plan(scope)", detail: "Would list exactly what would be removed. Nothing is deleted by a dry run.", phases: ["Scanning", "Planning"] }
  };

  /* act(ctx, action, payload) -> Promise<receipt>
   *
   * ctx = { conceptId, managerId }. The receipt reaches the title-bar inbox
   * through the shell's single PMSim.onReceipt bridge, which is what makes the
   * packet's "sound cannot be the only indication" rule structurally true
   * rather than a claim in a document.
   */
  /* Local, honest side effects. Keyed by action id so a concept never has to
   * special-case one manager's buttons.
   *
   * Preview and Apply differ in exactly one way, which is the difference the
   * packet asks for: preview paints the theme without recording a choice, apply
   * goes through the shell so the choice is remembered. */
  function liveEffect(a, payload) {
    if (a.id !== "appearance.preview" && a.id !== "appearance.apply") return;
    if (!window.PMShell) return;

    /* The row id is "theme-<themeId>"; the raw id must never reach the DOM,
     * because an unknown data-theme leaves the page with no theme at all. */
    var raw = String((payload && payload.id) || "");
    var themeId = raw.indexOf("theme-") === 0 ? raw.slice(6) : raw;
    var known = (window.PMShell.THEMES || []).some(function (t) { return t.id === themeId; });
    if (!known) return;

    if (a.id === "appearance.apply") {
      var shell = typeof window.PMShell.currentShell === "function" ? window.PMShell.currentShell() : null;
      if (shell && shell.setTheme) shell.setTheme(themeId);
      return;
    }
    document.documentElement.setAttribute("data-theme", themeId);
    document.documentElement.style.colorScheme = /-dark$/.test(themeId) ? "dark" : "light";
  }

  function act(ctx, action, payload) {
    var a = typeof action === "string" ? { id: action, label: action } : (action || {});
    var op = OPERATION[a.id] || null;
    var c = ctx || {};
    var label = a.label || (op ? a.id : "Action");
    var sim = window.PMSim;

    if (!sim) return Promise.resolve(null);

    if (a.kind === "unavailable" || (op && op.unavailable)) {
      return sim.unavailable({
        id: a.id, label: label,
        realCall: (op && op.call) || (c.managerId + "." + a.id),
        detail: (op && op.detail) || "This operation only exists inside the real application."
      });
    }

    /* A few operations genuinely CAN happen inside a standalone page. Those are
     * performed for real rather than simulated, because a control that claims to
     * preview a theme and then does nothing is a dead control. Everything that
     * would touch a network, a filesystem or a provider stays simulated. */
    liveEffect(a, payload);

    /* act() deliberately does not post to the inbox: two paths would mean two
     * entries for one operation. The shell bridge owns that. */
    return sim.run({
      id: a.id + ":" + (payload && payload.id ? payload.id : (c.managerId || "")),
      label: label,
      realCall: (op && op.call) || (c.managerId + "." + a.id + "(" + (payload && payload.id ? payload.id : "") + ")"),
      outcome: (payload && payload.outcome) || (op && op.outcome) || "ok",
      detail: (payload && payload.detail) || (op && op.detail) ||
        "Simulated in this concept. A production build would run the owning service and receipt the result.",
      phases: ((op && op.phases) || ["Working"]).map(function (label2) { return { label: label2, weight: 1 }; }),
      onPhase: payload && payload.onPhase
    });
  }

  window.PMManagerKit = {
    register: register,
    spec: spec,
    has: has,
    ids: ids,
    ASSIGNMENT: ASSIGNMENT,
    CORE: CORE,
    EVERYWHERE: EVERYWHERE,
    CONCEPTS: CONCEPTS,
    assignedTo: assignedTo,
    homeOf: homeOf,
    act: act,
    statusTone: statusTone,
    reasonLine: reasonLine,
    routeLine: routeLine,
    emptyFor: emptyFor,
    familyLabel: familyLabel,
    installation: installation,
    installationsFor: installationsFor,
    attemptsFor: attemptsFor,
    OPERATION: OPERATION
  };

  /* ------------------------------------------- managers owned by the kit */

  /* Usage is a deferred_named_owner in all four concepts: Settings configures
   * the boundary, Usage measures and reports. Registering it once here is what
   * stops four concepts from inventing four different Usage stories. */
  register("manager-usage", function (data) {
    var snaps = (data.usage && data.usage.snapshots) || [];
    return {
      title: "Usage",
      purpose: "What Settings may configure about usage, and what only Usage can answer.",
      icon: "gauge",
      owner: {
        name: "Usage",
        why: "Measurement, history, projection and forecasting belong to Usage. Settings shows a read-only snapshot and configures the policy that reacts to it.",
        insertionContract: "Usage supplies a read-only snapshot per connection (included remaining, reset time, pressure, freshness, run-out estimate) and accepts deep links of the form usage://connection/<accountId>. Settings never computes a balance."
      },
      health: {
        status: "managed",
        statusWord: "Read-only here",
        headline: "Balances shown here are provider-reported and owned by Usage.",
        detail: "Settings decides what happens when included usage runs out. It does not measure how much is left.",
        counts: [
          { label: "Connections reported", value: snaps.length },
          { label: "Under pressure", value: snaps.filter(function (s) { return s.pressure === "high" || s.pressure === "exhausted"; }).length }
        ]
      },
      sections: [
        {
          id: "snapshot", label: "Provider-reported snapshot", kind: "list",
          summary: "Exactly what the providers last reported, with the time each figure was read.",
          items: snaps.map(function (s) {
            return {
              id: "usage-" + s.providerId + "-" + s.account,
              name: s.providerId + " · " + s.account,
              secondary: s.freshness,
              status: s.pressure === "exhausted" ? "attention" : (s.pressure === "high" ? "setup" : "ok"),
              statusWord: s.includedRemaining + " remaining",
              fields: { "Resets": s.resets, "Last use": s.lastUse, "Extra usage": s.extra, "Runs out": s.runOut },
              badges: [{ kind: "source", text: "Provider-reported", title: s.freshness }]
            };
          }),
          empty: { headline: "No connection is reporting usage", detail: "A provider that is ready may still not expose balances. That is a separate state from not being ready.", action: null }
        },
        {
          id: "boundary", label: "Where the boundary sits", kind: "prose",
          items: [
            { id: "boundary-settings", name: "Settings owns: what to do when included usage ends, which account is preferred, whether a thread sticks to one account, and the reserve that keeps a route available for verification." },
            { id: "boundary-usage", name: "Usage owns: measurement, history, projection, per-request attribution, exports, and the definition of a billing period." },
            { id: "boundary-note", name: (data.usage && data.usage.note) || "" }
          ]
        }
      ],
      diagnostics: [{ id: "usage-open", label: "Open Usage", kind: "report" }],
      notes: ["This card is a boundary, not a feature. It exists so that no concept quietly reimplements Usage inside Settings."]
    };
  });
})();
