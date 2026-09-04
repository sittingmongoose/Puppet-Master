/* plans.js — feature module.  OWNER: Assistant-redesign wave (2026-09-03) — Plan card agent.
 *
 * Load order (see build.py): data.js, motion.js, variants-*.js, then EVERY feature
 * module, then app.js.  This file runs BEFORE the app boots, so the fixtures it
 * attaches are live on the very first render — no re-render, no flash.
 *
 * WHAT THIS FILE OWNS
 * -------------------
 * The `plan-card-v2` transcript card described by Plans/Assistant_Plan_Runtime.md
 * (APR-003, APR-004, APR-006, APR-007, APR-010, APR-011) and FinalGUISpec §6 of the
 * 2026-09-03 Assistant Redesign section:
 *   - one Plan identity with a `Plan · Vn` badge whose id never changes,
 *   - one document family with Rich Text (default) and read-only Markdown projections,
 *   - NO editable caret anywhere: the body is never a textarea and never contenteditable,
 *   - exactly ONE primary control cycling Build -> Building… -> Completed | Canceled,
 *   - Build With Crew / Build At… modals, Revise-to-composer, Wizard handoff, Export,
 *   - the one-unfinished-Plan-per-thread invariant, enforced with a visible reason.
 *
 * WHAT THIS FILE IS HONEST ABOUT
 * ------------------------------
 * Nothing here is a native command.  `cmd.chat.plan.build`, `cmd.chat.plan.export`
 * and the rest are unregistered (Assistant_Plan_Runtime.md §11 says controls stay
 * disabled with `command_not_registered` until the catalog closes), so every control
 * below changes FIXTURE state and renders the result.  A demo PlanRun is a scripted
 * sequence of fixture mutations driven by setTimeout; the runtime spec is explicit
 * that no client-local timer is authoritative, and the card says so in More Info.
 * Export is the one control that reaches the real browser: it builds a Blob and asks
 * for a download, and if the browser refuses it says so rather than claiming success
 * (same contract as `exportContextJson` in app.js).
 *
 * The built-in `plan-card` message type is NOT touched.  `transcriptMessage` is a
 * decline-able replace slot; this module returns '' for every type except
 * `plan-card-v2`, so app.js's renderPlanCard and the two fixtures that use it
 * (`query` and `plan-deep`) render exactly as they did before.
 */
(function(){
  'use strict';
  var D = window.PM56_DATA; if(!D) return;
  var EXT = window.PM56_EXT; if(!EXT || !EXT.slot) return;

  /* =====================================================================
     0. SHARED RUNTIME
     ---------------------------------------------------------------------
     app.js ends with `window.PM56_RUNTIME = runtime;` (the FINAL RUNTIME
     DIAGNOSTICS IIFE), and that runs AFTER every feature module.  A plain
     `window.PM56_RUNTIME = window.PM56_RUNTIME || {}` therefore survives only
     as a closure reference; anything that re-reads the GLOBAL after boot —
     app.js's own `window.PM56_RUNTIME.collab` read included — sees the
     diagnostics object and none of this wave's shared state.

     So install a merging accessor once, before that happens: an assignment
     copies the incoming property DESCRIPTORS onto the persistent store rather
     than replacing it.  Descriptors, not values, because the diagnostics
     object exposes `ready` as a getter — copying it by value would freeze one
     boolean forever.  `snapshot()` and the error listeners keep working: they
     read `this.errors` / `window.__PM56_BOOT_OK`, and `errors` is copied by
     reference so the listeners' pushes are still visible.

     Idempotent and configurable.  Whichever module of the wave loads first
     installs it; the rest get the same store back.
     ===================================================================== */
  function sharedRuntime(){
    var desc = Object.getOwnPropertyDescriptor(window,'PM56_RUNTIME');
    if(desc && desc.get && window.__pm56RuntimeMerge) return window.PM56_RUNTIME;
    var store = (desc ? window.PM56_RUNTIME : null) || {};
    try{
      Object.defineProperty(window,'PM56_RUNTIME',{
        configurable:true,
        get:function(){ return store; },
        set:function(v){
          if(!v || v===store) return;
          try{ Object.defineProperties(store, Object.getOwnPropertyDescriptors(v)); }
          catch(e){ for(var k in v){ try{ store[k]=v[k]; }catch(e2){} } }
        }
      });
      window.__pm56RuntimeMerge = true;
    }catch(e){ try{ window.PM56_RUNTIME = store; }catch(e2){} }
    return store;
  }
  var RT = sharedRuntime();
  /* Owned by composer-state.js; created here only so a Revise before that
     module lands still has somewhere true to write. */
  RT.composer = RT.composer || { buffers:{}, destination:null, history:{}, historyIndex:{} };

  function esc(s){
    return String(s==null?'':s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function list(v){ return Array.isArray(v)?v:[]; }

  /* =====================================================================
     1. THE DOCUMENT MODEL
     ---------------------------------------------------------------------
     One structured block list per revision, exactly as APR-003 describes it:
     Rich Text and Markdown are two PROJECTIONS of the same array, so they can
     never drift, and neither of them is editable.  Block types used here are a
     subset of the canonical set: heading, paragraph, ordered_list,
     unordered_list, todo_like_plan_step, table, code, artifact, callout.
     A plan-step block carries its own stable `plan_step_id`, `depends_on[]`
     and optional `parallel_group_id`, which is what lets the Building… gutter
     mark a step without mutating one byte of approved Markdown.
     ===================================================================== */
  function h(text,d){ return { t:'heading', d:d||2, text:text }; }
  function p(text){ return { t:'paragraph', text:text }; }
  function ul(items){ return { t:'unordered_list', items:items }; }
  function ol(items){ return { t:'ordered_list', items:items }; }
  function tbl(head,rows){ return { t:'table', head:head, rows:rows }; }
  function code(lang,text){ return { t:'code', lang:lang, text:text }; }
  function art(id,label,kind){ return { t:'artifact', id:id, label:label, kind:kind||'artifact' }; }
  function callout(tone,text){ return { t:'callout', tone:tone, text:text }; }
  function step(id,title,text,deps,group){
    return { t:'plan_step', plan_step_id:id, title:title, text:text,
             depends_on:deps||[], parallel_group_id:group||null, parent_step_id:null };
  }
  /* Additive Correction v4, PPROG-003/004: a step may have children, which is
     what makes `mixed` a real aggregate state rather than a label. The parent
     link lives on the CHILD so the parent block stays byte-identical. */
  function substep(id,parent,title,text,deps){
    var s=step(id,title,text,deps); s.parent_step_id=parent; return s;
  }
  /* PDET-008: a PlanArtifactEmbed freezes artifact id AND version, the renderer
     kind, the caption, the text summary and the static fallback at approval.
     `state` is what the renderer resolved to -- `ok`, or one of the four
     unavailable reasons -- and is deliberately part of the fixture so the
     unavailable path is demonstrable rather than described. */
  function embed(o){
    /* `artifact_version` is an INTEGER in the typed contract
       (pm.assistant_plan.artifact_embed.v1). It used to be stored as the
       display string `'v3'`, which is a label, not a version: an integer
       compares and orders, a label does not, and a native port reusing this
       shape would have inherited a string where the schema says integer.
       The label is kept separately so every rendered surface and the Markdown
       projection still read `art-x@v3` and the document bytes do not move. */
    var raw=o.artifact_version, n=parseInt(String(raw).replace(/^v/i,''),10);
    return { t:'plan_embed', block_id:o.block_id, artifact_id:o.artifact_id,
             artifact_version:isNaN(n)?0:n,
             artifact_version_label:(typeof raw==='string'&&/^v/i.test(raw))?raw:('v'+(isNaN(n)?0:n)),
             renderer_kind:o.kind,
             display:o.display||'inline', caption:o.caption,
             text_summary:o.summary, static_fallback_ref:o.fallback||null,
             source_ref:o.source||null, sandboxed:!!o.sandboxed,
             state:o.state||'ok', preview:o.preview||null };
  }
  /* Every display site resolves the label through here, so a future embed that
     forgets one still renders a version rather than `undefined`. */
  function embedVer(b){ return b.artifact_version_label || ('v'+b.artifact_version); }

  /* ------------------------------------------------------- ap-index V1..V5
     ONE identity, five immutable revisions.  The early drafts are genuinely
     shorter because they genuinely were shorter — a fixture that shipped the
     same body under five different badges would be demonstrating nothing. */
  var IDX_V1 = [
    h('Objective'),
    p('Add a composite index to the tenant-scoped analytics read path so the dashboard stops timing out.'),
    h('Steps'),
    step('ps-1','Add the composite index','Create idx_events_tenant_created over (tenant_id, created_at DESC).'),
    step('ps-2','Re-run the benchmark','Confirm the read win against the existing benchmark harness.',['ps-1'])
  ];
  var IDX_V2 = [
    h('Objective'),
    p('Add a composite index to the tenant-scoped analytics read path and measure it against a benchmark fixture that matches production row shape.'),
    h('Measured starting point'),
    tbl(['Measurement','Reported','At production row shape'],
        [['p95 read','310 ms','482 ms'],['Rows in fixture','3,200','128,400'],['Tenants','8','214']]),
    h('Steps'),
    step('ps-0','Correct the benchmark fixture','Rebuild the fixture at 214 tenants and 128,400 rows before any change is measured.'),
    step('ps-1','Add the composite index','Create idx_events_tenant_created over (tenant_id, created_at DESC).',['ps-0']),
    step('ps-2','Re-run the benchmark','Record p50, p95 and throughput against the corrected fixture.',['ps-1'])
  ];
  var IDX_V3 = IDX_V2.slice(0,5).concat([
    step('ps-0','Correct the benchmark fixture','Rebuild the fixture at 214 tenants and 128,400 rows before any change is measured.'),
    step('ps-1','Add the composite index','Create idx_events_tenant_created over (tenant_id, created_at DESC).',['ps-0']),
    step('ps-2','Remove the N+1 fan-out','Replace the per-tenant loop with one tenant-first batched query.',['ps-1']),
    step('ps-3','Measure write amplification','Insert 50,000 rows and record the write overhead the index adds.',['ps-1']),
    h('Acceptance'),
    ul(['p95 read below 100 ms at production row shape',
        'No tenant crossover in the isolation test',
        'Write overhead below 8%'])
  ]);
  var IDX_V4 = IDX_V3.concat([
    h('Rollback'),
    p('The forward migration is rehearsed against a restored snapshot before it ships. The materialized view stays documented as a fallback rather than becoming the default: it adds refresh lag and a second piece of operational state for a win the index already delivers.'),
    callout('warning','The 8% write-amplification threshold comes from incident history, not from a principle. It is the largest write regression this project has never paged on.')
  ]);
  var IDX_V5 = [
    h('Objective'),
    p('Bring the tenant-scoped analytics read path under a 100 ms p95 at production row shape without exceeding the accepted 8% write-amplification threshold, and ship it behind a rehearsed rollback.'),
    h('Measured starting point'),
    p('Every number below is measured against the corrected fixture. The originally reported 310 ms p95 was taken against an 8x400-row fixture small enough that a sequential scan wins, so it was hiding the effect it was supposed to measure.'),
    tbl(['Measurement','Baseline','Target','Measured after'],
        [['p95 read','482 ms','< 100 ms','71 ms'],
         ['p50 read','118 ms','—','24 ms'],
         ['Throughput','1,420 rows/s','—','3,980 rows/s'],
         ['Write overhead','0%','< 8%','+4.8%']]),
    h('Steps'),
    step('ps-0','Correct the benchmark fixture','Rebuild the benchmark at 214 tenants and 128,400 rows, and record the baseline before any change lands.'),
    step('ps-1','Add the composite index','idx_events_tenant_created over (tenant_id, created_at DESC), created concurrently.',['ps-0'],'pg-index'),
    step('ps-2','Measure write amplification','50,000 inserts, measured rather than estimated, against the accepted 8% ceiling.',['ps-0'],'pg-index'),
    step('ps-3','Remove the N+1 fan-out','One tenant-first batched query replaces the two per-tenant call sites.',['ps-1']),
    step('ps-4','Rehearse the rollback','Restore a snapshot and run the down migration before the forward migration ships.',['ps-1']),
    step('ps-5','Publish the comparison','Report the write cost beside the read win in the same artifact.',['ps-2','ps-3']),
    h('Migration note','3'),
    p('CREATE INDEX CONCURRENTLY takes two table passes and cannot run inside a transaction block. Every migration file in this repository is wrapped in one, so the index moves into its own no-transaction migration. This is the change that produced V4.'),
    code('sql','-- 0043_events_tenant_created.sql\n-- pm:no-transaction\nCREATE INDEX CONCURRENTLY IF NOT EXISTS\n  idx_events_tenant_created\n  ON events (tenant_id, created_at DESC);'),
    h('Acceptance'),
    ul(['p95 read below 100 ms at production row shape',
        'No incorrect tenant crossover in the isolation test',
        'Write overhead below 8%, measured over 50,000 inserts',
        'All tests green, including the rollback rehearsal']),
    h('Evidence'),
    art('dashboard-query','Query Benchmark Dashboard','dashboard'),
    callout('warning','Two things are still unmeasured and are named rather than hidden: behaviour under concurrent write load, and whether the planner still selects the index after a statistics refresh under the current autovacuum settings.')
  ];

  /* ---------------------------------------------------------- ap-cache V1
     A DEEP Plan.  Same document model, different BACKEND: this one is
     `ledger_bound`, so it carries a run-scoped ledger and, after Build
     approval, a scoped PlanUnit bundle.  Both live behind More Info because
     §5.4 is explicit that Deep Plan uses STANDARD ledger/PlanUnit shapes while
     remaining an Assistant task Plan -- showing them as first-class card body
     would be exactly the "every Assistant Plan is a canonical repository Plan"
     conflation the packet retires. */
  var CACHE_V1 = [
    h('Objective'),
    p('Replace the per-request cache stampede on the session read path with a single-flight loader, and prove the failure mode is gone under the load that produced it.'),
    h('What the ledger established'),
    p('Five sources were read before this Plan existed; the two that changed the shape of it are named here rather than summarised away.'),
    tbl(['Source','What it settled'],
        [['incident 2026-08-19 timeline','The stampede is on cold-start, not steady state'],
         ['session_store.rs:210-288','Three call sites share one uninstrumented cache read'],
         ['bench/session_load.rs','The existing benchmark never models a cold cache']]),
    h('Alternatives considered'),
    ul(['Single-flight loader — chosen. Bounded change, no new operational state.',
        'Probabilistic early expiry — rejected: smooths the curve but does not remove the stampede, and adds a tuning constant nobody owns.',
        'Warm-on-deploy — rejected as the primary fix: it hides cold-start rather than fixing it, and the first cache miss after an eviction still stampedes.']),
    h('Steps'),
    step('cs-0','Instrument the cache read path','Add hit/miss/inflight counters at the three call sites so the fix is measurable before it lands.'),
    step('cs-1','Model cold start in the benchmark','Extend bench/session_load.rs with a cold-cache phase; the current benchmark cannot reproduce the incident.',['cs-0']),
    step('cs-2','Add the single-flight loader','One in-flight future per key, shared by every waiter.',['cs-0'],'sf-core'),
    substep('cs-2a','cs-2','Share one in-flight future per key','Replace the three independent loads with a keyed in-flight map.',['cs-0']),
    substep('cs-2b','cs-2','Bound the shared future','A shared future needs one owner for timeout and cancellation; this is that decision.',['cs-2a']),
    step('cs-3','Decide the failure policy','A failed load must not be cached and must not leave waiters hanging; this is a behaviour decision, not a detail.',['cs-0'],'sf-core'),
    step('cs-4','Re-run under the incident load','Reproduce the incident profile against the corrected benchmark.',['cs-1','cs-2','cs-3']),
    step('cs-5','Validate eviction behaviour','Confirm an eviction mid-flight does not resurrect a stale value.',['cs-2']),
    step('cs-6','Backfill the ops dashboard panel','Surface the new counters where the on-call already looks.',['cs-0']),
    h('Risks'),
    ul(['A shared future turns three independent timeouts into one shared timeout; the failure policy step exists because of that.',
        'The counters added in cs-0 are permanent surface area, not scaffolding, and are named in the acceptance list for that reason.']),
    h('Acceptance'),
    ul(['No more than one origin load per key per cold-start window, measured',
        'Waiters observe the same error as the loader, and no error is cached',
        'p99 cold-start latency below the incident threshold',
        'Eviction mid-flight yields no stale read']),
    callout('info','This Plan is ledger-bound. The scoped PlanUnit bundle is materialised at Build, not now, and is scoped to plan_id + version. It does not write the global PlanUnit index.')
  ];

  /* ------------------------------------------------------- ap-auth (done)
     A short COMPLETED Plan, kept so the historical-compact renderer has a real
     terminal card to draw and the one-current-Plan invariant has a genuine
     non-current sibling to ignore. */
  var AUTH_V2 = [
    h('Objective'),
    p('Move refresh-token rotation off the request path so a slow identity provider stops holding request threads.'),
    h('Steps'),
    step('as-0','Move rotation to the background worker','Rotation runs ahead of expiry rather than on the first request that notices.'),
    step('as-1','Keep a synchronous fallback','If the background rotation has not run, the request path still rotates rather than failing.',['as-0']),
    step('as-2','Alarm on fallback use','A fallback that fires regularly means the background path is broken and silent.',['as-1']),
    h('Acceptance'),
    ul(['No request-path rotation under normal operation',
        'Fallback path exercised by test and alarmed in production'])
  ];

  /* ------------------------------------------------------ ap-flags (canceled) */
  var FLAGS_V1 = [
    h('Objective'),
    p('Introduce a typed feature-flag facade over the three ad-hoc flag lookups in the billing path.'),
    h('Steps'),
    step('fs-0','Inventory the existing lookups','Three call sites, two of which disagree about the default.'),
    step('fs-1','Define the typed facade','One accessor, one default, one place to change it.',['fs-0'])
  ];

  /* =====================================================================
     2. PLAN RECORDS
     ---------------------------------------------------------------------
     `AssistantPlan` per 01_IMPLEMENTATION_SPEC §5.1.  One record per plan
     IDENTITY; `revisions` holds the immutable document per version, so a V4
     card and a V5 card are the same plan_id with two frozen bodies.  There is
     no `superseded` status anywhere in this file -- §5.7 retires it, and the
     historical cards below carry `completed`/`canceled` instead.

     `status` is the BUILD CONTROL state, and it is the only thing the primary
     control reads:  ready -> building -> completed | canceled.
     `wait` is support copy ONLY.  It never becomes a fifth button state; the
     button still says Building… while `wait` explains why nothing is moving.
     =====================================================================*/
  function planRec(o){
    return {
      demo:true,
      plan_id:o.id, thread_id:o.thread, title:o.title,
      strategy:o.strategy,                   /* Quick|Standard|Thorough|Deep:… */
      backend:o.backend,                     /* direct | ledger_bound */
      version:o.version,
      revisions:o.revisions,                 /* { 1:[blocks], 2:[blocks], … } */
      status:o.status,                       /* ready|building|completed|canceled */
      wait:o.wait||null,                     /* support copy under Building… */
      /* Additive Correction v4 (PFAIL-002): the secondary condition beside
         the Build control. Never a fifth button label. */
      attention:o.attention||null,
      attempts:o.attempts||1,
      topology:o.topology||'agent',           /* agent | goal_driven | crew */
      goalBinding:null,
      grillMe:!!o.grillMe,
      deviations:o.deviations||[],
      view:'rich',                           /* local view state: rich|markdown */
      current:!!o.current,
      approved:o.approved||null,             /* {version,hash,at} frozen at Build */
      buildStep:0,                           /* index into step list while building */
      planunits:o.planunits||null,           /* Deep Plan only, scoped bundle */
      ledger:o.ledger||null,                 /* Deep Plan only */
      wizard:null,                           /* handoff receipt once sent */
      crew:null,                             /* Build With Crew freeze */
      schedule:null,                         /* Build At binding */
      exports:[],                            /* export receipts */
      cancelReason:o.cancelReason||null,
      revisionLog:o.revisionLog||[],
      /* PDET-001. Details must show creation/revision SOURCES, the source
         messages, the attachments the Plan was built from, the research it
         admitted and its run history -- not only identity, hash and backend.
         These are REFERENCES into the shared owners (message ids, attachment
         ids, research receipts, run ids); the Plan stores no second copy of
         any artifact's metadata, which is what PDET-001's "use shared route/
         artifact identities" forbids. */
      sources:o.sources||[],                 /* [{kind, ref, at, note}] */
      attachmentRefs:o.attachmentRefs||[],   /* [attachment_id] into attachments.js */
      research:o.research||[],               /* [{ref, kind, at, summary}] */
      runHistory:o.runHistory||[],           /* [{run_id, attempt, outcome, at, reason}] */
      _approvedSeed:o.approvedSeed||null,
      _unitsSeed:o.unitsSeed||null,
      _todosSeed:o.todosSeed||null
    };
  }

  function hashOf(s){
    /* A stable, visible, obviously-not-cryptographic content hash. Build
       freezes an exact version+hash (§5.9) and Build At binds it (§5.12), so
       the number has to be real and derived from the body -- a random literal
       could not demonstrate the invalidation path. */
    var x=0x811c9dc5, str=JSON.stringify(s);
    for(var i=0;i<str.length;i++){ x^=str.charCodeAt(i); x=(x*0x01000193)>>>0; }
    return 'sha-demo:'+('00000000'+x.toString(16)).slice(-8);
  }


  /* ------------------------------------------------------------ ap-embeds
     Additive Correction v4, CONCEPT-007. Every renderer kind the correction
     names, each frozen to an exact artifact version, plus one of each
     unavailable reason. Nothing here is a Plan-local renderer: the `ok` blocks
     route to the shared artifact viewer app.js already owns, and the four
     unavailable blocks render an explicit reason instead of disappearing. */
  var EMBED_V1 = [
    h('Objective'),
    p('Carry the measured evidence for the read-path work inside the Plan itself, at the exact artifact versions that were approved, so a later change to any of them cannot silently change what this Plan says.'),
    h('Evidence'),
    embed({block_id:'em-mermaid', artifact_id:'art-flow-read-path', artifact_version:'v3', kind:'mermaid',
           caption:'Read path before and after the index change',
           summary:'Two lanes: the current path fans out per tenant row; the corrected path resolves one covering index scan.',
           fallback:'art-flow-read-path@v3.png'}),
    embed({block_id:'em-chart', artifact_id:'art-p99-by-tenant', artifact_version:'v7', kind:'chart',
           caption:'p99 by tenant size, 24h window',
           summary:'p99 rises linearly with tenant row count above 40k rows; below that it is flat.',
           fallback:'art-p99-by-tenant@v7.svg', preview:'bar'}),
    embed({block_id:'em-graph', artifact_id:'art-call-graph', artifact_version:'v2', kind:'graph',
           caption:'Call graph for the analytics read',
           summary:'Four call sites reach the same query builder; two of them bypass the tenant scope.',
           fallback:'art-call-graph@v2.svg'}),
    embed({block_id:'em-image', artifact_id:'art-explain-plan', artifact_version:'v1', kind:'image',
           caption:'EXPLAIN ANALYZE output, annotated',
           summary:'Sequential scan on analytics_events with a 41x row estimate error.',
           fallback:'art-explain-plan@v1.png'}),
    embed({block_id:'em-diagram', artifact_id:'art-schema-delta', artifact_version:'v4', kind:'diagram',
           caption:'Schema delta',
           summary:'One partial index added; no column change; no destructive migration.',
           fallback:'art-schema-delta@v4.svg'}),
    embed({block_id:'em-checklist', artifact_id:'art-rollout-checks', artifact_version:'v2', kind:'checklist',
           caption:'Rollout checks',
           summary:'Six checks, all read-only, none of which is a To-Do: this is a document block, not the To-Do list.'}),
    embed({block_id:'em-video', artifact_id:'art-repro-capture', artifact_version:'v1', kind:'video',
           caption:'Reproduction capture, 38s',
           summary:'Screen capture of the stall reproducing under the 40k-row tenant.',
           fallback:'art-repro-capture@v1-frame.png'}),
    embed({block_id:'em-interactive', artifact_id:'art-latency-explorer', artifact_version:'v5', kind:'interactive',
           caption:'Latency explorer',
           summary:'Filterable latency table; runs sandboxed, and exports as the static table below.',
           fallback:'art-latency-explorer@v5-table.png', sandboxed:true}),
    tbl(['Renderer','Frozen version','PDF behaviour'],
        [['mermaid','v3','rendered'],['chart','v7','rendered'],['video','v1','static frame + caption'],
         ['interactive','v5','static table + caption']]),
    code('sql','CREATE INDEX CONCURRENTLY idx_events_tenant_created\n  ON analytics_events (tenant_id, created_at DESC);'),
    h('Embeds that could not resolve'),
    p('Four blocks below name why they are unavailable. None of them was dropped, and none of them resolved to a different version of the same artifact.'),
    embed({block_id:'em-missing', artifact_id:'art-deleted-trace', artifact_version:'v1', kind:'chart',
           caption:'Trace waterfall (missing)', summary:'The referenced artifact revision no longer exists.',
           state:'missing'}),
    embed({block_id:'em-stale', artifact_id:'art-row-counts', artifact_version:'v2', kind:'chart',
           caption:'Row counts (stale)', summary:'The approved v2 exists but its source data has been superseded; v5 is current.',
           state:'stale'}),
    embed({block_id:'em-denied', artifact_id:'art-prod-dashboard', artifact_version:'v9', kind:'image',
           caption:'Production dashboard (denied)', summary:'Reading this artifact requires a permission this project does not hold.',
           state:'denied'}),
    embed({block_id:'em-unsupported', artifact_id:'art-cad-model', artifact_version:'v1', kind:'cad',
           caption:'CAD model (unsupported)', summary:'No registered renderer claims kind `cad`.',
           state:'unsupported'}),
    callout('info','An approved Plan resolves the frozen artifact_version. Changing any artifact above later does not change one byte of this document; the Plan would show an unavailable block rather than a different picture.')
  ];

  var PLANS0 = {
    'ap-index': planRec({
      id:'ap-index', thread:'query', title:'Tenant-scoped analytics read path',
      strategy:'Thorough', backend:'direct', version:5, current:true, status:'ready',
      revisions:{1:IDX_V1,2:IDX_V2,3:IDX_V3,4:IDX_V4,5:IDX_V5},
      revisionLog:[
        {v:2,at:'11:42',why:'Benchmark fixture did not match production row shape.'},
        {v:3,at:'12:05',why:'Add the N+1 fan-out and write-amplification work.'},
        {v:4,at:'12:31',why:'CREATE INDEX CONCURRENTLY cannot run inside a transaction.'},
        {v:5,at:'12:58',why:'Fold in measured results and name what is still unmeasured.'}
      ],
      /* PDET-001: where this Plan CAME FROM, by reference. */
      sources:[
        {kind:'creation', ref:'msg:query-014', at:'11:20', note:'User request that opened planning.'},
        {kind:'revision', ref:'msg:query-031', at:'12:05', note:'Revision V3 requested in prose.'},
        {kind:'revision', ref:'msg:query-047', at:'12:58', note:'Revision V5 requested after the benchmark.'}
      ],
      attachmentRefs:['att-explain-plan','att-bench-csv'],
      research:[
        {ref:'research:pg-partial-index', kind:'external', at:'11:34', summary:'Partial index behaviour under CONCURRENTLY.'},
        {ref:'research:repo-query-builder', kind:'repository', at:'11:41', summary:'Four call sites reach one query builder.'}
      ],
      runHistory:[]
    }),
    'ap-cache': planRec({
      id:'ap-cache', thread:'plan-deep', title:'Session cache stampede',
      strategy:'Deep · Thorough', backend:'ledger_bound', version:1, current:true,
      status:'building',
      /* PFAIL-001..002: the button reads Building… and this is the SECONDARY
         truth beside it, with the exact owner reason and the owner-admitted
         actions. It is not a fifth button label. */
      attention:{ kind:'window',
        reason:'Outside the configured execution window (22:00–06:00). The run resumes at the next window; no client timer is authoritative.',
        actions:['resume','details','cancel'] },
      revisions:{1:CACHE_V1},
      /* This Plan is ALREADY building in the fixture, so it must carry what a
         real Build produced: the frozen approval, the materialised scoped
         bundle and the To-Do mapping. Without them the card claimed a state
         nothing had entered -- Building… with no evidence of admission, which
         is exactly the "represent an unimplemented backend as working" the
         packet forbids. `globalIndex:false` and `worknodes:0` are the two
         facts that keep a Deep Plan distinct from the canonical pipeline. */
      approvedSeed:{ version:1, hash:null, at:'9:41 PM',
        runtime:'Claude Opus 5', permissions:'Auto', worktree:'feature/session-cache',
        orchestrator:false },
      unitsSeed:{ at:'9:41 PM', validated:true, globalIndex:false, worknodes:0 },
      todosSeed:{ at:'9:41 PM', from:'planunits' },
      sources:[
        {kind:'creation', ref:'msg:plan-deep-006', at:'9:30 PM', note:'Deep Plan requested for the incident.'}
      ],
      attachmentRefs:['att-incident-timeline'],
      research:[
        {ref:'research:session-store-read', kind:'repository', at:'9:33 PM', summary:'session_store.rs:210-288 read path.'}
      ],
      /* PFAIL-003: a failed ATTEMPT is history under ONE run, not a second run. */
      runHistory:[
        {run_id:'run-ap-cache-V1', attempt:1, outcome:'failed', at:'9:52 PM',
         reason:'Provider connection dropped mid-step; no side effect was replayed.'},
        {run_id:'run-ap-cache-V1', attempt:2, outcome:'running', at:'10:04 PM', reason:''}
      ],
      ledger:{ id:'apl-20260903-001', scope:'run', entries:[
        {k:'source',   v:'incident 2026-08-19 timeline'},
        {k:'source',   v:'session_store.rs:210-288'},
        {k:'source',   v:'bench/session_load.rs'},
        {k:'question', v:'Should a failed load be cached? — answered: no'},
        {k:'decision', v:'Single-flight over probabilistic early expiry'},
        {k:'rejected', v:'Warm-on-deploy as the primary fix'}
      ]},
      planunits:[
        {id:'APU-ap-cache-1', step:'cs-0', title:'Instrument the cache read path',
         acceptance:['hit/miss/inflight counters at all three call sites'],
         negative:['no counter may allocate on the hot path'], deps:[]},
        {id:'APU-ap-cache-2', step:'cs-1', title:'Model cold start in the benchmark',
         acceptance:['benchmark reproduces the incident profile'], negative:[], deps:['APU-ap-cache-1']},
        {id:'APU-ap-cache-3', step:'cs-2', title:'Add the single-flight loader',
         acceptance:['one origin load per key per cold-start window'],
         negative:['must not introduce a second cache layer'], deps:['APU-ap-cache-1']},
        {id:'APU-ap-cache-4', step:'cs-3', title:'Decide the failure policy',
         acceptance:['waiters observe the loader error','no error is cached'], negative:[], deps:['APU-ap-cache-1']},
        {id:'APU-ap-cache-5', step:'cs-4', title:'Re-run under the incident load',
         acceptance:['p99 cold-start below the incident threshold'], negative:[], deps:['APU-ap-cache-2','APU-ap-cache-3','APU-ap-cache-4']},
        {id:'APU-ap-cache-6', step:'cs-5', title:'Validate eviction behaviour',
         acceptance:['eviction mid-flight yields no stale read'], negative:[], deps:['APU-ap-cache-3']}
      ]
    }),
    'ap-auth': planRec({
      id:'ap-auth', thread:'query', title:'Refresh-token rotation off the request path',
      strategy:'Standard', backend:'direct', version:2, status:'completed',
      revisions:{1:AUTH_V2,2:AUTH_V2}
    }),
    'ap-embeds': planRec({
      id:'ap-embeds', thread:'query', title:'Evidence pack for the read-path work',
      strategy:'Thorough', backend:'direct', version:1, status:'completed',
      revisions:{1:EMBED_V1}
    }),
    'ap-flags': planRec({
      id:'ap-flags', thread:'query', title:'Typed feature-flag facade',
      strategy:'Quick', backend:'direct', version:1, status:'canceled',
      revisions:{1:FLAGS_V1},
      cancelReason:'Canceled when a new Plan was requested for the same thread while this one was still unfinished.'
    })
  };

  /* Resolve the seeds into the same fields admitBuild() writes, so a fixture
     that starts mid-build is indistinguishable from one that got there by
     being built -- one shape, one renderer, no special case in the card. */
  function hydrate(records){
    Object.keys(records).forEach(function(k){
      var r=records[k];
      if(r._approvedSeed){
        var b=r.revisions[r.version]||[];
        r.approved = JSON.parse(JSON.stringify(r._approvedSeed));
        r.approved.plan_id = r.plan_id;
        r.approved.hash = hashOf(b);
        r.approved.step_ids = steps(b).map(function(s){ return s.plan_step_id; });
      }
      if(r._unitsSeed){
        r.unitsMaterialized = JSON.parse(JSON.stringify(r._unitsSeed));
        r.unitsMaterialized.scope = r.plan_id+'@V'+r.version;
        r.unitsMaterialized.count = list(r.planunits).length;
      }
      if(r._todosSeed){
        r.todosCreated = JSON.parse(JSON.stringify(r._todosSeed));
        r.todosCreated.count = list(r.planunits).length || steps(r.revisions[r.version]||[]).length;
      }
    });
    return records;
  }

  RT.plans = RT.plans || { records:hydrate(JSON.parse(JSON.stringify(PLANS0))), demo:true };
  function P(){ return RT.plans; }
  function rec(id){ return P().records[id]; }
  function body(r){ return r.revisions[r.version] || []; }
  function steps(blocks){ return list(blocks).filter(function(b){ return b.t==='plan_step'; }); }

  /* =====================================================================
     3. THE TWO PROJECTIONS
     ---------------------------------------------------------------------
     Rich Text and Markdown are rendered from the SAME block array, in the same
     order, from the same stable ids.  That is the whole reason the document is
     a tree and not two strings: two strings drift, and §5.1 says they are
     projections of one revision.  Neither projection is editable -- there is no
     `contenteditable`, no `<textarea>`, and no `<input>` anywhere in either.

     A harness can prove the non-drift claim cheaply: `blockIds(rich)` and
     `blockIds(markdown)` must be equal, and PM56_PLANS.projectionParity() below
     returns exactly that comparison.
     ===================================================================== */
  function blockId(b,i){ return b.plan_step_id || (b.t+'-'+i); }

  function richBlock(b,i,r){
    var k=' data-block-id="'+esc(blockId(b,i))+'"';
    switch(b.t){
      case 'heading':
        return '<h'+(b.d||2)+' class="pd-h pd-h'+(b.d||2)+'"'+k+'>'+esc(b.text)+'</h'+(b.d||2)+'>';
      case 'paragraph':
        return '<p class="pd-p"'+k+'>'+esc(b.text)+'</p>';
      case 'unordered_list':
        return '<ul class="pd-ul"'+k+'>'+list(b.items).map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>';
      case 'ordered_list':
        return '<ol class="pd-ol"'+k+'>'+list(b.items).map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ol>';
      case 'table':
        return '<div class="pd-table-wrap"'+k+'><table class="pd-table"><thead><tr>'+
          list(b.head).map(function(x){return '<th>'+esc(x)+'</th>';}).join('')+'</tr></thead><tbody>'+
          list(b.rows).map(function(row){ return '<tr>'+list(row).map(function(c){return '<td>'+esc(c)+'</td>';}).join('')+'</tr>'; }).join('')+
          '</tbody></table></div>';
      case 'code':
        return '<pre class="pd-code"'+k+' data-lang="'+esc(b.lang||'')+'"><code>'+esc(b.text)+'</code></pre>';
      case 'artifact':
        /* Embedded artifacts open in the NORMAL artifact viewer (§7.2), which
           app.js already owns as `open-artifact`. This is a route, not a
           second viewer. */
        return '<button class="pd-artifact" type="button" data-action="open-artifact" data-id="'+esc(b.id)+'"'+k+'>'+
          ICON.artifact+'<span class="pd-artifact-copy"><strong>'+esc(b.label)+'</strong>'+
          '<span>'+esc(b.kind)+' · opens in the artifact viewer</span></span></button>';
      case 'callout':
        return '<div class="pd-callout pd-callout-'+esc(b.tone||'info')+'"'+k+'>'+
          (b.tone==='warning'?ICON.warning:ICON.info)+'<p>'+esc(b.text)+'</p></div>';
      case 'plan_step':
        return richStep(b,i,r,k);
      case 'plan_embed':
        return richEmbed(b,k);
      default:
        return '';
    }
  }

  /* PDET-008..012. One renderer for every kind, so a Plan never grows a
     private per-type viewer. An `ok` embed routes to the shared artifact
     viewer app.js already owns; a missing / stale / denied / unsupported one
     renders an explicit block naming which of the four it is, with its text
     summary still readable and a Details route. Nothing is silently omitted,
     and no other version of the same artifact is substituted. */
  var EMBED_UNAVAILABLE = {
    missing:'This artifact revision no longer exists.',
    stale:'The approved revision exists but its source has been superseded.',
    denied:'Reading this artifact requires a permission this project does not hold.',
    unsupported:'No registered renderer claims this artifact kind.'
  };
  function richEmbed(b,k){
    var ver = esc(b.artifact_id)+' · '+esc(embedVer(b));
    if(b.state!=='ok'){
      return '<div class="pd-embed pd-embed-unavailable pd-embed-'+esc(b.state)+'"'+k+
        ' data-embed-state="'+esc(b.state)+'" data-artifact-version="'+esc(embedVer(b))+'">'+
        ICON.warning+
        '<div class="pd-embed-copy"><strong>'+esc(b.caption)+'</strong>'+
          '<span class="pd-embed-why">'+esc(b.state)+' — '+esc(EMBED_UNAVAILABLE[b.state]||'unavailable')+'</span>'+
          '<span class="pd-embed-sum">'+esc(b.text_summary)+'</span>'+
          '<span class="pd-embed-ver"><code>'+ver+'</code></span></div>'+
        '<button type="button" class="soft-button pd-act" data-action="pd-embed-info" data-id="'+esc(b.block_id)+'">Details</button>'+
      '</div>';
    }
    var sand = b.sandboxed ? '<span class="pd-embed-sandbox">sandboxed</span>' : '';
    var fall = b.static_fallback_ref
      ? '<span class="pd-embed-fallback">PDF: '+esc(b.static_fallback_ref)+'</span>' : '';
    return '<button type="button" class="pd-embed pd-embed-ok pd-embed-kind-'+esc(b.renderer_kind)+'"'+k+
      ' data-embed-state="ok" data-embed-kind="'+esc(b.renderer_kind)+'"'+
      ' data-artifact-version="'+esc(embedVer(b))+'"'+
      ' data-action="open-artifact" data-id="'+esc(b.artifact_id)+'">'+
      ICON.artifact+
      '<span class="pd-embed-copy"><strong>'+esc(b.caption)+'</strong>'+
        '<span class="pd-embed-sum">'+esc(b.text_summary)+'</span>'+
        '<span class="pd-embed-ver"><code>'+ver+'</code> · '+esc(b.renderer_kind)+sand+fall+'</span></span>'+
    '</button>';
  }

  /* A plan step carries an OPTIONAL status gutter while the Plan is Building…
     (§7.2).  The gutter is a projection of build progress; it never mutates one
     byte of the approved document, which is why it is rendered as a sibling
     marker keyed on plan_step_id rather than written into the block. */
  function richStep(b,i,r,k){
    /* PPROG-009: a marker BESIDE the prose. It never strikes through, rewrites,
       re-wraps or reorders one byte of the approved document -- which is why
       the state lives in a class and a sibling gutter, not in `b`. A Plan that
       was never admitted has no run to project, so it carries no marker at
       all rather than a fabricated `pending`. */
    var admitted = !!r.approved;
    var pr = admitted ? progress(r) : null;
    var cell = pr ? (pr.step_states[b.plan_step_id]||null) : null;
    var st = cell ? cell.state : null;
    var mark = st ? (STEP_MARK[st]||'idle') : 'none';
    var dep = list(b.depends_on).length
      ? '<span class="pd-step-dep">after '+list(b.depends_on).map(esc).join(', ')+'</span>' : '';
    var par = b.parallel_group_id
      ? '<span class="pd-step-par" title="">parallel · '+esc(b.parallel_group_id)+'</span>' : '';
    var kid = b.parent_step_id
      ? '<span class="pd-step-child">child of '+esc(b.parent_step_id)+'</span>' : '';
    var glyph = st==='completed' ? ICON.check
              : st==='in_progress' ? ICON.dot
              : st==='blocked' ? ICON.warning
              : st==='skipped' ? ICON.skip
              : st==='mixed' ? ICON.mixed : '';
    var why = (cell && cell.state==='blocked' && cell.reason)
      ? '<span class="pd-step-why">blocked · '+esc(cell.reason)+'</span>' : '';
    var stale = (pr && pr.stale)
      ? '<span class="pd-step-stale">Updating progress…</span>' : '';
    var lbl = st ? '<span class="pd-step-state" data-step-state="'+esc(st)+'">'+esc(st.replace('_',' '))+'</span>' : '';
    return '<div class="pd-step pd-step-'+esc(mark)+(b.parent_step_id?' pd-step-nested':'')+'"'+k+
      ' data-step-id="'+esc(b.plan_step_id)+'"'+(st?' data-step-state="'+esc(st)+'"':'')+'>'+
      '<span class="pd-step-gutter" aria-hidden="true">'+glyph+'</span>'+
      '<div class="pd-step-copy">'+
        '<strong>'+esc(b.title)+'</strong>'+
        '<p>'+esc(b.text)+'</p>'+
        '<span class="pd-step-meta"><code>'+esc(b.plan_step_id)+'</code>'+dep+par+kid+lbl+why+stale+'</span>'+
      '</div></div>';
  }


  function renderRich(r){
    var b=body(r);
    return '<div class="pd-rich" data-plan-view="rich">'+
      b.map(function(x,i){ return richBlock(x,i,r); }).join('')+'</div>';
  }

  /* ---- Markdown: the SAME tree, serialised.  Read-only, and it keeps block
     identity: every line group is wrapped in a span carrying the same
     data-block-id the Rich Text projection uses (§7.2 "does not lose block
     identity").  A <pre> is not editable, and no caret can be placed in it
     that would mutate anything. */
  function mdBlock(b){
    switch(b.t){
      case 'heading':        return new Array((b.d||2)+1).join('#')+' '+b.text;
      case 'paragraph':      return b.text;
      case 'unordered_list': return list(b.items).map(function(x){return '- '+x;}).join('\n');
      case 'ordered_list':   return list(b.items).map(function(x,i){return (i+1)+'. '+x;}).join('\n');
      case 'table':          return '| '+list(b.head).join(' | ')+' |\n|'+list(b.head).map(function(){return '---';}).join('|')+'|\n'+
                                    list(b.rows).map(function(row){return '| '+list(row).join(' | ')+' |';}).join('\n');
      case 'code':           return '```'+(b.lang||'')+'\n'+b.text+'\n```';
      case 'artifact':       return '['+b.label+']('+b.kind+':'+b.id+')';
      /* PDET-008: the serialisation carries the FROZEN version, so a Markdown
         export names exactly which revision was approved. */
      case 'plan_embed':     return '!['+b.caption+']('+b.artifact_id+'@'+embedVer(b)+
                                    ' "'+b.renderer_kind+'")'+'\n\n> '+b.text_summary;
      case 'callout':        return '> **'+(b.tone==='warning'?'Warning':'Note')+'** '+b.text;
      /* PPROG-010 / TDG-014: NOT `- [ ]`. A checkbox in the serialisation reads
         as a status and as an editable checklist; status belongs in the gutter
         rail beside the document, never in its bytes. */
      case 'plan_step':      return '- **'+b.title+'** `'+b.plan_step_id+'`'+
                                    (b.parent_step_id?' _(child of '+b.parent_step_id+')_':'')+
                                    (list(b.depends_on).length?' _(after '+list(b.depends_on).join(', ')+')_':'')+
                                    (b.parallel_group_id?' _(parallel: '+b.parallel_group_id+')_':'')+
                                    '\n      '+b.text;
      default:               return '';
    }
  }
  function toMarkdown(r){
    return body(r).map(mdBlock).filter(Boolean).join('\n\n')+'\n';
  }
  function renderMarkdown(r){
    var b=body(r);
    /* PPROG-010. The serialisation is READ-ONLY and byte-stable: `toMarkdown(r)`
       returns exactly the same string whether the Plan is ready, Building… or
       Completed. Status is shown in a SEPARATE rail beside the <pre>, keyed to
       the same stable block ids -- never as an injected checkbox or status word
       inside the text. */
    var admitted=!!r.approved, pr=admitted?progress(r):null;
    var rows=b.map(function(x,i){
      var t=mdBlock(x); if(!t) return null;
      return { id:blockId(x,i), text:t, lines:t.split('\n').length,
               state:(pr && x.t==='plan_step') ? ((pr.step_states[x.plan_step_id]||{}).state||null) : null };
    }).filter(Boolean);
    var rail = pr ? '<div class="pd-md-rail" aria-hidden="true">'+rows.map(function(row){
        var cls=row.state?('pd-md-mark pd-md-mark-'+esc(STEP_MARK[row.state]||'idle')):'pd-md-mark';
        return '<span class="'+cls+'" data-block-id="'+esc(row.id)+'"'+
               (row.state?' data-step-state="'+esc(row.state)+'"':'')+
               ' style="--pd-md-lines:'+row.lines+'">'+(row.state?esc(row.state.replace('_',' ')):'')+'</span>';
      }).join('')+'</div>' : '';
    return '<div class="pd-md'+(pr?' pd-md-with-rail':'')+'" data-plan-view="markdown">'+rail+
      '<pre class="pd-md-pre">'+
      rows.map(function(row){
        return '<span class="pd-md-block" data-block-id="'+esc(row.id)+'">'+esc(row.text)+'</span>';
      }).join('\n\n')+
      '</pre></div>';
  }

  /* Inline SVG only -- the project forbids emoji glyphs outright. These are the
     few marks app.js's icon() does not carry in the shape this card needs. */
  var ICON = {
    check:'<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5 6.2 12 13 4.5"/></svg>',
    dot:'<svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor" stroke="none"><circle cx="8" cy="8" r="4"/></svg>',
    info:'<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8" cy="8" r="6.4"/><path d="M8 7.2v4M8 4.8v.6"/></svg>',
    warning:'<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.2 14.6 13.4H1.4Z"/><path d="M8 6.6v3.1M8 11.6v.6"/></svg>',
    artifact:'<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.2 2.6h6l3.6 3.6v7.2H3.2Z"/><path d="M9.2 2.6v3.6h3.6"/></svg>',
    skip:'<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l5 4-5 4"/><path d="M11.5 4v8"/></svg>',
    mixed:'<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 8h4"/><path d="M9 5.2h4"/><path d="M9 10.8h4"/></svg>'
  };


  /* =====================================================================
     2A. PlanningQuestionBudget — Additive Correction v4 (QMAX-001..016)
     ---------------------------------------------------------------------
     Six bases, ONE extension, and the six effective maxima are DERIVED. A
     stored total that disagreed with base+extension would be the exact defect
     the correction retires, so there is no second literal here.

     `questions_asked` is charged once per QuestionItem identity, at first
     durable presentation; a re-render, a restart or a retry resolves the
     existing record. Reused answers and researched facts are counted
     separately and never consume the allowance.
     ===================================================================== */
  var QBASE = {
    quick:3, standard:6, thorough:8,
    deep_thorough:10, deep_exhaustive:15, brainstorm:20
  };
  var QGRILL = 25;
  var QLABEL = {
    quick:'Plan · Quick', standard:'Plan · Standard', thorough:'Plan · Thorough',
    deep_thorough:'Deep Plan · Thorough', deep_exhaustive:'Deep Plan · Exhaustive',
    brainstorm:'Deep Plan · BrainStorm'
  };
  RT.questionBudget = RT.questionBudget || { runs:{}, seq:0 };

  function strategyKey(r){
    var s=String(r&&r.strategy||'').toLowerCase();
    if(s.indexOf('deep')===0){
      if(s.indexOf('brainstorm')>=0) return 'brainstorm';
      if(s.indexOf('exhaustive')>=0) return 'deep_exhaustive';
      return 'deep_thorough';
    }
    if(s.indexOf('quick')>=0)    return 'quick';
    if(s.indexOf('thorough')>=0) return 'thorough';
    return 'standard';
  }

  /* Normalise ANY incoming strategy to one of the six current keys.
     `strategyKey()` above reads a Plan RECORD; this reads a bare value, which
     is what the exported `questionBudget()` entry point receives. Both paths
     must agree, or the module's own callers see 10 for `Deep · Thorough`
     while an outside caller handing over the same record field silently gets
     `standard` 6 -- and the projection then echoes a retired label such as
     `light` back as though it were an active strategy. Unknown input resolves
     to a CURRENT key and is never stored verbatim. */
  function normStrategy(v){
    if(v==null) return null;
    if(QBASE[v]!=null) return v;
    return strategyKey({ strategy:v });
  }

  /* One counter per RUN, shared by every participant. Plan revisions continue
     the same counter; only a new Plan identity starts a new one. */
  function budgetRun(workflowId, strategy, grill){
    var m=RT.questionBudget.runs, key=normStrategy(strategy);
    if(!m[workflowId]){
      m[workflowId]={ workflow_id:workflowId, strategy:key||'standard', grill_me_enabled:!!grill,
                      asked:{}, order:[], reused:0, research:0 };
    }
    var run=m[workflowId];
    if(key) run.strategy=key;
    if(grill!=null) run.grill_me_enabled=!!grill;
    return run;
  }

  function questionBudget(workflowId, strategy, grill){
    var run=budgetRun(workflowId, strategy, grill);
    var base=QBASE[run.strategy]||QBASE.standard;
    var eff=base+(run.grill_me_enabled?QGRILL:0);
    var asked=run.order.length;
    return {
      schema:'pm.assistant_plan.question_budget_projection.v1',
      workflow_id:run.workflow_id, strategy:run.strategy, strategy_label:QLABEL[run.strategy],
      /* The two typed fields the correction's contract names and the earlier
         shape omitted. `planning_kind` is DERIVED from the strategy, never
         stored twice; `policy_version` is what makes a stored projection from
         the retired 15/+10 policy detectable rather than silently rendered. */
      planning_kind:(run.strategy.indexOf('deep')===0||run.strategy==='brainstorm')?'deep_plan':'plan',
      policy_version:2,
      base_limit:base, grill_me_enabled:run.grill_me_enabled, grill_me_extension:QGRILL,
      effective_limit:eff, questions_asked:asked,
      questions_remaining:Math.max(0, eff-asked),
      reused_answer_count:run.reused, research_resolved_count:run.research,
      exhausted:(eff-asked)<=0
    };
  }

  /* QMAX-007/011/012/014. The single admission gate. */
  function admitQuestion(workflowId, item){
    var run=RT.questionBudget.runs[workflowId];
    if(!run) return { ok:false, error:'unknown_run' };
    if(run.asked[item.question_item_id])
      return { ok:true, charged:false, reason:'already_charged', projection:questionBudget(workflowId) };
    if(item.resolved_from_prior_answer){ run.reused++; return { ok:true, charged:false, reason:'reused_answer', projection:questionBudget(workflowId) }; }
    if(item.resolvable_by_research){    run.research++; return { ok:true, charged:false, reason:'research_resolved', projection:questionBudget(workflowId) }; }
    var proj=questionBudget(workflowId);
    if(proj.exhausted)
      /* Typed, and NOT a failure: no extra QuestionItem is persisted and the
         planning run continues to synthesis. */
      return { ok:false, error:'question_budget_exhausted', charged:false, run_failed:false, projection:proj };
    run.asked[item.question_item_id]=true; run.order.push(item.question_item_id);
    return { ok:true, charged:true, projection:questionBudget(workflowId) };
  }
  function setGrill(workflowId, on){
    var run=RT.questionBudget.runs[workflowId]; if(!run) return null;
    /* QMAX-009/010: the ceiling moves; asked and the answers never do. */
    run.grill_me_enabled=!!on;
    return questionBudget(workflowId);
  }

  /* =====================================================================
     3A. PlanProgressProjection — Additive Correction v4 (PPROG-001..014)
     ---------------------------------------------------------------------
     ONE authority. Every status the card, the Rich markers, the Markdown rail
     and Details show comes from `progress(r)` and nothing else; there is no
     second, GUI-local progress engine, and no status is stored in the
     document. The projector DERIVES from:

       - the thread's To-Do list (window.PM56_TODOS, the ToDoController stand-in),
         joined on `plan_step_ids` -- never on title, heading text or list
         position, so renaming a step's prose orphans nothing;
       - `depends_on` for admission, which is why an unstarted step whose
         dependency is unmet stays `pending` and never becomes `blocked`;
       - the step tree (`parent_step_id`) for aggregates.

     Leaf states are pending | in_progress | completed | blocked | skipped.
     A parent may additionally be `mixed`. There is no `verifying`, no
     `replanned`, no `superseded` and no invented percentage.

     `currentness_hash` is a digest of the inputs. `stale` is set when the
     stored projection's hash no longer matches, and a stale projection is
     disclosed as stale rather than rendered as current -- it never enables a
     mutation control.
     ===================================================================== */
  var LEAF_ORDER = { completed:0, skipped:1, in_progress:2, blocked:3, pending:4 };

  function todoApi(){ return window.PM56_TODOS || null; }

  function todosForPlan(r){
    var api=todoApi(); if(!api || !api.get) return [];
    var items=api.get(r.thread_id) || [];
    return items.filter(function(t){ return t.plan_id===r.plan_id; });
  }

  /* A digest over exactly the inputs the projection is derived from. Two runs
     over the same durable records must produce the same hash; any To-Do
     transition changes it, which is what makes a cached projection detectably
     stale after a restart rather than quietly wrong. */
  function currentnessOf(r){
    var t=todosForPlan(r).map(function(x){
      return x.todo_id+':'+x.status+':'+x.revision+':'+(x.plan_step_ids||[]).join('+');
    }).sort().join('|');
    return hashOf([r.plan_id,r.version,hashOf(body(r)),r.status,t]);
  }

  function progress(r){
    var blocks=body(r), ss=steps(blocks), todos=todosForPlan(r);
    var byStep={}, i, j;
    for(i=0;i<todos.length;i++){
      var ids=todos[i].plan_step_ids||[];
      for(j=0;j<ids.length;j++){ (byStep[ids[j]]=byStep[ids[j]]||[]).push(todos[i]); }
    }
    var kids={};
    for(i=0;i<ss.length;i++){ if(ss[i].parent_step_id) (kids[ss[i].parent_step_id]=kids[ss[i].parent_step_id]||[]).push(ss[i].plan_step_id); }

    var state={};
    function leafState(id){
      var mapped=byStep[id]||[];
      if(!mapped.length) return { state:'pending', todo_ids:[], reason:null, work:[], evidence:[] };
      var counts={}, reason=null, work=[], ev=[];
      for(var n=0;n<mapped.length;n++){
        var t=mapped[n];
        counts[t.status]=(counts[t.status]||0)+1;
        if(t.status==='blocked' && !reason) reason=t.blocked_reason_ref;
        work=work.concat(t.active_work_ids||[]);
        for(var q=0;q<(t.transitions||[]).length;q++){
          if(t.transitions[q].to_status==='completed'||t.transitions[q].to_status==='skipped') ev.push(t.transitions[q].cause_ref);
        }
      }
      /* PPROG-006: completed requires EVERY required mapped leaf completed or
         validly skipped. PPROG-007: blocked only from a genuine blocker. */
      var st;
      if(counts.blocked)                                    st='blocked';
      else if(counts.in_progress)                           st='in_progress';
      else if(counts.pending)                               st='pending';
      else if(counts.completed)                             st='completed';
      else if(counts.skipped)                               st='skipped';
      else                                                  st='pending';
      return { state:st, todo_ids:mapped.map(function(t){return t.todo_id;}),
               reason:reason, work:work, evidence:ev };
    }
    for(i=0;i<ss.length;i++){ if(!kids[ss[i].plan_step_id]) state[ss[i].plan_step_id]=leafState(ss[i].plan_step_id); }
    /* PPROG-004/006: a parent is DERIVED from its current children, never
       declared. Heterogeneous children read `mixed`. */
    for(i=0;i<ss.length;i++){
      var id=ss[i].plan_step_id, ch=kids[id];
      if(!ch) continue;
      var seen={}, all=[], kid;
      for(j=0;j<ch.length;j++){ kid=state[ch[j]]||{state:'pending'}; seen[kid.state]=1; all.push(kid.state); }
      var uniq=Object.keys(seen);
      var agg;
      if(uniq.length===1) agg=uniq[0];
      else if(uniq.every(function(x){ return x==='completed'||x==='skipped'; })) agg='completed';
      else agg='mixed';
      state[id]={ state:agg, todo_ids:[], reason:null, work:[], evidence:[], children:ch };
    }
    var proj={
      project_id:'pm', thread_id:r.thread_id, assistant_plan_id:r.plan_id,
      plan_version:r.version, plan_hash:hashOf(blocks),
      plan_run_id:r.approved?('run-'+r.plan_id+'-V'+r.version):null,
      projection_revision:(r._projRev||1),
      currentness_hash:currentnessOf(r),
      generated_at:new Date().toISOString(),
      step_states:state,
      stale:!!r._projStale,
      source:r._projSource||'durable'
    };
    return proj;
  }

  /* The single read every renderer uses. Returns one of the six state words. */
  function stepStatus(r,id){
    var s=progress(r).step_states[id];
    return s ? s.state : 'pending';
  }

  var STEP_MARK = {
    completed:'done', skipped:'skipped', in_progress:'active',
    blocked:'blocked', pending:'idle', mixed:'mixed'
  };

  /* =====================================================================
     3B. PlanExecutionAttentionProjection — PFAIL-001..005, PFAIL-009
     ---------------------------------------------------------------------
     The primary control has FOUR labels and this projection never becomes a
     fifth. While a Plan is unfinished the button says Building… and this
     record supplies the secondary line, its reason, and the actions the owner
     admits. `Failed` is a CONDITION here, never a button label.
     ===================================================================== */
  var ATTENTION = {
    paused:           { line:'Paused',                    tone:'info' },
    quota:            { line:'Waiting for Usage',         tone:'info' },
    window:           { line:'Outside execution window',  tone:'info' },
    attention:        { line:'Needs attention',           tone:'warning' },
    failed:           { line:'Build failed',              tone:'warning' },
    recovery:         { line:'Recovery required',         tone:'warning' }
  };
  function attention(r){
    if(r.status!=='building') return null;
    var k=r.attention&&r.attention.kind;
    if(!k) return null;
    var base=ATTENTION[k]; if(!base) return null;
    return { plan_run_id:r.approved?('run-'+r.plan_id+'-V'+r.version):null,
             condition_kind:k, line:base.line, tone:base.tone,
             reason:r.attention.reason,
             allowed_action_ids:list(r.attention.actions),
             attempt:r.attention.attempt||null,
             currentness_hash:currentnessOf(r) };
  }

  /* =====================================================================
     4. THE BUILD CONTROL
     ---------------------------------------------------------------------
     §5.8 / §7.3.  ONE control.  It changes LABEL; it is never replaced by a
     separate status badge, and `wait` never becomes a fifth label.
         ready      -> "Build"      actionable
         building   -> "Building…"  disabled AS A DUPLICATE-BUILD ACTION
         completed  -> "Completed"  terminal
         canceled   -> "Canceled"   terminal
     The version badge is independent of it, which is why it lives in the
     header and reads the version rather than the status.
     ===================================================================== */
  var BUILD_LABEL = { ready:'Build', building:'Building…', completed:'Completed', canceled:'Canceled' };

  function buildControl(r){
    var label = BUILD_LABEL[r.status] || 'Build';
    var live  = r.status==='ready';
    var cls   = 'pd-build pd-build-'+esc(r.status);
    /* Terminal states and Building… are the SAME element, disabled. Rendering a
       <span> for them would make it a badge, which §7.3 explicitly rules out. */
    return '<button type="button" class="'+cls+'"'+(live?'':' disabled aria-disabled="true"')+
      ' data-action="'+(live?'pd-build':'pd-noop')+'" data-id="'+esc(r.plan_id)+'"'+
      ' data-hover-key="pd-build-'+esc(r.plan_id)+'">'+esc(label)+'</button>';
  }

  /* Support copy sits BESIDE the control, not inside it.
     PFAIL-001..002: an unfinished Plan reads Building… no matter what has gone
     wrong. Paused, quota-waiting, window-waiting, failed-attempt,
     attention-required and recovery-required are all SECONDARY truth rendered
     here, each with its exact owner reason and only the actions the owner
     admits. There is no fourth terminal label and no generic `Working`. */
  function waitCopy(r){
    if(r.status!=='building') return '';
    var a=attention(r);
    if(!a) return r.wait ? '<span class="pd-wait">'+ICON.info+esc(r.wait)+'</span>' : '';
    var acts=a.allowed_action_ids.map(function(id){
      return '<button type="button" class="soft-button pd-act pd-attn-act" data-action="pd-attn" data-id="'+esc(r.plan_id)+'" data-value="'+esc(id)+'">'+esc(ATTN_LABEL[id]||id)+'</button>';
    }).join('');
    var att=a.attempt ? '<span class="pd-attn-attempt">attempt '+esc(a.attempt)+'</span>' : '';
    return '<span class="pd-wait pd-attn pd-attn-'+esc(a.tone)+'" data-condition="'+esc(a.condition_kind)+'">'+
      (a.tone==='warning'?ICON.warning:ICON.info)+
      '<span class="pd-attn-copy"><strong>'+esc(a.line)+'</strong><span>'+esc(a.reason)+'</span>'+att+'</span>'+
      acts+'</span>';
  }
  var ATTN_LABEL = {
    resume:'Resume', retry:'Retry', cancel:'Cancel build', details:'Details',
    revise:'Stop and revise', reconnect:'Reconnect provider', recover:'Recover'
  };

  /* PPROG-011: a compact To-Do completion summary MAY sit on the card. It is
     derived from the same projection the button reads, so the two cannot
     disagree, and it is deliberately not a second lifecycle chip -- it counts
     work, it never names a Plan status. */
  function progressSummary(r){
    if(!r.approved) return '';
    var pr=progress(r), ids=Object.keys(pr.step_states), n=0, done=0, i, s;
    for(i=0;i<ids.length;i++){
      s=pr.step_states[ids[i]];
      if(s.children) continue;              /* count leaves only */
      n++; if(s.state==='completed'||s.state==='skipped') done++;
    }
    if(!n) return '';
    var stale=pr.stale?' pd-progress-stale':'';
    return '<span class="pd-progress'+stale+'" data-progress-done="'+done+'" data-progress-total="'+n+'"'+
      ' data-currentness="'+esc(pr.currentness_hash)+'">'+
      (pr.stale ? 'Updating progress…' : esc(done+' of '+n+' steps done'))+'</span>';
  }

  /* =====================================================================
     5. THE CARD
     ===================================================================== */
  function actionBtn(a,label,id,extra,kind){
    return '<button type="button" class="'+(kind||'soft-button')+' pd-act" data-action="'+esc(a)+'" data-id="'+esc(id)+'"'+(extra||'')+'>'+esc(label)+'</button>';
  }

  function cardHeader(r){
    var v = 'Plan · V'+r.version;
    return '<div class="pd-head">'+
      '<div class="pd-head-main">'+
        '<h3 class="pd-title">'+esc(r.title)+'</h3>'+
        '<span class="pd-strategy">'+esc(r.strategy)+' · '+esc(r.backend==='ledger_bound'?'ledger-bound':'direct')+'</span>'+
      '</div>'+
      '<span class="pd-badge" data-hover-key="pd-badge-'+esc(r.plan_id)+'">'+esc(v)+'</span>'+
    '</div>'+
    '<div class="pd-views" role="group" aria-label="Plan view">'+
      '<button type="button" class="pd-view'+(r.view==='rich'?' on':'')+'" data-action="pd-view" data-id="'+esc(r.plan_id)+'" data-value="rich">Rich Text</button>'+
      '<button type="button" class="pd-view'+(r.view==='markdown'?' on':'')+'" data-action="pd-view" data-id="'+esc(r.plan_id)+'" data-value="markdown">Markdown</button>'+
    '</div>';
  }

  /* §7.3 footer.  Which actions are ELIGIBLE depends on status; the eligibility
     is computed here once so the card, the More Info panel and the harness all
     read the same answer. */
  /* QMAX-015. Exhausting the question allowance must NOT disable Build; only
     an unresolved item EXPLICITLY classified as build-blocking may. The card's
     own toast has always said so, so without this predicate the copy asserted
     a behaviour no code path could produce. A blocker is a record on the Plan
     ({id, build_blocking:true, why}) or an unresolved To-Do carrying
     `build_blocking`; anything unresolved but not so classified stays visible
     and does not gate the control. */
  function buildBlockers(r){
    var out=list(r.blockers).filter(function(b){ return b && b.build_blocking && !b.resolved; })
      .map(function(b){ return { id:b.id||'blocker', why:b.why||'', source:'plan' }; });
    var api=todoApi();
    if(api && api.get){
      var items=api.get(r.thread_id)||[];
      for(var i=0;i<items.length;i++){
        var t=items[i];
        if(t.plan_id===r.plan_id && t.build_blocking && t.status!=='completed' && t.status!=='skipped')
          out.push({ id:t.todo_id, why:t.blocked_reason_ref||t.title||'', source:'todo' });
      }
    }
    return out;
  }

  function eligible(r){
    var e = { revise:false, build:false, crew:false, at:false, wizard:true, exportx:true,
              cancel:false, todos:false, goal:false, report:false };
    if(r.status==='ready'){ e.revise=true; e.build=true; e.crew=true; e.at=true; e.cancel=true; e.goal=true; }
    else if(r.status==='building'){ e.cancel=true; e.todos=true; e.revise=false; e.report=true; }
    else if(r.status==='completed'){ e.report=true; }
    var blk=buildBlockers(r);
    if(blk.length){ e.build=false; e.crew=false; e.at=false; e.goal=false; e.blocked_by=blk; }
    return e;
  }

  function cardFooter(r){
    var e=eligible(r), out=[];
    out.push(buildControl(r));
    if(e.crew)   out.push(actionBtn('pd-build-crew','Build With Crew',r.plan_id));
    if(e.at)     out.push(actionBtn('pd-build-at','Build At…',r.plan_id));
    if(e.revise) out.push(actionBtn('pd-revise','Revise',r.plan_id));
    if(e.todos)  out.push(actionBtn('pd-open-todos','Open To-Dos',r.plan_id));
    if(e.wizard) out.push(actionBtn('pd-wizard','Send To Planning Wizard',r.plan_id));
    if(e.exportx)out.push(actionBtn('pd-export','Export',r.plan_id));
    if(e.cancel) out.push(actionBtn('pd-cancel','Cancel',r.plan_id));
    out.push(actionBtn('pd-info','Details',r.plan_id));
    /* PGOAL-001: Build as Goal is a SECONDARY action. The primary control stays
       Build; no second large button is added. */
    if(e.goal)   out.push(actionBtn('pd-build-goal','Build as Goal',r.plan_id));
    /* QMAX-015: when Build is off because of an explicit build blocker, say
       which one. A disabled control with no reason is the failure mode the
       correction calls out ("do not disable Build merely because
       questions_remaining is zero"), inverted. */
    var blk=e.blocked_by||[];
    var blkLine = blk.length
      ? '<span class="pd-wait pd-attn pd-attn-warning" data-condition="build_blocked">'+ICON.warning+
        '<span class="pd-attn-copy"><strong>Build blocked</strong><span>'+
        esc(blk.length===1?'One unresolved item is classified build-blocking: ':'Unresolved build-blocking items: ')+
        esc(blk.map(function(x){ return x.id+(x.why?' — '+x.why:''); }).join('; '))+
        '</span></span></span>'
      : '';
    return '<div class="pd-foot">'+out.join('')+progressSummary(r)+blkLine+waitCopy(r)+'</div>';
  }

  /* Historical Completed/Canceled cards stay IN PLACE and default COMPACT
     (§7.4).  No picker, no `Superseded` label.  Compact is a local view choice,
     so expanding one does not disturb the current Plan. */
  function renderCompact(r){
    var why = r.status==='canceled' && r.cancelReason ? '<p class="pd-compact-why">'+esc(r.cancelReason)+'</p>' : '';
    return '<article class="system-card plan-doc plan-doc-compact pd-'+esc(r.status)+'" data-k="pd-'+esc(r.plan_id)+'-c" data-plan-id="'+esc(r.plan_id)+'">'+
      '<div class="pd-compact-row">'+
        '<span class="pd-compact-dot" aria-hidden="true">'+(r.status==='completed'?ICON.check:'')+'</span>'+
        '<div class="pd-compact-copy"><strong>'+esc(r.title)+'</strong>'+
          '<span>'+esc(r.strategy)+' · V'+r.version+'</span></div>'+
        '<span class="spacer"></span>'+
        buildControl(r)+
        '<button type="button" class="soft-button pd-act" data-action="pd-expand" data-id="'+esc(r.plan_id)+'">Open</button>'+
      '</div>'+why+
    '</article>';
  }

  function renderFull(r){
    /* The key must move whenever the PROJECTION moves, or pmPatch keeps a
       stale subtree: `buildStep` stopped being the progress source when the
       projector landed, so the key reads the projection's currentness. */
    var pk = r.approved ? progress(r).currentness_hash : 'unadmitted';
    return '<article class="system-card plan-doc pd-'+esc(r.status)+'" data-k="pd-'+esc(r.plan_id)+'-'+r.version+'-'+esc(r.status)+'-'+esc(r.view)+'-'+esc(pk)+'-'+((r.attention&&r.attention.kind)||'none')+'" data-plan-id="'+esc(r.plan_id)+'" data-topology="'+esc(r.topology||'agent')+'">'+
      cardHeader(r)+
      '<div class="pd-body">'+(r.view==='markdown'?renderMarkdown(r):renderRich(r))+'</div>'+
      cardFooter(r)+
    '</article>';
  }

  /* Local view state: which historical cards the reader has opened. Domain
     truth (status/version/approval) never lives here. */
  var ui = { expanded:{}, info:null };

  function renderCard(r){
    var terminal = (r.status==='completed'||r.status==='canceled');
    if(terminal && !ui.expanded[r.plan_id]) return renderCompact(r);
    return renderFull(r);
  }

  /* =====================================================================
     6. ACTIONS
     ---------------------------------------------------------------------
     Every one of these mutates the FIXTURE and re-renders.  None of them is a
     native command: `cmd.chat.plan.*` are unregistered, and Assistant_Plan_Runtime
     §11 says controls stay disabled with `command_not_registered` until the
     catalog closes.  Rather than claim success with a toast, each action leaves
     a durable, re-readable change on the record, and Details names the
     unregistered command it WOULD have called.
     ===================================================================== */

  /* --- 6.1 One current Plan (§5.7) -------------------------------------
     At most one UNFINISHED plan is current per thread. Asking for a new Plan
     while one is unfinished CANCELS the old one -- it does not stack, and it
     does not mark it `superseded`. The cancel reason is written so the compact
     card can explain itself later. */
  function currentPlan(threadId){
    var recs=P().records, k;
    for(k in recs){
      if(recs[k].thread_id===threadId && recs[k].current &&
         recs[k].status!=='completed' && recs[k].status!=='canceled') return recs[k];
    }
    return null;
  }
  function cancelForNewPlan(threadId,reason){
    var cur=currentPlan(threadId);
    if(!cur) return null;
    cur.status='canceled'; cur.current=false;
    cur.cancelReason=reason||'Canceled when a new Plan was requested for this thread while it was still unfinished.';
    stopRun(cur);
    return cur;
  }

  /* --- 6.2 Build admission (§5.9) --------------------------------------
     Build FREEZES exact plan_id, version, hash, step ids, runtime, permissions
     and worktree. Regular Plan creates To-Dos directly; Deep Plan first
     materialises and validates the scoped PlanUnit bundle, THEN maps to To-Dos.
     Neither launches Orchestrator -- there is deliberately no code path from
     here to one, and the receipt says so. */
  var runTimers = {};
  function stopRun(r){
    if(runTimers[r.plan_id]){ clearInterval(runTimers[r.plan_id]); delete runTimers[r.plan_id]; }
  }

  function freeze(r,ctx){
    var b=body(r);
    return {
      plan_id:r.plan_id, version:r.version, hash:hashOf(b),
      step_ids:steps(b).map(function(s){return s.plan_step_id;}),
      runtime:(ctx.selectedModel&&ctx.selectedModel()||{}).name||'Claude Sonnet 4.6',
      permissions:ctx.state.permissions, worktree:ctx.state.worktree,
      at:new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}),
      orchestrator:false
    };
  }

  function admitBuild(ctx,r,opts){
    opts=opts||{};
    if(r.status!=='ready') return false;
    /* PSCHED-005 / PFAIL-010: an immediate Build ATOMICALLY invalidates the
       pending schedule for this Plan BEFORE the run is admitted, so a timer
       cannot deliver a second dispatch for work that has already started.
       Cancel did this and Build did not, which left exactly the duplicate
       admission the correction names -- two owners of one PlanRun. */
    r.scheduleInvalidation = invalidateSchedulesFor(r, 'immediate_build');
    r.approved = freeze(r,ctx);
    r.status = 'building';
    r.buildStep = 0;
    r.wait = opts.wait || null;
    /* Deep Plan: materialise + validate the SCOPED bundle first. Scoped means
       plan_id + version -- it is not written to the global .plan_index and it
       creates no NodeSeeds or WorkNodes. */
    if(r.backend==='ledger_bound'){
      r.unitsMaterialized = { at:r.approved.at, scope:r.plan_id+'@V'+r.version,
        count:list(r.planunits).length, validated:true, globalIndex:false, worknodes:0 };
    }
    /* PPROG-002/013: the To-Dos are REAL, created through the ToDo owner, and
       they are what the projector derives from. A local build counter would
       have made the gutter a decoration rather than a projection. */
    var api=todoApi(), made=null;
    if(api && api.materializeForPlan){
      made = api.materializeForPlan({
        plan_id:r.plan_id, thread_id:r.thread_id, version:r.version,
        steps:steps(body(r)).map(function(s){
          return { id:s.plan_step_id, parent:s.parent_step_id, deps:list(s.depends_on), title:s.title, outcome:s.text };
        })
      });
    }
    r.todosCreated = { at:r.approved.at, from:(r.backend==='ledger_bound'?'planunits':'plan_steps'),
                       count:(made&&made.created) || (r.backend==='ledger_bound'?list(r.planunits).length:steps(body(r)).length),
                       reused:!!(made&&made.reused) };
    /* app.js's addReceipt is positional -- addReceipt(type,title,detail) -- and
       `type` reaches renderEventMessage, which calls m.type.startsWith(). Passing
       an object here threw inside renderApp and silently abandoned the rest of
       admitBuild: the record said `building` while the button still said Build.
       `goal-receipt` is an existing mapped receipt type, so the card renders. */
    ctx.addReceipt && ctx.addReceipt('goal-receipt',
      'Build admitted · '+r.title,
      'V'+r.version+' · '+r.approved.hash+' · '+r.todosCreated.count+' To-Dos · Orchestrator not entered');
    /* Advance the step gutter on a real interval so Building… is observable.
       Nothing here is authoritative -- §7.2's gutter is a projection. */
    stopRun(r);
    if(!opts.paused) startRunTimer(ctx,r);
    return true;
  }

  /* ONE tick, used by the first admission and by every resume. It used to be
     duplicated, and the copy in resumeRun() simply stopped when no work was
     left -- so a Plan resumed after a Pause could never reach Completed and
     could never complete its bound Goal. One body, one completion predicate. */
  function runTick(ctx,r){
    if(r.status!=='building'){ stopRun(r); return; }
    var a=todoApi(), moved=null;
    if(a && a.advanceForPlan) moved=a.advanceForPlan(r.plan_id, r.thread_id);
    r._projRev=(r._projRev||1)+1;
    /* PFAIL-007: Completed requires the completion predicate to hold --
       every required leaf resolved. `moved===null` means the projector
       found nothing left to admit or complete. */
    if(!moved){
      var pr=progress(r), ids=Object.keys(pr.step_states), open=0;
      for(var q=0;q<ids.length;q++){
        var s=pr.step_states[ids[q]];
        if(s.children) continue;
        if(s.state!=='completed' && s.state!=='skipped') open++;
      }
      if(open===0){ r.status='completed'; r.current=false; stopRun(r); completeBoundGoal(r); }
      else { r.attention={ kind:'attention', reason:'No further work can be admitted: '+open+' step(s) are unresolved and none is runnable.', actions:['details','revise','cancel'] }; stopRun(r); }
    }
    ctx.renderApp();
  }
  function startRunTimer(ctx,r){
    stopRun(r);
    runTimers[r.plan_id]=setInterval(function(){ runTick(ctx,r); }, 1400);
  }

  /* One place that invalidates every schedule bound to a Plan, whichever owner
     holds it: this module's own card binding (`r.schedule`) and the scheduler's
     durable build schedules. Returns a receipt so the caller can show what was
     fenced rather than asserting it. */
  function invalidateSchedulesFor(r, reason){
    var why = reason==='immediate_build'
      ? 'Build Now started this exact Plan version; the pending schedule is invalidated so no later dispatch can admit a second run.'
      : 'The bound execution ended; this schedule can no longer dispatch.';
    var out={ card:0, scheduler:0, reason:reason };
    if(r.schedule && !r.schedule.invalid){
      r.schedule.invalid=true; r.schedule.invalidReason=why; out.card=1;
    }
    var S=window.PM56_SCHED;
    if(S && S.invalidateForExecution){
      var res=S.invalidateForExecution({ plan_id:r.plan_id, epoch:reason, reason:reason, why:why });
      out.scheduler=(res&&res.schedules)||0;
    }
    return out;
  }

  /* PGOAL-009. Plan completion completes the bound Goal EXACTLY ONCE, and
     records the completion lineage. Without this the binding was one-way:
     Pause, Resume and Cancel drove the Plan from the Goal, but a Plan that
     reached Completed left its Goal `active` forever -- a Goal whose whole
     objective was that Plan. Idempotent by construction: a Goal already
     `completed` returns the first receipt rather than emitting a second
     completion effect, which is what makes replay safe. */
  function completeBoundGoal(r){
    if(!r.goalBinding) return null;
    var G=window.PM56_GOAL; if(!G || !G.bound) return null;
    var g=G.bound(r.plan_id); if(!g) return null;
    if(g.status==='completed') return { ok:true, replayed:true, goal_id:g.id, completion:g.completion||null };
    if(g.status==='canceled')  return { ok:false, error:'canceled_is_terminal', goal_id:g.id };
    var lineage={ schema:'pm.goal.completion_lineage.v1', goal_id:g.id,
                  assistant_plan_id:r.plan_id, plan_version:r.version,
                  plan_hash:hashOf(body(r)),
                  plan_run_id:r.goalBinding.plan_run_id,
                  todo_list_ref:r.goalBinding.todo_list_ref,
                  currentness_hash:currentnessOf(r),
                  at:new Date().toISOString() };
    G.boundTransition(r.plan_id,'completed',
      'The bound Plan reached Completed: every required leaf resolved. Completed once, by the host, against the completion predicate — not because a model returned a final message.');
    g=G.bound(r.plan_id); if(g) g.completion=lineage;
    return { ok:true, replayed:false, goal_id:lineage.goal_id, completion:lineage };
  }

  /* Resume the demo run from wherever the durable To-Dos left it. */
  function resumeRun(ctx,r){
    if(r.status!=='building') return;
    startRunTimer(ctx,r);
  }

  /* --- 6.3 Revise (§5.6) -----------------------------------------------
     "Revise", never "Edit". It targets the ORDINARY composer at the current
     plan/version -- it does not open an editor, and there is no path from here
     to a caret in the document. composer-state.js owns the ribbon; this module
     only writes the destination. */
  function reviseTarget(r){
    return { kind:'plan-revision', label:'Revise Plan · V'+r.version, detail:r.title,
             refId:r.plan_id, glyph:'document',
             placeholder:'Describe what should change. The agent writes V'+(r.version+1)+'.' };
  }

  /* A revision is a COMPLETE new structured version authored by the agent. The
     old body stays immutable under its own version key. */
  function applyRevision(ctx,r,feedback){
    var prev=body(r), next=prev.slice();
    next = next.concat([ h('Revision note','3'),
      p('V'+(r.version+1)+' incorporates: '+feedback) ]);
    r.version = r.version+1;
    r.revisions[r.version] = next;
    r.revisionLog.push({v:r.version, at:new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}), why:feedback});
    /* A revision invalidates anything bound to the exact old version -- the
       card's own binding AND every durable build schedule the scheduler holds.
       Only the first of those was done here, so an ordinary Revise left a live
       schedule pointing at replaced bytes. */
    var Sr=window.PM56_SCHED;
    if(Sr && Sr.invalidateForPlanRevision)
      r.scheduleRevisionInvalidation = Sr.invalidateForPlanRevision(r.plan_id, r.version-1, r.version, hashOf(next));
    if(r.schedule && r.schedule.version !== r.version){
      r.schedule.invalid = true;
      r.schedule.invalidReason = 'Bound to V'+r.schedule.version+'; the Plan is now V'+r.version+'. Rebind or reschedule explicitly.';
    }
    if(r.approved && r.approved.version !== r.version) r.approved = null;
    return r;
  }

  /* =====================================================================
     7. DIALOGS
     ---------------------------------------------------------------------
     Rendered through the `dialog` slot, which app.js paints into the overlay
     root. Each returns '' unless it is the open one.
     ===================================================================== */
  function dlgShell(id,title,sub,bodyHtml,footHtml){
    /* The base `dialog` class is what supplies position:fixed, the centring
       transform, --z-dialog and pointer-events:auto. #pmOverlayRoot is
       pointer-events:none, so a dialog without it lays out at the overlay's
       top-left and cannot be clicked at all -- which is exactly what happened:
       the Plan details dialog rendered at (0,0) under the transcript and a
       Plan paragraph sat where its Close button appeared to be.
       scheduling.js already used `class="dialog sched-dialog …"`; this matches. */
    return '<div class="dialog pd-dialog" data-k="pd-dlg-'+esc(id)+'" role="dialog" aria-modal="true" aria-label="'+esc(title)+'">'+
      '<div class="pd-dlg-head"><div><strong>'+esc(title)+'</strong>'+(sub?'<span>'+esc(sub)+'</span>':'')+'</div>'+
      '<button type="button" class="pd-dlg-x" data-action="pd-dlg-close" aria-label="Close">'+
      '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg></button></div>'+
      '<div class="pd-dlg-body">'+bodyHtml+'</div>'+
      '<div class="pd-dlg-foot">'+footHtml+'</div></div>';
  }
  function kv(k,v){ return '<div class="pd-kv"><span>'+esc(k)+'</span><strong>'+esc(v)+'</strong></div>'; }

  /* --- 7.1 Details / More Info ----------------------------------------
     The one place that tells the whole truth: the frozen approval, the exact
     hash, the scoped ledger and PlanUnit bundle for a Deep Plan, the revision
     history, the schedule binding, and -- explicitly -- the native commands
     that are NOT registered. */
  function dlgInfo(ctx,r){
    var b=body(r), ss=steps(b), rows=[];
    rows.push('<section class="pd-sec"><h4>Identity</h4>'+
      kv('plan_id', r.plan_id)+kv('thread_id', r.thread_id)+
      kv('version','V'+r.version)+kv('strategy', r.strategy)+
      kv('backend', r.backend)+kv('content hash', hashOf(b))+
      kv('steps', String(ss.length))+kv('status', r.status)+'</section>');

    /* --- PDET-001: creation/revision sources, source messages, attachments,
       research and run history. Every entry is a REFERENCE into the owner that
       holds the object (message, attachment, research receipt, run); this
       section copies no artifact metadata into Plan storage. Currentness is
       reported for every Plan, approved or not, so a reader can always tell
       whether what they are looking at is current. */
    var att=window.PM56_ATTACHMENTS;
    rows.push('<section class="pd-sec pd-sec-sources"><h4>Sources and provenance</h4>'+
      kv('currentness_hash', currentnessOf(r))+
      kv('currentness', r._projStale?'stale — the projection inputs moved after this was generated':'current')+
      '<div class="pd-prov">'+
      '<h5>Source messages</h5>'+
      (list(r.sources).length
        ? '<ul class="pd-prov-list">'+list(r.sources).map(function(x){
            return '<li data-source-kind="'+esc(x.kind)+'"><code>'+esc(x.ref)+'</code>'+
              '<strong>'+esc(x.kind)+'</strong><span>'+esc(x.at||'')+'</span><em>'+esc(x.note||'')+'</em></li>'; }).join('')+'</ul>'
        : '<p class="pd-note">No source message is recorded for this Plan.</p>')+
      '<h5>Attachments</h5>'+
      (list(r.attachmentRefs).length
        ? '<ul class="pd-prov-list">'+list(r.attachmentRefs).map(function(id){
            var a=att&&att.findAttachment?att.findAttachment(id):null;
            return '<li><code>'+esc(id)+'</code><span>'+esc(a?(a.name||a.title||''):'resolved by the attachment owner')+'</span></li>'; }).join('')+'</ul>'
        : '<p class="pd-note">This Plan admitted no attachments.</p>')+
      '<h5>Research</h5>'+
      (list(r.research).length
        ? '<ul class="pd-prov-list">'+list(r.research).map(function(x){
            return '<li data-research-kind="'+esc(x.kind)+'"><code>'+esc(x.ref)+'</code>'+
              '<strong>'+esc(x.kind)+'</strong><span>'+esc(x.at||'')+'</span><em>'+esc(x.summary||'')+'</em></li>'; }).join('')+'</ul>'
        : '<p class="pd-note">This Plan resolved nothing through research.</p>')+
      '<h5>Run history</h5>'+
      (list(r.runHistory).length
        ? '<ul class="pd-prov-list pd-runs">'+list(r.runHistory).map(function(x){
            return '<li data-run-outcome="'+esc(x.outcome)+'"><code>'+esc(x.run_id)+'</code>'+
              '<strong>attempt '+esc(String(x.attempt))+' · '+esc(x.outcome)+'</strong>'+
              '<span>'+esc(x.at||'')+'</span><em>'+esc(x.reason||'')+'</em></li>'; }).join('')+'</ul>'+
          '<p class="pd-note">Attempts are history under ONE PlanRun. A failed attempt is not a second run and is not Plan completion.</p>'
        : '<p class="pd-note">No run has been admitted for this Plan yet.</p>')+
      '</div>'+
      '<p class="pd-note">Each row is a reference into the owner that holds the object. Plan storage keeps no second copy of an attachment’s or an artifact’s metadata.</p></section>');

    rows.push('<section class="pd-sec"><h4>Projection parity</h4><p class="pd-note">'+
      'Rich Text and Markdown are rendered from one block array. Block ids in each projection: '+
      '<code>'+esc(String(parity(r).rich))+'</code> vs <code>'+esc(String(parity(r).markdown))+'</code> — '+
      (parity(r).equal?'identical, so they cannot drift.':'MISMATCH — this is a defect.')+
      '</p></section>');

    if(r.approved){
      rows.push('<section class="pd-sec"><h4>Frozen at Build</h4>'+
        kv('version','V'+r.approved.version)+kv('hash', r.approved.hash)+
        kv('step ids', r.approved.step_ids.join(', '))+
        kv('runtime', r.approved.runtime)+kv('permissions', r.approved.permissions)+
        kv('worktree', r.approved.worktree)+kv('at', r.approved.at)+
        kv('Orchestrator entered', 'no')+'</section>');
    }
    if(r.backend==='ledger_bound' && r.ledger){
      rows.push('<section class="pd-sec"><h4>Run-scoped ledger</h4>'+
        kv('ledger id', r.ledger.id)+kv('scope', r.ledger.scope)+
        '<ul class="pd-ledger">'+list(r.ledger.entries).map(function(e){
          return '<li><span class="pd-ledger-k">'+esc(e.k)+'</span>'+esc(e.v)+'</li>'; }).join('')+'</ul>'+
        '<p class="pd-note">This ledger is scoped to one run. It is not sharded, it does not run the bootstrap transfer pipeline, and it does not modify <code>Plans/**</code>.</p></section>');
    }
    if(r.backend==='ledger_bound' && list(r.planunits).length){
      rows.push('<section class="pd-sec"><h4>Scoped PlanUnits</h4>'+
        '<p class="pd-note">Scoped to <code>'+esc(r.plan_id)+'@V'+r.version+'</code>'+
        (r.unitsMaterialized?' · materialised and validated at Build':' · materialised at Build, not now')+
        '. Not written to the global PlanUnit index. No NodeSeeds, no WorkNodes, no Plan Compile.</p>'+
        '<ul class="pd-units">'+list(r.planunits).map(function(u){
          return '<li><code>'+esc(u.id)+'</code><strong>'+esc(u.title)+'</strong>'+
            '<span>step '+esc(u.step)+(list(u.deps).length?' · after '+list(u.deps).join(', '):'')+'</span>'+
            (list(u.acceptance).length?'<em>accepts: '+esc(list(u.acceptance).join('; '))+'</em>':'')+
            (list(u.negative).length?'<em class="neg">never: '+esc(list(u.negative).join('; '))+'</em>':'')+
            '</li>'; }).join('')+'</ul></section>');
    }

    /* --- Additive Correction v4: PDET-002..003 -------------------------
       The two backends must be TRUTHFUL AND DISTINGUISHABLE. A Regular Plan
       says, in words, that it used neither a ledger nor PlanUnits; a Deep Plan
       shows both plus the PlanUnit-to-To-Do mapping. Neither claims a
       guardrail it did not use. */
    rows.push('<section class="pd-sec pd-sec-backend" data-backend="'+esc(r.backend)+'"><h4>Planning backend</h4>'+
      (r.backend==='ledger_bound'
        ? kv('backend','Deep Plan · ledger-bound')+
          kv('ledger', r.ledger?r.ledger.id:'materialised at Build')+
          kv('scoped PlanUnits', String(list(r.planunits).length))+
          kv('PlanUnits validated', r.unitsMaterialized?String(!!r.unitsMaterialized.validated):'at Build')+
          kv('global PlanUnit index','not written')+
          kv('WorkNodes','0')+
          '<p class="pd-note">Scoped PlanUnits are hidden by default and inspectable here. They never appear as To-Do items and never become an Activity domain.</p>'
        : kv('backend','Regular Plan · direct planning')+
          kv('ledger','none — this Plan used no ledger')+
          kv('PlanUnits','none — this Plan created no PlanUnits')+
          kv('Orchestrator','not entered')+
          '<p class="pd-note">Direct planning. This Plan produced a document and To-Dos and nothing else; it did not fall back from a Deep Plan and it claims no guardrail it did not use.</p>')+
      '</section>');

    /* --- PPROG-001..016: the projection, its inputs and its currentness. */
    if(r.approved){
      var pr=progress(r), sids=Object.keys(pr.step_states);
      rows.push('<section class="pd-sec pd-sec-progress"><h4>Progress projection</h4>'+
        kv('schema','pm.assistant_plan.progress_projection.v1')+
        kv('plan_run_id', pr.plan_run_id||'—')+
        kv('projection_revision', String(pr.projection_revision))+
        kv('currentness_hash', pr.currentness_hash)+
        kv('source', pr.source==='durable'?'rebuilt from durable To-Dos, work bindings and step mappings':'cached view state')+
        kv('stale', String(pr.stale))+
        '<ul class="pd-steps-proj">'+sids.map(function(id){
          var s=pr.step_states[id];
          return '<li data-step-id="'+esc(id)+'" data-step-state="'+esc(s.state)+'">'+
            '<code>'+esc(id)+'</code><strong>'+esc(s.state)+'</strong>'+
            (s.children?'<span>aggregate of '+esc(s.children.join(', '))+'</span>':'')+
            (s.todo_ids&&s.todo_ids.length?'<span>To-Dos: '+esc(s.todo_ids.join(', '))+'</span>':'')+
            (s.reason?'<em>'+esc(s.reason)+'</em>':'')+
            (s.evidence&&s.evidence.length?'<em class="pd-ev">'+esc(s.evidence.join(', '))+'</em>':'')+
          '</li>'; }).join('')+'</ul>'+
        '<p class="pd-note">One authority. The markers beside the Rich Text steps, the Markdown rail, the card summary and this list are all this projection — there is no second, GUI-local progress engine, and no status is written into the approved document. A step whose dependency is unmet stays <code>pending</code>; only a genuine blocker makes it <code>blocked</code>.</p>'+
        '<div class="pd-export-row">'+
          '<button type="button" class="soft-button" data-action="pd-proj-stale" data-id="'+esc(r.plan_id)+'">Mark projection stale</button>'+
          '<button type="button" class="soft-button" data-action="pd-proj-restart" data-id="'+esc(r.plan_id)+'">Rebuild after restart</button>'+
        '</div></section>');
    }

    /* --- PGOAL-014: Details links to the Goal; there is no Goal card. */
    if(r.goalBinding){
      var G=window.PM56_GOAL, bg=G&&G.bound?G.bound(r.plan_id):null;
      rows.push('<section class="pd-sec pd-sec-goal"><h4>Bound Goal</h4>'+
        kv('schema','pm.goal.plan_binding.v1')+
        kv('goal_id', r.goalBinding.goal_id)+
        kv('goal status', bg?bg.status:'—')+
        kv('plan_version','V'+r.goalBinding.plan_version)+
        kv('plan_hash', r.goalBinding.plan_hash)+
        kv('plan_run_id', r.goalBinding.plan_run_id)+
        kv('todo_list_ref', r.goalBinding.todo_list_ref)+
        kv('planunit_bundle_ref', r.goalBinding.planunit_bundle_ref||'none (Regular Plan)')+
        kv('execution_topology','goal_driven')+
        '<p class="pd-note">One Goal, one PlanRun, one binding, committed together. The To-Do list and the scoped PlanUnit bundle are <em>referenced</em>, not duplicated. The Goal lives in Activity; no Goal thread card exists. Editing the Goal never edits this Plan.</p></section>');
    }

    /* --- QMAX-016/017: the budget for the run that produced this Plan. */
    var qb=questionBudget('plan:'+r.plan_id, strategyKey(r), r.grillMe);
    rows.push('<section class="pd-sec pd-sec-questions"><h4>Question budget</h4>'+
      kv('strategy', qb.strategy_label)+
      kv('base limit', String(qb.base_limit))+
      kv('Grill Me', qb.grill_me_enabled?('on · +'+qb.grill_me_extension):('off · +'+qb.grill_me_extension+' when enabled'))+
      kv('effective limit', String(qb.effective_limit))+
      kv('asked', String(qb.questions_asked))+
      kv('remaining', String(qb.questions_remaining))+
      kv('reused answers', String(qb.reused_answer_count))+
      kv('researched instead of asked', String(qb.research_resolved_count))+
      '<div class="pd-export-row">'+
        '<button type="button" class="soft-button" data-action="pd-q-ask" data-id="'+esc(r.plan_id)+'">Ask one question</button>'+
        '<button type="button" class="soft-button" data-action="pd-q-again" data-id="'+esc(r.plan_id)+'">Re-present the same question</button>'+
        '<button type="button" class="soft-button" data-action="pd-q-reuse" data-id="'+esc(r.plan_id)+'">Resolve from a prior answer</button>'+
        '<button type="button" class="soft-button" data-action="pd-q-research" data-id="'+esc(r.plan_id)+'">Resolve by research</button>'+
        '<button type="button" class="soft-button" data-action="pd-q-grill" data-id="'+esc(r.plan_id)+'">'+(qb.grill_me_enabled?'Turn Grill Me off':'Turn Grill Me on')+'</button>'+
      '</div>'+
      '<p class="pd-note">One counter for the whole run, shared by every participant — the limit is never multiplied by participant count. A question is charged once, when its identity is first durably presented; re-presenting it charges nothing. The six bases are 3 / 6 / 8 for Quick, Standard and Thorough and 10 / 15 / 20 for Deep Thorough, Exhaustive and BrainStorm, and Grill Me adds 25, giving 28 / 31 / 33 / 35 / 40 / 45.</p></section>');

    /* --- PDET-009..012: what each embed froze, and what export will do. */
    var ems=b.filter(function(x){ return x.t==='plan_embed'; });
    if(ems.length){
      rows.push('<section class="pd-sec pd-sec-embeds"><h4>Embedded artifacts</h4>'+
        '<ul class="pd-embeds">'+ems.map(function(x){
          return '<li data-embed-state="'+esc(x.state)+'"><code>'+esc(x.artifact_id)+'@'+esc(embedVer(x))+'</code>'+
            '<strong>'+esc(x.renderer_kind)+'</strong><span>'+esc(x.caption)+'</span>'+
            '<em>'+(x.state==='ok'
              ? ((x.renderer_kind==='video'||x.renderer_kind==='interactive')
                  ? 'PDF: static fallback '+esc(x.static_fallback_ref||'(none)')+' with caption'
                  : 'PDF: rendered')
              : esc(x.state)+' — '+esc(EMBED_UNAVAILABLE[x.state]||''))+'</em></li>';
        }).join('')+'</ul>'+
        '<p class="pd-note">Every embed resolves the frozen <code>artifact_version</code>. A later change to any of these artifacts cannot change this approved Plan; an unavailable one renders as an explicit unavailable block rather than being dropped or substituted. Interactive content runs only in the shared sandbox.</p></section>');
    }
    if(list(r.revisionLog).length){
      rows.push('<section class="pd-sec"><h4>Revision history</h4><ul class="pd-revs">'+
        list(r.revisionLog).map(function(x){ return '<li><strong>V'+x.v+'</strong><span>'+esc(x.at)+'</span><p>'+esc(x.why)+'</p></li>'; }).join('')+
        '</ul><p class="pd-note">Every earlier version stays immutable and readable. There is no <code>superseded</code> status.</p></section>');
    }
    if(r.schedule){
      rows.push('<section class="pd-sec"><h4>Scheduled build</h4>'+
        kv('bound version','V'+r.schedule.version)+kv('bound hash', r.schedule.hash)+
        kv('at', r.schedule.at)+kv('state', r.schedule.invalid?'invalidated':'armed')+
        (r.schedule.invalid?'<p class="pd-note pd-bad">'+esc(r.schedule.invalidReason)+'</p>':'')+'</section>');
    }
    if(r.crew){
      rows.push('<section class="pd-sec"><h4>Build With Crew</h4>'+
        kv('frozen version','V'+r.crew.version)+kv('frozen hash', r.crew.hash)+
        kv('started', r.crew.at)+kv('route','Assistant-controlled Crew run')+
        kv('Orchestrator','not entered')+'</section>');
    }
    if(r.wizard){
      rows.push('<section class="pd-sec"><h4>Planning Wizard handoff</h4>'+
        kv('receipt', r.wizard.receipt)+kv('version','V'+r.wizard.version)+
        kv('hash', r.wizard.hash)+kv('PRD Builder','bypassed')+
        kv('sent', r.wizard.at)+
        '<p class="pd-note">The Assistant Plan is the intake specification, so PRD Builder is bypassed by design. From here Planning Wizard owns the PlanningRun, topics, audits, Plan Pack, approval, Plan Compile and Orchestrator navigation — this module does not.</p></section>');
    }
    if(list(r.exports).length){
      rows.push('<section class="pd-sec"><h4>Exports</h4><ul class="pd-exports">'+
        list(r.exports).map(function(x){
          return '<li><strong>'+esc(x.content_kind||'plan_document')+' · '+esc(x.format)+'</strong><span>'+esc(x.at)+'</span><em>'+esc(x.result)+'</em>'+
            (x.hash_unchanged===false?'<em class="neg">plan_hash CHANGED — this is a defect</em>':'<em>plan_hash unchanged</em>')+
            (x.embeds&&x.embeds.length?'<em>'+esc(x.embeds.map(function(e){ return e.block_id+': '+e.exported_as; }).join(' · '))+'</em>':'')+
          '</li>'; }).join('')+'</ul></section>');
    }
    rows.push('<section class="pd-sec pd-sec-honest"><h4>What is not real here</h4>'+
      '<p class="pd-note">This is a concept lab. The controls above change fixture state and render the result; none of them dispatches a native command. The commands this card would call are registered in <code>Plans/UI_Command_Catalog.md</code> but have no handler yet:</p>'+
      '<ul class="pd-cmds"><li><code>cmd.chat.plan.build</code></li><li><code>cmd.chat.plan.revise</code></li>'+
      '<li><code>cmd.chat.plan.build_with_crew</code></li><li><code>cmd.chat.plan.build_at</code></li>'+
      '<li><code>cmd.chat.plan.send_to_planning_wizard</code></li><li><code>cmd.chat.plan.export</code></li>'+
      '<li><code>cmd.chat.plan.cancel</code></li></ul>'+
      '<p class="pd-note">The Building… progression is a client-side interval. No client-local timer is authoritative in the runtime spec, and this one is not either.</p></section>');

    return dlgShell('info','Plan details', r.title, rows.join(''),
      '<button type="button" class="soft-button" data-action="pd-dlg-close">Close</button>');
  }

  function parity(r){
    var b=body(r);
    var rich=b.map(function(x,i){ return blockId(x,i); });
    var md=b.map(function(x,i){ return mdBlock(x)?blockId(x,i):null; }).filter(Boolean);
    return { rich:rich.length, markdown:md.length, equal:rich.length===md.length, ids:rich };
  }

  /* --- 7.2 Build With Crew (§5.11) -------------------------------------
     ALWAYS opens the Crew modal with the exact current version/hash
     PRESELECTED. collaboration.js owns the Crew modal; when it is loaded this
     hands off to it. When it is not, this renders the same freeze summary so
     the contract is still visible and the version/hash preselection is provable. */
  function dlgCrew(ctx,r){
    var b=body(r), hs=hashOf(b);
    var collab = window.PM56_COLLAB;
    var note = collab && collab.buildWithCrew
      ? '<p class="pd-note">Handing off to the Crew configuration modal owned by <code>collaboration.js</code>.</p>'
      : '<p class="pd-note">The Crew configuration modal is owned by <code>collaboration.js</code>. It is not loaded, so this shows the freeze this card would hand it.</p>';
    return dlgShell('crew','Build With Crew', r.title,
      '<section class="pd-sec"><h4>Preselected, and not editable here</h4>'+
        kv('plan','V'+r.version)+kv('hash',hs)+kv('steps',String(steps(b).length))+
        kv('route','Assistant-controlled Crew run')+kv('Orchestrator','not entered')+'</section>'+note,
      '<button type="button" class="soft-button" data-action="pd-dlg-close">Cancel</button>'+
      '<button type="button" class="primary-button" data-action="pd-crew-start" data-id="'+esc(r.plan_id)+'">Start</button>');
  }

  /* --- 7.3 Build At (§5.12) -------------------------------------------
     Binds the EXACT version/hash. scheduling.js owns the scheduling modal and
     the execution-window model; this dialog binds and hands off. A later
     revision invalidates the binding -- applyRevision() above does that, and
     Details renders the invalidation reason. */
  function dlgAt(ctx,r){
    var b=body(r), hs=hashOf(b);
    var sched = window.PM56_SCHED;
    var note = sched && sched.openBuildAt
      ? '<p class="pd-note">Scheduling, execution windows, timezone and DST behaviour are owned by <code>scheduling.js</code>; this binds the exact version and hands off to it.</p>'
      : '<p class="pd-note"><code>scheduling.js</code> owns execution windows, timezone and DST. It is not loaded, so this binds the version locally and shows what would be handed over.</p>';
    return dlgShell('at','Build At…', r.title,
      '<section class="pd-sec"><h4>Binding</h4>'+
        kv('plan','V'+r.version)+kv('hash',hs)+
        '<label class="pd-field"><span>Run at</span>'+
        '<input class="pd-input" type="text" data-pm-keep value="Tonight, 10:00 PM" data-pd-at="1"></label>'+
        '<p class="pd-note">The schedule binds this exact version and hash and revalidates before dispatch. A later revision invalidates it rather than silently running the newer Plan.</p>'+
      '</section>'+note,
      '<button type="button" class="soft-button" data-action="pd-dlg-close">Cancel</button>'+
      '<button type="button" class="primary-button" data-action="pd-at-bind" data-id="'+esc(r.plan_id)+'">Schedule</button>');
  }

  /* --- 7.4 Export (§5.8) ----------------------------------------------- */
  function dlgExport(ctx,r){
    return dlgShell('export','Export Plan', r.title+' · V'+r.version,
      '<section class="pd-sec"><h4>Plan document</h4>'+
        '<div class="pd-export-row" data-content-kind="plan_document">'+
          '<button type="button" class="soft-button" data-action="pd-export-do" data-id="'+esc(r.plan_id)+'" data-kind="plan_document" data-format="markdown">Markdown</button>'+
          '<button type="button" class="soft-button" data-action="pd-export-do" data-id="'+esc(r.plan_id)+'" data-kind="plan_document" data-format="pdf">PDF</button>'+
          '<button type="button" class="soft-button" data-action="pd-export-do" data-id="'+esc(r.plan_id)+'" data-kind="plan_document" data-format="bundle">Structured bundle</button>'+
        '</div>'+
        '<p class="pd-note">Markdown and the structured bundle are produced here and handed to the browser as a real download. PDF is produced through the browser print pipeline, which a <code>file://</code> page can open but cannot complete unattended — the receipt records exactly what happened rather than claiming a file was written.</p>'+
        '<p class="pd-note">The Plan document carries no live execution state, and exporting it does not change <code>'+esc(hashOf(body(r)))+'</code>. A video or interactive block exports through its frozen static fallback with its caption; an unavailable block exports as an explicit unavailable block rather than being dropped.</p>'+
      '</section>'+
      '<section class="pd-sec"><h4>Execution report</h4>'+
        (r.approved
          ? '<div class="pd-export-row" data-content-kind="execution_report">'+
              '<button type="button" class="soft-button" data-action="pd-export-do" data-id="'+esc(r.plan_id)+'" data-kind="execution_report" data-format="markdown">Markdown</button>'+
              '<button type="button" class="soft-button" data-action="pd-export-do" data-id="'+esc(r.plan_id)+'" data-kind="execution_report" data-format="bundle">Structured bundle</button>'+
            '</div>'+
            '<p class="pd-note">A separate versioned artifact — To-Dos, step states, deviations, evidence and a completion summary keyed to <code>'+esc(r.plan_id)+' V'+r.version+'</code> and its run. It states its own currentness and its source Plan hash, and it is not the approved Plan.</p>'
          : '<p class="pd-note">No execution report: this Plan has not been admitted for a build, so there is no run to report on.</p>')+
      '</section>',
      '<button type="button" class="soft-button" data-action="pd-dlg-close">Close</button>');
  }

  /* PPROG-016. Keyed to the exact Plan version, hash and run, and stating its
     own currentness. Nothing here claims to be the approved Plan. */
  function executionReport(r){
    var pr=progress(r), a=attention(r);
    var api=todoApi();
    var todos=(api&&api.get?(api.get(r.thread_id)||[]):[]).filter(function(t){ return t.plan_id===r.plan_id; });
    return {
      schema:'pm.assistant_plan.execution_report.v1', demo:true,
      assistant_plan_id:r.plan_id, plan_version:r.version, plan_hash:pr.plan_hash,
      plan_run_id:pr.plan_run_id, generated_at:pr.generated_at,
      currentness_hash:pr.currentness_hash, stale:pr.stale,
      is_approved_plan:false,
      step_states:pr.step_states,
      todo_refs:todos.map(function(t){
        return { todo_id:t.todo_id, status:t.status, revision:t.revision,
                 plan_step_ids:t.plan_step_ids, active_work_ids:t.active_work_ids||[],
                 outcome_refs:(t.transitions||[]).map(function(x){ return x.cause_ref; }) };
      }),
      deviations:list(r.deviations),
      attention:a,
      completion_summary:(function(){
        var ids=Object.keys(pr.step_states), n=0, done=0, blocked=0, i, s;
        for(i=0;i<ids.length;i++){ s=pr.step_states[ids[i]]; if(s.children) continue;
          n++; if(s.state==='completed'||s.state==='skipped') done++; if(s.state==='blocked') blocked++; }
        return { leaf_steps:n, resolved:done, blocked:blocked, plan_status:r.status };
      })()
    };
  }
  function reportMarkdown(rep){
    var out=['# Execution report — '+rep.assistant_plan_id+' V'+rep.plan_version,'',
      'This is **not** the approved Plan. Source Plan hash: `'+rep.plan_hash+'`.','',
      '- run: `'+(rep.plan_run_id||'none')+'`',
      '- currentness: `'+rep.currentness_hash+'`'+(rep.stale?' (STALE)':''),
      '- generated: '+rep.generated_at,'','## Step states',''];
    Object.keys(rep.step_states).forEach(function(k){
      var s=rep.step_states[k];
      out.push('- `'+k+'` — '+s.state+(s.children?' (aggregate of '+s.children.join(', ')+')':'')+
               (s.reason?' — '+s.reason:''));
    });
    out.push('','## To-Dos','');
    rep.todo_refs.forEach(function(t){ out.push('- `'+t.todo_id+'` '+t.status+' (rev '+t.revision+') → '+t.plan_step_ids.join(', ')); });
    out.push('','## Completion','', '```json', JSON.stringify(rep.completion_summary,null,2), '```','');
    return out.join('\n');
  }
  /* PDET-011..012: what an export actually did with each embed, so the receipt
     is checkable rather than a claim. */
  function embedExportNotes(r){
    return body(r).filter(function(b){ return b.t==='plan_embed'; }).map(function(b){
      return { block_id:b.block_id, artifact:b.artifact_id+'@'+embedVer(b),
               kind:b.renderer_kind, state:b.state,
               exported_as: b.state!=='ok' ? ('explicit unavailable block ('+b.state+')')
                          : (b.renderer_kind==='video'||b.renderer_kind==='interactive')
                            ? ('static fallback '+(b.static_fallback_ref||'(none)')+' with caption')
                            : 'rendered' };
    });
  }

  /* Real Blob download, and honest when the browser refuses -- the same
     contract app.js's exportContextJson uses. */
  function download(name, text, mime){
    try{
      var blob=new Blob([text],{type:mime||'text/plain;charset=utf-8'});
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');
      a.href=url; a.download=name; a.rel='noopener';
      document.body.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 4000);
      return 'handed to the browser as '+name;
    }catch(e){
      return 'the browser refused the download ('+(e&&e.message||'unknown')+') — no file was written';
    }
  }

  /* =====================================================================
     8. REGISTRATION
     ===================================================================== */
  /* Dialogs go through app.js's ONE dialog channel (ctx.openDialog / state.dialog),
     not a module-local flag. renderDialog() in app.js only reaches the `dialog`
     slot when state.dialog is set, so a module-local `open` variable rendered
     nothing at all: the Details and Export buttons clicked and no dialog ever
     appeared. bsd.js already used the correct channel; this now matches it. */
  var DLG = { info:'pd-info', crew:'pd-crew', at:'pd-at', export:'pd-export' };
  function openDlg(ctx, kind, id){ ctx.openDialog({ type:DLG[kind], id:id }); }

  var ACTIONS = {
    'pd-noop': function(){ /* Building…/Completed/Canceled are the same control, disabled. */ },

    'pd-view': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      r.view = btn.dataset.value==='markdown' ? 'markdown' : 'rich';
      ctx.renderApp();
    },

    'pd-expand': function(ctx,btn){
      ui.expanded[btn.dataset.id] = !ui.expanded[btn.dataset.id];
      ctx.renderApp();
    },

    'pd-build': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      if(!admitBuild(ctx,r)){ ctx.toast('Build is only available while the Plan is ready.'); return; }
      ctx.toast('Build admitted · V'+r.version+' frozen at '+r.approved.hash);
      ctx.renderApp();
    },

    'pd-cancel': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      stopRun(r);
      r.status='canceled'; r.current=false;
      r.cancelReason='Canceled from the Plan card at V'+r.version+'.';
      if(r.schedule){ r.schedule.invalid=true; r.schedule.invalidReason='The Plan was canceled; a manual cancel always overrides a scheduled build.'; }
      ctx.renderApp();
    },

    'pd-revise': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      RT.composer.destination = reviseTarget(r);
      ctx.toast('Composer targeted at '+r.title+' · V'+r.version);
      ctx.renderApp();
    },

    'pd-open-todos': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      ctx.state.activity.open=true; ctx.state.activity.domain='todo';
      ctx.renderApp();
    },

    'pd-info':       function(ctx,btn){ openDlg(ctx,'info',  btn.dataset.id); },
    'pd-build-crew': function(ctx,btn){ openDlg(ctx,'crew',  btn.dataset.id); },
    'pd-build-at':   function(ctx,btn){ openDlg(ctx,'at',    btn.dataset.id); },
    'pd-export':     function(ctx,btn){ openDlg(ctx,'export',btn.dataset.id); },
    'pd-dlg-close':  function(ctx){ ctx.closeDialog(); },

    'pd-crew-start': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      var b=body(r);
      r.crew = { version:r.version, hash:hashOf(b),
                 at:new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}) };
      admitBuild(ctx,r);
      ctx.closeDialog();
      /* Hand off to the real Crew modal when collaboration.js is present. */
      /* ONE Build-With-Crew implementation. collaboration.js owns the Crew
         modal and the frozen roster; this hands it the exact plan identity and
         version so the modal opens with them preselected. */
      if(window.PM56_COLLAB && window.PM56_COLLAB.buildWithCrew){
        try{ window.PM56_COLLAB.buildWithCrew(r.plan_id, r.version); }catch(e){}
      }
      ctx.renderApp();
    },

    'pd-at-bind': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      var fld=document.querySelector('[data-pd-at]');
      var when=(fld&&fld.value)||'Tonight, 10:00 PM';
      r.schedule = { version:r.version, hash:hashOf(body(r)), at:when, invalid:false, invalidReason:null };
      ctx.closeDialog();
      if(window.PM56_SCHED && window.PM56_SCHED.openBuildAt){
        try{ window.PM56_SCHED.openBuildAt(ctx, r.plan_id, r.version, r.schedule.hash, when); }catch(e){}
      }
      ctx.renderApp();
    },

    'pd-wizard': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      var b=body(r);
      r.wizard = { receipt:'PWH-'+r.plan_id+'-V'+r.version, version:r.version, hash:hashOf(b),
                   at:new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}), prdBypassed:true };
      /* A visible, durable, re-readable receipt in the transcript -- not a toast. */
      ctx.appendMessage && ctx.appendMessage({
        id:'pdw-'+r.plan_id+'-'+r.version, role:'system', type:'pd-wizard-receipt', planId:r.plan_id
      });
      ctx.renderApp();
    },

    'pd-export-do': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      var fmt=btn.dataset.format, kind=btn.dataset.kind||'plan_document';
      var result, at=new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
      var hashBefore=hashOf(body(r));
      if(kind==='execution_report'){
        /* PPROG-015..016: a SEPARATE versioned artifact. It never becomes the
           approved Plan and producing it does not touch plan_hash. */
        var rep=executionReport(r);
        result = fmt==='markdown'
          ? download(r.plan_id+'-V'+r.version+'-execution-report.md', reportMarkdown(rep), 'text/markdown;charset=utf-8')
          : download(r.plan_id+'-V'+r.version+'-execution-report.json', JSON.stringify(rep,null,2), 'application/json;charset=utf-8');
        r.exports.push({format:fmt, content_kind:kind, at:at, result:result,
                        hash_unchanged:hashOf(body(r))===hashBefore});
        openDlg(ctx,'info',r.plan_id); ctx.renderApp(); return;
      }
      if(fmt==='markdown'){
        result = download(r.plan_id+'-V'+r.version+'.md', toMarkdown(r), 'text/markdown;charset=utf-8');
      } else if(fmt==='bundle'){
        result = download(r.plan_id+'-V'+r.version+'.json', JSON.stringify({
          plan_id:r.plan_id, version:r.version, hash:hashOf(body(r)), strategy:r.strategy,
          backend:r.backend, blocks:body(r), planunits:r.planunits||null, demo:true
        }, null, 2), 'application/json;charset=utf-8');
      } else {
        /* Honest: a file:// page can open the print pipeline but cannot confirm
           a PDF was written. Say that instead of claiming a file exists. */
        var w=null;
        try{ w=window.open('', '_blank'); }catch(e){}
        if(w){
          w.document.write('<pre style="font:12px ui-monospace,monospace;white-space:pre-wrap;padding:24px">'+
            toMarkdown(r).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];})+'</pre>');
          w.document.close();
          try{ w.print(); }catch(e){}
          result='opened the browser print pipeline — whether a PDF was written is the browser’s decision, not this page’s';
        } else {
          result='the browser blocked the print window — no PDF was produced';
        }
      }
      r.exports.push({format:fmt, content_kind:kind, at:at, result:result,
                      hash_unchanged:hashOf(body(r))===hashBefore,
                      embeds:embedExportNotes(r)});
      /* Land on Details so the export receipt is immediately readable -- the
         result line is the durable record of what actually happened. */
      openDlg(ctx,'info',r.plan_id);
      ctx.renderApp();
    },


    /* --- Additive Correction v4: Build as Goal (PGOAL-001..014) ---------
       ONE command, one topology discriminator. `cmd.chat.plan.build_as_goal`
       does not exist; this is `cmd.chat.plan.build` with
       execution_topology=goal_driven, and the Goal, the PlanRun and the
       binding commit together or not at all. */
    'pd-build-goal': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      if(r.status!=='ready'){ ctx.toast('Not admissible','Build as Goal needs a Plan whose control reads Build.'); return; }
      var G=window.PM56_GOAL;
      if(!G || !G.createBound){ ctx.toast('Unavailable','The Goal owner is not loaded; nothing was created.'); return; }
      var hash=hashOf(body(r));
      var key=r.plan_id+'@V'+r.version+':'+hash;      /* PGOAL-012 idempotency */
      var runId='run-'+r.plan_id+'-V'+r.version;
      /* PGOAL-003: reserve the Goal FIRST and only then admit the run, so a
         refused Goal leaves no PlanRun behind and a failed build leaves no
         orphan Goal. */
      var res=G.createBound({
        plan_id:r.plan_id, thread:r.thread_id, title:r.title, version:r.version,
        plan_hash:hash, expected_hash:hash, plan_run_id:runId,
        idempotency_key:key,
        planunit_bundle_ref:(r.backend==='ledger_bound' ? (r.plan_id+'@V'+r.version+':planunits') : null),
        source_refs:['msg:'+r.thread_id+':plan-'+r.plan_id]
      });
      if(!res.ok){
        ctx.toast('Refused', res.error==='active_run_exists'
          ? 'A Goal is already bound to this Plan; exactly one binding may exist.'
          : 'The Plan version changed; refresh and try again. Nothing was created.');
        return;
      }
      if(res.replayed){
        ctx.toast('Already bound','Same idempotency key — returned the original Goal and PlanRun. Exactly one of each exists.');
        ctx.renderApp(); return;
      }
      r.topology='goal_driven';
      r.goalBinding=res.goal.binding;
      if(!admitBuild(ctx,r,{})){
        /* All-or-none: the Goal is rolled back rather than left active. */
        G.boundTransition(r.plan_id,'canceled','Rolled back: the PlanRun was not admitted.');
        r.topology=null; r.goalBinding=null;
        ctx.toast('Build not admitted','No Goal, no PlanRun, no binding. Nothing partial was left behind.');
        return;
      }
      ctx.addReceipt && ctx.addReceipt('goal-receipt','Build as Goal admitted · '+r.title,
        'One Goal, one PlanRun, one binding · V'+r.version+' · '+hash+' · reuses the existing To-Dos'+
        (r.backend==='ledger_bound'?' and scoped PlanUnits':'')+' · Orchestrator not entered');
      ctx.renderApp();
      ctx.toast('Build as Goal','Goal, PlanRun and binding committed together. The Goal is in Activity, not on a card.');
    },

    /* --- Additive Correction v4: attention actions (PFAIL-002..005) -----
       Only the actions the attention projection admits are rendered, and each
       one moves real state rather than showing a message. */
    'pd-attn': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      var a=attention(r); if(!a) return;
      var act=btn.dataset.value;
      if(a.allowed_action_ids.indexOf(act)<0){ ctx.toast('Not admitted','That action is not in the owner’s allowed set for this condition.'); return; }
      if(act==='details'){ openDlg(ctx,'info',r.plan_id); ctx.renderApp(); return; }
      if(act==='cancel'){ ACTIONS['pd-cancel'](ctx,btn); return; }
      if(act==='revise'){ r.attention=null; r.status='ready'; r.current=true; stopRun(r);
        ctx.toast('Stopped for revision','The run stopped at a safe boundary. Approved bytes never mutated under in-flight work.');
        ctx.renderApp(); return; }
      if(act==='retry'){
        /* PFAIL-003: a NEW attempt under the SAME run. No duplicate PlanRun,
           and completed side effects are not replayed. */
        r.attempts=(r.attempts||1)+1;
        r.attention={ kind:'paused', reason:'Retry attempt '+r.attempts+' admitted under the same PlanRun; completed work was not replayed.',
                      actions:['resume','cancel','details'], attempt:r.attempts };
        ctx.renderApp(); return;
      }
      if(act==='resume'||act==='recover'||act==='reconnect'){
        r.attention=null; resumeRun(ctx,r); ctx.renderApp();
        ctx.toast('Resumed','Continued from durable state; Plan and To-Do identity preserved.');
        return;
      }
    },

    /* PDET-012: an unavailable embed is inspectable, not silent. */
    'pd-embed-info': function(ctx,btn){
      var id=btn.dataset.id, found=null, rid;
      for(rid in P().records){
        var bs=body(P().records[rid]);
        for(var i=0;i<bs.length;i++){ if(bs[i].t==='plan_embed' && bs[i].block_id===id){ found={b:bs[i],r:P().records[rid]}; } }
      }
      if(!found) return;
      ctx.toast('Embed '+found.b.state,
        found.b.artifact_id+'@'+embedVer(found.b)+' — '+(EMBED_UNAVAILABLE[found.b.state]||'available')+
        ' The approved Plan still names this exact version; no other version was substituted.');
    },

    /* PPROG-012/013: the two projection conditions the correction requires,
       driven rather than described. `stale` marks the cached projection's
       currentness hash out of date; `restart` throws the cache away and
       rebuilds from the durable To-Do records. */
    'pd-proj-stale': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      r._projStale=true; r._projSource='cache';
      ctx.renderApp();
      ctx.toast('Projection marked stale','The card shows “Updating progress…” and mutation controls stay disabled rather than showing old data as current.');
    },
    'pd-proj-restart': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      var before=progress(r);
      r._projStale=false; r._projSource='durable'; r._projRev=(r._projRev||1)+1;
      var after=progress(r);
      ctx.renderApp();
      ctx.toast('Rebuilt after restart',
        'Rebuilt from durable To-Dos and mappings, not a view cache. Currentness '+after.currentness_hash+
        ' — '+(after.currentness_hash===before.currentness_hash?'identical to pre-restart truth.':'inputs changed while stale.'));
    },


    /* --- Additive Correction v4: question budget, driven (QMAX-005..015) */
    'pd-q-ask': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      var wf='plan:'+r.plan_id;
      questionBudget(wf, strategyKey(r), r.grillMe);
      r._qSeq=(r._qSeq||0)+1;
      var res=admitQuestion(wf,{ question_item_id:'q-'+r.plan_id+'-'+r._qSeq });
      openDlg(ctx,'info',r.plan_id); ctx.renderApp();
      ctx.toast(res.ok?'Question admitted':'question_budget_exhausted',
        res.ok ? ('Charged once at first presentation. '+res.projection.questions_remaining+' of '+res.projection.effective_limit+' remaining.')
               : 'Typed result, not a failure: no extra QuestionItem was persisted, the planning run continues to synthesis, and Build stays enabled unless an unresolved item is an explicit build blocker.');
    },
    'pd-q-again': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      var wf='plan:'+r.plan_id;
      questionBudget(wf, strategyKey(r), r.grillMe);
      var id='q-'+r.plan_id+'-'+(r._qSeq||1);
      var before=questionBudget(wf).questions_asked;
      var res=admitQuestion(wf,{ question_item_id:id });
      var after=questionBudget(wf).questions_asked;
      openDlg(ctx,'info',r.plan_id); ctx.renderApp();
      ctx.toast('Re-presented '+id, 'asked stayed at '+after+(before===after?' — the same identity is never charged twice.':' — DEFECT: it moved.'));
    },
    'pd-q-reuse': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      var wf='plan:'+r.plan_id; questionBudget(wf, strategyKey(r), r.grillMe);
      r._qSeq=(r._qSeq||0)+1;
      var res=admitQuestion(wf,{ question_item_id:'q-'+r.plan_id+'-'+r._qSeq, resolved_from_prior_answer:true });
      openDlg(ctx,'info',r.plan_id); ctx.renderApp();
      ctx.toast('Resolved from a prior answer','reused_answer_count is now '+res.projection.reused_answer_count+'; the allowance was not consumed.');
    },
    'pd-q-research': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      var wf='plan:'+r.plan_id; questionBudget(wf, strategyKey(r), r.grillMe);
      r._qSeq=(r._qSeq||0)+1;
      var res=admitQuestion(wf,{ question_item_id:'q-'+r.plan_id+'-'+r._qSeq, resolvable_by_research:true });
      openDlg(ctx,'info',r.plan_id); ctx.renderApp();
      ctx.toast('Assigned to research','research_resolved_count is now '+res.projection.research_resolved_count+'; user-question allowance is for decisions, not for facts an agent can find.');
    },
    'pd-q-grill': function(ctx,btn){
      var r=rec(btn.dataset.id); if(!r) return;
      var wf='plan:'+r.plan_id; questionBudget(wf, strategyKey(r), r.grillMe);
      var before=questionBudget(wf);
      r.grillMe=!before.grill_me_enabled;
      var after=setGrill(wf, r.grillMe);
      openDlg(ctx,'info',r.plan_id); ctx.renderApp();
      ctx.toast(r.grillMe?'Grill Me on':'Grill Me off',
        'Effective limit '+before.effective_limit+' → '+after.effective_limit+
        '; asked stayed at '+after.questions_asked+' and no answer was deleted.');
    },

    /* The one-current-Plan invariant, exercised. This is what an explicit
       "new Plan" request does while an unfinished Plan exists (§5.7). */
    'pd-new-plan': function(ctx){
      var t=ctx.state.selectedThread;
      var old=cancelForNewPlan(t);
      ctx.toast(old ? 'Canceled '+old.title+' — one unfinished Plan per thread.' : 'No unfinished Plan to cancel.');
      ctx.renderApp();
    }
  };

  Object.keys(ACTIONS).forEach(function(name){
    EXT.action(name, function(ctx,btn,ev){ ACTIONS[name](ctx,btn,ev); return true; });
  });

  /* --- transcript slot -------------------------------------------------
     A DECLINE-able replace slot: '' for every type this module does not own,
     so app.js's built-in renderPlanCard and the `query`/`plan-deep` fixtures
     that use `plan-card` render exactly as they did before. */
  EXT.slot('transcriptMessage', function(ctx){
    var m=ctx.m; if(!m) return '';
    if(m.type==='plan-card-v2'){
      var r=rec(m.planId); if(!r) return '';
      return renderCard(r);
    }
    if(m.type==='pd-wizard-receipt'){
      var w=rec(m.planId); if(!w || !w.wizard) return '';
      return '<article class="event-card pd-receipt" data-k="pdw-'+esc(w.plan_id)+'-'+w.wizard.version+'">'+
        '<span class="event-icon">'+ICON.artifact+'</span>'+
        '<div class="event-copy"><strong>Sent to Planning Wizard</strong>'+
        '<p>'+esc(w.title)+' · V'+w.wizard.version+' · '+esc(w.wizard.hash)+'</p>'+
        '<p class="pd-attr">Receipt '+esc(w.wizard.receipt)+' · PRD Builder bypassed · Planning Wizard now owns the PlanningRun, Plan Pack, approval, Plan Compile and Orchestrator navigation.</p></div>'+
        '<div class="plan-actions"><button type="button" class="soft-button" data-action="pd-info" data-id="'+esc(w.plan_id)+'">Details</button></div></article>';
    }
    return '';
  });

  /* --- dialog slot ----------------------------------------------------- */
  EXT.slot('dialog', function(ctx){
    var d = ctx.state.dialog; if(!d || !d.type) return '';
    var r = rec(d.id); if(!r) return '';
    if(d.type===DLG.info)   return dlgInfo(ctx,r);
    if(d.type===DLG.crew)   return dlgCrew(ctx,r);
    if(d.type===DLG.at)     return dlgAt(ctx,r);
    if(d.type===DLG.export) return dlgExport(ctx,r);
    return '';
  });

  /* --- composer: Revise is a destination, and submitting under it creates a
     new VERSION rather than editing the current one. composer-state.js owns
     the buffer and the ribbon; this only claims the commit for its own
     destination kind and declines everything else. */
  if(RT.composer && RT.composer.commitHooks){
    RT.composer.commitHooks.push(function(ctx,thread,message){
      var d=RT.composer.destination;
      if(!d || d.kind!=='plan-revision') return;
      var r=rec(d.refId); if(!r) return;
      applyRevision(ctx, r, String((message&&message.text)||'').trim() || 'user feedback');
      RT.composer.destination = null;
    });
  }
  if(RT.composer && RT.composer.destinationProviders){
    RT.composer.destinationProviders.push(function(ctx){
      var out=[], recs=P().records, k;
      for(k in recs){
        var r=recs[k];
        if(r.thread_id===ctx.state.selectedThread && r.status!=='completed' && r.status!=='canceled'){
          out.push(reviseTarget(r));
        }
      }
      return out;
    });
  }

  EXT.chainAction('reset-all', function(){
    Object.keys(runTimers).forEach(function(k){ clearInterval(runTimers[k]); delete runTimers[k]; });
    P().records = hydrate(JSON.parse(JSON.stringify(PLANS0)));
    ui.expanded = {};
    return false;   /* fall through to app.js's own reset */
  });

  /* The editor pane and the transcript card must show ONE truth.
     app.js's renderPlanDocument was a hard-coded HTML string that duplicated
     the plan body and shipped its own Revise/Build buttons plus a literal
     "Revision 3" line, so the pane said Version 4 / Revision 3 while the card
     said V5 -- two surfaces disagreeing about the same plan. app.js now asks
     for this instead, and falls back to its own string if plans.js is dropped
     from the build. Same renderers, same record, same single Build control. */
  var ARTIFACT_TO_PLAN = { 'plan-query':'ap-index' };
  function editorBody(artifactId){
    var id = ARTIFACT_TO_PLAN[artifactId];
    var r = id && rec(id);
    if(!r) return '';
    return '<div class="plan-doc plan-doc-editor" data-plan-id="'+esc(r.plan_id)+'">'+
      cardHeader(r)+
      '<div class="pd-body">'+(r.view==='markdown'?renderMarkdown(r):renderRich(r))+'</div>'+
      cardFooter(r)+
    '</div>';
  }

  window.PM56_PLANS = {
    get:rec, all:function(){ return P().records; },
    editorBody:editorBody,
    /* Which Plan an artifact id maps to, so app.js's artifact header can read
       the owner's version and Build label instead of the legacy record. */
    editorPlanId:function(artifactId){ return ARTIFACT_TO_PLAN[artifactId] || null; },
    current:currentPlan,
    /* Accepts a record (original shape) or a plan id, so a harness that
       reasons in ids does not have to reach into P().records first. */
    markdown:function(x){ var r=(typeof x==='string')?rec(x):x; return r?toMarkdown(r):null; },
    hash:function(id){ var r=rec(id); return r?hashOf(body(r)):null; },
    projectionParity:function(id){ var r=rec(id); return r?parity(r):null; },
    eligible:function(id){ var r=rec(id); return r?eligible(r):null; },
    buildLabel:function(id){ var r=rec(id); return r?BUILD_LABEL[r.status]:null; },
    cancelForNewPlan:cancelForNewPlan,
    restore:function(){
      /* Stop every live run timer BEFORE swapping the records, or the old
         closure keeps ticking against a record nothing can see any more —
         which is how a "restored" surface silently advances the To-Do list of
         a Plan the caller believes it just reset. */
      for(var k in runTimers){ if(runTimers[k]){ clearInterval(runTimers[k]); runTimers[k]=null; } }
      P().records = hydrate(JSON.parse(JSON.stringify(PLANS0)));
      /* The question counters are durable run records, not view state: leaving
         them behind made a restored Plan report questions it had never asked. */
      if(RT.questionBudget){ RT.questionBudget.runs={}; RT.questionBudget.seq=0; }
    },
    fixture:function(){ return JSON.parse(JSON.stringify(PLANS0)); },
    dialogType:function(kind){ return DLG[kind]; },
    /* Additive Correction v4. */
    progress:function(id){ var r=rec(id); return r?progress(r):null; },
    attention:function(id){ var r=rec(id); return r?attention(r):null; },
    executionReport:function(id){ var r=rec(id); return r?executionReport(r):null; },
    questionBudget:questionBudget,
    admitQuestion:admitQuestion,
    setGrillMe:setGrill,
    questionBases:function(){ return JSON.parse(JSON.stringify(QBASE)); },
    grillExtension:function(){ return QGRILL; },
    embeds:function(id){ var r=rec(id); return r?body(r).filter(function(b){return b.t==='plan_embed';}):null; },
    openDetails:function(ctx,id){ openDlg(ctx,'info',id); ctx.renderApp(); },
    /* PGOAL-007/008: goals.js drives these; the Plan owner applies them. */
    boundPause:function(planId){
      var r=rec(planId); if(!r||r.status!=='building') return null;
      stopRun(r);
      r.attention={ kind:'paused', reason:'Paused through the bound Goal at a shared safe boundary. The Build control stays Building….',
                    actions:['resume','cancel','details'] };
      return { paused:true, label:BUILD_LABEL[r.status] };
    },
    boundResume:function(planId){
      var r=rec(planId); if(!r||r.status!=='building') return null;
      r.attention=null;
      var c=EXT.ctx&&EXT.ctx(); if(c) resumeRun(c,r);
      return { resumed:true, label:BUILD_LABEL[r.status] };
    },
    boundCancel:function(planId, epoch){
      var r=rec(planId); if(!r) return null;
      stopRun(r);
      r.status='canceled'; r.current=false; r.attention=null;
      r.cancelReason='Cancelled through the bound Goal. The PlanRun and every attempt are fenced at continuation epoch '+epoch+'; no window or Usage reset can resume it.';
      /* PSCHED-010 / SMSG-016: association-scoped invalidation. Only THIS
         execution's schedules and quota consent are invalidated. */
      var S=window.PM56_SCHED, fenced={ schedules:0, untouched:0 };
      if(S && S.invalidateForExecution) fenced=S.invalidateForExecution({ plan_id:planId, epoch:epoch });
      else if(r.schedule && !r.schedule.invalid){
        r.schedule.invalid=true; r.schedule.invalidReason='Bound Goal cancelled.'; fenced.schedules=1;
      }
      return fenced;
    },
    /* Retired shapes, answered truthfully rather than thrown at, for any older
       harness still asking: the Assistant Plan has no WorkNodes and never
       enters Orchestrator. */
    worknodes:function(){ return []; },
    orchestrator:function(){ return { entered:false, retired:true }; }
  };
})();
