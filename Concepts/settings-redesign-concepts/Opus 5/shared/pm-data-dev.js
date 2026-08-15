/* Opus 5 — developer tooling domain datasets.
 *
 * Owned by the Stack concept (coverage group concept_3), loaded by every page so
 * cross-concept links resolve manager titles.
 *
 * The recurring idea here is the funnel. Installed, enabled, available, selected
 * and invoked are five different numbers, and a tooling surface that reports one
 * of them as if it were the others is why people cannot tell whether a tool is
 * actually doing anything. MCP, Skills, Plugins and Tools therefore all publish
 * the same five counts, in the same order, from different domains.
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

  function funnel(installed, enabled, available, selected, invoked) {
    return [
      { label: "Installed", value: installed },
      { label: "Enabled", value: enabled },
      { label: "Available now", value: available },
      { label: "Selected this turn", value: selected },
      { label: "Invoked today", value: invoked }
    ];
  }

  /* ================================================================== FILES */

  reg("manager-files", {
    title: "File tree, tabs and editor groups",
    purpose: "How files are shown, opened, grouped and recovered.",
    icon: "folder"
  }, function () {
    return {
      title: "File tree, tabs and editor groups",
      purpose: "How files are shown, opened, grouped and recovered.",
      icon: "folder",
      health: {
        status: "ok", statusWord: "Healthy",
        headline: "18 tabs across 2 editor groups. One file changed on disk since it was opened.",
        detail: "Changed-on-disk is a state, not an error: the buffer is kept and both versions are offered.",
        counts: [{ label: "Open tabs", value: 18 }, { label: "Groups", value: 2 }, { label: "Changed on disk", value: 1 }, { label: "Unsaved", value: 2 }]
      },
      sections: [
        {
          id: "tree", label: "Tree behaviour", kind: "list",
          items: [
            { id: "tree-hidden", name: "Hidden and ignored files", secondary: "Two different things", status: "ok", statusWord: "Both hidden",
              editable: [
                { key: "hidden", label: "Show dotfiles", kind: "toggle", value: false },
                { key: "ignored", label: "Show files ignored by source control", kind: "toggle", value: false, help: "Ignored files are still searchable; this only affects the tree." }
              ],
              fields: { Hidden: "Files whose name starts with a dot", Ignored: "Files matched by .gitignore" } },
            { id: "tree-dnd", name: "Drag and drop", secondary: "Move and copy inside the tree", status: "ok", statusWord: "On",
              editable: [
                { key: "dnd", label: "Allow drag and drop", kind: "toggle", value: true },
                { key: "dnd-confirm", label: "Confirm moves across packages", kind: "toggle", value: true, help: "A move between packages changes imports, so it asks first." }
              ] },
            { id: "tree-large", name: "Large file threshold", secondary: "Above this, the editor opens read-only", status: "ok", statusWord: "8 MB",
              editable: [
                { key: "large", label: "Open read-only above", kind: "number", value: 8, help: "MB. Syntax highlighting is also disabled above this size." },
                { key: "huge", label: "Refuse to open above", kind: "number", value: 128, help: "MB." }
              ],
              fields: { Reason: "A 400 MB log opened in a syntax-highlighted buffer will stall the interface, so it is refused with a reason rather than attempted." } }
          ]
        },
        {
          id: "tabs", label: "Tabs and groups", kind: "table",
          columns: [
            { key: "group", label: "Group", weight: 1, align: "start" },
            { key: "state", label: "State", weight: 2, align: "start" }
          ],
          items: [
            { id: "tab-router", name: "services/api/router.ts", secondary: "Modified 4 minutes ago", status: "ok", statusWord: "Unsaved",
              fields: { group: "Left", state: "Unsaved changes, held in the crash journal" },
              actions: [{ id: "files.save", label: "Save", kind: "primary" }] },
            { id: "tab-db", name: "services/api/db.ts", secondary: "Changed on disk", status: "attention", statusWord: "Changed on disk",
              badges: [{ kind: "evidence", text: "Both versions kept" }],
              fields: { group: "Left", state: "The file changed on disk after it was opened here" },
              actions: [{ id: "files.compare", label: "Compare both versions", kind: "primary" }, { id: "files.reload", label: "Reload from disk", kind: "risky" }] },
            { id: "tab-schema", name: "db/schema.sql", secondary: "Read-only", status: "managed", statusWord: "Read-only",
              availability: { available: false, reason: "The file is outside the FileSafe write boundary for this project.", owner: "Permissions & FileSafe" },
              fields: { group: "Right", state: "Readable, not writable" } },
            { id: "tab-binary", name: "assets/legacy.dat", secondary: "42 MB", status: "unavailable", statusWord: "Not opened",
              availability: { available: false, reason: "The file is larger than the read-only threshold and is not a recognised text format.", owner: null },
              fields: { group: "—", state: "Refused with a reason rather than opened and frozen" } }
          ],
          empty: { headline: "No open tabs", detail: "Opening a file from the tree or from a search result adds it here.", action: null }
        },
        {
          id: "recovery", label: "Recovery", kind: "list",
          items: [
            { id: "rec-journal", name: "Crash journal", secondary: "Unsaved buffers survive a forced quit", status: "ok", statusWord: "2 buffers held",
              editable: [{ key: "journal", label: "Hold unsaved buffers", kind: "toggle", value: true }],
              fields: { Held: "services/api/router.ts, scratch/notes.md", "Written every": "3 seconds" },
              actions: [{ id: "files.open_journal", label: "Show what is held", kind: "quiet" }] }
          ]
        },
        { id: "files-settings", label: "Editor settings", kind: "rows", settings: ["files-manager"] }
      ],
      diagnostics: [{ id: "diag-files-journal", label: "Open the crash journal", kind: "report" }],
      notes: []
    };
  });

  /* =============================================================== TERMINAL */

  var ANSI_SAMPLE = [
    { text: "jared@orchard-api", tone: "accent" },
    { text: ":", tone: "muted" },
    { text: "~/code/orchard-api", tone: "link" },
    { text: " (feature/pg-migration)", tone: "warn" },
    { text: "$ npm test", tone: "text" },
    { text: "PASS  services/api/router.test.ts", tone: "ok" },
    { text: "FAIL  services/api/db.test.ts", tone: "error" },
    { text: "  ● migrates the users table", tone: "muted" }
  ];

  reg("manager-terminal", {
    title: "Terminal profiles",
    purpose: "Shells, appearance, environment policy and transcript behaviour.",
    icon: "terminal",
    ansiSample: ANSI_SAMPLE
  }, function (data, state) {
    var mgr = data.managers["manager-terminal"];
    var profiles = mgr.profiles || [];
    var edits = (state && state.managerEdits) || {};

    /* The preview has to live INSIDE the spec: a generic renderer reads the
     * contract and nothing else, so parking the sample on the manager record
     * would leave the preview unrenderable. Effective values come from
     * managerEdits, so editing font or opacity changes the sample immediately. */
    var preferred = profiles.filter(function (p) { return p.isDefault; })[0] || profiles[0] || {};
    function eff(key, fallback) {
      var k = "edit-manager-terminal-" + preferred.id + "-" + key;
      return edits[k] !== undefined ? edits[k] : fallback;
    }
    var preview = {
      id: "terminal-preview",
      name: "Live preview · " + (preferred.name || "profile"),
      secondary: "Rendered with this profile's current appearance values",
      status: "ok",
      statusWord: "Live",
      fields: {
        Font: eff("font", preferred.font),
        Size: eff("size", preferred.size) + "px",
        "Line height": eff("lineHeight", preferred.lineHeight),
        Palette: eff("palette", preferred.palette),
        Cursor: eff("cursor", preferred.cursor),
        Opacity: eff("opacity", preferred.opacity) + "%"
      },
      detail: [{
        id: "terminal-sample", label: "Sample output",
        rows: (mgr.ansiSample || []).map(function (seg, i) {
          return { label: seg.tone, value: seg.text, hint: i === 0 ? "Coloured by the selected palette." : "" };
        })
      }]
    };

    return {
      title: "Terminal profiles",
      purpose: "Shells, appearance, environment policy and transcript behaviour.",
      icon: "terminal",
      health: {
        status: "setup", statusWord: "One profile unavailable",
        headline: profiles.length + " profiles. PowerShell 7 is configured but pwsh is not installed on this device.",
        detail: "An unavailable profile keeps its configuration; it simply cannot be launched here.",
        counts: [{ label: "Profiles", value: profiles.length }, { label: "Default", value: "zsh (login)" }, { label: "Unavailable", value: 1 }]
      },
      primary: { id: "terminal.add", label: "Add a profile", kind: "add" },
      sections: [
        {
          id: "profiles", label: "Profiles", kind: "list",
          summary: "Selecting a profile previews its font, size, line height, palette, cursor and opacity on real ANSI output.",
          items: profiles.map(function (p) {
            var status = p.state === "unavailable" ? "unavailable" : (p.state === "managed" ? "managed" : "ok");
            return {
              id: p.id, name: p.name, secondary: p.isDefault ? "Default profile" : (p.shell || ""),
              status: status,
              statusWord: p.state === "unavailable" ? "Not installed here" : (p.state === "managed" ? "Defined by the project" : (p.isDefault ? "Default" : "Ready")),
              availability: p.state === "unavailable"
                ? { available: false, reason: p.unavailableReason || "The shell is not installed on this device.", owner: null }
                : (p.state === "managed" ? { available: false, reason: p.managedReason || "The project defines this profile.", owner: "Project" } : { available: true }),
              requested: p.shell, effective: p.shellEffective,
              effectiveWhy: p.shell === p.shellEffective ? null : "Resolved from the login shell on this device.",
              fields: {
                Font: p.font + " · " + p.size + "px · " + p.lineHeight, Fallback: p.fontFallback,
                Palette: p.palette, Cursor: p.cursor, Selection: p.selection, Opacity: p.opacity + "%",
                "Working directory": p.cwd + " → " + p.cwdEffective,
                Environment: p.env, Transcript: p.transcript, "Copy and paste": p.copyPaste, Links: p.links
              },
              editable: p.state === "managed" ? [] : [
                { key: "font", label: "Font", kind: "text", value: p.font },
                { key: "size", label: "Size", kind: "number", value: p.size },
                { key: "lineHeight", label: "Line height", kind: "number", value: p.lineHeight },
                { key: "palette", label: "Palette", kind: "select", options: ["Puppet Master Dark", "Puppet Master Light", "Campbell", "Solarized", "Inherited"], value: p.palette },
                { key: "cursor", label: "Cursor", kind: "select", options: ["Block, blink off", "Block, blink on", "Bar, blink on", "Underline"], value: p.cursor },
                { key: "opacity", label: "Opacity", kind: "number", value: p.opacity }
              ],
              actions: p.state === "unavailable"
                ? [{ id: "terminal.locate", label: "Choose the executable", kind: "quiet" }]
                : [{ id: "terminal.make_default", label: "Make default", kind: "quiet" }, { id: "terminal.duplicate", label: "Duplicate", kind: "quiet" }],
              detail: [{ id: p.id + "-env", label: "Environment policy", rows: [
                { label: "Inheritance", value: p.env },
                { label: "Project variables", value: "3 defined", hint: "Project variables never override a variable the user set." }
              ] }]
            };
          })
        },
        {
          id: "preview", label: "Live preview", kind: "list",
          summary: "The selected profile's font, size, line height, palette, cursor and opacity, applied to real ANSI output.",
          items: [preview]
        },
        {
          id: "policy", label: "Shared policy", kind: "list",
          items: [
            { id: "term-policy", name: "Transcript and safety", secondary: "Applies to every profile", status: "ok", statusWord: "Configured",
              editable: [
                { key: "transcript", label: "Keep transcript lines", kind: "number", value: 10000 },
                { key: "links", label: "Opening links", kind: "select", options: ["Ask before opening", "Open immediately", "Never open"], value: "Ask before opening" },
                { key: "paste", label: "Bracketed paste", kind: "toggle", value: true, help: "Stops a pasted newline from executing a command by itself." }
              ] }
          ]
        },
        { id: "terminal-settings", label: "Terminal settings", kind: "rows", settings: ["term-manager"] }
      ],
      diagnostics: [{ id: "diag-terminal-log", label: "Open the shell resolution log", kind: "log" }],
      notes: []
    };
  });

  /* ==================================================================== LSP */

  var SERVERS = [
    { id: "lsp-ts", name: "TypeScript", server: "typescript-language-server", version: "4.3.3",
      source: "Puppet Master registry", provenance: "Signed registry entry, verified 6 days ago",
      command: "typescript-language-server --stdio", env: "Inherits PATH",
      requested: "services/api, services/web", effective: "services/api, services/web",
      state: "ok", host: "This computer", limits: "Memory ceiling 2 GB · 12,000 files", restartOnCrash: true },
    { id: "lsp-rust", name: "Rust", server: "rust-analyzer", version: "2026-07-28",
      source: "Puppet Master registry", provenance: "Signed registry entry, verified 6 days ago",
      command: "rust-analyzer", env: "Inherits PATH plus CARGO_HOME",
      requested: "tools/indexer", effective: "tools/indexer",
      state: "ok", host: "This computer", limits: "Memory ceiling 4 GB", restartOnCrash: true },
    { id: "lsp-py", name: "Python", server: "pyright-langserver", version: "1.1.389",
      source: "Custom", provenance: "Added by you on 2 August; no registry entry",
      command: "pyright-langserver --stdio", env: "Inherits PATH",
      requested: "scripts", effective: "Not attached",
      why: "The interpreter for scripts/ could not be resolved, so the server started and then reported no workspace.",
      state: "attention", host: "This computer", limits: "Default", restartOnCrash: true },
    { id: "lsp-remote", name: "Go (remote)", server: "gopls", version: "0.16.2",
      source: "Puppet Master registry", provenance: "Signed registry entry",
      command: "gopls serve", env: "Remote environment",
      requested: "services/worker", effective: "services/worker — degraded",
      why: "The execution host is reachable but its file watcher is unavailable, so changes are picked up on save rather than on keystroke.",
      state: "setup", host: "Home TrueNAS · Execution Host", limits: "Remote default", restartOnCrash: false }
  ];

  reg("manager-lsp", {
    title: "Language servers",
    purpose: "Detected servers, coverage, provenance and health.",
    icon: "code",
    servers: SERVERS
  }, function () {
    return {
      title: "Language servers",
      purpose: "Detected servers, coverage, provenance and health.",
      icon: "code",
      health: {
        status: "setup", statusWord: "One not attached",
        headline: "Four servers configured. Three are attached; Python started but attached to nothing.",
        detail: "Requested coverage and effective coverage are separate, and the difference is always explained.",
        counts: [{ label: "Configured", value: 4 }, { label: "Attached", value: 2 }, { label: "Degraded", value: 1 }, { label: "Not attached", value: 1 }]
      },
      search: { placeholder: "Search language servers", fields: ["name", "secondary"] },
      primary: { id: "lsp.add", label: "Add a server", kind: "add" },
      sections: [
        {
          id: "servers", label: "Servers", kind: "list",
          items: SERVERS.map(function (s) {
            return {
              id: s.id, name: s.name, secondary: s.server + " · " + s.version,
              status: s.state, statusWord: s.state === "ok" ? "Attached" : (s.state === "setup" ? "Degraded" : "Not attached"),
              badges: [
                { kind: "source", text: s.source, title: s.provenance },
                { kind: "scope", text: s.host }
              ],
              requested: s.requested, effective: s.effective, effectiveWhy: s.why || null,
              availability: s.effective === "Not attached"
                ? { available: false, reason: s.why, owner: null }
                : { available: true },
              fields: { Command: s.command, Environment: s.env, Limits: s.limits, "Restart on crash": s.restartOnCrash ? "On" : "Off", Provenance: s.provenance },
              editable: [
                { key: "command", label: "Command", kind: "text", value: s.command },
                { key: "env", label: "Environment", kind: "text", value: s.env },
                { key: "init", label: "Initialisation options", kind: "text", value: "{}", help: "Sent verbatim in the initialize request." },
                { key: "restart", label: "Restart on crash", kind: "toggle", value: s.restartOnCrash }
              ],
              actions: [
                { id: "lsp.restart", label: "Restart", kind: "quiet" },
                { id: "lsp.verify", label: "Verify attachment", kind: "quiet" },
                { id: "lsp.remove", label: "Remove", kind: "risky" }
              ],
              detail: [{ id: s.id + "-detail", label: "Attachment", rows: [
                { label: "Requested", value: s.requested },
                { label: "Effective", value: s.effective, hint: s.why || "The server attached to everything that was requested." },
                { label: "Host", value: s.host }
              ] }]
            };
          }),
          empty: { headline: "No language servers", detail: "Without one, code intelligence falls back to text search.", action: { id: "lsp.add", label: "Add a server", kind: "primary" } }
        },
        {
          id: "registry", label: "Registry and custom servers", kind: "prose",
          items: [
            { id: "lsp-reg-1", name: "Registry entries are signed and carry a verification date. A custom server is whatever you point it at, so it shows Custom as its source and no verification claim." },
            { id: "lsp-reg-2", name: "A remote server runs on the execution host that owns the files. Degradation there is reported as degradation, not hidden behind a slower experience." }
          ]
        },
        { id: "lsp-settings", label: "Language server settings", kind: "rows", settings: ["lsp-manager"] }
      ],
      diagnostics: [{ id: "diag-lsp-log", label: "Open the server log", kind: "log" }],
      notes: []
    };
  });

  /* ============================================================= FORMATTERS */

  var FORMATTERS = [
    { id: "fmt-prettier", name: "Prettier", builtin: true, state: "detected", version: "3.3.3",
      command: "prettier --write", extensions: [".ts", ".tsx", ".js", ".json", ".css", ".md"], scope: "Project",
      resolved: "node_modules/.bin/prettier" },
    { id: "fmt-rustfmt", name: "rustfmt", builtin: true, state: "detected", version: "1.8.0",
      command: "rustfmt --edition 2021", extensions: [".rs"], scope: "Global", resolved: "~/.cargo/bin/rustfmt" },
    { id: "fmt-gofmt", name: "gofmt", builtin: true, state: "not found", version: null,
      command: "gofmt -w", extensions: [".go"], scope: "Global", resolved: null,
      reason: "gofmt is not on PATH for this host, so Go files are left untouched." },
    { id: "fmt-black", name: "black", builtin: true, state: "disabled", version: "24.8.0",
      command: "black -", extensions: [".py"], scope: "Project", resolved: ".venv/bin/black",
      reason: "Turned off for this project because the repository formats Python in CI instead." },
    { id: "fmt-sql", name: "sqlfluff (custom)", builtin: false, state: "detected", version: "3.1.1",
      command: "sqlfluff fix -", extensions: [".sql"], scope: "Project", resolved: ".venv/bin/sqlfluff" }
  ];

  reg("manager-formatters", {
    title: "Formatters",
    purpose: "Which formatter runs for which file, and what happens when one is missing.",
    icon: "wrench",
    formatters: FORMATTERS,
    testSnippet: "const  x={a:1,b:  2}\nfunction  f( ){return x }",
    testFormatted: "const x = { a: 1, b: 2 };\nfunction f() {\n  return x;\n}"
  }, function () {
    return {
      title: "Formatters",
      purpose: "Which formatter runs for which file, and what happens when one is missing.",
      icon: "wrench",
      health: {
        status: "setup", statusWord: "One not found",
        headline: "Three formatters detected, one disabled for this project, one not installed.",
        detail: "A missing formatter never rewrites a file with a different tool. It reports once and leaves the file alone.",
        counts: [{ label: "Detected", value: 3 }, { label: "Disabled", value: 1 }, { label: "Not found", value: 1 }]
      },
      primary: { id: "formatters.add", label: "Add a formatter", kind: "add" },
      sections: [
        {
          id: "table", label: "Formatters", kind: "table",
          columns: [
            { key: "extensions", label: "Applies to", weight: 2, align: "start" },
            { key: "command", label: "Command", weight: 2, align: "start" },
            { key: "scope", label: "Scope", weight: 1, align: "start" }
          ],
          items: FORMATTERS.map(function (f) {
            var status = f.state === "detected" ? "ok" : (f.state === "disabled" ? "managed" : "unavailable");
            return {
              id: f.id, name: f.name, secondary: f.version ? "v" + f.version : "Not installed",
              status: status,
              statusWord: f.state === "detected" ? "Detected" : (f.state === "disabled" ? "Disabled" : "Not found"),
              badges: f.builtin ? [{ kind: "source", text: "Built in" }] : [{ kind: "source", text: "Custom" }],
              availability: f.state === "not found"
                ? { available: false, reason: f.reason, owner: null }
                : (f.state === "disabled" ? { available: false, reason: f.reason, owner: "Project" } : { available: true }),
              fields: { extensions: f.extensions.join(" "), command: f.command, scope: f.scope, Resolved: f.resolved || "Not resolved" },
              editable: [
                { key: "command", label: "Command", kind: "text", value: f.command },
                { key: "extensions", label: "Extensions", kind: "chips", value: f.extensions },
                { key: "env", label: "Environment", kind: "text", value: "Inherits PATH" },
                { key: "scope", label: "Scope", kind: "select", options: ["Global", "Project"], value: f.scope },
                { key: "enabled", label: "Enabled", kind: "toggle", value: f.state !== "disabled" }
              ],
              actions: [
                { id: "formatters.test", label: "Test on a sample", kind: "primary" },
                { id: "formatters.reset", label: "Reset to shipped defaults", kind: "quiet" },
                { id: "formatters.remove", label: "Remove", kind: "risky" }
              ]
            };
          })
        },
        {
          id: "test", label: "Test a formatter", kind: "list",
          summary: "Formats a fixture snippet in the page and shows the exact before and after.",
          items: [
            { id: "fmt-test-row", name: "Sample snippet", secondary: "TypeScript", status: "ok", statusWord: "Ready",
              fields: { Before: "const  x={a:1,b:  2}", After: "Runs when you press Test" },
              actions: [{ id: "formatters.test", label: "Test", kind: "primary" }] }
          ]
        },
        { id: "fmt-settings", label: "Formatter settings", kind: "rows",
          settings: ["fmt-enabled", "fmt-on-save", "fmt-missing", "fmt-timeout"] }
      ],
      diagnostics: [{ id: "diag-formatter-output", label: "Open formatter output", kind: "log" }],
      notes: ["A formatter is never substituted. If the configured one is missing, the file is left exactly as it was."]
    };
  });

  /* ================================================== COMMANDS AND SHORTCUTS */

  var COMMANDS = [
    { id: "cmd-deploy", name: "Deploy to staging", scope: "Project", safety: "guarded",
      template: "./scripts/deploy.sh --env staging --tag {tag}", params: [{ name: "tag", kind: "text", value: "v0.31.2" }],
      includes: [], validation: "ok" },
    { id: "cmd-migrate", name: "Run migrations", scope: "Project", safety: "guarded",
      template: "npm run migrate -- --to {version}", params: [{ name: "version", kind: "text", value: "latest" }],
      includes: ["cmd-envcheck"], validation: "ok" },
    { id: "cmd-envcheck", name: "Check environment", scope: "Project", safety: "safe",
      template: "node scripts/env-check.mjs", params: [], includes: [], validation: "ok" },
    { id: "cmd-cleanall", name: "Remove every build artifact", scope: "Global", safety: "dangerous",
      template: "rm -rf {path}/dist {path}/target", params: [{ name: "path", kind: "path", value: "~/code/orchard-api" }],
      includes: [], validation: "warn",
      validationNote: "This command deletes recursively and takes a path parameter, so it is classified dangerous and always previews first." },
    { id: "cmd-broken", name: "Publish package", scope: "Project", safety: "guarded",
      template: "npm publish --tag {channel", params: [{ name: "channel", kind: "text", value: "next" }],
      includes: [], validation: "error", validationNote: "Unbalanced brace at column 26: the parameter {channel is never closed." }
  ];

  var SHORTCUTS = [
    { id: "sc-search", name: "Focus Settings search", binding: "Ctrl + ,", conflict: null, source: "Default" },
    { id: "sc-palette", name: "Open the command palette", binding: "Ctrl + Shift + P", conflict: null, source: "Default" },
    { id: "sc-deploy", name: "Deploy to staging", binding: "Ctrl + Alt + D", conflict: null, source: "Custom" },
    { id: "sc-terminal", name: "Toggle the terminal", binding: "Ctrl + `", conflict: null, source: "Default" },
    { id: "sc-clash", name: "Rebuild the index", binding: "Ctrl + Shift + P", conflict: "Open the command palette", source: "Custom" }
  ];

  reg("manager-commands", {
    title: "Commands and shortcuts",
    purpose: "Custom commands with a dry run, and a keyboard map that admits its conflicts.",
    icon: "keyboard",
    commands: COMMANDS,
    shortcuts: SHORTCUTS
  }, function () {
    return {
      title: "Commands and shortcuts",
      purpose: "Custom commands with a dry run, and a keyboard map that admits its conflicts.",
      icon: "keyboard",
      health: {
        status: "attention", statusWord: "One conflict, one invalid",
        headline: "Five commands and five bindings. One binding is taken twice and one command does not parse.",
        detail: "A conflict is shown on both bindings, not only on the newer one.",
        counts: [{ label: "Commands", value: 5 }, { label: "Bindings", value: 5 }, { label: "Conflicts", value: 1 }, { label: "Invalid", value: 1 }]
      },
      search: { placeholder: "Search commands and shortcuts", fields: ["name", "secondary"] },
      primary: { id: "commands.create", label: "Create a command", kind: "create" },
      sections: [
        {
          id: "commands", label: "Custom commands", kind: "list",
          summary: "Every command is classified before it runs, and a dry run shows the exact resolved string.",
          items: COMMANDS.map(function (c) {
            var status = c.validation === "error" ? "attention" : (c.safety === "dangerous" ? "risky" : "ok");
            return {
              id: c.id, name: c.name, secondary: c.scope + " · " + c.safety,
              status: status,
              statusWord: c.validation === "error" ? "Does not parse" : (c.safety === "dangerous" ? "Dangerous" : (c.safety === "guarded" ? "Guarded" : "Safe")),
              badges: [{ kind: "scope", text: c.scope }, { kind: "evidence", text: "Shell safety: " + c.safety, title: c.validationNote || "Classified from the template and its parameters." }],
              value: c.template, valueSource: "Template",
              availability: c.validation === "error" ? { available: false, reason: c.validationNote, owner: null } : { available: true },
              fields: {
                Template: c.template,
                Parameters: c.params.length ? c.params.map(function (p) { return "{" + p.name + "}"; }).join(" ") : "None",
                Includes: c.includes.length ? c.includes.join(", ") : "None",
                Validation: c.validation === "ok" ? "Parses cleanly" : (c.validationNote || "")
              },
              editable: [
                { key: "template", label: "Command template", kind: "text", value: c.template },
                { key: "scope", label: "Scope", kind: "select", options: ["Global", "Project"], value: c.scope }
              ].concat(c.params.map(function (p) {
                return { key: "param-" + p.name, label: "Parameter " + p.name, kind: p.kind, value: p.value };
              })),
              actions: [
                { id: "commands.dry_run", label: "Dry run", kind: "primary" },
                { id: "commands.edit", label: "Edit", kind: "quiet" },
                { id: "commands.delete", label: "Delete", kind: "risky" }
              ],
              detail: [{ id: c.id + "-dry", label: "Dry run", rows: [
                { label: "Resolved command", value: c.template.replace(/\{(\w+)\}/g, function (m, k) {
                    var found = c.params.filter(function (p) { return p.name === k; })[0];
                    return found ? String(found.value) : m;
                  }) },
                { label: "Dry run never sends work to an agent", value: "", hint: "It resolves the string and shows it. Nothing is executed and no agent is invoked." }
              ] }]
            };
          })
        },
        {
          id: "shortcuts", label: "Keyboard shortcuts", kind: "table",
          summary: "Record a chord by pressing it. Conflicts are detected against every existing binding.",
          columns: [
            { key: "binding", label: "Binding", weight: 1, align: "start" },
            { key: "source", label: "Source", weight: 1, align: "start" },
            { key: "conflict", label: "Conflict", weight: 2, align: "start" }
          ],
          items: SHORTCUTS.map(function (s) {
            return {
              id: s.id, name: s.name, secondary: s.source,
              status: s.conflict ? "attention" : "ok",
              statusWord: s.conflict ? "Conflicts" : "Bound",
              fields: { binding: s.binding, source: s.source, conflict: s.conflict || "None" },
              editable: [{ key: "binding", label: "Binding", kind: "text", value: s.binding, help: "Press Record and type the chord." }],
              actions: [
                { id: "commands.record", label: "Record a new chord", kind: "primary" },
                { id: "commands.reset_binding", label: "Reset", kind: "quiet" }
              ]
            };
          })
        },
        {
          id: "map", label: "The whole map", kind: "list",
          items: [
            { id: "map-actions", name: "Cheat sheet, import and export", secondary: "The full binding list", status: "ok", statusWord: "Available",
              actions: [
                { id: "commands.cheatsheet", label: "Open the cheat sheet", kind: "quiet" },
                { id: "commands.export_bindings", label: "Export bindings", kind: "quiet" },
                { id: "commands.import_bindings", label: "Import bindings", kind: "quiet" },
                { id: "commands.reset_all", label: "Reset every binding", kind: "risky" }
              ] }
          ]
        },
        { id: "commands-settings", label: "Command settings", kind: "rows", settings: ["commands-manager", "tools-manager"] }
      ],
      diagnostics: [{ id: "diag-commands-log", label: "Open the command run log", kind: "log" }],
      notes: ["Dry run never sends work to an agent."]
    };
  });

  /* ==================================================================== MCP */

  reg("manager-mcp", {
    title: "MCP servers",
    purpose: "Server identity, transport, negotiated protocol, health and what each one exposes.",
    icon: "plug"
  }, function (data) {
    var servers = (data.managers["manager-mcp"] || {}).servers || [];
    var connected = servers.filter(function (s) { return s.state === "connected"; });
    return {
      title: "MCP servers",
      purpose: "Server identity, transport, negotiated protocol, health and what each one exposes.",
      icon: "plug",
      health: {
        status: connected.length === servers.length ? "ok" : "attention",
        statusWord: connected.length + " of " + servers.length + " connected",
        headline: "Requested and negotiated protocol revisions are shown separately, because a server may accept an older one.",
        detail: "A disconnected server takes its tools with it, and the tools that depended on it say so.",
        counts: funnel(servers.length, servers.length,
          connected.reduce(function (a, s) { return a + (s.tools || 0); }, 0),
          connected.reduce(function (a, s) { return a + (s.exposed || 0); }, 0), 27)
      },
      search: { placeholder: "Search MCP servers", fields: ["name", "secondary"] },
      primary: { id: "mcp.add", label: "Add a server", kind: "connect" },
      sections: [
        {
          id: "mcp-roster", label: "Every connected server", kind: "table",
          summary: "The full roster. Long lists are windowed: only the rows near the viewport exist, so fifty servers cost the same as five.",
          columns: [
            { key: "transport", label: "Transport" },
            { key: "tools", label: "Tools", align: "end" },
            { key: "protocol", label: "Protocol" }
          ],
          items: (window.PMData.mcpScale || []).map(function (m) {
            return {
              id: m.id, name: m.name, secondary: m.transport === "stdio" ? "Local process" : m.transport === "http" ? "HTTP endpoint" : "Server-sent events",
              status: m.state === "connected" ? "ok" : m.state === "degraded" ? "attention" : m.state === "setup" ? "setup" : "unavailable",
              statusWord: m.stateWord,
              fields: {
                transport: m.transport === "stdio" ? "Local process" : m.transport === "http" ? "HTTP" : "Server-sent events",
                tools: m.tools,
                protocol: m.protocolNegotiated === m.protocolRequested ? "As requested" : "Negotiated down to " + m.protocolNegotiated
              }
            };
          })
        },
        {
          id: "servers", label: "Servers", kind: "list",
          items: servers.map(function (s) {
            return {
              id: s.id, name: s.name, secondary: s.transport + " · " + s.scope,
              status: s.state === "connected" ? "ok" : "attention",
              statusWord: s.state === "connected" ? "Connected" : "Disconnected",
              badges: [{ kind: "scope", text: s.scope }, { kind: "source", text: s.auth }],
              requested: s.protocolRequested, effective: s.protocolNegotiated || "Not negotiated",
              effectiveWhy: s.protocolNegotiated ? null : "The connection never completed, so no revision was agreed.",
              availability: s.state === "connected" ? { available: true }
                : { available: false, reason: s.lastError || s.health || "The server is not reachable.", owner: null },
              fields: { Transport: s.transport, Health: s.health, Tools: s.tools, Resources: s.resources, Exposed: s.exposed, Approval: s.approval },
              editable: [
                { key: "transport", label: "Transport", kind: "select", options: ["stdio", "http", "sse"], value: s.transport },
                { key: "approval", label: "Approval", kind: "select", options: ["Every call", "Once per session", "Never ask"], value: s.approval },
                { key: "auth", label: "Authentication", kind: "secret", value: s.auth, secretKind: s.auth && /keychain|key/i.test(s.auth) ? "vaultReference" : "pmOAuth",
                  help: "Stored by reference. The value itself is never rendered." }
              ],
              actions: [
                { id: "mcp.reconnect", label: "Reconnect", kind: "primary" },
                { id: "mcp.open_logs", label: "Open logs", kind: "quiet" },
                { id: "mcp.remove", label: "Remove", kind: "risky" }
              ],
              detail: [{ id: s.id + "-cat", label: "Catalogue", rows: [
                { label: "Tools", value: s.tools, hint: "Discovered from the server." },
                { label: "Resources", value: s.resources },
                { label: "Exposed to agents", value: s.exposed, hint: "Progressive disclosure selects a subset per turn." }
              ] }]
            };
          }),
          empty: { headline: "No MCP servers", detail: "Adding one exposes its tools and resources to agents, subject to approval.", action: { id: "mcp.add", label: "Add a server", kind: "primary" } }
        },
        { id: "mcp-settings", label: "MCP settings", kind: "rows", settings: ["mcp-manager"] }
      ],
      diagnostics: [{ id: "diag-mcp-log", label: "Open the MCP log", kind: "log" }],
      notes: []
    };
  });

  /* ================================================================= SKILLS */

  reg("manager-skills", {
    title: "Skills",
    purpose: "Installed capabilities, what each one may reach, and which ones actually ran.",
    icon: "sparkle"
  }, function (data) {
    var skills = (data.managers["manager-skills"] || {}).skills || [];
    var enabled = skills.filter(function (s) { return s.state === "enabled"; });
    return {
      title: "Skills",
      purpose: "Installed capabilities, what each one may reach, and which ones actually ran.",
      icon: "sparkle",
      health: {
        status: "ok", statusWord: enabled.length + " enabled",
        headline: "A skill is installed, then enabled, then available in a scope, then selected for a turn, then invoked. Those are five different numbers.",
        detail: "Progressive disclosure decides which enabled skills a given turn actually sees.",
        counts: funnel(skills.length, enabled.length, enabled.length, 3, 9)
      },
      search: { placeholder: "Search skills", fields: ["name", "secondary"] },
      primary: { id: "skills.install", label: "Install a skill", kind: "add" },
      sections: [
        {
          id: "skills", label: "Skills", kind: "list",
          items: skills.map(function (s) {
            return {
              id: s.id, name: s.name, secondary: "v" + s.version + " · " + s.source,
              status: s.state === "enabled" ? "ok" : (s.state === "disabled" ? "managed" : "setup"),
              statusWord: s.state === "enabled" ? "Enabled" : (s.state === "disabled" ? "Disabled" : "Not enabled"),
              badges: [{ kind: "scope", text: s.scope }].concat(s.verified
                ? [{ kind: "evidence", text: "Verified publisher" }]
                : [{ kind: "evidence", text: "Unverified", title: "Nothing vouches for this source." }]),
              fields: { Permissions: (s.permissions || []).join(", ") || "None", Updates: s.updates || "Up to date", Source: s.source },
              editable: [
                { key: "enabled", label: "Enabled", kind: "toggle", value: s.state === "enabled" },
                { key: "scope", label: "Scope", kind: "select", options: ["Everywhere", "This project", "Off"], value: s.scope }
              ],
              actions: (s.updates ? [{ id: "skills.update", label: "Update to " + s.updates.replace(" available", ""), kind: "primary" }] : [])
                .concat([{ id: "skills.inspect", label: "What it may reach", kind: "quiet" }, { id: "skills.remove", label: "Remove", kind: "risky" }])
            };
          }),
          empty: { headline: "No skills installed", detail: "A skill adds a capability an agent can use. Installing one is explicit.", action: { id: "skills.install", label: "Install a skill", kind: "primary" } }
        },
        { id: "skills-settings", label: "Skill settings", kind: "rows", settings: ["skills-manager"] }
      ],
      diagnostics: [{ id: "diag-skills-log", label: "Open the skill invocation log", kind: "log" }],
      notes: []
    };
  });

  /* ================================================================ PLUGINS */

  var PLUGINS = [
    { id: "pl-jira", name: "Jira", version: "1.4.0", loaded: true, source: "Puppet Master registry", verified: true,
      surfaces: ["Command palette", "Goal board"], permissions: ["Network: atlassian.net", "Read project metadata"], state: "enabled" },
    { id: "pl-datadog", name: "Datadog", version: "0.9.2", loaded: true, source: "orchard-labs", verified: true,
      surfaces: ["Status bar"], permissions: ["Network: datadoghq.com"], state: "enabled" },
    { id: "pl-figma", name: "Figma", version: "2.1.0", loaded: false, source: "Community", verified: false,
      surfaces: ["Side panel"], permissions: ["Network: figma.com", "Read project files"], state: "disabled",
      reason: "Disabled because it is unverified and asks for project file access." },
    { id: "pl-notion", name: "Notion", version: "1.0.4", loaded: false, source: "Community", verified: true,
      surfaces: ["Command palette"], permissions: ["Network: notion.so"], state: "failed",
      reason: "The plugin threw during load: its manifest declares an API version this build does not provide." }
  ];

  reg("manager-plugins", {
    title: "Plugins",
    purpose: "What is loaded into the application itself, and what each one may reach.",
    icon: "puzzle",
    plugins: PLUGINS
  }, function () {
    var loaded = PLUGINS.filter(function (p) { return p.loaded; });
    return {
      title: "Plugins",
      purpose: "What is loaded into the application itself, and what each one may reach.",
      icon: "puzzle",
      health: {
        status: "attention", statusWord: "One failed to load",
        headline: "Two plugins loaded. One is disabled on purpose and one failed with a named reason.",
        detail: "A plugin runs inside the application, so its permissions are listed before it is enabled, never after.",
        counts: funnel(PLUGINS.length, loaded.length, loaded.length, 1, 4)
      },
      primary: { id: "plugins.install", label: "Install a plugin", kind: "add" },
      sections: [
        {
          id: "plugins", label: "Plugins", kind: "list",
          items: PLUGINS.map(function (p) {
            return {
              id: p.id, name: p.name, secondary: "v" + p.version + " · " + p.source,
              status: p.state === "enabled" ? "ok" : (p.state === "failed" ? "attention" : "managed"),
              statusWord: p.state === "enabled" ? "Loaded" : (p.state === "failed" ? "Failed to load" : "Disabled"),
              badges: [{ kind: "evidence", text: p.verified ? "Verified publisher" : "Unverified" }],
              availability: p.loaded ? { available: true } : { available: false, reason: p.reason, owner: null },
              fields: { Surfaces: p.surfaces.join(", "), Permissions: p.permissions.join(", ") },
              editable: [{ key: "enabled", label: "Enabled", kind: "toggle", value: p.state === "enabled" }],
              actions: [
                { id: "plugins.inspect", label: "What it may reach", kind: "quiet" },
                { id: "plugins.reload", label: "Reload", kind: "quiet" },
                { id: "plugins.remove", label: "Remove", kind: "risky" }
              ],
              detail: [{ id: p.id + "-perm", label: "Permissions", rows: p.permissions.map(function (perm, i) {
                return { label: "Permission " + (i + 1), value: perm };
              }) }]
            };
          })
        },
        { id: "plugins-settings", label: "Plugin settings", kind: "rows", settings: ["plugins-manager"] }
      ],
      diagnostics: [{ id: "diag-plugins-log", label: "Open the plugin load log", kind: "log" }],
      notes: []
    };
  });

  /* ================================================================== TOOLS */

  var TOOLS = [
    { id: "tl-read", name: "Read file", origin: "Built in", exposed: true, invoked: 84, approval: "Never asks", risk: "safe" },
    { id: "tl-write", name: "Write file", origin: "Built in", exposed: true, invoked: 22, approval: "Follows the access profile", risk: "guarded" },
    { id: "tl-shell", name: "Run a command", origin: "Built in", exposed: true, invoked: 17, approval: "Follows the access profile", risk: "guarded" },
    { id: "tl-browser", name: "Browser Program", origin: "Built in", exposed: true, invoked: 6, approval: "Once per session", risk: "guarded" },
    { id: "tl-gh", name: "Create a pull request", origin: "Plugin · Jira", exposed: true, invoked: 2, approval: "Every call", risk: "guarded" },
    { id: "tl-pg", name: "Query the database", origin: "MCP · postgres", exposed: false, invoked: 0, approval: "Every call", risk: "guarded",
      reason: "The postgres MCP server is disconnected, so this tool is not exposed to any turn." },
    { id: "tl-deploy", name: "Deploy", origin: "Command · Deploy to staging", exposed: false, invoked: 0, approval: "Every call", risk: "dangerous",
      reason: "Dangerous commands are not exposed as tools unless a Goal explicitly requests them." }
  ];

  reg("manager-tools", {
    title: "Tool inventory",
    purpose: "Everything an agent could call, where it came from, and whether it was actually offered.",
    icon: "beaker",
    tools: TOOLS
  }, function () {
    var exposed = TOOLS.filter(function (t) { return t.exposed; });
    return {
      title: "Tool inventory",
      purpose: "Everything an agent could call, where it came from, and whether it was actually offered.",
      icon: "beaker",
      health: {
        status: "setup", statusWord: exposed.length + " of " + TOOLS.length + " exposed",
        headline: "Tools come from four different places: built in, plugins, MCP servers and custom commands.",
        detail: "Being installed is not being exposed, and being exposed is not being selected for a turn.",
        counts: funnel(TOOLS.length, TOOLS.length, exposed.length, 9, 131)
      },
      search: { placeholder: "Search tools", fields: ["name", "secondary"] },
      sections: [
        {
          id: "tools", label: "Tools", kind: "table",
          columns: [
            { key: "origin", label: "Origin", weight: 2, align: "start" },
            { key: "approval", label: "Approval", weight: 2, align: "start" },
            { key: "invoked", label: "Invoked", weight: 1, align: "end" }
          ],
          items: TOOLS.map(function (t) {
            return {
              id: t.id, name: t.name, secondary: t.origin,
              status: t.exposed ? (t.risk === "dangerous" ? "risky" : "ok") : "unavailable",
              statusWord: t.exposed ? "Exposed" : "Not exposed",
              badges: [{ kind: "source", text: t.origin }],
              availability: t.exposed ? { available: true } : { available: false, reason: t.reason, owner: null },
              fields: { origin: t.origin, approval: t.approval, invoked: t.invoked },
              editable: [{ key: "approval", label: "Approval", kind: "select", options: ["Never asks", "Once per session", "Every call", "Follows the access profile"], value: t.approval }]
            };
          })
        },
        {
          id: "disclosure", label: "Progressive disclosure", kind: "prose",
          items: [
            { id: "disc-1", name: "Sixty-four tool schemas is roughly twenty-eight thousand tokens. Sending all of them on every turn would crowd out the code the request is actually about." },
            { id: "disc-2", name: "So a turn receives a selected subset, and the Context manager shows exactly which schemas were admitted and which were left out." }
          ]
        },
        { id: "tools-settings", label: "Tool settings", kind: "rows", settings: ["tools-manager"] }
      ],
      diagnostics: [{ id: "diag-tools-log", label: "Open the tool invocation log", kind: "log" }],
      notes: []
    };
  });

  /* ======================================================== TESTING & DEBUG */

  var CAPABILITIES = [
    { id: "cap-unit", name: "Unit and integration tests", global: "On", project: "On", needs: null },
    { id: "cap-browser", name: "Built-in browser testing", global: "Auto", project: "On", needs: null },
    { id: "cap-desktop", name: "Desktop and native app testing", global: "Auto", project: "Off", needs: "A native harness for this platform" },
    { id: "cap-hot", name: "Hot reload and previews", global: "On", project: "On", needs: null },
    { id: "cap-sim", name: "Simulator, emulator and device testing", global: "Off", project: "Off", needs: "A configured device or simulator", unavailable: "No simulator runtime is installed on this host." },
    { id: "cap-api", name: "API and database testing", global: "Auto", project: "On", needs: null },
    { id: "cap-console", name: "Console and network capture", global: "Auto", project: "Auto", needs: null },
    { id: "cap-perf", name: "Performance testing", global: "Auto", project: "Off", needs: "A baseline to compare against" },
    { id: "cap-sec", name: "Security testing", global: "Off", project: "Off", needs: "An explicit scope; it is never enabled implicitly" },
    { id: "cap-a11y", name: "Accessibility testing", global: "Auto", project: "On", needs: null },
    { id: "cap-dap", name: "DAP debugger", global: "Auto", project: "Auto", needs: null },
    { id: "cap-eval", name: "Persistent evaluation session", global: "Auto", project: "Auto", needs: null },
    { id: "cap-capture", name: "Capture and artifacts", global: "On", project: "On", needs: null }
  ];

  reg("manager-testing", {
    title: "Testing and debug capabilities",
    purpose: "What verification is allowed to do, globally and in this project.",
    icon: "bug",
    capabilities: CAPABILITIES
  }, function () {
    var unavailable = CAPABILITIES.filter(function (c) { return c.unavailable; });
    return {
      title: "Testing and debug capabilities",
      purpose: "What verification is allowed to do, globally and in this project.",
      icon: "bug",
      health: {
        status: "setup", statusWord: unavailable.length + " unavailable",
        headline: "Thirteen capabilities. Auto means the capability is used when the project clearly needs it.",
        detail: "Off is a decision, unavailable is a fact. They are never shown as the same thing.",
        counts: [
          { label: "Capabilities", value: CAPABILITIES.length },
          { label: "On here", value: CAPABILITIES.filter(function (c) { return c.project === "On"; }).length },
          { label: "Auto", value: CAPABILITIES.filter(function (c) { return c.project === "Auto"; }).length },
          { label: "Unavailable", value: unavailable.length }
        ]
      },
      sections: [
        {
          id: "matrix", label: "Capabilities", kind: "matrix",
          summary: "Global sets the ceiling; a project may lower it but never raise it above what the host supports.",
          columns: [
            { key: "global", label: "Global", weight: 1, align: "start" },
            { key: "project", label: "This project", weight: 1, align: "start" },
            { key: "needs", label: "Needs", weight: 2, align: "start" }
          ],
          items: CAPABILITIES.map(function (c) {
            return {
              id: c.id, name: c.name, secondary: "",
              status: c.unavailable ? "unavailable" : (c.project === "Off" ? "managed" : "ok"),
              statusWord: c.unavailable ? "Unavailable" : c.project,
              availability: c.unavailable ? { available: false, reason: c.unavailable, owner: null } : { available: true },
              fields: { global: c.global, project: c.project, needs: c.needs || "Nothing further" },
              editable: c.unavailable ? [] : [
                { key: "global", label: "Global", kind: "select", options: ["Auto", "On", "Off"], value: c.global },
                { key: "project", label: "This project", kind: "select", options: ["Auto", "On", "Off"], value: c.project }
              ]
            };
          })
        },
        {
          id: "meaning", label: "What Auto, On and Off mean", kind: "prose",
          items: [
            { id: "mean-auto", name: "Auto — the capability is used when the project shows it is needed: a test script exists, a device is configured, a baseline is recorded. Nothing is installed to satisfy Auto." },
            { id: "mean-on", name: "On — always use it, and report clearly when it cannot run." },
            { id: "mean-off", name: "Off — never use it, even if the project would benefit. This is your decision, and it is distinct from a capability being unavailable on this host." }
          ]
        },
        { id: "testing-settings", label: "Testing settings", kind: "rows", settings: ["testing-manager"] }
      ],
      diagnostics: [{ id: "diag-testing-log", label: "Open the last test run log", kind: "log" }],
      notes: []
    };
  });
})();
