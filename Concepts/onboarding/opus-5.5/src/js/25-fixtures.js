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

  /* ---------------------------------------------------------------- what each source service needs (flow audit FF-02..FF-12)
     One row per service, never a chain of special cases. A new online copy lives with an owner taken from the signed-in
     account ({ id, scope, kind, name } plus what the service says about it): `personal` says whether the person's own
     account can keep it, `owner` names that place in the service's own words, `project` is the place inside the owner a
     service also needs (Azure DevOps' team project, Bitbucket's project). visibility(owner, variant, project) is what the
     service allows there; an empty list means the copy follows its project's settings. name(n) returns null or the reason
     a name breaks the service's own rule; spaces says how the service spells a space (dash: it becomes '-'; keep: names
     may have spaces and the web address uses slug()). auth lists the sign-in methods per variant, the first the main one:
     browser (its own page), device (a code to type there), token (an access token the person makes on that server). An
     instance with no sign-in app registered for Puppet Master signs in with a token (FGI-011/FGI-012). */
  const gitBasic = (n, max, extra) => (!n ? 'empty' : n.length > max ? 'long' : !/^[A-Za-z0-9._-]+$/.test(n) ? 'chars' : n === '.' || n === '..' ? 'reserved' : extra ? extra(n) : null);
  const giteaName = (n) => gitBasic(n, 100, (x) => (x === '-' || /\.(git|wiki|rss|atom)$/i.test(x) ? 'reserved' : /\.\./.test(x) ? 'chars' : null));
  const AZURE_RESERVED = /^(aux|con|nul|prn|com([1-9]|10)|lpt[1-9]|server|signalr|defaultcollection|web)$/i;
  const OPENNESS = { private: 0, internal: 1, public: 2 };
  const slugOf = (n) => String(n || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  const FORGES = [
    { id: 'github', name: 'GitHub', variants: ['hosted', 'self_managed'], signup: 'https://github.com/signup', device: 'github.com/login/device', primary: true,
      personal: true, owner: 'organization',
      /* Internal: an organization in an enterprise (every organization on an Enterprise Server is in one), never a person's own */
      visibility: (o, variant) => (o.scope === 'organization' && (variant === 'self_managed' || o.enterprise) ? ['private', 'public', 'internal'] : ['private', 'public']),
      nameRule: (n) => gitBasic(n, 100), spaces: 'dash', auth: { hosted: ['browser', 'device'], self_managed: ['browser', 'token'] } },
    { id: 'gitlab', name: 'GitLab', variants: ['hosted', 'self_managed'], signup: 'https://gitlab.com/users/sign_up', device: 'gitlab.com/oauth/device',
      personal: true, owner: 'group',
      /* GitLab.com offers no Internal for new projects; a project is never more open than the group it is in */
      visibility: (o, variant) => (variant === 'self_managed' ? ['private', 'public', 'internal'] : ['private', 'public']).filter((v) => !o.visibility || OPENNESS[v] <= OPENNESS[o.visibility]),
      /* the project's path: letters, digits, _ - . ; starts and ends with a letter or digit; no two special characters together */
      nameRule: (n) => (!n ? 'empty' : n.length > 255 ? 'long' : !/^[A-Za-z0-9._-]+$/.test(n) ? 'chars' : !/^[A-Za-z0-9]/.test(n) || !/[A-Za-z0-9]$/.test(n) ? 'ends' : /[._-]{2}/.test(n) ? 'chars' : /\.(git|atom)$/i.test(n) ? 'reserved' : null),
      spaces: 'dash', auth: { hosted: ['browser', 'device'], self_managed: ['browser', 'token'] } },
    { id: 'azure_devops', name: 'Azure DevOps', variants: ['cloud', 'self_managed'], signup: 'https://azure.microsoft.com/products/devops', device: 'microsoft.com/devicelogin',
      personal: false, owner: { cloud: 'azOrg', self_managed: 'collection' }, project: 'teamProject',
      visibility: () => [],
      nameRule: (n) => (!n ? 'empty' : n.length > 64 ? 'long' : /[\\/:*?"<>|;#$*{},+=[\]&\x00-\x1f\x7f]/.test(n) ? 'chars' : /^[_.]/.test(n) || /\.$/.test(n) ? 'ends' : AZURE_RESERVED.test(n) ? 'reserved' : null),
      spaces: 'keep', auth: { cloud: ['browser', 'device'], self_managed: ['browser', 'token'] } },
    { id: 'bitbucket_cloud', name: 'Bitbucket', variants: ['cloud'], signup: 'https://bitbucket.org/account/signup',
      personal: false, owner: 'workspace', project: 'bbProject',
      /* a private project holds only private copies */
      visibility: (o, variant, p) => (p && p.private ? ['private'] : ['private', 'public']),
      /* its address (the slug) keeps ASCII letters, digits, _ - . and turns every other run of characters into one dash */
      nameRule: (n) => (!n ? 'empty' : !slugOf(n) ? 'chars' : slugOf(n).length > 62 ? 'long' : null),
      slug: (n) => slugOf(n), spaces: 'keep', auth: { cloud: ['browser'] } },
    { id: 'bitbucket_data_center', name: 'Bitbucket Data Center', variants: ['data_center'],
      personal: false, owner: 'dcProject',
      /* access follows the project's permissions; public access only where the server allows it */
      visibility: (o) => (o.publicAccess ? ['private', 'public'] : ['private']),
      nameRule: (n) => (!n ? 'empty' : n.length > 128 ? 'long' : !/^[A-Za-z0-9][A-Za-z0-9 ._-]*$/.test(n) ? 'chars' : null),
      slug: (n) => slugOf(n), spaces: 'keep', auth: { data_center: ['browser', 'token'] } },
    { id: 'forgejo', name: 'Forgejo', variants: ['forgejo_self_managed', 'forgejo_cloud'], token: true, signup: 'https://codeberg.org/user/sign_up',
      personal: true, owner: 'organization',
      /* a copy is private or public; an organization's own profile visibility can narrow who sees a public one */
      visibility: () => ['private', 'public'], nameRule: giteaName, spaces: 'dash',
      auth: { forgejo_cloud: ['browser', 'token'], forgejo_self_managed: ['token'] } },
    { id: 'gitea', name: 'Gitea', variants: ['gitea_self_managed', 'gitea_cloud'], token: true,
      personal: true, owner: 'organization',
      visibility: () => ['private', 'public'], nameRule: giteaName, spaces: 'dash',
      auth: { gitea_cloud: ['browser', 'token'], gitea_self_managed: ['token'] } },
    { id: 'cursor_origin', name: 'Cursor Origin', variants: ['preview'], preview: true, address: 'https://origin.cursor.com',
      personal: true, owner: 'team',
      /* a person's own copy is always private; a team's may be private or internal; never public in onboarding */
      visibility: (o) => (o.scope === 'organization' ? ['private', 'internal'] : ['private']),
      nameRule: (n) => gitBasic(n, 100), spaces: 'dash', auth: { preview: ['browser'] } }
  ];
  /* the address a hosted variant always has (a self-managed one is typed; Gitea Cloud's is the team's own) */
  const HOSTED_URL = { github: 'https://github.com', gitlab: 'https://gitlab.com', azure_devops: 'https://dev.azure.com', bitbucket_cloud: 'https://bitbucket.org', cursor_origin: 'https://origin.cursor.com', forgejo_cloud: 'https://codeberg.org' };
  const variantNeedsAddress = (forge, variant) => /self_managed|data_center|gitea_cloud/.test(variant || '') || forge === 'bitbucket_data_center';

  /* Official pages the onboarding opens in the browser. Only addresses the concept is sure of: a service missing here
     opens its page without the concept naming an address, and a self-managed service uses the address the person typed.
     A device code (Browser didn't open?) is offered only where the service has a device sign-in, on its hosted edition. */
  const OFFICIAL = {
    provider: { claude: 'https://claude.ai/login', codex: 'https://chatgpt.com/auth/login', antigravity: 'https://accounts.google.com', grok: 'https://accounts.x.ai', copilot: 'https://github.com/login', 'opencode-runtime': 'https://opencode.ai' },
    signup: { Claude: 'https://claude.ai/login', ChatGPT: 'https://chatgpt.com', Anthropic: 'https://console.anthropic.com', 'Google AI Studio': 'https://aistudio.google.com' },
    forge: { github: 'https://github.com/login', gitlab: 'https://gitlab.com/users/sign_in', azure_devops: 'https://dev.azure.com', bitbucket_cloud: 'https://bitbucket.org/account/signin/', cursor_origin: 'https://origin.cursor.com', forgejo: 'https://codeberg.org/user/login' },
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
      /* Each service's world for the signed-in account (login): the places a new copy can live (owners: an organization,
         group, workspace, collection or project, each with what the service says about it), the Projects already there
         (repos: each with its service id and the owner and project it lives in, so picking one carries all of it), and the
         names already used. A self-managed or other variant is a different server with its own world (instances), never
         the hosted one's. */
      forges: {
        github: { accounts: [], login: 'jared-p', owners: [{ id: 'book-club-crew', name: 'book-club-crew' }],
          repos: [{ id: 'R_kgDOH2a1', name: 'recipe-app', owner: 'jared-p', container: '', private: true, updated: '2 days ago' }, { id: 'R_kgDOH2a2', name: 'garden-planner', owner: 'jared-p', container: '', private: true, updated: 'last month' }, { id: 'R_kgDOH2a3', name: 'dotfiles', owner: 'jared-p', container: '', private: false, updated: 'last year' }], taken: ['recipe-app'], signup: true,
          instances: { self_managed: { login: 'jared', owners: [{ id: 'platform-team', name: 'platform-team' }], repos: [{ id: '1042', name: 'handbook', owner: 'platform-team', container: 'platform-team', scope: 'organization', private: true, updated: 'yesterday' }], taken: [] } } },
        gitlab: { accounts: [], login: 'jared', owners: [{ id: 'thesis-lab', name: 'thesis-lab', kind: 'group', visibility: 'private' }, { id: 'thesis-lab/papers', name: 'thesis-lab / papers', kind: 'subgroup', visibility: 'private' }],
          repos: [{ id: '48213377', name: 'thesis', owner: 'jared', container: '', private: true, updated: '4 months ago' }], taken: [], signup: true,
          instances: { self_managed: { login: 'jared', owners: [{ id: 'research', name: 'research', kind: 'group', visibility: 'internal' }], repos: [{ id: '311', name: 'lab-notes', owner: 'research', container: 'research', scope: 'organization', private: true, updated: 'last week' }], taken: [], signup: false } } },
        azure_devops: { accounts: [], login: 'jared@platyr.com', owners: [{ id: 'platyr', name: 'platyr' }], projects: [
          { id: 'd0b8b4c2-2e98-4ebf-86ca-28957a858cc1', name: 'Website', kind: 'Git', container: 'platyr' },
          { id: '79682e68-758b-4a53-9257-fd975aa7829f', name: 'Operations', kind: 'Git', container: 'platyr' }
        ], repos: [{ id: '6f2c1a9e-5b7d-4e8a-a3c2-1d9f0b4e7a21', name: 'intranet', owner: 'platyr / Website', container: 'platyr', scope: 'organization', project: 'd0b8b4c2-2e98-4ebf-86ca-28957a858cc1', projectName: 'Website', private: true, updated: 'last week' }], taken: [], signup: true,
          /* an Azure DevOps Server keeps its team projects in collections */
          instances: { self_managed: { login: 'PLATYR\\jared', owners: [{ id: 'DefaultCollection', name: 'DefaultCollection' }], projects: [
            { id: '5c3e8a6e-1f7b-4d2a-9c41-7a2b9e0d3f15', name: 'Intranet', kind: 'Git', container: 'DefaultCollection' }
          ], repos: [{ id: '0b7e4d2c-8a1f-4c6e-b9d3-2f5a7c1e8d40', name: 'runbooks', owner: 'DefaultCollection / Intranet', container: 'DefaultCollection', scope: 'organization', project: '5c3e8a6e-1f7b-4d2a-9c41-7a2b9e0d3f15', projectName: 'Intranet', private: true, updated: 'last week' }], taken: [], signup: false } } },
        /* a Bitbucket Cloud copy lives in a workspace and in one of its projects */
        bitbucket_cloud: { accounts: [], login: 'jared-p', owners: [{ id: 'jared-workspace', name: 'jared-workspace', projects: [{ key: 'WEB', name: 'Website', private: false }, { key: 'PRIV', name: 'Private work', private: true }] }],
          repos: [{ id: '{4a1c9e2b-7d3f-4b8a-9e1c-5f2d7a3b8c60}', name: 'garden-site', owner: 'jared-workspace / Website', container: 'jared-workspace', scope: 'organization', project: 'WEB', projectName: 'Website', private: true, updated: '3 weeks ago' }], taken: [], signup: true },
        /* a Data Center copy lives in a project (by its key), or in the person's own personal project (~USER) */
        bitbucket_data_center: { accounts: [], login: 'jared', owners: [{ id: 'PROJ', name: 'Projects (PROJ)', publicAccess: true }, { id: '~JARED', name: 'Your personal projects (~JARED)', scope: 'personal', publicAccess: true }],
          repos: [{ id: '87', name: 'build-tools', owner: 'PROJ', container: 'PROJ', scope: 'organization', private: true, updated: 'last month' }], taken: [], signup: false },
        /* hosted Forgejo is Codeberg; another Forgejo server is its own world */
        forgejo: { accounts: [], login: 'jared', owners: [], repos: [{ id: '20914', name: 'home-lab', owner: 'jared', container: '', private: true, updated: 'yesterday' }], taken: [], signup: true,
          instances: { forgejo_self_managed: { login: 'jared', owners: [{ id: 'home-lab-crew', name: 'home-lab-crew', profile: 'limited' }], repos: [{ id: '12', name: 'nas-scripts', owner: 'home-lab-crew', container: 'home-lab-crew', scope: 'organization', private: true, updated: '2 days ago' }], taken: [], signup: false } } },
        gitea: { accounts: [], login: 'jared', owners: [{ id: 'platyr', name: 'platyr' }], repos: [{ id: '5', name: 'notes', owner: 'jared', container: '', private: true, updated: 'last week' }], taken: [], signup: false,
          instances: { gitea_self_managed: { login: 'jared', owners: [], repos: [{ id: '3', name: 'home-wiki', owner: 'jared', container: '', private: true, updated: 'last month' }], taken: [], signup: true } } },
        /* a person's own Origin copies, and the team they belong to */
        cursor_origin: { accounts: [], login: 'jared', owners: [{ id: 'platyr', name: 'Platyr' }], repos: [{ id: 'orp_7Hq2', name: 'scratchpad', owner: 'jared', container: '', private: true, updated: 'yesterday' }], taken: [], signup: true }
      },
      /* each backup is kept in one exact place (a folder, a device, a cloud service, a bucket): a restore lists only the
         ones at the place pointed to (FF-15) */
      backups: [
        { id: 'bk-recipe', project: 'Recipe App', where: 'Home NAS', source: 'nas', device: 'nas-home', snapshots: ['Yesterday · 9:14 PM', 'Sep 20 · 9:10 PM', 'Sep 13 · 9:02 PM'] },
        { id: 'bk-garden', project: 'Garden Planner', where: 'Google Drive', source: 'cloud', cloud: 'gdrive', snapshots: ['Sep 22 · 7:40 AM', 'Sep 15 · 7:38 AM'] },
        { id: 'bk-loom', project: 'Loom', where: 'Backup Drive', source: 'folder', folder: '/Volumes/Backup Drive/Puppet Master', snapshots: ['Sep 18 · 6:00 PM', 'Sep 11 · 6:00 PM'] },
        { id: 'bk-harbor', project: 'Harbor', where: 'Backblaze B2 · jared-pm-backups', source: 'cloud', cloud: 's3', family: 'backblaze_b2', bucket: 'jared-pm-backups', snapshots: ['Sep 19 · 1:00 AM'] }
      ],
      /* the old laptop backed itself up to the drive, the Home NAS and Google Drive */
      fullBackups: [
        { id: 'full-1', label: 'Everything from "Jared’s old laptop"', when: 'Sep 21 · 11:02 PM', projects: 3, accounts: 2, projectList: ['Tastebook', 'Harbor', 'Loom'], source: 'folder', folder: '/Volumes/Backup Drive/Puppet Master' },
        { id: 'full-nas', label: 'Everything from "Jared’s old laptop"', when: 'Sep 21 · 11:40 PM', projects: 3, accounts: 2, projectList: ['Tastebook', 'Harbor', 'Loom'], source: 'nas', device: 'nas-home' },
        { id: 'full-gdrive', label: 'Everything from "Jared’s old laptop"', when: 'Sep 20 · 10:15 PM', projects: 3, accounts: 2, projectList: ['Tastebook', 'Harbor', 'Loom'], source: 'cloud', cloud: 'gdrive' }
      ],
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
    githubSigninOnce: { label: 'GitHub sign-in fails once', apply(e) { e.failures.signin_once = Object.assign({}, e.failures.signin_once, { github: true }); } },
    /* the three failures a first-time person can meet that had no way to happen here (the lead, 2026-10-30) */
    smbWrong: { label: 'Shared folder refuses the first password', apply(e) { e.failures.smb_password_once = true; } },
    restoreFails: { label: 'A restore stops part-way once', apply(e) { e.failures.restore_once = true; } },
    /* (the Server lane's pairing outcomes, SCR-15: failures.pair_once fires once at the approval step) */
    pairExpires: { label: 'A pairing request expires', apply(e) { e.failures.pair_once = 'expired'; } }
  };

  /* values the demo hints offer that take a failure branch (62-flow.js O55.flow.hint); nothing real checks them */
  const DEMO = { wrongPassword: 'not-the-password', wrongPhrase: 'river candle orbit maple quiet lamp' };
  O55.fixtures = {
    PROVIDERS, FORGES, FREE_ROUTES, SCENARIOS, OFFICIAL, folders, DEMO,
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
    /* the account's world on the chosen server: a variant's own (another server), or the hosted service's */
    forgeWorld(env, forge, variant) {
      const w = env && env.forges && env.forges[forge], none = { accounts: [], owners: [], repos: [], taken: [], projects: [] };
      if (!w) return none;
      const own = (w.instances || {})[variant];
      return own ? Object.assign({}, none, { signup: w.signup }, own) : Object.assign({}, none, w);
    },
    /* the address a hosted variant always has; '' where it is typed (a self-managed server, or a team's Gitea Cloud) */
    hostedUrl: (forge, variant) => (variantNeedsAddress(forge, variant) ? '' : HOSTED_URL[variant] || HOSTED_URL[forge] || ''),
    needsAddress: variantNeedsAddress,
    /* a one-shot sign-in failure, used up by the try it fails (signin_once) */
    signinFails(e, id) { const f = e && e.failures && e.failures.signin_once; if (!f || !f[id]) return false; f[id] = false; return true; }
  };

  /* ---------------------------------------------------------------- a plan's online copy against its service's row
     O55.forgeRules reads the draft's owner, project, visibility, name and branch against the row above and the account's
     world; needs() lists what a plan still lacks for its service (Review cannot be confirmed until it is empty, and every
     entry names the screen that fixes it: never a requirement no earlier screen can satisfy, flow audit FF-01). */
  const variantOf = (d) => d.forge_provider_variant || ((FORGES.find((f) => f.id === d.forge) || {}).variants || [])[0];
  const worldOf = (env, d) => O55.fixtures.forgeWorld(env, d.forge, variantOf(d));
  function ownerOf(env, d) {
    const w = worldOf(env, d), id = d.repository_container || '';
    const found = id ? w.owners.find((o) => o.id === id) : null;
    if (found) return Object.assign({ scope: 'organization' }, found);
    if (!id && d.repository_owner_scope !== 'organization') return { id: '', scope: 'personal', name: w.login || '' };
    /* an owner the account's world does not list: kept as typed, with no capability of its own */
    return id ? { id, scope: d.repository_owner_scope || 'organization', name: id, unlisted: true } : null;
  }
  function projectOf(env, d) {
    const row = FORGES.find((f) => f.id === d.forge) || {}, o = ownerOf(env, d);
    if (row.project === 'bbProject') return o && (o.projects || []).find((p) => p.key === d.repository_project) || null;
    if (row.project === 'teamProject') return worldOf(env, d).projects.find((p) => p.id === d.repository_project && p.container === d.repository_container) || null;
    return null;
  }
  /* what git check-ref-format --branch refuses */
  function branchProblem(b) {
    if (!b) return 'empty';
    if (b === 'HEAD' || b.startsWith('-') || b.startsWith('/') || b.endsWith('/') || b.endsWith('.')) return 'bad';
    if (/[\x00-\x20\x7f~^:?*[\\]/.test(b) || b.includes('..') || b.includes('@{') || b.includes('//')) return 'bad';
    if (b.split('/').some((c) => c.startsWith('.') || /\.lock$/.test(c))) return 'bad';
    return null;
  }
  O55.forgeRules = {
    row: (forge) => FORGES.find((f) => f.id === forge) || null,
    world: worldOf, ownerOf, projectOf, branchProblem,
    ownerNoun(d) { const r = FORGES.find((f) => f.id === d.forge) || {}; return typeof r.owner === 'object' ? r.owner[variantOf(d)] : r.owner; },
    visibility(env, d) {
      const r = FORGES.find((f) => f.id === d.forge); if (!r) return ['private'];
      const o = ownerOf(env, d) || { scope: 'personal' };
      return r.visibility(o, variantOf(d), projectOf(env, d));
    },
    nameProblem(d) { const r = FORGES.find((f) => f.id === d.forge); return r ? r.nameRule(String(d.repository_name || '')) : null; },
    /* how the service spells what was typed: spaces become dashes where its names cannot hold them */
    spell(forge, typed) { const r = FORGES.find((f) => f.id === forge) || {}, t = String(typed || '').trim(); return r.spaces === 'keep' ? t.replace(/\s+/g, ' ') : t.replace(/\s+/g, '-'); },
    slug(d) { const r = FORGES.find((f) => f.id === d.forge) || {}; return r.slug ? r.slug(d.repository_name) : d.repository_name; },
    auth(forge, variant) { const r = FORGES.find((f) => f.id === forge) || {}; return (r.auth || {})[variant] || ['browser']; },
    /* What the plan's online copy still lacks, each with the screen that fixes it. A new copy needs its owner (and a
       project where the service has them), a visibility valid there, a name and branch the service accepts and the
       server's address; one brought in needs the owner and project its pick carried (FF-01: Azure's team project). */
    needs(env, d) {
      const r = FORGES.find((f) => f.id === d.forge), out = [];
      if (!r || d.online_mode === 'none') return out;
      const fresh = d.online_mode === 'new', at = fresh ? 'online-details' : 'ex-repos';
      if (variantNeedsAddress(d.forge, variantOf(d)) && !/^https:\/\/[^\s/?#]+/.test(d.forge_instance_url || '')) out.push({ field: 'forge_instance_url', key: 'missing.instance', screen: 'online-service' });
      if (!fresh && !d.repository_ref) return out;
      const o = ownerOf(env, d);
      if (!r.personal && !(o && o.id)) out.push({ field: 'repository_container', key: 'missing.' + this.ownerNoun(d), screen: at });
      if (r.project && !d.repository_project) out.push({ field: 'repository_project', key: 'missing.' + r.project, screen: at });
      if (!fresh) return out;
      if (r.project && d.repository_project && !projectOf(env, d) && env) out.push({ field: 'repository_project', key: 'missing.' + r.project, screen: at });
      const vis = this.visibility(env, d);
      if (vis.length && !vis.includes(d.repository_visibility)) out.push({ field: 'repository_visibility', key: 'missing.visibility', screen: at });
      if (this.nameProblem(d)) out.push({ field: 'repository_name', key: 'missing.repoName', screen: at });
      if (branchProblem(d.repository_default_branch)) out.push({ field: 'repository_default_branch', key: 'missing.branch', screen: at });
      return out;
    }
  };
})();
