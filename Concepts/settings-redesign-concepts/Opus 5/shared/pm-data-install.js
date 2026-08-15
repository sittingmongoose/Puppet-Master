/* Opus 5 — provider installation, authentication and update fixtures.
 *
 * Loads after pm-data.js and before pm-data-seal.js. It contributes the layer
 * pm-data.js deliberately does not model: the ProviderInstallation objects that
 * sit BETWEEN a provider family and its accounts.
 *
 * The distinction this file exists to make honest:
 *
 *   ProviderFamily -> ProviderInstallation[] -> AuthProfile[] -> Account ->
 *   Connection -> Product -> Model[]
 *
 * Updating an account is not a meaningful operation. Puppet Master updates one
 * INSTALLATION and then revalidates every profile, account, connection and
 * model route that depended on it. Every record below therefore carries its own
 * resolution chain, ownership evidence, confidence and duplicate state, and no
 * record claims a live probe: each one is dated fixture data whose actions run
 * through PMSim receipts.
 *
 * Vocabulary is taken verbatim from the provider identification / installation /
 * authentication / update handoff, sections 4.3 (owner kinds), 4.4 (evidence
 * order), 4.5 (confidence), 4.6 (duplicate states), 7 (readiness states),
 * 8.1 (update policy defaults), 9 (transactional state machine) and 15
 * (candidate runtime records).
 */
(function () {
  "use strict";

  var D = window.PMData;
  if (!D) return;

  /* ------------------------------------------------------- installations */

  D.installations.push(

    /* Fixture 1 — CLI found, authenticated, ready. Ownership is proven because
     * the npm installation database owns the exact resolved file. */
    {
      installationId: "inst-claude-npm",
      providerFamilyId: "claude",
      hostOrEnvironmentId: "host-this-computer",
      hostLabel: "This computer · macOS 15.4",
      configuredCommand: "claude",
      resolvedPath: "/Users/jared/.npm-global/bin/claude",
      realPath: "/Users/jared/.npm-global/lib/node_modules/@anthropic-ai/claude-code/bin/claude.js",
      launcherOrShimChain: [
        "PATH entry ~/.npm-global/bin",
        "symlink claude -> ../lib/node_modules/@anthropic-ai/claude-code/bin/claude.js",
        "node shebang /usr/local/bin/node (v22.11.0)"
      ],
      architecture: "arm64",
      installationOwnerKind: "npm_global",
      ownerIdentity: "@anthropic-ai/claude-code@2.14.0",
      managerRootOrProfile: "npm prefix ~/.npm-global",
      channel: "npm dist-tag latest",
      currentVersion: "2.14.0",
      targetVersion: "2.14.0",
      compatibleVersionRange: ">= 2.10.0 and < 3.0.0",
      versionPolicy: "Latest compatible",
      updatePolicy: { check: "Automatic", install: "Ask first", rollback: "On" },
      confidence: "proven",
      detectionEvidence: [
        { order: 1, source: "Package database", statement: "npm ls -g reports @anthropic-ai/claude-code owns this exact file." },
        { order: 2, source: "Provider metadata", statement: "claude --version reports 2.14.0 from the same real path." },
        { order: 3, source: "Agreement check", statement: "Package identity, manager root, executable path and version all agree." }
      ],
      duplicateState: "Used by Puppet Master",
      dependentProfileIds: ["claude-work", "claude-personal"],
      activeSessionIds: ["thread-4821"],
      healthState: "Healthy",
      readinessState: "Ready",
      lastCheckedAt: "11 minutes ago",
      lastUpdatedAt: "6 days ago",
      lastGoodVersion: "2.13.4",
      lastGoodGenerationRef: "gen-claude-2.13.4",
      manualOnlyReason: null
    },

    /* Fixture 3 — a second installation of the same family. It is older and it
     * is earlier on PATH, so a naive resolver would rebind to it after a shell
     * change. Puppet Master stays bound to inst-claude-npm by installation id. */
    {
      installationId: "inst-claude-brew",
      providerFamilyId: "claude",
      hostOrEnvironmentId: "host-this-computer",
      hostLabel: "This computer · macOS 15.4",
      configuredCommand: "claude",
      resolvedPath: "/opt/homebrew/bin/claude",
      realPath: "/opt/homebrew/Cellar/claude-code/2.9.1/bin/claude",
      launcherOrShimChain: [
        "PATH entry /opt/homebrew/bin (position 1 — earlier than ~/.npm-global/bin)",
        "symlink claude -> ../Cellar/claude-code/2.9.1/bin/claude"
      ],
      architecture: "arm64",
      installationOwnerKind: "homebrew_formula",
      ownerIdentity: "claude-code 2.9.1 (tap: homebrew/core)",
      managerRootOrProfile: "Homebrew prefix /opt/homebrew",
      channel: "Homebrew stable",
      currentVersion: "2.9.1",
      targetVersion: null,
      compatibleVersionRange: ">= 2.10.0 and < 3.0.0",
      versionPolicy: "Latest compatible",
      updatePolicy: { check: "Manual", install: "Never", rollback: "Unavailable" },
      confidence: "probable",
      detectionEvidence: [
        { order: 1, source: "Package database", statement: "Homebrew reports a claude-code keg at this prefix, but the receipt predates the current file timestamp." },
        { order: 2, source: "PATH scan", statement: "Found on PATH at position 1, ahead of the selected installation." },
        { order: 3, source: "Version comparison", statement: "2.9.1 is below the compatible range this build requires, so it is an older duplicate. It also shadows the selected installation, because PATH order alone would resolve to it." }
      ],
      duplicateState: "Older duplicate",
      dependentProfileIds: [],
      activeSessionIds: [],
      healthState: "Reachable, not used",
      readinessState: "Found — not selected",
      lastCheckedAt: "11 minutes ago",
      lastUpdatedAt: "4 months ago",
      lastGoodVersion: "2.9.1",
      lastGoodGenerationRef: null,
      manualOnlyReason: "Puppet Master will not update an installation it did not select. Choose it first, or remove the duplicate with Homebrew."
    },

    /* Host/environment separation. WSL is optional and this installation is not
     * a duplicate of the macOS one: it is a different execution boundary. */
    {
      installationId: "inst-claude-wsl",
      providerFamilyId: "claude",
      hostOrEnvironmentId: "host-wsl-ubuntu",
      hostLabel: "WSL · Ubuntu 24.04 (optional environment)",
      configuredCommand: "claude",
      resolvedPath: "/home/jared/.local/share/npm/bin/claude",
      realPath: "/home/jared/.local/share/npm/lib/node_modules/@anthropic-ai/claude-code/bin/claude.js",
      launcherOrShimChain: [
        "WSL login-shell PATH entry ~/.local/share/npm/bin",
        "symlink claude -> ../lib/node_modules/@anthropic-ai/claude-code/bin/claude.js"
      ],
      architecture: "x86_64",
      installationOwnerKind: "npm_global",
      ownerIdentity: "@anthropic-ai/claude-code@2.14.0",
      managerRootOrProfile: "npm prefix ~/.local/share/npm",
      channel: "npm dist-tag latest",
      currentVersion: "2.14.0",
      targetVersion: "2.14.0",
      compatibleVersionRange: ">= 2.10.0 and < 3.0.0",
      versionPolicy: "Latest compatible",
      updatePolicy: { check: "Automatic", install: "Ask first", rollback: "On" },
      confidence: "strongly_identified",
      detectionEvidence: [
        { order: 1, source: "Package database", statement: "The WSL npm root owns this file; the Windows and WSL roots are separate inventories." },
        { order: 2, source: "Host boundary", statement: "Discovery ran inside the WSL environment, which is the host that would execute it." },
        { order: 3, source: "Architecture", statement: "x86_64 here, arm64 on the macOS host — the two are not interchangeable." }
      ],
      duplicateState: "Different host/environment",
      dependentProfileIds: [],
      activeSessionIds: [],
      healthState: "Healthy",
      readinessState: "Found — not selected",
      lastCheckedAt: "2 hours ago",
      lastUpdatedAt: "6 days ago",
      lastGoodVersion: "2.13.4",
      lastGoodGenerationRef: "gen-claude-wsl-2.13.4",
      manualOnlyReason: null
    },

    /* Fixture 4 — a bare path is not proof of a package manager. This one stays
     * manual-only rather than being "helpfully" updated through npm. */
    {
      installationId: "inst-codex-standalone",
      providerFamilyId: "openai",
      hostOrEnvironmentId: "host-this-computer",
      hostLabel: "This computer · macOS 15.4",
      configuredCommand: "/usr/local/bin/codex",
      resolvedPath: "/usr/local/bin/codex",
      realPath: "/usr/local/bin/codex",
      launcherOrShimChain: ["No symlink, wrapper or shim — the configured command is the executable"],
      architecture: "arm64",
      installationOwnerKind: "unknown",
      ownerIdentity: "No package database or provider metadata claims this file",
      managerRootOrProfile: "None found",
      channel: "Unknown",
      currentVersion: "0.144.0",
      targetVersion: null,
      compatibleVersionRange: ">= 0.140.0 and < 1.0.0",
      versionPolicy: "Pinned",
      updatePolicy: { check: "Off", install: "Never", rollback: "Unavailable" },
      confidence: "unknown",
      detectionEvidence: [
        { order: 1, source: "Package database", statement: "npm, Homebrew, pnpm, Bun and pipx inventories were queried; none owns /usr/local/bin/codex." },
        { order: 2, source: "Provider metadata", statement: "codex --version answers, but reports no installation manifest." },
        { order: 3, source: "Path layout", statement: "A file in /usr/local/bin is not evidence of npm or Homebrew ownership, so no owner is inferred." }
      ],
      duplicateState: "Unknown owner",
      dependentProfileIds: ["openai-oauth"],
      activeSessionIds: [],
      healthState: "Healthy",
      readinessState: "Ready",
      lastCheckedAt: "2 hours ago",
      lastUpdatedAt: "Unknown",
      lastGoodVersion: "0.144.0",
      lastGoodGenerationRef: null,
      manualOnlyReason: "Puppet Master could not identify how this was installed, so it offers manual instructions only. Guessing npm or Homebrew here would update or create the wrong installation."
    },

    /* Fixture 6 — update available, Ask first. Ownership is strong enough to
     * update, and the plan is shown before anything is written. */
    {
      installationId: "inst-codex-brew",
      providerFamilyId: "openai",
      hostOrEnvironmentId: "host-this-computer",
      hostLabel: "This computer · macOS 15.4",
      configuredCommand: "codex",
      resolvedPath: "/opt/homebrew/bin/codex",
      realPath: "/opt/homebrew/Cellar/codex/0.146.1/bin/codex",
      launcherOrShimChain: [
        "PATH entry /opt/homebrew/bin",
        "symlink codex -> ../Cellar/codex/0.146.1/bin/codex"
      ],
      architecture: "arm64",
      installationOwnerKind: "homebrew_formula",
      ownerIdentity: "codex 0.146.1 (tap: openai/codex)",
      managerRootOrProfile: "Homebrew prefix /opt/homebrew",
      channel: "Homebrew stable",
      currentVersion: "0.146.1",
      targetVersion: "0.147.0",
      compatibleVersionRange: ">= 0.140.0 and < 1.0.0",
      versionPolicy: "Latest compatible",
      updatePolicy: { check: "Automatic", install: "Ask first", rollback: "On" },
      confidence: "strongly_identified",
      detectionEvidence: [
        { order: 1, source: "Package database", statement: "The Homebrew receipt owns this exact keg and file." },
        { order: 2, source: "Provider metadata", statement: "codex --version agrees with the keg version." },
        { order: 3, source: "Channel", statement: "Target 0.147.0 comes from the Homebrew formula, not from an npm dist-tag." }
      ],
      duplicateState: "Selected for this profile",
      dependentProfileIds: ["openai-oauth", "openai-api"],
      activeSessionIds: [],
      healthState: "Healthy",
      readinessState: "Update available",
      lastCheckedAt: "26 minutes ago",
      lastUpdatedAt: "12 days ago",
      lastGoodVersion: "0.146.1",
      lastGoodGenerationRef: "gen-codex-0.146.1",
      manualOnlyReason: null
    },

    /* Fixture 7 — update scheduled. The transaction is parked in
     * awaiting_authority_or_idle and names the work that is holding it. */
    {
      installationId: "inst-opencode-pm",
      providerFamilyId: "opencode",
      hostOrEnvironmentId: "host-orchard-server",
      hostLabel: "Home TrueNAS · Project Home Server",
      configuredCommand: "opencode",
      resolvedPath: "/var/lib/puppetmaster/provider-installations/opencode/current/bin/opencode",
      realPath: "/var/lib/puppetmaster/provider-installations/opencode/0.31.2/bin/opencode",
      launcherOrShimChain: [
        "Puppet Master generation link current -> 0.31.2",
        "No PATH dependency — the installation is bound by id, not by lookup order"
      ],
      architecture: "x86_64",
      installationOwnerKind: "pm_managed",
      ownerIdentity: "Puppet Master managed installation (side-by-side generations)",
      managerRootOrProfile: "/var/lib/puppetmaster/provider-installations/opencode",
      channel: "OpenCode stable",
      currentVersion: "0.31.2",
      targetVersion: "0.32.0",
      compatibleVersionRange: ">= 0.30.0 and < 0.33.0",
      versionPolicy: "Latest compatible",
      updatePolicy: { check: "Automatic", install: "Automatically when idle", rollback: "On" },
      confidence: "proven",
      detectionEvidence: [
        { order: 1, source: "Puppet Master registry", statement: "This installation was created by Puppet Master, so its ownership is recorded rather than inferred." },
        { order: 2, source: "Generation link", statement: "current resolves to the 0.31.2 generation directory." },
        { order: 3, source: "Adapter", statement: "The OpenCode adapter reports 0.32.0 as compatible with this build." }
      ],
      duplicateState: "Used by Puppet Master",
      dependentProfileIds: ["opencode-server"],
      activeSessionIds: ["goal-migration-114"],
      healthState: "Healthy",
      readinessState: "Update scheduled",
      lastCheckedAt: "34 minutes ago",
      lastUpdatedAt: "3 weeks ago",
      lastGoodVersion: "0.31.2",
      lastGoodGenerationRef: "gen-opencode-0.31.2",
      manualOnlyReason: null
    },

    /* Fixture 8 — the installer exited zero, verification failed, and rollback
     * succeeded. The previous version is the one actually running. */
    {
      installationId: "inst-gemini-npm",
      providerFamilyId: "gemini",
      hostOrEnvironmentId: "host-this-computer",
      hostLabel: "This computer · macOS 15.4",
      configuredCommand: "gemini",
      resolvedPath: "/Users/jared/.npm-global/bin/gemini",
      realPath: "/Users/jared/.npm-global/lib/node_modules/@google/gemini-cli/dist/index.js",
      launcherOrShimChain: [
        "PATH entry ~/.npm-global/bin",
        "symlink gemini -> ../lib/node_modules/@google/gemini-cli/dist/index.js",
        "node shebang /usr/local/bin/node (v22.11.0)"
      ],
      architecture: "arm64",
      installationOwnerKind: "npm_global",
      ownerIdentity: "@google/gemini-cli@0.9.4",
      managerRootOrProfile: "npm prefix ~/.npm-global",
      channel: "npm dist-tag latest",
      currentVersion: "0.9.4",
      targetVersion: "0.10.0",
      compatibleVersionRange: ">= 0.9.0 and < 0.11.0",
      versionPolicy: "Latest compatible",
      updatePolicy: { check: "Automatic", install: "Ask first", rollback: "On" },
      confidence: "proven",
      detectionEvidence: [
        { order: 1, source: "Package database", statement: "npm owns this exact file under the user npm prefix." },
        { order: 2, source: "Rollback receipt", statement: "The 0.9.4 generation was reinstalled from the npm cache after 0.10.0 failed verification." },
        { order: 3, source: "Provider metadata", statement: "gemini --version reports 0.9.4, matching the restored generation." }
      ],
      duplicateState: "Used by Puppet Master",
      dependentProfileIds: ["gemini-personal"],
      activeSessionIds: [],
      healthState: "Healthy on the previous version",
      readinessState: "Rolled back",
      lastCheckedAt: "38 minutes ago",
      lastUpdatedAt: "38 minutes ago",
      lastGoodVersion: "0.9.4",
      lastGoodGenerationRef: "gen-gemini-0.9.4",
      manualOnlyReason: null
    }
  );

  /* ---------------------------------------------------- update attempts */

  D.updateAttempts.push(
    {
      attemptId: "att-gemini-0100",
      installationId: "inst-gemini-npm",
      requestedTarget: "latest",
      effectiveTarget: "0.10.0",
      procedureId: "npm_global.update",
      policySource: "Installation policy · Install updates: Ask first",
      state: "rolled_back",
      preflightResults: [
        { check: "Installation identity unchanged since detection", result: "pass" },
        { check: "Adapter compatibility with 0.10.0", result: "pass", note: "Declared compatible at the time of the attempt." },
        { check: "npm root writable without elevation", result: "pass" },
        { check: "No active request bound to this installation", result: "pass" },
        { check: "Rollback path available", result: "pass", note: "0.9.4 present in the npm cache." }
      ],
      resourceLeaseIds: ["lease-install-inst-gemini-npm", "lease-npmroot-user"],
      startedAt: "38 minutes ago",
      installerFinishedAt: "37 minutes ago",
      verificationFinishedAt: "36 minutes ago",
      failureClass: "verification_failed",
      verificationResults: [
        { stage: "Configured command still resolves to the exact path", result: "pass" },
        { stage: "Real path still identifies the intended installation", result: "pass" },
        { stage: "Version is the accepted target", result: "pass", detail: "0.10.0 reported." },
        { stage: "Binary launches", result: "pass" },
        { stage: "Authentication profile is still recognised", result: "pass" },
        { stage: "Account identity unchanged", result: "pass" },
        { stage: "Model catalogue loads", result: "fail", detail: "The catalogue endpoint returned an empty model list for this account, so no route could have been served." },
        { stage: "Adapter protocol initialises", result: "fail", detail: "The adapter handshake rejected the 0.10.0 protocol revision." },
        { stage: "Required capabilities remain available", result: "not run", detail: "Skipped after the handshake failed." },
        { stage: "Dependent profiles and connections refresh", result: "not run", detail: "Skipped; the rollback ran instead." }
      ],
      rollbackState: "rolled_back_ok",
      logArtifactRef: "artifact-update-gemini-0100.log",
      receiptRef: "receipt-att-gemini-0100",
      summary: "The installer exited zero and the version string was correct. Two verification stages still failed, so 0.9.4 was reactivated and is the version running now."
    },
    {
      attemptId: "att-codex-01470",
      installationId: "inst-codex-brew",
      requestedTarget: "latest compatible",
      effectiveTarget: "0.147.0",
      procedureId: "homebrew_formula.upgrade",
      policySource: "System default · Install provider updates: Ask first",
      state: "update_available",
      preflightResults: [
        { check: "Installation identity unchanged since detection", result: "pass" },
        { check: "Current and target version and channel", result: "pass", note: "0.146.1 to 0.147.0 on the Homebrew stable channel, not an npm dist-tag." },
        { check: "Adapter compatibility and known-bad list", result: "pass", note: "0.147.0 is not on the known-bad list for this build." },
        { check: "Exact updater available", result: "pass", note: "brew upgrade openai/codex/codex" },
        { check: "Install-script policy", result: "pass" },
        { check: "Write permission without elevation", result: "pass" },
        { check: "Package-manager lock free", result: "pass" },
        { check: "Active provider processes", result: "pass", note: "No Codex session is bound to this installation right now." },
        { check: "Disk space", result: "pass", note: "42 GB free; the keg needs about 90 MB." },
        { check: "Network, registry, proxy and certificate path", result: "warn", note: "The corporate proxy is in use. The download will go through it and may be slower." },
        { check: "Organisation and project policy", result: "pass" },
        { check: "Rollback capability", result: "pass", note: "The 0.146.1 keg stays on disk and can be relinked." },
        { check: "Last known good generation recorded", result: "pass", note: "gen-codex-0.146.1" }
      ],
      resourceLeaseIds: [],
      startedAt: null,
      installerFinishedAt: null,
      verificationFinishedAt: null,
      failureClass: null,
      verificationResults: [],
      rollbackState: "available",
      logArtifactRef: null,
      receiptRef: null,
      summary: "Nothing has been written. Update opens the preflight results and the plan; installing is a separate, explicit decision."
    }
  );

  /* -------------------------------------------- bind installations to families */

  var BINDING = {
    claude: ["inst-claude-npm", "inst-claude-brew", "inst-claude-wsl"],
    openai: ["inst-codex-brew", "inst-codex-standalone"],
    antigravity: [],
    copilot: [],
    ollama: [],
    openrouter: [],
    free: []
  };

  D.providers.forEach(function (p) {
    p.installationIds = BINDING[p.id] || [];
  });

  /* ------------------------------------------------------- new provider */

  /* Fixtures 12 and 14 — an external OpenCode server. It is a server
   * connection, not a subscription and not an API-key product: the server owns
   * the upstream credentials and serves the model catalogue. It is Ready, and
   * its usage telemetry is unavailable, which are two separate facts. */
  D.providers.push({
    id: "opencode",
    name: "OpenCode",
    group: "Server connections",
    summary: "An external OpenCode server on the home network. It holds its own upstream provider credentials.",
    icon: "server",
    status: "ok",
    statusWord: "Ready — usage details unavailable",
    installed: true,
    version: "opencode 0.31.2 (Puppet Master managed)",
    isolation: "Server-owned credentials; Puppet Master holds only the endpoint and its own client token",
    credentialOwner: "External OpenCode server",
    endpoint: "https://opencode.orchard.internal",
    usageTelemetryState: "unavailable",
    oauthNote: "Puppet Master authenticates to the server, not to the upstream providers. Sign-in for those happens on the server and is not visible here.",
    keywords: ["opencode", "server", "endpoint", "self-hosted"],
    installationIds: ["inst-opencode-pm"],
    accounts: [
      {
        id: "opencode-server", nickname: "orchard.internal", identity: "Server certificate CN=opencode.orchard.internal",
        status: "connected", statusWord: "Ready — usage details unavailable",
        connection: "Server endpoint · https://opencode.orchard.internal", product: "Server-provided routes", priority: 1, sticky: true,
        health: { catalogue: "34 minutes ago", generation: "9 minutes ago", check: "ok" },
        usage: { includedRemaining: "Unavailable", resetsIn: "Unavailable", pressure: "unknown",
          note: "This server does not report per-account balances. The provider is ready; only the usage figures are missing." },
        nextAction: { chosen: "Keep using the server", options: ["Keep using the server", "Switch account", "Use free models"] }
      }
    ],
    models: [
      { id: "oc-qwen-3", name: "Qwen 3 Coder", alias: "Server Qwen", summary: "Served by the OpenCode server", favourite: false, priority: 1, available: true,
        context: "256K", modes: { fast: false, effort: ["Low", "Medium"] },
        capabilities: [
          { name: "Tools", state: "supported", evidence: "Authenticated discovery", when: "34 minutes ago" },
          { name: "Structured output", state: "supported", evidence: "Authenticated discovery", when: "34 minutes ago" }
        ] },
      { id: "oc-glm-5", name: "GLM 5", alias: null, summary: "Served by the OpenCode server", favourite: false, priority: 2, available: true,
        context: "200K", modes: { fast: true, effort: [] },
        capabilities: [
          { name: "Tools", state: "supported", evidence: "Authenticated discovery", when: "34 minutes ago" },
          { name: "Vision", state: "unsupported", evidence: "Authenticated discovery", when: "34 minutes ago" }
        ] }
    ],
    routing: { note: "Requests go to the server, which chooses the upstream route. Puppet Master records the server as the effective connection." }
  });

  /* ------------------------------------------------ catalogue freshness */

  /* Fixture 15 — two catalogue sources, one validated and one that failed
   * validation and is still serving its last known good copy rather than
   * disappearing or serving something malformed. */
  D.managers["manager-providers"].catalog = {
    note: "Catalogues refresh continuously. A source that fails validation is quarantined and the last known good copy keeps serving.",
    sources: [
      {
        id: "models-dev",
        name: "models.dev",
        sourceVersion: "8f21c4e",
        checkedAt: "11 minutes ago",
        importedAt: "11 minutes ago",
        activatedAt: "11 minutes ago",
        validation: "passed",
        lastKnownGood: { version: "8f21c4e", at: "11 minutes ago" },
        changes: [
          { kind: "added", text: "Gemini 3 Flash added to the Google family." },
          { kind: "repriced", text: "GPT-5.2 mini input price reduced." },
          { kind: "renamed", text: "Claude Haiku 4.5 canonical id changed; the local alias still resolves." }
        ]
      },
      {
        id: "free-coding-models",
        name: "Free Coding Models",
        sourceVersion: "2026-08-11T06:14Z",
        checkedAt: "6 minutes ago",
        importedAt: "6 minutes ago",
        activatedAt: "1 hour ago",
        validation: "failed",
        validationDetail: "Two entries declared a context window as a string and one entry had no provider route. The import was quarantined rather than activated.",
        lastKnownGood: { version: "2026-08-10T22:02Z", at: "1 hour ago" },
        changes: [
          { kind: "removed", text: "Mistral Small 3.2 left the free tier." },
          { kind: "deprecated", text: "One keyless community endpoint marked end-of-life for 1 September." }
        ]
      }
    ]
  };

  /* ------------------------------------------------------- free models */

  var free = null;
  D.providers.forEach(function (p) { if (p.id === "free") free = p; });
  if (free) {
    free.standingNote = "Free Models is a wrapper over underlying routes. It never owns credentials, quota, account switching or Usage attribution — each row names the provider that does.";

    free.models.forEach(function (m) {
      if (m.id === "free-kimi") { m.freeState = "Needs setup"; m.underlyingRoute = "Groq · no account yet"; }
      if (m.id === "free-glm") { m.freeState = "Unverified"; m.underlyingRoute = "Community endpoint · keyless"; }
      if (m.id === "free-removed") { m.freeState = "No longer free"; m.underlyingRoute = "OpenRouter · personal key"; }
    });

    free.models.push(
      { id: "free-ready", name: "Llama 4 Scout", alias: null, summary: "Free through the Groq trial route", favourite: false, priority: 4, available: true,
        freeState: "Ready", underlyingRoute: "Groq · trial key",
        freeTerms: ["Trial key", "Rate limited", "May change without notice"],
        context: "128K", modes: { fast: true, effort: [] },
        capabilities: [{ name: "Tools", state: "supported", evidence: "Observed use", when: "2 hours ago" }] },

      /* Fixture 13 — a free row whose setup is somebody else's connection. */
      { id: "free-needs-underlying", name: "DeepSeek V3.2 (free window)", alias: null, summary: "Free only while the OpenRouter promotion lasts", favourite: false, priority: 5, available: false,
        freeState: "Needs setup", underlyingRoute: "OpenRouter · personal key",
        unavailableReason: "The underlying OpenRouter connection has no credit, so the free window cannot be used either. Setup opens that connection, not a Free Models sign-in.",
        freeTerms: ["Requires the underlying account", "Promotional window", "Ends without notice"],
        context: "160K", modes: { fast: false, effort: [] },
        capabilities: [{ name: "Tools", state: "supported", evidence: "Catalogue", when: "1 hour ago" }] },

      { id: "free-cooling", name: "Qwen 3 Coder (free tier)", alias: null, summary: "Rate limit reached", favourite: false, priority: 6, available: false,
        freeState: "Cooling down", underlyingRoute: "Groq · trial key",
        unavailableReason: "The shared free tier returned a rate limit 4 minutes ago. It becomes usable again in about 20 minutes.",
        freeTerms: ["Shared capacity", "Rate limited", "Cools down after bursts"],
        context: "256K", modes: { fast: false, effort: [] },
        capabilities: [{ name: "Tools", state: "supported", evidence: "Observed use", when: "yesterday" }] },

      { id: "free-gone", name: "Yi Coder 9B", alias: null, summary: "Withdrawn by the host", favourite: false, priority: 7, available: false,
        freeState: "No longer available", underlyingRoute: "Community endpoint · withdrawn",
        unavailableReason: "The community endpoint that served this model was withdrawn on 2 August. There is no paid equivalent on this route.",
        freeTerms: ["Was community hosted", "Withdrawn 2 August"],
        context: "64K", modes: { fast: false, effort: [] },
        capabilities: [] }
    );

    /* ======================================= PROVIDER-CLI ACQUISITION POLICY */

    /* Added by the 2026-08-13 dependency correction, from
     * PROVIDER_CLI_FINAL_ADJUDICATION.md. The original build already avoided
     * bundling language, but the policy itself was never modelled, so nothing
     * stopped a later fixture from implying it. */
    D.providerCliPolicy = {
      neverBundled: true,
      neverInDefaultBaseline: true,
      neverPreSeededToolStore: true,
      neverSilentlyInstalledBy: ["Project", "model", "provider", "Goal", "Plan", "WorkNode", "agent", "Auto", "On demand"],
      initialInstall: "explicit user action in Provider Settings or provider setup",
      source: "the provider's own official installer, release artifact, package feed, or documented package-manager route",
      target: "the exact Host/Environment the user selected",
      authenticationSeparate: true,
      postConsentAllowed: ["discover and reuse a compatible existing installation", "verify publisher, provenance, version, architecture and licence",
        "maintain isolated provider-owned profiles", "stage, verify, activate, repair and roll back later generations",
        "apply automatic update policy once the installation is explicitly acquired and bound"],
      namedExceptionRequired: "Bundling one exact provider CLI needs a later named user-approved exception after redistribution, licence, provenance, security, size, update, removal and support review. No catalog owner, adapter or acquisition class may create it implicitly.",
      humanCopy: {
        notInstalled: "Not installed on this computer",
        availableToInstall: "Available to install",
        readyAfterInstall: "Ready",
        neverSay: ["Included with Puppet Master", "Included with this Server", "Pre-installed", "Bundled"]
      }
    };

    /* Runtime demand: what happens when an operation needs a provider CLI that
     * is not there. The continuation token is the load-bearing part — the
     * originating operation is preserved and only resumed if it is still
     * current, rather than silently installing and carrying on. */
    D.providerSetupDemand = {
      id: "demand-codex-cli",
      requirement: "A Codex route was requested and its command-line tool is not installed on this computer.",
      state: "provider_setup_required",
      stateWord: "Provider setup required",
      inspectedExisting: [
        { host: "This Windows computer", found: false, note: "No compatible installation" },
        { host: "WSL Ubuntu", found: true, note: "Found version 1.2.0, but the request targets Windows" }
      ],
      deepLink: "#/m/manager-providers/providers-installations/inst-codex",
      continuation: {
        token: "cont-7f31a9",
        originatingOperation: "Plan step 4 — draft the migration",
        preserved: true,
        resumeRule: "Resumes only if this continuation is still current when setup finishes.",
        staleBehavior: "A superseded continuation is discarded with a receipt rather than resumed."
      },
      waitsFor: "explicit Install, or selection of an existing compatible installation",
      thenSeparately: "authentication",
      neverDoes: "install silently because a Project, Goal or Auto policy wanted the route"
    };

    /* Human identity for every installation surface. Raw ids stay keys. */
    D.installationHosts = [
      { id: "host-this-computer", name: "This Windows computer", kind: "native" },
      { id: "host-wsl-ubuntu", name: "WSL Ubuntu", kind: "wsl" },
      { id: "host-home-truenas", name: "Home TrueNAS", kind: "server" },
      { id: "host-macbook-air", name: "MacBook Air", kind: "native" },
      { id: "host-linux-build", name: "Linux build server", kind: "ssh" }
    ];

    /* Every provider CLI in the fixture carries its acquisition class, and none
     * of them may be a baseline class. */
    D.providerCliInstallations = [
      { id: "pcli-claude", product: "Claude Code", hostId: "host-this-computer", hostName: "This Windows computer",
        acquisition: "pm_tool_store", readiness: "ready", version: "2.1.4", isProviderCli: true,
        source: "Anthropic official installer", authSeparate: true, installedBy: "explicit user action on 4 August" },
      { id: "pcli-codex", product: "Codex CLI", hostId: "host-this-computer", hostName: "This Windows computer",
        acquisition: "available_to_install", readiness: "not_installed", version: null, isProviderCli: true,
        source: "OpenAI official release artifact", authSeparate: true, installedBy: null },
      { id: "pcli-gemini", product: "Antigravity CLI", hostId: "host-wsl-ubuntu", hostName: "WSL Ubuntu",
        acquisition: "installed_externally", readiness: "external", version: "0.9.7", isProviderCli: true,
        source: "installed by the user outside Puppet Master", authSeparate: true, installedBy: "not managed here" }
    ];

    free.statusWord = "2 of 7 ready";
  }
})();
