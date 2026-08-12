/* Opus 5 — system, storage, source-control and server domain datasets.
 *
 * Owned by the Ledger concept (coverage group concept_4), but loaded by every
 * page so cross-concept links resolve manager titles.
 *
 * The through-line of this module is that a system surface is only useful if it
 * refuses to blur things that behave differently: a recovery snapshot is not a
 * backup, a dry run is not a deletion, an artifact is not a log, a status is not
 * a setting, and a module Puppet Master has not built yet is not a feature you
 * can turn on. Every dataset below keeps those apart explicitly.
 */
(function () {
  "use strict";

  var D = window.PMData;
  if (!D) return;

  var Q = (window.__pmManagerBuilders = window.__pmManagerBuilders || []);

  function reg(id, record, build) {
    D.managers[id] = Object.assign({ id: id }, D.managers[id] || {}, record);
    Q.push([id, build]);
  }

  /* ==================================================== STORAGE & RETENTION */

  reg("manager-storage", {
    title: "Storage, retention and recovery",
    purpose: "Where data lives, how long it is kept, and what can actually be restored.",
    icon: "hardDrive"
  }, function () {
    return {
      title: "Storage, retention and recovery",
      purpose: "Where data lives, how long it is kept, and what can actually be restored.",
      icon: "hardDrive",
      health: {
        status: "attention", statusWord: "One volume quarantined",
        headline: "412 GB in use across three volumes. One failed verification and is quarantined.",
        detail: "Quarantine stops new writes and keeps the existing data readable so it can be migrated.",
        counts: [
          { label: "In use", value: "412 GB" },
          { label: "Volumes", value: 3 },
          { label: "Quarantined", value: 1 },
          { label: "Legal holds", value: 2 }
        ]
      },
      search: { placeholder: "Search volumes and retention rules", fields: ["name", "secondary"] },
      sections: [
        {
          id: "kinds", label: "Five different things, often confused", kind: "table",
          summary: "These are not variations of one feature. They differ in what they capture, where they live, and what they can restore.",
          columns: [
            { key: "captures", label: "Captures", weight: 2, align: "start" },
            { key: "lives", label: "Lives", weight: 2, align: "start" },
            { key: "restores", label: "Restores", weight: 2, align: "start" }
          ],
          items: [
            { id: "kind-snapshot", name: "Internal recovery snapshot", secondary: "Automatic, short-lived", status: "ok", statusWord: "On",
              fields: { captures: "Working state before a risky operation", lives: "On this device, inside the vault", restores: "The last few hours of work in place" } },
            { id: "kind-settings-backup", name: "Settings backup", secondary: "Manual or scheduled", status: "ok", statusWord: "Daily",
              fields: { captures: "Settings values only — never credentials", lives: "A file you choose", restores: "Configuration onto any device" } },
            { id: "kind-project-backup", name: "Project backup", secondary: "Scheduled", status: "ok", statusWord: "Daily",
              fields: { captures: "One project's vault, history and artifacts", lives: "Project Home Server", restores: "That project, on a new host" } },
            { id: "kind-server-backup", name: "Full server backup", secondary: "Owned by the server", status: "managed", statusWord: "Managed by the server",
              availability: { available: false, reason: "The server's own backup system owns this schedule.", owner: "Home TrueNAS" },
              fields: { captures: "Every project plus server configuration", lives: "Server-side target", restores: "The whole installation" } },
            { id: "kind-cleanup", name: "Workspace cleanup", secondary: "Not a backup at all", status: "risky", statusWord: "Removes data",
              fields: { captures: "Nothing", lives: "Not applicable", restores: "Nothing — it deletes build output and stale worktrees" } }
          ]
        },
        {
          id: "volumes", label: "Volumes", kind: "list",
          summary: "Each volume with its mode, pressure and verification state.",
          items: [
            { id: "vol-vault", name: "Project vault", secondary: "/mnt/projects/Puppet-Master", status: "ok", statusWord: "Healthy",
              badges: [{ kind: "scope", text: "Project Home Server", title: "Home TrueNAS" }, { kind: "evidence", text: "Verified 6 hours ago" }],
              value: "268 GB of 2 TB", valueSource: "Reported by the server",
              fields: { Mode: "Server-owned vault", Encryption: "At rest, server-managed key", Compaction: "Weekly, last run 2 days ago", "Evidence retention": "90 days" },
              editable: [
                { key: "retention", label: "Keep project history for", kind: "select", options: ["90 days", "1 year", "Forever"], value: "1 year" },
                { key: "compaction", label: "Compaction schedule", kind: "select", options: ["Off", "Weekly", "Monthly"], value: "Weekly" }
              ],
              actions: [{ id: "storage.verify", label: "Verify now", kind: "quiet" }, { id: "storage.test_restore", label: "Test restore", kind: "quiet" }],
              detail: [{ id: "vol-vault-detail", label: "Verification history", rows: [
                { label: "Last full verify", value: "6 hours ago", hint: "All checksums matched." },
                { label: "Last test restore", value: "9 days ago", hint: "Restored to a scratch path and compared." }
              ] }] },
            { id: "vol-local", name: "Local cache", secondary: "~/Library/Application Support/PuppetMaster", status: "ok", statusWord: "Healthy",
              badges: [{ kind: "scope", text: "This device" }],
              value: "103 GB of 500 GB", valueSource: "Measured locally",
              fields: { Mode: "Device-local cache", Encryption: "Filesystem level", "Safe to delete": "Yes — it is rebuilt on demand" },
              editable: [{ key: "cache-cap", label: "Cache ceiling", kind: "number", value: 120, help: "Above this, the least recently used entries are evicted." }],
              actions: [{ id: "storage.compact", label: "Compact now", kind: "quiet" }] },
            { id: "vol-archive", name: "Archive volume", secondary: "/mnt/archive/pm", status: "attention", statusWord: "Quarantined",
              badges: [{ kind: "availability", text: "No new writes" }, { kind: "evidence", text: "Verification failed 3 days ago" }],
              value: "41 GB", valueSource: "Last successful scan",
              availability: { available: false, reason: "Two checksums did not match on the last verification pass, so the volume accepts no new writes.", owner: "Storage" },
              fields: { Mode: "Cold archive", "Failed objects": "2 of 18,402", "Legal holds": "2 archives are held and cannot be deleted" },
              actions: [{ id: "storage.migrate", label: "Migrate off this volume", kind: "primary" }, { id: "storage.verify", label: "Re-verify", kind: "quiet" }],
              detail: [{ id: "vol-archive-detail", label: "Quarantine detail", rows: [
                { label: "Detected", value: "3 days ago" },
                { label: "Readable", value: "Yes", hint: "Existing data can still be read and migrated." },
                { label: "Legal hold", value: "2 archives", hint: "A held archive cannot be deleted even by a reset." }
              ] }] }
          ]
        },
        {
          id: "deletion", label: "Deleting a project or its data", kind: "list",
          summary: "Deletion is scoped, previewed and receipted. Held data is refused, not silently skipped.",
          items: [
            { id: "del-project", name: "Delete a project", secondary: "Vault, history, artifacts and index", status: "risky", statusWord: "Cannot be undone",
              fields: { Preview: "Lists every path and its size before anything is removed", Receipt: "Kept after deletion", "Legal holds": "Refused with the reason" },
              actions: [{ id: "storage.delete_preview", label: "Preview what would be deleted", kind: "risky" }] },
            { id: "del-data", name: "Delete generated data only", secondary: "Artifacts, caches and index; keeps history", status: "setup", statusWord: "Reversible cost only",
              fields: { Effect: "Frees space; the index and caches rebuild on demand", Receipt: "Kept" },
              actions: [{ id: "storage.delete_generated", label: "Preview", kind: "quiet" }] }
          ]
        },
        { id: "storage-settings", label: "Storage settings", kind: "rows",
          settings: ["sys-data-dir", "sys-cache-limit", "sys-snapshot-keep", "storage-manager"] }
      ],
      diagnostics: [
        { id: "diag-storage-verify", label: "Open the verification log", kind: "log" },
        { id: "diag-storage-receipt", label: "Open the last migration receipt", kind: "receipt" }
      ],
      notes: [
        "Quarantine is a state, not a failure message: the data stays readable while writes stop.",
        "A legal hold outranks every retention rule and every reset."
      ]
    };
  });

  /* ======================================================= BACKUP & RESTORE */

  reg("manager-backup", {
    title: "Backup and restore",
    purpose: "A schedule, an action, a status and a log — four different kinds of thing.",
    icon: "archive"
  }, function (data) {
    var status = (data.statuses || []).filter(function (s) { return s.id === "status-last-backup"; })[0];
    return {
      title: "Backup and restore",
      purpose: "A schedule, an action, a status and a log — four different kinds of thing.",
      icon: "archive",
      health: {
        status: "ok", statusWord: "Healthy",
        headline: "The last backup completed six hours ago and verified.",
        detail: "Backups exclude credentials. Restoring settings never restores a secret.",
        counts: [{ label: "Schedule", value: "Daily 02:00" }, { label: "Last size", value: "2.1 GB" }, { label: "Restore points", value: 14 }]
      },
      primary: { id: "backup.run_now", label: "Back up now", kind: "create" },
      sections: [
        {
          id: "four-kinds", label: "The four kinds, side by side", kind: "table",
          summary: "This section exists to show that these cannot all be form rows. Each one behaves differently and is rendered differently.",
          columns: [
            { key: "kind", label: "Kind", weight: 1, align: "start" },
            { key: "behaviour", label: "How it behaves", weight: 3, align: "start" }
          ],
          items: [
            { id: "four-schedule", name: "Backup schedule", secondary: "A persistent value", status: "ok", statusWord: "Daily 02:00",
              value: "Daily 02:00", valueSource: "Custom",
              editable: [{ key: "schedule", label: "Run backups", kind: "select", options: ["Off", "Daily 02:00", "Weekly Sunday 02:00", "Hourly"], value: "Daily 02:00" }],
              fields: { kind: "Setting", behaviour: "Persists. Changing it changes future behaviour and nothing else." } },
            { id: "four-run", name: "Back up now", secondary: "A one-shot action", status: "ok", statusWord: "Ready",
              actions: [{ id: "storage.backup_now", label: "Back up now", kind: "primary" }],
              fields: { kind: "Action", behaviour: "Runs once, reports phases, and produces a receipt. It stores no value." } },
            { id: "four-last", name: "Last backup", secondary: "A read-only projection", status: "ok", statusWord: "Verified",
              value: status ? status.value : "6 hours ago", valueSource: "Measured",
              fields: { kind: "Status", behaviour: "Cannot be set. It reports what happened." } },
            { id: "four-log", name: "Open backup log", secondary: "A diagnostic", status: "ok", statusWord: "Available",
              actions: [{ id: "backup.open_log", label: "Open log", kind: "quiet" }],
              fields: { kind: "Diagnostic", behaviour: "Opens evidence. It neither stores a value nor changes state." } }
          ]
        },
        {
          id: "restore-points", label: "Restore points", kind: "list",
          summary: "Each restore point with what it covers and whether it verified.",
          items: [
            { id: "rp-1", name: "Today 02:00", secondary: "Full · 2.1 GB", status: "ok", statusWord: "Verified",
              badges: [{ kind: "evidence", text: "Checksums matched" }],
              fields: { Scope: "Project vault and settings", Duration: "4 minutes", Target: "Home TrueNAS" },
              actions: [{ id: "backup.restore", label: "Restore from this point", kind: "risky" }, { id: "backup.inspect", label: "Inspect contents", kind: "quiet" }] },
            { id: "rp-2", name: "Yesterday 02:00", secondary: "Full · 2.0 GB", status: "ok", statusWord: "Verified",
              fields: { Scope: "Project vault and settings", Duration: "4 minutes", Target: "Home TrueNAS" },
              actions: [{ id: "backup.restore", label: "Restore from this point", kind: "risky" }] },
            { id: "rp-3", name: "3 days ago 02:00", secondary: "Full · 1.9 GB", status: "attention", statusWord: "Verification skipped",
              badges: [{ kind: "evidence", text: "No checksum pass" }],
              fields: { Scope: "Project vault and settings", Reason: "The server was rebooting when verification was due." },
              actions: [{ id: "backup.verify", label: "Verify now", kind: "quiet" }] }
          ],
          empty: { headline: "No restore points yet", detail: "The first scheduled run creates one. Until then there is nothing to restore from.", action: null }
        },
        { id: "backup-settings", label: "Backup settings", kind: "rows",
          settings: ["sys-snapshot-auto", "sys-snapshot-keep", "sys-backup-settings", "sys-restore", "backup-manager"] }
      ],
      diagnostics: [{ id: "diag-backup-log", label: "Open backup log", kind: "log" }],
      notes: ["Backups never contain credentials. A restored settings file still needs each provider signed in."]
    };
  });

  /* ===================================================== SETTINGS LIFECYCLE */

  /* The import fixture the concept actually applies. Keys are real setting ids,
   * so the diff below is computed against the live store rather than described. */
  var IMPORT_BUNDLE = {
    id: "bundle-orchard-web",
    name: "orchard-web-settings.json",
    exportedAt: "2026-08-04T09:12:00Z",
    exportedFrom: "orchard-web · Puppet Master 0.31",
    values: {
      "gen-restore": false,
      "gen-open-to": "Goal board",
      "gen-default-access": "Ask for approval",
      "notify-quiet": "22:00 – 08:00",
      "fmt-on-save": true,
      "clean-dry-first": false,
      "idx-max-file": 1024,
      "legacy-telemetry-optin": true
    }
  };

  /* The import diff is COMPUTED, not described. Each bundle key is compared
   * against the live store (state.values) and the taxonomy's own metadata, so
   * the classification a reviewer sees is derived from real state rather than
   * written down in advance. Apply and Roll back mutate and restore
   * state.values in the renderer; this function only decides what each row is. */
  function findSetting(data, id) {
    var hit = null;
    (data.categories || []).forEach(function (cat) {
      (cat.subcategories || []).forEach(function (sub) {
        (sub.settings || []).forEach(function (s) {
          if (s.id === id) hit = { setting: s, category: cat, subcategory: sub };
        });
      });
    });
    return hit;
  }

  function diffBundle(data, state, bundle, legacyKeys) {
    var values = (state && state.values) || {};
    return Object.keys(bundle.values).map(function (key) {
      var incoming = bundle.values[key];
      var found = findSetting(data, key);

      if (!found) {
        var legacy = legacyKeys[key];
        return {
          key: key, incoming: incoming, current: "Not present under this name",
          classification: legacy ? "unknown key — migrated to " + legacy.migratesTo : "unknown key — no target",
          status: legacy ? "ok" : "attention",
          note: legacy ? legacy.note : "This build has no setting with that id and no migration is registered, so the key would be dropped and named in the receipt."
        };
      }

      var base = found.setting.state || {};
      if (base.source === "managed") {
        return {
          key: key, incoming: incoming, current: base.value,
          classification: "managed — cannot import", status: "managed",
          note: (base.reason || "This value is managed here, so an import cannot overwrite it.")
        };
      }

      var override = values[key];
      var current = override && override.value !== undefined ? override.value : base.value;

      if (String(current) === String(incoming)) {
        return { key: key, incoming: incoming, current: current, classification: "unchanged", status: "ok",
          note: "The bundle and this device already agree, so nothing is written." };
      }
      if (override) {
        return { key: key, incoming: incoming, current: current,
          classification: "conflict — changed here since export", status: "attention",
          note: "You changed this on this device after the bundle was exported. Applying would discard that change, so it is skipped unless you choose the bundle value." };
      }
      return { key: key, incoming: incoming, current: current, classification: "will change", status: "setup",
        note: "This device still has the shipped or inherited value, so the bundle value is written." };
    });
  }

  reg("manager-settings-lifecycle", {
    title: "Export, import, copy and reset settings",
    purpose: "Move settings between projects and devices without guessing what changed.",
    icon: "upload",
    importBundle: IMPORT_BUNDLE,
    copyGroups: [
      { id: "grp-general", label: "General and startup", count: 14 },
      { id: "grp-appearance", label: "Appearance and input", count: 21 },
      { id: "grp-agents", label: "Providers, models and roles", count: 26 },
      { id: "grp-permissions", label: "Permissions and FileSafe", count: 18 },
      { id: "grp-code", label: "Editor, terminal and formatters", count: 23 },
      { id: "grp-context", label: "Context and memory", count: 16 },
      { id: "grp-planning", label: "Planning and automation", count: 19 },
      { id: "grp-collab", label: "Git, worktrees and Crew", count: 17 },
      { id: "grp-extensions", label: "Tools, skills and connections", count: 22 },
      { id: "grp-system", label: "System and diagnostics", count: 28 }
    ],
    legacyKeys: {
      "legacy-telemetry-optin": { migratesTo: "sys-diag-bundle", note: "Renamed in 0.29; the value is carried across unchanged." }
    }
  }, function (data, state) {
    var rows = diffBundle(data, state || {}, IMPORT_BUNDLE, D.managers["manager-settings-lifecycle"].legacyKeys);
    var conflicts = rows.filter(function (r) { return r.status === "attention"; }).length;
    var writes = rows.filter(function (r) { return r.classification === "will change"; }).length;
    return {
      title: "Export, import, copy and reset settings",
      purpose: "Move settings between projects and devices without guessing what changed.",
      icon: "upload",
      health: {
        status: "ok", statusWord: "Ready",
        headline: "Last export two days ago. No import is in progress.",
        detail: "Every import takes a restore point first, so it can be rolled back key by key.",
        counts: [
          { label: "Bundle keys", value: rows.length },
          { label: "Would be written", value: writes },
          { label: "Need a decision", value: conflicts },
          { label: "Restore points", value: 14 }
        ]
      },
      primary: { id: "settings.import.preview", label: "Import settings", kind: "import" },
      sections: [
        {
          id: "export", label: "Export", kind: "list",
          summary: "What an export contains, and what it deliberately leaves out.",
          items: [
            { id: "exp-scope", name: "Export scope", secondary: "Choose what travels", status: "ok", statusWord: "Global and project",
              editable: [
                { key: "scope", label: "Include", kind: "select", options: ["Global only", "This project only", "Global and project"], value: "Global and project" },
                { key: "managed", label: "Include managed values", kind: "toggle", value: false, help: "Managed values cannot be imported anywhere else, so they are excluded by default." }
              ],
              fields: { Excluded: "Credentials, vault references, device paths, and anything an organisation manages" },
              actions: [{ id: "settings.export", label: "Export now", kind: "primary" }] }
          ]
        },
        {
          id: "import", label: "Import", kind: "list",
          summary: "Choose a bundle, read the per-key diff, then decide. Nothing changes until Apply.",
          items: [
            { id: "imp-fixture", name: IMPORT_BUNDLE.name, secondary: "Exported from " + IMPORT_BUNDLE.exportedFrom, status: "setup", statusWord: "Not applied",
              badges: [{ kind: "source", text: "Fixture bundle", title: "Provided so the flow can be demonstrated without a file picker" }],
              fields: { Keys: String(Object.keys(IMPORT_BUNDLE.values).length), Exported: "4 August", Format: "Puppet Master settings bundle v2" },
              actions: [
                { id: "settings.import.preview", label: "Preview the diff", kind: "primary" },
                { id: "settings.import.apply", label: "Apply", kind: "risky" },
                { id: "settings.import.rollback", label: "Roll back", kind: "quiet" }
              ] },
            { id: "imp-file", name: "Choose a file", secondary: "Any exported .json bundle", status: "ok", statusWord: "Ready",
              editable: [{ key: "file", label: "Bundle file", kind: "path", value: "", help: "The same diff runs against a real file." }],
              actions: [{ id: "settings.import.choose", label: "Choose a bundle", kind: "quiet" }] }
          ]
        },
        {
          id: "diff", label: "Per-key diff", kind: "table",
          summary: "Computed now, against the values currently in this concept. Nothing is written until Apply.",
          columns: [
            { key: "current", label: "On this device", weight: 2, align: "start" },
            { key: "incoming", label: "In the bundle", weight: 2, align: "start" },
            { key: "classification", label: "Result", weight: 2, align: "start" }
          ],
          items: rows.map(function (r) {
            return {
              id: "diff-" + r.key,
              name: r.key,
              secondary: r.note,
              status: r.status,
              statusWord: r.classification,
              fields: {
                current: String(r.current),
                incoming: String(r.incoming),
                classification: r.classification
              }
            };
          }),
          actions: [
            { id: "settings.import.apply", label: "Apply", kind: "risky" },
            { id: "settings.import.rollback", label: "Roll back", kind: "quiet" }
          ],
          empty: { headline: "Nothing to compare", detail: "Choose a bundle first.", action: null }
        },
        {
          id: "conflict-vocabulary", label: "What each diff row means", kind: "table",
          columns: [
            { key: "meaning", label: "Meaning", weight: 3, align: "start" },
            { key: "onApply", label: "On apply", weight: 2, align: "start" }
          ],
          items: [
            { id: "cv-unchanged", name: "unchanged", status: "ok", statusWord: "No effect",
              fields: { meaning: "The bundle and this device already agree.", onApply: "Nothing is written." } },
            { id: "cv-will-change", name: "will change", status: "setup", statusWord: "Will be written",
              fields: { meaning: "The bundle differs and this device has not changed the key since the export.", onApply: "The bundle value is written." } },
            { id: "cv-conflict", name: "conflict — changed here since export", status: "attention", statusWord: "Needs a decision",
              fields: { meaning: "Both sides changed. Importing silently would discard local work.", onApply: "Skipped unless you choose the bundle value explicitly." } },
            { id: "cv-managed", name: "managed — cannot import", status: "managed", statusWord: "Refused",
              fields: { meaning: "An organisation or the project owns this value.", onApply: "Refused, with the owner named." } },
            { id: "cv-unknown", name: "unknown key — migrated", status: "ok", statusWord: "Renamed",
              fields: { meaning: "The key existed under an older name.", onApply: "Written to the current key, and the migration is named in the receipt." } }
          ]
        },
        {
          id: "copy-from", label: "Copy settings from another project", kind: "list",
          summary: "A one-time transactional copy. It does not create an inheritance link, and the destination stays independent afterwards.",
          items: [
            { id: "copy-source", name: "Source project", secondary: "Choose which project to copy from", status: "ok", statusWord: "Ready",
              editable: [{ key: "source", label: "Copy from", kind: "select", options: ["orchard-web", "orchard-mobile", "orchard-infra"], value: "orchard-web" }],
              fields: { Guarantee: "A restore point is taken, the copy applies atomically, then it is verified", After: "This destination is now independent — later changes in the source do not follow" },
              actions: [{ id: "settings.copy_from.preview", label: "Preview the copy", kind: "primary" }, { id: "settings.copy_from.rollback", label: "Roll back", kind: "quiet" }] }
          ]
        },
        {
          id: "reset", label: "Reset", kind: "list",
          items: [
            { id: "reset-section", name: "Reset one section", secondary: "Return a single section to its shipped values", status: "setup", statusWord: "6 sections changed",
              actions: [{ id: "settings.reset.preview", label: "Choose a section", kind: "quiet" }] },
            { id: "reset-all", name: "Reset every setting", secondary: "Threads, memory and projects are not deleted", status: "risky", statusWord: "Cannot be undone",
              fields: { Kept: "Threads, memory, projects, credentials", Lost: "Every customisation on this device" },
              actions: [{ id: "settings.reset.apply", label: "Preview a full reset", kind: "risky" }] }
          ]
        }
      ],
      diagnostics: [
        { id: "diag-import-receipt", label: "Open the last import receipt", kind: "receipt" },
        { id: "diag-migration-log", label: "Open the key migration log", kind: "log" }
      ],
      notes: [
        "There is no format dropdown as the primary interaction. The format is a consequence of the bundle, not a decision you make first.",
        "Copy Settings From… is a one-time transactional copy. Puppet Master has no universal project inheritance system."
      ]
    };
  });

  /* ====================================================== HISTORY & SESSIONS */

  reg("manager-history", {
    title: "Threads, sessions and archives",
    purpose: "What is kept, what can be compared, and what deletion actually removes.",
    icon: "history"
  }, function () {
    return {
      title: "Threads, sessions and archives",
      purpose: "What is kept, what can be compared, and what deletion actually removes.",
      icon: "history",
      health: {
        status: "ok", statusWord: "Healthy",
        headline: "412 threads in this project, 38 archived.",
        detail: "Archived threads stay searchable. Deletion is separate and is receipted.",
        counts: [{ label: "Threads", value: 412 }, { label: "Archived", value: 38 }, { label: "Sessions", value: 1104 }]
      },
      search: { placeholder: "Search threads and sessions", fields: ["name", "secondary"] },
      sections: [
        {
          id: "filters", label: "Scope", kind: "list",
          items: [
            { id: "hist-scope-row", name: "History covers", secondary: "This project or every project on this device", status: "ok", statusWord: "This project",
              editable: [{ key: "scope", label: "Show", kind: "select", options: ["This project", "All projects"], value: "This project" }],
              fields: { "All projects": "1,847 threads across 5 projects" } }
          ]
        },
        {
          id: "threads", label: "Recent threads", kind: "table",
          columns: [
            { key: "turns", label: "Turns", weight: 1, align: "end" },
            { key: "route", label: "Route", weight: 2, align: "start" },
            { key: "state", label: "State", weight: 1, align: "start" }
          ],
          items: [
            { id: "th-migration", name: "Postgres migration", secondary: "Started 3 days ago", status: "ok", statusWord: "Active",
              fields: { turns: 142, route: "Claude Opus 4.6 · work", state: "Open" },
              actions: [{ id: "history.compare", label: "Compare with another thread", kind: "quiet" }, { id: "history.export", label: "Export", kind: "quiet" }] },
            { id: "th-onboarding", name: "New contributor onboarding", secondary: "Last active 12 days ago", status: "managed", statusWord: "Archived",
              badges: [{ kind: "scope", text: "Archived", title: "Still searchable" }],
              fields: { turns: 38, route: "GPT-5.2 · API", state: "Archived" },
              actions: [{ id: "history.restore", label: "Bring back", kind: "quiet" }, { id: "history.delete", label: "Delete", kind: "risky" }] },
            { id: "th-rebuild", name: "Index rebuild investigation", secondary: "Last active 4 hours ago", status: "attention", statusWord: "Needs rebuild",
              availability: { available: false, reason: "Its retrieval index entries were invalidated by a schema change, so search inside this thread is incomplete.", owner: "Project search index" },
              fields: { turns: 61, route: "Claude Sonnet 4.6 · work", state: "Open" },
              actions: [{ id: "history.rebuild", label: "Rebuild this thread's index", kind: "primary" }] }
          ]
        },
        {
          id: "policy", label: "Retention and deletion policy", kind: "prose",
          items: [
            { id: "pol-1", name: "Archiving is automatic after the retention window and changes nothing about the content: an archived thread keeps its transcript, attachments and receipts." },
            { id: "pol-2", name: "Deleting a thread removes the transcript and its attachments. It does not remove memory notes that were derived from it — those are managed in Assistant memory, which names its own provenance." },
            { id: "pol-3", name: "Exports are per thread or per session and never include credentials." }
          ]
        },
        { id: "history-settings", label: "History settings", kind: "rows",
          settings: ["hist-keep", "hist-scope", "hist-attachments", "hist-export-format"] }
      ],
      diagnostics: [{ id: "diag-history-export", label: "Open the last export receipt", kind: "receipt" }],
      notes: []
    };
  });

  /* ======================================================= RUNTIME ARTIFACTS */

  reg("manager-artifacts", {
    title: "Artifacts, receipts and outputs",
    purpose: "What a run leaves behind, who owns it, and how long it stays.",
    icon: "fileText"
  }, function () {
    return {
      title: "Artifacts, receipts and outputs",
      purpose: "What a run leaves behind, who owns it, and how long it stays.",
      icon: "fileText",
      health: {
        status: "ok", statusWord: "Healthy",
        headline: "1,204 artifacts using 3.1 GB. Redaction is on.",
        detail: "Provider-native artifacts are identified separately, because Puppet Master cannot promise their retention.",
        counts: [{ label: "Artifacts", value: 1204 }, { label: "Size", value: "3.1 GB" }, { label: "Provider-native", value: 96 }]
      },
      search: { placeholder: "Search artifacts", fields: ["name", "secondary"] },
      sections: [
        {
          id: "artifacts", label: "Artifacts", kind: "table",
          columns: [
            { key: "type", label: "Type", weight: 1, align: "start" },
            { key: "owner", label: "Owner", weight: 1, align: "start" },
            { key: "size", label: "Size", weight: 1, align: "end" },
            { key: "retention", label: "Retention", weight: 1, align: "start" }
          ],
          items: [
            { id: "art-build", name: "build-2026-08-11.log", secondary: "Goal · migration", status: "ok", statusWord: "Kept",
              badges: [{ kind: "source", text: "Puppet Master owned" }],
              fields: { type: "Log", owner: "Puppet Master", size: "18 MB", retention: "30 days" },
              actions: [{ id: "artifacts.open", label: "Open", kind: "quiet" }, { id: "artifacts.reveal", label: "Reveal in files", kind: "quiet" }, { id: "artifacts.export", label: "Export", kind: "quiet" }] },
            { id: "art-receipt", name: "receipt-att-gemini-0100", secondary: "Provider update attempt", status: "ok", statusWord: "Kept",
              badges: [{ kind: "evidence", text: "Redacted" }],
              fields: { type: "Receipt", owner: "Puppet Master", size: "12 KB", retention: "1 year" },
              actions: [{ id: "artifacts.open", label: "Open", kind: "quiet" }] },
            { id: "art-provider", name: "codex-session-9f21.jsonl", secondary: "Written by the provider CLI", status: "managed", statusWord: "Provider-native",
              badges: [{ kind: "source", text: "Provider owned", title: "Retention follows the CLI, not Puppet Master" }],
              availability: { available: false, reason: "The provider CLI writes and rotates this file inside its own profile root.", owner: "Codex CLI" },
              fields: { type: "Session log", owner: "Codex CLI", size: "4 MB", retention: "Whatever the CLI decides" },
              actions: [{ id: "artifacts.reveal", label: "Reveal in files", kind: "quiet" }] },
            { id: "art-video", name: "browser-run-3182.webm", secondary: "Browser Program capture", status: "attention", statusWord: "Expires in 2 days",
              fields: { type: "Capture", owner: "Puppet Master", size: "212 MB", retention: "7 days" },
              actions: [{ id: "artifacts.export", label: "Export before it expires", kind: "primary" }, { id: "artifacts.delete", label: "Delete now", kind: "risky" }] }
          ],
          empty: { headline: "No artifacts yet", detail: "Runs write logs, receipts and outputs here as they happen.", action: null }
        },
        {
          id: "redaction", label: "Redaction", kind: "list",
          items: [
            { id: "red-on", name: "Redact secrets before writing", secondary: "Applies to logs, receipts and exports", status: "ok", statusWord: "On",
              editable: [{ key: "redact", label: "Redact secrets", kind: "toggle", value: true, help: "Known secret shapes and vault references are masked before anything is written." }],
              fields: { Covers: "Bearer tokens, API keys, vault references, signed URLs", "Does not cover": "A secret you paste into free prose — the shape is unknowable" } }
          ]
        },
        { id: "artifact-settings", label: "Artifact settings", kind: "rows",
          settings: ["art-keep", "art-location", "art-redact", "art-max-size"] }
      ],
      diagnostics: [{ id: "diag-artifacts-index", label: "Open the artifact index", kind: "report" }],
      notes: ["Puppet Master owned and provider-native artifacts are never mixed in one list without saying which is which."]
    };
  });

  /* ========================================================= SOURCE CONTROL */

  reg("manager-sourcecontrol", {
    title: "Source control, worktrees and forges",
    purpose: "Changes, history, worktrees, and the tools and connections behind them.",
    icon: "git"
  }, function () {
    return {
      title: "Source control, worktrees and forges",
      purpose: "Changes, history, worktrees, and the tools and connections behind them.",
      icon: "git",
      health: {
        status: "ok", statusWord: "Healthy",
        headline: "git 2.47.1 on this computer, three worktrees, forge connected.",
        detail: "The tool installation uses the same lifecycle as a provider CLI: discovery, ownership evidence, update policy and verification.",
        counts: [{ label: "Worktrees", value: 3 }, { label: "Ahead", value: 2 }, { label: "Leases held", value: 1 }]
      },
      sections: [
        {
          id: "changes", label: "Changes", kind: "list",
          items: [
            { id: "chg-staged", name: "Staged", secondary: "4 files", status: "ok", statusWord: "Ready to commit",
              fields: { Files: "services/api/router.ts, services/api/db.ts, +2" } },
            { id: "chg-unstaged", name: "Unstaged", secondary: "2 files", status: "setup", statusWord: "Not staged",
              fields: { Files: "docs/README.md, .gitignore" } },
            { id: "chg-untracked", name: "Untracked", secondary: "1 file", status: "setup", statusWord: "New",
              fields: { Files: "scratch/notes.md" } }
          ]
        },
        {
          id: "worktrees", label: "Worktrees", kind: "table",
          summary: "Each worktree with its branch, lease and cleanup eligibility.",
          columns: [
            { key: "branch", label: "Branch", weight: 2, align: "start" },
            { key: "state", label: "State", weight: 1, align: "start" },
            { key: "idle", label: "Idle", weight: 1, align: "end" }
          ],
          items: [
            { id: "wt-main", name: "orchard-api", secondary: "~/code/orchard-api", status: "ok", statusWord: "Primary",
              fields: { branch: "main", state: "Clean", idle: "0 days" } },
            { id: "wt-migration", name: "orchard-api-migration", secondary: "~/code/.pm-worktrees/migration", status: "ok", statusWord: "Leased",
              badges: [{ kind: "scope", text: "Lease held by Goal migration-114" }],
              fields: { branch: "feature/pg-migration", state: "2 commits ahead", idle: "0 days" },
              actions: [{ id: "scm.test_before_merge", label: "Test before merge", kind: "primary" }] },
            { id: "wt-stale", name: "orchard-api-spike", secondary: "~/code/.pm-worktrees/spike", status: "attention", statusWord: "Idle 34 days",
              fields: { branch: "spike/websocket", state: "Uncommitted changes", idle: "34 days" },
              availability: { available: false, reason: "It has uncommitted changes, so cleanup will not propose it for removal.", owner: "Workspace cleanup" },
              actions: [{ id: "scm.open_worktree", label: "Open it", kind: "quiet" }] }
          ]
        },
        {
          id: "tooling", label: "Tool installation", kind: "list",
          summary: "The same installation grammar the provider CLIs use — one tool, one installation identity.",
          items: [
            { id: "tool-git", name: "git", secondary: "This computer · macOS 15.4", status: "ok", statusWord: "Ready",
              badges: [{ kind: "evidence", text: "Homebrew formula owns this file" }, { kind: "scope", text: "arm64" }],
              value: "2.47.1", valueSource: "Reported by the executable",
              fields: { "Configured command": "git", "Resolved path": "/opt/homebrew/bin/git", "Real path": "/opt/homebrew/Cellar/git/2.47.1/bin/git", Owner: "homebrew_formula", Confidence: "proven", "Update policy": "Check automatic · install Ask first" },
              actions: [{ id: "installation.check_update", label: "Check for updates", kind: "quiet" }, { id: "installation.rescan", label: "Rescan", kind: "quiet" }],
              detail: [{ id: "tool-git-chain", label: "Resolution chain", rows: [
                { label: "1", value: "PATH entry /opt/homebrew/bin" },
                { label: "2", value: "symlink git -> ../Cellar/git/2.47.1/bin/git" },
                { label: "3", value: "Homebrew receipt owns the exact file", hint: "Evidence order 1: package database" }
              ] }] },
            { id: "tool-jj", name: "jj (Jujutsu)", secondary: "Optional", status: "setup", statusWord: "Not installed",
              availability: { available: false, reason: "Jujutsu is not installed on this host. Git remains fully available.", owner: null },
              fields: { Effect: "Jujutsu views stay hidden until it is installed", Install: "Explicit and user-triggered, from the official source" },
              actions: [{ id: "installation.adopt", label: "Show install instructions", kind: "quiet" }] },
            { id: "tool-lfs", name: "git-lfs", secondary: "This computer", status: "ok", statusWord: "Ready",
              value: "3.5.1", valueSource: "Reported by the executable",
              fields: { Owner: "homebrew_formula", "Tracked patterns": "*.psd, *.mp4" } }
          ]
        },
        {
          id: "forge", label: "Forge connection", kind: "list",
          items: [
            { id: "forge-gh", name: "GitHub · orchard", secondary: "SSH source", status: "ok", statusWord: "Connected",
              badges: [{ kind: "source", text: "PM-direct OAuth" }],
              fields: { Account: "jared", Scopes: "repo, workflow, read:org", "SSH key": "~/.ssh/id_ed25519 (loaded)" },
              editable: [{ key: "push", label: "Push policy", kind: "select", options: ["Ask before push", "Push freely", "Never push"], value: "Ask before push" },
                { key: "force", label: "Force push", kind: "select", options: ["Refused", "Ask with a lease", "Allowed"], value: "Ask with a lease", help: "A lease means the remote must still be where it was when the push was planned." }],
              actions: [{ id: "provider.auth.revalidate", label: "Re-check the connection", kind: "quiet" }] }
          ]
        },
        { id: "scm-settings", label: "Source control settings", kind: "rows", settings: ["scm-manager"] }
      ],
      diagnostics: [{ id: "diag-scm-log", label: "Open the source control log", kind: "log" }],
      notes: ["Recovery: every destructive source-control operation records the exact pre-operation revision, so it can be undone by identity rather than by memory."]
    };
  });

  /* =========================================================== GITHUB ACTIONS */

  reg("manager-gh-actions", {
    title: "Workflows, runs and readiness",
    purpose: "Which workflows are pinned, and whether this branch could actually run them.",
    icon: "play"
  }, function () {
    return {
      title: "Workflows, runs and readiness",
      purpose: "Which workflows are pinned, and whether this branch could actually run them.",
      icon: "play",
      health: {
        status: "setup", statusWord: "One workflow needs a secret",
        headline: "Three workflows pinned. Two are ready on this branch; release is missing a repository secret.",
        detail: "Readiness is evaluated against the current branch, not against the default branch.",
        counts: [{ label: "Pinned", value: 3 }, { label: "Ready here", value: 2 }, { label: "Runs today", value: 11 }]
      },
      primary: { id: "gha.pin", label: "Pin a workflow", kind: "add" },
      sections: [
        {
          id: "pinned", label: "Pinned workflows", kind: "list",
          items: [
            { id: "wf-ci", name: "ci.yml", secondary: "Build and test", status: "ok", statusWord: "Ready on this branch",
              badges: [{ kind: "evidence", text: "Last run passed 40 minutes ago" }],
              fields: { Triggers: "push, pull_request", "Last run": "#3181 · passed · 4m 12s", Runner: "ubuntu-latest" },
              actions: [{ id: "gha.open_run", label: "Open the last run", kind: "quiet" }, { id: "gha.refresh", label: "Refresh", kind: "quiet" }] },
            { id: "wf-lint", name: "lint.yml", secondary: "Format and lint", status: "ok", statusWord: "Ready on this branch",
              fields: { Triggers: "pull_request", "Last run": "#3180 · passed · 51s", Runner: "ubuntu-latest" },
              actions: [{ id: "gha.open_run", label: "Open the last run", kind: "quiet" }] },
            { id: "wf-release", name: "release.yml", secondary: "Publish a release", status: "attention", statusWord: "Would fail at the first step",
              availability: { available: false, reason: "The repository secret NPM_TOKEN is not set, so the publish step cannot authenticate.", owner: "GitHub repository settings" },
              fields: { Triggers: "tag push", "Last run": "#3102 · failed · 22s", "Missing": "NPM_TOKEN" },
              actions: [{ id: "gha.open_run", label: "Open the failed run", kind: "quiet" }, { id: "gha.open_secrets", label: "Open repository secrets", kind: "primary" }] }
          ],
          empty: { headline: "No workflows pinned", detail: "Pinning a workflow keeps its status in view without opening the browser.", action: { id: "gha.pin", label: "Pin a workflow", kind: "primary" } }
        },
        {
          id: "runs", label: "Recent runs", kind: "table",
          columns: [
            { key: "workflow", label: "Workflow", weight: 2, align: "start" },
            { key: "branch", label: "Branch", weight: 2, align: "start" },
            { key: "duration", label: "Duration", weight: 1, align: "end" }
          ],
          items: [
            { id: "run-3181", name: "#3181", secondary: "40 minutes ago", status: "ok", statusWord: "Passed",
              fields: { workflow: "ci.yml", branch: "feature/pg-migration", duration: "4m 12s" },
              actions: [{ id: "gha.open_jobs", label: "Open jobs", kind: "quiet" }] },
            { id: "run-3180", name: "#3180", secondary: "42 minutes ago", status: "ok", statusWord: "Passed",
              fields: { workflow: "lint.yml", branch: "feature/pg-migration", duration: "51s" } },
            { id: "run-3179", name: "#3179", secondary: "2 hours ago", status: "attention", statusWord: "Failed",
              fields: { workflow: "ci.yml", branch: "main", duration: "2m 04s" },
              actions: [{ id: "gha.open_logs", label: "Open the failing job log", kind: "primary" }] }
          ]
        },
        {
          id: "starter", label: "Starter workflow", kind: "list",
          items: [
            { id: "starter-node", name: "Node build and test", secondary: "Proposed from what is in the repository", status: "setup", statusWord: "Not added",
              fields: { Detected: "package.json with a test script, Node 22", Writes: ".github/workflows/ci.yml", Review: "The file is shown in full before it is written" },
              actions: [{ id: "gha.preview_starter", label: "Preview the file", kind: "primary" }] }
          ]
        },
        { id: "gha-settings", label: "Actions settings", kind: "rows",
          settings: ["gha-enabled", "gha-refresh", "gha-branch-only", "gha-log-lines"] }
      ],
      diagnostics: [{ id: "diag-gha-log", label: "Open the last job log", kind: "log" }],
      notes: ["Puppet Master never triggers a workflow run implicitly. Every run here was started by a push, a pull request, or an explicit action."]
    };
  });

  /* ================================================ CONTAINERS & REGISTRIES */

  reg("manager-containers", {
    title: "Docker, Podman and Kubernetes tools",
    purpose: "Which container tooling is present, healthy, and allowed to be used.",
    icon: "container"
  }, function () {
    return {
      title: "Docker, Podman and Kubernetes tools",
      purpose: "Which container tooling is present, healthy, and allowed to be used.",
      icon: "container",
      health: {
        status: "setup", statusWord: "Kubernetes is organisation managed",
        headline: "Docker is ready. Podman is installed but not selected. Kubernetes tooling is managed by your organisation.",
        detail: "The top level is deliberately three human names. Engines, CLIs, sockets and contexts live one level down.",
        counts: [{ label: "Runtimes", value: 2 }, { label: "Registries", value: 3 }, { label: "Clusters", value: 1 }]
      },
      sections: [
        {
          id: "runtimes", label: "Container tooling", kind: "cards",
          summary: "Three names, because that is what a person is looking for. Everything else is detail.",
          items: [
            { id: "cnt-docker", name: "Docker", secondary: "Preferred runtime", status: "ok", statusWord: "Ready",
              badges: [{ kind: "evidence", text: "Engine responding" }, { kind: "scope", text: "This computer" }],
              value: "Engine 27.3.1 · CLI 27.3.1", valueSource: "Reported by the engine",
              fields: { Desktop: "Docker Desktop 4.34 (running)", Engine: "27.3.1", CLI: "27.3.1", Compose: "v2.29.7", Buildx: "0.17.1", Socket: "/var/run/docker.sock", Host: "This computer · macOS 15.4" },
              actions: [{ id: "containers.ping", label: "Check the engine", kind: "quiet" }],
              detail: [{ id: "docker-detail", label: "Installation", rows: [
                { label: "Owner", value: "homebrew_cask", hint: "Docker Desktop is installed as a cask." },
                { label: "Confidence", value: "strongly_identified" },
                { label: "Update policy", value: "Check automatic · install Ask first" }
              ] }] },
            { id: "cnt-podman", name: "Podman", secondary: "Installed, not selected", status: "setup", statusWord: "Found — not selected",
              value: "5.2.2", valueSource: "Reported by the executable",
              fields: { CLI: "5.2.2", Machine: "podman-machine-default (stopped)", Compose: "Provided by podman-compose 1.2.0", Socket: "Not started", Host: "This computer · macOS 15.4" },
              actions: [{ id: "installation.select", label: "Use Podman instead", kind: "primary" }],
              detail: [{ id: "podman-detail", label: "Installation", rows: [
                { label: "Owner", value: "homebrew_formula" },
                { label: "Confidence", value: "proven" },
                { label: "Why not selected", value: "Docker is the preferred runtime for this project.", hint: "Selection is explicit and stays bound by id." }
              ] }] },
            { id: "cnt-k8s", name: "Kubernetes tools", secondary: "Managed by your organisation", status: "managed", statusWord: "Managed by your organisation",
              availability: { available: false, reason: "kubectl, Helm and the kubeconfig contexts are installed and pinned by your organisation's device management.", owner: "Orchard IT" },
              value: "kubectl 1.31.2 · Helm 3.16.1", valueSource: "Reported by the executables",
              fields: { kubectl: "1.31.2 (pinned)", Helm: "3.16.1 (pinned)", Clusters: "orchard-prod", "kubeconfig contexts": "orchard-prod, orchard-staging", Host: "This computer · macOS 15.4" },
              detail: [{ id: "k8s-detail", label: "Installation", rows: [
                { label: "Owner", value: "organization_managed" },
                { label: "Confidence", value: "proven" },
                { label: "Update", value: "Refused", hint: "Puppet Master never mutates an organisation-managed installation. It reports compatibility only." }
              ] }] }
          ]
        },
        {
          id: "registries", label: "Registries", kind: "table",
          columns: [
            { key: "auth", label: "Authentication", weight: 2, align: "start" },
            { key: "use", label: "Used for", weight: 2, align: "start" }
          ],
          items: [
            { id: "reg-internal", name: "registry.orchard.internal", secondary: "Default publishing target", status: "ok", statusWord: "Signed in",
              badges: [{ kind: "source", text: "Vault reference" }],
              editable: [{ key: "cred", label: "Credential", kind: "secret", value: "vault://registry/orchard", secretKind: "vaultReference", help: "Stored as a vault reference. The token itself is never rendered." }],
              fields: { auth: "Vault reference", use: "Publishing project images" } },
            { id: "reg-hub", name: "docker.io", secondary: "Public images", status: "ok", statusWord: "Anonymous",
              fields: { auth: "None", use: "Base images, rate limited" } },
            { id: "reg-unraid", name: "unraid.orchard.internal", secondary: "Unraid publishing", status: "setup", statusWord: "Needs setup",
              availability: { available: false, reason: "No credential is configured for the Unraid registry, so publishing there would fail.", owner: null },
              fields: { auth: "Not configured", use: "Unraid application publishing" },
              actions: [{ id: "containers.add_registry_cred", label: "Add a credential", kind: "primary" }] }
          ]
        },
        {
          id: "remotes", label: "Remote hosts", kind: "list",
          items: [
            { id: "rem-ssh", name: "SSH remote · build-01", secondary: "ssh://jared@build-01.orchard.internal", status: "ok", statusWord: "Reachable",
              fields: { Use: "Builds that need more cores than this device has", Host: "Execution Host", "Container runtime": "Docker 27.3.1" } }
          ],
          empty: { headline: "No remote container hosts", detail: "A remote host lets builds run somewhere with more capacity. Adding one is explicit.", action: null }
        },
        { id: "containers-settings", label: "Container settings", kind: "rows",
          settings: ["cont-enabled", "cont-runtime", "cont-pull", "cont-registry-default", "cont-prune"] }
      ],
      diagnostics: [{ id: "diag-container-log", label: "Open the last build log", kind: "log" }],
      notes: []
    };
  });

  /* ============================================================ WEB & SEARCH */

  reg("manager-web", {
    title: "Web, search and fetch",
    purpose: "How Puppet Master reaches the web, what it may spend, and what it never inspects.",
    icon: "globe"
  }, function () {
    return {
      title: "Web, search and fetch",
      purpose: "How Puppet Master reaches the web, what it may spend, and what it never inspects.",
      icon: "globe",
      health: {
        status: "setup", statusWord: "One provider needs a key",
        headline: "Two search routes are ready. The official API route has no key, so Automatic skips it.",
        detail: "Automatic picks the first ready route in priority order and says which one it used.",
        counts: [{ label: "Search routes", value: 3 }, { label: "Ready", value: 2 }, { label: "Browser sessions", value: 2 }]
      },
      sections: [
        {
          id: "priority", label: "Search provider priority", kind: "list",
          summary: "Order matters: Automatic takes the first ready route. Each row discloses privacy, cost and reliability.",
          items: [
            { id: "web-api", name: "Official search API", secondary: "Priority 1", status: "setup", statusWord: "Needs a key",
              availability: { available: false, reason: "No API key is configured, so this route cannot be used.", owner: null },
              editable: [{ key: "key", label: "API key", kind: "secret", value: "", secretKind: "pmSecret", help: "Stored in the Puppet Master secret store. Reveal shows a masked value." }],
              fields: { Privacy: "Query text leaves the device to the search vendor", Cost: "Billed per thousand queries", Reliability: "Highest" },
              actions: [{ id: "provider.auth.start_setup", label: "Open the key page", kind: "primary" }] },
            { id: "web-subscription", name: "Subscription-backed search", secondary: "Priority 2", status: "ok", statusWord: "Ready",
              badges: [{ kind: "source", text: "Included in an existing subscription" }],
              fields: { Privacy: "Query text leaves the device to the subscription provider", Cost: "Included", Reliability: "High" } },
            { id: "web-browser", name: "Browser-backed search", secondary: "Priority 3", status: "ok", statusWord: "Ready",
              badges: [{ kind: "scope", text: "Browser Program" }],
              fields: { Privacy: "Runs in a Browser Program on this device", Cost: "None", Reliability: "Slower, and depends on the page" } }
          ]
        },
        {
          id: "limits", label: "Limits and credit guards", kind: "list",
          items: [
            { id: "web-limits", name: "Per-operation limits", secondary: "Search, fetch, crawl, map, extract", status: "ok", statusWord: "Configured",
              editable: [
                { key: "search-results", label: "Search results per query", kind: "number", value: 8 },
                { key: "fetch-bytes", label: "Fetch size ceiling", kind: "number", value: 4, help: "MB. A larger page is truncated with a marker." },
                { key: "crawl-pages", label: "Crawl page ceiling", kind: "number", value: 40 },
                { key: "map-depth", label: "Map depth", kind: "number", value: 2 },
                { key: "extract-chars", label: "Extract character ceiling", kind: "number", value: 120000 }
              ],
              fields: { "Credit guard": "Stops at 80% of the monthly credit and asks", "Air-gap": "When the host is offline, every route reports Not available rather than hanging" } },
            { id: "web-cache", name: "Fetch cache", secondary: "Reduces repeat cost", status: "ok", statusWord: "412 entries",
              editable: [{ key: "cache-ttl", label: "Cache entries for", kind: "select", options: ["1 hour", "1 day", "1 week"], value: "1 day" }],
              actions: [{ id: "web.clear_cache", label: "Clear the cache", kind: "quiet" }] }
          ]
        },
        {
          id: "browser", label: "Browser sessions", kind: "list",
          summary: "Puppet Master's own browser runtime. A BrowserWorkspace holds sessions; a Browser Program is one automated run.",
          items: [
            { id: "bw-default", name: "BrowserWorkspace · research", secondary: "2 sessions", status: "ok", statusWord: "Ready",
              fields: { Proxy: "System proxy", Certificates: "System trust store plus one project certificate", "Expert Browser Program": "Enabled for diagnostics only" },
              actions: [{ id: "web.open_workspace", label: "Open the workspace", kind: "quiet" }] },
            { id: "bw-auth", name: "AuthBrowserSession", secondary: "Human only", status: "managed", statusWord: "Not inspectable by agents",
              availability: { available: false, reason: "This session exists so a person can sign in. Agents cannot read its DOM, screenshots, video, console or network traffic, and it is never shown as an ordinary browser workspace.", owner: "Browser Runtime" },
              fields: { Purpose: "Human sign-in only", "Agent access": "None", Retention: "Cleared when the sign-in completes" } }
          ]
        },
        { id: "web-settings", label: "Web settings", kind: "rows", settings: ["web-manager"] }
      ],
      diagnostics: [{ id: "diag-web-log", label: "Open the fetch log", kind: "log" }],
      notes: [
        "Automatic never silently changes privacy or cost: the route it picked is named on every result.",
        "The browser runtime is Puppet Master's own. There is no third-party automation runtime behind it."
      ]
    };
  });

  /* ===================================================== PROJECT SEARCH INDEX */

  reg("manager-index", {
    title: "Index health, exclusions and rebuild",
    purpose: "What retrieval can actually see, and what it costs to keep that true.",
    icon: "database"
  }, function () {
    return {
      title: "Index health, exclusions and rebuild",
      purpose: "What retrieval can actually see, and what it costs to keep that true.",
      icon: "database",
      health: {
        status: "ok", statusWord: "96% fresh",
        headline: "4,182 files indexed. 61 files changed since the last pass and are queued.",
        detail: "A stale index does not fail loudly, it just answers worse — so freshness is a first-class number here.",
        counts: [{ label: "Files", value: 4182 }, { label: "Queued", value: 61 }, { label: "Skipped", value: 38 }, { label: "Disk", value: "820 MB" }]
      },
      primary: { id: "index.rebuild", label: "Rebuild the index", kind: "create" },
      sections: [
        {
          id: "phases", label: "Current pass", kind: "list",
          summary: "Truthful phases, not an indeterminate spinner.",
          items: [
            { id: "phase-scan", name: "Scan", secondary: "Walk the working tree", status: "ok", statusWord: "Done", fields: { Files: "4,243 seen" } },
            { id: "phase-parse", name: "Parse", secondary: "Extract symbols", status: "loading", statusWord: "Running", fields: { Progress: "61 of 61 changed files" } },
            { id: "phase-embed", name: "Embed", secondary: "Build retrieval vectors", status: "setup", statusWord: "Queued", fields: { Waiting: "Parse must finish first" } }
          ]
        },
        {
          id: "exclusions", label: "Exclusions", kind: "list",
          items: [
            { id: "excl-list", name: "Excluded patterns", secondary: "Applied before anything is read", status: "ok", statusWord: "7 patterns",
              editable: [{ key: "patterns", label: "Patterns", kind: "chips", value: ["node_modules/**", "dist/**", "*.min.js", "*.lock", ".git/**", "target/**", "*.psd"] }],
              fields: { Effect: "Excluded files are never opened, so they cost nothing" } },
            { id: "excl-size", name: "Size and symlink policy", secondary: "Why 38 files were skipped", status: "ok", statusWord: "38 skipped",
              editable: [
                { key: "max", label: "Skip files larger than", kind: "number", value: 512, help: "KB." },
                { key: "symlinks", label: "Follow symlinks", kind: "toggle", value: false, help: "Following symlinks can walk out of the project entirely." }
              ],
              actions: [{ id: "index.open_skipped", label: "Show the skipped files", kind: "quiet" }] }
          ]
        },
        {
          id: "cache", label: "Shared cache", kind: "list",
          items: [
            { id: "cache-remote", name: "Project Home Server cache", secondary: "Reuses an index built on the server", status: "ok", statusWord: "In use",
              badges: [{ kind: "source", text: "Inherited from server policy" }],
              fields: { Saves: "About 6 minutes on a cold start", Falls: "Back to a local build when the server is unreachable" },
              actions: [{ id: "index.clear_cache", label: "Clear the cache", kind: "risky" }] }
          ],
          empty: { headline: "No shared cache", detail: "Without one, every device rebuilds its own index.", action: null }
        },
        {
          id: "failures", label: "Failures", kind: "list",
          items: [
            { id: "fail-binary", name: "3 files could not be parsed", secondary: "Unrecognised encoding", status: "attention", statusWord: "Skipped",
              fields: { Files: "assets/legacy.dat, tools/blob.bin, docs/old.doc", Effect: "Retrieval cannot see their contents" },
              actions: [{ id: "index.retry_failed", label: "Retry these files", kind: "quiet" }] }
          ],
          empty: { headline: "No failures", detail: "Every file that was in scope was read successfully.", action: null }
        },
        { id: "index-settings", label: "Index settings", kind: "rows",
          settings: ["idx-enabled", "idx-max-file", "idx-symlinks", "idx-remote-cache"] }
      ],
      diagnostics: [{ id: "diag-index-failures", label: "Open index failures", kind: "log" }],
      notes: []
    };
  });

  /* ======================================================== WORKSPACE CLEANUP */

  reg("manager-cleanup", {
    title: "Cleanup scopes, dry run and receipts",
    purpose: "Reclaim space without removing anything that still matters.",
    icon: "trash"
  }, function () {
    return {
      title: "Cleanup scopes, dry run and receipts",
      purpose: "Reclaim space without removing anything that still matters.",
      icon: "trash",
      health: {
        status: "ok", statusWord: "Dry run required",
        headline: "6.8 GB could be reclaimed across four scopes.",
        detail: "Cleanup always previews first. A scope that could touch uncommitted work refuses instead of asking.",
        counts: [{ label: "Reclaimable", value: "6.8 GB" }, { label: "Scopes", value: 4 }, { label: "Protected", value: 2 }]
      },
      primary: { id: "cleanup.dry_run", label: "Preview a cleanup", kind: "create" },
      sections: [
        {
          id: "scopes", label: "Scopes", kind: "table",
          columns: [
            { key: "size", label: "Reclaims", weight: 1, align: "end" },
            { key: "safety", label: "Safety", weight: 3, align: "start" }
          ],
          items: [
            { id: "clean-build", name: "Build output", secondary: "dist, target, .next", status: "ok", statusWord: "Safe",
              fields: { size: "4.1 GB", safety: "Regenerated by the next build. Nothing unique is lost." },
              actions: [{ id: "cleanup.dry_run", label: "Preview", kind: "primary" }] },
            { id: "clean-cache", name: "Tool caches", secondary: "Package and formatter caches", status: "ok", statusWord: "Safe",
              fields: { size: "2.0 GB", safety: "Re-downloaded on demand; the first build afterwards is slower." },
              actions: [{ id: "cleanup.dry_run", label: "Preview", kind: "primary" }] },
            { id: "clean-worktrees", name: "Idle worktrees", secondary: "Idle more than 21 days", status: "setup", statusWord: "1 eligible, 1 refused",
              fields: { size: "0.7 GB", safety: "orchard-api-spike has uncommitted changes and is refused, not skipped quietly." },
              actions: [{ id: "cleanup.dry_run", label: "Preview", kind: "primary" }] },
            { id: "clean-artifacts", name: "Expired artifacts", secondary: "Past their retention window", status: "ok", statusWord: "Safe",
              fields: { size: "0.0 GB", safety: "Their receipts are kept even after the files go." } }
          ]
        },
        {
          id: "rules", label: "Rules that cannot be turned off", kind: "prose",
          items: [
            { id: "rule-dry", name: "A destructive scope always previews first. The preview lists every path and its size, and nothing is removed until it is confirmed." },
            { id: "rule-worktree", name: "A worktree with uncommitted changes, an active lease, or an open session is never proposed for removal." },
            { id: "rule-evidence", name: "A receipt naming every removed path is written before the removal starts, and is kept afterwards." }
          ]
        },
        { id: "cleanup-settings", label: "Cleanup settings", kind: "rows",
          settings: ["clean-dry-first", "clean-schedule", "clean-keep-evidence", "clean-worktree-age"] }
      ],
      diagnostics: [{ id: "diag-cleanup-receipt", label: "Open the last cleanup receipt", kind: "receipt" }],
      notes: ["Cleanup is not a backup and not a reset. It removes regenerable output, and it says so before it does anything."]
    };
  });

  /* ====================================== FUTURE SERVER MODULE INSERTION SHELL */

  var RESERVED = [
    { id: "res-servers", name: "Servers", owner: "Server Backbone",
      contract: "Deep link server://host/<hostId>; a status card slot on this page; the command family server.host.*; a manager mount point at #/m/manager-server/servers." },
    { id: "res-hosts", name: "Execution Hosts", owner: "Server Backbone",
      contract: "Deep link server://execution-host/<hostId>; status card slot; command family server.exec.*; mount point #/m/manager-server/hosts." },
    { id: "res-clients", name: "Clients", owner: "Server Backbone",
      contract: "Deep link server://client/<clientId>; status card slot; command family server.client.*; mount point #/m/manager-server/clients." },
    { id: "res-hosting", name: "Project Hosting & Files", owner: "Project Sync",
      contract: "Deep link project://hosting/<projectId>; status card slot; command family project.hosting.*; mount point #/m/manager-server/hosting." },
    { id: "res-defaults", name: "Project Defaults & Templates", owner: "Project Defaults",
      contract: "Deep link project://defaults/<projectId>; a rows section fed from the settings registry; command family project.defaults.*." },
    { id: "res-remote", name: "Remote Access", owner: "Remote Access",
      contract: "Deep link server://remote/<hostId>; status card slot; command family server.remote.*; mount point #/m/manager-server/remote." },
    { id: "res-integrations", name: "Integrations & Tools", owner: "Tool Store",
      contract: "Deep link tools://integration/<id>; a cards section; command family tools.integration.*." },
    { id: "res-backup", name: "Backup & Restore", owner: "Storage",
      contract: "Already demonstrated by manager-backup; the server module inserts a server-scoped section rather than a second manager." },
    { id: "res-updates", name: "Updates", owner: "Release Supply Chain",
      contract: "Deep link updates://channel/<channelId>; status card slot; command family app.update.*; mount point #/m/manager-server/updates." }
  ];

  var DEFERRED_OWNERS = [
    { id: "def-onboarding", name: "Product Onboarding", owner: "Product Onboarding",
      why: "First-run onboarding is separate from installation and from server claim. It may launch either and resume with return context.",
      contract: "Accepts onboarding://step/<stepId> and returns to the exact originating row." },
    { id: "def-doctor", name: "Doctor", owner: "Doctor",
      why: "A compact normalised health aggregator and remediation router. It never duplicates domain discovery or repair.",
      contract: "Reads each manager's health block; routes to the owning manager's repair action. It adds no repair logic of its own." },
    { id: "def-install", name: "Installation & Deployment", owner: "Installation/Deployment",
      why: "Installing Puppet Master itself is not the same as claiming a server or onboarding a person.",
      contract: "Accepts install://target/<targetId>; contributes a status card; owns no settings values here." },
    { id: "def-claim", name: "Server Claim & Bootstrap", owner: "Server Claim/Bootstrap",
      why: "Claiming a server is a one-time transactional operation with its own authority model.",
      contract: "Accepts server://claim/<hostId>; contributes a status card; returns to Servers when finished." },
    { id: "def-sync", name: "Project Sync & Move", owner: "Project Sync",
      why: "Moving a project between hosts has its own state machine, which this concept deliberately does not implement.",
      contract: "Accepts project://move/<projectId>; contributes a status card and a receipt; never mutates settings directly." },
    { id: "def-updates", name: "Puppet Master updates", owner: "Release Supply Chain",
      why: "Application and content updates are distinct from provider CLI updates and have their own channel policy.",
      contract: "Accepts updates://app; contributes a status card and a restart plan." }
  ];

  reg("manager-server", {
    title: "Servers, hosts, clients and reserved modules",
    purpose: "The topology in human language, and the modules that will be inserted here later.",
    icon: "server",
    reserved: RESERVED
  }, function () {
    return {
      title: "Servers, hosts, clients and reserved modules",
      purpose: "The topology in human language, and the modules that will be inserted here later.",
      icon: "server",
      owner: {
        name: "Server Backbone",
        why: "The server, host and client state machines are owned elsewhere. This manager reserves their destinations, their card slots and their command families so the modules can be inserted without redesigning Settings.",
        insertionContract: "Each reserved destination below names its canonical owner and the exact insertion contract it will accept: a deep-link route, a status-card slot, a command family and a manager mount point. This concept implements no backend state machine for any of them."
      },
      health: {
        status: "ok", statusWord: "Healthy",
        headline: "Home TrueNAS is connected and is the default execution host. WSL is off, which is healthy.",
        detail: "Nine destinations are reserved for modules that are owned elsewhere.",
        counts: [{ label: "Servers", value: 1 }, { label: "Clients", value: 3 }, { label: "Reserved", value: RESERVED.length }]
      },
      sections: [
        {
          id: "topology", label: "This installation", kind: "cards",
          summary: "Human cards. Raw server catalogues, package roots, WSL internals, kubeconfigs and credential realms are not shown by default.",
          items: [
            { id: "srv-truenas", name: "Home TrueNAS", secondary: "Project Home Server", status: "ok", statusWord: "Connected",
              badges: [{ kind: "scope", text: "Default Execution Host" }],
              fields: { "Processing on this server": "On", "Project Files": "/mnt/projects/Puppet-Master", "Run Work": "Automatic · Home TrueNAS", Clients: "3 paired" },
              detail: [{ id: "srv-truenas-detail", label: "Execution environments", rows: [
                { label: "Linux/container runner", value: "Available", hint: "The server's own environment." },
                { label: "Kubernetes pool", value: "Not configured" },
                { label: "SSH environment", value: "build-01" }
              ] }] },
            { id: "srv-this", name: "This computer", secondary: "Execution Host and Client", status: "ok", statusWord: "Ready",
              fields: { Role: "Client, and an execution host when chosen", "Windows native": "Not applicable on macOS", "Linux through WSL": "Off — optional, and healthy", "macOS native": "Available" } },
            { id: "srv-clients", name: "Clients", secondary: "Devices paired with this installation", status: "ok", statusWord: "3 paired",
              fields: { Paired: "This computer, jared-ipad, orchard-laptop", "Last seen": "orchard-laptop, 2 days ago" } }
          ]
        },
        {
          id: "reserved", label: "Reserved destinations", kind: "list",
          summary: "Each one names the owner that will build it and the exact contract this Settings framework will accept.",
          items: RESERVED.map(function (r) {
            return {
              id: r.id, name: r.name, secondary: "Owned by " + r.owner, status: "managed", statusWord: "Reserved",
              badges: [{ kind: "availability", text: "Not built here", title: "This concept implements no backend state machine for it." }],
              availability: { available: false, reason: "Reserved for its canonical owner. This concept implements no backend state machine for it.", owner: r.owner },
              fields: { "Insertion contract": r.contract }
            };
          })
        },
        {
          id: "deferred", label: "Other deferred owners", kind: "list",
          summary: "Surfaces that touch Settings but are owned by another module, with the same treatment.",
          items: DEFERRED_OWNERS.map(function (d) {
            return {
              id: d.id, name: d.name, secondary: "Owned by " + d.owner, status: "managed", statusWord: "Deferred",
              availability: { available: false, reason: d.why + " This concept implements no backend state machine for it.", owner: d.owner },
              fields: { "Insertion contract": d.contract }
            };
          })
        },
        {
          id: "vocabulary", label: "The five words this uses precisely", kind: "prose",
          items: [
            { id: "voc-1", name: "Project Home Server — the one server that owns a project's vault." },
            { id: "voc-2", name: "Execution Host — a machine that can run work. The Home Server is the default one." },
            { id: "voc-3", name: "Execution Environment — a runtime nested inside a host: native, container, Kubernetes pool, SSH, or WSL. WSL is optional and Off is healthy." },
            { id: "voc-4", name: "Source Location — where the code physically lives, which is not necessarily where it runs." },
            { id: "voc-5", name: "Client — a device you use to drive Puppet Master. A client is not automatically an execution host." }
          ]
        },
        { id: "server-settings", label: "Server settings", kind: "rows",
          settings: ["srv-home", "srv-execution", "srv-wsl", "srv-remote-timeout"] }
      ],
      diagnostics: [{ id: "diag-server-health", label: "Open the host health report", kind: "report" }],
      notes: ["Every card in the reserved sections says once, in its own words, that it implements no backend state machine."]
    };
  });

  /* ==================================================================== MEDIA */

  /* Media records were written before this pass and do not share one capability
   * shape: some carry an array of capability objects, some an object keyed by
   * modality. Read both rather than forcing the fixture to change. */
  function capabilityRows(p) {
    var source = p.capabilities || p.modalities || p.outputs || null;
    if (Array.isArray(source)) {
      return source.map(function (c, j) {
        if (typeof c === "string") return { label: "Capability " + (j + 1), value: c, hint: "" };
        return { label: c.name || ("Capability " + (j + 1)), value: c.state || c.value || "",
          hint: (c.evidence || "") + (c.when ? " · " + c.when : "") };
      });
    }
    if (source && typeof source === "object") {
      return Object.keys(source).map(function (k) {
        var v = source[k];
        if (v && typeof v === "object") {
          return { label: k, value: v.state || v.value || "", hint: (v.evidence || "") + (v.when ? " · " + v.when : "") };
        }
        return { label: k, value: String(v), hint: "" };
      });
    }
    return [];
  }

  reg("manager-media", {
    title: "Media generation and capabilities",
    purpose: "Which routes can produce or read media, and with what evidence.",
    icon: "image"
  }, function (data) {
    var mgr = data.managers["manager-media"] || {};
    var providers = mgr.providers || [];
    return {
      title: "Media generation and capabilities",
      purpose: "Which routes can produce or read media, and with what evidence.",
      icon: "image",
      health: {
        status: "ok", statusWord: "Ready",
        headline: providers.length + " media routes, each with dated capability evidence.",
        detail: "A capability is never inferred from a model name. It is observed, discovered, or read from a catalogue, and the source is shown.",
        counts: [{ label: "Routes", value: providers.length }]
      },
      sections: [
        {
          id: "routes", label: "Media routes", kind: "list",
          items: providers.map(function (p, i) {
            return {
              id: p.id || ("media-" + i),
              name: p.name || p.title || ("Route " + (i + 1)),
              secondary: p.summary || p.note || "",
              status: p.available === false ? "unavailable" : "ok",
              statusWord: p.available === false ? "Unavailable" : (p.statusWord || "Ready"),
              availability: p.available === false
                ? { available: false, reason: p.unavailableReason || p.note || "This route is not available for the current account.", owner: null }
                : { available: true },
              fields: Object.keys(p).reduce(function (acc, k) {
                if (["id", "name", "title", "summary", "note", "available", "statusWord", "unavailableReason", "capabilities", "modalities", "outputs"].indexOf(k) >= 0) return acc;
                if (typeof p[k] === "string" || typeof p[k] === "number") acc[k] = p[k];
                return acc;
              }, {}),
              detail: [{ id: (p.id || i) + "-caps", label: "Capability evidence", rows: capabilityRows(p) }]
            };
          }),
          empty: { headline: "No media routes", detail: "A provider that supports media appears here once its capabilities have been discovered.", action: null }
        },
        {
          id: "boundary", label: "What Settings owns here", kind: "prose",
          items: [
            { id: "media-b1", name: "Settings decides which media routes are allowed and what evidence is required before one is used." },
            { id: "media-b2", name: "It does not measure media spend. That is Usage, exactly as it is for text routes." }
          ]
        }
      ],
      diagnostics: [],
      notes: []
    };
  });
})();
