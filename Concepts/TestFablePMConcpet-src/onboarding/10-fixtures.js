/* PMF Product Onboarding — fixtures and deterministic owner simulators.
   Every simulator returns the same state/receipt shapes a production owner would
   (phase lists, statuses, receipts, idempotency keys). Nothing here fakes an
   external success that the scenario did not declare. */
(function () {
  'use strict';
  var PMF = window.PMF_ONBOARDING, U = PMF.util;

  // ---- scenarios (concept preview switch) -----------------------------------
  PMF.scenarios = {
    fresh: {
      label: 'First-time user', hint: 'No Projects, nothing detected, local computer.',
      projects: [], providers: {}, commit_failure: null, servers: ['studio', 'office']
    },
    returning: {
      label: 'Returning user', hint: '3 Projects, Claude ready, Cursor signed out.',
      projects: ['tastebook', 'api-backend', 'docs-site'],
      providers: { claude_sub: 'ready', cursor: 'signed_out', antigravity: 'missing_cli' }, commit_failure: null, servers: ['studio', 'office']
    },
    flaky: {
      label: 'Flaky network', hint: 'Online copy fails once during Create; retry succeeds.',
      projects: [], providers: {}, commit_failure: { phase: 'remote', times: 1 }, servers: ['studio']
    }
  };
  PMF.scenario_id = 'fresh';
  PMF.scenario = function () { return PMF.scenarios[PMF.scenario_id] || PMF.scenarios.fresh; };

  // ---- catalog data -----------------------------------------------------------
  PMF.data = {
    servers: {
      studio: { id: 'studio', name: 'Studio Mac mini', kind: 'mac', addr: 'studio.local', state: 'ready', projects: ['tastebook', 'docs-site'], version: '1.4.2' },
      office: { id: 'office', name: 'Office PC', kind: 'pc', addr: '192.168.1.24', state: 'sleeping', projects: ['api-backend'], version: '1.4.0' }
    },
    projects: {
      tastebook: { id: 'tastebook', name: 'Tastebook', path: '~/dev/tastebook', used: 'Used today', stack: 'SvelteKit · Rust', history: 'git', online: 'github' },
      'api-backend': { id: 'api-backend', name: 'api-backend', path: '~/projects/api-backend', used: 'Used yesterday', stack: 'Rust · Postgres', history: 'git', online: null },
      'docs-site': { id: 'docs-site', name: 'docs-site', path: '~/repos/docs-site', used: 'Used 3 days ago', stack: 'JS/TS', history: 'jj', online: 'gitlab' }
    },
    // Settings Transfer preview groups (canonical owner would supply these)
    transfer_groups: [
      { id: 'planning', name: 'Planning preferences', on: true },
      { id: 'permissions', name: 'Permissions and safety', on: true },
      { id: 'providers', name: 'AI provider routes', on: true },
      { id: 'notifications', name: 'Notifications', on: true },
      { id: 'testing', name: 'Testing defaults', on: true },
      { id: 'appearance', name: 'Appearance', on: false }
    ],
    hosts: [
      { id: 'github', name: 'GitHub', mono: 'GH', color: '#24292f', url: 'github.com', popular: true },
      { id: 'gitlab', name: 'GitLab', mono: 'GL', color: '#e2432a', url: 'gitlab.com', popular: true },
      { id: 'bitbucket', name: 'Bitbucket', mono: 'BB', color: '#2684ff', url: 'bitbucket.org' },
      { id: 'azure', name: 'Azure DevOps', mono: 'AZ', color: '#0078d4', url: 'dev.azure.com' },
      { id: 'forgejo', name: 'Forgejo', mono: 'FJ', color: '#fb923c', url: 'your Forgejo server' },
      { id: 'gitea', name: 'Gitea', mono: 'GT', color: '#609926', url: 'your Gitea server' }
    ],
    repos: {
      github: [
        { id: 'jared/tastebook', name: 'tastebook', meta: 'Updated 2 hours ago · main', files: 148 },
        { id: 'jared/book-club-site', name: 'book-club-site', meta: 'Updated last week · main', files: 32 },
        { id: 'jared/recipe-scraper', name: 'recipe-scraper', meta: 'Updated in March · main', files: 19 }
      ],
      gitlab: [ { id: 'jared/docs-site', name: 'docs-site', meta: 'Updated yesterday · main', files: 64 } ],
      other: [ { id: 'you/first-project', name: 'first-project', meta: 'Updated recently', files: 12 } ]
    },
    folders: [
      { path: '~/Documents/Book Club Site', meta: '32 files · no history yet', history: false },
      { path: '~/dev/tastebook', meta: '148 files · has a change history', history: true },
      { path: '~/Desktop/photos-cleanup', meta: '2,140 files · no history yet', history: false }
    ],
    nas_methods: [
      { id: 'ssh', name: 'SSH', desc: 'Secure connection. Works with most devices and servers.', rec: true },
      { id: 'smb', name: 'Windows or Mac file sharing (SMB)', desc: 'Shows up like a shared drive.' },
      { id: 'nfs', name: 'NFS', desc: 'Common on Linux storage devices.' }
    ],
    nas_devices: [
      { id: 'synology', name: 'synology-nas', addr: 'synology-nas.local', kind: 'Synology DS923+', user: 'admin' },
      { id: 'truenas', name: 'truenas', addr: '192.168.1.40', kind: 'TrueNAS', user: 'jared' }
    ],
    nas_folders: [
      { path: '/volume1/projects/book-club', meta: '58 files · has a change history' },
      { path: '/volume1/projects/newsletter', meta: '14 files · no history yet' },
      { path: '/volume1/shared/photos', meta: '9,204 files' }
    ],
    backups: [
      { id: 'b1', name: 'Tastebook', when: 'Today, 09:12', size: '184 MB', from: 'Studio Mac mini' },
      { id: 'b2', name: 'Book Club Site', when: 'Yesterday, 18:40', size: '12 MB', from: 'This computer' },
      { id: 'b3', name: 'docs-site', when: 'Aug 30', size: '64 MB', from: 'GitLab backup' }
    ],
    providers: [
      // kind: 'cli' needs a vendor binary (Install shown when missing); 'browser' signs in; 'key' enters an API key
      { id: 'claude_sub', name: 'Claude subscription', mono: 'C', color: '#c96f3d', kind: 'cli', bin: 'claude', bill: 'Charged to your Claude plan', likely: true, install: 'curl -fsSL https://claude.ai/install.sh | sh' },
      { id: 'anthropic_api', name: 'Anthropic API', mono: 'A', color: '#8b5e3c', kind: 'key', bill: 'Pay per use on your API account', likely: true, family: 'claude_sub' },
      { id: 'cursor', name: 'Cursor', mono: 'Cu', color: '#3b3b3b', kind: 'browser', bill: 'Charged to your Cursor plan', likely: true },
      { id: 'antigravity', name: 'Google Antigravity subscription', mono: 'AG', color: '#3367d6', kind: 'cli', bin: 'agy', bill: 'Charged to your Antigravity plan', likely: true, install: 'npm install -g @google/antigravity' },
      { id: 'gemini_api', name: 'Gemini API', mono: 'G', color: '#1a73e8', kind: 'key', bill: 'Pay per use on your Google account', family: 'antigravity' },
      { id: 'opencode_go', name: 'OpenCode Go', mono: 'OG', color: '#2f855a', kind: 'browser', bill: 'Included with OpenCode Go', likely: true },
      { id: 'opencode_zen', name: 'OpenCode Zen', mono: 'OZ', color: '#276749', kind: 'browser', bill: 'Pay per use on OpenCode Zen' },
      { id: 'grok_build', name: 'Grok Build subscription', mono: 'GB', color: '#111', kind: 'cli', bin: 'grok', bill: 'Charged to your Grok Build plan', install: 'curl -fsSL https://grok.x.ai/install | sh' },
      { id: 'xai_api', name: 'xAI API', mono: 'X', color: '#222', kind: 'key', bill: 'Pay per use on your xAI account', family: 'grok_build' },
      { id: 'muse', name: 'Muse Code subscription', mono: 'Mu', color: '#5a3ea1', kind: 'cli', bin: 'muse', bill: 'Charged to your Muse Code plan', install: 'brew install muse-code' },
      { id: 'meta_api', name: 'Meta Model API', mono: 'Me', color: '#0866ff', kind: 'key', bill: 'Pay per use on your Meta account', family: 'muse' },
      { id: 'qwen', name: 'Qwen Coding Plan', mono: 'Q', color: '#6236ff', kind: 'browser', bill: 'Charged to your Qwen plan' },
      { id: 'zai', name: 'Z.AI Coding Plan', mono: 'Z', color: '#0f766e', kind: 'browser', bill: 'Charged to your Z.AI plan' },
      { id: 'kimi', name: 'Kimi Code', mono: 'K', color: '#111827', kind: 'browser', bill: 'Charged to your Kimi plan' }
    ],
    free_models: [
      { id: 'free_zen', name: 'OpenCode Zen free tier', desc: 'Good for small edits and questions.', on: true },
      { id: 'free_gemini', name: 'Gemini free tier', desc: 'Daily limit. Good for drafting and summaries.', on: true },
      { id: 'free_qwen', name: 'Qwen free models', desc: 'Availability can vary by region.', on: false }
    ]
  };

  // ---- owner simulators -----------------------------------------------------
  // Each returns a Promise resolving to a truthful result object. Delays are
  // scaled so the concept feels real but not slow; reduced motion shortens waits.
  function wait(ms) { return U.sleep(U.reduced() ? Math.min(ms, 220) : ms); }
  var OWN = PMF.owners = {};

  OWN.preflightLocal = function () {
    // read-only checks: free space, permissions, compatibility. Never writes.
    PMF.command('cmd.server.preflight', { host: 'local' });
    return wait(900).then(function () {
      var r = { ok: true, checks: [
        { id: 'space', label: '212 GB free', ok: true },
        { id: 'perm', label: 'Can create folders in your home', ok: true },
        { id: 'compat', label: 'Puppet Master 1.4.2 · ready to run work', ok: true }
      ] };
      PMF.receipt('server.preflight', 'ok', r);
      return r;
    });
  };

  OWN.discoverServers = function () {
    PMF.command('cmd.server.discover', { bounded_ms: 1600, cached_first: true });
    var ids = PMF.scenario().servers || [];
    return wait(1400).then(function () {
      var found = ids.map(function (id) { return U.clone(PMF.data.servers[id]); });
      PMF.receipt('server.discover', 'ok', { found: found.length });
      return { ok: true, found: found };
    });
  };

  OWN.pair = function (server) {
    PMF.command('cmd.client.pair.start', { server_id: server.id });
    var code = '481 926';
    return { code: code, done: wait(2600).then(function () {
      PMF.receipt('client.pair', 'ok', { server_id: server.id, trust: 'granted_by_server' });
      return { ok: true, server: server };
    }) };
  };

  OWN.signInHost = function (host) {
    // Just-in-time source-host sign-in. Loopback redirect first, device code fallback.
    PMF.command('cmd.source_account.sign_in', { host: host.id, method: 'loopback_redirect' });
    return { device_code: 'WQ7F-K2PL', done: wait(2400).then(function () {
      PMF.receipt('source_account.sign_in', 'ok', { host: host.id, account: 'jared' });
      return { ok: true, account: 'jared', host: host.id };
    }) };
  };

  OWN.listRepos = function (host) {
    PMF.command('cmd.source_account.list_repositories', { host: host.id });
    return wait(900).then(function () { return { ok: true, repos: U.clone(PMF.data.repos[host.id] || PMF.data.repos.other) }; });
  };

  OWN.discoverNas = function () {
    PMF.command('cmd.remote_storage.discover', { protocol: 'ssh', mdns: '_ssh._tcp', bounded_ms: 1600 });
    return wait(1500).then(function () { return { ok: true, found: U.clone(PMF.data.nas_devices) }; });
  };

  OWN.sshConnect = function (device, password) {
    // Automatable: key generation, key install, host-key record, verification.
    // Not automatable: the first password, which is why we ask once.
    PMF.command('cmd.remote_storage.ssh.connect', { device: device.addr, user: device.user, key_type: 'ed25519' });
    var phases = [
      { id: 'key', label: 'Creating a secure key for this computer', ms: 700 },
      { id: 'install', label: 'Installing the key on ' + device.name + ' (uses your password once)', ms: 1100 },
      { id: 'verify', label: 'Testing the connection without a password', ms: 800 }
    ];
    var fail = !password || password.length < 3;
    return { phases: phases, run: function (onPhase) {
      var p = Promise.resolve();
      phases.forEach(function (ph, i) {
        p = p.then(function () { onPhase(i, 'running'); return wait(ph.ms); }).then(function () {
          if (fail && ph.id === 'install') { onPhase(i, 'failed', 'The password was not accepted by ' + device.name + '.'); throw { phase: ph.id, message: 'auth_failed' }; }
          onPhase(i, 'done');
        });
      });
      return p.then(function () {
        PMF.receipt('remote_storage.ssh.connect', 'ok', { device: device.addr, fingerprint: 'SHA256:pQ3k…7Fa', key: 'ed25519' });
        return { ok: true, fingerprint: 'pQ3k · 7Fa', device: device };
      });
    } };
  };

  OWN.transferPreview = function (fromId) {
    PMF.command('cmd.settings_transfer.preview', { from_project_id: fromId });
    return wait(500).then(function () {
      return { ok: true, groups: U.clone(PMF.data.transfer_groups),
        summary: 'Uses the same planning preferences, permissions, provider routes, notifications, and testing defaults. Your new files, history, Goals, and Plans stay separate.' };
    });
  };

  OWN.detectProviders = function (host) {
    // bounded, cached-first: only likely products on the selected host are probed
    PMF.command('cmd.provider.detect', { host: host || 'local', bounded: true, cached_first: true });
    var sc = PMF.scenario().providers || {};
    return wait(1200).then(function () {
      var states = {};
      PMF.data.providers.forEach(function (p) {
        var s = sc[p.id];
        if (s === 'ready') states[p.id] = { state: 'ready', detail: p.kind === 'cli' ? (p.bin + ' 2.1.0 found · signed in') : 'signed in' };
        else if (s === 'signed_out') states[p.id] = { state: 'signed_out', detail: p.kind === 'cli' ? (p.bin + ' found · not signed in') : 'account found · not signed in' };
        else if (s === 'missing_cli') states[p.id] = { state: 'missing_cli', detail: p.bin + ' is not installed here' };
        else states[p.id] = { state: p.kind === 'cli' ? 'missing_cli' : (p.kind === 'key' ? 'needs_key' : 'signed_out'), detail: p.kind === 'cli' ? (p.bin + ' is not installed here') : '' };
      });
      PMF.receipt('provider.detect', 'ok', { host: host || 'local', ready: Object.keys(states).filter(function (k) { return states[k].state === 'ready'; }) });
      return { ok: true, states: states };
    });
  };

  OWN.installCli = function (p, host) {
    PMF.command('cmd.provider.install', { provider: p.id, host: host || 'local', method: 'official_vendor_installer', user_triggered: true });
    var phases = [
      { id: 'fetch', label: 'Downloading the official installer', ms: 900 },
      { id: 'run', label: 'Installing ' + p.bin, ms: 1300 },
      { id: 'verify', label: 'Checking version and capabilities', ms: 600 }
    ];
    return { phases: phases, run: function (onPhase) {
      var q = Promise.resolve();
      phases.forEach(function (ph, i) { q = q.then(function () { onPhase(i, 'running'); return wait(ph.ms); }).then(function () { onPhase(i, 'done'); }); });
      return q.then(function () { PMF.receipt('provider.install', 'ok', { provider: p.id, version: '2.1.0' }); return { ok: true, version: '2.1.0' }; });
    } };
  };

  OWN.signInProvider = function (p, host) {
    PMF.command('cmd.provider.sign_in', { provider: p.id, host: host || 'local', method: 'browser_return_flow' });
    return wait(2200).then(function () { PMF.receipt('provider.sign_in', 'ok', { provider: p.id, account: 'jared@example.com' }); return { ok: true, account: 'jared@example.com' }; });
  };

  OWN.verifyKey = function (p, key) {
    PMF.command('cmd.provider.verify_key', { provider: p.id });
    var ok = /^[A-Za-z0-9_\-]{12,}$/.test(String(key || '').trim());
    return wait(1100).then(function () {
      if (!ok) { PMF.receipt('provider.verify_key', 'rejected', { provider: p.id }); return { ok: false, message: 'That key was not accepted. Keys are long and have no spaces.' }; }
      PMF.receipt('provider.verify_key', 'ok', { provider: p.id });
      return { ok: true, account: 'API account' };
    });
  };

  // The single, late, idempotent Project commit. Phases depend on the draft.
  OWN.commitProject = function (draft, attempt) {
    var idem = draft.idempotency_key;
    var cmd = PMF.command(draft.mode === 'restore' ? 'cmd.project.restore' : (draft.mode === 'existing' ? 'cmd.project.add' : 'cmd.project.create'), { idempotency_key: idem, attempt: attempt });
    var phases = [];
    if (draft.mode === 'new') {
      phases.push({ id: 'folder', label: 'Creating the folder', ms: 700 });
      if (draft.history) phases.push({ id: 'history', label: 'Starting the change history', ms: 800 });
      if (draft.inherit) phases.push({ id: 'settings', label: 'Copying settings from ' + (PMF.data.projects[draft.inherit] || {}).name, ms: 700 });
      if (draft.online) phases.push({ id: 'remote', label: 'Creating the online copy on ' + hostName(draft.online_host), ms: 1300 });
    } else if (draft.mode === 'existing') {
      if (draft.source === 'online') phases.push({ id: 'clone', label: 'Bringing in the files from ' + hostName(draft.online_host), ms: 1600 });
      if (draft.source === 'nas') phases.push({ id: 'bind', label: 'Connecting the folder on ' + (draft.nas_device ? draft.nas_device.name : 'the device'), ms: 900 });
      if (draft.source === 'folder') phases.push({ id: 'scan', label: 'Reading the folder', ms: 800 });
      if (!draft.has_history) phases.push({ id: 'history', label: 'Starting the change history', ms: 700 });
    } else if (draft.mode === 'restore') {
      phases.push({ id: 'fetch', label: 'Reading the backup', ms: 900 });
      phases.push({ id: 'restore', label: 'Restoring files and settings', ms: 1400 });
    }
    phases.push({ id: 'record', label: 'Adding the Project to Puppet Master', ms: 500 });
    var fail = PMF.scenario().commit_failure;
    return { command: cmd, phases: phases, run: function (onPhase) {
      var q = Promise.resolve();
      phases.forEach(function (ph, i) {
        q = q.then(function () { onPhase(i, 'running'); return wait(ph.ms); }).then(function () {
          if (fail && ph.id === fail.phase && attempt <= fail.times) {
            onPhase(i, 'failed', 'Could not reach ' + hostName(draft.online_host) + '. Your folder and history are fine.');
            PMF.receipt('project.commit', 'partial', { idempotency_key: idem, failed_phase: ph.id, completed: phases.slice(0, i).map(function (x) { return x.id; }) });
            throw { phase: ph.id, index: i };
          }
          onPhase(i, 'done');
        });
      });
      return q.then(function () {
        var pid = (draft.name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'project';
        var receipt = PMF.receipt('project.commit', 'ok', { idempotency_key: idem, project_id: pid, phases: phases.map(function (x) { return x.id; }) });
        return { ok: true, project_id: pid, receipt: receipt };
      });
    } };
  };
  function hostName(id) { var h = PMF.data.hosts.filter(function (x) { return x.id === id; })[0]; return h ? h.name : 'the online host'; }
  PMF.hostName = hostName;
})();
