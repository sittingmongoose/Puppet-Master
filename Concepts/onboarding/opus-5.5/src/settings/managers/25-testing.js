/* Testing & Debug — how your work gets checked and how you debug it.
   O55: "When to test" starts with the one switch that governs every kind of automated test (capability policy);
   "What it can test" draws the inventory's capability rows in three groups (browser, desktop and mobile, behind the
   scenes) instead of a flat wall, and the manager's own "Use built-in browser", "Visual inspection" and "Native
   checks" switches that repeated three of them are gone. The Debug list is the home of the stored debug
   configurations. History's policy lines read the evidence rows. The browser's own screenshot and DevTools
   choices moved to Browser & SCM, and Goal receipt evidence moved to Goals. History's captured-evidence cards come
   from the shared evidence surface; here their states read as a dot and a word and the values that surface writes as
   identifiers (partial_with_gaps, display_only, failed_no_media) read as words. The shared data is not changed.
   New profiles are guided (PM51.wizard), the way onboarding asks: what to test (a web app in a browser, a desktop
   app, an API or background service, unit tests); how it starts (commands found in this project's files, or your
   own); what counts as a pass and where results go; which browsers and screen sizes, which devices, or where the
   tests run (only the question that fits); then a name, the moment it runs, and a recap. New debug profiles ask the
   same way: what to debug, which program starts, which debugger (the usual one per language first), arguments,
   working folder and environment, then a recap. Both show up in their list with those details, and Edit changes
   them. The inventory's debug-profile list opens the Debug list instead of a bare list of names. */
(function () {
  const ID = 'testing';
  const KEY = 'testing-debug-capture';
  const TABS = [{ id: 'profiles', label: 'Profiles' }, { id: 'when', label: 'When to test' }, { id: 'browser-native', label: 'What it can test' }, { id: 'debug', label: 'Debug' }, { id: 'history', label: 'History' }];
  const DEFAULTS = clone({ testProfiles: state.testProfiles || [], debugProfiles: state.debugProfiles || [] });
  const BROWSER_DEFAULTS = { screenshots: 'On failure' };
  const NATIVE_DEFAULTS = { runtime: true };
  const V = id => PM51.value(id);
  const CAP = k => 'planning.testing.cap-' + k;
  const TRIGGERS = ['After meaningful edits', 'Before completion', 'Manual or release Goal', 'Only when I ask'];
  const RETRY_LABELS = [[0, 'Do not retry'], [1, 'Once'], [2, 'Twice'], [3, '3 times']];
  const THEN = ['Ask me', 'Stop', 'Continue'];
  const ADAPTERS = ['Detected native debugger', 'Browser devtools', 'Language-aware', 'Attach to a running process', 'CodeLLDB', 'GDB', 'Delve', 'debugpy', 'Node.js inspector', 'Firefox devtools'];
  const WORKFLOWS = [['Settings navigation', 'Every domain, workspace, and short page section'], ['Manager controls', 'Add, edit, check, reorder, turn off, remove'], ['Menus, dialogs, and motion', 'Open and close continuity, focus, no flashes'], ['Responsive layouts', 'Desktop, compact, and mobile navigation']];
  const profiles = () => (state.testProfiles = state.testProfiles || []);
  const debugs = () => (state.debugProfiles = state.debugProfiles || []);
  const t = () => { const s = PM51.s(); if (!s.testing) s.testing = clone(DATA.testing); const x = s.testing; if (!x.runs) x.runs = []; if (!x.triggers) x.triggers = { afterEdits: 'Fast feedback', beforeCompletion: 'Thorough verification', manual: 'Release candidate', retry: 1, then: 'Ask me' }; if (!x.browser) x.browser = clone(BROWSER_DEFAULTS); if (!x.native) x.native = clone(NATIVE_DEFAULTS); return x; };
  const profileById = id => profiles().find(x => x.id === id);
  const debugById = id => debugs().find(x => x.id === id);
  const selected = (kind, list) => list.find(x => x.id === PM51.sel(ID + '-' + kind)) || list.find(x => x.status === 'default') || list[0];
  const slug = name => String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'profile';
  const uniqueId = (list, base) => { let id = base, n = 2; while (list.some(x => x.id === id)) id = base + '-' + n++; return id; };
  const isDefault = p => p.status === 'default';
  const profilePill = p => PM51.pill('Ready') + (isDefault(p) ? ' ' + PM51.chip('Default') : '');
  const folderLabel = cwd => !cwd || cwd === '${projectRoot}' ? 'Project folder' : cwd;
  const actionRow = (...buttons) => `<div class="pm51-testing-actions">${buttons.join('')}</div>`;
  const readField = (wrap, name) => { const el = wrap.querySelector(`[data-field="${name}"]`); return el ? el.value.trim() : ''; };
  const profileChoices = () => profiles().map(p => p.name).concat(['None']);
  const withChoice = (choices, value) => choices.includes(value) || !value ? choices : [value].concat(choices);

  /* ---------- what the helpers offer (example data read from this project's files) -------------------------------- */
  const KINDS = [
    { id: 'web', title: 'A web app in a browser', text: 'Opens your site and clicks through it the way a person would.', icon: 'browser', name: 'Web app check' },
    { id: 'desktop', title: 'A desktop app', text: 'Opens the app\'s window and checks what it shows.', icon: 'system', name: 'Desktop app check' },
    { id: 'api', title: 'An API or background service', text: 'Sends it requests and checks the answers.', icon: 'server', name: 'API check' },
    { id: 'unit', title: 'Unit tests', text: 'Runs the small tests written next to your code.', icon: 'test', name: 'Unit tests' }
  ];
  const kindOf = id => KINDS.find(k => k.id === id);
  /* [command, what it does, where it was found, address it opens at] */
  const STARTS = {
    web: [['npm run dev', 'Starts the web app while you work', 'Found in package.json', 'http://localhost:5173'], ['npm run preview', 'Serves the finished build', 'Found in package.json', 'http://localhost:4173'], ['docker compose up web', 'Runs it the way your server does', 'Found in docker-compose.yml', 'http://localhost:8080']],
    desktop: [['cargo run', 'Builds the app and opens its window', 'Found in Cargo.toml'], ['cargo run --release', 'The faster, finished version', 'Found in Cargo.toml']],
    api: [['cargo run --bin tastebook-api', 'Starts the API on this computer', 'Found in Cargo.toml', 'http://localhost:3000'], ['docker compose up api db', 'The API together with its database', 'Found in docker-compose.yml', 'http://localhost:3000']],
    unit: [['cargo test', 'The Rust tests', 'Found in Cargo.toml'], ['npm test', 'The web app\'s tests', 'Found in package.json'], ['pytest', 'The Python tests', 'Found in pyproject.toml']]
  };
  const PASS = [['all', 'Every check passes', 'Strict: any failure means the run failed.'], ['new', 'Nothing new fails', 'Failures already known from earlier runs are reported, but do not count.']];
  const RESULTS = [{ value: 'history', label: 'History, here in Settings', meta: 'Always kept there' }, { value: 'report', label: 'History, plus a report file', meta: 'test-results/ in the project' }, { value: 'chat', label: 'History, plus a summary in the chat', meta: 'A few lines after each run' }];
  const BROWSERS = [['chromium', 'Chromium', 'The engine inside Chrome and Edge.'], ['firefox', 'Firefox', 'Mozilla\'s browser.'], ['webkit', 'WebKit', 'The engine inside Safari.']];
  const SIZES = [['desktop', 'Desktop 1440 × 1000'], ['narrow', 'Narrow 900 × 900'], ['phone', 'Phone 390 × 844']];
  const DEVICES = [['this', 'This computer', 'Opens the app here, in its own window.'], ['simulator', 'A phone simulator', 'iOS Simulator or Android Emulator, when installed.'], ['device', 'A real phone or tablet', 'Plugged in with a cable.']];
  const WHERE = [['local', 'On this computer', 'Quickest. Uses what is installed here.'], ['container', 'In a clean container', 'Starts fresh each time, from your Dockerfile.'], ['server', 'On your server', 'The computer chosen under Containers & Execution.']];
  const MOMENTS = [{ value: 'none', label: 'Only when I ask', meta: 'Start it with Run now' }, { value: 'afterEdits', label: 'After meaningful edits', meta: 'Quick checks while you work' }, { value: 'beforeCompletion', label: 'Before a job counts as done', meta: 'The assistant must pass it first' }, { value: 'manual', label: 'Full runs and release Goals', meta: 'When you ask for a full run' }];
  const MOMENT_TRIGGER = { none: 'Only when I ask', afterEdits: 'After meaningful edits', beforeCompletion: 'Before completion', manual: 'Manual or release Goal' };
  const labelOf = (list, id) => (list.find(x => x[0] === id) || [])[1] || '';
  const namesOf = (list, ids) => (ids || []).map(id => labelOf(list, id)).filter(Boolean).join(', ');
  const resultsLabel = v => (RESULTS.find(r => r.value === v) || RESULTS[0]).label;
  /* A profile's stages follow from its answers; Edit keeps stages you wrote yourself. */
  function stagesFor(p) {
    const pre = p.where === 'container' ? ['Start a clean container'] : p.where === 'server' ? ['Send the work to your server'] : [];
    if (p.kind === 'web') return pre.concat(['Start the app', `Open it in ${namesOf(BROWSERS, p.browsers) || 'Chromium'}`, 'Click through the main pages', p.console ? 'Check the console for errors' : '', p.visual ? 'Compare screenshots with the last run' : '']).filter(Boolean);
    if (p.kind === 'desktop') return pre.concat(['Build the app', `Open it on ${(namesOf(DEVICES, p.devices) || 'this computer').toLowerCase()}`, 'Click through the main screens', 'Close it cleanly']);
    if (p.kind === 'api') return pre.concat(['Start the service', 'Send test requests', 'Check the answers', 'Stop the service']);
    return pre.concat((p.commands || []).map(c => `Run ${c}`));
  }
  const describe = p => p.kind === 'web' ? `Opens the web app in ${namesOf(BROWSERS, p.browsers) || 'a browser'} and clicks through it.` : p.kind === 'desktop' ? 'Opens the desktop app and clicks through its screens.' : p.kind === 'api' ? 'Starts the service and checks its answers to test requests.' : `Runs ${(p.commands || []).join(', ') || 'the unit tests'}.`;
  const live = wrap => (wrap && wrap.querySelector('.o55g-layer:not(.o55g-out)')) || wrap;
  const val = (wrap, sel) => { const el = live(wrap).querySelector(sel); return el ? String(el.value || '').trim() : null; };
  const ENV_RE = /^[A-Za-z_][A-Za-z0-9_]*=/;
  const lines = text => String(text || '').split('\n').map(x => x.trim()).filter(Boolean);
  const reveal = (el, sel, show) => { const box = el.closest('.o55g-main, .pm51-panel-body'); const r = box && box.querySelector(sel); if (!r) return; r.hidden = !show; if (show) { const i = r.querySelector('input, textarea'); if (i) i.focus({ preventScroll: true }); r.scrollIntoView({ block: 'nearest', behavior: motionReduced() ? 'auto' : 'smooth' }); } };
  const chipRow = (list, on, key, label) => `<div class="tt-chips" role="group" aria-label="${a(label)}">${list.map(([v, l]) => PM51.chipToggle(l, (on || []).includes(v), { action: 'pm51-testing-w-pick', data: { key, value: v } })).join('')}</div>`;

  PM51.style(`
#panel-settings .pm51-testing-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
#panel-settings .pm51-testing-actions:first-child { margin-top: 0; }
`);

  /* ---------- Profiles ------------------------------------------------------ */
  function renderProfiles() {
    const list = profiles();
    if (!list.length) return PM51.section({ title: 'Test profiles', help: 'A profile is a set of checks that run together.', body: PM51.empty('No test profiles yet', 'Make one to decide what gets checked and when.', { label: 'New test profile', action: 'pm51-testing-add-profile', icon: 'plus' }) });
    const p = selected('profiles', list);
    const k = kindOf(p.kind);
    const rows = k ? [
      { label: 'What it tests', help: p.description || '', value: k.title },
      { label: p.kind === 'unit' ? 'What runs' : 'How it starts', value: p.kind === 'unit' ? (p.commands || []).join(', ') || 'Not set' : p.command || 'Not set' },
      p.url ? { label: 'Address', value: p.url } : null,
      { label: 'What counts as a pass', value: labelOf(PASS, p.pass) || 'Every check passes' },
      p.kind === 'web' ? { label: 'Browsers', help: namesOf(SIZES, p.sizes), value: namesOf(BROWSERS, p.browsers) || 'Chromium' }
        : p.kind === 'desktop' ? { label: 'Opens on', value: namesOf(DEVICES, p.devices) || 'This computer' }
        : { label: 'Runs', value: labelOf(WHERE, p.where) || 'On this computer' },
      { label: 'When it runs', value: p.trigger || 'Only when I ask' },
      { label: 'Results go to', value: resultsLabel(p.results) }
    ] : [
      { label: 'What it checks', value: p.description || 'Not set' },
      { label: 'When it runs', value: p.trigger || 'Manual only' },
      { label: 'Browser checks', value: p.browser || 'None' },
      { label: 'Native checks', value: p.native || 'None' }
    ];
    const body = PM51.rows(rows) + PM51.section({
      title: 'Stages', help: 'They run in this order. A failing stage stops the run.',
      body: PM51.steps((p.stages || []).map((s, i) => ({ title: s, desc: i === 0 ? 'Runs first' : 'Runs after the previous stage' })))
    }) + PM51.advanced([
      PM51.kv([['Effective plan', (p.stages || []).join(' → ') || 'No stages'], ['Evidence kept', p.evidence || 'Failures and summary'], ['Profile', isDefault(p) ? 'Default for new work' : 'Used when chosen']]),
      PM51.rows([
        { label: 'Time limit', help: 'The run stops if it takes longer.', control: PM51.select(p.timeout || '20 minutes', ['10 minutes', '20 minutes', '45 minutes', '2 hours'], { action: 'pm51-testing-profile-field', data: { id: p.id, field: 'timeout' }, label: 'Time limit' }) },
        { label: 'Retries', help: 'How many times a failing stage is tried again.', control: PM51.select(String(p.retries == null ? 1 : p.retries), RETRY_LABELS.map(([v, l]) => [String(v), l]), { action: 'pm51-testing-profile-field', data: { id: p.id, field: 'retries' }, label: 'Retries' }) }
      ]),
      actionRow(PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-testing-diagnostics' }))
    ].join(''));
    return PM51.listDetail({
      id: ID, rosterId: 'testing-profiles', rosterTitle: 'Test profiles', count: list.length,
      add: { action: 'pm51-testing-add-profile', label: 'New test profile' },
      filter: { placeholder: 'Filter profiles' },
      items: list.map(x => ({ id: x.id, title: x.name, meta: isDefault(x) ? 'Default · ' + (x.trigger || 'Manual') : (x.trigger || 'Manual'), tone: 'ready', selected: x.id === p.id, data: { kind: 'profiles' } })),
      selectAction: 'pm51-testing-pick',
      detail: {
        title: p.name, subtitle: `${(p.stages || []).length} ${(p.stages || []).length === 1 ? 'stage' : 'stages'} · ${p.trigger || 'Manual only'}`, pill: profilePill(p),
        primary: { label: 'Run now', icon: 'play', action: 'pm51-testing-run', data: { id: p.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: 'Edit', icon: 'edit', onClick: () => editProfile(p.id) },
          { label: 'Duplicate', icon: 'copy', onClick: () => duplicateProfile(p.id) },
          { label: 'Watch running session', icon: 'eye', onClick: () => actions['testing-session']() },
          { label: 'Make default', icon: 'pin', ariaDisabled: isDefault(p), meta: isDefault(p) ? 'Already default' : '', onClick: () => { profiles().forEach(x => { x.status = x.id === p.id ? 'default' : 'ready'; }); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Default profile', `${p.name} is now the default.`); } },
          { separator: true },
          { label: 'Delete', icon: 'trash', danger: true, ariaDisabled: isDefault(p), meta: isDefault(p) ? 'Default profile' : '', onClick: () => deleteProfile(p.id) }
        ], p.name),
        body
      }
    });
  }

  /* ---------- When to test -------------------------------------------------- */
  function renderWhen() {
    const tr = t().triggers;
    const choices = profileChoices();
    const sel = (value, key, label) => PM51.select(value || 'None', withChoice(choices, value), { action: 'pm51-testing-trigger', data: { key }, label });
    const pm = V('branching.worktrees.pre-merge-tests') !== false;
    const cmd = String(V('branching.worktrees.pre-merge-test-command') || '');
    return [
      PM51.section({ title: 'Automated testing', body: PM51.bound.rows(['planning.testing.capability-policy']) }),
      PM51.section({
        title: 'When tests run', help: 'Pick the profile for each moment. Choose None to skip that moment.',
        body: PM51.rows([
          { label: 'After meaningful edits', help: 'Quick checks while you work.', control: sel(tr.afterEdits, 'afterEdits', 'After meaningful edits') },
          { label: 'Before completion', help: 'The assistant must pass this before it says a job is done.', control: sel(tr.beforeCompletion, 'beforeCompletion', 'Before completion') },
          { label: 'Manual or release', help: 'When you ask for a full run, or a release Goal starts.', control: sel(tr.manual, 'manual', 'Manual or release') }
        ])
      }),
      PM51.section({
        title: 'If tests fail',
        body: PM51.rows([
          { label: 'Retries', help: 'Unless a profile sets its own. A test that passes on retry is reported as flaky.', control: PM51.select(String(tr.retry == null ? 1 : tr.retry), RETRY_LABELS.map(([v, l]) => [String(v), l]), { action: 'pm51-testing-trigger', data: { key: 'retry' }, label: 'Retry' }) },
          { label: 'Then', help: 'Ask me pauses and shows you the failure.', control: PM51.select(tr.then || 'Ask me', THEN, { action: 'pm51-testing-trigger', data: { key: 'then' }, label: 'Then' }) }
        ])
      }),
      PM51.advanced(PM51.section({ title: 'Verification gate details', body: PM51.kv([
        ['Before completion', `Blocks completion until ${tr.beforeCompletion && tr.beforeCompletion !== 'None' ? tr.beforeCompletion : 'no profile'} passes`],
        ['Before merging', pm ? `Runs ${!cmd || /auto/i.test(cmd) ? 'the test command found in the project' : cmd} on ${V('branching.worktrees.pre-merge-test-target') === 'branch_only' ? 'the branch alone' : 'the merged result'}; a failure blocks the merge` : 'Off: work can be merged without tests'],
        ['Release', `Uses ${tr.manual && tr.manual !== 'None' ? tr.manual : 'no profile'}`],
        ['Flaky tests', 'A test that passes on retry is marked flaky and reported']
      ]) }))
    ].join('');
  }

  /* ---------- Browser & native ---------------------------------------------- */
  function renderBrowserNative() {
    const b = t().browser, n = t().native;
    const off = V('planning.testing.capability-policy') === 'Off';
    return [
      off ? PM51.note('Automated testing is set to Never under When to test, so none of these run.', 'info') : '',
      PM51.section({
        title: 'Browser testing', help: 'For anything with a screen: web apps, docs, and this app.',
        body: PM51.bound.rows(['planning.testing.test-visibility', CAP('built-in-browser')])
          + PM51.rows([{ label: 'Screenshots', help: 'Pictures of the screen kept with each run. Set with the built-in browser.', value: ({ 'On failure': 'When something fails', Always: 'Always', Never: 'Never' })[b.screenshots || 'On failure'] || b.screenshots, action: { label: 'Change', icon: 'arrowRight', action: 'pm51-go', data: { domain: 'source', workspace: 'browser-scm' } } }])
          + PM51.bound.rows([CAP('screenshot-compare'), CAP('console-network'), CAP('accessibility')])
          + PM51.rows([{ label: 'Browser status', pill: PM51.pill('Ready'), help: 'Its sessions and screenshot button are set in Browser & SCM.', action: { label: 'Open Browser & SCM', icon: 'arrowRight', ghost: true, action: 'pm51-go', data: { domain: 'source', workspace: 'browser-scm' } } }])
      }),
      PM51.section({
        title: 'Desktop and mobile apps', help: 'Checks for app windows, simulators and real devices.',
        body: PM51.bound.rows([CAP('desktop-gui'), CAP('live-preview'), CAP('hot-reload'), CAP('simulator'), CAP('physical-device')])
          + PM51.rows([
            { label: 'Runtime and service tests', help: 'Checks the background service, its connections, and recovery.', control: PM51.toggle(!!n.runtime, { action: 'pm51-testing-native', data: { key: 'runtime' }, label: 'Runtime and service tests' }) },
            { label: 'Test tools', pill: PM51.pill('Ready'), help: 'Build tools and test runners on this computer.', action: { label: 'Check test tools', icon: 'test', action: 'pm51-testing-check-tools' } }
          ])
      }),
      PM51.advanced([
        PM51.section({ title: 'Browser workflow catalog', help: 'Ready-made click-through checks the browser can run.', body: PM51.list(WORKFLOWS.map(([title, meta]) => ({ title, meta, pill: PM51.pill('Ready'), avatar: icon('browser') }))) }),
        PM51.section({ title: 'Technical details', body: PM51.kv([['Smoke command', 'pm test --native --smoke'], ['Desktop viewport', '1440 x 1000'], ['Narrow viewport', '900 x 900'], ['Mobile viewport', '390 x 844']]) })
      ].join(''))
    ].join('');
  }

  /* ---------- Debug ----------------------------------------------------------- */
  function renderDebug() {
    const list = debugs();
    if (!list.length) return PM51.section({ title: 'Debug profiles', help: 'A debug profile says which program to start and how.', body: PM51.empty('No debug profiles yet', 'Make one to start debugging with a single click.', { label: 'New debug profile', action: 'pm51-testing-add-debug', icon: 'plus' }) });
    const d = selected('debug', list);
    const body = PM51.rows([
      { label: 'Debugger', value: d.adapter || 'Not set' },
      { label: 'Program', value: d.program || 'Not set' },
      { label: 'Environment', value: d.env || 'Project environment' }
    ]) + PM51.advanced([
      PM51.kv([['Arguments', d.args || 'None'], ['Working folder', folderText(d.cwd)], ['Extra values', (d.envVars || []).length ? d.envVars.map(x => x.split('=')[0]).join(', ') : 'None'], ['Status', PM51.plain(d.status || 'ready')]]),
      actionRow(PM51.btn({ label: 'Check launch', small: true, icon: 'test', action: 'pm51-testing-check-launch', data: { id: d.id } }))
    ].join(''));
    return PM51.home('code.execution.debug-configurations', PM51.listDetail({
      id: ID, rosterId: 'testing-debug', rosterTitle: 'Debug profiles', count: list.length,
      add: { action: 'pm51-testing-add-debug', label: 'New debug profile' },
      filter: { placeholder: 'Filter debug profiles' },
      items: list.map(x => ({ id: x.id, title: x.name, meta: x.adapter || '', tone: 'ready', selected: x.id === d.id, data: { kind: 'debug' } })),
      selectAction: 'pm51-testing-pick',
      detail: {
        title: d.name, subtitle: d.program || '', pill: PM51.pill('Ready'),
        primary: { label: 'Start debugging', icon: 'play', action: 'pm51-testing-start-debug', data: { id: d.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: 'Edit', icon: 'edit', onClick: () => editDebug(d.id) },
          { label: 'Duplicate', icon: 'copy', onClick: () => { const copy = clone(d); copy.id = uniqueId(debugs(), d.id + '-copy'); copy.name = d.name + ' copy'; debugs().push(copy); PM51.setSel(ID + '-debug', copy.id); saveState(); PM51.refresh(ID, { swap: false }); } },
          { separator: true },
          { label: 'Delete', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Delete ${d.name}?`, 'The debug profile is removed. Your program is not touched.', 'Delete', () => { state.debugProfiles = debugs().filter(x => x.id !== d.id); PM51.setSel(ID + '-debug', ''); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast(`${d.name} deleted`, 'It is no longer on your list.'); }, true) }
        ], d.name),
        body
      }
    }));
  }

  /* ---------- History ---------------------------------------------------------- */
  /* T46 narrow adapter: the retained Raw Test Capture / Demonstration Video cards come from the
     shared systems-integration authority (window.PM7_TEST_CAPTURE_EVIDENCE); this tab holds no
     copy of the fixture data. They live here because the PM51 browserScm manager replaced the
     legacy six-tab Browser & SCM projection, so their old Capture tab no longer renders in this
     shell. Their buttons carry the same typed data-action attributes and dispatch through the
     one live action dispatch into the existing capture handlers. */
  const EVIDENCE_WORDS = { partial_with_gaps: 'partly recorded, with gaps', display_only: 'display-only', failed_no_media: 'failed with nothing recorded', no_recording: 'no recording', manifest_verified: 'manifest checked', source_missing: 'source missing', browser_page: 'browser page', immutable_recorded_capture: 'kept exactly as recorded', no_retained_capture: 'nothing kept', handler_unavailable: 'not available here' };
  const EVIDENCE_TONE = { ready: 'ready', attention: 'attention', unavailable: 'off', blocked: 'blocked', error: 'blocked' };
  const evidenceWords = text => text.replace(/\b[a-z]+(?:_[a-z]+)+\b/g, (m, at) => { const w = EVIDENCE_WORDS[m] || m.replace(/_/g, ' '); return text.slice(0, at).trim() ? w : w.charAt(0).toUpperCase() + w.slice(1); });
  function plainEvidence(html) {
    const tpl = document.createElement('template'); tpl.innerHTML = html;
    tpl.content.querySelectorAll('.doctor-state').forEach(el => {
      const holder = document.createElement('template'); holder.innerHTML = PM51.status(el.textContent.trim(), EVIDENCE_TONE[el.dataset.state] || 'neutral');
      const dot = holder.content.firstElementChild; if (el.dataset.state) dot.dataset.state = el.dataset.state;
      el.replaceWith(dot);
    });
    tpl.content.querySelectorAll('.info-value, .capture-relation, .doctor-item-copy').forEach(el => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
      while ((n = walker.nextNode())) if (/_/.test(n.nodeValue)) n.nodeValue = evidenceWords(n.nodeValue);
    });
    return tpl.innerHTML;
  }
  function captureEvidenceSection() {
    const surface = typeof window.PM7_TEST_CAPTURE_EVIDENCE === 'object' ? window.PM7_TEST_CAPTURE_EVIDENCE : null;
    if (!surface) return '';
    return PM51.section({
      title: 'Captured evidence',
      help: 'Raw Test Capture and Demonstration Video records kept from test runs, plus a session that ended with no recording. Opening one shows bounded concept evidence; nothing is recorded, played, or downloaded here.',
      body: `<div class="capture-fixture-list" data-capture-evidence-surface="pm51-testing-history" data-production-runtime-state="unavailable">${plainEvidence(surface.fixtures.map(fx => surface.cardOf(fx)).join(''))}</div>` + PM51.note('Concept evidence only. View Source Capture and Inspect Provenance open local drawers; the owner routes behind them stay handler-unavailable.', 'info')
    });
  }
  function renderHistory() {
    const runs = t().runs;
    const items = runs.map((r, i) => ({ title: r.profile, meta: `${r.time} · ${r.duration}`, pill: PM51.pill(r.result), avatar: icon('test'), action: 'pm51-testing-open-run', data: { index: i } }));
    return [
      PM51.section({
        title: 'Recent runs', help: 'Open a run to see what happened.',
        body: items.length ? PM51.list(items) : PM51.empty('No runs yet', 'Runs appear here after tests have run.')
      }),
      captureEvidenceSection(),
      /* Wave S: the canonical evidence rows (planning.verification.evidence-*, branching.worktrees.evidence-*)
         render inline on this tab, so the kit keeps no duplicate keep-days / screenshots / logs rows. */
      PM51.advanced([
        PM51.section({ title: 'Policy', body: PM51.kv([['Secrets and personal data', V('planning.verification.evidence-redaction') ? 'Hidden before anything is saved' : 'Kept as they are. Turn on hiding under Keeping proof'], ['Passing runs', 'Summary only'], ['Failing runs', 'Full output'], ['Screenshots', { 'On failure': 'When something fails', Always: 'Always', Never: 'Never' }[t().browser.screenshots || 'On failure']], ['Test run logs kept', V('branching.worktrees.evidence-retention-days') ? `${V('branching.worktrees.evidence-retention-days')} days` : 'Until you delete them']]) }),
        actionRow(PM51.btn({ label: 'Export evidence', small: true, icon: 'download', action: 'pm51-testing-export' }), PM51.btn({ label: 'Clear history', small: true, icon: 'trash', action: 'pm51-testing-clear-history', disabled: !runs.length, reason: 'There are no runs to clear.' }))
      ].join(''))
    ].join('');
  }

  function render() {
    const tab = PM51.tab(ID, 'profiles'); syncDebugs();
    const body = tab === 'when' ? renderWhen() : tab === 'browser-native' ? renderBrowserNative() : tab === 'debug' ? renderDebug() : tab === 'history' ? renderHistory() : renderProfiles();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [{ label: 'Reset testing defaults', action: 'pm51-testing-reset' }, { label: 'How testing works', action: 'pm51-testing-help' }] });
  }
  PM51.manager('testing', { render });
  const syncDebugs = () => { const names = debugs().map(d => d.name); if (PM51.setting('code.execution.debug-configurations') && JSON.stringify(V('code.execution.debug-configurations')) !== JSON.stringify(names) && commitSettingValue('code.execution.debug-configurations', names)) saveState(); };
  PM51.owner(ID, id => { const e = PM51.placement.byId[id]; if (e && e.tab) PM51.setTab(ID, e.tab); });
  ['planning.testing.capability-policy', 'branching.worktrees.pre-merge-tests', 'branching.worktrees.pre-merge-test-command', 'branching.worktrees.pre-merge-test-target', 'planning.verification.evidence-redaction', 'branching.worktrees.evidence-retention-days'].forEach(id => PM51.watch(id, () => PM51.refresh(ID, { swap: false })));
  /* Watch running session: the controls of a run in progress, or History when nothing runs. */
  PM51.on('testing-session', () => {
    const run = t().runs.find(r => /running/i.test(r.result));
    if (!run) { PM51.panel({ title: 'No test session is running', icon: 'eye', eyebrow: 'Testing', summary: 'Start one with Run now on a profile. Finished runs are in History.', body: PM51.panelSection('Last run', t().runs[0] ? PM51.kv([['Profile', t().runs[0].profile], ['Result', t().runs[0].result], ['When', t().runs[0].time]]) : PM51.note('No runs yet.', 'info')), primaryLabel: 'Open History', onPrimary: () => { PM51.setTab(ID, 'history'); PM51.refresh(ID); } }); return; }
    PM51.panel({ title: `${run.profile} is running`, icon: 'eye', eyebrow: 'Test session', status: { label: 'Running', tone: 'info' },
      body: PM51.panelSection('While it runs', PM51.rows([{ label: 'Watch it', help: 'Opens the live view in the browser panel.', action: { label: 'Watch', icon: 'eye', action: 'pm51-testing-session-do', data: { what: 'Watching' } } }, { label: 'Keep it in the background', help: 'You are told when it finishes.', action: { label: 'Background', icon: 'down', action: 'pm51-testing-session-do', data: { what: 'Moved to the background' } } }, { label: 'Stop it', help: 'Evidence so far is kept.', action: { label: 'Stop', icon: 'pause', action: 'pm51-testing-session-do', data: { what: 'Stopped' } } }])) });
  });
  PM51.on('testing-session-do', el => PM51.toast(ds(el, 'what'), 'Example only: no test session runs in this preview.', 'info'));

  /* ---------- profile behaviour ------------------------------------------------ */
  function editProfile(id) {
    const p = profileById(id); if (!p) return;
    const k = kindOf(p.kind);
    const picked = (wrap, key) => [...wrap.querySelectorAll(`.pm51-chip-toggle[data-key="${key}"].is-on`)].map(b => b.dataset.value);
    const guided = !k ? '' : PM51.panelSection(p.kind === 'unit' ? 'What runs' : 'How it starts', (p.kind === 'unit'
        ? PM51.field('Test commands, one per line', `<textarea class="form-textarea o55-setup-mono" data-field="commands" rows="3" spellcheck="false">${h((p.commands || []).join('\n'))}</textarea>`, 'They run in this order.')
        : PM51.field('Command', PM51.input(p.command || '', { data: { field: 'command' }, cls: 'o55-setup-mono' }), 'What you would type in a terminal to start it.'))
        + (p.kind === 'web' || p.kind === 'api' ? PM51.field('Address', PM51.input(p.url || '', { data: { field: 'url' }, cls: 'o55-setup-mono' }), 'Tests wait until this answers.') : ''), '', { icon: 'play' })
      + PM51.panelSection('Passing and results', PM51.field('What counts as a pass', PM51.select(p.pass || 'all', PASS.map(([v, l]) => [v, l]), { data: { field: 'pass' }, label: 'What counts as a pass' }))
        + PM51.field('Where results go', PM51.select(p.results || 'history', RESULTS, { data: { field: 'results' }, label: 'Where results go' })), '', { icon: 'check' })
      + (p.kind === 'web' ? PM51.panelSection('Browsers', chipRow(BROWSERS, p.browsers, 'browsers', 'Browsers') + `<p class="pm51-ps-help">Screen sizes</p>` + chipRow(SIZES, p.sizes, 'sizes', 'Screen sizes'), '', { icon: 'browser' })
        : p.kind === 'desktop' ? PM51.panelSection('Opens on', chipRow(DEVICES, p.devices, 'devices', 'Opens on'), '', { icon: 'system' })
        : PM51.panelSection('Where the tests run', PM51.field('Runs', PM51.select(p.where || 'local', WHERE.map(([v, l]) => [v, l]), { data: { field: 'where' }, label: 'Where the tests run' })), '', { icon: 'server' }));
    PM51.panel({
      title: `Edit ${p.name}`, subtitle: 'Changes apply to the next run.', icon: 'test',
      body: PM51.panelSection('Name and purpose', PM51.field('Name', PM51.input(p.name, { data: { field: 'name' } })) + PM51.field('What it checks', PM51.input(p.description || '', { data: { field: 'description' } })))
        + PM51.panelSection('When it runs', PM51.field('Moment', PM51.select(p.trigger, withChoice(TRIGGERS, p.trigger), { data: { field: 'trigger' }, label: 'Moment' })))
        + guided
        + PM51.panelSection('Stages', PM51.field('Stages, one per line', `<textarea class="text-control" data-field="stages" rows="5">${h((p.stages || []).join('\n'))}</textarea>`, k ? 'They run in this order. Left as they are, they follow your answers above.' : 'They run in this order.'))
        + (k ? '' : PM51.panelSection('Checks', PM51.field('Browser checks', PM51.input(p.browser || '', { data: { field: 'browser' }, placeholder: 'e.g. Smoke only when GUI-related' })) + PM51.field('Native checks', PM51.input(p.native || '', { data: { field: 'native' }, placeholder: 'e.g. Build check' })))),
      primaryLabel: 'Save',
      onPrimary: wrap => {
        const next = Object.assign({}, p);
        if (k) {
          if (p.kind === 'unit') next.commands = lines(readField(wrap, 'commands')); else next.command = readField(wrap, 'command');
          if (p.kind === 'web' || p.kind === 'api') next.url = readField(wrap, 'url');
          next.pass = readField(wrap, 'pass') || next.pass; next.results = readField(wrap, 'results') || next.results;
          if (p.kind === 'web') { next.browsers = picked(wrap, 'browsers'); next.sizes = picked(wrap, 'sizes'); }
          if (p.kind === 'desktop') next.devices = picked(wrap, 'devices');
          if (p.kind === 'api' || p.kind === 'unit') next.where = readField(wrap, 'where') || next.where;
          const why = p.kind === 'unit' ? (!next.commands.length ? 'Keep at least one test command.' : '') : !next.command ? 'Keep the command that starts it.' : (p.kind === 'web' || p.kind === 'api') && !/^https?:\/\/\S+/.test(next.url) ? 'The address starts with http:// or https://.' : p.kind === 'web' && !next.browsers.length ? 'Keep at least one browser.' : p.kind === 'web' && !next.sizes.length ? 'Keep at least one screen size.' : p.kind === 'desktop' && !next.devices.length ? 'Keep at least one place to open the app.' : '';
          if (why) { PM51.toast('One more thing', why, 'info'); return false; }
        }
        const name = readField(wrap, 'name'); if (name) next.name = name;
        next.description = readField(wrap, 'description'); next.trigger = readField(wrap, 'trigger') || p.trigger;
        const stages = readField(wrap, 'stages').split('\n').map(x => x.trim()).filter(Boolean);
        next.stages = k && stages.join('\n') === stagesFor(p).join('\n') ? stagesFor(next) : stages;
        if (k) { next.browser = p.kind === 'web' ? `${namesOf(BROWSERS, next.browsers)} · ${namesOf(SIZES, next.sizes)}` : 'None'; next.native = p.kind === 'desktop' ? namesOf(DEVICES, next.devices) : 'None'; next.evidence = resultsLabel(next.results); }
        else { next.browser = readField(wrap, 'browser'); next.native = readField(wrap, 'native'); }
        if (next.name !== p.name) { const tr = t().triggers; ['afterEdits', 'beforeCompletion', 'manual'].forEach(key => { if (tr[key] === p.name) tr[key] = next.name; }); }
        Object.assign(p, next);
        saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Saved', `${p.name} was updated.`);
      }
    });
  }
  function duplicateProfile(id) {
    const p = profileById(id); if (!p) return;
    const copy = clone(p); copy.id = uniqueId(profiles(), p.id + '-copy'); copy.name = p.name + ' copy'; copy.status = 'ready';
    profiles().push(copy); PM51.setSel(ID + '-profiles', copy.id); saveState(); PM51.refresh(ID, { swap: false });
  }
  function deleteProfile(id) {
    const p = profileById(id); if (!p || isDefault(p)) return;
    PM51.confirm(`Delete ${p.name}?`, 'Moments that used this profile switch to None.', 'Delete', () => {
      state.testProfiles = profiles().filter(x => x.id !== id);
      const tr = t().triggers; ['afterEdits', 'beforeCompletion', 'manual'].forEach(k => { if (tr[k] === p.name) tr[k] = 'None'; });
      PM51.setSel(ID + '-profiles', ''); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast(`${p.name} deleted`, 'It is no longer on your list.');
    }, true);
  }
  PM51.on('testing-pick', el => { PM51.setSel(ID + '-' + ds(el, 'kind'), ds(el, 'id')); state.resourceRosterOpen = false; PM51.refresh(ID, { swap: false }); });
  PM51.on('testing-run', el => {
    const p = profileById(ds(el, 'id')); if (!p) return;
    PM51.check({
      title: `Run ${p.name}`, subtitle: 'Example data only. Nothing ran in this preview.', outcome: 'Example run', tone: 'info',
      steps: (p.stages || []).map(s => ({ title: s, desc: 'Would run in this order', status: 'Example', tone: 'info' }))
    });
  });
  /* New test profile: one question at a time. */
  function profileWizard() {
    const tr = t().triggers;
    const draft = { kind: null, start: null, command: '', commands: [], extra: '', url: '', pass: 'all', console: true, visual: false, results: 'history', timeout: '20 minutes', browsers: ['chromium'], sizes: ['desktop'], devices: ['this'], where: 'local', name: '', moment: 'none' };
    const startsOf = d => STARTS[d.kind] || [];
    const commandOf = d => d.kind === 'unit' ? d.commands.concat(d.extra ? [d.extra] : []) : d.command;
    PM51.wizard({
      title: 'New test profile', eyebrow: 'Test profile', icon: 'test', finishLabel: 'Create profile', draft,
      subtitle: 'A test profile says what gets checked, how it starts, and what counts as passing.',
      steps: [
        { label: 'What', icon: 'test', title: 'What should this profile test?', lead: 'Pick the kind of thing you are building. You can make more profiles later.',
          render: d => PM51.tiles(KINDS.map(k => ({ title: k.title, text: k.text, icon: k.icon, selected: d.kind === k.id, data: { kind: k.id } })), { action: 'pm51-testing-pw-kind' }),
          check: d => d.kind ? '' : 'Pick what to test to go on.' },
        { label: 'Start', icon: 'play',
          title: d => d.kind === 'unit' ? 'Which tests should run?' : d.kind === 'web' ? 'How does the web app start?' : d.kind === 'api' ? 'How does the service start?' : 'How does the app start?',
          lead: d => d.kind === 'unit' ? 'Puppet Master found these test commands in your project. Pick one or more.' : 'Puppet Master found these in your project. Pick one, or type your own.',
          recap: d => d.kind === 'unit' ? `${commandOf(d).length} ${commandOf(d).length === 1 ? 'command' : 'commands'}` : d.command,
          render: d => {
            if (d.kind === 'unit') return PM51.tiles(startsOf(d).map(([c, what, where]) => ({ title: c, text: what, meta: where, icon: 'terminal', selected: d.commands.includes(c), data: { key: 'commands', value: c } })), { action: 'pm51-testing-w-pick', multi: true })
              + `<div class="o55-setup-fields">${PM51.field('Another test command (optional)', `<input class="text-control o55-setup-mono tt-pw-extra" value="${a(d.extra)}" placeholder="For example: npx playwright test" autocomplete="off" spellcheck="false"/>`, 'Typed the way you would in a terminal. Runs after the ones you picked.')}</div>`;
            const custom = d.start === 'custom';
            return PM51.tiles(startsOf(d).map(([c, what, where]) => ({ title: c, text: what, meta: where, icon: 'terminal', selected: d.start === c, data: { start: c } }))
              .concat([{ title: 'Type my own command', text: 'Anything you would type in a terminal to start it.', icon: 'edit', selected: custom, data: { start: 'custom' } }]), { action: 'pm51-testing-pw-start' })
              + `<div class="o55-setup-fields">`
              + `<div class="tt-reveal" data-tt-reveal="command"${custom ? '' : ' hidden'}>${PM51.field('Command', `<input class="text-control o55-setup-mono tt-pw-command" value="${a(custom ? d.command : '')}" placeholder="For example: npm start" autocomplete="off" spellcheck="false"/>`)}</div>`
              + (d.kind === 'web' || d.kind === 'api' ? PM51.field(d.kind === 'web' ? 'Address it opens at' : 'Address it answers at', `<input class="text-control o55-setup-mono tt-pw-url" value="${a(d.url)}" placeholder="http://localhost:3000" autocomplete="off" spellcheck="false"/>`, 'Filled in from the command you pick. Tests wait until this answers.') : '')
              + `</div>`;
          },
          collect: (wrap, d) => { const x = val(wrap, '.tt-pw-extra'), c = val(wrap, '.tt-pw-command'), u = val(wrap, '.tt-pw-url'); if (x != null) d.extra = x; if (c != null && d.start === 'custom') d.command = c; if (u != null) d.url = u; },
          check: d => {
            if (d.kind === 'unit') return commandOf(d).length ? '' : 'Pick at least one test command, or type one.';
            if (!d.start) return 'Pick how it starts, or type your own command.';
            if (!d.command) return 'Type the command that starts it.';
            if ((d.kind === 'web' || d.kind === 'api') && !/^https?:\/\/\S+/.test(d.url)) return 'Enter the address, starting with http:// or https://.';
            return '';
          } },
        { label: 'Passing', icon: 'check', title: 'What counts as a pass?', lead: 'And where the results go afterwards.',
          recap: d => labelOf(PASS, d.pass),
          render: d => PM51.tiles(PASS.map(([id, title, text]) => ({ title, text, icon: id === 'all' ? 'check' : 'history', selected: d.pass === id, data: { key: 'pass', value: id } })), { action: 'pm51-testing-w-pick' })
            + (d.kind === 'web' ? `<div class="tt-w-flags">${PM51.rows([
              { label: 'Errors in the browser console count as a failure', help: 'Hidden errors a visitor would never see, but that usually mean something broke.', control: PM51.toggle(d.console, { action: 'pm51-testing-pw-flag', data: { flag: 'console' }, label: 'Console errors count as a failure' }) },
              { label: 'A changed screenshot counts as a failure', help: 'Pages are compared with the last run, so an unexpected change in looks is caught.', control: PM51.toggle(d.visual, { action: 'pm51-testing-pw-flag', data: { flag: 'visual' }, label: 'A changed screenshot counts as a failure' }) }
            ])}</div>` : '')
            + `<div class="o55-setup-fields">${PM51.field('Where results go', PM51.dropdown(d.results, RESULTS, { cls: 'tt-pw-results', label: 'Where results go' }))}${PM51.field('Stop the run after', PM51.dropdown(d.timeout, ['10 minutes', '20 minutes', '45 minutes', '2 hours'], { cls: 'tt-pw-timeout', label: 'Stop the run after' }), 'A run that takes longer is stopped and counts as failed.')}</div>`,
          collect: (wrap, d) => { const r = val(wrap, '.tt-pw-results'), tm = val(wrap, '.tt-pw-timeout'); if (r) d.results = r; if (tm) d.timeout = tm; } },
        { label: 'Where', icon: 'layers',
          title: d => d.kind === 'web' ? 'Which browsers and screen sizes?' : d.kind === 'desktop' ? 'Where should the app open?' : 'Where should the tests run?',
          lead: d => d.kind === 'web' ? 'More browsers catch more problems, but each one adds time.' : d.kind === 'desktop' ? 'Simulators and phones are used only when they are set up.' : 'On this computer is quickest. A clean container catches "works on my computer" problems.',
          recap: d => d.kind === 'web' ? namesOf(BROWSERS, d.browsers) : d.kind === 'desktop' ? namesOf(DEVICES, d.devices) : labelOf(WHERE, d.where),
          render: d => d.kind === 'web'
            ? PM51.tiles(BROWSERS.map(([id, title, text]) => ({ title, text, icon: 'browser', selected: d.browsers.includes(id), data: { key: 'browsers', value: id } })), { action: 'pm51-testing-w-pick', multi: true })
              + PM51.panelSection('Screen sizes', chipRow(SIZES, d.sizes, 'sizes', 'Screen sizes'), 'Each page is checked at every size you tick.', { icon: 'layers' })
            : d.kind === 'desktop'
              ? PM51.tiles(DEVICES.map(([id, title, text]) => ({ title, text, icon: id === 'this' ? 'system' : 'user', selected: d.devices.includes(id), data: { key: 'devices', value: id } })), { action: 'pm51-testing-w-pick', multi: true })
              : PM51.tiles(WHERE.map(([id, title, text]) => ({ title, text, icon: id === 'local' ? 'system' : id === 'container' ? 'archive' : 'server', selected: d.where === id, data: { key: 'where', value: id } })), { action: 'pm51-testing-w-pick' }),
          check: d => d.kind === 'web' ? (!d.browsers.length ? 'Pick at least one browser.' : !d.sizes.length ? 'Tick at least one screen size.' : '') : d.kind === 'desktop' ? (d.devices.length ? '' : 'Pick at least one place to open the app.') : '' },
        { label: 'Review', icon: 'check', title: 'Name it, and say when it runs', lead: 'Everything else is below. You can change any of it later.',
          render: d => {
            const moment = MOMENTS.find(m => m.value === d.moment), now = d.moment !== 'none' ? tr[d.moment] : '';
            return `<div class="o55-setup-fields">${PM51.field('Name', `<input class="text-control tt-pw-name" value="${a(d.name)}" placeholder="For example: Web app check" autocomplete="off" data-autofocus/>`)}`
              + PM51.field('It runs', PM51.dropdown(d.moment, MOMENTS, { cls: 'tt-pw-moment', label: 'It runs', action: 'pm51-testing-pw-moment' }), now && now !== 'None' ? `This takes the place of ${now} at that moment.` : moment && moment.value === 'none' ? 'You can also pick it later under When to test.' : '') + `</div>`
              + PM51.kv([
                ['Tests', kindOf(d.kind).title], [d.kind === 'unit' ? 'Runs' : 'Starts with', d.kind === 'unit' ? commandOf(d).join(', ') : d.command], d.url ? ['Address', d.url] : null,
                ['A pass means', labelOf(PASS, d.pass)], d.kind === 'web' ? ['Browsers', `${namesOf(BROWSERS, d.browsers)} · ${namesOf(SIZES, d.sizes)}`] : d.kind === 'desktop' ? ['Opens on', namesOf(DEVICES, d.devices)] : ['Runs', labelOf(WHERE, d.where)],
                ['Results go to', resultsLabel(d.results)], ['Stops after', d.timeout]
              ]);
          },
          collect: (wrap, d) => { const n = val(wrap, '.tt-pw-name'), m = val(wrap, '.tt-pw-moment'); if (n != null) d.name = n; if (m) d.moment = m; },
          check: d => !d.name ? 'Give the profile a name.' : profiles().some(p => p.name.toLowerCase() === d.name.toLowerCase()) ? `There is already a profile called ${d.name}.` : '' }
      ],
      onFinish: d => {
        const p = { id: uniqueId(profiles(), slug(d.name)), name: d.name, kind: d.kind, command: d.kind === 'unit' ? '' : d.command, commands: d.kind === 'unit' ? commandOf(d) : [], url: d.kind === 'web' || d.kind === 'api' ? d.url : '', pass: d.pass, console: d.kind === 'web' && d.console, visual: d.kind === 'web' && d.visual, results: d.results, timeout: d.timeout, retries: 1, browsers: d.kind === 'web' ? d.browsers.slice() : [], sizes: d.kind === 'web' ? d.sizes.slice() : [], devices: d.kind === 'desktop' ? d.devices.slice() : [], where: d.kind === 'web' || d.kind === 'desktop' ? 'local' : d.where, trigger: MOMENT_TRIGGER[d.moment], status: 'ready' };
        Object.assign(p, { description: describe(p), stages: stagesFor(p), browser: p.kind === 'web' ? `${namesOf(BROWSERS, p.browsers)} · ${namesOf(SIZES, p.sizes)}` : 'None', native: p.kind === 'desktop' ? namesOf(DEVICES, p.devices) : 'None', evidence: resultsLabel(p.results) });
        profiles().push(p);
        if (d.moment !== 'none') tr[d.moment] = p.name;
        PM51.setSel(ID + '-profiles', p.id); PM51.setTab(ID, 'profiles'); saveState(); PM51.refresh(ID, { swap: false });
        PM51.toast('Profile created', d.moment !== 'none' ? `${p.name} now runs ${MOMENTS.find(m => m.value === d.moment).label.toLowerCase()}.` : `${p.name} is on your list. Start it with Run now.`);
      }
    });
  }
  PM51.on('testing-add-profile', () => profileWizard());
  PM51.on('testing-pw-kind', el => {
    const w = PM51.wizardOf(el); if (!w) return; const d = w.draft, id = ds(el, 'kind');
    if (d.kind !== id) { const first = (STARTS[id] || [])[0] || []; Object.assign(d, { kind: id, start: id === 'unit' ? null : first[0] || null, command: id === 'unit' ? '' : first[0] || '', commands: id === 'unit' ? [first[0]].filter(Boolean) : [], url: first[3] || '', name: d.name && !KINDS.some(k => k.name === d.name) ? d.name : kindOf(id).name }); }
    w.next();
  });
  PM51.on('testing-pw-start', el => {
    const w = PM51.wizardOf(el); if (!w) return; const d = w.draft, id = ds(el, 'start');
    d.start = id;
    if (id === 'custom') { d.command = ''; reveal(el, '[data-tt-reveal="command"]', true); return; }
    const s = (STARTS[d.kind] || []).find(x => x[0] === id) || []; d.command = id; if (s[3]) d.url = s[3];
    reveal(el, '[data-tt-reveal="command"]', false);
    const u = el.closest('.o55g-main') && el.closest('.o55g-main').querySelector('.tt-pw-url'); if (u && s[3]) u.value = s[3];
  });
  PM51.on('testing-pw-flag', el => { const w = PM51.wizardOf(el); const f = ds(el, 'flag'); if (!w || !['console', 'visual'].includes(f)) return; w.draft[f] = !w.draft[f]; el.classList.toggle('on', w.draft[f]); el.setAttribute('aria-checked', String(w.draft[f])); });
  PM51.onChange('testing-pw-moment', el => {
    const w = PM51.wizardOf(el); if (!w) return; w.draft.moment = el.value;
    const help = el.closest('.pm51-field') && el.closest('.pm51-field').querySelector('.pm51-field-help'), now = el.value !== 'none' ? t().triggers[el.value] : '';
    const text = now && now !== 'None' ? `This takes the place of ${now} at that moment.` : el.value === 'none' ? 'You can also pick it later under When to test.' : '';
    if (help) help.textContent = text; else if (text) el.closest('.pm51-field').insertAdjacentHTML('beforeend', `<span class="pm51-field-help">${h(text)}</span>`);
  });
  /* One handler for every pick in the two helpers and in Edit: a card or square either picks one (a radio card) or
     adds and removes (check cards and squares). Outside a helper it only changes the square; Save reads it. */
  PM51.on('testing-w-pick', el => {
    const key = ds(el, 'key'), v = ds(el, 'value'), w = PM51.wizardOf(el);
    if (el.getAttribute('role') === 'radio') { if (w) w.draft[key] = v; return; }
    const pressed = el.hasAttribute('aria-pressed'), on = !(el.getAttribute(pressed ? 'aria-pressed' : 'aria-checked') === 'true');
    el.classList.toggle('is-on', on); el.setAttribute(pressed ? 'aria-pressed' : 'aria-checked', String(on));
    if (w && Array.isArray(w.draft[key])) { const list = w.draft[key], i = list.indexOf(v); if (on && i < 0) list.push(v); if (!on && i >= 0) list.splice(i, 1); }
  });
  PM51.onChange('testing-profile-field', el => { const p = profileById(ds(el, 'id')); const field = ds(el, 'field'); if (!p || !['timeout', 'retries'].includes(field)) return; p[field] = field === 'retries' ? Number(el.value) : el.value; saveState(); });

  /* ---------- when / browser / native --------------------------------------- */
  PM51.onChange('testing-trigger', el => { const key = ds(el, 'key'); const tr = t().triggers; if (!(key in tr)) return; tr[key] = key === 'retry' ? Number(el.value) : el.value; saveState(); if (key !== 'retry' && key !== 'then') PM51.refresh(ID, { swap: false }); });
  PM51.on('testing-browser', el => { const key = ds(el, 'key'); const b = t().browser; if (!(key in BROWSER_DEFAULTS)) return; b[key] = !b[key]; saveState(); PM51.refresh(ID, { swap: false }); });
  PM51.onChange('testing-browser-select', el => { const key = ds(el, 'key'); if (key !== 'screenshots') return; t().browser.screenshots = el.value; saveState(); });
  PM51.on('testing-native', el => { const key = ds(el, 'key'); const n = t().native; if (!(key in NATIVE_DEFAULTS)) return; n[key] = !n[key]; saveState(); PM51.refresh(ID, { swap: false }); });
  PM51.on('testing-check-tools', () => PM51.check({ title: 'Check test tools', steps: [
    { title: 'Test runner found', desc: 'The runner for each language in this project' },
    { title: 'Build tools found', desc: 'Compilers and package managers on this computer', status: 'Example', tone: 'info' },
    { title: 'Built-in browser ready', desc: 'Managed in Browser & SCM', status: 'Example', tone: 'info' }
  ] }));

  /* ---------- debug behaviour --------------------------------------------------- */
  function editDebug(id) {
    const d = debugById(id); if (!d) return;
    PM51.panel({
      title: `Edit ${d.name}`, subtitle: 'Changes apply the next time you start debugging.', icon: 'play',
      body: PM51.panelSection('Name', PM51.field('Name', PM51.input(d.name, { data: { field: 'name' } })))
        + PM51.panelSection('What to run', PM51.field('Debugger', PM51.select(d.adapter, withChoice(ADAPTERS, d.adapter), { data: { field: 'adapter' }, label: 'Debugger' })) + PM51.field('Program', PM51.input(d.program || '', { data: { field: 'program' } }), 'What gets started.') + PM51.field('Arguments', PM51.input(d.args || '', { data: { field: 'args' }, placeholder: 'Optional' })))
        + PM51.panelSection('Where', PM51.field('Environment', PM51.select(d.env || 'Project environment', withChoice(ENVS, d.env), { data: { field: 'env' }, label: 'Environment' })) + PM51.field('Working folder', PM51.input(folderText(d.cwd), { data: { field: 'cwd' } }), 'Project folder means the top folder of this workspace.')
          + PM51.field('Extra values', `<textarea class="form-textarea o55-setup-mono" data-field="envVars" rows="3" spellcheck="false" placeholder="NAME=value">${h((d.envVars || []).join('\n'))}</textarea>`, 'One NAME=value per line. Keep passwords out: these are saved as plain text.')),
      primaryLabel: 'Save',
      onPrimary: wrap => {
        const vars = lines(readField(wrap, 'envVars')), bad = vars.find(x => !ENV_RE.test(x));
        if (bad) { PM51.toast('One more thing', `"${bad}" needs to read NAME=value.`, 'info'); return false; }
        const name = readField(wrap, 'name'); if (name) d.name = name;
        d.adapter = readField(wrap, 'adapter') || d.adapter; d.program = readField(wrap, 'program'); d.args = readField(wrap, 'args'); d.env = readField(wrap, 'env') || d.env; d.envVars = vars;
        const cwd = readField(wrap, 'cwd'); d.cwd = !cwd || cwd === 'Project folder' ? '${projectRoot}' : cwd === 'The program\'s own folder' ? '${programFolder}' : cwd;
        saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Saved', `${d.name} was updated.`);
      }
    });
  }
  PM51.on('testing-start-debug', el => {
    const d = debugById(ds(el, 'id')); if (!d) return;
    PM51.check({
      title: `Start debugging · ${d.name}`, subtitle: 'Example data only. Nothing started in this preview.', outcome: 'Preview only', tone: 'info',
      steps: [
        { title: 'Build', desc: d.program || 'Program not set', status: 'Example', tone: 'info' },
        { title: 'Launch with the debugger', desc: d.adapter || 'Debugger not set', status: 'Example', tone: 'info' },
        { title: 'Stop at your breakpoints', desc: `In ${folderLabel(d.cwd).toLowerCase()} · ${d.env || 'project environment'}`, status: 'Example', tone: 'info' }
      ]
    });
  });
  PM51.on('testing-check-launch', el => {
    const d = debugById(ds(el, 'id')); if (!d) return;
    PM51.check({ title: `Check launch · ${d.name}`, steps: [
      { title: 'Debugger found', desc: d.adapter || 'Not set' },
      { title: 'Program exists', desc: d.program || 'Not set', status: 'Example', tone: 'info' },
      { title: 'Working folder exists', desc: folderLabel(d.cwd), status: 'Example', tone: 'info' }
    ] });
  });
  /* New debug profile: what to debug, which program, which debugger, then options and a recap. */
  const DEBUG_KINDS = [
    { id: 'rust', name: 'Rust app', title: 'A Rust program', text: 'Stops inside your Rust code at the lines you mark.', icon: 'code', adapters: ['CodeLLDB', 'GDB'], programs: [['target/debug/tastebook', 'tastebook', 'The main app. Built with cargo build first.'], ['target/debug/tastebook-api', 'tastebook-api', 'The API server. Built with cargo build first.']] },
    { id: 'node', name: 'Node.js app', title: 'A Node.js app or script', text: 'The web app\'s server side, or a script.', icon: 'terminal', adapters: ['Node.js inspector'], programs: [['npm run dev', 'npm run dev', 'The web app\'s dev server. Found in package.json.'], ['${file}', 'The file that is open', 'Whatever file you are looking at when you start.']] },
    { id: 'web', name: 'Web page', title: 'A web page in the browser', text: 'Pauses the page\'s own code inside the browser.', icon: 'browser', adapters: ['Browser devtools', 'Firefox devtools'], programs: [['http://localhost:5173', 'http://localhost:5173', 'The web app from npm run dev.']] },
    { id: 'python', name: 'Python script', title: 'A Python script', text: 'Steps through Python line by line.', icon: 'code', adapters: ['debugpy'], programs: [['${file}', 'The file that is open', 'Whatever file you are looking at when you start.']] },
    { id: 'go', name: 'Go program', title: 'A Go program', text: 'Steps through Go code.', icon: 'code', adapters: ['Delve'], programs: [['.', 'The program in the project folder', 'Built by Delve when you start.']] },
    { id: 'c', name: 'C program', title: 'A C or C++ program', text: 'For programs built with a C or C++ compiler.', icon: 'code', adapters: ['CodeLLDB', 'GDB'], programs: [] },
    { id: 'test', name: 'Current test', title: 'A test', text: 'Runs one test under the debugger, to see why it fails.', icon: 'test', adapters: ['Language-aware'], programs: [['Selected test', 'The test your cursor is in', 'Whichever test you are looking at.'], ['Tests in the open file', 'Every test in the open file', 'All the tests in the file you are looking at.']] },
    { id: 'attach', name: 'Running program', title: 'A program that is already running', text: 'Joins it without restarting it.', icon: 'link', adapters: ['Detected native debugger', 'Node.js inspector', 'debugpy'], programs: [['Ask each time', 'Ask me which one each time', 'A list of running programs appears when you start.']] }
  ];
  const ADAPTER_TEXT = { CodeLLDB: 'The usual debugger for Rust, C and C++.', GDB: 'The classic GNU debugger.', Delve: 'The Go debugger.', debugpy: 'Microsoft\'s Python debugger.', 'Node.js inspector': 'Built into Node.js.', 'Browser devtools': 'Chromium\'s developer tools.', 'Firefox devtools': 'Firefox\'s developer tools.', 'Language-aware': 'Picks the right debugger for the test\'s language.', 'Detected native debugger': 'Whichever debugger fits the program you pick.' };
  const ENVS = ['Project environment', 'Development', 'Test', 'Production'];
  const CWDS = [{ value: 'project', label: 'The project folder', meta: 'The top folder of this project' }, { value: 'program', label: 'The program\'s own folder' }, { value: 'custom', label: 'Another folder' }];
  const debugKind = id => DEBUG_KINDS.find(k => k.id === id);
  const cwdOf = d => d.cwdPick === 'custom' ? d.cwd : d.cwdPick === 'program' ? '${programFolder}' : '${projectRoot}';
  const folderText = cwd => cwd === '${programFolder}' ? 'The program\'s own folder' : folderLabel(cwd);
  function debugWizard() {
    const draft = { kind: null, program: '', pick: null, adapter: '', args: '', cwdPick: 'project', cwd: '', env: 'Project environment', envVars: '', name: '' };
    PM51.wizard({
      title: 'New debug profile', eyebrow: 'Debug profile', icon: 'play', finishLabel: 'Create profile', draft,
      subtitle: 'A debug profile starts your program so it can be paused and looked inside, one click from the Debug list.',
      steps: [
        { label: 'What', icon: 'play', title: 'What do you want to debug?', lead: 'Pick what you are working on. The next steps fill in from it.',
          render: d => PM51.tiles(DEBUG_KINDS.map(k => ({ title: k.title, text: k.text, meta: `Uses ${k.adapters[0]}`, icon: k.icon, selected: d.kind === k.id, data: { kind: k.id } })), { action: 'pm51-testing-dw-kind' }),
          check: d => d.kind ? '' : 'Pick what to debug to go on.' },
        { label: 'Program', icon: 'terminal',
          title: d => d.kind === 'attach' ? 'Which program should it join?' : d.kind === 'web' ? 'Which page should open?' : d.kind === 'test' ? 'Which tests?' : 'Which program should start?',
          lead: d => (debugKind(d.kind) || {}).programs && debugKind(d.kind).programs.length ? 'Found in this project. Pick one, or name another.' : 'Name the program to start. Its full path, or its name if it is on your PATH.',
          recap: d => d.program,
          render: d => {
            const k = debugKind(d.kind) || { programs: [] }, custom = d.pick === 'custom' || !k.programs.length;
            const other = d.kind === 'attach' ? ['A program by name', 'Joins the first running program with this name.'] : d.kind === 'web' ? ['Another address', 'Any page, on this computer or elsewhere.'] : ['Another program', 'Any program, by its path or name.'];
            return (k.programs.length ? PM51.tiles(k.programs.map(([v, title, text]) => ({ title, text, icon: d.kind === 'web' ? 'globe' : 'terminal', selected: d.pick === v, data: { pick: v } }))
                .concat([{ title: other[0], text: other[1], icon: 'edit', selected: d.pick === 'custom', data: { pick: 'custom' } }]), { action: 'pm51-testing-dw-program' }) : '')
              + `<div class="o55-setup-fields tt-reveal" data-tt-reveal="program"${custom ? '' : ' hidden'}>${PM51.field(d.kind === 'web' ? 'Address' : d.kind === 'attach' ? 'Program name' : 'Program', `<input class="text-control o55-setup-mono tt-dw-program" value="${a(custom ? d.program : '')}" placeholder="${a(d.kind === 'web' ? 'http://localhost:3000' : d.kind === 'attach' ? 'For example: tastebook' : 'For example: build/app')}" autocomplete="off" spellcheck="false"/>`)}</div>`;
          },
          collect: (wrap, d) => { const k = debugKind(d.kind) || { programs: [] }; const v = val(wrap, '.tt-dw-program'); if (v != null && (d.pick === 'custom' || !k.programs.length)) { d.pick = 'custom'; d.program = v; } },
          check: d => !d.pick ? 'Pick one, or name another.' : !d.program ? (d.kind === 'web' ? 'Type the address.' : 'Type the program.') : d.kind === 'web' && !/^https?:\/\/\S+/.test(d.program) ? 'The address starts with http:// or https://.' : '' },
        { label: 'Debugger', icon: 'search', title: 'Which debugger?', lead: 'The first one is what most people use for this. It is found or installed when you first start.',
          render: d => PM51.tiles(((debugKind(d.kind) || {}).adapters || ADAPTERS.slice(0, 1)).map((ad, i) => ({ title: ad, text: ADAPTER_TEXT[ad] || '', meta: i === 0 ? 'Suggested' : '', icon: 'search', selected: d.adapter === ad, data: { adapter: ad } })), { action: 'pm51-testing-dw-adapter' }),
          check: d => d.adapter ? '' : 'Pick a debugger.' },
        { label: 'Options', icon: 'sliders', title: 'Anything to pass it?', lead: 'Most programs need nothing here. Leave it as it is unless you know you need it.',
          render: d => `<div class="o55-setup-fields">`
            + (d.kind === 'web' || d.kind === 'attach' ? '' : PM51.field('Arguments', `<input class="text-control o55-setup-mono tt-dw-args" value="${a(d.args)}" placeholder="None" autocomplete="off" spellcheck="false"/>`, 'Words added after the program name, the way you would type them in a terminal.'))
            + (d.kind === 'web' || d.kind === 'attach' ? '' : PM51.field('Working folder', PM51.dropdown(d.cwdPick, CWDS, { cls: 'tt-dw-cwdpick', label: 'Working folder', action: 'pm51-testing-dw-cwd' }), 'The folder the program starts in. Files it opens by name are looked for here.')
              + `<div class="tt-reveal" data-tt-reveal="cwd"${d.cwdPick === 'custom' ? '' : ' hidden'}>${PM51.field('Folder', `<input class="text-control o55-setup-mono tt-dw-cwd" value="${a(d.cwd)}" placeholder="For example: web/" autocomplete="off" spellcheck="false"/>`)}</div>`)
            + PM51.field('Environment', PM51.dropdown(d.env, ENVS, { cls: 'tt-dw-env', label: 'Environment' }), 'Which set of settings the program starts with.')
            + PM51.field('Extra values (optional)', `<textarea class="form-textarea o55-setup-mono tt-dw-vars" rows="3" spellcheck="false" placeholder="RUST_LOG=debug">${h(d.envVars)}</textarea>`, 'One NAME=value per line. Keep passwords out: these are saved as plain text.')
            + `</div>`,
          collect: (wrap, d) => { const g = s => val(wrap, s); if (g('.tt-dw-args') != null) d.args = g('.tt-dw-args'); if (g('.tt-dw-cwdpick')) d.cwdPick = g('.tt-dw-cwdpick'); if (g('.tt-dw-cwd') != null) d.cwd = g('.tt-dw-cwd'); if (g('.tt-dw-env')) d.env = g('.tt-dw-env'); if (g('.tt-dw-vars') != null) d.envVars = g('.tt-dw-vars'); },
          check: d => { const bad = lines(d.envVars).find(x => !ENV_RE.test(x)); return bad ? `"${bad}" needs to read NAME=value.` : d.cwdPick === 'custom' && !d.cwd && d.kind !== 'web' && d.kind !== 'attach' ? 'Type the folder, or pick another choice.' : ''; } },
        { label: 'Review', icon: 'check', title: 'Name it, and check the details', lead: 'It appears in the Debug list with a Start debugging button.',
          render: d => `<div class="o55-setup-fields">${PM51.field('Name', `<input class="text-control tt-dw-name" value="${a(d.name)}" placeholder="For example: API server" autocomplete="off" data-autofocus/>`)}</div>`
            + PM51.kv([['Debugs', (debugKind(d.kind) || {}).title || ''], [d.kind === 'web' ? 'Opens' : d.kind === 'attach' ? 'Joins' : 'Starts', d.program], ['Debugger', d.adapter], d.kind === 'web' || d.kind === 'attach' ? null : ['Arguments', d.args || 'None'], d.kind === 'web' || d.kind === 'attach' ? null : ['Working folder', folderText(cwdOf(d))], ['Environment', d.env], ['Extra values', lines(d.envVars).length ? lines(d.envVars).map(x => x.split('=')[0]).join(', ') : 'None']]),
          collect: (wrap, d) => { const n = val(wrap, '.tt-dw-name'); if (n != null) d.name = n; },
          check: d => !d.name ? 'Give the profile a name.' : debugs().some(x => x.name.toLowerCase() === d.name.toLowerCase()) ? `There is already a debug profile called ${d.name}.` : '' }
      ],
      onFinish: d => {
        const rec = { id: uniqueId(debugs(), slug(d.name)), name: d.name, kind: d.kind, adapter: d.adapter, program: d.program, args: d.kind === 'web' || d.kind === 'attach' ? '' : d.args, env: d.env, envVars: lines(d.envVars), cwd: d.kind === 'web' || d.kind === 'attach' ? '${projectRoot}' : cwdOf(d), status: 'ready' };
        debugs().push(rec); PM51.setSel(ID + '-debug', rec.id); PM51.setTab(ID, 'debug'); saveState(); PM51.refresh(ID, { swap: false });
        PM51.toast('Debug profile created', `${rec.name} is in the Debug list. Start debugging runs it with ${rec.adapter}.`);
      }
    });
  }
  PM51.on('testing-add-debug', () => debugWizard());
  PM51.on('testing-dw-kind', el => {
    const w = PM51.wizardOf(el); if (!w) return; const d = w.draft, k = debugKind(ds(el, 'kind')); if (!k) return;
    if (d.kind !== k.id) { const first = k.programs[0]; Object.assign(d, { kind: k.id, pick: first ? first[0] : 'custom', program: first ? first[0] : '', adapter: k.adapters[0], name: d.name && !DEBUG_KINDS.some(x => x.name === d.name) ? d.name : k.name }); }
    w.next();
  });
  PM51.on('testing-dw-program', el => {
    const w = PM51.wizardOf(el); if (!w) return; const d = w.draft, v = ds(el, 'pick'), k = debugKind(d.kind);
    d.pick = v;
    if (v === 'custom') { d.program = ''; reveal(el, '[data-tt-reveal="program"]', true); return; }
    reveal(el, '[data-tt-reveal="program"]', false);
    d.program = v;
    w.next();
  });
  PM51.on('testing-dw-adapter', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.adapter = ds(el, 'adapter'); w.next(); });
  PM51.onChange('testing-dw-cwd', el => { const w = PM51.wizardOf(el); if (w) w.draft.cwdPick = el.value; reveal(el, '[data-tt-reveal="cwd"]', el.value === 'custom'); });
  PM51.on('testing-open-debug-list', el => { closeOverlay(false); PM51.setTab(ID, 'debug'); window.setTimeout(() => PM51.revealSetting((el && el.dataset && el.dataset.setting) || 'code.execution.debug-configurations'), 60); });

  /* ---------- history behaviour -------------------------------------------------- */
  PM51.on('testing-open-run', el => {
    const r = t().runs[Number(ds(el, 'index'))]; if (!r) return;
    const p = profiles().find(x => x.name === r.profile);
    const failed = /fail/i.test(r.result);
    PM51.panel({
      title: r.profile, subtitle: r.time, pill: PM51.pill(r.result),
      body: PM51.panelSection('Summary', PM51.kv([['Result', r.result], ['Took', r.duration], ['Stages', p ? `${p.stages.length}` : 'Unknown']]))
        + (p ? PM51.panelSection('Stages', PM51.steps(p.stages.map((s, i) => ({ title: s, status: failed && i === p.stages.length - 2 ? 'Failed' : 'Passed', tone: failed && i === p.stages.length - 2 ? 'blocked' : 'ready', done: !(failed && i === p.stages.length - 2) })))) : '')
        + PM51.panelSection('Evidence', PM51.kv([['Screenshots', (t().browser.screenshots || 'On failure') === 'Never' ? 'Off' : failed || t().browser.screenshots === 'Always' ? 'Kept for the failing stage' : 'None needed'], ['Logs', `${failed ? 'Full output' : 'Summary only'}${V('planning.verification.evidence-redaction') ? ', secrets hidden' : ''}`]]))
        + PM51.note('Example data only. Real runs show their own stages and evidence here.', 'info')
    });
  });
  PM51.on('testing-export', () => PM51.panel({
    title: 'Export evidence', subtitle: 'A folder with the runs you choose, safe to share.',
    body: PM51.panelSection('What goes in', PM51.kv([['Runs', String(t().runs.length)], ['Includes', 'Summaries, logs with secrets hidden, screenshots'], ['Format', 'One folder per run']])) + PM51.note('Files are written only in the real app. Nothing was exported in this preview.', 'info')
  }));
  PM51.on('testing-clear-history', () => PM51.confirm('Clear run history?', 'Past runs and their evidence are removed from this list.', 'Clear', () => { t().runs = []; saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('History cleared', 'The list is empty.'); }, true));

  /* ---------- shared ------------------------------------------------------------- */
  PM51.on('testing-diagnostics', () => PM51.check({ title: 'Testing diagnostics', steps: [
    { title: 'Profiles readable', desc: `${profiles().length} test profiles and ${debugs().length} debug profiles` },
    { title: 'Test runner found', desc: 'Looked up on this computer', status: 'Example', tone: 'info' },
    { title: 'Evidence folder writable', desc: 'Where screenshots and logs are kept', status: 'Example', tone: 'info' }
  ] }));
  PM51.on('testing-reset', () => PM51.confirm('Reset testing defaults?', 'Profiles, moments, browser and native options, and evidence settings go back to their defaults.', 'Reset', () => {
    state.testProfiles = clone(DEFAULTS.testProfiles); state.debugProfiles = clone(DEFAULTS.debugProfiles); PM51.s().testing = clone(DATA.testing);
    ['profiles', 'debug'].forEach(k => PM51.setSel(ID + '-' + k, ''));
    saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Testing reset', 'Defaults are back.');
  }));
  PM51.on('testing-help', () => PM51.panel({
    title: 'How testing works',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A test profile is a list of stages that run in order. Puppet Master picks a profile for each moment: quick checks while you work, a thorough run before a job counts as done, and a full run for releases.</p>')
      + PM51.panelSection('The tabs', PM51.kv([['Profiles', 'What each profile checks, and a Run now button.'], ['When to test', 'Whether automated tests may run, which profile runs at which moment, and what happens on failure.'], ['What it can test', 'Screen checks in the built-in browser, and app checks for desktop apps.'], ['Debug', 'One-click debugging for your program or a test.'], ['History', 'Past runs and the evidence kept from them.']]))
      + PM51.panelSection('Good to know', '<p class="pm51-ps-text">Secrets are hidden before any log or screenshot is saved.</p>')
  }));
})();
