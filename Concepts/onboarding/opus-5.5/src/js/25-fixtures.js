/* O55.fixtures — the deterministic world the concept runs against: this computer, the network, Puppet Masters,
   source services, backups, AI accounts and Free Models routes. Scenario presets (Concept demo pill) reshape it so
   every packet scenario is reachable by ordinary UI choices. Fixture results use the owners' shapes; nothing here
   claims a real network, provider or filesystem effect. */
(function () {
  'use strict';
  const O55 = window.O55;

  /* One row per concrete route a person can connect (Multi-Account §4.1), keyed by its own stable id, with the id the
     app's Settings uses for the same route (settings). Three facts stay apart (provider-login audit P05): how it
     signs in (auth: signin | key | server), what pays for its use (bill: plan, a plan with included usage | use, billed
     by what you use | own, your own setup) and whether a vendor program must be installed first (cli).
     - alt: a second way in for the same provider, its own account family (Codex's OpenAI API key, MA §9.3.1; Cursor's
       browser sign-in through its CLI). Settings offers the same pair.
     - keyFrom: where the right key is made: an exact console, or the vendor's own guide where the concept is not sure of
       the console address (P10). guide: true opens it as a guide.
     - regions: a plan sold per region with different keys and addresses (MA-062; Global and China are separate routes).
     - context: what the account still needs after sign-in before it is Ready (MA §9.3: Logged in is not Ready):
       billing (Copilot: whose Copilot plan), workspace (an Anthropic key that works in more than one), project (Vertex).
     - remote: how a sign-in comes back when the browser is on another device than the AI (MACS §4): device (a code the
       person types on the vendor's page), paste (the vendor's page shows a code the person pastes here), or none known.
     - custody: cli (the vendor program keeps its own sign-in on the AI computer, MA-070), store (Puppet Master keeps
       it in that computer's keychain), server (OpenCode keeps its model accounts itself).
     - gate: admission not established (P14): the row says what is known and offers no setup.
     - who / plan: what this fixture's sign-in reports back (the account and, where the vendor reports it, its plan).
     - aka: former or familiar names, matched by search (P15). */
  const PROVIDERS = [
    { id: 'claude', settings: 'claude-code', name: 'Claude', product: 'Claude plan', bill: 'plan', auth: 'signin', cli: 'claude', vendor: 'Anthropic', likely: 1, pair: 'anthropic-api',
      remote: 'paste', custody: 'cli', who: ['jared@example.com', 'jared@studio.example'], plan: 'Claude Pro' },
    { id: 'codex', settings: 'openai-codex', name: 'ChatGPT / Codex', product: 'ChatGPT plan', bill: 'plan', auth: 'signin', family: 'chatgpt', cli: null, vendor: 'OpenAI', likely: 2,
      remote: 'device', custody: 'store', who: ['jared@example.com', 'jared@studio.example'], plan: 'ChatGPT Plus',
      alt: { auth: 'key', bill: 'use', family: 'api_key', product: 'OpenAI API' }, keyFrom: { name: 'the OpenAI API dashboard', url: 'https://platform.openai.com/api-keys' } },
    { id: 'antigravity', settings: 'antigravity', name: 'Google Antigravity', product: 'Antigravity plan', bill: 'plan', auth: 'signin', cli: 'agy', vendor: 'Google', likely: 3, pair: 'gemini-api',
      remote: 'paste', custody: 'cli', who: ['jared@gmail.com', 'jared@studio.example'] },
    { id: 'cursor', settings: 'cursor-cli', name: 'Cursor', product: 'Cursor plan', bill: 'plan', auth: 'key', cli: null, vendor: 'Cursor', likely: 4, custody: 'store',
      keyFrom: { name: 'your Cursor dashboard', url: 'https://cursor.com/dashboard/api' },
      alt: { auth: 'signin', cli: 'cursor-agent', bill: 'plan', product: 'Cursor plan', custody: 'cli' }, who: ['jared@example.com', 'jared@studio.example'] },
    { id: 'grok', settings: 'grok', name: 'Grok Build', product: 'Grok Build plan', bill: 'plan', auth: 'signin', cli: 'grok', vendor: 'xAI', pair: 'xai-api',
      remote: 'device', custody: 'cli', who: ['jared@example.com', 'jared@studio.example'] },
    { id: 'muse', settings: 'muse', name: 'Muse Code', product: 'Muse Code plan', bill: 'plan', auth: 'signin', cli: 'muse', vendor: 'Meta', pair: 'meta-api',
      custody: 'cli', who: ['jared@example.com', 'jared@studio.example'] },
    { id: 'copilot', settings: 'github-copilot', name: 'GitHub Copilot', product: 'Copilot plan', bill: 'plan', auth: 'signin', cli: null, vendor: 'GitHub',
      remote: 'device', custody: 'store', context: 'billing', who: ['jared-p', 'jared-studio'] },
    { id: 'qwen-coding', settings: 'qwen-coding', name: 'Alibaba Coding Plan', aka: 'Qwen Coding Plan', product: 'Alibaba Coding Plan', bill: 'plan', auth: 'key', cli: null, vendor: 'Alibaba',
      custody: 'store', regions: ['global', 'china'], keyFrom: { name: "Alibaba Cloud's Coding Plan guide", url: 'https://www.alibabacloud.com/help/en/model-studio/coding-plan', guide: true } },
    { id: 'qwen-token', settings: 'qwen-token', name: 'Alibaba Token Plan', aka: 'Qwen Token Plan', product: 'Alibaba Token Plan', bill: 'plan', auth: 'key', cli: null, vendor: 'Alibaba',
      custody: 'store', keyFrom: { name: "Alibaba Cloud's Token Plan guide", url: 'https://www.alibabacloud.com/help/en/model-studio/token-plan-overview', guide: true } },
    { id: 'zai', settings: 'zai-coding', name: 'Z.AI Coding Plan', aka: 'GLM Coding Plan Zhipu', product: 'Z.AI Coding Plan', bill: 'plan', auth: 'key', cli: null, vendor: 'Z.AI',
      custody: 'store', gate: 'unverified', gateUrl: 'https://docs.z.ai/devpack/tool/others' },
    { id: 'kimi', settings: 'kimi-coding', name: 'Kimi Code', product: 'Kimi Code plan', bill: 'plan', auth: 'key', cli: null, vendor: 'Moonshot',
      custody: 'store', keyFrom: { name: 'the Kimi Code console', url: 'https://www.kimi.com/code/console' } },
    { id: 'minimax', settings: 'minimax-coding', name: 'MiniMax M Plan', aka: 'MiniMax Coding Plan', product: 'MiniMax M Plan', bill: 'plan', auth: 'key', cli: null, vendor: 'MiniMax', canon: true,
      custody: 'store', regions: ['global', 'china'], keyFrom: { name: "MiniMax's M Plan guide", url: 'https://platform.minimax.io/docs/m-plan/intro', guide: true } },
    { id: 'opencode-go', settings: 'opencode-go', name: 'OpenCode Go', product: 'OpenCode Go plan', bill: 'plan', auth: 'key', cli: null, vendor: 'OpenCode',
      custody: 'store', keyFrom: { name: 'the OpenCode Console', url: 'https://opencode.ai/console/' } },
    { id: 'opencode-zen', settings: 'opencode-zen', name: 'OpenCode Console', aka: 'OpenCode Zen', product: 'OpenCode Console', bill: 'use', auth: 'key', cli: null, vendor: 'OpenCode',
      custody: 'store', keyFrom: { name: 'the OpenCode Console', url: 'https://opencode.ai/console/' } },
    /* OpenCode itself is a server profile, never a website sign-in (Provider_OpenCode §5): Puppet Master runs one
       (Managed Server: installs OpenCode on the AI computer with consent, starts it, checks it) or attaches to one the
       person already runs (its address and, if it asks for one, its own username and password). Its model accounts
       stay in OpenCode. */
    { id: 'opencode-runtime', settings: 'opencode', name: 'OpenCode server', product: 'OpenCode server', bill: 'own', auth: 'server', cli: 'opencode', vendor: 'OpenCode', custody: 'server' },
    { id: 'anthropic-api', settings: 'anthropic-api', name: 'Anthropic API', product: 'Anthropic API', bill: 'use', auth: 'key', cli: null, pair: 'claude', vendor: 'Anthropic',
      custody: 'store', context: 'workspace', workspaces: ['Default workspace', 'Side projects'], keyFrom: { name: 'the Claude Console', url: 'https://platform.claude.com/settings/keys' } },
    { id: 'gemini-api', settings: 'gemini-direct', name: 'Gemini API', product: 'Gemini API', bill: 'use', auth: 'key', cli: null, pair: 'antigravity', vendor: 'Google',
      custody: 'store', keyFrom: { name: 'Google AI Studio', url: 'https://aistudio.google.com/api-keys' } },
    { id: 'vertex', settings: 'vertex', name: 'Vertex AI', product: 'Google Cloud', bill: 'use', auth: 'key', cli: null, vendor: 'Google',
      custody: 'store', context: 'project', keyFrom: { name: "Google Cloud's API key guide", url: 'https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/api-keys', guide: true } },
    { id: 'xai-api', settings: 'xai-api', name: 'xAI API', product: 'xAI API', bill: 'use', auth: 'key', cli: null, pair: 'grok', vendor: 'xAI',
      custody: 'store', keyFrom: { name: 'the xAI Console', url: 'https://console.x.ai' } },
    { id: 'meta-api', settings: 'meta-api', name: 'Meta Model API', product: 'Meta Model API', bill: 'use', auth: 'key', cli: null, pair: 'muse', vendor: 'Meta',
      custody: 'store', keyFrom: { name: "Meta's developer site", url: 'https://dev.meta.ai/' } }
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
    provider: { claude: 'https://claude.ai/login', codex: 'https://chatgpt.com/auth/login', antigravity: 'https://accounts.google.com', grok: 'https://accounts.x.ai', copilot: 'https://github.com/login' },
    /* a device sign-in's page, where the concept knows it (the code itself comes from the vendor) */
    device: { copilot: 'github.com/login/device' },
    signup: { Claude: 'https://claude.ai/login', ChatGPT: 'https://chatgpt.com', Anthropic: 'https://console.anthropic.com', 'Google AI Studio': 'https://aistudio.google.com' },
    forge: { github: 'https://github.com/login', gitlab: 'https://gitlab.com/users/sign_in', azure_devops: 'https://dev.azure.com', bitbucket_cloud: 'https://bitbucket.org/account/signin/', cursor_origin: 'https://origin.cursor.com' },
    forgePath: { github: '/login', gitlab: '/users/sign_in', bitbucket_data_center: '/login', forgejo: '/user/login', gitea: '/user/login', azure_devops: '' },
    free: { 'free-openrouter': 'https://openrouter.ai' },
    backup: { gdrive: 'https://accounts.google.com', onedrive: 'https://login.live.com' }
  };

  /* Free Models routes (Models System MS-118; mirrors the app's Settings freeRoutes; Free Models owns no credential
     store, MA-064). Each route is set up through its own provider's account, shown on the row before and after.
     tier says what a new account actually gets today (official pages read 2026-10-31; provider-login audit P02, P03):
     free (free with limits), trial (needs a payment method and ends), paid (needs bought credit or a paid plan).
     FREE_TIERS decides where each tier is offered: 'list' on the screen, 'more' behind its own disclosure, 'hide' not
     at all (Jared's D5 may move trial and paid to 'hide'). retired: closed by its vendor; never offered, and a choice
     saved before it closed shows as No longer available (MS-118). */
  const FREE_ROUTES = [
    { id: 'free-openrouter', name: 'OpenRouter free models', provider: 'OpenRouter', tier: 'free', needs: 'signin', who: 'jared@example.com' },
    { id: 'free-groq', name: 'Groq free plan', provider: 'Groq', tier: 'free', needs: 'key', keyFrom: { name: "Groq's console", url: 'https://console.groq.com/keys' },
      /* the key works, and this account is at its limit when it is first checked: Retry now, never a reconnect */
      limitedOnce: true },
    { id: 'free-cerebras', name: 'Cerebras trial', provider: 'Cerebras', tier: 'trial', needs: 'key', keyFrom: { name: "Cerebras's console", url: 'https://cloud.cerebras.ai' } },
    { id: 'free-hf', name: 'Hugging Face Inference', provider: 'Hugging Face', tier: 'paid', needs: 'key', keyFrom: { name: 'your Hugging Face token settings', url: 'https://huggingface.co/settings/tokens' } },
    { id: 'free-github-models', name: 'GitHub Models', provider: 'GitHub', retired: true }
  ];
  const FREE_TIERS = { free: 'list', trial: 'more', paid: 'more' };

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
        id: 'server:this', name: 'This computer', freeGB: 212, git: true, jj: true, internet: true, vpn: true, /* already on a VPN (the office one) */
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
        /* what a restore can point to here (QA round 2, Q6): Recovery Kit files where people keep them (each knows where
           its backup is and holds the key that unlocks it, never a NAS or cloud sign-in), and backup folders on this
           computer or a drive plugged into it */
        recoveryKits: [
          { id: 'kit-laptop', file: 'Recovery Kit – Jared’s old laptop.pdf', folder: 'Downloads', scope: 'full', source: 'folder', where: 'Backup Drive', folderPath: '/Volumes/Backup Drive/Puppet Master' },
          { id: 'kit-loom', file: 'Recovery Kit – Loom.pdf', folder: 'Documents', scope: 'project', source: 'folder', where: 'Backup Drive', folderPath: '/Volumes/Backup Drive/Puppet Master' }
        ],
        backupFolders: [
          { path: '/Volumes/Backup Drive/Puppet Master', name: 'Backup Drive', drive: true },
          { path: '~/Backups/Puppet Master', name: 'Backups', drive: false }
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
        { id: 'pm:home', name: 'Home NAS', device: 'nas-home', address: 'home-nas.local', route: 'local_or_vpn', seed: 'pm-home-7f3a', approver: "Jared's iPhone", code: 'A7K9-M2Q4',
          projects: [{ id: 'recipe-app', name: 'Recipe App', updated: 'today' }, { id: 'garden-planner', name: 'Garden Planner', updated: '3 days ago' }, { id: 'family-photos', name: 'Family Photos', updated: 'last week' }],
          accounts: [{ provider: 'claude', label: 'Claude · jared@example.com', who: 'jared@example.com', plan: 'Claude Pro', ready: true }] },
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
        azure_devops: { accounts: [], orgs: ['platyr'], projects: [
          { id: 'd0b8b4c2-2e98-4ebf-86ca-28957a858cc1', name: 'Website', kind: 'Git', container: 'platyr' },
          { id: '79682e68-758b-4a53-9257-fd975aa7829f', name: 'Operations', kind: 'Git', container: 'platyr' }
        ], repos: [{ name: 'intranet', owner: 'platyr / Website', private: true, updated: 'last week' }], taken: [], signup: true },
        bitbucket_cloud: { accounts: [], orgs: ['jared-workspace'], repos: [], taken: [], signup: true },
        bitbucket_data_center: { accounts: [], orgs: ['PROJ'], repos: [], taken: [], signup: false },
        forgejo: { accounts: [], orgs: [], repos: [{ name: 'home-lab', owner: 'jared', private: true, updated: 'yesterday' }], taken: [], signup: false },
        gitea: { accounts: [], orgs: [], repos: [], taken: [], signup: true },
        cursor_origin: { accounts: [], orgs: ['jared'], repos: [], taken: [], signup: true }
      },
      backups: [
        { id: 'bk-recipe', project: 'Recipe App', where: 'Home NAS', source: 'nas', snapshots: ['Yesterday · 9:14 PM', 'Sep 20 · 9:10 PM', 'Sep 13 · 9:02 PM'] },
        { id: 'bk-garden', project: 'Garden Planner', where: 'Google Drive', source: 'cloud', snapshots: ['Sep 22 · 7:40 AM', 'Sep 15 · 7:38 AM'] },
        { id: 'bk-loom', project: 'Loom', where: 'Backup Drive', source: 'folder', snapshots: ['Sep 18 · 6:00 PM', 'Sep 11 · 6:00 PM'] }
      ],
      fullBackups: [{ id: 'full-1', label: 'Everything from "Jared’s old laptop"', when: 'Sep 21 · 11:02 PM', projects: 3, accounts: 2, projectList: ['Tastebook', 'Harbor', 'Loom'] }],
      failures: {}, /* e.g. { online_copy: 'name_taken' | 'network' } — one-shot owner failures for the recovery scenarios;
                       signin_once: { <provider or service id>: true } — that browser sign-in does not finish the first time */
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
    selfKeyMissing: { label: 'Key added by hand is not there yet', apply(e) { e.failures.self_key_missing_once = true; } },
    homeNasPm: { label: 'Home NAS already runs Puppet Master', apply(e) { e.devices[0].pm = true; } },
    /* a browser sign-in closed before it finished: the row says so and offers it again (ai.signinFail,
       online.signin.fail); the second try works */
    antigravityOnce: { label: 'Antigravity sign-in fails once', apply(e) { e.failures.signin_once = Object.assign({}, e.failures.signin_once, { antigravity: true }); } },
    githubSigninOnce: { label: 'GitHub sign-in fails once', apply(e) { e.failures.signin_once = Object.assign({}, e.failures.signin_once, { github: true }); } }
  };

  O55.fixtures = {
    PROVIDERS, FORGES, FREE_ROUTES, FREE_TIERS, SCENARIOS, OFFICIAL, folders,
    make(scenario) {
      const e = base();
      const ids = String(scenario || 'fresh').split('+');
      ids.forEach((id) => { if (SCENARIOS[id]) SCENARIOS[id].apply(e); });
      e.scenario = ids.join('+');
      e.folders = folders();
      return e;
    },
    provider: (id) => PROVIDERS.find((p) => p.id === id),
    forge: (id) => FORGES.find((f) => f.id === id),
    /* a one-shot sign-in failure, used up by the try it fails (signin_once) */
    signinFails(e, id) { const f = e && e.failures && e.failures.signin_once; if (!f || !f[id]) return false; f[id] = false; return true; }
  };
})();
