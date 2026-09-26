/* Source Control — code services, local tools, repositories, defaults & safety, actions & pipelines. */
(function () {
  const ID = 'source-manager';
  const KEY = 'source-control';
  const TOOL_SEL = 'source-tools';
  const TABS = [
    { id: 'services', label: 'Code Services' },
    { id: 'tools', label: 'Local Tools' },
    { id: 'repos', label: 'Repositories' },
    { id: 'defaults', label: 'Defaults & Safety' },
    { id: 'actions', label: 'Actions & Pipelines' }
  ];
  const VERB = { github: 'Connect GitHub', 'github-enterprise': 'Connect GitHub Enterprise', gitlab: 'Connect GitLab', 'gitlab-self': 'Connect GitLab', azure: 'Connect Azure DevOps', 'azure-server': 'Connect Azure DevOps Server', bitbucket: 'Connect Bitbucket', 'bitbucket-dc': 'Connect Bitbucket', forgejo: 'Connect Forgejo', gitea: 'Connect Gitea', 'cursor-origin': 'Connect Cursor Origin', 'generic-git': 'Add repository' };
  const API = { github: 'api.github.com', gitlab: 'gitlab.com/api/v4', azure: 'dev.azure.com', bitbucket: 'api.bitbucket.org/2.0', 'cursor-origin': 'origin.cursor.com' };
  const TOOL_USES = { git: 'Branches', jj: 'Bookmarks', 'git-lfs': 'Large files' };
  const TOOL_PATH = { git: '/usr/bin/git', jj: '/usr/local/bin/jj', 'git-lfs': '/usr/bin/git-lfs' };
  const TOOL_HELP = { git: 'Git names its lines of work branches.', jj: 'Jujutsu names its lines of work bookmarks.', 'git-lfs': 'Keeps big files out of the main history.' };
  const TRIGGER = { 'Push and pull request': 'runs on every push and pull request', Manual: 'started by hand', Tag: 'runs when a release tag is made' };
  const RECOVERY_POINTS = [
    { title: 'Before push of main', meta: 'GitHub · 8 minutes ago' },
    { title: 'Before branch cleanup', meta: 'audit/settings · yesterday' },
    { title: 'Before force push attempt', meta: 'Denied on main · 2 days ago' }
  ];
  const UPDATE_POLICIES = ['Follow the system package', 'Ask me', 'Update automatically'];
  let seq = 0;
  const newId = p => p + '-' + Date.now().toString(36) + '-' + (++seq);

  const sc = () => state.sourceControl || (state.sourceControl = {});
  const forges = () => sc().forges || (sc().forges = []);
  const tools = () => sc().tools || (sc().tools = []);
  const repos = () => sc().repositories || (sc().repositories = []);
  const worktrees = () => sc().worktrees || (sc().worktrees = []);
  const workflows = () => sc().actions || (sc().actions = []);
  const host = () => (((PM51.s().serverProject || {}).servers || []).find(s => s.default) || {}).name || 'Home TrueNAS';
  const cfg = () => { const s = PM51.s(); if (!s.sourceDefaults) s.sourceDefaults = { tool: 'Git', branch: 'main', service: 'GitHub', protectMain: true, forcePush: 'Never', askDelete: true, backupRisky: true, updatePolicy: {} }; return s.sourceDefaults; };
  const connected = f => f.status === 'active';
  const statusLabel = f => connected(f) ? 'Connected' : f.status === 'needs-signin' ? 'Needs sign-in' : 'Not connected';
  const statusTone = f => connected(f) ? 'ready' : f.status === 'needs-signin' ? 'attention' : 'off';
  const hasSignIn = f => /oauth|sign-in|entra|app/i.test(f.auth || '');
  const byId = id => forges().find(f => f.id === id);
  const selectedForge = () => byId(PM51.sel(ID)) || forges()[0];
  const selectedTool = () => tools().find(t => t.id === PM51.sel(TOOL_SEL)) || tools()[0];
  const withCurrent = (list, v) => !v || list.includes(v) ? list : [v, ...list];
  const refresh = () => PM51.refresh(ID, { swap: false });
  const repoPill = r => r.state === 'Clean' ? PM51.pill('Ready') : r.state === 'Checking' ? PM51.pill('Checking') : PM51.pill('Needs attention');
  const repoAddress = r => r.address ? r.address : r.forge === 'Local' ? 'This server only' : r.forge === 'GitHub' ? `github.com/${(byId('github') || {}).defaultAccount || 'you'}/${r.name}` : `${r.name} on ${r.forge}`;
  const repoWorktrees = r => worktrees().filter(w => (w.repo || (repos()[0] || {}).name) === r.name);
  const ownerLabel = w => { const m = /^Goal\s+(\S+)$/.exec(String(w.owner || '')); if (!m) return w.owner === 'User' ? 'You' : w.owner; const g = (state.activeGoals || []).find(x => x.id === m[1]); return g ? `Goal: ${g.name}` : 'A Goal'; };

  PM51.style(`
#panel-settings .pm51-source-pin.is-on { color: var(--k3-accent); }
#panel-settings .pm51-source-pair { display: flex; gap: 6px; align-items: center; }
`);

  /* ---------- Code Services -------------------------------------------- */
  function setupSteps(f) {
    if (f.kind === 'hosted') return '';
    const addr = f.addressLabel || 'Service address';
    const steps = [
      { title: addr, desc: f.instanceUrl || (f.kind === 'generic' ? 'Where the repository lives, by SSH or HTTPS.' : 'Where your organization runs it.'), status: f.instanceUrl ? 'Ready' : 'Not set up', tone: f.instanceUrl ? 'ready' : 'off', done: !!f.instanceUrl, action: { label: f.instanceUrl ? 'Change' : 'Enter address', action: 'pm51-source-address', data: { id: f.id } } }
    ];
    if (f.kind !== 'generic') steps.push({ title: 'Sign in or create account', desc: hasSignIn(f) ? 'Use your organization account. Enter a token if sign-in is not offered.' : 'Enter a token from your account settings on the service.', status: connected(f) ? 'Ready' : 'Not set up', tone: connected(f) ? 'ready' : 'off', done: connected(f), action: connected(f) ? null : { label: hasSignIn(f) ? 'Sign in' : 'Enter token', action: 'pm51-source-connect', data: { id: f.id } } });
    steps.push({ title: 'Push access', desc: 'Lets the assistant send changes there.', status: f.pushAccess === 'Ready' ? 'Ready' : 'Not set up', tone: f.pushAccess === 'Ready' ? 'ready' : 'off', done: f.pushAccess === 'Ready', action: f.pushAccess === 'Ready' ? null : { label: 'Set up push access', action: 'pm51-source-push', data: { id: f.id } } });
    return PM51.section({ title: 'Set up', help: 'You can stop and come back at any point.', body: PM51.steps(steps) });
  }
  function servicesTab() {
    const f = selectedForge();
    if (!f) return PM51.empty('No code services', 'Code services keep your work online and let you review changes.');
    const on = connected(f);
    const rows = f.kind === 'generic' ? [
      { label: 'Access', help: 'How the assistant reaches the repository.', value: f.auth },
      { label: 'Reviews', help: 'Plain repositories have no review feature.', value: 'Not available', muted: true },
      { label: 'Automation', value: 'Not available', muted: true },
      { label: 'Connection', help: f.instanceUrl ? (f.lastCheck ? `Checked ${f.lastCheck}` : 'Not checked yet') : 'Enter an address first', action: { label: 'Check connection', icon: 'test', action: 'pm51-source-check', data: { id: f.id } } }
    ] : [
      { label: 'Signed in as', value: on ? f.defaultAccount : 'Nobody yet', muted: !on },
      { label: 'Accounts', help: 'You can sign in with more than one.', value: f.accounts ? String(f.accounts) : 'None', muted: !f.accounts },
      { label: 'Reviews are called', help: 'What this service names a code review.', value: f.reviewLabel },
      { label: 'Automation', help: 'What runs builds and tests on this service.', value: f.automationLabel },
      f.modes ? { label: 'Mode', help: 'Native keeps the code on Cursor Origin. Mirrored copies it from GitHub.', control: PM51.segmented(f.mode || f.modes[0], f.modes, { action: 'pm51-source-mode', data: { id: f.id }, label: 'Cursor Origin mode' }) } : null,
      { label: 'Default for new repositories', help: 'New repositories are created here.', control: on ? PM51.toggle(cfg().service === f.name, { action: 'pm51-source-default-service', data: { id: f.id }, label: 'Default for new repositories' }) : '<span class="pm51-row-value is-muted">Connect first</span>' },
      { label: 'Connection', help: on ? (f.lastCheck ? `Checked ${f.lastCheck}` : 'Not checked yet') : 'Nothing to check until it is connected', action: { label: 'Check connection', icon: 'test', action: 'pm51-source-check', data: { id: f.id } } }
    ];
    const account = on ? f.defaultAccount : 'you';
    const body = setupSteps(f) + PM51.rows(rows) + PM51.advanced([
      PM51.section({ title: 'Technical details', body: PM51.kv([
        ['Sign-in method', f.auth],
        ['API address', API[f.id] || (f.instanceUrl ? f.instanceUrl.replace(/\/$/, '') + '/api' : 'Known once the address is entered')],
        ['Permissions granted', (f.scopes || []).length ? f.scopes.join(' · ') : 'None yet'],
        ['SSH host key', f.ssh],
        ['Fetch address', f.id === 'github' && on ? `https://github.com/${account}/Puppet-Master.git` : f.kind === 'generic' ? (f.instanceUrl || 'Not set') : 'Set when the first repository is added'],
        ['Push address', f.id === 'github' && on ? `git@github.com:${account}/Puppet-Master.git` : f.kind === 'generic' ? (f.instanceUrl || 'Not set') : 'Set when the first repository is added'],
        ['Last test', f.lastTest || 'Not run']
      ]) + '<div style="margin-top:10px">' + PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-source-diagnostics' }) + '</div>' })
    ].join(''));
    return PM51.listDetail({
      id: ID, rosterTitle: 'Code services', count: forges().length,
      add: { action: 'pm51-source-add-service', label: 'Add another account or instance' },
      items: forges().map(x => ({ id: x.id, title: x.name, meta: connected(x) ? `Connected as ${x.defaultAccount}` : x.status === 'needs-signin' ? 'Needs sign-in' : 'Not connected', tone: statusTone(x), selected: x.id === f.id })),
      detail: {
        title: f.name, pill: PM51.pill(statusLabel(f), statusTone(f)),
        subtitle: f.help || (f.kind === 'instance' ? 'A service your organization runs.' : 'Keep code online and work from more than one computer.'),
        primary: on ? { label: 'Add account', icon: 'plus', action: 'pm51-source-connect', data: { id: f.id } } : { label: VERB[f.id] || `Connect ${f.name}`, icon: f.kind === 'generic' ? 'plus' : 'link', action: 'pm51-source-connect', data: { id: f.id } },
        menu: anchor => serviceMenu(anchor, f),
        body
      }
    });
  }
  function serviceMenu(anchor, f) {
    const on = connected(f); const isDefault = cfg().service === f.name;
    PM51.menu(anchor, [
      { label: 'Reauthorize', icon: 'refresh', ariaDisabled: !on, meta: on ? '' : 'Connect first', onClick: () => connectPanel(f, true) },
      { label: 'Open in browser', icon: 'external', onClick: () => PM51.unavailable('Open in browser', 'Opening links needs the desktop app.') },
      { label: 'Make default', icon: 'check', ariaDisabled: !on || isDefault, meta: !on ? 'Connect first' : isDefault ? 'Already the default' : '', onClick: () => { cfg().service = f.name; saveState(); refresh(); PM51.toast('Default code service', `New repositories are created on ${f.name}.`); } },
      { separator: true },
      { label: 'Disconnect', icon: 'close', danger: true, ariaDisabled: !on, meta: on ? '' : 'Not connected', onClick: () => disconnect(f) }
    ], f.name);
  }
  function connectPanel(f, reauth) {
    const on = connected(f);
    if (f.kind === 'generic') {
      PM51.panel({
        title: 'Add repository', subtitle: 'A plain Git repository reached by SSH or HTTPS. No reviews or pipelines.',
        body: PM51.panelSection('Repository', PM51.field('Repository address', PM51.input(f.instanceUrl || '', { placeholder: 'git@example.com:team/project.git', label: 'Repository address', cls: 'pm51-source-addr' }), 'SSH addresses start with git@. HTTPS addresses start with https://.')
          + PM51.field('Access', PM51.select('SSH key', ['SSH key', 'HTTPS with token'], { label: 'Access', cls: 'pm51-source-access' }), `SSH keys live on ${host()}.`)),
        primaryLabel: 'Add repository', onPrimary: wrap => {
          const addr = ((wrap.querySelector('.pm51-source-addr') || {}).value || '').trim();
          if (!/^(git@|https?:\/\/|ssh:\/\/)\S+/.test(addr)) { PM51.toast('Enter a repository address', 'It should start with git@, ssh://, or https://', 'warning'); return false; }
          f.instanceUrl = addr; f.auth = (wrap.querySelector('.pm51-source-access') || {}).value || f.auth;
          const name = addr.replace(/\.git$/, '').split(/[/:]/).pop() || 'repository';
          if (!repos().some(r => r.name === name)) repos().push({ name, forge: f.name, remote: 'origin', address: addr, branch: cfg().branch || 'main', state: 'Checking', protection: 'None', lfs: 'Not needed' });
          saveState(); refresh(); PM51.toast('Repository added', `${name} appears under Repositories. Fetching happens in the app.`, 'info');
        }
      });
      return;
    }
    const signIn = hasSignIn(f);
    const title = reauth ? `Reauthorize ${f.name}` : on ? `Add another ${f.name} account` : (VERB[f.id] || `Connect ${f.name}`);
    const body = (f.kind === 'instance' && !f.instanceUrl ? PM51.note(`Enter the ${(f.addressLabel || 'service address').toLowerCase()} first so sign-in knows where to go.`, 'attention') : '')
      + PM51.panelSection('What happens next', PM51.steps(signIn ? [
        { title: 'Your browser opens the sign-in page', desc: `${f.name} asks you to approve Puppet Master.` },
        { title: 'You approve', desc: 'Only the permissions listed under Technical details are requested.' },
        { title: 'The account appears here', desc: 'You can add more accounts later.' }
      ] : [
        { title: `Create a token on ${f.name}`, desc: 'In your account settings, with repository and review permissions.' },
        { title: 'Enter it below', desc: 'It is kept in the system keychain, never in a file.' },
        { title: 'The account appears here', desc: 'You can add more accounts later.' }
      ]))
      + PM51.panelSection(signIn ? 'No browser sign-in available?' : 'Token', PM51.field('Token', PM51.input('', { type: 'password', placeholder: signIn ? 'Enter a token instead' : 'Enter your token', label: 'Token' }), 'Kept in the system keychain.'));
    PM51.panel({ title, subtitle: f.help || '', body, primaryLabel: signIn ? 'Open sign-in' : 'Save token', onPrimary: () => PM51.toast(signIn ? 'Sign-in opens in the app' : 'Nothing saved', signIn ? 'Example data only. Your browser is not opened in this preview.' : 'Example data only. Tokens are stored by the desktop app.', 'info') });
  }
  function disconnect(f) {
    PM51.confirm(`Disconnect ${f.name}?`, `Puppet Master forgets the ${f.defaultAccount} account. Your repositories on ${f.name} are not touched.`, 'Disconnect', () => {
      Object.assign(f, { status: 'not-connected', accounts: 0, defaultAccount: 'None', scopes: [], ssh: 'Not tested', lastTest: 'Not run', pushAccess: 'Not set up', lastCheck: '' });
      if (cfg().service === f.name) cfg().service = 'None';
      saveState(); refresh(); PM51.toast('Disconnected', f.name, 'warning');
    }, true);
  }

  /* ---------- Local Tools ---------------------------------------------- */
  function toolsTab() {
    const t = selectedTool();
    if (!t) return PM51.empty('No local tools', 'Git and Jujutsu keep version history on your server.');
    const ready = t.status === 'ready';
    const policy = (cfg().updatePolicy || {})[t.id] || UPDATE_POLICIES[0];
    const primary = !ready ? { label: `Install ${t.name}`, icon: 'download', action: 'pm51-source-install', data: { id: t.id } }
      : (t.id !== 'git-lfs' && !t.default ? { label: 'Make default', icon: 'check', action: 'pm51-source-tool-default', data: { id: t.id } } : null);
    const body = PM51.rows([
      { label: 'Version', value: ready ? t.version : 'Not installed', muted: !ready },
      { label: 'Runs on', help: 'Where version history work happens.', value: host() },
      { label: 'Installed from', value: ready ? t.source : 'Nowhere yet', muted: !ready },
      { label: 'Uses', help: TOOL_HELP[t.id] || '', value: TOOL_USES[t.id] || '' },
      { label: 'Status', pill: PM51.pill(ready ? 'Ready' : 'Not installed'), help: t.lastCheck ? `Checked ${t.lastCheck}` : 'Not checked yet', action: { label: 'Check tool', icon: 'test', action: 'pm51-source-check-tool', data: { id: t.id } } }
    ]) + PM51.advanced([
      PM51.section({ title: 'Technical details', body: PM51.kv([['Executable', ready ? TOOL_PATH[t.id] || '' : 'Not installed'], ['Update policy', policy], ['Managed by', ready ? t.source : 'Nothing yet'], ['Default tool', t.default ? 'Yes' : 'No']]) })
    ].join(''));
    return PM51.listDetail({
      id: ID, rosterTitle: 'Local tools', count: tools().length, selectAction: 'pm51-source-select-tool',
      items: tools().map(x => ({ id: x.id, title: x.name, meta: x.status === 'ready' ? `${x.version}${x.default ? ' · default' : ''} · ${host()}` : 'Not installed', tone: x.status === 'ready' ? 'ready' : 'off', avatar: icon('branch'), selected: x.id === t.id })),
      detail: {
        title: t.name, pill: (t.default ? PM51.pill('Default', 'info') + ' ' : '') + PM51.pill(ready ? 'Ready' : 'Not installed'),
        subtitle: t.id === 'git' ? 'The most common version history tool.' : t.id === 'jj' ? 'A newer tool that makes undo easy. Works alongside Git.' : 'An add-on for Git that handles big files.',
        primary,
        menu: anchor => PM51.menu(anchor, [
          { label: 'Check for update', icon: 'refresh', onClick: () => PM51.check({ title: `Check for ${t.name} update`, steps: [{ title: 'Installed version', desc: ready ? t.version : 'Not installed' }, { title: 'Newest available', desc: `Looked up from ${ready ? t.source.toLowerCase() : 'the official source'}`, status: 'Example', tone: 'info' }, { title: 'Update policy', desc: policy, status: 'Checked', tone: 'ready' }] }) },
          { label: 'Update policy', icon: 'sliders', onClick: () => PM51.panel({ title: 'Update policy', subtitle: t.name, body: PM51.panelSection('When a newer version is available', PM51.field('Policy', PM51.select(policy, UPDATE_POLICIES, { label: 'Update policy' }), 'Following the system package is the safest default.')), primaryLabel: 'Save', onPrimary: wrap => { const sel = wrap.querySelector('select'); cfg().updatePolicy = cfg().updatePolicy || {}; if (sel) cfg().updatePolicy[t.id] = sel.value; saveState(); refresh(); } }) }
        ], t.name),
        body
      }
    });
  }

  /* ---------- Repositories --------------------------------------------- */
  function reposTab() {
    const list = repos(); const wts = worktrees();
    return [
      PM51.section({
        title: 'Repositories', help: 'Folders whose history Puppet Master keeps.',
        action: { label: 'Add repository', icon: 'plus', action: 'pm51-source-add-repo' },
        body: list.length ? PM51.list(list.map(r => ({
          title: r.name, meta: `${r.forge === 'Local' ? 'This server only' : r.forge} · ${r.branch}`, pill: repoPill(r),
          note: r.state !== 'Clean' && r.state !== 'Checking' ? `${r.state} · not yet saved to history` : '',
          action: 'pm51-source-repo', data: { name: r.name },
          end: PM51.btn({ label: 'Open', small: true, action: 'pm51-source-repo', data: { name: r.name } })
        }))) : PM51.empty('No repositories yet', 'Add a folder, clone from a code service, or start history in this folder.', { label: 'Add repository', icon: 'plus', action: 'pm51-source-add-repo' })
      }),
      PM51.section({
        title: 'Worktrees', help: 'Extra copies of a repository so two things can happen at once.',
        action: { label: 'Create worktree', icon: 'plus', action: 'pm51-source-worktree-new' },
        body: wts.length ? PM51.list(wts.map(w => ({
          title: w.name, meta: `${w.branch} · ${ownerLabel(w)} · ${w.lease}`, pill: w.state === 'Clean' ? PM51.pill('Ready') : PM51.pill('Needs attention'),
          note: /^Stale/.test(w.lease || '') ? 'Nobody is using this one. It can be cleaned up.' : (w.state !== 'Clean' ? `${w.state} · not yet saved to history` : ''),
          end: PM51.iconBtn({ icon: 'more', label: 'More actions', action: 'pm51-source-worktree-menu', data: { name: w.name } })
        }))) : PM51.note('No worktrees. Create one to work on two things at once.')
      }),
      PM51.advanced([
        PM51.section({ title: 'Repository defaults', body: PM51.kv([['New repositories go to', cfg().service], ['Default branch', cfg().branch], ['Large files', 'Git LFS when a file is over 50 MB'], ['Worktree folder', '/mnt/Cursor/.worktrees']]) }),
        PM51.section({ title: 'Find repositories on GitHub', help: 'Lists repositories on your account that are not here yet.', action: { label: 'Find repositories', small: true, icon: 'search', action: 'pm51-source-find' } }),
        PM51.section({ title: 'Clean up stale worktrees', help: 'Removes worktrees nobody has used for a while.', action: { label: 'Clean up', small: true, icon: 'trash', action: 'pm51-source-cleanup' } })
      ].join(''))
    ].join('');
  }
  function repoPanel(r) {
    const wts = repoWorktrees(r);
    PM51.panel({
      title: r.name, pill: repoPill(r), subtitle: `${r.forge === 'Local' ? 'This server only' : r.forge} · ${r.branch}`,
      body: PM51.panelSection('Details', PM51.kv([['Address', repoAddress(r)], ['Branch', r.branch], ['Changes', r.state === 'Clean' ? 'None waiting' : r.state === 'Checking' ? 'Not checked yet' : `${r.state} · not yet saved to history`], ['Protection', r.protection === 'None' ? 'None' : `${r.protection} · ${r.branch} cannot be overwritten`], ['Large files', r.lfs]]))
        + PM51.panelSection('Worktrees', wts.length ? PM51.list(wts.map(w => ({ title: w.name, meta: `${w.branch} · ${ownerLabel(w)} · ${w.lease}` }))) : PM51.note('No extra worktrees. Create one to work on two things at once.')),
      primaryLabel: 'Check remote', onPrimary: () => { checkRemote(r); }
    });
  }
  function checkRemote(r) {
    const local = r.forge === 'Local';
    PM51.check({
      title: `Check ${r.name}`, subtitle: local ? 'This repository lives only on this server.' : `Reaches ${repoAddress(r)}. Example data only.`,
      steps: local ? [{ title: 'Online copy', desc: 'None. This repository lives only on this server.', status: 'Skipped', tone: 'off' }, { title: 'Local history readable', desc: `Branch ${r.branch}` }]
        : [{ title: 'Reach the service', desc: repoAddress(r) }, { title: 'Fetch permitted', desc: 'Read access confirmed' }, { title: 'Push permitted', desc: r.protection === 'Protected' ? `${r.branch} is protected, so pushes go through a review` : 'Direct push allowed', status: 'Checked', tone: 'ready' }],
      outcome: local ? 'Local only' : 'Checked · example data', tone: local ? 'off' : 'info'
    });
  }
  function addRepo(kind) {
    if (kind === 'init') {
      const name = 'tastebook';
      if (repos().some(r => r.name === name)) { PM51.toast('Already tracked', `${name} already has version history.`, 'info'); return; }
      PM51.confirm('Start version history in this folder?', `A new ${cfg().tool} history begins in tastebook on the ${cfg().branch} branch. Nothing is sent anywhere.`, 'Start history', () => { repos().push({ name, forge: 'Local', remote: 'None', branch: cfg().branch || 'main', state: 'Clean', protection: 'None', lfs: 'Not needed' }); saveState(); refresh(); PM51.toast('History started', `${name} is now tracked with ${cfg().tool}.`, 'info'); });
      return;
    }
    const services = forges().filter(connected);
    openDialog({
      title: kind === 'clone' ? 'Clone from a code service' : 'Import an existing folder',
      subtitle: kind === 'clone' ? 'Copies a repository from a service you are signed in to.' : 'A folder on the server that already has version history.',
      body: kind === 'clone'
        ? (services.length ? formField('Service', 'service', cfg().service, { type: 'select', choices: services.map(f => f.name) }) : '<div class="alert-strip info">' + icon('info') + '<div>Connect a code service first, under Code Services.</div></div>')
          + formField('Repository', 'name', '', { full: true, autofocus: true, placeholder: 'owner/name', help: 'As it appears on the service.' })
          + formField('Into folder', 'folder', '/mnt/Cursor', { full: true })
        : formField('Folder', 'folder', '', { full: true, autofocus: true, placeholder: '/mnt/Cursor/my-project' }),
      saveLabel: kind === 'clone' ? 'Clone' : 'Import',
      onSave: data => {
        const raw = kind === 'clone' ? String(data.name || '') : String(data.folder || '');
        const name = raw.replace(/\/+$/, '').replace(/\.git$/, '').split('/').pop().trim();
        if (!name) { PM51.toast(kind === 'clone' ? 'Enter a repository' : 'Enter a folder', 'Puppet Master needs to know which one.', 'warning'); return false; }
        if (kind === 'clone' && !services.length) { PM51.toast('No code service connected', 'Connect one under Code Services first.', 'warning'); return false; }
        if (repos().some(r => r.name === name)) { PM51.toast('Already tracked', `${name} is already in the list.`, 'info'); return false; }
        repos().push({ name, forge: kind === 'clone' ? data.service : 'Local', remote: kind === 'clone' ? 'origin' : 'None', branch: cfg().branch || 'main', state: 'Checking', protection: 'None', lfs: 'Not needed' });
        saveState(); refresh(); PM51.toast(kind === 'clone' ? 'Clone queued' : 'Folder added', `${name} appears under Repositories. Example data only; the app does the ${kind === 'clone' ? 'copying' : 'reading'}.`, 'info');
      }
    });
  }

  /* ---------- Defaults & Safety ---------------------------------------- */
  function defaultsTab() {
    const c = cfg(); const services = forges().filter(connected).map(f => f.name);
    return [
      PM51.section({
        title: 'Defaults',
        body: PM51.rows([
          { label: 'Version history tool', help: 'Git is the common choice. Jujutsu makes undo easy and works alongside Git.', control: PM51.segmented(c.tool, ['Git', 'Jujutsu'], { action: 'pm51-source-cfg-seg', data: { key: 'tool' }, label: 'Version history tool' }) },
          { label: 'Default code service', help: 'Where new repositories are created.', control: PM51.select(c.service, withCurrent(['None', ...services], c.service), { action: 'pm51-source-cfg', data: { key: 'service' }, label: 'Default code service' }) }
        ])
      }),
      PM51.section({
        title: 'Safety', help: 'Guard rails for the assistant and for you.',
        body: PM51.rows([
          { label: 'Protect main branch', help: 'Changes to main go through a review first.', control: PM51.toggle(!!c.protectMain, { action: 'pm51-source-cfg-toggle', data: { key: 'protectMain' }, label: 'Protect main branch' }) },
          { label: 'Ask before deleting branches', control: PM51.toggle(!!c.askDelete, { action: 'pm51-source-cfg-toggle', data: { key: 'askDelete' }, label: 'Ask before deleting branches' }) },
          { label: 'Back up before risky operations', help: 'A recovery point is saved first.', control: PM51.toggle(!!c.backupRisky, { action: 'pm51-source-cfg-toggle', data: { key: 'backupRisky' }, label: 'Back up before risky operations' }) }
        ])
      }),
      PM51.section({
        title: 'Recovery',
        body: PM51.rows([
          { label: 'Undo last operation', help: 'Push of main to GitHub · 8 minutes ago', action: { label: 'Undo', icon: 'restore', action: 'pm51-source-undo' } },
          { label: 'Recovery points', help: 'Saved before risky operations.', value: `${RECOVERY_POINTS.length} points`, action: { label: 'View', icon: 'history', action: 'pm51-source-recovery' } }
        ])
      }),
      PM51.advanced([
        PM51.section({ title: 'Policy details', body: PM51.kv([['Protected branches', c.protectMain ? 'main, release/*' : 'None'], ['Tests before merge', 'Required'], ['Push credentials', 'The account that owns the code service'], ['Uncommitted changes', c.backupRisky ? 'Preserved before destructive operations' : 'Not preserved automatically'], ['Jujutsu alongside Git', 'Supported in the same folder']]) }),
        PM51.section({ title: 'Recent operations', body: PM51.kv([['Push', 'main to GitHub · 8 minutes ago · succeeded'], ['Force push', 'main · 2 days ago · denied by policy'], ['Branch deleted', 'audit/settings · yesterday · you confirmed']]) })
      ].join(''))
    ].join('');
  }

  /* ---------- Actions & Pipelines -------------------------------------- */
  function actionsTab() {
    const c = cfg();
    const f = forges().find(x => x.name === c.service && connected(x)) || forges().find(connected);
    const label = f ? f.automationLabel : '';
    const available = !!f && !/not available|connect automation/i.test(label);
    if (!available) return PM51.empty('No automation connected', f ? `${f.name} does not provide builds and tests here.` : 'Connect a code service with pipelines to see its workflows here.', { label: 'Connect automation service', icon: 'link', action: 'pm51-tab', data: { manager: ID, tab: 'services' } });
    const repo = (repos().find(r => r.forge === f.name) || repos()[0] || {}).name || 'this repository';
    return PM51.section({
      title: label, help: `Workflows in ${repo} on ${f.name}.`,
      action: { label: `Open on ${f.name.split(' ')[0]}`, icon: 'external', action: 'pm51-source-open-external', data: { name: f.name } },
      body: workflows().length ? PM51.list(workflows().map(w => ({
        title: w.name, pill: (w.pinned ? PM51.chip('Pinned') + ' ' : '') + (w.status === 'passing' ? PM51.pill('Ready') : w.status === 'failing' ? PM51.pill('Needs attention') : ''),
        meta: `${w.workflow} · ${TRIGGER[w.trigger] || w.trigger.toLowerCase()} · last run ${String(w.lastRun).toLowerCase()}`,
        end: PM51.iconBtn({ icon: 'pin', label: w.pinned ? 'Unpin' : 'Pin', action: 'pm51-source-pin', data: { name: w.name }, cls: 'pm51-source-pin' + (w.pinned ? ' is-on' : '') }) + PM51.btn({ label: 'Run', icon: 'play', small: true, action: 'pm51-source-run', data: { name: w.name } })
      }))) : PM51.note('No workflows found in this repository yet.')
    }) + PM51.advanced([
      PM51.section({ title: 'Runners', body: PM51.kv([['Hosted runners', `Provided by ${f.name}`], ['Self-hosted', 'None registered'], ['Concurrency', 'Up to 4 jobs at once']]) }),
      PM51.section({ title: 'Logs', help: 'Output from the most recent runs.', action: { label: 'View logs', small: true, icon: 'file', action: 'pm51-source-logs' } })
    ].join(''));
  }

  function render() {
    const tab = PM51.tab(ID, 'services');
    const body = tab === 'tools' ? toolsTab() : tab === 'repos' ? reposTab() : tab === 'defaults' ? defaultsTab() : tab === 'actions' ? actionsTab() : servicesTab();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [{ label: 'Reset source control defaults', action: 'pm51-source-reset' }, { label: 'How version history works', action: 'pm51-source-help' }] });
  }
  PM51.manager('sourceControl', { render });

  /* ---------- actions: services --------------------------------------- */
  PM51.on('source-add-service', () => openDialog({
    title: 'Add another account or instance', subtitle: 'Pick the service, then sign in.',
    body: formField('Service', 'id', (selectedForge() || {}).id, { type: 'select', choices: forges().map(f => ({ value: f.id, label: f.name })) }),
    saveLabel: 'Continue',
    onSave: data => { const f = byId(data.id); if (!f) return false; PM51.setSel(ID, f.id); saveState(); refresh(); connectPanel(f, false); }
  }));
  PM51.on('source-connect', el => { const f = byId(ds(el, 'id')); if (f) connectPanel(f, false); });
  PM51.on('source-mode', el => { const f = byId(ds(el, 'id')); if (!f) return; f.mode = ds(el, 'value'); saveState(); refresh(); });
  PM51.on('source-default-service', el => { const f = byId(ds(el, 'id')); if (!f) return; cfg().service = cfg().service === f.name ? 'None' : f.name; saveState(); refresh(); });
  PM51.on('source-address', el => {
    const f = byId(ds(el, 'id')); if (!f) return;
    const label = f.addressLabel || 'Service address'; const generic = f.kind === 'generic';
    PM51.panel({
      title: label, subtitle: f.name,
      body: PM51.panelSection('Address', PM51.field(label, PM51.input(f.instanceUrl || '', { placeholder: generic ? 'git@example.com:team/project.git' : 'https://code.example.com', label }), generic ? 'SSH addresses start with git@. HTTPS addresses start with https://.' : 'Where your organization runs it. Include https://.')),
      primaryLabel: 'Save', onPrimary: wrap => {
        const v = ((wrap.querySelector('input') || {}).value || '').trim();
        const ok = generic ? /^(git@|https?:\/\/|ssh:\/\/)\S+/.test(v) : /^https?:\/\/\S+/.test(v);
        if (!ok) { PM51.toast('Enter a full address', generic ? 'It should start with git@, ssh://, or https://' : 'It should start with https://', 'warning'); return false; }
        f.instanceUrl = v; saveState(); refresh(); PM51.toast('Address saved', v);
      }
    });
  });
  PM51.on('source-push', el => {
    const f = byId(ds(el, 'id')); if (!f) return;
    PM51.panel({
      title: 'Set up push access', subtitle: f.name,
      body: PM51.panelSection('How changes are sent', PM51.field('Use', PM51.select('SSH key', ['SSH key', 'HTTPS with token'], { label: 'Push access method' }), `An SSH key made on ${host()} is the most reliable choice.`))
        + PM51.panelSection('What happens next', PM51.steps([{ title: `A key is created on ${host()}`, desc: 'The private half never leaves the server.' }, { title: 'The public half is added to your account', desc: `Puppet Master does this for you on ${f.name}.` }, { title: 'A test push confirms it', desc: 'Nothing in your history changes.' }])),
      primaryLabel: 'Continue', onPrimary: () => PM51.toast('Key setup runs in the app', 'Example data only. Nothing was created in this preview.', 'info')
    });
  });
  PM51.on('source-check', el => {
    const f = byId(ds(el, 'id')); if (!f) return;
    const on = connected(f) || (f.kind === 'generic' && !!f.instanceUrl);
    PM51.check({
      title: `Check ${f.name}`, subtitle: on ? (f.kind === 'generic' ? `Reaches ${f.instanceUrl}. Example data only.` : `Signed in as ${f.defaultAccount}. Example data only.`) : 'Not connected, so nothing can be reached yet.',
      steps: on ? [
        { title: 'Reach the service', desc: f.kind === 'generic' ? f.instanceUrl : (API[f.id] || f.instanceUrl || f.name) },
        f.kind === 'generic' ? { title: 'Access', desc: f.auth } : { title: 'Account still valid', desc: `${f.defaultAccount} · ${(f.scopes || []).join(', ') || 'no permissions listed'}` },
        { title: 'Push access', desc: f.pushAccess === 'Ready' ? `SSH ${String(f.ssh).toLowerCase()}` : 'Not set up yet', status: f.pushAccess === 'Ready' ? 'Checked' : 'Not set up', tone: f.pushAccess === 'Ready' ? 'ready' : 'attention' },
        f.kind === 'generic' ? null : { title: `${f.reviewLabel} reachable`, desc: 'Can list and open reviews' }
      ].filter(Boolean) : [
        { title: 'Reach the service', desc: 'Nothing to reach yet', status: 'Skipped', tone: 'off' },
        { title: 'Account', desc: 'Nobody signed in', status: 'Skipped', tone: 'off' },
        { title: 'Push access', desc: 'Not set up', status: 'Skipped', tone: 'off' }
      ],
      outcome: on ? 'Checked · example data' : 'Not connected', tone: on ? 'info' : 'off'
    });
  });
  PM51.on('source-diagnostics', () => PM51.check({ title: 'Source control diagnostics', steps: [
    { title: 'Local tools', desc: tools().map(t => `${t.name} ${t.status === 'ready' ? t.version : 'missing'}`).join(' · ') },
    { title: 'Code services', desc: `${forges().filter(connected).length} of ${forges().length} connected` },
    { title: 'Repositories', desc: `${repos().length} tracked · ${worktrees().length} worktrees` },
    { title: 'Push access', desc: 'Checked through each connected service', status: 'Example', tone: 'info' }
  ] }));

  /* ---------- actions: tools ------------------------------------------ */
  PM51.on('source-select-tool', el => { PM51.setSel(TOOL_SEL, ds(el, 'id')); state.resourceRosterOpen = false; refresh(); });
  PM51.on('source-tool-default', el => { const t = tools().find(x => x.id === ds(el, 'id')); if (!t) return; tools().forEach(x => { x.default = x.id === t.id; }); cfg().tool = t.name; saveState(); refresh(); PM51.toast('Default tool', `${t.name} keeps history for new folders.`); });
  PM51.on('source-install', el => {
    const t = tools().find(x => x.id === ds(el, 'id')); if (!t) return;
    PM51.panel({ title: `Install ${t.name}`, subtitle: `On ${host()}.`, body: PM51.panelSection('What happens next', PM51.steps([{ title: 'Downloaded from the official source', desc: t.source || 'Official release' }, { title: `Installed on ${host()}`, desc: 'Nothing changes on this computer.' }, { title: 'Checked', desc: 'Version and executable are verified.' }])), primaryLabel: 'Install', onPrimary: () => PM51.toast('Installing needs the desktop app', 'Example data only. Nothing was installed in this preview.', 'info') });
  });
  PM51.on('source-check-tool', el => {
    const t = tools().find(x => x.id === ds(el, 'id')); if (!t) return; const ready = t.status === 'ready';
    PM51.check({ title: `Check ${t.name}`, steps: ready ? [{ title: 'Executable found', desc: TOOL_PATH[t.id] || '' }, { title: 'Version', desc: t.version }, { title: 'Runs a harmless command', desc: `${t.name} answered on ${host()}`, status: 'Example', tone: 'info' }] : [{ title: 'Executable found', desc: 'Not installed', status: 'Not installed', tone: 'off' }], outcome: ready ? 'Checked · example data' : 'Not installed', tone: ready ? 'info' : 'off' });
  });

  /* ---------- actions: repositories ----------------------------------- */
  PM51.on('source-add-repo', el => PM51.menu(el, [
    { label: 'Import an existing folder', icon: 'folder', meta: 'Already has history', onClick: () => addRepo('import') },
    { label: 'Clone from a code service', icon: 'download', meta: 'Copy it here', onClick: () => addRepo('clone') },
    { label: 'Start version history in this folder', icon: 'branch', meta: 'No history yet', onClick: () => addRepo('init') }
  ], 'Add repository'));
  PM51.on('source-repo', el => { const r = repos().find(x => x.name === ds(el, 'name')); if (r) repoPanel(r); });
  PM51.on('source-worktree-new', () => openDialog({
    title: 'Create worktree', subtitle: 'A second copy of the repository, on its own branch.',
    body: formField('Name', 'name', '', { full: true, autofocus: true, placeholder: 'For example: docs-refresh' }) + formField('Branch', 'branch', '', { full: true, placeholder: 'For example: feature/docs-refresh', help: 'Created if it does not exist.' }),
    saveLabel: 'Create',
    onSave: data => {
      const name = String(data.name || '').trim(); if (!name) { PM51.toast('Give the worktree a name', 'It becomes the folder name.', 'warning'); return false; }
      if (worktrees().some(w => w.name === name)) { PM51.toast('Name already used', 'Pick a different name.', 'warning'); return false; }
      worktrees().push({ name, path: `/mnt/Cursor/.worktrees/${name}`, branch: String(data.branch || '').trim() || name, owner: 'You', state: 'Clean', lease: 'Persistent' });
      saveState(); refresh(); PM51.toast('Worktree created', `${name} is ready in /mnt/Cursor/.worktrees.`, 'info');
    }
  }));
  PM51.on('source-worktree-menu', el => {
    const w = worktrees().find(x => x.name === ds(el, 'name')); if (!w) return;
    const inUse = /Goal/.test(w.lease || '') || w.name === 'main';
    PM51.menu(el, [
      { label: 'Details', icon: 'info', onClick: () => PM51.panel({ title: w.name, pill: w.state === 'Clean' ? PM51.pill('Ready') : PM51.pill('Needs attention'), body: PM51.panelSection('Worktree', PM51.kv([['Folder', w.path], ['Branch', w.branch], ['Used by', ownerLabel(w)], ['Kept', w.lease], ['Changes', w.state === 'Clean' ? 'None waiting' : w.state]])) }) },
      { label: 'Open folder', icon: 'folder', onClick: () => PM51.unavailable('Open folder', 'Opening a folder needs the desktop app.') },
      { separator: true },
      { label: 'Remove', icon: 'trash', danger: true, ariaDisabled: inUse, meta: inUse ? (w.name === 'main' ? 'Main worktree' : 'In use by a Goal') : '', onClick: () => PM51.confirm(`Remove worktree ${w.name}?`, w.state === 'Clean' ? 'The folder is deleted. Its branch is kept.' : `${w.state} that are not saved to history would be lost.`, 'Remove', () => { const i = worktrees().indexOf(w); if (i >= 0) worktrees().splice(i, 1); saveState(); refresh(); PM51.toast('Worktree removed', w.name, 'warning'); }, true) }
    ], w.name);
  });
  PM51.on('source-find', () => {
    const gh = byId('github'); const on = gh && connected(gh);
    PM51.panel({
      title: 'Find repositories on GitHub', subtitle: on ? `Repositories on ${gh.defaultAccount} that are not tracked here yet. Example data only.` : 'Connect GitHub first.',
      body: on ? PM51.panelSection('Found', PM51.list([{ title: 'puppet-master-site', meta: 'Updated 3 days ago · public' }, { title: 'tastebook-recipes', meta: 'Updated 2 weeks ago · private' }].map(x => ({ title: x.title, meta: x.meta, end: PM51.btn({ label: 'Clone', small: true, action: 'pm51-source-clone-found', data: { name: x.title } }) })))) + PM51.note('This list is example data. In the app it comes from your GitHub account.') : PM51.note('Sign in to GitHub under Code Services, then come back here.', 'attention'),
      primaryLabel: '', onPrimary: null
    });
  });
  PM51.on('source-clone-found', el => {
    const name = ds(el, 'name'); if (!name) return;
    if (repos().some(r => r.name === name)) { PM51.toast('Already tracked', `${name} is already in the list.`, 'info'); return; }
    repos().push({ name, forge: 'GitHub', remote: 'origin', branch: cfg().branch || 'main', state: 'Checking', protection: 'None', lfs: 'Not needed' });
    saveState(); refresh(); closeOverlay(); PM51.toast('Clone queued', `${name} appears under Repositories. Example data only; the app does the copying.`, 'info');
  });
  PM51.on('source-cleanup', () => {
    const stale = worktrees().filter(w => /^Stale/.test(w.lease || ''));
    if (!stale.length) { PM51.toast('Nothing to clean up', 'Every worktree is in use or persistent.', 'info'); return; }
    PM51.confirm(`Remove ${stale.length} stale worktree${stale.length === 1 ? '' : 's'}?`, `${stale.map(w => w.name).join(', ')}. Branches are kept; only the folders go.`, 'Clean up', () => { sc().worktrees = worktrees().filter(w => !stale.includes(w)); saveState(); refresh(); PM51.toast('Cleaned up', `${stale.length} worktree${stale.length === 1 ? '' : 's'} removed.`); }, true);
  });

  /* ---------- actions: defaults & safety ------------------------------- */
  PM51.on('source-cfg-seg', el => { cfg()[ds(el, 'key')] = ds(el, 'value'); if (ds(el, 'key') === 'tool') tools().forEach(t => { t.default = t.name === ds(el, 'value'); }); saveState(); refresh(); });
  PM51.on('source-cfg-toggle', el => { const c = cfg(); const k = ds(el, 'key'); c[k] = !c[k]; saveState(); refresh(); });
  PM51.onChange('source-cfg', el => { cfg()[ds(el, 'key')] = el.value; saveState(); });
  PM51.onInput('source-branch', el => { cfg().branch = el.value.trim() || 'main'; saveState(); });
  PM51.on('source-undo', () => PM51.panel({
    title: 'Undo last operation', subtitle: 'Push of main to GitHub · 8 minutes ago',
    body: PM51.panelSection('What undo does', PM51.kv([['Locally', 'main goes back to where it was before the push'], ['On GitHub', 'Nothing changes until you push again'], ['Your files', 'Kept exactly as they are']])) + PM51.note('Undo runs in the app. Nothing changes in this preview.'),
    primaryLabel: 'Undo', onPrimary: () => PM51.toast('Nothing undone', 'Example data only. Undo runs in the app.', 'info')
  }));
  PM51.on('source-recovery', () => PM51.panel({
    title: 'Recovery points', subtitle: 'Saved before risky operations. Restoring never deletes newer work.',
    body: PM51.panelSection('Points', PM51.list(RECOVERY_POINTS.map(p => ({ title: p.title, meta: p.meta, end: PM51.btn({ label: 'Restore', small: true, icon: 'restore', action: 'pm51-source-restore-point', data: { name: p.title } }) }))))
  }));
  PM51.on('source-restore-point', el => PM51.toast('Nothing restored', `Example data only. Restoring “${ds(el, 'name')}” runs in the app.`, 'info'));

  /* ---------- actions: pipelines --------------------------------------- */
  PM51.on('source-open-external', el => PM51.unavailable(`Open on ${String(ds(el, 'name') || '').split(' ')[0] || 'the service'}`, 'Opening links needs the desktop app.'));
  PM51.on('source-pin', el => { const w = workflows().find(x => x.name === ds(el, 'name')); if (!w) return; w.pinned = !w.pinned; saveState(); refresh(); });
  PM51.on('source-run', el => {
    const w = workflows().find(x => x.name === ds(el, 'name')); if (!w) return;
    PM51.panel({
      title: `Run ${w.name}`, subtitle: `${w.workflow} · ${TRIGGER[w.trigger] || w.trigger}`,
      body: PM51.panelSection('Run on', PM51.field('Branch', PM51.select(cfg().branch || 'main', withCurrent(repos().map(r => r.branch), cfg().branch || 'main'), { label: 'Branch' }))) + PM51.note('Runs are started by the app. Nothing is sent in this preview.'),
      primaryLabel: 'Run', onPrimary: () => PM51.toast('Nothing started', 'Example data only. Runs are started by the app.', 'info')
    });
  });
  PM51.on('source-logs', () => PM51.panel({ title: 'Recent run logs', subtitle: 'Example data only.', body: PM51.panelSection('Runs', PM51.list(workflows().filter(w => w.status !== 'not-run').map(w => ({ title: w.name, meta: `${String(w.lastRun).toLowerCase()} · ${w.status}`, end: PM51.btn({ label: 'Open log', small: true, icon: 'file', action: 'pm51-source-open-external', data: { name: (forges().find(connected) || {}).name || 'the service' } }) })))) }));

  PM51.on('source-reset', () => PM51.confirm('Reset source control defaults?', 'Defaults and safety settings go back to their original values. Connected services and repositories are kept.', 'Reset', () => {
    PM51.s().sourceDefaults = null; cfg(); tools().forEach(t => { t.default = t.id === 'git'; }); saveState(); refresh(); PM51.toast('Source control reset', 'Defaults are back.');
  }));
  PM51.on('source-help', () => PM51.panel({
    title: 'How version history works',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Version history keeps every change to your files so you can compare, go back, and work in parallel. Git or Jujutsu keeps it on your server; a code service keeps a copy online.</p>')
      + PM51.panelSection('The pieces', PM51.kv([['Local tools', 'Git and Jujutsu do the work on your server.'], ['Code services', 'GitHub and the others store a copy, host reviews, and run automation.'], ['Repositories', 'The folders whose history is kept.'], ['Worktrees', 'Extra copies so two things can happen at once.']]))
      + PM51.panelSection('Safety', '<p class="pm51-ps-text">Main stays protected, force pushes are refused, and a recovery point is saved before anything risky.</p>')
  }));
})();
