/* Source Control — code services, local tools, repositories, defaults & safety, actions & pipelines
   (settings audit, 2026-09-27).
   - One main-branch name (branching.worktrees.default-branch) and one workspace folder (worktree-base-dir) are used
     for new repositories, clones, worktrees and runs; the manager's own copy of the branch name is gone.
   - GitHub's sign-in rows (account, token, allowed servers, sign-in return address) live inside GitHub.
   - Creating a new repository and contributing to someone else's project are guided set-ups; their rows are the
     answers they remember.
   - The safety level decides the three safety switches unless it is Custom; the policy summary is written from the
     real values, including Testing's tests-before-merge.
   - Workflow pins are the Pinned workflows row. Links and folders are copied, not opened, in this preview.
   Newcomer review (2026-09-28): connecting a code service is a guided set-up that ends connected (sign in with the
   browser or a token, then how Git itself signs in, then a check); Git sign-in for pushing and pulling is separate
   from the service's sign-in (Plans/GitHub_API_Auth_and_Flows.md: API tokens never become Git credentials) and uses
   the one SSH key list from Server & Project Location (PM51.sysSsh), or HTTPS with a token. Who you are in history
   (name and email), signing your changes, large files and the files kept out of history are one "Set up Git"
   guide whose answers show as rows under Defaults & Safety; protected branches are a list you can edit, and
   publishing points at the Permissions row that owns it. These have no inventory rows yet; they are kept in the
   concept's own state (PM51.s().sourceGit) until canon admits them. */
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
  const cfg = () => { const s = PM51.s(); if (!s.sourceDefaults) s.sourceDefaults = { tool: 'Git', service: 'GitHub', protectMain: true, askDelete: true, backupRisky: true, updatePolicy: {} }; delete s.sourceDefaults.branch; delete s.sourceDefaults.forcePush; return s.sourceDefaults; };
  const W = 'branching.worktrees.';
  const GH = ['ai.accounts.github-connect', 'ai.accounts.github-token', 'ai.accounts.github-host-policy', 'ai.accounts.github-oauth-loopback'];
  const NEWREPO = [W + 'create-github-repo', W + 'new-repo-details'], CONTRIB = [W + 'upstream-repo', W + 'create-fork', W + 'fork-location', W + 'feature-branch-name'];
  const PIN = W + 'github-pinned-workflows', PRESET = W + 'git-policy-preset', FORCE = W + 'force-push-policy';
  const PRESETS = { strict: { protectMain: true, askDelete: true, backupRisky: true }, standard: { protectMain: true, askDelete: false, backupRisky: true }, lenient: { protectMain: false, askDelete: false, backupRisky: false } };
  const mainBranch = () => String(PM51.value(W + 'default-branch') || 'main').trim() || 'main';
  const wtBase = () => { const st = PM51.setting(W + 'worktree-base-dir'); const v = PM51.value(W + 'worktree-base-dir'); return !v || (st && v === st.value) ? '' : String(v).replace(/\/+$/, ''); };
  const wtFolder = () => wtBase() || 'project/.worktrees';
  const ghOnly = () => String(PM51.value('ai.accounts.github-host-policy') || 'github.com_only') !== 'enterprise_allowed';
  const pinned = () => { const v = PM51.value(PIN); return Array.isArray(v) ? v.map(String) : []; };
  const safety = () => { const p = String(PM51.value(PRESET) || 'strict'); return p === 'custom' ? cfg() : (PRESETS[p] || PRESETS.strict); };
  const copyText = (text, what) => { const done = () => PM51.toast(`${what} copied`, text); try { navigator.clipboard.writeText(text).then(done, () => PM51.toast(what, text, 'info')); } catch (e) { PM51.toast(what, text, 'info'); } };
  const forgeUrl = f => f.id === 'github' ? `https://github.com/${connected(f) ? f.defaultAccount : ''}` : f.instanceUrl || (API[f.id] ? 'https://' + API[f.id].split('/')[0].replace(/^api\./, '') : '');
  const connected = f => f.status === 'active';
  const statusLabel = f => connected(f) ? 'Connected' : f.status === 'needs-signin' ? 'Needs sign-in' : 'Not connected';
  const statusTone = f => connected(f) ? 'ready' : f.status === 'needs-signin' ? 'attention' : 'off';
  const hasSignIn = f => /oauth|sign-in|entra|app/i.test(f.auth || '');
  const byId = id => forges().find(f => f.id === id);
  const selectedForge = () => byId(PM51.sel(ID)) || forges()[0];
  const selectedTool = () => tools().find(t => t.id === PM51.sel(TOOL_SEL)) || tools()[0];
  const withCurrent = (list, v) => !v || list.includes(v) ? list : [v, ...list];
  const refresh = () => PM51.refresh(ID, { swap: false });
  let migratePins = () => {};
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
      { label: 'Connection', help: on ? (f.lastCheck ? `Checked ${f.lastCheck}` : 'Not checked yet') : 'Nothing to check until it is connected', action: { label: 'Check connection', icon: 'test', action: 'pm51-source-check', data: { id: f.id } } }
    ];
    const account = on ? f.defaultAccount : 'you';
    const gh = f.id === 'github' || f.id === 'github-enterprise';
    const blocked = f.id === 'github-enterprise' && ghOnly();
    const signIn = gh ? PM51.section({
      title: 'Sign-in', help: 'The GitHub account, its token, and which GitHub servers may be used.',
      body: (blocked ? PM51.note('Company GitHub servers are not allowed yet. Allow them below, then connect GitHub Enterprise.', 'attention') : '')
        + PM51.home('ai.accounts.github-connect', PM51.rows([{ label: 'GitHub account', help: on ? `Signed in as ${f.defaultAccount}.` : 'Nobody is signed in.', action: on ? { label: 'Disconnect', icon: 'close', action: 'pm51-source-gh-disconnect', data: { id: f.id } } : { label: VERB[f.id] || 'Connect', icon: 'link', action: 'pm51-source-connect', data: { id: f.id }, disabled: blocked, reason: 'Allow company servers first.' } }]))
        + PM51.bound.rows(['ai.accounts.github-token', 'ai.accounts.github-host-policy'])
    }) : GH.reduce((html, id) => PM51.home(id, html), '');
    const body = setupSteps(f) + PM51.rows(rows) + signIn + PM51.advanced([
      PM51.section({ title: 'Technical details', body: PM51.kv([
        ['Sign-in method', f.auth],
        ['API address', API[f.id] || (f.instanceUrl ? f.instanceUrl.replace(/\/$/, '') + '/api' : 'Known once the address is entered')],
        ['Permissions granted', (f.scopes || []).length ? f.scopes.join(' · ') : 'None yet'],
        ['SSH host key', f.ssh],
        ['Fetch address', f.id === 'github' && on ? `https://github.com/${account}/Puppet-Master.git` : f.kind === 'generic' ? (f.instanceUrl || 'Not set') : 'Set when the first repository is added'],
        ['Push address', f.id === 'github' && on ? `git@github.com:${account}/Puppet-Master.git` : f.kind === 'generic' ? (f.instanceUrl || 'Not set') : 'Set when the first repository is added'],
        ['Last test', f.lastTest || 'Not run']
      ]) + (gh ? PM51.bound.rows(['ai.accounts.github-oauth-loopback']) : '') + '<div style="margin-top:10px">' + PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-source-diagnostics' }) + '</div>' })
    ].join(''));
    return PM51.listDetail({
      id: ID, rosterTitle: 'Code services', count: forges().length,
      add: { action: 'pm51-source-add-service', label: 'Add another account or instance' },
      items: forges().map(x => ({ id: x.id, title: x.name, meta: x.id === 'github-enterprise' && ghOnly() && !connected(x) ? 'Not allowed: github.com only' : connected(x) ? `Connected as ${x.defaultAccount}` : x.status === 'needs-signin' ? 'Needs sign-in' : 'Not connected', tone: statusTone(x), selected: x.id === f.id })),
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
      forgeUrl(f) ? { label: 'Copy link', icon: 'copy', meta: 'To open it in your browser', onClick: () => copyText(forgeUrl(f), 'Link') } : null,
      { label: 'Make default', icon: 'check', ariaDisabled: !on || isDefault, meta: !on ? 'Connect first' : isDefault ? 'Already the default' : '', onClick: () => { cfg().service = f.name; saveState(); refresh(); PM51.toast('Default code service', `New repositories are created on ${f.name}.`); } },
      { separator: true },
      { label: 'Disconnect', icon: 'close', danger: true, ariaDisabled: !on, meta: on ? '' : 'Not connected', onClick: () => disconnect(f) }
    ].filter(Boolean), f.name);
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
          if (!repos().some(r => r.name === name)) repos().push({ name, forge: f.name, remote: 'origin', address: addr, branch: mainBranch(), state: 'Checking', protection: 'None', lfs: 'Not needed' });
          saveState(); refresh(); PM51.toast('Repository added', `${name} appears under Repositories. Fetching happens in the app.`, 'info');
        }
      });
      return;
    }
    connectWizard(f, reauth);
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
        title: 'Start something new', help: 'Guided set-ups that remember your answers for next time.',
        body: NEWREPO.concat(CONTRIB).reduce((html, id) => PM51.home(id, html), PM51.rows([
          { label: 'Create a new repository', help: 'Online, with a license, a .gitignore and a starting branch.', action: { label: 'Start', icon: 'plus', action: 'pm51-source-new-repo' } },
          { label: 'Contribute to another project', help: 'Your own copy (a fork) and a branch for your changes.', action: { label: 'Start', icon: 'branch', action: 'pm51-source-contribute' } }
        ]))
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
      PM51.slot(),
      PM51.advanced([
        PM51.section({ title: 'Repository defaults', help: 'Read from your settings.', body: PM51.kv([['New repositories go to', cfg().service], ['Main branch', mainBranch()], ['Large files', git().lfs ? `Git LFS when a file is over ${git().lfsMb} MB` : 'No special handling'], ['Worktree folder', wtBase() || 'Inside the project folder (.worktrees)']]) }),
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
      PM51.confirm('Start version history in this folder?', `A new ${cfg().tool} history begins in tastebook on the ${mainBranch()} branch. Nothing is sent anywhere.`, 'Start history', () => { repos().push({ name, forge: 'Local', remote: 'None', branch: mainBranch(), state: 'Clean', protection: 'None', lfs: 'Not needed' }); saveState(); refresh(); PM51.toast('History started', `${name} is now tracked with ${cfg().tool}.`, 'info'); });
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
        repos().push({ name, forge: kind === 'clone' ? data.service : 'Local', remote: kind === 'clone' ? 'origin' : 'None', branch: mainBranch(), state: 'Checking', protection: 'None', lfs: 'Not needed' });
        saveState(); refresh(); PM51.toast(kind === 'clone' ? 'Clone queued' : 'Folder added', `${name} appears under Repositories. Example data only; the app does the ${kind === 'clone' ? 'copying' : 'reading'}.`, 'info');
      }
    });
  }

  /* ---------- Defaults & Safety ---------------------------------------- */
  function defaultsTab() {
    const c = cfg(); const services = forges().filter(connected).map(f => f.name);
    const preset = String(PM51.value(PRESET) || 'strict'); const custom = preset === 'custom'; const e = safety();
    const tests = PM51.setting(W + 'pre-merge-tests');
    const g = git(), pf = forges().find(x => x.name === c.service && connected(x)) || forges().find(connected);
    const said = [`${mainBranch()} is ${e.protectMain ? 'protected, so changes to it go through a review' : 'not protected'}`, e.askDelete ? 'you are asked before a branch is deleted' : 'branches are deleted without asking', e.backupRisky ? 'a recovery point is saved before anything risky' : 'no recovery point is saved first'];
    return [
      PM51.section({
        title: 'Defaults',
        body: PM51.rows([
          { label: 'Version history tool', help: 'Git is the common choice. Jujutsu makes undo easy and works alongside Git.', control: PM51.segmented(c.tool, ['Git', 'Jujutsu'], { action: 'pm51-source-cfg-seg', data: { key: 'tool' }, label: 'Version history tool' }) },
          { label: 'Default code service', help: 'Where new repositories are created.', control: PM51.select(c.service, withCurrent(['None', ...services], c.service), { action: 'pm51-source-cfg', data: { key: 'service' }, label: 'Default code service' }) }
        ])
      }),
      PM51.section({
        title: 'You and sign-in', help: 'Who your changes say they are from, and how Git proves it is you.', cls: 'o55-src-you',
        action: { label: 'Set up Git', icon: 'branch', small: true, action: 'pm51-source-git-setup' },
        body: PM51.rows([
          { label: 'Name on your changes', data: { 'setting-id': W + 'git-author-name' }, help: g.name ? '' : 'Not set yet. Saving changes fails until it is.', value: g.name || 'Not set yet', muted: !g.name, action: { label: 'Change', action: 'pm51-source-git-setup', data: { step: 0 } } },
          { label: 'Email on your changes', data: { 'setting-id': W + 'git-author-email' }, help: g.email ? (g.scope === 'all' ? 'Every project on this server' : 'Only this project') : 'Code services use it to link changes to your account.', value: g.email || 'Not set yet', muted: !g.email, action: { label: 'Change', action: 'pm51-source-git-setup', data: { step: 0 } } },
          { label: 'How Git signs in', data: { 'setting-id': W + 'git-push-method' }, pill: ids('git-push-key'), help: pf ? `For ${pf.name}. Separate from the website sign-in.` : 'Connect a code service first.', value: pf ? accessText(pf) : 'Nothing connected', muted: !pf || pf.pushAccess !== 'Ready', action: pf ? { label: pf.pushAccess === 'Ready' ? 'Change key' : 'Set up', icon: 'key', action: 'pm51-source-git-access' } : { label: 'Code Services', icon: 'arrowRight', action: 'pm51-tab', data: { manager: ID, tab: 'services' } } },
          { label: 'Sign your changes', data: { 'setting-id': W + 'commit-signing' }, pill: ids('commit-signing-key'), help: 'Some projects only accept signed changes.', value: signText(g), action: { label: 'Change', action: 'pm51-source-git-setup', data: { step: 1 } } }
        ])
      }),
      PM51.section({
        title: 'Files that need care', help: 'Big files, and files that must never be saved in history.',
        body: PM51.rows([
          { label: 'Big files', data: { 'setting-id': W + 'large-file-storage' }, pill: ids('large-file-threshold', 'large-file-types'), help: g.lfs ? `Kept out of the normal history with Git LFS${tools().some(t => t.id === 'git-lfs' && t.status === 'ready') ? '' : ' (install Git LFS under Local Tools)'}.` : 'Stored like any other file.', value: g.lfs ? `Over ${g.lfsMb} MB, and ${g.lfsTypes || 'no extra kinds'}` : 'No special handling', action: { label: 'Change', action: 'pm51-source-git-setup', data: { step: 2 } } },
          { label: 'Never saved in history', data: { 'setting-id': W + 'default-ignore-patterns' }, help: 'Written to .gitignore in new repositories.', value: `${String(g.ignore || '').split('\n').filter(Boolean).slice(0, 3).join(', ')}${String(g.ignore || '').split('\n').filter(Boolean).length > 3 ? ' and more' : ''}` || 'Nothing', action: { label: 'Change', action: 'pm51-source-git-setup', data: { step: 2 } } }
        ])
      }),
      PM51.slot(),
      PM51.section({
        title: 'Safety', help: 'Guard rails for the assistant and for you.',
        body: PM51.bound.rows([PRESET, FORCE]) + PM51.rows([
          { label: 'Protected branches', data: { 'setting-id': W + 'protected-branches' }, help: e.protectMain ? 'Changes go through a review; never overwritten.' : 'Not protected at this safety level.', value: protectedList().join(', '), muted: !e.protectMain, action: { label: 'Change', action: 'pm51-source-protected' } },
          { label: 'Publishing and releases', help: 'Whether the assistant asks before publishing is set in Permissions.', value: publishText(), action: { label: 'Permissions', icon: 'arrowRight', action: 'pm51-source-open-publish' } }
        ]) + (custom ? PM51.rows([
          { label: 'Protect the main branch', help: 'Changes to it go through a review first.', control: PM51.toggle(!!c.protectMain, { action: 'pm51-source-cfg-toggle', data: { key: 'protectMain' }, label: 'Protect the main branch' }) },
          { label: 'Ask before deleting branches', control: PM51.toggle(!!c.askDelete, { action: 'pm51-source-cfg-toggle', data: { key: 'askDelete' }, label: 'Ask before deleting branches' }) },
          { label: 'Back up before risky operations', help: 'A recovery point is saved first.', control: PM51.toggle(!!c.backupRisky, { action: 'pm51-source-cfg-toggle', data: { key: 'backupRisky' }, label: 'Back up before risky operations' }) }
        ]) : PM51.note(`${PM51.valueLabel(PRESET, preset)}: ${said.join('; ')}. Pick Custom to set these one by one.`, 'info'))
      }),
      PM51.section({
        title: 'Recovery', help: 'Undo, recovery points and guided fixes.',
        body: PM51.rows([
          { label: 'Undo last operation', help: 'Push of main to GitHub · 8 minutes ago', action: { label: 'Undo', icon: 'restore', action: 'pm51-source-undo' } },
          { label: 'Recovery points', help: 'Saved before risky operations.', value: `${RECOVERY_POINTS.length} points`, action: { label: 'View', icon: 'history', action: 'pm51-source-recovery' } }
        ]) + PM51.bound.rows([W + 'recovery-tools'])
      }),
      PM51.advanced([
        PM51.section({ title: 'Policy in effect', help: 'Written from the settings above and from Testing.', body: PM51.kv([['Protected branches', e.protectMain ? protectedList().join(', ') : 'None'], ['Tests before merge', tests ? PM51.valueText(tests, PM51.value(W + 'pre-merge-tests')) : 'Set in Testing & Debug'], ['Force push', PM51.valueLabel(FORCE, PM51.value(FORCE))], ['Push credentials', 'The account that owns the code service'], ['Uncommitted changes', e.backupRisky ? 'Preserved before destructive operations' : 'Not preserved first']]) }),
        PM51.section({ title: 'Recent operations', body: PM51.kv([['Push', 'main to GitHub · 8 minutes ago · succeeded'], ['Force push', 'main · 2 days ago · denied by policy'], ['Branch deleted', 'audit/settings · yesterday · you confirmed']]) })
      ].join(''))
    ].join('');
  }

  /* ---------- Actions & Pipelines -------------------------------------- */
  function actionsTab() {
    migratePins();
    const c = cfg();
    const f = forges().find(x => x.name === c.service && connected(x)) || forges().find(connected);
    const label = f ? f.automationLabel : '';
    const available = !!f && !/not available|connect automation/i.test(label);
    if (!available) return PM51.home(PIN, '') + PM51.empty('No automation connected', f ? `${f.name} does not provide builds and tests here.` : 'Connect a code service with pipelines to see its workflows here.', { label: 'Connect automation service', icon: 'link', action: 'pm51-tab', data: { manager: ID, tab: 'services' } });
    const repo = (repos().find(r => r.forge === f.name) || repos()[0] || {}).name || 'this repository';
    return PM51.section({
      title: label, help: `Workflows in ${repo} on ${f.name}.`,
      action: { label: 'Copy link', icon: 'copy', action: 'pm51-source-open-external', data: { name: f.name, id: f.id } },
      body: PM51.home(PIN, workflows().length ? PM51.list(workflows().map(w => ({
        title: w.name, pill: (pinned().includes(w.name) ? PM51.tag('Pinned') + ' ' : '') + (w.status === 'passing' ? PM51.status('Passing', 'ready') : w.status === 'failing' ? PM51.status('Failing', 'attention') : ''),
        meta: `${w.workflow} · ${TRIGGER[w.trigger] || w.trigger.toLowerCase()} · last run ${String(w.lastRun).toLowerCase()}`,
        end: PM51.iconBtn({ icon: 'pin', label: pinned().includes(w.name) ? 'Unpin' : 'Pin', action: 'pm51-source-pin', data: { name: w.name }, cls: 'pm51-source-pin' + (pinned().includes(w.name) ? ' is-on' : '') }) + PM51.btn({ label: 'Run', icon: 'play', small: true, action: 'pm51-source-run', data: { name: w.name } })
      }))) : PM51.note('No workflows found in this repository yet.'))
    }) + PM51.slot() + PM51.advanced([
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
  PM51.on('source-push', el => { const f = byId(ds(el, 'id')); if (f) gitAccess(f); });
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

  PM51.on('source-gh-connect', () => { const f = byId('github'); if (!f) return; PM51.setSel(ID, f.id); PM51.setTab(ID, 'services'); if (connected(f)) disconnect(f); else connectPanel(f, false); });
  PM51.on('source-gh-disconnect', el => { const f = byId(ds(el, 'id')); if (f) disconnect(f); });

  /* ---------- guided: a new repository, or contributing to someone else's --------------------------- */
  const LICENSES = [['None', 'No license', 'All rights reserved'], ['MIT', 'MIT', 'Short and permissive'], ['Apache-2.0', 'Apache 2.0', 'Permissive, with a patent grant'], ['GPL-3.0', 'GPL 3.0', 'Changes must stay open']];
  const IGNORES = ['None', 'Node', 'Python', 'Rust', 'Go', 'Java'];
  const repoName = v => String(v || '').trim().replace(/\.git$/, '').split(/[/:]/).pop();
  function newRepoWizard() {
    const cur = PM51.value(W + 'new-repo-details'); const det = cur && typeof cur === 'object' ? cur : {};
    const svcs = forges().filter(f => connected(f) && f.kind !== 'generic');
    PM51.wizard({
      title: 'Create a new repository', subtitle: 'An online home for a project, with its first files.', eyebrow: 'Repository', icon: 'branch', finishLabel: 'Create repository',
      draft: { service: svcs.some(f => f.name === cfg().service) ? cfg().service : ((svcs[0] || {}).name || ''), name: '', visibility: det.visibility || 'private', license: det.license || 'MIT', gitignore: det.gitignore || 'None', branch: det.default_branch || mainBranch() },
      steps: [
        { label: 'Where', icon: 'cloud', title: 'Where should it live?', lead: 'Pick a code service you are signed in to.',
          render: d => svcs.length ? PM51.tiles(svcs.map(f => ({ title: f.name, text: `Signed in as ${f.defaultAccount}`, icon: 'cloud', selected: d.service === f.name, data: { service: f.name } })), { action: 'pm51-source-w-service' }) : PM51.note('Connect a code service first, under Code Services.', 'attention'),
          check: d => svcs.length ? (d.service ? '' : 'Pick where it should live.') : 'Connect a code service first.' },
        { label: 'Name', icon: 'edit', title: 'What is it called, and who can see it?', recap: d => d.name,
          render: d => `<div class="o55-setup-fields">${PM51.field('Name', `<input class="text-control o55-nr-name o55-setup-mono" value="${a(d.name)}" placeholder="my-project" autocomplete="off" spellcheck="false"/>`, 'Letters, numbers, - and _.')}</div>` + PM51.tiles([['private', 'lock', 'Private', 'Only you and people you invite.'], ['public', 'globe', 'Public', 'Anyone can see it; only you can change it.']].map(([v, ic, t, x]) => ({ title: t, text: x, icon: ic, selected: d.visibility === v, data: { vis: v } })), { action: 'pm51-source-w-vis' }),
          collect: (w, d) => { d.name = String(w.querySelector('.o55-nr-name').value || '').trim(); },
          check: d => !d.name ? 'Give it a name.' : !/^[A-Za-z0-9._-]+$/.test(d.name) ? 'Use letters, numbers, dots, - and _ only.' : repos().some(r => r.name === d.name) ? `${d.name} is already on your list.` : '' },
        { label: 'First files', icon: 'file', title: 'What should it start with?', lead: 'All three can be changed later in the repository itself.',
          render: d => `<div class="o55-setup-fields">${PM51.field('License', PM51.dropdown(d.license, LICENSES.map(([v, l, m]) => ({ value: v, label: l, meta: m })), { cls: 'o55-nr-license', label: 'License' }))}${PM51.field('.gitignore template', PM51.dropdown(d.gitignore, IGNORES.map(v => ({ value: v, label: v === 'None' ? 'None' : v })), { cls: 'o55-nr-ignore', label: '.gitignore template' }), 'Keeps build output and secrets out of history.')}${PM51.field('Starting branch', `<input class="text-control o55-nr-branch o55-setup-mono" value="${a(d.branch)}" autocomplete="off" spellcheck="false"/>`, 'Starts as your main branch name.')}</div>` + PM51.bound.rows([W + 'create-github-repo']),
          collect: (w, d) => { const l = w.querySelector('.o55-nr-license'), g = w.querySelector('.o55-nr-ignore'), b = w.querySelector('.o55-nr-branch'); if (l) d.license = l.value; if (g) d.gitignore = g.value; if (b) d.branch = String(b.value || '').trim() || mainBranch(); } }
      ],
      onFinish: d => {
        if (commitSettingValue(W + 'new-repo-details', { visibility: d.visibility, default_branch: d.branch, license: d.license, gitignore: d.gitignore })) o55Notify(W + 'new-repo-details', null);
        const f = forges().find(x => x.name === d.service) || {};
        repos().push({ name: d.name, forge: d.service, remote: 'origin', address: f.id === 'github' ? `github.com/${f.defaultAccount}/${d.name}` : `${d.name} on ${d.service}`, branch: d.branch, state: 'Checking', protection: safety().protectMain ? 'Protected' : 'None', lfs: 'Not needed' });
        saveState(); refresh(); PM51.toast('Repository created', `${d.name} on ${d.service}, ${d.visibility}, starting on ${d.branch}. Example only: nothing was created online.`, 'info');
      }
    });
  }
  function contributeWizard() {
    const gh = byId('github'); const account = gh && connected(gh) ? gh.defaultAccount : 'you';
    PM51.wizard({
      title: 'Contribute to another project', subtitle: 'Work on someone else\'s project through your own copy, and send your changes back for review.', eyebrow: 'Contribute', icon: 'branch', finishLabel: 'Set it up',
      draft: { upstream: String(PM51.value(W + 'upstream-repo') || ''), fork: PM51.value(W + 'create-fork') !== false, branch: String(PM51.value(W + 'feature-branch-name') || '') },
      steps: [
        { label: 'Project', icon: 'search', title: 'Which project do you want to help with?', lead: 'Its address, or owner/name on GitHub.', recap: d => d.upstream,
          render: d => `<div class="o55-setup-fields">${PM51.field('Original project', `<input class="text-control o55-ct-up o55-setup-mono" value="${a(d.upstream)}" placeholder="someone/their-project" autocomplete="off" spellcheck="false"/>`)}</div>`,
          collect: (w, d) => { d.upstream = String(w.querySelector('.o55-ct-up').value || '').trim(); },
          check: d => !d.upstream ? 'Enter the project.' : !/^[\w.-]+\/[\w.-]+$|^(https?:\/\/|git@)\S+/.test(d.upstream) ? 'Use owner/name, or a full address.' : '' },
        { label: 'Your copy', icon: 'copy', title: 'Work in your own copy?', lead: 'A fork is your copy on your account; your changes go back as a review request.', recap: d => d.fork ? 'My own copy' : 'The original',
          render: d => PM51.tiles([[true, 'copy', 'Make my own copy (fork)', `It will be github.com/${account}/${repoName(d.upstream) || 'project'}.`], [false, 'branch', 'Work on the original', 'Only if you can already push to it.']].map(([v, ic, t, x]) => ({ title: t, text: x, icon: ic, selected: d.fork === v, data: { fork: String(v) } })), { action: 'pm51-source-w-fork' }) },
        { label: 'Branch', icon: 'branch', title: 'What should your branch be called?', lead: 'Your changes go on this branch, not on the project\'s main branch.',
          render: d => `<div class="o55-setup-fields">${PM51.field('Branch for my changes', `<input class="text-control o55-ct-branch o55-setup-mono" value="${a(d.branch || 'fix/' + (repoName(d.upstream) || 'my-change'))}" autocomplete="off" spellcheck="false"/>`)}</div>`,
          collect: (w, d) => { d.branch = String(w.querySelector('.o55-ct-branch').value || '').trim(); },
          check: d => !d.branch ? 'Name the branch.' : /\s/.test(d.branch) ? 'Branch names have no spaces.' : '' }
      ],
      onFinish: d => {
        const name = repoName(d.upstream); const where = d.fork ? `github.com/${account}/${name}` : '';
        [[W + 'upstream-repo', d.upstream], [W + 'create-fork', d.fork], [W + 'feature-branch-name', d.branch], [W + 'fork-location', where]].forEach(([id, v]) => { if (commitSettingValue(id, v)) o55Notify(id, v); });
        if (!repos().some(r => r.name === name)) repos().push({ name, forge: 'GitHub', remote: d.fork ? 'origin (your copy), upstream' : 'origin', address: where || d.upstream, branch: d.branch, state: 'Checking', protection: 'None', lfs: 'Not needed' });
        saveState(); refresh(); PM51.toast('Ready to contribute', `${d.fork ? `Your copy is ${where}` : `Working on ${d.upstream}`}, on ${d.branch}. Example only: nothing was forked.`, 'info');
      }
    });
  }
  /* ---------- guided: connecting a code service, and how Git signs in -------------------------------------------- */
  const TOKEN_WHERE = { github: 'Settings › Developer settings › Personal access tokens', 'github-enterprise': 'Settings › Developer settings › Personal access tokens', gitlab: 'Preferences › Access tokens', 'gitlab-self': 'Preferences › Access tokens', azure: 'User settings › Personal access tokens', 'azure-server': 'User settings › Personal access tokens', bitbucket: 'Personal settings › API tokens', 'bitbucket-dc': 'Profile › Manage account › HTTP access tokens', forgejo: 'Settings › Applications', gitea: 'Settings › Applications', 'cursor-origin': 'Settings › Access tokens' };
  const hostOf = f => f.instanceUrl ? String(f.instanceUrl).replace(/^https?:\/\//, '').replace(/\/.*$/, '') : f.id === 'github' ? 'github.com' : f.id === 'gitlab' ? 'gitlab.com' : f.id === 'bitbucket' ? 'bitbucket.org' : f.id === 'azure' ? 'ssh.dev.azure.com' : (API[f.id] || f.name);
  const sys = () => PM51.sysSsh;
  /* the one-time default: a service that already pushes over SSH names the key it uses */
  const pushKey = f => { if (f.pushKeyId === undefined && f.pushAccess === 'Ready' && sys() && sys().keys().length) f.pushKeyId = (sys().keys().find(k => !k.old) || sys().keys()[0]).id; return sys() && f.pushKeyId ? sys().keyById(f.pushKeyId) : null; };
  const gitTarget = (f, account) => ({ kind: 'git', name: f.name, host: hostOf(f), account: account || f.defaultAccount, canAdd: connected(f) || !!account });
  const accessText = f => f.pushAccess !== 'Ready' ? 'Not set up yet' : f.pushVia === 'https' ? 'HTTPS with a token in the keychain' : pushKey(f) ? `SSH key ${pushKey(f).name}` : 'SSH key';
  function gitAccess(f) {
    if (!sys()) { PM51.toast('SSH keys are not available', 'Open Server & Project Location once, then try again.', 'info'); return; }
    sys().keyWizard({ target: gitTarget(f), keyId: pushKey(f) ? pushKey(f).id : '', refreshWith: () => { saveState(); refresh(); },
      onDone: id => { Object.assign(f, { pushAccess: 'Ready', pushKeyId: id, pushVia: 'ssh', ssh: 'Healthy', lastTest: 'Passed' }); } });
  }
  function connectWizard(f, reauth) {
    const S = sys(), on = connected(f), browser = hasSignIn(f);
    const draft = { how: browser ? 'browser' : 'token', account: on && !reauth ? '' : (on ? f.defaultAccount : ''), tokenGiven: false, signedIn: false, address: f.instanceUrl || '', via: 'ssh', keyMode: '', keyId: '', newName: `puppet-master-${f.id}`, newType: 'Ed25519', filePath: '~/.ssh/id_ed25519', pasted: '', place: 'auto', checked: false };
    const steps = [];
    if (f.kind === 'instance') steps.push({ label: 'Address', icon: 'globe', title: `Where does your ${f.name} live?`, lead: 'The address your organization uses, starting with https://.',
      render: d => `<div class="o55-setup-fields">${PM51.field(f.addressLabel || 'Service address', `<input class="text-control o55-cw-addr o55-setup-mono" value="${a(d.address)}" placeholder="https://code.example.com" autocomplete="off" spellcheck="false"/>`)}</div>`,
      collect: (w, d) => { const x = w.querySelector('.o55-cw-addr'); if (x) d.address = String(x.value || '').trim(); }, check: d => /^https?:\/\/\S+\.\S+/.test(d.address) ? '' : 'Enter the full address, starting with https://.', recap: d => d.address.replace(/^https?:\/\//, '') });
    steps.push({ label: 'Sign in', icon: 'user', title: `Sign in to ${f.name}`, lead: 'This lets Puppet Master list repositories, open reviews and read automation.',
      render: d => (browser ? PM51.tiles([{ title: 'Sign in with my browser', text: `${f.name} asks you to approve Puppet Master. Only the permissions below are asked for.`, icon: 'browser', key: 'browser', meta: 'Easiest' }, { title: 'Use a token instead', text: `Make one on ${f.name} and paste it here.`, icon: 'key', key: 'token' }].map(t => ({ title: t.title, text: t.text, icon: t.icon, meta: t.meta, selected: d.how === t.key, data: { how: t.key } })), { action: 'pm51-source-cw-how' }) : '')
        + (d.how === 'browser' ? (d.signedIn ? PM51.panelSection('Signed in', PM51.kv([['Account', d.account], ['Permissions', 'Repositories · Reviews · Automation']]), '', { icon: 'user' }) : `<div class="pm51-perm-actions">${PM51.btn({ label: 'Open sign-in', primary: true, icon: 'external', action: 'pm51-source-cw-signin' })}</div>`)
          : `<div class="o55-setup-fields">${PM51.field('Account name', `<input class="text-control o55-cw-acct" value="${a(d.account)}" placeholder="your-name" autocomplete="off" spellcheck="false"/>`)}${PM51.field('Token', '<input class="text-control o55-cw-token" type="password" autocomplete="off" placeholder="' + (d.tokenGiven ? 'Saved. Paste a new one to replace it' : 'Paste it here') + '"/>', `Make it on ${f.name}: ${TOKEN_WHERE[f.id] || 'your account settings › tokens'}, with repository and review permissions. Kept in the system keychain, never in a file.`)}</div>`),
      collect: (w, d) => { const ac = w.querySelector('.o55-cw-acct'), tk = w.querySelector('.o55-cw-token'); if (ac) d.account = String(ac.value || '').trim(); if (tk && String(tk.value || '').trim()) d.tokenGiven = true; },
      check: d => d.how === 'browser' ? (d.signedIn ? '' : 'Open sign-in first.') : !d.account ? 'Enter your account name.' : !d.tokenGiven ? 'Paste the token.' : '', recap: d => d.account });
    steps.push({ label: 'Git access', icon: 'key', title: 'How should Git send and fetch changes?', lead: 'Git signs in separately from the website. A key is the most reliable choice.',
      render: d => PM51.tiles([{ title: 'With an SSH key', text: 'No password prompts; works for every repository on the account.', icon: 'key', key: 'ssh', meta: 'Recommended' }, { title: 'With HTTPS and a token', text: d.how === 'token' ? 'Uses the token you just pasted, from the keychain.' : 'Uses a token kept in the keychain.', icon: 'lock', key: 'https' }].map(t => ({ title: t.title, text: t.text, icon: t.icon, meta: t.meta, selected: d.via === t.key, data: { via: t.key } })), { action: 'pm51-source-cw-via' })
        + (d.via === 'ssh' && S ? `<p class="o55-quiet-line o55-key-which">Which key?</p>` + S.keyPick(d) : ''),
      collect: (w, d) => { if (S) S.keyCollect(w, d); }, check: d => d.via === 'https' ? '' : S ? S.keyCheck(d) : '', recap: d => d.via === 'https' ? 'HTTPS' : `Key ${S ? S.keyLabel(d) : ''}` });
    steps.push({ label: 'Check', icon: 'test', title: 'Check the connection', lead: 'Puppet Master reaches the service, then fetches and tries a harmless push.',
      render: d => { d.target = gitTarget(f, d.account); if (d.via === 'ssh' && S && !d.checked) return (d.place === 'auto' ? PM51.note(`The key is added to your ${f.name} account for you when you check.`, 'info') : '') + S.checkStep(d); if (S && d.via === 'ssh') return S.checkStep(d); return d.checked ? PM51.steps([{ title: `Reached ${hostOf(f)}`, desc: 'Over HTTPS' }, { title: `Signed in as ${d.account}`, desc: 'With the token from the keychain' }, { title: 'Can fetch and push', desc: 'A test push was refused on purpose, so nothing changed' }].map(x => Object.assign({ status: 'Example', tone: 'info', done: true }, x))) + PM51.note('Example data only.', 'info') : `<div class="pm51-perm-actions">${PM51.btn({ label: 'Check connection', primary: true, icon: 'test', action: 'pm51-servers-key-check' })}</div>`; },
      check: d => d.checked ? '' : 'Run Check connection first.', recap: () => 'Works' });
    PM51.wizard({ title: reauth ? `Reauthorize ${f.name}` : on ? `Add another ${f.name} account` : (VERB[f.id] || `Connect ${f.name}`), subtitle: f.help || 'Keep code online, review changes and run automation.', eyebrow: 'Code service', icon: 'cloud', steps, draft, finishLabel: on && !reauth ? 'Add account' : 'Connect',
      onFinish: d => {
        const keyId = d.via === 'ssh' && S ? S.commitKey(d) : '';
        if (d.address) f.instanceUrl = d.address;
        Object.assign(f, { status: 'active', accounts: on && !reauth ? (f.accounts || 1) + 1 : Math.max(1, f.accounts || 0), defaultAccount: on && !reauth ? f.defaultAccount : d.account, scopes: ['Repository', 'Reviews', 'Automation'], ssh: d.via === 'ssh' ? 'Healthy' : 'Not used', lastTest: 'Passed', pushAccess: 'Ready', pushVia: d.via, pushKeyId: keyId, lastCheck: 'Just now' });
        if (!cfg().service || cfg().service === 'None') cfg().service = f.name;
        PM51.setSel(ID, f.id); saveState(); refresh();
        PM51.toast(`${f.name} connected`, `Signed in as ${d.account}. Example only: nothing was sent to ${f.name}.`, 'info');
      } });
  }
  PM51.on('source-cw-how', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.how = ds(el, 'how'); const at = w.step(); window.setTimeout(() => { if (w.step() === at) w.go(at); }, 0); });
  PM51.on('source-cw-signin', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.signedIn = true; w.draft.account = w.draft.account || 'you'; w.go(w.step()); PM51.toast('Signed in', 'Example only: no browser window opened in this preview.', 'info'); });
  PM51.on('source-cw-via', el => { const w = PM51.wizardOf(el); if (!w) return; if (sys()) sys().keyCollect(el.closest('.drawer-wrap'), w.draft); w.draft.via = ds(el, 'via'); w.draft.checked = false; const at = w.step(); window.setTimeout(() => { if (w.step() === at) w.go(at); }, 0); });

  /* ---------- guided: who you are in history, signing, large files, ignored files ---------------------------------- */
  /* The guide's answers are inventory rows (branching.worktrees.git-author-name and the rest, admitted 2026-09-28), so
     search, Details, All Settings and transfer read the same values; only `scope` (every project or this one) stays
     the guide's own. The guide keeps its familiar shapes: text for the lists, none/ssh/gpg for signing. */
  const GIT_ROWS = { name: 'git-author-name', email: 'git-author-email', sign: 'commit-signing', lfs: 'large-file-storage', lfsMb: 'large-file-threshold', lfsTypes: 'large-file-types', ignore: 'default-ignore-patterns', protected: 'protected-branches' };
  const SIGNING = [['none', 'off'], ['ssh', 'ssh-key'], ['gpg', 'gpg-key']];
  const lines = (v, sep) => String(v || '').split(sep).map(x => x.trim()).filter(Boolean);
  const gitRead = { sign: v => (SIGNING.find(p => p[1] === v) || SIGNING[0])[0], lfsTypes: v => (Array.isArray(v) ? v : []).join(', '), ignore: v => (Array.isArray(v) ? v : []).join('\n'), protected: v => (Array.isArray(v) ? v : []) };
  const gitWrite = { sign: v => (SIGNING.find(p => p[0] === v) || SIGNING[0])[1], lfs: v => !!v, lfsMb: v => Math.min(2000, Math.max(1, Number(v) || 50)), lfsTypes: v => Array.isArray(v) ? v : lines(v, ','), ignore: v => Array.isArray(v) ? v : lines(v, '\n') };
  const gitSet = (id, v) => { if (commitSettingValue(id, v)) o55Notify(id, v); };
  let gitView = null;
  const git = () => {
    if (gitView) return gitView;
    const own = () => { const s = PM51.s(); if (!s.sourceGit) s.sourceGit = { scope: 'all' }; return s.sourceGit; };
    const keyFor = k => k === 'signKey' ? 'ssh' : 'gpg';
    gitView = {};
    Object.entries(GIT_ROWS).forEach(([k, id]) => Object.defineProperty(gitView, k, { enumerable: true,
      get: () => { const v = PM51.value(W + id); return gitRead[k] ? gitRead[k](v) : v; },
      set: v => gitSet(W + id, gitWrite[k] ? gitWrite[k](v) : v) }));
    Object.defineProperty(gitView, 'scope', { enumerable: true, get: () => own().scope || 'all', set: v => { own().scope = v; } });
    ['signKey', 'gpgKey'].forEach(k => Object.defineProperty(gitView, k, { enumerable: true,
      get: () => gitView.sign === keyFor(k) ? PM51.value(W + 'commit-signing-key') || '' : '',
      set: v => { if (gitView.sign === keyFor(k)) gitSet(W + 'commit-signing-key', v || ''); } }));
    return gitView;
  };
  /* search and Details land on the row that shows a setting; a row showing several carries each id */
  const ids = (...list) => list.map(id => `<span class="o55-alias" data-setting-id="${a(W + id)}"></span>`).join('');
  const protectedList = () => { const g = git(); return g.protected && g.protected.length ? g.protected : [mainBranch(), 'release/*']; };
  const signText = g => g.sign === 'ssh' ? `With SSH key ${(sys() && sys().keyById(g.signKey) || {}).name || 'your key'}` : g.sign === 'gpg' ? `With GPG key ${g.gpgKey || ''}`.trim() : 'Not signed';
  function gitSetupWizard(start) {
    const g = git(), gh = byId('github'), ghOn = gh && connected(gh);
    const draft = Object.assign(clone(g), { useNoreply: false });
    const keysList = sys() ? sys().keys() : [];
    PM51.wizard({ title: 'Set up Git', subtitle: 'Who you are in history, whether your changes are signed, and which files Git treats specially.', eyebrow: 'Version history', icon: 'branch', start: start || 0, draft, finishLabel: 'Save', steps: [
      { label: 'You', icon: 'user', title: 'Who are you in the history?', lead: 'Every saved change carries a name and an email. Code services use the email to link changes to your account.',
        render: d => `<div class="o55-setup-fields">${PM51.field('Name', `<input class="text-control o55-gs-name" value="${a(d.name)}" placeholder="Your name" autocomplete="off"/>`)}${PM51.field('Email', `<input class="text-control o55-gs-email" value="${a(d.email)}" placeholder="you@example.com" autocomplete="off" spellcheck="false"/>`, ghOn ? `Or keep your address private with GitHub's: ${gh.defaultAccount}@users.noreply.github.com.` : 'It is visible to anyone who can see the history.')}${ghOn ? `<div class="pm51-perm-actions">${PM51.btn({ label: 'Use my private GitHub address', small: true, icon: 'lock', action: 'pm51-source-gs-noreply', data: { email: `${gh.defaultAccount}@users.noreply.github.com` } })}</div>` : ''}${PM51.field('Use it for', PM51.select(d.scope, [['all', 'Every project on this server'], ['project', 'Only this project']], { cls: 'o55-gs-scope', label: 'Use it for' }))}</div>`,
        collect: (w, d) => { const v = s => String((w.querySelector(s) || {}).value || '').trim(); d.name = v('.o55-gs-name'); d.email = v('.o55-gs-email'); const sc = w.querySelector('.o55-gs-scope'); if (sc) d.scope = sc.value; },
        check: d => !d.name ? 'Enter the name to show on your changes.' : !/^\S+@\S+\.\S+$/.test(d.email) ? 'Enter an email address.' : '', recap: d => d.name },
      { label: 'Signing', icon: 'lock', title: 'Sign your changes?', lead: 'A signature proves a change really came from you. Some projects only accept signed changes.',
        render: d => PM51.tiles([['none', 'Don’t sign', 'Fine for most projects.', 'minus'], ['ssh', 'Sign with my SSH key', 'The simplest way; the same kind of key Git signs in with.', 'key'], ['gpg', 'Sign with a GPG key', 'For projects that ask for GPG.', 'shield']].map(([k, t, x, ic]) => ({ title: t, text: x, icon: ic, selected: d.sign === k, data: { sign: k } })), { action: 'pm51-source-gs-sign' })
          + (d.sign === 'ssh' ? `<div class="o55-setup-fields">${PM51.field('Key', keysList.length ? PM51.select(d.signKey || (keysList.find(k => !k.old) || keysList[0]).id, keysList.map(k => ({ value: k.id, label: k.name, meta: `${k.type} · ${k.where}` })), { cls: 'o55-gs-key', label: 'Key' }) : PM51.note('No SSH keys yet. Add one under Server & Project Location › Servers › SSH keys.', 'attention'), 'Add the same key on your code service as a signing key, so it shows your changes as verified.')}</div>` : d.sign === 'gpg' ? `<div class="o55-setup-fields">${PM51.field('GPG key ID', `<input class="text-control o55-gs-gpg o55-setup-mono" value="${a(d.gpgKey)}" placeholder="3AA5C34371567BD2" autocomplete="off" spellcheck="false"/>`, 'The private key stays in your GPG keychain.')}</div>` : ''),
        collect: (w, d) => { const k = w.querySelector('.o55-gs-key'), gp = w.querySelector('.o55-gs-gpg'); if (k) d.signKey = k.value; if (gp) d.gpgKey = String(gp.value || '').trim(); },
        check: d => d.sign === 'ssh' && !keysList.length ? 'Add an SSH key first, or pick another choice.' : d.sign === 'gpg' && !/^[0-9A-Fa-f]{8,40}$/.test(d.gpgKey || '') ? 'Enter the GPG key ID (8 to 40 letters and digits).' : '', recap: d => signText(d) },
      { label: 'Files', icon: 'file', title: 'Which files need special care?', lead: 'Big files slow history down; some files should never be saved in it.',
        render: d => PM51.rows([{ label: 'Store big files separately (Git LFS)', help: 'Keeps the history small and fast.', control: PM51.toggle(!!d.lfs, { action: 'pm51-source-gs-lfs', label: 'Store big files separately' }) }])
          + `<div class="o55-setup-fields">${PM51.field('Files over this size, in MB', `<input class="text-control o55-gs-mb" type="number" min="1" max="2000" value="${a(d.lfsMb)}"/>`)}${PM51.field('And always these kinds', `<input class="text-control o55-gs-types o55-setup-mono" value="${a(d.lfsTypes)}" autocomplete="off" spellcheck="false"/>`)}${PM51.field('Never save these in history (.gitignore)', `<textarea class="form-textarea o55-gs-ignore o55-setup-mono" rows="6" spellcheck="false">${h(d.ignore)}</textarea>`, 'One per line. Added to new repositories; secrets like .env belong here.')}</div>`,
        collect: (w, d) => { const v = s => (w.querySelector(s) || {}).value; d.lfsMb = Math.max(1, Math.min(2000, Math.round(Number(v('.o55-gs-mb')) || 50))); d.lfsTypes = String(v('.o55-gs-types') || '').trim(); d.ignore = String(v('.o55-gs-ignore') || '').replace(/\r/g, '').trim(); },
        recap: d => d.lfs ? `LFS over ${d.lfsMb} MB` : 'No LFS' },
      { label: 'Recap', icon: 'check', title: 'Save these for Git?', lead: 'You can change each one later under Defaults & Safety.',
        render: d => PM51.panelSection('Git', PM51.kv([['Name on changes', d.name], ['Email on changes', d.email], ['Used for', d.scope === 'all' ? 'Every project on this server' : 'Only this project'], ['Signing', signText(d)], ['Big files', d.lfs ? `Git LFS for files over ${d.lfsMb} MB and ${d.lfsTypes || 'no extra kinds'}` : 'Kept in the normal history'], ['Never in history', `${d.ignore.split('\n').filter(Boolean).length} patterns`]]), '', { icon: 'branch' }) }
    ], onFinish: d => { Object.assign(git(), { name: d.name, email: d.email, scope: d.scope, sign: d.sign, signKey: d.signKey || (keysList[0] || {}).id || '', gpgKey: d.gpgKey, lfs: d.lfs, lfsMb: d.lfsMb, lfsTypes: d.lfsTypes, ignore: d.ignore }); saveState(); refresh(); PM51.toast('Git is set up', `Changes are saved as ${d.name} <${d.email}>. Example only: nothing was written to git config.`, 'info'); } });
  }
  PM51.on('source-git-setup', el => gitSetupWizard(Number(ds(el, 'step')) || 0));
  PM51.on('source-git-access', () => { const f = forges().find(x => x.name === cfg().service && connected(x)) || forges().find(connected); if (f) gitAccess(f); else PM51.toast('Connect a code service first', 'Git sign-in is set up per code service, under Code Services.', 'info'); });
  PM51.on('source-gs-noreply', el => { const inp = el.closest('.o55g-main').querySelector('.o55-gs-email'); if (inp) inp.value = ds(el, 'email'); });
  PM51.on('source-gs-sign', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.sign = ds(el, 'sign'); const at = w.step(); window.setTimeout(() => { if (w.step() === at) w.go(at); }, 0); });
  PM51.on('source-gs-lfs', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.lfs = !w.draft.lfs; el.classList.toggle('on', w.draft.lfs); el.setAttribute('aria-checked', String(w.draft.lfs)); });
  PM51.on('source-protected', () => {
    PM51.panel({ title: 'Protected branches', subtitle: 'Changes to these go through a review; they are never overwritten.', icon: 'lock',
      body: PM51.panelSection('Branches', `<textarea class="form-textarea o55-sc-prot o55-setup-mono" rows="5" spellcheck="false" aria-label="Protected branches">${h(protectedList().join('\n'))}</textarea>`, 'One per line. * matches anything, so release/* covers every release branch.')
        + PM51.note(safety().protectMain ? 'Protection is on at this safety level.' : 'Protection is off at this safety level; pick Strict, Standard or Custom to turn it on.', safety().protectMain ? 'info' : 'attention'),
      primaryLabel: 'Save', onPrimary: w => { const list = String((w.querySelector('.o55-sc-prot') || {}).value || '').split('\n').map(x => x.trim()).filter(Boolean); if (!list.length) { PM51.toast('Keep at least one branch', `For example ${mainBranch()}.`, 'info'); return false; } git().protected = list; saveState(); refresh(); PM51.toast('Protected branches saved', list.join(', ')); } });
  });

  const PUBLISH = 'safety.approvals.external-publish-ask';
  function publishText() { const st = PM51.setting(PUBLISH); if (!st) return 'Set in Permissions'; try { return PM51.valueText(st, PM51.value(PUBLISH)); } catch (_e) { return 'Set in Permissions'; } }
  PM51.on('source-open-publish', () => { PM51.setTab('permissions', 'approvals'); PM51.go('safety', 'permissions'); });
  PM51.on('source-new-repo', () => newRepoWizard());
  PM51.on('source-contribute', () => contributeWizard());
  PM51.on('source-w-service', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.service = ds(el, 'service'); w.next(); });
  PM51.on('source-w-vis', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.visibility = ds(el, 'vis'); });
  PM51.on('source-w-fork', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.fork = ds(el, 'fork') === 'true'; w.next(); });
  /* How Git signs in is kept on each code service (its push access); Details lists what each connected one uses. */
  PM51.perValues(W + 'git-push-method', () => forges().filter(connected).map(f => ({ name: f.name, value: f.pushAccess !== 'Ready' ? 'Not set up yet' : f.pushVia === 'https' ? 'https-token' : 'ssh-key' })));
  PM51.perValues(W + 'git-push-key', () => forges().filter(f => connected(f) && f.pushAccess === 'Ready' && f.pushVia !== 'https').map(f => ({ name: f.name, value: (pushKey(f) || {}).name || 'None chosen' })));
  PM51.owner(ID, id => { if (GH.includes(id)) { PM51.setTab(ID, 'services'); if (byId('github')) PM51.setSel(ID, 'github'); return; } const e = PM51.placement.byId[id]; if (e && e.tab) PM51.setTab(ID, e.tab); });
  [PRESET, FORCE, W + 'default-branch', W + 'worktree-base-dir', 'ai.accounts.github-host-policy', W + 'pre-merge-tests'].forEach(id => PM51.watch(id, () => refresh()));
  /* the pins that lived on each workflow move into the Pinned workflows row once */
  migratePins = () => { const s0 = sc(); if (s0.o55Pins) return; s0.o55Pins = true; const was = workflows().filter(w => w.pinned).map(w => w.name); workflows().forEach(w => { delete w.pinned; }); if (was.length && !pinned().length && commitSettingValue(PIN, was)) saveState(); };

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
      worktrees().push({ name, path: `${wtFolder()}/${name}`, branch: String(data.branch || '').trim() || name, owner: 'You', state: 'Clean', lease: 'Persistent' });
      saveState(); refresh(); PM51.toast('Worktree created', `${name} is ready in ${wtFolder()}.`, 'info');
    }
  }));
  PM51.on('source-worktree-menu', el => {
    const w = worktrees().find(x => x.name === ds(el, 'name')); if (!w) return;
    const inUse = /Goal/.test(w.lease || '') || w.name === 'main';
    PM51.menu(el, [
      { label: 'Details', icon: 'info', onClick: () => PM51.panel({ title: w.name, pill: w.state === 'Clean' ? PM51.pill('Ready') : PM51.pill('Needs attention'), body: PM51.panelSection('Worktree', PM51.kv([['Folder', w.path], ['Branch', w.branch], ['Used by', ownerLabel(w)], ['Kept', w.lease], ['Changes', w.state === 'Clean' ? 'None waiting' : w.state]])) }) },
      { label: 'Copy folder path', icon: 'copy', onClick: () => copyText(w.path, 'Folder path') },
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
    repos().push({ name, forge: 'GitHub', remote: 'origin', branch: mainBranch(), state: 'Checking', protection: 'None', lfs: 'Not needed' });
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
  PM51.on('source-open-external', el => { const f = byId(ds(el, 'id')) || forges().find(x => x.name === ds(el, 'name')); const url = f ? forgeUrl(f) : ''; if (url) copyText(url, 'Link'); });
  PM51.on('source-pin', el => { const n = ds(el, 'name'); const cur = pinned(); const next = cur.includes(n) ? cur.filter(x => x !== n) : [...cur, n]; if (commitSettingValue(PIN, next)) { saveState(); o55Notify(PIN, next); } refresh(); PM51.toast(next.includes(n) ? 'Pinned' : 'Unpinned', next.includes(n) ? `${n} shows in the Source Control panel.` : n); });
  PM51.on('source-run', el => {
    const w = workflows().find(x => x.name === ds(el, 'name')); if (!w) return;
    PM51.panel({
      title: `Run ${w.name}`, subtitle: `${w.workflow} · ${TRIGGER[w.trigger] || w.trigger}`,
      body: PM51.panelSection('Run on', PM51.field('Branch', PM51.select(mainBranch(), withCurrent(repos().map(r => r.branch), mainBranch()), { label: 'Branch' }))) + PM51.note('Runs are started by the app. Nothing is sent in this preview.'),
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
      + PM51.panelSection('Safety', '<p class="pm51-ps-text">One safety level decides how carefully branches and recovery are handled: whether main is protected, whether you are asked before deletes, and whether a recovery point is saved first. Custom lets you set each one.</p>')
  }));
})();
