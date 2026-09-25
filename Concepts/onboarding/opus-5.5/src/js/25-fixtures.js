/* O55.fixtures — the deterministic world the concept runs against: this computer, the network, Puppet Masters,
   source services, backups, AI accounts and Free Models routes. Scenario presets (Concept demo pill) reshape it so
   every packet scenario is reachable by ordinary UI choices. Fixture results use the owners' shapes; nothing here
   claims a real network, provider or filesystem effect. */
(function () {
  'use strict';
  const O55 = window.O55;

  const PROVIDERS = [
    /* id, name, kind (subscription|api|runtime), family, cli (binary needing Install) or null, auth (signin|key), pair (billing sibling) */
    { id: 'claude', name: 'Claude', product: 'Claude subscription', kind: 'subscription', cli: 'claude', auth: 'signin', pair: 'anthropic-api', vendor: 'Anthropic', likely: 1 },
    { id: 'codex', name: 'ChatGPT / Codex', product: 'ChatGPT plan', kind: 'subscription', cli: null, auth: 'signin', vendor: 'OpenAI', likely: 2, canon: true },
    { id: 'antigravity', name: 'Google Antigravity', product: 'Antigravity subscription', kind: 'subscription', cli: 'agy', auth: 'signin', pair: 'gemini-api', vendor: 'Google', likely: 3 },
    { id: 'cursor', name: 'Cursor', product: 'Cursor account', kind: 'api', cli: null, auth: 'key', vendor: 'Cursor', likely: 4 },
    { id: 'grok', name: 'Grok Build', product: 'Grok Build subscription', kind: 'subscription', cli: 'grok', auth: 'signin', pair: 'xai-api', vendor: 'xAI' },
    { id: 'muse', name: 'Muse Code', product: 'Muse Code subscription', kind: 'subscription', cli: 'muse', auth: 'signin', pair: 'meta-api', vendor: 'Meta' },
    { id: 'copilot', name: 'GitHub Copilot', product: 'Copilot plan', kind: 'subscription', cli: null, auth: 'signin', vendor: 'GitHub', canon: true },
    { id: 'qwen-coding', name: 'Qwen Coding Plan', product: 'Alibaba Coding Plan', kind: 'subscription', cli: null, auth: 'key', vendor: 'Alibaba' },
    { id: 'qwen-token', name: 'Qwen Token Plan', product: 'Alibaba Token Plan', kind: 'api', cli: null, auth: 'key', vendor: 'Alibaba' },
    { id: 'zai', name: 'Z.AI Coding Plan', product: 'Z.AI Coding Plan', kind: 'subscription', cli: null, auth: 'key', vendor: 'Z.AI' },
    { id: 'kimi', name: 'Kimi Code', product: 'Kimi Code plan', kind: 'subscription', cli: null, auth: 'key', vendor: 'Moonshot' },
    { id: 'minimax', name: 'MiniMax Coding Plan', product: 'MiniMax Coding Plan', kind: 'subscription', cli: null, auth: 'key', vendor: 'MiniMax', canon: true },
    { id: 'opencode-go', name: 'OpenCode Go', product: 'OpenCode Go plan', kind: 'subscription', cli: null, auth: 'key', vendor: 'OpenCode' },
    { id: 'opencode-zen', name: 'OpenCode Zen', product: 'OpenCode Zen (pay as you go)', kind: 'api', cli: null, auth: 'key', vendor: 'OpenCode' },
    { id: 'opencode-runtime', name: 'OpenCode (your own runtime)', product: 'OpenCode runtime', kind: 'runtime', cli: 'opencode', auth: 'signin', vendor: 'OpenCode' },
    { id: 'anthropic-api', name: 'Anthropic API', product: 'Anthropic API (pay as you go)', kind: 'api', cli: null, auth: 'key', pair: 'claude', vendor: 'Anthropic' },
    { id: 'gemini-api', name: 'Gemini API', product: 'Gemini API (pay as you go)', kind: 'api', cli: null, auth: 'key', pair: 'antigravity', vendor: 'Google' },
    { id: 'vertex', name: 'Vertex AI', product: 'Google Cloud Vertex AI', kind: 'api', cli: null, auth: 'key', pair: 'antigravity', vendor: 'Google' },
    { id: 'xai-api', name: 'xAI API', product: 'xAI API (pay as you go)', kind: 'api', cli: null, auth: 'key', pair: 'grok', vendor: 'xAI' },
    { id: 'meta-api', name: 'Meta Model API', product: 'Meta Model API (pay as you go)', kind: 'api', cli: null, auth: 'key', pair: 'muse', vendor: 'Meta' }
  ];

  const FORGES = [
    { id: 'github', name: 'GitHub', variants: ['hosted', 'self_managed'], visibility: ['private', 'public', 'internal'], internalNeedsOrg: true, signup: 'https://github.com/signup', device: 'github.com/login/device', primary: true },
    { id: 'gitlab', name: 'GitLab', variants: ['hosted', 'self_managed'], visibility: { hosted: ['private', 'public'], self_managed: ['private', 'public', 'internal'] }, signup: 'https://gitlab.com/users/sign_up', device: 'gitlab.com/oauth/device' },
    { id: 'azure_devops', name: 'Azure DevOps', variants: ['cloud', 'self_managed'], visibility: [], needsProject: true, signup: 'https://azure.microsoft.com/products/devops', device: 'microsoft.com/devicelogin' },
    { id: 'bitbucket_cloud', name: 'Bitbucket', variants: ['cloud'], visibility: ['private', 'public'], signup: 'https://bitbucket.org/account/signup' },
    { id: 'bitbucket_data_center', name: 'Bitbucket Data Center', variants: ['data_center'], visibility: ['private', 'public'], needsAddress: true },
    { id: 'forgejo', name: 'Forgejo', variants: ['forgejo_self_managed', 'forgejo_cloud'], visibility: ['private', 'public', 'internal'], needsAddress: true, token: true },
    { id: 'gitea', name: 'Gitea', variants: ['gitea_self_managed', 'gitea_cloud'], visibility: ['private', 'public', 'internal'], needsAddress: true, token: true },
    { id: 'cursor_origin', name: 'Cursor Origin', variants: ['preview'], visibility: ['private', 'internal'], preview: true, address: 'https://origin.cursor.com' }
  ];

  /* Official pages the onboarding opens in the browser. Only addresses the concept is sure of: a service missing here
     opens its page without the concept naming an address, and a self-managed service uses the address the person typed.
     A device code (Browser didn't open?) is offered only where the service has a device sign-in, on its hosted edition. */
  const OFFICIAL = {
    provider: { claude: 'https://claude.ai/login', codex: 'https://chatgpt.com/auth/login', antigravity: 'https://accounts.google.com', grok: 'https://accounts.x.ai', copilot: 'https://github.com/login', 'opencode-runtime': 'https://opencode.ai' },
    signup: { Claude: 'https://claude.ai/login', ChatGPT: 'https://chatgpt.com', Anthropic: 'https://console.anthropic.com', 'Google AI Studio': 'https://aistudio.google.com' },
    forge: { github: 'https://github.com/login', gitlab: 'https://gitlab.com/users/sign_in', azure_devops: 'https://dev.azure.com', bitbucket_cloud: 'https://bitbucket.org/account/signin/', cursor_origin: 'https://origin.cursor.com' },
    forgePath: { github: '/login', gitlab: '/users/sign_in', bitbucket_data_center: '/login', forgejo: '/user/login', gitea: '/user/login', azure_devops: '' },
    free: { 'free-openrouter': 'https://openrouter.ai', 'free-github-models': 'https://github.com/login', 'free-cerebras': 'https://cloud.cerebras.ai', 'free-groq': 'https://console.groq.com', 'free-hf': 'https://huggingface.co/login' },
    backup: { gdrive: 'https://accounts.google.com', onedrive: 'https://login.live.com' }
  };

  const FREE_ROUTES = [ /* mirrors the concept's Settings freeRoutes (Free Models owns no credential store) */
    { id: 'free-openrouter', name: 'OpenRouter free models', provider: 'OpenRouter', needs: 'signin' },
    { id: 'free-github-models', name: 'GitHub Models', provider: 'GitHub', needs: 'signin', usesForge: 'github' },
    { id: 'free-cerebras', name: 'Cerebras free tier', provider: 'Cerebras', needs: 'setup' },
    { id: 'free-groq', name: 'Groq free tier', provider: 'Groq', needs: 'setup', rateLimited: true },
    { id: 'free-hf', name: 'Hugging Face Inference', provider: 'Hugging Face', needs: 'setup' }
  ];

  function folders() {
    return {
      '/volume1': ['homes', 'projects', 'media', 'backups'],
      '/volume1/projects': ['recipe-app', 'garden-planner', 'old-experiments'],
      '/volume1/homes': ['jared'], '/volume1/homes/jared': ['documents', 'code'], '/volume1/media': ['photos', 'music'],
      '/volume1/backups': ['puppet-master'], '/mnt/tank': ['share', 'apps'], '/mnt/tank/share': ['projects', 'family'], '/mnt/tank/share/projects': []
    };
  }

  function base() {
    return {
      scenario: 'fresh',
      client: { id: 'client:this', name: "Jared's MacBook Pro", os: 'macOS', user: 'jared' },
      here: {
        id: 'server:this', name: 'This computer', freeGB: 212, git: true, jj: true, internet: true,
        projectsRoot: 'Documents › Puppet Master',
        sshKeys: [
          { id: 'k-ed', file: '~/.ssh/id_ed25519', comment: 'jared@MacBook-Pro', type: 'ed25519', where: 'agent' },
          { id: 'k-rsa', file: '~/.ssh/id_rsa', comment: 'old-laptop', type: 'rsa-2048', where: 'file', passphrase: true },
          { id: 'k-gh', file: '~/.ssh/github_ed25519', comment: 'github', type: 'ed25519', where: 'file', configHost: 'github.com' },
          { id: 'k-1p', file: null, comment: 'Personal SSH key', type: 'ed25519', where: '1password' }
        ],
        sshConfigHosts: [],
        knownHosts: {},
        projects: [],
        recentFolders: [
          { path: '~/Documents/recipe-app', name: 'recipe-app', history: 'git', online: { forge: 'github', repo: 'jared-p/recipe-app' } },
          { path: '~/Desktop/garden notes', name: 'garden notes', history: null, online: null },
          { path: '~/Code/budget-tracker', name: 'budget-tracker', history: 'jujutsu', online: null }
        ],
        providers: {}
      },
      devices: [
        { id: 'nas-home', name: 'Home NAS', brand: 'Synology', model: 'DS920+', address: '192.168.1.20', port: 22, ssh: true, smb: true, nfs: false, pm: false,
          hostKey: 'SHA256:q2K9fz1bL8mUe0cNfT4pAw7rXy6VdH3sJkL5gPo1Qz8', user: 'jared', password: 'correct horse', authorized: [], roots: ['/volume1'], readOnly: ['/volume1/media'], sshDisallowed: [] },
        { id: 'nas-media', name: 'Media server', brand: 'TrueNAS', model: 'SCALE', address: '192.168.1.31', port: 22, ssh: false, smb: true, nfs: true, pm: false,
          hostKey: 'SHA256:Vb7mQ0r4LcP2xYh8TzEs1Kd9WnJ3uAf6GiO5eRt2Nq0', user: 'jared', password: 'correct horse', authorized: [], roots: ['/mnt/tank'], readOnly: [], sshDisallowed: [] }
      ],
      shares: [
        { id: 'smb-home', device: 'nas-home', name: 'projects', path: '//Home NAS/projects', proto: 'smb' },
        { id: 'smb-media', device: 'nas-media', name: 'share', path: '//Media server/share', proto: 'smb' },
        { id: 'nfs-media', device: 'nas-media', name: '/mnt/tank/share', path: 'media.local:/mnt/tank/share', proto: 'nfs' }
      ],
      pmServers: [
        { id: 'pm:home', name: 'Home NAS', address: 'home-nas.local', route: 'local_or_vpn', seed: 'pm-home-7f3a', approver: "Jared's iPhone", code: 'A7K9-M2Q4',
          projects: [{ id: 'recipe-app', name: 'Recipe App', updated: 'today' }, { id: 'garden-planner', name: 'Garden Planner', updated: '3 days ago' }, { id: 'family-photos', name: 'Family Photos', updated: 'last week' }],
          accounts: [{ provider: 'claude', label: 'Claude · jared@example.com', ready: true }] },
        { id: 'pm:studio', name: 'Studio PC', address: 'studio.local', route: 'local_or_vpn', seed: 'pm-studio-19c2', approver: "Jared's MacBook Air", code: 'Q3P8-L6W2',
          projects: [{ id: 'podcast-site', name: 'Podcast Site', updated: 'yesterday' }], accounts: [] },
        /* a Puppet Master that was set up but has no Projects yet */
        { id: 'pm:garage', name: 'Garage Pi', address: 'garage-pi.local', route: 'local_or_vpn', seed: 'pm-garage-2b7c', approver: "Jared's iPhone", code: 'R5N2-C8VD',
          projects: [], accounts: [] }
      ],
      vpnServers: [
        { id: 'pm:office', name: 'Office Mac mini', address: '10.8.0.4', route: 'local_or_vpn', via: 'vpn', seed: 'pm-office-5d1e', approver: "Jared's iPhone", code: 'H4T2-X9PB',
          projects: [{ id: 'company-site', name: 'Company Site', updated: 'today' }], accounts: [] }
      ],
      unclaimed: { id: 'pm:new', name: 'truenas.local', address: 'truenas.local', seed: 'pm-new-44be', setupCode: '482 913' },
      /* a rented cloud computer never shows up on the home network: it is reached by the address its setup prints */
      unclaimedCloud: { id: 'pm:cloud', name: '203.0.113.24', address: '203.0.113.24', seed: 'pm-cloud-8e21', setupCode: '482 913' },
      /* folders that already live on the work computer when it is a Server (browsed through the paired Server) */
      serverFolders: [
        { path: '/mnt/tank/projects/recipe-app', name: 'recipe-app', history: 'git', online: { forge: 'github', repo: 'jared-p/recipe-app' } },
        { path: '/mnt/tank/projects/book club', name: 'book club', history: null, online: null }
      ],
      serverTree: { '/mnt/tank': ['projects', 'media', 'backups'], '/mnt/tank/projects': ['recipe-app', 'book club', 'garden-notes'], '/mnt/tank/media': [], '/mnt/tank/backups': [] },
      recoveryPhrase: 'river candle orbit maple quiet lantern',
      forges: {
        github: { accounts: [], orgs: ['book-club-crew'], repos: [{ name: 'recipe-app', owner: 'jared-p', private: true, updated: '2 days ago' }, { name: 'garden-planner', owner: 'jared-p', private: true, updated: 'last month' }, { name: 'dotfiles', owner: 'jared-p', private: false, updated: 'last year' }], taken: ['recipe-app'], signup: true },
        gitlab: { accounts: [], orgs: [], repos: [{ name: 'thesis', owner: 'jared', private: true, updated: '4 months ago' }], taken: [], signup: true },
        azure_devops: { accounts: [], orgs: ['platyr'], projects: ['Website', 'Operations'], repos: [{ name: 'intranet', owner: 'platyr / Website', private: true, updated: 'last week' }], taken: [], signup: true },
        bitbucket_cloud: { accounts: [], orgs: ['jared-workspace'], repos: [], taken: [], signup: true },
        bitbucket_data_center: { accounts: [], orgs: ['PROJ'], repos: [], taken: [], signup: false },
        forgejo: { accounts: [], orgs: [], repos: [{ name: 'home-lab', owner: 'jared', private: true, updated: 'yesterday' }], taken: [], signup: false },
        gitea: { accounts: [], orgs: [], repos: [], taken: [], signup: true },
        cursor_origin: { accounts: [], orgs: ['jared'], repos: [], taken: [], signup: true }
      },
      backups: [
        { id: 'bk-recipe', project: 'Recipe App', where: 'Home NAS', source: 'nas', snapshots: ['Yesterday · 9:14 PM', 'Sep 20 · 9:10 PM', 'Sep 13 · 9:02 PM'] },
        { id: 'bk-garden', project: 'Garden Planner', where: 'Google Drive', source: 'cloud', snapshots: ['Sep 22 · 7:40 AM', 'Sep 15 · 7:38 AM'] }
      ],
      fullBackups: [{ id: 'full-1', label: 'Everything from "Jared’s old laptop"', when: 'Sep 21 · 11:02 PM', projects: 3, accounts: 2, projectList: ['Tastebook', 'Harbor', 'Loom'] }],
      failures: {}, /* e.g. { online_copy: 'name_taken' | 'network' } — one-shot owner failures for the recovery scenarios */
      lowResource: false
    };
  }

  const SCENARIOS = {
    fresh: { label: 'Fresh computer', apply(e) { e.here.projects = []; } },
    returning: { label: 'Returning user', apply(e) {
      e.here.projects = [{ id: 'tastebook', name: 'Tastebook', updated: 'today', providers: ['claude'] }, { id: 'harbor', name: 'Harbor', updated: '2 days ago' }, { id: 'loom', name: 'Loom', updated: 'last week' }];
      e.here.providers.claude = { installed: true, version: '2.4.1', signedIn: true, account: 'jared@example.com', plan: 'Claude Max' };
      e.forges.github.accounts = [{ login: 'jared-p', name: 'Jared' }];
      e.here.sshConfigHosts = [{ alias: 'nas', host: '192.168.1.20', user: 'jared', key: 'k-ed' }];
      e.here.knownHosts = { '192.168.1.20': e.devices[0].hostKey };
    } },
    keyWorks: { label: 'A key already works with Home NAS', apply(e) { e.devices[0].authorized = ['k-ed']; e.here.knownHosts = { '192.168.1.20': e.devices[0].hostKey }; } },
    noKeys: { label: 'No SSH keys on this computer', apply(e) { e.here.sshKeys = []; } },
    hostChanged: { label: 'Home NAS ID changed', apply(e) { e.here.knownHosts = { '192.168.1.20': 'SHA256:OLDkeyZ9x8w7v6u5t4s3r2q1p0o9n8m7l6k5j4i3h2g' }; } },
    wrongPassword: { label: 'Wrong NAS password first', apply(e) { e.failures.nas_password_once = true; } },
    readOnly: { label: 'Read-only NAS folder', apply(e) { e.devices[0].readOnly = ['/volume1/projects']; } },
    nameTaken: { label: 'GitHub name taken at creation', apply(e) { e.failures.online_copy = 'name_taken'; } },
    flaky: { label: 'Flaky network', apply(e) { e.failures.online_copy = 'network'; } },
    cliMissing: { label: 'Claude not installed', apply(e) { delete e.here.providers.claude; } },
    signedOut: { label: 'Claude installed, signed out', apply(e) { e.here.providers.claude = { installed: true, version: '2.4.1', signedIn: false }; } },
    copiedUnavailable: { label: 'Copied account unavailable here', apply(e) {
      SCENARIOS.returning.apply(e); e.here.providers.claude = { installed: true, version: '2.4.1', signedIn: false }; e.here.projects[0].providers = ['claude']; } },
    remoteAi: { label: 'AI on a remote Server', apply(e) { e.pmServers[0].accounts = []; } },
    noAi: { label: 'No AI account anywhere', apply(e) { e.here.providers = {}; e.pmServers[0].accounts = []; } },
    lowResource: { label: 'Low-resource computer', apply(e) { e.lowResource = true; } },
    keyRefused: { label: 'Home NAS refuses the key once', apply(e) { e.devices[0].homePermsOpen = true; } },
    homeNasPm: { label: 'Home NAS already runs Puppet Master', apply(e) { e.devices[0].pm = true; } }
  };

  O55.fixtures = {
    PROVIDERS, FORGES, FREE_ROUTES, SCENARIOS, OFFICIAL, folders,
    make(scenario) {
      const e = base();
      const ids = String(scenario || 'fresh').split('+');
      ids.forEach((id) => { if (SCENARIOS[id]) SCENARIOS[id].apply(e); });
      e.scenario = ids.join('+');
      e.folders = folders();
      return e;
    },
    provider: (id) => PROVIDERS.find((p) => p.id === id),
    forge: (id) => FORGES.find((f) => f.id === id)
  };
})();
