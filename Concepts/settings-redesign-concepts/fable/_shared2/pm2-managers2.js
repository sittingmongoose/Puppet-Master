// pm2-managers2.js - manager view-model registry, part 2 of 2 (CONTRACT2).
// Demonstrated families: files, terminal, lsp, formatters, commands, mcp, skills,
// plugins, tools, testing, storage, backup, lifecycle, history, artifacts,
// sourceControl, actions, containers, web, searchIndex, cleanup, media, dry.
// Deferred owner shells: onboarding, deployment, serverClaim, servers, hosting,
// remote, projectSync, appUpdates, serverBackup.
// Plain data + semantics only: no HTML, no CSS, no DOM. Registers into
// PM2.managers (owned by pm2-managers.js); if that file has not loaded yet the
// defs queue on window.PM2._pendingManagerDefs and part 1 drains them.
(function () {
  'use strict';

  var DEFS = [];

  /* ---- small shared helpers (file-local, exported nowhere) ---- */

  function data(store) { return (store && store.data) || {}; }

  function byId(list, id) {
    if (!Array.isArray(list)) { return null; }
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) { return list[i]; }
    }
    return null;
  }

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtWhen(iso) {
    if (!iso) { return 'Never'; }
    var m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(String(iso));
    if (!m) { return String(iso); }
    var h = parseInt(m[4], 10);
    var ap = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12;
    if (h12 === 0) { h12 = 12; }
    return MONTHS[parseInt(m[2], 10) - 1] + ' ' + parseInt(m[3], 10) + ', ' + h12 + ':' + m[5] + ' ' + ap;
  }

  function hostName(store, hostId) {
    var topo = data(store).serverTopology || {};
    var h = byId(topo.hosts || [], hostId);
    return h ? h.name : (hostId || 'this computer');
  }

  /* Truthful op/receipt wiring. PM2.states loads after this file but exists
     before any action can run; the guards keep smoke tests honest either way. */
  function op(name, ref) {
    if (window.PM2 && window.PM2.states && typeof window.PM2.states.op === 'function') {
      return window.PM2.states.op(name, ref);
    }
    return receipt(name, 'Simulated receipt (states module absent). Ref: ' + (ref || 'none'));
  }
  function receipt(label, detail) {
    if (window.PM2 && window.PM2.states && typeof window.PM2.states.receipt === 'function') {
      return window.PM2.states.receipt(label, detail);
    }
    return { simulated: true, label: label, detail: detail || null };
  }

  function mdest(managerId, objectId, tab) {
    var d = { route: 'manager', managerId: managerId };
    if (objectId) { d.objectId = objectId; }
    if (tab) { d.tab = tab; }
    return d;
  }
  function ddest(cat, sub) {
    var d = { route: 'dest', cat: cat };
    if (sub) { d.sub = sub; }
    return d;
  }

  /* ================================================================
     m.files - File Manager / Editor (preference document)
     ================================================================ */
  DEFS.push({
    id: 'm.files',
    family: 'File Manager / Editor',
    cat: 'code',
    title: 'Files & Editor',
    blurb: 'How the file tree, editor tabs, and changed-on-disk files behave, plus recovered work.',
    icon: 'folder',
    archetype: 'preference-doc',
    status: 'demonstrated',
    settingPrefixes: ['code.editing.'],
    model: function (store) {
      var d = data(store);
      var fm = d.fileManager || {};
      var tree = fm.tree || {};
      var tabs = fm.tabs || {};
      var rec = fm.recovery || {};
      var proj = (d.serverTopology && d.serverTopology.project) || {};
      var buffers = rec.recoveredBuffers || [];
      var unavailable = fm.unavailable || [];
      return {
        managerId: 'm.files',
        title: 'Files & Editor',
        summary: 'Project files live at ' + (proj.files || '/mnt/projects/Puppet-Master') + ' on the Home Server.',
        sections: [
          {
            id: 'sec.files.tree', kind: 'form', title: 'Tree behavior',
            fields: [
              { id: 'f.files.drag', label: 'Moving files by drag', value: tree.dragDrop === 'ask' ? 'Ask first' : String(tree.dragDrop), note: 'A drop inside the tree is confirmed before anything moves on disk.' },
              { id: 'f.files.hidden', label: 'Hidden files', value: tree.showHidden ? 'Shown' : 'Hidden' },
              { id: 'f.files.ignored', label: 'Ignored files', value: tree.ignoredStyle === 'dim' ? 'Shown, dimmed' : String(tree.ignoredStyle) },
              { id: 'f.files.large', label: 'Large-file caution', value: 'Ask above ' + (tree.largeFileThresholdMB || 50) + ' MB', detail: 'Files over the threshold are not loaded into the editor until you confirm.' }
            ]
          },
          {
            id: 'sec.files.tabs', kind: 'form', title: 'Tabs & open files',
            fields: [
              { id: 'f.files.maxtabs', label: 'Most editor tabs', value: String(tabs.max || 20), detail: 'When the limit is reached, the oldest unpinned tab closes quietly.' },
              { id: 'f.files.split', label: 'Split groups', value: String(tabs.splitGroups || 2) },
              { id: 'f.files.changed', label: 'File changed on disk', value: fm.changedOnDisk === 'prompt' ? 'Ask what to do' : String(fm.changedOnDisk), note: 'You choose between keeping your copy, taking the disk copy, or comparing.' },
              { id: 'f.files.autosave', label: 'Unsaved-work capture', value: 'Every ' + (rec.autosaveSeconds || 30) + ' seconds', detail: 'Captures feed crash recovery; they are internal and never count as saves.' }
            ]
          },
          {
            id: 'sec.files.recovered', kind: 'roster', title: 'Recovered work',
            items: buffers.map(function (b, i) {
              return {
                id: 'buf.' + i,
                label: b.path,
                kind: 'buffer',
                note: (b.restored ? 'Restored' : 'Waiting') + ' \u00b7 captured ' + fmtWhen(b.savedAt),
                dest: mdest('m.files', 'buf.' + i)
              };
            }),
            emptyNote: 'Nothing waiting. Unsaved work only appears here after a crash or forced quit.'
          },
          {
            id: 'sec.files.unavailable', kind: 'health', title: 'Currently unavailable',
            items: unavailable.map(function (u, i) {
              return {
                id: 'mount.' + i,
                label: u.path,
                state: 'unavailable',
                note: u.reason + ' \u00b7 since ' + fmtWhen(u.since),
                dest: mdest('m.files', 'mount.' + i)
              };
            }),
            emptyNote: 'Every project location is reachable.'
          }
        ]
      };
    },
    objects: function (store) {
      var fm = data(store).fileManager || {};
      var out = [];
      ((fm.recovery && fm.recovery.recoveredBuffers) || []).forEach(function (b, i) {
        out.push({ id: 'buf.' + i, label: b.path, kind: 'buffer', note: 'Recovered unsaved work', dest: mdest('m.files', 'buf.' + i) });
      });
      (fm.unavailable || []).forEach(function (u, i) {
        out.push({ id: 'mount.' + i, label: u.path, kind: 'mount', note: u.reason, dest: mdest('m.files', 'mount.' + i) });
      });
      return out;
    },
    actions: function () { return []; },
    states: ['fx.loading-cached']
  });

  /* ================================================================
     m.terminal - Terminal (profile roster + detail sheet)
     ================================================================ */
  DEFS.push({
    id: 'm.terminal',
    family: 'Terminal',
    cat: 'code',
    title: 'Terminal',
    blurb: 'Terminal profiles: shell, look, paste safety, environment, and transcript retention.',
    icon: 'terminal',
    archetype: 'roster-detail',
    status: 'demonstrated',
    settingPrefixes: ['code.terminal.'],
    model: function (store) {
      var profiles = data(store).terminalProfiles || [];
      var def = null;
      profiles.forEach(function (p) { if (p && p['default']) { def = p; } });
      return {
        managerId: 'm.terminal',
        title: 'Terminal',
        summary: profiles.length + ' profiles \u00b7 default is ' + (def ? '\u201c' + def.name + '\u201d (' + def.shell + ')' : 'not set'),
        sections: [
          {
            id: 'sec.term.profiles', kind: 'roster', title: 'Profiles',
            items: profiles.map(function (p) {
              return {
                id: p.id,
                label: p.name + (p['default'] ? ' \u00b7 Default' : ''),
                kind: 'profile',
                note: p.shell + (p.shellSource === 'auto-detected' ? ' (found automatically)' : p.shellSource === 'custom' ? ' (your choice)' : '') + ' \u00b7 ' + p.font + ' ' + p.fontSize,
                dest: mdest('m.terminal', p.id),
                detail: {
                  fields: [
                    { label: 'Shell', value: p.shell + ' \u00b7 ' + p.shellSource },
                    { label: 'Type', value: p.font + ' ' + p.fontSize + ' \u00b7 line height ' + p.lineHeight },
                    { label: 'Cursor', value: p.cursor },
                    { label: 'Copy on select', value: p.copyOnSelect ? 'On' : 'Off' },
                    { label: 'Paste safety', value: p.pastePolicy },
                    { label: 'Links', value: p.linkPolicy },
                    { label: 'Starts in', value: p.cwdPolicy },
                    { label: 'Environment', value: p.envPolicy, note: 'Provider keys are stripped from every terminal environment; agents never see them here.' },
                    { label: 'Transcript kept', value: p.retention },
                    { label: 'Renderer', value: p.renderer, advanced: true },
                    { label: 'Runs at start', value: p.startup || 'Nothing' }
                  ],
                  log: (p.logsSample || []).map(function (l) { return fmtWhen(l.at) + '  ' + l.line; }),
                  ansiPreview: { fg: p.fg, bg: p.bg, ansi: p.ansi, opacity: p.opacity }
                }
              };
            })
          },
          {
            id: 'sec.term.notes', kind: 'overview', title: 'How profiles work',
            rows: [
              { id: 'r.term.default', label: 'Default profile', value: def ? def.name : 'None', note: 'New terminals open with the default; any tab can switch profiles.' },
              { id: 'r.term.env', label: 'Provider keys', value: 'Never inherited', note: 'Every profile strips provider credentials from the environment it hands to the shell.' }
            ]
          }
        ]
      };
    },
    objects: function (store) {
      return (data(store).terminalProfiles || []).map(function (p) {
        return { id: p.id, label: p.name, kind: 'profile', note: p.shell + ' terminal profile', dest: mdest('m.terminal', p.id) };
      });
    },
    actions: function () { return []; },
    states: ['fx.loading-cached']
  });

  /* ================================================================
     m.lsp - LSP (server roster + logs)
     ================================================================ */
  DEFS.push({
    id: 'm.lsp',
    family: 'LSP',
    cat: 'code',
    title: 'Language Servers',
    blurb: 'Which language server handles each language, who owns formatting and diagnostics, and their health.',
    icon: 'bolt',
    archetype: 'roster-detail',
    status: 'demonstrated',
    settingPrefixes: ['code.editing.'],
    model: function (store) {
      var servers = data(store).lsp || [];
      var running = 0, missing = 0;
      servers.forEach(function (s) {
        if (s.health === 'running') { running++; }
        if (s.health === 'not-installed') { missing++; }
      });
      return {
        managerId: 'm.lsp',
        title: 'Language Servers',
        summary: running + ' running \u00b7 ' + missing + ' not installed \u00b7 servers start on the first matching file, never at launch',
        sections: [
          {
            id: 'sec.lsp.servers', kind: 'roster', title: 'Servers by language',
            items: servers.map(function (s) {
              var stateWord = s.health === 'running' ? 'Running'
                : s.health === 'stopped' ? 'Stopped (idle)'
                : s.health === 'not-installed' ? 'Not installed'
                : s.health;
              return {
                id: s.id,
                label: s.language,
                kind: 'lsp-server',
                state: s.health === 'not-installed' ? 'unavailable' : 'normal',
                note: stateWord + (s.version ? ' \u00b7 ' + s.version : ''),
                dest: mdest('m.lsp', s.id),
                detail: {
                  fields: [
                    { label: 'Starts', value: s.startup },
                    { label: 'Provides', value: s.capabilities },
                    { label: 'Formatting owner', value: s.formatting, note: s.conflicts || null },
                    { label: 'Diagnostics owner', value: s.diagnosticsOwner },
                    { label: 'Executable', value: s.executable, advanced: true },
                    { label: 'Version', value: s.version || 'None found', advanced: true }
                  ],
                  log: (s.logsSample || []).map(function (l) { return l.at + '  ' + l.line; })
                }
              };
            })
          },
          {
            id: 'sec.lsp.notes', kind: 'overview', title: 'Ownership',
            rows: [
              { id: 'r.lsp.fmt', label: 'Formatting', value: 'One owner per language', note: 'When a project formatter owns a language (like Prettier for TypeScript), the server defers to it. The owner is shown per server, never guessed.' },
              { id: 'r.lsp.python', label: 'Python', value: 'No server installed', note: 'Python files open without diagnostics until a server is installed on the machine that runs your Python work.' }
            ]
          }
        ]
      };
    },
    objects: function (store) {
      return (data(store).lsp || []).map(function (s) {
        return { id: s.id, label: s.language + ' language server', kind: 'lsp-server', note: s.version || 'not installed', dest: mdest('m.lsp', s.id) };
      });
    },
    actions: function (store) {
      var servers = data(store).lsp || [];
      var rust = byId(servers, 'lsp-rust');
      return [
        {
          id: 'act.lsp.restart',
          label: 'Restart the Rust server',
          ico: 'refresh',
          available: !!(rust && rust.health === 'running'),
          reason: rust && rust.health !== 'running' ? 'The server is not running right now.' : undefined,
          run: function () { return op('lsp-restart', 'lsp-rust'); }
        }
      ];
    },
    states: ['fx.loading-cached']
  });

  /* ================================================================
     m.formatters - Formatters (inventory/catalog with health + test)
     ================================================================ */
  DEFS.push({
    id: 'm.formatters',
    family: 'Formatters',
    cat: 'code',
    title: 'Formatters',
    blurb: 'Which formatter runs for each file type, whether it was found, and a safe way to test it.',
    icon: 'edit',
    archetype: 'catalog',
    status: 'demonstrated',
    settingPrefixes: ['code.editing.'],
    model: function (store) {
      var f = data(store).formatters || {};
      var entries = f.entries || [];
      return {
        managerId: 'm.formatters',
        title: 'Formatters',
        summary: (f.enabled ? 'Formatting is on' : 'Formatting is off') + ' \u00b7 ' + entries.length + ' formatters configured',
        sections: [
          {
            id: 'sec.fmt.master', kind: 'form', title: 'Formatting',
            fields: [
              { id: 'f.fmt.enabled', label: 'Run formatters', value: f.enabled ? 'On' : 'Off', settingId: 'code.editing.formatters-enabled' }
            ]
          },
          {
            id: 'sec.fmt.table', kind: 'table', title: 'Formatters by file type',
            columns: ['Formatter', 'Handles', 'State', 'Applies to'],
            items: entries.map(function (e) {
              var stateWord = e.state === 'detected' ? 'Found \u00b7 ' + e.version
                : e.state === 'not-found' ? 'Not found'
                : e.state === 'disabled' ? 'Turned off'
                : e.state;
              return {
                id: e.id,
                label: e.name,
                kind: 'formatter',
                state: e.state === 'not-found' ? 'unavailable' : e.state === 'disabled' ? 'normal' : 'normal',
                cells: [e.name, e.extensions.join(' '), stateWord, e.scope === 'project' ? 'This project' : 'Everywhere'],
                note: e.installHint || e.disabledNote || null,
                dest: mdest('m.formatters', e.id),
                detail: {
                  fields: [
                    { label: 'Command', value: e.command, advanced: true },
                    { label: 'Environment', value: Object.keys(e.env || {}).length ? Object.keys(e.env).map(function (k) { return k + '=' + e.env[k]; }).join(' ') : 'Nothing extra', advanced: true },
                    { label: 'Built in', value: e.builtIn ? 'Yes' : 'Added by you' }
                  ],
                  lastTest: e.lastTest ? {
                    when: fmtWhen(e.lastTest.when),
                    ok: e.lastTest.ok,
                    sample: e.lastTest.sample || null
                  } : null
                }
              };
            })
          },
          {
            id: 'sec.fmt.preview', kind: 'preview', title: 'Last test',
            note: 'A formatter test runs on a scratch sample only; your files are never touched.',
            sample: (function () {
              var p = byId(entries, 'fmt.prettier');
              return p && p.lastTest ? { formatter: p.name, before: p.lastTest.sample.before, after: p.lastTest.sample.after, when: fmtWhen(p.lastTest.when) } : null;
            })()
          }
        ]
      };
    },
    objects: function (store) {
      var f = data(store).formatters || {};
      return (f.entries || []).map(function (e) {
        return { id: e.id, label: e.name, kind: 'formatter', note: e.extensions.join(' '), dest: mdest('m.formatters', e.id) };
      });
    },
    actions: function (store) {
      var f = data(store).formatters || {};
      var p = byId(f.entries || [], 'fmt.prettier');
      var black = byId(f.entries || [], 'fmt.black');
      return [
        {
          id: 'act.fmt.test',
          label: 'Test Prettier on a sample',
          ico: 'beaker',
          available: !!(p && p.state === 'detected'),
          reason: p && p.state !== 'detected' ? 'Prettier was not found on this computer.' : undefined,
          run: function () { return op('formatter-test', 'fmt.prettier'); }
        },
        {
          id: 'act.fmt.test-black',
          label: 'Test Black on a sample',
          ico: 'beaker',
          available: false,
          reason: black && black.installHint ? black.installHint : 'Black is not installed.',
          run: function () { return receipt('Formatter test skipped', 'Black is not installed on any connected host, so there is nothing to test.'); }
        }
      ];
    },
    states: ['fx.loading-cached']
  });

  /* ================================================================
     m.commands - Commands & Shortcuts (catalog + conflicts)
     ================================================================ */
  DEFS.push({
    id: 'm.commands',
    family: 'Commands & Shortcuts',
    cat: 'extensions',
    title: 'Commands & Shortcuts',
    blurb: 'Keyboard shortcuts, your custom slash commands, and any binding conflicts.',
    icon: 'keyboard',
    archetype: 'catalog',
    status: 'demonstrated',
    settingPrefixes: ['extensions.commands.'],
    model: function (store) {
      var ci = data(store).commandsInfo || {};
      var shortcuts = ci.shortcuts || [];
      var custom = ci.customCommands || [];
      var conflicts = ci.conflicts || [];
      return {
        managerId: 'm.commands',
        title: 'Commands & Shortcuts',
        summary: shortcuts.length + ' shortcuts \u00b7 ' + custom.length + ' custom commands \u00b7 ' + (conflicts.length ? conflicts.length + ' conflict needs a look' : 'no conflicts'),
        sections: [
          {
            id: 'sec.cmd.shortcuts', kind: 'table', title: 'Keyboard shortcuts',
            columns: ['Keys', 'Does', 'Where'],
            items: shortcuts.map(function (s, i) {
              return {
                id: 'sc.' + i,
                label: s.command,
                kind: 'shortcut',
                cells: [s.keys, s.command, s.scope],
                dest: mdest('m.commands', 'sc.' + i)
              };
            })
          },
          {
            id: 'sec.cmd.custom', kind: 'roster', title: 'Custom commands',
            note: 'Custom commands run exactly the line shown, in this project. A dry run only prints what would happen; it never executes anything and never hands work to an agent.',
            items: custom.map(function (c, i) {
              return {
                id: 'cc.' + i,
                label: c.name,
                kind: 'command',
                note: c.scope === 'Project' ? 'This project' : c.scope,
                dest: mdest('m.commands', 'cc.' + i),
                detail: { fields: [{ label: 'Runs', value: c.runs, advanced: true }] }
              };
            })
          },
          {
            id: 'sec.cmd.conflicts', kind: 'health', title: 'Conflicts',
            items: conflicts.map(function (c, i) {
              return {
                id: 'cf.' + i,
                label: c.keys + ' is bound twice',
                state: 'error',
                note: c.between.join(' vs. ') + ' \u2014 ' + c.resolution,
                dest: mdest('m.commands', 'cf.' + i)
              };
            }),
            emptyNote: 'No shortcut is bound to two things.'
          }
        ]
      };
    },
    objects: function (store) {
      var ci = data(store).commandsInfo || {};
      var out = [];
      (ci.customCommands || []).forEach(function (c, i) {
        out.push({ id: 'cc.' + i, label: c.name, kind: 'command', note: 'Custom command', dest: mdest('m.commands', 'cc.' + i) });
      });
      (ci.shortcuts || []).forEach(function (s, i) {
        out.push({ id: 'sc.' + i, label: s.keys + ' \u00b7 ' + s.command, kind: 'shortcut', note: s.scope, dest: mdest('m.commands', 'sc.' + i) });
      });
      return out;
    },
    actions: function (store) {
      var ci = data(store).commandsInfo || {};
      var first = (ci.customCommands || [])[0];
      return [
        {
          id: 'act.cmd.dry-run',
          label: 'Dry-run ' + (first ? first.name : 'a command'),
          ico: 'eye',
          available: !!first,
          run: function () {
            return receipt('Command dry run', (first ? first.name + ' would run: ' + first.runs : 'Nothing to preview') + ' \u2014 nothing was executed, and no agent was involved.');
          }
        },
        {
          id: 'act.cmd.cheatsheet',
          label: 'Copy the shortcut cheat sheet',
          ico: 'copy',
          available: true,
          run: function () {
            var lines = ((data(store).commandsInfo || {}).shortcuts || []).map(function (s) { return s.keys + ' \u2014 ' + s.command; });
            return receipt('Cheat sheet copied', lines.length + ' shortcuts copied as plain text.');
          }
        }
      ];
    },
    states: ['fx.loading-cached']
  });

  /* ================================================================
     m.mcp - MCP (server roster + tools/resources/logs tabs)
     ================================================================ */
  DEFS.push({
    id: 'm.mcp',
    family: 'MCP',
    cat: 'system',
    title: 'MCP Servers',
    blurb: 'Connected MCP servers: what tools they expose, how they sign in, and their connection health.',
    icon: 'plug',
    archetype: 'roster-detail',
    status: 'demonstrated',
    settingPrefixes: ['system.mcp.'],
    model: function (store) {
      var servers = data(store).mcp || [];
      var connected = servers.filter(function (s) { return s.health === 'connected'; }).length;
      return {
        managerId: 'm.mcp',
        title: 'MCP Servers',
        summary: connected + ' of ' + servers.length + ' servers connected \u00b7 tools stay hidden from agents while a server is unreachable',
        sections: [
          {
            id: 'sec.mcp.servers', kind: 'roster', title: 'Servers',
            items: servers.map(function (s) {
              var exposed = (s.tools || []).filter(function (t) { return t.exposed; }).length;
              return {
                id: s.id,
                label: s.name,
                kind: 'mcp-server',
                state: s.health === 'connected' ? 'normal' : 'error',
                note: (s.health === 'connected' ? 'Connected' : 'Disconnected') + ' \u00b7 ' + exposed + ' of ' + (s.tools || []).length + ' tools exposed \u00b7 ' + (s.scope === 'project' ? 'this project' : 'everywhere'),
                dest: mdest('m.mcp', s.id),
                tabs: [
                  {
                    id: 'tools', title: 'Tools',
                    dest: mdest('m.mcp', s.id, 'tools'),
                    items: (s.tools || []).map(function (t) {
                      return { id: t.name, label: t.name, value: t.exposed ? 'Exposed to agents' : 'Held back', note: !t.exposed && s.approval && s.approval.perTool && s.approval.perTool[t.name] ? 'Needs approval ' + s.approval.perTool[t.name] + ' when first exposed' : null };
                    })
                  },
                  {
                    id: 'resources', title: 'Resources',
                    dest: mdest('m.mcp', s.id, 'resources'),
                    items: (s.resources || []).map(function (r, i) {
                      return { id: 'res.' + i, label: r.name, value: r.kind === 'template' ? 'Fill-in template' : 'Resource', note: r.note };
                    })
                  },
                  {
                    id: 'logs', title: 'Log',
                    dest: mdest('m.mcp', s.id, 'logs'),
                    log: s.logsSample || []
                  }
                ],
                detail: {
                  fields: [
                    { label: 'Sign-in', value: s.auth },
                    { label: 'Approval', value: s.approval && s.approval.mode === 'session' ? 'Once per session' : s.approval && s.approval.mode === 'persistent' ? 'Remembered' : 'Every time' },
                    { label: 'Transport', value: s.transport, advanced: true },
                    { label: 'Protocol', value: (s.protocol && s.protocol.negotiated) ? s.protocol.negotiated + (s.protocol.negotiated !== s.protocol.requested ? ' (server is behind the requested ' + s.protocol.requested + ')' : '') : 'Not negotiated \u2014 server unreachable', advanced: true },
                    { label: 'Last discovery', value: s.cache ? fmtWhen(s.cache.lastDiscovery) + ' \u00b7 ' + s.cache.freshness : 'Never', note: s.cache ? s.cache.note : null },
                    { label: 'Claude CLI projection', value: s.projection && s.projection.claudeCli ? 'Projected read-only' : 'Not projected', note: s.projection ? s.projection.note : null, advanced: true }
                  ]
                }
              };
            })
          },
          {
            id: 'sec.mcp.notes', kind: 'overview', title: 'How exposure works',
            rows: [
              { id: 'r.mcp.lazy', label: 'Lazy exposure', value: 'On', note: 'Tools are described to agents only when relevant, keeping the working context small.' },
              { id: 'r.mcp.linear', label: 'Linear', value: 'Reconnecting with backoff', note: 'Its tools are hidden from agents until the connection is healthy again; nothing pretends to be available.' }
            ]
          }
        ]
      };
    },
    objects: function (store) {
      var out = [];
      (data(store).mcp || []).forEach(function (s) {
        out.push({ id: s.id, label: s.name, kind: 'mcp-server', note: s.health === 'connected' ? 'Connected MCP server' : 'Disconnected MCP server', dest: mdest('m.mcp', s.id) });
        (s.tools || []).forEach(function (t) {
          out.push({ id: s.id + '/' + t.name, label: t.name, kind: 'mcp-tool', note: 'Tool on ' + s.name, dest: mdest('m.mcp', s.id, 'tools') });
        });
      });
      return out;
    },
    actions: function (store) {
      var linear = byId(data(store).mcp || [], 'mcp-linear');
      return [
        {
          id: 'act.mcp.reconnect',
          label: 'Reconnect Linear',
          ico: 'refresh',
          available: !!(linear && linear.health !== 'connected'),
          reason: linear && linear.health === 'connected' ? 'Linear is already connected.' : undefined,
          run: function () { return op('reconnect', 'mcp-linear'); }
        },
        {
          id: 'act.mcp.rediscover',
          label: 'Rediscover project-files tools',
          ico: 'search',
          available: true,
          run: function () { return op('catalog-refresh', 'mcp-fs'); }
        }
      ];
    },
    states: ['fx.reconnect-required', 'fx.loading-cached']
  });

  /* ================================================================
     m.skills - Skills (catalog with trust + provenance)
     ================================================================ */
  DEFS.push({
    id: 'm.skills',
    family: 'Skills',
    cat: 'extensions',
    title: 'Skills',
    blurb: 'Reusable skills the assistant can run, where each came from, and what it is allowed to do.',
    icon: 'grad',
    archetype: 'catalog',
    status: 'demonstrated',
    settingPrefixes: ['extensions.skills.'],
    model: function (store) {
      var skills = data(store).skills || [];
      var on = skills.filter(function (s) { return s.enabled; }).length;
      return {
        managerId: 'm.skills',
        title: 'Skills',
        summary: on + ' of ' + skills.length + ' skills enabled \u00b7 discovery runs when skills are first used or on demand, never as a startup scan',
        sections: [
          {
            id: 'sec.skills.list', kind: 'roster', title: 'Skills',
            items: skills.map(function (s) {
              return {
                id: s.id,
                label: s.name,
                kind: 'skill',
                state: s.enabled ? 'normal' : 'unavailable',
                note: (s.enabled ? 'On' : 'Off') + (s.trusted ? '' : ' \u00b7 not yet trusted') + ' \u00b7 ' + (s.scope === 'project' ? 'this project' : 'everywhere'),
                dest: mdest('m.skills', s.id),
                detail: {
                  fields: [
                    { label: 'Comes from', value: s.source },
                    { label: 'May', value: s.permissions },
                    { label: 'Trusted', value: s.trusted ? 'Yes' : 'No \u2014 review its permissions before enabling' }
                  ]
                }
              };
            })
          },
          {
            id: 'sec.skills.notes', kind: 'overview', title: 'Trust',
            rows: [
              { id: 'r.skills.name', label: 'Name collisions', value: 'Project copy wins', note: 'When a project skill and a personal skill share a name, the project copy is used here.' },
              { id: 'r.skills.db', label: 'Database migration helper', value: 'Off, untrusted', note: 'It requests shell and file write. It stays off until you review and trust it.' }
            ]
          }
        ]
      };
    },
    objects: function (store) {
      return (data(store).skills || []).map(function (s) {
        return { id: s.id, label: s.name, kind: 'skill', note: s.enabled ? 'Enabled skill' : 'Disabled skill', dest: mdest('m.skills', s.id) };
      });
    },
    actions: function () {
      return [
        {
          id: 'act.skills.rescan',
          label: 'Look for new skills now',
          ico: 'search',
          available: true,
          run: function () { return receipt('Skill discovery', 'Project and personal skill folders were rescanned on demand. Nothing scans at startup.'); }
        }
      ];
    },
    states: ['fx.loading-cached']
  });

  /* ================================================================
     m.plugins - Plugins (catalog with lifecycle states)
     ================================================================ */
  DEFS.push({
    id: 'm.plugins',
    family: 'Plugins',
    cat: 'extensions',
    title: 'Plugins',
    blurb: 'Installed plugins, their update channel, compatibility, and anything that failed.',
    icon: 'puzzle',
    archetype: 'catalog',
    status: 'demonstrated',
    settingPrefixes: ['extensions.plugins.'],
    model: function (store) {
      var plugins = data(store).plugins || [];
      var failed = plugins.filter(function (p) { return p.lifecycle === 'failed'; }).length;
      return {
        managerId: 'm.plugins',
        title: 'Plugins',
        summary: plugins.length + ' installed \u00b7 ' + (failed ? failed + ' disabled after failures' : 'all healthy'),
        sections: [
          {
            id: 'sec.plugins.list', kind: 'roster', title: 'Installed plugins',
            items: plugins.map(function (p) {
              var word = p.lifecycle === 'active' ? 'Active'
                : p.lifecycle === 'update-available' ? 'Update available'
                : p.lifecycle === 'failed' ? 'Disabled after failure'
                : p.lifecycle;
              return {
                id: p.id,
                label: p.name,
                kind: 'plugin',
                state: p.lifecycle === 'failed' ? 'error' : 'normal',
                note: word + ' \u00b7 ' + (p.channel === 'canary' ? 'canary channel' : 'stable channel'),
                dest: mdest('m.plugins', p.id),
                detail: {
                  fields: [
                    { label: 'Compatibility', value: p.compat },
                    { label: 'May', value: p.permissions },
                    { label: 'Channel', value: p.channel, advanced: true }
                  ],
                  failureNote: p.failed || null
                }
              };
            })
          }
        ]
      };
    },
    objects: function (store) {
      return (data(store).plugins || []).map(function (p) {
        return { id: p.id, label: p.name, kind: 'plugin', note: p.lifecycle === 'failed' ? 'Plugin, disabled after failure' : 'Plugin', dest: mdest('m.plugins', p.id) };
      });
    },
    actions: function (store) {
      var fig = byId(data(store).plugins || [], 'pl-figma');
      return [
        {
          id: 'act.plugins.update-figma',
          label: 'Update Figma import to 2.1',
          ico: 'download',
          available: !!(fig && fig.lifecycle === 'update-available'),
          reason: fig && fig.lifecycle !== 'update-available' ? 'No update is waiting.' : undefined,
          run: function () { return op('plugin-update', 'pl-figma'); }
        }
      ];
    },
    states: ['fx.loading-cached']
  });

  /* ================================================================
     m.tools - Tools (effective-availability catalog)
     ================================================================ */
  DEFS.push({
    id: 'm.tools',
    family: 'Tools',
    cat: 'extensions',
    title: 'Agent Tools',
    blurb: 'Every tool agents can use, whether it is truly available right now, and what approval it needs.',
    icon: 'toolbox',
    archetype: 'catalog',
    status: 'demonstrated',
    settingPrefixes: ['safety.rules.'],
    model: function (store) {
      var tools = data(store).tools || [];
      var avail = tools.filter(function (t) { return t.available; }).length;
      return {
        managerId: 'm.tools',
        title: 'Agent Tools',
        summary: avail + ' of ' + tools.length + ' tools available right now \u00b7 availability is the truth agents see, not a wish',
        sections: [
          {
            id: 'sec.tools.table', kind: 'table', title: 'Tools',
            columns: ['Tool', 'Available now', 'Risk', 'Approval'],
            items: tools.map(function (t) {
              var why = null;
              var extra = [];
              if (!t.projectEnabled) { extra.push('off for this project'); }
              if (t.selectedThisTurn) { extra.push('offered to the agent this turn'); }
              if (t.invokedRecently) { extra.push('used recently'); }
              if (t.id === 't-linear-issues' && !t.available) { why = 'Unavailable while the Linear MCP server is disconnected.'; }
              return {
                id: t.id,
                label: t.name,
                kind: 'tool',
                state: t.available ? 'normal' : 'unavailable',
                cells: [t.name, t.available ? 'Yes' : 'No', t.risk === 'high' ? 'High' : t.risk === 'medium' ? 'Medium' : 'Low', t.approval],
                note: why || (extra.length ? extra.join(' \u00b7 ') : null),
                dest: t.id === 't-linear-issues' ? mdest('m.mcp', 'mcp-linear') : mdest('m.tools', t.id),
                detail: {
                  fields: [
                    { label: 'Installed', value: t.installed ? 'Yes' : 'No' },
                    { label: 'Enabled for this project', value: t.projectEnabled ? 'Yes' : 'No' },
                    { label: 'Offered this turn', value: t.selectedThisTurn ? 'Yes' : 'No', advanced: true },
                    { label: 'Used recently', value: t.invokedRecently ? 'Yes' : 'No', advanced: true }
                  ]
                }
              };
            })
          },
          {
            id: 'sec.tools.notes', kind: 'overview', title: 'How approval fits',
            rows: [
              { id: 'r.tools.rules', label: 'Approval', value: 'Decided by Permissions & FileSafe', note: 'This page shows the effective answer per tool; the rules that produce it live in the Permissions manager.', dest: mdest('m.permissions') }
            ]
          }
        ]
      };
    },
    objects: function (store) {
      return (data(store).tools || []).map(function (t) {
        return { id: t.id, label: t.name, kind: 'tool', note: t.available ? 'Agent tool' : 'Agent tool, currently unavailable', dest: mdest('m.tools', t.id) };
      });
    },
    actions: function () { return []; },
    states: ['fx.loading-cached']
  });

  /* ================================================================
     m.testing - Testing & Debug (capability preference document)
     ================================================================ */
  DEFS.push({
    id: 'm.testing',
    family: 'Testing & Debug',
    cat: 'system',
    title: 'Testing & Debug',
    blurb: 'What the app may test automatically, capability by capability, with the effective answer shown.',
    icon: 'beaker',
    archetype: 'preference-doc',
    status: 'demonstrated',
    settingPrefixes: ['planning.testing.'],
    model: function (store) {
      var caps = (data(store).testingDebug || {}).capabilities || [];
      function word(v) {
        return v === 'auto' ? 'Auto' : v === 'on' ? 'On' : v === 'off' ? 'Off' : v === 'inherit-global' ? 'Same as everywhere' : v;
      }
      function effective(c) {
        var v = c.project === 'inherit-global' ? c.global : c.project;
        return word(v);
      }
      return {
        managerId: 'm.testing',
        title: 'Testing & Debug',
        summary: caps.length + ' capabilities \u00b7 the Effective column is what a run can actually do in this project',
        sections: [
          {
            id: 'sec.testing.matrix', kind: 'table', title: 'Capabilities',
            columns: ['Capability', 'Everywhere', 'This project', 'Effective'],
            items: caps.map(function (c) {
              return {
                id: c.id,
                label: c.label,
                kind: 'capability',
                state: effective(c) === 'Off' ? 'unavailable' : 'normal',
                exposure: c.exposure,
                cells: [c.label, word(c.global), word(c.project), effective(c)],
                note: c.reason || null,
                dest: mdest('m.testing', c.id)
              };
            })
          },
          {
            id: 'sec.testing.notes', kind: 'overview', title: 'How Auto decides',
            rows: [
              { id: 'r.testing.auto', label: 'Auto', value: 'Capability-aware', note: 'Auto turns a capability on only when the project and host can actually support it; the reason is shown whenever the answer is Off.' },
              { id: 'r.testing.eval', label: 'Persistent eval session', value: 'Off, expert-level', note: 'Long-lived eval state is powerful; it stays off unless a debugging task needs it.' }
            ]
          }
        ]
      };
    },
    objects: function (store) {
      return ((data(store).testingDebug || {}).capabilities || []).map(function (c) {
        return { id: c.id, label: c.label, kind: 'capability', note: 'Testing capability', dest: mdest('m.testing', c.id) };
      });
    },
    actions: function () { return []; },
    states: ['fx.loading-cached']
  });

  /* ================================================================
     m.storage - Storage & Retention (read-only health + policies)
     ================================================================ */
  DEFS.push({
    id: 'm.storage',
    family: 'Storage & Retention',
    cat: 'system',
    title: 'Storage & Retention',
    blurb: 'What Puppet Master keeps on disk, how long each kind of data lives, and current disk pressure.',
    icon: 'database',
    archetype: 'health',
    status: 'demonstrated',
    settingPrefixes: ['system.advanced.'],
    model: function (store) {
      var st = data(store).storage || {};
      var usage = st.usage || {};
      var pressure = st.pressure || {};
      return {
        managerId: 'm.storage',
        title: 'Storage & Retention',
        summary: (usage.totalGB || 0) + ' GB in the managed vault \u00b7 ' + (pressure.state === 'elevated' ? 'disk pressure is elevated' : 'disk pressure is normal'),
        sections: [
          {
            id: 'sec.storage.vault', kind: 'health', title: 'Vault',
            items: [
              { id: 'h.storage.mode', label: 'Storage mode', state: 'normal', note: st.mode === 'managed-vault' ? 'Managed vault \u2014 Puppet Master owns layout, integrity, and cleanup.' : String(st.mode), detail: { path: st.vaultPath } },
              { id: 'h.storage.pressure', label: 'Disk pressure', state: pressure.state === 'elevated' ? 'warning' : 'normal', note: (pressure.freeGB || 0) + ' GB free. ' + (pressure.note || '') },
              { id: 'h.storage.migration', label: 'Layout migration', state: 'normal', note: (st.migration && st.migration.note) || 'No migration pending.' }
            ]
          },
          {
            id: 'sec.storage.usage', kind: 'table', title: 'What uses the space',
            columns: ['Data', 'Size'],
            items: (usage.byClass || []).map(function (c) {
              return { id: c.classId, label: c.label, kind: 'storage-class', cells: [c.label, c.gb + ' GB'], dest: mdest('m.storage', c.classId) };
            })
          },
          {
            id: 'sec.storage.retention', kind: 'table', title: 'How long things stay',
            columns: ['Data', 'Kept'],
            items: (st.retention || []).map(function (r) {
              var kept = r.days ? r.days + ' days' : (r.policy === 'until-project-delete' ? 'Until the project is deleted' : String(r.policy));
              return {
                id: 'ret.' + r.classId,
                label: r.label,
                kind: 'retention-class',
                cells: [r.label, kept + (r.legalHold ? ' \u00b7 legal hold' : '')],
                note: r.note || null,
                chips: r.legalHold ? [{ kind: 'managed', label: 'Legal hold' }] : [],
                dest: mdest('m.storage', 'ret.' + r.classId)
              };
            })
          },
          {
            id: 'sec.storage.quarantine', kind: 'roster', title: 'Quarantine',
            items: (st.quarantine || []).map(function (q) {
              return { id: q.id, label: q.item, kind: 'quarantine-item', note: q.reason + ' \u00b7 ' + fmtWhen(q.when), dest: mdest('m.storage', q.id) };
            }),
            emptyNote: 'Nothing is quarantined.'
          },
          {
            id: 'sec.storage.receipts', kind: 'log', title: 'Receipts',
            log: (st.receipts || []).map(function (r) { return fmtWhen(r.when) + '  ' + r.label + '  (' + r.id + ')'; })
          }
        ]
      };
    },
    objects: function (store) {
      var st = data(store).storage || {};
      var out = (st.retention || []).map(function (r) {
        return { id: 'ret.' + r.classId, label: r.label + ' retention', kind: 'retention-class', note: r.legalHold ? 'Retention class under legal hold' : 'Retention class', dest: mdest('m.storage', 'ret.' + r.classId) };
      });
      (st.quarantine || []).forEach(function (q) {
        out.push({ id: q.id, label: q.item, kind: 'quarantine-item', note: 'Quarantined item', dest: mdest('m.storage', q.id) });
      });
      return out;
    },
    actions: function (store) {
      var st = data(store).storage || {};
      return [
        {
          id: 'act.storage.compact',
          label: 'Compact the vault now',
          ico: 'broom',
          available: true,
          run: function () { return op('storage-compact', 'vault'); }
        },
        {
          id: 'act.storage.migrate',
          label: 'Run the layout migration now',
          ico: 'route',
          available: !!(st.migration && st.migration.offer === 'idle'),
          reason: !(st.migration && st.migration.offer === 'idle') ? 'No migration is waiting.' : undefined,
          run: function () { return op('storage-migrate', 'vault-v3'); }
        }
      ];
    },
    states: ['fx.storage-pressure', 'fx.loading-cached']
  });

  /* ================================================================
     m.backup - Backup & Restore (restore-point roster + test restore)
     ================================================================ */
  DEFS.push({
    id: 'm.backup',
    family: 'Backup & Restore',
    cat: 'system',
    title: 'Backup & Restore',
    blurb: 'Four distinct kinds of backup, your restore points, and proof that restores actually work.',
    icon: 'disk',
    archetype: 'roster-detail',
    status: 'demonstrated',
    settingPrefixes: ['system.advanced.'],
    model: function (store) {
      var bk = data(store).backups || {};
      var points = bk.restorePoints || [];
      var sched = bk.schedule || {};
      var tr = (bk.testRestore && bk.testRestore.last) || null;
      return {
        managerId: 'm.backup',
        title: 'Backup & Restore',
        summary: points.length + ' restore points \u00b7 last test restore ' + (tr ? (tr.result === 'passed' ? 'passed on ' + fmtWhen(tr.when) : tr.result) : 'never run'),
        sections: [
          {
            id: 'sec.backup.kinds', kind: 'overview', title: 'Four different things called backup',
            rows: (bk.kinds || []).map(function (k) {
              var row = { id: k.id, label: k.label, value: '', note: k.note };
              if (k.id === 'bk.server') { row.dest = mdest('m.serverBackup'); row.value = 'Owner flow reserved'; }
              return row;
            })
          },
          {
            id: 'sec.backup.points', kind: 'roster', title: 'Restore points',
            items: points.map(function (p) {
              var verifyWord = p.verified ? 'verified' : (p.verification === 'pending' ? 'verification pending' : 'not verified');
              return {
                id: p.id,
                label: p.label,
                kind: 'restore-point',
                state: p.verified ? 'normal' : 'warning',
                note: fmtWhen(p.when) + ' \u00b7 ' + verifyWord + (p.encrypted ? ' \u00b7 encrypted' : ''),
                dest: mdest('m.backup', p.id),
                detail: {
                  fields: [
                    { label: 'Created by', value: p.origin === 'pre-import' ? 'Automatic, before a settings import' : p.origin === 'schedule' ? 'Schedule' : p.origin },
                    { label: 'Size', value: p.sizeMB >= 1024 ? (p.sizeMB / 1024).toFixed(1) + ' GB' : p.sizeMB + ' MB' },
                    { label: 'Target', value: p.target || 'PM vault', advanced: true }
                  ]
                }
              };
            })
          },
          {
            id: 'sec.backup.schedule', kind: 'form', title: 'Schedules',
            fields: [
              { id: 'f.backup.settings', label: 'Settings backup', value: sched.settings === 'on-change' ? 'On every change' : String(sched.settings) },
              { id: 'f.backup.project', label: 'Project backup', value: sched.project || 'Not scheduled' },
              { id: 'f.backup.server', label: 'Full Server backup', value: sched.server || 'Not scheduled', note: 'Taken by the Home Server itself; the full owner flow lives in the reserved Server backup destination.', dest: mdest('m.serverBackup') }
            ]
          },
          {
            id: 'sec.backup.test', kind: 'health', title: 'Does restore actually work?',
            items: tr ? [
              { id: 'h.backup.test', label: 'Last test restore', state: tr.result === 'passed' ? 'normal' : 'error', note: fmtWhen(tr.when) + ' \u00b7 restored ' + tr.point + ' to a ' + tr.target + '. ' + tr.note }
            ] : [],
            emptyNote: 'No test restore has been run yet.'
          },
          {
            id: 'sec.backup.encryption', kind: 'overview', title: 'Encryption',
            rows: [
              { id: 'r.backup.enc', label: 'Backups encrypted', value: (bk.encryption && bk.encryption.enabled) ? 'Yes' : 'No', note: bk.encryption ? bk.encryption.note : null }
            ]
          }
        ]
      };
    },
    objects: function (store) {
      return ((data(store).backups || {}).restorePoints || []).map(function (p) {
        return { id: p.id, label: p.label, kind: 'restore-point', note: 'Restore point from ' + fmtWhen(p.when), dest: mdest('m.backup', p.id) };
      });
    },
    actions: function () {
      return [
        {
          id: 'act.backup.now',
          label: 'Back up the project now',
          ico: 'disk',
          available: true,
          run: function () { return op('backup-now', 'bk.project'); }
        },
        {
          id: 'act.backup.test-restore',
          label: 'Test-restore the weekly backup',
          ico: 'beaker',
          available: true,
          run: function () { return op('test-restore', 'rp.project.weekly-0803'); }
        }
      ];
    },
    states: ['fx.loading-cached']
  });

  /* ================================================================
     m.lifecycle - Settings Lifecycle (preview/confirm transaction)
     ================================================================ */
  DEFS.push({
    id: 'm.lifecycle',
    family: 'Settings Lifecycle',
    cat: 'system',
    title: 'Settings Lifecycle',
    blurb: 'Export a portable settings file, import one with a staged preview and rollback, or reset.',
    icon: 'refresh',
    archetype: 'transaction',
    status: 'demonstrated',
    settingPrefixes: ['system.advanced.'],
    model: function (store) {
      var lc = data(store).settingsLifecycle || {};
      var ex = lc.lastExport || null;
      var ip = lc.importPreview || {};
      var counts = ip.counts || {};
      return {
        managerId: 'm.lifecycle',
        title: 'Settings Lifecycle',
        summary: 'Last export ' + (ex ? fmtWhen(ex.when) : 'never') + ' \u00b7 imports always stage a preview and a restore point first',
        sections: [
          {
            id: 'sec.lc.export', kind: 'overview', title: 'Export',
            rows: [
              { id: 'r.lc.export', label: 'Last export', value: ex ? ex.file : 'Never', note: ex ? fmtWhen(ex.when) + ' \u00b7 covered ' + (ex.scope === 'global+project' ? 'app and project settings' : ex.scope) + ' \u00b7 receipt ' + ex.receiptId : null },
              { id: 'r.lc.secrets', label: 'Secrets', value: 'Never included', note: ip.secretNote || 'Secrets never travel in settings files. Tokens and keys stay behind vault references.' }
            ]
          },
          {
            id: 'sec.lc.steps', kind: 'steps', title: 'How an import runs',
            steps: [
              { id: 'st.lc.1', title: 'Choose a file', note: 'A portable .pmset file from another machine or an earlier export.' },
              { id: 'st.lc.2', title: 'Preview every change', note: 'Adds, changes, conflicts, invalid keys, and legacy migrations are listed before anything is touched.' },
              { id: 'st.lc.3', title: 'Restore point', note: 'A snapshot of current settings is taken automatically. Rollback restores it exactly.' },
              { id: 'st.lc.4', title: 'Apply and verify', note: 'Changes land atomically, then are verified. The receipt names everything that changed.' }
            ]
          },
          {
            id: 'sec.lc.preview', kind: 'preview', title: 'Staged import preview',
            state: ip.state || 'dormant',
            source: ip.source ? { file: ip.source, createdOn: ip.createdOn, mode: ip.mode === 'merge' ? 'Merge with current settings' : 'Replace current settings' } : null,
            counts: { add: counts.add || 0, change: counts.change || 0, conflict: counts.conflict || 0, invalid: counts.invalid || 0, legacyMigrated: counts.legacyMigrated || 0 },
            conflicts: (ip.conflicts || []).map(function (c) {
              return { settingId: c.settingId, local: c.local, incoming: c.incoming, note: c.note, dest: { route: 'setting', settingId: c.settingId } };
            }),
            invalid: (ip.invalid || []).map(function (v) { return { key: v.key, reason: v.reason }; }),
            legacyMigrated: (ip.legacyMigrated || []).map(function (m) { return { from: m.from, to: m.to, note: 'Old key recognized and migrated to its current name.' }; }),
            restorePointId: ip.restorePointId || null,
            note: 'Managed rows are excluded from import; only your own values are compared.'
          },
          {
            id: 'sec.lc.history', kind: 'log', title: 'Import history',
            log: (lc.history || []).map(function (h) {
              var word = h.action === 'import-applied' ? 'Import applied' : h.action === 'rollback-complete' ? 'Rollback complete' : h.action;
              return fmtWhen(h.when) + '  ' + word + ' \u2014 ' + h.detail + '  (' + h.receiptId + ')';
            })
          },
          {
            id: 'sec.lc.reset', kind: 'form', title: 'Reset',
            fields: [
              { id: 'f.lc.reset-scope', label: 'Reset to defaults', value: 'One category, or everything', note: 'A reset stages the same preview and restore point an import does. Nothing resets silently.' },
              { id: 'f.lc.last-reset', label: 'Last reset', value: lc.reset && lc.reset.lastReset ? fmtWhen(lc.reset.lastReset) : 'Never' }
            ]
          }
        ]
      };
    },
    objects: function (store) {
      var lc = data(store).settingsLifecycle || {};
      var out = [];
      if (lc.lastExport) {
        out.push({ id: 'export.last', label: lc.lastExport.file, kind: 'settings-file', note: 'Exported settings file', dest: mdest('m.lifecycle', 'export.last') });
      }
      if (lc.importPreview && lc.importPreview.source) {
        out.push({ id: 'import.staged', label: lc.importPreview.source, kind: 'settings-file', note: 'Settings file with a staged import preview', dest: mdest('m.lifecycle', 'import.staged') });
      }
      return out;
    },
    actions: function (store) {
      var lc = data(store).settingsLifecycle || {};
      var previewStaged = !!(lc.importPreview && lc.importPreview.state && lc.importPreview.state !== 'dormant');
      return [
        {
          id: 'act.lc.export',
          label: 'Export settings now',
          ico: 'upload',
          available: true,
          run: function () { return op('settings-export', 'global+project'); }
        },
        {
          id: 'act.lc.import-preview',
          label: 'Preview pm-settings-macbook.pmset',
          ico: 'eye',
          available: true,
          run: function () { return op('import-preview', 'pm-settings-macbook.pmset'); }
        },
        {
          id: 'act.lc.import-apply',
          label: 'Apply the staged import',
          ico: 'check',
          available: previewStaged,
          reason: previewStaged ? undefined : 'Run the preview first. Apply only ever follows a staged preview and its restore point.',
          run: function () { return op('import-apply', 'pm-settings-macbook.pmset'); }
        },
        {
          id: 'act.lc.rollback',
          label: 'Roll back the last import',
          ico: 'undo',
          available: false,
          reason: 'Nothing to roll back: the July 30 import was already rolled back to its restore point.',
          run: function () { return op('import-rollback', 'rcpt.settings.import.0730'); }
        }
      ];
    },
    states: ['fx.import-conflict', 'fx.rollback-complete', 'fx.validation-error']
  });

  /* ================================================================
     m.history - History & Sessions (session roster + policy)
     ================================================================ */
  DEFS.push({
    id: 'm.history',
    family: 'History & Sessions',
    cat: 'system',
    title: 'History & Sessions',
    blurb: 'Past chat and work sessions for this project, with export, compare, and archive policy.',
    icon: 'history',
    archetype: 'roster-detail',
    status: 'demonstrated',
    settingPrefixes: ['memory.retention.'],
    model: function (store) {
      var sh = data(store).sessionsHistory || {};
      var all = sh.sessions || [];
      var projName = (sh.filters && sh.filters.project) || 'Puppet Master';
      var here = all.filter(function (s) { return s.project === projName; });
      var elsewhere = all.length - here.length;
      var policy = sh.policy || {};
      return {
        managerId: 'm.history',
        title: 'History & Sessions',
        summary: here.length + ' sessions in this project' + (elsewhere ? ' \u00b7 ' + elsewhere + ' in other projects behind the filter' : ''),
        sections: [
          {
            id: 'sec.hist.sessions', kind: 'roster', title: 'Sessions \u00b7 ' + projName,
            filterNote: 'Showing this project. Widen the filter to see every project.',
            items: here.map(function (s) {
              return {
                id: s.id,
                label: s.title,
                kind: 'session',
                state: 'normal',
                note: fmtWhen(s.started) + ' \u00b7 ' + s.turns + ' turns \u00b7 ' + s.routes.join(', ') + (s.archived ? ' \u00b7 archived' : ''),
                chips: s.archived ? [{ kind: 'muted', label: 'Archived' }] : [],
                dest: mdest('m.history', s.id),
                detail: {
                  fields: [
                    { label: 'Size', value: s.sizeMB + ' MB', advanced: true },
                    { label: 'Models used', value: s.routes.join(', ') }
                  ]
                }
              };
            })
          },
          {
            id: 'sec.hist.policy', kind: 'form', title: 'Policy',
            fields: [
              { id: 'f.hist.export', label: 'Export formats', value: (policy['export'] || []).join(', ') || 'None', note: 'A session exports as a readable transcript; receipts and evidence links come along.' },
              { id: 'f.hist.compare', label: 'Compare two sessions', value: policy.compare ? 'Available' : 'Off' },
              { id: 'f.hist.archive', label: 'Archive after', value: (policy.archiveAfterDays || 90) + ' days', note: 'Archived sessions stay searchable; they just leave the default list.' },
              { id: 'f.hist.delete', label: 'Deleting a session', value: policy.deletion === 'ask' ? 'Always asks first' : String(policy.deletion) }
            ]
          }
        ]
      };
    },
    objects: function (store) {
      return ((data(store).sessionsHistory || {}).sessions || []).map(function (s) {
        return { id: s.id, label: s.title, kind: 'session', note: s.project + ' session', dest: mdest('m.history', s.id) };
      });
    },
    actions: function () {
      return [
        {
          id: 'act.hist.export',
          label: 'Export the latest session as Markdown',
          ico: 'download',
          available: true,
          run: function () { return receipt('Session exported', '\u201cSettings bakeoff \u2014 shell polish\u201d exported as Markdown to the artifacts folder. The session itself is untouched.'); }
        },
        {
          id: 'act.hist.reindex',
          label: 'Rebuild the session index',
          ico: 'refresh',
          available: true,
          run: function () { return op('sessions-reindex', 'proj.puppet-master'); }
        }
      ];
    },
    states: ['fx.loading-cached']
  });

  /* ================================================================
     m.artifacts - Runtime Artifacts / Project Outputs (roster)
     ================================================================ */
  DEFS.push({
    id: 'm.artifacts',
    family: 'Runtime Artifacts / Project Outputs',
    cat: 'system',
    title: 'Runtime Artifacts',
    blurb: 'Everything runs produced \u2014 reports, logs, captures \u2014 where each lives and how long it stays.',
    icon: 'box',
    archetype: 'roster-detail',
    status: 'demonstrated',
    settingPrefixes: ['media.io.', 'system.advanced.'],
    model: function (store) {
      var entries = (data(store).artifacts || {}).entries || [];
      var expiring = entries.filter(function (a) { return a.cleanupCandidate; }).length;
      return {
        managerId: 'm.artifacts',
        title: 'Runtime Artifacts',
        summary: entries.length + ' artifacts tracked' + (expiring ? ' \u00b7 ' + expiring + ' expired and ready for cleanup' : ''),
        sections: [
          {
            id: 'sec.art.list', kind: 'roster', title: 'Artifacts',
            items: entries.map(function (a) {
              var typeWord = a.type === 'report' ? 'Report' : a.type === 'log' ? 'Log' : a.type === 'capture' ? 'Capture' : a.type === 'bundle' ? 'Bundle' : a.type;
              var redact = a.redaction && a.redaction.state !== 'none'
                ? 'Redaction ' + (a.redaction.state === 'applied' ? 'applied' : a.redaction.state) + (a.redaction.rules.length ? ' (' + a.redaction.rules.join(', ') + ')' : '')
                : null;
              return {
                id: a.id,
                label: a.name,
                kind: 'artifact',
                state: a.retention === 'expired' ? 'warning' : 'normal',
                note: typeWord + ' \u00b7 version ' + a.version + ' \u00b7 kept ' + (a.retention === 'until-project-delete' ? 'until the project is deleted' : a.retention),
                chips: a.identity === 'provider-native' ? [{ kind: 'origin', label: 'Provider-produced' }] : [],
                dest: mdest('m.artifacts', a.id),
                detail: {
                  fields: [
                    { label: 'Produced by', value: 'Session ' + a.producedBy, dest: mdest('m.history', a.producedBy) },
                    { label: 'Identity', value: a.identity === 'pm' ? 'Produced by Puppet Master' : 'Produced by the provider, tracked by PM', note: a.identityNote || null },
                    { label: 'Location', value: a.location, advanced: true },
                    { label: 'Redaction', value: redact || 'None needed' },
                    { label: 'Receipt', value: a.receiptId, advanced: true }
                  ],
                  rowActions: a.actions || []
                }
              };
            })
          },
          {
            id: 'sec.art.notes', kind: 'overview', title: 'Cleanup',
            rows: [
              { id: 'r.art.cleanup', label: 'Expired artifacts', value: expiring ? expiring + ' waiting' : 'None', note: 'Reclaiming space is Workspace Cleanup\u2019s job \u2014 always dry run first.', dest: mdest('m.cleanup') }
            ]
          }
        ]
      };
    },
    objects: function (store) {
      return ((data(store).artifacts || {}).entries || []).map(function (a) {
        return { id: a.id, label: a.name, kind: 'artifact', note: a.type + ' artifact', dest: mdest('m.artifacts', a.id) };
      });
    },
    actions: function () {
      return [
        {
          id: 'act.art.export',
          label: 'Export a copy of the audit report',
          ico: 'download',
          available: true,
          run: function () { return receipt('Artifact exported', 'settings-audit-report.pdf was copied outside the vault. The original, its version history, and its receipt stay put.'); }
        }
      ];
    },
    states: ['fx.loading-cached', 'fx.storage-pressure']
  });

  /* ================================================================
     m.sourceControl - Source Control / Worktrees (roster + detail)
     ================================================================ */
  DEFS.push({
    id: 'm.sourceControl',
    family: 'Source Control / Worktrees',
    cat: 'branching',
    title: 'Source Control & Worktrees',
    blurb: 'Version-control tools per host, forge connections, worktrees and their leases, and push safety.',
    icon: 'worktree',
    archetype: 'roster-detail',
    status: 'demonstrated',
    settingPrefixes: ['branching.worktrees.'],
    model: function (store) {
      var sc = data(store).sourceControl || {};
      var wt = sc.worktrees || {};
      var active = wt.active || [];
      return {
        managerId: 'm.sourceControl',
        title: 'Source Control & Worktrees',
        summary: (sc.tools || []).length + ' tools \u00b7 ' + active.length + ' worktrees \u00b7 force-push is never allowed on protected branches',
        sections: [
          {
            id: 'sec.sc.tools', kind: 'roster', title: 'Tools',
            note: 'Installs go to the exact host and environment you pick, from the official source, and never anywhere else.',
            items: (sc.tools || []).map(function (t) {
              var readyOn = [], offers = [];
              (t.hostStates || []).forEach(function (hs) {
                if (hs.state === 'ready') { readyOn.push(hostName(store, hs.hostId) + ' (' + hs.version + ')'); }
                if (hs.installOffer) { offers.push(hs.installOffer.label); }
              });
              return {
                id: t.id,
                label: t.name,
                kind: 'sc-tool',
                state: readyOn.length ? 'normal' : 'unavailable',
                note: (readyOn.length ? 'Ready on ' + readyOn.join(', ') : 'Not installed anywhere') + (offers.length ? ' \u00b7 ' + offers.join(' \u00b7 ') : ''),
                dest: mdest('m.sourceControl', t.id),
                detail: {
                  fields: (t.hostStates || []).map(function (hs) {
                    return {
                      label: hostName(store, hs.hostId) + (hs.envId ? ' \u00b7 ' + hs.envId : ''),
                      value: hs.state === 'ready' ? hs.version : 'Not installed',
                      note: hs.installationNote || (hs.installOffer ? hs.installOffer.note : null),
                      advanced: !!hs.installationNote
                    };
                  })
                }
              };
            })
          },
          {
            id: 'sec.sc.forges', kind: 'roster', title: 'Forges',
            note: 'A forge is a hosted service. Connecting one is a sign-in, never a CLI install.',
            items: (sc.forges || []).map(function (f) {
              return {
                id: f.id,
                label: f.name,
                kind: 'forge',
                state: f.state === 'connected' ? 'normal' : 'unavailable',
                note: f.state === 'connected'
                  ? 'Connected as ' + f.account + (f.capability && f.capability.actions ? ' \u00b7 Actions available' : '')
                  : (f.connectOffer ? f.connectOffer.label + ' \u2014 ' + f.connectOffer.note : 'Not connected'),
                dest: mdest('m.sourceControl', f.id),
                detail: {
                  fields: f.state === 'connected' ? [
                    { label: 'Access', value: (f.scopes || []).join(', '), advanced: true },
                    { label: 'Note', value: f.connectNote }
                  ] : []
                }
              };
            })
          },
          {
            id: 'sec.sc.worktrees', kind: 'roster', title: 'Worktrees',
            items: active.map(function (w) {
              var stateWord = w.state === 'leased' ? 'Leased' : w.state === 'idle' ? 'Idle' : w.state === 'stale' ? 'Stale' : w.state;
              return {
                id: w.id,
                label: w.branch,
                kind: 'worktree',
                state: w.state === 'stale' ? 'warning' : 'normal',
                note: stateWord + (w.lease ? ' by ' + w.lease.holder + ' until ' + fmtWhen(w.lease.expires) : '') + (w.staleNote ? ' \u00b7 ' + w.staleNote : ''),
                chips: w.lease ? [{ kind: 'managed', label: 'Leased' }] : [],
                dest: mdest('m.sourceControl', w.id),
                detail: { fields: [{ label: 'Path', value: w.path, advanced: true }] }
              };
            })
          },
          {
            id: 'sec.sc.policy', kind: 'form', title: 'Safety',
            fields: [
              { id: 'f.sc.policy', label: 'Worktrees', value: wt.policy === 'auto-per-goal' ? 'One per goal, automatic' : String(wt.policy) },
              { id: 'f.sc.tests', label: 'Test before merge', value: wt.testBeforeMerge === 'on' ? 'Always' : String(wt.testBeforeMerge) },
              { id: 'f.sc.force', label: 'Force push', value: (wt.pushPolicy && wt.pushPolicy.force === 'never') ? 'Never' : String(wt.pushPolicy && wt.pushPolicy.force), note: 'Protected: ' + ((wt.pushPolicy && wt.pushPolicy.protected) || []).join(', ') },
              { id: 'f.sc.recovery', label: 'Branch recovery', value: ((sc.recovery && sc.recovery.reflogDays) || 90) + ' days', note: sc.recovery ? sc.recovery.note : null }
            ]
          },
          {
            id: 'sec.sc.ssh', kind: 'roster', title: 'SSH keys',
            items: ((sc.ssh && sc.ssh.keys) || []).map(function (k) {
              return { id: k.id, label: k.label, kind: 'ssh-key', note: 'Created ' + k.created + ' \u00b7 used for ' + (k.hosts || []).join(', '), dest: mdest('m.sourceControl', k.id) };
            })
          }
        ]
      };
    },
    objects: function (store) {
      var sc = data(store).sourceControl || {};
      var out = [];
      (sc.tools || []).forEach(function (t) {
        out.push({ id: t.id, label: t.name, kind: 'sc-tool', note: 'Source-control tool', dest: mdest('m.sourceControl', t.id) });
      });
      (sc.forges || []).forEach(function (f) {
        out.push({ id: f.id, label: f.name, kind: 'forge', note: f.state === 'connected' ? 'Connected forge' : 'Forge, not connected', dest: mdest('m.sourceControl', f.id) });
      });
      ((sc.worktrees && sc.worktrees.active) || []).forEach(function (w) {
        out.push({ id: w.id, label: w.branch, kind: 'worktree', note: 'Worktree at ' + w.path, dest: mdest('m.sourceControl', w.id) });
      });
      ((sc.ssh && sc.ssh.keys) || []).forEach(function (k) {
        out.push({ id: k.id, label: k.label, kind: 'ssh-key', note: 'SSH key', dest: mdest('m.sourceControl', k.id) });
      });
      return out;
    },
    actions: function (store) {
      var sc = data(store).sourceControl || {};
      var gitlab = byId(sc.forges || [], 'forge.gitlab');
      return [
        {
          id: 'act.sc.install-jj',
          label: 'Install Jujutsu on WSL Ubuntu',
          ico: 'download',
          available: true,
          run: function () { return op('tool-install', 'tool.jujutsu@env.win.wsl'); }
        },
        {
          id: 'act.sc.setup-lfs',
          label: 'Set Up Git LFS on this computer',
          ico: 'download',
          available: true,
          run: function () { return op('tool-install', 'tool.git-lfs@host.win-desktop'); }
        },
        {
          id: 'act.sc.connect-gitlab',
          label: 'Connect GitLab',
          ico: 'link',
          available: !!(gitlab && gitlab.state === 'not-connected'),
          reason: gitlab && gitlab.state === 'connected' ? 'GitLab is already connected.' : undefined,
          run: function () { return op('forge-connect', 'forge.gitlab'); }
        }
      ];
    },
    states: ['fx.loading-cached']
  });

  /* ================================================================
     m.actions - GitHub Actions (readiness health + run log)
     ================================================================ */
  DEFS.push({
    id: 'm.actions',
    family: 'GitHub Actions',
    cat: 'branching',
    title: 'GitHub Actions',
    blurb: 'Pinned workflows, whether the current branch would pass, and the latest runs at a glance.',
    icon: 'workflow',
    archetype: 'health',
    status: 'demonstrated',
    settingPrefixes: ['branching.worktrees.'],
    model: function (store) {
      var ga = data(store).githubActions || {};
      var pinned = ga.pinned || [];
      var runs = ga.runs || [];
      var failing = pinned.filter(function (w) { return w.readiness === 'failing'; }).length;
      return {
        managerId: 'm.actions',
        title: 'GitHub Actions',
        summary: pinned.length + ' pinned workflows \u00b7 ' + (failing ? failing + ' failing' : 'all passing') + ' \u00b7 connected as ' + ((ga.accountCapability && ga.accountCapability.account) || 'no account'),
        sections: [
          {
            id: 'sec.ga.boundary', kind: 'overview', title: 'What lives here',
            rows: [
              { id: 'r.ga.boundary', label: 'This page', value: 'Pinning, readiness, setup', note: ga.boundaryNote || 'Deep run browsing stays in the GitHub Actions panel.' },
              { id: 'r.ga.account', label: 'Connection', value: (ga.accountCapability && ga.accountCapability.account) || 'None', note: ga.accountCapability ? ga.accountCapability.note : null, dest: mdest('m.sourceControl', 'forge.github') }
            ]
          },
          {
            id: 'sec.ga.pinned', kind: 'health', title: 'Pinned workflows',
            items: pinned.map(function (w) {
              return {
                id: w.id,
                label: w.name + ' \u00b7 ' + w.branch,
                state: w.readiness === 'passing' ? 'normal' : 'error',
                note: w.readiness === 'passing'
                  ? 'Passing \u00b7 last run ' + fmtWhen(w.lastRun.when)
                  : 'Failing since ' + fmtWhen(w.lastRun.when) + (w.lastRun.failedJob ? ' \u00b7 job "' + w.lastRun.failedJob + '" failed' : ''),
                dest: mdest('m.actions', w.id)
              };
            })
          },
          {
            id: 'sec.ga.runs', kind: 'log', title: 'Recent runs',
            items: runs.map(function (r) {
              var mins = Math.round(r.durationS / 60);
              return {
                id: r.id,
                label: r.workflow + ' \u00b7 ' + (r.result === 'success' ? 'passed' : 'failed'),
                note: fmtWhen(r.when) + ' \u00b7 ' + (mins || 1) + ' min',
                dest: mdest('m.actions', r.id, 'log'),
                detail: {
                  jobs: (r.jobs || []).map(function (j) { return { name: j.name, status: j.status, durationS: j.durationS }; }),
                  log: r.logExcerpt || []
                }
              };
            })
          },
          {
            id: 'sec.ga.starter', kind: 'overview', title: 'Starting fresh',
            rows: [
              { id: 'r.ga.starter', label: 'No workflow on a branch?', value: (ga.starterOffer && ga.starterOffer.template) || 'starter', note: ga.starterOffer ? ga.starterOffer.note : null }
            ]
          }
        ]
      };
    },
    objects: function (store) {
      var ga = data(store).githubActions || {};
      var out = (ga.pinned || []).map(function (w) {
        return { id: w.id, label: w.name, kind: 'workflow', note: 'Pinned workflow on ' + w.branch, dest: mdest('m.actions', w.id) };
      });
      (ga.runs || []).forEach(function (r) {
        out.push({ id: r.id, label: r.workflow + ' run ' + r.id, kind: 'workflow-run', note: r.result === 'success' ? 'Passing run' : 'Failed run', dest: mdest('m.actions', r.id, 'log') });
      });
      return out;
    },
    actions: function () {
      return [
        {
          id: 'act.ga.refresh',
          label: 'Refresh readiness',
          ico: 'refresh',
          available: true,
          run: function () { return op('actions-refresh', 'wf.ci'); }
        },
        {
          id: 'act.ga.starter',
          label: 'Start from the node-ci starter',
          ico: 'plus',
          available: true,
          run: function () { return receipt('Starter workflow drafted', 'A node-ci workflow draft was staged for review. Nothing was committed or pushed.'); }
        }
      ];
    },
    states: ['fx.loading-cached']
  });

  /* ================================================================
     m.containers - Containers & Registries (resource roster)
     ================================================================ */
  DEFS.push({
    id: 'm.containers',
    family: 'Containers & Registries',
    cat: 'code',
    title: 'Containers & Registries',
    blurb: 'Docker, Podman, and Kubernetes tooling per host, plus clusters, registries, and publishing.',
    icon: 'container',
    archetype: 'roster-detail',
    status: 'demonstrated',
    settingPrefixes: ['code.execution.'],
    model: function (store) {
      var c = data(store).containers || {};
      return {
        managerId: 'm.containers',
        title: 'Containers & Registries',
        summary: (c.resources || []).length + ' container tools \u00b7 ' + (c.clusters || []).length + ' cluster \u00b7 ' + (c.registries || []).length + ' registries',
        sections: [
          {
            id: 'sec.ctr.resources', kind: 'roster', title: 'Container tools',
            items: (c.resources || []).map(function (r) {
              return {
                id: r.id,
                label: r.name,
                kind: 'container-resource',
                state: r.state === 'ready' ? 'normal' : r.state === 'partial' ? 'warning' : 'unavailable',
                note: r.summary + (r.installOffer ? ' \u00b7 ' + r.installOffer.label : ''),
                dest: mdest('m.containers', r.id),
                detail: {
                  fields: (function () {
                    var f = [];
                    if (r.detail && r.detail.engine) {
                      f.push({ label: 'Engine', value: r.detail.engine, advanced: true });
                      f.push({ label: 'CLI \u00b7 Compose \u00b7 Buildx', value: r.detail.cli + ' \u00b7 ' + r.detail.compose + ' \u00b7 ' + r.detail.buildx, advanced: true });
                      f.push({ label: 'Socket', value: r.detail.socket + ' (' + r.detail.socketState + ')', advanced: true });
                    }
                    if (r.detail && r.detail.kubectl) {
                      f.push({ label: 'kubectl', value: r.detail.kubectl.state === 'ready' ? r.detail.kubectl.version : 'Not installed' });
                      f.push({ label: 'Helm', value: r.detail.helm.state === 'ready' ? r.detail.helm.version : 'Not installed', note: r.detail.helm.installOffer ? r.detail.helm.installOffer.note : null });
                    }
                    if (r.installOffer) {
                      f.push({ label: 'Install', value: r.installOffer.label, note: r.installOffer.note });
                    }
                    f.push({ label: 'Host', value: hostName(store, r.hostId) });
                    return f;
                  })()
                }
              };
            })
          },
          {
            id: 'sec.ctr.clusters', kind: 'roster', title: 'Clusters',
            items: (c.clusters || []).map(function (k) {
              var current = null;
              (k.kubeconfigContexts || []).forEach(function (x) { if (x.current) { current = x.name; } });
              return {
                id: k.id,
                label: k.name,
                kind: 'cluster',
                state: k.state === 'reachable' ? 'normal' : 'unavailable',
                note: (k.state === 'reachable' ? 'Reachable' : k.state) + (current ? ' \u00b7 active context ' + current : ''),
                dest: mdest('m.containers', k.id),
                detail: { fields: [{ label: 'Kubeconfig contexts', value: (k.kubeconfigContexts || []).map(function (x) { return x.name + (x.current ? ' (active)' : ''); }).join(', '), advanced: true }] }
              };
            })
          },
          {
            id: 'sec.ctr.registries', kind: 'roster', title: 'Registries',
            items: (c.registries || []).map(function (r) {
              return {
                id: r.id,
                label: r.url,
                kind: 'registry',
                state: r.state === 'ready' ? 'normal' : 'warning',
                note: r.state === 'cert-warning' ? r.authNote : ('Ready \u00b7 ' + (r.auth || 'no sign-in needed')),
                dest: mdest('m.containers', r.id)
              };
            })
          },
          {
            id: 'sec.ctr.publishing', kind: 'overview', title: 'Publishing',
            rows: c.unraidPublishing ? [
              { id: 'r.ctr.unraid', label: c.unraidPublishing.server, value: c.unraidPublishing.state === 'connected' ? 'Connected' : c.unraidPublishing.state, note: c.unraidPublishing.note }
            ] : []
          }
        ]
      };
    },
    objects: function (store) {
      var c = data(store).containers || {};
      var out = (c.resources || []).map(function (r) {
        return { id: r.id, label: r.name, kind: 'container-resource', note: r.summary, dest: mdest('m.containers', r.id) };
      });
      (c.clusters || []).forEach(function (k) {
        out.push({ id: k.id, label: k.name, kind: 'cluster', note: 'Kubernetes cluster', dest: mdest('m.containers', k.id) });
      });
      (c.registries || []).forEach(function (r) {
        out.push({ id: r.id, label: r.url, kind: 'registry', note: 'Container registry', dest: mdest('m.containers', r.id) });
      });
      return out;
    },
    actions: function () {
      return [
        {
          id: 'act.ctr.install-podman',
          label: 'Install Podman on this computer',
          ico: 'download',
          available: true,
          run: function () { return op('tool-install', 'ctr.podman@host.win-desktop'); }
        },
        {
          id: 'act.ctr.install-helm',
          label: 'Install Helm on Home TrueNAS',
          ico: 'download',
          available: true,
          run: function () { return op('tool-install', 'helm@host.home-truenas'); }
        }
      ];
    },
    states: ['fx.loading-cached']
  });

  /* ================================================================
     m.web - Web / Search / Fetch / Crawl (provider roster + limits)
     ================================================================ */
  DEFS.push({
    id: 'm.web',
    family: 'Web / Search / Fetch / Crawl',
    cat: 'web',
    title: 'Web & Research',
    blurb: 'Search and crawl providers in priority order, credit guards, size limits, and browser programs.',
    icon: 'globe',
    archetype: 'roster-detail',
    status: 'demonstrated',
    settingPrefixes: ['web.providers.', 'web.fetch.'],
    model: function (store) {
      var w = data(store).webResearch || {};
      var providers = w.providers || [];
      var limits = w.limits || {};
      var caches = w.caches || {};
      var bs = w.browserSessions || {};
      var warn = providers.filter(function (p) { return p.guard && p.guard.state === 'warning'; }).length;
      return {
        managerId: 'm.web',
        title: 'Web & Research',
        summary: providers.length + ' providers' + (warn ? ' \u00b7 ' + warn + ' credit guard warning' : ' \u00b7 all guards healthy'),
        sections: [
          {
            id: 'sec.web.providers', kind: 'roster', title: 'Providers, in the order they are tried',
            items: providers.map(function (p) {
              var kindWord = p.kind === 'search' ? 'Search' : p.kind === 'crawl-extract' ? 'Crawl & extract' : p.kind === 'fetch' ? 'Fetch' : p.kind;
              var creditNote = p.credits ? p.credits.used + ' of ' + p.credits.total + ' ' + p.credits.unit + ' used' : null;
              return {
                id: p.id,
                label: p.name,
                kind: 'web-provider',
                state: p.state === 'ready' ? (p.guard && p.guard.state === 'warning' ? 'warning' : 'normal') : 'unavailable',
                note: kindWord + ' \u00b7 priority ' + p.priority + ' \u00b7 '
                  + (p.state === 'ready' ? 'ready' : 'needs setup')
                  + (creditNote ? ' \u00b7 ' + creditNote : '')
                  + (p.builtIn ? ' \u00b7 built in, no account' : ''),
                chips: p.guard && p.guard.state === 'warning' ? [{ kind: 'warning', label: 'Credit guard' }] : [],
                dest: mdest('m.web', p.id),
                detail: {
                  fields: (function () {
                    var f = [];
                    if (p.guard) { f.push({ label: 'Credit guard', value: 'Warn at ' + p.guard.warnAtPct + '% \u00b7 stop at ' + p.guard.stopAtPct + '%', note: p.guard.note || null }); }
                    if (p.setupNote) { f.push({ label: 'Setup', value: p.setupNote }); }
                    return f;
                  })()
                }
              };
            })
          },
          {
            id: 'sec.web.limits', kind: 'form', title: 'Limits',
            fields: [
              { id: 'f.web.fetch', label: 'Largest fetch', value: (limits.fetchMaxMB || 25) + ' MB' },
              { id: 'f.web.depth', label: 'Crawl depth', value: String(limits.crawlDepth || 3) },
              { id: 'f.web.map', label: 'Map, at most', value: (limits.mapMaxPages || 200) + ' pages' },
              { id: 'f.web.extract', label: 'Extract, at most', value: (limits.extractMaxPages || 40) + ' pages' }
            ]
          },
          {
            id: 'sec.web.caches', kind: 'form', title: 'Caches',
            fields: [
              { id: 'f.web.cache-size', label: 'Research cache', value: (caches.sizeMB || 0) + ' MB' },
              { id: 'f.web.cache-ttl', label: 'Results stay fresh for', value: (caches.ttlHours || 72) + ' hours' },
              { id: 'f.web.cache-cleared', label: 'Last cleared', value: fmtWhen(caches.lastCleared) }
            ]
          },
          {
            id: 'sec.web.browsers', kind: 'overview', title: 'Browser programs',
            rows: [
              { id: 'r.web.program', label: 'Everyday browsing', value: bs.program || 'PM Browser Program', note: 'Agents browse through the PM Browser Program with the usual permission rules.' },
              { id: 'r.web.expert', label: 'Advanced browsing', value: bs.expert || 'Expert Browser Program', note: 'The Expert Browser Program adds deeper inspection for debugging tasks that need it.' },
              { id: 'r.web.auth', label: 'Protected sign-in session', value: 'Human-only', note: (bs.authSession && bs.authSession.note) || 'A protected sign-in session is human-only. Agents can never inspect its pages, screenshots, console, or network.' }
            ]
          },
          {
            id: 'sec.web.network', kind: 'form', title: 'Network',
            fields: [
              { id: 'f.web.proxy', label: 'Proxy', value: w.proxy === 'system' ? 'Use the system proxy' : String(w.proxy) },
              { id: 'f.web.certs', label: 'Trusted certificates', value: (w.certificates || []).map(function (cert) { return cert.name; }).join(', ') || 'None added' },
              { id: 'f.web.airgap', label: 'Air-gapped mode', value: w.airgap === 'off' ? 'Off' : String(w.airgap) }
            ]
          }
        ]
      };
    },
    objects: function (store) {
      return ((data(store).webResearch || {}).providers || []).map(function (p) {
        return { id: p.id, label: p.name, kind: 'web-provider', note: p.kind + ' provider', dest: mdest('m.web', p.id) };
      });
    },
    actions: function (store) {
      var w = data(store).webResearch || {};
      var kagi = byId(w.providers || [], 'web.kagi');
      return [
        {
          id: 'act.web.clear-cache',
          label: 'Clear the research cache',
          ico: 'broom',
          available: true,
          run: function () { return op('web-cache-clear', 'caches'); }
        },
        {
          id: 'act.web.test-kagi',
          label: 'Test the Kagi route',
          ico: 'beaker',
          available: false,
          reason: (kagi && kagi.setupNote) || 'Kagi is not set up yet.',
          run: function () { return receipt('Route test skipped', 'Kagi has no API key reference yet, so there is nothing to test.'); }
        }
      ];
    },
    states: ['fx.credit-guard', 'fx.loading-cached']
  });

  /* ================================================================
     m.searchIndex - Project Search Index (health projection)
     ================================================================ */
  DEFS.push({
    id: 'm.searchIndex',
    family: 'Project Search Index',
    cat: 'web',
    title: 'Project Search Index',
    blurb: 'The index behind project-wide search: freshness, disk use, exclusions, and anything skipped.',
    icon: 'search',
    archetype: 'health',
    status: 'demonstrated',
    settingPrefixes: ['web.index.'],
    model: function (store) {
      var si = data(store).searchIndex || {};
      return {
        managerId: 'm.searchIndex',
        title: 'Project Search Index',
        summary: (si.enabled ? 'On' : 'Off') + ' \u00b7 ' + (si.files || 0) + ' files indexed \u00b7 last built ' + fmtWhen(si.lastBuild),
        sections: [
          {
            id: 'sec.si.health', kind: 'health', title: 'Index',
            items: [
              { id: 'h.si.phase', label: 'State', state: si.phase === 'ready' ? 'normal' : 'warning', note: si.phase === 'ready' ? 'Ready \u00b7 rebuilt ' + fmtWhen(si.lastBuild) : String(si.phase) },
              { id: 'h.si.disk', label: 'Disk used', state: 'normal', note: (si.diskMB || 0) + ' MB for ' + (si.files || 0) + ' files' },
              { id: 'h.si.remote', label: 'Remote cache', state: si.remoteCache && si.remoteCache.state === 'ready' ? 'normal' : 'warning', note: si.remoteCache ? (si.remoteCache.state === 'ready' ? 'Ready on ' + hostName(store, si.remoteCache.hostId) : si.remoteCache.state) : 'Off' }
            ]
          },
          {
            id: 'sec.si.rules', kind: 'form', title: 'What gets indexed',
            fields: [
              { id: 'f.si.exclusions', label: 'Left out', value: (si.exclusions || []).join(', ') || 'Nothing' },
              { id: 'f.si.large', label: 'Large files', value: 'Skipped over ' + ((si.largeFilePolicy && si.largeFilePolicy.maxMB) || 8) + ' MB' },
              { id: 'f.si.symlinks', label: 'Symlinks', value: si.symlinkPolicy === 'skip' ? 'Not followed' : String(si.symlinkPolicy) }
            ]
          },
          {
            id: 'sec.si.failures', kind: 'log', title: 'Skipped files',
            log: (si.failures || []).map(function (f) { return f.path + ' \u2014 ' + f.reason; }),
            emptyNote: 'Nothing was skipped in the last build.'
          }
        ]
      };
    },
    objects: function (store) {
      var si = data(store).searchIndex || {};
      return (si.failures || []).map(function (f, i) {
        return { id: 'fail.' + i, label: f.path, kind: 'index-failure', note: f.reason, dest: mdest('m.searchIndex', 'fail.' + i) };
      });
    },
    actions: function () {
      return [
        {
          id: 'act.si.rebuild',
          label: 'Rebuild the index',
          ico: 'refresh',
          available: true,
          run: function () { return op('index-rebuild', 'project'); }
        },
        {
          id: 'act.si.evict',
          label: 'Evict the remote cache',
          ico: 'trash',
          available: true,
          run: function () { return op('cache-evict', 'remote-index'); }
        }
      ];
    },
    states: ['fx.index-failed', 'fx.loading-cached']
  });

  /* ================================================================
     m.cleanup - Workspace Cleanup (dry-run transaction)
     ================================================================ */
  DEFS.push({
    id: 'm.cleanup',
    family: 'Workspace Cleanup',
    cat: 'system',
    title: 'Workspace Cleanup',
    blurb: 'Reclaim disk space safely: always a dry run first, and leased work is never touched.',
    icon: 'broom',
    archetype: 'transaction',
    status: 'demonstrated',
    settingPrefixes: ['branching.worktrees.'],
    model: function (store) {
      var cl = data(store).cleanup || {};
      var cats = cl.categories || [];
      var dry = (cl.dryRun && cl.dryRun.last) || null;
      var totalMB = 0;
      cats.forEach(function (c) { totalMB += c.sizeMB || 0; });
      return {
        managerId: 'm.cleanup',
        title: 'Workspace Cleanup',
        summary: Math.round(totalMB / 100) / 10 + ' GB reclaimable across ' + cats.length + ' categories \u00b7 nothing is deleted without a dry run and your go-ahead',
        sections: [
          {
            id: 'sec.cl.categories', kind: 'table', title: 'What could go',
            columns: ['Category', 'Items', 'Size'],
            items: cats.map(function (c) {
              return {
                id: c.id,
                label: c.label,
                kind: 'cleanup-category',
                cells: [c.label, String(c.count), c.sizeMB >= 1024 ? (c.sizeMB / 1024).toFixed(1) + ' GB' : c.sizeMB + ' MB'],
                note: c.safety || null,
                dest: mdest('m.cleanup', c.id)
              };
            })
          },
          {
            id: 'sec.cl.steps', kind: 'steps', title: 'How cleanup runs',
            steps: [
              { id: 'st.cl.1', title: 'Dry run', note: 'Reports exactly what would be removed and what gets skipped. Nothing is deleted.' },
              { id: 'st.cl.2', title: 'Review', note: 'Leased worktrees and anything under a legal hold are always skipped, with the reason shown.' },
              { id: 'st.cl.3', title: 'Apply', note: 'Only ever follows a current dry run, and produces a receipt.' }
            ]
          },
          {
            id: 'sec.cl.last', kind: 'preview', title: 'Last dry run',
            state: dry ? 'complete' : 'never-run',
            summary: dry ? fmtWhen(dry.when) + ' \u00b7 would free ' + Math.round(dry.wouldFreeMB / 100) / 10 + ' GB \u00b7 receipt ' + dry.receiptId : null,
            skipped: dry ? (dry.skipped || []).map(function (s) {
              return { ref: s.ref, reason: s.reason, dest: mdest('m.sourceControl', s.ref) };
            }) : [],
            note: (cl.dryRun && cl.dryRun.note) || 'A dry run only reports. Nothing is deleted until you apply, and leased items are always skipped.'
          }
        ]
      };
    },
    objects: function (store) {
      return ((data(store).cleanup || {}).categories || []).map(function (c) {
        return { id: c.id, label: c.label, kind: 'cleanup-category', note: c.count + ' items, ' + c.sizeMB + ' MB', dest: mdest('m.cleanup', c.id) };
      });
    },
    actions: function () {
      return [
        {
          id: 'act.cl.dry-run',
          label: 'Dry run cleanup now',
          ico: 'eye',
          available: true,
          run: function () { return op('cleanup-dry-run', 'workspace'); }
        },
        {
          id: 'act.cl.apply',
          label: 'Apply cleanup',
          ico: 'broom',
          available: false,
          reason: 'Run a fresh dry run first. Apply always follows a current preview, never a day-old one.',
          run: function () { return op('cleanup-apply', 'workspace'); }
        }
      ];
    },
    states: ['fx.loading-cached']
  });

  /* ================================================================
     m.media - Media & Output (purpose roster)
     ================================================================ */
  DEFS.push({
    id: 'm.media',
    family: 'Media & Output',
    cat: 'media',
    title: 'Media & Output',
    blurb: 'Who handles images, vision, voice, and video, where outputs land, and what each route costs.',
    icon: 'film',
    archetype: 'roster-detail',
    status: 'demonstrated',
    settingPrefixes: ['media.'],
    model: function (store) {
      var media = data(store).media || [];
      var providers = data(store).providers || [];
      function provName(ref) {
        var p = byId(providers, ref);
        return p ? p.name : null;
      }
      var PURPOSES = { 'image-gen': 'Image generation', 'vision': 'Reading images', 'audio-in': 'Voice input', 'video': 'Video generation' };
      return {
        managerId: 'm.media',
        title: 'Media & Output',
        summary: media.length + ' media purposes \u00b7 one honest route each, never a silent substitute',
        sections: [
          {
            id: 'sec.media.purposes', kind: 'roster', title: 'Purposes',
            items: media.map(function (m) {
              var pname = provName(m.providerRef);
              var lastFail = (m.history || []).some(function (h) { return h.ok === false; });
              return {
                id: m.id,
                label: PURPOSES[m.purpose] || m.purpose,
                kind: 'media-purpose',
                state: m.providerRef ? 'normal' : 'unavailable',
                note: m.providerRef
                  ? 'Handled by ' + pname + (m.native ? '' : ' via a local transform') + ' \u00b7 ' + m.costRoute
                  : 'No provider offers this yet \u00b7 requests return an honest failure',
                dest: mdest('m.media', m.id),
                detail: {
                  fields: (function () {
                    var f = [
                      { label: 'Output goes to', value: (m.output && m.output.location) || 'inline', note: m.output ? 'Format: ' + m.output.format : null },
                      { label: 'Safety', value: m.safety },
                      { label: 'Cost route', value: m.costRoute }
                    ];
                    if (m.transformNote) { f.push({ label: 'Local transform', value: m.transformNote }); }
                    if (m.fallbackRef) { f.push({ label: 'Falls back to', value: provName(m.fallbackRef) || m.fallbackRef }); }
                    return f;
                  })(),
                  log: (m.history || []).map(function (h) { return fmtWhen(h.at) + '  ' + h.what + (h.ok ? '' : ' \u2014 failed honestly'); }),
                  attention: lastFail && !m.providerRef ? 'The last request could not be served; no connected provider offers this purpose.' : null
                }
              };
            })
          }
        ]
      };
    },
    objects: function (store) {
      var PURPOSES = { 'image-gen': 'Image generation', 'vision': 'Reading images', 'audio-in': 'Voice input', 'video': 'Video generation' };
      return (data(store).media || []).map(function (m) {
        return { id: m.id, label: PURPOSES[m.purpose] || m.purpose, kind: 'media-purpose', note: 'Media route', dest: mdest('m.media', m.id) };
      });
    },
    actions: function () { return []; },
    states: ['fx.loading-cached']
  });

  /* ================================================================
     m.dry - DRY Method visible state (read-only health projection)
     ================================================================ */
  DEFS.push({
    id: 'm.dry',
    family: 'DRY Method visible state where exposed',
    cat: 'planning',
    title: 'Single Owners',
    blurb: 'Where the one true owner of each shared behavior shows its state. Read-only, by design.',
    icon: 'scales',
    archetype: 'health',
    status: 'demonstrated',
    settingPrefixes: ['planning.verification.'],
    model: function (store) {
      var d = data(store);
      var gd = d.goalDefaults || {};
      var pm = d.permissionsModel || {};
      var dl = pm.doomLoop || {};
      var fs = pm.fileSafe || {};
      var nf = d.notifications || {};
      return {
        managerId: 'm.dry',
        title: 'Single Owners',
        summary: 'Each shared behavior has exactly one owner. This page shows where that owner\u2019s state is visible; it never owns anything itself.',
        readOnly: true,
        sections: [
          {
            id: 'sec.dry.owners', kind: 'health', title: 'Shared owners and their visible state',
            items: [
              {
                id: 'own.governor',
                label: 'ResourceGovernor',
                state: 'normal',
                note: 'The single capacity and admission owner. Visible here as Goal defaults (' + (gd.fanOut ? gd.fanOut.sustainable + ' workers sustained, ceiling ' + gd.fanOut.ceiling : 'fan-out limits') + ', ' + (gd.capacityReserve || '20%') + ' reserve) and as the web credit guards.',
                evidence: gd.boundaryNote || 'Settings owns defaults and ceilings. Usage reports current capacity; the Orchestrator admits actual work.',
                dest: mdest('m.goal')
              },
              {
                id: 'own.observable',
                label: 'ObservableWork',
                state: 'normal',
                note: 'The single progress owner. Every backup, cleanup, rebuild, and import here reports truthful staged phases, and a percent appears only when a real denominator exists.',
                evidence: 'Receipts across Storage, Backup, Cleanup, and Settings Lifecycle all come from the same operation trail; no manager invents its own progress.',
                dest: mdest('m.doctor')
              },
              {
                id: 'own.doomloop',
                label: 'Doom-loop protection',
                state: dl.lastTrip ? 'warning' : 'normal',
                note: 'One loop breaker for every run: ' + (dl.threshold || 3) + ' denied retries of the same operation ' + (dl.action === 'pause-and-ask' ? 'pause the run and ask you' : dl.action) + '. ' + (dl.lastTrip ? 'Last tripped ' + fmtWhen(dl.lastTrip) + '.' : 'It has not tripped.'),
                evidence: dl.note || null,
                dest: mdest('m.permissions')
              },
              {
                id: 'own.filesafe',
                label: 'FileSafe floor',
                state: fs.state === 'healthy' ? 'normal' : 'error',
                note: 'One non-bypassable floor under every permission rule. Currently ' + (fs.state || 'healthy') + '.',
                evidence: fs.floorNote || 'No profile, Persona, or rule can widen it.',
                dest: mdest('m.permissions')
              },
              {
                id: 'own.notify',
                label: 'One notification surface',
                state: 'normal',
                note: 'The title-bar stack is the only in-app notification surface, and sound is never the only signal.',
                evidence: (nf.surfaceRule && nf.surfaceRule.note) || 'No corner toasts, no status-bar bell, no side panel.',
                dest: mdest('m.notifications')
              },
              {
                id: 'own.toolstore',
                label: 'One installation lifecycle',
                state: 'normal',
                note: 'Provider CLIs, source-control tools, and container tools all move through the same install-verify-activate-rollback lifecycle.',
                evidence: 'Tool Store generations appear identically under Providers, Source Control, and Containers; none of them re-implements installing.',
                dest: mdest('m.sourceControl')
              }
            ]
          },
          {
            id: 'sec.dry.note', kind: 'overview', title: 'Why read-only',
            rows: [
              { id: 'r.dry.readonly', label: 'Editing', value: 'Happens at the owner', note: 'Changing any of this state means visiting the owning manager. Duplicating a control here would create a second owner, which is exactly what this page exists to prevent.' }
            ]
          }
        ]
      };
    },
    objects: function (store) {
      return [
        { id: 'own.governor', label: 'ResourceGovernor', kind: 'shared-owner', note: 'Capacity and admission owner', dest: mdest('m.dry', 'own.governor') },
        { id: 'own.observable', label: 'ObservableWork', kind: 'shared-owner', note: 'Truthful progress owner', dest: mdest('m.dry', 'own.observable') },
        { id: 'own.doomloop', label: 'Doom-loop protection', kind: 'shared-owner', note: 'Single loop breaker', dest: mdest('m.dry', 'own.doomloop') },
        { id: 'own.filesafe', label: 'FileSafe floor', kind: 'shared-owner', note: 'Non-bypassable file boundary', dest: mdest('m.dry', 'own.filesafe') }
      ];
    },
    actions: function () { return []; },
    states: ['fx.doom-loop-tripped']
  });

  /* ================================================================
     Deferred owner shells (status: deferred_named_owner).
     Each is a reachable destination with a named canonical owner and a
     return/deep-link contract. They describe honestly what will live
     there; none of them invents a backend state machine or an action.
     ================================================================ */

  function shell(cfg) {
    DEFS.push({
      id: cfg.id,
      family: cfg.family,
      cat: 'system',
      title: cfg.title,
      blurb: cfg.blurb,
      icon: cfg.icon,
      archetype: cfg.archetype,
      status: 'deferred_named_owner',
      owner: cfg.owner,
      insertionContract: {
        destination: mdest(cfg.id),
        reachableFrom: ['System \u00b7 Servers & remote', 'universal search'],
        deepLink: 'manager/' + cfg.id,
        returnContract: 'This destination stays inside the Settings shell with breadcrumb, Back, and Close. When the owner module lands, deep links of the form manager/' + cfg.id + '/<objectId> resolve here, and Back returns to whatever surface opened it \u2014 including a search query and its results.'
      },
      settingPrefixes: cfg.settingPrefixes || [],
      model: cfg.model,
      objects: cfg.objects || function () { return []; },
      actions: function () { return []; },
      states: []
    });
  }

  /* m.onboarding - Product Onboarding */
  shell({
    id: 'm.onboarding',
    family: 'Product Onboarding',
    title: 'Onboarding',
    blurb: 'The guided first-run experience. Reserved for its owner module; nothing to configure here yet.',
    icon: 'sparkle',
    archetype: 'setup-sequence',
    owner: 'Product Onboarding owner thread (first-run flow owner; separate from Installation/Deployment and Server Claim/Bootstrap)',
    settingPrefixes: ['general.startup.'],
    model: function () {
      return {
        managerId: 'm.onboarding',
        title: 'Onboarding',
        readOnly: true,
        summary: 'Reserved destination. The first-run flow is owned by the Product Onboarding module and is not part of this bakeoff.',
        sections: [{
          id: 'sec.onb.about', kind: 'overview', title: 'What will live here',
          rows: [
            { id: 'r.onb.what', label: 'Coming here', value: 'First-run setup and re-runnable tours', note: 'The guided flow that greets a new install. It may launch Installation/Deployment or Server Claim and resume with return context, but it owns neither of them.' },
            { id: 'r.onb.now', label: 'Right now', value: 'Read-only', note: 'This app finished onboarding. Nothing here is editable until the owner module inserts.' }
          ]
        }]
      };
    }
  });

  /* m.deployment - Installation / Deployment */
  shell({
    id: 'm.deployment',
    family: 'Installation / Deployment',
    title: 'Installation & Deployment',
    blurb: 'How Puppet Master itself is installed and deployed. Reserved for its owner module.',
    icon: 'package',
    archetype: 'setup-sequence',
    owner: 'Release_Supply_Chain.md (installer and deployment supply chain)',
    model: function () {
      return {
        managerId: 'm.deployment',
        title: 'Installation & Deployment',
        readOnly: true,
        summary: 'Reserved destination. Installing and deploying the app is owned by the release supply chain module.',
        sections: [{
          id: 'sec.dep.about', kind: 'overview', title: 'What will live here',
          rows: [
            { id: 'r.dep.what', label: 'Coming here', value: 'Install methods and deployment records', note: 'Where this installation came from, how it is verified, and how new machines are set up.' },
            { id: 'r.dep.now', label: 'Right now', value: 'Read-only', note: 'This installation is healthy; its record becomes visible when the owner module inserts.' }
          ]
        }]
      };
    }
  });

  /* m.serverClaim - Server Claim / Bootstrap */
  shell({
    id: 'm.serverClaim',
    family: 'Server Claim / Bootstrap',
    title: 'Server Claim',
    blurb: 'Claiming and bootstrapping a new server. Reserved for the Server Backbone owner.',
    icon: 'key',
    archetype: 'setup-sequence',
    owner: 'Server Backbone return (Post-Return Reconciliation v6)',
    model: function () {
      return {
        managerId: 'm.serverClaim',
        title: 'Server Claim',
        readOnly: true,
        summary: 'Reserved destination. Claiming a fresh server and proving you own it is a Server Backbone flow.',
        sections: [{
          id: 'sec.claim.about', kind: 'overview', title: 'What will live here',
          rows: [
            { id: 'r.claim.what', label: 'Coming here', value: 'Claim and bootstrap steps', note: 'Pairing a new server, proving ownership, and bootstrapping it into the topology, with receipts.' },
            { id: 'r.claim.now', label: 'Right now', value: 'Read-only', note: 'Home TrueNAS is already claimed; the claim flow itself lives with its owner module.' }
          ]
        }]
      };
    }
  });

  /* m.servers - Servers / Execution Hosts / Clients */
  shell({
    id: 'm.servers',
    family: 'Servers / Execution Hosts / Clients',
    title: 'Servers & Hosts',
    blurb: 'The Home Server, execution hosts and environments, and paired clients. Owner module reserved.',
    icon: 'server',
    archetype: 'roster-detail',
    owner: 'Server Backbone return (Post-Return Reconciliation v6, sections 4-5)',
    model: function (store) {
      var topo = data(store).serverTopology || {};
      var card = ((data(store).serverModules || {}).connectedServerCard) || {};
      return {
        managerId: 'm.servers',
        title: 'Servers & Hosts',
        readOnly: true,
        summary: 'Reserved destination with an honest status card. Managing servers, hosts, and clients inserts here later.',
        sections: [
          {
            id: 'sec.srv.card', kind: 'overview', title: 'Connected server',
            rows: [
              { id: 'r.srv.name', label: card.name || 'Home TrueNAS', value: card.state === 'connected' ? 'Connected' : (card.state || 'Unknown'), note: 'Processing on this server: ' + (card.processing === 'on' ? 'On' : 'Off') + ' \u00b7 ' + (card.clients || 0) + ' clients paired' }
            ]
          },
          {
            id: 'sec.srv.hosts', kind: 'roster', title: 'Execution hosts (read-only)',
            note: 'WSL Off is healthy; optional environments show setup only when a selected capability needs them.',
            items: (topo.hosts || []).map(function (h) {
              var envs = (h.environments || []).map(function (e) {
                return e.label + ': ' + (e.state === 'ready' ? 'ready' : e.state === 'off' ? 'off' : e.state === 'not-set-up' ? 'not set up' : e.state);
              });
              return {
                id: h.id,
                label: h.name,
                kind: 'host',
                state: h.state === 'connected' || h.state === 'reachable' ? 'normal' : 'unavailable',
                note: (h.isDefaultExecutionHost ? 'Default execution host \u00b7 ' : '') + envs.join(' \u00b7 '),
                dest: mdest('m.servers', h.id)
              };
            })
          },
          {
            id: 'sec.srv.clients', kind: 'roster', title: 'Clients (read-only)',
            items: (topo.clients || []).map(function (c) {
              return { id: c.id, label: c.name, kind: 'client', note: c.platform + ' \u00b7 last seen ' + fmtWhen(c.lastSeen), dest: mdest('m.servers', c.id) };
            })
          },
          {
            id: 'sec.srv.note', kind: 'overview', title: 'What will live here',
            rows: [
              { id: 'r.srv.owner', label: 'Coming here', value: 'Health, pairing, claim links, receipts', note: 'Host cards with nested environment rows, paired-client pairing and revoke, and claim/bootstrap deep links \u2014 all from the Server Backbone owner. Nothing here is editable yet.' }
            ]
          }
        ]
      };
    },
    objects: function (store) {
      var topo = data(store).serverTopology || {};
      var out = (topo.hosts || []).map(function (h) {
        return { id: h.id, label: h.name, kind: 'host', note: 'Execution host (read-only shell)', dest: mdest('m.servers', h.id) };
      });
      (topo.clients || []).forEach(function (c) {
        out.push({ id: c.id, label: c.name, kind: 'client', note: 'Paired client (read-only shell)', dest: mdest('m.servers', c.id) });
      });
      return out;
    }
  });

  /* m.hosting - Project Hosting & Files */
  shell({
    id: 'm.hosting',
    family: 'Project Hosting & Files',
    title: 'Project Hosting & Files',
    blurb: 'Where this project physically lives. Reserved for the storage-plan owner.',
    icon: 'cloud',
    archetype: 'preference-doc',
    owner: 'storage-plan.md',
    model: function (store) {
      var proj = ((data(store).serverTopology || {}).project) || {};
      return {
        managerId: 'm.hosting',
        title: 'Project Hosting & Files',
        readOnly: true,
        summary: 'Reserved destination with the honest hosted-on card. Moving or re-homing the project inserts here later.',
        sections: [
          {
            id: 'sec.host.card', kind: 'overview', title: 'This project',
            rows: [
              { id: 'r.host.on', label: 'Hosted on', value: proj.hostedOn || 'Home TrueNAS' },
              { id: 'r.host.files', label: 'Project files', value: proj.files || '/mnt/projects/Puppet-Master' },
              { id: 'r.host.run', label: 'Run work', value: proj.runWork || 'Automatic \u00b7 Home TrueNAS' }
            ]
          },
          {
            id: 'sec.host.note', kind: 'overview', title: 'What will live here',
            rows: [
              { id: 'r.host.owner', label: 'Coming here', value: 'Project Vault location and move/sync links', note: 'The storage-plan owner adds vault placement and hands moves to the Project Sync owner. Read-only until then.', dest: mdest('m.projectSync') }
            ]
          }
        ]
      };
    }
  });

  /* m.remote - Remote Access */
  shell({
    id: 'm.remote',
    family: 'Remote Access',
    title: 'Remote Access',
    blurb: 'Reaching your server from elsewhere. Reserved for the Server Backbone owner.',
    icon: 'link',
    archetype: 'roster-detail',
    owner: 'Server Backbone return, section 10',
    model: function () {
      return {
        managerId: 'm.remote',
        title: 'Remote Access',
        readOnly: true,
        summary: 'Reserved destination. Access methods and per-client policy insert here from the Server Backbone owner.',
        sections: [{
          id: 'sec.rem.about', kind: 'overview', title: 'What will live here',
          rows: [
            { id: 'r.rem.what', label: 'Coming here', value: 'Access methods and per-client policy', note: 'How each client reaches the Home Server, with a status-bar projection of the current path. Nothing is configurable here yet.' },
            { id: 'r.rem.now', label: 'Right now', value: 'Read-only', note: 'Clients connect over the local network; remote methods arrive with the owner module.' }
          ]
        }]
      };
    }
  });

  /* m.projectSync - Project Sync / Move */
  shell({
    id: 'm.projectSync',
    family: 'Project Sync / Move',
    title: 'Project Sync & Move',
    blurb: 'Moving a project between servers. Reserved for the storage-plan Project Sync owner.',
    icon: 'route',
    archetype: 'transaction',
    owner: 'storage-plan.md (Project Sync owner)',
    model: function () {
      return {
        managerId: 'm.projectSync',
        title: 'Project Sync & Move',
        readOnly: true,
        summary: 'Reserved destination. Moving or syncing this project is a deliberate, receipted flow owned elsewhere.',
        sections: [{
          id: 'sec.sync.about', kind: 'overview', title: 'What will live here',
          rows: [
            { id: 'r.sync.what', label: 'Coming here', value: 'A staged move flow with verification', note: 'Moving the project to another server, with preview, integrity checks, and rollback \u2014 the same staged shape imports use.' },
            { id: 'r.sync.not', label: 'What this is not', value: 'Not a live sync', note: 'Projects have one home. This flow moves that home; it never creates two writable copies.' }
          ]
        }]
      };
    }
  });

  /* m.appUpdates - Puppet Master application/content updates */
  shell({
    id: 'm.appUpdates',
    family: 'Puppet Master application/content updates',
    title: 'App Updates',
    blurb: 'Updates to Puppet Master itself and its content. Reserved for the release supply chain owner.',
    icon: 'download',
    archetype: 'health',
    owner: 'Release_Supply_Chain.md',
    model: function () {
      return {
        managerId: 'm.appUpdates',
        title: 'App Updates',
        readOnly: true,
        summary: 'Reserved destination. The application and content update state machines are deferred; the destination and receipts are reserved here.',
        sections: [{
          id: 'sec.upd.about', kind: 'overview', title: 'What will live here',
          rows: [
            { id: 'r.upd.what', label: 'Coming here', value: 'App and content update channels', note: 'Checking, staging, verifying, and rolling back updates to Puppet Master itself \u2014 the same verify-then-activate discipline provider CLI updates already show.' },
            { id: 'r.upd.now', label: 'Right now', value: 'Read-only', note: 'No update state is simulated here; inventing one would be a fake backend.' }
          ]
        }]
      };
    }
  });

  /* m.serverBackup - Full Server backup owner flow */
  shell({
    id: 'm.serverBackup',
    family: 'Full Server backup owner flow',
    title: 'Full Server Backup',
    blurb: 'Backing up the whole Home Server. Reserved for the storage-plan owner; the server takes these itself.',
    icon: 'lock',
    archetype: 'transaction',
    owner: 'storage-plan.md',
    model: function (store) {
      var points = ((data(store).backups || {}).restorePoints || []).filter(function (p) { return p.kind === 'bk.server'; });
      return {
        managerId: 'm.serverBackup',
        title: 'Full Server Backup',
        readOnly: true,
        summary: 'Reserved destination. Settings and project backups are live in this bakeoff; the full-Server owner flow inserts here.',
        sections: [
          {
            id: 'sec.sbk.points', kind: 'roster', title: 'Known full-Server backups (read-only)',
            items: points.map(function (p) {
              return {
                id: p.id,
                label: p.label,
                kind: 'restore-point',
                state: p.verified ? 'normal' : 'warning',
                note: fmtWhen(p.when) + ' \u00b7 ' + (p.verified ? 'verified' : 'verification ' + (p.verification || 'pending')) + ' \u00b7 taken by the server to ' + (p.target || 'its backup target'),
                dest: mdest('m.serverBackup', p.id)
              };
            }),
            emptyNote: 'No full-Server backups are recorded.'
          },
          {
            id: 'sec.sbk.note', kind: 'overview', title: 'What will live here',
            rows: [
              { id: 'r.sbk.owner', label: 'Coming here', value: 'The full owner flow', note: 'Scheduling, encryption, verification, and restore for whole-server backups. Until then this page only reports what the server says; the smaller backup kinds live in Backup & Restore.', dest: mdest('m.backup') }
            ]
          }
        ]
      };
    },
    objects: function (store) {
      return (((data(store).backups || {}).restorePoints || []).filter(function (p) { return p.kind === 'bk.server'; })).map(function (p) {
        return { id: p.id, label: p.label, kind: 'restore-point', note: 'Full-Server backup (read-only shell)', dest: mdest('m.serverBackup', p.id) };
      });
    }
  });

  /* ==== registration ==== */
  if (window.PM2 && window.PM2.managers && typeof window.PM2.managers.register === 'function') {
    window.PM2.managers.register(DEFS);
  } else {
    window.PM2 = window.PM2 || {};
    window.PM2._pendingManagerDefs = (window.PM2._pendingManagerDefs || []).concat(DEFS);
  }
})();
