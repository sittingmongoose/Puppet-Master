/* Settings that apply everywhere (Opus 5.5): the core and the demo world, window.PSX.

   Runs inside PMConcept7, added at runtime by index.html (PMConcept7 itself is not edited). Every surface this layer
   draws (the end of each row, the panel's Where it applies, the managers' lines, the copy sheet, the moments, the board)
   reads one demo world through one resolver (resolve.js), so they always agree.

   EVERY VALUE IN THIS FILE IS DEMO ONLY ([Demo only], SETTINGS-PROPOSAL section 0): the computers, devices, projects,
   setting values, history and things below are examples of the rules, never Plans content and never canon.

   What it uses from PMConcept7:
     PM51.mark(key, tone), PM51.icon(name), PM51.setting(id), PM51.valueText(setting, v), PM51.rowLabel(setting)
     PMR.menu.open(menu, anchor, opts), PMR.menu.at(menu, x, y, opts), PMR.hover(el, label, detail)
     PM7_SETTINGS_TOME.portal()   #pm-settings-portals, where every sheet and note goes (Esc and focus stay Settings')
   Owner routing: every action names the Plans command it stands for (cmd.*) and changes the world only after its
   simulated result (PSX.run), never optimistically. */
(function (W) {
  'use strict';
  const D = W.document, H = D.documentElement;
  if (W.PSX) return;
  const PSX = W.PSX = { version: 1 };

  /* ------------------------------------------------------------------ small helpers */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (n) => (W.PM51 && W.PM51.icon ? W.PM51.icon(n) : '');
  /* the shared status mark plus its word: never colour alone, never a pill */
  const mark = (key) => (W.PM51 && W.PM51.mark ? W.PM51.mark(key, '') : '');
  const st = (key, word, cls) => `<span class="psx-st${cls ? ' ' + cls : ''}" data-st="${esc(key)}">${mark(key)}<span>${esc(word)}</span></span>`;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduced = () => H.getAttribute('data-motion') === 'reduced' || H.getAttribute('data-reduced-motion') === '1'
    || (W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches);
  let uidN = 0;
  const uid = (p) => (p || 'psx') + '-' + (++uidN).toString(36);
  const clone = (v) => (v === undefined ? undefined : v === null || typeof v !== 'object' ? v : JSON.parse(JSON.stringify(v)));
  const same = (a, b) => JSON.stringify(a == null ? null : a) === JSON.stringify(b == null ? null : b);
  const list = (names, max) => {
    const n = names.filter(Boolean); if (!n.length) return '';
    if (max && n.length > max) return n.slice(0, max).join(', ') + ' and ' + (n.length - max) + ' more';
    return n.length === 1 ? n[0] : n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1];
  };
  function h(tag, attrs, html) {
    const el = D.createElement(tag);
    if (attrs) Object.keys(attrs).forEach((k) => {
      const v = attrs[k]; if (v == null || v === false) return;
      if (k === 'class') el.className = v; else if (k === 'text') el.textContent = v; else el.setAttribute(k, v === true ? '' : v);
    });
    if (html != null) el.innerHTML = html;
    return el;
  }
  const portal = () => (W.PM7_SETTINGS_TOME && W.PM7_SETTINGS_TOME.portal ? W.PM7_SETTINGS_TOME.portal() : D.body);
  const root = () => D.getElementById('pm-settings-root');

  /* ------------------------------------------------------------------ Plans' inventory layering, the per-row authority
     Inventory alignment (2026-11-13): SSYS-059 makes the inventory layering object, not legacy scope, the reviewed
     authority for every row: home, may_differ_by, computer_key, combine, careful_order and not_offered. The layer reads
     Plans/settings_inventory.json from the same tree, so it follows whatever inventory the repository carries:
     index.html fetches it when served, and tools/build_standalone.py inlines it into the single files. Either way it
     arrives as window.PSX_LAYERING = { source: { path, sha256, schema_version, rows }, groups: { 'cat.sub': title },
     settings: [{ id, type, layering }] }. Without it the layer says so and falls back to its own heuristic. */
  const layering = (() => {
    const raw = W.PSX_LAYERING;
    if (!raw || !Array.isArray(raw.settings)) { try { console.warn('[psx] Plans’ inventory layering is missing: rows use the concept’s own heuristic'); } catch (e) { /* no console */ } return null; }
    const rows = {}, types = {};
    raw.settings.forEach((r) => { if (r && r.id && r.layering) { rows[r.id] = r.layering; types[r.id] = r.type || null; } });
    return { source: raw.source || null, groups: raw.groups || {}, rows, types };
  })();
  // a row's layering, or null when the inventory doesn't list it
  const layerOf = (id) => (layering && layering.rows[id]) || null;
  // the inventory's title for a row's group (its owner's page), from the id's first two parts
  const groupOf = (id) => (layering && layering.groups[String(id).split('.').slice(0, 2).join('.')]) || null;

  /* ------------------------------------------------------------------ is this a path? One reader for the layer
     Review Sol max F1: Always allow decided "host-dependent" with a regexp that saw a path only at the start of a word,
     so a path behind "=", in quotes, on a drive written C:/, relative with backslashes, or on a UNC share offered
     Everywhere and could be saved there. Every place in the layer that asks "is this a path?" asks this one reader:
     the Always allow editor and its save guard, broad detection, folder-rule matching and the home-folder read.
     It splits text the way a shell does (quotes keep a word together and come off) and reads each word. A word is a
     path when
       - it starts at a root: / (and //host), \\host, ~ or ~user, a drive (C: then / or \), a variable then a
         separator ($HOME/, ${HOME}/, %USERPROFILE%\, $env:USERPROFILE\), or file:
       - it is relative by its dots: . .. ./ ../ .\ ..\
       - a backslash stands between two names (tools\runner reads as a Windows path, the careful reading)
       - it names a script or program file by its extension (.sh .ps1 .bat .cmd .exe .py .js and the like)
     The value of --opt=value or NAME=value (each part of a , ; or : list) and a value written against a one-letter
     flag (-I/usr/include) are read the same way. The program word (the first, after sudo, env and NAME=value) is a
     path whenever it holds a / or a \: a shell runs such a command by its location, not from PATH. A web address
     (https://...) is never a path. */
  const PATH_EXT = /\.(sh|bash|zsh|fish|ps1|psm1|bat|cmd|exe|py|js|mjs|cjs|ts|rb|pl|php|lua)\b/i;
  const PATH_URL = /^[a-z][a-z0-9+.-]*:\/\//i;
  const PATH_ROOTS = [
    ['unc', /^(\\\\|\/\/)[^\\/]/],
    ['home', /^~[\w.-]*(?=[\\/]|$)/],
    ['home', /^(\$HOME|\$\{HOME\}|%USERPROFILE%|%HOMEPATH%|\$env:USERPROFILE|\$env:HOME)(?=[\\/]|$)/i],
    ['drive', /^[A-Za-z]:(?=[\\/]|$)/],
    ['variable', /^(\$\{?\w+\}?|%\w+%|\$env:\w+)(?=[\\/])/i],
    ['file', /^file:/i],
    ['root', /^\//],
    ['relative', /^\.{1,2}(?=[\\/]|$)/]
  ];
  const PATH_LIST = /[,;]|(?<!(?:^|[,;])[A-Za-z]):(?!\/\/)/;
  function shellWords(text) {
    const out = []; let cur = '', has = false, q = null;
    for (const ch of String(text == null ? '' : text)) {
      if (q) { if (ch === q) q = null; else cur += ch; continue; }
      if (ch === '"' || ch === "'") { q = ch; has = true; continue; }
      if (/\s/.test(ch)) { if (has || cur) out.push(cur); cur = ''; has = false; continue; }
      cur += ch;
    }
    if (has || cur) out.push(cur);
    return out;
  }
  // where the program word is: past sudo and env (and their flags) and any NAME=value before it
  function programAt(ws) {
    let i = 0;
    while (i < ws.length) {
      const w = ws[i];
      if (w === 'sudo' || w === 'env') { i++; while (i < ws.length && /^-/.test(ws[i])) i++; continue; }
      if (/^[A-Za-z_]\w*=/.test(w)) { i++; continue; }
      break;
    }
    return i;
  }
  function pathWord(word, program, depth) {
    const w = String(word == null ? '' : word); depth = depth || 0;
    if (!w || (PATH_URL.test(w) && !/^file:/i.test(w))) return null;
    for (const [root, re] of PATH_ROOTS) if (re.test(w)) return { path: w, root };
    if (depth < 3) {
      const eq = /^[^=\\/]+=(.+)$/.exec(w);                       // --prefix=/opt/release, PATH=/opt/bin:/usr/bin
      if (eq) { for (const part of eq[1].split(PATH_LIST)) { const r = pathWord(part, false, depth + 1); if (r) return r; } return null; }
      const glued = /^-[A-Za-z](.+)$/.exec(w);                   // -I/usr/include, -o./out
      if (glued) { const r = pathWord(glued[1], false, depth + 1); if (r) return r; }
    }
    if (/[\w.$%~-]\\[\w.$%~-]/.test(w)) return { path: w, root: 'relative' };
    if (program && /[\\/]/.test(w)) return { path: w, root: 'relative' };
    if (PATH_EXT.test(w)) return { path: w, root: 'relative', file: true };
    return null;
  }
  const paths = {
    words: shellWords,
    programAt,
    program(text) { const ws = shellWords(text), i = programAt(ws); return i < ws.length ? ws[i] : ''; },
    // one word: a path or null; `program` reads it as the word a shell runs
    word: (w, program) => pathWord(w, !!program, 0),
    // every path in a piece of text, in order: [{ path, root, file, program, at }]
    find(text) {
      const ws = shellWords(text), i = programAt(ws), out = [];
      ws.forEach((w, k) => { const r = pathWord(w, k === i, 0); if (r) out.push(Object.assign({ program: k === i, at: k }, r)); });
      return out;
    },
    // the same path written either way: quotes off, \ as /, one separator at a time, no separator at the end
    norm(text) {
      let s = shellWords(text).join(' ').replace(/\\/g, '/');
      const lead = /^\/\//.test(s) ? '//' : '';
      s = lead + s.slice(lead.length).replace(/\/{2,}/g, '/');
      if (s.length > 1 && !/^[A-Za-z]:\/$/.test(s)) s = s.replace(/\/+$/, '');
      return s;
    }
  };

  /* ------------------------------------------------------------------ the layer's own storage
     Only the review options and the one-time tip are kept (psx.settings-scope.v1); every read and write is guarded,
     and a page with no storage (a sandboxed preview) keeps them in memory. Never written into a project snapshot. */
  const KEY = 'psx.settings-scope.v1';
  const mem = {};
  let ls = null;
  try { ls = W.localStorage; ls.getItem(KEY); } catch (e) { ls = null; }
  const store = {
    load() { try { const raw = ls ? ls.getItem(KEY) : mem[KEY]; return raw ? JSON.parse(raw) : {}; } catch (e) { try { return mem[KEY] ? JSON.parse(mem[KEY]) : {}; } catch (e2) { return {}; } } },
    save(patch) { const next = Object.assign(store.load(), patch); const raw = JSON.stringify(next); mem[KEY] = raw; try { if (ls) ls.setItem(KEY, raw); } catch (e) { /* memory keeps it */ } }
  };

  /* ------------------------------------------------------------------ the demo world [Demo only] */
  const COMPUTERS = {
    here: { id: 'here', name: 'This computer', detail: 'Jared’s MacBook Pro · the app and its own Puppet Master' },
    homenas: { id: 'homenas', name: 'Home NAS', detail: 'Synology DS923+ · always on' },
    studio: { id: 'studio', name: 'Studio Mac', detail: 'Mac mini · set up on its own in October' },
    office: { id: 'office', name: 'Office PC', detail: 'Windows PC · joins in moment 11.7' }
  };
  /* the computers that are part of your setup now (Office PC only after it joins, moment 11.7) */
  const computerIds = () => Object.keys(COMPUTERS).filter((k) => k !== 'office' || (PSX.W && PSX.W.joined && PSX.W.joined.office));
  /* the computer that keeps your settings (7.2): Home NAS until it is moved or two setups join */
  const home = () => (PSX.W && PSX.W.home) || 'homenas';
  /* places that run work under a computer: shown only on program and folder rows, nested under their computer */
  const HOSTS = {
    'homenas:pm-worker': { id: 'homenas:pm-worker', name: 'Docker container pm-worker', parent: 'homenas', full: 'Home NAS · Docker container pm-worker' },
    buildbox: { id: 'buildbox', name: 'Build box', parent: 'homenas', full: 'Build box · an SSH computer Home NAS uses', own: true }
  };
  const DEVICES = {
    here: { id: 'here', name: 'This computer', paired: ['here', 'homenas'] },
    studio: { id: 'studio', name: 'Studio Mac', paired: ['studio'] },
    iphone: { id: 'iphone', name: 'iPhone', detail: 'Safari', paired: ['homenas'] },
    ipad: { id: 'ipad', name: 'Sam’s iPad', detail: 'a Member’s device', paired: ['homenas'], limited: true }
  };
  const PROJECTS = [
    { id: 'tastebook', home: 'here' }, { id: 'harbor', home: 'here' }, { id: 'loom', home: 'here' },
    { id: 'docs-site', home: 'here' }, { id: 'legacy-app', home: 'here' }, { id: 'experiment', home: 'here' },
    { id: 'garden-notes', home: 'homenas' }, { id: 'recipe-app', home: 'homenas' }, { id: 'lighting-rig', home: 'studio' }
  ];
  const projectById = (id) => PROJECTS.find((p) => p.id === id) || null;
  const MENU_PROJECTS = ['tastebook', 'harbor', 'loom'];   // the only ones in PMConcept7's title-bar menu

  /* Puppet Master's defaults for the demo rows: the inventory's, except the one the proposal changes (2.5, NEW CANON:
     "Show where each setting comes from" ships Off) */
  const DEFAULTS = {
    'ai.models.default-model': 'anthropic/claude-sonnet-4',
    'branching.subagents.max-parallel': 4,
    'general.interaction.eli5-default': false,
    'safety.rules.permission-preset': 'regular',
    'safety.protection.filesafe-integration': true,
    'general.visual.font-size': 14,
    'general.interaction.sound-effects': true,
    'general.visual.reduce-animations': false,
    'general.visual.theme': 'Basic Dark',
    'system.advanced.cli-path-claude': 'Auto-detected',
    'code.terminal.shell': 'System Default',
    'psx.projects-folder': '<home>/Projects',
    'memory.assembly.project-rules': '',
    'branching.worktrees.default-branch': 'main',
    'system.mcp.timeout': 30000,
    'ai.accounts.hard-switch-level': 10,
    'general.interaction.scope-labels': false
  };
  /* each row's rule (SETTINGS-PROPOSAL 1.3, the proposed `layering` field): where it lives, what it may differ by,
     how levels combine, and the one closed reason for every level it does not offer */
  const DEF = {
    'ai.models.default-model': { may: ['computer', 'project'] },
    'branching.subagents.max-parallel': { may: ['computer', 'project'], combine: 'computer_ceiling' },
    'general.interaction.eli5-default': { may: ['computer', 'project'], chats: true },
    'safety.rules.permission-preset': { may: ['computer', 'project'], combine: 'more_careful', careful: ['read_only', 'plan', 'regular', 'full'], safety: true },
    'safety.protection.filesafe-integration': { may: ['computer', 'project'], combine: 'more_careful', careful: [true, false], safety: true, risk: 'Off for this project' },
    'general.visual.font-size': { may: ['device'], screen: true },
    'general.interaction.sound-effects': { may: ['device'], screen: true },
    'general.visual.reduce-animations': { may: ['device', 'project'], combine: 'more_careful', careful: [true, false], screen: true },
    'general.visual.theme': { may: ['device', 'project'], screen: true, pair: 'general.visual.theme-mode' },
    'system.advanced.cli-path-claude': { home: 'computer', host: true, reason: 'names_a_program', program: 'Claude Code' },
    'code.terminal.shell': { home: 'computer', host: true, reason: 'names_a_program' },
    'psx.projects-folder': { home: 'computer', host: true, reason: 'names_a_folder', demoRow: true },
    'memory.assembly.project-rules': { home: 'project', reason: 'about_this_project' },
    'branching.worktrees.default-branch': { may: ['computer', 'project'] },
    'system.mcp.timeout': { may: ['computer', 'project'] },
    'ai.accounts.hard-switch-level': { may: ['computer', 'project'], owner: true },
    'general.interaction.scope-labels': { home: 'everywhere', reason: 'same_for_you' }
  };
  const IDS = Object.keys(DEF);
  /* closed reason codes and their sentences (SETTINGS-PROPOSAL 1.3) */
  const REASONS = {
    names_a_program: ['Each computer has its own, because a program can be in a different place on each computer.', 'Programs differ per computer'],
    names_a_folder: ['Each computer has its own, because a folder is in a different place on each computer.', 'Folders differ per computer'],
    names_a_path: ['Each computer has its own, because a path names a place on one computer.', 'Paths differ per computer'],
    kept_by_owner: ['Kept inside its owner, so it isn’t set for everywhere, a computer, a device or a project.', 'Kept by its owner'],
    // the inventory's own code for an owner-held row's levels (Plans/settings_inventory.json not_offered)
    set_inside_a_thing: ['Kept inside its owner, so it isn’t set for everywhere, a computer, a device or a project.', 'Kept by its owner'],
    about_hardware: ['Each computer has its own, because it depends on what that computer can do.', 'Depends on the computer'],
    about_the_network: ['Each computer has its own, because each one reaches the internet its own way.', 'Network differs per computer'],
    about_this_project: ['Each project has its own, because it’s about that project’s own files.', 'Belongs to one project'],
    about_the_screen: ['This is about the screen in front of you, so it can differ per device.', 'Follows the device'],
    not_about_the_screen: ['This is about the work, not the screen, so devices can’t change it.', 'Not about a screen'],
    same_for_you: ['Same everywhere. It’s about how Puppet Master works for you.', 'Same everywhere'],
    your_library: ['Same everywhere. It’s your library, kept with your settings.', 'Your library'],
    limited_device: ['This device can change only its own screen settings.', 'This device can change only its own screen settings']
  };

  function freshWorld() {
    const lv = (keys) => keys.reduce((o, k) => (o[k] = {}, o), {});
    const w = {
      rev: 1,
      everywhere: {
        'ai.models.default-model': 'anthropic/claude-opus-4',
        'general.interaction.eli5-default': true,
        'general.interaction.sound-effects': false
      },
      computer: lv(['here', 'homenas', 'studio', 'office', 'homenas:pm-worker', 'buildbox']),
      device: lv(Object.keys(DEVICES)),
      project: lv(PROJECTS.map((p) => p.id).concat('psx-none')),
      provider: { claude: { 'ai.accounts.hard-switch-level': 15 } },
      /* what Puppet Master found on each computer (programs and folders): a found value is the default, not a change */
      found: {
        'system.advanced.cli-path-claude': { here: '/opt/homebrew/bin/claude', homenas: '/usr/local/bin/claude', 'homenas:pm-worker': '/usr/local/bin/claude', buildbox: '/usr/bin/claude', studio: null, office: 'C:\\Program Files\\Claude\\claude.exe' },
        'code.terminal.shell': { here: 'zsh', homenas: 'sh', 'homenas:pm-worker': 'sh', buildbox: 'bash', studio: 'zsh', office: 'PowerShell' },
        'psx.projects-folder': { here: '~/Projects', homenas: '/volume1/homes/jared/Projects', 'homenas:pm-worker': '/data/Projects', buildbox: '/home/jared/Projects', studio: '~/Projects', office: 'C:\\Users\\jared\\Projects' }
      },
      up: { here: true, homenas: true, studio: true, office: true },
      home: 'homenas',
      studioJoined: false,
      joined: { office: false },
      /* which AI accounts each project chose (S10 A); a project with none here uses your usual ones [Demo only] */
      uses: { tastebook: ['work-claude', 'codex', 'openrouter'], experiment: ['personal-claude'], 'lighting-rig': ['personal-claude'] },
      usualAccounts: ['work-claude'],
      /* rules a project brought from someone else's repository, and what you chose (S15) */
      rules: {},
      asOf: 'Tuesday 10:45',
      history: [],
      batches: {},
      /* things the managers hold (4.5); the layer's own record of them, never PM51.s() */
      things: {
        mcp: {
          'github-mcp': { name: 'GitHub MCP', home: 'library', reach: 'every', inProject: { 'legacy-app': { may: 'Read only' }, 'docs-site': { on: false } }, computers: { here: 'ready', homenas: 'signin', studio: 'missing' } },
          'filesystem-mcp': { name: 'Filesystem MCP', home: 'tastebook', reach: 'only', projects: ['tastebook'], computers: { here: 'ready', homenas: 'missing', studio: 'missing' } },
          'linear-mcp': { name: 'Linear MCP', home: 'external', reach: 'every', computers: { here: 'ready', homenas: 'ready', studio: 'ready' } },
          'figma-mcp': { name: 'Figma MCP', home: 'library', reach: 'only', projects: ['docs-site', 'tastebook'], computers: { here: 'ready', homenas: 'signin', studio: 'missing' } }
        },
        accounts: {
          'work-claude': { name: 'Work Claude', service: 'Claude', tool: 'Claude Code', kind: 'tool', reach: 'every', order: 1, on: { here: 'ready', homenas: 'checked', studio: 'missing' } },
          'personal-claude': { name: 'Personal', service: 'Claude', tool: 'Claude Code', kind: 'tool', reach: 'only', projects: ['experiment', 'lighting-rig'], order: 2, on: { here: 'ready' } },
          codex: { name: 'ChatGPT sign-in', service: 'Codex', tool: 'Codex', kind: 'tool', reach: 'every', on: { here: 'ready' } },
          openrouter: { name: 'API key', service: 'OpenRouter', kind: 'key', reach: 'every', on: { here: 'ready' } },
          /* a sign-in tied to this computer's hardware: it can't be used on any other computer (cannot_move) [Demo only] */
          copilot: { name: 'Seat on this Mac', service: 'GitHub Copilot', tool: 'Copilot', kind: 'tool', reach: 'every', bound: 'here', on: { here: 'ready' } }
        },
        personas: { reviewer: { name: 'Reviewer', home: 'library', versions: ['tastebook'] } }
      }
    };
    const set = (lvl, key, id, v) => { w[lvl][key][id] = v; };
    set('project', 'docs-site', 'ai.models.default-model', 'anthropic/claude-sonnet-4');
    /* main's one-model design (Settings batch 3) retired Thinking depth (ai.models.reasoning-effort; depth lives inside
       the model picker now), so the demo's "This project" example is Everyday building (ai.models.worker-model, below) */
    set('computer', 'here', 'branching.subagents.max-parallel', 3);
    set('computer', 'homenas', 'branching.subagents.max-parallel', 8);
    set('project', 'tastebook', 'branching.subagents.max-parallel', 6);
    set('project', 'loom', 'branching.subagents.max-parallel', 2);
    set('computer', 'homenas', 'safety.rules.permission-preset', 'plan');
    set('project', 'legacy-app', 'safety.rules.permission-preset', 'plan');
    set('project', 'garden-notes', 'safety.rules.permission-preset', 'full');
    set('computer', 'homenas', 'safety.protection.filesafe-integration', true);
    set('project', 'experiment', 'safety.protection.filesafe-integration', false);
    set('device', 'studio', 'general.visual.font-size', 16);
    set('device', 'iphone', 'general.visual.font-size', 17);
    set('device', 'studio', 'general.interaction.sound-effects', true);
    set('device', 'iphone', 'general.visual.reduce-animations', true);
    set('project', 'loom', 'general.visual.reduce-animations', true);
    set('computer', 'homenas', 'system.advanced.cli-path-claude', '/usr/local/bin/claude');
    set('computer', 'homenas', 'code.terminal.shell', 'bash');
    set('computer', 'homenas', 'psx.projects-folder', '/volume1/projects');
    set('computer', 'studio', 'psx.projects-folder', '~/Developer');
    set('computer', 'homenas:pm-worker', 'psx.projects-folder', '/data/projects');
    set('project', 'loom', 'memory.assembly.project-rules', 'Prefer small commits.\nWrite the test first.\nAsk before adding a dependency.');
    set('project', 'tastebook', 'memory.assembly.project-rules', 'Recipes use metric units.');
    set('project', 'harbor', 'branching.worktrees.default-branch', 'develop');
    set('project', 'legacy-app', 'branching.worktrees.default-branch', 'develop');
    set('project', 'tastebook', 'branching.worktrees.default-branch', 'trunk');
    set('project', 'harbor', 'system.mcp.timeout', 60000);
    // the rest of tastebook's own settings, from Split v2 4.9 (its Theme, Everyday model and Profile in use are left out:
    // they would contradict this concept's world, BUILD-SPEC 4.4)
    set('project', 'tastebook', 'ai.models.worker-model', 'openai/gpt-5');
    set('project', 'tastebook', 'planning.verification.goal-auto-resume', false);
    set('project', 'tastebook', 'safety.approvals.auto-continue', true);
    set('project', 'tastebook', 'branching.worktrees.auto-worktree-new-threads', true);
    set('project', 'tastebook', 'planning.testing.cap-visible-browser', 'On');
    set('project', 'tastebook', 'planning.testing.cap-simulator', 'On');
    set('project', 'tastebook', 'memory.retention.history-retention', 'recent');
    // (main's Memory rulings retired memory.retention.subagent-access, which tastebook used to set here)
    // the history seed (4.6)
    w.history = [
      { id: 'h5', when: 'Sun 20:10', by: 'you', from: 'here', level: 'everywhere', key: null, sid: 'ai.models.default-model', before: 'anthropic/claude-sonnet-4', after: 'anthropic/claude-opus-4' },
      { id: 'h4', when: 'Mon 17:40', by: 'you', from: 'iphone', level: 'device', key: 'iphone', sid: 'general.visual.font-size', before: undefined, after: 17 },
      { id: 'h3', when: 'Mon 18:02', by: 'you', from: 'homenas', level: 'computer', key: 'homenas', sid: 'branching.subagents.max-parallel', before: undefined, after: 8 },
      { id: 'h2', when: 'Tue 10:45', by: 'you', from: 'studio', level: 'everywhere', key: null, sid: 'general.interaction.eli5-default', before: false, after: true },
      { id: 'h1', when: 'Today 9:14', by: 'you', from: 'here', level: 'project', key: 'tastebook', sid: 'branching.subagents.max-parallel', before: 4, after: 6 }
    ].reverse();
    return w;
  }

  /* ------------------------------------------------------------------ names and words */
  const projectName = (id) => (id === 'psx-none' || id === 'none' || id == null ? 'No project' : id);
  const placeName = (lvl, key) => {
    if (lvl === 'everywhere') return 'Everywhere';
    if (lvl === 'default') return 'Puppet Master’s default';
    if (lvl === 'computer') return COMPUTERS[key] ? COMPUTERS[key].name : HOSTS[key] ? HOSTS[key].full : key;
    if (lvl === 'device') return DEVICES[key] ? DEVICES[key].name : key;
    if (lvl === 'project') return projectName(key);
    if (lvl === 'provider') return 'Claude';
    return key || lvl;
  };
  const setting = (id) => (W.PM51 && W.PM51.setting ? W.PM51.setting(id) : null);
  const LABELS = { 'psx.projects-folder': 'Projects folder', 'general.visual.theme': 'Theme', 'system.mcp.timeout': 'Wait for an MCP server this long' };
  const engineSetting = (id) => setting(id);
  /* the choices a row offers, for the panel's inline Change */
  function optionsFor(id) {
    const s = setting(id);
    if (id === 'general.visual.theme' && !(s && Array.isArray(s.options) && s.options.length)) return ['Basic Dark', 'Basic Light', 'Friendly Dark', 'Friendly Light', 'Glass Dark', 'Glass Light', 'Retro Dark', 'Retro Light', 'NieR Dark', 'NieR Light'];
    if (!s) return null;
    if (!['select', 'segmented', 'radio'].includes(s.control)) return null;
    const o = Array.isArray(s.options) ? s.options.map((x) => (x && typeof x === 'object' ? (x.value != null ? x.value : x.id) : x)) : [];
    return o.length ? o : null;
  }
  function label(id) {
    if (LABELS[id]) return LABELS[id];
    const s = setting(id);
    return s && W.PM51.rowLabel ? W.PM51.rowLabel(s) : id;
  }
  /* the value as the row says it ("Claude Opus 4", "On", "60 seconds", "3 rules") */
  function vt(id, v) {
    if (v === undefined) return 'Not set';
    if (id === 'system.mcp.timeout') { const n = Number(v); return n >= 1000 ? `${+(n / 1000).toFixed(1)} seconds` : `${n} ms`; }
    if (id === 'memory.assembly.project-rules') { const n = String(v || '').split('\n').filter((x) => x.trim()).length; return n ? `${n} rule${n === 1 ? '' : 's'}` : 'No rules'; }
    if (id === 'system.advanced.cli-path-claude' && v === 'Auto-detected') return 'Found automatically';
    if (id === 'psx.projects-folder') return String(v);
    if (id === 'ai.accounts.hard-switch-level') return `${v}% left`;
    const s = setting(id);
    if (s && ['text', 'path', 'textarea'].includes(s.control) && typeof v === 'string') return v;   // a branch name or a path, as typed
    if (s && W.PM51.valueText) { try { return W.PM51.valueText(s, v); } catch (e) { /* fall through */ } }
    return v === true ? 'On' : v === false ? 'Off' : String(v);
  }

  /* ------------------------------------------------------------------ review state */
  const saved = store.load();
  const S = {
    opt: Object.assign({ end: 'origin', changed: 'outline' }, saved.opt || {}),
    ctx: { project: 'tastebook', device: 'here', on: null },
    actor: 'here',        // the device in use (the strip's You're using); the header's Change › another device's screen is only what you see
    runMode: saved.runMode === 'yolo' ? 'yolo' : 'regular',   // the run mode the yes-points follow (Regular or YOLO)
    keys: false,          // the review keys 1 to 4, 0 and C work only while the strip's Compare options is open
    tipShown: !!saved.tipShown,
    reviewChange: false,
    moment: null,
    targets: {},          // the panel's "Choosing here changes", per setting, while its panel is open
    osReduced: false
  };
  PSX.S = S;
  PSX.W = freshWorld();
  PSX.freshWorld = () => { PSX.W = freshWorld(); return PSX.W; };

  /* the context, filled in: which computer does the work (a project's Home Server unless the view says otherwise) */
  function ctxFull(c) {
    c = Object.assign({}, S.ctx, c || {});
    const project = c.project && c.project !== 'none' && c.project !== 'psx-none' ? c.project : null;
    const p = projectById(project);
    const on = c.on || (p ? p.home : 'here');
    return { project, on, host: c.host || null, device: c.device || 'here', provider: c.provider || null, view: !!c.on && !!p && c.on !== p.home };
  }

  /* ------------------------------------------------------------------ world transactions, history and undo
     A transaction is a list of writes { level, key, id, value } (value undefined removes an own value). It records its
     inverse, so Undo is exact while the setting still holds what it wrote. */
  /* besides the four setting levels, a transaction can hold a thing (key: mcp, personas, accounts), a project's AI
     account choice (uses), a project's accepted rules (rules), a computer joining (joined) and the settings home (meta) */
  function bagOf(w, level, key, make) {
    if (level === 'everywhere') return w.everywhere;
    if (level === 'meta') return w;
    if (level === 'thing') return w.things[key] || (make ? (w.things[key] = {}) : null);
    if (level === 'uses' || level === 'rules' || level === 'joined') return w[level] || (make ? (w[level] = {}) : null);
    if (!w[level]) return null;
    return w[level][key] || (make ? (w[level][key] = {}) : null);
  }
  function getAt(w, level, key, id) { const bag = bagOf(w, level, key, false); return bag ? clone(bag[id]) : undefined; }
  function putAt(w, level, key, id, v) {
    const bag = bagOf(w, level, key, true);
    if (v === undefined) delete bag[id]; else bag[id] = clone(v);
  }
  const SETTING_LEVEL = { everywhere: 1, computer: 1, device: 1, project: 1 };
  const listeners = {};
  const on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); };
  const emit = (ev, data) => (listeners[ev] || []).slice().forEach((fn) => { try { fn(data); } catch (e) { console.error('[psx]', ev, e); } });
  function apply(writes, meta) {
    meta = meta || {};
    const w = PSX.W;
    const undo = writes.map((x) => ({ level: x.level, key: x.key, id: x.id, value: getAt(w, x.level, x.key, x.id) }));
    writes.forEach((x) => putAt(w, x.level, x.key, x.id, x.value));
    w.rev++;
    const tx = { id: uid('tx'), writes: clone(writes), undo, meta, rev: w.rev, links: [] };
    if (meta.history !== false) {
      const from = meta.from || S.ctx.device || 'here';
      const yolo = !!meta.yolo;
      if (meta.batch || writes.some((x) => !SETTING_LEVEL[x.level])) w.history.unshift({ id: tx.id, when: 'Just now', by: meta.by || 'you', from, batch: meta.batch || 'change', text: meta.text || 'A change', tx: tx.id, extra: meta.extra || null, yolo });
      else writes.forEach((x, i) => w.history.unshift({ id: tx.id + '-' + i, when: 'Just now', by: meta.by || 'you', from, level: x.level, key: x.key, sid: x.id, before: undo[i].value, after: x.value, tx: tx.id, yolo }));
    }
    w.batches[tx.id] = tx;
    emit('world', { tx });
    return tx;
  }
  /* Undo puts back what a transaction replaced; a value changed since is left alone and said (7.13) */
  function undo(txId) {
    const w = PSX.W, tx = w.batches[txId]; if (!tx || tx.undone) return { ok: false };
    const later = [];
    const writes = [];
    // a batch's parts finished later (Finish lighting-rig) are undone with it: "Undo all of it" means all of it
    (tx.links || []).forEach((lid) => { const r = undo(lid); if (r.later) later.push(...r.later); });
    tx.writes.forEach((x, i) => {
      if (!same(getAt(w, x.level, x.key, x.id), x.value)) { later.push(x.id); return; }
      writes.push(tx.undo[i]);
    });
    writes.forEach((x) => putAt(w, x.level, x.key, x.id, x.value));
    if (tx.meta && typeof tx.meta.onUndo === 'function') { try { tx.meta.onUndo(); } catch (e) { console.error(e); } }
    tx.undone = true; w.rev++;
    w.history = w.history.filter((e) => e.tx !== txId);
    emit('world', { undo: tx });
    return { ok: true, later };
  }

  /* ------------------------------------------------------------------ simulated owner commands (owner routing) */
  async function run(cmd, phases, finish) {
    PSX.busy = cmd;
    emit('busy', { cmd, on: true });
    for (const ms of phases || [500]) await wait(reduced() ? Math.min(160, ms) : ms);
    PSX.busy = null;
    emit('busy', { cmd, on: false });
    if (finish) return finish();
    return true;
  }

  /* ------------------------------------------------------------------ the note after a change (6.4)
     The layer's own div.psx-note[role=status] in #pm-settings-portals, in Settings' toast material; one at a time, six
     seconds, paused while hovered or focused. Never a PM Notify toast (its actions are a closed set, F3-461). */
  let noteEl = null, noteTimer = 0, notePaused = false, noteLeft = 0, noteStart = 0, noteActs = null;
  /* one live region that stays in the page, so a screen reader hears each note (a region inserted with its text
     already in it is the one they most often miss); the visible note itself is not a second live region */
  function live() {
    const host = portal(); if (!host) return null;
    let el = host.querySelector(':scope > .psx-live');
    if (!el) { el = h('div', { class: 'psx-live', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' }); host.appendChild(el); }
    return el;
  }
  function note(o) {
    const host = portal(); if (!host) return null;
    if (!noteEl || !noteEl.isConnected) {
      const el = h('div', { class: 'psx-note', role: 'group', 'aria-label': 'What just changed', 'data-lg-surface': 'menu', 'data-lg-dense': '' });
      el.addEventListener('mouseenter', pauseNote); el.addEventListener('mouseleave', resumeNote);
      el.addEventListener('focusin', pauseNote);
      // the element the listener belongs to, never the shared variable (it is null once the note is going)
      el.addEventListener('focusout', (e) => { if (el.isConnected && !el.contains(e.relatedTarget)) resumeNote(); });
      el.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); hideNote(); } });
      noteEl = el;
      host.appendChild(el);
    }
    clearTimeout(noteTimer);
    const tip = o.tip ? `<div class="psx-note-tip">${mark('info')}<span>${esc(o.tip)}</span></div>` : '';
    noteEl.innerHTML = `${tip}<div class="psx-note-main">${o.mark ? mark(o.mark) : mark('complete')}<div class="psx-note-copy"><div class="psx-note-title">${esc(o.title)}</div>${o.body ? `<div class="psx-note-body">${esc(o.body)}</div>` : ''}</div></div>`
      + ((o.actions && o.actions.length) ? `<div class="psx-note-actions">${o.actions.map((a, i) => `<button type="button" class="psx-tb${a.primary ? ' is-primary' : ''}" data-i="${i}"${a.label === 'Undo' ? ' aria-keyshortcuts="Control+Z Meta+Z"' : ''}${a.hover ? ` data-pm-hover-label="${esc(a.label)}" data-pm-hover-detail="${esc(a.hover)}"` : ''}>${esc(a.label)}</button>`).join('')}<button type="button" class="psx-tb is-quiet" data-close>Dismiss</button></div>` : '');
    noteActs = o.actions || null;
    const lv = live(); if (lv) { lv.textContent = ''; setTimeout(() => { lv.textContent = [o.title, o.body, (o.actions || []).some((a) => a.label === 'Undo') ? 'Undo with Control Z, or F6 to reach the note.' : ''].filter(Boolean).join(' '); }, 30); }
    noteEl.querySelectorAll('button[data-i]').forEach((b) => b.addEventListener('click', () => { const a = o.actions[+b.dataset.i]; hideNote(); if (a && a.run) a.run(); }));
    const x = noteEl.querySelector('[data-close]'); if (x) x.addEventListener('click', () => hideNote());
    noteEl.removeAttribute('data-leaving'); noteEl.setAttribute('data-open', '');
    noteEl.dataset.kind = o.kind || '';
    noteLeft = o.ms || 6000; notePaused = false; noteStart = Date.now();
    if (!o.sticky) noteTimer = setTimeout(hideNote, noteLeft);
    PSX.lastNote = { title: o.title, body: o.body || '', actions: (o.actions || []).map((a) => a.label), tip: o.tip || '' };
    PSX.noteCount = (PSX.noteCount || 0) + 1;
    emit('note', PSX.lastNote);
    return noteEl;
  }
  function pauseNote() { if (notePaused || !noteEl) return; notePaused = true; clearTimeout(noteTimer); noteLeft = Math.max(1500, noteLeft - (Date.now() - noteStart)); }
  function resumeNote() { if (!notePaused || !noteEl) return; notePaused = false; noteStart = Date.now(); noteTimer = setTimeout(hideNote, noteLeft); }
  function hideNote() {
    clearTimeout(noteTimer);
    if (!noteEl || !noteEl.isConnected) return;
    const el = noteEl;
    const hadFocus = el.contains(D.activeElement);
    if (reduced()) el.remove(); else { el.setAttribute('data-leaving', ''); setTimeout(() => el.remove(), 180); }
    noteEl = null; noteActs = null;
    if (hadFocus && PSX.lastFocus && PSX.lastFocus.isConnected) try { PSX.lastFocus.focus({ preventScroll: true }); } catch (e) { /* gone */ }
  }

  /* Undo is reachable by keyboard while the note shows (SETTINGS-PROPOSAL 3.5): Control or Command Z runs it outside a
     text field, and F6 moves focus into the note (Esc there hides it and focus goes back) */
  W.addEventListener('keydown', (e) => {
    if (!noteEl || !noteEl.isConnected || noteEl.hasAttribute('data-leaving')) return;
    const t = e.target, tag = (t && t.tagName) || '';
    const typing = /input|select|textarea/i.test(tag) || (t && t.isContentEditable);
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 'z' || e.key === 'Z') && !typing) {
      const a = (noteActs || []).find((x) => x.label === 'Undo'); if (!a) return;
      e.preventDefault(); e.stopPropagation(); hideNote(); a.run(); return;
    }
    if (e.key === 'F6' && !typing) {
      const b = noteEl.querySelector('button'); if (!b) return;
      e.preventDefault(); PSX.lastFocus = D.activeElement; b.focus({ preventScroll: true });
    }
  }, true);

  /* ------------------------------------------------------------------ sheets (dialogs) in #pm-settings-portals
     Settings' own dialog material (.dialog, .dialog-head, .dialog-body, .dialog-footer and .btn), so all ten looks draw
     them; a back of the layer's own (never .overlay, which the engine's closeOverlay removes). role=dialog, aria-modal,
     a labelled heading, Tab kept inside, Esc closes the top one and focus returns to the opener. In Liquid Glass the
     sheet is a dense menu surface (data-lg-surface) and is never transformed. */
  const sheets = [];
  function sheet(o) {
    const host = portal();
    const opener = D.activeElement;
    const back = h('div', { class: 'psx-back', role: 'presentation', 'data-psx-sheet': o.id || '' });
    const tid = uid('psx-sheet-title');
    const box = h('section', { class: 'dialog psx-sheet' + (o.size ? ' is-' + o.size : '') + (o.cls ? ' ' + o.cls : ''), role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': tid, 'data-lg-surface': 'menu', 'data-lg-dense': '' });
    box.innerHTML = `<div class="dialog-head psx-sheet-head"><div class="dialog-head-copy">${o.kicker ? `<div class="psx-kicker">${esc(o.kicker)}</div>` : ''}<h2 class="dialog-title" id="${tid}">${esc(o.title)}</h2>${o.sub ? `<div class="dialog-sub">${esc(o.sub)}</div>` : ''}</div><button type="button" class="psx-tb psx-close" data-psx-close>Close</button></div>`
      + `<div class="dialog-body psx-sheet-body"></div><div class="dialog-footer psx-sheet-foot"></div>`;
    const body = box.querySelector('.psx-sheet-body'), foot = box.querySelector('.psx-sheet-foot');
    if (o.body) { if (typeof o.body === 'string') body.innerHTML = o.body; else body.appendChild(o.body); }
    back.appendChild(box);
    const api = { el: box, back, body, foot, close, setActions, opener };
    function setActions(actions) {
      foot.innerHTML = '';
      (actions || []).forEach((a) => {
        if (a.spacer) { foot.appendChild(h('span', { class: 'psx-grow' })); return; }
        const b = h('button', { type: 'button', class: 'btn' + (a.primary ? ' primary' : '') + (a.danger ? ' danger' : ''), 'aria-disabled': a.disabled ? 'true' : null, 'data-psx-act': a.id || null }, esc(a.label));
        if (a.disabled && typeof a.disabled === 'string') { b.setAttribute('data-pm-hover-label', a.label); b.setAttribute('data-pm-hover-detail', a.disabled); }
        b.addEventListener('click', () => { if (b.getAttribute('aria-disabled') === 'true') return; if (a.run) a.run(api); });
        foot.appendChild(b);
      });
      foot.hidden = !(actions && actions.length);
    }
    function close(why) {
      const i = sheets.indexOf(api); if (i >= 0) sheets.splice(i, 1);
      if (!back.isConnected) return;
      // the opener may have been redrawn while the sheet was open: a function finds its new self
      const done = () => { back.remove(); let f = typeof o.returnFocus === 'function' ? o.returnFocus() : (o.returnFocus || opener); if (f && !f.isConnected && opener && opener.getAttribute && opener.getAttribute('data-psx-key')) f = D.querySelector(`[data-psx-key="${CSS.escape(opener.getAttribute('data-psx-key'))}"]`); if (f && f.isConnected && f.focus) try { f.focus({ preventScroll: true }); } catch (e) { /* gone */ } if (o.onClose) o.onClose(why); };
      if (reduced()) done(); else { back.setAttribute('data-leaving', ''); setTimeout(done, 150); }
    }
    box.querySelector('[data-psx-close]').addEventListener('click', () => close('x'));
    back.addEventListener('mousedown', (e) => { if (e.target === back && !o.sticky) close('outside'); });
    box.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = Array.from(box.querySelectorAll('button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])')).filter((x) => !x.disabled && x.offsetParent !== null && x.getAttribute('aria-hidden') !== 'true');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && D.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && D.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    setActions(o.actions);
    host.appendChild(back);
    sheets.push(api);
    // first focus: a marked control, the chosen radio, the first enabled control in the body, the primary, then Close
    const enabled = ':not([aria-disabled="true"]):not(:disabled)';
    requestAnimationFrame(() => { back.setAttribute('data-open', ''); const f = box.querySelector('[data-autofocus]') || box.querySelector('.psx-sheet-body input[type="radio"]:checked') || box.querySelector(`.psx-sheet-body button${enabled}, .psx-sheet-body input${enabled}, .psx-sheet-body select${enabled}, .psx-sheet-body summary`) || box.querySelector(`.btn.primary${enabled}`) || box.querySelector('[data-psx-close]'); if (f) try { f.focus({ preventScroll: true }); } catch (e) { /* gone */ } });
    if (o.onOpen) o.onOpen(api);
    return api;
  }
  const topSheet = () => sheets.filter((s) => s.back.isConnected).pop() || null;
  /* a modal sheet keeps Tab: from anywhere outside it (a click on the title bar, a menu that closed), Tab comes back in */
  W.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const top = topSheet(); if (!top) return;
    const a = D.activeElement;
    if (a && (top.el.contains(a) || (a.closest && a.closest('.pmr-menu, .pm51-popout')))) return;
    const f = Array.from(top.el.querySelectorAll('button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])')).filter((x) => !x.disabled && x.offsetParent !== null);
    if (!f.length) return;
    e.preventDefault();
    (e.shiftKey ? f[f.length - 1] : f[0]).focus();
  }, true);
  function closeSheets() { sheets.slice().forEach((s) => s.close('reset')); }

  /* ------------------------------------------------------------------ menus: PMR.menu, every item labelled
     items: [{ label, meta, icon, disabled (a reason string), run, value, selected }] or groups [{ label, items }] */
  function menu(anchor, groups, opts) {
    if (!(W.PMR && W.PMR.menu) || !anchor) return null;
    opts = opts || {};
    const gs = Array.isArray(groups) && groups.length && groups[0] && groups[0].items ? groups : [{ items: groups }];
    const map = new Map();
    let count = 0;
    const m = {
      id: uid('menu'), label: opts.label || 'Actions',
      search: opts.search != null ? opts.search : false,
      searchPlaceholder: opts.placeholder || undefined,
      groups: gs.map((g) => ({ label: g.label, items: g.items.filter(Boolean).map((it) => { const id = uid('mi'); count++; map.set(id, it); return { id, label: it.label, meta: it.disabled && typeof it.disabled === 'string' ? it.disabled : it.meta, icon: it.icon, disabled: it.disabled || null }; }) }))
    };
    if (opts.search == null && count > 8) m.search = true;
    const pick = (item) => { const it = map.get(item.id); if (it && !it.disabled && typeof it.run === 'function') setTimeout(() => it.run(), 0); };
    if (opts.at) return W.PMR.menu.at(m, opts.at[0], opts.at[1], { onPick: pick, width: opts.width });
    return W.PMR.menu.open(m, anchor, { align: opts.align || 'end', width: opts.width, onPick: pick });
  }

  /* ------------------------------------------------------------------ hover labels */
  function tip(el, labelText, detail) {
    if (!el) return el;
    el.setAttribute('data-pm-hover-label', labelText);
    if (detail) el.setAttribute('data-pm-hover-detail', detail);
    return el;
  }

  Object.assign(PSX, {
    D, H, esc, icon, mark, st, wait, reduced, uid, clone, same, list, h, portal, root, tip, paths, layering, layerOf, groupOf,
    store, COMPUTERS, HOSTS, DEVICES, PROJECTS, MENU_PROJECTS, projectById, DEFAULTS, DEF, IDS, REASONS, computerIds, home,
    homeName: () => placeName('computer', home()), bagOf,
    projectName, placeName, label, vt, ctxFull, engineSetting, optionsFor, getAt, putAt, apply, undo, run, on, emit,
    note, hideNote, sheet, topSheet, closeSheets, sheets, menu
  });
})(window);
