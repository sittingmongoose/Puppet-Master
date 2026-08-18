/* Opus 5 — the manager semantics `shared/` never wrote.
 *
 * `shared/pm-data*.js` describes thirty-eight managers as headless ManagerSpecs,
 * and concepts 05-11 reuse every one of them rather than paraphrasing them a
 * seventh time. Twelve destinations the 2026-08-18 packet requires have no
 * builder there at all, and one of them is the flagship:
 *
 *   manager-providers  has a PMData record but no builder, because concepts
 *                      01-04 each hand-wrote the provider surface. Asking the
 *                      kit for it therefore lands on its "built elsewhere"
 *                      answer, which names another concept's page — the one
 *                      thing the packet treats as an automatic failure. The
 *                      semantics live here so all seven concepts can still draw
 *                      their own provider surface from the same truth.
 *   manager-doctor     a required family that was never authored.
 *   manager-dry        a required family that was never authored.
 *   manager-copy       the copy transaction shell. The engine is pm2-copy.js;
 *                      this file owns only the contract and the sections.
 *   owner-*            the eight named-owner shells.
 *
 * Every builder returns a RAW spec. `shared2/pm2-managers.js` normalises it
 * through the same contract the kit applies to its own builders, so a renderer
 * cannot tell which module wrote a manager — which is the point of having one
 * accessor.
 *
 * Nothing here fabricates a backend. An owner shell states its owner, its
 * destination and its return contract, exposes the one action that hands over,
 * and stops.
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------- helpers */

  /* PM2Model loads before this file but is read lazily anyway: a builder runs
   * when a manager is opened, never on load, so there is no reason to capture a
   * reference that would go stale if the model were rebuilt. */
  function model() {
    var m = window.PM2Model;
    if (!m) throw new Error("pm2-managers-extra: pm2-model.js must load first");
    return m;
  }

  /* The concepts drive fixtures from the route (?s=...) and the shared builders
   * read `demoState`. Accept either spelling rather than forcing every concept
   * to translate, and default to the ordinary picture. */
  function fixtureOf(state) {
    var s = state || {};
    return String(s.demoState || s.stateId || s.fixtureId || (s.fixture && s.fixture.id) || "normal");
  }

  function isOffline(state) {
    var f = fixtureOf(state);
    return f === "offline" || f === "reconnect-required";
  }

  function list(v) { return Array.isArray(v) ? v : []; }

  function countWhere(arr, fn) {
    var n = 0;
    list(arr).forEach(function (x) { if (fn(x)) n++; });
    return n;
  }

  function distinct(arr, key) {
    var seen = {};
    var n = 0;
    list(arr).forEach(function (x) {
      var k = String(x && x[key]);
      if (!seen[k]) { seen[k] = true; n++; }
    });
    return n;
  }

  /* Row sections carry setting ids, not copies of settings. Reading them out of
   * the inventory keeps a manager and its domain page showing the same rows even
   * after the inventory is regenerated. */
  function rowIds(sectionId, max) {
    var rows = model().rowsInSection(sectionId) || [];
    var ids = rows.map(function (r) { return r.id; });
    return max ? ids.slice(0, max) : ids;
  }

  /* ------------------------------------------------------------- records */

  /* pm2-model.js asks for these when a manager has no PMData record, so they
   * must stay in step with the titles the builders below emit. */
  var RECORDS = {
    "manager-providers": {
      title: "Providers, accounts and models",
      purpose: "Every route Puppet Master can invoke, what it can answer right now, and what happens when included usage ends.",
      icon: "cpu"
    },
    "manager-doctor": {
      title: "Doctor",
      purpose: "One honest health picture, and the owner that can repair each part of it.",
      icon: "wrench"
    },
    "manager-dry": {
      title: "Single-owner map",
      purpose: "Which component owns which responsibility, what Settings may configure about it, and what it must never do.",
      icon: "map"
    },
    "manager-copy": {
      title: "Copy settings from another Project",
      purpose: "A one-time transaction: preview, restore point, atomic apply, verification, receipt and rollback.",
      icon: "columns"
    },
    "owner-onboarding": {
      title: "Getting started",
      purpose: "Owned by Product Onboarding. Settings shows where it opens and how control returns.",
      icon: "graduation"
    },
    "owner-installation": {
      title: "Installation and deployment",
      purpose: "Owned by Installation & Deployment. Settings shows where it opens and how control returns.",
      icon: "download"
    },
    "owner-server-claim": {
      title: "Claim a Server",
      purpose: "Owned by Server Claim. Settings shows where it opens and how control returns.",
      icon: "key"
    },
    "owner-project-hosting": {
      title: "Project location and files",
      purpose: "Owned by Project Hosting. Settings shows where it opens and how control returns.",
      icon: "folder"
    },
    "owner-remote-access": {
      title: "Remote access",
      purpose: "Owned by Remote Access. Settings shows where it opens and how control returns.",
      icon: "globe"
    },
    "owner-project-move": {
      title: "Move this Project",
      purpose: "Owned by Project Move. Settings shows where it opens and how control returns.",
      icon: "route"
    },
    "owner-updates": {
      title: "Puppet Master updates",
      purpose: "Owned by Application Updates. Settings shows where it opens and how control returns.",
      icon: "refresh"
    },
    "owner-server-backup": {
      title: "Whole-Server backup",
      purpose: "Owned by Server Backup. Settings shows where it opens and how control returns.",
      icon: "archive"
    }
  };

  /* ---------------------------------------------------------- operations */

  /* What each action written in this file stands in for. pm2-managers.js merges
   * these into the payload it hands the shared act(), so a receipt names the
   * production call instead of claiming that a standalone page installed
   * something. Action ids the kit already describes are left alone. */
  var OPERATIONS = {
    "owner.open": {
      call: "OwnerHandoff.open(ownerId, returnTo)",
      detail: "Would open the named owner at its own entry point, carrying the destination this row names, and hand control back here when it finishes or is dismissed.",
      outcome: "handoff"
    },
    "doctor.checks.test_all": {
      call: "Doctor.runChecks(areaIds)",
      detail: "Would ask every area for its own health again — including the hosts that have not answered — and record which verdicts changed."
    },
    "doctor.open_owner": {
      call: "SettingsRouter.open(managerId, rowId)",
      detail: "Would move to the manager that owns this area, at the exact row the check names, with Back returning to Doctor.",
      outcome: "handoff"
    },
    "app.restart": {
      call: "ApplicationLifecycle.requestRestart(reason)",
      detail: "Would name every agent and operation waiting on the restart and ask before restarting. Nothing restarts on its own.",
      outcome: "handoff"
    },
    "index.retry_failed": {
      call: "ProjectIndex.retry(fileIds)",
      detail: "Would re-read only the files that could not be parsed and leave the rest of the index alone."
    },
    "dry.explain": {
      call: "SingleOwnerMap.explain(responsibilityId)",
      detail: "Would show which component answers this responsibility at runtime, where its adapter is bound, and which callers hold a reference to it."
    },
    "provider.install.start_setup": {
      call: "ProviderOnboardingService.startSetup(providerId, hostId)",
      detail: "Would start an installation you asked for, from the provider's official source, for the exact host selected here. Signing in is a separate step afterwards.",
      outcome: "handoff"
    },
    "provider.open_subpage": {
      call: "SettingsRouter.open('manager-providers', sectionKey)",
      detail: "Would open the provider subpage this row names, keeping the selected provider and the Back destination.",
      outcome: "handoff"
    },
    "copy.start": {
      call: "SettingsCopyTransaction.begin(targetProjectId)",
      detail: "Would open the copy transaction at source selection. Nothing is read from a source until one is chosen."
    },
    "copy.select_source": {
      call: "SettingsCopyTransaction.selectSource(sourceProjectId)",
      detail: "Would read the source Project's settings for the chosen categories. The source is never written to."
    },
    "copy.preview": {
      call: "SettingsCopyTransaction.preview(sourceProjectId, categoryIds)",
      detail: "Would compute additions, replacements, unchanged rows, unavailable references and conflicts, without changing anything."
    },
    "copy.apply": {
      call: "SettingsCopyTransaction.apply(previewId)",
      detail: "Would take a restore point, apply the previewed plan as one unit, read every changed key back, and write a receipt."
    },
    "copy.rollback": {
      call: "SettingsCopyTransaction.rollback(receiptId)",
      detail: "Would restore every value captured in the restore point named by this receipt."
    }
  };

  /* ============================================================ PROVIDERS */

  /* The one manager the packet asks every concept to build at full depth. The
   * density rule governs the shape: the default view answers connected state,
   * selected account, available models, usage-end behaviour, routing and
   * setup/repair — and credentials, installations, catalogues, limits and logs
   * are named as their own subpages instead of being poured onto this screen. */

  function preferredAccount(p) {
    var best = null;
    list(p.accounts).forEach(function (a) {
      if (a.status !== "connected") return;
      if (!best || (a.priority || 99) < (best.priority || 99)) best = a;
    });
    return best;
  }

  /* Settings owns the answer to "what happens when included usage ends"; Usage
   * owns the balance that triggers it. Say which of those two this row is. */
  function usageEndAnswer(p) {
    var a = preferredAccount(p);
    if (!a) return p.installed ? "Nothing to decide until an account is connected." : "Nothing to decide until it is set up.";
    var next = a.nextAction || {};
    if (next.chosen) return next.chosen;
    if (list(next.options).length) return "Not chosen yet — " + list(next.options).length + " ways to continue are offered";
    return "Not applicable to this connection";
  }

  function providersSpec(data, state) {
    var providers = list(data && data.providers);
    var record = (data && data.managers && data.managers["manager-providers"]) || {};
    var catalog = record.catalog || {};
    var installs = list(data && data.installations);
    var offline = isOffline(state);
    var refreshing = fixtureOf(state) === "loading" || fixtureOf(state) === "loading-cached";

    var connectedAccounts = [];
    providers.forEach(function (p) {
      list(p.accounts).forEach(function (a) {
        if (a.status === "connected" || a.status === "degraded") connectedAccounts.push({ provider: p, account: a });
      });
    });

    var needsAttention = countWhere(providers, function (p) { return p.status !== "ok"; });
    var families = {};
    installs.forEach(function (i) { families[i.providerFamilyId] = (families[i.providerFamilyId] || 0) + 1; });
    var shadowed = 0;
    Object.keys(families).forEach(function (k) { if (families[k] > 1) shadowed += families[k] - 1; });
    var manualOnly = countWhere(installs, function (i) { return i.confidence === "unknown" || i.installationOwnerKind === "unknown"; });

    return {
      title: RECORDS["manager-providers"].title,
      purpose: RECORDS["manager-providers"].purpose,
      icon: RECORDS["manager-providers"].icon,
      health: {
        status: needsAttention ? "attention" : "ok",
        statusWord: needsAttention ? needsAttention + " of " + providers.length + " need attention" : "All ready",
        headline: offline
          ? "No route to a remote provider. Every line below is the last answer received, with the time it was read."
          : needsAttention + " provider families need something from you; the rest can answer right now.",
        detail: refreshing
          ? "Catalogues are refreshing. The values already on screen are the last known good ones and stay until the refresh finishes."
          : "This view answers the questions people arrive with. Credentials, installations, catalogues, limits and logs each have their own subpage.",
        counts: [
          { label: "Families", value: providers.length },
          { label: "Connected accounts", value: connectedAccounts.length },
          { label: "Installations found", value: installs.length },
          { label: "Need attention", value: needsAttention }
        ]
      },
      primary: { id: "provider.install.start_setup", label: "Set up a provider", kind: "create" },
      search: { placeholder: "Search providers, accounts and models", fields: ["name", "secondary"] },
      sections: [
        {
          id: "families",
          label: "Providers",
          kind: "cards",
          summary: "One card per family, answering the same six questions in the same order. Everything deeper is a subpage, not another column here.",
          items: providers.map(function (p) {
            var pref = preferredAccount(p);
            var models = list(p.models);
            var ready = countWhere(models, function (m) { return m.available !== false; });
            var actions = [];
            if (!p.installed) {
              actions.push({ id: "provider.install.start_setup", label: "Set up " + p.name, kind: "primary" });
            } else if (p.status !== "ok") {
              actions.push({ id: "provider.auth.revalidate", label: "Check what is wrong", kind: "primary" });
            }
            actions.push({ id: "provider.open_subpage", label: "Accounts and models", kind: "quiet" });

            return {
              id: "prov-" + p.id,
              name: p.name,
              secondary: p.summary,
              status: p.status || "ok",
              statusWord: p.statusWord || "",
              badges: [{
                kind: "source",
                text: "Sign-in owned by " + (p.credentialOwner || p.name),
                title: p.oauthNote || "Puppet Master selects the profile and launches the provider's own login. It never presents a sign-in of its own."
              }],
              fields: {
                "Connected": p.installed
                  ? countWhere(p.accounts, function (a) { return a.status === "connected"; }) + " of " + list(p.accounts).length + " accounts ready"
                  : "Not installed on this computer",
                "Selected account": pref ? pref.identity + " · " + pref.product : (p.installed ? "None ready" : "Set up first"),
                "Models ready": models.length ? ready + " of " + models.length : "None until it is connected",
                "When included usage ends": usageEndAnswer(p),
                "Routing": (p.routing && p.routing.note) || "Follows this Project's order of preference",
                "Last read": offline ? "Cached — the host has not answered since 9:04" : (refreshing ? "Refreshing now" : "Minutes ago")
              },
              detail: [{
                id: "prov-" + p.id + "-detail",
                label: "How this family is reached",
                rows: [
                  { label: "Installed", value: p.installed ? (p.version || "Yes") : "No", hint: p.installed ? "" : "Nothing is installed until you ask for it." },
                  { label: "Isolation", value: p.isolation || "", hint: "Each profile owns its own login directory." },
                  { label: "Credentials", value: "Held by " + (p.credentialOwner || p.name), hint: "Puppet Master stores no provider secret and never displays one." }
                ]
              }],
              actions: actions
            };
          }),
          empty: {
            headline: "No provider family is configured",
            detail: "Set one up and it appears here with its accounts, its models and what it does when included usage ends.",
            action: { id: "provider.install.start_setup", label: "Set up a provider", kind: "primary" }
          }
        },
        {
          id: "usage-end",
          label: "When included usage ends",
          kind: "table",
          summary: "The only usage decision Settings owns. The balance that triggers it is provider-reported and belongs to Usage.",
          columns: [
            { key: "chosen", label: "Chosen", weight: 2 },
            { key: "options", label: "Also offered", weight: 3 },
            { key: "reported", label: "Provider-reported", weight: 2 }
          ],
          items: connectedAccounts.map(function (pair) {
            var a = pair.account;
            var next = a.nextAction || {};
            var usage = a.usage || {};
            return {
              id: "end-" + a.id,
              name: pair.provider.name + " · " + (a.nickname || a.identity),
              secondary: a.product || "",
              status: usage.pressure === "exhausted" ? "attention" : (usage.pressure === "high" ? "setup" : "ok"),
              statusWord: next.chosen ? "Decided" : "Not decided",
              fields: {
                chosen: next.chosen || "Ask each time",
                options: list(next.options).length ? list(next.options).join(" · ") : "Nothing else applies to this connection",
                reported: (usage.includedRemaining || "Unknown") + (usage.resetsIn && usage.resetsIn !== "Not applicable" ? " · resets " + usage.resetsIn : "")
              },
              badges: [{ kind: "source", text: "Provider-reported", title: usage.note || "" }]
            };
          }),
          empty: {
            headline: "No connection is reporting a balance",
            detail: "A provider can be perfectly ready and still not publish one. That is a different state from not being ready.",
            action: null
          }
        },
        {
          id: "subpages",
          label: "The rest of this manager",
          kind: "list",
          summary: "Coordinated subpages rather than one wall. Each keeps the selected provider, the breadcrumb and the Back destination.",
          items: [
            {
              id: "sub-credentials", name: "Credentials and sign-in", secondary: "Which profile each account uses, and who holds the secret",
              status: "ok", statusWord: countWhere(providers, function (p) { return list(p.accounts).length > 0; }) + " families with accounts",
              fields: {
                "Held by": "Each provider's own CLI or adapter, inside an isolated profile",
                "Shown here": "Never. No key, token or profile file is read, rendered or exported"
              },
              actions: [{ id: "provider.open_subpage", label: "Open credentials", kind: "quiet" }]
            },
            {
              id: "sub-installations", name: "Installations", secondary: "What is on this machine and which one this Project uses",
              status: shadowed || manualOnly ? "attention" : "ok",
              statusWord: installs.length + " found on " + distinct(installs, "hostOrEnvironmentId") + " hosts",
              fields: {
                "Shadowed candidates": shadowed ? String(shadowed) : "None",
                "Owner cannot be named": manualOnly ? manualOnly + " — manual only" : "None",
                "Bound by": "Identity, so a change in PATH order cannot move it"
              },
              actions: [{ id: "provider.open_subpage", label: "Open installations", kind: "quiet" }]
            },
            {
              id: "sub-catalogues", name: "Model catalogues", secondary: catalog.note || "Where the model list comes from",
              status: countWhere(catalog.sources, function (s) { return s.validation === "failed"; }) ? "attention" : "ok",
              statusWord: list(catalog.sources).length + " sources",
              fields: {
                "Quarantined": countWhere(catalog.sources, function (s) { return s.validation === "failed"; }) + " — the last known good copy keeps serving",
                "Activated": (list(catalog.sources)[0] || {}).activatedAt || "Unknown"
              },
              actions: [{ id: "provider.models.refresh", label: "Refresh catalogues", kind: "quiet" }]
            },
            {
              id: "sub-limits", name: "Limits and routing", secondary: "Order of preference, sticky threads and the reserve",
              status: "ok", statusWord: "Project policy",
              fields: {
                "Owned here": "Which account is preferred, whether a thread sticks to one account, and the reserve kept for verification",
                "Owned by Usage": "Measurement, history, projection and the billing period"
              },
              actions: [{ id: "provider.open_subpage", label: "Open limits and routing", kind: "quiet" }]
            },
            {
              id: "sub-logs", name: "Logs and diagnostics", secondary: "The evidence behind every readiness word on this screen",
              status: "ok", statusWord: "Read-only",
              fields: {
                "Contains": "Adapter handshakes, catalogue validation results and the last failure per route",
                "Retention": "Bounded by size, oldest first"
              },
              actions: [{ id: "provider.open_subpage", label: "Open diagnostics", kind: "quiet" }]
            }
          ]
        },
        {
          id: "acquisition",
          label: "How a provider tool gets onto this machine",
          kind: "prose",
          summary: "The rule is short, and every button on this screen obeys it.",
          items: [
            { id: "acq-none", name: "Nothing is bundled. No provider tool ships inside Puppet Master, sits in a default environment, or arrives as a pre-seeded package." },
            { id: "acq-explicit", name: "The first acquisition is an Install you start, from the provider's official source, for the exact host you selected. A Project, a model, a Goal, a Plan or an agent asking for it is not consent." },
            { id: "acq-auth", name: "Signing in is a separate step afterwards, run by the provider's own login inside its own profile." },
            { id: "acq-demand", name: "When a run needs a tool that is not installed, the run is kept and Settings opens the exact setup row. It resumes only after you have installed and signed in, and only if it is still the current request." },
            { id: "acq-auto", name: "Automatic update policy applies to an installation that has already been acquired and bound. Auto and On maintain what exists; they never acquire the first copy." },
            { id: "acq-manual", name: "An installation whose owner cannot be named stays manual only. Puppet Master will not adopt, update or repair something it cannot identify." }
          ]
        },
        {
          id: "provider-rows",
          label: "Model defaults for this Project",
          kind: "rows",
          summary: "Ordinary rows, shown here because they decide which route the cards above are asked for first.",
          settings: rowIds("ai.models.s01", 7)
        }
      ],
      diagnostics: [
        { id: "diag-provider-handshake", label: "Open the adapter handshake log", kind: "log" },
        { id: "diag-provider-catalog", label: "Open the catalogue validation report", kind: "report" }
      ],
      notes: [
        "Readiness is the provider's answer, not a guess. A family that is authenticated but failing to generate says exactly that, rather than being called ready."
      ]
    };
  }

  /* =============================================================== DOCTOR */

  /* A read-only health projection with repair routing. Doctor owns no repair
   * logic: each check names the manager that owns the area and offers that
   * manager's own operation, so there is one repair path per problem instead of
   * two that can disagree. Three verdicts are kept apart on purpose — healthy,
   * failing, and no evidence — because a check that could not run is not a
   * passing check. */
  function doctorSpec(data, state) {
    var offline = isOffline(state);
    var restartFixture = fixtureOf(state) === "restart-required";

    var checks = [
      {
        id: "chk-providers",
        name: "Provider readiness",
        secondary: "Can every configured route answer?",
        status: "risky",
        statusWord: "Failing",
        fields: {
          owner: "Providers, accounts and models",
          evidence: "The personal Claude profile has no signed-in identity, so the second account cannot answer. The work profile still can.",
          checked: "4 minutes ago"
        },
        detail: [{
          id: "chk-providers-detail",
          label: "What failing means here",
          rows: [
            { label: "Effect", value: "One configured route is unusable", hint: "A run that names that account stops with the reason rather than switching account silently." },
            { label: "Not affected", value: "The work profile, OpenAI, Copilot and Ollama", hint: "" },
            { label: "Doctor's part", value: "Report and route", hint: "Signing in happens in the provider's own flow, and it is separate from installing anything." }
          ]
        }],
        actions: [
          { id: "provider.auth.start_setup", label: "Sign in to the personal profile", kind: "primary" },
          { id: "doctor.open_owner", label: "Open providers", kind: "quiet" }
        ]
      },
      {
        id: "chk-hosts",
        name: "Execution hosts",
        secondary: "Is every host this Project uses reachable?",
        status: "unavailable",
        statusWord: "Could not run",
        fields: {
          owner: "Servers and hosts",
          evidence: "Home TrueNAS has not answered since 9:04, so there is no host report to read. No evidence is not the same as a healthy host, and Doctor will not round it up.",
          checked: "Attempted 4 minutes ago"
        },
        actions: [
          { id: "doctor.checks.test_all", label: "Retry the host check", kind: "primary" },
          { id: "doctor.open_owner", label: "Open servers and hosts", kind: "quiet" }
        ]
      },
      {
        id: "chk-tools",
        name: "Provider tools on this machine",
        secondary: "Does each family resolve to one identified installation?",
        status: "attention",
        statusWord: "Degraded",
        fields: {
          owner: "Providers › Installations",
          evidence: "Two installations answer for one family on this computer. The one this Project uses is bound by identity, so PATH order cannot move it; the other is shadowed, and a third has an owner Puppet Master cannot name, which keeps it manual only.",
          checked: "4 minutes ago"
        },
        actions: [
          { id: "installation.select", label: "Choose which installation this Project uses", kind: "primary" },
          { id: "doctor.open_owner", label: "Open installations", kind: "quiet" }
        ]
      },
      {
        id: "chk-index",
        name: "Project search index",
        secondary: "Can retrieval see the current working tree?",
        status: "attention",
        statusWord: "Degraded",
        fields: {
          owner: "Index health, exclusions and rebuild",
          evidence: "61 changed files are queued and 3 cannot be read, so retrieval answers from a slightly old picture instead of failing loudly.",
          checked: "2 minutes ago"
        },
        actions: [
          { id: "index.retry_failed", label: "Retry the files that could not be read", kind: "primary" },
          { id: "doctor.open_owner", label: "Open the index", kind: "quiet" }
        ]
      },
      {
        id: "chk-storage",
        name: "Storage and retention",
        secondary: "Is there room, and can anything actually be restored?",
        status: "ok",
        statusWord: "Healthy",
        fields: {
          owner: "Storage, retention and recovery",
          evidence: "18.4 GB free on the Project volume, every retention window inside its budget, and the most recent recovery point verified end to end.",
          checked: "9 minutes ago"
        },
        actions: [{ id: "doctor.open_owner", label: "Open storage", kind: "quiet" }]
      },
      {
        id: "chk-permissions",
        name: "Permissions and file access",
        secondary: "Are the rules in force the rules that are written down?",
        status: "setup",
        statusWord: "Restart required",
        fields: {
          owner: "Permissions & FileSafe",
          evidence: "The rule set changed at 10:41. Agents that were already running keep the rules they started with, so the new rules are not in force everywhere until Puppet Master restarts.",
          checked: restartFixture ? "Just now" : "4 minutes ago"
        },
        detail: [{
          id: "chk-permissions-detail",
          label: "What the restart changes",
          rows: [
            { label: "In force now", value: "The rule set from 08:00", hint: "Three running agents hold it." },
            { label: "Written down", value: "The rule set from 10:41", hint: "New agents already start with it." },
            { label: "Until then", value: "Both are reported, never merged", hint: "A rule that is not yet in force is never shown as if it were." }
          ]
        }],
        actions: [
          { id: "app.restart", label: "Restart Puppet Master", kind: "primary" },
          { id: "doctor.open_owner", label: "Review the rules", kind: "quiet" }
        ]
      },
      {
        id: "chk-network",
        name: "Network routes",
        secondary: "Do the endpoints this Project needs answer?",
        status: offline ? "risky" : "ok",
        statusWord: offline ? "Failing" : "Healthy",
        fields: {
          owner: "Web, search, fetch and crawl",
          evidence: offline
            ? "No route reached any remote endpoint on the last attempt. Every remote check on this screen is therefore running on cached evidence and says when it was read."
            : "Every configured endpoint answered inside its timeout on the last attempt.",
          checked: "4 minutes ago"
        },
        actions: [{ id: "doctor.checks.test_all", label: "Re-run the network check", kind: "quiet" }]
      }
    ];

    var failing = countWhere(checks, function (c) { return c.status === "risky"; });
    var degraded = countWhere(checks, function (c) { return c.status === "attention"; });
    var noEvidence = countWhere(checks, function (c) { return c.status === "unavailable"; });
    var waiting = countWhere(checks, function (c) { return c.status === "setup"; });

    return {
      title: RECORDS["manager-doctor"].title,
      purpose: RECORDS["manager-doctor"].purpose,
      icon: RECORDS["manager-doctor"].icon,
      owner: {
        name: "the manager that owns each area",
        why: "Doctor is an aggregator. It reads each area's own health and offers that area's own repair, so a problem has one repair path rather than two that can drift apart.",
        insertionContract: "Doctor reads each manager's health block and starts the owning manager's operation. It writes no value, holds no state of its own, and adds no repair logic."
      },
      health: {
        status: failing ? "attention" : (degraded ? "setup" : "ok"),
        statusWord: failing + " failing · " + degraded + " degraded · " + noEvidence + " could not run",
        headline: "Seven areas were checked. " + failing + " failed, " + degraded + " are degraded, " + waiting +
          " is waiting for a restart, and " + noEvidence + " could not run at all.",
        detail: "Every line below names the manager that owns it. Repairs are that manager's own operations, watched here while they run.",
        counts: [
          { label: "Areas checked", value: checks.length },
          { label: "Failing", value: failing },
          { label: "Degraded", value: degraded },
          { label: "No evidence", value: noEvidence }
        ]
      },
      primary: { id: "doctor.checks.test_all", label: "Run every check again", kind: "create" },
      search: { placeholder: "Search checks", fields: ["name", "secondary"] },
      sections: [
        {
          id: "readiness",
          label: "Overall readiness",
          kind: "list",
          summary: "What this Project can and cannot do right now, in the words someone would use to ask.",
          items: [
            {
              id: "ready-now",
              name: "Can this Project work right now?",
              secondary: "Answered from the checks below, not from a separate opinion",
              status: "attention",
              statusWord: "Partly",
              fields: {
                "Plan and review": "Yes",
                "Run code on this computer": "Yes",
                "Use every configured provider": "No — one account is signed out",
                "Retrieve from the Project index": "Degraded — 61 files are queued",
                "Run work on the Home Server": offline ? "Unknown — the host has not answered" : "Unknown until the host answers"
              }
            },
            {
              id: "ready-last",
              name: "The last full check",
              secondary: "Doctor keeps the time it read each answer, because a stale verdict is worse than none",
              status: noEvidence ? "setup" : "ok",
              statusWord: "4 minutes ago",
              fields: {
                "Areas": String(checks.length),
                "Could not run": String(noEvidence),
                "How it ran": "One permit from the resource governor, like any other operation",
                "Next automatic check": "Tomorrow, 09:00"
              },
              actions: [{ id: "doctor.checks.test_all", label: "Check again now", kind: "quiet" }]
            }
          ]
        },
        {
          id: "checks",
          label: "Area checks",
          kind: "table",
          summary: "One row per area, each with the manager that owns it, what the check actually read, and the repair that owner offers.",
          columns: [
            { key: "owner", label: "Owned by", weight: 2 },
            { key: "evidence", label: "What the check read", weight: 5 },
            { key: "checked", label: "Checked", weight: 1, align: "end" }
          ],
          items: checks
        },
        {
          id: "history",
          label: "Recent history",
          kind: "list",
          summary: "When each verdict last changed, so a problem that has been open for a week does not look new.",
          items: [
            {
              id: "hist-permissions", name: "Permissions rule set changed", secondary: "Today, 10:41",
              status: "setup", statusWord: "Still open",
              fields: { "Noticed by": "The permissions check, four minutes later", "Cleared": "Not yet — a restart is what clears it" }
            },
            {
              id: "hist-host", name: "Home TrueNAS stopped answering", secondary: "Today, 9:04",
              status: "unavailable", statusWord: "Still open",
              fields: { "Noticed by": "The host check, on its next pass", "Effect": "Host and remote checks have had no evidence since" }
            },
            {
              id: "hist-signout", name: "The personal Claude profile signed out", secondary: "Today, 8:15",
              status: "risky", statusWord: "Still open",
              fields: { "Noticed by": "The provider readiness check", "Effect": "One configured route cannot answer" }
            },
            {
              id: "hist-index", name: "Index rebuild finished", secondary: "Yesterday, 17:02",
              status: "ok", statusWord: "Cleared",
              fields: { "Result": "4,182 files indexed, 3 unreadable", "Cleared": "The index check returned to healthy for 14 hours" }
            }
          ],
          empty: {
            headline: "No verdict has changed yet",
            detail: "The first full check writes the starting picture here, and every change to it afterwards.",
            action: null
          }
        },
        {
          id: "not-owned",
          label: "What Doctor does not do",
          kind: "prose",
          items: [
            { id: "doc-not-repair", name: "Doctor repairs nothing itself. Every repair offered above is the owning manager's own operation; Doctor starts it, shows it while it runs, and keeps the receipt." },
            { id: "doc-not-state", name: "Doctor holds no state. Each line is the owning area's own health, read at the time shown, and forgotten when the next check replaces it." },
            { id: "doc-not-schedule", name: "Doctor does not schedule. A check asks the one resource governor for a permit like any other operation, and a check that is queued says it is queued." },
            { id: "doc-not-soften", name: "Doctor never turns a failure into a warning to make the screen calmer, and never reports a check it could not run as a pass." },
            { id: "doc-not-hide", name: "Doctor is not a second place to change settings. Where a check names a value, it opens the row that owns it." }
          ]
        },
        {
          id: "doctor-rows",
          label: "Checkup settings",
          kind: "rows",
          summary: "How often the automatic checkup runs and what it covers.",
          settings: rowIds("system.health.s02", 6)
        }
      ],
      diagnostics: [
        { id: "diag-doctor-report", label: "Open the last full check report", kind: "report" },
        { id: "diag-doctor-log", label: "Open the check log", kind: "log" }
      ],
      notes: [
        "Healthy, failing and no evidence are three different answers, and Doctor keeps them apart even when that makes the screen look worse."
      ]
    };
  }

  /* ============================================================ DRY METHOD */

  /* The visible half of the DRY Method: one owner per responsibility, written
   * down where a reader can check it. This manager exists because duplication
   * is invisible until someone draws the map — and because Settings is the most
   * likely place for a second owner to appear by accident. */
  function drySpec() {
    var gov = (window.PMWork && window.PMWork.governor) ? window.PMWork.governor : null;
    var pol = gov && typeof gov.policy === "function" ? gov.policy() : null;
    var installs = list(window.PMData && window.PMData.installations);
    var families = {};
    installs.forEach(function (i) { families[i.providerFamilyId] = true; });
    var manualOnly = countWhere(installs, function (i) { return i.confidence === "unknown" || i.installationOwnerKind === "unknown"; });

    var profileWord = pol
      ? (pol.profile === "auto" ? "Auto" : pol.profile === "performance" ? "Performance" : pol.profile === "efficiency" ? "Efficiency" : "Legacy")
      : "Not readable from here";

    var RESPONSIBILITIES = [
      {
        id: "dry-governor", name: "Deciding what may run now", owner: "RuntimeResourceGovernor",
        settings: "The behaviour profile, whether background work is allowed, and how to react to a metered network, battery or thermal pressure.",
        never: "Admit, queue, degrade or refuse work; size a pool; pin a core; or start a second scheduler."
      },
      {
        id: "dry-work", name: "Reporting a long operation", owner: "ObservableWork",
        settings: "Whether an operation may continue in the background, and where its completion is announced.",
        never: "Show progress without a real denominator, run a private timer, or keep a second copy of an operation's state."
      },
      {
        id: "dry-locator", name: "Finding the executable behind a name", owner: "BinaryLocator",
        settings: "Which installation this Project uses, chosen by identity, and whether the resolved launcher and package identity appear in Advanced details.",
        never: "Bind to a bare command name, reorder the search path on your behalf, or adopt an installation whose owner it cannot name."
      },
      {
        id: "dry-provider", name: "Whether a provider can answer", owner: "The provider's own tool or adapter",
        settings: "Which account is preferred, whether a thread stays on one account, and what happens when included usage ends.",
        never: "Hold a provider secret, read a credential, or call a provider ready before the provider says so."
      },
      {
        id: "dry-project", name: "Who this Project is", owner: "The Project record",
        settings: "Every value on every Settings screen, for this Project and no other.",
        never: "Write a value into another Project, keep two Projects in step, or offer a reusable profile."
      },
      {
        id: "dry-browser", name: "Driving a browser as a person", owner: "AuthBrowserSession",
        settings: "Which browser profile testing uses, and where its artifacts are kept.",
        never: "Automate the protected human sign-in session, replay it, or record what is typed into it."
      },
      {
        id: "dry-integration", name: "Acquiring and maintaining an integration", owner: "The shared integration runtime",
        settings: "The update policy and channel for an installation that has already been acquired and bound.",
        never: "Perform a first acquisition without an explicit Install, bundle a provider tool, or treat Auto as consent to acquire one."
      }
    ];

    return {
      title: RECORDS["manager-dry"].title,
      purpose: RECORDS["manager-dry"].purpose,
      icon: RECORDS["manager-dry"].icon,
      owner: {
        name: "The DRY Method",
        why: "One responsibility, one owner. The map is shown here because Settings touches all of them and is the easiest place to accidentally become the second owner of one.",
        insertionContract: "Settings reads each owner's projection and writes only the policy each owner accepts. It never creates a governor, an operation store, an executable resolver, a credential store or a second Project record."
      },
      health: {
        status: "ok",
        statusWord: "One owner each",
        headline: "Seven responsibilities, seven owners, no duplicates.",
        detail: "This screen is read-only. Everything it configures is written back to the owner that already exists, not kept here.",
        counts: [
          { label: "Responsibilities", value: RESPONSIBILITIES.length },
          { label: "Duplicate owners", value: 0 },
          { label: "Read-only projections", value: 4 }
        ]
      },
      primary: { id: "dry.explain", label: "Explain a binding", kind: "report" },
      sections: [
        {
          id: "owners",
          label: "Who owns what",
          kind: "matrix",
          summary: "Read a row as one sentence: this responsibility belongs to that owner, Settings may configure this much of it, and never that.",
          columns: [
            { key: "owner", label: "Owner", weight: 2 },
            { key: "settings", label: "Settings may configure", weight: 4 },
            { key: "never", label: "Settings never", weight: 4 }
          ],
          items: RESPONSIBILITIES.map(function (r) {
            return {
              id: r.id,
              name: r.name,
              secondary: "",
              status: "ok",
              statusWord: "One owner",
              fields: { owner: r.owner, settings: r.settings, never: r.never },
              actions: [{ id: "dry.explain", label: "Where is it bound?", kind: "quiet" }]
            };
          })
        },
        {
          id: "bindings",
          label: "What is bound right now",
          kind: "list",
          summary: "The live bindings behind the map, read from the running application rather than described.",
          items: [
            {
              id: "bind-governor", name: "Resource governor", secondary: "One instance for the whole application",
              status: "ok", statusWord: "Bound",
              fields: {
                "Profile in force": profileWord,
                "Background work": pol ? (pol.backgroundWork === "when_idle" ? "When idle" : pol.backgroundWork === "always" ? "Always" : "Never") : "Unknown",
                "Asked by": "Every operation Settings starts, before it starts"
              }
            },
            {
              id: "bind-work", name: "Operation store", secondary: "One place a long operation can live",
              status: "ok", statusWord: "Bound",
              fields: {
                "Opened through": "ObservableWork, including every simulated operation on these screens",
                "Progress": "Only where a real denominator exists; otherwise an honest wait reason",
                "Receipts": "One per operation, delivered to the one inbox"
              }
            },
            {
              id: "bind-locator", name: "Executable resolution", secondary: "One resolver for every installed tool",
              status: manualOnly ? "attention" : "ok",
              statusWord: manualOnly ? manualOnly + " manual only" : "Bound",
              fields: {
                "Families with a candidate": String(Object.keys(families).length),
                "Candidates found": String(installs.length),
                "Owner cannot be named": manualOnly ? manualOnly + " — left manual, never adopted automatically" : "None"
              }
            },
            {
              id: "bind-browser", name: "Human browser session", secondary: "The protected sign-in surface",
              status: "managed", statusWord: "Human only",
              fields: {
                "Automated by": "Nothing, by design",
                "Why": "A session a person signs into is not a test fixture, and nothing in Settings may drive it"
              }
            }
          ]
        },
        {
          id: "conflicts",
          label: "Duplicate owners",
          kind: "list",
          summary: "The check this manager exists to answer.",
          items: [
            {
              id: "dry-no-duplicates",
              name: "No responsibility above has two owners",
              secondary: "Checked against the bindings when this screen was built",
              status: "ok",
              statusWord: "None found",
              fields: {
                "What would appear here": "The responsibility, both owners, and which one Settings would have to stop writing to",
                "Why it is shown empty-handed": "An empty screen would look like a screen that had not loaded"
              }
            }
          ],
          empty: {
            headline: "No duplicate owners",
            detail: "If one ever appeared it would be named here, with both owners and the value that has to move.",
            action: null
          }
        },
        {
          id: "boundary",
          label: "Where Settings stops",
          kind: "prose",
          items: [
            { id: "dry-b1", name: "Settings configures. It never becomes the second owner of anything above: there is one governor, one operation store, one executable resolver and one Project record, and this screen writes to all four rather than replacing any of them." },
            { id: "dry-b2", name: "When a screen needs an answer an owner holds, it reads that owner's projection and says when it was read. It does not compute a second version of the answer." },
            { id: "dry-b3", name: "Measurement belongs to Usage. Settings decides what happens at the boundary; it never counts what is left." },
            { id: "dry-b4", name: "Where the product does not expose an owner yet, Settings shows the destination and the owner's name instead of inventing a state machine for it." }
          ]
        }
      ],
      diagnostics: [{ id: "diag-dry-bindings", label: "Open the binding report", kind: "report" }],
      notes: [
        "A responsibility with two owners is not a style problem: the two disagree eventually, and the reader is the one who finds out."
      ]
    };
  }

  /* ================================================================= COPY */

  /* The transaction's contract and section structure. The engine lives in
   * shared2/pm2-copy.js and is read defensively, because a manager must still
   * describe itself honestly when the engine has not loaded — it simply says
   * that nothing has been previewed rather than inventing counts. */
  function copySpec(data, state) {
    var m = model();
    var copy = window.PM2Copy;
    var sources = [];
    var receipts = [];
    var preview = null;

    if (copy && typeof copy.sources === "function") {
      try { sources = list(copy.sources()); } catch (e) { sources = []; }
    }
    if (!sources.length) sources = list(m.otherProjects);

    if (copy && typeof copy.receipts === "function") {
      try { receipts = list(copy.receipts()); } catch (e) { receipts = []; }
    }

    var selection = (state && state.copy) || {};
    if (copy && typeof copy.preview === "function" && selection.sourceId) {
      try { preview = copy.preview(selection.sourceId, selection.domainIds || null); } catch (e) { preview = null; }
    }

    var counts = (preview && preview.counts) || {};
    function previewed(key) {
      return counts[key] === undefined || counts[key] === null ? "Not previewed yet" : counts[key];
    }

    var sourceName = "";
    sources.forEach(function (s) { if (s.id === selection.sourceId) sourceName = s.name; });

    var OUTCOMES = [
      {
        id: "out-additions", name: "Additions", count: previewed("additions"),
        meaning: "The source has a value for a row this Project has never set.",
        apply: "The value is written and the row stops saying Not set."
      },
      {
        id: "out-replacements", name: "Replacements", count: previewed("replacements"),
        meaning: "Both Projects have a value and they differ.",
        apply: "This Project's value is captured in the restore point, then replaced."
      },
      {
        id: "out-unchanged", name: "Unchanged", count: previewed("unchanged"),
        meaning: "Both Projects already agree.",
        apply: "Nothing. Unchanged rows are counted so the total adds up, not so they can be written twice."
      },
      {
        id: "out-unavailable", name: "Unavailable", count: previewed("unavailable"),
        meaning: "The source names something this machine or this Project does not have — a host, an account, an installation.",
        apply: "Nothing. The row keeps its current value and the missing thing is named in the receipt."
      },
      {
        id: "out-conflicts", name: "Conflicts", count: previewed("conflicts"),
        meaning: "The copied value would contradict something already true here, such as a managed policy or a value changed elsewhere while the preview was open.",
        apply: "Nothing until it is resolved. A conflict is never applied on a guess."
      }
    ];

    return {
      title: RECORDS["manager-copy"].title,
      purpose: RECORDS["manager-copy"].purpose,
      icon: RECORDS["manager-copy"].icon,
      health: {
        status: receipts.length ? "ok" : "setup",
        statusWord: receipts.length ? receipts.length + " completed" : "Nothing copied yet",
        headline: "Copy another Project's settings into this one, once.",
        detail: "This is a transaction, not a link. When it finishes the two Projects are independent and nothing propagates in either direction.",
        counts: [
          { label: "Sources", value: sources.length },
          { label: "Categories", value: list(m.domains).length },
          { label: "Receipts", value: receipts.length },
          { label: "Preview", value: preview ? "Ready" : "Not run" }
        ]
      },
      primary: { id: "copy.start", label: "Start a copy", kind: "create" },
      search: { placeholder: "Search sources and categories", fields: ["name", "secondary"] },
      sections: [
        {
          id: "source",
          label: "Choose a source",
          kind: "list",
          summary: "Other Projects on this machine, read-only. Nothing is written back to them and nothing stays connected afterwards.",
          items: sources.map(function (s) {
            return {
              id: "src-" + s.id,
              name: s.name,
              secondary: s.updated || "",
              status: selection.sourceId === s.id ? "ok" : "setup",
              statusWord: selection.sourceId === s.id ? "Selected" : "Available",
              fields: {
                "Categories": s.categories == null ? "Unknown until it is read" : String(s.categories),
                "Settings": s.settings == null ? "Unknown until it is read" : String(s.settings),
                "Note": s.note || ""
              },
              actions: [{ id: "copy.select_source", label: "Use as the source", kind: "primary" }]
            };
          }),
          empty: {
            headline: "No other Project is available on this machine",
            detail: "A copy needs a second Project to read from. When one exists it appears here with the time it was last worked in.",
            action: null
          }
        },
        {
          id: "categories",
          label: "Choose categories",
          kind: "table",
          summary: "Whole categories, never individual rows. A category the source does not have is reported as unavailable rather than skipped quietly.",
          columns: [
            { key: "count", label: "Settings", weight: 1, align: "end" },
            { key: "covers", label: "What it covers", weight: 5 }
          ],
          items: list(m.domains).map(function (d) {
            var chosen = list(selection.domainIds).indexOf(d.id) >= 0;
            return {
              id: "cat-" + d.id,
              name: d.title,
              secondary: "",
              status: chosen ? "ok" : "setup",
              statusWord: chosen ? "Included" : "Not included",
              fields: { count: String(d.count), covers: d.purpose || "" }
            };
          })
        },
        {
          id: "preview",
          label: "Preview",
          kind: "table",
          summary: preview
            ? "Counted from " + (sourceName || "the selected Project") + ". Nothing has been written yet."
            : "Numbers appear once a source and its categories are chosen. Nothing is counted, and nothing is read from a source, before that.",
          columns: [
            { key: "count", label: "In this preview", weight: 1, align: "end" },
            { key: "meaning", label: "What it means", weight: 4 },
            { key: "apply", label: "What Apply does", weight: 4 }
          ],
          items: OUTCOMES.map(function (o) {
            return {
              id: o.id,
              name: o.name,
              secondary: "",
              status: o.id === "out-conflicts" && counts.conflicts ? "attention" : "ok",
              statusWord: preview ? String(o.count) : "Not previewed",
              fields: { count: String(o.count), meaning: o.meaning, apply: o.apply }
            };
          }),
          actions: [
            { id: "copy.preview", label: "Preview the changes", kind: "primary" },
            { id: "copy.apply", label: "Apply", kind: "risky" }
          ]
        },
        {
          id: "credentials",
          label: "Accounts and credentials",
          kind: "prose",
          summary: "What travels, what does not, and why the difference is not negotiable.",
          items: [
            { id: "cred-repoint", name: "Account references are re-pointed, never copied. If the source used a profile called work, this Project points at its own profile of that name and keeps its own sign-in." },
            { id: "cred-secret", name: "Secret material is never read, never rendered and never exported. Keys, tokens and profile directories stay where they are; the copy carries the reference only." },
            { id: "cred-missing", name: "A reference with nothing to point at here is reported as unavailable and names what is missing. The row keeps this Project's current value rather than being emptied." },
            { id: "cred-auth", name: "Signing in remains a separate, explicit step afterwards, exactly as it is anywhere else. A copy never authenticates anything." },
            { id: "cred-install", name: "A copied setting can name an installation this machine does not have. That is reported as unavailable; it never triggers an installation." }
          ]
        },
        {
          id: "safety",
          label: "How the transaction protects you",
          kind: "list",
          summary: "Four guarantees, in the order they happen.",
          items: [
            {
              id: "safe-restore", name: "Restore point", secondary: "Taken before anything is written",
              status: "ok", statusWord: "Always",
              fields: { "Covers": "Every key the plan touches, with its current value", "Kept": "Until its receipt is deleted" }
            },
            {
              id: "safe-atomic", name: "Atomic apply", secondary: "The plan applies as one unit",
              status: "ok", statusWord: "Always",
              fields: { "Partial results": "None", "If it stops": "Nothing has changed, and the reason names the key it stopped on" }
            },
            {
              id: "safe-verify", name: "Verification", secondary: "Every changed key is read back",
              status: "ok", statusWord: "Always",
              fields: { "Compared to": "The plan that was previewed", "On mismatch": "The transaction rolls back and names the key that disagreed" }
            },
            {
              id: "safe-receipt", name: "Receipt and rollback", secondary: "Written before the changes, kept afterwards",
              status: "ok", statusWord: "Always",
              fields: { "Receipt": "Names the source, the categories, every changed key and the time", "Rollback": "Restores the captured values and writes its own receipt" }
            }
          ]
        },
        {
          id: "receipts",
          label: "Previous copies",
          kind: "list",
          summary: "Each one can still be rolled back, because the values it replaced were captured before it ran.",
          items: receipts.map(function (r, i) {
            return {
              id: "receipt-" + (r.id || i),
              name: r.label || ("Copy from " + (r.sourceName || "another Project")),
              secondary: r.at || r.when || "",
              status: r.outcome === "error" ? "attention" : "ok",
              statusWord: r.outcomeWord || (r.outcome === "error" ? "Failed" : "Applied"),
              fields: {
                "Source": r.sourceName || r.sourceId || "Unknown",
                "Changed": r.changed == null ? "Recorded in the receipt" : String(r.changed),
                "Restore point": r.snapshotId ? "Kept" : "Recorded in the receipt"
              },
              actions: [{ id: "copy.rollback", label: "Roll back", kind: "risky" }]
            };
          }),
          empty: {
            headline: "No copy has been run in this Project",
            detail: "When one has, its receipt stays here with the values it replaced, so it can be rolled back long after it finished.",
            action: null
          }
        },
        {
          id: "afterwards",
          label: "What happens afterwards",
          kind: "prose",
          items: [
            { id: "after-independent", name: "The two Projects are independent the moment the transaction finishes. Nothing propagates, in either direction, ever." },
            { id: "after-nosync", name: "There is no keep in sync, no linked Projects, no shared profile and no inheritance. This screen is the only thing that moves a value between Projects, and it only does it once, when asked." },
            { id: "after-again", name: "Running it again is a new transaction with a new preview and a new restore point. It is never an update of the previous one." }
          ]
        }
      ],
      diagnostics: [
        { id: "diag-copy-plan", label: "Open the last preview plan", kind: "report" },
        { id: "diag-copy-receipt", label: "Open the last copy receipt", kind: "receipt" }
      ],
      notes: [
        "Preview counts are computed by the transaction itself. This screen never estimates them, and shows nothing at all until a source is chosen."
      ]
    };
  }

  /* ====================================================== NAMED OWNER SHELLS */

  /* Eight destinations that belong to another module. Each shell states four
   * things and nothing more: who owns it, why it is separate, exactly where it
   * opens, and how control comes back. The owner, why, insertion and return
   * sentences come from PM2Model.DEFERRED so this file cannot drift away from
   * the model the coverage report is generated against. */
  var OWNER_EXTRA = {
    "owner-onboarding": {
      handoff: "Open the introduction",
      firstStep: "Onboarding opens at its welcome step and knows it was opened from Settings.",
      keeps: "Nothing about the introduction is stored in this Project.",
      keepsWord: "No values here",
      notes: [
        "Onboarding runs before a Project exists, so it cannot be a Project setting: there would be nothing to attach it to.",
        "Whether the introduction is offered again is a choice about this machine, and it lives with the machine."
      ]
    },
    "owner-installation": {
      handoff: "Open installation and deployment",
      firstStep: "The Installation owner opens with this host selected.",
      keeps: "This Project records which host it prefers to run work on, and that stays in Servers and hosts.",
      keepsWord: "No values here",
      notes: [
        "Installing Puppet Master is not the same as acquiring a provider tool. No provider tool is bundled with an installation or added to its baseline; the first acquisition of one is a separate, explicit Install in provider setup, from the official source, for the exact host selected.",
        "Where the application itself is installed is decided for the machine, not for one Project, so a Project setting could only ever misreport it."
      ]
    },
    "owner-server-claim": {
      handoff: "Open the claim flow",
      firstStep: "The claim flow opens with the unclaimed Server selected.",
      keeps: "After a claim, this Project may choose the claimed Server as its home. That choice is a Project setting; the claim is not.",
      keepsWord: "One choice, after the claim",
      notes: [
        "A claim changes who owns a Server. Ownership transfer has its own authority model and cannot be expressed as a value on a row.",
        "Nothing here holds claim state. If the claim never completes, this screen still says only where it opens and how it returns."
      ]
    },
    "owner-project-hosting": {
      handoff: "Open Project location",
      firstStep: "Project Hosting opens with this Project's current location shown.",
      keeps: "Settings shows the path this Project was opened from, read-only, so the two never disagree.",
      keepsWord: "Read-only here",
      notes: [
        "Where files physically live has its own migration, with its own failure modes and its own rollback. A settings row cannot move a directory.",
        "Nothing on this screen implements that migration, and nothing here reports its progress."
      ]
    },
    "owner-remote-access": {
      handoff: "Open remote access",
      firstStep: "Remote Access opens on the entry points for this installation.",
      keeps: "Nothing. Remote entry points are configured for the installation, and this Project only uses them.",
      keepsWord: "No values here",
      notes: [
        "Remote entry points are a security surface for the whole installation. One Project quietly opening one would be a way around that.",
        "This screen never shows a token, an address or a key: it names the owner and the destination."
      ]
    },
    "owner-project-move": {
      handoff: "Open Project move",
      firstStep: "Project Move opens with this Project selected and its destination unset.",
      keeps: "Nothing. After a move, Settings reopens for this Project at its new location.",
      keepsWord: "No values here",
      notes: [
        "Moving a Project is a transaction over files with a restore point and a verification pass of its own.",
        "Settings can say where the Project went afterwards. It is never the thing that moved it."
      ]
    },
    "owner-updates": {
      handoff: "Open updates",
      firstStep: "Updates opens on the channel this installation follows.",
      keeps: "Nothing about the application channel. Update policy for a provider tool stays in provider settings.",
      keepsWord: "No values here",
      notes: [
        "Application updates never acquire or update a provider tool. Update policy for a provider tool applies only to an installation that was already explicitly acquired and bound.",
        "A staged update names what it changes and what needs a restart before anything is activated, and the update owner is what stages it."
      ]
    },
    "owner-server-backup": {
      handoff: "Open whole-Server backup",
      firstStep: "Server Backup opens on the Server that hosts this Project.",
      keeps: "This Project's own backup schedule stays in Backup and restore, and a whole-Server backup does not replace it.",
      keepsWord: "Kept in Backup and restore",
      notes: [
        "A whole-Server backup covers every Project on the Server, so one Project's Settings cannot own it or speak for the others.",
        "Nothing here reports Server backup state. It names the owner, the destination and the way back."
      ]
    }
  };

  function ownerShell(managerId) {
    var fam = model().familyOf(managerId) || {};
    var rec = RECORDS[managerId] || {};
    var extra = OWNER_EXTRA[managerId] || {};
    var owner = fam.owner || rec.title || managerId;

    var prose = [
      { id: managerId + "-why", name: fam.why || "" },
      { id: managerId + "-nofake", name: "No part of that owner is implemented here. This screen shows the destination, the owner's name and the return contract; nothing on it pretends to be the owner's own state." }
    ];
    list(extra.notes).forEach(function (n, i) {
      prose.push({ id: managerId + "-note-" + (i + 1), name: n });
    });

    return {
      title: rec.title || fam.family || managerId,
      purpose: rec.purpose || "",
      icon: rec.icon || "sliders",
      owner: {
        name: owner,
        why: fam.why || "",
        insertionContract: (fam.insertion || "") + " " + (fam.returns || "")
      },
      health: {
        status: "managed",
        statusWord: "Owned by " + owner,
        headline: fam.why || "",
        detail: (fam.insertion || "") + " " + (fam.returns || ""),
        counts: [
          { label: "Owner", value: owner },
          { label: "Settings values here", value: 0 },
          { label: "Reachable from", value: "This page and universal search" }
        ]
      },
      primary: { id: "owner.open", label: extra.handoff || ("Open " + owner), kind: "open" },
      sections: [
        {
          id: "handover",
          label: "Where it opens and how it comes back",
          kind: "list",
          summary: "The whole contract, in three lines.",
          items: [
            {
              id: managerId + "-open",
              name: extra.handoff || ("Open " + owner),
              secondary: fam.insertion || "",
              status: "ok",
              statusWord: "Reachable",
              fields: {
                "Owner": owner,
                "First step": extra.firstStep || "",
                "Carries": "The Project, the destination this row names, and where to come back to"
              },
              actions: [{ id: "owner.open", label: extra.handoff || ("Open " + owner), kind: "primary" }]
            },
            {
              id: managerId + "-return",
              name: "How control returns",
              secondary: fam.returns || "",
              status: "ok",
              statusWord: "Returns here",
              fields: {
                "On finishing": fam.returns || "",
                "If it is cancelled": "The same destination, unchanged, with nothing half-applied",
                "Back": "Comes back to this row, not to Settings Home"
              }
            },
            {
              id: managerId + "-keeps",
              name: "What stays a Project setting",
              secondary: extra.keeps || "",
              status: "managed",
              statusWord: extra.keepsWord || "Owned elsewhere",
              fields: {
                "Editable here": "Nothing that belongs to " + owner,
                "Why": "Two places that can change the same thing eventually disagree"
              }
            }
          ]
        },
        {
          id: "boundary",
          label: "Why it is a separate owner",
          kind: "prose",
          items: prose
        }
      ],
      diagnostics: [],
      notes: [
        "A deferred owner is a named destination with a return contract, not a feature that is missing."
      ]
    };
  }

  /* ------------------------------------------------------------ registry */

  var BUILD = Object.create(null);
  BUILD["manager-providers"] = providersSpec;
  BUILD["manager-doctor"] = doctorSpec;
  BUILD["manager-dry"] = drySpec;
  BUILD["manager-copy"] = copySpec;

  Object.keys(OWNER_EXTRA).forEach(function (id) {
    BUILD[id] = function () { return ownerShell(id); };
  });

  window.PM2ManagerExtras = {
    ids: function () { return Object.keys(BUILD); },
    has: function (id) { return !!BUILD[id]; },

    /* pm2-model.js calls this for managers PMData has no record for. Returning
     * null rather than a placeholder lets the model keep its own fallback. */
    record: function (id) {
      var r = RECORDS[id];
      return r ? { id: id, title: r.title, purpose: r.purpose, icon: r.icon } : null;
    },

    /* Raw spec. pm2-managers.js normalises and decorates it; nothing else should
     * call this directly, or two callers would disagree about the shape. */
    build: function (id, state) {
      var fn = BUILD[id];
      if (!fn) return null;
      return fn(window.PMData || {}, state || {});
    },

    OPERATIONS: OPERATIONS
  };
})();
