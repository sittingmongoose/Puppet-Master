(() => {
  /* =====================================================================
     PM56 demo fixtures.

     DETERMINISM (fixture contract, FIXTURE_SCHEMA.md section 0)
     ------------------------------------------------------------------
     This file used to open with `Date.now()`, which made every timestamp
     move between loads and a stable screenshot baseline impossible. Every
     clock below now derives from ONE fixed UTC epoch, and every derived
     number comes from a stable string hash of its own id, so two loads of
     this file produce byte-identical fixtures.

     Human-readable relative labels (`updated:'2m'`) are DISPLAY ONLY and
     always sit beside a machine-sortable ISO field; renderers sort on the
     ISO one.
     ===================================================================== */
  const EPOCH_MS = Date.parse('2026-08-24T09:00:00Z');
  /* Absolute wall clock, minutes (and seconds) after the epoch. */
  const at = (min, sec = 0) => new Date(EPOCH_MS + min * 60000 + sec * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');
  /* Backwards clock, kept because it reads better at thread scale: the
     "now" of this fixture is epoch + 9h, so `ago(2)` is two minutes ago. */
  const NOW_MIN = 540;
  const ago = (min, sec = 0) => at(NOW_MIN - min, -sec);

  /* Deterministic pseudo-variation. FNV-1a over the id, so a value is
     stable across loads but different per message. Never Math.random. */
  const seed = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const pick = (s, lo, hi) => lo + (seed(s) % (hi - lo + 1));
  const money = (n) => Math.round(n * 10000) / 10000;

  /* Display labels for every closed enum in this file. Raw enum values are
     never user-facing copy -- `in_progress` and `deep_plan` must not reach
     the screen. Both spellings of the change status are mapped so a
     renderer handed either one still prints correct English. */
  const labels = {
    mode: { ask:'Ask', agent:'Agent', debug:'Debug', plan:'Plan', deep_plan:'Deep Plan' },
    effort: { low:'Low', medium:'Medium', high:'High', max:'Max', automatic:'Automatic' },
    todoStatus: { pending:'Not started', in_progress:'In progress', completed:'Done', blocked:'Stalled', skipped:'Skipped', verifying:'Verifying', replanned:'Replanned' },
    subagentStatus: { working:'Working', blocked:'Stalled', waiting:'Waiting', complete:'Complete', failed:'Failed', queued:'Queued', retrying:'Retrying', fallback:'Fallback route' },
    changeStatus: { added:'Created', created:'Created', modified:'Modified', deleted:'Deleted', renamed:'Renamed' },
    artifactStatus: { ready:'Ready', stale:'Stale', error:'Needs retry', loading:'Rendering' },
    phaseStatus: { pending:'Not started', in_progress:'In progress', completed:'Completed', blocked:'Stalled', abandoned:'Abandoned' },
    worktreeState: { unbound:'Unbound', 'bound-clean':'Bound · clean', 'bound-dirty':'Bound · uncommitted changes', 'bound-conflict':'Bound · conflict' },
    modelStatus: { ready:'Ready', 'api-key-required':'API key required', 'sign-in-required':'Sign-in required', 'cli-not-found':'CLI not found', 'update-available':'Update available', 'quota-exhausted':'Quota exhausted', expired:'Credential expired' },
    questionFlowState: { active:'Active', queued:'Queued', completed:'Completed' },
    terminal: { complete:'Completed', stopped:'Stopped by user', error:'Ended in error', submitted:'Submitted' }
  };

  /* Configured routes only -- adding an unconfigured provider is out of
     scope; accounts and states are what this fixture adds. `id` matches a
     record in `models` below, and `account` matches one in `accounts`. */
  const ROUTES = {
    sonnet:      { provider:'Anthropic', account:'Work · anthropic-work',    model:'Claude Sonnet 4.6', modelId:'sonnet46',    fast:true,  contextLimit:131000 },
    sonnetPer:   { provider:'Anthropic', account:'Personal · anthropic-me',  model:'Claude Sonnet 4.6', modelId:'sonnet46-personal', fast:true, contextLimit:131000 },
    opus:        { provider:'Anthropic', account:'Work · anthropic-work',    model:'Claude Opus 5',     modelId:'opus5',       fast:false, contextLimit:196000 },
    qwen:        { provider:'Alibaba',   account:'Coding Plan · qwen-coder', model:'Qwen 3.8',          modelId:'qwen38',      fast:true,  contextLimit:262000 },
    kimi:        { provider:'Moonshot',  account:'Kimi Coding · kimi-main',  model:'Kimi K3',           modelId:'kimi-k3',     fast:true,  contextLimit:200000 },
    glm:         { provider:'z.ai',      account:'Primary · zai-primary',    model:'GLM 5.2',           modelId:'glm52',       fast:false, contextLimit:128000 },
    cursor:      { provider:'Cursor',    account:'Pro · cursor-pro',         model:'Cursor Auto',       modelId:'cursor-auto', fast:false, contextLimit:120000 }
  };

  /* -----------------------------------------------------------------
     Message factories.

     `time` is retained for compatibility; `sentAt` is the authoritative
     wall clock added by this wave. Both are the same fixed ISO string --
     they must never diverge.
     ----------------------------------------------------------------- */
  const text = (id, role, body, extra = {}) => {
    const time = extra.time || ago(extra.ago == null ? 10 : extra.ago);
    const m = { id, role, type:'text', body, time, sentAt:time, ...extra };
    delete m.ago;
    return m;
  };
  const event = (id, type, extra = {}) => {
    const time = extra.time || ago(extra.ago == null ? 9 : extra.ago);
    const m = { id, role:'system', type, time, sentAt:time, ...extra };
    delete m.ago;
    return m;
  };

  /* -----------------------------------------------------------------
     Thread builder.

     entries are compact triples so a 16-turn conversation stays readable:
       ['u', body, extra?]   user turn
       ['a', body, extra?]   assistant turn -- gets a full `runtime` block
       ['e', type, extra?]   system event (type must exist in app.js's
                             renderEventMessage map)

     Rules this enforces so no renderer has to:
       * ids are `${threadId}-NN`, unique across the whole file, so
         `state.messageExpanded` (a flat global id map) can never leak
         expand state between threads;
       * `runtime.context.used` rises MONOTONICALLY within a thread;
       * `extra.route` switches the route mid-thread and every later turn
         inherits it -- that is how a mid-thread model change is expressed;
       * only the LAST user message carries `eligibleForEdit:true`
         (Edit-and-branch is scoped to the most recent user turn).
     ----------------------------------------------------------------- */
  function turns(tid, opts, entries) {
    let route = { ...ROUTES[opts.route] };
    const persona = opts.persona || 'Product Manager';
    const mode = opts.mode || 'agent';
    const effort = opts.effort || 'High';
    let used = opts.contextStart == null ? 9800 : opts.contextStart;
    let t = (opts.startMin == null ? 60 : opts.startMin) * 60;
    let n = 0;
    const out = [];
    for (const entry of entries) {
      const kind = entry[0], payload = entry[1], extra = entry[2] || {};
      n += 1;
      const id = `${tid}-${String(n).padStart(2, '0')}`;
      if (extra.route) route = { ...ROUTES[extra.route] };
      t += (extra.gap == null ? pick(id + ':gap', 24, 210) : extra.gap);
      const sentAt = at(0, t);

      if (kind === 'e') {
        const m = { id, role:'system', type:payload, time:sentAt, sentAt };
        for (const k in extra) if (k !== 'gap' && k !== 'route') m[k] = extra[k];
        out.push(m);
        continue;
      }
      if (kind === 'u') {
        const m = { id, role:'user', type:'text', body:payload, time:sentAt, sentAt, eligibleForEdit:false };
        if (extra.long) m.long = true;
        if (extra.attachments) m.attachments = extra.attachments;
        out.push(m);
        continue;
      }

      const limit = route.contextLimit;
      const durationMs = extra.durationMs == null ? pick(id + ':dur', 2600, 47000) : extra.durationMs;
      const queuedMs = extra.queuedMs == null ? pick(id + ':q', 120, 2600) : extra.queuedMs;
      const input = pick(id + ':in', 3200, 21400);
      const output = Math.max(180, Math.round(payload.length * 0.42) + pick(id + ':out', 40, 920));
      const cacheHitPct = pick(id + ':chp', 41, 92);
      const cached = Math.round(used * cacheHitPct / 100);
      used = Math.min(limit - 2600, used + pick(id + ':grow', 900, 4400));
      const apiUsd = money(((input - cached > 0 ? input - cached : input) * 3 + cached * 0.3 + output * 15) / 1e6);
      const planUsd = money(apiUsd * pick(id + ':plan', 22, 61) / 100);
      const terminal = extra.terminal || 'complete';
      const m = {
        id, role:'assistant', type:'text', body:payload, time:sentAt, sentAt,
        runtime: {
          provider: route.provider, account: route.account,
          model: route.model, modelId: route.modelId,
          mode, persona, effort, fast: !!route.fast,
          startedAt: sentAt,
          completedAt: at(0, t + Math.round(durationMs / 1000)),
          durationMs,
          /* the brief's flat pair, kept beside the nested schema fields
             because it has no nested equivalent: worked excludes queue
             time, total includes it */
          workedSeconds: Math.round(durationMs / 1000),
          totalElapsedSeconds: Math.round((durationMs + queuedMs) / 1000),
          queuedMs,
          tokens: { input, output, cached, total: input + output },
          context: { used, limit, cacheHitPct, available: limit - used },
          cost: { apiUsd, planUsd, totalUsd: money(apiUsd + planUsd) },
          terminal
        }
      };
      if (extra.long) m.long = true;
      if (extra.terminal === 'error') m.runtime.error = extra.error || 'Execution host closed the stream.';
      out.push(m);
      t += Math.round(durationMs / 1000);
    }
    for (let i = out.length - 1; i >= 0; i--) { if (out[i].role === 'user') { out[i].eligibleForEdit = true; break; } }
    return out;
  }

  const workSteps = [
    { id:'prepare', label:'Preparing', verb:'Preparing the workspace', detail:'Resolving the active thread, worktree, tools, and execution policy.', kind:'prepare', icon:'sparkles', evidence:['Thread query-performance','Worktree feature/query-index','Permission Auto'] },
    { id:'think', label:'Thinking', verb:'Reasoning about the bottleneck', detail:'Comparing query shape, write pressure, cardinality, and index selectivity.', kind:'thought', icon:'brain', evidence:['Read-heavy path: 95% reads','N+1 fan-out found in 3 queries','Tenant-scoped access pattern'] },
    { id:'files', label:'Explore', verb:'Exploring the analytics code', detail:'Reading query builders, schema definitions, migration history, and tests.', kind:'files', icon:'folder-search', evidence:['src/analytics/queries.rs','src/analytics/schema.rs','migrations/0042_events.sql'] },
    { id:'search', label:'Web search', verb:'Searching current database guidance', detail:'Checking primary documentation for composite indexes and materialized views.', kind:'web-search', icon:'search', evidence:['PostgreSQL multicolumn indexes','Refresh strategy constraints','Write amplification notes'] },
    { id:'fetch', label:'Web fetch', verb:'Fetching the authoritative references', detail:'Opening the exact sections needed for index order and concurrent refresh behavior.', kind:'web-fetch', icon:'download', evidence:['Fetched 4 primary-source pages','Extracted 7 relevant sections'] },
    { id:'browser', label:'Browser', verb:'Inspecting the live query dashboard', detail:'Controlling the browser to reproduce the slow path and capture timings.', kind:'browser', icon:'globe', evidence:['Opened Query Performance dashboard','Captured p50/p95 traces','No console errors'] },
    { id:'bash', label:'Bash', verb:'Profiling the query path', detail:'Running EXPLAIN ANALYZE, fixture generation, and targeted benchmarks.', kind:'bash', icon:'terminal', evidence:['EXPLAIN ANALYZE complete','128,400 fixture rows','Baseline p95: 482 ms'] },
    { id:'agents', label:'Subagents', verb:'Delegating two focused reviews', detail:'Query Analyzer and Schema Reviewer are working in separate read-only child threads.', kind:'agents', icon:'users', evidence:['Query Analyzer · running','Schema Reviewer · running'] },
    { id:'edit', label:'Editing', verb:'Implementing the selected index approach', detail:'Adding the composite index and updating the query to match its leading columns.', kind:'edit', icon:'file-edit', evidence:['1 migration created','2 query call sites updated','+84 −17 lines'] },
    { id:'app', label:'App control', verb:'Driving the database inspector', detail:'Opening the local inspector, refreshing schema metadata, and checking index uptake.', kind:'app', icon:'monitor-play', evidence:['Schema refresh complete','Planner selects new index'] },
    { id:'test', label:'Browser test', verb:'Testing the real interaction path', detail:'Replaying the dashboard workflow at desktop and compact assistant widths.', kind:'test', icon:'flask', evidence:['14 browser assertions','No clipped overlays','Scroll anchor stable'] },
    { id:'validate', label:'Validate', verb:'Validating behavior and performance', detail:'Running unit, integration, lint, type, and benchmark checks.', kind:'validate', icon:'check-circle', evidence:['42 tests passed','LSP clean','p95: 71 ms'] },
    { id:'render', label:'Artifact', verb:'Rendering the benchmark report', detail:'Creating an interactive comparison artifact and registering its lineage.', kind:'artifact', icon:'chart', evidence:['1 interactive artifact','1 Mermaid diagram','2 screenshots'] },
    { id:'complete', label:'Complete', verb:'Work complete', detail:'The query path is faster, validated, and ready for review.', kind:'complete', icon:'check', evidence:['86% p95 reduction','42 tests passed','3 files changed','2 subagents completed'] }
  ];

  /* Phase grammar for the shared working chrome. The reference video shows a
     small icon trail where each disc is one *phase* of work with a bold verb
     and a grey count ("Thinking for 4s", "Editing 3 files"). All 14 workSteps
     have distinct kinds, so phases are an explicit kind->phase map below;
     phaseMeta gives each phase its live verb, past verb, and count. */
  const phaseMeta = {
    prepare:{verb:'Preparing',past:'Prepared',count:'3 checks'},
    thought:{verb:'Thinking',past:'Thought',count:'for 4s'},
    files:{verb:'Exploring',past:'Explored',count:'3 files'},
    'web-search':{verb:'Searching',past:'Searched',count:'3 sources'},
    'web-fetch':{verb:'Fetching',past:'Fetched',count:'4 pages'},
    browser:{verb:'Inspecting',past:'Inspected',count:'2 traces'},
    bash:{verb:'Profiling',past:'Profiled',count:'3 benchmarks'},
    agents:{verb:'Delegating',past:'Delegated',count:'2 agents'},
    edit:{verb:'Editing',past:'Edited',count:'3 files'},
    app:{verb:'Driving',past:'Drove',count:'1 inspector'},
    test:{verb:'Testing',past:'Tested',count:'14 assertions'},
    validate:{verb:'Validating',past:'Validated',count:'42 checks'},
    artifact:{verb:'Rendering',past:'Rendered',count:'2 artifacts'},
    complete:{verb:'Finishing',past:'Finished',count:'14 tools'}
  };

  /* Concrete rows the chrome shows for each phase: a streamed thought
     paragraph, read paths, benchmark tags, edit diff stats. Row shape:
     {text, add?, del?, tag?, stream?}, keyed [step.kind][step.id].
     Wave 2 raised this from 6 phases to all 14, so no phase falls back to
     the terse `evidence` array any more, and raised the streamed rows from
     one to six so `stream:true` is exercised across the whole sequence. */
  const phaseRows = {
    prepare:{ prepare:[{text:'Resolved thread Query Performance in worktree feature/query-index'},{text:'Execution policy: Auto · local server · browser program available',tag:'ready'},{text:'Loaded 4 tool groups and 2 configured provider accounts'}] },
    thought:{ think:[{stream:true, text:'The bottleneck here is a tenant-scoped read path: 95% reads with an N+1 fan-out across 3 queries. A composite index led by tenant_id should let the planner skip the scan — I should read the schema and the migration history before touching anything, and check what the benchmarks actually show.'}] },
    files:{ files:[{text:'Read src/analytics/queries.rs'},{text:'Read src/analytics/schema.rs'},{text:'Read migrations/0042_events.sql'}] },
    'web-search':{ search:[{stream:true, text:'Checking whether a leading tenant_id is still the right choice when created_at carries the range predicate — the planner only skips the sort if the index order matches the ORDER BY direction.'},{text:'PostgreSQL multicolumn index documentation',tag:'primary'},{text:'Concurrent refresh constraints for materialized views'}] },
    'web-fetch':{ fetch:[{text:'Fetched CREATE INDEX CONCURRENTLY reference',tag:'4 pages'},{text:'Extracted 7 sections on leading-column selectivity'},{stream:true, text:'The concurrent build takes two table passes and cannot run inside a transaction block, so the migration has to be split from the rest of the batch. That is worth saying out loud in the plan rather than discovering during the deploy.'}] },
    browser:{ browser:[{text:'Opened the Query Performance dashboard'},{text:'Captured p50 118 ms · p95 482 ms',tag:'baseline'},{text:'No console errors across 3 reloads'}] },
    bash:{ bash:[{text:'Ran EXPLAIN ANALYZE analytics_query',tag:'p95 482 ms'},{text:'Generated 128,400 fixture rows'},{text:'Ran cargo bench analytics_query'}] },
    agents:{ agents:[{text:'Query Analyzer · comparing index selectivity',tag:'running'},{text:'Schema Reviewer · checking migration history',tag:'stalled'},{text:'Benchmark Runner · queued behind the fixture build',tag:'queued'}] },
    edit:{ edit:[{text:'Edited migrations/0043_composite_index.sql',add:84,del:17},{text:'Edited src/analytics/queries.rs',add:22,del:6},{text:'Created src/analytics/index_hints.rs',add:41}] },
    app:{ app:[{text:'Opened the local database inspector'},{text:'Refreshed schema metadata',tag:'ok'},{text:'Planner now selects idx_events_tenant_created',tag:'confirmed'}] },
    test:{ test:[{text:'Replayed the dashboard workflow at 1440 px',tag:'pass'},{text:'Replayed at 720 px compact assistant width',tag:'pass'},{text:'14 browser assertions · no clipped overlays'}] },
    validate:{ validate:[{text:'42 tests passed',tag:'green'},{text:'LSP diagnostics clean'},{text:'p95 482 ms → 71 ms',tag:'−86%'}] },
    artifact:{ render:[{text:'Rendered the benchmark comparison dashboard'},{text:'Rendered the runtime architecture diagram',tag:'mermaid'},{stream:true, text:'The report needs the write-amplification number next to the read win, otherwise the comparison flatters the change: +4.8% on writes is the cost being paid for the 86% read improvement.'}] },
    complete:{ complete:[{stream:true, text:'Done. The composite index is in, the two N+1 call sites are batched, and the benchmark artifact records both the read win and the write cost so the review does not have to take my word for it.'},{text:'12 files changed · +438 −171',tag:'diff'},{text:'2 subagents completed · 1 stalled on approval'}] }
  };

  /* Step kind -> phase id. The chrome walks workSteps in order and starts a
     new trail disc whenever the mapped phase changes (web steps merge into
     one Search phase, app control into Editing, the last four steps into one
     Validate phase) — mirroring the video's ~7-disc trail. */
  const phaseGroups = {
    prepare:'prepare', thought:'thought', files:'files',
    'web-search':'web-search', 'web-fetch':'web-search', browser:'web-search',
    bash:'bash', agents:'agents', edit:'edit', app:'edit',
    test:'validate', validate:'validate', artifact:'validate', complete:'validate'
  };
