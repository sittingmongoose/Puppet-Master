/* =====================================================================
   U11 — PRISM II · demo dataset
   ---------------------------------------------------------------------
   Stable-ID identity model (packet §7, Hermes §1–2, delta §4–8):

     Provider family → Account/profile → Connection → Product/entitlement
       → Meter(s) → Model(s)

   Rules proven by these fixtures:
   - every join is a stable-ID join; display names are never parsed;
   - only configured / usage-visible sources appear anywhere;
   - one immutable usage event per real provider attempt, grouped under
     human logical work (turn / Goal phase / PlanningRun topic / Crew /
     thread request);
   - included / credits / packs / metered continuation / PAYG / free /
     trial / saved reset / fallback / hard stop / spending limit stay
     distinct, each with a human "what happens next";
   - local Memory / Persona / Context Lens / spellcheck work is NOT
     provider usage (zero, distinct from unknown);
   - CLI-owned OAuth profiles (Claude CLI, Antigravity CLI) are distinct
     from API routes and from PM-direct OAuth.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- demo clock (canonical UTC) ---------- */
  var NOW_ISO = '2026-08-04T18:42:00Z';           /* Tue Aug 4 · 14:42 EDT */
  var NOW = Date.parse(NOW_ISO);
  var MIN = 60000, HOUR = 3600000, DAY = 86400000;
  function at(ms) { return new Date(NOW + ms).toISOString(); }

  var U11 = {
    meta: {
      project: 'Tastebook',
      projectFriendly: 'Tastebook',
      now: NOW_ISO,
      refreshMin: 5,
      retentionDays: 90,
      projectionHealth: 'current',          /* current | refreshing | stale | degraded | unavailable */
      projectionFreshness: 'current',
      nextAutoRefresh: at(5 * MIN),
      asOfLabel: null                        /* filled by page via U11time */
    },

    /* ================================================================
       1 · IDENTITY REGISTRY
       ================================================================ */
    families: [
      { id: 'fam:alibaba',      label: 'Alibaba',      configured: true,  enabled: true },
      { id: 'fam:openai',       label: 'OpenAI',       configured: true,  enabled: true },
      { id: 'fam:claude',       label: 'Claude',       configured: true,  enabled: true },
      { id: 'fam:kimi',         label: 'Kimi',         configured: true,  enabled: true },
      { id: 'fam:opencode',     label: 'OpenCode',     configured: true,  enabled: true },
      { id: 'fam:zai',          label: 'Z.AI',         configured: true,  enabled: true },
      { id: 'fam:antigravity',  label: 'Antigravity',  configured: true,  enabled: true },
      { id: 'fam:google',       label: 'Google',       configured: true,  enabled: true },
      { id: 'fam:github',       label: 'GitHub',       configured: true,  enabled: true },
      { id: 'fam:local',        label: 'Local',        configured: true,  enabled: true }
    ],

    accounts: [
      { id: 'acct:alibaba-personal',    familyId: 'fam:alibaba',     label: 'Personal', detail: 'jared@personal.dev',   configured: true, enabled: true,  state: 'ready' },
      { id: 'acct:alibaba-team',        familyId: 'fam:alibaba',     label: 'Team',     detail: 'Tastebook org seat',    configured: true, enabled: true,  state: 'needs_attention', attention: 'Reconnect needed — session expired' },
      { id: 'acct:openai-personal',     familyId: 'fam:openai',      label: 'Personal', detail: 'jared@personal.dev',   configured: true, enabled: true,  state: 'ready' },
      { id: 'acct:openai-work',         familyId: 'fam:openai',      label: 'Work',     detail: 'jared@tastebook.io',   configured: true, enabled: true,  state: 'ready' },
      { id: 'acct:claude-work',         familyId: 'fam:claude',      label: 'Work',     detail: 'Tastebook workspace',  configured: true, enabled: true,  state: 'ready' },
      { id: 'acct:kimi-personal',       familyId: 'fam:kimi',        label: 'Personal', detail: 'jared@personal.dev',   configured: true, enabled: true,  state: 'ready' },
      { id: 'acct:opencode-personal',   familyId: 'fam:opencode',    label: 'Personal', detail: 'jared@personal.dev',   configured: true, enabled: true,  state: 'ready' },
      { id: 'acct:zai-personal',        familyId: 'fam:zai',         label: 'Personal', detail: 'jared@personal.dev',   configured: true, enabled: true,  state: 'ready' },
      { id: 'acct:antigravity-personal',familyId: 'fam:antigravity', label: 'Personal', detail: 'jared@personal.dev',   configured: true, enabled: true,  state: 'ready' },
      { id: 'acct:google-personal',     familyId: 'fam:google',      label: 'Personal', detail: 'jared@personal.dev',   configured: true, enabled: true,  state: 'ready' },
      { id: 'acct:github-personal',     familyId: 'fam:github',      label: 'Personal', detail: 'jaredsmacbookair',     configured: true, enabled: true,  state: 'ready' },
      { id: 'acct:local-runtime',       familyId: 'fam:local',       label: 'This Mac', detail: 'Ollama runtime',       configured: true, enabled: true,  state: 'ready' },
      /* historical-only identity: removed account, immutable in Ledger (§6.3) */
      { id: 'acct:openai-old',          familyId: 'fam:openai',      label: 'Old OpenAI', detail: 'retired API key',    configured: false, enabled: false, removed: true, removedLabel: 'Removed account' }
    ],

    connections: [
      /* Alibaba */
      { id: 'conn:alibaba-personal-coding', accountId: 'acct:alibaba-personal', label: 'Coding Plan connection', authMethod: 'api_key_secret_ref', authOwnedBy: 'Puppet Master', state: 'ready' },
      { id: 'conn:alibaba-team-coding',     accountId: 'acct:alibaba-team',     label: 'Team connection',        authMethod: 'api_key_secret_ref', authOwnedBy: 'Puppet Master', state: 'needs_reconnect', attention: 'Reconnect' },
      /* OpenAI */
      { id: 'conn:openai-personal-codex',   accountId: 'acct:openai-personal',  label: 'Codex · ChatGPT plan',   authMethod: 'pm_oauth',           authOwnedBy: 'Puppet Master', state: 'ready' },
      { id: 'conn:openai-work-codex',       accountId: 'acct:openai-work',      label: 'Codex · Business plan',  authMethod: 'pm_oauth',           authOwnedBy: 'Puppet Master', state: 'ready' },
      /* Claude — CLI-owned OAuth profile vs API route (delta §8) */
      { id: 'conn:claude-work-cli',         accountId: 'acct:claude-work',      label: 'Claude CLI profile',     authMethod: 'cli_owned_profile',  authOwnedBy: 'Claude CLI',    state: 'ready',
        note: 'OAuth owned by Claude CLI. Puppet Master chose the profile root and launched the native CLI login; the CLI owns the session.' },
      { id: 'conn:claude-work-api',         accountId: 'acct:claude-work',      label: 'Claude API',             authMethod: 'api_key_secret_ref', authOwnedBy: 'Puppet Master', state: 'ready',
        note: 'Separate connection · API key · API billing.' },
      /* Kimi */
      { id: 'conn:kimi-code',               accountId: 'acct:kimi-personal',    label: 'Kimi Code subscription', authMethod: 'pm_oauth',           authOwnedBy: 'Puppet Master', state: 'ready' },
      /* OpenCode */
      { id: 'conn:opencode-go',             accountId: 'acct:opencode-personal',label: 'OpenCode Go',            authMethod: 'pm_oauth',           authOwnedBy: 'Puppet Master', state: 'ready' },
      { id: 'conn:opencode-zen',            accountId: 'acct:opencode-personal',label: 'OpenCode Zen',           authMethod: 'pm_oauth',           authOwnedBy: 'Puppet Master', state: 'ready' },
      /* Z.AI — legacy plan and credit plan are separate products/meter-policy versions */
      { id: 'conn:zai-legacy',              accountId: 'acct:zai-personal',     label: 'Legacy plan connection', authMethod: 'api_key_secret_ref', authOwnedBy: 'Puppet Master', state: 'ready' },
      { id: 'conn:zai-credits',             accountId: 'acct:zai-personal',     label: 'Credit plan connection', authMethod: 'api_key_secret_ref', authOwnedBy: 'Puppet Master', state: 'ready' },
      /* Antigravity — CLI-owned OAuth profile (delta §8) */
      { id: 'conn:antigravity-cli',         accountId: 'acct:antigravity-personal', label: 'Antigravity CLI profile', authMethod: 'cli_owned_profile', authOwnedBy: 'Antigravity CLI', state: 'ready',
        note: 'OAuth owned by Antigravity CLI; the CLI owns the session.' },
      /* Google / GitHub / shared / local */
      { id: 'conn:google-gemini-cli',       accountId: 'acct:google-personal',  label: 'Gemini CLI profile',     authMethod: 'cli_owned_profile',  authOwnedBy: 'Gemini CLI',    state: 'ready' },
      { id: 'conn:github-copilot-free',     accountId: 'acct:github-personal',  label: 'Copilot Free',           authMethod: 'pm_oauth',           authOwnedBy: 'Puppet Master', state: 'ready' },
      { id: 'conn:opencode-shared-gw',      accountId: 'acct:opencode-personal',label: 'Shared gateway',         authMethod: 'no_auth',            authOwnedBy: '—',             state: 'ready',
        note: 'Explicitly enabled keyless shared route.' },
      { id: 'conn:local-ollama',            accountId: 'acct:local-runtime',    label: 'Ollama · local',         authMethod: 'local_endpoint',     authOwnedBy: '—',             state: 'ready',
        note: 'Local route · no provider bill.' }
    ],

    products: [
      /* Alibaba Personal: Coding Plan + Personal Token Plan + Extra Bundle */
      { id: 'prod:alibaba-coding-plan',   connectionId: 'conn:alibaba-personal-coding', label: 'Coding Plan',            kind: 'subscription', included: true },
      { id: 'prod:alibaba-ptp',           connectionId: 'conn:alibaba-personal-coding', label: 'Personal Token Plan',    kind: 'prepaid_balance', included: false },
      { id: 'prod:alibaba-extra-bundle',  connectionId: 'conn:alibaba-personal-coding', label: 'Extra Bundle',           kind: 'purchased_pack', included: false, purchasedAt: '2026-07-22T15:00:00Z' },
      /* Alibaba Team: seat credits + Shared Usage Pack */
      { id: 'prod:alibaba-team-seats',    connectionId: 'conn:alibaba-team-coding',     label: 'Team seat credits',      kind: 'subscription', included: true },
      { id: 'prod:alibaba-shared-pack',   connectionId: 'conn:alibaba-team-coding',     label: 'Shared Usage Pack',      kind: 'purchased_pack', included: false },
      /* OpenAI Personal: ChatGPT plan + optional credits + one saved reset */
      { id: 'prod:codex-plus',            connectionId: 'conn:openai-personal-codex',   label: 'ChatGPT plan',           kind: 'subscription', included: true },
      { id: 'prod:codex-credits',         connectionId: 'conn:openai-personal-codex',   label: 'Usage credits',          kind: 'prepaid_balance', included: false, capMicro: 20000000 },
      { id: 'prod:codex-saved-reset',     connectionId: 'conn:openai-personal-codex',   label: 'Saved reset',            kind: 'saved_reset', included: false, expiresAt: '2026-09-01T04:00:00Z' },
      /* OpenAI Work: Business plan at its limit (fallback fixture) */
      { id: 'prod:codex-business',        connectionId: 'conn:openai-work-codex',       label: 'ChatGPT Business plan',  kind: 'subscription', included: true },
      /* Claude Work: Max plan + extra usage w/ spending limit + PAYG API */
      { id: 'prod:claude-max',            connectionId: 'conn:claude-work-cli',         label: 'Claude Max plan',        kind: 'subscription', included: true },
      { id: 'prod:claude-extra',          connectionId: 'conn:claude-work-cli',         label: 'Extra usage',            kind: 'metered_continuation', included: false, enabled: true, spendingLimitMicro: 100000000 },
      { id: 'prod:claude-api-payg',       connectionId: 'conn:claude-work-api',         label: 'Claude API · PAYG',      kind: 'payg_route', included: false, spendingLimitMicro: 150000000 },
      /* Kimi: rolling plan + shared membership pool + trial */
      { id: 'prod:kimi-code-plan',        connectionId: 'conn:kimi-code',               label: 'Kimi Code plan',         kind: 'subscription', included: true },
      { id: 'prod:kimi-pool',             connectionId: 'conn:kimi-code',               label: 'Shared membership pool', kind: 'shared_pool', included: false },
      { id: 'prod:kimi-trial',            connectionId: 'conn:kimi-code',               label: 'K2 trial',               kind: 'trial', included: false, expiresAt: '2026-08-16T04:00:00Z' },
      /* OpenCode: Go windows + Zen balance */
      { id: 'prod:oc-go-plan',            connectionId: 'conn:opencode-go',             label: 'OpenCode Go plan',       kind: 'subscription', included: true },
      { id: 'prod:oc-zen-balance',        connectionId: 'conn:opencode-zen',            label: 'Zen balance',            kind: 'prepaid_balance', included: false, autoReload: false },
      /* Z.AI: legacy plan (meter policy v1) + credit plan (v2) */
      { id: 'prod:zai-legacy-plan',       connectionId: 'conn:zai-legacy',              label: 'Legacy plan',            kind: 'subscription', included: true, meterPolicyVersion: 'v1' },
      { id: 'prod:zai-credit-plan',       connectionId: 'conn:zai-credits',             label: 'Credit plan',            kind: 'subscription', included: true, meterPolicyVersion: 'v2' },
      /* Antigravity: baseline + optional AI-credit overage (disabled) */
      { id: 'prod:antigravity-baseline',  connectionId: 'conn:antigravity-cli',         label: 'Baseline plan',          kind: 'subscription', included: true },
      { id: 'prod:antigravity-overage',   connectionId: 'conn:antigravity-cli',         label: 'AI Credit Overages',     kind: 'metered_continuation', included: false, enabled: false },
      /* Free-tier / local products */
      { id: 'prod:google-gemini-free',    connectionId: 'conn:google-gemini-cli',       label: 'Gemini free tier',       kind: 'free_allowance', included: true },
      { id: 'prod:github-copilot-free',   connectionId: 'conn:github-copilot-free',     label: 'Copilot Free',           kind: 'free_allowance', included: true },
      { id: 'prod:zai-free-tier',         connectionId: 'conn:zai-legacy',              label: 'Z.AI free tier',         kind: 'free_allowance', included: true },
      { id: 'prod:oc-go-free-models',     connectionId: 'conn:opencode-go',             label: 'Included free models',   kind: 'free_allowance', included: true, requiresProduct: 'prod:oc-go-plan' },
      { id: 'prod:shared-gw-route',       connectionId: 'conn:opencode-shared-gw',      label: 'Shared free route',      kind: 'free_allowance', included: true },
      { id: 'prod:local-ollama',          connectionId: 'conn:local-ollama',            label: 'Local models',           kind: 'local_route', included: true }
    ],

    /* Meters carry the live pressure state. `vs` uses the shared USvs
       value-state vocabulary; source_class / settlement follow Hermes §12. */
    meters: [
      /* Alibaba Coding Plan — three independent windows */
      { id: 'meter:alibaba-5h',      productId: 'prod:alibaba-coding-plan', label: '5-hour window',   unit: 'requests', windowKind: 'rolling',       used: 340,  limit: 1000, usedPct: 34, resetAt: at(4 * HOUR),            vs: 'provider_reported', sourceClass: 'provider_reported', settlement: 'observed', conf: 'high' },
      { id: 'meter:alibaba-weekly',  productId: 'prod:alibaba-coding-plan', label: 'Weekly window',   unit: 'requests', windowKind: 'rolling',       used: 2600, limit: 5000, usedPct: 52, resetAt: '2026-08-10T04:00:00Z',  vs: 'provider_reported', sourceClass: 'provider_reported', settlement: 'observed', conf: 'high' },
      { id: 'meter:alibaba-monthly', productId: 'prod:alibaba-coding-plan', label: 'Monthly window',  unit: 'requests', windowKind: 'billing_cycle', used: 8200, limit: 20000, usedPct: 41, resetAt: '2026-09-01T04:00:00Z', vs: 'provider_reported', sourceClass: 'provider_reported', settlement: 'observed', conf: 'high' },
      { id: 'meter:alibaba-ptp',     productId: 'prod:alibaba-ptp',         label: 'Token balance',   unit: 'tokens',   windowKind: 'balance',       used: 1200000, limit: 5000000, usedPct: 24, resetAt: null,            vs: 'provider_reported', sourceClass: 'provider_reported', settlement: 'observed', conf: 'high' },
      { id: 'meter:alibaba-bundle',  productId: 'prod:alibaba-extra-bundle',label: 'Bundle requests', unit: 'requests', windowKind: 'pack',          used: 160, limit: 200, usedPct: 80, resetAt: null, expiresAt: '2026-09-15T04:00:00Z', vs: 'provider_reported', sourceClass: 'provider_reported', settlement: 'observed', conf: 'high' },
      /* Alibaba Team — stale because the connection needs reconnect */
      { id: 'meter:alibaba-team-seats', productId: 'prod:alibaba-team-seats', label: 'Seat credits', unit: 'credits', windowKind: 'billing_cycle', used: 28, limit: 40, usedPct: 70, resetAt: '2026-09-01T04:00:00Z', vs: 'stale', sourceClass: 'provider_reported', settlement: 'observed', conf: 'low', note: 'Last verified before the session expired' },
      { id: 'meter:alibaba-shared',  productId: 'prod:alibaba-shared-pack', label: 'Shared pack balance', unit: 'USD', windowKind: 'pack',          used: 11.60, limit: 20, usedPct: 58, resetAt: null,                   vs: 'stale', sourceClass: 'provider_reported', settlement: 'observed', conf: 'low' },
      /* OpenAI Personal */
      { id: 'meter:codex-5h',        productId: 'prod:codex-plus',          label: '5-hour window',   unit: '%',        windowKind: 'rolling',       used: null, limit: null, usedPct: 46, resetAt: at(8 * HOUR + 44 * MIN), vs: 'provider_reported', sourceClass: 'cli_reported', settlement: 'observed', conf: 'high' },
      { id: 'meter:codex-weekly',    productId: 'prod:codex-plus',          label: 'Weekly window',   unit: '%',        windowKind: 'rolling',       used: null, limit: null, usedPct: 38, resetAt: '2026-08-08T04:00:00Z', vs: 'provider_reported', sourceClass: 'cli_reported', settlement: 'observed', conf: 'high' },
      { id: 'meter:codex-credits',   productId: 'prod:codex-credits',       label: 'Credits used',    unit: 'USD',      windowKind: 'balance',       used: 4.20, limit: 20, usedPct: 21, resetAt: null,                    vs: 'provider_reported', sourceClass: 'provider_reported', settlement: 'streaming_partial', conf: 'high' },
      { id: 'meter:codex-saved',     productId: 'prod:codex-saved-reset',   label: 'Saved resets',    unit: 'count',    windowKind: 'banked',        used: 0, limit: 1, usedPct: 0, resetAt: null, expiresAt: '2026-09-01T04:00:00Z', vs: 'measured', sourceClass: 'pm_observed', settlement: 'settled', conf: 'high' },
      /* OpenAI Work — at its limit; drives the fallback fixture */
      { id: 'meter:codex-biz-5h',    productId: 'prod:codex-business',      label: '5-hour window',   unit: '%',        windowKind: 'rolling',       used: null, limit: null, usedPct: 100, resetAt: at(3 * HOUR + 5 * MIN), vs: 'provider_reported', sourceClass: 'cli_reported', settlement: 'observed', conf: 'high', pressure: 'at_limit' },
      { id: 'meter:codex-biz-weekly',productId: 'prod:codex-business',      label: 'Weekly window',   unit: '%',        windowKind: 'rolling',       used: null, limit: null, usedPct: 96, resetAt: '2026-08-08T04:00:00Z', vs: 'provider_reported', sourceClass: 'cli_reported', settlement: 'observed', conf: 'high', pressure: 'at_limit' },
      /* Claude Work CLI — included windows + extra usage + PAYG */
      { id: 'meter:claude-5h',       productId: 'prod:claude-max',          label: '5-hour window',   unit: '%',        windowKind: 'rolling',       used: null, limit: null, usedPct: 78, resetAt: at(2 * HOUR + 14 * MIN), vs: 'provider_reported', sourceClass: 'cli_reported', settlement: 'observed', conf: 'high' },
      { id: 'meter:claude-weekly',   productId: 'prod:claude-max',          label: 'Weekly window',   unit: '%',        windowKind: 'rolling',       used: null, limit: null, usedPct: 61, resetAt: '2026-08-07T04:00:00Z', vs: 'provider_reported', sourceClass: 'cli_reported', settlement: 'observed', conf: 'high' },
      { id: 'meter:claude-extra',    productId: 'prod:claude-extra',        label: 'Extra usage',     unit: 'USD',      windowKind: 'billing_cycle', used: 12.40, limit: 100, usedPct: 12, resetAt: '2026-09-01T04:00:00Z', vs: 'provider_reported', sourceClass: 'provider_reported', settlement: 'streaming_partial', conf: 'high', note: 'User spending limit' },
      { id: 'meter:claude-api',      productId: 'prod:claude-api-payg',     label: 'API spend',       unit: 'USD',      windowKind: 'billing_cycle', used: 6.18, limit: 150, usedPct: 4, resetAt: '2026-09-01T04:00:00Z', vs: 'provider_reported', sourceClass: 'provider_reported', settlement: 'streaming_partial', conf: 'high', note: 'Org spending limit' },
      /* Kimi — rolling limits + shared pool with UNKNOWN limit */
      { id: 'meter:kimi-weekly',     productId: 'prod:kimi-code-plan',      label: 'Rolling week',    unit: '%',        windowKind: 'rolling',       used: null, limit: null, usedPct: 71, resetAt: at(26 * HOUR),          vs: 'provider_reported', sourceClass: 'provider_reported', settlement: 'observed', conf: 'high' },
      { id: 'meter:kimi-pool',       productId: 'prod:kimi-pool',           label: 'Extra Usage pool',unit: 'requests', windowKind: 'pool',          used: 3100, limit: null, usedPct: null, resetAt: null,                vs: 'unknown', sourceClass: 'provider_reported', settlement: 'observed', conf: 'medium', note: 'Observed use · limit not exposed' },
      { id: 'meter:kimi-trial',      productId: 'prod:kimi-trial',          label: 'Trial allowance', unit: 'requests', windowKind: 'trial',         used: 42, limit: 200, usedPct: 21, resetAt: null, expiresAt: '2026-08-16T04:00:00Z', vs: 'provider_reported', sourceClass: 'provider_reported', settlement: 'observed', conf: 'high' },
      /* OpenCode Go — native currency + UNKNOWN monthly limit */
      { id: 'meter:oc-go-5h',        productId: 'prod:oc-go-plan',          label: '5-hour credits',  unit: 'credits',  windowKind: 'rolling',       used: 145, limit: 200, usedPct: 72, resetAt: at(55 * MIN),            vs: 'provider_reported', sourceClass: 'provider_reported', settlement: 'observed', conf: 'high' },
      { id: 'meter:oc-go-monthly',   productId: 'prod:oc-go-plan',          label: 'Monthly credits', unit: 'credits',  windowKind: 'billing_cycle', used: 4200, limit: null, usedPct: null, resetAt: '2026-09-01T04:00:00Z', vs: 'unknown', sourceClass: 'provider_reported', settlement: 'observed', conf: 'medium', note: 'Observed use · limit not exposed' },
      { id: 'meter:oc-zen-bal',      productId: 'prod:oc-zen-balance',      label: 'Zen balance',     unit: 'USD',      windowKind: 'balance',       used: 0, limit: 3.20, usedPct: 0, resetAt: null,                      vs: 'provider_reported', sourceClass: 'provider_reported', settlement: 'settled', conf: 'high', note: 'Auto-reload off' },
      /* Z.AI — legacy request meter (unknown limit) + credit plan */
      { id: 'meter:zai-legacy-req',  productId: 'prod:zai-legacy-plan',     label: 'Included requests', unit: 'requests', windowKind: 'billing_cycle', used: 118, limit: null, usedPct: null, resetAt: '2026-08-16T04:00:00Z', vs: 'unknown', sourceClass: 'provider_reported', settlement: 'observed', conf: 'medium', note: 'Limit not exposed' },
      { id: 'meter:zai-credits',     productId: 'prod:zai-credit-plan',     label: 'Credits',         unit: 'credits',  windowKind: 'balance',       used: 760, limit: 1000, usedPct: 76, resetAt: null,                   vs: 'provider_reported', sourceClass: 'provider_reported', settlement: 'observed', conf: 'high' },
      /* Antigravity */
      { id: 'meter:agi-baseline',    productId: 'prod:antigravity-baseline',label: 'Included usage',  unit: '%',        windowKind: 'rolling',       used: null, limit: null, usedPct: 64, resetAt: at(9 * HOUR),           vs: 'provider_reported', sourceClass: 'cli_reported', settlement: 'observed', conf: 'high' },
      { id: 'meter:agi-overage',     productId: 'prod:antigravity-overage', label: 'AI credit overage', unit: 'USD',    windowKind: 'balance',       used: 0, limit: null, usedPct: null, resetAt: null,                   vs: 'disabled', sourceClass: 'unknown', settlement: 'unknown', conf: 'unknown', note: 'Extra usage is off' },
      /* Free allowances */
      { id: 'meter:google-free-day', productId: 'prod:google-gemini-free',  label: 'Free requests today', unit: 'requests', windowKind: 'fixed_reset', used: 18, limit: 60, usedPct: 30, resetAt: '2026-08-05T04:00:00Z', vs: 'provider_reported', sourceClass: 'cli_reported', settlement: 'observed', conf: 'high' },
      { id: 'meter:github-free-mo',  productId: 'prod:github-copilot-free', label: 'Premium requests', unit: 'requests', windowKind: 'billing_cycle', used: 32, limit: 50, usedPct: 64, resetAt: '2026-09-01T04:00:00Z', vs: 'provider_reported', sourceClass: 'provider_reported', settlement: 'observed', conf: 'high' },
      { id: 'meter:zai-free-day',    productId: 'prod:zai-free-tier',       label: 'Free tokens today', unit: 'tokens', windowKind: 'fixed_reset',   used: 120000, limit: 200000, usedPct: 60, resetAt: '2026-08-05T04:00:00Z', vs: 'estimated', sourceClass: 'pm_observed', settlement: 'observed', conf: 'medium' },
      { id: 'meter:oc-go-free',      productId: 'prod:oc-go-free-models',   label: 'Free model use',  unit: 'requests', windowKind: 'none',          used: 26, limit: null, usedPct: null, resetAt: null,                  vs: 'measured', sourceClass: 'pm_observed', settlement: 'observed', conf: 'high' },
      { id: 'meter:shared-gw',       productId: 'prod:shared-gw-route',     label: 'Shared route use', unit: 'requests', windowKind: 'none',         used: 7, limit: null, usedPct: null, resetAt: null,                   vs: 'measured', sourceClass: 'pm_observed', settlement: 'observed', conf: 'high' },
      { id: 'meter:local-ollama',    productId: 'prod:local-ollama',        label: 'Local capacity',  unit: 'runtime',  windowKind: 'session_only',  used: null, limit: null, usedPct: null, resetAt: null,                vs: 'not_exposed', sourceClass: 'local_estimated', settlement: 'unknown', conf: 'unknown', note: 'Local models expose no usage API — nothing to read, different from reading zero. 14 GB RAM · ~18 tok/s' }
    ],

    models: [
      { id: 'model:claude-opus-4-6',   familyId: 'fam:claude',     label: 'Claude Opus 4.6',    contextWindow: 200000, reasoning: true,  vision: false },
      { id: 'model:claude-sonnet-4-6', familyId: 'fam:claude',     label: 'Claude Sonnet 4.6',  contextWindow: 200000, reasoning: true,  vision: false },
      { id: 'model:gpt-5-6',           familyId: 'fam:openai',     label: 'GPT-5.6',            contextWindow: 200000, reasoning: true,  vision: false },
      { id: 'model:gpt-5-6-codex',     familyId: 'fam:openai',     label: 'GPT-5.6-Codex',      contextWindow: 200000, reasoning: true,  vision: false },
      { id: 'model:qwen3-coder-plus',  familyId: 'fam:alibaba',    label: 'Qwen3 Coder Plus',   contextWindow: 262000, reasoning: false, vision: false },
      { id: 'model:qwen3-max',         familyId: 'fam:alibaba',    label: 'Qwen3 Max',          contextWindow: 262000, reasoning: false, vision: false },
      { id: 'model:kimi-k2',           familyId: 'fam:kimi',       label: 'Kimi K2',            contextWindow: 128000, reasoning: false, vision: false },
      { id: 'model:glm-4-7',           familyId: 'fam:zai',        label: 'GLM-4.7',            contextWindow: 128000, reasoning: false, vision: false },
      { id: 'model:glm-4-5-air',       familyId: 'fam:zai',        label: 'GLM-4.5-Air',        contextWindow: 128000, reasoning: false, vision: false },
      { id: 'model:gemini-2-5-pro',    familyId: 'fam:google',     label: 'Gemini 2.5 Pro',     contextWindow: 1000000, reasoning: true, vision: true },
      { id: 'model:gemini-2-5-flash',  familyId: 'fam:google',     label: 'Gemini 2.5 Flash',   contextWindow: 1000000, reasoning: false, vision: true },
      { id: 'model:deepseek-v3-2',     familyId: 'fam:zai',        label: 'DeepSeek V3.2',      contextWindow: 128000, reasoning: false, vision: false },
      { id: 'model:qwen3-coder-30b',   familyId: 'fam:local',      label: 'qwen3-coder:30b · local', contextWindow: 131072, reasoning: false, vision: false, local: true }
    ],

    /* ================================================================
       2 · CONTINUATION POLICIES — packet §9
       Each selected product gets a plain-language "what happens next".
       ================================================================ */
    continuation: {
      'prod:alibaba-coding-plan': {
        order: ['included', 'prod:alibaba-ptp', 'prod:alibaba-extra-bundle', 'wait_reset'],
        whatHappensNext: 'When included usage runs out, draw on the Personal Token Plan, then the Extra Bundle. Otherwise wait for the window reset.'
      },
      'prod:alibaba-team-seats': {
        order: ['included', 'prod:alibaba-shared-pack', 'wait_reset'],
        whatHappensNext: 'When seat credits run out, draw on the Shared Usage Pack. Otherwise wait for the monthly refresh.'
      },
      'prod:codex-plus': {
        order: ['included', 'prod:codex-credits', 'prod:codex-saved-reset', 'wait_reset'],
        whatHappensNext: 'When included usage runs out, use credits up to $20 this month. One saved reset is banked. Otherwise wait for the window reset.'
      },
      'prod:codex-business': {
        order: ['included', 'fallback:acct:openai-personal', 'hard_stop'],
        whatHappensNext: 'When this plan reaches its limit, fall back to Personal OpenAI. No extra usage is enabled on the Work account.'
      },
      'prod:claude-max': {
        order: ['included', 'prod:claude-extra', 'hard_stop'],
        whatHappensNext: 'When included usage runs out, continue with extra usage up to the $100 spending limit. Then stop.'
      },
      'prod:claude-api-payg': {
        order: ['metered', 'spending_limit'],
        whatHappensNext: 'API use is metered. The org spending limit of $150 bounds this month.'
      },
      'prod:kimi-code-plan': {
        order: ['included', 'prod:kimi-pool', 'wait_reset'],
        whatHappensNext: 'When this plan reaches its limit, draw on the shared membership pool. Otherwise wait for the rolling week.'
      },
      'prod:oc-go-plan': {
        order: ['included', 'free_fallback', 'wait_reset'],
        whatHappensNext: 'When OpenCode Go reaches its limit, continue with configured free models. Zen balance is off.'
      },
      'prod:oc-zen-balance': {
        order: ['balance', 'hard_stop'],
        whatHappensNext: 'Spend draws the Zen balance. Auto-reload is off, so at zero it stops.'
      },
      'prod:zai-legacy-plan': {
        order: ['included', 'hard_stop'],
        whatHappensNext: 'When this plan reaches its limit, wait for the reset. Your general Z.AI balance will not be used.'
      },
      'prod:zai-credit-plan': {
        order: ['included', 'metered', 'hard_stop'],
        whatHappensNext: 'When credits run out, metered continuation applies at list price. Otherwise stop.'
      },
      'prod:antigravity-baseline': {
        order: ['included', 'wait_reset'],
        whatHappensNext: 'When included usage runs out, wait for the window reset. AI Credit Overages are off.'
      }
    },

    /* ================================================================
       3 · FREE MODELS LENS — packet §11
       A catalog/routing lens, NOT a provider/account/billing identity.
       Only routes whose underlying source is usage-visible appear.
       ================================================================ */
    freeModels: [
      { id: 'free:gemini-flash',   modelId: 'model:gemini-2-5-flash', connectionId: 'conn:google-gemini-cli', condition: 'request_limited',      label: 'Free, limited', detail: '60 requests/day · 18 used today', meterId: 'meter:google-free-day', eligible: true },
      { id: 'free:glm-air',        modelId: 'model:glm-4-5-air',      connectionId: 'conn:zai-legacy',        condition: 'token_day',            label: 'Free, limited', detail: '200K tokens/day · 120K used', meterId: 'meter:zai-free-day', eligible: true },
      { id: 'free:copilot-req',    modelId: 'model:gpt-5-6',          connectionId: 'conn:github-copilot-free', condition: 'compute_units',      label: 'Free, limited', detail: '50 premium requests/month · compute-unit metered', meterId: 'meter:github-free-mo', eligible: true },
      { id: 'free:oc-go-models',   modelId: 'model:qwen3-coder-plus', connectionId: 'conn:opencode-go',       condition: 'conditional_on_plan',  label: 'Free with account requirements', detail: 'Requires an active OpenCode Go plan', meterId: 'meter:oc-go-free', eligible: true },
      { id: 'free:kimi-trial',     modelId: 'model:kimi-k2',          connectionId: 'conn:kimi-code',         condition: 'free_until',           label: 'Free until Aug 16', detail: 'Trial ends Aug 16 00:00', meterId: 'meter:kimi-trial', eligible: true },
      { id: 'free:shared-gw',      modelId: 'model:qwen3-max',        connectionId: 'conn:opencode-shared-gw',condition: 'keyless_shared',       label: 'Shared free access', detail: 'Explicitly enabled keyless route', meterId: 'meter:shared-gw', eligible: true },
      { id: 'free:local-qwen',     modelId: 'model:qwen3-coder-30b',  connectionId: 'conn:local-ollama',      condition: 'local',                label: 'Free', detail: 'Local · no provider bill · finite local capacity (14 GB RAM)', meterId: 'meter:local-ollama', eligible: true },
      { id: 'free:ds-ended',       modelId: 'model:deepseek-v3-2',    connectionId: 'conn:zai-credits',       condition: 'no_longer_free',       label: 'No longer free', detail: 'Free access ended Jul 15', meterId: null, eligible: false },
      { id: 'free:glm-unverified', modelId: 'model:glm-4-7',          connectionId: 'conn:zai-credits',       condition: 'unverified',           label: 'Could not verify', detail: 'Free status could not be verified', meterId: null, eligible: false }
    ],

    /* Catalog entries that exist upstream but are NOT configured —
       they must never appear in current Usage (packet §6.1). Kept only
       so verification can prove the filter. */
    unconfiguredCatalog: [
      { provider: 'Mistral', models: ['Codestral'] },
      { provider: 'Fireworks', models: ['Llama 4 Guardian'] },
      { provider: 'OpenRouter', models: ['mixed routing'] },
      { provider: 'Cohere', models: ['Command R+'] }
    ],

    /* ================================================================
       4 · LOGICAL WORK + IMMUTABLE ATTEMPTS — Hermes §2, delta §4
       One real provider attempt = one usage event. Grouped under a
       logical turn / Goal phase / PlanningRun topic / Crew / thread
       request. The final route never overwrites earlier attempts.
       ================================================================ */
    buckets: {
      main: 'Main work', specialists: 'Specialists & subagents', synthesis: 'Synthesis & verification',
      context: 'Context & compression', research: 'Research, attachments & media', tools: 'Tool & MCP helpers',
      validation: 'Validation & probes', retries: 'Retries & route changes'
    },

    works: [
      { id: 'work-1',  kind: 'turn',           label: 'Fix pricing migration',        threadId: 'thread:t-88', status: 'completed', endedAt: at(-8 * MIN) },
      { id: 'work-2',  kind: 'turn',           label: 'Regenerate invoice fixtures',  threadId: 'thread:t-88', status: 'completed', endedAt: at(-26 * MIN) },
      { id: 'work-3',  kind: 'turn',           label: 'Redirect: rewrite rate limiter', threadId: 'thread:t-88', status: 'completed', endedAt: at(-2 * MIN) },
      { id: 'work-4',  kind: 'turn',           label: 'Run integration tests',        threadId: 'thread:t-88', status: 'completed', endedAt: at(-41 * MIN) },
      { id: 'work-5',  kind: 'turn',           label: 'Apply deploy script changes',  threadId: 'thread:t-88', status: 'completed', endedAt: at(-58 * MIN) },
      { id: 'work-6',  kind: 'turn',           label: 'Read receipt photo',           threadId: 'thread:t-88', status: 'completed', endedAt: at(-71 * MIN) },
      { id: 'work-7',  kind: 'goal_phase',     label: 'Specialist reviews · phase 2', runId: 'run:goal-47',   status: 'running' },
      { id: 'work-8',  kind: 'planning_topic', label: 'Source extraction · topics',   runId: 'run:plan-12',   status: 'running' },
      { id: 'work-9',  kind: 'crew_step',      label: 'Critique round 1',             runId: 'run:crew-3',    status: 'running' },
      { id: 'work-10', kind: 'thread_request', label: 'Checkout service audit',       threadId: 'thread:t-91', status: 'running' },
      { id: 'work-11', kind: 'thread_request', label: 'Branch: retry on Claude',      threadId: 'thread:t-91-b1', status: 'running' },
      { id: 'work-12', kind: 'thread_request', label: 'Cross-project research child', threadId: 'thread:t-77', status: 'completed', endedAt: at(-3 * HOUR) },
      { id: 'work-h1', kind: 'turn',           label: 'Legacy: catalog sync',         threadId: null,          status: 'completed', endedAt: '2026-07-28T19:10:00Z', historical: true }
    ],

    attempts: [
      /* ---- work-1 · normal turn card (Hermes §11 example) ---- */
      { eventId: 'ue-501', workId: 'work-1', bucket: 'main', purpose: 'main_work', status: 'completed',
        requestedAccountId: 'acct:openai-personal', effectiveAccountId: 'acct:openai-personal',
        connectionId: 'conn:openai-personal-codex', productId: 'prod:codex-plus',
        requestedModelId: 'model:gpt-5-6-codex', effectiveModelId: 'model:gpt-5-6-codex',
        billingRoute: 'plan_included', tokens: { input: 42100, output: 3200, cacheRead: 18000 },
        costMicro: 0, startedAt: at(-16 * MIN), finishedAt: at(-8 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-501' },
      { eventId: 'ue-502', workId: 'work-1', bucket: 'context', purpose: 'compression', status: 'completed',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-coding-plan',
        requestedModelId: 'model:qwen3-coder-plus', effectiveModelId: 'model:qwen3-coder-plus',
        billingRoute: 'plan_included', tokens: { input: 2400, output: 310 },
        costMicro: 0, startedAt: at(-14 * MIN), finishedAt: at(-13 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-502',
        note: 'Compression helper for turn context' },
      { eventId: 'ue-503', workId: 'work-1', bucket: 'specialists', purpose: 'subagent', status: 'completed',
        requestedAccountId: 'acct:kimi-personal', effectiveAccountId: 'acct:kimi-personal',
        connectionId: 'conn:kimi-code', productId: 'prod:kimi-code-plan',
        requestedModelId: 'model:kimi-k2', effectiveModelId: 'model:kimi-k2',
        billingRoute: 'plan_included', tokens: { input: 8900, output: 1100, cacheRead: 4100 },
        costMicro: 0, startedAt: at(-13 * MIN), finishedAt: at(-9 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-503',
        subagent: { role: 'Reviewer', persona: 'Skeptical reviewer' } },
      { eventId: 'ue-504', workId: 'work-1', bucket: 'research', purpose: 'web_extraction', status: 'completed',
        requestedAccountId: 'acct:google-personal', effectiveAccountId: 'acct:google-personal',
        connectionId: 'conn:google-gemini-cli', productId: 'prod:google-gemini-free',
        requestedModelId: 'model:gemini-2-5-flash', effectiveModelId: 'model:gemini-2-5-flash',
        billingRoute: 'free', tokens: { input: 1900, output: 240 },
        costMicro: 0, startedAt: at(-12 * MIN), finishedAt: at(-12 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-504',
        note: 'Web extraction helper on free tier' },

      /* ---- work-2 · requested vs used mismatch (packet §8) ---- */
      { eventId: 'ue-510', workId: 'work-2', bucket: 'retries', purpose: 'main_work', status: 'failed',
        requestedAccountId: 'acct:openai-work', effectiveAccountId: 'acct:openai-work',
        connectionId: 'conn:openai-work-codex', productId: 'prod:codex-business',
        requestedModelId: 'model:gpt-5-6-codex', effectiveModelId: null,
        billingRoute: 'plan_included', tokens: {},
        costMicro: 0, startedAt: at(-30 * MIN), finishedAt: at(-30 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-510',
        failReason: 'Work OpenAI had reached its limit' },
      { eventId: 'ue-511', workId: 'work-2', bucket: 'main', purpose: 'main_work', status: 'completed',
        requestedAccountId: 'acct:openai-work', effectiveAccountId: 'acct:openai-personal',
        connectionId: 'conn:openai-personal-codex', productId: 'prod:codex-plus',
        requestedModelId: 'model:gpt-5-6-codex', effectiveModelId: 'model:gpt-5-6-codex',
        billingRoute: 'plan_included', tokens: { input: 22400, output: 1800, cacheRead: 9600 },
        costMicro: 0, startedAt: at(-29 * MIN), finishedAt: at(-26 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-511',
        mismatch: { reason: 'You chose Work OpenAI, but Puppet Master used Personal OpenAI because Work OpenAI had reached its limit.' } },

      /* ---- work-3 · mid-turn redirect (Hermes §6, delta §5) ---- */
      { eventId: 'ue-520', workId: 'work-3', bucket: 'main', purpose: 'main_work', status: 'interrupted',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: 'model:claude-opus-4-6',
        billingRoute: 'plan_included', tokens: { input: 6200, output: 400 },
        costMicro: 0, startedAt: at(-7 * MIN), finishedAt: at(-6 * MIN),
        settlement: 'settled', sourceClass: 'cli_reported', receiptRef: 'rcpt-520',
        sessionId: 'sess-t88-1', conversationMode: 'agent', reasoningEffort: 'high', speedMode: 'normal',
        requestedAccessProfile: 'full_access', effectiveAccessProfile: 'full_access',
        redirect: { support: 'interrupt_and_resume', wastedTokens: 6600, note: 'Interrupted by your correction; partial usage retained.' } },
      { eventId: 'ue-521', workId: 'work-3', bucket: 'main', purpose: 'main_work', status: 'completed',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: 'model:claude-opus-4-6',
        billingRoute: 'plan_included', tokens: { input: 38400, output: 2900, cacheRead: 22000 },
        costMicro: 0, startedAt: at(-6 * MIN), finishedAt: at(-2 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-521',
        sessionId: 'sess-t88-1', conversationMode: 'agent', reasoningEffort: 'high', speedMode: 'normal',
        requestedAccessProfile: 'full_access', effectiveAccessProfile: 'full_access',
        redirect: { resumed: true } },

      /* ---- work-4 · tool recovery, zero provider tokens (Hermes §5) ---- */
      { eventId: 'ue-530', workId: 'work-4', bucket: 'main', purpose: 'main_work', status: 'completed',
        requestedAccountId: 'acct:kimi-personal', effectiveAccountId: 'acct:kimi-personal',
        connectionId: 'conn:kimi-code', productId: 'prod:kimi-code-plan',
        requestedModelId: 'model:kimi-k2', effectiveModelId: 'model:kimi-k2',
        billingRoute: 'plan_included', tokens: { input: 15300, output: 900, cacheRead: 7700 },
        costMicro: 0, startedAt: at(-49 * MIN), finishedAt: at(-41 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-530',
        sessionId: 'sess-t88-2', conversationMode: 'review', reasoningEffort: 'medium', speedMode: 'fast',
        requestedAccessProfile: 'full_access', effectiveAccessProfile: 'review_limited',
        note: 'Full Access was limited by Review mode; safe browser/test tools still worked.' },

      /* ---- work-5 · approval reviewer + denial breaker (Hermes §7) ---- */
      { eventId: 'ue-540', workId: 'work-5', bucket: 'specialists', purpose: 'approval_review', status: 'completed',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-sonnet-4-6', effectiveModelId: 'model:claude-sonnet-4-6',
        billingRoute: 'plan_included', tokens: { input: 3100, output: 500 },
        costMicro: 0, startedAt: at(-62 * MIN), finishedAt: at(-61 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-540',
        note: 'Approval reviewer' },

      /* ---- work-6 · vision alternate route (Hermes §15.13) ---- */
      { eventId: 'ue-550', workId: 'work-6', bucket: 'main', purpose: 'main_work', status: 'completed',
        requestedAccountId: 'acct:openai-personal', effectiveAccountId: 'acct:openai-personal',
        connectionId: 'conn:openai-personal-codex', productId: 'prod:codex-plus',
        requestedModelId: 'model:gpt-5-6-codex', effectiveModelId: 'model:gpt-5-6-codex',
        billingRoute: 'plan_included', tokens: { input: 9800, output: 700 },
        costMicro: 0, startedAt: at(-75 * MIN), finishedAt: at(-72 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-550',
        note: 'Text-only main model' },
      { eventId: 'ue-551', workId: 'work-6', bucket: 'research', purpose: 'vision_helper', status: 'completed',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-api', productId: 'prod:claude-api-payg',
        requestedModelId: 'model:claude-sonnet-4-6', effectiveModelId: 'model:claude-sonnet-4-6',
        billingRoute: 'api_billed', tokens: { input: 5400, output: 300 },
        costMicro: 30000, startedAt: at(-74 * MIN), finishedAt: at(-73 * MIN),
        settlement: 'streaming_partial', sourceClass: 'provider_reported', receiptRef: 'rcpt-551',
        note: 'Separately billed vision helper' },

      /* ---- work-7 · Goal children admitted now (delta §2) ---- */
      { eventId: 'ue-560', workId: 'work-7', bucket: 'specialists', purpose: 'specialist', status: 'running',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-coding-plan',
        requestedModelId: 'model:qwen3-coder-plus', effectiveModelId: 'model:qwen3-coder-plus',
        billingRoute: 'plan_included', tokens: { input: 12100, output: 800 },
        costMicro: 0, startedAt: at(-11 * MIN), finishedAt: null,
        settlement: 'streaming_partial', sourceClass: 'provider_reported', receiptRef: 'rcpt-560',
        subagent: { role: 'Pricing specialist', persona: 'Domain analyst', child: 'child-47-1' } },
      { eventId: 'ue-561', workId: 'work-7', bucket: 'specialists', purpose: 'specialist', status: 'running',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-coding-plan',
        requestedModelId: 'model:qwen3-coder-plus', effectiveModelId: 'model:qwen3-coder-plus',
        billingRoute: 'plan_included', tokens: { input: 10800, output: 600 },
        costMicro: 0, startedAt: at(-11 * MIN), finishedAt: null,
        settlement: 'streaming_partial', sourceClass: 'provider_reported', receiptRef: 'rcpt-561',
        subagent: { role: 'Migration specialist', persona: 'Domain analyst', child: 'child-47-2' } },

      /* ---- work-8 · PlanningRun: quality conversation + cheap extraction (delta §5) ---- */
      { eventId: 'ue-570', workId: 'work-8', bucket: 'main', purpose: 'planning_conversation', status: 'completed',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: 'model:claude-opus-4-6',
        billingRoute: 'plan_included', tokens: { input: 51200, output: 4100, cacheRead: 30100 },
        costMicro: 0, startedAt: at(-95 * MIN), finishedAt: at(-80 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-570',
        note: 'High-quality conversational planning route' },
      { eventId: 'ue-571', workId: 'work-8', bucket: 'research', purpose: 'source_extraction', status: 'completed',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-coding-plan',
        requestedModelId: 'model:qwen3-max', effectiveModelId: 'model:qwen3-max',
        billingRoute: 'plan_included', tokens: { input: 24800, output: 1200 },
        costMicro: 0, startedAt: at(-79 * MIN), finishedAt: at(-70 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-571',
        subagent: { child: 'plan-12-ext-1', role: 'Extraction' } },
      { eventId: 'ue-572', workId: 'work-8', bucket: 'research', purpose: 'source_extraction', status: 'completed',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-coding-plan',
        requestedModelId: 'model:qwen3-max', effectiveModelId: 'model:qwen3-max',
        billingRoute: 'plan_included', tokens: { input: 21300, output: 900 },
        costMicro: 0, startedAt: at(-79 * MIN), finishedAt: at(-69 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-572',
        subagent: { child: 'plan-12-ext-2', role: 'Extraction' } },
      { eventId: 'ue-573', workId: 'work-8', bucket: 'research', purpose: 'source_extraction', status: 'running',
        requestedAccountId: 'acct:kimi-personal', effectiveAccountId: 'acct:kimi-personal',
        connectionId: 'conn:kimi-code', productId: 'prod:kimi-code-plan',
        requestedModelId: 'model:kimi-k2', effectiveModelId: 'model:kimi-k2',
        billingRoute: 'plan_included', tokens: { input: 18100, output: 400 },
        costMicro: 0, startedAt: at(-24 * MIN), finishedAt: null,
        settlement: 'streaming_partial', sourceClass: 'provider_reported', receiptRef: 'rcpt-573',
        subagent: { child: 'plan-12-ext-3', role: 'Extraction' } },
      { eventId: 'ue-574', workId: 'work-8', bucket: 'research', purpose: 'source_extraction', status: 'queued',
        requestedAccountId: 'acct:kimi-personal', effectiveAccountId: null,
        connectionId: 'conn:kimi-code', productId: 'prod:kimi-code-plan',
        requestedModelId: 'model:kimi-k2', effectiveModelId: null,
        billingRoute: 'plan_included', tokens: {},
        costMicro: 0, startedAt: null, finishedAt: null,
        settlement: 'unknown', sourceClass: 'unknown', receiptRef: null, queuedReason: 'pm_policy',
        subagent: { child: 'plan-12-ext-4', role: 'Extraction' },
        note: 'Queued — no provider attempt yet' },

      /* ---- work-9 · mixed-provider Crew + reducer (delta §5) ---- */
      { eventId: 'ue-580', workId: 'work-9', bucket: 'specialists', purpose: 'crew_member', status: 'completed',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-sonnet-4-6', effectiveModelId: 'model:claude-sonnet-4-6',
        billingRoute: 'plan_included', tokens: { input: 14200, output: 1600 },
        costMicro: 0, startedAt: at(-52 * MIN), finishedAt: at(-46 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-580',
        subagent: { role: 'Critique · layout', persona: 'Senior design critic', child: 'crew-3-m1' } },
      { eventId: 'ue-581', workId: 'work-9', bucket: 'specialists', purpose: 'crew_member', status: 'completed',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-coding-plan',
        requestedModelId: 'model:qwen3-coder-plus', effectiveModelId: 'model:qwen3-coder-plus',
        billingRoute: 'plan_included', tokens: { input: 11900, output: 1100 },
        costMicro: 0, startedAt: at(-52 * MIN), finishedAt: at(-47 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-581',
        subagent: { role: 'Critique · data', persona: 'Data skeptic', child: 'crew-3-m2' } },
      { eventId: 'ue-582', workId: 'work-9', bucket: 'specialists', purpose: 'crew_member', status: 'running',
        requestedAccountId: 'acct:kimi-personal', effectiveAccountId: 'acct:kimi-personal',
        connectionId: 'conn:kimi-code', productId: 'prod:kimi-code-plan',
        requestedModelId: 'model:kimi-k2', effectiveModelId: 'model:kimi-k2',
        billingRoute: 'plan_included', tokens: { input: 9400, output: 300 },
        costMicro: 0, startedAt: at(-19 * MIN), finishedAt: null,
        settlement: 'streaming_partial', sourceClass: 'provider_reported', receiptRef: 'rcpt-582',
        subagent: { role: 'Critique · motion', persona: 'Motion reviewer', child: 'crew-3-m3' } },
      { eventId: 'ue-583', workId: 'work-9', bucket: 'specialists', purpose: 'crew_member', status: 'queued',
        requestedAccountId: 'acct:openai-personal', effectiveAccountId: null,
        connectionId: 'conn:openai-personal-codex', productId: 'prod:codex-plus',
        requestedModelId: 'model:gpt-5-6-codex', effectiveModelId: null,
        billingRoute: 'plan_included', tokens: {},
        costMicro: 0, startedAt: null, finishedAt: null,
        settlement: 'unknown', sourceClass: 'unknown', receiptRef: null,
        subagent: { role: 'Critique · copy', persona: 'Copy editor', child: 'crew-3-m4' },
        note: 'Queued — no provider attempt yet' },
      { eventId: 'ue-584', workId: 'work-9', bucket: 'synthesis', purpose: 'reducer', status: 'queued',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: null,
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: null,
        billingRoute: 'plan_included', tokens: {},
        costMicro: 0, startedAt: null, finishedAt: null,
        settlement: 'unknown', sourceClass: 'unknown', receiptRef: null,
        note: 'Reducer/synthesis reserved until members finish' },

      /* ---- work-10 · model switch + replay (Hermes §15.4) ---- */
      { eventId: 'ue-590', workId: 'work-10', bucket: 'main', purpose: 'main_work', status: 'completed',
        requestedAccountId: 'acct:openai-personal', effectiveAccountId: 'acct:openai-personal',
        connectionId: 'conn:openai-personal-codex', productId: 'prod:codex-plus',
        requestedModelId: 'model:gpt-5-6-codex', effectiveModelId: 'model:gpt-5-6-codex',
        billingRoute: 'plan_included', tokens: { input: 61000, output: 4800, cacheRead: 40200 },
        costMicro: 0, startedAt: at(-160 * MIN), finishedAt: at(-140 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-590' },
      { eventId: 'ue-591', workId: 'work-10', bucket: 'retries', purpose: 'context_replay', status: 'completed',
        requestedAccountId: 'acct:kimi-personal', effectiveAccountId: 'acct:kimi-personal',
        connectionId: 'conn:kimi-code', productId: 'prod:kimi-code-plan',
        requestedModelId: 'model:kimi-k2', effectiveModelId: 'model:kimi-k2',
        billingRoute: 'plan_included', tokens: { input: 48900, output: 200 },
        costMicro: 0, startedAt: at(-138 * MIN), finishedAt: at(-136 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-591',
        note: 'Replay after model switch — old cache did not carry over' },
      { eventId: 'ue-592', workId: 'work-10', bucket: 'main', purpose: 'main_work', status: 'completed',
        requestedAccountId: 'acct:kimi-personal', effectiveAccountId: 'acct:kimi-personal',
        connectionId: 'conn:kimi-code', productId: 'prod:kimi-code-plan',
        requestedModelId: 'model:kimi-k2', effectiveModelId: 'model:kimi-k2',
        billingRoute: 'plan_included', tokens: { input: 33700, output: 2600, cacheRead: 24800 },
        costMicro: 0, startedAt: at(-135 * MIN), finishedAt: at(-120 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-592' },

      /* ---- work-11 · provider branch, ancestry preserved (delta §5) ---- */
      { eventId: 'ue-600', workId: 'work-11', bucket: 'retries', purpose: 'branch_replay', status: 'completed',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: 'model:claude-opus-4-6',
        billingRoute: 'plan_included', tokens: { input: 44100, output: 300 },
        costMicro: 0, startedAt: at(-115 * MIN), finishedAt: at(-113 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-600',
        branch: { sourceThreadId: 'thread:t-91', branchPoint: 'msg-m47', ancestry: ['thread:t-91', 'work-10'],
          note: 'This branch replayed context on a new connection, so cache reuse restarted.' } },
      { eventId: 'ue-601', workId: 'work-11', bucket: 'main', purpose: 'main_work', status: 'running',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: 'model:claude-opus-4-6',
        billingRoute: 'plan_included', tokens: { input: 21900, output: 1400, cacheRead: 15200 },
        costMicro: 0, startedAt: at(-112 * MIN), finishedAt: null,
        settlement: 'streaming_partial', sourceClass: 'cli_reported', receiptRef: 'rcpt-601' },

      /* ---- work-12 · cross-project child (delta §5, §10.12) ---- */
      { eventId: 'ue-610', workId: 'work-12', bucket: 'specialists', purpose: 'subagent', status: 'completed',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-coding-plan',
        requestedModelId: 'model:qwen3-max', effectiveModelId: 'model:qwen3-max',
        billingRoute: 'plan_included', tokens: { input: 17600, output: 2100 },
        costMicro: 0, startedAt: at(-200 * MIN), finishedAt: at(-180 * MIN),
        settlement: 'settled', sourceClass: 'provider_reported', receiptRef: 'rcpt-610',
        crossProject: { sourceProject: 'Harbor', sourceProjectFriendly: 'Harbor', sourceThreadId: 'thread:t-77',
          spawnReason: 'Cross-project research for pricing Goal',
          note: 'Project and thread lineage preserved; paths redacted.' } },

      /* ---- validation / probes (Hermes §9) ---- */
      { eventId: 'ue-620', workId: null, bucket: 'validation', purpose: 'probe', status: 'completed',
        requestedAccountId: 'acct:opencode-personal', effectiveAccountId: 'acct:opencode-personal',
        connectionId: 'conn:opencode-shared-gw', productId: 'prod:shared-gw-route',
        requestedModelId: 'model:glm-4-7', effectiveModelId: 'model:glm-4-7',
        billingRoute: 'free', tokens: { input: 1200, output: 60 },
        costMicro: 0, startedAt: at(-45 * MIN), finishedAt: at(-45 * MIN),
        settlement: 'observed', sourceClass: 'pm_observed', receiptRef: 'rcpt-620',
        note: 'Active free-model probe — validation activity, not user work' },

      /* ---- historical · removed account (packet §6.3) ---- */
      { eventId: 'ue-091', workId: 'work-h1', bucket: 'main', purpose: 'main_work', status: 'completed',
        requestedAccountId: 'acct:openai-old', effectiveAccountId: 'acct:openai-old',
        connectionId: null, productId: null,
        requestedModelId: 'model:gpt-5-6', effectiveModelId: 'model:gpt-5-6',
        billingRoute: 'api_billed', tokens: { input: 30200, output: 2400 },
        costMicro: 410000, startedAt: '2026-07-28T18:40:00Z', finishedAt: '2026-07-28T19:10:00Z',
        settlement: 'settled', sourceClass: 'provider_reported', receiptRef: 'rcpt-091',
        historicalIdentity: { accountId: 'acct:openai-old', label: 'Removed account · Old OpenAI' } },
      { eventId: 'ue-092', workId: 'work-h1', bucket: 'main', purpose: 'main_work', status: 'completed',
        requestedAccountId: 'acct:openai-old', effectiveAccountId: 'acct:openai-old',
        connectionId: null, productId: null,
        requestedModelId: 'model:gpt-5-6', effectiveModelId: 'model:gpt-5-6',
        billingRoute: 'api_billed', tokens: { input: 18900, output: 1500 },
        costMicro: 260000, startedAt: '2026-07-28T17:55:00Z', finishedAt: '2026-07-28T18:12:00Z',
        settlement: 'settled', sourceClass: 'provider_reported', receiptRef: 'rcpt-092',
        historicalIdentity: { accountId: 'acct:openai-old', label: 'Removed account · Old OpenAI' } }
    ],

    /* Tool operations with recovery evidence — zero provider usage
       (Hermes §5). These are NOT provider attempts. */
    toolOps: [
      { opId: 'toolop-1', workId: 'work-4', tool: 'test', failureClass: 'output_truncated', recovery: 'spill_inspected',
        providerUsage: 'none', copy: 'Test command output was truncated', detail: 'Full redacted output was saved and inspected; the command was not rerun.' },
      { opId: 'toolop-2', workId: 'work-5', tool: 'edit', failureClass: 'patch_already_applied', recovery: 'already_applied_noop',
        providerUsage: 'none', copy: 'Patch already applied', detail: 'Successful no-op · zero mutation · no redundant repair attempt.' }
    ],

    /* Approval receipts (Hermes §7) */
    approvals: [
      { approvalId: 'appr-1', workId: 'work-5', decision: 'denied', count: 3, breakerTriggered: true,
        waitMs: 6 * MIN, reviewerEventId: 'ue-540',
        copy: 'Full Access was limited by Review mode. Three denials in a row tripped the breaker.' }
    ],

    /* ================================================================
       5 · RUNS, FORECASTS, TIMING — delta §2/§5/§6
       Usage supplies the forecast; Goal Runtime/Orchestrator owns
       admission, scheduling, waves, and dispatch.
       ================================================================ */
    runs: [
      { id: 'run:goal-47', kind: 'goal', owningSurface: 'assistant_chat_goal', visibility: 'visible',
        title: 'Refactor pricing pipeline', project: 'Tastebook', status: 'running', phase: 'Specialist reviews',
        startedAt: at(-130 * MIN),
        requested: { children: 8, specialistsRequired: 8 },
        admitted: { now: 2, effectiveConcurrency: 2, sustainableConcurrency: 2 },
        queued: { children: 6, waves: 4 },
        reservedFor: ['synthesis', 'testing', 'verification', 'repair'],
        members: [
          { child: 'child-47-1', role: 'Pricing specialist', persona: 'Domain analyst', route: 'Alibaba · Coding Plan', state: 'running', eventId: 'ue-560' },
          { child: 'child-47-2', role: 'Migration specialist', persona: 'Domain analyst', route: 'Alibaba · Coding Plan', state: 'running', eventId: 'ue-561' },
          { child: 'child-47-3', role: 'Schema specialist', persona: 'Domain analyst', route: 'Qwen · planned', state: 'queued', queuedReason: 'pm_policy' },
          { child: 'child-47-4', role: 'Backfill specialist', persona: 'Domain analyst', route: 'Qwen · planned', state: 'queued' },
          { child: 'child-47-5', role: 'API specialist', persona: 'Domain analyst', route: 'Kimi · planned', state: 'queued', queuedReason: 'provider_limit' },
          { child: 'child-47-6', role: 'Test strategist', persona: 'Test skeptic', route: 'Kimi · planned', state: 'queued' },
          { child: 'child-47-7', role: 'Docs specialist', persona: 'Editor', route: 'Qwen · planned', state: 'queued', queuedReason: 'runtime_capacity' },
          { child: 'child-47-8', role: 'Risk reviewer', persona: 'Skeptical reviewer', route: 'Kimi · planned', state: 'queued' }
        ],
        timing: {
          elapsedMs: 124 * MIN,
          rows: [
            { label: 'Provider/model active', ms: 12 * MIN },
            { label: 'Waiting for test device', ms: 47 * MIN },
            { label: 'Waiting for worktree', ms: 31 * MIN },
            { label: 'Waiting for provider capacity', ms: 9 * MIN },
            { label: 'Waiting for approval', ms: 6 * MIN },
            { label: 'Waiting for reset/cooldown', ms: 0 },
            { label: 'Local tool/runtime time', ms: 19 * MIN }
          ]
        },
        forecastId: 'fc-goal-47' },

      { id: 'run:plan-12', kind: 'planning_run', owningSurface: 'planning_wizard', visibility: 'internal',
        title: 'Spec: U11 usage concept', project: 'Puppet Master', status: 'running', phase: 'Source extraction',
        startedAt: at(-100 * MIN),
        requested: { children: 6, specialistsRequired: 6 },
        admitted: { now: 2, effectiveConcurrency: 2, sustainableConcurrency: 2 },
        queued: { children: 4, waves: 3 },
        reservedFor: ['synthesis', 'testing', 'audit', 'repair'],
        routePlan: [
          { stage: 'Conversation', route: 'Claude · Work CLI profile', quality: 'high-quality route' },
          { stage: 'Research & extraction', route: '4 children across Qwen and Kimi', quality: 'background route' },
          { stage: 'Synthesis & audit', route: 'reserved', quality: 'reserved capacity' }
        ],
        forecastId: 'fc-plan-12' },

      { id: 'run:crew-3', kind: 'crew', owningSurface: 'orchestrator', visibility: 'orchestrator',
        title: 'Design critique crew', project: 'Puppet Master', status: 'running', phase: 'Critique round 1',
        startedAt: at(-55 * MIN),
        requested: { members: 5 },
        admitted: { now: 3, effectiveConcurrency: 3, sustainableConcurrency: 3 },
        queued: { members: 2, waves: 2 },
        reservedFor: ['reducer'],
        members: [
          { child: 'crew-3-m1', role: 'Critique · layout', persona: 'Senior design critic', requestedRoute: 'Claude · Work CLI profile', usedRoute: 'Claude · Work CLI profile', state: 'completed', eventId: 'ue-580' },
          { child: 'crew-3-m2', role: 'Critique · data', persona: 'Data skeptic', requestedRoute: 'Qwen · Coding Plan', usedRoute: 'Qwen · Coding Plan', state: 'completed', eventId: 'ue-581' },
          { child: 'crew-3-m3', role: 'Critique · motion', persona: 'Motion reviewer', requestedRoute: 'Kimi Code', usedRoute: 'Kimi Code', state: 'running', eventId: 'ue-582' },
          { child: 'crew-3-m4', role: 'Critique · copy', persona: 'Copy editor', requestedRoute: 'Codex · ChatGPT plan', usedRoute: null, state: 'queued', queuedReason: 'provider_limit', eventId: 'ue-583' },
          { child: 'crew-3-r1', role: 'Reducer', persona: 'Synthesizer', requestedRoute: 'Claude · Work CLI profile', usedRoute: null, state: 'queued', queuedReason: 'pm_policy', eventId: 'ue-584' }
        ],
        note: 'Mixed-provider Crew — never collapsed under one member’s provider.',
        forecastId: null }
    ],

    forecasts: [
      { id: 'fc-goal-47', runId: 'run:goal-47',
        recommendation: 'Likely enough capacity to finish before the next reset.',
        confidence: 'Reasonable forecast · based on 12 similar runs',
        generatedAt: at(-28 * MIN),
        inputs: {
          providerRanges: [
            { label: 'Usage per child', value: '18–26K tokens' },
            { label: 'Cost per child', value: '$0.00 · plan included' },
            { label: 'Elapsed per child', value: '6–9m' }
          ],
          resetInputs: ['Codex 5-hour window', 'Claude 5-hour window'],
          reservedNote: 'Capacity is kept aside for synthesis, testing, and repair.'
        } },
      { id: 'fc-plan-12', runId: 'run:plan-12',
        recommendation: 'Enough for two complete extraction children at a time, with synthesis and audit reserved.',
        confidence: 'Limited history · may change after a route switch',
        generatedAt: at(-22 * MIN),
        inputs: {
          providerRanges: [
            { label: 'Extraction per child', value: '20–30K tokens' },
            { label: 'Conversation', value: 'Claude · high-quality route' }
          ],
          resetInputs: ['Kimi rolling week', 'Alibaba weekly window'],
          reservedNote: 'The forecast reserves capacity for synthesis, testing, audit, and likely repair rather than spending everything on early extraction children.'
        } }
    ],

    /* ================================================================
       6 · LOCAL-ONLY OPERATIONS — delta §7
       Known local work appears with ZERO provider usage; unknown
       stays unknown. Never rendered as provider rows.
       ================================================================ */
    localOps: [
      { opId: 'local-1', op: 'persona_selection',   label: 'Persona selection',          providerUsage: 'none', at: at(-18 * MIN), detail: 'Reviewer persona chosen locally — no model call.' },
      { opId: 'local-2', op: 'memory_fade',         label: 'Memory fade',                providerUsage: 'none', at: at(-65 * MIN), detail: 'Older recall faded from active memory — local bookkeeping.' },
      { opId: 'local-3', op: 'history_search',      label: 'Local history search',       providerUsage: 'none', at: at(-84 * MIN), detail: 'Indexed locally; no provider tokens.' },
      { opId: 'local-4', op: 'context_lens',        label: 'Context Lens inspection',    providerUsage: 'none', at: at(-50 * MIN), detail: 'Local inspection of what is in context.' },
      { opId: 'local-5', op: 'zip_extract',         label: 'ZIP extraction',             providerUsage: 'none', at: at(-90 * MIN), detail: 'Archive expanded locally.' },
      { opId: 'local-6', op: 'local_prune',         label: 'Local context prune',        providerUsage: 'none', at: at(-33 * MIN), detail: 'Deterministic prune — zero provider usage.', maintenanceId: 'cm-2' },
      { opId: 'local-7', op: 'spellcheck',          label: 'Local spellcheck',           providerUsage: 'none', at: at(-12 * MIN), detail: 'Ordinary local spellcheck — not provider usage.' },
      { opId: 'local-8', op: 'unknown_indexer',     label: 'Background indexer',         providerUsage: 'unknown', at: at(-70 * MIN), detail: 'Unknown whether this local indexer calls a provider — left unknown, not assumed zero.' }
    ],

    /* ================================================================
       7 · THREADS + CONTEXT STATE — packet §12/§13
       ================================================================ */
    threads: [
      { id: 'thread:t-88', title: 'Pricing migration fixes', project: 'Tastebook', status: 'active',
        mainModelIds: ['model:claude-opus-4-6'], effectiveModelId: 'model:claude-opus-4-6',
        effectiveConnectionId: 'conn:claude-work-cli', effectiveProductId: 'prod:claude-max',
        switched: false, ancestry: null,
        context: {
          used: 42200, limit: 128000, pct: 33, cacheHitRate: 96.8,
          windowStartedAt: at(-3 * HOUR), lastActivityAt: at(-2 * MIN),
          segments: [
            { family: 'Messages', pct: 46, tokens: 19400 },
            { family: 'System & instructions', pct: 18, tokens: 7600 },
            { family: 'Tools', pct: 14, tokens: 5900 },
            { family: 'Skills & MCP', pct: 9, tokens: 3800 },
            { family: 'Memory / pinned', pct: 5, tokens: 2100 },
            { family: 'Summaries', pct: 4, tokens: 1700 },
            { family: 'Attachments / media', pct: 3, tokens: 1300 },
            { family: 'Other', pct: 1, tokens: 400 }
          ]
        } },
      { id: 'thread:t-91', title: 'Checkout service audit', project: 'Tastebook', status: 'active',
        mainModelIds: ['model:gpt-5-6-codex', 'model:kimi-k2'], effectiveModelId: 'model:kimi-k2',
        effectiveConnectionId: 'conn:kimi-code', effectiveProductId: 'prod:kimi-code-plan',
        switched: true, ancestry: null,
        context: {
          used: 88400, limit: 128000, pct: 69, cacheHitRate: 41.2,
          windowStartedAt: at(-136 * MIN), lastActivityAt: at(-9 * MIN),
          segments: [
            { family: 'Messages', pct: 52, tokens: 46000 },
            { family: 'System & instructions', pct: 12, tokens: 10600 },
            { family: 'Tools', pct: 16, tokens: 14100 },
            { family: 'Summaries', pct: 11, tokens: 9700 },
            { family: 'Skills & MCP', pct: 6, tokens: 5300 },
            { family: 'Other', pct: 3, tokens: 2700 }
          ]
        } },
      { id: 'thread:t-91-b1', title: 'Branch: retry on Claude', project: 'Tastebook', status: 'active',
        mainModelIds: ['model:claude-opus-4-6'], effectiveModelId: 'model:claude-opus-4-6',
        effectiveConnectionId: 'conn:claude-work-cli', effectiveProductId: 'prod:claude-max',
        switched: false,
        ancestry: { sourceThreadId: 'thread:t-91', branchPoint: 'msg-m47', kind: 'model_branch',
          note: 'Branched from Checkout service audit · cache reuse restarted on the new connection.' } },
      { id: 'thread:t-77', title: 'Cross-project research child', project: 'Harbor', status: 'completed',
        mainModelIds: ['model:qwen3-max'], effectiveModelId: 'model:qwen3-max',
        effectiveConnectionId: 'conn:alibaba-personal-coding', effectiveProductId: 'prod:alibaba-coding-plan',
        switched: false,
        ancestry: { sourceThreadId: 'thread:t-88', kind: 'cross_project_child', spawnReason: 'Cross-project research for pricing Goal',
          note: 'Spawned from Tastebook · both thread identities preserved.' } }
    ],

    /* Context-maintenance events — Hermes §3 */
    maintenance: [
      { id: 'cm-1', threadId: 'thread:t-88', operationKind: 'automatic_compaction', triggerKind: 'ratio_threshold',
        status: 'completed', at: at(-58 * MIN),
        tokensBefore: 118000, tokensAfter: 99800, reclaimed: 18200,
        cacheEffect: 'rebuilt', invalidationReason: 'compaction_changed_prefix', helperEventIds: ['ue-502'],
        copy: 'Context compacted', detail: '18.2K tokens reclaimed · Cache restarted · 1 helper call' },
      { id: 'cm-2', threadId: 'thread:t-88', operationKind: 'proactive_prune', triggerKind: 'idle',
        status: 'completed', at: at(-33 * MIN),
        tokensBefore: 48300, tokensAfter: 42200, reclaimed: 6100,
        cacheEffect: 'preserved', invalidationReason: null, helperEventIds: [],
        copy: 'Local prune', detail: '6.1K tokens reclaimed · zero provider usage' },
      { id: 'cm-3', threadId: 'thread:t-91', operationKind: 'micro_compaction', triggerKind: 'large_tool_result',
        status: 'completed', at: at(-150 * MIN),
        tokensBefore: 151000, tokensAfter: 143500, reclaimed: 7500,
        cacheEffect: 'broken', invalidationReason: 'tool_schema_changed', helperEventIds: [],
        copy: 'Micro-compaction', detail: 'Several small helper calls · cache-break consequence visible' },
      { id: 'cm-4', threadId: 'thread:t-91', operationKind: 'model_switch_repack', triggerKind: 'model_switch',
        status: 'completed', at: at(-137 * MIN),
        tokensBefore: 143500, tokensAfter: 88400, reclaimed: 55100,
        cacheEffect: 'rebuilt', invalidationReason: 'model_changed', helperEventIds: ['ue-591'],
        copy: 'Model switch repack', detail: 'GPT-5.6 → Kimi K2 · preflight compression · replay on the new connection' },
      { id: 'cm-5', threadId: 'thread:t-88', operationKind: 'manual_compaction', triggerKind: 'manual',
        status: 'timed_out_discarded', at: at(-100 * MIN),
        tokensBefore: 112000, tokensAfter: 112000, reclaimed: 0,
        cacheEffect: 'unknown', helperEventIds: [],
        copy: 'Compaction timed out', detail: 'Helper call may have usage, but no context mutation was committed.' }
    ],

    /* Route/switch timeline for Context Details (packet §13.2) */
    timeline: [
      { at: at(-160 * MIN), kind: 'route', threadId: 'thread:t-91', label: 'Started on GPT-5.6-Codex',
        detail: 'Personal OpenAI · ChatGPT plan · 200K window' },
      { at: at(-150 * MIN), kind: 'maintenance', threadId: 'thread:t-91', refId: 'cm-3' },
      { at: at(-138 * MIN), kind: 'switch', threadId: 'thread:t-91', label: 'Model switch · GPT-5.6 → Kimi K2',
        from: { modelId: 'model:gpt-5-6-codex', connectionId: 'conn:openai-personal-codex', limit: 200000 },
        to: { modelId: 'model:kimi-k2', connectionId: 'conn:kimi-code', limit: 128000 },
        reason: 'Codex weekly pressure · cheaper audit route',
        cacheEffect: 'broken → rebuilt', preflightCompression: true, replayEventId: 'ue-591',
        detail: 'Current meter re-baselined to the 128K Kimi window. Preflight compression ran before the replay.' },
      { at: at(-137 * MIN), kind: 'maintenance', threadId: 'thread:t-91', refId: 'cm-4' },
      { at: at(-130 * MIN), kind: 'run', threadId: 'thread:t-88', refId: 'run:goal-47', label: 'Goal started · Refactor pricing pipeline' },
      { at: at(-115 * MIN), kind: 'branch', threadId: 'thread:t-91-b1', label: 'Branch created',
        detail: 'From Checkout service audit · replayed on Claude · ancestry preserved' },
      { at: at(-100 * MIN), kind: 'maintenance', threadId: 'thread:t-88', refId: 'cm-5' },
      { at: at(-58 * MIN), kind: 'maintenance', threadId: 'thread:t-88', refId: 'cm-1' },
      { at: at(-33 * MIN), kind: 'maintenance', threadId: 'thread:t-88', refId: 'cm-2' },
      { at: at(-7 * MIN), kind: 'redirect', threadId: 'thread:t-88', label: 'Mid-turn redirect',
        detail: 'Interrupted attempt retained · resumed underneath' }
    ],

    /* Catalog refresh / probe evidence — Hermes §9 */
    catalogEvents: [
      { id: 'cat-1', source: 'free_coding_models', mode: 'background', status: 'stale_served_then_refreshed',
        at: at(-40 * MIN), modelsChanged: 3, freeStateChanges: 1,
        copy: 'Stale catalog served immediately', detail: 'Background refresh succeeded · no provider usage' },
      { id: 'cat-2', source: 'models_dev', mode: 'background', status: 'backoff',
        at: at(-15 * MIN), failureBackoffUntil: at(25 * MIN),
        copy: 'Catalog refresh in backoff', detail: 'Last known good used · no provider usage unless probed' }
    ],

    /* ================================================================
       8 · ROOM DATA — attention, cache, tools, analytics, signals
       ================================================================ */
    guards: [
      { id: 'gd-1', state: 'blocked', severity: 'high', at: at(-22 * MIN), title: 'Token spike blocked',
        where: 'Work OpenAI · Codex', body: 'A 4.1× input spike tripped the 1-hour 3.0× rule.',
        why: [['window', '1h'], ['rule', '3.0× spike'], ['observed', '4.1×'], ['samples', '9']] },
      { id: 'gd-2', state: 'warn', severity: 'medium', at: at(-47 * MIN), title: 'Spend rate elevated',
        where: 'Claude API · PAYG', body: 'Burn is 2.2× the 7-day norm; still under the org spending limit.',
        why: [['burn', '$2.85/h'], ['norm', '$1.30/h'], ['limit', '$150']] },
      { id: 'gd-3', state: 'allowed', severity: 'low', at: at(-31 * MIN), title: 'Large tool result allowed',
        where: 'Kimi Code', body: 'Within window headroom; micro-compaction kept pace.',
        why: [['headroom', '31%'], ['compactions', '2']] },
      { id: 'gd-4', state: 'watch', severity: 'low', at: at(-12 * MIN), title: 'Watching cache churn',
        where: 'OpenCode Go', body: 'Cache hit dipped after the gateway rotation.',
        why: [['hit', '72%'], ['baseline', '89%']] }
    ],

    cacheStats: [
      { connectionId: 'conn:claude-work-cli',     state: 'measured',    hit: 96.8, save: 2.10, cr: 30100, cw: 4100, note: 'Context-ring metric distinct from this provider figure' },
      { connectionId: 'conn:openai-personal-codex', state: 'measured',  hit: 92.4, save: 1.62, cr: 67800, cw: 8900 },
      { connectionId: 'conn:alibaba-personal-coding', state: 'measured', hit: 88.1, save: 0.94, cr: 41200, cw: 6100 },
      { connectionId: 'conn:kimi-code',           state: 'estimated',   hit: 81.5, save: 0.48, cr: 31000, cw: null, note: 'Cache-write field not exposed — not zero' },
      { connectionId: 'conn:zai-legacy',          state: 'unsupported', hit: null, save: 0, cr: null, cw: null, note: 'Route does not support prompt cache markers' },
      { connectionId: 'conn:antigravity-cli',     state: 'unsupported', hit: null, save: 0, cr: null, cw: null },
      { connectionId: 'conn:google-gemini-cli',   state: 'measured',    hit: 90.2, save: 0.22, cr: 8900, cw: 1200 },
      { connectionId: 'conn:claude-work-api',     state: 'measured',    hit: 94.0, save: 0.31, cr: 12400, cw: 2000 }
    ],

    tools: [
      { tool: 'search', calls: 458, p50: 45, p95: 210, err: 0.2, idx: 92, recoveries: 0 },
      { tool: 'edit', calls: 312, p50: 30, p95: 140, err: 0.8, idx: null, recoveries: 1 },
      { tool: 'test', calls: 96, p50: 1800, p95: 9200, err: 2.1, idx: null, recoveries: 1 },
      { tool: 'browser', calls: 41, p50: 950, p95: 4100, err: 1.4, idx: null, recoveries: 0 },
      { tool: 'mcp-github', calls: 66, p50: 210, p95: 880, err: 0.5, idx: 71, recoveries: 0 },
      { tool: 'terminal', calls: 205, p50: 60, p95: 390, err: 0.9, idx: null, recoveries: 0 }
    ],

    signals: {
      grade: 'B', score: 84,
      wins: [
        { text: 'Cache reuse on the Work Claude CLI profile held above 96% all day.', tag: 'cache' },
        { text: 'Fallback to Personal OpenAI kept work moving when Work hit its limit.', tag: 'routing' }
      ],
      improvements: [
        { text: 'Extraction children are right-sized — 2 at a time preserves synthesis capacity.', tag: 'capacity' },
        { text: 'One probe consumed free-tier allowance; batch probes to protect the daily tier.', tag: 'probes' }
      ],
      risks: [
        { text: 'Alibaba Team connection needs reconnect — its figures are stale.', tag: 'attention' },
        { text: 'Kimi pool limit is not exposed; treat remaining capacity as unknown, not zero.', tag: 'unknown' }
      ]
    },

    analytics: {
      windows: ['5h', '24h', '7d'],
      series: ['input', 'output', 'reasoning', 'cacheRead'],
      chart: {
        '5h': { note: 'today · hourly', cols: [
          ['10a', 12, 3, 1, 8], ['11a', 18, 4, 2, 11], ['12p', 9, 2, 1, 6],
          ['1p', 22, 5, 2, 14], ['2p', 16, 4, 1, 10]] },
        '24h': { note: 'last 24h · 2-hour buckets', cols: [
          ['00', 4, 1, 0, 3], ['02', 2, 1, 0, 2], ['04', 3, 1, 0, 2], ['06', 6, 2, 1, 4],
          ['08', 14, 4, 1, 9], ['10', 24, 6, 2, 15], ['12', 19, 5, 2, 12], ['14', 28, 7, 3, 18],
          ['16', 26, 6, 2, 17], ['18', 21, 5, 2, 13], ['20', 11, 3, 1, 7], ['22', 6, 2, 0, 4]] },
        '7d': { note: 'last 7 days', cols: [
          ['Tue', 96, 24, 9, 61], ['Wed', 112, 28, 11, 72], ['Thu', 88, 21, 8, 55],
          ['Fri', 124, 30, 12, 80], ['Sat', 41, 10, 4, 26], ['Sun', 33, 8, 3, 21], ['Mon', 102, 25, 10, 66]] }
      }
    },

    costs: {
      currency: 'USD',
      spentMonthMicro: 187420000,          /* single cost authority */
      apiBilledMicro: 61850000,
      planIncludedMicro: 125570000,
      reconciles: true,
      spendingLimitMicro: 300000000,       /* user/org spending limit — NOT a plan allowance */
      warningThresholdPct: 80,
      byFamily: [
        { familyId: 'fam:claude', micro: 74210000, basis: 'plan_included + api_billed' },
        { familyId: 'fam:openai', micro: 52380000, basis: 'plan_included' },
        { familyId: 'fam:alibaba', micro: 31240000, basis: 'plan_included' },
        { familyId: 'fam:kimi', micro: 14960000, basis: 'plan_included' },
        { familyId: 'fam:zai', micro: 8120000, basis: 'credits' },
        { familyId: 'fam:antigravity', micro: 4310000, basis: 'plan_included' },
        { familyId: 'fam:google', micro: 0, basis: 'free' },
        { familyId: 'fam:github', micro: 0, basis: 'free' },
        { familyId: 'fam:local', micro: 0, basis: 'none' }
      ],
      burn: { perHour: 2.85, perDay: 20.3 },
      forecastMonthMicro: 224100000
    },

    /* ================================================================
       9 · SETTINGS QUICK-CONTROLS DEFAULTS — packet §10
       U11 is a CONSUMER of the shared Settings registry; it never
       owns these policies. Persisted by the page, not this module.
       ================================================================ */
    settingsDefaults: {
      warnLow: true,
      autoSwitch: true,
      afterIncludedByProduct: {
        'prod:codex-plus': 'credits',
        'prod:claude-max': 'extra_usage',
        'prod:oc-go-plan': 'free_fallback'
      },
      extraUsage: {
        'prod:claude-extra': { enabled: true, limitMicro: 100000000 },
        'prod:antigravity-overage': { enabled: false, limitMicro: null }
      }
    },

    cmdLog: []
  };

  /* ================================================================
     ID INDEXES + STABLE-ID HELPERS (no display-name joins, ever)
     ================================================================ */
  function indexBy(arr) {
    var m = {};
    for (var i = 0; i < arr.length; i++) m[arr[i].id] = arr[i];
    return m;
  }
  U11.familyById = indexBy(U11.families);
  U11.accountById = indexBy(U11.accounts);
  U11.connectionById = indexBy(U11.connections);
  U11.productById = indexBy(U11.products);
  U11.meterById = indexBy(U11.meters);
  U11.modelById = indexBy(U11.models);
  U11.workById = indexBy(U11.works);
  U11.runById = indexBy(U11.runs);
  U11.forecastById = indexBy(U11.forecasts);
  U11.threadById = indexBy(U11.threads);
  U11.attemptById = (function () {
    var m = {};
    for (var i = 0; i < U11.attempts.length; i++) m[U11.attempts[i].eventId] = U11.attempts[i];
    return m;
  })();
  U11.attemptByEventId = U11.attemptById;

  /* children at each level */
  U11.accountsOfFamily = function (familyId) {
    return U11.accounts.filter(function (a) { return a.familyId === familyId; });
  };
  U11.connectionsOfAccount = function (accountId) {
    return U11.connections.filter(function (c) { return c.accountId === accountId; });
  };
  U11.productsOfConnection = function (connectionId) {
    return U11.products.filter(function (p) { return p.connectionId === connectionId; });
  };
  U11.metersOfProduct = function (productId) {
    return U11.meters.filter(function (m) { return m.productId === productId; });
  };
  U11.modelsOfFamily = function (familyId) {
    return U11.models.filter(function (m) { return m.familyId === familyId; });
  };

  /* ancestors: any node -> {familyId, accountId, connectionId, productId} chain */
  U11.ancestorsOf = function (id) {
    var out = { familyId: null, accountId: null, connectionId: null, productId: null, meterId: null };
    var meter = U11.meterById[id], prod = U11.productById[id], conn = U11.connectionById[id],
        acct = U11.accountById[id], fam = U11.familyById[id];
    if (meter) { out.meterId = meter.id; prod = U11.productById[meter.productId]; }
    if (prod) { out.productId = prod.id; conn = U11.connectionById[prod.connectionId]; }
    if (conn) { out.connectionId = conn.id; acct = U11.accountById[conn.accountId]; }
    if (acct) { out.accountId = acct.id; fam = U11.familyById[acct.familyId]; }
    if (fam) out.familyId = fam.id;
    return out;
  };

  /* scope node kind + label, by id */
  U11.scopeNode = function (id) {
    if (id === 'scope:all') return { kind: 'all', id: id, label: 'All current usage' };
    if (id === 'cmp:coding-sprint') return { kind: 'comparison', id: id, label: 'Coding sprint set' };
    if (U11.familyById[id]) return { kind: 'family', id: id, label: U11.familyById[id].label };
    if (U11.accountById[id]) return { kind: 'account', id: id, label: accountLabel(id) };
    if (U11.connectionById[id]) return { kind: 'connection', id: id, label: U11.connectionById[id].label };
    if (U11.productById[id]) return { kind: 'product', id: id, label: U11.productById[id].label };
    if (U11.meterById[id]) return { kind: 'meter', id: id, label: U11.meterById[id].label };
    return { kind: 'unknown', id: id, label: 'Unknown scope' };
  };

  function accountLabel(accountId) {
    var a = U11.accountById[accountId];
    if (!a) return 'Unknown account';
    var f = U11.familyById[a.familyId];
    return (f ? f.label : 'Unknown') + ' · ' + a.label;
  }
  U11.accountLabel = accountLabel;

  /* comparison set (stable product ids) */
  U11.comparisonSets = [
    { id: 'cmp:coding-sprint', label: 'Coding sprint set',
      productIds: ['prod:codex-plus', 'prod:claude-max', 'prod:alibaba-coding-plan'] }
  ];

  /* product set for a scope id — pure ID membership */
  U11.scopeProductSet = function (scopeId) {
    var set = {};
    function addProd(pid) { set[pid] = true; }
    function addConn(cid) { U11.productsOfConnection(cid).forEach(function (p) { addProd(p.id); }); }
    function addAcct(aid) { U11.connectionsOfAccount(aid).forEach(function (c) { addConn(c.id); }); }
    function addFam(fid) { U11.accountsOfFamily(fid).forEach(function (a) { addAcct(a.id); }); }

    if (!scopeId || scopeId === 'scope:all') {
      U11.families.forEach(function (f) { if (f.configured && f.enabled) addFam(f.id); });
    } else if (scopeId === 'cmp:coding-sprint') {
      U11.comparisonSets[0].productIds.forEach(addProd);
    } else if (U11.familyById[scopeId]) addFam(scopeId);
    else if (U11.accountById[scopeId]) addAcct(scopeId);
    else if (U11.connectionById[scopeId]) addConn(scopeId);
    else if (U11.productById[scopeId]) addProd(scopeId);
    else if (U11.meterById[scopeId]) addProd(U11.meterById[scopeId].productId);
    return set;
  };

  U11.attemptInScope = function (a, scopeId) {
    if (!scopeId || scopeId === 'scope:all') return true;
    var set = U11.scopeProductSet(scopeId);
    if (a.productId && set[a.productId]) return true;
    /* attempts on removed/historical accounts match account scope only */
    if (U11.accountById[scopeId]) {
      return a.effectiveAccountId === scopeId || a.requestedAccountId === scopeId;
    }
    if (U11.familyById[scopeId]) {
      var acct = U11.accountById[a.effectiveAccountId || a.requestedAccountId];
      return !!acct && acct.familyId === scopeId;
    }
    return false;
  };

  /* usage-visible sources only (packet §6.1/§6.2) */
  U11.visibleFamilies = function () {
    return U11.families.filter(function (f) { return f.configured && f.enabled; });
  };
  U11.visibleAccounts = function () {
    return U11.accounts.filter(function (a) { return a.configured && !a.removed; });
  };
  U11.removedAccounts = function () {
    return U11.accounts.filter(function (a) { return a.removed; });
  };

  /* meters for the current effective connection/product of a thread,
     sorted by pressure — data-driven, never hard-coded 5h/weekly and
     never selected by provider-name prefix (packet §12.4) */
  U11.currentLimitMeters = function (threadId) {
    var th = U11.threadById[threadId];
    if (!th) return [];
    var conn = U11.connectionById[th.effectiveConnectionId];
    if (!conn) return [];
    var out = [];
    U11.productsOfConnection(conn.id).forEach(function (p) {
      U11.metersOfProduct(p.id).forEach(function (m) {
        if (m.windowKind === 'none' || m.windowKind === 'session_only') return;
        out.push(m);
      });
    });
    out.sort(function (a, b) {
      var ap = a.usedPct == null ? -1 : a.usedPct, bp = b.usedPct == null ? -1 : b.usedPct;
      return bp - ap;
    });
    return out;
  };

  /* free models whose underlying source is usage-visible (packet §11) */
  U11.eligibleFreeModels = function () {
    return U11.freeModels.filter(function (fm) {
      if (!fm.eligible) return false;
      var conn = U11.connectionById[fm.connectionId];
      if (!conn || conn.state === 'removed') return false;
      var acct = U11.accountById[conn.accountId];
      if (!acct || !acct.configured || acct.removed) return false;
      var fam = U11.familyById[acct.familyId];
      return !!fam && fam.configured && fam.enabled;
    });
  };

  /* grouped ledger: logical works with their attempts (delta §4) */
  U11.worksWithAttempts = function (scopeId) {
    return U11.works
      .filter(function (w) { return !w.historical; })
      .map(function (w) {
        var attempts = U11.attempts.filter(function (a) {
          return a.workId === w.id && U11.attemptInScope(a, scopeId);
        });
        return { work: w, attempts: attempts };
      })
      .filter(function (g) { return g.attempts.length > 0; });
  };

  U11.bucketTotals = function (scopeId) {
    var totals = {};
    Object.keys(U11.buckets).forEach(function (b) { totals[b] = { tokens: 0, costMicro: 0, count: 0 }; });
    U11.attempts.forEach(function (a) {
      if (!U11.attemptInScope(a, scopeId)) return;
      var t = totals[a.bucket];
      if (!t) return;
      var tok = (a.tokens.input || 0) + (a.tokens.output || 0) + (a.tokens.cacheRead || 0) + (a.tokens.reasoning || 0);
      t.tokens += tok;
      t.costMicro += a.costMicro || 0;
      t.count += 1;
    });
    return totals;
  };

  /* ================================================================
     DEMO COMMAND DISPATCH — packet §19
     Labels map to canonical command families; demo wrappers only.
     ================================================================ */
  U11.dispatch = function (cmdId, payload) {
    var entry = { cmd: cmdId, payload: payload || null, at: new Date().toISOString() };
    U11.cmdLog.push(entry);
    var toasts = {
      'cmd.usage.refresh': 'Usage projections refreshed (demo)',
      'cmd.usage.export': 'Export prepared (demo)',
      'cmd.account.select_profile': 'Profile selected (demo)',
      'cmd.provider.switch_route': 'Route switch queued (demo)',
      'cmd.chat.compact_context': 'Compaction dispatched (demo)',
      'cmd.chat.open_thread_context_details': 'Context details opened',
      'cmd.chat.focus_thread_context_details': 'Context details focused',
      'cmd.chat.close_thread_context_details': 'Context details closed',
      'cmd.widget.add': 'Widget added',
      'cmd.widget.remove': 'Widget removed',
      'cmd.widget.resize': 'Widget resized',
      'cmd.widget.configure': 'Widget configured',
      'cmd.widget.move': 'Widget moved',
      'cmd.widget.reset_layout': 'Layout reset to defaults'
    };
    return { ok: true, cmd: cmdId, toast: toasts[cmdId] || (cmdId + ' (demo)') };
  };

  /* Semantic deep-link destinations (Hermes §14, delta §9).
     Concept-local payloads; never coupled to an old Settings
     presentation. */
  U11.deepLink = function (dest) {
    U11.cmdLog.push({ cmd: 'semantic.deep_link', payload: dest, at: new Date().toISOString() });
    var where = dest.surface + (dest.manager ? ' · ' + dest.manager : '');
    return { ok: true, toast: 'Opening ' + where + ' (demo deep link)' };
  };

  window.U11 = U11;
})();
