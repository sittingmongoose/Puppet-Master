/* usage-concepts/_shared/usage-data.js
   The ONE canonical, dense, spec-faithful dataset every usage concept renders.
   Built from Plans/usage-feature.md (UF-002..UF-089), Multi-Account.md, and the
   FinalGUISpec theme contract. It deliberately exercises every value-state and
   "missing-vs-zero" case so the concepts prove the honesty vocabulary.

   Exposes:
     window.USAGE      — the data object
     window.USfmt      — formatters (cost precision, numbers, tokens, pct)
     window.USvs       — value-state vocabulary + tone mapping
*/
(function () {
  'use strict';

  /* ---------- formatters (UF-036 cost precision: <$0.01 -> 6dp, <$1 -> 4dp, else 2dp) ---------- */
  var fmt = {
    cost: function (v) {
      if (v == null) return '\u2014';
      var a = Math.abs(v);
      if (a === 0) return '$0.00';
      if (a < 0.01) return '$' + v.toFixed(6);
      if (a < 1) return '$' + v.toFixed(4);
      return '$' + v.toFixed(2);
    },
    num: function (v) { return v == null ? '\u2014' : Number(v).toLocaleString('en-US'); },
    tok: function (v) {
      if (v == null) return '\u2014';
      if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M';
      if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'k';
      return String(v);
    },
    pct: function (v) { return v == null ? '\u2014' : Math.round(v) + '%'; },
    ago: function (m) { return m == null ? '' : (m < 60 ? m + 'm ago' : Math.round(m / 60) + 'h ago'); }
  };

  /* ---------- value-state vocabulary (UF-074 / UF-087 / UF-088: never render as zero) ---------- */
  var VS = {
    measured:            { label: 'measured',            tone: 'ok' },
    provider_reported:   { label: 'provider-reported',   tone: 'ok' },
    settled:             { label: 'settled',             tone: 'ok' },
    zero:                { label: 'zero',                tone: 'ok' },
    estimated:           { label: 'estimated',           tone: 'warn' },
    pricing_estimated:   { label: 'price-estimated',     tone: 'warn' },
    local_estimated:     { label: 'local-estimated',     tone: 'warn' },
    adjusted:            { label: 'adjusted',            tone: 'info' },
    partial:             { label: 'partial',             tone: 'warn' },
    streaming_partial:   { label: 'streaming',           tone: 'warn' },
    stale:               { label: 'stale',               tone: 'warn' },
    unknown:             { label: 'unknown',             tone: 'mute' },
    unavailable:         { label: 'unavailable',         tone: 'mute' },
    missing:             { label: 'missing',             tone: 'mute' },
    disabled:            { label: 'disabled',            tone: 'mute', dashed: true },
    not_exposed:         { label: 'not exposed',         tone: 'mute', dashed: true },
    unsupported:         { label: 'unsupported',         tone: 'mute', dashed: true },
    hidden_byok:         { label: 'hidden \u00b7 BYOK',  tone: 'purple', dashed: true },
    hidden_subscription: { label: 'hidden \u00b7 plan',  tone: 'purple', dashed: true },
    blocked:             { label: 'blocked',             tone: 'err' },
    failed:              { label: 'failed',              tone: 'err' }
  };
  var CONF = { high: { label: 'high', tone: 'ok' }, medium: { label: 'medium', tone: 'info' }, low: { label: 'low', tone: 'warn' }, unknown: { label: 'unknown', tone: 'mute' } };

  /* ========================================================================
     SEMANTICS LAYER (research: plans-usage-synthesis Q1–Q8, data-rebuild-notes)
     Additive over the render contract above: counting_semantics, source-aware
     used totals, independent windows, per-value provenance, fail-closed run-out,
     and a single cost_microdollars authority. Old field NAMES are preserved;
     canonical names are added alongside (window_kind↔kind, value_state↔vs, …).
     ====================================================================== */
  var ASOF = '2026-07-30T14:42:00Z';

  function num(v) { return v == null ? null : (Number(v) || 0); }

  /* Q1 — counting_semantics per provider style. cache_in_input: whether cache is
     a subset of an INCLUSIVE input total (do NOT add back) or a separate ADDITIVE
     bucket. reasoning_in_output: same for reasoning/thoughts vs output. */
  var SEM = {
    'Claude':               { cache_in_input: 'additive',  reasoning_in_output: 'inclusive', provider_style: 'anthropic' },
    'Claude Code':          { cache_in_input: 'additive',  reasoning_in_output: 'inclusive', provider_style: 'anthropic' },
    'Copilot':              { cache_in_input: 'inclusive', reasoning_in_output: 'inclusive', provider_style: 'openai' },
    'Codex \u00b7 ChatGPT plan': { cache_in_input: 'inclusive', reasoning_in_output: 'inclusive', provider_style: 'openai' },
    'Codex \u00b7 API key':      { cache_in_input: 'inclusive', reasoning_in_output: 'inclusive', provider_style: 'openai' },
    'Cursor':               { cache_in_input: 'inclusive', reasoning_in_output: 'inclusive', provider_style: 'openai' },
    'OpenCode':             { cache_in_input: 'inclusive', reasoning_in_output: 'inclusive', provider_style: 'openai' }, /* AI-SDK v6 normalized inclusive */
    'Gemini Direct':        { cache_in_input: 'additive',  reasoning_in_output: 'inclusive', provider_style: 'gemini' },
    'Antigravity CLI':      { cache_in_input: 'additive',  reasoning_in_output: 'inclusive', provider_style: 'gemini' },
    'Gemini \u00b7 Workspace':   { cache_in_input: 'additive',  reasoning_in_output: 'inclusive', provider_style: 'gemini' }
  };
  function semFor(provider) {
    var p = provider || '';
    if (SEM[p]) return SEM[p];
    if (p.indexOf('Claude Code') === 0) return SEM['Claude Code'];
    if (p.indexOf('Claude') === 0) return SEM['Claude'];
    if (p.indexOf('Codex') === 0) return SEM['Codex \u00b7 ChatGPT plan'];
    if (p.indexOf('Copilot') === 0) return SEM['Copilot'];
    if (p.indexOf('Cursor') === 0) return SEM['Cursor'];
    if (p.toLowerCase().indexOf('opencode') === 0) return SEM['OpenCode'];
    if (p.indexOf('Antigravity') === 0) return SEM['Antigravity CLI'];
    if (p.indexOf('Gemini') === 0) return SEM['Gemini Direct'];
    return { cache_in_input: 'inclusive', reasoning_in_output: 'inclusive', provider_style: 'unknown' };
  }

  /* Q2/Q7 — source-aware used total: never double-count inclusive cache/reasoning. */
  function sourceAwareTotal(rec, cs) {
    var inp = num(rec.input != null ? rec.input : rec.tin);
    var out = num(rec.output != null ? rec.output : rec.tout);
    if (inp == null || out == null) return null;          /* cannot produce -> unknown, never fake */
    var t = inp + out;
    if (cs && cs.cache_in_input === 'additive') t += (num(rec.cacheRead != null ? rec.cacheRead : rec.cr) || 0) + (num(rec.cacheWrite != null ? rec.cacheWrite : rec.cw) || 0);
    if (cs && cs.reasoning_in_output === 'additive') t += (num(rec.reasoning) || 0);
    return t;
  }

  function parseResetH(s) { if (!s || s === 'unknown') return null; var m = String(s).match(/(?:(\d+)d)?\s*(?:(\d+)h)?\s*(?:(\d+)m)?/); var d = parseInt(m && m[1] || 0, 10) || 0; var h = parseInt(m && m[2] || 0, 10) || 0; var mi = parseInt(m && m[3] || 0, 10) || 0; var t = d * 24 + h + mi / 60; return t > 0 ? t : null; }

  /* Q5 — provenance grammar required on EVERY visible value (UF-087 / F3-418). */
  function srcClassFrom(vs) {
    if (vs === 'measured' || vs === 'provider_reported' || vs === 'settled' || vs === 'zero') return 'provider_reported';
    if (vs === 'pricing_estimated') return 'pricing_estimated';
    if (vs === 'estimated' || vs === 'local_estimated' || vs === 'stale') return 'local_estimated';
    return 'unknown';
  }
  function authorityFrom(vs, conf) {
    if (vs === 'measured' || vs === 'provider_reported' || vs === 'settled' || vs === 'zero') return conf === 'high' ? 'authoritative' : 'derived';
    if (vs === 'hidden_byok' || vs === 'hidden_subscription') return 'suppressed';
    if (vs === 'disabled' || vs === 'not_exposed' || vs === 'unsupported') return 'none';
    return 'derived';
  }
  function healthFrom(vs, conf) {
    if (vs === 'unknown' || vs === 'disabled' || vs === 'not_exposed' || vs === 'unsupported' || vs === 'unavailable' || vs === 'missing' || vs === 'hidden_byok' || vs === 'hidden_subscription' || vs === 'failed' || vs === 'blocked') return 'unavailable';
    if (vs === 'estimated' || vs === 'local_estimated' || vs === 'pricing_estimated' || vs === 'stale' || vs === 'partial' || vs === 'streaming_partial' || vs === 'adjusted' || conf === 'low') return 'degraded';
    return 'healthy';
  }
  function settlementFrom(vs) {
    if (vs === 'settled') return 'settled';
    if (vs === 'streaming_partial' || vs === 'partial') return 'streaming_partial';
    if (vs === 'adjusted') return 'adjusted';
    if (vs === 'failed') return 'failed';
    if (vs === 'measured' || vs === 'provider_reported' || vs === 'zero') return 'observed';
    return 'unknown';
  }
  function attachProv(o, vs, conf, opts) {
    opts = opts || {};
    o.value_state = vs;
    o.source_class = opts.source_class || srcClassFrom(vs);
    o.source_confidence = conf || 'unknown';
    o.source_authority = opts.source_authority || authorityFrom(vs, conf);
    o.settlement_status = opts.settlement_status || settlementFrom(vs);
    o.projection_freshness = opts.projection_freshness || (vs === 'stale' ? 'stale' : 'current');
    o.projection_health = opts.projection_health || healthFrom(vs, conf);
    o.observed_at = opts.observed_at || ASOF;
    return o;
  }

  /* Q4 (P1) — fail-closed run-out. A clearly-labeled DERIVED projection (no canonical
     formula exists). Unknown reset / zero burn / insufficient samples / stale =>
     unknown, never a fabricated countdown. fixed_reset/billing_cycle compare burn to
     the reset boundary; rolling compares to the sliding lookback. */
  function deriveRunOut(w) {
    var MIN_SAMPLES = 7;
    w.runOutH = null;
    w.runOutState = 'unknown';
    w.runOutConf = 'unknown';
    w.runOutBasis = 'derived projection over the window model + burn; no canonical formula (Plans gap U1 / proposal P1)';
    w.runOutLabel = null;
    w.runOutReason = null;
    if (w.used == null) { w.runOutReason = 'no authoritative counter'; return; }
    if (w.used === 0) { w.runOutLabel = 'no burn observed'; w.runOutReason = 'zero burn'; return; }
    var resetH = parseResetH(w.reset);
    if (w.reset == null || w.reset === 'unknown' || resetH == null) { w.runOutLabel = 'unknown reset \u2014 no countdown'; w.runOutReason = 'unknown reset'; return; }
    if (w.samples == null || w.samples < MIN_SAMPLES) { w.runOutLabel = 'insufficient history'; w.runOutReason = 'insufficient samples (' + (w.samples || 0) + '/7)'; return; }
    if (!w.burnPerH || w.burnPerH <= 0) { w.runOutLabel = 'no burn observed'; w.runOutReason = 'zero burn'; return; }
    if (w.projection_freshness === 'stale') { w.runOutLabel = 'stale observation \u2014 refresh'; w.runOutReason = 'stale'; return; }
    var hoursToExhaust = (100 - w.used) / w.burnPerH;
    w.runOutState = 'estimated';
    w.runOutConf = w.source_confidence === 'high' ? 'high' : 'medium';
    if (w.window_kind === 'fixed_reset' || w.window_kind === 'billing_cycle') {
      if (hoursToExhaust >= resetH) { w.runOutH = null; w.runOutLabel = 'resets before exhaustion (' + w.reset + ')'; w.runOutReason = 'reset-first'; }
      else { w.runOutH = hoursToExhaust; w.runOutLabel = 'est. exhausted in ~' + hoursToExhaust.toFixed(1) + 'h (before reset ' + w.reset + ')'; }
    } else if (w.window_kind === 'rolling') {
      if (hoursToExhaust >= resetH) { w.runOutH = null; w.runOutLabel = 'window slides before exhaustion'; w.runOutReason = 'rolling-slide-first'; }
      else { w.runOutH = hoursToExhaust; w.runOutLabel = 'est. exhausted in ~' + hoursToExhaust.toFixed(1) + 'h (rolling)'; }
    } else {
      w.runOutH = null; w.runOutLabel = 'unknown window kind \u2014 no countdown'; w.runOutReason = 'unknown window_kind';
    }
  }

  /* Q3 (P2/P8) — each window is its OWN record with its OWN reset evidence. A 7d/weekly
     reset is NEVER synthesized from a 5h reset; providers with no authoritative counter
     get unknown. usedTokens is left null (no per-window token counter exposed) rather
     than fabricated via a per-token multiplier. */
  var WIN_SPEC = {
    'claude': [
      { id: '5h', label: 'Claude 5h', window_kind: 'rolling', used: 78, reset: '2h 14m', resetAt: '16:56', source_class: 'provider_reported', source_confidence: 'high', source_authority: 'authoritative', value_state: 'measured', burnPerH: 18, samples: 9 },
      { id: '7d', label: 'Claude weekly', window_kind: 'fixed_reset', used: 61, reset: '2d 9h', resetAt: 'Fri 00:00 UTC', source_class: 'provider_reported', source_confidence: 'medium', source_authority: 'authoritative', value_state: 'measured', samples: 4 }
    ],
    'claude-code': [
      { id: '5h', label: 'Claude Code 5h', window_kind: 'rolling', used: 64, reset: '2h 14m', resetAt: '16:56', source_class: 'provider_reported', source_confidence: 'high', source_authority: 'authoritative', value_state: 'measured', burnPerH: 12, samples: 8 },
      { id: '7d', label: 'Claude Code weekly', window_kind: 'fixed_reset', used: 52, reset: '2d 9h', resetAt: 'Fri 00:00 UTC', source_class: 'provider_reported', source_confidence: 'medium', source_authority: 'authoritative', value_state: 'measured', samples: 5 }
    ],
    'codex-plan': [
      { id: '5h', label: 'Codex plan 5h', window_kind: 'rolling', used: 34, reset: '3h 05m', resetAt: '17:47', source_class: 'provider_reported', source_confidence: 'medium', source_authority: 'derived', value_state: 'measured', burnPerH: 9, samples: 6 },
      { id: '7d', label: 'Codex plan 7d', window_kind: 'unknown', used: 33, reset: 'unknown', resetAt: null, source_class: 'local_estimated', source_confidence: 'unknown', source_authority: 'none', value_state: 'estimated' }
    ],
    'codex-api': [
      { id: 'month', label: 'Codex API month', window_kind: 'billing_cycle', used: null, reset: null, resetAt: null, source_class: 'unknown', source_confidence: 'unknown', source_authority: 'suppressed', value_state: 'hidden_byok' }
    ],
    'copilot': [
      { id: 'month', label: 'Copilot monthly cycle', window_kind: 'billing_cycle', used: 91, reset: '5d 9h', resetAt: 'Aug 01 00:00 UTC', source_class: 'provider_reported', source_confidence: 'high', source_authority: 'authoritative', value_state: 'measured', burnPerH: 0.4, samples: 10 },
      { id: '7d', label: 'Copilot 7d view', window_kind: 'billing_cycle', used: 66, reset: '5d 9h', resetAt: 'Aug 01 00:00 UTC', source_class: 'provider_reported', source_confidence: 'high', source_authority: 'authoritative', value_state: 'measured' }
    ],
    'gemini': [
      { id: '5h', label: 'Gemini quota window', window_kind: 'fixed_reset', used: 41, reset: '8h 44m', resetAt: '23:26', source_class: 'local_estimated', source_confidence: 'low', source_authority: 'derived', value_state: 'estimated', burnPerH: 6, samples: 3 },
      { id: '7d', label: 'Gemini 7d', window_kind: 'unknown', used: 30, reset: 'unknown', resetAt: null, source_class: 'local_estimated', source_confidence: 'low', source_authority: 'derived', value_state: 'estimated' }
    ],
    'antigravity': [
      { id: '5h', label: 'Antigravity 5h', window_kind: 'rolling', used: 28, reset: 'unknown', resetAt: null, source_class: 'local_estimated', source_confidence: 'low', source_authority: 'derived', value_state: 'stale', projection_freshness: 'stale', projection_health: 'degraded', observed_at: '2026-07-30T14:32:00Z' },
      { id: '7d', label: 'Antigravity 7d', window_kind: 'unknown', used: 21, reset: 'unknown', resetAt: null, source_class: 'local_estimated', source_confidence: 'low', source_authority: 'derived', value_state: 'stale', projection_freshness: 'stale', projection_health: 'degraded', observed_at: '2026-07-30T14:32:00Z' }
    ],
    'cursor': [
      { id: 'month', label: 'Cursor plan cycle', window_kind: 'billing_cycle', used: 56, reset: 'unknown', resetAt: null, source_class: 'local_estimated', source_confidence: 'low', source_authority: 'derived', value_state: 'estimated' },
      { id: '7d', label: 'Cursor 7d', window_kind: 'unknown', used: 44, reset: 'unknown', resetAt: null, source_class: 'local_estimated', source_confidence: 'low', source_authority: 'derived', value_state: 'estimated' }
    ],
    'opencode': [
      { id: '5h', label: 'OpenCode passthrough', window_kind: 'unknown', used: null, reset: 'unknown', resetAt: null, source_class: 'unknown', source_confidence: 'unknown', source_authority: 'none', value_state: 'unknown' }
    ],
    'gemini-ws': [
      { id: 'month', label: 'Gemini Workspace cycle', window_kind: 'billing_cycle', used: null, reset: null, resetAt: null, source_class: 'unknown', source_confidence: 'unknown', source_authority: 'suppressed', value_state: 'hidden_subscription' }
    ],
    'windsurf': [
      { id: '5h', label: 'Windsurf', window_kind: 'unknown', used: null, reset: null, resetAt: null, source_class: 'unknown', source_confidence: 'unknown', source_authority: 'none', value_state: 'disabled' }
    ],
    'ollama': [
      { id: 'session', label: 'Ollama local session', window_kind: 'session_only', used: null, reset: null, resetAt: null, source_class: 'unknown', source_confidence: 'unknown', source_authority: 'none', value_state: 'not_exposed' }
    ]
  };
  function buildWindows(q) {
    var specs = WIN_SPEC[q.id] || [];
    var acc = null;
    for (var i = 0; i < D.accounts.length; i++) { if (D.accounts[i].prov.indexOf(q.name.split(' ')[0]) === 0) { acc = D.accounts[i]; break; } }
    return specs.map(function (sp) {
      var w = {
        id: sp.id,
        label: sp.label || (q.name.split(' ')[0] + ' ' + sp.id),
        window_kind: sp.window_kind,
        kind: sp.window_kind,                                  /* alias kept */
        scope: sp.scope || q.scope,
        used: sp.used,
        remaining: sp.used == null ? null : Math.max(0, 100 - sp.used),
        reset: sp.reset === undefined ? 'unknown' : sp.reset,
        resetsAt: sp.resetAt != null ? sp.resetAt : null,      /* own reset evidence */
        resetAt: sp.resetAt != null ? sp.resetAt : null,       /* alias kept */
        cooldown: (sp.id === '5h' && acc && acc.pressure === 'cooldown') ? { active: true, until: acc.resetAt, reason: acc.reason || 'cooldown_active' } : null,
        usedTokens: null,                                      /* no fabricated per-token multiplier */
        usedTokensState: 'unknown',
        usedTokensBasis: 'no authoritative per-window token counter exposed; not synthesized from another window',
        burnPerH: sp.burnPerH || null,
        samples: sp.samples != null ? sp.samples : null
      };
      attachProv(w, sp.value_state || q.vs, sp.source_confidence || q.conf, {
        source_class: sp.source_class, source_authority: sp.source_authority, settlement_status: sp.settlement_status,
        projection_freshness: sp.projection_freshness, projection_health: sp.projection_health, observed_at: sp.observed_at
      });
      w.vs = w.value_state;                                    /* alias kept */
      w.conf = w.source_confidence;                            /* alias kept */
      deriveRunOut(w);
      return w;
    });
  }

  var D = {
    /* ----- page head (UF-089) ----- */
    project: 'Tastebook',
    refreshMin: 5,            /* mirrors usage.refresh_interval_seconds default 300 */
    retentionDays: 90,        /* mirrors usage.retention_days default 90 */
    asOf: '14:42',            /* last projection update (freshness cue, UF-006/043) */
    asOfMin: 2,               /* minutes since last update */
    projectionHealth: 'current', /* current | refreshing | stale | degraded | unavailable */
    nextAutoRefresh: '14:47',

    /* ----- budgets (UF-077: presets exactly 50/80/90/95/100) ----- */
    budget: {
      monthlyLimit: 300, currency: 'USD',
      presets: [50, 80, 90, 95, 100],
      warningThreshold: 80,   /* ai.usage.budget-warning-threshold default 80 */
      policy: 'block_at_limit', /* block_at_limit | warn_only | allow_overage */
      spentMTD: 187.42,
      projectedMTD: 224.10,   /* Lago-style projection for the open period */
      tokenBudget: 0          /* 0 = unlimited */
    },

    spend: { '5h': 14.27, '24h': 28.41, '7d': 142.83 },
    spendBasis: 'pricing_estimated',  /* list-rate estimate; may differ from actual bill (Claude Code honesty) */
    burn: { perHour: 2.85, perDay: 20.3 },
    forecast: {
      monthPace: 224.10,      /* "on pace for $X this month" (codeburn) */
      monthPaceDelta: +12,    /* +12% vs last month */
      blockProjection: 19.4   /* projected spend at end of current 5h block at current burn (ccusage) */
    },

    /* ----- quotas per provider (UF-041 window model; UF-074 missing-vs-zero) -----
       window_kind: rolling | fixed_reset | billing_cycle | session_only | unknown */
    quotas: [
      { id: 'claude', name: 'Claude', plan: 'Pro', kind: 'rolling', win: '5h', scope: 'account',
        vs: 'measured', conf: 'high', used: 78, sevenUsed: 61, reset: '2h 14m', resetAt: '16:56',
        note: 'rolling 5-hour window shared with claude.ai' },
      { id: 'claude-code', name: 'Claude Code', plan: 'Max', kind: 'rolling', win: '5h', scope: 'account',
        vs: 'measured', conf: 'high', used: 64, sevenUsed: 52, reset: '2h 14m', resetAt: '16:56',
        note: 'weekly limit resets Fri 00:00 UTC' },
      { id: 'codex-plan', name: 'Codex \u00b7 ChatGPT plan', plan: 'Plus', kind: 'rolling', win: '5h', scope: 'account+model',
        vs: 'measured', conf: 'medium', used: 34, sevenUsed: 33, reset: '3h 05m', resetAt: '17:47',
        note: 'plan-backed bucket \u2014 kept separate from API-billed usage' },
      { id: 'codex-api', name: 'Codex \u00b7 API key', plan: 'API-billed', kind: 'billing_cycle', win: 'month', scope: 'account',
        vs: 'hidden_byok', conf: 'unknown', used: null, sevenUsed: null, reset: null,
        note: 'billed to your own key \u2014 spend shown only in the provider console. Hidden, not zero.' },
      { id: 'copilot', name: 'GitHub Copilot', plan: 'Business', kind: 'billing_cycle', win: 'month', scope: 'account',
        vs: 'measured', conf: 'high', used: 91, sevenUsed: 66, reset: '5d 9h', resetAt: 'Aug 01 00:00 UTC',
        premiumLeft: 9, premiumTotal: 100,
        note: 'premium requests left this month; included models remain available after exhaustion' },
      { id: 'gemini', name: 'Gemini Direct', plan: 'AI Studio', kind: 'fixed_reset', win: 'quota window', scope: 'account',
        vs: 'estimated', conf: 'low', used: 41, sevenUsed: 30, reset: '8h 44m', resetAt: '23:26',
        note: 'pay-as-you-go rate limits; quota window inferred, not provider-reported' },
      { id: 'antigravity', name: 'Antigravity CLI', plan: 'agy route', kind: 'rolling', win: '5h', scope: 'account',
        vs: 'stale', conf: 'low', used: 28, sevenUsed: 21, reset: 'unknown', resetAt: null,
        note: 'agy did not answer /stats this cycle \u2014 showing last good sample (14:32), never zero' },
      { id: 'cursor', name: 'Cursor', plan: 'Business', kind: 'billing_cycle', win: 'month', scope: 'account',
        vs: 'estimated', conf: 'low', used: 56, sevenUsed: 44, reset: 'unknown', resetAt: null,
        note: 'inferred locally \u2014 Cursor does not report usage; not a remaining-request counter' },
      { id: 'opencode', name: 'OpenCode', plan: 'Passthrough', kind: 'unknown', win: '\u2014', scope: 'server_profile',
        vs: 'unknown', conf: 'unknown', used: null, sevenUsed: null, reset: 'unknown', resetAt: null,
        note: 'passthrough server has not reported this window \u2014 unknown is never assumed to be zero' },
      { id: 'gemini-ws', name: 'Gemini \u00b7 Workspace', plan: 'Seat', kind: 'billing_cycle', win: 'month', scope: 'org',
        vs: 'hidden_subscription', conf: 'unknown', used: null, sevenUsed: null, reset: null,
        note: 'usage pooled into the Workspace subscription \u2014 per-user totals hidden by the plan' },
      { id: 'windsurf', name: 'Windsurf', plan: '\u2014', kind: 'unknown', win: '\u2014', scope: 'account',
        vs: 'disabled', conf: 'unknown', used: null, sevenUsed: null, reset: null,
        note: 'turned off in Settings \u2014 no usage collected while disabled' },
      { id: 'ollama', name: 'Ollama \u00b7 local', plan: 'Local', kind: 'session_only', win: 'session', scope: 'account',
        vs: 'not_exposed', conf: 'unknown', used: null, sevenUsed: null, reset: null,
        note: 'local models expose no usage API \u2014 nothing to read, different from reading zero' }
    ],

    /* ----- analytics over time (stacked: input/output/reasoning/cache) ----- */
    chart: {
      '5h':  { note: 'last 5h', cols: [['10a',34,22,8,12],['11a',45,30,10,16],['12p',52,36,12,18],['1p',49,33,11,17],['2p',60,40,14,22]] },
      '24h': { note: 'last 24h', cols: [['6a',18,12,5,8],['8a',54,38,12,18],['9a',81,52,15,22],['10a',100,68,20,28],['12p',90,63,18,25],['2p',100,68,22,30],['3p',88,60,19,26],['4p',55,35,10,14],['6p',36,23,8,11],['8p',19,12,5,7],['10p',17,10,4,6],['11p',8,5,2,4]] },
      '7d':  { note: 'last 7d', cols: [['Tue',62,41,14,20],['Wed',74,50,17,24],['Thu',58,38,12,19],['Fri',91,60,20,30],['Sat',22,14,6,9],['Sun',18,11,4,7],['Mon',86,57,18,27]] }
    },
    chartBudgetLine: 62, /* budget threshold drawn across the chart (GCP pattern), as % of typical peak */

    /* ----- prompt-cache savings (UF-080/081: zero vs unsupported) ----- */
    cache: [
      { name: 'Claude', state: 'measured', hit: 72, cin: 412800, cw: 38200, cr: 371400, save: 3.84 },
      { name: 'Codex (Plus)', state: 'measured', hit: 0, cin: 0, cw: 0, cr: 0, save: 0,
        zeroNote: 'measured zero \u2014 caching idle right now, not missing' },
      { name: 'Copilot', state: 'estimated', hit: 38, cin: 96400, cw: 12100, cr: 84200, save: 0.61 },
      { name: 'Gemini Direct', state: 'estimated', hit: 45, cin: 71300, cw: 9800, cr: 61500, save: 0.48,
        missReason: 'prefix churn \u2014 system prompt re-ordered between calls' },
      { name: 'Antigravity CLI', state: 'measured', hit: 51, cin: 44100, cw: 6200, cr: 37900, save: 0.42 },
      { name: 'Cursor', state: 'unsupported', hit: null, cin: null, cw: null, cr: null, save: null,
        note: 'provider does not expose cache fields \u2014 not reported, never zero' }
    ],
    cacheTotalSaved: 5.35,

    /* ----- tool usage (UF-057 index_used signal) ----- */
    tools: [
      { tool: 'search', calls: 458, p50: 45, p95: 210, err: 0.2, idx: 92 },
      { tool: 'file_edit', calls: 842, p50: 12, p95: 34, err: 0.4, idx: null },
      { tool: 'terminal_run', calls: 607, p50: 340, p95: 2180, err: 3.6, idx: null },
      { tool: 'web_fetch', calls: 263, p50: 820, p95: 4500, err: 6.8, idx: null },
      { tool: 'lsp_rename', calls: 124, p50: 28, p95: 95, err: 0, idx: 88 },
      { tool: 'git_commit', calls: 62, p50: 180, p95: 450, err: 1.6, idx: null }
    ],

    /* ----- accounts (canonical pressure states from Multi-Account.md) -----
       requested vs effective; health/cooldown/pressure are SEPARATE dimensions */
    accounts: [
      { prov: 'Claude', name: 'Account 1', mail: 'dev@tastebook.app', requested: true, effective: true,
        health: 'ready', pressure: 'ok', status: 'Working \u2014 building the image-processing package (n-13, lane-b-api)',
        lastValidated: '2m', note: 'Took over from Account 2 at 14:07 \u2014 reason: rate_limit_pressure' },
      { prov: 'Claude', name: 'Account 2', mail: 'builds@tastebook.app', requested: false, effective: false,
        health: 'ready', pressure: 'cooldown', status: 'Cooling down \u2014 hit the 5h limit; back at 15:12',
        cooldownSec: 2472, resetAt: '15:12', reason: 'cooldown_active',
        note: 'authoritative provider cooldown \u2014 hard_block until revalidated after expiry' },
      { prov: 'Codex', name: 'Plus plan', mail: 'dev@tastebook.app', requested: false, effective: false,
        health: 'ready', pressure: 'ok', status: 'Standing by \u2014 picks up work if Claude accounts are busy',
        lastValidated: '6m' },
      { prov: 'Copilot', name: 'CI account', mail: 'ci@tastebook.app', requested: false, effective: false,
        health: 'ready', pressure: 'approaching_threshold', status: 'Under pressure \u2014 9 premium requests left before the monthly cap',
        lastValidated: '11m', note: 'premium-request exhaustion is distinct from a generic cooldown' }
    ],
    /* account_pressure_episode + account_switch_event history (append-only records) */
    pressureHistory: [
      { t: '14:07', kind: 'switch', text: 'builds@tastebook.app \u2192 dev@tastebook.app', reason: 'rate_limit_pressure', lane: 'lane-b-api' },
      { t: '13:58', kind: 'episode', text: 'Claude \u00b7 Account 2 crossed switch threshold (10% remaining)', reason: 'threshold_preemptive_switch', state: 'exhausted' },
      { t: '13:31', kind: 'episode', text: 'Copilot \u00b7 CI account approaching_threshold (premium requests)', reason: 'soft_threshold', state: 'approaching' },
      { t: '11:02', kind: 'switch', text: 'dev@tastebook.app \u2192 builds@tastebook.app', reason: 'cooldown_preemptive_switch', lane: 'plan' },
      { t: '09:44', kind: 'episode', text: 'Gemini Direct quota window reset \u2192 validating', reason: 'reset_recovery', state: 'validating' }
    ],

    /* ----- anomaly / quota guard (UF-083: 8 guard types; 1h window, 3.0x spike) ----- */
    guardConfig: { windowMin: 60, spikeRatio: 3.0, confidence: 'min(1.0, samples/7)' },
    guards: [
      { kind: 'token_spike', state: 'blocked', severity: 'high', t: '13:58',
        title: 'token_spike \u2014 spending paused', where: 'run pcr-47 \u00b7 lane-b-api \u00b7 node n-19',
        body: 'Node n-19 retried in a tight loop and token spend jumped 4.6\u00d7 in 12 minutes. The guard paused paid calls on that node; the run continued from its safe point.',
        why: [['Rule', 'block above 3.0\u00d7 the 1h baseline'], ['Observed', '4.6\u00d7 baseline (13:58\u201314:10)'],
              ['Cost avoided', '\u2248 $1.84 (estimated)'], ['Charged to', 'dev@tastebook.app (effective)']] },
      { kind: 'output_spike', state: 'allowed', severity: 'low', t: '13:41',
        title: 'output_spike \u2014 allowed', where: 'run pcr-47 \u00b7 plan compile',
        body: 'The compile step streamed a large seam graph (2.4\u00d7 normal output). Under the 3.0\u00d7 limit, so nothing blocked \u2014 shown so you can see how the guard decides.',
        why: [['Rule', 'block above 3.0\u00d7 the 1h baseline'], ['Observed', '2.4\u00d7 baseline (13:41\u201313:44)'], ['Decision', 'allowed \u2014 below limit']] },
      { kind: 'cache_miss_churn', state: 'warn', severity: 'medium', t: '12:20',
        title: 'cache_miss_churn \u2014 optimization warning', where: 'run pcr-47 \u00b7 lane-c-frontend',
        body: 'A stable task is re-sending a reordered system prompt, churning the prompt cache. Fixing the prefix order would raise the hit rate.',
        why: [['Rule', 'report when cache misses churn on a stable task'], ['Hit rate', '38% (expected \u2265 60%)'], ['Suggestion', 'stabilize system-prompt prefix order']] },
      { kind: 'provider_usage_null', state: 'watch', severity: 'low', t: '14:32',
        title: 'provider_usage_null \u2014 estimator active', where: 'Antigravity CLI \u00b7 agy route',
        body: 'agy returned no usage block; the estimator marked the sample with low confidence instead of treating it as zero.',
        why: [['Rule', 'use estimator + mark confidence when provider usage is null'], ['Confidence', 'low (samples 3/7)']] }
    ],
    guardTypes: ['provider_usage_null','cached_tokens_unknown','token_spike','output_spike','tool_result_spike','cache_miss_churn','spend_rate_exceeded','repeated_no_progress_cost'],

    /* ----- context budget by source family (UF-079) ----- */
    contextBudget: {
      totalTokens: 182000, limit: 200000,
      families: [
        { name: 'Tool descriptions', tokens: 41200, share: 23, note: '14 tools registered' },
        { name: 'MCP schemas', tokens: 28700, share: 16, note: '3 servers \u00b7 progressive disclosure available' },
        { name: 'Skill summaries & bodies', tokens: 22400, share: 12, note: 'Codex skills use progressive disclosure' },
        { name: 'Retrieved docs', tokens: 33100, share: 18, note: 'tantivy hits injected' },
        { name: 'Terminal / tool output', tokens: 38900, share: 21, note: 'largest tax source this session' },
        { name: 'Provider replay metadata', tokens: 17700, share: 10, note: 'native replay headers' }
      ],
      omitted: [ { name: 'Full git history', reason: 'deferred \u2014 exceeds per-family budget' },
                 { name: 'Raw web page bodies', reason: 'omitted \u2014 summaries injected instead' } ]
    },

    /* ----- plan gating states (UF-075) ----- */
    planGating: [
      { prov: 'GitHub Copilot', state: 'included_premium_approaching', status: '9 of 100 premium requests left',
        sub: 'Approaching the monthly cap \u2014 premium-request-backed features remain available until the allotment is exhausted', extra: 'Included models remain available after exhaustion' },
      { prov: 'Codex \u00b7 ChatGPT plan', state: 'ok', status: 'Included usage active', sub: '5h window 34% used' },
      { prov: 'Gemini Direct', state: 'rate_limited', status: 'Pay-as-you-go rate limit', sub: 'tier-based RPM/TPM, not a fixed counter' },
      { prov: 'Kimi For Coding', state: 'unverified', status: 'Capability-gated', sub: 'not directly proven \u2014 shown as unverified, not a purchase blocker' },
      { prov: 'Z.AI Coding Plan', state: 'plan_not_included', status: 'glm-5v-turbo not in plan', sub: 'plan-dependent quota/reset' }
    ],

    /* ----- event ledger (normalized UsageRecords; usage_event_ref per row) ----- */
    ledger: [
      { t: '14:42', ev: 'completion', run: 'pcr-47', lane: 'lane-b-api', prov: 'Claude', model: 'claude-sonnet-4', acct: 'dev@tastebook.app', tin: 3240, tout: 1890, cin: 2210, cw: 0, cr: 820, rep: 'measured', cost: 0.08, lat: '2.4s', ref: 'ue-47-1342', detail: { Node: 'n-21 \u00b7 recipe import parser', Persona: 'engineer', Effort: 'standard' } },
      { t: '14:41', ev: 'tool', run: 'pcr-47', lane: 'lane-b-api', prov: 'Claude', model: 'claude-sonnet-4', acct: 'dev@tastebook.app', tin: 0, tout: 0, cin: 0, cw: 0, cr: 0, rep: 'measured', cost: 0, lat: '0.3s', ref: 'ue-47-1341', detail: { Tool: 'file_edit', Target: 'src/routes/recipes.rs:142', Result: 'success' } },
      { t: '14:39', ev: 'completion', run: 'pcr-47', lane: 'lane-c-frontend', prov: 'Copilot', model: 'gpt-4.1', acct: 'ci@tastebook.app', tin: 4810, tout: 2340, cin: 1200, cw: 340, cr: 860, rep: 'measured', cost: 0.14, lat: '3.8s', ref: 'ue-47-1339', detail: { Node: 'n-27 \u00b7 recipe card component', 'Request class': 'Premium (#96 of 100)' } },
      { t: '14:37', ev: 'completion', run: 'pcr-47', lane: 'lane-a-data-model', prov: 'Codex (Plus)', model: 'o4-mini', acct: 'dev@tastebook.app', tin: 2180, tout: 1420, cin: 0, cw: 0, cr: 0, rep: 'measured', cost: 0.05, lat: '1.9s', ref: 'ue-47-1337', detail: { Node: 'n-08 \u00b7 ratings migration', Billing: 'Plan-backed (Plus)' } },
      { t: '14:35', ev: 'guard', run: 'pcr-47', lane: 'lane-b-api', prov: 'Claude', model: 'claude-sonnet-4', acct: 'dev@tastebook.app', tin: 0, tout: 0, cin: 0, cw: 0, cr: 0, rep: 'measured', cost: 0, lat: '\u2014', ref: 'ue-47-1335', detail: { Guard: 'token_spike blocked node n-19', 'Cost avoided': '\u2248 $1.84', Next: 'safe-point retry' } },
      { t: '14:33', ev: 'completion', run: 'pcr-47', lane: 'lane-d-infra', prov: 'Gemini Direct', model: 'gemini-2.5-pro', acct: 'dev@tastebook.app', tin: 5620, tout: 3180, cin: 2100, cw: 580, cr: 1420, rep: 'estimated', cost: 0.11, lat: '2.1s', ref: 'ue-47-1333', detail: { Node: 'n-33 \u00b7 backup cron template', Confidence: 'estimated locally' } },
      { t: '14:31', ev: 'tool', run: 'pcr-47', lane: 'lane-b-api', prov: 'Claude', model: 'claude-sonnet-4', acct: 'dev@tastebook.app', tin: 0, tout: 0, cin: 0, cw: 0, cr: 0, rep: 'measured', cost: 0, lat: '0.2s', ref: 'ue-47-1331', detail: { Event: 'HITL gate reached \u2014 publish package (n-13)', Waited: 'approved from Dashboard' } },
      { t: '14:29', ev: 'completion', run: 'pcr-47', lane: 'plan', prov: 'Claude', model: 'claude-opus-4', acct: 'dev@tastebook.app', tin: 8420, tout: 4210, cin: 3200, cw: 1100, cr: 2400, rep: 'measured', cost: 0.38, lat: '6.2s', ref: 'ue-47-1329', detail: { Step: 'Auditor review loop \u2014 findings repair', Effort: 'high' } },
      { t: '14:27', ev: 'completion', run: 'pcr-47', lane: 'lane-c-frontend', prov: 'Cursor', model: 'cursor-small', acct: 'team@tastebook.app', tin: 1920, tout: 980, cin: null, cw: null, cr: null, rep: 'unsupported', cost: 0.02, lat: '0.9s', ref: 'ue-47-1327', detail: { Note: 'Cursor does not report cache fields \u2014 shown as not reported, never zero' } },
      { t: '14:25', ev: 'completion', run: 'pcr-47', lane: 'lane-d-infra', prov: 'OpenCode', model: 'deepseek-v3', acct: 'dev@tastebook.app', tin: 3100, tout: 1840, cin: 0, cw: 0, cr: 0, rep: 'estimated', cost: 0.02, lat: '1.4s', ref: 'ue-47-1325', detail: { Server: 'opencode.local:8080', Upstream: 'DeepSeek V3 passthrough' } },
      { t: '14:23', ev: 'error', run: 'pcr-47', lane: 'lane-b-api', prov: 'Claude Code', model: 'claude-sonnet-4', acct: 'builds@tastebook.app', tin: 1840, tout: 0, cin: 0, cw: 0, cr: 0, rep: 'measured', cost: 0.01, lat: '0.8s', ref: 'ue-47-1323', detail: { Error: '429 rate limit', Action: 'rotated to Claude \u00b7 Account 1' } },
      { t: '14:21', ev: 'completion', run: 'pcr-47', lane: 'lane-a-data-model', prov: 'Antigravity CLI', model: 'gemini-2.5-pro', acct: 'dev@tastebook.app', tin: 2760, tout: 1310, cin: 900, cw: 210, cr: 640, rep: 'measured', cost: 0.04, lat: '1.6s', ref: 'ue-47-1321', detail: { Node: 'n-05 \u00b7 seed data generator' } },
      { t: '14:19', ev: 'tool', run: 'pcr-47', lane: 'lane-b-api', prov: 'Claude', model: 'claude-sonnet-4', acct: 'dev@tastebook.app', tin: 0, tout: 0, cin: 0, cw: 0, cr: 0, rep: 'measured', cost: 0, lat: '41s', ref: 'ue-47-1319', detail: { Tool: 'terminal_run', Command: 'cargo test -p tastebook-api', Result: '1 failure \u2192 retried' } },
      { t: '14:17', ev: 'completion', run: 'pcr-47', lane: 'lane-c-frontend', prov: 'Copilot', model: 'claude-haiku-3.5', acct: 'ci@tastebook.app', tin: 2010, tout: 1180, cin: 640, cw: 0, cr: 480, rep: 'measured', cost: 0.02, lat: '1.1s', ref: 'ue-47-1317', detail: { Node: 'n-24 \u00b7 search box styles' } },
      { t: '14:15', ev: 'switch', run: 'pcr-47', lane: '\u2014', prov: 'Claude', model: '\u2014', acct: 'dev@tastebook.app', tin: 0, tout: 0, cin: 0, cw: 0, cr: 0, rep: 'measured', cost: 0, lat: '\u2014', ref: 'ue-47-1315', detail: { Event: 'account switch \u2014 builds@ \u2192 dev@tastebook.app', Reason: 'rate_limit_pressure' } }
    ],

    /* ----- efficiency + coaching (codeburn-style; pure logic, native-friendly) ----- */
    efficiency: {
      grade: 'C+', score: 79, partial: false,
      components: [ { k: 'One-shot rate', v: 78, w: 0.45 }, { k: 'Cache hit', v: 72, w: 0.30 }, { k: 'Retry tax', v: 9, w: 0.25, adverse: true } ],
      scoreBasis: 'weighted mean of components with adverse inverted: 78\u00b70.45 + 72\u00b70.30 + (100\u22129)\u00b70.25 = 79.45 \u2192 79; grade bands A\u226590 / B\u226580 / C\u226570 / D\u226560 (\u00b1 within a band)',
      retryTaxPct: 9, retryTaxUsd: 1.84
    },
    signals: {
      wins: [
        { text: 'Cache hit rate 72% this session \u2014 above your 60% norm', tag: 'cache' },
        { text: 'One-shot success on 78% of file edits', tag: 'one-shot' },
        { text: 'Spend is down 8% vs your typical Friday', tag: 'trend' }
      ],
      improvements: [
        { text: 'Reordered system prompt is churning the cache on lane-c \u2014 fixing the prefix order saves \u2248 $0.40/session', tag: 'cache', save: 0.40 },
        { text: 'Terminal run p95 is 2.2s with a 3.6% error rate \u2014 retries add tax', tag: 'tools' },
        { text: 'Web fetch errors at 6.8% \u2014 most failures are timeouts you can budget for', tag: 'tools' }
      ],
      risks: [
        { text: 'On pace for $224 this month \u2014 +12% vs last month', tag: 'pace' },
        { text: 'Copilot at 91% of its monthly cycle \u2014 route new frontend work to Codex', tag: 'quota' },
        { text: 'Node n-19 retry loop triggered the token-spike guard (4.6\u00d7)', tag: 'guard' }
      ]
    },

    /* ----- "what counts" matrix (Sentry quick-guide pattern) ----- */
    whatCounts: [
      { q: 'Completed completion', counts: true },
      { q: 'Rate-limited request (429)', counts: false, note: 'no tokens delivered' },
      { q: 'Failed / aborted stream', counts: 'partial', note: 'accepted partial counted once' },
      { q: 'Cache-read tokens', counts: true, note: 'at the discounted cache rate' },
      { q: 'Spike-protected (guard blocked)', counts: false, note: 'guard prevented the spend' },
      { q: 'Background refresh / poll', counts: true, note: 'tagged automatic, not user intent' },
      { q: 'Retried after error', counts: true, note: 'each attempt is its own record' },
      { q: 'Retired / deferred work', counts: 'partial', note: 'counted when it eventually runs, not when deferred' }
    ],

    /* ----- attribution by orchestrator entity (Claude Code /usage pattern) ----- */
    attribution: [
      { name: 'Subagents', pct: 34 }, { name: 'Skills', pct: 22 }, { name: 'MCP servers', pct: 18 },
      { name: 'Plugins', pct: 14 }, { name: 'Core conversation', pct: 12 }
    ],

    livePool: [
      { ev: 'completion', run: 'pcr-47', lane: 'lane-b-api', prov: 'Claude', model: 'claude-sonnet-4', acct: 'dev@tastebook.app', tin: 2870, tout: 1540, cin: 1800, cw: 220, cr: 1420, rep: 'measured', cost: 0.07, lat: '2.2s', detail: { Node: 'n-22 \u00b7 pagination for recipe feed' } },
      { ev: 'tool', run: 'pcr-47', lane: 'lane-c-frontend', prov: 'Copilot', model: 'gpt-4.1', acct: 'ci@tastebook.app', tin: 0, tout: 0, cin: 0, cw: 0, cr: 0, rep: 'measured', cost: 0, lat: '0.4s', detail: { Tool: 'file_edit', Target: 'web/src/routes/+page.svelte' } },
      { ev: 'completion', run: 'pcr-47', lane: 'lane-d-infra', prov: 'Gemini Direct', model: 'gemini-2.5-pro', acct: 'dev@tastebook.app', tin: 1980, tout: 1050, cin: 700, cw: 160, cr: 490, rep: 'estimated', cost: 0.04, lat: '1.5s', detail: { Node: 'n-34 \u00b7 volume mount audit' } }
    ]
  };

  D.ring = { used: 42180, limit: 128000, pct: 33, input: 38200, output: 3900, threadCostMicro: 190000 };
  D.contextByRole = { used: 42180, limit: 128000, pct: 33, cacheHitRate: 96.8,
    cacheHitKind: 'context_cache', cacheHitLabel: 'context cache hit',
    cacheHitNote: 'share of in-context tokens served from cache (context ring) \u2014 a CONTEXT metric; distinct from the per-provider prompt-cache hit rates in D.cache', roles: [
    { name: 'Messages', pct: 97.2 }, { name: 'System tools', pct: 1.6 }, { name: 'MCP tools', pct: 1.0 },
    { name: 'Skills', pct: 0.1 }, { name: 'System prompt', pct: 0.1 }, { name: 'Meta context', pct: 0 } ] };
  D.addons = [
    { prov: 'GitHub Copilot', kind: 'premium requests', purchased: 50, used: 11, unit: 'requests', resetsAt: 'Aug 01 00:00 UTC', vs: 'measured', note: 'top-up bundle added after the included allotment ran low' },
    { prov: 'Claude \u00b7 Account 1', kind: 'pay-as-you-go overage', purchased: 40, used: 6.2, unit: 'USD', resetsAt: null, vs: 'estimated', note: 'overage once the plan window exhausts' } ];
  D.costSplit = { currency: 'USD',
    apiMicro: 38900000, apiStatus: 'pricing_estimated', apiNote: 'list-rate estimate of API-billed usage \u2014 the rows tagged entitlement_class=api_billed (Gemini Direct + OpenCode passthrough). The Codex API key is hidden\u00b7BYOK/suppressed and is NOT counted in this bucket.',
    planEstMicro: 0, planStatus: 'included', planNote: 'plan-backed usage is included this cycle \u2014 zero marginal until overage',
    combinedMicro: 38900000, combinedStatus: 'pricing_estimated' };
  D.sessions = [
    { id: 's-1', title: 'Tastebook \u2014 planning chat', provider: 'Claude', model: 'claude-sonnet-4', mode: 'agent', started: '13:50', messages: 42, subagents: 1,
      tokens: { input: 38200, output: 3900, cacheRead: 2100, cacheWrite: 800, reasoning: 420 }, costMicro: 410000, ctxUsed: 42180, ctxLimit: 128000 },
    { id: 's-2', title: 'recipe import parser', provider: 'Claude', model: 'claude-opus-4', mode: 'deep', started: '14:21', messages: 18, subagents: 2,
      tokens: { input: 24800, output: 6100, cacheRead: 9200, cacheWrite: 3100, reasoning: 1800 }, costMicro: 880000, ctxUsed: 98000, ctxLimit: 200000 },
    { id: 's-3', title: 'frontend recipe card', provider: 'Copilot', model: 'gpt-4.1', mode: 'agent', started: '14:33', messages: 9, subagents: 0,
      tokens: { input: 12400, output: 2340, cacheRead: 1200, cacheWrite: 340, reasoning: 0 }, costMicro: 140000, ctxUsed: 31000, ctxLimit: 128000, premium: true },
    { id: 's-4', title: 'ratings migration', provider: 'Codex \u00b7 ChatGPT plan', model: 'o4-mini', mode: 'agent', started: '14:37', messages: 6, subagents: 0,
      tokens: { input: 6180, output: 1420, cacheRead: 0, cacheWrite: 0, reasoning: 60 }, costMicro: 50000, ctxUsed: 18000, ctxLimit: 128000, planBacked: true } ];
  D.subagentTokens = 18400;
  D.byModel = [
    { model: 'claude-sonnet-4', provider: 'Claude', sessions: 2, input: 63000, output: 5790, cacheRead: 4310, cacheWrite: 1140, reasoning: 480, costMicro: 620000 },
    { model: 'claude-opus-4', provider: 'Claude', sessions: 1, input: 24800, output: 6100, cacheRead: 9200, cacheWrite: 3100, reasoning: 1800, costMicro: 880000 },
    { model: 'gpt-4.1', provider: 'Copilot', sessions: 1, input: 12400, output: 2340, cacheRead: 1200, cacheWrite: 340, reasoning: 0, costMicro: 140000 },
    { model: 'o4-mini', provider: 'Codex \u00b7 ChatGPT plan', sessions: 1, input: 6180, output: 1420, cacheRead: 0, cacheWrite: 0, reasoning: 60, costMicro: 50000, vs: 'estimated' },
    { model: 'gemini-2.5-pro', provider: 'Gemini Direct', sessions: 1, input: 7600, output: 4230, cacheRead: 2800, cacheWrite: 740, reasoning: 0, costMicro: 150000, vs: 'estimated' },
    { model: 'deepseek-v3', provider: 'OpenCode', sessions: 1, input: 3100, output: 1840, cacheRead: 0, cacheWrite: 0, reasoning: 0, costMicro: 20000, vs: 'estimated' } ];
  /* D.bySession (source-aware) and D.quotas[].windows[] (independent records) are
     built below in the semantics pass — the old 5-bucket sum and the synthesized
     7d-from-5h windows double-counted / fabricated and were removed. */

  var CMD = { REFRESH: 'cmd.usage.refresh', EXPORT: 'cmd.usage.export', COMPACT: 'cmd.chat.compact_context', OPEN_CTX: 'cmd.chat.open_thread_context_details', FOCUS_CTX: 'cmd.chat.focus_thread_context_details', OPEN_USAGE: 'cmd.nav.open_usage_subject', SHOW_USAGE: 'cmd.artifacts.show_in_usage', SHOW_LEDGER: 'cmd.artifacts.show_in_ledger', WIDGET_ADD: 'cmd.widget.add', WIDGET_REMOVE: 'cmd.widget.remove', WIDGET_RESIZE: 'cmd.widget.resize', WIDGET_MOVE: 'cmd.widget.move', WIDGET_CONFIGURE: 'cmd.widget.configure', WIDGET_RESET: 'cmd.widget.reset_layout' };
  var REASONS = { unsupported: 'Not available for this provider', not_configured: 'Connect this in Settings first', not_signed_in: 'Sign in to see live data', busy: 'Busy \u2014 try again in a moment', blocked_by_gate: 'Blocked by a safety gate', already_done: 'Already done', stale: 'Data is stale \u2014 refresh first', rate_limited: 'Rate limited \u2014 wait for the window to reset', demo_scope: 'Demo only \u2014 not wired to a backend' };
  var _reg = {};
  function _regFn(id, fn) { _reg[id] = fn; }
  function _attempt(id, ctx) { var fn = _reg[id]; if (!fn) return { toast: '\u201C' + id + '\u201D isn\u2019t wired in this prototype yet.' }; try { var r = fn(ctx); return r || { ok: true }; } catch (e) { return { toast: 'That action hiccuped \u2014 try again.' }; } }
  _regFn(CMD.REFRESH, function () { D.asOfMin = 0; D.projection_freshness = 'refreshing'; D.projection_health = 'healthy'; D.projectionHealth = 'refreshing'; if (D.projectionMeta) D.projectionMeta.fresh = 'refreshing'; return { toast: 'Refreshing usage\u2026' }; });
  _regFn(CMD.EXPORT, function () { return { toast: 'Exported usage snapshot (view export \u2014 not canonical record truth).' }; });
  _regFn(CMD.COMPACT, function () { return { toast: 'Compacting thread context\u2026 (history totals unchanged)' }; });
  _regFn(CMD.OPEN_CTX, function () { return { ok: true }; });
  _regFn(CMD.OPEN_USAGE, function () { return { toast: 'Opening in Usage\u2026' }; });
  _regFn(CMD.SHOW_USAGE, function () { return { toast: 'Showing in Usage\u2026' }; });
  _regFn(CMD.SHOW_LEDGER, function () { return { toast: 'Showing in Ledger\u2026' }; });
  _regFn(CMD.WIDGET_RESET, function () { return { toast: 'Layout reset to defaults.' }; });
  ['WIDGET_ADD', 'WIDGET_REMOVE', 'WIDGET_RESIZE', 'WIDGET_MOVE', 'WIDGET_CONFIGURE'].forEach(function (k) { _regFn(CMD[k], function () { return { ok: true }; }); });
  window.USdemo = { CMD: CMD, REASONS: REASONS, reg: _regFn, attempt: _attempt, reason: function (c) { return REASONS[c] || c; } };

  /* ===================== SEMANTICS PASS (runs after D is fully populated) ===================== */

  /* Task 1 — counting_semantics + authoritative provider_total per record. */
  D.countingSemantics = SEM;
  D.countingSemanticsNote = 'inclusive (OpenAI-style): cache_read/cache_write/reasoning are non-additive subsets of the inclusive input/output totals. additive (Anthropic-style): cache_read/cache_write are separate buckets. Gemini: cache additive, thoughts a subset of output.';
  D.byModel.forEach(function (m) {
    m.counting_semantics = semFor(m.provider);
    m.provider_total = sourceAwareTotal(m, m.counting_semantics);
    m.provider_total_authority = (m.vs && m.vs !== 'measured') ? 'derived' : 'authoritative';
  });
  D.sessions.forEach(function (s) {
    s.counting_semantics = semFor(s.provider);
    s.provider_total = sourceAwareTotal(s.tokens, s.counting_semantics);
    s.provider_total_authority = 'authoritative';
    s.cost_microdollars = s.costMicro;
  });
  D.ledger.forEach(function (r) {
    r.counting_semantics = semFor(r.prov);
    r.provider_total = sourceAwareTotal(r, r.counting_semantics);
    r.cost_microdollars = r.cost == null ? null : Math.round(r.cost * 1e6);
  });

  /* Task 2 — source-aware used totals (replace the input+output+cacheRead double-count). */
  D.bySession = D.sessions.map(function (s) {
    var cs = semFor(s.provider);
    return { id: s.id, title: s.title, provider: s.provider, model: s.model, messages: s.messages, subagents: s.subagents,
      tokens: sourceAwareTotal(s.tokens, cs),
      tokensBasis: 'source-aware (' + cs.provider_style + '): cache ' + (cs.cache_in_input === 'additive' ? 'added (additive)' : 'is a subset of input \u2014 not added') + '; reasoning ' + (cs.reasoning_in_output === 'additive' ? 'added (additive)' : 'is a subset of output \u2014 not added'),
      costMicro: s.costMicro, cost_microdollars: s.costMicro };
  });
  var _utt = 0, _uttUnknown = false;
  D.usedTokensByProvider = D.byModel.map(function (m) {
    if (m.provider_total == null) _uttUnknown = true; else _utt += m.provider_total;
    return { provider: m.provider, model: m.model, counting_semantics: m.counting_semantics, usedTokens: m.provider_total, value_state: m.vs || 'measured', provider_total_authority: m.provider_total_authority };
  });
  D.usedTokensTotal = (_uttUnknown && _utt === 0) ? null : _utt;   /* null (unknown) if nothing derivable, never a fake 0 */
  D.usedTokensBasis = 'source-aware sum of per-record provider_total: cache_read/cache_write/reasoning added ONLY for additive counting_semantics, never added back for inclusive providers (no double-count). Keyed by (provider, model); mixes measured + estimated rows (see usedTokensByProvider) \u2014 not a single authoritative universal counter. Provenance for the TOTAL: source-aware mix \u00b7 medium confidence (3 of 6 byModel rows are estimated) \u2014 never render or chip it as provider-reported / high-authority.';
  D.usedTokensSourceClass = 'source_aware_mix';
  D.usedTokensConfidence = 'medium';
  D.usedTokensAuthority = 'derived';

  /* Task 3 — independent windows (one reset per window; no cross-window synthesis). */
  D.quotas.forEach(function (q) {
    q.window_kind = q.kind;      /* canonical name added; 'kind' alias kept for renderers */
    q.windows = buildWindows(q);
  });

  /* Task 6 — single cost_microdollars authority; costSplit is a projection of it. */
  D.cost_microdollars = Math.round(D.budget.spentMTD * 1e6);   /* cycle cost authority (integer microdollars) */
  D.budget.cost_microdollars = D.cost_microdollars;
  (function () {
    var api = 61850000;                              /* API-billed / list bucket */
    var plan = D.cost_microdollars - api;            /* plan-included estimated value */
    D.costSplit.cost_microdollars = D.cost_microdollars;
    D.costSplit.apiMicro = api;
    D.costSplit.planEstMicro = plan;
    D.costSplit.combinedMicro = api + plan;          /* === cost_microdollars by construction */
    D.costSplit.entitlement_split = { api_billed: api, plan_included: plan };
    D.costSplit.settlement_status = 'streaming_partial';
    D.costSplit.reconciles = (D.costSplit.apiMicro + D.costSplit.planEstMicro === D.costSplit.combinedMicro && D.costSplit.combinedMicro === D.cost_microdollars);
    D.costSplit.note = 'projection of the single cost_microdollars authority split by entitlement_class \u2014 not a second cost model';
  })();
  D.ring.cost_microdollars = D.ring.threadCostMicro;
  D.byModel.forEach(function (m) { m.cost_microdollars = m.costMicro; m.entitlement_class = (m.provider === 'Gemini Direct' || m.provider === 'OpenCode') ? 'api_billed' : 'plan_included'; });
  D.addons.forEach(function (a) {
    a.entitlement_class = (a.kind && a.kind.indexOf('overage') >= 0) ? 'paid_overage' : 'paid_addon';
    a.settlement_status = a.vs === 'measured' ? 'observed' : 'unknown';
    if (a.unit === 'USD' && a.used != null) a.cost_microdollars = Math.round(a.used * 1e6);
  });

  /* Task 4 — provenance grammar on every visible value object. */
  D.quotas.forEach(function (q) { attachProv(q, q.vs, q.conf); });
  D.cache.forEach(function (c) { var conf = c.state === 'measured' ? 'high' : c.state === 'estimated' ? 'medium' : 'unknown'; attachProv(c, c.state, conf, { settlement_status: c.state === 'measured' ? 'observed' : 'unknown' }); });
  D.ledger.forEach(function (r) { var conf = r.rep === 'measured' ? 'high' : r.rep === 'estimated' ? 'low' : 'unknown'; attachProv(r, r.rep, conf); });
  D.byModel.forEach(function (m) { attachProv(m, m.vs || 'measured', (m.vs && m.vs !== 'measured') ? 'low' : 'high'); });
  D.sessions.forEach(function (s) { attachProv(s, 'measured', 'high'); });
  D.bySession.forEach(function (s) { attachProv(s, 'measured', 'high'); });
  D.tools.forEach(function (t) { attachProv(t, 'measured', 'high'); });
  D.accounts.forEach(function (a) { attachProv(a, 'measured', 'high'); });
  D.contextBudget.families.forEach(function (f) { attachProv(f, 'measured', 'high', { source_class: 'local_estimated' }); });
  D.addons.forEach(function (a) { attachProv(a, a.vs, a.vs === 'measured' ? 'high' : 'low'); });
  attachProv(D.budget, 'estimated', 'medium', { source_class: 'pricing_estimated', settlement_status: 'streaming_partial' });
  attachProv(D.costSplit, 'pricing_estimated', 'medium', { settlement_status: 'streaming_partial' });
  attachProv(D.ring, 'measured', 'medium', { source_class: 'local_estimated' });
  attachProv(D.contextByRole, 'measured', 'medium', { source_class: 'local_estimated' });
  attachProv(D.chart, 'measured', 'high');
  Object.keys(D.chart).forEach(function (k) { if (D.chart[k] && D.chart[k].cols) attachProv(D.chart[k], 'measured', 'high'); });

  /* Task 4 — split the conflated projection health into freshness x health; keep alias. */
  D.projection_freshness = 'current';
  D.projection_health = 'healthy';
  D.projectionHealth = D.projection_freshness;   /* alias kept for existing readers (compared to 'current'/'stale'/'degraded') */
  /* M3 — the projection (and its headline used-tokens total) is a measured+estimated MIX, not a
     single authoritative counter. The global meta must say so (source-aware mix · medium) so no
     concept can chip the total as "provider reported · high". */
  D.projectionMeta = { source: 'source_aware_mix', source_class: 'source_aware_mix', conf: 'medium', source_confidence: 'medium', source_authority: 'derived', fresh: D.projection_freshness, health: D.projection_health, note: 'mixed measured + estimated rows; medium confidence; not a single authoritative universal counter' };
  D.usedTokensProvenance = { source: 'source_aware_mix', source_class: 'source_aware_mix', conf: 'medium', source_confidence: 'medium', source_authority: 'derived', settlement_status: 'streaming_partial', projection_freshness: D.projection_freshness, projection_health: D.projection_health, observed_at: ASOF, note: 'used-tokens total is a source-aware mix of measured + estimated per-model rows; medium confidence \u2014 not provider-reported/high' };

  /* C1 — reconcile Copilot plan-gating to the AUTHORITATIVE premium quota. Never assert
     "exhausted" while premiumLeft > 0; the gating state/status are derived from
     quotas.copilot.premiumLeft so the plan-gating widget and the account widget agree. */
  (function () {
    var cop = null; D.quotas.forEach(function (q) { if (q.id === 'copilot') cop = q; });
    D.planGating.forEach(function (g) {
      if (g.prov !== 'GitHub Copilot') return;
      var left = cop && cop.premiumLeft != null ? cop.premiumLeft : null;
      var total = cop && cop.premiumTotal != null ? cop.premiumTotal : null;
      g.premiumLeft = left; g.premiumTotal = total;             /* expose the authoritative basis on the row */
      if (left == null) { g.state = 'unverified'; g.status = 'Premium allotment unknown'; g.sub = 'no authoritative premium counter \u2014 shown as unverified, never exhausted'; g.extra = 'Included models may still be available'; return; }
      if (left <= 0) { g.state = 'included_premium_exhausted'; g.status = 'Premium requests exhausted'; g.sub = 'Premium-request-backed features unavailable until reset or policy change'; g.extra = 'Included models may still be available'; }
      else { g.state = 'included_premium_approaching'; g.status = left + ' of ' + total + ' premium requests left'; g.sub = 'Approaching the monthly cap \u2014 premium-request-backed features remain available until the allotment is exhausted'; g.extra = 'Included models remain available after exhaustion'; }
    });
  })();

  /* M2 — derive the Copilot coaching-risk window label from the quota's win/kind (a
     billing_cycle / month window), never a hardcoded "5h". */
  (function () {
    var cop = null; D.quotas.forEach(function (q) { if (q.id === 'copilot') cop = q; });
    if (!cop) return;
    var winLabel = (cop.win === 'month' || cop.kind === 'billing_cycle') ? 'monthly cycle' : (cop.win || 'window');
    D.signals.risks.forEach(function (r) {
      if (r.tag === 'quota' && /^Copilot\b/.test(r.text)) {
        r.text = 'Copilot at ' + cop.used + '% of its ' + winLabel + ' \u2014 route new frontend work to Codex';
      }
    });
  })();

  /* M5 — keep the two "cache hit" metrics distinct at the data layer: the context-ring
     cache-hit rate (D.contextByRole.cacheHitRate, a CONTEXT metric) vs per-provider
     prompt-cache hit/save (D.cache[], a PROVIDER metric that produces the $ saved figure).
     Label each so no renderer can present them as one figure under a single hero. */
  D.cache.forEach(function (c) { c.metricKind = 'provider_prompt_cache'; c.metricLabel = 'provider prompt-cache hit'; });
  D.promptCache = { kind: 'provider_prompt_cache', label: 'provider prompt-cache hit', totalSaved: D.cacheTotalSaved, cacheTotalSaved: D.cacheTotalSaved, note: 'per-provider prompt-cache hit/save (see D.cache); produces the $ saved figure \u2014 distinct from the context-ring cache-hit rate' };
  D.cacheHitMetricNote = 'two distinct metrics: (1) context cache hit = D.contextByRole.cacheHitRate (share of in-context tokens served from cache, 96.8%); (2) provider prompt-cache hit = D.cache[].hit, savings = D.cacheTotalSaved ($5.35, e.g. Claude 72%). Do not present them under one hero as a single cache-hit figure.';

  /* m2 — byModel is a per-model aggregate across the whole period; D.sessions is a sampled
     subset. Make the relationship explicit rather than implying they reconcile 1:1. */
  D.byModelBasis = 'per-model aggregate over the period (all model-sessions); D.sessions is a sampled subset, so byModel.sessions may exceed the sampled session count.';

  window.USAGE = D;
  window.USfmt = fmt;
  window.USvs = VS;
  window.USconf = CONF;

  /* ---------- expert motion core (tokens: usage-shared.css §16) ----------
     Self-contained spring/overshoot helpers shared by the animators below.
     Everything degrades to instant final values under R.isRM(); nothing here
     runs at load time (data-unit.mjs loads this file in a bare vm sandbox). */
  var MO = {
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',     /* = --mo-spring-ease: ~10% overshoot */
    springSoft: 'cubic-bezier(0.3, 1.28, 0.55, 1)',  /* muted overshoot near the 100% bound */
    settle: 'cubic-bezier(0.22, 1, 0.36, 1)',        /* = --mo-settle-ease: no overshoot */
    follow: 'cubic-bezier(0.25, 1.45, 0.45, 1)',     /* = --mo-follow-ease: soft follow-through */
    tok: function (scope, name, fb) {
      try {
        var el = scope && scope.nodeType === 9 ? scope.documentElement : (scope || document.documentElement);
        var n = parseFloat(getComputedStyle(el).getPropertyValue(name));
        if (!isNaN(n) && n > 0) return n;
      } catch (e) {}
      return fb;
    },
    /* easeOutBack — value runs slightly PAST the target, then settles onto it */
    backOut: function (p, s) { var q = p - 1; return 1 + (s + 1) * q * q * q + s * q * q; },
    /* stable cross-render identity: a re-render rebuilds innerHTML, so the last
       shown value is keyed on the nearest surviving host ([data-uid] widget or
       [id] section) + positional index, not the element itself */
    hostOf: function (el) { return (el.closest && (el.closest('[data-uid]') || el.closest('[id]'))) || null; },
    hostKey: function (el) { var h = this.hostOf(el); if (!h) return null; return h.getAttribute('data-uid') || h.id; },
    last: { fill: {}, donut: {}, bar: {}, spark: {} },
    sel: { fill: '.us-fill[data-fill], i[data-fill]', donut: '.dfill[data-pct]', bar: '.wd-cs i[data-h]', spark: '.wd-spk i' },
    prev: function (el, kind) {
      var h = this.hostOf(el); if (!h) return 0;
      var rec = this.last[kind][this.hostKey(el)]; if (!rec) return 0;
      var list = h.querySelectorAll(this.sel[kind]);
      for (var i = 0; i < list.length; i++) if (list[i] === el) return rec[i] || 0;
      return 0;
    },
    remember: function (el, kind, val) {
      var h = this.hostOf(el); if (!h) return;
      var key = this.hostKey(el), rec = this.last[kind][key] || (this.last[kind][key] = {});
      var list = h.querySelectorAll(this.sel[kind]);
      for (var i = 0; i < list.length; i++) if (list[i] === el) { rec[i] = val; return; }
    },
    /* landing tick: brief compositor-friendly scale pulse when a counter lands */
    tick: function (el) {
      if (!el.animate) return;
      try {
        var wasInline = getComputedStyle(el).display === 'inline';
        if (wasInline) el.style.display = 'inline-block';   /* transform needs a box */
        var a = el.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.07)', offset: 0.45 }, { transform: 'scale(1)' }],
          { duration: this.tok(el, '--mo-settle-dur', 300), easing: this.spring });
        a.onfinish = function () { if (wasInline) el.style.display = ''; };
      } catch (e) {}
    },
    /* stagger wave: flat --mo-stagger step, index-capped so the total wave < ~500ms */
    delay: function (i, scope) {
      var stag = this.tok(scope, '--mo-stagger', 24);
      var cap = stag > 0 ? Math.max(0, Math.ceil(480 / stag) - 1) : 0;
      return Math.min(i, cap) * stag;
    },
    /* arm a from->to transition with overshoot/settle: commit the start value
       with no transition, reflow, then arm the spring and let the caller set
       the target (double-rAF so the start frame is painted first) */
    arm: function (el, prop, from, to, dur, bez, delayMs) {
      /* el.style[prop] needs camelCase, but the transition shorthand needs the
         kebab-case property name (strokeDashoffset -> stroke-dashoffset); Chrome
         parses camelCase there without error but never animates it */
      var kp = prop.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); });
      el.style.transition = 'none';
      el.style[prop] = from;
      void (el.getBoundingClientRect ? el.getBoundingClientRect() : el.offsetWidth);
      el.style.transition = kp + ' ' + dur + 'ms ' + bez + ' ' + delayMs + 'ms';
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.style[prop] = to; }); });
    },
    bezFor: function (pct) { return pct >= 97 ? MO.settle : (pct > 92 ? MO.springSoft : MO.spring); }
  };

  /* ---------- shared render helpers (identical encoding across all concepts) ---------- */
  var R = {
    ic: function (n, c) { return window.PMIcon(n, c || 'pm-ico sm'); },
    chip: function (vsKey) {
      var v = VS[vsKey] || { label: vsKey, tone: 'mute' };
      /* inner <span> so the label truncates with an ellipsis when the chip is
         squeezed (a bare text node inside an inline-flex box cannot) */
      return '<span class="vs vs-' + v.tone + (v.dashed ? ' vs-dash' : '') + '" title="value state: ' + v.label + '"><span>' + v.label + '</span></span>';
    },
    conf: function (c) {
      var v = CONF[c] || CONF.unknown;
      return '<span class="conf conf-' + c + '" title="source confidence: ' + v.label + '"><span class="cd"></span>' + v.label + '</span>';
    },
    fillTone: function (p) { return p >= 90 ? 'hot' : p >= 70 ? 'warn' : 'ok'; },
    meter: function (pct, tone) {
      var t = tone || this.fillTone(pct);
      return '<span class="us-track"><span class="us-fill ' + t + '" data-fill="' + (pct || 0) + '" style="--wf:' + (pct || 0) + '%"></span></span>';
    },
    meterRow: function (label, pct, tone) {
      return '<span class="us-meter"><span class="lb">' + label + '</span>' + this.meter(pct, tone) +
        '<span class="pc">' + (pct == null ? '\u2014' : Math.round(pct) + '%') + '</span></span>';
    },
    fmtCd: function (s) { var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0'); },
    evLabel: { completion: 'Completion', tool: 'Tool call', error: 'Error', guard: 'Guard', switch: 'Acct switch' },
    /* reduced-motion source of truth: the MOTION toggle sets the attribute, the
       OS preference comes from the media query. The JS animators must honor it
       too (the CSS kill-switch in themes.css only reaches transitions/keyframes). */
    isRM: function () {
      return document.documentElement.getAttribute('data-reduced-motion') === '1' ||
        (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    },
    /* animate any .us-fill[data-fill] and any i[data-fill] inside a scope (after
       insertion): spring overshoot past the target then settle, morphing from the
       previously-shown width where one exists, staggered across the group. */
    animateFills: function (scope) {
      var root = scope || document, rm = this.isRM();
      var dur = MO.tok(root, '--mo-spring-dur', 420);
      root.querySelectorAll('.us-fill[data-fill], i[data-fill]').forEach(function (el, i) {
        var target = parseFloat(el.dataset.fill) || 0;
        if (rm) { el.style.transition = 'none'; el.style.width = target + '%'; el.dataset.usLast = target; MO.remember(el, 'fill', target); return; }
        MO.arm(el, 'width', (MO.prev(el, 'fill') || 0) + '%', target + '%', dur, MO.bezFor(target), MO.delay(i, root));
        el.dataset.usLast = target;
        MO.remember(el, 'fill', target);
      });
      R.animateBars(root);
    },
    /* animate [data-counter] (optional data-prefix / data-decimals): VALUE→VALUE —
       tweens from the last displayed value (persisted per stable identity, mirrored
       on dataset.usLast), never from 0 except the genuine first render. easeOutBack
       gives a slight overshoot into the value, a scale pulse marks the landing, and
       a mid-flight retarget continues from the current value instead of restarting.
       Total duration capped ≤1000ms so the data stays readable. */
    animateCounters: function (scope) {
      var rm = this.isRM();
      (scope || document).querySelectorAll('[data-counter]').forEach(function (el) {
        var target = parseFloat(el.dataset.counter) || 0, prefix = el.dataset.prefix || '';
        var dec = el.dataset.decimals != null ? (parseInt(el.dataset.decimals, 10) || 0) : 2;
        var fmtV = function (v) { return prefix + v.toFixed(dec); };
        var key = null;
        if (el.id) key = 'id:' + el.id;
        else {
          var host = (el.closest && (el.closest('[data-uid]') || el.closest('[id]'))) || document.body;
          var hk = (host.getAttribute && (host.getAttribute('data-uid') || host.id)) || 'body';
          var list = (host.querySelectorAll ? host.querySelectorAll('[data-counter]') : [el]);
          for (var i = 0; i < list.length; i++) if (list[i] === el) { key = 'h:' + hk + ':' + i; break; }
          key = key || 'h:' + hk + ':0';
        }
        if (el._usCnt && el._usCnt.raf) cancelAnimationFrame(el._usCnt.raf);   /* retarget, never restart */
        var stored = el._usCnt ? el._usCnt.cur : (el.dataset.usLast != null ? parseFloat(el.dataset.usLast) : R._cntLast[key]);
        var from = (stored == null || isNaN(stored)) ? 0 : stored;
        if (rm) { el._usCnt = { cur: target, raf: 0 }; el.dataset.usLast = target; R._cntLast[key] = target; el.textContent = fmtV(target); return; }
        if (from === target) { el._usCnt = { cur: target, raf: 0 }; el.dataset.usLast = target; R._cntLast[key] = target; el.textContent = fmtV(target); return; }
        var dur = Math.min(MO.tok(el, '--mo-data-refresh-dur', 800), 1000);
        var st = { cur: from, raf: 0 }, t0 = performance.now();
        el._usCnt = st;
        function tick(now) {
          var p = Math.min((now - t0) / dur, 1);
          var v = p >= 1 ? target : from + (target - from) * MO.backOut(p, 1.0);
          st.cur = v;
          el.textContent = fmtV(v);
          if (p < 1) st.raf = requestAnimationFrame(tick);
          else { R._cntLast[key] = target; el.dataset.usLast = target; MO.tick(el); }
        }
        st.raf = requestAnimationFrame(tick);
      });
    },
    _cntLast: {},
    /* animate donut .dfill[data-pct] inside a scope: stroke-dashoffset draws with
       the same spring overshoot/settle, morphing from the previous pct, staggered */
    animateDonuts: function (scope) {
      var root = scope || document, rm = this.isRM();
      var dur = MO.tok(root, '--mo-spring-dur', 420);
      root.querySelectorAll('.dfill[data-pct]').forEach(function (c, i) {
        var pct = parseFloat(c.dataset.pct) || 0, circ = 163.4;
        var off = function (p) { return circ * (1 - p / 100); };
        if (rm) { c.style.transition = 'none'; c.style.strokeDashoffset = off(pct); MO.remember(c, 'donut', pct); return; }
        MO.arm(c, 'strokeDashoffset', off(MO.prev(c, 'donut') || 0), off(pct), dur, MO.bezFor(pct), MO.delay(i, root));
        MO.remember(c, 'donut', pct);
      });
    },
    /* chart columns (.wd-cs i[data-h]): stagger wave across bars (total < ~500ms),
       morphing each segment from its previous height with a soft follow-through
       overshoot. Sparkline (.wd-spk i) bars draw on left→right on first render.
       Runs from animateFills so every shared animation entry point covers it. */
    animateBars: function (scope) {
      var root = scope || document, rm = this.isRM();
      var dur = Math.min(MO.tok(root, '--mo-follow-dur', 560), 640);
      var hover = MO.tok(root, '--mo-hover-dur', 120);
      var stag = MO.tok(root, '--mo-stagger', 24);
      root.querySelectorAll('.wd-cs i[data-h]').forEach(function (el, i) {
        var target = parseFloat(el.getAttribute('data-h')) || 0;
        if (rm) { el.style.transition = 'none'; el.style.height = target + '%'; MO.remember(el, 'bar', target); return; }
        /* stagger WAVE across COLUMNS (segments of a column move together — no
           per-series stagger wars); flat --mo-stagger step per column, capped < ~500ms */
        var col = el.closest ? el.closest('.wd-col') : null;
        var plot = col && col.parentElement;
        var ci = plot ? Array.prototype.indexOf.call(plot.querySelectorAll('.wd-col'), col) : i;
        var d = Math.min(ci < 0 ? i : ci, 20) * stag;
        el.style.transition = 'none';
        el.style.height = (MO.prev(el, 'bar') || 0) + '%';
        void el.offsetWidth;
        /* keep the series-mute opacity transition the CSS defines alongside height */
        el.style.transition = 'height ' + dur + 'ms ' + MO.follow + ' ' + d + 'ms, opacity ' + hover + 'ms ease';
        requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.height = target + '%'; }); });
        MO.remember(el, 'bar', target);
      });
      var sdur = MO.tok(root, '--mo-spring-dur', 420);
      root.querySelectorAll('.wd-spk i').forEach(function (el, i) {
        var t = parseFloat(el.style.height) || 0;
        if (rm) { el.style.transition = 'none'; el.style.height = t + '%'; MO.remember(el, 'spark', t); return; }
        /* draw-on: left→right stagger wave, morphing from the previous shape */
        MO.arm(el, 'height', (MO.prev(el, 'spark') || 0) + '%', t + '%', sdur, MO.spring, MO.delay(i, root));
        MO.remember(el, 'spark', t);
      });
    }
  };
  R.human = function (s) { return s == null ? '\u2014' : String(s).replace(/_/g, ' '); };
  R.humanCap = function (s) { var h = R.human(s); return h ? h.charAt(0).toUpperCase() + h.slice(1) : h; };
  R.projChip = function (m) { if (!m) return ''; var p = []; if (m.source) p.push(R.human(m.source)); if (m.conf) p.push(R.human(m.conf)); if (m.fresh && m.fresh !== 'current') p.push(R.human(m.fresh)); return p.length ? '<span class="us-proj" title="provenance: ' + p.join(' \u00b7 ') + '">' + p.join(' \u00b7 ') + '</span>' : ''; };
  R.costMicro = function (micro, status) { var html = '<span class="us-cost">' + fmt.cost(micro == null ? null : micro / 1e6) + '</span>'; if (status === 'included') return html + ' <span class="vs vs-ok"><span>included</span></span>'; return status ? html + ' ' + R.chip(status) : html; };
  R.winBar = function (w) { var tone = w.used == null ? 'mute' : R.fillTone(w.used); var rst = (w.cooldown && w.cooldown.active) ? 'cooling' : (w.reset && w.reset !== 'unknown' ? w.reset : '\u2014'); return '<span class="us-winrow' + (w.cooldown && w.cooldown.active ? ' cd' : '') + '"><span class="us-winlab">' + w.label + '</span>' + R.meter(w.used, tone) + '<span class="us-winpc">' + (w.used == null ? '\u2014' : Math.round(w.used) + '%') + '</span><span class="us-winrst">' + rst + '</span></span>'; };

  R.deText = function (scope) {
    function walk(n) { for (var i = 0; i < n.childNodes.length; i++) { var c = n.childNodes[i]; if (c.nodeType === 3) { if (c.nodeValue.indexOf('_') >= 0) c.nodeValue = c.nodeValue.replace(/_/g, ' '); } else if (c.nodeType === 1 && c.tagName !== 'SCRIPT' && c.tagName !== 'STYLE') walk(c); } }
    walk(scope || document.body);
  };
  window.USrender = R;
})();
