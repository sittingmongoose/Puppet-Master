/* Projects concepts (Opus 5.5): the shared core, window.PJX.

   Runs inside PMConcept7, added at runtime by index.html (PMConcept7 itself is not edited). Every concept (A Polish,
   B Ledger, C Split) renders the same demo world through this core, so the three differ in layout and presentation only:
   the same projects, the same states, the same words, the same actions and the same New Project questions (flow.js).

   What it uses from PMConcept7:
     PMG.icon(name, px), PMG.status(key, px), PMG.calm(key, px)   the one glyph registry and the shared status marks
     PMR.h, PMR.menu.open(menu, anchor, opts), PMR.hover(el, label, detail)   the chat-style menu and hover labels
     window.toast({ title, body, severity })                     PM Notify
     PM_PAGES.go(page)                                           page switching
     #projectMenu items                                          switching the active project in the title bar

   Concepts register with PJX.concept(id, { title, mount(root), unmount(), render(), openNew(opts), openRepair(id),
   openProject(id) }). The core mounts the chosen concept into #panel-projects and hides the page's own children while a
   concept is shown; "Today" (opt 'before') unmounts and leaves the page exactly as PMConcept7 drew it.

   Owner routing: every action below names the Plans command it stands for (cmd), and it changes the demo world only
   after its simulated owner result, never optimistically (Project_System §3, §4). Remove is list-only; Delete data is a
   separate Storage-owned intent with its own confirmation (§4). */
(function (W) {
  'use strict';
  const D = W.document, H = D.documentElement;
  if (W.PJX) return;

  /* ------------------------------------------------------------------ small helpers */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (n, px) => (W.PMG && W.PMG.icon ? W.PMG.icon(n, px || 16) : '');
  const mark = (key, px) => (W.PMG && W.PMG.status ? W.PMG.status(key, px || 14) : '');
  const calm = (key, px) => (W.PMG && W.PMG.calm ? W.PMG.calm(key, px || 14) : mark(key, px));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduced = () => H.getAttribute('data-motion') === 'reduced' || H.getAttribute('data-reduced-motion') === '1'
    || (W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const stepped = () => H.getAttribute('data-o55-nier') === 'on' || /^retro/.test(H.getAttribute('data-theme') || '');
  const look = () => {
    const t = H.getAttribute('data-theme') || 'basic-dark';
    return H.getAttribute('data-o55-nier') === 'on' ? 'nier-' + (/-light$/.test(t) ? 'light' : 'dark') : t;
  };
  let uidN = 0;
  const uid = (p) => (p || 'pjx') + '-' + (++uidN).toString(36);
  /* h('div.cls#id', { attrs }, ...kids): a tiny element builder (PMR.h when it is there) */
  function h(sel, attrs, ...kids) {
    if (W.PMR && W.PMR.h) return W.PMR.h(sel, attrs, ...kids);
    const m = /^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i.exec(sel) || [];
    const el = D.createElement(m[1] || 'div');
    (m[2] || '').replace(/([.#])([\w-]+)/g, (_, k, v) => { if (k === '.') el.classList.add(v); else el.id = v; });
    if (attrs) Object.keys(attrs).forEach((k) => {
      const v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') el.textContent = v; else if (k === 'html') el.innerHTML = v;
      else if (k === 'class') el.className = [].concat(v).filter(Boolean).join(' ');
      else el.setAttribute(k, v === true ? '' : v);
    });
    kids.flat().forEach((c) => { if (c == null || c === false) return; el.appendChild(typeof c === 'string' ? D.createTextNode(c) : c); });
    return el;
  }
  /* a hover label (PMConcept7's hover tag) for anything whose purpose is not written on it */
  function tip(el, label, detail) {
    if (!el) return el;
    if (W.PMR && W.PMR.hover) W.PMR.hover(el, label, detail);
    else { el.setAttribute('title', detail ? label + ' — ' + detail : label); }
    if (!el.getAttribute('aria-label') && !el.textContent.trim()) el.setAttribute('aria-label', label);
    return el;
  }

  /* ------------------------------------------------------------------ the shared status vocabulary
     One mark and one word per state (glyph-system status.json; FinalGUISpec 7.5 precedence: blocked > needs you >
     advisory > activity). key is a PMG status key; tone is its ink family. */
  const STATUS = {
    waiting: { word: 'Needs you', rank: 0 },
    blocked: { word: 'Blocked', rank: 1 },
    failed: { word: 'Failed', rank: 2 },
    offline: { word: "Can't reach", rank: 3 },
    warning: { word: 'Check', rank: 4 },
    recovering: { word: 'Retrying', rank: 5 },
    working: { word: 'Working', rank: 6 },
    reviewing: { word: 'Checking', rank: 7 },
    pending: { word: 'Queued', rank: 8 },
    paused: { word: 'Paused', rank: 9 },
    info: { word: 'Note', rank: 10 },
    complete: { word: 'Up to date', rank: 11 },
    idle: { word: 'Idle', rank: 12 },
    off: { word: 'Not set up', rank: 13 },
    skipped: { word: 'Archived', rank: 14 }
  };
  const statusWord = (key) => (STATUS[key] ? STATUS[key].word : key);

  /* ------------------------------------------------------------------ the demo world */
  const NOW_LABEL = 'just now';
  function demoProjects() {
    return [
      {
        id: 'tastebook', name: 'tastebook', glyph: 'rocket', active: true, lifecycle: 'listed', order: 0,
        stack: ['SvelteKit', 'Rust · Axum', 'Postgres', 'Docker'],
        where: { kind: 'local', label: 'This computer', path: '~/Projects/tastebook' },
        opened: 'Active now', openedRank: 0,
        activity: { key: 'working', word: 'Run #47 · Working', text: 'Compiling the seam graph', at: 'just now', runs: 1 },
        history: { backend: 'git', branch: 'main', worktrees: 4, changed: 3 },
        online: { service: 'GitHub', repo: 'jared/tastebook', state: 'complete', ahead: 0, behind: 0, privacy: 'Only you' },
        backup: { dest: 'Home NAS', schedule: 'Every night', last: '2 h ago', state: 'complete', size: '1.8 GB', versions: 31 },
        sync: { devices: 2, state: 'complete' },
        attention: []
      },
      {
        id: 'harbor', name: 'harbor', glyph: 'ship', active: false, lifecycle: 'listed', order: 1,
        stack: ['Next.js', 'Nest', 'Docker'],
        where: { kind: 'local', label: 'This computer', path: '~/Projects/harbor' },
        opened: '1 h ago', openedRank: 1,
        activity: { key: 'working', word: 'Working in the background', text: '2 agents running tests on lane api', at: '4 min ago', runs: 2 },
        history: { backend: 'git', branch: 'develop', worktrees: 2, changed: 0 },
        online: { service: 'GitLab', repo: 'acme/harbor', state: 'waiting', ahead: 1, behind: 0, privacy: 'Everyone in Acme', note: 'Sign-in expired' },
        backup: { dest: 'Google Drive', schedule: 'Every day', last: 'Yesterday', state: 'complete', size: '640 MB', versions: 12 },
        sync: { devices: 2, state: 'complete' },
        attention: [{ code: 'signed_out', key: 'waiting', title: 'Sign in to GitLab again', text: 'Merge requests and pipelines need it. Sending changes over SSH still works; 1 change is ready to send.', actions: ['sign_in', 'details'] }]
      },
      {
        id: 'loom', name: 'loom', glyph: 'layers', active: false, lifecycle: 'listed', order: 2,
        stack: ['Rust', 'Slint'],
        where: { kind: 'local', label: 'This computer', path: '~/Projects/loom' },
        opened: 'Yesterday', openedRank: 2,
        activity: { key: 'idle', word: 'Idle', text: 'Run #12 finished · all checks passed', at: 'Yesterday', runs: 0 },
        history: { backend: 'jujutsu', branch: 'main', worktrees: 1, changed: 0 },
        online: { service: 'GitHub', repo: 'jared/loom', state: 'info', ahead: 2, behind: 0, privacy: 'Everyone', note: '2 changes not sent yet' },
        backup: { dest: 'Home NAS', schedule: 'Every week', last: '3 days ago', state: 'complete', size: '210 MB', versions: 8 },
        sync: { devices: 1, state: 'complete' },
        attention: []
      },
      {
        id: 'docs-site', name: 'docs-site', glyph: 'globe', active: false, lifecycle: 'listed', order: 3,
        stack: ['Astro', 'TypeScript'],
        where: { kind: 'local', label: 'This computer', path: '~/Projects/docs-site' },
        opened: '2 days ago', openedRank: 3,
        activity: { key: 'idle', word: 'Idle', text: 'Run #31 finished · settings changed since its plan', at: '2 days ago', runs: 0 },
        history: { backend: 'git', branch: 'main', worktrees: 1, changed: 0 },
        online: { service: 'GitHub', repo: 'jared/docs-site', state: 'info', ahead: 0, behind: 3, privacy: 'Everyone', note: '3 newer changes online' },
        backup: { dest: null, schedule: null, last: null, state: 'off', size: null, versions: 0 },
        sync: { devices: 1, state: 'complete' },
        attention: [
          { code: 'not_backed_up', key: 'warning', title: 'Not backed up', text: 'Its history and online copy keep its files, but nothing keeps its plans, chats and settings. Set up a backup.', actions: ['setup_backup'] },
          { code: 'plan_stale', key: 'info', title: 'Plan may be out of date', text: 'Settings changed after Run #31 was planned. Re-planning is suggested.', actions: ['replan'] }
        ]
      },
      {
        id: 'legacy-app', name: 'legacy-app', glyph: 'toolbox', active: false, lifecycle: 'listed', order: 4,
        stack: ['Python', 'Docker'],
        where: { kind: 'local', label: 'This computer', path: '~/Work/legacy-app' },
        opened: '3 days ago', openedRank: 4,
        activity: { key: 'paused', word: 'Paused', text: 'Paused at safe point sp-12 · resume in the Orchestrator', at: '3 days ago', runs: 0 },
        history: { backend: 'git', branch: 'develop', worktrees: 2, changed: 7 },
        online: { service: null, repo: null, state: 'off', ahead: 0, behind: 0 },
        backup: { dest: 'Google Drive', schedule: 'Every day', last: '9 days ago', state: 'warning', size: '2.3 GB', versions: 20, note: 'Last 8 backups didn’t run' },
        sync: { devices: 1, state: 'complete' },
        attention: [{ code: 'backup_overdue', key: 'warning', title: 'Backup is 9 days old', text: 'Daily backups to Google Drive stopped on Oct 21: the drive is full. Free space or choose another place.', actions: ['backup_now', 'backup_settings'] }]
      },
      {
        id: 'experiment', name: 'experiment', glyph: 'telescope', active: false, lifecycle: 'listed', order: 5,
        stack: ['C#', '.NET'],
        where: { kind: 'local', label: 'This computer', path: '/old/path/experiment', missing: true },
        opened: '1 week ago', openedRank: 5,
        activity: { key: 'idle', word: 'Idle', text: 'No work since Oct 22', at: '1 week ago', runs: 0 },
        history: { backend: 'git', branch: 'main', worktrees: 1, changed: null },
        online: { service: 'GitHub', repo: 'jared/experiment', state: 'complete', ahead: 0, behind: 0, privacy: 'Only you', note: 'Last sent Oct 22' },
        backup: { dest: 'Home NAS', schedule: 'Every night', last: '8 days ago', state: 'complete', size: '96 MB', versions: 14, note: 'Last backup before the folder went missing' },
        sync: { devices: 1, state: 'complete' },
        attention: [{ code: 'folder_missing', key: 'blocked', title: 'Folder missing', text: 'Nothing is at /old/path/experiment any more. It may have been moved, renamed, or be on a drive that isn’t connected.', actions: ['repair'] }]
      },
      {
        id: 'garden-notes', name: 'garden-notes', glyph: 'plant', active: false, lifecycle: 'listed', order: 6,
        stack: ['Markdown'],
        where: { kind: 'device', label: 'Home NAS', path: '/mnt/tank/projects/garden-notes', device: 'Home NAS', via: 'SSH' },
        opened: '2 weeks ago', openedRank: 6,
        activity: { key: 'idle', word: 'Idle', text: 'No work since Oct 16', at: '2 weeks ago', runs: 0 },
        history: { backend: 'git', branch: 'main', worktrees: 1, changed: 0 },
        online: { service: null, repo: null, state: 'off', ahead: 0, behind: 0 },
        backup: { dest: 'OneDrive', schedule: 'Every week', last: '5 days ago', state: 'complete', size: '18 MB', versions: 6 },
        sync: { devices: 1, state: 'complete' },
        attention: [{ code: 'device_offline', key: 'offline', title: 'Can’t reach Home NAS', text: 'This Project’s files live on Home NAS, which didn’t answer at 7:42 PM. Its backup on OneDrive is safe.', actions: ['retry', 'details'] }]
      },
      {
        id: 'recipe-app', name: 'recipe-app', glyph: 'seed', active: false, lifecycle: 'recovery', order: 7,
        stack: ['SvelteKit'],
        where: { kind: 'local', label: 'This computer', path: '~/Projects/recipe-app', pending: true },
        opened: 'Today, 6:10 PM', openedRank: 7,
        activity: { key: 'waiting', word: 'Setup didn’t finish', text: 'Stopped at step 2 of 4', at: 'Today, 6:10 PM', runs: 0 },
        history: { backend: 'git', branch: 'main', worktrees: 0, changed: null },
        online: { service: 'GitHub', repo: 'jared/recipe-app', state: 'complete', ahead: 0, behind: 0, privacy: 'Only you', note: 'Created on GitHub' },
        backup: { dest: 'Home NAS', schedule: 'Every night', last: null, state: 'pending', size: null, versions: 0, note: 'Starts after setup' },
        sync: { devices: 0, state: 'pending' },
        attention: [{ code: 'setup_unfinished', key: 'waiting', title: 'Setup didn’t finish', text: 'The GitHub repository jared/recipe-app was created, then copying it to this computer failed (the network dropped). Nothing else was made.', actions: ['resume', 'open_online', 'remove'] }],
        recovery: {
          settled: [{ label: 'Repository created on GitHub', ref: 'jared/recipe-app' }],
          remaining: [{ label: 'Copy it to this computer', cmd: 'cmd.source_control.repository.clone' }, { label: 'Turn on nightly backups to Home NAS', cmd: 'cmd.backup.project.create' }, { label: 'Add it to your Projects', cmd: 'cmd.project.add_existing' }]
        }
      },
      {
        id: 'old-portfolio', name: 'old-portfolio', glyph: 'image', active: false, lifecycle: 'archived', order: 8,
        stack: ['HTML', 'CSS'],
        where: { kind: 'local', label: 'This computer', path: '~/Archive/old-portfolio' },
        opened: 'Aug 2', openedRank: 20, archivedAt: 'Archived Aug 12',
        activity: { key: 'skipped', word: 'Archived', text: 'Archived Aug 12 · files, history and backups kept', at: 'Aug 12', runs: 0 },
        history: { backend: 'git', branch: 'main', worktrees: 1, changed: 0 },
        online: { service: 'GitHub', repo: 'jared/portfolio', state: 'complete', ahead: 0, behind: 0, privacy: 'Everyone' },
        backup: { dest: 'Home NAS', schedule: 'Paused while archived', last: 'Aug 12', state: 'paused', size: '44 MB', versions: 9 },
        sync: { devices: 1, state: 'complete' },
        attention: []
      },
      {
        id: 'hackathon-2025', name: 'hackathon-2025', glyph: 'flame', active: false, lifecycle: 'archived', order: 9,
        stack: ['Go', 'htmx'],
        where: { kind: 'local', label: 'This computer', path: '~/Archive/hackathon-2025' },
        opened: 'Jun 18', openedRank: 21, archivedAt: 'Archived Jun 20',
        activity: { key: 'skipped', word: 'Archived', text: 'Archived Jun 20 · files, history and backups kept', at: 'Jun 20', runs: 0 },
        history: { backend: 'git', branch: 'main', worktrees: 1, changed: 0 },
        online: { service: 'GitHub', repo: 'jared/hackathon-2025', state: 'complete', ahead: 0, behind: 0, privacy: 'Everyone' },
        backup: { dest: null, schedule: null, last: null, state: 'off', size: null, versions: 0 },
        sync: { devices: 1, state: 'complete' },
        attention: []
      }
    ];
  }
  /* 40 projects, to judge search, filters, density and scrolling */
  function manyProjects() {
    const base = demoProjects();
    const words = ['atlas', 'beacon', 'cinder', 'delta', 'ember', 'fable', 'grove', 'harvest', 'iris', 'juniper', 'kite', 'lumen', 'meadow', 'nimbus', 'orbit', 'pebble',
      'quill', 'rivet', 'sable', 'tundra', 'umbra', 'vertex', 'willow', 'xenon', 'yarrow', 'zephyr', 'aurora', 'bramble', 'cobalt', 'dune'];
    const stacks = [['Rust'], ['TypeScript', 'React'], ['Python'], ['Go'], ['SvelteKit', 'Postgres'], ['C#', '.NET'], ['Kotlin'], ['Swift']];
    const glyphs = ['box', 'code', 'package', 'database', 'webpage', 'terminal', 'chart', 'notebook'];
    const acts = [['idle', 'Idle', 'No work this week'], ['complete', 'Up to date', 'Run finished · checks passed'], ['working', 'Working in the background', '1 agent running'], ['paused', 'Paused', 'Paused at a safe point']];
    words.forEach((w, i) => {
      const a = acts[i % acts.length];
      base.push({
        id: w + '-' + (i + 1), name: w, glyph: glyphs[i % glyphs.length], active: false, lifecycle: i % 13 === 12 ? 'archived' : 'listed', order: 10 + i,
        stack: stacks[i % stacks.length], where: { kind: i % 9 === 4 ? 'device' : 'local', label: i % 9 === 4 ? 'Home NAS' : 'This computer', path: (i % 9 === 4 ? '/mnt/tank/projects/' : '~/Projects/') + w, device: i % 9 === 4 ? 'Home NAS' : undefined, via: i % 9 === 4 ? 'SSH' : undefined },
        opened: (i + 3) + ' days ago', openedRank: 8 + i,
        activity: { key: a[0], word: a[1], text: a[2], at: (i + 3) + ' days ago', runs: a[0] === 'working' ? 1 : 0 },
        history: { backend: i % 5 === 2 ? 'jujutsu' : 'git', branch: 'main', worktrees: 1 + (i % 3), changed: i % 4 },
        online: i % 3 === 0 ? { service: null, repo: null, state: 'off' } : { service: i % 2 ? 'GitHub' : 'GitLab', repo: 'jared/' + w, state: 'complete', ahead: 0, behind: 0, privacy: 'Only you' },
        backup: i % 4 === 3 ? { dest: null, state: 'off', versions: 0 } : { dest: i % 2 ? 'Home NAS' : 'Google Drive', schedule: 'Every night', last: (1 + i % 5) + ' days ago', state: i % 11 === 6 ? 'warning' : 'complete', versions: 5 + i },
        sync: { devices: 1, state: 'complete' },
        attention: i % 4 === 3 ? [{ code: 'not_backed_up', key: 'warning', title: 'Not backed up', text: 'Nothing keeps its plans, chats and settings. Set up a backup.', actions: ['setup_backup'] }] : []
      });
    });
    return base;
  }

  /* the places the New Project flow and the repair flow can look: folders, devices, online accounts, backups */
  const ENV = {
    projectsRoot: '~/Projects',
    recentFolders: [
      { path: '~/Code/budget-tracker', name: 'budget-tracker', history: 'git', online: { service: 'GitHub', repo: 'jared/budget-tracker' }, stack: ['Python', 'Flask'] },
      { path: '~/Code/dotfiles', name: 'dotfiles', history: 'git', online: null, stack: ['Shell'] },
      { path: '~/Documents/recipe-ideas', name: 'recipe-ideas', history: null, online: null, stack: ['Markdown'] },
      { path: '~/Desktop/garden notes', name: 'garden notes', history: null, online: null, stack: ['Markdown'] }
    ],
    tree: {
      '~': ['Projects', 'Code', 'Documents', 'Desktop', 'Archive', 'Volumes'],
      '~/Projects': ['tastebook', 'harbor', 'loom', 'docs-site', 'experiment-2'],
      '~/Code': ['budget-tracker', 'dotfiles', 'experiments'],
      '~/Code/experiments': ['experiment', 'scratch'],
      '~/Documents': ['recipe-ideas', 'Taxes 2025'],
      '~/Desktop': ['garden notes'],
      '~/Archive': ['old-portfolio', 'hackathon-2025'],
      '~/Volumes': ['Backup Drive'],
      '~/Volumes/Backup Drive': ['experiment']
    },
    /* folders the repair flow can find: the moved copy is the same project (its history matches the online copy) */
    probes: {
      '~/Code/experiments/experiment': { same: true, history: 'git', branch: 'main', changed: 2, note: 'Same history as jared/experiment on GitHub' },
      '~/Volumes/Backup Drive/experiment': { same: true, history: 'git', branch: 'main', changed: 0, note: 'Same history, 3 changes older than the online copy' },
      '~/Projects/experiment-2': { same: false, history: 'git', branch: 'main', note: 'A different project: its history doesn’t match jared/experiment' }
    },
    devices: [
      { id: 'nas', name: 'Home NAS', address: 'nas.local', user: 'jared', trusted: true, online: false, folders: ['/mnt/tank/projects/garden-notes', '/mnt/tank/projects/photo-sorter', '/mnt/tank/projects/home-automation'] },
      { id: 'studio', name: 'Studio Mac', address: 'studio.local', user: 'jared', trusted: true, online: true, folders: ['~/Developer/lighting-rig', '~/Developer/midi-tools'] }
    ],
    services: [
      { id: 'github', name: 'GitHub', account: 'jared', connected: true },
      { id: 'gitlab', name: 'GitLab', account: 'jared@acme', connected: false },
      { id: 'bitbucket', name: 'Bitbucket', account: null, connected: false },
      { id: 'azure', name: 'Azure DevOps', account: null, connected: false },
      { id: 'gitea', name: 'Gitea or Forgejo', account: null, connected: false },
      { id: 'git', name: 'Any Git address', account: null, connected: true }
    ],
    repos: {
      github: [
        { repo: 'jared/budget-tracker', sub: 'Python · updated 2 days ago', privacy: 'Only you' },
        { repo: 'jared/garden-planner', sub: 'TypeScript · updated last week', privacy: 'Only you' },
        { repo: 'jared/slint-widgets', sub: 'Rust · updated Oct 3', privacy: 'Everyone' },
        { repo: 'acme/harbor-mobile', sub: 'Kotlin · Acme · updated today', privacy: 'Everyone in Acme' }
      ],
      gitlab: [
        { repo: 'acme/billing-service', sub: 'Go · updated yesterday', privacy: 'Everyone in Acme' },
        { repo: 'acme/design-tokens', sub: 'JSON · updated Sep 30', privacy: 'Everyone in Acme' }
      ]
    },
    backups: [
      { id: 'nas', where: 'Home NAS', kind: 'nas', sub: 'Nightly backups of 4 Projects', projects: ['tastebook', 'loom', 'experiment', 'old-portfolio', 'photo-sorter'], latest: 'Today, 3:00 AM' },
      { id: 'gdrive', where: 'Google Drive', kind: 'cloud', sub: 'Daily backups of 2 Projects', projects: ['harbor', 'legacy-app'], latest: 'Yesterday, 11:00 PM' },
      { id: 'kit', where: 'A Recovery Kit file', kind: 'kit', sub: 'The file you saved when you set up backups', projects: [], latest: null },
      { id: 'drive', where: 'A folder or a drive', kind: 'folder', sub: 'Or a drive you plugged in', projects: [], latest: null }
    ],
    templates: [
      { id: 'empty', glyph: 'folder', title: 'Empty folder', sub: 'Nothing in it yet. Plan it in the Planning Wizard.' },
      { id: 'web', glyph: 'webpage', title: 'Web app', sub: 'SvelteKit, with tests and a dev server' },
      { id: 'api', glyph: 'plug', title: 'API service', sub: 'Rust · Axum, with a health check' },
      { id: 'fullstack', glyph: 'stack-services', title: 'Full-stack with Docker', sub: 'Web app, API and Postgres in containers' },
      { id: 'desktop', glyph: 'window', title: 'Desktop app', sub: 'Rust · Slint' },
      { id: 'script', glyph: 'terminal', title: 'Python tool', sub: 'A command-line tool with a test' }
    ],
    serverName: 'Home NAS'
  };

  /* ------------------------------------------------------------------ state, events */
  const S = { opt: 'a', scenario: 'demo', world: null, mounted: null, root: null, ops: {} };
  const listeners = {};
  const on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); return () => { listeners[ev] = listeners[ev].filter((f) => f !== fn); }; };
  const emit = (ev, data) => (listeners[ev] || []).slice().forEach((fn) => { try { fn(data); } catch (e) { console.error('[pjx]', ev, e); } });

  function freshWorld(scenario) {
    ENV.devices.forEach((d) => { d.online = d.id !== 'nas'; });   // Reset demo puts Home NAS back to not answering
    const projects = scenario === 'first' ? [] : scenario === 'many' ? manyProjects() : demoProjects();
    return { projects, removed: [], scenario };
  }
  const all = () => S.world.projects;
  const get = (id) => S.world.projects.find((p) => p.id === id) || null;
  const listed = () => all().filter((p) => p.lifecycle !== 'archived');
  const archived = () => all().filter((p) => p.lifecycle === 'archived');

  /* one primary state per project, by the precedence above: what the card, row, list and title bar all show */
  function primary(p) {
    if (p.lifecycle === 'archived') return { key: 'skipped', word: 'Archived', text: p.archivedAt || 'Archived', source: 'lifecycle' };
    const att = (p.attention || []).slice().sort((a, b) => STATUS[a.key].rank - STATUS[b.key].rank)[0];
    if (att && STATUS[att.key].rank < STATUS.warning.rank) return { key: att.key, word: att.title, text: att.text, source: 'attention', item: att };
    // something the person just started outranks an advisory: they see it working, then the advisory clears or stays
    const op = S.ops[p.id];
    if (op && !op.done) return { key: 'working', word: op.label, text: op.phase || '', source: 'op' };
    if (att && att.key === 'warning') return { key: att.key, word: att.title, text: att.text, source: 'attention', item: att };
    if (p.activity && (p.activity.key === 'working' || p.activity.key === 'paused')) return { key: p.activity.key, word: p.activity.word, text: p.activity.text, source: 'activity' };
    if (att) return { key: att.key, word: att.title, text: att.text, source: 'attention', item: att };
    return { key: p.activity ? p.activity.key : 'idle', word: p.activity ? p.activity.word : 'Idle', text: p.activity ? p.activity.text : '', source: 'activity' };
  }
  /* the Safe line: history, online copy and backup, each as a mark, a word and a sentence */
  function safety(p) {
    const hist = p.history || {};
    const kind = hist.backend === 'jujutsu' ? 'Jujutsu' : hist.backend === 'git' ? 'Git' : hist.backend === 'safe' ? 'Safe History' : null;
    // Jujutsu says bookmark and workspaces; Git says branch and worktrees (SCS-005, JJI-006)
    const jj = hist.backend === 'jujutsu', ref = (jj ? 'bookmark ' : '') + hist.branch, many = jj ? ' workspaces' : ' worktrees';
    const history = kind
      ? { key: 'complete', label: 'History', word: kind, text: kind + ' · ' + ref + (hist.worktrees > 1 ? ' · ' + hist.worktrees + many : '') + (hist.changed ? ' · ' + hist.changed + ' unsaved change' + (hist.changed > 1 ? 's' : '') : ''), short: kind + ' · ' + hist.branch, ref, count: hist.worktrees > 1 ? hist.worktrees + many : '' }
      : { key: 'off', label: 'History', word: 'Off', text: 'No history kept', short: 'Off' };
    const o = p.online || {};
    let online;
    if (!o.service) online = { key: 'off', label: 'Online copy', word: 'None', text: 'No online copy', short: 'None' };
    else {
      const k = o.state || 'complete';
      const tail = o.behind ? o.behind + ' newer online' : o.ahead ? o.ahead + ' to send' : o.note || 'Up to date';
      online = { key: k, label: 'Online copy', word: o.service, text: o.service + ' · ' + o.repo + ' · ' + (o.note || tail), short: o.service + (o.behind ? ' · ' + o.behind + '↓' : o.ahead ? ' · ' + o.ahead + '↑' : ''), tail };
    }
    const b = p.backup || {};
    let backup;
    if (!b.dest) backup = { key: 'off', label: 'Backup', word: 'None', text: 'Not backed up', short: 'None' };
    else {
      const op = S.ops[p.id];
      if (op && op.kind === 'backup' && !op.done) backup = { key: 'working', label: 'Backup', word: b.dest, text: 'Backing up to ' + b.dest + ' · ' + (op.phase || ''), short: 'Backing up…' };
      // the last complete backup is what shows; a failed or late newer attempt is said beside it, never instead (BRS §4.2)
      else backup = { key: b.state || 'complete', label: 'Backup', word: b.dest, text: (b.last ? 'Backed up ' + b.last + ' to ' + b.dest : 'No complete backup yet · ' + b.dest) + (b.state === 'complete' && b.last ? ' · checked' : '') + (b.note ? ' · ' + b.note : b.schedule ? ' · ' + b.schedule.toLowerCase() : ''), short: b.dest + (b.last ? ' · ' + b.last : ''), last: b.last };
    }
    return { history, online, backup };
  }
  const counts = () => {
    const L = listed();
    return {
      all: L.length,
      attention: L.filter((p) => { const k = primary(p).key; return STATUS[k].rank <= STATUS.warning.rank; }).length,
      working: L.filter((p) => primary(p).key === 'working' || (p.activity && p.activity.key === 'working')).length,
      local: L.filter((p) => p.where.kind === 'local').length,
      device: L.filter((p) => p.where.kind !== 'local').length,
      unprotected: L.filter((p) => !p.backup || !p.backup.dest).length,
      archived: archived().length
    };
  };

  /* ------------------------------------------------------------------ toasts, menus, dialogs */
  function toast(title, body, severity, durable) {
    try { if (typeof W.toast === 'function') { W.toast({ title, body: body || '', severity: severity || 'info', page: 'projects', important: !!durable }); return; } } catch (e) { /* fall through */ }
    console.log('[pjx toast]', title, body || '');
  }
  /* PMR.menu in the chat's picker style. items: [{ label, icon, meta, danger, disabled, run }] or groups
     [{ label, items }]; anchor: the button it hangs from */
  function menu(anchor, groups, opts) {
    if (!(W.PMR && W.PMR.menu)) return;
    const gs = Array.isArray(groups) && groups.length && groups[0].items ? groups : [{ items: groups }];
    const map = new Map();
    const m = {
      id: uid('menu'), label: (opts && opts.label) || 'Actions',
      groups: gs.map((g) => ({ label: g.label, items: g.items.filter(Boolean).map((it) => { const id = uid('mi'); map.set(id, it); return { id, label: it.label, icon: it.icon, meta: it.meta, danger: it.danger, disabled: it.disabled, key: it.key }; }) }))
    };
    W.PMR.menu.open(m, anchor, Object.assign({ align: 'end' }, opts || {}, {
      onPick(item) { const it = map.get(item.id); if (it && !it.disabled && typeof it.run === 'function') setTimeout(() => it.run(), 0); }
    }));
  }
  /* a modal dialog in PMConcept7's own sheet material (core.css): { title, kicker, body (node or html), actions:
     [{ label, primary, danger, run, disabled }], wide, onClose }. Returns { el, close, body }. */
  const dialogs = [];
  function dialog(o) {
    // the scrim carries Usage's and Home's token scopes (tokens live on .pmu-shell inside [data-pmu-host]); in Glass the
    // dialog is a dense menu sheet with its own lens layer (Liquid Glass CONTRACT)
    const back = h('div.pjx-dlg-back.pmw-scope', { role: 'presentation', 'data-pmu-host': 'projects-dialog', 'data-concept': S.mounted || '' });
    const shell = h('div.pmu-shell.pjx-dlg-shell');
    const box = h('div.pjx-dlg', { role: 'dialog', 'aria-modal': 'true', 'aria-label': o.title, 'data-wide': o.wide ? 'true' : null, 'data-size': o.size || null, 'data-lg-surface': 'menu', 'data-lg-dense': '', 'data-lg-lens-host': '' });
    const head = h('div.pjx-dlg-head', null,
      h('div.pjx-dlg-titles', null, o.kicker ? h('div.pjx-dlg-kicker', { text: o.kicker }) : null, h('div.pjx-dlg-title', { text: o.title })),
      tip(h('button.pjx-iconbtn.pjx-dlg-x', { type: 'button', html: icon('close', 16) }), 'Close', 'Esc'));
    const body = h('div.pjx-dlg-body');
    if (o.body) { if (typeof o.body === 'string') body.innerHTML = o.body; else body.appendChild(o.body); }
    const foot = h('div.pjx-dlg-foot');
    box.appendChild(head); box.appendChild(body); box.appendChild(foot);
    shell.appendChild(box); back.appendChild(shell);
    // Tab stays inside the dialog
    box.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = Array.from(box.querySelectorAll('button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && D.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && D.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    const prevFocus = D.activeElement;
    const api = { el: box, body, foot, close, setActions };
    function setActions(actions) {
      foot.innerHTML = '';
      (actions || []).forEach((a) => {
        if (a.spacer) { foot.appendChild(h('span.pjx-grow')); return; }
        const b = h('button', { type: 'button', class: ['pjx-btn', a.primary && 'is-primary', a.danger && 'is-danger', a.quiet && 'is-quiet'], 'data-pm-hover-visual-suppressed': a.disabled ? null : 'true', disabled: a.disabled ? true : null, html: (a.icon ? icon(a.icon, 15) : '') + '<span>' + esc(a.label) + '</span>' });
        if (a.disabled && typeof a.disabled === 'string') tip(b, a.label, a.disabled);
        b.addEventListener('click', () => { if (!b.disabled && a.run) a.run(api); });
        foot.appendChild(b);
      });
    }
    function close(why) {
      // forget it first: a scrim removed from outside must not keep swallowing Escape
      const i = dialogs.indexOf(api); if (i >= 0) dialogs.splice(i, 1);
      if (!back.isConnected) return;
      const done = () => { back.remove(); if (prevFocus && prevFocus.isConnected && prevFocus.focus) try { prevFocus.focus({ preventScroll: true }); } catch (e) { /* gone */ } else if (o.returnFocus) o.returnFocus(); if (o.onClose) o.onClose(why); };
      if (reduced()) done();
      else { back.setAttribute('data-leaving', ''); setTimeout(done, stepped() ? 120 : 160); }
    }
    head.querySelector('.pjx-dlg-x').addEventListener('click', () => close('x'));
    back.addEventListener('mousedown', (e) => { if (e.target === back && !o.sticky) close('outside'); });
    setActions(o.actions);
    D.body.appendChild(back);
    dialogs.push(api);
    requestAnimationFrame(() => { back.setAttribute('data-open', ''); const f = box.querySelector('[autofocus], input, .pjx-choice, .pjx-btn.is-primary'); if (f) f.focus({ preventScroll: true }); });
    return api;
  }
  D.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const top = dialogs.filter((d) => d.el.isConnected).pop(); if (!top) return;
    if (D.querySelector('.pmr-menu.is-open')) return;   // the menu closes first
    e.stopPropagation(); top.close('esc');
  }, true);

  /* ------------------------------------------------------------------ owner operations (simulated)
     run(id, kind, label, phases): phases [{ label, ms }]; the project shows the op as working while it runs; the world
     changes in finish(), after the last phase, never before. Progress events: 'op' { id, kind, label, phase, i, n, done }. */
  async function run(id, kind, label, phases, finish, opts) {
    const op = { id, kind, label, phase: phases[0] ? phases[0].label : '', i: 0, n: phases.length, done: false, cmd: opts && opts.cmd };
    S.ops[id] = op; emit('op', op); emit('change', { why: 'op', id });
    for (let i = 0; i < phases.length; i++) {
      op.i = i; op.phase = phases[i].label; emit('op', op);
      await wait(reduced() ? Math.min(250, phases[i].ms || 600) : (phases[i].ms || 600));
      if (phases[i].fail) { op.done = true; op.failed = true; delete S.ops[id]; emit('op', op); emit('change', { why: 'op-failed', id }); if (opts && opts.onFail) opts.onFail(); return false; }
    }
    op.done = true; delete S.ops[id];
    if (finish) finish();
    emit('op', op); emit('change', { why: kind, id });
    return true;
  }
  const dropAttention = (p, code) => { p.attention = (p.attention || []).filter((a) => a.code !== code); };

  /* switching the active project: PMConcept7's own title-bar menu when it knows the project, otherwise its label */
  function setActive(id) {
    all().forEach((p) => { p.active = p.id === id; if (p.active) { p.opened = 'Active now'; p.openedRank = -1; } });
    // onboarding's shell helper: selects it in the title-bar menu (adding it there when the menu doesn't list it yet),
    // sets PM_ACTIVE_PROJECT_ID and the label; the Settings owner follows the menu
    const p = get(id);
    if (W.O55 && W.O55.shell && W.O55.shell.selectProject) W.O55.shell.selectProject(id, p ? p.name : id);
    else { const item = D.querySelector('#projectMenu .pm6-tb-menu-item[data-project="' + id + '"]'); if (item) item.click(); }
    emit('change', { why: 'active', id });
  }

  const ACT = {
    /* cmd.project.open: navigation only; it never pauses work in another project (§4) */
    open(id, opts) {
      const p = get(id); if (!p) return;
      if (p.lifecycle === 'archived') { toast(p.name + ' is archived', 'Unarchive it to open it.', 'info'); return; }
      if (p.where.missing) { emit('need-repair', { id }); return; }
      if (p.attention.some((a) => a.code === 'device_offline')) { toast('Can’t open ' + p.name, 'Home NAS isn’t answering. Its files live there.', 'warn'); return; }
      if (p.lifecycle === 'recovery') { emit('need-resume', { id }); return; }
      setActive(id);
      toast('Opened ' + p.name, p.activity && p.activity.key === 'working' ? 'Its work kept running.' : '', 'success');
      if (!opts || opts.go !== false) setTimeout(() => { if (W.PM_PAGES) W.PM_PAGES.go('dashboard'); }, reduced() ? 0 : 280);
    },
    /* cmd.project.open_settings: Settings owns the values; this routes there with the project chosen */
    settings(id, section) {
      const p = get(id); if (!p) return;
      toast('Settings for ' + p.name, section ? section : 'Project settings, chosen for ' + p.name + '.', 'info');
      if (W.PM_PAGES) W.PM_PAGES.go('settings');
    },
    /* cmd.project.archive / cmd.project.unarchive: reversible; nothing on disk changes */
    async archive(id) {
      const p = get(id); if (!p) return;
      await run(id, 'archive', 'Archiving', [{ label: 'Saving the list', ms: 380 }], () => { p.lifecycle = 'archived'; p.archivedAt = 'Archived today'; p.active = false; p.activity = { key: 'skipped', word: 'Archived', text: 'Archived today · files, history and backups kept', at: 'today' }; }, { cmd: 'cmd.project.archive' });
      toast(p.name + ' archived', 'Its files, history and backups are untouched. Find it under Archived.', 'success');
    },
    async unarchive(id) {
      const p = get(id); if (!p) return;
      await run(id, 'unarchive', 'Restoring to the list', [{ label: 'Saving the list', ms: 380 }], () => { p.lifecycle = 'listed'; p.archivedAt = null; p.activity = { key: 'idle', word: 'Idle', text: 'Back in your list', at: 'just now' }; }, { cmd: 'cmd.project.unarchive' });
      toast(p.name + ' is back in your list', '', 'success');
    },
    /* cmd.project.remove: list-only; Undo puts the same project back (same identity) */
    async remove(id) {
      const p = get(id); if (!p) return;
      await run(id, 'remove', 'Removing from the list', [{ label: 'Saving the list', ms: 320 }], () => {
        S.world.removed.push(p); S.world.projects = all().filter((x) => x !== p);
      }, { cmd: 'cmd.project.remove' });
      toast(p.name + ' removed from the list', 'Nothing was deleted: its folder, history, online copy and backups are still there.', 'success');
    },
    undoRemove(id) {
      const i = S.world.removed.findIndex((p) => p.id === id); if (i < 0) return;
      const p = S.world.removed.splice(i, 1)[0]; S.world.projects.push(p); emit('change', { why: 'undo', id });
    },
    /* cmd.project.delete_data: a separate Storage-owned purge with strong confirmation; in the demo it only removes */
    async deleteData(id) {
      const p = get(id); if (!p) return;
      await run(id, 'delete', 'Deleting', [{ label: 'Checking nothing is holding it', ms: 600 }, { label: 'Deleting Puppet Master’s data', ms: 900 }], () => { S.world.projects = all().filter((x) => x !== p); }, { cmd: 'cmd.project.delete_data' });
      toast('Puppet Master’s data for ' + p.name + ' was deleted', 'Its folder and online copy were not touched.', 'success');
    },
    /* cmd.backup.project.create */
    async backupNow(id) {
      const p = get(id); if (!p || !p.backup.dest) return;
      const ok = await run(id, 'backup', 'Backing up', [{ label: 'Getting ready', ms: 500 }, { label: 'Copying changes', ms: 1300 }, { label: 'Checking the copy', ms: 700 }], () => {
        p.backup.last = NOW_LABEL; p.backup.state = 'complete'; p.backup.note = null; p.backup.versions = (p.backup.versions || 0) + 1; dropAttention(p, 'backup_overdue');
      }, { cmd: 'cmd.backup.project.create' });
      if (ok) toast(p.name + ' is backed up', p.backup.dest + ' · checked just now', 'success');
    },
    /* cmd.backup.open_history (Backup owns the history view) */
    backupHistory(id) { const p = get(id); if (p) toast('Backup history for ' + p.name, 'Opens Backup’s history, filtered to ' + p.name + '.', 'info'); },
    /* sets up a backup: Backup/Restore owns the destination; the demo picks the suggested place */
    async setupBackup(id, dest) {
      const p = get(id); if (!p) return;
      const where = dest || 'Home NAS';
      await run(id, 'backup', 'Setting up backups', [{ label: 'Checking ' + where, ms: 600 }, { label: 'First backup', ms: 1400 }, { label: 'Checking the copy', ms: 600 }], () => {
        p.backup = { dest: where, schedule: 'Every night', last: NOW_LABEL, state: 'complete', size: '120 MB', versions: 1 }; dropAttention(p, 'not_backed_up');
      }, { cmd: 'cmd.backup.project.create' });
      toast(p.name + ' is backed up', where + ' · every night', 'success');
    },
    /* Source Control routes: get latest (pull), send changes (push), sign in again */
    async getLatest(id) {
      const p = get(id); if (!p) return;
      await run(id, 'sync', 'Getting the latest', [{ label: 'Asking ' + p.online.service, ms: 500 }, { label: 'Bringing in ' + p.online.behind + ' changes', ms: 900 }], () => { p.online.behind = 0; p.online.state = 'complete'; p.online.note = 'Up to date'; }, { cmd: p.history.backend === 'jujutsu' ? 'cmd.jujutsu.git.fetch' : 'cmd.source_control.remote.sync' });
      toast(p.name + ' is up to date with ' + p.online.service, '', 'success');
    },
    async send(id) {
      const p = get(id); if (!p) return;
      await run(id, 'sync', 'Sending changes', [{ label: 'Sending ' + p.online.ahead + ' change' + (p.online.ahead > 1 ? 's' : ''), ms: 900 }], () => { p.online.ahead = 0; p.online.state = 'complete'; p.online.note = 'Up to date'; }, { cmd: p.history.backend === 'jujutsu' ? 'cmd.jujutsu.git.push' : 'cmd.source_control.remote.publish' });
      toast('Sent to ' + p.online.service, p.online.repo + ' is up to date', 'success');
    },
    async signIn(id) {
      const p = get(id); if (!p) return;
      await run(id, 'signin', 'Signing in', [{ label: 'Waiting for you in your browser…', ms: 1400 }, { label: 'Signed in as jared@acme', ms: 500 }], () => { p.online.state = p.online.ahead ? 'info' : 'complete'; p.online.note = p.online.ahead ? p.online.ahead + ' change to send' : 'Up to date'; dropAttention(p, 'signed_out'); }, { cmd: 'cmd.forge.connection.reauthorize' });
      toast('Signed in to ' + p.online.service, 'The online copy can be updated again.', 'success');
    },
    /* cmd.project.source_location.test, then cmd.project.source_location.update: the repair */
    async testFolder(id, path) {
      const probe = ENV.probes[path] || { same: false, history: null, note: 'No project history here' };
      await wait(reduced() ? 200 : 700);
      return Object.assign({ path }, probe);
    },
    async relocate(id, path) {
      const p = get(id); if (!p) return;
      await run(id, 'relocate', 'Updating the folder', [{ label: 'Checking it is the same project', ms: 600 }, { label: 'Saving the new place', ms: 500 }], () => {
        p.where = Object.assign({}, p.where, { path, missing: false }); p.history.changed = (ENV.probes[path] && ENV.probes[path].changed) || 0;
        dropAttention(p, 'folder_missing'); p.activity = { key: 'idle', word: 'Idle', text: 'Found at ' + path, at: 'just now' };
      }, { cmd: 'cmd.project.source_location.update' });
      toast(p.name + ' found', 'Now at ' + path + '. Nothing else changed.', 'success');
    },
    /* the online copy, fetched again into a new folder (Source Control clone, then the location update) */
    async cloneAgain(id, path) {
      const p = get(id); if (!p) return;
      const where = path || ENV.projectsRoot + '/' + p.name;
      await run(id, 'relocate', 'Getting a fresh copy', [{ label: 'Copying from ' + p.online.service, ms: 1200 }, { label: 'Checking it is the same project', ms: 500 }, { label: 'Saving the new place', ms: 400 }], () => {
        p.where = Object.assign({}, p.where, { path: where, missing: false }); p.history.changed = 0;
        dropAttention(p, 'folder_missing'); p.activity = { key: 'idle', word: 'Idle', text: 'Copied again from ' + p.online.service, at: 'just now' };
      }, { cmd: 'cmd.source_control.repository.clone' });
      toast(p.name + ' is back', 'A fresh copy from ' + p.online.service + ' is at ' + where + '.', 'success');
    },
    /* cmd.restore.preview, then the restore of the same project (Backup/Restore owns it) */
    async restoreSame(id, path) {
      const p = get(id); if (!p) return;
      const where = path || ENV.projectsRoot + '/' + p.name;
      await run(id, 'restore', 'Restoring from backup', [{ label: 'Getting the backup from ' + p.backup.dest, ms: 900 }, { label: 'Checking it is complete', ms: 600 }, { label: 'Putting the files back', ms: 900 }], () => {
        p.where = Object.assign({}, p.where, { path: where, missing: false }); p.history.changed = 0;
        dropAttention(p, 'folder_missing'); p.activity = { key: 'idle', word: 'Idle', text: 'Restored from the ' + p.backup.last + ' backup', at: 'just now' };
      }, { cmd: 'cmd.restore.preview' });
      toast(p.name + ' restored', 'From the backup of ' + p.backup.last + ', at ' + where + '.', 'success');
    },
    /* a device that didn't answer: test the location again */
    async retry(id) {
      const p = get(id); if (!p) return;
      await run(id, 'retry', 'Trying again', [{ label: 'Calling ' + (p.where.device || 'the device'), ms: 1100 }], () => {
        dropAttention(p, 'device_offline'); p.activity = { key: 'idle', word: 'Idle', text: (p.where.device || 'The device') + ' answered', at: 'just now' };
        const dv = ENV.devices.find((x) => x.name === p.where.device); if (dv) dv.online = true;
      }, { cmd: 'cmd.project.source_location.test' });
      toast((p.where.device || 'The device') + ' answered', p.name + ' can be opened again.', 'success');
    },
    /* cmd.project.resume_creation: only the steps that didn't happen; the GitHub repository is never made twice */
    async resume(id) {
      const p = get(id); if (!p || !p.recovery) return;
      const phases = p.recovery.remaining.map((r) => ({ label: r.label, ms: 900 }));
      await run(id, 'resume', 'Finishing setup', phases, () => {
        p.lifecycle = 'listed'; p.where.pending = false; p.history.worktrees = 1; p.history.changed = 0;
        p.backup.state = 'complete'; p.backup.last = NOW_LABEL; p.backup.versions = 1; p.backup.note = null; p.sync.state = 'complete';
        p.attention = []; p.recovery = null; p.activity = { key: 'idle', word: 'Ready', text: 'Ready to plan in the Planning Wizard', at: 'just now' };
      }, { cmd: 'cmd.project.resume_creation' });
      toast(p.name + ' is ready', 'Setup finished without making a second repository.', 'success');
    },
    openOnline(id) { const p = get(id); if (p && p.online.repo) toast('Opening ' + p.online.repo, 'In your browser, on ' + p.online.service + '.', 'info'); },
    replan(id) { const p = get(id); if (!p) return; toast('Planning Wizard', 'Re-planning ' + p.name + ' from its current settings.', 'info'); if (W.PM_PAGES) W.PM_PAGES.go('wizard'); },
    orchestrator(id) { const p = get(id); if (!p) return; if (W.PM_PAGES) W.PM_PAGES.go('orchestrator'); },
    reveal(id) { const p = get(id); if (p) toast('Shown in your file manager', p.where.path, 'info'); },
    copyPath(id) { const p = get(id); if (!p) return; try { W.navigator.clipboard.writeText(p.where.path); } catch (e) { /* no clipboard */ } toast('Path copied', p.where.path, 'success'); },
    rename(id, name) { const p = get(id); if (!p || !name) return; p.name = name; emit('change', { why: 'rename', id }); toast('Renamed to ' + name, 'Only the name changed. Its folder and history are the same.', 'success'); },
    /* the project created by the New Project flow (flow.js calls this with the reviewed draft) */
    add(p) { S.world.projects.push(p); emit('change', { why: 'add', id: p.id }); }
  };

  /* what each attention action is called and does: concepts draw buttons from this so the words match everywhere */
  const ACTIONS = {
    repair: { label: 'Fix…', icon: 'folder-search', run: (id) => emit('need-repair', { id }) },
    sign_in: { label: 'Sign in', icon: 'key', run: (id) => ACT.signIn(id) },
    details: { label: 'Details', icon: 'info', run: (id) => emit('need-details', { id }) },
    setup_backup: { label: 'Set up backup', icon: 'safe', run: (id) => ACT.setupBackup(id) },
    replan: { label: 'Re-plan', icon: 'plan', run: (id) => ACT.replan(id) },
    backup_now: { label: 'Back up now', icon: 'upload', run: (id) => ACT.backupNow(id) },
    backup_settings: { label: 'Change where', icon: 'settings', run: (id) => ACT.settings(id, 'Backup · where and when') },
    retry: { label: 'Try again', icon: 'refresh', run: (id) => ACT.retry(id) },
    resume: { label: 'Continue setup', icon: 'play', run: (id) => emit('need-resume', { id }) },
    open_online: { label: 'Open on GitHub', icon: 'globe', run: (id) => ACT.openOnline(id) },
    remove: { label: 'Remove from list', icon: 'close', run: (id) => ACT.remove(id) }
  };

  /* the More menu every concept offers on a project: the same items in the same order, all labelled */
  function moreItems(p, extra) {
    const s = safety(p), live = p.activity && p.activity.key === 'working';
    /* short enough to show whole in the chat menu (about 12 rows): the rest lives in the project's details */
    const g1 = { items: [
      p.lifecycle === 'archived' ? null : { label: 'Open', icon: 'open', meta: p.active ? 'Already open' : '', disabled: p.active ? 'It is the open project' : null, run: () => ACT.open(p.id) },
      { label: 'Project settings', icon: 'settings', run: () => ACT.settings(p.id) },
      { label: 'Rename…', icon: 'edit', run: () => emit('need-rename', { id: p.id }) }
    ] };
    const g2 = { label: 'Keep it safe', items: [
      p.backup.dest ? { label: 'Back up now', icon: 'upload', meta: s.backup.last ? 'Last ' + s.backup.last : '', run: () => ACT.backupNow(p.id) } : { label: 'Set up backup…', icon: 'safe', run: () => ACT.setupBackup(p.id) },
      p.online.service && p.online.behind ? { label: 'Get the latest', icon: 'download', meta: p.online.behind + ' newer', run: () => ACT.getLatest(p.id) } : null,
      p.online.service && p.online.ahead && p.online.state !== 'waiting' ? { label: 'Send changes', icon: 'upload', meta: p.online.ahead + ' to send', run: () => ACT.send(p.id) } : null,
      p.online.service ? { label: 'Open on ' + p.online.service, icon: 'globe', run: () => ACT.openOnline(p.id) } : null
    ] };
    const g3 = { label: 'Where it lives', items: [
      { label: 'Show in file manager', icon: 'folder', disabled: p.where.missing ? 'The folder is missing' : null, run: () => ACT.reveal(p.id) },
      { label: p.where.missing ? 'Find the folder…' : 'Move or change folder…', icon: 'folder-search', run: () => emit('need-repair', { id: p.id, move: !p.where.missing }) },
      { label: 'New project like this…', icon: 'folder-plus', run: () => emit('need-new', { like: p.id }) }
    ] };
    /* Delete data is never in this menu: it is never next to, or worded like, Remove (Project_System §4). It lives in
       the project's details, under its own heading, behind Storage's confirmation (deleteItem below). */
    const g4 = { items: [
      p.lifecycle === 'archived'
        ? { label: 'Unarchive', icon: 'reset', meta: 'Back to your list', run: () => ACT.unarchive(p.id) }
        : { label: 'Archive', icon: 'archive', meta: 'Hide it, keep everything', disabled: live ? 'Work is running in it' : null, run: () => ACT.archive(p.id) },
      { label: 'Remove from list…', icon: 'close', meta: 'Deletes nothing', disabled: live ? 'Work is running in it' : null, run: () => emit('need-remove', { id: p.id }) }
    ] };
    return [g1, g2, g3].concat(extra || []).concat([g4]);
  }
  /* for a details view's separate danger section */
  function deleteItem(p) {
    const live = p.activity && p.activity.key === 'working';
    return { label: 'Delete Puppet Master’s data…', icon: 'trash', danger: true, disabled: live ? 'Work is running in it' : null, run: () => emit('need-delete', { id: p.id }), say: 'Deletes this Project’s plans, chats, notes and settings kept by Puppet Master. Its folder, history, online copy and backups are not touched.' };
  }

  /* ------------------------------------------------------------------ mounting */
  const CONCEPTS = {};
  function concept(id, def) { CONCEPTS[id] = def; if (S.opt === id && S.world) mount(id); }
  function panel() { return D.getElementById('panel-projects'); }
  function unmount() {
    const cur = S.mounted && CONCEPTS[S.mounted];
    if (cur && cur.unmount) { try { cur.unmount(); } catch (e) { console.error('[pjx] unmount', e); } }
    if (S.root) S.root.remove();
    if (S.unhandle) { S.unhandle(); S.unhandle = null; }
    S.root = null; S.mounted = null;
    dialogs.slice().forEach((d) => d.close('switch'));
    H.removeAttribute('data-pjx');
  }
  /* while the Projects page shows, PMConcept7's title-bar notes take no pointer, so they never block the page's head
     (Usage does the same for its page) */
  function pageFlag() { D.body.classList.toggle('pjx-page-active', !!S.mounted && !!W.PM_PAGES && W.PM_PAGES.current === 'projects'); }
  if (W.PM_PAGES && typeof W.PM_PAGES.go === 'function' && !W.PM_PAGES.go.pjxWrapped) {
    const go = W.PM_PAGES.go;
    W.PM_PAGES.go = function () { const r = go.apply(this, arguments); setTimeout(pageFlag, 0); return r; };
    W.PM_PAGES.go.pjxWrapped = true;
  }
  function mount(id) {
    unmount();
    setTimeout(pageFlag, 0);
    if (id === 'before' || !CONCEPTS[id]) { S.opt = id; report('state'); return; }
    const pnl = panel(); if (!pnl) return;
    H.setAttribute('data-pjx', id);
    // Usage's rules and tokens reach [data-pmu-host] .pmu-shell, Home's reach .pmw-scope; each concept adds its own .pmu-shell
    S.root = h('div.pjx-root.pmw-scope', { 'data-concept': id, 'data-scenario': S.scenario, 'data-pmu-host': 'projects' });
    pnl.appendChild(S.root);
    S.mounted = id; S.opt = id;
    // the shared dialogs answer need-repair, need-resume, need-remove, need-delete, need-rename, need-new and
    // need-details unless the concept's onRepair / onResume returns true (it showed its own)
    if (W.PJX.parts) S.unhandle = W.PJX.parts.handle(CONCEPTS[id]);
    try { CONCEPTS[id].mount(S.root); } catch (e) { console.error('[pjx] mount', id, e); }
    report('state');
  }
  function rerender() { const c = S.mounted && CONCEPTS[S.mounted]; if (c && c.render) { try { c.render(); } catch (e) { console.error('[pjx] render', e); } } }
  on('change', () => rerender());

  /* host-facing actions from the review strip */
  function act(name) {
    const c = S.mounted && CONCEPTS[S.mounted]; if (!c) return;
    if (W.PM_PAGES && W.PM_PAGES.current !== 'projects') W.PM_PAGES.go('projects');
    setTimeout(() => {
      if (name === 'new' && c.openNew) c.openNew({});
      else if (name === 'missing') { const p = get('experiment'); if (p && p.where.missing) emit('need-repair', { id: 'experiment' }); else toast('The demo’s missing folder is already fixed', 'Reset the demo to see it again.', 'info'); }
      else if (name === 'unfinished') { const p = get('recipe-app'); if (p && p.recovery) emit('need-resume', { id: 'recipe-app' }); else toast('The demo’s unfinished setup is already done', 'Reset the demo to see it again.', 'info'); }
      else if (name === 'reset') { S.world = freshWorld(S.scenario); mount(S.mounted); }
    }, 60);
  }

  /* ------------------------------------------------------------------ looks (through PMConcept7's own theme menu) */
  async function setLook(id) {
    const nier = /^nier-/.test(id), mode = /-light$/.test(id) ? 'light' : 'dark', fam = nier ? 'basic' : id.split('-')[0];
    const tb = D.getElementById('themeSelect'); if (!tb) return;
    const open = async () => { if (tb.getAttribute('aria-expanded') !== 'true') { tb.click(); await wait(90); } };
    const pick = async (sel) => { await open(); const b = D.querySelector(sel); if (b && b.getAttribute('aria-checked') !== 'true') { b.click(); await wait(160); } };
    const nierOn = () => !!(W.PM_NIER && W.PM_NIER.on && W.PM_NIER.on());
    const flipNier = async () => { await open(); const t = D.querySelector('#themeMenu [data-o55-nier-tt="toggle"]'); if (t) { t.click(); await wait(220); } };
    if (!nier && nierOn()) await flipNier();
    await pick(`#themeMenu .pm6-tt-family[data-family="${fam}"]`);
    await pick(`#themeMenu .pm6-tt-mode[data-mode-value="${mode}"]`);
    if (nier && !nierOn()) await flipNier();
    D.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await wait(160);
    // Retro and NieR keep the menu open on Escape now and then: close it with its own button
    if (tb.getAttribute('aria-expanded') === 'true') { tb.click(); await wait(120); }
    rerender();
  }

  /* ------------------------------------------------------------------ messages from index.html */
  function report(type) { if (W.parent !== W) { try { W.parent.postMessage({ source: 'pjx', type, state: { opt: S.opt, scenario: S.scenario, look: look() } }, '*'); } catch (e) { /* no parent */ } } }
  function config(c) {
    const scen = c.scenario && c.scenario !== S.scenario;
    if (scen) { S.scenario = c.scenario; S.world = freshWorld(S.scenario); }
    const opt = c.opt || S.opt;
    if (W.PM_PAGES && W.PM_PAGES.current !== 'projects') W.PM_PAGES.go('projects');
    if (opt !== S.mounted || scen) mount(opt); else report('state');
  }
  W.addEventListener('message', async (ev) => {
    const m = ev.data;
    if (!m || m.source !== 'pjx-host' || ev.source !== W.parent) return;
    if (m.cmd === 'hello') report('ready');
    else if (m.cmd === 'config') config(m);
    else if (m.cmd === 'look') { await setLook(m.look); report('look-done'); }
    else if (m.cmd === 'act') act(m.act);
    else if (m.cmd === 'motion') { if (m.reduced) H.setAttribute('data-motion', 'reduced'); else if (H.getAttribute('data-motion') === 'reduced') H.removeAttribute('data-motion'); rerender(); }
  });
  // 1 to 3 pick a concept and 0 shows today's page, here too (never while typing, never with a modifier, never in a dialog)
  D.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented || dialogs.length) return;
    const t = e.target, tag = (t && t.tagName) || '';
    if (/input|select|textarea/i.test(tag) || (t && t.isContentEditable)) return;
    const map = { 1: 'a', 2: 'b', 3: 'c', 0: 'before' };
    if (map[e.key] && W.PM_PAGES && W.PM_PAGES.current === 'projects') { config({ opt: map[e.key] }); }
  });

  S.world = freshWorld(S.scenario);
  W.PJX = {
    version: 1, S, ENV, STATUS, ACT, ACTIONS,
    h, esc, icon, mark, calm, tip, wait, uid, reduced, stepped, look,
    on, emit, toast, menu, dialog, run,
    all, get, listed, archived, primary, safety, counts, statusWord, moreItems, deleteItem, setActive,
    concept, mount, unmount, rerender, config, setLook, report, act
  };
})(window);
