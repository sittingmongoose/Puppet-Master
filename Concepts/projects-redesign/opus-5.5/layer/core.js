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
        id: 'tastebook', name: 'tastebook', glyph: 'rocket', active: true, lifecycle: 'listed', order: 0, runsOn: 'here',
        home: 'here', work: { mode: 'auto', allowed: ['here', 'homenas', 'studio'] }, workers: [{ c: 'here', task: 'Run #47 · Compiling the seam graph', mode: 'auto' }, { c: 'homenas', task: 'Lane web · running its tests', mode: 'auto' }, { c: 'studio', task: 'Rendering the recipe photos', mode: 'chosen', by: 'Jared', why: 'needs the GPU' }, { c: null, task: 'Lane docs · build the site', mode: 'auto', queued: true }],
        stack: ['SvelteKit', 'Rust · Axum', 'Postgres', 'Docker'],
        where: { kind: 'local', label: 'This computer', path: '~/Projects/tastebook' },
        opened: 'Active now', openedRank: 0,
        activity: { key: 'working', word: 'Run #47 · Working', text: 'Compiling the seam graph', at: 'just now', runs: 1 },
        history: { backend: 'git', branch: 'main', worktrees: 4, changed: 3 },
        online: { service: 'GitHub', repo: 'jared/tastebook', state: 'complete', ahead: 0, behind: 0, privacy: 'Only you' },
        backup: { dest: 'Home NAS', place: '/volume1/backups/puppet-master/tastebook on Home NAS', schedule: 'Every night', time: '3:00 AM', last: '2 h ago', state: 'complete', size: '1.8 GB', versions: 31, include: 'all', keep: 'standard', kit: { saved: 'Sep 14', checked: 'Oct 30' }, checked: 'Oct 30', checkedOf: 'Oct 30, 3:00 AM' },
        sync: { devices: 2, state: 'complete' },
        attention: []
      },
      {
        id: 'harbor', name: 'harbor', glyph: 'ship', active: false, lifecycle: 'listed', order: 1, runsOn: 'here',
        home: 'here', work: { mode: 'auto', allowed: ['here', 'homenas'] }, workers: [{ c: 'homenas', task: '2 agents · tests on lane api', mode: 'auto' }],
        stack: ['Next.js', 'Nest', 'Docker'],
        where: { kind: 'local', label: 'This computer', path: '~/Projects/harbor' },
        opened: '1 h ago', openedRank: 1,
        activity: { key: 'working', word: 'Working in the background', text: '2 agents running tests on lane api', at: '4 min ago', runs: 2 },
        history: { backend: 'git', branch: 'develop', worktrees: 2, changed: 0 },
        online: { service: 'GitLab', repo: 'acme/harbor', state: 'waiting', ahead: 1, behind: 0, privacy: 'Everyone in Acme', note: 'Sign-in expired' },
        backup: { dest: 'Google Drive', place: 'Google Drive · jared@gmail.com · My Drive › Puppet Master', schedule: 'Every day', time: '11:00 PM', last: 'Yesterday', state: 'complete', size: '640 MB', versions: 12, include: 'all', keep: 'standard', kit: { saved: 'Aug 30', checked: 'Aug 30' }, checked: 'Oct 29', checkedOf: 'Oct 28, 11:00 PM' },
        sync: { devices: 2, state: 'complete' },
        attention: [{ code: 'signed_out', key: 'waiting', title: 'Sign in to GitLab again', text: 'Merge requests and pipelines need it. Sending changes over SSH still works; 1 change is ready to send.', actions: ['sign_in', 'details'] }]
      },
      {
        id: 'loom', name: 'loom', glyph: 'layers', active: false, lifecycle: 'listed', order: 2, runsOn: 'studio',
        home: 'here', work: { mode: 'chosen', by: 'Jared', allowed: ['here', 'studio'] }, workers: [],
        stack: ['Rust', 'Slint'],
        where: { kind: 'local', label: 'This computer', path: '~/Projects/loom' },
        opened: 'Yesterday', openedRank: 2,
        activity: { key: 'idle', word: 'Idle', text: 'Run #12 finished · all checks passed', at: 'Yesterday', runs: 0 },
        history: { backend: 'jujutsu', branch: 'main', worktrees: 1, changed: 0 },
        online: { service: 'GitHub', repo: 'jared/loom', state: 'info', ahead: 2, behind: 0, privacy: 'Everyone', note: '2 changes not sent yet' },
        backup: { dest: 'Home NAS', place: '/volume1/backups/puppet-master/loom on Home NAS', schedule: 'Every week', time: '3:00 AM', last: '3 days ago', state: 'complete', size: '210 MB', versions: 8, include: 'all', keep: 'standard', kit: { saved: 'Sep 14', checked: 'Sep 14' }, checked: 'Oct 28', checkedOf: 'Oct 28, 3:00 AM' },
        sync: { devices: 1, state: 'complete' },
        attention: []
      },
      {
        id: 'docs-site', name: 'docs-site', glyph: 'globe', active: false, lifecycle: 'listed', order: 3, runsOn: 'here',
        home: 'here', work: { mode: 'auto', allowed: ['here', 'homenas'] }, workers: [],
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
        id: 'legacy-app', name: 'legacy-app', glyph: 'toolbox', active: false, lifecycle: 'listed', order: 4, runsOn: 'here',
        home: 'here', work: { mode: 'auto', allowed: ['here'] }, workers: [],
        stack: ['Python', 'Docker'],
        where: { kind: 'local', label: 'This computer', path: '~/Work/legacy-app' },
        opened: '3 days ago', openedRank: 4,
        activity: { key: 'paused', word: 'Paused', text: 'Paused at safe point sp-12 · resume in the Orchestrator', at: '3 days ago', runs: 0 },
        history: { backend: 'git', branch: 'develop', worktrees: 2, changed: 7 },
        online: { service: null, repo: null, state: 'off', ahead: 0, behind: 0, found: { service: 'GitLab', repo: 'acme/legacy-app', remote: 'origin' } },
        backup: { dest: 'Google Drive', place: 'Google Drive · jared@gmail.com · My Drive › Puppet Master', schedule: 'Every day', time: '11:00 PM', last: '9 days ago', state: 'warning', size: '2.3 GB', versions: 20, note: 'Last 8 backups didn’t run', include: 'all', keep: 'standard', kit: { saved: 'Aug 30', checked: null }, checked: 'Oct 21', checkedOf: 'Oct 21, 11:00 PM' },
        sync: { devices: 1, state: 'complete' },
        attention: [{ code: 'backup_overdue', key: 'warning', title: 'Backup is 9 days old', text: 'Daily backups to Google Drive stopped on Oct 21: the drive is full. Free space or choose another place.', actions: ['backup_now', 'backup_settings'] }]
      },
      {
        id: 'experiment', name: 'experiment', glyph: 'telescope', active: false, lifecycle: 'listed', order: 5, runsOn: 'here',
        home: 'here', work: { mode: 'auto', allowed: ['here'] }, workers: [],
        stack: ['C#', '.NET'],
        where: { kind: 'local', label: 'This computer', path: '/old/path/experiment', missing: true },
        opened: '1 week ago', openedRank: 5,
        activity: { key: 'idle', word: 'Idle', text: 'No work since Oct 22', at: '1 week ago', runs: 0 },
        history: { backend: 'git', branch: 'main', worktrees: 1, changed: null },
        online: { service: 'GitHub', repo: 'jared/experiment', state: 'complete', ahead: 0, behind: 0, privacy: 'Only you', note: 'Last sent Oct 22' },
        backup: { dest: 'Home NAS', place: '/volume1/backups/puppet-master/experiment on Home NAS', schedule: 'Every night', time: '3:00 AM', last: '8 days ago', state: 'complete', size: '96 MB', versions: 14, note: 'Last backup before the folder went missing', include: 'all', keep: 'standard', kit: { saved: 'Sep 14', checked: 'Sep 14' }, checked: 'Oct 22', checkedOf: 'Oct 22, 3:00 AM' },
        sync: { devices: 1, state: 'complete' },
        attention: [{ code: 'folder_missing', key: 'blocked', title: 'Folder missing', text: 'Nothing is at /old/path/experiment any more. It may have been moved, renamed, or be on a drive that isn’t connected.', actions: ['repair'] }]
      },
      {
        id: 'garden-notes', name: 'garden-notes', glyph: 'plant', active: false, lifecycle: 'listed', order: 6, runsOn: 'here',
        home: 'here', work: { mode: 'auto', allowed: ['here'] }, workers: [],
        stack: ['Markdown'],
        where: { kind: 'device', label: 'Media server', path: '/mnt/tank/projects/garden-notes', device: 'Media server', via: 'NFS' },
        opened: '2 weeks ago', openedRank: 6,
        activity: { key: 'idle', word: 'Idle', text: 'No work since Oct 16', at: '2 weeks ago', runs: 0 },
        history: { backend: 'git', branch: 'main', worktrees: 1, changed: 0 },
        online: { service: null, repo: null, state: 'off', ahead: 0, behind: 0 },
        backup: { dest: 'OneDrive', place: 'OneDrive · jared@outlook.com · Apps › Puppet Master', schedule: 'Every week', time: '2:00 AM', last: '5 days ago', state: 'complete', size: '18 MB', versions: 6, include: 'all', keep: 'standard', kit: { saved: 'Oct 2', checked: 'Oct 2' }, checked: 'Oct 27', checkedOf: 'Oct 27, 2:00 AM' },
        sync: { devices: 1, state: 'complete' },
        attention: [{ code: 'device_offline', key: 'offline', title: 'Can’t reach Media server', text: 'This Project’s files live on Media server, which didn’t answer at 7:42 PM. Its backup on OneDrive is safe.', actions: ['retry', 'details'] }]
      },
      {
        id: 'recipe-app', name: 'recipe-app', glyph: 'seed', active: false, lifecycle: 'recovery', order: 7, runsOn: 'here',
        home: 'here', work: { mode: 'auto', allowed: ['here'] }, workers: [],
        stack: ['SvelteKit'],
        where: { kind: 'local', label: 'This computer', path: '~/Projects/recipe-app', pending: true },
        opened: 'Today, 6:10 PM', openedRank: 7,
        activity: { key: 'waiting', word: 'Setup didn’t finish', text: 'Stopped at step 2 of 4', at: 'Today, 6:10 PM', runs: 0 },
        history: { backend: 'git', branch: 'main', worktrees: 0, changed: null },
        online: { service: 'GitHub', repo: 'jared/recipe-app', state: 'complete', ahead: 0, behind: 0, privacy: 'Only you', note: 'Created on GitHub' },
        backup: { dest: 'Home NAS', family: 'local_nas', place: '/volume1/backups/puppet-master/recipe-app on Home NAS', schedule: 'Every day', time: '2:00 AM', mode: 'daily', include: 'all', keep: 'standard', last: null, state: 'pending', size: null, versions: 0, kit: null, note: 'Starts after setup' },
        sync: { devices: 0, state: 'pending' },
        attention: [{ code: 'setup_unfinished', key: 'waiting', title: 'Setup didn’t finish', text: 'The GitHub repository jared/recipe-app was created, then copying it to this computer failed (the network dropped). Nothing else was made.', actions: ['resume', 'open_online', 'remove'] }],
        recovery: {
          settled: [{ label: 'Repository created on GitHub', ref: 'jared/recipe-app' }],
          remaining: [{ label: 'Copy it to this computer', cmd: 'cmd.source_control.repository.clone' }, { label: 'Save the backup plan for Home NAS', cmd: 'cmd.backup.destination.add' }, { label: 'Add it to your Projects', cmd: 'cmd.project.add_existing' }]
        }
      },
      {
        id: 'photo-sorter', name: 'photo-sorter', glyph: 'image', active: false, lifecycle: 'listed', order: 8, runsOn: 'homenas',
        home: 'homenas', work: { mode: 'auto', allowed: ['homenas', 'here'] }, workers: [],
        stack: ['Python'],
        where: { kind: 'device', label: 'Home NAS', path: '/volume1/projects/photo-sorter', device: 'Home NAS', via: 'Puppet Master' },
        opened: '4 days ago', openedRank: 4.5,
        activity: { key: 'idle', word: 'Idle', text: 'Run #6 finished · your change is on the branch my-change', at: '4 days ago', runs: 0 },
        history: { backend: 'git', branch: 'main', worktrees: 1, changed: 3 },
        online: { service: 'GitHub', repo: 'jared/photo-sorter', state: 'info', ahead: 0, behind: 0, privacy: 'Everyone', upstream: { service: 'GitHub', repo: 'openphoto/photo-sorter', behind: 4, branch: 'my-change', remote: 'upstream' }, note: '4 newer in the original' },
        backup: { dest: 'Google Drive', place: 'Google Drive · jared@gmail.com · My Drive › Puppet Master', schedule: 'Every day', time: '2:00 AM', last: 'Today, 2:00 AM', state: 'complete', include: 'all', keep: 'standard', kit: { saved: 'Oct 2', checked: 'Oct 2' }, checked: 'Oct 30', checkedOf: 'Oct 30, 2:00 AM', versions: 21, size: '310 MB' },
        sync: { devices: 2, state: 'complete' },
        attention: [{ code: 'original_newer', key: 'info', title: '4 newer in the original', text: 'openphoto/photo-sorter has 4 changes your fork doesn’t have yet.', actions: ['get_original'] }]
      },
      {
        id: 'old-portfolio', name: 'old-portfolio', glyph: 'image', active: false, lifecycle: 'archived', order: 9, runsOn: 'here',
        home: 'here', work: { mode: 'auto', allowed: ['here'] }, workers: [],
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
        id: 'hackathon-2025', name: 'hackathon-2025', glyph: 'flame', active: false, lifecycle: 'archived', order: 10, runsOn: 'here',
        home: 'here', work: { mode: 'auto', allowed: ['here'] }, workers: [],
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
        id: w + '-' + (i + 1), name: w, glyph: glyphs[i % glyphs.length], active: false, lifecycle: i % 13 === 12 ? 'archived' : 'listed', order: 11 + i, runsOn: 'here', home: 'here', work: { mode: 'auto', allowed: ['here'] }, workers: [],
        stack: stacks[i % stacks.length], where: { kind: i % 9 === 4 ? 'device' : 'local', label: i % 9 === 4 ? 'Home NAS' : 'This computer', path: (i % 9 === 4 ? '/volume1/projects/' : '~/Projects/') + w, device: i % 9 === 4 ? 'Home NAS' : undefined, via: i % 9 === 4 ? 'SSH' : undefined },
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
      { path: '~/Desktop/garden notes', name: 'garden notes', history: null, online: null, stack: ['Markdown'] },
      { path: '~/Code/game-jam', name: 'game-jam', history: 'git', online: { service: 'GitLab', repo: 'acme/game-jam' }, stack: ['C#', 'Godot'] }
    ],
    tree: {
      '~': ['Projects', 'Code', 'Documents', 'Desktop', 'Archive', 'Volumes'],
      '~/Projects': ['tastebook', 'harbor', 'loom', 'docs-site', 'experiment-2'],
      '~/Code': ['budget-tracker', 'dotfiles', 'experiments', 'game-jam', 'printer-tool'],
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
    /* devices you have connected (pass-1 fields first; v2 adds brand, model, ip, ssh, pm and the Server it is). Home NAS
       answers and is the paired Puppet Master Server; Media server is the one that doesn't answer (garden-notes lives there) */
    devices: [
      { id: 'nas', name: 'Home NAS', address: 'home-nas.local', aliases: ['home-nas', 'nas.local', 'diskstation.local'], user: 'jared', trusted: true, online: true, folders: ['/volume1/projects/photo-sorter', '/volume1/projects/home-automation', '/volume1/projects/old-experiments'],
        brand: 'Synology DS920+', ip: '192.168.1.20', ssh: true, pm: true, server: 'homenas', glyph: 'server' },
      { id: 'studio', name: 'Studio Mac', address: 'studio.local', user: 'jared', trusted: true, online: true, folders: ['~/Developer/lighting-rig', '~/Developer/midi-tools', '~/Developer/loom'],
        brand: 'Mac mini', ip: '192.168.1.24', ssh: true, pm: true, server: 'studio', glyph: 'desktop' },
      { id: 'media', name: 'Media server', address: 'media.local', user: 'jared', trusted: true, online: false, folders: ['/mnt/tank/projects/garden-notes'],
        brand: 'TrueNAS SCALE', ip: '192.168.1.31', ssh: false, smb: true, nfs: true, pm: false, glyph: 'server' }
    ],
    /* v2 [Demo only]: the computers that can do the work (This computer, and the connected Puppet Master Server) */
    /* each Computer resolves its own home and its own Projects folder (code.execution.projects-folder is a setting of that
       Computer, GUIDED-FLOWS 2.39): a Mac's ~ is never another Computer's ~ */
    computers: [
      { id: 'here', name: 'This computer', short: 'MacBook Pro', detail: 'Jared’s MacBook Pro', home: '/Users/jared', root: '~/Projects', rootFull: '/Users/jared/Projects', free: '212 GB', freeGB: 212, git: true, jj: false, glyph: 'desktop', tz: 'America/New_York' },
      { id: 'homenas', name: 'Home NAS', short: 'Home NAS', detail: 'Your Puppet Master server · Synology DS920+', home: '/var/services/homes/jared', root: '/volume1/projects', rootFull: '/volume1/projects', free: '3.1 TB', freeGB: 3100, git: true, jj: true, device: 'nas', server: true, glyph: 'server', tz: 'America/New_York' },
      { id: 'studio', name: 'Studio Mac', short: 'Studio Mac', detail: 'Mac mini · runs Puppet Master', home: '/Users/jared', root: '~/Projects', rootFull: '/Users/jared/Projects', free: '640 GB', freeGB: 640, git: true, jj: true, device: 'studio', server: true, glyph: 'desktop', tz: 'America/Los_Angeles' }
    ],
    /* devices on the network this computer has never connected to */
    found: [
      { id: 'office', name: 'Office PC', address: 'office-pc.local', ip: '192.168.1.40', user: 'jared', brand: 'Windows 11', ssh: true, pm: false, glyph: 'desktop', online: true,
        words: 'amber falcon river tulip', fingerprint: 'SHA256:7tQm2Lr9xVb4KpWc1Zs8NyHf3Ue6Ja0Dg5Ri2Ow7Ek', folders: ['~/work/invoice-tool'] },
      /* (GUIDED-FLOWS 2.07) a device that runs Puppet Master is paired with, not given an SSH key */
      { id: 'garage', name: 'Garage Pi', address: 'garage-pi.local', ip: '192.168.1.52', user: 'jared', brand: 'Raspberry Pi 5', ssh: true, pm: true, glyph: 'server', online: true,
        approver: 'Jared’s iPhone', code: 'R5N2-C8VD', folders: ['/home/jared/projects/weather-station'] },
      /* (GUIDED-FLOWS 2.11) a NAS whose SSH service is turned off: its brand's own settings say where to turn it on */
      { id: 'den', name: 'Den NAS', address: 'den-nas.local', ip: '192.168.1.61', user: 'jared', brand: 'Synology DS220j', vendor: 'synology', ssh: false, smb: true, pm: false, glyph: 'server', online: true, folders: ['/volume1/homes/jared/scans'] }
    ],
    /* which devices each work computer can already reach with a key (trust and keys belong to the computer doing the work) */
    reach: { here: ['nas', 'studio', 'media'], homenas: ['media'], studio: ['nas'] },
    sshKeys: {
      /* what each key already does on a device (GUIDED-FLOWS 2.13): works there already, is locked with a passphrase, or needs
         adding; a weak one is never offered */
      here: [{ id: 'ed25519', name: '~/.ssh/id_ed25519', type: 'ed25519', where: 'agent', works: ['office'] }, { id: 'work', name: '~/.ssh/work_ed25519', type: 'ed25519', where: 'file', passphrase: 'blue kettle' },
        { id: 'rsa', name: '~/.ssh/id_rsa', type: 'rsa-1024', where: 'file', weak: true }],
      homenas: [{ id: 'nas-ed25519', name: '~/.ssh/id_ed25519 on Home NAS', type: 'ed25519', where: 'file' }]
    },
    /* shared folders and drives this computer can see */
    shares: [
      { id: 'smb-nas', kind: 'smb', address: '//home-nas.local/projects', device: 'nas', free: '3.1 TB', freeGB: 3100, user: 'jared', password: 'correct horse', folders: ['/projects/family-photos-site', '/projects/home-automation'] },
      { id: 'nfs-nas', kind: 'nfs', address: 'home-nas.local:/volume1/projects', device: 'nas', free: '3.1 TB', freeGB: 3100, allows: ['here', 'homenas'], folders: ['/volume1/projects/home-automation', '/volume1/projects/old-experiments'] }
    ],
    volumes: [
      { id: 'vol-projects', path: '/Volumes/Projects', of: 'smb-nas', device: 'nas', label: 'Projects (a share of Home NAS)', free: '3.1 TB', freeGB: 3100, folders: ['/Volumes/Projects/family-photos-site', '/Volumes/Projects/home-automation'] },
      { id: 'vol-backup', path: '/Volumes/Backup Drive', of: null, device: null, label: 'Backup Drive (a USB drive)', free: '0.9 GB', freeGB: 0.9, folders: ['/Volumes/Backup Drive/Puppet Master'] }
    ],
    /* what the look inside finds, by holder:path (the same files give the same result by any route) */
    inspect: {
      'here:~/Code/budget-tracker': { history: 'git', branch: 'main', online: { remote: 'origin', service: 'GitHub', repo: 'jared/budget-tracker' }, changed: 2, stack: ['Python', 'Flask'], size: '48 MB', sizeGB: 0.05 },
      'here:~/Code/dotfiles': { history: 'git', branch: 'main', changed: 2, stack: ['Shell'], size: '1 MB', sizeGB: 0.001 },
      'here:~/Documents/recipe-ideas': { history: null, stack: ['Markdown'], size: '300 KB', sizeGB: 0.0003 },
      'here:~/Desktop/garden notes': { history: null, stack: ['Markdown'], size: '120 KB', sizeGB: 0.0001 },
      'here:~/Code/game-jam': { history: 'git', branch: 'main', online: { remote: 'origin', service: 'GitLab', repo: 'acme/game-jam' }, changed: 0, submodules: ['engine', 'assets/fonts'], lfs: '1.2 GB', stack: ['C#', 'Godot'], size: '1.4 GB', sizeGB: 1.4 },
      'here:~/Code/printer-tool': { history: null, stack: ['Python'], size: '2 MB', sizeGB: 0.002 },
      'here:~/Projects/tastebook': { history: 'git', branch: 'main', online: { remote: 'origin', service: 'GitHub', repo: 'jared/tastebook' }, changed: 3, known: 'tastebook' },
      'nas:/volume1/projects/photo-sorter': { history: 'git', branch: 'main', online: { remote: 'origin', service: 'GitHub', repo: 'jared/photo-sorter' }, original: { remote: 'upstream', service: 'GitHub', repo: 'openphoto/photo-sorter' }, changed: 3, known: 'photo-sorter' },
      'nas:/volume1/projects/home-automation': { history: 'git', branch: 'main', online: { remote: 'origin', address: 'ssh://git@git.home.arpa/jared/home-automation.git', note: 'Forgejo on your own server' }, changed: 0, submodules: ['vendor/zigbee-lib'], hooks: ['pre-commit'], stack: ['Python', 'YAML'], size: '22 MB', sizeGB: 0.02 },
      'nas:/volume1/projects/old-experiments': { history: null, stack: ['Mixed'], size: '410 MB', sizeGB: 0.4 },
      'studio:~/Developer/lighting-rig': { history: 'jujutsu', branch: 'main', online: { remote: 'origin', service: 'GitHub', repo: 'jared/lighting-rig' }, changed: 1, stack: ['Rust'], size: '30 MB', sizeGB: 0.03 },
      'studio:~/Developer/midi-tools': { history: 'git', branch: 'develop', changed: 0, stack: ['TypeScript'], size: '8 MB', sizeGB: 0.008 },
      'studio:~/Developer/loom': { history: 'jujutsu', branch: 'main', online: { remote: 'origin', service: 'GitHub', repo: 'jared/loom' }, changed: 0, sameOnline: 'loom', stack: ['Rust', 'Slint'], size: '26 MB', sizeGB: 0.03 },
      'office:~/work/invoice-tool': { history: 'git', branch: 'main', online: { remote: 'origin', service: 'Azure DevOps', repo: 'acme/Finance/invoice-tool' }, changed: 0, stack: ['C#', '.NET'], size: '64 MB', sizeGB: 0.06 },
      'smb-nas:/projects/family-photos-site': { history: 'git', branch: 'main', changed: 0, lfs: '300 MB', stack: ['HTML'], size: '320 MB', sizeGB: 0.32 },
      'smb-nas:/projects/home-automation': { alias: 'nas:/volume1/projects/home-automation' },
      'vol-projects:/Volumes/Projects/family-photos-site': { alias: 'smb-nas:/projects/family-photos-site' },
      'vol-projects:/Volumes/Projects/home-automation': { alias: 'nas:/volume1/projects/home-automation' },
      'nfs-nas:/volume1/projects/home-automation': { alias: 'nas:/volume1/projects/home-automation' },
      'nfs-nas:/volume1/projects/old-experiments': { alias: 'nas:/volume1/projects/old-experiments' },
      'here:/System/Library': { fail: 'read' }
    },
    /* online services and your accounts there, per service and kind (rules.js keys) [Demo only] */
    forges: {
      'github.com': { signedIn: { here: { account: 'jared', method: 'browser' }, homenas: { account: 'jared', method: 'browser' } },
        owners: [{ id: 'jared', label: 'jared', kind: 'personal' }, { id: 'acme', label: 'acme', kind: 'organization', enterprise: true }, { id: 'jared-labs', label: 'jared-labs', kind: 'organization' }],
        taken: ['garden-planner', 'budget-tracker', 'slint-widgets', 'photo-sorter', 'tastebook', 'loom', 'docs-site', 'experiment', 'recipe-app'],
        repos: [
          { id: 'jared/budget-tracker', owner: 'jared', vis: 'Private', when: '2 days ago', stack: 'Python', size: '48 MB', sizeGB: 0.05, access: 'write' },
          { id: 'jared/garden-planner', owner: 'jared', vis: 'Private', when: 'last week', stack: 'TypeScript', size: '12 MB', sizeGB: 0.01, access: 'write' },
          { id: 'jared/slint-widgets', owner: 'jared', vis: 'Public', when: 'Oct 3', stack: 'Rust', size: '9 MB', sizeGB: 0.01, access: 'write' },
          { id: 'jared/photo-sorter', owner: 'jared', vis: 'Public', when: 'today', stack: 'Python', size: '40 MB', sizeGB: 0.04, access: 'write', forkOf: 'openphoto/photo-sorter' },
          { id: 'acme/harbor-mobile', owner: 'acme', vis: 'Internal', when: 'today', stack: 'Kotlin', size: '120 MB', sizeGB: 0.12, access: 'write', team: true },
          { id: 'jared/rust-starter', owner: 'jared', vis: 'Private', when: 'Sep 2', stack: 'Rust', size: '1 MB', sizeGB: 0.001, access: 'write', template: true },
          { id: 'jared/loom', owner: 'jared', vis: 'Public', when: 'yesterday', stack: 'Rust', size: '26 MB', sizeGB: 0.03, access: 'write' },
          { id: 'jared/lighting-rig', owner: 'jared', vis: 'Private', when: 'Oct 29', stack: 'Rust', size: '30 MB', sizeGB: 0.03, access: 'write' },
          { id: 'jared/dotfiles', owner: 'jared', vis: 'Private', when: 'Oct 1', stack: 'Shell', size: '1 MB', sizeGB: 0.001, access: 'write', empty: true }
        ] },
      'ghe.server': { address: 'https://github.acme.test', signedIn: {}, owners: [{ id: 'acme-platform', label: 'acme-platform', kind: 'organization' }], taken: ['handbook'],
        repos: [{ id: 'acme-platform/handbook', owner: 'acme-platform', vis: 'Internal', when: 'yesterday', stack: 'Markdown', size: '4 MB', sizeGB: 0.004, access: 'write', team: true }] },
      'gitlab.com': { signedIn: { here: { account: 'jared@acme', method: 'browser', expired: true } },
        owners: [{ id: 'jared', label: 'jared', kind: 'personal' }, { id: 'acme', label: 'acme', kind: 'group', cap: 'private' }, { id: 'acme/platform', label: 'acme / platform', kind: 'subgroup', cap: 'private' }],
        taken: ['acme/billing-service', 'acme/design-tokens', 'acme/game-jam'],
        repos: [
          { id: 'acme/billing-service', owner: 'acme', vis: 'Private', when: 'yesterday', stack: 'Go', size: '30 MB', sizeGB: 0.03, access: 'write', team: true },
          { id: 'acme/design-tokens', owner: 'acme', vis: 'Private', when: 'Sep 30', stack: 'JSON', size: '2 MB', sizeGB: 0.002, access: 'write', team: true },
          { id: 'acme/game-jam', owner: 'acme', vis: 'Private', when: 'Oct 28', stack: 'C# · Godot', size: '1.4 GB', sizeGB: 1.4, access: 'write', team: true, submodules: ['engine', 'assets/fonts'], lfs: '1.2 GB' }
        ] },
      'gitlab.own': { address: 'https://git.platyr.test', signup: false, signedIn: {}, owners: [{ id: 'jared', label: 'jared', kind: 'personal', internalAllowed: true }, { id: 'research', label: 'research', kind: 'group', cap: 'internal', internalAllowed: true }], taken: ['research/lab-notes'],
        repos: [{ id: 'research/lab-notes', owner: 'research', vis: 'Internal', when: 'Oct 20', stack: 'Markdown', size: '3 MB', sizeGB: 0.003, access: 'write', team: true }] },
      'azure.services': { signedIn: {}, owners: [{ id: 'acme', label: 'acme', kind: 'azOrg', projects: [{ id: 'Finance', label: 'Finance' }, { id: 'Mobile', label: 'Mobile' }, { id: 'Legacy', label: 'Legacy', tfvc: true }] }], taken: ['invoice-tool'],
        repos: [{ id: 'acme/Finance/invoice-tool', owner: 'acme', project: 'Finance', vis: 'Team project', when: 'Oct 25', stack: 'C# · .NET', size: '64 MB', sizeGB: 0.06, access: 'write', team: true },
          { id: 'acme/Legacy/ledger', owner: 'acme', project: 'Legacy', vis: 'Team project', when: '2019', stack: 'TFVC', access: 'write', tfvc: true }] },
      'azure.server': { address: 'https://ado.acme.test', signedIn: {}, owners: [{ id: 'DefaultCollection', label: 'DefaultCollection', kind: 'collection', projects: [{ id: 'Intranet', label: 'Intranet' }] }], taken: [],
        repos: [{ id: 'DefaultCollection/Intranet/runbooks', owner: 'DefaultCollection', project: 'Intranet', vis: 'Team project', when: 'Oct 1', stack: 'PowerShell', size: '2 MB', sizeGB: 0.002, access: 'write', team: true }] },
      'bitbucket.cloud': { signedIn: {}, owners: [{ id: 'acme-team', label: 'acme-team', kind: 'workspace', projects: [{ id: 'WEB', label: 'WEB', key: 'WEB' }, { id: 'PRIV', label: 'PRIV', key: 'PRIV', private: true }] }], taken: ['garden-site'],
        repos: [{ id: 'acme-team/garden-site', owner: 'acme-team', project: 'WEB', vis: 'Public', when: 'Oct 12', stack: 'Astro', size: '15 MB', sizeGB: 0.015, access: 'write', team: true }] },
      'bitbucket.dc': { address: 'https://bitbucket.acme.test', signedIn: {}, owners: [{ id: 'OPS', label: 'OPS', kind: 'dcProject' }, { id: '~JARED', label: '~JARED', kind: 'dcProject', personal: true }], taken: [],
        repos: [{ id: 'OPS/ops-scripts', owner: 'OPS', vis: 'Private', when: 'Oct 9', stack: 'Bash', size: '1 MB', sizeGB: 0.001, access: 'write', team: true }] },
      'forgejo.own': { address: 'https://git.home.arpa', signedIn: { here: { account: 'jared', method: 'token' } }, owners: [{ id: 'jared', label: 'jared', kind: 'personal' }, { id: 'home', label: 'home', kind: 'organization', profile: 'limited' }, { id: 'family', label: 'family', kind: 'organization', profile: 'private' }], taken: ['home-automation'],
        repos: [{ id: 'jared/home-automation', owner: 'jared', vis: 'Private', when: 'Oct 30', stack: 'Python', size: '22 MB', sizeGB: 0.02, access: 'write' }] },
      'gitea.own': { address: '', signedIn: {}, owners: [{ id: 'jared', label: 'jared', kind: 'personal' }], taken: [], repos: [] }
    },
    /* other people's Projects, for Contribute */
    publicRepos: [
      { id: 'maplecraft/plant-journal', svc: 'github.com', owner: 'maplecraft', vis: 'Everyone', access: 'read', desc: 'A plant care diary', when: '3 days ago', size: '18 MB', sizeGB: 0.018, stack: 'TypeScript' },
      { id: 'openphoto/photo-sorter', svc: 'github.com', owner: 'openphoto', vis: 'Everyone', access: 'read', desc: 'Sorts photos by date and place', when: 'today', size: '40 MB', sizeGB: 0.04, fork: 'jared/photo-sorter', stack: 'Python' },
      { id: 'godot-community/demo-games', svc: 'github.com', owner: 'godot-community', vis: 'Everyone', access: 'read', desc: 'Small games made with Godot', when: 'last week', size: '2.6 GB', sizeGB: 2.6, submodules: ['engine', 'addons/dialogue', 'addons/physics'], lfs: '2.1 GB', stack: 'GDScript' },
      { id: 'acme/secret-sauce', svc: 'github.com', access: 'none' }
    ],
    /* Recovery Kit files where people keep them (onboarding's fixtures): each says where its backup is (its locator, with the
       Puppet Master that made it) and holds the key that unlocks it; never a NAS or cloud sign-in (GUIDED-FLOWS 2.32, 2.33) */
    kits: [
      { id: 'kit-loom', file: 'Recovery Kit – Loom.pdf', folder: 'Documents', from: 'nas', made: 'Sep 14, by this Puppet Master', where: 'Home NAS · /volume1/backups/puppet-master' },
      { id: 'kit-laptop', file: 'Recovery Kit – Jared’s old laptop.pdf', folder: 'Downloads', from: 'drive', made: 'Mar 2, by Puppet Master on Jared’s old laptop', where: 'Backup Drive · /Volumes/Backup Drive/Puppet Master' }
    ],
    /* backup destinations, for New Project and the Backup plate */
    backupPlaces: {
      local_nas: { state: 'key', existing: ['tastebook', 'loom', 'experiment', 'old-portfolio', 'recipe-app'] },
      google_drive: { account: 'jared@gmail.com', existing: ['harbor', 'legacy-app', 'photo-sorter'] },
      onedrive: { account: null, existing: [] }
    },
    /* AI accounts per computer [Demo only] (ready, none, expired, notInstalled) */
    accounts: [
      { id: 'claude', name: 'Claude', account: 'jared@example.com', kind: 'tool', tool: 'Claude Code', on: { here: 'ready', homenas: 'ready', studio: 'ready' } },
      { id: 'codex', name: 'Codex', account: 'ChatGPT sign-in', kind: 'tool', tool: 'Codex', on: { here: 'ready', homenas: 'none' } },
      { id: 'openrouter', name: 'OpenRouter', account: 'key', kind: 'key', on: { here: 'ready', homenas: 'none' } },
      { id: 'copilot', name: 'Copilot', account: 'GitHub sign-in', kind: 'tool', tool: 'GitHub Copilot', on: { here: 'expired', homenas: 'deviceBound', studio: 'notInstalled' } },
      { id: 'firecrawl', name: 'Firecrawl', account: 'key', kind: 'key', on: { here: 'ready', homenas: 'none' } },
      { id: 'tastebook-db', name: 'tastebook-db', account: 'sign-in header', kind: 'key', on: { here: 'ready', homenas: 'none' } }
    ],
    /* each Project's own settings (its differences from your usual settings), kinds by SSYS-007 selector id [Demo only] */
    kinds: [
      ['appearance_workspace', 'Look and layout'], ['assistant_chat', 'Assistant and chat'], ['providers_accounts_models_routing', 'AI accounts and models'],
      ['planning_goal', 'Planning and Goals'], ['orchestrator_automation', 'Automation'], ['tools_integrations', 'Tools and connections'],
      ['testing_browser_devices', 'Testing, browser and devices'], ['permissions_security', 'Permissions and safety'], ['memory_retention_history', 'Memory and history'],
      ['notifications_usage_budgets', 'Notifications & limits']
    ],
    projectSettings: {
      tastebook: {
        uses: ['claude', 'codex', 'openrouter', 'firecrawl'], routing: 'Planning: Claude · Building: Codex',
        own: [
          ['appearance_workspace', 'general.visual.theme', 'Theme', 'Basic Dark', 'Retro Dark'],
          ['providers_accounts_models_routing', 'ai.models.default-model', 'Everyday model', 'Claude Sonnet 4', 'Claude Opus 4'],
          ['providers_accounts_models_routing', 'ai.models.worker-model', 'Everyday building', 'Default', 'Codex'],
          ['providers_accounts_models_routing', 'ai.models.reasoning-effort', 'Thinking depth', 'Medium', 'High'],
          ['planning_goal', 'planning.verification.goal-auto-resume', 'Pick up where it left off', 'On', 'Off'],
          ['permissions_security', 'safety.approvals.auto-continue', 'After one OK, keep going', 'Off', 'On'],
          ['permissions_security', 'safety.rules.permission-preset', 'Profile in use', 'Regular', 'Plan only'],
          ['tools_integrations', 'branching.worktrees.auto-worktree-new-threads', 'Give each new chat its own workspace', 'Off', 'On'],
          ['tools_integrations', 'branching.worktrees.default-branch', 'Main branch name', 'main', 'trunk'],
          ['testing_browser_devices', 'planning.testing.cap-visible-browser', 'Show each browser step on screen', 'Automatic', 'On'],
          ['testing_browser_devices', 'planning.testing.cap-simulator', 'Phone simulators', 'Automatic', 'On'],
          ['memory_retention_history', 'memory.retention.history-retention', 'Chat history', 'All chats', 'Recent chats'],
          ['memory_retention_history', 'memory.retention.subagent-access', 'Helper agents can read memories', 'Off', 'On']
        ],
        same: [
          ['assistant_chat', 'assistant.chat.simple-explanations', 'Simple explanations', 'On'],
          ['orchestrator_automation', 'orchestrator.parallel.max-helpers', 'Helpers at once', '4'],
          ['notifications_usage_budgets', 'notifications.desktop.run-finished', 'Tell me when a run finishes', 'On']
        ],
        fromComputer: 3,
        things: [{ id: 'recipe-tester', name: 'Recipe tester', kind: 'persona' }, { id: 'tastebook-db', name: 'tastebook-db', kind: 'mcp' }, { id: 'seed-recipes', name: '/seed-recipes', kind: 'command' }],
        ownFiles: [{ id: 'instructions', label: 'Its instructions for the AI (AGENTS.md)' }, { id: 'build', label: 'Its build and test commands' }, { id: 'remote', label: 'Its online copy’s address (origin)' }]
      },
      harbor: {
        uses: ['claude', 'copilot'], routing: 'Claude for everything',
        own: [
          ['appearance_workspace', 'general.visual.density', 'Spacing', 'Comfortable', 'Compact'],
          ['permissions_security', 'safety.approvals.auto-continue', 'After one OK, keep going', 'Off', 'On'],
          ['permissions_security', 'safety.rules.permission-preset', 'Profile in use', 'Regular', 'Careful'],
          ['permissions_security', 'safety.network.allow-hosts', 'Websites it may reach', 'Ask each time', 'acme.test only'],
          ['providers_accounts_models_routing', 'ai.models.default-model', 'Everyday model', 'Claude Sonnet 4', 'Claude Opus 4'],
          ['providers_accounts_models_routing', 'ai.models.reasoning-effort', 'Thinking depth', 'Medium', 'High']
        ],
        same: [], fromComputer: 1,
        things: [{ id: 'release-checklist', name: '/release-checklist', kind: 'command' }],
        ownFiles: [{ id: 'instructions', label: 'Its instructions for the AI (AGENTS.md)' }, { id: 'remote', label: 'Its online copy’s address (origin)' }]
      },
      loom: {
        uses: ['claude'], routing: 'Claude for everything',
        own: [
          ['appearance_workspace', 'general.visual.theme', 'Theme', 'Basic Dark', 'NieR Dark'],
          ['memory_retention_history', 'memory.retention.history-retention', 'Chat history', 'All chats', 'Recent chats'],
          ['testing_browser_devices', 'planning.testing.cap-visible-browser', 'Show each browser step on screen', 'Automatic', 'Off']
        ],
        same: [], fromComputer: 0, things: [], ownFiles: [{ id: 'build', label: 'Its build and test commands' }]
      },
      'docs-site': { uses: ['claude'], routing: 'Claude for everything', own: [], same: [], fromComputer: 0, things: [], ownFiles: [] }
    },
    /* starters: files a new Project begins with [Pending Jared] */
    starters: [
      { id: 'family-web', name: 'Family web page', kind: 'folder', from: '~/Starters/family-web-page', adds: '3 files: index.html, style.css, photos/' },
      { id: 'rust-starter', name: 'Rust starter', kind: 'template', service: 'GitHub', project: 'jared/rust-starter', adds: 'A small Rust program with one test' }
    ],
    /* chats with no project [Depends: no-project] */
    chats: [
      { id: 'chat-printer', title: 'Fix the printer', slug: 'fix-printer', folder: '~/Puppet Master Chats/fix-printer', files: 14, sample: 'print-labels.py, labels.csv, README.md and 11 more', runsOn: 'here', when: '2 h ago',
        messages: 32, attachments: 3, first: 'My label printer prints blank pages since the update.', last: 'Labels print again. I kept the fixed config in printer.conf.',
        fileList: ['print-labels.py', 'labels.csv', 'README.md', 'printer.conf', 'notes.md', 'cups-test.log', 'label-template.svg', 'fonts/OCR-B.ttf', 'requirements.txt', 'test_labels.py', 'sample-1.png', 'sample-2.png', '.env.example', 'Makefile'],
        workedIn: { path: '~/Code/printer-tool', changed: 6 }, outside: ['~/.config/cups/printers.conf', '/etc/hosts'], folders: ['~/Downloads'],
        /* the chat folder keeps saved versions of its own; they never get grafted onto another Project's history (7.09) */
        folderHistory: { backend: 'git', count: 3 },
        /* what the conversion preview names (ACD-510, 7.10 and 7.11): its own choices, accounts, grants and active work */
        prefs: { mode: 'Agent', persona: 'Product Manager', model: 'Claude Sonnet 4.6' }, accounts: ['claude', 'codex'],
        grants: ['Run lp and lpstat without asking', 'Use ~/Downloads'],
        goals: [{ id: 'g-labels', title: 'Labels print every time', state: 'active' }],
        schedules: [{ id: 's-queue', title: 'Check the print queue', when: 'every day at 8:00 AM' }],
        approvals: [{ id: 'a-lpadmin', what: 'Run lpadmin -x Office-Label to reset the printer queue', state: 'waiting' }],
        transcript: [
          ['user', 'My label printer prints blank pages since the update.'],
          ['assistant', 'Let’s find out where the labels go blank. I’ll check the print queue and the label template first.'],
          ['user', 'The queue says the jobs finished.'],
          ['assistant', 'Then the driver gets an empty page. I changed the page size in printer.conf and printed a test label: it came out right.'],
          ['user', 'Labels print again. I kept the fixed config in printer.conf.']
        ] },
      /* a talk-only chat: it saved no file, so it has no folder (ACD-508) */
      { id: 'chat-trip', title: 'Plan a weekend in Asheville', slug: 'asheville-weekend', folder: null, files: 0, sample: '', runsOn: 'here', when: 'Yesterday', talkOnly: true,
        messages: 12, attachments: 0, first: 'Help me plan a long weekend in Asheville in May.', last: 'Saturday: the arboretum in the morning, then the river walk.',
        fileList: [], workedIn: null, outside: [], folders: [], prefs: { mode: 'Ask', persona: 'Default', model: 'Claude Sonnet 4.6' }, accounts: ['claude'], grants: [], goals: [], schedules: [], approvals: [],
        transcript: [
          ['user', 'Help me plan a long weekend in Asheville in May.'],
          ['assistant', 'Happy to. Do you want hiking, food, or a bit of both?'],
          ['user', 'Both, and somewhere quiet to stay.'],
          ['assistant', 'Saturday: the arboretum in the morning, then the river walk.']
        ] }
    ],
    /* what a project already has where a chat's files would land, for "Move this chat into a project" [Depends: no-project] */
    projectFiles: {
      harbor: { 'README.md': 'different', Makefile: 'same' }, loom: { 'README.md': 'different' }, 'docs-site': { 'README.md': 'different', '.env.example': 'same' },
      'photo-sorter': { 'requirements.txt': 'same', 'README.md': 'different' }, tastebook: { 'README.md': 'different', Makefile: 'different' }
    },
    /* folders a device or share can browse, for the folder pickers [Demo only] */
    trees: {
      nas: { '/volume1': ['projects', 'backups'], '/volume1/projects': ['photo-sorter', 'home-automation', 'old-experiments'], '/volume1/backups': ['puppet-master'] },
      studio: { '~': ['Developer', 'Documents'], '~/Developer': ['lighting-rig', 'midi-tools', 'loom'], '~/Documents': [] },
      office: { '~': ['work', 'Documents'], '~/work': ['invoice-tool'], '~/Documents': [] },
      media: { '/mnt/tank': ['projects'], '/mnt/tank/projects': ['garden-notes'] },
      'smb-nas': { '/projects': ['family-photos-site', 'home-automation'] },
      'nfs-nas': { '/volume1/projects': ['home-automation', 'old-experiments'] },
      'vol-projects': { '/Volumes/Projects': ['family-photos-site', 'home-automation'] },
      'vol-backup': { '/Volumes/Backup Drive': ['Puppet Master'] }
    },
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
      { id: 'nas', where: 'Home NAS', kind: 'nas', sub: 'Nightly backups of 4 Projects', projects: ['tastebook', 'loom', 'experiment', 'old-portfolio', 'photo-sorter'], latest: 'Today, 3:00 AM', locked: false,
        lineage: { tastebook: ['GitHub', 'jared/tastebook'], loom: ['GitHub', 'jared/loom'], experiment: ['GitHub', 'jared/experiment'], 'old-portfolio': ['GitHub', 'jared/portfolio'], 'photo-sorter': ['GitHub', 'jared/photo-sorter'] },
        manifest: { tastebook: { backend: 'git', branch: 'main', include: 'all' }, loom: { backend: 'jujutsu', branch: 'main', include: 'all' }, experiment: { backend: 'git', branch: 'main', include: 'all' }, 'old-portfolio': { backend: 'git', branch: 'main', include: 'all' }, 'photo-sorter': { backend: 'git', branch: 'my-change', include: 'all' } } },
      { id: 'gdrive', where: 'Google Drive', kind: 'cloud', sub: 'Daily backups of 2 Projects', projects: ['harbor', 'legacy-app'], latest: 'Yesterday, 11:00 PM', locked: false, lineage: { harbor: ['GitLab', 'acme/harbor'] },
        manifest: { harbor: { backend: 'git', branch: 'develop', include: 'all' }, 'legacy-app': { backend: 'git', branch: 'develop', include: 'all' } } },
      { id: 'kit', where: 'A Recovery Kit file', kind: 'kit', sub: 'The file you saved when you set up backups', projects: [], latest: null, file: 'Recovery Kit – Loom.pdf', in: 'Documents', points: 'nas' },
      { id: 'drive', where: 'A folder or a drive', kind: 'folder', sub: 'Or a drive you plugged in', projects: ['recipe-ideas'], latest: 'Oct 3', path: '/Volumes/Backup Drive/Puppet Master', locked: true, phrase: 'river candle orbit maple quiet lantern',
        manifest: { 'recipe-ideas': { backend: null, include: 'all' } } },
      { id: 'b2', where: 'Backblaze B2 · old-backups', kind: 'bucket', sub: 'A storage bucket', projects: [], latest: null, locked: false, empty: true }
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
  const S = { opt: 'c', scenario: 'demo', world: null, mounted: null, root: null, ops: {}, runMode: 'regular' };
  /* the run mode (Plans/Run_Modes.md: runtime mode yolo, "YOLO" on screen; never the Full permission profile). YOLO lets
     agents act without asking: pushes, publishing, making an online copy and forks go ahead and are reported; identity,
     sign-in, trust and FileSafe checks still stop it, and deleting remote data still asks (Jared 2026-11-03; Y1 A) */
  const yolo = () => S.runMode === 'yolo';
  const listeners = {};
  const on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); return () => { listeners[ev] = listeners[ev].filter((f) => f !== fn); }; };
  const emit = (ev, data) => (listeners[ev] || []).slice().forEach((fn) => { try { fn(data); } catch (e) { console.error('[pjx]', ev, e); } });

  function freshWorld(scenario) {
    ENV.devices.forEach((d) => { d.online = d.id !== 'media'; });   // Reset demo puts Media server back to not answering
    const projects = scenario === 'first' ? [] : scenario === 'many' ? manyProjects() : demoProjects();
    /* facts about the person's world that New Project can change: a device trusted, a key added, a sign-in made, a fork
       made. They live here, never in ENV, so Reset demo puts every one back (spec 4, 8 rule 4) */
    const facts = { trusted: {}, signins: {}, expiredFixed: {}, forks: {}, backupSignins: {}, starters: null, chats: [], converted: {}, sent: {}, unsaved: { harbor: ['README.md'] }, gitId: { homenas: false }, approvals: {} };
    return { projects, removed: [], scenario, facts };
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
      online = { key: k, label: 'Online copy', word: o.service, text: o.service + ' · ' + o.repo + (o.upstream ? ' · original ' + o.upstream.repo : '') + ' · ' + (o.note || tail), short: o.service + (o.behind ? ' · ' + o.behind + '↓' : o.ahead ? ' · ' + o.ahead + '↑' : ''), tail };
    }
    const b = p.backup || {};
    let backup;
    if (!b.dest) backup = { key: 'off', label: 'Backup', word: 'None', text: 'Not backed up', short: 'None' };
    else {
      const op = S.ops[p.id];
      if (op && op.kind === 'backup' && !op.done) backup = { key: 'working', label: 'Backup', word: b.dest, text: 'Backing up to ' + b.dest + ' · ' + (op.phase || ''), short: 'Backing up…' };
      // the last complete backup is what shows; a failed or late newer attempt is said beside it, never instead (BRS §4.2)
      // v2 states: setup (Not on yet), scheduled (on, the first one tonight), ready (manual, waiting for Back up now)
      else if (/^(setup|scheduled|ready)$/.test(b.state)) backup = { key: { setup: 'waiting', scheduled: 'pending', ready: 'idle' }[b.state], label: 'Backup', word: b.dest, text: b.state === 'setup' ? 'Not on yet · finish setting up ' + b.dest : b.state === 'scheduled' ? b.dest + ' · on · the first one tonight at ' + ((b.time || '2:00 AM') + (b.tz ? ' ' + b.tz : '')) : b.dest + ' · ready · when you click Back up now', short: b.dest + (b.state === 'setup' ? ' · not on yet' : ''), last: null };
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
  /* the last menu's anchor, by its key: a dialog opened from a menu item returns focus there when its item is gone */
  let menuFrom = null;
  function menu(anchor, groups, opts) {
    if (!(W.PMR && W.PMR.menu)) return;
    menuFrom = anchor && anchor.getAttribute ? anchor.getAttribute('data-c-key') : null;
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
    const prevFocus = D.activeElement, fromKey = menuFrom;
    menuFrom = null;
    const api = { el: box, body, foot, close, setActions };
    function setActions(actions) {
      foot.innerHTML = '';
      (actions || []).forEach((a) => {
        if (a.spacer) { foot.appendChild(h('span.pjx-grow')); return; }
        const b = h('button', { type: 'button', class: ['pjx-btn', a.primary && 'is-primary', a.danger && 'is-danger', a.quiet && 'is-quiet'], 'data-pm-hover-visual-suppressed': a.disabled ? null : 'true', 'data-cmd': a.cmd || null, disabled: a.disabled ? true : null, html: (a.icon ? icon(a.icon, 15) : '') + '<span>' + esc(a.label) + '</span>' });
        if (a.disabled && typeof a.disabled === 'string') tip(b, a.label, a.disabled);
        b.addEventListener('click', () => { if (!b.disabled && a.run) a.run(api); });
        foot.appendChild(b);
      });
    }
    function close(why) {
      // forget it first: a scrim removed from outside must not keep swallowing Escape
      const i = dialogs.indexOf(api); if (i >= 0) dialogs.splice(i, 1);
      if (!back.isConnected) return;
      // focus goes back where it came from: the control that opened it, or (opened from a menu item that is gone now) the
      // menu's own button, or the dialog's own fallback
      const done = () => {
        back.remove();
        const back2 = fromKey ? D.querySelector('[data-c-key="' + fromKey.replace(/"/g, '') + '"]') : null;
        if (prevFocus && prevFocus.isConnected && prevFocus !== D.body && prevFocus.focus) { try { prevFocus.focus({ preventScroll: true }); } catch (e) { /* gone */ } }
        else if (o.returnFocus) o.returnFocus();
        else if (back2) { try { back2.focus({ preventScroll: true }); } catch (e) { /* gone */ } }
        if (o.onClose) o.onClose(why);
      };
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

  /* ------------------------------------------------------------------ a yes-point, in Regular and in YOLO
     yes({ title, kicker, body (node), okLabel, ok(yoloSkipped), guard (why YOLO still asks; never skipped), report: { title,
     text, undo (fn) or cantUndo (words) } }). Regular: a sheet asks, and nothing happens before the named button. YOLO and
     no guard: the act runs now and its report says YOLO didn't ask, with Undo or plainly that it can't be undone. YOLO and a
     guard: the sheet asks anyway and says why YOLO still stops here. */
  function yes(o) {
    if (yolo() && !o.guard) {
      Promise.resolve(o.ok(true)).then(() => {
        const r = o.report || {};
        toast(r.title || o.title, [r.text, r.cantUndo ? r.cantUndo : null, 'YOLO didn’t ask for a yes.'].filter(Boolean).join(' '), 'success', true);
      });
      return null;
    }
    const body = h('div', null, o.body || null, yolo() && o.guard ? h('div.pjx-yolo-line', { 'data-yolo': 'asks' }, h('span.pjx-st-mark', { html: calm('info', 14), 'aria-hidden': 'true' }), h('span', null, h('b', { text: 'YOLO still asks here. ' }), o.guard)) : null);
    const dlg = dialog({ title: o.title, kicker: o.kicker, body, wide: o.wide,
      actions: [{ spacer: true }, { label: o.cancelLabel || 'Cancel', run: () => dlg.close('cancel') }, { label: o.okLabel || 'OK', primary: !o.danger, danger: !!o.danger, disabled: o.disabled || null, run: () => { dlg.close('ok'); o.ok(false); } }] });
    return dlg;
  }

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
    /* (every ACT names its Plans command; a yes-point in YOLO is decided by PJX.yes below) */
    /* cmd.project.open: navigation only; it never pauses work in another project (§4) */
    open(id, opts) {
      const p = get(id); if (!p) return;
      if (p.lifecycle === 'archived') { toast(p.name + ' is archived', 'Unarchive it to open it.', 'info'); return; }
      if (p.where.missing) { emit('need-repair', { id }); return; }
      if (p.attention.some((a) => a.code === 'device_offline')) { toast('Can’t open ' + p.name, (p.where.device || 'The device') + ' isn’t answering. Its files live there.', 'warn'); return; }
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
      await run(id, 'archive', 'Archiving', [{ label: 'Saving the list', ms: 380 }], () => {
        p.lifecycle = 'archived'; p.archivedAt = 'Archived today'; p.active = false; p.activity = { key: 'skipped', word: 'Archived', text: 'Archived today · files, history and backups kept', at: 'today' };
        // P9: an archived Project's backup schedule pauses; its last good backup is kept as it is
        if (p.backup && p.backup.dest && p.backup.state !== 'off') { p.backup.pausedFrom = { state: p.backup.state, schedule: p.backup.schedule }; p.backup.state = 'paused'; p.backup.schedule = 'Paused while archived'; }
      }, { cmd: 'cmd.project.archive' });
      toast(p.name + ' archived', 'Its files, history and last good backup are kept. Its backup schedule is paused. Find it under Archived.', 'success');
    },
    async unarchive(id) {
      const p = get(id); if (!p) return;
      await run(id, 'unarchive', 'Restoring to the list', [{ label: 'Saving the list', ms: 380 }], () => {
        p.lifecycle = 'listed'; p.archivedAt = null; p.activity = { key: 'idle', word: 'Idle', text: 'Back in your list', at: 'just now' };
        if (p.backup && p.backup.state === 'paused') { const was = p.backup.pausedFrom || {}; p.backup.state = was.state || (p.backup.last ? 'complete' : 'setup'); p.backup.schedule = was.schedule || 'Every day'; p.backup.pausedFrom = null; }
      }, { cmd: 'cmd.project.unarchive' });
      toast(p.name + ' is back in your list', p.backup && p.backup.dest ? 'Its backups to ' + p.backup.dest + ' run on their schedule again.' : '', 'success');
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
      toast('Sent to ' + p.online.service, p.online.repo + ' is up to date. Sending can’t be undone on ' + p.online.service + '; a new change can reverse it.' + (yolo() ? ' YOLO didn’t ask for a yes.' : ''), 'success');
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
    /* (GUIDED-FLOWS 6.06) settle an unknown remote effect first: ask the service whether the fork exists, then Continue setup
       resumes from what is true; a found fork is reused, never made again, and nothing is deleted */
    async reconcile(id) {
      const p = get(id); if (!p || !p.recovery || !p.recovery.unknown) return;
      const u = p.recovery.unknown;
      await run(id, 'check', 'Checking on ' + u.service, [{ label: 'Asking ' + u.service + ' whether ' + u.ref + ' exists', ms: 900 }], () => {
        p.recovery.settled.push({ label: 'Your fork exists on ' + u.service + ' (found when checked)', ref: u.ref });
        p.recovery.unknown = null; S.world.facts.forks[(p.online.upstream || {}).repo || ''] = u.ref;
        p.attention = [{ code: 'setup_unfinished', key: 'waiting', title: 'Setup didn’t finish', text: 'Your fork ' + u.ref + ' was made. Continue setup copies it and links the original; the fork is used as it is.', actions: ['resume', 'remove'] }];
      }, { cmd: 'cmd.project.resume_creation (reconcile: remote_effect_state unknown)' });
      toast('Found ' + u.ref + ' on ' + u.service, 'Continue setup uses it. Nothing was made twice.', 'success');
    },
    async resume(id) {
      const p = get(id); if (!p || !p.recovery) return;
      if (p.recovery.unknown) { toast('Check what happened first', 'Puppet Master asks ' + p.recovery.unknown.service + ' before anything is tried again.', 'info'); return; }
      const phases = p.recovery.remaining.map((r) => ({ label: r.label, ms: 900 }));
      await run(id, 'resume', 'Finishing setup', phases, () => {
        p.lifecycle = 'listed'; p.where.pending = false; p.history.worktrees = 1; p.history.changed = 0; p.sync.state = 'complete';
        // the backup plan was saved, nothing more: no sign-in, test, Recovery Kit or backup has run yet, so it is "not on
        // yet" and "Finish protecting your work" opens, exactly as after an ordinary New Project
        if (p.backup && p.backup.dest) Object.assign(p.backup, { state: 'setup', last: null, versions: 0, kit: null, checked: null, note: null, setup: { steps: ['todo', 'todo', 'todo', 'todo', 'todo'], fail: false, access: /S3|B2|SFTP|WebDAV/.test(p.backup.dest) || null, open: true } });
        p.attention = []; p.recovery = null; p.activity = { key: 'idle', word: 'Ready', text: 'Ready to plan in the Planning Wizard', at: 'just now' };
      }, { cmd: 'cmd.project.resume_creation' });
      toast(p.name + ' is ready', 'Setup finished without making anything twice.' + (p.backup && p.backup.setup ? ' Its backup isn’t on yet: finish protecting your work on its page.' : ''), 'success');
    },
    /* cmd.forge.repository.open_in_browser */
    openOnline(id) { const p = get(id); if (p && p.online.repo) toast('Opening ' + p.online.repo, 'In your browser, on ' + p.online.service + '.', 'info'); },
    /* Setup didn't finish: check again what the service has (cmd.project.resume_creation's preflight; Handler pending G5) */
    async checkAgain(id) {
      const p = get(id); if (!p || !p.recovery) return;
      const ref = (p.recovery.settled[0] || {}).ref || p.online.repo;
      await run(id, 'check', 'Checking again', [{ label: 'Asking ' + (p.online.service || 'the service') + ' for ' + ref, ms: 800 }], () => { p.recovery.checked = 'just now'; }, { cmd: 'cmd.project.resume_creation (preflight)' });
      toast(ref ? ref + ' is still on ' + (p.online.service || 'the service') : 'Checked again', 'Nothing changed there. Continue setup does only what is left.', 'info');
    },
    /* cmd.forge.repository.delete (Registered, Handler pending G5/SP-321): its own confirmation, never part of resume */
    async deleteRemote(id) {
      const p = get(id); if (!p || !p.online || !p.online.repo) return;
      const repo = p.online.repo, svc = p.online.service, upstream = p.online.upstream;
      await run(id, 'sync', 'Deleting ' + repo + ' on ' + svc, [{ label: 'Asking ' + svc + ' to delete ' + repo, ms: 900 }], () => {
        if (upstream && S.world.facts.forks[upstream.repo] === repo) delete S.world.facts.forks[upstream.repo];
        p.online = { service: null, repo: null, state: 'off', ahead: 0, behind: 0 };
        if (p.recovery) {
          const settled = p.recovery.settled; p.recovery.settled = [];
          const undo = settled.map((x) => ({ label: /fork/i.test(x.label) ? 'Make your fork on ' + svc + ' again' : 'Make the online copy on ' + svc + ' again', cmd: /fork/i.test(x.label) ? 'cmd.forge.repository.fork' : 'cmd.project.new_github_repo' }));
          p.recovery.remaining = undo.concat(p.recovery.remaining);
          p.attention = (p.attention || []).map((a) => (a.code === 'setup_unfinished' ? Object.assign({}, a, { text: repo + ' was deleted on ' + svc + '. Nothing of this Project is left there. Continue setup makes it again, or remove it from the list.', actions: ['resume', 'remove'] }) : a));
        }
      }, { cmd: 'cmd.forge.repository.delete' });
      toast(repo + ' was deleted on ' + svc, 'This can’t be undone. The Project here is unchanged.', 'success');
    },
    replan(id) { const p = get(id); if (!p) return; toast('Planning Wizard', 'Re-planning ' + p.name + ' from its current settings.', 'info'); if (W.PM_PAGES) W.PM_PAGES.go('wizard'); },
    orchestrator(id) { const p = get(id); if (!p) return; if (W.PM_PAGES) W.PM_PAGES.go('orchestrator'); },
    reveal(id) { const p = get(id); if (p) toast('Shown in your file manager', p.where.path, 'info'); },
    copyPath(id) { const p = get(id); if (!p) return; try { W.navigator.clipboard.writeText(p.where.path); } catch (e) { /* no clipboard */ } toast('Path copied', p.where.path, 'success'); },
    rename(id, name) { const p = get(id); if (!p || !name) return; p.name = name; emit('change', { why: 'rename', id }); toast('Renamed to ' + name, 'Only the name changed. Its folder and history are the same.', 'success'); },
    /* the project created by the New Project flow (flow.js calls this with the reviewed draft) */
    add(p) { S.world.projects.push(p); emit('change', { why: 'add', id: p.id }); },

    /* ------------------------------------------------ v2: the Project page acts on everything New Project sets up (spec 10).
       Each names its owner command; the world changes only after its simulated result. */
    /* cmd.project.execution_host.select (SIR-026): only which computer does the work changes; the files never move */
    /* cmd.project.execution_policy.set (SIR-056, SSYS-059): the work choice, the default Computer and the allowed set change
       for work that hasn't started; running work keeps its Computer, and no files move */
    async setWork(id, pol) {
      const p = get(id); if (!p || !pol) return;
      const name = (c) => (ENV.computers.find((x) => x.id === c) || { name: c }).name;
      await run(id, 'computer', 'Changing where work runs', [{ label: 'Checking ' + pol.allowed.map(name).join(', '), ms: 700 }, { label: 'Saving the work choice', ms: 500 }], () => {
        p.runsOn = pol.def; p.work = { mode: pol.mode, by: pol.mode === 'chosen' ? 'Jared' : null, allowed: pol.allowed.slice() };
        // work that hasn't started and follows the Project takes the new choice; a person's pin stays as it is (and waits
        // if its Computer is no longer allowed); started work keeps its Computer
        (p.workers || []).forEach((x) => {
          if (!x.queued || !(x.mode === 'auto' || x.project)) return;
          if (pol.mode === 'chosen') Object.assign(x, { mode: 'chosen', c: pol.def, by: 'Jared', project: true }); else Object.assign(x, { mode: 'auto', c: null, by: null, project: false });
        });
      }, { cmd: 'cmd.project.execution_policy.set' });
      const waits = (p.workers || []).filter((x) => x.queued && x.mode === 'chosen' && !x.project && x.c && pol.allowed.indexOf(x.c) < 0);
      // (Sol max S1) Auto only ever picks among the allowed Computers it may pick (never one at Only when I choose it); with
      // none, new work waits, and the toast says so instead of naming the default Computer as where work goes
      const WK = PJX.work, cand = WK ? WK.autoCandidates(pol.allowed) : pol.allowed, none = pol.mode === 'auto' && WK ? WK.autoNone(pol.allowed) : null;
      toast(p.name + ': ' + (pol.mode === 'auto' ? 'Auto' : 'Chosen: ' + name(pol.def)), (pol.mode === 'auto' ? (none ? 'Auto has no Computer it may pick: ' + none + '. New work waits until you allow another Computer, or pin it to one. ' : 'New work goes to the best of ' + cand.map(name).join(', ') + (cand.indexOf(pol.def) >= 0 ? '; ' + name(pol.def) + ' breaks ties. ' : '. ')) : 'New Project work runs on ' + name(pol.def) + ', the default Computer. ') + 'Running work stays where it is, and no files moved.' +
        waits.map((x) => ' ' + x.task + ' waits: it is pinned to ' + name(x.c) + ', which ' + p.name + ' no longer allows.').join(''), waits.length || none ? 'warning' : 'success');
    },
    moveComputer(id) { const p = get(id); if (p) toast('Move ' + p.name, 'Opens Move to take ' + p.name + ' to another computer. Its files, history and settings go with it.', 'info'); },
    /* cmd.source_control.repository.bind after the check (6.9.2); a folder with no link needs the add-remote Gap */
    async linkOnline(id, o) {
      const p = get(id); if (!p || !o) return;
      await run(id, 'sync', 'Linking the online copy', [{ label: 'Checking ' + o.repo + ' is this Project', ms: 700 }, { label: 'Linking ' + o.repo + ' on ' + o.service, ms: 600 }], () => {
        p.online = Object.assign({ service: o.service, repo: o.repo, state: 'complete', ahead: 0, behind: 0, privacy: o.privacy || null, note: 'Up to date' }, o.identity || {});
      }, { cmd: 'cmd.source_control.repository.bind' });
      toast(p.name + ' is linked to ' + o.service, o.repo + ' · getting and sending changes works here now.', 'success');
    },
    /* GitHub: cmd.project.new_github_repo; other services: cmd.forge.repository.create (Gap G1/G7), then the first send */
    async addOnline(id, o) {
      const p = get(id); if (!p || !o) return;
      const jj = p.history && p.history.backend === 'jujutsu';
      await run(id, 'sync', 'Making the online copy', [{ label: 'Making ' + o.repo + ' on ' + o.service, ms: 900 }, { label: 'Sending the first version', ms: 800 }], () => {
        p.online = Object.assign({ service: o.service, repo: o.repo, state: 'complete', ahead: 0, behind: 0, privacy: o.privacy || null, note: 'Up to date' }, o.identity || {});
      }, { cmd: o.service === 'GitHub' ? 'cmd.project.new_github_repo' : 'gap:cmd.forge.repository.create (per-forge Project hand-off)' });
      toast('The online copy of ' + p.name + ' is ready', o.service + ' · ' + o.repo + (jj ? ' · sent with Jujutsu' : '') + '. Making it can’t be undone from here: delete it on ' + o.service + ' if you don’t want it.' + (yolo() ? ' YOLO didn’t ask for a yes.' : ''), 'success');
    },
    /* Gap (no fork sync): the concept chains fetch from the original, then bringing it into the main line */
    async getOriginal(id) {
      const p = get(id); if (!p || !p.online || !p.online.upstream) return;
      const up = p.online.upstream, jj = p.history && p.history.backend === 'jujutsu', n = up.behind || 0;
      // (GUIDED-FLOWS 6.07) a change that clashes with yours pauses here for you to settle; nothing is sent or forced
      if (S.world.facts.syncClash) {
        const base = p.history.defaultBranch || 'main', files = ['sorter/rules.py'];
        await run(id, 'sync', 'Getting the latest from the original', [{ label: 'Fetching ' + up.repo + ' (the original)', ms: 700 }, { label: 'Bringing its changes into ' + base + ' here', ms: 800 }], () => {
          p.online.clash = { files, n, base, jj }; dropAttention(p, 'original_newer');
          p.attention.push({ code: 'sync_clash', key: 'waiting', title: 'Getting the latest paused', text: up.repo + ' changed ' + files.join(', ') + ' where your ' + base + ' line changed it too. Nothing was sent, and your branch ' + (up.branch || 'my-change') + ' is untouched. Settle it, or put everything back.', actions: ['settle_clash', 'abort_sync'] });
        }, { cmd: jj ? 'cmd.jujutsu.git.fetch + cmd.jujutsu.change.rebase (conflict recorded in the change)' : 'cmd.source_control.remote.fetch + cmd.source_control.remote.sync (paused on conflict)' });
        toast('Getting the latest paused', '1 file clashes with your work. Settle it on ' + p.name + '’s page, or put everything back.', 'warn');
        return;
      }
      await run(id, 'sync', 'Getting the latest from the original', [{ label: 'Fetching ' + up.repo + ' (the original)', ms: 700 }, { label: 'Bringing its ' + n + ' change' + (n === 1 ? '' : 's') + ' into ' + (p.history.defaultBranch || 'main') + ' here, on this computer', ms: 900 }], () => {
        up.behind = 0; p.online.ahead = (p.online.ahead || 0) + n; p.online.note = n + ' to send to your fork'; p.online.state = 'info'; dropAttention(p, 'original_newer');
      }, { cmd: 'gap:fork sync (' + (jj ? 'cmd.jujutsu.git.fetch + cmd.jujutsu.change.rebase' : 'cmd.source_control.remote.fetch + cmd.source_control.remote.sync') + ')' });
      toast(p.name + ' has the original’s latest, here', up.repo + ' · ' + n + ' change' + (n === 1 ? '' : 's') + ' brought in on this computer. Nothing was sent: your fork ' + p.online.repo + ' changes only when you press Send changes. Your branch ' + (up.branch || 'my-change') + ' is as it was. Had they clashed with your work, it would have paused here for you to settle.', 'success');
    },
    /* the owner's resolution path for a paused sync: keep yours, take the original's, or a hand merge in Source Control,
       then the rest comes in; or put everything back as it was */
    async settleClash(id, how) {
      const p = get(id); if (!p || !p.online || !p.online.clash) return;
      const up = p.online.upstream, cl = p.online.clash, n = cl.n || up.behind || 0;
      const said = { mine: 'Keeping your version of ' + cl.files[0], theirs: 'Taking the original’s version of ' + cl.files[0], merged: 'Using your hand merge of ' + cl.files[0] }[how];
      await run(id, 'sync', 'Settling the clash', [{ label: said, ms: 600 }, { label: 'Bringing in the rest of the ' + n + ' changes', ms: 700 }], () => {
        p.online.clash = null; up.behind = 0; p.online.ahead = (p.online.ahead || 0) + n; p.online.note = n + ' to send to your fork'; p.online.state = 'info'; dropAttention(p, 'sync_clash');
      }, { cmd: cl.jj ? 'cmd.jujutsu.change.resolve' : 'cmd.source_control.merge.resolve' });
      toast(p.name + ' has the original’s latest, here', said + '. Nothing was sent: your fork changes only when you press Send changes.', 'success');
    },
    async abortSync(id) {
      const p = get(id); if (!p || !p.online || !p.online.clash) return;
      const up = p.online.upstream, n = p.online.clash.n;
      await run(id, 'sync', 'Putting it back', [{ label: 'Putting ' + (p.online.clash.base) + ' back as it was', ms: 600 }], () => {
        p.online.clash = null; up.behind = n; dropAttention(p, 'sync_clash');
        p.attention.push({ code: 'original_newer', key: 'info', title: n + ' newer in the original', text: up.repo + ' has ' + n + ' changes your fork doesn’t have yet.', actions: ['get_original'] });
      }, { cmd: 'cmd.source_control.merge.abort' });
      toast('Put back as it was', 'Nothing from the original came in, and nothing was sent.', 'info');
    },
    /* cmd.forge.review.create: inside one Project it is canon; from a fork to its original it is a Gap */
    offerChanges(id) {
      const p = get(id); if (!p) return;
      const up = p.online && p.online.upstream;
      if (up) toast('Offer your changes', 'Opens Source Control with the offer filled in: from ' + p.online.repo + ' · ' + (up.branch || 'my-change') + ' (your fork) into ' + up.repo + ' · ' + (p.history.defaultBranch || 'main') + ' (the original). Your branch is sent to your fork first, as its own step.', 'info');
      else toast('Offer your changes', 'Opens Source Control to offer ' + ((p.online && p.online.branch) || 'my-change') + ' to ' + String((p.online && p.online.repo) || '').split('/')[0] + '.', 'info');
    },
    /* cmd.forge.repository.fork, then the add-remote Gap for "upstream", then cmd.source_control.branch.create */
    async contribute(id, o) {
      const p = get(id); if (!p || !p.online) return;
      const orig = p.online.repo, svc = p.online.service;
      await run(id, 'sync', 'Making your fork', [{ label: 'Making your fork on ' + svc, ms: 900 }, { label: 'Linking the original as ' + (o.upstream || 'upstream'), ms: 500 }, { label: 'Starting your change’s branch ' + (o.branch || 'my-change'), ms: 500 }], () => {
        S.world.facts.forks[orig] = o.fork;
        p.online = { service: svc, repo: o.fork, state: 'complete', ahead: 0, behind: 0, privacy: 'Everyone', note: 'Up to date', upstream: { service: svc, repo: orig, behind: 0, branch: o.branch || 'my-change', remote: o.upstream || 'upstream' } };
        p.online.readOnly = false; p.history.defaultBranch = p.history.defaultBranch || p.history.branch; p.history.branch = o.branch || 'my-change';
      }, { cmd: 'cmd.forge.repository.fork + gap:add remote' });
      toast('Your fork ' + o.fork + ' is ready', 'The original stays linked as ' + (o.upstream || 'upstream') + '. Your change goes on ' + (o.branch || 'my-change') + '. The fork can’t be undone from here: delete it on ' + svc + ' if you don’t want it.' + (yolo() ? ' YOLO didn’t ask for a yes.' : ''), 'success');
    },
    /* the backup setup (6.10, 10.3): destination, then 6.12.3's steps run on the Project's page */
    async setupBackupFull(id, plan, opts) {
      const p = get(id); if (!p || !plan) return;
      const add = opts && opts.add;
      await run(id, 'backup', add ? 'Adding another place' : 'Setting up backups', [{ label: 'Saving the backup plan', ms: 500 }], () => {
        const rec = { dest: plan.dest, place: plan.place, family: plan.family, include: plan.include || 'all', leaveOut: (plan.leaveOut || []).slice(), mode: plan.mode || 'daily', time: plan.time || '2:00 AM', tz: plan.tz || null, keep: plan.keep || 'standard', keepCustom: plan.keepCustom ? Object.assign({}, plan.keepCustom) : null, locator: plan.locator ? Object.assign({}, plan.locator) : null,
          schedule: plan.mode === 'manual' ? 'When you click Back up now' : 'Every day', state: 'setup', last: null, versions: 0, kit: null,
          setup: { steps: ['todo', 'todo', 'todo', 'todo', 'todo'], fail: !!plan.testFail, access: plan.access || null, open: true } };
        if (add) { p.backup.more = (p.backup.more || []).concat([rec]); p.backup.setup = Object.assign({}, rec.setup, { target: p.backup.more.length - 1 }); }
        else { p.backup = rec; dropAttention(p, 'not_backed_up'); }
        dropAttention(p, 'backup_unfinished');
      }, { cmd: 'cmd.backup.destination.add' });
    },
    /* one protect step (6.12.3), done only from its owner's simulated result (FO-9). i: 0 sign in / connect, 1 test,
       2 save the Recovery Kit, 3 check it, 4 turn on. opts.bad: the demo failure for steps 1 and 3 */
    async protectStep(id, i, opts) {
      const p = get(id); if (!p || !p.backup || !p.backup.setup) return false;
      const st = p.backup.setup, b = p.backup, tgt = st.target != null ? b.more[st.target] : b;
      const where = tgt.dest;
      const LAB = [[where === 'Home NAS' ? 'Using the pairing with ' + where : 'Signing in to ' + where, where === 'Home NAS' ? 'cmd.server.pair (reuse)' : 'cmd.auth_profile.sign_in'], ['Running a quick test', 'cmd.backup.destination.test'], ['Saving your Recovery Kit', 'cmd.backup.recovery_key.export'], ['Checking the kit', 'cmd.backup.recovery_key.test'], [tgt.mode === 'manual' ? 'Saving the backup plan' : 'Turning on daily backups', 'cmd.backup.policy.update']];
      const bad = (i === 1 && st.fail) || ((i === 3 || i === 0) && opts && opts.bad);
      st.steps[i] = 'working'; st.err = null; emit('change', { why: 'protect', id });
      const ok = await run(id, 'protect', LAB[i][0], [{ label: LAB[i][0], ms: i === 0 ? 1100 : 700, fail: bad }], () => {
        st.steps[i] = 'done';
        if (i === 2) tgt.kit = { saved: 'Today', checked: null };
        if (i === 3) tgt.kit = Object.assign({}, tgt.kit || {}, { checked: 'Today' });
        if (i === 4) {
          // the plate stays open to say "Backups are on", until its Done
          tgt.state = tgt.mode === 'manual' ? 'ready' : 'scheduled'; st.done = true;
          dropAttention(p, 'backup_unfinished');
        }
      }, { cmd: LAB[i][1] });
      if (!ok) { st.steps[i] = 'failed'; st.err = i; if (i === 1) st.fail = false; emit('change', { why: 'protect', id }); }
      return ok;
    },
    /* Do this later: the plate folds; the Project says "Backup isn't on yet" with Finish setting up */
    protectLater(id) {
      const p = get(id); if (!p || !p.backup || !p.backup.setup) return;
      p.backup.setup.open = false;
      if (!(p.attention || []).some((a) => a.code === 'backup_unfinished')) p.attention.push({ code: 'backup_unfinished', key: 'waiting', title: 'Backup isn’t on yet', text: 'Sign in to ' + p.backup.dest + ', then save your Recovery Kit.', actions: ['finish_backup'] });
      emit('change', { why: 'protect', id });
    },
    protectOpen(id) { const p = get(id); if (p && p.backup && p.backup.setup) { p.backup.setup.open = true; emit('change', { why: 'protect', id }); } },
    /* cmd.backup.destination.update + cmd.backup.policy.update */
    async changeBackup(id, plan) {
      const p = get(id); if (!p || !plan) return;
      // a different place is a different destination identity: its family, or the details that say where (bucket, its
      // folder, the server or address, the region), never the display label alone and never a schedule or key change
      const b = p.backup, famOf = (x) => x.family || ({ 'Home NAS': 'local_nas', 'Google Drive': 'google_drive', OneDrive: 'onedrive' })[x.dest] || x.dest;
      const where = (l) => ['bucket', 'b2host', 'server', 'region', 'address'].map((k) => String((l || {})[k] || '').trim().toLowerCase().replace(/\/+$/, '')).join('|');
      const moved = famOf(plan) !== famOf(b) || where(plan.locator) !== where(b.locator);
      await run(id, 'backup', 'Saving the backup plan', [{ label: moved ? 'Checking ' + plan.dest : 'Saving when it runs and what it keeps', ms: 700 }], () => {
        Object.assign(b, { include: plan.include, leaveOut: (plan.leaveOut || []).slice(), mode: plan.mode, time: plan.time, tz: plan.tz || null, keep: plan.keep, keepCustom: plan.keepCustom ? Object.assign({}, plan.keepCustom) : null, schedule: plan.mode === 'manual' ? 'When you click Back up now' : 'Every day' });
        if (!moved && plan.locator && Object.keys(plan.locator).length) b.locator = Object.assign({}, plan.locator);
        if (moved) {
          // receipts belong to the place that made them: the old place's backups stay there (and expire by its rules); the new
          // one starts unprotected, with no versions, no Recovery Kit and nothing checked, until its own steps run
          if (b.last) b.previous = { dest: b.dest, place: b.place, last: b.last, versions: b.versions || 0 };
          Object.assign(b, { dest: plan.dest, place: plan.place, family: plan.family, locator: plan.locator ? Object.assign({}, plan.locator) : null, state: 'setup', last: null, versions: 0, size: null, kit: null, checked: null, checkedOf: null, note: null,
            setup: { steps: ['todo', 'todo', 'todo', 'todo', 'todo'], fail: false, access: plan.access || null, open: true } });
          dropAttention(p, 'backup_overdue');
        }
      }, { cmd: moved ? 'cmd.backup.destination.update' : 'cmd.backup.policy.update' });
      toast('Backup plan saved for ' + p.name, moved ? 'The new place starts with no backups. Finish its sign-in, test and Recovery Kit on its page.' + (b.previous ? ' The backups on ' + b.previous.dest + ' stay there.' : '') : (plan.mode === 'manual' ? 'Backs up when you click Back up now.' : 'Every day at ' + plan.time + (plan.tz ? ' ' + plan.tz : '') + '.'), 'success');
    },
    /* cmd.backup.recovery_key.test */
    async checkKit(id, bad) {
      const p = get(id); if (!p || !p.backup) return false;
      const ok = await run(id, 'backup', 'Checking the Recovery Kit', [{ label: 'Opening the backup with the kit', ms: 800, fail: !!bad }], () => { p.backup.kit = Object.assign({}, p.backup.kit || { saved: 'Earlier' }, { checked: 'Today' }); }, { cmd: 'cmd.backup.recovery_key.test' });
      toast(ok ? 'The kit opens ' + p.name + '’s backup' : 'That kit didn’t open the backup', ok ? 'Checked just now.' : 'Make sure it’s the kit you saved for this Project, then try again.', ok ? 'success' : 'warn');
      return ok;
    },
    /* cmd.restore.preview, then cmd.restore.project_in_place: the safe point is the Restore owner's */
    async restoreInPlace(id, opts) {
      const p = get(id); if (!p || !p.backup || !p.backup.last) return;
      opts = opts || {};
      const pmOnly = p.backup.include === 'pm';
      const ok = await run(id, 'restore', 'Putting it back as it was', [{ label: 'Making a safe point of what’s there now', ms: 700, fail: !!opts.safePointFails }, { label: 'Getting the backup of ' + p.backup.last, ms: 900 }, { label: pmOnly ? 'Putting its plans, chats and settings back' : 'Putting the files back', ms: 800 }], () => {
        if (!pmOnly) p.history.changed = 0;
        p.activity = { key: 'idle', word: 'Idle', text: 'Put back as it was on ' + p.backup.last + ' · a safe point keeps what was there', at: 'just now' };
      }, { cmd: 'cmd.restore.project_in_place' });
      if (ok) toast(p.name + ' is back as it was ' + (/ago$/.test(p.backup.last) ? p.backup.last : 'on ' + p.backup.last), (pmOnly ? 'Its plans, chats and settings came back; its files weren’t in this backup and didn’t change. ' : '') + 'What was there before is kept in a safe point.', 'success');
      else toast('Nothing was put back', 'Puppet Master couldn’t make the safe point first, so it changed nothing. Free some space and try again.', 'warn');
    },
    /* cmd.backup.test_restore */
    async tryRestore(id) {
      const p = get(id); if (!p || !p.backup || !p.backup.last) return;
      await run(id, 'backup', 'Trying a restore', [{ label: 'Restoring it somewhere apart', ms: 900 }, { label: 'Checking every file', ms: 700 }, { label: 'Removing the trial copy', ms: 400 }], () => { p.backup.checked = 'Today'; p.backup.checkedOf = p.backup.last; }, { cmd: 'cmd.backup.test_restore' });
      toast('The trial restore of ' + p.name + ' worked', 'Nothing changed. The backup of ' + p.backup.last + ' is checked.', 'success');
    },
    /* cmd.settings.open with a pm.settings_route_request.v1 naming the settings-transfer manager */
    copySettingsInto(id) {
      const p = get(id); if (!p) return;
      toast('Copy settings into ' + p.name, 'Opens Settings Transfer to copy settings into ' + p.name + '. The choices there are the same as New Project’s.', 'info');
      if (W.PM_PAGES) W.PM_PAGES.go('settings');
    },
    /* the copied settings from New Project, undone (SSYS-007 restore point) */
    async undoCopied(id) {
      const p = get(id); if (!p || !p.copied) return;
      await run(id, 'settings', 'Undoing the copied settings', [{ label: 'Putting your usual settings back', ms: 600 }], () => { p.copied = null; }, { cmd: 'cmd.settings.transaction.apply (restore point)' });
      toast('Copied settings undone', p.name + ' uses your usual settings.', 'success');
    }
  };

  /* what each attention action is called and does: concepts draw buttons from this so the words match everywhere */
  const ACTIONS = {
    repair: { label: 'Fix…', icon: 'folder-search', run: (id) => emit('need-repair', { id }) },
    sign_in: { label: 'Sign in', icon: 'key', run: (id) => ACT.signIn(id) },
    details: { label: 'Details', icon: 'info', run: (id) => emit('need-details', { id }) },
    setup_backup: { label: 'Set up backup', icon: 'safe', run: (id) => { const c = S.mounted && CONCEPTS[S.mounted]; if (c && c.onBackup && c.onBackup({ id, step: 'setup' })) return; ACT.setupBackup(id); } },
    replan: { label: 'Re-plan', icon: 'plan', run: (id) => ACT.replan(id) },
    backup_now: { label: 'Back up now', icon: 'upload', run: (id) => ACT.backupNow(id) },
    backup_settings: { label: 'Change where', icon: 'settings', run: (id) => ACT.settings(id, 'Backup · where and when') },
    retry: { label: 'Try again', icon: 'refresh', run: (id) => ACT.retry(id) },
    resume: { label: 'Continue setup', icon: 'play', run: (id) => emit('need-resume', { id }) },
    open_online: { label: 'Open on GitHub', icon: 'globe', run: (id) => ACT.openOnline(id) },
    remove: { label: 'Remove from list', icon: 'close', run: (id) => ACT.remove(id) },
    /* v2 */
    get_original: { label: 'Get the latest from the original', icon: 'download', run: (id) => ACT.getOriginal(id) },
    settle_clash: { label: 'Settle it…', icon: 'swap', run: (id) => emit('need-clash', { id }) },
    abort_sync: { label: 'Put everything back', icon: 'reset', run: (id) => ACT.abortSync(id) },
    finish_backup: { label: 'Finish setting up', icon: 'safe', run: (id) => emit('need-backup', { id, step: 'finish' }) }
  };

  /* the More menu every concept offers on a project: the same items in the same order, all labelled */
  function moreItems(p, extra) {
    const s = safety(p), live = p.activity && p.activity.key === 'working';
    /* short enough to show whole in the chat menu (about 12 rows): the rest lives in the project's details */
    const g1 = { items: [
      p.lifecycle === 'archived' ? null : { label: 'Open', icon: 'open', meta: p.active ? 'Already open' : '', disabled: p.active ? 'It is the open project' : null, run: () => ACT.open(p.id) },
      { label: 'Project settings', icon: 'settings', run: () => ACT.settings(p.id) },
      // Rename: canon has no cmd.project.rename yet (a Gap; card P10 adds it), so the dialog's Rename names it as gap:
      { label: 'Rename…', icon: 'edit', run: () => emit('need-rename', { id: p.id }) }
    ] };
    const g2 = { label: 'Keep it safe', items: [
      p.backup.dest ? { label: 'Back up now', icon: 'upload', meta: s.backup.last ? 'Last ' + s.backup.last : '', run: () => ACT.backupNow(p.id) } : { label: 'Set up backup…', icon: 'safe', run: () => ACTIONS.setup_backup.run(p.id) },
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
      // v2 moments (fromchat, contribute, foundonline, backupsetup, ...) belong to the concept that draws them (C)
      else if (c.moment) c.moment(name);
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
    // PMConcept7 now lists NieR as a family of its own in the theme menu (2026-11); older builds had a toggle
    await open();
    const nierFam = D.querySelector('#themeMenu .pm6-tt-family[data-family="nier"]');
    if (nierFam) {
      const famSel = `#themeMenu .pm6-tt-family[data-family="${nier ? 'nier' : fam}"]`;
      if (!nier && nierOn()) { const b = D.querySelector(famSel); if (b) { b.click(); await wait(220); } if (nierOn() && W.PM_NIER && W.PM_NIER.set) { W.PM_NIER.set(false); await wait(220); } }
      else await pick(famSel);
      await pick(`#themeMenu .pm6-tt-mode[data-mode-value="${mode}"]`);
    } else {
      if (!nier && nierOn()) await flipNier();
      await pick(`#themeMenu .pm6-tt-family[data-family="${fam}"]`);
      await pick(`#themeMenu .pm6-tt-mode[data-mode-value="${mode}"]`);
      if (nier && !nierOn()) await flipNier();
    }
    D.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await wait(160);
    // Retro and NieR keep the menu open on Escape now and then: close it with its own button
    if (tb.getAttribute('aria-expanded') === 'true') { tb.click(); await wait(120); }
    rerender();
  }

  /* ------------------------------------------------------------------ messages from index.html */
  function report(type) { if (W.parent !== W) { try { W.parent.postMessage({ source: 'pjx', type, state: { opt: S.opt, scenario: S.scenario, look: look(), runMode: S.runMode } }, '*'); } catch (e) { /* no parent */ } } }
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
    else if (m.cmd === 'runmode') { S.runMode = m.mode === 'yolo' ? 'yolo' : 'regular'; H.setAttribute('data-pjx-run', S.runMode); emit('change', { why: 'runmode' }); report('state'); }
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
    on, emit, toast, menu, dialog, run, yes, yolo, runMode: () => S.runMode, setRunMode: (m) => { S.runMode = m === 'yolo' ? 'yolo' : 'regular'; H.setAttribute('data-pjx-run', S.runMode); emit('change', { why: 'runmode' }); },
    all, get, listed, archived, primary, safety, counts, statusWord, moreItems, deleteItem, setActive,
    concept, mount, unmount, rerender, config, setLook, report, act
  };
})(window);
