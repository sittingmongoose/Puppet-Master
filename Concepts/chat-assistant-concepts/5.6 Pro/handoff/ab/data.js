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


  /* =====================================================================
     changes[] -- 3 records with no diff content at all -> 12 files with
     real unified-diff hunks.

     Compact authoring form: rows are ['+'|'-'|' '|'\\', text]. The helper
     assigns the 1-based old/new line numbers and derives the @@ header, so
     no renderer ever computes a line number -- computing them in JS is
     exactly what produced the fabricated 18-line CREATE INDEX diff this
     replaces (app.js:424-427 printed the same SQL for every path clicked).

     `add`/`del` are DERIVED from the hunks by countChange() below, so the
     totals can never drift from the diff content the way the old literals
     did. Three files reproduce the correction packet's manifest counts
     exactly: provider-selector.js +92/−18, access-controls.css +61/−39,
     interaction-probes.mjs +31/−10.
     ===================================================================== */
  function hunk(oldStart, newStart, rows) {
    let o = oldStart, n = newStart, oldLines = 0, newLines = 0;
    const lines = rows.map((r) => {
      const sign = r[0], txt = r[1];
      if (sign === '+') { newLines++; return { kind:'add', old:null, new:n++, text:txt }; }
      if (sign === '-') { oldLines++; return { kind:'del', old:o++, new:null, text:txt }; }
      if (sign === '\\') { return { kind:'meta', old:null, new:null, text:txt }; }
      oldLines++; newLines++; return { kind:'ctx', old:o++, new:n++, text:txt };
    });
    return { header:`@@ -${oldStart},${oldLines} +${newStart},${newLines} @@`, oldStart, oldLines, newStart, newLines, lines };
  }
  function countChange(c) {
    let add = 0, del = 0;
    for (const h of c.hunks) for (const l of h.lines) { if (l.kind === 'add') add++; else if (l.kind === 'del') del++; }
    c.add = add; c.del = del;
    c.lineCount = c.hunks.reduce((s, h) => s + h.lines.length, 0);
    return c;
  }

  const changes = [
    countChange({ id:'c1', path:'migrations/0043_tenant_created_index.sql', line:1,
      summary:'Add the tenant_id + created_at composite index as a concurrent, non-transactional migration',
      status:'added', oldPath:null, language:'sql', threadId:'query',
      hunks:[ hunk(0, 1, [
        ['+','-- 0043_tenant_created_index'],
        ['+','-- Leading column is tenant_id: every analytics read is tenant-scoped,'],
        ['+','-- and created_at carries the range predicate plus the ORDER BY.'],
        ['+','--'],
        ['+','-- CONCURRENTLY cannot run inside a transaction block, so this file is'],
        ['+','-- split out of the batch migration and applied on its own.'],
        ['+','-- no-transaction'],
        ['+',''],
        ['+','CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_tenant_created'],
        ['+','    ON analytics_events (tenant_id, created_at DESC)'],
        ['+','    INCLUDE (event_kind, actor_id);'],
        ['+',''],
        ['+','ANALYZE analytics_events;'],
        ['+',''],
        ['+','-- rollback:'],
        ['+','--   DROP INDEX CONCURRENTLY IF EXISTS idx_events_tenant_created;'],
        ['+','-- The rollback is rehearsed in tests/analytics_query_test.rs so the'],
        ['+','-- forward migration is never the only tested direction.']
      ]) ] }),

    countChange({ id:'c2', path:'src/analytics/queries.rs', line:128,
      summary:'Replace the per-row event lookup with one batched, tenant-first query',
      status:'modified', oldPath:null, language:'rust', threadId:'query',
      hunks:[
        hunk(122, 122, [
          [' ','use crate::analytics::schema::{EventKind, TenantScope};'],
          ['-','use crate::db::Row;'],
          ['+','use crate::analytics::index_hints::IndexHint;'],
          ['+','use crate::db::{Row, RowBatch};'],
          [' ',''],
          [' ','impl AnalyticsQueries {'],
          ['-','    /// Loads events one tenant at a time. O(n) round trips.'],
          ['-','    pub async fn events_for(&self, scope: &TenantScope) -> Result<Vec<Row>> {'],
          ['-','        let mut out = Vec::new();'],
          ['-','        for tenant in scope.tenants() {'],
          ['-','            out.extend(self.one_tenant(tenant).await?);'],
          ['+','    /// Loads every tenant in one round trip. The index hint keeps the'],
          ['+','    /// planner on idx_events_tenant_created even when the range is wide.'],
          ['+','    pub async fn events_for(&self, scope: &TenantScope) -> Result<RowBatch> {'],
          ['+','        let hint = IndexHint::tenant_created();'],
          ['+','        let batch = self'],
          ['+','            .pool'],
          ['+','            .fetch_batch(hint.apply(EVENTS_BY_TENANT), scope.tenant_ids())'],
          ['+','            .await?;'],
          [' ','        }'],
          [' ','        Ok(out)'],
          [' ','    }']
        ]),
        hunk(196, 199, [
          [' ','const EVENTS_BY_TENANT: &str = r#"'],
          ['-','    SELECT * FROM analytics_events'],
          ['-','     WHERE tenant_id = $1'],
          ['-','     ORDER BY created_at DESC'],
          ['+','    SELECT event_kind, actor_id, created_at, payload'],
          ['+','      FROM analytics_events'],
          ['+','     WHERE tenant_id = ANY($1)'],
          ['+','       AND created_at >= $2'],
          ['+','     ORDER BY tenant_id, created_at DESC'],
          ['+','     LIMIT $3'],
          [' ','"#;'],
          [' ',''],
          ['+','/// Batch size chosen so one page of the composite index is one read.'],
          ['+','pub const EVENT_PAGE: i64 = 512;'],
          ['+',''],
          ['+','#[cfg(test)]'],
          ['+','mod planner_guard {'],
          ['+','    use super::*;'],
          ['+',''],
          ['+','    /// Fails loudly if the planner stops choosing the composite index,'],
          ['+','    /// which is the only way this change silently regresses.'],
          ['+','    #[tokio::test]'],
          ['+','    async fn uses_composite_index() {'],
          ['+','        let plan = explain(EVENTS_BY_TENANT).await;'],
          ['+','        assert!(plan.contains("idx_events_tenant_created"), "{plan}");'],
          ['+','    }'],
          ['+','}'],
          [' ','']
        ])
      ] }),

    countChange({ id:'c3', path:'src/analytics/bench.rs', line:44,
      summary:'Add the tenant-scale benchmark fixture and record the write-amplification cost',
      status:'modified', oldPath:null, language:'rust', threadId:'query',
      hunks:[ hunk(41, 41, [
        [' ','use criterion::{criterion_group, Criterion};'],
        ['-','const TENANTS: usize = 8;'],
        ['-','const EVENTS_PER_TENANT: usize = 400;'],
        ['-',''],
        ['+','/// 128,400 rows across 214 tenants -- the shape production actually has.'],
        ['+','/// The old 8x400 fixture was small enough that a sequential scan won,'],
        ['+','/// which is why the previous benchmark showed no gain from the index.'],
        ['+','const TENANTS: usize = 214;'],
        ['+','const EVENTS_PER_TENANT: usize = 600;'],
        ['+',''],
        ['+','fn write_amplification(c: &mut Criterion) {'],
        ['+','    c.bench_function("insert_with_composite_index", |b| {'],
        ['+','        b.iter(|| insert_batch(EVENTS_PER_TENANT));'],
        ['+','    });'],
        ['+','}'],
        ['+',''],
        [' ','fn read_path(c: &mut Criterion) {'],
        ['+','    let fixture = seed(TENANTS, EVENTS_PER_TENANT);'],
        ['+','    c.bench_function("events_for_tenant_page", |b| {'],
        ['+','        b.iter(|| fixture.events_for(&scope()));'],
        ['+','    });'],
        [' ','}'],
        [' ',''],
        ['+','criterion_group!(benches, read_path, write_amplification);'],
        ['+','// Baseline p95 482 ms -> 71 ms read; writes +4.8%.'],
        [' ','']
      ]) ] }),

    /* Manifest file 1 of 3: +92 / −18, three hunks, 110 changed lines --
       the file that makes the editor scroll. */
    countChange({ id:'c4', path:'threads/provider-selector.js', line:64,
      summary:'Route the selector through configured accounts instead of one account per provider',
      status:'modified', oldPath:null, language:'javascript', threadId:'route',
      hunks:[
        hunk(58, 58, [
          [' ','import { configuredProviders } from \'../providers/registry.js\';'],
          ['-','import { firstAccount } from \'../providers/accounts.js\';'],
          ['+','import { accountsFor, accountState } from \'../providers/accounts.js\';'],
          ['+','import { STATUS_LABEL } from \'../providers/labels.js\';'],
          [' ',''],
          ['-','// One provider used to mean one account, so the selector could key its'],
          ['-','// rows on the provider id -- an assumption that is now wrong.'],
          ['-','export function providerRows() {'],
          ['-','  return configuredProviders().map((p) => ({'],
          ['-','    id: p.id,'],
          ['-','    account: firstAccount(p.id),'],
          ['+','// A provider can expose the same model through several configured'],
          ['+','// accounts, so rows are keyed on `${providerId}:${accountId}` and the'],
          ['+','// model name alone is no longer unique inside the list.'],
          ['+','export function providerRows() {'],
          ['+','  return configuredProviders().flatMap((p) => accountsFor(p.id).map((a) => ({'],
          ['+','    id: `${p.id}:${a.id}`,'],
          ['+','    providerId: p.id,'],
          ['+','    account: a,'],
          ['+','    state: accountState(a),'],
          [' ','  }));'],
          [' ','}']
        ]),
        hunk(96, 100, [
          [' ','export function renderSelector(host, state) {'],
          ['-','  const rows = providerRows();'],
          ['-','  host.innerHTML = rows.map((r) => row(r, r.id === state.provider)).join(\'\');'],
          ['+','  const rows = providerRows();'],
          ['+','  const grouped = groupByProvider(rows);'],
          ['+','  host.innerHTML = grouped'],
          ['+','    .map(([providerId, items]) => section(providerId, items, state))'],
          ['+','    .join(\'\');'],
          ['+','  host.dataset.accountCount = String(rows.length);'],
          ['+','  host.dataset.needsAttention = String(rows.filter(needsAttention).length);'],
          [' ','}'],
          [' ',''],
          ['-','function row(r, active) {'],
          ['-','  return `<button class="row ${active ? \'active\' : \'\'}" data-id="${r.id}">'],
          ['-','    <span class="name">${r.id}</span>'],
          ['-','    <span class="account">${r.account.label}</span>'],
          ['-','  </button>`;'],
          ['-','}'],
          ['+','function groupByProvider(rows) {'],
          ['+','  const map = new Map();'],
          ['+','  for (const r of rows) {'],
          ['+','    if (!map.has(r.providerId)) map.set(r.providerId, []);'],
          ['+','    map.get(r.providerId).push(r);'],
          ['+','  }'],
          ['+','  return [...map.entries()];'],
          ['+','}'],
          ['+',''],
          ['+','function section(providerId, items, state) {'],
          ['+','  const attention = items.filter(needsAttention).length;'],
          ['+','  return ['],
          ['+','    `<div class="provider-group" data-provider="${providerId}">`,'],
          ['+','    `  <div class="group-head">`,'],
          ['+','    `    <span class="group-name">${providerId}</span>`,'],
          ['+','    `    <span class="group-count">${items.length} accounts</span>`,'],
          ['+','    attention ? `    <span class="group-warn">${attention} need attention</span>` : \'\','],
          ['+','    `  </div>`,'],
          ['+','    items.map((r) => row(r, r.id === state.route)).join(\'\'),'],
          ['+','    `</div>`,'],
          ['+','  ].filter(Boolean).join(\'\\n\');'],
          ['+','}'],
          ['+',''],
          ['+','function row(r, active) {'],
          ['+','  const blocked = needsAttention(r);'],
          ['+','  return ['],
          ['+','    `<button class="row ${active ? \'active\' : \'\'} ${blocked ? \'blocked\' : \'\'}"`,'],
          ['+','    `        data-id="${r.id}" ${blocked ? \'aria-disabled="true"\' : \'\'}>`,'],
          ['+','    `  <span class="name">${r.account.model}</span>`,'],
          ['+','    `  <span class="account">${r.account.label}</span>`,'],
          ['+','    `  <span class="state">${STATUS_LABEL[r.state] ?? r.state}</span>`,'],
          ['+','    `</button>`,'],
          ['+','  ].join(\'\\n\');'],
          ['+','}'],
          ['+',''],
          ['+','function needsAttention(r) {'],
          ['+','  return r.state !== \'ready\' && r.state !== \'update-available\';'],
          ['+','}'],
          [' ','']
        ]),
        hunk(168, 200, [
          [' ','export function selectRoute(host, id) {'],
          ['-','  host.dataset.provider = id;'],
          ['-','  emit(host, \'route\', { provider: id });'],
          ['-','}'],
          ['+','  const [providerId, accountId] = id.split(\':\');'],
          ['+','  const row = providerRows().find((r) => r.id === id);'],
          ['+','  if (!row) return false;'],
          ['+','  if (needsAttention(row)) {'],
          ['+','    // Do not silently fall back to another account: the user picked a'],
          ['+','    // specific one, and a quiet substitution is how a thread ends up'],
          ['+','    // billed to an account nobody chose.'],
          ['+','    emit(host, \'route-blocked\', { providerId, accountId, state: row.state });'],
          ['+','    return false;'],
          ['+','  }'],
          ['+','  host.dataset.provider = providerId;'],
          ['+','  host.dataset.account = accountId;'],
          ['+','  host.dataset.route = id;'],
          ['+','  emit(host, \'route\', { providerId, accountId, model: row.account.model });'],
          ['+','  return true;'],
          ['+','}'],
          ['+',''],
          ['+','export function routeLabel(id) {'],
          ['+','  const row = providerRows().find((r) => r.id === id);'],
          ['+','  if (!row) return \'No configured route\';'],
          ['+','  return `${row.account.model} · ${row.account.label}`;'],
          ['+','}'],
          ['+',''],
          ['+','// Two accounts on the same provider can expose the same model, so the'],
          ['+','// thread has to record which one it actually ran on. Reading it back'],
          ['+','// off the model name would silently merge them.'],
          ['+','export function routeState(host) {'],
          ['+','  const id = host.dataset.route;'],
          ['+','  const row = id && providerRows().find((r) => r.id === id);'],
          ['+','  if (!row) {'],
          ['+','    return { ok: false, reason: \'no-configured-route\', label: routeLabel(id) };'],
          ['+','  }'],
          ['+','  const ok = !needsAttention(row);'],
          ['+','  return { ok, reason: row.state, providerId: row.providerId,'],
          ['+','           accountId: row.account.id, label: routeLabel(id) };'],
          ['+','}'],
          [' ','']
        ])
      ] }),

    /* Manifest file 2 of 3: +61 / −39, two hunks. */
    countChange({ id:'c5', path:'threads/access-controls.css', line:12,
      summary:'Replace the colour-only permission accent with a token set that survives all eight themes',
      status:'modified', oldPath:null, language:'css', threadId:'route',
      hunks:[
        hunk(12, 12, [
          [' ','.access-row {'],
          ['-','  border-left: 3px solid #4c8dff;'],
          ['-','  padding: 6px 8px 6px 11px;'],
          ['-','  background: rgba(76, 141, 255, 0.08);'],
          ['-','  color: #e8ecf6;'],
          ['-','}'],
          ['-',''],
          ['-','.access-row.denied { border-left-color: #ff5c5c; }'],
          ['-','.access-row.pending { border-left-color: #ffb648; }'],
          ['-','.access-row.granted { border-left-color: #37d67a; }'],
          ['-',''],
          ['-','.access-row .label { font-size: 11px; opacity: 0.7; }'],
          ['-','.access-row .value { font-size: 12px; }'],
          ['+','  /* A coloured left-edge bar may not carry status: it is invisible to'],
          ['+','     anyone who cannot separate the hues, and it collides with the'],
          ['+','     selection accent. Status is an icon plus a word plus a tone. */'],
          ['+','  display: grid;'],
          ['+','  grid-template-columns: 18px minmax(0, 1fr) auto;'],
          ['+','  align-items: center;'],
          ['+','  gap: 8px;'],
          ['+','  padding: 6px 9px;'],
          ['+','  border: 1px solid var(--border);'],
          ['+','  border-radius: var(--radius-sm);'],
          ['+','  background: var(--surface-raised);'],
          ['+','  color: var(--text);'],
          ['+','}'],
          ['+',''],
          ['+','.access-row > .access-icon {'],
          ['+','  display: grid;'],
          ['+','  place-items: center;'],
          ['+','  inline-size: 18px;'],
          ['+','  block-size: 18px;'],
          ['+','  color: var(--muted);'],
          ['+','}'],
          ['+',''],
          ['+','.access-row.denied  > .access-icon { color: var(--danger); }'],
          ['+','.access-row.pending > .access-icon { color: var(--warning); }'],
          ['+','.access-row.granted > .access-icon { color: var(--positive); }'],
          ['+',''],
          ['+','.access-row .label { font-size: 11px; color: var(--muted); }'],
          ['+','.access-row .value { font-size: 12px; color: var(--text); }'],
          ['+','.access-row .state { font-size: 10px; color: var(--subtle); }'],
          [' ','']
        ]),
        hunk(58, 80, [
          [' ','.access-panel {'],
          ['-','  max-height: 320px;'],
          ['-','  overflow: hidden;'],
          ['-','}'],
          ['-',''],
          ['-','@media (prefers-color-scheme: light) {'],
          ['-','  .access-row { background: rgba(76, 141, 255, 0.06); color: #14181f; }'],
          ['-','  .access-row .label { opacity: 0.6; }'],
          ['-','}'],
          ['-',''],
          ['-','@media (max-width: 700px) {'],
          ['-','  .access-row { border-left-width: 2px; }'],
          ['-','  .access-panel { max-height: 200px; }'],
          ['-','}'],
          ['-',''],
          ['-','.access-row:hover { background: rgba(76, 141, 255, 0.16); }'],
          ['-','.access-row:focus-visible { outline: 2px solid #4c8dff; }'],
          ['-','.access-row[aria-disabled=\'true\'] { opacity: 0.4; }'],
          ['-',''],
          ['-','.access-row .chip { border-radius: 3px; padding: 1px 4px; }'],
          ['-','.access-row .chip.danger { background: #ff5c5c; }'],
          ['-','.access-row .chip.warn { background: #ffb648; }'],
          ['-','.access-row .chip.ok { background: #37d67a; }'],
          ['-',''],
          ['-','.access-note { font-size: 10px; color: #8a93a6; }'],
          ['-',''],
          ['-','.access-panel::-webkit-scrollbar { width: 6px; }'],
          ['-','.access-panel::-webkit-scrollbar-thumb { background: #4c8dff; }'],
          ['+','  max-height: min(320px, 100vh - 24px);'],
          ['+','  overflow: auto;'],
          ['+','  overscroll-behavior: contain;'],
          ['+','  scrollbar-gutter: stable;'],
          ['+','}'],
          ['+',''],
          ['+','/* Theme handling moved to tokens: the eight themes are explicit'],
          ['+','   attribute states, not a light/dark media query, so this block was'],
          ['+','   only ever correct in two of them. */'],
          ['+','.access-row:hover { background: var(--surface-hover); }'],
          ['+','.access-row:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }'],
          ['+','.access-row[aria-disabled=\'true\'] { opacity: 0.55; cursor: not-allowed; }'],
          ['+','.access-row[aria-disabled=\'true\'] .state { color: var(--danger); }'],
          ['+',''],
          ['+','.access-row .chip {'],
          ['+','  padding: 1px 5px; font-size: 9px; border-radius: var(--radius-sm);'],
          ['+','  border: 1px solid var(--border); background: var(--surface);'],
          ['+','}'],
          ['+','.access-row .chip.danger { border-color: var(--danger); color: var(--danger); }'],
          ['+','.access-row .chip.warn   { border-color: var(--warning); color: var(--warning); }'],
          ['+','.access-row .chip.ok     { border-color: var(--positive); color: var(--positive); }'],
          ['+',''],
          ['+','.access-note { font-size: 10px; color: var(--subtle); }'],
          ['+',''],
          ['+','@media (max-width: 700px) {'],
          ['+','  .access-row { grid-template-columns: 18px minmax(0, 1fr); }'],
          ['+','  .access-row .state { grid-column: 2; }'],
          ['+','}'],
          ['+',''],
          ['+','@media (prefers-reduced-motion: reduce) {'],
          ['+','  .access-row { transition: none; }'],
          ['+','}'],
          [' ','']
        ])
      ] }),

    /* Manifest file 3 of 3: +31 / −10, two hunks. */
    countChange({ id:'c6', path:'verification/interaction-probes.mjs', line:22,
      summary:'Assert painted pixels instead of bounding boxes in the interaction probes',
      status:'modified', oldPath:null, language:'javascript', threadId:'debug',
      hunks:[
        hunk(22, 22, [
          [' ','export async function probeVisible(page, selector) {'],
          ['-','  // TODO: this does not prove the element is actually painted.'],
          ['-','  const box = await page.locator(selector).boundingBox();'],
          ['-','  return Boolean(box && box.width > 0 && box.height > 0);'],
          ['-','}'],
          ['+','  // A bounding box is reported for elements that are clipped, occluded,'],
          ['+','  // or mid-transition -- which is how three "fixes" passed while invisible.'],
          ['+','  const box = await page.locator(selector).boundingBox();'],
          ['+','  if (!box || box.width <= 0 || box.height <= 0) return false;'],
          ['+','  const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];'],
          ['+','  const onTop = await page.evaluate('],
          ['+','    ([x, y, sel]) => document.elementFromPoint(x, y)?.closest(sel) !== null,'],
          ['+','    [cx, cy, selector],'],
          ['+','  );'],
          ['+','  // Distinct colours, not mean luminance: a placeholder box has exactly one.'],
          ['+','  return onTop && distinctColours(await page.screenshot({ clip: box })) > 3;'],
          ['+','}'],
          [' ','']
        ]),
        hunk(70, 91, [
          [' ','export async function probeHoverOnly(page, selector) {'],
          ['-','  await page.hover(selector);'],
          ['-','  const shown = await probeVisible(page, selector);'],
          ['-','  return shown;'],
          ['-','}'],
          ['-',''],
          ['-','export const PROBES = [probeVisible, probeHoverOnly];'],
          ['+','  const atRest = await probeVisible(page, selector);'],
          ['+','  await page.hover(selector);'],
          ['+','  await page.waitForFunction('],
          ['+','    (sel) => getComputedStyle(document.querySelector(sel)).opacity === \'1\','],
          ['+','    selector,'],
          ['+','  );'],
          ['+','  const onHover = await probeVisible(page, selector);'],
          ['+','  // The assertion is the PAIR: absent at rest AND present on hover.'],
          ['+','  return { atRest, onHover, pass: atRest === false && onHover === true };'],
          ['+','}'],
          ['+',''],
          ['+','export async function probeScrolls(page, selector) {'],
          ['+','  const before = await page.locator(selector).evaluate((el) => el.scrollTop);'],
          ['+','  await page.locator(selector).evaluate((el) => { el.scrollTop = 9999; });'],
          ['+','  const after = await page.locator(selector).evaluate((el) => el.scrollTop);'],
          ['+','  return after > before;'],
          ['+','}'],
          ['+',''],
          ['+','export const PROBES = [probeVisible, probeHoverOnly, probeScrolls];'],
          [' ','']
        ])
      ] }),

    /* Pure deletion: add:0. The retired rollup path. */
    countChange({ id:'c7', path:'src/analytics/legacy_rollup.rs', line:1,
      summary:'Delete the hourly rollup table now that the composite index serves the same reads',
      status:'deleted', oldPath:null, language:'rust', threadId:'query',
      hunks:[ hunk(1, 0, [
        ['-','//! Hourly rollup of analytics_events.'],
        ['-','//!'],
        ['-','//! Superseded by idx_events_tenant_created: the rollup existed only to'],
        ['-','//! avoid the sequential scan the index now removes.'],
        ['-',''],
        ['-','use crate::db::Pool;'],
        ['-',''],
        ['-','pub struct LegacyRollup {'],
        ['-','    pool: Pool,'],
        ['-','    window_hours: u32,'],
        ['-','}'],
        ['-',''],
        ['-','impl LegacyRollup {'],
        ['-','    pub fn new(pool: Pool) -> Self {'],
        ['-','        Self { pool, window_hours: 24 }'],
        ['-','    }'],
        ['-',''],
        ['-','    pub async fn refresh(&self) -> Result<u64> {'],
        ['-','        self.pool.execute(REFRESH_ROLLUP).await'],
        ['-','    }'],
        ['-','}'],
        ['-',''],
        ['-','const REFRESH_ROLLUP: &str = "REFRESH MATERIALIZED VIEW events_hourly";'],
        ['\\','\\ No newline at end of file']
      ]) ] }),

    countChange({ id:'c8', path:'src/analytics/index_hints.rs', line:1,
      summary:'New index-hint helper so the planner choice is explicit and testable',
      status:'added', oldPath:null, language:'rust', threadId:'query',
      hunks:[ hunk(0, 1, [
        ['+','//! Explicit planner hints.'],
        ['+','//!'],
        ['+','//! The planner picking the right index by accident is not the same as'],
        ['+','//! the planner picking it on purpose, and only one of those survives a'],
        ['+','//! statistics refresh.'],
        ['+',''],
        ['+','#[derive(Clone, Copy, Debug, PartialEq, Eq)]'],
        ['+','pub struct IndexHint {'],
        ['+','    name: &\'static str,'],
        ['+','}'],
        ['+',''],
        ['+','impl IndexHint {'],
        ['+','    pub const fn tenant_created() -> Self {'],
        ['+','        Self { name: "idx_events_tenant_created" }'],
        ['+','    }'],
        ['+',''],
        ['+','    pub fn apply(&self, sql: &str) -> String {'],
        ['+','        format!("/*+ IndexScan({}) */ {sql}", self.name)'],
        ['+','    }'],
        ['+',''],
        ['+','    pub const fn name(&self) -> &\'static str {'],
        ['+','        self.name'],
        ['+','    }'],
        ['+','}']
      ]) ] }),

    countChange({ id:'c9', path:'docs/query-performance.md', line:1,
      summary:'Rename the perf notes to a durable report and record the rollback rehearsal',
      status:'renamed', oldPath:'docs/perf-notes.md', language:'markdown', threadId:'query',
      hunks:[ hunk(1, 1, [
        ['-','# Perf notes'],
        ['-',''],
        ['-','Scratch notes on the analytics read path. Not authoritative.'],
        ['-',''],
        ['-','- index? maybe'],
        ['+','# Query performance'],
        ['+',''],
        ['+','Authoritative record for the tenant-scoped analytics read path.'],
        ['+',''],
        ['+','| Metric | Before | After |'],
        ['+','| --- | --- | --- |'],
        ['+','| p95 read | 482 ms | 71 ms |'],
        ['+','| p50 read | 118 ms | 24 ms |'],
        ['+','| Write throughput | baseline | +4.8% cost |'],
        ['+',''],
        ['+','The rollback is rehearsed, not assumed: see tests/analytics_query_test.rs.'],
        [' ','']
      ]) ] }),

    countChange({ id:'c10', path:'src/analytics/schema.rs', line:88,
      summary:'Narrow the event payload column and drop the unused rollup foreign key',
      status:'modified', oldPath:null, language:'rust', threadId:'query',
      hunks:[
        hunk(86, 86, [
          [' ','pub struct AnalyticsEvent {'],
          ['-','    pub payload: serde_json::Value,'],
          ['+','    /// Bounded at write time; unbounded payloads were 61% of row width.'],
          ['+','    pub payload: BoundedJson<4096>,'],
          [' ','    pub created_at: DateTime<Utc>,'],
          [' ','}']
        ]),
        hunk(140, 141, [
          [' ','impl Schema for AnalyticsEvent {'],
          ['-','    const FOREIGN_KEYS: &[&str] = &["events_hourly_fk"];'],
          ['-','    const INDEXES: &[&str] = &["events_created_idx"];'],
          ['-','    const PARTITION: Option<&str> = None;'],
          ['+','    const FOREIGN_KEYS: &[&str] = &[];'],
          ['+','    const INDEXES: &[&str] = &["idx_events_tenant_created"];'],
          ['+','    const PARTITION: Option<&str> = Some("created_at");'],
          ['+','    const RETENTION: Duration = Duration::days(9);'],
          [' ','}']
        ])
      ] }),

    countChange({ id:'c11', path:'tests/analytics_query_test.rs', line:31,
      summary:'Rehearse the rollback direction and assert the planner keeps the index',
      status:'modified', oldPath:null, language:'rust', threadId:'query',
      hunks:[
        hunk(29, 29, [
          [' ','#[tokio::test]'],
          ['-','async fn forward_migration_applies() {'],
          ['-','    apply("0043_tenant_created_index").await.unwrap();'],
          ['+','async fn forward_and_rollback_both_apply() {'],
          ['+','    apply("0043_tenant_created_index").await.unwrap();'],
          ['+','    assert!(index_exists("idx_events_tenant_created").await);'],
          ['+','    rollback("0043_tenant_created_index").await.unwrap();'],
          ['+','    assert!(!index_exists("idx_events_tenant_created").await);'],
          ['+','    apply("0043_tenant_created_index").await.unwrap();'],
          [' ','}']
        ]),
        hunk(72, 78, [
          [' ','#[tokio::test]'],
          [' ','async fn tenant_isolation_holds() {'],
          ['+','    // The index reorders rows; isolation must be proven, not inferred.'],
          ['+','    let a = events_for(tenant("a")).await;'],
          ['+','    let b = events_for(tenant("b")).await;'],
          ['+','    assert!(a.iter().all(|e| e.tenant_id == tenant("a")));'],
          ['+','    assert!(b.iter().all(|e| e.tenant_id == tenant("b")));'],
          ['+','    assert_eq!(a.len(), 600);'],
          ['+','    assert_eq!(b.len(), 600);'],
          [' ','}']
        ])
      ] }),

    countChange({ id:'c12', path:'config/observability.toml', line:14,
      summary:'Emit the planner choice and the write-amplification gauge',
      status:'modified', oldPath:null, language:'toml', threadId:'debug',
      hunks:[ hunk(12, 12, [
        [' ','[metrics.analytics]'],
        ['-','histogram_buckets = [50, 100, 250, 500]'],
        ['-','emit_plan_name = false'],
        ['+','histogram_buckets = [10, 25, 50, 100, 250, 500]'],
        ['+','emit_plan_name = true'],
        ['+','emit_write_amplification = true'],
        ['+',''],
        ['+','[metrics.analytics.alert]'],
        ['+','p95_read_ms = 100'],
        [' ','']
      ]) ] })
  ];


  /* =====================================================================
     artifacts[] -- 13 -> 18.

     `updated:'2m ago'` was display-only and unsortable, and the array was
     not even in recency order, so `D.artifacts[0]` ("always the plan") was
     the only "most recent" the panel could show. Every record now carries
     a sortable ISO `updatedAt` plus `createdAt`, a `projectPath`, an
     `openTarget` (what the Open button should actually open), and a
     kind-specific `payload` body so renderers stop hardcoding metrics,
     trace rows and SVG nodes.

     `plan-query` deliberately stays at index 0: app.js:878 reads
     `D.artifacts[0]` for the plan decision surface. The most RECENT
     artifact is now `dashboard-query`, which is what makes the
     `mostRecentArtifact()` fix visible on screen.

     Two states that had no fixture at all:
       * `loading`  -> `render-forecast`, with `resolvesTo:'ready'`
       * `error` + retry -> `broken-viz` (recoverable) and `chart-latency`
         (resolves to `error`, then recovers on retry)
     ===================================================================== */
  const artifacts = [
    { id:'plan-query', kind:'plan', title:'Query Performance Improvement Plan',
      summary:'Add a tenant-first composite index, remove N+1 query fan-out, validate write amplification, and retain a materialized-view fallback.',
      status:'ready', version:4, updated:'34m ago', updatedAt:at(506), createdAt:at(12),
      threadId:'query', projectPath:'docs/plans/query-performance.md', openTarget:'editor', error:null,
      payload:{
        decision:'Composite index first; materialized view kept as a documented fallback, not the default.',
        sequence:[
          'Measure the current tenant-scoped read path and record a baseline p95.',
          'Add idx_events_tenant_created as a concurrent, non-transactional migration.',
          'Batch the two N+1 call sites behind one tenant-first query.',
          'Re-run the benchmark at production row shape (214 tenants, 128,400 rows).',
          'Rehearse the rollback before the forward migration ships.',
          'Approve, revise, cancel, or build from the durable chat card.'
        ],
        acceptance:[
          'p95 read below 100 ms at production row shape',
          'No incorrect tenant crossover in the isolation test',
          'Write overhead below 8%',
          'All tests green, including the rollback rehearsal'
        ],
        revisions:[
          { n:1, at:at(24), note:'Initial plan: index only.' },
          { n:2, at:at(96), note:'Added the write-amplification threshold after the benchmark fixture was corrected.' },
          { n:3, at:at(268), note:'Added the rollback gate, the materialized-view fallback, and a named benchmark evidence owner.' },
          { n:4, at:at(506), note:'Split the concurrent index into its own migration file: CREATE INDEX CONCURRENTLY cannot run inside a transaction block.' }
        ]
      } },

    { id:'dashboard-query', kind:'dashboard', title:'Query Benchmark Dashboard',
      summary:'Interactive p50, p95, throughput, cache-hit, and write-amplification comparison.',
      status:'ready', version:6, updated:'1m ago', updatedAt:at(539), createdAt:at(150),
      threadId:'query', projectPath:'artifacts/query-benchmark.json', openTarget:'editor', error:null,
      payload:{ metric:'p95 read latency', unit:'ms',
        series:[
          { label:'Baseline', value:482 }, { label:'Index only', value:118 },
          { label:'Index + batching', value:71 }, { label:'Target', value:100 }
        ],
        secondary:[
          { label:'p50 read', before:118, after:24, unit:'ms' },
          { label:'Throughput', before:1420, after:3980, unit:'rows/s' },
          { label:'Cache hit', before:41, after:78, unit:'%' },
          { label:'Write cost', before:0, after:4.8, unit:'%' }
        ] } },

    { id:'mermaid-runtime', kind:'mermaid', title:'Assistant Runtime Architecture',
      summary:'A Mermaid view of chat, activity projection, editor artifacts, subagents, and runtime events.',
      status:'ready', version:2, updated:'8m ago', updatedAt:at(532), createdAt:at(88),
      threadId:'visuals', projectPath:'docs/diagrams/runtime.mmd', openTarget:'editor', error:null,
      payload:{ source:[
        'flowchart TD',
        '  U[User turn] --> C[Composer]',
        '  C --> R{Route}',
        '  R -->|configured account| P[Provider]',
        '  R -->|no eligible account| W[Warning receipt]',
        '  P --> A[Assistant turn]',
        '  A --> AP[Activity projection]',
        '  AP --> G[Goal]',
        '  AP --> T[Todo]',
        '  AP --> S[Subagents]',
        '  AP --> D[Changes]',
        '  AP --> F[Artifacts]',
        '  S --> S1[Child thread]',
        '  S1 --> AP',
        '  D --> E[Editor]',
        '  F --> E'
      ].join('\n') } },

    { id:'render-forecast', kind:'chart', title:'Context Growth Forecast',
      summary:'Projected window use for the next twelve turns at the current growth rate.',
      status:'loading', version:1, updated:'now', updatedAt:at(540), createdAt:at(540),
      threadId:'context', projectPath:'artifacts/context-forecast.json', openTarget:'editor', error:null,
      /* The only artifact state with no fixture before this wave. It
         resolves rather than spinning forever -- a permanent spinner is a
         placeholder, not a state. */
      loading:{ label:'Rendering forecast', startedAt:at(540), etaMs:2400, resolvesTo:'ready', progress:0.4 },
      payload:{ metric:'Projected window use', unit:'tokens',
        series:[
          { label:'Turn +2', value:91200 }, { label:'Turn +4', value:99800 },
          { label:'Turn +6', value:108400 }, { label:'Turn +8', value:117900 },
          { label:'Turn +10', value:126100 }, { label:'Turn +12', value:131000 }
        ] } },

    { id:'test-evidence', kind:'evidence', title:'Browser Test Evidence',
      summary:'Screenshots, assertions, timings, console logs, and network evidence.',
      status:'ready', version:5, updated:'11m ago', updatedAt:at(529), createdAt:at(196),
      threadId:'debug', projectPath:'verification/evidence/2026-08-24.json', openTarget:'editor', error:null,
      payload:{
        gates:[
          { name:'Interaction probes', passed:14, total:14 },
          { name:'Painted-pixel assertions', passed:9, total:9 },
          { name:'Theme sweep', passed:8, total:8 },
          { name:'Reduced motion', passed:6, total:7 },
          { name:'Console cleanliness', passed:3, total:3 }
        ],
        log:[
          'Opened the dashboard at 1440x900 over file://',
          'Captured p50/p95 traces across 3 reloads',
          'No console errors and no page errors',
          'One reduced-motion gate is still open: the sonar take keeps a named loop',
          'Screenshots stored beside this record, not inlined'
        ] } },

    { id:'data-explorer', kind:'data', title:'Trace Data Explorer',
      summary:'Filterable query traces with duration, tenant, route, cache, and plan data.',
      status:'ready', version:2, updated:'17m ago', updatedAt:at(523), createdAt:at(220),
      threadId:'debug', projectPath:'artifacts/traces.csv', openTarget:'editor', error:null,
      payload:{
        columns:['Trace', 'Tenant', 'Route', 'Duration', 'Cache', 'Plan'],
        rows:[
          ['tr-8841', 'acme', 'events_for', '71 ms', 'hit', 'idx_events_tenant_created'],
          ['tr-8842', 'acme', 'events_for', '68 ms', 'hit', 'idx_events_tenant_created'],
          ['tr-8843', 'northwind', 'events_for', '112 ms', 'miss', 'idx_events_tenant_created'],
          ['tr-8844', 'northwind', 'rollup_hourly', '482 ms', 'miss', 'seq scan (removed)'],
          ['tr-8845', 'globex', 'events_for', '24 ms', 'hit', 'idx_events_tenant_created'],
          ['tr-8846', 'globex', 'events_for', '—', 'not reported', 'not reported']
        ],
        note:'The last row is genuinely missing, not zero. It renders as "not reported".' } },

    { id:'architecture-map', kind:'architecture', title:'Puppet Master Host Map',
      summary:'Interactive map of server, execution hosts, clients, providers, and editor routes.',
      status:'ready', version:3, updated:'23m ago', updatedAt:at(517), createdAt:at(120),
      threadId:'subagents', projectPath:'docs/diagrams/hosts.json', openTarget:'editor', error:null,
      payload:{ nodes:[
        { id:'server', label:'Puppet Master server', role:'server', host:'TrueNAS Docker' },
        { id:'win', label:'Windows execution host', role:'host', host:'windows-native' },
        { id:'wsl', label:'Windows WSL host', role:'host', host:'windows-wsl' },
        { id:'linux', label:'Linux container host', role:'host', host:'linux-container' },
        { id:'client-a', label:'Desktop client', role:'client', host:'macOS' },
        { id:'anthropic', label:'Anthropic', role:'provider', host:'2 accounts' },
        { id:'alibaba', label:'Alibaba', role:'provider', host:'2 accounts' }
      ], edges:[
        ['client-a', 'server'], ['server', 'win'], ['server', 'wsl'], ['server', 'linux'],
        ['server', 'anthropic'], ['server', 'alibaba']
      ] } },

    { id:'report-query', kind:'document', title:'Query Optimization Report',
      summary:'A durable report with findings, changes, benchmark evidence, risks, and rollback.',
      status:'stale', version:2, updated:'46m ago', updatedAt:at(494), createdAt:at(64),
      threadId:'query', projectPath:'docs/query-performance.md', openTarget:'editor',
      error:null, staleReason:'Written before revision 4 split the concurrent index into its own migration.',
      payload:{ sections:['Findings', 'Changes', 'Benchmark evidence', 'Risks', 'Rollback'],
        wordCount:1840, lastAuthor:'Claude Opus 5' } },

    { id:'flow-plan', kind:'flowchart', title:'Plan Approval Flow',
      summary:'Interactive flowchart for approve, revise, cancel, later build, and branch behavior.',
      status:'ready', version:2, updated:'52m ago', updatedAt:at(488), createdAt:at(70),
      threadId:'plan-deep', projectPath:'docs/diagrams/plan-approval.json', openTarget:'editor', error:null,
      payload:{ nodes:[
        { id:'draft', label:'Plan drafted' }, { id:'review', label:'Awaiting review' },
        { id:'revise', label:'Revision requested' }, { id:'approved', label:'Approved' },
        { id:'build', label:'Building' }, { id:'later', label:'Approved, build later' },
        { id:'cancel', label:'Cancelled' }
      ], edges:[
        ['draft', 'review'], ['review', 'revise'], ['revise', 'review'],
        ['review', 'approved'], ['approved', 'build'], ['approved', 'later'],
        ['later', 'build'], ['review', 'cancel']
      ] } },

    { id:'chart-cost', kind:'chart', title:'Provider Cost and Latency',
      summary:'Interactive cost, plan estimate, cache, and latency chart across configured accounts.',
      status:'ready', version:2, updated:'1h ago', updatedAt:at(478), createdAt:at(56),
      threadId:'route', projectPath:'artifacts/provider-cost.json', openTarget:'editor', error:null,
      payload:{ metric:'Cost per 1M output tokens', unit:'USD',
        series:[
          { label:'Claude Sonnet 4.6', value:15 }, { label:'Claude Opus 5', value:75 },
          { label:'Qwen 3.8', value:2.2 }, { label:'Kimi K3', value:2.5 },
          { label:'GLM 5.2', value:1.9 }, { label:'Cursor Auto', value:null }
        ],
        note:'Cursor Auto bills against a seat, not per token: the value is unknown, not zero.' } },

    { id:'quiz-indexes', kind:'quiz', title:'Index Strategy Quiz',
      summary:'A short interactive quiz covering leading columns, selectivity, and write cost.',
      status:'ready', version:1, updated:'1h ago', updatedAt:at(472), createdAt:at(40),
      threadId:'query', projectPath:'artifacts/index-quiz.json', openTarget:'editor', error:null,
      payload:{ questions:[
        { q:'Which column leads the composite index?', a:'tenant_id', why:'Every analytics read is tenant-scoped, so it is the highest-selectivity equality predicate.' },
        { q:'What does CONCURRENTLY cost?', a:'Two table passes and no transaction block', why:'That is why the migration is split into its own file.' },
        { q:'What is the write cost of this index?', a:'+4.8%', why:'Measured, not estimated, on the corrected 128,400-row fixture.' }
      ] } },

    { id:'periodic-capabilities', kind:'periodic', title:'Agent Capability Matrix',
      summary:'Periodic-table-inspired explorer for models, tools, specialties, cost, and qualification.',
      status:'ready', version:3, updated:'2h ago', updatedAt:at(420), createdAt:at(30),
      threadId:'subagents', projectPath:'artifacts/capability-matrix.json', openTarget:'editor', error:null,
      payload:{ columns:['Model', 'Tools', 'Specialty', 'Cost tier', 'Qualified'],
        rows:[
          ['Claude Sonnet 4.6', '14', 'Implementation', 'Mid', 'yes'],
          ['Claude Opus 5', '14', 'Review and planning', 'High', 'yes'],
          ['Qwen 3.8', '11', 'Bulk refactor', 'Low', 'yes'],
          ['Kimi K3', '11', 'Browser control', 'Low', 'yes'],
          ['GLM 5.2', '9', 'Summarization', 'Low', 'conditional'],
          ['Cursor Auto', '6', 'Inline edits', 'Seat', 'no']
        ] } },

    { id:'generated-image', kind:'image', title:'Generated Operations Console',
      summary:'Generated interface image shown compactly in chat and at full size in the editor.',
      status:'ready', version:1, updated:'2h ago', updatedAt:at(408), createdAt:at(28),
      threadId:'visuals', projectPath:'artifacts/ops-console.png', openTarget:'editor', error:null,
      payload:{ width:1280, height:720, alt:'A drawn operations console with a run list, a host panel, and a receipt column.' } },

    { id:'transcript-summary', kind:'document', title:'Design Discussion Summary',
      summary:'A rolling summary of the long product-design thread, regenerated after each material turn.',
      status:'ready', version:7, updated:'3h ago', updatedAt:at(360), createdAt:at(20),
      threadId:'plain', projectPath:'docs/notes/design-discussion.md', openTarget:'editor', error:null,
      payload:{ sections:['What was decided', 'What is still open', 'What was rejected and why'],
        wordCount:620, lastAuthor:'Claude Sonnet 4.6' } },

    { id:'lens-receipt', kind:'evidence', title:'Context Lens Operation Receipts',
      summary:'Every Mute, Focus, and Subcompact operation with its cap, its sources, and its rehydration handle.',
      status:'ready', version:3, updated:'4h ago', updatedAt:at(300), createdAt:at(44),
      threadId:'context', projectPath:'verification/lens-operations.json', openTarget:'editor', error:null,
      payload:{ gates:[
        { name:'Operations under the 25-message cap', passed:3, total:3 },
        { name:'Rehydration handles present', passed:3, total:3 },
        { name:'Provenance retained', passed:3, total:3 }
      ], log:[
        'Focus applied to 6 messages · cap 25 · operation 1',
        'Mute applied to 11 messages · cap 25 · operation 2',
        'Subcompact applied to 9 messages · cap 25 · operation 3 · summary card written'
      ] } },

    { id:'crew-board', kind:'dashboard', title:'Crew Assignment Board',
      summary:'Role assignment, wait states, and handoff receipts for the active crew.',
      status:'stale', version:2, updated:'5h ago', updatedAt:at(240), createdAt:at(60),
      threadId:'crew', projectPath:'artifacts/crew-board.json', openTarget:'editor',
      error:null, staleReason:'The reviewer role was reassigned after this board was written.',
      payload:{ metric:'Crew utilisation', unit:'%',
        series:[
          { label:'Planner', value:100 }, { label:'Implementer', value:82 },
          { label:'Reviewer', value:0 }, { label:'Browser auditor', value:44 }
        ] } },

    { id:'broken-viz', kind:'dashboard', title:'Usage Projection Dashboard',
      summary:'A recoverable renderer failure fixture with source fallback and retry.',
      status:'error', version:1, updated:'6h ago', updatedAt:at(180), createdAt:at(18),
      threadId:'artifact-error', projectPath:'artifacts/usage-projection.json', openTarget:'editor',
      error:{ reason:'The renderer received a series with 0 points and refused to draw an empty chart.',
              recoverable:true, retryLabel:'Retry render', fallback:'source',
              detail:'The source is intact; only the render failed. Retrying re-reads the same source.' },
      payload:{ metric:'Projected monthly usage', unit:'tokens', series:[] } },

    { id:'chart-latency', kind:'chart', title:'Route Latency Comparison',
      summary:'Per-account latency across configured routes; fails on first render and recovers on retry.',
      status:'error', version:2, updated:'7h ago', updatedAt:at(120), createdAt:at(22),
      threadId:'route', projectPath:'artifacts/route-latency.json', openTarget:'editor',
      error:{ reason:'Two accounts expose the same model name, so the previous renderer collapsed them into one series.',
              recoverable:true, retryLabel:'Retry with account keys', fallback:'source',
              detail:'Retry keys the series on provider:account instead of the model name.' },
      payload:{ metric:'First-token latency', unit:'ms',
        series:[
          { label:'Anthropic · Work', value:410 }, { label:'Anthropic · Personal', value:520 },
          { label:'Alibaba · Coding Plan', value:280 }, { label:'Alibaba · Team', value:310 },
          { label:'Moonshot · Kimi Coding', value:265 }
        ] } }
  ];


  /* =====================================================================
     subagents[] -- 5 -> 14 across 3 groups.

     Four renderers used to disagree about this collection because each
     counted it differently. They now all read `activityDefs()`, and the
     group records below carry PRECOMPUTED status counts so no renderer
     has to derive them a fifth way.

     Three fields added:
       * `route` -- {provider, account, model, label}. The FIXTURE_SCHEMA
         draft had this as a bare string; the object is shipped because a
         child agent can run on a different ACCOUNT of the same provider
         as its parent, and a string cannot express that. `route.label` is
         the string form for anything that just wants to print it.
       * `parentThreadId` -- a real id in `threads`. The old `parent` field
         held a thread TITLE, and three of the five named threads that do
         not exist. `parent` is kept as the display title only.
       * `counts` -- per-agent tool/file/test totals.

     Statuses cover the whole enum, including the four never exercised
     before: queued, failed, retrying, fallback. No agent has fewer than
     four transcript messages; Query Analyzer has thirteen.
     ===================================================================== */
  const agentRoute = (k) => ({ provider:ROUTES[k].provider, account:ROUTES[k].account, model:ROUTES[k].model, modelId:ROUTES[k].modelId, label:`${ROUTES[k].provider} · ${ROUTES[k].account.split(' · ')[0]}` });

  const subagents = [
    /* ---- group: analysis (parent thread `query`) ---------------------- */
    { id:'agent-query', name:'Query Analyzer', model:'Claude Sonnet 4.6', status:'working',
      elapsed:'2m 06s', startedAt:at(414), progress:68, group:'analysis',
      parent:'Query Performance', parentThreadId:'query', route:agentRoute('sonnet'),
      current:'Benchmarking tenant-scoped query alternatives', blocker:'',
      counts:{ tools:14, files:9, tests:42, tokens:184200 },
      messages:turns('agent-query', { route:'sonnet', startMin:414, mode:'agent', persona:'Systems Analyst', contextStart:14200 }, [
        ['a','I have the read path isolated. Three queries do a full table scan and two of them are inside a per-tenant loop, so the cost scales with tenant count rather than with the page size.'],
        ['e','agent-work',{ title:'Read src/analytics/queries.rs', detail:'Found three full table scans and two N+1 patterns at lines 128 and 196.' }],
        ['a','The composite index is the safer first step. A materialized view would also work but it adds refresh lag and a second piece of operational state, and the read win is available without it.'],
        ['a','Column order matters more than I expected here. tenant_id has to lead: every read is tenant-scoped, so it is the highest-selectivity equality predicate, and created_at then serves both the range filter and the ORDER BY without a sort node.'],
        ['e','agent-work',{ title:'Ran EXPLAIN ANALYZE on the candidate index', detail:'Planner switches from Seq Scan to Index Scan using idx_events_tenant_created.' }],
        ['a','Baseline is worse than the ticket said. p95 is 482 ms, not 310 ms — the ticket measured against the old 8x400 benchmark fixture, which is small enough that a sequential scan actually wins.'],
        ['e','agent-work',{ title:'Regenerated the benchmark fixture', detail:'214 tenants x 600 events = 128,400 rows, matching production row shape.' }],
        ['a','With the corrected fixture: p95 482 ms to 71 ms, p50 118 ms to 24 ms. Throughput goes from 1,420 to 3,980 rows per second.'],
        ['a','The honest cost is on the write side. Inserts are 4.8% slower with the extra index, measured over 50,000 inserts. That is worth stating next to the read win rather than only reporting the improvement.'],
        ['e','agent-work',{ title:'Checked write amplification', detail:'+4.8% insert cost across 50,000 inserts; no change to the p99 tail.' }],
        ['a','One caveat for the migration: CREATE INDEX CONCURRENTLY takes two table passes and cannot run inside a transaction block, so it has to be its own migration file rather than part of the batch.'],
        ['a','I also want to say what I did not test. I have not measured this under concurrent write load, and I have not checked whether the index survives a statistics refresh with the current autovacuum settings. Both are cheap to check and both are ways this quietly regresses later, so I would rather flag them than let the benchmark read as more complete than it is.', { long:true }],
        ['e','agent-work',{ title:'Handed the benchmark artifact to the parent', detail:'dashboard-query version 6 · read win and write cost recorded together.' }]
      ]) },

    { id:'agent-schema', name:'Schema Reviewer', model:'Qwen 3.8', status:'blocked',
      elapsed:'1m 41s', startedAt:at(419), progress:42, group:'analysis',
      parent:'Query Performance', parentThreadId:'query', route:agentRoute('qwen'),
      current:'Waiting for explicit schema-change approval',
      blocker:'Production schema modification requires an explicit user override.',
      counts:{ tools:6, files:4, tests:0, tokens:61400 },
      messages:turns('agent-schema', { route:'qwen', startMin:419, mode:'ask', persona:'Database Reviewer', contextStart:9200 }, [
        ['e','agent-work',{ title:'Read src/analytics/schema.rs', detail:'Identified three denormalization candidates and one unused foreign key.' }],
        ['a','The payload column is the real weight here: unbounded JSON is 61% of the average row width, which is why the sequential scan was so expensive in the first place.'],
        ['a','Dropping events_hourly_fk is safe — nothing references the rollup table any more once the composite index lands. Partitioning on created_at is the larger change and should not ride along with this one.'],
        ['e','blocked',{ title:'Policy denial', detail:'Production schema modification requires an explicit user override. I stopped before the ALTER rather than asking for forgiveness.' }],
        ['a','I am stopping here rather than proposing a workaround. The next safe action is a user decision on whether the payload bound applies to existing rows or only to new writes; I cannot make that call from inside a read-only review.']
      ]) },

    { id:'agent-bench', name:'Benchmark Runner', model:'Kimi K3', status:'queued',
      elapsed:'0s', startedAt:null, progress:0, group:'analysis',
      parent:'Query Performance', parentThreadId:'query', route:agentRoute('kimi'),
      current:'Queued behind the fixture rebuild', blocker:'',
      counts:{ tools:0, files:0, tests:0, tokens:0 },
      queued:{ position:1, reason:'The 128,400-row fixture is still being generated by Query Analyzer.', since:at(508) },
      messages:turns('agent-bench', { route:'kimi', startMin:508, mode:'agent', persona:'Benchmark Runner', contextStart:3200 }, [
        ['e','waiting',{ title:'Queued', detail:'Position 1 · waiting on the fixture rebuild before any measurement is meaningful.' }],
        ['a','I am not going to run against the old fixture just to have a number. An 8x400 fixture makes a sequential scan look competitive, which is exactly the measurement error that produced the original ticket.'],
        ['a','Plan once the fixture lands: three cold runs, three warm runs, and a separate insert benchmark so the write cost is measured rather than inferred.'],
        ['e','waiting',{ title:'Still queued', detail:'No work started · no tokens spent · nothing to report yet.' }]
      ]) },

    { id:'agent-migration', name:'Migration Auditor', model:'Claude Opus 5', status:'complete',
      elapsed:'4m 22s', startedAt:at(392), completedAt:at(396), progress:100, group:'analysis',
      parent:'Query Performance', parentThreadId:'query', route:agentRoute('opus'),
      current:'Completed with one required change', blocker:'',
      counts:{ tools:9, files:6, tests:12, tokens:142800 },
      messages:turns('agent-migration', { route:'opus', startMin:392, mode:'agent', persona:'Migration Auditor', contextStart:11800 }, [
        ['a','I read every migration from 0038 forward. The batch pattern this repository uses wraps each file in a transaction, which is incompatible with CREATE INDEX CONCURRENTLY.'],
        ['e','agent-work',{ title:'Read migrations/0038..0042', detail:'All five are transactional; none use CONCURRENTLY.' }],
        ['a','So 0043 has to be split out and marked no-transaction. That is the one required change, and it is a change to the migration harness expectation, not to the SQL.'],
        ['a','I also rehearsed the rollback. DROP INDEX CONCURRENTLY works and leaves the table readable throughout; the test now asserts both directions rather than only the forward one.'],
        ['e','agent-work',{ title:'Rollback rehearsed', detail:'apply -> assert index exists -> rollback -> assert index gone -> apply again. 12 assertions, all green.' }],
        ['a','Done. One required change, one test added, no open questions from my side.']
      ]) },

    { id:'agent-rollback', name:'Rollback Rehearser', model:'GLM 5.2', status:'retrying',
      elapsed:'1m 12s', startedAt:at(524), progress:34, group:'analysis',
      parent:'Query Performance', parentThreadId:'query', route:agentRoute('glm'),
      current:'Retrying after the execution host dropped the connection', blocker:'',
      counts:{ tools:4, files:2, tests:5, tokens:38400 },
      retry:{ attempt:2, of:3, lastError:'Execution host closed the stream during step 7.', nextAt:at(541), backoffMs:8000 },
      messages:turns('agent-rollback', { route:'glm', startMin:524, mode:'debug', persona:'Release Engineer', contextStart:7400 }, [
        ['a','Starting a second rollback rehearsal against a fresh database so the result is not contaminated by the first run.'],
        ['e','tool-error',{ title:'Execution host disconnected', detail:'The stream closed during step 7 of 11. Nothing was left half-applied: the migration harness rolls back on disconnect.' }],
        ['a','Attempt 1 failed at the host, not at the migration. I am retrying rather than reporting a rollback failure, because those are different findings and only one of them is about this change.'],
        ['e','waiting',{ title:'Backing off', detail:'Attempt 2 of 3 · 8s backoff · the host reconnected 4s ago.' }],
        ['a','Retry is under way from step 1, not from step 7 — resuming mid-migration would prove nothing about the rollback path.']
      ]) },

    /* ---- group: concept-review (parent thread `subagents`) ------------- */
    { id:'agent-motion', name:'Motion Reviewer', model:'Claude Opus 5', status:'working',
      elapsed:'48s', startedAt:at(531), progress:51, group:'concept-review',
      parent:'Runtime Architecture Review', parentThreadId:'subagents', route:agentRoute('opus'),
      current:'Reviewing popup spring timing and transform origins', blocker:'',
      counts:{ tools:7, files:11, tests:0, tokens:96400 },
      messages:turns('agent-motion', { route:'opus', startMin:531, mode:'agent', persona:'Motion Reviewer', contextStart:13600 }, [
        ['a','The sidecar should inherit the root menu direction and stay mounted while the pointer crosses the gap between the two. Unmounting on pointerleave is what makes the submenu feel like it is fighting the cursor.'],
        ['e','agent-work',{ title:'Measured the menu entrance', detail:'opacity 160ms, transform 300ms cubic-bezier(0.22,1.55,0.36,1) from scale3d(.72,.48,1).' }],
        ['a','The close is asymmetric on purpose: 220ms transform with the fade delayed to 45ms at 175ms, so the box stays opaque through most of the collapse. That is what reads as a spring rather than a fade-out.'],
        ['a','One thing to watch: animation-fill-mode both beats a declared value. Every new looping animation also has to be added to the reduced-motion stop list or it runs forever, which is the trap this codebase has already fallen into twice.'],
        ['e','agent-work',{ title:'Checked the reduced-motion sweep', detail:'13 infinite animations normally, 0 under reduce. The working sequence still advances in both modes.' }]
      ]) },

    { id:'agent-test', name:'Browser Auditor', model:'Kimi K3', status:'waiting',
      elapsed:'36s', startedAt:at(533), progress:28, group:'concept-review',
      parent:'Runtime Architecture Review', parentThreadId:'subagents', route:agentRoute('kimi'),
      current:'Waiting for the current render pass to settle',
      blocker:'Parent render still changing.',
      counts:{ tools:3, files:0, tests:0, tokens:22800 },
      messages:turns('agent-test', { route:'kimi', startMin:533, mode:'agent', persona:'Browser Auditor', contextStart:6100 }, [
        ['e','waiting',{ title:'Waiting for parent', detail:'The visual baseline must stabilise before any screenshot comparison is meaningful.' }],
        ['a','I can see the parent re-rendering on the 2s work tick. Comparing screenshots across a tick would produce a diff on every run and tell us nothing.'],
        ['a','I will take the baseline once two consecutive frames are identical. That is a cheap check and it removes the whole class of flaky visual failures.'],
        ['e','waiting',{ title:'Two frames still differ', detail:'Frame delta 0.4% · the working card phase trail is mid-transition.' }]
      ]) },

    { id:'agent-tokens', name:'Token Harvester', model:'Qwen 3.8', status:'complete',
      elapsed:'2m 48s', startedAt:at(486), completedAt:at(489), progress:100, group:'concept-review',
      parent:'Runtime Architecture Review', parentThreadId:'subagents', route:agentRoute('qwen'),
      current:'Completed the emitted-class harvest', blocker:'',
      counts:{ tools:5, files:41, tests:0, tokens:210400 },
      messages:turns('agent-tokens', { route:'qwen', startMin:486, mode:'agent', persona:'Static Analyst', contextStart:15400 }, [
        ['a','Static extraction over every class attribute, classList call and className assignment gives 480 tokens. A runtime MutationObserver harvest across the themes and recipes gives 499.'],
        ['e','agent-work',{ title:'Union computed', detail:'554 live class names and 7 ids. Neither method alone is sufficient: interpolated names only appear at runtime, and conditionally-rendered ones only appear statically.' }],
        ['a','That union is what an orphan gate has to be measured against. A naive grep produces 19 false positives from interpolation alone, which is how a stylesheet accumulates rules for components that were never built.'],
        ['a','Handing over the union set. The gate should run after every wave, not once.'],
        ['e','agent-work',{ title:'Harvest written', detail:'classes.json and harvest.json · 554 names · reproducible from either side.' }]
      ]) },

    { id:'agent-orphan', name:'Orphan Gate', model:'GLM 5.2', status:'failed',
      elapsed:'22s', startedAt:at(536), completedAt:at(536), progress:12, group:'concept-review',
      parent:'Runtime Architecture Review', parentThreadId:'subagents', route:agentRoute('glm'),
      current:'Failed: the gate ran before the harvest was published', blocker:'',
      counts:{ tools:2, files:1, tests:0, tokens:9400 },
      failure:{ reason:'Read classes.json before Token Harvester finished writing it, so the union was empty and every selector looked like an orphan.',
                recoverable:true, retryLabel:'Re-run after the harvest', class:'ordering' },
      messages:turns('agent-orphan', { route:'glm', startMin:536, mode:'agent', persona:'Static Analyst', contextStart:4200 }, [
        ['a','Running the orphan gate over styles.css against the harvested class union.'],
        ['e','tool-error',{ title:'Empty union', detail:'classes.json parsed to 0 names. Every one of the 554 selectors would be reported as an orphan.' }],
        ['a','I am failing rather than reporting 554 orphans. A gate that reports everything as broken is not a finding, it is a bug in the gate, and shipping that number would have wasted a whole review cycle.'],
        ['e','tool-error',{ title:'Gate aborted', detail:'Ordering failure, not a stylesheet failure. Re-run after Token Harvester completes.' }]
      ]) },

    { id:'agent-theme', name:'Theme Sweeper', model:'Claude Sonnet 4.6', status:'working',
      elapsed:'1m 04s', startedAt:at(529), progress:62, group:'concept-review',
      parent:'Runtime Architecture Review', parentThreadId:'subagents', route:agentRoute('sonnetPer'),
      current:'Sweeping eight themes for overflow and contrast', blocker:'',
      counts:{ tools:8, files:0, tests:24, tokens:71200 },
      messages:turns('agent-theme', { route:'sonnetPer', startMin:529, mode:'agent', persona:'Visual QA', contextStart:8800 }, [
        ['a','Six of eight themes are clean. Retro Light has one contrast failure on the subtle text token and Glass Dark has a 1px horizontal overflow at 700px that only appears with the activity panel pinned.'],
        ['e','agent-work',{ title:'Swept 8 themes at 4 viewports', detail:'32 combinations · 24 assertions each · zero console errors.' }],
        ['a','The overflow is the resizer, not the panel: it is 6px wide with a 3px negative margin and no min-width:0 on its flex parent.'],
        ['a','I am running this account rather than the work one because the work account is close to its five-hour cap and I did not want a theme sweep to be the thing that exhausts it.'],
        ['e','agent-work',{ title:'Contrast measured', detail:'Retro Light subtle text 3.9:1 against the raised surface. The bar is 4.5:1.' }]
      ]) },

    /* ---- group: verification (parent thread `debug`) ------------------- */
    { id:'agent-plan', name:'Plan Critic', model:'Claude Opus 5', status:'complete',
      elapsed:'3m 12s', startedAt:at(470), completedAt:at(473), progress:100, group:'verification',
      parent:'Browser Debug Session', parentThreadId:'debug', route:agentRoute('opus'),
      current:'Completed with three revision notes', blocker:'',
      counts:{ tools:6, files:3, tests:0, tokens:118400 },
      messages:turns('agent-plan', { route:'opus', startMin:470, mode:'plan', persona:'Plan Critic', contextStart:12200 }, [
        ['a','Three things the plan needs before it is approvable: an explicit rollback gate, a stated write-amplification threshold, and a named owner for the benchmark evidence.'],
        ['a','The rollback gate is the important one. The plan currently says the change is reversible without saying who proves it or when, and "reversible in principle" is how an irreversible migration ships.'],
        ['e','agent-work',{ title:'Read the plan document', detail:'Revision 3 · 6-step sequence · 4 acceptance criteria · no rollback owner.' }],
        ['a','The write-amplification threshold matters because the plan reports an 86% read win with no ceiling on the write cost. Without a number, any write regression can be argued as acceptable after the fact.'],
        ['a','Critique complete. None of the three is a reason to reject the approach; all three are reasons not to approve the plan as written.']
      ]) },

    { id:'agent-probe', name:'Probe Runner', model:'Kimi K3', status:'working',
      elapsed:'55s', startedAt:at(532), progress:73, group:'verification',
      parent:'Browser Debug Session', parentThreadId:'debug', route:agentRoute('kimi'),
      current:'Replacing bounding-box assertions with painted-pixel ones', blocker:'',
      counts:{ tools:11, files:2, tests:31, tokens:88600 },
      messages:turns('agent-probe', { route:'kimi', startMin:532, mode:'debug', persona:'Browser Auditor', contextStart:9600 }, [
        ['a','The old probe returned true for anything with a non-zero bounding box, which includes elements that are clipped, occluded, or mid-transition. That is how three fixes passed while being invisible on screen.'],
        ['e','agent-work',{ title:'Rewrote probeVisible', detail:'elementFromPoint at the centre, then a distinct-colour count over a screenshot crop.' }],
        ['a','Distinct-colour count rather than mean luminance, because a solid placeholder box has a perfectly reasonable mean and exactly one colour.'],
        ['a','The hover probe is now a pair rather than a single assertion: absent at rest AND present on hover. Asserting only the second half passes on an element that was never hidden.'],
        ['e','agent-work',{ title:'31 probes converted', detail:'+31 −10 in verification/interaction-probes.mjs.' }]
      ]) },

    { id:'agent-fallback', name:'Fallback Router', model:'Qwen 3.8', status:'fallback',
      elapsed:'2m 31s', startedAt:at(496), progress:58, group:'verification',
      parent:'Browser Debug Session', parentThreadId:'debug', route:agentRoute('qwen'),
      current:'Running on the fallback account after the primary hit its quota', blocker:'',
      counts:{ tools:5, files:1, tests:8, tokens:64200 },
      fallback:{ from:'Anthropic · Work · anthropic-work', to:'Alibaba · Coding Plan · qwen-coder',
                 reason:'quota-exhausted', at:at(508), userVisible:true,
                 note:'The route changed inside a running turn, so the receipt says which account produced which part of the answer.' },
      messages:turns('agent-fallback', { route:'sonnet', startMin:496, mode:'agent', persona:'Release Engineer', contextStart:10400 }, [
        ['a','Started on the work Anthropic account. Collecting the console and network evidence for the intermittent blank dashboard.'],
        ['e','route-change',{ title:'Route changed mid-turn', detail:'Anthropic · Work reached its five-hour cap. Continued on Alibaba · Coding Plan rather than stopping the turn.' }],
        ['a','Continuing on the fallback account. Flagging it rather than hiding it: half of this transcript was produced by a different model, and a reader comparing the two halves deserves to know that.', { route:'qwen' }],
        ['a','The blank dashboard reproduces once in roughly forty loads, always after a route change. That is a strong hint that the renderer keys its cache on the model name, which is not unique once a provider has two accounts.'],
        ['e','agent-work',{ title:'Reproduced 3 times in 118 loads', detail:'All three followed a route change. None occurred on a stable route.' }]
      ]) },

    { id:'agent-evidence', name:'Evidence Collator', model:'GLM 5.2', status:'queued',
      elapsed:'0s', startedAt:null, progress:0, group:'verification',
      parent:'Browser Debug Session', parentThreadId:'debug', route:agentRoute('glm'),
      current:'Queued until the probe conversion lands', blocker:'',
      counts:{ tools:0, files:0, tests:0, tokens:0 },
      queued:{ position:2, reason:'Collating evidence from a probe suite that is still being rewritten would index the old assertions.', since:at(534) },
      messages:turns('agent-evidence', { route:'glm', startMin:534, mode:'agent', persona:'Evidence Collator', contextStart:2800 }, [
        ['e','waiting',{ title:'Queued', detail:'Position 2 · behind Probe Runner.' }],
        ['a','There is no point collating evidence against a probe suite that is mid-rewrite; the index would point at assertions that are about to stop existing.'],
        ['a','When it lands I need three things per gate: the assertion, the artefact it produced, and the run it came from. A gate without a run id is a claim, not evidence.'],
        ['e','waiting',{ title:'Still queued', detail:'No tokens spent.' }]
      ]) }
  ];

  /* Precomputed per-group status counts. The brief for this wave calls
     these out specifically: four renderers previously each derived their
     own subagent count and all four disagreed. */
  const SUBAGENT_STATUSES = ['working', 'complete', 'blocked', 'waiting', 'queued', 'failed', 'retrying', 'fallback'];
  const subagentGroups = [
    { id:'analysis', label:'Query analysis', parentThreadId:'query', summary:'Five child agents on the analytics read path.' },
    { id:'concept-review', label:'Concept review', parentThreadId:'subagents', summary:'Five child agents reviewing motion, tokens and themes.' },
    { id:'verification', label:'Verification', parentThreadId:'debug', summary:'Four child agents on probes, plan critique and evidence.' }
  ].map((g) => {
    const members = subagents.filter((a) => a.group === g.id);
    const counts = { total: members.length };
    for (const s of SUBAGENT_STATUSES) counts[s] = members.filter((a) => a.status === s).length;
    return { ...g, counts, agentIds: members.map((a) => a.id) };
  });


  /* =====================================================================
     todos[] -- 8 -> 20 across four sources.

     The old fixture used `done` / `doing` / `next`, which the panel
     printed VERBATIM as user-facing copy. Status is now the canonical
     enum -- pending | in_progress | completed | blocked | skipped, plus
     verifying and replanned -- and every record carries a `statusLabel`
     so no raw enum value can reach the screen. `labels.todoStatus` is the
     same map for anything that only has the enum in hand.

     Three fields added: `order_index` (stable ordering that survives a
     replan), `dependencies` (todo ids that must finish first), and
     `goalPhaseId`.

     GOAL LINKAGE: the join is a foreign key ON THE TODO and nowhere else.
     `goalPhaseId` records the goal phase that was current when the todo
     was written; the goal never reads the todo store, and a phase never
     advances because its todos are checked. Goals 3 and 4 have
     `goalId:null` on purpose, so the Todo panel is proven to render with
     no goal at all. The `goal` record itself is authored by the Wave 2
     Goals agent in goals.js, not here.
     ===================================================================== */
  const todo = (o) => ({ blocker:null, dependencies:[], goalId:null, goalPhaseId:null, ...o, statusLabel:labels.todoStatus[o.status] });

  const todos = [
    todo({ id:'t1', order_index:1, label:'Measure the current tenant-scoped query path', status:'completed',
      source:'Goal 1', goalId:'goal-query-perf', goalPhaseId:'ph-audit', updatedAt:at(96),
      note:'Baseline recorded at p95 482 ms against the corrected 128,400-row fixture.' }),
    todo({ id:'t2', order_index:2, label:'Correct the benchmark fixture to production row shape', status:'completed',
      source:'Goal 1', goalId:'goal-query-perf', goalPhaseId:'ph-audit', updatedAt:at(120),
      dependencies:['t1'], note:'The old 8x400 fixture was small enough that a sequential scan won.' }),
    todo({ id:'t3', order_index:3, label:'Compare composite index column order', status:'completed',
      source:'Goal 1', goalId:'goal-query-perf', goalPhaseId:'ph-research', updatedAt:at(214),
      dependencies:['t2'], note:'tenant_id leads; created_at serves both the range filter and the sort.' }),
    todo({ id:'t4', order_index:4, label:'Inspect write amplification', status:'in_progress',
      source:'Goal 1', goalId:'goal-query-perf', goalPhaseId:'ph-proto', updatedAt:at(508),
      dependencies:['t3'] }),
    todo({ id:'t5', order_index:5, label:'Check the index under concurrent write load', status:'pending',
      source:'Goal 1', goalId:'goal-query-perf', goalPhaseId:'ph-proto', updatedAt:at(510),
      dependencies:['t4'], note:'Named explicitly because it is the measurement the benchmark does not cover.' }),

    todo({ id:'t6', order_index:6, label:'Remove the N+1 query fan-out', status:'completed',
      source:'Goal 2', goalId:'goal-query-perf', goalPhaseId:'ph-implement', updatedAt:at(452),
      dependencies:['t3'] }),
    todo({ id:'t7', order_index:7, label:'Split the concurrent index into its own migration', status:'completed',
      source:'Goal 2', goalId:'goal-query-perf', goalPhaseId:'ph-implement', updatedAt:at(506),
      dependencies:['t6'], note:'CREATE INDEX CONCURRENTLY cannot run inside a transaction block.' }),
    todo({ id:'t8', order_index:8, label:'Add the planner-choice guard test', status:'verifying',
      source:'Goal 2', goalId:'goal-query-perf', goalPhaseId:'ph-implement', updatedAt:at(520),
      dependencies:['t7'], note:'Written and passing locally; waiting on a clean CI run before it counts.' }),
    todo({ id:'t9', order_index:9, label:'Bound the event payload column', status:'blocked',
      source:'Goal 2', goalId:'goal-query-perf', goalPhaseId:'ph-implement', updatedAt:at(419),
      dependencies:['t7'], blocker:'Production schema modification requires an explicit user override.' }),
    todo({ id:'t10', order_index:10, label:'Drop the unused events_hourly foreign key', status:'blocked',
      source:'Goal 2', goalId:'goal-query-perf', goalPhaseId:'ph-implement', updatedAt:at(419),
      dependencies:['t9'], blocker:'Same schema approval as the payload bound; both wait on one decision.' }),

    todo({ id:'t11', order_index:11, label:'Rehearse the rollback before the forward migration ships', status:'in_progress',
      source:'Goal 3', goalId:null, goalPhaseId:null, updatedAt:at(524),
      note:'Independent of the goal: this is release hygiene, not part of the objective.' }),
    todo({ id:'t12', order_index:12, label:'Run the browser and integration suites', status:'blocked',
      source:'Goal 3', goalId:null, goalPhaseId:null, updatedAt:at(486),
      dependencies:['t11'], blocker:'Awaiting the migration choice; the suite asserts the final schema.' }),
    todo({ id:'t13', order_index:13, label:'Render the benchmark comparison artifact', status:'completed',
      source:'Goal 3', goalId:null, goalPhaseId:null, updatedAt:at(539), dependencies:['t4'] }),
    todo({ id:'t14', order_index:14, label:'Record the write cost beside the read win in the report', status:'replanned',
      source:'Goal 3', goalId:null, goalPhaseId:null, updatedAt:at(494),
      note:'Rewritten after revision 4: the report was going to state the 86% read win alone, which flatters the change.' }),
    todo({ id:'t15', order_index:15, label:'Publish the trace explorer for the intermittent blank dashboard', status:'pending',
      source:'Goal 3', goalId:null, goalPhaseId:null, updatedAt:at(523), dependencies:['t13'] }),

    todo({ id:'t16', order_index:16, label:'Review the rollback procedure with the release owner', status:'skipped',
      source:'Goal 4', goalId:null, goalPhaseId:null, updatedAt:at(300),
      note:'Skipped deliberately: the release owner is on leave and the rehearsal covers the same ground.' }),
    todo({ id:'t17', order_index:17, label:'Open a pull request', status:'pending',
      source:'Goal 4', goalId:null, goalPhaseId:null, updatedAt:at(300), dependencies:['t8','t12'] }),
    todo({ id:'t18', order_index:18, label:'Write the operational runbook entry', status:'pending',
      source:'Goal 4', goalId:null, goalPhaseId:null, updatedAt:at(302), dependencies:['t17'] }),
    todo({ id:'t19', order_index:19, label:'Retire the legacy hourly rollup job', status:'pending',
      source:'Goal 4', goalId:null, goalPhaseId:null, updatedAt:at(304), dependencies:['t17'],
      note:'The table is already deleted in the working tree; the scheduled job is separate.' }),
    todo({ id:'t20', order_index:20, label:'Schedule the nine-day retention sweep', status:'skipped',
      source:'Goal 4', goalId:null, goalPhaseId:null, updatedAt:at(306),
      note:'Skipped here because retention is owned by the platform rota, not by this change.' })
  ];


  /* =====================================================================
     contextSources[] + contextWindow -- absent before this wave.

     Every context figure in app.js was a literal: `64%`, `83.9K`, `78%`,
     `47.1K`, five hardcoded composition percentages with no token counts,
     and a growth chart drawn from two bare <path> elements. All of it now
     comes from here.

     Two rules the sibling concepts enforce and this fixture keeps:
       * `tokens` is an INTEGER count and is authoritative. `pct` is
         derived display sugar; where the two disagree, tokens wins.
       * segment colour is keyed to the FAMILY NAME, never to the array
         index, so a family keeps its colour between threads even when a
         thread has a different mix.

     The record differs per thread: `contextByThread` is keyed by thread
     id, and `D.contextSources` / `D.contextWindow` are the ACTIVE-thread
     view (thread `query`) for renderers that want the flat shape. A
     renderer that wants the current thread should read
     `contextByThread[threadId] || {sources: contextSources, window: contextWindow}`.

     Consumed by the Wave 3 Context agent (item 6). See DATA_HANDOFF.md.
     ===================================================================== */
  const CONTEXT_FAMILIES = {
    conversation: { family:'Conversation',              colour:'var(--accent)' },
    plans:        { family:'Plans and specifications',  colour:'var(--accent-2)' },
    files:        { family:'Files and code',            colour:'var(--positive)' },
    tools:        { family:'Tool and browser evidence', colour:'var(--warning)' },
    system:       { family:'System and provider',       colour:'var(--subtle)' },
    attachments:  { family:'Attachments and images',    colour:'var(--user)' }
  };

  /* mix: [familyId, tokens, superseded, detail] */
  function contextRecord(spec) {
    const used = spec.mix.reduce((s, m) => s + m[1], 0);
    const sources = spec.mix.map((m) => {
      const f = CONTEXT_FAMILIES[m[0]];
      return {
        id: m[0], family: f.family, colour: f.colour,
        tokens: m[1],
        pct: Math.round(m[1] / used * 1000) / 10,
        supersededTokens: m[2] || 0,
        detail: m[3]
      };
    });
    const cached = Math.round(used * spec.cacheHitPct / 100);
    return {
      threadId: spec.threadId,
      sources,
      window: {
        limit: spec.limit, used,
        cached, cacheHitPct: spec.cacheHitPct,
        available: spec.limit - used,
        pct: Math.round(used / spec.limit * 1000) / 10,
        inputThisTurn: spec.inputThisTurn, outputThisTurn: spec.outputThisTurn,
        product: 'Puppet Master Pro', connection: spec.connection,
        model: spec.model, account: spec.account,
        costApiUsd: spec.costApiUsd, costPlanUsd: spec.costPlanUsd,
        growth: spec.growth.map((g) => ({ at: at(g[0]), tokens: g[1] }))
      },
      compactionPreview: spec.compaction,
      /* u11's plan-limits block: product and connection meters with reset
         times. Invented for this concept, not ported. */
      limits: spec.limits
    };
  }

  const contextByThread = {};
  [
    { threadId:'query', limit:131000, cacheHitPct:78, inputThisTurn:12840, outputThisTurn:1486,
      connection:'anthropic-work', model:'Claude Sonnet 4.6', account:'Work · anthropic-work',
      costApiUsd:0.084, costPlanUsd:0.031,
      mix:[
        ['conversation', 28526, 0,    '18 turns in this thread, none superseded yet.'],
        ['plans',        18458, 4210, 'Plan revisions 1-3 are superseded by revision 4 and still loaded.'],
        ['files',        15102, 0,    '9 source files, 2 migrations, 1 benchmark fixture.'],
        ['tools',        11746, 1180, 'EXPLAIN ANALYZE output, 3 browser traces, 2 benchmark runs.'],
        ['system',        6068, 0,    'System prompt, tool definitions, provider policy.'],
        ['attachments',   4000, 0,    'One schema diagram, downsampled to 1024px.']
      ],
      growth:[[12,12400],[96,24800],[150,38200],[214,49600],[268,58400],[360,66900],[452,74100],[506,79200],[539,83900]],
      compaction:{ wouldRemove:18420, wouldRetain:65480, retains:['All active requirements','Every provenance handle','The current plan revision'],
        drops:['Plan revisions 1-3','Superseded browser traces','Duplicated file reads'],
        estimatedSeconds:9, reversible:true,
        note:'A source-aware compaction removes 18,420 tokens and leaves 65,480 loaded. Provenance handles survive so every dropped source can be rehydrated.' },
      limits:[
        { id:'session', label:'Session', used:64, resetAt:at(600), note:'Five-hour rolling window' },
        { id:'weekly', label:'Weekly', used:38, resetAt:at(6120), note:'Resets Monday 09:00 UTC' },
        { id:'output', label:'Output tokens', used:22, resetAt:at(600), note:'Per five-hour window' }
      ] },

    { threadId:'plain', limit:131000, cacheHitPct:91, inputThisTurn:3240, outputThisTurn:2180,
      connection:'anthropic-work', model:'Claude Sonnet 4.6', account:'Work · anthropic-work',
      costApiUsd:0.021, costPlanUsd:0.009,
      mix:[
        ['conversation', 41200, 0,   '26 prose turns; this thread is almost entirely conversation.'],
        ['plans',         2100, 0,   'One design note referenced twice.'],
        ['files',            0, 0,   'No files read in this thread.'],
        ['tools',            0, 0,   'No tools used in this thread.'],
        ['system',        6068, 0,   'System prompt, tool definitions, provider policy.'],
        ['attachments',      0, 0,   'None.']
      ],
      growth:[[20,4200],[60,9800],[140,18400],[240,27100],[340,35600],[440,43900],[500,47800],[539,49368]],
      compaction:{ wouldRemove:6100, wouldRetain:43268, retains:['Every decision and its reason','The rejected options and why'],
        drops:['Restatements of decisions already recorded'],
        estimatedSeconds:4, reversible:true,
        note:'A prose thread compacts poorly and this one is only 38% of the window, so compaction is offered but not recommended.' },
      limits:[
        { id:'session', label:'Session', used:64, resetAt:at(600), note:'Five-hour rolling window' },
        { id:'weekly', label:'Weekly', used:38, resetAt:at(6120), note:'Resets Monday 09:00 UTC' }
      ] },

    { threadId:'subagents', limit:196000, cacheHitPct:64, inputThisTurn:21400, outputThisTurn:980,
      connection:'anthropic-work', model:'Claude Opus 5', account:'Work · anthropic-work',
      costApiUsd:0.412, costPlanUsd:0.164,
      mix:[
        ['conversation', 19800, 0,     '14 parent turns.'],
        ['plans',         8400, 0,     'The concept plan and the fixture schema contract.'],
        ['files',        52600, 12400, '41 files harvested; 12,400 tokens are re-reads of files already in context.'],
        ['tools',        31200, 0,     'Class harvest, orphan gate output, theme sweep results.'],
        ['system',        9100, 0,     'Larger tool surface: 14 tools plus child-agent policy.'],
        ['attachments',      0, 0,     'None.']
      ],
      growth:[[120,18200],[200,38400],[300,61800],[400,88200],[470,104600],[510,114900],[539,121100]],
      compaction:{ wouldRemove:34800, wouldRetain:86300, retains:['The class union','Every gate result','Child-agent conclusions'],
        drops:['12,400 tokens of duplicate file reads','Intermediate harvest output superseded by the union'],
        estimatedSeconds:14, reversible:true,
        note:'This is the thread where compaction actually pays: 12,400 tokens are literal duplicate file reads.' },
      limits:[
        { id:'session', label:'Session', used:81, resetAt:at(600), note:'Five-hour rolling window · approaching the cap' },
        { id:'weekly', label:'Weekly', used:52, resetAt:at(6120), note:'Resets Monday 09:00 UTC' },
        { id:'opus', label:'Opus 5 share', used:74, resetAt:at(600), note:'Opus draws from the same session budget at 5x weight' }
      ] },

    { threadId:'debug', limit:200000, cacheHitPct:52, inputThisTurn:8600, outputThisTurn:640,
      connection:'kimi-main', model:'Kimi K3', account:'Kimi Coding · kimi-main',
      costApiUsd:0.032, costPlanUsd:0.011,
      mix:[
        ['conversation', 12400, 0,    '16 debugging turns, mostly short.'],
        ['plans',         1800, 0,    'The probe conversion note.'],
        ['files',        14900, 0,    'The probe suite and two renderers.'],
        ['tools',        48200, 9400, 'Console logs, network waterfalls, and 118 page loads of reproduction evidence.'],
        ['system',        7100, 0,    'Browser program tool definitions.'],
        ['attachments',  11600, 0,    'Six screenshots of the blank dashboard.']
      ],
      growth:[[196,14200],[260,32800],[330,51400],[420,71900],[490,86200],[520,93100],[539,96000]],
      compaction:{ wouldRemove:26800, wouldRetain:69200, retains:['The three reproductions','The route-change correlation'],
        drops:['9,400 tokens of network waterfalls from loads that did not reproduce','Four near-duplicate screenshots'],
        estimatedSeconds:11, reversible:true,
        note:'115 of 118 page loads produced nothing. Their evidence is the obvious thing to drop.' },
      limits:[
        { id:'session', label:'Session', used:19, resetAt:at(720), note:'Moonshot bills per token, no rolling cap' }
      ] },

    { threadId:'context', limit:131000, cacheHitPct:83, inputThisTurn:4200, outputThisTurn:1120,
      connection:'kimi-main', model:'Kimi K3', account:'Kimi Coding · kimi-main',
      costApiUsd:0.014, costPlanUsd:0.006,
      mix:[
        ['conversation', 16800, 3400, '12 turns; 3,400 tokens are already muted and retained for rehydration.'],
        ['plans',         5200, 0,    'The Context Lens requirement extract.'],
        ['files',        22400, 8900, 'Six superseded concept folders, muted but still resident.'],
        ['tools',         3100, 0,    'One subcompact preview.'],
        ['system',        6068, 0,    'System prompt, tool definitions, provider policy.'],
        ['attachments',      0, 0,    'None.']
      ],
      growth:[[44,6200],[140,14800],[240,22400],[340,32900],[440,42600],[500,50100],[539,53568]],
      compaction:{ wouldRemove:12300, wouldRetain:41268, retains:['Every rehydration handle','The current renderer and its tests'],
        drops:['The six superseded concept folders, permanently rather than muted'],
        estimatedSeconds:6, reversible:false,
        note:'This one is NOT reversible: it drops sources that are currently muted-but-resident, so their rehydration handles go with them.' },
      limits:[
        { id:'session', label:'Session', used:19, resetAt:at(720), note:'Moonshot bills per token, no rolling cap' }
      ] },

    { threadId:'no-models', limit:128000, cacheHitPct:0, inputThisTurn:0, outputThisTurn:0,
      connection:'none', model:'No configured model', account:'—',
      costApiUsd:0, costPlanUsd:0,
      mix:[
        ['conversation',  2100, 0, 'Two turns before the route failed.'],
        ['plans',            0, 0, 'None.'],
        ['files',            0, 0, 'None.'],
        ['tools',            0, 0, 'None.'],
        ['system',        6068, 0, 'System prompt and provider policy are loaded even with no route.'],
        ['attachments',      0, 0, 'None.']
      ],
      growth:[[500,2100],[520,8168],[539,8168]],
      compaction:{ wouldRemove:0, wouldRetain:8168, retains:['Everything'], drops:[],
        estimatedSeconds:0, reversible:true,
        note:'Nothing to compact: the thread never got a route. Compact Now is offered and correctly reports no gain.' },
      limits:[] }
  ].forEach((spec) => { contextByThread[spec.threadId] = contextRecord(spec); });

  /* Flat active-thread view, for renderers that want one array. */
  const contextSources = contextByThread.query.sources;
  const contextWindow = contextByThread.query.window;
  const contextCompaction = contextByThread.query.compactionPreview;

  /* The seven outcomes a Compact Now state machine has to be able to
     report. "Compact Now" that always succeeds is a placeholder, not a
     concept. */
  const compactionOutcomes = [
    { id:'completed', tone:'ok', title:'Context compacted', detail:'Removed 18,420 tokens. 65,480 loaded. Every dropped source kept its rehydration handle.' },
    { id:'no-gain', tone:'info', title:'Nothing to compact', detail:'No superseded or duplicated sources were found. The window is already minimal.' },
    { id:'partial', tone:'ok', title:'Partly compacted', detail:'Removed 6,100 of a possible 18,420 tokens. The rest is pinned by active requirements.' },
    { id:'deferred', tone:'info', title:'Deferred', detail:'A turn is in flight. Compaction will run once it completes rather than mid-stream.' },
    { id:'timed-out', tone:'warn', title:'Timed out', detail:'The compaction pass exceeded 30s and was abandoned. Nothing was changed.' },
    { id:'failed', tone:'warn', title:'Compaction failed', detail:'A source could not be re-read, so the pass was rolled back rather than applied partially.' },
    { id:'declined', tone:'info', title:'Not recommended', detail:'This thread is at 38% of its window. Compaction is available but would cost more provenance than it saves.' }
  ];


  /* =====================================================================
     models[] -- 6 -> 14 across 9 accounts and the same 5 configured
     providers. No unconfigured provider is added: what this fixture adds
     is ACCOUNTS and STATES.

     Two structural facts the old fixture made unreachable:
       * one provider = one account, so multi-account routing could not be
         demonstrated at all. Anthropic now has three accounts, Alibaba
         two and z.ai two, and `sonnet46` / `sonnet46-personal` are the
         SAME MODEL on two different accounts -- which is why a row is
         keyed on provider+account and never on the model name.
       * all six models were `ready`, which made the "two configured
         accounts need attention" receipt fiction. Five accounts now
         genuinely need attention, and the receipt says five.

     `status` covers the whole enum: ready, api-key-required,
     sign-in-required, cli-not-found, update-available, quota-exhausted,
     expired. `statusDetail` is the truthful reason -- the sanctioned
     honest-gap pattern is a disabled row WITH a reason, never a toast
     that lies.
     ===================================================================== */
  const accounts = [
    { id:'anthropic-work',    provider:'Anthropic', label:'Work',         connection:'anthropic-work',    plan:'Team',        addedAt:at(-40320), default:true },
    { id:'anthropic-me',      provider:'Anthropic', label:'Personal',     connection:'anthropic-me',      plan:'Pro',         addedAt:at(-20160), default:false },
    { id:'anthropic-archive', provider:'Anthropic', label:'Archive',      connection:'anthropic-archive', plan:'Pro',         addedAt:at(-86400), default:false },
    { id:'qwen-coder',        provider:'Alibaba',   label:'Coding Plan',  connection:'qwen-coder',        plan:'Coder',       addedAt:at(-15120), default:true },
    { id:'qwen-team',         provider:'Alibaba',   label:'Team',         connection:'qwen-team',         plan:'Team',        addedAt:at(-2880),  default:false },
    { id:'kimi-main',         provider:'Moonshot',  label:'Kimi Coding',  connection:'kimi-main',         plan:'Coding',      addedAt:at(-10080), default:true },
    { id:'zai-primary',       provider:'z.ai',      label:'Primary',      connection:'zai-primary',       plan:'Pro',         addedAt:at(-7200),  default:true },
    { id:'zai-research',      provider:'z.ai',      label:'Research',     connection:'zai-research',      plan:'Research',    addedAt:at(-1440),  default:false },
    { id:'cursor-pro',        provider:'Cursor',    label:'Pro',          connection:'cursor-pro',        plan:'Pro seat',    addedAt:at(-5760),  default:true }
  ];

  const model = (o) => ({
    favorite:false, fast:false, statusDetail:null, ...o,
    statusLabel: labels.modelStatus[o.status],
    /* update-available is informational: the route still works. */
    needsAttention: o.status !== 'ready' && o.status !== 'update-available'
  });

  const models = [
    /* Anthropic -- three accounts, and Sonnet 4.6 on two of them. */
    model({ id:'sonnet46', name:'Claude Sonnet 4.6', provider:'Anthropic', accountId:'anthropic-work', account:'Work · anthropic-work',
      favorite:true, fast:true, efforts:['Low','Medium','High','Max'], context:131000, status:'ready' }),
    model({ id:'sonnet46-personal', name:'Claude Sonnet 4.6', provider:'Anthropic', accountId:'anthropic-me', account:'Personal · anthropic-me',
      favorite:false, fast:true, efforts:['Low','Medium','High','Max'], context:131000, status:'ready',
      statusDetail:'The same model as the Work route. Billing, rate limits and cache are per account, so the two are not interchangeable.' }),
    model({ id:'opus5', name:'Claude Opus 5', provider:'Anthropic', accountId:'anthropic-work', account:'Work · anthropic-work',
      favorite:true, fast:false, efforts:['Medium','High','Max'], context:196000, status:'ready' }),
    model({ id:'opus5-personal', name:'Claude Opus 5', provider:'Anthropic', accountId:'anthropic-me', account:'Personal · anthropic-me',
      favorite:false, fast:false, efforts:['Medium','High','Max'], context:196000, status:'quota-exhausted',
      statusDetail:'The five-hour window for this account is spent. It resets at 18:00 UTC; the Work account is unaffected.' }),
    model({ id:'haiku46', name:'Claude Haiku 4.6', provider:'Anthropic', accountId:'anthropic-work', account:'Work · anthropic-work',
      favorite:false, fast:true, efforts:['Low','Medium'], context:131000, status:'ready' }),
    model({ id:'sonnet45-archive', name:'Claude Sonnet 4.5', provider:'Anthropic', accountId:'anthropic-archive', account:'Archive · anthropic-archive',
      favorite:false, fast:false, efforts:['Low','Medium','High'], context:131000, status:'expired',
      statusDetail:'The stored credential for this account expired 3 days ago. Re-authenticate in Provider Settings; nothing is lost.' }),

    /* Alibaba -- two accounts, and Qwen 3.8 on both. */
    model({ id:'qwen38', name:'Qwen 3.8', provider:'Alibaba', accountId:'qwen-coder', account:'Coding Plan · qwen-coder',
      favorite:true, fast:true, efforts:['Low','Medium','High'], context:262000, status:'ready' }),
    model({ id:'qwen38-team', name:'Qwen 3.8', provider:'Alibaba', accountId:'qwen-team', account:'Team · qwen-team',
      favorite:false, fast:true, efforts:['Low','Medium','High'], context:262000, status:'api-key-required',
      statusDetail:'This account was added without a key. Paste one in Provider Settings; the Coding Plan account keeps working meanwhile.' }),
    model({ id:'qwen38-coder', name:'Qwen 3.8 Coder', provider:'Alibaba', accountId:'qwen-coder', account:'Coding Plan · qwen-coder',
      favorite:false, fast:false, efforts:['Medium','High'], context:262000, status:'ready' }),

    /* Moonshot -- one account, two models. */
    model({ id:'kimi-k3', name:'Kimi K3', provider:'Moonshot', accountId:'kimi-main', account:'Kimi Coding · kimi-main',
      favorite:false, fast:true, efforts:['Low','Medium','High'], context:200000, status:'ready' }),
    model({ id:'kimi-k3-turbo', name:'Kimi K3 Turbo', provider:'Moonshot', accountId:'kimi-main', account:'Kimi Coding · kimi-main',
      favorite:false, fast:true, efforts:['Low','Medium'], context:200000, status:'update-available',
      statusDetail:'A newer build is published. The current one still routes normally, so this is informational, not a block.' }),

    /* z.ai -- two accounts. */
    model({ id:'glm52', name:'GLM 5.2', provider:'z.ai', accountId:'zai-primary', account:'Primary · zai-primary',
      favorite:false, fast:false, efforts:['Low','Medium','High'], context:128000, status:'ready' }),
    model({ id:'glm52-air', name:'GLM 5.2 Air', provider:'z.ai', accountId:'zai-research', account:'Research · zai-research',
      favorite:false, fast:true, efforts:['Low','Medium'], context:128000, status:'sign-in-required',
      statusDetail:'The Research account signs in through the browser and the session has lapsed. Sign in again to use it.' }),

    /* Cursor -- one account, and the CLI is genuinely missing. */
    model({ id:'cursor-auto', name:'Cursor Auto', provider:'Cursor', accountId:'cursor-pro', account:'Pro · cursor-pro',
      favorite:false, fast:false, efforts:['Automatic'], context:120000, status:'cli-not-found',
      statusDetail:'The cursor-agent binary is not on PATH on this execution host. Install it, or route this work to another host.' })
  ];

  const accountsNeedingAttention = accounts.filter((a) => models.some((m) => m.accountId === a.id && m.needsAttention));


  /* =====================================================================
     questions -- one flow -> four.

     `state.questionQueue` is initialised to 2 in app.js while exactly one
     flow existed, so the "2 queued" pill was fiction. There are now two
     genuinely queued flows, one active and one completed, which makes
     that literal true without app.js changing.

     `D.questions` stays the FLAT array of the active flow, because
     app.js clones it directly into `state.questions` and the summary
     question reads `state.questions[0..2]` by index. The new
     `questionFlows` collection carries all four; the active flow's
     `questions` array IS `D.questions` by reference on purpose -- the
     alternative is two copies that drift.
     ===================================================================== */
  const questions = [
    { id:'q1', prompt:'Where should the primary Puppet Master server run?', required:true, type:'choice',
      options:['TrueNAS Docker','Windows native','macOS native','Linux native'], answer:'TrueNAS Docker',
      why:'Host selection decides which execution hosts are reachable without a relay.' },
    { id:'q2', prompt:'Which hosts may execute Windows work?', required:true, type:'multi',
      options:['Windows native','Windows WSL','Linux container','macOS'], answer:['Windows native','Windows WSL'],
      why:'Windows-only tooling cannot be routed to a Linux container, so this narrows the eligible host set.' },
    { id:'q3', prompt:'What should happen when the preferred host is offline?', required:true, type:'choice',
      options:['Pause and ask','Use an eligible fallback','Queue until it returns'], answer:'',
      why:'This is the difference between a stalled run and a run that silently changed hosts.' },
    { id:'q4', prompt:'Add any constraints the deployment plan should preserve.', required:false, type:'text',
      answer:'Keep provider credentials on the server and allow clients to reconnect without losing draft state.',
      why:'Free-text constraints are copied verbatim into the resulting Plan artifact.' },
    { id:'q5', prompt:'Review the resolved deployment summary.', required:false, type:'summary', answer:'',
      why:'Nothing is submitted until this page is seen.' }
  ];

  const questionFlows = [
    { id:'flow-deploy', title:'Deployment questionnaire', state:'active', threadId:'questions',
      openedAt:at(432), dueAt:null, expiresAt:null,
      note:'No passive expiry: an unanswered questionnaire waits indefinitely and keeps its draft.',
      questions },

    { id:'flow-migration', title:'Migration approval', state:'queued', threadId:'query',
      openedAt:at(506), dueAt:null, expiresAt:null,
      note:'Queued behind the deployment questionnaire. Answering is what unblocks todos t9 and t10.',
      questions:[
        { id:'mq1', prompt:'Does the payload bound apply to existing rows or only to new writes?', required:true, type:'choice',
          options:['New writes only','Backfill existing rows','Backfill in a separate migration'], answer:'',
          why:'A backfill on 128,400 rows is a different migration with a different rollback.' },
        { id:'mq2', prompt:'May the unused events_hourly foreign key be dropped in the same migration?', required:true, type:'choice',
          options:['Yes, same migration','No, separate migration','Leave it in place'], answer:'',
          why:'Bundling an unrelated drop into a migration makes the rollback less precise.' },
        { id:'mq3', prompt:'Which window may the concurrent index build run in?', required:true, type:'multi',
          options:['Weekday off-peak','Weekend','Any time','Maintenance window only'], answer:[],
          why:'CONCURRENTLY takes two table passes and holds no exclusive lock, but it is still load.' },
        { id:'mq4', prompt:'Anything the migration plan must preserve?', required:false, type:'text', answer:'',
          why:'Copied verbatim into the migration plan artifact.' }
      ] },

    { id:'flow-hosts', title:'Execution host capabilities', state:'queued', threadId:'subagents',
      openedAt:at(512), dueAt:null, expiresAt:null,
      note:'Queued. Two of its three questions are already answerable from the host map artifact.',
      questions:[
        { id:'hq1', prompt:'Which host should own browser-program work?', required:true, type:'choice',
          options:['Windows native','Linux container','macOS','Whichever is idle'], answer:'',
          why:'Browser control is the one capability that is not uniform across the hosts.' },
        { id:'hq2', prompt:'May child agents run on a different host from their parent?', required:true, type:'choice',
          options:['Yes','No','Only for read-only agents'], answer:'',
          why:'A child on another host cannot see the parent worktree without a bind.' },
        { id:'hq3', prompt:'Notes for the host routing policy.', required:false, type:'text', answer:'',
          why:'Copied into the routing policy document.' }
      ] },

    { id:'flow-retention', title:'Retention policy', state:'completed', threadId:'archived-1',
      openedAt:at(-2880), completedAt:at(-1440), dueAt:null, expiresAt:null,
      note:'Completed and retained for exact-message search. Answers stay readable after submission.',
      questions:[
        { id:'rq1', prompt:'How long should analytics events be retained?', required:true, type:'choice',
          options:['Nine days','Thirty days','Ninety days','Indefinitely'], answer:'Nine days',
          why:'Retention drives the partition key and the sweep schedule.' },
        { id:'rq2', prompt:'Which surfaces may read expired events?', required:true, type:'multi',
          options:['Nobody','Audit tooling','Support tooling','Analytics'], answer:['Audit tooling'],
          why:'A retention window with an exception list is a different window.' },
        { id:'rq3', prompt:'Should the sweep be scheduled or on demand?', required:true, type:'choice',
          options:['Scheduled nightly','Scheduled weekly','On demand'], answer:'Scheduled nightly',
          why:'A nightly sweep keeps the partition count bounded.' },
        { id:'rq4', prompt:'Anything the retention policy must record?', required:false, type:'text',
          answer:'Record the retention window nine days decision beside the partition key so the two never drift apart.',
          why:'Copied into the retention policy document.' }
      ] }
  ];

  const questionQueueDepth = questionFlows.filter((f) => f.state === 'queued').length;


  /* =====================================================================
     operational -- absent before this wave.

     Worktrees cover all four bind states, and the port table contains the
     correction packet's 4173/4174 collision rather than a tidy list where
     nothing ever conflicts. Worktree ids match the four values app.js's
     worktree menu already offers, so the Wave 3 Menus agent can drive the
     top-bar selector straight off this.
     ===================================================================== */
  const operational = {
    worktrees: [
      { id:'main', label:'main', state:'bound-clean', stateLabel:labels.worktreeState['bound-clean'],
        path:'/srv/pm/worktrees/main', branch:'main', threadId:null, ahead:0, behind:0,
        dirtyFiles:0, lastSyncAt:at(480),
        note:'Canonical branch. Bound to no thread, so nothing can write to it from a chat turn.' },
      { id:'feature/query-index', label:'feature/query-index', state:'bound-dirty', stateLabel:labels.worktreeState['bound-dirty'],
        path:'/srv/pm/worktrees/query-index', branch:'feature/query-index', threadId:'query', ahead:6, behind:1,
        dirtyFiles:12, lastSyncAt:at(506),
        note:'12 uncommitted files. Deleting this thread must offer to keep the worktree, and must say it has changes.' },
      { id:'concept/chat-5-6-pro', label:'concept/chat-5-6-pro', state:'bound-conflict', stateLabel:labels.worktreeState['bound-conflict'],
        path:'/srv/pm/worktrees/chat-5-6-pro', branch:'concept/chat-5-6-pro', threadId:'subagents', ahead:14, behind:9,
        dirtyFiles:4, conflicts:['styles.css','app.js'], lastSyncAt:at(452),
        note:'Two files conflict with the base branch. Work continues; merging does not.' },
      { id:'review/query-benchmarks', label:'review/query-benchmarks', state:'unbound', stateLabel:labels.worktreeState.unbound,
        path:null, branch:'review/query-benchmarks', threadId:null, ahead:0, behind:0,
        dirtyFiles:0, lastSyncAt:null,
        note:'A branch with no checkout. Selecting it creates the worktree first; that is a real step, not a no-op.' }
    ],

    /* The manifest's 4173/4174 collision, kept rather than tidied away. */
    ports: [
      { port:4173, service:'Vite preview', leasedBy:'feature/query-index', threadId:'query', state:'leased', since:at(468) },
      { port:4173, service:'Vite preview', leasedBy:'concept/chat-5-6-pro', threadId:'subagents', state:'collision', since:at(470),
        detail:'Two worktrees requested 4173. The second lease was refused, not silently moved: a preview that answers on a port nobody expects is worse than one that fails to start.' },
      { port:4174, service:'Vite preview (reassigned)', leasedBy:'concept/chat-5-6-pro', threadId:'subagents', state:'leased', since:at(471),
        detail:'Reassigned after the collision, with a receipt. The URL in the transcript above 04:71 is stale.' },
      { port:5432, service:'PostgreSQL (benchmark)', leasedBy:'feature/query-index', threadId:'query', state:'leased', since:at(392) },
      { port:9323, service:'Playwright report', leasedBy:'review/query-benchmarks', threadId:'debug', state:'released', since:at(300), releasedAt:at(414) },
      { port:7777, service:'Inspector bridge', leasedBy:null, threadId:null, state:'free', since:null }
    ],

    tests: [
      { id:'unit', label:'Unit', passed:42, failed:0, skipped:0, durationMs:8400, at:at(520), state:'green' },
      { id:'integration', label:'Integration', passed:18, failed:0, skipped:2, durationMs:41200, at:at(520), state:'green',
        note:'Two skipped: both need the migration decision that is still queued.' },
      { id:'browser', label:'Browser', passed:14, failed:0, skipped:0, durationMs:62800, at:at(519), state:'green' },
      { id:'bench', label:'Benchmark', passed:6, failed:0, skipped:0, durationMs:184000, at:at(508), state:'green' },
      { id:'lint', label:'Lint and types', passed:1, failed:0, skipped:0, durationMs:5200, at:at(521), state:'green' },
      { id:'reduced-motion', label:'Reduced motion', passed:6, failed:1, skipped:0, durationMs:9800, at:at(529), state:'red',
        note:'One named loop still runs under prefers-reduced-motion. It is a real failure, kept visible rather than skipped.' }
    ],

    forecast: {
      basis:'The last 9 turns of this thread',
      turnsRemaining:12,
      windowExhaustedAt:at(612),
      budgetExhaustedAt:null,
      note:'Twelve turns at the current growth rate fills the window. Budget exhaustion is not completion, so the forecast reports both separately.',
      series:[
        { at:at(560), tokens:91200 }, { at:at(580), tokens:99800 },
        { at:at(600), tokens:108400 }, { at:at(620), tokens:117900 },
        { at:at(640), tokens:126100 }, { at:at(660), tokens:131000 }
      ]
    },

    hosts: [
      { id:'truenas', label:'TrueNAS Docker', role:'server', state:'online', since:at(-4320) },
      { id:'windows-native', label:'Windows native', role:'execution', state:'online', since:at(120) },
      { id:'windows-wsl', label:'Windows WSL', role:'execution', state:'online', since:at(120) },
      { id:'linux-container', label:'Linux container', role:'execution', state:'degraded', since:at(524),
        detail:'Dropped one stream at 08:44 UTC. Rollback Rehearser is retrying against it.' },
      { id:'macos', label:'macOS', role:'execution', state:'offline', since:at(-1440),
        detail:'Not reachable. No work is routed here, and nothing is queued for it.' }
    ]
  };

  /* =====================================================================
     warnings -- absent before this wave. Non-fatal conditions the shell
     should be able to surface without inventing them at render time.
     ===================================================================== */
  const warnings = [
    { id:'w1', severity:'warning', scope:'account', at:at(508), dismissible:true,
      title:'Five configured accounts need attention',
      detail:'Personal Anthropic is out of quota, the Archive credential expired, the Alibaba Team account has no key, the z.ai Research session lapsed, and cursor-agent is not on PATH.',
      action:{ label:'Open Provider Settings', id:'open-provider-settings' } },
    { id:'w2', severity:'warning', scope:'context', at:at(539), dismissible:true,
      title:'Context at 64% and rising',
      detail:'Twelve more turns at the current rate fills the window. A source-aware compaction would recover 18,420 tokens now.',
      action:{ label:'Compact now', id:'compact-now' } },
    { id:'w3', severity:'danger', scope:'worktree', at:at(452), dismissible:false,
      title:'concept/chat-5-6-pro has two conflicting files',
      detail:'styles.css and app.js conflict with the base branch. Work continues in the worktree; merging does not.',
      action:{ label:'Show conflicts', id:'show-conflicts' } },
    { id:'w4', severity:'warning', scope:'ports', at:at(470), dismissible:true,
      title:'Port 4173 was requested twice',
      detail:'The second lease was refused and reassigned to 4174 with a receipt, so any URL captured before 04:71 is stale.',
      action:{ label:'Open port table', id:'open-ports' } },
    { id:'w5', severity:'info', scope:'model', at:at(514), dismissible:true,
      title:'Kimi K3 Turbo has a newer build',
      detail:'Informational only: the current build still routes normally.',
      action:{ label:'Update', id:'update-model' } },
    { id:'w6', severity:'danger', scope:'tests', at:at(529), dismissible:false,
      title:'One reduced-motion gate is failing',
      detail:'A named loop still runs under prefers-reduced-motion. Every new looping animation has to be added to the stop list or it runs forever.',
      action:{ label:'Open evidence', id:'open-artifact', value:'test-evidence' } },
    { id:'w7', severity:'info', scope:'host', at:at(524), dismissible:true,
      title:'Linux container host is degraded',
      detail:'It dropped one stream at 08:44 UTC. One child agent is retrying against it; nothing else is routed there.',
      action:{ label:'Open host map', id:'open-artifact', value:'architecture-map' } }
  ];

  /* =====================================================================
     scriptedReplies -- absent before this wave. 22 entries, so the
     composer's Send/Stop machine has something to drive other than one
     hardcoded paragraph. `match` is a keyword list, `chunks` are the
     streamed segments, and `terminal` covers the outcomes a Stop button
     has to be able to produce.

     NOT CONSUMED YET: handleSend() in app.js still appends one fixed
     paragraph. See DATA_HANDOFF.md.
     ===================================================================== */
  const reply = (o) => ({ mode:'agent', delayMs:600, chunkMs:280, terminal:'complete', followUp:null, ...o });
  const scriptedReplies = [
    reply({ id:'sr-index', match:['index','composite','tenant_id'], chunks:[
      'Leading with tenant_id is right for this shape.',
      ' Every analytics read is tenant-scoped, so it is the highest-selectivity equality predicate, and created_at then serves both the range filter and the ORDER BY without a separate sort node.',
      ' The cost is on the write side: +4.8% on inserts, measured rather than estimated.'] }),
    reply({ id:'sr-nplus1', match:['n+1','fan-out','batch'], chunks:[
      'Both call sites are inside a per-tenant loop, so the cost scales with tenant count rather than page size.',
      ' Batching them behind one tenant-first query removes 213 round trips at production tenant count.'] }),
    reply({ id:'sr-rollback', match:['rollback','revert','undo'], chunks:[
      'The rollback is rehearsed, not assumed.',
      ' DROP INDEX CONCURRENTLY works and leaves the table readable throughout, and the test asserts both directions rather than only the forward one.'] }),
    reply({ id:'sr-benchmark', match:['benchmark','p95','latency'], chunks:[
      'p95 goes from 482 ms to 71 ms and p50 from 118 ms to 24 ms.',
      ' Those numbers are against the corrected 128,400-row fixture; the old 8x400 fixture was small enough that a sequential scan won, which is why the original ticket under-reported the problem.'] }),
    reply({ id:'sr-migration', match:['migration','concurrently','transaction'], chunks:[
      'CREATE INDEX CONCURRENTLY takes two table passes and cannot run inside a transaction block.',
      ' This repository wraps every migration file in a transaction, so 0043 has to be split out and marked no-transaction.'] }),
    reply({ id:'sr-schema', match:['schema','payload','column'], chunks:[
      'The payload column is 61% of the average row width because the JSON is unbounded.',
      ' Bounding it at write time is the single largest row-width win available, but it needs an explicit decision about existing rows.'] }),
    reply({ id:'sr-approval', match:['approve','approval','permission'], chunks:[
      'I stopped before the ALTER rather than asking for forgiveness.',
      ' The next safe action is a decision on whether the payload bound applies to existing rows or only to new writes.'], terminal:'complete',
      followUp:{ type:'permission', title:'Permission required', detail:'Production schema modification requires an explicit user override.' } }),
    reply({ id:'sr-subagent', match:['subagent','delegate','child agent'], chunks:[
      'I can split this across three child agents: one on the read path, one on the schema, and one on the benchmark fixture.',
      ' They run in read-only child threads and report back rather than editing directly.'],
      followUp:{ type:'live-agents', title:'Three child agents working' } }),
    reply({ id:'sr-plan', match:['plan','strategy','approach'], mode:'plan', chunks:[
      'Drafting a plan rather than starting work.',
      ' Six steps, four acceptance criteria, and a rollback gate with a named owner.'],
      followUp:{ type:'plan-card', artifactId:'plan-query' } }),
    reply({ id:'sr-deepplan', match:['deep plan','exhaustive'], mode:'deep_plan', chunks:[
      'Deep Plan mode: I will read the whole surface before proposing anything.',
      ' That takes longer and produces a plan you can disagree with in specifics rather than in principle.'],
      followUp:{ type:'plan-card', artifactId:'plan-query', deep:true } }),
    reply({ id:'sr-ask', match:['explain','why','how does'], mode:'ask', chunks:[
      'Ask mode: I will answer and explain without making changes.',
      ' Nothing in the worktree moves as a result of this turn.'] }),
    reply({ id:'sr-debug', match:['debug','blank','intermittent'], mode:'debug', chunks:[
      'It reproduces once in roughly forty loads, always after a route change.',
      ' That points at a renderer cache keyed on the model name, which stopped being unique once a provider had two accounts.'],
      followUp:{ type:'working', title:'Debugging the dashboard' } }),
    reply({ id:'sr-context', match:['context','compact','window'], chunks:[
      'The window is at 64%: 83,900 of 131,000 tokens.',
      ' A source-aware compaction would remove 18,420 and leave 65,480, keeping every provenance handle.'] }),
    reply({ id:'sr-stop', match:['stop','cancel','never mind'], chunks:[
      'Stopping here.'], terminal:'stopped', delayMs:200 }),
    reply({ id:'sr-longrun', match:['sweep','all themes','everything'], chunks:[
      'Sweeping all eight themes at four viewports.',
      ' Thirty-two combinations, twenty-four assertions each.',
      ' This one takes a while, so the Stop button is real rather than decorative.'], delayMs:400, chunkMs:1400 }),
    reply({ id:'sr-error', match:['host','execution host','disconnect'], chunks:[
      'Starting against the Linux container host.'], terminal:'error',
      error:'The execution host closed the stream during step 7 of 11.',
      followUp:{ type:'tool-error', title:'Execution host disconnected', detail:'Nothing was left half-applied: the migration harness rolls back on disconnect.' } }),
    reply({ id:'sr-quota', match:['quota','cap','limit reached'], chunks:[
      'The Personal Anthropic account is out of quota for this five-hour window.',
      ' The Work account is unaffected, so I can continue there — but that is a different account with different billing, so I am asking rather than switching.'],
      followUp:{ type:'route-change', title:'Route change offered', detail:'Anthropic · Personal is capped. Continue on Anthropic · Work?' } }),
    reply({ id:'sr-worktree', match:['worktree','branch','checkout'], chunks:[
      'feature/query-index has 12 uncommitted files and concept/chat-5-6-pro has two conflicting ones.',
      ' review/query-benchmarks has no checkout at all: selecting it creates the worktree first, which is a real step.'] }),
    reply({ id:'sr-tests', match:['test','suite','green'], chunks:[
      'Five of six suites are green.',
      ' The reduced-motion gate fails on one named loop, and I would rather report that than skip it into a green summary.'] }),
    reply({ id:'sr-retention', match:['retention','sweep','expire'], chunks:[
      'The retention window nine days decision is recorded beside the partition key so the two cannot drift apart.',
      ' The nightly sweep keeps the partition count bounded.'] }),
    reply({ id:'sr-lens', match:['mute','focus','subcompact','lens'], chunks:[
      'Mute and Focus apply immediately as selection toggles; Subcompact needs an explicit Apply because it writes a local summary artifact.',
      ' The cap is 25 messages per operation, not per thread, so operations accumulate.'],
      followUp:{ type:'context-focus', title:'Context Lens · Focus', detail:'Included the current renderer, the current tests, and the final reference.' } }),
    reply({ id:'sr-default', match:[], chunks:[
      'Added as an ordinary conversational turn so the reading rhythm, message actions, wide response layout, and the persistent More Details surface can all be evaluated on real text rather than on a placeholder.'] })
  ];

  /* =====================================================================
     drafts -- absent before this wave. Per-thread composer drafts with a
     history, so the composer's draft-restore affordance has something to
     restore that is not the last thing the user sent.
     ===================================================================== */
  const drafts = [
    { id:'d1', threadId:'query', savedAt:at(512), body:'Before we commit to the index, can you check what happens under concurrent write load? The benchmark is read-only and I do not want to find out in production.' },
    { id:'d2', threadId:'query', savedAt:at(468), body:'Also: does the planner still pick it after a statistics refresh with the current autovacuum settings?' },
    { id:'d3', threadId:'plain', savedAt:at(430), body:'One more thing on density — I keep coming back to the idea that the interface should be quiet when nothing is happening and loud only when something needs me.' },
    { id:'d4', threadId:'subagents', savedAt:at(520), body:'Can the orphan gate run after every wave rather than once at the end? Running it once is how a stylesheet accumulates rules for components nobody built.' },
    { id:'d5', threadId:'debug', savedAt:at(526), body:'Try reproducing it with two accounts on the same provider and the same model name. I think that is the whole bug.' },
    { id:'d6', threadId:'route', savedAt:at(500), body:'If the route changes mid-turn I want the receipt to say which account produced which part of the answer, not just that it changed.' },
    { id:'d7', threadId:'context', savedAt:at(494), body:'Show me what a subcompact would actually drop before it drops it. A preview that only shows a token count is not a preview.' },
    { id:'d8', threadId:'goal-replan', savedAt:at(410), body:'A material scope edit should produce a visible replan event rather than quietly replacing the objective.' }
  ];


  /* =====================================================================
     threads[] -- 59 messages across 24 threads (16 of them with two or
     fewer) -> every thread at 12 or more, and one long-history thread.

     TWO BUGS FIXED HERE:
       1. `plainConversation` was ONE array shared by reference between
          the `plain` and `new-message` threads, so their message ids
          collided. `state.messageExpanded` is a flat global id map, so
          expanding a message in one thread expanded it in the other --
          state leaking between threads, which the correction packets call
          a hard failure. Each thread now builds its own conversation with
          its own id prefix, and no two threads share an object.
       2. Every timestamp was `Date.now()`-relative. All of them are now
          fixed ISO strings derived from one epoch (see the header), so a
          screenshot baseline is stable.

     Three contract-mandated search phrases are planted inside COLLAPSED
     message bodies, which is the only way to prove search reaches hidden
     text: "retention window nine days" (archived-3), "blue lantern
     checkpoint" (offline), "canonical source history" (bsd).
     ===================================================================== */
  const threads = [];
  const thread = (o) => {
    const m = o.messages;
    threads.push({
      pinned:false, archived:false, unread:0, worktree:null, goalId:null, ...o,
      updatedAt: m.length ? m[m.length - 1].sentAt : at(o.updatedMin || 0),
      messageCount: m.length
    });
  };

  thread({ id:'query', title:'Query Performance', status:'working', pinned:true, updated:'2m',
    model:'Claude Sonnet 4.6', worktree:'feature/query-index', goalId:'goal-query-perf',
    summary:'Optimize tenant-scoped analytics queries and validate the result.',
    messages:turns('query', { route:'sonnet', startMin:392, mode:'agent', persona:'Product Manager', contextStart:12400 }, [
      ['u','Analyze the analytics query performance, use subagents where useful, and give me a safe implementation plan.'],
      ['a','Starting with measurement rather than a hypothesis. I will read the query builders, the schema, and the migration history first, then delegate the schema review and the benchmark so those run in parallel.'],
      ['e','working',{ title:'Optimizing analytics queries' }],
      ['a','First finding, and it changes the shape of the problem: the ticket says p95 is 310 ms, but that was measured against an 8x400-row benchmark fixture. At production row shape — 214 tenants, 128,400 rows — p95 is 482 ms. The old fixture was small enough that a sequential scan actually wins, so the benchmark was hiding the very thing it was supposed to measure.'],
      ['u','That is annoying but good to know. Keep going.'],
      ['a','Two problems, not one. Three queries do a full table scan, and two of them sit inside a per-tenant loop, so cost scales with tenant count rather than page size. The index fixes the first; batching fixes the second. Doing only one of them leaves most of the win on the table.'],
      ['e','plan-card',{ artifactId:'plan-query' }],
      ['a','Plan is up. The short version: a tenant-first composite index, one batched query replacing the fan-out, and the materialized view kept as a documented fallback rather than the default — it adds refresh lag and a second piece of operational state, and the read win is available without it.'],
      ['u','Hold on, I want to argue with the column order before we commit to it. Almost every query we write filters on a date range first — last seven days, last thirty days, this quarter — and only then narrows to a tenant. From the outside that makes created_at look like the obvious leading column, and I have had two people tell me the same thing independently.\n\nSo before I sign off on tenant_id leading, walk me through what actually happens at the planner level in both orders, with the row counts we really have rather than a toy example. I would rather spend ten minutes on this now than find out in six months that we picked the order that reads well in a diagram.',{ long:true }],
      ['a','Because the date range is a range and the tenant is an equality. An index can only use one range predicate efficiently, and it has to be the last column used. With tenant_id leading, the planner does an equality seek and then walks created_at DESC in index order, which also removes the sort node. Lead with created_at and every tenant read scans the whole date range and filters afterwards.'],
      ['e','agent-work',{ title:'Delegated two child agents', detail:'Query Analyzer on the read path, Schema Reviewer on the schema. Both read-only.' }],
      ['a','Schema Reviewer has stalled and I am not going to route around it. It found that the unbounded payload column is 61% of average row width, but bounding it is a production schema modification and that needs your explicit override. I stopped before the ALTER rather than asking for forgiveness afterwards.'],
      ['u','Leave the schema alone for now. What is the actual measured result of just the index and the batching?'],
      ['a','p95 482 ms to 71 ms, p50 118 ms to 24 ms, throughput 1,420 to 3,980 rows per second. The honest cost is +4.8% on inserts, measured over 50,000 of them rather than estimated.\n\nThere are two things I have not measured, and I would rather name them than let the benchmark read as more complete than it is. I have not run this under concurrent write load, and I have not checked whether the planner still selects the index after a statistics refresh with the current autovacuum settings. Both are cheap, both are ways this quietly regresses in a month, and neither is covered by the number above.',{ long:true }],
      ['a','One migration caveat worth catching now: CREATE INDEX CONCURRENTLY takes two table passes and cannot run inside a transaction block. This repository wraps every migration file in a transaction, so 0043 has to be split out and marked no-transaction. That is revision 4 of the plan.'],
      ['e','artifact',{ artifactId:'dashboard-query' }],
      ['u','Good. Add the concurrent-write-load check to the todo list and open the PR once tests are green.']
    ]) });

  /* The long-history thread: 26 turns, no tools, no cards, no artifacts.
     Its ids are `plain-NN` and belong to it alone. */
  thread({ id:'plain', title:'Product Design Discussion', status:'idle', pinned:true, updated:'12m',
    model:'Claude Sonnet 4.6',
    summary:'A long ordinary conversation with no tools, cards, or artifacts.',
    messages:turns('plain', { route:'sonnet', startMin:200, mode:'ask', persona:'Product Manager', contextStart:4200 }, [
      ['u','I want to think through the trade-offs before we change anything. The current page is usable, but it feels dense and I am worried that reducing information will make expert users slower.'],
      ['a','That tension is real. The safest direction is not to remove information, but to separate immediate decisions from inspectable detail. Keep the current task, state, and next action visible; let evidence, history, and secondary metadata expand in place or open beside the conversation.'],
      ['u','How would you decide what stays visible without making the interface feel arbitrary?'],
      ['a','Frequency, urgency, and reversibility. Frequent information belongs in the primary reading path. Urgent blockers should interrupt clearly. Reversible or rarely needed detail can sit one click away, provided the interface signals that it exists and preserves the user’s place when opened.'],
      ['u','I also dislike interfaces that hide everything behind icons. They look clean in screenshots but become tiring when you actually use them.'],
      ['a','Agreed. Icons should support recognition, not replace essential language. In a narrow assistant, text-only model, mode, persona, and permission labels are actually more efficient, because they communicate state without the extra chrome of bordered controls. Icons earn their place on stable actions: attach, search, history, the capability wand.'],
      ['u','What about density? I keep hearing that dense is bad, but our users spend eight hours a day in this.'],
      ['a','Density is not the enemy; undifferentiated density is. A dense surface where everything has the same weight forces the eye to read everything. A dense surface with one clear focal point per region reads faster than a sparse one, because the sparse version makes you scroll to reassemble context.'],
      ['u','Give me a concrete rule I can hold people to in review.'],
      ['a','Try this one: every region of the interface should answer one question, and you should be able to say which question out loud. If a region answers two, it needs a divider or a second region. If nobody can name the question, the region is decoration.'],
      ['u','That is genuinely useful. What breaks that rule most often in our product?'],
      ['a','The status bar. It answers "what is running", "where am I", and "how much have I spent" in one strip with no separation, so all three read as equally urgent and none is scannable.'],
      ['u','Show me how a long answer would read when there are no tools or artifacts competing for space.'],
      ['a','A prose-first answer should use nearly the full transcript width, with modest paragraph spacing and a clear section hierarchy. It should avoid a narrow assistant bubble floating on the left, which wastes half the reading width and makes long answers feel longer than they are.\n\nThe message controls can appear on hover or focus, while a persistent More Details action remains available for provenance, cost, timing, model, and context information. Long responses may collapse after a meaningful preview — but expanding one must not move the scroll position, because a reader who expands a message is reading it right now and moving the page under them is the single most irritating thing a transcript can do.\n\nThe preview itself has to be a real preview. Cutting at a fixed pixel height mid-sentence teaches people to expand everything, which defeats the purpose; cutting at a paragraph boundary lets them decide.',{ long:true }],
      ['u','Where does that leave the assistant bubble? People expect chat to look like chat.'],
      ['a','Keep the role marker, drop the bubble. A small label plus generous width reads as chat without paying the width tax. The bubble is a convention from mobile messaging where the width was genuinely scarce.'],
      ['u','Fair. Now the harder question: what do we do when the assistant is wrong and the user needs to correct it three turns later?'],
      ['a','Make the correction visible and cheap. Edit-and-branch on the original message rather than a new turn saying "actually, no", because the second option leaves the wrong answer in context where it keeps influencing everything after it.'],
      ['u','That implies branching is a first-class thing rather than a power-user feature.'],
      ['a','It does. And it implies branching has to be non-destructive: write a restore point first, fold the later messages into a collapsed restorable region, and never delete. A branch that loses work is a branch nobody uses twice.'],
      ['u','Let me push back properly on one thing, because I think we are drifting. Over the last few turns you have described a hover-revealed action row, a persistent More Details surface, an expand control on long messages, an edit-and-branch affordance, a restore point, a rewind, and a collapsed restorable region. Every one of those is defensible on its own and I agreed with each as you said it.\n\nBut stack them up and the message is now surrounded by seven controls, and the thing I actually came here to do was read. At some point an interface stops being a place where work happens and becomes a place where you manage the controls for work happening somewhere else.\n\nSo what is the discipline that stops that? Not "use fewer" — I want a rule I can apply in review that tells me which of those seven should not be there.',{ long:true }],
      ['a','That is the right pushback. The discipline is that an affordance appears when its subject is present and not before. Rewind appears when there is something to rewind to. Restore appears when a restore point exists. An affordance that is always visible and rarely applicable is chrome.'],
      ['u','Okay. Summarise what we actually decided, and be honest about what is still open.'],
      ['a','Decided: separate decisions from detail rather than removing detail; keep text labels for state and icons for stable actions; one question per region; prose-first width with a role marker instead of a bubble; edit-and-branch as the correction path, non-destructive.\n\nStill open: what the collapse threshold actually is, whether the status bar splits into three regions or gets dividers, and whether branching is exposed on every message or only on the most recent user turn. I have opinions on all three but no evidence, and I would rather mark them open than let an opinion ride in as a decision.',{ long:true }],
      ['u','Agreed on all of it. Leave the three open ones open — I would rather revisit them with a prototype than settle them in a document.'],
      ['a','Noted. I have not written any of this to a plan artifact, because it is a conversation about direction rather than a unit of work, and turning it into a plan would give it a false sense of being agreed.']
    ]) });

  thread({ id:'questions', title:'Deployment Questionnaire', status:'waiting', pinned:true, updated:'18m', unread:2,
    model:'Qwen 3.8',
    summary:'A durable queued questionnaire with required and optional answers.',
    messages:turns('questions', { route:'qwen', startMin:432, mode:'plan', persona:'Release Engineer', contextStart:6200 }, [
      ['u','Help me configure the deployment. Ask whatever you need.'],
      ['a','I will ask five questions rather than guess. Three are required because they change the resulting plan; two are optional.'],
      ['e','question-receipt',{ title:'Deployment questions waiting', detail:'2 of 5 answered · no expiration' }],
      ['u','Server runs on the TrueNAS Docker host.'],
      ['a','Recorded. That makes the Windows and WSL hosts reachable over the local network without a relay, and the macOS host reachable only when it is awake.'],
      ['u','Windows work can go to Windows native or WSL. Not the Linux container.'],
      ['a','Recorded. Worth stating why that matters: the Linux container has the same toolchain but not the same filesystem semantics, so a path-sensitive test would pass there and fail in production.'],
      ['a','The third required question is the one I cannot answer for you: what should happen when the preferred host is offline. Pause and ask, use an eligible fallback, or queue until it returns. These are genuinely different products.'],
      ['u','What would you pick?'],
      ['a','Pause and ask, for anything that writes. A silent fallback is how a run ends up on a host with different filesystem semantics and nobody notices until the artifact is wrong. For read-only work a fallback is fine, but the setting is currently one switch for both.'],
      ['e','question-receipt',{ title:'Questionnaire queued', detail:'It waits in the transcript and can be resumed without losing the draft. Two more flows are queued behind it.' }],
      ['u','Leave it unanswered for now. I want to check with the platform team first.'],
      ['a','It will wait. There is no passive expiry on a questionnaire: an unanswered one keeps its draft indefinitely rather than timing out and losing your two answers.'],
      ['a','Two other flows are queued behind this one — migration approval and execution host capabilities. Neither blocks on this one, so they can be answered in any order.']
    ]) });

  thread({ id:'subagents', title:'Runtime Architecture Review', status:'working', updated:'24m', unread:3,
    model:'Claude Opus 5', worktree:'concept/chat-5-6-pro',
    summary:'Multiple live child agents, including a stalled reviewer and a failed gate.',
    messages:turns('subagents', { route:'opus', startMin:470, mode:'agent', persona:'Systems Analyst', contextStart:18200 }, [
      ['u','Review the runtime architecture in parallel.'],
      ['a','Five child agents, three concerns: motion timing, the emitted-class union, and the theme sweep. They run in read-only child threads and report back rather than editing.'],
      ['e','live-agents',{ title:'Five child agents working' }],
      ['a','Token Harvester finished first and its result changes how the other gates should run. Static extraction gives 480 class names, a runtime harvest gives 499, and the union is 554. Neither method alone is sufficient — interpolated names only appear at runtime, conditionally-rendered ones only appear statically.'],
      ['u','So a plain grep for dead CSS would be wrong.'],
      ['a','Badly wrong. A naive grep produces 19 false positives from interpolation alone, and that is exactly how a stylesheet accumulates rules for components nobody ever built.'],
      ['e','agent-work',{ title:'Orphan Gate failed', detail:'It read classes.json before the harvest finished writing it, so the union was empty and all 554 selectors looked like orphans.' }],
      ['a','I want to be clear about that failure because the failure mode is interesting: the gate reported nothing, rather than reporting 554 orphans. A gate that says everything is broken is not a finding, it is a bug in the gate, and publishing that number would have burned a review cycle.'],
      ['u','Re-run it after the harvest and tell me the real number.'],
      ['a','Queued. Meanwhile Theme Sweeper has six of eight themes clean. Retro Light has one contrast failure on the subtle text token — 3.9:1 against the raised surface where the bar is 4.5:1 — and Glass Dark has a 1px horizontal overflow at 700px that only appears with the activity panel pinned.'],
      ['a','The overflow is the resizer rather than the panel: it is 6px wide with a 3px negative margin and no min-width:0 on its flex parent, so the parent refuses to shrink below its content.'],
      ['e','artifact',{ artifactId:'architecture-map' }],
      ['u','What about the motion review?'],
      ['a','Motion Reviewer is still running. Its headline so far is that the sidecar should inherit the root menu direction and stay mounted while the pointer crosses the gap between the two menus. Unmounting on pointerleave is what makes a submenu feel like it is fighting the cursor.'],
      ['a','It also flagged the trap this codebase has already fallen into twice: animation-fill-mode:both beats a declared value, and prefers-reduced-motion here only stops named loops, so every new looping animation has to be added to the stop list or it runs forever.']
    ]) });

  thread({ id:'bsd', title:'BSD Intervention', status:'reviewing', updated:'31m', unread:1,
    model:'Claude Sonnet 4.6', worktree:'feature/query-index',
    summary:'Back Seat Driver catches an unsafe assumption and intervenes.',
    messages:turns('bsd', { route:'sonnet', startMin:410, mode:'agent', persona:'Release Engineer', contextStart:8400 }, [
      ['u','Go ahead and rewrite the migration history so it is cleaner.'],
      ['e','bsd-evaluating',{ title:'BSD is reviewing the proposed action' }],
      ['e','bsd-advice',{ title:'Back Seat Driver intervened', detail:'Rewriting applied migration history is unsafe. Create a forward migration and preserve rollback evidence.' }],
      ['a','I will not rewrite applied history. I created a forward-only migration plan and added a rollback gate instead.'],
      ['u','Explain why, because from here it looks like tidying.'],
      ['a','Because the migration table on every environment already records those files as applied, by checksum. Rewriting them means the checksums no longer match, and the next deploy either refuses to run or silently re-applies a migration that has already run. Both outcomes are worse than an untidy history.\n\nThere is a second reason that matters more for this repository specifically. The migration files are the canonical source history for the schema: they are the only ordered record of why each column exists. Rewriting them to look cleaner deletes the reasoning along with the mess, and the reasoning is the part nobody can reconstruct later.\n\nWhat I can do safely is add a forward migration that leaves the schema in the state you actually want, plus a comment in the new file pointing at the two older ones it supersedes. The history stays honest and the schema still ends up clean.',{ long:true }],
      ['u','Fine. What would it have cost if you had just done it?'],
      ['a','On this repository, a failed deploy on the next release and roughly two hours of someone reconstructing which environment was at which checksum. Recoverable, but only because the migration table records checksums; without that it would have been a restore from backup.'],
      ['e','agent-work',{ title:'Forward migration drafted', detail:'0043 supersedes 0039 and 0041 by comment, not by rewrite.' }],
      ['a','The forward migration is drafted. It references the two files it supersedes in a comment rather than deleting them, so the ordering stays intact.'],
      ['u','Does BSD stop me every time I ask for something destructive, or is this a one-off?'],
      ['a','It evaluates on the action, not on the phrasing. Rewriting applied history, force-pushing a shared branch, and deleting a worktree with uncommitted changes all trip it. Renaming a local branch does not.'],
      ['a','Worth saying: it intervened rather than refused. The distinction matters — it proposed the safe alternative and let you overrule it. A guard that only says no gets switched off within a week.'],
      ['u','Good. Leave the history alone and ship the forward migration.'],
      ['a','Doing that. The rollback evidence is preserved in the same commit so the two never get separated.']
    ]) });

  thread({ id:'context', title:'Context Lens Review', status:'idle', updated:'38m',
    model:'Kimi K3',
    summary:'Focus, Mute, and Subcompact receipts with source provenance.',
    messages:turns('context', { route:'kimi', startMin:440, mode:'ask', persona:'Product Manager', contextStart:9200 }, [
      ['u','Focus on the current renderer and mute the old experiments.'],
      ['e','context-focus',{ title:'Context Lens · Focus', detail:'Included the current renderer, the current tests, and the final reference. 6 messages, operation 1 of 3.' }],
      ['a','Focus applied to six messages. Focus protects rather than removes: those sources are now pinned against compaction and against the next subcompact.'],
      ['e','context-mute',{ title:'Context Lens · Mute', detail:'Omitted six superseded concept folders from the active context. 11 messages, operation 2 of 3.' }],
      ['a','Mute applied to eleven messages. Muted sources stay resident and keep their rehydration handles — they are omitted from the projection, not deleted. That is the difference between mute and compaction and it is worth keeping visible.'],
      ['u','What is the cap? I have more than that to mute.'],
      ['a','Twenty-five messages per Apply operation, not per thread. Operations accumulate, so a second operation on another twenty-five is fine; the cap exists to keep one Apply reviewable, not to limit how much you can mute.'],
      ['e','context-subcompact',{ title:'Subcompact preview', detail:'Would reduce active context by 18,420 tokens while retaining provenance. Requires an explicit Apply.' }],
      ['a','Subcompact is the one that needs an explicit Apply, because it writes a local summary artifact and replaces a region of the transcript with it. Mute and Focus are immediate toggles; this one produces something.'],
      ['u','Show me what it would drop before it drops it.'],
      ['a','It would drop plan revisions 1 through 3, the superseded browser traces, and the duplicated file reads. It keeps every active requirement, the current plan revision, and every provenance handle, so anything dropped can be rehydrated from its source.'],
      ['a','One honest caveat about this particular thread: the compaction preview here is marked non-reversible, because a chunk of what it would drop is currently muted-but-resident. Dropping those takes their rehydration handles with them. Everywhere else in this concept the preview is reversible; here it is not, and the preview says so rather than using the same reassuring copy everywhere.'],
      ['u','And Turn Off?'],
      ['a','Turn Off exits selection mode and clears selection state. It does not undo applied operations — those have their own receipts and their own rehydration handles. Conflating the two is how people lose work they thought was only hidden.'],
      ['e','artifact',{ artifactId:'lens-receipt' }]
    ]) });


  thread({ id:'visuals', title:'Inline Visualizer Gallery', status:'complete', updated:'44m',
    model:'GLM 5.2',
    summary:'Mermaid, dashboard, chart, explorer, quiz, map, periodic table, flowchart, and image.',
    messages:turns('visuals', { route:'glm', startMin:380, mode:'agent', persona:'Product Manager', contextStart:5400 }, [
      ['u','Show several native inline visual artifacts.'],
      ['a','Nine kinds, each rendered inline in the transcript and openable full size in the editor. The rule I am following is that an artifact renders inline only if it is legible at transcript width; anything that needs more space gets a card and opens beside the conversation.'],
      ['e','artifact',{ artifactId:'mermaid-runtime' }],
      ['a','The Mermaid diagram is the clearest case for inline rendering: it is a flowchart with sixteen nodes and it reads fine at 620px.'],
      ['e','artifact',{ artifactId:'dashboard-query' }],
      ['u','The dashboard is too cramped inline.'],
      ['a','Agreed, and that is the boundary. Four series with a target line needs roughly 900px before the axis labels stop colliding, so it should be a card inline and a full render in the editor. I will not shrink the labels to make it fit — that produces a chart that is technically present and practically unreadable.'],
      ['e','artifact',{ artifactId:'generated-image' }],
      ['a','Generated images are the opposite case: they downscale cleanly, so inline at transcript width with a click to open at full resolution is right.'],
      ['u','What happens when one of them fails to render?'],
      ['a','It gets an error state with a stated reason and a retry, plus a fallback to the source. There are two of those in this concept and both are recoverable, because an unrecoverable render failure with no source fallback is a dead card and teaches people not to trust the surface.'],
      ['e','artifact',{ artifactId:'flow-plan' }],
      ['a','The last one is the plan approval flowchart. Seven nodes, eight edges, and it is the only artifact here that is also a control surface — clicking a node opens the corresponding decision.'],
      ['u','Good. Leave the dashboard as a card and ship the rest inline.']
    ]) });

  thread({ id:'debug', title:'Browser Debug Session', status:'working', updated:'51m', unread:4,
    model:'Kimi K3', worktree:'review/query-benchmarks',
    summary:'Browser control, console, network, test evidence, and recovery.',
    messages:turns('debug', { route:'kimi', startMin:196, mode:'debug', persona:'Browser Auditor', contextStart:14200 }, [
      ['u','Debug the intermittent blank dashboard.'],
      ['a','Intermittent is the hard part, so I am going to reproduce before theorising. I will drive the browser through the same workflow repeatedly and capture console, network, and a screenshot on every load.'],
      ['e','working',{ title:'Debugging the dashboard' }],
      ['a','118 loads. It reproduced three times. No console errors on any of the three, no failed network requests, and the DOM is present — the chart container has zero height.'],
      ['u','Zero height sounds like CSS, not data.'],
      ['a','That was my first read too, and it is wrong. The container has zero height because the renderer bailed before drawing, and it bails silently when it gets a series it has already drawn under a different key. The height is the symptom.'],
      ['a','What all three reproductions share: each one immediately follows a route change. None of the 115 clean loads did. That is a strong enough correlation to stop looking at CSS.'],
      ['u','Route change as in switching models?'],
      ['a','As in switching accounts. The renderer caches by model name, and the model name stopped being unique the moment a provider had two configured accounts exposing the same model. Two different routes, same cache key, second one gets a stale entry and bails.'],
      ['e','agent-work',{ title:'Reproduced deterministically', detail:'Forcing a route change between two accounts on the same model reproduces it 5 times out of 5.' }],
      ['a','Now deterministic: force a route change between the Work and Personal Anthropic accounts and it reproduces every time. That took it from a flaky bug to a one-line key change.'],
      ['e','artifact',{ artifactId:'test-evidence' }],
      ['u','Add a regression test that would have caught it.'],
      ['a','Added, and I made it assert painted pixels rather than a bounding box. The old probe returned true for anything with a non-zero box, which includes elements that are clipped, occluded, or mid-transition — that is how three previous fixes passed while being invisible on screen.'],
      ['a','The new probe hit-tests the centre with elementFromPoint and then counts distinct colours in a screenshot crop. Distinct colours rather than mean luminance, because a solid placeholder box has a perfectly reasonable mean and exactly one colour.'],
      ['e','artifact',{ artifactId:'data-explorer' }]
    ]) });

  thread({ id:'offline', title:'Offline Replay', status:'recovering', updated:'1h',
    model:'Claude Sonnet 4.6',
    summary:'Queued message, reconnect, deduplicated one-time replay.',
    messages:turns('offline', { route:'sonnet', startMin:330, mode:'agent', persona:'Release Engineer', contextStart:7200 }, [
      ['u','Continue after I reconnect.'],
      ['e','offline',{ title:'Message queued offline', detail:'Will replay once after the connection is restored.' }],
      ['a','Queued. Nothing was sent, so nothing was billed, and the draft is held locally rather than optimistically submitted.'],
      ['u','What stops it sending twice when the connection flaps?'],
      ['a','Each queued turn carries an idempotency key generated when you pressed send, not when the connection returns. The server rejects a repeat of the same key, so a flapping connection produces one turn no matter how many times the client retries.\n\nThe part that is easy to get wrong is the client half. If the client generates the key on retry instead of on send, every retry is a new key and the deduplication never fires — the server is doing exactly what it was asked and the user still gets three copies of their message.\n\nThis concept holds the key alongside the draft in the blue lantern checkpoint record, which is the same record the rewind machinery reads. That is deliberate: a queued turn and a restore point are the same kind of object, and giving them two different stores is how they drift.',{ long:true }],
      ['e','reconnected',{ title:'Connection restored', detail:'Queued message replayed once · no duplicate turn created.' }],
      ['a','Replayed once. The receipt records the idempotency key so you can confirm it rather than take my word for it.'],
      ['u','What happens to work that was running when the connection dropped?'],
      ['a','It keeps running. The execution host is server-side, so a disconnected client is a rendering problem rather than an execution problem. When the client returns it replays the event stream from the last acknowledged sequence number.'],
      ['a','The one case that is genuinely lossy is a browser-program step that needed a client-side confirmation while the client was gone. Those time out rather than auto-approving, and they say so.'],
      ['u','Show me the timeout case.'],
      ['e','permission',{ title:'Permission timed out', detail:'A browser-control step waited 120s for confirmation while the client was offline, then stopped. Nothing was approved by default.' }],
      ['a','That is the whole behaviour: it stopped rather than assuming consent. Resuming re-asks rather than replaying the approval, because the thing it wanted permission for may no longer be the right action.'],
      ['u','Good. That is the behaviour I wanted to check.'],
      ['a','Worth noting one thing this concept does not simulate: a partial write on the execution host at the moment of disconnect. That is a real failure mode and it needs a real transaction boundary rather than a fixture.']
    ]) });

  thread({ id:'attachments', title:'Attachment Routing', status:'idle', updated:'1h',
    model:'Kimi K3',
    summary:'Upload progress, image preview, source routing, and unsupported attachment handling.',
    messages:turns('attachments', { route:'kimi', startMin:300, mode:'agent', persona:'Product Manager', contextStart:5100 }, [
      ['u','I am attaching the schema diagram and an old project package. Tell me what you can do with each.'],
      ['e','attachment',{ title:'schema-diagram.png', detail:'Uploaded · image artifact created · downsampled to 1024px' }],
      ['a','The diagram is in. I downsampled it to 1024px on the long edge, which costs about 4,000 tokens rather than the 14,000 the original would have. If you need me to read small text in it, say so and I will re-ingest at full resolution.'],
      ['e','attachment-error',{ title:'legacy-project.pkg', detail:'Unsupported package · open extraction guidance' }],
      ['u','Why can you not read the package?'],
      ['a','Because it is a compressed installer format rather than an archive, and expanding it requires running its own installer. Doing that would execute vendor code on the execution host, which is not something an attachment should be able to trigger.'],
      ['a','What I can do instead: if you extract it locally and attach the contents, or point me at the source repository, both routes work and neither runs anything.'],
      ['u','Fine. What does the diagram actually tell you?'],
      ['a','Three tables, two of which are already in the schema I read. The third — events_hourly — is the rollup that the composite index makes redundant, and the diagram is the first place I have seen its intended refresh cadence written down.'],
      ['e','agent-work',{ title:'Cross-referenced the diagram against schema.rs', detail:'2 of 3 tables match. events_hourly exists in the diagram and is being removed in the working tree.' }],
      ['u','Does the attachment count against my context permanently?'],
      ['a','It stays resident while the thread is active and appears in the context breakdown as its own family, currently 4,000 tokens of a 131,000-token window. Muting it keeps the rehydration handle; compacting it away does not.'],
      ['a','One thing worth flagging about images specifically: a downsampled image cannot be un-downsampled from context. If I need the full-resolution version later I have to re-read the original file, which is why the original stays in the worktree rather than only in the conversation.'],
      ['u','Attach the benchmark CSV too and tell me if that is a better shape for you.'],
      ['e','attachment',{ title:'traces.csv', detail:'Uploaded · 4,180 rows · parsed as a data artifact rather than as text' }],
      ['a','Much better shape. Parsed as a data artifact, so I can filter and aggregate it without loading all 4,180 rows into context — the whole file is 620 tokens as a schema plus a query surface.']
    ]) });

  thread({ id:'tool-failure', title:'Tool Recovery', status:'blocked', updated:'2h', unread:1,
    model:'Claude Opus 5',
    summary:'Interrupted work, permission denial, checkpoint recovery, and retry.',
    messages:turns('tool-failure', { route:'opus', startMin:270, mode:'agent', persona:'Release Engineer', contextStart:8800 }, [
      ['u','Run the full browser suite against the staging host.'],
      ['a','Starting. Eleven steps; the first six are setup and the last five are the actual assertions.'],
      ['e','tool-error',{ title:'Browser control interrupted', detail:'Execution host disconnected during step 7.' }],
      ['a','It stopped at step 7 of 11. Nothing was left half-applied — the harness rolls back on disconnect — but the six setup steps are gone with it.'],
      ['u','Can you just resume from 7?'],
      ['a','No, and I want to be precise about why rather than just refusing. Steps 1 to 6 built state on the host: a seeded database, a launched preview server, and an authenticated browser session. That state died with the connection. Resuming from step 7 would run assertions against a host that has none of it, and they would fail for the wrong reason.'],
      ['e','permission',{ title:'Permission required', detail:'Reconnecting to the execution host requires approval.' }],
      ['a','Reconnecting needs your approval because it re-authenticates against staging. I am not going to do that silently.'],
      ['u','Approved. Why did the host drop in the first place?'],
      ['a','The Linux container host is marked degraded — it dropped one stream at 08:44 UTC and this is the second one. That is a host problem rather than a suite problem, and running the suite again on the same host is likely to reproduce it.'],
      ['a','My recommendation is to route this run to the Windows WSL host instead and leave the Linux container out of the pool until someone looks at it. That is a decision about infrastructure rather than about this test, so it is yours.'],
      ['u','Route it to WSL. And flag the container host.'],
      ['e','agent-work',{ title:'Host flagged', detail:'linux-container marked degraded · removed from the eligible pool for this thread only.' }],
      ['a','Flagged for this thread only. I did not remove it globally, because a host that drops one stream in two hours may be fine for read-only work and I do not have enough evidence to take it out of the pool for everyone.'],
      ['a','Re-running on WSL from step 1. Setup takes about ninety seconds before the first assertion, so the first six steps will look like nothing is happening.']
    ]) });

  thread({ id:'goal-replan', title:'Goal Replanning', status:'paused', updated:'2h',
    model:'GLM 5.2', goalId:'goal-query-perf',
    summary:'Edit, pause, resume, stop, clear, evidence, tasks, and material replanning.',
    messages:turns('goal-replan', { route:'glm', startMin:240, mode:'agent', persona:'Product Manager', contextStart:6400 }, [
      ['u','Change the goal to include the write path as well as the read path.'],
      ['a','That is a material scope edit rather than a wording change, so it produces a replan event rather than quietly replacing the objective. The distinction matters: replacing it silently would make the previous phase completions look like progress toward something they were never aimed at.'],
      ['e','goal-receipt',{ title:'Replan recorded', detail:'Revision 4 · added a Verify phase for write amplification · nothing removed.' }],
      ['a','Revision 4 adds a Verify phase for write amplification. Nothing was removed, so the two completed phases still count.'],
      ['u','Pause it while I check with the platform team.'],
      ['e','goal-receipt',{ title:'Goal paused', detail:'Budget stops accruing. Phase state is preserved exactly.' }],
      ['a','Paused. The budget stops accruing and the current phase keeps its in-progress state rather than reverting — resuming should not cost you the work already done in it.'],
      ['u','What is the difference between pause, stop, and clear? I never remember.'],
      ['a','Pause is reversible and keeps everything: phases, evidence, budget, blocker. Stop ends the goal but leaves the record readable, so you can see what it achieved and why it ended. Clear removes the goal from the thread entirely, and it is the only one of the three that loses state.'],
      ['a','They are deliberately three separate states rather than one toggle, because the honest answer to "did that goal finish" is different for each, and a single Stop that sometimes means pause and sometimes means delete is how people lose work.'],
      ['u','And the budget — is running out of budget the same as finishing?'],
      ['a','No, and that is worth being blunt about. Budget exhaustion means the goal ran out of tokens, not that it achieved its objective. The status for that is budget_limited and it is displayed differently from complete, because a progress bar that fills up on exhaustion is a lie.'],
      ['e','goal-receipt',{ title:'Blocker recorded', detail:'Schema approval · policy class · affects phases Implement and Verify · next safe action: answer the migration questionnaire.' }],
      ['a','The blocker is recorded structurally rather than as a sentence: class, cause, affected scope, last attempted recovery, why autonomous recovery cannot continue safely, and the next safe action. A generic failure label would not tell you that answering the queued migration questionnaire is what unblocks it.'],
      ['u','Leave it paused. I will resume after the platform call.'],
      ['a','It will stay exactly where it is. Nothing expires while a goal is paused.']
    ]) });


  /* The mid-thread model change lives here: turn 06 switches the route
     from Anthropic · Work (Claude Sonnet 4.6) to Alibaba · Coding Plan
     (Qwen 3.8), and every later turn inherits it. Two different models
     are visible in one transcript, which is the whole point of the
     thread and the thing `threads[].model` alone could never express. */
  thread({ id:'route', title:'Provider Route Change', status:'complete', updated:'3h',
    model:'Qwen 3.8',
    summary:'Configured-account route change, Fast eligibility, quota, and graceful fallback.',
    messages:turns('route', { route:'sonnet', startMin:180, mode:'agent', persona:'Release Engineer', contextStart:6800 }, [
      ['u','Refactor the provider selector so it stops assuming one account per provider.'],
      ['a','Starting on the Work Anthropic account. The assumption is baked into the row key: rows are keyed on the provider id, which was fine while a provider had exactly one account.'],
      ['a','The fix is to key on provider plus account and group the rows under a provider heading. That also means the model NAME stops being unique inside the list, so anything that looked a model up by name has to change too.'],
      ['e','agent-work',{ title:'Rewrote providerRows()', detail:'flatMap over accountsFor(provider) · rows keyed `${providerId}:${accountId}`.' }],
      ['u','How many places looked models up by name?'],
      ['a','Three. The selector itself, the route label in the status bar, and — this is the interesting one — a renderer cache in the dashboard, which is the cause of the intermittent blank dashboard in the other thread. Same root cause, two symptoms.'],
      ['e','route-change',{ title:'Model route changed', detail:'Claude Sonnet 4.6 · Work reached its five-hour cap. Continuing on Qwen 3.8 · Coding Plan.' }],
      ['a','The Work account just hit its five-hour cap mid-task, so this turn and everything after it is Qwen 3.8 on the Alibaba Coding Plan account. I am saying so rather than letting the model change silently, because the second half of this transcript was written by a different model and a reader comparing the two halves deserves to know that.', { route:'qwen' }],
      ['u','Does the work carry over cleanly?'],
      ['a','The context does; the style does not. Everything I had read is still in the window, so I am not re-reading the files. But my formatting and my level of caution are noticeably different from the first half of this thread, and that is normal rather than a fault.'],
      ['a','Continuing the refactor. selectRoute() now refuses to route to an account that needs attention rather than silently falling back to a sibling account — a quiet substitution is how a thread ends up billed to an account nobody chose.'],
      ['e','agent-work',{ title:'Added routeState()', detail:'Returns ok/reason/providerId/accountId/label so callers stop inferring state from the model name.' }],
      ['u','Five accounts need attention right now. Does the selector show why?'],
      ['a','Each row carries its own reason: quota exhausted, credential expired, no API key, sign-in lapsed, CLI not on PATH. A disabled row with a truthful reason is the pattern; a disabled row with no reason just looks broken.'],
      ['a','Done: +92 −18 in provider-selector.js and +61 −39 in access-controls.css. The CSS change also removes the coloured left-edge bar that was carrying permission status, which is unreadable for anyone who cannot separate the hues and collides with the selection accent.'],
      ['e','artifact',{ artifactId:'chart-latency' }]
    ]) });

  thread({ id:'plan-deep', title:'Deep Plan Review', status:'waiting', updated:'4h', unread:2,
    model:'Claude Opus 5',
    summary:'Deep Plan artifact, revision, approval, cancellation, and later Build.',
    messages:turns('plan-deep', { route:'opus', startMin:150, mode:'deep_plan', persona:'Plan Critic', contextStart:11200 }, [
      ['u','Deep plan the analytics work. I want to disagree with specifics, not with the general idea.'],
      ['a','Deep Plan reads the whole surface before proposing anything, so this takes longer and produces something you can argue with in detail. Reading the query builders, the schema, the migration history, the benchmark harness, and the two most recent incident notes.'],
      ['e','plan-card',{ artifactId:'plan-query', deep:true }],
      ['a','Six steps, four acceptance criteria, one rollback gate with a named owner. The acceptance criteria are deliberately binary — p95 below 100 ms, no tenant crossover, write overhead below 8%, all tests green including the rollback rehearsal. Nothing subjective like "performs well".'],
      ['u','Why binary? Some of this is genuinely a judgement call.'],
      ['a','Because a criterion that needs judgement cannot be evaluated by anything except the person who wrote it, and that person is usually gone by the time it matters. If a step genuinely needs judgement, it should be a decision point in the plan rather than an acceptance criterion.'],
      ['a','Plan Critic came back with three gaps, and I agree with all three. The rollback gate had no owner, the write-amplification threshold was missing entirely, and the benchmark evidence had no named custodian.'],
      ['u','The write threshold is the one I care about. Where did 8% come from?'],
      ['a','From the incident notes rather than from me. The last write-path regression that caused a page was at 11% and the one before it at 9%; 8% is the largest number that has never caused an incident here. That is a weak basis and I would rather say so than present it as principled.'],
      ['e','agent-work',{ title:'Revision 4 created', detail:'Split the concurrent index into its own migration file after the migration audit.' }],
      ['u','Approve it but do not build yet.'],
      ['a','Approved and held. Approve-without-build is a real state rather than a deferral: the plan is immutable at revision 4, the build is queued, and nothing will start until you trigger it.'],
      ['e','goal-receipt',{ title:'Plan approved · build deferred', detail:'Revision 4 is immutable. Build can be triggered from the durable chat card at any time.' }],
      ['a','One thing I want on the record before the build. The plan does not cover behaviour under concurrent write load, and it does not cover whether the planner keeps choosing the index after a statistics refresh. Both are outside the acceptance criteria I just wrote, so approving the plan does not mean those are handled.'],
      ['u','Noted. Add them as follow-up todos rather than expanding the plan.'],
      ['a','Added as separate todos. Expanding an approved plan after approval is exactly the move that makes an approval meaningless.']
    ]) });

  thread({ id:'crew', title:'Crew Coordination', status:'working', updated:'5h', unread:5,
    model:'Claude Sonnet 4.6',
    summary:'Crew formation, role assignment, wait, block, timeout, recovery, and completion.',
    messages:turns('crew', { route:'sonnet', startMin:120, mode:'agent', persona:'Product Manager', contextStart:9400 }, [
      ['u','Form a crew for the concept repair work and give each member a real role.'],
      ['e','crew',{ title:'Crew formed', detail:'Planner, implementer, reviewer, and browser auditor.' }],
      ['a','Four roles, and the boundaries between them are the point. The planner never edits, the implementer never reviews its own work, the reviewer never edits, and the auditor only reads the rendered result.'],
      ['u','Before you go further — is this not just overhead for a small change? We are talking about a composite index and two batched queries. Four roles, four separate threads, four sets of context to keep in sync, and three of the four are the same model on the same account.\n\nI have watched this pattern turn a two-hour task into a day twice now, and both times the extra day produced review comments the implementer had already thought of and dismissed for good reasons. So make the case in terms of what specifically goes wrong without it, on this change, rather than in general.',{ long:true }],
      ['a','For a small change, yes. This is worth it here specifically because the failure mode we keep hitting is a fix that passes its own test — the implementer writing the assertion is how three invisible elements got signed off as working.'],
      ['e','agent-work',{ title:'Roles assigned', detail:'Planner · Opus 5 · Implementer · Sonnet 4.6 · Reviewer · Opus 5 · Auditor · Kimi K3.' }],
      ['a','Reviewer and planner are the same model on the same account but separate threads, so neither can see the other’s reasoning. That matters more than using two different models would.'],
      ['u','What happens when one of them stalls?'],
      ['a','The crew waits rather than reassigning. Reassigning a stalled role means two members holding the same responsibility, and then neither of them owns it.'],
      ['e','waiting',{ title:'Reviewer waiting', detail:'The implementer’s working tree is still changing. Reviewing a moving target produces review comments about code that no longer exists.' }],
      ['a','The reviewer is waiting for exactly that reason. It will start when two consecutive reads of the working tree are identical.'],
      ['u','And if the implementer never stops changing it?'],
      ['a','Then the reviewer times out and says so, rather than reviewing a snapshot and presenting it as a review of the current state. A timeout with a reason is a result; a review of stale code is worse than no review.'],
      ['e','artifact',{ artifactId:'crew-board' }],
      ['a','The board is one revision stale — the reviewer role was reassigned after it was written, and it is marked stale rather than silently regenerated, so you can see that a reassignment happened.'],
      ['u','Good. Let it run.']
    ]) });

  thread({ id:'artifact-error', title:'Artifact Recovery', status:'failed', updated:'6h', unread:1,
    model:'Kimi K3',
    summary:'Stale version, render failure, source fallback, and retry.',
    messages:turns('artifact-error', { route:'kimi', startMin:90, mode:'agent', persona:'Product Manager', contextStart:4800 }, [
      ['u','Render the usage projection dashboard.'],
      ['e','artifact',{ artifactId:'broken-viz' }],
      ['a','It failed to render, and the reason is worth reading rather than retrying blindly: the renderer received a series with zero points and refused to draw an empty chart.'],
      ['u','Why is refusing better than drawing an empty chart?'],
      ['a','Because an empty chart and a chart of zeroes look identical, and one of them means "no data" while the other means "the data is zero". Drawing it would turn a missing measurement into a confident claim.'],
      ['a','The source is intact — only the render failed — so the fallback to source is available and a retry re-reads the same source rather than regenerating it.'],
      ['u','Retry it.'],
      ['e','agent-work',{ title:'Retry attempted', detail:'Same source, same result: the projection query genuinely returns zero rows for this window.' }],
      ['a','Same result, which is now informative. The projection query really does return zero rows for this window, so this is a data problem rather than a renderer problem.'],
      ['a','The reason is the retention sweep: this window predates the current retention boundary, so the rows it would project from no longer exist. That is correct behaviour that looks like a bug.'],
      ['u','Can the error say that instead of talking about series length?'],
      ['a','It can, and it should. "No data in this window — rows older than the retention boundary have been swept" is a different message from "the renderer received an empty series", even though the second one is what the renderer literally saw.'],
      ['e','artifact',{ artifactId:'chart-latency' }],
      ['a','The second error in this thread is a different class: the route latency chart failed because two accounts expose the same model name and the previous renderer collapsed them into one series. That one is recoverable by retrying with account keys, and the retry label says so rather than just saying Retry.'],
      ['u','Retry that one and leave the projection alone.'],
      ['a','Retrying with account keys. Five series instead of three, one per configured route rather than one per model name.']
    ]) });

  /* Was `messages:[...plainConversation, …]` -- it shared every message
     id with the `plain` thread. Its own conversation now, own ids. */
  thread({ id:'new-message', title:'Scroll Anchor Test', status:'working', updated:'7h', unread:7,
    model:'Qwen 3.8',
    summary:'New messages arrive while the reader is away from the bottom.',
    messages:turns('new-message', { route:'qwen', startMin:60, mode:'agent', persona:'Product Manager', contextStart:5600 }, [
      ['u','I want to read back through this thread while work is still arriving. Do not move the page under me.'],
      ['a','Understood. The rule I am following: the transcript only auto-scrolls when you are already at the bottom. The moment you scroll up, the anchor detaches and new messages arrive below the fold with a counter instead.'],
      ['u','What counts as at the bottom? I hate the version of this that snaps back if you are two pixels off.'],
      ['a','A threshold rather than an exact position — within about 80 pixels of the end counts as at the bottom, which is roughly one line of text plus the padding. Exact equality fails constantly because of sub-pixel scroll positions and image reflow.'],
      ['e','working',{ title:'Continuing the benchmark run' }],
      ['a','Three messages have arrived since you scrolled up. The counter is showing rather than the page moving.'],
      ['u','Now expand a long message while I am up here.'],
      ['a','Expanding a collapsed message keeps the top edge of that message where it is, rather than keeping the scroll offset. Those produce different results: preserving the offset makes the text you are reading slide upward by the height of everything that just appeared above it.'],
      ['e','new-message',{ title:'3 new messages', detail:'Your reading position was preserved.' }],
      ['u','What about when an image finishes loading above me?'],
      ['a','Same principle, harder problem. Images need reserved height before they load, otherwise the reflow moves everything below them. Anything without intrinsic dimensions gets a placeholder box at its final size.'],
      ['a','The case this concept does not handle well is a streamed message that grows while you are reading something above it. The growth is below the fold so it does not move you, but the scrollbar thumb shrinks continuously, which is its own kind of distracting.'],
      ['u','Jump me to the bottom.'],
      ['a','Jumped, anchor reattached, counter cleared. From here new messages will scroll into view again until you move away.'],
      ['e','agent-work',{ title:'Benchmark run complete', detail:'6 benchmarks · 184s · results attached to the query thread.' }],
      ['u','Good. That is the behaviour I wanted.']
    ]) });

  thread({ id:'no-models', title:'Model Availability', status:'blocked', updated:'8h',
    model:'—',
    summary:'No eligible configured model, authentication, quota, and honest guidance.',
    messages:turns('no-models', { route:'sonnet', startMin:500, mode:'agent', persona:'Product Manager', contextStart:2100 }, [
      ['u','Run the theme sweep on the personal account.'],
      ['a','Trying the Personal Anthropic account. It is the only one with spare weekly budget.'],
      ['e','model-unavailable',{ title:'No available configured model', detail:'Five configured accounts need attention in Provider Settings.' }],
      ['u','Five? I thought it was two.'],
      ['a','Five, and each for a different reason, which is why one generic message was never going to be enough. Personal Anthropic is out of quota for this five-hour window, the Archive credential expired three days ago, the Alibaba Team account was added without a key, the z.ai Research session has lapsed, and cursor-agent is not on PATH on this execution host.'],
      ['a','Kimi K3 Turbo also has an update available, but that one is informational — the current build still routes normally, so I have not counted it.'],
      ['u','Which of those can I fix right now?'],
      ['a','Three of the five in under a minute: paste a key for the Alibaba Team account, sign in again for z.ai Research, re-authenticate the Archive credential. The quota one resets at 18:00 UTC on its own, and the missing CLI needs an install on the execution host rather than anything in this app.'],
      ['e','permission',{ title:'Re-authentication required', detail:'Opening Provider Settings for anthropic-archive. Credentials never leave the server.' }],
      ['u','What happens to queued work while all of this is broken?'],
      ['a','It stays queued rather than failing. Nothing is dropped and nothing is retried against an account that is known to be unusable, because a retry loop against an expired credential is how a rate limit turns into a lockout.'],
      ['a','The Work Anthropic account and the Alibaba Coding Plan account are both healthy, so this thread is the only one actually blocked — the others are still running.'],
      ['u','Then just use the work account.'],
      ['a','I can, but that account is at 64% of its five-hour window and a full theme sweep is 32 combinations. It would probably fit; it would also leave nothing for the rest of the afternoon. Your call rather than mine.'],
      ['u','Leave it. I will fix the personal account.'],
      ['a','Holding. Nothing is queued against the personal account, so fixing it will not trigger a backlog of retries the moment it comes back.']
    ]) });


  /* Archived threads. They are archived, not empty: the packets require
     an archived thread to stay fully searchable, restorable and forkable,
     and a one-line stub proves none of that. Each carries a real
     conversation, and archived-3 hides one of the three contract search
     phrases inside a collapsed message. */
  thread({ id:'archived-1', title:'Archived Accessibility Audit', status:'complete', archived:true, updated:'3d',
    model:'Claude Sonnet 4.6',
    summary:'Archived historical audit.',
    messages:turns('archived-1', { route:'sonnet', startMin:-4320, mode:'ask', persona:'Product Manager', contextStart:5200 }, [
      ['u','Audit the assistant surface for keyboard and screen-reader access.'],
      ['a','Working through it control by control rather than page by page, because the failures here are per-control.'],
      ['a','First problem, and it is the largest: status is carried by colour alone in three places. A coloured left-edge bar marks selection, a coloured dot marks agent state, and a coloured chip marks permission. None of the three has a text or shape equivalent.'],
      ['u','Is a coloured bar not fine if the colour is also in a tooltip?'],
      ['a','A tooltip needs hover, which excludes keyboard and touch. The rule I would hold to is that any status must survive a greyscale screenshot; if it does not, it needs an icon, a word, or a shape as well.'],
      ['e','agent-work',{ title:'Swept 41 interactive controls', detail:'12 unreachable by keyboard · 7 with no accessible name · 3 colour-only status.' }],
      ['a','Twelve controls are unreachable by keyboard. Eleven of those are the same bug: a div with a click handler and no tabindex or role. The twelfth is the orbit ring, which has pointer-events:none on the parent so even the mouse cannot reach it.'],
      ['u','Seven with no accessible name — which ones?'],
      ['a','All seven are icon-only buttons with a title attribute and no aria-label. A title is announced inconsistently across screen readers and never on mobile, so it is not a substitute.'],
      ['a','The focus order is mostly correct, with one exception: the overlay menu appends to a portal at the end of the document, so tabbing out of a menu lands at the end of the page rather than back at the trigger.'],
      ['u','Rank these by how much they cost a real user.'],
      ['a','Keyboard unreachability first — it makes twelve features simply unavailable. Then the accessible names, because an unnamed button is announced as "button" and the user has to guess. Colour-only status third: it is a real failure but the information is usually recoverable from context. Focus return last; it is irritating rather than blocking.'],
      ['a','This audit is being archived rather than closed. Nothing here is fixed yet, and archiving a thread does not resolve its findings — it only means the conversation is finished.']
    ]) });

  thread({ id:'archived-2', title:'Archived Provider Research', status:'complete', archived:true, updated:'5d',
    model:'Qwen 3.8',
    summary:'Archived provider comparison.',
    messages:turns('archived-2', { route:'qwen', startMin:-7200, mode:'ask', persona:'Product Manager', contextStart:4400 }, [
      ['u','Compare the configured providers on cost, context, and latency.'],
      ['a','Comparing only what is configured — there is no value in benchmarking a provider nobody has an account for.'],
      ['a','Cost per million output tokens: GLM 5.2 at 1.9, Qwen 3.8 at 2.2, Kimi K3 at 2.5, Claude Sonnet 4.6 at 15, Claude Opus 5 at 75. Cursor Auto bills against a seat rather than per token, so it has no comparable number.'],
      ['u','Put Cursor at zero then.'],
      ['a','No — zero and unknown are different, and rendering unknown as zero is how a comparison becomes a lie. It should read "not reported" and be visibly absent from the bar rather than drawn at the axis.'],
      ['a','Context windows: Qwen 3.8 at 262K, Kimi K3 at 200K, Claude Opus 5 at 196K, Claude Sonnet 4.6 and GLM 5.2 at 131K and 128K, Cursor Auto at 120K.'],
      ['e','agent-work',{ title:'Measured first-token latency', detail:'20 samples per route, same prompt, same time of day.' }],
      ['a','First-token latency, median of twenty: Kimi K3 265 ms, Alibaba 280 ms, Anthropic Work 410 ms, Anthropic Personal 520 ms.'],
      ['u','Why are the two Anthropic accounts different? Same provider, same model.'],
      ['a','Different plan tiers. The Work account is on Team and the Personal one on Pro, and the queue priority differs. That is exactly why a comparison keyed on the model name would be wrong: these are two routes with measurably different behaviour and identical model names.'],
      ['a','The conclusion I would draw: route bulk refactoring to Qwen or Kimi on cost, keep Sonnet for implementation, and reserve Opus for review and planning where the cost difference is small relative to the value of catching a bad plan.'],
      ['u','And Cursor Auto?'],
      ['a','Genuinely useful for inline edits inside the editor and not useful here, because it does not expose the tool surface this assistant needs. That is a capability difference rather than a quality one.'],
      ['a','Archiving this. The route decision it fed into is recorded in the provider route thread, so the reasoning stays findable even though this conversation is closed.']
    ]) });

  thread({ id:'archived-3', title:'Archived Usage Prototype', status:'complete', archived:true, updated:'8d',
    model:'Kimi K3',
    summary:'Archived usage concept.',
    messages:turns('archived-3', { route:'kimi', startMin:-11520, mode:'ask', persona:'Product Manager', contextStart:4800 }, [
      ['u','Prototype the usage surface. I want to know what I have spent without opening a billing page.'],
      ['a','Three questions a usage surface has to answer: how much of the current window is used, how much of the plan period is used, and what is going to run out first. Most usage dashboards answer the first and ignore the other two.'],
      ['a','The ring came out of this prototype. A ring reads as a proportion at a glance and a number reads as a fact, so the ring carries the percentage and the number carries the tokens.'],
      ['u','What about the plan limits rather than the context window? Those are different things.'],
      ['a','Completely different, and conflating them is the most common mistake here. The context window is per thread and resets when you start a new one. The plan limits are per account and reset on a schedule you do not control.'],
      ['e','agent-work',{ title:'Drafted the plan-limits block', detail:'Product, connection, per-meter percentage, reset time, and a "More limits" expander.' }],
      ['a','The plan-limits block shows the product, the connection, and one row per meter with its percentage and reset time. Anything beyond three meters goes behind a "More limits" expander, because six meters at equal weight reads as a wall.'],
      ['u','How do I know which one runs out first?'],
      ['a','That is the forecast, and it is the piece most usage surfaces are missing. It projects the current growth rate forward and names the first meter to be exhausted, with a date.\n\nThe honesty rule that makes the forecast worth having is that budget exhaustion is not completion. A goal that runs out of tokens has not achieved anything; it has stopped. Showing a progress bar that fills to 100% on exhaustion actively misleads, so exhaustion is a separate state with separate copy.\n\nThere is one retention detail that belongs here rather than in the billing page: usage events are kept on a retention window nine days long, so the forecast can look back nine days and no further. Asking it for a monthly trend produces a confident-looking line drawn from a third of a month, which is worse than refusing.',{ long:true }],
      ['u','Nine days is short. Why not keep more?'],
      ['a','Cost, mostly, and the fact that nobody has asked a question that needed more. It is worth revisiting if anyone wants month-over-month, but that is a decision to make deliberately rather than by accumulating data in case.'],
      ['e','agent-work',{ title:'Cache-hit row added', detail:'Cache hit sits on the action row rather than in the metric grid: it is context for the compact decision, not a headline number.' }],
      ['a','Last piece: cache hit rate sits on the action row next to Compact Now rather than in the metric grid, because it is the number that tells you whether compacting is worth it.'],
      ['u','Good. Archive it and carry the ring into the main concept.'],
      ['a','Archived. The finalized Context Ring came from this prototype and the plan-limits block did too; the forecast has not been carried across yet.']
    ]) });

  thread({ id:'archived-4', title:'Archived Onboarding Notes', status:'idle', archived:true, updated:'12d',
    model:'GLM 5.2',
    summary:'Archived onboarding notes.',
    messages:turns('archived-4', { route:'glm', startMin:-17280, mode:'ask', persona:'Product Manager', contextStart:3600 }, [
      ['u','Write onboarding notes for someone joining this project next week.'],
      ['a','Writing them as things that will confuse you rather than as a feature tour, because the feature tour is already in the README and nobody reads it twice.'],
      ['a','First: the standalone HTML is generated. Editing it directly works right up until the next build silently deletes your change, which is what the --check flag exists to catch.'],
      ['u','That has already happened to two people.'],
      ['a','Then it goes first. Second: the repository is on a network share, so line endings are a live hazard. Both deliverables are CRLF on disk and in git, and a tool that writes LF turns one real change into a five-thousand-line phantom diff.'],
      ['a','Third: the audit suite is not trustworthy on its own. It reported 434 of 434 passing while twelve reported defects were live, because three of its six metrics measured selectors the renderer never emits and were structurally incapable of being non-zero.'],
      ['u','That is the one that worries me most. How does someone avoid trusting it?'],
      ['a','By checking that a metric can fail. If you cannot make an assertion go red on purpose, it is not an assertion. That single habit would have caught all three.'],
      ['e','agent-work',{ title:'Drafted the onboarding checklist', detail:'8 items, each phrased as a failure someone actually hit.' }],
      ['a','Fourth: geometry is not evidence. getBoundingClientRect reports a box for elements that are clipped, occluded, or mid-transition, so a passing visibility check proves nothing. Hit-test the centre and sample the pixels.'],
      ['u','Anything about the codebase itself?'],
      ['a','Two idioms. Rendering is one keyed reconciler over template strings with no inline handlers, so a new control is a data-action attribute plus a branch in the delegated listener. And any node that must survive the two-second work tick needs a stable data-k, or it remounts and replays its entrance animation every tick.'],
      ['a','Last one: animation-fill-mode both beats a declared value, and reduced motion here only stops named loops. A new looping animation that is not added to the stop list runs forever under prefers-reduced-motion, which is the opposite of what the setting asks for.'],
      ['u','Good list. Archive it and I will hand it over on Monday.'],
      ['a','Archived and retained for exact-message search, so a phrase from these notes still finds this thread months from now.']
    ]) });

  thread({ id:'archived-5', title:'Archived Browser API', status:'complete', archived:true, updated:'18d',
    model:'Claude Opus 5',
    summary:'Archived browser API review.',
    messages:turns('archived-5', { route:'opus', startMin:-25920, mode:'ask', persona:'Systems Analyst', contextStart:6200 }, [
      ['u','Should the browser program wrap Playwright or expose a native API?'],
      ['a','Native, and the deciding argument is not performance. A Playwright facade makes the agent think in Playwright terms, which means it writes selectors and waits rather than describing intent.'],
      ['u','But Playwright already solves the waiting problem.'],
      ['a','It solves it for a test author who knows what they are waiting for. An agent does not, and the failure mode is a thirty-second timeout on a selector that was never going to appear because the agent misread the page.'],
      ['a','A native API can answer "what is on this page" as a first-class question. Playwright can only answer "is this selector present", and those produce very different agent behaviour.'],
      ['e','agent-work',{ title:'Prototyped both', detail:'Same six tasks through a Playwright facade and a native describe/act API.' }],
      ['a','Six tasks through both. The facade completed four and timed out on two. The native API completed six, and both of the tasks the facade failed were cases where the page changed shape rather than content.'],
      ['u','What does the native API cost us?'],
      ['a','A lot of surface. Playwright is battle-tested against browser quirks that we would have to rediscover, and the honest version of this recommendation includes that we will spend months on things Playwright already handles.'],
      ['a','The mitigation is to keep Playwright underneath as the transport and expose the native API above it, rather than choosing between them. That is what I would actually build.'],
      ['u','That was not one of the two options.'],
      ['a','No, and I should have offered it in the first message rather than framing it as a binary. The binary came from the question, and I let it stand instead of questioning it.'],
      ['e','agent-work',{ title:'Recommendation revised', detail:'Native API surface over a Playwright transport, rather than either alone.' }],
      ['a','Archiving. The native Browser Program API replaced the Playwright facade idea, and the transport decision went the way described above.']
    ]) });

  thread({ id:'archived-6', title:'Archived Settings Bakeoff', status:'complete', archived:true, updated:'24d',
    model:'Claude Sonnet 4.6',
    summary:'Archived settings concepts.',
    messages:turns('archived-6', { route:'sonnet', startMin:-34560, mode:'ask', persona:'Product Manager', contextStart:5800 }, [
      ['u','Four settings concepts, one winner. What is the criterion?'],
      ['a','Findability under load. All four look fine with twenty settings; the real inventory is eight hundred and eight, and three of the four collapse at that scale.'],
      ['a','Concept one is a flat list with search. It scales technically and fails in practice, because search only helps if you already know the word the setting uses.'],
      ['u','That is the one everyone likes in the mockup.'],
      ['a','Mockups have twenty settings. That is the whole problem with judging this from a mockup, and it is why I loaded all eight hundred and eight into each of them before comparing.'],
      ['e','agent-work',{ title:'Loaded the full inventory into all four', detail:'808 settings · same data · same viewport.' }],
      ['a','Concept two groups by feature area and keeps a persistent tree. It survives the inventory but the tree is nine levels deep in places, and a nine-level tree is a filing cabinet rather than a settings page.'],
      ['a','Concept three is task-oriented: it asks what you are trying to change and routes you there. It is the best of the four for someone who knows what they want and the worst for someone browsing.'],
      ['u','And four?'],
      ['a','Four is the one that won. Grouped like two, searchable like one, with a recently-changed section and a diff against defaults. The diff is the part the others were all missing — most settings questions are really "what did I change" rather than "what can I change".'],
      ['u','Was that criterion obvious from the start?'],
      ['a','No, and I want to be honest that it emerged from loading the real inventory rather than from reasoning. If we had judged from the mockups, concept one would have won and we would have found out at eight hundred settings.'],
      ['a','Archiving. The winner carried forward, and this thread can still be restored, forked, renamed, or searched by any phrase in it.']
    ]) });

  const recipes = [
    { name:'PM7 Refined', desc:'A restrained PMConcept7 evolution with the Reference Morph and wide prose transcript.', choices:[0,0,0,0,0,0,0] },
    { name:'Orbit Studio', desc:'Playful spatial work, icon-orbit activity, preview history, and morphing questions.', choices:[1,5,1,6,2,1,1] },
    { name:'Technical Workbench', desc:'Dense engineering controls, step-stack work, ledger detail, and technical transcript.', choices:[2,3,2,3,5,6,5] },
    { name:'Calm Reading', desc:'Prose-led shell, minimal history, calm work stage, and low-distraction decision cards.', choices:[4,6,7,7,0,4,0] },
    { name:'Agent Operations', desc:'Visible child-agent lanes, agent board detail, worktree history, and evidence decisions.', choices:[5,2,6,4,4,5,7] },
    { name:'Progressive Receipt', desc:'Work metrics assemble in place, dashboard details, editorial transcript, and queue decisions.', choices:[3,1,4,1,7,3,6] },
    { name:'Ribbon Command', desc:'Tool-ribbon work, command-strip activity, status rail, and compact decision stepper.', choices:[6,7,3,2,6,7,4] },
    { name:'Creative Stage', desc:'Layered composer, workbench animation, grouped history, split detail, and anchored questions.', choices:[7,4,5,5,3,2,2] }
  ];

  const themes = [
    { id:'basic-dark', name:'Basic Dark' }, { id:'basic-light', name:'Basic Light' },
    { id:'friendly-dark', name:'Friendly Dark' }, { id:'friendly-light', name:'Friendly Light' },
    { id:'glass-dark', name:'Glass Dark' }, { id:'glass-light', name:'Glass Light' },
    { id:'retro-dark', name:'Retro Dark' }, { id:'retro-light', name:'Retro Light' }
  ];


  /* The one list of working-animation takes. app.js derives the Demo Studio
     option names from this, and the feature manifest reports its length, so
     adding a take here is the only edit needed to surface it everywhere. */
  const workingTakes = [
    'Reference Morph','Orbit','Step Stack','Tool Ribbon',
    'Progressive Receipt','Workbench','Agent Stage','Calm Stage',
    'Step Rail','Word Stream','Tool Collapse','Diff Tape',
    'Signal Meter','Blueprint','Timeline Scrub','Terminal Cast',
    'Loom','Pulse Grid','Ledger','Constellation',
    'Metronome','Filmstrip','Sonar','Circuit'
  ];


  /* The one list of transcript takes. Options 0-7 are the original set;
     8-15 are drawn from a survey of open-source AI chat clients. */
  const transcriptTakes = [
    'Wide Prose','Assistant Cards','Speaker Grid','Journal Stream',
    'Editorial Reading','Layered Technical','Terminal Dense','Stage Layout',
    'Aligned Bubbles','Zebra Rows','Sticky Rail','Timeline Gutter',
    'Notebook Cells','Focus Reader','Print Sheet','Threaded Turns'
  ];


  window.PM56_DATA = {
    /* enum -> human copy; no raw enum value is ever user-facing */
    labels,
    /* working animation */
    workSteps, phaseMeta, phaseRows, phaseGroups,
    /* activity domains */
    artifacts, subagents, subagentGroups, todos, changes,
    /* conversation */
    threads,
    /* context (consumed by the Wave 3 Context agent) */
    contextSources, contextWindow, contextCompaction, contextByThread, compactionOutcomes,
    /* configuration */
    recipes, themes, models, accounts, accountsNeedingAttention,
    questions, questionFlows, questionQueueDepth,
    /* operations */
    operational, warnings, scriptedReplies, drafts,
    workingTakes, transcriptTakes
  };

  /* Final feature manifest used by the concept lab's self-audit and Demo
     Studio. Every count below is DERIVED from the collections above --
     the previous version hand-listed four numbers that the fixtures
     disproved (10 artifact kinds against 13 records, 8 demo threads
     against 24, 9 working states against 14 steps, and a 5-item artifact
     status list that never mentioned `loading`). A manifest that has to
     be edited by hand when a fixture changes is a manifest that lies. */
  const D0 = window.PM56_DATA;
  const uniq = (xs) => [...new Set(xs)];
  const cap = (s) => String(s).replace(/^./, (c) => c.toUpperCase());

  window.PM56_FEATURE_MANIFEST = Object.freeze({
    context: ['Compact Now', 'More Details', 'Current window', 'Tokens loaded', 'Cache hit', 'Source composition'],
    activityDomains: ['Goal', 'Todo', 'Subagents', 'Changes', 'Artifacts'],
    workingControls: ['Start', 'Pause', 'Step', 'Complete', 'Reset', 'History'],
    workingStates: D0.workSteps.map((s) => s.label),
    workingTakes: D0.workingTakes.slice(),
    transcriptTakes: D0.transcriptTakes.slice(),
    decisions: ['Approve', 'Revise', 'Build', 'Questionnaire', 'Permission', 'Conflict'],
    messageActions: ['Copy', 'Edit and branch', 'Re-answer', 'More details'],
    threadActions: ['Pin', 'Rename', 'Fork', 'Archive', 'Restore', 'Search'],
    demoThreads: D0.threads.map((t) => t.title),
    artifactKinds: uniq(D0.artifacts.map((a) => a.kind)).map(cap),
    artifactStates: uniq(D0.artifacts.map((a) => a.status)).map((s) => D0.labels.artifactStatus[s] || cap(s)),
    changeStates: uniq(D0.changes.map((c) => c.status)).map((s) => D0.labels.changeStatus[s] || cap(s)),
    subagentStates: uniq(D0.subagents.map((a) => a.status)).map((s) => D0.labels.subagentStatus[s] || cap(s)),
    todoStates: uniq(D0.todos.map((t) => t.status)).map((s) => D0.labels.todoStatus[s] || cap(s)),
    modelStates: uniq(D0.models.map((m) => m.status)).map((s) => D0.labels.modelStatus[s] || cap(s)),
    worktreeStates: uniq(D0.operational.worktrees.map((w) => w.state)).map((s) => D0.labels.worktreeState[s] || cap(s)),
    contextFamilies: D0.contextSources.map((s) => s.family),
    selectors: ['Persona', 'Model', 'Mode', 'Permissions', 'Worktree'],
    persistence: ['No passive questionnaire expiry', 'Per-thread drafts', 'Draft history'],

    /* The one place a number appears, it is computed. */
    counts: Object.freeze({
      threads: D0.threads.length,
      activeThreads: D0.threads.filter((t) => !t.archived).length,
      archivedThreads: D0.threads.filter((t) => t.archived).length,
      messages: D0.threads.reduce((s, t) => s + t.messages.length, 0),
      minThreadMessages: Math.min(...D0.threads.map((t) => t.messages.length)),
      maxThreadMessages: Math.max(...D0.threads.map((t) => t.messages.length)),
      changedFiles: D0.changes.length,
      diffHunks: D0.changes.reduce((s, c) => s + (c.hunks ? c.hunks.length : 0), 0),
      linesAdded: D0.changes.reduce((s, c) => s + (c.add || 0), 0),
      linesDeleted: D0.changes.reduce((s, c) => s + (c.del || 0), 0),
      subagents: D0.subagents.length,
      todos: D0.todos.length,
      artifacts: D0.artifacts.length,
      models: D0.models.length,
      workSteps: D0.workSteps.length,
      phaseRowSets: Object.keys(D0.phaseRows).length,
      accounts: D0.accounts.length,
      accountsNeedingAttention: D0.accountsNeedingAttention.length,
      questionFlows: D0.questionFlows.length,
      questions: D0.questionFlows.reduce((s, f) => s + f.questions.length, 0),
      questionsQueued: D0.questionQueueDepth,
      contextSources: D0.contextSources.length,
      contextThreads: Object.keys(D0.contextByThread).length,
      worktrees: D0.operational.worktrees.length,
      portLeases: D0.operational.ports.length,
      warnings: D0.warnings.length,
      scriptedReplies: D0.scriptedReplies.length,
      drafts: D0.drafts.length
    }),

    /* Families 2 and 5 are owned by data.js and derived. The other five
       option-name arrays live in app.js's renderDemoDialog(), so their
       size is stated as a contract, not measured -- if app.js ever ships
       a family with a different length, that is the mismatch to fix. */
    optionFamilies: Object.freeze({
      bodyVariants: 8,
      historyVariants: 8,
      workingVariants: D0.workingTakes.length,
      activityVariants: 8,
      detailVariants: 8,
      transcriptVariants: D0.transcriptTakes.length,
      questionVariants: 8
    })
  });
})();
