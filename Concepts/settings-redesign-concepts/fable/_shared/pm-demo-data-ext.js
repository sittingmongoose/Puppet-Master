// fable Settings Bakeoff - final cumulative packet (2026-08-08) data extension.
// Loads immediately AFTER pm-demo-data.js and BEFORE any concept script, so the
// PMState pristine snapshot (taken lazily at first PMState.init) already sees
// the extended dataset. Inert data only: no DOM access, JSON-serializable.
// Everything added here carries src:"packet-2026-08-08" where a row-level
// provenance field exists. Demo "now" stays anchored to 2026-08-05 to match
// the base dataset; nothing here claims a date after that day.
(function () {
  'use strict';

  var D = window.PM_DATA;
  if (!D || typeof D !== 'object') {
    // Load-order guard: concepts must not boot from a half-built dataset.
    throw new Error('pm-demo-data-ext.js requires pm-demo-data.js to load first.');
  }

  /* =====================================================================
     1. PROVIDER UPGRADES — installations, update lifecycle, auth boundary,
        setup offers, OpenCode server, free-route states, usage-unavailable.
     ===================================================================== */

  var AUTH_BOUNDARY = {
    'claude': {
      kind: 'cli-owned',
      note: 'Sign-in is owned by the Claude CLI. Puppet Master isolates profiles and launches the native flow; it never presents its own OAuth screen and never handles the token.'
    },
    'antigravity': {
      kind: 'cli-owned',
      note: 'Sign-in is owned by the Antigravity CLI. Puppet Master can open the native flow inside an isolated profile; it does not run PM-direct OAuth for this route.'
    },
    'openai-codex': {
      kind: 'pm-direct-oauth',
      note: 'OpenAI supports Puppet Master\u2019s own OAuth flow. Tokens are stored as vault references, never shown in the interface.'
    },
    'copilot': {
      kind: 'pm-direct-oauth',
      note: 'GitHub and GitHub Copilot support PM-direct OAuth with device-code fallback. The subscription seat is separate from any API connection.'
    },
    'openrouter': {
      kind: 'api-key',
      note: 'Connects with an API key stored in the system keychain. The key is a vault reference; reveal and copy are never offered in normal UI.'
    },
    'local-ollama': {
      kind: 'server',
      note: 'A local server connection. There is no account to authenticate; reachability is the only credential.'
    },
    'free-community': {
      kind: 'wrapper',
      note: 'Free Models is a wrapper over underlying routes. It never owns credentials, quota, switching, or usage.'
    },
    'cursor-cli': {
      kind: 'cli-owned',
      note: 'When installed, sign-in belongs to the Cursor CLI. Install and sign-in remain separate steps.'
    },
    'opencode': {
      kind: 'server',
      note: 'An external OpenCode server owns its own provider credentials. Puppet Master stores only a scoped access token reference for the server itself.'
    }
  };

  var INSTALLATIONS = {
    'claude': [
      {
        id: 'inst.claude.npm',
        hostId: 'host.win-desktop',
        envId: 'env.win.native',
        label: 'Claude CLI (npm, this computer)',
        configuredCommand: 'claude',
        resolvedLauncher: 'C:\\Users\\Jared\\AppData\\Roaming\\npm\\claude.cmd',
        actualExecutable: 'C:\\Users\\Jared\\AppData\\Roaming\\npm\\node_modules\\@anthropic-ai\\claude-code\\cli.js',
        method: 'npm-global',
        packageIdentity: '@anthropic-ai/claude-code',
        managerRoot: 'C:\\Users\\Jared\\AppData\\Roaming\\npm',
        version: '2.4.1',
        arch: 'x64',
        confidence: 'proven',
        evidence: [
          'where.exe resolved the launcher shim',
          'npm ls -g names @anthropic-ai/claude-code 2.4.1',
          'shim trace ends at the package entry point'
        ],
        selected: true,
        shadowed: false,
        update: {
          state: 'up-to-date',
          available: null,
          policy: { check: 'automatic', install: 'ask-first', versionPolicy: 'latest-compatible', rollbackOnFailedVerify: true },
          lastChecked: '2026-08-05T09:10:00-07:00',
          history: [
            { when: '2026-07-22T08:05:00-07:00', from: '2.3.6', to: '2.4.1', result: 'verified', detail: 'Launch health, auth identity, catalog, and adapter handshake all passed.' }
          ]
        }
      },
      {
        id: 'inst.claude.brew',
        hostId: 'host.macbook-air',
        envId: 'env.mac.native',
        label: 'Claude CLI (Homebrew, MacBook Air)',
        configuredCommand: 'claude',
        resolvedLauncher: '/opt/homebrew/bin/claude',
        actualExecutable: '/opt/homebrew/Cellar/claude-code/2.3.0/bin/claude',
        method: 'homebrew',
        packageIdentity: 'claude-code (homebrew formula)',
        managerRoot: '/opt/homebrew',
        version: '2.3.0',
        arch: 'arm64',
        confidence: 'proven',
        evidence: [
          'brew list --versions names claude-code 2.3.0',
          'symlink trace: /opt/homebrew/bin/claude -> Cellar/claude-code/2.3.0'
        ],
        selected: false,
        shadowed: true,
        shadowedBy: 'inst.claude.npm',
        update: {
          state: 'managed-externally',
          available: { version: '2.4.1', published: '2026-07-21' },
          policy: { check: 'automatic', install: 'ask-first', versionPolicy: 'latest-compatible', rollbackOnFailedVerify: true },
          lastChecked: '2026-08-05T09:10:00-07:00',
          managedBy: 'Homebrew owns this generation. Update it with brew upgrade, or let PM adopt it into the Tool Store.',
          history: []
        }
      },
      {
        id: 'inst.claude.truenas',
        hostId: 'host.home-truenas',
        envId: 'env.truenas.runner',
        label: 'Claude CLI (PM Tool Store, Home TrueNAS)',
        configuredCommand: 'claude',
        resolvedLauncher: '/mnt/pm-tools/store/claude-code/current/bin/claude',
        actualExecutable: '/mnt/pm-tools/store/claude-code/2.4.1/bin/claude',
        method: 'pm-tool-store',
        packageIdentity: 'claude-code 2.4.1 (PM Tool Store generation g14)',
        managerRoot: '/mnt/pm-tools/store',
        version: '2.4.1',
        arch: 'x64',
        confidence: 'proven',
        evidence: [
          'Tool Store manifest g14 matches the on-disk hash',
          'current symlink points at generation 2.4.1'
        ],
        selected: true,
        shadowed: false,
        update: {
          state: 'up-to-date',
          available: null,
          policy: { check: 'automatic', install: 'ask-first', versionPolicy: 'latest-compatible', rollbackOnFailedVerify: true },
          lastChecked: '2026-08-05T06:00:00-07:00',
          history: [
            { when: '2026-07-22T02:10:00-07:00', from: '2.3.6', to: '2.4.1', result: 'verified', detail: 'Staged as generation g14, verified, then activated. g13 retained for rollback.' }
          ]
        }
      }
    ],
    'openai-codex': [
      {
        id: 'inst.codex.npm',
        hostId: 'host.win-desktop',
        envId: 'env.win.native',
        label: 'Codex CLI (npm, this computer)',
        configuredCommand: 'codex',
        resolvedLauncher: 'C:\\Users\\Jared\\AppData\\Roaming\\npm\\codex.cmd',
        actualExecutable: 'C:\\Users\\Jared\\AppData\\Roaming\\npm\\node_modules\\@openai\\codex\\bin\\codex.js',
        method: 'npm-global',
        packageIdentity: '@openai/codex',
        managerRoot: 'C:\\Users\\Jared\\AppData\\Roaming\\npm',
        version: '1.19.3',
        arch: 'x64',
        confidence: 'proven',
        evidence: [
          'where.exe resolved the launcher shim',
          'npm ls -g names @openai/codex 1.19.3'
        ],
        selected: true,
        shadowed: false,
        update: {
          state: 'update-available',
          available: { version: '1.20.1', published: '2026-08-03' },
          policy: { check: 'automatic', install: 'ask-first', versionPolicy: 'latest-compatible', rollbackOnFailedVerify: true },
          lastChecked: '2026-08-05T09:10:00-07:00',
          history: [
            { when: '2026-07-14T10:40:00-07:00', from: '1.18.0', to: '1.19.3', result: 'verified', detail: 'Verified and activated after a clean adapter handshake.' }
          ]
        }
      }
    ],
    'antigravity': [
      {
        id: 'inst.antigravity.installer',
        hostId: 'host.win-desktop',
        envId: 'env.win.native',
        label: 'Antigravity CLI (official installer)',
        configuredCommand: 'antigravity',
        resolvedLauncher: 'C:\\Program Files\\Antigravity\\bin\\antigravity.exe',
        actualExecutable: 'C:\\Program Files\\Antigravity\\bin\\antigravity.exe',
        method: 'installer',
        packageIdentity: 'Antigravity CLI 1.8.2 (signed installer)',
        managerRoot: 'C:\\Program Files\\Antigravity',
        version: '1.8.2',
        arch: 'x64',
        confidence: 'strong',
        evidence: [
          'Signed binary; publisher certificate verified',
          'Uninstall registry entry names the 1.8.2 installer'
        ],
        selected: true,
        shadowed: false,
        update: {
          state: 'waiting-idle',
          available: { version: '1.9.0', published: '2026-08-01' },
          policy: { check: 'automatic', install: 'auto-idle', versionPolicy: 'latest-compatible', rollbackOnFailedVerify: true },
          lastChecked: '2026-08-05T09:10:00-07:00',
          idleNote: 'Ownership is proven, the target is compatible, and rollback is available. The update installs when no runs are active.',
          history: []
        }
      }
    ],
    'copilot': [
      {
        id: 'inst.copilot.ghext',
        hostId: 'host.win-desktop',
        envId: 'env.win.native',
        label: 'GitHub Copilot CLI (gh extension)',
        configuredCommand: 'gh copilot',
        resolvedLauncher: 'C:\\Users\\Jared\\AppData\\Local\\GitHub CLI\\extensions\\gh-copilot\\gh-copilot.exe',
        actualExecutable: 'C:\\Users\\Jared\\AppData\\Local\\GitHub CLI\\extensions\\gh-copilot\\gh-copilot.exe',
        method: 'gh-extension',
        packageIdentity: 'github/gh-copilot',
        managerRoot: 'C:\\Users\\Jared\\AppData\\Local\\GitHub CLI\\extensions',
        version: '1.6.0',
        arch: 'x64',
        confidence: 'proven',
        evidence: [
          'gh extension list names github/gh-copilot',
          'extension manifest matches the on-disk binary'
        ],
        selected: true,
        shadowed: false,
        update: {
          state: 'rolled-back',
          available: { version: '1.7.0', published: '2026-07-30' },
          policy: { check: 'automatic', install: 'ask-first', versionPolicy: 'latest-compatible', rollbackOnFailedVerify: true },
          lastChecked: '2026-08-05T09:10:00-07:00',
          rollbackNote: 'Version 1.7.0 installed cleanly (installer exit code 0) but failed verification: the adapter handshake was rejected. PM rolled back to 1.6.0 automatically.',
          history: [
            { when: '2026-08-02T07:20:00-07:00', from: '1.6.0', to: '1.7.0', result: 'verification-failed', detail: 'Install succeeded, but the adapter handshake failed. Installer exit code alone is not success.' },
            { when: '2026-08-02T07:21:00-07:00', from: '1.7.0', to: '1.6.0', result: 'rolled-back', detail: 'Previous generation restored and re-verified. Dependent routes refreshed.' }
          ]
        }
      }
    ],
    'local-ollama': [
      {
        id: 'inst.ollama.local',
        hostId: 'host.macbook-air',
        envId: 'env.mac.native',
        label: 'Ollama (found on PATH)',
        configuredCommand: 'ollama',
        resolvedLauncher: '/usr/local/bin/ollama',
        actualExecutable: '/usr/local/bin/ollama',
        method: 'unknown',
        packageIdentity: null,
        managerRoot: null,
        version: '0.12.4',
        arch: 'arm64',
        confidence: 'unknown',
        evidence: [
          'Binary answers --version with 0.12.4',
          'No package database claims this path; likely a curl script install'
        ],
        selected: true,
        shadowed: false,
        manualOnly: true,
        manualOnlyReason: 'Puppet Master could not prove which installer owns this binary, so it will never modify it. Updates stay manual until ownership is proven.',
        update: {
          state: 'unknown-method',
          available: null,
          policy: { check: 'automatic', install: 'ask-first', versionPolicy: 'latest-compatible', rollbackOnFailedVerify: true },
          lastChecked: '2026-08-05T09:10:00-07:00',
          history: []
        }
      }
    ]
  };

  var CURSOR_SETUP_OFFER = {
    kind: 'explicit-install',
    officialSource: 'cursor.com/cli',
    sourceNote: 'Installed from the official Cursor release feed only. Never bundled with Puppet Master, never pre-seeded, and never triggered by a project or model demand.',
    hostChoices: [
      { hostId: 'host.win-desktop', envId: 'env.win.native', label: 'This computer (Windows native)' },
      { hostId: 'host.home-truenas', envId: 'env.truenas.runner', label: 'Home TrueNAS (PM Tool Store)' }
    ],
    steps: [
      { title: 'Choose where it runs', body: 'Pick the exact host and environment. Nothing installs anywhere else.' },
      { title: 'Install from the official source', body: 'PM downloads the signed release from cursor.com, verifies publisher and version, and stages it before activation.' },
      { title: 'Sign in separately', body: 'Installation and authentication are separate. After install, the CLI\u2019s own sign-in runs in an isolated profile.' }
    ],
    requiresExplicitInstall: true
  };

  var OPENCODE_PROVIDER = {
    id: 'opencode',
    name: 'OpenCode Server',
    family: 'OpenCode',
    groupKind: 'server',
    authBoundary: AUTH_BOUNDARY['opencode'],
    status: 'ready',
    statusNote: 'External OpenCode server on the home network. The server owns its provider credentials; Puppet Master holds only a scoped access token reference.',
    defaultAnswerBlock: {
      connected: true,
      accountInUse: 'LAN OpenCode server',
      billingRoute: 'Routed by the server; billing stays server-side',
      remaining: 'Not reported by this server',
      onExhaust: 'The server applies its own queueing; PM reports honest failures',
      modelsAvail: 'GLM 5.2, Qwen3 Coder (server-supplied catalog)',
      attention: null
    },
    serverInfo: {
      url: 'https://opencode.lan.platyr.net:4096',
      version: '0.9.4',
      reachability: 'reachable',
      lastHandshake: '2026-08-05T13:58:00-07:00',
      catalogSource: 'server-supplied'
    },
    accounts: [
      {
        id: 'opencode-server',
        nickname: 'LAN OpenCode',
        identity: 'opencode.lan.platyr.net:4096',
        authOwner: 'server',
        isolation: 'pm-managed',
        enabled: true,
        priority: 1,
        useNext: false,
        sticky: false,
        health: 'ready',
        tokenRef: 'vault:opencode/lan-access',
        usage: {
          includedRemaining: 'Not reported',
          extra: 'None',
          resetAt: null,
          pressure: 'none',
          lastUse: '2026-08-05T12:31:00-07:00'
        },
        lastCatalogRefresh: '2026-08-05T13:58:00-07:00'
      }
    ],
    connections: [
      {
        id: 'conn-opencode',
        kind: 'server',
        route: 'opencode.lan.platyr.net:4096',
        note: 'The server supplies its own model catalog and owns provider credentials. PM verifies reachability and the scoped token; it never sees upstream keys.'
      }
    ],
    models: [
      {
        id: 'oc-glm-5-2',
        name: 'GLM 5.2 (via OpenCode)',
        fav: false,
        hidden: false,
        priority: 4,
        ctx: 128000,
        modalities: ['text'],
        effort: ['medium'],
        fast: false,
        toolSupport: 'full',
        evidence: [
          { cap: 'tool-use', state: 'supported', source: 'server catalog declaration', at: '2026-08-05T13:58:00-07:00' }
        ]
      },
      {
        id: 'oc-qwen3-coder-oc',
        name: 'Qwen3 Coder (via OpenCode)',
        fav: false,
        hidden: false,
        priority: 5,
        ctx: 64000,
        modalities: ['text'],
        effort: ['low', 'medium'],
        fast: true,
        toolSupport: 'partial',
        evidence: [
          { cap: 'fast-mode', state: 'supported', source: 'observed fast-mode generation', at: '2026-08-04T16:22:00-07:00' },
          { cap: 'tool-use', state: 'partial', source: 'safe probe: parallel calls rejected', at: '2026-08-04T16:25:00-07:00' }
        ]
      }
    ],
    plans: []
  };

  /* Free-route states: exactly the six packet states across the collection. */
  var FREE_ROUTE_STATES = {
    'fr-deepseek-free': { state: 'ready', stateNote: 'Rides on the existing OpenRouter key. 20 requests per minute.' },
    'fr-qwen3-coder': { state: 'needs-setup', stateNote: 'A free ModelScope key is required before this route can run.' },
    'fr-mistral-community': { state: 'cooling-down', stateNote: 'The community endpoint rate-limited this address at 1:40 PM. Requests resume automatically at 2:10 PM.' },
    'fr-mistral-data-note': { state: 'unverified', stateNote: 'Listed upstream, but PM has not yet verified a successful generation on this route.' },
    'fr-copilot-included': { state: 'needs-setup', stateNote: 'Included usage requires an active Copilot seat. Renew, then run the connection check.' },
    'fr-llama-promo': { state: 'no-longer-free', stateNote: 'The launch promotion ended on Aug 1. The route now bills at standard credit pricing.' },
    'fr-kimi-paused': { state: 'no-longer-available', stateNote: 'The upstream provider removed this listing on Aug 2. History is kept; routing falls back to DeepSeek V4.' },
    'fr-local-qwen': { state: 'ready', stateNote: 'Runs on your own hardware. No account, no rate limit.' }
  };

  var FREE_CATALOG = {
    sources: [
      {
        id: 'models-dev',
        name: 'Models.dev',
        sourceVersion: '2026-08-05.2',
        lastChecked: '2026-08-05T13:00:00-07:00',
        lastImported: '2026-08-05T13:00:00-07:00',
        lastActivated: '2026-08-05T13:01:00-07:00',
        validation: 'passed',
        lastKnownGood: true
      },
      {
        id: 'free-coding-models',
        name: 'Free Coding Models',
        sourceVersion: '2026-08-04.9',
        lastChecked: '2026-08-05T13:00:00-07:00',
        lastImported: '2026-08-04T21:12:00-07:00',
        lastActivated: '2026-08-04T21:13:00-07:00',
        validation: 'passed',
        lastKnownGood: true
      }
    ],
    changeHistory: [
      { when: '2026-08-02T09:00:00-07:00', change: 'Kimi K2 listing removed upstream; route marked no longer available.' },
      { when: '2026-08-01T08:30:00-07:00', change: 'Llama 4 Maverick launch promotion ended; route marked no longer free.' },
      { when: '2026-07-29T11:15:00-07:00', change: 'Qwen3 Coder free tier added (ModelScope key required).' }
    ]
  };

  /* =====================================================================
     2. NEW COLLECTIONS — server topology, managers, and fixture families.
     ===================================================================== */

  var EXT = {

    serverTopology: {
      homeServer: { hostId: 'host.home-truenas', processing: 'on', clientsPaired: 3 },
      hosts: [
        {
          id: 'host.home-truenas',
          name: 'Home TrueNAS',
          kind: 'truenas',
          role: ['home-server', 'execution-host'],
          state: 'connected',
          isDefaultExecutionHost: true,
          environments: [
            { id: 'env.truenas.runner', label: 'Linux container runner', kind: 'linux-container-runner', optional: false, state: 'ready', healthNote: null },
            { id: 'env.truenas.k8s', label: 'Kubernetes pool', kind: 'kubernetes-pool', optional: true, state: 'not-set-up', healthNote: 'Set up only if a selected capability needs a cluster.' }
          ]
        },
        {
          id: 'host.win-desktop',
          name: 'This computer (Windows)',
          kind: 'windows',
          role: ['client', 'execution-host'],
          state: 'connected',
          isDefaultExecutionHost: false,
          environments: [
            { id: 'env.win.native', label: 'Windows native', kind: 'windows-native', optional: false, state: 'ready', healthNote: 'Complete without WSL.' },
            { id: 'env.win.wsl', label: 'Linux through WSL (Ubuntu)', kind: 'wsl', optional: true, state: 'off', healthNote: 'Off is healthy. Using Windows tools only. Setup appears only when a selected capability needs Linux.' },
            { id: 'env.win.ssh-build', label: 'SSH: build server', kind: 'ssh', optional: true, state: 'ready', healthNote: null }
          ]
        },
        {
          id: 'host.macbook-air',
          name: 'MacBook Air',
          kind: 'macos',
          role: ['client'],
          state: 'reachable',
          isDefaultExecutionHost: false,
          environments: [
            { id: 'env.mac.native', label: 'macOS native', kind: 'macos-native', optional: false, state: 'ready', healthNote: null },
            { id: 'env.mac.container', label: 'Linux through Apple container', kind: 'apple-container', optional: true, state: 'off', healthNote: 'Off is healthy.' }
          ]
        }
      ],
      clients: [
        { id: 'client.win-desktop', name: 'Jared\u2019s Desktop', platform: 'Windows', lastSeen: '2026-08-05T14:20:00-07:00' },
        { id: 'client.macbook-air', name: 'MacBook Air', platform: 'macOS', lastSeen: '2026-08-05T13:05:00-07:00' },
        { id: 'client.tablet', name: 'Living-room tablet', platform: 'Web', lastSeen: '2026-08-03T19:44:00-07:00' }
      ],
      project: {
        hostedOn: 'Home TrueNAS',
        files: '/mnt/projects/Puppet-Master',
        runWork: 'Automatic \u00b7 Home TrueNAS'
      }
    },

    serverModules: {
      connectedServerCard: {
        name: 'Home TrueNAS',
        state: 'connected',
        processing: 'on',
        clients: 3,
        actions: ['change-server', 'add-server']
      },
      reserved: [
        { id: 'mod.servers', label: 'Servers', state: 'reserved', namedOwner: 'Server Backbone return (Post-Return Reconciliation v6)', insertionContract: 'Manager destination with health summary, claim/bootstrap deep links, and receipts.' },
        { id: 'mod.execution-hosts', label: 'Execution Hosts', state: 'reserved', namedOwner: 'Server Backbone return \u00a75', insertionContract: 'Host cards with nested environment rows; WSL stays optional and environment-specific.' },
        { id: 'mod.clients', label: 'Clients', state: 'reserved', namedOwner: 'Server Backbone return \u00a74', insertionContract: 'Paired-client list with pairing and revoke actions.' },
        { id: 'mod.project-hosting', label: 'Project Hosting & Files', state: 'reserved', namedOwner: 'storage-plan.md', insertionContract: 'Project Vault location, hosted-on card, and move/sync deep links (Project Sync owner).' },
        { id: 'mod.project-defaults', label: 'Project Defaults & Templates', state: 'reserved', namedOwner: 'FinalGUISpec.md (project settings canon)', insertionContract: 'Template list plus Copy Settings From\u2026 transactional flow.' },
        { id: 'mod.remote-access', label: 'Remote Access', state: 'reserved', namedOwner: 'Server Backbone return \u00a710', insertionContract: 'Access methods, status-bar projection, and per-client policy.' },
        { id: 'mod.integrations', label: 'Integrations & Tools', state: 'reserved', namedOwner: 'BinaryLocator_Spec.md / shared tool lifecycle', insertionContract: 'Shared installation lifecycle cards; domain managers keep capability detail.' },
        { id: 'mod.backup-restore', label: 'Backup & Restore (full Server)', state: 'partial', namedOwner: 'storage-plan.md', insertionContract: 'Settings and project backups are live in this bakeoff; full-Server backup inserts here.' },
        { id: 'mod.updates', label: 'Updates', state: 'reserved', namedOwner: 'Release_Supply_Chain.md', insertionContract: 'PM application and content update state machines are deferred; destination and receipts reserved.' }
      ]
    },

    notifications: {
      master: {
        enabled: true,
        volume: 70,
        quietHours: { start: '22:00', end: '07:30', days: 'daily' },
        focusBehavior: 'suppress-noncritical'
      },
      surfaceRule: {
        inApp: 'title-bar-stack-only',
        note: 'The title-bar notification stack and its sprout inbox are the only in-app notification surface. No corner toasts stack, no status-bar bell, no side panel.'
      },
      soundNotSoleIndicator: true,
      destinations: [
        {
          id: 'dest.inapp',
          kind: 'in-app',
          label: 'In-app (title bar)',
          state: 'ready',
          builtIn: true,
          locked: true,
          lockedReason: 'The in-app stack is always available; durable alerts join it and ephemeral toasts stage beneath it.',
          config: {},
          lastTest: null
        },
        {
          id: 'dest.system',
          kind: 'system',
          label: 'System notifications',
          state: 'ready',
          builtIn: true,
          config: { respectFocusAssist: true },
          lastTest: { when: '2026-08-04T10:02:00-07:00', ok: true, receiptId: 'rcpt.test.system.0804', masked: true }
        },
        {
          id: 'dest.slack',
          kind: 'slack',
          label: 'Slack \u00b7 #pm-runs',
          state: 'ready',
          builtIn: false,
          config: {
            workspace: 'platyr',
            channel: '#pm-runs',
            threadOnFailure: true,
            mention: '@jared',
            tokenRef: 'vault:slack/platyr-bot'
          },
          lastTest: { when: '2026-08-05T09:30:00-07:00', ok: true, receiptId: 'rcpt.test.slack.0805', masked: true },
          rateLimit: '1 test per 30 seconds'
        },
        {
          id: 'dest.discord',
          kind: 'discord',
          label: 'Discord',
          state: 'needs-setup',
          builtIn: false,
          config: { webhookUrlRef: null, mention: null },
          setupNote: 'Paste a Discord webhook reference to finish setup.',
          lastTest: null
        },
        {
          id: 'dest.webhook',
          kind: 'webhook',
          label: 'Generic webhook \u00b7 ops relay',
          state: 'validation-error',
          builtIn: false,
          config: {
            url: 'https://ops.platyr.net/hooks/pm',
            method: 'POST',
            headers: { 'X-PM-Source': 'puppet-master' },
            template: '{"event":"{{event}}","severity":"{{severity}}"}',
            successPredicate: 'staus < 300'
          },
          validationError: {
            field: 'successPredicate',
            message: 'Unknown field \u201cstaus\u201d. Did you mean \u201cstatus\u201d?'
          },
          lastTest: { when: '2026-08-03T15:12:00-07:00', ok: false, receiptId: 'rcpt.test.webhook.0803', masked: true }
        },
        {
          id: 'dest.ntfy',
          kind: 'ntfy',
          label: 'ntfy \u00b7 pm-jared',
          state: 'ready',
          builtIn: false,
          config: {
            server: 'https://ntfy.lan.platyr.net',
            topic: 'pm-jared',
            priority: 'default',
            tags: ['pm'],
            clickTarget: 'open-run'
          },
          lastTest: { when: '2026-08-02T18:40:00-07:00', ok: true, receiptId: 'rcpt.test.ntfy.0802', masked: true }
        },
        {
          id: 'dest.pushover',
          kind: 'pushover',
          label: 'Pushover \u00b7 Pixel 9',
          state: 'disabled',
          builtIn: false,
          config: { device: 'pixel-9', priority: 'normal', userKeyRef: 'vault:pushover/jared' },
          disabledNote: 'Kept configured but turned off while quiet-testing ntfy.',
          lastTest: { when: '2026-07-25T08:15:00-07:00', ok: true, receiptId: 'rcpt.test.pushover.0725', masked: true }
        },
        {
          id: 'dest.telegram',
          kind: 'telegram',
          label: 'Telegram \u00b7 PM alerts',
          state: 'ready',
          builtIn: false,
          config: {
            chatId: '-100482',
            parseMode: 'MarkdownV2',
            retry: 'twice with backoff',
            botTokenRef: 'vault:telegram/pm-bot'
          },
          lastTest: { when: '2026-08-01T20:05:00-07:00', ok: true, receiptId: 'rcpt.test.telegram.0801', masked: true }
        }
      ],
      routing: [
        { eventId: 'run.completed', label: 'Run completed', severity: 'info', destinations: { 'dest.inapp': 'always', 'dest.system': 'when-unfocused', 'dest.slack': 'never', 'dest.ntfy': 'when-unfocused' }, soundId: 'snd.soft-chime', note: null },
        { eventId: 'run.failed', label: 'Run failed', severity: 'attention', destinations: { 'dest.inapp': 'always', 'dest.system': 'always', 'dest.slack': 'always', 'dest.ntfy': 'always' }, soundId: 'snd.task-horn', note: 'Sound is never the only failure signal; the stack entry and destination message always accompany it.' },
        { eventId: 'approval.needed', label: 'Approval needed', severity: 'attention', destinations: { 'dest.inapp': 'always', 'dest.system': 'always', 'dest.telegram': 'when-unfocused' }, soundId: 'snd.wood-block', note: null },
        { eventId: 'usage.threshold', label: 'Usage threshold reached', severity: 'warning', destinations: { 'dest.inapp': 'always', 'dest.slack': 'failures-only' }, soundId: null, note: null },
        { eventId: 'goal.checkpoint', label: 'Goal checkpoint reached', severity: 'info', destinations: { 'dest.inapp': 'always' }, soundId: 'snd.quiet-tick', note: null },
        { eventId: 'provider.attention', label: 'Provider needs attention', severity: 'attention', destinations: { 'dest.inapp': 'always', 'dest.system': 'when-unfocused' }, soundId: 'snd.wood-block', note: null }
      ],
      sounds: {
        library: [
          { id: 'snd.soft-chime', name: 'Soft chime', source: 'built-in', format: 'ogg', sampleRate: 48000, duration: 1.2, hash: 'sha256:7c1e\u202642aa', license: 'PM bundled', version: '1.0', defaultFor: ['run.completed'] },
          { id: 'snd.wood-block', name: 'Wood block', source: 'built-in', format: 'ogg', sampleRate: 48000, duration: 0.6, hash: 'sha256:19fd\u2026e310', license: 'PM bundled', version: '1.0', defaultFor: ['approval.needed', 'provider.attention'] },
          { id: 'snd.task-horn', name: 'Task horn', source: 'built-in', format: 'ogg', sampleRate: 48000, duration: 1.8, hash: 'sha256:b44a\u20267d05', license: 'PM bundled', version: '1.0', defaultFor: ['run.failed'] },
          { id: 'snd.quiet-tick', name: 'Quiet tick', source: 'built-in', format: 'ogg', sampleRate: 48000, duration: 0.3, hash: 'sha256:02cd\u20265598', license: 'PM bundled', version: '1.0', defaultFor: ['goal.checkpoint'] },
          { id: 'snd.marimba-done', name: 'marimba-done.ogg', source: 'upload', format: 'ogg', sampleRate: 44100, duration: 1.5, hash: 'sha256:8ea2\u2026c4f1', license: 'User provided', uploadedAt: '2026-07-29T16:20:00-07:00', defaultFor: [] },
          { id: 'snd.rain-tap', name: 'rain-tap.wav', source: 'upload', format: 'wav', sampleRate: 48000, duration: 2.4, hash: 'sha256:5d0b\u20261a77', license: 'User provided', uploadedAt: '2026-08-01T11:05:00-07:00', defaultFor: [] },
          { id: 'snd.peon-ready', name: 'Ready to work', source: 'pack:pack.peonping-classic', format: 'ogg', sampleRate: 44100, duration: 1.1, hash: 'sha256:e921\u20260bd3', license: 'CC-BY-4.0', version: '2.3', defaultFor: [] }
        ],
        packs: [
          { id: 'pack.peonping-classic', name: 'PeonPing Classic', origin: 'PeonPing', version: '2.3', soundCount: 12, state: 'imported', licenseCheck: { result: 'verified', license: 'CC-BY-4.0' }, formatCheck: { result: 'passed' }, importedAt: '2026-07-18T09:00:00-07:00' },
          { id: 'pack.openpeon-vol2', name: 'OpenPeon Vol. 2', origin: 'OpenPeon', version: '1.1', soundCount: 9, state: 'license-unverified', licenseCheck: { result: 'unverified', detail: 'The pack manifest names no license. Import stays blocked until the license is reviewed; unverified packs are never bundled or enabled.' }, formatCheck: { result: 'passed' }, importedAt: null },
          { id: 'pack.warcraft-rip', name: 'warcraft-rip.zip', origin: 'file', version: null, soundCount: 0, state: 'format-invalid', licenseCheck: { result: 'not-run' }, formatCheck: { result: 'failed', detail: 'Not an OpenPeon-compatible pack: manifest.json is missing and two files are not audio.' }, importedAt: null }
        ],
        previewNote: 'Preview plays locally only. Test-send is explicit, masked, rate-limited, and receipted.'
      }
    },

    appearance: {
      base: { theme: 'friendly', mode: 'auto', followOS: true },
      customThemes: [
        {
          id: 'theme.platyr-dusk',
          name: 'Platyr Dusk',
          file: 'platyr-dusk.toml',
          baseTheme: 'glass-dark',
          state: 'active',
          schemaVersion: '1.2',
          lastLoaded: '2026-08-05T08:00:00-07:00',
          liveReload: true,
          errors: [],
          fallback: null
        },
        {
          id: 'theme.cobalt-mono',
          name: 'Cobalt Mono',
          file: 'cobalt-mono.toml',
          baseTheme: 'basic-dark',
          state: 'invalid',
          schemaVersion: '1.2',
          lastLoaded: '2026-08-04T19:30:00-07:00',
          liveReload: true,
          errors: [
            { line: 41, key: 'panel.background', message: 'Expected a color, got "#3G4A".' }
          ],
          fallback: { active: true, to: 'basic-dark', reason: 'The theme failed schema validation, so its base theme is in effect. Fix line 41 and reload.' }
        },
        {
          id: 'theme.paper-print',
          name: 'Paper Print',
          file: 'paper-print.toml',
          baseTheme: 'friendly-light',
          state: 'restart-required',
          schemaVersion: '1.2',
          lastLoaded: null,
          liveReload: false,
          errors: [],
          restartNote: 'Imported and validated. Its font substitutions load at the next start.',
          fallback: null
        }
      ],
      fonts: {
        ui: 'Inter',
        mono: 'JetBrains Mono',
        custom: { requested: 'Berkeley Mono', state: 'not-installed', fallbackTo: 'JetBrains Mono', note: 'Berkeley Mono is configured but not installed on this computer; the fallback chain is in effect.' },
        fallbackChain: ['Berkeley Mono', 'JetBrains Mono', 'Cascadia Mono', 'monospace']
      },
      uiScale: { value: 1.0, options: [0.85, 1.0, 1.15, 1.3], pendingRestart: false },
      lockedRows: [
        { settingId: 'general.visual.glass-transparency', reason: 'Only available in Glass themes.' },
        { settingId: 'general.visual.glass-background-mode', reason: 'Only available in Glass themes.' }
      ]
    },

    desktop: {
      tray: {
        minimizeToTray: true,
        closeToTray: false,
        automationBadge: 'progress-ring',
        automationBadgeNote: 'While automation runs, the tray icon carries a quiet progress ring and the menu offers Pause and Resume.',
        menu: ['Show / Hide', 'Pause / Resume automation', 'Quit']
      },
      launch: { destination: 'last-project', restoreWindows: true, restorePanels: true, restoreTabs: true },
      crashRecovery: {
        lastRecovery: '2026-08-03T07:55:00-07:00',
        buffersRestored: 3,
        unsavedProtection: 'always',
        note: 'Three unsaved buffers were restored after the Aug 3 GPU driver crash.'
      },
      activityBar: {
        order: ['files', 'search', 'source-control', 'actions', 'docker', 'testing', 'chat', 'agents', 'artifacts'],
        hidden: ['docker'],
        overflow: 'menu'
      },
      limits: { maxEditorTabs: 20, treeRenderLimit: 5000, historyArchiveDays: 90 }
    },

    teacher: {
      enabled: true,
      lastSession: '2026-08-04T15:10:00-07:00',
      topics: [
        {
          id: 'teach.provider-priority',
          title: 'How account priority and fallback work',
          surface: 'manager.providers',
          kind: 'explain-screen',
          steps: [
            { text: 'Accounts are tried in priority order. \u201cUse next\u201d marks where the next request will land.', highlightRef: 'accounts' },
            { text: 'When included usage runs out, the continuation policy decides whether to fall through, spend extra balance, or wait.', highlightRef: 'defaultAnswerBlock' }
          ],
          canTransitionToAction: false
        },
        {
          id: 'teach.slack-setup',
          title: 'Send run alerts to Slack',
          surface: 'manager.notifications',
          kind: 'guided-action',
          steps: [
            { text: 'Destinations deliver notifications outside the app. Slack needs a workspace, a channel, and a bot token reference.', highlightRef: 'dest.slack' },
            { text: 'Ready to connect? The guided step opens the real add-destination flow with the workspace field focused.', actionRef: 'notifications.destination.add' }
          ],
          canTransitionToAction: true
        },
        {
          id: 'teach.last-match-wins',
          title: 'Why the last matching rule wins',
          surface: 'manager.permissions',
          kind: 'explain-screen',
          steps: [
            { text: 'Permission rules are ordered. Every matching rule is noted, but the last match decides.', highlightRef: 'evaluationTrace' },
            { text: 'The trace below each test shows exactly which rules matched and which one decided.', highlightRef: 'evaluationTrace' }
          ],
          canTransitionToAction: false
        },
        {
          id: 'teach.custom-theme',
          title: 'Create a custom theme from a base',
          surface: 'manager.appearance',
          kind: 'guided-action',
          steps: [
            { text: 'Custom themes are TOML files that inherit from one of the eight built-ins and override tokens.', highlightRef: 'customThemes' },
            { text: 'The guided step creates a new theme file pre-filled with your current base.', actionRef: 'theme.create' }
          ],
          canTransitionToAction: true
        },
        {
          id: 'teach.retention',
          title: 'What retention classes mean',
          surface: 'manager.storage',
          kind: 'explain-screen',
          steps: [
            { text: 'Each data class has its own retention. Legal holds pin evidence beyond normal expiry.', highlightRef: 'retention' }
          ],
          canTransitionToAction: false
        }
      ]
    },

    fileManager: {
      tree: { dragDrop: 'ask', showHidden: false, ignoredStyle: 'dim', largeFileThresholdMB: 50 },
      tabs: { max: 20, splitGroups: 2 },
      changedOnDisk: 'prompt',
      recovery: {
        autosaveSeconds: 30,
        recoveredBuffers: [
          { path: 'Concepts/notes/settings-sketch.md', savedAt: '2026-08-03T07:54:00-07:00', restored: true }
        ]
      },
      unavailable: [
        { path: '/mnt/media-vault', reason: 'Mount offline since 9:12 AM', since: '2026-08-05T09:12:00-07:00' }
      ]
    },

    formatters: {
      enabled: true,
      entries: [
        {
          id: 'fmt.prettier',
          name: 'Prettier',
          builtIn: true,
          state: 'detected',
          version: '4.0.2',
          command: 'prettier --write',
          env: {},
          extensions: ['.ts', '.tsx', '.json', '.css'],
          scope: 'project',
          lastTest: { when: '2026-08-04T11:30:00-07:00', ok: true, sample: { before: 'const x={a:1,b:2}', after: 'const x = { a: 1, b: 2 };' } }
        },
        {
          id: 'fmt.rustfmt',
          name: 'rustfmt',
          builtIn: true,
          state: 'detected',
          version: '1.8.0',
          command: 'rustfmt --edition 2024',
          env: {},
          extensions: ['.rs'],
          scope: 'global',
          lastTest: null
        },
        {
          id: 'fmt.black',
          name: 'Black',
          builtIn: true,
          state: 'not-found',
          version: null,
          command: 'black',
          env: {},
          extensions: ['.py'],
          scope: 'global',
          installHint: 'Not found on Home TrueNAS or this computer. Install into the environment that runs your Python work.'
        },
        {
          id: 'fmt.sqlfluff',
          name: 'sqlfluff',
          builtIn: false,
          state: 'disabled',
          version: '3.4.1',
          command: 'sqlfluff format --dialect postgres',
          env: { SQLFLUFF_CONFIG: '.sqlfluff' },
          extensions: ['.sql'],
          scope: 'project',
          disabledNote: 'Turned off while the team settles on a dialect.'
        }
      ]
    },

    testingDebug: {
      capabilities: [
        { id: 'cap.unit', label: 'Unit & integration tests', global: 'auto', project: 'on', exposure: 'standard' },
        { id: 'cap.browser', label: 'Built-in browser testing', global: 'auto', project: 'auto', exposure: 'standard' },
        { id: 'cap.desktop', label: 'Desktop & native app testing', global: 'off', project: 'off', reason: 'No display on the Home TrueNAS runner.', exposure: 'standard' },
        { id: 'cap.hot-reload', label: 'Hot reload & previews', global: 'on', project: 'inherit-global', exposure: 'standard' },
        { id: 'cap.simulator', label: 'Simulator, emulator & device', global: 'auto', project: 'off', reason: 'This project targets desktop only.', exposure: 'standard' },
        { id: 'cap.api-db', label: 'API & database testing', global: 'auto', project: 'inherit-global', exposure: 'standard' },
        { id: 'cap.console-net', label: 'Console & network capture', global: 'on', project: 'inherit-global', exposure: 'standard' },
        { id: 'cap.quality', label: 'Performance, security & accessibility', global: 'auto', project: 'inherit-global', exposure: 'advanced' },
        { id: 'cap.dap', label: 'DAP debugger', global: 'auto', project: 'on', exposure: 'advanced' },
        { id: 'cap.eval', label: 'Persistent eval session', global: 'off', project: 'off', exposure: 'expert', reason: 'Long-lived eval state is powerful; keep it off unless a debugging task needs it.' },
        { id: 'cap.capture', label: 'Capture & artifacts', global: 'auto', project: 'inherit-global', exposure: 'standard' }
      ]
    },

    storage: {
      mode: 'managed-vault',
      vaultPath: '/mnt/projects/.pm-vault',
      usage: {
        totalGB: 41.2,
        byClass: [
          { classId: 'chat-history', label: 'Chat history & sessions', gb: 6.8 },
          { classId: 'run-evidence', label: 'Run evidence & receipts', gb: 12.4 },
          { classId: 'artifacts', label: 'Runtime artifacts & outputs', gb: 17.6 },
          { classId: 'recovery', label: 'Recovery snapshots', gb: 4.4 }
        ]
      },
      retention: [
        { classId: 'chat-history', label: 'Chat history & sessions', days: 180, note: null },
        { classId: 'run-evidence', label: 'Run evidence & receipts', days: 90, legalHold: true, note: 'A legal hold pins the June audit evidence beyond normal expiry.' },
        { classId: 'artifacts', label: 'Runtime artifacts & outputs', days: null, policy: 'until-project-delete', note: null },
        { classId: 'recovery', label: 'Recovery snapshots', days: 14, note: null }
      ],
      pressure: { state: 'elevated', freeGB: 18.4, note: 'The vault dataset is above 70% use. Compaction is scheduled for the next idle window.' },
      quarantine: [
        { id: 'q1', item: 'artifact bundle run-4188', when: '2026-08-05T03:20:00-07:00', reason: 'Failed integrity check during compaction; kept isolated for inspection.' }
      ],
      compaction: { lastRun: '2026-08-01T02:00:00-07:00', reclaimedMB: 940 },
      migration: { offer: 'idle', note: 'A layout migration to vault format v3 is ready and will run when idle.' },
      receipts: [
        { id: 'rcpt.storage.compact.0801', label: 'Compaction completed', when: '2026-08-01T02:14:00-07:00' },
        { id: 'rcpt.storage.hold.0712', label: 'Legal hold applied to run evidence', when: '2026-07-12T10:00:00-07:00' }
      ]
    },

    backups: {
      kinds: [
        { id: 'bk.recovery', label: 'Internal recovery snapshots', note: 'Automatic, short-lived, and internal. Not a backup you manage.' },
        { id: 'bk.settings', label: 'Settings backup', note: 'Portable settings exports and automatic pre-import restore points.' },
        { id: 'bk.project', label: 'Project backup', note: 'The project files and PM project state.' },
        { id: 'bk.server', label: 'Full Server backup', note: 'Everything on the Home Server, taken by the server itself.' }
      ],
      restorePoints: [
        { id: 'rp.settings.auto-0805', kind: 'bk.settings', label: 'Before settings import (automatic)', when: '2026-08-04T09:41:00-07:00', origin: 'pre-import', verified: true, sizeMB: 2 },
        { id: 'rp.project.weekly-0803', kind: 'bk.project', label: 'Weekly project backup', when: '2026-08-03T03:00:00-07:00', origin: 'schedule', verified: true, encrypted: true, sizeMB: 1840 },
        { id: 'rp.server.full-0801', kind: 'bk.server', label: 'Monthly full Server backup', when: '2026-08-01T03:00:00-07:00', origin: 'schedule', verified: false, verification: 'pending', target: 'tank/backups', sizeMB: 96500 }
      ],
      schedule: { settings: 'on-change', project: 'weekly \u00b7 Sunday 3:00 AM', server: 'monthly \u00b7 1st 3:00 AM' },
      testRestore: {
        last: { when: '2026-08-02T04:00:00-07:00', point: 'rp.project.weekly-0803', result: 'passed', target: 'scratch dataset', note: 'Restored to a scratch dataset and verified hashes; nothing touched the live project.' }
      },
      encryption: { enabled: true, keyOwner: 'PM vault', note: 'Backups are encrypted; the key never leaves the vault.' }
    },

    settingsLifecycle: {
      lastExport: { when: '2026-08-04T09:35:00-07:00', file: 'pm-settings-2026-08-04.pmset', scope: 'global+project', receiptId: 'rcpt.settings.export.0804' },
      importPreview: {
        state: 'dormant',
        source: 'pm-settings-macbook.pmset',
        createdOn: 'MacBook Air',
        mode: 'merge',
        counts: { add: 12, change: 9, conflict: 3, invalid: 1, legacyMigrated: 2 },
        conflicts: [
          { settingId: 'general.visual.theme', local: 'Friendly Dark', incoming: 'Glass Dark', note: 'Both changed since the last sync.' },
          { settingId: 'permissions.approvals.rule-count', local: '7 rules', incoming: '5 rules', note: 'Managed rows are excluded from import; only your own rules are compared.' },
          { settingId: 'general.sounds.master-volume', local: '70', incoming: '40', note: null }
        ],
        invalid: [
          { key: 'ai.models.legacy-router', reason: 'Unknown key. Probably from an older version; it will be skipped.' }
        ],
        legacyMigrated: [
          { from: 'pm.theme', to: 'general.visual.theme' },
          { from: 'pm.glassAlpha', to: 'general.visual.glass-transparency' }
        ],
        secretNote: 'Secrets never travel in settings files. Destination tokens and API keys stay behind vault references.',
        restorePointId: 'rp.settings.auto-0805'
      },
      history: [
        { when: '2026-07-30T14:20:00-07:00', action: 'import-applied', receiptId: 'rcpt.settings.import.0730', detail: '9 changes applied from pm-settings-desktop.pmset. Restore point created first.' },
        { when: '2026-07-30T14:26:00-07:00', action: 'rollback-complete', receiptId: 'rcpt.settings.rollback.0730', detail: 'Rolled back to the pre-import snapshot. All 9 changes reverted; receipt kept.' }
      ],
      reset: { scopes: ['category', 'all'], lastReset: null }
    },

    sessionsHistory: {
      filters: { project: 'Puppet Master' },
      sessions: [
        { id: 'ses.4412', title: 'Settings bakeoff \u2014 shell polish', project: 'Puppet Master', started: '2026-08-05T09:00:00-07:00', turns: 42, routes: ['Claude Sonnet 4.5'], sizeMB: 8.2, archived: false },
        { id: 'ses.4409', title: 'Provider fixture sweep', project: 'Puppet Master', started: '2026-08-04T13:30:00-07:00', turns: 61, routes: ['Claude Sonnet 4.5', 'GPT-5.2'], sizeMB: 12.6, archived: false },
        { id: 'ses.4391', title: 'Worktree cleanup helper', project: 'Puppet Master', started: '2026-08-01T10:12:00-07:00', turns: 18, routes: ['Claude Haiku 4.5'], sizeMB: 2.1, archived: false },
        { id: 'ses.4380', title: 'June audit evidence pass', project: 'Puppet Master', started: '2026-07-28T08:45:00-07:00', turns: 87, routes: ['Claude Opus 4.1'], sizeMB: 21.4, archived: true },
        { id: 'ses.2214', title: 'Landing page copy', project: 'Platyr Site', started: '2026-08-02T19:20:00-07:00', turns: 12, routes: ['GPT-5.2'], sizeMB: 1.4, archived: false }
      ],
      policy: { export: ['markdown', 'json'], compare: true, rebuildIndex: true, archiveAfterDays: 90, deletion: 'ask' }
    },

    artifacts: {
      entries: [
        { id: 'art.audit-report', name: 'settings-audit-report.pdf', type: 'report', producedBy: 'ses.4380', identity: 'pm', location: '/mnt/projects/.pm-vault/artifacts/2026-07/settings-audit-report.pdf', version: 3, retention: 'until-project-delete', redaction: { state: 'applied', rules: ['mask emails'] }, receiptId: 'rcpt.art.audit.0728', actions: ['open', 'reveal', 'export', 'clean'] },
        { id: 'art.build-log', name: 'build-2026-08-05.log', type: 'log', producedBy: 'ses.4412', identity: 'pm', location: '/mnt/projects/.pm-vault/artifacts/2026-08/build-2026-08-05.log', version: 1, retention: '90 days', redaction: { state: 'none', rules: [] }, receiptId: 'rcpt.art.build.0805', actions: ['open', 'reveal', 'export', 'clean'] },
        { id: 'art.run-capture', name: 'run-4409-capture.png', type: 'capture', producedBy: 'ses.4409', identity: 'provider-native', identityNote: 'Produced by the provider\u2019s own capture path, tracked by PM.', location: '/mnt/projects/.pm-vault/artifacts/2026-08/run-4409-capture.png', version: 1, retention: '90 days', redaction: { state: 'pending', rules: ['blur tokens'] }, receiptId: 'rcpt.art.capture.0804', actions: ['open', 'reveal', 'export', 'clean'] },
        { id: 'art.coverage', name: 'coverage-html', type: 'bundle', producedBy: 'ses.4391', identity: 'pm', location: '/mnt/projects/.pm-vault/artifacts/2026-07/coverage-html', version: 6, retention: 'expired', redaction: { state: 'none', rules: [] }, receiptId: 'rcpt.art.coverage.0722', cleanupCandidate: true, actions: ['open', 'reveal', 'export', 'clean'] }
      ]
    },

    sourceControl: {
      tools: [
        {
          id: 'tool.git',
          name: 'Git',
          hostStates: [
            { hostId: 'host.home-truenas', state: 'ready', version: '2.52.0', installationNote: 'PM Tool Store generation g8.' },
            { hostId: 'host.win-desktop', state: 'ready', version: '2.52.0', installationNote: 'winget-managed; adopted read-only.' }
          ]
        },
        {
          id: 'tool.jujutsu',
          name: 'Jujutsu',
          hostStates: [
            { hostId: 'host.home-truenas', state: 'ready', version: '0.36.1', installationNote: 'PM Tool Store generation g3.' },
            { hostId: 'host.win-desktop', state: 'not-installed', envId: 'env.win.wsl', installOffer: { label: 'Install Jujutsu on WSL Ubuntu', note: 'Installs only into the exact selected environment. WSL itself stays optional; Windows-native work is unaffected.' } }
          ]
        },
        {
          id: 'tool.git-lfs',
          name: 'Git LFS',
          hostStates: [
            { hostId: 'host.home-truenas', state: 'ready', version: '3.7.0', installationNote: 'Set up for the media directories only.' },
            { hostId: 'host.win-desktop', state: 'not-installed', installOffer: { label: 'Set Up Git LFS', note: 'Only needed if you edit tracked media on this computer.' } }
          ]
        }
      ],
      forges: [
        { id: 'forge.github', name: 'GitHub', state: 'connected', account: 'jared-platyr (Personal)', scopes: ['repo', 'workflow'], capability: { actions: true, packages: false }, connectNote: 'Connected as a hosted service. No CLI install is required for the connection itself.' },
        { id: 'forge.gitlab', name: 'GitLab', state: 'not-connected', connectOffer: { label: 'Connect GitLab', note: 'Connect the hosted service; installing a CLI is never required for this.' } }
      ],
      ssh: {
        state: 'ready',
        keys: [
          { id: 'ssh.ed25519-main', label: 'jared@desktop (ed25519)', algo: 'ed25519', created: '2025-11-02', hosts: ['github.com'] },
          { id: 'ssh.ed25519-nas', label: 'pm@truenas (ed25519)', algo: 'ed25519', created: '2026-03-14', hosts: ['github.com', 'build server'] }
        ]
      },
      worktrees: {
        policy: 'auto-per-goal',
        testBeforeMerge: 'on',
        pushPolicy: { force: 'never', protected: ['main'] },
        active: [
          { id: 'wt.goal-142', branch: 'goal/142-settings-bakeoff', path: '.pm-worktrees/goal-142', state: 'leased', lease: { holder: 'Goal #142 \u2014 Settings bakeoff', expires: '2026-08-05T18:00:00-07:00' } },
          { id: 'wt.fix-scrollspy', branch: 'fix/scrollspy-deadband', path: '.pm-worktrees/fix-scrollspy', state: 'idle', lease: null },
          { id: 'wt.old-spike', branch: 'spike/inspector-grid', path: '.pm-worktrees/old-spike', state: 'stale', staleNote: 'No commits for 26 days; cleanup candidate.', lease: null }
        ]
      },
      recovery: { reflogDays: 90, note: 'Branch and bookmark recovery keeps 90 days of movement on both Git and Jujutsu.' }
    },

    githubActions: {
      accountCapability: { account: 'jared-platyr (Personal)', actions: true, note: 'Workflow read and dispatch are available on this connection.' },
      boundaryNote: 'Settings owns pinning, readiness, and setup. Browsing runs and logs in depth stays in the left-rail GitHub Actions panel.',
      pinned: [
        { id: 'wf.ci', name: 'ci.yml', branch: 'feat/settings-bakeoff', readiness: 'passing', lastRun: { id: 'run.8841', result: 'success', when: '2026-08-05T11:30:00-07:00' } },
        { id: 'wf.release', name: 'release.yml', branch: 'main', readiness: 'failing', lastRun: { id: 'run.8836', result: 'failure', when: '2026-08-04T22:10:00-07:00', failedJob: 'sign-artifacts' } }
      ],
      runs: [
        {
          id: 'run.8841', workflow: 'ci.yml', result: 'success', when: '2026-08-05T11:30:00-07:00', durationS: 412,
          jobs: [
            { name: 'lint', status: 'success', durationS: 64 },
            { name: 'test', status: 'success', durationS: 231 },
            { name: 'build', status: 'success', durationS: 117 }
          ],
          logExcerpt: ['test: 148 passed, 0 failed', 'build: bundle 4.1 MB', 'done in 6m52s']
        },
        {
          id: 'run.8836', workflow: 'release.yml', result: 'failure', when: '2026-08-04T22:10:00-07:00', durationS: 233,
          jobs: [
            { name: 'build', status: 'success', durationS: 118 },
            { name: 'sign-artifacts', status: 'failure', durationS: 41 },
            { name: 'publish', status: 'skipped', durationS: 0 }
          ],
          logExcerpt: ['sign-artifacts: signing key expired 2026-08-01', 'error: exit 1', 'publish skipped']
        },
        {
          id: 'run.8829', workflow: 'ci.yml', result: 'success', when: '2026-08-04T09:02:00-07:00', durationS: 397,
          jobs: [
            { name: 'lint', status: 'success', durationS: 61 },
            { name: 'test', status: 'success', durationS: 222 },
            { name: 'build', status: 'success', durationS: 114 }
          ],
          logExcerpt: ['test: 148 passed, 0 failed']
        }
      ],
      starterOffer: { template: 'node-ci', note: 'No workflow yet on a branch? Start from the node-ci starter and adjust.' }
    },

    containers: {
      resources: [
        {
          id: 'ctr.docker',
          name: 'Docker',
          state: 'ready',
          hostId: 'host.home-truenas',
          summary: 'Ready on Home TrueNAS',
          detail: {
            engine: '29.0.1', cli: '29.0.1', compose: 'v2.42.0', buildx: 'v0.19.2',
            socket: '/var/run/docker.sock', socketState: 'reachable'
          }
        },
        {
          id: 'ctr.podman',
          name: 'Podman',
          state: 'not-installed',
          hostId: 'host.win-desktop',
          summary: 'Not installed on this computer',
          installOffer: { label: 'Install Podman', note: 'Installs from the official source into the exact selected host. Optional; Docker on the Home Server already covers container work.' }
        },
        {
          id: 'ctr.k8s',
          name: 'Kubernetes tools',
          state: 'partial',
          hostId: 'host.home-truenas',
          summary: 'kubectl ready \u00b7 Helm not installed',
          detail: {
            kubectl: { state: 'ready', version: '1.34.1' },
            helm: { state: 'not-installed', installOffer: { label: 'Install Helm', note: 'Only needed for chart-based deploys.' } }
          }
        }
      ],
      clusters: [
        { id: 'k8s.home', name: 'home-k3s', state: 'reachable', kubeconfigContexts: [ { name: 'k3s-home', current: true }, { name: 'docker-desktop', current: false } ] }
      ],
      registries: [
        { id: 'reg.ghcr', url: 'ghcr.io/platyr', state: 'ready', auth: 'GitHub token (vault reference)' },
        { id: 'reg.unraid', url: 'registry.unraid.lan:5000', state: 'cert-warning', authNote: 'Self-signed certificate is not in the trust store. Add the CA or mark this registry as trusted for the LAN only.' }
      ],
      unraidPublishing: { server: 'Unraid Tower', state: 'connected', templates: 2, note: 'Two PM app templates are published to the Unraid community feed.' }
    },

    webResearch: {
      providers: [
        { id: 'web.brave', name: 'Brave Search', kind: 'search', priority: 1, state: 'ready', credits: { used: 640, total: 2000, unit: 'queries' }, guard: { warnAtPct: 80, stopAtPct: 100, state: 'ok' } },
        { id: 'web.kagi', name: 'Kagi', kind: 'search', priority: 2, state: 'needs-setup', setupNote: 'Add the API key reference to enable the fallback search route.' },
        { id: 'web.firecrawl', name: 'Firecrawl', kind: 'crawl-extract', priority: 1, state: 'ready', credits: { used: 910, total: 1000, unit: 'credits' }, guard: { warnAtPct: 80, stopAtPct: 100, state: 'warning', note: '91% of monthly credits used. Crawls pause at 100%; fetch keeps working.' } },
        { id: 'web.pm-fetch', name: 'PM Fetch', kind: 'fetch', priority: 1, state: 'ready', builtIn: true }
      ],
      limits: { fetchMaxMB: 25, crawlDepth: 3, mapMaxPages: 200, extractMaxPages: 40 },
      caches: { sizeMB: 320, ttlHours: 72, lastCleared: '2026-07-21T09:00:00-07:00' },
      browserSessions: {
        program: 'PM Browser Program',
        expert: 'Expert Browser Program',
        authSession: { protection: 'human-only', agentVisibility: 'none', note: 'A protected sign-in session is human-only. Agents can never inspect its pages, screenshots, console, or network.' }
      },
      proxy: 'system',
      certificates: [ { id: 'ca.lan', name: 'Platyr LAN CA', added: '2026-05-10' } ],
      airgap: 'off'
    },

    searchIndex: {
      enabled: true,
      phase: 'ready',
      progress: null,
      lastBuild: '2026-08-05T06:12:00-07:00',
      files: 14382,
      diskMB: 412,
      exclusions: ['node_modules', 'target', '.pm-vault', '*.mp4'],
      largeFilePolicy: { maxMB: 8 },
      symlinkPolicy: 'skip',
      remoteCache: { state: 'ready', hostId: 'host.home-truenas' },
      failures: [
        { path: 'assets/font-pack.bin', reason: 'Binary detection failed; skipped.' }
      ]
    },

    cleanup: {
      categories: [
        { id: 'cl.worktrees', label: 'Stale worktrees', count: 2, sizeMB: 840, safety: '1 of 3 worktrees is leased and protected.' },
        { id: 'cl.snapshots', label: 'Old recovery snapshots', count: 9, sizeMB: 1200, safety: null },
        { id: 'cl.artifacts', label: 'Orphaned artifacts', count: 5, sizeMB: 356, safety: null },
        { id: 'cl.caches', label: 'Caches', count: 1, sizeMB: 2300, safety: null }
      ],
      dryRun: {
        last: {
          when: '2026-08-04T08:00:00-07:00',
          wouldFreeMB: 2100,
          skipped: [ { ref: 'wt.goal-142', reason: 'Leased by Goal #142; never touched by cleanup.' } ],
          receiptId: 'rcpt.cleanup.dry.0804'
        },
        note: 'A dry run only reports. Nothing is deleted until you apply, and leased items are always skipped.'
      }
    },

    bsd: {
      mode: 'auto',
      modes: [
        { id: 'off', label: 'Off', note: 'The Back Seat Driver never runs.' },
        { id: 'auto', label: 'Auto', note: 'Runs only when risk or phase triggers justify it. This is the default.' },
        { id: 'on', label: 'On', note: 'May inspect every turn within its privacy boundary.' }
      ],
      route: { requestedClass: 'fast-local', effective: 'Claude Haiku 4.5', why: 'The fast-local class resolved to the cheapest ready route with tool support.' },
      triggers: { risk: ['file delete', 'force push', 'credential touch'], phases: ['merge', 'deploy'] },
      usageGuard: { maxPctOfRun: 5 },
      latencyBudgetMs: 800,
      privacyBoundary: 'bounded-deltas',
      privacyNote: 'BSD receives bounded deltas of the primary work, not the whole context.',
      toolAccess: 'read-only',
      health: { state: 'ok', lastFailure: null, cannotBlockPrimary: true, note: 'Read-only by default; it cannot widen authority, and primary work never blocks merely because BSD failed.' },
      chatOverride: ['one turn', 'this thread']
    },

    goalDefaults: {
      checkpointPolicy: 'every-phase',
      pauseResume: 'checkpoint-safe',
      verificationStrength: 'standard',
      fanOut: { sustainable: 3, ceiling: 6 },
      capacityReserve: '20%',
      planningRoute: { class: 'high-quality', requested: 'Claude Opus 4.1', effective: 'Claude Sonnet 4.5', why: 'Personal Max included usage is exhausted until 4:00 PM.' },
      workerRouteClass: 'balanced',
      reviewerRouteClass: 'fast-local',
      crossProject: 'ask',
      worktreePolicy: 'auto-per-goal',
      testingDefaultsRef: 'testingDebug',
      boundaryNote: 'Settings owns defaults and ceilings. Usage reports current capacity; the Orchestrator admits actual work.'
    },

    permissionsModel: {
      accessProfile: 'ask',
      accessProfiles: [
        { id: 'ask', label: 'Ask for approval' },
        { id: 'auto-edits', label: 'Auto accept edits' },
        { id: 'auto', label: 'Auto' },
        { id: 'full', label: 'Full Access' }
      ],
      planReviewNote: 'Plan and Review are effect-limited, not tool-free: safe read, browser, research, testing, and diagnostic operations stay available.',
      rules: [
        { n: 1, tool: '*', match: '*', decision: 'ask', origin: 'global default', scope: 'global', locked: true, note: 'The wildcard floor. Everything not matched below asks first.' },
        { n: 2, tool: 'file.read', match: '**', decision: 'allow', origin: 'preset: developer', scope: 'global' },
        { n: 3, tool: 'file.write', match: 'src/**', decision: 'allow', origin: 'you', scope: 'project' },
        { n: 4, tool: 'shell.exec', match: 'git *', decision: 'allow', origin: 'you', scope: 'project' },
        { n: 5, tool: 'shell.exec', match: 'git push --force*', decision: 'deny', origin: 'preset: safety', scope: 'global' },
        { n: 6, tool: 'web.fetch', match: '*.internal.platyr.net', decision: 'deny', origin: 'workspace policy', scope: 'global', managed: true, managedReason: 'Managed by workspace policy' },
        { n: 7, tool: 'shell.exec', match: 'rm -rf *', decision: 'deny', origin: 'preset: safety', scope: 'global' }
      ],
      evaluationTrace: {
        input: 'shell.exec: git push --force origin main',
        matches: [1, 4, 5],
        winner: 5,
        explanation: 'Rules 1, 4, and 5 match. The last matching rule wins, so rule 5 denies the command.'
      },
      presets: ['read-only', 'developer', 'full-matrix'],
      perPersona: [
        { personaId: 'p-patch-auditor', profile: 'read-only', delta: 'May also run the test suite.' },
        { personaId: 'p-teacher', profile: 'read-only', delta: null }
      ],
      scopes: ['global', 'project', 'package', 'seam', 'lane'],
      requestedEffective: {
        example: { rule: 'file.write on docs/**', requested: 'allow', effective: 'deny', origin: 'workspace policy', note: 'Your rule requests allow, but the managed workspace rule decides.' }
      },
      views: ['eli5', 'expert'],
      fileSafe: {
        state: 'healthy',
        floor: 'non-bypassable',
        floorNote: 'FileSafe is the floor under every permission rule. No profile, Persona, or rule can widen it.',
        protectedScopes: ['/etc', '~/.ssh', '/mnt/projects/.pm-vault'],
        externalAllowlist: [
          { path: '/mnt/media-in', mode: 'read-only', added: '2026-06-14' }
        ],
        repair: { needed: false, guidance: 'If the boundary ever reports unhealthy, repair re-derives it from the project map. No bypass is offered.' }
      },
      doomLoop: { threshold: 3, action: 'pause-and-ask', lastTrip: null, note: 'Three denied retries of the same operation pause the run and ask you.' }
    }
  };

  /* =====================================================================
     3. NEW SETTINGS ROWS + TAXONOMY GRAFTS + EXISTING-ROW AMENDMENTS.
     ===================================================================== */

  var NEW_SETTINGS = {
    'general.sounds.master-enabled': {
      id: 'general.sounds.master-enabled',
      label: 'Play Notification Sounds',
      desc: 'The master switch for every notification sound. Individual event mappings live in the Sounds manager.',
      type: 'toggle', 'default': true, scope: ['global'],
      exposure: 'standard', valueSource: 'default', flags: {},
      search: ['sound', 'sounds', 'mute', 'audio alerts', 'notifcations'],
      src: 'packet-2026-08-08', value: true
    },
    'general.sounds.master-volume': {
      id: 'general.sounds.master-volume',
      label: 'Sound Volume',
      desc: 'How loud notification sounds play, relative to system volume.',
      type: 'slider', 'default': 70, scope: ['global'],
      exposure: 'standard', valueSource: 'default', flags: {},
      search: ['volume', 'loudness', 'quiet'],
      src: 'packet-2026-08-08', value: 70
    },
    'general.sounds.quiet-hours': {
      id: 'general.sounds.quiet-hours',
      label: 'Quiet Hours',
      labelLocalized: { de: 'Benachrichtigungs-Ruhezeiten und Zustellungsunterdr\u00fcckungszeitfenster' },
      desc: 'A daily window when non-critical notifications hold their sound and stay in the inbox.',
      type: 'text', 'default': '', scope: ['global'],
      exposure: 'standard', valueSource: 'custom', flags: {},
      search: ['quiet hours', 'do not disturb', 'focus'],
      src: 'packet-2026-08-08', value: '10:00 PM \u2013 7:30 AM'
    },
    'general.desktop.minimize-to-tray': {
      id: 'general.desktop.minimize-to-tray',
      label: 'Minimize To Tray',
      desc: 'Minimizing hides the window into the tray instead of the taskbar. Automation keeps running either way.',
      type: 'toggle', 'default': true, scope: ['global'],
      exposure: 'standard', valueSource: 'default', flags: {},
      search: ['tray', 'minimize', 'background'],
      src: 'packet-2026-08-08', value: true
    },
    'general.desktop.close-to-tray': {
      id: 'general.desktop.close-to-tray',
      label: 'Close Button Hides To Tray',
      desc: 'The close button hides the window instead of quitting while automation runs. Quit stays in the tray menu.',
      type: 'toggle', 'default': false, scope: ['global'],
      exposure: 'standard', valueSource: 'custom', flags: {},
      search: ['close', 'quit', 'tray', 'exit'],
      src: 'packet-2026-08-08', value: false
    },
    'planning.bsd.mode': {
      id: 'planning.bsd.mode',
      label: 'Back Seat Driver',
      desc: 'A read-only reviewer that watches risky moments. Auto runs it only when risk or phase triggers justify it; On may inspect every turn.',
      type: 'radio', 'default': 'Auto', scope: ['global', 'project'],
      exposure: 'standard', valueSource: 'default', flags: {},
      search: ['bsd', 'back seat driver', 'reviewer', 'second opinion'],
      src: 'packet-2026-08-08',
      options: ['Off', 'Auto', 'On'], value: 'Auto'
    },
    'system.storage.evidence-retention': {
      id: 'system.storage.evidence-retention',
      label: 'Run Evidence Retention',
      desc: 'How long run evidence and receipts are kept before normal expiry. Evidence is what lets Puppet Master show, months later, exactly which command ran, which permission rule allowed it, which model generation produced a change, and which verification passed before a merge. Shorter retention saves disk on the vault dataset but weakens that audit trail; anything pinned by a legal hold ignores this limit entirely and stays until the hold is lifted by the person who placed it.',
      type: 'number', 'default': 90, scope: ['global'],
      exposure: 'standard', valueSource: 'default', flags: {},
      search: ['retention', 'evidence', 'receipts', 'audit'],
      src: 'packet-2026-08-08', value: 90
    },
    'system.storage.pressure-action': {
      id: 'system.storage.pressure-action',
      label: 'When Storage Runs Low',
      desc: 'What happens when the vault dataset crosses the pressure threshold.',
      type: 'select', 'default': 'Compact when idle', scope: ['global'],
      exposure: 'standard', valueSource: 'default', flags: {},
      search: ['disk', 'pressure', 'full', 'space'],
      src: 'packet-2026-08-08',
      options: ['Compact when idle', 'Warn only', 'Pause new artifact writes'],
      value: 'Compact when idle'
    },
    'system.backup.project-schedule': {
      id: 'system.backup.project-schedule',
      label: 'Project Backup Schedule',
      desc: 'How often the project backup runs. Full Server backups are scheduled by the server itself.',
      type: 'select', 'default': 'Weekly', scope: ['project'],
      exposure: 'standard', valueSource: 'default', flags: {},
      search: ['backup', 'schedule', 'weekly'],
      src: 'packet-2026-08-08',
      options: ['Daily', 'Weekly', 'Monthly', 'Manual only'],
      value: 'Weekly'
    },
    'system.maintenance.import-export': {
      id: 'system.maintenance.import-export',
      label: 'Settings Import & Export',
      desc: 'Export a portable settings file, or import one with a full preview, a restore point, and one-click rollback.',
      type: 'action', 'default': null, scope: ['global', 'project'],
      exposure: 'standard', valueSource: 'default', flags: {},
      search: ['import', 'export', 'transfer', 'migrate', 'settings file'],
      src: 'packet-2026-08-08', value: 'Open'
    },
    'system.health.diagnostics-verbosity': {
      id: 'system.health.diagnostics-verbosity',
      label: 'Diagnostics Detail Level',
      desc: 'How much detail diagnostics pages and receipts include. The deep-link probe target for this bakeoff.',
      type: 'select', 'default': 'Standard', scope: ['global'],
      exposure: 'standard', valueSource: 'default', flags: {},
      search: ['diagnostics', 'verbosity', 'logs', 'deep link probe'],
      src: 'packet-2026-08-08',
      options: ['Errors only', 'Standard', 'Verbose'],
      value: 'Standard'
    },
    'extensions.web.fetch-size-limit': {
      id: 'extensions.web.fetch-size-limit',
      label: 'Largest Fetch Size',
      desc: 'The biggest single page or file a fetch will download, in megabytes.',
      type: 'number', 'default': 25, scope: ['global', 'project'],
      exposure: 'advanced', valueSource: 'custom', flags: {},
      search: ['fetch limit', 'download size', 'web'],
      src: 'packet-2026-08-08',
      value: 999999,
      validationError: 'Enter a size between 1 and 512 MB.'
    },
    'extensions.mcp.default-transport': {
      id: 'extensions.mcp.default-transport',
      label: 'Preferred Server Transport',
      desc: 'Which transport new server connections try first. Changing it reconnects existing servers.',
      type: 'select', 'default': 'Auto', scope: ['global'],
      exposure: 'advanced', valueSource: 'custom',
      flags: { reconnect: true },
      reconnectPending: true,
      search: ['transport', 'stdio', 'http', 'sse', 'mcp'],
      src: 'packet-2026-08-08',
      options: ['Auto', 'stdio', 'http', 'sse'],
      value: 'http'
    },
    'code.formatters.format-on-save': {
      id: 'code.formatters.format-on-save',
      label: 'Format On Save',
      desc: 'Runs the matching formatter every time a file is saved. Individual formatters are managed below.',
      type: 'toggle', 'default': true, scope: ['global', 'project'],
      exposure: 'standard', valueSource: 'default', flags: {},
      search: ['format', 'prettier', 'on save', 'formatter'],
      src: 'packet-2026-08-08', value: true
    }
  };

  /* Sub-grafts: where the new manager families live in the left navigation. */
  var TAXONOMY_GRAFTS = [
    { domainId: 'general', afterSub: 'notifications', sub: { id: 'sounds', title: 'Sounds & alerts', blurb: 'The sound library, event mappings, and quiet hours.', settingIds: ['general.sounds.master-enabled', 'general.sounds.master-volume', 'general.sounds.quiet-hours'] } },
    { domainId: 'general', afterSub: 'sounds', sub: { id: 'desktop', title: 'Desktop, tray & windows', blurb: 'Tray behavior, launch, and crash recovery.', settingIds: ['general.desktop.minimize-to-tray', 'general.desktop.close-to-tray'] } },
    { domainId: 'general', afterSub: 'writing', sub: { id: 'help', title: 'Teacher & help', blurb: 'Guided explanations that can hand off into real actions.', settingIds: [] } },
    { domainId: 'code', afterSub: 'language', sub: { id: 'formatters', title: 'Formatters', blurb: 'Which formatter runs for each file type, and when.', settingIds: ['code.formatters.format-on-save'] } },
    { domainId: 'planning', afterSub: 'verification', sub: { id: 'bsd', title: 'Back Seat Driver', blurb: 'The read-only reviewer for risky moments.', settingIds: ['planning.bsd.mode'] } },
    { domainId: 'collaboration', afterSub: 'git', sub: { id: 'actions', title: 'GitHub Actions', blurb: 'Pinned workflows and current-branch readiness.', settingIds: [] } },
    { domainId: 'extensions', afterSub: 'web', sub: { id: 'web-limits', title: 'Fetch & crawl limits', blurb: 'Size caps, credit guards, and caches.', settingIds: ['extensions.web.fetch-size-limit'] } },
    { domainId: 'extensions', afterSub: 'mcp', sub: { id: 'mcp-advanced', title: 'Server connection defaults', blurb: 'Transport preferences and reconnect behavior.', settingIds: ['extensions.mcp.default-transport'] } },
    { domainId: 'system', afterSub: 'health', sub: { id: 'storage', title: 'Storage & retention', blurb: 'The vault, retention classes, pressure, and quarantine.', settingIds: ['system.storage.evidence-retention', 'system.storage.pressure-action'] } },
    { domainId: 'system', afterSub: 'storage', sub: { id: 'backup', title: 'Backup & restore', blurb: 'Four distinct backup kinds and test restores.', settingIds: ['system.backup.project-schedule'] } },
    { domainId: 'system', afterSub: 'backup', sub: { id: 'history-sessions', title: 'History & sessions', blurb: 'Session list, export, compare, and archive policy.', settingIds: [] } },
    { domainId: 'system', afterSub: 'history-sessions', sub: { id: 'artifacts', title: 'Runtime artifacts', blurb: 'What runs produced, where it lives, and how long it stays.', settingIds: [] } },
    { domainId: 'system', afterSub: 'artifacts', sub: { id: 'search-index', title: 'Project search index', blurb: 'Indexing, exclusions, disk use, and rebuilds.', settingIds: [] } },
    { domainId: 'system', afterSub: 'search-index', sub: { id: 'cleanup', title: 'Workspace cleanup', blurb: 'Reclaim space safely, dry run first.', settingIds: [] } },
    { domainId: 'system', afterSub: 'cleanup', sub: { id: 'servers', title: 'Servers & remote', blurb: 'The Home Server, execution hosts, and reserved future destinations.', settingIds: [] } },
    { domainId: 'system', afterSub: 'maintenance', sub: { id: 'settings-lifecycle', title: 'Settings lifecycle', blurb: 'Export, import with preview and rollback, and reset.', settingIds: ['system.maintenance.import-export'] } }
  ];

  /* Amendments to existing rows (fixture states + typo synonyms). */
  var ROW_AMENDMENTS = [
    { id: 'general.interaction.notifications-enabled', patch: { search: ['+', 'notifcations'] } },
    { id: 'general.visual.theme', patch: { search: ['+', 'apperance'] } },
    { id: 'general.visual.ui-scale', patch: { restartPending: true, flags: { restart: true } } },
    { id: 'general.startup.restore-panel', patch: { valueSource: 'custom', value: 'Chat', changedElsewhere: { by: 'MacBook Air', when: '2026-08-05T13:05:00-07:00' } } },
    { id: 'general.interaction.auto-follow', patch: { changedElsewhere: { by: 'MacBook Air', when: '2026-08-05T13:06:00-07:00' } } }
  ];

  /* =====================================================================
     4. APPLY — pure data merging; nothing here touches the DOM.
     ===================================================================== */

  function findById(list, id) {
    if (!Array.isArray(list)) { return null; }
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) { return list[i]; }
    }
    return null;
  }

  // 4.1 New top-level collections.
  Object.keys(EXT).forEach(function (key) {
    D[key] = EXT[key];
  });
  D.freeCatalog = FREE_CATALOG;
  D.packetVersion = '2026-08-08';

  // 4.2 Provider upgrades.
  (D.providers || []).forEach(function (p) {
    if (!p) { return; }
    if (AUTH_BOUNDARY[p.id]) { p.authBoundary = AUTH_BOUNDARY[p.id]; }
    if (INSTALLATIONS[p.id]) { p.installations = INSTALLATIONS[p.id]; }
    if (p.id === 'cursor-cli') { p.setupOffer = CURSOR_SETUP_OFFER; }
    if (p.id === 'local-ollama') {
      p.usageDetails = {
        state: 'unavailable',
        reason: 'This server does not report usage totals. Provider readiness is unaffected.'
      };
    }
  });
  if (!findById(D.providers, 'opencode')) {
    D.providers.push(OPENCODE_PROVIDER);
  }

  // 4.3 Free-route states + a Fast-mode evidence pairing on existing models.
  (D.freeRoutes || []).forEach(function (r) {
    var st = r && FREE_ROUTE_STATES[r.id];
    if (st) { r.state = st.state; r.stateNote = st.stateNote; }
  });
  (D.providers || []).forEach(function (p) {
    (p && p.models || []).forEach(function (m) {
      if (!m) { return; }
      if (m.fast === true && !findEvidence(m, 'fast-mode')) {
        m.evidence = m.evidence || [];
        m.evidence.push({ cap: 'fast-mode', state: 'supported', source: 'observed fast-mode generation', at: '2026-08-04T16:22:00-07:00' });
      }
      if (m.fast === false && m.id === 'claude-haiku-4-5') {
        m.fastNote = 'Fast mode is not offered on this route. Capability comes from the catalog, never inferred from the name.';
      }
    });
  });
  function findEvidence(model, cap) {
    var ev = model.evidence || [];
    for (var i = 0; i < ev.length; i++) { if (ev[i] && ev[i].cap === cap) { return ev[i]; } }
    return null;
  }

  // 4.4 A role that shows requested vs effective with an honest fallback reason.
  if (Array.isArray(D.roles) && !findById(D.roles, 'role-batch-reviewer')) {
    D.roles.push({
      id: 'role-batch-reviewer',
      label: 'Batch reviewer',
      assignedRoute: 'Claude Opus 4.1 on Personal Max',
      requestedRoute: 'Claude Opus 4.1 \u00b7 Personal Max',
      effectiveRoute: 'Claude Sonnet 4.5 \u00b7 Platyr Team',
      fallbackReason: 'Personal Max included usage is exhausted until 4:00 PM; the continuation policy falls through to the next enabled account.',
      quality: 'high',
      note: 'Reviews finished batches before merge. Requested and effective routes differ right now; the reason is shown, not hidden.'
    });
  }

  // 4.5 New settings rows + taxonomy grafts.
  Object.keys(NEW_SETTINGS).forEach(function (id) {
    if (!D.settings[id]) { D.settings[id] = NEW_SETTINGS[id]; }
  });
  TAXONOMY_GRAFTS.forEach(function (graft) {
    var dom = findById(D.taxonomy, graft.domainId);
    if (!dom || !Array.isArray(dom.subs)) { return; }
    if (findById(dom.subs, graft.sub.id)) { return; }
    var at = dom.subs.length;
    for (var i = 0; i < dom.subs.length; i++) {
      if (dom.subs[i] && dom.subs[i].id === graft.afterSub) { at = i + 1; break; }
    }
    dom.subs.splice(at, 0, graft.sub);
  });

  /* Rows that belong in EXISTING subs (idempotent append). */
  [
    { domainId: 'system', subId: 'health', settingId: 'system.health.diagnostics-verbosity' }
  ].forEach(function (ph) {
    var dom = findById(D.taxonomy, ph.domainId);
    var sub = dom && findById(dom.subs, ph.subId);
    if (sub && Array.isArray(sub.settingIds) && sub.settingIds.indexOf(ph.settingId) < 0) {
      sub.settingIds.push(ph.settingId);
    }
  });

  // 4.6 Existing-row amendments (fixture states + typo synonyms).
  ROW_AMENDMENTS.forEach(function (am) {
    var row = D.settings[am.id];
    if (!row) { return; }
    Object.keys(am.patch).forEach(function (k) {
      var v = am.patch[k];
      if (k === 'search' && Array.isArray(v) && v[0] === '+') {
        row.search = (row.search || []).concat(v.slice(1));
      } else if (k === 'flags' && row.flags && typeof v === 'object') {
        Object.keys(v).forEach(function (fk) { row.flags[fk] = v[fk]; });
      } else {
        row[k] = v;
      }
    });
  });
})();
