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
     human logical work (turn / Goal stage / PlanningRun topic / Crew /
     thread request);
   - included / credits / packs / metered continuation / PAYG / free /
     trial / saved reset / fallback / hard stop / spending limit stay
     distinct, each with a human "what happens next";
   - local Memory / Persona / Context Lens / spellcheck work is NOT
     provider usage (zero, distinct from unknown);
   - CLI-owned OAuth profiles (Claude CLI, Antigravity CLI) are distinct
     from API routes and from PM-direct OAuth.

   Canon repair pass, 2026-08-18 (independent audit 2026-08-17). Additive
   only — no existing key was renamed:
   - §1b writes down the closed sets this data is scored against, the eleven
     CV-196 token buckets, and the two axes that are concept extensions
     rather than canon;
   - counting_semantics is declared per route and agrees with the published
     table the renderers read, so no total can double-count an inclusive
     cache or reasoning bucket;
   - every attempt carries parent_event_id and dedupe_key, so a retry, a
     resumed stream, a replay, a fallback and a silent check are linked but
     never merged;
   - every attempt carries cost_status / display_cost_policy / hidden_byok /
     hidden_subscription, so a plan-covered call, a BYOK call and an unknown
     cost are three different statements instead of three identical zeroes;
   - settlement and billing route now use their full sets, and the two
     attempts that stated the wrong one were corrected;
   - the removed account, the suppressed duplicate check, the discarded
     helper and the allowance a probe consumes all have real carriers now,
     because the register claimed them and the data did not hold them.

   Residual repair pass, 2026-08-18 (same audit, second sweep). Additive:
   - §4e models the Antigravity CLI surface CBP-027 describes in full — the
     four slash-command probe states, the Models & Quota page, the statusline
     payload and G1 credits — and keeps credits out of every token bucket,
     cost, quota and provider total instead of only promising to;
   - the Provider Setup deep link names the provider family, account,
     connection, CLI, host and environment it is asking you to set up, and
     carries the originating operation with its continuation token;
   - current-scope totals and historical totals are two separate accessors, so
     a removed account's history can no longer be counted as current usage;
   - every attempt carries a role, so a primary can no longer be counted as a
     helper call, and a work item has one total of its own;
   - the eleven time kinds are eleven rows on every run, the reserve is a
     quantity with a numeric effect, and actual peak concurrency exists;
   - session lineage, conversation mode, effort, speed, access profile and
     pricing provenance are carried by every event rather than by six of them.
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
      { id: 'acct:alibaba-personal',    familyId: 'fam:alibaba',     label: 'Personal', detail: 'jared@personal.dev',   configured: true, enabled: true,  state: 'ready', priority: 1, lastUsedAt: at(-13 * MIN) },
      { id: 'acct:alibaba-team',        familyId: 'fam:alibaba',     label: 'Team',     detail: 'Tastebook org seat',    configured: true, enabled: true,  state: 'needs_attention', attention: 'Reconnect needed — session expired', priority: 1, lastUsedAt: at(-26 * HOUR) },
      { id: 'acct:openai-personal',     familyId: 'fam:openai',      label: 'Personal', detail: 'jared@personal.dev',   configured: true, enabled: true,  state: 'ready', priority: 1, lastUsedAt: at(-8 * MIN) },
      { id: 'acct:openai-work',         familyId: 'fam:openai',      label: 'Work',     detail: 'jared@tastebook.io',   configured: true, enabled: true,  state: 'ready', priority: 2, lastUsedAt: at(-29 * MIN) },
      { id: 'acct:claude-work',         familyId: 'fam:claude',      label: 'Work',     detail: 'Tastebook workspace',  configured: true, enabled: true,  state: 'ready', priority: 1, lastUsedAt: at(-2 * MIN) },
      { id: 'acct:kimi-personal',       familyId: 'fam:kimi',        label: 'Personal', detail: 'jared@personal.dev',   configured: true, enabled: true,  state: 'ready', priority: 1, lastUsedAt: at(-41 * MIN) },
      { id: 'acct:opencode-personal',   familyId: 'fam:opencode',    label: 'Personal', detail: 'jared@personal.dev',   configured: true, enabled: true,  state: 'ready', priority: 1, lastUsedAt: at(-45 * MIN) },
      { id: 'acct:zai-personal',        familyId: 'fam:zai',         label: 'Personal', detail: 'jared@personal.dev',   configured: true, enabled: true,  state: 'ready', priority: 1, lastUsedAt: at(-70 * MIN) },
      { id: 'acct:antigravity-personal',familyId: 'fam:antigravity', label: 'Personal', detail: 'jared@personal.dev',   configured: true, enabled: true,  state: 'ready', priority: 1, lastUsedAt: at(-5 * HOUR) },
      { id: 'acct:google-personal',     familyId: 'fam:google',      label: 'Personal', detail: 'jared@personal.dev',   configured: true, enabled: true,  state: 'ready', priority: 1, lastUsedAt: at(-12 * MIN) },
      { id: 'acct:github-personal',     familyId: 'fam:github',      label: 'Personal', detail: 'jaredsmacbookair',     configured: true, enabled: true,  state: 'ready', priority: 1, lastUsedAt: at(-2 * HOUR) },
      { id: 'acct:local-runtime',       familyId: 'fam:local',       label: 'This Mac', detail: 'Ollama runtime',       configured: true, enabled: true,  state: 'ready', priority: 1, lastUsedAt: at(-9 * HOUR) },
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
      { id: 'conn:google-antigravity-cli',  accountId: 'acct:google-personal',  label: 'Google CLI profile',     authMethod: 'cli_owned_profile',  authOwnedBy: 'Antigravity CLI', state: 'ready' },
      { id: 'conn:github-copilot-free',     accountId: 'acct:github-personal',  label: 'Copilot Free',           authMethod: 'pm_oauth',           authOwnedBy: 'Puppet Master', state: 'ready' },
      { id: 'conn:opencode-shared-gw',      accountId: 'acct:opencode-personal',label: 'Shared gateway',         authMethod: 'no_auth',            authOwnedBy: '—',             state: 'ready',
        note: 'Explicitly enabled keyless shared route.' },
      { id: 'conn:local-ollama',            accountId: 'acct:local-runtime',    label: 'Ollama · local',         authMethod: 'local_endpoint',     authOwnedBy: '—',             state: 'ready',
        note: 'Local route · no provider bill.' },
      /* Historical-only routes of the removed account (§6.3). They are never
         live: scopeProductSet skips removed accounts, so these never reach a
         picker, a plan card or a current total — they exist only so an old
         event can still name the connection, auth method and product that
         paid for it. Two credential styles are preserved here because both
         were real on that account. */
      { id: 'conn:openai-old-vault',        accountId: 'acct:openai-old',       label: 'Old API key · vault reference', authMethod: 'vault_ref',   authOwnedBy: 'Puppet Master', state: 'removed', removed: true, historical: true,
        note: 'Retired route · the key was held in the project vault. The reference is preserved in history; the secret is not.' },
      { id: 'conn:openai-old-env',          accountId: 'acct:openai-old',       label: 'Old API key · environment reference', authMethod: 'environment_ref', authOwnedBy: 'Puppet Master', state: 'removed', removed: true, historical: true,
        note: 'Retired route · the key was read from a named environment variable. The name is preserved in history; the value is not.' }
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
      /* Free-allowance / local products */
      { id: 'prod:google-gemini-free',    connectionId: 'conn:google-antigravity-cli',       label: 'Gemini free allowance', kind: 'free_allowance', included: true },
      { id: 'prod:github-copilot-free',   connectionId: 'conn:github-copilot-free',     label: 'Copilot Free',           kind: 'free_allowance', included: true },
      { id: 'prod:zai-free-allowance',    connectionId: 'conn:zai-legacy',              label: 'Z.AI free allowance',    kind: 'free_allowance', included: true },
      { id: 'prod:oc-go-free-models',     connectionId: 'conn:opencode-go',             label: 'Included free models',   kind: 'free_allowance', included: true, requiresProduct: 'prod:oc-go-plan' },
      { id: 'prod:shared-gw-route',       connectionId: 'conn:opencode-shared-gw',      label: 'Shared free route',      kind: 'free_allowance', included: true },
      { id: 'prod:local-ollama',          connectionId: 'conn:local-ollama',            label: 'Local models',           kind: 'local_route', included: true },
      /* Historical-only products of the removed account — never current. */
      { id: 'prod:openai-old-payg',       connectionId: 'conn:openai-old-vault',        label: 'Old OpenAI · pay as you go', kind: 'payg_route', included: false, historical: true },
      { id: 'prod:openai-old-payg-env',   connectionId: 'conn:openai-old-env',          label: 'Old OpenAI · pay as you go (environment route)', kind: 'payg_route', included: false, historical: true }
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
      { id: 'meter:codex-saved',     productId: 'prod:codex-saved-reset',   label: 'Saved resets',    unit: 'count',    windowKind: 'banked',        used: 0, limit: 1, usedPct: 0, resetAt: null, expiresAt: '2026-09-01T04:00:00Z', vs: 'measured', sourceClass: 'local_estimated', sourceAuthority: 'Puppet Master observed', settlement: 'settled', conf: 'high' },
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
      { id: 'meter:oc-go-monthly',   productId: 'prod:oc-go-plan',          label: 'Monthly credits', unit: 'credits',  windowKind: 'billing_cycle', used: 4200, limit: null, usedPct: null, resetAt: '2026-09-01T04:00:00Z', vs: 'unavailable', sourceClass: 'provider_reported', settlement: 'observed', conf: 'medium', note: 'Provider ready · Usage details unavailable', estimate: { usedPct: 63, basis: 'PM history · last 7 days', conf: 'medium' } },
      { id: 'meter:oc-zen-bal',      productId: 'prod:oc-zen-balance',      label: 'Zen balance',     unit: 'USD',      windowKind: 'balance',       used: 0, limit: 3.20, usedPct: 0, resetAt: null,                      vs: 'provider_reported', sourceClass: 'provider_reported', settlement: 'settled', conf: 'high', note: 'Auto-reload off' },
      /* Z.AI — legacy request meter (unknown limit) + credit plan */
      { id: 'meter:zai-legacy-req',  productId: 'prod:zai-legacy-plan',     label: 'Included requests', unit: 'requests', windowKind: 'billing_cycle', used: 118, limit: null, usedPct: null, resetAt: '2026-08-16T04:00:00Z', vs: 'unknown', sourceClass: 'provider_reported', settlement: 'observed', conf: 'medium', note: 'Limit not exposed' },
      { id: 'meter:zai-credits',     productId: 'prod:zai-credit-plan',     label: 'Credits',         unit: 'credits',  windowKind: 'balance',       used: 760, limit: 1000, usedPct: 76, resetAt: null,                   vs: 'provider_reported', sourceClass: 'provider_reported', settlement: 'observed', conf: 'high' },
      /* Antigravity */
      { id: 'meter:agi-baseline',    productId: 'prod:antigravity-baseline',label: 'Included usage',  unit: '%',        windowKind: 'rolling',       used: null, limit: null, usedPct: 64, resetAt: at(9 * HOUR),           vs: 'provider_reported', sourceClass: 'cli_reported', settlement: 'observed', conf: 'high' },
      { id: 'meter:agi-overage',     productId: 'prod:antigravity-overage', label: 'AI credit overage', unit: 'USD',    windowKind: 'balance',       used: 0, limit: null, usedPct: null, resetAt: null,                   vs: 'disabled', sourceClass: 'unknown', settlement: 'unknown', conf: 'unknown', note: 'Extra usage is off' },
      /* Free allowances */
      /* This is the allowance a background validation probe draws from: one
         of today's 18 requests was ue-615, a probe, not user work. The split
         is stated so "validation consumes allowance" is a figure, not a claim. */
      { id: 'meter:google-free-day', productId: 'prod:google-gemini-free',  label: 'Free requests today', unit: 'requests', windowKind: 'fixed_reset', used: 18, limit: 60, usedPct: 30, resetAt: '2026-08-05T04:00:00Z', vs: 'provider_reported', sourceClass: 'cli_reported', settlement: 'observed', conf: 'high', quotaStatus: 'reported', evidenceSource: 'cli_command',
        allowanceAttribution: { unit: 'requests', total: 18, userWork: 17, validation: 1, validationEventIds: ['ue-615'],
          note: 'One of today’s free requests was a background validation probe, not user work.' } },
      { id: 'meter:github-free-mo',  productId: 'prod:github-copilot-free', label: 'Premium requests', unit: 'requests', windowKind: 'billing_cycle', used: 32, limit: 50, usedPct: 64, resetAt: '2026-09-01T04:00:00Z', vs: 'provider_reported', sourceClass: 'provider_reported', settlement: 'observed', conf: 'high' },
      { id: 'meter:zai-free-day',    productId: 'prod:zai-free-allowance', label: 'Free tokens today', unit: 'tokens', windowKind: 'fixed_reset',   used: 120000, limit: 200000, usedPct: 60, resetAt: '2026-08-05T04:00:00Z', vs: 'estimated', sourceClass: 'local_estimated', sourceAuthority: 'Puppet Master observed', settlement: 'observed', conf: 'medium' },
      { id: 'meter:oc-go-free',      productId: 'prod:oc-go-free-models',   label: 'Free model use',  unit: 'requests', windowKind: 'none',          used: 26, limit: null, usedPct: null, resetAt: null,                  vs: 'measured', sourceClass: 'local_estimated', sourceAuthority: 'Puppet Master observed', settlement: 'observed', conf: 'high' },
      { id: 'meter:shared-gw',       productId: 'prod:shared-gw-route',     label: 'Shared route use', unit: 'requests', windowKind: 'none',         used: 7, limit: null, usedPct: null, resetAt: null,                   vs: 'measured', sourceClass: 'local_estimated', sourceAuthority: 'Puppet Master observed', settlement: 'observed', conf: 'high', quotaStatus: 'not_exposed', evidenceSource: 'local_estimate',
        allowanceAttribution: { unit: 'requests', total: 7, userWork: 6, validation: 1, validationEventIds: ['ue-620'],
          note: 'This route exposes no allowance to draw down — the count is what Puppet Master itself observed, and one of the seven was a probe.' } },
      { id: 'meter:local-ollama',    productId: 'prod:local-ollama',        label: 'Local capacity',  unit: 'runtime',  windowKind: 'session_only',  used: null, limit: null, usedPct: null, resetAt: null,                vs: 'not_exposed', sourceClass: 'local_estimated', settlement: 'unknown', conf: 'unknown', note: 'Local models expose no usage API — nothing to read, different from reading zero. 14 GB RAM · ~18 tok/s' }
    ],

    models: [
      { id: 'model:claude-opus-4-6',   familyId: 'fam:claude',     label: 'Claude Opus 4.6',    contextWindow: 200000, reasoning: true,  vision: false },
      /* A10-17: the catalog said this model cannot see, and fixture 4's vision
         helper runs on it. The fixture is right and the catalog row was wrong —
         a helper is only routed to a vision-capable model. */
      { id: 'model:claude-sonnet-4-6', familyId: 'fam:claude',     label: 'Claude Sonnet 4.6',  contextWindow: 200000, reasoning: true,  vision: true },
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
       1b · CANONICAL VOCABULARY — the closed sets this data is scored
       against, written down so a reader can check a value instead of
       guessing which set it came from. Field names here are the canonical
       spellings (snake_case) even though the demo records still carry the
       older camelCase keys; the rename is a separate pass.

       `extensions` is the honest half: two axes in this dataset are NOT
       canon enums, and saying so is better than letting them pass as canon.
       ================================================================ */
    canon: {
      source_class: ['provider_reported', 'provider_header', 'cli_reported', 'local_estimated', 'pricing_estimated', 'unknown'],
      source_confidence: ['high', 'medium', 'low', 'unknown'],
      settlement_status: ['observed', 'streaming_partial', 'settled', 'adjusted', 'failed', 'unknown'],
      cost_status: ['provider_reported', 'priced', 'estimated', 'hidden_subscription', 'hidden_byok', 'unknown'],
      display_cost_policy: ['show', 'hide', 'subscription_covered', 'unknown'],
      stream_state: ['started', 'partial', 'final', 'error', 'aborted', 'unknown'],
      usage_reporting_state: ['final', 'partial', 'estimated', 'unavailable', 'unknown'],
      cache_reporting_state: ['reported', 'not_exposed', 'unknown'],
      cache_write_breakdown_state: ['reported', 'fallback_short_ttl', 'not_exposed', 'unknown'],
      quota_status: ['reported', 'disabled', 'not_exposed', 'estimated', 'unknown'],
      credits_status: ['reported', 'not_exposed', 'disabled', 'unknown'],
      evidence_source: ['provider_api', 'provider_header', 'cli_command', 'statusline', 'local_estimate', 'not_exposed', 'unknown'],
      window_scope: ['provider', 'account', 'account+model', 'org', 'server_profile'],
      /* The eleven time kinds a run's elapsed time is separated into. They are
         partitions of attention, not of the clock: several run at once across
         workers, so they are never expected to add up to the total. */
      time_kind: ['provider_active', 'local_compute', 'tool_runtime', 'resource_wait',
        'provider_permit_wait', 'approval_wait', 'outbox_offline_wait',
        'reconnect_sync_replay', 'reset_wait', 'maintenance', 'total_elapsed'],
      /* CV-196 · the eleven first-class token buckets, with the key each one
         is carried under in this demo. Present even when unknown: absent is
         rendered as unknown, never as zero. */
      token_buckets: [
        { canonical: 'input_total',       carriedAs: 'tokens.input',           source: 'carried' },
        { canonical: 'input_non_cached',  carriedAs: 'tokens.inputNonCached',  source: 'derived from input_total and cache_read using counting_semantics' },
        { canonical: 'cache_read',        carriedAs: 'tokens.cacheRead',       source: 'carried' },
        { canonical: 'cache_write',       carriedAs: 'tokens.cacheWrite',      source: 'carried' },
        { canonical: 'cache_write_1h',    carriedAs: 'tokens.cacheWrite1h',    source: 'carried where the provider states the TTL bucket' },
        { canonical: 'cache_write_ttl',   carriedAs: 'tokens.cacheWriteTtl',   source: 'carried where a provider exposes a TTL other than one hour' },
        { canonical: 'output_total',      carriedAs: 'tokens.output',          source: 'carried' },
        { canonical: 'output_visible',    carriedAs: 'tokens.outputVisible',   source: 'derived from output_total and reasoning using counting_semantics' },
        { canonical: 'reasoning',         carriedAs: 'tokens.reasoning',       source: 'carried on routes whose model reasons; absent where the model does not' },
        { canonical: 'provider_total',    carriedAs: 'tokens.providerTotal',   source: 'carried when the provider states its own total, otherwise derived' },
        { canonical: 'context_estimate',  carriedAs: 'tokens.contextEstimate', source: 'local estimate only — never billing, cost, quota or provider authority' }
      ],
      /* The eight operational admission reasons a queued worker can carry. */
      queued_reason: ['provider_limit', 'runtime_capacity', 'pm_policy', 'port_conflict', 'file_writer_conflict',
        'host_resource_pressure', 'waiting_for_update_repair', 'waiting_for_reset'],
      /* Declared extensions — concept-local axes with no closed canon set.
         Named here so nothing in this file can be mistaken for canon. */
      extensions: [
        { field: 'billingRoute',
          values: ['plan_included', 'extra_balance', 'usage_pack', 'api_billed', 'free', 'no_charge_observed', 'unknown'],
          why: 'Which product actually paid. Canon has no closed set for this axis; it is carried alongside — never instead of — cost_status and settlement_status.' },
        { field: 'vs',
          values: ['provider_reported', 'measured', 'estimated', 'stale', 'unknown', 'unavailable', 'not_exposed', 'disabled'],
          why: 'The per-cell value state. Canon requires these states to be distinguishable but never enumerates the field, so this list is a concept declaration, not a canon quotation.' },
        { field: 'roleClass',
          values: ['primary', 'helper', 'child', 'background'],
          why: 'What an attempt is to the work item it belongs to. A primary is one of the calls that does the asked-for work; a helper is a supporting call; a child is a subagent, crew member or mixture-of-agents worker; background belongs to no logical work at all. Canon closes no set here, but a renderer that counts helpers has to be able to tell a primary from one.' },
        { field: 'sessionLineage',
          values: ['thread', 'run', 'background'],
          why: 'What a session id is anchored to. A background probe belongs to no conversation session, so it carries background and a null id rather than borrowing a turn\'s session.' },
        { field: 'accessProfile',
          values: ['full_access', 'review_limited', 'read_only', 'no_tools', 'unknown'],
          why: 'Requested and effective tool reach. Canon requires both to be carried by every event and never enumerates the values, so this list is a concept declaration.' },
        { field: 'conversationMode',
          values: ['chat', 'agent', 'review', 'plan', 'not_applicable'],
          why: 'The conversation mode a request ran under. Packet-required, canon-unenumerated.' },
        { field: 'reasoningEffort',
          values: ['minimal', 'low', 'medium', 'high', 'not_applicable', 'not_exposed', 'unknown'],
          why: 'Requested effort. A model that does not reason reads not_applicable; a route that publishes no effort control reads not_exposed. Neither is a number.' },
        { field: 'speedMode',
          values: ['normal', 'fast', 'not_exposed', 'unknown'],
          why: 'The Normal/Fast control. A route without one reads not_exposed rather than being defaulted to normal.' },
        { field: 'pricingSource',
          values: ['provider_reported', 'provider_price_list', 'pm_bundled_price_list', 'custom_provider_price_row', 'not_applicable', 'unknown'],
          why: 'Where the money came from. Canon makes pricing_source a REQUIRED cost field but enumerates no values; a suppressed or unknown cost carries not_applicable or unknown here and never a snapshot id, because a snapshot id without a source is exactly what fixture GUI-USG-004 forbids.' },
        { field: 'operational.providerUsage',
          values: ['none', 'validation_only', 'replay_only', 'unknown'],
          why: 'What kind of provider call, if any, an operational flow caused. validation_only is reserved for a maintenance flow verifying itself against a model; a reconnect replay is its own kind and used to be filed under validation, which said the wrong thing about it.' },
        { field: 'cliProbeState',
          values: ['available', 'unavailable', 'disabled', 'broken', 'not_exposed'],
          why: 'CBP-027 asks a probe record to say which of a bridged CLI\'s commands and pages were available, unavailable, disabled, broken or not exposed. The five words are the unit\'s own; no schema closes them.' }
      ],
      /* Retired: this value was never in canon and is no longer produced. */
      retired_values: [
        { field: 'sourceClass', value: 'pm_observed', mappedTo: 'local_estimated',
          preservedAs: "sourceAuthority: 'Puppet Master observed'",
          why: 'Canon closes source_class at six values and pm_observed is not one of them. The meaning it carried — Puppet Master counted this itself — is preserved in source_authority, which canon leaves free-form.' }
      ]
    },

    /* Counting semantics per route (CV-196 / UF-085 / fixture GUI-USG-007).
       These declarations agree with the published table the renderers read
       (_shared/usage-data.js countingSemantics): `cache_in_input: additive`
       means cache is its OWN bucket and may be added; `inclusive` means it is
       already inside the input total and must never be added back. Routes the
       shared table does not publish stay `unknown` here, which is exactly how
       the renderers treat them — input plus output only, nothing assumed. */
    countingSemantics: {
      'fam:claude':      { published_row: 'Claude', cache_in_input: 'additive', reasoning_in_output: 'inclusive',
                           input_total_includes_cache: 'no', output_total_includes_reasoning: 'yes',
                           provider_total_semantics: 'provider_reported', cache_write_breakdown_state: 'reported',
                           note: 'Cache read and cache write are separate buckets on this route and are added; reasoning is already inside the output total and is never added again.' },
      'fam:openai':      { published_row: 'Codex · ChatGPT plan', cache_in_input: 'inclusive', reasoning_in_output: 'inclusive',
                           input_total_includes_cache: 'yes', output_total_includes_reasoning: 'yes',
                           provider_total_semantics: 'provider_reported', cache_write_breakdown_state: 'not_exposed',
                           note: 'Cache read is already counted inside the input total here, so adding it would inflate the call by roughly forty per cent.' },
      'fam:github':      { published_row: 'Copilot', cache_in_input: 'inclusive', reasoning_in_output: 'inclusive',
                           input_total_includes_cache: 'yes', output_total_includes_reasoning: 'yes',
                           provider_total_semantics: 'derived_input_plus_output', cache_write_breakdown_state: 'not_exposed' },
      'fam:opencode':    { published_row: 'OpenCode', cache_in_input: 'inclusive', reasoning_in_output: 'inclusive',
                           input_total_includes_cache: 'yes', output_total_includes_reasoning: 'yes',
                           provider_total_semantics: 'derived_input_plus_output', cache_write_breakdown_state: 'not_exposed' },
      'fam:google':      { published_row: 'Gemini Direct', cache_in_input: 'additive', reasoning_in_output: 'inclusive',
                           input_total_includes_cache: 'no', output_total_includes_reasoning: 'yes',
                           provider_total_semantics: 'provider_reported', cache_write_breakdown_state: 'not_exposed' },
      'fam:antigravity': { published_row: 'Antigravity CLI', cache_in_input: 'additive', reasoning_in_output: 'inclusive',
                           input_total_includes_cache: 'no', output_total_includes_reasoning: 'yes',
                           provider_total_semantics: 'unknown', cache_write_breakdown_state: 'unknown',
                           note: 'This CLI exposes no cache or usage command here, so the totals stay unknown rather than being derived from credits.' },
      'fam:alibaba':     { published_row: null, cache_in_input: 'unknown', reasoning_in_output: 'unknown',
                           input_total_includes_cache: 'unknown', output_total_includes_reasoning: 'unknown',
                           provider_total_semantics: 'unknown', cache_write_breakdown_state: 'unknown',
                           note: 'No counting rule is published for this route, so only input and output are ever added and the cache buckets stay visible but uncounted.' },
      'fam:kimi':        { published_row: null, cache_in_input: 'unknown', reasoning_in_output: 'unknown',
                           input_total_includes_cache: 'unknown', output_total_includes_reasoning: 'unknown',
                           provider_total_semantics: 'unknown', cache_write_breakdown_state: 'unknown' },
      'fam:zai':         { published_row: null, cache_in_input: 'unknown', reasoning_in_output: 'unknown',
                           input_total_includes_cache: 'unknown', output_total_includes_reasoning: 'unknown',
                           provider_total_semantics: 'unknown', cache_write_breakdown_state: 'unknown' },
      'fam:local':       { published_row: null, cache_in_input: 'unknown', reasoning_in_output: 'unknown',
                           input_total_includes_cache: 'unknown', output_total_includes_reasoning: 'unknown',
                           provider_total_semantics: 'not_exposed', cache_write_breakdown_state: 'not_exposed',
                           note: 'A local runtime exposes no usage record at all — nothing to read, which is different from reading zero.' },
      'route:unpublished': { published_row: null, cache_in_input: 'unknown', reasoning_in_output: 'unknown',
                           input_total_includes_cache: 'unknown', output_total_includes_reasoning: 'unknown',
                           provider_total_semantics: 'unknown', cache_write_breakdown_state: 'unknown',
                           note: 'No counting rule is published for this route, so only input and output are added.' }
    },

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
      /* `detail` says what the condition is; the figures come from the meter
         the row already renders. A second, hand-written copy of the same
         used/limit pair could only ever drift out of agreement with it. */
      { id: 'free:gemini-flash',   modelId: 'model:gemini-2-5-flash', connectionId: 'conn:google-antigravity-cli', condition: 'request_limited',      label: 'Free, limited', detail: 'Free while the daily request allowance lasts', meterId: 'meter:google-free-day', eligible: true },
      { id: 'free:glm-air',        modelId: 'model:glm-4-5-air',      connectionId: 'conn:zai-legacy',        condition: 'token_day',            label: 'Free, limited', detail: 'Free while the daily token allowance lasts', meterId: 'meter:zai-free-day', eligible: true, cooldownUntil: at(40 * MIN) },
      { id: 'free:copilot-req',    modelId: 'model:gpt-5-6',          connectionId: 'conn:github-copilot-free', condition: 'compute_units',      label: 'Free, limited', detail: 'Premium requests are compute-unit metered', meterId: 'meter:github-free-mo', eligible: true },
      { id: 'free:oc-go-models',   modelId: 'model:qwen3-coder-plus', connectionId: 'conn:opencode-go',       condition: 'conditional_on_plan',  label: 'Free with account requirements', detail: 'Requires an active OpenCode Go plan', meterId: 'meter:oc-go-free', eligible: true },
      /* A06-17: this row used to hard-code the display string 'Trial ends Aug 16
         00:00' — byte-identical in every timezone, with no zone label, and five
         and a half hours wrong for a reader in Kolkata. It now carries the
         instant; the shared formatter writes the label and the detail at load,
         and the ISO value below is what a host with no working zone would show. */
      { id: 'free:kimi-trial',     modelId: 'model:kimi-k2',          connectionId: 'conn:kimi-code',         condition: 'free_until',           endsAt: '2026-08-16T04:00:00Z', label: 'Free until 2026-08-16 (UTC)', detail: 'Trial ends 2026-08-16T04:00:00Z', meterId: 'meter:kimi-trial', eligible: true },
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
       logical turn / Goal stage / PlanningRun topic / Crew / thread
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
      { id: 'work-7',  kind: 'goal_stage',     label: 'Specialist reviews · stage 2', runId: 'run:goal-47',   status: 'running' },
      { id: 'work-8',  kind: 'planning_topic', label: 'Source extraction · topics',   runId: 'run:plan-12',   status: 'running' },
      { id: 'work-9',  kind: 'crew_step',      label: 'Critique round 1',             runId: 'run:crew-3',    status: 'running' },
      { id: 'work-10', kind: 'thread_request', label: 'Checkout service audit',       threadId: 'thread:t-91', status: 'running' },
      { id: 'work-11', kind: 'thread_request', label: 'Branch: retry on Claude',      threadId: 'thread:t-91-b1', status: 'running' },
      { id: 'work-12', kind: 'thread_request', label: 'Cross-project research child', threadId: 'thread:t-77', status: 'completed', endedAt: at(-3 * HOUR) },
      { id: 'work-h1', kind: 'turn',           label: 'Legacy: catalog sync',         threadId: null,          status: 'completed', endedAt: '2026-07-28T19:10:00Z', historical: true }
    ],

    attempts: [
      /* ---- work-1 · normal turn card (Hermes §11 example) ---- */
      { eventId: 'ue-501', workId: 'work-1', bucket: 'main', purpose: 'user_work', status: 'completed',
        requestedAccountId: 'acct:openai-personal', effectiveAccountId: 'acct:openai-personal',
        connectionId: 'conn:openai-personal-codex', productId: 'prod:codex-plus',
        requestedModelId: 'model:gpt-5-6-codex', effectiveModelId: 'model:gpt-5-6-codex',
        billingRoute: 'plan_included', tokens: { input: 42100, output: 3200, cacheRead: 18000, cacheWrite: 2400, reasoning: 1300, providerTotal: 45300, contextEstimate: 41800 },
        costMicro: 0, startedAt: at(-16 * MIN), finishedAt: at(-8 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-501',
        parentEventId: null, dedupeKey: 'dk-501', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true },
      { eventId: 'ue-502', workId: 'work-1', bucket: 'context', purpose: 'compression', status: 'completed',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-coding-plan',
        requestedModelId: 'model:qwen3-coder-plus', effectiveModelId: 'model:qwen3-coder-plus',
        billingRoute: 'plan_included', tokens: { input: 2400, output: 310 },
        costMicro: 0, startedAt: at(-14 * MIN), finishedAt: at(-13 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-502',
        parentEventId: 'ue-501', dedupeKey: 'dk-502', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        note: 'Compression helper for turn context' },
      { eventId: 'ue-503', workId: 'work-1', bucket: 'specialists', purpose: 'subagent', status: 'completed',
        requestedAccountId: 'acct:kimi-personal', effectiveAccountId: 'acct:kimi-personal',
        connectionId: 'conn:kimi-code', productId: 'prod:kimi-code-plan',
        requestedModelId: 'model:kimi-k2', effectiveModelId: 'model:kimi-k2',
        billingRoute: 'plan_included', tokens: { input: 8900, output: 1100, cacheRead: 4100 },
        costMicro: 0, startedAt: at(-13 * MIN), finishedAt: at(-9 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-503',
        parentEventId: 'ue-501', dedupeKey: 'dk-503', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        subagent: { role: 'Reviewer', persona: 'Skeptical reviewer' } },
      { eventId: 'ue-504', workId: 'work-1', bucket: 'research', purpose: 'web_extract', status: 'completed',
        requestedAccountId: 'acct:google-personal', effectiveAccountId: 'acct:google-personal',
        connectionId: 'conn:google-antigravity-cli', productId: 'prod:google-gemini-free',
        requestedModelId: 'model:gemini-2-5-flash', effectiveModelId: 'model:gemini-2-5-flash',
        billingRoute: 'free', tokens: { input: 1900, output: 240, providerTotal: 2140 },
        costMicro: 0, startedAt: at(-12 * MIN), finishedAt: at(-12 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-504',
        parentEventId: 'ue-501', dedupeKey: 'dk-504', streamState: 'final',
        costStatus: 'provider_reported', displayCostPolicy: 'show', hiddenByok: false, hiddenSubscription: false,
        note: 'Web extraction helper on the free allowance' },

      /* ---- work-2 · requested vs used mismatch (packet §8) ---- */
      { eventId: 'ue-510', workId: 'work-2', bucket: 'retries', purpose: 'user_work', status: 'failed',
        requestedAccountId: 'acct:openai-work', effectiveAccountId: 'acct:openai-work',
        connectionId: 'conn:openai-work-codex', productId: 'prod:codex-business',
        requestedModelId: 'model:gpt-5-6-codex', effectiveModelId: null,
        billingRoute: 'plan_included', tokens: {},
        costMicro: 0, startedAt: at(-30 * MIN), finishedAt: at(-30 * MIN),
        settlement: 'failed', sourceClass: 'cli_reported', receiptRef: 'rcpt-510',
        parentEventId: null, dedupeKey: 'dk-510', streamState: 'error',
        costStatus: 'unknown', displayCostPolicy: 'unknown', hiddenByok: false, hiddenSubscription: false,
        failureClass: 'provider_limit', unknownReason: 'the attempt failed before the provider reported any usage', routeReason: 'Work OpenAI had reached its limit, so this attempt could not run.',
        failReason: 'Work OpenAI had reached its limit' },
      { eventId: 'ue-511', workId: 'work-2', bucket: 'main', purpose: 'user_work', status: 'completed',
        requestedAccountId: 'acct:openai-work', effectiveAccountId: 'acct:openai-personal',
        connectionId: 'conn:openai-personal-codex', productId: 'prod:codex-plus',
        requestedModelId: 'model:gpt-5-6-codex', effectiveModelId: 'model:gpt-5-6-codex',
        billingRoute: 'plan_included', tokens: { input: 22400, output: 1800, cacheRead: 9600, reasoning: 640 },
        costMicro: 0, startedAt: at(-29 * MIN), finishedAt: at(-26 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-511',
        parentEventId: 'ue-510', dedupeKey: 'dk-511', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        routeReason: 'You chose Work OpenAI, but Puppet Master used Personal OpenAI because Work OpenAI had reached its limit.',
        mismatch: { reason: 'You chose Work OpenAI, but Puppet Master used Personal OpenAI because Work OpenAI had reached its limit.' } },

      /* ---- work-3 · mid-turn redirect (Hermes §6, delta §5) ---- */
      { eventId: 'ue-520', workId: 'work-3', bucket: 'main', purpose: 'user_work', status: 'interrupted',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: 'model:claude-opus-4-6',
        billingRoute: 'plan_included', tokens: { input: 6200, output: 400, reasoning: 260 },
        costMicro: 0, startedAt: at(-7 * MIN), finishedAt: at(-6 * MIN),
        settlement: 'streaming_partial', sourceClass: 'cli_reported', receiptRef: 'rcpt-520',
        parentEventId: null, dedupeKey: 'dk-520', streamState: 'aborted',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        partialReason: 'interrupted by your correction — the partial stream was retained once', usageObservedBeforeAbort: true,
        sessionId: 'sess-t88-1', conversationMode: 'agent', reasoningEffort: 'high', speedMode: 'normal',
        requestedAccessProfile: 'full_access', effectiveAccessProfile: 'full_access',
        redirect: { support: 'interrupt_and_resume', wastedTokens: 6600, note: 'Interrupted by your correction; partial usage retained.' } },
      { eventId: 'ue-521', workId: 'work-3', bucket: 'main', purpose: 'user_work', status: 'completed',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: 'model:claude-opus-4-6',
        billingRoute: 'plan_included', tokens: { input: 38400, output: 2900, cacheRead: 22000, reasoning: 1400, providerTotal: 63300, contextEstimate: 42200 },
        costMicro: 0, startedAt: at(-6 * MIN), finishedAt: at(-2 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-521',
        parentEventId: 'ue-520', dedupeKey: 'dk-521', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        sessionId: 'sess-t88-1', conversationMode: 'agent', reasoningEffort: 'high', speedMode: 'normal',
        requestedAccessProfile: 'full_access', effectiveAccessProfile: 'full_access',
        redirect: { resumed: true } },

      /* ---- work-4 · tool recovery, zero provider tokens (Hermes §5) ---- */
      { eventId: 'ue-530', workId: 'work-4', bucket: 'main', purpose: 'user_work', status: 'completed',
        requestedAccountId: 'acct:kimi-personal', effectiveAccountId: 'acct:kimi-personal',
        connectionId: 'conn:kimi-code', productId: 'prod:kimi-code-plan',
        requestedModelId: 'model:kimi-k2', effectiveModelId: 'model:kimi-k2',
        billingRoute: 'plan_included', tokens: { input: 15300, output: 900, cacheRead: 7700 },
        costMicro: 0, startedAt: at(-49 * MIN), finishedAt: at(-41 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-530',
        parentEventId: null, dedupeKey: 'dk-530', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        sessionId: 'sess-t88-2', conversationMode: 'review', reasoningEffort: 'medium', speedMode: 'fast',
        requestedAccessProfile: 'full_access', effectiveAccessProfile: 'review_limited',
        note: 'Full Access was limited by Review mode; safe browser/test tools still worked.' },

      /* ---- work-5 · approval reviewer + denial breaker (Hermes §7) ---- */
      { eventId: 'ue-540', workId: 'work-5', bucket: 'specialists', purpose: 'approval_review', status: 'completed',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-sonnet-4-6', effectiveModelId: 'model:claude-sonnet-4-6',
        billingRoute: 'plan_included', tokens: { input: 3100, output: 500, reasoning: 150 },
        costMicro: 0, startedAt: at(-62 * MIN), finishedAt: at(-61 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-540',
        parentEventId: 'ue-541', dedupeKey: 'dk-540', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        note: 'Approval reviewer' },

      /* ---- work-6 · vision alternate route (Hermes §15.13) ---- */
      { eventId: 'ue-550', workId: 'work-6', bucket: 'main', purpose: 'user_work', status: 'completed',
        requestedAccountId: 'acct:openai-personal', effectiveAccountId: 'acct:openai-personal',
        connectionId: 'conn:openai-personal-codex', productId: 'prod:codex-plus',
        requestedModelId: 'model:gpt-5-6-codex', effectiveModelId: 'model:gpt-5-6-codex',
        billingRoute: 'plan_included', tokens: { input: 9800, output: 700, reasoning: 240 },
        costMicro: 0, startedAt: at(-75 * MIN), finishedAt: at(-72 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-550',
        parentEventId: null, dedupeKey: 'dk-550', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        note: 'Text-only main model' },
      { eventId: 'ue-551', workId: 'work-6', bucket: 'research', purpose: 'vision', status: 'completed',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-api', productId: 'prod:claude-api-payg',
        requestedModelId: 'model:claude-sonnet-4-6', effectiveModelId: 'model:claude-sonnet-4-6',
        billingRoute: 'api_billed', tokens: { input: 5400, output: 300, reasoning: 90 },
        costMicro: 30000, startedAt: at(-74 * MIN), finishedAt: at(-73 * MIN),
        settlement: 'streaming_partial', sourceClass: 'provider_reported', receiptRef: 'rcpt-551',
        parentEventId: 'ue-550', dedupeKey: 'dk-551', streamState: 'partial',
        /* A03-08: the only call in this dataset whose money came from a price
           list rather than from the provider's own statement — the stream is
           still partial, so Puppet Master values it from the published Claude
           API list and says which list, which version and from when. When the
           invoice settles, the provider's figure replaces this one. */
        costStatus: 'priced', displayCostPolicy: 'show', hiddenByok: false, hiddenSubscription: false,
        pricingSnapshotId: 'psnap-claude-api-2026-08-01', pricingSource: 'provider_price_list',
        pricingEffectiveAt: '2026-08-01T00:00:00Z', pricingVersion: '2026.08.1',
        note: 'Separately billed vision helper' },

      /* ---- work-7 · Goal children admitted now (delta §2) ---- */
      { eventId: 'ue-560', workId: 'work-7', bucket: 'specialists', purpose: 'subagent', status: 'running',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-coding-plan',
        requestedModelId: 'model:qwen3-coder-plus', effectiveModelId: 'model:qwen3-coder-plus',
        billingRoute: 'plan_included', tokens: { input: 12100, output: 800, cacheWrite: 3100 },
        costMicro: 0, startedAt: at(-11 * MIN), finishedAt: null,
        settlement: 'streaming_partial', sourceClass: 'provider_reported', receiptRef: 'rcpt-560',
        parentEventId: null, dedupeKey: 'dk-560', streamState: 'partial',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        subagent: { role: 'Pricing specialist', persona: 'Domain analyst', child: 'child-47-1' } },
      { eventId: 'ue-561', workId: 'work-7', bucket: 'specialists', purpose: 'subagent', status: 'running',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-coding-plan',
        requestedModelId: 'model:qwen3-coder-plus', effectiveModelId: 'model:qwen3-coder-plus',
        billingRoute: 'plan_included', tokens: { input: 10800, output: 600 },
        costMicro: 0, startedAt: at(-11 * MIN), finishedAt: null,
        settlement: 'streaming_partial', sourceClass: 'provider_reported', receiptRef: 'rcpt-561',
        parentEventId: null, dedupeKey: 'dk-561', streamState: 'partial',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        subagent: { role: 'Migration specialist', persona: 'Domain analyst', child: 'child-47-2' } },

      /* ---- work-8 · PlanningRun: quality conversation + cheap extraction (delta §5) ---- */
      { eventId: 'ue-570', workId: 'work-8', bucket: 'main', purpose: 'user_work', status: 'completed',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: 'model:claude-opus-4-6',
        billingRoute: 'plan_included', tokens: { input: 51200, output: 4100, cacheRead: 30100, cacheWrite: 4100, cacheWrite1h: 4100, reasoning: 2400, providerTotal: 89500 },
        costMicro: 0, startedAt: at(-95 * MIN), finishedAt: at(-80 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-570',
        parentEventId: null, dedupeKey: 'dk-570', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        note: 'High-quality conversational planning route', runLineage: 'planning_run' },
      { eventId: 'ue-571', workId: 'work-8', bucket: 'research', purpose: 'subagent', status: 'completed',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-coding-plan',
        requestedModelId: 'model:qwen3-max', effectiveModelId: 'model:qwen3-max',
        billingRoute: 'plan_included', tokens: { input: 24800, output: 1200 },
        costMicro: 0, startedAt: at(-79 * MIN), finishedAt: at(-70 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-571',
        parentEventId: 'ue-570', dedupeKey: 'dk-571', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        roleLabel: 'Source extraction', subagent: { child: 'plan-12-ext-1', role: 'Extraction' } },
      { eventId: 'ue-572', workId: 'work-8', bucket: 'research', purpose: 'subagent', status: 'completed',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-coding-plan',
        requestedModelId: 'model:qwen3-max', effectiveModelId: 'model:qwen3-max',
        billingRoute: 'plan_included', tokens: { input: 21300, output: 900 },
        costMicro: 0, startedAt: at(-79 * MIN), finishedAt: at(-69 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-572',
        parentEventId: 'ue-570', dedupeKey: 'dk-572', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        roleLabel: 'Source extraction', subagent: { child: 'plan-12-ext-2', role: 'Extraction' } },
      { eventId: 'ue-573', workId: 'work-8', bucket: 'research', purpose: 'subagent', status: 'running',
        requestedAccountId: 'acct:kimi-personal', effectiveAccountId: 'acct:kimi-personal',
        connectionId: 'conn:kimi-code', productId: 'prod:kimi-code-plan',
        requestedModelId: 'model:kimi-k2', effectiveModelId: 'model:kimi-k2',
        billingRoute: 'plan_included', tokens: { input: 18100, output: 400 },
        costMicro: 0, startedAt: at(-24 * MIN), finishedAt: null,
        settlement: 'streaming_partial', sourceClass: 'provider_reported', receiptRef: 'rcpt-573',
        parentEventId: 'ue-570', dedupeKey: 'dk-573', streamState: 'partial',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        roleLabel: 'Source extraction', subagent: { child: 'plan-12-ext-3', role: 'Extraction' } },
      { eventId: 'ue-574', workId: 'work-8', bucket: 'research', purpose: 'subagent', status: 'queued',
        requestedAccountId: 'acct:kimi-personal', effectiveAccountId: null,
        connectionId: 'conn:kimi-code', productId: 'prod:kimi-code-plan',
        requestedModelId: 'model:kimi-k2', effectiveModelId: null,
        billingRoute: 'plan_included', tokens: {},
        costMicro: 0, startedAt: null, finishedAt: null,
        settlement: 'unknown', sourceClass: 'unknown', receiptRef: null,
        parentEventId: 'ue-570', dedupeKey: 'dk-574', streamState: 'unknown',
        costStatus: 'unknown', displayCostPolicy: 'unknown', hiddenByok: false, hiddenSubscription: false,
        unknownReason: 'no provider attempt was made, so there is nothing to price', routeReason: 'Held by Puppet Master policy — two extraction children run at a time.', queuedReason: 'pm_policy',
        roleLabel: 'Source extraction', subagent: { child: 'plan-12-ext-4', role: 'Extraction' },
        note: 'Queued — no provider attempt yet' },

      /* ---- work-9 · mixed-provider Crew + reducer (delta §5) ---- */
      { eventId: 'ue-580', workId: 'work-9', bucket: 'specialists', purpose: 'crew_member', status: 'completed',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-sonnet-4-6', effectiveModelId: 'model:claude-sonnet-4-6',
        billingRoute: 'plan_included', tokens: { input: 14200, output: 1600, reasoning: 520 },
        costMicro: 0, startedAt: at(-52 * MIN), finishedAt: at(-46 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-580',
        parentEventId: null, dedupeKey: 'dk-580', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        subagent: { role: 'Critique · layout', persona: 'Senior design critic', child: 'crew-3-m1' } },
      { eventId: 'ue-581', workId: 'work-9', bucket: 'specialists', purpose: 'crew_member', status: 'completed',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-coding-plan',
        requestedModelId: 'model:qwen3-coder-plus', effectiveModelId: 'model:qwen3-coder-plus',
        billingRoute: 'plan_included', tokens: { input: 11900, output: 1100 },
        costMicro: 0, startedAt: at(-52 * MIN), finishedAt: at(-47 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-581',
        parentEventId: null, dedupeKey: 'dk-581', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        subagent: { role: 'Critique · data', persona: 'Data skeptic', child: 'crew-3-m2' } },
      { eventId: 'ue-582', workId: 'work-9', bucket: 'specialists', purpose: 'crew_member', status: 'running',
        requestedAccountId: 'acct:kimi-personal', effectiveAccountId: 'acct:kimi-personal',
        connectionId: 'conn:kimi-code', productId: 'prod:kimi-code-plan',
        requestedModelId: 'model:kimi-k2', effectiveModelId: 'model:kimi-k2',
        billingRoute: 'plan_included', tokens: { input: 9400, output: 300 },
        costMicro: 0, startedAt: at(-19 * MIN), finishedAt: null,
        settlement: 'streaming_partial', sourceClass: 'provider_reported', receiptRef: 'rcpt-582',
        parentEventId: null, dedupeKey: 'dk-582', streamState: 'partial',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        subagent: { role: 'Critique · motion', persona: 'Motion reviewer', child: 'crew-3-m3' } },
      { eventId: 'ue-583', workId: 'work-9', bucket: 'specialists', purpose: 'crew_member', status: 'queued',
        requestedAccountId: 'acct:openai-personal', effectiveAccountId: null,
        connectionId: 'conn:openai-personal-codex', productId: 'prod:codex-plus',
        requestedModelId: 'model:gpt-5-6-codex', effectiveModelId: null,
        billingRoute: 'plan_included', tokens: {},
        costMicro: 0, startedAt: null, finishedAt: null,
        settlement: 'unknown', sourceClass: 'unknown', receiptRef: null,
        parentEventId: null, dedupeKey: 'dk-583', streamState: 'unknown',
        costStatus: 'unknown', displayCostPolicy: 'unknown', hiddenByok: false, hiddenSubscription: false,
        queuedReason: 'provider_limit', unknownReason: 'no provider attempt was made, so there is nothing to price', routeReason: 'Requested Personal OpenAI · not dispatched because the provider limit was already reached.',
        subagent: { role: 'Critique · copy', persona: 'Copy editor', child: 'crew-3-m4' },
        note: 'Queued — no provider attempt yet' },
      { eventId: 'ue-584', workId: 'work-9', bucket: 'synthesis', purpose: 'crew_member', status: 'queued',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: null,
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: null,
        billingRoute: 'plan_included', tokens: {},
        costMicro: 0, startedAt: null, finishedAt: null,
        settlement: 'unknown', sourceClass: 'unknown', receiptRef: null,
        parentEventId: null, dedupeKey: 'dk-584', streamState: 'unknown',
        costStatus: 'unknown', displayCostPolicy: 'unknown', hiddenByok: false, hiddenSubscription: false,
        queuedReason: 'pm_policy', unknownReason: 'no provider attempt was made, so there is nothing to price', routeReason: 'Reducer capacity is reserved by Puppet Master policy until the members finish.',
        roleLabel: 'Reducer', note: 'Reducer/synthesis reserved until members finish' },

      /* ---- work-10 · model switch + replay (Hermes §15.4) ---- */
      { eventId: 'ue-590', workId: 'work-10', bucket: 'main', purpose: 'user_work', status: 'completed',
        requestedAccountId: 'acct:openai-personal', effectiveAccountId: 'acct:openai-personal',
        connectionId: 'conn:openai-personal-codex', productId: 'prod:codex-plus',
        requestedModelId: 'model:gpt-5-6-codex', effectiveModelId: 'model:gpt-5-6-codex',
        billingRoute: 'plan_included', tokens: { input: 61000, output: 4800, cacheRead: 40200, cacheWrite: 1800, reasoning: 2600, providerTotal: 65800 },
        costMicro: 0, startedAt: at(-160 * MIN), finishedAt: at(-140 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-590',
        parentEventId: null, dedupeKey: 'dk-590', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true },
      { eventId: 'ue-591', workId: 'work-10', bucket: 'retries', purpose: 'conversation_replay', status: 'completed',
        requestedAccountId: 'acct:kimi-personal', effectiveAccountId: 'acct:kimi-personal',
        connectionId: 'conn:kimi-code', productId: 'prod:kimi-code-plan',
        requestedModelId: 'model:kimi-k2', effectiveModelId: 'model:kimi-k2',
        billingRoute: 'plan_included', tokens: { input: 48900, output: 200 },
        costMicro: 0, startedAt: at(-138 * MIN), finishedAt: at(-136 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-591',
        parentEventId: 'ue-590', dedupeKey: 'dk-591', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        note: 'Replay after model switch — old cache did not carry over' },
      { eventId: 'ue-592', workId: 'work-10', bucket: 'main', purpose: 'user_work', status: 'completed',
        requestedAccountId: 'acct:kimi-personal', effectiveAccountId: 'acct:kimi-personal',
        connectionId: 'conn:kimi-code', productId: 'prod:kimi-code-plan',
        requestedModelId: 'model:kimi-k2', effectiveModelId: 'model:kimi-k2',
        billingRoute: 'plan_included', tokens: { input: 33700, output: 2600, cacheRead: 24800, contextEstimate: 88400 },
        costMicro: 0, startedAt: at(-135 * MIN), finishedAt: at(-120 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-592',
        parentEventId: null, dedupeKey: 'dk-592', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true },

      /* ---- work-11 · provider branch, ancestry preserved (delta §5) ---- */
      { eventId: 'ue-650', workId: 'work-11', bucket: 'retries', purpose: 'conversation_replay', status: 'completed',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: 'model:claude-opus-4-6',
        billingRoute: 'plan_included', tokens: { input: 44100, output: 300, reasoning: 90 },
        costMicro: 0, startedAt: at(-115 * MIN), finishedAt: at(-113 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-650',
        parentEventId: 'ue-592', dedupeKey: 'dk-650', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        replayKind: 'branch',
        branch: { sourceThreadId: 'thread:t-91', branchPoint: 'msg-m47', ancestry: ['thread:t-91', 'work-10'],
          note: 'This branch replayed context on a new connection, so cache reuse restarted.' } },
      { eventId: 'ue-651', workId: 'work-11', bucket: 'main', purpose: 'user_work', status: 'running',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: 'model:claude-opus-4-6',
        billingRoute: 'plan_included', tokens: { input: 21900, output: 1400, cacheRead: 15200, reasoning: 480 },
        costMicro: 0, startedAt: at(-112 * MIN), finishedAt: null,
        settlement: 'streaming_partial', sourceClass: 'cli_reported', receiptRef: 'rcpt-651',
        parentEventId: 'ue-650', dedupeKey: 'dk-651', streamState: 'partial',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true },

      /* ---- work-12 · cross-project child (delta §5, §10.12) ---- */
      { eventId: 'ue-652', workId: 'work-12', bucket: 'specialists', purpose: 'subagent', status: 'completed',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-coding-plan',
        requestedModelId: 'model:qwen3-max', effectiveModelId: 'model:qwen3-max',
        billingRoute: 'plan_included', tokens: { input: 17600, output: 2100 },
        costMicro: 0, startedAt: at(-200 * MIN), finishedAt: at(-180 * MIN),
        settlement: 'settled', sourceClass: 'provider_reported', receiptRef: 'rcpt-652',
        parentEventId: null, dedupeKey: 'dk-652', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
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
        settlement: 'observed', sourceClass: 'local_estimated', sourceAuthority: 'Puppet Master observed', receiptRef: 'rcpt-620',
        parentEventId: null, dedupeKey: 'dk-620', streamState: 'final',
        costStatus: 'provider_reported', displayCostPolicy: 'show', hiddenByok: false, hiddenSubscription: false,
        note: 'Active free-model probe — validation activity, not user work' },

      /* ---- historical · removed account (packet §6.3)
         The removed account keeps its OWN route identity: a preserved,
         never-selectable connection and product, so an old event can still
         say which plan and billing route paid for it (audit A02-05). ---- */
      { eventId: 'ue-091', workId: 'work-h1', bucket: 'main', purpose: 'user_work', status: 'completed',
        requestedAccountId: 'acct:openai-old', effectiveAccountId: 'acct:openai-old',
        connectionId: 'conn:openai-old-vault', productId: 'prod:openai-old-payg',
        requestedModelId: 'model:gpt-5-6', effectiveModelId: 'model:gpt-5-6',
        billingRoute: 'api_billed', tokens: { input: 30200, output: 2400, reasoning: 900 },
        costMicro: 410000, startedAt: '2026-07-28T18:40:00Z', finishedAt: '2026-07-28T19:10:00Z',
        settlement: 'settled', sourceClass: 'provider_reported', receiptRef: 'rcpt-091',
        parentEventId: null, dedupeKey: 'dk-091', streamState: 'final',
        costStatus: 'provider_reported', displayCostPolicy: 'show', hiddenByok: false, hiddenSubscription: false,
        historicalIdentity: { accountId: 'acct:openai-old', label: 'Removed account · Old OpenAI' } },
      { eventId: 'ue-092', workId: 'work-h1', bucket: 'main', purpose: 'user_work', status: 'completed',
        requestedAccountId: 'acct:openai-old', effectiveAccountId: 'acct:openai-old',
        connectionId: 'conn:openai-old-env', productId: 'prod:openai-old-payg-env',
        requestedModelId: 'model:gpt-5-6', effectiveModelId: 'model:gpt-5-6',
        billingRoute: 'api_billed', tokens: { input: 18900, output: 1500, reasoning: 560 },
        costMicro: 260000, startedAt: '2026-07-28T17:55:00Z', finishedAt: '2026-07-28T18:12:00Z',
        settlement: 'adjusted', sourceClass: 'provider_reported', receiptRef: 'rcpt-092',
        parentEventId: null, dedupeKey: 'dk-092', streamState: 'final',
        costStatus: 'provider_reported', displayCostPolicy: 'show', hiddenByok: false, hiddenSubscription: false,
        adjustment: { at: '2026-07-31T09:05:00Z', fromMicro: 284000, toMicro: 260000,
          reason: 'Provider re-rated this request after the invoice closed; the corrected charge replaced the settled one.' },
        historicalIdentity: { accountId: 'acct:openai-old', label: 'Removed account · Old OpenAI' } },

      /* ---- final cumulative packet (2026-08-08) — BSD, attachment
         transform, MoA, router/skill/title helpers, fallback, offline
         replay, post-install verification, Extra Bundle settlement ---- */
      { eventId: 'ue-600', workId: 'work-1', bucket: 'validation', purpose: 'bsd', status: 'completed',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: 'model:claude-opus-4-6',
        billingRoute: 'plan_included', tokens: { input: 2600, output: 120, cacheRead: 1400, reasoning: 40 },
        costMicro: 0, startedAt: at(-19 * MIN), finishedAt: at(-19 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-630',
        parentEventId: 'ue-501', dedupeKey: 'dk-600', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        bsd: { mode: 'Auto', trigger: 'high-risk edit', silent: true, latencyMs: 4100 } },
      { eventId: 'ue-601', workId: 'work-3', bucket: 'validation', purpose: 'bsd', status: 'completed',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: 'model:claude-opus-4-6',
        billingRoute: 'plan_included', tokens: { input: 4100, output: 260, cacheRead: 1800, reasoning: 90 },
        costMicro: 0, startedAt: at(-5 * MIN), finishedAt: at(-5 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-631',
        parentEventId: 'ue-520', dedupeKey: 'dk-601', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        bsd: { mode: 'On', trigger: 'redirect', silent: false, advice: 'Keep the public API stable', duplicateOf: null } },
      { eventId: 'ue-602', workId: 'work-6', bucket: 'research', purpose: 'attachment_transform', status: 'completed',
        requestedAccountId: 'acct:google-personal', effectiveAccountId: 'acct:google-personal',
        connectionId: 'conn:google-antigravity-cli', productId: 'prod:google-gemini-free',
        requestedModelId: 'model:gemini-2-5-flash', effectiveModelId: 'model:gemini-2-5-flash',
        billingRoute: 'plan_included', tokens: { input: 5600, output: 480 },
        costMicro: 0, startedAt: at(-73 * MIN), finishedAt: at(-72 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-632',
        parentEventId: 'ue-550', dedupeKey: 'dk-602', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        attachment: { name: 'receipt.jpg', transform: 'pm_vision_ocr', derivedArtifactIds: ['art-91'],
          consent: 'project_default', localCompute: 'none', privacy: 'provider_route' } },
      { eventId: 'ue-603', workId: 'work-1', bucket: 'tools', purpose: 'mcp_router', status: 'completed',
        requestedAccountId: 'acct:opencode-personal', effectiveAccountId: 'acct:opencode-personal',
        connectionId: 'conn:opencode-shared-gw', productId: 'prod:shared-gw-route',
        requestedModelId: 'model:qwen3-max', effectiveModelId: 'model:qwen3-max',
        billingRoute: 'free', tokens: { input: 1100, output: 140 },
        costMicro: 0, startedAt: at(-11 * MIN), finishedAt: at(-11 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-633',
        parentEventId: 'ue-501', dedupeKey: 'dk-603', streamState: 'final',
        costStatus: 'provider_reported', displayCostPolicy: 'show', hiddenByok: false, hiddenSubscription: false },
      { eventId: 'ue-604', workId: 'work-1', bucket: 'tools', purpose: 'skill_search', status: 'completed',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-coding-plan',
        requestedModelId: 'model:qwen3-coder-plus', effectiveModelId: 'model:qwen3-coder-plus',
        billingRoute: 'plan_included', tokens: { input: 900, output: 110, cacheRead: 300 },
        costMicro: 0, startedAt: at(-10 * MIN), finishedAt: at(-10 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-634',
        parentEventId: 'ue-501', dedupeKey: 'dk-604', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true },
      { eventId: 'ue-605', workId: 'work-2', bucket: 'main', purpose: 'title_generation', status: 'completed',
        requestedAccountId: 'acct:kimi-personal', effectiveAccountId: 'acct:kimi-personal',
        connectionId: 'conn:kimi-code', productId: 'prod:kimi-code-plan',
        requestedModelId: 'model:kimi-k2', effectiveModelId: 'model:kimi-k2',
        billingRoute: 'plan_included', tokens: { input: 800, output: 100 },
        costMicro: 0, startedAt: at(-28 * MIN), finishedAt: at(-28 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-635',
        parentEventId: 'ue-511', dedupeKey: 'dk-605', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true },
      { eventId: 'ue-606', workId: 'work-8', bucket: 'research', purpose: 'moa_reference', status: 'completed',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-coding-plan',
        requestedModelId: 'model:qwen3-max', effectiveModelId: 'model:qwen3-max',
        billingRoute: 'plan_included', tokens: { input: 3400, output: 420, cacheRead: 900 },
        costMicro: 0, startedAt: at(-35 * MIN), finishedAt: at(-31 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-636',
        parentEventId: 'ue-570', dedupeKey: 'dk-606', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        hostId: 'host:truenas', envId: 'env:docker' },
      { eventId: 'ue-607', workId: 'work-8', bucket: 'synthesis', purpose: 'moa_aggregator', status: 'running',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: 'model:claude-opus-4-6',
        billingRoute: 'plan_included', tokens: { input: 6000, output: 900, cacheRead: 2000, reasoning: 300 },
        costMicro: 0, startedAt: at(-29 * MIN), finishedAt: null,
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-637',
        parentEventId: 'ue-570', dedupeKey: 'dk-607', streamState: 'partial',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        hostId: 'host:truenas', envId: 'env:docker' },
      { eventId: 'ue-608', workId: 'work-10', bucket: 'retries', purpose: 'fallback_attempt', status: 'completed',
        requestedAccountId: 'acct:openai-work', effectiveAccountId: 'acct:openai-personal',
        connectionId: 'conn:openai-personal-codex', productId: 'prod:codex-plus',
        requestedModelId: 'model:gpt-5-6-codex', effectiveModelId: 'model:gpt-5-6-codex',
        billingRoute: 'plan_included', tokens: { input: 5200, output: 640, cacheRead: 1700, reasoning: 210 },
        costMicro: 0, startedAt: at(-118 * MIN), finishedAt: at(-116 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-638',
        parentEventId: 'ue-590', dedupeKey: 'dk-608', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        routeReason: 'You chose Work OpenAI, but Puppet Master used Personal OpenAI because Work OpenAI had reached its limit.',
        fallbackReason: 'Work account at limit' },
      /* The Codex CLI update's verification call. Two corrections, both from
         the audit:
         A08-05 — it used to carry workId 'work-4', so the maintenance verify was
         counted as a helper call on the user turn 'Run integration tests'. A
         pure validation event belongs to no logical turn; it hangs off the
         maintenance flow instead, and reaches a surface through the operations
         card and the background list.
         A08-06 — it used to run on OpenCode Go, so a reader was shown a Codex
         CLI maintenance flow drawing down an unrelated account's plan allowance
         with nothing to explain it. Verification means running the newly
         installed CLI once, so it runs through the CLI being updated and draws
         that connection's allowance. */
      { eventId: 'ue-609', workId: null, bucket: 'validation', purpose: 'probe', status: 'completed',
        requestedAccountId: 'acct:openai-personal', effectiveAccountId: 'acct:openai-personal',
        connectionId: 'conn:openai-personal-codex', productId: 'prod:codex-plus',
        requestedModelId: 'model:gpt-5-6-codex', effectiveModelId: 'model:gpt-5-6-codex',
        billingRoute: 'plan_included', tokens: { input: 1500, output: 210 },
        costMicro: 0, startedAt: at(-52 * MIN), finishedAt: at(-52 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-639',
        parentEventId: null, dedupeKey: 'dk-609', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        validationFor: 'ops-1', operationalRef: 'ops-1',
        /* A08-01: the attempt inspector is the one surface that shows this
           call and the maintenance record it validates side by side, and it
           showed a rolled-back update without ever saying what failed. The
           call itself completed — the model answered — and it is the VERIFY
           STEP that did not pass, which are two different facts about the
           same minute and are stated as two. */
        note: 'Verification call for the Codex CLI update. It runs through the CLI that was just installed, on that CLI\'s own connection, which is why the Codex plan allowance moved and no other account\'s did. The installer time is not usage; this call is. This call completed; the verify step it belongs to did not — the update record\'s failure class is verify failed, so v0.43.1 was rolled back and v0.42.0 is what is installed.' },
      { eventId: 'ue-610', workId: 'work-10', bucket: 'retries', purpose: 'conversation_replay', status: 'completed',
        requestedAccountId: 'acct:kimi-personal', effectiveAccountId: 'acct:kimi-personal',
        connectionId: 'conn:kimi-code', productId: 'prod:kimi-code-plan',
        requestedModelId: 'model:kimi-k2', effectiveModelId: 'model:kimi-k2',
        billingRoute: 'plan_included', tokens: { input: 4800, output: 150 },
        costMicro: 0, startedAt: at(-105 * MIN), finishedAt: at(-104 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-640',
        parentEventId: 'ue-592', dedupeKey: 'dk-610', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        replayKind: 'offline_reconnect', operationalRef: 'ops-2' },
      { eventId: 'ue-611', workId: 'work-1', bucket: 'main', purpose: 'user_work', status: 'completed',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-extra-bundle',
        requestedModelId: 'model:qwen3-coder-plus', effectiveModelId: 'model:qwen3-coder-plus',
        billingRoute: 'usage_pack', tokens: { input: 3900, output: 540, cacheRead: 1200 },
        costMicro: 0, startedAt: at(-6 * MIN), finishedAt: at(-4 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-641',
        parentEventId: null, dedupeKey: 'dk-611', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        note: 'Drawn from the Extra Bundle after included usage ran low' },

      /* ---- canonical fixture additions (independent audit, 2026-08-17)
         Each attempt below exists because a claimed fixture had no data
         behind it: a requested/effective MODEL difference, the one missing
         purpose value, the two discarded statuses, a probe that draws a real
         allowance, the three unreached billing routes, and the cost states
         (hidden BYOK, unknown-fails-closed) canon requires. ---- */

      /* Requested model ≠ effective model — an account-level fallback is a
         different fact and was the only one the data used to have. */
      { eventId: 'ue-541', workId: 'work-5', bucket: 'main', purpose: 'user_work', status: 'completed',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: 'model:claude-sonnet-4-6',
        billingRoute: 'plan_included', tokens: { input: 12800, output: 1500, cacheRead: 6400, reasoning: 520 },
        costMicro: 0, startedAt: at(-66 * MIN), finishedAt: at(-62 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-541',
        parentEventId: null, dedupeKey: 'dk-541', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        mismatch: { kind: 'model', requestedModelId: 'model:claude-opus-4-6', effectiveModelId: 'model:claude-sonnet-4-6',
          reason: 'You chose Claude Opus 4.6, but Puppet Master used Claude Sonnet 4.6 because the Opus 5-hour window was already under pressure.' },
        routeReason: 'You chose Claude Opus 4.6, but Puppet Master used Claude Sonnet 4.6 because the Opus 5-hour window was already under pressure.',
        note: 'The route the request asked for and the route that ran are both kept; neither overwrites the other.' },

      /* The one purpose value that had no event, on the server form that had
         no work: a catalog check whose stale row was served first. */
      { eventId: 'ue-612', workId: null, bucket: 'validation', purpose: 'catalog_validation', status: 'stale_served_then_refreshed',
        requestedAccountId: 'acct:zai-personal', effectiveAccountId: 'acct:zai-personal',
        connectionId: 'conn:zai-credits', productId: 'prod:zai-credit-plan',
        requestedModelId: 'model:glm-4-7', effectiveModelId: 'model:glm-4-7',
        billingRoute: 'plan_included', tokens: { input: 900, output: 80 },
        costMicro: 0, startedAt: at(-15 * MIN), finishedAt: at(-14 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-612',
        parentEventId: null, dedupeKey: 'dk-612', streamState: 'final',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        hostId: 'host:unraid', envId: 'env:docker', sourceLocationId: 'srcloc:tastebook-server', clientId: null,
        catalogRef: 'cat-2', freeModelRef: 'free:glm-unverified',
        note: 'The last known good catalog row was served immediately and this call refreshed it afterwards. The free status still could not be confirmed, so the row stays “could not verify” — never “free”.' },

      /* A helper can consume real usage and still have its result thrown
         away: the compaction timed out, nothing was committed, the tokens
         happened anyway and are counted exactly once. */
      { eventId: 'ue-613', workId: 'work-1', bucket: 'context', purpose: 'compression', status: 'timed_out_discarded',
        requestedAccountId: 'acct:alibaba-personal', effectiveAccountId: 'acct:alibaba-personal',
        connectionId: 'conn:alibaba-personal-coding', productId: 'prod:alibaba-coding-plan',
        requestedModelId: 'model:qwen3-coder-plus', effectiveModelId: 'model:qwen3-coder-plus',
        billingRoute: 'plan_included', tokens: { input: 8600 },
        costMicro: 0, startedAt: at(-101 * MIN), finishedAt: at(-100 * MIN),
        settlement: 'streaming_partial', sourceClass: 'provider_reported', receiptRef: 'rcpt-613',
        parentEventId: null, dedupeKey: 'dk-613', streamState: 'aborted',
        costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered', hiddenByok: false, hiddenSubscription: true,
        partialReason: 'the helper timed out before the provider finished the stream', usageObservedBeforeAbort: true,
        maintenanceRef: 'cm-5', discarded: true,
        discardedReason: 'The compaction result was discarded and no context change was committed. The provider work still happened, so it is recorded once — output was never reported and stays unknown, not zero.' },

      /* Your own key pays for this route, so the price is hidden rather than
         invented, and the usage record survives intact. */
      { eventId: 'ue-614', workId: 'work-4', bucket: 'main', purpose: 'user_work', status: 'completed',
        requestedAccountId: 'acct:zai-personal', effectiveAccountId: 'acct:zai-personal',
        connectionId: 'conn:zai-legacy', productId: 'prod:zai-legacy-plan',
        requestedModelId: 'model:glm-4-7', effectiveModelId: 'model:glm-4-7',
        billingRoute: 'api_billed', tokens: { input: 7400, output: 820 },
        costMicro: null, startedAt: at(-47 * MIN), finishedAt: at(-45 * MIN),
        settlement: 'observed', sourceClass: 'provider_reported', receiptRef: 'rcpt-614',
        parentEventId: null, dedupeKey: 'dk-614', streamState: 'final',
        costStatus: 'hidden_byok', displayCostPolicy: 'hide', hiddenByok: true, hiddenSubscription: false,
        byok: true,
        note: 'Billed to your own provider account. Tokens, route and settlement are kept in full; the per-token price is hidden because Puppet Master does not hold the price you pay.' },

      /* Background validation that draws a real allowance — the earlier probe
         ran on a route with no allowance to draw. */
      { eventId: 'ue-615', workId: null, bucket: 'validation', purpose: 'probe', status: 'completed',
        requestedAccountId: 'acct:google-personal', effectiveAccountId: 'acct:google-personal',
        connectionId: 'conn:google-antigravity-cli', productId: 'prod:google-gemini-free',
        requestedModelId: 'model:gemini-2-5-flash', effectiveModelId: 'model:gemini-2-5-flash',
        billingRoute: 'free', tokens: { input: 1100, output: 90 },
        costMicro: 0, startedAt: at(-58 * MIN), finishedAt: at(-58 * MIN),
        settlement: 'observed', sourceClass: 'cli_reported', receiptRef: 'rcpt-615',
        parentEventId: null, dedupeKey: 'dk-615', streamState: 'final',
        costStatus: 'provider_reported', displayCostPolicy: 'show', hiddenByok: false, hiddenSubscription: false,
        allowance: { meterId: 'meter:google-free-day', unit: 'requests', consumedUnits: 1, quotaStatus: 'reported',
          usedAfter: 18, limit: 60, remainingAfter: 42,
          note: 'One free request of today’s 60 went to validation, not to your work — the daily allowance moved because of it.' },
        note: 'Active free-model probe — validation activity that still spends the allowance it checks.' },

      /* Unknown cost fails closed, and an unknown settlement route is not
         guessed into the nearest plan. */
      { eventId: 'ue-616', workId: 'work-4', bucket: 'main', purpose: 'user_work', status: 'completed',
        requestedAccountId: 'acct:zai-personal', effectiveAccountId: 'acct:zai-personal',
        connectionId: 'conn:zai-credits', productId: 'prod:zai-credit-plan',
        requestedModelId: 'model:deepseek-v3-2', effectiveModelId: 'model:deepseek-v3-2',
        billingRoute: 'unknown', tokens: { input: 5200, output: 610 },
        costMicro: null, startedAt: at(-44 * MIN), finishedAt: at(-43 * MIN),
        settlement: 'unknown', sourceClass: 'provider_reported', receiptRef: 'rcpt-616',
        parentEventId: null, dedupeKey: 'dk-616', streamState: 'final',
        costStatus: 'unknown', displayCostPolicy: 'unknown', hiddenByok: false, hiddenSubscription: false,
        unknownReason: 'the provider returned tokens with no price and no plan attribution for this call',
        note: 'The tokens are provider-reported and certain. The price and the paying product are not, so both stay unknown — never a zero and never the nearest guess.' },

      /* Continuation after the included window: metered extra usage inside
         the user's own spending limit. */
      { eventId: 'ue-617', workId: 'work-3', bucket: 'main', purpose: 'user_work', status: 'completed',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: 'acct:claude-work',
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-extra',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: 'model:claude-opus-4-6',
        billingRoute: 'extra_balance', tokens: { input: 9600, output: 1250, cacheRead: 5200, reasoning: 430 },
        costMicro: 180000, startedAt: at(-5 * MIN), finishedAt: at(-4 * MIN),
        settlement: 'settled', sourceClass: 'provider_reported', receiptRef: 'rcpt-617',
        parentEventId: 'ue-521', dedupeKey: 'dk-617', streamState: 'final',
        costStatus: 'provider_reported', displayCostPolicy: 'show', hiddenByok: false, hiddenSubscription: false,
        note: 'Included usage was spent, so this continued on Extra usage inside the $100 spending limit — metered continuation, not a plan allowance.' },

      /* A reported zero charge is a fact of its own, distinct from free-by-plan
         and from unknown. */
      { eventId: 'ue-618', workId: 'work-2', bucket: 'research', purpose: 'web_extract', status: 'completed',
        requestedAccountId: 'acct:opencode-personal', effectiveAccountId: 'acct:opencode-personal',
        connectionId: 'conn:opencode-shared-gw', productId: 'prod:shared-gw-route',
        requestedModelId: 'model:qwen3-max', effectiveModelId: 'model:qwen3-max',
        billingRoute: 'no_charge_observed', tokens: { input: 1400, output: 160 },
        costMicro: 0, startedAt: at(-33 * MIN), finishedAt: at(-33 * MIN),
        settlement: 'settled', sourceClass: 'provider_reported', receiptRef: 'rcpt-618',
        parentEventId: 'ue-511', dedupeKey: 'dk-618', streamState: 'final',
        costStatus: 'provider_reported', displayCostPolicy: 'show', hiddenByok: false, hiddenSubscription: false,
        note: 'The gateway returned a usage record stating a zero charge. That reported zero is kept as a reported zero — not as free, not as unknown.' },

      /* Admission can be blocked by the machine, not the provider. */
      { eventId: 'ue-619', workId: 'work-5', bucket: 'retries', purpose: 'user_work', status: 'queued',
        requestedAccountId: 'acct:claude-work', effectiveAccountId: null,
        connectionId: 'conn:claude-work-cli', productId: 'prod:claude-max',
        requestedModelId: 'model:claude-opus-4-6', effectiveModelId: null,
        billingRoute: 'plan_included', tokens: {},
        costMicro: 0, startedAt: null, finishedAt: null,
        settlement: 'unknown', sourceClass: 'unknown', receiptRef: null,
        parentEventId: null, dedupeKey: 'dk-619', streamState: 'unknown',
        costStatus: 'unknown', displayCostPolicy: 'unknown', hiddenByok: false, hiddenSubscription: false,
        queuedReason: 'file_writer_conflict', unknownReason: 'no provider attempt was made, so there is nothing to price',
        routeReason: 'Held while another writer holds the deploy script this edit needs — no provider attempt has been made.',
        hostId: 'host:win-desktop', envId: 'env:native', sourceLocationId: 'srcloc:tastebook-main', clientId: 'client:desktop-win',
        note: 'Queued — no provider attempt yet' }
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
       4b · BSD EVENTS — final cumulative packet §02
       Back Seat Driver calls are real provider attempts; a silent call
       still counts, a suppressed duplicate does not.
       ================================================================ */
    bsdEvents: [
      { id: 'bsd-1', eventId: 'ue-600', workId: 'work-1', providerCallMade: true, operationalId: null, duplicateOfEventId: null,
        requestedState: 'Auto', effectiveState: 'Auto', trigger: 'High-risk edit detected',
        result: 'silent', advice: null, latencyMs: 4100, overrideScope: null, copy: 'Silent check — no advice needed', detail: 'A silent provider call still counts as usage.' },
      { id: 'bsd-2', eventId: 'ue-601', workId: 'work-3', providerCallMade: true, operationalId: null, duplicateOfEventId: null,
        requestedState: 'On', effectiveState: 'On', trigger: 'Mid-turn redirect',
        result: 'advice_emitted', advice: 'Keep the public API stable', latencyMs: 6800, overrideScope: 'this turn', copy: 'Advice emitted', detail: 'Shown in chat; route and tokens recorded here.' },
      /* No provider call was made, so there is no usage event to hang this on
         and none is invented. It keeps its own work lineage and an operational
         decision record (ops-12) so it is reachable without a fake attempt. */
      { id: 'bsd-3', eventId: null, workId: 'work-1', providerCallMade: false, operationalId: 'ops-12', duplicateOfEventId: 'ue-600',
        requestedState: 'Auto', effectiveState: 'Auto', trigger: 'Duplicate of bsd-1 within cooldown',
        result: 'duplicate_suppressed', advice: null, latencyMs: 0, overrideScope: null, copy: 'Duplicate suppressed', detail: 'No second provider call was made — zero additional usage.' }
    ],

    /* ================================================================
       4c · OPERATIONAL MAINTENANCE — packet §04
       Non-model maintenance & operational activity. NEVER token
       totals; a maintenance flow's real model call lives separately
       as a validation attempt (joined by validationEventId).
       ================================================================ */
    operational: [
      { id: 'ops-1', kind: 'cli_update', title: 'Codex CLI update', status: 'rolled_back',
        hostId: 'host:win-desktop', envId: 'env:native', providerUsage: 'validation_only', validationEventId: 'ue-609', sourceLocationId: 'srcloc:tastebook-main', clientId: 'client:desktop-win',
        acquisition: { consent: 'explicit_user_setup', source: 'official OpenAI installer', acquiredAt: '2026-06-20T14:00:00Z',
          installation: { version: '0.42.0', targetVersion: '0.43.1', provenance: 'publisher-signed release artifact', arch: 'x64' } },
        stages: [{ label: 'Check', ms: 2 * MIN }, { label: 'Wait for idle', ms: 9 * MIN }, { label: 'Install', ms: 3 * MIN }, { label: 'Verify', ms: 4 * MIN }, { label: 'Rollback', ms: 1 * MIN }],
        /* A08-01: `failureClass` reached no label on any of the thirteen
           rooms — a reader was told the provider-CLI update rolled back and
           never told what failed. The class is the packet §04 field; the
           stage names which of this record's own five stages is the one that
           did not pass, so the renderer can point at it instead of guessing
           it back out of the enum token. What the rollback cost is not
           authored here: the renderer reads it off the installation record
           (0.43.1 was the target, 0.42.0 is what is installed). */
        failureClass: 'verify_failed', failureStage: 'Verify', outcome: 'rolled_back',
        copy: 'Update verified, then rolled back',
        detail: 'Installer time is maintenance, not model usage. The verify step made one real model call (recorded separately).' },
      /* A08-07: this record used to say providerUsage 'validation_only' while
         its only provider call was a conversation replay. Validation is the
         specific class reserved for a maintenance flow verifying itself against
         a model; a reconnect replay is its own kind, and it now says so and
         names the event, so the join is a field rather than a sentence. */
      { id: 'ops-2', kind: 'offline_outbox', title: 'Client offline · outbox', status: 'completed',
        hostId: 'host:macbook', envId: 'env:native', providerUsage: 'replay_only', validationEventId: null, replayEventId: 'ue-610', sourceLocationId: 'srcloc:pm-main', clientId: 'client:desktop-mac',
        stages: [{ label: 'Offline', ms: 22 * MIN }, { label: 'Outbox wait', ms: 22 * MIN }, { label: 'Reconnect + replay', ms: 3 * MIN }],
        failureClass: null, outcome: 'completed',
        copy: 'Queued while offline · replayed on reconnect',
        detail: 'The reconnect replay is a real provider attempt, and the card below links straight to it. '
          + 'Queue time itself is never model usage.' },
      { id: 'ops-3', kind: 'server_continuity', title: 'Home Server kept working', status: 'completed',
        hostId: 'host:truenas', envId: 'env:docker', providerUsage: 'none', validationEventId: null, sourceLocationId: 'srcloc:tastebook-server', clientId: null,
        stages: [], failureClass: null, outcome: 'completed',
        copy: 'Server work continued',
        detail: 'Server work continues while the client is offline; slow thread load is not provider usage.' },
      { id: 'ops-4', kind: 'sound_preview', title: 'Notification sound preview', status: 'completed',
        hostId: 'host:win-desktop', envId: 'env:native', providerUsage: 'none', validationEventId: null, sourceLocationId: 'srcloc:tastebook-main', clientId: 'client:desktop-win',
        stages: [], failureClass: null, outcome: 'completed',
        copy: 'Local sound preview — not usage',
        detail: 'A local sound preview is not provider usage.' },
      { id: 'ops-5', kind: 'notification_test', title: 'Notification test-send', status: 'completed',
        hostId: 'host:win-desktop', envId: 'env:native', providerUsage: 'none', validationEventId: null, sourceLocationId: 'srcloc:tastebook-main', clientId: 'client:desktop-win',
        stages: [], failureClass: null, outcome: 'completed',
        copy: 'Test notification sent',
        detail: 'Operational receipt, not model usage.' },
      { id: 'ops-6', kind: 'backup', title: 'Project Vault backup', status: 'completed',
        hostId: 'host:truenas', envId: 'env:docker', providerUsage: 'none', validationEventId: null, sourceLocationId: 'srcloc:tastebook-server', clientId: 'client:desktop-win',
        stages: [], failureClass: null, outcome: 'completed',
        copy: 'Vault backup completed',
        detail: 'Backup is maintenance, never model usage.' },
      { id: 'ops-7', kind: 'project_move', title: 'Project Move: Tastebook → Vault', status: 'completed',
        hostId: 'host:truenas', envId: 'env:docker', providerUsage: 'none', validationEventId: null, sourceLocationId: 'srcloc:tastebook-server', clientId: 'client:desktop-win',
        stages: [], failureClass: null, outcome: 'completed',
        copy: 'Project moved to Vault',
        detail: 'Moving a project between storage locations is not provider usage.' },
      { id: 'ops-8', kind: 'setup_required', title: 'Codex CLI requested on Home Server · not installed', status: 'completed',
        hostId: 'host:truenas', envId: 'env:docker', providerUsage: 'none', validationEventId: null, sourceLocationId: 'srcloc:tastebook-server', clientId: 'client:desktop-win',
        stages: [], failureClass: null, outcome: 'setup_required',
        copy: 'Provider Setup Required — no compatible installation on this host/environment',
        detail: 'The Studio PC installation is not assumed here: installations bind to the exact host and environment. Originating operation and continuation token preserved; Auto/On may maintain an approved installation but never perform first acquisition. Resume only after explicit Install from the official source and separate authentication.',
        /* The whole representation of the runtime-demand adjudication. It used
           to be five keys that named no provider, no CLI, no account, no
           connection, no host and no environment — the identical payload would
           have been produced for any provider CLI on any machine, so it could
           only ever open the generic provider list. It now addresses the exact
           row: the canonical destination (category + a real Settings row id
           from Plans/settings_inventory.json), the provider family, account,
           connection and CLI it wants set up, the exact host and environment an
           installation would bind to, and the originating operation with its
           continuation token. The legacy surface/manager/section keys are kept
           so older call sites keep resolving. */
        setupLink: { surface: 'settings', manager: 'providers', section: 'setup', focus_reason: 'setup_required',
          category: 'ai', focusSettingId: 'ai.accounts.provider-connections',
          provider_family_id: 'fam:openai', account_id: 'acct:openai-personal',
          connection_id: 'conn:openai-personal-codex',
          provider_cli: 'codex', provider_route_kind: 'cli_bridged',
          host_id: 'host:truenas', env_id: 'env:docker',
          originating_operation_id: 'ops-8', continuation: 'cont-8841',
          reason: 'setup required' } },
    /* ops-13: the LAST step of the runtime-demand sequence, which nothing
       represented (audit A08-04). The adjudication ends "resume only when the
       continuation is still current" - so a continuation that has gone stale must
       be DECLINED, not silently retried. ops-8 modelled the happy path; this is
       the failure the rule exists to prevent. No provider call was made, so
       providerUsage is none and no token or cost figure exists to report. */
    { id: 'ops-13', kind: 'setup_required', title: 'Resume declined · the request that asked for Codex CLI had already moved on', status: 'completed',
      hostId: 'host:truenas', envId: 'env:docker', providerUsage: 'none', validationEventId: null,
      sourceLocationId: 'srcloc:tastebook-server', clientId: 'client:desktop-win',
      stages: [], failureClass: 'continuation_stale', outcome: 'resume_declined',
      continuation: 'cont-8841', continuationState: 'stale',
      originatingOperationId: 'ops-8', supersededBy: null,
      copy: 'Resume declined — the continuation had gone stale',
      detail: 'The install finished and the provider verified, but by then the request that triggered setup had already been answered another way, so the saved continuation no longer matched anything live. Puppet Master declined the resume instead of replaying it. Nothing was sent to a provider, so there is no usage on this record: declining costs nothing, and a silent retry is what the rule exists to prevent.',
      at: at(-8 * MIN) },
      /* The other execution-capable server forms and the optional Windows
         subsystem, each exercised once so the host/environment separation is
         demonstrated rather than declared (audit A07-10). */
      { id: 'ops-9', kind: 'server_continuity', title: 'Unraid server ran the nightly index', status: 'completed',
        hostId: 'host:unraid', envId: 'env:docker', providerUsage: 'none', validationEventId: null, sourceLocationId: 'srcloc:tastebook-server', clientId: null,
        stages: [], failureClass: null, outcome: 'completed',
        copy: 'Unraid server kept working',
        detail: 'A second home-server form, with no desktop worker attached. Indexing is maintenance, never model usage.' },
      { id: 'ops-10', kind: 'environment_check', title: 'Cluster environment reachable', status: 'completed',
        hostId: 'host:k8s-node', envId: 'env:kubernetes', providerUsage: 'none', validationEventId: null, sourceLocationId: 'srcloc:pm-server', clientId: 'client:desktop-mac',
        stages: [], failureClass: null, outcome: 'completed',
        copy: 'Cluster node reachable',
        detail: 'Installations bind to the exact host and environment: the pod is its own environment, not the TrueNAS Docker one.' },
      { id: 'ops-11', kind: 'environment_check', title: 'Windows subsystem distro checked', status: 'completed',
        hostId: 'host:win-desktop', envId: 'env:wsl', providerUsage: 'none', validationEventId: null, sourceLocationId: 'srcloc:tastebook-main', clientId: 'client:desktop-win',
        stages: [], failureClass: null, outcome: 'completed',
        copy: 'Windows subsystem checked · optional',
        detail: 'Native Windows is already complete; the subsystem is a separate environment on the same host, and nothing requires it.' },
      /* A pre-dispatch duplicate suppression makes NO provider call, so canon
         files it as an operational decision record — never as model usage.
         This is the surface bsd-3 is reachable on (audit A10-06 / A04-13). */
      { id: 'ops-12', kind: 'bsd_suppressed', title: 'Back Seat Driver duplicate suppressed', status: 'completed',
        hostId: 'host:win-desktop', envId: 'env:native', providerUsage: 'none', validationEventId: null, sourceLocationId: 'srcloc:tastebook-main', clientId: 'client:desktop-win',
        bsdRef: 'bsd-3', duplicateOfEventId: 'ue-600', workId: 'work-1',
        stages: [], failureClass: null, outcome: 'completed',
        copy: 'Duplicate suppressed — no second provider call',
        detail: 'A repeat check inside the cooldown was suppressed before dispatch. No provider call was made, so there is no usage event and no additional usage — zero here is a decision, not a measurement.' }
    ],

    /* ================================================================
       4e · CLI-BRIDGED PROVIDER PROBES — CBP-027, fixtures GUI-CBP-001
       and GUI-CBP-002 (audit A07-07)
       ----------------------------------------------------------------
       The whole Antigravity vocabulary used to be absent from this file
       and from the page, so the two fixtures that score on it had nothing
       to score. This is that surface, modelled rather than asserted.

       The rules it has to hold, all from CBP-027:
       - Antigravity is its own route: provider_id `antigravity_cli` backed
         by `agy`. It is not Gemini Direct and not the retired Google command
         line tool it replaced,
         and nothing here is ever added to, or read from, those routes.
       - A probe records which of `agy --version`, `agy models`, `/usage`,
         `/quota`, `/credits`, `/stats`, the Models & Quota page and the
         statusline JSON was available, unavailable, disabled, broken or not
         exposed. Missing is a recorded state, not a silence.
       - A missing or broken command renders `stats unavailable`,
         `usage unknown`, `quota not exposed` or `credits not exposed`. It
         never renders a zero, a guessed countdown or an invented figure —
         GUI-CBP-001's four MUST_NOT tokens are fabricated stats, usage,
         quota and credits, so no value on a missing command is ever made up.
       - A disabled quota bucket renders disabled, with no progress bar and
         no zero remaining.
       - G1 credits are a credit and overflow-pool signal. They are not token
         usage, not model cost, not a quota counter and not a provider total,
         which is GUI-CBP-002's four MUST_NOT tokens; every credit record
         below carries those four as explicit false flags so a renderer that
         tries to sum one into tokens or money has to override a field that
         says not to.
       - Statusline values are observed CLI signals with explicit field names
         and payload refs, never provider billing authority.

       Three installations of the same CLI on three machines, because an
       installation binds to the exact host and environment: what one build
       exposes is not what another one does, and that difference is the whole
       point of recording probe state per installation.
       ================================================================ */
    cliBridged: [
      /* Current build. Two of the four commands answer, two do not. */
      { id: 'clib:agy-mac', provider_id: 'antigravity_cli', provider_route_kind: 'cli_bridged', route: 'agy',
        label: 'Antigravity CLI', cliVersion: '0.9.4',
        familyId: 'fam:antigravity', accountId: 'acct:antigravity-personal', connectionId: 'conn:antigravity-cli',
        hostId: 'host:macbook', envId: 'env:native',
        observedAt: at(-5 * HOUR), payload_ref: 'agy-probe-4471',
        source_class: 'cli_reported', source_confidence: 'medium', source_authority: 'Antigravity CLI reported',
        probes: [
          { probe: 'agy --version', state: 'available', value: '0.9.4', payload_ref: 'agy-probe-4471-version' },
          { probe: 'agy models', state: 'available', value: '6 models listed', payload_ref: 'agy-probe-4471-models' },
          { probe: '/stats', state: 'broken', field: 'stats_state', value: 'stats_unavailable', copy: 'stats unavailable',
            fabricated: false, payload_ref: 'agy-probe-4471-stats',
            detail: 'The command exists on this build and returns an error. A broken /stats is not proof that no usage happened, so nothing is counted from it and nothing is counted as zero because of it.' },
          { probe: '/usage', state: 'not_exposed', field: 'usage_reporting_state', value: 'unknown', copy: 'usage unknown',
            fabricated: false, payload_ref: null,
            detail: 'This build has no /usage command, so per-call usage for this route is unknown. The token buckets below stay unknown rather than being derived from credits or from the quota page.' },
          { probe: '/quota', state: 'available', field: 'quota_status', value: 'reported', copy: 'quota reported',
            fabricated: false, payload_ref: 'agy-probe-4471-quota' },
          { probe: '/credits', state: 'available', field: 'credits_status', value: 'reported', copy: 'G1 credits reported',
            fabricated: false, payload_ref: 'agy-credits-4474' },
          { probe: 'Models & Quota', state: 'available', field: 'page_state', value: 'available', copy: 'Models & Quota page read',
            fabricated: false, payload_ref: 'agy-probe-4471-page' },
          { probe: 'statusline', state: 'available', field: 'statusline_state', value: 'available', copy: 'statusline read',
            fabricated: false, payload_ref: 'agy-statusline-4473' }
        ],
        /* /usage is not exposed here, so every canonical bucket is present and
           unknown. Absent is not zero, and nothing below is derived from the
           credit pool or from quota progress. */
        usage: { usage_reporting_state: 'unknown', evidence_source: 'not_exposed',
          tokenBuckets: { input_total: null, input_non_cached: null, cache_read: null, cache_write: null,
            cache_write_1h: null, cache_write_ttl: null, output_total: null, output_visible: null,
            reasoning: null, provider_total: null, context_estimate: null },
          counting_semantics: { input_total_includes_cache: 'unknown', output_total_includes_reasoning: 'unknown',
            provider_total_semantics: 'unknown' },
          copy: 'usage unknown',
          note: 'No usage command answered on this installation, so there is nothing to read. That is different from reading a zero.' },
        modelsAndQuota: { page: 'Models & Quota', state: 'available', payload_ref: 'agy-probe-4471-page',
          evidence_source: 'cli_command', window_scope: 'account+model',
          buckets: [
            { bucket_id: 'agy:quota-standard', label: 'Standard model requests', quota_status: 'reported',
              quota_used: 128, quota_limit: 500, quota_remaining: 372, window_kind: 'fixed_reset',
              reset_at: at(9 * HOUR), evidence_source: 'cli_command', showProgress: true, disabled_reason: null },
            { bucket_id: 'agy:quota-high', label: 'High-capability model requests', quota_status: 'disabled',
              quota_used: null, quota_limit: null, quota_remaining: null, window_kind: 'unknown',
              reset_at: null, evidence_source: 'cli_command', showProgress: false,
              disabled_reason: 'This bucket is switched off for the account, so the CLI publishes no figure for it.',
              copy: 'Disabled',
              note: 'Disabled is a state of its own. It is not zero remaining, not exhausted and not a success, and it draws no progress bar.' },
            { bucket_id: 'agy:quota-fast', label: 'Fast model requests', quota_status: 'reported',
              quota_used: 500, quota_limit: 500, quota_remaining: 0, window_kind: 'fixed_reset',
              reset_at: at(9 * HOUR), evidence_source: 'cli_command', showProgress: true, disabled_reason: null,
              exhaustion_message: 'You have used all Fast model requests for today.',
              message_payload_ref: 'agy-probe-4471-exhausted',
              note: 'A reported zero remaining is a measured zero and the provider said so in words. It is a different fact from the disabled bucket above.' }
          ],
          note: 'These buckets belong to the Antigravity CLI route. They are never added to the Gemini Direct route and Gemini Direct figures are never added to them.' },
        statusline: { state: 'available', payload_ref: 'agy-statusline-4473', observed_at: at(-5 * HOUR),
          source_class: 'cli_reported', source_confidence: 'medium', source_authority: 'Antigravity CLI statusline JSON',
          billing_authority: false,
          fields: [
            { field: 'quota_usage', label: 'Quota usage', value: '26%', state: 'reported' },
            { field: 'execution_mode', label: 'Execution mode', value: 'agent', state: 'reported' },
            { field: 'context_usage', label: 'Context usage', value: '48k of 200k', state: 'reported', is_local_context_estimate: true,
              note: 'The context usage figure is a local estimate of what is in the window. It is never billing, cost, quota or provider authority.' },
            { field: 'active_model', label: 'Active model', value: 'Standard class', state: 'reported' },
            { field: 'subagent_task', label: 'Subagent or task', value: 'none running', state: 'reported' },
            { field: 'token_like_total', label: 'Token-like total', value: null, state: 'unknown',
              note: 'The statusline prints a token-like number without saying which bucket it belongs to. It is kept as an observed signal with its payload ref and is never written into a token bucket.' }
          ],
          note: 'Statusline values are observed CLI signals with explicit field names and payload refs. None of them is provider billing authority, and none is written into a token bucket, a cost or a quota counter.' },
        credits: { label: 'G1 credits', setting: 'UseG1Credits', use_g1_credits: true,
          credits_status: 'reported', credits_remaining: 1840, unit: 'credits',
          evidence_source: 'cli_command', observed_at: at(-5 * HOUR), payload_ref: 'agy-credits-4474',
          copy: 'G1 credits · 1,840 remaining',
          isTokenBucket: false, isCost: false, isQuota: false, isProviderTotal: false,
          neverSummedInto: ['token_bucket', 'cost', 'quota', 'provider_total'],
          note: 'G1 credits and remaining credits are a credit and overflow-pool signal. They are not token usage, not model cost, not a quota counter and not a provider total, so this number is never added into one and never converted into one.' } },

      /* Older build on a second machine. None of the four commands exists, so
         all four fail closed — this is the whole of GUI-CBP-001 in one row. */
      { id: 'clib:agy-win', provider_id: 'antigravity_cli', provider_route_kind: 'cli_bridged', route: 'agy',
        label: 'Antigravity CLI', cliVersion: '0.8.1',
        familyId: 'fam:antigravity', accountId: 'acct:antigravity-personal', connectionId: 'conn:antigravity-cli',
        hostId: 'host:win-desktop', envId: 'env:native',
        observedAt: at(-31 * HOUR), payload_ref: 'agy-probe-4390',
        source_class: 'cli_reported', source_confidence: 'low', source_authority: 'Antigravity CLI reported',
        probes: [
          { probe: 'agy --version', state: 'available', value: '0.8.1', payload_ref: 'agy-probe-4390-version' },
          { probe: 'agy models', state: 'available', value: '4 models listed', payload_ref: 'agy-probe-4390-models' },
          { probe: '/stats', state: 'not_exposed', field: 'stats_state', value: 'stats_unavailable', copy: 'stats unavailable',
            fabricated: false, payload_ref: null,
            detail: 'This build has no /stats command. Its absence says nothing about how much was used, so no figure is produced from it.' },
          { probe: '/usage', state: 'not_exposed', field: 'usage_reporting_state', value: 'unknown', copy: 'usage unknown',
            fabricated: false, payload_ref: null,
            detail: 'No usage command on this build, so usage for this installation is unknown.' },
          { probe: '/quota', state: 'not_exposed', field: 'quota_status', value: 'not_exposed', copy: 'quota not exposed',
            fabricated: false, payload_ref: null,
            detail: 'No quota command and no Models & Quota page on this build, so the quota is not exposed — not empty, and not exhausted.' },
          { probe: '/credits', state: 'not_exposed', field: 'credits_status', value: 'not_exposed', copy: 'credits not exposed',
            fabricated: false, payload_ref: null,
            detail: 'No credits command on this build, so the credit pool is not exposed. It is not zero and it is not spent.' },
          { probe: 'Models & Quota', state: 'not_exposed', field: 'page_state', value: 'not_exposed', copy: 'quota not exposed',
            fabricated: false, payload_ref: null },
          { probe: 'statusline', state: 'not_exposed', field: 'statusline_state', value: 'not_exposed', copy: 'statusline not exposed',
            fabricated: false, payload_ref: null }
        ],
        usage: { usage_reporting_state: 'unknown', evidence_source: 'not_exposed',
          tokenBuckets: { input_total: null, input_non_cached: null, cache_read: null, cache_write: null,
            cache_write_1h: null, cache_write_ttl: null, output_total: null, output_visible: null,
            reasoning: null, provider_total: null, context_estimate: null },
          counting_semantics: { input_total_includes_cache: 'unknown', output_total_includes_reasoning: 'unknown',
            provider_total_semantics: 'unknown' },
          copy: 'usage unknown',
          note: 'Nothing on this installation reports usage. Every bucket is unknown and none of them is a zero.' },
        modelsAndQuota: { page: 'Models & Quota', state: 'not_exposed', payload_ref: null,
          evidence_source: 'not_exposed', window_scope: 'account+model', buckets: [],
          copy: 'quota not exposed',
          note: 'This build has no Models & Quota page. No bucket is invented for it, and the absence of the page is never rendered as an empty or exhausted quota.' },
        statusline: { state: 'not_exposed', payload_ref: null, observed_at: null,
          source_class: 'unknown', source_confidence: 'unknown', source_authority: null,
          billing_authority: false, fields: [],
          note: 'No statusline JSON on this build, so there is no statusline signal to accept.' },
        credits: { label: 'G1 credits', setting: 'UseG1Credits', use_g1_credits: 'unknown',
          credits_status: 'not_exposed', credits_remaining: null, unit: 'credits',
          evidence_source: 'not_exposed', observed_at: null, payload_ref: null,
          copy: 'credits not exposed',
          isTokenBucket: false, isCost: false, isQuota: false, isProviderTotal: false,
          neverSummedInto: ['token_bucket', 'cost', 'quota', 'provider_total'],
          note: 'The credit pool is not exposed on this build and the UseG1Credits setting cannot be read from it either. Both are unknown, and unknown is never rendered as zero remaining.' } },

      /* Same current build on the home server, with G1 credits switched off by
         the user: the pool is readable and reads disabled, which is a third
         state again — not reported, and not merely unexposed. */
      { id: 'clib:agy-nas', provider_id: 'antigravity_cli', provider_route_kind: 'cli_bridged', route: 'agy',
        label: 'Antigravity CLI', cliVersion: '0.9.4',
        familyId: 'fam:antigravity', accountId: 'acct:antigravity-personal', connectionId: 'conn:antigravity-cli',
        hostId: 'host:truenas', envId: 'env:docker',
        observedAt: at(-2 * HOUR), payload_ref: 'agy-probe-4468',
        source_class: 'cli_reported', source_confidence: 'medium', source_authority: 'Antigravity CLI reported',
        probes: [
          { probe: 'agy --version', state: 'available', value: '0.9.4', payload_ref: 'agy-probe-4468-version' },
          { probe: 'agy models', state: 'available', value: '6 models listed', payload_ref: 'agy-probe-4468-models' },
          { probe: '/stats', state: 'broken', field: 'stats_state', value: 'stats_unavailable', copy: 'stats unavailable',
            fabricated: false, payload_ref: 'agy-probe-4468-stats',
            detail: 'The command times out inside the container. Broken is recorded as broken; no usage figure is inferred from the failure.' },
          { probe: '/usage', state: 'not_exposed', field: 'usage_reporting_state', value: 'unknown', copy: 'usage unknown',
            fabricated: false, payload_ref: null },
          { probe: '/quota', state: 'not_exposed', field: 'quota_status', value: 'not_exposed', copy: 'quota not exposed',
            fabricated: false, payload_ref: null },
          { probe: '/credits', state: 'available', field: 'credits_status', value: 'disabled', copy: 'G1 credits off',
            fabricated: false, payload_ref: 'agy-credits-4469',
            detail: 'The command answers and says the pool is switched off for this account. Off is a reported state, which is why it is disabled here rather than unknown.' },
          { probe: 'Models & Quota', state: 'not_exposed', field: 'page_state', value: 'not_exposed', copy: 'quota not exposed',
            fabricated: false, payload_ref: null },
          { probe: 'statusline', state: 'disabled', field: 'statusline_state', value: 'disabled', copy: 'statusline off',
            fabricated: false, payload_ref: 'agy-probe-4468-statusline',
            detail: 'The statusline is switched off in this container, so no statusline signal is collected here.' }
        ],
        usage: { usage_reporting_state: 'unknown', evidence_source: 'not_exposed',
          tokenBuckets: { input_total: null, input_non_cached: null, cache_read: null, cache_write: null,
            cache_write_1h: null, cache_write_ttl: null, output_total: null, output_visible: null,
            reasoning: null, provider_total: null, context_estimate: null },
          counting_semantics: { input_total_includes_cache: 'unknown', output_total_includes_reasoning: 'unknown',
            provider_total_semantics: 'unknown' },
          copy: 'usage unknown',
          note: 'A broken stats command and no usage command leave usage unknown on this installation.' },
        modelsAndQuota: { page: 'Models & Quota', state: 'not_exposed', payload_ref: null,
          evidence_source: 'not_exposed', window_scope: 'account+model', buckets: [],
          copy: 'quota not exposed',
          note: 'The page is not reachable from the container build, so no quota figure exists for this installation.' },
        statusline: { state: 'disabled', payload_ref: 'agy-probe-4468-statusline', observed_at: at(-2 * HOUR),
          source_class: 'cli_reported', source_confidence: 'low', source_authority: 'Antigravity CLI reported',
          billing_authority: false, fields: [],
          copy: 'statusline off',
          note: 'Switched off is a state the CLI reports. It is not the same as a statusline that does not exist.' },
        credits: { label: 'G1 credits', setting: 'UseG1Credits', use_g1_credits: false,
          credits_status: 'disabled', credits_remaining: null, unit: 'credits',
          evidence_source: 'cli_command', observed_at: at(-2 * HOUR), payload_ref: 'agy-credits-4469',
          copy: 'G1 credits off',
          isTokenBucket: false, isCost: false, isQuota: false, isProviderTotal: false,
          neverSummedInto: ['token_bucket', 'cost', 'quota', 'provider_total'],
          note: 'The user turned G1 credits off for this installation. Off means no overflow pool is drawn, not that the pool is empty, and it produces no token, cost or quota figure either way.' } }
    ],

    /* ================================================================
       4f · PRICING PROVENANCE — UF-085 cost fields (audit A03-08)
       A price that Puppet Master applied itself has to say which list it
       came from, which version of that list, and from when. A price the
       provider stated needs none of that and carries no snapshot, because
       a snapshot id with no source behind it is exactly the fabrication
       fixture GUI-USG-004 forbids.
       ================================================================ */
    pricing: {
      snapshots: [
        { id: 'psnap-claude-api-2026-08-01', label: 'Claude API published price list',
          familyId: 'fam:claude', productId: 'prod:claude-api-payg',
          source: 'provider_price_list', effectiveAt: '2026-08-01T00:00:00Z', version: '2026.08.1',
          currency: 'USD',
          note: 'Used only while a call is still streaming and unsettled. When the provider settles the call its own figure replaces this one, and the record then reads provider reported rather than priced.' }
      ],
      note: 'Only one route in this demo is priced from a list. Every other call is either stated by the provider, covered by a plan, billed to your own key, or unknown — and none of those carries a snapshot id.'
    },

    /* ================================================================
       4d · HOSTS + ENVIRONMENTS — packet §04 server-first lineage
       ================================================================ */
    hosts: [
      { id: 'host:macbook',   label: 'Jared’s MacBook Air', kind: 'desktop',     os: 'macOS 15' },
      { id: 'host:win-desktop', label: 'Studio PC',         kind: 'desktop',     os: 'Windows 11' },
      { id: 'host:truenas',   label: 'TrueNAS Home Server', kind: 'home_server', os: 'TrueNAS · Docker' },
      /* All four execution-capable server forms are modelled, so "a server can
         work without a desktop" is shown rather than asserted. */
      { id: 'host:unraid',    label: 'Unraid Tower',        kind: 'home_server', os: 'Unraid 7.1' },
      { id: 'host:k8s-node',  label: 'Cluster node · pm-server', kind: 'cluster', os: 'Kubernetes 1.33' }
    ],
    environments: [
      { id: 'env:native', label: 'Native' },
      { id: 'env:docker', label: 'Docker · pm-server' },
      { id: 'env:wsl',    label: 'WSL (optional)' },
      { id: 'env:kubernetes', label: 'Kubernetes · pm-server pod' }
    ],

    /* Source Location — level 5 of the server-first lineage. Where the work's
       source tree lives. A stable id and a human label only: local paths are
       never persisted or displayed (UF-085 redaction). */
    sourceLocations: [
      { id: 'srcloc:tastebook-main',   label: 'Tastebook · main worktree',      kind: 'local_worktree',  hostId: 'host:win-desktop', pathRedacted: true },
      { id: 'srcloc:tastebook-server', label: 'Tastebook · server checkout',    kind: 'server_checkout', hostId: 'host:truenas',     pathRedacted: true },
      { id: 'srcloc:pm-main',          label: 'Puppet Master · main worktree',  kind: 'local_worktree',  hostId: 'host:macbook',     pathRedacted: true },
      { id: 'srcloc:pm-server',        label: 'Puppet Master · server checkout',kind: 'server_checkout', hostId: 'host:truenas',     pathRedacted: true }
    ],

    /* Client — level 6. The app you are looking at, which is NOT the machine
       that ran the work: a client can be offline while its server keeps
       working, and a run can have no client attached at all. */
    clients: [
      { id: 'client:desktop-win', label: 'Desktop app · Studio PC',    kind: 'desktop_app', hostId: 'host:win-desktop', state: 'connected' },
      { id: 'client:desktop-mac', label: 'Desktop app · MacBook Air',  kind: 'desktop_app', hostId: 'host:macbook',     state: 'reconnected',
        note: 'This client was offline during the outbox window; the queued work replayed on reconnect.' },
      { id: 'client:web-ipad',    label: 'Web client · iPad',          kind: 'web_client',  hostId: null,               state: 'connected',
        note: 'Read-only viewing client — it starts no provider work of its own.' }
    ],

    /* ================================================================
       5 · RUNS, FORECASTS, TIMING — delta §2/§5/§6
       Usage supplies the forecast; Goal Runtime/Orchestrator owns
       admission, scheduling, waves, and dispatch.
       ================================================================ */
    runs: [
      { id: 'run:goal-47', kind: 'goal', owningSurface: 'assistant_chat_goal', visibility: 'visible',
        title: 'Refactor pricing pipeline', project: 'Tastebook', status: 'running', stage: 'Specialist reviews',
        hostId: 'host:win-desktop', envId: 'env:native', sourceLocationId: 'srcloc:tastebook-main', clientId: 'client:desktop-win',
        /* `actualPeak` is the sixth maximum reference canon A37 asks for
           alongside the five ceilings: not what was allowed, what actually ran
           at once (audit A06-16). */
        capacity: { hardMax: 8, configuredPreferred: 4, providerAdvertised: 2, effectiveNow: 2, predictedSustainable: 2,
          actualPeak: 2, actualPeakAt: at(-96 * MIN), actualPeakBasis: 'highest number of children dispatched at the same instant since the run started' },
        startedAt: at(-130 * MIN),
        requested: { children: 8, specialistsRequired: 8 },
        admitted: { now: 2, effectiveConcurrency: 2, sustainableConcurrency: 2 },
        queued: { children: 6, waves: 4 },
        reservedFor: ['synthesis', 'testing', 'verification', 'repair'],
        /* The reserve used to be four words with no quantity behind them, so
           nothing on the page could be seen to be smaller because of it
           (audit A06-13). Here it is a token budget: the provider advertises
           two concurrent dispatches and Puppet Master is already at that
           ceiling, so no worker slot is held back on this run — what is held
           back is allowance. */
        reserve: { workers: 0, tokens: 48000, costMicro: null,
          costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered',
          categories: ['synthesis', 'testing', 'verification', 'repair'],
          workersNote: 'No worker slot is reserved here: the provider ceiling of 2 is already the binding constraint, so reserving a slot would not change what runs.',
          tokensNote: 'Two synthesis passes at the observed 18k–26k per child are kept back from the extraction children.',
          effect: { field: 'forecast.tokenBudget.usable', withoutReserve: 208000, withReserve: 160000, unit: 'tokens' } },
        members: [
          { child: 'child-47-1', role: 'Pricing specialist', persona: 'Domain analyst', route: 'Alibaba · Coding Plan', state: 'running', eventId: 'ue-560' },
          { child: 'child-47-2', role: 'Migration specialist', persona: 'Domain analyst', route: 'Alibaba · Coding Plan', state: 'running', eventId: 'ue-561' },
          /* the eighth admission reason: this child is held until a window
             reset, which is a different fact from a provider limit (A06-10) */
          { child: 'child-47-3', role: 'Schema specialist', persona: 'Domain analyst', route: 'Qwen · planned', state: 'queued', queuedReason: 'waiting_for_reset' },
          { child: 'child-47-4', role: 'Backfill specialist', persona: 'Domain analyst', route: 'Qwen · planned', state: 'queued', queuedReason: 'port_conflict' },
          { child: 'child-47-5', role: 'API specialist', persona: 'Domain analyst', route: 'Kimi · planned', state: 'queued', queuedReason: 'provider_limit' },
          { child: 'child-47-6', role: 'Test strategist', persona: 'Test skeptic', route: 'Kimi · planned', state: 'queued', queuedReason: 'host_resource_pressure' },
          { child: 'child-47-7', role: 'Docs specialist', persona: 'Editor', route: 'Qwen · planned', state: 'queued', queuedReason: 'runtime_capacity' },
          { child: 'child-47-8', role: 'Risk reviewer', persona: 'Skeptical reviewer', route: 'Kimi · planned', state: 'queued', queuedReason: 'waiting_for_update_repair' }
        ],
        /* All eleven time kinds, each row naming which one it carries.
           'Local tool/runtime time' used to be one row covering two kinds, so
           the packet's 'Separate:' instruction was not met and Maintenance was
           not a partition at all (audit A06-09). A row that was never measured
           is listed under notRecorded with a reason, never as a zero — a
           measured zero and an unmeasured kind are two different statements. */
        timing: {
          elapsedMs: 124 * MIN,
          totalKind: 'total_elapsed',
          basis: 'Each kind is summed across up to eight workers, so the kinds overlap and are not expected to add up to the measured run time.',
          rows: [
            { kind: 'provider_active',      label: 'Provider/model active',        ms: 12 * MIN, state: 'measured' },
            { kind: 'local_compute',        label: 'Local compute',                ms: 7 * MIN,  state: 'measured' },
            { kind: 'tool_runtime',         label: 'Tool/runtime execution',       ms: 12 * MIN, state: 'measured' },
            { kind: 'resource_wait',        label: 'Waiting for test device',      ms: 47 * MIN, state: 'measured' },
            { kind: 'resource_wait',        label: 'Waiting for worktree',         ms: 31 * MIN, state: 'measured' },
            { kind: 'provider_permit_wait', label: 'Waiting for provider capacity', ms: 9 * MIN, state: 'measured' },
            { kind: 'approval_wait',        label: 'Waiting for approval',         ms: 6 * MIN,  state: 'measured' },
            { kind: 'reset_wait',           label: 'Waiting for reset/cooldown',   ms: 0,        state: 'measured' },
            { kind: 'outbox_offline_wait',  label: 'Outbox/offline wait',          ms: 0,        state: 'measured' },
            { kind: 'reconnect_sync_replay', label: 'Reconnect / sync / replay',   ms: 4 * MIN,  state: 'measured' },
            { kind: 'maintenance',          label: 'Maintenance',                  ms: 3 * MIN,  state: 'measured',
              note: 'Maintenance that ran on this host and environment while the run was open. It is time, never model usage.' }
          ],
          notRecorded: []
        },
        forecastId: 'fc-goal-47' },

      { id: 'run:plan-12', kind: 'planning_run', owningSurface: 'planning_wizard', visibility: 'internal',
        title: 'Spec: U11 usage concept', project: 'Puppet Master', status: 'running', stage: 'Source extraction',
        hostId: 'host:truenas', envId: 'env:docker', sourceLocationId: 'srcloc:pm-server', clientId: 'client:desktop-mac',
        capacity: { hardMax: 8, configuredPreferred: 4, providerAdvertised: 2, effectiveNow: 2, predictedSustainable: 2,
          actualPeak: 2, actualPeakAt: at(-71 * MIN), actualPeakBasis: 'highest number of extraction children dispatched at the same instant' },
        startedAt: at(-100 * MIN),
        requested: { children: 6, specialistsRequired: 6 },
        admitted: { now: 2, effectiveConcurrency: 2, sustainableConcurrency: 2 },
        queued: { children: 4, waves: 3 },
        reservedFor: ['synthesis', 'testing', 'audit', 'repair'],
        reserve: { workers: 0, tokens: 55000, costMicro: null,
          costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered',
          categories: ['synthesis', 'testing', 'audit', 'repair'],
          workersNote: 'The provider ceiling of 2 already binds this run, so the reserve here is allowance rather than a held-back worker slot.',
          tokensNote: 'Synthesis and audit are kept back from the extraction children at the observed 20k–30k per child.',
          effect: { field: 'forecast.tokenBudget.usable', withoutReserve: 180000, withReserve: 125000, unit: 'tokens' } },
        timing: {
          elapsedMs: 96 * MIN,
          totalKind: 'total_elapsed',
          basis: 'Each kind is summed across up to two workers, so the kinds overlap and are not expected to add up to the measured run time.',
          rows: [
            { kind: 'provider_active',      label: 'Provider/model active',         ms: 21 * MIN, state: 'measured' },
            { kind: 'local_compute',        label: 'Local compute',                 ms: 5 * MIN,  state: 'measured' },
            { kind: 'tool_runtime',         label: 'Tool/runtime execution',        ms: 8 * MIN,  state: 'measured' },
            { kind: 'resource_wait',        label: 'Waiting for worktree',          ms: 12 * MIN, state: 'measured' },
            { kind: 'provider_permit_wait', label: 'Waiting for provider capacity', ms: 6 * MIN,  state: 'measured' },
            { kind: 'approval_wait',        label: 'Waiting for approval',          ms: 0,        state: 'measured' },
            { kind: 'outbox_offline_wait',  label: 'Outbox/offline wait',           ms: 0,        state: 'measured' },
            { kind: 'reconnect_sync_replay', label: 'Reconnect / sync / replay',    ms: 0,        state: 'measured' }
          ],
          notRecorded: [
            { kind: 'reset_wait', label: 'Waiting for reset/cooldown', why: 'This run has not reached a window boundary, so no reset wait was measured. That is unknown for this run, not a measured zero.' },
            { kind: 'maintenance', label: 'Maintenance', why: 'The maintenance that ran on this server is kept in Maintenance and operations and was never attributed to this run.' }
          ]
        },
        routePlan: [
          { stage: 'Conversation', route: 'Claude · Work CLI profile', quality: 'high-quality route' },
          { stage: 'Research & extraction', route: '4 children across Qwen and Kimi', quality: 'background route' },
          { stage: 'Synthesis & audit', route: 'reserved', quality: 'reserved capacity' }
        ],
        forecastId: 'fc-plan-12' },

      { id: 'run:crew-3', kind: 'crew', owningSurface: 'orchestrator', visibility: 'orchestrator',
        title: 'Design critique crew', project: 'Puppet Master', status: 'running', stage: 'Critique round 1',
        hostId: 'host:macbook', envId: 'env:native', sourceLocationId: 'srcloc:pm-main', clientId: 'client:desktop-mac',
        /* The one run where the reserve is a worker rather than a budget, so
           the sustainable maximum is visibly smaller than what the provider
           advertises: 3 advertised, 1 kept for the Reducer, 2 sustainable
           (audit A06-13). */
        capacity: { hardMax: 8, configuredPreferred: 6, providerAdvertised: 3, effectiveNow: 3, predictedSustainable: 2,
          actualPeak: 3, actualPeakAt: at(-44 * MIN), actualPeakBasis: 'highest number of crew members dispatched at the same instant' },
        startedAt: at(-55 * MIN),
        requested: { members: 5 },
        admitted: { now: 3, effectiveConcurrency: 3, sustainableConcurrency: 2 },
        queued: { members: 2, waves: 2 },
        reservedFor: ['reducer'],
        reserve: { workers: 1, tokens: null, costMicro: null,
          costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered',
          categories: ['reducer'],
          workersNote: 'One of the three dispatch slots the provider advertises is never given to a critique member, so the Reducer can run the moment the members finish.',
          tokensNote: 'No token budget is reserved on this run — the reserve here is the slot.',
          effect: { field: 'capacity.predictedSustainable', withoutReserve: 3, withReserve: 2, unit: 'workers' } },
        timing: {
          elapsedMs: 52 * MIN,
          totalKind: 'total_elapsed',
          basis: 'Each kind is summed across up to three members, so the kinds overlap and are not expected to add up to the measured run time.',
          rows: [
            { kind: 'provider_active',      label: 'Provider/model active',         ms: 9 * MIN,  state: 'measured' },
            { kind: 'local_compute',        label: 'Local compute',                 ms: 3 * MIN,  state: 'measured' },
            { kind: 'tool_runtime',         label: 'Tool/runtime execution',        ms: 4 * MIN,  state: 'measured' },
            { kind: 'provider_permit_wait', label: 'Waiting for provider capacity', ms: 5 * MIN,  state: 'measured' },
            { kind: 'approval_wait',        label: 'Waiting for approval',          ms: 0,        state: 'measured' },
            { kind: 'reset_wait',           label: 'Waiting for reset/cooldown',    ms: 0,        state: 'measured' },
            { kind: 'outbox_offline_wait',  label: 'Outbox/offline wait',           ms: 22 * MIN, state: 'measured',
              note: 'The client was offline for this stretch; the queue time is the operational record on the same machine, never model usage.' },
            { kind: 'reconnect_sync_replay', label: 'Reconnect / sync / replay',    ms: 3 * MIN,  state: 'measured' }
          ],
          notRecorded: [
            { kind: 'resource_wait', label: 'Resource wait', why: 'No worktree, device or browser wait was measured for this crew. Nothing was recorded, which is not the same as nothing having happened.' },
            { kind: 'maintenance', label: 'Maintenance', why: 'The offline and reconnect maintenance on this machine is kept in Maintenance and operations and was never attributed to this run.' }
          ]
        },
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

    /* A forecast input is a value in a unit — never a pre-authored sentence.
       The run inspector formats it, and the cost range goes through the same
       cost-state branch every other cost surface uses. This block used to
       carry the literal string "$0.00 · plan included", which is the
       GUI-USG-004 fabricated zero: the route is subscription-covered, so
       there is no per-token price to print, and no renderer rule could ever
       reach a string the data had already baked. */
    forecasts: [
      { id: 'fc-goal-47', runId: 'run:goal-47',
        recommendation: 'Likely enough capacity to finish before the next reset.',
        confidence: 'Reasonable forecast · based on 12 similar runs',
        generatedAt: at(-28 * MIN),
        inputs: {
          providerRanges: [
            { label: 'Usage per child', kind: 'tokens', lo: 18000, hi: 26000 },
            { label: 'Cost per child', kind: 'cost', costMicro: null,
              costStatus: 'hidden_subscription', displayCostPolicy: 'subscription_covered' },
            { label: 'Elapsed per child', kind: 'minutes', lo: 6, hi: 9 }
          ],
          /* the reserve as a quantity the forecast actually spends against:
             what eight children at the high end of the per-child range would
             take, less what is kept for synthesis, testing, verification and
             repair (audit A06-13) */
          tokenBudget: { unit: 'tokens', advertised: 208000, reserved: 48000, usable: 160000,
            basis: 'eight children at the high end of the 18k–26k per-child range' },
          resetInputs: ['Codex 5-hour window', 'Claude 5-hour window'],
          /* The same two windows as stable meter ids. `resetInputs` is the
             prose the run inspector prints; these are what a recompute may
             actually read a reset instant out of, because joining the prose
             back to a meter would be a display-name join (audit A06-12). */
          resetMeterIds: ['meter:codex-5h', 'meter:claude-5h'],
          /* A06-13: this note used to list three categories while the run's own
             admission line listed four, so one panel made two different reserve
             statements. Both now read from the same four. */
          reservedNote: 'Capacity is kept aside for synthesis, testing, verification and repair — a reserve of 48,000 tokens on this run.'
        } },
      { id: 'fc-plan-12', runId: 'run:plan-12',
        recommendation: 'Enough for two complete extraction children at a time, with synthesis and audit reserved.',
        confidence: 'Limited history · may change after a route switch',
        generatedAt: at(-22 * MIN),
        inputs: {
          providerRanges: [
            { label: 'Extraction per child', kind: 'tokens', lo: 20000, hi: 30000 },
            { label: 'Conversation', kind: 'route', route: 'Claude · high-quality route' }
          ],
          tokenBudget: { unit: 'tokens', advertised: 180000, reserved: 55000, usable: 125000,
            basis: 'six children at the high end of the 20k–30k per-child range' },
          resetInputs: ['Kimi rolling week', 'Alibaba weekly window'],
          resetMeterIds: ['meter:kimi-weekly', 'meter:alibaba-weekly'],
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
          cacheEpoch: 'e-12', stablePrefixId: 'sp-88',
          toolSchemaOverhead: { tokens: 5900, pctOfWindow: 5, source: 'pm_derived' },
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

    /* Context-maintenance events — Hermes §3
       `detail` says what the operation did; how much it reclaimed, what it
       did to the cache and which helper calls it spent are read out of
       `reclaimed`, `cacheEffect` and `helperEventIds` by the renderer. A
       hand-written second copy of those figures can only drift. */
    maintenance: [
      { id: 'cm-1', threadId: 'thread:t-88', operationKind: 'automatic_compaction', triggerKind: 'ratio_threshold',
        status: 'completed', at: at(-58 * MIN),
        tokensBefore: 118000, tokensAfter: 99800, reclaimed: 18200,
        cacheEffect: 'rebuilt', invalidationReason: 'compaction_changed_prefix', helperEventIds: ['ue-502'],
        copy: 'Context compacted', detail: 'Older turns were summarised so the thread could keep going' },
      { id: 'cm-2', threadId: 'thread:t-88', operationKind: 'proactive_prune', triggerKind: 'idle',
        status: 'completed', at: at(-33 * MIN),
        tokensBefore: 48300, tokensAfter: 42200, reclaimed: 6100,
        cacheEffect: 'preserved', invalidationReason: null, helperEventIds: [],
        copy: 'Local prune', detail: 'Stale context dropped by a deterministic local rule' },
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
        cacheEffect: 'unknown', helperEventIds: ['ue-613'],
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
        at: at(-15 * MIN), failureBackoffUntil: at(25 * MIN), probeEventId: 'ue-612',
        copy: 'Catalog refresh in backoff', detail: 'Last known good used · no provider usage unless probed' }
    ],

    /* ================================================================
       8 · ROOM DATA — attention, cache, tools, analytics, signals
       ================================================================ */
    guards: [
      { id: 'gd-1', state: 'blocked', severity: 'high', at: at(-22 * MIN), title: 'Token spike blocked',
        where: 'Work OpenAI · Codex', body: 'A 4.1× input spike tripped the 1-hour 3.0× rule.',
        why: [['window', '1h'], ['rule', '3.0× spike'], ['observed', '4.1×'], ['samples', '9']] },
      /* A03-10: this card names one API route and used to hang the
         whole-portfolio blended burn rate on it — $2.85/h, of which most is
         plan-included valuation that this route never bills. At that rate the
         $150 limit would be gone in about two days, so the card's own numbers
         contradicted its own conclusion. The figures are now the route's own:
         $6.18 of API spend over the 90.7 hours of the month so far. The
         portfolio rate is still available, under its own name, for a reader
         who wants to compare the two. */
      { id: 'gd-2', state: 'warn', severity: 'medium', at: at(-47 * MIN), title: 'Spend rate elevated',
        where: 'Claude API · PAYG', scope: 'route', scopeProductId: 'prod:claude-api-payg', meterId: 'meter:claude-api',
        body: 'Burn is 2.2× the 7-day norm; still under the org spending limit.',
        why: [['burn', '$0.0680/h'], ['norm', '$0.0310/h'], ['limit', '$150']],
        portfolioCompare: { perHour: 2.85, label: 'Portfolio blended burn', note: 'The portfolio figure covers every route and is mostly plan-included valuation, so it is not this route\'s spend and is never measured against this route\'s limit.' } },
      { id: 'gd-3', state: 'allowed', severity: 'low', at: at(-31 * MIN), title: 'Large tool result allowed',
        where: 'Kimi Code', body: 'Within window headroom; micro-compaction kept pace.',
        why: [['headroom', '31%'], ['compactions', '2']] },
      { id: 'gd-4', state: 'watch', severity: 'low', at: at(-12 * MIN), title: 'Watching cache churn',
        where: 'OpenCode Go', body: 'Cache hit dipped after the gateway rotation.',
        why: [['hit', '72%'], ['baseline', '89%']] }
    ],

    /* `state` is the legacy render field (measured | estimated | unsupported).
       `cacheReportingState` is the canonical three-way distinction — reported /
       not exposed / unknown — so "we could not read it" is never filed as the
       positive claim "this route has no cache". `cacheMissReason` says why a
       figure is absent. A reported cache read of zero is a reported zero and is
       a different fact from either of the other two. */
    cacheStats: [
      { connectionId: 'conn:claude-work-cli',     state: 'measured',    cacheReportingState: 'reported', cacheMissReason: null, hit: 91.4, save: 2.10, cr: 30100, cw: 4100, note: 'Provider prompt-cache hit for this connection today. The context-ring figure on the thread is a different measurement of a different thing — it is not this number rounded.' },
      { connectionId: 'conn:openai-personal-codex', state: 'measured',  cacheReportingState: 'reported', cacheMissReason: null, hit: 92.4, save: 1.62, cr: 67800, cw: 8900 },
      { connectionId: 'conn:alibaba-personal-coding', state: 'measured', cacheReportingState: 'reported', cacheMissReason: null, hit: 88.1, save: 0.94, cr: 41200, cw: 6100 },
      { connectionId: 'conn:kimi-code',           state: 'estimated',   cacheReportingState: 'reported', cacheWriteBreakdownState: 'not_exposed', cacheMissReason: 'provider_omits_cache_write', hit: 81.5, save: 0.48, cr: 31000, cw: null, note: 'Cache-write field not exposed — not zero' },
      /* ---- fixtures GUI-USG-002 and GUI-USG-006 (audit A05-17) ----
         Both fixtures score on the cache surface and neither had anything to
         score against: every `reported` row in this block carried a positive
         figure, so "a provider-reported zero stays a reported zero" and "a
         reported cache zero is not an unexposed cache" were rules the harness
         could not reach. This is the missing row — the one route whose
         provider returned the cache block and returned zeros in it.

         It is not an invented provider value. The shared gateway is already
         the route this fixture files a reported zero on: ue-618 carries
         billingRoute 'no charge observed' with the note that the gateway
         returned a usage record stating a zero charge, kept as a reported
         zero rather than as free or as unknown. The cache figures are the
         same kind of statement from the same three calls on that route today
         (ue-603, ue-618, ue-620): a keyless shared gateway hands each request
         to whichever worker is free, so no prompt prefix survives between
         them, and the gateway says so in numbers instead of omitting the
         field. Zero read, zero written, zero saved, all four of them
         measured — which is why this row carries source evidence
         (`sourceClass` / `sourceAuthority` / `sourceConfidence` /
         `evidenceEventIds`) and the two rows below it do not: an absence has
         no receipt to point at. */
      { connectionId: 'conn:opencode-shared-gw',  state: 'measured',    cacheReportingState: 'reported', cacheMissReason: null,
        hit: 0, save: 0, cr: 0, cw: 0, observedCalls: 3,
        sourceClass: 'provider_reported', sourceAuthority: 'Shared gateway usage record', sourceConfidence: 'high',
        settlement: 'settled', evidenceEventIds: ['ue-603', 'ue-618', 'ue-620'],
        note: 'Every request on this keyless shared route starts on a fresh worker, so no prefix is there to be reused. The gateway reported that as zeros, and they are kept as zeros.' },
      /* `save` on the two rows below is null, not 0: neither route reported a
         saving, and a saving nobody reported is not a saving of nothing. The
         roll-ups that add this column already skip a null, so the figure they
         print is the sum of what was actually reported. */
      { connectionId: 'conn:zai-legacy',          state: 'unsupported', cacheReportingState: 'not_exposed', cacheMissReason: 'route_has_no_cache_markers', hit: null, save: null, cr: null, cw: null, note: 'Route does not support prompt cache markers' },
      { connectionId: 'conn:antigravity-cli',     state: 'unsupported', cacheReportingState: 'unknown', cacheMissReason: 'provider_commands_unavailable', hit: null, save: null, cr: null, cw: null,
        note: 'Antigravity CLI exposes no cache command here, so cache reporting is unknown — not a proven absence and not a zero.' },
      { connectionId: 'conn:google-antigravity-cli',   state: 'measured',    cacheReportingState: 'reported', cacheMissReason: null, hit: 90.2, save: 0.22, cr: 8900, cw: 1200 },
      { connectionId: 'conn:claude-work-api',     state: 'measured',    cacheReportingState: 'reported', cacheMissReason: null, hit: 94.0, save: 0.31, cr: 12400, cw: 2000 }
    ],

    /* Tool telemetry is Puppet Master's own measurement of its own calls, not
       a provider figure — every row says so. `schemaOverheadTokens` is the
       selected tool/MCP schema each tool contributes to the context window;
       the six rows sum to the 5,900 tokens the Tools segment of thread t-88
       reports, so the two surfaces are the same fact seen twice. */
    tools: [
      { tool: 'search', calls: 458, p50: 45, p95: 210, err: 0.2, idx: 92, recoveries: 0, sourceClass: 'local_estimated', sourceAuthority: 'Puppet Master tool telemetry', sourceConfidence: 'high', schemaOverheadTokens: 1400 },
      { tool: 'edit', calls: 312, p50: 30, p95: 140, err: 0.8, idx: null, recoveries: 1, sourceClass: 'local_estimated', sourceAuthority: 'Puppet Master tool telemetry', sourceConfidence: 'high', schemaOverheadTokens: 900 },
      { tool: 'test', calls: 96, p50: 1800, p95: 9200, err: 2.1, idx: null, recoveries: 1, sourceClass: 'local_estimated', sourceAuthority: 'Puppet Master tool telemetry', sourceConfidence: 'high', schemaOverheadTokens: 800 },
      { tool: 'browser', calls: 41, p50: 950, p95: 4100, err: 1.4, idx: null, recoveries: 0, sourceClass: 'local_estimated', sourceAuthority: 'Puppet Master tool telemetry', sourceConfidence: 'high', schemaOverheadTokens: 700 },
      { tool: 'mcp-github', calls: 66, p50: 210, p95: 880, err: 0.5, idx: 71, recoveries: 0, sourceClass: 'local_estimated', sourceAuthority: 'Puppet Master tool telemetry', sourceConfidence: 'medium', schemaOverheadTokens: 1300 },
      { tool: 'terminal', calls: 205, p50: 60, p95: 390, err: 0.9, idx: null, recoveries: 0, sourceClass: 'local_estimated', sourceAuthority: 'Puppet Master tool telemetry', sourceConfidence: 'high', schemaOverheadTokens: 800 }
    ],

    signals: {
      grade: 'B', score: 84,
      wins: [
        { text: 'Provider prompt-cache reuse on the Work Claude CLI profile held above 91% all day.', tag: 'cache' },
        { text: 'Fallback to Personal OpenAI kept work moving when Work hit its limit.', tag: 'routing' }
      ],
      improvements: [
        { text: 'Extraction children are right-sized — 2 at a time preserves synthesis capacity.', tag: 'capacity' },
        { text: 'One probe consumed part of the free allowance; batch probes to protect the daily headroom.', tag: 'probes' }
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
        { familyId: 'fam:opencode', micro: 2200000, basis: 'plan_included' },
        { familyId: 'fam:zai', micro: 8120000, basis: 'credits' },
        { familyId: 'fam:antigravity', micro: 4310000, basis: 'plan_included' },
        { familyId: 'fam:google', micro: 0, basis: 'free' },
        { familyId: 'fam:github', micro: 0, basis: 'free' },
        { familyId: 'fam:local', micro: 0, basis: 'none' }
      ],
      /* `burn` is the whole portfolio blended over every route, plan-included
         valuation included, which is why a single route's spend guard must not
         be measured against it (A03-10). perHour is the current hourly rate;
         perDay is the seven-day daily average, a different window of the same
         spend — they are two statements, not one number twice. */
      burn: { perHour: 2.85, perDay: 20.3, scope: 'portfolio_blended',
        perHourBasis: 'current hour, every route, plan-included valuation included',
        perDayBasis: 'seven-day daily average',
        byRoute: [
          { productId: 'prod:claude-api-payg', meterId: 'meter:claude-api', perHour: 0.068, norm7dPerHour: 0.031,
            basis: '$6.18 of API spend over the 90.7 hours of the billing month so far', limitMicro: 150000000 }
        ] },
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
  U11.hostById = indexBy(U11.hosts);
  U11.envById = indexBy(U11.environments);
  U11.sourceLocationById = indexBy(U11.sourceLocations);
  U11.clientById = indexBy(U11.clients);
  U11.runById = indexBy(U11.runs);
  U11.cliBridgedById = indexBy(U11.cliBridged);
  U11.forecastById = indexBy(U11.forecasts);
  U11.threadById = indexBy(U11.threads);
  U11.attemptById = (function () {
    var m = {};
    for (var i = 0; i < U11.attempts.length; i++) m[U11.attempts[i].eventId] = U11.attempts[i];
    return m;
  })();
  U11.attemptByEventId = U11.attemptById;

  /* ================================================================
     FORECAST RECOMPUTE — audit A06-12
     ----------------------------------------------------------------
     "Refresh forecast" used to dispatch the canonical command and then
     re-render the same frozen strings: the pane was byte-identical
     before and after the press, so the affordance was decorative and
     the harness had to report renderedForecastChanged=false.

     A reading is DERIVED here, never randomised and never invented.
     Every figure comes out of records this file already carries:

       · the run's own admission block — how many children are queued,
         how many run at once, how many waves are planned;
       · the forecast's own per-child ranges and token budget, which
         already reconcile (8 children at the high end of 18k-26k IS
         the 208,000 advertised, less the 48,000 reserve = 160,000
         usable);
       · the reset instants published by the meters the forecast names
         by stable id in `resetMeterIds`.

     Two things genuinely move between readings — the clock, and
     therefore how much of the window is left before the next reset —
     so a second reading is a different reading of the same inputs
     rather than a new number pulled out of the air. Nothing here
     fabricates a provider value: where an input is absent (plan-12
     records no per-child elapsed range) the projection says it is not
     projected, and never substitutes a zero.

     `recommendation` is rewritten from those figures rather than left
     as authored prose, because a SECOND renderer — the run inspector
     in u11-rundetail.js — prints that sentence, and a sentence that
     cannot move while the numbers under it do is exactly the drift
     this audit found. It stays advice: it says what the ranges cover,
     never what the run will do.
     ================================================================ */
  function forecastRange(inputs, kind) {
    var hit = null;
    (inputs.providerRanges || []).forEach(function (r) {
      if (r.kind === kind && r.lo != null && r.hi != null) hit = r;
    });
    return hit;
  }
  U11.recomputeForecast = function (runId) {
    var run = U11.runById[runId];
    if (!run) return null;
    var fc = run.forecastId ? U11.forecastById[run.forecastId] : null;
    if (!fc) return null;
    var inp = fc.inputs || {};
    /* the demo clock, not the wall clock. Every other surface on this page
       reads instants against U11.meta.now — resets, cooldowns, "last used",
       the run inspector's wall time — and a forecast that measured its
       headroom against the real clock would put a reset "already passed"
       next to a plan meter that says it resets in 2h 14m. */
    var now = Date.parse(U11.meta.now);

    var tokRange = forecastRange(inp, 'tokens');
    var minRange = forecastRange(inp, 'minutes');
    var budget = inp.tokenBudget || null;

    var queued = run.queued.children != null ? run.queued.children : run.queued.members;
    if (queued == null) queued = 0;
    /* the sustainable figure, not the hard maximum: what this run is
       forecast to finish with is what it can hold, not what it is allowed */
    var conc = (run.capacity && run.capacity.predictedSustainable) ||
      run.admitted.sustainableConcurrency || run.admitted.now || 1;
    var wavesLeft = queued > 0 ? Math.ceil(queued / conc) : 0;

    var p = {
      generation: (fc.projection ? fc.projection.generation : 0) + 1,
      computedAt: new Date(now).toISOString(),
      unitNoun: run.kind === 'crew' ? 'members' : 'children',
      runningNow: run.admitted.now,
      queued: queued,
      concurrency: conc,
      wavesLeft: wavesLeft,
      wavesPlanned: run.queued.waves != null ? run.queued.waves : null,
      perChildLo: tokRange ? tokRange.lo : null,
      perChildHi: tokRange ? tokRange.hi : null,
      tokensLo: tokRange ? queued * tokRange.lo : null,
      tokensHi: tokRange ? queued * tokRange.hi : null,
      usableTokens: budget ? budget.usable : null,
      reservedTokens: budget ? budget.reserved : null,
      headroomTokens: (tokRange && budget) ? budget.usable - queued * tokRange.hi : null,
      minutesLo: minRange ? wavesLeft * minRange.lo : null,
      minutesHi: minRange ? wavesLeft * minRange.hi : null,
      elapsedMs: run.startedAt ? now - Date.parse(run.startedAt) : null,
      resetMeterId: null,
      resetAt: null,
      minutesToReset: null,
      /* fits | tight | over | not projected */
      budgetVerdict: 'not projected',
      /* before | close | after | not projected */
      finishVerdict: 'not projected'
    };

    /* the window this run is actually racing is the soonest one still
       ahead of it; a window that has already turned over is not a
       deadline, and it is not reported as a zero either */
    var soonest = null;
    (inp.resetMeterIds || []).forEach(function (mid) {
      var m = U11.meterById[mid];
      if (!m || !m.resetAt) return;
      var t = Date.parse(m.resetAt);
      if (isNaN(t) || t <= now) return;
      if (!soonest || t < soonest.at) soonest = { at: t, id: mid };
    });
    if (soonest) {
      p.resetMeterId = soonest.id;
      p.resetAt = new Date(soonest.at).toISOString();
      p.minutesToReset = Math.floor((soonest.at - now) / 60000);
    }

    if (p.tokensHi != null && p.usableTokens != null) {
      p.budgetVerdict = p.tokensHi <= p.usableTokens ? 'fits'
        : (p.tokensLo <= p.usableTokens ? 'tight' : 'over');
    }
    if (p.minutesHi != null && p.minutesToReset != null) {
      p.finishVerdict = p.minutesHi <= p.minutesToReset ? 'before'
        : (p.minutesLo <= p.minutesToReset ? 'close' : 'after');
    }

    var says = [];
    if (p.budgetVerdict === 'fits') {
      says.push('The usable budget covers the ' + queued + ' queued ' + p.unitNoun +
        ' even at the high end of the per-' + (p.unitNoun === 'members' ? 'member' : 'child') + ' range');
    } else if (p.budgetVerdict === 'tight') {
      says.push('The usable budget covers the ' + queued + ' queued ' + p.unitNoun +
        ' at the low end of the per-' + (p.unitNoun === 'members' ? 'member' : 'child') + ' range but not at the high end');
    } else if (p.budgetVerdict === 'over') {
      says.push('The usable budget does not cover the ' + queued + ' queued ' + p.unitNoun +
        ' at either end of the per-' + (p.unitNoun === 'members' ? 'member' : 'child') + ' range');
    } else {
      says.push('No per-' + (p.unitNoun === 'members' ? 'member' : 'child') +
        ' usage range is recorded on this forecast, so no budget projection is made');
    }
    if (p.finishVerdict === 'before') {
      says.push('and the ' + p.wavesLeft + ' wave' + (p.wavesLeft === 1 ? '' : 's') +
        ' still to run should land before the next reset');
    } else if (p.finishVerdict === 'close') {
      says.push('and the ' + p.wavesLeft + ' wave' + (p.wavesLeft === 1 ? '' : 's') +
        ' still to run may run into the next reset');
    } else if (p.finishVerdict === 'after') {
      says.push('and the ' + p.wavesLeft + ' wave' + (p.wavesLeft === 1 ? '' : 's') +
        ' still to run will not finish before the next reset');
    } else {
      says.push('and no finish time is projected, because this forecast records no elapsed range to project one from');
    }

    /* What a recompute owes the reader is not only a number but whether the
       number moved. "Refresh" that silently redraws the same figures is the
       affordance this audit called decorative; a reading that says it is the
       same as the one before it has told the reader something, and one that
       names what shifted has told them more. Compared field by field against
       the previous reading — never against a remembered sentence. */
    var prev = fc.projection || null;
    p.movedSince = [];
    if (prev) {
      [['queued', 'queued work'], ['concurrency', 'how many run at once'],
        ['wavesLeft', 'waves still to run'], ['tokensHi', 'projected usage'],
        ['usableTokens', 'usable budget'], ['minutesHi', 'projected time'],
        ['minutesToReset', 'time left in the window'],
        ['budgetVerdict', 'the budget verdict'], ['finishVerdict', 'the finish verdict']
      ].forEach(function (f) { if (prev[f[0]] !== p[f[0]]) p.movedSince.push(f[1]); });
    }

    fc.projection = p;
    fc.recommendation = says.join(' ') + '.';
    fc.generatedAt = p.computedAt;
    return p;
  };
  /* reading 1: the page never renders a frozen forecast, so the first thing
     a reader sees is already derived from the same inputs a refresh uses */
  U11.runs.forEach(function (r) { if (r.forecastId) U11.recomputeForecast(r.id); });

  /* ---------- attempt lineage: parent, children, dedupe (UF-085) ----------
     A retry, a resumed stream, a replay, a fallback, a helper and a Back Seat
     Driver check are all their own provider attempts, so each has its own
     record and its own dedupe key; the parent link is what stops them being
     read as one call, and the dedupe key is what stops one call being rolled
     up twice. */
  U11.parentOf = function (eventId) {
    var a = U11.attemptById[eventId];
    return a && a.parentEventId ? (U11.attemptById[a.parentEventId] || null) : null;
  };
  U11.childrenOf = function (eventId) {
    return U11.attempts.filter(function (a) { return a.parentEventId === eventId; });
  };
  U11.attemptByDedupeKey = (function () {
    var m = {};
    U11.attempts.forEach(function (a) { if (a.dedupeKey) m[a.dedupeKey] = a; });
    return m;
  })();
  /* every provider attempt must own exactly one dedupe key */
  U11.dedupeKeysUnique = function () {
    var seen = {}, ok = true;
    U11.attempts.forEach(function (a) {
      if (!a.dedupeKey || seen[a.dedupeKey]) ok = false;
      seen[a.dedupeKey] = 1;
    });
    return ok;
  };

  /* ---------- counting semantics + canonical token buckets ----------
     Resolution order matches the renderers': product, then connection, then
     account, then family. An unmatched route resolves to the published
     "unknown" row rather than to a guess. */
  U11.countingSemanticsFor = function (route) {
    var cs = U11.countingSemantics, keys = [], i, conn, acct;
    if (route) {
      conn = route.connectionId ? U11.connectionById[route.connectionId] : null;
      if (route.productId) keys.push(route.productId);
      if (route.connectionId) keys.push(route.connectionId);
      acct = U11.accountById[route.effectiveAccountId || route.requestedAccountId] ||
        (conn ? U11.accountById[conn.accountId] : null);
      if (acct) { keys.push(acct.id); keys.push(acct.familyId); }
      for (i = 0; i < keys.length; i++) if (cs[keys[i]]) return cs[keys[i]];
    }
    return cs['route:unpublished'];
  };

  /* The eleven canonical buckets for one attempt. Every bucket is present;
     a bucket the provider never reported is null (unknown), never zero. The
     add-back rule is the same one the renderers use, so a total computed here
     and a total rendered on the page cannot disagree. */
  U11.tokenBucketsOf = function (attempt) {
    var t = (attempt && attempt.tokens) || {};
    var sem = U11.countingSemanticsFor(attempt);
    function n(v) { return v == null ? null : Number(v); }
    var input = n(t.input), output = n(t.output), cr = n(t.cacheRead), cw = n(t.cacheWrite), rs = n(t.reasoning);
    var cacheInclusive = sem.cache_in_input === 'inclusive';
    var reasoningInclusive = sem.reasoning_in_output === 'inclusive';

    var inputNonCached = t.inputNonCached != null ? n(t.inputNonCached) : null;
    if (inputNonCached == null && input != null) {
      if (cacheInclusive) inputNonCached = cr == null ? null : input - cr;
      else if (sem.cache_in_input === 'additive') inputNonCached = input;
    }
    var outputVisible = t.outputVisible != null ? n(t.outputVisible) : null;
    if (outputVisible == null && output != null) {
      if (reasoningInclusive) outputVisible = rs == null ? null : output - rs;
      else if (sem.reasoning_in_output === 'additive') outputVisible = output;
    }
    var providerTotal = t.providerTotal != null ? n(t.providerTotal) : null;
    var providerTotalSemantics = providerTotal != null ? 'provider_reported' : 'unknown';
    if (providerTotal == null && input != null && output != null) {
      providerTotal = input + output;
      if (sem.cache_in_input === 'additive') providerTotal += (cr || 0) + (cw || 0);
      if (sem.reasoning_in_output === 'additive') providerTotal += (rs || 0);
      providerTotalSemantics = 'derived_input_plus_output';
    }
    if (sem.provider_total_semantics === 'not_exposed') providerTotalSemantics = 'not_exposed';

    var state = 'unknown';
    if (input == null && output == null) state = attempt && attempt.status === 'queued' ? 'unavailable' : 'unknown';
    else if (input == null || output == null || (attempt && attempt.settlement === 'streaming_partial')) state = 'partial';
    else state = 'final';

    return {
      input_total: input,
      input_non_cached: inputNonCached,
      cache_read: cr,
      cache_write: cw,
      cache_write_1h: t.cacheWrite1h == null ? null : n(t.cacheWrite1h),
      cache_write_ttl: t.cacheWriteTtl == null ? null : n(t.cacheWriteTtl),
      output_total: output,
      output_visible: outputVisible,
      reasoning: rs,
      provider_total: providerTotal,
      context_estimate: t.contextEstimate == null ? null : n(t.contextEstimate),
      context_estimate_is_local_only: true,
      counting_semantics: {
        input_total_includes_cache: sem.input_total_includes_cache,
        output_total_includes_reasoning: sem.output_total_includes_reasoning,
        provider_total_semantics: providerTotalSemantics,
        cache_in_input: sem.cache_in_input,
        reasoning_in_output: sem.reasoning_in_output,
        published_row: sem.published_row,
        note: sem.note || null
      },
      usage_reporting_state: state
    };
  };

  /* ---------- server-first lineage: all seven levels ----------
     Project → Home Server → Execution Host → Execution Environment →
     Source Location → Client → the work itself. A level that genuinely does
     not apply (a server run with no client attached) resolves to null rather
     than borrowing a neighbour's value. */
  U11.lineageOf = function (rec) {
    if (!rec) return null;
    var host = rec.hostId ? U11.hostById[rec.hostId] : null;
    var env = rec.envId ? U11.envById[rec.envId] : null;
    var loc = rec.sourceLocationId ? U11.sourceLocationById[rec.sourceLocationId] : null;
    var client = rec.clientId ? U11.clientById[rec.clientId] : null;
    var work = rec.workId ? U11.workById[rec.workId] : null;
    return {
      project: rec.project || U11.meta.project,
      homeServer: host && host.kind === 'home_server' ? host : null,
      host: host,
      environment: env,
      sourceLocation: loc,
      client: client,
      work: work || (rec.id && U11.runById[rec.id] ? U11.runById[rec.id] : null)
    };
  };

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

  /* Two different questions, previously conflated (audit A02-10).
     modelsOfFamily answers "who built this model" from the catalog, which is
     why routing families that build nothing of their own - OpenCode,
     Antigravity, GitHub - appeared to own zero models. The hierarchy needs
     the other edge: which models were actually ROUTED through a family's
     accounts, derived from observed attempts rather than from the registry. */
  U11.modelsRoutedThroughFamily = function (familyId) {
    var seen = {}, out = [];
    U11.attempts.forEach(function (a) {
      var acct = U11.accountById[a.effectiveAccountId || a.requestedAccountId];
      if (!acct || acct.familyId !== familyId) return;
      var mid = a.effectiveModelId || a.requestedModelId;
      var m = mid && U11.modelById[mid];
      if (!m || seen[mid]) return;
      seen[mid] = true; out.push(m);
    });
    return out;
  };
  /* Models observed on one product, so the scope picker can offer the fifth
     level under the product that actually ran them. */
  U11.modelsOfProduct = function (productId) {
    var seen = {}, out = [];
    U11.attempts.forEach(function (a) {
      if (a.productId !== productId) return;
      var mid = a.effectiveModelId || a.requestedModelId;
      var m = mid && U11.modelById[mid];
      if (!m || seen[mid]) return;
      seen[mid] = true; out.push(m);
    });
    return out;
  };
  /* The vendor that built a model versus the family it was routed through.
     Where they differ the UI must say both, never silently pick one. */
  U11.modelOrigin = function (modelId, familyId) {
    var m = U11.modelById[modelId]; if (!m) return null;
    var built = U11.familyById[m.familyId] || null;
    var routed = familyId ? (U11.familyById[familyId] || null) : null;
    return { model: m, builtBy: built, routedThrough: routed,
      differs: !!(built && routed && built.id !== routed.id) };
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
    /* Models are the fifth canonical hierarchy level. They were resolvable
       nowhere, so a model id fell through to 'Unknown scope' and the level
       could not be navigated at all (audit A02-10). */
    if (U11.modelById[id]) return { kind: 'model', id: id, label: U11.modelById[id].label };
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
    /* removed accounts keep their historical routes, but those routes are
       never current usage — they must not reach a plan card or a total. */
    function addAcct(aid) {
      var acct = U11.accountById[aid];
      if (acct && acct.removed) return;
      U11.connectionsOfAccount(aid).forEach(function (c) { addConn(c.id); });
    }
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
    else if (U11.modelById[scopeId]) {
      /* A model is scoped by where it actually ran, not by who builds it.
         Removed accounts stay excluded through the same addAcct guard. */
      U11.attempts.forEach(function (a) {
        if (a.effectiveModelId !== scopeId && a.requestedModelId !== scopeId) return;
        var acct = U11.accountById[a.effectiveAccountId || a.requestedAccountId];
        if (acct && acct.removed) return;
        if (a.productId) addProd(a.productId);
      });
    }
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
    if (U11.modelById[scopeId]) {
      return a.effectiveModelId === scopeId || a.requestedModelId === scopeId;
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

  /* ---------- operational maintenance accessors (packet §04) ---------- */
  U11.operationsFor = function () { return U11.operational; };
  U11.attemptsOfOperational = function (opId) {
    return U11.attempts.filter(function (a) { return a.validationFor === opId || a.operationalRef === opId; });
  };
  U11.bsdByEventId = (function () {
    var m = {};
    U11.bsdEvents.forEach(function (b) { if (b.eventId) m[b.eventId] = b; });
    return m;
  })();
  /* A Back Seat Driver check that made no provider call has no usage event to
     hang on — and inventing one would be a fabricated attempt. It reaches a
     surface through its work and its operational decision record instead. */
  U11.bsdEventsWithoutAttempt = function () {
    return U11.bsdEvents.filter(function (b) { return !b.eventId; });
  };
  U11.bsdEventsOfWork = function (workId) {
    return U11.bsdEvents.filter(function (b) { return b.workId === workId; });
  };
  U11.operationalById = (function () {
    var m = {};
    U11.operational.forEach(function (o) { m[o.id] = o; });
    return m;
  })();
  /* Background validation belongs to no logical turn; it still has to be
     reachable, so it is listed rather than left to a work-grouped view. */
  U11.backgroundAttempts = function () {
    return U11.attempts.filter(function (a) { return !a.workId; });
  };
  U11.attemptsOfMeter = function (meterId) {
    return U11.attempts.filter(function (a) { return a.allowance && a.allowance.meterId === meterId; });
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
      /* counting semantics, not blind addition: cache and reasoning are added
         only on routes that bill them as their own buckets, so this total and
         the totals the widgets render agree by construction. */
      var b = U11.tokenBucketsOf(a), cs = b.counting_semantics, tok = 0;
      if (b.input_total != null) tok += b.input_total;
      if (b.output_total != null) tok += b.output_total;
      if (cs.cache_in_input === 'additive') tok += (b.cache_read || 0) + (b.cache_write || 0);
      if (cs.reasoning_in_output === 'additive' && b.reasoning != null) tok += b.reasoning;
      t.tokens += tok;
      t.costMicro += a.costMicro || 0;
      t.count += 1;
    });
    return totals;
  };

  /* ================================================================
     4e/4f ACCESSORS — CLI-bridged probes and credit signals
     ================================================================ */
  U11.cliBridgedFor = function (familyId) {
    return U11.cliBridged.filter(function (c) { return !familyId || c.familyId === familyId; });
  };
  U11.cliProbe = function (recordId, probeName) {
    var rec = U11.cliBridgedById[recordId], out = null;
    if (!rec) return null;
    rec.probes.forEach(function (p) { if (p.probe === probeName) out = p; });
    return out;
  };
  /* Every credit signal in the demo, with the four things a credit is not
     carried on the row itself. A renderer that wants to add one of these into
     a token bucket, a cost, a quota or a provider total has to override a
     field that says do not (fixture GUI-CBP-002). */
  U11.creditSignals = function () {
    return U11.cliBridged.map(function (c) {
      return {
        recordId: c.id, provider_id: c.provider_id, route: c.route,
        familyId: c.familyId, accountId: c.accountId, connectionId: c.connectionId,
        hostId: c.hostId, envId: c.envId,
        label: c.credits.label, setting: c.credits.setting, use_g1_credits: c.credits.use_g1_credits,
        credits_status: c.credits.credits_status, credits_remaining: c.credits.credits_remaining,
        unit: c.credits.unit, evidence_source: c.credits.evidence_source, copy: c.credits.copy,
        summableIntoTokens: false, summableIntoCost: false, summableIntoQuota: false, summableIntoProviderTotal: false,
        note: c.credits.note
      };
    });
  };
  /* One row per probe across every installation — what CBP-027 asks a probe
     record to state, in the shape a table can render. */
  U11.cliProbeMatrix = function () {
    var rows = [];
    U11.cliBridged.forEach(function (c) {
      c.probes.forEach(function (p) {
        rows.push({ recordId: c.id, provider_id: c.provider_id, route: c.route,
          hostId: c.hostId, envId: c.envId, probe: p.probe, state: p.state,
          field: p.field || null, value: p.value == null ? null : p.value,
          copy: p.copy || null, fabricated: p.fabricated === true, payload_ref: p.payload_ref || null });
      });
    });
    return rows;
  };

  /* ================================================================
     ATTEMPT ROLE + WORK TOTALS (audit A04-04, A04-05)
     The ledger card counted "attempts minus one" as helper calls, so two
     user_work primaries on the same work item were reported as helpers, and
     it showed its headline call's tokens as if they were the work item's.
     A role is a fact about the attempt, so it is carried on the attempt; a
     work total is a sum over all of them, so it is one accessor.
     ================================================================ */
  var CHILD_PURPOSE = { subagent: 1, crew_member: 1, moa_reference: 1, moa_aggregator: 1 };
  U11.attemptRole = function (a) {
    if (!a) return 'unknown';
    if (!a.workId) return 'background';
    if (CHILD_PURPOSE[a.purpose]) return 'child';
    if (a.purpose === 'user_work') return 'primary';
    return 'helper';
  };
  U11.workRoster = function (workId, scopeId) {
    var all = U11.attempts.filter(function (a) {
      return a.workId === workId && (scopeId == null || U11.attemptInScope(a, scopeId));
    });
    var headline = all.filter(function (a) { return a.bucket === 'main'; })[0] || all[0] || null;
    var primaries = [], helpers = [], children = [];
    all.forEach(function (a) {
      var r = U11.attemptRole(a);
      if (r === 'child') children.push(a);
      else if (r === 'helper') helpers.push(a);
      else primaries.push(a);
    });
    var others = primaries.filter(function (a) { return a !== headline; });
    return {
      workId: workId, headline: headline, attempts: all,
      primaries: primaries, otherPrimaries: others, helpers: helpers, children: children,
      counts: { attempts: all.length, primaries: primaries.length, otherPrimaries: others.length,
        helpers: helpers.length, children: children.length },
      note: 'A primary is a call that did the asked-for work. A helper supports one. A child is a subagent, crew member or mixture-of-agents worker. Counting every attempt after the headline as a helper counts primaries as helpers.'
    };
  };
  /* The work item's own total, added with the same counting semantics the
     renderers use, so an inclusive cache or reasoning bucket is never added
     back. An attempt the provider never reported is not counted as zero: it is
     counted as not reported, and the caller is told how many there were. */
  U11.workTotals = function (workId, scopeId) {
    var list = U11.attempts.filter(function (a) {
      return a.workId === workId && (scopeId == null || U11.attemptInScope(a, scopeId));
    });
    var t = { workId: workId, attempts: list.length, counted: 0, notReported: 0,
      input_total: 0, output_total: 0, cache_read: 0, cache_write: 0, reasoning: 0,
      total: 0, totalState: 'final',
      cost: { micro: 0, money: 0, covered: 0, byok: 0, unknown: 0 } };
    var anyPartial = false;
    list.forEach(function (a) {
      var b = U11.tokenBucketsOf(a), cs = b.counting_semantics, tok = 0, seen = false;
      if (b.input_total != null) { t.input_total += b.input_total; tok += b.input_total; seen = true; }
      if (b.output_total != null) { t.output_total += b.output_total; tok += b.output_total; seen = true; }
      if (b.cache_read != null) t.cache_read += b.cache_read;
      if (b.cache_write != null) t.cache_write += b.cache_write;
      if (b.reasoning != null) t.reasoning += b.reasoning;
      if (cs.cache_in_input === 'additive') tok += (b.cache_read || 0) + (b.cache_write || 0);
      if (cs.reasoning_in_output === 'additive' && b.reasoning != null) tok += b.reasoning;
      if (seen) { t.total += tok; t.counted += 1; } else t.notReported += 1;
      if (b.usage_reporting_state === 'partial') anyPartial = true;
      var f = U11.costFacetOf(a);
      if (f === 'money') { t.cost.micro += a.costMicro; t.cost.money += 1; } else t.cost[f] += 1;
    });
    if (!t.counted) { t.total = null; t.totalState = 'unknown'; }
    else if (anyPartial || t.notReported) t.totalState = 'partial';
    return t;
  };

  /* ================================================================
     RUN ROUTE SPREAD (audit A04-08)
     A Crew whose members ran on four provider families was rendered as one
     route, because the card read the run's first member. The spread is a
     property of the member set, so it is computed from the member set.
     ================================================================ */
  U11.runRouteSpread = function (runId) {
    var run = U11.runById[runId];
    if (!run) return null;
    var order = [], map = {};
    (run.members || []).forEach(function (m) {
      var a = m.eventId ? U11.attemptById[m.eventId] : null;
      var acctId = a ? (a.effectiveAccountId || a.requestedAccountId) : null;
      var acct = acctId ? U11.accountById[acctId] : null;
      var famId = acct ? acct.familyId : null;
      var key = famId || 'route:unidentified';
      if (!map[key]) {
        map[key] = { familyId: famId, label: famId && U11.familyById[famId] ? U11.familyById[famId].label : 'Route not identified',
          memberIds: [], eventIds: [], accountIds: [] };
        order.push(map[key]);
      }
      map[key].memberIds.push(m.child);
      if (m.eventId) map[key].eventIds.push(m.eventId);
      if (acctId && map[key].accountIds.indexOf(acctId) === -1) map[key].accountIds.push(acctId);
    });
    return {
      runId: runId, families: order, count: order.length, multiRoute: order.length > 1,
      note: order.length > 1
        ? 'This run ran across ' + order.length + ' provider families. It is never collapsed under one member\'s route.'
        : 'Every member of this run ran on the same provider family.'
    };
  };

  /* ================================================================
     WINDOW RESET GUARD (audit A03-19)
     Whether a reset exists is a property of the window kind. Whether its
     value can be read is a property of the value state. Keying the copy on
     the value state alone means a window with no reset at all — a pool, a
     balance, a keyless route — asserts that a reset exists but is unreadable.
     ================================================================ */
  var WINDOW_HAS_RESET = {
    rolling: true, fixed_reset: true, billing_cycle: true,
    pool: false, balance: false, banked: false, pack: false, trial: false,
    none: false, session_only: false, unknown: false
  };
  U11.windowHasReset = function (windowKind) { return WINDOW_HAS_RESET[windowKind] === true; };
  U11.meterResetState = function (m) {
    if (!m) return { hasReset: false, state: 'unknown', at: null, text: '' };
    var kind = m.windowKind || 'unknown';
    var hasReset = U11.windowHasReset(kind);
    if (!hasReset) {
      return { hasReset: false, state: 'no_reset_window', at: null, expiresAt: m.expiresAt || null,
        text: m.expiresAt ? '' : '',
        why: 'A ' + kind.replace(/_/g, ' ') + ' window has no reset to show, so none is claimed.' };
    }
    if (m.resetAt) return { hasReset: true, state: 'reset_at', at: m.resetAt, expiresAt: m.expiresAt || null, text: '', why: null };
    var unreadable = m.vs === 'unknown' || m.vs === 'unavailable' || m.vs === 'stale';
    return { hasReset: true, state: unreadable ? 'unreadable' : 'unknown', at: null, expiresAt: m.expiresAt || null,
      text: 'Reset time unavailable',
      why: 'This window does reset, and the provider did not publish when.' };
  };

  /* ================================================================
     TIME KIND COVERAGE (audit A06-09)
     ================================================================ */
  var TIME_KIND_LABEL = {
    provider_active: 'Provider or model active',
    local_compute: 'Local compute',
    tool_runtime: 'Tool or runtime execution',
    resource_wait: 'Resource wait',
    provider_permit_wait: 'Provider permit wait',
    approval_wait: 'Approval wait',
    outbox_offline_wait: 'Outbox or offline wait',
    reconnect_sync_replay: 'Reconnect, sync, replay or snapshot',
    reset_wait: 'Waiting for reset',
    maintenance: 'Maintenance',
    total_elapsed: 'Total elapsed'
  };
  U11.timeKindLabel = function (kind) { return TIME_KIND_LABEL[kind] || kind; };
  U11.timeKindCoverage = function (runId) {
    var run = U11.runById[runId], kinds = U11.canon.time_kind;
    var out = { runId: runId, total: kinds.length, recorded: 0, recordedKinds: [], missing: [] };
    if (!run || !run.timing) {
      kinds.forEach(function (k) { out.missing.push({ kind: k, label: TIME_KIND_LABEL[k], why: 'No time decomposition was recorded for this run.' }); });
      return out;
    }
    var have = {};
    (run.timing.rows || []).forEach(function (r) { if (r.kind) have[r.kind] = true; });
    if (run.timing.elapsedMs != null) have[run.timing.totalKind || 'total_elapsed'] = true;
    var why = {};
    (run.timing.notRecorded || []).forEach(function (r) { why[r.kind] = r.why; });
    kinds.forEach(function (k) {
      if (have[k]) { out.recorded += 1; out.recordedKinds.push(k); }
      else out.missing.push({ kind: k, label: TIME_KIND_LABEL[k], why: why[k] || 'Not recorded for this run.' });
    });
    return out;
  };

  /* ================================================================
     CURRENT SCOPE vs HISTORY (audit A02-01)
     attemptInScope answers "does this event belong to this scope", and it
     deliberately matches a removed account by account and by family so the
     Ledger can still show that account's history. It is not a current-usage
     filter, and the scope footer used it as one: "All current usage" reported
     54 events and $0.8800 when 2 events and $0.67 of that belong to a retired
     API key — in the same sentence that says removed accounts never appear
     there. Current and historical are two questions, so they are two answers.
     ================================================================ */
  U11.attemptIsHistorical = function (a) {
    if (!a) return false;
    if (a.historical || a.historicalIdentity) return true;
    var acct = U11.accountById[a.effectiveAccountId || a.requestedAccountId];
    if (acct && acct.removed) return true;
    var w = a.workId ? U11.workById[a.workId] : null;
    return !!(w && w.historical);
  };
  U11.attemptIsCurrent = function (a) { return !U11.attemptIsHistorical(a); };
  U11.attemptsInScope = function (scopeId, opts) {
    var include = (opts && opts.include) || 'current';
    return U11.attempts.filter(function (a) {
      if (!U11.attemptInScope(a, scopeId)) return false;
      if (include === 'all') return true;
      if (include === 'historical') return U11.attemptIsHistorical(a);
      return U11.attemptIsCurrent(a);
    });
  };
  /* the same cost facets the page renders, so a total computed here and a
     total rendered there cannot disagree */
  U11.costFacetOf = function (a) {
    if (!a) return 'unknown';
    if (a.hiddenSubscription || a.costStatus === 'hidden_subscription' || a.displayCostPolicy === 'subscription_covered') return 'covered';
    if (a.hiddenByok || a.costStatus === 'hidden_byok' || a.displayCostPolicy === 'hide') return 'byok';
    if (a.displayCostPolicy === 'show' && a.costMicro != null) return 'money';
    return 'unknown';
  };
  function facetSummary(list) {
    var sum = { count: list.length, micro: 0, money: 0, covered: 0, byok: 0, unknown: 0 };
    list.forEach(function (a) {
      var f = U11.costFacetOf(a);
      if (f === 'money') { sum.micro += a.costMicro; sum.money += 1; } else sum[f] += 1;
    });
    return sum;
  }
  U11.scopeEventTotals = function (scopeId) {
    var cur = U11.attemptsInScope(scopeId, { include: 'current' });
    var hist = U11.attemptsInScope(scopeId, { include: 'historical' });
    return {
      scopeId: scopeId || 'scope:all',
      current: facetSummary(cur),
      historical: facetSummary(hist),
      all: facetSummary(cur.concat(hist)),
      note: 'Current totals leave out accounts that have been removed. Their events keep their own history and stay reachable in the Ledger; they are simply not current usage.'
    };
  };

  /* ================================================================
     THE MINIMUM SHARED IDENTITY SET, ON EVERY EVENT
     (audit A02-13, A04-12, A03-08)
     ----------------------------------------------------------------
     Reference canon item 14 and the packet's "Required route fields" say the
     same thing: session lineage, conversation mode, effort, Normal/Fast, the
     requested and effective access profile and the cost provenance are carried
     by every event. Six of the fifty-four attempts carried them, so the
     mode-ceiling contract could be demonstrated exactly once and the field's
     coverage could not be judged from the demo at all.

     None of these values is guessed. Effort and speed belong to the request,
     so Puppet Master knows what it asked for; a model that does not reason
     reads not_applicable rather than being given a number. The access profile
     is Puppet Master's own state, and the effective one differs from the
     requested one only where a real ceiling applied. A session is what a
     thread or a run is, and a probe that belongs to neither carries a null id
     and says why instead of borrowing a turn's session. Pricing provenance is
     filled in only where money exists: a suppressed or unknown cost gets no
     snapshot id, because a snapshot id with nothing behind it is the exact
     fabrication fixture GUI-USG-004 forbids.

     Attempts authored with any of these fields keep what they were authored
     with; this pass only fills what was absent.
     ================================================================ */
  var WORK_SESSION = {
    'work-1': 'sess-t88-1', 'work-2': 'sess-t88-1', 'work-3': 'sess-t88-1',
    'work-4': 'sess-t88-2', 'work-5': 'sess-t88-2', 'work-6': 'sess-t88-2',
    'work-7': 'sess-goal-47', 'work-8': 'sess-plan-12', 'work-9': 'sess-crew-3',
    'work-10': 'sess-t91-1', 'work-11': 'sess-t91-b1', 'work-12': 'sess-t77-1',
    'work-h1': 'sess-legacy-1'
  };
  var WORK_MODE = {
    'work-1': 'agent', 'work-2': 'agent', 'work-3': 'agent',
    'work-4': 'review', 'work-5': 'review', 'work-6': 'agent',
    'work-7': 'agent', 'work-8': 'plan', 'work-9': 'agent',
    'work-10': 'agent', 'work-11': 'agent', 'work-12': 'agent',
    'work-h1': 'chat'
  };
  /* how far a call was allowed to reach, by what the call is for */
  var PURPOSE_PROFILE = {
    user_work: 'full_access', subagent: 'full_access', crew_member: 'full_access', fallback_attempt: 'full_access',
    approval_review: 'review_limited',
    probe: 'read_only', catalog_validation: 'read_only', bsd: 'read_only', skill_search: 'read_only',
    mcp_router: 'read_only', web_extract: 'read_only', conversation_replay: 'read_only',
    compression: 'no_tools', title_generation: 'no_tools', vision: 'no_tools',
    attachment_transform: 'no_tools', moa_reference: 'no_tools', moa_aggregator: 'no_tools'
  };
  var FAST_PURPOSE = {
    compression: 1, title_generation: 1, skill_search: 1, mcp_router: 1,
    probe: 1, catalog_validation: 1, bsd: 1, web_extract: 1, attachment_transform: 1
  };
  U11.attempts.forEach(function (a) {
    var mid = a.effectiveModelId || a.requestedModelId;
    var mo = mid ? U11.modelById[mid] : null;
    var w = a.workId ? U11.workById[a.workId] : null;

    /* what this attempt is to its work item */
    if (a.roleClass == null) a.roleClass = U11.attemptRole(a);

    /* session lineage */
    if (a.sessionId == null) a.sessionId = a.workId ? (WORK_SESSION[a.workId] || null) : null;
    if (a.sessionLineage == null) {
      a.sessionLineage = !a.workId ? 'background' : (w && w.runId ? 'run' : 'thread');
    }

    /* conversation mode */
    if (a.conversationMode == null) a.conversationMode = a.workId ? (WORK_MODE[a.workId] || 'agent') : 'not_applicable';

    /* requested effort — never a number on a model that does not reason */
    if (a.reasoningEffort == null) {
      if (!mo) a.reasoningEffort = 'unknown';
      else if (!mo.reasoning) a.reasoningEffort = 'not_applicable';
      else a.reasoningEffort = (a.bucket === 'main' && a.purpose === 'user_work') ? 'high' : 'medium';
    }
    /* Normal/Fast */
    if (a.speedMode == null) a.speedMode = FAST_PURPOSE[a.purpose] ? 'fast' : (mo ? 'normal' : 'unknown');

    /* requested and effective reach */
    if (a.requestedAccessProfile == null) a.requestedAccessProfile = PURPOSE_PROFILE[a.purpose] || 'unknown';
    if (a.effectiveAccessProfile == null) a.effectiveAccessProfile = a.requestedAccessProfile;

    /* cost provenance */
    if (a.pricingSource == null) {
      if (a.costStatus === 'hidden_subscription' || a.costStatus === 'hidden_byok') {
        a.pricingSource = 'not_applicable';
        a.pricingSnapshotId = null; a.pricingEffectiveAt = null; a.pricingVersion = null;
        a.pricingNote = a.costStatus === 'hidden_byok'
          ? 'Your own key pays this route, so Puppet Master consulted no price list and holds no price to show.'
          : 'The plan covers this call, so no price list was consulted and there is no per-token price to show.';
      } else if (a.costStatus === 'unknown') {
        a.pricingSource = 'unknown';
        a.pricingSnapshotId = null; a.pricingEffectiveAt = null; a.pricingVersion = null;
        a.pricingNote = 'No price was reported and none was applied, so the provenance is unknown rather than empty.';
      } else {
        a.pricingSource = 'provider_reported';
        a.pricingSnapshotId = null;
        a.pricingEffectiveAt = a.finishedAt || a.startedAt || null;
        a.pricingVersion = null;
        a.pricingNote = 'The provider stated this amount itself, so no price list and no snapshot stands behind it.';
      }
    }
  });

  /* ================================================================
     THE TWO ACCESSORS THAT HAD NO CALL SITE (audit A04-18)
     bucketTotals and attemptsOfOperational were defined, exposed and never
     invoked, while the wiring register listed one of them as shipped
     structure. They are the join now: every operational record carries the
     events it caused, so the offline-outbox record's "see ue-610" sentence
     has a field behind it and a drill-through to hang on, and the bucket
     totals exist as one number per bucket instead of as a promise.
     ================================================================ */
  U11.operational.forEach(function (o) {
    o.relatedEventIds = U11.attemptsOfOperational(o.id).map(function (x) { return x.eventId; });
  });
  U11.bucketTotalsAll = U11.bucketTotals('scope:all');

  /* ================================================================
     ONE SHARED FORMATTER, INCLUDING FOR THE TRIAL (audit A06-17)
     The trial row carried a hard-coded display string with no zone label, so
     it was byte-identical in every timezone and five and a half hours wrong
     for a reader in Kolkata. It carries the instant now, and the same
     formatter every other time in this concept goes through writes what the
     reader sees. The authored value stays as an unambiguous UTC stamp for a
     host where no zone resolves at all.
     ================================================================ */
  (function () {
    var T = window.U11time;
    if (!T || !T.atMonthDayClock) return;
    U11.freeModels.forEach(function (fm) {
      if (!fm.endsAt) return;
      var full = T.atMonthDayClock(fm.endsAt);               /* Aug 16 00:00 EDT */
      var dayOnly = full.replace(/\s+\d{1,2}:\d{2}(\s+\S+)?$/, '');
      fm.detail = 'Trial ends ' + full;
      fm.label = 'Free until ' + (dayOnly || full);
    });
  })();

  /* ================================================================
     DEMO COMMAND DISPATCH — packet §19
     Labels map to canonical command families; demo wrappers only.
     ================================================================ */
  U11.dispatch = function (cmdId, payload) {
    /* Every semantic destination carries provider_family_id (audit A01-07).
       A payload that names an account, a connection, a product or a model has
       already determined the family, so it is filled in here rather than left
       to each call site to remember — and the camelCase spellings older call
       sites pass are normalised to the canonical field at the same time. */
    var p = payload || null;
    if (p && typeof p === 'object' && Object.prototype.toString.call(p) !== '[object Array]') {
      var norm = U11.linkIdentity(p);
      if (norm.provider_family_id != null && p.provider_family_id == null) p.provider_family_id = norm.provider_family_id;
    }
    var entry = { cmd: cmdId, payload: p, at: new Date().toISOString() };
    U11.cmdLog.push(entry);
    var toasts = {
      'cmd.usage.refresh': 'Usage projections refreshed (demo)',
      'cmd.usage.export': 'Export prepared (demo)',
      'cmd.account.select_profile': 'Profile selected (demo)',
      'cmd.provider.switch_route': 'Future work will prefer this account. In-flight requests are never moved.',
      'cmd.chat.compact_context': 'Compaction dispatched (demo)',
      'cmd.chat.open_thread_context_details': 'Context details opened',
      'cmd.chat.focus_thread_context_details': 'Context details focused',
      'cmd.chat.close_thread_context_details': 'Context details closed',
      'cmd.widget.add': 'Widget added',
      'cmd.widget.remove': 'Widget removed',
      'cmd.widget.resize': 'Widget resized',
      'cmd.widget.configure': 'Widget configured',
      'cmd.widget.move': 'Widget moved',
      'cmd.widget.reset_layout': 'Layout reset to defaults',
      /* A06-12: this used to say "refreshed" while nothing was recomputed.
         The reading is now genuinely retaken from the run's admission state,
         the forecast's own ranges and the reset still ahead of it. */
      'cmd.usage.forecast.request': 'Forecast recomputed (demo)',
      'cmd.provider.usage.open_management': 'Opening provider usage management (demo)',
      'cmd.settings.bloom.open': 'Opening Settings (demo deep link)'
    };
    return { ok: true, cmd: cmdId, toast: toasts[cmdId] || (cmdId + ' (demo)') };
  };

  /* Canonical Settings deep link.

     Corrected 2026-08-18 (audit A01-06, A01-07, A10-01, A11-09). The previous
     payload shape {surface, manager, section, focus_reason} was invented: the
     Settings inventory has no 'providers' or 'usage' manager (both are
     subgroups of other categories), and focus_reason / usage_and_extra_usage /
     usage_quick_controls / see_all appear nowhere in canon.

     The real owner is F3-434 (Plans/FinalGUISpec.md): open(category,
     focusSettingId), bound to cmd.settings.bloom.open and certified at
     Plans/Wiring_Matrix.production.json row catalog.settings_bloom_open.
     Category must be one of the 12 in Plans/settings_inventory.json and
     focusSettingId must be a real settings row id. */
  var SETTINGS_CATEGORIES = {
    general: 1, ai: 1, safety: 1, code: 1, memory: 1, planning: 1,
    branching: 1, media: 1, web: 1, personas: 1, extensions: 1, system: 1
  };

  /* Legacy destinations still passed by older call sites, mapped onto the real
     canonical rows. Retained only so the concept keeps working while call sites
     migrate; new code should call U11.openSettings directly. */
  var LEGACY_DEST_MAP = {
    'providers/routing': 'ai.accounts.multi-account-switching',
    'providers/setup': 'ai.accounts.default-account',
    'usage/usage_and_extra_usage': 'ai.usage.quota-management'
  };

  /* Destination identity (audit A01-06, A01-07, A08-04, A10-01).

     The highest-precedence adjudication asks the runtime-demand flow to
     deep-link to the EXACT Provider Settings row and to preserve the
     originating operation and its continuation token. A category and a row id
     say which page; they do not say which provider, which CLI, which account,
     which connection or which machine — and the same five-key payload would
     have been produced for any provider CLI on any host, so a real Settings
     surface could only have opened the generic provider list.

     These are the correlation fields that ride alongside the destination. They
     never replace the row id; they say what the row is being opened about. Any
     one of them determines the others it sits above, so the family is derived
     rather than left to the caller. */
  var IDENTITY_KEYS = ['provider_family_id', 'account_id', 'connection_id', 'product_id', 'model_id',
    'meter_id', 'provider_cli', 'provider_route_kind', 'host_id', 'env_id',
    'originating_operation_id', 'continuation', 'usage_event_ref'];
  var CLI_LABEL = { codex: 'Codex CLI', claude: 'Claude CLI', agy: 'Antigravity CLI', opencode: 'OpenCode CLI' };

  U11.linkIdentity = function (seed) {
    var src = seed || {}, out = {};
    IDENTITY_KEYS.forEach(function (k) { if (src[k] != null) out[k] = src[k]; });
    /* camelCase spellings older call sites still pass */
    if (out.provider_family_id == null && src.familyId != null) out.provider_family_id = src.familyId;
    if (out.account_id == null && src.accountId != null) out.account_id = src.accountId;
    if (out.connection_id == null && src.connectionId != null) out.connection_id = src.connectionId;
    if (out.product_id == null && src.productId != null) out.product_id = src.productId;
    if (out.model_id == null && src.modelId != null) out.model_id = src.modelId;
    if (out.meter_id == null && src.meterId != null) out.meter_id = src.meterId;
    if (out.host_id == null && src.hostId != null) out.host_id = src.hostId;
    if (out.env_id == null && src.envId != null) out.env_id = src.envId;
    /* fill the levels above whatever identity is present */
    var anc = null;
    if (out.meter_id != null || out.product_id != null || out.connection_id != null) {
      anc = U11.ancestorsOf(out.meter_id || out.product_id || out.connection_id);
      if (out.product_id == null && anc.productId) out.product_id = anc.productId;
      if (out.connection_id == null && anc.connectionId) out.connection_id = anc.connectionId;
      if (out.account_id == null && anc.accountId) out.account_id = anc.accountId;
      if (out.provider_family_id == null && anc.familyId) out.provider_family_id = anc.familyId;
    }
    if (out.provider_family_id == null && out.account_id != null) {
      var acct = U11.accountById[out.account_id];
      if (acct) out.provider_family_id = acct.familyId;
    }
    if (out.provider_family_id == null && out.model_id != null) {
      var mdl = U11.modelById[out.model_id];
      if (mdl) out.provider_family_id = mdl.familyId;
    }
    return out;
  };

  /* What the identity says, in words, so the destination is legible to the
     reader and not only to the receiving surface — including the continuation
     token, which used to exist in the fixture and reach no surface at all. */
  U11.linkIdentityText = function (ident) {
    if (!ident) return '';
    var bits = [];
    if (ident.provider_cli) bits.push(CLI_LABEL[ident.provider_cli] || ident.provider_cli);
    if (ident.account_id && U11.accountById[ident.account_id]) bits.push(U11.accountLabel(ident.account_id));
    else if (ident.provider_family_id && U11.familyById[ident.provider_family_id]) bits.push(U11.familyById[ident.provider_family_id].label);
    if (ident.connection_id && U11.connectionById[ident.connection_id]) bits.push(U11.connectionById[ident.connection_id].label);
    if (ident.host_id || ident.env_id) {
      var h = U11.hostById[ident.host_id], e = U11.envById[ident.env_id];
      bits.push((h ? h.label : ident.host_id || 'host not named') + ' / ' + (e ? e.label : ident.env_id || 'environment not named'));
    }
    if (ident.originating_operation_id) bits.push('from ' + ident.originating_operation_id);
    if (ident.continuation) bits.push('continuation ' + ident.continuation);
    return bits.length ? ' · ' + bits.join(' · ') : '';
  };

  /* Human labels for the Settings rows this concept links to, so a widget can
     name its destination instead of saying "settings". Every id here is a real
     row in Plans/settings_inventory.json, verified 2026-08-18. */
  var SETTINGS_ROW_LABEL = {
    'ai.usage.usage-windows': 'Usage Windows Shown',
    'ai.usage.chart-type': 'Usage Chart Style',
    'ai.usage.platform-filters': 'Providers on the Usage Board',
    'ai.usage.cooldown-timers': 'Show Account Cooldowns',
    'ai.usage.reset-countdown': 'Show Quota Reset Timer',
    'ai.usage.monthly-spend-limit': 'Monthly Spend Limit',
    'ai.usage.budget-policy': 'When the Budget Runs Out',
    'ai.usage.quota-management': 'Quota and Budget Console',
    'ai.usage.pressure-visibility': 'Show Usage Pressure Warnings',
    'ai.usage.pressure-sensitivity': 'Pressure Alert Sensitivity',
    'ai.usage.tool-usage-window': 'Tool Stats Window',
    'ai.usage.usage-retention': 'Keep Usage History For',
    'ai.usage.free-models-auto-apply': 'Auto-Add Free Models',
    'ai.usage.pricing-version': 'Price Table Version',
    'ai.usage.ledger-page-size': 'Cost Rows Per Page',
    'ai.usage.provider-health': 'Provider Health',
    'ai.accounts.multi-account-switching': 'Auto-Switch Between Accounts',
    'ai.accounts.default-account': 'Default Account Per Provider',
    'ai.accounts.provider-connections': 'AI Provider Connections',
    'ai.accounts.quota-profile': 'Quota Profile'
  };
  U11.settingsRowLabel = function (id) { return SETTINGS_ROW_LABEL[id] || null; };

  U11.openSettings = function (category, focusSettingId, why, identity) {
    var cat = SETTINGS_CATEGORIES[category] ? category : null;
    var payload = { category: cat, focus_setting_id: focusSettingId || null };
    if (why) payload.reason = why;
    var ident = U11.linkIdentity(identity);
    Object.keys(ident).forEach(function (k) { payload[k] = ident[k]; });
    U11.dispatch('cmd.settings.bloom.open', payload);
    if (!cat) return { ok: false, toast: 'Settings category is unknown — nothing was opened.' };
    return { ok: true, toast: 'Opening Settings · ' + focusSettingId + U11.linkIdentityText(ident) };
  };

  U11.deepLink = function (dest) {
    var d = dest || {};
    var ident = U11.linkIdentity(d);
    if (d.focusSettingId) return U11.openSettings(d.category, d.focusSettingId, d.reason, ident);
    var key = (d.manager ? d.manager : '') + '/' + (d.section ? d.section : '');
    var mapped = LEGACY_DEST_MAP[key];
    if (mapped) return U11.openSettings('ai', mapped, d.reason || d.focus_reason, ident);
    return U11.openSettings(null, null, key, ident);
  };

  window.U11 = U11;
})();
